import { useJobStore, AnimationSpeed } from '../../state/jobStore';

const btn = (active: boolean, color = '#1a3a1a'): React.CSSProperties => ({
  background: active ? color : '#111',
  border: `1px solid ${active ? '#4a9eff' : '#222'}`,
  color: active ? '#fff' : '#555',
  padding: '0.25rem 0.7rem',
  borderRadius: '3px',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontSize: '0.72rem',
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
      display: 'flex', gap: '0.4rem', alignItems: 'center',
      padding: '0 0.75rem', height: '100%',
      borderBottom: '1px solid #1a1a1a', background: '#0a0a0a',
    }}>
      <button style={btn(isPlaying, '#1a3a1a')}
        onClick={() => setAnimState(isPlaying ? 'paused' : 'playing')}>
        {isPlaying ? '⏸ Pause' : isPaused ? '▶ Resume' : '▶ Play'}
      </button>
      <button style={btn(false)} onClick={() => setAnimState('idle')}>
        ⏹ Reset
      </button>
      <div style={{ width: '1px', background: '#222', height: '20px' }} />
      <span style={{ color: '#333', fontSize: '0.72rem' }}>Speed:</span>
      {([1, 5, 10] as AnimationSpeed[]).map((s) => (
        <button key={s} style={btn(speed === s, '#1a2a3a')} onClick={() => setSpeed(s)}>
          {s}×
        </button>
      ))}
    </div>
  );
}
