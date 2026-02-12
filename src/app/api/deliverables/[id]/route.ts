import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const deliverable = await prisma.deliverable.update({
    where: { id },
    data: {
      status: body.status,
      qcReviewerName: body.qcReviewerName,
      qcNotes: body.qcNotes,
      reviewedAt: body.status === "approved" || body.status === "revision_requested" ? new Date() : undefined,
      approvedAt: body.status === "approved" ? new Date() : undefined,
    },
    include: { partner: true, project: true },
  });

  // 全成果物が承認済みなら統合フェーズへ
  if (body.status === "approved") {
    const allDeliverables = await prisma.deliverable.findMany({
      where: { projectId: deliverable.projectId },
    });
    const allApproved = allDeliverables.every(
      (d) => d.status === "approved" || d.status === "integrated"
    );
    if (allApproved) {
      await prisma.project.update({
        where: { id: deliverable.projectId },
        data: { status: "integration" },
      });
    }
  }

  return NextResponse.json(deliverable);
}
