// @id p2-17
// @title 電流のまわりの磁力線（3次元）
// @vol 物理4
// @uses 3d
// @from 物理 電-6 ②⑤⑥（p4-06:240・366・494）
'use strict';
// 記号は本と同じ：電流 I〔A〕、磁場 B〔T〕、μ₀＝4π×10⁻⁷、半径 a、1 m あたりの巻き数 n
const MU0 = 4 * Math.PI * 1e-7;
const cache = {};   // 磁力線は重いので、巻き数ごとに1回だけ計算する
A.item({
  id: 'p2-17', title: '電流のまわりの磁力線（3次元）',
  from: '物理 第4巻 電-6 ②「電流は磁場をつくる」・⑤「円い電流」・⑥「ソレノイド」の図から',
  W: 880, H: 440,
  state: { yaw: -30, pitch: 18, dir: 1, ph: 0, el: false, I: 5, a: 10, N: 10, I3: 2 },
  scenes: [
    {
      key: 'chokusen', label: '① まっすぐな電流',
      lead: 'まっすぐな導線に電流を流すと、磁力線は導線を囲む円になります。▶ で磁場の向きに印が動きます。図はドラッグで回せます。',
      note: '向きは「電流の向きに進む右ねじを回す向き」（右ねじの法則）。右手の親指を電流の向きに立てて4本の指を曲げると、指の先が磁場の向きです。強さは $B=\\mu_0I/(2\\pi r)$ で、距離が2倍なら半分（$1/r$）です。',
      miss: '右ねじは**電流の向き**に進めます。導線の中の電子は電流と反対向きに流れているので、電子の流れで右ねじを使うと、磁場の向きが逆になってしまいます。「電子の流れも見せる」でたしかめましょう。',
      legend: [['電流 $I$', { color: 'b', width: 4 }], ['磁力線（印は磁場の向き）', { color: 'a', width: 2 }], ['電子の流れ（電流と反対）', { color: 'd', shape: 'circle', style: 'dot' }]],
      controls: [
        { seg: 'dir', label: '電流の向き', options: [[1, '上へ'], [-1, '下へ']] },
        { check: 'el', label: '電子', text: '電子の流れも見せる' },
        { range: 'I', label: '電流 $I$〔A〕', min: 1, max: 10, step: 1, d: 0 }
      ],
      autoplay: true,
      step(st, dt) { st.ph += dt; if (st.ph > 1000) st.ph = 0; },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawStraight,
      readout: st => `導線から 0.10 m で $B=\\mu_0I/(2\\pi r)$ ＝ 2×10⁻⁷ × ${st.I} ÷ 0.10 ＝ <b>${A.num(2e-7 * st.I / 0.1 * 1e6, 0)}×10⁻⁶ T</b>　（0.20 m ではその半分）`
    },
    {
      key: 'en', label: '② 円い電流',
      lead: '円い導線に電流を流したときの磁力線です（円の中心を通る2つの面の上でかいた）。▶ で磁場の向きに印が動きます。',
      note: '導線の近くでは導線を囲む小さな輪、中心では、どの部分の磁場も同じ向きにそろいます。上から見て左回りの電流は、上向きの磁場をつくります（右手の4本の指を電流の向きに曲げると、親指が磁場の向き）。コイルは、上の面が N 極の平たい磁石のようになります。中心の磁場は $B=\\mu_0I/(2a)$ で、半径が2倍なら半分です。',
      legend: [['電流 $I$', { color: 'b', width: 4 }], ['磁力線（印は磁場の向き）', { color: 'a', width: 2 }], ['中心の磁場', { color: 'c', style: 'long', width: 3 }]],
      controls: [
        { seg: 'dir', label: '上から見た電流', options: [[1, '左回り'], [-1, '右回り']] },
        { range: 'a', label: '半径 $a$〔cm〕', min: 5, max: 20, step: 1, d: 0 },
        { range: 'I', label: '電流 $I$〔A〕', min: 1, max: 10, step: 1, d: 0 }
      ],
      autoplay: true,
      step(st, dt) { st.ph += dt; if (st.ph > 1000) st.ph = 0; },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw(cv, st) { drawCoil(cv, st, 1); },
      readout: st => `中心の磁場 $B=\\mu_0I/(2a)$ ＝ 4π×10⁻⁷ × ${st.I} ÷ (2 × ${A.num(st.a / 100, 2)}) ＝ <b>${A.num(MU0 * st.I / (2 * st.a / 100) * 1e6, 1)}×10⁻⁶ T</b>`
    },
    {
      key: 'solenoid', label: '③ ソレノイド',
      lead: '導線をらせんに巻いたソレノイドです。1つ1つの輪の磁場がそろって、中に一様な磁場ができます。▶ で印が動きます。',
      note: '中の磁場は軸に平行で一様、外ではほとんど打ち消し合って、とても弱くなります（長いほど 0 に近い）。中の磁場は $B=\\mu_0nI$（$n$ は 1 m あたりの巻き数）で、つつの太さにはよりません。',
      legend: [['電流 $I$', { color: 'b', width: 3 }], ['磁力線（印は磁場の向き）', { color: 'a', width: 2 }]],
      controls: [
        { seg: 'dir', label: '上から見た電流', options: [[1, '左回り'], [-1, '右回り']] },
        { range: 'N', label: '巻き数（10 cm に）', min: 6, max: 16, step: 1, d: 0 },
        { range: 'I3', label: '電流 $I$〔A〕', min: 1, max: 5, step: 0.5, d: 1 }
      ],
      state: { yaw: -20, pitch: 10 },
      autoplay: true,
      step(st, dt) { st.ph += dt; if (st.ph > 1000) st.ph = 0; },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw(cv, st) { drawCoil(cv, st, st.N); },
      readout: st => { const n = st.N / 0.1; return `$n$ ＝ ${st.N} ÷ 0.10 m ＝ ${A.num(n, 0)} 回/m、中の磁場 $B=\\mu_0nI$ ＝ 4π×10⁻⁷ × ${A.num(n, 0)} × ${A.num(st.I3, 1)} ＝ <b>${A.num(MU0 * n * st.I3 * 1e3, 2)}×10⁻³ T</b>`; }
    }
  ]
});

