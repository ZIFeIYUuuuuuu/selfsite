import type { Metadata } from "next";

import LenisProvider from "@/components/LenisProvider";
import SiteHeader from "@/components/SiteHeader";
import { siteProfile } from "@/lib/site-content";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
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
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <p>{siteProfile.name}</p>
        </footer>
      </body>
    </html>
  );
}
