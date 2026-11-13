// @id m4-28
// @title 倒立振子を立たせる：状態と固有値
// @vol 数学9
// @from 数学 9-10 図2・7・⑨（ch9-10:308・677・812）、7-8 図10（ch7-08:711）、9-11 図3（ch9-11:505）／7-8⑧・9-11⑦・9-12⑨・物理 波-4・力-16 でも使う
'use strict';
// 手のひらの棒（9-10）：ℓ=2.45 m で g/ℓ=4。小さいかたむきで θ'' = 4θ + u、u = −(k₁θ + k₂θ')。手の加速度 a = −ℓu
const L = 2.45;
function deriv(st) { return (t, y) => [y[1], 4 * y[0] - (st.ctl ? (st.k1 * y[0] + st.k2 * y[1]) : 0)]; }
function initRun(st) { st.y = [st.th0, st.w0]; st.t = 0; st.path = [[st.th0, st.w0]]; st.x = 0; st.vx = 0; }
// 2次の特性方程式 λ² + k₂λ + (k₁−4) = 0 の解
function eig(k1, k2) { const D = k2 * k2 - 4 * (k1 - 4); return D >= 0 ? [[(-k2 + Math.sqrt(D)) / 2, 0], [(-k2 - Math.sqrt(D)) / 2, 0]] : [[-k2 / 2, Math.sqrt(-D) / 2], [-k2 / 2, -Math.sqrt(-D) / 2]]; }
function respond(k1, k2, T, h) { const f = (t, y) => [y[1], 4 * y[0] - k1 * y[0] - k2 * y[1]]; let y = [0.01, 0]; const out = [[0, 0.01]]; for (let t = 0; t < T - 1e-9; t += h) { y = A.rk4(f, t, y, h); out.push([t + h, y[0]]); } return out; }
const fmtL = ([re, im]) => Math.abs(im) < 1e-9 ? A.num(re, 2) : `${A.num(re, 2)}${im > 0 ? '＋' : '−'}${A.num(Math.abs(im), 2)}j`;

