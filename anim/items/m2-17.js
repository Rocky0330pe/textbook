// @id m2-17
// @title 立体を回して切る：すいの体積・球の体積・回転体
// @vol 数学4
// @uses 3d
// @from 数学 4-5 ⑥⑦⑧（ch4-05:466・510・547・681）、4-3 ⑥（ch4-03:486）／5-10、8-6 でも使う
'use strict';
const P17 = Math.PI;
A.item({
  id: 'm2-17', title: '立体を回して切る：すいの体積・球の体積・回転体',
  from: '数学 第4巻 4-5 ⑥「すいの体積」・⑦「球の体積」・⑧「回転体」、4-3 ⑥「すいを底面に平行に切ると」の図から（5-10・8-6 でも使う）',
  W: 880, H: 440,
  state: { yaw: -28, pitch: 24, sep: 0, y: 6, n: 5, side: 'out', shape: 'rect', phi: 0 },
  scenes: [
    {
      key: 'sanbun', label: '① 立方体を3つに',
      lead: '立方体を、1つの頂点 P を共通の頂点とする3つの四角すいに分けます。▶ で分けてみましょう。図はドラッグで回せます。',
      note: '3つの四角すいは、どれも底面が1辺 $a$ の正方形、高さ $a$ で、向きがちがうだけの合同な形です。立方体 $a^3$ を3等分したので、1つの体積は $\\dfrac{1}{3}a^3=\\dfrac{1}{3}\\times a\\times a\\times a$（底面積×高さ×$\\dfrac{1}{3}$）。',
      legend: [['下の面が底面', { color: 'a' }], ['右の面が底面', { color: 'b', style: 'dash' }], ['おくの面が底面', { color: 'c', style: 'dot' }], ['もとの立方体', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'sep', label: 'はなす', min: 0, max: 1, step: 0.01, fmt: v => v < 0.01 ? '立方体' : '3つに' }],
      state: { yaw: -28, pitch: 24 },
      init(st) { st.sep = 0; },
      step(st, dt) { st.sep = Math.min(1, st.sep + dt * 0.5); if (st.sep >= 1) return false; },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawSanbun(cv, st); },
      readout: () => '1つの四角すい ＝ $\\dfrac{1}{3}$ × 底面積 $a^2$ × 高さ $a$ ＝ $\\dfrac{1}{3}a^3$（3つで立方体 $a^3$）'
    },
    {
      key: 'kiru', label: '② 円すいを切る',
      lead: '高さ 12 cm、底面の半径 4 cm の円すいを、頂点から $y$ の所で、底面に平行に切ります。切り口の円の半径はどう変わるでしょう。',
      note: '切り口の半径は、頂点からの長さ $y$ に比例します（$\\dfrac{4}{12}y=\\dfrac{1}{3}y$）。切りとった小さい円すいは、もとの円すいと相似です。面積は $y^2$ に比例します。',
      miss: '面積の比を、相似比と同じにしてはいけません。相似比 1:2 なら、面積は $2^2=4$ 倍です（体積なら $2^3=8$ 倍）。',
      legend: [['円すい', { color: 'a' }], ['切り口（円）', { color: 'b' }], ['頂点からの長さ $y$', { color: 'ink', style: 'dash' }]],
      controls: [{ range: 'y', label: '頂点からの長さ $y$', min: 0, max: 12, step: 0.1, d: 1, fmt: v => A.num(v, 1) + ' cm' }],
      state: { yaw: -30, pitch: 18 },
      init(st) { st.y = 0; },
      step(st, dt) { st.y = Math.min(12, st.y + dt * 2); if (st.y >= 12) return false; },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawKiru(cv, st); },
      readout: st => `切り口の半径 ＝ 4 × ${A.num(st.y, 1)} ÷ 12 ＝ <b>${A.num(st.y / 3, 2)} cm</b>　　面積 ＝ π × ${A.num(st.y / 3, 2)}² ≈ ${A.num(P17 * st.y * st.y / 9, 2)} cm²`
    },
    {
      key: 'kyuu', label: '③ 半球とくりぬいた形',
      lead: '半径 10 の半球（左）と、半径 10・高さ 10 の円柱からさかさの円すいをくりぬいた形（右）を、同じ高さ $y$ で水平に切ります。',
      note: '半球の切り口は半径 $\\sqrt{r^2-y^2}$ の円で、面積 $\\pi(r^2-y^2)$。右の切り口は半径 $r$ の円から半径 $y$ の円をぬいた輪で、面積 $\\pi r^2-\\pi y^2$。**どの高さでも同じ**なので、体積も同じ：半球 $=\\pi r^3-\\dfrac{1}{3}\\pi r^3=\\dfrac{2}{3}\\pi r^3$、球は $\\dfrac{4}{3}\\pi r^3$。',
      legend: [['半球の切り口（円）', { color: 'a' }], ['円柱−円すいの切り口（輪）', { color: 'b', style: 'dash' }], ['立体', { color: 'sub' }]],
      controls: [{ range: 'y', label: '切る高さ $y$', min: 0, max: 10, step: 0.1, d: 1 }],
      state: { yaw: -20, pitch: 26 },
      init(st) { st.y = 6; },
      step(st, dt) { st.y += dt * 1.5; if (st.y > 10) st.y = 0; },
      drag: A.rotDrag([0, 0, 880, 330]),
      draw(cv, st) { drawKyuu(cv, st); },
      readout: st => { const a = 100 - st.y * st.y; return `半球：π × (${A.num(Math.sqrt(a), 2)})² ＝ <b>${A.num(a, 1)}π</b>　　輪：π × 10² − π × ${A.num(st.y, 1)}² ＝ <b>${A.num(a, 1)}π</b>`; }
    },
    {
      key: 'kaidan', label: '④ うすい板の階段',
      lead: '底面が1辺 $a$ の正方形、高さ $h$ の四角すいを、$n$ まいのうすい板に分けます。板をふやすと、階段の体積はどうなるでしょう。',
      note: '外側の階段はすいをつつみ、内側の階段はすいの中に入ります。すいの体積は2つのあいだにあり、板をふやすと、どちらも $a^2h$ の $\\dfrac{1}{3}=0.333\\cdots$ 倍に近づきます。',
      miss: '÷3 をわすれると、柱の体積になってしまいます。底面の半径 3 cm・高さ 4 cm の円すいは $\\pi\\times3^2\\times4\\times\\dfrac{1}{3}=12\\pi$ で、$36\\pi$ ではありません。',
      legend: [['外側の階段', { color: 'b' }], ['内側の階段', { color: 'a', style: 'dash' }], ['四角すい', { color: 'ink' }]],
      controls: [{ range: 'n', label: '板の数 $n$', min: 1, max: 40, step: 1, d: 0 }, { seg: 'side', label: '階段', options: [['out', '外側'], ['in', '内側']] }],
      state: { yaw: -30, pitch: 20 },
      init(st) { st.n = 5; st.side = 'out'; },
      drag: A.rotDrag([0, 0, 560, 440]),
      draw(cv, st) { drawKaidan(cv, st); },
      readout: st => { const n = st.n, o = (n + 1) * (2 * n + 1) / (6 * n * n), i = (n - 1) * (2 * n - 1) / (6 * n * n); return `外側 ${A.num(o, 3)}　＞　すい $\\dfrac{1}{3}$ ＝ 0.333…　＞　内側 ${A.num(i, 3)}（$a^2h$ の何倍）`; }
    },
    {
      key: 'kaiten', label: '⑤ 回転体',
      lead: '平面の図形を、軸（点線）のまわりに1回転させます。どんな立体ができるでしょう。',
      note: '軸にくっついた辺は、立体のまん中の線になります。軸からいちばん遠い所が、回転体の半径です。長方形→円柱、直角三角形→円すい、半円→球。',
      legend: [['回す図形', { color: 'b' }], ['できる立体の面', { color: 'a' }], ['回転の軸', { color: 'sub', style: 'dashdot' }]],
      controls: [{ range: 'phi', label: '回した角', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }, { seg: 'shape', label: '図形', options: [['rect', '長方形'], ['tri', '直角三角形'], ['semi', '半円']] }],
      state: { yaw: -30, pitch: 18 },
      init(st) { st.phi = 0; },
      step(st, dt) { st.phi = Math.min(360, st.phi + dt * 60); if (st.phi >= 360) return false; },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawKaiten(cv, st); },
      readout: st => ({ rect: '長方形 → <b>円柱</b>', tri: '直角三角形 → <b>円すい</b>', semi: '半円 → <b>球</b>' })[st.shape] + `（いま ${Math.round(st.phi)}° 回した）`
    }
  ]
});

