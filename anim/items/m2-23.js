// @id m2-23
// @title 内積は影の長さ×大きさ：仕事となす角
// @vol 数学4
// @from 数学 4-12 ②④⑥（ch4-12:146・361・400）／5-12、8-7、9-2、3-15 でも使う
'use strict';
const D23 = Math.PI / 180;
A.item({
  id: 'm2-23', title: '内積は影の長さ×大きさ：仕事となす角',
  from: '数学 第4巻 4-12 ②「ななめの力の仕事」・④「内積の符号と直交」・⑥「正射影」の図から（5-12、8-7、9-2 でも使う）',
  W: 880, H: 420,
  state: { th: 60, p: 0, ax: 4, ay: 2, bx: 1, by: 3, mode: 'soroe' },
  scenes: [
    {
      key: 'shigoto', label: '① ななめの力の仕事',
      lead: 'トロッコを、レールから角 $\\theta$ ずれた向きに 40 N の力で押して、5 m 動かします。▶ で動かしてみましょう。',
      note: '前へ進めるのに働くのは、動く向きの成分 $F\\cos\\theta$ だけです。直角な成分 $F\\sin\\theta$ は、トロッコをレールに押しつけるだけ。だから仕事は $W=Fs\\cos\\theta$。90° より大きいと、力と反対の向きに動くので、仕事は負になります。',
      miss: '仕事を「力×動いた距離」だけで計算してはいけません。40 N でななめ 60° に引いて 5 m 動かしたときの仕事は、$40\\times5=200$ J ではなく、$40\\times5\\times\\cos60°=100$ J です。',
      legend: [['力 $F$', { color: 'd' }], ['動く向きの成分 $F\\cos\\theta$', { color: 'a' }], ['直角な成分 $F\\sin\\theta$', { color: 'b', style: 'dash' }], ['仕事（面積）', { color: 'c' }]],
      controls: [{ range: 'th', label: '力の角 $\\theta$', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°' }],
      init(st) { st.th = 60; st.p = 0; },
      step(st, dt) { st.p = Math.min(5, st.p + dt * 1.2); if (st.p >= 5) return false; },
      draw(cv, st) { drawW(cv, st); },
      readout: st => { const c = Math.cos(st.th * D23); return `$W$ ＝ 40 × ${A.num(st.p, 2)} × cos ${Math.round(st.th)}° ＝ <b>${A.num(40 * st.p * c, 1)} J</b>（5 m 動かすと ${A.num(200 * c, 1)} J）`; }
    },
    {
      key: 'kage', label: '② 影の長さと内積',
      lead: '矢印 $\\vec a$・$\\vec b$ の先（●）をドラッグしてみましょう。$\\vec b$ を $\\vec a$ の向きに落とした影の長さ×$|\\vec a|$ が、内積 $\\vec a\\cdot\\vec b$ です。',
      note: '$\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta=a_xb_x+a_yb_y$。影の長さは $|\\vec b|\\cos\\theta$ で、なす角が鈍角なら影は反対がわにでき、負になります。直角なら影は0で、内積も0（直交）。',
      legend: [['$\\vec a$', { color: 'a' }], ['$\\vec b$', { color: 'b', style: 'dash' }], ['$\\vec a$ の向きへの $\\vec b$ の影', { color: 'c' }], ['光の向き（$\\vec a$ に直角）', { color: 'sub', style: 'dot' }]],
      controls: [
        { button: '本の例 (4, 2)・(1, 3)', act: st => { st.ax = 4; st.ay = 2; st.bx = 1; st.by = 3; } },
        { button: '直交 (3, 4)・(−4, 3)', act: st => { st.ax = 3; st.ay = 4; st.bx = -4; st.by = 3; } }
      ],
      drag: {
        hit(st, x, y) { const v = vK(); if (A.near(x, y, v.X(st.bx), v.Y(st.by), 24)) return 'b'; if (A.near(x, y, v.X(st.ax), v.Y(st.ay), 24)) return 'a'; return null; },
        move(st, x, y, api, h) { const v = vK(), p = v.inv(x, y), q = [A.clamp(Math.round(p[0] * 2) / 2, -3.5, 6.5), A.clamp(Math.round(p[1] * 2) / 2, -2.5, 5)]; if (q[0] === 0 && q[1] === 0) return; st[h + 'x'] = q[0]; st[h + 'y'] = q[1]; }
      },
      draw(cv, st) { drawK(cv, st); },
      readout: st => { const d = st.ax * st.bx + st.ay * st.by; return `$\\vec a\\cdot\\vec b$ ＝ ${pn(st.ax)}×${pn(st.bx)} ＋ ${pn(st.ay)}×${pn(st.by)} ＝ <b>${A.num(d, 2)}</b>（${d > 1e-9 ? '正' : d < -1e-9 ? '負' : '0：直交'}）`; }
    },
    {
      key: 'nasu', label: '③ なす角のはかり方',
      lead: 'なす角は、2つの矢印の**始点をそろえて**はかります。矢印をつないでかくと、どうなるでしょう。',
      note: '向きがそろっているほど内積は大きく、直角で0、反対向きに近づくと負になります。内積の符号は $\\cos\\theta$ の符号で決まります。',
      miss: '$\\vec a$ の先に $\\vec b$ をつないで、その間の角をはかると、なす角を 180° からひいた角になってしまいます。そのまま内積を計算すると、符号が逆になります。',
      legend: [['$\\vec a$', { color: 'a' }], ['$\\vec b$', { color: 'b', style: 'dash' }], ['はかった角', { color: 'ink' }]],
      controls: [
        { range: 'th', label: 'なす角 $\\theta$', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°' },
        { seg: 'mode', label: 'かき方', options: [['soroe', '始点をそろえる（正しい）'], ['tsunagu', 'つないでかく（まちがい）']] }
      ],
      init(st) { st.th = 40; st.mode = 'soroe'; },
      step(st, dt) { st.th = Math.min(180, st.th + dt * 25); if (st.th >= 180) return false; },
      draw(cv, st) { drawN(cv, st); },
      readout: st => { const t = st.mode === 'soroe' ? st.th : 180 - st.th, c = Math.cos(t * D23); return `はかった角 ${Math.round(t)}°　→　内積 ＝ 3 × 2 × cos ${Math.round(t)}° ＝ <b>${A.num(6 * c, 2)}</b>` + (st.mode === 'soroe' ? '' : `（正しくは ${A.num(6 * Math.cos(st.th * D23), 2)}）`); }
    }
  ]
});

function pn(x) { return x < 0 ? '(' + A.num(x, 1) + ')' : A.num(x, 1); }
function arcD(v, c, r, a0, a1, o) { const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 3)), pts = []; for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * D23; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } v.line(pts, o); }

