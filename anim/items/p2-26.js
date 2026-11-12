// @id p2-26
// @title 1個ずつ届いて、しまになる
// @vol 物理5
// @from 物理 原-2 ⑧（p5-02 光子を1個ずつ数える干渉じま）、原-3 ⑤（p5-03 電子の二重スリット・例題6）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：届きやすさ P(x)＝cos²(πx/s)·exp(−(x/w)²)、s＝5.4 μm（例題6：50 kV の電子 λ＝5.36 pm、d＝1.0 μm、L＝1.0 m）、
// w＝12 μm、−10〜10 μm（原-3 ⑤のプログラム）。乱数は A.rng で種を決める。
const XR = 10, WENV = 12, NMAX = 3000;
const sp = st => st.lam / st.d;                     // しまの間かく Δx＝Lλ/d（μm）。L＝1.0 m、λ〔pm〕、d〔μm〕
function prob(st, x) {
  const env = Math.exp(-(x / WENV) * (x / WENV));
  return st.open === 'both' ? Math.cos(Math.PI * x / sp(st)) ** 2 * env : env;
}
function gen(st) {   // はねのけ法（本のプログラムと同じやり方）で、NMAX 個の届く場所を前もって決める
  const r = A.rng(st.seed);
  st.px = new Float32Array(NMAX); st.py = new Float32Array(NMAX);
  for (let i = 0; i < NMAX; i++) {
    let x;
    for (;;) { x = -XR + 2 * XR * r(); if (r() < prob(st, x)) break; }
    st.px[i] = x; st.py[i] = r();
  }
  st.key = [st.lam, st.d, st.open, st.seed].join();
}
const ensure = st => { if (st.key !== [st.lam, st.d, st.open, st.seed].join()) gen(st); };
function grow(st, dt) {
  ensure(st);
  if (st.n >= st.nEnd) { st.n = st.nEnd; return false; }
  st.n = Math.min(st.nEnd, st.n + dt * (4 + 1.1 * st.n));
}
const setN = n => ({ button: n + '個', act(st) { ensure(st); st.n = n; } });

