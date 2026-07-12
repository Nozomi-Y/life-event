"use client";

import { useState } from "react";
import ImportClient from "./ImportClient";
import TextImportClient from "./TextImportClient";

export default function ImportModeTabs() {
  const [mode, setMode] = useState<"csv" | "text">("text");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setMode("text")}
          className={
            mode === "text"
              ? "rounded-md bg-sage-500 px-4 py-2 font-medium text-white"
              : "rounded-md border border-sage-200 bg-white/60 px-4 py-2 text-ink/70 hover:bg-sage-50"
          }
        >
          テキスト貼り付け
        </button>
        <button
          onClick={() => setMode("csv")}
          className={
            mode === "csv"
              ? "rounded-md bg-sage-500 px-4 py-2 font-medium text-white"
              : "rounded-md border border-sage-200 bg-white/60 px-4 py-2 text-ink/70 hover:bg-sage-50"
          }
        >
          CSVファイル
        </button>
      </div>
      {mode === "text" ? <TextImportClient /> : <ImportClient />}
    </div>
  );
}
