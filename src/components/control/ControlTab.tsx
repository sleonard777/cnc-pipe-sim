import { useState } from 'react';
import { DroPanel } from './DroPanel';
import { JogPanel } from './JogPanel';
import { MdiPanel } from './MdiPanel';
import { ProgramPanel } from './ProgramPanel';

type RightPanel = 'dro' | 'program';

const panelTab = (active: boolean): React.CSSProperties => ({
  flex: 1, background: active ? '#0e0e0e' : 'transparent',
  border: 'none', borderBottom: `2px solid ${active ? '#4a9eff' : 'transparent'}`,
  color: active ? '#4a9eff' : '#444', cursor: 'pointer',
  fontFamily: 'Consolas, monospace', fontSize: '0.68rem',
  padding: '0.3rem', letterSpacing: '0.06em',
});

const divider: React.CSSProperties = {
  height: '1px', background: '#1a1a1a', margin: '0.25rem 0',
};

export function ControlTab() {
  const [rightPanel, setRightPanel] = useState<RightPanel>('dro');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0e0e0e' }}>
      {/* Panel tab strip */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
        <button style={panelTab(rightPanel === 'dro')} onClick={() => setRightPanel('dro')}>
          DRO / JOG
        </button>
        <button style={panelTab(rightPanel === 'program')} onClick={() => setRightPanel('program')}>
          PROGRAM
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {rightPanel === 'dro' ? (
          <>
            <div style={{ padding: '0.5rem' }}>
              <DroPanel />
            </div>
            <div style={divider} />
            <JogPanel />
            <div style={divider} />
            <MdiPanel />
          </>
        ) : (
          <ProgramPanel />
        )}
      </div>
    </div>
  );
}
