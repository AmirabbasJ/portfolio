import { experience, profile, skillGroups } from '../data/resume';
import { modules, type ModuleId } from './system';

export type OutputTone = 'dim' | 'accent' | 'error' | 'label' | 'warn';

export type OutputSegment = {
  text: string;
  tone?: OutputTone;
};

export type OutputLine =
  | { kind: 'text'; segments: OutputSegment[] }
  | { kind: 'heading'; segments: OutputSegment[] }
  | { kind: 'p'; segments: OutputSegment[] }
  | { kind: 'cmd'; text: string }
  | { kind: 'badge'; text: string }
  | { kind: 'rule' }
  | { kind: 'kv'; key: string; value: string }
  | { kind: 'tip'; text: string }
  | { kind: 'mark' };

export type CommandResult = {
  lines: OutputLine[];
  openUrl?: string;
  clear?: boolean;
  module?: ModuleId;
};

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
  'fetch',
  'ls',
  'clear',
  'cls',
  'history',
  'status',
  'cd',
  'cat',
].toSorted();

const fileSystem = {
  home: [{ fileName: 'status.txt', content: statusLines() }],
  work: [
    { fileName: 'dropp.md', content: experienceCmd(['dropp']) },
    { fileName: 'linkdent.md', content: experienceCmd(['linkdent']) },
    { fileName: 'startdone.md', content: experienceCmd(['startdone']) },
    { fileName: 'thepersa.md', content: experienceCmd(['thepersa']) },
  ],
  about: [
    { fileName: 'about.txt', content: aboutCmd() },
    { fileName: 'skills.json', content: skillsCmd([]) },
  ],
  contact: [{ fileName: 'contact.md', content: contactCmd() }],
};

function getCatCompletions(arg: string, currDir: string): string[] {
  const dirFiles = fileSystem[currDir as keyof typeof fileSystem];
  return (
    dirFiles
      ?.filter((f) => f.fileName.startsWith(arg))
      .map((f) => f.fileName) ?? []
  );
}

function getCdCompletions(arg: string): string[] {
  return modules.filter((m) => m.id.startsWith(arg)).map((m) => m.id);
}

export function getCompletions(partials: string[], currDir: string): string[] {
  const [q, ...args] = partials;
  if (!q) return [...COMMANDS];
  if (q === 'cat') {
    return getCatCompletions(args[0], currDir).map((file) => `${q} ${file}`);
  }
  if (q === 'cd') {
    return getCdCompletions(args[0]).map((module) => `${q} ${module}`);
  }

  return args.length > 0
    ? []
    : COMMANDS.filter((c) => {
        return c.startsWith(q);
      });
}

function text(raw: string, tone?: OutputTone): OutputLine {
  return { kind: 'text', segments: [{ text: raw, tone }] };
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
      text('  contact                Email / GitHub'),
      text('  github | gh            Open GitHub'),
      text('  info                   System summary'),
      text('  ls                     Virtual filesystem'),
      text('  clear                  Clear scrollback'),
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
      { text: ' — React & Next.js for 4+ years.' },
    ),
    text(
      '  Building multi-tenant platforms, health dashboards, and production admin systems end-to-end.',
    ),
    text(
      '  Currently freelancing on LinkDent — a B2B dental platform for clinics & practitioners.',
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
      text(`${experience.length} entries — type: experience <company>`, 'dim'),
    ];
    experience.forEach((job, i) => {
      const n = String(i + 1).padStart(2, '0');
      lines.push(
        mixed(
          { text: `${n}  `, tone: 'dim' },
          { text: `${job.company.toUpperCase()}`, tone: 'accent' },
          { text: `  ${job.role}` },
        ),
        text(`    ${job.location} · ${job.period}`, 'dim'),
      );
    });
    return { lines, module: 'work' };
  }

  const job = experience.find(
    (j) =>
      j.company.toLowerCase().includes(query) ||
      j.location.toLowerCase().includes(query),
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
      { kind: 'cmd', text: `cat ${job.company.toUpperCase()}.exp` },
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
      { kind: 'kv', key: 'EMAIL', value: contact.email },
      { kind: 'kv', key: 'GITHUB', value: `@${contact.github}` },
      { kind: 'kv', key: 'URL', value: contact.githubUrl },
      text('Run: github   to open the profile', 'dim'),
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
  const file = dirFiles?.find((f) => f.fileName === fileName);
  return file?.content ?? { lines: [text('file not found')] };
}

function ls(currDir: string): CommandResult {
  const dirFiles = fileSystem[currDir as keyof typeof fileSystem];

  return {
    lines: [
      { kind: 'cmd', text: 'ls -la' },
      ...(dirFiles?.map((f) => text(`-rw-  ${f.fileName}`)) ?? []),
      text(`cd <module> or click the nav below`, 'dim'),
    ],
  };
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
    case 'info':
      return fetchCmd();
    case 'ls':
      return args.length > 0
        ? { lines: [text("ls doesn't work with arguments")] }
        : ls(currDir);
    case 'cd': {
      const target = (args[0] ?? '').replace(/^\.\//, '').replace(/\/$/, '');
      const mod = modules.find(
        (m) =>
          m.id === target ||
          m.label.toLowerCase() === target.toLowerCase() ||
          m.index === target,
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
