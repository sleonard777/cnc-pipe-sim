import { useState } from 'react';
import { useJobPersistence } from '../../hooks/useJobPersistence';

interface SavedJobsModalProps {
  onClose: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};

const modalStyle: React.CSSProperties = {
  background: '#12122a', border: '1px solid #333', borderRadius: '6px',
  padding: '1.5rem', minWidth: '400px', maxWidth: '600px', width: '90%',
  fontFamily: 'Consolas, monospace',
};

const btnStyle = (color: string): React.CSSProperties => ({
  background: color, border: 'none', color: '#fff', padding: '0.25rem 0.6rem',
  borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', marginLeft: '0.4rem',
});

export function SavedJobsModal({ onClose }: SavedJobsModalProps) {
  const { saveJob, loadJob, deleteJob, listJobs } = useJobPersistence();
  const [saveName, setSaveName] = useState('');
  const jobs = listJobs();

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#4a9eff', marginBottom: '1rem' }}>Saved Jobs</h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            style={{ flex: 1, background: '#0d0d1a', border: '1px solid #333', color: '#e0e0e0', padding: '0.3rem 0.5rem', borderRadius: '3px', fontFamily: 'inherit' }}
            placeholder="Job name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
          <button
            style={btnStyle('#226622')}
            onClick={() => { if (saveName.trim()) { saveJob(saveName.trim()); setSaveName(''); } }}
          >
            Save Current
          </button>
        </div>

        {jobs.length === 0 && <p style={{ color: '#666', fontSize: '0.8rem' }}>No saved jobs.</p>}

        {jobs.map((j) => (
          <div key={j.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #222', padding: '0.4rem 0',
          }}>
            <div>
              <div style={{ color: '#e0e0e0', fontSize: '0.85rem' }}>{j.name}</div>
              <div style={{ color: '#666', fontSize: '0.7rem' }}>{new Date(j.savedAt).toLocaleString()}</div>
            </div>
            <div>
              <button style={btnStyle('#225588')} onClick={() => { loadJob(j.id); onClose(); }}>Load</button>
              <button style={btnStyle('#882222')} onClick={() => deleteJob(j.id)}>Delete</button>
            </div>
          </div>
        ))}

        <button style={{ ...btnStyle('#444'), marginTop: '1rem' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
