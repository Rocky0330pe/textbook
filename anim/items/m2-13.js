// @id m2-13
// @title ロボットのうで：角度と手の位置
// @vol 数学4
// @from 数学 4-0 ③④（ch4-00:276・335）、4-7 ⑥（ch4-07:556）／4-6・4-11・4-14、力-7、7-6 でも使う
'use strict';
const D2R = Math.PI / 180;
A.item({
  id: 'm2-13', title: 'ロボットのうで：角度と手の位置',
  from: '数学 第4巻 4-0 ③④「ロボットのうでの2つの問題」、4-7 ⑥「順運動学と逆運動学」の図から（4-6・4-11・4-14、物理 力-7 でも使う）',
  W: 880, H: 440,
  state: { t1: 30, t2: 60, tx: 25.98, ty: 35, trail: [], u: 0 },
  scenes: [
    {
      key: 'jun', label: '① 角度 → 手の位置',
      lead: '肩の角とひじの角を決めると、手の位置はいつも1つに決まります（順運動学）。▶ で2つの角を動かしてみましょう。',
      note: '前うでの向きは、肩の角とひじの角をたした角 $\\theta_1+\\theta_2$ です。手の位置は $x=30\\cos\\theta_1+20\\cos(\\theta_1+\\theta_2)$、$y=30\\sin\\theta_1+20\\sin(\\theta_1+\\theta_2)$ で、1つに決まります。',
      legend: [['上うで（30 cm）', { color: 'a' }], ['前うで（20 cm）', { color: 'b' }], ['上うでの向き（ひじの角をはかる線）', { color: 'sub', style: 'dash' }], ['手の通ったあと', { color: 'c', style: 'dot' }]],
      controls: [
        { range: 't1', label: '肩の角 $\\theta_1$', min: 0, max: 180, step: 1, fmt: v => v + '°', on: st => { st.trail = []; } },
        { range: 't2', label: 'ひじの角 $\\theta_2$', min: -150, max: 150, step: 1, fmt: v => A.num(v, 0) + '°', on: st => { st.trail = []; } },
        { button: 'A（30°・60°）', act: st => { st.t1 = 30; st.t2 = 60; st.trail = []; } },
        { button: 'B（60°・60°）', act: st => { st.t1 = 60; st.t2 = 60; st.trail = []; } },
        { button: 'C（30°・0°）', act: st => { st.t1 = 30; st.t2 = 0; st.trail = []; } }
      ],
      init(st) { st.trail = []; st.u = 0; },
      step(st, dt) {
        st.u += dt;
        st.t1 = Math.round(60 + 40 * Math.sin(st.u * 0.7));
        st.t2 = Math.round(50 * Math.sin(st.u * 1.3) + 30);
        const h = fk(30, 20, st.t1, st.t2);
        st.trail.push([+h.P[0].toFixed(2), +h.P[1].toFixed(2)]);
        if (st.trail.length > 600) st.trail.shift();
      },
      draw(cv, st) { drawJun(cv, st); },
      readout: st => { const h = fk(30, 20, st.t1, st.t2); return `手の位置 $(x,\\ y)$ ＝ (${A.num(h.P[0], 1)}, ${A.num(h.P[1], 1)})　　前うでの向き $\\theta_1+\\theta_2$ ＝ ${A.num(st.t1 + st.t2, 0)}°`; }
    },
    {
      key: 'gyaku', label: '② 手の位置 → 角度',
      lead: '黒い点（手を置きたい所）をドラッグしてみましょう。同じ点に、ひじが下の形とひじが上の形の2通りで届きます（逆運動学）。',
      note: '緑の輪の中なら答えは2通り、輪のふち（うでをのばしきる・いちばん折りたたむ）では1通り、輪の外と、肩に近すぎる所では答えがありません（0通り）。外側の円は半径 $30+20=50$、内側の円は半径 $30-20=10$ です。',
      miss: '逆運動学の答えは、いつも1つとはかぎりません。2つ・1つ・0のことがあります。2つの形は、肩と手を結ぶ線をはさんで、鏡に映したような形です。',
      legend: [['ひじが下（ひじの角が正）', { color: 'a' }], ['ひじが上（ひじの角が負）', { color: 'b', style: 'dash' }], ['手が届く所', { color: 'c' }], ['手を置きたい点', { color: 'ink', shape: 'circle', noline: true }]],
      state: { tx: 25.98, ty: 35 },
      controls: [
        { button: 'A の手の位置', act: st => { st.tx = 25.98; st.ty = 35; } },
        { button: '(50, 15)：遠すぎる', act: st => { st.tx = 50; st.ty = 15; } },
        { button: '(5, 5)：近すぎる', act: st => { st.tx = 5; st.ty = 5; } }
      ],
      init(st) { st.u = 0; },
      step(st, dt) { st.u += dt * 0.45; st.tx = 18 + 34 * Math.cos(st.u); st.ty = 20 + 24 * Math.sin(st.u); },
      drag: {
        hit(st, x, y) { const v = viewG(); return A.near(x, y, v.X(st.tx), v.Y(st.ty), 30) || v.inside(x, y) ? 'p' : null; },
        move(st, x, y) { const v = viewG(); const p = v.inv(x, y); st.tx = A.clamp(+p[0].toFixed(1), -58, 58); st.ty = A.clamp(+p[1].toFixed(1), -12, 58); }
      },
      draw(cv, st) { drawGyaku(cv, st); },
      readout: st => {
        const s = ik(30, 20, st.tx, st.ty);
        if (s.n === 0) return `点 (${A.num(st.tx, 1)}, ${A.num(st.ty, 1)}) は肩から ${A.num(s.d, 1)} cm：<b>届かない（答えは0）</b>`;
        if (s.n === 1) return `肩から ${A.num(s.d, 1)} cm：<b>答えは1通り</b>（肩 ${A.num(s.a[0], 1)}°・ひじ ${A.num(s.a[1], 1)}°）`;
        return `<b>答えは2通り</b>：肩 ${A.num(s.a[0], 1)}°・ひじ ${A.num(s.a[1], 1)}°　と　肩 ${A.num(s.b[0], 1)}°・ひじ ${A.num(s.b[1], 1)}°`;
      }
    },
    {
      key: 'sankaku', label: '③ 三角形で角を求める',
      lead: '4-7 のうで（上うで 40、前うで 30）です。肩O・ひじE・手P の三角形の3辺から、余弦定理で角を求めます。点Pをドラッグしてみましょう。',
      note: '① $d=\\sqrt{x^2+y^2}$　② 余弦定理で $\\angle\\mathrm{OEP}$ を求め、$\\theta_2=180°-\\angle\\mathrm{OEP}$　③ $\\alpha$（OP と $x$ 軸の角）と $\\beta$（OE と OP の角）から $\\theta_1=\\alpha-\\beta$。ひじを上にする形なら $\\theta_1=\\alpha+\\beta$ です。',
      legend: [['うで（ひじが下）', { color: 'a' }], ['ひじが上の形', { color: 'sub', style: 'dash' }], ['OP の長さ $d$', { color: 'b', style: 'dash' }], ['三角形 OEP', { color: 'e' }]],
      state: { tx: 40, ty: 30 },
      controls: [{ button: '本の例 (40, 30)', act: st => { st.tx = 40; st.ty = 30; } }],
      drag: {
        hit(st, x, y) { const v = viewS(); return A.near(x, y, v.X(st.tx), v.Y(st.ty), 30) || v.inside(x, y) ? 'p' : null; },
        move(st, x, y) { const v = viewS(); const p = v.inv(x, y); st.tx = A.clamp(+p[0].toFixed(1), -5, 72); st.ty = A.clamp(+p[1].toFixed(1), -5, 72); }
      },
      draw(cv, st) { drawSankaku(cv, st); },
      readout: st => { const s = ik(40, 30, st.tx, st.ty); return s.n === 0 ? `$d$ ＝ ${A.num(s.d, 1)}：届かない` : `$\\theta_1$ ＝ ${A.num(s.a[0], 1)}°、$\\theta_2$ ＝ ${A.num(s.a[1], 1)}°（もう1つの答え：$\\theta_1$ ＝ ${A.num(s.b[0], 1)}°、$\\theta_2$ ＝ ${A.num(s.b[1], 1)}°）`; }
    }
  ]
});

