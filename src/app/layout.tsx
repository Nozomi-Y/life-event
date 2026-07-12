import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "贈答管理",
  description: "親戚の冠婚葬祭・誕生日・お歳暮などの贈答履歴と次のイベントを管理する",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-paper text-ink font-sans">
        <div className="flex min-h-screen">
          <Nav />
          <main className="min-w-0 flex-1 px-8 py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
