import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

const fallbackAudioDir = "D:\\soundpadyy";
const supportedExtensions = [".mp3", ".m4a", ".wav", ".ogg", ".flac"] as const;

export type LocalAudioTrack = {
  extension: string;
  fullPath: string;
  name: string;
  size: number;
};

export type PublicAudioTrack = {
  id: string;
  src: string;
  title: string;
};

function isSupportedAudioFile(filename: string): boolean {
  return supportedExtensions.includes(path.extname(filename).toLowerCase() as (typeof supportedExtensions)[number]);
}

export function getLocalAudioDir(): string {
  return process.env.LOCAL_AUDIO_DIR?.trim() || fallbackAudioDir;
}

function compareTracks(a: LocalAudioTrack, b: LocalAudioTrack): number {
  const aIsMp3 = a.extension === ".mp3";
  const bIsMp3 = b.extension === ".mp3";

  if (aIsMp3 !== bIsMp3) {
    return aIsMp3 ? -1 : 1;
  }

  return a.name.localeCompare(b.name, "zh-CN");
}

export async function listLocalAudioTracks(): Promise<LocalAudioTrack[]> {
  const dir = getLocalAudioDir();
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";

    if (code === "ENOENT" || code === "ENOTDIR") {
      return [];
    }

    throw error;
  }

  const tracks: LocalAudioTrack[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !isSupportedAudioFile(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const stat = await fs.stat(fullPath);

    tracks.push({
      extension: path.extname(entry.name).toLowerCase(),
      fullPath,
      name: entry.name,
      size: stat.size
    });
  }

  return tracks.sort(compareTracks);
}

export async function getDefaultLocalAudioTrack(): Promise<LocalAudioTrack | null> {
  const tracks = await listLocalAudioTracks();
  return tracks[0] ?? null;
}

export async function getLocalAudioTrackByName(name: string): Promise<LocalAudioTrack | null> {
  const tracks = await listLocalAudioTracks();
  return tracks.find((track) => track.name === name) ?? null;
}

export function createAudioReadStream(fullPath: string, start?: number, end?: number) {
  return createReadStream(fullPath, {
    start,
    end
  });
}

export function getAudioMimeType(extension: string): string {
  switch (extension) {
    case ".mp3":
      return "audio/mpeg";
    case ".m4a":
      return "audio/mp4";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".flac":
      return "audio/flac";
    default:
      return "application/octet-stream";
  }
}

export function getTrackTitle(filename: string): string {
  return filename.replace(path.extname(filename), "");
}

export function toPublicAudioTrack(track: LocalAudioTrack): PublicAudioTrack {
  return {
    id: track.name,
    src: `/api/audio?track=${encodeURIComponent(track.name)}`,
    title: getTrackTitle(track.name)
  };
}
