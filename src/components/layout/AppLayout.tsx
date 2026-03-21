import { useRef } from 'react';
import { useJobStore, ActiveTab } from '../../state/jobStore';
import { TabBar } from './TabBar';
import { InputTab } from '../input/InputTab';
import { ViewerToolbar } from '../viewer/ViewerToolbar';
import { GCodePanel } from '../viewer/GCodePanel';
import { CutChart } from '../viewer/CutChart';
import { MachineBar } from '../control/MachineBar';
import { ControlTab } from '../control/ControlTab';
import { StatusStrip } from '../control/StatusStrip';
import { ThreeCanvas } from '../viewer/ThreeCanvas';
import { useState } from 'react';

// Layout constants (px)
const TOOLBAR_H = 40;
const MACHINE_BAR_H = 46;
const STATUS_STRIP_H = 36;
const VIEWER_PANEL_W = 300;
const CONTROL_PANEL_W = 300;

type ViewerPanel = 'chart' | 'gcode';

/** Returns absolute CSS for the persistent canvas container per active tab */
function canvasStyle(tab: ActiveTab): React.CSSProperties {
  if (tab === 'input') {
    return { display: 'none' };
  }
  if (tab === 'viewer') {
    return {
      position: 'absolute',
      top: TOOLBAR_H,
      left: 0,
      right: VIEWER_PANEL_W,
      bottom: 0,
    };
  }
  // control
  return {
    position: 'absolute',
    top: MACHINE_BAR_H,
    left: 0,
    right: CONTROL_PANEL_W,
    bottom: STATUS_STRIP_H,
  };
}

export function AppLayout() {
  const activeTab = useJobStore((s) => s.activeTab);
  const [viewerPanel, setViewerPanel] = useState<ViewerPanel>('chart');
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0e0e0e' }}>
      <TabBar />

      {/* Main content area — position:relative so absolutes inside are relative to this */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* ── Always-mounted Three.js canvas ── */}
        <div ref={canvasContainerRef} style={{ ...canvasStyle(activeTab), position: 'absolute' }}>
          <ThreeCanvas />
        </div>

        {/* ══ INPUT TAB ══ */}
        {activeTab === 'input' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#0e0e0e' }}>
            <InputTab />
          </div>
        )}

        {/* ══ VIEWER TAB ══ */}
        {activeTab === 'viewer' && (
          <>
            {/* Toolbar strip above canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: VIEWER_PANEL_W, height: TOOLBAR_H }}>
              <ViewerToolbar />
            </div>

            {/* Right panel */}
            <div style={{
              position: 'absolute', top: 0, right: 0, width: VIEWER_PANEL_W, bottom: 0,
              borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column',
              background: '#0a0a0a',
            }}>
              {/* Panel sub-tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
                {(['chart', 'gcode'] as ViewerPanel[]).map((t) => (
                  <button key={t} onClick={() => setViewerPanel(t)} style={{
                    flex: 1, background: viewerPanel === t ? '#1a1a2e' : 'transparent',
                    border: 'none', borderBottom: `2px solid ${viewerPanel === t ? '#4a9eff' : 'transparent'}`,
                    color: viewerPanel === t ? '#4a9eff' : '#444', cursor: 'pointer',
                    fontFamily: 'Consolas, monospace', fontSize: '0.72rem', padding: '0.35rem',
                    letterSpacing: '0.05em',
                  }}>
                    {t === 'gcode' ? 'G-CODE' : 'CUT CHART'}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {viewerPanel === 'gcode' ? <GCodePanel /> : <CutChart />}
              </div>
            </div>
          </>
        )}

        {/* ══ CONTROL TAB ══ */}
        {activeTab === 'control' && (
          <>
            {/* Machine bar above canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: CONTROL_PANEL_W, height: MACHINE_BAR_H }}>
              <MachineBar />
            </div>

            {/* Status strip below canvas */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: CONTROL_PANEL_W, height: STATUS_STRIP_H }}>
              <StatusStrip />
            </div>

            {/* Right panel: DRO + Jog + MDI + Program */}
            <div style={{
              position: 'absolute', top: 0, right: 0, width: CONTROL_PANEL_W, bottom: 0,
              borderLeft: '1px solid #1a1a1a',
              display: 'flex', flexDirection: 'column',
              background: '#0e0e0e',
            }}>
              <ControlTab />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
