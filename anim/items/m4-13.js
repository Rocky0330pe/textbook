// @id m4-13
// @title 線積分：1歩ずつ内積をためる
// @vol 数学8
// @from 数学 8-7 図1・2・6・7（ch8-07:203・270・553・590）
'use strict';
// はてな？の力 F₂=(−y, x)（保存力でない）と F₁=(y, x)（保存力、U=−xy）。道は (0,0) から (1,1) へ
const FF = { f2: { name: '$\\vec F_2=(-y,\\ x)$', f: (x, y) => [-y, x] }, f1: { name: '$\\vec F_1=(y,\\ x)$', f: (x, y) => [y, x] } };
const PATHS = {
  A: { name: '道A（右→上）', r: u => u < 0.5 ? [2 * u, 0] : [1, 2 * u - 1] },
  B: { name: '道B（上→右）', r: u => u < 0.5 ? [0, 2 * u] : [2 * u - 1, 1] },
  N: { name: 'ななめ', r: u => [u, u] },
  Q: { name: '放物線 $y=x^2$', r: u => [u, u * u] }
};
const N = 400;
// 道を N 歩に分け、まん中の点の力と1歩の内積をたす
function work(fk, pk, uEnd) {
  const f = FF[fk].f, r = PATHS[pk].r; let W = 0;
  const m = Math.round(N * uEnd);
  for (let k = 0; k < m; k++) { const a = r(k / N), b = r((k + 1) / N), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], F = f(c[0], c[1]); W += F[0] * (b[0] - a[0]) + F[1] * (b[1] - a[1]); }
  return W;
}
const sq = v => Math.abs(v) < 5e-4 ? '0' : A.num(v, 3);

function drawMichi(cv, st) {
  const v = cv.view({ x0: -0.25, x1: 1.35, y0: -0.25, y1: 1.3, box: [10, 10, 440, 420], equal: true });
  v.axes({ xt: [0.5, 1], yt: [0.5, 1], xl: 'x', yl: 'y', zero: true });
  const f = FF[st.f].f;
  for (let x = 0; x <= 1.0001; x += 0.25) for (let y = 0; y <= 1.0001; y += 0.25) { const q = f(x, y); v.arrow(x, y, x + q[0] * 0.13, y + q[1] * 0.13, { color: 'b', width: 1.5, alpha: 0.35, head: 7 }); }
  // ほかの道（うすく）
  for (const k of Object.keys(PATHS)) { if (k === st.p) continue; const pts = []; for (let i = 0; i <= 100; i++) pts.push(PATHS[k].r(i / 100)); v.line(pts, { color: 'sub', width: 1.2, style: 'dot' }); }
  const r = PATHS[st.p].r, pts = []; for (let i = 0; i <= 200; i++) pts.push(r(i / 200));
  v.line(pts, { color: 'a', width: 2, alpha: 0.4 });
  const done = []; for (let i = 0; i <= Math.round(200 * st.u); i++) done.push(r(i / 200));
  v.line(done, { color: 'a', width: 4 });
  const p = r(Math.min(st.u, 0.999)), p2 = r(Math.min(1, st.u + 0.06)), F = f(p[0], p[1]);
  const dr = [p2[0] - p[0], p2[1] - p[1]], dl = Math.hypot(...dr) || 1, dot = F[0] * dr[0] / dl + F[1] * dr[1] / dl;
  v.arrow(p[0], p[1], p[0] + F[0] * 0.3, p[1] + F[1] * 0.3, { color: 'b', width: 3.5 });
  if (st.u < 1) v.arrow(p[0], p[1], p[0] + dr[0] / dl * 0.22, p[1] + dr[1] / dl * 0.22, { color: 'a', width: 3, style: 'dash' });
  v.dot(p[0], p[1], { color: 'ink', r: 6 });
  v.dot(0, 0, { color: 'ink', r: 4 }); v.dot(1, 1, { color: 'ink', r: 4 }); v.text('はじめ (0, 0)', 0.03, -0.12, { size: 14 }); v.text('おわり (1, 1)', 0.62, 1.13, { size: 14 });
  // 右：いまの1歩と、ためた仕事
  const x = 480, W = work(st.f, st.p, st.u);
  cv.text('いまの1歩：力と1歩の内積は ' + (Math.abs(dot) < 0.02 ? '0（直角）' : dot > 0 ? '正（同じ向き）' : '負（反対向き）'), x, 34, { size: 15, color: Math.abs(dot) < 0.02 ? 'sub' : dot > 0 ? 'b' : 'a', bold: true });
  cv.text('ためた仕事 ∫F·dr ＝ ' + sq(W) + ' J', x, 72, { size: 18, bold: true });
  const g = cv.view({ x0: 0, x1: 1, y0: -1.2, y1: 1.2, box: [x + 10, 100, 360, 150] });
  g.axes({ xt: [], yt: [-1, 1], xl: '道の進み', yl: '仕事', ax: 0 });
  const curve = []; for (let i = 0; i <= Math.round(80 * st.u); i++) curve.push([i / 80, work(st.f, st.p, i / 80)]);
  g.line(curve, { color: 'a', width: 2.5 });
  // 本の表（3つの道 × 2つの力）
  const ty = 290;
  cv.text('道', x, ty, { size: 14, color: 'sub' }); cv.text('A', x + 120, ty, { size: 14, color: 'sub' }); cv.text('B', x + 180, ty, { size: 14, color: 'sub' }); cv.text('ななめ', x + 230, ty, { size: 14, color: 'sub' }); cv.text('放物線', x + 300, ty, { size: 14, color: 'sub' });
  ['f2', 'f1'].forEach((fk, i) => {
    const y = ty + 30 + i * 30; cv.text(fk === 'f2' ? 'F₂ ＝ (−y, x)' : 'F₁ ＝ (y, x)', x, y, { size: 15, bold: st.f === fk });
    ['A', 'B', 'N', 'Q'].forEach((pk, j) => { const on = st.f === fk && st.p === pk, w = work(fk, pk, 1); cv.text(sq(w).replace('0.333', '1/3'), x + [124, 184, 244, 314][j], y, { size: 15, align: 'center', bold: on, color: on ? 'a' : 'ink' }); });
  });
  cv.text('（単位 J）', x, ty + 92, { size: 14, color: 'sub' });
}

