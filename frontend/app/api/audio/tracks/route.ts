import { NextResponse } from "next/server";

import { listLocalAudioTracks, toPublicAudioTrack } from "@/lib/local-audio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const tracks = await listLocalAudioTracks();
  return NextResponse.json(
    {
      tracks: tracks.map(toPublicAudioTrack)
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
