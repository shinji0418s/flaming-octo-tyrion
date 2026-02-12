import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const documents = await prisma.document.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json();

  const document = await prisma.document.create({
    data: { ...body, projectId },
  });

  // 全パートナーに配信フラグを立てる場合
  if (body.distributeToAll) {
    await prisma.document.update({
      where: { id: document.id },
      data: { distributedToAll: true, distributedAt: new Date() },
    });

    // 通知ログを作成
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId },
      include: { partner: true },
    });

    for (const assignment of assignments) {
      await prisma.notification.create({
        data: {
          projectId,
          type: "email",
          recipient: assignment.partner.email,
          subject: `【追加資料】${body.fileName}`,
          body: `案件に関する追加資料「${body.fileName}」が共有されました。`,
        },
      });
    }
  }

  return NextResponse.json(document, { status: 201 });
}
