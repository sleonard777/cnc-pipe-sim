import React from 'react';
import { FormField } from './FormField';

interface NumericFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  error?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d1a',
  border: '1px solid #333',
  color: '#e0e0e0',
  padding: '0.3rem 0.5rem',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  borderRadius: '3px',
};

export function NumericField({ label, value, onChange, min, max, step = 0.01, unit, error }: NumericFieldProps) {
  return (
    <FormField label={label} unit={unit} error={error}>
      <input
        type="number"
        style={inputStyle}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
      />
    </FormField>
  );
}
