"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";

interface AudioPlayerProps {
  beatId: string;
  previewUrl: string | null;
  compact?: boolean;
}

export function AudioPlayer({ beatId, previewUrl, compact }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentBeatId,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
    setCurrentTime,
    setDuration,
  } = useAudioStore();

  const isActive = currentBeatId === beatId;

  // Sync audio element with store state
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isActive && isPlaying) {
      // If the audio has a src and is ready, play immediately.
      // Otherwise, the canplay handler below will trigger playback.
      if (audio.readyState >= 2) {
        audio.play().catch(() => {
          // Browser autoplay policy blocked — silently ignore
        });
      }
      // If readyState < 2, the `canplay` event handler will start playback
    } else {
      audio.pause();
    }
  }, [isActive, isPlaying]);

  // Handle canplay — auto-play when audio is loaded and store says we should be playing
  const handleCanPlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isActive && isPlaying) {
      audioRef.current.play().catch(() => {
        // Browser autoplay policy blocked — silently ignore
      });
    }
  }, [isActive, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!previewUrl) return;

    if (isActive && isPlaying) {
      pause();
    } else if (isActive) {
      resume();
    } else {
      play(beatId, previewUrl);
    }
  }, [isActive, isPlaying, beatId, previewUrl, play, pause, resume]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && isActive) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [isActive, setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && isActive) {
      setDuration(audioRef.current.duration);
    }
  }, [isActive, setDuration]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !isActive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = ratio * audioRef.current.duration;
    },
    [isActive],
  );

  const progress = isActive && duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
      {/* Hidden audio element */}
      {previewUrl && (
        <audio
          ref={audioRef}
          src={isActive ? previewUrl : undefined}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onEnded={() => pause()}
        />
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!previewUrl}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {isActive && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>

        {!compact && (
          <>
            {/* Progress bar */}
            <div
              className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-bg-hover"
              onClick={handleSeek}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time */}
            <span className="flex-shrink-0 font-mono text-xs text-text-muted">
              {isActive ? formatTime(currentTime) : "0:00"} /{" "}
              {isActive && duration > 0 ? formatTime(duration) : "0:30"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
