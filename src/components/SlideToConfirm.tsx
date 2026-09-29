"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type SlideToConfirmHandle = {
  reset: () => void;
};

// Thumb sits inset from the track rather than flush edge-to-edge — flush
// made the thumb's circle clip against the track's own rounded corner
// (the track's 1px border eats into its effective corner radius), which
// looked like a badly-rounded seam at both ends.
const THUMB_SIZE = 48;
const THUMB_INSET = 4;
const CONFIRM_THRESHOLD = 0.85;

const SlideToConfirm = forwardRef<
  SlideToConfirmHandle,
  {
    label: string;
    busyLabel?: string;
    disabled?: boolean;
    onConfirm: () => void;
  }
>(function SlideToConfirm({ label, busyLabel = "Saving…", disabled, onConfirm }, ref) {
  const trackRef = useRef<HTMLDivElement>(null);
  const maxXRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      setBusy(false);
      setDragging(false);
      setDragX(0);
    }
  }));

  function getMaxX() {
    const trackWidth = trackRef.current?.clientWidth ?? THUMB_SIZE + THUMB_INSET * 2;
    return Math.max(0, trackWidth - THUMB_SIZE - THUMB_INSET * 2);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (busy || disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    maxXRef.current = getMaxX();
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left - THUMB_INSET - THUMB_SIZE / 2;
    setDragX(Math.max(0, Math.min(maxXRef.current, x)));
  }

  function complete() {
    setDragging(false);
    setDragX(maxXRef.current);
    setBusy(true);
    onConfirm();
  }

  function handlePointerUp() {
    if (!dragging) return;
    const max = maxXRef.current || 1;
    if (dragX / max >= CONFIRM_THRESHOLD) {
      complete();
    } else {
      setDragging(false);
      setDragX(0);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === " ") && !busy && !disabled) {
      e.preventDefault();
      maxXRef.current = getMaxX();
      complete();
    }
  }

  const max = maxXRef.current || 1;
  const percent = dragging || busy ? Math.min(100, (dragX / max) * 100) : 0;

  return (
    <div
      ref={trackRef}
      className="relative h-14 w-full touch-none select-none overflow-hidden rounded-full border border-line bg-surface"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-ledger/20"
        style={{ width: `${percent}%`, transition: dragging ? "none" : "width 300ms ease" }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="font-body text-sm text-ink/60">{busy ? busyLabel : label}</span>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-disabled={disabled || busy}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`btn-glow absolute touch-none rounded-full bg-ledger text-paper ${
          busy || disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          top: THUMB_INSET,
          left: THUMB_INSET,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 300ms ease"
        }}
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
              d="M6 3l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
});

export default SlideToConfirm;
