// @id m3-18
// @title ダンパーの強さと止まり方：ブレーキは強いほどよい？
// @vol 数学6
// @from 数学 6-7 ③⑤（ch6-07:269・313・490・721）、6-12 ①、6-14 ④（状態の点）、6-15
'use strict';
// m = 0.5 kg、k = 8 N/m（ω_n = 4）、はじめ x = 0.1 m・v = 0。臨界 c_c = 2√(mk) = 4、ζ = c/4。
// 式の答え（6-12）をそのまま使う：ζ<1 はゆれながら、ζ=1 はちょうど、ζ>1 はゆっくり。
const X0 = 0.1;
function xv(c, t) {
  if (Math.abs(c - 4) < 1e-9) return [X0 * (1 + 4 * t) * Math.exp(-4 * t), -1.6 * t * Math.exp(-4 * t)];
  if (c < 4) { const wd = Math.sqrt(16 - c * c), e = Math.exp(-c * t); return [X0 * e * (Math.cos(wd * t) + c / wd * Math.sin(wd * t)), -X0 * e * 16 / wd * Math.sin(wd * t)]; }
  const r = Math.sqrt(c * c - 16), s1 = -c + r, s2 = -c - r, e1 = Math.exp(s1 * t), e2 = Math.exp(s2 * t);
  return [X0 * (s2 * e1 - s1 * e2) / (s2 - s1), X0 * s1 * s2 * (e1 - e2) / (s2 - s1)];
}
const xs = c => t => xv(c, t)[0];
const over = c => c < 4 ? 100 * Math.exp(-c * Math.PI / Math.sqrt(16 - c * c)) : 0;
// |x| が 0.002（はじめの 2 %）より小さくなって、もう出なくなる時刻
function settle(c) { let last = 0; for (let t = 0; t < 30; t += 0.002) if (Math.abs(xs(c)(t)) >= 0.002) last = t; return last; }
const BOOK = [[0.4, 73, 9.59], [1, 44, 3.53], [2, 16, 2.02], [3, 2.8, 1.43], [3.5, 0.3, 1.11], [4, 0, 1.46], [5, 0, 2.10], [10, 0, 4.74]];
const kind = c => c < 4 - 1e-9 ? 'ゆれながら止まる（減衰振動）' : c < 4 + 1e-9 ? 'ちょうど（臨界）' : 'ゆれずに、ゆっくりもどる';
const CACHE = {};

