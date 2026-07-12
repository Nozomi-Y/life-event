import { notFound } from "next/navigation";
import GiftForm from "@/components/GiftForm";
import { getGift, listPeople } from "@/lib/store";

export default function EditGiftPage({ params }: { params: { id: string } }) {
  const gift = getGift(params.id);
  if (!gift) notFound();

  const people = listPeople().sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">贈答記録を編集</h1>
      </div>
      <GiftForm people={people} initialGift={gift} />
    </div>
  );
}
