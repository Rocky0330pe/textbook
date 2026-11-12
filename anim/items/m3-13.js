// @id m3-13
// @title 項をふやすと遠くまで合う：テイラー展開
// @vol 数学5
// @from 数学 5-17 ①〜⑥（ch5-17:70〜130 の e^x・180〜222 の sin x・230 の小さい x）・⑧（ch5-17:300〜319 の振り子）・まちがえやすいところ（ch5-17:510〜521）／5-8・6-6・6-10、物理 波 でも使う
'use strict';
// 5-17：e^x ≈ 1+x（x=0.1・0.5・1 で ずれ 0.005・0.149・0.718）、1+x+x²/2（0.0002・0.024・0.218）
// 5-17：sin 0.5 ≈ 0.5 − 0.125/6 + 0.03125/120 ＝ 0.4794271（電卓 0.4794255）
// 5-17 ⑧：振り子の周期（小さいふれを 1 倍）：10° 1.0019、30° 1.0174、60° 1.0732、90° 1.1803（sin のまま計算）
const fact = n => n <= 1 ? 1 : n * fact(n - 1);
const pExp = (x, n) => { let s = 0; for (let k = 0; k <= n; k++) s += x ** k / fact(k); return s; };
const pSin = (x, m) => { let s = 0; for (let k = 0; k < m; k++) s += (k % 2 ? -1 : 1) * x ** (2 * k + 1) / fact(2 * k + 1); return s; };
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const sup = k => String(k).split('').map(c => SUP[+c]).join('');
const expName = n => ['1', 'x', ...A.range(2, n).map(k => `x${sup(k)}/${k}!`)].slice(0, n + 1).join(' ＋ ');
const sinName = m => A.range(0, m - 1).map(k => k === 0 ? 'x' : `${k % 2 ? '−' : '＋'} x${sup(2 * k + 1)}/${2 * k + 1}!`).join(' ');
const agm = (a, b) => { for (let i = 0; i < 30; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]; return a; };
const period = deg => { const k = Math.sin(deg * Math.PI / 360); return 1 / agm(1, Math.sqrt(1 - k * k)); };
const sh = (v, d) => A.num(v, d);
// よく合う範囲（ずれ 0.01 未満）を、x 軸の上に帯でかく
function goodBand(v, f, p, x0, x1) {
  let s = null; const N = 400, segs = [];
  for (let k = 0; k <= N; k++) { const x = x0 + (x1 - x0) * k / N, ok = Math.abs(f(x) - p(x)) < 0.01; if (ok && s === null) s = x; if ((!ok || k === N) && s !== null) { segs.push([s, x]); s = null; } }
  for (const [a, b] of segs) v.poly([[a, v.y0], [b, v.y0], [b, v.y1], [a, v.y1]], { fill: 'c', alpha: 0.1 });
  return segs;
}

