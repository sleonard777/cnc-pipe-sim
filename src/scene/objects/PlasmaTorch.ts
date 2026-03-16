import * as THREE from 'three';

export interface TorchGroup {
  group: THREE.Group;
  arc: THREE.Mesh;
  setPlasmaOn: (on: boolean) => void;
}

export function createPlasmaTorch(): TorchGroup {
  const group = new THREE.Group();

  // Torch body
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.3, 4, 12);
  const body = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshPhongMaterial({ color: 0x333333 })
  );
  body.position.y = 2;
  group.add(body);

  // Nozzle
  const nozzleGeo = new THREE.CylinderGeometry(0.15, 0.08, 1.2, 8);
  const nozzle = new THREE.Mesh(
    nozzleGeo,
    new THREE.MeshPhongMaterial({ color: 0xcc6600 })
  );
  nozzle.position.y = -0.6;
  group.add(nozzle);

  // Plasma arc (hidden by default)
  const arcGeo = new THREE.CylinderGeometry(0.04, 0.12, 1.5, 8);
  const arcMat = new THREE.MeshPhongMaterial({
    color: 0x00aaff,
    emissive: 0x0055ff,
    transparent: true,
    opacity: 0.85,
  });
  const arc = new THREE.Mesh(arcGeo, arcMat);
  arc.position.y = -1.8;
  arc.visible = false;
  group.add(arc);

  const setPlasmaOn = (on: boolean) => {
    arc.visible = on;
  };

  return { group, arc, setPlasmaOn };
}