function drawEn(cv, st) {
  const n = Math.round(st.n), v = cv.view({ x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6, box: [10, 10, 420, 420], equal: true });
  v.axes({ xt: [-1, 1], yt: [-1, 1], xl: 'x', yl: 'y' });
  v.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.5 });
  const P = []; for (let k = 0; k <= n; k++) P.push([Math.cos(2 * Math.PI * k / n), Math.sin(2 * Math.PI * k / n)]);
  v.line(P, { color: 'a', width: 2.5 });
  let W = 0;
  for (let k = 0; k < n; k++) {
    const a = P[k], b = P[k + 1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], F = [-m[1], m[0]];
    W += F[0] * (b[0] - a[0]) + F[1] * (b[1] - a[1]);
    if (n <= 40) { v.arrow(m[0], m[1], m[0] + F[0] * 0.35, m[1] + F[1] * 0.35, { color: 'b', width: 2 }); v.dot(m[0], m[1], { color: 'ink', r: 2.5 }); }
  }
  // 右：n とたした値
  const g = cv.view({ x0: 0, x1: 102, y0: 2.5, y1: 6.6, box: [500, 30, 360, 260] });
  g.axes({ xt: [20, 40, 60, 80, 100], yt: [3, 4, 5, 6], xl: 'n', yl: '仕事の合計', ay: 0, ax: 2.5 });
  g.line([[0, 2 * Math.PI], [102, 2 * Math.PI]], { color: 'd', width: 1.5, style: 'dash' }); g.text('2π ≒ 6.283', 70, 2 * Math.PI + 0.22, { size: 14, color: 'd' });
  const c = []; for (let k = 3; k <= 100; k++) c.push([k, k * Math.sin(2 * Math.PI / k)]); g.line(c, { color: 'a', width: 2 });
  for (const k of [4, 8, 12, 100]) g.dot(k, k * Math.sin(2 * Math.PI / k), { color: 'sub', r: 4, shape: 'square' });
  g.dot(n, W, { color: 'b', r: 7 });
  cv.text('n ＝ ' + n + ' のとき、合計 ' + A.num(W, 3) + ' J', 500, 330, { size: 18, bold: true });
  cv.text('本の表：4 → 4、8 → 5.657、12 → 6.000、100 → 6.279', 500, 366, { size: 14, color: 'sub' });
}

