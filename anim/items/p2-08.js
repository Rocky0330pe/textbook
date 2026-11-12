// @id p2-08
// @title 定在波：節は動かない
// @vol 物理3
// @from 物理 波-6 ②③④⑤（p3-06 定在波・弦の固有振動・気柱・はじく場所と倍音）／原-5・原-4・電-13・波-14、数学 9-1 でも使う
'use strict';
// ① 本の表計算と同じ：柱（固定端）は左はし、波長 λ=1 m、x=0〜2 m。柱へ向かう波 sin2π(t/T+x/λ)、はね返った波 −sin2π(t/T−x/λ)。
// ② 弦：ギターの A弦 L=0.65 m、c=143 m/s（f1=110 Hz）。管：L=0.50 m、c=343 m/s（開管 343 Hz、閉管 172 Hz・515 Hz。例題2）。
// ③ はしから pL の所を高さ h=5 mm つまむ：b_n = 2h sin(nπp) / (n²π² p(1−p))（例題7：p=1/2 で b1≈4.05 mm）。
A.item({
  id: 'p2-08', title: '定在波：節は動かない',
  from: '物理 第3巻 波-6 ②〜⑤ の図「定在波」「弦の固有振動」「管の中の空気の定在波」「はじく場所と倍音」から（原-5・原-4・電-13・波-14 でも使う）',
  W: 880, H: 420,
  state: { t: 0, ghost: false, kind: 'gen', n: 1, p: 0.5 },
  scenes: [
    {
      key: 'teizai', label: '① 行く波ともどる波',
      lead: '柱（左はし）へ向かう波と、柱ではね返った波が重なります。破線の2つの波はそれぞれ進むのに、和（太い線）はどう動くでしょう。',
      note: '和は $2\\cos\\dfrac{2\\pi t}{T}\\,\\sin\\dfrac{2\\pi x}{\\lambda}$ で、場所だけの関数と時間だけの関数の積です。だから形は進まず、その場で上下するだけです（定在波）。●の節は、いつも0のまま動きません。節と節の間は半波長 $\\lambda/2$、腹のゆれの大きさは、もとの波の2倍です。',
      miss: '定在波の節と節の間は1波長 $\\lambda$ ではなく、半波長 $\\lambda/2$ です。節と腹の間は $\\lambda/4$ です。',
      legend: [['柱へ向かう波', { color: 'a', style: 'dash' }], ['はね返った波', { color: 'b', style: 'dot' }], ['和（定在波）', { color: 'ink' }], ['節', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ check: 'ghost', label: '重ね描き', text: '8分の1周期ごとの形を重ねる（本の図）' }],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.35; if (st.t > 1000) st.t = 0; },
      draw(cv, st) { teizai(cv, st); },
      readout: st => `時刻 $t/T$ ＝ ${A.num(st.t % 1, 2)}　　節の位置：0・0.5・1・1.5・2 m（$\\lambda/2$ おき）　　腹のゆれの大きさ：2（もとの波の2倍）`
    },
    {
      key: 'mode', label: '② 弦と管のモード',
      lead: '弦（両はし固定）・開管（両はし開く）・閉管（右はしを閉じる）で、$n$ 番めのモードを見ましょう。',
      note: '弦と開管は、長さ $L$ に半波長が $n$ 個入るので $f_n=nc/(2L)$。閉管は、閉じたはしが節・開いたはしが腹なので、$\\lambda/4$ が**奇数個**しか入らず $f_n=(2n-1)c/(4L)$ です。管の線の高さは、空気のずれ（縦波を横波のように書いたもの）で、点は空気の小さな部分です。',
      miss: '閉管には、基本の2倍・4倍…の振動はありません。基本の3倍・5倍…の奇数倍だけです。開管は整数倍が全部あります。',
      legend: [['いまの形', { color: 'a' }], ['半周期ずれた形', { color: 'a', style: 'dash' }], ['節', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ seg: 'kind', label: 'どれ', options: [['gen', '弦（A弦）'], ['kai', '開管'], ['hei', '閉管']] }, { range: 'n', label: '番め $n$', min: 1, max: 6, step: 1, d: 0 }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 1000) st.t = 0; },
      draw(cv, st) { mode(cv, st); },
      readout: st => fread(st)
    },
    {
      key: 'hajiku', label: '③ はじく場所と倍音',
      lead: '弦の、はしから $pL$ の所を 5 mm つまんで放します。はじく場所で、どのモードがどれだけ生まれるかが変わります。',
      note: 'はじめの三角の形を、$\\sin(n\\pi x/L)$ の和に分けると、$b_n=\\dfrac{2h\\sin n\\pi p}{n^2\\pi^2p(1-p)}$ です。まん中（$p=1/2$）では偶数番が0、奇数番は $1:\\frac19:\\frac1{25}$。$p=1/5$ では5番め・10番めが出ません。$n$ 番めのモードの**節**をはじくと、そのモードは生まれないのです。',
      legend: [['弦の形（モードの和）', { color: 'a' }], ['はじく場所', { color: 'b', style: 'dash' }], ['各モードの振幅 $|b_n|$', { color: 'c', shape: 'square', noline: true }], ['0 になるモード', { color: 'b', shape: 'cross', noline: true }]],
      controls: [{ range: 'p', label: 'はじく場所 $p$', min: 0.05, max: 0.95, step: 0.05, d: 2, on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 1000) st.t = 0; },
      draw(cv, st) { hajiku(cv, st); },
      readout: st => { const b = bn(st.p); return `$b_1$ ＝ ${A.num(b[1], 2)} mm　　$b_2$ ＝ ${A.num(b[2], 2)}　　$b_3$ ＝ ${A.num(b[3], 2)}　　$b_4$ ＝ ${A.num(b[4], 2)}　　$b_5$ ＝ ${A.num(b[5], 2)} mm`; }
    }
  ]
});

