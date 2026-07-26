export const fileSystem = {
  home: ['status.txt'],
  work: ['DROPP.md', 'LINKDENT.md', 'STARTDONE.md', 'THEPERSA.md'],
  about: ['about.txt', 'skills.json'],
  contact: ['contact.md'],
} as const;

export type Directory = keyof typeof fileSystem;
export const directories = Object.keys(fileSystem) as Directory[];

export const CAREER_START = new Date('2022-01-01T00:00:00Z');

export function formatUptime(now = new Date()): string {
  const ms = Math.max(0, now.getTime() - CAREER_START.getTime());
  const totalSec = Math.floor(ms / 1000);
  const years = Math.floor(totalSec / 31536000);
  const days = Math.floor((totalSec % 31536000) / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${years}y ${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}
