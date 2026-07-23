import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  aboutCmd,
  contactCmd,
  experienceCmd,
  getCompletions,
  runCommand,
  statusLines,
  whoamiLines,
  type OutputLine,
} from '../terminal/commands';
import { modules, type ModuleId } from '../terminal/system';
import { ModuleNav } from './ModuleNav';
import { OutputBlock } from './OutputBlock';
import { SystemHeader } from './SystemHeader';

type ScrollLine =
  | { id: number; kind: 'out'; lines: OutputLine[] }
  | { id: number; kind: 'typed'; text: string };

let lineId = 0;
const nextId = () => ++lineId;

function moduleSeed(id: ModuleId): OutputLine[] {
  switch (id) {
    case 'home':
      return [
        { kind: 'mark' },
        ...whoamiLines(),
        { kind: 'cmd', text: 'cat status.txt' },
        ...statusLines().lines,
      ];
    case 'work': {
      const lines: OutputLine[] = [
        { kind: 'cmd', text: 'experience' },
        ...experienceCmd([]).lines,
      ];
      return lines;
    }
    case 'about':
      return [
        { kind: 'cmd', text: 'cat about.txt' },
        ...aboutCmd().lines,
        {
          kind: 'tip',
          text: 'type skills  or  skills testing  for the inventory',
        },
      ];
    case 'contact':
      return [
        { kind: 'cmd', text: 'cat contact.md' },
        ...contactCmd().lines,
        {
          kind: 'tip',
          text: 'type github  or  linkedin  to open in a new tab',
        },
      ];
  }
}

