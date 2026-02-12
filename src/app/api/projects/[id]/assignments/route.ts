import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FEE_RATIO } from "@/lib/constants";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json();

  // 報酬を自動計算（売上の約50%）
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const proposedFee = body.proposedFee ?? Math.round(project.salesAmount * DEFAULT_FEE_RATIO);

  const assignment = await prisma.projectAssignment.create({
    data: {
      projectId,
      partnerId: body.partnerId,
      workType: body.workType,
      proposedFee,
      feeStatus: "proposed",
    },
    include: { partner: true },
  });

  // パートナーの稼働数を更新
  await prisma.partner.update({
    where: { id: body.partnerId },
    data: { currentLoad: { increment: 1 } },
  });

  // プロジェクトステータス更新
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "negotiation" },
  });

  return NextResponse.json(assignment, { status: 201 });
}
