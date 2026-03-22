import { useJobStore, ActiveTab } from '../../state/jobStore';
import { useIsMobile } from '../../hooks/useWindowWidth';

const TABS: { id: ActiveTab; label: string; short: string }[] = [
  { id: 'input',   label: 'INPUT',          short: 'INPUT'   },
  { id: 'viewer',  label: 'VIEWER / G-CODE', short: 'VIEWER'  },
  { id: 'control', label: 'CONTROL PANEL',   short: 'CONTROL' },
];

export function TabBar() {
  const activeTab  = useJobStore((s) => s.activeTab);
  const setActiveTab = useJobStore((s) => s.setActiveTab);
  const mobile = useIsMobile();

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: mobile ? 1 : undefined,
    padding: mobile ? '0 0.5rem' : '0 1.25rem',
    height: '100%',
    background: active ? '#0e0e0e' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #4a9eff' : '2px solid transparent',
    color: active ? '#4a9eff' : '#444',
    cursor: 'pointer',
    fontFamily: 'Consolas, monospace',
    fontSize: mobile ? '0.7rem' : '0.78rem',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      height: mobile ? '44px' : '38px',
      borderBottom: '1px solid #1a1a1a', background: '#080808', flexShrink: 0,
    }}>
      {!mobile && (
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 1rem',
          color: '#4a9eff', fontWeight: 'bold', fontSize: '0.85rem',
          fontFamily: 'Consolas, monospace', letterSpacing: '0.06em',
          borderRight: '1px solid #1a1a1a', whiteSpace: 'nowrap',
        }}>
          PIPE DREAM CNC
        </div>
      )}
      {TABS.map(({ id, label, short }) => (
        <button key={id} style={tabStyle(activeTab === id)} onClick={() => setActiveTab(id)}>
          {mobile ? short : label}
        </button>
      ))}
    </div>
  );
}
