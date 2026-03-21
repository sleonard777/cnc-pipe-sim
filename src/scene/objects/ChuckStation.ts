import * as THREE from 'three';

const houseMat  = new THREE.MeshPhongMaterial({ color: 0x3a3a3a, shininess: 25 });
const jawMat    = new THREE.MeshPhongMaterial({ color: 0x6a6a6a, shininess: 50 });
const accentMat = new THREE.MeshPhongMaterial({ color: 0x1a4a1a, shininess: 80 });

/**
 * Square-opening 4-jaw chuck station.
 * Pipe passes through the center hole along local X-axis.
 * Chuck face is in the YZ plane.
 *
 * @param od pipe outer diameter (inches)
 * @param clamped whether jaws appear clamped (close to pipe) or open
 */
export function createChuckStation(od: number, clamped = true): THREE.Group {
  const group = new THREE.Group();

  const holeHalf   = (od * 0.55) + 0.25;  // square hole half-width (slightly bigger than pipe)
  const plateHalf  = od * 1.8;             // outer plate half-dimension
  const wallThick  = plateHalf - holeHalf; // frame wall thickness
  const plateDepth = od * 1.0;             // thickness along pipe axis (X)

  // ── 4 frame bars forming the square opening ────────────────────────────────
  const addBar = (sx: number, sy: number, sz: number, px: number, py: number, pz: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), houseMat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    group.add(m);
  };

  const fullZ = holeHalf * 2 + wallThick * 2;
  const halfPD = plateDepth / 2;

  addBar(plateDepth, wallThick, fullZ,    0,  holeHalf + wallThick / 2, 0);  // top
  addBar(plateDepth, wallThick, fullZ,    0, -(holeHalf + wallThick / 2), 0); // bottom
  addBar(plateDepth, holeHalf * 2, wallThick, 0, 0,  holeHalf + wallThick / 2); // front
  addBar(plateDepth, holeHalf * 2, wallThick, 0, 0, -(holeHalf + wallThick / 2)); // back

  // ── Bolt holes / accent ring (purely visual) ──────────────────────────────
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const r = plateHalf * 0.72;
    const boltGeo = new THREE.CylinderGeometry(0.35, 0.35, plateDepth + 0.1, 8);
    const bolt = new THREE.Mesh(boltGeo, accentMat);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(0, r * Math.sin(angle), r * Math.cos(angle));
    group.add(bolt);
  }

  // ── 4 jaws pointing inward ────────────────────────────────────────────────
  // Jaw length is limited so tips sit at the pipe OD surface, not inside it.
  const pipeRadius = od / 2;
  const maxJawLen  = Math.max(0.1, holeHalf - pipeRadius - (clamped ? 0.05 : holeHalf * 0.2));
  const jawLen   = Math.min(holeHalf * 0.55, maxJawLen);
  const jawWidth = holeHalf * 0.65;
  const jawDepth = plateDepth * 0.65;
  const jawGap   = holeHalf - jawLen - pipeRadius; // gap so tip aligns with pipe surface

  const addJaw = (py: number, pz: number, _ry: number, _rz: number) => {
    const geo = new THREE.BoxGeometry(jawDepth, jawLen, jawWidth);
    const m = new THREE.Mesh(geo, jawMat);
    // chamfer the tip visually by rotating slightly
    m.position.set(halfPD * 0.1, py, pz);
    group.add(m);
  };

  const jawInset = holeHalf - jawLen / 2 - jawGap;
  addJaw( jawInset,  0,           0, 0);  // top jaw
  addJaw(-jawInset,  0,           0, 0);  // bottom jaw
  addJaw( 0,         jawInset,    0, 0);  // front jaw
  addJaw( 0,        -jawInset,    0, 0);  // back jaw

  // ── Thin face plate ring ──────────────────────────────────────────────────
  const ringGeo = new THREE.TorusGeometry(plateHalf * 0.85, 0.5, 8, 32);
  const ring = new THREE.Mesh(ringGeo, accentMat);
  ring.rotation.y = Math.PI / 2;
  ring.position.x = -halfPD;
  group.add(ring);

  return group;
}

