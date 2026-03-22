import { useJobStore, MachineControlState } from '../../state/jobStore';
import { useIsMobile } from '../../hooks/useWindowWidth';

function Led({ on, color }: { on: boolean; color: string }) {
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
      background: on ? color : '#2a2a2a',
      boxShadow: on ? `0 0 6px ${color}` : 'none',
      marginRight: '5px', verticalAlign: 'middle',
    }} />
  );
}

function CtrlBtn({ label, onClick, color = '#2a2a2a', textColor = '#ccc', disabled = false }:
  { label: string; onClick: () => void; color?: string; textColor?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#1a1a1a' : color,
        border: `1px solid ${disabled ? '#222' : '#444'}`,
        color: disabled ? '#333' : textColor,
        padding: '0.25rem 0.7rem',
        borderRadius: '3px',
        fontFamily: 'Consolas, monospace',
        fontSize: '0.72rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  );
}

const STATE_LABEL: Record<MachineControlState, string> = {
  ESTOP: 'E-STOP',
  ESTOP_RESET: 'ESTOP RESET',
  ON: 'MACHINE ON',
};

const STATE_COLOR: Record<MachineControlState, string> = {
  ESTOP: '#cc0000',
  ESTOP_RESET: '#cc8800',
  ON: '#00aa00',
};

export function MachineBar() {
  const mcs = useJobStore((s) => s.machineControlState);
  const allHomed = useJobStore((s) => s.allHomed);
  const setMcs = useJobStore((s) => s.setMachineControlState);
  const setAllHomed = useJobStore((s) => s.setAllHomed);
  const animState = useJobStore((s) => s.animationState);
  const setAnimState = useJobStore((s) => s.setAnimationState);
  const gcode = useJobStore((s) => s.gcode);
  const generateCode = useJobStore((s) => s.generateCode);
  const validationErrors = useJobStore((s) => s.validationErrors);

  const isOn = mcs === 'ON';
  const canRun = isOn && allHomed && !!gcode && validationErrors.length === 0;

  const handleEstop = () => {
    setMcs('ESTOP');
    setAnimState('idle');
  };

  const handleResetEstop = () => {
    if (mcs === 'ESTOP') setMcs('ESTOP_RESET');
  };

  const handlePower = () => {
    if (mcs === 'ESTOP_RESET') setMcs('ON');
    else if (mcs === 'ON') setMcs('ESTOP_RESET');
  };

  const handleHomeAll = () => {
    if (isOn) setAllHomed(true);
  };

  const handleRunPause = () => {
    if (!canRun && animState === 'idle') return;
    if (animState === 'playing') setAnimState('paused');
    else if (animState === 'paused') setAnimState('playing');
    else { setAnimState('playing'); }
  };

  const handleStop = () => setAnimState('idle');

  const handleGenAndLoad = () => {
    generateCode();
  };

  const mobile = useIsMobile();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: mobile ? '0.35rem' : '0.5rem', flexWrap: 'wrap',
      padding: mobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
      background: '#141414',
      borderBottom: '2px solid #222',
    }}>
      {/* E-Stop */}
      <button
        onClick={handleEstop}
        style={{
          background: '#cc0000', border: '2px solid #ff2222', color: '#fff',
          padding: '0.3rem 0.9rem', borderRadius: '3px', cursor: 'pointer',
          fontFamily: 'Consolas, monospace', fontSize: '0.75rem', fontWeight: 'bold',
          letterSpacing: '0.05em', boxShadow: '0 0 8px #cc000088',
        }}
      >
        E-STOP
      </button>

      <div style={{ width: '1px', background: '#333', alignSelf: 'stretch' }} />

      <CtrlBtn label="RESET" onClick={handleResetEstop} disabled={mcs !== 'ESTOP'} color="#442200" textColor="#ffaa00" />
      <CtrlBtn
        label={mcs === 'ON' ? 'PWR OFF' : 'PWR ON'}
        onClick={handlePower}
        disabled={mcs === 'ESTOP'}
        color={isOn ? '#003300' : '#002200'}
        textColor={isOn ? '#00ff00' : '#00aa00'}
      />
      <CtrlBtn label="HOME ALL" onClick={handleHomeAll} disabled={!isOn} color="#001a33" textColor="#4a9eff" />

      <div style={{ width: '1px', background: '#333', alignSelf: 'stretch' }} />

      {/* Machine state indicator */}
      <div style={{
        padding: '0.2rem 0.6rem', borderRadius: '3px',
        background: '#0a0a0a', border: `1px solid ${STATE_COLOR[mcs]}`,
        fontSize: '0.7rem', fontFamily: 'Consolas, monospace',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <Led on color={STATE_COLOR[mcs]} />
        <span style={{ color: STATE_COLOR[mcs] }}>{STATE_LABEL[mcs]}</span>
        {allHomed && isOn && <span style={{ color: '#00aa00', marginLeft: '4px' }}>| HOMED</span>}
      </div>

      <div style={{ width: '1px', background: '#333', alignSelf: 'stretch' }} />

      {/* Program controls */}
      <CtrlBtn label="GEN PROG" onClick={handleGenAndLoad} disabled={!isOn || validationErrors.length > 0} color="#1a1a33" textColor="#aaaaff" />

      <CtrlBtn
        label={animState === 'playing' ? 'FEED HOLD' : animState === 'paused' ? 'RESUME' : 'CYCLE START'}
        onClick={handleRunPause}
        disabled={!canRun && animState === 'idle'}
        color={animState === 'playing' ? '#332200' : animState === 'paused' ? '#1a3a1a' : '#003300'}
        textColor={animState === 'playing' ? '#ffaa00' : '#00ff00'}
      />
      <CtrlBtn label="STOP" onClick={handleStop} disabled={animState === 'idle'} color="#1a0000" textColor="#ff4444" />
    </div>
  );
}
