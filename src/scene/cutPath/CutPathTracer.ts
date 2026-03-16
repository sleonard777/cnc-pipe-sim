import * as THREE from 'three';
import { PathPoint } from './pathMath';

export class CutPathTracer {
  private geometry: THREE.BufferGeometry;
  private line: THREE.Line;
  private positions: Float32Array;
  private drawCount = 0;
  private totalPoints = 0;

  constructor(maxPoints = 2000) {
    this.positions = new Float32Array(maxPoints * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
      color: 0xff4400,
      linewidth: 2,
      depthTest: false,
    });
    this.line = new THREE.Line(this.geometry, material);
    this.line.renderOrder = 1;
  }

  getMesh(): THREE.Line {
    return this.line;
  }

  /**
   * Initialize path from points array (world-space XYZ on pipe surface).
   * X → along pipe axis, Y → up (Z from gcode mapped to world Y), B → rotation around pipe axis.
   */
  initPath(points: PathPoint[], pipeRadius: number): void {
    this.drawCount = 0;
    this.totalPoints = Math.min(points.length, this.positions.length / 3);

    for (let i = 0; i < this.totalPoints; i++) {
      const p = points[i];
      const bRad = (p.b * Math.PI) / 180;
      // World space: pipe axis = X, pipe surface height = Y*cos(b) + Z*sin(b)
      const wx = p.x;
      const wy = (pipeRadius + p.z) * Math.cos(bRad);
      const wz = (pipeRadius + p.z) * Math.sin(bRad);
      this.positions[i * 3] = wx;
      this.positions[i * 3 + 1] = wy;
      this.positions[i * 3 + 2] = wz;
    }

    this.geometry.attributes['position'].needsUpdate = true;
    this.geometry.setDrawRange(0, 0);
  }

  /** Advance draw range by one point — call each animation tick */
  advance(pointIndex: number): void {
    this.drawCount = Math.min(pointIndex + 1, this.totalPoints);
    this.geometry.setDrawRange(0, this.drawCount);
  }

  reset(): void {
    this.drawCount = 0;
    this.geometry.setDrawRange(0, 0);
  }

  dispose(): void {
    this.geometry.dispose();
    (this.line.material as THREE.Material).dispose();
  }
}
