import { useJobStore, AnimationSpeed } from '../../state/jobStore';
import { useIsMobile } from '../../hooks/useWindowWidth';

const btn = (active: boolean, color = '#1a3a1a', mobile = false): React.CSSProperties => ({
  background: active ? color : '#111',
  border: `1px solid ${active ? '#4a9eff' : '#222'}`,
  color: active ? '#fff' : '#555',
  padding: mobile ? '0.4rem 0.8rem' : '0.25rem 0.7rem',
  borderRadius: '3px',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontSize: mobile ? '0.8rem' : '0.72rem',
  minHeight: mobile ? '36px' : undefined,
});

export function ViewerToolbar() {
  const animState = useJobStore((s) => s.animationState);
  const speed     = useJobStore((s) => s.animationSpeed);
  const setAnimState = useJobStore((s) => s.setAnimationState);
  const setSpeed     = useJobStore((s) => s.setAnimationSpeed);
  const mobile = useIsMobile();

  const isPlaying = animState === 'playing';
  const isPaused  = animState === 'paused';

  return (
    <div style={{
      display: 'flex', gap: mobile ? '0.5rem' : '0.4rem', alignItems: 'center',
      padding: mobile ? '0 0.5rem' : '0 0.75rem',
      height: '100%',
      borderBottom: '1px solid #1a1a1a', background: '#0a0a0a',
      flexWrap: mobile ? 'wrap' : undefined,
      overflowX: mobile ? 'auto' : undefined,
    }}>
      <button style={btn(isPlaying, '#1a3a1a', mobile)}
        onClick={() => setAnimState(isPlaying ? 'paused' : 'playing')}>
        {isPlaying ? '⏸' : isPaused ? '▶' : '▶'}{!mobile && (isPlaying ? ' Pause' : isPaused ? ' Resume' : ' Play')}
      </button>
      <button style={btn(false, '#1a3a1a', mobile)} onClick={() => setAnimState('idle')}>
        ⏹{!mobile && ' Reset'}
      </button>
      <div style={{ width: '1px', background: '#222', height: '20px', flexShrink: 0 }} />
      <span style={{ color: '#333', fontSize: mobile ? '0.75rem' : '0.72rem', flexShrink: 0 }}>
        {mobile ? 'Spd:' : 'Speed:'}
      </span>
      {([1, 5, 10] as AnimationSpeed[]).map((s) => (
        <button key={s} style={btn(speed === s, '#1a2a3a', mobile)} onClick={() => setSpeed(s)}>
          {s}×
        </button>
      ))}
    </div>
  );
}
