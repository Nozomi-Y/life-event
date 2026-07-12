"use client";

import { useState } from "react";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import { Person } from "@/lib/types";

interface Props {
  people: Person[];
  initialPersonId: string;
  initialEventType: string;
  initialOrder: "asc" | "desc";
}

export default function HistoryFilterForm({
  people,
  initialPersonId,
  initialEventType,
  initialOrder,
}: Props) {
  const [personId, setPersonId] = useState(initialPersonId);
  const [eventType, setEventType] = useState(initialEventType);
  const [order, setOrder] = useState(initialOrder);

  function handleReset() {
    setPersonId("");
    setEventType("");
    setOrder("desc");
  }

  return (
    <form
      method="GET"
      className="flex flex-wrap items-end gap-3 rounded-lg border border-sage-200 bg-white/60 p-4 text-sm"
    >
      <label className="flex flex-col gap-1">
        人物
        <select
          name="personId"
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        >
          <option value="">すべて</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        種別
        <select
          name="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        >
          <option value="">すべて</option>
          {EVENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        並び順
        <select
          name="order"
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="rounded border border-sage-200 bg-white px-3 py-2"
        >
          <option value="desc">新しい順</option>
          <option value="asc">古い順</option>
        </select>
      </label>
      <button
        type="submit"
        className="rounded bg-sage-500 px-4 py-2 font-medium text-white hover:bg-sage-600"
      >
        絞り込む
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="rounded border border-sage-200 bg-white px-4 py-2 font-medium text-ink/70 hover:bg-sage-50"
      >
        リセット
      </button>
    </form>
  );
}
