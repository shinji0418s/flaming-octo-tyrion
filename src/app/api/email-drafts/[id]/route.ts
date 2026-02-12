import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// メール下書きの更新（PMが編集・承認・却下）
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const draft = await prisma.emailDraft.update({
    where: { id },
    data: {
      subject: body.subject,
      body: body.body,
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      pmNotes: body.pmNotes,
      status: body.status,
      approvedAt: body.status === "approved" ? new Date() : undefined,
      sentAt: body.status === "sent" ? new Date() : undefined,
    },
  });

  // 送信済みに変更された場合、通知ログにも記録
  if (body.status === "sent") {
    await prisma.notification.create({
      data: {
        projectId: draft.projectId,
        type: "email",
        recipient: draft.recipientEmail,
        subject: draft.subject,
        body: draft.body,
        status: "sent",
      },
    });
  }

  return NextResponse.json(draft);
}

// メール下書きの削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.emailDraft.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
