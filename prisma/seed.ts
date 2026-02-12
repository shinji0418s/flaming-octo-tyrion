import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 顧客データ
  const customer1 = await prisma.customer.create({
    data: {
      companyName: "株式会社大成建設",
      contactName: "田中太郎",
      email: "tanaka@example.com",
      phone: "03-1234-5678",
      address: "東京都新宿区1-1-1",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyName: "清水建設株式会社",
      contactName: "鈴木花子",
      email: "suzuki@example.com",
      phone: "03-9876-5432",
      address: "東京都港区2-2-2",
    },
  });

  // パートナーデータ
  const partner1 = await prisma.partner.create({
    data: {
      name: "山田一郎",
      email: "yamada@example.com",
      phone: "090-1111-2222",
      skillLevel: "senior",
      workTypes: JSON.stringify(["建築", "構造", "内装工事"]),
      specialties: "RC造建築積算",
      maxLoad: 3,
      rating: 4.5,
    },
  });

  const partner2 = await prisma.partner.create({
    data: {
      name: "佐藤二郎",
      email: "sato@example.com",
      phone: "090-3333-4444",
      skillLevel: "expert",
      workTypes: JSON.stringify(["電気設備", "機械設備", "空調換気設備"]),
      specialties: "設備積算全般",
      maxLoad: 2,
      rating: 4.8,
    },
  });

  const partner3 = await prisma.partner.create({
    data: {
      name: "高橋三郎",
      email: "takahashi@example.com",
      phone: "090-5555-6666",
      skillLevel: "mid",
      workTypes: JSON.stringify(["建築", "外構", "防水工事", "塗装工事"]),
      specialties: "外装・防水",
      maxLoad: 4,
      rating: 3.5,
    },
  });

  // 案件データ（進行中のサンプル）
  const project1 = await prisma.project.create({
    data: {
      projectName: "新宿オフィスビル新築工事",
      projectCode: "PRJ-2026-001",
      customerId: customer1.id,
      salesAmount: 5000000,
      status: "in_progress",
      pmName: "伊藤PM",
      startDate: new Date("2026-01-15"),
      deadline: new Date("2026-03-31"),
    },
  });

  // ヒアリングシート
  await prisma.hearingSheet.create({
    data: {
      projectId: project1.id,
      buildingType: "事務所ビル",
      structureType: "RC造",
      floors: "地上8階 地下1階",
      totalFloorArea: "12,000㎡",
      estimationScope: "建築、構造、電気設備、機械設備",
      requiredWorkTypes: JSON.stringify(["建築", "構造", "電気設備", "機械設備"]),
      drawingFormat: "PDF, DWG",
      softwarePreference: "Excel",
      specialNotes: "地下部分の防水に注意",
      customerRequests: "過去実績ベースで概算も希望",
      status: "completed",
    },
  });

  // パートナーアサイン
  await prisma.projectAssignment.create({
    data: {
      projectId: project1.id,
      partnerId: partner1.id,
      workType: "建築",
      proposedFee: 1500000,
      agreedFee: 1400000,
      feeStatus: "agreed",
      contractStatus: "signed",
      workStatus: "in_progress",
    },
  });

  await prisma.projectAssignment.create({
    data: {
      projectId: project1.id,
      partnerId: partner2.id,
      workType: "電気設備",
      proposedFee: 1000000,
      agreedFee: 950000,
      feeStatus: "agreed",
      contractStatus: "signed",
      workStatus: "in_progress",
    },
  });

  // 案件2（ヒアリング段階）
  await prisma.project.create({
    data: {
      projectName: "港区マンション改修工事",
      projectCode: "PRJ-2026-002",
      customerId: customer2.id,
      salesAmount: 3000000,
      status: "hearing",
      pmName: "渡辺PM",
      deadline: new Date("2026-04-30"),
    },
  });

  // 案件3（品質チェック段階）
  const project3 = await prisma.project.create({
    data: {
      projectName: "渋谷商業施設新築",
      projectCode: "PRJ-2026-003",
      customerId: customer1.id,
      salesAmount: 8000000,
      status: "qc_review",
      pmName: "伊藤PM",
      startDate: new Date("2025-12-01"),
      deadline: new Date("2026-02-28"),
    },
  });

  await prisma.projectAssignment.create({
    data: {
      projectId: project3.id,
      partnerId: partner3.id,
      workType: "建築",
      proposedFee: 2000000,
      agreedFee: 1800000,
      feeStatus: "agreed",
      contractStatus: "signed",
      workStatus: "submitted",
    },
  });

  await prisma.deliverable.create({
    data: {
      projectId: project3.id,
      partnerId: partner3.id,
      workType: "建築",
      fileName: "建築積算書_v1.xlsx",
      status: "qc_review",
      needsQC: true,
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
