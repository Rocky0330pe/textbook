// @id m4-03
// @title ドローンの向き：ロール・ピッチ・ヨー
// @vol 数学7
// @uses 3d
// @from 数学 7-7 図2・4（ch7-07:175・249）、⑨ジンバルロック（ch7-07:413〜447）
'use strict';
const DG = Math.PI / 180;
// 3×3 の行列（行の順に9つ）
const M3 = (a, b) => { const r = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]); return r; };
const ap3 = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2], M[3] * p[0] + M[4] * p[1] + M[5] * p[2], M[6] * p[0] + M[7] * p[1] + M[8] * p[2]];
const Rx = d => { const c = Math.cos(d * DG), s = Math.sin(d * DG); return [1, 0, 0, 0, c, -s, 0, s, c]; };
const Ry = d => { const c = Math.cos(d * DG), s = Math.sin(d * DG); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
const Rz = d => { const c = Math.cos(d * DG), s = Math.sin(d * DG); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
const RPY = (ph, th, ps) => M3(Rz(ps), M3(Ry(th), Rx(ph)));
const n2 = v => A.num(Math.abs(v) < 0.0005 ? 0 : v, 3);
const cl = x => A.clamp(x, 0, 1);

function floor(V, z) {
  for (let k = -2; k <= 2; k++) { V.line3([[k, -2, z], [k, 2, z]], { color: 'grid', width: 1, zbias: -50 }); V.line3([[-2, k, z], [2, k, z]], { color: 'grid', width: 1, zbias: -50 }); }
}
function worldAxes(V, L, nm) {
  nm = nm || ['x（前）', 'y（左）', 'z（上）'];
  [[L, 0, 0, nm[0]], [0, L, 0, nm[1]], [0, 0, L, nm[2]]].forEach(e => { V.arrow3([0, 0, 0], e.slice(0, 3), { color: 'sub', width: 1.5, head: 9, zbias: -3 }); V.text3(e[3], e.slice(0, 3).map(v => v * 1.12), { color: 'sub', size: 15, align: 'center' }); });
}
// ドローン（機体の座標でかいて、R で回す）。機首は +x
function drone(V, R, o = {}) {
  const T = p => ap3(R, p);
  const box = (x0, x1, y0, y1, z0, z1, fill, al) => {
    const P = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(T);
    [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach(f => V.poly3(f.map(i => P[i]), { fill, alpha: al, color: 'ink', width: 1 }));
  };
  box(-0.35, 0.35, -0.22, 0.22, -0.08, 0.08, o.ghost ? 'sub' : 'a', o.ghost ? 0.12 : 0.55);
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    V.line3([T([0, 0, 0]), T([0.62 * sx, 0.62 * sy, 0.02])], { color: 'ink', width: o.ghost ? 1.5 : 4, alpha: o.ghost ? 0.4 : 1 });
    const c = [0.62 * sx, 0.62 * sy, 0.06], ring = [];
    for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * Math.PI; ring.push(T([c[0] + 0.28 * Math.cos(a), c[1] + 0.28 * Math.sin(a), c[2]])); }
    V.poly3(ring, { fill: o.ghost ? 'sub' : (sx > 0 ? 'b' : 'sub'), alpha: o.ghost ? 0.06 : 0.3, color: o.ghost ? 'sub' : 'ink', width: 1 });
  }
  if (!o.ghost) { V.dot3(T([0.42, 0, 0]), { color: 'b', r: 7, zbias: 2 }); }
}
function bodyAxes(V, R, L) {
  const T = p => ap3(R, p);
  V.arrow3([0, 0, 0], T([L, 0, 0]), { color: 'b', width: 3.5, zbias: 1 });
  V.arrow3([0, 0, 0], T([0, L * 0.85, 0]), { color: 'c', width: 3.5, style: 'dash', zbias: 1 });
  V.arrow3([0, 0, 0], T([0, 0, L * 0.85]), { color: 'd', width: 3.5, style: 'dot', zbias: 1 });
  V.text3('前', T([L * 1.12, 0, 0]), { color: 'b', size: 16, bold: true, align: 'center' });
  V.text3('左', T([0, L * 0.98, 0]), { color: 'c', size: 16, bold: true, align: 'center' });
  V.text3('上', T([0, 0, L * 0.98]), { color: 'd', size: 16, bold: true, align: 'center' });
}
function matText(cv, x, y, R, title) {
  cv.text(title, x, y, { size: 15, color: 'sub' });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cv.text(n2(R[3 * i + j]), x + 40 + j * 72, y + 30 + i * 26, { size: 15, align: 'center', color: j === 0 ? 'b' : 'ink', bold: j === 0 });
  cv.line([[x + 8, y + 16], [x + 2, y + 16], [x + 2, y + 96], [x + 8, y + 96]], { color: 'ink', width: 1.5 });
  cv.line([[x + 212, y + 16], [x + 218, y + 16], [x + 218, y + 96], [x + 212, y + 96]], { color: 'ink', width: 1.5 });
  cv.text('1列め＝機首の向き', x, y + 116, { size: 14, color: 'b' });
}

function drawRpy(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 125, center: [0, 0, 0.1] });
  floor(V, -0.9); worldAxes(V, 1.7);
  const R = RPY(st.ph, st.th, st.ps);
  drone(V, R); bodyAxes(V, R, 1.15);
  V.flush();
  matText(cv, 620, 30, R, 'R ＝ Rz(ψ) Ry(θ) Rx(φ)');
  cv.text('ロール φ：前の軸のまわり', 620, 196, { size: 14 });
  cv.text('ピッチ θ：左の軸のまわり', 620, 220, { size: 14 });
  cv.text('（＋は機首が下がる向き）', 640, 242, { size: 14, color: 'sub' });
  cv.text('ヨー ψ：上の軸のまわり', 620, 266, { size: 14 });
  cv.text('（＋は左を向く向き）', 640, 288, { size: 14, color: 'sub' });
  cv.text('図はドラッグで回せます', 620, 410, { size: 14, color: 'sub' });
}

