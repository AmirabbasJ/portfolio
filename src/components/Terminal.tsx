import type { KeyboardEvent } from 'react';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { OutputLine } from '../terminal/commands';
import type { ModuleId } from '../terminal/system';

import {
  aboutCmd,
  contactCmd,
  experienceCmd,
  getCompletions,
  runCommand,
  statusLines,
  whoamiLines,
} from '../terminal/commands';
import { modules } from '../terminal/system';
import { nextId } from '../utils/id';
import { mod } from '../utils/mod';
import { ModuleNav } from './ModuleNav';
import { OutputBlock } from './OutputBlock';
import { SystemHeader } from './SystemHeader';

type ScrollLine =
  | { id: number; kind: 'out'; lines: OutputLine[] }
  | { id: number; kind: 'typed'; text: string };

function getModuleFromHash(): ModuleId | null {
  const fromHash = window.location.hash.replace('#', '') as ModuleId;
  if (modules.some((m) => m.id === fromHash) && fromHash !== 'home')
    return fromHash;
  return null;
}

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
        { kind: 'cmd', text: 'exp' },
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

type Power = 'on' | 'shutting';

const placeholder = 'type a command (try: help)';

interface TerminalProps {
  onShutdown: () => void;
}

export function Terminal({ onShutdown }: TerminalProps) {
  const [module, setModule] = useState<ModuleId>(
    () => getModuleFromHash() ?? 'home'
  );

  const [scroll, setScroll] = useState<ScrollLine[]>(() => [
    { id: nextId(), kind: 'out', lines: moduleSeed(module) },
  ]);

  const [input, setInput] = useState('');
  const [caret, setCaret] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [autoComplete, setAutoComplete] = useState<string>('');
  const [autoCompleteMatches, setAutoCompleteMatches] = useState<string[]>([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(
    null
  );

  const [power, setPower] = useState<Power>('on');
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    setCaret(el.selectionStart ?? el.value.length);
  }, []);

  const setInputValue = useCallback((value: string, caretPos?: number) => {
    const pos = caretPos ?? value.length;
    setInput(value);
    setCaret(pos);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos);
    });
  }, []);

  const selectedMatch =
    selectedMatchIndex == null
      ? null
      : autoCompleteMatches.at(selectedMatchIndex);

  const stickModeRef = useRef<'bottom' | 'top'>('top');

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
  }, [scroll, module, autoCompleteMatches.length, selectedMatchIndex]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    focusInput();
  }, [focusInput, module]);

  const goModule = useCallback(
    (id: ModuleId) => {
      stickModeRef.current = 'top';
      setModule(id);
      setScroll([{ id: nextId(), kind: 'out', lines: moduleSeed(id) }]);
      setInputValue('');
      setHistIndex(null);
      window.location.hash = id;
    },
    [setInputValue]
  );

  const submit = useCallback(
    (raw: string) => {
      const value = raw.trim();

      if (!value.trim()) {
        setInputValue('');
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

      if (result.shutdown) {
        stickModeRef.current = 'bottom';
        setScroll((prev) => [
          ...prev,
          { id: nextId(), kind: 'typed', text: value },
          { id: nextId(), kind: 'out', lines: result.lines },
        ]);
        setInputValue('');
        setAutoComplete('');
        setPower('shutting');
        window.setTimeout(() => onShutdown(), 480);
        return;
      }

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
        setInputValue('');
        return;
      }

      if (result.clear && !result.module) {
        stickModeRef.current = 'top';
        setScroll([{ id: nextId(), kind: 'out', lines: moduleSeed(module) }]);
        setInputValue('');
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
      setInputValue('');
    },
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [history, module, setInputValue]
  );

  const cycleModule = (dir: -1 | 1) => {
    const idx = modules.findIndex((m) => m.id === module);
    const next = modules[(idx + dir + modules.length) % modules.length];
    goModule(next.id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedMatch) {
        e.preventDefault();
        setInputValue(`${selectedMatch} `);
        setAutoComplete('');
        setAutoCompleteMatches([]);
        setSelectedMatchIndex(null);
        return;
      }

      e.preventDefault();
      submit(input);
      setAutoComplete('');
      return;
    }

    if (e.key === 'Tab') {
      const isBackward = e.shiftKey;
      e.preventDefault();
      setAutoComplete('');
      const parts = input.split(/\s+/).map((i) => i.trim().toLowerCase());
      if (parts.length > 2) return;
      const matches = getCompletions(parts, module);

      if (matches.length === 1) {
        setInputValue(`${matches[0]} `);
      } else if (matches.length > 1) {
        stickModeRef.current = 'bottom';

        if (autoCompleteMatches.length > 0) {
          setSelectedMatchIndex((prev) => {
            if (prev == null) return 0;
            const newValue = isBackward ? prev - 1 : prev + 1;
            return mod(newValue, 0, matches.length - 1);
          });
        } else {
          setAutoCompleteMatches(matches);
          setSelectedMatchIndex(0);
        }
      }

      return;
    }

    setAutoCompleteMatches([]);
    setSelectedMatchIndex(null);

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      stickModeRef.current = 'bottom';
      setScroll((prev) => [
        ...prev,
        { id: nextId(), kind: 'typed', text: `${input}^C` },
      ]);
      setInputValue('');
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
        setInputValue(history[i] ?? '');
      } else if (histIndex > 0) {
        const i = histIndex - 1;
        setHistIndex(i);
        setInputValue(history[i] ?? '');
      }

      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex === null) return;
      if (histIndex < history.length - 1) {
        const i = histIndex + 1;
        setHistIndex(i);
        setInputValue(history[i] ?? '');
      } else {
        setHistIndex(null);
        setInputValue(draft);
      }

      return;
    }

    if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      requestAnimationFrame(syncCaret);
    }
  };

  return (
    <div className="os">
      <SystemHeader />
      <div className="os-rule" />

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <main
        className="os-main"
        onClick={focusInput}
        onKeyDown={focusInput}
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
            )
          )}
          {autoCompleteMatches.length > 0 && (
            <div className="out-line out-line--autoComplete">
              {autoCompleteMatches.map((m, index) => (
                <div
                  className={`out-line tone-dim out-line--autoComplete-item ${selectedMatchIndex === index ? 'is-active' : ''}`}
                  key={m}
                >
                  {m.split(' ').at(-1)}
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="os-rule" />

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
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
            disabled={power !== 'on'}
            onChange={(e) => {
              const v = e.target.value;
              const pos = e.target.selectionStart ?? v.length;

              setInput(v);
              setCaret(pos);

              if (histIndex !== null) {
                setHistIndex(null);
                setDraft(v);
              }

              if (v.trim() === '') {
                setAutoComplete('');
                return;
              }

              const p = v.split(/\s+/).map((i) => i.trim().toLowerCase());

              if (p.length > 2) {
                setAutoComplete('');
                return;
              }

              const matches = getCompletions(p, module);

              if (matches.length >= 1) {
                setAutoComplete(matches[0].replace(v, '').trim());
              } else {
                setAutoComplete('');
              }
            }}
            onKeyDown={onKeyDown}
            onKeyUp={syncCaret}
            onClick={syncCaret}
            onSelect={syncCaret}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Terminal command"
          />
          <span className="term-ghost" aria-hidden="true">
            {input ? (
              <>
                {input.slice(0, Math.min(caret, input.length))}
                <span className="term-caret" />
                {input.slice(Math.min(caret, input.length))}
                {caret >= input.length ? (
                  <span className="term-placeholder">{autoComplete}</span>
                ) : null}
              </>
            ) : (
              <>
                <span className="term-caret" />
                <span className="term-placeholder">{placeholder}</span>
              </>
            )}
          </span>
        </span>
      </div>

      <div className="os-rule" />
      <ModuleNav active={module} onSelect={goModule} />
    </div>
  );
}
