import * as THREE from 'three';
import { PipeSpec } from '../../types/pipe';

export function createPipeObject(pipe: PipeSpec): THREE.Group {
  const group = new THREE.Group();

  const pipeMat = new THREE.MeshPhongMaterial({
    color: 0x4a9eff,
    transparent: true,
    opacity: 0.85,
    shininess: 80,
  });

  let geometry: THREE.BufferGeometry;

  if (pipe.shape === 'round') {
    geometry = new THREE.CylinderGeometry(
      pipe.od / 2,
      pipe.od / 2,
      pipe.length,
      64,
      1,
      false
    );
  } else if (pipe.shape === 'square') {
    geometry = new THREE.BoxGeometry(pipe.length, pipe.od, pipe.od);
  } else {
    const h = pipe.height ?? pipe.od;
    geometry = new THREE.BoxGeometry(pipe.length, h, pipe.od);
  }

  const mesh = new THREE.Mesh(geometry, pipeMat);

  // Orient pipe along X axis
  if (pipe.shape === 'round') {
    mesh.rotation.z = Math.PI / 2;
  }
  mesh.position.set(pipe.length / 2, 0, 0);

  // Wireframe overlay
  const edgesGeo = new THREE.EdgesGeometry(geometry);
  const wireframe = new THREE.LineSegments(
    edgesGeo,
    new THREE.LineBasicMaterial({ color: 0x2266cc, transparent: true, opacity: 0.4 })
  );
  wireframe.rotation.copy(mesh.rotation);
  wireframe.position.copy(mesh.position);

  group.add(mesh);
  group.add(wireframe);

  return group;
}
