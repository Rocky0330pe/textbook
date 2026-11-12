// @id m4-09
// @title 固有ベクトルは、形を変えずにゆれる形
// @vol 数学7
// @from 数学 7-11 図4（ch7-11:401）、7-8 図6（ch7-08:370）
'use strict';
// 台車2つ（6-14・7-8）：m=1 kg、k=100 N/m、つなぎ K=10 N/m。B=(−110 10;10 −110)、固有値 −100・−120
const W1 = 10, W2 = Math.sqrt(120);
// 2階建て：各階の重さと柱の強さが同じとしたもの（本の図には数がないので、この形で計算した）
const PHI = (1 + Math.sqrt(5)) / 2, B1 = [1, PHI], B2 = [1, 1 - PHI], WB1 = 1 / PHI, WB2 = PHI;

function spring(cv, x0, x1, y, n, o) {
  const pts = [[x0, y]], L = x1 - x0, a = 10;
  for (let k = 1; k < 2 * n; k++) pts.push([x0 + 12 + (L - 24) * k / (2 * n), y + (k % 2 ? -a : a)]);
  pts.splice(1, 0, [x0 + 12, y]); pts.push([x1 - 12, y], [x1, y]);
  cv.line(pts, o);
}
function carts(cv, x1, x2, y, sc) {
  const L = 60, R = 820, c1 = 290 + x1 * sc, c2 = 590 + x2 * sc, w = 70;
  cv.rect(L - 14, y - 50, 14, 70, { fill: 'sub', alpha: 0.4, color: 'sub', width: 1 }); cv.rect(R, y - 50, 14, 70, { fill: 'sub', alpha: 0.4, color: 'sub', width: 1 });
  cv.line([[L - 14, y + 20], [R + 14, y + 20]], { color: 'sub', width: 2 });
  spring(cv, L, c1 - w / 2, y - 15, 6, { color: 'ink', width: 1.8 });
  spring(cv, c1 + w / 2, c2 - w / 2, y - 15, 8, { color: 'ink', width: 1.8 });
  spring(cv, c2 + w / 2, R, y - 15, 6, { color: 'ink', width: 1.8 });
  cv.rect(c1 - w / 2, y - 40, w, 40, { fill: 'b', alpha: 0.5, color: 'b', width: 2 });
  cv.rect(c2 - w / 2, y - 40, w, 40, { fill: 'a', alpha: 0.5, color: 'a', width: 2, style: 'dash' });
  cv.text('1', c1, y - 20, { size: 16, bold: true, align: 'center' }); cv.text('2', c2, y - 20, { size: 16, bold: true, align: 'center' });
  for (const [c0, c, col] of [[290, c1, 'b'], [590, c2, 'a']]) { cv.line([[c0, y + 26], [c0, y + 38]], { color: 'sub', width: 1.5 }); if (Math.abs(c - c0) > 3) cv.arrow(c0, y + 32, c, y + 32, { color: col, width: 2.5 }); }
  cv.text('ばね k', (L + 290 - w / 2) / 2, y - 40, { size: 14, color: 'sub', align: 'center' });
  cv.text('つなぎのばね K', 440, y - 40, { size: 14, color: 'sub', align: 'center' });
  cv.text('ばね k', (590 + w / 2 + R) / 2, y - 40, { size: 14, color: 'sub', align: 'center' });
}
function traces(cv, st, f, box, T, lab) {
  const g = cv.view({ x0: 0, x1: T, y0: -2.2, y1: 2.2, box });
  g.axes({ xt: [], yt: [-1, 1], xl: 't', yl: lab || 'ずれ', ylabels: false });
  g.plot(t => f(t)[0], { color: 'b', width: 2.2 });
  g.plot(t => f(t)[1], { color: 'a', width: 2.2, style: 'dash' });
  const tt = st.t % T; g.line([[tt, -2.2], [tt, 2.2]], { color: 'sub', width: 1, style: 'dot' });
  g.dot(tt, f(tt)[0], { color: 'b', r: 5 }); g.dot(tt, f(tt)[1], { color: 'a', r: 5, shape: 'square' });
}

