import { useJobStore } from '../../state/jobStore';
import { TabBar } from './TabBar';
import { InputTab } from '../input/InputTab';
import { ViewerTab } from '../viewer/ViewerTab';

export function AppLayout() {
  const activeTab = useJobStore((s) => s.activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TabBar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'input' ? <InputTab /> : <ViewerTab />}
      </div>
    </div>
  );
}
