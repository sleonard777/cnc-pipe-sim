import { useState } from 'react';
import { useJobStore } from '../../state/jobStore';
import { SavedJobsModal } from '../shared/SavedJobsModal';

const btn = (color: string): React.CSSProperties => ({
  background: color, border: 'none', color: '#fff',
  padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer',
  fontFamily: 'Consolas, monospace', fontSize: '0.85rem', fontWeight: 'bold',
  flex: 1,
});

export function ActionBar() {
  const [showSaved, setShowSaved] = useState(false);
  const generateCode = useJobStore((s) => s.generateCode);
  const setActiveTab = useJobStore((s) => s.setActiveTab);
  const validationErrors = useJobStore((s) => s.validationErrors);
  const hasErrors = validationErrors.length > 0;

  const handleGenerate = () => {
    generateCode();
    setActiveTab('viewer');
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button style={btn(hasErrors ? '#444' : '#1a6a2a')} onClick={handleGenerate} disabled={hasErrors}>
          Generate G-Code
        </button>
        <button style={btn('#1a3a6a')} onClick={() => setActiveTab('viewer')}>
          Preview 3D
        </button>
        <button style={btn('#333')} onClick={() => setShowSaved(true)}>
          Jobs
        </button>
      </div>
      {showSaved && <SavedJobsModal onClose={() => setShowSaved(false)} />}
    </>
  );
}
