import * as THREE from 'three';

const bedMat    = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 30 });
const railMat   = new THREE.MeshPhongMaterial({ color: 0x555566, shininess: 80 });
const legMat    = new THREE.MeshPhongMaterial({ color: 0x1e1e1e });
const accentMat = new THREE.MeshPhongMaterial({ color: 0x4a4a6a, shininess: 60 });

// How far below the pipe center-line the table surface sits (inches)
const TABLE_DROP = 6;

/**
 * Full CNC machine bed + gantry — Pipe Dream PD-10/PD-24 style.
 * Pipe axis = world X. Pipe centre-line at Y = pipeRadius (set by SceneManager).
 * Table surface is at Y = -TABLE_DROP so it clears all pipe sizes.
 * Gantry columns at X = torchWorldX; Z-axis linear rails on front face.
 */
export function createMachineFrame(
  envelopeLength: number,
  torchWorldX: number,
): THREE.Group {
  const group = new THREE.Group();

  const bedH  = 4.5;
  const bedD  = 20;
  const railH = 1.2;
  const railW = 1.8;

  // Y of table top surface (dropped TABLE_DROP below the pipe mounting level)
  const tableY = -TABLE_DROP;

  // ── Table bed ─────────────────────────────────────────────────────────────
  const bedGeo = new THREE.BoxGeometry(envelopeLength, bedH, bedD);
  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.position.set(envelopeLength / 2, tableY - bedH / 2, 0);
  bed.receiveShadow = true;
  group.add(bed);

  // Side skirts
  for (const sign of [-1, 1]) {
    const skirtGeo = new THREE.BoxGeometry(envelopeLength, bedH * 0.6, 0.8);
    const skirt = new THREE.Mesh(skirtGeo, legMat);
    skirt.position.set(envelopeLength / 2, tableY - bedH * 0.7, sign * (bedD / 2 + 0.4));
    group.add(skirt);
  }

  // ── HIWIN-style linear rails — only on the torch-side (X=0 → torchWorldX) ─
  // The rear section (torchWorldX → machine end) is open for pipe loading.
  const railLen = torchWorldX;
  for (const sign of [-1, 1]) {
    const railGeo = new THREE.BoxGeometry(railLen, railH, railW);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(railLen / 2, tableY + railH / 2, sign * (bedD / 2 - railW / 2));
    group.add(rail);
    // Top groove
    const grooveGeo = new THREE.BoxGeometry(railLen, 0.2, 0.3);
    const groove = new THREE.Mesh(grooveGeo, new THREE.MeshPhongMaterial({ color: 0x888899 }));
    groove.position.set(railLen / 2, tableY + railH + 0.1, sign * (bedD / 2 - railW / 2));
    group.add(groove);
  }

  // ── Table legs ────────────────────────────────────────────────────────────
  const legH    = 28 + TABLE_DROP;   // taller to reach the lowered table
  const legW    = 3.5;
  const legSpacing = Math.min(envelopeLength, 36);
  const legCount   = Math.max(2, Math.round(envelopeLength / legSpacing));

  for (let i = 0; i <= legCount; i++) {
    const lx = (i / legCount) * envelopeLength;
    for (const sign of [-1, 1]) {
      const legGeo = new THREE.BoxGeometry(legW, legH, legW);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, tableY - bedH - legH / 2, sign * (bedD / 2 - legW / 2));
      leg.castShadow = true;
      group.add(leg);
      // Leveling foot pad
      const footGeo = new THREE.CylinderGeometry(2.2, 2.5, 2, 10);
      const foot = new THREE.Mesh(footGeo, accentMat);
      foot.position.set(lx, tableY - bedH - legH - 1, sign * (bedD / 2 - legW / 2));
      group.add(foot);
    }
    if (i < legCount) {
      const bx = lx + envelopeLength / legCount / 2;
      const braceGeo = new THREE.BoxGeometry(envelopeLength / legCount - 1, 1.8, 1.8);
      const brace = new THREE.Mesh(braceGeo, legMat);
      brace.position.set(bx, tableY - bedH - legH * 0.55, 0);
      group.add(brace);
    }
  }



  return group;
}
