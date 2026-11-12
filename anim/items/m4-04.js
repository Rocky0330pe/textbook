// @id m4-04
// @title 向きの変わらない矢印をさがす
// @vol 数学7
// @from 数学 7-8 図1・2・3（ch7-08:167・197・232）
'use strict';
// 主役の行列 A=(2 1;1 2)。長さ1の矢印 (cosθ, sinθ) に A をかけて、向きの変わり方を見る
const DG = Math.PI / 180;
const Av = p => [2 * p[0] + p[1], p[0] + 2 * p[1]];
const wrap = a => { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; };
const change = th => { const q = Av([Math.cos(th * DG), Math.sin(th * DG)]); return wrap(Math.atan2(q[1], q[0]) / DG - th); };
const deg = v => A.num(v, 1) + '°';

function circleView(cv, box, r) { return cv.view({ x0: -r, x1: r, y0: -r, y1: r, box, equal: true }); }
function base(v, ticks) {
  v.axes({ xt: ticks, yt: ticks, xl: 'x', yl: 'y' });
  v.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.5 });
}
function eigLines(v, R) {
  v.clip(() => { v.line([[-R, -R], [R, R]], { color: 'd', style: 'dash', width: 1.5, alpha: 0.8 }); v.line([[-R, R], [R, -R]], { color: 'd', style: 'dash', width: 1.5, alpha: 0.8 }); });
}
// 小さな回る向きの弧（a0 から a1 へ、度）
function turnArc(v, a0, a1, r, color) {
  if (Math.abs(a1 - a0) < 1) return;
  const pts = []; for (let k = 0; k <= 16; k++) { const a = (a0 + (a1 - a0) * k / 16) * DG; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
  v.line(pts, { color, width: 2.5 }); const e = pts[16], e2 = pts[14]; v.arrow(e2[0], e2[1], e[0], e[1], { color, width: 2.5, head: 10 });
}

function drawSagasu(cv, st) {
  const th = st.th, v = circleView(cv, [10, 10, 400, 420], 3.3);
  base(v, [-3, -2, -1, 1, 2, 3]); eigLines(v, 3.3);
  const p = [Math.cos(th * DG), Math.sin(th * DG)], q = Av(p), c = change(th);
  v.arrow(0, 0, p[0], p[1], { color: 'sub', width: 4 });
  v.arrow(0, 0, q[0], q[1], { color: 'b', width: 3, style: 'dash' });
  turnArc(v, th, th + c, 0.55, 'd');
  v.dot(p[0], p[1], { color: 'ink', r: 6 }); cv.circle(v.X(p[0]), v.Y(p[1]), 12, { color: 'ink', width: 1.5 });
  v.text('v', p[0] * 1.2, p[1] * 1.2 + 0.18, { size: 17, math: true, italic: true, bold: true });
  v.text('Av', q[0] + 0.15, q[1] + 0.2, { size: 17, math: true, italic: true, bold: true, color: 'b', bg: true });
  // 右：向きの変わり方のグラフ（−180°〜180°）
  const g = cv.view({ x0: -180, x1: 180, y0: -36, y1: 36, box: [460, 30, 400, 360] });
  g.axes({ xt: [-135, -90, -45, 45, 90, 135], yt: [-30, -20, -10, 10, 20, 30], xl: 'θ（°）', yl: '変わり方（°）', xfmt: v => A.num(v, 0) });
  g.plot(change, { color: 'a', width: 2.5 });
  for (const a of [-135, -45, 45, 135]) g.dot(a, 0, { color: 'd', r: 6, shape: 'diamond' });
  g.dot(th, c, { color: 'ink', r: 6 });
  g.line([[th, 0], [th, c]], { color: 'ink', width: 1, style: 'dot' });
  cv.text('左回りに回される（正）', 470, 46, { size: 14, color: 'sub' });
  cv.text('右回りに回される（負）', 470, 372, { size: 14, color: 'sub' });
}

function drawDaen(cv, st) {
  const v = circleView(cv, [10, 10, 520, 420], 3.4);
  base(v, [-3, -2, -1, 1, 2, 3]); eigLines(v, 3.4);
  const T = st.sweep;   // ここまで（度）をかく
  // 円の点と、A をかけた点（だ円）
  const pts = []; for (let a = 0; a <= T + 1e-9; a += 2) pts.push(Av([Math.cos(a * DG), Math.sin(a * DG)]));
  v.line(pts, { color: 'b', width: 3 });
  for (let a = 0; a <= T; a += 30) { const p = [Math.cos(a * DG), Math.sin(a * DG)], q = Av(p); v.line([p, q], { color: 'sub', width: 1, alpha: 0.6 }); v.dot(q[0], q[1], { color: 'b', r: 3.5 }); }
  // 固有ベクトルの点（45°・−45°）と、物差しの点
  for (const a of [45, -45, 225, 135]) { const p = [Math.cos(a * DG), Math.sin(a * DG)], q = Av(p); v.dot(p[0], p[1], { color: 'd', r: 6, shape: 'diamond' }); v.dot(q[0], q[1], { color: 'd', r: 6, shape: 'diamond' }); }
  for (const p of [[1, 0], [0, 1]]) { const q = Av(p); v.dot(p[0], p[1], { color: 'a', r: 6, shape: 'square' }); v.dot(q[0], q[1], { color: 'a', r: 6, shape: 'square' }); v.arrow(p[0], p[1], q[0] - 0.12 * (q[0] - p[0]), q[1] - 0.12 * (q[1] - p[1]), { color: 'a', width: 1.5 }); }
  v.text('(2, 1)', 2.15, 0.85, { size: 15, color: 'a', bg: true }); v.text('(1, 2)', 0.65, 2.25, { size: 15, color: 'a', bg: true });
  v.text('45°：3倍', 2.2, 2.4, { size: 15, color: 'd', bold: true, bg: true }); v.text('−45°：1倍', 0.85, -1.05, { size: 15, color: 'd', bold: true, bg: true });
  const x = 580;
  cv.text('円の上の点に A をかけると、', x, 40, { size: 15 });
  cv.text('ななめにのびた だ円になる。', x, 64, { size: 15 });
  cv.text('いちばん長い向き：45°（3倍）', x, 120, { size: 15, color: 'd', bold: true });
  cv.text('いちばん短い向き：−45°（1倍）', x, 148, { size: 15, color: 'd', bold: true });
  cv.text('この2つの向きだけ、', x, 196, { size: 15 });
  cv.text('点が点線の直線の上にとどまる。', x, 220, { size: 15 });
  cv.text('(1, 0)・(0, 1) は向きが変わる。', x, 268, { size: 15, color: 'a' });
}

function drawHiki(cv, st) {
  const v = circleView(cv, [10, 10, 520, 420], 1.45);
  v.axes({ xt: [-1, 1], yt: [-1, 1], xl: 'x', yl: 'y' });
  v.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.5 });
  eigLines(v, 1.45);
  // 13本の矢印（表と同じ −90° から 90° まで 15° ごと）と、180° 反対の13本
  for (const a of st.ang) {
    const p = [Math.cos(a * DG), Math.sin(a * DG)], c = change(a);
    const toward = (wrap(a - 45) * c < 0 && Math.abs(wrap(a - 45)) < 90) || (wrap(a - 225) * c < 0 && Math.abs(wrap(a - 225)) < 90);
    v.arrow(0, 0, p[0], p[1], { color: toward ? 'b' : 'a', width: 2, style: toward ? 'solid' : 'dash', alpha: 0.85 });
    turnArc(v, a, a + c * 0.9, 1.2, toward ? 'b' : 'a');
  }
  for (const a of [45, 225]) v.dot(Math.cos(a * DG), Math.sin(a * DG), { color: 'd', r: 7, shape: 'diamond' });
  for (const a of [-45, 135]) v.dot(Math.cos(a * DG), Math.sin(a * DG), { color: 'd', r: 7, shape: 'square', open: true });
  v.text('45°：引きよせる', 0.78, 1.0, { size: 15, color: 'd', bold: true, bg: true });
  v.text('−45°：遠ざける', 0.72, -1.0, { size: 15, color: 'd', bold: true, bg: true });
  const x = 580;
  cv.text('外の弧：A をかけたとき、', x, 40, { size: 15 });
  cv.text('その矢印が回される向きと大きさ', x, 64, { size: 15 });
  cv.text('「A をかけて、長さを1にもどす」を', x, 130, { size: 15 });
  cv.text('くり返すと、矢印はどこへ行く？', x, 154, { size: 15 });
  cv.text('くり返した回数：' + st.n, x, 210, { size: 17, bold: true });
}

