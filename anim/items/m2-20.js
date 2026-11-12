// @id m2-20
// @title 波をのばす・ずらす：振幅・周期・ずれ
// @vol 数学4
// @from 数学 4-8 ⑥⑦（ch4-08:541・572）／波-5、電-10 でも使う
'use strict';
const D20 = Math.PI / 180;
A.item({
  id: 'm2-20', title: '波をのばす・ずらす：振幅・周期・ずれ',
  from: '数学 第4巻 4-8 ⑥「$y=\\cos\\theta$ のグラフ」・⑦「波をのばす・ずらす」の図から（物理 波-5・電-10 でも使う）',
  W: 880, H: 400,
  state: { th: 0, d: 0, a: 2, q: 0, p: 60, k: 2 },
  scenes: [
    {
      key: 'cos', label: '① cos は横の影',
      lead: '点 P が単位円を回ります。P の高さが $\\sin\\theta$、P の横の位置（真上から光を当てた床の影）が $\\cos\\theta$ です。',
      note: '$\\cos\\theta$ のグラフは、0° で 1 から始まり、90° で 0、180° で $-1$。$\\sin\\theta$ と同じ形を、**左へ 90° ずらしたもの**です（$\\sin(\\theta+90°)=\\cos\\theta$）。「ずらす」のスライダーで、cos のグラフを右へ 90° 動かすと、sin にぴったり重なります。',
      legend: [['$\\sin\\theta$（P の高さ）', { color: 'a' }], ['$\\cos\\theta$（P の横の位置）', { color: 'b', style: 'dash' }], ['cos を右へずらしたもの', { color: 'b', style: 'dot' }]],
      controls: [
        { range: 'th', label: '角 $\\theta$', min: 0, max: 720, step: 1, fmt: v => Math.round(v) + '°' },
        { range: 'd', label: 'cos を右へずらす', min: 0, max: 90, step: 1, fmt: v => Math.round(v) + '°' }
      ],
      init(st) { st.th = 0; st.d = 0; },
      step(st, dt) { st.th += dt * 60; if (st.th > 720) st.th = 0; },
      draw(cv, st) { scene20(cv, st, 'cos'); },
      readout: st => `$\\theta$ ＝ ${Math.round(st.th)}°　　$\\sin\\theta$ ＝ ${A.num(Math.sin(st.th * D20), 3)}　　$\\cos\\theta$ ＝ ${A.num(Math.cos(st.th * D20), 3)}`
    },
    {
      key: 'nobasu', label: '② たてにのばす・上へ',
      lead: '$y=a\\sin\\theta+q$ の $a$ と $q$ を変えてみましょう。灰色の線は、もとの $y=\\sin\\theta$ です。',
      note: '$a$ 倍すると、山は $a$、谷は $-a$ になります（半径 $a$ の円を回る点の高さ）。中心の線から山までの高さを**振幅**といいます。$+q$ は、グラフ全体を上へ $q$ 動かします（3-9 の放物線の $+q$ と同じ）。',
      legend: [['$y=a\\sin\\theta+q$', { color: 'a' }], ['もとの $y=\\sin\\theta$', { color: 'sub' }], ['中心の線 $y=q$', { color: 'c', style: 'dash' }]],
      controls: [
        { range: 'a', label: '$a$（振幅）', min: 0.5, max: 2, step: 0.1, d: 1 },
        { range: 'q', label: '$q$（上へ）', min: -1, max: 1, step: 0.1, d: 1 }
      ],
      init(st) { st.th = 0; st.a = 2; st.q = 0; },
      step(st, dt) { st.th += dt * 60; if (st.th > 720) st.th = 0; },
      draw(cv, st) { scene20(cv, st, 'nobasu'); },
      readout: st => `$y$ ＝ ${A.num(st.a, 1)} sin$\\theta$ ${st.q < 0 ? '−' : '＋'} ${A.num(Math.abs(st.q), 1)}　　山 ${A.num(st.a + st.q, 1)}、谷 ${A.num(-st.a + st.q, 1)}、振幅 <b>${A.num(st.a, 1)}</b>`
    },
    {
      key: 'zurasu', label: '③ 右へずらす',
      lead: '$y=\\sin(\\theta-p)$ のグラフです。$p$ を変えると、波はどちらへ動くでしょう。',
      note: '$y=\\sin\\theta$ が $\\theta=0°$ でしていたことを、$y=\\sin(\\theta-60°)$ は、かっこの中が 0 になる $\\theta=60°$ でします。どのできごとも 60° おそく起こるので、グラフは**右へ** 60° 動きます。円の上では、出発点（$\\theta=0°$ の所）が 60° 手前（$-60°$）になります。',
      miss: '$\\sin(\\theta-60°)$ は、左へではなく**右へ** 60° ずれます。かっこの中が 0 になるのは $\\theta=60°$ です。',
      legend: [['$y=\\sin(\\theta-p)$', { color: 'a' }], ['もとの $y=\\sin\\theta$', { color: 'sub' }], ['かっこの中が 0 になる所', { color: 'b', shape: 'diamond', noline: true }], ['出発点（$\\theta=0°$）', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'p', label: '$p$（ずれ）', min: -180, max: 180, step: 1, fmt: v => Math.round(v) + '°' }],
      init(st) { st.th = 0; st.p = 60; },
      step(st, dt) { st.th += dt * 60; if (st.th > 720) st.th = 0; },
      draw(cv, st) { scene20(cv, st, 'zurasu'); },
      readout: st => { const f = x => A.num(Math.sin((x - st.p) * D20), 3); return `$\\theta$ ＝ ${Math.round(st.p)}°、${Math.round(st.p) + 30}°、${Math.round(st.p) + 90}° のとき $y$ ＝ ${f(st.p)}、${f(st.p + 30)}、${f(st.p + 90)}（$\\sin\\theta$ の 0°、30°、90° と同じ）`; }
    },
    {
      key: 'kaisu', label: '④ 周期を変える',
      lead: '$y=\\sin k\\theta$ のグラフです。$k$ を大きくすると、点は速く回り、波はつまります。',
      note: '$k=2$ なら、$\\theta$ が 180° になると $2\\theta$ が 360° になって、1周分の波が終わります。2倍の速さで回る点の高さと同じで、周期は $360°\\div k$ です。',
      legend: [['$y=\\sin k\\theta$', { color: 'a' }], ['もとの $y=\\sin\\theta$', { color: 'sub' }], ['1周期', { color: 'c', style: 'long' }]],
      controls: [{ range: 'k', label: '$k$', min: 0.5, max: 4, step: 0.5, d: 1 }],
      init(st) { st.th = 0; st.k = 2; },
      step(st, dt) { st.th += dt * 60; if (st.th > 720) st.th = 0; },
      draw(cv, st) { scene20(cv, st, 'kaisu'); },
      readout: st => `周期 ＝ 360° ÷ ${A.num(st.k, 1)} ＝ <b>${A.num(360 / st.k, 0)}°</b>　（点は1周するあいだに、ふつうの ${A.num(st.k, 1)} 倍回る）`
    }
  ]
});

