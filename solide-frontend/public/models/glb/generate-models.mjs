// ════════════════════════════════════════════════════════════════
//  SOLIDE — Crystal Steel / Wrought Iron — 3D Product Generator
//  Generates 10 realistic .glb models using three.js primitives
//  Run: node generate-models.mjs
// ════════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('../solide-frontend/public/models/glb');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── MATERIALS (PBR, matte wrought-iron finish) ─────────────────
const matteBlack = () => new THREE.MeshStandardMaterial({ color: 0x14140f, metalness: 0.9, roughness: 0.42, name: 'MatteIron_Black' });
const darkBronze = () => new THREE.MeshStandardMaterial({ color: 0x2c1d10, metalness: 0.85, roughness: 0.48, name: 'MatteIron_Bronze' });
const goldAccent = () => new THREE.MeshStandardMaterial({ color: 0xc8963c, metalness: 0.95, roughness: 0.28, name: 'Solide_Gold' });
const steelSatin = () => new THREE.MeshStandardMaterial({ color: 0x6a6f78, metalness: 0.92, roughness: 0.32, name: 'Satin_Steel' });
const woodHandrail = () => new THREE.MeshStandardMaterial({ color: 0x4a2f18, metalness: 0.05, roughness: 0.55, name: 'Wood_Handrail' });
const glassPanel = () => new THREE.MeshPhysicalMaterial({ color: 0xbfe4ff, metalness: 0, roughness: 0.05, transmission: 0.85, opacity: 0.35, transparent: true, name: 'Glass' });

// ── PRIMITIVE HELPERS ──────────────────────────────────────────
function bar(length, radius, mat, segments = 10) {
  const geo = new THREE.CylinderGeometry(radius, radius, length, segments);
  return new THREE.Mesh(geo, mat);
}
function vBar(x, y0, y1, z, radius, mat) {
  const m = bar(y1 - y0, radius, mat);
  m.position.set(x, (y0 + y1) / 2, z);
  return m;
}
function hBar(length, x, y, z, radius, mat, axis = 'x') {
  const m = bar(length, radius, mat);
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  return m;
}
function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}
function rivet(x, y, z, mat, r = 0.012) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
  m.position.set(x, y, z);
  return m;
}
function finialSpear(x, y, z, mat, h = 0.14, r = 0.018) {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), mat);
  cone.position.set(0, h / 2, 0);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r * 0.9, 10, 10), mat);
  g.add(cone, ball);
  g.position.set(x, y, z);
  return g;
}
function scrollC(radius, tube, mat, arc = Math.PI * 1.4, rot = 0) {
  const geo = new THREE.TorusGeometry(radius, tube, 8, 24, arc);
  const m = new THREE.Mesh(geo, mat);
  m.rotation.z = rot;
  return m;
}
function scrollO(radius, tube, mat) {
  const geo = new THREE.TorusGeometry(radius, tube, 8, 20);
  return new THREE.Mesh(geo, mat);
}
function panelFrame(w, h, thick, mat) {
  const g = new THREE.Group();
  g.add(box(w, thick, thick * 1.4, mat).translateY(h / 2 - thick / 2));
  g.add(box(w, thick, thick * 1.4, mat).translateY(-h / 2 + thick / 2));
  g.add(box(thick, h, thick * 1.4, mat).translateX(w / 2 - thick / 2));
  g.add(box(thick, h, thick * 1.4, mat).translateX(-w / 2 + thick / 2));
  return g;
}
function pickets(count, spanW, y0, y1, radius, mat, z = 0, spear = true, spearMat = null) {
  const g = new THREE.Group();
  const step = spanW / (count - 1);
  for (let i = 0; i < count; i++) {
    const x = -spanW / 2 + i * step;
    g.add(vBar(x, y0, y1, z, radius, mat));
    if (spear) g.add(finialSpear(x, y1, z, spearMat || mat));
  }
  return g;
}
function ring(radius, tube, mat) {
  return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 20), mat);
}

