import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { prisma } from '../services/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import { AppError } from '../middleware/error';
import {
  avatarPublicPath,
  removeAvatarFilesForFarmer,
} from '../middleware/upload';
import { DEV_FARMERS, DEV_PROGRAMS } from '../services/dev-data';

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

function optionalTrimmedString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export type ProfilePayload = {
  id: string;
  farmerCode: string;
  registryId: string;
  name: string;
  barangay: string;
  status: string;
  email: string;
  age: number;
  gender: string;
  birthday: string;
  placeOfBirth: string;
  nationality: string;
  occupation: string;
  education: string;
  contactNumber: string;
  alternativeContact: string;
  address: string;
  primaryIncome: string;
  mainCrop: string;
  primaryCrops: string[];
  farmingExperienceYears: number;
  farmingType: string;
  farmAreaHa: number;
  householdSize: number;
  registeredBeneficiary: boolean;
  organization: string;
  avatarUrl: string | null;
};

type FarmerRecord = {
  id: string;
  farmerCode: string;
  registryId: string;
  name: string;
  barangay: string;
  status: string;
  email: string | null;
  age: number;
  gender: string;
  birthday: string | null;
  placeOfBirth: string | null;
  nationality: string | null;
  occupation: string | null;
  education: string | null;
  contactNumber: string;
  alternativeContact: string | null;
  address: string;
  primaryIncome: string | null;
  mainCrop: string;
  primaryCrops: string[];
  farmingExperienceYears: number;
  farmingType: string;
  farmAreaHa: number;
  householdSize: number;
  registeredBeneficiary: boolean;
  organization: string | null;
  avatarUrl: string | null;
};

function mapFarmerToProfile(farmer: FarmerRecord): ProfilePayload {
  return {
    id: farmer.id,
    farmerCode: farmer.farmerCode,
    registryId: farmer.registryId,
    name: farmer.name,
    barangay: farmer.barangay,
    status: farmer.status,
    email: farmer.email ?? '',
    age: farmer.age,
    gender: farmer.gender,
    birthday: farmer.birthday ?? '',
    placeOfBirth: farmer.placeOfBirth ?? '',
    nationality: farmer.nationality ?? '',
    occupation: farmer.occupation ?? '',
    education: farmer.education ?? '',
    contactNumber: farmer.contactNumber,
    alternativeContact: farmer.alternativeContact ?? '',
    address: farmer.address,
    primaryIncome: farmer.primaryIncome ?? '',
    mainCrop: farmer.mainCrop,
    primaryCrops: farmer.primaryCrops,
    farmingExperienceYears: farmer.farmingExperienceYears,
    farmingType: farmer.farmingType,
    farmAreaHa: farmer.farmAreaHa,
    householdSize: farmer.householdSize,
    registeredBeneficiary: farmer.registeredBeneficiary,
    organization: farmer.organization ?? '',
    avatarUrl: farmer.avatarUrl ?? null,
  };
}

function mapDevFarmerToProfile(dev: (typeof DEV_FARMERS)[number]): ProfilePayload {
  return {
    id: dev.id,
    farmerCode: dev.farmerCode,
    registryId: dev.registryId,
    name: dev.name,
    barangay: dev.barangay,
    status: dev.status,
    email: dev.email ?? '',
    age: dev.age,
    gender: dev.gender,
    birthday: dev.birthday,
    placeOfBirth: dev.placeOfBirth,
    nationality: dev.nationality,
    occupation: dev.occupation,
    education: dev.education,
    contactNumber: dev.contactNumber,
    alternativeContact: '',
    address: dev.address,
    primaryIncome: dev.primaryIncome,
    mainCrop: dev.mainCrop,
    primaryCrops: dev.primaryCrops,
    farmingExperienceYears: dev.farmingExperienceYears,
    farmingType: dev.farmingType,
    farmAreaHa: dev.farmAreaHa,
    householdSize: dev.householdSize,
    registeredBeneficiary: false,
    organization: '',
    avatarUrl: null,
  };
}

export async function uploadMobileAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const file = req.file;
    if (!file) throw new AppError(400, 'No image file provided');

    const avatarUrl = avatarPublicPath(file.filename);

    try {
      const existing = await prisma.farmer.findUnique({
        where: { id: farmerId },
        select: { id: true },
      });
      if (!existing) throw new AppError(404, 'Farmer not found');

      const updated = await prisma.farmer.update({
        where: { id: farmerId },
        data: { avatarUrl },
      });

      removeAvatarFilesForFarmer(farmerId, file.filename);

      return res.json({
        avatarUrl: updated.avatarUrl,
        profile: mapFarmerToProfile(updated),
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      throw new AppError(
        503,
        'Profile photo uploads require a database connection. Start Postgres and try again.',
      );
    }
  } catch (err) {
    return next(err);
  }
}

export async function getMobileProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    try {
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
      });

      if (!farmer) throw new AppError(404, 'Farmer not found');

      return res.json(mapFarmerToProfile(farmer));
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      const dev =
        DEV_FARMERS.find((f) => f.id === farmerId) ?? DEV_FARMERS[0];
      if (!dev) throw new AppError(404, 'Farmer not found');

      return res.json(mapDevFarmerToProfile(dev));
    }
  } catch (err) {
    return next(err);
  }
}

