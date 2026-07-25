import type { ModuleId } from './system';

import { experience, profile, skillGroups } from '../data/resume';
import { modules } from './system';

export type OutputTone = 'accent' | 'dim' | 'error' | 'label' | 'warn';

export interface OutputSegment {
  text: string;
  tone?: OutputTone;
}

export type OutputLine =
  | { kind: 'badge'; text: string }
  | { kind: 'cmd'; text: string }
  | { kind: 'heading'; segments: OutputSegment[] }
  | { kind: 'kv'; key: string; value: string; href?: string }
  | { kind: 'mark' }
  | { kind: 'p'; segments: OutputSegment[] }
  | { kind: 'rule' }
  | { kind: 'text'; segments: OutputSegment[]; gap?: 'lg' }
  | { kind: 'tip'; text: string };

export interface CommandResult {
  lines: OutputLine[];
  openUrl?: string;
  clear?: boolean;
  module?: ModuleId;
  shutdown?: boolean;
}

const COMMANDS = [
  'help',
  'home',
  'work',
  'about',
  'contact',
  'whoami',
  'experience',
  'exp',
  'skills',
  'github',
  'linkedin',
  'fetch',
  'ls',
  'clear',
  'cls',
  'history',
  'status',
  'cd',
  'cat',
  'shutdown',
].toSorted();

const fileSystem = {
  home: [{ fileName: 'status.txt', content: statusLines() }],
  work: [
    { fileName: 'DROPP.md', content: experienceCmd(['dropp']) },
    { fileName: 'LINKDENT.md', content: experienceCmd(['linkdent']) },
    { fileName: 'STARTDONE.md', content: experienceCmd(['startdone']) },
    { fileName: 'THEPERSA.md', content: experienceCmd(['thepersa']) },
  ],
  about: [
    { fileName: 'about.txt', content: aboutCmd() },
    { fileName: 'skills.json', content: skillsCmd([]) },
  ],
  contact: [{ fileName: 'contact.md', content: contactCmd() }],
};

function getCatCompletions(arg: string, currDir: string): string[] {
  const dirFiles = fileSystem[currDir as keyof typeof fileSystem];
  return dirFiles
    .filter((f) => f.fileName.toLowerCase().startsWith(arg))
    .map((f) => f.fileName);
}

function getExpCompletions(arg: string): string[] {
  return getCatCompletions(arg, 'work').map((f) => f.split('.')[0]);
}

function getSkillsCompletions(arg: string): string[] {
  return skillGroups
    .filter((g) => g.label.toLowerCase().startsWith(arg))
    .map((g) => g.label);
}

