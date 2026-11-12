// @id m4-16
// @title 風車を流れにのせる：回転とうずなし流れ
// @vol 数学8
// @from 数学 8-10 図1・2・8・9・10（ch8-10:253・280・595）／8-11・物理 電-6・力-15 でも使う
'use strict';
// 主役の6つの場（8-5・8-10②）。rot は平面の回転 ∂Fy/∂x − ∂Fx/∂y。風車の角速度は rot の半分（8-10⑦）
const FIELDS = {
  a: { s: 'ア 広がる', name: '（ア）広がる (x, y)', F: (x, y) => [x, y], rot: 0 },
  i: { s: 'イ 集まる', name: '（イ）集まる (−x, −y)', F: (x, y) => [-x, -y], rot: 0 },
  u: { s: 'ウ そろった', name: '（ウ）そろった (1, 0)', F: () => [1, 0], rot: 0 },
  e: { s: 'エ うず', name: '（エ）うず (−y, x)', F: (x, y) => [-y, x], rot: 2 },
  o: { s: 'オ ずれ', name: '（オ）ずれ (y, 0)', F: (x, y) => [y, 0], rot: -1 },
  k: { s: 'カ 側溝', name: '（カ）側溝 (x, 0)', F: x => [x, 0], rot: 0 }
};
const FKEYS = ['a', 'i', 'u', 'e', 'o', 'k'];
const turnName = w => Math.abs(w) < 1e-9 ? '回らない' : (w > 0 ? '左回り' : '右回り');

A.item({
  id: 'm4-16', title: '風車を流れにのせる：回転とうずなし流れ',
  from: '数学 第8巻 8-10 図1・2・8・9・10 から（8-11、物理 電-6・力-15 でも使う）',
  W: 880, H: 440,
  state: { f: 'e', px: 1.5, py: 1.5, phi: 0, t: 0, yb: 0.6, xs: 0, kind: 'cup', psi: 0, phi2: 0 },
  scenes: [
    {
      key: 'roku', label: '① 6つの場に置く',
      lead: '右上（$x=1.5$、$y=1.5$）に置いた風車を流れにのせます。流されながら回るのはどの場でしょう。風車はドラッグで動かせます。',
      note: '風車が回るかどうかは、流れの向きではなく、**羽根の両側の速さのちがい**で決まります。右の大きな図の赤い矢印は、まん中からみた羽根の先の速さ（となりとのちがい）です。回るのは（エ）と（オ）だけで、角速度は回転 rot の半分です。',
      miss: '「まっすぐな流れは回転が0」ではありません。（オ）$(y,\\ 0)$ はまっすぐ右へ流れますが、上ほど速いので、回転は $-1$（右回り）です。',
      legend: [['流れの矢印', { color: 'a' }], ['風車（■の羽根が印）', { color: 'ink' }], ['羽根の先の、まん中とのちがい', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'f', label: '場', options: FKEYS.map(k => [k, FIELDS[k].s]), on: st => { st.px = 1.5; st.py = 1.5; st.phi = 0; } }],
      step(st, dt) {
        const fd = FIELDS[st.f], h = dt * 0.5, [vx, vy] = fd.F(st.px, st.py);
        st.px += vx * h; st.py += vy * h; st.phi += fd.rot / 2 * h;
        if (Math.abs(st.px) > 2.3 || Math.abs(st.py) > 2.3 || Math.hypot(st.px, st.py) < 0.15) { st.px = 1.5; st.py = 1.5; st.phi = 0; }
      },
      drag: {
        hit(st, x, y) { return x < 450 ? 'm' : null; },
        move(st, x, y) { const v = fieldView(); const [a, b] = v.inv(x, y); st.px = A.clamp(a, -2.2, 2.2); st.py = A.clamp(b, -2.2, 2.2); st.phi = 0; }
      },
      draw(cv, st) { drawRoku(cv, st); },
      readout: st => { const fd = FIELDS[st.f]; return `${fd.name}　回転 rot ＝ ${A.num(fd.rot, 0)}　風車の角速度 ＝ ${A.num(fd.rot / 2, 1)}（${turnName(fd.rot)}）`; }
    },
    {
      key: 'yousui', label: '② 用水路',
      lead: '用水路 $\\vec v=(1-y^2,\\ 0)$ に、3つの風車 A・B・C をうかべます。まん中ほど速く、岸で0の流れです。',
      note: '回転は $2y$ です。まん中の A は回らず、北の岸に近い B は左回り、南の岸に近い C は右回りです。岸に近いほど、速さのグラフ（右）の傾きが急で、よく回ります。',
      legend: [['流れの矢印', { color: 'a' }], ['速さのグラフ $v_x=1-y^2$', { color: 'a', style: 'solid' }], ['風車 B の所の傾き', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'yb', label: 'B の場所 $y$〔m〕（C は $-y$）', min: 0.1, max: 0.9, step: 0.05, d: 2 }],
      step(st, dt) { st.t += dt * 0.8; },
      draw(cv, st) { drawYousui(cv, st); },
      readout: st => `B（$y=${A.num(st.yb)}$）：回転 ${A.num(2 * st.yb)}、角速度 ${A.num(st.yb)} rad/s（左回り）　C：角速度 ${A.num(st.yb)} rad/s（右回り）　A：0`
    },
    {
      key: 'uzunashi', label: '③ うずなし流れ',
      lead: '風車を、円にそって1周させます。コップごと回す流れと、排水口のような「うずなし流れ」で、印の羽根の向きをくらべましょう。',
      note: 'うずなし流れ $\\vec v=k\\dfrac{(-y,\\ x)}{x^2+y^2}$ では、風車はぐるっと回っていきますが、**印の向きは変わりません**。おうぎ形のマスで、外の弧は長いけれどおそく、内の弧は短いけれど速いので、「速さ×長さ」がどちらも $k\\Delta\\theta$ で打ち消し、循環は0です。',
      miss: 'ぐるぐる回る流れでも、回転があるとはかぎりません。うずなし流れの回転は、中心以外では0です（風車は向きを変えない）。',
      legend: [['流れの矢印', { color: 'a' }], ['いまの風車', { color: 'ink' }], ['少し前の風車', { color: 'sub', style: 'dot' }], ['おうぎ形のマス', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'kind', label: '流れ', options: [['cup', 'コップごと回す $\\omega(-y,\\ x)$'], ['free', 'うずなし $k(-y,\\ x)/r^2$']], on: st => { st.psi = 0; st.phi2 = 0; } }],
      step(st, dt) {
        const R = 1.4, w = 0.6;
        st.psi += w * dt;                                   // どちらも、半径 R の所の速さは同じ R·ω
        if (st.kind === 'cup') st.phi2 += w * dt;            // 回転 2ω → 風車の角速度 ω
        if (st.psi > 2 * Math.PI) { st.psi -= 2 * Math.PI; st.phi2 = st.kind === 'cup' ? st.psi : 0; }
        void R;
      },
      draw(cv, st) { drawUzunashi(cv, st); },
      readout: st => st.kind === 'cup'
        ? 'コップごと回す流れ：外の弧 $r_2\\omega\\times r_2\\Delta\\theta$ ＞ 内の弧 $r_1\\omega\\times r_1\\Delta\\theta$ → 循環は正（風車は1周で1回転）'
        : 'うずなし流れ：外の弧 $\\frac{k}{r_2}\\times r_2\\Delta\\theta=k\\Delta\\theta$、内の弧 $\\frac{k}{r_1}\\times r_1\\Delta\\theta=k\\Delta\\theta$ → 循環は0（印の向きは変わらない）'
    }
  ]
});

