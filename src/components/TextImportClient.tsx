"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import { parseNotionText } from "@/lib/notionTextParser";
import { EventType } from "@/lib/types";

interface EditableRow {
  include: boolean;
  name: string;
  eventType: EventType;
  eventDate: string;
  item: string;
  amount: string;
  location: string;
  memo: string;
}

export default function TextImportClient() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [result, setResult] = useState<{ createdPeople: number; createdGifts: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleParse() {
    setError(null);
    setResult(null);
    const parsed = parseNotionText(text);
    setRows(
      parsed.map((p) => ({
        include: true,
        name: p.name,
        eventType: p.eventType,
        eventDate: p.eventDate,
        item: p.item,
        amount: p.amount != null ? String(p.amount) : "",
        location: p.location,
        memo: p.memo,
      }))
    );
  }

  function updateRow(index: number, patch: Partial<EditableRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImport() {
    setSubmitting(true);
    setError(null);

    const importRows = rows
      .filter((r) => r.include && r.name.trim() && r.eventDate.trim())
      .map((r) => ({
        name: r.name.trim(),
        eventType: r.eventType,
        eventDate: r.eventDate,
        item: r.item,
        amount: r.amount.trim() ? Number(r.amount.replace(/,/g, "")) : null,
        location: r.location,
        memo: r.memo,
      }));

    if (importRows.length === 0) {
      setSubmitting(false);
      setError("インポート対象の行がありません(氏名・日付が必須です)。");
      return;
    }

    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: importRows }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("インポートに失敗しました。");
      return;
    }
    const data = await res.json();
    setResult(data);
    setRows([]);
    setText("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-sage-200 bg-white/60 p-4">
        <label className="text-sm font-medium">
          Notionからコピーしたテキストを貼り付け
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="mt-2 block w-full rounded border border-sage-200 bg-white px-3 py-2 font-mono text-xs"
          />
        </label>
        <p className="mt-2 text-xs text-ink/60">
          「- 日付 氏名/イベント」で始まる行を1件として自動で候補を作成します。日付・金額・種別の解析は完璧ではないため、下の表で必ず確認・修正してからインポートしてください。
        </p>
        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="mt-3 rounded bg-dusty-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          解析する
        </button>
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-sage-200 bg-white/60 p-4">
          <h2 className="mb-3 text-sm font-medium text-ink">
            候補{rows.length}件(内容を確認・修正してください)
          </h2>
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-sage-200 text-left text-ink/60">
                <th className="px-2 py-2 font-medium">対象</th>
                <th className="px-2 py-2 font-medium">氏名</th>
                <th className="px-2 py-2 font-medium">種別</th>
                <th className="px-2 py-2 font-medium">日付</th>
                <th className="px-2 py-2 font-medium">品物</th>
                <th className="px-2 py-2 font-medium">金額</th>
                <th className="px-2 py-2 font-medium">場所</th>
                <th className="px-2 py-2 font-medium">メモ</th>
                <th className="px-2 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-sage-100 last:border-b-0">
                  <td className="px-2 py-1">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) => updateRow(i, { include: e.target.checked })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(i, { name: e.target.value })}
                      className="w-32 rounded border border-sage-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select
                      value={row.eventType}
                      onChange={(e) =>
                        updateRow(i, { eventType: e.target.value as EventType })
                      }
                      className="rounded border border-sage-200 px-2 py-1"
                    >
                      {EVENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="date"
                      value={row.eventDate}
                      onChange={(e) => updateRow(i, { eventDate: e.target.value })}
                      className="w-36 rounded border border-sage-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.item}
                      onChange={(e) => updateRow(i, { item: e.target.value })}
                      className="w-48 rounded border border-sage-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.amount}
                      onChange={(e) => updateRow(i, { amount: e.target.value })}
                      className="w-24 rounded border border-sage-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.location}
                      onChange={(e) => updateRow(i, { location: e.target.value })}
                      className="w-28 rounded border border-sage-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={row.memo}
                      onChange={(e) => updateRow(i, { memo: e.target.value })}
                      className="w-28 rounded border border-sage-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => removeRow(i)}
                      className="text-coral-500 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={submitting}
              className="rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-50"
            >
              インポート実行
            </button>
            {error && <span className="text-sm text-coral-500">{error}</span>}
          </div>
        </div>
      )}

      {result && (
        <p className="rounded-lg border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-600">
          完了しました。新規人物 {result.createdPeople}件 / 贈答記録 {result.createdGifts}件を登録しました。
        </p>
      )}
    </div>
  );
}
