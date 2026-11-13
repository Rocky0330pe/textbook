// @id m4-08
// @title オイラー法がこわれるわけ
// @vol 数学7
// @from 数学 7-10 図7・8・9（ch7-10:568・609・679）
'use strict';
// 本と同じ式・同じ刻み：お湯 dT/dt=−0.05(T−20)（はじめ80℃）、水そうの差 dD/dt=−0.2D（はじめ20 cm）、ばね x'=v・v'=−x（ω=1、はじめ (1,0)）
const DG = Math.PI / 180;
function kind1(a) {
  if (Math.abs(a) > 1) return a < 0 ? '|倍率|>1：ゆれながらふえる（こわれる）' : 'ふえる（こわれる）';
  if (Math.abs(a) === 1) return '境目：大きさが変わらない';
  return a < 0 ? 'ゆれながら近づく（ほんとうはゆれない）' : 'ゆれずに近づく';
}
// 数直線（倍率の場所）
function numLine(cv, box, a, marks) {
  const L = cv.view({ x0: -1.7, x1: 1.15, y0: -1, y1: 1, box });
  L.poly([[-1, -0.3], [1, -0.3], [1, 0.3], [-1, 0.3]], { fill: 'c', alpha: 0.2 });
  L.line([[-1.7, 0], [1.15, 0]], { color: 'sub', width: 1.5 });
  for (const t of [-1.5, -1, -0.5, 0, 0.5, 1]) { L.line([[t, -0.18], [t, 0.18]], { color: 'sub', width: 1 }); L.text(A.num(t, 1), t, -0.6, { size: 14, color: 'sub', align: 'center' }); }
  for (const [x, s] of marks) { L.dot(x, 0, { color: 'sub', r: 3 }); L.text(s, x, 0.55, { size: 14, color: 'sub', align: 'center' }); }
  L.text('こわれない（−1 と 1 のあいだ）', 0, -1.05, { size: 14, color: 'c', align: 'center', bold: true });
  L.dot(A.clamp(a, -1.7, 1.15), 0, { color: 'b', r: 8, shape: 'diamond' });
  return L;
}

function drawOyu(cv, st) {
  const dt = st.dt, a = 1 - 0.05 * dt, tEnd = st.n * dt;
  numLine(cv, [110, 6, 720, 70], a, [[0.95, '1'], [0.5, '10'], [0, '20'], [-0.5, '30'], [-1, '40'], [-1.5, '50']]);
  cv.text('Δt〔分〕', 100, 26, { size: 14, color: 'sub', align: 'right' });
  const g = cv.view({ x0: 0, x1: 210, y0: -60, y1: 140, box: [70, 110, 780, 300] });
  g.axes({ xt: [50, 100, 150, 200], yt: [-40, 20, 50, 80, 110], xl: 't（分）', yl: 'T（℃）' });
  g.line([[0, 20], [210, 20]], { color: 'sub', style: 'dot', width: 1.2 }); g.text('部屋 20℃', 205, 26, { size: 14, color: 'sub', align: 'right' });
  g.plot(t => 20 + 60 * Math.exp(-0.05 * t), { color: 'a', width: 2.5 });
  const pts = []; let T = 80;
  for (let k = 0; k <= Math.floor(st.n) && k * dt <= 210; k++) { pts.push([k * dt, T]); T = 20 + (T - 20) * a; }
  g.clip(() => { g.line(pts, { color: 'b', width: 2.5, style: 'dash' }); pts.forEach(p => g.dot(p[0], p[1], { color: 'b', r: 5, shape: 'square' })); });
  const out = pts.find(p => p[1] > 140 || p[1] < -60);
  if (out) cv.text('画面の外へ（こわれた）', 840, 130, { size: 15, color: 'b', bold: true, align: 'right' });
  void tEnd;
}