function teizai(cv, st) {
  const v = cv.view({ x0: -0.12, x1: 2.1, y0: -2.5, y1: 2.9, box: [30, 20, 820, 330] });
  v.line([[0, 0], [2.05, 0]], { color: 'grid', width: 1.5 });
  // 柱
  v.poly([[-0.12, -2.4], [0, -2.4], [0, 2.6], [-0.12, 2.6]], { fill: 'sub', alpha: 0.5 });
  const ph = 2 * Math.PI * st.t, k = 2 * Math.PI;
  if (st.ghost) for (let j = 0; j <= 4; j++) { const c = Math.cos(Math.PI * j / 4); v.plot(x => 2 * c * Math.sin(k * x), { x0: 0, x1: 2, color: 'sub', width: 1.2, alpha: 0.7 }); }
  v.plot(x => Math.sin(ph + k * x), { x0: 0, x1: 2, color: 'a', style: 'dash', width: 2 });
  v.plot(x => -Math.sin(ph - k * x), { x0: 0, x1: 2, color: 'b', style: 'dot', width: 2.5 });
  v.plot(x => Math.sin(ph + k * x) - Math.sin(ph - k * x), { x0: 0, x1: 2, color: 'ink', width: 3.5 });
  for (const x of [0, 0.5, 1, 1.5, 2]) v.dot(x, 0, { color: 'ink', r: 6 });
  // 目もり
  for (const [x, s] of [[0.25, 'λ/4'], [0.5, 'λ/2'], [1, 'λ'], [1.5, '3λ/2'], [2, '2λ']]) { v.line([[x, -0.1], [x, 0.1]], { color: 'sub', width: 1 }); cv.text(s, v.X(x), 360, { align: 'center', size: 15, color: 'sub' }); }
  cv.text('柱からの距離', v.X(1), 392, { align: 'center', size: 14, color: 'sub' });
  v.arrow(1.55, 2.55, 1.35, 2.55, { color: 'a', width: 2 }); v.text('柱へ', 1.58, 2.55, { size: 14, color: 'a' });
  v.arrow(0.45, 2.55, 0.65, 2.55, { color: 'b', width: 2 }); v.text('はね返り', 0.42, 2.55, { size: 14, color: 'b', align: 'right' });
}

