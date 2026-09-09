"use client";

import dynamic from "next/dynamic";

const SimpleAudioPlayer = dynamic(() => import("@/components/SimpleAudioPlayer"), {
  ssr: false
});

export default function DeferredAudioPlayer() {
  return <SimpleAudioPlayer />;
}
