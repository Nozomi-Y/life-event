import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createGift, createPerson, listPeople } from "@/lib/store";

const importRowSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().optional(),
  birthDate: z.string().optional(),
  eventType: z.enum([
    "birthday",
    "wedding",
    "funeral",
    "ochugen",
    "oseibo",
    "entrance",
    "graduation",
    "mothers_day",
    "fathers_day",
    "other",
  ]),
  eventDate: z.string().min(1),
  item: z.string().optional(),
  amount: z.number().nullable().optional(),
  location: z.string().optional(),
  memo: z.string().optional(),
});

const importSchema = z.object({
  rows: z.array(importRowSchema),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const people = listPeople();
  const findPersonByName = (name: string) =>
    people.find((p) => p.name.trim() === name.trim());

  let createdPeople = 0;
  let createdGifts = 0;

  for (const row of parsed.data.rows) {
    let person = findPersonByName(row.name);
    if (!person) {
      person = createPerson({
        name: row.name,
        relationship: row.relationship ?? "",
        birthDate: row.birthDate || null,
        notes: "",
      });
      people.push(person);
      createdPeople += 1;
    }
    createGift({
      personId: person.id,
      eventType: row.eventType,
      eventDate: row.eventDate,
      item: row.item ?? "",
      amount: row.amount ?? null,
      location: row.location ?? "",
      memo: row.memo ?? "",
    });
    createdGifts += 1;
  }

  return NextResponse.json({ createdPeople, createdGifts });
}