function fieldView(cv) { return new A.View(cv || { W: 880, H: 440 }, { x0: -2.4, x1: 2.4, y0: -2.4, y1: 2.4, box: [16, 12, 420, 416], equal: true }); }

// 矢印の場：格子の点に、場の矢印をかく（長さは k 倍、上限 0.42）
function arrows(v, F, pts, k, skip) {
  for (const [x, y] of pts) {
    if (skip && skip(x, y)) continue;
    let [a, b] = F(x, y); const L = Math.hypot(a, b); if (L < 1e-9) { v.dot(x, y, { color: 'a', r: 2 }); continue; }
    const s = Math.min(k, 0.42 / L); a *= s; b *= s;
    v.arrow(x - a / 2, y - b / 2, x + a / 2, y + b / 2, { color: 'a', width: 1.6, head: 8, alpha: 0.75 });
  }
}
// 風車：中心 (px,py)、半径 r（画面のピクセル）、角 phi。印の羽根には ■
function mill(cv, X, Y, r, phi, o = {}) {
  const col = o.color || 'ink';
  for (let k = 0; k < 4; k++) {
    const a = phi + k * Math.PI / 2, ex = X + r * Math.cos(a), ey = Y - r * Math.sin(a);
    cv.line([[X, Y], [ex, ey]], { color: col, width: o.width || 3, style: o.style, alpha: o.alpha });
    if (k === 0) cv.dot(ex, ey, { color: o.markColor || 'b', shape: 'square', r: o.mr || 5 });
  }
  cv.dot(X, Y, { color: col, r: 3 });
}
function grid(a, b, s) { const p = []; for (let x = a; x <= b + 1e-9; x += s) for (let y = a; y <= b + 1e-9; y += s) p.push([+x.toFixed(3), +y.toFixed(3)]); return p; }

