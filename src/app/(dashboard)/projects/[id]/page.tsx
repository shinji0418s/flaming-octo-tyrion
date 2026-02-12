"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  PROJECT_STATUSES,
  FEE_STATUSES,
  CONTRACT_STATUSES,
  WORK_STATUSES,
  DELIVERABLE_STATUSES,
  QA_STATUSES,
  SKILL_LEVELS,
} from "@/lib/constants";

interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  status: string;
  pmName: string;
  salesAmount: number;
  googleDriveUrl: string;
  deadline: string | null;
  startDate: string | null;
  deliveredAt: string | null;
  notes: string;
  customer: { id: string; companyName: string; contactName: string; email: string };
  hearingSheet: HearingSheet | null;
  assignments: Assignment[];
  documents: Document[];
  qaSheets: QASheet[];
  deliverables: Deliverable[];
  notifications: Notification[];
}

interface HearingSheet {
  id: string;
  buildingType: string;
  structureType: string;
  floors: string;
  totalFloorArea: string;
  estimationScope: string;
  requiredWorkTypes: string;
  drawingFormat: string;
  softwarePreference: string;
  deadline: string | null;
  specialNotes: string;
  customerRequests: string;
  status: string;
}

interface Assignment {
  id: string;
  partnerId: string;
  partner: { id: string; name: string; email: string; skillLevel: string; workTypes: string };
  workType: string;
  proposedFee: number;
  agreedFee: number;
  feeStatus: string;
  contractStatus: string;
  workStatus: string;
  notes: string;
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  description: string;
  distributedToAll: boolean;
  distributedAt: string | null;
  createdAt: string;
}

interface QASheet {
  id: string;
  qaType: string;
  workType: string;
  status: string;
  items: QAItem[];
}

interface QAItem {
  id: string;
  questionNumber: number;
  partnerName: string;
  workType: string;
  question: string;
  answer: string;
  status: string;
}

interface Deliverable {
  id: string;
  partnerId: string;
  partner: { name: string };
  workType: string;
  fileName: string;
  fileUrl: string;
  version: number;
  status: string;
  needsQC: boolean;
  qcReviewerName: string;
  qcNotes: string;
  revisions: Revision[];
}

interface Revision {
  id: string;
  revisionNumber: number;
  revisionNotes: string;
  responseNotes: string;
  fileName: string;
  status: string;
}

interface Notification {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  sentAt: string;
}

