import { JobState } from '../types/job';

export function generateHeader(job: JobState): string {
  const { machine, pipe, cut, job: info } = job;
  const now = new Date().toISOString();
  return [
    `(Pipe Dream CNC - FlashCut G-Code)`,
    `(Generated: ${now})`,
    `(Job: ${info.jobNumber || 'N/A'} | Part: ${info.partNumber || 'N/A'})`,
    `(Operator: ${info.operator || 'N/A'})`,
    `(Machine: ${machine.model} | Amperage: ${machine.amperage}A | Kerf: ${machine.kerfWidth}")`,
    `(Pipe: ${pipe.shape} OD=${pipe.od}" WT=${pipe.wallThickness}" L=${pipe.length}" ${pipe.material})`,
    `(Cut Type: ${cut.cutType} | X Offset: ${cut.xOffset}" | Feed: ${cut.feedRate} IPM)`,
    info.notes ? `(Notes: ${info.notes})` : '',
    ``,
    `G17 G20 G90 G94`,
    `G0 Z${cut.pierceHeight.toFixed(4)} (Safe Z)`,
    ``,
  ]
    .filter((l) => l !== undefined)
    .join('\n');
}

export function generateFooter(): string {
  return [
    ``,
    `M5 (Plasma Off)`,
    `G0 Z0.5000 (Retract)`,
    `G0 X0.0000 B0.0000 (Home)`,
    `M30 (End of Program)`,
  ].join('\n');
}
