// @id m3-17
// @title ばねと振り子：周期はゆれの大きさによる？
// @vol 数学6
// @from 数学 6-6 ③⑥⑦（ch6-06:302・346・642・724・986）、6-15 ⑤（ch6-15:306）
'use strict';
// ばね：m = 0.5 kg、k = 8 N/m、ω_n = 4 rad/s、周期 2π/4 ≒ 1.57 s。振り子：L = 1 m、g = 9.8 m/s²。
// 表計算は 6-2 の型（速度を先に進めるオイラー法）。ふつうのオイラー法は 6-6 ⑥ の「Δt = 0.05 で 0.04 J → 0.135 J」。
const TS = [0.393, 1.178, 1.963, 2.749];
const TRJ = {}, PEND = {}, PER = {};   // 計算した列をためておく

A.item({
  id: 'm3-17', title: 'ばねと振り子：周期はゆれの大きさによる？',
  from: '数学 第6巻 6-6 ③⑥⑦ の図から（6-15、5-15・5-17 でも使う）',
  W: 880, H: 440,
  state: { t: 0, amp: 6, meth: 'e', th0: 90 },
  scenes: [
    {
      key: 'sanbai', label: '① 2 cm と 6 cm',
      lead: '同じばねの2台の台車を、上は 2 cm、下は 6 cm 引いて、同時に手をはなします。どちらが先にもどってくるでしょう。▶ で動かしてみましょう。',
      note: '2台は、同じ時刻に0を通り（点線）、同じ時刻にもどります。3倍遠くからスタートした台車は、3倍強い力で引きもどされ、3倍の速さで走ります。**3倍の道のりを3倍の速さで走るので、かかる時間は同じ**です。周期 $2\\pi\\sqrt{\\frac{m}{k}}=\\frac{2\\pi}{4}\\approx1.57$ s には、振幅が入っていません。',
      miss: '「6 cm 引いたほうが、遠くまで行くので周期が長い」はまちがい。ばねなら周期は同じです。振り子は、ふれが小さければ同じです（③）。',
      legend: [['2 cm 引いた台車', { color: 'a' }], ['下の台車（引く量を変えられる）', { color: 'b', style: 'dash' }], ['0 を通る時刻', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'amp', label: '下の台車を引く量〔cm〕', min: 1, max: 10, step: 1, d: 0, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; if (st.t >= 3.3) { st.t = 3.3; return false; } },
      draw(cv, st) {
        const E = 430, S = 12;
        for (const [row, A_, col, sty] of [[0, 2, 'a', 'solid'], [1, st.amp, 'b', 'dash']]) {
          const yb = 82 + row * 78, x = A_ * Math.cos(4 * st.t);
          wall(cv, 60, yb - 52, yb); cv.line([[60, yb], [820, yb]], { color: 'ink', width: 1.8 });
          spring(cv, 60, E + x * S - 32, yb - 22, { n: 9, amp: 8 });
          cart(cv, E + x * S, yb, 64, 40, col, sty);
          cv.text(`${A_} cm 引いた`, 700, yb - 22, { size: 15, color: col, bold: true });
        }
        cv.line([[E, 22], [E, 166]], { color: 'sub', style: 'dash', width: 1.2 });
        cv.text('つり合いの位置', E, 14, { size: 14, color: 'sub', align: 'center' });
        const v = cv.view({ x0: 0, x1: 3.45, y0: -11, y1: 11, box: [80, 190, 740, 230] });
        v.axes({ xt: [0.785, 1.571, 2.356, 3.142], yt: [-10, -6, -2, 2, 6, 10], xl: 't（s）', yl: 'x（cm）', xfmt: x => A.num(x, 2) });
        for (const t of TS) v.line([[t, -11], [t, 11]], { color: 'sub', style: 'dot', width: 1.5 });
        v.plot(t => 2 * Math.cos(4 * t), { x0: 0, x1: Math.max(0.01, st.t), color: 'a', width: 3 });
        v.plot(t => st.amp * Math.cos(4 * t), { x0: 0, x1: Math.max(0.01, st.t), color: 'b', style: 'dash', width: 3 });
        v.dot(st.t, 2 * Math.cos(4 * st.t), { color: 'a', r: 5 }); v.dot(st.t, st.amp * Math.cos(4 * st.t), { color: 'b', r: 5, shape: 'square' });
      },
      readout: st => `周期：どちらも $2\\pi\\sqrt{\\frac{0.5}{8}}$ ≒ 1.57 s　　${A.num(st.t, 2)} 秒：上 ${A.num(2 * Math.cos(4 * st.t), 2)} cm、下 ${A.num(st.amp * Math.cos(4 * st.t), 2)} cm（いつも ${A.num(st.amp / 2, 1)} 倍）`
    },
    {
      key: 'energy', label: '② エネルギーの棒',
      lead: '0.1 m 引いてはなした台車の、ばねのエネルギー $\\frac{1}{2}kx^2$ と運動エネルギー $\\frac{1}{2}mv^2$ を棒で見ます。計算の方法も変えてみましょう。',
      note: 'はしではばねのエネルギーだけ、まん中では運動エネルギーだけ。2つは入れかわりますが、**合計はいつも 0.04 J** です。表計算のチェックにも使えます。速度を先に進める方法（$\\Delta t=0.01$）では合計は 0.039〜0.041 のあいだ。ふつうのオイラー法（$\\Delta t=0.05$）では、1周期で 0.04 J が 0.135 J にふえてしまいます（計算の方法のせい）。',
      legend: [['ばねのエネルギー $\\frac{1}{2}kx^2$', { color: 'a' }], ['運動エネルギー $\\frac{1}{2}mv^2$', { color: 'b' }], ['合計', { color: 'd' }]],
      controls: [{ seg: 'meth', label: '計算の方法', options: [['e', '式の答え'], ['s', '速度を先に（Δt＝0.01）'], ['f', 'ふつう（Δt＝0.05）']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.4; if (st.t >= 6.3) { st.t = 6.3; return false; } },
      draw(cv, st) {
        const tr = traj(st.meth), cur = at(tr, st.t), [, x, vv] = cur;
        const Ek = 0.25 * vv * vv, Es = 4 * x * x;
        // 台車（上）
        const yb = 92, E0 = 300, S = 1000, cx = E0 + A.clamp(x, -0.25, 0.25) * S;
        wall(cv, 30, yb - 52, yb); cv.line([[30, yb], [580, yb]], { color: 'ink', width: 1.8 });
        cv.line([[E0, 30], [E0, yb + 4]], { color: 'sub', style: 'dash', width: 1.2 });
        spring(cv, 30, cx - 32, yb - 22, { n: 9, amp: 8 }); cart(cv, cx, yb, 64, 40, 'b', 'solid');
        if (Math.abs(x) > 0.25) cv.text(`x = ${A.num(x, 2)} m（画面の外）`, E0, 20, { size: 15, color: 'b', align: 'center', bold: true });
        // x のグラフ（左下）
        const v = cv.view({ x0: 0, x1: 6.5, y0: -0.25, y1: 0.25, box: [70, 140, 500, 270] });
        v.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-0.2, -0.1, 0.1, 0.2], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, q % 1 ? 1 : 0) });
        v.plot(t => 0.1 * Math.cos(4 * t), { x0: 0, x1: 6.3, color: 'sub', width: 1, alpha: 0.6 });
        v.clip(() => v.line(tr.filter(q => q[0] <= st.t + 1e-9).map(q => [q[0], q[1]]), { color: 'b', width: 2.5 }));
        // 棒（右）
        const base = 400, H = 300, sc = H / 0.05, bars = [['ばね', Es, 'a'], ['運動', Ek, 'b'], ['合計', Es + Ek, 'd']];
        cv.line([[620, base], [860, base]], { color: 'ink', width: 1.5 });
        for (const yv of [0.01, 0.02, 0.03, 0.04, 0.05]) { cv.line([[620, base - yv * sc], [860, base - yv * sc]], { color: 'grid', width: 1 }); cv.text(A.num(yv, 2), 614, base - yv * sc, { size: 14, align: 'right', color: 'sub' }); }
        cv.text('（J）', 600, base - H - 18, { size: 14, color: 'sub' });
        bars.forEach(([name, val, col], k) => {
          const x0 = 640 + k * 76, h = Math.min(val, 0.052) * sc;
          cv.rect(x0, base - h, 52, h, { fill: col, alpha: k === 2 ? 0.55 : 0.4, color: col, width: 2 });
          cv.text(name, x0 + 26, base + 16, { size: 15, align: 'center' });
          cv.text(A.num(val, 3), x0 + 26, base - h - 12, { size: 15, align: 'center', bold: k === 2, bg: true });
          if (val > 0.052) cv.arrow(x0 + 26, base - h + 30, x0 + 26, base - h - 2, { color: col, width: 3 });
        });
        cv.line([[634, base - 0.04 * sc], [860, base - 0.04 * sc]], { color: 'd', style: 'dash', width: 1.2 });
      },
      readout: st => { const [, x, v] = at(traj(st.meth), st.t); return `${A.num(st.t, 2)} 秒：ばね ${A.num(4 * x * x, 4)} J ＋ 運動 ${A.num(0.25 * v * v, 4)} J ＝ <b>合計 ${A.num(4 * x * x + 0.25 * v * v, 4)} J</b>（はじめ 0.04 J）`; }
    },
    {
      key: 'furiko', label: '③ 振り子は大きいと遅れる',
      lead: '長さ 1 m の振り子を、10° と、もっと大きな角から同時にはなします。$\\frac{d^2\\theta}{dt^2}=-\\frac{g}{L}\\sin\\theta$ のまま、速度を先に進める方法（$\\Delta t=0.001$ s）で計算しています。',
      note: '10° の周期は 2.01 秒（小さいふれの式 $2\\pi\\sqrt{\\frac{L}{g}}\\approx2.007$ 秒とほぼ同じ）。90° では 2.37 秒、150° では 3.54 秒です。ふれが大きいと $\\sin\\theta$ は $\\theta$ よりずっと小さく、引きもどす力が弱いので、ゆっくりもどってきます。グラフは、角をはじめの角 $\\theta_0$ でわった値です。',
      miss: 'ばねの「周期はゆれの大きさによらない」を、振り子にもそのまま使うのはまちがい。振り子がそうなるのは、ふれが小さいとき（$\\sin\\theta\\approx\\theta$）だけです。',
      legend: [['10° からはなした', { color: 'a' }], ['$\\theta_0$ からはなした', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'th0', label: 'はじめの角 $\\theta_0$', min: 10, max: 170, step: 5, fmt: v => v + '°', on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; if (st.t >= 4.3) { st.t = 4.3; return false; } },
      draw(cv, st) {
        const A10 = pend(10), Ab = pend(st.th0), a1 = atP(A10, st.t), a2 = atP(Ab, st.t);
        [[110, a1, 'a', 'solid', '10°'], [330, a2, 'b', 'dash', st.th0 + '°']].forEach(([px, th, col, sty, s]) => {
          const py = 200, L = 120;
          cv.line([[px - 40, py], [px + 40, py]], { color: 'ink', width: 3 });
          cv.line([[px, py], [px, py + L + 20]], { color: 'grid', width: 1, style: 'dot' });
          const bx = px + L * Math.sin(th), by = py + L * Math.cos(th);
          cv.line([[px, py], [bx, by]], { color: col, width: 2.5, style: sty });
          cv.circle(bx, by, 13, { fill: col, alpha: 0.8, color: col, width: 2 });
          cv.text('はじめ ' + s, px, 40, { size: 16, bold: true, align: 'center', color: col });
        });
        const v = cv.view({ x0: 0, x1: 4.4, y0: -1.25, y1: 1.3, box: [470, 30, 390, 380] });
        v.axes({ xt: [1, 2, 3, 4], yt: [-1, 1], xl: 't（s）', yl: 'θ÷θ₀' });
        v.line(A10.filter(q => q[0] <= st.t + 1e-9).map(q => [q[0], q[1] / A10[0][1]]), { color: 'a', width: 2.5 });
        v.line(Ab.filter(q => q[0] <= st.t + 1e-9).map(q => [q[0], q[1] / Ab[0][1]]), { color: 'b', width: 2.5, style: 'dash' });
        const T1 = period(10), T2 = period(st.th0);
        if (st.t > T1) { v.line([[T1, -1.2], [T1, 1.2]], { color: 'a', style: 'dot', width: 1.2 }); }
        if (st.t > T2 && T2 < 4.4) { v.line([[T2, -1.2], [T2, 1.2]], { color: 'b', style: 'dot', width: 1.2 }); }
      },
      readout: st => { const T1 = period(10), T2 = period(st.th0), r = st.th0 * Math.PI / 180; return `周期：10° は ${A.num(T1, 2)} 秒、${st.th0}° は <b>${A.num(T2, 2)} 秒</b>（${A.num((T2 / T1 - 1) * 100, 0)} % 長い）　$\\frac{\\sin\\theta_0}{\\theta_0}=$ ${A.num(Math.sin(r) / r, 3)}`; }
    }
  ]
});

