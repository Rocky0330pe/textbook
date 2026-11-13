// @id p1-08
// @title ジェットコースターとエネルギーの棒グラフ
// @vol 物理1
// @from 物理 力-4 ①③⑦⑨（p1-04 のはてな？・表計算のコース・質量 1 kg あたりのエネルギーの図）
'use strict';
// コースは本の表と同じ：10 m ごとの高さ 40, 34, 22, 10, 3, 2, 8, 18, 28, 35, 38（m）。その先は下り坂を足した。
// 点の間は、本の表計算と同じに、まっすぐな坂でつなぐ（各点の v² が表と同じになる）。坂にそった運動方程式
//   a ＝ −g sinθ − μ′g cosθ（動く向きと反対）
// を A.rk4 で細かい刻みで解く。エネルギーは質量 1 kg あたり（本の図と同じ）。
const G = 9.8, MU = 0.03;
const PX = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120], PH = [40, 34, 22, 10, 3, 2, 8, 18, 28, 35, 38, 35, 28];
function hBase(x) {
  const i = A.clamp(Math.floor(x / 10), 0, 11), u = A.clamp(x / 10 - i, 0, 1);
  return PH[i] + (PH[i + 1] - PH[i]) * u;
}
const bump = x => x <= 50 ? 0 : Math.pow(Math.sin(Math.PI * Math.min(x - 50, 100) / 100), 2);
const hAt = (st, x) => hBase(x) + (st.H2 - 38) * bump(x);
const slope = (st, x) => { const i = A.clamp(Math.floor(x / 10), 0, 11); return (PH[i + 1] - PH[i]) / 10 + (st.H2 - 38) * (bump(x + 0.01) - bump(x - 0.01)) / 0.02; };
A.item({
  id: 'p1-08', title: 'ジェットコースターとエネルギーの棒グラフ',
  from: '物理 第1巻『力学』 力-4 のはてな？、③ 表計算のコース、⑦ 力学的エネルギー、⑨ の図から（数学 6-6、熱-2、波-1 でも使う）',
  W: 880, H: 440,
  state: { mu: 0, H2: 38 },
  scenes: [
    {
      key: 'coaster', label: '① エネルギーの棒',
      lead: '高さ 40 m の山の上から、コースターが動き出します。位置エネルギー・運動エネルギー・失った分の棒を見ましょう（1 kg あたり）。',
      note: '摩擦がなければ、和 $\\frac{1}{2}v^2+gh$ はいつも $9.8\\times40=392$（J/kg）。谷で位置エネルギーが運動エネルギーに変わり、山で戻ります。摩擦があると、水平に進んだ距離に比例して和が減ります（10 m ごとに $0.03\\times9.8\\times10=2.94$ J/kg）。失った分は、熱や音になっています。',
      legend: [['位置エネルギー $gh$', { color: 'a', shape: 'square', noline: true }], ['運動エネルギー $\\frac{1}{2}v^2$', { color: 'b', shape: 'square', noline: true }], ['失った分（熱・音）', { color: 'sub', shape: 'square', noline: true }], ['最初の山の高さ 40 m', { color: 'd', style: 'dash' }], ['速度（破線の矢印）', { color: 'c', style: 'dash' }]],
      controls: [{ seg: 'mu', label: '摩擦', options: [[0, 'なし（$\\mu\'=0$）'], [MU, 'あり（$\\mu\'=0.03$）']], on: reset }],
      init: reset,
      step: simStep,
      draw(cv, st) { drawCourse(cv, st, true); },
      readout: rd
    },
    {
      key: 'yama', label: '② 2つめの山の高さ',
      lead: 'はてな？　2つめの山を、最初の山（40 m）より高くできるでしょうか。山の高さを変えて走らせてみましょう。',
      note: '摩擦がなくても、コースターは**最初の山と同じ高さ**までしか上がれません（運動エネルギーが0になる所）。摩擦があると、それより低い所で止まり、もどってきます（38 m の山も越えられない：$x$ が約 97 m、高さ約 37 m で止まる）。だから、モーターで引き上げないかぎり、2つめの山は最初の山より低く作ります。',
      miss: '「谷でついた勢いで、もっと高くまで上れる」はまちがい。勢い（運動エネルギー）は、下りた高さの分だけしかつきません。',
      legend: [['位置エネルギー $gh$', { color: 'a', shape: 'square', noline: true }], ['運動エネルギー $\\frac{1}{2}v^2$', { color: 'b', shape: 'square', noline: true }], ['失った分', { color: 'sub', shape: 'square', noline: true }], ['最初の山の高さ 40 m', { color: 'd', style: 'dash' }]],
      controls: [{ range: 'H2', label: '2つめの山の高さ〔m〕', min: 30, max: 45, step: 0.5, d: 1, on: reset }, { seg: 'mu', label: '摩擦', options: [[0, 'なし'], [MU, 'あり（$\\mu\'=0.03$）']], on: reset }],
      init: reset,
      step: simStep,
      draw(cv, st) { drawCourse(cv, st, false); },
      readout: rd
    }
  ]
});

