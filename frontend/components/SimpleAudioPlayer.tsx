"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Shuffle } from "lucide-react";

type AudioTrack = {
  id: string;
  src: string;
  title: string;
};

type SimpleAudioPlayerProps = {
  autoplay?: boolean;
  initialSrc?: string | null;
  initialTitle?: string;
};

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function simplifyTrackTitle(value: string): string {
  const parts = value.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ").trim() : value.trim();
}

function getRandomTrackIndex(currentIndex: number, total: number): number {
  if (total <= 1) {
    return currentIndex;
  }

  let nextIndex = currentIndex;

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * total);
  }

  return nextIndex;
}

export default function SimpleAudioPlayer({
  autoplay = false,
  initialSrc,
  initialTitle
}: SimpleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldResumePlaybackRef = useRef(autoplay);
  const [tracks, setTracks] = useState<AudioTrack[]>(() =>
    initialSrc
      ? [
          {
            id: "external-track",
            src: initialSrc,
            title: simplifyTrackTitle(initialTitle || "我的音乐")
          }
        ]
      : []
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [hasLoadedRuntimePlaylist, setHasLoadedRuntimePlaylist] = useState(Boolean(initialSrc));

  const currentTrack = tracks[activeIndex] ?? null;

  useEffect(() => {
    if (initialSrc) {
      return;
    }

    let cancelled = false;

    const loadTracks = async () => {
      try {
        const response = await fetch("/api/audio/tracks", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("无法加载本地歌曲列表。");
        }

        const payload = (await response.json()) as { tracks?: AudioTrack[] };
        const nextTracks = (payload.tracks ?? []).map((track) => ({
          ...track,
          title: simplifyTrackTitle(track.title)
        }));

        if (!cancelled) {
          setTracks(nextTracks);
          setError(nextTracks.length ? "" : "当前没有可播放的本地歌曲。");
        }
      } catch {
        if (!cancelled) {
          setError("读取歌曲目录失败，请检查 LOCAL_AUDIO_DIR。");
        }
      } finally {
        if (!cancelled) {
          setHasLoadedRuntimePlaylist(true);
        }
      }
    };

    void loadTracks();

    return () => {
      cancelled = true;
    };
  }, [initialSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const syncTime = () => setCurrentTime(audio.currentTime);
    const syncDuration = () => setDuration(audio.duration);
    const syncPlay = () => setIsPlaying(true);
    const syncPause = () => setIsPlaying(false);
    const syncEnded = () => {
      setCurrentTime(0);
      setIsPlaying(false);

      if (tracks.length > 1) {
        shouldResumePlaybackRef.current = true;
        setActiveIndex((current) => getRandomTrackIndex(current, tracks.length));
      }
    };

    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("play", syncPlay);
    audio.addEventListener("pause", syncPause);
    audio.addEventListener("ended", syncEnded);

    return () => {
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("play", syncPlay);
      audio.removeEventListener("pause", syncPause);
      audio.removeEventListener("ended", syncEnded);
    };
  }, [tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    audio.src = currentTrack.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setError("");

    if (shouldResumePlaybackRef.current) {
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    if (audio.paused) {
      shouldResumePlaybackRef.current = true;
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    shouldResumePlaybackRef.current = false;
    audio.pause();
  };

  const playRandomTrack = () => {
    if (!tracks.length) {
      return;
    }

    shouldResumePlaybackRef.current = true;
    setActiveIndex((current) => getRandomTrackIndex(current, tracks.length));
  };

  if (!initialSrc && !hasLoadedRuntimePlaylist) {
    return (
      <section className="floating-audio-player" aria-label="音乐播放器">
        <button aria-label="正在读取歌曲目录" className="floating-audio-button" disabled type="button">
          <Play size={18} />
        </button>
        <button aria-label="随机下一首" className="floating-audio-button" disabled type="button">
          <Shuffle size={18} />
        </button>
      </section>
    );
  }

  if (!currentTrack) {
    return (
      <section className="floating-audio-player" aria-label={error || "暂时没有可播放歌曲"}>
        <button aria-label="暂时没有可播放歌曲" className="floating-audio-button" disabled type="button">
          <Play size={18} />
        </button>
        <button aria-label="随机下一首" className="floating-audio-button" disabled type="button">
          <Shuffle size={18} />
        </button>
      </section>
    );
  }

  return (
    <section className="floating-audio-player" aria-label={`音乐播放器，当前播放 ${currentTrack.title}`}>
      <button
        aria-label={isPlaying ? "暂停播放" : "开始播放"}
        className="floating-audio-button is-primary"
        onClick={() => {
          void togglePlay();
        }}
        title={`${isPlaying ? "暂停" : "播放"}：${currentTrack.title}`}
        type="button"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button
        aria-label="随机下一首"
        className="floating-audio-button"
        onClick={playRandomTrack}
        title={`随机下一首 · ${formatTime(currentTime)} / ${formatTime(duration)}`}
        type="button"
      >
        <Shuffle size={18} />
      </button>
      <audio autoPlay={autoplay} preload="metadata" ref={audioRef} />
    </section>
  );
}
