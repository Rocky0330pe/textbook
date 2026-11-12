// @id m3-10
// @title 面積のふえる速さは高さ：微分積分学の基本定理
// @vol 数学5
// @from 数学 5-11 ①②⑥（ch5-11:87〜175・347〜363）・5-0（ch5-00:120〜155 のおふろ）／5-12・5-13、物理 力 でも使う
'use strict';
// 5-0：1 分ごとに 6・9・12・12・12 L。たまった量 0・6・15・27・39・51 L
// 5-11：y=t² の 0〜x の面積 S(x)=x³/3（x=0.5・1・1.5・2 で 0.0417・0.3333・1.125・2.6667）。S′(1.5)=2.25＝高さ
// 5-11：x=1、h=0.1・0.01・0.001 で ふえた面積 0.110333・0.0101003・0.0010010003、÷h は 1.10333・1.01003・1.0010003
const sh = (v, p) => String(Number(v.toPrecision(p || 6))).replace('-', '−');
const RATE = [6, 9, 12, 12, 12];
const rate = t => RATE[Math.min(4, Math.max(0, Math.floor(t)))];
const water = t => { let w = 0; for (let k = 0; k < 5; k++) w += RATE[k] * A.clamp(t - k, 0, 1); return w; };
const S = x => x ** 3 / 3;
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);

A.item({
  id: 'm3-10', title: '面積のふえる速さは高さ：微分積分学の基本定理',
  from: '数学 第5巻 5-11「微分と積分はつながっている」・5-0「おふろの水」の図から（5-12・5-13、物理 力 でも使う）',
  W: 880, H: 420,
  state: { t: 0 },
  scenes: [
    {
      key: 'ofuro', label: '① おふろの水',
      lead: 'じゃ口から 1 分ごとに 6 L、9 L、12 L、12 L、12 L の水が入ります。左は「入る速さ」、右は「たまった量」です。▶ で 5 分すすめます。',
      note: '左のグラフの面積（入る速さ × 時間）をつみ上げたものが、右のたまった量です。右のグラフの傾き（1 分あたりのふえ方）は、左のグラフの高さ（入る速さ）に等しくなっています。たまった量をひき算すると速さ（微分）、速さをたし算するとたまった量（積分）です。',
      legend: [['入る速さ（L/分）', { color: 'a', width: 3 }], ['たまった量（L）', { color: 'b', style: 'dash', width: 3 }], ['いまの傾き', { color: 'c', style: 'dot' }]],
      controls: [{ range: 't', label: '時刻（分）', min: 0, max: 5, step: 0.01 }],
      step(st, dt) { st.t = Math.min(5, st.t + dt * 0.8); if (st.t >= 5) return false; },
      draw(cv, st) { drawOfuro(cv, st); },
      readout: st => `${A.num(st.t, 2)} 分：たまった量 <b>${A.num(water(st.t), 1)} L</b>、いま入る速さ <b>${rate(Math.min(st.t, 4.999))} L/分</b>（＝右のグラフの傾き）`
    },
    {
      key: 'menseki', label: '② 右はしを動かす面積',
      lead: 'グラフ $y=t^2$ の、0 から右はし $x$ までの面積 $S(x)$ を、右のグラフにかきます。左のグラフの右はしをドラッグしましょう。',
      note: '$S(x)=\\frac{x^3}{3}$。右のグラフの接線の傾き $S\'(x)=x^2$ は、左のグラフの高さ $f(x)=x^2$ と一致します（$x=1.5$ でどちらも 2.25）。左が高い所ほど、右は急に上がり、左が 0 の所（$x=0$）では右は平らです。',
      legend: [['$y=t^2$ と面積', { color: 'a', width: 3 }], ['右はしの高さ $f(x)$', { color: 'b', style: 'solid', width: 4 }], ['$S(x)=\\frac{x^3}{3}$', { color: 'd', style: 'dash' }], ['接線（傾き＝高さ）', { color: 'b', style: 'dot' }]],
      state: { x: 1.5 },
      controls: [{ range: 'x', label: '右はし $x$', min: 0, max: 2, step: 0.01 }],
      step(st, dt) { if (st.t === 0) st.x = 0; st.t += dt; st.x = Math.min(2, st.x + dt * 0.4); if (st.x >= 2) return false; },
      drag: { hit: () => 1, move(st, x, y, api) { const L = viewL(api.cv, 2.4, 4.6), Rt = viewR(api.cv); st.x = A.clamp((x < 470 ? L.inv(x, y) : Rt.inv(x, y))[0], 0, 2); } },
      draw(cv, st) { drawMenseki(cv, st); },
      readout: st => `$x$ ＝ ${A.num(st.x, 2)}：面積 $S(x)$ ＝ ${A.num(S(st.x), 4)}、右のグラフの傾き $S'(x)$ ＝ <b>${A.num(st.x * st.x, 4)}</b> ＝ 高さ $x^2$`
    },
    {
      key: 'obi', label: '③ 細い帯 $h$',
      lead: '右はしを $x$ から $x+h$ にすると、面積は、はば $h$ の細い帯の分だけふえます。帯を大きくして見ましょう。▶ で $h$ を小さくします。',
      note: '帯は、高さ $f(x)$ と $f(x+h)$ の 2 つの長方形にはさまれています。だから $f(x)\\leqq\\frac{S(x+h)-S(x)}{h}\\leqq f(x+h)$。$h\\to0$ で両がわが $f(x)$ に近づき、$S\'(x)=f(x)$（面積がふえる速さは、その場所の高さ）です。',
      legend: [['小さい長方形 $f(x)\\times h$', { color: 'a', style: 'solid' }], ['大きい長方形 $f(x+h)\\times h$（破線）', { color: 'b', style: 'dash' }], ['帯の上の部分（帯＝小さい長方形＋この部分）', { color: 'e', shape: 'square', noline: true }]],
      state: { x: 1, lh: -1 },
      controls: [{ range: 'lh', label: '帯のはば $h$', min: -3, max: Math.log10(0.5), step: 0.01, fmt: v => sh(Math.pow(10, v), 2) }, { range: 'x', label: '場所 $x$', min: 0.3, max: 1.8, step: 0.1, d: 1 }],
      step(st, dt) { st.t += dt; const L = [Math.log10(0.5), -1, -2, -3], seg = Math.floor(st.t / 1.6); if (seg >= 3) { st.lh = -3; return false; } st.lh = L[seg] + (L[seg + 1] - L[seg]) * ease((st.t - seg * 1.6) / 0.8); },
      draw(cv, st) { drawObi(cv, st); },
      readout: st => { const x = st.x, h = Math.pow(10, st.lh), d = S(x + h) - S(x); return `ふえた面積 ${sh(d, 8)} ÷ $h$ ＝ <b>${sh(d / h, 8)}</b>　（$f(x)$ ＝ ${sh(x * x)} と $f(x+h)$ ＝ ${sh((x + h) ** 2)} のあいだ）`; }
    }
  ]
});

