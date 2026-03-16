import { useJobStore } from '../../state/jobStore';
import { NumericField } from '../shared/NumericField';
import { SelectField } from '../shared/SelectField';

export function CutParametersSection() {
  const cut = useJobStore((s) => s.jobState.cut);
  const updateCut = useJobStore((s) => s.updateCut);

  return (
    <section>
      <h4 style={sectionTitle}>Cut Parameters</h4>
      <SelectField label="Cut Type" value={cut.cutType}
        onChange={(v) => updateCut({ cutType: v as typeof cut.cutType })}
        options={[
          { value: 'straight', label: 'Straight' },
          { value: 'miter', label: 'Miter' },
          { value: 'saddle', label: 'Saddle (Branch)' },
          { value: 'bevel', label: 'Bevel' },
          { value: 'hole', label: 'Hole' },
          { value: 'slot', label: 'Slot' },
        ]}
      />
      <NumericField label="X Offset (Cut Position)" value={cut.xOffset} unit="in" min={0} step={0.5}
        onChange={(v) => updateCut({ xOffset: v })} />

      {(cut.cutType === 'straight' || cut.cutType === 'miter') && (
        <NumericField label="Miter Angle" value={cut.miterAngle} unit="°" min={-60} max={60} step={1}
          onChange={(v) => updateCut({ miterAngle: v })} />
      )}
      {cut.cutType === 'bevel' && (
        <NumericField label="Bevel Angle" value={cut.bevelAngle} unit="°" min={-45} max={45} step={1}
          onChange={(v) => updateCut({ bevelAngle: v })} />
      )}
      {cut.cutType === 'saddle' && (
        <NumericField label="Branch Pipe OD" value={cut.branchOD ?? 2} unit="in" min={0.5} max={9} step={0.25}
          onChange={(v) => updateCut({ branchOD: v })} />
      )}
      {(cut.cutType === 'hole' || cut.cutType === 'slot') && (
        <NumericField label="Hole Width" value={cut.holeWidth ?? 2} unit="in" min={0.1} step={0.125}
          onChange={(v) => updateCut({ holeWidth: v })} />
      )}
      {cut.cutType === 'slot' && (
        <NumericField label="Slot Height" value={cut.holeHeight ?? 4} unit="in" min={0.1} step={0.125}
          onChange={(v) => updateCut({ holeHeight: v })} />
      )}

      <NumericField label="Feed Rate" value={cut.feedRate} unit="IPM" min={1} max={500} step={5}
        onChange={(v) => updateCut({ feedRate: v })} />
      <NumericField label="Pierce Height" value={cut.pierceHeight} unit="in" min={0.05} max={2} step={0.01}
        onChange={(v) => updateCut({ pierceHeight: v })} />
      <NumericField label="Cut Height" value={cut.cutHeight} unit="in" min={0.01} max={1} step={0.005}
        onChange={(v) => updateCut({ cutHeight: v })} />
      <NumericField label="B-Axis Start" value={cut.bRotation} unit="°" min={0} max={360} step={15}
        onChange={(v) => updateCut({ bRotation: v })} />
    </section>
  );
}

const sectionTitle: React.CSSProperties = {
  color: '#4a9eff', borderBottom: '1px solid #333', paddingBottom: '0.25rem',
  marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em',
};
