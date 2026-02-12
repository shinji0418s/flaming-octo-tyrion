import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      customer: { select: { companyName: true } },
      assignments: {
        include: { partner: { select: { name: true } } },
      },
      _count: {
        select: { documents: true, qaSheets: true, deliverables: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: body,
    include: { customer: { select: { companyName: true } } },
  });
  return NextResponse.json(project, { status: 201 });
}
