// @id m3-22
// @title 回る矢印と波：らせん・フェーザ・三相
// @vol 数学6
// @from 数学 6-10 ②⑨⑩⑪（ch6-10:267・571・605・658・703）
'use strict';
const TAU = 2 * Math.PI;
const D2R = Math.PI / 180;

A.item({
  id: 'm3-22', title: '回る矢印と波：らせん・フェーザ・三相',
  from: '数学 第6巻 6-10 ②⑨⑩⑪ の図から（5-15・6-12・6-13、物理 電磁気・波動でも使う）',
  W: 880, H: 440,
  state: { th: 0, w: 1, sg: -1, ph: 60, part: 'C' },
  scenes: [
    {
      key: 'kage', label: '① 影は sin と cos',
      lead: '回る矢印 $e^{j\\omega t}$ の、たての影と横の影を見ます。▶ で回してみましょう。',
      note: '点 $e^{j\\omega t}$ は単位円の上を、1秒に $\\omega$ ラジアンずつ左回りに回ります。**たての位置（虚部）**は $\\sin\\omega t$（右の波）、**横の位置（実部）**は $\\cos\\omega t$（下の波。時間は下へ進む）。1つの $e^{j\\omega t}$ の中に、cos の波と sin の波が両方入っています。',
      legend: [['回る矢印 $e^{j\\omega t}$', { color: 'a' }], ['たての影 $\\sin\\omega t$', { color: 'b' }], ['横の影 $\\cos\\omega t$', { color: 'd', style: 'dash' }]],
      controls: [{ range: 'w', label: '角速度 $\\omega$〔rad/s〕', min: 0.5, max: 2, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; if (st.w * st.t >= 4 * Math.PI) { st.t = 4 * Math.PI / st.w; return false; } },
      draw(cv, st) {
        const th = st.w * st.t, c = Math.cos(th), s = Math.sin(th);
        const C = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [30, 15, 240, 240], equal: true });
        C.axes({ xt: [-1, 1], yt: [-1, 1], xl: '実部', yl: '虚部', yfmt: v => (v < 0 ? '−' : '') + 'j' });
        C.circle(0, 0, 1, { color: 'sub', width: 1.5 });
        C.arrow(0, 0, c, s, { color: 'a', width: 3.5 }); C.dot(c, s, { color: 'a', r: 6 });
        const S = cv.view({ x0: 0, x1: 4 * Math.PI + 0.3, y0: -1.3, y1: 1.3, box: [310, 15, 550, 240] });
        S.axes({ xt: A.range(Math.PI, 4 * Math.PI, Math.PI), yt: [-1, 1], xl: 'ωt', xfmt: v => A.pi(v) });
        S.plot(x => Math.sin(x), { x0: 0, x1: Math.max(0.01, th), color: 'b', width: 3 });
        cv.line([[C.X(c), C.Y(s)], [S.X(th), S.Y(s)]], { color: 'sub', style: 'dot', width: 1.2 });
        S.dot(th, s, { color: 'b', r: 6 });
        // 下：横の影（時間は下へ）
        const top = 275, k = 150 / (4 * Math.PI);
        cv.arrow(C.X(0), top, C.X(0), top + 160, { color: 'sub', width: 1.5, head: 9 });
        cv.line([[C.X(-1.3), top], [C.X(1.3), top]], { color: 'sub', width: 1.2 });
        cv.text('ωt', C.X(0) + 8, top + 155, { size: 14, color: 'sub' });
        const pts = []; for (let i = 0; i <= 200; i++) { const u = th * i / 200; pts.push([C.X(Math.cos(u)), top + u * k]); }
        cv.line(pts, { color: 'd', width: 3, style: 'dash' });
        cv.line([[C.X(c), C.Y(s)], [C.X(c), top + th * k]], { color: 'sub', style: 'dot', width: 1.2 });
        cv.dot(C.X(c), top + th * k, { color: 'd', r: 6, shape: 'square' });
        cv.text('たての影（虚部）＝ sin ωt', 330, 300, { size: 16, color: 'b' });
        cv.text('横の影（実部）＝ cos ωt', 330, 332, { size: 16, color: 'd' });
        cv.text(`e^(jωt) = cos ωt + j sin ωt = ${A.num(c, 2)} ${s < 0 ? '−' : '+'} ${A.num(Math.abs(s), 2)}j`, 330, 380, { size: 16 });
      },
      readout: st => `$\\omega t=$ ${A.num(st.w * st.t, 2)} ラジアン（${A.num(st.w * st.t / D2R, 0)}°）　$\\cos\\omega t=$ ${A.num(Math.cos(st.w * st.t), 3)}、$\\sin\\omega t=$ ${A.num(Math.sin(st.w * st.t), 3)}`
    },
    {
      key: 'rasen', label: '② σ でらせん',
      lead: '肩に実部 $\\sigma$ もある $e^{(\\sigma+j\\omega)t}=e^{\\sigma t}\\times e^{j\\omega t}$ は、回りながら長さが $e^{\\sigma t}$ で変わります（$\\omega=2$）。$\\sigma$ を変えてみましょう。',
      note: '$\\sigma<0$ なら長さがへって内向きのらせん、$\\sigma=0$ なら円、$\\sigma>0$ なら外向きのらせんです。横の影（実部）は $e^{\\sigma t}\\cos\\omega t$。$\\sigma<0$ なら「ゆれながら、だんだん小さくなる」波になります。3-10 の車の式の解 $s=-1+2j$ の $e^{st}$ の実部が $e^{-t}\\cos2t$ です（6-12）。',
      legend: [['$e^{(\\sigma+2j)t}$ の点', { color: 'a' }], ['実部 $e^{\\sigma t}\\cos2t$', { color: 'd' }], ['つつみ $\\pm e^{\\sigma t}$', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'sg', label: '実部 $\\sigma$', min: -1, max: 0.3, step: 0.05, d: 2, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.8; if (st.t >= 4) { st.t = 4; return false; } },
      draw(cv, st) {
        const f = t => Math.exp(st.sg * t), R = Math.max(1.3, Math.exp(st.sg * 4)) * 1.12;   // 外向きのらせんも画面に入るように
        const P = cv.view({ x0: -R, x1: R, y0: -R, y1: R, box: [20, 20, 390, 390], equal: true });
        P.axes({ xt: R > 2 ? [-3, -2, -1, 1, 2, 3].filter(v => Math.abs(v) < R) : [-1, 1], yt: R > 2 ? [-3, -2, -1, 1, 2, 3].filter(v => Math.abs(v) < R) : [-1, 1], xl: '実部', yl: '虚部', yfmt: v => (v === 1 ? '' : v === -1 ? '−' : A.num(v, 0)) + 'j' });
        P.circle(0, 0, 1, { color: 'sub', style: 'dot', width: 1.2 });
        P.param(t => f(t) * Math.cos(2 * t), t => f(t) * Math.sin(2 * t), 0, Math.max(0.01, st.t), { color: 'a', width: 2.8, n: 400 });
        const x = f(st.t) * Math.cos(2 * st.t), y = f(st.t) * Math.sin(2 * st.t);
        P.clip(() => P.arrow(0, 0, x, y, { color: 'a', width: 2.5 }));
        P.dot(1, 0, { color: 'a', r: 5, open: true }); P.text('t = 0', 1.05, -0.15, { size: 15, color: 'a' });
        const G = cv.view({ x0: 0, x1: 4.2, y0: -R * 0.85, y1: R * 0.88, box: [470, 30, 390, 360] });
        G.axes({ xt: [1, 2, 3, 4], yt: R > 2 ? [-3, -2, -1, 1, 2, 3].filter(v => Math.abs(v) < R * 0.85) : [-1, 1], xl: 't' });
        G.plot(f, { x0: 0, x1: 4, color: 'sub', style: 'dash', width: 1.5 }); G.plot(t => -f(t), { x0: 0, x1: 4, color: 'sub', style: 'dash', width: 1.5 });
        G.plot(t => f(t) * Math.cos(2 * t), { x0: 0, x1: Math.max(0.01, st.t), color: 'd', width: 3 });
        G.dot(st.t, x, { color: 'd', r: 5 });
        cv.line([[P.X(x), P.Y(y)], [P.X(x), P.Y(-R)]], { color: 'sub', style: 'dot', width: 1 });
      },
      readout: st => `$\\sigma=$ ${A.num(st.sg, 2)}：${st.sg < -1e-9 ? '内向きのらせん（ゆれながら小さくなる）' : st.sg > 1e-9 ? '外向きのらせん（ゆれながら大きくなる）' : '円（同じ大きさでゆれ続ける）'}　長さ $e^{\\sigma t}=$ ${A.num(Math.exp(st.sg * st.t), 3)}`
    },
    {
      key: 'wa', label: '③ 波のたし算',
      lead: '$\\sin\\theta$ と $\\sin(\\theta+\\varphi)$ の和を、回る矢印（フェーザ）のたし算で考えます。▶ で、2本の矢印がいっしょに回ります。',
      note: '同じ速さで回る2本の矢印は、あいだの角が変わらないので、たした矢印も形を変えずに回ります。影（たての成分）もたし算になるので、同じ $\\omega$ の波のたし算は、**矢印のたし算**で計算できます。$\\varphi=60°$ なら、$1+(0.5+0.866j)=1.5+0.866j$、大きさ $\\sqrt3$、角 30° で、$\\sin\\theta+\\sin(\\theta+60°)=\\sqrt3\\sin(\\theta+30°)$（4-9 と同じ答え）。',
      legend: [['$\\sin\\theta$（矢印 1）', { color: 'a' }], ['$\\sin(\\theta+\\varphi)$（矢印 $e^{j\\varphi}$）', { color: 'b', style: 'dash' }], ['和', { color: 'd', style: 'long' }]],
      controls: [{ range: 'ph', label: 'ずれ $\\varphi$', min: 0, max: 180, step: 5, fmt: v => v + '°' }],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = (st.th + dt) % TAU; },
      draw(cv, st) {
        const ph = st.ph * D2R, th = st.th;
        const P = cv.view({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2, box: [20, 20, 390, 390], equal: true });
        P.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: '実部', yl: '虚部', yfmt: v => (v === 1 ? '' : v === -1 ? '−' : A.num(v, 0)) + 'j' });
        const u = [Math.cos(th), Math.sin(th)], v = [Math.cos(th + ph), Math.sin(th + ph)], s = [u[0] + v[0], u[1] + v[1]];
        P.arrow(0, 0, v[0], v[1], { color: 'b', width: 1.5, style: 'dot' });
        P.arrow(0, 0, u[0], u[1], { color: 'a', width: 3.5 });
        P.arrow(u[0], u[1], s[0], s[1], { color: 'b', width: 3.5, style: 'dash' });
        P.arrow(0, 0, s[0], s[1], { color: 'd', width: 4, style: 'long' });
        for (const [q, col] of [[u, 'a'], [s, 'd']]) P.line([[q[0], q[1]], [2.2, q[1]]], { color: col, style: 'dot', width: 1 });
        const G = cv.view({ x0: 0, x1: TAU + 0.2, y0: -2.1, y1: 2.1, box: [470, 20, 390, 390] });
        G.axes({ xt: [Math.PI, TAU], yt: [-2, -1, 1, 2], xl: 'θ', xfmt: v => Math.round(v / D2R) + '°' });
        G.plot(x => Math.sin(x), { x0: 0, x1: TAU, color: 'a', width: 2.2 });
        G.plot(x => Math.sin(x + ph), { x0: 0, x1: TAU, color: 'b', width: 2.2, style: 'dash' });
        G.plot(x => Math.sin(x) + Math.sin(x + ph), { x0: 0, x1: TAU, color: 'd', width: 3.5, style: 'long' });
        G.line([[th, -2.1], [th, 2.1]], { color: 'sub', style: 'dot', width: 1.2 });
        G.dot(th, u[1], { color: 'a', r: 5 }); G.dot(th, v[1], { color: 'b', r: 5, shape: 'square' }); G.dot(th, s[1], { color: 'd', r: 6, shape: 'diamond' });
      },
      readout: st => { const ph = st.ph * D2R, amp = Math.hypot(1 + Math.cos(ph), Math.sin(ph)); return `$1+e^{j\\varphi}=$ ${A.num(1 + Math.cos(ph), 3)} ＋ ${A.num(Math.sin(ph), 3)}$j$　大きさ <b>${A.num(amp, 3)}</b>、角 <b>${A.num(st.ph / 2, 1)}°</b>　→　$\\sin\\theta+\\sin(\\theta+${st.ph}°)=$ ${A.num(amp, 3)} $\\sin(\\theta+${A.num(st.ph / 2, 1)}°)$`; }
    },
    {
      key: 'isou', label: '④ 電流は 90° 先',
      lead: 'コンデンサーでは $i=C\\frac{dv}{dt}$。微分は「$j\\omega$ をかける」ことなので、電流の矢印は電圧の矢印より 90° 先にあります。▶ で回してみましょう。',
      note: '$j\\omega$ は「大きさ $\\omega$、角 90°」の数です。だから電流のフェーザ $j\\omega CV_0$ は、電圧のフェーザ $V_0$ を 90° 進めたもの。電流の山（オレンジ）は、電圧の山（青）より $\\frac{1}{4}$ 周期早く来ます。コイル（$v=L\\frac{di}{dt}$）では反対に、電流が電圧より 90° おくれます。',
      miss: 'コンデンサーの $j\\omega C$ は「電圧から電流を求める数」、$\\frac{1}{j\\omega C}$ は「電流から電圧を求める数」で、向きが逆です。どちらから求めるかを、いつも決めてから使いましょう。',
      legend: [['電圧 $v$', { color: 'a' }], ['電流 $i$', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'part', label: '部品', options: [['C', 'コンデンサー（電流が 90° 先）'], ['L', 'コイル（電流が 90° おくれる）']] }],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = (st.th + dt) % (2 * TAU); },
      draw(cv, st) {
        const d = st.part === 'C' ? Math.PI / 2 : -Math.PI / 2, th = st.th, I = 0.75;
        const P = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [20, 30, 360, 360], equal: true });
        P.axes({ xt: [-1, 1], yt: [-1, 1], xl: '実部', yl: '虚部', yfmt: v => (v < 0 ? '−' : '') + 'j' });
        P.arrow(0, 0, Math.cos(th), Math.sin(th), { color: 'a', width: 3.5 });
        P.arrow(0, 0, I * Math.cos(th + d), I * Math.sin(th + d), { color: 'b', width: 3.5, style: 'dash' });
        const pts = []; for (let i = 0; i <= 20; i++) { const u = th + d * i / 20; pts.push([0.3 * Math.cos(u), 0.3 * Math.sin(u)]); }
        P.line(pts, { color: 'ink', width: 1.2 }); P.text('90°', 0.42 * Math.cos(th + d / 2), 0.42 * Math.sin(th + d / 2), { size: 15, align: 'center', bg: true });
        P.text('電圧', 1.12 * Math.cos(th), 1.12 * Math.sin(th), { size: 15, color: 'a', align: 'center', bg: true });
        P.text('電流', 0.95 * Math.cos(th + d), 0.95 * Math.sin(th + d), { size: 15, color: 'b', align: 'center', bg: true });
        const G = cv.view({ x0: 0, x1: 2 * TAU + 0.3, y0: -1.3, y1: 1.3, box: [430, 30, 430, 360] });
        G.axes({ xt: [Math.PI, TAU, 3 * Math.PI, 2 * TAU], yt: [-1, 1], xl: 'ωt', xfmt: v => A.pi(v) });
        G.plot(x => Math.sin(x), { x0: 0, x1: 2 * TAU, color: 'a', width: 2.8 });
        G.plot(x => I * Math.sin(x + d), { x0: 0, x1: 2 * TAU, color: 'b', width: 2.8, style: 'dash' });
        // 2つめの山どうし：電圧は 5π/2、電流は 2π（コンデンサー）か 3π（コイル）
        const pv = 2.5 * Math.PI, pc = d > 0 ? 2 * Math.PI : 3 * Math.PI;
        G.line([[pv, 0], [pv, 1.05]], { color: 'a', style: 'dot', width: 1.2 }); G.line([[pc, 0], [pc, 1.05]], { color: 'b', style: 'dot', width: 1.2 });
        G.arrow(pv, 1.12, pc, 1.12, { color: 'ink', width: 1.5, head: 8 });
        G.text('¼ 周期', (pv + pc) / 2, 1.24, { size: 14, align: 'center', bg: true });
        G.line([[th % (2 * TAU), -1.3], [th % (2 * TAU), 1.3]], { color: 'sub', style: 'dot', width: 1.2 });
        G.dot(th, Math.sin(th), { color: 'a', r: 5 }); G.dot(th, I * Math.sin(th + d), { color: 'b', r: 5, shape: 'square' });
      },
      readout: st => st.part === 'C' ? '電流のフェーザ ＝ $j\\omega C\\times V_0$（大きさ $\\omega CV_0$、角 90°）→ $i=\\omega CV_0\\sin(\\omega t+90°)=\\omega CV_0\\cos\\omega t$' : '電圧のフェーザ ＝ $j\\omega L\\times I_0$ → 電流は電圧より 90° おくれる'
    },
    {
      key: 'sansou', label: '⑤ 三相の和は 0',
      lead: '山の位置が 120° ずつずれた3つの交流（三相交流）。フェーザは、角が 0・$-120°$・$-240°$ の3本の矢印です。▶ で回してみましょう。',
      note: '3本の矢印を先から先へつなぐと（中）、正三角形ができて、もとの点にもどります。$1+e^{-j2\\pi/3}+e^{-j4\\pi/3}=0$。和の矢印が 0 なので、その影（3つの電圧の和、下の黒い線）も、いつでも 0 です。',
      legend: [['1本め（0°）', { color: 'a' }], ['2本め（−120°）', { color: 'b', style: 'dash' }], ['3本め（−240°）', { color: 'd', style: 'dashdot' }], ['3つの和', { color: 'ink' }]],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = (st.th + dt * 0.8) % TAU; },
      draw(cv, st) {
        const th = st.th, cols = [['a', 'solid'], ['b', 'dash'], ['d', 'dashdot']], ang = [0, -2 * Math.PI / 3, -4 * Math.PI / 3].map(a => a + th);
        const P = cv.view({ x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3, box: [20, 10, 260, 260], equal: true });
        P.axes({ xt: [-1, 1], yt: [-1, 1] , xlabels: false, ylabels: false });
        ang.forEach((a, k) => P.arrow(0, 0, Math.cos(a), Math.sin(a), { color: cols[k][0], style: cols[k][1], width: 3.2 }));
        const Q = cv.view({ x0: -1.1, x1: 1.1, y0: -1.1, y1: 1.1, box: [310, 10, 260, 260], equal: true });
        const u = ang.map(a => [Math.cos(a), Math.sin(a)]);
        let p = [-(2 * u[0][0] + u[1][0]) / 3, -(2 * u[0][1] + u[1][1]) / 3];   // 三角形のまん中を、図のまん中に
        const p0 = p.slice();
        ang.forEach((a, k) => { const q = [p[0] + Math.cos(a), p[1] + Math.sin(a)]; Q.arrow(p[0], p[1], q[0], q[1], { color: cols[k][0], style: cols[k][1], width: 3.2 }); p = q; });
        Q.dot(p0[0], p0[1], { color: 'ink', r: 5 });
        cv.text('先から先へつなぐと', 610, 60, { size: 16 }); cv.text('もとの点にもどる', 610, 86, { size: 16 }); cv.text('（和は 0）', 610, 112, { size: 16, bold: true });
        const G = cv.view({ x0: 0, x1: 2 * TAU, y0: -1.25, y1: 1.25, box: [70, 300, 790, 125] });
        G.axes({ xt: [Math.PI, TAU, 3 * Math.PI, 2 * TAU], yt: [-1, 1], xl: 'ωt', xfmt: v => A.pi(v) });
        [0, -2 * Math.PI / 3, -4 * Math.PI / 3].forEach((a, k) => G.plot(x => Math.sin(x + a), { color: cols[k][0], style: cols[k][1], width: 2 }));
        G.plot(x => Math.sin(x) + Math.sin(x - 2 * Math.PI / 3) + Math.sin(x - 4 * Math.PI / 3), { color: 'ink', width: 3.5 });
        G.line([[th, -1.25], [th, 1.25]], { color: 'sub', style: 'dot', width: 1.2 });
      },
      readout: st => { const v = [0, -120, -240].map(a => Math.sin(st.th + a * D2R)); return `3つの電圧：${v.map(x => A.num(x, 3)).join('、')}　和 ＝ <b>${A.num(v[0] + v[1] + v[2], 3)}</b>`; }
    }
  ]
});