function drawW(cv, st) {
  const v = cv.view({ x0: -1.5, x1: 8.5, y0: -2.2, y1: 4.2, box: [10, 10, 560, 300], equal: true });
  const t = st.th * D23, F = 40, k = 0.07, x = st.p;
  v.line([[-1.4, 0], [8.4, 0]], { color: 'sub', width: 3 });
  for (let m = 0; m <= 5; m++) { v.line([[m, -0.12], [m, 0.12]], { color: 'sub', width: 1.5 }); v.text(m + ' m', m, -0.45, { size: 14, color: 'sub', align: 'center' }); }
  // トロッコ
  v.poly([[x - 0.6, 0.25], [x + 0.6, 0.25], [x + 0.75, 0.95], [x - 0.75, 0.95]], { fill: 'e', alpha: 0.35, color: 'e', width: 2 });
  v.circle(x - 0.35, 0.15, 0.13, { color: 'ink', width: 1.5 }); v.circle(x + 0.35, 0.15, 0.13, { color: 'ink', width: 1.5 });
  const G = [x, 0.6], Fv = [F * k * Math.cos(t), F * k * Math.sin(t)];
  v.line([G, [G[0] + Fv[0], G[1]], [G[0] + Fv[0], G[1] + Fv[1]]], { color: 'sub', width: 1, style: 'dot' });
  if (Math.abs(Fv[0]) > 0.02) v.arrow(G[0], G[1], G[0] + Fv[0], G[1], { color: 'a', width: 3.5 });
  if (Math.abs(Fv[1]) > 0.02) v.arrow(G[0], G[1], G[0], G[1] + Fv[1], { color: 'b', width: 3, style: 'dash' });
  v.arrow(G[0], G[1], G[0] + Fv[0], G[1] + Fv[1], { color: 'd', width: 4 });
  if (st.th > 2) arcD(v, G, 0.6, 0, st.th, { color: 'ink', width: 1.5 });
  v.text('θ', G[0] + 0.85 * Math.cos(t / 2), G[1] + 0.85 * Math.sin(t / 2), { size: 16, math: true, italic: true, align: 'center', bg: true });
  v.text('F ＝ 40 N', G[0] + Fv[0] * 1.08 + 0.1, G[1] + Fv[1] * 1.08 + 0.15, { size: 15, color: 'd', bold: true, bg: true });
  v.text('F cosθ ＝ ' + A.num(F * Math.cos(t), 1), G[0] + Fv[0] / 2, G[1] - 0.32, { size: 15, color: 'a', bold: true, align: 'center', bg: true });
  if (Math.abs(Fv[1]) > 0.3) v.text('F sinθ ＝ ' + A.num(F * Math.sin(t), 1), G[0] - 0.15, G[1] + Fv[1] / 2, { size: 15, color: 'b', bold: true, align: 'right', bg: true });
  v.arrow(0, -1.25, 5, -1.25, { color: 'c', width: 2.5 }); v.text('動く向き（5 m）', 5.2, -1.25, { size: 15, color: 'c' });
  // 下：仕事＝面積（横：動いた距離、たて：F cosθ）
  const g = cv.view({ x0: 0, x1: 5.5, y0: -45, y1: 45, box: [620, 20, 230, 360] });
  g.axes({ xt: [1, 2, 3, 4, 5], yt: [-40, -20, 20, 40], xl: 'm', yl: 'F cosθ（N）' });
  const fc = F * Math.cos(t);
  g.poly([[0, 0], [x, 0], [x, fc], [0, fc]], { fill: 'c', alpha: 0.3 });
  g.line([[0, fc], [5, fc]], { color: 'a', width: 2.5 });
  cv.text('仕事 ＝ 面積 ＝ ' + A.num(fc * x, 1) + ' J', 560, 400, { size: 16, bold: true, color: 'c' });
  cv.text(st.th > 90.5 ? '力と反対の向きに動く → 仕事は負' : Math.abs(st.th - 90) < 0.5 ? '力が動く向きに直角 → 仕事は 0' : '', 20, 400, { size: 16, bold: true });
}

