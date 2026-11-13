// @id p1-16
// @title 傾いた船がもどるわけ：浮心とメタセンター
// @vol 物理1
// @from 物理 力-12 ⑦⑧（p1-12 の浮力・船の安定・メタセンター）／力-5 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>'; // 読み出しの区切り（全角の空白は行の終わりではみ出すので使わない）
// 箱の形の船（はば b、喫水 d＝2 m、深さ 4.5 m）。本の例：はば 10 m・喫水 2 m で KB＝1 m、BM＝b²/(12d)＝4.17 m、KM＝5.17 m。
// 傾けたときの浮心は、水の中の形（多角形）の重心を計算して求める（押しのけた体積は傾けても同じになるように水面を決める）。
const SHIP_D = 2, SHIP_H = 4.5;
const rad = d => d * Math.PI / 180;
A.item({
  id: 'p1-16', title: '傾いた船がもどるわけ：浮心とメタセンター',
  from: '物理 第1巻『力学』 力-12 ⑦⑧ の図から（はば 10 m・喫水 2 m の箱の船。力-5 のモーメントでも使う）',
  W: 880, H: 440,
  state: { th: 10, KG: 3, b: 10, w: 0, t: 0, over: false },
  scenes: [
    {
      key: 'modoru', label: '① 傾けて離す',
      lead: '船を傾けて離すと、元にもどります。水に沈む部分の形が変わり、**浮心 B が低い側へ動く**ようすを見ましょう。',
      note: '重さは重心 G から下向き、浮力は浮心 B′ から上向きにかかります。B′ が G より低い側にあると、2つの力が船を**元にもどす向き**に回します。B′ から真上に引いた線が中心線と交わる点が、メタセンター M です。',
      miss: '「G が B より上だから倒れる」と考えがちですが、ふつうの船は G のほうが B より上です。決め手は G と B ではなく、**G と M** の上下です。',
      legend: [['重さ（G から下向き）', { color: 'b' }], ['浮力（B′ から上向き）', { color: 'a', style: 'dash' }], ['B′ を通る鉛直線と中心線', { color: 'sub', style: 'dot' }], ['メタセンター M', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ range: 'th', label: '傾き $\\theta$', min: -30, max: 30, step: 0.5, fmt: v => A.num(v, 1) + '°', on: st => { st.w = 0; st.over = false; } }],
      init(st) { st.th = 12; st.w = 0; },
      step: roll,
      drag: { hit: () => 1, move(st, x, y) { st.th = A.clamp((x - 440) / 6, -30, 30); st.w = 0; st.over = false; } },
      draw(cv, st) { drawShip(cv, st, { full: true }); },
      readout: st => { const s = ship(st); const r = s.GZ * Math.sign(st.th); return `傾き ${A.num(st.th, 1)}°${SP}G と B′ の横のずれ GZ ＝ <b>${A.num(Math.abs(s.GZ), 2)} m</b>${Math.abs(st.th) < 0.3 ? '' : r > 0 ? '（元にもどす向き）' : '（傾きを大きくする向き）'}${SP}KM ＝ ${A.num(s.KM, 2)} m（小さい傾きの式では ${A.num(1 + st.b * st.b / 24, 2)} m）`; }
    },
    {
      key: 'omoni', label: '② 荷物を高く積む',
      lead: '荷物を高く積むと、重心の高さ KG が大きくなります。KG を上げて、船を揺らしてみましょう。',
      note: 'はば 10 m・喫水 2 m の箱の船では、KM ＝ KB ＋ BM ＝ 1 ＋ 4.17 ＝ 5.17 m です。GM ＝ KM − KG が正なら安定、**KG が約 5.2 m をこえると GM が負**になり、少しの傾きでひっくり返ります。',
      miss: 'GM が負でも、すぐに真横まで倒れるとはかぎりません。傾いて水の中の形がさらに変わり、途中で止まることもあります（大きく傾いたときは「復原力曲線」で調べる）。小さい傾きで元にもどらない時点で、船としては危険です。',
      legend: [['GM ＝ 5.17 − KG（本のグラフ）', { color: 'a' }], ['いまの KG', { color: 'b', shape: 'circle', noline: true }], ['重さ（G から下向き）', { color: 'b' }], ['浮力（B′ から上向き）', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'KG', label: '重心の高さ KG', min: 1.5, max: 6.5, step: 0.05, fmt: v => A.num(v, 2) + ' m', on: st => { st.th = 3; st.w = 0; st.over = false; } }],
      init(st) { st.th = 8; st.w = 0; st.KG = 3; },
      step: roll,
      draw(cv, st) { drawShip(cv, st, { graph: 'gm' }); },
      readout: st => { const gm = 1 + st.b * st.b / 24 - st.KG; return `GM ＝ ${A.num(1 + st.b * st.b / 24, 2)} − ${A.num(st.KG, 2)} ＝ <b>${A.num(gm, 2)} m</b>　${gm > 0 ? '（安定：元にもどる）' : '（不安定：傾きが大きくなる）'}${st.over ? '　→ ひっくり返った' : ''}`; }
    },
    {
      key: 'haba', label: '③ はばと BM',
      lead: '傾くと、高い側の三角形が水から出て、同じ形の三角形が低い側で水に入ります。はば $b$ を変えてみましょう。',
      note: '三角形の重心は中心線から $b/3$ の所なので、その分の水が $2b/3$ 動いたのと同じです。そこから $\\mathrm{BB\'}=\\frac{b^2}{12d}\\tan\\theta$、$\\mathrm{BM}=\\frac{b^2}{12d}$ が出ます。**はばが2倍なら BM は4倍**。はばの広い船ほど安定します。',
      miss: 'BM の式は傾きが小さいとき（約10°まで）の近似です。甲板のはしが水に入ったり、底が水から出たりすると、三角形の形が変わります。',
      state: { th: 8 },
      legend: [['水から出る三角形', { color: 'b', style: 'dash' }], ['水に入る三角形', { color: 'a' }], ['三角形の重心（中心線から b/3）', { color: 'ink', shape: 'square', noline: true }]],
      controls: [{ range: 'b', label: 'はば $b$', min: 5, max: 14, step: 0.1, fmt: v => A.num(v, 1) + ' m' }, { range: 'th', label: '傾き $\\theta$', min: 0, max: 15, step: 0.5, fmt: v => A.num(v, 1) + '°' }],
      draw(cv, st) { drawShip(cv, st, { wedge: true, graph: 'bm' }); },
      readout: st => `BM ＝ $b^2/(12d)$ ＝ ${A.num(st.b, 1)}² ÷ 24 ＝ <b>${A.num(st.b * st.b / 24, 2)} m</b>${SP}計算した KM − KB ＝ ${A.num(ship(st).KM - 1, 2)} m`
    }
  ]
});