function shapeOf(kind, n) {
  if (kind === 'gen') return x => Math.sin(n * Math.PI * x);
  if (kind === 'kai') return x => Math.cos(n * Math.PI * x);
  return x => Math.cos((2 * n - 1) * Math.PI * x / 2);       // 左が開いたはし（腹）、右が閉じたはし（節）
}
function fread(st) {
  if (st.kind === 'gen') return `弦：$f_n=nc/(2L)$ ＝ ${st.n} × 143 ÷ 1.30 ＝ <b>${A.num(110 * st.n, 0)} Hz</b>（基本の ${st.n} 倍）　　節 ${st.n + 1} 個・腹 ${st.n} 個`;
  if (st.kind === 'kai') return `開管：$f_n=nc/(2L)$ ＝ ${st.n} × 343 ÷ 1.0 ＝ <b>${A.num(343 * st.n, 0)} Hz</b>（基本の ${st.n} 倍）`;
  const m = 2 * st.n - 1; return `閉管：$f_n=(2n-1)c/(4L)$ ＝ ${m} × 343 ÷ 2.0 ＝ <b>${A.num(343 * m / 2, 0)} Hz</b>（基本の ${m} 倍）`;
}
function mode(cv, st) {
  const f = shapeOf(st.kind, st.n), m = st.kind === 'hei' ? 2 * st.n - 1 : st.n;
  const c = Math.cos(1.6 * m * st.t);        // 見せる速さ（本当の振動数に比例、ゆっくり）
  const v = cv.view({ x0: -0.06, x1: 1.06, y0: -1.6, y1: 1.6, box: [40, 40, 800, 260] });
  if (st.kind === 'gen') {
    v.plot(x => f(x), { x0: 0, x1: 1, color: 'a', style: 'dash', width: 1.5, alpha: 0.6 }); v.plot(x => -f(x), { x0: 0, x1: 1, color: 'a', style: 'dash', width: 1.5, alpha: 0.6 });
    v.plot(x => c * f(x), { x0: 0, x1: 1, color: 'a', width: 3.5 });
    for (const x of [0, 1]) { v.poly([[x - (x ? -0.02 : 0.02), -0.5], [x, -0.5], [x, 0.5], [x - (x ? -0.02 : 0.02), 0.5]], { fill: 'sub', alpha: 0.6 }); }
    for (let j = 0; j <= st.n; j++) v.dot(j / st.n, 0, { color: 'ink', r: 6 });
    cv.text('L ＝ 0.65 m', v.X(0.5), 330, { align: 'center', size: 15, color: 'sub' });
  } else {
    // 管（上下の壁）と、空気のずれの振幅
    v.line([[0, 1.35], [1, 1.35]], { color: 'ink', width: 2.5 }); v.line([[0, -1.35], [1, -1.35]], { color: 'ink', width: 2.5 });
    if (st.kind === 'hei') v.line([[1, -1.35], [1, 1.35]], { color: 'ink', width: 7 });
    v.plot(x => f(x), { x0: 0, x1: 1, color: 'a', style: 'dash', width: 1.5, alpha: 0.7 }); v.plot(x => -f(x), { x0: 0, x1: 1, color: 'a', style: 'dash', width: 1.5, alpha: 0.7 });
    v.plot(x => c * f(x), { x0: 0, x1: 1, color: 'a', width: 3.5 });
    // 空気の小さな部分（左右にずれる）
    for (let i = 0; i <= 40; i++) { const x0 = i / 40, d = 0.018 * c * f(x0); for (const yy of [-0.95, 0.95]) v.dot(x0 + d, yy, { color: 'sub', r: 3 }); }
    // 節
    const zs = []; for (let i = 0; i < 400; i++) { const a = f(i / 400), b = f((i + 1) / 400); if (a === 0 || a * b < 0) zs.push((i + 0.5) / 400); }
    if (Math.abs(f(1)) < 1e-9) zs.push(1);
    zs.forEach(x => v.dot(x, 0, { color: 'ink', r: 6 }));
    cv.text(st.kind === 'hei' ? '開いたはし（腹）' : '開いたはし（腹）', v.X(0), 22, { align: 'left', size: 14, color: 'sub' });
    cv.text(st.kind === 'hei' ? '閉じたはし（節）' : '開いたはし（腹）', v.X(1), 22, { align: 'right', size: 14, color: 'sub' });
    cv.text('L ＝ 0.50 m（音の速さ 343 m/s）', v.X(0.5), 330, { align: 'center', size: 15, color: 'sub' });
  }
  // 振動数の並び
  const base = st.kind === 'gen' ? 110 : st.kind === 'kai' ? 343 : 171.5;
  const list = []; for (let j = 1; j <= 6; j++) list.push(st.kind === 'hei' ? 2 * j - 1 : j);
  cv.text('出る振動数（基本の何倍）：' + list.join('・') + (st.kind === 'hei' ? '（奇数倍だけ）' : '（整数倍が全部）'), 440, 372, { align: 'center', size: 15 });
  cv.text('いまのモード：基本の ' + m + ' 倍 ＝ ' + A.num(base * m, 0) + ' Hz', 440, 400, { align: 'center', size: 15, bold: true });
}