function drawRoku(cv, st) {
  const fd = FIELDS[st.f], v = fieldView(cv);
  v.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x', yl: 'y', grid: false });
  arrows(v, fd.F, grid(-2, 2, 0.5), 0.3, (x, y) => Math.hypot(x - st.px, y - st.py) < 0.45);
  mill(cv, v.X(st.px), v.Y(st.py), 0.42 * v.sx, st.phi);
  // 右：風車を大きく。羽根の先の速さから、まん中の速さをひいたもの
  const cx = 660, cy = 210, R = 120;
  cv.text('風車を大きく見ると', cx, 32, { align: 'center', size: 16, bold: true });
  cv.circle(cx, cy, R + 34, { color: 'grid', width: 1 });
  mill(cv, cx, cy, R, st.phi, { width: 4, mr: 7 });
  const [v0x, v0y] = fd.F(st.px, st.py);
  const d = 0.42;  // 実際の羽根の長さ
  for (let k = 0; k < 4; k++) {
    const a = st.phi + k * Math.PI / 2, tx = st.px + d * Math.cos(a), ty = st.py + d * Math.sin(a);
    const [vx, vy] = fd.F(tx, ty), rx = (vx - v0x) / d, ry = (vy - v0y) / d;   // 単位の長さあたり
    const ex = cx + R * Math.cos(a), ey = cy - R * Math.sin(a);
    if (Math.hypot(rx, ry) > 1e-6) cv.arrow(ex, ey, ex + rx * 55, ey - ry * 55, { color: 'b', width: 3, style: 'dash', head: 11 });
  }
  const w = fd.rot / 2;
  if (Math.abs(w) > 0) {
    const a0 = w > 0 ? -0.3 : 0.3, pts = []; for (let k = 0; k <= 30; k++) { const u = a0 + (w > 0 ? 1 : -1) * 1.2 * k / 30; pts.push([cx + (R + 22) * Math.cos(u), cy - (R + 22) * Math.sin(u)]); }
    cv.line(pts, { color: 'd', width: 2.5 }); const p1 = pts[pts.length - 2], p2 = pts[pts.length - 1]; cv.arrow(p1[0], p1[1], p2[0], p2[1], { color: 'd', width: 2.5, head: 12 });
  }
  cv.text(turnName(fd.rot), cx, 410, { align: 'center', size: 18, bold: true, color: Math.abs(w) > 0 ? 'd' : 'sub' });
}

function drawYousui(cv, st) {
  const v = cv.view({ x0: 0, x1: 8, y0: -1.25, y1: 1.25, box: [16, 30, 560, 380] });
  v.poly([[0, 1], [8, 1], [8, 1.25], [0, 1.25]], { fill: 'e', alpha: 0.25 });
  v.poly([[0, -1], [8, -1], [8, -1.25], [0, -1.25]], { fill: 'e', alpha: 0.25 });
  v.line([[0, 1], [8, 1]], { color: 'e', width: 2 }); v.line([[0, -1], [8, -1]], { color: 'e', width: 2 });
  v.text('北の岸 y = 1', 0.1, 1.13, { size: 15, color: 'sub' }); v.text('南の岸 y = −1', 0.1, -1.13, { size: 15, color: 'sub' });
  for (let x = 0.5; x < 8; x += 1) for (let y = -0.8; y <= 0.81; y += 0.4) { const L = (1 - y * y) * 0.85; v.arrow(x - L / 2, y, x + L / 2, y, { color: 'a', width: 1.6, head: 8, alpha: 0.6 }); }
  const ms = [['A', 0], ['B', st.yb], ['C', -st.yb]];
  for (const [nm, y] of ms) {
    const x = ((0.8 + st.t * (1 - y * y)) % 8 + 8) % 8, phi = y * st.t;   // 角速度 ＝ rot/2 ＝ y
    mill(cv, v.X(x), v.Y(y), 26, phi, { width: 3 });
    v.text(nm, x, y + 0.27, { align: 'center', bold: true, size: 16, bg: true });
  }
  // 右：速さのグラフ（たてが y）
  const g = cv.view({ x0: 0, x1: 1.2, y0: -1.25, y1: 1.25, box: [640, 30, 220, 380] });
  g.axes({ xt: [0.5, 1], yt: [-1, 1], xl: 'vx', yl: 'y' });
  g.param(y => 1 - y * y, y => y, -1, 1, { color: 'a', width: 3 });
  const y = st.yb, x = 1 - y * y, s = -2 * y;    // dx/dy
  g.line([[x - s * 0.25, y - 0.25], [x + s * 0.25, y + 0.25]], { color: 'b', width: 2.5, style: 'dash' });
  g.dot(x, y, { color: 'b', r: 6, shape: 'square' }); g.text('B', x + 0.06, y + 0.12, { bold: true });
  g.dot(1, 0, { color: 'ink', r: 5 }); g.text('A', 0.9, -0.14, { bold: true, align: 'right' });
}

