import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { JobState } from '../types/job';
import { generateGCode } from '../gcode';
import { crossFieldValidate, ValidationError } from '../utils/validation';

export type AnimationState = 'idle' | 'playing' | 'paused';
export type AnimationSpeed = 1 | 5 | 10;
export type ActiveTab = 'input' | 'viewer' | 'control';
export type MachineControlState = 'ESTOP' | 'ESTOP_RESET' | 'ON';

export interface DroPosition {
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
}

const DEFAULT_JOB: JobState = {
  machine: { model: 'PD-10', amperage: 65, kerfWidth: 0.06 },
  pipe: { shape: 'round', od: 4, wallThickness: 0.25, length: 60, material: 'A500 Gr B' },
  cut: {
    cutType: 'straight', xOffset: 30, miterAngle: 0, bevelAngle: 0,
    bRotation: 0, feedRate: 40, pierceHeight: 0.15, cutHeight: 0.06,
  },
  job: { jobNumber: '', operator: '', partNumber: '', notes: '' },
};

interface StoreState {
  jobState: JobState;
  gcode: string | null;
  validationErrors: ValidationError[];
  activeTab: ActiveTab;
  animationState: AnimationState;
  animationSpeed: AnimationSpeed;

  // Control panel state
  droPosition: DroPosition;
  currentGcodeLine: number;
  feedOverride: number;        // 0.1 – 2.0 (10%–200%)
  machineControlState: MachineControlState;
  allHomed: boolean;

  // Actions — job form
  updateMachine: (patch: Partial<JobState['machine']>) => void;
  updatePipe: (patch: Partial<JobState['pipe']>) => void;
  updateCut: (patch: Partial<JobState['cut']>) => void;
  updateJob: (patch: Partial<JobState['job']>) => void;
  loadJobState: (state: JobState) => void;
  generateCode: () => void;

  // Actions — navigation / animation
  setActiveTab: (tab: ActiveTab) => void;
  setAnimationState: (state: AnimationState) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;

  // Actions — control panel (called from SceneManager or UI)
  setDroPosition: (pos: DroPosition) => void;
  setCurrentGcodeLine: (line: number) => void;
  setFeedOverride: (v: number) => void;
  setMachineControlState: (s: MachineControlState) => void;
  setAllHomed: (v: boolean) => void;
}

export const useJobStore = create<StoreState>()(
  immer((set, get) => ({
    jobState: DEFAULT_JOB,
    gcode: null,
    validationErrors: [],
    activeTab: 'input',
    animationState: 'idle',
    animationSpeed: 1,

    droPosition: { x: 0, y: 0, z: 0, a: 0, b: 0 },
    currentGcodeLine: 0,
    feedOverride: 1.0,
    machineControlState: 'ESTOP',
    allHomed: false,

    updateMachine: (patch) =>
      set((s) => { Object.assign(s.jobState.machine, patch); s.validationErrors = validate(s.jobState); }),

    updatePipe: (patch) =>
      set((s) => { Object.assign(s.jobState.pipe, patch); s.validationErrors = validate(s.jobState); }),

    updateCut: (patch) =>
      set((s) => { Object.assign(s.jobState.cut, patch); s.validationErrors = validate(s.jobState); }),

    updateJob: (patch) =>
      set((s) => { Object.assign(s.jobState.job, patch); }),

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
      set((s) => { s.gcode = gcode; });
    },

    setActiveTab: (tab) => set((s) => { s.activeTab = tab; }),
    setAnimationState: (state) => set((s) => { s.animationState = state; }),
    setAnimationSpeed: (speed) => set((s) => { s.animationSpeed = speed; }),

    // These are called at 60fps from SceneManager — use direct setState (no immer overhead)
    setDroPosition: (pos) => set((s) => { s.droPosition = pos; }),
    setCurrentGcodeLine: (line) => set((s) => { s.currentGcodeLine = line; }),

    setFeedOverride: (v) => set((s) => { s.feedOverride = v; }),
    setMachineControlState: (s2) =>
      set((s) => {
        s.machineControlState = s2;
        if (s2 === 'ESTOP') s.animationState = 'idle';
      }),
    setAllHomed: (v) => set((s) => { s.allHomed = v; }),
  }))
);

function validate(job: JobState): ValidationError[] {
  return crossFieldValidate(job.machine.model, job.pipe.length, job.cut.xOffset, job.pipe.od, job.cut.branchOD);
}
