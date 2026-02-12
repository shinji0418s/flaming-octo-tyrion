import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: deliverableId } = await params;
  const body = await req.json();

  // 現在のリビジョン数を取得
  const count = await prisma.deliverableRevision.count({ where: { deliverableId } });

  const revision = await prisma.deliverableRevision.create({
    data: {
      deliverableId,
      revisionNumber: count + 1,
      revisionNotes: body.revisionNotes ?? "",
      status: "requested",
    },
  });

  // 成果物のステータスを修正依頼中に
  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: { status: "revision_requested" },
  });

  // パートナーに通知
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    include: { partner: true, project: true },
  });

  if (deliverable) {
    await prisma.notification.create({
      data: {
        projectId: deliverable.projectId,
        type: "email",
        recipient: deliverable.partner.email,
        subject: `【修正依頼】${deliverable.workType} 成果物の修正をお願いします`,
        body: `修正内容: ${body.revisionNotes}`,
      },
    });
  }

  return NextResponse.json(revision, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: deliverableId } = await params;
  const body = await req.json();

  if (!body.revisionId) {
    return NextResponse.json({ error: "revisionId required" }, { status: 400 });
  }

  const revision = await prisma.deliverableRevision.update({
    where: { id: body.revisionId },
    data: {
      responseNotes: body.responseNotes,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      status: body.status,
      submittedAt: body.status === "submitted" ? new Date() : undefined,
      reviewedAt: body.status === "approved" ? new Date() : undefined,
    },
  });

  // 修正提出時に成果物ステータスも更新
  if (body.status === "submitted") {
    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: "revision_submitted", version: { increment: 1 } },
    });
  }

  return NextResponse.json(revision);
}