const updateMobileProfileSchema = z.object({
  name: z.string().min(1).optional(),
  contactNumber: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  alternativeContact: z.string().optional(),
  address: z.string().optional(),
  age: z.coerce.number().int().min(0).optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  householdSize: z.coerce.number().int().min(0).optional(),
  primaryIncome: z.string().optional(),
  organization: z.string().optional(),
  mainCrop: z.string().optional(),
  farmingExperienceYears: z.coerce.number().int().min(0).optional(),
  farmingType: z.string().optional(),
  farmAreaHa: z.coerce.number().min(0).optional(),
});

export async function updateMobileProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const body = updateMobileProfileSchema.parse(req.body);

    try {
      const existing = await prisma.farmer.findUnique({
        where: { id: farmerId },
      });
      if (!existing) throw new AppError(404, 'Farmer not found');

      const updated = await prisma.farmer.update({
        where: { id: farmerId },
        data: {
          ...(body.name !== undefined ? { name: body.name.trim() } : {}),
          ...(body.contactNumber !== undefined
            ? { contactNumber: body.contactNumber.trim() }
            : {}),
          ...(body.email !== undefined
            ? { email: optionalTrimmedString(body.email) }
            : {}),
          ...(body.alternativeContact !== undefined
            ? { alternativeContact: optionalTrimmedString(body.alternativeContact) }
            : {}),
          ...(body.address !== undefined ? { address: body.address.trim() } : {}),
          ...(body.age !== undefined ? { age: body.age } : {}),
          ...(body.gender !== undefined ? { gender: body.gender.trim() } : {}),
          ...(body.birthday !== undefined
            ? { birthday: optionalTrimmedString(body.birthday) }
            : {}),
          ...(body.placeOfBirth !== undefined
            ? { placeOfBirth: optionalTrimmedString(body.placeOfBirth) }
            : {}),
          ...(body.nationality !== undefined
            ? { nationality: optionalTrimmedString(body.nationality) }
            : {}),
          ...(body.occupation !== undefined
            ? { occupation: optionalTrimmedString(body.occupation) }
            : {}),
          ...(body.education !== undefined
            ? { education: optionalTrimmedString(body.education) }
            : {}),
          ...(body.householdSize !== undefined
            ? { householdSize: body.householdSize }
            : {}),
          ...(body.primaryIncome !== undefined
            ? { primaryIncome: optionalTrimmedString(body.primaryIncome) }
            : {}),
          ...(body.organization !== undefined
            ? { organization: optionalTrimmedString(body.organization) }
            : {}),
          ...(body.mainCrop !== undefined
            ? { mainCrop: body.mainCrop.trim() }
            : {}),
          ...(body.farmingExperienceYears !== undefined
            ? { farmingExperienceYears: body.farmingExperienceYears }
            : {}),
          ...(body.farmingType !== undefined
            ? { farmingType: body.farmingType.trim() }
            : {}),
          ...(body.farmAreaHa !== undefined
            ? {
                farmAreaHa: body.farmAreaHa,
                farmSizeHa: body.farmAreaHa,
              }
            : {}),
        },
      });

      return res.json(mapFarmerToProfile(updated));
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      throw new AppError(
        503,
        'Profile updates require a database connection. Start Postgres and try again.',
      );
    }
  } catch (err) {
    return next(err);
  }
}

const changeMobilePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export async function changeMobilePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const farmerId = req.auth?.sub;
    if (!farmerId) throw new AppError(401, 'Unauthenticated');

    const body = changeMobilePasswordSchema.parse(req.body);

    if (body.currentPassword === body.newPassword) {
      throw new AppError(400, 'New password must be different from the current password');
    }

    try {
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
        select: { passwordHash: true },
      });

      if (!farmer) throw new AppError(404, 'Farmer not found');

      if (!farmer.passwordHash) {
        throw new AppError(400, 'No password is set for this account');
      }

      const ok = await verifyPassword(body.currentPassword, farmer.passwordHash);
      if (!ok) {
        throw new AppError(401, 'Current password is incorrect');
      }

      const passwordHash = await hashPassword(body.newPassword);
      await prisma.farmer.update({
        where: { id: farmerId },
        data: { passwordHash },
      });

      return res.json({ ok: true });
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      throw new AppError(
        503,
        'Password changes require a database connection. Start Postgres and try again.',
      );
    }
  } catch (err) {
    return next(err);
  }
}

export async function listMobilePrograms(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = z
      .object({
        page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).max(50).optional(),
      })
      .parse(req.query);

    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    try {
      const [total, rows] = await Promise.all([
        prisma.assistanceProgram.count({ where: { status: 'active' } }),
        prisma.assistanceProgram.findMany({
          where: { status: 'active' },
          skip,
          take: pageSize,
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
            icon: true,
            addedAt: true,
          },
        }),
      ]);

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
          icon: p.icon,
          addedAt: p.addedAt.toISOString(),
        })),
        page,
        pageSize,
        total,
      });
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;

      const active = DEV_PROGRAMS.filter((p) => p.status === 'active');
      const pageRows = active.slice(skip, skip + pageSize);

      return res.json({
        data: pageRows.map((p) => ({
          id: p.id,
          programCode: p.programCode,
          name: p.name,
          tagline: p.tagline,
          programType: p.programType,
          description: p.description,
          targetBeneficiaries: p.targetBeneficiaries,
          fundingSource: p.fundingSource,
          icon: p.icon,
          addedAt: p.addedAt,
        })),
        page,
        pageSize,
        total: active.length,
      });
    }
  } catch (err) {
    return next(err);
  }
}
