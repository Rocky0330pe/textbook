// @id m4-29
// @title 棒の熱を sin に分ける：フーリエの方法と固有ベクトル
// @vol 数学9
// @from 数学 9-11 図4・5（ch9-11:708・727）、9-1 図8・10（ch9-01:671・743）、9-13 図5（ch9-13:385）／8-13・9-3⑩・物理 熱-11 でも使う
'use strict';
// 9-1：長さ L=0.1 m の棒、はじめどこも100 ℃、両はし0 ℃、α=1×10⁻⁴ m²/s。
// T(x,t) = Σ（奇数 n）400/(nπ)·e^{−α(nπ/L)²t}·sin(nπx/L)
const L = 0.1, AL = 1e-4;
const kn = n => AL * (n * Math.PI / L) ** 2;                  // n 番めの消える速さ〔1/s〕（n=1 で 0.0987）
function series(x, t, N = 200) { let s = 0; for (let k = 0; k < N; k++) { const n = 2 * k + 1; s += 400 / (n * Math.PI) * Math.exp(-kn(n) * t) * Math.sin(n * Math.PI * x / L); } return s; }
// 9-11：9つの点の行列（α/Δx²=1）。固有値 −4sin²(mπ/20)、固有ベクトル sin(mπi/10)
const lam = m => -4 * Math.sin(m * Math.PI / 20) ** 2;
function matrix(i, t) { let s = 0; for (let m = 1; m <= 9; m++) { let c = 0; for (let j = 1; j <= 9; j++) c += 100 * Math.sin(m * Math.PI * j / 10); s += c * 0.2 * Math.exp(lam(m) * t) * Math.sin(m * Math.PI * i / 10); } return s; }
const MODE = [['a', 'solid'], ['b', 'dash'], ['c', 'dot']];

A.item({
  id: 'm4-29', title: '棒の熱を sin に分ける：フーリエの方法と固有ベクトル',
  from: '数学 第9巻 9-11 図4・5・9-1 図8・10・9-13 図5 から（8-13・9-3、物理 熱-11 でも使う）',
  W: 880, H: 440,
  state: { t: 0, modes: true, m: 1, tm: 0 },
  scenes: [
    {
      key: 'bunkai', label: '① sin に分けて解く',
      lead: 'どこも100 ℃の棒の両はしを、0 ℃の氷水につけます。はじめの形を $\\sin\\frac{n\\pi x}{L}$ の形に分け、1つずつ時間を進めて、たし直します。',
      note: '$n$ 番めの形は、形を保ったまま $e^{-\\alpha(n\\pi/L)^2t}$ で小さくなります。でこぼこが $n$ 倍細かいと、$n^2$ 倍**速く消えます**（$n=1$ は7.0秒、$n=3$ は0.78秒、$n=5$ は0.28秒で半分）。だから数秒で角がとれ、あとは $n=1$ のなだらかな山のまま小さくなります。まん中が50 ℃になるのは約9.47秒後です。',
      miss: '熱の節の $T$ は温度〔℃〕です。周期の $T$ と読まないこと。棒の長さは $L$、形は $\\sin\\frac{n\\pi x}{L}$ で書きます。',
      init: st => { st.t = 0; },
      legend: [['温度（200項の和）', { color: 'ink' }], ['$n=1$ の形', { color: 'a', style: 'solid' }], ['$n=3$ の形', { color: 'b', style: 'dash' }], ['$n=5$ の形', { color: 'c', style: 'dot' }]],
      controls: [{ range: 't', label: '時刻 $t$〔s〕', min: 0, max: 30, step: 0.1, d: 1 }, { check: 'modes', label: '見る', text: '1つずつの形（$n=1,\\ 3,\\ 5$）も見る' }],
      step(st, dt) { st.t = Math.min(30, st.t + dt * (st.t < 3 ? 1 : 3)); if (st.t >= 30) return false; },
      draw(cv, st) { drawBunkai(cv, st); },
      readout: st => `$t$ ＝ ${A.num(st.t, 1)} s　まん中の温度 ＝ <b>${A.num(series(L / 2, st.t), 2)} ℃</b>　（1項めだけなら ${A.num(400 / Math.PI * Math.exp(-kn(1) * st.t), 2)} ℃）`
    },
    {
      key: 'koyu', label: '② 熱の行列の固有ベクトル',
      lead: '8-13 の表計算の棒（9つの点）を、行列 $A$（ななめに $-2$、となりに1）で $\\frac{\\mathrm{d}\\vec T}{\\mathrm{d}t}=A\\vec T$ と書きます。$A$ の固有ベクトルは、どんな形でしょう。',
      note: '固有ベクトルは $\\sin\\frac{m\\pi i}{10}$（棒）で、9-1 の $\\sin\\frac{m\\pi x}{L}$（線）と9つの点の上でぴったり重なります。固有値は $-4\\sin^2\\frac{m\\pi}{20}$：$m=1$ で $-0.0979$（9-1 の消える速さ0.0987 とほぼ同じ）。▶ で、固有ベクトルの形のまま $e^{\\lambda t}$ で小さくなるようすを見ます。**フーリエの方法は、熱の行列を固有ベクトルに分けること**と同じです。',
      init: st => { st.tm = 0; },
      legend: [['固有ベクトル（9つの点）', { color: 'b', shape: 'square' }], ['$\\sin\\frac{m\\pi x}{L}$', { color: 'a' }], ['$A\\vec v$（$\\lambda$ 倍）', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ range: 'm', label: '山の数 $m$', min: 1, max: 9, step: 1, d: 0, on: st => { st.tm = 0; } }],
      step(st, dt) { st.tm += dt * 2; if (st.tm > 40) return false; },
      draw(cv, st) { drawKoyu(cv, st); },
      readout: st => `$m$ ＝ ${st.m}：固有値 $\\lambda$ ＝ ${A.num(lam(st.m), 4)}（連続の棒では $-\\alpha(\\frac{m\\pi}{L})^2$ ＝ ${A.num(-kn(st.m), 4)}）　$e^{-1}$ 倍になるまで ${A.num(-1 / lam(st.m), 1)} 秒　時刻 ${A.num(st.tm, 1)} s`
    },
    {
      key: 'onaji', label: '③ 2つの答えをくらべる',
      lead: '同じ棒を、9-1 のフーリエ級数（線）と、9-11 の9つの点の行列 $e^{At}$（点）で解きます。',
      note: '2つの答えは、ほとんど同じです。まん中の温度は10秒後に、級数で47.45 ℃、行列で47.44 ℃。50 ℃になるのは9.47秒と9.46秒です。少しちがうのは、棒を9つの点に分けた近似だからです。「表で1歩ずつ計算する」ことと「$\\sin$ に分けて解く」ことは、同じものを別の方向から見ていたのです。',
      legend: [['フーリエ級数（200項）', { color: 'a' }], ['9つの点の行列 $e^{At}$', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 't', label: '時刻 $t$〔s〕', min: 0, max: 30, step: 0.1, d: 1 }],
      init: st => { st.t = 0; },
      step(st, dt) { st.t = Math.min(30, st.t + dt * 3); if (st.t >= 30) return false; },
      draw(cv, st) { drawOnaji(cv, st); },
      readout: st => `$t$ ＝ ${A.num(st.t, 2)} s　まん中：級数 ${A.num(series(L / 2, st.t), 2)} ℃、行列 ${A.num(matrix(5, st.t), 2)} ℃`
    }
  ]
});

