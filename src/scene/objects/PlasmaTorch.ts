import * as THREE from 'three';

// ── Materials ─────────────────────────────────────────────────────────────────
const carriageMat   = new THREE.MeshPhongMaterial({ color: 0x1e1e2e, shininess: 30 });
const steelMat      = new THREE.MeshPhongMaterial({ color: 0x787878, shininess: 90 });
const hyperthermMat = new THREE.MeshPhongMaterial({ color: 0xcc5500, shininess: 50 }); // Hypertherm orange
const torchGrayMat  = new THREE.MeshPhongMaterial({ color: 0x3a3a45, shininess: 60 });
const nozzleMat     = new THREE.MeshPhongMaterial({ color: 0xaa7700, shininess: 120 });
const accentMat     = new THREE.MeshPhongMaterial({ color: 0xffaa00, shininess: 80 });
const bearingMat    = new THREE.MeshPhongMaterial({ color: 0x445566, shininess: 140 });
const railMat       = new THREE.MeshPhongMaterial({ color: 0x555566, shininess: 80 });

/**
 * Torch group coordinate convention:
 *   group.position  = A-axis (height control) — set by SceneManager
 *   group origin    = torch TIP (where plasma meets pipe surface)
 *   pivot.rotation.z = B-axis bevel tilt
 *
 * All torch geometry sits ABOVE y=0 (above the cutting point).
 * This ensures torchMount.position.y = pipeGroup.y + radius + cutHeight
 * correctly places the tip at the pipe surface.
 */

export interface TorchGroup {
  group: THREE.Group;
  pivot: THREE.Group;
  plasmaLight: THREE.PointLight;
  plasmaArc: THREE.Mesh;
  glowSphere: THREE.Mesh;
  sparksMesh: THREE.InstancedMesh;
  setPlasmaOn: (on: boolean) => void;
}

/** Y offset of the breakaway collar above the torch tip — the bevel pivot point. */
export const TORCH_PIVOT_Y = 15.9;
const PIVOT_Y = TORCH_PIVOT_Y;

