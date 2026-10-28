const fallbackSiteName = "子非鱼";

export function getSiteName(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : fallbackSiteName;
}
