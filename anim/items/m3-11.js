// @id m3-11
// @title e の 2 つの顔：複利と傾き 1
// @vol 数学5
// @from 数学 5-14 ①〜④（ch5-14:88〜235 の複利・指数関数の微分・e の決め方）／6-10（M3-21）・6-4、物理 原 でも使う
'use strict';
// 5-14：(1+1/n)ⁿ は n=1・2・4・12・365・10000・1000000 で 2・2.25・2.4414…・2.6130…・2.7145…・2.71814…・2.718280…
// 5-14：k_a＝(a^h−1)/h（h=0.0001）は a=2・2.5・2.7・2.8・3 で 0.693・0.916・0.993・1.030・1.099。e で 1
// 5-14：y=2^x の傾き÷高さ はどこでも 0.693
const NS = [[1, '1年に1回'], [2, '半年ごと'], [4, '3か月ごと'], [12, '毎月'], [365, '毎日'], [10000, '10000回'], [1000000, '1000000回']];
const comp = n => Math.pow(1 + 1 / n, n);
const kA = a => (Math.pow(a, 1e-4) - 1) / 1e-4;
// 本の表と同じ書き方（切り捨てて「…」）
const DIG = { 1: 0, 2: 2, 4: 4, 12: 4, 365: 4, 10000: 5, 1000000: 6 };
const fc = n => { const d = DIG[n], v = comp(n), t = Math.floor(v * 10 ** d + 1e-9) / 10 ** d; return t.toFixed(d) + (Math.abs(t - v) > 1e-12 ? '…' : ''); };

A.item({
  id: 'm3-11', title: 'e の 2 つの顔：複利と傾き 1',
  from: '数学 第5巻 5-14「指数関数の微分と e」の図から（6-4・6-10、物理 原 でも使う）',
  W: 880, H: 420,
  state: { t: 0 },
  scenes: [
    {
      key: 'fukuri', label: '① 複利で 1 年',
      lead: '1 万円を、1 年で 100 % の利率で預けます。1 年を $n$ 回に分けて、1 回ごとに $\\left(1+\\frac{1}{n}\\right)$ 倍にすると、1 年後はいくらでしょう。▶ で $n$ をふやします。',
      note: '細かく分けるほどふえますが、ふえ方はだんだん小さくなり、$n$ をどんなに大きくしても 3 にもとどかず、$e=2.71828\\cdots$ に近づきます。$e=\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n$。階段は、なめらかな曲線 $y=e^t$（破線）に近づきます。',
      miss: '「50 % と 50 % で、合わせて 100 % なので 2 万円」ではありません。2 回めの半年が始まるときには、預けているお金はもう 1.5 万円で、利息にも利息がつきます（2.25 万円）。',
      legend: [['お金（万円）', { color: 'a', width: 3 }], ['$y=e^t$', { color: 'b', style: 'dash' }], ['$\\left(1+\\frac{1}{n}\\right)^n$（右のグラフ）', { color: 'a', shape: 'circle', noline: true }], ['$e=2.718\\cdots$', { color: 'd', style: 'dot' }]],
      state: { n: 1 },
      controls: [{ seg: 'n', label: '1 年を分ける回数 $n$', options: NS.map(([n, s]) => [n, s]) }],
      step(st, dt) { st.t += dt; const k = Math.min(NS.length - 1, Math.floor(st.t / 1.5)); st.n = NS[k][0]; if (st.t >= 1.5 * NS.length) return false; },
      draw(cv, st) { drawFukuri(cv, st); },
      readout: st => `$n$ ＝ ${st.n}：1 年後は $\\left(1+\\frac{1}{${st.n}}\\right)^{${st.n}}$ ＝ <b>${fc(st.n)} 万円</b>（$e$ ＝ 2.71828…）`
    },
    {
      key: 'soko', label: '② 底 $a$ と (0, 1) の傾き',
      lead: '$y=a^x$ の底 $a$ を変えて、点 (0, 1) での接線の傾き $k_a$ を見ます。傾きがちょうど 1 になる $a$ をさがしましょう。',
      note: '$k_a$ は、$a=2$ で 0.693、$a=3$ で 1.099。2.7 と 2.8 のあいだで 1 になります。その底が $e=2.71828\\cdots$ で、$y=e^x$ の (0, 1) での接線は $y=1+x$（傾き 1）です。だから $(e^x)\'=e^x$。',
      legend: [['$y=a^x$', { color: 'a', width: 3 }], ['(0, 1) での接線', { color: 'b', style: 'dash' }], ['$y=1+x$（傾き 1）', { color: 'd', style: 'dot' }], ['$y=2^x$・$y=3^x$', { color: 'sub', width: 1 }]],
      state: { a: 2 },
      controls: [{ range: 'a', label: '底 $a$', min: 1.5, max: 4, step: 0.01 }, { button: '$a=e$ にする', act: st => { st.a = Math.E; } }],
      step(st, dt) { st.t += dt; st.a = Math.min(Math.E, 2 + st.t * 0.12); if (st.a >= Math.E) return false; },
      draw(cv, st) { drawSoko(cv, st); },
      readout: st => `$a$ ＝ ${A.num(st.a, 3)}：$k_a\\approx\\frac{a^{0.0001}-1}{0.0001}$ ＝ <b>${A.num(kA(st.a), 3)}</b>${Math.abs(kA(st.a) - 1) < 0.003 ? '（ほぼ 1！）' : ''}`
    },
    {
      key: 'jibun', label: '③ 傾き ÷ 高さ',
      lead: '$y=a^x$ のいろいろな点で、接線の傾きと高さをくらべます。接点をドラッグしましょう。',
      note: '「傾き÷高さ」は、どの点でも同じ $k_a$ です（$a=2$ なら 0.693）。指数関数を微分すると、自分自身の $k_a$ 倍：$(a^x)\'=k_a\\,a^x$。いまある量に比例してふえる、ということです。$a=e$ なら $k_e=1$ で、傾き＝高さになります。',
      legend: [['$y=a^x$', { color: 'a', width: 3 }], ['接線', { color: 'b', style: 'dash' }], ['高さ', { color: 'c', style: 'solid', width: 4 }]],
      state: { a: 2, x: 1 },
      controls: [{ range: 'x', label: '接点の $x$', min: -2, max: 2.2, step: 0.01 }, { range: 'a', label: '底 $a$', min: 1.5, max: 4, step: 0.01 }],
      step(st, dt) { st.t += dt; st.x = -2 + (st.t * 0.6) % 4.2; },
      drag: { hit: () => 1, move(st, x, y, api) { st.x = A.clamp(+viewJ(api.cv).inv(x, y)[0].toFixed(2), -2, 2.2); } },
      draw(cv, st) { drawJibun(cv, st); },
      readout: st => { const h = Math.pow(st.a, st.x), m = kA(st.a) * h; return `$x$ ＝ ${A.num(st.x, 2)}：高さ ${A.num(h, 3)}、傾き ${A.num(m, 3)}、傾き ÷ 高さ ＝ <b>${A.num(m / h, 3)}</b>`; }
    }
  ]
});