function vK() { return new A.View({ W: 880, H: 420 }, { x0: -4, x1: 7, y0: -3, y1: 5.5, box: [10, 10, 520, 400], equal: true }); }
function drawK(cv, st) {
  const v = cv.view({ x0: -4, x1: 7, y0: -3, y1: 5.5, box: [10, 10, 520, 400], equal: true });
  const xs = [], ys = []; for (let i = -3; i <= 6; i++) xs.push(i); for (let j = -2; j <= 5; j++) ys.push(j);
  v.axes({ xt: xs.filter(x => x), yt: ys.filter(y => y), xl: 'x', yl: 'y' });
  const a = [st.ax, st.ay], b = [st.bx, st.by], la = Math.hypot(a[0], a[1]), lb = Math.hypot(b[0], b[1]);
  const u = [a[0] / la, a[1] / la], sh = (b[0] * u[0] + b[1] * u[1]), S = [u[0] * sh, u[1] * sh];
  // a の向きの直線
  v.clip(() => v.line([[-10 * u[0], -10 * u[1]], [10 * u[0], 10 * u[1]]], { color: 'grid', width: 2 }));
  // 光（a に直角）と影
  v.line([b, S], { color: 'sub', style: 'dot', width: 2 });
  if (Math.abs(sh) > 1e-6) v.line([[0, 0], S], { color: 'c', width: 9, alpha: 0.6 });
  v.arrow(0, 0, a[0], a[1], { color: 'a', width: 3.5 });
  v.arrow(0, 0, b[0], b[1], { color: 'b', width: 3, style: 'dash' });
  const ta = Math.atan2(a[1], a[0]) / D23, tb = Math.atan2(b[1], b[0]) / D23; let d = tb - ta; while (d > 180) d -= 360; while (d < -180) d += 360;
  arcD(v, [0, 0], 0.7, ta, ta + d, { color: 'ink', width: 1.5 });
  v.dot(a[0], a[1], { r: 7, color: 'a' }); v.dot(b[0], b[1], { r: 7, color: 'b', shape: 'square' });
  v.text('a', a[0] + 0.25, a[1] + 0.3, { size: 18, bold: true, math: true, italic: true, color: 'a' });
  v.text('b', b[0] + 0.25, b[1] + 0.3, { size: 18, bold: true, math: true, italic: true, color: 'b' });
  if (Math.abs(sh) > 0.3) v.text('影 ' + A.num(sh, 2), S[0] / 2 + 0.35 * u[1], S[1] / 2 - 0.35 * u[0], { size: 15, color: 'c', bold: true, bg: true, align: 'center' });
  const th = Math.abs(d), dot = a[0] * b[0] + a[1] * b[1];
  const X = 560; let y = 40; const T = (s, o) => { cv.text(s, X, y, Object.assign({ size: 16 }, o)); y += 28; };
  T('a ＝ (' + A.num(a[0], 1) + ', ' + A.num(a[1], 1) + ')　|a| ＝ ' + A.num(la, 2), { color: 'a' });
  T('b ＝ (' + A.num(b[0], 1) + ', ' + A.num(b[1], 1) + ')　|b| ＝ ' + A.num(lb, 2), { color: 'b' });
  T('なす角 θ ＝ ' + A.num(th, 1) + '°');
  y += 6;
  T('影の長さ ＝ |b| cosθ ＝ ' + A.num(sh, 2), { color: 'c', bold: true });
  T('|a| × 影 ＝ ' + A.num(la, 2) + ' × ' + A.num(sh, 2) + ' ＝ ' + A.num(la * sh, 2), { bold: true });
  y += 6;
  T('成分で：' + pn(a[0]) + '×' + pn(b[0]) + ' ＋ ' + pn(a[1]) + '×' + pn(b[1]) + ' ＝ ' + A.num(dot, 2));
  y += 6;
  const kind = Math.abs(dot) < 1e-9 ? ['直角：内積は 0（直交）', 'c'] : dot > 0 ? ['鋭角：内積は正', 'a'] : ['鈍角：内積は負（影が反対がわ）', 'b'];
  T(kind[0], { size: 18, bold: true, color: kind[1] });
  y += 10;
  T('●・■ をドラッグ（0.5 ずつ）', { size: 15, color: 'sub' });
}

