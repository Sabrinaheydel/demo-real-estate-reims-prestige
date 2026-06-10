import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  photos: string[];
  open: boolean;
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
  alt?: string;
};

export function Lightbox({ photos, open, index, onClose, onChange, alt = "" }: Props) {
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);

  const next = () => {
    setSlideDir("left");
    onChange((index + 1) % photos.length);
  };
  const prev = () => {
    setSlideDir("right");
    onChange((index - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, photos.length]);

  useEffect(() => {
    if (!slideDir) return;
    const t = setTimeout(() => setSlideDir(null), 150);
    return () => clearTimeout(t);
  }, [slideDir, index]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absY > 80 && absY > absX && dy > 0) {
      onClose();
    } else if (absX > 50 && absX > absY) {
      if (dx < 0) next();
      else prev();
    }
    touchStart.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.95)", animationDuration: "200ms" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galerie photos"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Fermer"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X size={22} />
      </button>

      {/* Desktop arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Photo précédente"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Photo suivante"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors"
      >
        <ChevronRight size={26} />
      </button>

      {/* Mobile tap zones */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Photo précédente"
        className="sm:hidden absolute left-0 top-0 bottom-0 w-[40%] z-[5]"
        style={{ background: "transparent" }}
      />
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Photo suivante"
        className="sm:hidden absolute right-0 top-0 bottom-0 w-[40%] z-[5]"
        style={{ background: "transparent" }}
      />

      <div
        className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={index}
          src={photos[index]}
          alt={alt}
          className="max-w-[95vw] max-h-[90vh] object-contain select-none"
          style={{
            touchAction: "pinch-zoom",
            animation:
              slideDir === "left"
                ? "slideFromRight 150ms ease-out"
                : slideDir === "right"
                  ? "slideFromLeft 150ms ease-out"
                  : "fadeOnly 150ms ease-out",
          }}
          draggable={false}
        />
      </div>

      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-3 py-1 rounded-full bg-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {index + 1} / {photos.length}
      </div>

      <style>{`
        @keyframes slideFromRight { from { transform: translateX(40px); opacity: 0.4 } to { transform: translateX(0); opacity: 1 } }
        @keyframes slideFromLeft { from { transform: translateX(-40px); opacity: 0.4 } to { transform: translateX(0); opacity: 1 } }
        @keyframes fadeOnly { from { opacity: 0.6 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
