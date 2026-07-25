export type ModuleId = 'about' | 'contact' | 'home' | 'work';

export const modules: { id: ModuleId; label: string; index: string }[] = [
  { id: 'home', label: 'HOME', index: '01' },
  { id: 'work', label: 'WORK', index: '02' },
  { id: 'about', label: 'ABOUT', index: '03' },
  { id: 'contact', label: 'CONTACT', index: '04' },
];

export const CAREER_START = new Date('2022-01-01T00:00:00Z');

export function formatUptime(now = new Date()): string {
  const ms = Math.max(0, now.getTime() - CAREER_START.getTime());
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}
