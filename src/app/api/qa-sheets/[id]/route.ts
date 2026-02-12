import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const qaSheet = await prisma.qASheet.update({
    where: { id },
    data: {
      status: body.status,
      sentToCustomerAt: body.status === "sent_to_customer" ? new Date() : undefined,
      answeredAt: body.status === "answered" ? new Date() : undefined,
      distributedAt: body.status === "distributed" ? new Date() : undefined,
      notes: body.notes,
    },
    include: { items: true },
  });

  // 回答配信時に全パートナーに通知
  if (body.status === "distributed") {
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId: qaSheet.projectId },
      include: { partner: true },
    });

    for (const assignment of assignments) {
      await prisma.notification.create({
        data: {
          projectId: qaSheet.projectId,
          type: "email",
          recipient: assignment.partner.email,
          subject: `【質疑回答】${qaSheet.workType} 質疑回答が届きました`,
          body: `質疑の回答が顧客から届きました。ご確認ください。`,
        },
      });
    }
  }

  return NextResponse.json(qaSheet);
}
