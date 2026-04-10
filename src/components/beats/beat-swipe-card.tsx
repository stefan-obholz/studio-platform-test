"use client";

import { useState, useCallback } from "react";
import { useAudioStore } from "@/stores/audio-store";
import type { Beat } from "@/types";

interface BeatSwipeCardProps {
  beat: Beat;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  exitDirection?: "left" | "right" | null;
}

const WAVEFORM_BARS = [
  20, 35, 50, 70, 45, 80, 60, 90, 70, 55, 80, 65, 45, 75, 55, 85, 40, 70, 50,
  30, 60, 45, 75, 35,
];

export function BeatSwipeCard({
  beat,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  exitDirection,
}: BeatSwipeCardProps) {
  const { currentBeatId, currentTime, duration } = useAudioStore();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const isAudioActive = currentBeatId === beat.id;
  const audioProgress = isAudioActive && duration > 0 ? (currentTime / duration) * 100 : 0;

  const SWIPE_THRESHOLD = 100;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop || exitDirection) return;
      setIsDragging(true);
      setStartX(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isTop, exitDirection],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setDragX(e.clientX - startX);
    },
    [isDragging, startX],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (dragX < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
    setDragX(0);
  }, [isDragging, dragX, onSwipeLeft, onSwipeRight]);

  // Compute transform
  let translateX = dragX;
  let rotation = isDragging ? dragX * 0.05 : 0;
  let cardOpacity = 1;
  let transition = isDragging
    ? "none"
    : "transform 0.4s ease, opacity 0.4s ease";

  if (exitDirection === "left") {
    translateX = -500;
    rotation = -15;
    cardOpacity = 0;
    transition = "transform 0.4s ease, opacity 0.4s ease";
  } else if (exitDirection === "right") {
    translateX = 500;
    rotation = 15;
    cardOpacity = 0;
    transition = "transform 0.4s ease, opacity 0.4s ease";
  }

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      style={{
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        opacity: cardOpacity,
        transition,
        zIndex: 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Beat card — matches prototype */}
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl"
        style={{
          animation:
            isTop && !isDragging && !exitDirection
              ? "cardWobble 3s ease-in-out infinite 1s"
              : "none",
        }}
      >
        {/* Cover image background (if available) */}
        {beat.cover_image_url && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${beat.cover_image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.35,
            }}
          />
        )}
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: beat.cover_image_url
              ? "linear-gradient(135deg, rgba(26,10,46,0.85) 0%, rgba(74,26,138,0.7) 30%, rgba(217,70,239,0.2) 70%, rgba(26,10,46,0.9) 100%)"
              : "linear-gradient(135deg, #1a0a2e 0%, #4a1a8a 30%, rgba(217,70,239,0.13) 70%, #1a0a2e 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-[1] flex h-full flex-col justify-end p-6">
          {/* Waveform */}
          <div className="flex flex-1 items-center justify-center gap-[3px] py-8">
            {WAVEFORM_BARS.map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm"
                style={{
                  height: h,
                  background: "var(--color-brand-gradient)",
                  opacity: 0.6,
                  animation: `waveAnimate 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Beat info */}
          <div className="text-center">
            <h3
              className="font-display font-bold text-white"
              style={{ fontSize: 22, marginBottom: 4 }}
            >
              {beat.title}
            </h3>
            <p
              className="text-text-secondary"
              style={{ fontSize: 14, marginBottom: 12 }}
            >
              Prod. by AquaBeat
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {beat.bpm && <span className="pill">{beat.bpm} BPM</span>}
              {beat.key && <span className="pill">{beat.key}</span>}
              {beat.genre && <span className="pill">{beat.genre}</span>}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 3, background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-sm"
            style={{ width: `${audioProgress}%`, background: "var(--color-brand-gradient)", transition: "width 0.1s linear" }}
          />
        </div>
      </div>
    </div>
  );
}