function drawSuiso(cv, st) {
  const dt = st.dt, a = 1 - 0.2 * dt;
  numLine(cv, [110, 6, 720, 70], a, [[0.8, '1'], [0.5, '2.5'], [-0.5, '7.5'], [-1, '10']]);
  cv.text('Δt〔分〕', 100, 26, { size: 14, color: 'sub', align: 'right' });
  const g = cv.view({ x0: 0, x1: 18.5, y0: -22, y1: 22, box: [70, 110, 560, 300] });
  g.axes({ xt: [5, 10, 15], yt: [-20, -10, 10, 20], xl: 't（分）', yl: '差 h₁−h₂（cm）' });
  g.plot(t => 20 * Math.exp(-0.2 * t), { color: 'a', width: 2.5 });
  const pts = []; let d = 20;
  for (let k = 0; k <= Math.floor(st.n) && k * dt <= 18.5; k++) { pts.push([k * dt, d]); d *= a; }
  g.clip(() => { g.line(pts, { color: 'b', width: 2.5, style: 'dash' }); pts.forEach(p => g.dot(p[0], p[1], { color: 'b', r: 5, shape: 'square' })); });
  // 右：いまの水そう（合計は変わらない。h₁=10+差/2、h₂=10−差/2）
  const last = pts[pts.length - 1][1], h1 = 10 + last / 2, h2 = 10 - last / 2;
  const tank = (x, h, name) => {
    const H = 260, base = 380, sc = 9;
    cv.rect(x, base - H, 80, H, { color: 'sub', width: 2 });
    const hh = A.clamp(h, -5, 28) * sc;
    if (hh > 0) cv.rect(x + 2, base - hh, 76, hh, { fill: 'a', alpha: 0.35 });
    else cv.text('水位が負！', x + 40, base - 20, { size: 15, color: 'b', bold: true, align: 'center' });
    cv.text(name + ' ' + A.num(h, 1), x + 40, base + 20, { size: 15, align: 'center', bold: true });
  };
  tank(660, h1, 'h₁'); tank(770, h2, 'h₂');
  cv.line([[740, 360], [770, 360]], { color: 'sub', width: 4 });
  cv.text('いまの水位（cm）', 770, 100, { size: 14, color: 'sub', align: 'center' });
}

function drawBane(cv, st) {
  const dt = st.dt, sym = st.m === 's';
  const L = cv.view({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2, box: [10, 10, 420, 420], equal: true });
  L.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x（位置）', yl: 'v（速度）' });
  L.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'a', width: 2.5 });
  let x = 1, v = 0; const pts = [[x, v]];
  for (let k = 0; k < Math.floor(st.n); k++) {
    if (sym) { v = v - x * dt; x = x + v * dt; } else { const xn = x + v * dt; v = v - x * dt; x = xn; }
    pts.push([x, v]); if (Math.hypot(x, v) > 50) break;
  }
  L.clip(() => { L.line(pts, { color: 'b', width: 1.8, style: 'dash' }); pts.forEach((p, k) => { if (k % Math.max(1, Math.round(0.1 / dt)) === 0) L.dot(p[0], p[1], { color: 'b', r: 3 }); }); });
  const p = pts[pts.length - 1];
  if (Math.hypot(p[0], p[1]) < 2.9) L.dot(p[0], p[1], { color: 'b', r: 7, shape: 'square' });
  L.dot(1, 0, { color: 'ink', r: 5, open: true });
  cv.text('半径 ' + A.num(Math.hypot(p[0], p[1]), 3), 30, 30, { size: 15, bold: true });
  // 右：1歩の行列の固有値
  const R = cv.view({ x0: 0.3, x1: 1.7, y0: -0.7, y1: 0.7, box: [460, 10, 410, 420], equal: true });
  R.axes({ xt: [0.5, 1, 1.5], yt: [-0.5, 0.5], xl: '実部', yl: '虚部', ax: 0, ay: 0.3 });
  R.param(Math.cos, Math.sin, -Math.PI / 2, Math.PI / 2, { color: 'c', width: 2 });
  R.line([[1, -0.7], [1, 0.7]], { color: 'sub', style: 'dot', width: 1.5 });
  R.text('1 での接線', 1.03, -0.62, { size: 14, color: 'sub' });
  let lam;
  if (sym) { const re = 1 - dt * dt / 2, D = 1 - dt * dt / 4; lam = D >= 0 ? [[re, dt * Math.sqrt(D)], [re, -dt * Math.sqrt(D)]] : [[re + dt * Math.sqrt(-D), 0], [re - dt * Math.sqrt(-D), 0]]; }
  else lam = [[1, dt], [1, -dt]];
  lam.forEach(l => R.dot(l[0], l[1], { color: 'b', r: 8, shape: 'square' }));
  for (const s of [1, -1]) { R.dot(Math.cos(dt), s * Math.sin(dt), { color: 'a', r: 4 }); cv.circle(R.X(Math.cos(dt)), R.Y(s * Math.sin(dt)), 11, { color: 'a', width: 2.5 }); }
  R.text(sym ? '速度を先に：円の上' : '1 ± jΔt：円の外', lam[0][0] + 0.04, lam[0][1] + 0.08, { size: 15, color: 'b', bold: true, bg: true });
  R.text('e^{±jΔt}（ほんとう）'.replace('^{±jΔt}', '±jΔt'), Math.cos(dt) - 0.05, -Math.sin(dt) - 0.09, { size: 14, color: 'a', align: 'right', bg: true });
}