A.item({
  id: 'p2-26', title: '1個ずつ届いて、しまになる',
  from: '物理 第5巻 原-3 ⑤ の図から（電子を1個ずつ落とす・例題6）／原-2 ⑧ の光子の干渉じまと同じ',
  W: 880, H: 430,
  state: { n: 0, nEnd: NMAX, lam: 5.36, d: 1.0, open: 'both', seed: 3 },
  scenes: [
    {
      key: 'ichiko', label: '① 1個ずつ届く',
      lead: '電子を1個ずつ、2つのすきまに向けて送ります。▶ を押して、スクリーンに届く点を見ましょう。',
      note: '電子は1個ずつ、スクリーンの**1つの点**に届きます（つぶ）。1個がどこに届くかは、前もって決まっていません。けれども、たくさん集まると**干渉のしま**ができます（波）。届く確率の分布が、波の強さ $|\\psi|^2$ の分布と同じなのです。光子でも同じことが起きます（原-2 ⑧）。',
      miss: '「電子が2つのすきまで半分に分かれ、スクリーンで2つの点になる」はまちがいです。スクリーンでは、いつも電子1個の1つの点です。干渉するのは、届く確率を決める波 $\\psi$ です。',
      legend: [['届いた電子（1個が1つの点）', { color: 'a', shape: 'circle', noline: true }], ['届く確率 $|\\psi|^2$ の形', { color: 'b', style: 'dash' }], ['数えた数（0.5 μm ごと）', { color: 'sub', shape: 'square', noline: true }]],
      controls: [setN(20), setN(200), setN(2000)],
      init(st) { st.n = 0; ensure(st); },
      step: grow,
      draw(cv, st) { ensure(st); drawAll(cv, st, { side: true }); },
      readout: st => `届いた電子：<b>${Math.floor(st.n)} 個</b>${GAP}しまの間かく $\\Delta x=L\\lambda/d$ ＝ 1.0 m × 5.36 pm ÷ 1.0 μm ≒ <b>5.4 μm</b>（例題6）`
    },
    {
      key: 'kankaku', label: '② しまの間かく',
      lead: '電子の波長 $\\lambda$ と、すきまの間かく $d$ を変えると、しまの間かくはどう変わるでしょう。',
      note: 'しまの間かくは、光の二重スリット（波-13 ②）と同じ $\\Delta x=L\\lambda/d$ に、ド・ブロイ波長を入れた値です。電圧を上げて波長を短くすると、しまは細かくなります。すきまの間かくを広げても細かくなります。',
      legend: [['届いた電子（2000個）', { color: 'a', shape: 'circle', noline: true }], ['届く確率 $|\\psi|^2$ の形', { color: 'b', style: 'dash' }], ['しまの間かく $\\Delta x$', { color: 'ink' }]],
      state: { n: 2000 },
      controls: [{ range: 'lam', label: '波長 $\\lambda$〔pm〕', min: 2, max: 10, step: 0.02, d: 2 }, { range: 'd', label: 'すきまの間かく $d$〔μm〕', min: 0.5, max: 2, step: 0.05, d: 2 }],
      draw(cv, st) { ensure(st); drawAll(cv, st, { side: true, dim: true }); },
      readout: st => `$\\Delta x=\\dfrac{L\\lambda}{d}$ ＝ 1.0 m × ${A.num(st.lam, 2)} pm ÷ ${A.num(st.d, 2)} μm ＝ <b>${A.num(sp(st), 2)} μm</b>`
    },
    {
      key: 'katahou', label: '③ 片方をふさぐ',
      lead: 'すきまを1つふさいで、同じように電子を1個ずつ送ります。しまはできるでしょうか。',
      note: '片方だけでは、しまはできません。両方あけると、1個ずつ送っているのに、しまができます。電子どうしがぶつかって作ったのではなく、**1個の電子の波が2つの道を同時に通り、自分自身と干渉した**と考えるしかありません。両方あけると、暗いしまの所には、かえって届かなくなります。',
      legend: [['届いた電子', { color: 'a', shape: 'circle', noline: true }], ['届く確率の形', { color: 'b', style: 'dash' }], ['数えた数（0.5 μm ごと）', { color: 'sub', shape: 'square', noline: true }]],
      controls: [{ seg: 'open', label: 'すきま', options: [['both', '両方あける'], ['one', '片方だけ']], on: st => { st.n = 0; ensure(st); } }, setN(2000)],
      init(st) { st.n = 0; ensure(st); },
      step: grow,
      draw(cv, st) { ensure(st); drawAll(cv, st, { side: true }); },
      readout: st => `${st.open === 'both' ? '両方あける' : '片方だけ'}：届いた電子 <b>${Math.floor(st.n)} 個</b>${GAP}x ＝ ±2.7 μm（両方のときの暗いしま）の近く ±0.5 μm に届いた数：<b>${countNear(st)}</b> 個`
    }
  ]
});

function countNear(st) { let c = 0; const n = Math.floor(st.n); for (let i = 0; i < n; i++) { const a = Math.abs(st.px[i]); if (Math.abs(a - 2.7) < 0.5) c++; } return c; }

