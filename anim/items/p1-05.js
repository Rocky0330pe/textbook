// @id p1-05
// @title ニュートンの大砲：落ち続ける人工衛星
// @vol 物理1
// @from 物理 力-2 ⑦（第1宇宙速度・ニュートンの図）、力-4（第2宇宙速度）、力-6 ⑩（ケプラーの第2法則）
'use strict';
// 長さは地球の半径 R、速さは √(gR)＝√(9.8×6.371×10⁶)≈7.9 km/s を1とする単位で計算する（GM＝gR²＝1）。
// 運動方程式 d²r/dt² ＝ −r/|r|³ を、ルンゲ・クッタ法（A.rk4）で細かい刻みで解く。
const VU = Math.sqrt(9.8 * 6.371e6) / 1000;   // 7.90 km/s
const TU = 6.371e6 / (VU * 1000) / 60;         // 時間の単位（分）≈ 13.4 分
const f = (t, y) => { const r3 = Math.pow(y[0] * y[0] + y[1] * y[1], 1.5); return [y[2], y[3], -y[0] / r3, -y[1] / r3]; };
A.item({
  id: 'p1-05', title: 'ニュートンの大砲：落ち続ける人工衛星',
  from: '物理 第1巻『力学』 力-2 ⑦ の図（高い山から水平に投げる）、力-4 の第2宇宙速度、力-6 ⑩ の図（ケプラーの第2法則）から（数学 4-15 でも使う）',
  W: 880, H: 440,
  state: { v: 6, h: 0.1, v1: 8.4 },
  scenes: [
    {
      key: 'taihou', label: '① 速さを上げる',
      lead: '高い山の上から、大砲の玉を水平に打ち出します。速さを上げて、何回か打ってみましょう（前の道すじは残ります）。',
      note: '速くするほど遠くへ落ち、ある速さで、**落ちながら地面と同じだけ曲がり**、地面に着かなくなります（円軌道）。もっと速いとだ円になり、さらに速いと地球にもどってきません。地面すれすれ（$r=R$）なら、円になる速さは $\\sqrt{gR}\\approx7.9$ km/s（第1宇宙速度）、もどってこない速さは $\\sqrt{2gR}\\approx11.2$ km/s（第2宇宙速度）。山の上は地球の中心から遠いので、少し小さくてすみます。',
      miss: '人工衛星は宇宙で止まって浮いているのではありません。横へ速く進みながら、地球へ**落ち続けて**います。力は、いつも地球の中心を向く万有引力だけです。',
      legend: [['玉の道すじ（前の道すじはうすく）', { color: 'a' }], ['速度（破線）', { color: 'a', style: 'dash' }], ['万有引力（実線）', { color: 'b' }]],
      controls: [{ range: 'v', label: '打ち出す速さ〔km/s〕', min: 3, max: 12, step: 0.1, d: 1, on: fire }, { seg: 'h', label: '打ち出す所', options: [[0.1, '高い山（$r=1.1R$）'], [0, '地面すれすれ（$r=R$）']], on: fire }, { button: 'もう一度打つ', act: st => fire(st) }],
      init(st) { st.old = []; fire(st); },
      step(st, dt) { return advance(st, dt * 0.9); },
      draw: drawTaihou,
      readout: st => { const r0 = 1 + st.h, vc = VU / Math.sqrt(r0), ve = VU * Math.sqrt(2 / r0); return `打ち出す速さ ${A.num(st.v, 1)} km/s　　この高さで円になる速さ ${A.num(vc, 1)}・もどらない速さ ${A.num(ve, 1)} km/s　　<b>${st.msg || ''}</b>　　${A.num(st.t * TU, 0)} 分`; }
    },
    {
      key: 'menseki', label: '② 同じ時間の扇形',
      lead: 'だ円の軌道を回る人工衛星。同じ時間ごとに、地球の中心と結んだ線が通りすぎる扇形をぬります。',
      note: '同じ時間に通りすぎる扇形の面積は、どれも等しくなります（ケプラーの第2法則、面積速度一定）。だから、地球に**近い所では速く、遠い所では遅く**動きます。近い点と遠い点では $r_1v_1=r_2v_2$。力がいつも中心を向くので、角運動量 $L=mrv$ が変わらないからです（力-6 ⑩）。',
      legend: [['人工衛星の道すじ', { color: 'a' }], ['同じ時間の扇形（色を交互に）', { color: 'e', shape: 'square', noline: true }], ['速度（破線）', { color: 'a', style: 'dash' }], ['万有引力（実線）', { color: 'b' }]],
      controls: [{ range: 'v1', label: '近い点の速さ〔km/s〕', min: 7.4, max: 8.9, step: 0.05, d: 2, on: st => kInit(st) }],
      init(st) { kInit(st); },
      step(st, dt) { kStep(st, dt); },
      draw: drawKepler,
      readout: st => { const k = st.K; return `近い点 $r_1$ ＝ ${A.num(k.r1, 2)}$R$、$v_1$ ＝ ${A.num(st.v1, 2)} km/s　　遠い点 $r_2$ ＝ ${A.num(k.r2, 2)}$R$、$v_2$ ＝ ${A.num(k.v2 * VU, 2)} km/s　　$r_1v_1$ ＝ ${A.num(k.r1 * st.v1, 2)}、$r_2v_2$ ＝ ${A.num(k.r2 * k.v2 * VU, 2)}`; }
    }
  ]
});

