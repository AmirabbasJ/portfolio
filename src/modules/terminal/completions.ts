import { skillGroups } from '../../data';
import { COMMANDS } from './commands';
import { fileSystem } from './system';

function getCatCompletions(arg: string, currDir: string): string[] {
  const dirFiles = fileSystem[currDir as keyof typeof fileSystem];
  return dirFiles.filter((f) => f.toLowerCase().startsWith(arg)).map((f) => f);
}

function getExpCompletions(arg: string): string[] {
  return getCatCompletions(arg, 'work').map((f) => f.split('.')[0]!);
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
    const arg = args[0]!;

    if (q === 'cat') {
      return getCatCompletions(arg, currDir).map((file) => `${q} ${file}`);
    }
    if (q === 'exp' || q === 'experience') {
      return getExpCompletions(arg).map((exp) => `${q} ${exp}`);
    }
    if (q === 'skills' || q === 'skill') {
      return getSkillsCompletions(arg).map((skill) => `${q} ${skill}`);
    }
    if (q === 'cd') {
      return getCdCompletions(arg).map((module) => `${q} ${module}`);
    }

    return [];
  }

  return COMMANDS.filter((c) => {
    return c.startsWith(q);
  });
}
