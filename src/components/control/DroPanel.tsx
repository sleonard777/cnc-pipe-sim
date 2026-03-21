import { useJobStore } from '../../state/jobStore';

const AXES = [
  { key: 'x' as const, label: 'X', unit: 'in', desc: 'Pipe Axis' },
  { key: 'b' as const, label: 'B', unit: '°',  desc: 'Pipe Rotation' },
  { key: 'z' as const, label: 'Z', unit: 'in', desc: 'Torch Height' },
  { key: 'a' as const, label: 'A', unit: '°',  desc: 'Torch Tilt' },
  { key: 'y' as const, label: 'Y', unit: 'in', desc: 'Lateral' },
];

interface DroRowProps {
  axisLabel: string;
  unit: string;
  desc: string;
  value: number;
  isAngle: boolean;
}

function DroRow({ axisLabel, unit, desc, value, isAngle }: DroRowProps) {
  const formatted = isAngle
    ? value.toFixed(3).padStart(9)
    : value.toFixed(4).padStart(10);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.3rem 0.5rem',
      borderBottom: '1px solid #1a1a1a',
      background: '#0a0a0a',
    }}>
      <div style={{
        width: '18px', color: '#ffcc00', fontSize: '0.85rem',
        fontWeight: 'bold', fontFamily: 'Consolas, monospace',
      }}>
        {axisLabel}
      </div>
      <div style={{
        flex: 1,
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '1.35rem',
        color: '#00e000',
        letterSpacing: '0.06em',
        textAlign: 'right',
        background: '#000',
        padding: '0.1rem 0.4rem',
        borderRadius: '2px',
        border: '1px solid #1a3a1a',
      }}>
        {formatted}
      </div>
      <div style={{ width: '18px', color: '#555', fontSize: '0.7rem' }}>{unit}</div>
      <div style={{ width: '80px', color: '#444', fontSize: '0.65rem' }}>{desc}</div>
    </div>
  );
}

export function DroPanel() {
  const pos = useJobStore((s) => s.droPosition);

  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{
        background: '#1c1c1c', padding: '0.3rem 0.6rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <span style={{ color: '#888', fontSize: '0.7rem', letterSpacing: '0.1em' }}>POSITION  (ABS)</span>
        <span style={{ color: '#333', fontSize: '0.65rem' }}>INCH</span>
      </div>
      {AXES.map((ax) => (
        <DroRow
          key={ax.key}
          axisLabel={ax.label}
          unit={ax.unit}
          desc={ax.desc}
          value={pos[ax.key]}
          isAngle={ax.unit === '°'}
        />
      ))}
    </div>
  );
}
