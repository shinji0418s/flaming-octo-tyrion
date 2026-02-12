import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FEE_RATIO } from "@/lib/constants";

// ヒアリング内容からパートナーを自動選定してアサインする
export async function POST(req: NextRequest) {
  const { projectId } = await req.json();

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      hearingSheet: true,
      assignments: true,
      customer: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.hearingSheet) {
    return NextResponse.json({ error: "Hearing sheet not found" }, { status: 400 });
  }

  // 必要な工種を取得
  let requiredWorkTypes: string[] = [];
  try {
    requiredWorkTypes = JSON.parse(project.hearingSheet.requiredWorkTypes || "[]");
  } catch {
    requiredWorkTypes = [];
  }

  if (requiredWorkTypes.length === 0) {
    return NextResponse.json({ error: "No work types specified in hearing sheet" }, { status: 400 });
  }

  // 既にアサイン済みの工種を除外
  const assignedWorkTypes = project.assignments.map((a) => a.workType);
  const unassignedWorkTypes = requiredWorkTypes.filter(
    (wt) => !assignedWorkTypes.includes(wt)
  );

  if (unassignedWorkTypes.length === 0) {
    return NextResponse.json({
      message: "All work types already assigned",
      assignments: [],
    });
  }

  // 利用可能なパートナーを全て取得
  const availablePartners = await prisma.partner.findMany({
    where: {
      isActive: true,
      availableStatus: { not: "unavailable" },
    },
    include: {
      assignments: {
        where: { workStatus: { in: ["in_progress", "not_started"] } },
      },
    },
    orderBy: { rating: "desc" },
  });

  // 各工種に最適なパートナーをマッチング
  const recommendations: Array<{
    workType: string;
    partnerId: string;
    partnerName: string;
    partnerEmail: string;
    skillLevel: string;
    rating: number;
    currentLoad: number;
    maxLoad: number;
    matchScore: number;
    matchReasons: string[];
    proposedFee: number;
  }> = [];

  const assignedPartnerIds = new Set<string>();

  for (const workType of unassignedWorkTypes) {
    let bestPartner = null;
    let bestScore = -1;
    let bestReasons: string[] = [];

    for (const partner of availablePartners) {
      // 既に今回のマッチングで使用済みなら低めに
      if (assignedPartnerIds.has(partner.id)) continue;

      // キャパを超えてるなら除外
      if (partner.currentLoad >= partner.maxLoad) continue;

      let score = 0;
      const reasons: string[] = [];

      // 工種マッチ（最重要）
      let partnerWorkTypes: string[] = [];
      try {
        partnerWorkTypes = JSON.parse(partner.workTypes || "[]");
      } catch {
        partnerWorkTypes = [];
      }

      if (partnerWorkTypes.includes(workType)) {
        score += 50;
        reasons.push(`「${workType}」対応可能`);
      } else {
        // 部分一致チェック
        const partialMatch = partnerWorkTypes.some(
          (pwt) => workType.includes(pwt) || pwt.includes(workType)
        );
        if (partialMatch) {
          score += 25;
          reasons.push(`「${workType}」関連スキルあり`);
        } else {
          continue; // 全く関連ない場合はスキップ
        }
      }

      // スキルレベルのスコア
      const skillScores: Record<string, number> = {
        expert: 30,
        senior: 20,
        mid: 10,
        junior: 5,
      };
      score += skillScores[partner.skillLevel] || 0;
      reasons.push(`スキル: ${partner.skillLevel}`);

      // 評価スコア
      score += partner.rating * 4;
      reasons.push(`評価: ${partner.rating}`);

      // 稼働状況
      if (partner.availableStatus === "available") {
        score += 10;
        reasons.push("対応可能");
      } else if (partner.availableStatus === "busy") {
        score += 3;
        reasons.push("繁忙中（対応は可能）");
      }

      // 負荷率（余力がある方が高スコア）
      const loadRatio = partner.currentLoad / partner.maxLoad;
      score += Math.round((1 - loadRatio) * 10);
      reasons.push(`負荷: ${partner.currentLoad}/${partner.maxLoad}`);

      if (score > bestScore) {
        bestScore = score;
        bestPartner = partner;
        bestReasons = reasons;
      }
    }

    if (bestPartner) {
      const proposedFee = Math.round(
        (project.salesAmount * DEFAULT_FEE_RATIO) / unassignedWorkTypes.length
      );

      recommendations.push({
        workType,
        partnerId: bestPartner.id,
        partnerName: bestPartner.name,
        partnerEmail: bestPartner.email,
        skillLevel: bestPartner.skillLevel,
        rating: bestPartner.rating,
        currentLoad: bestPartner.currentLoad,
        maxLoad: bestPartner.maxLoad,
        matchScore: bestScore,
        matchReasons: bestReasons,
        proposedFee,
      });

      assignedPartnerIds.add(bestPartner.id);
    }
  }

  return NextResponse.json({
    projectName: project.projectName,
    customerName: project.customer.companyName,
    requiredWorkTypes: unassignedWorkTypes,
    recommendations,
  });
}