function drawDaisha(cv, st) {
  const w = st.mode === 1 ? W1 : W2, v = st.mode === 1 ? [1, 1] : [1, -1];
  const f = t => [v[0] * Math.cos(w * t), v[1] * Math.cos(w * t)];
  const x = f(st.t);
  carts(cv, x[0], x[1], 120, 45);
  traces(cv, st, f, [60, 190, 760, 230], 2 * Math.PI / W1 * 3);
  cv.text(st.mode === 1 ? 'モード1：いっしょに動く (1, 1)、ω₁ ＝ 10 rad/s' : 'モード2：反対に動く (1, −1)、ω₂ ＝ √120 ≒ 10.95 rad/s', 440, 20, { size: 16, bold: true, align: 'center' });
}

function building(cv, cx, u1, u2, sc, label) {
  const g = 380, h = 140, w = 160;
  cv.rect(cx - w / 2 - 30, g, w + 60, 14, { fill: 'sub', alpha: 0.35 });
  const col = (x0, d0, d1, y0) => { const pts = []; for (let k = 0; k <= 16; k++) { const s = k / 16, sm = 3 * s * s - 2 * s * s * s; pts.push([x0 + d0 + (d1 - d0) * sm, y0 - h * s]); } cv.line(pts, { color: 'a', width: 3 }); };
  const d1 = u1 * sc, d2 = u2 * sc;
  for (const x0 of [cx - w / 2 + 8, cx + w / 2 - 8]) { col(x0, 0, d1, g); col(x0, d1, d2, g - h); }
  cv.rect(cx - w / 2 + d1, g - h - 8, w, 14, { fill: 'b', alpha: 0.5, color: 'b', width: 2 });
  cv.rect(cx - w / 2 + d2, g - 2 * h - 8, w, 14, { fill: 'b', alpha: 0.5, color: 'b', width: 2 });
  cv.text('1階の床', cx - w / 2 - 12, g - h, { size: 14, align: 'right', color: 'sub' }); cv.text('2階の床', cx - w / 2 - 12, g - 2 * h, { size: 14, align: 'right', color: 'sub' });
  cv.text(label, cx, 418, { size: 15, bold: true, align: 'center' });
}
function drawTate(cv, st) {
  const c1 = Math.cos(WB1 * st.t), c2 = Math.cos(WB2 * st.t);
  building(cv, 220, 0, 0, 1, 'ゆれていない');
  if (st.mode === 1) building(cv, 620, B1[0] * c1, B1[1] * c1, 34, '1次モード：同じ向き (1, 1.62)');
  else building(cv, 620, B2[0] * c2, B2[1] * c2, 34, '2次モード：反対向き (1, −0.62)');
  const r = st.mode === 1 ? '2階：1階 ＝ 1.62：1（ゆっくり）' : '2階：1階 ＝ −0.62：1（速い。1次の 2.62 倍）';
  cv.text(r, 620, 24, { size: 15, align: 'center' });
}

function drawKasane(cv, st) {
  const f = t => { const a = st.c1 * Math.cos(W1 * t), b = st.c2 * Math.cos(W2 * t); return [a + b, a - b]; };
  const x = f(st.t);
  carts(cv, x[0], x[1], 100, 40);
  const T = 2 * Math.PI / (W2 - W1);
  traces(cv, st, f, [60, 160, 760, 140], T, 'x₁・x₂');
  // 下：モードの座標 q₁＝(x₁+x₂)/2、q₂＝(x₁−x₂)/2 はそれぞれ cos だけ
  const g = cv.view({ x0: 0, x1: T, y0: -1.2, y1: 1.2, box: [60, 320, 760, 100] });
  g.axes({ xt: [], yt: [], xl: 't', yl: 'q₁・q₂' });
  g.plot(t => st.c1 * Math.cos(W1 * t), { color: 'c', width: 2 });
  g.plot(t => st.c2 * Math.cos(W2 * t), { color: 'd', width: 2, style: 'dot' });
  const tt = st.t % T; g.line([[tt, -1.2], [tt, 1.2]], { color: 'sub', width: 1, style: 'dot' });
}

