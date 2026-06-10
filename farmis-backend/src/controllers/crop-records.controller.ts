import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { parsePagination } from '../lib/pagination';
import { AppError } from '../middleware/error';
import { prisma } from '../services/prisma';

const paginationDefaults = {
  defaultPage: 1,
  defaultPageSize: 10,
  maxPageSize: 100,
};

function pad4(n: number) {
  return String(n).padStart(4, '0');
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function endOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

async function nextCropCode() {
  const count = await prisma.cropRecord.count();
  return `CRP-${pad4(count + 1)}`;
}

const cropRecordListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  barangay: z.string().optional(),
  cropType: z.string().optional(),
  status: z.enum(['growing', 'harvested']).optional(),
});

function mapCropRecord(row: {
  id: string;
  cropCode: string;
  cropName: string;
  cropType: string;
  farmAreaHa: number;
  plantingDate: Date;
  expectedHarvestDate: Date;
  status: string;
  farmerId: string;
  farmer: { name: string; barangay: string };
}) {
  return {
    id: row.id,
    cropCode: row.cropCode,
    farmerId: row.farmerId,
    farmerName: row.farmer.name,
    barangay: row.farmer.barangay,
    cropName: row.cropName,
    cropType: row.cropType,
    farmAreaHa: row.farmAreaHa,
    plantingDate: row.plantingDate.toISOString(),
    expectedHarvestDate: row.expectedHarvestDate.toISOString(),
    status: row.status,
  };
}