function drawOfuro(cv, st) {
  const t = st.t;
  const L = cv.view({ x0: 0, x1: 5.6, y0: 0, y1: 15, box: [60, 30, 360, 330] });
  L.axes({ xt: [1, 2, 3, 4, 5], yt: [6, 9, 12], xl: '時刻（分）', yl: '入る速さ（L/分）' });
  for (let k = 0; k < 5; k++) {
    const a = k, b = Math.min(t, k + 1);
    if (b > a) L.poly([[a, 0], [b, 0], [b, RATE[k]], [a, RATE[k]]], { fill: 'a', alpha: 0.15 + 0.1 * k, color: 'a', width: 1 });
    if (t >= k + 1) L.text(String(RATE[k]) + ' L', k + 0.5, RATE[k] / 2, { align: 'center', size: 15, bold: true, bg: true });
  }
  const pts = []; for (let k = 0; k < 5; k++) pts.push([k, RATE[k]], [k + 1, RATE[k]]);
  L.line(pts, { color: 'a', width: 3 });
  cv.line([[L.X(t), L.T], [L.X(t), L.T + L.Hp]], { color: 'sub', style: 'dot', width: 1.2 });
  const R = cv.view({ x0: 0, x1: 5.6, y0: 0, y1: 56, box: [510, 30, 340, 330] });
  R.axes({ xt: [1, 2, 3, 4, 5], yt: [6, 15, 27, 39, 51], xl: '時刻（分）', yl: 'たまった量（L）' });
  R.plot(water, { x0: 0, x1: 5, color: 'sub', width: 1, alpha: 0.4 });
  R.plot(water, { x0: 0, x1: t, color: 'b', style: 'dash', width: 3 });
  for (let k = 1; k <= Math.floor(t + 1e-9); k++) R.dot(k, water(k), { color: 'b', r: 4 });
  const r = rate(Math.min(t, 4.999)), w = water(t);
  R.plot(s => w + r * (s - t), { x0: t - 0.6, x1: t + 0.6, color: 'c', style: 'dot', width: 3 });
  R.dot(t, w, { color: 'ink', r: 6 });
  R.text(`傾き ${r}`, t - 0.15, w + 3, { align: 'right', size: 15, color: 'c', bold: true, bg: true });
}

