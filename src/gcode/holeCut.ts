import { JobState } from '../types/job';
import { fmtCoord } from './utils';
import { pipeSurfaceZ } from '../utils/math';

export function generateHoleCut(job: JobState): string {
  const { cut, pipe } = job;
  const isSlot = cut.cutType === 'slot';
  const hW = (cut.holeWidth ?? pipe.od * 0.4) / 2;
  const hH = (cut.holeHeight ?? hW * 2) / 2;
  const radius = pipe.od / 2;
  const zCenter = radius;

  const label = isSlot ? 'Slot Cut' : 'Hole Cut';
  const lines: string[] = [`(--- ${label} ---)`];

  if (isSlot) {
    // Rectangular slot: pierce center, cut perimeter
    lines.push(`G0 X${fmtCoord(cut.xOffset)} B0.0000 (Position center)`);
    lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
    lines.push(`M3 (Plasma On)`);
    lines.push(`G4 P0.5`);
    lines.push(`G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate}`);

    // Rectangular perimeter using B/X moves
    lines.push(`G0 X${fmtCoord(cut.xOffset - hH)} B${fmtCoord(-hW)} (Corner 1)`);
    lines.push(`G1 X${fmtCoord(cut.xOffset + hH)} B${fmtCoord(-hW)} F${cut.feedRate} (Bottom)`);
    lines.push(`G1 X${fmtCoord(cut.xOffset + hH)} B${fmtCoord(hW)} F${cut.feedRate} (Right)`);
    lines.push(`G1 X${fmtCoord(cut.xOffset - hH)} B${fmtCoord(hW)} F${cut.feedRate} (Top)`);
    lines.push(`G1 X${fmtCoord(cut.xOffset - hH)} B${fmtCoord(-hW)} F${cut.feedRate} (Close)`);
  } else {
    // Round hole: pierce center, spiral/circular perimeter
    const steps = 72;
    lines.push(`G0 X${fmtCoord(cut.xOffset)} B0.0000`);
    lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
    lines.push(`M3 (Plasma On)`);
    lines.push(`G4 P0.5`);
    lines.push(`G1 Z${fmtCoord(cut.cutHeight)} F${cut.feedRate}`);
    lines.push(`G0 X${fmtCoord(cut.xOffset + hW)} B0.0000 (Move to edge)`);

    for (let i = 0; i <= steps; i++) {
      const angle = (2 * Math.PI * i) / steps;
      const bDeg = (360 * i) / steps;
      const xPos = cut.xOffset + hW * Math.cos(angle);
      const zPos = pipeSurfaceZ(radius, (bDeg * Math.PI) / 180, zCenter);
      lines.push(`G1 X${fmtCoord(xPos)} B${fmtCoord(bDeg)} Z${fmtCoord(zPos)} F${cut.feedRate}`);
    }
  }

  lines.push(`M5 (Plasma Off)`);
  lines.push(`G0 Z${fmtCoord(cut.pierceHeight)}`);
  return lines.join('\n');
}
