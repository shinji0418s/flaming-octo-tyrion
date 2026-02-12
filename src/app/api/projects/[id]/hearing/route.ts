import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await req.json();
  const existing = await prisma.hearingSheet.findUnique({ where: { projectId } });
  if (existing) {
    const updated = await prisma.hearingSheet.update({
      where: { projectId },
      data: body,
    });
    return NextResponse.json(updated);
  }
  const hearingSheet = await prisma.hearingSheet.create({
    data: { ...body, projectId },
  });
  // ステータスを自動更新
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "partner_selection" },
  });
  return NextResponse.json(hearingSheet, { status: 201 });
}