function V3(cv, st, sc) { return new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: sc || 95, center: [0, 0, 0] }); }
// 動く印：折れ線 pts（3次元）にそって、間かく gap ごとに小さな矢じり
function markers(V, pts, ph, gap, o) {
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  const tot = L[L.length - 1]; if (tot < 1e-6) return;
  const n = Math.max(1, Math.round(tot / gap)), g = tot / n;
  for (let k = 0; k < n; k++) {
    const s = ((k * g + ph * 0.5) % tot + tot) % tot;
    let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const u = (s - L[i - 1]) / Math.max(1e-9, L[i] - L[i - 1]), p = pts[i - 1].map((v, j) => v + (pts[i][j] - v) * u);
    const d = pts[i].map((v, j) => v - pts[i - 1][j]), dl = Math.hypot(...d) || 1, q = p.map((v, j) => v + d[j] / dl * 0.16);
    V.arrow3(p, q, Object.assign({ color: 'a', width: 2.5, head: 12 }, o));
  }
}
function drawStraight(cv, st) {
  const V = V3(cv, st, 95), s = st.dir;
  // 床（xy 平面）の円
  for (let k = -2; k <= 2; k++) { V.line3([[k * 0.8, -1.6, -1.5], [k * 0.8, 1.6, -1.5]], { color: 'grid', width: 1, zbias: -9 }); V.line3([[-1.6, k * 0.8, -1.5], [1.6, k * 0.8, -1.5]], { color: 'grid', width: 1, zbias: -9 }); }
  V.line3([[0, 0, -1.9], [0, 0, 1.9]], { color: 'b', width: 5 });
  V.arrow3([0, 0, -0.2 * s + 1.3], [0, 0, 0.35 * s + 1.3], { color: 'b', width: 5, head: 18 });
  V.text3('I', [0.15, 0, 1.75], { size: 18, bold: true, italic: true, math: true, color: 'b' });
  for (const z of [-0.9, 0, 0.9]) for (const r of [0.45, 0.9, 1.35]) {
    const pts = []; for (let k = 0; k <= 72; k++) { const a = s * k / 72 * 2 * Math.PI; pts.push([r * Math.cos(a), r * Math.sin(a), z]); }
    V.line3(pts, { color: 'a', width: 1.8, alpha: z === 0 ? 1 : 0.55 });
    if (z === 0 || r === 0.9) markers(V, pts, st.ph * (0.9 / r), 1.6 * r, { alpha: z === 0 ? 1 : 0.6 });
  }
  if (st.el) {
    for (let k = 0; k < 7; k++) { const z = ((-st.ph * 0.4 * s + k * 0.55) % 3.8 + 3.8) % 3.8 - 1.9; V.dot3([0.09, 0, z], { color: 'd', r: 5, zbias: 2 }); }
    V.arrow3([0.35, 0, 0.35 * s - 0.6], [0.35, 0, -0.35 * s - 0.6], { color: 'd', width: 2.5, style: 'dot', head: 12 });
    V.text3('電子の流れ', [0.45, 0, -0.6], { size: 15, color: 'd' });
  }
  V.text3('上から見ると ' + (s > 0 ? '左回り' : '右回り'), [1.5, 0, 1.0], { size: 15, color: 'a', bg: true });
  V.flush();
}

