// @id p2-13
// @title 干渉：経路の差で明暗が決まる
// @vol 物理3
// @from 物理 波-8 ③（p3-08:325・328）、波-13 ②③（p3-13:365・453・532・569）
'use strict';
// 記号は本と同じ：波源 S₁・S₂、道のり l₁・l₂、波長 λ、間かく d、次数 m、すきまの数 N、u＝d sinθ/λ
const T13 = 1.6;   // 波の周期（画面の秒）
A.item({
  id: 'p2-13', title: '干渉：経路の差で明暗が決まる',
  from: '物理 第3巻 波-8 ③「2つの波源の干渉」、波-13 ②「ヤングの実験」・③「回折格子」の図から',
  W: 880, H: 430,
  state: { t: 0, lam: 6, d: 18, dl: 0, px: 9, py: 30, dmm: 0.20, nm: 633, L: 1.0, xs: 0, dir: 1, N: 5, u: 0 },
  scenes: [
    {
      key: 'hamon', label: '① 2つの波源',
      lead: '同じ位相の2つの波源 S₁・S₂ から波紋が広がります。太い線の上では、いつも大きくゆれます。点 P はドラッグで動かせます。',
      note: '点 P のゆれの振幅は $2A|\\cos(\\pi(l_1-l_2)/\\lambda)|$ で、**道のりの差** $l_1-l_2$ だけで決まります。差が $m\\lambda$ なら山と山が重なって強め合い（振幅 $2A$）、$(m+\\frac{1}{2})\\lambda$ なら山と谷が重なって弱め合います（振幅 0）。どの線も、2点からの距離の差が一定の曲線（双曲線）です。波長を2倍にすると、線の数は半分ほどになります。',
      miss: '強め合う線の上でも、水面がずっと山のままなのではありません。山と谷が、大きなゆれ（振幅 $2A$）で入れかわり続けます。弱め合う線の上は、ずっと静かです。',
      legend: [['山（波紋）', { color: 'a', width: 1 }], ['谷', { color: 'a', style: 'dot' }], ['強め合う線（差 $m\\lambda$）', { color: 'b' }], ['弱め合う線（差 $(m+\\frac{1}{2})\\lambda$）', { color: 'ink', style: 'dash' }], ['点 P', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [
        { range: 'lam', label: '波長 $\\lambda$〔mm〕', min: 3, max: 12, step: 0.5, d: 1 },
        { range: 'd', label: '間かく $d$〔mm〕', min: 6, max: 36, step: 1, d: 0 },
        { range: 'dl', label: 'S₂ の位相のおくれ', min: 0, max: 2 * Math.PI, step: Math.PI / 12, fmt: v => A.pi(v, 6) }
      ],
      autoplay: true,
      step(st, dt) { st.t += dt; },
      draw: drawHamon,
      drag: { hit(st, x, y) { const v = hamonView(st.__cv); const [px, py] = v.P([st.px, st.py]); return A.near(x, y, px, py, 24) ? 'P' : (v.inside(x, y) ? 'P' : null); }, move(st, x, y) { const v = hamonView(st.__cv); const p = v.inv(x, y); st.px = A.clamp(p[0], -39, 39); st.py = A.clamp(p[1], 1, 49); } },
      readout: st => { const l1 = Math.hypot(st.px + st.d / 2, st.py), l2 = Math.hypot(st.px - st.d / 2, st.py), r = (l1 - l2) / st.lam; const amp = 2 * Math.abs(Math.cos(Math.PI * r - st.dl / 2)); return `P：$l_1$ ＝ ${A.num(l1, 1)} mm、$l_2$ ＝ ${A.num(l2, 1)} mm、差 ÷ $\\lambda$ ＝ <b>${A.num(r, 2)}</b>　→　振幅 ＝ <b>${A.num(amp, 2)}</b>$A$`; }
    },
    {
      key: 'young', label: '② ヤングの実験',
      lead: '2つのすきまの光が、スクリーンの上の点 P で重なります。P を動かすと、経路の差 $dx/L$ と明るさが変わります。',
      note: '明るい線は $dx/L=m\\lambda$ の所にでき、間かくは $\\Delta x=L\\lambda/d$ です。$L=1$ m、$d=0.20$ mm なら $L/d=5000$ で、波長 633 nm が約 3.2 mm に引きのばされます。$d$ を2倍にすると、しまの間かくは半分になります（破線は $d=0.20$ mm、$\\lambda=633$ nm、$L=1.0$ m のまま）。',
      miss: '$\\Delta x=L\\lambda/d$ の $d$ は、2つのすきまの**中心の間かく**です。すきまのはばを入れてはいけません。また、$L$・$\\lambda$・$d$ は同じ単位（m）にそろえてから計算します。',
      legend: [['明るさ $\\cos^2(\\pi\\times$経路の差$/\\lambda)$', { color: 'b', width: 3 }], ['はじめの値（$d=0.20$ mm）', { color: 'sub', style: 'dash' }], ['点 P', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [
        { range: 'dmm', label: 'すきまの間かく $d$〔mm〕', min: 0.10, max: 0.50, step: 0.01, d: 2 },
        { range: 'nm', label: '波長 $\\lambda$〔nm〕', min: 400, max: 700, step: 1, d: 0 },
        { range: 'L', label: 'スクリーンまで $L$〔m〕', min: 0.5, max: 2.0, step: 0.1, d: 1 }
      ],
      autoplay: true,
      step(st, dt) { st.xs += st.dir * dt * 1.6; if (st.xs > 8) { st.xs = 8; st.dir = -1; } if (st.xs < -8) { st.xs = -8; st.dir = 1; } },
      draw: drawYoung,
      drag: { hit(st, x, y) { return x > 300 && x < 870 && y > 20 && y < 410 ? 'x' : null; }, move(st, x, y) { st.xs = A.clamp(youngV(st.__cv).inv(x, y)[1], -8, 8); } },
      readout: st => { const dif = st.dmm * st.xs / st.L * 1000; const r = dif / st.nm; return `$x$ ＝ ${A.num(st.xs, 1)} mm　経路の差 ＝ ${A.num(dif, 0)} nm ＝ ${A.num(r, 3)}$\\lambda$　明るさ ＝ <b>${A.num(Math.cos(Math.PI * r) ** 2, 3)}</b>　　$\\Delta x=L\\lambda/d$ ＝ <b>${A.num(st.L * st.nm * 1e-3 / st.dmm, 3)} mm</b>`; }
    },
    {
      key: 'koushi', label: '③ N 本のすきま',
      lead: 'すきまが $N$ 本あると、となりとの位相のずれのぶんだけ向きを変えた矢印を $N$ 本つなぎます。▶ で $u=d\\sin\\theta/\\lambda$ が 0 から 2 まで進みます。',
      note: '$N$ 本の矢印は、ずれが $\\frac1N$ 周になると、ちょうど1周してもとにもどり、合計が 0 になります。$u$ が整数（$d\\sin\\theta=m\\lambda$）では何本でも明るさ 1 です。$N$ が大きいほど、少しずれただけで暗くなり、明るい線は細く、鋭くなります（山のはばは $N$ にほぼ反比例）。',
      legend: [['すきま1本ぶんの矢印', { color: 'b', width: 2 }], ['合計の矢印', { color: 'a', style: 'dash' }], ['明るさ（いまの $N$）', { color: 'a', width: 3 }], ['$N=2$（ヤングの実験）', { color: 'c', style: 'dot' }]],
      controls: [
        { range: 'N', label: 'すきまの数 $N$', min: 2, max: 20, step: 1, d: 0 },
        { range: 'u', label: '$u=d\\sin\\theta/\\lambda$', min: 0, max: 2, step: 0.005, d: 3 }
      ],
      step(st, dt) { st.u += dt * 0.08; if (st.u > 2) { st.u = 2; return false; } },
      draw: drawKoushi,
      readout: st => { const [sx, sy] = chainSum(st.N, st.u); const len = Math.hypot(sx, sy); return `$N$ ＝ ${st.N}、$u$ ＝ ${A.num(st.u, 3)}：合計の長さ ＝ <b>${A.num(len, 2)}</b>、明るさ ＝ 長さ² ÷ $N^2$ ＝ <b>${A.num(len * len / st.N / st.N, 3)}</b>`; }
    }
  ]
});

// ---------- ① 2つの波源 ----------
function hamonView(cv) { return cv.view({ x0: -40, x1: 40, y0: 0, y1: 50, box: [16, 30, 528, 330] }); }
function drawHamon(cv, st) {
  st.__cv = cv;
  const v = hamonView(cv), lam = st.lam, f = st.d / 2, ph = 2 * Math.PI * st.t / T13;
  const S1 = [-f, 0], S2 = [f, 0];
  v.clip(() => {
    // 山（実線）と谷（点線）：位相 ωt−kl−(おくれ) が π/2（山）、−π/2（谷）
    for (const [S, del] of [[S1, 0], [S2, st.dl]]) {
      for (const [off, sty] of [[0.25, 'solid'], [0.75, 'dot']]) {
        let r0 = (((ph - del) / (2 * Math.PI) - off) % 1 + 1) % 1 * lam;
        for (let r = r0; r < 70; r += lam) v.circle(S[0], S[1], r, { color: 'a', width: sty === 'solid' ? 1.2 : 1.4, style: sty, alpha: 0.55 });
      }
    }
    // 強め合う線・弱め合う線：l1−l2＝c の双曲線（c＝(整数＋おくれ/2π)λ、弱め合いは＋½）
    for (const [half, o] of [[0, { color: 'b', width: 3.2 }], [0.5, { color: 'ink', width: 2, style: 'dash' }]]) {
      const base = st.dl / (2 * Math.PI) + half;
      for (let m = -20; m <= 20; m++) {
        const c = (m + base) * lam;
        if (Math.abs(c) >= st.d - 1e-6) continue;
        const a = c / 2, b = Math.sqrt(f * f - a * a), pts = [];
        for (let k = 0; k <= 80; k++) { const s = k / 80 * 4; pts.push([a * Math.cosh(s), b * Math.sinh(s)]); }
        v.line(pts, o);
      }
    }
  });
  cv.line([[v.X(-40), v.Y(0)], [v.X(40), v.Y(0)]], { color: 'sub', width: 1 });
  for (const [S, n] of [[S1, 'S₁'], [S2, 'S₂']]) { v.dot(S[0], S[1], { color: 'ink', r: 6 }); v.text(n, S[0], -3, { align: 'center', size: 16, bold: true }); }
  // 点 P
  const l1 = Math.hypot(st.px - S1[0], st.py), l2 = Math.hypot(st.px - S2[0], st.py);
  v.line([S1, [st.px, st.py]], { color: 'd', width: 1.5, style: 'dashdot' });
  v.line([S2, [st.px, st.py]], { color: 'd', width: 1.5, style: 'dashdot' });
  v.dot(st.px, st.py, { color: 'd', shape: 'diamond', r: 7 });
  v.text('P', st.px + 2, st.py + 2.5, { bold: true, size: 17, color: 'd', bg: true });
  cv.text(`波長 λ ＝ ${A.num(lam, 1)} mm、間かく d ＝ ${st.d} mm（${A.num(st.d / lam, 2)}λ）`, 20, 16, { size: 15, color: 'sub' });
  // 右：P でのゆれ（S₁ から・S₂ から・合計）
  const T = T13, t0 = st.t - 2 * T;
  const g1 = cv.view({ x0: t0, x1: st.t, y0: -1.4, y1: 1.4, box: [590, 50, 270, 120] });
  const g2 = cv.view({ x0: t0, x1: st.t, y0: -2.4, y1: 2.4, box: [590, 230, 270, 160] });
  const k = 2 * Math.PI / lam;
  const y1 = s => Math.sin(2 * Math.PI * s / T - k * l1), y2 = s => Math.sin(2 * Math.PI * s / T - k * l2 - st.dl);
  g1.axes({ yt: [-1, 1], grid: false, ylabels: false, ay: t0, ax: 0 });
  g2.axes({ yt: [-2, -1, 1, 2], grid: false, ylabels: false, ay: t0, ax: 0 });
  g1.plot(y1, { color: 'a', width: 2 }); g1.plot(y2, { color: 'b', width: 2, style: 'dash' });
  g2.plot(s => y1(s) + y2(s), { color: 'd', width: 3 });
  for (const yy of [2, -2]) g2.line([[t0, yy], [st.t, yy]], { color: 'sub', width: 1, style: 'dot' });
  cv.text('P に来る2つの波', 590, 18, { size: 14, color: 'sub' });
  cv.text('実線：S₁ から　破線：S₂ から', 590, 36, { size: 14, color: 'sub' });
  cv.text('2つの和（P のゆれ）', 590, 212, { size: 14, color: 'sub' });
  cv.text('2A', 586, g2.Y(2), { size: 14, color: 'sub', align: 'right' });
  cv.text('−2A', 586, g2.Y(-2), { size: 14, color: 'sub', align: 'right' });
  cv.text('時間 →', 860, 405, { size: 14, color: 'sub', align: 'right' });
}

// ---------- ② ヤングの実験 ----------
function youngV(cv) { return cv.view({ x0: 0, x1: 1.25, y0: -8, y1: 8, box: [520, 30, 330, 370] }); }
function drawYoung(cv, st) {
  st.__cv = cv;
  const g = youngV(cv), dx = st.L * st.nm * 1e-3 / st.dmm;   // mm
  const I = (x, d, lam, L) => Math.cos(Math.PI * d * x / L * 1000 / lam) ** 2;
  // 左：すきまとスクリーン（たてに大きく引きのばした図）
  const sx = 70, scx = 380, cy = g.Y(0), half = 30 * st.dmm / 0.2;
  cv.line([[20, cy], [62, cy]], { color: 'sub', width: 2 });
  cv.text('光', 20, cy - 16, { size: 15, color: 'sub' });
  for (const [a, b] of [[40, cy - half - 4], [cy - half + 4, cy + half - 4], [cy + half + 4, 400]]) cv.rect(sx - 4, a, 8, b - a, { fill: 'ink', alpha: 0.75 });
  cv.rect(scx, 30, 8, 370, { fill: 'sub', alpha: 0.35 });
  cv.text('スクリーン', scx + 4, 22, { size: 14, color: 'sub', align: 'center' });
  const P = [scx, g.Y(st.xs)];
  cv.line([[sx, cy - half], P], { color: 'b', width: 1.5 });
  cv.line([[sx, cy + half], P], { color: 'b', width: 1.5 });
  cv.line([[sx, cy], [scx, cy]], { color: 'sub', width: 1, style: 'dash' });
  cv.text('S₁', sx - 10, cy - half, { size: 15, align: 'right' });
  cv.text('S₂', sx - 10, cy + half, { size: 15, align: 'right' });
  cv.text('d', sx + 12, cy, { size: 16, italic: true, math: true });
  cv.text('L', (sx + scx) / 2, 408, { size: 16, italic: true, math: true, align: 'center' });
  cv.line([[sx, 400], [scx, 400]], { color: 'sub', width: 1 });
  cv.text('O', scx - 6, cy + 12, { size: 15, align: 'right' });
  cv.text('（たてに大きく引きのばしてある）', 90, 60, { size: 14, color: 'sub' });
  // スクリーンを正面から見たしま
  for (let k = 0; k < 185; k++) { const x = -8 + 16 * k / 185; const b = I(x, st.dmm, st.nm, st.L); cv.rect(420, g.Y(x + 16 / 185 / 2), 60, 370 / 185 + 0.6, { fill: 'b', alpha: 0.08 + 0.85 * b }); }
  cv.rect(420, 30, 60, 370, { color: 'line', width: 1 });
  cv.text('正面から', 450, 22, { size: 14, color: 'sub', align: 'center' });
  // 明るさのグラフ（たてが x）
  const yt = A.range(-8, 8, 2);
  g.axes({ xt: [0.5, 1], yt, xl: '明るさ', yl: 'x（mm）', ay: 0, ax: -8 });
  g.param(x => I(x, 0.2, 633, 1), x => x, -8, 8, { n: 400, color: 'sub', style: 'dash', width: 1.5 });
  g.param(x => I(x, st.dmm, st.nm, st.L), x => x, -8, 8, { n: 600, color: 'b', width: 3 });
  // 明るい線の位置 x_m
  for (let m = -6; m <= 6; m++) { const x = m * dx; if (Math.abs(x) > 8) continue; g.text('m=' + m, 1.06, x, { size: 14, color: 'sub' }); }
  if (Math.abs(dx) <= 16) { g.line([[1.0, 0], [1.0, dx]], { color: 'ink', width: 1.5 }); }
  // 点 P
  const b = I(st.xs, st.dmm, st.nm, st.L);
  cv.line([[P[0], P[1]], [g.X(b), P[1]]], { color: 'd', width: 1, style: 'dot' });
  cv.dot(P[0] + 4, P[1], { color: 'd', shape: 'diamond', r: 7 });
  cv.text('P', P[0] + 14, P[1] - 12, { size: 16, bold: true, color: 'd' });
  g.dot(b, st.xs, { color: 'd', shape: 'diamond', r: 7 });
}

// ---------- ③ N 本のすきま ----------
function chainSum(N, u) { let x = 0, y = 0; for (let p = 0; p < N; p++) { x += Math.cos(2 * Math.PI * p * u); y += Math.sin(2 * Math.PI * p * u); } return [x, y]; }
function bright(N, u) { const s = Math.sin(Math.PI * u); if (Math.abs(s) < 1e-9) return 1; return (Math.sin(N * Math.PI * u) / (N * s)) ** 2; }
function drawKoushi(cv, st) {
  const N = st.N, u = st.u, Lp = Math.min(46, 330 / N);
  const pts = [[0, 0]];
  for (let p = 0; p < N; p++) { const a = 2 * Math.PI * p * u, q = pts[pts.length - 1]; pts.push([q[0] + Lp * Math.cos(a), q[1] - Lp * Math.sin(a)]); }
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const ox = 200 - (x0 + x1) / 2, oy = 215 - (y0 + y1) / 2;
  cv.rect(10, 30, 380, 370, { color: 'line', width: 1 });
  cv.text('回る矢印をつなぐ（となりと 2πu ずつ回す）', 20, 16, { size: 14, color: 'sub' });
  for (let p = 0; p < N; p++) cv.arrow(pts[p][0] + ox, pts[p][1] + oy, pts[p + 1][0] + ox, pts[p + 1][1] + oy, { color: 'b', width: 2.4, head: 11 });
  const e = pts[N];
  if (Math.hypot(e[0], e[1]) > 2) cv.arrow(ox, oy, e[0] + ox, e[1] + oy, { color: 'a', width: 2.5, style: 'dash', head: 12 });
  else cv.dot(ox, oy, { color: 'a', r: 6 });
  cv.text('はじめ', ox - 8, oy + 16, { size: 14, color: 'sub', align: 'center' });
  // 右：明るさのグラフ
  const g = cv.view({ x0: 0, x1: 2.05, y0: 0, y1: 1.18, box: [440, 40, 410, 330] });
  g.axes({ xt: [0, 0.5, 1, 1.5, 2], yt: [0.5, 1], yl: '明るさ', zero: true });
  cv.text('u = d sinθ / λ（となりとの経路の差 ÷ 波長）', 645, 414, { size: 14, color: 'sub', align: 'center' });
  g.plot(x => bright(2, x), { color: 'c', style: 'dot', width: 2.5, n: 500 });
  g.plot(x => bright(N, x), { color: 'a', width: 3, n: 900 });
  g.text('m=1', 1, 1.1, { size: 14, align: 'center', color: 'sub' });
  g.text('m=2', 2, 1.1, { size: 14, align: 'center', color: 'sub' });
  g.text('m=0', 0.03, 1.1, { size: 14, color: 'sub' });
  g.line([[u, 0], [u, bright(N, u)]], { color: 'd', width: 1, style: 'dot' });
  g.dot(u, bright(N, u), { color: 'd', shape: 'diamond', r: 7 });
  g.text('N = ' + N, 1.55, 0.8, { size: 16, bold: true, color: 'a', bg: true });
}
