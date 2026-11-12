// @id m3-07
// @title 短冊を細かくすると面積に近づく
// @vol 数学5
// @from 数学 5-9 ②③（ch5-09:155〜258 の v=2t）・5-10 ①〜⑤（ch5-10:110〜434・916 の y=x²）／5-12・5-16・6-2、物理 力（仕事）でも使う
'use strict';
// 5-9：v=2t、0〜4 秒。Δt=1・0.5・0.25・0.1・0.01 で はじめの速さの和 12・14・15・15.6・15.96、おわりの速さの和 20・18・17・16.4・16.04 → 16 m
// 5-10：y=x²、0〜1。右はしの和 S_n=(1/6)(1+1/n)(2+1/n)。n=4：0.46875・0.21875、n=10：0.385・0.285、n=100：0.33835・0.32835、まん中 n=4：0.328125
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const sh = v => String(Number(v.toFixed(6))).replace('-', '−');
const DTS = [1, 0.5, 0.25, 0.1, 0.01];
const Rn = n => (n + 1) * (2 * n + 1) / (6 * n * n), Ln = n => (n - 1) * (2 * n - 1) / (6 * n * n), Mn = n => (4 * n * n - 1) / (12 * n * n);
function stepIdx(st, dt, key, list, hold) {
  st.t += dt; const k = Math.min(list.length - 1, Math.floor(st.t / hold));
  st[key] = list[k]; if (st.t >= hold * list.length) return false;
}

A.item({
  id: 'm3-07', title: '短冊を細かくすると面積に近づく',
  from: '数学 第5巻 5-9「距離は面積」・5-10「区分求積と定積分」の図から（5-12・5-16・6-2、物理 力 でも使う）',
  W: 880, H: 420,
  state: { t: 0 },
  scenes: [
    {
      key: 'kuruma', label: '① 走り出した車の距離',
      lead: '1 秒ごとに 2 m/s ずつ速くなる車（$v=2t$）が、4 秒で進む距離を、細い長方形の和で求めます。▶ で区間を短くしていきます。',
      note: '区間のはじめの速さを使うと少なめ（すき間）、おわりの速さを使うと多め（はみ出し）。$\\Delta t$ を小さくすると、2 つの和の差 $8\\times\\Delta t$ は 0 に近づき、どちらも 16 に近づきます。ほんとうの距離は **16 m**（三角形 $\\frac{1}{2}\\times4\\times8$）です。',
      legend: [['はじめの速さの長方形', { color: 'a', style: 'solid' }], ['数えもれたすき間', { color: 'e', shape: 'tri', noline: true }], ['おわりの速さではみ出す分（破線のふち）', { color: 'b', style: 'dash' }], ['$v=2t$', { color: 'ink', width: 3 }]],
      state: { dt: 1, mode: 'start' },
      controls: [{ seg: 'dt', label: '区間のはば $\\Delta t$', options: DTS.map(d => [d, String(d)]) }, { seg: 'mode', label: '長方形の高さ', options: [['start', 'はじめの速さ'], ['end', 'おわりの速さ'], ['both', '両方']] }],
      step(st, dt) { return stepIdx(st, dt, 'dt', DTS, 1.6); },
      draw(cv, st) { drawCar(cv, st); },
      readout: st => { const n = Math.round(4 / st.dt), s = st.dt * st.dt * n * (n - 1), e = st.dt * st.dt * n * (n + 1); return `$\\Delta t$ ＝ ${st.dt}（${n} 区間）：はじめの速さの和 ${sh(s)} m ＜ ほんとうの距離 ＜ おわりの速さの和 ${sh(e)} m（差 ${sh(e - s)}）`; }
    },
    {
      key: 'x2', label: '② $y=x^2$ を $n$ 本で',
      lead: '$y=x^2$ の 0 から 1 までの下の面積を、はば $\\frac{1}{n}$ の長方形 $n$ 本の和ではさみます。本数 $n$ を変えてみましょう。',
      note: '右はしの長方形はグラフの上にはみ出し（大きめ）、左はしの長方形はすき間ができます（小さめ）。$n$ をふやすと 2 つの和は両側から $\\frac{1}{3}$ にはさまれて近づきます。「細かく分けて、かけて、たす」→ はばを 0 に近づけた先が定積分 $\\int_0^1x^2\\,dx=\\frac{1}{3}$ です。',
      legend: [['長方形', { color: 'a', style: 'solid' }], ['$y=x^2$', { color: 'ink', width: 3 }], ['右はしの和（右のグラフ）', { color: 'b', shape: 'square' }], ['左はしの和（右のグラフ）', { color: 'c', shape: 'tri', style: 'dash' }], ['$\\frac{1}{3}$', { color: 'd', style: 'dot' }]],
      state: { n: 4, mode: 'R' },
      controls: [{ range: 'n', label: '本数 $n$', min: 1, max: 100, step: 1, d: 0 }, { seg: 'mode', label: '高さをとる所', options: [['R', '右はし'], ['L', '左はし'], ['M', 'まん中']] }],
      step(st, dt) { return stepIdx(st, dt, 'n', [1, 2, 4, 10, 25, 100], 1.5); },
      draw(cv, st) { drawX2(cv, st); },
      readout: st => { const n = st.n; return `$n$ ＝ ${n}：左はし ${sh(Ln(n))} ＜ $S$ ＜ 右はし ${sh(Rn(n))}　まん中 ${sh(Mn(n))}　（$\\frac{1}{3}$ ＝ 0.333333…）`; }
    },
    {
      key: 'sa', label: '③ 右はしと左はしの差',
      lead: '右はしの長方形から、左はしの長方形をとった残り（はみ出し＋すき間）を、右へすべらせて集めてみます。▶ で動きます。',
      note: '残りの細い長方形は、高さがちょうど重ならずに積み重なり、はば $\\frac{1}{n}$・高さ 1 の 1 本の柱になります。だから「右はしの和 − 左はしの和 ＝ $\\frac{1}{n}$」。$n$ をふやすと、この差はいくらでも 0 に近くなります。',
      legend: [['右はしと左はしの差の部分', { color: 'b', style: 'dash' }], ['左はしの長方形', { color: 'a', style: 'solid' }], ['$y=x^2$', { color: 'ink', width: 3 }]],
      state: { n: 5, slide: 0 },
      controls: [{ range: 'n', label: '本数 $n$', min: 2, max: 30, step: 1, d: 0 }, { range: 'slide', label: '右へ集める', min: 0, max: 1, step: 0.01, fmt: v => Math.round(v * 100) + ' %' }],
      step(st, dt) { st.t += dt; st.slide = ease((st.t - 0.3) / 2.5); if (st.t > 3) return false; },
      draw(cv, st) { drawSa(cv, st); },
      readout: st => `$n$ ＝ ${st.n}：右はし ${sh(Rn(st.n))} − 左はし ${sh(Ln(st.n))} ＝ <b>${sh(Rn(st.n) - Ln(st.n))}</b> ＝ $\\frac{1}{n}$`
    }
  ]
});

