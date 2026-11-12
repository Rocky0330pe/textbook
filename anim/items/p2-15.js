// @id p2-15
// @title 屈折と全反射：光ファイバまで
// @vol 物理3
// @from 物理 波-12 ③④（p3-12:338・350・414・466、例題5・6）
'use strict';
// 記号は本と同じ：屈折率 n₁・n₂、入射角 θ₁、屈折角 θ₂、臨界角 θ_c、受け入れ角 θ_a、開口数 NA
const D15 = Math.PI / 180;
const MAT = { water: [1.333, '水'], glass: [1.5, 'ガラス'], dia: [2.42, 'ダイヤモンド'] };
A.item({
  id: 'p2-15', title: '屈折と全反射：光ファイバまで',
  from: '物理 第3巻 波-12 ③「屈折の法則」・④「全反射と光ファイバ」の図から',
  W: 880, H: 420,
  state: { th: 30, dir: 'in', mat: 'water', ph: 0, h: 2, ta: 10, n2: 1.46, s: 0 },
  scenes: [
    {
      key: 'kussetsu', label: '① 屈折と全反射',
      lead: '光の出どころ（●）をドラッグして、入射角を変えてみましょう。「水から空気へ」に切りかえて、角を大きくしていくと……。',
      note: '$n_1\\sin\\theta_1=n_2\\sin\\theta_2$。遅い物（屈折率が大きい物）に入ると法線に近づき、速い物へ出ると法線から遠ざかります。屈折率の大きい物から出るとき、屈折角が先に 90° になる入射角が臨界角 $\\theta_{\\mathrm c}$（$\\sin\\theta_{\\mathrm c}=1/n$）で、それより大きいと全部はね返ります（全反射）。水は約 48.6°、ガラスは約 41.8°、ダイヤモンドは約 24.4°。',
      miss: '全反射は、屈折率の**大きい**物から**小さい**物へ出るとき（水から空気へ）だけ起きます。空気から水へは、どんな角でも入れます（屈折角は臨界角以下になる）。角は、どれも面ではなく**法線**からはかります。',
      legend: [['入ってくる光', { color: 'b', width: 3 }], ['屈折した光', { color: 'a', width: 3 }], ['反射した光（全反射は太く）', { color: 'd', style: 'dash' }], ['法線', { color: 'sub', style: 'dot' }]],
      controls: [
        { seg: 'dir', label: '光の向き', options: [['in', '空気から物へ'], ['out', '物から空気へ']] },
        { seg: 'mat', label: '物', options: [['water', '水 1.333'], ['glass', 'ガラス 1.5'], ['dia', 'ダイヤモンド 2.42']] },
        { range: 'th', label: '入射角 $\\theta_1$', min: 0, max: 89, step: 0.5, fmt: v => A.num(v, 1) + '°' }
      ],
      step(st, dt) { st.th += dt * 8; if (st.th >= 89) { st.th = 89; return false; } },
      init(st) { st.th = 10; },
      draw: drawKussetsu,
      drag: { hit(st, x, y) { return x < 470 ? 'S' : null; }, move(st, x, y) { const v = kView(st.__cv), p = v.inv(x, y); const up = st.dir === 'in'; const yy = up ? p[1] : -p[1]; if (yy <= 0.02) return; st.th = A.clamp(Math.round(Math.atan2(Math.max(0, -p[0]), yy) / D15 * 2) / 2, 0, 89); } },
      readout: st => { const n = MAT[st.mat][0], n1 = st.dir === 'in' ? 1 : n, n2 = st.dir === 'in' ? n : 1, s2 = n1 * Math.sin(st.th * D15) / n2; return `$n_1\\sin\\theta_1$ ＝ ${A.num(n1, 3)} × sin ${A.num(st.th, 1)}° ＝ ${A.num(n1 * Math.sin(st.th * D15), 3)}　→　` + (s2 > 1 ? '<b>全反射</b>（$\\sin\\theta_2$ が 1 をこえる）' : `$\\theta_2$ ＝ <b>${A.num(Math.asin(s2) / D15, 1)}°</b>`) + (st.dir === 'out' ? `　臨界角 ${A.num(Math.asin(1 / n) / D15, 1)}°` : ''); }
    },
    {
      key: 'mado', label: '② 水の中の点から',
      lead: '水の中の点から、いろいろな向きに光が出ます。▶ で、明るい1本が向きを変えていきます。',
      note: '臨界角より内側の光だけが空気へ出られます。だから、プールにもぐって見上げると、空は頭の上の**円い窓**の中にだけ見えます。窓の外側には、水の底が全反射で映ります。深さ 2 m なら、窓の半径は $2\\times\\tan 48.6°\\approx2.3$ m です。',
      legend: [['空気へ出る光', { color: 'a', width: 2 }], ['全反射する光', { color: 'd', width: 2, style: 'dash' }], ['臨界角の光', { color: 'b', width: 3 }]],
      controls: [
        { seg: 'mat', label: '物', options: [['water', '水 1.333'], ['glass', 'ガラス 1.5'], ['dia', 'ダイヤモンド 2.42']] },
        { range: 'h', label: '点の深さ〔m〕', min: 0.5, max: 3, step: 0.1, d: 1 }
      ],
      autoplay: true,
      step(st, dt) { st.ph += dt * 12; if (st.ph > 80) st.ph = -80; },
      draw: drawMado,
      readout: st => { const n = MAT[st.mat][0], tc = Math.asin(1 / n); return `臨界角 $\\theta_{\\mathrm c}$ ＝ ${A.num(tc / D15, 1)}°（$\\sin\\theta_{\\mathrm c}=1/${n}$）　窓の半径 ＝ ${A.num(st.h, 1)} × tan ${A.num(tc / D15, 1)}° ＝ <b>${A.num(st.h * Math.tan(tc), 2)} m</b>`; }
    },
    {
      key: 'fiber', label: '③ 光ファイバ',
      lead: 'コア（$n_1=1.48$）とクラッド（$n_2$）の光ファイバに、角 $\\theta_{\\mathrm a}$ で光を入れます。▶ で光が進みます。角を大きくすると……。',
      note: 'コアの中の光は、クラッドとの境で全反射を繰り返して進みます。$\\theta_{\\mathrm a}$ が大きすぎると、境での入射角が臨界角より小さくなり、光はクラッドへもれます。全反射が続くいちばん大きな角は $\\sin\\theta_{\\mathrm a}=\\sqrt{n_1^{2}-n_2^{2}}$（開口数 NA）。1.48 と 1.46 なら NA ≒ 0.24、受け入れ角は約 14° です（例題6）。',
      legend: [['コアの中の光', { color: 'a', width: 3 }], ['クラッドへもれる光', { color: 'b', style: 'dash' }], ['受け入れ角の範囲', { color: 'c', style: 'dot' }]],
      controls: [
        { range: 'ta', label: '入れる角 $\\theta_{\\mathrm a}$', min: 0, max: 40, step: 0.5, fmt: v => A.num(v, 1) + '°' },
        { range: 'n2', label: 'クラッド $n_2$', min: 1.40, max: 1.479, step: 0.001, d: 3 }
      ],
      autoplay: true,
      step(st, dt) { st.s += dt * 0.45; if (st.s > 1.2) st.s = 0; },
      draw: drawFiber,
      readout: st => { const n1 = 1.48, tc = Math.asin(st.n2 / n1), NA = Math.sqrt(n1 * n1 - st.n2 * st.n2), r = Math.asin(Math.sin(st.ta * D15) / n1), b = 90 - r / D15; return `境の臨界角 ${A.num(tc / D15, 1)}°、境での入射角 ${A.num(b, 1)}°　NA ＝ ${A.num(NA, 3)}、受け入れ角 ＝ ${A.num(Math.asin(Math.min(1, NA)) / D15, 1)}°　→　<b>${b > tc / D15 ? '全反射が続く' : 'クラッドへもれる'}</b>`; }
    }
  ]
});

