import { useJobStore, ActiveTab } from '../../state/jobStore';

const TAB_DEFS: { id: ActiveTab; label: string }[] = [
  { id: 'input',   label: 'INPUT' },
  { id: 'viewer',  label: 'VIEWER / G-CODE' },
  { id: 'control', label: 'CONTROL PANEL' },
];

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0 1.25rem',
  height: '100%',
  background: active ? '#0e0e0e' : 'transparent',
  border: 'none',
  borderBottom: active ? '2px solid #4a9eff' : '2px solid transparent',
  color: active ? '#4a9eff' : '#444',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontSize: '0.78rem',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
});

export function TabBar() {
  const activeTab = useJobStore((s) => s.activeTab);
  const setActiveTab = useJobStore((s) => s.setActiveTab);

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', height: '38px',
      borderBottom: '1px solid #1a1a1a', background: '#080808', flexShrink: 0,
    }}>
      {/* App name */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 1rem',
        color: '#4a9eff', fontWeight: 'bold', fontSize: '0.85rem',
        fontFamily: 'Consolas, monospace', letterSpacing: '0.06em',
        borderRight: '1px solid #1a1a1a', whiteSpace: 'nowrap',
      }}>
        PIPE DREAM CNC
      </div>

      {TAB_DEFS.map(({ id, label }) => (
        <button key={id} style={tabStyle(activeTab === id)} onClick={() => setActiveTab(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}
