import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { parsePagination } from '../lib/pagination';
import { AppError } from '../middleware/error';
import {
  situationDocumentPublicPath,
  situationReportPublicPath,
} from '../middleware/upload';
import { prisma } from '../services/prisma';
import { DEV_SITUATION_REPORTS } from '../services/dev-data';

const INCIDENT_TYPES = [
  'storm_typhoon',
  'landslide',
  'flood',
  'other',
] as const;

const SITUATION_STATUSES = ['pending', 'reviewed', 'resolved'] as const;

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

function pad4(n: number) {
  return String(n).padStart(4, '0');
}

async function nextReportCode() {
  const count = await prisma.situationReport.count();
  return `RPT-${pad4(count + 1)}`;
}

type SituationReportRow = {
  id: string;
  reportCode: string;
  status: string;
  createdAt: Date;
  fullName: string;
  contactNumber: string;
  address: string;
  incidentTypes: string[];
  incidentOther: string | null;
  incidentAt: Date;
  sitioPurok: string;
  barangay: string;
  mapLatitude: number | null;
  mapLongitude: number | null;
  cropType: string;
  estimatedAreaHa: number;
  estimatedLossPeso: number;
  damageDescription: string;
  photoCropUrl: string | null;
  photoLandslideUrl: string | null;
  photoOtherUrl: string | null;
  docProofOfLand: boolean;
  docListOfCrops: boolean;
  docValidId: boolean;
  docOther: boolean;
  documentUrl: string | null;
  documentName: string | null;
  declared: boolean;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  farmerId: string;
  farmer: { name: string; farmerCode: string; contactNumber: string };
};

function mapSituationReport(row: SituationReportRow) {
  return {
    id: row.id,
    reportCode: row.reportCode,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    fullName: row.fullName,
    contactNumber: row.contactNumber,
    address: row.address,
    incidentTypes: row.incidentTypes,
    incidentOther: row.incidentOther,
    incidentAt: row.incidentAt.toISOString(),
    sitioPurok: row.sitioPurok,
    barangay: row.barangay,
    mapLatitude: row.mapLatitude,
    mapLongitude: row.mapLongitude,
    cropType: row.cropType,
    estimatedAreaHa: row.estimatedAreaHa,
    estimatedLossPeso: row.estimatedLossPeso,
    damageDescription: row.damageDescription,
    photoCropUrl: row.photoCropUrl,
    photoLandslideUrl: row.photoLandslideUrl,
    photoOtherUrl: row.photoOtherUrl,
    docProofOfLand: row.docProofOfLand,
    docListOfCrops: row.docListOfCrops,
    docValidId: row.docValidId,
    docOther: row.docOther,
    documentUrl: row.documentUrl,
    documentName: row.documentName,
    declared: row.declared,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl,
    farmerId: row.farmerId,
    farmerName: row.farmer.name,
    farmerCode: row.farmer.farmerCode,
  };
}

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  status: z.enum(SITUATION_STATUSES).optional(),
  category: z.string().optional(),
  barangay: z.string().optional(),
});

function parseIncidentTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function parseBool(raw: unknown): boolean {
  return raw === true || raw === 'true' || raw === '1';
}

const createBodySchema = z.object({
  fullName: z.string().min(1),
  contactNumber: z.string().min(1),
  address: z.string().min(1),
  incidentOther: z.string().optional(),
  incidentAt: z.string().min(1),
  sitioPurok: z.string().min(1),
  barangay: z.string().min(1),
  mapLatitude: z.coerce.number().optional(),
  mapLongitude: z.coerce.number().optional(),
  cropType: z.string().min(1),
  estimatedAreaHa: z.coerce.number().min(0),
  estimatedLossPeso: z.coerce.number().min(0),
  damageDescription: z.string().min(1),
  docProofOfLand: z.union([z.boolean(), z.string()]).optional(),
  docListOfCrops: z.union([z.boolean(), z.string()]).optional(),
  docValidId: z.union([z.boolean(), z.string()]).optional(),
  docOther: z.union([z.boolean(), z.string()]).optional(),
  declared: z.union([z.boolean(), z.string()]),
});

