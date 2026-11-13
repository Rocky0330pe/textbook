// @id p2-30
// @title 電子の雲を回す：1s・2s・2p と結合
// @vol 物理5
// @uses 3d
// @from 物理 原-7 ②③⑪（p5-07 水素原子の電子の雲・動径分布・結合と反結合）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ：長さはボーア半径 a₀（52.9 pm）を単位にする。|ψ|² は 1s：e^{−2r}、2s：(2−r)²e^{−r}、2p：z²e^{−r}（本の cloud.py と同じ）。
// 本の図の範囲 1s は ±4a₀、2s・2p は ±13a₀、うすい板の厚さ ±0.5a₀・±1.5a₀。E_n＝−13.6/n² eV。
// 1s の動径分布 P(r)＝4r²e^{−2r}（山は r＝a₀、平均 1.5a₀、a₀ より内側 0.32、3a₀ より内側 0.94）。乱数は A.rng で種を決める。
const NMAX = 3000;
const ORB = {
  '1s': { L: 4, slab: 0.5, d: (x, y, z, r) => Math.exp(-2 * r), P: r => 4 * r * r * Math.exp(-2 * r), n: 1 },
  '2s': { L: 13, slab: 1.5, d: (x, y, z, r) => (2 - r) ** 2 * Math.exp(-r), P: r => r * r * (2 - r) ** 2 * Math.exp(-r) / 8, n: 2 },
  '2p': { L: 13, slab: 1.5, d: (x, y, z, r) => z * z * Math.exp(-r), P: r => r ** 4 * Math.exp(-r) / 24, n: 2 }
};
function genOrb(st) {
  const o = ORB[st.orb], r = A.rng(7 + st.orb.charCodeAt(1)), L = o.L;
  // はねのけ法（本と同じ）：立方体の中で一様に選び、|ψ|² に比例する確率で残す
  let dm = 0; for (let i = 0; i < 20000; i++) { const x = (2 * r() - 1) * L, y = (2 * r() - 1) * L, z = (2 * r() - 1) * L; dm = Math.max(dm, o.d(x, y, z, Math.hypot(x, y, z))); }
  dm *= 1.05;
  const P = new Float32Array(NMAX * 3);
  for (let i = 0; i < NMAX;) { const x = (2 * r() - 1) * L, y = (2 * r() - 1) * L, z = (2 * r() - 1) * L; if (r() * dm < o.d(x, y, z, Math.hypot(x, y, z))) { P[3 * i] = x; P[3 * i + 1] = y; P[3 * i + 2] = z; i++; } }
  st.pts = P; st.pk = st.orb;
}
function genBond(st) {
  const r = A.rng(11), h = st.R / 2, sg = st.bond === 'anti' ? -1 : 1, P = new Float32Array(NMAX * 3);
  const one = () => { const rr = -0.5 * Math.log(r() * r() * r() + 1e-12), c = 2 * r() - 1, s = Math.sqrt(1 - c * c), ph = A.TAU * r(); return [rr * s * Math.cos(ph), rr * s * Math.sin(ph), rr * c]; };
  for (let i = 0; i < NMAX;) {
    const p = one(), cx = r() < 0.5 ? -h : h, x = p[0] + cx, y = p[1], z = p[2];
    const ea = Math.exp(-Math.hypot(x + h, y, z)), eb = Math.exp(-Math.hypot(x - h, y, z));
    if (r() * 2 * (ea * ea + eb * eb) < (ea + sg * eb) ** 2) { P[3 * i] = x; P[3 * i + 1] = y; P[3 * i + 2] = z; i++; }
  }
  st.pts = P; st.pk = 'b' + st.R + st.bond;
}
const ensureOrb = st => { if (st.pk !== st.orb) genOrb(st); };
const ensureBond = st => { if (st.pk !== 'b' + st.R + st.bond) genBond(st); };
const grow = (st, dt) => { if (st.n >= NMAX) return false; st.n = Math.min(NMAX, st.n + dt * (15 + 0.9 * st.n)); };
const orbSeg = { seg: 'orb', label: '雲', options: [['1s', '1s'], ['2s', '2s'], ['2p', '2p（たて）']], on: st => { st.n = st.full ? NMAX : 0; } };