// 山：P (30,20)、高さ83 m から頂上（100 m）へ。50 kg の人がゆっくり登るときの、重力に逆らう仕事 mgΔh
const h = (x, y) => 100 - 0.01 * x * x - 0.02 * y * y;
const bez = (C, u) => [(1 - u) * (1 - u) * 30 + 2 * u * (1 - u) * C[0], (1 - u) * (1 - u) * 20 + 2 * u * (1 - u) * C[1]];
const YV = [10, 10, 540, 420], yview = cv => cv.view({ x0: -12, x1: 62, y0: -18, y1: 42, box: YV, equal: true });
function pathInfo(r, u) { let W = 0, L = 0; const m = Math.round(300 * u); for (let k = 0; k < m; k++) { const a = r(k / 300), b = r((k + 1) / 300); W += 50 * 9.8 * (h(b[0], b[1]) - h(a[0], a[1])); L += Math.hypot(b[0] - a[0], b[1] - a[1]); } return [W, L]; }
function drawYama(cv, st) {
  const v = yview(cv);
  v.axes({ xt: [10, 20, 30, 40, 50], yt: [-10, 10, 20, 30], xl: 'x（東 m）', yl: 'y（北 m）' });
  for (let c = 30; c <= 90; c += 10) { const a = Math.sqrt((100 - c) / 0.01), b = Math.sqrt((100 - c) / 0.02); v.clip(() => v.param(t => a * Math.cos(t), t => b * Math.sin(t), 0, 2 * Math.PI, { n: 160, color: 'c', width: 1, alpha: 0.8 })); const lx = a * Math.cos(1.15), ly = b * Math.sin(1.15); if (lx < 58 && ly < 39) v.text(c + ' m', lx, ly, { size: 14, color: 'c', align: 'center', bg: true }); }
  const r1 = u => [30 * (1 - u), 20 * (1 - u)], r2 = u => bez([st.cx, st.cy], u);
  const draw = (r, o) => { const p = []; for (let i = 0; i <= 100; i++) p.push(r(i / 100)); v.line(p, o); const d = []; for (let i = 0; i <= Math.round(100 * st.u); i++) d.push(r(i / 100)); v.line(d, Object.assign({}, o, { width: 5 })); const q = r(st.u); v.dot(q[0], q[1], { color: o.color, r: 6, shape: o.shape }); };
  draw(r1, { color: 'b', width: 2 });
  draw(r2, { color: 'a', width: 2, style: 'dash', shape: 'square' });
  v.dot(st.cx, st.cy, { color: 'a', r: 6, shape: 'diamond', open: true }); v.line([[30, 20], [st.cx, st.cy], [0, 0]], { color: 'a', width: 1, style: 'dot', alpha: 0.6 });
  v.dot(30, 20, { color: 'ink', r: 5 }); v.text('(30, 20)：83 m', 31.5, 22.5, { size: 14, bg: true });
  v.text('▲頂上 100 m', 0.5, -2.5, { size: 14, bg: true });
  const [W1, L1] = pathInfo(r1, st.u), [W2, L2] = pathInfo(r2, st.u), [WF1, LF1] = pathInfo(r1, 1), [WF2, LF2] = pathInfo(r2, 1);
  const x = 580;
  cv.text('重力に逆らってする仕事（50 kg）', x, 34, { size: 15, bold: true });
  cv.text('まっすぐの道', x, 74, { size: 15, color: 'b', bold: true }); cv.text(A.num(W1, 0) + ' J', x + 280, 74, { size: 17, bold: true, align: 'right' });
  cv.text('遠回りの道', x, 104, { size: 15, color: 'a', bold: true }); cv.text(A.num(W2, 0) + ' J', x + 280, 104, { size: 17, bold: true, align: 'right' });
  cv.text('道の長さ：' + A.num(LF1, 1) + ' m と ' + A.num(LF2, 1) + ' m', x, 160, { size: 15 });
  cv.text('道にそって必要な力の平均：', x, 196, { size: 15 });
  cv.text(A.num(WF1 / LF1, 0) + ' N と ' + A.num(WF2 / LF2, 0) + ' N', x + 20, 222, { size: 16, bold: true });
  cv.text('遠回りすると力は小さいが、', x, 270, { size: 15 }); cv.text('進む長さが長くなる。', x, 294, { size: 15 });
  cv.text('◇ をドラッグすると、遠回りの', x, 380, { size: 14, color: 'sub' }); cv.text('道の形が変わります', x, 402, { size: 14, color: 'sub' });
}

