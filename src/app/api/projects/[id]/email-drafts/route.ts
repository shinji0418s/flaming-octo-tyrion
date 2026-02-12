import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// プロジェクトのメール下書き一覧取得
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const drafts = await prisma.emailDraft.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(drafts);
}
