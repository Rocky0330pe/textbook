// @id m4-17
// @title マスをたすと外のふちだけ残る：ガウスとストークス
// @vol 数学8
// @uses 3d
// @from 数学 8-11 図2・3・11（ch8-11:192・219・626）／8-14・物理 電-14 でも使う
'use strict';
// 長方形 0≦x≦3、0≦y≦2（8-11 やってみよう・②）。マスは 1目もりを n に分ける
const ROT_F = {
  x2: { name: '$\\vec F=(0,\\ x^2)$', cell: (a, b, c, d) => (b * b - a * a) * (d - c), edge: (x0, y0, x1, y1) => { // 辺を (x0,y0)→(x1,y1) と進む量
    if (x0 === x1) return x0 * x0 * (y1 - y0); return 0; } },
  uz: { name: '$\\vec F=(-y,\\ x)$', cell: (a, b, c, d) => 2 * (b - a) * (d - c), edge: (x0, y0, x1, y1) => { // 直線の辺。(−y, x)·(dx, dy) の平均
    const xm = (x0 + x1) / 2, ym = (y0 + y1) / 2; return -ym * (x1 - x0) + xm * (y1 - y0); } }
};

A.item({
  id: 'm4-17', title: 'マスをたすと外のふちだけ残る：ガウスとストークス',
  from: '数学 第8巻 8-11 図2・3・11 から（8-14、物理 電-14 でも使う）',
  W: 880, H: 440,
  state: { n: 1, p: 0, f: 'x2', yaw: -30, pitch: 28, s: 0, m: 4 },
  scenes: [
    {
      key: 'junkan', label: '① うずの合計＝外の1周',
      lead: '長方形を小さなマスに分け、マスごとに左回りに1周します。▶ で、全部のマスをたし合わせます。',
      note: 'となりどうしのマスの共通の辺は、片方では上へ、もう片方では下へ通るので、たすと打ち消し合います。残るのは**外のふちを1周する分だけ**です（ストークスの定理・グリーンの定理）。マスを細かくしても、合計は同じです。',
      miss: '道の向きを逆にすると、符号が逆になります。外のふちは、中のマスと同じ**左回り**に1周します。',
      legend: [['マスの1周（灰色）', { color: 'sub' }], ['打ち消し合う中の辺', { color: 'sub', style: 'dot' }], ['残る外の1周', { color: 'b' }]],
      controls: [{ range: 'n', label: '1目もりを分ける数', min: 1, max: 4, step: 1, d: 0, on: st => { st.p = 0; } }, { seg: 'f', label: '流れ', options: [['x2', ROT_F.x2.name], ['uz', ROT_F.uz.name]], on: st => { st.p = 0; } }],
      step(st, dt) { st.p = Math.min(1, st.p + dt * 0.35); if (st.p >= 1) return false; },
      draw(cv, st) { drawGrid(cv, st, 'rot'); },
      readout: st => { const t = sums(st, 'rot'); return `マスの循環の合計 ＝ ${A.num(t.cells, 2)}　　外の1周 ＝ ${A.num(t.outer, 2)}　　（マス ${t.N} こ）`; }
    },
    {
      key: 'hassan', label: '② わき出しの合計＝外へ出る量',
      lead: '流れ $\\vec F=(x^2,\\ y)$ で、マスごとに「出る量−入る量」を数えます。▶ で、全部のマスをたし合わせます。',
      note: '共通の辺を右へ通る水は、左のマスでは「出る」、右のマスでは「入る」です。たすと消え、外のふちから出ていく量だけが残ります（ガウスの定理）。やってみようの表と同じ 24 です。',
      miss: 'ガウスの定理は、閉じたふち（閉じた面）で使います。ふちの一部だけ（開いた面）では、中の合計と等しくなりません。',
      state: { f: 'div' },
      legend: [['マスの「出る」矢印（灰色）', { color: 'sub' }], ['打ち消し合う中の辺', { color: 'sub', style: 'dot' }], ['残る外へ出る量', { color: 'b' }]],
      controls: [{ range: 'n', label: '1目もりを分ける数', min: 1, max: 4, step: 1, d: 0, on: st => { st.p = 0; } }],
      step(st, dt) { st.p = Math.min(1, st.p + dt * 0.35); if (st.p >= 1) return false; },
      draw(cv, st) { drawGrid(cv, st, 'div'); },
      readout: st => { const t = sums(st, 'div'); return `マスの「出−入」の合計 ＝ ${A.num(t.cells, 2)}　　外のふちから出る量 ＝ ${A.num(t.outer, 2)}`; }
    },
    {
      key: 'hankyu', label: '③ 円板から半球へ',
      lead: 'ふちの円（オレンジ）を変えずに、面を平らな円板から半球へふくらませます。$\\mathrm{rot}\\,\\vec F$ が面をつらぬく量は変わるでしょうか。図はドラッグで回せます。',
      note: '$\\vec F=(-y,\\ x,\\ 0)$ の回転はどこでも $(0,\\ 0,\\ 2)$ です。面のタイルごとの「回転×面」の合計は、ふくらませても $2\\pi$ のままで、ふちの1周 $\\oint\\vec F\\cdot\\mathrm d\\vec r=2\\pi$ と同じです。ふちが同じなら、計算が楽な平らな円板を選べます（S5）。',
      legend: [['ふちの円（左回り）', { color: 'b' }], ['面のタイル', { color: 'a' }], ['回転の矢印 $(0,\\ 0,\\ 2)$', { color: 'c', style: 'long' }]],
      controls: [{ range: 's', label: 'ふくらませる', min: 0, max: 1, step: 0.01, fmt: v => v < 0.005 ? '円板' : v > 0.995 ? '半球' : A.num(v, 2) }, { range: 'm', label: 'タイルの細かさ', min: 2, max: 8, step: 1, d: 0 }],
      drag: A.rotDrag([0, 0, 880, 440]),
      step(st, dt) { st.s = Math.min(1, st.s + dt * 0.3); if (st.s >= 1) return false; },
      draw(cv, st) { drawDome(cv, st); },
      readout: st => { const f = domeFlux(st); return `タイル ${4 * st.m * st.m} まいの「回転×面」の合計 ＝ ${A.num(f, 4)}　　ふちの1周 ＝ 2π ＝ ${A.num(2 * Math.PI, 4)}`; }
    }
  ]
});

