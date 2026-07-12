import Link from "next/link";
import GiftForm from "@/components/GiftForm";
import { listPeople } from "@/lib/store";

export default function NewGiftPage() {
  const people = listPeople().sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">贈答記録を追加</h1>
        <p className="mt-1 text-sm text-ink/60">
          誰に・いつ・どこで・何を・いくら贈ったかを記録します。
        </p>
      </div>
      {people.length === 0 && (
        <p className="rounded-lg border border-dashed border-sage-200 px-4 py-4 text-sm text-ink/60">
          先に
          <Link href="/people" className="mx-1 text-sage-600 underline">
            親戚管理
          </Link>
          で人物を登録してください。
        </p>
      )}
      <GiftForm people={people} />
    </div>
  );
}
