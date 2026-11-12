// @id m4-21
// @title かけて平均すると成分が残る：直交性
// @vol 数学9
// @from 数学 9-1 図5（ch9-01:454）、9-2 図1・2（ch9-02:251・325）／9-3⑤・9-4、物理 波-11・電-10 でも使う
'use strict';
function sq(t) { const u = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return u < Math.PI ? 1 : -1; }
function integ(g, a, b, M = 2000) { let s = 0; const h = (b - a) / M; for (let k = 0; k < M; k++) s += g(a + (k + 0.5) * h); return s * h; }
const KIND = { ss: ['sin', 'sin'], cc: ['cos', 'cos'], sc: ['sin', 'cos'] };
const nt = n => (n === 1 ? '' : n) + 't';
const fn = (k, n) => k === 'sin' ? (t => Math.sin(n * t)) : (t => Math.cos(n * t));

A.item({
  id: 'm4-21', title: 'かけて平均すると成分が残る：直交性',
  from: '数学 第9巻 9-1 図5・9-2 図1・2 から（9-3・9-4、物理 波-11・電-10 でも使う）',
  W: 880, H: 440,
  state: { n: 1, tc: 2 * Math.PI, m: 1, k: 2, kind: 'ss', dots: false },
  scenes: [
    {
      key: 'kakete', label: '① 方形波に sin nt をかける',
      lead: '高さ1の方形波 $f$ に $\\sin nt$ をかけ、1周期で平均して2倍します。▶ で、左から順にたしていきます。',
      note: '$n=1$ では、$f$ と $\\sin t$ はいつも同じ符号なので、積は0以上で、平均の2倍は $\\frac{4}{\\pi}=1.273$ になります。$n=2$ では、上と下の面積が同じで0。方形波にふくまれる成分だけが、かけ算で「取り出され」ます（$b_n=\\frac{4}{n\\pi}$、偶数番は0）。',
      miss: '平均（$\\frac{1}{N}\\sum$）だけでは半分の値になります。係数は「平均の**2倍**」です。$\\sin^2t$ の平均が $\\frac{1}{2}$ だからです。',
      init: st => { st.tc = 0; },
      legend: [['方形波 $f$', { color: 'b', style: 'dash' }], ['$\\sin nt$', { color: 'c', style: 'dot' }], ['積 $f\\times\\sin nt$（＋の面・−の面）', { color: 'a' }]],
      controls: [{ range: 'n', label: '$n$', min: 1, max: 7, step: 1, d: 0, on: st => { st.tc = 0; } }],
      step(st, dt) { st.tc = Math.min(2 * Math.PI, st.tc + dt * 1.2); if (st.tc >= 2 * Math.PI) return false; },
      draw(cv, st) { drawKakete(cv, st); },
      readout: st => { const v = integ(t => sq(t) * Math.sin(st.n * t), 0, st.tc) / Math.PI; const b = st.n % 2 ? 4 / (st.n * Math.PI) : 0; return `ここまでの「平均の2倍」＝ ${A.num(v, 4)}　　1周期で $b_{${st.n}}$ ＝ ${A.num(b, 4)}` + (st.n % 2 ? `（$\\frac{4}{${st.n === 1 ? '' : st.n}\\pi}$）` : '（偶数番は0）'); }
    },
    {
      key: 'chokko', label: '② ちがう波どうしは打ち消す',
      lead: '2つの波をかけて、0 から $2\\pi$ まで積分します。番号と種類を変えてみましょう。',
      note: '「同じ番号の、同じ種類（sin と sin、cos と cos）」のときだけ積分は $\\pi$ で、ほかはすべて0です（三角関数の**直交性**）。12点の値の積をたしてきざみ $\\frac{\\pi}{6}$ をかけても、同じ0と $\\pi$ になります。関数を「たくさんの点の値を並べたベクトル」と見ると、これは内積です。',
      miss: '$\\sin2t\\times\\cos2t$ は同じ番号ですが、種類がちがうので0です。0でないのは、同じ番号で同じ種類のときだけです。',
      legend: [['1つめの波', { color: 'c', style: 'dot' }], ['2つめの波', { color: 'b', style: 'dash' }], ['積（＋の面・−の面）', { color: 'a' }], ['12点の値の積', { color: 'd', shape: 'square', noline: true }]],
      controls: [{ seg: 'kind', label: '種類', options: [['ss', 'sin × sin'], ['cc', 'cos × cos'], ['sc', 'sin × cos']] }, { range: 'm', label: '1つめの番号 $m$', min: 1, max: 5, step: 1, d: 0 }, { range: 'k', label: '2つめの番号 $n$', min: 1, max: 5, step: 1, d: 0 }, { check: 'dots', label: '表計算', text: '30° ごとの12点で数える' }],
      draw(cv, st) { drawChokko(cv, st); },
      readout: st => {
        const [a, b] = KIND[st.kind], g = t => fn(a, st.m)(t) * fn(b, st.k)(t), I = integ(g, 0, 2 * Math.PI);
        let s = 0; for (let j = 0; j < 12; j++) s += g(j * Math.PI / 6);
        return `$\\int_0^{2\\pi}$ ${a} ${nt(st.m)} × ${b} ${nt(st.k)} $\\mathrm{d}t$ ＝ <b>${Math.abs(I - Math.PI) < 1e-6 ? 'π' : A.num(I, 4)}</b>` + (st.dots ? `　　12点：合計 ${A.num(s, 3)} × 0.5236 ＝ ${A.num(s * Math.PI / 6, 4)}` : '');
      }
    }
  ]
});

