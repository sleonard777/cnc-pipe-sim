export interface GCodeLine {
  code: string;
  comment?: string;
}

export interface GCodeBlock {
  label: string;
  lines: GCodeLine[];
}