A.item({
  id: 'm4-04', title: '向きの変わらない矢印をさがす',
  from: '数学 第7巻 7-8「固有値と固有ベクトル」の図から（7-9・7-10、8-5、物理 力-9 でも使う）',
  W: 880, H: 440,
  state: { th: 0, sweep: 360, n: 0, ang: [], k: 0 },
  scenes: [
    {
      key: 'sagasu', label: '① 回しながら、さがす',
      lead: '長さ1の矢印 $\\vec v$（灰色）を1周させて、主役の行列 $A$ をかけた矢印 $A\\vec v$（オレンジ）とくらべます。矢印の先はドラッグできます。',
      note: '$\\theta=45°$ と $-45°$ では、向きが変わりません（右のグラフが0の線と交わる赤い点）。$45°$ では同じ向きのまま3倍、$-45°$ ではまったく変わりません（1倍）。このように、行列をかけても向きの変わらない矢印を**固有ベクトル**、何倍になるかを**固有値**といいます。',
      legend: [['入れた矢印 $\\vec v$（長さ1）', { color: 'sub' }], ['出てきた矢印 $A\\vec v$', { color: 'b', style: 'dash' }], ['回された向き', { color: 'd' }], ['向きが変わらない所', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ range: 'th', label: '矢印の角 $\\theta$', min: -180, max: 180, step: 1, fmt: v => Math.round(v) + '°' }],
      step(st, dt) { st.th += 25 * dt; if (st.th > 180) st.th -= 360; },
      drag: {
        hit(st, x, y) { const v = circleView({ W: 880, H: 440 }, [10, 10, 400, 420], 3.3); const p = v.P([Math.cos(st.th * DG), Math.sin(st.th * DG)]); return A.near(x, y, p[0], p[1], 26) ? 1 : null; },
        move(st, x, y) { const v = circleView({ W: 880, H: 440 }, [10, 10, 400, 420], 3.3); const [a, b] = v.inv(x, y); st.th = Math.round(Math.atan2(b, a) / DG); }
      },
      draw: drawSagasu,
      readout: st => { const p = [Math.cos(st.th * DG), Math.sin(st.th * DG)], q = Av(p); return `$\\vec v=(${A.num(p[0], 3)},\\ ${A.num(p[1], 3)})$ → $A\\vec v=(${A.num(q[0], 3)},\\ ${A.num(q[1], 3)})$　向きの変わり方 <b>${deg(change(st.th))}</b>`; }
    },
    {
      key: 'daen', label: '② 円がだ円になる',
      lead: '長さ1の矢印の先を1周ぶん集めた円に、$A$ をかけます。▶ で、円の点が1つずつ動いていく先を見ましょう。',
      note: 'だ円のいちばん長い向き（$45°$）と、いちばん短い向き（$-45°$）が、ちょうど向きの変わらない2つの向きです。$45°$ の矢印は3倍にのばされるだけ、$-45°$ の矢印は1倍でそのまま。ほかの矢印は、のばされながら長い向きのほうへかたむけられます。',
      state: { sweep: 0 },
      legend: [['長さ1の円', { color: 'sub', style: 'dot' }], ['$A$ をかけた点（だ円）', { color: 'b' }], ['$45°$・$-45°$ の点', { color: 'd', shape: 'diamond', noline: true }], ['$(1,\\ 0)$・$(0,\\ 1)$ とその行き先', { color: 'a', shape: 'square' }]],
      step(st, dt) { st.sweep = Math.min(360, st.sweep + 60 * dt); if (st.sweep >= 360) return false; },
      draw: drawDaen,
      readout: st => `かいた角：0° 〜 ${Math.round(st.sweep)}°`
    },
    {
      key: 'hikiyose', label: '③ 引きよせ・遠ざけ',
      lead: '$-90°$ から $90°$ まで $15°$ ごとの矢印（と、その反対向き）に、$A$ がどちら向きに回すかを、外の弧でかきました。▶ で、「$A$ をかけて長さを1にもどす」をくり返します。',
      note: '$45°$ のまわりの矢印は $45°$ のほうへ**引きよせられ**、$-45°$ のまわりの矢印は $-45°$ から**遠ざけられ**ます。くり返すと、どの矢印も $45°$（または反対の $225°$）にそろっていきます。これが、7-8④ の「何回もかけると、そろってくる」のしくみです（M4-05）。',
      miss: '$(-1,\\ 1)$ や $(2,\\ 2)$ も同じ直線の上なので、同じ固有ベクトルです。固有ベクトルは向き（直線）で決まり、長さは自由です。',
      legend: [['引きよせられる矢印', { color: 'b' }], ['遠ざけられる矢印', { color: 'a', style: 'dash' }], ['引きよせる向き（$45°$・$225°$）', { color: 'd', shape: 'diamond', noline: true }]],
      init(st) { st.ang = []; for (let a = -90; a < 270; a += 15) st.ang.push(a); st.n = 0; st.k = 0; },
      step(st, dt) {
        st.k += dt * 1.2;
        // 1回分（k が 1 ふえる）のあいだに、A をかけて長さを1にした向きへ、少しずつ動かす
        st.ang = st.ang.map(a => { const q = Av([Math.cos(a * DG), Math.sin(a * DG)]); const b = Math.atan2(q[1], q[0]) / DG; return a + wrap(b - a) * Math.min(1, dt * 1.2); });
        if (st.k >= 1) { st.k = 0; st.n++; }
        if (st.n >= 8) return false;
      },
      draw: drawHiki,
      readout: st => `くり返した回数 ${st.n}`
    }
  ]
});
