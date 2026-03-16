import * as THREE from 'three';

const CHUCK_COLOR = 0x555555;
const mat = () => new THREE.MeshPhongMaterial({ color: CHUCK_COLOR });

export function createChuckGroup(od: number): THREE.Group {
  const group = new THREE.Group();
  const jawSize = Math.max(od * 0.4, 1.5);

  // 4 jaws at 90° intervals
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const jawGeo = new THREE.BoxGeometry(jawSize, jawSize * 0.6, jawSize * 0.5);
    const jaw = new THREE.Mesh(jawGeo, mat());
    const r = od / 2 + jawSize * 0.3;
    jaw.position.set(0, r * Math.sin(angle), r * Math.cos(angle));
    jaw.lookAt(0, 0, 0);
    group.add(jaw);
  }

  // Chuck body ring
  const ringGeo = new THREE.TorusGeometry(od / 2 + jawSize * 0.6, jawSize * 0.25, 8, 32);
  const ring = new THREE.Mesh(ringGeo, mat());
  ring.rotation.y = Math.PI / 2;
  group.add(ring);

  // Roller chuck (secondary support)
  const rollerGroup = new THREE.Group();
  rollerGroup.position.x = 10; // offset along pipe

  const rollerRingGeo = new THREE.TorusGeometry(od / 2 + 1, 0.75, 8, 32);
  const rollerRing = new THREE.Mesh(rollerRingGeo, mat());
  rollerRing.rotation.y = Math.PI / 2;
  rollerGroup.add(rollerRing);

  group.add(rollerGroup);

  return group;
}
