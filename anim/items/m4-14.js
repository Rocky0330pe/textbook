// @id m4-14
// @title 流束：面を通りぬける量
// @vol 数学8
// @uses 3d
// @from 数学 8-8 図1・13（ch8-08:230・851）、⑩⑫（ch8-08:753・831）
'use strict';
// はてな？の網：流れ 2 m/s、網の面積 0.5 m²（1辺 0.707 m の正方形）。点電荷の場 F=(x,y,z)/r³（Q/4πε₀=1）
const DG = Math.PI / 180, SIDE = Math.sqrt(0.5);

function drawAmi(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 175, center: [0, 0, 0], persp: 0 });
  const th = Math.round(st.th) * DG, n = [Math.cos(th), Math.sin(th), 0], w = [-Math.sin(th), Math.cos(th), 0], s = SIDE / 2;
  // 網（法線 n が流れとなす角 θ）
  const C = (a, b) => [w[0] * a, w[1] * a, b];
  V.poly3([C(-s, -s), C(s, -s), C(s, s), C(-s, s)], { fill: 'e', alpha: 0.3, color: 'e', width: 2.5 });
  for (let k = -3; k <= 3; k++) { V.line3([C(k * s / 4, -s), C(k * s / 4, s)], { color: 'e', width: 1, alpha: 0.7 }); V.line3([C(-s, k * s / 4), C(s, k * s / 4)], { color: 'e', width: 1, alpha: 0.7 }); }
  V.arrow3([0, 0, 0], n.map(v => v * 0.7), { color: 'c', width: 3, zbias: 0.2 }); V.text3('n', n.map(v => v * 0.8), { size: 18, color: 'c', bold: true, math: true, italic: true });
  // 流れの見かけの大きさ（流れの向きから見た網）
  const X0 = -1.25, ay = s * Math.cos(th);
  V.poly3([[X0, -ay, -s], [X0, ay, -s], [X0, ay, s], [X0, -ay, s]], { fill: 'd', alpha: 0.08, color: 'd', width: 2, style: 'dash' });
  V.text3('見かけ A cos θ', [X0, 0, -s - 0.2], { size: 15, color: 'd', bold: true, align: 'center' });
  // 流れる粒：網を通るもの（オレンジ）と通らないもの（灰）
  for (let yi = -4; yi <= 4; yi++) for (let zi = -2; zi <= 2; zi++) {
    const y = yi * 0.15, z = zi * 0.15, through = Math.abs(y) <= ay + 1e-9 && Math.abs(z) <= s;
    for (let k = 0; k < 6; k++) { const x = -1.5 + ((st.t * 0.6 + k * 0.5 + (yi + zi) * 0.07) % 3); V.dot3([x, y, z], { color: through ? 'b' : 'sub', r: through ? 3.5 : 2.2, zbias: 0.01 }); }
  }
  V.arrow3([-0.9, 0, 0.62], [-0.3, 0, 0.62], { color: 'a', width: 3.5, zbias: 1 }); V.text3('流れ 2 m/s', [-0.6, 0, 0.78], { size: 15, color: 'a', bold: true, align: 'center' });
  V.flush();
  const x = 620;
  cv.text('網の角 θ ＝ ' + Math.round(st.th) + '°', x, 40, { size: 18, bold: true });
  cv.text('1秒間に通る量', x, 90, { size: 15, color: 'sub' });
  cv.text('v A cos θ ＝ 2 × 0.5 × ' + A.num(Math.cos(th), 3), x, 116, { size: 16 });
  cv.text('＝ ' + A.num(2 * 0.5 * Math.cos(th), 2) + ' m³', x + 20, 144, { size: 20, bold: true, color: 'b' });
  const T = [[0, '1.0'], [30, '0.87'], [45, '0.71'], [60, '0.5'], [90, '0']];
  T.forEach(([a, q], i) => { cv.text(a + '°', x + i * 50, 200, { size: 14, color: 'sub', align: 'left' }); cv.text(q, x + i * 50, 224, { size: 15, bold: Math.round(st.th) === a }); });
  cv.text('網を通るのは、網に直角な', x, 280, { size: 15 }); cv.text('成分 v cos θ だけ', x, 304, { size: 15, bold: true });
  cv.text('図はドラッグで回せます', x, 410, { size: 14, color: 'sub' });
}