function drawCar(cv, st) {
  const v = cv.view({ x0: 0, x1: 4.7, y0: 0, y1: 9.4, box: [60, 20, 440, 370] });
  const d = st.dt, n = Math.round(4 / d), thin = n > 40;
  v.axes({ xt: [1, 2, 3, 4], yt: [2, 4, 6, 8], xl: 't（s）', yl: 'v（m/s）' });
  for (let k = 0; k < n; k++) {
    const a = k * d, b = a + d, va = 2 * a, vb = 2 * b;
    if (st.mode !== 'end') {
      v.poly([[a, 0], [b, 0], [b, va], [a, va]], { fill: 'a', alpha: 0.28, color: thin ? null : 'a', width: 1.2 });
      v.poly([[a, va], [b, va], [b, vb]], { fill: 'e', alpha: 0.55 });
    }
    if (st.mode === 'end') v.poly([[a, 0], [b, 0], [b, vb], [a, vb]], { fill: 'a', alpha: 0.28, color: thin ? null : 'a', width: 1.2 });
    if (st.mode !== 'start') v.poly([[a, va], [a, vb], [b, vb]], { fill: 'b', alpha: 0.45, color: thin ? null : 'b', style: 'dash', width: 1.2 });
    if (!thin && n <= 8 && st.mode !== 'end' && va > 0.5) v.text(String(+va.toFixed(2)), (a + b) / 2, va / 2, { align: 'center', size: 15 });
  }
  v.plot(t => 2 * t, { x0: 0, x1: 4.2, color: 'ink', width: 3 });
  // 右：本の表
  const L = 540, T = 36;
  cv.text('Δt', L, T, { size: 15, color: 'sub' }); cv.text('はじめの和', L + 60, T, { size: 15, color: 'sub' }); cv.text('おわりの和', L + 160, T, { size: 15, color: 'sub' }); cv.text('差', L + 262, T, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 16], [870, T + 16]], { color: 'line', width: 1 });
  DTS.forEach((b, k) => {
    const y = T + 44 + k * 38, m = Math.round(4 / b), s = b * b * m * (m - 1), e = b * b * m * (m + 1), on = b === d;
    if (on) cv.rect(L - 6, y - 16, 330, 32, { fill: 'hl', alpha: 1 });
    cv.text(String(b), L, y, { size: 16, bold: on }); cv.text(sh(s), L + 70, y, { size: 16, bold: on, color: 'a' }); cv.text(sh(e), L + 170, y, { size: 16, bold: on, color: 'b' }); cv.text(sh(e - s), L + 262, y, { size: 16, bold: on });
  });
  cv.text('→ どちらも 16 に近づく', L, T + 44 + 5 * 38 + 4, { size: 16, bold: true });
  cv.text('ほんとうの距離 ＝ 16 m', L, T + 44 + 6 * 38, { size: 16, bold: true, color: 'd' });
}