const WORKFLOW_STEPS = [
  { key: "hearing", label: "④ ヒアリング", statuses: ["hearing"] },
  { key: "partner", label: "⑤ パートナー選定", statuses: ["partner_selection"] },
  { key: "negotiation", label: "⑥ 報酬交渉", statuses: ["negotiation"] },
  { key: "contract", label: "⑦ 契約", statuses: ["contract"] },
  { key: "progress", label: "⑧ 案件進行", statuses: ["in_progress"] },
  { key: "qa", label: "⑧⑨ 質疑対応", statuses: ["qa", "in_progress"] },
  { key: "qc", label: "⑩⑪ 品質チェック", statuses: ["qc_review"] },
  { key: "integration", label: "⑫ 統合・納品", statuses: ["integration", "delivered"] },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const fetchProject = () => {
    fetch(`/api/projects/${params.id}`)
      .then((r) => r.json())
      .then(setProject)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !project) {
    return <div className="p-8 text-gray-500">読み込み中...</div>;
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) =>
    s.statuses.includes(project.status)
  );

  const tabs = [
    { key: "overview", label: "概要" },
    { key: "hearing", label: "④ ヒアリング" },
    { key: "partners", label: "⑤⑥⑦ パートナー" },
    { key: "documents", label: "⑨ 資料配信" },
    { key: "qa", label: "⑧⑨ 質疑管理" },
    { key: "deliverables", label: "⑩⑪⑫ 成果物" },
    { key: "notifications", label: "通知ログ" },
  ];

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/projects" className="hover:text-blue-600">案件管理</Link>
          <span>/</span>
          <span>{project.projectCode}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {project.customer.companyName} / PM: {project.pmName || "未定"}
              {project.salesAmount > 0 && ` / 売上: ${project.salesAmount.toLocaleString()}円`}
            </p>
          </div>
          <StatusBadge status={project.status} labels={PROJECT_STATUSES} />
        </div>
      </div>

      {/* ワークフロー進行バー */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          {WORKFLOW_STEPS.map((step, idx) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx < currentStepIndex ? "bg-green-500 text-white" :
                  idx === currentStepIndex ? "bg-blue-600 text-white" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {idx < currentStepIndex ? "✓" : idx + 4}
                </div>
                <span className={`text-xs mt-1 text-center ${
                  idx === currentStepIndex ? "font-bold text-blue-600" : "text-gray-500"
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className={`h-0.5 w-full mx-1 ${
                  idx < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === "overview" && <OverviewTab project={project} />}
      {activeTab === "hearing" && <HearingTab project={project} onUpdate={fetchProject} />}
      {activeTab === "partners" && <PartnersTab project={project} onUpdate={fetchProject} />}
      {activeTab === "documents" && <DocumentsTab project={project} onUpdate={fetchProject} />}
      {activeTab === "qa" && <QATab project={project} onUpdate={fetchProject} />}
      {activeTab === "deliverables" && <DeliverablesTab project={project} onUpdate={fetchProject} />}
      {activeTab === "notifications" && <NotificationsTab project={project} />}
    </div>
  );
}

// ===== 概要タブ =====
function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">案件情報</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">案件コード</dt><dd className="font-mono">{project.projectCode}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">顧客</dt><dd>{project.customer.companyName}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">顧客担当</dt><dd>{project.customer.contactName}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">売上金額</dt><dd>{project.salesAmount.toLocaleString()}円</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">PM担当</dt><dd>{project.pmName || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">納期</dt><dd>{project.deadline ? new Date(project.deadline).toLocaleDateString("ja-JP") : "-"}</dd></div>
          {project.googleDriveUrl && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Google Drive</dt>
              <dd><a href={project.googleDriveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">リンクを開く</a></dd>
            </div>
          )}
        </dl>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">進行サマリー</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">パートナー数</dt><dd>{project.assignments.length}名</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">資料数</dt><dd>{project.documents.length}件</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">質疑書</dt><dd>{project.qaSheets.length}件</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">成果物</dt><dd>{project.deliverables.length}件</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">開始日</dt><dd>{project.startDate ? new Date(project.startDate).toLocaleDateString("ja-JP") : "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">納品日</dt><dd>{project.deliveredAt ? new Date(project.deliveredAt).toLocaleDateString("ja-JP") : "-"}</dd></div>
        </dl>
      </div>
    </div>
  );
}

// ===== ④ ヒアリングタブ =====
function HearingTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const hs = project.hearingSheet;
  const [form, setForm] = useState({
    buildingType: hs?.buildingType || "",
    structureType: hs?.structureType || "",
    floors: hs?.floors || "",
    totalFloorArea: hs?.totalFloorArea || "",
    estimationScope: hs?.estimationScope || "",
    requiredWorkTypes: hs?.requiredWorkTypes || "[]",
    drawingFormat: hs?.drawingFormat || "",
    softwarePreference: hs?.softwarePreference || "",
    specialNotes: hs?.specialNotes || "",
    customerRequests: hs?.customerRequests || "",
    status: hs?.status || "draft",
  });

  const handleSave = async () => {
    await fetch(`/api/projects/${project.id}/hearing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "completed" }),
    });
    onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">ヒアリングシート</h3>
        {hs && <StatusBadge status={hs.status} labels={{ draft: "下書き", completed: "完了" }} />}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">建物用途</label>
          <input type="text" value={form.buildingType} onChange={(e) => setForm({ ...form, buildingType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="事務所、共同住宅 等" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">構造</label>
          <input type="text" value={form.structureType} onChange={(e) => setForm({ ...form, structureType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="RC造、S造 等" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">階数</label>
          <input type="text" value={form.floors} onChange={(e) => setForm({ ...form, floors: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="地上5階 地下1階" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">延床面積</label>
          <input type="text" value={form.totalFloorArea} onChange={(e) => setForm({ ...form, totalFloorArea: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="5,000㎡" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">図面形式</label>
          <input type="text" value={form.drawingFormat} onChange={(e) => setForm({ ...form, drawingFormat: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="PDF, CAD 等" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">使用ソフト指定</label>
          <input type="text" value={form.softwarePreference} onChange={(e) => setForm({ ...form, softwarePreference: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Excel, 建築積算ソフト 等" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">積算範囲（工種）</label>
          <textarea value={form.estimationScope} onChange={(e) => setForm({ ...form, estimationScope: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="建築、構造、電気設備、機械設備 等" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">特記事項</label>
          <textarea value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">お客様要望</label>
          <textarea value={form.customerRequests} onChange={(e) => setForm({ ...form, customerRequests: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
        </div>
      </div>
      <div className="mt-4">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          {hs ? "更新してパートナー選定へ" : "保存してパートナー選定へ"}
        </button>
      </div>
    </div>
  );
}

// ===== ⑤⑥⑦ パートナータブ =====
function PartnersTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [partners, setPartners] = useState<Array<{ id: string; name: string; email: string; skillLevel: string; workTypes: string; availableStatus: string; currentLoad: number; maxLoad: number; rating: number }>>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ partnerId: "", workType: "", proposedFee: "" });

  useEffect(() => {
    fetch("/api/partners?available=true").then((r) => r.json()).then(setPartners);
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${project.id}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerId: assignForm.partnerId,
        workType: assignForm.workType,
        proposedFee: assignForm.proposedFee ? parseFloat(assignForm.proposedFee) : undefined,
      }),
    });
    setShowAssignForm(false);
    setAssignForm({ partnerId: "", workType: "", proposedFee: "" });
    onUpdate();
  };

  const updateAssignment = async (assignmentId: string, data: Record<string, unknown>) => {
    await fetch(`/api/assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onUpdate();
  };

  const parseWorkTypes = (json: string): string[] => {
    try { return JSON.parse(json); } catch { return []; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">パートナーアサイン・報酬交渉・契約管理</h3>
        <button onClick={() => setShowAssignForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + パートナーをアサイン
        </button>
      </div>

      {showAssignForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-medium mb-4">パートナー選定</h4>
          <p className="text-sm text-gray-500 mb-4">案件売上: {project.salesAmount.toLocaleString()}円 / 推奨報酬（50%）: {Math.round(project.salesAmount * 0.5).toLocaleString()}円</p>
          <form onSubmit={handleAssign} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パートナー *</label>
              <select required value={assignForm.partnerId} onChange={(e) => setAssignForm({ ...assignForm, partnerId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">選択</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({SKILL_LEVELS[p.skillLevel as keyof typeof SKILL_LEVELS]}) - {parseWorkTypes(p.workTypes).join(",")} [{p.currentLoad}/{p.maxLoad}]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">担当工種 *</label>
              <input type="text" required value={assignForm.workType} onChange={(e) => setAssignForm({ ...assignForm, workType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="建築" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">報酬額（空欄=自動50%）</label>
              <input type="number" value={assignForm.proposedFee} onChange={(e) => setAssignForm({ ...assignForm, proposedFee: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">アサイン</button>
              <button type="button" onClick={() => setShowAssignForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {/* アサイン済みパートナー一覧 */}
      {project.assignments.map((a) => (
        <div key={a.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{a.partner.name}</h4>
              <p className="text-sm text-gray-500">{a.partner.email} / 担当工種: {a.workType}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={a.feeStatus} labels={FEE_STATUSES} />
              <StatusBadge status={a.contractStatus} labels={CONTRACT_STATUSES} />
              <StatusBadge status={a.workStatus} labels={WORK_STATUSES} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            {/* ⑥ 報酬交渉 */}
            <div className="border rounded-lg p-3">
              <h5 className="font-medium text-gray-700 mb-2">⑥ 報酬交渉</h5>
              <p className="text-gray-500">提示額: {a.proposedFee.toLocaleString()}円</p>
              <p className="text-gray-500">合意額: {a.agreedFee > 0 ? `${a.agreedFee.toLocaleString()}円` : "-"}</p>
              {a.feeStatus !== "agreed" && (
                <div className="mt-2 flex gap-1">
                  <input type="number" placeholder="合意額" id={`fee-${a.id}`} className="flex-1 border rounded px-2 py-1 text-sm" />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`fee-${a.id}`) as HTMLInputElement;
                      if (input.value) {
                        updateAssignment(a.id, { agreedFee: parseFloat(input.value), feeStatus: "agreed" });
                      }
                    }}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                  >
                    合意
                  </button>
                </div>
              )}
            </div>

            {/* ⑦ 契約管理 */}
            <div className="border rounded-lg p-3">
              <h5 className="font-medium text-gray-700 mb-2">⑦ 契約管理</h5>
              <div className="space-y-1">
                {a.contractStatus === "none" && (
                  <div className="flex gap-1">
                    <button onClick={() => updateAssignment(a.id, { contractStatus: "sent", contractSentAt: new Date().toISOString() })} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                      契約書送付
                    </button>
                    <button onClick={() => updateAssignment(a.id, { contractStatus: "started_without_contract" })} className="px-2 py-1 bg-orange-500 text-white rounded text-xs">
                      契約前開始
                    </button>
                  </div>
                )}
                {a.contractStatus === "sent" && (
                  <button onClick={() => updateAssignment(a.id, { contractStatus: "signed", contractSignedAt: new Date().toISOString() })} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                    署名完了
                  </button>
                )}
              </div>
            </div>

            {/* 作業ステータス */}
            <div className="border rounded-lg p-3">
              <h5 className="font-medium text-gray-700 mb-2">作業進捗</h5>
              <select
                value={a.workStatus}
                onChange={(e) => updateAssignment(a.id, { workStatus: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                {Object.entries(WORK_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== ⑨ 資料配信タブ =====
function DocumentsTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fileName: "", documentType: "drawing", fileUrl: "", description: "", distributeToAll: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${project.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ fileName: "", documentType: "drawing", fileUrl: "", description: "", distributeToAll: true });
    onUpdate();
  };

  const docTypeLabels: Record<string, string> = {
    drawing: "図面",
    specification: "仕様書",
    reference: "参考資料",
    additional_info: "追加情報",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">資料・図面管理（追加図面の配信）</h3>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + 資料を追加
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ファイル名 *</label>
              <input type="text" required value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">資料種類</label>
              <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {Object.entries(docTypeLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ファイルURL</label>
              <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Google Drive等のリンク" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.distributeToAll} onChange={(e) => setForm({ ...form, distributeToAll: e.target.checked })} />
                全パートナーに配信する（メール通知）
              </label>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">追加・配信</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ファイル名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種類</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">説明</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">配信</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {project.documents.map((d) => (
              <tr key={d.id}>
                <td className="px-6 py-4 text-sm">
                  {d.fileUrl ? <a href={d.fileUrl} className="text-blue-600 hover:underline">{d.fileName}</a> : d.fileName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{docTypeLabels[d.documentType] || d.documentType}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{d.description || "-"}</td>
                <td className="px-6 py-4 text-sm">
                  {d.distributedToAll
                    ? <span className="text-green-600">全員配信済み</span>
                    : <span className="text-gray-400">未配信</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(d.createdAt).toLocaleString("ja-JP")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== ⑧⑨ 質疑管理タブ =====
function QATab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ qaType: "question", workType: "", items: [{ question: "", partnerName: "", workType: "" }] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${project.id}/qa-sheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qaType: form.qaType,
        workType: form.workType,
        items: form.items.filter((i) => i.question.trim()),
      }),
    });
    setShowForm(false);
    setForm({ qaType: "question", workType: "", items: [{ question: "", partnerName: "", workType: "" }] });
    onUpdate();
  };

  const updateQAStatus = async (qaId: string, status: string) => {
    await fetch(`/api/qa-sheets/${qaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onUpdate();
  };

  const updateAnswer = async (qaId: string, itemId: string, answer: string) => {
    await fetch(`/api/qa-sheets/${qaId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, answer }),
    });
    onUpdate();
  };

  const qaTypeLabels: Record<string, string> = { question: "質疑書", pre_confirmation: "事前確認書" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">質疑書・事前確認書管理</h3>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + 質疑書を作成
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
                <select value={form.qaType} onChange={(e) => setForm({ ...form, qaType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {Object.entries(qaTypeLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工種カテゴリ</label>
                <input type="text" value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">質疑項目</label>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                  <input type="text" placeholder="パートナー名" value={item.partnerName} onChange={(e) => { const items = [...form.items]; items[idx].partnerName = e.target.value; setForm({ ...form, items }); }} className="border rounded px-2 py-1 text-sm" />
                  <input type="text" placeholder="工種" value={item.workType} onChange={(e) => { const items = [...form.items]; items[idx].workType = e.target.value; setForm({ ...form, items }); }} className="border rounded px-2 py-1 text-sm" />
                  <input type="text" placeholder="質疑内容 *" required value={item.question} onChange={(e) => { const items = [...form.items]; items[idx].question = e.target.value; setForm({ ...form, items }); }} className="col-span-2 border rounded px-2 py-1 text-sm" />
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, items: [...form.items, { question: "", partnerName: "", workType: "" }] })} className="text-sm text-blue-600 hover:underline">
                + 質疑を追加
              </button>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">作成</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {project.qaSheets.map((qa) => (
        <div key={qa.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">{qaTypeLabels[qa.qaType] || qa.qaType} - {qa.workType || "全般"}</h4>
              <p className="text-sm text-gray-500">{qa.items.length}件の質疑</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={qa.status} labels={QA_STATUSES} />
              {qa.status === "draft" && (
                <button onClick={() => updateQAStatus(qa.id, "consolidated")} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">統合完了</button>
              )}
              {qa.status === "consolidated" && (
                <button onClick={() => updateQAStatus(qa.id, "sent_to_customer")} className="px-3 py-1 bg-yellow-600 text-white rounded text-xs">顧客に送付</button>
              )}
              {qa.status === "sent_to_customer" && (
                <button onClick={() => updateQAStatus(qa.id, "answered")} className="px-3 py-1 bg-green-600 text-white rounded text-xs">回答受領</button>
              )}
              {qa.status === "answered" && (
                <button onClick={() => updateQAStatus(qa.id, "distributed")} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">全パートナーに配信</button>
              )}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs">No.</th>
                <th className="px-3 py-2 text-left text-xs">パートナー</th>
                <th className="px-3 py-2 text-left text-xs">工種</th>
                <th className="px-3 py-2 text-left text-xs">質疑内容</th>
                <th className="px-3 py-2 text-left text-xs">回答</th>
                <th className="px-3 py-2 text-left text-xs">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {qa.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.questionNumber}</td>
                  <td className="px-3 py-2 text-gray-600">{item.partnerName || "-"}</td>
                  <td className="px-3 py-2 text-gray-600">{item.workType || "-"}</td>
                  <td className="px-3 py-2">{item.question}</td>
                  <td className="px-3 py-2">
                    {item.answer ? (
                      <span className="text-green-700">{item.answer}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="回答を入力"
                        className="border rounded px-2 py-1 text-sm w-full"
                        onBlur={(e) => {
                          if (e.target.value) updateAnswer(qa.id, item.id, e.target.value);
                        }}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={item.status} labels={{ open: "未回答", answered: "回答済" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ===== ⑩⑪⑫ 成果物タブ =====
function DeliverablesTab({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ partnerId: "", workType: "", fileName: "", fileUrl: "", needsQC: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${project.id}/deliverables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ partnerId: "", workType: "", fileName: "", fileUrl: "", needsQC: true });
    onUpdate();
  };

  const updateDeliverable = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/deliverables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onUpdate();
  };

  const requestRevision = async (deliverableId: string) => {
    const notes = prompt("修正指示内容を入力してください");
    if (!notes) return;
    await fetch(`/api/deliverables/${deliverableId}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionNotes: notes }),
    });
    onUpdate();
  };

  const markProjectDelivered = async () => {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered", deliveredAt: new Date().toISOString() }),
    });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">成果物管理・品質チェック・統合</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            + 成果物を登録
          </button>
          {project.status === "integration" && (
            <button onClick={markProjectDelivered} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              統合完了・顧客に納品
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">パートナー *</label>
              <select required value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">選択</option>
                {project.assignments.map((a) => (
                  <option key={a.partner.id} value={a.partner.id}>{a.partner.name} ({a.workType})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工種 *</label>
              <input type="text" required value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ファイル名 *</label>
              <input type="text" required value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ファイルURL</label>
              <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.needsQC} onChange={(e) => setForm({ ...form, needsQC: e.target.checked })} />
                品質チェックが必要
              </label>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">登録</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {project.deliverables.map((d) => (
        <div key={d.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{d.fileName} <span className="text-gray-400 text-sm">v{d.version}</span></h4>
              <p className="text-sm text-gray-500">{d.partner.name} / {d.workType}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={d.status} labels={DELIVERABLE_STATUSES} />
              {d.status === "qc_review" && (
                <div className="flex gap-1">
                  <button onClick={() => updateDeliverable(d.id, { status: "approved" })} className="px-2 py-1 bg-green-600 text-white rounded text-xs">承認</button>
                  <button onClick={() => requestRevision(d.id)} className="px-2 py-1 bg-orange-600 text-white rounded text-xs">修正依頼</button>
                </div>
              )}
              {d.status === "revision_submitted" && (
                <div className="flex gap-1">
                  <button onClick={() => updateDeliverable(d.id, { status: "approved" })} className="px-2 py-1 bg-green-600 text-white rounded text-xs">承認</button>
                  <button onClick={() => requestRevision(d.id)} className="px-2 py-1 bg-orange-600 text-white rounded text-xs">再修正</button>
                </div>
              )}
              {d.status === "approved" && (
                <button onClick={() => updateDeliverable(d.id, { status: "integrated" })} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">統合済み</button>
              )}
            </div>
          </div>

          {/* 修正履歴 */}
          {d.revisions.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">修正履歴</h5>
              {d.revisions.map((r) => (
                <div key={r.id} className="flex items-start gap-3 text-sm py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 font-mono">#{r.revisionNumber}</span>
                  <div className="flex-1">
                    <p className="text-gray-700">指示: {r.revisionNotes}</p>
                    {r.responseNotes && <p className="text-green-700">回答: {r.responseNotes}</p>}
                  </div>
                  <StatusBadge status={r.status} labels={{ requested: "依頼中", submitted: "提出済", approved: "承認" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== 通知ログタブ =====
function NotificationsTab({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種類</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">宛先</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">件名</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {project.notifications.map((n) => (
            <tr key={n.id}>
              <td className="px-6 py-4 text-sm text-gray-600">{new Date(n.sentAt).toLocaleString("ja-JP")}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{n.type}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{n.recipient}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{n.subject}</td>
            </tr>
          ))}
          {project.notifications.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">通知ログはありません</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
