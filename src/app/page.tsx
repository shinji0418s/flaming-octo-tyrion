"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { PROJECT_STATUSES } from "@/lib/constants";

interface ProjectSummary {
  id: string;
  projectName: string;
  projectCode: string;
  status: string;
  pmName: string;
  salesAmount: number;
  deadline: string | null;
  customer: { companyName: string };
  assignments: { partner: { name: string }; workType: string; workStatus: string }[];
  _count: { documents: number; qaSheets: number; deliverables: number };
}

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const activeProjects = projects.filter(
    (p) => !["completed", "delivered"].includes(p.status)
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">案件の進行状況を一覧で確認できます</p>
      </div>

      {/* ステータス別サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(PROJECT_STATUSES).map(([key, label]) => (
          <div key={key} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-gray-900">{statusCounts[key] || 0}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* 進行中案件一覧 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">進行中の案件</h2>
          <Link
            href="/projects"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            全件表示 &rarr;
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            進行中の案件はありません。
            <Link href="/projects" className="text-blue-600 hover:underline ml-2">
              新規案件を作成
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件コード</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">パートナー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期限</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/projects/${project.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                        {project.projectCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.projectName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.customer.companyName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} labels={PROJECT_STATUSES} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.pmName || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.assignments.length > 0
                        ? project.assignments.map((a) => a.partner.name).join(", ")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString("ja-JP")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
