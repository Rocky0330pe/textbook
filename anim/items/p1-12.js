// @id p1-12
// @title ピストン・クランク：回る動きを往復に
// @vol 物理1
// @from 物理 力-7 ⑥（p1-07 のピストン・クランクの図と式、r＝40 mm・l＝140 mm のグラフ、回転数を2倍にすると）
'use strict';
// x ＝ r cosθ ＋ √(l² − r² sin²θ)。速度は破線の矢印。
const px = (r, l, t) => r * Math.cos(t) + Math.sqrt(l * l - r * r * Math.sin(t) ** 2);
const pv = (r, l, t, w) => -r * w * Math.sin(t) * (1 + r * Math.cos(t) / Math.sqrt(l * l - r * r * Math.sin(t) ** 2));
A.item({
  id: 'p1-12', title: 'ピストン・クランク：回る動きを往復に',
  from: '物理 第1巻『力学』 力-7 ⑥ のピストン・クランクの図・式・グラフから（熱-7 ①、波-1 でも使う）',
  W: 880, H: 440,
  state: { th: 0, r: 40, l: 140, n: 3000 },
  scenes: [
    {
      key: 'ichi', label: '① ピストンの位置',
      lead: 'クランク（半径 $r$）が回ると、連接棒（長さ $l$）がピストンを押し引きします。ピストンの位置 $x$ を、$r\\cos\\theta$ の波とくらべましょう。',
      note: '$x=r\\cos\\theta+\\sqrt{l^2-r^2\\sin^2\\theta}$。$\\theta=0°$ でいちばん右（上死点 $l+r$）、180° でいちばん左（下死点 $l-r$）。ピストンは $r\\cos\\theta$ の波に近い動きをしますが、連接棒が傾く分だけくずれます。$r=40$ mm、$l=140$ mm では、90° のとき 5.8 mm だけ下死点の側にいます。連接棒が長いほど（$l/r$ が大きいほど）、ずれは小さくなります。',
      legend: [['ピストンの位置 $x-l$', { color: 'a' }], ['$r\\cos\\theta$', { color: 'b', style: 'dash' }], ['クランク $r$', { color: 'a', shape: 'circle', noline: true }], ['連接棒 $l$', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 'r', label: 'クランクの半径 $r$〔mm〕', min: 20, max: 60, step: 1, d: 0 }, { range: 'l', label: '連接棒の長さ $l$〔mm〕', min: 80, max: 260, step: 2, d: 0 }],
      step(st, dt) { st.th = (st.th + dt * 1.2) % (2 * Math.PI); },
      draw: drawIchi,
      readout: st => { const x = px(st.r, st.l, st.th); return `$\\theta$ ＝ ${A.num(st.th * 180 / Math.PI, 0)}°　　$x-l$ ＝ ${A.num(x - st.l, 1)} mm　　$r\\cos\\theta$ ＝ ${A.num(st.r * Math.cos(st.th), 1)} mm　　ずれ ${A.num(x - st.l - st.r * Math.cos(st.th), 1)} mm　（90° で ${A.num(px(st.r, st.l, Math.PI / 2) - st.l, 1)} mm）`; }
    },
    {
      key: 'hayasa', label: '② ピストンの速さ',
      lead: 'エンジンが毎分 3000 回転すると、ピストンはどれだけ速く動くでしょう。速さのグラフを見ましょう。',
      note: '$\\dfrac{dx}{dt}=-r\\omega\\sin\\theta(1+\\dfrac{r\\cos\\theta}{\\sqrt{l^2-r^2\\sin^2\\theta}})$。死点（0°・180°）で速さは0になり、向きを変えます。平均の速さは $4rn$（毎分 3000 回転・$r=40$ mm で 8 m/s）、いちばん速いのは $\\theta\\approx75°$ のときで約 13 m/s。回転数を2倍にすると、どちらも2倍になります。',
      legend: [['ピストンの速度', { color: 'a' }], ['$-r\\omega\\sin\\theta$', { color: 'b', style: 'dash' }], ['速度の矢印（破線）', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'n', label: '回転数〔毎分〕', min: 1000, max: 6000, step: 100, d: 0 }],
      step(st, dt) { st.th = (st.th + dt * 1.2) % (2 * Math.PI); },
      draw: drawHayasa,
      readout: st => { const w = st.n * 2 * Math.PI / 60, r = st.r / 1000, l = st.l / 1000; let m = 0; for (let d = 0; d <= 180; d += 0.5) m = Math.max(m, -pv(r, l, d * Math.PI / 180, w)); return `$\\omega$ ＝ ${A.num(w, 0)} rad/s　　いまの速さ ${A.num(Math.abs(pv(r, l, st.th, w)), 2)} m/s　　平均 $4rn$ ＝ ${A.num(4 * r * st.n / 60, 1)} m/s　　いちばん速い ${A.num(m, 1)} m/s`; }
    }
  ]
});

