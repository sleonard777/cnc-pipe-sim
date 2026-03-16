import { useJobStore } from '../state/jobStore';

export function useGCode() {
  const gcode = useJobStore((s) => s.gcode);
  const generateCode = useJobStore((s) => s.generateCode);
  return { gcode, generateCode };
}