function fire(st) {
  if (st.path && st.path.length > 2) { st.old.push({ path: st.path, v: st.vfired }); if (st.old.length > 5) st.old.shift(); }
  const r0 = 1 + st.h + 1e-6, v = st.v / VU;
  st.y = [0, r0, v, 0]; st.t = 0; st.path = [[0, r0]]; st.ang = 0; st.done = false; st.msg = ''; st.vfired = st.v;
}
function advance(st, dt) {
  if (st.done) return false;
  const h = 0.002;
  for (let k = 0; k < Math.round(dt / h); k++) {
    const y0 = st.y; st.y = A.rk4(f, st.t, st.y, h); st.t += h;
    const r = Math.hypot(st.y[0], st.y[1]);
    st.ang += Math.abs(Math.atan2(y0[0] * st.y[1] - y0[1] * st.y[0], y0[0] * st.y[0] + y0[1] * st.y[1]));
    if (k % 5 === 0) st.path.push([st.y[0], st.y[1]]);
    if (r < 1) { const s = 1 / r; st.y = [st.y[0] * s, st.y[1] * s, 0, 0]; st.path.push([st.y[0], st.y[1]]); st.done = true; st.msg = '地面に落ちた（' + A.num(st.ang * 6371, 0) + ' km 先）'; return false; }
    if (r > 9) { st.done = true; st.msg = '遠くへ飛んでいく'; return false; }
    if (st.ang >= 2 * Math.PI) { st.path.push([st.y[0], st.y[1]]); st.done = true; const v = st.v / VU, r0 = 1 + st.h; st.msg = Math.abs(v * v * r0 - 1) < 0.02 ? '円をえがいて1周（地面に着かない）' : 'だ円をえがいて1周（地面に着かない）'; return false; }
  }
  const r = Math.hypot(st.y[0], st.y[1]), E = (st.y[2] ** 2 + st.y[3] ** 2) / 2 - 1 / r;
  st.msg = E >= 0 ? 'もどってこない（ぬけ出す）' : '飛んでいる';
}
function earth(V) {
  V.circle(0, 0, 1, { fill: 'a', alpha: 0.12, color: 'a', width: 1.5 });
  V.text('地球', 0, 0, { size: 16, align: 'center', color: 'a' });
}
function forceVel(V, y, sc) {
  const r = Math.hypot(y[0], y[1]);
  V.arrow(y[0], y[1], y[0] + y[2] * sc, y[1] + y[3] * sc, { color: 'a', style: 'dash', width: 3 });
  const g = 0.33 / (r * r);
  V.arrow(y[0], y[1], y[0] - y[0] / r * g, y[1] - y[1] / r * g, { color: 'b', width: 3.5 });
}
function drawTaihou(cv, st) {
  const V = cv.view({ x0: -2.3, x1: 2.3, y0: -2.05, y1: 1.6, box: [10, 10, 860, 420], equal: true });
  earth(V);
  // 山（本当の高さでかく）
  if (st.h > 0) V.poly([[-0.09, Math.sqrt(1 - 0.0081)], [0, 1 + st.h], [0.09, Math.sqrt(1 - 0.0081)]], { fill: 'c', alpha: 0.6, color: 'c', width: 1 });
  for (const o of st.old) { V.clip(() => V.line(o.path, { color: 'a', width: 1.5, alpha: 0.35 })); const e = o.path[o.path.length - 1]; if (Math.abs(e[0]) < 2.2 && Math.abs(e[1]) < 2) V.text(A.num(o.v, 1), e[0] + 0.05, e[1] + 0.07, { size: 14, color: 'sub' }); }
  V.clip(() => V.line(st.path, { color: 'a', width: 2.5 }));
  const y = st.y, r = Math.hypot(y[0], y[1]);
  if (r < 2.25 && !st.done) forceVel(V, y, 0.35);
  if (r < 2.25) V.dot(y[0], y[1], { color: 'ink', r: 6 });
  if (st.h > 0) V.text('山（高さ 0.1R ≈ 640 km）', -0.12, 1.17, { size: 14, color: 'sub', align: 'right' });
  if (st.h === 0) V.text('', 0, 0);
}