export async function listCropRecords(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = cropRecordListQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      ...paginationDefaults,
    });

    const search = q.query?.trim();
    const barangay =
      q.barangay && q.barangay !== 'all' ? q.barangay.trim() : undefined;
    const cropType =
      q.cropType && q.cropType !== 'all' ? q.cropType.trim() : undefined;

    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(cropType ? { cropType } : {}),
      ...(barangay ? { farmer: { barangay } } : {}),
      ...(search
        ? {
            OR: [
              { cropName: { contains: search, mode: 'insensitive' as const } },
              { cropCode: { contains: search, mode: 'insensitive' as const } },
              { cropType: { contains: search, mode: 'insensitive' as const } },
              {
                farmer: {
                  name: { contains: search, mode: 'insensitive' as const },
                },
              },
              {
                farmer: {
                  barangay: { contains: search, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const monthStart = startOfCurrentMonth();
    const monthEnd = endOfCurrentMonth();

    const [filteredTotal, rows, globalTotal, active, harvested, thisMonth] =
      await Promise.all([
        prisma.cropRecord.count({ where }),
        prisma.cropRecord.findMany({
          where,
          skip,
          take,
          orderBy: { plantingDate: 'desc' },
          include: {
            farmer: {
              select: { name: true, barangay: true },
            },
          },
        }),
        prisma.cropRecord.count(),
        prisma.cropRecord.count({ where: { status: 'growing' } }),
        prisma.cropRecord.count({ where: { status: 'harvested' } }),
        prisma.cropRecord.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

    return res.json({
      data: rows.map(mapCropRecord),
      page,
      pageSize,
      total: filteredTotal,
      stats: {
        total: globalTotal,
        active,
        harvested,
        thisMonth,
      },
    });
  } catch (err) {
    return next(err);
  }
}

const createCropRecordSchema = z.object({
  farmerId: z.string().min(1),
  cropName: z.string().min(1),
  cropType: z.string().min(1),
  farmAreaHa: z.coerce.number().min(0),
  plantingDate: z.string().min(1),
  expectedHarvestDate: z.string().min(1),
  status: z.enum(['growing', 'harvested']).optional(),
});

export async function createCropRecord(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createCropRecordSchema.parse(req.body);

    const plantingDate = new Date(body.plantingDate);
    const expectedHarvestDate = new Date(body.expectedHarvestDate);

    if (
      Number.isNaN(plantingDate.getTime()) ||
      Number.isNaN(expectedHarvestDate.getTime())
    ) {
      throw new AppError(400, 'Invalid planting or harvest date');
    }

    const farmer = await prisma.farmer.findUnique({
      where: { id: body.farmerId },
      select: { id: true, name: true, barangay: true },
    });

    if (!farmer) {
      throw new AppError(404, 'Farmer not found');
    }

    const cropCode = await nextCropCode();

    const created = await prisma.cropRecord.create({
      data: {
        cropCode,
        farmerId: body.farmerId,
        cropName: body.cropName.trim(),
        cropType: body.cropType.trim(),
        farmAreaHa: body.farmAreaHa,
        plantingDate,
        expectedHarvestDate,
        status: body.status ?? 'growing',
      },
      include: {
        farmer: {
          select: { name: true, barangay: true },
        },
      },
    });

    res.status(201);
    return res.json(mapCropRecord(created));
  } catch (err) {
    return next(err);
  }
}

const createMobileCropRecordSchema = z.object({
  cropName: z.string().min(1),
  cropType: z.string().min(1),
  farmAreaHa: z.coerce.number().min(0),
  plantingDate: z.string().min(1),
  expectedHarvestDate: z.string().min(1),
});

export async function createMobileCropRecord(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const body = createMobileCropRecordSchema.parse(req.body);

    const plantingDate = new Date(body.plantingDate);
    const expectedHarvestDate = new Date(body.expectedHarvestDate);

    if (
      Number.isNaN(plantingDate.getTime()) ||
      Number.isNaN(expectedHarvestDate.getTime())
    ) {
      throw new AppError(400, 'Invalid planting or harvest date');
    }

    if (expectedHarvestDate < plantingDate) {
      throw new AppError(400, 'Expected harvest date must be after planting date');
    }

    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      select: { id: true, name: true, barangay: true },
    });

    if (!farmer) {
      throw new AppError(404, 'Farmer not found');
    }

    const cropCode = await nextCropCode();

    const created = await prisma.cropRecord.create({
      data: {
        cropCode,
        farmerId,
        cropName: body.cropName.trim(),
        cropType: body.cropType.trim(),
        farmAreaHa: body.farmAreaHa,
        plantingDate,
        expectedHarvestDate,
        status: 'growing',
      },
      include: {
        farmer: {
          select: { name: true, barangay: true },
        },
      },
    });

    res.status(201);
    return res.json(mapCropRecord(created));
  } catch (err) {
    return next(err);
  }
}

export async function harvestMobileCropRecord(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);

    const existing = await prisma.cropRecord.findFirst({
      where: { id, farmerId },
      include: {
        farmer: {
          select: { name: true, barangay: true },
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'Crop record not found');
    }

    if (existing.status === 'harvested') {
      throw new AppError(400, 'Crop record is already harvested');
    }

    const updated = await prisma.cropRecord.update({
      where: { id: existing.id },
      data: { status: 'harvested' },
      include: {
        farmer: {
          select: { name: true, barangay: true },
        },
      },
    });

    return res.json(mapCropRecord(updated));
  } catch (err) {
    return next(err);
  }
}

export async function listMobileCropRecords(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const q = z
      .object({
        page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).max(50).optional(),
        status: z.enum(['growing', 'harvested']).optional(),
      })
      .parse(req.query);

    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      defaultPage: 1,
      defaultPageSize: 20,
      maxPageSize: 50,
    });

    const where = {
      farmerId,
      ...(q.status ? { status: q.status } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.cropRecord.count({ where }),
      prisma.cropRecord.findMany({
        where,
        skip,
        take,
        orderBy: { plantingDate: 'desc' },
        include: {
          farmer: {
            select: { name: true, barangay: true },
          },
        },
      }),
    ]);

    return res.json({
      data: rows.map(mapCropRecord),
      page,
      pageSize,
      total,
    });
  } catch (err) {
    return next(err);
  }
}
