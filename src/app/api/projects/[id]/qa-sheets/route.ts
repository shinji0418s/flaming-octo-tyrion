import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json();

  const qaSheet = await prisma.qASheet.create({
    data: {
      projectId,
      qaType: body.qaType ?? "question",
      workType: body.workType ?? "",
      notes: body.notes ?? "",
      items: body.items
        ? {
            create: body.items.map((item: { questionNumber: number; partnerName: string; workType: string; question: string }, idx: number) => ({
              questionNumber: item.questionNumber ?? idx + 1,
              partnerName: item.partnerName ?? "",
              workType: item.workType ?? "",
              question: item.question,
            })),
          }
        : undefined,
    },
    include: { items: true },
  });

  return NextResponse.json(qaSheet, { status: 201 });
}
