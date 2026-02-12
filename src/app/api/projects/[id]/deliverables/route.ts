import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json();

  const deliverable = await prisma.deliverable.create({
    data: {
      projectId,
      partnerId: body.partnerId,
      workType: body.workType,
      fileName: body.fileName,
      fileUrl: body.fileUrl ?? "",
      needsQC: body.needsQC ?? true,
    },
    include: { partner: true },
  });

  // 品質チェックが必要な場合、自動でステータスを変更
  if (deliverable.needsQC) {
    await prisma.deliverable.update({
      where: { id: deliverable.id },
      data: { status: "qc_review" },
    });
  }

  return NextResponse.json(deliverable, { status: 201 });
}
