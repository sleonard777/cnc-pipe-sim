export type MachineModel = 'PD-10' | 'PD-24';

export interface MachineConfig {
  model: MachineModel;
  amperage: number;
  kerfWidth: number;
}

export interface MachineEnvelope {
  maxLength: number;  // inches
  width: number;
  height: number;
  minOD: number;
  maxOD: number;
}

export const MACHINE_ENVELOPE: Record<MachineModel, MachineEnvelope> = {
  'PD-10': { maxLength: 120, width: 40, height: 64, minOD: 1, maxOD: 10 },
  'PD-24': { maxLength: 288, width: 40, height: 64, minOD: 1, maxOD: 10 },
};
