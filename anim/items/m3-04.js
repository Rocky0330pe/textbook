// @id m3-04
// @title 歯車と合成関数の微分
// @vol 数学5
// @from 数学 5-6 はてな（ch5-06:22〜50 の歯車）・⑤（ch5-06:290〜301 の数直線）／5-15、物理 力 でも使う
'use strict';
// はてな：歯 A 48まい・B 16まい・C 8まい。A が 1 回転 → B 3 回転 → C 6 回転
// ⑤：y=(3x+1)²、u=3x+1。x=1 から Δx=0.01：Δu=0.03、Δy=0.2409、Δy/Δx=24.09（→ 24＝8×3）
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const sh = v => String(Number(v.toPrecision(5))).replace('-', '−');
const TEETH = { A: 48, B: 16, C: 8 }, MOD = 5.6;
const GC = (() => { const rA = MOD * 24, rB = MOD * 8, rC = MOD * 4, ax = 175, y = 222; return { A: [ax, y, rA], B: [ax + rA + rB, y, rB], C: [ax + rA + 2 * rB + rC, y, rC] }; })();

A.item({
  id: 'm3-04', title: '歯車と合成関数の微分',
  from: '数学 第5巻 5-6「積と合成関数」のはてな？と ⑤ の図から（5-15、物理 力 でも使う）',
  W: 880, H: 440,
  state: { ang: 0, w: 0.15, t: 0 },
  scenes: [
    {
      key: 'haguruma', label: '① 歯車 A・B・C',
      lead: '歯車 A（歯 48 まい）を回すと、B（16 まい）と C（8 まい）はどれだけ回るでしょう。▶ で A を 1 回転させます。',
      note: 'A が 1 回転するあいだに B は 3 回転、その B が 1 回転するごとに C は 2 回転するので、C は $3\\times2=6$ 回転です。回る速さの比は**かけ算でつながります**。これが合成関数の微分 $\\frac{dy}{dx}=\\frac{dy}{du}\\times\\frac{du}{dx}$ と同じしくみです。',
      legend: [['A（歯 48 まい）の印', { color: 'a', shape: 'circle' }], ['B（歯 16 まい）の印', { color: 'b', shape: 'square' }], ['C（歯 8 まい）の印', { color: 'c', shape: 'tri' }]],
      controls: [{ range: 'w', label: 'A の回る速さ（回転/秒）', min: 0.05, max: 0.5, step: 0.01 }, { range: 'ang', label: 'A の回った角', min: 0, max: 2 * Math.PI, step: 0.01, fmt: v => Math.round(v * 180 / Math.PI) + '°' }],
      step(st, dt) { st.ang = Math.min(2 * Math.PI, st.ang + 2 * Math.PI * st.w * dt); if (st.ang >= 2 * Math.PI) return false; },
      draw(cv, st) { drawGears(cv, st); },
      readout: st => { const n = st.ang / (2 * Math.PI); return `A ${sh(n)} 回転 → B ${sh(3 * n)} 回転 → C ${sh(6 * n)} 回転`; }
    },
    {
      key: 'kusari', label: '② 数直線で小さな変化',
      lead: '$y=(3x+1)^2$ を、$u=3x+1$ と $y=u^2$ の 2 つに分けます。$x$ を少しだけ変えたとき、$u$ と $y$ はどれだけ変わるでしょう。3 本とも、同じ拡大のしかたでかいています。',
      note: '$u=3x+1$ は、$x$ が変わった分の 3 倍だけ変わります。$y=u^2$ は、$u=4$ のあたりでは $u$ が変わった分のおよそ $2u=8$ 倍。だから $y$ は $x$ の変化のおよそ $8\\times3=24$ 倍変わります（$\\Delta x=0.01$ で $\\frac{\\Delta y}{\\Delta x}=24.09$）。',
      miss: '外側を微分した $2u$ のままで終わらせない。$u$ を $x$ の式にもどして、$\\frac{dy}{dx}=2u\\times3=6(3x+1)$ と書きます。',
      state: { dx: 0.01, x0: 1 },
      legend: [['$x$ の変化 $\\Delta x$（いちばん上）', { color: 'a' }], ['$u$ の変化 $\\Delta u$（まん中）', { color: 'c' }], ['$y$ の変化 $\\Delta y$（いちばん下）', { color: 'b' }]],
      controls: [{ range: 'ldx', label: '$\\Delta x$', min: -3, max: -1, step: 0.01, fmt: v => sh(Math.pow(10, v)), on: st => { st.dx = Math.pow(10, st.ldx); } }, { range: 'x0', label: 'はじめの $x$', min: 0, max: 2, step: 0.1, d: 1 }],
      init(st) { st.ldx = -2; st.dx = 0.01; },
      step(st, dt) {
        st.t += dt; const L = [-1, -2, -3], seg = Math.floor(st.t / 2);
        if (seg >= L.length - 1) { st.ldx = -3; st.dx = 0.001; return false; }
        st.ldx = L[seg] + (L[seg + 1] - L[seg]) * ease((st.t - seg * 2) / 1); st.dx = Math.pow(10, st.ldx);
      },
      draw(cv, st) { drawLines(cv, st); },
      readout: st => { const x = st.x0, u = 3 * x + 1, du = 3 * st.dx, dy = (u + du) ** 2 - u * u; return `$\\frac{\\Delta u}{\\Delta x}$ ＝ 3、$\\frac{\\Delta y}{\\Delta u}$ ＝ ${sh(dy / du)}、$\\frac{\\Delta y}{\\Delta x}$ ＝ <b>${sh(dy / st.dx)}</b>（近づく先は $2u\\times3$ ＝ ${sh(6 * u)}）`; }
    }
  ]
});

