import { z } from 'zod';
import { MACHINE_ENVELOPE } from '../types/machine';

export const machineConfigSchema = z.object({
  model: z.enum(['PD-10', 'PD-24']),
  amperage: z.number().min(20).max(200),
  kerfWidth: z.number().min(0.01).max(0.5),
});

export const pipeSpecSchema = z.object({
  shape: z.enum(['round', 'square', 'rectangular', 'channel']),
  od: z.number().min(1).max(10),
  height: z.number().min(1).max(10).optional(),
  flangeWidth: z.number().min(0.5).max(8).optional(),
  wallThickness: z.number().min(0.05).max(2),
  length: z.number().min(1),
  material: z.string().min(1),
});

export const cutParamsSchema = z.object({
  cutType: z.enum(['straight', 'miter', 'saddle', 'bevel', 'hole', 'slot']),
  xOffset: z.number().min(0),
  miterAngle: z.number().min(-60).max(60),
  bevelAngle: z.number().min(-45).max(45),
  bRotation: z.number().min(0).max(360),
  holeWidth: z.number().min(0.1).optional(),
  holeHeight: z.number().min(0.1).optional(),
  branchOD: z.number().min(0.5).max(10).optional(),
  feedRate: z.number().min(1).max(500),
  pierceHeight: z.number().min(0.05).max(2),
  cutHeight: z.number().min(0.01).max(1),
});

export const jobInfoSchema = z.object({
  jobNumber: z.string(),
  operator: z.string(),
  partNumber: z.string(),
  notes: z.string(),
});

export const jobStateSchema = z.object({
  machine: machineConfigSchema,
  pipe: pipeSpecSchema,
  cut: cutParamsSchema,
  job: jobInfoSchema,
});

export const savedJobSchema = z.object({
  id: z.string(),
  name: z.string(),
  savedAt: z.string(),
  state: jobStateSchema,
});

export const savedJobsArraySchema = z.array(savedJobSchema);

export interface ValidationError {
  field: string;
  message: string;
}

export function crossFieldValidate(
  model: string,
  pipeLength: number,
  xOffset: number,
  od: number,
  branchOD?: number,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const envelope = MACHINE_ENVELOPE[model as 'PD-10' | 'PD-24'];

  if (pipeLength > envelope.maxLength) {
    errors.push({
      field: 'pipe.length',
      message: `Pipe length ${pipeLength}" exceeds ${model} max of ${envelope.maxLength}"`,
    });
  }
  if (xOffset > pipeLength) {
    errors.push({
      field: 'cut.xOffset',
      message: 'Cut position cannot exceed pipe length',
    });
  }
  if (od < envelope.minOD || od > envelope.maxOD) {
    errors.push({
      field: 'pipe.od',
      message: `OD must be between ${envelope.minOD}" and ${envelope.maxOD}" for ${model}`,
    });
  }
  if (branchOD !== undefined && branchOD >= od) {
    errors.push({
      field: 'cut.branchOD',
      message: 'Branch OD must be smaller than main pipe OD',
    });
  }
  return errors;
}
