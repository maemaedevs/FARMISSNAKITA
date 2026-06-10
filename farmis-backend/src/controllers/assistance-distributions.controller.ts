import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { parsePagination } from '../lib/pagination';
import { AppError } from '../middleware/error';
import { prisma } from '../services/prisma';
import { DEV_DISTRIBUTIONS } from '../services/dev-data';

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

function startOfCurrentYear() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

function isPrismaDbUnavailable(err: unknown) {
  const code = (err as { code?: string })?.code;
  return (
    code === 'P1000' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1012' ||
    code === 'P1017' ||
    code === 'P2021'
  );
}

async function nextDistributionCode() {
  const count = await prisma.assistanceDistribution.count();
  return `DIST-${pad4(count + 1)}`;
}

type DistributionRow = {
  id: string;
  distributionCode: string;
  assistanceType: string;
  quantityLabel: string;
  amountPeso: number;
  distributedAt: Date;
  status: string;
  distributedBy: string;
  program: { name: string; icon: string };
  farmer: { name: string; contactNumber: string; barangay: string };
};

function mapDistribution(row: DistributionRow) {
  return {
    id: row.id,
    distributionCode: row.distributionCode,
    programName: row.program.name,
    programIcon: row.program.icon,
    farmerName: row.farmer.name,
    contactNumber: row.farmer.contactNumber,
    barangay: row.farmer.barangay,
    assistanceType: row.assistanceType,
    quantityLabel: row.quantityLabel,
    amountPeso: row.amountPeso,
    distributedAt: row.distributedAt.toISOString(),
    status: row.status,
    distributedBy: row.distributedBy,
  };
}

const distributionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  programId: z.string().optional(),
  barangay: z.string().optional(),
  status: z.enum(['completed', 'pending', 'cancelled']).optional(),
});

