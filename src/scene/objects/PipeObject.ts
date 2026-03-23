import * as THREE from 'three';
import { PipeSpec } from '../../types/pipe';

const pipeMat = new THREE.MeshPhongMaterial({
  color: 0x4a9eff,
  transparent: true,
  opacity: 0.82,
  shininess: 80,
  side: THREE.FrontSide,
});

const innerMat = new THREE.MeshPhongMaterial({
  color: 0x1a3a6a,
  transparent: true,
  opacity: 0.7,
  shininess: 20,
  side: THREE.BackSide,  // inside of bore
});

const wireMat = new THREE.LineBasicMaterial({
  color: 0x2266cc,
  transparent: true,
  opacity: 0.35,
});

export function createPipeObject(pipe: PipeSpec): THREE.Group {
  const group = new THREE.Group();
  const halfLen = pipe.length / 2;

  if (pipe.shape === 'round') {
    const od = pipe.od / 2;
    const wt = Math.min(pipe.wallThickness, od * 0.9);
    const id = od - wt;

    // Outer tube shell
    const outerGeo = new THREE.CylinderGeometry(od, od, pipe.length, 64, 1, true);
    const outer = new THREE.Mesh(outerGeo, pipeMat);
    outer.rotation.z = Math.PI / 2;
    outer.position.x = halfLen;
    group.add(outer);

    // Inner bore (visible at ends and through the transparent outer)
    if (id > 0.05) {
      const innerGeo = new THREE.CylinderGeometry(id, id, pipe.length, 64, 1, true);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.rotation.z = Math.PI / 2;
      inner.position.x = halfLen;
      group.add(inner);

      // End caps (annular rings showing wall thickness)
      for (const sign of [-1, 1]) {
        const ringShape = new THREE.Shape();
        ringShape.absarc(0, 0, od, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(0, 0, id, 0, Math.PI * 2, true);
        ringShape.holes.push(hole);
        const capGeo = new THREE.ShapeGeometry(ringShape, 32);
        const cap = new THREE.Mesh(capGeo, pipeMat);
        cap.rotation.y = sign === -1 ? Math.PI / 2 : -Math.PI / 2;
        cap.position.x = sign === -1 ? 0 : pipe.length;
        group.add(cap);
      }
    }

    // Wireframe on outer surface
    const edgesGeo = new THREE.EdgesGeometry(
      new THREE.CylinderGeometry(od, od, pipe.length, 32, 1, false)
    );
    const wire = new THREE.LineSegments(edgesGeo, wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.x = halfLen;
    group.add(wire);

  } else if (pipe.shape === 'square') {
    // HSS square tube — show outer shell with hollow interior
    const od = pipe.od;
    const wt = Math.min(pipe.wallThickness, od * 0.45);
    const id = od - 2 * wt;

    const outerGeo = new THREE.BoxGeometry(pipe.length, od, od);
    const outer = new THREE.Mesh(outerGeo, pipeMat);
    outer.position.x = halfLen;
    group.add(outer);

    // Inner cutout (slightly smaller box, back-side material)
    if (id > 0.1) {
      const innerGeo = new THREE.BoxGeometry(pipe.length + 0.1, id, id);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.x = halfLen;
      group.add(inner);
    }

    const edgesGeo = new THREE.EdgesGeometry(outerGeo);
    const wire = new THREE.LineSegments(edgesGeo, wireMat);
    wire.position.x = halfLen;
    group.add(wire);

  } else if (pipe.shape === 'channel') {
    // Structural C-channel: web (back) + top flange + bottom flange
    const webH  = pipe.od;   // web height (nominal size)
    const fw    = pipe.flangeWidth ?? Math.max(1, Math.round(webH * 0.5 * 8) / 8);
    const wt    = Math.min(pipe.wallThickness, Math.min(webH, fw) * 0.45);

    const addPart = (sx: number, sy: number, sz: number, px: number, py: number, pz: number) => {
      const geo = new THREE.BoxGeometry(sx, sy, sz);
      const mesh = new THREE.Mesh(geo, pipeMat);
      mesh.position.set(px, py, pz);
      mesh.castShadow = true;
      group.add(mesh);
      const edges = new THREE.EdgesGeometry(geo);
      const wire  = new THREE.LineSegments(edges, wireMat);
      wire.position.set(px, py, pz);
      group.add(wire);
    };

    // Web: full height, wall thickness, centered at back of channel bounding box
    addPart(pipe.length, webH, wt,  halfLen, 0,              -(fw - wt) / 2);
    // Top flange
    addPart(pipe.length, wt,  fw,   halfLen, (webH - wt) / 2, 0);
    // Bottom flange
    addPart(pipe.length, wt,  fw,   halfLen, -(webH - wt) / 2, 0);

  } else {
    // Rectangular tube
    const h = pipe.height ?? pipe.od;
    const wt = Math.min(pipe.wallThickness, Math.min(pipe.od, h) * 0.45);

    const outerGeo = new THREE.BoxGeometry(pipe.length, h, pipe.od);
    const outer = new THREE.Mesh(outerGeo, pipeMat);
    outer.position.x = halfLen;
    group.add(outer);

    const iH = h - 2 * wt;
    const iW = pipe.od - 2 * wt;
    if (iH > 0.1 && iW > 0.1) {
      const innerGeo = new THREE.BoxGeometry(pipe.length + 0.1, iH, iW);
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.x = halfLen;
      group.add(inner);
    }

    const edgesGeo = new THREE.EdgesGeometry(outerGeo);
    const wire = new THREE.LineSegments(edgesGeo, wireMat);
    wire.position.x = halfLen;
    group.add(wire);
  }

  return group;
}
