// @id m3-23
// @title ゆすり続けると：強制振動と共振
// @vol 数学6
// @from 数学 6-13 ②③⑥⑦⑧⑨（ch6-13:224・236・451・633・720・844・851）
'use strict';
// ばね m=0.5 kg、k=8 N/m、c=0.4 N·s/m（ω_n=4、ζ=0.1）を、F0=0.8 N の力 F0 cos ωt でゆする。はじめは止まっている。
// 表計算は 6-13 ② と同じ（速度を先に進めるオイラー法、Δt=0.01 s、20 秒まで）。
const M = 0.5, K = 8, C = 0.4, F0 = 0.8;
const amp = w => F0 / Math.hypot(K - M * w * w, C * w);
const lag = w => Math.atan2(C * w, K - M * w * w);
const SIM = {};
// 表計算の型：B3=0.8*COS(ω*A3)、D3=D2+E2*Δt、C3=C2+D3*Δt、E3=(B3−0.4*D3−8*C3)/0.5 を、そのまま1行ずつ
function simBook(w) {
  const key = 'b' + w.toFixed(2); if (SIM[key]) return SIM[key];
  const dt = 0.01, p = [[0, 0, 0]]; let x = 0, v = 0, a = (F0 - C * 0 - K * 0) / M, mx = 0;
  for (let i = 1; i <= 2000; i++) { const t = i * dt; v = v + a * dt; x = x + v * dt; a = (F0 * Math.cos(w * t) - C * v - K * x) / M; p.push([t, x, v]); mx = Math.max(mx, Math.abs(x)); }
  p.mx = mx; return (SIM[key] = p);
}
const BOOKPTS = [[1, 0.107], [2, 0.132], [3, 0.216], [3.5, 0.342], [3.8, 0.468], [4, 0.5], [4.2, 0.428], [4.5, 0.287], [5, 0.162], [6, 0.078], [8, 0.033]];