function gearPts(cx, cy, N, rot) {
  const r = MOD * N / 2, ro = r + MOD, rr = r - 1.25 * MOD, p = 2 * Math.PI / N, pts = [];
  for (let k = 0; k < N; k++) {
    const c = rot + k * p;
    for (const [rad, f] of [[rr, -0.5], [rr, -0.3], [ro, -0.14], [ro, 0.14], [rr, 0.3]]) pts.push([cx + rad * Math.cos(c + f * p), cy - rad * Math.sin(c + f * p)]);
  }
  return pts;
}
function drawGear(cv, key, rot, col, shape, sty) {
  const [cx, cy, r] = GC[key], N = TEETH[key];
  cv.poly(gearPts(cx, cy, N, rot), { fill: col, alpha: 0.18, color: col, width: 2, style: sty });
  cv.circle(cx, cy, Math.max(4, r * 0.18), { color: col, width: 2 });
  const ex = cx + (r - 1.6 * MOD) * Math.cos(rot), ey = cy - (r - 1.6 * MOD) * Math.sin(rot);
  cv.line([[cx, cy], [ex, ey]], { color: col, width: 3 });
  cv.dot(ex, ey, { color: col, shape, r: key === 'C' ? 5 : 7 });
}
function drawGears(cv, st) {
  const phi = st.ang, pB = 2 * Math.PI / 16;
  // 本の図と同じく A は右回り（となりどうしは逆向き）
  drawGear(cv, 'A', -phi, 'a', 'circle', 'solid');
  drawGear(cv, 'B', Math.PI + pB / 2 + 3 * phi, 'b', 'square', 'solid');
  drawGear(cv, 'C', -6 * phi, 'c', 'tri', 'solid');
  // 回る向きの矢印と名前
  const arc = (key, r, a0, a1) => { const [cx, cy] = GC[key], pts = []; for (let k = 0; k <= 16; k++) { const a = a0 + (a1 - a0) * k / 16; pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]); } cv.line(pts, { color: 'ink', width: 2 }); const q = pts[16], q2 = pts[15]; cv.arrow(q2[0], q2[1], q[0], q[1], { color: 'ink', width: 2, head: 11 }); };
  arc('A', GC.A[2] * 0.62, 2.3, 1.0);
  arc('B', GC.B[2] + 18, 1.2, 2.0);
  arc('C', GC.C[2] + 16, 1.4, -1.0);
  cv.text('A　歯 48 まい', GC.A[0], GC.A[1] + GC.A[2] + 26, { align: 'center', size: 16, bold: true });
  cv.text('B　歯 16 まい', GC.B[0], GC.B[1] + GC.B[2] + 30, { align: 'center', size: 16, bold: true });
  cv.text('C', GC.C[0] + 6, GC.C[1] - GC.C[2] - 30, { align: 'center', size: 16, bold: true });
  cv.text('歯 8 まい', GC.C[0] + 6, GC.C[1] - GC.C[2] - 52, { align: 'center', size: 15 });
  // 右：回転の数
  const L = 520, n = phi / (2 * Math.PI);
  cv.text('回った数', L, 40, { size: 16, bold: true });
  [['A', n, 'a', 'circle', 1], ['B', 3 * n, 'b', 'square', 3], ['C', 6 * n, 'c', 'tri', 6]].forEach(([k, v, c, shp], i) => {
    const y = 90 + i * 70;
    cv.dot(L + 8, y, { color: c, shape: shp, r: 7 });
    cv.text(k, L + 22, y, { size: 16, bold: true });
    cv.rect(L + 46, y - 11, 300, 22, { color: 'line', width: 1 });
    cv.rect(L + 46, y - 11, 300 * v / 6, 22, { fill: c, alpha: 0.45, color: c, width: 1.5 });
    for (let j = 1; j < 6; j++) cv.line([[L + 46 + 50 * j, y - 11], [L + 46 + 50 * j, y + 11]], { color: 'line', width: 1 });
    cv.text(sh(Math.round(v * 100) / 100) + ' 回転', L + 46, y + 26, { size: 15 });
  });
  cv.text('A → B：3 倍、B → C：2 倍', L, 320, { size: 16 });
  cv.text('A → C：3 × 2 ＝ 6 倍', L, 352, { size: 17, bold: true, color: 'b' });
}