function signedArea(v, g, a, b) {
  v.area(t => Math.max(0, g(t)), a, b, { fill: 'a', alpha: 0.35, n: 400 });
  v.area(t => Math.min(0, g(t)), a, b, { fill: 'b', alpha: 0.22, n: 400 });
}
function drawKakete(cv, st) {
  const n = st.n, T = 2 * Math.PI, g = t => sq(t) * Math.sin(n * t);
  const xt = [Math.PI / 2, Math.PI, 3 * Math.PI / 2, T];
  const u = cv.view({ x0: 0, x1: T + 0.2, y0: -1.4, y1: 1.4, box: [50, 14, 600, 170] });
  u.axes({ xt, yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't' });
  u.line([[0, 1], [Math.PI, 1], [Math.PI, -1], [T, -1]], { color: 'b', style: 'dash', width: 2.5 });
  u.plot(t => Math.sin(n * t), { x0: 0, x1: T, color: 'c', style: 'dot', width: 2.5, n: 500 });
  const w = cv.view({ x0: 0, x1: T + 0.2, y0: -1.25, y1: 1.25, box: [50, 214, 600, 190] });
  w.axes({ xt, yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't' });
  signedArea(w, g, 0, st.tc);
  w.plot(g, { x0: 0, x1: T, color: 'a', width: 1.2, alpha: 0.35, n: 500 });
  w.plot(g, { x0: 0, x1: st.tc, color: 'a', width: 3, n: 500 });
  if (st.tc < T) { w.line([[st.tc, -1.25], [st.tc, 1.25]], { color: 'ink', width: 1.5, style: 'dash' }); u.line([[st.tc, -1.4], [st.tc, 1.4]], { color: 'ink', width: 1.5, style: 'dash' }); }
  cv.text('f と sin nt', 60, 22, { size: 15, color: 'sub' }); cv.text('かけた積 f × sin nt', 60, 222, { size: 15, color: 'sub' });
  // ＋・− の札（色だけで分けない）
  for (let j = 0; j < 2 * n; j++) { const c = (j + 0.5) * Math.PI / n; if (c > st.tc) continue; const val = g(c); w.text(val > 0 ? '＋' : '−', c, val * 0.45, { align: 'center', size: 16, bold: true }); }
  // 右：メーター（ここまでの平均の2倍）
  const val = integ(g, 0, st.tc) / Math.PI, b = n % 2 ? 4 / (n * Math.PI) : 0;
  const m = cv.view({ x0: 0, x1: 1, y0: -0.8, y1: 1.6, box: [730, 30, 90, 370] });
  m.line([[0.5, -0.8], [0.5, 1.6]], { color: 'sub', width: 2 });
  for (const y of [-0.5, 0, 0.5, 1, 1.5]) { m.line([[0.42, y], [0.58, y]], { color: 'sub', width: 1.5 }); m.text(A.num(y, 1), 0.32, y, { align: 'right', size: 14, color: 'sub' }); }
  m.poly([[0.38, 0], [0.62, 0], [0.62, val], [0.38, val]], { fill: 'a', alpha: 0.6 });
  m.line([[0.3, b], [0.95, b]], { color: 'd', width: 2.5, style: 'dot' });
  m.text('bₙ', 0.98, b, { size: 15, color: 'd', bold: true });
  cv.text('平均の2倍', 775, 20, { align: 'center', size: 15, bold: true });
}

function drawChokko(cv, st) {
  const [a, b] = KIND[st.kind], f1 = fn(a, st.m), f2 = fn(b, st.k), g = t => f1(t) * f2(t), T = 2 * Math.PI;
  const xt = [Math.PI / 2, Math.PI, 3 * Math.PI / 2, T];
  const u = cv.view({ x0: 0, x1: T + 0.2, y0: -1.4, y1: 1.4, box: [50, 14, 780, 170] });
  u.axes({ xt, yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't' });
  u.plot(f1, { x0: 0, x1: T, color: 'c', style: 'dot', width: 2.5, n: 500 });
  u.plot(f2, { x0: 0, x1: T, color: 'b', style: 'dash', width: 2.5, n: 500 });
  const w = cv.view({ x0: 0, x1: T + 0.2, y0: -1.25, y1: 1.25, box: [50, 214, 780, 190] });
  w.axes({ xt, yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't' });
  signedArea(w, g, 0, T);
  w.plot(g, { x0: 0, x1: T, color: 'a', width: 3, n: 600 });
  if (st.dots) for (let j = 0; j < 12; j++) { const t = j * Math.PI / 6; w.dot(t, g(t), { color: 'd', shape: 'square', r: 5 }); }
  cv.text(`${a} ${nt(st.m)} と ${b} ${nt(st.k)}`, 60, 22, { size: 15, color: 'sub' }); cv.text('かけた積', 60, 222, { size: 15, color: 'sub' });
  const I = integ(g, 0, T);
  cv.text(Math.abs(I) < 1e-6 ? '＋と−が打ち消して 0' : '積分 ＝ π（平均 ½）', 820, 222, { align: 'right', size: 16, bold: true, color: Math.abs(I) < 1e-6 ? 'sub' : 'a' });
}
