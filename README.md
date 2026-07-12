# life-event

親戚の冠婚葬祭・誕生日・お歳暮などで「誰に・いつ・どこで・何を・いくら」贈ったかを記録し、次に控えている人生イベント(誕生日、入学式・卒業式、長寿祝いなど)を起動時点の日付から自動で把握するための、個人利用向けのローカルWebアプリです。

## 特徴

- **次のイベント自動算出**: 登録した誕生日から、日本の学齢基準(4月2日カットオフ)に基づく小学校〜大学の入学式・卒業式、還暦・古希・喜寿などの長寿祝いを自動計算し、今日から1年以内のものをダッシュボードに近い順で表示します
- **贈答履歴の記録**: 誰に・いつ・どこで・何を・いくら贈ったかを記録し、日付順の一覧・人物や種別による絞り込みができます
- **Notionからの過去データの取り込み**: きれいなCSVがなくても、Notionから箇条書きのままコピーしたテキストを貼り付けて日付・金額・種別を自動推測し、内容を確認・修正してから取り込む機能があります(整ったCSVファイルの取り込みにも対応)
- **データは手元のPCにのみ保存**: サーバーや外部DBを使わず、`data/`フォルダ内のJSONファイルに直接読み書きします。個人情報を含むため、後述の通りGitの管理対象からは除外しています

## 技術スタック

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [date-fns](https://date-fns.org/) (日付計算)
- [zod](https://zod.dev/) (入力バリデーション)
- [papaparse](https://www.papaparse.com/) (CSVパース)
- データ永続化はDBを使わず、ローカルJSONファイル(`data/*.json`)への直接読み書き(`src/lib/store.ts`)

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

初回起動時は `data/people.json` ・ `data/gifts.json` が存在しなければ自動的に空配列で作成されるため、追加のセットアップは不要です。

### サンプルデータで試す(任意)

登録データが空の状態で挙動を確認したい場合は、同梱のサンプル(ダミー人物・ダミー贈答記録)をコピーして使えます。

```bash
cp data/people.json.example data/people.json
cp data/gifts.json.example data/gifts.json
```

## データについて

親戚の氏名・誕生日・贈答記録はすべて `data/people.json` と `data/gifts.json` にローカル保存されます。これらのファイルは個人情報(氏名・誕生日・金額など)を含むため `.gitignore` により **Gitの管理対象外** です。バックアップが必要な場合は `data/` フォルダを手動でコピーしてください。

データの形式(スキーマ)を示すサンプルとして、ダミー情報(山田太郎・名無しの権兵衛など)を入れた `data/people.json.example` ・ `data/gifts.json.example` をリポジトリに含めています。実データはこれと同じ形式で `data/people.json` ・ `data/gifts.json` に保存されます。

**`data/people.json`** (人物)

| フィールド | 型 | 内容 |
|---|---|---|
| id | string | 一意なID(自動採番) |
| name | string | 氏名 |
| relationship | string | 続柄(父・母・いとこ など自由入力) |
| birthDate | string \| null | 誕生日(`YYYY-MM-DD`)。未入力可 |
| notes | string | メモ |

**`data/gifts.json`** (贈答記録)

| フィールド | 型 | 内容 |
|---|---|---|
| id | string | 一意なID(自動採番) |
| personId | string | `people.json` の `id` への参照 |
| eventType | string | `birthday` / `wedding` / `funeral` / `ochugen` / `oseibo` / `entrance` / `graduation` / `mothers_day` / `fathers_day` / `other` |
| eventDate | string | 実際に贈った日(`YYYY-MM-DD`) |
| item | string | 贈った品物 |
| amount | number \| null | 金額(円) |
| location | string | 購入・手渡しした場所 |
| memo | string | メモ |

## 画面

- `/` ダッシュボード: 今日から1年以内の誕生日・入学式/卒業式・長寿祝いを近い順に一覧表示
- `/history` 履歴一覧: 贈答記録を日付順に表示。人物・種別で絞り込み(リセットあり)
- `/gifts/new` 贈答記録の追加
- `/people` 親戚の登録・編集
- `/import` Notionからの過去の履歴の取り込み(テキスト貼り付け / CSVファイル)

## スクリーンショット

### 贈答記録を追加
![贈答記録を追加画面](docs/images/add-gift.png)

### インポート(テキスト貼り付け)
![インポート画面](docs/images/import.png)

## ディレクトリ構成

```
life-event/
├── data/                    # 実データ(gitignore対象)。.exampleはサンプルとしてコミット
├── docs/images/             # README用スクリーンショット
└── src/
    ├── app/                 # 画面(App Router)とAPIルート
    ├── components/          # UIコンポーネント
    └── lib/
        ├── store.ts         # data/*.json の読み書き
        ├── dateLogic.ts     # 次のイベントの計算ロジック(学齢・長寿祝いなど)
        ├── notionTextParser.ts  # Notionのテキスト貼り付けインポートの解析
        ├── constants.ts     # イベント種別・続柄などの選択肢
        └── types.ts         # 型定義
```
