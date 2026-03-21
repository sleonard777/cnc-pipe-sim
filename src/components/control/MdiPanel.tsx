import { useState } from 'react';
import { useJobStore } from '../../state/jobStore';

interface MdiEntry {
  cmd: string;
  response: string;
  ok: boolean;
}

/** Very simple MDI parser — handles G0 axis moves and M codes */
function parseMdi(cmd: string, pos: { x: number; y: number; z: number; a: number; b: number }) {
  const upper = cmd.trim().toUpperCase();
  const newPos = { ...pos };
  let response = `OK: ${cmd}`;
  let ok = true;

  const xMatch = upper.match(/X(-?[\d.]+)/);
  const yMatch = upper.match(/Y(-?[\d.]+)/);
  const zMatch = upper.match(/Z(-?[\d.]+)/);
  const aMatch = upper.match(/A(-?[\d.]+)/);
  const bMatch = upper.match(/B(-?[\d.]+)/);

  if (upper.startsWith('G0') || upper.startsWith('G1')) {
    if (xMatch) newPos.x = parseFloat(xMatch[1]);
    if (yMatch) newPos.y = parseFloat(yMatch[1]);
    if (zMatch) newPos.z = parseFloat(zMatch[1]);
    if (aMatch) newPos.a = parseFloat(aMatch[1]);
    if (bMatch) newPos.b = parseFloat(bMatch[1]);
  } else if (upper === 'G28' || upper === 'G28.1') {
    newPos.x = 0; newPos.y = 0; newPos.z = 0; newPos.a = 0; newPos.b = 0;
    response = 'OK: Homed to G28 position';
  } else if (upper === 'M3') {
    response = 'OK: Plasma ON (simulation)';
  } else if (upper === 'M5') {
    response = 'OK: Plasma OFF';
  } else if (upper === 'M30' || upper === 'M2') {
    response = 'OK: Program end';
  } else if (upper === '') {
    response = '';
  } else {
    response = `WARN: Unrecognised code: ${cmd}`;
    ok = false;
  }

  return { newPos, response, ok };
}

export function MdiPanel() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<MdiEntry[]>([]);
  const mcs = useJobStore((s) => s.machineControlState);
  const pos = useJobStore((s) => s.droPosition);
  const setDro = useJobStore((s) => s.setDroPosition);
  const enabled = mcs === 'ON';

  const submit = () => {
    if (!enabled || !input.trim()) return;
    const { newPos, response, ok } = parseMdi(input.trim(), pos);
    setDro(newPos);
    setHistory((h) => [...h.slice(-19), { cmd: input.trim(), response, ok }]);
    setInput('');
  };

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.1em' }}>MDI  (Manual Data Input)</div>

      {/* History */}
      <div style={{
        background: '#060606', border: '1px solid #1a1a1a', borderRadius: '2px',
        height: '80px', overflowY: 'auto', padding: '0.25rem 0.4rem',
        fontFamily: 'Consolas, monospace', fontSize: '0.68rem',
      }}>
        {history.length === 0
          ? <span style={{ color: '#333' }}>Enter G-code commands…</span>
          : history.map((h, i) => (
            <div key={i}>
              <span style={{ color: '#4a9eff' }}>&gt; {h.cmd}</span>
              {h.response && <div style={{ color: h.ok ? '#00aa00' : '#cc8800', paddingLeft: '1rem' }}>{h.response}</div>}
            </div>
          ))
        }
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          disabled={!enabled}
          placeholder={enabled ? 'G0 X30 B0…' : 'Machine not ON'}
          style={{
            flex: 1, background: '#000', border: `1px solid ${enabled ? '#335' : '#222'}`,
            color: '#00cc00', fontFamily: 'Consolas, monospace', fontSize: '0.8rem',
            padding: '0.25rem 0.4rem', borderRadius: '2px', outline: 'none',
          }}
        />
        <button
          onClick={submit}
          disabled={!enabled}
          style={{
            background: enabled ? '#001a00' : '#111', border: `1px solid ${enabled ? '#004400' : '#222'}`,
            color: enabled ? '#00cc00' : '#333', padding: '0.25rem 0.6rem',
            borderRadius: '2px', cursor: enabled ? 'pointer' : 'not-allowed',
            fontFamily: 'Consolas, monospace', fontSize: '0.72rem',
          }}
        >
          EXEC
        </button>
      </div>
    </div>
  );
}