// ════════════════════════════════════════════════════════════════
// 1. MAIN VILLA GATE — Double-leaf, ornate, ~4m x 2.3m
// ════════════════════════════════════════════════════════════════
function createMainGate() {
  const g = new THREE.Group();
  const iron = matteBlack(), gold = goldAccent();
  const leafW = 1.85, h = 2.2, postH = 2.5;

  // Posts
  [-2.0, 2.0].forEach(px => {
    g.add(box(0.22, postH, 0.22, iron).translateY(postH / 2).translateX(px));
    g.add(box(0.3, 0.06, 0.3, gold).translateY(postH + 0.03).translateX(px));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), gold).translateY(postH + 0.12).translateX(px));
  });

  function leaf(sign) {
    const lg = new THREE.Group();
    lg.add(panelFrame(leafW, h, 0.07, iron));
    // mid + lower rail
    lg.add(box(leafW - 0.14, 0.07, 0.08, iron).translateY(h * 0.18 - h / 2 + 0.035));
    lg.add(box(leafW - 0.14, 0.07, 0.08, iron).translateY(h * 0.62 - h / 2 + 0.035));
    // vertical pickets
    lg.add(pickets(9, leafW - 0.22, -h / 2 + 0.05, h / 2 - 0.05, 0.018, iron, 0.02, true, gold));
    // scrollwork upper register
    [-0.55, -0.18, 0.18, 0.55].forEach((sx, idx) => {
      const s = scrollC(0.16, 0.012, gold, Math.PI * 1.3, idx % 2 ? 0.6 : -0.6);
      s.position.set(sx * leafW, h * 0.78 - h / 2, 0.025);
      lg.add(s);
    });
    // central medallion (S emblem disc)
    const disc = ring(0.22, 0.018, gold);
    disc.position.set(0, h * 0.42 - h / 2, 0.03);
    lg.add(disc);
    const discCore = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), iron);
    discCore.position.set(0, h * 0.42 - h / 2, 0.028);
    lg.add(discCore);
    // rivets along frame
    for (let i = 0; i < 6; i++) {
      lg.add(rivet(-leafW / 2 + 0.07, -h / 2 + 0.1 + i * (h - 0.2) / 5, 0.04, gold));
      lg.add(rivet(leafW / 2 - 0.07, -h / 2 + 0.1 + i * (h - 0.2) / 5, 0.04, gold));
    }
    lg.position.set(sign * (0.07 + leafW / 2), h / 2 + 0.12, 0);
    return lg;
  }
  g.add(leaf(-1), leaf(1));
  return g;
}

// ════════════════════════════════════════════════════════════════
// 2. VILLA ENTRANCE GATE — Modern single/double, clean lines, ~3m x 2m
// ════════════════════════════════════════════════════════════════
function createEntranceGate() {
  const g = new THREE.Group();
  const iron = matteBlack(), gold = goldAccent();
  const w = 3.0, h = 2.0, postH = 2.2;

  [-1.55, 1.55].forEach(px => {
    g.add(box(0.18, postH, 0.18, iron).translateY(postH / 2).translateX(px));
    g.add(box(0.22, 0.05, 0.22, gold).translateY(postH + 0.025).translateX(px));
  });

  const frame = panelFrame(w - 0.4, h, 0.06, iron);
  frame.position.set(0, h / 2 + 0.1, 0);
  g.add(frame);

  // Modern horizontal slats pattern
  for (let i = 0; i < 7; i++) {
    const y = -h / 2 + 0.15 + i * (h - 0.3) / 6;
    const slat = box(w - 0.56, 0.045, 0.05, i % 3 === 0 ? gold : iron);
    slat.position.set(0, y + h / 2 + 0.1, 0.01);
    g.add(slat);
  }
  // vertical accent dividers
  [-0.85, 0, 0.85].forEach(x => {
    g.add(vBar(x, 0.1, h + 0.1, 0.02, 0.02, iron));
  });
  // handle
  const handlePlate = box(0.05, 0.3, 0.06, gold);
  handlePlate.position.set(w / 2 - 0.35, h * 0.45, 0.06);
  g.add(handlePlate);
  return g;
}