// ばねの動き（0.1 m 引いてはなす）を 6.4 秒まで。[t, x, v]
function traj(meth) {
  if (TRJ[meth]) return TRJ[meth];
  const p = [];
  if (meth === 'e') { for (let i = 0; i <= 640; i++) { const t = i * 0.01; p.push([t, 0.1 * Math.cos(4 * t), -0.4 * Math.sin(4 * t)]); } }
  else {
    const dt = meth === 's' ? 0.01 : 0.05; let x = 0.1, v = 0; p.push([0, x, v]);
    for (let i = 1; i * dt <= 6.4 + 1e-9; i++) { const a = -16 * x; if (meth === 's') { v += a * dt; x += v * dt; } else { const xn = x + v * dt; v += a * dt; x = xn; } p.push([i * dt, x, v]); }
  }
  return (TRJ[meth] = p);
}
function at(p, t) { let q = p[0]; for (const r of p) { if (r[0] <= t + 1e-9) q = r; else break; } return q; }
// 振り子（本のプログラムと同じ：速度を先に、Δt = 0.001）。10 歩ごとに [t, θ] を残す
function pend(deg) {
  if (PEND[deg]) return PEND[deg];
  let th = deg * Math.PI / 180, om = 0; const dt = 0.001, p = [[0, th]];
  for (let i = 1; i <= 4400; i++) { om += -9.8 * Math.sin(th) * dt; th += om * dt; if (i % 10 === 0) p.push([i * dt, th]); }
  return (PEND[deg] = p);
}
function atP(p, t) { const k = Math.min(p.length - 1, Math.round(t / 0.01)); return p[k][1]; }
// 本のプログラムと同じ：まん中を初めて通る時刻 × 4
function period(deg) {
  if (PER[deg]) return PER[deg];
  let th = deg * Math.PI / 180, om = 0, t = 0; const dt = 0.001;
  for (;;) { om += -9.8 * Math.sin(th) * dt; const th2 = th + om * dt; t += dt; if (th > 0 && th2 <= 0) break; th = th2; }
  return (PER[deg] = 4 * t);
}
function wall(cv, x, y0, y1) { cv.line([[x, y0], [x, y1]], { color: 'ink', width: 2.5 }); for (let y = y0; y < y1; y += 10) cv.line([[x, y], [x - 8, y + 8]], { color: 'sub', width: 1.2 }); }
function spring(cv, x1, x2, y, o = {}) {
  const n = o.n || 10, amp = o.amp || 9, lead = Math.min(12, (x2 - x1) * 0.12), L = x2 - x1 - 2 * lead, pts = [[x1, y], [x1 + lead, y]];
  for (let k = 0; k < 2 * n; k++) pts.push([x1 + lead + L * (k + 0.5) / (2 * n), y + (k % 2 ? amp : -amp)]);
  pts.push([x2 - lead, y], [x2, y]);
  cv.line(pts, { color: 'ink', width: 2 });
}
// 台車（x はまん中、yb は床）
function cart(cv, x, yb, w, h, col, sty) {
  cv.rect(x - w / 2, yb - h - 6, w, h, { fill: col, alpha: 0.28, color: col, width: 2, style: sty });
  cv.circle(x - w / 4, yb - 3, 3.5, { color: 'ink', width: 1.5 }); cv.circle(x + w / 4, yb - 3, 3.5, { color: 'ink', width: 1.5 });
}
