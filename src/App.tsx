import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ParallaxBg } from './components/ParallaxBg';
import './index.css';
import { Terminal } from './Terminal';

type Phase = 'dead' | 'flash' | 'live';

export default function App() {
  const [phase, setPhase] = useState<Phase>('live');

  const beginShutdown = useCallback(() => {
    setPhase('flash');
    document.documentElement.classList.add('tv-powered-off');
  }, []);

  useEffect(() => {
    if (phase !== 'flash') return;
    const flash = document.querySelector('.tv-flash');

    const finish = (e?: Event) => {
      if (e && e.target !== flash) return;
      setPhase('dead');
    };

    flash?.addEventListener('animationend', finish);
    const fallback = window.setTimeout(() => setPhase('dead'), 800);

    return () => {
      flash?.removeEventListener('animationend', finish);
      window.clearTimeout(fallback);
    };
  }, [phase]);

  if (phase === 'dead') return null;

  return (
    <>
      {phase === 'live' && (
        <div className="crt-stage">
          <ParallaxBg />
          <Terminal onShutdown={beginShutdown} />
        </div>
      )}
      {phase === 'flash' &&
        createPortal(
          <div className="tv-flash" aria-hidden="true" />,
          document.body
        )}
    </>
  );
}
