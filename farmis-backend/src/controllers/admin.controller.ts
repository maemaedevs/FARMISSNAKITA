import path from 'path';

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { landDocumentPublicPath } from '../middleware/upload';
import { prisma } from '../services/prisma';
import { parsePagination } from '../lib/pagination';
import { generateRandomPassword, hashPassword } from '../lib/password';
import { AppError } from '../middleware/error';
import { DEV_FARMERS, DEV_PROGRAMS, DEV_SYSTEM_USERS } from '../services/dev-data';

function isPrismaDbUnavailable(err: unknown) {
  const code = (err as any)?.code as string | undefined;
  return code === 'P1000' || code === 'P2021' || code === 'P1012';
}

function pad4(n: number) {
  return String(n).padStart(4, '0');
}

function optionalTrimmedString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const paginationDefaults = {
  defaultPage: 1,
  defaultPageSize: 10,
  maxPageSize: 100,
};

const farmerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  barangay: z.string().optional(),
});

export async function listFarmers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = farmerListQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      ...paginationDefaults,
    });

    const search = q.query?.trim();

    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.barangay && q.barangay !== 'all' ? { barangay: q.barangay } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { farmerCode: { contains: search, mode: 'insensitive' as const } },
              {
                contactNumber: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    let total: number;
    let rows: Array<{
      id: string;
      farmerCode: string;
      name: string;
      contactNumber: string;
      barangay: string;
      farmAreaHa: number;
      primaryCrops: string[];
      status: string;
      registeredAt: Date;
    }>;

    try {
      const result = await Promise.all([
        prisma.farmer.count({ where }),
        prisma.farmer.findMany({
          where,
          skip,
          take,
          orderBy: { registeredAt: 'desc' },
          select: {
            id: true,
            farmerCode: true,
            name: true,
            contactNumber: true,
            barangay: true,
            farmAreaHa: true,
            primaryCrops: true,
            status: true,
            registeredAt: true,
          },
        }),
      ]);
      total = result[0];
      rows = result[1];
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const searchLower = search?.toLowerCase() ?? '';
      const filtered = DEV_FARMERS.filter((f) => {
        if (q.status && f.status !== q.status) return false;
        if (q.barangay && q.barangay !== 'all' && f.barangay !== q.barangay) return false;
        if (searchLower) {
          return (
            f.name.toLowerCase().includes(searchLower) ||
            f.farmerCode.toLowerCase().includes(searchLower) ||
            f.contactNumber.includes(searchLower) ||
            f.registryId.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      total = filtered.length;
      rows = filtered.slice(skip, skip + take).map((f) => ({
        id: f.id,
        farmerCode: f.farmerCode,
        name: f.name,
        contactNumber: f.contactNumber,
        barangay: f.barangay,
        farmAreaHa: f.farmAreaHa,
        primaryCrops: f.primaryCrops,
        status: f.status,
        registeredAt: new Date(f.registeredAt),
      }));
    }

    return res.json({
      data: rows.map((f) => ({
        id: f.id,
        farmerCode: f.farmerCode,
        name: f.name,
        contactNumber: f.contactNumber,
        barangay: f.barangay,
        farmAreaHa: f.farmAreaHa,
        primaryCrops: f.primaryCrops,
        status: f.status,
        registeredAt: f.registeredAt.toISOString(),
      })),
      page,
      pageSize,
      total,
    });
  } catch (err) {
    return next(err);
  }
}

const farmerIdSchema = z.object({ id: z.string().min(1) });

export async function getFarmerDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = farmerIdSchema.parse(req.params);

    let farmer:
      | any
      | undefined
      | null;

    try {
      farmer = await prisma.farmer.findUnique({
        where: { id },
        include: {
          landDocuments: {
            select: {
              id: true,
              title: true,
              status: true,
              fileUrl: true,
              fileName: true,
              mimeType: true,
              uploadedAt: true,
            },
            orderBy: { uploadedAt: 'desc' },
          },
        },
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;
      const dev = DEV_FARMERS.find((f) => f.id === id);
      if (!dev) {
        res.status(404);
        return res.json({ message: 'Farmer not found' });
      }
      return res.json({ ...dev, hasPassword: true });
    }

    if (!farmer) {
      res.status(404);
      return res.json({ message: 'Farmer not found' });
    }

    return res.json({
      id: farmer.id,
      farmerCode: farmer.farmerCode,
      registryId: farmer.registryId,
      name: farmer.name,
      contactNumber: farmer.contactNumber,
      email: farmer.email ?? '',
      barangay: farmer.barangay,
      farmAreaHa: farmer.farmAreaHa,
      primaryCrops: farmer.primaryCrops,
      status: farmer.status,
      registeredAt: farmer.registeredAt.toISOString(),

      address: farmer.address,
      age: farmer.age,
      gender: farmer.gender,
      civilStatus: farmer.civilStatus,
      birthday: farmer.birthday ?? '',
      placeOfBirth: farmer.placeOfBirth ?? '',
      nationality: farmer.nationality ?? '',
      occupation: farmer.occupation ?? '',
      education: farmer.education ?? '',
      householdSize: farmer.householdSize,
      primaryIncome: farmer.primaryIncome ?? '',
      farmingExperienceYears: farmer.farmingExperienceYears,
      mainCrop: farmer.mainCrop,
      otherCrops: farmer.otherCrops,
      livestock: farmer.livestock,
      farmingType: farmer.farmingType,
      farmSizeHa: farmer.farmSizeHa,
      landLocation: farmer.landLocation,
      coordinates: farmer.coordinates,
      landType: farmer.landType,
      titleNo: farmer.titleNo,
      verifiedBy: farmer.verifiedBy,
      verifiedAt: farmer.verifiedAt.toISOString(),
      notes: farmer.notes,
      hasPassword: Boolean(farmer.passwordHash),
      avatarUrl: farmer.avatarUrl ?? null,

      landDocuments: (farmer.landDocuments as Array<{
        id: string;
        title: string;
        status: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        uploadedAt: Date;
      }>).map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        mimeType: d.mimeType,
        uploadedAt: d.uploadedAt.toISOString(),
      })),
    });
  } catch (err) {
    return next(err);
  }
}

const systemUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  role: z
    .enum([
      'municipal-agriculturist',
      'barangay-official',
      'encoder',
      'viewer',
      'data-verifier',
      'agriculture-officer',
    ])
    .optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function listSystemUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = systemUserListQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      ...paginationDefaults,
    });

    const search = q.query?.trim();

    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.role ? { role: q.role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { userCode: { contains: search, mode: 'insensitive' as const } },
              { username: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    let total: number;
    let rows: Array<{
      id: string;
      userCode: string;
      name: string;
      username: string;
      email: string;
      role: string;
      status: string;
      lastLoginAt: Date | null;
      createdAt: Date;
    }>;

    try {
      const result = await Promise.all([
        prisma.systemUser.count({ where }),
        prisma.systemUser.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userCode: true,
            name: true,
            username: true,
            email: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
          },
        }),
      ]);
      total = result[0];
      rows = result[1];
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const searchLower = search?.toLowerCase() ?? '';
      const filtered = DEV_SYSTEM_USERS.filter((u) => {
        if (q.status && u.status !== q.status) return false;
        if (q.role && u.role !== q.role) return false;
        if (searchLower) {
          return (
            u.name.toLowerCase().includes(searchLower) ||
            u.userCode.toLowerCase().includes(searchLower) ||
            u.username.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      total = filtered.length;
      rows = filtered.slice(skip, skip + take).map((u) => ({
        id: u.id,
        userCode: u.userCode,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        lastLoginAt: new Date(u.lastLoginAt),
        createdAt: new Date(u.createdAt),
      }));
    }

    return res.json({
      data: rows.map((u) => ({
        id: u.id,
        userCode: u.userCode,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        lastLoginAt: (u.lastLoginAt ?? u.createdAt).toISOString(),
        createdAt: u.createdAt.toISOString(),
      })),
      page,
      pageSize,
      total,
    });
  } catch (err) {
    return next(err);
  }
}

const programListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  programType: z
    .enum(['Input Support', 'Production Support', 'Livestock', 'Infrastructure'])
    .optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function listPrograms(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = programListQuerySchema.parse(req.query);
    const { page, pageSize, skip, take } = parsePagination({
      page: q.page,
      pageSize: q.pageSize,
      ...paginationDefaults,
    });

    const search = q.query?.trim();

    const where = {
      ...(q.status ? { status: q.status } : {}),
      ...(q.programType ? { programType: q.programType } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { programCode: { contains: search, mode: 'insensitive' as const } },
              { tagline: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    let total: number;
    let rows: Array<{
      id: string;
      programCode: string;
      name: string;
      tagline: string;
      programType: string;
      description: string;
      targetBeneficiaries: number;
      fundingSource: string;
      status: string;
      addedAt: Date;
      icon: string;
    }>;

    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    let stats = {
      total: 0,
      active: 0,
      inactive: 0,
      thisYear: 0,
    };

    try {
      const result = await Promise.all([
        prisma.assistanceProgram.count({ where }),
        prisma.assistanceProgram.findMany({
          where,
          skip,
          take,
          orderBy: { addedAt: 'desc' },
          select: {
            id: true,
            programCode: true,
            name: true,
            tagline: true,
            programType: true,
            description: true,
            targetBeneficiaries: true,
            fundingSource: true,
            status: true,
            addedAt: true,
            icon: true,
          },
        }),
        prisma.assistanceProgram.count(),
        prisma.assistanceProgram.count({ where: { status: 'active' } }),
        prisma.assistanceProgram.count({ where: { status: 'inactive' } }),
        prisma.assistanceProgram.count({
          where: { addedAt: { gte: yearStart } },
        }),
      ]);
      total = result[0];
      rows = result[1];
      stats = {
        total: result[2],
        active: result[3],
        inactive: result[4],
        thisYear: result[5],
      };
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const searchLower = search?.toLowerCase() ?? '';
      const filtered = DEV_PROGRAMS.filter((p) => {
        if (q.status && p.status !== q.status) return false;
        if (q.programType && p.programType !== q.programType) return false;
        if (searchLower) {
          return (
            p.name.toLowerCase().includes(searchLower) ||
            p.programCode.toLowerCase().includes(searchLower) ||
            p.tagline.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      total = filtered.length;
      rows = filtered.slice(skip, skip + take).map((p) => ({
        id: p.id,
        programCode: p.programCode,
        name: p.name,
        tagline: p.tagline,
        programType: p.programType,
        description: p.description,
        targetBeneficiaries: p.targetBeneficiaries,
        fundingSource: p.fundingSource,
        status: p.status,
        addedAt: new Date(p.addedAt),
        icon: p.icon,
      }));

      const nowYear = new Date().getFullYear();
      stats = {
        total: DEV_PROGRAMS.length,
        active: DEV_PROGRAMS.filter((p) => p.status === 'active').length,
        inactive: DEV_PROGRAMS.filter((p) => p.status === 'inactive').length,
        thisYear: DEV_PROGRAMS.filter(
          (p) => new Date(p.addedAt).getFullYear() === nowYear,
        ).length,
      };
    }

    return res.json({
      data: rows.map((p) => ({
        id: p.id,
        programCode: p.programCode,
        name: p.name,
        tagline: p.tagline,
        programType: p.programType,
        description: p.description,
        targetBeneficiaries: p.targetBeneficiaries,
        fundingSource: p.fundingSource,
        status: p.status,
        addedAt: p.addedAt.toISOString(),
        icon: p.icon,
      })),
      page,
      pageSize,
      total,
      stats,
    });
  } catch (err) {
    return next(err);
  }
}

const createProgramSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  programType: z.enum([
    'Input Support',
    'Production Support',
    'Livestock',
    'Infrastructure',
  ]),
  description: z.string().min(1),
  targetBeneficiaries: z.coerce.number().int().min(0),
  fundingSource: z.string().min(1),
  status: z.enum(['active', 'inactive']).default('active'),
  icon: z
    .enum(['gift', 'sprout', 'wheat', 'beef', 'building', 'tractor'])
    .default('gift'),
});

function padProgramSeq(n: number) {
  return String(n).padStart(3, '0');
}

export async function createProgram(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createProgramSchema.parse(req.body);

    const count = await prisma.assistanceProgram.count();
    const programCode = `PRG-${padProgramSeq(count + 1)}`;

    const created = await prisma.assistanceProgram.create({
      data: {
        programCode,
        name: body.name.trim(),
        tagline: body.tagline.trim(),
        programType: body.programType,
        description: body.description.trim(),
        targetBeneficiaries: body.targetBeneficiaries,
        fundingSource: body.fundingSource.trim(),
        status: body.status,
        icon: body.icon,
      },
    });

    return res.status(201).json({
      id: created.id,
      programCode: created.programCode,
      name: created.name,
      tagline: created.tagline,
      programType: created.programType,
      description: created.description,
      targetBeneficiaries: created.targetBeneficiaries,
      fundingSource: created.fundingSource,
      status: created.status,
      addedAt: created.addedAt.toISOString(),
      icon: created.icon,
    });
  } catch (err) {
    return next(err);
  }
}

const createFarmerSchema = z.object({
  name: z.string().min(1),
  contactNumber: z.string().min(1),
  barangay: z.string().min(1),
  farmAreaHa: z.coerce.number().min(0),
  primaryCrops: z.array(z.string().min(1)).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  email: z.string().email().optional().or(z.literal('')),
  // Optional extended profile fields.
  address: z.string().optional(),
  age: z.coerce.number().int().min(0).optional(),
  gender: z.string().optional(),
  civilStatus: z.string().optional(),
  birthday: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  householdSize: z.coerce.number().int().min(0).optional(),
  primaryIncome: z.string().optional(),
  farmingExperienceYears: z.coerce.number().int().min(0).optional(),
  mainCrop: z.string().optional(),
  otherCrops: z.string().optional(),
  livestock: z.string().optional(),
  farmingType: z.string().optional(),
  farmSizeHa: z.coerce.number().min(0).optional(),
  landLocation: z.string().optional(),
  coordinates: z.string().optional(),
  landType: z.string().optional(),
  titleNo: z.string().optional(),
  notes: z.string().optional(),
});

export async function createFarmer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createFarmerSchema.parse(req.body);

    const now = new Date();
    const verifiedBy = req.auth?.sub ?? 'system';

    try {
      const count = await prisma.farmer.count();
      const seq = count + 1;
      const farmerCode = `FARM-${pad4(seq)}`;
      const registryId = `REG-${now.getFullYear()}-${pad4(seq)}`;

      const created = await prisma.farmer.create({
        data: {
          farmerCode,
          registryId,
          name: body.name,
          contactNumber: body.contactNumber,
          email: body.email ? body.email : null,
          barangay: body.barangay,
          farmAreaHa: body.farmAreaHa,
          primaryCrops: body.primaryCrops,
          status: body.status,
          registeredAt: now,

          address: body.address ?? '',
          age: body.age ?? 0,
          gender: body.gender ?? '',
          civilStatus: body.civilStatus ?? '',
          birthday: optionalTrimmedString(body.birthday),
          placeOfBirth: optionalTrimmedString(body.placeOfBirth),
          nationality: optionalTrimmedString(body.nationality),
          occupation: optionalTrimmedString(body.occupation),
          education: optionalTrimmedString(body.education),
          householdSize: body.householdSize ?? 0,
          primaryIncome: optionalTrimmedString(body.primaryIncome),
          farmingExperienceYears: body.farmingExperienceYears ?? 0,
          mainCrop: body.mainCrop ?? body.primaryCrops[0] ?? '',
          otherCrops: body.otherCrops ?? '',
          livestock: body.livestock ?? '',
          farmingType: body.farmingType ?? '',
          farmSizeHa: body.farmSizeHa ?? body.farmAreaHa,
          landLocation: body.landLocation ?? '',
          coordinates: body.coordinates ?? '',
          landType: body.landType ?? '',
          titleNo: body.titleNo ?? '',
          verifiedBy,
          verifiedAt: now,
          notes: body.notes ?? '',
        },
        select: {
          id: true,
          farmerCode: true,
          name: true,
          contactNumber: true,
          barangay: true,
          farmAreaHa: true,
          primaryCrops: true,
          status: true,
          registeredAt: true,
        },
      });

      res.status(201);
      return res.json({
        id: created.id,
        farmerCode: created.farmerCode,
        name: created.name,
        contactNumber: created.contactNumber,
        barangay: created.barangay,
        farmAreaHa: created.farmAreaHa,
        primaryCrops: created.primaryCrops,
        status: created.status,
        registeredAt: created.registeredAt.toISOString(),
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      // Dev fallback: DB not available, return a synthesized record so the
      // admin UI flow can be exercised without Postgres.
      const seq = DEV_FARMERS.length + 1;
      res.status(201);
      return res.json({
        id: `dev_farmer_${Date.now()}`,
        farmerCode: `FARM-${pad4(seq)}`,
        name: body.name,
        contactNumber: body.contactNumber,
        barangay: body.barangay,
        farmAreaHa: body.farmAreaHa,
        primaryCrops: body.primaryCrops,
        status: body.status,
        registeredAt: now.toISOString(),
      });
    }
  } catch (err) {
    return next(err);
  }
}

export async function generateFarmerPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = farmerIdSchema.parse(req.params);
    const plainPassword = generateRandomPassword(10);
    const passwordHash = await hashPassword(plainPassword);

    try {
      const farmer = await prisma.farmer.findUnique({
        where: { id },
        select: {
          id: true,
          farmerCode: true,
          registryId: true,
          name: true,
          status: true,
        },
      });

      if (!farmer) {
        throw new AppError(404, 'Farmer not found');
      }

      await prisma.farmer.update({
        where: { id },
        data: { passwordHash },
      });

      return res.json({
        farmerCode: farmer.farmerCode,
        registryId: farmer.registryId,
        name: farmer.name,
        password: plainPassword,
        hasPassword: true,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      const dev = DEV_FARMERS.find((f) => f.id === id);
      if (!dev) {
        throw new AppError(404, 'Farmer not found');
      }

      return res.json({
        farmerCode: dev.farmerCode,
        registryId: dev.registryId,
        name: dev.name,
        password: plainPassword,
        hasPassword: true,
      });
    }
  } catch (err) {
    return next(err);
  }
}

const uploadLandDocumentBodySchema = z.object({
  title: z.string().min(1).optional(),
});

function titleFromOriginalFilename(filename: string): string {
  const base = path.basename(filename, path.extname(filename)).trim();
  return base.length > 0 ? base : 'Land Document';
}

export async function uploadFarmerLandDocument(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = farmerIdSchema.parse(req.params);
    const file = req.file;
    if (!file) throw new AppError(400, 'No document file provided');

    const body = uploadLandDocumentBodySchema.parse(req.body);
    const title = body.title?.trim() || titleFromOriginalFilename(file.originalname);
    const fileUrl = landDocumentPublicPath(id, file.filename);

    try {
      const farmer = await prisma.farmer.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!farmer) throw new AppError(404, 'Farmer not found');

      const doc = await prisma.farmerLandDocument.create({
        data: {
          farmerId: id,
          title,
          status: 'pending',
          fileUrl,
          fileName: file.originalname,
          mimeType: file.mimetype,
        },
      });

      res.status(201);
      return res.json({
        id: doc.id,
        title: doc.title,
        status: doc.status,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt.toISOString(),
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      throw new AppError(
        503,
        'Document uploads require a database connection. Start Postgres and try again.',
      );
    }
  } catch (err) {
    return next(err);
  }
}
