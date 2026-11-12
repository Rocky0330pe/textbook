// @id p1-02
// @title 投げたボール：横は等速、たては落下
// @vol 物理1
// @from 物理 力-1 ④（p1-01 の図「飛び出したボールとそっと放したボール」・射方投射の表）、まちがえやすいところ（力-1・力-2）
'use strict';
// 力の矢印は実線（だいだい）、速度の矢印は破線（青）、加速度は点線（緑）。札でも分ける。
const G = 9.8;
A.item({
  id: 'p1-02', title: '投げたボール：横は等速、たては落下',
  from: '物理 第1巻『力学』 力-1 ④ の図（0.1秒ごとの写真）と表、まちがえやすいところ（力-1・力-2）から（数学 3-9・3-10・6-2 でも使う）',
  W: 880, H: 440,
  state: { t: 0, v0: 2.0, th: 45, v1: 10, vu: 10 },
  scenes: [
    {
      key: 'yoko', label: '① 横に飛び出す',
      lead: '机のはしから飛び出すボールと、同じ瞬間にそっと放すボールを、0.1秒ごとにくらべます。',
      note: '2つのボールは、いつも**同じ高さ**にいて、同時に床に着きます。横には、飛び出した速さ $v_0$ のまま進みます（等速直線運動）。たての動きは、横の動きと関係なく、自由落下と同じです。机の高さ 1.25 m なら $1.25=4.9t^2$ より $t\\approx0.51$ s。',
      miss: '横に進むボールにも、横向きの力ははたらいていません。はたらく力は、下向きの重力 $mg$ だけです。だから、横の速度 $v_x$ は変わりません。',
      legend: [['飛び出したボール', { color: 'a', shape: 'circle', noline: true }], ['そっと放したボール', { color: 'c', shape: 'square', noline: true }], ['速度の成分（破線）', { color: 'a', style: 'dash' }], ['重力 $mg$（実線）', { color: 'b' }]],
      controls: [{ range: 'v0', label: '飛び出す速さ $v_0$〔m/s〕', min: 0.5, max: 3, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.25; const T = Math.sqrt(2 * 1.25 / G); if (st.t >= T) { st.t = T; return false; } },
      draw: drawYoko,
      readout: st => `$t$ ＝ ${A.num(st.t, 2)} s　　$v_x$ ＝ ${A.num(st.v0, 1)} m/s（変わらない）　　$v_y$ ＝ ${A.num(G * st.t, 2)} m/s（下向き）　　落ちた高さ ＝ ${A.num(4.9 * st.t * st.t, 2)} m`
    },
    {
      key: 'naname', label: '② ななめに投げる',
      lead: '速さ $v_0$、角 $\\theta$ で投げたボール。いちばん高い所で、速度と加速度はどうなっているでしょう。',
      note: '横の速度 $v_0\\cos\\theta$ は最後まで変わりません。たての速度 $v_0\\sin\\theta-gt$ だけが変わり、いちばん高い所で0になります。加速度は、上がるときも、いちばん高い所も、下がるときも、**いつも下向き**に $g$ です。届く距離は $R=\\dfrac{v_0^2\\sin2\\theta}{g}$。',
      miss: '「いちばん高い所で速さが0」はまちがい。0 になるのはたての速度だけで、横の速度 $v_0\\cos\\theta$ は残ります。「いちばん高い所で加速度も0」もまちがい。加速度が0なら、ボールは空中に止まったままになるはずです。',
      legend: [['速度 $\\vec v$ と成分（破線）', { color: 'a', style: 'dash' }], ['重力 $mg$（実線）', { color: 'b' }], ['加速度 $g$（点線）', { color: 'c', style: 'dot' }], ['30°・60° の道すじ', { color: 'sub', style: 'long' }]],
      controls: [{ range: 'th', label: '投げる角 $\\theta$', min: 10, max: 80, step: 1, fmt: v => v + '°', on: st => { st.t = 0; } }, { range: 'v1', label: '速さ $v_0$〔m/s〕', min: 5, max: 12, step: 0.5, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; const T = 2 * st.v1 * Math.sin(st.th * Math.PI / 180) / G; if (st.t >= T) { st.t = T; return false; } },
      draw: drawNaname,
      readout: st => { const s = Math.sin(st.th * Math.PI / 180), c = Math.cos(st.th * Math.PI / 180), vy = st.v1 * s - G * st.t; return `$t$ ＝ ${A.num(st.t, 2)} s　$v_x$ ＝ ${A.num(st.v1 * c, 2)}　$v_y$ ＝ ${A.num(vy, 2)} m/s　加速度：下向き 9.8 m/s²　　$H$ ＝ ${A.num(st.v1 ** 2 * s * s / 2 / G, 2)} m　$R$ ＝ ${A.num(st.v1 ** 2 * 2 * s * c / G, 2)} m`; }
    },
    {
      key: 'ue', label: '③ 真上に投げる',
      lead: '真上に投げたボール。上がっているあいだ、上向きの力ははたらいているでしょうか。',
      note: '手をはなれたあとの力は、**下向きの重力だけ**です。ボールは上向きの速度を慣性で保ちながら、重力で1秒に 9.8 m/s ずつ遅くなります。$v$-$t$ グラフは傾き $-9.8$ のまっすぐな線で、いちばん高い所（$v=0$）でも傾きは変わりません。',
      miss: '「上がっているあいだは上向きの力がはたらいている」はまちがい。力が決めるのは、速度ではなく加速度です。',
      legend: [['速度 $v$（破線の矢印）', { color: 'a', style: 'dash' }], ['重力 $mg$（実線）', { color: 'b' }], ['$v$-$t$ グラフ（傾き＝加速度）', { color: 'a' }]],
      controls: [{ range: 'vu', label: '投げ上げる速さ $v_0$〔m/s〕', min: 4, max: 14, step: 0.5, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; const T = 2 * st.vu / G; if (st.t >= T) { st.t = T; return false; } },
      draw: drawUe,
      readout: st => `$t$ ＝ ${A.num(st.t, 2)} s　　速度 $v$ ＝ ${A.num(st.vu - G * st.t, 2)} m/s（上向きが $+$）　　加速度 ＝ −9.8 m/s²（いつも同じ）　　高さ ＝ ${A.num(st.vu * st.t - 4.9 * st.t * st.t, 2)} m`
    }
  ]
});

function drawYoko(cv, st) {
  const v = cv.view({ x0: -0.55, x1: 1.8, y0: -0.3, y1: 1.4, box: [10, 10, 860, 420], equal: true });
  const H = 1.25, T = Math.sqrt(2 * H / G);
  // 机と床
  v.poly([[-0.55, H], [0, H], [0, H - 0.05], [-0.55, H - 0.05]], { fill: 'e', alpha: 0.35, color: 'e', width: 1 });
  v.line([[-0.03, H - 0.05], [-0.03, 0]], { color: 'e', width: 5 }); v.line([[-0.5, H - 0.05], [-0.5, 0]], { color: 'e', width: 5 });
  v.line([[-0.55, 0], [1.75, 0]], { color: 'ink', width: 2 });
  for (let x = 0; x <= 1.5 + 1e-9; x += 0.5) { v.line([[x, 0], [x, -0.02]], { color: 'sub', width: 1 }); if (Math.abs(x - st.v0 * st.t) > 0.16 || st.t < 0.35) v.text(A.num(x, 1) + ' m', x, -0.06, { size: 14, align: 'center', color: 'sub' }); }
  const XD = 1.62; // そっと放す所
  // 0.1秒ごとの写真
  for (let k = 0; k * 0.1 <= st.t + 1e-9; k++) {
    const tk = k * 0.1, y = H - 4.9 * tk * tk;
    if (y < 0) break;
    v.line([[st.v0 * tk, y], [XD, y]], { color: 'line', width: 1, style: 'dash' });
    v.dot(st.v0 * tk, y, { color: 'a', r: 6, open: true }); v.dot(XD, y, { color: 'c', r: 6, shape: 'square', open: true });
    if (k !== 1) v.text(A.num(tk, 1) + ' s', XD + 0.05, y, { size: 14, color: 'sub' });
  }
  const t = st.t, x = st.v0 * t, y = H - 4.9 * t * t;
  v.param(s => st.v0 * s, s => H - 4.9 * s * s, 0, T, { color: 'a', width: 1.5, alpha: 0.5 });
  // 速度の成分（破線）・重力（実線）
  const sc = 0.07;   // 1 m/s を 0.07 m の長さで
  v.arrow(x, y, x + st.v0 * sc, y, { color: 'a', style: 'dash', width: 3 });
  if (t > 0.02) v.arrow(x, y, x, y - G * t * sc, { color: 'a', style: 'dash', width: 3 });
  if (t > 0.02) v.arrow(XD, y, XD, y - G * t * sc, { color: 'a', style: 'dash', width: 3 });
  v.text('vx', x + st.v0 * sc + 0.02, y + 0.04, { size: 15, color: 'a', math: true, italic: true, bg: true });
  if (t > 0.15) v.text('vy', x - 0.02, y - G * t * sc * 0.6, { size: 15, color: 'a', math: true, italic: true, align: 'right', bg: true });
  // 重力は同じ長さ（どこでも mg）
  v.arrow(x + 0.06, y - 0.01, x + 0.06, y - 0.18, { color: 'b', width: 3.5 }); v.text('mg', x + 0.08, y - 0.15, { size: 15, color: 'b', math: true, italic: true, bg: true });
  v.arrow(XD - 0.06, y - 0.01, XD - 0.06, y - 0.18, { color: 'b', width: 3.5 });
  v.dot(x, y, { color: 'a', r: 9 }); v.dot(XD, y, { color: 'c', r: 9, shape: 'square' });
  v.text('飛び出したボール', 0.02, H + 0.09, { size: 15, color: 'a' });
  v.text('そっと放したボール', XD, H + 0.09, { size: 15, color: 'c', align: 'center' });
}

function drawNaname(cv, st) {
  const th = st.th * Math.PI / 180, c = Math.cos(th), s = Math.sin(th), v0 = st.v1;
  const v = cv.view({ x0: -0.6, x1: 16, y0: -1.9, y1: 7.6, box: [20, 10, 840, 420], equal: true });
  v.axes({ xt: A.range(2, 14, 2), yt: [2, 4, 6], xl: 'x〔m〕', yl: 'y〔m〕' });
  for (const a of [30, 60]) { const ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180), T = 2 * 10 * sa / G; v.param(t => 10 * ca * t, t => 10 * sa * t - 4.9 * t * t, 0, T, { color: 'sub', style: 'long', width: 1.5, alpha: 0.6 }); }
  const T = 2 * v0 * s / G;
  v.param(t => v0 * c * t, t => v0 * s * t - 4.9 * t * t, 0, T, { color: 'a', width: 1.5, alpha: 0.45 });
  for (let k = 1; k * 0.1 <= st.t; k++) { const tk = k * 0.1; v.dot(v0 * c * tk, v0 * s * tk - 4.9 * tk * tk, { color: 'a', r: 3 }); }
  const t = st.t, x = v0 * c * t, y = v0 * s * t - 4.9 * t * t, vx = v0 * c, vy = v0 * s - G * t;
  const k = 0.32;
  v.arrow(x, y, x + vx * k, y, { color: 'a', style: 'dash', width: 2 });
  if (Math.abs(vy) > 0.2) v.arrow(x, y, x, y + vy * k, { color: 'a', style: 'dash', width: 2 });
  v.arrow(x, y, x + vx * k, y + vy * k, { color: 'a', style: 'dash', width: 3.5 });
  v.text('v', x + vx * k + 0.15, y + vy * k + 0.25, { size: 17, color: 'a', math: true, italic: true, bold: true, bg: true });
  v.text('vx', x + vx * k + 0.1, y - 0.3, { size: 15, color: 'a', math: true, italic: true, bg: true });
  if (Math.abs(vy) > 0.6) v.text('vy', x - 0.12, y + vy * k * 0.55, { size: 15, color: 'a', math: true, italic: true, align: 'right', bg: true });
  // 重力（実線）と加速度（点線）：いつも下向き・同じ長さ
  v.arrow(x - 0.25, y - 0.05, x - 0.25, y - 1.5, { color: 'b', width: 3.5 }); v.text('mg', x - 0.35, y - 1.25, { size: 15, color: 'b', math: true, italic: true, align: 'right', bg: true });
  v.arrow(x + 0.25, y - 0.05, x + 0.25, y - 1.5, { color: 'c', style: 'dot', width: 3.5 }); v.text('g', x + 0.38, y - 1.25, { size: 15, color: 'c', math: true, italic: true, bg: true });
  v.dot(x, y, { color: 'a', r: 8 });
  const Hm = v0 * v0 * s * s / 2 / G, tH = v0 * s / G;
  if (Math.abs(t - tH) < 0.06) v.text('いちばん高い所：vy = 0、vx は残る、加速度は下向き g', Math.min(x, 8), Hm + 0.55, { size: 15, bold: true, bg: true });
}

function drawUe(cv, st) {
  const v0 = st.vu, T = 2 * v0 / G, Hm = v0 * v0 / 2 / G, t = st.t;
  const b = cv.view({ x0: -1.5, x1: 1.5, y0: -0.6, y1: 10.5, box: [20, 20, 230, 400] });
  b.line([[-1.2, 0], [1.2, 0]], { color: 'ink', width: 2 });
  for (let m = 2; m <= 10; m += 2) { b.line([[-1.2, m], [-1.0, m]], { color: 'sub', width: 1 }); b.text(m + ' m', -1.25, m, { size: 14, align: 'right', color: 'sub' }); }
  const y = v0 * t - 4.9 * t * t, vv = v0 - G * t;
  b.line([[0, 0], [0, Hm]], { color: 'grid', width: 4 });
  if (Math.abs(vv) > 0.15) b.arrow(-0.2, y, -0.2, y + vv * 0.4, { color: 'a', style: 'dash', width: 3.5 });
  b.text('v', -0.3, y + vv * 0.2, { size: 16, color: 'a', math: true, italic: true, align: 'right', bg: true });
  b.arrow(0.3, y - 0.1, 0.3, y - 1.7, { color: 'b', width: 3.5 }); b.text('mg', 0.42, y - 1.3, { size: 15, color: 'b', math: true, italic: true, bg: true });
  b.dot(0, y, { color: 'a', r: 9 });
  // v-t グラフ
  const g = cv.view({ x0: 0, x1: 3, y0: -15, y1: 15, box: [330, 20, 520, 390] });
  g.axes({ xt: [0.5, 1, 1.5, 2, 2.5], yt: [-10, -5, 5, 10], xl: 't〔s〕', yl: 'v〔m/s〕（上向き＋）' });
  g.plot(s => v0 - G * s, { x0: 0, x1: T, color: 'a', width: 1.5, alpha: 0.3 });
  g.plot(s => v0 - G * s, { x0: 0, x1: t, color: 'a', width: 3 });
  g.dot(t, vv, { color: 'a', r: 6 });
  g.line([[v0 / G, -14], [v0 / G, 14]], { color: 'sub', style: 'dot', width: 1 });
  g.text('いちばん高い所（v = 0）でも傾きは −9.8', v0 / G + 0.06, 13, { size: 15, color: 'sub', bg: true });
  // 傾きの三角形
  const t0 = Math.min(Math.max(t, 0.3), T - 1.1);
  if (t0 > 0) { g.line([[t0, v0 - G * t0], [t0 + 1, v0 - G * t0], [t0 + 1, v0 - G * (t0 + 1)]], { color: 'c', style: 'dot', width: 2 }); g.text('1 s', t0 + 0.5, v0 - G * t0 + 1, { size: 14, color: 'c', align: 'center' }); g.text('−9.8', t0 + 1.05, v0 - G * (t0 + 0.75), { size: 14, color: 'c' }); }
}