A.item({
  id: 'm3-13', title: '項をふやすと遠くまで合う：テイラー展開',
  from: '数学 第5巻 5-17「テイラー展開」の図から（5-8・6-6・6-10、物理 波 でも使う）',
  W: 880, H: 420,
  state: { t: 0 },
  scenes: [
    {
      key: 'ex', label: '① $e^x$ を多項式で',
      lead: '$e^x$ を、$x=0$ で値・傾き・曲がり方…を合わせた多項式で近似します。▶ で項がふえていきます。',
      note: '1 次近似 $1+x$ は接線です。$\\frac{x^2}{2}$ をたすと曲がり方も合い、$x=0.5$ のずれは 0.149 から 0.024 にへります。項をふやすほど、緑の帯（ずれが 0.01 より小さい所）が広がり、$x=0$ から遠くまで合います。',
      miss: '階乗でわるのをわすれない。$x^3$ の項は $\\frac{x^3}{3!}=\\frac{x^3}{6}$ です（3 でわるのではありません）。',
      legend: [['$e^x$', { color: 'a', width: 4 }], ['近似の多項式', { color: 'b', style: 'dash', width: 3 }], ['ずれが 0.01 より小さい所', { color: 'c', shape: 'square', noline: true }]],
      state: { n: 1, x: 0.5 },
      controls: [{ range: 'n', label: '何次まで', min: 1, max: 6, step: 1, d: 0 }, { range: 'x', label: '$x$', min: -2, max: 2, step: 0.01 }],
      step(st, dt) { st.t += dt; st.n = Math.min(6, 1 + Math.floor(st.t / 1.4)); if (st.t >= 1.4 * 6) return false; },
      draw(cv, st) { drawExp(cv, st); },
      readout: st => { const e = Math.exp(st.x), p = pExp(st.x, st.n); return `$x$ ＝ ${sh(st.x, 2)}：$e^x$ ＝ ${sh(e, 5)}、${st.n} 次の近似 ＝ ${sh(p, 5)}、ずれ <b>${sh(Math.abs(e - p), 4)}</b>`; }
    },
    {
      key: 'sin', label: '② $\\sin x$ を多項式で',
      lead: '$\\sin x=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\cdots$ を、項の数で止めて、$\\sin x$ のグラフとくらべます。',
      note: '奇数の次数だけで、＋と−が交代します。3 項（$x-\\frac{x^3}{6}+\\frac{x^5}{120}$）なら $-\\frac{\\pi}{2}$ から $\\frac{\\pi}{2}$ くらいまでほとんど重なり、$\\sin0.5\\approx0.4794271$（電卓 0.4794255）と小数 5 けたまで合います。',
      miss: '$x$ が大きいのに、少ない項で近似しない。$\\sin3\\approx3$ は大まちがい（正しくは 0.14）。遠い所では、項をたくさんとります。',
      legend: [['$\\sin x$', { color: 'a', width: 4 }], ['項の数で止めた多項式', { color: 'b', style: 'dash', width: 3 }], ['ずれが 0.01 より小さい所', { color: 'c', shape: 'square', noline: true }]],
      state: { m: 1, x: 0.5 },
      controls: [{ range: 'm', label: '項の数', min: 1, max: 7, step: 1, d: 0 }, { range: 'x', label: '$x$', min: -6.2, max: 6.2, step: 0.01 }],
      step(st, dt) { st.t += dt; st.m = Math.min(7, 1 + Math.floor(st.t / 1.4)); if (st.t >= 1.4 * 7) return false; },
      draw(cv, st) { drawSin(cv, st); },
      readout: st => { const e = Math.sin(st.x), p = pSin(st.x, st.m); return `$x$ ＝ ${sh(st.x, 2)}：$\\sin x$ ＝ ${sh(e, 7)}、${st.m} 項 ＝ ${sh(p, 7)}、ずれ <b>${sh(Math.abs(e - p), 7)}</b>`; }
    },
    {
      key: 'shou', label: '③ $\\sin\\theta\\approx\\theta$ と振り子',
      lead: 'ふれの角 $\\theta$ を大きくしていくと、$\\sin\\theta\\approx\\theta$ はどこまで使えるでしょう。左は円の弧（長さ $\\theta$）と高さ（$\\sin\\theta$）、右は振り子の周期です。',
      note: '小さい角では、弧の長さ $\\theta$ と高さ $\\sin\\theta$ はほとんど同じで、ずれの目安は次の項 $\\frac{\\theta^3}{6}$ です。振り子の周期 $2\\pi\\sqrt{\\frac{L}{g}}$ はこの近似から出た式で、10° では 0.2 % 長いだけですが、90° では 18 % 長くなります。',
      miss: '$\\sin\\theta\\approx\\theta$ に度の値を入れない。$\\sin10°\\approx10$ ではなく、$10°=0.1745$ rad なので $\\sin10°\\approx0.1745$。テイラー展開はラジアンでしか成り立ちません。',
      legend: [['弧の長さ $\\theta$（rad）', { color: 'b', style: 'solid', width: 4 }], ['高さ $\\sin\\theta$', { color: 'a', style: 'dash', width: 4 }], ['振り子の周期（小さいふれを 1 倍）', { color: 'd', style: 'solid' }]],
      state: { deg: 10 },
      controls: [{ range: 'deg', label: 'ふれの角 $\\theta$', min: 1, max: 90, step: 1, fmt: v => v + '°' }],
      step(st, dt) { if (!st.t) st.t0 = st.deg; st.t += dt; st.deg = Math.min(90, Math.round(st.t0 + st.t * 15)); if (st.deg >= 90) return false; },
      draw(cv, st) { drawShou(cv, st); },
      readout: st => { const th = st.deg * Math.PI / 180; return `$\\theta$ ＝ ${st.deg}° ＝ ${sh(th, 4)} rad：$\\sin\\theta$ ＝ ${sh(Math.sin(th), 4)}、ずれ ${sh(th - Math.sin(th), 4)}（${sh((th - Math.sin(th)) / Math.sin(th) * 100, 1)} %）、周期は <b>${sh(period(st.deg), 4)} 倍</b>`; }
    }
  ]
});