export async function createMobileSituationReport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    const photoCrop = files?.photoCrop?.[0];
    const photoLandslide = files?.photoLandslide?.[0];
    const photoOther = files?.photoOther?.[0];
    const document = files?.document?.[0];

    if (!photoCrop && !photoLandslide && !photoOther) {
      throw new AppError(400, 'At least one damage photo is required');
    }

    const incidentTypes = parseIncidentTypes(req.body.incidentTypes).filter(
      (type) => INCIDENT_TYPES.includes(type as (typeof INCIDENT_TYPES)[number]),
    );

    if (incidentTypes.length === 0) {
      throw new AppError(400, 'Select at least one incident type');
    }

    const body = createBodySchema.parse(req.body);

    if (incidentTypes.includes('other') && !body.incidentOther?.trim()) {
      throw new AppError(400, 'Please specify the other incident type');
    }

    if (!parseBool(body.declared)) {
      throw new AppError(400, 'You must confirm the declaration');
    }

    const incidentAt = new Date(body.incidentAt);
    if (Number.isNaN(incidentAt.getTime())) {
      throw new AppError(400, 'Invalid incident date or time');
    }

    const primaryCategory = incidentTypes[0] ?? 'other';
    const title = `${body.cropType.trim()} damage report`;
    const photoCropUrl = photoCrop
      ? situationReportPublicPath(photoCrop.filename)
      : null;
    const photoLandslideUrl = photoLandslide
      ? situationReportPublicPath(photoLandslide.filename)
      : null;
    const photoOtherUrl = photoOther
      ? situationReportPublicPath(photoOther.filename)
      : null;
    const imageUrl =
      photoCropUrl ?? photoLandslideUrl ?? photoOtherUrl ?? '';

    try {
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
        select: { id: true, name: true, farmerCode: true, contactNumber: true },
      });
      if (!farmer) throw new AppError(404, 'Farmer not found');

      const reportCode = await nextReportCode();

      const created = await prisma.situationReport.create({
        data: {
          reportCode,
          farmerId,
          status: 'pending',
          fullName: body.fullName.trim(),
          contactNumber: body.contactNumber.trim(),
          address: body.address.trim(),
          incidentTypes,
          incidentOther: body.incidentOther?.trim() || null,
          incidentAt,
          sitioPurok: body.sitioPurok.trim(),
          barangay: body.barangay.trim(),
          mapLatitude: body.mapLatitude ?? null,
          mapLongitude: body.mapLongitude ?? null,
          cropType: body.cropType.trim(),
          estimatedAreaHa: body.estimatedAreaHa,
          estimatedLossPeso: body.estimatedLossPeso,
          damageDescription: body.damageDescription.trim(),
          photoCropUrl,
          photoLandslideUrl,
          photoOtherUrl,
          docProofOfLand: parseBool(body.docProofOfLand),
          docListOfCrops: parseBool(body.docListOfCrops),
          docValidId: parseBool(body.docValidId),
          docOther: parseBool(body.docOther),
          documentUrl: document
            ? situationDocumentPublicPath(document.filename)
            : null,
          documentName: document?.originalname ?? null,
          declared: true,
          title,
          description: body.damageDescription.trim(),
          category: primaryCategory,
          imageUrl,
        },
        include: {
          farmer: {
            select: { name: true, farmerCode: true, contactNumber: true },
          },
        },
      });

      res.status(201);
      return res.json(mapSituationReport(created));
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      throw new AppError(
        503,
        'Situation reports require a database connection. Start Postgres and try again.',
      );
    }
  } catch (err) {
    return next(err);
  }
}

export async function listMobileSituationReports(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const q = listQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      defaultPage: 1,
      defaultPageSize: 20,
      maxPageSize: 50,
    });

    try {
      const where = {
        farmerId,
        ...(q.status ? { status: q.status } : {}),
        ...(q.category && q.category !== 'all' ? { category: q.category } : {}),
      };

      const [total, rows] = await Promise.all([
        prisma.situationReport.count({ where }),
        prisma.situationReport.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            farmer: {
              select: { name: true, farmerCode: true, contactNumber: true },
            },
          },
        }),
      ]);

      return res.json({
        data: rows.map(mapSituationReport),
        page,
        pageSize,
        total,
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const rows = DEV_SITUATION_REPORTS.filter((r) => r.farmerId === farmerId);
      return res.json({
        data: rows,
        page: 1,
        pageSize: rows.length,
        total: rows.length,
      });
    }
  } catch (err) {
    return next(err);
  }
}

export async function listAdminSituationReports(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = listQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      defaultPage: 1,
      defaultPageSize: 10,
      maxPageSize: 100,
    });

    const search = q.query?.trim();
    const barangay =
      q.barangay && q.barangay !== 'all' ? q.barangay.trim() : undefined;

    try {
      const where = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.category && q.category !== 'all' ? { category: q.category } : {}),
        ...(barangay ? { barangay } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { reportCode: { contains: search, mode: 'insensitive' as const } },
                { cropType: { contains: search, mode: 'insensitive' as const } },
                { fullName: { contains: search, mode: 'insensitive' as const } },
                { damageDescription: { contains: search, mode: 'insensitive' as const } },
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

      const [total, rows, pending, reviewed, resolved] = await Promise.all([
        prisma.situationReport.count({ where }),
        prisma.situationReport.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            farmer: {
              select: { name: true, farmerCode: true, contactNumber: true },
            },
          },
        }),
        prisma.situationReport.count({ where: { status: 'pending' } }),
        prisma.situationReport.count({ where: { status: 'reviewed' } }),
        prisma.situationReport.count({ where: { status: 'resolved' } }),
      ]);

      return res.json({
        data: rows.map(mapSituationReport),
        page,
        pageSize,
        total,
        stats: { pending, reviewed, resolved, total: pending + reviewed + resolved },
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      let rows = [...DEV_SITUATION_REPORTS];
      if (q.status) rows = rows.filter((r) => r.status === q.status);
      if (search) {
        const haystack = search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.title.toLowerCase().includes(haystack) ||
            r.farmerName.toLowerCase().includes(haystack) ||
            r.reportCode.toLowerCase().includes(haystack) ||
            r.fullName.toLowerCase().includes(haystack),
        );
      }

      const pageRows = rows.slice(skip, skip + take);
      return res.json({
        data: pageRows,
        page,
        pageSize,
        total: rows.length,
        stats: {
          pending: DEV_SITUATION_REPORTS.filter((r) => r.status === 'pending').length,
          reviewed: DEV_SITUATION_REPORTS.filter((r) => r.status === 'reviewed').length,
          resolved: DEV_SITUATION_REPORTS.filter((r) => r.status === 'resolved').length,
          total: DEV_SITUATION_REPORTS.length,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
}

const updateStatusSchema = z.object({
  status: z.enum(SITUATION_STATUSES),
});

export async function updateAdminSituationReport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const body = updateStatusSchema.parse(req.body);

    const updated = await prisma.situationReport.update({
      where: { id },
      data: { status: body.status },
      include: {
        farmer: {
          select: { name: true, farmerCode: true, contactNumber: true },
        },
      },
    });

    return res.json(mapSituationReport(updated));
  } catch (err) {
    return next(err);
  }
}
