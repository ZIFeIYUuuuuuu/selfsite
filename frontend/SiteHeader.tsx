"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteProfile } from "@/lib/site-content";

const navigation = [
  { href: "/", label: "首页" },
  { href: "/work", label: "作品" },
  { href: "/notes", label: "笔记" }
] as const;

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/">
        {siteProfile.name}
      </Link>
      <nav aria-label="Primary" className="site-nav">
        {navigation.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link aria-current={isActive ? "page" : undefined} href={item.href} key={item.href}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