export async function listDistributions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = distributionListQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      ...paginationDefaults,
    });

    const search = q.query?.trim();
    const barangay =
      q.barangay && q.barangay !== 'all' ? q.barangay.trim() : undefined;
    const programId =
      q.programId && q.programId !== 'all' ? q.programId.trim() : undefined;

    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(programId ? { programId } : {}),
      ...(barangay ? { farmer: { barangay } } : {}),
      ...(search
        ? {
            OR: [
              {
                distributionCode: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                program: {
                  name: { contains: search, mode: 'insensitive' as const },
                },
              },
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
              {
                assistanceType: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const monthStart = startOfCurrentMonth();
    const monthEnd = endOfCurrentMonth();
    const yearStart = startOfCurrentYear();

    try {
      const [
        filteredTotal,
        rows,
        globalTotal,
        uniqueFarmers,
        amountAgg,
        thisMonth,
        completedThisYear,
      ] = await Promise.all([
        prisma.assistanceDistribution.count({ where }),
        prisma.assistanceDistribution.findMany({
          where,
          skip,
          take,
          orderBy: { distributedAt: 'desc' },
          select: {
            id: true,
            distributionCode: true,
            assistanceType: true,
            quantityLabel: true,
            amountPeso: true,
            distributedAt: true,
            status: true,
            distributedBy: true,
            program: { select: { name: true, icon: true } },
            farmer: {
              select: { name: true, contactNumber: true, barangay: true },
            },
          },
        }),
        prisma.assistanceDistribution.count(),
        prisma.assistanceDistribution.findMany({
          distinct: ['farmerId'],
          select: { farmerId: true },
        }),
        prisma.assistanceDistribution.aggregate({
          _sum: { amountPeso: true },
        }),
        prisma.assistanceDistribution.count({
          where: {
            distributedAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.assistanceDistribution.count({
          where: {
            status: 'completed',
            distributedAt: { gte: yearStart },
          },
        }),
      ]);

      return res.json({
        data: rows.map(mapDistribution),
        page,
        pageSize,
        total: filteredTotal,
        stats: {
          total: globalTotal,
          beneficiaries: uniqueFarmers.length,
          totalAmount: amountAgg._sum.amountPeso ?? 0,
          thisMonth,
          completedThisYear,
        },
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const searchLower = search?.toLowerCase() ?? '';
      const filtered = DEV_DISTRIBUTIONS.filter((row) => {
        if (q.status && row.status !== q.status) return false;
        if (barangay && row.barangay !== barangay) return false;
        if (programId && row.programId !== programId) return false;
        if (searchLower) {
          return (
            row.distributionCode.toLowerCase().includes(searchLower) ||
            row.programName.toLowerCase().includes(searchLower) ||
            row.farmerName.toLowerCase().includes(searchLower) ||
            row.barangay.toLowerCase().includes(searchLower) ||
            row.assistanceType.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      const now = new Date();
      const monthStartDev = startOfCurrentMonth();
      const monthEndDev = endOfCurrentMonth();
      const yearStartDev = startOfCurrentYear();

      const uniqueFarmerIds = new Set(DEV_DISTRIBUTIONS.map((d) => d.farmerId));
      const totalAmount = DEV_DISTRIBUTIONS.reduce(
        (sum, d) => sum + d.amountPeso,
        0,
      );
      const thisMonthCount = DEV_DISTRIBUTIONS.filter((d) => {
        const date = new Date(d.distributedAt);
        return date >= monthStartDev && date <= monthEndDev;
      }).length;
      const completedYear = DEV_DISTRIBUTIONS.filter((d) => {
        const date = new Date(d.distributedAt);
        return d.status === 'completed' && date >= yearStartDev;
      }).length;

      const pageRows = filtered.slice(skip, skip + take).map((row) => ({
        id: row.id,
        distributionCode: row.distributionCode,
        assistanceType: row.assistanceType,
        quantityLabel: row.quantityLabel,
        amountPeso: row.amountPeso,
        distributedAt: new Date(row.distributedAt),
        status: row.status,
        distributedBy: row.distributedBy,
        program: { name: row.programName, icon: row.programIcon },
        farmer: {
          name: row.farmerName,
          contactNumber: row.contactNumber,
          barangay: row.barangay,
        },
      }));

      return res.json({
        data: pageRows.map(mapDistribution),
        page,
        pageSize,
        total: filtered.length,
        stats: {
          total: DEV_DISTRIBUTIONS.length,
          beneficiaries: uniqueFarmerIds.size,
          totalAmount,
          thisMonth: thisMonthCount,
          completedThisYear: completedYear,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
}

const createDistributionSchema = z.object({
  programId: z.string().min(1),
  farmerId: z.string().min(1),
  assistanceType: z.string().min(1),
  quantityLabel: z.string().min(1),
  amountPeso: z.coerce.number().min(0),
  distributedAt: z.string().min(1),
  status: z.enum(['completed', 'pending', 'cancelled']).default('pending'),
  distributedBy: z.string().min(1),
});

export async function createDistribution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createDistributionSchema.parse(req.body);

    const program = await prisma.assistanceProgram.findUnique({
      where: { id: body.programId },
    });

    if (!program) throw new AppError(404, 'Program not found');

    const distributedAt = new Date(body.distributedAt);
    if (Number.isNaN(distributedAt.getTime())) {
      throw new AppError(400, 'Invalid distribution date');
    }

    const sharedData = {
      programId: body.programId,
      assistanceType: body.assistanceType.trim(),
      quantityLabel: body.quantityLabel.trim(),
      amountPeso: body.amountPeso,
      distributedAt,
      status: body.status,
      distributedBy: body.distributedBy.trim(),
    };

    if (body.farmerId === 'all') {
      const farmers = await prisma.farmer.findMany({
        where: { status: 'active' },
        select: { id: true },
        orderBy: { name: 'asc' },
      });

      if (farmers.length === 0) {
        throw new AppError(400, 'No active farmers found to distribute to');
      }

      const startCount = await prisma.assistanceDistribution.count();
      const records = farmers.map((farmer, index) => ({
        distributionCode: `DIST-${pad4(startCount + index + 1)}`,
        farmerId: farmer.id,
        ...sharedData,
      }));

      await prisma.assistanceDistribution.createMany({ data: records });

      return res.status(201).json({
        bulk: true,
        created: records.length,
      });
    }

    const farmer = await prisma.farmer.findUnique({
      where: { id: body.farmerId },
    });

    if (!farmer) throw new AppError(404, 'Farmer not found');

    const distributionCode = await nextDistributionCode();

    const created = await prisma.assistanceDistribution.create({
      data: {
        distributionCode,
        farmerId: body.farmerId,
        ...sharedData,
      },
      select: {
        id: true,
        distributionCode: true,
        assistanceType: true,
        quantityLabel: true,
        amountPeso: true,
        distributedAt: true,
        status: true,
        distributedBy: true,
        program: { select: { name: true, icon: true } },
        farmer: {
          select: { name: true, contactNumber: true, barangay: true },
        },
      },
    });

    return res.status(201).json(mapDistribution(created));
  } catch (err) {
    return next(err);
  }
}

const distributionIdSchema = z.object({ id: z.string().min(1) });

const updateDistributionSchema = z.object({
  status: z.enum(['completed', 'pending', 'cancelled']),
});

export async function updateDistribution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = distributionIdSchema.parse(req.params);
    const body = updateDistributionSchema.parse(req.body);

    const existing = await prisma.assistanceDistribution.findUnique({
      where: { id },
    });

    if (!existing) throw new AppError(404, 'Distribution not found');

    const updated = await prisma.assistanceDistribution.update({
      where: { id },
      data: { status: body.status },
      select: {
        id: true,
        distributionCode: true,
        assistanceType: true,
        quantityLabel: true,
        amountPeso: true,
        distributedAt: true,
        status: true,
        distributedBy: true,
        program: { select: { name: true, icon: true } },
        farmer: {
          select: { name: true, contactNumber: true, barangay: true },
        },
      },
    });

    return res.json(mapDistribution(updated));
  } catch (err) {
    return next(err);
  }
}

export async function listMobileDistributions(
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
        status: z.enum(['completed', 'pending', 'cancelled']).optional(),
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

    try {
      const [total, rows] = await Promise.all([
        prisma.assistanceDistribution.count({ where }),
        prisma.assistanceDistribution.findMany({
          where,
          skip,
          take,
          orderBy: { distributedAt: 'desc' },
          select: {
            id: true,
            distributionCode: true,
            assistanceType: true,
            quantityLabel: true,
            amountPeso: true,
            distributedAt: true,
            status: true,
            distributedBy: true,
            program: {
              select: {
                id: true,
                name: true,
                tagline: true,
                programType: true,
                icon: true,
              },
            },
          },
        }),
      ]);

      return res.json({
        data: rows.map((row) => ({
          id: row.id,
          distributionCode: row.distributionCode,
          programId: row.program.id,
          programName: row.program.name,
          programTagline: row.program.tagline,
          programType: row.program.programType,
          programIcon: row.program.icon,
          assistanceType: row.assistanceType,
          quantityLabel: row.quantityLabel,
          amountPeso: row.amountPeso,
          distributedAt: row.distributedAt.toISOString(),
          status: row.status,
          distributedBy: row.distributedBy,
        })),
        page,
        pageSize,
        total,
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const filtered = DEV_DISTRIBUTIONS.filter((d) => d.farmerId === farmerId);
      const pageRows = filtered.slice(skip, skip + take);

      return res.json({
        data: pageRows.map((row) => ({
          id: row.id,
          distributionCode: row.distributionCode,
          programId: row.programId,
          programName: row.programName,
          programTagline: row.programTagline ?? '',
          programType: row.programType ?? '',
          programIcon: row.programIcon,
          assistanceType: row.assistanceType,
          quantityLabel: row.quantityLabel,
          amountPeso: row.amountPeso,
          distributedAt: row.distributedAt,
          status: row.status,
          distributedBy: row.distributedBy,
        })),
        page,
        pageSize,
        total: filtered.length,
      });
    }
  } catch (err) {
    return next(err);
  }
}