function reset(st) { st.y = [0.02, 0]; st.t = 0; st.trav = 0; st.done = false; st.msg = ''; st.maxx = 0; st.hist = []; }
function acc(st, x, v) {
  const s = slope(st, x), c = 1 / Math.sqrt(1 + s * s), sn = s * c;
  return -G * sn - st.mu * G * c * Math.sign(v);
}
function simStep(st, dt) {
  if (st.done) return false;
  const h = 0.002;
  for (let k = 0; k < Math.round(dt * 1.6 / h); k++) {
    const x = st.y[0], v = st.y[1];
    const fn = (t, y) => { const s = slope(st, y[0]); return [y[1] / Math.sqrt(1 + s * s), acc(st, y[0], v === 0 ? -Math.sign(s) || 1 : v)]; };
    let y = A.rk4(fn, 0, st.y, h);
    if (v !== 0 && Math.sign(y[1]) !== Math.sign(v) && y[1] !== 0) y[1] = 0;   // 止まった瞬間
    if (y[1] === 0) { const s = slope(st, y[0]); if (Math.abs(s) < 1e-3) { st.done = true; st.msg = '止まった'; } }
    st.trav += Math.abs(y[0] - x); st.y = y; st.t += h; st.maxx = Math.max(st.maxx, y[0]);
    if (y[0] >= 119.5) { st.y[0] = 119.5; st.done = true; st.msg = '山を越えた'; return false; }
    if (y[0] < 0) { st.y = [0, 0]; st.done = true; st.msg = 'はじめの山までもどった'; return false; }
    if (k % 20 === 0) st.hist.push([y[0], hAt(st, y[0])]);
    if (st.t > 90) { st.done = true; return false; }
  }
  if (st.y[0] < st.maxx - 0.5 && !st.msg) st.msg = '上りきれずにもどってきた（$x$ ≈ ' + A.num(st.maxx, 1) + ' m で止まった）';
}
function energies(st) { const x = st.y[0], v = st.y[1], U = G * hAt(st, x), K = 0.5 * v * v; return { U, K, L: Math.max(0, G * 40 - U - K) }; }
function rd(st) { const e = energies(st); return `$x$ ＝ ${A.num(st.y[0], 1)} m　高さ ${A.num(hAt(st, st.y[0]), 1)} m　速さ ${A.num(Math.abs(st.y[1]), 1)} m/s　　$gh$ ${A.num(e.U, 0)}　$\\frac{1}{2}v^2$ ${A.num(e.K, 0)}　失った ${A.num(e.L, 0)}（J/kg）　${st.msg || ''}`; }