A.item({
  id: 'm4-13', title: '線積分：1歩ずつ内積をためる',
  from: '数学 第8巻 8-7「線積分」の図から（8-10・8-11、物理 力-4・熱-2・5 でも使う）',
  W: 880, H: 440,
  state: { f: 'f2', p: 'A', u: 0, n: 4, cx: 48, cy: -12 },
  scenes: [
    {
      key: 'michi', label: '① 道を歩いて仕事をためる',
      lead: '点が道を歩きながら、1歩ごとに「力（オレンジ）と1歩の矢印（青）の内積」をためていきます。力と道をえらんで ▶ をおしましょう。',
      note: '線積分 $\\int_C\\vec F\\cdot\\mathrm d\\vec r$ は、道を小さな1歩に分け、力と1歩の内積をたした先です。力が進む向きと同じなら正、反対なら負、直角なら0がたまります。はてな？の力 $\\vec F_2$ では、同じ2点を結んでも**道によって仕事が変わり**（1、$-1$、0）、$\\vec F_1$ ではどの道でも1です。',
      miss: '道Bでの $\\vec F_2$ の仕事を「$|\\vec F_2|\\times$（道の長さ）で正」とするのはまちがいです。内積をたすので、道Bでは $-1$ になります。',
      state: { f: 'f2', p: 'A', u: 0 },
      legend: [['いまの場所の力', { color: 'b' }], ['1歩の向き', { color: 'a', style: 'dash' }], ['歩いた道', { color: 'a' }], ['ほかの道', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'f', label: '力', options: [['f2', FF.f2.name], ['f1', FF.f1.name]], on: st => { st.u = 0; } }, { seg: 'p', label: '道', options: Object.keys(PATHS).map(k => [k, PATHS[k].name]), on: st => { st.u = 0; } }],
      step(st, dt) { st.u = Math.min(1, st.u + dt * 0.25); if (st.u >= 1) return false; },
      draw: drawMichi,
      readout: st => `${FF[st.f].name}、${PATHS[st.p].name}：ためた仕事 ${sq(work(st.f, st.p, st.u))} J${st.u >= 1 ? '（おわり）' : ''}`
    },
    {
      key: 'en', label: '② 円を n 本に分ける',
      lead: '半径1 m の円を左回りに1周する道を、$n$ 本の線分に分けます。線分のまん中の力 $\\vec F_2$ と線分の矢印の内積をたします。',
      note: '$n=4$ で4、8で5.657、12で6.000、100で6.279と、$n$ をふやすと $2\\pi\\approx6.283$ に近づきます。$\\vec F_2$ は円の上でいつも道と同じ向きで、大きさは1なので、仕事は「1×円周 $2\\pi$」です。1周して同じ点にもどっても0にならないので、$\\vec F_2$ は保存力ではありません。',
      state: { n: 4 },
      legend: [['円を分けた線分', { color: 'a' }], ['線分のまん中の力 $\\vec F_2$', { color: 'b' }], ['$2\\pi$', { color: 'd', style: 'dash' }]],
      controls: [{ range: 'n', label: '線分の数 $n$', min: 3, max: 100, step: 1, d: 0 }],
      step(st, dt) { st.n = Math.min(100, st.n + dt * (st.n < 16 ? 2 : 15)); if (st.n >= 100) return false; },
      draw: drawEn,
      readout: st => { const n = Math.round(st.n); return `$n=${n}$：合計 $=n\\sin\\frac{2\\pi}{n}=${A.num(n * Math.sin(2 * Math.PI / n), 4)}$（$2\\pi=6.2832$）`; }
    },
    {
      key: 'yama', label: '③ 保存力は道によらない',
      lead: '主役の山の $(30,\\ 20)$（83 m）から頂上（100 m）まで、50 kg の人がゆっくり登ります。まっすぐの道と遠回りの道で、重力に逆らう仕事をくらべます。',
      note: '重力は保存力（$U=mgz$）なので、仕事は道によらず、はじめとおわりの高さだけで決まります：$mg\\times(100-83)=50\\times9.8\\times17=8330$ J。遠回りすると、坂がゆるやかになって必要な力は小さくなりますが、進む距離が長くなり、かけた分は同じです。',
      miss: '$\\vec F_2=(-y,\\ x)$ は保存力ではないので、「はじめとおわりだけで決まる」は使えません。道ごとに計算します。',
      state: { u: 0, cx: 48, cy: -12 },
      legend: [['まっすぐの道', { color: 'b' }], ['遠回りの道', { color: 'a', style: 'dash' }], ['道の形を決める点（ドラッグ）', { color: 'a', shape: 'diamond', noline: true }], ['等高線（10 m ごと）', { color: 'c' }]],
      step(st, dt) { st.u = Math.min(1, st.u + dt * 0.25); if (st.u >= 1) return false; },
      drag: {
        hit(st, x, y) { const v = yview({ W: 880, H: 440 }), p = v.P([st.cx, st.cy]); return A.near(x, y, p[0], p[1], 24) ? 1 : null; },
        move(st, x, y) { const [a, b] = yview({ W: 880, H: 440 }).inv(x, y); st.cx = A.clamp(Math.round(a), -10, 60); st.cy = A.clamp(Math.round(b), -16, 40); st.u = 1; }
      },
      draw: drawYama,
      readout: st => `まっすぐ ${A.num(pathInfo(u => [30 * (1 - u), 20 * (1 - u)], st.u)[0], 0)} J、遠回り ${A.num(pathInfo(u => bez([st.cx, st.cy], u), st.u)[0], 0)} J（登りきると、どちらも 8330 J）`
    }
  ]
});
