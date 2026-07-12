import { UpcomingOccasion } from "@/lib/types";

const KIND_STYLES: Record<UpcomingOccasion["kind"], string> = {
  birthday: "bg-coral-100 text-coral-500",
  "school-entrance": "bg-dusty-100 text-dusty-500",
  "school-graduation": "bg-dusty-100 text-dusty-500",
  longevity: "bg-sage-100 text-sage-600",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function formatDaysUntil(days: number): string {
  if (days === 0) return "本日";
  if (days === 1) return "明日";
  return `あと${days}日`;
}

export default function EventCard({ occasion }: { occasion: UpcomingOccasion }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-sage-200 bg-white/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${KIND_STYLES[occasion.kind]}`}
        >
          {occasion.label}
        </span>
        <div>
          <div className="font-medium">{occasion.personName}</div>
          <div className="text-sm text-ink/60">
            {formatDate(occasion.date)}
            {occasion.turningAge != null && ` ・ ${occasion.turningAge}歳`}
          </div>
        </div>
      </div>
      <div className="shrink-0 text-sm font-medium text-sage-600">
        {formatDaysUntil(occasion.daysUntil)}
      </div>
    </div>
  );
}
