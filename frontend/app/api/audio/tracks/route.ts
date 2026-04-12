import { NextResponse } from "next/server";

import { listLocalAudioTracks, toPublicAudioTrack } from "@/lib/local-audio";

export async function GET() {
  const tracks = await listLocalAudioTracks();
  return NextResponse.json({
    tracks: tracks.map(toPublicAudioTrack)
  });
}