// 順運動学：角は度
function fk(L1, L2, t1, t2) {
  const E = [L1 * Math.cos(t1 * D2R), L1 * Math.sin(t1 * D2R)];
  return { E, P: [E[0] + L2 * Math.cos((t1 + t2) * D2R), E[1] + L2 * Math.sin((t1 + t2) * D2R)] };
}
// 逆運動学：a＝ひじが下（θ2>0、θ1＝α−β）、b＝ひじが上（θ2<0、θ1＝α+β）
function ik(L1, L2, x, y) {
  const d = Math.hypot(x, y), al = Math.atan2(y, x) / D2R;
  if (d > L1 + L2 + 1e-6 || d < Math.abs(L1 - L2) - 1e-6 || d < 1e-9) return { n: 0, d, al };
  const cE = A.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1), E = Math.acos(cE) / D2R;
  const cB = A.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), be = Math.acos(cB) / D2R;
  const t2 = 180 - E;
  const n = (Math.abs(d - (L1 + L2)) < 0.3 || Math.abs(d - Math.abs(L1 - L2)) < 0.3) ? 1 : 2;
  return { n, d, al, be, E, a: [al - be, t2], b: [al + be, -t2] };
}
function arcW(v, cx, cy, r, a0, a1, o) {
  const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 3)), pts = [];
  for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * D2R; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  v.line(pts, o);
}
function arm(v, L1, L2, t1, t2, o) {
  const h = fk(L1, L2, t1, t2), w = o.width || 7;
  v.line([[0, 0], h.E], { color: o.c1 || 'a', width: w, style: o.style, alpha: o.alpha });
  v.line([h.E, h.P], { color: o.c2 || 'b', width: w * 0.85, style: o.style, alpha: o.alpha });
  if (!o.thin) { v.dot(h.E[0], h.E[1], { r: 6, color: 'ink', open: true }); }
  return h;
}
function grid(v, x0, x1, y0, y1, step) {
  for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) v.line([[x, y0], [x, y1]], { color: 'grid', width: 1 });
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) v.line([[x0, y], [x1, y]], { color: 'grid', width: 1 });
}
function shoulder(cv, v) { v.dot(0, 0, { r: 8, color: 'ink', open: true }); cv.text('O（肩）', v.X(0) - 10, v.Y(0) - 16, { size: 15, color: 'sub', align: 'right' }); }
function par(v) { return v < -0.05 ? '(' + A.num(v, 1) + ')' : A.num(v, 1); }

