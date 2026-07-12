import fs from "fs";
import path from "path";
import { GiftRecord, Person } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PEOPLE_FILE = path.join(DATA_DIR, "people.json");
const GIFTS_FILE = path.join(DATA_DIR, "gifts.json");

function ensureFile(filePath: string) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]\n", "utf-8");
  }
}

function readJson<T>(filePath: string): T[] {
  ensureFile(filePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw) as T[];
}

function writeJson<T>(filePath: string, data: T[]) {
  ensureFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

const nowIso = () => new Date().toISOString();

export function listPeople(): Person[] {
  return readJson<Person>(PEOPLE_FILE);
}

export function getPerson(id: string): Person | undefined {
  return listPeople().find((p) => p.id === id);
}

export function createPerson(
  input: Pick<Person, "name" | "relationship" | "birthDate" | "notes">
): Person {
  const people = listPeople();
  const person: Person = {
    id: crypto.randomUUID(),
    name: input.name,
    relationship: input.relationship,
    birthDate: input.birthDate || null,
    notes: input.notes ?? "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  people.push(person);
  writeJson(PEOPLE_FILE, people);
  return person;
}

export function updatePerson(
  id: string,
  input: Partial<Pick<Person, "name" | "relationship" | "birthDate" | "notes">>
): Person | undefined {
  const people = listPeople();
  const idx = people.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  people[idx] = { ...people[idx], ...input, updatedAt: nowIso() };
  writeJson(PEOPLE_FILE, people);
  return people[idx];
}

export function deletePerson(id: string): boolean {
  const people = listPeople();
  const next = people.filter((p) => p.id !== id);
  if (next.length === people.length) return false;
  writeJson(PEOPLE_FILE, next);
  // 紐づく贈答記録も削除
  const gifts = listGifts().filter((g) => g.personId !== id);
  writeJson(GIFTS_FILE, gifts);
  return true;
}

export function listGifts(): GiftRecord[] {
  return readJson<GiftRecord>(GIFTS_FILE);
}

export function getGift(id: string): GiftRecord | undefined {
  return listGifts().find((g) => g.id === id);
}

export function createGift(
  input: Pick<
    GiftRecord,
    "personId" | "eventType" | "eventDate" | "item" | "amount" | "location" | "memo"
  >
): GiftRecord {
  const gifts = listGifts();
  const gift: GiftRecord = {
    id: crypto.randomUUID(),
    personId: input.personId,
    eventType: input.eventType,
    eventDate: input.eventDate,
    item: input.item ?? "",
    amount: input.amount ?? null,
    location: input.location ?? "",
    memo: input.memo ?? "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  gifts.push(gift);
  writeJson(GIFTS_FILE, gifts);
  return gift;
}

export function updateGift(
  id: string,
  input: Partial<
    Pick<
      GiftRecord,
      "personId" | "eventType" | "eventDate" | "item" | "amount" | "location" | "memo"
    >
  >
): GiftRecord | undefined {
  const gifts = listGifts();
  const idx = gifts.findIndex((g) => g.id === id);
  if (idx === -1) return undefined;
  gifts[idx] = { ...gifts[idx], ...input, updatedAt: nowIso() };
  writeJson(GIFTS_FILE, gifts);
  return gifts[idx];
}

export function deleteGift(id: string): boolean {
  const gifts = listGifts();
  const next = gifts.filter((g) => g.id !== id);
  if (next.length === gifts.length) return false;
  writeJson(GIFTS_FILE, next);
  return true;
}