function drawAll(cv, st, o) {
  const n = Math.floor(st.n);
  // 左：横から見た装置（上から電子が来る）
  if (o.side) {
    const L = 30, R = 270, sx = x => (L + R) / 2 + x / XR * (R - L) / 2;
    cv.text('電子の源', (L + R) / 2, 34, { align: 'center', size: 15 });
    cv.circle((L + R) / 2, 60, 9, { color: 'ink', width: 2 });
    const yS = 160, yScr = 330, gap = 12, s1 = (L + R) / 2 - 22, s2 = (L + R) / 2 + 22;
    const one = st.open === 'one';
    cv.line([[L, yS], [s1 - gap / 2, yS]], { color: 'ink', width: 5 }); cv.line([[s1 + gap / 2, yS], [s2 - gap / 2, yS]], { color: 'ink', width: 5 }); cv.line([[s2 + gap / 2, yS], [R, yS]], { color: 'ink', width: 5 });
    if (one) cv.line([[s2 - gap / 2, yS], [s2 + gap / 2, yS]], { color: 'b', width: 7 });
    cv.text(one ? 'すきま（右はふさいだ）' : 'すきま2つ', R, yS - 18, { align: 'right', size: 14, color: 'sub' });
    cv.line([[L, yScr], [R, yScr]], { color: 'ink', width: 3 });
    cv.text('スクリーン', R, yScr + 20, { align: 'right', size: 14, color: 'sub' });
    for (const x of [-10, 0, 10]) { cv.line([[sx(x), yScr - 5], [sx(x), yScr + 5]], { color: 'sub', width: 1 }); cv.text(A.num(x, 0), sx(x), yScr + 40, { align: 'center', size: 14, color: 'sub' }); }
    cv.text('μm', R, yScr + 58, { align: 'right', size: 14, color: 'sub' });
    // いちばん新しい電子が飛ぶようす（数が少ないうちだけ）
    if (n < 60 && st.n > 0 && n < NMAX) {
      const f = st.n - n, x = st.px[n];
      const y = 60 + (yScr - 60) * Math.min(1, f * 1.2);
      const xx = (L + R) / 2 + (sx(x) - (L + R) / 2) * Math.max(0, (y - yS) / (yScr - yS));
      cv.dot(xx, y, { color: 'a', r: 6 });
    }
    for (let i = Math.max(0, n - 6); i < n; i++) cv.dot(sx(st.px[i]), yScr - 1, { color: 'a', r: 4 });
  }
  // 右上：スクリーンを正面から見た図
  const X0 = 310, X1 = 860, sxr = x => X0 + (x + XR) / (2 * XR) * (X1 - X0);
  const T = 26, Hs = 170;
  cv.rect(X0, T, X1 - X0, Hs, { fill: 'sub', alpha: 0.08, color: 'sub', width: 1 });
  const r = n > 1500 ? 1.6 : n > 300 ? 2.2 : 3.2;
  const g = cv.g; g.fillStyle = A.color('a');
  for (let i = 0; i < n; i++) { g.beginPath(); g.arc(sxr(st.px[i]), T + 4 + st.py[i] * (Hs - 8), r, 0, A.TAU); g.fill(); }
  cv.text(`${n} 個`, X1 - 6, T + 14, { align: 'right', size: 15, bold: true, bg: true });
  // 右下：0.5 μm ごとの数と、確率の形
  const v = cv.view({ x0: -XR, x1: XR, y0: 0, y1: 1.15, box: [X0, 220, X1 - X0, 160] });
  const nb = sp(st) < 4 ? 80 : 40, bw = 2 * XR / nb, hist = new Array(nb).fill(0);
  for (let i = 0; i < n; i++) { const b = Math.min(nb - 1, Math.floor((st.px[i] + XR) / bw)); hist[b]++; }
  // 確率の形を、数えた数と同じ高さの目もりにする
  let area = 0; for (let k = 0; k < 400; k++) area += prob(st, -XR + (k + 0.5) * 2 * XR / 400) * 2 * XR / 400;
  const peak = n * bw / area;                     // 確率の山（P＝1）にあたる数
  const top = Math.max(peak, ...hist, 1);
  for (let k = 0; k < nb; k++) if (hist[k]) v.poly([[-XR + k * bw + 0.03, 0], [-XR + (k + 1) * bw - 0.03, 0], [-XR + (k + 1) * bw - 0.03, hist[k] / top], [-XR + k * bw + 0.03, hist[k] / top]], { fill: 'sub', alpha: 0.45 });
  v.plot(x => prob(st, x) * peak / top, { color: 'b', style: 'dash', width: 2.5 });
  v.axes({ xt: [-10, -5, 0, 5, 10], yt: [], grid: false });
  cv.text('x（μm）', X1, 412, { align: 'right', size: 14, color: 'sub' });
  if (o.dim) {   // しまの間かく
    const s = sp(st), y = 1.08;
    if (s < 2 * XR) { v.line([[0, y], [s, y]], { color: 'ink', width: 2 }); v.line([[0, y - 0.05], [0, y + 0.05]], { color: 'ink', width: 2 }); v.line([[s, y - 0.05], [s, y + 0.05]], { color: 'ink', width: 2 }); v.text('Δx ＝ ' + A.num(s, 2) + ' μm', s + 0.3, y, { size: 15, bg: true }); }
  }
}
