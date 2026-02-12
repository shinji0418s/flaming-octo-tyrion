import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const assignment = await prisma.projectAssignment.update({
    where: { id },
    data: body,
    include: { partner: true, project: true },
  });

  // 契約署名時にプロジェクトステータスを更新
  if (body.contractStatus === "signed" || body.contractStatus === "started_without_contract") {
    const allAssignments = await prisma.projectAssignment.findMany({
      where: { projectId: assignment.projectId },
    });
    const allContracted = allAssignments.every(
      (a) => a.contractStatus === "signed" || a.contractStatus === "started_without_contract"
    );
    if (allContracted) {
      await prisma.project.update({
        where: { id: assignment.projectId },
        data: { status: "in_progress", startDate: new Date() },
      });
    }
  }

  // 報酬合意時のステータス更新
  if (body.feeStatus === "agreed") {
    const allAssignments = await prisma.projectAssignment.findMany({
      where: { projectId: assignment.projectId },
    });
    const allAgreed = allAssignments.every((a) => a.feeStatus === "agreed");
    if (allAgreed) {
      await prisma.project.update({
        where: { id: assignment.projectId },
        data: { status: "contract" },
      });
    }
  }

  return NextResponse.json(assignment);
}