function viewL(cv) { return cv.view({ x0: 0, x1: 2.4, y0: 0, y1: 4.6, box: [60, 30, 370, 330] }); }
function viewR(cv) { return cv.view({ x0: 0, x1: 2.4, y0: 0, y1: 3, box: [510, 30, 340, 330] }); }
function drawMenseki(cv, st) {
  const x = st.x, L = viewL(cv), R = viewR(cv);
  L.axes({ xt: [0.5, 1, 1.5, 2], yt: [1, 2, 3, 4], xl: 't', yl: 'y', xlItalic: true, ylItalic: true });
  L.area(t => t * t, 0, x, { fill: 'a', alpha: 0.25 });
  L.plot(t => t * t, { x0: 0, x1: 2.12, color: 'a', width: 3 });
  L.line([[x, 0], [x, x * x]], { color: 'b', width: 4 });
  if (x > 0.35) L.text('S(x)', x * 0.7, x * x * 0.18, { align: 'center', size: 16, bold: true, bg: true });
  L.text(`高さ ${A.num(x * x, 2)}`, x + 0.06, x * x / 2 + 0.2, { size: 15, color: 'b', bold: true, bg: true });
  L.dot(x, 0, { color: 'ink', r: 7, shape: 'diamond' });
  R.axes({ xt: [0.5, 1, 1.5, 2], yt: [1, 2], xl: 'x', yl: 'S(x)', xlItalic: true });
  R.plot(S, { x0: 0, x1: 2.1, color: 'd', style: 'dash', width: 3 });
  const m = x * x, half = 70 / Math.hypot(R.sx, m * R.sy);
  R.plot(s => S(x) + m * (s - x), { x0: x - half, x1: x + half, color: 'b', style: 'dot', width: 3 });
  R.dot(x, S(x), { color: 'ink', r: 6 });
  R.text(`傾き ${A.num(m, 2)}`, x - 0.08, S(x) + 0.22, { align: 'right', size: 15, color: 'b', bold: true, bg: true });
  for (const k of [0.5, 1, 1.5, 2]) R.dot(k, S(k), { color: 'd', r: 3.5, open: true });
}

function drawObi(cv, st) {
  const x = st.x, h = Math.pow(10, st.lh), f = t => t * t;
  const L = cv.view({ x0: 0, x1: 2.6, y0: 0, y1: 6.2, box: [60, 30, 330, 330] });
  L.axes({ xt: [1, 2], yt: [1, 2, 3, 4, 5, 6], xl: 't', yl: 'y', xlItalic: true, ylItalic: true });
  L.area(f, 0, x, { fill: 'a', alpha: 0.15 });
  L.area(f, x, x + h, { fill: 'e', alpha: 0.8 });
  L.plot(f, { x0: 0, x1: 2.48, color: 'ink', width: 2.5 });
  L.text('S(x)', x * 0.65, 0.4, { align: 'center', size: 15, bold: true, bg: true });
  // 拡大した帯（はばを 200px に）
  const B = [470, 40, 300, 320], top = f(x + h), lo = f(x);
  const Z = cv.view({ x0: x - h * 0.25, x1: x + h * 1.25, y0: 0, y1: top * 1.08, box: B });
  Z.poly([[x, 0], [x + h, 0], [x + h, lo], [x, lo]], { fill: 'a', alpha: 0.25, color: 'a', width: 2.5 });
  Z.area(f, x, x + h, { fill: 'e', alpha: 0.7, base: lo });
  Z.poly([[x, 0], [x + h, 0], [x + h, top], [x, top]], { color: 'b', style: 'dash', width: 2.5 });
  Z.plot(f, { color: 'ink', width: 3, x0: x - h * 0.2, x1: x + h * 1.2 });
  cv.line([[B[0], B[1] + B[3]], [B[0] + B[2], B[1] + B[3]]], { color: 'sub', width: 1.5 });
  cv.text('x', Z.X(x), B[1] + B[3] + 14, { align: 'center', size: 15, italic: true, math: true });
  cv.text('x＋h', Z.X(x + h), B[1] + B[3] + 14, { align: 'center', size: 15, italic: true, math: true });
  cv.text(`f(x) ＝ ${sh(lo, 5)}`, Z.X(x) - 6, Z.Y(lo), { align: 'right', size: 15, color: 'a', bold: true, bg: true });
  cv.text(`f(x＋h) ＝ ${sh(top, 5)}`, Z.X(x + h) + 6, Z.Y(top), { align: 'left', size: 15, color: 'b', bold: true, bg: true });
  cv.text('帯を拡大', B[0] + B[2] / 2, 22, { align: 'center', size: 15, color: 'sub' });
  cv.line([[L.X(x + h / 2), L.Y(f(x + h / 2))], [B[0] - 6, B[1] + 40]], { color: 'sub', style: 'dot', width: 1 });
  // 本の表（x=1）
  if (Math.abs(x - 1) < 1e-9) cv.text('x＝1（本の表）：h＝0.1 → 1.10333、0.01 → 1.01003、0.001 → 1.0010003', 60, 408, { size: 14, color: 'sub' });
}