function kInit(st) {
  const r1 = 1.2, v1 = st.v1 / VU, E = v1 * v1 / 2 - 1 / r1, a = -1 / (2 * E), r2 = 2 * a - r1, T = 2 * Math.PI * Math.pow(a, 1.5);
  st.K = { r1, r2, a, T, v2: r1 * v1 / r2, n: 12 };
  st.y = [r1, 0, 0, v1]; st.t = 0; st.secs = [[[r1, 0]]];
}
function kStep(st, dt) {
  const K = st.K, h = 0.002, steps = Math.round(dt * 0.5 * K.T / 6 / h * 1.2);   // 1周を約 12 秒で
  for (let k = 0; k < steps; k++) {
    st.y = A.rk4(f, st.t, st.y, h); st.t += h;
    const idx = Math.floor(st.t / (K.T / K.n) + 1e-9);
    if (idx >= K.n) { st.t = 0; st.y = [K.r1, 0, 0, st.v1 / VU]; st.secs = [[[K.r1, 0]]]; return; }
    while (st.secs.length <= idx) st.secs.push([st.secs[st.secs.length - 1].slice(-1)[0]]);
    st.secs[idx].push([st.y[0], st.y[1]]);
  }
}
function area(pts) { let s = 0; for (let i = 0; i < pts.length - 1; i++) s += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]; return Math.abs(s) / 2; }
function drawKepler(cv, st) {
  const K = st.K, c = K.a - K.r1;   // 中心は (−c, 0)
  const V = cv.view({ x0: -K.r2 - 0.4, x1: K.r1 + 0.5, y0: -2.4, y1: 2.4, box: [10, 10, 860, 420], equal: true });
  st.secs.forEach((pts, i) => { if (pts.length < 2) return; V.poly([[0, 0], ...pts], { fill: i % 2 ? 'a' : 'e', alpha: 0.28 }); });
  const b = Math.sqrt(K.a * K.a - c * c);
  V.param(u => -c + K.a * Math.cos(u), u => b * Math.sin(u), 0, 2 * Math.PI, { color: 'a', width: 2 });
  earth(V);
  forceVel(V, st.y, 0.6);
  V.dot(st.y[0], st.y[1], { color: 'ink', r: 6 });
  V.text('近い点（速い）', K.r1 + 0.05, -0.25, { size: 15, align: 'right', bg: true });
  V.text('遠い点（遅い）', -K.r2, -0.25, { size: 15, bg: true });
  // 面積をくらべる（終わった扇形）
  const done = st.secs.slice(0, -1).map(area);
  if (done.length) cv.text('ぬった扇形の面積：' + done.map(a => A.num(a, 3)).join('・') + '（R² の単位）', 20, 425, { size: 14, color: 'sub' });
}