// ---------- 3次元の小さな道具 ----------
function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cen3(ps) { const c = [0, 0, 0]; ps.forEach(p => { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return c.map(v => v / ps.length); }
// 凸な立体の面：見えている面だけを描く（cen は立体の中の点）
function faces(V, fs, cen, o) {
  const w = [-V.sy1 * V.cp, -V.cy1 * V.cp, V.sp];
  for (const f of fs) {
    let n = cross3(sub3(f[1], f[0]), sub3(f[2], f[0]));
    if (dot3(n, sub3(cen3(f), cen)) < 0) n = n.map(v => -v);
    if (dot3(n, w) <= 1e-9) { if (o.back) V.line3(f.concat([f[0]]), Object.assign({}, o.back, { zbias: -50 })); continue; }
    V.poly3(f, { fill: 'bg', alpha: o.opaque ? 1 : 0, zbias: o.zbias || 0 });
    V.poly3(f, { fill: o.fill, alpha: o.alpha == null ? 0.3 : o.alpha, color: o.color, width: o.width || 1.2, style: o.style, zbias: (o.zbias || 0) + 1e-6 });
  }
}
function box(x0, y0, z0, x1, y1, z1) {
  const p = (x, y, z) => [x, y, z];
  return [[p(x0, y0, z0), p(x1, y0, z0), p(x1, y1, z0), p(x0, y1, z0)], [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)],
    [p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1)], [p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)],
    [p(x0, y0, z0), p(x0, y1, z0), p(x0, y1, z1), p(x0, y0, z1)], [p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)]];
}

