import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const workType = searchParams.get("workType");
  const skillLevel = searchParams.get("skillLevel");
  const available = searchParams.get("available");

  const where: Record<string, unknown> = { isActive: true };

  if (workType) {
    where.workTypes = { contains: workType };
  }
  if (skillLevel) {
    where.skillLevel = skillLevel;
  }
  if (available === "true") {
    where.availableStatus = "available";
  }

  const partners = await prisma.partner.findMany({
    where,
    include: {
      assignments: {
        where: { workStatus: { in: ["in_progress", "not_started"] } },
        select: { id: true, projectId: true, workType: true, workStatus: true },
      },
    },
    orderBy: { rating: "desc" },
  });
  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const partner = await prisma.partner.create({ data: body });
  return NextResponse.json(partner, { status: 201 });
}
