import { differenceInCalendarDays } from "date-fns";
import { Person, UpcomingOccasion } from "./types";

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getAge(birthDate: string, asOf: Date): number {
  const birth = parseISODate(birthDate);
  let age = asOf.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    asOf.getMonth() > birth.getMonth() ||
    (asOf.getMonth() === birth.getMonth() && asOf.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function getNextBirthday(birthDate: string, asOf: Date): Date {
  const birth = parseISODate(birthDate);
  let next = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < stripTime(asOf)) {
    next = new Date(asOf.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  return next;
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 日本の学齢基準(4/2〜翌4/1生まれが同学年)に基づく学齢起算年。
 * この年の4/1に小学校入学(起算年+6)を迎える学年グループを表す。
 */
export function getSchoolCohortYear(birthDate: string): number {
  const birth = parseISODate(birthDate);
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const isBeforeApril2 = month < 4 || (month === 4 && day === 1);
  return isBeforeApril2 ? birth.getFullYear() - 1 : birth.getFullYear();
}

interface SchoolEvent {
  label: string;
  date: Date;
  kind: "school-entrance" | "school-graduation";
}

export function getSchoolEvents(birthDate: string): SchoolEvent[] {
  const cohort = getSchoolCohortYear(birthDate);
  return [
    { label: "小学校入学", date: new Date(cohort + 6, 3, 1), kind: "school-entrance" },
    { label: "小学校卒業", date: new Date(cohort + 12, 2, 20), kind: "school-graduation" },
    { label: "中学校入学", date: new Date(cohort + 12, 3, 1), kind: "school-entrance" },
    { label: "中学校卒業", date: new Date(cohort + 15, 2, 20), kind: "school-graduation" },
    { label: "高校入学", date: new Date(cohort + 15, 3, 1), kind: "school-entrance" },
    { label: "高校卒業", date: new Date(cohort + 18, 2, 20), kind: "school-graduation" },
    { label: "大学入学", date: new Date(cohort + 18, 3, 1), kind: "school-entrance" },
  ];
}

const LONGEVITY_AGES: { age: number; label: string }[] = [
  { age: 60, label: "還暦" },
  { age: 70, label: "古希" },
  { age: 77, label: "喜寿" },
  { age: 80, label: "傘寿" },
  { age: 88, label: "米寿" },
  { age: 90, label: "卒寿" },
  { age: 99, label: "白寿" },
  { age: 100, label: "百寿" },
];

export function getLongevityCelebrations(
  birthDate: string
): { label: string; date: Date; age: number }[] {
  const birth = parseISODate(birthDate);
  return LONGEVITY_AGES.map(({ age, label }) => ({
    label: `${label}(${age}歳)`,
    date: new Date(birth.getFullYear() + age, birth.getMonth(), birth.getDate()),
    age,
  }));
}

export function getUpcomingOccasions(
  people: Person[],
  asOf: Date = new Date()
): UpcomingOccasion[] {
  const today = stripTime(asOf);
  const occasions: UpcomingOccasion[] = [];

  for (const person of people) {
    if (!person.birthDate) continue;

    const nextBirthday = getNextBirthday(person.birthDate, today);
    occasions.push({
      personId: person.id,
      personName: person.name,
      kind: "birthday",
      label: "誕生日",
      date: toISODate(nextBirthday),
      daysUntil: differenceInCalendarDays(nextBirthday, today),
      turningAge: getAge(person.birthDate, nextBirthday),
    });

    for (const evt of getSchoolEvents(person.birthDate)) {
      if (evt.date >= today) {
        occasions.push({
          personId: person.id,
          personName: person.name,
          kind: evt.kind,
          label: evt.label,
          date: toISODate(evt.date),
          daysUntil: differenceInCalendarDays(evt.date, today),
          turningAge: null,
        });
      }
    }

    for (const evt of getLongevityCelebrations(person.birthDate)) {
      if (evt.date >= today) {
        occasions.push({
          personId: person.id,
          personName: person.name,
          kind: "longevity",
          label: evt.label,
          date: toISODate(evt.date),
          daysUntil: differenceInCalendarDays(evt.date, today),
          turningAge: evt.age,
        });
      }
    }
  }

  return occasions.sort((a, b) => a.date.localeCompare(b.date));
}
