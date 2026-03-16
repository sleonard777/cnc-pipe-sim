import { useJobStore, ActiveTab } from '../../state/jobStore';

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1.5rem',
  background: active ? '#1a1a2e' : 'transparent',
  border: 'none',
  borderBottom: active ? '2px solid #4a9eff' : '2px solid transparent',
  color: active ? '#4a9eff' : '#666',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontSize: '0.85rem',
  letterSpacing: '0.05em',
});

export function TabBar() {
  const activeTab = useJobStore((s) => s.activeTab);
  const setActiveTab = useJobStore((s) => s.setActiveTab);

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #222', background: '#0f0f1e' }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', color: '#4a9eff', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '1rem' }}>
        Pipe Dream CNC
      </div>
      {(['input', 'viewer'] as ActiveTab[]).map((tab) => (
        <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
          {tab === 'input' ? 'INPUT' : 'VIEWER / G-CODE'}
        </button>
      ))}
    </div>
  );
}
