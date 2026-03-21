import { PathPoint } from '../cutPath/pathMath';
import { lerp, lerpAngle } from '../../utils/math';

export interface AnimState {
  pointIndex: number;
  done: boolean;
  x: number; b: number; a: number; z: number;
  tz: number;     // torch lateral world-Z (0 for all rotary cuts)
  plasma: boolean;
}

export class AnimationController {
  private points: PathPoint[] = [];
  private segLengths: number[] = [];   // arc-length of each segment (inches)
  private currentSegment = 0;
  private segmentT = 0;   // 0-1 progress within currentSegment
  private done = false;
  private speedMultiplier: number = 1;
  private feedOverride: number = 1.0;
  private feedRateIPM: number = 40;   // inches per minute from job

  load(points: PathPoint[], feedRate: number, pipeRadius = 2): void {
    this.feedRateIPM = feedRate;
    this.points = points;
    this.segLengths = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      const dx  = Math.abs(b.x  - a.x);
      const dtz = Math.abs(b.tz - a.tz);
      const dArc = (Math.abs(b.b - a.b) / 360) * 2 * Math.PI * pipeRadius;
      // Use the largest axis motion as segment "length" (axes move simultaneously)
      const len = Math.max(dx, dtz, dArc, 0.001);
      this.segLengths.push(len);
    }
    this.currentSegment = 0;
    this.segmentT = 0;
    this.done = false;
  }

  setSpeed(multiplier: number): void { this.speedMultiplier = multiplier; }
  setFeedOverride(v: number): void { this.feedOverride = v; }

  reset(): void {
    this.currentSegment = 0;
    this.segmentT = 0;
    this.done = false;
  }

  isDone(): boolean { return this.done; }

  tick(deltaSeconds: number): AnimState | null {
    if (this.points.length < 2 || this.done) return null;

    const speed = (this.feedRateIPM / 60) * this.speedMultiplier * this.feedOverride;
    // Convert delta time to remaining inches to travel this frame
    let remainingInches = deltaSeconds * speed;

    while (remainingInches > 0) {
      const segLen = this.segLengths[this.currentSegment] ?? 0.001;
      const inchesLeft = segLen * (1 - this.segmentT);
      if (remainingInches < inchesLeft) {
        this.segmentT += remainingInches / segLen;
        break;
      }
      remainingInches -= inchesLeft;
      this.segmentT = 0;
      this.currentSegment++;
      if (this.currentSegment >= this.points.length - 1) {
        this.done = true;
        const last = this.points[this.points.length - 1];
        return { pointIndex: this.points.length - 1, done: true, x: last.x, b: last.b, a: last.a, z: last.z, tz: last.tz, plasma: last.plasma };
      }
    }

    const from = this.points[this.currentSegment];
    const to = this.points[this.currentSegment + 1];
    if (!from || !to) return null;

    const t = Math.min(this.segmentT, 1);
    return {
      pointIndex: this.currentSegment,
      done: false,
      x:  lerp(from.x,  to.x,  t),
      b:  lerpAngle(from.b, to.b, t),
      a:  lerp(from.a,  to.a,  t),
      z:  lerp(from.z,  to.z,  t),
      tz: lerp(from.tz, to.tz, t),
      plasma: to.plasma,
    };
  }
}
