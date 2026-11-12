// @id m4-05
// @title くり返しかけると、そろってくる
// @vol 数学7
// @from 数学 7-8 図7（ch7-08:445）、7-9 図5（ch7-09:472）、7-11 図5（ch7-11:467）、7-10 図2（ch7-10:210）
'use strict';
const DG = Math.PI / 180;
const mulv = (M, v) => M.map(r => r.reduce((s, m, j) => s + m * v[j], 0));
const AM = [[2, 1], [1, 2]], WM = [[0.8, 0.4], [0.2, 0.6]], PM = [[0, 0, 1], [0.5, 0, 0], [0.5, 1, 0]];
const fmtN = v => Math.abs(v - Math.round(v)) < 1e-9 ? A.num(v, 0) : A.num(v, 3);
// 何回かかけた列を作る
function seq(M, v0, n) { const r = [v0]; for (let k = 0; k < n; k++) r.push(mulv(M, r[r.length - 1])); return r; }
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);

function drawBeki(cv, st) {
  const S = seq(AM, [Math.cos(st.a0 * DG), Math.sin(st.a0 * DG)], 8), n = Math.floor(st.n), u = ease(st.n - n);
  // 左：向きだけ（長さ1にそろえる）
  const v = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [10, 10, 360, 420], equal: true });
  v.axes({ xt: [-1, 1], yt: [-1, 1], xl: 'x', yl: 'y' });
  v.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.2 });
  v.clip(() => { v.line([[-2, -2], [2, 2]], { color: 'd', style: 'dash', width: 1.5 }); v.line([[-2, 2], [2, -2]], { color: 'd', style: 'dot', width: 1.2 }); });
  const dir = p => { const L = Math.hypot(p[0], p[1]); return [p[0] / L, p[1] / L]; };
  for (let k = 0; k <= Math.min(n, 8); k++) {
    let p = dir(S[k]);
    if (k === n && n < 8 && u > 0) { const q = dir(S[k + 1]); const a0 = Math.atan2(p[1], p[0]), a1 = Math.atan2(q[1], q[0]); let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; p = [Math.cos(a0 + d * u), Math.sin(a0 + d * u)]; }
    const last = k === Math.min(n, 8);
    v.arrow(0, 0, p[0], p[1], { color: last ? 'b' : 'a', width: last ? 3.5 : 1.5, alpha: last ? 1 : 0.5 });
    if (k < 4 || last) v.text(String(k), p[0] * 1.13, p[1] * 1.13, { size: 15, align: 'center', color: last ? 'b' : 'sub', bold: last });
  }
  v.text('45°', 0.98, 0.78, { size: 15, color: 'd', bold: true });
  cv.circle(v.X(Math.cos(st.a0 * DG)), v.Y(Math.sin(st.a0 * DG)), 11, { color: 'ink', width: 1.5 });
  // 中：表（本の表と同じ列）
  const x = 390; let y = 36;
  cv.text('回数', x, y, { size: 14, color: 'sub' }); cv.text('矢印', x + 50, y, { size: 14, color: 'sub' }); cv.text('向き', x + 190, y, { size: 14, color: 'sub' }); cv.text('長さ', x + 260, y, { size: 14, color: 'sub' });
  for (let k = 0; k <= Math.min(n, 8); k++) {
    y = 64 + k * 26; const p = S[k], ang = Math.atan2(p[1], p[0]) / DG;
    cv.text(String(k), x + 12, y, { size: 15, align: 'center', bold: k === n });
    cv.text('(' + fmtN(p[0]) + ', ' + fmtN(p[1]) + ')', x + 50, y, { size: 15, bold: k === n });
    cv.text(A.num(ang, 1) + '°', x + 190, y, { size: 15 });
    if (k) cv.text(A.num(Math.hypot(...p) / Math.hypot(...S[k - 1]), 3) + ' 倍', x + 260, y, { size: 15, color: 'b' });
  }
  cv.text('「長さ」は前の行の矢印の何倍か', x, 410, { size: 14, color: 'sub' });
}