// ════════════════════════════════════════════════════════════════
// 3. INTERNAL STAIR RAILING — handrail + wood top, ~3m x 1m
// ════════════════════════════════════════════════════════════════
function createStairRailing() {
  const g = new THREE.Group();
  const iron = matteBlack(), wood = woodHandrail(), gold = goldAccent();
  const len = 3.0, h = 1.0;

  // sloped handrail (wood) following stair angle
  const railGeo = new THREE.CylinderGeometry(0.035, 0.035, len, 14);
  const rail = new THREE.Mesh(railGeo, wood);
  rail.rotation.z = Math.PI / 2;
  rail.rotation.x = 0.32; // slope
  rail.position.set(0, h, 0);
  g.add(rail);

  // base shoe rail
  const shoe = box(len, 0.04, 0.08, iron);
  shoe.position.set(0, 0.02, 0);
  g.add(shoe);

  // balusters following the slope
  const count = 12;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = -len / 2 + t * len;
    const topY = h - 0.05 + (0.5 - t) * 0.18;
    g.add(vBar(x, 0.04, topY, 0, 0.015, iron));
    if (i % 3 === 0) g.add(rivet(x, topY * 0.5, 0.018, gold));
  }
  // decorative S-scroll mid baluster every third gap
  for (let i = 0; i < count - 1; i += 3) {
    const t = (i + 0.5) / (count - 1);
    const x = -len / 2 + t * len;
    const s = scrollO(0.07, 0.01, gold);
    s.position.set(x, h * 0.5, 0);
    g.add(s);
  }
  return g;
}

// ════════════════════════════════════════════════════════════════
// 4. BALCONY RAILING — floral/scroll detail, ~3m x 1.1m
// ════════════════════════════════════════════════════════════════
function createBalconyRailing() {
  const g = new THREE.Group();
  const iron = matteBlack(), gold = goldAccent();
  const len = 3.0, h = 1.1;

  g.add(box(len, 0.045, 0.05, gold).translateY(h));
  g.add(box(len, 0.04, 0.06, iron).translateY(0.02));
  g.add(box(len, 0.03, 0.05, iron).translateY(h * 0.45));

  // end posts
  [-len / 2, len / 2].forEach(x => g.add(vBar(x, 0, h, 0, 0.03, iron)));

  // repeating scroll-and-picket motif
  const groups = 5, spanEach = len / groups;
  for (let i = 0; i < groups; i++) {
    const cx = -len / 2 + spanEach * (i + 0.5);
    // central O scroll (floral roundel)
    const o = scrollO(0.13, 0.014, gold);
    o.position.set(cx, h * 0.45, 0.02);
    g.add(o);
    const oInner = ring(0.06, 0.01, iron);
    oInner.position.set(cx, h * 0.45, 0.02);
    g.add(oInner);
    // flanking C-scrolls
    g.add(scrollC(0.1, 0.012, gold, Math.PI, 0.3).translateX(cx - spanEach * 0.28).translateY(h * 0.45));
    g.add(scrollC(0.1, 0.012, gold, Math.PI, -0.3 + Math.PI).translateX(cx + spanEach * 0.28).translateY(h * 0.45));
    // upper & lower pickets
    g.add(vBar(cx - spanEach * 0.35, h * 0.62, h - 0.04, 0, 0.014, iron));
    g.add(vBar(cx + spanEach * 0.35, h * 0.62, h - 0.04, 0, 0.014, iron));
    g.add(vBar(cx - spanEach * 0.35, 0.04, h * 0.28, 0, 0.014, iron));
    g.add(vBar(cx + spanEach * 0.35, 0.04, h * 0.28, 0, 0.014, iron));
  }
  return g;
}

