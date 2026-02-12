import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: qaSheetId } = await params;
  const body = await req.json();

  const item = await prisma.qAItem.create({
    data: {
      qaSheetId,
      questionNumber: body.questionNumber,
      partnerName: body.partnerName ?? "",
      workType: body.workType ?? "",
      question: body.question,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // Update items by id passed in body
  if (body.itemId) {
    const item = await prisma.qAItem.update({
      where: { id: body.itemId },
      data: {
        answer: body.answer,
        status: body.answer ? "answered" : "open",
      },
    });
    return NextResponse.json(item);
  }

  return NextResponse.json({ error: "itemId required" }, { status: 400 });
}
