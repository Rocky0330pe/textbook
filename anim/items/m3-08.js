// @id m3-08
// @title 負の面積はもどった分：変位と道のり
// @vol 数学5
// @from 数学 5-9 ⑦（ch5-09:405〜470 のろう下と投げ上げたボール）・まちがえやすいところ（ch5-09:947・953）／5-11、物理 力 でも使う
'use strict';
// 5-9：右向きを＋。4 m/s で 3 秒（＋12）、−2 m/s で 2 秒（−4）。変位 8 m、道のり 16 m
// 5-9：v=20−10t（上向き＋）。0〜2 秒 ＋20、2〜4 秒 −20。4 秒で変位 0、道のり 40 m
const sh = v => String(Number(v.toFixed(2))).replace('-', '−');
const CASES = {
  rouka: { T: 5, v: t => t < 3 ? 4 : -2, x: t => t <= 3 ? 4 * t : 12 - 2 * (t - 3), dist: t => t <= 3 ? 4 * t : 12 + 2 * (t - 3), vy: [-3.6, 5], vyt: [-2, 4], xt: [1, 2, 3, 4, 5], pos: [0, 13], posT: [0, 4, 8, 12] },
  ball: { T: 4, v: t => 20 - 10 * t, x: t => 20 * t - 5 * t * t, dist: t => t <= 2 ? 20 * t - 5 * t * t : 40 - (20 * t - 5 * t * t), vy: [-24, 26], vyt: [-20, 20], xt: [1, 2, 3, 4], pos: [0, 21], posT: [0, 5, 10, 15, 20] }
};

A.item({
  id: 'm3-08', title: '負の面積はもどった分：変位と道のり',
  from: '数学 第5巻 5-9「速度がマイナスの部分は、マイナスの面積」の図から（5-11、物理 力 でも使う）',
  W: 880, H: 420,
  state: { t: 0 },
  scenes: [
    {
      key: 'rouka', label: '① ろう下を行き来する',
      lead: 'ろう下で、右向きを＋とします。4 m/s で 3 秒進み、そのあと −2 m/s で 2 秒もどります。▶ で、$v$-$t$ グラフの面積をぬりながら動きます。',
      note: '横軸より上の面積 $4\\times3=+12$ は右へ 12 m 進んだ分、下の面積 $(-2)\\times2=-4$ は左へ 4 m もどった分です。面積を符号のままたした $12+(-4)=8$ m が**変位**、大きさをたした $12+4=16$ m が**道のり**です。',
      miss: '変位と道のりをまちがえない。道のりは、もどった分もプラスにしてたします（16 m）。変位は符号のままたします（8 m）。',
      legend: [['$v$-$t$ グラフ', { color: 'ink', width: 3 }], ['＋の面積（進んだ分）', { color: 'a', style: 'solid' }], ['−の面積（もどった分・破線のふち）', { color: 'b', style: 'dash' }]],
      state: { c: 'rouka' },
      controls: [{ range: 't', label: '時刻 $t$（s）', min: 0, max: 5, step: 0.01 }],
      step(st, dt) { st.t = Math.min(5, st.t + dt * 0.7); if (st.t >= 5) return false; },
      draw(cv, st) { drawVT(cv, st); },
      readout: st => ro(st)
    },
    {
      key: 'ball', label: '② 投げ上げたボール',
      lead: 'ボールを 20 m/s で真上に投げます（上向きを＋）。$v=20-10t$ の線が横軸を横切ると、面積の符号が変わります。',
      note: '0〜2 秒の三角形は $+20$（上がった）、2〜4 秒の三角形は $-20$（落ちた）。4 秒では変位 $20+(-20)=0$ で手の高さにもどり、道のりは $20+20=40$ m です。',
      miss: '$x$-$t$ グラフの面積を求めてしまわない。距離になるのは $v$-$t$ グラフ（速度のグラフ）の面積です。',
      legend: [['$v=20-10t$', { color: 'ink', width: 3 }], ['＋の面積（上がった分）', { color: 'a', style: 'solid' }], ['−の面積（落ちた分・破線のふち）', { color: 'b', style: 'dash' }]],
      state: { c: 'ball' },
      controls: [{ range: 't', label: '時刻 $t$（s）', min: 0, max: 4, step: 0.01 }],
      step(st, dt) { st.t = Math.min(4, st.t + dt * 0.6); if (st.t >= 4) return false; },
      draw(cv, st) { drawVT(cv, st); },
      readout: st => ro(st)
    }
  ]
});

function ro(st) { const C = CASES[st.c], t = st.t; return `$t$ ＝ ${A.num(t, 2)} s：面積の合計（変位）＝ <b>${sh(C.x(t))} m</b>、大きさの合計（道のり）＝ <b>${sh(C.dist(t))} m</b>`; }

