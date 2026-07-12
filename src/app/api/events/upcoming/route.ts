import { NextResponse } from "next/server";
import { getUpcomingOccasions } from "@/lib/dateLogic";
import { listPeople } from "@/lib/store";

export async function GET() {
  const people = listPeople();
  const occasions = getUpcomingOccasions(people, new Date());
  return NextResponse.json(occasions);
}