// 円の輪：手前は実線、おくは点線
function ring(V, pts, c, o) {
  const dc = V.P(c)[2];
  for (let k = 0; k < pts.length - 1; k++) { const m = [(pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2, pts[k][2]]; V.line3([pts[k], pts[k + 1]], Object.assign({}, o, V.P(m)[2] < dc - 1e-9 ? { style: 'dash', width: (o.width || 2) * 0.6 } : {})); }
}
// 円すいの輪郭：頂点から見て、底の円のいちばん左といちばん右の点
function coneSil(V, top, base) {
  const t = V.P(top), an = base.map(p => { const q = V.P(p); return Math.atan2(q[1] - t[1], q[0] - t[0]); });
  if (an.some(a => a < 0.05 || a > Math.PI - 0.05)) return [];
  let i = 0, j = 0; an.forEach((a, k) => { if (a < an[i]) i = k; if (a > an[j]) j = k; });
  return [base[i], base[j]];
}
// 円柱の輪郭：底の円の、画面でいちばん左と右の点（x, y）
function cylSil(V, base) {
  let i = 0, j = 0; base.forEach((p, k) => { const x = V.P(p)[0]; if (x < V.P(base[i])[0]) i = k; if (x > V.P(base[j])[0]) j = k; });
  return [base[i], base[j]];
}
function circ(r, z, n = 48, cx = 0, cy = 0) { const pts = []; for (let k = 0; k <= n; k++) { const a = 2 * P17 * k / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); } return pts; }
function panel(cv, x, lines) { let y = 40; for (const [s, o] of lines) { if (s === '') { y += 12; continue; } cv.text(s, x, y, Object.assign({ size: 16 }, o || {})); y += 28; } }

