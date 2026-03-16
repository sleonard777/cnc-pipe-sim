export type PipeShape = 'round' | 'square' | 'rectangular';

export interface PipeSpec {
  shape: PipeShape;
  od: number;          // outer diameter (round) or width (square/rect) in inches
  height?: number;     // height for rectangular only
  wallThickness: number;
  length: number;      // inches
  material: string;
}