function mech(cv, st, box, vel) {
  const r = st.r, l = st.l, t = st.th, x = px(r, l, t);
  const v = cv.view({ x0: -70, x1: 330, y0: -75, y1: 75, box, equal: true });
  v.circle(0, 0, r, { color: 'sub', style: 'dash', width: 1 });
  // シリンダー
  v.poly([[l - r - 22, 26], [l + r + 50, 26], [l + r + 50, 30], [l - r - 22, 30]], { fill: 'sub', alpha: 0.3 });
  v.poly([[l - r - 22, -26], [l + r + 50, -26], [l + r + 50, -30], [l - r - 22, -30]], { fill: 'sub', alpha: 0.3 });
  const Ax = r * Math.cos(t), Ay = r * Math.sin(t);
  v.poly([[x - 12, -24], [x + 30, -24], [x + 30, 24], [x - 12, 24]], { fill: 'e', alpha: 0.45, color: 'ink', width: 1.5 });
  v.line([[0, 0], [Ax, Ay]], { color: 'a', width: 7 });
  v.line([[Ax, Ay], [x, 0]], { color: 'c', width: 6 });
  v.text('r', Ax / 2 - 8, Ay / 2 + 4, { size: 16, color: 'a', math: true, italic: true, bold: true }); v.text('l', (Ax + x) / 2, Ay / 2 + 10, { size: 16, color: 'c', math: true, italic: true, bold: true });
  v.dot(0, 0, { color: 'ink', r: 5 }); v.dot(Ax, Ay, { color: 'a', r: 6, open: true }); v.dot(x, 0, { color: 'c', r: 5, shape: 'square', open: true });
  v.line([[0, -50], [0, -62]], { color: 'sub', width: 1 }); v.line([[x, -30], [x, -62]], { color: 'sub', width: 1 });
  v.arrow(0, -56, x, -56, { color: 'sub', width: 1.2, head: 8 }); v.text('x = ' + A.num(x, 1) + ' mm', x / 2, -66, { size: 14, align: 'center', color: 'sub' });
  v.text('上死点', l + r, 40, { size: 14, align: 'center', color: 'sub' }); v.text('下死点', l - r, 40, { size: 14, align: 'center', color: 'sub' });
  v.line([[l + r, 30], [l + r, 34]], { color: 'sub', width: 1 }); v.line([[l - r, 30], [l - r, 34]], { color: 'sub', width: 1 });
  if (vel) { const s = vel * 6; if (Math.abs(s) > 1) v.arrow(x + 9, 0, x + 9 + s, 0, { color: 'a', style: 'dash', width: 3 }); }
  return v;
}
function drawIchi(cv, st) {
  mech(cv, st, [10, 10, 860, 190], 0);
  const g = cv.view({ x0: 0, x1: 380, y0: -70, y1: 70, box: [80, 215, 760, 215] });
  g.axes({ xt: [90, 180, 270, 360], yt: [-60, -40, -20, 20, 40, 60], xl: 'θ〔°〕', yl: 'x − l〔mm〕' });
  g.plot(d => st.r * Math.cos(d * Math.PI / 180), { x0: 0, x1: 360, color: 'b', style: 'dash', width: 2 });
  g.plot(d => px(st.r, st.l, d * Math.PI / 180) - st.l, { x0: 0, x1: 360, color: 'a', width: 2.5 });
  const d = st.th * 180 / Math.PI;
  g.dot(d, px(st.r, st.l, st.th) - st.l, { color: 'a', r: 6 }); g.dot(d, st.r * Math.cos(st.th), { color: 'b', r: 5, shape: 'square' });
  const y90 = px(st.r, st.l, Math.PI / 2) - st.l;
  g.line([[90, 0], [90, y90]], { color: 'd', width: 3 }); g.text(A.num(y90, 1) + ' mm', 96, y90 - 6, { size: 14, color: 'd' });
}
function drawHayasa(cv, st) {
  const w = st.n * 2 * Math.PI / 60, r = st.r / 1000, l = st.l / 1000, vv = pv(r, l, st.th, w);
  mech(cv, st, [10, 10, 860, 190], vv);
  const vm = Math.max(14, Math.ceil(r * w * 1.3 / 5) * 5);
  const g = cv.view({ x0: 0, x1: 380, y0: -vm, y1: vm, box: [80, 215, 760, 215] });
  g.axes({ xt: [90, 180, 270, 360], yt: A.range(-vm + vm % 10, vm, 10).filter(y => y !== 0), xl: 'θ〔°〕', yl: '速度〔m/s〕（右向き＋）' });
  g.plot(d => -r * w * Math.sin(d * Math.PI / 180), { x0: 0, x1: 360, color: 'b', style: 'dash', width: 2 });
  g.plot(d => pv(r, l, d * Math.PI / 180, w), { x0: 0, x1: 360, color: 'a', width: 2.5 });
  g.dot(st.th * 180 / Math.PI, vv, { color: 'a', r: 6 });
  const avg = 4 * r * st.n / 60;
  g.plot(() => -avg, { x0: 0, x1: 360, color: 'sub', style: 'dot', width: 1 }); g.text('平均の速さ ' + A.num(avg, 1), 365, -avg - 2, { size: 14, color: 'sub', align: 'right' });
}