// ════════════════════════════════════════════════════════════════
// 5. EXTERNAL STAIRCASE — 5 steel steps + side railing
// ════════════════════════════════════════════════════════════════
function createExternalStaircase() {
  const g = new THREE.Group();
  const iron = matteBlack(), steel = steelSatin(), gold = goldAccent();
  const steps = 6, stepW = 1.1, stepD = 0.28, stepH = 0.18;

  for (let i = 0; i < steps; i++) {
    const tread = box(stepW, 0.03, stepD, steel);
    tread.position.set(0, (i + 1) * stepH, i * stepD);
    g.add(tread);
    // riser support (stringer cut profile, simplified as small box)
    const support = box(0.05, stepH, stepD, iron);
    support.position.set(-stepW / 2 + 0.03, (i + 0.5) * stepH, i * stepD);
    g.add(support);
    const support2 = support.clone();
    support2.position.x = stepW / 2 - 0.03;
    g.add(support2);
  }
  // stringer beam (diagonal) on one side
  const totalRise = steps * stepH, totalRun = steps * stepD;
  const len = Math.sqrt(totalRise * totalRise + totalRun * totalRun);
  const stringer = box(0.06, len, 0.18, iron);
  stringer.position.set(stepW / 2 + 0.02, totalRise / 2, totalRun / 2 - stepD / 2);
  stringer.rotation.x = -Math.atan2(totalRise, totalRun);
  g.add(stringer);

  // handrail + balusters along the slope (one side)
  const postCount = steps + 1;
  for (let i = 0; i < postCount; i++) {
    const y = i * stepH, z = i * stepD - stepD / 2;
    g.add(vBar(stepW / 2 + 0.02, y, y + 0.95, z, 0.02, iron));
    if (i < postCount - 1) g.add(finialSpear(stepW / 2 + 0.02, y + 0.95, z, gold, 0.08, 0.014));
  }
  const handGeo = new THREE.CylinderGeometry(0.028, 0.028, len, 12);
  const hand = new THREE.Mesh(handGeo, gold);
  hand.rotation.x = Math.PI / 2 - Math.atan2(totalRise, totalRun);
  hand.position.set(stepW / 2 + 0.02, 0.95 + totalRise / 2, totalRun / 2 - stepD / 2);
  g.add(hand);
  return g;
}

// ════════════════════════════════════════════════════════════════
// 6. ROOFTOP / BASEMENT STAIRS — simple industrial pipe rail stair
// ════════════════════════════════════════════════════════════════
function createRoofStairs() {
  const g = new THREE.Group();
  const steel = steelSatin(), iron = matteBlack();
  const steps = 5, stepW = 0.85, stepD = 0.25, stepH = 0.19;

  for (let i = 0; i < steps; i++) {
    const tread = box(stepW, 0.025, stepD, steel);
    tread.position.set(0, (i + 1) * stepH, i * stepD);
    g.add(tread);
    // perforated look via thin ridges
    for (let r = -1; r <= 1; r++) {
      const ridge = box(stepW * 0.92, 0.008, 0.02, iron);
      ridge.position.set(0, (i + 1) * stepH + 0.017, i * stepD + r * 0.08);
      g.add(ridge);
    }
  }
  const totalRise = steps * stepH, totalRun = steps * stepD;
  const len = Math.sqrt(totalRise ** 2 + totalRun ** 2);
  // simple two-pipe industrial rail
  [0.018, 0.018].forEach((r, idx) => {
    const yOff = idx === 0 ? 0.45 : 0.92;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), iron);
    pipe.rotation.x = Math.PI / 2 - Math.atan2(totalRise, totalRun);
    pipe.position.set(stepW / 2 + 0.03, yOff + totalRise / 2, totalRun / 2 - stepD / 2);
    g.add(pipe);
  });
  const postCount = steps + 1;
  for (let i = 0; i < postCount; i++) {
    const y = i * stepH, z = i * stepD - stepD / 2;
    g.add(vBar(stepW / 2 + 0.03, y, y + 0.92, z, 0.016, iron));
  }
  return g;
}