function drawTenki(cv, st) {
  const n = Math.floor(st.n), S1 = seq(WM, [1, 0], 10), S2 = seq(WM, [0, 1], 10);
  const g = cv.view({ x0: 0, x1: 10.5, y0: 0, y1: 1.1, box: [60, 30, 460, 360] });
  g.axes({ xt: A.range(0, 10, 1), yt: [0.2, 0.4, 0.6, 0.8, 1], xl: 'n（日後）', yl: '晴れる確率', yfmt: v => A.num(v, 1) });
  g.line([[0, 2 / 3], [10.5, 2 / 3]], { color: 'sub', style: 'dash', width: 1.5 });
  g.text('2/3 ＝ 0.667', 8.6, 2 / 3 + 0.05, { size: 14, color: 'sub' });
  const show = (S, col, sh, sty, lab) => {
    const pts = S.slice(0, Math.min(n, 10) + 1).map((p, k) => [k, p[0]]);
    g.line(pts, { color: col, width: 2.5, style: sty }); pts.forEach(p => g.dot(p[0], p[1], { color: col, r: 5, shape: sh }));
    if (pts.length) g.text(lab, 0.35, S[0][0] + (S[0][0] > 0.5 ? -0.04 : 0.05), { size: 14, color: col, bold: true });
  };
  if (st.who !== 'r') show(S1, 'b', 'circle', 'solid', '今日が晴れ');
  if (st.who !== 's') show(S2, 'a', 'square', 'dash', '今日が雨');
  // 右：行列と、落ち着く先
  const x = 560;
  cv.text('M ＝', x, 70, { size: 17 });
  const m = [['0.8', '0.4'], ['0.2', '0.6']];
  m.forEach((r, i) => r.forEach((c, j) => cv.text(c, x + 66 + j * 56, 56 + i * 30, { size: 17, align: 'center', color: j ? 'a' : 'b' })));
  cv.line([[x + 46, 38], [x + 40, 38], [x + 40, 102], [x + 46, 102]], { color: 'ink', width: 1.5 }); cv.line([[x + 136, 38], [x + 142, 38], [x + 142, 102], [x + 136, 102]], { color: 'ink', width: 1.5 });
  cv.text('1列め：晴れの日から', x, 128, { size: 14, color: 'b' }); cv.text('2列め：雨の日から', x, 150, { size: 14, color: 'a' });
  cv.text('どの列も、たすと1', x, 172, { size: 14, color: 'sub' });
  cv.text(n + ' 日後に晴れる確率', x, 216, { size: 15 });
  if (st.who !== 'r') cv.text('今日が晴れ：' + A.num(S1[Math.min(n, 10)][0], 3), x, 244, { size: 16, color: 'b', bold: true });
  if (st.who !== 's') cv.text('今日が雨　：' + A.num(S2[Math.min(n, 10)][0], 3), x, 270, { size: 16, color: 'a', bold: true });
  cv.text('M (2/3, 1/3) ＝ (2/3, 1/3)', x, 320, { size: 15 });
  cv.text('固有値1の固有ベクトルに落ち着く', x, 344, { size: 15, bold: true });
}