A.item({
  id: 'p2-30', title: '電子の雲を回す：1s・2s・2p と結合',
  from: '物理 第5巻 原-7 ②③⑪ の図から（水素原子の電子の雲・1s の動径分布・結合と反結合）',
  W: 880, H: 440,
  state: { yaw: -30, pitch: 18, orb: '1s', n: 0, slab: false, R: 2, bond: 'bond' },
  scenes: [
    {
      key: 'kumo', label: '① 雲を回す',
      lead: '電子が見つかる場所を、1回ずつ点で打ちます。▶ で点が増えます。図はドラッグで回せます。',
      note: '点1つが、1回の測定で電子が見つかった場所です。$1s$ は、ふちのぼやけた丸い雲です。$2s$ の雲の中には、電子が見つからない球面（節）があり、$2p$ は、まん中を通る横の面の上には電子が見つかりません。雲は3次元の形です。「うすい板だけ」にすると、本の図（原子核を通るうすい板の中の点）と同じになります。',
      legend: [['電子が見つかった所（点1つが1回）', { color: 'a', shape: 'circle', noline: true }], ['原子核', { color: 'b', shape: 'square', noline: true }], ['目もり', { color: 'ink' }]],
      controls: [orbSeg, { check: 'slab', label: '見せ方', text: 'うすい板だけ（本の図）' }],
      init(st) { st.n = 0; st.full = false; ensureOrb(st); },
      step(st, dt) { ensureOrb(st); return grow(st, dt); },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawCloud,
      readout: st => { const o = ORB[st.orb]; return `${st.orb}：$E_${o.n}$ ＝ −13.6 ÷ ${o.n}² ＝ <b>${A.num(-13.6 / o.n / o.n, 2)} eV</b>${GAP}点の数 ${Math.floor(st.n)}${st.slab ? '（うすい板の中だけ表示）' : ''}`; }
    },
    {
      key: 'kyori', label: '② 見つかりやすい距離',
      lead: '原子核からの距離ごとに、見つかった数を数えます。いちばん多いのは、どの距離でしょう。',
      note: '$|\\psi|^2$ は原子核の所がいちばん大きいのに、距離で数えると、いちばん多いのは $r=a_0$ です。半径 $r$・厚さ $\\Delta r$ の球の殻の体積 $4\\pi r^2\\Delta r$ が、原子核の近くでは小さいからです。$1s$ の距離の平均は $1.5a_0$、$a_0$ より内側にいる確率は約0.32、$3a_0$ より内側は約94 % です。',
      miss: '「K 殻の電子は、半径 53 pm の円の上を、決まった速さで回っている」はまちがいです。電子はふちのぼやけた雲のように広がっていて、53 pm（$a_0$）は、いちばん見つかりやすい距離です。',
      legend: [['動径分布 $P(r)$', { color: 'a' }], ['$|\\psi|^2$（$r$＝0 の値を1とした）', { color: 'b', style: 'dash' }], ['見つかった数（距離ごと）', { color: 'sub', shape: 'square', noline: true }], ['1s：ボーアの円（半径 $a_0$）／2s：節／2p：山', { color: 'c', style: 'dot' }]],
      state: { orb: '1s', full: true },
      controls: [orbSeg],
      init(st) { st.n = NMAX; st.full = true; ensureOrb(st); },
      draw: drawRadial,
      readout: st => st.orb === '1s' ? 'いちばん見つかりやすい距離 $r=a_0$（52.9 pm）' + GAP + '平均 $1.5a_0$' + GAP + '$a_0$ より内側 約0.32' : st.orb === '2s' ? '$2s$：山は2つ（約 $0.76a_0$ と約 $5.2a_0$）、$r=2a_0$ で0（節の球面）' : '$2p$：いちばん見つかりやすい距離 $r=4a_0$'
    },
    {
      key: 'ketsugo', label: '③ 結合と反結合',
      lead: '2つの陽子 A・B のそれぞれの $1s$ の波を、同じ向きにたすか、反対向きにたすかで、雲はどう変わるでしょう。',
      note: '同じ向きにたす（$\\psi_{\\mathrm A}+\\psi_{\\mathrm B}$）と、2つの陽子の**あいだ**にも電子が多くいて、両方の陽子を引きつけ、2つをつなぎとめます（結合）。反対向きにたす（$\\psi_{\\mathrm A}-\\psi_{\\mathrm B}$）と、まん中に節の面ができ、陽子のあいだに電子がいなくなります（反結合）。',
      legend: [['電子が見つかった所', { color: 'a', shape: 'circle', noline: true }], ['陽子 A・B', { color: 'b', shape: 'square', noline: true }], ['線の上の $\\psi$（右下）', { color: 'a' }], ['それぞれの $1s$ の波', { color: 'sub', style: 'dot' }]],
      state: { yaw: -20, pitch: 15 },
      controls: [{ seg: 'bond', label: 'たし方', options: [['bond', '同じ向き（結合）'], ['anti', '反対向き（反結合）']], on: st => { st.n = NMAX; } }, { range: 'R', label: '陽子の間の距離（$a_0$）', min: 1, max: 5, step: 0.5, d: 1, on: st => { st.n = NMAX; } }],
      init(st) { st.n = NMAX; ensureBond(st); },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawBond,
      readout: st => `${st.bond === 'bond' ? '結合：陽子のあいだにも電子が多い' : '反結合：まん中の面（A と B の真ん中）に電子がいない'}${GAP}陽子の間 ${A.num(st.R, 1)}$a_0$ ＝ ${Math.round(st.R * 52.9)} pm`
    }
  ]
});