function getCdCompletions(arg: string): string[] {
  const dir = arg.replace(/^\//, '').replace(/\/$/, '');
  return Object.keys(fileSystem)
    .filter((m) => m.toLowerCase().startsWith(dir))
    .map((m) => `/${m}`);
}

export function getCompletions(partials: string[], currDir: string): string[] {
  const [q, ...args] = partials;
  if (!q) return [...COMMANDS];

  if (args.length > 0) {
    if (q === 'cat') {
      return getCatCompletions(args[0], currDir).map((file) => `${q} ${file}`);
    }
    if (q === 'exp' || q === 'experience') {
      return getExpCompletions(args[0]).map((exp) => `${q} ${exp}`);
    }
    if (q === 'skills' || q === 'skill') {
      return getSkillsCompletions(args[0]).map((skill) => `${q} ${skill}`);
    }
    if (q === 'cd') {
      return getCdCompletions(args[0]).map((module) => `${q} ${module}`);
    }

    return [];
  }

  return COMMANDS.filter((c) => {
    return c.startsWith(q);
  });
}

function text(raw: string, tone?: OutputTone, gap?: 'lg'): OutputLine {
  return { kind: 'text', segments: [{ text: raw, tone }], gap };
}

function heading(raw: string, tone?: OutputTone): OutputLine {
  return { kind: 'heading', segments: [{ text: raw, tone }] };
}

function para(raw: string, tone?: OutputTone): OutputLine {
  return { kind: 'p', segments: [{ text: raw, tone }] };
}

function mixed(...segments: OutputSegment[]): OutputLine {
  return { kind: 'text', segments };
}

function help(): CommandResult {
  return {
    lines: [
      text('Available commands', 'dim'),
      text('  help                   Show this list'),
      text('  whoami                 Bio'),
      text('  experience | exp       Work history (exp <company>)'),
      text('  skills | skill         Tech inventory'),
      text('  status                 Live status block'),
      text('  contact                Email / GitHub / LinkedIn'),
      text('  github | gh            Open GitHub'),
      text('  linkedin | li          Open LinkedIn'),
      text('  info                   System summary'),
      text('  ls                     Virtual filesystem'),
      text('  clear                  Clear scrollback'),
      mixed(
        { text: '  shutdown               ' },
        { text: 'Probably not a good idea', tone: 'error' }
      ),
      {
        kind: 'tip',
        text: '← → modules when input empty · Tab autocomplete · Ctrl+L clear',
      },
    ],
  };
}

export function aboutCmd(): CommandResult {
  return {
    lines: [para(profile.summary)],
  };
}

export function whoamiLines(): OutputLine[] {
  return [
    mixed(
      { text: '  Frontend engineer who ships. ' },
      { text: profile.name, tone: 'accent' },
      { text: ' — React & Next.js for 4+ years.' }
    ),
    text(
      '  Building multi-tenant platforms, health dashboards, and production admin systems end-to-end.'
    ),
    text(
      '  Currently freelancing on LinkDent — a B2B dental platform for clinics & practitioners.'
    ),
  ];
}

export function statusLines(): CommandResult {
  return {
    lines: [
      { kind: 'kv', key: 'LOCATION', value: 'Remote · IR / open worldwide' },
      {
        kind: 'kv',
        key: 'FOCUS',
        value: 'React · Next.js · TypeScript',
      },
      { kind: 'kv', key: 'CONTACT', value: profile.contact.email },
      {
        kind: 'badge',
        text: 'OPEN TO WORK — FREELANCE + FULL-TIME',
      },
    ],
    module: 'home',
  };
}

export function experienceCmd(args: string[]): CommandResult {
  const query = args.join(' ').trim().toLowerCase();

  if (!query) {
    const lines: OutputLine[] = [
      text(`${experience.length} entries — type: exp <company>`, 'dim'),
    ];
    experience.forEach((job, i) => {
      const n = String(i + 1).padStart(2, '0');
      lines.push(
        mixed(
          { text: `${n}  `, tone: 'dim' },
          { text: job.company.toUpperCase(), tone: 'accent' },
          { text: `  ${job.role}` }
        ),
        text(`    ${job.location} · ${job.period}`, 'dim', 'lg')
      );
    });
    return { lines, module: 'work' };
  }

  const job = experience.find(
    (j) =>
      j.company.toLowerCase().includes(query) ||
      j.location.toLowerCase().includes(query)
  );

  if (!job) {
    return {
      lines: [
        text(`No match for "${args.join(' ')}"`, 'error'),
        text(`Known: ${experience.map((j) => j.company).join(', ')}`, 'dim'),
      ],
    };
  }

  return {
    lines: [
      text(job.company.toUpperCase(), 'accent'),
      text(`${job.role} · ${job.location}`),
      heading(job.period, 'dim'),
      para(job.summary),
      heading('TECH', 'dim'),
      text(job.tech.join(' · ')),
      heading('HIGHLIGHTS', 'dim'),
      ...job.highlights.map((h) => para(`› ${h}`)),
    ],
    module: 'work',
  };
}

function skillsCmd(args: string[]): CommandResult {
  const query = args.join(' ').trim().toLowerCase();
  const lines: OutputLine[] = [];

  const groups = query
    ? skillGroups.filter((g) => g.label.toLowerCase().includes(query))
    : [...skillGroups];

  if (groups.length === 0) {
    return {
      lines: [
        text(`No group matching "${args.join(' ')}"`, 'error'),
        text(`Groups: ${skillGroups.map((g) => g.label).join(', ')}`, 'dim'),
      ],
    };
  }

  for (const group of groups) {
    lines.push(heading(group.label.toUpperCase(), 'accent'));
    lines.push(text(`  ${group.items.join(' · ')}`));
  }

  return { lines, module: 'about' };
}

export function contactCmd(): CommandResult {
  const { contact } = profile;
  return {
    lines: [
      {
        kind: 'kv',
        key: 'EMAIL',
        value: contact.email,
        href: `mailto:${contact.email}`,
      },
      {
        kind: 'kv',
        key: 'GITHUB',
        value: contact.github,
        href: contact.githubUrl,
      },
      {
        kind: 'kv',
        key: 'LINKEDIN',
        value: contact.linkedin,
        href: contact.linkedinUrl,
      },
    ],
    module: 'contact',
  };
}

function fetchCmd(): CommandResult {
  return {
    lines: [
      text(`${profile.name.toLowerCase().replace(/\s+/g, '')}@aj`, 'accent'),
      text('------------------------------', 'dim'),
      { kind: 'kv', key: 'ROLE', value: profile.title },
      { kind: 'kv', key: 'YEARS', value: '4+' },
      { kind: 'kv', key: 'STACK', value: 'React, Next.js, TypeScript' },
      { kind: 'kv', key: 'SHELL', value: 'ajsh 1.0' },
      { kind: 'kv', key: 'STATUS', value: 'open to freelance & full-time' },
    ],
  };
}

function catCmd(arg: string, curDir: string): CommandResult {
  const fileName = arg;
  const dirFiles = fileSystem[curDir as keyof typeof fileSystem];
  const file = dirFiles.find((f) => f.fileName === fileName);
  return file?.content ?? { lines: [text('file not found')] };
}

function ls(currDir: string): CommandResult {
  const dirFiles = fileSystem[currDir as keyof typeof fileSystem];

  return {
    lines: [
      { kind: 'cmd', text: 'ls -la' },
      ...dirFiles.map((f) => text(`-rw-  ${f.fileName}`)),
      text(`cd <module> or click the nav below`, 'dim'),
    ],
  };
}

function shutdownCmd(): CommandResult {
  return {
    lines: [text('shutting down... ')],
    shutdown: true,
  };
}

function cdCmd(args: string[]): CommandResult {
  const target = (args[0] ?? '').replace(/^\//, '').replace(/\/$/, '');
  const mod = modules.find(
    (m) =>
      m.id === target ||
      m.label.toLowerCase() === target.toLowerCase() ||
      m.index === target
  );

  if (!mod) {
    return {
      lines: [
        text(`cd: no such module: ${args[0] ?? ''}`, 'error'),
        text(`modules: ${modules.map((m) => m.id).join(', ')}`, 'dim'),
      ],
    };
  }

  return { lines: [], module: mod.id, clear: true };
}

interface RunCommandOptions {
  input: string;
  history: string[];
  currDir: string;
}

export function runCommand({
  input,
  history,
  currDir,
}: RunCommandOptions): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };
  const [rawName, ...args] = trimmed.split(/\s+/);
  const name = rawName.toLowerCase();

  switch (name) {
    case 'shutdown':
      return shutdownCmd();

    case 'help':
      return help();

    case 'home':
      return { lines: [], module: 'home', clear: true };

    case 'work':
      return { ...experienceCmd([]), clear: true, module: 'work' };

    case 'experience':

    case 'exp':
      return experienceCmd(args);

    case 'about':
      if (args.length === 0) return { lines: [], module: 'about', clear: true };
      return skillsCmd(args);

    case 'contact':
      return { ...contactCmd(), clear: true };

    case 'whoami':
      return { lines: whoamiLines() };

    case 'skills':

    case 'skill':
      return skillsCmd(args);

    case 'status':
      return { lines: statusLines().lines };

    case 'github':

    case 'gh':
      return {
        lines: [text(`Opening ${profile.contact.githubUrl} …`, 'dim')],
        openUrl: profile.contact.githubUrl,
      };

    case 'linkedin':

    case 'li':
      return {
        lines: [text(`Opening ${profile.contact.linkedinUrl} …`, 'dim')],
        openUrl: profile.contact.linkedinUrl,
      };

    case 'info':
      return fetchCmd();

    case 'ls':
      return args.length > 0
        ? { lines: [text("ls doesn't work with arguments")] }
        : ls(currDir);

    case 'cd':
      return cdCmd(args);

    case 'clear':

    case 'cls':
      return { lines: [], clear: true };

    case 'history':
      return {
        lines:
          history.length === 0
            ? [text('(empty)', 'dim')]
            : history.map((h, i) => text(`  ${i + 1}  ${h}`)),
      };

    case 'echo':
      return { lines: [text(args.join(' '))] };

    case 'sudo':
      return { lines: [text('permission denied', 'error')] };

    case 'cat':
      return catCmd(args[0], currDir);

    default:
      return {
        lines: [
          text(`command not found: ${rawName}`, 'error'),
          text("Type 'help' for available commands.", 'dim'),
        ],
      };
  }
}
