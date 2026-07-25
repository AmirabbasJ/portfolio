import { useEffect, useState } from 'react';

import { formatUptime } from '../terminal/system';

function formatClock(now = new Date()) {
  const date = now
    .toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
    })
    .toUpperCase();
  const time = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join(':');
  return { date, time };
}

export function SystemHeader() {
  const [clock, setClock] = useState(() => formatClock());
  const [uptime, setUptime] = useState(() => formatUptime());

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      setClock(formatClock(now));
      setUptime(formatUptime(now));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sys-header">
      <div className="sys-grid">
        <div className="sys-cell">
          <span className="sys-label">DATE</span>
          <span className="sys-value sys-value--emphasis">{clock.date}</span>
        </div>
        <div className="sys-cell">
          <span className="sys-label">TIME</span>
          <span className="sys-value sys-value--clock">{clock.time}</span>
        </div>
        <div className="sys-cell">
          <span className="sys-label">UPTIME</span>
          <span className="sys-value">{uptime}</span>
        </div>
        <div className="sys-cell">
          <span className="sys-label">TYPE</span>
          <span className="sys-value sys-value--soft">linux</span>
        </div>
        <div className="sys-cell">
          <span className="sys-label">STATE</span>
          <span className="sys-value sys-value--ok">ONLINE</span>
        </div>
      </div>
    </header>
  );
}
