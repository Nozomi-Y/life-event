import Link from "next/link";
import GiftTable from "@/components/GiftTable";
import HistoryFilterForm from "@/components/HistoryFilterForm";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">履歴一覧</h1>
          <p className="mt-1 text-sm text-ink/60">日付順に贈答記録を表示しています。</p>
        </div>
        <Link
          href="/gifts/new"
          className="shrink-0 rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600"
        >
          贈答記録を追加
        </Link>
      </div>

      <HistoryFilterForm
        people={people}
        initialPersonId={searchParams.personId ?? ""}
        initialEventType={searchParams.eventType ?? ""}
        initialOrder={order}
      />

      <GiftTable gifts={gifts} peopleById={peopleById} />
    </div>
  );
}