function drawX2(cv, st) {
  const n = st.n, v = cv.view({ x0: 0, x1: 1.15, y0: 0, y1: 1.15, box: [55, 20, 400, 370] });
  v.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [0.5, 1], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true, xfmt: x => String(x) });
  v.area(x => x * x, 0, 1, { fill: 'd', alpha: 0.12 });
  for (let k = 1; k <= n; k++) {
    const a = (k - 1) / n, b = k / n, xh = st.mode === 'R' ? b : st.mode === 'L' ? a : (a + b) / 2, h = xh * xh;
    v.poly([[a, 0], [b, 0], [b, h], [a, h]], { fill: 'a', alpha: 0.3, color: n <= 40 ? 'a' : null, width: 1.2 });
    if (n <= 16) v.dot(xh, h, { color: 'ink', r: 3.5 });
  }
  v.plot(x => x * x, { x0: 0, x1: 1.07, color: 'ink', width: 3 });
  const sum = st.mode === 'R' ? Rn(n) : st.mode === 'L' ? Ln(n) : Mn(n);
  cv.text(`長方形の和 ＝ ${sh(sum)}`, 75, 40, { size: 17, bold: true, bg: true });
  // 右：和のグラフ（n は 1〜100、目もりは log）
  const g = cv.view({ x0: 0, x1: 2.08, y0: 0, y1: 1.05, box: [510, 30, 340, 330] });
  g.axes({ xt: [0, Math.log10(4), 1, 2], yt: [0.25, 1 / 3, 0.5, 1], xfmt: x => String(Math.round(Math.pow(10, x))), yfmt: y => Math.abs(y - 1 / 3) < 1e-6 ? '1/3' : A.num(y, 2), zero: true });
  cv.text('本数 n（目もりは 10 倍ずつ）', 850, 398, { align: 'right', size: 14, color: 'sub' });
  cv.text('和', 518, 24, { size: 14, color: 'sub' });
  g.plot(() => 1 / 3, { color: 'd', style: 'dot', width: 2.5 });
  g.plot(x => Rn(Math.pow(10, x)), { x0: 0, x1: 2, color: 'b', width: 1.5, alpha: 0.6 });
  g.plot(x => Ln(Math.pow(10, x)), { x0: 0, x1: 2, color: 'c', style: 'dash', width: 1.5, alpha: 0.8 });
  const lx = Math.log10(n);
  g.dot(lx, Rn(n), { color: 'b', shape: 'square', r: 6 });
  g.dot(lx, Ln(n), { color: 'c', shape: 'tri', r: 6 });
  if (st.mode === 'M') g.dot(lx, Mn(n), { color: 'd', shape: 'diamond', r: 6 });
  g.text('右はし', 0.05, Rn(1) - 0.04, { size: 15, color: 'b', base: 'top' });
  g.text('左はし', 0.12, 0.06, { size: 15, color: 'c' });
}

function drawSa(cv, st) {
  const n = st.n, u = st.slide, v = cv.view({ x0: 0, x1: 1.4, y0: 0, y1: 1.12, box: [60, 20, 600, 370] });
  v.axes({ xt: [0.5, 1], yt: [0.5, 1], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  for (let k = 1; k <= n; k++) {
    const a = (k - 1) / n, b = k / n, lo = a * a, hi = b * b;
    v.poly([[a, 0], [b, 0], [b, lo], [a, lo]], { fill: 'a', alpha: 0.22, color: 'a', width: 1 });
    // 差の部分（a〜b のはば、高さ a²〜b²）を、右はしの列（1〜1+1/n）へ動かす
    const sx = (1 + 0.12 - a) * u;
    v.poly([[a + sx, lo], [b + sx, lo], [b + sx, hi], [a + sx, hi]], { fill: 'b', alpha: 0.45, color: 'b', style: 'dash', width: 1.5 });
  }
  v.plot(x => x * x, { x0: 0, x1: 1.03, color: 'ink', width: 3 });
  if (u > 0.95) {
    const x1 = 1.12, x2 = 1.12 + 1 / n;
    v.line([[x2 + 0.02, 0], [x2 + 0.02, 1]], { color: 'ink', width: 1.5 });
    v.text('高さ 1', x2 + 0.03, 0.5, { size: 16, bold: true });
    v.text('はば 1/n', (x1 + x2) / 2, 1.02, { align: 'center', base: 'bottom', size: 16, bold: true, bg: true });
  }
  const L = 700;
  cv.text(`n ＝ ${n}`, L, 50, { size: 17, bold: true });
  cv.text(`右はし ${sh(Rn(n))}`, L, 90, { size: 16 });
  cv.text(`左はし ${sh(Ln(n))}`, L, 120, { size: 16 });
  cv.text(`差 ＝ ${sh(Rn(n) - Ln(n))}`, L, 160, { size: 16, bold: true, color: 'b' });
  cv.text(`＝ 1 ÷ ${n}`, L, 190, { size: 16, bold: true, color: 'b' });
}
