import ImportClient from "@/components/ImportClient";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">CSVインポート</h1>
        <p className="mt-1 text-sm text-ink/60">
          Notionからエクスポートした過去の履歴CSVを取り込みます。列の対応を確認してから実行してください。
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
