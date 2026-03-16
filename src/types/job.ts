import { MachineConfig } from './machine';
import { PipeSpec } from './pipe';
import { CutParams } from './cut';

export interface JobInfo {
  jobNumber: string;
  operator: string;
  partNumber: string;
  notes: string;
}

export interface JobState {
  machine: MachineConfig;
  pipe: PipeSpec;
  cut: CutParams;
  job: JobInfo;
}

export interface SavedJob {
  id: string;
  name: string;
  savedAt: string;
  state: JobState;
}