function scaleBar(cv, x, y, px, lab) { cv.line([[x, y], [x + px, y]], { color: 'ink', width: 2 }); cv.line([[x, y - 5], [x, y + 5]], { color: 'ink', width: 2 }); cv.line([[x + px, y - 5], [x + px, y + 5]], { color: 'ink', width: 2 }); cv.text(lab, x + px / 2, y + 16, { align: 'center', size: 15 }); }

function drawCloud(cv, st) {
  ensureOrb(st);
  const o = ORB[st.orb], sc = 190 / o.L;
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: sc, persp: 0 });
  V.axes3({ len: o.L * 1.05 });
  const n = Math.floor(st.n), rad = n > 1500 ? 1.6 : n > 400 ? 2.2 : 3;
  for (let i = 0; i < n; i++) {
    const x = st.pts[3 * i], y = st.pts[3 * i + 1], z = st.pts[3 * i + 2];
    if (st.slab && Math.abs(y) > o.slab) continue;
    V.dot3([x, y, z], { color: 'a', r: rad });
  }
  V.dot3([0, 0, 0], { color: 'b', shape: 'square', r: 5, zbias: 1e5 });
  V.flush();
  const L4 = st.orb === '1s' ? 4 : 13;
  scaleBar(cv, 40, 405, L4 * sc, (st.orb === '1s' ? '4' : '13') + 'a₀（' + Math.round(L4 * 52.9) + ' pm）');
  cv.text(st.orb + '（' + (st.orb === '2p' ? 'z の向きに長い' : '丸い') + '）', 860, 30, { align: 'right', size: 17, bold: true });
  if (st.orb === '2s') cv.text('節の球面：r ＝ 2a₀', 860, 54, { align: 'right', size: 15, color: 'sub' });
  if (st.orb === '2p') cv.text('横の面（z＝0）には見つからない', 860, 54, { align: 'right', size: 15, color: 'sub' });
}

