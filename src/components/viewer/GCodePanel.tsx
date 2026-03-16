import { useJobStore } from '../../state/jobStore';
import { downloadTextFile } from '../../utils/fileDownload';

export function GCodePanel() {
  const gcode = useJobStore((s) => s.gcode);
  const generateCode = useJobStore((s) => s.generateCode);
  const jobNum = useJobStore((s) => s.jobState.job.jobNumber);

  if (!gcode) {
    return (
      <div style={{ padding: '1rem', color: '#666', fontSize: '0.85rem' }}>
        <p>No G-code generated yet.</p>
        <button
          style={{ marginTop: '0.5rem', background: '#1a3a6a', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '3px', cursor: 'pointer', fontFamily: 'inherit' }}
          onClick={generateCode}
        >
          Generate Now
        </button>
      </div>
    );
  }

  const filename = `${jobNum || 'job'}_cnc.tap`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderBottom: '1px solid #222' }}>
        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{filename}</span>
        <button
          style={{ background: '#1a5a2a', border: 'none', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}
          onClick={() => downloadTextFile(gcode, filename)}
        >
          Download .tap
        </button>
      </div>
      <textarea
        readOnly
        style={{
          flex: 1, background: '#07070f', color: '#88ff88', fontFamily: 'Consolas, monospace',
          fontSize: '0.75rem', border: 'none', padding: '0.75rem', resize: 'none', outline: 'none',
        }}
        value={gcode}
      />
    </div>
  );
}
