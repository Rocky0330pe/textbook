// @id p1-29
// @title 箱の中の分子：ぶつかり合ってマクスウェル分布に
// @vol 物理2
// @from 物理 熱-14 ②⑤⑦（p2-14 の圧力・マクスウェルの速さの分布・ぶつかり合いのプログラム・ブラウン運動）／数学3-13・3-17、熱-3・15、力-3 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// ① 平面の上の分子（かたい円板の弾性衝突）。はじめは全部同じ速さ、向きはばらばら（A.rng で種を決める）。
//    平面の速さの分布は 2v e^(−v²)（速さの2乗の平均を1とした形。本のプログラムと同じ）。区切りに入る数は N(e^(−a²)−e^(−b²))。
//    平面の圧力（壁 1 m あたりの力）は N m ⟨v²⟩ /(2×面積)。
// ② 空間のマクスウェル分布 F(v)＝4πv²(m/2πkT)^(3/2) e^(−mv²/2kT)。窒素 20 ℃で vp・v̄・√⟨v²⟩＝417・471・511 m/s。
// ③ ブラウン運動：大きな粒（小さな分子の 25 倍の質量）を小さな分子がたたく。右は、でたらめに動く粒 300 個の ⟨x²⟩。
const BOXG = { x: 20, y: 20, w: 400, h: 380 };
const RB = { r: 3 }; // ぶつかりの半径（絵では少し大きくかく）
A.item({
  id: 'p1-29', title: '箱の中の分子：ぶつかり合ってマクスウェル分布に',
  from: '物理 第2巻『熱学』 熱-14 ②⑤⑦ の図とプログラムから（圧力、マクスウェルの速さの分布、ブラウン運動）',
  W: 880, H: 440,
  state: { N: 200, Tm: 1, T: 300, M: 28, t: 0 },
  scenes: [
    {
      key: 'bunpu', label: '① ぶつかって分布ができる',
      lead: 'はじめは、どの分子も同じ速さで、向きだけがばらばらです。ぶつかり合ううちに、速さのヒストグラムがどう変わるかを見ましょう。',
      note: 'ぶつかるたびに、2つの分子の運動量の和とエネルギーの和は変わらず、速さだけが分かれていきます。やがて、速さの分布は式（平面では $2ve^{-v^2}$）に近づき、それからはゆれながら変わらなくなります。壁を押す力（圧力）は、分子の数と速さの2乗の平均に比例します。',
      miss: '「温度が同じなら、分子はみな同じ速さ」ではありません。温度が決めるのは速さの2乗の**平均**（運動エネルギーの平均）で、1つ1つの分子の速さはばらばらです。',
      legend: [['数えた分子の数', { color: 'a', shape: 'square', noline: true }], ['分布の式から計算した数', { color: 'b' }], ['速い分子（はじめの 1.4 倍より速い）', { color: 'b', shape: 'circle', noline: true }], ['遅い分子（0.5 倍より遅い）', { color: 'a', shape: 'square', noline: true }]],
      controls: [
        { range: 'N', label: '分子の数 $N$', min: 50, max: 300, step: 10, d: 0, on: st => gasInit(st, false) },
        { range: 'Tm', label: '温度（はじめの何倍）', min: 0.5, max: 3, step: 0.1, d: 1, fmt: v => A.num(v, 1) + ' 倍', on: st => setTemp(st) }
      ],
      init(st) { st.Tm = 1; gasInit(st, false); },
      step(st, dt) { gasStep(st, dt); },
      draw(cv, st) { drawGas(cv, st); drawHist(cv, st); },
      readout: st => { const p = pressure(st); return `1 個あたり平均 ${A.num(st.ncol * 2 / st.N, 1)} 回ぶつかった${SP}壁を押す力（測った値）${A.num(p.meas, 1)}${SP}点の分子の式 $Nm$⟨$v^2$⟩$/(2\\times$面積$)$ ＝ ${A.num(p.th, 1)}（分子に大きさがある分、測った値が少し大きい）`; }
    },
    {
      key: 'ondo', label: '② 温度と分子の重さ',
      lead: '本物の気体（空間の中の分子）の速さの分布を、温度と分子の重さ（モル質量）を変えてくらべます。',
      note: '温度が高いほど、分子が軽いほど、山は低く右へ広がります（面積はいつも1）。3つの代表の速さ $v_{\\mathrm p}=\\sqrt{2k_{\\mathrm B}T/m}$、$\\bar v=\\sqrt{8k_{\\mathrm B}T/(\\pi m)}$、$\\sqrt{⟨v^2⟩}=\\sqrt{3k_{\\mathrm B}T/m}$ の比は、いつも $1:1.128:1.225$。20 ℃の窒素では 417・471・511 m/s です。',
      miss: '温度を2倍にしても、いちばん多い速さは2倍ではなく $\\sqrt2$ 倍です。ところが、ある決まった速さ（たとえば 2000 m/s）より速い分子の割合は、けたちがいに増えます（窒素を 300 K から 1000 K にすると約 400 万倍）。',
      legend: [['いまの分布', { color: 'd' }], ['窒素 300 K', { color: 'a' }], ['窒素 1000 K', { color: 'b', style: 'dash' }], ['ヘリウム 300 K', { color: 'c', style: 'dot' }]],
      controls: [
        { range: 'T', label: '温度 $T$', min: 100, max: 2000, step: 10, fmt: v => v + ' K' },
        { range: 'M', label: 'モル質量', min: 2, max: 100, step: 1, fmt: v => v + ' g/mol' + (v === 28 ? '（窒素）' : v === 4 ? '（ヘリウム）' : v === 32 ? '（酸素）' : v === 2 ? '（水素）' : '') }
      ],
      draw(cv, st) { drawMaxwell(cv, st); },
      readout: st => { const s = speeds(st.T, st.M); return `$v_{\\mathrm p}$ ＝ <b>${Math.round(s.vp)}</b>${SP}$\\bar v$ ＝ <b>${Math.round(s.va)}</b>${SP}$\\sqrt{⟨v^2⟩}$ ＝ <b>${Math.round(s.vr)}</b> m/s${SP}2000 m/s より速い割合 ${fast(st.T, st.M, 2000).toExponential(2)}`; }
    },
    {
      key: 'brown', label: '③ ブラウン運動',
      lead: '大きな粒（花粉から出た小さな粒のようなもの）を、たくさんの小さな分子がたたきます。大きな粒の動きを見ましょう。',
      note: '大きな粒は、周りの分子に四方八方からぶつかられ、そのぶつかり方が少しかたよるので、でたらめに動きます（ブラウン運動）。動いた距離の2乗の平均は時間に比例します：$⟨x^2⟩=2Dt$。距離ではなく「距離の2乗」が時間に比例するのは、でたらめな向きの小さな移動が打ち消し合いながら広がるからです。',
      miss: '粒は「泳いでいる」のでも「生きている」のでもありません。生きていない物の粒でも同じ動きをします。動かしているのは、見えない水の分子の熱運動です。',
      legend: [['大きな粒の道', { color: 'b' }], ['でたらめに動く粒 300 個の ⟨$x^2$⟩', { color: 'd', shape: 'square' }], ['$2Dt$（まっすぐ）', { color: 'sub', style: 'dash' }]],
      init(st) { brownInit(st); },
      step(st, dt) { gasStep(st, dt); walkStep(st, dt); },
      draw(cv, st) { drawGas(cv, st); drawWalk(cv, st); },
      readout: st => `時刻 ${A.num(st.t, 1)}${SP}大きな粒が動いた距離 ${A.num(Math.hypot(st.big.x - st.big.x0, st.big.y - st.big.y0), 0)} px${SP}300 個の ⟨$x^2$⟩ ＝ ${A.num(st.wx2, 0)}（$2Dt$ ＝ ${A.num(2 * 30 * st.t, 0)}）`
    }
  ]
});