function rodView(cv, box) { const v = cv.view({ x0: 0, x1: 0.105, y0: -10, y1: 135, box }); v.axes({ xt: [0, 0.02, 0.04, 0.06, 0.08, 0.1], yt: [25, 50, 75, 100, 125], xfmt: x => A.num(x * 100, 0), xl: 'x（cm）', yl: '℃', zero: true }); return v; }
function drawBunkai(cv, st) {
  const v = rodView(cv, [50, 14, 520, 400]), t = st.t;
  v.line([[0, 0], [0, 100], [0.1, 100], [0.1, 0]], { color: 'grid', width: 1.5 });
  if (st.modes) [1, 3, 5].forEach((n, k) => v.plot(x => 400 / (n * Math.PI) * Math.exp(-kn(n) * t) * Math.sin(n * Math.PI * x / L), { x0: 0, x1: 0.1, color: MODE[k][0], style: MODE[k][1], width: 2.2 }));
  v.plot(x => series(x, t), { x0: 0, x1: 0.1, color: 'ink', width: 3.5, n: 260 });
  v.dot(0.05, series(0.05, t), { color: 'ink', r: 5 });
  // 右：成分の大きさ（棒）。n² 倍速く小さくなる
  const s = cv.view({ x0: 0, x1: 10, y0: 0, y1: 135, box: [620, 30, 240, 360] });
  s.axes({ xt: [1, 3, 5, 7, 9], yt: [25, 50, 75, 100, 125], xl: 'n', yl: '大きさ', grid: false });
  for (let n = 1; n <= 9; n += 2) { const b0 = 400 / (n * Math.PI), b = b0 * Math.exp(-kn(n) * t); s.poly([[n - 0.6, 0], [n + 0.6, 0], [n + 0.6, b0], [n - 0.6, b0]], { color: 'line', width: 1, style: 'dash' }); s.poly([[n - 0.6, 0], [n + 0.6, 0], [n + 0.6, b], [n - 0.6, b]], { fill: n <= 5 ? MODE[(n - 1) / 2][0] : 'sub', alpha: 0.75 }); }
  cv.text('破線のわく：はじめの大きさ 400/(nπ)', 740, 412, { align: 'center', size: 14, color: 'sub' });
}

