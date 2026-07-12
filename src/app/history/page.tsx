import GiftTable from "@/components/GiftTable";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import { listGifts, listPeople } from "@/lib/store";
import { Person } from "@/lib/types";

interface SearchParams {
  personId?: string;
  eventType?: string;
  order?: string;
}

export default function HistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const people = listPeople().sort((a, b) => a.name.localeCompare(b.name, "ja"));
  const peopleById = people.reduce<Record<string, Person>>((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  let gifts = listGifts();
  if (searchParams.personId) {
    gifts = gifts.filter((g) => g.personId === searchParams.personId);
  }
  if (searchParams.eventType) {
    gifts = gifts.filter((g) => g.eventType === searchParams.eventType);
  }
  const order = searchParams.order === "asc" ? "asc" : "desc";
  gifts = [...gifts].sort((a, b) =>
    order === "asc"
      ? a.eventDate.localeCompare(b.eventDate)
      : b.eventDate.localeCompare(a.eventDate)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">履歴一覧</h1>
        <p className="mt-1 text-sm text-ink/60">日付順に贈答記録を表示しています。</p>
      </div>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-sage-200 bg-white/60 p-4 text-sm"
      >
        <label className="flex flex-col gap-1">
          人物
          <select
            name="personId"
            defaultValue={searchParams.personId ?? ""}
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
            defaultValue={searchParams.eventType ?? ""}
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
            defaultValue={order}
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
      </form>

      <GiftTable gifts={gifts} peopleById={peopleById} />
    </div>
  );
}
