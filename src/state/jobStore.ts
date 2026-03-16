import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { JobState } from '../types/job';
import { generateGCode } from '../gcode';
import { crossFieldValidate, ValidationError } from '../utils/validation';

export type AnimationState = 'idle' | 'playing' | 'paused';
export type AnimationSpeed = 1 | 5 | 10;
export type ActiveTab = 'input' | 'viewer';

const DEFAULT_JOB: JobState = {
  machine: {
    model: 'PD-10',
    amperage: 65,
    kerfWidth: 0.06,
  },
  pipe: {
    shape: 'round',
    od: 4,
    wallThickness: 0.25,
    length: 60,
    material: 'A500 Gr B',
  },
  cut: {
    cutType: 'straight',
    xOffset: 30,
    miterAngle: 0,
    bevelAngle: 0,
    bRotation: 0,
    feedRate: 40,
    pierceHeight: 0.15,
    cutHeight: 0.06,
  },
  job: {
    jobNumber: '',
    operator: '',
    partNumber: '',
    notes: '',
  },
};

interface StoreState {
  jobState: JobState;
  gcode: string | null;
  validationErrors: ValidationError[];
  activeTab: ActiveTab;
  animationState: AnimationState;
  animationSpeed: AnimationSpeed;

  // Actions
  updateMachine: (patch: Partial<JobState['machine']>) => void;
  updatePipe: (patch: Partial<JobState['pipe']>) => void;
  updateCut: (patch: Partial<JobState['cut']>) => void;
  updateJob: (patch: Partial<JobState['job']>) => void;
  loadJobState: (state: JobState) => void;
  generateCode: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setAnimationState: (state: AnimationState) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
}

export const useJobStore = create<StoreState>()(
  immer((set, get) => ({
    jobState: DEFAULT_JOB,
    gcode: null,
    validationErrors: [],
    activeTab: 'input',
    animationState: 'idle',
    animationSpeed: 1,

    updateMachine: (patch) =>
      set((s) => {
        Object.assign(s.jobState.machine, patch);
        s.validationErrors = validate(s.jobState);
      }),

    updatePipe: (patch) =>
      set((s) => {
        Object.assign(s.jobState.pipe, patch);
        s.validationErrors = validate(s.jobState);
      }),

    updateCut: (patch) =>
      set((s) => {
        Object.assign(s.jobState.cut, patch);
        s.validationErrors = validate(s.jobState);
      }),

    updateJob: (patch) =>
      set((s) => {
        Object.assign(s.jobState.job, patch);
      }),

    loadJobState: (state) =>
      set((s) => {
        s.jobState = state;
        s.gcode = null;
        s.validationErrors = validate(state);
        s.animationState = 'idle';
      }),

    generateCode: () => {
      const { jobState, validationErrors } = get();
      if (validationErrors.length > 0) return;
      const gcode = generateGCode(jobState);
      set((s) => {
        s.gcode = gcode;
      });
    },

    setActiveTab: (tab) =>
      set((s) => {
        s.activeTab = tab;
      }),

    setAnimationState: (state) =>
      set((s) => {
        s.animationState = state;
      }),

    setAnimationSpeed: (speed) =>
      set((s) => {
        s.animationSpeed = speed;
      }),
  }))
);

function validate(job: JobState): ValidationError[] {
  return crossFieldValidate(
    job.machine.model,
    job.pipe.length,
    job.cut.xOffset,
    job.pipe.od,
    job.cut.branchOD,
  );
}
