import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  unit?: string;
}

export function FormField({ label, children, error, unit }: FormFieldProps) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '0.2rem' }}>
        {label}{unit && <span style={{ color: '#666', marginLeft: '0.3rem' }}>({unit})</span>}
      </label>
      {children}
      {error && <div style={{ color: '#ff6b6b', fontSize: '0.7rem', marginTop: '0.2rem' }}>{error}</div>}
    </div>
  );
}
