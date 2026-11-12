// @id p2-03
// @title ゆすると共振する：大きさとおくれ
// @vol 物理3
// @from 物理 波-2 ②③④（p3-02 ゆすったふりこ・表計算のゆれ・共振曲線）／電-10・波-10 でも使う
'use strict';
// 本の数：m=0.5 kg、k=8 N/m、c=0.4 N·s/m（ωn=4 rad/s、ζ=0.1）、F0=0.8 N（F0/k=0.1 m）。
// ふりこの上のはしを u=U cos ωt（U=F0/k=0.1 m）でゆすると、おもりのずれ x は m x''+c x'+k x = k u = F0 cos ωt と同じ式になる。
const WN = 4, U = 0.1;
const TAB = [[1, 0.107, 3], [2, 0.132, 8], [3, 0.216, 19], [3.5, 0.342, 37], [3.8, 0.468, 63], [4, 0.5, 90], [4.2, 0.428, 116], [4.5, 0.287, 140], [5, 0.162, 156], [6, 0.078, 167], [8, 0.033, 172]];
A.item({
  id: 'p2-03', title: 'ゆすると共振する：大きさとおくれ',
  from: '物理 第3巻 波-2 ②③④ の図「ゆする速さとふりこ」「共振曲線」から（電-10・波-10 でも使う）',
  W: 880, H: 430,
  state: { t: 0, x: 0, v: 0, w: 4, z: 0.1, hist: [], z3: 0.1 },
  scenes: [
    {
      key: 'yusuru', label: '① ゆすってみる',
      lead: 'ふりこの上のはし（手）を 0.1 m の幅で左右にゆすります。止まっていたおもりは、どうゆれ始めるでしょう。',
      note: 'ゆすり始めは、ゆする力に合わせたゆれと、おもりが自分の固有振動数でゆれようとするゆれがまざって、大きくなったり小さくなったり（うなり）します。自分のゆれはダンパーで消えるので、10〜20秒たつと、手と同じ振動数のゆれが続きます。$\\omega=4$（ちょうど $\\omega_{\\mathrm n}$）では 0.5 m、$\\omega=3$ では約 0.22 m で落ち着きます。',
      legend: [['おもりのずれ $x$', { color: 'a' }], ['手のずれ $u$（＝$F_0/k$ の大きさ 0.1 m）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'w', label: 'ゆする速さ $\\omega$〔rad/s〕', min: 1, max: 8, step: 0.1, d: 1 }, { button: '止めてから、ゆすり直す', act: st => { st.t = 0; st.x = 0; st.v = 0; st.hist = []; } }],
      autoplay: true,
      step(st, dt) { sim(st, dt); },
      draw(cv, st) { yusuru(cv, st); },
      readout: st => `$\\omega/\\omega_{\\mathrm n}$ ＝ ${A.num(st.w / WN, 2)}　　落ち着いたあとの振幅（式）＝ <b>${A.num(U * amp(st.w / WN, st.z), 3)} m</b>（$F_0/k$ の ${A.num(amp(st.w / WN, st.z), 2)} 倍）　　時刻 ${A.num(st.t, 1)} s`
    },
    {
      key: 'kyokusen', label: '② 共振曲線とおくれ',
      lead: '落ち着いたあとのゆれの大きさ（倍率）と、手に対するおくれの角が、ゆする速さでどう変わるかを見ましょう。',
      note: 'ゆっくりゆすると、おもりは手と同じ向きに、ほとんど同時に動きます（倍率は約1）。ちょうど $\\omega_{\\mathrm n}$ では大きくゆれ、$\\frac14$ 往復（90°）おくれます。速くゆすると、ほとんど動かず、反対向き（180° に近いおくれ）です。倍率とおくれは、$\\omega/\\omega_{\\mathrm n}$ と $\\zeta$ の2つだけで決まります。',
      legend: [['式（いまの $\\zeta$）', { color: 'a' }], ['表計算で読みとった値（$\\zeta=0.1$）', { color: 'b', shape: 'circle', noline: true }], ['いまの $\\omega$', { color: 'c', shape: 'diamond', noline: true }], ['手', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'w', label: 'ゆする速さ $\\omega$〔rad/s〕', min: 0.5, max: 8.4, step: 0.05 }, { range: 'z', label: '減衰比 $\\zeta$', min: 0.05, max: 0.5, step: 0.01 }],
      autoplay: true,
      step(st, dt) { st.t += dt; },
      draw(cv, st) { kyokusen(cv, st); },
      readout: st => { const r = st.w / WN, M = amp(r, st.z), ph = lag(r, st.z); return `倍率 ＝ <b>${A.num(M, 2)}</b>（振幅 ${A.num(U * M, 3)} m）　　おくれ ＝ <b>${A.num(ph, 0)}°</b>　　${ph < 30 ? '同じ向きにほぼ同時' : ph < 150 ? (Math.abs(ph - 90) < 12 ? '¼ 往復おくれ（共振）' : 'おくれが大きくなる所') : '反対向き'}`; }
    },
    {
      key: 'mugen', label: '③ 共振すると無限大？',
      lead: 'ちょうど $\\omega=\\omega_{\\mathrm n}$ でゆすり続けたときの、ゆれの大きさの育ち方を、$\\zeta$ を変えて比べましょう。',
      note: 'ダンパーがあると、ゆれは $F_0/k$ の $1/(2\\zeta)$ 倍で止まります。ゆする力が1周期に入れるエネルギーと、ダンパーが熱にするエネルギーが、ちょうどつり合う大きさです。$\\zeta=0$ だけは、ゆれが時間に比例して大きくなり続けます。',
      miss: '「共振すると振幅は無限大」ではありません。減衰があれば倍率は $1/(2\\zeta)$ で止まります（$\\zeta=0.1$ なら5倍）。ただし $\\zeta$ が小さい物では、何十倍にもなります（$\\zeta=0.01$ なら50倍）。',
      legend: [['ゆれ $x\\div(F_0/k)$', { color: 'a' }], ['止まる高さ $\\pm1/(2\\zeta)$', { color: 'b', style: 'dash' }], ['$\\zeta=0$（ダンパーなし）のゆれの大きさ', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'z3', label: '減衰比 $\\zeta$', min: 0, max: 0.3, step: 0.005, d: 3 }],
      state: { t: 0 },
      autoplay: true,
      step(st, dt) { st.t += dt * 2; if (st.t > 30) st.t = 0; },
      draw(cv, st) { mugen(cv, st); },
      readout: st => st.z3 > 0 ? `$\\zeta$ ＝ ${A.num(st.z3, 3)}　　止まる倍率 $1/(2\\zeta)$ ＝ <b>${A.num(1 / (2 * st.z3), 1)}</b>` : '$\\zeta=0$：倍率は時間に比例して大きくなり続ける（本物の物には、必ず少し減衰がある）'
    }
  ]
});

function amp(r, z) { return 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2); }
function lag(r, z) { return Math.atan2(2 * z * r, 1 - r * r) * 180 / Math.PI; }

// ① の時間を進める（ルンゲ・クッタ。x'' = ωn²(u − x) − 2ζωn x'）
function sim(st, dt) {
  const n = 8, h = dt / n;
  const f = (t, y) => [y[1], WN * WN * (U * Math.cos(st.w * t) - y[0]) - 2 * st.z * WN * y[1]];
  for (let i = 0; i < n; i++) { const y = A.rk4(f, st.t, [st.x, st.v], h); st.x = y[0]; st.v = y[1]; st.t += h; }
  const H = st.hist; if (!H.length || st.t - H[H.length - 1][0] >= 0.02) { H.push([st.t, st.x, U * Math.cos(st.w * st.t)]); if (H.length > 1200) H.splice(0, H.length - 1200); }
}

// ふりこ：手の位置 u と、おもりのずれ x〔m〕
function pend(cv, cx, top, len, u, x, sc) {
  const hx = cx + u * sc, bx = cx + x * sc, by = top + len;
  cv.line([[cx - 110, top - 14], [cx + 110, top - 14]], { color: 'sub', width: 1 });
  cv.line([[cx, top - 20], [cx, by + 30]], { color: 'grid', width: 1.5, style: 'dot' });
  cv.line([[hx, top], [bx, by]], { color: 'ink', width: 2 });
  cv.rect(hx - 16, top - 10, 32, 14, { fill: 'b', alpha: 0.35, color: 'b', width: 1.5 });
  cv.text('手', hx + 20, top - 3, { size: 14, color: 'b' });
  cv.rect(bx - 16, by - 12, 32, 24, { fill: 'a', alpha: 0.35, color: 'a', width: 2 });
}

function yusuru(cv, st) {
  const u = U * Math.cos(st.w * st.t);
  pend(cv, 140, 70, 250, u, st.x, 220);
  cv.text('0.1 m の幅で', 140, 30, { align: 'center', size: 14, color: 'sub' });
  cv.text('ω ＝ ' + A.num(st.w, 1) + ' rad/s', 140, 395, { align: 'center', size: 15 });
  const t1 = Math.max(20, st.t), t0 = t1 - 20;
  const g = cv.view({ x0: t0, x1: t1, y0: -0.62, y1: 0.68, box: [300, 25, 560, 370] });
  g.axes({ xt: A.range(Math.ceil(t0 / 5) * 5, t1, 5), yt: [-0.5, -0.1, 0.1, 0.5], xl: 't〔s〕', yl: 'x〔m〕', ax: 0, ay: t0, xfmt: v => A.num(v, 0) });
  const H = st.hist.filter(p => p[0] >= t0);
  if (H.length > 1) { g.clip(() => { cv.line(H.map(p => g.P([p[0], p[2]])), { color: 'b', style: 'dash', width: 1.5 }); cv.line(H.map(p => g.P([p[0], p[1]])), { color: 'a', width: 2.5 }); }); }
  const M = U * amp(st.w / WN, st.z);
  if (M < 0.6) for (const s of [1, -1]) g.line([[t0, s * M], [t1, s * M]], { color: 'a', style: 'dot', width: 1 });
  g.text('落ち着く大きさ（点線）' + A.num(M, 2) + ' m', t1, Math.min(0.6, M) + 0.05, { align: 'right', size: 14, color: 'a', bg: true });
}

function kyokusen(cv, st) {
  const r = st.w / WN, M = amp(r, st.z), phd = lag(r, st.z), ph = phd * Math.PI / 180;
  const u = U * Math.cos(st.w * st.t), x = U * M * Math.cos(st.w * st.t - ph);
  pend(cv, 130, 70, 240, u, Math.max(-0.55, Math.min(0.55, x)), 200);
  cv.text(phd < 30 ? 'ゆっくり：同じ向き' : phd < 150 ? (Math.abs(phd - 90) < 12 ? 'ちょうど：¼ 往復おくれ' : 'おくれが変わる所') : '速く：反対向き', 130, 380, { align: 'center', size: 15, bold: true });
  // 共振曲線
  const g = cv.view({ x0: 0, x1: 8.6, y0: 0, y1: 0.58, box: [300, 20, 560, 205] });
  g.axes({ xt: [2, 4, 6, 8], yt: [0.1, 0.2, 0.3, 0.4, 0.5], yl: '振幅〔m〕' });
  g.line([[0, 0.1], [8.6, 0.1]], { color: 'sub', style: 'dash', width: 1 });
  g.text('F0/k ＝ 0.1 m', 8.5, 0.125, { align: 'right', size: 14, color: 'sub' });
  g.plot(w => U * amp(w / WN, st.z), { color: 'a', width: 2.5, n: 500 });
  for (const p of TAB) g.dot(p[0], p[1], { color: 'b', r: 4.5 });
  g.dot(st.w, Math.min(0.58, U * M), { color: 'c', shape: 'diamond', r: 7 });
  // おくれ
  const h = cv.view({ x0: 0, x1: 8.6, y0: 0, y1: 190, box: [300, 245, 560, 150] });
  h.axes({ xt: [2, 4, 6, 8], yt: [90, 180], xl: 'ω〔rad/s〕', yl: 'おくれ〔°〕' });
  h.line([[WN, 0], [WN, 190]], { color: 'sub', style: 'dot', width: 1 });
  h.plot(w => lag(w / WN, st.z), { color: 'a', width: 2.5, n: 500 });
  for (const p of TAB) h.dot(p[0], p[2], { color: 'b', r: 4.5 });
  h.dot(st.w, phd, { color: 'c', shape: 'diamond', r: 7 });
  h.text('ωn ＝ 4', WN + 0.1, 20, { size: 14, color: 'sub' });
}

function mugen(cv, st) {
  const z = st.z3, T1 = 30;
  // x/(F0/k) の式（はじめ止まっている、ω=ωn）
  const f = (zz, t) => {
    if (zz === 0) return 0.5 * (Math.sin(WN * t) - WN * t * Math.cos(WN * t));
    const wd = WN * Math.sqrt(1 - zz * zz);
    return (Math.sin(WN * t) - WN / wd * Math.exp(-zz * WN * t) * Math.sin(wd * t)) / (2 * zz);
  };
  const g = cv.view({ x0: 0, x1: T1, y0: -27, y1: 27, box: [70, 20, 760, 380] });
  g.axes({ xt: [5, 10, 15, 20, 25, 30], yt: [-20, -10, -5, 5, 10, 20], xl: 't〔s〕', yl: 'x ÷ (F0/k)' });
  // ζ=0 のゆれの大きさ（つつみ）ωn t / 2
  for (const sg of [1, -1]) g.plot(t => sg * WN * t / 2, { color: 'sub', style: 'dot', width: 2.5 });
  if (z > 0) {
    const M = 1 / (2 * z);
    if (M < 27) for (const s of [1, -1]) g.line([[0, s * M], [T1, s * M]], { color: 'b', style: 'dash', width: 2 });
    if (M < 27) g.text('1/(2ζ) ＝ ' + A.num(M, 1), T1 - 0.3, M + 1.6, { align: 'right', size: 15, color: 'b', bg: true });
  }
  g.plot(t => f(z, t), { x0: 0, x1: st.t, color: 'a', width: 2.2, n: 1500 });
  g.dot(st.t, f(z, st.t), { color: 'a', r: 5 });
  g.text('ζ ＝ 0 では、時間に比例して大きくなり続ける（点線）', 1, -24, { size: 14, color: 'sub', bg: true });
}
