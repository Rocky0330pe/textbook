// @id m3-09
// @title 円すいを円板の積み重ねで
// @vol 数学5
// @uses 3d
// @from 数学 5-10 例題「うすい板に分けて体積を求める」（ch5-10:835〜860 の円すい）／4-5、物理 力 でも使う
'use strict';
// 例題：頂点から y の所の断面の半径は (r/h)y。厚さ Δy の円板 π(r/h)²y²Δy をたして、∫₀ʰ (πr²/h²)y²dy = (1/3)πr²h
// n 枚の円板（下の面の半径）の和 ÷ 円柱 πr²h ＝ (n+1)(2n+1)/(6n²)（5-10 の右はしの和と同じ数）
const sh = v => String(Number(v.toFixed(5))).replace('-', '−');
const Rn = n => (n + 1) * (2 * n + 1) / (6 * n * n), Ln = n => (n - 1) * (2 * n - 1) / (6 * n * n);
const R = 1.25, H = 2.5;
function stepIdx(st, dt, key, list, hold) {
  st.t += dt; const k = Math.min(list.length - 1, Math.floor(st.t / hold));
  st[key] = list[k]; if (st.t >= hold * list.length) return false;
}

A.item({
  id: 'm3-09', title: '円すいを円板の積み重ねで',
  from: '数学 第5巻 5-10 例題「うすい板に分けて体積を求める」の図から（4-5、物理 力 でも使う）',
  W: 880, H: 440,
  state: { t: 0, n: 4, mode: 'out', yaw: -30, pitch: 22 },
  scenes: [
    {
      key: 'enban', label: '① 円板を積み重ねる',
      lead: '底面の半径 $r$、高さ $h$ の円すいを、底面と平行にうすく切り、厚さ $\\Delta y$ の円板（うすい円柱）を積み重ねます。▶ で枚数がふえます。図はドラッグで回せます。',
      note: '頂点から $y$ の所の断面の半径は $\\frac{r}{h}y$（相似）。円板 1 枚の体積は $\\pi\\left(\\frac{r}{h}y\\right)^2\\Delta y$ です。枚数をふやすと、円板の和は円柱 $\\pi r^2h$ の $\\frac{1}{3}$ に近づき、$\\frac{1}{3}\\pi r^2h$ になります（4-5 で学んだ公式と同じ）。',
      legend: [['円板（外側：下の面の半径）', { color: 'a', style: 'solid' }], ['円すいの形', { color: 'ink', style: 'dash' }]],
      controls: [{ range: 'n', label: '枚数 $n$', min: 1, max: 40, step: 1, d: 0 }, { seg: 'mode', label: '円板の半径', options: [['out', '下の面（大きめ）'], ['in', '上の面（小さめ）']] }],
      step(st, dt) { return stepIdx(st, dt, 'n', [2, 4, 8, 16, 40], 1.6); },
      drag: A.rotDrag([0, 0, 520, 440]),
      draw(cv, st) { drawCone(cv, st); },
      readout: st => `$n$ ＝ ${st.n}：円板の和 ＝ 円柱の <b>${sh(st.mode === 'out' ? Rn(st.n) : Ln(st.n))}</b> 倍（$\\frac{1}{3}$ ＝ 0.33333…）`
    },
    {
      key: 'menseki', label: '② 断面積のグラフで見る',
      lead: '横に頂点からの長さ $y$、たてに断面積をとります。円板 1 枚の体積は、このグラフの細い長方形の面積です。',
      note: '断面積 $\\pi\\left(\\frac{r}{h}y\\right)^2$ は $y^2$ に比例するので、グラフは放物線です。長方形の和は 5-10 の $y=x^2$ と同じ形で、はばを 0 に近づけると $\\int_0^h\\frac{\\pi r^2}{h^2}y^2\\,dy=\\frac{\\pi r^2}{h^2}\\times\\frac{h^3}{3}=\\frac{1}{3}\\pi r^2h$ です。',
      legend: [['断面積 $\\pi\\left(\\frac{r}{h}y\\right)^2$', { color: 'ink', width: 3 }], ['円板 1 枚＝長方形 1 本', { color: 'a', style: 'solid' }]],
      controls: [{ range: 'n', label: '枚数 $n$', min: 1, max: 40, step: 1, d: 0 }, { seg: 'mode', label: '長方形の高さ', options: [['out', '下の面（大きめ）'], ['in', '上の面（小さめ）']] }],
      step(st, dt) { return stepIdx(st, dt, 'n', [2, 4, 8, 16, 40], 1.6); },
      draw(cv, st) { drawArea(cv, st); },
      readout: st => `$n$ ＝ ${st.n}：長方形の和 ＝ $\\pi r^2h$ の <b>${sh(st.mode === 'out' ? Rn(st.n) : Ln(st.n))}</b> 倍 → $\\frac{1}{3}$`
    }
  ]
});

