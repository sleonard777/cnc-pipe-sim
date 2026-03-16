import { useJobStore } from '../../state/jobStore';
import { MachineConfigSection } from './MachineConfigSection';
import { PipeDimensionsSection } from './PipeDimensionsSection';
import { CutParametersSection } from './CutParametersSection';
import { JobInfoSection } from './JobInfoSection';
import { ActionBar } from './ActionBar';
import { ErrorBanner } from '../shared/ErrorBanner';

export function InputTab() {
  const validationErrors = useJobStore((s) => s.validationErrors);

  return (
    <div style={{ padding: '1rem', overflowY: 'auto', height: '100%' }}>
      <ErrorBanner errors={validationErrors} />
      <MachineConfigSection />
      <div style={{ height: '0.75rem' }} />
      <PipeDimensionsSection />
      <div style={{ height: '0.75rem' }} />
      <CutParametersSection />
      <div style={{ height: '0.75rem' }} />
      <JobInfoSection />
      <ActionBar />
    </div>
  );
}