// 袋（切り口）：12 この点を、なめらかにつないだ閉じた線
const SHAPES = {
  c: (k) => { const a = k / 12 * 2 * Math.PI; return [1.6 * Math.cos(a), 1.6 * Math.sin(a)]; },
  s: (k) => { const sq = [[1.4, -1.4], [1.4, -0.47], [1.4, 0.47], [1.4, 1.4], [0.47, 1.4], [-0.47, 1.4], [-1.4, 1.4], [-1.4, 0.47], [-1.4, -0.47], [-1.4, -1.4], [-0.47, -1.4], [0.47, -1.4]]; return sq[k]; },
  e: (k) => { const a = k / 12 * 2 * Math.PI; return [2.3 * Math.cos(a), 1.2 * Math.sin(a)]; },
  f: (k) => { const a = k / 12 * 2 * Math.PI, r = 1.5 + 0.5 * Math.sin(3 * a) + 0.25 * Math.cos(2 * a); return [r * Math.cos(a), r * Math.sin(a)]; }
};
function bagCurve(st) {
  const P = st.B, out = [];
  if (st.sh === 's') { for (let k = 0; k < 12; k++) for (let j = 0; j < 4; j++) { const a = P[k], b = P[(k + 1) % 12]; out.push([a[0] + (b[0] - a[0]) * j / 4, a[1] + (b[1] - a[1]) * j / 4]); } return out; }
  for (let k = 0; k < 12; k++) {
    const p0 = P[(k + 11) % 12], p1 = P[k], p2 = P[(k + 1) % 12], p3 = P[(k + 2) % 12];
    for (let j = 0; j < 8; j++) { const t = j / 8, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(i => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3))); }
  }
  return out;
}
// 半直線と、閉じた線との交わり（出る：+1、入る：−1）
function crossings(q, ang, C) {
  const d = [Math.cos(ang), Math.sin(ang)], res = [];
  let area = 0; for (let k = 0; k < C.length; k++) { const a = C[k], b = C[(k + 1) % C.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0;
  for (let k = 0; k < C.length; k++) {
    const a = C[k], b = C[(k + 1) % C.length], e = [b[0] - a[0], b[1] - a[1]], den = d[0] * e[1] - d[1] * e[0];
    if (Math.abs(den) < 1e-12) continue;
    const t = ((a[0] - q[0]) * e[1] - (a[1] - q[1]) * e[0]) / den, u = ((a[0] - q[0]) * d[1] - (a[1] - q[1]) * d[0]) / den;
    if (t > 1e-9 && u >= 0 && u < 1) { const nrm = ccw ? [e[1], -e[0]] : [-e[1], e[0]]; res.push({ p: [q[0] + d[0] * t, q[1] + d[1] * t], s: (nrm[0] * d[0] + nrm[1] * d[1]) > 0 ? 1 : -1 }); }
  }
  return res;
}
const FV = [10, 10, 520, 420], fview = cv => cv.view({ x0: -3, x1: 3, y0: -2.6, y1: 2.6, box: FV, equal: true });
function drawFukuro(cv, st) {
  const v = fview(cv), C = bagCurve(st), q = [st.qx, st.qy];
  v.poly(C, { fill: 'e', alpha: 0.12, color: 'e', width: 3, style: st.sh === 's' ? 'dash' : st.sh === 'e' ? 'dot' : 'solid' });
  let out = 0, inn = 0;
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * 2 * Math.PI + 0.13;
    v.clip(() => v.arrow(q[0], q[1], q[0] + 6 * Math.cos(a), q[1] + 6 * Math.sin(a), { color: 'a', width: 1.6, alpha: 0.75 }));
    for (const c of crossings(q, a, C)) { if (c.s > 0) { out++; v.dot(c.p[0], c.p[1], { color: 'b', r: 6 }); } else { inn++; v.dot(c.p[0], c.p[1], { color: 'd', r: 6, shape: 'square', open: true }); } }
  }
  v.dot(q[0], q[1], { color: 'ink', r: 9 }); v.text('＋', q[0], q[1], { size: 14, color: 'bg', align: 'center', bold: true });
  if (st.sh === 'f') st.B.forEach(p => v.dot(p[0], p[1], { color: 'e', r: 5, shape: 'diamond' }));
  const x = 560;
  cv.text('電荷から出る線：12 本', x, 40, { size: 16, bold: true });
  cv.text('袋から出る（●）：' + out, x, 84, { size: 16, color: 'b', bold: true });
  cv.text('袋に入る（□）　：' + inn, x, 112, { size: 16, color: 'd', bold: true });
  cv.text('出 − 入 ＝ ' + (out - inn), x, 156, { size: 20, bold: true });
  cv.text(out - inn === 12 ? '電荷が中：線は全部、袋を通りぬける' : out - inn === 0 ? '電荷が外：入った線は、必ず出ていく' : '', x, 194, { size: 15 });
  cv.text('電荷（●）はドラッグで動かせます', x, 380, { size: 14, color: 'sub' });
  if (st.sh === 'f') cv.text('袋の ◆ もドラッグできます', x, 404, { size: 14, color: 'sub' });
}

function drawKyu(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 85, center: [0, 0, 0], persp: 0 });
  const R = st.R;
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) dirs.push([a, b, c].map(x => x / Math.sqrt(3)));
  if (st.bag === 'sph') {
    for (let k = 0; k < 12; k++) { const p = k / 12 * Math.PI; const ring = []; for (let j = 0; j <= 36; j++) { const t = j / 36 * 2 * Math.PI; ring.push([R * Math.sin(p) * Math.cos(t), R * Math.sin(p) * Math.sin(t), R * Math.cos(p)]); } for (let j = 0; j < 36; j++) V.line3([ring[j], ring[j + 1]], { color: 'e', width: 1, alpha: 0.6 }); }
    for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI; const ring = []; for (let j = 0; j <= 36; j++) { const p = j / 36 * 2 * Math.PI; ring.push([R * Math.sin(p) * Math.cos(t), R * Math.sin(p) * Math.sin(t), R * Math.cos(p)]); } for (let j = 0; j < 36; j++) V.line3([ring[j], ring[j + 1]], { color: 'e', width: 1, alpha: 0.6 }); }
  } else {
    const c = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(p => p.map(x => x * R));
    [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach(f => V.poly3(f.map(i => c[i]), { fill: 'e', alpha: 0.1, color: 'e', width: 1.5, style: 'dash' }));
  }
  for (const d of dirs) { V.arrow3(d.map(x => x * 0.15), d.map(x => x * 2.4), { color: 'a', width: 1.8 }); }
  V.dot3([0, 0, 0], { color: 'ink', r: 8 });
  V.flush();
  const x = 620, E = 1 / (R * R);
  cv.text(st.bag === 'sph' ? '球の袋（半径 R）' : '立方体の袋（1辺 2R）', x, 40, { size: 17, bold: true });
  if (st.bag === 'sph') {
    cv.text('場の大きさ 1/R² ＝ ' + A.num(E, 3), x, 84, { size: 15 });
    cv.text('球の面積 4πR² ＝ ' + A.num(4 * Math.PI * R * R, 3), x, 110, { size: 15 });
    cv.text('流束 ＝ ' + A.num(E, 3) + ' × ' + A.num(4 * Math.PI * R * R, 3), x, 146, { size: 15 });
    cv.text('＝ 4π ≒ 12.566', x + 20, 174, { size: 19, bold: true, color: 'b' });
  } else {
    const one = cubeFace(R);
    cv.text('上の面だけを、100×100 のタイルで', x, 84, { size: 15 }); cv.text('たすと ' + A.num(one, 4), x, 110, { size: 15 });
    cv.text('6つの面で ' + A.num(6 * one, 4), x, 146, { size: 15 });
    cv.text('≒ 4π ＝ 12.566', x + 20, 174, { size: 19, bold: true, color: 'b' });
  }
  cv.text('R を変えても、袋の形を', x, 230, { size: 15 }); cv.text('変えても、流束は同じ。', x, 254, { size: 15, bold: true });
  cv.text('図はドラッグで回せます', x, 410, { size: 14, color: 'sub' });
}
// 立方体の上の面（z=R、−R≦x,y≦R）の流束を、100×100 のタイルでたす（本の Python と同じ）
function cubeFace(R) { const n = 100, h = 2 * R / n; let s = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -R + (i + 0.5) * h, y = -R + (j + 0.5) * h; s += R / Math.pow(x * x + y * y + R * R, 1.5) * h * h; } return s; }