A.item({
  id: 'm4-28', title: '倒立振子を立たせる：状態と固有値',
  from: '数学 第9巻 9-10 図2・7・⑨・7-8 図10・9-11 図3 から（物理 波-4・力-16 でも使う）',
  W: 880, H: 440,
  state: { ctl: false, th0: 0.1, w0: 0, k1: 8, k2: 4, dt: 0.1 },
  scenes: [
    {
      key: 'jotai', label: '① 状態の点',
      lead: '棒の状態は「かたむき $\\theta$」と「たおれる速さ $\\theta′$」の2つの数で、右の平面の1つの点です。▶ で、何もしないときと、手を動かすときをくらべます。右の平面をドラッグすると、はじめの状態を変えられます。',
      note: '何もしないと、点は（灰色の点線の上をのぞいて）原点から遠ざかり、棒はたおれます。かたむきと速さに合わせて $u=-(8\\theta+4\\theta′)$ と手を動かすと、点は原点（立って止まった状態）に吸いこまれます。棒が立ち続けるとは、**状態の点を原点に引き寄せ続けること**です。',
      init: initRun,
      legend: [['状態の点の道', { color: 'a' }], ['原点に近づく直線（$\\theta′=-2\\theta$）', { color: 'sub', style: 'dot' }], ['はじめの状態', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ seg: 'ctl', label: '手', options: [[false, '何もしない（$u=0$）'], [true, '$u=-(8\\theta+4\\theta′)$']], on: initRun }],
      drag: {
        hit(st, x) { return x > 440 ? 'p' : null; },
        move(st, x, y) { const v = phaseView(); const [a, b] = v.inv(x, y); st.th0 = A.clamp(+a.toFixed(3), -0.28, 0.28); st.w0 = A.clamp(+b.toFixed(3), -0.55, 0.55); initRun(st); }
      },
      step(st, dt) {
        const h = 1 / 120, n = Math.round(dt / h) || 1, f = deriv(st);
        for (let k = 0; k < n; k++) { const y0 = st.y; st.y = A.rk4(f, st.t, st.y, h); const u = st.ctl ? -(st.k1 * y0[0] + st.k2 * y0[1]) : 0; st.vx += -L * u * h; st.x += st.vx * h; st.t += h; }
        st.path.push(st.y.slice());
        if (Math.abs(st.y[0]) > 1.2 || st.t > 6) return false;
      },
      draw(cv, st) { drawJotai(cv, st); },
      readout: st => `$t$ ＝ ${A.num(st.t, 2)} s　$\\theta$ ＝ ${A.num(st.y[0], 3)} rad　$\\theta′$ ＝ ${A.num(st.y[1], 3)} rad/s` + (Math.abs(st.y[0]) > 1.2 ? '　<b>たおれた</b>' : '') + (st.ctl ? `　手の加速度 ＝ ${A.num(L * (st.k1 * st.y[0] + st.k2 * st.y[1]), 3)} m/s²` : '')
    },
    {
      key: 'koyuchi', label: '② 固有値を置く',
      lead: '$k_1$・$k_2$ を変えると、$A-BK$ の固有値（×）が動きます。はじめ $\\theta=0.01$ rad の棒が、どう起き上がるでしょう。',
      note: '特性方程式は $\\lambda^2+k_2\\lambda+(k_1-4)=0$。固有値を $-p$ の重解にするには $k_2=2p$、$k_1=p^2+4$（$p=2$ なら $k_1=8$、$k_2=4$）。固有値を左へ置くほど速く立ちますが、そのぶん手を大きく速く動かします。$k_2=0$（かたむきだけ見る）では、固有値がたての軸に乗って、ゆれ続けます。',
      miss: 'かたむきだけ見ても立ちません。たおれる速さの項 $k_2\\theta′$ が、ダンパーのようにゆれのエネルギーをうばいます。',
      legend: [['かたむき $\\theta(t)$', { color: 'a' }], ['固有値 ×', { color: 'd', noline: true }], ['左半分（実部が負）', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 'k1', label: '$k_1$（かたむき）', min: 0, max: 24, step: 0.5, d: 1 }, { range: 'k2', label: '$k_2$（たおれる速さ）', min: 0, max: 10, step: 0.5, d: 1 },
        { button: '$-1$、$-1$', act: st => { st.k1 = 5; st.k2 = 2; } }, { button: '$-2$、$-2$', act: st => { st.k1 = 8; st.k2 = 4; } }, { button: '$-4$、$-4$', act: st => { st.k1 = 20; st.k2 = 8; } }, { button: 'かたむきだけ', act: st => { st.k1 = 8; st.k2 = 0; } }],
      draw(cv, st) { drawKoyuchi(cv, st); },
      readout: st => { const e = eig(st.k1, st.k2), r = respond(st.k1, st.k2, 6, 0.005); let t1 = null; for (let i = r.length - 1; i >= 0; i--) if (Math.abs(r[i][1]) > 0.001) { t1 = i < r.length - 1 ? r[i + 1][0] : null; break; } return `固有値 ＝ ${fmtL(e[0])}、${fmtL(e[1])}　はじめの手の加速度 ＝ ${A.num(L * st.k1 * 0.01, 3)} m/s²　` + (e[0][0] < 0 && t1 !== null ? `0.001 rad になるまで ${A.num(t1, 1)} 秒` : (e[0][0] >= 0 ? '<b>落ち着かない</b>' : '')); }
    },
    {
      key: 'kurikaeshi', label: '③ コンピュータのくり返し',
      lead: 'ロボットは、$\\Delta t$ ごとにセンサーを読んで手を動かします。$\\vec x_{k+1}=(I+(A-BK)\\Delta t)\\vec x_k$ のくり返しです。$\\Delta t$ を長くすると？',
      note: '1歩の行列の固有値は $\\mu=1-2\\Delta t$（重解）。大きさが1より小さい（緑の円の中）なら落ち着きます：$0<\\Delta t<1$。$\\Delta t=1.2$ 秒では $\\mu=-1.4$ で、棒は左右にゆれながら、どんどんたおれます（0.01、0.01、$-0.048$、0.114、$-0.225$、0.407、…）。',
      miss: '連続の式では「固有値の実部が負」、くり返しでは「固有値の大きさが1より小さい」が、落ち着く条件です。取りちがえないこと。',
      legend: [['くり返しの $\\theta_k$', { color: 'b', shape: 'square' }], ['連続の答え $0.01(1+2t)e^{-2t}$', { color: 'a', style: 'dash' }], ['$\\mu$ の場所', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ range: 'dt', label: '$\\Delta t$〔s〕', min: 0.05, max: 1.4, step: 0.05, d: 2 }],
      draw(cv, st) { drawDt(cv, st); },
      readout: st => { const xs = iterate(st.dt, 6); return `$\\mu=1-2\\Delta t$ ＝ ${A.num(1 - 2 * st.dt, 2)}　$\\theta_k$ ＝ ${xs.slice(0, 6).map(v => A.num(v, Math.abs(v) < 0.1 ? 4 : 3)).join('、')}、…`; }
    }
  ]
});