A.item({
  id: 'm3-18', title: 'ダンパーの強さと止まり方：ブレーキは強いほどよい？',
  from: '数学 第6巻 6-7 ③⑤ の図から（6-12・6-14・6-15、RLC 回路でも使う）',
  W: 880, H: 440,
  state: { c: 0.4, t: 0 },
  scenes: [
    {
      key: 'tomari', label: '① 3つの止まり方',
      lead: 'ばね（0.5 kg・8 N/m）の台車にダンパーをつけ、0.1 m 引いてはなします。ダンパーの強さ $c$ を変えると、止まり方はどう変わるでしょう。',
      note: 'ばねの力 $-kx$ は位置と反対向きで、はしで最大。ダンパーの力 $-c\\,v$ は速度と反対向きで、まん中（速さが最大）で最大です。$\\zeta=\\frac{c}{2\\sqrt{mk}}=\\frac{c}{4}$ が1より小さいとゆれながら止まり、1でちょうど、1より大きいとゆれずにゆっくりもどります。',
      miss: 'ダンパーの力を、位置と反対向きと考えるのはまちがい。右のはしでは止まっている（速度0）ので、ダンパーの力は0です。',
      legend: [['いまの $c$', { color: 'ink' }], ['$c=0.4$', { color: 'a', style: 'dot' }], ['$c=4$', { color: 'b', style: 'dash' }], ['$c=10$', { color: 'd', style: 'dashdot' }], ['ばねの力', { color: 'b' }], ['ダンパーの力', { color: 'c', style: 'dash' }]],
      controls: [{ range: 'c', label: 'ダンパーの強さ $c$〔N·s/m〕', min: 0, max: 12, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.6; if (st.t >= 6.2) { st.t = 6.2; return false; } },
      draw(cv, st) {
        const [x, v] = xv(st.c, st.t);
        const yb = 96, E = 420, S = 1100, cx = E + x * S;
        wall(cv, 60, yb - 70, yb); cv.line([[60, yb], [820, yb]], { color: 'ink', width: 1.8 });
        cv.line([[E, 18], [E, yb + 4]], { color: 'sub', style: 'dash', width: 1.2 });
        spring(cv, 60, cx - 36, yb - 50, 9); damper(cv, 60, cx - 36, yb - 22);
        cart(cv, cx, yb, 72, 56, 'e');
        const Fs = -8 * x, Fd = -st.c * v, k = 140;
        if (Math.abs(Fs) > 0.01) cv.arrow(cx, yb - 66, cx + Fs * k, yb - 66, { color: 'b', width: 3.5 });
        if (Math.abs(Fd) > 0.01) cv.arrow(cx, yb - 10, cx + Fd * k, yb - 10, { color: 'c', width: 3.5, style: 'dash' });
        cv.text('ばね', 690, yb - 52, { size: 15, color: 'b' }); cv.text('ダンパー', 690, yb - 22, { size: 15, color: 'c' });
        const g = cv.view({ x0: 0, x1: 6.4, y0: -0.085, y1: 0.115, box: [80, 140, 760, 280] });
        g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-0.05, 0.05, 0.1], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, 2), xfmt: q => A.num(q, 0) });
        g.plot(xs(0.4), { x0: 0, x1: 6.3, color: 'a', style: 'dot', width: 2, alpha: 0.8 });
        g.plot(xs(4), { x0: 0, x1: 6.3, color: 'b', style: 'dash', width: 2, alpha: 0.8 });
        g.plot(xs(10), { x0: 0, x1: 6.3, color: 'd', style: 'dashdot', width: 2, alpha: 0.8 });
        g.plot(xs(st.c), { x0: 0, x1: Math.max(0.01, st.t), color: 'ink', width: 3.5 });
        g.dot(st.t, x, { color: 'ink', r: 6 });
      },
      readout: st => `$c=$ ${A.num(st.c, 1)}　$\\zeta=\\frac{c}{4}=$ ${A.num(st.c / 4, 3)}：<b>${kind(st.c)}</b>　　ばねの力 ${A.num(-8 * xv(st.c, st.t)[0], 2)} N、ダンパーの力 ${A.num(-st.c * xv(st.c, st.t)[1], 2)} N`
    },
    {
      key: 'jotai', label: '② 状態の点 (x, v)',
      lead: '横に位置 $x$、たてに速度 $v$ をとった平面に、その時刻の状態を点で打ちます。▶ で点がどう動くか見てみましょう。',
      note: 'ダンパーがない（$c=0$）と、点は同じだ円を時計回りに回り続けます。ダンパーがあると、エネルギーがへるので、点はうずをまいて原点（位置0・速度0、止まった状態）に近づきます。$\\zeta\\geqq1$ では、うずをまかずに原点へ向かいます。',
      legend: [['状態の点 $(x,\\ v)$ の動き', { color: 'b' }], ['スタート', { color: 'b', shape: 'circle', noline: true }], ['ダンパーなしのだ円', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'c', label: 'ダンパーの強さ $c$〔N·s/m〕', min: 0, max: 12, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.6; if (st.t >= 9) { st.t = 9; return false; } },
      draw(cv, st) {
        const P = cv.view({ x0: -0.145, x1: 0.145, y0: -0.52, y1: 0.52, box: [70, 25, 390, 380] });
        P.axes({ xt: [-0.1, 0.1], yt: [-0.4, 0.4], xl: '位置 x（m）', yl: '速度 v（m/s）', fmt: q => A.num(q, 1) });
        P.param(t => 0.1 * Math.cos(4 * t), t => -0.4 * Math.sin(4 * t), 0, Math.PI / 2, { color: 'sub', style: 'dash', width: 1.5 });
        const pts = []; for (let t = 0; t <= st.t + 1e-9; t += 0.01) pts.push(xv(st.c, t));
        P.line(pts, { color: 'b', width: 2.5 });
        P.dot(0.1, 0, { color: 'b', r: 6, open: true });
        const [x, v] = xv(st.c, st.t); P.dot(x, v, { color: 'b', r: 7 });
        P.dot(0, 0, { color: 'ink', r: 4 }); P.text('止まった状態', 0.004, -0.06, { size: 15, color: 'sub', bg: true });
        const g = cv.view({ x0: 0, x1: 9.2, y0: -0.085, y1: 0.115, box: [530, 60, 320, 300] });
        g.axes({ xt: [2, 4, 6, 8], yt: [-0.05, 0.05, 0.1], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, 2), xfmt: q => A.num(q, 0) });
        g.plot(xs(st.c), { x0: 0, x1: Math.max(0.01, st.t), color: 'b', width: 2.5 });
        g.dot(st.t, x, { color: 'b', r: 5 });
      },
      readout: st => { const [x, v] = xv(st.c, st.t); return `${A.num(st.t, 2)} 秒：状態 $(x,\\ v)=$（${A.num(x, 3)} m, ${A.num(v, 3)} m/s）　エネルギー $\\frac{1}{2}mv^2+\\frac{1}{2}kx^2=$ ${A.num(0.25 * v * v + 4 * x * x, 4)} J`; }
    },
    {
      key: 'hayasa', label: '③ いちばん早く止まるのは',
      lead: 'ダンパーの強さ $c$ を変えて、「行きすぎ」と「落ち着く時刻」（$|x|$ がはじめの 2 % の 0.002 m より小さくなって、もう出なくなる時刻）をくらべます。',
      note: '行きすぎがなくなる境目は $c=4$（$\\zeta=1$）で、そのとき落ち着くまでがいちばん短く（1.46 秒）、それより強くすると、かえって時間がかかります（$c=10$ で 4.74 秒）。$\\zeta$ を1より少しだけ小さく（$c=3.5$）すると、ほんの少し（0.3 %）行きすぎるかわりに、もっと早く（1.11 秒）落ち着きます。黒い点は本の表の値です。',
      miss: '「ブレーキが強いほど、早く止まる」はまちがい。強すぎるダンパーは、もどる動きもじゃまします。$c=10$ は2秒たっても、まだ約 2 cm 残っています。',
      legend: [['計算した曲線', { color: 'a' }], ['本の表の値', { color: 'ink', shape: 'circle', noline: true }], ['いまの $c$', { color: 'b', shape: 'diamond', noline: true }], ['はじめの 2 % のはば', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'c', label: 'ダンパーの強さ $c$〔N·s/m〕', min: 0.4, max: 12, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; st.c = 1; st.dir = 1; },
      step(st, dt) { st.c = A.clamp(st.c + st.dir * dt * 1.2, 0.4, 12); if (st.c >= 12 || st.c <= 0.4) st.dir *= -1; },
      draw(cv, st) {
        const cur = curves();
        const g1 = cv.view({ x0: 0, x1: 12.4, y0: 0, y1: 85, box: [80, 25, 420, 160] });
        g1.axes({ xt: [2, 4, 6, 8, 10, 12], yt: [25, 50, 75], xl: 'c', yl: '行きすぎ（%）' });
        g1.line(cur.map(q => [q[0], q[1]]), { color: 'a', width: 2.5 });
        const g2 = cv.view({ x0: 0, x1: 12.4, y0: 0, y1: 11, box: [80, 235, 420, 170] });
        g2.axes({ xt: [2, 4, 6, 8, 10, 12], yt: [2, 4, 6, 8, 10], xl: 'c', yl: '落ち着く時刻（s）' });
        g2.line(cur.map(q => [q[0], q[2]]), { color: 'a', width: 2.5 });
        for (const [c, o, s] of BOOK) { g1.dot(c, o, { color: 'ink', r: 4 }); g2.dot(c, s, { color: 'ink', r: 4 }); }
        const se = settle(st.c), ov = over(st.c);
        g1.dot(st.c, ov, { color: 'b', shape: 'diamond', r: 8 }); g2.dot(st.c, se, { color: 'b', shape: 'diamond', r: 8 });
        g2.line([[4, 0], [4, 11]], { color: 'sub', style: 'dot', width: 1.2 }); g2.text('ζ = 1', 4.2, 10.2, { size: 15, color: 'sub' });
        const g = cv.view({ x0: 0, x1: 6.2, y0: -0.085, y1: 0.11, box: [560, 40, 300, 330] });
        g.axes({ xt: [2, 4, 6], yt: [-0.05, 0.05, 0.1], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, 2), xfmt: q => A.num(q, 0) });
        g.line([[0, 0.002], [6, 0.002]], { color: 'c', style: 'dot', width: 1.5 }); g.line([[0, -0.002], [6, -0.002]], { color: 'c', style: 'dot', width: 1.5 });
        g.plot(xs(st.c), { x0: 0, x1: 6.1, color: 'b', width: 2.5 });
        if (se < 6.2) { g.line([[se, -0.08], [se, 0.1]], { color: 'b', style: 'dash', width: 1.5 }); g.text('落ち着いた', se + 0.1, 0.09, { size: 15, color: 'b', bg: true }); }
      },
      readout: st => `$c=$ ${A.num(st.c, 1)}（$\\zeta=$ ${A.num(st.c / 4, 2)}）：行きすぎ <b>${A.num(over(st.c), 1)} %</b>、落ち着く時刻 <b>約 ${A.num(settle(st.c), 1)} 秒</b>`
    }
  ]
});

