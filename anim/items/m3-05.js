// @id m3-05
// @title 位置・速度・加速度を同時に見る
// @vol 数学5
// @from 数学 5-5 ①〜③（ch5-05:150〜226 の投げ上げたボールとエレベーター）・まちがえやすいところ（ch5-05:537・541）・5-13（ch5-13:378）／6-5・物理 力-2 でも使う
'use strict';
// 5-5：x=20t−5t²、v=20−10t、a=−10（上向きを＋）。2 秒で最高点 20 m、v=0
// 5-5 はてな：エレベーターは 2 秒で 2 m/s、6 秒そのまま、2 秒で止まる。a＝1・0・−1
const sh = v => String(Number(v.toPrecision(4))).replace('-', '−');
const ball = (t, what) => (what && t > 2) ? { x: 20, v: 0, a: 0 } : { x: 20 * t - 5 * t * t, v: 20 - 10 * t, a: -10 };
function elev(t) {
  if (t <= 2) return { x: t * t / 2, v: t, a: 1 };
  if (t <= 8) return { x: 2 + 2 * (t - 2), v: 2, a: 0 };
  const s = Math.min(t, 10) - 8; return { x: 14 + 2 * s - s * s / 2, v: 2 - s, a: t < 10 ? -1 : 0 };
}
const playT = max => (st, dt) => { st.t = Math.min(max, st.t + dt * 0.8); if (st.t >= max) return false; };

A.item({
  id: 'm3-05', title: '位置・速度・加速度を同時に見る',
  from: '数学 第5巻 5-5「速度と加速度」の図から（5-13・6-5、物理 力-2 でも使う）',
  W: 880, H: 420,
  state: { t: 0, what: false },
  scenes: [
    {
      key: 'ball', label: '① 投げ上げたボール',
      lead: 'ボールを秒速 20 m で真上に投げます（上向きを＋）。ボールの動きと、位置 $x$・速度 $v$・加速度 $a$ のグラフを同時に見ましょう。',
      note: '$v=\\frac{dx}{dt}=20-10t$、$a=\\frac{dv}{dt}=-10$。2 秒で $v=0$ になり、いちばん高い 20 m に着きます。1 秒後と 3 秒後は、高さ 15 m・速さ 10 m/s が同じで、向きが反対です。',
      miss: '速度が 0 なら、加速度も 0？　最高点でも加速度は −10 のままです。下の「もしも」を入れてみましょう。加速度も 0 なら、ボールは空中に止まったままになるはずです。',
      legend: [['位置 $x$', { color: 'a', width: 3 }], ['速度 $v$（矢印）', { color: 'b', style: 'solid' }], ['加速度 $a$（矢印）', { color: 'c', style: 'dash' }], ['いまの時刻', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ range: 't', label: '時刻 $t$（s）', min: 0, max: 4, step: 0.01 }, { check: 'what', text: 'もしも：最高点で加速度が 0 になったら' }],
      step: playT(4),
      draw(cv, st) { drawBall(cv, st, false); },
      readout: st => { const b = ball(st.t, st.what); return `$t$ ＝ ${A.num(st.t, 2)} s：$x$ ＝ ${A.num(b.x, 2)} m、$v$ ＝ <b>${A.num(b.v, 1)} m/s</b>、$a$ ＝ <b>${A.num(b.a, 0)} m/s²</b>`; }
    },
    {
      key: 'hayaku', label: '② 速くなる？おそくなる？',
      lead: '同じボールで、速度の矢印と加速度の矢印の向きをくらべます。下のグラフは「速さ」（速度から向きを取った大きさ）です。',
      note: '0〜2 秒は $v>0$、$a<0$ で向きがちがうので、おそくなります。2〜4 秒は $v<0$、$a<0$ で向きが同じなので、下向きにどんどん速くなります。',
      miss: '加速度がマイナスなら、おそくなる？　いいえ。速くなるかおそくなるかは、$v$ と $a$ の符号が同じ（速くなる）か、ちがう（おそくなる）かで決まります。',
      legend: [['速度 $v$', { color: 'b', style: 'solid' }], ['加速度 $a$', { color: 'c', style: 'dash' }], ['速さ（$v$ の大きさ）', { color: 'd', style: 'dot' }]],
      controls: [{ range: 't', label: '時刻 $t$（s）', min: 0, max: 4, step: 0.01 }],
      step: playT(4),
      draw(cv, st) { drawBall(cv, st, true); },
      readout: st => { const b = ball(st.t); const same = b.v < -1e-9, zero = Math.abs(b.v) < 1e-9; return `$v$ ＝ ${A.num(b.v, 1)}、$a$ ＝ −10：${zero ? '一瞬止まる（でも $a$ は −10）' : same ? '<b>同じ符号 → 速くなる</b>' : '<b>ちがう符号 → おそくなる</b>'}　速さ ${A.num(Math.abs(b.v), 1)} m/s`; }
    },
    {
      key: 'elev', label: '③ エレベーター',
      lead: 'エレベーターが上へ動き出し、一定の速さで上がり、止まります。体は何を感じているのでしょう。',
      note: '速度は 0〜10 秒のあいだずっと＋（上向き）ですが、感じ方は 3 つに分かれます。分かれ目は加速度のグラフの分かれ目と同じです。体が感じていたのは、速度ではなく**加速度**でした。',
      legend: [['速度 $v$', { color: 'b', width: 3 }], ['加速度 $a$', { color: 'c', style: 'dash', width: 3 }], ['いまの時刻', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ range: 't', label: '時刻 $t$（s）', min: 0, max: 10, step: 0.01 }],
      step: playT(10),
      draw(cv, st) { drawElev(cv, st); },
      readout: st => { const e = elev(st.t); return `$t$ ＝ ${A.num(st.t, 1)} s：$v$ ＝ ${A.num(e.v, 2)} m/s、$a$ ＝ <b>${A.num(e.a, 0)} m/s²</b>　→ ${e.a > 0 ? '重く感じる' : e.a < 0 ? '軽く感じる' : 'ふつう'}`; }
    }
  ]
});

