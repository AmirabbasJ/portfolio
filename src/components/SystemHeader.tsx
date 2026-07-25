import { useEffect, useState } from 'react';

const SESSION_START = Date.now();

function formatSessionUptime(now = Date.now()): string {
  const totalSec = Math.floor(Math.max(0, now - SESSION_START) / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

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
  const [uptime, setUptime] = useState(() => formatSessionUptime());

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      setClock(formatClock(now));
      setUptime(formatSessionUptime(now.getTime()));
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
