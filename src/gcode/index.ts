import { JobState } from '../types/job';
import { generateHeader, generateFooter } from './header';
import { generateStraightCut } from './straightCut';
import { generateMiterCut } from './miterCut';
import { generateSaddleCut } from './saddleCut';
import { generateBevelCut } from './bevelCut';
import { generateHoleCut } from './holeCut';

export function generateGCode(job: JobState): string {
  const { cut } = job;
  let body: string;

  switch (cut.cutType) {
    case 'straight':
      body = generateStraightCut(job);
      break;
    case 'miter':
      body = generateMiterCut(job);
      break;
    case 'saddle':
      body = generateSaddleCut(job);
      break;
    case 'bevel':
      body = generateBevelCut(job);
      break;
    case 'hole':
    case 'slot':
      body = generateHoleCut(job);
      break;
    default:
      body = `(Unknown cut type: ${cut.cutType})`;
  }

  return [generateHeader(job), body, generateFooter()].join('\n');
}
