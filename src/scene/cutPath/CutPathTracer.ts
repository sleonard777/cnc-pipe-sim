import * as THREE from 'three';
import { PathPoint } from './pathMath';
import { toRad } from '../../utils/math';

const RADIAL_SEGS = 8;

/**
 * Renders the cut seam as a progressive TubeGeometry on the pipe surface.
 * Operates in pipeGroup local space (pipeGroup handles translation + rotation).
 *
 * Coordinate convention matches pathMath:
 *   localY =  (radius + z) * cos(b_rad)
 *   localZ = -(radius + z) * sin(b_rad)
 */
export class CutPathTracer {
  private tubeMesh: THREE.Mesh;
  private tubeGeo: THREE.TubeGeometry | null = null;
  private tubeSegs = 0;
  private totalTubeIndices = 0;
  private plasmaPointCount = 0;
  /** Maps overall pathIndex → cumulative plasma-point count (for advance()) */
  private indexToPlasmaCount: number[] = [];

  constructor() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: 0x441100,
      emissiveIntensity: 0.6,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    this.tubeMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    this.tubeMesh.renderOrder = 1;
  }

  getMesh(): THREE.Mesh { return this.tubeMesh; }

  /**
   * Build the full tube geometry from plasma-on path points.
   * @param points       Full path from pathMath (includes rapids and plasma moves)
   * @param radius       Pipe outer radius / od/2 (inches)
   * @param kerfRadius   Visual tube radius (inches) — scaled up for visibility
   * @param pipeShape    'round' | 'square' | 'rectangular' — selects seam formula
   * @param pipeHalfH    Half-height for rectangular pipe (default = radius for square)
   */
  initPath(points: PathPoint[], radius: number, kerfRadius = 0.12,
           pipeShape?: string, pipeHalfH?: number): void {
    // Dispose old geometry
    if (this.tubeGeo) {
      this.tubeGeo.dispose();
      this.tubeGeo = null;
    }

    // Build plasma-only point list + index mapping
    const vec3s: THREE.Vector3[] = [];
    this.indexToPlasmaCount = new Array(points.length).fill(0);
    let plasmaCount = 0;

    const isSquare = pipeShape === 'square' || pipeShape === 'rectangular' || pipeShape === 'channel';
    const halfH = pipeHalfH ?? radius;   // half-height for square/rect/channel (halfW = radius)

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.plasma) {
        const bRad = toRad(p.b);
        const r = radius + p.z;

        let localY: number;
        let localZ: number;

        if (p.tz !== 0) {
          // Flat-face lateral cut (square/rect pipe hole/slot): B=const, torch moves in tz
          localY = radius;
          localZ = p.tz;   // positive tz → positive localZ (world-Z = pipeGroup-local-Z when B=0)
        } else if (isSquare) {
          // Square/rectangular pipe rotary cut: seam traces rectangle perimeter
          const cosB = Math.cos(bRad);
          const sinB = Math.sin(bRad);
          const norm = Math.max(Math.abs(cosB) / halfH, Math.abs(sinB) / radius);
          localY = norm > 0 ? cosB / norm : r * Math.cos(bRad);
          localZ = norm > 0 ? -sinB / norm : -r * Math.sin(bRad);
        } else {
          // Round pipe rotary cut
          localY =  r * Math.cos(bRad);
          localZ = -r * Math.sin(bRad);
        }

        vec3s.push(new THREE.Vector3(p.x, localY, localZ));
        plasmaCount++;
      }
      this.indexToPlasmaCount[i] = plasmaCount;
    }

    this.plasmaPointCount = plasmaCount;

    if (vec3s.length < 2) {
      this.tubeMesh.geometry = new THREE.BufferGeometry();
      return;
    }

    // Deduplicate very close consecutive points to avoid CatmullRom issues
    const filtered: THREE.Vector3[] = [vec3s[0]];
    for (let i = 1; i < vec3s.length; i++) {
      if (vec3s[i].distanceTo(filtered[filtered.length - 1]) > 0.005) {
        filtered.push(vec3s[i]);
      }
    }
    if (filtered.length < 2) {
      this.tubeMesh.geometry = new THREE.BufferGeometry();
      return;
    }

    const curve = new THREE.CatmullRomCurve3(filtered, false, 'catmullrom', 0.3);
    this.tubeSegs = Math.min(filtered.length * 4, 1440);
    this.tubeGeo = new THREE.TubeGeometry(curve, this.tubeSegs, kerfRadius, RADIAL_SEGS, false);
    this.totalTubeIndices = this.tubeSegs * RADIAL_SEGS * 6;
    this.tubeGeo.setDrawRange(0, 0);
    this.tubeMesh.geometry = this.tubeGeo;
  }

  /** Reveal cut seam up to overall path pointIndex */
  advance(pointIndex: number): void {
    if (!this.tubeGeo || this.plasmaPointCount === 0) return;
    const plasmaReached = this.indexToPlasmaCount[Math.min(pointIndex, this.indexToPlasmaCount.length - 1)];
    const progress = plasmaReached / this.plasmaPointCount;
    const count = Math.floor(progress * this.totalTubeIndices);
    this.tubeGeo.setDrawRange(0, count);
  }

  reset(): void {
    this.tubeGeo?.setDrawRange(0, 0);
  }

  dispose(): void {
    this.tubeGeo?.dispose();
    (this.tubeMesh.material as THREE.Material).dispose();
  }
}
