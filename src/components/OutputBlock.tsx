import type { OutputLine } from '../terminal/commands'
import { AsciiMark } from './AsciiMark'

type Props = {
  lines: OutputLine[]
}

export function OutputBlock({ lines }: Props) {
  return (
    <>
      {lines.map((line, i) => {
        switch (line.kind) {
          case 'rule':
            return <div className="out-rule" key={i} />
          case 'mark':
            return <AsciiMark key={i} />
          case 'cmd':
            return (
              <div className="out-line out-line--cmd" key={i}>
                <span className="out-dollar">$</span>
                <span>{line.text}</span>
              </div>
            )
          case 'badge':
            return (
              <div className="out-badge" key={i}>
                <span className="out-badge__dot" aria-hidden="true" />
                <span>{line.text}</span>
              </div>
            )
          case 'kv':
            return (
              <div className="out-kv" key={i}>
                <span className="out-kv__k">{line.key}</span>
                <span className="out-kv__v">{line.value}</span>
              </div>
            )
          case 'tip':
            return (
              <div className="out-tip" key={i}>
                TIP: {line.text}
              </div>
            )
          case 'text':
            return (
              <div className="out-line" key={i}>
                {line.segments.map((seg, si) => (
                  <span
                    key={si}
                    className={seg.tone ? `tone-${seg.tone}` : undefined}
                  >
                    {seg.text}
                  </span>
                ))}
              </div>
            )
          case 'heading':
            return (
              <div className="out-heading" key={i}>
                {line.segments.map((seg, si) => (
                  <span
                    key={si}
                    className={seg.tone ? `tone-${seg.tone}` : undefined}
                  >
                    {seg.text}
                  </span>
                ))}
              </div>
            )
          case 'p':
            return (
              <p className="out-p" key={i}>
                {line.segments.map((seg, si) => (
                  <span
                    key={si}
                    className={seg.tone ? `tone-${seg.tone}` : undefined}
                  >
                    {seg.text}
                  </span>
                ))}
              </p>
            )
          default:
            return null
        }
      })}
    </>
  )
}
