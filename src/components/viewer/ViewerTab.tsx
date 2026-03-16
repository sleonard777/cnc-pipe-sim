import { ViewerToolbar } from './ViewerToolbar';
import { ThreeCanvas } from './ThreeCanvas';
import { GCodePanel } from './GCodePanel';

export function ViewerTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ViewerToolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ThreeCanvas />
        <div style={{ width: '320px', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <GCodePanel />
        </div>
      </div>
    </div>
  );
}