// ════════════════════════════════════════════════════════════════
// 7. WINDOW SECURITY GRILL — ~1.2m x 1.4m
// ════════════════════════════════════════════════════════════════
function createWindowGrill() {
  const g = new THREE.Group();
  const iron = matteBlack(), gold = goldAccent();
  const w = 1.2, h = 1.4;

  g.add(panelFrame(w, h, 0.045, iron));
  // grid bars
  for (let i = 1; i < 5; i++) {
    g.add(vBar(-w / 2 + (w / 5) * i, -h / 2 + 0.03, h / 2 - 0.03, 0.015, 0.016, iron));
  }
  [-1, 0, 1].forEach(s => {
    g.add(box(w - 0.1, 0.022, 0.03, iron).translateY(s * h * 0.32));
  });
  // central diamond accent
  const dia = box(0.16, 0.16, 0.03, gold);
  dia.rotation.z = Math.PI / 4;
  dia.position.set(0, 0, 0.02);
  g.add(dia);
  const diaInner = box(0.08, 0.08, 0.035, iron);
  diaInner.rotation.z = Math.PI / 4;
  diaInner.position.set(0, 0, 0.022);
  g.add(diaInner);
  // corner rivets
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    g.add(rivet(sx * (w / 2 - 0.05), sy * (h / 2 - 0.05), 0.03, gold));
  });
  return g;
}

// ════════════════════════════════════════════════════════════════
// 8. FENCE / PERGOLA SECTION — panel between pillars + small gate, ~3m x 1.6m
// ════════════════════════════════════════════════════════════════
function createFence() {
  const g = new THREE.Group();
  const iron = matteBlack(), gold = goldAccent();
  const totalW = 3.2, h = 1.6, pillarH = 1.8;

  [-1.6, 0, 1.6].forEach(px => {
    g.add(box(0.16, pillarH, 0.16, iron).translateY(pillarH / 2).translateX(px));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.18, 4), gold);
    cap.rotation.y = Math.PI / 4;
    cap.position.set(px, pillarH + 0.09, 0);
    g.add(cap);
  });

  // left fence panel (fixed)
  const panelW = 1.44;
  g.add(pickets(8, panelW - 0.1, 0.05, h, 0.015, iron, 0, true, gold).translateX(-0.8));
  g.add(box(panelW, 0.04, 0.05, iron).translateY(h * 0.55).translateX(-0.8));
  g.add(box(panelW, 0.04, 0.05, iron).translateY(0.08).translateX(-0.8));

  // right fence panel (fixed)
  g.add(pickets(8, panelW - 0.1, 0.05, h, 0.015, iron, 0, true, gold).translateX(0.8));
  g.add(box(panelW, 0.04, 0.05, iron).translateY(h * 0.55).translateX(0.8));
  g.add(box(panelW, 0.04, 0.05, iron).translateY(0.08).translateX(0.8));

  return g;
}

// ════════════════════════════════════════════════════════════════
// 9. EXTERNAL IRON DOOR — solid speakeasy-style, ~1m x 2.2m
// ════════════════════════════════════════════════════════════════
function createIronDoor() {
  const g = new THREE.Group();
  const iron = matteBlack(), bronze = darkBronze(), gold = goldAccent();
  const w = 1.0, h = 2.2;

  const slab = box(w, h, 0.06, bronze);
  slab.position.set(0, h / 2, 0);
  g.add(slab);

  // raised panel sections
  [0.28, 0.72].forEach((fy) => {
    const panel = box(w - 0.22, h * 0.32, 0.025, iron);
    panel.position.set(0, fy * h, 0.045);
    g.add(panel);
    const bevel = panelFrame(w - 0.3, h * 0.32 - 0.05, 0.025, gold);
    bevel.position.set(0, fy * h, 0.06);
    g.add(bevel);
  });

  // diagonal cross straps (typical wrought iron door bracing)
  function strap(rot, py) {
    const s = box(1.25, 0.07, 0.02, iron);
    s.position.set(0, py, 0.063);
    s.rotation.z = rot;
    return s;
  }
  g.add(strap(0.65, h * 0.5));
  g.add(strap(-0.65, h * 0.5));

  // rivets along straps
  for (let i = -3; i <= 3; i++) {
    g.add(rivet(i * 0.13, h * 0.5 + i * 0.085, 0.07, gold, 0.018));
    g.add(rivet(i * 0.13, h * 0.5 - i * 0.085, 0.07, gold, 0.018));
  }

  // ring handle
  const handleRing = ring(0.07, 0.012, gold);
  handleRing.rotation.x = Math.PI / 2;
  handleRing.position.set(w * 0.32, h * 0.42, 0.075);
  g.add(handleRing);
  const handlePlate = box(0.12, 0.16, 0.02, gold);
  handlePlate.position.set(w * 0.32, h * 0.42, 0.05);
  g.add(handlePlate);

  // hinges
  [0.85, 1.6].forEach(hy => {
    const hinge = box(0.04, 0.18, 0.07, iron);
    hinge.position.set(-w / 2, hy, 0.05);
    g.add(hinge);
  });
  return g;
}

