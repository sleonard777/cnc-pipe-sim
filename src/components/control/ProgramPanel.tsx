import { useEffect, useRef } from 'react';
import { useJobStore } from '../../state/jobStore';

export function ProgramPanel() {
  const gcode = useJobStore((s) => s.gcode);
  const currentLine = useJobStore((s) => s.currentGcodeLine);
  const animState = useJobStore((s) => s.animationState);
  const listRef = useRef<HTMLDivElement>(null);

  const lines = gcode ? gcode.split('\n') : [];
  const isRunning = animState === 'playing';

  // Auto-scroll to current line while running
  useEffect(() => {
    if (!isRunning || !listRef.current) return;
    const el = listRef.current.children[currentLine] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [currentLine, isRunning]);

  if (!gcode) {
    return (
      <div style={{ padding: '0.5rem', color: '#333', fontFamily: 'Consolas, monospace', fontSize: '0.75rem' }}>
        No program loaded. Generate G-code from the INPUT tab.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '0.2rem 0.5rem', background: '#0f0f0f', borderBottom: '1px solid #1a1a1a',
        fontSize: '0.65rem', fontFamily: 'Consolas, monospace',
      }}>
        <span style={{ color: '#555' }}>PROGRAM  ({lines.length} lines)</span>
        <span style={{ color: '#4a9eff' }}>LINE {currentLine + 1}</span>
      </div>
      <div
        ref={listRef}
        style={{
          flex: 1, overflowY: 'auto', background: '#070707',
          fontFamily: 'Consolas, monospace', fontSize: '0.7rem',
        }}
      >
        {lines.map((line, i) => {
          const isComment = line.trim().startsWith('(');
          const isCurrent = i === currentLine && isRunning;
          return (
            <div
              key={i}
              style={{
                padding: '0.05rem 0.5rem',
                background: isCurrent ? '#002200' : i % 2 === 0 ? '#080808' : '#070707',
                borderLeft: isCurrent ? '3px solid #00ff00' : '3px solid transparent',
                color: isCurrent ? '#00ff00' : isComment ? '#555' : '#99cc99',
                display: 'flex', gap: '0.5rem',
              }}
            >
              <span style={{ color: '#2a2a2a', minWidth: '30px', textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
              <span>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
