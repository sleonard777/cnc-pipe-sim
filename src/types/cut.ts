export type CutType = 'straight' | 'miter' | 'saddle' | 'bevel' | 'hole' | 'slot';

export interface CutParams {
  cutType: CutType;
  xOffset: number;      // cut position along pipe axis (inches from chuck)
  miterAngle: number;   // degrees, 0 = perpendicular
  bevelAngle: number;   // degrees A-axis tilt
  bRotation: number;    // degrees B-axis starting rotation
  holeWidth?: number;   // hole/slot width
  holeHeight?: number;  // slot height
  branchOD?: number;    // saddle branch pipe OD
  feedRate: number;     // inches/min
  pierceHeight: number; // Z height for pierce (inches)
  cutHeight: number;    // Z height for cutting (inches)
}
