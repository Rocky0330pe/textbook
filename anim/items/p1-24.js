// @id p1-24
// @title 装置の中をめぐる水と冷媒：線図の点と乾き度
// @vol 物理2
// @from 物理 熱-8 ②⑤⑥（p2-08 の乾き度・T-s 線図・ランキンサイクル）、熱-9 ①②（p2-09 の冷凍サイクル・p-h 線図）／熱-5・熱-10 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 数は本の図と例題と同じ：ランキン（10 MPa・500 ℃→10 kPa。h1＝3375.1、h2＝2089.6、h3＝191.8、h4＝201.9 kJ/kg、x2＝0.7934、η＝0.402）、
// 冷凍（R32、蒸発 5 ℃・凝縮 45 ℃。h1＝516.1、h2＝559.2、h3＝h4＝286.3 kJ/kg、COP＝5.33）。
// 飽和ドーム（水の T-s、R32 の p-h）は本の図の点（IAPWS-IF97・CoolProp で計算した値）。
const DOME_T = [0.01, 20, 45.81, 100, 150, 200, 250, 300, 340, 360, 370, 373, 373.95];
const DOME_S1 = [0, 0.2965, 0.6493, 1.3070, 1.8420, 2.3308, 2.7934, 3.2547, 3.6599, 3.9164, 4.1142, 4.2380, 4.4120];
const DOME_S2 = [9.1555, 8.6661, 8.1488, 7.3541, 6.8370, 6.4303, 6.0722, 5.7058, 5.3359, 5.0527, 4.7996, 4.6293, 4.4120];
const R32_P = [0.1774, 0.4058, 0.8131, 0.9514, 1.4746, 2.4783, 2.795, 3.9332, 4.8768, 5.5315, 5.7697, 5.783];
const R32_H1 = [133.2, 165.9, 200.0, 208.8, 236.1, 275.6, 286.3, 321.9, 351.7, 378.0, 400.4, 414.1];
const R32_H2 = [502.0, 510.0, 515.3, 516.1, 516.9, 512.7, 510.3, 497.4, 479.5, 455.9, 428.9, 414.1];
// 線図の上の道（番号は装置の番号と同じ）
const RK = [
  { name: '3→4 ポンプ：水を押して 10 MPa に（仕事 $w_{\\text{入}}$ ＝ 10.1 kJ/kg）', dev: 'pump', w: 0.12, pts: [[0.6493, 45.81], [0.6493, 46.1]] },
  { name: '4→1 ボイラー：温めて、わかし、過熱蒸気に（熱 $q_{\\text{入}}$ ＝ 3173.2 kJ/kg）', dev: 'boiler', w: 0.4, pts: [[0.6493, 46.1], [1.2994, 100], [1.8315, 150], [2.3177, 200], [2.7791, 250], [3.2484, 300], [3.3603, 311.0], [5.6160, 311.0], [5.9458, 350], [6.2139, 400], [6.4217, 450], [6.5993, 500]] },
  { name: '1→2 タービン：膨張して羽根車を回す（仕事 $w_{\\text{出}}$ ＝ 1285.5 kJ/kg）', dev: 'turbine', w: 0.2, pts: [[6.5993, 500], [6.5993, 45.81]] },
  { name: '2→3 復水器：冷やして水にもどす（熱 $q_{\\text{出}}$ ＝ 1897.8 kJ/kg）', dev: 'cond', w: 0.28, pts: [[6.5993, 45.81], [0.6493, 45.81]] }
];
const RF = [
  { name: '1→2 圧縮機：気体を押し縮める（仕事 $w_{\\text{入}}$ ＝ 43.1 kJ/kg）', dev: 'comp', w: 0.2, pts: [[516.1, 0.9514], [533.5, 1.5], [545.1, 2.0], [554.4, 2.5], [559.2, 2.795]] },
  { name: '2→3 凝縮器：外へ熱を捨てて液にもどす（$q_{\\mathrm H}$ ＝ 272.9 kJ/kg）', dev: 'cond', w: 0.3, pts: [[559.2, 2.795], [286.3, 2.795]] },
  { name: '3→4 膨張弁：すき間を通して圧力を一気に下げる（h は一定）', dev: 'valve', w: 0.15, pts: [[286.3, 2.795], [286.3, 0.9514]] },
  { name: '4→1 蒸発器：部屋から熱をうばって蒸発する（$q_{\\mathrm L}$ ＝ 229.8 kJ/kg）', dev: 'evap', w: 0.35, pts: [[286.3, 0.9514], [516.1, 0.9514]] }
];
// 流れの道（キャンバスの座標）。装置ごとに、通る道を折れ線で決める
const RK_PATH = {
  pump: [[230, 345], [150, 345], [70, 345], [70, 300]],
  boiler: [[70, 300], [48, 280], [92, 255], [48, 230], [92, 205], [48, 180], [92, 155], [70, 130], [70, 70], [230, 70]],
  turbine: [[230, 70], [270, 90], [300, 150]],
  cond: [[300, 150], [300, 290], [300, 330], [230, 345]]
};
const RF_PATH = {
  comp: [[60, 330], [60, 230], [60, 130], [60, 70]],
  cond: [[60, 70], [180, 70], [330, 70], [330, 130]],
  valve: [[330, 130], [330, 230]],
  evap: [[330, 230], [330, 330], [200, 330], [60, 330]]
};
A.item({
  id: 'p1-24', title: '装置の中をめぐる水と冷媒：線図の点と乾き度',
  from: '物理 第2巻『熱学』 熱-8 ⑤⑥ と 熱-9 ② の図から（ランキンサイクル、冷凍サイクル）',
  W: 880, H: 440,
  state: { u: 0 },
  scenes: [
    {
      key: 'rankine', label: '① 発電所：ランキンサイクル',
      lead: '水 1 kg のかたまりが、ポンプ→ボイラー→タービン→復水器とめぐります。装置の中の場所と、$T$-$s$ 線図の点を見くらべましょう。',
      note: 'ドームの中は湿り蒸気で、圧力が一定なら温度も一定（横の線）。ボイラーの中でわいている間（311 ℃）と、復水器の中（45.81 ℃）がそうです。タービンでは $s$ が一定（真下へ）で、出口は乾き度 $x_2=0.7934$ の湿り蒸気。効率は $\\eta=(1285.5-10.1)/3173.2\\approx0.402$。',
      miss: '乾き度 $x$ は「何割が水蒸気か」で、温度とは別です。ドームの中では、温度が同じでも $x$ は 0 から 1 まで変わります。ドームの外（圧縮液・過熱蒸気）では、乾き度は使いません。',
      legend: [['飽和ドーム（左：飽和液、右：飽和蒸気）', { color: 'ink' }], ['サイクルの道', { color: 'b' }], ['水のかたまり', { color: 'a', shape: 'circle', noline: true }]],
      init(st) { st.u = 0; },
      step(st, dt) { st.u = (st.u + dt * 0.045) % 1; },
      draw(cv, st) { drawRankine(cv, st); },
      readout: st => { const q = rkAt(st.u); return `${q.seg.name}${SP}${A.num(q.T, 1)} ℃・$s$ ＝ ${A.num(q.s, 3)}${SP}<b>${q.xs}</b>`; }
    },
    {
      key: 'reitou', label: '② エアコン：冷凍サイクル',
      lead: '冷媒 R32 が、圧縮機→凝縮器→膨張弁→蒸発器とめぐります。$p$-$h$ 線図では、横の長さがそのまま熱や仕事です。',
      note: '蒸発器と凝縮器は圧力が一定なので横の線、膨張弁は $h$ が一定なのでたての線です。部屋からうばう熱 $q_{\\mathrm L}=h_1-h_4=229.8$、圧縮機の仕事 $w_{\\text{入}}=h_2-h_1=43.1$（kJ/kg）なので、$\\mathrm{COP}_{\\text{冷}}=5.33$。膨張弁を出た所で、もう約 25 % が蒸気になっています。',
      miss: '冷凍サイクルは、ランキンサイクルを逆向きに回したものです。仕事を入れて、低い温度の所（部屋）から熱を受けとり、高い温度の所（外）へ捨てます。熱を低い温度から高い温度へ運ぶには、必ず仕事が要ります。',
      legend: [['飽和の線（山の形）', { color: 'ink' }], ['サイクルの道', { color: 'a' }], ['冷媒のかたまり', { color: 'b', shape: 'circle', noline: true }]],
      init(st) { st.u = 0; },
      step(st, dt) { st.u = (st.u + dt * 0.05) % 1; },
      draw(cv, st) { drawFridge(cv, st); },
      readout: st => { const q = rfAt(st.u); return `${q.seg.name}${SP}$h$ ＝ ${A.num(q.h, 1)} kJ/kg・${A.num(q.p, 3)} MPa${SP}<b>${q.xs}</b>`; }
    }
  ]
});

