import Link from "next/link";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { GiftRecord, Person } from "@/lib/types";

interface Props {
  gifts: GiftRecord[];
  peopleById: Record<string, Person>;
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "-";
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export default function GiftTable({ gifts, peopleById }: Props) {
  if (gifts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-sage-200 px-4 py-8 text-center text-sm text-ink/60">
        該当する贈答記録がありません。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-sage-200 bg-white/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sage-200 text-left text-ink/60">
            <th className="px-4 py-2 font-medium">日付</th>
            <th className="px-4 py-2 font-medium">人物</th>
            <th className="px-4 py-2 font-medium">種別</th>
            <th className="px-4 py-2 font-medium">品物</th>
            <th className="px-4 py-2 font-medium">金額</th>
            <th className="px-4 py-2 font-medium">場所</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((gift) => (
            <tr key={gift.id} className="border-b border-sage-100 last:border-b-0">
              <td className="whitespace-nowrap px-4 py-2">{gift.eventDate}</td>
              <td className="px-4 py-2">{peopleById[gift.personId]?.name ?? "(削除済み)"}</td>
              <td className="px-4 py-2">{EVENT_TYPE_LABELS[gift.eventType]}</td>
              <td className="px-4 py-2">{gift.item || "-"}</td>
              <td className="whitespace-nowrap px-4 py-2">{formatAmount(gift.amount)}</td>
              <td className="px-4 py-2">{gift.location || "-"}</td>
              <td className="whitespace-nowrap px-4 py-2 text-right">
                <Link href={`/gifts/${gift.id}/edit`} className="text-dusty-500 hover:underline">
                  編集
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
