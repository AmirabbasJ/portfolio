import { experience, profile, skillGroups } from '@data';

import type { OutputLine } from './outputLine';
import type { Directory } from './system';

import { heading, mixed, para, text } from './outputLine';
import { directories, fileSystem } from './system';

export interface CommandResult {
  lines: OutputLine[];
  openUrl?: string;
  clear?: boolean;
  directory?: Directory;
  shutdown?: boolean;
}

export const COMMANDS = [
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

function historyCmd(history: string[]): CommandResult {
  return {
    lines:
      history.length === 0
        ? [text('(empty)', 'dim')]
        : history.map((h, i) => text(`  ${i + 1}  ${h}`)),
  };
}

const fileCommandResultMap: Record<string, CommandResult> = {
  'status.txt': statusCmd(),
  'DROPP.md': experienceCmd(['dropp']),
  'LINKDENT.md': experienceCmd(['linkdent']),
  'STARTDONE.md': experienceCmd(['startdone']),
  'THEPERSA.md': experienceCmd(['thepersa']),
  'about.txt': aboutCmd(),
  'skills.json': skillsCmd([]),
  'contact.md': contactCmd(),
};

function helpCmd(): CommandResult {
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
        text: '← → directories when input empty · Tab autocomplete · Ctrl+L clear',
      },
    ],
  };
}

export function aboutCmd(): CommandResult {
  return {
    lines: [para(profile.summary)],
  };
}

export function whoamiCmd(): CommandResult {
  return {
    lines: [
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
    ],
  };
}

export function statusCmd(): CommandResult {
  return {
    lines: [
      {
        kind: 'key-value',
        key: 'LOCATION',
        value: 'Remote · IR / open worldwide',
      },
      {
        kind: 'key-value',
        key: 'FOCUS',
        value: 'React · Next.js · TypeScript',
      },
      { kind: 'key-value', key: 'CONTACT', value: profile.contact.email },
      {
        kind: 'badge',
        text: 'OPEN TO WORK — FREELANCE + FULL-TIME',
      },
    ],
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
    return { lines };
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
      text(job.summary),
      heading('TECH', 'dim'),
      text(job.tech.join(' · ')),
      heading('HIGHLIGHTS', 'dim'),
      ...job.highlights.map((h) => para(`› ${h}`)),
    ],
  };
}

export function skillsCmd(args: string[]): CommandResult {
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

  return { lines };
}

export function contactCmd(): CommandResult {
  const { contact } = profile;
  return {
    lines: [
      {
        kind: 'key-value',
        key: 'EMAIL',
        value: contact.email,
        href: `mailto:${contact.email}`,
      },
      {
        kind: 'key-value',
        key: 'GITHUB',
        value: contact.github,
        href: contact.githubUrl,
      },
      {
        kind: 'key-value',
        key: 'LINKEDIN',
        value: contact.linkedin,
        href: contact.linkedinUrl,
      },
    ],
  };
}

function linkedinCmd(): CommandResult {
  return {
    lines: [text(`Opening ${profile.contact.linkedinUrl} …`, 'dim')],
    openUrl: profile.contact.linkedinUrl,
  };
}

function githubCmd(): CommandResult {
  return {
    lines: [text(`Opening ${profile.contact.githubUrl} …`, 'dim')],
    openUrl: profile.contact.githubUrl,
  };
}

function infoCmd(): CommandResult {
  return {
    lines: [
      text(`${profile.name.toLowerCase().replace(/\s+/g, '')}@aj`, 'accent'),
      text('------------------------------', 'dim'),
      { kind: 'key-value', key: 'ROLE', value: profile.title },
      { kind: 'key-value', key: 'YEARS', value: '4+' },
      { kind: 'key-value', key: 'STACK', value: 'React, Next.js, TypeScript' },
      { kind: 'key-value', key: 'SHELL', value: 'ajsh 1.0' },
      {
        kind: 'key-value',
        key: 'STATUS',
        value: 'open to freelance & full-time',
      },
    ],
  };
}

function catCmd(arg: string, curDir: string): CommandResult {
  const fileName = arg;
  const dirFiles = fileSystem[curDir as keyof typeof fileSystem];
  const file = dirFiles.find((f) => f === fileName);
  const content = file ? fileCommandResultMap[file] : null;
  return content ?? { lines: [text('file not found')] };
}

function lsCmd(currDir: string): CommandResult {
  const dirFiles = fileSystem[currDir as keyof typeof fileSystem];

  return {
    lines: [
      { kind: 'cmd', text: 'ls -la' },
      ...dirFiles.map((f) => text(`-rw-  ${f}`)),
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
  const dir = directories.find((d) => d.toLowerCase() === target.toLowerCase());

  if (!dir) {
    return {
      lines: [
        text(`cd: no such module: ${args[0] ?? ''}`, 'error'),
        text(`directories: ${directories.join(', ')}`, 'dim'),
      ],
    };
  }

  return { lines: [], directory: dir, clear: true };
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
      return helpCmd();

    case 'experience':

    case 'exp':
      return experienceCmd(args);

    case 'contact':
      return contactCmd();

    case 'whoami':
      return whoamiCmd();

    case 'skills':

    case 'skill':
      return skillsCmd(args);

    case 'status':
      return statusCmd();

    case 'github':

    case 'gh':
      return githubCmd();

    case 'linkedin':

    case 'li':
      return linkedinCmd();

    case 'info':
      return infoCmd();

    case 'ls':
      return args.length > 0
        ? { lines: [text("ls doesn't work with arguments")] }
        : lsCmd(currDir);

    case 'cd':
      return cdCmd(args);

    case 'clear':

    case 'cls':
      return { lines: [], clear: true };

    case 'history':
      return historyCmd(history);

    case 'cat':
      return catCmd(args[0], currDir);

    case 'about':
      return aboutCmd();

    default:
      return {
        lines: [
          text(`command not found: ${rawName}`, 'error'),
          text("Type 'help' for available commands.", 'dim'),
        ],
      };
  }
}