function kView(cv) { return cv.view({ x0: -1.25, x1: 1.25, y0: -1.05, y1: 1.05, box: [10, 10, 460, 400], equal: true }); }
function drawKussetsu(cv, st) {
  st.__cv = cv;
  const v = kView(cv), n = MAT[st.mat][0], up = st.dir === 'in', sg = up ? 1 : -1;
  const n1 = up ? 1 : n, n2 = up ? n : 1, t1 = st.th * D15, s2 = n1 * Math.sin(t1) / n2, R = 0.95;
  v.poly([[-1.6, 0], [1.6, 0], [1.6, -1.2], [-1.6, -1.2]], { fill: 'a', alpha: 0.1 });
  v.line([[-1.6, 0], [1.6, 0]], { color: 'sub', width: 1.5 });
  v.line([[0, -1.05], [0, 1.05]], { color: 'sub', width: 1.5, style: 'dot' });
  v.text('空気（n = 1）', -1.2, 0.93, { size: 15, color: 'sub' });
  v.text(MAT[st.mat][1] + '（n = ' + n + '）', -1.2, -0.93, { size: 15, color: 'sub' });
  v.text('法線', 0.04, 1.0, { size: 14, color: 'sub' });
  const S = [-R * Math.sin(t1), sg * R * Math.cos(t1)];
  v.arrow(S[0], S[1], S[0] * 0.45, S[1] * 0.45, { color: 'b', width: 3 });
  v.line([S, [0, 0]], { color: 'b', width: 3 });
  const tot = s2 > 1;
  v.line([[0, 0], [R * Math.sin(t1), sg * R * Math.cos(t1)]], { color: 'd', width: tot ? 3.5 : 1.5, style: 'dash', alpha: tot ? 1 : 0.7 });
  if (!tot) { const t2 = Math.asin(s2); v.arrow(0, 0, R * Math.sin(t2), -sg * R * Math.cos(t2), { color: 'a', width: 3 }); arcA(v, -sg * Math.PI / 2, -sg * (Math.PI / 2 - t2), 0.28, 'θ₂', 'a'); }
  else v.text('全反射', 0.25, sg * 0.5, { size: 18, bold: true, color: 'd', bg: true });
  arcA(v, sg * Math.PI / 2, sg * (Math.PI / 2 + t1), 0.22, 'θ₁', 'b');
  v.dot(S[0], S[1], { color: 'b', r: 9 });
  // 右：入射角と屈折角のグラフ
  const g = cv.view({ x0: 0, x1: 95, y0: 0, y1: 95, box: [540, 30, 310, 320] });
  g.axes({ xt: [15, 30, 45, 60, 75, 90], yt: [15, 30, 45, 60, 75, 90], fmt: v => v + '' });
  cv.text('入射角 θ₁（°）', 850, 386, { size: 14, color: 'sub', align: 'right' });
  cv.text('屈折角 θ₂（°）', 548, 18, { size: 14, color: 'sub' });
  g.plot(x => x, { color: 'sub', style: 'dash', width: 1 });
  const f = x => { const s = n1 * Math.sin(x * D15) / n2; return s > 1 ? NaN : Math.asin(s) / D15; };
  g.plot(f, { color: 'a', width: 3, x1: 90, n: 600 });
  if (!up) { const tc = Math.asin(1 / n) / D15; g.poly([[tc, 0], [90, 0], [90, 95], [tc, 95]], { fill: 'd', alpha: 0.1 }); g.text('全反射', (tc + 90) / 2, 50, { size: 15, align: 'center', color: 'd', bold: true }); g.text('θc ' + A.num(tc, 1) + '°', tc, 8, { size: 14, color: 'd' }); }
  else { const lim = Math.asin(1 / n) / D15; g.line([[0, lim], [90, lim]], { color: 'c', style: 'dot', width: 1.5 }); g.text(A.num(lim, 1) + '° をこえない', 45, lim + 5, { size: 14, color: 'c' }); }
  const y2 = f(st.th); if (isFinite(y2)) g.dot(st.th, y2, { color: 'a', shape: 'diamond', r: 7 }); else g.dot(st.th, 92, { color: 'd', shape: 'cross', r: 6 });
}
function arcA(v, a0, a1, r, lab, col) {
  const pts = []; for (let k = 0; k <= 20; k++) { const a = a0 + (a1 - a0) * k / 20; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
  if (Math.abs(a1 - a0) > 0.03) v.line(pts, { color: col, width: 1.5 });
  const am = (a0 + a1) / 2; v.text(lab, (r + 0.1) * Math.cos(am), (r + 0.1) * Math.sin(am), { size: 15, color: col, align: 'center' });
}

function drawMado(cv, st) {
  const n = MAT[st.mat][0], tc = Math.asin(1 / n), h = st.h;
  const v = cv.view({ x0: -6, x1: 6, y0: -3.4, y1: 1.6, box: [20, 10, 840, 400], equal: true });
  v.poly([[-8, 0], [8, 0], [8, -3.4], [-8, -3.4]], { fill: 'a', alpha: 0.1 });
  v.line([[-8, 0], [8, 0]], { color: 'sub', width: 1.5 });
  v.line([[-8, -3.3], [8, -3.3]], { color: 'sub', width: 3 });
  v.text('空気', -5.7, 1.3, { size: 15, color: 'sub' }); v.text(MAT[st.mat][1], -5.7, -0.3, { size: 15, color: 'sub' }); v.text('底', -5.7, -3.05, { size: 15, color: 'sub' });
  const P = [0, -h];
  const ray = (a, o, hl) => {   // a：法線（上向き）からの角（左が負）
    const x = h * Math.tan(a);
    const s = n * Math.sin(Math.abs(a));
    if (s <= 1) { const b = Math.asin(s) * Math.sign(a); v.line([P, [x, 0]], o); v.line([[x, 0], [x + 1.6 * Math.sin(b) / Math.max(0.05, Math.cos(b)) , 1.6]], o); }
    else { const yb = -3.3, x2 = x + (0 - yb) * Math.tan(a); v.line([P, [x, 0]], Object.assign({}, o, { color: 'd', style: 'dash' })); v.line([[x, 0], [x2, yb]], Object.assign({}, o, { color: 'd', style: 'dash' })); }
  };
  v.clip(() => {
    for (let k = -14; k <= 14; k++) { const a = k * 6 * D15; if (Math.abs(a) > 84 * D15) continue; ray(a, { color: 'a', width: 1.2, alpha: 0.6 }, false); }
    for (const sgn of [-1, 1]) { const x = sgn * h * Math.tan(tc); v.line([P, [x, 0]], { color: 'b', width: 3 }); v.line([[x, 0], [sgn * 6, 0]], { color: 'b', width: 3, alpha: 0.5 }); }
    ray(st.ph * D15, { color: Math.abs(n * Math.sin(st.ph * D15)) <= 1 ? 'a' : 'd', width: 4 }, true);
  });
  // 窓
  const xr = h * Math.tan(tc);
  v.line([[-xr, 0.06], [xr, 0.06]], { color: 'c', width: 6 });
  v.text('空が見える窓（半径 ' + A.num(xr, 2) + ' m）', 0, 0.35, { size: 15, align: 'center', color: 'c', bold: true, bg: true });
  v.dot(P[0], P[1], { color: 'ink', r: 6 });
  v.text('θc = ' + A.num(tc / D15, 1) + '°', 0.25, -h + 0.55, { size: 15, color: 'b', bg: true });
  v.line([[0, -h], [0, 0]], { color: 'sub', style: 'dot', width: 1.5 });
}

function drawFiber(cv, st) {
  const n1 = 1.48, n2 = st.n2, ta = st.ta * D15, r = Math.asin(Math.sin(ta) / n1), tcB = Math.asin(n2 / n1), inc = Math.PI / 2 - r, leak = inc < tcB;
  const v = cv.view({ x0: -4.5, x1: 25.5, y0: -3.5, y1: 3.5, box: [10, 40, 860, 320], equal: true });
  // クラッドとコア
  v.poly([[0, -2], [25.5, -2], [25.5, 2], [0, 2]], { fill: 'sub', alpha: 0.12 });
  v.poly([[0, -1], [25.5, -1], [25.5, 1], [0, 1]], { fill: 'a', alpha: 0.12 });
  v.line([[0, 1], [25.5, 1]], { color: 'sub', width: 1.5 }); v.line([[0, -1], [25.5, -1]], { color: 'sub', width: 1.5 });
  v.line([[0, 2], [25.5, 2]], { color: 'sub', width: 1 }); v.line([[0, -2], [25.5, -2]], { color: 'sub', width: 1 }); v.line([[0, -2], [0, 2]], { color: 'sub', width: 1.5 });
  cv.text('クラッド n₂ = ' + A.num(n2, 3), v.X(19), v.Y(1.5), { size: 15, color: 'sub', align: 'center' });
  cv.text('コア n₁ = 1.48', v.X(19), v.Y(-0.55), { size: 15, color: 'sub', align: 'center', bg: true });
  // 受け入れ角の範囲（空気の側）
  const NA = Math.sqrt(n1 * n1 - n2 * n2), tA = Math.asin(Math.min(1, NA));
  for (const s of [-1, 1]) v.line([[0, 0], [-3.6, s * 3.6 * Math.tan(tA)]], { color: 'c', style: 'dot', width: 2 });
  v.line([[-3.8, 0], [0, 0]], { color: 'sub', width: 1, style: 'dash' });
  // 光の道
  const pts = [[-3.6, 3.6 * Math.tan(ta)]];   // 空気の中を、軸から θa の向きに来る
  let x = 0, y = 0, dy = -1, amp = 1;
  const segs = [];   // [p, q, 明るさ]
  segs.push([pts[0], [0, 0], 1]);
  for (let k = 0; k < 60 && x < 25.5; k++) {
    const yt = dy < 0 ? -1 : 1, dx = r < 1e-6 ? 100 : Math.abs(yt - y) / Math.tan(r);
    const nx = x + dx;
    if (nx >= 25.5) { segs.push([[x, y], [25.5, y + dy * (25.5 - x) * Math.tan(r)], amp]); x = 25.5; break; }
    segs.push([[x, y], [nx, yt], amp]);
    if (leak) {
      const sOut = n1 * Math.sin(inc) / n2, b = Math.asin(Math.min(1, sOut));
      const lx = nx + Math.tan(b) * 1, ly = yt + Math.sign(yt) * 1;   // クラッドの中を外へ
      v.line([[nx, yt], [lx, ly]], { color: 'b', width: 2, style: 'dash', alpha: Math.max(0.25, amp) });
      amp *= 0.55;
    }
    x = nx; y = yt; dy = -dy;
  }
  for (const [p, q, a] of segs) v.line([p, q], { color: 'a', width: 3, alpha: Math.max(0.12, a) });
  // 進む光の点
  let total = 0; const L = segs.map(([p, q]) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); total += d; return d; });
  let s = st.s * total;
  for (let i = 0; i < segs.length; i++) { if (s <= L[i]) { const [p, q, a] = segs[i]; const u = s / L[i]; if (a > 0.1) v.dot(p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, { color: 'a', r: 7 }); break; } s -= L[i]; }
  cv.text('θa', v.X(-3.4), v.Y(3.4 * Math.tan(ta)) - 16, { size: 16, color: 'b', bg: true });
  cv.text('空気', v.X(-3.6), v.Y(-2.6), { size: 15, color: 'sub' });
  cv.text(leak ? '境での入射角が臨界角より小さい → 毎回クラッドへもれて、光は弱くなる' : '境での入射角が臨界角より大きい → 全反射が続き、光はもれない', 440, 385, { size: 16, align: 'center', bold: true, color: leak ? 'b' : 'ink' });
  cv.text('（実際のコアは髪の毛より細い。角はそのままで、長さを縮めてかいた）', 440, 22, { size: 14, align: 'center', color: 'sub' });
}
