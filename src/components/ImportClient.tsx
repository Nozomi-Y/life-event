"use client";

import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { EventType } from "@/lib/types";

type TargetField =
  | "name"
  | "relationship"
  | "birthDate"
  | "eventType"
  | "eventDate"
  | "item"
  | "amount"
  | "location"
  | "memo";

const TARGET_FIELDS: { key: TargetField; label: string; required: boolean }[] = [
  { key: "name", label: "氏名", required: true },
  { key: "relationship", label: "続柄", required: false },
  { key: "birthDate", label: "誕生日", required: false },
  { key: "eventType", label: "種別", required: true },
  { key: "eventDate", label: "贈った日付", required: true },
  { key: "item", label: "品物", required: false },
  { key: "amount", label: "金額", required: false },
  { key: "location", label: "場所", required: false },
  { key: "memo", label: "メモ", required: false },
];

const EVENT_TYPE_ENTRIES = Object.entries(EVENT_TYPE_LABELS) as [EventType, string][];

function guessEventType(raw: string): EventType {
  const trimmed = raw.trim();
  const exact = EVENT_TYPE_ENTRIES.find(([, label]) => label === trimmed);
  if (exact) return exact[0];
  const partial = EVENT_TYPE_ENTRIES.find(
    ([, label]) => trimmed.includes(label) || label.includes(trimmed)
  );
  if (partial) return partial[0];
  return "other";
}

export default function ImportClient() {
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<TargetField, string>>({
    name: "",
    relationship: "",
    birthDate: "",
    eventType: "",
    eventDate: "",
    item: "",
    amount: "",
    location: "",
    memo: "",
  });
  const [result, setResult] = useState<{ createdPeople: number; createdGifts: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFile(file: File) {
    setError(null);
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        setHeaders(fields);
        setRows(results.data);

        const auto: Record<TargetField, string> = { ...mapping };
        for (const field of TARGET_FIELDS) {
          const found = fields.find((h) => h.includes(field.label));
          if (found) auto[field.key] = found;
        }
        setMapping(auto);
      },
      error: (err) => setError(`CSVの読み込みに失敗しました: ${err.message}`),
    });
  }

  const previewRows = rows.slice(0, 5);

  function buildImportRows() {
    return rows
      .map((row) => {
        const name = mapping.name ? row[mapping.name]?.trim() : "";
        const eventDate = mapping.eventDate ? row[mapping.eventDate]?.trim() : "";
        if (!name || !eventDate) return null;
        const amountRaw = mapping.amount ? row[mapping.amount] : "";
        const amountNum = amountRaw ? Number(amountRaw.replace(/[^\d.-]/g, "")) : null;
        return {
          name,
          relationship: mapping.relationship ? row[mapping.relationship]?.trim() : "",
          birthDate: mapping.birthDate ? row[mapping.birthDate]?.trim() : "",
          eventType: mapping.eventType ? guessEventType(row[mapping.eventType] ?? "") : "other",
          eventDate,
          item: mapping.item ? row[mapping.item]?.trim() : "",
          amount: amountNum != null && !Number.isNaN(amountNum) ? amountNum : null,
          location: mapping.location ? row[mapping.location]?.trim() : "",
          memo: mapping.memo ? row[mapping.memo]?.trim() : "",
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }

  async function handleImport() {
    setSubmitting(true);
    setError(null);
    const importRows = buildImportRows();
    const skipped = rows.length - importRows.length;

    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: importRows }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("インポートに失敗しました。列の対応を確認してください。");
      return;
    }
    const data = await res.json();
    setResult({ ...data, skipped });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-sage-200 bg-white/60 p-4">
        <label className="text-sm font-medium">
          NotionからエクスポートしたCSVファイルを選択
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="mt-2 block text-sm"
          />
        </label>
      </div>

      {headers.length > 0 && (
        <>
          <div className="rounded-lg border border-sage-200 bg-white/60 p-4">
            <h2 className="mb-3 text-sm font-medium text-ink">列の対応付け</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TARGET_FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-1 text-sm">
                  {field.label}
                  {field.required && <span className="text-coral-500"> *必須</span>}
                  <select
                    value={mapping[field.key]}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field.key]: e.target.value })
                    }
                    className="rounded border border-sage-200 bg-white px-3 py-2"
                  >
                    <option value="">(使用しない)</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-sage-200 bg-white/60 p-4">
            <h2 className="mb-3 text-sm font-medium text-ink">
              プレビュー(先頭{previewRows.length}件 / 全{rows.length}件)
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-200 text-left text-ink/60">
                  {TARGET_FIELDS.map((f) => (
                    <th key={f.key} className="px-3 py-2 font-medium">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b border-sage-100 last:border-b-0">
                    {TARGET_FIELDS.map((f) => (
                      <td key={f.key} className="px-3 py-2">
                        {f.key === "eventType"
                          ? EVENT_TYPE_LABELS[guessEventType((mapping.eventType && row[mapping.eventType]) || "")]
                          : mapping[f.key]
                          ? row[mapping[f.key]]
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={submitting || !mapping.name || !mapping.eventDate}
              className="rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-50"
            >
              インポート実行
            </button>
            {error && <span className="text-sm text-coral-500">{error}</span>}
          </div>
        </>
      )}

      {result && (
        <p className="rounded-lg border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-600">
          完了しました。新規人物 {result.createdPeople}件 / 贈答記録 {result.createdGifts}件を登録しました
          {result.skipped > 0 && ` (氏名または日付が空のため${result.skipped}件をスキップ)`}。
        </p>
      )}
    </div>
  );
}