A.item({
  id: 'm4-08', title: 'オイラー法がこわれるわけ',
  from: '数学 第7巻 7-10⑧⑨「オイラー法は、行列のくり返し」の図から（8-13、9-10・9-11、物理 力-16 でも使う）',
  W: 880, H: 440,
  state: { dt: 10, n: 0, m: 'f', pre: 0 },
  scenes: [
    {
      key: 'oyu', label: '① 冷めるお湯',
      lead: '冷めるお湯（6-2）をオイラー法で計算します。1歩で、部屋との差は $1-0.05\\,\\Delta t$ 倍。$\\Delta t$ を変えて ▶ をおしましょう。',
      note: '$\\Delta t$ をふやすと、1歩の倍率 $1-0.05\\,\\Delta t$ は数直線を左へ進みます。20分までは0以上でゆれず、20〜40分では負の数なので、部屋の温度の上と下をふらふらしながら近づきます。40分をこえると倍率が $-1$ を割り、ゆれながらふえて**こわれます**。こわれない条件は $|1+\\lambda\\,\\Delta t|<1$ です。',
      miss: '倍率が負の数でも、大きさが1より小さければ消えていきます。こわれるかどうかは、倍率の**大きさ**で決まります。',
      state: { dt: 30, n: 0 },
      legend: [['ほんとうの答え', { color: 'a' }], ['オイラー法', { color: 'b', style: 'dash', shape: 'square' }], ['こわれない区間', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 'dt', label: '$\\Delta t$〔分〕', min: 1, max: 50, step: 1, d: 0, on: st => { st.n = 200; } }],
      step(st, dt) { st.n = Math.min(210 / st.dt, st.n + dt * 3); if (st.n >= 210 / st.dt) return false; },
      draw: drawOyu,
      readout: st => { const a = 1 - 0.05 * st.dt; return `1歩の倍率 $1-0.05\\times${st.dt}=${A.num(a, 2)}$　→　${kind1(a)}`; }
    },
    {
      key: 'suiso', label: '② 水そうの差',
      lead: '2つの水そうの水位の差は、ほんとうは $20e^{-0.2t}$ でへります。オイラー法の1歩の倍率は $1-0.2\\,\\Delta t$ です。',
      note: '本の3つの $\\Delta t$：1分なら1歩で0.8倍、2.5分なら0.5倍、7.5分なら $-0.5$ 倍。7.5分では差がマイナスになり、左右の水位が入れかわります（ほんとうはおこらない）。10分をこえると倍率が $-1$ を割り、こわれます。',
      miss: 'オイラー法の1歩は $\\vec x_{n+1}=A\\,\\Delta t\\,\\vec x_n$ ではなく、$\\vec x_{n+1}=(I+A\\,\\Delta t)\\,\\vec x_n$ です。',
      state: { dt: 7.5, n: 0, pre: 7.5 },
      legend: [['ほんとう $20e^{-0.2t}$', { color: 'a' }], ['オイラー法', { color: 'b', style: 'dash', shape: 'square' }]],
      controls: [{ seg: 'dt', label: '本の $\\Delta t$', options: [[1, '1分'], [2.5, '2.5分'], [7.5, '7.5分'], [11, '11分']], on: st => { st.n = 0; } }, { range: 'dt', label: '$\\Delta t$〔分〕', min: 0.5, max: 12, step: 0.5, d: 1, on: st => { st.n = 100; } }],
      step(st, dt) { st.n = Math.min(18.5 / st.dt, st.n + dt * 1.5); if (st.n >= 18.5 / st.dt) return false; },
      draw: drawSuiso,
      readout: st => { const a = 1 - 0.2 * st.dt; return `1歩の倍率 $1-0.2\\times${A.num(st.dt, 1)}=${A.num(a, 2)}$（ほんとうは $e^{-0.2\\times${A.num(st.dt, 1)}}=${A.num(Math.exp(-0.2 * st.dt), 3)}$）　→　${kind1(a)}`; }
    },
    {
      key: 'bane', label: '③ ばねがふくらむ',
      lead: 'ばね（$\\omega=1$）を、位置 $x$ と速度 $v$ の組でオイラー法で進めます。ほんとうの動きは半径1の円です。',
      note: 'ふつうのオイラー法の1歩の行列の固有値は $1\\pm j\\,\\Delta t$ で、単位円の1での**接線の上**にあります。大きさ $\\sqrt{1+\\Delta t^2}$ はいつも1より大きいので、点は1歩ごとに外へ出て、うずを巻いてふくらみます。$\\Delta t=0.1$ なら1周（約63歩）で $1.01^{31.5}\\approx1.37$ 倍。速度を先に進める方法では、行列式がちょうど1で、固有値は単位円の上（$\\Delta t<2$ のとき）にのります。',
      state: { dt: 0.1, n: 0, m: 'f' },
      legend: [['ほんとうの動き（半径1の円）', { color: 'a' }], ['オイラー法の点', { color: 'b', style: 'dash' }], ['1歩の行列の固有値', { color: 'b', shape: 'square', noline: true }], ['ほんとうの $e^{\\pm j\\Delta t}$（○）', { color: 'a', shape: 'circle', noline: true }]],
      controls: [{ range: 'dt', label: '$\\Delta t$', min: 0.05, max: 0.5, step: 0.01, on: st => { st.n = 4 * Math.PI / st.dt; } }, { seg: 'm', label: '進め方', options: [['f', 'ふつうのオイラー法'], ['s', '速度を先に進める']], on: st => { st.n = 0; } }],
      step(st, dt) { const N = 4 * Math.PI / st.dt; st.n = Math.min(N, st.n + dt * N / 6); if (st.n >= N) return false; },
      draw: drawBane,
      readout: st => { const d = st.dt; if (st.m === 's') return `速度を先に：$\\det=1$、固有値の大きさ 1　→　1周してもほぼ同じ大きさ`; const r = Math.sqrt(1 + d * d); return `固有値の大きさ $\\sqrt{1+\\Delta t^2}=${A.num(r, 5)}$、1周の倍率 $(1+\\Delta t^2)^{\\pi/\\Delta t}=${A.num(Math.pow(1 + d * d, Math.PI / d), 2)}$`; }
    }
  ]
});