// ---------- 計算 ----------
// 船の座標（キール K が原点、上が y）を、傾き θ（右が下がる向きが正）で回して、上へ h ずらす
function toWorld(p, th, h) { const c = Math.cos(th), s = Math.sin(th), x = p[0], y = p[1] - SHIP_D; return [x * c + y * s, -x * s + y * c + h]; }
function clipBelow(poly) { // y<0 の部分（水の中）
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length], pin = P[1] < 0, qin = Q[1] < 0;
    if (pin) out.push(P);
    if (pin !== qin) { const t = P[1] / (P[1] - Q[1]); out.push([P[0] + (Q[0] - P[0]) * t, 0]); }
  }
  return out;
}
function areaCen(poly) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length], c = x1 * y2 - x2 * y1; a += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c; }
  a /= 2; return { a: Math.abs(a), x: a ? cx / (6 * a) : 0, y: a ? cy / (6 * a) : 0 };
}
function ship(st) {
  const th = rad(st.th), b = st.b, box = [[-b / 2, 0], [b / 2, 0], [b / 2, SHIP_H], [-b / 2, SHIP_H]];
  const want = b * SHIP_D;
  let lo = -SHIP_H, hi = SHIP_H; // 水面に対する上下のずれ h を、沈む面積が b·d になるように決める
  for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2, a = areaCen(clipBelow(box.map(p => toWorld(p, th, m)))).a; if (a > want) lo = m; else hi = m; }
  const h = (lo + hi) / 2, W = box.map(p => toWorld(p, th, h)), sub = clipBelow(W), B = areaCen(sub);
  const G = toWorld([0, st.KG], th, h), K = toWorld([0, 0], th, h), O = toWorld([0, SHIP_D], th, h);
  const ux = Math.sin(th), uy = Math.cos(th);
  let KM = 1 + b * b / 24, M;
  if (Math.abs(ux) > 1e-3) { const t = (B.x - K[0]) / ux; KM = t; }
  M = [K[0] + KM * ux, K[1] + KM * uy];
  return { W, sub, B: [B.x, B.y], G, K, M, O, KM, h, GZ: B.x - G[0], ux, uy };
}
// 度で数える：θ''＝−k·GZ（減衰を少し入れる）
function roll(st, dt) {
  if (st.over) return false;
  const n = 4, h = dt / n;
  for (let k = 0; k < n; k++) { const s = ship(st); st.w += (-1.6 * 57.3 * s.GZ - 0.8 * st.w) * h; st.th += st.w * h; }
  if (Math.abs(st.th) > 60) { st.th = Math.sign(st.th) * 60; st.over = true; return false; }
}

