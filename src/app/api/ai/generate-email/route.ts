import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// メール文面をAI的に自動生成する
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, emailType, context } = body;

  if (!projectId || !emailType) {
    return NextResponse.json({ error: "projectId and emailType are required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      customer: true,
      hearingSheet: true,
      assignments: { include: { partner: true } },
      documents: true,
      qaSheets: { include: { items: true } },
      deliverables: { include: { partner: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const drafts = generateEmailDrafts(project, emailType, context || {});

  // 下書きをDBに保存
  const savedDrafts = [];
  for (const draft of drafts) {
    const saved = await prisma.emailDraft.create({
      data: {
        projectId,
        emailType: draft.emailType,
        recipientEmail: draft.recipientEmail,
        recipientName: draft.recipientName,
        subject: draft.subject,
        body: draft.body,
        attachmentInfo: draft.attachmentInfo || "",
        aiGenerated: true,
        status: "draft",
      },
    });
    savedDrafts.push(saved);
  }

  return NextResponse.json(savedDrafts, { status: 201 });
}

interface ProjectWithRelations {
  id: string;
  projectName: string;
  projectCode: string;
  pmName: string;
  salesAmount: number;
  deadline: Date | null;
  customer: { companyName: string; contactName: string; email: string };
  hearingSheet: {
    buildingType: string;
    structureType: string;
    floors: string;
    totalFloorArea: string;
    estimationScope: string;
  } | null;
  assignments: Array<{
    workType: string;
    partner: { name: string; email: string };
    proposedFee: number;
    agreedFee: number;
    feeStatus: string;
    contractStatus: string;
  }>;
  documents: Array<{ fileName: string; documentType: string; fileUrl: string; description: string }>;
  qaSheets: Array<{
    qaType: string;
    workType: string;
    status: string;
    items: Array<{ question: string; answer: string; partnerName: string; workType: string; status: string }>;
  }>;
  deliverables: Array<{
    workType: string;
    fileName: string;
    version: number;
    status: string;
    partner: { name: string; email: string };
  }>;
}

interface EmailDraftData {
  emailType: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  attachmentInfo?: string;
}

function generateEmailDrafts(
  project: ProjectWithRelations,
  emailType: string,
  context: Record<string, string>
): EmailDraftData[] {
  const pmName = project.pmName || "PM担当者";
  const projectLabel = `${project.projectName}（${project.projectCode}）`;
  const deadlineStr = project.deadline
    ? new Date(project.deadline).toLocaleDateString("ja-JP")
    : "別途ご連絡";

  switch (emailType) {
    // パートナーへの案件依頼メール
    case "partner_assignment": {
      return project.assignments
        .filter((a) => a.contractStatus === "none" || context.partnerId)
        .filter((a) => !context.partnerId || a.partner.email === context.partnerEmail)
        .map((a) => ({
          emailType: "partner_assignment",
          recipientEmail: a.partner.email,
          recipientName: a.partner.name,
          subject: `【案件依頼】${projectLabel} - ${a.workType}`,
          body: `${a.partner.name} 様

いつもお世話になっております。${pmName}です。

下記案件について、${a.workType}の積算業務をお願いしたくご連絡いたしました。

■ 案件概要
案件名：${project.projectName}
案件コード：${project.projectCode}
顧客：${project.customer.companyName}
${project.hearingSheet ? `建物用途：${project.hearingSheet.buildingType}
構造：${project.hearingSheet.structureType}
階数：${project.hearingSheet.floors}
延床面積：${project.hearingSheet.totalFloorArea}
積算範囲：${project.hearingSheet.estimationScope}` : ""}

■ ご依頼内容
担当工種：${a.workType}
報酬額：${a.proposedFee.toLocaleString()}円（税別）
納期：${deadlineStr}

ご対応可能でしたら、ご返信いただけますと幸いです。
報酬額等につきましても、ご相談させていただければと思います。

どうぞよろしくお願いいたします。

${pmName}`,
        }));
    }

    // 資料配信メール
    case "document_distribution": {
      const docName = context.documentName || "追加資料";
      const docUrl = context.documentUrl || "";
      const docDesc = context.description || "";

      return project.assignments.map((a) => ({
        emailType: "document_distribution",
        recipientEmail: a.partner.email,
        recipientName: a.partner.name,
        subject: `【資料配信】${projectLabel} - ${docName}`,
        body: `${a.partner.name} 様

いつもお世話になっております。${pmName}です。

${projectLabel}につきまして、追加資料をお送りいたします。

■ 配信資料
ファイル名：${docName}
${docDesc ? `内容：${docDesc}` : ""}
${docUrl ? `ダウンロード：${docUrl}` : "（メール添付にてお送りいたします）"}

積算作業にご活用ください。
ご不明点がございましたら、お気軽にお問い合わせください。

どうぞよろしくお願いいたします。

${pmName}`,
        attachmentInfo: docUrl ? JSON.stringify({ fileName: docName, url: docUrl }) : "",
      }));
    }

    // 質疑書を顧客に送付
    case "qa_to_customer": {
      const qaItems = project.qaSheets
        .filter((qs) => qs.status === "consolidated" || qs.status === "draft")
        .flatMap((qs) =>
          qs.items
            .filter((item) => item.status === "open")
            .map((item, idx) => `  ${idx + 1}. [${item.workType || "全般"}] ${item.question}`)
        );

      return [{
        emailType: "qa_to_customer",
        recipientEmail: project.customer.email,
        recipientName: project.customer.contactName,
        subject: `【質疑書】${projectLabel}に関するご確認事項`,
        body: `${project.customer.companyName}
${project.customer.contactName} 様

いつもお世話になっております。${pmName}です。

${projectLabel}の積算業務を進める中で、
下記の確認事項が発生いたしました。

お忙しいところ恐れ入りますが、ご確認・ご回答をお願いいたします。

■ 確認事項（${qaItems.length}件）
${qaItems.join("\n")}

ご回答は本メールへの返信、もしくは別途ご指定の方法にてお願いいたします。
回答期限：${deadlineStr}

ご不明な点がございましたら、お気軽にご連絡ください。

どうぞよろしくお願いいたします。

${pmName}`,
      }];
    }

    // 質疑回答をパートナーに配信
    case "qa_answer_distribution": {
      const answeredItems = project.qaSheets
        .filter((qs) => qs.status === "answered")
        .flatMap((qs) =>
          qs.items
            .filter((item) => item.status === "answered")
            .map((item, idx) => `  ${idx + 1}. Q: ${item.question}\n     A: ${item.answer}`)
        );

      return project.assignments.map((a) => ({
        emailType: "qa_answer_distribution",
        recipientEmail: a.partner.email,
        recipientName: a.partner.name,
        subject: `【質疑回答】${projectLabel} - 顧客回答のご連絡`,
        body: `${a.partner.name} 様

いつもお世話になっております。${pmName}です。

${projectLabel}の質疑につきまして、顧客より回答がございましたのでご連絡いたします。

■ 質疑回答
${answeredItems.join("\n\n")}

上記内容をご確認のうえ、積算作業を進めていただけますようお願いいたします。
追加のご質問がございましたら、お気軽にご連絡ください。

どうぞよろしくお願いいたします。

${pmName}`,
      }));
    }

    // 修正依頼メール
    case "revision_request": {
      const partnerEmail = context.partnerEmail || "";
      const partnerName = context.partnerName || "";
      const workType = context.workType || "";
      const revisionNotes = context.revisionNotes || "";
      const fileName = context.fileName || "";

      return [{
        emailType: "revision_request",
        recipientEmail: partnerEmail,
        recipientName: partnerName,
        subject: `【修正依頼】${projectLabel} - ${workType} 成果物の修正のお願い`,
        body: `${partnerName} 様

いつもお世話になっております。${pmName}です。

${projectLabel}の${workType}につきまして、
品質チェックの結果、下記の修正をお願いしたくご連絡いたします。

■ 対象ファイル
${fileName}

■ 修正内容
${revisionNotes}

修正完了後、改めてご提出をお願いいたします。
ご不明点がございましたら、お気軽にお問い合わせください。

どうぞよろしくお願いいたします。

${pmName}`,
      }];
    }

    // 成果物提出リマインダー
    case "deliverable_reminder": {
      return project.assignments
        .filter((a) => a.contractStatus === "signed" || a.contractStatus === "started_without_contract")
        .map((a) => ({
          emailType: "deliverable_reminder",
          recipientEmail: a.partner.email,
          recipientName: a.partner.name,
          subject: `【進捗確認】${projectLabel} - ${a.workType} 成果物のご提出について`,
          body: `${a.partner.name} 様

いつもお世話になっております。${pmName}です。

${projectLabel}の${a.workType}につきまして、
進捗状況のご確認をさせていただきたくご連絡いたしました。

■ 案件情報
案件名：${project.projectName}
担当工種：${a.workType}
納期：${deadlineStr}

成果物の作成状況はいかがでしょうか。
完了の目処が立ちましたら、ご提出をお願いいたします。

何かお困りの点やご質問がございましたら、
お気軽にご連絡ください。

どうぞよろしくお願いいたします。

${pmName}`,
        }));
    }

    // 顧客への返信・連絡
    case "customer_reply": {
      const replyContext = context.replyContext || "";
      const replyContent = context.replyContent || "";

      return [{
        emailType: "customer_reply",
        recipientEmail: project.customer.email,
        recipientName: project.customer.contactName,
        subject: `Re: ${projectLabel}について`,
        body: `${project.customer.companyName}
${project.customer.contactName} 様

いつもお世話になっております。${pmName}です。

${replyContext ? `${replyContext}につきまして、ご連絡いたします。` : `${projectLabel}につきまして、ご連絡いたします。`}

${replyContent || "（ここに返信内容を記載）"}

引き続きどうぞよろしくお願いいたします。

${pmName}`,
      }];
    }

    // 納品完了通知
    case "delivery_notification": {
      return [{
        emailType: "delivery_notification",
        recipientEmail: project.customer.email,
        recipientName: project.customer.contactName,
        subject: `【納品】${projectLabel} 積算成果物のご納品`,
        body: `${project.customer.companyName}
${project.customer.contactName} 様

いつもお世話になっております。${pmName}です。

${projectLabel}の積算成果物が完成いたしましたので、
ご納品のご連絡をさせていただきます。

■ 納品物一覧
${project.deliverables
  .filter((d) => d.status === "approved" || d.status === "integrated")
  .map((d) => `  ・${d.workType}：${d.fileName}（v${d.version}）`)
  .join("\n")}

成果物の内容をご確認いただき、
ご質問やご修正点がございましたらお知らせください。

今後ともどうぞよろしくお願いいたします。

${pmName}`,
      }];
    }

    default:
      return [];
  }
}
