import { useJobStore, AnimationSpeed } from '../../state/jobStore';

const btn = (active: boolean, color = '#226'): React.CSSProperties => ({
  background: active ? color : '#1a1a2e',
  border: `1px solid ${active ? '#4a9eff' : '#333'}`,
  color: active ? '#fff' : '#aaa',
  padding: '0.3rem 0.7rem',
  borderRadius: '3px',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontSize: '0.8rem',
});

export function ViewerToolbar() {
  const animState = useJobStore((s) => s.animationState);
  const speed = useJobStore((s) => s.animationSpeed);
  const setAnimState = useJobStore((s) => s.setAnimationState);
  const setSpeed = useJobStore((s) => s.setAnimationSpeed);

  const isPlaying = animState === 'playing';
  const isPaused = animState === 'paused';

  return (
    <div style={{
      display: 'flex', gap: '0.5rem', alignItems: 'center',
      padding: '0.5rem 0.75rem', borderBottom: '1px solid #222',
      background: '#0f0f1e',
    }}>
      <button style={btn(isPlaying, '#226622')}
        onClick={() => setAnimState(isPlaying ? 'paused' : 'playing')}>
        {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
      </button>
      <button style={btn(false)} onClick={() => setAnimState('idle')}>
        Reset
      </button>

      <span style={{ color: '#555', marginLeft: '0.5rem' }}>Speed:</span>
      {([1, 5, 10] as AnimationSpeed[]).map((s) => (
        <button key={s} style={btn(speed === s)} onClick={() => setSpeed(s)}>
          {s}×
        </button>
      ))}
    </div>
  );
}