function drawCone(cv, st) {
  const n = st.n, V = new A.View3(cv, { box: [0, 0, 520, 440], yaw: st.yaw, pitch: st.pitch, scale: 125, center: [0, 0, H / 2], persp: 0.05 });
  const SEG = 32, ring = (r, z) => { const p = []; for (let k = 0; k < SEG; k++) { const a = 2 * Math.PI * k / SEG; p.push([r * Math.cos(a), r * Math.sin(a), z]); } return p; };
  // 円板：k 枚め（上から）は、頂点からの長さ (k−1)h/n〜kh/n。z は上が頂点（z=H）
  for (let k = 1; k <= n; k++) {
    const yTop = (k - 1) * H / n, yBot = k * H / n, r = R * (st.mode === 'out' ? yBot : yTop) / H, z0 = H - yBot, z1 = H - yTop;
    if (r < 1e-6) continue;
    const top = ring(r, z1), bot = ring(r, z0), c = [0, 0, (z0 + z1) / 2], dc = V.P(c)[2];
    V.queue.push({ z: dc + z1 * 0.001, f: () => {
      // 側面（手前の面だけ）とふた
      for (let i = 0; i < SEG; i++) {
        const j = (i + 1) % SEG, mid = [(top[i][0] + top[j][0]) / 2, (top[i][1] + top[j][1]) / 2, c[2]];
        const out = [mid[0] * 1.01, mid[1] * 1.01, mid[2]];
        if (V.P(out)[2] <= V.P(mid)[2]) continue;
        V.cv.poly([V.P(bot[i]), V.P(bot[j]), V.P(top[j]), V.P(top[i])], { fill: 'a', alpha: 0.32 + 0.25 * Math.max(0, Math.cos(2 * Math.PI * i / SEG + 0.8)), color: n <= 12 ? 'a' : null, width: 0.6 });
      }
      const up = V.P([0, 0, z1 + 0.01])[2] > V.P([0, 0, z1])[2];
      V.cv.poly((up ? top : bot).map(p => V.P(p)), { fill: 'a', alpha: 0.5, color: 'a', width: n <= 16 ? 1.2 : 0.6 });
    } });
  }
  // 円すいの形（破線）
  const base = ring(R, 0); base.push(base[0]);
  V.line3(base, { color: 'ink', style: 'dash', width: 1.5, zbias: 50 });
  for (let k = 0; k < 8; k++) { const a = 2 * Math.PI * k / 8; V.line3([[0, 0, H], [R * Math.cos(a), R * Math.sin(a), 0]], { color: 'ink', style: 'dash', width: 1, zbias: 50 }); }
  V.text3('頂点', [0, 0, H + 0.18], { align: 'center', size: 15, bg: true });
  V.line3([[0, 0, 0], [R, 0, 0]], { color: 'ink', width: 2, zbias: 60 });
  V.text3('r', [R / 2, 0, 0.12], { size: 17, italic: true, math: true, bold: true, bg: true, align: 'center' });
  V.line3([[0, 0, 0], [0, 0, H]], { color: 'ink', width: 1.2, style: 'dot', zbias: 60 });
  V.text3('h', [0.1, 0, H * 0.3], { size: 17, italic: true, math: true, bold: true, bg: true });
  V.flush();
  // 右：表
  const L = 560, T = 40;
  cv.text('円板の和 ÷ 円柱 πr²h', L, T, { size: 16, bold: true });
  cv.text('n', L, T + 36, { size: 15, color: 'sub', italic: true }); cv.text('下の面（大きめ）', L + 50, T + 36, { size: 15, color: 'sub' }); cv.text('上の面', L + 200, T + 36, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 52], [870, T + 52]], { color: 'line', width: 1 });
  [4, 10, 100].forEach((m, i) => {
    const y = T + 82 + i * 36, on = m === n;
    if (on) cv.rect(L - 6, y - 16, 316, 32, { fill: 'hl', alpha: 1 });
    cv.text(String(m), L, y, { size: 16, bold: on }); cv.text(sh(Rn(m)), L + 60, y, { size: 16, bold: on }); cv.text(sh(Ln(m)), L + 210, y, { size: 16, bold: on });
  });
  cv.text(`いま n＝${n}：${sh(st.mode === 'out' ? Rn(n) : Ln(n))}`, L, T + 200, { size: 16, bold: true, color: 'a' });
  cv.text('→ 1/3 に近づく', L, T + 232, { size: 16, bold: true });
  cv.text('（5-10 の y＝x² の短冊と同じ数）', L, T + 264, { size: 14, color: 'sub' });
}

function drawArea(cv, st) {
  const n = st.n, v = cv.view({ x0: 0, x1: 1.15, y0: 0, y1: 1.15, box: [70, 24, 480, 360] });
  v.axes({ xt: [0.5, 1], yt: [0.5, 1], xfmt: x => x === 1 ? 'h' : 'h/2', yfmt: y => y === 1 ? 'πr²' : '', xl: 'y（頂点から）', yl: '断面積' });
  for (let k = 1; k <= n; k++) {
    const a = (k - 1) / n, b = k / n, x = st.mode === 'out' ? b : a, hh = x * x;
    v.poly([[a, 0], [b, 0], [b, hh], [a, hh]], { fill: 'a', alpha: 0.32, color: n <= 40 ? 'a' : null, width: 1 });
  }
  v.plot(y => y * y, { x0: 0, x1: 1.06, color: 'ink', width: 3 });
  v.text('底面', 1, 1.06, { align: 'center', size: 15, bg: true });
  const L = 600;
  cv.text('長方形 1 本の面積', L, 60, { size: 15, color: 'sub' });
  cv.text('＝ 断面積 × Δy', L, 88, { size: 16 });
  cv.text('＝ 円板 1 枚の体積', L, 116, { size: 16 });
  cv.text(`和 ＝ πr²h × ${sh(st.mode === 'out' ? Rn(n) : Ln(n))}`, L, 180, { size: 16, bold: true, color: 'a' });
  cv.text('はば → 0 で　(1/3)πr²h', L, 216, { size: 16, bold: true });
}
