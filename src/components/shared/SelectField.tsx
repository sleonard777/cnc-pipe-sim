import React from 'react';
import { FormField } from './FormField';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d1a',
  border: '1px solid #333',
  color: '#e0e0e0',
  padding: '0.3rem 0.5rem',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  borderRadius: '3px',
};

export function SelectField({ label, value, onChange, options, error }: SelectFieldProps) {
  return (
    <FormField label={label} error={error}>
      <select style={selectStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FormField>
  );
}
