import * as THREE from 'three';

const wallMat   = new THREE.MeshPhongMaterial({ color: 0x2e3a2e, shininess: 25 });
const rollerMat = new THREE.MeshPhongMaterial({ color: 0x999999, shininess: 120 });
const axleMat   = new THREE.MeshPhongMaterial({ color: 0x445566, shininess: 80 });
const accentMat = new THREE.MeshPhongMaterial({ color: 0x3a5a3a, shininess: 60 });

/**
 * Vertical pipe-support steady-rest wall.
 * Centred on the pipe axis (caller sets group.position to pipe centre).
 * The square opening is sized to the current pipe OD + clearance.
 * A single roller sits on each vertical side (±Z) of the opening,
 * allowing the pipe to rotate (B-axis) and slide (X-axis) freely.
 *
 * @param od        Pipe outer diameter (inches)
 * @param bedDepth  Distance from pipe centre DOWN to the table surface (inches).
 *                  The bottom bar is extended to touch the bed.
 */
export function createPipeSupportWall(od: number, bedDepth = 0): THREE.Group {
  const group = new THREE.Group();

  const clearance = 0.35;              // radial air gap between pipe surface and opening
  const holeHalf  = od / 2 + clearance; // half-side of square opening
  const wallSpan  = Math.max(od * 2.8, holeHalf * 2 + 6); // total plate height/width
  const halfSpan  = wallSpan / 2;
  const depth     = 3.5;               // wall thickness along pipe axis

  // ── Wall plate: 4 bars forming the square opening ─────────────────────────
  const addBar = (sx: number, sy: number, sz: number, px: number, py: number, pz: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), wallMat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    group.add(m);
  };

  const topH  = halfSpan - holeHalf;   // height of top/bottom bars
  const sideW = halfSpan - holeHalf;   // width of side bars

  // Top bar
  addBar(depth, topH, wallSpan, 0,  holeHalf + topH / 2, 0);
  // Bottom bar — extended to reach the table bed surface
  const botH = Math.max(topH, bedDepth - holeHalf);
  addBar(depth, botH, wallSpan, 0, -(holeHalf + botH / 2), 0);
  // Left side bar  (+Z side)
  addBar(depth, holeHalf * 2, sideW, 0, 0,  holeHalf + sideW / 2);
  // Right side bar (−Z side)
  addBar(depth, holeHalf * 2, sideW, 0, 0, -(holeHalf + sideW / 2));

  // ── Accent border around the opening ──────────────────────────────────────
  const bT  = 0.55;
  const bLen = holeHalf * 2 + bT * 2;
  const addBorder = (sy: number, sz: number, py: number, pz: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(depth + 0.3, sy, sz), accentMat);
    m.position.set(0, py, pz);
    group.add(m);
  };
  addBorder(bT, bLen,  holeHalf + bT / 2, 0);    // top edge
  addBorder(bT, bLen, -(holeHalf + bT / 2), 0);   // bottom edge
  addBorder(holeHalf * 2, bT, 0,  holeHalf + bT / 2);   // +Z edge
  addBorder(holeHalf * 2, bT, 0, -(holeHalf + bT / 2));  // −Z edge

  // ── Rollers on the vertical sides (±Z) ────────────────────────────────────
  // Each roller stands vertically (axis along world-Y) so it contacts the pipe
  // on its side and allows the pipe to slide along X freely.
  const rollerR   = Math.max(0.6, od * 0.10);  // roller radius
  const rollerLen = holeHalf * 1.6;             // roller height (spans most of opening height)

  for (const sign of [-1, 1] as const) {
    const rollerZ = sign * holeHalf;  // flush with inner edge of opening

    // Roller body — default CylinderGeometry axis is Y (vertical) — no rotation needed
    const rollerGeo = new THREE.CylinderGeometry(rollerR, rollerR, rollerLen, 20);
    const roller = new THREE.Mesh(rollerGeo, rollerMat);
    roller.position.set(0, 0, rollerZ);
    group.add(roller);

    // Face rings at top and bottom of roller
    for (const fy of [-rollerLen / 2, rollerLen / 2]) {
      const faceGeo = new THREE.CylinderGeometry(rollerR + 0.12, rollerR + 0.12, 0.25, 20);
      const face = new THREE.Mesh(faceGeo, axleMat);
      face.position.set(0, fy, rollerZ);
      group.add(face);
    }

    // Axle stubs protruding up and down from the roller into the wall
    const axleR = rollerR * 0.28;
    for (const ay of [-1, 1]) {
      const axleGeo = new THREE.CylinderGeometry(axleR, axleR, depth * 0.55, 10);
      const axle = new THREE.Mesh(axleGeo, axleMat);
      axle.position.set(0, ay * (rollerLen / 2 + depth * 0.25), rollerZ);
      group.add(axle);
    }
  }

  return group;
}