export function Terminal() {
  const [module, setModule] = useState<ModuleId>('home');
  const [scroll, setScroll] = useState<ScrollLine[]>(() => [
    { id: nextId(), kind: 'out', lines: moduleSeed('home') },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [autoComplete, setAutoComplete] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stickModeRef = useRef<'top' | 'bottom'>('top');

  const placeholder = 'type a command (try: help)';

  useLayoutEffect(() => {
    if (stickModeRef.current === 'top') {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = 0;
      requestAnimationFrame(() => {
        el.scrollTop = 0;
      });
      return;
    }
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [scroll, module]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, module]);

  const goModule = useCallback((id: ModuleId) => {
    stickModeRef.current = 'top';
    setModule(id);
    setScroll([{ id: nextId(), kind: 'out', lines: moduleSeed(id) }]);
    setInput('');
    setHistIndex(null);
    window.location.hash = id;
  }, []);

  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '') as ModuleId;
    if (modules.some((m) => m.id === fromHash) && fromHash !== 'home')
      goModule(fromHash);
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value.trim()) {
        setInput('');
        return;
      }

      const nextHistory = [...history, value];
      setHistory(nextHistory);
      setHistIndex(null);
      setDraft('');

      const result = runCommand({
        input: value,
        history: nextHistory,
        currDir: module,
      });

      if (result.module && result.clear) {
        stickModeRef.current = 'top';
        setModule(result.module);
        window.location.hash = result.module;
        setScroll([
          {
            id: nextId(),
            kind: 'out',
            lines:
              result.lines.length > 0
                ? result.lines
                : moduleSeed(result.module),
          },
        ]);
        setInput('');
        return;
      }

      if (result.clear && !result.module) {
        stickModeRef.current = 'top';
        setScroll([{ id: nextId(), kind: 'out', lines: moduleSeed(module) }]);
        setInput('');
        return;
      }

      if (result.openUrl) {
        window.open(result.openUrl, '_blank', 'noopener,noreferrer');
      }

      if (result.module) {
        setModule(result.module);
        window.location.hash = result.module;
      }

      stickModeRef.current = 'bottom';
      setScroll((prev) => [
        ...prev,
        { id: nextId(), kind: 'typed', text: value },
        ...(result.lines.length
          ? [{ id: nextId(), kind: 'out' as const, lines: result.lines }]
          : []),
      ]);
      setInput('');
    },
    [history, module],
  );

  const cycleModule = (dir: 1 | -1) => {
    const idx = modules.findIndex((m) => m.id === module);
    const next = modules[(idx + dir + modules.length) % modules.length];
    if (next) goModule(next.id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input);
      setAutoComplete('');
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      stickModeRef.current = 'bottom';
      setScroll((prev) => [
        ...prev,
        { id: nextId(), kind: 'typed', text: `${input}^C` },
      ]);
      setInput('');
      setAutoComplete('');
      setHistIndex(null);
      return;
    }

    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setAutoComplete('');
      stickModeRef.current = 'top';
      setScroll([{ id: nextId(), kind: 'out', lines: moduleSeed(module) }]);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      setAutoComplete('');
      const parts = input.split(/\s+/).map((i) => i.trim().toLowerCase());
      if(parts.length > 2) return;
      const matches = getCompletions(parts, module);
      if (matches.length === 1) {
        setInput(`${matches[0]} `);
      } else if (matches.length > 1) {
        stickModeRef.current = 'bottom';
        setScroll((prev) => [
          ...prev,
          {
            id: nextId(),
            kind: 'out',
            lines: [
              {
                kind: 'text',
                segments: [
                  {
                    text: matches
                      .map((m) => m.replace(parts[0] ?? '', ''))
                      .join('   '),
                    tone: 'dim',
                  },
                ],
              },
            ],
          },
        ]);
      }
      return;
    }

    // Module cycling when input empty (ZUI-style)
    if (!input && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      cycleModule(e.key === 'ArrowLeft' ? -1 : 1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      if (histIndex === null) {
        setDraft(input);
        const i = history.length - 1;
        setHistIndex(i);
        setInput(history[i] ?? '');
      } else if (histIndex > 0) {
        const i = histIndex - 1;
        setHistIndex(i);
        setInput(history[i] ?? '');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex === null) return;
      if (histIndex < history.length - 1) {
        const i = histIndex + 1;
        setHistIndex(i);
        setInput(history[i] ?? '');
      } else {
        setHistIndex(null);
        setInput(draft);
      }
    }
  };

  return (
    <div className="os">
      <SystemHeader />
      <div className="os-rule" />

      <main
        className="os-main"
        onClick={focusInput}
        role="application"
        aria-label="AJ operating system"
      >
        <div className="os-scroll" ref={scrollRef}>
          {scroll.map((block) =>
            block.kind === 'typed' ? (
              <div className="out-line out-line--cmd" key={block.id}>
                <span className="out-dollar">$</span>
                <span>{block.text}</span>
              </div>
            ) : (
              <OutputBlock key={block.id} lines={block.lines} />
            ),
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="os-rule" />

      <div className="os-input" onClick={focusInput}>
        <span className="os-input__prompt">
          <span className="tone-accent">aj@portfolio</span>
          <span>:~$</span>
        </span>
        <span className="term-input-wrap">
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            placeholder={placeholder}
            onChange={(e) => {
              const v = e.target.value;

              setInput(v);
              if (histIndex !== null) {
                setHistIndex(null);
                setDraft(v);
              }
              if (v.trim() === '') return;
              const p = v.split(/\s+/).map((i) => i.trim().toLowerCase());
              if(p.length > 2) return;
              const matches = getCompletions(
                p,
                module,
              );
              if (matches.length >= 1) {
                setAutoComplete(matches[0].replace(v ?? '', '').trim());
              } else {
                setAutoComplete('');
              }
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Terminal command"
          />
          <span className="term-ghost" aria-hidden="true">
            {input ? (
              <>
                {input}
                <span className="term-placeholder">{autoComplete}</span>
              </>
            ) : (
              <span className="term-placeholder">{placeholder}</span>
            )}
            <span className="term-caret" />
          </span>
        </span>
      </div>

      <div className="os-rule" />
      <ModuleNav active={module} onSelect={goModule} />
    </div>
  );
}