// ---------- 絵 ----------
function drawShip(cv, st, o) {
  const s = ship(st), wide = !!o.graph;
  const v = cv.view({ x0: -9.5, x1: 9.5, y0: -4.5, y1: 7.2, box: wide ? [10, 14, 520, 412] : [10, 14, 860, 412], equal: true });
  // 水
  v.poly([[v.x0, 0], [v.x1, 0], [v.x1, v.y0], [v.x0, v.y0]], { fill: 'a', alpha: 0.1 });
  // 船
  v.poly(s.W, { fill: 'sub', alpha: 0.18 });
  v.poly(s.sub, { fill: 'a', alpha: 0.28 });
  v.poly(s.W, { color: 'ink', width: 2.5 });
  v.line([[v.x0, 0], [v.x1, 0]], { color: 'a', width: 2 });
  v.text('水面', v.x1 - 0.2, 0.35, { align: 'right', color: 'a', size: 15 });
  // 中心線
  const top = [s.K[0] + 7 * s.ux, s.K[1] + 7 * s.uy];
  v.line([s.K, top], { color: 'sub', style: 'dot', width: 1.5 });
  if (o.wedge) drawWedge(v, st, s);
  // 力の矢印
  // 重さは G から下へ、浮力は B′ の下から B′ へ（2本が重ならないように、矢じりを B′ に当てる）
  const L = 1.5;
  v.arrow(s.G[0], s.G[1] - 0.15, s.G[0], s.G[1] - L, { color: 'b', width: 3.5 });
  v.arrow(s.B[0], s.B[1] - 0.2 - L, s.B[0], s.B[1] - 0.2, { color: 'a', width: 3.5, style: 'dash' });
  if (Math.abs(st.th) > 0.3) v.line([[s.B[0], s.B[1]], [s.M[0], Math.max(s.M[1], s.B[1]) + 0.6]], { color: 'sub', style: 'dot', width: 1.5 });
  v.dot(s.K[0], s.K[1], { color: 'ink', shape: 'square', r: 4 }); v.text('K', s.K[0] - 0.5, s.K[1] - 0.1, { size: 15, bold: true, align: 'right' });
  v.dot(s.G[0], s.G[1], { color: 'b', r: 6 }); v.text('G', s.G[0] - 0.75, s.G[1] + 0.15, { size: 16, bold: true, color: 'b' });
  v.dot(s.B[0], s.B[1], { color: 'a', shape: 'tri', r: 6 }); v.text(Math.abs(st.th) > 0.3 ? 'B′' : 'B', s.B[0] + 0.4, s.B[1] + 0.1, { size: 16, bold: true, color: 'a' });
  if (s.M[1] < v.y1 - 0.3) { v.dot(s.M[0], s.M[1], { color: 'd', shape: 'diamond', r: 6 }); v.text('M', s.M[0] + 0.4, s.M[1] + 0.25, { size: 16, bold: true, color: 'd' }); }
  // 回す向き
  const gz = s.GZ, lab = Math.abs(gz) < 0.02 ? '' : (gz * Math.sign(st.th || 1) > 0 ? '元にもどす向き' : '傾きを大きくする向き');
  if (lab && Math.abs(st.th) > 0.5) {
    const ccw = st.th > 0 ? (gz > 0) : (gz < 0), cx = v.X(0), cy = Math.max(v.Y(5.6), 95), r = 55, a0 = -Math.PI / 2 - 0.5, a1 = -Math.PI / 2 + 0.5;
    cv.circle(cx, cy, r, { color: gz * Math.sign(st.th) > 0 ? 'c' : 'b', width: 3, a0, a1 });
    const ae = ccw ? a0 : a1, ad = ccw ? -1 : 1;
    cv.arrow(cx + r * Math.cos(ae - ad * 0.3), cy + r * Math.sin(ae - ad * 0.3), cx + r * Math.cos(ae), cy + r * Math.sin(ae), { color: gz * Math.sign(st.th) > 0 ? 'c' : 'b', width: 3, head: 15 });
    cv.text(lab, cx, cy - r - 14, { align: 'center', size: 15, color: gz * Math.sign(st.th) > 0 ? 'c' : 'b', bold: true, bg: true });
  }
  if (st.over) cv.text('ひっくり返った（傾き 60° で止めた）', v.X(0), v.Y(-3.6), { align: 'center', size: 16, color: 'b', bold: true, bg: true });
  if (o.graph === 'gm') drawGM(cv, st);
  if (o.graph === 'bm') drawBM(cv, st);
}
function drawWedge(v, st, s) {
  // 小さい傾きの見方：まっすぐのときの水面（中心線の上の点 O を通る）と、傾いたときの水面のあいだの2つの三角形
  const th = rad(st.th), b = st.b;
  if (th < 0.005) return;
  const P = (x, y) => toWorld([x, y], th, s.h);
  const up = [P(-b / 2, SHIP_D), P(0, SHIP_D), P(-b / 2, SHIP_D - b / 2 * Math.tan(th))]; // 高い側：出る
  const dn = [P(b / 2, SHIP_D), P(0, SHIP_D), P(b / 2, SHIP_D + b / 2 * Math.tan(th))]; // 低い側：入る
  v.poly(up, { fill: 'b', alpha: 0.25, color: 'b', style: 'dash', width: 2 });
  v.poly(dn, { fill: 'a', alpha: 0.35, color: 'a', width: 2 });
  const g1 = P(-b / 3, SHIP_D - b / 6 * Math.tan(th)), g2 = P(b / 3, SHIP_D + b / 6 * Math.tan(th));
  v.dot(g1[0], g1[1], { color: 'ink', shape: 'square', r: 4 }); v.dot(g2[0], g2[1], { color: 'ink', shape: 'square', r: 4 });
  v.arrow(g1[0], g1[1] - 3.3, g2[0], g2[1] - 3.3, { color: 'ink', width: 2 });
  v.line([g1, [g1[0], g1[1] - 3.3]], { color: 'ink', style: 'dot', width: 1 }); v.line([g2, [g2[0], g2[1] - 3.3]], { color: 'ink', style: 'dot', width: 1 });
  v.text('2b/3 動く', (g1[0] + g2[0]) / 2, (g1[1] + g2[1]) / 2 - 3.75,
 { align: 'center', size: 15, bg: true, italic: false });
}
function drawGM(cv, st) {
  const g = cv.view({ x0: 0, x1: 7, y0: -2, y1: 5.6, box: [585, 30, 270, 330] });
  const km = 1 + st.b * st.b / 24;
  g.poly([[km, -2], [7, -2], [7, 5.6], [km, 5.6]], { fill: 'b', alpha: 0.1 });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-2, -1, 1, 2, 3, 4, 5], xl: 'KG（m）', yl: 'GM（m）' });
  g.plot(x => km - x, { color: 'a', width: 3, x0: 0, x1: 6.8 });
  g.dot(st.KG, km - st.KG, { color: 'b', r: 7 });
  g.text('不安定', 6.1, 3.8, { align: 'center', size: 15, color: 'b', bold: true });
  g.text('安定', 1.6, 1.2, { align: 'center', size: 15, color: 'c', bold: true });
  cv.text('はば 10 m・喫水 2 m の箱の船', 720, 395, { align: 'center', size: 14, color: 'sub' });
}
function drawBM(cv, st) {
  const g = cv.view({ x0: 4, x1: 15, y0: 0, y1: 9, box: [585, 30, 270, 330] });
  g.axes({ xt: [5, 10, 14], yt: [2, 4, 6, 8], xl: 'b（m）', yl: 'BM（m）', ay: 4 });
  g.plot(x => x * x / 24, { color: 'a', width: 3 });
  g.dot(10, 100 / 24, { color: 'sub', shape: 'square', r: 5 });
  g.text('b ＝ 10：4.17 m', 10.2, 100 / 24 - 0.7, { size: 14, color: 'sub' });
  g.dot(st.b, st.b * st.b / 24, { color: 'b', r: 7 });
  cv.text('喫水 d ＝ 2 m', 720, 395, { align: 'center', size: 14, color: 'sub' });
}