// ════════════════════════════════════════════════════════════════
// 10. CUSTOM ART PIECE — Solide "S" monogram wall sculpture
// ════════════════════════════════════════════════════════════════
function createCustomArt() {
  const g = new THREE.Group();
  const gold = goldAccent(), iron = matteBlack();

  // circular backing frame
  const back = ring(0.42, 0.025, iron);
  g.add(back);
  const backFill = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), darkBronze());
  backFill.position.z = -0.01;
  g.add(backFill);

  // "S" shaped curve using a tube along a custom curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.14, 0.28, 0.03),
    new THREE.Vector3(-0.12, 0.22, 0.03),
    new THREE.Vector3(-0.12, 0.06, 0.03),
    new THREE.Vector3(0.1, 0.0, 0.03),
    new THREE.Vector3(0.12, -0.12, 0.03),
    new THREE.Vector3(-0.1, -0.24, 0.03),
    new THREE.Vector3(-0.16, -0.3, 0.03),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.035, 12, false);
  g.add(new THREE.Mesh(tubeGeo, gold));

  // small crystal facets around the rim (decorative shards like the logo)
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), i % 2 ? gold : iron);
    shard.position.set(Math.cos(ang) * 0.46, Math.sin(ang) * 0.46, 0.02);
    shard.rotation.z = ang;
    shard.rotation.x = Math.PI / 2;
    g.add(shard);
  }

  // mounting base/stand
  const stand = box(0.5, 0.04, 0.12, iron);
  stand.position.set(0, -0.52, 0.04);
  g.add(stand);
  const standArm = box(0.04, 0.1, 0.06, iron);
  standArm.position.set(0, -0.46, 0.02);
  g.add(standArm);

  return g;
}

// ════════════════════════════════════════════════════════════════
// EXPORT PIPELINE
// ════════════════════════════════════════════════════════════════
const PRODUCTS = [
  { name: 'main-villa-gate', label: 'بوابة فيلا رئيسية', fn: createMainGate },
  { name: 'entrance-gate', label: 'بوابة فيلا خارجية', fn: createEntranceGate },
  { name: 'stair-railing-internal', label: 'درابزين سلم داخلي', fn: createStairRailing },
  { name: 'balcony-railing', label: 'درابزين بلكونة', fn: createBalconyRailing },
  { name: 'external-staircase', label: 'سلم خارجي', fn: createExternalStaircase },
  { name: 'roof-stairs', label: 'سلم بدروم/روف', fn: createRoofStairs },
  { name: 'window-grill', label: 'شباك حماية', fn: createWindowGrill },
  { name: 'fence-section', label: 'سور خارجي', fn: createFence },
  { name: 'iron-door', label: 'باب حديد خارجي', fn: createIronDoor },
  { name: 'custom-art-piece', label: 'تصميم حر — تحفة فنية', fn: createCustomArt },
];

function exportModel(group, filename) {
  return new Promise((resolve, reject) => {
    const scene = new THREE.Scene();
    scene.add(group);
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        const buffer = Buffer.from(result);
        const filePath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        resolve({ filePath, size: buffer.length });
      },
      (err) => reject(err),
      { binary: true, embedImages: true }
    );
  });
}

(async () => {
  console.log('🔨  Solide — generating 10 wrought-iron 3D models...\n');
  let totalBytes = 0;
  for (const p of PRODUCTS) {
    try {
      const group = p.fn();
      const filename = `${p.name}.glb`;
      const { filePath, size } = await exportModel(group, filename);
      totalBytes += size;
      console.log(`✅  ${p.label.padEnd(22, ' ')} → ${filename}  (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`❌  Failed: ${p.name}`, err);
    }
  }
  console.log(`\n📦  Done. Total size: ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`📁  Output folder: ${OUTPUT_DIR}`);
})();