function drawBall(cv, st, sign) {
  const t = st.t, b = ball(t, st.what);
  // 左：高さの目もり
  const h = cv.view({ x0: 0, x1: 1, y0: -1, y1: 23, box: [40, 20, 170, 380] });
  cv.line([[h.X(0.25), h.Y(0)], [h.X(0.25), h.Y(22)]], { color: 'sub', width: 1.5 });
  for (const q of [0, 5, 10, 15, 20]) { cv.line([[h.X(0.25) - 5, h.Y(q)], [h.X(0.25) + 5, h.Y(q)]], { color: 'sub', width: 1.5 }); cv.text(String(q), h.X(0.25) - 9, h.Y(q), { align: 'right', size: 14, color: 'sub' }); }
  cv.text('x（m）', h.X(0.25), h.Y(22.6), { align: 'center', size: 14, color: 'sub' });
  cv.line([[h.X(0.1), h.Y(0)], [h.X(1), h.Y(0)]], { color: 'ink', width: 2 });
  // 1 秒ごとの位置（うすく）
  for (let k = 0; k <= 4; k++) if (!(st.what && k > 2)) { const q = ball(k); h.dot(k <= 2 ? 0.45 : 0.75, q.x, { color: 'sub', r: 5, open: true }); }
  const bx = t <= 2 || st.what ? 0.45 : 0.75, by = Math.max(0, b.x);
  // 矢印：速度 20 m/s → 90px、加速度 10 m/s² → 60px
  if (Math.abs(b.v) > 0.05) cv.arrow(h.X(bx) - 12, h.Y(by), h.X(bx) - 12, h.Y(by) - b.v * 4.5, { color: 'b', width: 3.5 });
  if (b.a !== 0) cv.arrow(h.X(bx) + 12, h.Y(by), h.X(bx) + 12, h.Y(by) - b.a * 6, { color: 'c', width: 3.5, style: 'dash' });
  cv.circle(h.X(bx), h.Y(by), 10, { fill: 'b', alpha: 0.85, color: 'ink', width: 1.5 });
  if (Math.abs(b.v) > 2) cv.text('v', h.X(bx) - 26, h.Y(by) - b.v * 2.2, { size: 16, bold: true, italic: true, math: true, color: 'b', align: 'right' });
  if (b.a !== 0) cv.text('a', h.X(bx) + 26, h.Y(by) + 30, { size: 16, bold: true, italic: true, math: true, color: 'c' });
  // 右：グラフ
  const L = 260, Wd = 590;
  const gs = sign ? [
    { key: 'v', y: [-24, 24], yt: [-20, 20], name: '速度 v（m/s）', col: 'b', sty: 'solid', f: s => ball(s).v },
    { key: 's', y: [0, 24], yt: [10, 20], name: '速さ（m/s）', col: 'd', sty: 'dot', f: s => Math.abs(ball(s).v) },
    { key: 'a', y: [-13, 4], yt: [-10], name: '加速度 a（m/s²）', col: 'c', sty: 'dash', f: () => -10 }]
    : [
      { key: 'x', y: [0, 24], yt: [10, 20], name: '位置 x（m）', col: 'a', sty: 'solid', f: s => ball(s, st.what).x },
      { key: 'v', y: [-24, 24], yt: [-20, 20], name: '速度 v（m/s）', col: 'b', sty: 'solid', f: s => ball(s, st.what).v },
      { key: 'a', y: [-13, 4], yt: [-10], name: '加速度 a（m/s²）', col: 'c', sty: 'dash', f: s => ball(s, st.what).a }];
  gs.forEach((g, i) => {
    const v = cv.view({ x0: 0, x1: 4.4, y0: g.y[0], y1: g.y[1], box: [L, 22 + i * 133, Wd, 100] });
    v.axes({ xt: [1, 2, 3, 4], yt: g.yt });
    if (i === 2) cv.text('t（s）', L + Wd + 6, v.Y(0) + 16, { align: 'right', size: 14, color: 'sub' });
    if (sign && g.key !== 'a') {
      v.poly([[0, g.y[0]], [2, g.y[0]], [2, g.y[1]], [0, g.y[1]]], { fill: 'e', alpha: 0.08 });
      v.text(i === 0 ? 'おそくなる' : '', 1, g.y[1] * 0.6, { align: 'center', size: 15, color: 'sub' });
      v.text(i === 0 ? '速くなる' : '', 3, g.y[1] * 0.6, { align: 'center', size: 15, color: 'sub' });
    }
    v.plot(g.f, { x0: 0, x1: 4, color: g.col, style: g.sty, width: 3, n: 400 });
    if (st.what && g.key !== 'a') v.plot(s => ball(s).x * (g.key === 'x') + ball(s).v * (g.key === 'v'), { x0: 2, x1: 4, color: 'sub', width: 1, alpha: 0.5 });
    cv.line([[v.X(t), v.T], [v.X(t), v.T + v.Hp]], { color: 'sub', style: 'dot', width: 1.2 });
    v.dot(t, g.f(t), { color: 'ink', r: 6 });
    cv.text(g.name, L + Wd - 4, 22 + i * 133 + 2, { align: 'right', size: 15, color: g.col, bold: true, bg: true });
  });
  if (!sign) { const v = cv.view({ x0: 0, x1: 4.4, y0: 0, y1: 24, box: [L, 22, Wd, 100] }); if (!st.what) v.text('最高点 20 m', 2, 20, { align: 'center', base: 'bottom', size: 14, color: 'sub' }); }
  if (sign) {
    // 矢印の向きを言葉で
    const s = Math.abs(b.v) < 1e-9 ? '一瞬止まる' : b.v > 0 ? '向きがちがう → おそくなる' : '向きが同じ → 速くなる';
    cv.text(s, 135, 30, { align: 'center', size: 15, bold: true, bg: true });
  }
}