// はじいた弦の係数（h=5 mm）
function bn(p) { const b = [0]; for (let n = 1; n <= 12; n++) { const v = 2 * 5 * Math.sin(n * Math.PI * p) / (n * n * Math.PI * Math.PI * p * (1 - p)); b.push(Math.abs(v) < 1e-9 ? 0 : v); } return b; }
function hajiku(cv, st) {
  const b = bn(st.p), w = 1.2;   // 見せる角振動数（基本）
  const y = (x, t) => { let s = 0; for (let n = 1; n <= 12; n++) s += b[n] * Math.sin(n * Math.PI * x) * Math.cos(n * w * t); return s; };
  const v = cv.view({ x0: -0.03, x1: 1.03, y0: -6.5, y1: 6.5, box: [30, 20, 520, 250] });
  v.line([[0, 0], [1, 0]], { color: 'grid', width: 1.5 });
  // はじめの三角形（点線）
  v.line([[0, 0], [st.p, 5], [1, 0]], { color: 'sub', style: 'dot', width: 1.5 });
  v.line([[st.p, -6.4], [st.p, 6.4]], { color: 'b', style: 'dash', width: 1.5 });
  v.plot(x => y(x, st.t), { x0: 0, x1: 1, color: 'a', width: 3, n: 400 });
  v.text('はじく所 p ＝ ' + A.num(st.p, 2), st.p + 0.02, -5.6, { size: 15, color: 'b', bg: true });
  cv.text('はじめの形（点線）：高さ 5 mm の三角', 30, 290, { size: 14, color: 'sub' });
  // 棒グラフ
  const g = cv.view({ x0: 0.3, x1: 12.7, y0: 0, y1: 4.6, box: [585, 30, 270, 260] });
  g.axes({ xt: A.range(1, 12, 1), yt: [1, 2, 3, 4], xl: 'n', yl: '|bn|〔mm〕', xfmt: v => A.num(v, 0) });
  for (let n = 1; n <= 12; n++) {
    const h = Math.abs(b[n]);
    if (h < 1e-6) g.dot(n, 0.18, { color: 'b', shape: 'cross', r: 6 });
    else g.poly([[n - 0.3, 0], [n + 0.3, 0], [n + 0.3, Math.min(h, 4.6)], [n - 0.3, Math.min(h, 4.6)]], { fill: 'c', alpha: 0.8 });
  }
  // 1〜5 のモードの小さな絵（はじく所が節かどうか）
  for (let n = 1; n <= 5; n++) {
    const m = cv.view({ x0: 0, x1: 1, y0: -1.2, y1: 1.2, box: [30 + (n - 1) * 168, 320, 150, 60] });
    m.line([[0, 0], [1, 0]], { color: 'grid', width: 1 });
    const zero = Math.abs(b[n]) < 1e-6;
    m.plot(x => Math.sin(n * Math.PI * x), { color: zero ? 'b' : 'c', width: 2, style: zero ? 'dash' : 'solid' });
    m.line([[st.p, -1.2], [st.p, 1.2]], { color: 'b', style: 'dash', width: 1 });
    cv.text('n＝' + n + (zero ? '（節：出ない）' : ''), 30 + (n - 1) * 168, 404, { size: 14, color: zero ? 'b' : 'ink' });
  }
}
