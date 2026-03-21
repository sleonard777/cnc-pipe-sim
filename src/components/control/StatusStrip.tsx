import { useJobStore } from '../../state/jobStore';

const ACTIVE_CODES = ['G17', 'G20', 'G90', 'G94', 'G54'];

export function StatusStrip() {
  const feedOverride = useJobStore((s) => s.feedOverride);
  const setFeedOverride = useJobStore((s) => s.setFeedOverride);
  const animSpeed = useJobStore((s) => s.animationSpeed);
  const setAnimSpeed = useJobStore((s) => s.setAnimationSpeed);
  const job = useJobStore((s) => s.jobState);
  const animState = useJobStore((s) => s.animationState);

  const pct = Math.round(feedOverride * 100);
  const effectiveFeed = (job.cut.feedRate * feedOverride).toFixed(0);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      padding: '0.3rem 0.75rem', background: '#0e0e0e',
      borderTop: '1px solid #222', fontSize: '0.68rem',
      fontFamily: 'Consolas, monospace',
    }}>
      {/* Active G-codes */}
      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
        <span style={{ color: '#444' }}>ACTIVE:</span>
        {ACTIVE_CODES.map((c) => (
          <span key={c} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            color: '#00aa00', padding: '0 0.3rem', borderRadius: '2px', fontSize: '0.65rem',
          }}>{c}</span>
        ))}
      </div>

      <div style={{ width: '1px', background: '#2a2a2a', alignSelf: 'stretch' }} />

      {/* Feed override */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ color: '#555' }}>FEED OVR:</span>
        <input
          type="range" min={10} max={200} step={5} value={pct}
          onChange={(e) => setFeedOverride(parseInt(e.target.value) / 100)}
          style={{ width: '80px', accentColor: '#4a9eff', cursor: 'pointer' }}
        />
        <span style={{ color: '#ffcc00', minWidth: '36px' }}>{pct}%</span>
        <span style={{ color: '#555' }}>→</span>
        <span style={{ color: '#00cc00' }}>{effectiveFeed} IPM</span>
      </div>

      <div style={{ width: '1px', background: '#2a2a2a', alignSelf: 'stretch' }} />

      {/* Sim speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ color: '#555' }}>SIM:</span>
        {([1, 5, 10] as (1 | 5 | 10)[]).map((s) => (
          <button key={s} onClick={() => setAnimSpeed(s)} style={{
            background: animSpeed === s ? '#1a3a1a' : '#111',
            border: `1px solid ${animSpeed === s ? '#4a9eff' : '#2a2a2a'}`,
            color: animSpeed === s ? '#4a9eff' : '#444',
            padding: '0 0.3rem', borderRadius: '2px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '0.65rem',
          }}>{s}×</button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Status pill */}
        <span style={{
          background: animState === 'playing' ? '#002200' : animState === 'paused' ? '#221100' : '#111',
          border: `1px solid ${animState === 'playing' ? '#006600' : animState === 'paused' ? '#664400' : '#222'}`,
          color: animState === 'playing' ? '#00ff00' : animState === 'paused' ? '#ffaa00' : '#444',
          padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem',
        }}>
          {animState.toUpperCase()}
        </span>
        <span style={{ color: '#333' }}>
          {job.machine.model} | {job.pipe.od}" {job.pipe.shape} | {job.cut.cutType.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