function curves() {
  if (CACHE.cur) return CACHE.cur;
  const p = []; for (let c = 0.4; c <= 12.001; c += 0.1) p.push([c, over(c), settle(c)]);
  return (CACHE.cur = p);
}
function wall(cv, x, y0, y1) { cv.line([[x, y0], [x, y1]], { color: 'ink', width: 2.5 }); for (let y = y0; y < y1; y += 10) cv.line([[x, y], [x - 8, y + 8]], { color: 'sub', width: 1.2 }); }
function spring(cv, x1, x2, y, n) {
  const amp = 7, lead = 10, L = x2 - x1 - 2 * lead, pts = [[x1, y], [x1 + lead, y]];
  for (let k = 0; k < 2 * n; k++) pts.push([x1 + lead + L * (k + 0.5) / (2 * n), y + (k % 2 ? amp : -amp)]);
  pts.push([x2 - lead, y], [x2, y]);
  cv.line(pts, { color: 'ink', width: 2 });
}
// ダンパー（つつと、ピストン）
function damper(cv, x1, x2, y) {
  const m = (x1 + x2) / 2;
  cv.line([[x1, y], [x1 + 30, y]], { color: 'ink', width: 2 });
  cv.line([[x1 + 30, y - 10], [m + 30, y - 10]], { color: 'ink', width: 2 }); cv.line([[x1 + 30, y + 10], [m + 30, y + 10]], { color: 'ink', width: 2 }); cv.line([[x1 + 30, y - 10], [x1 + 30, y + 10]], { color: 'ink', width: 2 });
  const pp = Math.min(m + 20, x2 - 14);
  cv.line([[pp, y - 7], [pp, y + 7]], { color: 'ink', width: 3 }); cv.line([[pp, y], [x2, y]], { color: 'ink', width: 2 });
}
function cart(cv, x, yb, w, h, col) {
  cv.rect(x - w / 2, yb - h - 6, w, h, { fill: col, alpha: 0.3, color: col, width: 2 });
  cv.circle(x - w / 4, yb - 3, 3.5, { color: 'ink', width: 1.5 }); cv.circle(x + w / 4, yb - 3, 3.5, { color: 'ink', width: 1.5 });
}