function drawLines(cv, st) {
  const x = st.x0, dx = st.dx, u = 3 * x + 1, du = 3 * dx, y = u * u, dy = (u + du) ** 2 - y;
  const L = 150, K = 600 / dy;   // 3本とも同じ拡大（1 あたり K px）
  const rows = [['x', x, dx, 'a', 'solid', `${sh(x)} から ${sh(x + dx)} まで：Δx ＝ ${sh(dx)}`],
    ['u', u, du, 'c', 'dash', `${sh(u)} から ${sh(u + du)} まで：Δu ＝ ${sh(du)}（Δx の 3 倍）`],
    ['y', y, dy, 'b', 'long', `${sh(y)} から ${sh(y + dy)} まで：Δy ＝ ${sh(dy)}（Δu の約 ${sh(Math.round(dy / du * 100) / 100)} 倍）`]];
  rows.forEach(([nm, v0, d, col, sty, txt], i) => {
    const Y = 90 + i * 115;
    cv.arrow(L - 20, Y, 850, Y, { color: 'sub', width: 1.5, head: 10 });
    cv.text(nm, L - 40, Y, { size: 20, italic: true, math: true, align: 'right', bold: true });
    cv.line([[L, Y], [L + d * K, Y]], { color: col, width: 9 });
    cv.line([[L, Y - 9], [L, Y + 9]], { color: 'ink', width: 2 });
    cv.line([[L + d * K, Y - 9], [L + d * K, Y + 9]], { color: 'ink', width: 2 });
    cv.text(txt, L, Y - 26, { size: 16 });
  });
  cv.text('3 本とも同じ倍率で拡大してかいた（線の長さが変化の大きさ）', L, 410, { size: 14, color: 'sub' });
}