A.item({
  id: 'm4-09', title: '固有ベクトルは、形を変えずにゆれる形',
  from: '数学 第7巻 7-8③「台車」・7-11⑦「建物」の図から（7-9⑦、物理 波-3・力-10 でも使う）',
  W: 880, H: 440,
  state: { t: 0, mode: 1, c1: 0.6, c2: 0.4 },
  scenes: [
    {
      key: 'daisha', label: '① 台車の2つのモード',
      lead: 'ばねでつないだ2つの台車（$m=1$ kg、$k=100$ N/m、$K=10$ N/m）を、固有ベクトルの形にずらしてはなします。▶ で、ゆっくり動かして見ます。',
      note: 'いっしょに動く $(1,\\ 1)$ と、反対に動く $(1,\\ -1)$ は、係数の行列 $B$ の固有ベクトルです（固有値 $-100$ と $-120$）。この形でずらしてはなすと、**形を保ったまま**、全体の大きさだけが $\\cos\\omega t$ で変わります。$\\omega=\\sqrt{-\\lambda}$ で、$\\omega_1=10$、$\\omega_2=\\sqrt{120}\\approx10.95$ rad/s です。',
      miss: '固有値 $-100$ から $\\omega=-100$ とするのはまちがいです。$\\omega=\\sqrt{-(-100)}=10$ です。',
      legend: [['台車1のずれ $x_1$', { color: 'b' }], ['台車2のずれ $x_2$', { color: 'a', style: 'dash' }]],
      controls: [{ seg: 'mode', label: 'はじめの形', options: [[1, 'モード1 $(1,\\ 1)$'], [2, 'モード2 $(1,\\ -1)$']], on: st => { st.t = 0; } }],
      step(st, dt) { st.t += dt * 0.12; },
      draw: drawDaisha,
      readout: st => { const w = st.mode === 1 ? W1 : W2, c = Math.cos(w * st.t), v = st.mode === 1 ? [1, 1] : [1, -1]; return `$(x_1,\\ x_2)=${A.num(c, 2)}\\times(${v[0]},\\ ${A.num(v[1], 0)})$　（時間は 1/8 ほどの速さで見せている）`; }
    },
    {
      key: 'tatemono', label: '② 2階建ての建物',
      lead: '2階建ての建物の、2つのゆれ方（振動モード）です。各階の重さと柱の強さが同じ建物で計算しました。',
      note: '1次モードは2つの床が**同じ向き**にゆれる形、2次モードは**反対向き**にゆれる形で、台車の「いっしょ」「反対」と同じです。どちらも形を変えずにゆれ、ゆれる速さ（固有値から決まる振動数）がちがいます。地震のゆれ方は、この2つの形の重ね合わせで調べます。',
      state: { mode: 1, t: 0 },
      legend: [['床', { color: 'b', shape: 'square', noline: true }], ['柱', { color: 'a' }]],
      controls: [{ seg: 'mode', label: 'モード', options: [[1, '1次（同じ向き）'], [2, '2次（反対向き）']], on: st => { st.t = 0; } }],
      step(st, dt) { st.t += dt * 1.6; },
      draw: drawTate,
      readout: st => st.mode === 1 ? '1次モード：形 $(1,\\ 1.62)$、ゆっくりゆれる' : '2次モード：形 $(1,\\ -0.62)$、1次の約2.6倍の速さでゆれる'
    },
    {
      key: 'kasane', label: '③ 重ね合わせ',
      lead: '2つのモードを、スライダーの量だけまぜてはなします。台車の形は、どう変わるでしょう。',
      note: '2つのモードをまぜると、台車の形は時間とともに変わり、ゆれが台車1と台車2のあいだを行ったり来たりします（$\\omega_1$ と $\\omega_2$ が近いので「うなり」になる）。でも、ななめの物差し $q_1=\\frac{x_1+x_2}{2}$・$q_2=\\frac{x_1-x_2}{2}$ で見ると、それぞれは $\\cos$ だけのきれいなゆれです（下のグラフ）。',
      state: { c1: 0.6, c2: 0.4, t: 0 },
      legend: [['$x_1$', { color: 'b' }], ['$x_2$', { color: 'a', style: 'dash' }], ['$q_1$（モード1の量）', { color: 'c' }], ['$q_2$（モード2の量）', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'c1', label: 'モード1の量', min: -1, max: 1, step: 0.05, on: st => { st.t = 0; } }, { range: 'c2', label: 'モード2の量', min: -1, max: 1, step: 0.05, on: st => { st.t = 0; } }],
      step(st, dt) { st.t += dt * 0.25; },
      draw: drawKasane,
      readout: st => `$\\vec x=${A.num(st.c1, 2)}\\,(1,\\ 1)\\cos10t+${A.num(st.c2, 2)}\\,(1,\\ -1)\\cos10.95t$`
    }
  ]
});
