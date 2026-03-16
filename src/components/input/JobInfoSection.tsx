import { useJobStore } from '../../state/jobStore';
import { FormField } from '../shared/FormField';

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d0d1a', border: '1px solid #333', color: '#e0e0e0',
  padding: '0.3rem 0.5rem', fontFamily: 'inherit', fontSize: '0.85rem', borderRadius: '3px',
};

export function JobInfoSection() {
  const job = useJobStore((s) => s.jobState.job);
  const updateJob = useJobStore((s) => s.updateJob);

  return (
    <section>
      <h4 style={sectionTitle}>Job Info</h4>
      <FormField label="Job Number">
        <input style={inputStyle} value={job.jobNumber} onChange={(e) => updateJob({ jobNumber: e.target.value })} />
      </FormField>
      <FormField label="Operator">
        <input style={inputStyle} value={job.operator} onChange={(e) => updateJob({ operator: e.target.value })} />
      </FormField>
      <FormField label="Part Number">
        <input style={inputStyle} value={job.partNumber} onChange={(e) => updateJob({ partNumber: e.target.value })} />
      </FormField>
      <FormField label="Notes">
        <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
          value={job.notes} onChange={(e) => updateJob({ notes: e.target.value })} />
      </FormField>
    </section>
  );
}

const sectionTitle: React.CSSProperties = {
  color: '#4a9eff', borderBottom: '1px solid #333', paddingBottom: '0.25rem',
  marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em',
};
