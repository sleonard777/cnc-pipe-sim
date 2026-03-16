import * as THREE from 'three';

export function createAxisTriad(): THREE.Group {
  const group = new THREE.Group();
  const len = 5;

  const axes = [
    { dir: new THREE.Vector3(1, 0, 0), color: 0xff3333, label: 'X' },
    { dir: new THREE.Vector3(0, 1, 0), color: 0x33ff33, label: 'Y' },
    { dir: new THREE.Vector3(0, 0, 1), color: 0x3333ff, label: 'Z' },
  ];

  for (const { dir, color } of axes) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      dir.clone().multiplyScalar(len),
    ]);
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color })
    );
    group.add(line);

    // Arrow head
    const coneGeo = new THREE.ConeGeometry(0.3, 1, 8);
    const cone = new THREE.Mesh(
      coneGeo,
      new THREE.MeshPhongMaterial({ color })
    );
    cone.position.copy(dir.clone().multiplyScalar(len + 0.5));

    if (dir.x === 1) cone.rotation.z = -Math.PI / 2;
    else if (dir.z === 1) cone.rotation.x = Math.PI / 2;

    group.add(cone);
  }

  return group;
}
