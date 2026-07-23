import { useEffect, useState } from 'react'

const SESSION_START = Date.now()

function formatSessionUptime(now = Date.now()): string {
  const totalSec = Math.floor(Math.max(0, now - SESSION_START) / 1000)
  const hours = Math.floor(totalSec / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function formatDateParts(now = new Date()) {
  const year = String(now.getFullYear())
  const day = now
    .toLocaleString('en-US', { month: 'short', day: '2-digit' })
    .toUpperCase()
  return { year, day }
}

export function SystemHeader() {
  const [uptime, setUptime] = useState(() => formatSessionUptime())
  const [date, setDate] = useState(() => formatDateParts())

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date()
      setUptime(formatSessionUptime(now.getTime()))
      setDate(formatDateParts(now))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="sys-header">
      <div className="sys-grid">
        <div className="sys-cell">
          <span className="sys-label">{date.year}</span>
          <span className="sys-value">{date.day}</span>
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
        <div className="sys-cell">
          <span className="sys-label">IPv4</span>
          <span className="sys-value">41.72.199.38</span>
        </div>
        <div className="sys-cell">
          <span className="sys-label">PING</span>
          <span className="sys-value">87ms</span>
        </div>
      </div>
    </header>
  )
}
