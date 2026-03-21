import * as THREE from 'three';
import { createChuckStation } from './ChuckStation';

const carriageMat = new THREE.MeshPhongMaterial({ color: 0x1e2a1e, shininess: 20 });
const motorMat    = new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 15 });
const accentMat   = new THREE.MeshPhongMaterial({ color: 0x2a5a2a, shininess: 60 });

/**
 * Drive chuck group: 4-jaw chuck + motor housing + carriage sled.
 * Positioned with its chuck face at local X = 0, extending in +X (toward pipe input).
 * Caller should set group.position.x = pipe input end X.
 */
export function createDriveChuck(od: number): THREE.Group {
  const group = new THREE.Group();

  // ── Chuck head (same square-opening as support chucks) ───────────────────
  const chuck = createChuckStation(od, true);
  group.add(chuck);

  // ── Rotation spindle ring (shows pipe rotates through here) ──────────────
  const spindleR = od * 1.3;
  const tickCount = 24;
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2;
    const tickGeo = new THREE.BoxGeometry(od * 0.35, 0.4, 0.4);
    const tick = new THREE.Mesh(tickGeo, i % 4 === 0 ? accentMat : carriageMat);
    tick.position.set(0, spindleR * Math.cos(angle), spindleR * Math.sin(angle));
    group.add(tick);
  }

  // ── Motor housing ─────────────────────────────────────────────────────────
  const motorGeo = new THREE.BoxGeometry(od * 2.5, od * 2, od * 2);
  const motor = new THREE.Mesh(motorGeo, motorMat);
  motor.position.x = od * 1.5;
  motor.castShadow = true;
  group.add(motor);

  // Motor coupling / shaft
  const shaftGeo = new THREE.CylinderGeometry(od * 0.3, od * 0.3, od * 0.6, 12);
  const shaft = new THREE.Mesh(shaftGeo, accentMat);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = od * 0.3;
  group.add(shaft);

  // ── Carriage sled (rides on the linear rails) ─────────────────────────────
  const sledD = 14;
  const sledH = 3.5;
  const sledGeo = new THREE.BoxGeometry(od * 4, sledH, sledD);
  const sled = new THREE.Mesh(sledGeo, carriageMat);
  sled.position.set(od * 1, -od - sledH / 2, 0);
  group.add(sled);

  // Sled rail guides
  for (const sign of [-1, 1]) {
    const guideGeo = new THREE.BoxGeometry(od * 4 + 1, 1.5, 2);
    const guide = new THREE.Mesh(guideGeo, accentMat);
    guide.position.set(od, -od - sledH - 0.5, sign * (sledD / 2 - 1));
    group.add(guide);
  }

  return group;
}
