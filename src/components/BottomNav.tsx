"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/assets", label: "Total Asset" },
  { href: "/history", label: "Breakdown" },
  { href: "/charts", label: "Charts" },
  { href: "/settings", label: "Settings" }
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-paper">
      <ul className="mx-auto flex max-w-md md:max-w-2xl lg:max-w-4xl">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={[
                  "flex flex-col items-center gap-1 py-3 font-body text-xs transition",
                  active ? "text-ledger" : "text-ink/50"
                ].join(" ")}
              >
                <span
                  className={[
                    "h-[2px] w-6 rounded-full transition",
                    active ? "bg-ledger shadow-[0_0_8px_0_rgba(47,230,200,0.8)]" : "bg-transparent"
                  ].join(" ")}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
