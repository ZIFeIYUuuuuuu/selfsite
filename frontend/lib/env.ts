const fallbackSiteName = "子非鱼";
const fallbackAudioTitle = "我的音乐";

export function getSiteName(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : fallbackSiteName;
}

export function getExplicitAudioSource(): string | null {
  const value = process.env.NEXT_PUBLIC_AUDIO_SOURCE?.trim();
  return value && value.length > 0 ? value : null;
}

export function getAudioTitle(): string {
  const value = process.env.NEXT_PUBLIC_AUDIO_TITLE?.trim();
  return value && value.length > 0 ? value : fallbackAudioTitle;
}

export function getAudioAutoplay(): boolean {
  return process.env.NEXT_PUBLIC_AUDIO_AUTOPLAY?.trim() === "true";
}