function drawJun(cv, st) {
  const v = cv.view({ x0: -42, x1: 58, y0: -8, y1: 58, box: [20, 16, 540, 400], equal: true });
  grid(v, -40, 56, -6, 56, 10);
  v.axes({ xt: [-40, -30, -20, -10, 10, 20, 30, 40, 50], yt: [10, 20, 30, 40, 50], grid: false, xl: 'x（cm）', yl: 'y（cm）' });
  if (st.trail.length > 1) v.line(st.trail, { color: 'c', style: 'dot', width: 2.5 });
  const h = fk(30, 20, st.t1, st.t2);
  // 上うでの向き（点線）と角
  const ex = [h.E[0] + 14 * Math.cos(st.t1 * D2R), h.E[1] + 14 * Math.sin(st.t1 * D2R)];
  v.line([h.E, ex], { color: 'sub', style: 'dash', width: 1.5 });
  arcW(v, 0, 0, 7, 0, st.t1, { color: 'ink', width: 1.5 });
  if (Math.abs(st.t2) > 2) arcW(v, h.E[0], h.E[1], 6, st.t1, st.t1 + st.t2, { color: 'ink', width: 1.5 });
  arm(v, 30, 20, st.t1, st.t2, {});
  shoulder(cv, v);
  v.dot(h.P[0], h.P[1], { r: 7, color: 'ink' });
  const la = (st.t1 / 2) * D2R; v.text('θ₁', 10.5 * Math.cos(la), 10.5 * Math.sin(la), { size: 15, align: 'center', math: true, italic: true });
  const lb = (st.t1 + st.t2 / 2) * D2R; if (Math.abs(st.t2) > 8) v.text('θ₂', h.E[0] + 9.5 * Math.cos(lb), h.E[1] + 9.5 * Math.sin(lb), { size: 15, align: 'center', math: true, italic: true });
  cv.text('P（手）', v.X(h.P[0]) + 10, v.Y(h.P[1]) - 14, { size: 15, bold: true });
  // 右の欄：計算
  const c1 = Math.cos(st.t1 * D2R), c2 = Math.cos((st.t1 + st.t2) * D2R), s1 = Math.sin(st.t1 * D2R), s2 = Math.sin((st.t1 + st.t2) * D2R), ang = A.num(st.t1 + st.t2, 0);
  let y = 40; const X = 585, line = (s, o) => { cv.text(s, X, y, Object.assign({ size: 15 }, o)); y += 26; };
  line('肩の角 θ₁ ＝ ' + st.t1 + '°', { color: 'a', bold: true });
  line('ひじの角 θ₂ ＝ ' + A.num(st.t2, 0) + '°', { color: 'b', bold: true });
  line('前うでの向き ＝ ' + st.t1 + ' ＋ ' + (st.t2 < 0 ? '(' + A.num(st.t2, 0) + ')' : st.t2) + ' ＝ ' + ang + '°');
  y += 10;
  line('x ＝ 30cos' + st.t1 + '° ＋ 20cos' + ang + '°');
  line('　＝ ' + A.num(30 * c1, 1) + ' ＋ ' + par(20 * c2) + ' ＝ ' + A.num(30 * c1 + 20 * c2, 1), { bold: true });
  line('y ＝ 30sin' + st.t1 + '° ＋ 20sin' + ang + '°');
  line('　＝ ' + A.num(30 * s1, 1) + ' ＋ ' + par(20 * s2) + ' ＝ ' + A.num(30 * s1 + 20 * s2, 1), { bold: true });
  y += 10;
  line('1つめの項：肩からひじまで', { color: 'sub' });
  line('2つめの項：ひじから手まで', { color: 'sub' });
  line('方眼の1目もり＝10 cm', { color: 'sub' });
}