// スマホ：上のはし（+x のはし）と画面の向き（+z）
function phone(V, R, label) {
  const T = p => ap3(R, p);
  const P = [[-0.8, -0.4, -0.05], [0.8, -0.4, -0.05], [0.8, 0.4, -0.05], [-0.8, 0.4, -0.05], [-0.8, -0.4, 0.05], [0.8, -0.4, 0.05], [0.8, 0.4, 0.05], [-0.8, 0.4, 0.05]].map(T);
  [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach((f, k) => V.poly3(f.map(i => P[i]), { fill: k === 1 ? 'a' : 'sub', alpha: k === 1 ? 0.45 : 0.2, color: 'ink', width: 1 }));
  V.line3([T([0.82, -0.4, 0.06]), T([0.82, 0.4, 0.06])], { color: 'd', width: 6, zbias: 1 });
  V.arrow3(T([0, 0, 0.06]), T([0, 0, 0.95]), { color: 'b', width: 3.5, zbias: 1 });
  V.text3(label, [0, 0, -1.25], { size: 17, bold: true, align: 'center' });
}
const ORDERS = [
  { name: '① まず x 軸で90°、つぎに z 軸で90°', R: t => t <= 1 ? Rx(90 * t) : M3(Rz(90 * (t - 1)), Rx(90)), res: '上のはし→奥（y）、画面→右（x）' },
  { name: '② まず z 軸で90°、つぎに x 軸で90°', R: t => t <= 1 ? Rz(90 * t) : M3(Rx(90 * (t - 1)), Rz(90)), res: '上のはし→上（z）、画面→手前（−y）' }
];
function drawJunban(cv, st) {
  ORDERS.forEach((o, k) => {
    const V = new A.View3(cv, { box: [k * 440, 30, 440, 390], yaw: st.yaw, pitch: st.pitch, scale: 95, center: [0, 0, 0] });
    for (let i = -1; i <= 1; i++) { V.line3([[i * 1.2, -1.2, -1], [i * 1.2, 1.2, -1]], { color: 'grid', width: 1, zbias: -50 }); V.line3([[-1.2, i * 1.2, -1], [1.2, i * 1.2, -1]], { color: 'grid', width: 1, zbias: -50 }); }
    worldAxes(V, 1.5, ['x（右）', 'y（奥）', 'z（上）']);
    phone(V, o.R(st.t), st.t >= 2 ? o.res : '');
    V.flush();
    cv.text(o.name, k * 440 + 220, 20, { size: 15, bold: true, align: 'center' });
    const now = st.t < 1 ? (k ? 'z 軸で回している' : 'x 軸で回している') : st.t < 2 ? (k ? 'x 軸で回している' : 'z 軸で回している') : '';
    cv.text(now, k * 440 + 220, 44, { size: 14, color: 'sub', align: 'center' });
  });
  cv.line([[440, 60], [440, 420]], { color: 'line', width: 1 });
}

function drawGimbal(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 120, center: [0, 0, 0.2] });
  floor(V, -0.9);
  const R = RPY(st.ph, st.th, st.ps);
  // ヨーの軸（地面の上下）とロールの軸（機首の軸）
  V.line3([[0, 0, -0.9], [0, 0, 1.9]], { color: 'a', width: 3, style: 'long', zbias: 2 });
  V.text3('ヨーの軸', [0.15, -0.1, 1.95], { color: 'a', size: 15, bold: true });
  const nose = ap3(R, [1, 0, 0]);
  V.line3([nose.map(v => -0.9 * v), nose.map(v => 1.7 * v)], { color: 'b', width: 3, style: 'dash', zbias: 2.5 });
  V.text3('ロールの軸', nose.map((v, i) => 1.8 * v + (i === 0 ? 0.25 : 0)), { color: 'b', size: 15, bold: true });
  drone(V, R);
  V.flush();
  const ang = Math.acos(A.clamp(nose[2], -1, 1)) / DG;
  matText(cv, 620, 30, R, 'R の9つの成分');
  cv.text('2本の軸のあいだの角', 620, 200, { size: 15, color: 'sub' });
  cv.text(A.num(ang, 1) + '°', 620, 230, { size: 22, bold: true, color: ang < 0.5 ? 'd' : 'ink' });
  cv.text(ang < 0.5 ? '重なった：ジンバルロック' : '', 620, 262, { size: 16, bold: true, color: 'd' });
  cv.text('ψ ＋ φ ＝ ' + A.num(st.ps + st.ph, 0) + '°', 620, 300, { size: 16 });
  cv.text('図はドラッグで回せます', 620, 410, { size: 14, color: 'sub' });
}

