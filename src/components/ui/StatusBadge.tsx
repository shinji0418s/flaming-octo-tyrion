"use client";

interface StatusBadgeProps {
  status: string;
  labels: Record<string, string>;
  colors?: Record<string, string>;
}

const defaultColors: Record<string, string> = {
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
  draft: "bg-gray-100 text-gray-600",
  consolidated: "bg-blue-100 text-blue-800",
  sent_to_customer: "bg-yellow-100 text-yellow-800",
  answered: "bg-green-100 text-green-800",
  distributed: "bg-purple-100 text-purple-800",
  pending: "bg-gray-100 text-gray-600",
  proposed: "bg-blue-100 text-blue-800",
  negotiating: "bg-yellow-100 text-yellow-800",
  agreed: "bg-green-100 text-green-800",
  none: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-800",
  signed: "bg-green-100 text-green-800",
  started_without_contract: "bg-red-100 text-red-800",
  not_started: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-800",
  revision: "bg-orange-100 text-orange-800",
  revision_requested: "bg-orange-100 text-orange-800",
  revision_submitted: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  integrated: "bg-purple-100 text-purple-800",
  available: "bg-green-100 text-green-800",
  busy: "bg-yellow-100 text-yellow-800",
  unavailable: "bg-red-100 text-red-800",
  open: "bg-blue-100 text-blue-800",
  requested: "bg-orange-100 text-orange-800",
  failed: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status, labels, colors }: StatusBadgeProps) {
  const colorMap = colors ?? defaultColors;
  const color = colorMap[status] ?? "bg-gray-100 text-gray-800";
  const label = labels[status] ?? status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
