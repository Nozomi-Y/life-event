"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import { EventType, GiftRecord, Person } from "@/lib/types";

interface Props {
  people: Person[];
  initialGift?: GiftRecord;
}

export default function GiftForm({ people, initialGift }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initialGift);

  const [personId, setPersonId] = useState(initialGift?.personId ?? "");
  const [eventType, setEventType] = useState<EventType>(initialGift?.eventType ?? "birthday");
  const [eventDate, setEventDate] = useState(
    initialGift?.eventDate ?? new Date().toISOString().slice(0, 10)
  );
  const [item, setItem] = useState(initialGift?.item ?? "");
  const [amount, setAmount] = useState(initialGift?.amount?.toString() ?? "");
  const [location, setLocation] = useState(initialGift?.location ?? "");
  const [memo, setMemo] = useState(initialGift?.memo ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personId) {
      setError("人物を選択してください。先に「親戚管理」で登録してください。");
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      personId,
      eventType,
      eventDate,
      item,
      amount: amount.trim() ? Number(amount.replace(/,/g, "")) : null,
      location,
      memo,
    };

    const res = await fetch(
      isEdit ? `/api/gifts/${initialGift!.id}` : "/api/gifts",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSubmitting(false);
    if (!res.ok) {
      setError("保存に失敗しました。入力内容を確認してください。");
      return;
    }
    router.push("/history");
    router.refresh();
  }

  async function handleDelete() {
    if (!initialGift) return;
    if (!confirm("この贈答記録を削除しますか?")) return;
    await fetch(`/api/gifts/${initialGift.id}`, { method: "DELETE" });
    router.push("/history");
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    // 日本語入力の変換確定Enterがそのままフォーム送信してしまうのを防ぐ
    // (テキストエリアの改行入力は妨げない)
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-1 gap-3 rounded-lg border border-sage-200 bg-white/60 p-4 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        人物
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        >
          <option value="">
            {people.length === 0 ? "(未登録)" : "選択してください"}
          </option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.relationship ? `(${p.relationship})` : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        種別
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        >
          {EVENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        日付
        <input
          type="date"
          required
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        金額(円)
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
          placeholder="5000"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        品物
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
          placeholder="花束、金封 など"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        場所
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
          placeholder="どこで購入・手渡ししたか"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        メモ
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
          rows={2}
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || people.length === 0}
          className="rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-50"
        >
          {isEdit ? "更新する" : "追加する"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-coral-400 px-4 py-2 text-sm font-medium text-coral-500 hover:bg-coral-100"
          >
            削除する
          </button>
        )}
        {error && <span className="text-sm text-coral-500">{error}</span>}
      </div>
    </form>
  );
}