A.item({
  id: 'm4-03', title: 'ドローンの向き：ロール・ピッチ・ヨー',
  from: '数学 第7巻 7-7「3次元の回転」の図から（7-11③、物理 力-6・7 でも使う）',
  W: 880, H: 440,
  state: { yaw: -35, pitch: 22, ph: 0, th: 0, ps: 0, t: 0 },
  scenes: [
    {
      key: 'rpy', label: '① ロール・ピッチ・ヨー',
      lead: 'ドローンを、ロール → ピッチ → ヨーの順に回します。▶ で動かし、3つのスライダーでも変えてみましょう。',
      note: '向きの行列は $R=R_z(\\psi)R_y(\\theta)R_x(\\phi)$ です。右の $R_x$ が先にはたらくので、動かない地面の軸のまわりに「ロール→ピッチ→ヨー」と回したのと同じ向きになります。機首の向きは $R$ の1列め $(\\cos\\psi\\cos\\theta,\\ \\sin\\psi\\cos\\theta,\\ -\\sin\\theta)$ で、**ロールには関係しません**。',
      miss: 'この本の軸（$y$ が左、$z$ が上）では、ピッチの＋は**機首が下がる**向きです。機首を上げるときは、ピッチは負の角になります。',
      legend: [['機体の前（機首、ロールの軸）', { color: 'b' }], ['機体の左（ピッチの軸）', { color: 'c', style: 'dash' }], ['機体の上（ヨーの軸）', { color: 'd', style: 'dot' }], ['地面の軸', { color: 'sub' }]],
      controls: [{ range: 'ph', label: 'ロール $\\phi$', min: -180, max: 180, step: 1, fmt: v => Math.round(v) + '°' }, { range: 'th', label: 'ピッチ $\\theta$', min: -90, max: 90, step: 1, fmt: v => Math.round(v) + '°' }, { range: 'ps', label: 'ヨー $\\psi$', min: -180, max: 180, step: 1, fmt: v => Math.round(v) + '°' }],
      step(st, dt) { st.t = Math.min(3, st.t + dt * 0.5); st.ph = 30 * cl(st.t); st.th = -30 * cl(st.t - 1); st.ps = 45 * cl(st.t - 2); if (st.t >= 3) { st.t = 0; return false; } },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw: drawRpy,
      readout: st => { const n = ap3(RPY(st.ph, st.th, st.ps), [1, 0, 0]); return `機首の向き $(${n2(n[0])},\\ ${n2(n[1])},\\ ${n2(n[2])})$　（ロール ${A.num(st.ph, 0)}°・ピッチ ${A.num(st.th, 0)}°・ヨー ${A.num(st.ps, 0)}°）`; }
    },
    {
      key: 'junban', label: '② 順番を入れかえる',
      lead: '同じ2つの回転（$x$ 軸で90°、$z$ 軸で90°）を、順番だけ変えてスマホを回します。▶ で、左右をくらべましょう。',
      note: '①は $R_z(90°)R_x(90°)$、②は $R_x(90°)R_z(90°)$ です（先にはたらく行列を右に書く）。空間では、回す軸がちがう回転をつなぐと、**順番で結果が変わります**。平面の回転は、軸がいつも同じなので、順番を変えても同じでした。',
      miss: '2つめの回転は、たおしたスマホの軸ではなく、**動かない**（地面にかいた）軸のまわりに回します。',
      state: { t: 0, yaw: -35, pitch: 20 },
      legend: [['上のはし', { color: 'd' }], ['画面の向き', { color: 'b' }], ['動かない軸', { color: 'sub' }]],
      step(st, dt) { st.t = Math.min(2, st.t + dt * 0.45); if (st.t >= 2) return false; },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawJunban,
      readout: st => st.t >= 2 ? '①：上のはし $(0,\\ 1,\\ 0)$、画面 $(1,\\ 0,\\ 0)$　　②：上のはし $(0,\\ 0,\\ 1)$、画面 $(0,\\ -1,\\ 0)$' : '▶ で回します'
    },
    {
      key: 'gimbal', label: '③ ジンバルロック',
      lead: '機首を真上に向けると（ピッチ $-90°$）、何がおこるでしょう。▶ では、機首を上げたあと、ヨーとロールを反対に回します。',
      note: 'ピッチ $-90°$ では、ロールの軸（機首の軸）がヨーの軸（上下の軸）とぴったり重なります。$R$ の中には $\\psi+\\phi$ の形しか出てこないので、ヨー30°・ロール0° とヨー0°・ロール30° は同じ向きです。3つの角があるのに、決められる向きが2つ分になってしまいます。これを**ジンバルロック**といいます。',
      state: { ph: 0, th: 0, ps: 0, t: 0, yaw: -40, pitch: 18 },
      legend: [['ヨーの軸（地面の上下）', { color: 'a', style: 'long' }], ['ロールの軸（機首の軸）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'th', label: 'ピッチ $\\theta$', min: -90, max: 0, step: 1, fmt: v => Math.round(v) + '°' }, { range: 'ps', label: 'ヨー $\\psi$', min: -90, max: 90, step: 1, fmt: v => Math.round(v) + '°' }, { range: 'ph', label: 'ロール $\\phi$', min: -90, max: 90, step: 1, fmt: v => Math.round(v) + '°' }],
      step(st, dt) { st.t = Math.min(3, st.t + dt * 0.4); st.th = -90 * cl(st.t); const u = cl((st.t - 1) / 2); st.ps = 40 * Math.sin(u * Math.PI); st.ph = -st.ps; if (st.t >= 3) { st.t = 0; return false; } },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw: drawGimbal,
      readout: st => `ヨー ${A.num(st.ps, 0)}°、ロール ${A.num(st.ph, 0)}°、ピッチ ${A.num(st.th, 0)}°　${st.th <= -89.5 ? '→ ヨーとロールを反対に回しても、ドローンは動かない（$\\psi+\\phi$ が同じ）' : ''}`
    }
  ]
});
