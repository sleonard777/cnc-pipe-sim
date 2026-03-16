import { useJobStore } from '../../state/jobStore';
import { NumericField } from '../shared/NumericField';
import { SelectField } from '../shared/SelectField';
import { FormField } from '../shared/FormField';

export function PipeDimensionsSection() {
  const pipe = useJobStore((s) => s.jobState.pipe);
  const updatePipe = useJobStore((s) => s.updatePipe);

  return (
    <section>
      <h4 style={sectionTitle}>Pipe / Tube</h4>
      <SelectField label="Shape" value={pipe.shape}
        onChange={(v) => updatePipe({ shape: v as 'round' | 'square' | 'rectangular' })}
        options={[
          { value: 'round', label: 'Round' },
          { value: 'square', label: 'Square HSS' },
          { value: 'rectangular', label: 'Rectangular HSS' },
        ]}
      />
      <NumericField label={pipe.shape === 'round' ? 'Outer Diameter' : 'Width'} value={pipe.od}
        unit="in" min={1} max={10} step={0.25}
        onChange={(v) => updatePipe({ od: v })} />
      {pipe.shape === 'rectangular' && (
        <NumericField label="Height" value={pipe.height ?? pipe.od} unit="in" min={1} max={10} step={0.25}
          onChange={(v) => updatePipe({ height: v })} />
      )}
      <NumericField label="Wall Thickness" value={pipe.wallThickness} unit="in" min={0.05} max={2} step={0.0625}
        onChange={(v) => updatePipe({ wallThickness: v })} />
      <NumericField label="Length" value={pipe.length} unit="in" min={1}
        onChange={(v) => updatePipe({ length: v })} />
      <FormField label="Material">
        <input
          style={inputStyle}
          value={pipe.material}
          onChange={(e) => updatePipe({ material: e.target.value })}
        />
      </FormField>
    </section>
  );
}

const sectionTitle: React.CSSProperties = {
  color: '#4a9eff', borderBottom: '1px solid #333', paddingBottom: '0.25rem',
  marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d0d1a', border: '1px solid #333', color: '#e0e0e0',
  padding: '0.3rem 0.5rem', fontFamily: 'inherit', fontSize: '0.85rem', borderRadius: '3px',
};
