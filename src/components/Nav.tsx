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
    <aside className="sticky top-0 h-screen w-56 shrink-0 overflow-y-auto border-r border-sage-200 bg-white/60 px-4 py-6">
      <div className="mb-6 px-2 font-semibold text-sage-600 tracking-wide">
        贈答管理
      </div>
      <nav className="flex flex-col gap-1 text-sm">
        {LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "rounded-md bg-sage-100 px-3 py-2 font-medium text-sage-600"
                  : "rounded-md px-3 py-2 text-ink/70 transition-colors hover:bg-sage-50 hover:text-sage-600"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
