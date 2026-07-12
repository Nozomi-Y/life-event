"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Person } from "@/lib/types";
import { RELATIONSHIP_SUGGESTIONS } from "@/lib/constants";

export default function PeopleTable({ people }: { people: Person[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Pick<Person, "name" | "relationship" | "birthDate" | "notes"> | null>(null);

  function startEdit(person: Person) {
    setEditingId(person.id);
    setDraft({
      name: person.name,
      relationship: person.relationship,
      birthDate: person.birthDate,
      notes: person.notes,
    });
  }

  async function saveEdit(id: string) {
    if (!draft) return;
    await fetch(`/api/people/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setEditingId(null);
    setDraft(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name}さんを削除しますか?紐づく贈答記録もすべて削除されます。`)) return;
    await fetch(`/api/people/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (people.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-sage-200 px-4 py-8 text-center text-sm text-ink/60">
        まだ親戚が登録されていません。上のフォームから追加してください。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-sage-200 bg-white/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sage-200 text-left text-ink/60">
            <th className="px-4 py-2 font-medium">氏名</th>
            <th className="px-4 py-2 font-medium">続柄</th>
            <th className="px-4 py-2 font-medium">誕生日</th>
            <th className="px-4 py-2 font-medium">メモ</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const isEditing = editingId === person.id;
            return (
              <tr key={person.id} className="border-b border-sage-100 last:border-b-0">
                {isEditing && draft ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="w-full rounded border border-sage-200 px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={draft.relationship}
                        onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
                        list="relationship-suggestions-edit"
                        className="w-full rounded border border-sage-200 px-2 py-1"
                      />
                      <datalist id="relationship-suggestions-edit">
                        {RELATIONSHIP_SUGGESTIONS.map((r) => (
                          <option key={r} value={r} />
                        ))}
                      </datalist>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={draft.birthDate ?? ""}
                        onChange={(e) =>
                          setDraft({ ...draft, birthDate: e.target.value || null })
                        }
                        className="w-full rounded border border-sage-200 px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={draft.notes}
                        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                        className="w-full rounded border border-sage-200 px-2 py-1"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button
                        onClick={() => saveEdit(person.id)}
                        className="mr-2 text-sage-600 hover:underline"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setDraft(null);
                        }}
                        className="text-ink/50 hover:underline"
                      >
                        取消
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{person.name}</td>
                    <td className="px-4 py-2">{person.relationship || "-"}</td>
                    <td className="px-4 py-2">{person.birthDate || "-"}</td>
                    <td className="px-4 py-2 text-ink/60">{person.notes || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button
                        onClick={() => startEdit(person)}
                        className="mr-2 text-dusty-500 hover:underline"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(person.id, person.name)}
                        className="text-coral-500 hover:underline"
                      >
                        削除
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
