export type EventType =
  | "birthday"
  | "wedding"
  | "funeral"
  | "ochugen"
  | "oseibo"
  | "entrance"
  | "graduation"
  | "mothers_day"
  | "fathers_day"
  | "other";

export interface Person {
  id: string;
  name: string;
  relationship: string;
  birthDate: string | null; // ISO YYYY-MM-DD
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftRecord {
  id: string;
  personId: string;
  eventType: EventType;
  eventDate: string; // ISO YYYY-MM-DD
  item: string;
  amount: number | null;
  location: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

export type OccasionKind =
  | "birthday"
  | "school-entrance"
  | "school-graduation"
  | "longevity";

export interface UpcomingOccasion {
  personId: string;
  personName: string;
  kind: OccasionKind;
  label: string; // 例: "還暦(60歳)", "小学校入学"
  date: string; // ISO YYYY-MM-DD
  daysUntil: number;
  turningAge: number | null;
}