function drawCourse(cv, st, kv) {
  const V = cv.view({ x0: -4, x1: 124, y0: -3, y1: 50, box: [30, 14, 560, 250] });
  V.axes({ xt: [20, 40, 60, 80, 100, 120], yt: [10, 20, 30, 40], xl: 'x〔m〕', yl: '高さ〔m〕', ax: 0 });
  V.area(x => hAt(st, x), 0, 120, { fill: 'grid', alpha: 0.8 });
  V.plot(x => hAt(st, x), { x0: 0, x1: 120, color: 'ink', width: 3 });
  V.plot(() => 40, { x0: 0, x1: 124, color: 'd', style: 'dash', width: 1.5 });
  V.text('最初の山の高さ 40 m', 122, 43.5, { size: 14, color: 'd', align: 'right', bg: true });
  if (st.hist.length > 1) V.line(st.hist, { color: 'c', width: 2, alpha: 0.4 });
  const x = st.y[0], y = hAt(st, x), s = slope(st, x), ang = Math.atan(s * V.sy / V.sx);
  const g = cv.g, px = V.X(x), py = V.Y(y);
  g.save(); g.translate(px, py); g.rotate(-ang); cv.rect(-12, -14, 24, 12, { fill: 'b', alpha: 0.85, color: 'ink', width: 1 }); g.restore();
  if (Math.abs(st.y[1]) > 0.3) { const d = Math.sign(st.y[1]), c = Math.cos(ang), sn = Math.sin(ang), L = Math.abs(st.y[1]) * 2.2; cv.arrow(px - 16 * sn, py - 16 * c, px - 16 * sn + d * L * c, py - 16 * c - d * L * sn, { color: 'c', style: 'dash', width: 3 }); }
  // エネルギーの棒（1 kg あたり）
  const e = energies(st), bx = 640, by = 250, k = 0.5;
  cv.text('エネルギー〔J/kg〕', bx + 100, 22, { size: 14, bold: true, align: 'center' });
  const bars = [['位置 gh', e.U, 'a'], ['運動 ½v²', e.K, 'b'], ['失った', e.L, 'sub']];
  bars.forEach(([n, v, c], i) => { const X = bx + i * 70; cv.rect(X, by - v * k, 50, v * k, { fill: c, alpha: 0.6, color: c, width: 1 }); cv.text(n, X + 25, by + 14, { size: 14, align: 'center' }); cv.text(A.num(v, 0), X + 25, by - v * k - 10, { size: 14, align: 'center' }); });
  cv.line([[bx - 8, by - 392 * k], [bx + 210, by - 392 * k]], { color: 'd', style: 'dash', width: 1 }); cv.text('392（= 9.8×40）', bx + 210, by - 392 * k - 10, { size: 13, color: 'd', align: 'right' });
  if (kv) {
    // 速さと運動エネルギー：速さ2倍でエネルギー4倍
    const P = cv.view({ x0: 0, x1: 30, y0: 0, y1: 450, box: [90, 300, 430, 110] });
    P.axes({ xt: [10, 20, 28], yt: [200, 400], xl: '速さ v〔m/s〕', yl: '½v²〔J/kg〕' });
    P.plot(v => v * v / 2, { color: 'b', width: 2 });
    for (const v of [10, 20]) { P.dot(v, v * v / 2, { color: 'b', r: 4 }); P.text(A.num(v * v / 2, 0), v + 0.6, v * v / 2 + 30, { size: 14, color: 'sub' }); }
    P.dot(Math.abs(st.y[1]), e.K, { color: 'b', r: 7, shape: 'diamond' });
    cv.text('速さが2倍なら、', 580, 330, { size: 15, color: 'sub' }); cv.text('運動エネルギーは4倍', 580, 352, { size: 15, color: 'sub' });
    cv.text('（10 → 20 m/s で 50 → 200 J/kg）', 580, 374, { size: 14, color: 'sub' });
  } else {
    const F = cv.view({ x0: -4, x1: 124, y0: 0, y1: 420, box: [30, 300, 560, 120] });
    F.axes({ xt: [20, 40, 60, 80, 100, 120], yt: [200, 392], xl: 'x〔m〕', yl: '和 ½v²+gh〔J/kg〕' });
    F.plot(() => 392, { x0: 0, x1: 120, color: 'd', style: 'dash', width: 1 });
    if (st.mu) F.plot(x => 392 - G * MU * x, { x0: 0, x1: Math.min(st.maxx, 120), color: 'c', width: 2.5 }); else F.plot(() => 392, { x0: 0, x1: Math.min(st.maxx, 120), color: 'c', width: 2.5 });
    cv.text(st.mu ? '摩擦あり：進んだ距離に比例して和が減る' : '摩擦なし：和は一定（392）', 600, 340, { size: 14, color: 'sub' });
  }
}
