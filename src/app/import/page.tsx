import ImportModeTabs from "@/components/ImportModeTabs";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">インポート</h1>
        <p className="mt-1 text-sm text-ink/60">
          Notionからの過去の履歴を取り込みます。整ったCSVがない場合は「テキスト貼り付け」で箇条書きのメモをそのまま貼り付けられます。
        </p>
      </div>
      <ImportModeTabs />
    </div>
  );
}
