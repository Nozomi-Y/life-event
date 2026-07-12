import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createGift, listGifts } from "@/lib/store";

const giftInputSchema = z.object({
  personId: z.string().min(1, "人物を選択してください"),
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
  eventDate: z.string().min(1, "日付は必須です"),
  item: z.string().default(""),
  amount: z.number().nullable().optional(),
  location: z.string().default(""),
  memo: z.string().default(""),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId");
  const eventType = searchParams.get("eventType");
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  let gifts = listGifts();
  if (personId) gifts = gifts.filter((g) => g.personId === personId);
  if (eventType) gifts = gifts.filter((g) => g.eventType === eventType);

  gifts.sort((a, b) =>
    order === "asc"
      ? a.eventDate.localeCompare(b.eventDate)
      : b.eventDate.localeCompare(a.eventDate)
  );

  return NextResponse.json(gifts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = giftInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const gift = createGift({
    personId: parsed.data.personId,
    eventType: parsed.data.eventType,
    eventDate: parsed.data.eventDate,
    item: parsed.data.item,
    amount: parsed.data.amount ?? null,
    location: parsed.data.location,
    memo: parsed.data.memo,
  });
  return NextResponse.json(gift, { status: 201 });
}