// ----- 円い電流・ソレノイド：ビオ・サバールの法則を数でたして、磁力線をたどる -----
function loopsOf(N) { const R = 0.6, len = N === 1 ? 0 : 3.0; const zs = []; for (let k = 0; k < N; k++) zs.push(N === 1 ? 0 : -len / 2 + len * (k + 0.5) / N); return { R, zs }; }
function Bxz(x, z, R, zs) {   // y＝0 の面の上の磁場（μ₀I/4π＝1、上から見て左回りの電流）
  let bx = 0, bz = 0; const M = 48;
  for (const zc of zs) for (let k = 0; k < M; k++) {
    const t = (k + 0.5) * 2 * Math.PI / M, c = Math.cos(t), s = Math.sin(t), dl = 2 * Math.PI * R / M;
    const lx = -s * dl, ly = c * dl, rx = x - R * c, ry = -R * s, rz = z - zc, r3 = Math.pow(rx * rx + ry * ry + rz * rz, 1.5);
    bx += (ly * rz) / r3; bz += (lx * ry - ly * rx) / r3;   // dl × r（dl の z 成分は0）
  }
  return [bx, bz];
}
function traceXZ(x0, z0, R, zs, lim) {
  const h = 0.025, pts = [[x0, z0]];
  const f = p => { const [bx, bz] = Bxz(p[0], p[1], R, zs), b = Math.hypot(bx, bz) || 1; return [bx / b, bz / b]; };
  let p = [x0, z0];
  for (let k = 0; k < 1400; k++) {
    p = A.rk4((t, q) => f(q), 0, p, h); pts.push(p);
    if (Math.abs(p[0]) > lim[0] || Math.abs(p[1]) > lim[1]) break;
    if (k > 20 && Math.hypot(p[0] - x0, p[1] - z0) < h * 0.9) { pts.push([x0, z0]); break; }
    if (zs.some(zc => Math.hypot(Math.abs(p[0]) - R, p[1] - zc) < 0.02)) break;
  }
  return pts;
}
function coilLines(N) {
  if (cache[N]) return cache[N];
  const { R, zs } = loopsOf(N), out = [];
  const starts = N === 1 ? [0.0, 0.15, 0.3, 0.42, 0.51] : [0.0, 0.2, 0.38, 0.5];
  const lim = N === 1 ? [2.3, 2.0] : [2.6, 2.3];
  for (const x0 of starts) out.push(traceXZ(x0, 0, R, zs, lim));
  // 閉じなかった線は、逆向きにもたどってつなぐ
  const res = out.map(a => { const e = a[a.length - 1]; if (Math.hypot(e[0] - a[0][0], e[1] - a[0][1]) < 0.06) return a; const back = traceBack(a[0][0], a[0][1], R, zs, lim); return back.reverse().concat(a.slice(1)); });
  return (cache[N] = res);
}
function traceBack(x0, z0, R, zs, lim) {
  const h = 0.025, pts = [[x0, z0]]; let p = [x0, z0];
  const f = q => { const [bx, bz] = Bxz(q[0], q[1], R, zs), b = Math.hypot(bx, bz) || 1; return [-bx / b, -bz / b]; };
  for (let k = 0; k < 1400; k++) { p = A.rk4((t, q) => f(q), 0, p, h); pts.push(p); if (Math.abs(p[0]) > lim[0] || Math.abs(p[1]) > lim[1]) break; }
  return pts;
}
function drawCoil(cv, st, N) {
  const one = N === 1, V = V3(cv, st, one ? 105 : 88), s = st.dir;
  const { R, zs } = loopsOf(N);
  // 導線
  if (one) {
    const pts = []; for (let k = 0; k <= 96; k++) { const t = k / 96 * 2 * Math.PI; pts.push([R * Math.cos(t), R * Math.sin(t), 0]); }
    V.line3(pts, { color: 'b', width: 4 });
    for (const t0 of [0.6, 2.7, 4.8]) { const t1 = t0 + 0.35 * s; V.arrow3([R * Math.cos(t0), R * Math.sin(t0), 0], [R * Math.cos(t1), R * Math.sin(t1), 0], { color: 'b', width: 4, head: 16 }); }
  } else {
    const turns = N, z0 = zs[0] - 1.5 / N, z1 = zs[zs.length - 1] + 1.5 / N, pts = [];
    for (let k = 0; k <= turns * 48; k++) { const t = k / 48 * 2 * Math.PI; pts.push([R * Math.cos(t), R * Math.sin(t), z0 + (z1 - z0) * k / (turns * 48)]); }
    V.line3(pts, { color: 'b', width: 2.5 });
    for (let j = 0; j < N; j += Math.max(1, Math.floor(N / 4))) { const z = zs[j], t0 = -Math.PI / 2, t1 = t0 + 0.4 * s; V.arrow3([R * Math.cos(t0), R * Math.sin(t0), z], [R * Math.cos(t1), R * Math.sin(t1), z], { color: 'b', width: 3, head: 13 }); }
  }
  // 磁力線：y＝0 の面と、x＝0 の面（回した写し）
  const lines = coilLines(N);
  for (const [rot, al] of [[0, 1], [Math.PI / 2, 0.45]]) for (const sg of [1, -1]) for (const ln of lines) {
    const c = Math.cos(rot), sn = Math.sin(rot);
    let pts = ln.map(([x, z]) => [sg * x * c, sg * x * sn, z]);
    if (s < 0) pts = pts.slice().reverse();
    if (sg < 0 && Math.abs(ln[0][0]) < 1e-6) continue;   // 軸の上の線は1本だけ
    V.line3(pts, { color: 'a', width: 1.8, alpha: al });
    if (al === 1) markers(V, pts, st.ph, 0.9, {});
  }
  if (one) { V.arrow3([0, 0, 0], [0, 0, 0.9 * s], { color: 'c', width: 4, style: 'long', head: 16, zbias: 3 }); V.text3('B', [0.12, 0, 0.95 * s], { size: 18, bold: true, italic: true, math: true, color: 'c' }); }
  V.text3(s > 0 ? 'N' : 'S', [0, 0, one ? 1.25 : 2.0], { size: 18, bold: true, color: 'ink', align: 'center' });
  V.text3(s > 0 ? 'S' : 'N', [0, 0, one ? -1.25 : -2.0], { size: 18, bold: true, color: 'ink', align: 'center' });
  V.flush();
}