A.item({
  id: 'm3-23', title: 'ゆすり続けると：強制振動と共振',
  from: '数学 第6巻 6-13 ②③⑥⑦⑧⑨ の図から（ラジオの同調、物理 波動・電磁気でも使う）',
  W: 880, H: 440,
  state: { w: 4, t: 0, z: 0.1, r: 1, w2: 2 },
  scenes: [
    {
      key: 'yusuru', label: '① ゆする速さ ω',
      lead: '止まっている台車（0.5 kg・8 N/m・ダンパー 0.4）を、力 $0.8\\cos\\omega t$〔N〕でゆすり続けます。ゆする速さ $\\omega$ を変えて、▶ で 20 秒ゆすってみましょう。',
      note: 'はじめの数秒はごちゃごちゃしますが、やがて、ゆすった $\\omega$ と同じリズムで、同じ大きさでゆれ続けます。ゆれの大きさは $\\omega=2$ で 0.132 m、$\\omega=4$（ちょうど $\\omega_{\\mathrm n}$）で 0.5 m、$\\omega=8$ で 0.033 m。力は同じ 0.8 N なのに、ちょうど $\\omega_{\\mathrm n}$ でゆすると、ゆっくりおし続けたときののび 0.1 m の5倍もゆれます（**共振**）。',
      legend: [['台車の位置 $x$（表計算 $\\Delta t=0.01$）', { color: 'a' }], ['やがて落ち着くゆれの大きさ', { color: 'sub', style: 'dash' }], ['ゆする力', { color: 'b' }], ['共振曲線の上のいまの $\\omega$', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'w', label: 'ゆする速さ $\\omega$〔rad/s〕', min: 0.5, max: 8, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 2; if (st.t >= 20) { st.t = 20; return false; } },
      draw(cv, st) {
        const p = simBook(st.w), k = Math.min(2000, Math.round(st.t / 0.01)), [, x] = p[k], F = F0 * Math.cos(st.w * st.t);
        const yb = 120, E = 300, S = 220, cx = E + x * S;
        wall(cv, 40, yb - 64, yb); cv.line([[40, yb], [540, yb]], { color: 'ink', width: 1.8 });
        cv.line([[E, 30], [E, yb + 4]], { color: 'sub', style: 'dash', width: 1.2 });
        spring(cv, 40, cx - 30, yb - 44); damper(cv, 40, cx - 30, yb - 18);
        cv.rect(cx - 30, yb - 58, 60, 52, { fill: 'a', alpha: 0.3, color: 'a', width: 2 });
        cv.arrow(cx + 32, yb - 32, cx + 32 + F * 110, yb - 32, { color: 'b', width: 4 });
        cv.text('ゆする力', cx + 32 + Math.max(F * 110, 0) + 6, yb - 50, { size: 15, color: 'b' });
        // 共振曲線（右上）
        const R = cv.view({ x0: 0, x1: 8.4, y0: 0, y1: 0.58, box: [600, 18, 260, 140] });
        R.axes({ xt: [2, 4, 6, 8], yt: [0.25, 0.5], xl: 'ω', yl: '振幅（m）', fmt: q => A.num(q, q % 1 ? 2 : 0) });
        R.plot(amp, { x0: 0.05, x1: 8.3, color: 'sub', width: 2 });
        R.dot(st.w, amp(st.w), { color: 'b', shape: 'diamond', r: 7 });
        // x のグラフ（下）
        const top = Math.max(0.05, p.mx * 1.15);
        const g = cv.view({ x0: 0, x1: 20.5, y0: -top, y1: top, box: [80, 190, 780, 235] });
        g.axes({ xt: [5, 10, 15, 20], yt: [-amp(st.w), amp(st.w)], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, 3), xfmt: q => A.num(q, 0) });
        g.line([[0, amp(st.w)], [20, amp(st.w)]], { color: 'sub', style: 'dash', width: 1.5 }); g.line([[0, -amp(st.w)], [20, -amp(st.w)]], { color: 'sub', style: 'dash', width: 1.5 });
        g.line(p.slice(0, k + 1).map(q => [q[0], q[1]]), { color: 'a', width: 2 });
        g.dot(st.t, x, { color: 'a', r: 5 });
      },
      readout: st => `$\\omega=$ ${A.num(st.w, 1)}：落ち着いたあとのゆれの大きさ $|X|=\\frac{0.8}{\\sqrt{(8-0.5\\omega^2)^2+(0.4\\omega)^2}}=$ <b>${A.num(amp(st.w), 3)} m</b>（0.1 m の ${A.num(amp(st.w) / 0.1, 2)} 倍）`
    },
    {
      key: 'kyoshin', label: '② 共振曲線と ζ',
      lead: '共振曲線は、ゆする速さ（$\\omega÷\\omega_{\\mathrm n}$）と、落ち着いたあとの振幅（ゆっくりおし続けたときののび $\\frac{F_0}{k}$ の何倍か）のグラフです。ダンパーの強さ $\\zeta$ を変えてみましょう。',
      note: 'ダンパーが弱い（$\\zeta$ が小さい）ほど、山は高く、細くとがります。$\\zeta=0.05$ で約 10 倍、0.1 で約 5 倍、0.5 で 1.15 倍。山のてっぺんは $\\omega=\\omega_{\\mathrm n}\\sqrt{1-2\\zeta^2}$ で、高さは $\\frac{1}{2\\zeta\\sqrt{1-\\zeta^2}}$ 倍。$\\zeta>\\frac{1}{\\sqrt2}\\approx0.707$ では山がなくなります。黒い点は本の表（$\\zeta=0.1$）の値です。',
      miss: '「共振すると、振幅は無限大になる」はまちがい。ダンパーがあれば有限です（$\\zeta=0.1$ なら約5倍）。また、「山はいつもちょうど $\\omega_{\\mathrm n}$」もまちがい。山は $\\omega_{\\mathrm n}\\sqrt{1-2\\zeta^2}$ で、$\\zeta=0.5$ なら $0.707\\omega_{\\mathrm n}$ まで左にずれます。',
      legend: [['いまの $\\zeta$', { color: 'ink' }], ['$\\zeta=0.05$', { color: 'd', style: 'dot' }], ['$\\zeta=0.1$', { color: 'b', style: 'dash' }], ['$\\zeta=0.2$', { color: 'a', style: 'dashdot' }], ['$\\zeta=0.5$', { color: 'e', style: 'long' }], ['山のてっぺん', { color: 'ink', shape: 'tri', noline: true }]],
      controls: [{ range: 'z', label: '減衰比 $\\zeta$', min: 0.05, max: 0.8, step: 0.01, d: 2 }, { range: 'r', label: '$\\omega÷\\omega_{\\mathrm n}$', min: 0.05, max: 2.5, step: 0.01, d: 2 }],
      init(st) { st.r = 0.05; },
      step(st, dt) { st.r += dt * 0.25; if (st.r >= 2.5) { st.r = 2.5; return false; } },
      draw(cv, st) {
        const H = (z, r) => 1 / Math.hypot(1 - r * r, 2 * z * r);
        const V = cv.view({ x0: 0, x1: 2.6, y0: 0, y1: 11, box: [80, 20, 770, 390] });
        V.axes({ xt: [0.5, 1, 1.5, 2, 2.5], yt: [1, 5, 10], xl: 'ω ÷ ω_n', yl: '振幅 ÷ (F0/k)' });
        [[0.05, 'd', 'dot'], [0.1, 'b', 'dash'], [0.2, 'a', 'dashdot'], [0.5, 'e', 'long']].forEach(([z, col, sty]) => V.plot(r => H(z, r), { x0: 0, x1: 2.5, color: col, style: sty, width: 1.8, alpha: 0.8, n: 600 }));
        BOOKPTS.forEach(([w, a]) => V.dot(w / 4, a / 0.1, { color: 'ink', r: 3.5 }));
        V.plot(r => H(st.z, r), { x0: 0, x1: 2.5, color: 'ink', width: 3.5, n: 800 });
        if (st.z < Math.SQRT1_2) { const rp = Math.sqrt(1 - 2 * st.z * st.z), hp = 1 / (2 * st.z * Math.sqrt(1 - st.z * st.z)); if (hp < 11) { V.dot(rp, hp, { color: 'ink', shape: 'tri', r: 7 }); V.text(`山 ${A.num(hp, 2)} 倍（ω = ${A.num(rp, 3)} ω_n）`, rp + 0.05, Math.min(10.4, hp + 0.5), { size: 15, bg: true }); } }
        V.line([[1, 0], [1, 11]], { color: 'sub', style: 'dot', width: 1.2 });
        const h = H(st.z, st.r); if (h < 11) V.dot(st.r, h, { color: 'c', shape: 'diamond', r: 8 });
      },
      readout: st => { const h = 1 / Math.hypot(1 - st.r * st.r, 2 * st.z * st.r); return `$\\zeta=$ ${A.num(st.z, 2)}、$\\omega÷\\omega_{\\mathrm n}=$ ${A.num(st.r, 2)}：振幅は $\\frac{F_0}{k}$ の <b>${A.num(h, 2)} 倍</b>　` + (st.z < Math.SQRT1_2 ? `山 $\\frac{1}{2\\zeta\\sqrt{1-\\zeta^2}}=$ ${A.num(1 / (2 * st.z * Math.sqrt(1 - st.z * st.z)), 2)} 倍` : '山はない'); }
    },
    {
      key: 'okure', label: '③ ゆれのおくれ',
      lead: '落ち着いたあとのゆれ（青）は、力（オレンジ）よりおくれます。左は、$X=\\frac{F_0}{k-m\\omega^2+jc\\omega}$ の分母を矢印のたし算で見たものです。',
      note: 'ゆっくり（$\\omega=2$）だと、ばねの $k$ が勝って分母は右向き、おくれは 7.6° で、力と同じ向き。ちょうど $\\omega_{\\mathrm n}$ では、ばねと質量の矢印が打ち消しあい、ダンパーの $c\\omega$ だけが残って、分母は真上（おくれ 90°）。だから分母がいちばん短く、大きくゆれます。速い（$\\omega=8$）と分母は左向き、おくれ 172.4° で、力と反対向きです。$\\omega_{\\mathrm n}$ では、**速度と力のタイミングがぴったり同じ**で、力がいつも動きと同じ向きにおします（ブランコは、動いている向きにおす）。',
      legend: [['ゆする力', { color: 'b' }], ['台車の位置', { color: 'a', style: 'dash' }], ['分母：$k-m\\omega^2$', { color: 'a' }], ['分母：$c\\omega$', { color: 'c' }], ['分母（たしたもの）', { color: 'ink' }]],
      controls: [{ range: 'w', label: 'ゆする速さ $\\omega$〔rad/s〕', min: 0.5, max: 8, step: 0.1, d: 1 }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; },
      draw(cv, st) {
        const re = K - M * st.w * st.w, im = C * st.w, Mx = Math.max(K, M * st.w * st.w, 2);
        const P = cv.view({ x0: -Mx * 1.1, x1: Mx * 1.1, y0: -Mx * 0.25, y1: Mx * 1.1, box: [20, 40, 400, 300], equal: true });
        P.line([[-Mx * 1.1, 0], [Mx * 1.1, 0]], { color: 'sub', width: 1.2 }); P.line([[0, -Mx * 0.2], [0, Mx]], { color: 'sub', width: 1.2 });
        if (Math.abs(re) > 0.05) P.arrow(0, 0, re, 0, { color: 'a', width: 3.5 });
        P.arrow(re, 0, re, im, { color: 'c', width: 3.5 });
        P.arrow(0, 0, re, im, { color: 'ink', width: 2.5 });
        const ph = lag(st.w), pts = []; for (let i = 0; i <= 30; i++) pts.push([Mx * 0.22 * Math.cos(ph * i / 30), Mx * 0.22 * Math.sin(ph * i / 30)]);
        P.line(pts, { color: 'ink', width: 1.2 });
        cv.text(`おくれ φ = ${A.num(ph * 180 / Math.PI, 1)}°`, 220, 30, { size: 17, bold: true, align: 'center' });
        cv.text(`k − mω² = ${A.num(re, 2)}`, 40, 370, { size: 15, color: 'a' }); cv.text(`cω = ${A.num(im, 2)}`, 230, 370, { size: 15, color: 'c' });
        cv.text(`分母の長さ ${A.num(Math.hypot(re, im), 2)} → 振幅 ${A.num(amp(st.w), 3)} m`, 40, 400, { size: 15 });
        const G = cv.view({ x0: 0, x1: 4 * Math.PI, y0: -1.3, y1: 1.3, box: [470, 40, 390, 300] });
        G.axes({ xt: [Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI], yt: [-1, 1], xl: 'ωt', xfmt: v => A.pi(v), yfmt: () => '' });
        G.plot(u => Math.cos(u), { color: 'b', width: 2.8 });
        G.plot(u => Math.cos(u - ph), { color: 'a', width: 2.8, style: 'dash' });
        G.line([[2 * Math.PI, 0], [2 * Math.PI, 1.1]], { color: 'b', style: 'dot', width: 1.2 }); G.line([[2 * Math.PI + ph, 0], [2 * Math.PI + ph, 1.1]], { color: 'a', style: 'dot', width: 1.2 });
        if (ph > 0.05) G.arrow(2 * Math.PI, 1.16, 2 * Math.PI + ph, 1.16, { color: 'ink', width: 1.5, head: 8 });
        const u = (st.w * st.t) % (4 * Math.PI); G.dot(u, Math.cos(u), { color: 'b', r: 5 }); G.dot(u, Math.cos(u - ph), { color: 'a', r: 5, shape: 'square' });
        cv.text('（たてはどちらも山を1にそろえた）', 665, 370, { size: 14, color: 'sub', align: 'center' });
      },
      readout: st => `$\\omega=$ ${A.num(st.w, 1)}：$\\tan\\varphi=\\frac{c\\omega}{k-m\\omega^2}$、おくれ <b>${A.num(lag(st.w) * 180 / Math.PI, 1)}°</b>（${lag(st.w) < 0.3 ? '力とほぼ同じ向き' : lag(st.w) > 2.8 ? '力とほぼ反対向き' : Math.abs(lag(st.w) - Math.PI / 2) < 0.05 ? '¼ 周期おくれ：速度が力と同じタイミング' : 'そのあいだ'}）`
    },
    {
      key: 'sodatsu', label: '④ ダンパーがないと',
      lead: 'ダンパーのない $x\'\'+4x=\\cos\\omega t$（$\\omega_{\\mathrm n}=2$）を、はじめ止まった状態からゆすります。ちょうど $\\omega=2$ と、少しずらしたときをくらべましょう。',
      note: 'ちょうど $\\omega=\\omega_{\\mathrm n}=2$ でゆすると、答えは $x=\\frac{1}{4}t\\sin2t$。ゆれの大きさ $\\frac{1}{4}t$ は、時間に比例して、どこまでも大きくなり続けます（点線）。少しずらすと、ゆすりに合うゆれと自分のゆれ（$\\cos2t$）が重なって、大きくなったり小さくなったりします（うなり）。本物の物には少しはダンパーがあるので、ゆれは無限には大きくなりませんが、$\\zeta=0.01$ なら約 50 倍で、物がこわれることもあります。',
      legend: [['$x(t)$', { color: 'd' }], ['つつみ', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'w2', label: 'ゆする速さ $\\omega$', min: 1, max: 3, step: 0.01, d: 2, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 2.5; if (st.t >= 20) { st.t = 20; return false; } },
      draw(cv, st) {
        const w = st.w2, res = Math.abs(w - 2) < 0.005;
        const xf = t => res ? t / 4 * Math.sin(2 * t) : (Math.cos(w * t) - Math.cos(2 * t)) / (4 - w * w);
        const env = t => res ? t / 4 : 2 * Math.abs(Math.sin((w - 2) * t / 2)) / Math.abs(4 - w * w);
        const yb = 92, E = 440, S = 26, x = xf(st.t), cx = E + A.clamp(x, -12, 12) * S;
        wall(cv, 80, yb - 60, yb); cv.line([[80, yb], [820, yb]], { color: 'ink', width: 1.8 });
        cv.line([[E, 24], [E, yb + 4]], { color: 'sub', style: 'dash', width: 1.2 });
        spring(cv, 80, cx - 28, yb - 28); cv.rect(cx - 28, yb - 52, 56, 46, { fill: 'd', alpha: 0.3, color: 'd', width: 2 });
        const g = cv.view({ x0: 0, x1: 21, y0: -5.6, y1: 5.6, box: [80, 130, 780, 290] });
        g.axes({ xt: [5, 10, 15, 20], yt: [-5, 5], xl: 't', yl: 'x' });
        g.plot(env, { x0: 0, x1: 20.2, color: 'sub', style: 'dash', width: 1.5 }); g.plot(t => -env(t), { x0: 0, x1: 20.2, color: 'sub', style: 'dash', width: 1.5 });
        g.plot(xf, { x0: 0, x1: Math.max(0.01, st.t), color: 'd', width: 2.2, n: 1500 });
        if (Math.abs(x) < 5.6) g.dot(st.t, x, { color: 'd', r: 5 });
      },
      readout: st => Math.abs(st.w2 - 2) < 0.005 ? `$\\omega=2$（ちょうど $\\omega_{\\mathrm n}$）：$x=\\frac{1}{4}t\\sin2t$、${A.num(st.t, 1)} 秒でゆれの大きさ ${A.num(st.t / 4, 2)}（ずっと大きくなる）` : `$\\omega=$ ${A.num(st.w2, 2)}：$x=\\frac{\\cos\\omega t-\\cos2t}{4-\\omega^2}$、いちばん大きくて ${A.num(2 / Math.abs(4 - st.w2 * st.w2), 2)}（うなりの周期 ${A.num(2 * Math.PI / Math.abs(st.w2 - 2), 1)} 秒）`
    }
  ]
});

function wall(cv, x, y0, y1) { cv.line([[x, y0], [x, y1]], { color: 'ink', width: 2.5 }); for (let y = y0; y < y1; y += 10) cv.line([[x, y], [x - 8, y + 8]], { color: 'sub', width: 1.2 }); }
function spring(cv, x1, x2, y) {
  const n = 9, amp = 7, lead = 10, L = x2 - x1 - 2 * lead, pts = [[x1, y], [x1 + lead, y]];
  for (let k = 0; k < 2 * n; k++) pts.push([x1 + lead + L * (k + 0.5) / (2 * n), y + (k % 2 ? amp : -amp)]);
  pts.push([x2 - lead, y], [x2, y]); cv.line(pts, { color: 'ink', width: 2 });
}
function damper(cv, x1, x2, y) {
  const m = (x1 + x2) / 2;
  cv.line([[x1, y], [x1 + 30, y]], { color: 'ink', width: 2 });
  cv.line([[x1 + 30, y - 9], [m + 26, y - 9]], { color: 'ink', width: 2 }); cv.line([[x1 + 30, y + 9], [m + 26, y + 9]], { color: 'ink', width: 2 }); cv.line([[x1 + 30, y - 9], [x1 + 30, y + 9]], { color: 'ink', width: 2 });
  const pp = Math.min(m + 16, x2 - 12); cv.line([[pp, y - 6], [pp, y + 6]], { color: 'ink', width: 3 }); cv.line([[pp, y], [x2, y]], { color: 'ink', width: 2 });
}