function drawExp(cv, st) {
  const v = cv.view({ x0: -2.1, x1: 2.2, y0: -0.8, y1: 6.4, box: [60, 24, 520, 360] });
  goodBand(v, Math.exp, x => pExp(x, st.n), -2.1, 2.2);
  v.axes({ xt: [-2, -1, 1, 2], yt: [2, 4, 6], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  v.plot(Math.exp, { color: 'a', width: 4 });
  v.plot(x => pExp(x, st.n), { color: 'b', style: 'dash', width: 3 });
  const x = st.x, e = Math.exp(x), p = pExp(x, st.n);
  v.line([[x, e], [x, p]], { color: 'ink', width: 2 });
  v.dot(x, e, { color: 'a', r: 5 }); v.dot(x, p, { color: 'b', r: 5, shape: 'square' });
  cv.text(expName(st.n), 75, 40, { size: 17, bold: true, color: 'b', bg: true, math: true });
  const L = 610, T = 40;
  cv.text('本の表（ずれ）', L, T, { size: 16, bold: true });
  cv.text('x', L, T + 34, { size: 15, color: 'sub', italic: true }); cv.text('1＋x', L + 60, T + 34, { size: 15, color: 'sub' }); cv.text('＋x²/2', L + 150, T + 34, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 50], [870, T + 50]], { color: 'line', width: 1 });
  [[0.1, '0.005', '0.0002'], [0.5, '0.149', '0.024'], [1, '0.718', '0.218']].forEach(([q, a, b], i) => {
    const y = T + 78 + i * 34;
    cv.text(String(q), L, y, { size: 16 }); cv.text(a, L + 60, y, { size: 16, bold: st.n === 1 }); cv.text(b, L + 150, y, { size: 16, bold: st.n === 2 });
  });
  cv.text(`いま ${st.n} 次：x＝1 で ずれ ${sh(Math.E - pExp(1, st.n), 4)}`, L, T + 200, { size: 16, bold: true, color: 'b' });
}

function drawSin(cv, st) {
  const v = cv.view({ x0: -6.6, x1: 6.8, y0: -2, y1: 2, box: [40, 24, 800, 340] });
  goodBand(v, Math.sin, x => pSin(x, st.m), -6.6, 6.8);
  v.axes({ xt: A.range(-2 * Math.PI, 2 * Math.PI, Math.PI / 2), yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 'x', xlItalic: true });
  v.plot(Math.sin, { color: 'a', width: 4 });
  v.plot(x => pSin(x, st.m), { color: 'b', style: 'dash', width: 3, n: 600 });
  const x = st.x, e = Math.sin(x), p = pSin(x, st.m);
  v.clip(() => v.line([[x, e], [x, p]], { color: 'ink', width: 2 }));
  v.dot(x, e, { color: 'a', r: 5 });
  if (Math.abs(p) < 2) v.dot(x, p, { color: 'b', r: 5, shape: 'square' });
  cv.text(sinName(st.m), 60, 400, { size: 17, bold: true, color: 'b', bg: true, math: true });
}

function drawShou(cv, st) {
  const th = st.deg * Math.PI / 180;
  const v = cv.view({ x0: -0.15, x1: 1.25, y0: -0.15, y1: 1.25, box: [30, 20, 380, 380], equal: true });
  v.axes({ xt: [1], yt: [1] });
  const arc = []; for (let k = 0; k <= 60; k++) arc.push([Math.cos(Math.PI / 2 * k / 60), Math.sin(Math.PI / 2 * k / 60)]);
  v.line(arc, { color: 'sub', width: 1.2 });
  const a2 = []; for (let k = 0; k <= 60; k++) a2.push([Math.cos(th * k / 60), Math.sin(th * k / 60)]);
  v.line([[0, 0], [1, 0]], { color: 'sub', width: 1.2 });
  v.line([[0, 0], [Math.cos(th), Math.sin(th)]], { color: 'ink', width: 1.5 });
  v.line(a2, { color: 'b', width: 5 });
  v.line([[Math.cos(th), 0], [Math.cos(th), Math.sin(th)]], { color: 'a', width: 4, style: 'dash' });
  v.text('θ', Math.cos(th / 2) * 1.08, Math.sin(th / 2) * 1.08, { size: 17, color: 'b', bold: true, math: true, italic: true });
  v.text('sin θ', Math.cos(th) - 0.04, Math.sin(th) / 2, { size: 16, color: 'a', bold: true, align: 'right', bg: true });
  // 右：振り子の周期
  const g = cv.view({ x0: 0, x1: 95, y0: 0.98, y1: 1.22, box: [470, 30, 380, 320] });
  g.axes({ xt: [10, 30, 45, 60, 90], yt: [1, 1.1, 1.2], xfmt: x => x + '°', yfmt: y => A.num(y, 1) + '倍', ax: 0.98, ay: 0, zero: true });
  g.plot(period, { x0: 0, x1: 90, color: 'd', width: 3 });
  for (const d of [10, 20, 30, 40, 50, 60, 70, 80, 90]) g.dot(d, period(d), { color: 'd', r: 3 });
  g.line([[st.deg, 0.98], [st.deg, period(st.deg)]], { color: 'sub', style: 'dot', width: 1.2 });
  g.dot(st.deg, period(st.deg), { color: 'ink', r: 6 });
  cv.text('振り子の周期', 478, 22, { size: 15, color: 'd', bold: true });
  cv.text('ふれはば', 850, 392, { align: 'right', size: 14, color: 'sub' });
}