function phaseView(cv) { return new A.View(cv || { W: 880, H: 440 }, { x0: -0.3, x1: 0.3, y0: -0.6, y1: 0.6, box: [470, 14, 390, 410] }); }
function drawCart(cv, cx, by, th, scale) {
  const len = 230 * scale, tx = cx + len * Math.sin(th), ty = by - len * Math.cos(th);
  cv.rect(cx - 45, by, 90, 26, { fill: 'sub', alpha: 0.3, color: 'sub', width: 2 });
  cv.text('手（台車）', cx, by + 13, { align: 'center', size: 14 });
  cv.line([[cx, by - len - 20], [cx, by]], { color: 'grid', width: 1.5, style: 'dash' });
  cv.line([[cx, by], [tx, ty]], { color: 'ink', width: 5 });
  cv.circle(tx, ty, 13, { fill: 'b', alpha: 0.9, color: 'b', width: 2 });
}
function drawJotai(cv, st) {
  const th = A.clamp(st.y[0], -Math.PI / 2, Math.PI / 2);
  cv.line([[20, 330], [440, 330]], { color: 'sub', width: 1.5 });
  const cx = A.clamp(230 + st.x * 120, 70, 390);
  drawCart(cv, cx, 300, th, 1);
  cv.text(`θ ＝ ${A.num(st.y[0] * 180 / Math.PI, 1)}°`, 230, 370, { align: 'center', size: 16 });
  if (Math.abs(st.y[0]) > 1.2) cv.text('たおれた', 230, 400, { align: 'center', size: 17, bold: true, color: 'd' });
  const v = phaseView(cv);
  v.axes({ xt: [-0.2, -0.1, 0.1, 0.2], yt: [-0.4, -0.2, 0.2, 0.4], xl: 'θ', yl: 'θ′', xfmt: x => A.num(x, 1) });
  // 流れの矢印（いまの手の決め方での θ', θ'' の向き）
  const f = deriv(st);
  for (let a = -0.25; a <= 0.251; a += 0.05) for (let b = -0.5; b <= 0.51; b += 0.1) { const [p, q] = f(0, [a, b]); const L2 = Math.hypot(p / 0.6, q / 1.2) || 1, s = 0.022 / L2; v.arrow(a, b, a + p * s, b + q * s * 2, { color: 'a', width: 1, head: 6, alpha: 0.3 }); }
  v.line([[-0.3, 0.6], [0.3, -0.6]], { color: 'sub', style: 'dot', width: 2 });
  v.clip(() => v.line(st.path, { color: 'a', width: 3 }));
  v.dot(st.th0, st.w0, { color: 'b', r: 6 });
  if (Math.abs(st.y[0]) < 0.3 && Math.abs(st.y[1]) < 0.6) v.dot(st.y[0], st.y[1], { color: 'a', r: 6, shape: 'square' });
  v.dot(0, 0, { color: 'ink', r: 4 });
}