function drawFukuri(cv, st) {
  const n = st.n, v = cv.view({ x0: 0, x1: 1.1, y0: 0.8, y1: 3, box: [60, 30, 400, 330] });
  v.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [1, 1.5, 2, 2.5], xfmt: t => t === 1 ? '1年' : t === 0.5 ? '半年' : '', xl: '時間', yl: 'お金（万円）', ax: 0.8, ay: 0 });
  v.plot(() => Math.E, { color: 'd', style: 'dot', width: 2 });
  v.text('e', 1.02, Math.E + 0.08, { size: 16, italic: true, math: true, color: 'd', bold: true });
  v.plot(t => Math.exp(t), { x0: 0, x1: 1.05, color: 'b', style: 'dash', width: 2.5 });
  if (n <= 400) {
    const pts = [[0, 1]];
    for (let j = 0; j < n; j++) { const y = Math.pow(1 + 1 / n, j); pts.push([(j + 1) / n, y]); pts.push([(j + 1) / n, Math.pow(1 + 1 / n, j + 1)]); }
    v.line(pts, { color: 'a', width: 3 });
    if (n <= 12) for (let j = 1; j <= n; j++) v.dot(j / n, Math.pow(1 + 1 / n, j), { color: 'a', r: 4 });
  } else v.plot(t => Math.pow(1 + 1 / n, Math.floor(t * n + 1e-9)), { x0: 0, x1: 1, color: 'a', width: 3, n: 600 });
  v.dot(1, comp(n), { color: 'a', r: 7 });
  v.text(fc(n), 0.97, comp(n) + 0.1, { align: 'right', size: 16, bold: true, bg: true });
  // 右：n＝1〜50 の点（本の図）
  const g = cv.view({ x0: 0, x1: 52, y0: 1.8, y1: 3, box: [530, 30, 320, 330] });
  g.axes({ xt: [1, 10, 20, 30, 40, 50], yt: [2, 2.25, 2.5, Math.E], yfmt: y => Math.abs(y - Math.E) < 1e-9 ? 'e' : String(y), xl: '回数 n', ax: 1.8, ay: 0, zero: true });
  g.plot(() => Math.E, { color: 'd', style: 'dot', width: 2 });
  for (let k = 1; k <= 50; k++) g.dot(k, comp(k), { color: 'a', r: k === n ? 7 : 2.6 });
  if (n > 50) g.text(`n ＝ ${n} は右のずっと先`, 50, 2.05, { align: 'right', size: 15, bg: true });
}

