"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RELATIONSHIP_SUGGESTIONS } from "@/lib/constants";

export default function PersonForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        relationship,
        birthDate: birthDate || null,
        notes,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("登録に失敗しました。入力内容を確認してください。");
      return;
    }
    setName("");
    setRelationship("");
    setBirthDate("");
    setNotes("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-sage-200 bg-white/60 p-4 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        氏名
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
          placeholder="山田花子"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        続柄
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          list="relationship-suggestions"
          className="rounded border border-sage-200 bg-white px-3 py-2"
          placeholder="叔母"
        />
        <datalist id="relationship-suggestions">
          {RELATIONSHIP_SUGGESTIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        誕生日
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        メモ
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-50"
        >
          追加する
        </button>
        {error && <span className="text-sm text-coral-500">{error}</span>}
      </div>
    </form>
  );
}