// ---------- 分子の箱（平面、かたい円板） ----------
function gasInit(st, big) {
  const r = A.rng(2024 + (big ? 7 : 0)), N = st.N, v0 = 110 * Math.sqrt(st.Tm || 1);
  st.mol = []; st.t = 0; st.ncol = 0; st.imp = 0; st.impT = 0; st.v0 = v0;
  const cols = Math.ceil(Math.sqrt(N * BOXG.w / BOXG.h)), rows = Math.ceil(N / cols), dx = (BOXG.w - 20) / cols, dy = (BOXG.h - 20) / rows;
  for (let i = 0; i < N; i++) {
    const a = r() * 2 * Math.PI;
    st.mol.push({ x: BOXG.x + 10 + (i % cols + 0.5) * dx + (r() - 0.5) * 2, y: BOXG.y + 10 + (Math.floor(i / cols) + 0.5) * dy, vx: v0 * Math.cos(a), vy: v0 * Math.sin(a), m: 1, r: RB.r });
  }
  if (big) {
    // まん中の分子をどけて、大きな粒を置く
    const cx = BOXG.x + BOXG.w / 2, cy = BOXG.y + BOXG.h / 2;
    st.mol = st.mol.filter(m => Math.hypot(m.x - cx, m.y - cy) > 26);
    st.big = { x: cx, y: cy, vx: 0, vy: 0, m: 25, r: 18, x0: cx, y0: cy, big: true };
    st.mol.push(st.big); st.path = [[cx, cy]];
  }
}
function setTemp(st) { if (!st.mol) return; const f = Math.sqrt(st.Tm) * 110 / st.v0; for (const m of st.mol) { m.vx *= f; m.vy *= f; } st.v0 = 110 * Math.sqrt(st.Tm); st.imp = 0; st.impT = 0; }
function gasStep(st, dt) {
  guard(st);
  if (!st.mol) gasInit(st, false);
  const sub = 3, h = Math.min(dt, 0.05) / sub, B = BOXG;
  for (let s = 0; s < sub; s++) {
    for (const m of st.mol) {
      m.x += m.vx * h; m.y += m.vy * h;
      if (m.x < B.x + m.r) { m.x = 2 * (B.x + m.r) - m.x; m.vx = Math.abs(m.vx); st.imp += 2 * m.m * m.vx; }
      if (m.x > B.x + B.w - m.r) { m.x = 2 * (B.x + B.w - m.r) - m.x; st.imp += 2 * m.m * Math.abs(m.vx); m.vx = -Math.abs(m.vx); }
      if (m.y < B.y + m.r) { m.y = 2 * (B.y + m.r) - m.y; m.vy = Math.abs(m.vy); st.imp += 2 * m.m * m.vy; }
      if (m.y > B.y + B.h - m.r) { m.y = 2 * (B.y + B.h - m.r) - m.y; st.imp += 2 * m.m * Math.abs(m.vy); m.vy = -Math.abs(m.vy); }
    }
    // ぶつかり：升目に分けて、近い組だけ調べる
    const cell = 40, grid = new Map();
    st.mol.forEach((m, i) => { const k = Math.floor(m.x / cell) + ',' + Math.floor(m.y / cell); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); });
    const big = st.big;
    for (let i = 0; i < st.mol.length; i++) {
      const a = st.mol[i], gx = Math.floor(a.x / cell), gy = Math.floor(a.y / cell);
      const reach = a.big ? 1 : 1;
      for (let ox = -reach; ox <= reach; ox++) for (let oy = -reach; oy <= reach; oy++) {
        const list = grid.get((gx + ox) + ',' + (gy + oy)); if (!list) continue;
        for (const j of list) { if (j <= i) continue; collide(st, a, st.mol[j]); }
      }
      if (big && !a.big) collide(st, a, big, true);
    }
    st.impT += h;
  }
  st.t += Math.min(dt, 0.05);
  if (st.big) { const p = st.path[st.path.length - 1]; if (Math.hypot(st.big.x - p[0], st.big.y - p[1]) > 2) st.path.push([st.big.x, st.big.y]); if (st.path.length > 4000) st.path.shift(); }
}
function collide(st, a, b, onlyBig) {
  if (onlyBig === undefined && (a.big || b.big)) return; // 大きな粒は別に調べる
  const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, R = a.r + b.r;
  if (d2 >= R * R || d2 === 0) return;
  const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (rv >= 0) return; // 離れていく
  const J = 2 * rv / (1 / a.m + 1 / b.m);
  a.vx += J / a.m * nx; a.vy += J / a.m * ny; b.vx -= J / b.m * nx; b.vy -= J / b.m * ny;
  const push = (R - d) / 2; a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
  st.ncol++;
}
function pressure(st) {
  // 壁 1 px あたりの力（測った値）と、式 N m⟨v²⟩/(2×面積) の値。周りの長さ 2(w+h)
  const L = 2 * (BOXG.w + BOXG.h), meas = st.impT > 0 ? st.imp / st.impT / L : 0;
  let e = 0; for (const m of st.mol) e += m.m * (m.vx * m.vx + m.vy * m.vy);
  const th = e / (2 * BOXG.w * BOXG.h);
  if (st.impT > 3) { st.imp *= 0.5; st.impT *= 0.5; } // 古い分を少しずつ忘れる（移動平均）
  return { meas, th };
}
function guard(st) { // リンク（#bunpu&N=300 など）で値だけ変わったとき、そろえ直す
  if (!st.mol || (!st.big && st.mol.length !== st.N)) gasInit(st, !!st.big);
  if (Math.abs(st.v0 - 110 * Math.sqrt(st.Tm)) > 1e-6) setTemp(st);
}
function drawGas(cv, st) {
  guard(st);
  if (!st.mol) gasInit(st, false);
  const B = BOXG;
  cv.rect(B.x, B.y, B.w, B.h, { color: 'ink', width: 2.5 });
  if (st.path) cv.line(st.path, { color: 'b', width: 2, alpha: 0.8 });
  const v0 = st.v0;
  for (const m of st.mol) {
    if (m.big) { cv.circle(m.x, m.y, m.r, { fill: 'b', alpha: 0.5, color: 'b', width: 2 }); continue; }
    const v = Math.hypot(m.vx, m.vy) / v0;
    cv.dot(m.x, m.y, { color: v > 1.4 ? 'b' : v < 0.5 ? 'a' : 'sub', r: 4, shape: v < 0.5 ? 'square' : 'circle' });
  }
}
function drawHist(cv, st) {
  const v0 = st.v0, N = st.mol.length, bw = 0.25, nb = 12, cnt = new Array(nb).fill(0);
  for (const m of st.mol) { const v = Math.hypot(m.vx, m.vy) / v0; cnt[Math.min(nb - 1, Math.floor(v / bw))]++; }
  const ymax = Math.max(N * 0.45, ...cnt) * 1.05;
  const g = cv.view({ x0: 0, x1: 3, y0: 0, y1: ymax, box: [480, 30, 380, 340] });
  const step = ymax > 120 ? 40 : ymax > 60 ? 20 : 10;
  g.axes({ xt: [0, 0.5, 1, 1.5, 2, 2.5, 3], yt: A.range(step, ymax, step), xl: '速さ（はじめの速さを1）', yl: '分子の数', zero: true });
  for (let b = 0; b < nb; b++) g.poly([[b * bw + 0.01, 0], [(b + 1) * bw - 0.01, 0], [(b + 1) * bw - 0.01, cnt[b]], [b * bw + 0.01, cnt[b]]], { fill: 'a', alpha: 0.45, color: 'a', width: 1 });
  const pts = []; for (let b = 0; b < nb; b++) { const a = b * bw, c = b === nb - 1 ? Infinity : (b + 1) * bw; const n = N * (Math.exp(-a * a) - (isFinite(c) ? Math.exp(-c * c) : 0)); pts.push([a, n], [Math.min(3, a + bw), n]); }
  g.line(pts, { color: 'b', width: 3 });
  cv.text('右はしの区切りは 2.75 より上の全部', 670, 418, { align: 'center', size: 14, color: 'sub' });
}