// 辺の一覧：各マスの4辺を、マスの左回りの向きで。中の辺は2回（逆向き）出てくる
function cellsOf(n) { const h = 1 / n, out = []; for (let i = 0; i < 3 * n; i++) for (let j = 0; j < 2 * n; j++) out.push([i * h, (i + 1) * h, j * h, (j + 1) * h]); return out; }
function isOuter(x0, y0, x1, y1) { return (x0 === x1 && (Math.abs(x0) < 1e-9 || Math.abs(x0 - 3) < 1e-9)) || (y0 === y1 && (Math.abs(y0) < 1e-9 || Math.abs(y0 - 2) < 1e-9)); }
function sums(st, mode) {
  const cs = cellsOf(st.n); let cells = 0;
  if (mode === 'rot') { const F = ROT_F[st.f]; for (const [a, b, c, d] of cs) cells += F.cell(a, b, c, d); const o = [[0, 0, 3, 0], [3, 0, 3, 2], [3, 2, 0, 2], [0, 2, 0, 0]].reduce((s, e) => s + F.edge(...e), 0); return { cells, outer: o, N: cs.length }; }
  for (const [a, b, c, d] of cs) cells += (b * b - a * a) * (d - c) + (d - c) * (b - a);   // 右−左＋上−下
  return { cells, outer: 9 * 2 + 2 * 3, N: cs.length };                                     // 右のふち 18、上のふち 6
}

