// プロジェクトステータス
export const PROJECT_STATUSES = {
  hearing: "ヒアリング",
  partner_selection: "パートナー選定",
  negotiation: "報酬交渉",
  contract: "契約手続き",
  in_progress: "案件進行中",
  qa: "質疑対応中",
  qc_review: "品質チェック中",
  integration: "成果物統合中",
  delivered: "納品済み",
  completed: "完了",
} as const;

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  hearing: "bg-blue-100 text-blue-800",
  partner_selection: "bg-purple-100 text-purple-800",
  negotiation: "bg-yellow-100 text-yellow-800",
  contract: "bg-orange-100 text-orange-800",
  in_progress: "bg-cyan-100 text-cyan-800",
  qa: "bg-pink-100 text-pink-800",
  qc_review: "bg-red-100 text-red-800",
  integration: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

// 工種一覧
export const WORK_TYPES = [
  "建築",
  "構造",
  "電気設備",
  "機械設備",
  "給排水衛生設備",
  "空調換気設備",
  "外構",
  "杭工事",
  "土工事",
  "鉄骨工事",
  "内装工事",
  "防水工事",
  "塗装工事",
  "金属工事",
  "木工事",
  "左官工事",
  "タイル工事",
  "ガラス工事",
  "その他",
] as const;

// スキルレベル
export const SKILL_LEVELS = {
  junior: "ジュニア",
  mid: "ミドル",
  senior: "シニア",
  expert: "エキスパート",
} as const;

// パートナー稼働状況
export const AVAILABILITY_STATUSES = {
  available: "対応可能",
  busy: "繁忙",
  unavailable: "対応不可",
} as const;

// 報酬ステータス
export const FEE_STATUSES = {
  pending: "未提示",
  proposed: "提示済み",
  negotiating: "交渉中",
  agreed: "合意済み",
} as const;

// 契約ステータス
export const CONTRACT_STATUSES = {
  none: "未送付",
  sent: "送付済み",
  signed: "署名済み",
  started_without_contract: "契約前開始",
} as const;

// 作業ステータス
export const WORK_STATUSES = {
  not_started: "未着手",
  in_progress: "作業中",
  submitted: "提出済み",
  revision: "修正中",
  completed: "完了",
} as const;

// 成果物ステータス
export const DELIVERABLE_STATUSES = {
  submitted: "提出済み",
  qc_review: "品質チェック中",
  revision_requested: "修正依頼中",
  revision_submitted: "修正提出済み",
  approved: "承認済み",
  integrated: "統合済み",
} as const;

// 質疑ステータス
export const QA_STATUSES = {
  draft: "下書き",
  consolidated: "統合済み",
  sent_to_customer: "顧客送付済み",
  answered: "回答済み",
  distributed: "配信済み",
} as const;

// 報酬計算のデフォルト比率
export const DEFAULT_FEE_RATIO = 0.5;
