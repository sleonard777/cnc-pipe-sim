import { ValidationError } from '../../utils/validation';

interface ErrorBannerProps {
  errors: ValidationError[];
}

export function ErrorBanner({ errors }: ErrorBannerProps) {
  if (errors.length === 0) return null;
  return (
    <div style={{
      background: '#2a0a0a',
      border: '1px solid #cc2222',
      borderRadius: '4px',
      padding: '0.5rem 0.75rem',
      marginBottom: '1rem',
    }}>
      {errors.map((e, i) => (
        <div key={i} style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
          {e.message}
        </div>
      ))}
    </div>
  );
}
