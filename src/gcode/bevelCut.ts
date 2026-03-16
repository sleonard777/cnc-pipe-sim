import { JobState } from '../types/job';
import { fmtCoord } from './utils';

export function generateBevelCut(job: JobState): string {
  const { cut } = job;
  const steps = 36;
  const lines: string[] = [
    `(--- Bevel Cut ---)`,
    `G0 X${fmtCoord(cut.xOffset)} B0.0000 A0.0000 (Position)`,
    `G0 Z${fmtCoord(cut.pierceHeight)}`,
    `M3 (Plasma On)`,
    `G4 P0.5`,
    `G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate}`,
    `G1 A${fmtCoord(cut.bevelAngle)} F${cut.feedRate} (Set bevel angle)`,
  ];

  for (let i = 0; i <= steps; i++) {
    const b = (360 * i) / steps;
    lines.push(`G1 B${fmtCoord(b)} F${cut.feedRate}`);
  }

  lines.push(`M5 (Plasma Off)`);
  lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
  lines.push(`G1 A0.0000 F${cut.feedRate} (Reset bevel)`);
  return lines.join('\n');
}