function drawKoyu(cv, st) {
  const m = st.m, f = Math.exp(lam(m) * st.tm), v = cv.view({ x0: 0, x1: 0.105, y0: -1.25, y1: 1.25, box: [50, 14, 560, 400] });
  v.axes({ xt: [0, 0.02, 0.04, 0.06, 0.08, 0.1], yt: [-1, -0.5, 0.5, 1], xfmt: x => A.num(x * 100, 0), xl: 'x（cm）', zero: true });
  v.plot(x => Math.sin(m * Math.PI * x / L), { x0: 0, x1: 0.1, color: 'a', width: 1.5, alpha: 0.4 });
  v.plot(x => f * Math.sin(m * Math.PI * x / L), { x0: 0, x1: 0.1, color: 'a', width: 2.5 });
  for (let i = 1; i <= 9; i++) {
    const vi = Math.sin(m * Math.PI * i / 10), x = i / 100;
    v.line([[x, 0], [x, f * vi]], { color: 'b', width: 7, alpha: 0.75 });
    const left = i > 1 ? Math.sin(m * Math.PI * (i - 1) / 10) : 0, right = i < 9 ? Math.sin(m * Math.PI * (i + 1) / 10) : 0, Av = left - 2 * vi + right;
    if (st.tm === 0) v.dot(x + 0.0035, Av, { color: 'd', shape: 'diamond', r: 5 });
  }
  // 右：9×9 の行列のようす
  const X = 650, Y = 60, c = 22;
  cv.text('行列 A（9×9）', X + 4.5 * c, Y - 26, { align: 'center', size: 15, bold: true });
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const a = i === j ? '−2' : Math.abs(i - j) === 1 ? '1' : '·'; cv.text(a, X + j * c + c / 2, Y + i * c + c / 2, { align: 'center', size: 14, color: a === '·' ? 'sub' : 'ink' }); }
  cv.line([[X - 2, Y - 2], [X - 6, Y - 2], [X - 6, Y + 9 * c + 2], [X - 2, Y + 9 * c + 2]], { color: 'ink', width: 1.5 });
  cv.line([[X + 9 * c + 2, Y - 2], [X + 9 * c + 6, Y - 2], [X + 9 * c + 6, Y + 9 * c + 2], [X + 9 * c + 2, Y + 9 * c + 2]], { color: 'ink', width: 1.5 });
  cv.text(`A v ＝ λ v（λ ＝ ${A.num(lam(m), 4)}）`, X + 4.5 * c, Y + 9 * c + 30, { align: 'center', size: 15 });
  cv.text(st.tm === 0 ? '◆ は A v：どの点も v の λ 倍' : `形はそのまま、${A.num(f, 3)} 倍に`, X + 4.5 * c, Y + 9 * c + 56, { align: 'center', size: 15, color: 'd' });
}

function drawOnaji(cv, st) {
  const v = rodView(cv, [50, 14, 520, 400]), t = st.t;
  v.line([[0, 0], [0, 100], [0.1, 100], [0.1, 0]], { color: 'grid', width: 1.5 });
  v.plot(x => series(x, t), { x0: 0, x1: 0.1, color: 'a', width: 3, n: 260 });
  for (let i = 1; i <= 9; i++) v.dot(i / 100, matrix(i, t), { color: 'b', shape: 'square', r: 6 });
  // 右：まん中の温度の時間変化
  const g = cv.view({ x0: 0, x1: 31, y0: 0, y1: 110, box: [620, 30, 240, 360] });
  g.axes({ xt: [10, 20, 30], yt: [25, 50, 75, 100], xl: 't（s）', yl: 'まん中 ℃' });
  g.plot(u => series(L / 2, u), { x0: 0.05, x1: 31, color: 'a', width: 2.5, n: 200 });
  for (let u = 0; u <= 30; u += 2.5) g.dot(u, u === 0 ? 100 : matrix(5, u), { color: 'b', shape: 'square', r: 3.5 });
  g.line([[0, 50], [9.47, 50], [9.47, 0]], { color: 'd', style: 'dot', width: 1.5 });
  g.text('9.47', 9.47, -8, { align: 'center', size: 14, color: 'd' });
  g.dot(t, series(L / 2, Math.max(t, 0.05)), { color: 'a', r: 6 });
}
