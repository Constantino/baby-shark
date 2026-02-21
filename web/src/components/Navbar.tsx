"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Agent", href: "/agent" },
  { label: "Investor", href: "/investor" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100"
        >
          <Image
            src="/BabySharkIcon.svg"
            alt="Baby Shark"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span>Baby Shark</span>
        </Link>
        <div className="flex items-center gap-1">
          {TABS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
