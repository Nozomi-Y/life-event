import { EventType } from "./types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  birthday: "誕生日",
  wedding: "結婚祝い",
  funeral: "香典・弔事",
  ochugen: "お中元",
  oseibo: "お歳暮",
  entrance: "入学祝い",
  graduation: "卒業祝い",
  mothers_day: "母の日",
  fathers_day: "父の日",
  other: "その他",
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as EventType, label })
);

export const RELATIONSHIP_SUGGESTIONS = [
  "父",
  "母",
  "兄弟姉妹",
  "祖父",
  "祖母",
  "叔父",
  "叔母",
  "いとこ",
  "甥",
  "姪",
  "義父",
  "義母",
  "友人",
  "その他",
];
