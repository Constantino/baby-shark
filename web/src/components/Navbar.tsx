"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Agent", href: "/agent" },
  { label: "Investor", href: "/investor" },
  { label: "Permit2", href: "/permit2" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-100"
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
                  ? "bg-white/15 text-zinc-100"
                  : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
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
