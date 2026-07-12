"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "ダッシュボード" },
  { href: "/history", label: "履歴一覧" },
  { href: "/gifts/new", label: "贈答記録を追加" },
  { href: "/people", label: "親戚管理" },
  { href: "/import", label: "CSVインポート" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-sage-200 bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-semibold text-sage-600 tracking-wide">
          贈答管理
        </span>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-sage-600 font-medium"
                    : "text-ink/70 hover:text-sage-600 transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