// ---------- 計算 ----------
function interp(xs, ys, x) { if (xs[0] > xs[xs.length - 1]) { xs = xs.slice().reverse(); ys = ys.slice().reverse(); } if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; }
function pick(segs, u) { let a = 0; for (const s of segs) { if (u < a + s.w) return { seg: s, f: (u - a) / s.w }; a += s.w; } return { seg: segs[segs.length - 1], f: 1 }; }
function alongPts(pts, f, sx, sy) { // 図の上の長さで f の所
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot((pts[i][0] - pts[i - 1][0]) * sx, (pts[i][1] - pts[i - 1][1]) * sy); L.push(l); tot += l; }
  let d = f * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const t = L[i] ? Math.min(1, d / L[i]) : 1; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; } d -= L[i]; }
  return pts[pts.length - 1];
}
function rkAt(u) {
  const { seg, f } = pick(RK, u), [s, T] = alongPts(seg.pts, f, 1 / 9.4, 1 / 560);
  const s1 = interp(DOME_T, DOME_S1, T), s2 = interp(DOME_T, DOME_S2, T);
  let xs;
  if (T > 373.9 || s > s2 + 1e-6) xs = '過熱蒸気（ドームの右の外）';
  else if (s < s1 - 1e-6) xs = '圧縮液（わく温度より冷たい水）';
  else xs = `湿り蒸気：乾き度 x ＝ ${A.num((s - s1) / (s2 - s1), 3)}`;
  return { seg, f, s, T, xs };
}
function rfAt(u) {
  const { seg, f } = pick(RF, u), [h, lp] = alongPts(seg.pts.map(q => [q[0], Math.log10(q[1])]), f, 1 / 540, 1 / 2), p = Math.pow(10, lp);
  const lps = R32_P.map(Math.log10), h1 = interp(lps, R32_H1, lp), h2 = interp(lps, R32_H2, lp);
  let xs;
  if (h > h2 + 0.05) xs = '蒸気（過熱）'; else if (h < h1 - 0.05) xs = '液（過冷却）'; else xs = `液と蒸気が混ざる：乾き度 x ＝ ${A.num((h - h1) / (h2 - h1), 3)}`;
  return { seg, f, h, p, xs };
}

