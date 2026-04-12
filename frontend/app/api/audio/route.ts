import { NextRequest } from "next/server";
import { Readable } from "node:stream";

import {
  createAudioReadStream,
  getAudioMimeType,
  getDefaultLocalAudioTrack,
  getLocalAudioTrackByName
} from "@/lib/local-audio";

function parseRangeHeader(rangeHeader: string, size: number) {
  const matches = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!matches) {
    return null;
  }

  const startText = matches[1];
  const endText = matches[2];
  const start = startText ? Number(startText) : 0;
  const end = endText ? Number(endText) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) {
    return null;
  }

  return {
    end: Math.min(end, size - 1),
    start
  };
}

export async function GET(request: NextRequest) {
  const requestedTrack = request.nextUrl.searchParams.get("track");
  const track = requestedTrack
    ? await getLocalAudioTrackByName(requestedTrack)
    : await getDefaultLocalAudioTrack();

  if (!track) {
    return new Response("No local audio file found.", { status: 404 });
  }

  const rangeHeader = request.headers.get("range");
  const mimeType = getAudioMimeType(track.extension);

  if (!rangeHeader) {
    const stream = createAudioReadStream(track.fullPath);

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(track.size),
        "Content-Type": mimeType
      }
    });
  }

  const parsedRange = parseRangeHeader(rangeHeader, track.size);

  if (!parsedRange) {
    return new Response("Invalid range.", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${track.size}`
      }
    });
  }

  const { start, end } = parsedRange;
  const chunkSize = end - start + 1;
  const stream = createAudioReadStream(track.fullPath, start, end);

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(chunkSize),
      "Content-Range": `bytes ${start}-${end}/${track.size}`,
      "Content-Type": mimeType
    }
  });
}
