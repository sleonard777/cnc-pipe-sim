import { useRef, useState } from 'react';
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
import { useIsMobile } from '../../hooks/useWindowWidth';

// Layout constants (px)
const TOOLBAR_H      = 40;
const MACHINE_BAR_H  = 46;
const STATUS_STRIP_H = 36;
const VIEWER_PANEL_W = 300;
const CONTROL_PANEL_W = 300;
const TOOLBAR_H_MOBILE = 44;

type ViewerPanel = 'chart' | 'gcode';

export function AppLayout() {
  const activeTab = useJobStore((s) => s.activeTab);
  const [viewerPanel, setViewerPanel] = useState<ViewerPanel>('chart');
  const [panelOpen, setPanelOpen]     = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (mobile) {
    const toolbarH = TOOLBAR_H_MOBILE;

    const canvasStyle: React.CSSProperties = activeTab === 'input'
      ? { display: 'none' }
      : { position: 'absolute', inset: activeTab === 'viewer' ? `${toolbarH}px 0 0 0` : `${MACHINE_BAR_H}px 0 ${STATUS_STRIP_H}px 0` };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#0e0e0e' }}>
        <TabBar />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* Always-on canvas */}
          <div ref={canvasContainerRef} style={{ ...canvasStyle, position: 'absolute' }}>
            <ThreeCanvas />
          </div>

          {/* ── INPUT ── */}
          {activeTab === 'input' && (
            <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#0e0e0e' }}>
              <InputTab />
            </div>
          )}

          {/* ── VIEWER ── */}
          {activeTab === 'viewer' && (
            <>
              {/* Toolbar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: toolbarH }}>
                <ViewerToolbar />
              </div>

              {/* Toggle panel button */}
              <button
                onClick={() => setPanelOpen((o) => !o)}
                style={{
                  position: 'absolute', bottom: panelOpen ? '52vh' : 12, right: 12,
                  background: '#1a1a2e', border: '1px solid #4a9eff', color: '#4a9eff',
                  borderRadius: '50%', width: 40, height: 40, fontSize: '1.1rem',
                  cursor: 'pointer', zIndex: 20, transition: 'bottom 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {panelOpen ? '✕' : '📊'}
              </button>

              {/* Slide-up panel */}
              {panelOpen && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '52vh',
                  background: '#0a0a0a', borderTop: '1px solid #1a1a1a',
                  display: 'flex', flexDirection: 'column', zIndex: 10,
                }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
                    {(['chart', 'gcode'] as ViewerPanel[]).map((t) => (
                      <button key={t} onClick={() => setViewerPanel(t)} style={{
                        flex: 1, background: viewerPanel === t ? '#1a1a2e' : 'transparent',
                        border: 'none', borderBottom: `2px solid ${viewerPanel === t ? '#4a9eff' : 'transparent'}`,
                        color: viewerPanel === t ? '#4a9eff' : '#444', cursor: 'pointer',
                        fontFamily: 'Consolas, monospace', fontSize: '0.75rem',
                        padding: '0.5rem', letterSpacing: '0.05em',
                      }}>
                        {t === 'gcode' ? 'G-CODE' : 'CUT CHART'}
                      </button>
                    ))}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {viewerPanel === 'gcode' ? <GCodePanel /> : <CutChart />}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CONTROL ── */}
          {activeTab === 'control' && (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: MACHINE_BAR_H }}>
                <MachineBar />
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: STATUS_STRIP_H }}>
                <StatusStrip />
              </div>

              {/* Toggle control panel button */}
              <button
                onClick={() => setPanelOpen((o) => !o)}
                style={{
                  position: 'absolute', bottom: STATUS_STRIP_H + 12, right: 12,
                  background: '#1a1a2e', border: '1px solid #4a9eff', color: '#4a9eff',
                  borderRadius: '50%', width: 40, height: 40, fontSize: '1.1rem',
                  cursor: 'pointer', zIndex: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {panelOpen ? '✕' : '⚙'}
              </button>

              {panelOpen && (
                <div style={{
                  position: 'absolute', bottom: STATUS_STRIP_H, left: 0, right: 0, height: '55vh',
                  background: '#0e0e0e', borderTop: '1px solid #1a1a1a', zIndex: 10,
                  overflowY: 'auto',
                }}>
                  <ControlTab />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────────────────
  const canvasStyle = (tab: ActiveTab): React.CSSProperties => {
    if (tab === 'input') return { display: 'none' };
    if (tab === 'viewer') return { position: 'absolute', top: TOOLBAR_H, left: 0, right: VIEWER_PANEL_W, bottom: 0 };
    return { position: 'absolute', top: MACHINE_BAR_H, left: 0, right: CONTROL_PANEL_W, bottom: STATUS_STRIP_H };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0e0e0e' }}>
      <TabBar />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        <div ref={canvasContainerRef} style={{ ...canvasStyle(activeTab), position: 'absolute' }}>
          <ThreeCanvas />
        </div>

        {activeTab === 'input' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#0e0e0e' }}>
            <InputTab />
          </div>
        )}

        {activeTab === 'viewer' && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: VIEWER_PANEL_W, height: TOOLBAR_H }}>
              <ViewerToolbar />
            </div>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: VIEWER_PANEL_W, bottom: 0,
              borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column',
              background: '#0a0a0a',
            }}>
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

        {activeTab === 'control' && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: CONTROL_PANEL_W, height: MACHINE_BAR_H }}>
              <MachineBar />
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: CONTROL_PANEL_W, height: STATUS_STRIP_H }}>
              <StatusStrip />
            </div>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: CONTROL_PANEL_W, bottom: 0,
              borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column',
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
