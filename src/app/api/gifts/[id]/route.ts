import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteGift, getGift, updateGift } from "@/lib/store";

const giftUpdateSchema = z.object({
  personId: z.string().min(1).optional(),
  eventType: z
    .enum([
      "birthday",
      "wedding",
      "funeral",
      "ochugen",
      "oseibo",
      "entrance",
      "graduation",
      "other",
    ])
    .optional(),
  eventDate: z.string().min(1).optional(),
  item: z.string().optional(),
  amount: z.number().nullable().optional(),
  location: z.string().optional(),
  memo: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gift = getGift(params.id);
  if (!gift) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(gift);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = giftUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const gift = updateGift(params.id, parsed.data);
  if (!gift) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(gift);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = deleteGift(params.id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
