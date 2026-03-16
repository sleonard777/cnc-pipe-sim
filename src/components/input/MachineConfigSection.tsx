import { useJobStore } from '../../state/jobStore';
import { NumericField } from '../shared/NumericField';
import { SelectField } from '../shared/SelectField';

export function MachineConfigSection() {
  const machine = useJobStore((s) => s.jobState.machine);
  const updateMachine = useJobStore((s) => s.updateMachine);

  return (
    <section>
      <h4 style={sectionTitle}>Machine</h4>
      <SelectField
        label="Model"
        value={machine.model}
        onChange={(v) => updateMachine({ model: v as 'PD-10' | 'PD-24' })}
        options={[
          { value: 'PD-10', label: 'PD-10 (10 ft / 120")' },
          { value: 'PD-24', label: 'PD-24 (24 ft / 288")' },
        ]}
      />
      <NumericField label="Amperage" value={machine.amperage} unit="A" min={20} max={200} step={5}
        onChange={(v) => updateMachine({ amperage: v })} />
      <NumericField label="Kerf Width" value={machine.kerfWidth} unit="in" min={0.01} max={0.5} step={0.005}
        onChange={(v) => updateMachine({ kerfWidth: v })} />
    </section>
  );
}

const sectionTitle: React.CSSProperties = {
  color: '#4a9eff', borderBottom: '1px solid #333', paddingBottom: '0.25rem',
  marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em',
};