function drawSanbun(cv, st) {
  const a = 2, V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 70, center: [1, 1, 0.9] });
  const P = [0, 0, a], d = st.sep * 1.3;
  const cube = box(0, 0, 0, a, a, a);
  for (const f of cube) V.line3(f.concat([f[0]]), { color: 'sub', width: 1, style: 'dash', zbias: -100 });
  const pyr = [
    { base: [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]], off: [0, 0, -1], fill: 'a', style: 'solid' },
    { base: [[a, 0, 0], [a, a, 0], [a, a, a], [a, 0, a]], off: [1, 0, 0], fill: 'b', style: 'dash' },
    { base: [[0, a, 0], [a, a, 0], [a, a, a], [0, a, a]], off: [0, 1, 0], fill: 'c', style: 'dot' }
  ];
  for (const q of pyr) {
    const sh = p => [p[0] + q.off[0] * d, p[1] + q.off[1] * d, p[2] + q.off[2] * d];
    const b = q.base.map(sh), ap = sh(P), fs = [b];
    for (let k = 0; k < 4; k++) fs.push([ap, b[k], b[(k + 1) % 4]]);
    faces(V, fs, cen3(b.concat([ap, ap])), { fill: q.fill, alpha: 0.35, color: q.fill, width: 2, style: q.style, opaque: true });
  }
  for (const q of (d < 0.01 ? [pyr[0]] : pyr)) {
    const ap = [P[0] + q.off[0] * d, P[1] + q.off[1] * d, P[2] + q.off[2] * d];
    V.dot3(ap, { r: 6, color: 'ink', zbias: 1000 });
    V.text3('P', [ap[0] - 0.15, ap[1] - 0.15, ap[2] + 0.2], { size: 18, bold: true, math: true, italic: true });
  }
  if (d < 0.01) V.text3('a', [a / 2, -0.25, -0.15], { size: 17, math: true, italic: true });
  V.flush();
  panel(cv, 610, [['立方体の体積 ＝ a³', { bold: true }], ['3つの四角すいは合同', {}], ['底面：1辺 a の正方形', { color: 'sub' }], ['高さ：a', { color: 'sub' }], ['', 0], ['1つ ＝ a³ ÷ 3', { bold: true }], ['　＝ ⅓ × a × a × a', {}], ['　＝ 底面積 × 高さ × ⅓', { bold: true, color: 'b' }], ['', 0], ['図はドラッグで回せます', { color: 'sub', size: 15 }]]);
}

function drawKiru(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 25, center: [0, 0, 6] });
  const h = 12, R = 4, top = [0, 0, h], N = 36, base = circ(R, 0, N);
  const lat = []; for (let k = 0; k < N; k++) lat.push([top, base[k], base[k + 1]]);
  lat.push(base.slice(0, N));
  faces(V, lat, [0, 0, 3], { fill: 'a', alpha: 0.12, color: null, back: null });
  ring(V, base, [0, 0, 0], { color: 'a', width: 2 });
  // 輪郭（左右の母線）：見る向きに垂直な2本
  for (const p of coneSil(V, top, base)) V.line3([top, p], { color: 'a', width: 2, zbias: 50 });
  V.line3([top, [0, 0, 0]], { color: 'sub', width: 1, style: 'dash' });
  const y = st.y, z = h - y, rr = R * y / h;
  if (y > 0.05) {
    const sec = circ(rr, z, N);
    V.poly3(sec.slice(0, N), { fill: 'b', alpha: 0.55, color: 'b', width: 2.5, zbias: 200 });
    V.line3([[0, 0, z], [rr, 0, z]], { color: 'ink', width: 2, zbias: 300 });
  }
  // y のものさし
  const off = -R - 1.5;
  V.line3([[off, 0, h], [off, 0, z]], { color: 'ink', width: 2, style: 'dash', zbias: 300 });
  V.text3('y ＝ ' + A.num(y, 1), [off - 0.4, 0, (h + z) / 2], { size: 16, align: 'right', bold: true });
  V.text3('頂点', [0, 0, h + 0.8], { size: 15, align: 'center' });
  V.flush();
  const rows = [3, 6, 9, 12], X = 620;
  const L = [['頂点からの長さ y と切り口', { bold: true }], ['', 0]];
  panel(cv, X, L);
  let yy = 108; const cols = [X, X + 70, X + 140];
  [['y', '半径', '面積']].concat(rows.map(v => [String(v), String(v / 3), (v / 3) ** 2 === 1 ? 'π' : (v / 3) ** 2 + 'π'])).forEach((r, i) => {
    const on = i > 0 && Math.abs(rows[i - 1] - y) < 0.05;
    r.forEach((s, j) => cv.text(s, cols[j], yy, { size: 16, color: i === 0 ? 'sub' : on ? 'b' : 'ink', bold: on })); yy += 28;
  });
  yy += 10;
  cv.text('半径 ＝ 4 × y ÷ 12 ＝ y ÷ 3', X, yy, { size: 16 }); yy += 28;
  cv.text('半径は y に比例', X, yy, { size: 16, bold: true, color: 'b' }); yy += 28;
  cv.text('面積は y² に比例', X, yy, { size: 16, bold: true, color: 'b' });
}

