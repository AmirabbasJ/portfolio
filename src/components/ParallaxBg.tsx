import { useEffect, useRef } from 'react';

import asciiAnimation from '../assets/ascii-animation.mp4';

const MAX_DEG = 10;
const EASE = 0.08;

export function ParallaxBg() {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef({ rx: 0, ry: 0 });
  const currentRef = useRef({ rx: 0, ry: 0 });

  useEffect(() => {
    const video = videoRef.current;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (video) {
      if (reduceMotion) {
        video.pause();
      } else {
        void video.play().catch(() => {
          console.error('Failed to play video');
        });
      }
    }

    if (reduceMotion) return;

    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRef.current = { rx: -ny * MAX_DEG, ry: nx * MAX_DEG };
    };

    const recenter = () => {
      targetRef.current = { rx: 0, ry: 0 };
    };

    const tick = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      c.rx += (t.rx - c.rx) * EASE;
      c.ry += (t.ry - c.ry) * EASE;
      const el = layerRef.current;

      if (el) {
        el.style.transform = `rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', recenter);
    window.addEventListener('blur', recenter);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', recenter);
      window.removeEventListener('blur', recenter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="parallax-bg" aria-hidden>
      <div ref={layerRef} className="parallax-bg__layer">
        <video
          ref={videoRef}
          className="parallax-bg__video"
          src={asciiAnimation}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className="parallax-bg__veil" />
    </div>
  );
}
