import { useState } from 'react';
import { useJobStore } from '../../state/jobStore';
import { NumericField } from '../shared/NumericField';
import { SelectField } from '../shared/SelectField';
import { FormField } from '../shared/FormField';
import { PIPE_CHART, HSS_SQUARE_CHART } from '../../data/pipeChart';
import { MATERIALS } from '../../data/materials';

const sectionTitle: React.CSSProperties = {
  color: '#4a9eff', borderBottom: '1px solid #333', paddingBottom: '0.25rem',
  marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d0d1a', border: '1px solid #333', color: '#e0e0e0',
  padding: '0.3rem 0.5rem', fontFamily: 'inherit', fontSize: '0.85rem', borderRadius: '3px',
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
};

const modalBox: React.CSSProperties = {
  background: '#12122a', border: '1px solid #4a9eff', borderRadius: '6px',
  padding: '1.25rem', width: '480px', maxHeight: '80vh', overflowY: 'auto',
  fontFamily: 'Consolas, monospace',
};

const th: React.CSSProperties = {
  color: '#4a9eff', textAlign: 'left', fontSize: '0.75rem',
  padding: '0.25rem 0.5rem', borderBottom: '1px solid #333',
};

const td: React.CSSProperties = {
  fontSize: '0.8rem', padding: '0.2rem 0.5rem', color: '#ccc',
};

const trHover: React.CSSProperties = {
  cursor: 'pointer', background: '#1a1a3a',
};

export function PipeDimensionsSection() {
  const pipe = useJobStore((s) => s.jobState.pipe);
  const updatePipe = useJobStore((s) => s.updatePipe);
  const [showChart, setShowChart] = useState(false);
  const [customMaterial, setCustomMaterial] = useState(false);

  const materialOptions = MATERIALS.map((m) => ({ value: m.value, label: m.label }));

  const handleMaterialSelect = (v: string) => {
    if (v === 'custom') {
      setCustomMaterial(true);
    } else {
      setCustomMaterial(false);
      updatePipe({ material: v });
    }
  };

  const currentMaterialValue = MATERIALS.find((m) => m.value === pipe.material)
    ? pipe.material
    : customMaterial
    ? 'custom'
    : 'custom';

  return (
    <section>
      <h4 style={sectionTitle}>
        <span>Pipe / Tube</span>
        {pipe.shape === 'round' && (
          <button
            onClick={() => setShowChart(true)}
            style={{ background: '#1a3a6a', border: '1px solid #4a9eff', color: '#4a9eff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '3px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Pipe Chart
          </button>
        )}
        {pipe.shape === 'square' && (
          <button
            onClick={() => setShowChart(true)}
            style={{ background: '#1a3a6a', border: '1px solid #4a9eff', color: '#4a9eff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '3px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            HSS Chart
          </button>
        )}
      </h4>

      <SelectField label="Shape" value={pipe.shape}
        onChange={(v) => updatePipe({ shape: v as 'round' | 'square' | 'rectangular' | 'channel' })}
        options={[
          { value: 'round',       label: 'Round Pipe' },
          { value: 'square',      label: 'Square HSS' },
          { value: 'rectangular', label: 'Rectangular HSS' },
          { value: 'channel',     label: 'C-Channel' },
        ]}
      />

      <NumericField
        label={pipe.shape === 'channel' ? 'Web Height' : pipe.shape === 'round' ? 'Outer Diameter (OD)' : 'Width'}
        value={pipe.od} unit="in"
        min={pipe.shape === 'channel' ? 2 : 1} max={pipe.shape === 'channel' ? 8 : 10} step={0.0625}
        onChange={(v) => updatePipe({ od: v })}
      />

      {pipe.shape === 'rectangular' && (
        <NumericField label="Height" value={pipe.height ?? pipe.od} unit="in" min={1} max={10} step={0.0625}
          onChange={(v) => updatePipe({ height: v })} />
      )}

      {pipe.shape === 'channel' && (
        <NumericField
          label="Flange Width"
          value={pipe.flangeWidth ?? Math.max(1, Math.round(pipe.od * 0.5 * 8) / 8)}
          unit="in" min={0.5} max={8} step={0.0625}
          onChange={(v) => updatePipe({ flangeWidth: v })}
        />
      )}

      <NumericField label="Wall Thickness" value={pipe.wallThickness} unit="in" min={0.05} max={2} step={0.001}
        onChange={(v) => updatePipe({ wallThickness: v })} />

      <NumericField label="Length" value={pipe.length} unit="in" min={1}
        onChange={(v) => updatePipe({ length: v })} />

      {/* Material selector */}
      <SelectField label="Material" value={currentMaterialValue}
        onChange={handleMaterialSelect}
        options={materialOptions}
      />
      {(customMaterial || !MATERIALS.find((m) => m.value === pipe.material)) && (
        <FormField label="Custom Material">
          <input style={inputStyle} value={pipe.material}
            onChange={(e) => updatePipe({ material: e.target.value })}
            placeholder="e.g. A500 Gr C"
          />
        </FormField>
      )}

      {/* Pipe chart modal */}
      {showChart && pipe.shape === 'round' && (
        <div style={modalOverlay} onClick={() => setShowChart(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#4a9eff', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              ANSI/ASME Pipe Chart — Click a row to apply
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>NPS</th>
                  <th style={th}>OD (in)</th>
                  <th style={th}>Schedule</th>
                  <th style={th}>Wall (in)</th>
                  <th style={th}>ID (in)</th>
                </tr>
              </thead>
              <tbody>
                {PIPE_CHART.flatMap((size) =>
                  size.schedules.map((sch) => {
                    const id = +(size.od - 2 * sch.wallThickness).toFixed(3);
                    return (
                      <tr
                        key={`${size.nps}-${sch.label}`}
                        style={trHover}
                        onClick={() => {
                          updatePipe({ od: size.od, wallThickness: sch.wallThickness });
                          setShowChart(false);
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#223355')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td style={td}>{size.nps}</td>
                        <td style={td}>{size.od.toFixed(3)}</td>
                        <td style={td}>{sch.label}</td>
                        <td style={td}>{sch.wallThickness.toFixed(3)}</td>
                        <td style={td}>{id}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <button onClick={() => setShowChart(false)}
              style={{ marginTop: '1rem', background: '#333', border: 'none', color: '#ccc', padding: '0.3rem 0.8rem', borderRadius: '3px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* HSS chart modal */}
      {showChart && pipe.shape === 'square' && (
        <div style={modalOverlay} onClick={() => setShowChart(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#4a9eff', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              HSS Square Tube Chart — Click a row to apply
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Size</th>
                  <th style={th}>Width (in)</th>
                  <th style={th}>Wall</th>
                  <th style={th}>Wall (in)</th>
                </tr>
              </thead>
              <tbody>
                {HSS_SQUARE_CHART.flatMap((size) =>
                  size.walls.map((w) => (
                    <tr
                      key={`${size.label}-${w.label}`}
                      style={trHover}
                      onClick={() => {
                        updatePipe({ od: size.od, wallThickness: w.wallThickness });
                        setShowChart(false);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#223355')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td style={td}>{size.label}</td>
                      <td style={td}>{size.od.toFixed(3)}</td>
                      <td style={td}>{w.label}</td>
                      <td style={td}>{w.wallThickness.toFixed(3)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button onClick={() => setShowChart(false)}
              style={{ marginTop: '1rem', background: '#333', border: 'none', color: '#ccc', padding: '0.3rem 0.8rem', borderRadius: '3px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