function drawKyuu(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 880, 330], yaw: st.yaw, pitch: st.pitch, scale: 11, center: [0, 0, 4], persp: 0.03 });
  const r = 10, y = st.y, L = [-14, 0], Rc = [14, 0], N = 32;
  // 半球
  const hs = [];
  for (let i = 0; i < 6; i++) for (let k = 0; k < N; k++) {
    const t0 = i * P17 / 12, t1 = (i + 1) * P17 / 12, a0 = 2 * P17 * k / N, a1 = 2 * P17 * (k + 1) / N;
    const pt = (t, a) => [L[0] + r * Math.cos(t) * Math.cos(a), L[1] + r * Math.cos(t) * Math.sin(a), r * Math.sin(t)];
    hs.push([pt(t0, a0), pt(t0, a1), pt(t1, a1), pt(t1, a0)]);
  }
  faces(V, hs, [L[0], L[1], 3], { fill: 'a', alpha: 0.08, color: 'grid', width: 0.6 });
  ring(V, circ(r, 0, 64, L[0], L[1]), [L[0], L[1], 0], { color: 'a', width: 1.5 });
  { // 半球の輪郭（見る向きに垂直な大円の上半分）
    const w = [-V.sy1 * V.cp, -V.cy1 * V.cp, V.sp], u0 = cross3(w, [0, 0, 1]), lu = Math.hypot(...u0) || 1, u = u0.map(x => x / lu), v = cross3(u, w), pts = [];
    for (let k = 0; k <= 64; k++) { const t = Math.PI * 2 * k / 64, d = [u[0] * Math.cos(t) + v[0] * Math.sin(t), u[1] * Math.cos(t) + v[1] * Math.sin(t), u[2] * Math.cos(t) + v[2] * Math.sin(t)]; if (d[2] >= -1e-9) pts.push([L[0] + r * d[0], L[1] + r * d[1], r * d[2]]); else if (pts.length) { V.line3(pts.slice(), { color: 'a', width: 2, zbias: 40 }); pts.length = 0; } }
    if (pts.length > 1) V.line3(pts, { color: 'a', width: 2, zbias: 40 });
  }
  // 円柱（側面）とさかさの円すい（内側の面）
  const cb = circ(r, 0, N, Rc[0], Rc[1]), ct = circ(r, r, N, Rc[0], Rc[1]);
  for (let k = 0; k < N; k++) V.poly3([cb[k], cb[k + 1], ct[k + 1], ct[k]], { fill: 'b', alpha: 0.06, color: 'grid', width: 0.6 });
  for (let k = 0; k < N; k++) V.poly3([[Rc[0], Rc[1], 0], ct[k], ct[k + 1]], { fill: 'b', alpha: 0.05 });
  ring(V, cb, [Rc[0], Rc[1], 0], { color: 'b', width: 1.5 }); V.line3(ct, { color: 'b', width: 1.5, zbias: 30 });
  for (const ex of cylSil(V, cb)) {
    V.line3([[ex[0], ex[1], 0], [ex[0], ex[1], r]], { color: 'b', width: 1.5, zbias: 30 });
    V.line3([[Rc[0], Rc[1], 0], [ex[0], ex[1], r]], { color: 'b', width: 1.2, style: 'dash', zbias: 30 });
  }
  // 切り口
  const rs = Math.sqrt(Math.max(0, r * r - y * y));
  V.poly3(circ(rs, y, 48, L[0], L[1]).slice(0, 48), { fill: 'a', alpha: 0.6, color: 'a', width: 2.5, zbias: 500 });
  const out = circ(r, y, 48, Rc[0], Rc[1]), inn = circ(Math.max(y, 0.001), y, 48, Rc[0], Rc[1]);
  for (let k = 0; k < 48; k++) V.poly3([out[k], out[k + 1], inn[k + 1], inn[k]], { fill: 'b', alpha: 0.5, zbias: 500 });
  V.line3(out, { color: 'b', width: 2.5, style: 'dash', zbias: 501 }); V.line3(inn, { color: 'b', width: 2.5, style: 'dash', zbias: 501 });
  V.text3('半球', [L[0], L[1] - r - 2, 0], { size: 16, align: 'center', bold: true });
  V.text3('円柱 − 円すい', [Rc[0], Rc[1] - r - 2, 0], { size: 16, align: 'center', bold: true });
  V.flush();
  // 下：切り口を上から見る
  const a = r * r - y * y, s = 5.2, cy = 385;
  const top = (cx, R0, R1, col, sty) => { const g = cv.g; g.beginPath(); g.arc(cx, cy, R0 * s, 0, 2 * P17); if (R1 > 0) g.arc(cx, cy, R1 * s, 0, 2 * P17, true); g.fillStyle = A.color(col); g.globalAlpha = 0.45; g.fill('evenodd'); g.globalAlpha = 1; cv.circle(cx, cy, R0 * s, { color: col, width: 2, style: sty }); if (R1 > 0) cv.circle(cx, cy, R1 * s, { color: col, width: 2, style: sty }); };
  top(260, rs, 0, 'a', 'solid'); top(600, r, y, 'b', 'dash');
  cv.text('上から見た切り口', 20, 345, { size: 15, color: 'sub' });
  cv.text('半径 ' + A.num(rs, 2), 330, cy - 14, { size: 15, color: 'a' }); cv.text('面積 ' + A.num(a, 1) + 'π', 330, cy + 12, { size: 15, bold: true, color: 'a' });
  cv.text('外 半径 10・あな 半径 ' + A.num(y, 1), 665, cy - 14, { size: 15, color: 'b' }); cv.text('面積 ' + A.num(a, 1) + 'π', 665, cy + 12, { size: 15, bold: true, color: 'b' });
}