function drawN(cv, st) {
  const v = cv.view({ x0: -4, x1: 6.5, y0: -1.5, y1: 4.5, box: [10, 10, 540, 400], equal: true });
  const t = st.th * D23, a = [3, 0], b = [2 * Math.cos(t), 2 * Math.sin(t)];
  if (st.mode === 'soroe') {
    v.arrow(0, 0, a[0], a[1], { color: 'a', width: 4 }); v.arrow(0, 0, b[0], b[1], { color: 'b', width: 3.5, style: 'dash' });
    if (st.th > 1) arcD(v, [0, 0], 0.6, 0, st.th, { color: 'ink', width: 2 });
    v.text(Math.round(st.th) + '°', 0.95 * Math.cos(t / 2), 0.95 * Math.sin(t / 2), { size: 16, align: 'center', bg: true, bold: true });
    v.dot(0, 0, { r: 5 });
  } else {
    const B0 = a, B1 = [a[0] + b[0], a[1] + b[1]];
    v.arrow(0, 0, a[0], a[1], { color: 'a', width: 4 }); v.arrow(B0[0], B0[1], B1[0], B1[1], { color: 'b', width: 3.5, style: 'dash' });
    if (st.th < 179) arcD(v, B0, 0.6, st.th, 180, { color: 'ink', width: 2 });
    const m = (st.th + 180) / 2 * D23;
    v.text(Math.round(180 - st.th) + '°（×）', B0[0] + 1.1 * Math.cos(m), B0[1] + 1.1 * Math.sin(m), { size: 16, align: 'center', bg: true, bold: true, color: 'b' });
    v.line([B0, [B0[0] + 1.5, 0]], { color: 'sub', style: 'dot', width: 1.5 });
  }
  v.text('|a| ＝ 3', 1.5, -0.4, { size: 15, color: 'a', align: 'center' });
  // 右：cos のものさし
  const L = 600, R = 850, Y = 120, X = x => L + (x + 1) / 2 * (R - L);
  const tm = st.mode === 'soroe' ? st.th : 180 - st.th, c = Math.cos(tm * D23);
  cv.text('cos（はかった角）', L, 40, { size: 15, bold: true });
  cv.rect(L, Y - 10, (R - L) / 2, 20, { fill: 'b', alpha: 0.12 }); cv.rect((L + R) / 2, Y - 10, (R - L) / 2, 20, { fill: 'a', alpha: 0.12 });
  cv.line([[L, Y], [R, Y]], { color: 'sub', width: 1.5 });
  for (const m of [-1, 0, 1]) { cv.line([[X(m), Y - 12], [X(m), Y + 12]], { color: 'sub', width: 1 }); cv.text(String(m).replace('-', '−'), X(m), Y + 26, { size: 14, align: 'center', color: 'sub' }); }
  cv.text('負', L + 8, Y - 26, { size: 15, color: 'b' }); cv.text('正', R - 8, Y - 26, { size: 15, color: 'a', align: 'right' });
  cv.dot(X(c), Y, { r: 9, shape: 'diamond', color: Math.abs(c) < 0.01 ? 'c' : c > 0 ? 'a' : 'b' });
  cv.text('内積 ＝ 3 × 2 × cos' + Math.round(tm) + '°', L, Y + 70, { size: 16 });
  cv.text('＝ ' + A.num(6 * c, 2), L, Y + 98, { size: 20, bold: true });
  if (st.mode !== 'soroe') { cv.text('正しい答え：' + A.num(6 * Math.cos(st.th * D23), 2), L, Y + 140, { size: 16, color: 'b', bold: true }); cv.text('（符号が逆になる）', L, Y + 166, { size: 15, color: 'sub' }); }
}
