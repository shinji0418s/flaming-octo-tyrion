"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { PROJECT_STATUSES } from "@/lib/constants";

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
}

interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  status: string;
  pmName: string;
  salesAmount: number;
  deadline: string | null;
  createdAt: string;
  customer: { companyName: string };
  assignments: { partner: { name: string }; workType: string }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    projectName: "",
    projectCode: "",
    customerId: "",
    salesAmount: "",
    pmName: "",
    deadline: "",
    googleDriveUrl: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProjects(p);
      setCustomers(c);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        salesAmount: parseFloat(form.salesAmount) || 0,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      }),
    });
    if (res.ok) {
      const newProject = await res.json();
      setProjects((prev) => [newProject, ...prev]);
      setShowForm(false);
      setForm({ projectName: "", projectCode: "", customerId: "", salesAmount: "", pmName: "", deadline: "", googleDriveUrl: "" });
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案件管理</h1>
          <p className="text-sm text-gray-500 mt-1">全{projects.length}件</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + 新規案件
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">新規案件作成</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">案件コード *</label>
              <input type="text" required value={form.projectCode} onChange={(e) => setForm({ ...form, projectCode: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="PRJ-2026-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">案件名 *</label>
              <input type="text" required value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顧客 *</label>
              <select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">選択してください</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">売上金額</label>
              <input type="number" value={form.salesAmount} onChange={(e) => setForm({ ...form, salesAmount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="1000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PM担当者</label>
              <input type="text" value={form.pmName} onChange={(e) => setForm({ ...form, pmName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">納期</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive URL</label>
              <input type="url" value={form.googleDriveUrl} onChange={(e) => setForm({ ...form, googleDriveUrl: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">作成</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件コード</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">売上</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">期限</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/projects/${p.id}`} className="text-blue-600 hover:underline font-mono text-sm">{p.projectCode}</Link>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.projectName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.customer.companyName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.salesAmount.toLocaleString()}円</td>
                <td className="px-6 py-4"><StatusBadge status={p.status} labels={PROJECT_STATUSES} /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.pmName || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.deadline ? new Date(p.deadline).toLocaleDateString("ja-JP") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
