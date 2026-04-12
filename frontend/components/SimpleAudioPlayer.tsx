"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

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
  const [isMuted, setIsMuted] = useState(false);
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
        setActiveIndex((current) => (current + 1) % tracks.length);
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

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

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

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) {
      return;
    }

    const nextValue = Number(event.target.value);
    audio.currentTime = (nextValue / 100) * duration;
    setCurrentTime(audio.currentTime);
  };

  const switchTrack = (nextIndex: number) => {
    if (!tracks.length) {
      return;
    }

    shouldResumePlaybackRef.current = isPlaying;
    setActiveIndex((nextIndex + tracks.length) % tracks.length);
  };

  if (!initialSrc && !hasLoadedRuntimePlaylist) {
    return (
      <section className="home-music-bar compact apple-player">
        <div className="home-music-copy">
          <p className="home-music-label">音乐播放器</p>
          <p className="home-music-title">正在读取歌曲目录</p>
        </div>
      </section>
    );
  }

  if (!currentTrack) {
    return (
      <section className="home-music-bar compact apple-player">
        <div className="home-music-copy">
          <p className="home-music-label">音乐播放器</p>
          <p className="home-music-title">暂时没有可播放歌曲</p>
          <p className="home-music-hint">
            {error || "请检查 NEXT_PUBLIC_AUDIO_SOURCE 或 LOCAL_AUDIO_DIR。"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="home-music-bar compact apple-player">
      <div className="home-music-copy">
        <p className="home-music-label">音乐播放器</p>
        <p className="home-music-title">{currentTrack.title}</p>
        <p className="home-music-hint">更轻的控制条，更直接的选歌方式。</p>
      </div>

      <div className="audio-player compact apple-player">
        <button
          aria-label={isMuted ? "取消静音" : "静音"}
          className="audio-mute-button"
          onClick={toggleMute}
          type="button"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <div className="audio-main compact">
          <div className="audio-control-cluster">
            <button
              className="audio-nav-button icon-only"
              onClick={() => switchTrack(activeIndex - 1)}
              type="button"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              aria-label={isPlaying ? "暂停播放" : "开始播放"}
              className="audio-play-button primary"
              onClick={() => {
                void togglePlay();
              }}
              type="button"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="audio-nav-button icon-only"
              onClick={() => switchTrack(activeIndex + 1)}
              type="button"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="audio-track">
            <div className="audio-track-meta">
              <span>{currentTrack.title}</span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              className="audio-range"
              max="100"
              min="0"
              onChange={handleSeek}
              type="range"
              value={progress}
            />
            <div className="audio-track-actions compact">
              <select
                className="audio-select"
                onChange={(event) => switchTrack(Number(event.target.value))}
                value={activeIndex}
              >
                {tracks.map((track, index) => (
                  <option key={track.id} value={index}>
                    {track.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <audio autoPlay={autoplay} preload="metadata" ref={audioRef} />
      </div>
    </section>
  );
}