function drawKaidan(cv, st) {
  const a = 10, h = 10, n = st.n, V = new A.View3(cv, { box: [0, 0, 560, 440], yaw: st.yaw, pitch: st.pitch, scale: 25, center: [0, 0, 5] });
  for (let k = 1; k <= n; k++) {
    const s = (st.side === 'out' ? k : k - 1) * a / n / 2, z1 = h - (k - 1) * h / n, z0 = h - k * h / n;
    if (s <= 0) continue;
    faces(V, box(-s, -s, z0, s, s, z1), [0, 0, (z0 + z1) / 2], { fill: st.side === 'out' ? 'b' : 'a', alpha: 0.35, color: st.side === 'out' ? 'b' : 'a', width: n > 20 ? 0.6 : 1.2, style: st.side === 'out' ? 'solid' : 'dash', opaque: true });
  }
  const T = [0, 0, h], B = [[-a / 2, -a / 2, 0], [a / 2, -a / 2, 0], [a / 2, a / 2, 0], [-a / 2, a / 2, 0]];
  for (let k = 0; k < 4; k++) { V.line3([T, B[k]], { color: 'ink', width: 2, zbias: 1000 }); V.line3([B[k], B[(k + 1) % 4]], { color: 'ink', width: 2, zbias: 1000 }); }
  V.text3('a', [0, -a / 2 - 1, 0], { size: 17, math: true, italic: true, align: 'center' });
  V.text3('h', [a / 2 + 1.2, -a / 2, h / 2], { size: 17, math: true, italic: true });
  V.flush();
  const X = 580, o = (n + 1) * (2 * n + 1) / (6 * n * n), i = (n - 1) * (2 * n - 1) / (6 * n * n);
  let y = 40; cv.text('階段の体積（a²h の何倍）', X, y, { size: 16, bold: true }); y += 30;
  const cols = [X, X + 70, X + 160];
  [['n', '外側', '内側']].concat([5, 10, 100, 1000].map(m => [String(m), A.num((m + 1) * (2 * m + 1) / (6 * m * m), 3), A.num((m - 1) * (2 * m - 1) / (6 * m * m), 3)])).forEach((r, j) => {
    const on = j > 0 && [5, 10, 100, 1000][j - 1] === n;
    r.forEach((s, c) => cv.text(s, cols[c], y, { size: 16, color: j === 0 ? 'sub' : on ? 'b' : 'ink', bold: on })); y += 26;
  });
  y += 12;
  cv.text('いま n ＝ ' + n, X, y, { size: 16, bold: true }); y += 28;
  cv.text('外側 ' + A.num(o, 3) + '　内側 ' + A.num(i, 3), X, y, { size: 16 }); y += 28;
  cv.text('→ どちらも ⅓ ＝ 0.333… へ', X, y, { size: 16, bold: true, color: 'b' }); y += 34;
  cv.text('k まいめの板の1辺 ＝ a × k ÷ n', X, y, { size: 15, color: 'sub' }); y += 24;
  cv.text('（頂点からの距離に比例）', X, y, { size: 15, color: 'sub' });
}