// ---------- ② マクスウェル分布（空間） ----------
function speeds(T, M) { const kTm = 8.314 * T / (M / 1000); return { vp: Math.sqrt(2 * kTm), va: Math.sqrt(8 * kTm / Math.PI), vr: Math.sqrt(3 * kTm) }; }
function F(v, T, M) { const a = Math.sqrt(2 * 8.314 * T / (M / 1000)); return 4 / Math.sqrt(Math.PI) * v * v / (a * a * a) * Math.exp(-(v / a) * (v / a)); }
function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
function fast(T, M, v) { const x = v / speeds(T, M).vp; return 1 - erf(x) + 2 * x / Math.sqrt(Math.PI) * Math.exp(-x * x); }
function drawMaxwell(cv, st) {
  const g = cv.view({ x0: 0, x1: 2600, y0: 0, y1: 2.25, box: [80, 30, 760, 360] });
  g.axes({ xt: [0, 500, 1000, 1500, 2000, 2500], yt: [0.5, 1, 1.5, 2], xl: '速さ v（m/s）', yl: 'F(v)（1/(km/s)）', zero: true });
  g.plot(v => F(v, 300, 28) * 1000, { color: 'a', width: 2 });
  g.plot(v => F(v, 1000, 28) * 1000, { color: 'b', width: 2, style: 'dash' });
  g.plot(v => F(v, 300, 4) * 1000, { color: 'c', width: 2, style: 'dot' });
  g.area(v => F(v, st.T, st.M) * 1000, 0, 2600, { fill: 'd', alpha: 0.12 });
  g.plot(v => F(v, st.T, st.M) * 1000, { color: 'd', width: 3.5 });
  const s = speeds(st.T, st.M);
  [['vp', s.vp, 'dot'], ['v̄', s.va, 'dash'], ['√⟨v²⟩', s.vr, 'solid']].forEach(([n, v, sty], i) => { if (v < 2600) { g.line([[v, 0], [v, F(v, st.T, st.M) * 1000]], { color: 'd', width: 1.5, style: sty }); cv.text(n, g.X(v) + (i - 1) * 16, g.Y(0) - 14 - i * 16, { size: 14, color: 'd', align: 'center', bg: true }); } });
  cv.text(`${st.T} K・${st.M} g/mol`, g.X(Math.min(2400, s.vp)) + 10, g.Y(F(s.vp, st.T, st.M) * 1000) - 16, { size: 15, bold: true, color: 'd' });
}

