import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      hearingSheet: true,
      assignments: {
        include: { partner: true },
        orderBy: { createdAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      qaSheets: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
      deliverables: {
        include: { partner: true, revisions: { orderBy: { revisionNumber: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      notifications: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(project);
}
