// @id p1-10
// @title 転がる車輪：サイクロイドと斜面の競争
// @vol 物理1
// @from 物理 力-7 ①⑤（p1-07 のサイクロイドの図・転がる車輪の点の速さ・例題2「斜面の転がり競争」）、まちがえやすいところ
'use strict';
// 速度の矢印は破線、加速度は点線。点の形（●■▲◆）でも分ける。
A.item({
  id: 'p1-10', title: '転がる車輪：サイクロイドと斜面の競争',
  from: '物理 第1巻『力学』 力-7 ① の図（サイクロイド・転がる車輪の点の速さ）、⑤ と例題2（斜面の転がり競争）から（数学 媒介変数、力-6 でも使う）',
  W: 880, H: 440,
  state: { phi: 0, v: 5, mode: 'all', th: 30, t: 0 },
  scenes: [
    {
      key: 'cycloid', label: '① ふちの点の道すじ',
      lead: '自転車の車輪（半径 0.33 m）がすべらずに転がります。ふちの1つの点（●）がえがく線と、いろいろな点の速度を見ましょう。',
      note: '転がる＝**進む（並進）＋回る（回転）**。すべらないとき、回る速さ $r\\omega$ は進む速さ $v$ と同じです（$v=r\\omega$）。いちばん上の点は $v+r\\omega=2v$、地面にふれた点は $v-r\\omega=0$ で、その瞬間止まっています。ふちの点は、地面にふれるたびに止まり、サイクロイドをえがきます。',
      miss: '「車輪のどの点も自転車と同じ速さ $v$ で進んでいる」はまちがい。いちばん上は $2v$、中心は $v$、地面にふれた点は 0 です。',
      legend: [['ふちの点の道すじ（サイクロイド）', { color: 'b' }], ['速度（破線の矢印）', { color: 'a', style: 'dash' }], ['ふちの点', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ seg: 'mode', label: '速度の分け方', options: [['shin', '並進 $v$'], ['kai', '回転 $r\\omega$'], ['all', '合わせる']] }, { range: 'v', label: '自転車の速さ $v$〔m/s〕', min: 1, max: 10, step: 0.5, d: 1 }],
      init(st) { st.phi = 0; },
      step(st, dt) { st.phi += dt * 1.6; if (st.phi > 4 * Math.PI) st.phi = 0; },
      draw: drawCycloid,
      readout: st => { const w = st.v / 0.33, s = Math.abs(2 * st.v * Math.sin(st.phi / 2)); return `$\\omega=v/r$ ＝ ${A.num(st.v, 1)} ÷ 0.33 ＝ ${A.num(w, 1)} rad/s（毎分 ${A.num(w * 60 / 2 / Math.PI, 0)} 回転）　　いちばん上 ${A.num(2 * st.v, 1)} m/s　　●の点の速さ <b>${A.num(s, 2)} m/s</b>`; }
    },
    {
      key: 'kyousou', label: '② 斜面の転がり競争',
      lead: '長さ 2.0 m の斜面の上から、球・円柱・輪（うすいパイプ）と、すべる物（摩擦なし）を同時に放します。どれが先に着くでしょう。',
      note: '加速度は $a=\\dfrac{g\\sin\\theta}{1+I/(mr^2)}$。$I/(mr^2)$ は球 0.4、円柱 0.5、輪 1 で、質量が外側に多いほど回すのにエネルギーをとられて、ゆっくり転がります。大きさや重さにはよりません。30° の斜面では、球 1.07 s、円柱 1.11 s、輪 1.28 s（下での速さ 3.74・3.61・3.13 m/s）。',
      miss: 'すべらずに転がるとき、斜面の摩擦力は仕事をしません（ふれた点はその瞬間止まっている）。エネルギーを熱にしているのではなく、回転のエネルギーに分けているだけです。',
      legend: [['すべる物（摩擦なし）', { color: 'sub', shape: 'square', noline: true }], ['球 $\\frac{2}{5}mr^2$', { color: 'a', shape: 'circle', noline: true }], ['円柱 $\\frac{1}{2}mr^2$', { color: 'c', shape: 'diamond', noline: true }], ['輪 $mr^2$', { color: 'b', shape: 'tri', noline: true }]],
      controls: [{ range: 'th', label: '斜面の角 $\\theta$', min: 10, max: 40, step: 1, fmt: v => v + '°', on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; const T = race(st.th)[3].T; if (st.t > T + 0.4) { st.t = T + 0.4; return false; } },
      draw: drawRace,
      readout: st => race(st.th).map(o => `${o.n} ${A.num(o.T, 2)} s・${A.num(o.vb, 2)} m/s`).join('　') + `　（$t$ ＝ ${A.num(st.t, 2)} s）`
    }
  ]
});

function drawCycloid(cv, st) {
  const R = 0.33, V = cv.view({ x0: -0.25, x1: 4.6, y0: -0.25, y1: 1.35, box: [10, 20, 860, 400], equal: true });
  V.line([[-0.25, 0], [4.6, 0]], { color: 'ink', width: 2 });
  const xc = R * st.phi;   // 中心が進んだ距離（1回転で 2πr）
  V.param(p => R * (p - Math.sin(p)), p => R * (1 - Math.cos(p)), 0, st.phi, { color: 'b', width: 2.5 });
  V.param(p => R * (p - Math.sin(p)), p => R * (1 - Math.cos(p)), st.phi, 4 * Math.PI, { color: 'b', width: 1, alpha: 0.25 });
  for (const k of [0, 1, 2]) V.text('止まる', 2 * Math.PI * R * k, -0.12, { size: 14, color: 'sub', align: 'center' });
  // 車輪とスポーク
  V.circle(xc, R, R, { color: 'ink', width: 3 });
  for (let k = 0; k < 4; k++) { const a = -st.phi + Math.PI * k / 2; V.line([[xc, R], [xc + R * Math.cos(a), R + R * Math.sin(a)]], { color: 'sub', width: 1 }); }
  V.dot(xc, R, { color: 'ink', r: 4 });
  // 速度の矢印（1 m/s を 0.045 の長さで）。並進＋回転（右回り）
  const sc = 0.045 * 5 / st.v * Math.min(1.2, st.v / 5 + 0.2);
  const k = 0.045, pts = [[0, R], [R, 0], [0, -R], [-R, 0], [0, 0]];
  for (const [dx, dy] of pts) {
    const px = xc + dx, py = R + dy;
    const tv = [st.v, 0], rv = [st.v / R * dy, -st.v / R * dx];   // 右回り：(x,y)→(y,−x)×ω
    const vv = st.mode === 'shin' ? tv : st.mode === 'kai' ? rv : [tv[0] + rv[0], tv[1] + rv[1]];
    if (Math.hypot(vv[0], vv[1]) > 0.05) V.arrow(px, py, px + vv[0] * k, py + vv[1] * k, { color: 'a', style: 'dash', width: 3 });
    else V.dot(px, py, { color: 'a', r: 5, shape: 'square' });
  }
  void sc;
  if (st.mode === 'all') { V.text('2v', xc + 2 * st.v * k + 0.05, 2 * R + 0.03, { size: 16, color: 'a', bold: true, math: true, italic: true }); V.text('接地点 0', xc - 0.05, -0.12, { size: 14, color: 'a', align: 'right' }); }
  // ふちの点（●）と、その速度
  const p = st.phi, bx = R * (p - Math.sin(p)), by = R * (1 - Math.cos(p));
  const bv = [st.v * (1 - Math.cos(p)), st.v * Math.sin(p)];
  if (Math.hypot(...bv) > 0.05) V.arrow(bx, by, bx + bv[0] * k, by + bv[1] * k, { color: 'b', style: 'dash', width: 2.5 });
  V.dot(bx, by, { color: 'b', r: 7 });
  cv.text(st.mode === 'shin' ? '並進：どの点も右へ v' : st.mode === 'kai' ? '回転：中心のまわりに rω（= v）' : '合わせると：上は 2v、地面にふれた点は 0', 440, 30, { size: 16, bold: true, align: 'center', bg: true });
}

function race(th) {
  const g = 9.8, s = Math.sin(th * Math.PI / 180), l = 2.0;
  return [['すべる物', 0, 'sub', 'square'], ['球', 0.4, 'a', 'circle'], ['円柱', 0.5, 'c', 'diamond'], ['輪', 1, 'b', 'tri']].map(([n, k, col, sh]) => {
    const a = g * s / (1 + k), T = Math.sqrt(2 * l / a);
    return { n, k, col, sh, a, T, vb: a * T };
  });
}
function drawRace(cv, st) {
  const th = st.th * Math.PI / 180, l = 2.0, objs = race(st.th), D = 0.27;   // 4つのレーンを D ずつ上にずらしてかく
  const V = cv.view({ x0: -0.35, x1: 2.05, y0: -0.12, y1: l * Math.sin(th) + 3 * D + 0.25, box: [10, 10, 580, 410], equal: true });
  V.line([[-0.35, 0], [2.05, 0]], { color: 'ink', width: 2 });
  V.poly([[0, l * Math.sin(th)], [l * Math.cos(th), 0], [0, 0]], { fill: 'grid', alpha: 1 });
  const r = 0.06, n = [Math.sin(th), Math.cos(th)];   // 斜面の外向きの法線
  objs.forEach((o, i) => {
    const top = [0, l * Math.sin(th) + i * D], bot = [l * Math.cos(th), i * D];
    V.line([top, bot, [bot[0] + 0.25, bot[1]]], { color: o.col, width: 2.5 });
    V.text(o.n, top[0] - 0.04, top[1] + 0.02, { size: 15, color: o.col, align: 'right', bold: true });
    const s = Math.min(l, 0.5 * o.a * st.t * st.t);
    const X = top[0] + s * Math.cos(th) + n[0] * r, Y = top[1] - s * Math.sin(th) + n[1] * r;
    if (o.k === 0) V.poly([[-r, -r], [r, -r], [r, r], [-r, r]].map(([dx, dy]) => [X + dx * Math.cos(th) + dy * Math.sin(th), Y - dx * Math.sin(th) + dy * Math.cos(th)]), { fill: o.col, alpha: 0.5, color: o.col, width: 2 });
    else {
      V.circle(X, Y, r, { fill: o.col, alpha: o.k === 1 ? 0.08 : 0.4, color: o.col, width: o.k === 1 ? 4 : 2 });
      const ang = -s / r - Math.PI / 2;   // 転がった角（印の線）
      V.line([[X, Y], [X + r * Math.cos(ang), Y + r * Math.sin(ang)]], { color: 'ink', width: 2 });
      V.dot(X, Y, { color: o.col, r: 4, shape: o.sh });
    }
    if (st.t >= o.T) V.text(A.num(o.T, 2) + ' s', bot[0] + 0.27, bot[1] + 0.02, { size: 14, color: o.col });
  });
  V.text('θ = ' + st.th + '°', l * Math.cos(th) - 0.42, 0.05, { size: 15 });
  V.text('どのレーンも長さ 2.0 m', 0.9, -0.08, { size: 14, color: 'sub', align: 'center' });
  // 右：進んだ距離のグラフと、着いた順
  const g = cv.view({ x0: 0, x1: Math.max(1.5, objs[3].T * 1.1), y0: 0, y1: 2.2, box: [620, 30, 230, 300] });
  g.axes({ xt: A.range(0.5, Math.floor(objs[3].T * 1.1 * 2) / 2, 0.5), yt: [1, 2], xl: 't〔s〕', yl: '進んだ距離〔m〕' });
  objs.forEach(o => { g.plot(t => Math.min(2, 0.5 * o.a * t * t), { x0: 0, x1: Math.min(st.t, o.T), color: o.col, width: 2.5, style: o.k === 0 ? 'dot' : o.k === 0.4 ? 'solid' : o.k === 0.5 ? 'dashdot' : 'dash' }); g.dot(Math.min(st.t, o.T), Math.min(2, 0.5 * o.a * st.t * st.t), { color: o.col, r: 5, shape: o.sh }); });
  const fin = objs.filter(o => st.t >= o.T).map(o => o.n);
  cv.text(fin.length ? '着いた順：' + fin.join(' → ') : '', 620, 380, { size: 15, bold: true });
}
