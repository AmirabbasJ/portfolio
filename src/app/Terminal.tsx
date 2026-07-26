import type { Directory, OutputLine } from '@modules/terminal';
import type { KeyboardEvent } from 'react';

import {
  aboutCmd,
  contactCmd,
  directories,
  experienceCmd,
  getCompletions,
  runCommand,
  statusLines,
  whoamiLines,
} from '@modules/terminal';
import { mod, nextId } from '@utils';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { DirectoryNav } from '../components/DirectoryNav';
import { OutputBlock } from '../components/OutputBlock';
import { SystemHeader } from '../components/SystemHeader';

type ScrollLine =
  | { id: number; kind: 'out'; lines: OutputLine[] }
  | { id: number; kind: 'typed'; text: string };

function getDirectoryFromHash(): Directory | null {
  const fromHash = window.location.hash.replace('#', '') as Directory;
  if (directories.some((d) => d === fromHash) && fromHash !== 'home')
    return fromHash;
  return null;
}

function directorySeed(id: Directory): OutputLine[] {
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

const placeholder = 'type a command (try: help)';

interface TerminalProps {
  onShutdown: () => void;
}

export function Terminal({ onShutdown }: TerminalProps) {
  const [directory, setDirectory] = useState<Directory>(
    () => getDirectoryFromHash() ?? 'home'
  );

  const [scroll, setScroll] = useState<ScrollLine[]>(() => [
    { id: nextId(), kind: 'out', lines: directorySeed(directory) },
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    setCaret(el.selectionStart ?? el.value.length);
  }, []);

  const setInputValue = useCallback(
    (value: string, caretPos?: number) => {
      const pos = caretPos ?? value.length;
      setInput(value);
      setCaret(pos);
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(pos, pos);
      });

      if (value.trim() === '') {
        setAutoComplete('');
        return;
      }

      const p = value.split(/\s+/).map((i) => i.trim().toLowerCase());

      if (p.length > 2) {
        setAutoComplete('');
        return;
      }

      const matches = getCompletions(p, directory);

      if (matches.length >= 1) {
        setAutoComplete(matches[0].replace(value.toLowerCase(), '').trim());
      } else {
        setAutoComplete('');
      }
    },
    [directory]
  );

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
  }, [scroll, directory, autoCompleteMatches.length, selectedMatchIndex]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    focusInput();
  }, [focusInput, directory]);

  const goDirectory = useCallback(
    (id: Directory) => {
      stickModeRef.current = 'top';
      setDirectory(id);
      setScroll([{ id: nextId(), kind: 'out', lines: directorySeed(id) }]);
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
        currDir: directory,
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
        window.setTimeout(() => onShutdown(), 480);
        return;
      }

      if (result.directory && result.clear) {
        stickModeRef.current = 'top';
        setDirectory(result.directory);
        window.location.hash = result.directory;
        setScroll([
          {
            id: nextId(),
            kind: 'out',
            lines:
              result.lines.length > 0
                ? result.lines
                : directorySeed(result.directory),
          },
        ]);
        setInputValue('');
        return;
      }

      if (result.clear && !result.directory) {
        stickModeRef.current = 'top';
        setScroll([
          { id: nextId(), kind: 'out', lines: directorySeed(directory) },
        ]);
        setInputValue('');
        return;
      }

      if (result.openUrl) {
        window.open(result.openUrl, '_blank', 'noopener,noreferrer');
      }

      if (result.directory) {
        setDirectory(result.directory);
        window.location.hash = result.directory;
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
    [history, directory, setInputValue]
  );

  const cycleDirectory = (dir: -1 | 1) => {
    const idx = directories.findIndex((d) => d === directory);
    const nextIndex = mod(idx + dir, 0, directories.length - 1);
    const next = directories[nextIndex];
    goDirectory(next);
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
      const matches = getCompletions(parts, directory);

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
    if (e.key !== 'Shift') {
      setAutoCompleteMatches([]);
      setSelectedMatchIndex(null);
    }

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
      setScroll([
        { id: nextId(), kind: 'out', lines: directorySeed(directory) },
      ]);
      return;
    }

    if (!input && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      cycleDirectory(e.key === 'ArrowLeft' ? -1 : 1);
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
            onChange={(e) => {
              const v = e.target.value;
              const pos = e.target.selectionStart ?? v.length;

              setInputValue(v.trimStart(), pos);
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
      <DirectoryNav active={directory} onSelect={goDirectory} />
    </div>
  );
}
