"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { SKILL_LEVELS, AVAILABILITY_STATUSES, WORK_TYPES } from "@/lib/constants";

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  skillLevel: string;
  workTypes: string;
  specialties: string;
  availableStatus: string;
  currentLoad: number;
  maxLoad: number;
  rating: number;
  isActive: boolean;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skillLevel: "mid",
    workTypes: [] as string[],
    specialties: "",
    maxLoad: "3",
  });

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then(setPartners)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        workTypes: JSON.stringify(form.workTypes),
        maxLoad: parseInt(form.maxLoad),
      }),
    });
    if (res.ok) {
      const newPartner = await res.json();
      setPartners((prev) => [newPartner, ...prev]);
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", skillLevel: "mid", workTypes: [], specialties: "", maxLoad: "3" });
    }
  };

  const toggleWorkType = (wt: string) => {
    setForm((prev) => ({
      ...prev,
      workTypes: prev.workTypes.includes(wt)
        ? prev.workTypes.filter((w) => w !== wt)
        : [...prev.workTypes, wt],
    }));
  };

  const parseWorkTypes = (json: string): string[] => {
    try { return JSON.parse(json); } catch { return []; }
  };

  if (loading) return <div className="p-8 text-gray-500">読み込み中...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">パートナー管理</h1>
          <p className="text-sm text-gray-500 mt-1">全{partners.length}名</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + 新規パートナー
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">新規パートナー登録</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名 *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メール *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">スキルレベル</label>
              <select value={form.skillLevel} onChange={(e) => setForm({ ...form, skillLevel: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {Object.entries(SKILL_LEVELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大同時案件数</label>
              <input type="number" value={form.maxLoad} onChange={(e) => setForm({ ...form, maxLoad: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">得意分野</label>
              <input type="text" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">対応可能な工種</label>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map((wt) => (
                  <button key={wt} type="button" onClick={() => toggleWorkType(wt)} className={`px-3 py-1 rounded-full text-xs font-medium border ${form.workTypes.includes(wt) ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {wt}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">登録</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {partners.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.email} {p.phone && `/ ${p.phone}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.skillLevel} labels={SKILL_LEVELS} />
                <StatusBadge status={p.availableStatus} labels={AVAILABILITY_STATUSES} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>稼働: {p.currentLoad}/{p.maxLoad}件</span>
              <span>評価: {"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))} ({p.rating})</span>
              {p.specialties && <span>得意: {p.specialties}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {parseWorkTypes(p.workTypes).map((wt) => (
                <span key={wt} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{wt}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
