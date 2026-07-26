import asciiArt from '@assets/ascii.txt?raw';

export function AsciiMark() {
  return (
    <pre className="out-mark out-mark--ascii" aria-hidden="true">
      {asciiArt}
    </pre>
  );
}