function drawPage(cv, st) {
  const n = Math.floor(st.n), S = seq(PM, [1 / 3, 1 / 3, 1 / 3], 12), cur = S[Math.min(n, 12)];
  // 左：3つのページとリンク
  const P = { A: [90, 120], B: [290, 120], C: [190, 300] };
  const link = (a, b, bend) => { const p = P[a], q = P[b]; const mx = (p[0] + q[0]) / 2 + bend[0], my = (p[1] + q[1]) / 2 + bend[1]; const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push([(1 - t) * (1 - t) * p[0] + 2 * t * (1 - t) * mx + t * t * q[0], (1 - t) * (1 - t) * p[1] + 2 * t * (1 - t) * my + t * t * q[1]]); } const cut = pts.filter(z => Math.hypot(z[0] - p[0], z[1] - p[1]) > 42 && Math.hypot(z[0] - q[0], z[1] - q[1]) > 42); cv.line(cut, { color: 'ink', width: 2 }); const e = cut[cut.length - 1], e2 = cut[cut.length - 3]; cv.arrow(e2[0], e2[1], e[0], e[1], { color: 'ink', width: 2, head: 12 }); };
  link('A', 'B', [0, -20]); link('A', 'C', [-10, 10]); link('B', 'C', [10, 10]); link('C', 'A', [-70, 20]);
  const sty = { A: ['b', 'circle', 'solid'], B: ['c', 'square', 'dash'], C: ['a', 'diamond', 'dot'] };
  ['A', 'B', 'C'].forEach((k, i) => {
    const r = 18 + 70 * Math.sqrt(cur[i]) * 0.9;
    cv.circle(P[k][0], P[k][1], 38, { color: sty[k][0], width: 2.5, style: sty[k][2] });
    cv.circle(P[k][0], P[k][1], Math.min(36, r * 0.55), { fill: sty[k][0], alpha: 0.35 });
    cv.text(k, P[k][0], P[k][1] - 4, { size: 22, bold: true, align: 'center' });
    cv.text(A.num(cur[i], 3), P[k][0], P[k][1] + 18, { size: 14, align: 'center' });
  });
  cv.text('A → B・C へ半分ずつ、B → C、C → A', 20, 410, { size: 14, color: 'sub' });
  // 右：グラフ
  const g = cv.view({ x0: 0, x1: 12.6, y0: 0, y1: 0.6, box: [440, 30, 420, 360] });
  g.axes({ xt: [2, 4, 6, 8, 10, 12], yt: [0.2, 0.4], xl: 'かけた回数 n', yl: '確率', yfmt: v => A.num(v, 1) });
  g.line([[0, 0.4], [12.6, 0.4]], { color: 'sub', style: 'dot', width: 1.2 }); g.line([[0, 0.2], [12.6, 0.2]], { color: 'sub', style: 'dot', width: 1.2 });
  ['A', 'B', 'C'].forEach((k, i) => {
    const pts = S.slice(0, Math.min(n, 12) + 1).map((p, j) => [j, p[i]]);
    g.line(pts, { color: sty[k][0], width: 2.2, style: sty[k][2] }); pts.forEach(p => g.dot(p[0], p[1], { color: sty[k][0], r: 4.5, shape: sty[k][1] }));
  });
}