// ---------- ③ ブラウン運動 ----------
function brownInit(st) { st.N = 230; st.Tm = 1; gasInit(st, true); const r = A.rng(99); st.walk = []; for (let i = 0; i < 300; i++) st.walk.push([0, 0]); st.wr = r; st.whist = []; st.wx2 = 0; st.wacc = 0; }
function walkStep(st, dt) { // 1 回 0.05 の時間ごとに、x・y に標準偏差 √(2D·0.05) のずれ（D＝30）
  st.wacc += Math.min(dt, 0.05);
  while (st.wacc >= 0.05) { st.wacc -= 0.05; const s = Math.sqrt(2 * 30 * 0.05); for (const w of st.walk) { w[0] += s * A.gauss(st.wr); w[1] += s * A.gauss(st.wr); } }
  let x2 = 0; for (const w of st.walk) x2 += w[0] * w[0]; st.wx2 = x2 / st.walk.length;
  if (!st.whist.length || st.t - st.whist[st.whist.length - 1][0] > 0.25) st.whist.push([st.t, st.wx2]);
}
function drawWalk(cv, st) {
  const tmax = Math.max(10, Math.ceil(st.t / 10) * 10);
  const g = cv.view({ x0: 0, x1: tmax, y0: 0, y1: 2 * 30 * tmax * 1.4, box: [490, 225, 370, 175] });
  g.axes({ xt: [0, tmax / 2, tmax], yt: [], xl: '時刻', yl: '⟨x²⟩', zero: true });
  g.line([[0, 0], [tmax, 2 * 30 * tmax]], { color: 'sub', style: 'dash', width: 2 });
  if (st.whist && st.whist.length > 1) { g.line(st.whist, { color: 'd', width: 2.5 }); const l = st.whist[st.whist.length - 1]; g.dot(l[0], l[1], { color: 'd', shape: 'square', r: 5 }); }
  // 300 個の粒の今の位置（小さく）
  const c = [675, 105];
  cv.rect(c[0] - 175, 20, 350, 160, { color: 'sub', width: 1 });
  if (st.walk) for (const w of st.walk) { const x = c[0] + w[0] * 0.9, y = c[1] - 5 + w[1] * 0.9; if (x > c[0] - 173 && x < c[0] + 173 && y > 22 && y < 178) cv.dot(x, y, { color: 'd', r: 2 }); }
  cv.text('でたらめに動く粒 300 個（はじめは全部まん中）', c[0], 192, { align: 'center', size: 14, color: 'sub' });
}