function profile(shape) {
  if (shape === 'rect') return [[0, 0], [4, 0], [4, 9], [0, 9]];
  if (shape === 'tri') return [[0, 0], [4, 0], [0, 9]];
  const p = []; for (let k = 0; k <= 12; k++) { const t = -P17 / 2 + P17 * k / 12; p.push([4.5 * Math.cos(t), 4.5 + 4.5 * Math.sin(t)]); } return p;
}
function drawKaiten(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 30, center: [0, 0, 4.5] });
  const pr = profile(st.shape), phi = st.phi * P17 / 180, M = Math.max(1, Math.ceil(st.phi / 15));
  const at = (p, a) => [p[0] * Math.cos(a), p[0] * Math.sin(a), p[1]];
  // 回ってできた面
  for (let j = 0; j < M; j++) {
    const a0 = phi * j / M, a1 = phi * (j + 1) / M;
    for (let k = 0; k < pr.length - 1; k++) {
      const p = pr[k], q = pr[k + 1]; if (p[0] < 1e-6 && q[0] < 1e-6) continue;
      V.poly3([at(p, a0), at(q, a0), at(q, a1), at(p, a1)], { fill: 'a', alpha: 0.12, color: 'a', width: 0.4 });
    }
  }
  // 軸
  V.line3([[0, 0, -1.5], [0, 0, 11]], { color: 'sub', style: 'dashdot', width: 2, zbias: 500 });
  // 回す図形（いまの位置）と、はじめの位置
  V.poly3(pr.map(p => at(p, phi)), { fill: 'b', alpha: 0.45, color: 'b', width: 2.5, zbias: 400 });
  if (st.phi > 5) V.poly3(pr.map(p => at(p, 0)), { color: 'b', width: 1.2, style: 'dash', zbias: 300 });
  // 回る向きの矢印
  const arc = []; for (let k = 0; k <= 16; k++) { const a = -1.2 + 2.4 * k / 16; arc.push([2.2 * Math.cos(a), 2.2 * Math.sin(a), 10.3]); }
  V.line3(arc.slice(0, 14), { color: 'ink', width: 2, zbias: 600 }); V.arrow3(arc[12], arc[16], { color: 'ink', width: 2, head: 12, zbias: 600 });
  V.text3('軸', [0, 0, 11.6], { size: 15, align: 'center' });
  V.flush();
  const nm = { rect: ['長方形', '円柱', '横 → 底面の半径', 'たて → 高さ'], tri: ['直角三角形', '円すい', '軸にそった辺 → 高さ', 'もう1辺 → 底面の半径'], semi: ['半円', '球', '直径を軸にして回す', '半径 → 球の半径'] }[st.shape];
  panel(cv, 620, [[nm[0] + ' → ' + nm[1], { bold: true, size: 20 }], ['', 0], [nm[2], { size: 15 }], [nm[3], { size: 15 }], ['', 0], ['回した角：' + Math.round(st.phi) + '°', {}], [st.phi >= 360 ? '1回転で ' + nm[1] + ' ができた' : '', { color: 'b', bold: true }]]);
}
