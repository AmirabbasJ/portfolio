export type OutputTone = 'accent' | 'dim' | 'error' | 'label' | 'warn';

export interface OutputSegment {
  text: string;
  tone?: OutputTone;
}

export type OutputLine =
  | { kind: 'badge'; text: string }
  | { kind: 'cmd'; text: string }
  | { kind: 'heading'; segments: OutputSegment[] }
  | { kind: 'key-value'; key: string; value: string; href?: string }
  | { kind: 'mark' }
  | { kind: 'p'; segments: OutputSegment[] }
  | { kind: 'text'; segments: OutputSegment[]; gap?: 'lg' }
  | { kind: 'tip'; text: string };

export function text(raw: string, tone?: OutputTone, gap?: 'lg'): OutputLine {
  return { kind: 'text', segments: [{ text: raw, tone }], gap };
}

export function heading(raw: string, tone?: OutputTone): OutputLine {
  return { kind: 'heading', segments: [{ text: raw, tone }] };
}

export function para(raw: string, tone?: OutputTone): OutputLine {
  return { kind: 'p', segments: [{ text: raw, tone }] };
}

export function mixed(...segments: OutputSegment[]): OutputLine {
  return { kind: 'text', segments };
}