function drawUzunashi(cv, st) {
  const v = cv.view({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2, box: [16, 12, 470, 416], equal: true });
  const cup = st.kind === 'cup', R = 1.4, w = 0.6, k = w * R * R;
  const F = cup ? (x, y) => [-w * y, w * x] : (x, y) => { const r2 = x * x + y * y; return [-k * y / r2, k * x / r2]; };
  arrows(v, F, grid(-2, 2, 0.5), 0.45, (x, y) => Math.hypot(x, y) < 0.3);
  v.dot(0, 0, { color: 'ink', r: 4 });
  v.circle(0, 0, R, { color: 'sub', width: 1.2, style: 'dot' });
  for (let j = 1; j <= 3; j++) { const ps = st.psi - j * Math.PI / 2; if (ps < 0) continue; const ph = cup ? st.phi2 - j * Math.PI / 2 + Math.PI : Math.PI / 2; mill(cv, v.X(R * Math.cos(ps)), v.Y(R * Math.sin(ps)), 0.32 * v.sx, ph, { color: 'sub', width: 2, style: 'dot', markColor: 'sub', mr: 4 }); }
  mill(cv, v.X(R * Math.cos(st.psi)), v.Y(R * Math.sin(st.psi)), 0.32 * v.sx, cup ? st.phi2 + Math.PI : Math.PI / 2, { width: 3.5, mr: 6 });
  // 右：おうぎ形のマスと、2つの弧の「速さ×長さ」
  const g = cv.view({ x0: -0.2, x1: 2.4, y0: -0.2, y1: 2.0, box: [520, 30, 340, 300], equal: true });
  const r1 = 1, r2 = 2, a0 = 10 * Math.PI / 180, a1 = 50 * Math.PI / 180, arc = (r, s, e) => { const p = []; for (let j = 0; j <= 30; j++) { const u = s + (e - s) * j / 30; p.push([r * Math.cos(u), r * Math.sin(u)]); } return p; };
  g.poly([...arc(r1, a0, a1), ...arc(r2, a1, a0)], { fill: 'b', alpha: 0.12, color: 'b', style: 'dash', width: 2 });
  g.dot(0, 0, { color: 'ink', r: 4 }); g.text('中心', 0.05, -0.12, { size: 15 });
  const sp = r => cup ? w * r : k / r;
  const wa = r => Math.max(1.5, sp(r) * 3.2);
  g.line(arc(r2, a0 + 0.08, a1 - 0.08), { color: 'd', width: wa(r2) }); g.line(arc(r1, a1 - 0.08, a0 + 0.08), { color: 'd', width: wa(r1), style: 'dash' });
  const e2 = arc(r2, a1 - 0.2, a1 - 0.08), e1 = arc(r1, a0 + 0.2, a0 + 0.08);
  g.arrow(e2[0][0], e2[0][1], e2[30][0], e2[30][1], { color: 'd', width: 2.5, head: 12 }); g.arrow(e1[0][0], e1[0][1], e1[30][0], e1[30][1], { color: 'd', width: 2.5, head: 12 });
  g.text('外の弧', 2.0 * Math.cos(0.6) + 0.1, 2.0 * Math.sin(0.6) + 0.15, { size: 15 });
  g.text('内の弧', 0.5, 0.62, { size: 15, align: 'right' });
  const dth = a1 - a0, outv = sp(r2) * r2 * dth, inv = sp(r1) * r1 * dth;
  cv.text(`外の弧：速さ ${A.num(sp(r2))} × 長さ ${A.num(r2 * dth)} ＝ ${A.num(outv, 3)}`, 530, 352, { size: 15 });
  cv.text(`内の弧：速さ ${A.num(sp(r1))} × 長さ ${A.num(r1 * dth)} ＝ ${A.num(inv, 3)}`, 530, 378, { size: 15 });
  cv.text(`循環 ＝ ${A.num(outv - inv, 3)}`, 530, 408, { size: 17, bold: true, color: Math.abs(outv - inv) < 1e-9 ? 'c' : 'd' });
}