function drawKoyuchi(cv, st) {
  const e = eig(st.k1, st.k2);
  const v = cv.view({ x0: -8.6, x1: 2.6, y0: -5, y1: 5, box: [20, 14, 330, 410], equal: true });
  v.poly([[v.x0, v.y0], [0, v.y0], [0, v.y1], [v.x0, v.y1]], { fill: 'c', alpha: 0.1 });
  v.axes({ xt: [-8, -6, -4, -2, 2], yt: [-4, -2, 2, 4], xl: '実部', yl: '虚部' });
  v.dot(2, 0, { color: 'sub', shape: 'cross', r: 7 }); v.dot(-2, 0, { color: 'sub', shape: 'cross', r: 7 }); v.text('何もしない ±2', 0.3, 1.0, { size: 14, color: 'sub' });
  for (const p of e) if (p[0] > v.x0) v.dot(p[0], p[1], { color: 'd', shape: 'cross', r: 10 });
  const g = cv.view({ x0: 0, x1: 4.2, y0: -0.0115, y1: 0.0115, box: [400, 14, 460, 410] });
  g.axes({ xt: [1, 2, 3, 4], yt: [-0.01, -0.005, 0.005, 0.01], xl: 't（s）', yl: 'θ（rad）', yfmt: y => A.num(y, 3) });
  g.plot(t => 0.01 * Math.cosh(2 * t), { x0: 0, x1: 4.2, color: 'sub', style: 'dot', width: 2 });
  g.text('何もしない（0.01 cosh 2t）', 0.75, 0.0105, { size: 14, color: 'sub' });
  g.clip(() => g.line(respond(st.k1, st.k2, 4.2, 0.01), { color: 'a', width: 3 }));
}

function iterate(dt, n) { let x = 0.01, w = 0; const out = [x]; for (let k = 0; k < n; k++) { const x2 = x + dt * w, w2 = w + dt * (-4 * x - 4 * w); x = x2; w = w2; out.push(x); } return out; }
function drawDt(cv, st) {
  const dt = st.dt, N = Math.ceil(6.4 / dt), xs = iterate(dt, N), mu = 1 - 2 * dt;
  const g = cv.view({ x0: 0, x1: 6.5, y0: -0.26, y1: 0.16, box: [40, 14, 560, 410] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-0.2, -0.1, 0.1], xl: 't（s）', yl: 'θ（rad）', yfmt: y => A.num(y, 1) });
  g.plot(t => 0.01 * (1 + 2 * t) * Math.exp(-2 * t), { color: 'a', style: 'dash', width: 2.5 });
  g.clip(() => xs.forEach((x, k) => { const t = k * dt; if (t > 6.5) return; g.line([[t, 0], [t, x]], { color: 'b', width: 2 }); g.dot(t, x, { color: 'b', shape: 'square', r: 4 }); }));
  if (xs.some((x, k) => k * dt < 6.5 && Math.abs(x) > 0.16)) cv.text('グラフの外へ（たおれる）', 590, 30, { align: 'right', size: 15, bold: true, color: 'd' });
  // 右：単位円と μ
  const c = cv.view({ x0: -1.6, x1: 1.3, y0: -1.3, y1: 1.3, box: [630, 80, 230, 230], equal: true });
  c.circle(0, 0, 1, { fill: 'c', alpha: 0.15, color: 'c', width: 2 });
  c.axes({ xt: [-1, 1], yt: [], xl: '実部', yl: '虚部' });
  c.dot(mu, 0, { color: 'd', shape: 'diamond', r: 8 });
  c.text('μ ＝ ' + A.num(mu, 2), Math.max(mu, -1.1), -0.35, { align: 'center', size: 15, bold: true, color: 'd', bg: true });
  cv.text(Math.abs(mu) < 1 ? '円の中：落ち着く' : Math.abs(mu) === 1 ? '円のふち' : '円の外：こわれる', 745, 345, { align: 'center', size: 16, bold: true, color: Math.abs(mu) < 1 ? 'c' : 'd' });
}
