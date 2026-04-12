import type { Metadata } from "next";
import Link from "next/link";

import LenisProvider from "@/components/LenisProvider";
import { siteProfile } from "@/lib/site-content";

import "./globals.css";

export const metadata: Metadata = {
  title: siteProfile.name,
  description: siteProfile.intro
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <LenisProvider />
        <header className="site-header">
          <Link className="brand-mark" href="/">
            {siteProfile.name}
          </Link>
          <nav aria-label="Primary" className="site-nav">
            <Link href="/">首页</Link>
            <Link href="/about">关于</Link>
            <Link href="/work">作品</Link>
            <Link href="/notes">笔记</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>{siteProfile.name}</p>
        </footer>
      </body>
    </html>
  );
}
