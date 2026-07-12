import { EventType } from "./types";

export interface ParsedRow {
  name: string;
  eventType: EventType;
  eventDate: string;
  item: string;
  amount: number | null;
  location: string;
  memo: string;
}

const KANJI_DIGIT: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

const HIRAGANA_DIGIT: Record<string, number> = {
  いち: 1,
  に: 2,
  さん: 3,
  よん: 4,
  し: 4,
  ご: 5,
  ろく: 6,
  なな: 7,
  しち: 7,
  はち: 8,
  きゅう: 9,
  く: 9,
  じゅう: 10,
};

function isValidYMD(y: number, m: number, d: number): boolean {
  return y >= 1990 && y <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
}

/** 先頭付近の数字の並びから日付(年/年月/年月日)を推測し、残りのテキストを返す */
function extractDateToken(text: string): { date: string; remainder: string } {
  const fallback = `${new Date().getFullYear()}-01-01`;
  const m = text.match(/\d{4,9}/);
  if (!m || m.index == null) return { date: fallback, remainder: text };

  const digits = m[0];
  const idx = m.index;
  let date: string | null = null;

  if (digits.length >= 8) {
    const y = Number(digits.slice(0, 4));
    const mo = Number(digits.slice(4, 6));
    const d = Number(digits.slice(6, 8));
    if (isValidYMD(y, mo, d)) {
      date = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  if (!date && digits.length >= 6) {
    const y = Number(digits.slice(0, 4));
    const mo = Number(digits.slice(4, 6));
    if (y >= 1990 && y <= 2099 && mo >= 1 && mo <= 12) {
      date = `${y}-${String(mo).padStart(2, "0")}-01`;
    }
  }
  if (!date && digits.length >= 4) {
    const y = Number(digits.slice(0, 4));
    if (y >= 1990 && y <= 2099) {
      date = `${y}-01-01`;
    }
  }
  if (!date) return { date: fallback, remainder: text };

  const remainder = (text.slice(0, idx) + text.slice(idx + digits.length)).trim();
  return { date, remainder };
}

/** テキスト中に現れる金額(円表記・¥表記・万の漢数字/ひらがな表記)を出現順に抽出する */
function findAmounts(text: string): number[] {
  const found: { index: number; value: number }[] = [];

  for (const m of text.matchAll(/[¥￥]\s*([\d,]+)/g)) {
    found.push({ index: m.index!, value: Number(m[1].replace(/,/g, "")) });
  }
  for (const m of text.matchAll(/([\d,]+)\s*円/g)) {
    found.push({ index: m.index!, value: Number(m[1].replace(/,/g, "")) });
  }
  for (const m of text.matchAll(/([一二三四五六七八九十]|\d+)\s*万/g)) {
    const raw = m[1];
    const digit = /\d+/.test(raw) ? Number(raw) : KANJI_DIGIT[raw];
    if (digit) found.push({ index: m.index!, value: digit * 10000 });
  }
  for (const m of text.matchAll(
    /(いち|じゅう|に|さん|よん|ご|ろく|なな|しち|はち|きゅう|く)まん/g
  )) {
    const digit = HIRAGANA_DIGIT[m[1]];
    if (digit) found.push({ index: m.index!, value: digit * 10000 });
  }

  found.sort((a, b) => a.index - b.index);
  return found.map((f) => f.value);
}

function guessEventType(text: string): EventType {
  if (/誕生日|誕生/.test(text)) return "birthday";
  if (/結婚|御祝儀/.test(text)) return "wedding";
  if (/お歳暮/.test(text)) return "oseibo";
  if (/お中元/.test(text)) return "ochugen";
  if (/入学|入園/.test(text)) return "entrance";
  if (/卒業/.test(text)) return "graduation";
  return "other";
}

function looksLikeNameLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.length > 20) return false;
  if (/\d/.test(t)) return false;
  if (/[¥￥円]/.test(t)) return false;
  return true;
}

function stripAmountOnlyLines(lines: string[]): string[] {
  return lines.filter((l) => !/^[¥￥]?[\d,]+\s*円?$/.test(l.trim()));
}

interface RawEntry {
  name: string;
  item: string;
  amount: number | null;
}

/** ヘッダー行に「はるき さっちゃん そら」+ 本文に「〜ずつ」がある場合、人数分に均等按分する */
function trySplitEachPattern(headerRemainder: string, bodyLines: string[]): RawEntry[] | null {
  const joined = bodyLines.join(" ");
  if (!/ずつ/.test(joined)) return null;
  const names = headerRemainder.split(/[\s　]+/).map((s) => s.trim()).filter(Boolean);
  if (names.length < 2) return null;
  const amounts = findAmounts(joined);
  if (amounts.length === 0) return null;
  const amount = amounts[0];
  return names.map((name) => ({ name, item: "", amount }));
}

function splitBlockIntoEntries(headerRemainder: string, bodyLines: string[]): RawEntry[] {
  const eachSplit = trySplitEachPattern(headerRemainder, bodyLines);
  if (eachSplit) return eachSplit;

  const nameLineIdxs = bodyLines
    .map((l, i) => (looksLikeNameLine(l) ? i : -1))
    .filter((i) => i >= 0);
  const totalAmounts =
    findAmounts(bodyLines.join("\n")).length + findAmounts(headerRemainder).length;

  if (nameLineIdxs.length >= 2 && totalAmounts >= 2) {
    const entries: RawEntry[] = [];
    for (let k = 0; k < nameLineIdxs.length; k++) {
      const start = nameLineIdxs[k];
      const end = k + 1 < nameLineIdxs.length ? nameLineIdxs[k + 1] : bodyLines.length;
      const name = bodyLines[start].trim();
      const itemLines = stripAmountOnlyLines(
        bodyLines.slice(start + 1, end).filter((l) => l.trim())
      );
      const amounts = findAmounts(bodyLines.slice(start + 1, end).join("\n"));
      entries.push({
        name,
        item: itemLines.join(" / "),
        amount: amounts.length ? amounts[amounts.length - 1] : null,
      });
    }
    return entries;
  }

  const allLines = bodyLines.filter((l) => l.trim());
  const amounts = findAmounts(allLines.join("\n") + " " + headerRemainder);
  return [
    {
      name: headerRemainder || "(不明)",
      item: stripAmountOnlyLines(allLines).join(" / "),
      amount: amounts.length ? amounts[amounts.length - 1] : null,
    },
  ];
}

/** Notionからコピーした整形前のテキストを、贈答記録の候補行に変換する(要目視確認) */
export function parseNotionText(raw: string): ParsedRow[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  const blocks: string[][] = [];
  for (const line of lines) {
    if (/^-\s+/.test(line)) {
      blocks.push([line.replace(/^-\s+/, "")]);
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1].push(line);
    }
  }

  const rows: ParsedRow[] = [];
  for (const block of blocks) {
    const [headerLine, ...bodyLines] = block;
    const { date, remainder: headerRemainder } = extractDateToken(headerLine);
    const eventType = guessEventType(headerLine + " " + bodyLines.join(" "));
    const entries = splitBlockIntoEntries(headerRemainder, bodyLines);

    for (const entry of entries) {
      if (!entry.name.trim()) continue;
      rows.push({
        name: entry.name.trim(),
        eventType,
        eventDate: date,
        item: entry.item,
        amount: entry.amount,
        location: "",
        memo: "",
      });
    }
  }

  return rows;
}
