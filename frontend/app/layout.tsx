import type { Metadata } from "next";

import NavigationProvider from "@/components/NavigationProvider";
import FilingFooter from "@/components/FilingFooter";
import LenisProvider from "@/components/LenisProvider";
import SiteHeader from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { lifeNotes } from "@/lib/life-notes";
import { notes, siteProfile } from "@/lib/site-content";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: siteProfile.name,
  description: siteProfile.intro
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-mode="life" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { var savedMode = localStorage.getItem("selfsite-4175-mode"); if (savedMode !== "life" && savedMode !== "work") { savedMode = localStorage.getItem("selfsite-4175-theme") === "dark" ? "work" : "life"; } if (location.pathname === "/notes") { var noteSlug = new URLSearchParams(location.search).get("note"); if (${JSON.stringify(lifeNotes.map(note => note.slug))}.includes(noteSlug)) savedMode = "life"; else if (${JSON.stringify(notes.map(note => note.slug))}.includes(noteSlug)) savedMode = "work"; } document.documentElement.dataset.mode = savedMode; document.documentElement.dataset.theme = savedMode === "work" ? "dark" : "light"; document.documentElement.style.colorScheme = savedMode === "work" ? "dark" : "light"; } catch (_) {} try { if (location.pathname !== "/") document.documentElement.dataset.zfyIntroSkip = "true"; if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.dataset.zfyIntroSkip = "true"; } catch (_) {} window.setTimeout(function () { document.documentElement.dataset.zfyIntroSkip = "true"; }, 8000);`
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LenisProvider />
          <NavigationProvider>
          <SiteHeader />
          <main>{children}</main>
          <footer className="site-footer">
            <p>{siteProfile.name}</p>
          </footer>
          <FilingFooter />
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
