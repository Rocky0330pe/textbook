// @id p1-13
// @title 回る台の上から見る：遠心力とコリオリの力
// @vol 物理1
// @from 物理 力-7 ⑧（p1-07 の回転台の図・回る座標の運動方程式）、力-1 ⑥ 相対速度、まちがえやすいところ「遠心力の正体」
'use strict';
// 左は地面から、右は台といっしょに回りながら見た同じ玉。本物の力は実線、見かけの力（遠心力・コリオリの力）は長い破線、速度は破線。
// 台から見た位置は、地面の位置を −ωt 回したもの（回転行列）。
A.item({
  id: 'p1-13', title: '回る台の上から見る：遠心力とコリオリの力',
  from: '物理 第1巻『力学』 力-7 ⑧ の図（回転台の上で玉をすべらせる）と回る座標の運動方程式、力-1 ⑥ 相対速度から（力-2 ⑥、熱〔台風〕でも使う）',
  W: 880, H: 440,
  state: { t: 0, w: 90, rel: false, cut: false, tc: 0 },
  scenes: [
    {
      key: 'suberu', label: '① 中心から玉をすべらせる',
      lead: '左回りの回転台の中心から、なめらかな（摩擦のない）台の上で、玉を外へすべらせます。同じ玉を、地面から（左）と台の上から（右）見ます。',
      note: '地面から見ると、玉には横向きの力がはたらかないので、**まっすぐ**進みます。その間に台が左へ回るので、台の上の人から見ると、玉は**右へ曲がって**いきます。台の上の人はこれを、進む向きの右へ押す力（コリオリの力 $2m\\omega v\'$）と、外向きの力（遠心力 $mr\\omega^2$）で説明します。$\\omega=0$ にすると、2つの見え方は同じになります。',
      miss: 'コリオリの力も遠心力も、回る台の上から見るときだけ加える**見かけの力**です。地面から見ると、玉を横へ押す物は何もありません。',
      legend: [['玉の道すじ', { color: 'b' }], ['速度（破線）', { color: 'a', style: 'dash' }], ['遠心力（見かけの力）', { color: 'd', style: 'long' }], ['コリオリの力（見かけの力）', { color: 'e', style: 'long' }]],
      controls: [{ range: 'w', label: 'ふちに着くまでに台が回る角', min: 0, max: 180, step: 5, fmt: v => v + '°', on: st => { st.t = 0; } }, { check: 'rel', label: '相対速度', text: '台から見た速度を分けて見る（$\\vec v\'=\\vec v-\\vec\\omega\\times\\vec r$）' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.25; if (st.t >= 1) { st.t = 1; return false; } },
      draw: drawSuberu,
      readout: st => { const w = st.w * Math.PI / 180; return `$\\omega$ ＝ ${A.num(w, 2)}（台の半径を1、玉の速さを1とした単位）　　台が回った角 ${A.num(st.w * st.t, 0)}°　　玉の中心からの距離 ${A.num(st.t, 2)}`; }
    },
    {
      key: 'himo', label: '② ひもでつないだ玉',
      lead: '台の中心とひもでつないだ玉が、台といっしょに回っています。▶ のあと「ひもを切る」を押すと？',
      note: '地面から見ると、玉は円運動をしていて、ひもの張力が中心向きの力（向心力 $mr\\omega^2$）です。台から見ると、玉は止まっていて、張力と、外向きの**遠心力** $mr\\omega^2$ がつり合っている、と説明します。ひもを切ると、地面から見た玉は、その瞬間の速度の向き（接線の向き）に**まっすぐ**進みます。台から見ると、外へ出ていきながら、右へ曲がっていきます。',
      miss: '「遠心力は、回る物を外へ引っぱる本当の力」はまちがい。地面から見ると、外へ引く力はありません。中心向きの力がなくなると、玉はまっすぐ進もうとして、外へ出ていくのです。',
      legend: [['張力（本物の力・実線）', { color: 'b' }], ['遠心力（見かけの力）', { color: 'd', style: 'long' }], ['速度（破線）', { color: 'a', style: 'dash' }], ['ひもを切ったあとの道すじ', { color: 'c' }]],
      controls: [{ button: 'ひもを切る', act: st => { if (!st.cut) { st.cut = true; st.tc = st.t; } } }],
      init(st) { st.t = 0; st.cut = false; st.tc = 0; },
      step(st, dt) { st.t += dt * 0.5; if (st.cut && st.t - st.tc > 2.2) return false; },
      draw: drawHimo,
      readout: st => st.cut ? `ひもを切った。地面から：まっすぐ　台から：外へ出ながら右へ曲がる` : `半径 0.5 で台といっしょに回っている（地面から：円運動、台から：止まっている）`
    }
  ]
});

function rot(p, a) { return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)]; }
function table(v, ang, lab) {
  v.circle(0, 0, 1, { fill: 'c', alpha: 0.08, color: 'c', width: 2 });
  for (let k = 0; k < 4; k++) { const p = rot([1, 0], ang + Math.PI / 2 * k); v.line([[0, 0], p], { color: 'c', width: 1, style: 'dot' }); }
  const m = rot([0.88, 0], ang); v.dot(m[0], m[1], { color: 'c', r: 5, shape: 'tri' });   // 台の目じるし
  v.dot(0, 0, { color: 'ink', r: 3 });
  v.text(lab, 0, 1.18, { size: 16, bold: true, align: 'center' });
}
function arc(v, a0) { const pts = []; for (let k = 0; k <= 14; k++) { const a = a0 + 0.6 * k / 14; pts.push([1.1 * Math.cos(a), 1.1 * Math.sin(a)]); } v.line(pts, { color: 'ink', width: 1.5 }); v.arrow(pts[12][0], pts[12][1], pts[14][0], pts[14][1], { color: 'ink', width: 1.5, head: 9 }); v.text('ω', pts[7][0] * 1.12, pts[7][1] * 1.12, { size: 15, italic: true, math: true }); }
function drawSuberu(cv, st) {
  const w = st.w * Math.PI / 180, t = st.t;   // 玉は地面から見て x 軸にそって速さ1で進む
  const L = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [10, 10, 420, 420], equal: true });
  const R = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [450, 10, 420, 420], equal: true });
  table(L, w * t, '地面から見る'); table(R, 0, '台の上から見る'); arc(L, w * t + 0.4);
  // 道すじと 0.25 ごとの位置
  L.line([[0, 0], [t, 0]], { color: 'b', width: 2.5 });
  const pr = s => rot([s, 0], -w * s);
  const path = []; for (let k = 0; k <= 60; k++) path.push(pr(t * k / 60)); R.line(path, { color: 'b', width: 2.5 });
  for (const s of [0.25, 0.5, 0.75, 1]) if (s <= t + 1e-9) { L.dot(s, 0, { color: 'b', r: 4 }); const q = pr(s); R.dot(q[0], q[1], { color: 'b', r: 4 }); }
  // いまの玉と矢印
  const k = 0.35;
  L.arrow(t, 0, t + k, 0, { color: 'a', style: 'dash', width: 3 });
  L.dot(t, 0, { color: 'b', r: 8 });
  const P = pr(t), vg = rot([1, 0], -w * t), wr = rot([0, w * t], -w * t);   // 地面の速度を台の向きに直したもの、台の速度 ω×r
  const vp = [vg[0] - wr[0], vg[1] - wr[1]];
  if (st.rel) {
    R.arrow(P[0], P[1], P[0] + vg[0] * k, P[1] + vg[1] * k, { color: 'a', style: 'dash', width: 2, alpha: 0.6 });
    R.arrow(P[0] + vg[0] * k, P[1] + vg[1] * k, P[0] + vp[0] * k, P[1] + vp[1] * k, { color: 'sub', style: 'dot', width: 2 });
    R.text('v', P[0] + vg[0] * k + 0.04, P[1] + vg[1] * k + 0.05, { size: 15, color: 'a', italic: true, math: true });
    R.text('−ω×r', P[0] + (vg[0] + vp[0]) * k / 2 + 0.05, P[1] + (vg[1] + vp[1]) * k / 2 - 0.06, { size: 14, color: 'sub' });
  }
  if (Math.hypot(...vp) > 0.01) R.arrow(P[0], P[1], P[0] + vp[0] * k, P[1] + vp[1] * k, { color: 'a', style: 'dash', width: 3 });
  // 見かけの力：遠心力 ω²r（外向き）、コリオリの力 −2ω×v'（左回りなら、進む向きの右）
  const fk = 0.25, cen = [P[0] * w * w, P[1] * w * w], cor = [2 * w * vp[1], -2 * w * vp[0]];
  if (Math.hypot(...cen) * fk > 0.02) R.arrow(P[0], P[1], P[0] + cen[0] * fk, P[1] + cen[1] * fk, { color: 'd', style: 'long', width: 3 });
  if (Math.hypot(...cor) * fk > 0.02) { R.arrow(P[0], P[1], P[0] + cor[0] * fk, P[1] + cor[1] * fk, { color: 'e', style: 'long', width: 3 }); R.text('コリオリ', P[0] + cor[0] * fk + 0.03, P[1] + cor[1] * fk - 0.06, { size: 14, color: 'e', bg: true }); }
  if (Math.hypot(...cen) * fk > 0.08) R.text('遠心力', P[0] + cen[0] * fk + 0.03, P[1] + cen[1] * fk + 0.06, { size: 14, color: 'd', bg: true });
  R.dot(P[0], P[1], { color: 'b', r: 8 });
  L.text('力なし：まっすぐ', 0.5, -0.2, { size: 14, color: 'sub', align: 'center' });
}
function drawHimo(cv, st) {
  const w = 1.6, r0 = 0.5, t = st.t;   // 台の角速度（台の時間の単位で）
  const L = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [10, 10, 420, 420], equal: true });
  const R = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [450, 10, 420, 420], equal: true });
  table(L, w * t, '地面から見る'); table(R, 0, '台の上から見る'); arc(L, w * t + 0.4);
  // 地面から見た玉の位置
  const gp = s => { if (!st.cut || s <= st.tc) return rot([r0, 0], w * s); const p0 = rot([r0, 0], w * st.tc), v0 = rot([0, r0 * w], w * st.tc), d = s - st.tc; return [p0[0] + v0[0] * d, p0[1] + v0[1] * d]; };
  const tp = s => rot(gp(s), -w * s);   // 台から見た位置
  const G = gp(t), T = tp(t), k = 0.3, fk = 0.22;
  L.circle(0, 0, r0, { color: 'sub', style: 'dot', width: 1 });
  if (st.cut) {
    const pg = [], pt = []; for (let i = 0; i <= 60; i++) { const s = st.tc + (t - st.tc) * i / 60; pg.push(gp(s)); pt.push(tp(s)); }
    L.clip(() => L.line(pg, { color: 'c', width: 2.5 })); R.clip(() => R.line(pt, { color: 'c', width: 2.5 }));
  } else {
    L.line([[0, 0], G], { color: 'ink', width: 1.5 }); R.line([[0, 0], T], { color: 'ink', width: 1.5 });
    // 張力（中心向き mrω²）
    L.arrow(G[0], G[1], G[0] - G[0] / r0 * r0 * w * w * fk, G[1] - G[1] / r0 * r0 * w * w * fk, { color: 'b', width: 3.5 });
    R.arrow(T[0], T[1], T[0] - T[0] * w * w * fk, T[1] - T[1] * w * w * fk, { color: 'b', width: 3.5 });
    R.arrow(T[0], T[1], T[0] + T[0] * w * w * fk, T[1] + T[1] * w * w * fk, { color: 'd', style: 'long', width: 3.5 });
    R.text('遠心力', T[0] * (1 + w * w * fk) + 0.05, T[1] + 0.08, { size: 14, color: 'd', bg: true }); R.text('張力', T[0] * 0.55, T[1] + 0.09, { size: 14, color: 'b', bg: true });
    L.text('張力', G[0] * 0.55 + 0.05, G[1] * 0.55 + 0.08, { size: 14, color: 'b', bg: true });
    R.text('止まっている', T[0], T[1] - 0.14, { size: 14, color: 'sub', align: 'center' });
  }
  // 速度
  const vg = st.cut && t > st.tc ? rot([0, r0 * w], w * st.tc) : rot([0, r0 * w], w * t);
  if (L.inside(L.X(G[0]), L.Y(G[1]))) { L.arrow(G[0], G[1], G[0] + vg[0] * k, G[1] + vg[1] * k, { color: 'a', style: 'dash', width: 3 }); L.dot(G[0], G[1], { color: 'b', r: 8 }); }
  if (R.inside(R.X(T[0]), R.Y(T[1]))) R.dot(T[0], T[1], { color: 'b', r: 8 });
}
