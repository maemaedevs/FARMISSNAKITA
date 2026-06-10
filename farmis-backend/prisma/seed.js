"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPasswordHash = await bcryptjs_1.default.hash('admin123', 10);
    await prisma.adminUser.upsert({
        where: { email: 'admin@farmis.local' },
        update: {
            passwordHash: adminPasswordHash,
            name: 'Farmis Admin',
            role: 'barangay-official',
            status: 'active',
        },
        create: {
            email: 'admin@farmis.local',
            passwordHash: adminPasswordHash,
            name: 'Farmis Admin',
            role: 'barangay-official',
            status: 'active',
        },
    });
    const systemUsers = [
        {
            userCode: 'USR-0001',
            name: 'Mun. Agri Officer',
            username: 'munagri',
            email: 'agri@farmis.local',
            role: 'municipal-agriculturist',
            status: 'active',
        },
        {
            userCode: 'USR-0002',
            name: 'Brgy. Official',
            username: 'barangay',
            email: 'brgy@farmis.local',
            role: 'barangay-official',
            status: 'active',
        },
        {
            userCode: 'USR-0003',
            name: 'Encoder',
            username: 'encoder1',
            email: 'enc1@farmis.local',
            role: 'encoder',
            status: 'inactive',
        },
    ];
    for (const u of systemUsers) {
        await prisma.systemUser.upsert({
            where: { userCode: u.userCode },
            update: {
                name: u.name,
                username: u.username,
                email: u.email,
                role: u.role,
                status: u.status,
            },
            create: {
                userCode: u.userCode,
                name: u.name,
                username: u.username,
                email: u.email,
                role: u.role,
                status: u.status,
                lastLoginAt: null,
            },
        });
    }
    const farmer = {
        farmerCode: 'FARM-0001',
        registryId: 'REG-2025-0001',
        name: 'Juan Dela Cruz',
        contactNumber: '09171234567',
        email: 'juan.dela.cruz@farmis.local',
        barangay: 'San Isidro',
        farmAreaHa: 1.75,
        primaryCrops: ['Corn', 'Rice'],
        status: 'active',
        address: 'San Isidro, Example Province',
        age: 45,
        gender: 'Male',
        civilStatus: 'Married',
        birthday: '1981-05-12',
        placeOfBirth: 'Example City',
        nationality: 'Filipino',
        occupation: 'Farmer',
        education: 'High School',
        householdSize: 5,
        primaryIncome: 'Farming',
        farmingExperienceYears: 18,
        mainCrop: 'Corn',
        otherCrops: 'Rice',
        livestock: 'Chicken',
        farmingType: 'Mixed Farming',
        farmSizeHa: 1.75,
        landLocation: 'Brgy San Isidro',
        coordinates: '14.5892, 121.0428',
        landType: 'Irrigated',
        titleNo: 'TCT-123456',
        verifiedBy: 'Farmis Verifier',
        verifiedAt: new Date('2025-06-01T08:00:00.000Z'),
        notes: 'Sample seed data.',
        documents: [
            { title: 'Land Title', status: 'verified' },
            { title: 'Valid ID', status: 'pending' },
        ],
    };
    await prisma.farmer.upsert({
        where: { farmerCode: farmer.farmerCode },
        update: {
            registryId: farmer.registryId,
            name: farmer.name,
            contactNumber: farmer.contactNumber,
            email: farmer.email,
            barangay: farmer.barangay,
            farmAreaHa: farmer.farmAreaHa,
            primaryCrops: farmer.primaryCrops,
            status: farmer.status,
            address: farmer.address,
            age: farmer.age,
            gender: farmer.gender,
            civilStatus: farmer.civilStatus,
            birthday: farmer.birthday,
            placeOfBirth: farmer.placeOfBirth,
            nationality: farmer.nationality,
            occupation: farmer.occupation,
            education: farmer.education,
            householdSize: farmer.householdSize,
            primaryIncome: farmer.primaryIncome,
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
            verifiedAt: farmer.verifiedAt,
            notes: farmer.notes,
        },
        create: {
            farmerCode: farmer.farmerCode,
            registryId: farmer.registryId,
            name: farmer.name,
            contactNumber: farmer.contactNumber,
            email: farmer.email,
            barangay: farmer.barangay,
            farmAreaHa: farmer.farmAreaHa,
            primaryCrops: farmer.primaryCrops,
            status: farmer.status,
            address: farmer.address,
            age: farmer.age,
            gender: farmer.gender,
            civilStatus: farmer.civilStatus,
            birthday: farmer.birthday,
            placeOfBirth: farmer.placeOfBirth,
            nationality: farmer.nationality,
            occupation: farmer.occupation,
            education: farmer.education,
            householdSize: farmer.householdSize,
            primaryIncome: farmer.primaryIncome,
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
            verifiedAt: farmer.verifiedAt,
            notes: farmer.notes,
        },
    });
    const farmerRow = await prisma.farmer.findUniqueOrThrow({
        where: { farmerCode: farmer.farmerCode },
        select: { id: true },
    });
    for (const doc of farmer.documents) {
        await prisma.farmerLandDocument.create({
            data: {
                title: doc.title,
                status: doc.status,
                farmerId: farmerRow.id,
            },
        }).catch(() => {
            // Seed might run multiple times; ignore duplicates by title+farmer.
        });
    }
    const programs = [
        {
            programCode: 'PRG-INPUT-001',
            name: 'Input Support',
            tagline: 'Seeds & fertilizers for active growers',
            programType: 'Input Support',
            description: 'Provides quality inputs to help farmers increase yield.',
            targetBeneficiaries: 120,
            fundingSource: 'Agriculture Office Fund',
            status: 'active',
            icon: 'sprout',
        },
        {
            programCode: 'PRG-PROD-001',
            name: 'Production Support',
            tagline: 'Training and production assistance',
            programType: 'Production Support',
            description: 'Assistance focused on improving production methods.',
            targetBeneficiaries: 90,
            fundingSource: 'Municipal Development Fund',
            status: 'active',
            icon: 'wheat',
        },
    ];
    for (const p of programs) {
        await prisma.assistanceProgram.upsert({
            where: { programCode: p.programCode },
            update: {
                name: p.name,
                tagline: p.tagline,
                programType: p.programType,
                description: p.description,
                targetBeneficiaries: p.targetBeneficiaries,
                fundingSource: p.fundingSource,
                status: p.status,
                icon: p.icon,
            },
            create: {
                programCode: p.programCode,
                name: p.name,
                tagline: p.tagline,
                programType: p.programType,
                description: p.description,
                targetBeneficiaries: p.targetBeneficiaries,
                fundingSource: p.fundingSource,
                status: p.status,
                icon: p.icon,
            },
        });
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
