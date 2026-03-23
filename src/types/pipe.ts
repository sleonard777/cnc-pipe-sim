export type PipeShape = 'round' | 'square' | 'rectangular' | 'channel';

export interface PipeSpec {
  shape: PipeShape;
  od: number;           // outer diameter (round/square/rect) or web height (channel) in inches
  height?: number;      // height for rectangular only
  flangeWidth?: number; // flange width for channel only (inches)
  wallThickness: number;
  length: number;       // inches
  material: string;
}
