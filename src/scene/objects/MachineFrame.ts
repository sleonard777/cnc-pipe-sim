import * as THREE from 'three';

const FRAME_COLOR = 0x888888;
const mat = () => new THREE.MeshPhongMaterial({ color: FRAME_COLOR });

export function createMachineFrame(envelopeLength: number): THREE.Group {
  const group = new THREE.Group();

  const tableW = envelopeLength;
  const tableD = 8;
  const tableH = 2;

  // Main table bed
  const tableGeo = new THREE.BoxGeometry(tableW, tableH, tableD);
  const table = new THREE.Mesh(tableGeo, mat());
  table.position.set(tableW / 2, -tableH / 2, 0);
  group.add(table);

  // Left upright
  const uprightGeo = new THREE.BoxGeometry(4, 40, 4);
  const leftUpright = new THREE.Mesh(uprightGeo, mat());
  leftUpright.position.set(0, 20, 0);
  group.add(leftUpright);

  // Right upright
  const rightUpright = new THREE.Mesh(uprightGeo, mat());
  rightUpright.position.set(tableW, 20, 0);
  group.add(rightUpright);

  // Crossbeam
  const beamGeo = new THREE.BoxGeometry(tableW, 4, 4);
  const beam = new THREE.Mesh(beamGeo, mat());
  beam.position.set(tableW / 2, 42, 0);
  group.add(beam);

  return group;
}