function scene20(cv, st, mode) {
  const big = mode === 'nobasu', Y = big ? 3.3 : 1.6;
  const c = cv.view({ x0: -Y, x1: Y, y0: -Y, y1: Y, box: [10, 14, 300, 360], equal: true });
  const g = cv.view({ x0: 0, x1: 740, y0: -Y, y1: Y, box: [330, 14, 530, 360] });
  const th = st.th, f = {
    cos: x => Math.sin(x * D20),
    nobasu: x => st.a * Math.sin(x * D20) + st.q,
    zurasu: x => Math.sin((x - st.p) * D20),
    kaisu: x => Math.sin(st.k * x * D20)
  }[mode];
  // 円の上の点：中心 (0, q)、半径 a、角 ang
  const R = big ? st.a : 1, cy = big ? st.q : 0, ang = (mode === 'zurasu' ? th - st.p : mode === 'kaisu' ? st.k * th : th) * D20;
  const px = R * Math.cos(ang), py = cy + R * Math.sin(ang);
  c.axes({ xt: big ? [-2, -1, 1, 2] : [-1, 1], yt: big ? [-3, -2, -1, 1, 2, 3] : [-1, 1] });
  g.axes({ xt: [90, 180, 270, 360, 450, 540, 630, 720], yt: big ? [-3, -2, -1, 1, 2, 3] : [-1, 1], xfmt: v => v % 180 === 0 ? v + '°' : '', xl: 'θ', yl: 'y' });
  if (big) c.circle(0, 0, 1, { color: 'sub', width: 1, style: 'dot' });
  c.circle(0, cy, R, { color: 'sub', width: 1.5 });
  // もとの sin（灰色）
  if (mode !== 'cos') g.plot(x => Math.sin(x * D20), { color: 'sub', width: 1.5, alpha: 0.6 });
  if (big) g.plot(() => st.q, { color: 'c', style: 'dash', width: 1.5 });
  if (mode === 'cos') {
    g.plot(x => Math.cos(x * D20), { x1: Math.min(th, 740), color: 'b', style: 'dash', width: 2.5 });
    if (st.d > 0) g.plot(x => Math.cos((x - st.d) * D20), { color: 'b', style: 'dot', width: 2.5 });
    if (st.d > 0) { g.arrow(0, 1.35, st.d, 1.35, { color: 'b', width: 2 }); g.text('右へ ' + Math.round(st.d) + '°', st.d + 8, 1.35, { size: 15, color: 'b', bg: true }); }
    // 床の影
    c.line([[px, 0], [px, py]], { color: 'sub', style: 'dot', width: 1.2 });
    c.line([[0, 0], [px, 0]], { color: 'b', style: 'dash', width: 4 });
    c.dot(px, 0, { r: 6, color: 'b', shape: 'square' });
    g.dot(Math.min(th, 740), Math.cos(th * D20), { r: 6, color: 'b', shape: 'square' });
  }
  if (mode === 'zurasu') {
    g.dot(st.p < 0 ? st.p + 360 : st.p, 0, { r: 8, color: 'b', shape: 'diamond' });
    g.text('θ ＝ ' + Math.round(st.p < 0 ? st.p + 360 : st.p) + '°', st.p < 0 ? st.p + 360 : st.p, -0.3, { size: 15, align: 'center', color: 'b', bg: true });
    if (st.p > 0) { g.arrow(0, 1.35, st.p, 1.35, { color: 'b', width: 2 }); g.text('右へ ' + Math.round(st.p) + '°', st.p + 8, 1.35, { size: 15, color: 'b', bg: true }); }
    if (st.p < 0) { g.arrow(0, 1.35, Math.max(st.p, -10), 1.35, { color: 'b', width: 2 }); g.text('左へ ' + Math.round(-st.p) + '°', 60, 1.5, { size: 15, color: 'b' }); }
    const s0 = -st.p * D20; c.dot(Math.cos(s0), Math.sin(s0), { r: 7, color: 'b', shape: 'square' });
    c.text('出発点', Math.cos(s0) + 0.12, Math.sin(s0) - 0.22, { size: 15, color: 'b', bg: true });
  }
  if (mode === 'kaisu') {
    const T = 360 / st.k;
    if (T <= 740) { g.line([[0, -1.3], [T, -1.3]], { color: 'c', style: 'long', width: 3 }); g.text('周期 ' + A.num(T, 0) + '°', T / 2, -1.48, { size: 15, align: 'center', color: 'c', bg: true }); }
  }
  // 主のグラフ
  g.plot(f, { x1: Math.min(th, 740), color: 'a', width: 3 });
  // 円の点と高さ
  const X = Math.min(th, 740);
  cv.line([[c.X(px), c.Y(py)], [g.X(X), g.Y(py)]], { color: 'sub', style: 'dash', width: 1 });
  c.arrow(0, cy, px, py, { color: 'ink', width: 2 });
  c.line([[px, cy], [px, py]], { color: 'a', width: 3 });
  c.dot(px, py, { r: 7, color: 'a' }); g.dot(X, py, { r: 6, color: 'a' });
  c.text('P', px + 0.12 * Y, py + 0.1 * Y, { size: 17, bold: true, math: true, italic: true });
}
