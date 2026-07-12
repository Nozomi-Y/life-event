import EventCard from "@/components/EventCard";
import { getUpcomingOccasions } from "@/lib/dateLogic";
import { listPeople } from "@/lib/store";

export default function DashboardPage() {
  const people = listPeople();
  const occasions = getUpcomingOccasions(people, new Date()).slice(0, 30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">次のイベント</h1>
        <p className="mt-1 text-sm text-ink/60">
          本日時点で、直近の誕生日・入学式/卒業式・長寿祝いを近い順に表示しています。
        </p>
      </div>

      {people.length === 0 ? (
        <p className="rounded-lg border border-dashed border-sage-200 px-4 py-8 text-center text-sm text-ink/60">
          まだ親戚が登録されていません。「親戚管理」から誕生日を登録してください。
        </p>
      ) : occasions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-sage-200 px-4 py-8 text-center text-sm text-ink/60">
          誕生日が未登録の方が多いようです。「親戚管理」で誕生日を追加すると、ここに次のイベントが表示されます。
        </p>
      ) : (
        <div className="space-y-2">
          {occasions.map((occasion, i) => (
            <EventCard key={`${occasion.personId}-${occasion.kind}-${occasion.date}-${i}`} occasion={occasion} />
          ))}
        </div>
      )}
    </div>
  );
}
