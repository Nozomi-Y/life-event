import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deletePerson, getPerson, updatePerson } from "@/lib/store";

const personUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  relationship: z.string().optional(),
  birthDate: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const person = getPerson(params.id);
  if (!person) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(person);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = personUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const person = updatePerson(params.id, parsed.data);
  if (!person) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(person);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = deletePerson(params.id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