function drawRadial(cv, st) {
  ensureOrb(st);
  const o = ORB[st.orb], R = st.orb === '1s' ? 6.3 : 20;
  // 左：うすい板の中の点と、ボーアの円
  const s = 170 / (st.orb === '1s' ? 4 : 13), cx = 190, cy = 215;
  cv.rect(cx - 175, cy - 175, 350, 350, { fill: 'sub', alpha: 0.05, color: 'grid', width: 1 });
  for (let i = 0; i < NMAX; i++) { const x = st.pts[3 * i], y = st.pts[3 * i + 1], z = st.pts[3 * i + 2]; if (Math.abs(y) > o.slab) continue; const px = cx + x * s, py = cy - z * s; if (Math.abs(px - cx) < 175 && Math.abs(py - cy) < 175) cv.dot(px, py, { color: 'a', r: 1.8 }); }
  cv.circle(cx, cy, s * (st.orb === '1s' ? 1 : st.orb === '2s' ? 2 : 4), { color: 'c', width: 2, style: 'dot' });
  cv.dot(cx, cy, { color: 'b', shape: 'square', r: 4 });
  cv.text(st.orb === '1s' ? 'ボーアの円（a₀）' : st.orb === '2s' ? '節の球面（2a₀）' : '山の距離（4a₀）', cx, cy - 175 + 14, { align: 'center', size: 14, color: 'c', bg: true });
  cv.text('うすい板の中の点', cx, 412, { align: 'center', size: 14, color: 'sub' });
  // 右：距離ごとの数と P(r)
  const v = cv.view({ x0: 0, x1: R, y0: 0, y1: 1.15, box: [420, 30, 430, 330] });
  const nb = 30, bw = R / nb, h = new Array(nb).fill(0);
  for (let i = 0; i < NMAX; i++) { const r = Math.hypot(st.pts[3 * i], st.pts[3 * i + 1], st.pts[3 * i + 2]); const b = Math.floor(r / bw); if (b < nb) h[b]++; }
  let pm = 0; for (let k = 0; k < 400; k++) pm = Math.max(pm, o.P(R * k / 400));
  const toY = c => c / (NMAX * bw) / pm;         // 数 → P(r)/最大値 の目もり
  for (let k = 0; k < nb; k++) if (h[k]) v.poly([[k * bw + bw * 0.08, 0], [(k + 1) * bw - bw * 0.08, 0], [(k + 1) * bw - bw * 0.08, toY(h[k])], [k * bw + bw * 0.08, toY(h[k])]], { fill: 'sub', alpha: 0.35 });
  const xt = st.orb === '1s' ? [1, 2, 3, 4, 5, 6] : [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  v.axes({ xt, yt: [0.5, 1], xl: 'r（a₀）', yl: 'P(r)（山を1）', xfmt: x => A.num(x, 0), grid: false });
  v.plot(r => o.P(r) / pm, { color: 'a', width: 3 });
  const d0 = o.d(0, 0, st.orb === '2p' ? 1e-9 : 0, 0) || 1;
  if (st.orb !== '2p') v.plot(r => o.d(0, 0, r, r) / d0, { color: 'b', style: 'dash', width: 2 });
  const pk = st.orb === '1s' ? [1] : st.orb === '2s' ? [0.764, 5.236] : [4];
  for (const p of pk) { v.line([[p, 0], [p, o.P(p) / pm]], { color: 'c', style: 'dot', width: 1.6 }); }
  if (st.orb === '1s') { v.line([[1.5, 0], [1.5, o.P(1.5) / pm]], { color: 'sub', width: 1 }); v.text('平均 1.5a₀', 1.6, 0.86, { size: 14 }); v.text('山は r ＝ a₀', 1.1, 1.06, { size: 14, color: 'c' }); }
  if (st.orb === '2s') v.text('節 r ＝ 2a₀', 2.3, 0.15, { size: 14 });
}

function drawBond(cv, st) {
  ensureBond(st);
  const h = st.R / 2, sc = 46;
  const V = new A.View3(cv, { box: [0, 0, 620, 440], yaw: st.yaw, pitch: st.pitch, scale: sc, persp: 0 });
  V.line3([[-h - 4.5, 0, 0], [h + 4.5, 0, 0]], { color: 'sub', width: 1, zbias: -50 });
  for (let i = 0; i < NMAX; i++) V.dot3([st.pts[3 * i], st.pts[3 * i + 1], st.pts[3 * i + 2]], { color: 'a', r: 1.6 });
  V.dot3([-h, 0, 0], { color: 'b', shape: 'square', r: 6, zbias: 1e5 }); V.dot3([h, 0, 0], { color: 'b', shape: 'square', r: 6, zbias: 1e5 });
  V.text3('A', [-h, 0, 0.7], { size: 17, bold: true, color: 'b', align: 'center' }); V.text3('B', [h, 0, 0.7], { size: 17, bold: true, color: 'b', align: 'center' });
  if (st.bond === 'anti') for (const [p, q] of [[[0, -3, -3], [0, 3, -3]], [[0, 3, -3], [0, 3, 3]], [[0, 3, 3], [0, -3, 3]], [[0, -3, 3], [0, -3, -3]]]) V.line3([p, q], { color: 'd', style: 'dash', width: 1.5, zbias: 1e4 });
  V.flush();
  if (st.bond === 'anti') cv.text('節の面（電子がいない）', 860, 230, { align: 'right', size: 15, color: 'd' });
  scaleBar(cv, 30, 405, sc * 2, '2a₀');
  // 右下：A・B を通る線の上の ψ
  const g = cv.view({ x0: -h - 3, x1: h + 3, y0: st.bond === 'bond' ? -0.2 : -1.15, y1: st.bond === 'bond' ? 1.35 : 1.15, box: [640, 250, 220, 150] });
  g.poly([[g.x0, g.y0], [g.x1, g.y0], [g.x1, g.y1], [g.x0, g.y1]], { fill: 'bg', alpha: 1, color: 'grid', width: 1 });
  g.line([[g.x0, 0], [g.x1, 0]], { color: 'sub', width: 1 });
  const sg = st.bond === 'bond' ? 1 : -1;
  g.plot(x => Math.exp(-Math.abs(x + h)), { color: 'sub', style: 'dot', width: 1.4 });
  g.plot(x => sg * Math.exp(-Math.abs(x - h)), { color: 'sub', style: 'dot', width: 1.4 });
  g.plot(x => Math.exp(-Math.abs(x + h)) + sg * Math.exp(-Math.abs(x - h)), { color: 'a', width: 2.5 });
  g.text('A', -h, g.y0 + 0.12, { align: 'center', size: 14, color: 'b' }); g.text('B', h, g.y0 + 0.12, { align: 'center', size: 14, color: 'b' });
}
