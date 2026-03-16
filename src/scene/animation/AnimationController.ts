import { PathPoint } from '../cutPath/pathMath';
import { lerp, lerpAngle } from '../../utils/math';

export interface AnimState {
  pointIndex: number;
  done: boolean;
  x: number;
  b: number;
  a: number;
  z: number;
  plasma: boolean;
}

export class AnimationController {
  private points: PathPoint[] = [];
  private currentSegment = 0;
  private segmentT = 0;
  private done = false;
  private feedRate = 40; // inches/min → will be set from job
  private speedMultiplier = 1;

  load(points: PathPoint[], feedRate: number): void {
    this.points = points;
    this.feedRate = feedRate;
    this.currentSegment = 0;
    this.segmentT = 0;
    this.done = false;
  }

  setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  reset(): void {
    this.currentSegment = 0;
    this.segmentT = 0;
    this.done = false;
  }

  isDone(): boolean {
    return this.done;
  }

  /** deltaSeconds = elapsed real time since last frame */
  tick(deltaSeconds: number): AnimState | null {
    if (this.points.length < 2 || this.done) return null;

    const seg = this.currentSegment;
    const from = this.points[seg];
    const to = this.points[seg + 1];
    if (!from || !to) {
      this.done = true;
      return null;
    }

    // Compute segment distance in machine units (inches)
    const dx = to.x - from.x;
    const db = ((to.b - from.b + 540) % 360) - 180;
    const dist = Math.sqrt(dx * dx + (db * 0.01) * (db * 0.01)) || 0.001;

    // inches/min → inches/sec
    const ipsec = (this.feedRate * this.speedMultiplier) / 60;
    const tStep = (deltaSeconds * ipsec) / dist;

    this.segmentT += tStep;

    if (this.segmentT >= 1) {
      this.segmentT = 0;
      this.currentSegment++;
      if (this.currentSegment >= this.points.length - 1) {
        this.done = true;
        const last = this.points[this.points.length - 1];
        return {
          pointIndex: this.points.length - 1,
          done: true,
          x: last.x,
          b: last.b,
          a: last.a,
          z: last.z,
          plasma: last.plasma,
        };
      }
    }

    const t = Math.min(this.segmentT, 1);
    return {
      pointIndex: this.currentSegment,
      done: false,
      x: lerp(from.x, to.x, t),
      b: lerpAngle(from.b, to.b, t),
      a: lerp(from.a, to.a, t),
      z: lerp(from.z, to.z, t),
      plasma: to.plasma,
    };
  }
}
