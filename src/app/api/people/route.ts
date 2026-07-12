import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPerson, listPeople } from "@/lib/store";

const personInputSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  relationship: z.string().default(""),
  birthDate: z.string().nullable().optional(),
  notes: z.string().default(""),
});

export async function GET() {
  const people = listPeople().sort((a, b) => a.name.localeCompare(b.name, "ja"));
  return NextResponse.json(people);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = personInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const person = createPerson({
    name: parsed.data.name,
    relationship: parsed.data.relationship,
    birthDate: parsed.data.birthDate ?? null,
    notes: parsed.data.notes,
  });
  return NextResponse.json(person, { status: 201 });
}