A.item({
  id: 'm4-05', title: 'くり返しかけると、そろってくる',
  from: '数学 第7巻 7-8④「べき乗法」・7-10②「天気の行列」・7-11⑨「ページランク」の図から（9-11 でも使う）',
  W: 880, H: 440,
  state: { n: 0, a0: 0, who: 'b' },
  scenes: [
    {
      key: 'beki', label: '① 1回ずつかける',
      lead: '矢印 $(1,\\ 0)$ に、主役の行列 $A$ を1回ずつかけます。左の図は、長さを1にそろえて向きだけをかいたものです。',
      note: 'かけるたびに、向きは $45°$（固有ベクトル $(1,\\ 1)$ の向き）に近づき、長さは毎回ほぼ3倍（大きいほうの固有値）になります。$(1,\\ 0)=\\frac{1}{2}(1,\\ 1)+\\frac{1}{2}(1,\\ -1)$ のうち、3倍される部分がどんどん大きくなり、1倍の部分は小さいまま残るからです。これを**べき乗法**といいます。',
      miss: 'はじめの矢印をちょうど $-45°$（$(1,\\ -1)$ の向き）にすると、何回かけても向きは変わりません（固有値1の固有ベクトル）。でも、ほんの少しでもずれていれば、やがて $45°$ にそろいます。',
      legend: [['いまの矢印の向き', { color: 'b' }], ['前の回の向き', { color: 'a' }], ['$45°$（固有値3）', { color: 'd', style: 'dash' }], ['$-45°$（固有値1）', { color: 'd', style: 'dot' }]],
      controls: [{ button: '$A$ を1回かける', act: st => { st.n = Math.min(8, Math.floor(st.n) + 1); } }, { range: 'a0', label: 'はじめの向き', min: -180, max: 180, step: 1, fmt: v => Math.round(v) + '°', on: st => { st.n = 0; } }],
      step(st, dt) { st.n = Math.min(8, st.n + dt * 0.8); if (st.n >= 8) return false; },
      draw: drawBeki,
      readout: st => { const S = seq(AM, [Math.cos(st.a0 * DG), Math.sin(st.a0 * DG)], 8), k = Math.floor(st.n); return `${k} 回かけた矢印 $(${fmtN(S[k][0])},\\ ${fmtN(S[k][1])})$、向き ${A.num(Math.atan2(S[k][1], S[k][0]) / DG, 1)}°`; }
    },
    {
      key: 'tenki', label: '② 天気の行列',
      lead: '晴れ・雨の移り方の行列 $M$ を、今日の天気に何回もかけます。▶ で1日ずつ進めましょう。',
      note: '今日が晴れでも雨でも、何日かたつと、晴れる確率は同じ $\\frac{2}{3}=0.667$ に落ち着きます。落ち着く先 $(\\frac{2}{3},\\ \\frac{1}{3})$ は、$M$ をかけても変わらない組、つまり**固有値1の固有ベクトル**です。もう1つの固有値0.4の部分は、1日ごとに0.4倍で消えていきます。',
      miss: '1**行め**に「晴れの日からの移り方」(0.8, 0.2) を書くのはまちがいです。1**列め**に書きます。各列の和が1です。',
      state: { n: 0, who: 'b' },
      legend: [['今日が晴れ', { color: 'b', shape: 'circle' }], ['今日が雨', { color: 'a', shape: 'square', style: 'dash' }], ['$\\frac{2}{3}$', { color: 'sub', style: 'dash' }]],
      controls: [{ seg: 'who', label: '今日の天気', options: [['b', '両方'], ['s', '晴れ'], ['r', '雨']] }],
      step(st, dt) { st.n = Math.min(10, st.n + dt * 1.2); if (st.n >= 10) return false; },
      draw: drawTenki,
      readout: st => { const n = Math.floor(st.n), a = seq(WM, [1, 0], 10)[n]; return `今日が晴れのとき、${n} 日後：晴れ ${A.num(a[0], 3)}、雨 ${A.num(a[1], 3)}（たすと1）`; }
    },
    {
      key: 'page', label: '③ ページランク',
      lead: '3つのページ A・B・C を、リンクをたどって移る人がいます。いる確率の組に、移り方の行列を何回もかけます。',
      note: 'はじめ3つに $\\frac{1}{3}$ ずついても、ゆれながら $(0.4,\\ 0.2,\\ 0.4)$ に落ち着きます。この組は、移り方の行列をかけても変わらない**固有値1の固有ベクトル**です。A と C が同じくらい大事で、B はその半分、という順位になります。ゆれるのは、ほかの固有値が複素数（大きさ約0.71）で、回りながら消えていくからです。',
      state: { n: 0 },
      legend: [['A', { color: 'b', shape: 'circle' }], ['B', { color: 'c', shape: 'square', style: 'dash' }], ['C', { color: 'a', shape: 'diamond', style: 'dot' }]],
      step(st, dt) { st.n = Math.min(12, st.n + dt * 1.2); if (st.n >= 12) return false; },
      draw: drawPage,
      readout: st => { const n = Math.floor(st.n), p = seq(PM, [1 / 3, 1 / 3, 1 / 3], 12)[n]; return `${n} 回かけた：A ${A.num(p[0], 3)}、B ${A.num(p[1], 3)}、C ${A.num(p[2], 3)}`; }
    }
  ]
});