export function createPlasmaTorch(): TorchGroup {
  const group = new THREE.Group();  // A-axis — origin = torch TIP
  const pivot = new THREE.Group();  // bevel tilt — pivots around the breakaway collar
  pivot.position.y = PIVOT_Y;       // pivot sits AT the breakaway collar height
  group.add(pivot);

  // ─────────────────────────────────────────────────────────────────────────
  // PIVOT children — tilt with bevel angle (everything from tip up to clamp)
  // ─────────────────────────────────────────────────────────────────────────

  // All pivot children are offset by -PIVOT_Y so the torch TIP remains at
  // group y=0 (the cutting point). The pivot rotates around y=PIVOT_Y (the
  // breakaway collar) so the tip swings naturally when the bevel angle changes.

  // ── Plasma arc (gap between nozzle and workpiece) ──────────────────────
  const arcGeo = new THREE.CylinderGeometry(0.04, 0.12, 1.1, 8);
  const arcMat = new THREE.MeshStandardMaterial({
    color: 0x99ddff, emissive: 0x2299ff, emissiveIntensity: 5,
    transparent: true, opacity: 0.9,
  });
  const plasmaArc = new THREE.Mesh(arcGeo, arcMat);
  plasmaArc.position.y = 0.55 - PIVOT_Y;
  plasmaArc.visible = false;
  pivot.add(plasmaArc);

  // ── Nozzle / electrode tip ─────────────────────────────────────────────
  const nozzleGeo = new THREE.CylinderGeometry(0.12, 0.3, 1.6, 12);
  const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
  nozzle.position.y = 1.9 - PIVOT_Y;
  pivot.add(nozzle);

  // ── Shield cap ────────────────────────────────────────────────────────
  const shieldGeo = new THREE.CylinderGeometry(0.55, 0.72, 2.4, 16);
  const shield = new THREE.Mesh(shieldGeo, steelMat);
  shield.position.y = 3.9 - PIVOT_Y;
  pivot.add(shield);

  // ── Torch body — Hypertherm Powermax style (orange) ───────────────────
  const bodyGeo = new THREE.CylinderGeometry(0.72, 0.72, 8, 16);
  const body = new THREE.Mesh(bodyGeo, hyperthermMat);
  body.position.y = 9.1 - PIVOT_Y;
  body.castShadow = true;
  pivot.add(body);

  // Hypertherm logo band (gray ring near top of body)
  const bandGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.5, 16);
  const band = new THREE.Mesh(bandGeo, torchGrayMat);
  band.position.y = 12.2 - PIVOT_Y;
  pivot.add(band);

  // ── Cable lead (torch leads exit toward the side) ─────────────────────
  const cableGeo = new THREE.CylinderGeometry(0.28, 0.28, 3.5, 8);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshPhongMaterial({ color: 0x111111 }));
  cable.position.set(0.65, 10.5 - PIVOT_Y, 0);
  cable.rotation.z = 0.35;
  pivot.add(cable);

  // ── Upper connector body (gray, connects torch to breakaway) ──────────
  const upperGeo = new THREE.CylinderGeometry(0.65, 0.72, 2.2, 16);
  const upper = new THREE.Mesh(upperGeo, torchGrayMat);
  upper.position.y = 14.2 - PIVOT_Y;
  pivot.add(upper);

  // ── Torch clamp ring (holds torch body to mount arm) ──────────────────
  const clampOuter = new THREE.TorusGeometry(1.05, 0.38, 8, 24);
  const clamp = new THREE.Mesh(clampOuter, steelMat);
  clamp.rotation.x = Math.PI / 2;
  clamp.position.y = 7.5 - PIVOT_Y;
  pivot.add(clamp);

  // Clamp bolt heads (4 bolts)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const boltGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
    const bolt = new THREE.Mesh(boltGeo, steelMat);
    bolt.position.set(Math.cos(angle) * 1.05, 7.5 - PIVOT_Y, Math.sin(angle) * 1.05);
    pivot.add(bolt);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP children — fixed to A-axis, do NOT tilt with bevel
  // ─────────────────────────────────────────────────────────────────────────

  // ── Breakaway mount collar ─────────────────────────────────────────────
  // Magnetic breakaway safety disconnect — highlighted in yellow/orange
  const breakawayCylGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.8, 20);
  const breakaway = new THREE.Mesh(breakawayCylGeo, new THREE.MeshPhongMaterial({
    color: 0xffcc00, shininess: 100,
  }));
  breakaway.position.y = 15.9;
  group.add(breakaway);

  // Breakaway indicator ring
  const baRingGeo = new THREE.TorusGeometry(1.6, 0.18, 8, 24);
  const baRing = new THREE.Mesh(baRingGeo, accentMat);
  baRing.rotation.x = Math.PI / 2;
  baRing.position.y = 16.9;
  group.add(baRing);

  // Breakaway top plate
  const baPlateGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.4, 20);
  const baPlate = new THREE.Mesh(baPlateGeo, steelMat);
  baPlate.position.y = 17.0;
  group.add(baPlate);

  // ── Z-axis carriage plate ───────────────────────────────────────────────
  // This block slides on the gantry's vertical linear rails
  const carriageGeo = new THREE.BoxGeometry(5, 9, 2.8);
  const carriage = new THREE.Mesh(carriageGeo, carriageMat);
  carriage.position.set(0, 22, 0);  // y 17.5 → 26.5
  carriage.castShadow = true;
  group.add(carriage);

  // Linear bearing blocks (ride on Z-axis rails on the back of carriage)
  for (const sign of [-1.4, 1.4]) {
    const bearingGeo = new THREE.BoxGeometry(1.6, 2.5, 1.0);
    const bearing = new THREE.Mesh(bearingGeo, bearingMat);
    bearing.position.set(sign, 22, 1.7);
    group.add(bearing);
  }

  // ── Overhead 3-axis rail carriage system ───────────────────────────────────
  // Carriage sits at y≈22. Rails above it show X (forward/back), Z (left/right)
  // and Y (up/down) travel. All move with torchMount so the assembly slides
  // visually as the animation plays.

  // Vertical riser from carriage top to X-rail
  const riserGeo = new THREE.BoxGeometry(1.6, 10, 1.6);
  const riser = new THREE.Mesh(riserGeo, carriageMat);
  riser.position.y = 32;   // y 27 → 37
  group.add(riser);

  // X-axis beam — extends only toward the front of the machine (away from pipe/chuck).
  // In group-local space the chuck is at +X, so the beam runs from x=0 to x=-20 only.
  const xBeamLen = 20;
  const xBeamGeo = new THREE.BoxGeometry(xBeamLen, 2.2, 2.8);
  const xBeam = new THREE.Mesh(xBeamGeo, railMat);
  xBeam.position.set(-xBeamLen / 2, 38, 0);
  group.add(xBeam);
  // Groove on X-beam
  const xGrooveGeo = new THREE.BoxGeometry(xBeamLen, 0.4, 0.5);
  const xGroove = new THREE.Mesh(xGrooveGeo, new THREE.MeshPhongMaterial({ color: 0x888899 }));
  xGroove.position.set(-xBeamLen / 2, 39.2, 0);
  group.add(xGroove);

  // X-carriage block (rides on X-beam, represents the torch's forward position)
  const xCarGeo = new THREE.BoxGeometry(5, 3, 4.5);
  const xCar = new THREE.Mesh(xCarGeo, carriageMat);
  xCar.position.y = 40;
  xCar.castShadow = true;
  group.add(xCar);

  // X-bearing blocks
  for (const sign of [-1.5, 1.5]) {
    const xBearGeo = new THREE.BoxGeometry(1.8, 2, 1.2);
    const xBear = new THREE.Mesh(xBearGeo, bearingMat);
    xBear.position.set(sign, 40, -1.8);
    group.add(xBear);
  }

  // Z-axis beam (left / right lateral)
  const zBeamGeo = new THREE.BoxGeometry(2.8, 2.2, 32);
  const zBeam = new THREE.Mesh(zBeamGeo, railMat);
  zBeam.position.y = 44;
  group.add(zBeam);
  // Groove on Z-beam
  const zGrooveGeo = new THREE.BoxGeometry(0.5, 0.4, 32);
  const zGroove = new THREE.Mesh(zGrooveGeo, new THREE.MeshPhongMaterial({ color: 0x888899 }));
  zGroove.position.set(0, 45.2, 0);
  group.add(zGroove);

  // Z-carriage block (rides on Z-beam, represents the torch's lateral position)
  const zCarGeo = new THREE.BoxGeometry(4.5, 3, 5);
  const zCar = new THREE.Mesh(zCarGeo, carriageMat);
  zCar.position.y = 46;
  zCar.castShadow = true;
  group.add(zCar);

  // Z-bearing blocks
  for (const sign of [-1.5, 1.5]) {
    const zBearGeo = new THREE.BoxGeometry(1.2, 2, 1.8);
    const zBear = new THREE.Mesh(zBearGeo, bearingMat);
    zBear.position.set(-1.8, 46, sign);
    group.add(zBear);
  }

  // Carriage face plate (front of carriage, connects to breakaway)
  const faceGeo = new THREE.BoxGeometry(4, 3, 0.6);
  const face = new THREE.Mesh(faceGeo, steelMat);
  face.position.set(0, 18.5, -1.0);
  group.add(face);

  // THC sensor plate (torch height control — small plate with sensor)
  const thcGeo = new THREE.BoxGeometry(3, 1.2, 1.5);
  const thc = new THREE.Mesh(thcGeo, new THREE.MeshPhongMaterial({ color: 0x224422, shininess: 40 }));
  thc.position.set(0, 20, -0.8);
  group.add(thc);

  // THC label strip (green LED indicator)
  const ledGeo = new THREE.BoxGeometry(1.8, 0.3, 0.2);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x00ff44, emissive: 0x00ff44, emissiveIntensity: 1.5,
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0, 20.4, -1.5);
  group.add(led);

  // ── Glow sphere at torch tip ────────────────────────────────────────────
  const glowGeo = new THREE.SphereGeometry(0.32, 10, 10);
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xffdd44, emissiveIntensity: 8,
    transparent: true, opacity: 0.9,
  });
  const glowSphere = new THREE.Mesh(glowGeo, glowMat);
  glowSphere.position.y = -PIVOT_Y;
  glowSphere.visible = false;
  pivot.add(glowSphere);

  // ── Halo glow sphere ───────────────────────────────────────────────────
  const haloGeo = new THREE.SphereGeometry(0.8, 8, 8);
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0xff8800, emissive: 0xff4400, emissiveIntensity: 2,
    transparent: true, opacity: 0.28,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = -PIVOT_Y;
  halo.visible = false;
  pivot.add(halo);

  // ── PointLight at tip ──────────────────────────────────────────────────
  const plasmaLight = new THREE.PointLight(0xff9933, 0, 40);
  plasmaLight.position.y = -PIVOT_Y;
  pivot.add(plasmaLight);

  // ── Spark particles ────────────────────────────────────────────────────
  const SPARK_COUNT = 32;
  const sparkGeo = new THREE.SphereGeometry(0.07, 4, 4);
  const sparkMat = new THREE.MeshStandardMaterial({
    color: 0xff8800, emissive: 0xffbb00, emissiveIntensity: 3,
  });
  const sparksMesh = new THREE.InstancedMesh(sparkGeo, sparkMat, SPARK_COUNT);
  sparksMesh.visible = false;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < SPARK_COUNT; i++) {
    dummy.position.set(0, -PIVOT_Y, 0);  // all at tip initially
    dummy.updateMatrix();
    sparksMesh.setMatrixAt(i, dummy.matrix);
  }
  sparksMesh.instanceMatrix.needsUpdate = true;
  pivot.add(sparksMesh);

  const setPlasmaOn = (on: boolean) => {
    plasmaArc.visible = on;
    glowSphere.visible = on;
    halo.visible = on;
    sparksMesh.visible = on;
    plasmaLight.intensity = on ? 4 : 0;
  };

  return { group, pivot, plasmaLight, plasmaArc, glowSphere, sparksMesh, setPlasmaOn };
}