function drawVT(cv, st) {
  const C = CASES[st.c], t = st.t, ball = st.c === 'ball';
  const g = cv.view({ x0: 0, x1: C.T + 0.8, y0: C.vy[0], y1: C.vy[1], box: [60, 24, 440, 360] });
  g.axes({ xt: C.xt, yt: C.vyt, xl: 't（s）', yl: 'v（m/s）' });
  // ぬった面積（0〜t）
  const N = 200, pos = [], neg = [];
  const seg = (a, b, sign) => { if (b <= a) return; const pts = [[a, 0]]; for (let k = 0; k <= N; k++) { const s = a + (b - a) * k / N; pts.push([s, C.v(s)]); } pts.push([b, 0]); (sign > 0 ? pos : neg).push(pts); };
  const z = ball ? 2 : 3;
  seg(0, Math.min(t, z), 1); seg(z, t, -1);
  pos.forEach(p => g.poly(p, { fill: 'a', alpha: 0.3, color: 'a', width: 1.5 }));
  neg.forEach(p => g.poly(p, { fill: 'b', alpha: 0.3, color: 'b', style: 'dash', width: 1.5 }));
  // 線（ろう下は 3 秒でとぶ）
  if (ball) g.plot(C.v, { x0: 0, x1: 4, color: 'ink', width: 3 });
  else { g.line([[0, 4], [3, 4]], { color: 'ink', width: 3 }); g.line([[3, -2], [5, -2]], { color: 'ink', width: 3 }); g.line([[3, 4], [3, -2]], { color: 'sub', width: 1, style: 'dot' }); }
  // 面積の数（見えている分）
  const aPos = C.x(Math.min(t, z)), aNeg = C.x(t) - C.x(Math.min(t, z));
  if (aPos > 0.5) g.text('＋' + sh(aPos), Math.min(t, z) / (ball ? 3 : 2), ball ? 6 : 2, { align: 'center', size: 17, bold: true, bg: true });
  if (aNeg < (ball ? -2 : -0.3)) g.text(sh(aNeg), ball ? z + (t - z) * 0.66 : (z + t) / 2, ball ? C.v(z + (t - z) * 0.66) / 2.6 : -1, { align: 'center', size: 17, bold: true, bg: true });
  cv.line([[g.X(t), g.T], [g.X(t), g.T + g.Hp]], { color: 'sub', style: 'dot', width: 1.2 });
  g.dot(t, C.v(t), { color: 'ink', r: 6 });
  // 右：位置の数直線（ろう下は横、ボールはたて）と、カウンター
  const L = 560;
  if (!ball) {
    const p = cv.view({ x0: -0.8, x1: 13.8, y0: -1, y1: 1, box: [L - 20, 60, 320, 70] });
    cv.arrow(p.X(-0.5), p.Y(0), p.X(13.6), p.Y(0), { color: 'sub', width: 1.5, head: 9 });
    for (let k = 0; k <= 13; k++) cv.line([[p.X(k), p.Y(0) - 4], [p.X(k), p.Y(0) + 4]], { color: 'sub', width: 1 });
    for (const k of C.posT) cv.text(String(k), p.X(k), p.Y(0) + 16, { align: 'center', size: 14, color: 'sub' });
    cv.text('m', p.X(13.6), p.Y(0) + 16, { align: 'right', size: 14, color: 'sub' });
    // 通った道（行き・帰り）
    const go = Math.min(t, 3) * 4;
    cv.arrow(p.X(0), p.Y(0) - 24, p.X(go), p.Y(0) - 24, { color: 'a', width: 3 });
    if (t > 3) cv.arrow(p.X(12), p.Y(0) - 40, p.X(C.x(t)), p.Y(0) - 40, { color: 'b', width: 3, style: 'dash' });
    cv.circle(p.X(C.x(t)), p.Y(0), 8, { fill: 'd', alpha: 0.9, color: 'ink', width: 1.5 });
    cv.text('はじめ', p.X(0), p.Y(0) + 34, { align: 'center', size: 14 });
  } else {
    const p = cv.view({ x0: 0, x1: 1, y0: -1, y1: 22, box: [L, 30, 60, 330] });
    cv.line([[p.X(0.5), p.Y(0)], [p.X(0.5), p.Y(21)]], { color: 'sub', width: 1.5 });
    for (const k of C.posT) { cv.line([[p.X(0.5) - 4, p.Y(k)], [p.X(0.5) + 4, p.Y(k)]], { color: 'sub', width: 1 }); cv.text(String(k), p.X(0.5) - 8, p.Y(k), { align: 'right', size: 14, color: 'sub' }); }
    cv.text('高さ（m）', p.X(0.5), p.Y(21.8), { align: 'center', size: 14, color: 'sub' });
    cv.circle(p.X(0.5) + 16, p.Y(C.x(t)), 9, { fill: 'd', alpha: 0.9, color: 'ink', width: 1.5 });
  }
  const R = ball ? 680 : L, T0 = ball ? 80 : 210;
  cv.text('変位（面積を符号のまま）', R, T0, { size: 15, color: 'sub' });
  cv.text(sh(C.x(t)) + ' m', R, T0 + 30, { size: 22, bold: true, color: 'd' });
  cv.text('道のり（大きさをたす）', R, T0 + 72, { size: 15, color: 'sub' });
  cv.text(sh(C.dist(t)) + ' m', R, T0 + 102, { size: 22, bold: true });
}