A.item({
  id: 'm4-14', title: '流束：面を通りぬける量',
  from: '数学 第8巻 8-8「面積分（流束）」の図から（8-11④、物理 電-2・力-13 でも使う）',
  W: 880, H: 440,
  state: { yaw: -30, pitch: 22, th: 0, t: 0, sh: 'c', B: [], qx: 0, qy: 0, R: 1, bag: 'sph' },
  scenes: [
    {
      key: 'ami', label: '① 網をかたむける',
      lead: '2 m/s の流れの中に、面積 0.5 m² の網を置きます。▶ で網を回していくと、通りぬける水（オレンジの粒）はどう変わるでしょう。',
      note: '網を通りぬけるのは、流れのうち網に**直角な成分** $v\\cos\\theta$ だけです。流れの向きから見ると、網は $A\\cos\\theta$ の大きさ（むらさきの点線）にしか見えない、と考えても同じです。1秒間に通る量は $vA\\cos\\theta$。正面なら 1.0 m³、60° なら 0.5 m³、90° なら0です。',
      miss: '60° 回した網を通る量を $2\\times0.5=1.0$ とするのはまちがいです。$\\vec v\\cdot\\vec n\\times A=2\\times\\cos60°\\times0.5=0.5$ です。',
      state: { th: 0, t: 0, yaw: -30, pitch: 22 },
      legend: [['網', { color: 'e' }], ['網に直角な向き $\\vec n$', { color: 'c' }], ['網を通る粒', { color: 'b', shape: 'circle', noline: true }], ['流れの向きから見た大きさ', { color: 'd', style: 'dash' }]],
      controls: [{ range: 'th', label: '網の角 $\\theta$', min: 0, max: 90, step: 1, fmt: v => Math.round(v) + '°' }],
      step(st, dt) { st.t += dt; st.th = Math.min(90, st.th + 12 * dt); },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw: drawAmi,
      readout: st => `$vA\\cos\\theta=2\\times0.5\\times\\cos${Math.round(st.th)}°=${A.num(Math.cos(st.th * DG), 2)}$ m³（1秒間）`
    },
    {
      key: 'fukuro', label: '② 袋の形を変える',
      lead: '点電荷から出る電気力線（12本）と、電荷を囲む袋の切り口です。袋の形を変えたり、電荷を袋の外へ動かしたりして、「出 − 入」を数えましょう。',
      note: '電荷が袋の中にあれば、どの線も袋を通りぬけて外へ出るので、どんな形の袋でも「出 − 入」は12本（流束は $\\frac{Q}{\\varepsilon_0}$）です。電荷が外にあれば、入った線は必ず反対側から出ていくので0です。答えが袋の形によらないから、計算が楽な袋（球など）を選んでよいのです。',
      state: { sh: 'c', qx: 0, qy: 0 },
      legend: [['電気力線', { color: 'a' }], ['袋から出る所', { color: 'b', shape: 'circle', noline: true }], ['袋に入る所', { color: 'd', shape: 'square', noline: true }], ['袋', { color: 'e' }]],
      controls: [{ seg: 'sh', label: '袋', options: [['c', '球'], ['s', '立方体'], ['e', 'だ円'], ['f', '自由な形']], on: st => { st.B = []; for (let k = 0; k < 12; k++) st.B.push(SHAPES[st.sh](k)); } }],
      init: st => { st.B = []; for (let k = 0; k < 12; k++) st.B.push(SHAPES[st.sh](k)); },
      drag: {
        hit(st, x, y) { const v = fview({ W: 880, H: 440 }); const p = v.P([st.qx, st.qy]); if (A.near(x, y, p[0], p[1], 20)) return 'q'; if (st.sh === 'f') for (let k = 0; k < 12; k++) { const b = v.P(st.B[k]); if (A.near(x, y, b[0], b[1], 16)) return k; } return null; },
        move(st, x, y, api, k) { const [a, b] = fview({ W: 880, H: 440 }).inv(x, y); const p = [A.clamp(a, -2.9, 2.9), A.clamp(b, -2.5, 2.5)]; if (k === 'q') { st.qx = p[0]; st.qy = p[1]; } else st.B[k] = p; }
      },
      draw: drawFukuro,
      readout: st => { let o = 0; const C = bagCurve(st); for (let k = 0; k < 12; k++) for (const c of crossings([st.qx, st.qy], k / 12 * 2 * Math.PI + 0.13, C)) o += c.s; return `出 − 入 ＝ ${o} 本　→　${o === 12 ? '電荷が袋の中' : o === 0 ? '電荷が袋の外' : ''}`; }
    },
    {
      key: 'kyumen', label: '③ 球と立方体',
      lead: '点電荷の場 $\\vec F=\\dfrac{(x,\\ y,\\ z)}{r^3}$ が、球の袋と立方体の袋から出る量（流束）を、大きさ $R$ を変えてくらべます。',
      note: '球なら、場は面に直角で大きさ $\\frac{1}{R^2}$、面積は $4\\pi R^2$ なので、流束は $R$ によらず $4\\pi\\approx12.566$ です。立方体では、1つの面をタイルに分けてたすと約2.0944、6つの面で約12.566 で、球と同じです。',
      miss: '$∯_S$ の◯は「閉じた面」という印で、球だけの記号ではありません。立方体でも、ジャガイモの形の袋でも使います。',
      state: { R: 1, bag: 'sph', yaw: -30, pitch: 20 },
      legend: [['電気力線（14本だけかいた）', { color: 'a' }], ['袋', { color: 'e' }]],
      controls: [{ seg: 'bag', label: '袋', options: [['sph', '球'], ['cube', '立方体']] }, { range: 'R', label: '袋の大きさ $R$', min: 0.5, max: 2, step: 0.05 }],
      drag: A.rotDrag([0, 0, 600, 440]),
      draw: drawKyu,
      readout: st => st.bag === 'sph' ? `球：$\\frac{1}{R^2}\\times4\\pi R^2=4\\pi=12.566$（$R=${A.num(st.R, 2)}$）` : `立方体：6 × ${A.num(cubeFace(st.R), 4)} ＝ ${A.num(6 * cubeFace(st.R), 4)}（$R=${A.num(st.R, 2)}$）`
    }
  ]
});