// ---------- 装置の絵 ----------
// 流れの道（キャンバスの座標）。装置ごとに、通る道を折れ線で決める
function polyAt(pts, f) { return alongPts(pts, f, 1, 1); }
function box(cv, x, y, w, h, lab, col, alpha) { cv.rect(x, y, w, h, { fill: col, alpha: alpha || 0.12, color: 'ink', width: 2 }); cv.text(lab, x + w / 2, y + h / 2, { align: 'center', size: 15, bold: true, bg: true }); }
function drawRankine(cv, st) {
  const q = rkAt(st.u);
  for (const k in RK_PATH) cv.line(RK_PATH[k], { color: 'sub', width: 6, alpha: 0.35 });
  box(cv, 30, 120, 80, 170, 'ボイラー', 'b', 0.15);
  cv.poly([[230, 45], [230, 100], [320, 130], [320, 20]], { fill: 'a', alpha: 0.12, color: 'ink', width: 2 }); cv.text('タービン', 275, 72, { align: 'center', size: 15, bold: true, bg: true });
  box(cv, 250, 250, 100, 70, '復水器', 'a', 0.12);
  cv.circle(150, 345, 18, { fill: 'sub', alpha: 0.2, color: 'ink', width: 2 }); cv.text('ポンプ', 150, 385, { align: 'center', size: 15, bold: true });
  cv.arrow(0, 205, 28, 205, { color: 'b', width: 3 }); cv.text('q入', 4, 185, { size: 15, color: 'b', bold: true });
  cv.arrow(320, 90, 370, 90, { color: 'c', width: 3, style: 'long' }); cv.text('w出', 372, 108, { size: 15, color: 'c', bold: true });
  cv.arrow(350, 285, 385, 285, { color: 'a', width: 3, style: 'dash' }); cv.text('q出', 360, 305, { size: 15, color: 'a', bold: true });
  for (const [n, x, y] of [['1', 215, 55], ['2', 315, 165], ['3', 235, 365], ['4', 52, 318]]) { cv.circle(x, y, 11, { color: 'ink', width: 1.5 }); cv.text(n, x, y, { align: 'center', size: 14, bold: true }); }
  const P = polyAt(RK_PATH[q.seg.dev], q.f);
  cv.dot(P[0], P[1], { color: 'a', r: 9 });
  // T-s 線図
  const g = cv.view({ x0: 0, x1: 9.4, y0: 0, y1: 560, box: [430, 30, 430, 360] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6, 7, 8, 9], yt: [100, 200, 300, 400, 500], xl: 's（kJ/(kg·K)）', yl: '温度（℃）' });
  g.line(DOME_T.map((T, i) => [DOME_S1[i], T]), { color: 'ink', width: 2 });
  g.line(DOME_T.map((T, i) => [DOME_S2[i], T]), { color: 'ink', width: 2 });
  g.text('湿り蒸気', 4.5, 150, { align: 'center', size: 15, color: 'sub' });
  g.text('過熱蒸気', 7.6, 430, { align: 'center', size: 15, color: 'sub' });
  for (const s of RK) g.line(s.pts, { color: 'b', width: s === q.seg ? 4 : 2, alpha: s === q.seg ? 1 : 0.6 });
  for (const [n, s, T, dx, dy] of [['1', 6.5993, 500, 12, -8], ['2', 6.5993, 45.81, 12, 12], ['3', 0.6493, 45.81, -12, 14], ['4', 0.6493, 46.1, -12, -10]]) cv.text(n, g.X(s) + dx, g.Y(T) + dy, { size: 15, bold: true, align: 'center' });
  g.dot(q.s, q.T, { color: 'a', r: 7 });
}
function drawFridge(cv, st) {
  const q = rfAt(st.u);
  for (const k in RF_PATH) cv.line(RF_PATH[k], { color: 'sub', width: 6, alpha: 0.35 });
  cv.circle(60, 200, 30, { fill: 'sub', alpha: 0.2, color: 'ink', width: 2 }); cv.text('圧縮機', 60, 200, { align: 'center', size: 14, bold: true, bg: true });
  box(cv, 130, 45, 150, 50, '凝縮器（外）', 'b', 0.15);
  cv.poly([[318, 165], [342, 165], [330, 185]], { fill: 'ink', alpha: 0.8 }); cv.poly([[318, 205], [342, 205], [330, 185]], { fill: 'ink', alpha: 0.8 }); cv.text('膨張弁', 350, 185, { size: 14, bold: true });
  box(cv, 130, 305, 150, 50, '蒸発器（部屋）', 'a', 0.15);
  cv.arrow(205, 40, 205, 12, { color: 'b', width: 3 }); cv.text('qH を外へ', 215, 18, { size: 14, color: 'b', bold: true });
  cv.arrow(205, 400, 205, 360, { color: 'a', width: 3, style: 'dash' }); cv.text('qL を部屋から', 215, 395, { size: 14, color: 'a', bold: true });
  cv.arrow(5, 200, 28, 200, { color: 'c', width: 3, style: 'long' }); cv.text('w入', 6, 225, { size: 14, color: 'c', bold: true });
  for (const [n, x, y] of [['1', 40, 345], ['2', 40, 70], ['3', 350, 130], ['4', 350, 240]]) { cv.circle(x, y, 11, { color: 'ink', width: 1.5 }); cv.text(n, x, y, { align: 'center', size: 14, bold: true }); }
  const P = polyAt(RF_PATH[q.seg.dev], q.f);
  cv.dot(P[0], P[1], { color: 'b', r: 9 });
  // p-h 線図（縦は対数）
  const L = Math.log10, g = cv.view({ x0: 100, x1: 640, y0: L(0.1), y1: L(8), box: [450, 30, 410, 360] });
  g.axes({ xt: [200, 300, 400, 500, 600], yt: [0.1, 0.2, 0.5, 1, 2, 5].map(L), xl: 'h（kJ/kg）', yl: 'p（MPa）', yfmt: v => String(+Math.pow(10, v).toFixed(1)), ay: 100, ax: L(0.1) });
  g.line(R32_P.map((p, i) => [R32_H1[i], L(p)]), { color: 'ink', width: 2 });
  g.line(R32_P.map((p, i) => [R32_H2[i], L(p)]), { color: 'ink', width: 2 });
  g.text('液', 160, L(2), { size: 15, color: 'sub', align: 'center' });
  g.text('液と蒸気が混ざる', 390, L(0.3), { size: 15, color: 'sub', align: 'center' });
  g.text('蒸気', 600, L(0.3), { size: 15, color: 'sub', align: 'center' });
  for (const s of RF) g.line(s.pts.map(p => [p[0], L(p[1])]), { color: 'a', width: s === q.seg ? 4 : 2, alpha: s === q.seg ? 1 : 0.6 });
  for (const [n, h, p, dx, dy] of [['1', 516.1, 0.9514, 12, 14], ['2', 559.2, 2.795, 12, -12], ['3', 286.3, 2.795, -12, -12], ['4', 286.3, 0.9514, -12, 14]]) cv.text(n, g.X(h) + dx, g.Y(L(p)) + dy, { size: 15, bold: true, align: 'center' });
  g.dot(q.h, L(q.p), { color: 'b', r: 7 });
  g.text('5 ℃', 400, L(0.9514) - 0.07, { size: 14, color: 'sub', align: 'center' });
  g.text('45 ℃', 420, L(2.795) + 0.07, { size: 14, color: 'sub', align: 'center' });
}