function viewG() { return new A.View({ W: 880, H: 440 }, { x0: -58, x1: 62, y0: -14, y1: 58, box: [20, 16, 600, 400], equal: true }); }
function drawGyaku(cv, st) {
  const v = cv.view({ x0: -58, x1: 62, y0: -14, y1: 58, box: [20, 16, 600, 400], equal: true });
  grid(v, -56, 60, -12, 56, 10);
  v.axes({ xt: [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50], yt: [10, 20, 30, 40, 50], grid: false, xl: 'x（cm）', yl: 'y' });
  // 届く所（輪）
  v.clip(() => {
    const g = cv.g; g.beginPath(); g.arc(v.X(0), v.Y(0), 50 * v.sx, 0, A.TAU); g.arc(v.X(0), v.Y(0), 10 * v.sx, 0, A.TAU, true);
    g.fillStyle = A.color('c'); g.globalAlpha = 0.13; g.fill(); g.globalAlpha = 1;
    v.circle(0, 0, 50, { color: 'c', width: 2 }); v.circle(0, 0, 10, { color: 'c', width: 2 });
  });
  cv.text('届く所', v.X(-34), v.Y(-6), { size: 15, color: 'c', bold: true, align: 'center' });
  const s = ik(30, 20, st.tx, st.ty);
  if (s.n === 0) {
    const t2 = s.d < 10 ? 180 : 0;
    const h = arm(v, 30, 20, s.al, t2, { alpha: 0.6 });
    v.line([h.P, [st.tx, st.ty]], { color: 'b', style: 'dot', width: 2 });
    const px = v.X(st.tx), py = v.Y(st.ty);
    cv.line([[px - 9, py - 9], [px + 9, py + 9]], { color: 'b', width: 3.5 }); cv.line([[px + 9, py - 9], [px - 9, py + 9]], { color: 'b', width: 3.5 });
    cv.text('届かない', px + 14, py - 14, { size: 16, bold: true, color: 'b', bg: true });
  } else {
    // 肩と手を結ぶ線（対称の軸）
    v.line([[0, 0], [st.tx, st.ty]], { color: 'sub', style: 'dot', width: 1.5 });
    arm(v, 30, 20, s.b[0], s.b[1], { c1: 'b', c2: 'b', style: 'dash', width: 5 });
    arm(v, 30, 20, s.a[0], s.a[1], { c1: 'a', c2: 'a', width: 6 });
    const ea = fk(30, 20, s.a[0], s.a[1]).E, eb = fk(30, 20, s.b[0], s.b[1]).E;
    if (s.n === 2) {
      cv.text('ひじが下', v.X(ea[0]) + 10, v.Y(ea[1]) + 16, { size: 15, color: 'a', bold: true, bg: true });
      cv.text('ひじが上', v.X(eb[0]) - 10, v.Y(eb[1]) - 16, { size: 15, color: 'b', bold: true, bg: true, align: 'right' });
    }
    v.dot(st.tx, st.ty, { r: 8, color: 'ink' });
  }
  shoulder(cv, v);
  cv.text('外側の円：半径 50', 640, 60, { size: 15, color: 'c' });
  cv.text('内側の円：半径 10', 640, 86, { size: 15, color: 'c' });
  cv.text('答えの数', 640, 130, { size: 15, bold: true });
  const nm = s.n === 2 ? '2通り' : s.n === 1 ? '1通り' : '0（届かない）';
  cv.text(nm, 640, 160, { size: 22, bold: true, color: s.n ? 'a' : 'b' });
  cv.text('肩からの距離', 640, 205, { size: 15, color: 'sub' });
  cv.text(A.num(s.d, 1) + ' cm', 640, 230, { size: 18 });
  cv.text('点をドラッグ', 640, 380, { size: 15, color: 'sub' });
}