function drawGrid(cv, st, mode) {
  const v = cv.view({ x0: -0.3, x1: 3.3, y0: -0.3, y1: 2.3, box: [20, 20, 560, 400], equal: true });
  const n = st.n, h = 1 / n, cs = cellsOf(n), p = st.p, sc = v.sx * h;
  const F = ROT_F[st.f];
  // マスの色：その値の大きさ
  for (const [a, b, c, d] of cs) {
    const val = mode === 'rot' ? F.cell(a, b, c, d) : (b * b - a * a) * (d - c) + (d - c) * (b - a);
    v.poly([[a, c], [b, c], [b, d], [a, d]], { fill: 'a', alpha: Math.min(0.35, 0.04 + 0.35 * val / (mode === 'rot' ? (st.f === 'x2' ? 5 * h * h * n : 2 * h * h) : 6 * h * h * n + 0.01)) * (1 - p * 0.7), color: 'line', width: 1 });
    if (n <= 2 && p < 0.6) v.text(A.num(val, n === 1 ? 0 : 2), (a + b) / 2, (c + d) / 2, { align: 'center', size: n === 1 ? 18 : 15, bold: true, alpha: 1 });
  }
  // 各マスの辺の小さな矢印
  const ins = 0.16 * h, len = 0.42 * h;
  for (const [a, b, c, d] of cs) {
    const edges = [[a, c, b, c], [b, c, b, d], [b, d, a, d], [a, d, a, c]];   // 下・右・上・左（左回り）
    for (const e of edges) {
      const [x0, y0, x1, y1] = e, outer = isOuter(x0, y0, x1, y1);
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, tx = Math.sign(x1 - x0), ty = Math.sign(y1 - y0);
      const nx = ty, ny = -tx;   // 外向きの法線（左回りの辺の右側）
      let alpha = outer ? 1 : 1 - p, col = outer && p > 0.5 ? 'b' : 'sub', w = outer && p > 0.5 ? 3 : 2;
      if (mode === 'rot') {
        const ax = mx - nx * ins, ay = my - ny * ins;
        v.arrow(ax - tx * len / 2, ay - ty * len / 2, ax + tx * len / 2, ay + ty * len / 2, { color: col, width: w, alpha, head: Math.max(7, sc * 0.18), style: outer ? 'solid' : (p > 0.05 ? 'dot' : 'solid') });
      } else {
        const ax = mx, ay = my, L2 = 0.3 * h;
        v.arrow(ax - nx * L2 * 0.2, ay - ny * L2 * 0.2, ax + nx * L2, ay + ny * L2, { color: col, width: w, alpha, head: Math.max(7, sc * 0.16), style: outer ? 'solid' : (p > 0.05 ? 'dot' : 'solid') });
      }
    }
  }
  // 外のふち
  v.line([[0, 0], [3, 0], [3, 2], [0, 2]], { color: 'b', width: 1 + 2.5 * p, close: true, alpha: 0.3 + 0.7 * p });
  v.text('0', -0.12, -0.15, { size: 15, color: 'sub' }); v.text('3', 3, -0.17, { size: 15, color: 'sub', align: 'center' }); v.text('2', -0.12, 2, { size: 15, color: 'sub', align: 'right' });
  v.text('x', 3.25, -0.17, { size: 15, color: 'sub', italic: true, math: true }); v.text('y', -0.12, 2.22, { size: 15, color: 'sub', italic: true, math: true });
  // 右：合計の棒
  const t = sums(st, mode), X = 640, Y0 = 380, Hm = 300 / Math.max(t.cells, t.outer);
  cv.text(mode === 'rot' ? '中のマスの合計' : '中のマスの合計', X + 20, 40, { align: 'center', size: 15 });
  cv.text('外のふち', X + 150, 40, { align: 'center', size: 15 });
  const shown = t.cells * Math.min(1, 0.15 + p);
  cv.rect(X - 10, Y0 - shown * Hm, 60, shown * Hm, { fill: 'a', alpha: 0.45, color: 'a', width: 2 });
  cv.rect(X + 120, Y0 - t.outer * Hm, 60, t.outer * Hm, { fill: 'b', alpha: 0.35, color: 'b', width: 2, style: 'dash' });
  cv.line([[X - 30, Y0], [X + 200, Y0]], { color: 'sub', width: 1.5 });
  cv.text(A.num(shown, 1), X + 20, Y0 - shown * Hm - 14, { align: 'center', size: 17, bold: true });
  cv.text(A.num(t.outer, 1), X + 150, Y0 - t.outer * Hm - 14, { align: 'center', size: 17, bold: true });
  cv.text(p >= 1 ? '同じ！' : '▶ でたし合わせる', X + 85, 412, { align: 'center', size: 16, bold: p >= 1, color: p >= 1 ? 'c' : 'sub' });
}

// 面 z = s√(1−r²)（ふちは半径1の円）を、m×4m のタイルに分ける
function ringR(i, m) { return Math.sin(i / m * Math.PI / 2); }   // 輪の半径（半球の上で同じ角ずつ）
function domeZ(st, r) { return st.s * Math.sqrt(Math.max(0, 1 - r * r)); }
function domeFlux(st) {   // rot F·n dS ＝ 2 ×（タイルを xy 平面へ落とした影の面積）。影はおうぎ形の一部で (r2²−r1²)/2·Δθ
  const m = st.m, M = 4 * m; let sum = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < M; j++) sum += 2 * (ringR(i + 1, m) ** 2 - ringR(i, m) ** 2) / 2 * (2 * Math.PI / M);
  return sum;
}
function drawDome(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 150, center: [0, 0, 0.35] });
  V.axes3({ len: 1.5 });
  const m = st.m, M = 4 * m;
  for (let i = 0; i < m; i++) for (let j = 0; j < M; j++) {
    const P = (ri, tj) => { const r = ringR(ri, m), t = tj / M * 2 * Math.PI; return [r * Math.cos(t), r * Math.sin(t), domeZ(st, r)]; };
    V.poly3([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], { fill: 'a', alpha: 0.16, color: 'a', width: 0.8 });
  }
  const ring = []; for (let k = 0; k <= 72; k++) { const t = k / 72 * 2 * Math.PI; ring.push([Math.cos(t), Math.sin(t), 0]); }
  V.line3(ring, { color: 'b', width: 4, zbias: 0.2 });
  for (const t0 of [0.3, 0.3 + 2 * Math.PI / 3, 0.3 + 4 * Math.PI / 3]) V.arrow3([Math.cos(t0), Math.sin(t0), 0], [Math.cos(t0 + 0.25), Math.sin(t0 + 0.25), 0], { color: 'b', width: 4, head: 14, zbias: 0.3 });
  for (const [x, y] of [[0, 0], [0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) { const z = domeZ(st, Math.hypot(x, y)); V.arrow3([x, y, z], [x, y, z + 0.45], { color: 'c', width: 2.5, style: 'long', head: 10 }); }
  V.text3('ふちの円', [1.05, -0.35, 0], { size: 15, color: 'b', bold: true });
  V.flush();
}