function drawSoko(cv, st) {
  const a = st.a, k = kA(a), v = cv.view({ x0: -2.2, x1: 2.3, y0: 0, y1: 7.6, box: [60, 24, 470, 360] });
  v.axes({ xt: [-2, -1, 1, 2], yt: [1, 2, 4, 6], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  v.plot(x => Math.pow(2, x), { color: 'sub', width: 1 }); v.plot(x => Math.pow(3, x), { color: 'sub', width: 1 });
  v.text('2ˣ', 2.15, 4.3, { size: 14, color: 'sub' }); v.text('3ˣ', 1.62, 6.9, { size: 14, color: 'sub', align: 'right' });
  v.plot(x => 1 + x, { x0: -1, x1: 1.6, color: 'd', style: 'dot', width: 2.5 });
  v.plot(x => Math.pow(a, x), { color: 'a', width: 3 });
  v.plot(x => 1 + k * x, { x0: -1.2, x1: 1.6, color: 'b', style: 'dash', width: 3 });
  v.dot(0, 1, { color: 'ink', r: 6 });
  v.text(`傾き ${A.num(k, 3)}`, 0.95, 1 + k * 0.95 + 0.25, { align: 'right', size: 16, bold: true, color: 'b', bg: true });
  // 右：本の表
  const L = 580, T = 40;
  cv.text('底 a', L, T, { size: 15, color: 'sub' }); cv.text('kₐ（h＝0.0001）', L + 80, T, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 16], [870, T + 16]], { color: 'line', width: 1 });
  [2, 2.5, 2.7, Math.E, 2.8, 3].forEach((b, i) => {
    const y = T + 44 + i * 36, on = Math.abs(b - a) < 0.006;
    if (on) cv.rect(L - 6, y - 16, 290, 32, { fill: 'hl', alpha: 1 });
    cv.text(b === Math.E ? 'e＝2.718…' : String(b), L, y, { size: 16, bold: on || b === Math.E, color: b === Math.E ? 'd' : 'ink' });
    cv.text(A.num(kA(b), 3), L + 120, y, { size: 16, bold: on || b === Math.E, color: b === Math.E ? 'd' : 'ink' });
  });
}

function viewJ(cv) { return cv.view({ x0: -2.3, x1: 2.4, y0: 0, y1: 8.4, box: [60, 24, 470, 360] }); }
function drawJibun(cv, st) {
  const a = st.a, k = kA(a), x = st.x, h = Math.pow(a, x), m = k * h, v = viewJ(cv);
  v.axes({ xt: [-2, -1, 1, 2], yt: [1, 2, 4, 6, 8], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  v.plot(t => Math.pow(a, t), { color: 'a', width: 3 });
  const half = 90 / Math.hypot(v.sx, m * v.sy);
  v.plot(t => h + m * (t - x), { x0: x - half, x1: x + half, color: 'b', style: 'dash', width: 3 });
  v.line([[x, 0], [x, h]], { color: 'c', width: 4 });
  // 傾きの三角形（横 1）
  if (x + 1 < 2.4 && h + m < 8.4) { v.line([[x, h], [x + 1, h], [x + 1, h + m]], { color: 'b', width: 1.5 }); v.text('1', x + 0.5, h, { align: 'center', base: 'top', size: 15 }); v.text(A.num(m, 2), x + 1.05, h + m / 2, { size: 15, color: 'b', bold: true, bg: true }); }
  v.text(A.num(h, 2), x - 0.06, h / 2, { align: 'right', size: 15, color: 'c', bold: true, bg: true });
  v.dot(x, h, { color: 'ink', r: 6 });
  const L = 580, T = 40;
  cv.text(`a ＝ ${A.num(a, 2)} のとき`, L, T, { size: 16, bold: true });
  cv.text('x', L, T + 36, { size: 15, color: 'sub', italic: true }); cv.text('高さ', L + 50, T + 36, { size: 15, color: 'sub' }); cv.text('傾き', L + 130, T + 36, { size: 15, color: 'sub' }); cv.text('傾き÷高さ', L + 200, T + 36, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 52], [870, T + 52]], { color: 'line', width: 1 });
  [0, 1, 2, 3].forEach((q, i) => {
    const y = T + 80 + i * 34, hh = Math.pow(a, q);
    cv.text(String(q), L, y, { size: 16 }); cv.text(A.num(hh, 3), L + 50, y, { size: 16 }); cv.text(A.num(k * hh, 3), L + 130, y, { size: 16 }); cv.text(A.num(k, 3), L + 210, y, { size: 16, bold: true, color: 'b' });
  });
  cv.text(`(aˣ)′ ＝ ${A.num(k, 3)} × aˣ`, L, T + 240, { size: 17, bold: true });
}
