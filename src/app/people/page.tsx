import PeopleTable from "@/components/PeopleTable";
import PersonForm from "@/components/PersonForm";
import { listPeople } from "@/lib/store";

export default function PeoplePage() {
  const people = listPeople().sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">親戚管理</h1>
        <p className="mt-1 text-sm text-ink/60">
          誕生日を登録しておくと、ダッシュボードで次のイベントが自動的にわかります。
        </p>
      </div>
      <PersonForm />
      <PeopleTable people={people} />
    </div>
  );
}
