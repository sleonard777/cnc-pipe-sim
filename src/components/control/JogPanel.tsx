import { useState } from 'react';
import { useJobStore, DroPosition } from '../../state/jobStore';

type Axis = 'X' | 'B' | 'Z' | 'A';
const INCREMENTS = [0.001, 0.01, 0.1, 1.0, 10.0];

function axisKey(ax: Axis): keyof DroPosition {
  return ax.toLowerCase() as keyof DroPosition;
}

export function JogPanel() {
  const [selectedAxis, setSelectedAxis] = useState<Axis>('X');
  const [increment, setIncrement] = useState(0.1);
  const mcs = useJobStore((s) => s.machineControlState);
  const allHomed = useJobStore((s) => s.allHomed);
  const pos = useJobStore((s) => s.droPosition);
  const setDro = useJobStore((s) => s.setDroPosition);
  const enabled = mcs === 'ON' && allHomed;

  const jog = (dir: 1 | -1) => {
    if (!enabled) return;
    const key = axisKey(selectedAxis);
    const newPos = { ...pos, [key]: pos[key] + dir * increment };
    setDro(newPos);
  };

  const btn = (_label: string, active: boolean, _onClick: () => void): React.CSSProperties => ({
    background: active ? '#1a3a5a' : '#1a1a1a',
    border: `1px solid ${active ? '#4a9eff' : '#333'}`,
    color: active ? '#4a9eff' : '#555',
    padding: '0.2rem 0.45rem',
    borderRadius: '2px',
    cursor: 'pointer',
    fontFamily: 'Consolas, monospace',
    fontSize: '0.72rem',
  });

  const jogBtn = (_label: string, _dir: 1 | -1): React.CSSProperties => ({
    background: enabled ? '#001a00' : '#111',
    border: `1px solid ${enabled ? '#006600' : '#222'}`,
    color: enabled ? '#00cc00' : '#333',
    padding: '0.35rem 1rem',
    borderRadius: '3px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: 'Consolas, monospace',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    flex: 1,
  });

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.1em' }}>JOG</div>

      {/* Axis select */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {(['X', 'B', 'Z', 'A'] as Axis[]).map((ax) => (
          <button key={ax} style={btn(ax, selectedAxis === ax, () => {})}
            onClick={() => setSelectedAxis(ax)}>
            {ax}
          </button>
        ))}
      </div>

      {/* Increment select */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {INCREMENTS.map((inc) => (
          <button key={inc} style={btn(inc === increment ? 'active' : '', increment === inc, () => {})}
            onClick={() => setIncrement(inc)}>
            {inc < 1 ? inc.toString() : `${inc}`}
          </button>
        ))}
      </div>

      {/* Jog buttons */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button style={jogBtn('←', -1)} onClick={() => jog(-1)} disabled={!enabled}>
          ◀  {selectedAxis}–
        </button>
        <button style={jogBtn('→', 1)} onClick={() => jog(1)} disabled={!enabled}>
          {selectedAxis}+  ▶
        </button>
      </div>

      {/* Current value readout */}
      <div style={{ textAlign: 'center', color: '#00aa00', fontFamily: 'Consolas, monospace', fontSize: '0.8rem', background: '#000', padding: '0.15rem', borderRadius: '2px' }}>
        {selectedAxis}: {pos[axisKey(selectedAxis)].toFixed(4)}
      </div>
    </div>
  );
}