function drawElev(cv, st) {
  const t = st.t, e = elev(t);
  // 左：昇降路（0〜16 m）
  const s = cv.view({ x0: 0, x1: 1, y0: -1, y1: 19.5, box: [40, 14, 170, 392] });
  cv.line([[s.X(0.2), s.Y(-0.5)], [s.X(0.2), s.Y(18.5)]], { color: 'sub', width: 2 });
  cv.line([[s.X(0.8), s.Y(-0.5)], [s.X(0.8), s.Y(18.5)]], { color: 'sub', width: 2 });
  for (const q of [0, 4, 8, 12, 16]) cv.text(q + ' m', s.X(0.2) - 6, s.Y(q), { align: 'right', size: 14, color: 'sub' });
  const y0 = s.Y(e.x), y1 = s.Y(e.x + 2.6);
  cv.rect(s.X(0.24), y1, s.X(0.76) - s.X(0.24), y0 - y1, { fill: 'panel', alpha: 1, color: 'ink', width: 2 });
  cv.line([[s.X(0.5), y1], [s.X(0.5), s.Y(19.5)]], { color: 'ink', width: 1.5 });
  // 人（頭と体）
  const px = s.X(0.5), feet = y0 - 3;
  cv.circle(px, feet - 34, 6, { fill: 'ink', alpha: 1 });
  cv.line([[px, feet - 27], [px, feet - 12], [px - 7, feet]], { color: 'ink', width: 3 }); cv.line([[px, feet - 12], [px + 7, feet]], { color: 'ink', width: 3 });
  cv.line([[px - 9, feet - 22], [px + 9, feet - 22]], { color: 'ink', width: 3 });
  // 矢印
  if (Math.abs(e.v) > 0.02) cv.arrow(s.X(0.95), (y0 + y1) / 2, s.X(0.95), (y0 + y1) / 2 - e.v * 26, { color: 'b', width: 3.5 });
  if (e.a !== 0) cv.arrow(s.X(1.08), (y0 + y1) / 2, s.X(1.08), (y0 + y1) / 2 - e.a * 40, { color: 'c', width: 3.5, style: 'dash' });
  const feel = e.a > 0 ? '重い' : e.a < 0 ? '軽い' : 'ふつう';
  cv.text(feel, px, y1 - 14, { align: 'center', size: 16, bold: true, bg: true });
  // 右：v-t と a-t
  const L = 300, Wd = 550;
  const v = cv.view({ x0: 0, x1: 10.8, y0: 0, y1: 2.9, box: [L, 30, Wd, 150] });
  v.axes({ xt: [2, 4, 6, 8, 10], yt: [1, 2], xl: 't（s）', yl: 'v（m/s）' });
  v.line([[0, 0], [2, 2], [8, 2], [10, 0]], { color: 'b', width: 3 });
  v.text('傾き 1', 1.3, 0.9, { size: 15, color: 'b', align: 'left' }); v.text('傾き 0', 5, 2.15, { size: 15, color: 'b', align: 'center', base: 'bottom' }); v.text('傾き −1', 8.7, 0.9, { size: 15, color: 'b', align: 'right' });
  const a = cv.view({ x0: 0, x1: 10.8, y0: -1.7, y1: 1.7, box: [L, 240, Wd, 150] });
  a.axes({ xt: [2, 4, 6, 8, 10], yt: [-1, 1], xl: 't（s）', yl: 'a（m/s²）' });
  a.line([[0, 1], [2, 1]], { color: 'c', width: 3.5, style: 'dash' }); a.line([[2, 0], [8, 0]], { color: 'c', width: 3.5, style: 'dash' }); a.line([[8, -1], [10, -1]], { color: 'c', width: 3.5, style: 'dash' });
  a.text('重く感じる', 2.3, 1, { size: 15 }); a.text('ふつう', 5, 0.2, { size: 15, align: 'center', base: 'bottom' }); a.text('軽く感じる', 7.7, -1, { size: 15, align: 'right' });
  for (const g of [v, a]) cv.line([[g.X(t), g.T], [g.X(t), g.T + g.Hp]], { color: 'sub', style: 'dot', width: 1.2 });
  v.dot(t, e.v, { color: 'ink', r: 6 }); a.dot(t, e.a, { color: 'ink', r: 6 });
}