function viewS() { return new A.View({ W: 880, H: 440 }, { x0: -18, x1: 76, y0: -12, y1: 76, box: [20, 16, 440, 400], equal: true }); }
function drawSankaku(cv, st) {
  const v = cv.view({ x0: -18, x1: 76, y0: -12, y1: 76, box: [20, 16, 440, 400], equal: true });
  grid(v, -16, 74, -10, 74, 10);
  v.axes({ xt: [10, 20, 30, 40, 50, 60, 70], yt: [10, 20, 30, 40, 50, 60, 70], grid: false, xl: 'x', yl: 'y' });
  v.circle(0, 0, 70, { color: 'c', width: 1, style: 'dash' });
  const s = ik(40, 30, st.tx, st.ty);
  const X = 480; let y = 36; const line = (t, o) => { cv.text(t, X, y, Object.assign({ size: 15 }, o)); y += 25; };
  if (s.n === 0) {
    v.dot(st.tx, st.ty, { r: 8, color: 'b', shape: 'cross' });
    line('d ＝ ' + A.num(s.d, 1) + ' は 40＋30＝70 より大きい', { color: 'b', bold: true });
    line('→ 三角形 OEP ができない（届かない）', { color: 'b' });
    shoulder(cv, v); return;
  }
  const h = fk(40, 30, s.a[0], s.a[1]), hb = fk(40, 30, s.b[0], s.b[1]);
  v.line([[0, 0], hb.E, [st.tx, st.ty]], { color: 'sub', style: 'dash', width: 3 });
  v.poly([[0, 0], h.E, [st.tx, st.ty]], { fill: 'e', alpha: 0.18 });
  v.line([[0, 0], [st.tx, st.ty]], { color: 'b', style: 'dash', width: 2.5 });
  arm(v, 40, 30, s.a[0], s.a[1], { c1: 'a', c2: 'a', width: 6 });
  arcW(v, 0, 0, 9, 0, s.al, { color: 'ink', width: 1.5 });
  if (s.be > 1) arcW(v, 0, 0, 15, s.a[0], s.al, { color: 'd', width: 2.5 });
  // ひじの所の角 OEP
  const aEO = Math.atan2(-h.E[1], -h.E[0]) / D2R, aEP = Math.atan2(st.ty - h.E[1], st.tx - h.E[0]) / D2R;
  let d0 = aEP - aEO; while (d0 > 180) d0 -= 360; while (d0 < -180) d0 += 360;
  arcW(v, h.E[0], h.E[1], 6, aEO, aEO + d0, { color: 'e', width: 2.5 });
  v.dot(st.tx, st.ty, { r: 8, color: 'ink' });
  shoulder(cv, v);
  cv.text('E（ひじ）', v.X(h.E[0]) + 10, v.Y(h.E[1]) - 16, { size: 15, bg: true });
  cv.text('P(' + A.num(st.tx, 1) + ', ' + A.num(st.ty, 1) + ')', v.X(st.tx) + 10, v.Y(st.ty) - 14, { size: 15, bold: true, bg: true });
  cv.text('α', v.X(12 * Math.cos(s.al / 2 * D2R)), v.Y(12 * Math.sin(s.al / 2 * D2R)), { size: 15, math: true, italic: true, align: 'center', bg: true });
  if (s.be > 4) { const m = (s.a[0] + s.al) / 2 * D2R; cv.text('β', v.X(19.5 * Math.cos(m)), v.Y(19.5 * Math.sin(m)), { size: 15, math: true, italic: true, color: 'd', align: 'center', bg: true }); }
  const cE = (1600 + 900 - s.d * s.d) / 2400, cB = (1600 + s.d * s.d - 900) / (80 * s.d);
  line('① d ＝ √(' + A.num(st.tx, 1) + '² ＋ ' + A.num(st.ty, 1) + '²) ＝ ' + A.num(s.d, 2), { color: 'b', bold: true });
  y += 4;
  line('② cos∠OEP ＝ (40² ＋ 30² − d²) ÷ (2×40×30)');
  line('　　＝ ' + A.num(cE, 3) + '　→ ∠OEP ＝ ' + A.num(s.E, 1) + '°', { color: 'e' });
  line('　θ₂ ＝ 180° − ' + A.num(s.E, 1) + '° ＝ ' + A.num(s.a[1], 1) + '°', { bold: true });
  y += 4;
  line('③ α ＝ ' + A.num(s.al, 1) + '°（OP と x 軸の角）');
  line('　cos β ＝ (40² ＋ d² − 30²) ÷ (2×40×d) ＝ ' + A.num(cB, 3), { color: 'd' });
  line('　β ＝ ' + A.num(s.be, 1) + '°', { color: 'd' });
  line('　θ₁ ＝ α − β ＝ ' + A.num(s.a[0], 1) + '°', { bold: true });
  y += 4;
  line('ひじが上の形：θ₁ ＝ α ＋ β ＝ ' + A.num(s.b[0], 1) + '°', { color: 'sub' });
  line('　　　　　　　θ₂ ＝ ' + A.num(s.b[1], 1) + '°', { color: 'sub' });
}
