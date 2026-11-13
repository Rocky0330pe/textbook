// @id p2-10
// @title 群れの速さと山の速さ
// @vol 物理3
// @from 物理 波-5 ⑦（p3-05 分散関係・群速度）・波-7 ⑥（p3-07 深い海の波）、原-3 ⑨（p5-03 電子の波束）
'use strict';
// ① 波の群れを、波長の少しずつ違う正弦波（61本）の和で作り、それぞれを分散関係どおりに進める。
//    形：はじめ exp(−((x−x0)/5)²) cos(k0(x−x0))、波長 2.5（本の深い海の図と同じ）。目もりの単位は省く。
//    群れの速さ c_g がどれも同じ 1.5 になるように、山の速さ c_p を決める（深い海 c_p=2c_g、電子 c_p=c_g/2、
//    ばねとおもりの列 λ=4a で c_p:c_g=1.80:1.41）。
// ② 本の図と同じ：ばねとおもりの列（a=0.10 m、√(k_s/m)=20 rad/s、c0=2.0 m/s）で、波長 4.4a と 3.6a の波の和。
//    0.5 s で ● は約 0.90 m（c_p≈1.8 m/s）、▼ は約 0.70 m（c_g≈1.4 m/s）進む。
// ③ 同じ列の分散関係 ω=2√(k_s/m)|sin(ka/2)| と、位相速度（原点からの線の傾き）・群速度（接線の傾き）。
const K0 = 2 * Math.PI / 2.5, WID = 5, CG = 1.5;
const MED = {
  nashi: { nm: '分散なし（弦・空気の音）', w: k => CG * k },
  retsu: { nm: 'ばねとおもりの列（λ=4a）', w: null },
  umi: { nm: '深い海の波', w: k => Math.sqrt(4 * CG * CG * K0 * k) },
  denshi: { nm: '電子の波', w: k => CG / (2 * K0) * k * k }
};
{ // 列：K0·a=π/2、c_g=a·ω0·cos(π/4)=CG となる ω0
  const a = Math.PI / (2 * K0), w0 = CG / (a * Math.cos(Math.PI / 4));
  MED.retsu.w = k => 2 * w0 * Math.abs(Math.sin(k * a / 2));
}
const KS = []; for (let j = -30; j <= 30; j++) { const k = K0 + j * 0.04; KS.push([k, Math.exp(-((k - K0) ** 2) * WID * WID / 4)]); }
A.item({
  id: 'p2-10', title: '群れの速さと山の速さ',
  from: '物理 第3巻 波-5 ⑦ の図「分散関係」「2つの波の和」、波-7 ⑥ の図「深い海の波の群れ」、第5巻 原-3 ⑨ の図「電子の波束」から',
  W: 880, H: 420,
  state: { t: 0, med: 'umi', ka: Math.PI / 2 },
  scenes: [
    {
      key: 'mure', label: '① 群れの中の山',
      lead: '波の群れ（つつみ、破線）が右へ進みます。▼は群れのまん中、●は細かい山の1つです。どちらが速いでしょう。',
      note: '深い海の波では、山は群れの2倍の速さで進み、群れの前のはしで消え、後ろでは新しい山が生まれます。電子の波では反対に、山は群れの半分の速さで、群れの中を前から後ろへずれていきます。エネルギー（や電子が見つかる場所）は、山ではなく群れといっしょに、群速度 $c_{\\mathrm g}=\\mathrm d\\omega/\\mathrm dk$ で進みます。',
      miss: '「見えている山の速さで、エネルギーが届く」のではありません。沖の波の山が 4 m/s で進んでいても、エネルギーは群速度の約 2 m/s で岸に届きます。',
      legend: [['波', { color: 'a' }], ['つつみ（群れ）', { color: 'b', style: 'dash' }], ['群れのまん中', { color: 'b', shape: 'tri', noline: true }], ['はじめまん中にあった山', { color: 'c', shape: 'circle', noline: true }]],
      controls: [{ seg: 'med', label: '波の種類', options: [['nashi', '分散なし'], ['umi', '深い海'], ['retsu', 'ばねとおもり'], ['denshi', '電子']], on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 16) st.t = 0; },
      draw(cv, st) { mure(cv, st); },
      readout: st => { const m = MED[st.med], cp = m.w(K0) / K0; return `${m.nm}：山の速さ $c_{\\mathrm p}$ ＝ ${A.num(cp, 2)}　　群れの速さ $c_{\\mathrm g}$ ＝ ${A.num(CG, 2)}　　$c_{\\mathrm p}/c_{\\mathrm g}$ ＝ <b>${A.num(cp / CG, 2)}</b>`; }
    },
    {
      key: 'futatsu', label: '② 2つの波のうなり',
      lead: 'ばねとおもりの列で、波長 $4.4a$ と $3.6a$ の波を重ねます。うなりのつつみ（▼）と、細かい山（●）の進み方を比べましょう（4分の1の速さ）。',
      note: '和は $2\\cos\\bigl(\\frac{\\Delta\\omega}{2}t-\\frac{\\Delta k}{2}x\\bigr)\\cos(\\bar\\omega t-\\bar kx)$ です。細かい山は位相速度 $\\bar\\omega/\\bar k\\approx1.8$ m/s、つつみは $\\Delta\\omega/\\Delta k\\approx1.4$ m/s で進みます。0.5 s で ● は約 0.90 m、▼ は約 0.70 m です。',
      legend: [['2つの波の和', { color: 'a' }], ['つつみ', { color: 'b', style: 'dash' }], ['つつみの山', { color: 'b', shape: 'tri', noline: true }], ['細かい波の1つの山', { color: 'c', shape: 'circle', noline: true }]],
      controls: [{ button: '0.5 秒後で止める', act: (st, api) => { api.play(false); st.t = 0.5; } }],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.25; if (st.t > 0.8) st.t = 0; },
      draw(cv, st) { futatsu(cv, st); },
      readout: st => `時刻 ${A.num(st.t, 2)} s　　● の進んだ距離 ${A.num(1.7912 * st.t, 2)} m　　▼ の進んだ距離 ${A.num(1.4015 * st.t, 2)} m`
    },
    {
      key: 'bunsan', label: '③ 分散関係のグラフ',
      lead: 'ばねとおもりの列の分散関係です。波長を変えると、原点からの線の傾き（位相速度）と、接線の傾き（群速度）が変わります。',
      note: '波長がおもりの間かくの10倍より長ければ、どちらもほぼ $c_0$=2.0 m/s です。短い波ほど遅く、$\\lambda=2a$ では群速度が0になります（となりどうしが反対に動き、その場でふるえるだけ）。',
      legend: [['$\\omega=2\\sqrt{k_{\\mathrm s}/m}\\,|\\sin(ka/2)|$', { color: 'a' }], ['$\\omega=c_0k$（分散なし）', { color: 'sub', style: 'dash' }], ['位相速度（原点からの線）', { color: 'd', style: 'dot' }], ['群速度（接線）', { color: 'b', style: 'dashdot' }]],
      controls: [{ range: 'ka', label: '$ka$（波長 $\\lambda=2\\pi a/ka$）', min: 0.06, max: Math.PI, step: 0.01, fmt: v => A.num(v, 2) + '（λ＝' + A.num(2 * Math.PI / v, 1) + 'a）' }],
      draw(cv, st) { bunsan(cv, st); },
      readout: st => { const c0 = 2, cp = c0 * Math.sin(st.ka / 2) / (st.ka / 2), cg = c0 * Math.cos(st.ka / 2); return `$\\lambda$ ＝ ${A.num(2 * Math.PI / st.ka, 1)}$a$　　位相速度 $c_{\\mathrm p}$ ＝ <b>${A.num(cp, 2)} m/s</b>　　群速度 $c_{\\mathrm g}$ ＝ <b>${A.num(cg, 2)} m/s</b>（本の表：λ=4a で 1.80・1.41、2a で 1.27・0）`; }
    }
  ]
});

function mure(cv, st) {
  const m = MED[st.med], x0 = 8, t = st.t, cp = m.w(K0) / K0;
  const v = cv.view({ x0: 0, x1: 42, y0: -1.35, y1: 1.5, box: [20, 30, 840, 300] });
  v.line([[0, 0], [42, 0]], { color: 'grid', width: 1.5 });
  const n = 700, re = [], ab = [];
  let norm = 0; for (const [, a] of KS) norm += a;
  for (let i = 0; i <= n; i++) {
    const x = 42 * i / n; let sr = 0, si = 0;
    for (const [k, a] of KS) { const ph = k * (x - x0) - m.w(k) * t + m.w(K0) * 0; sr += a * Math.cos(ph); si += a * Math.sin(ph); }
    re.push(v.P([x, sr / norm])); ab.push([x, Math.hypot(sr, si) / norm]);
  }
  v.line(ab.map(p => [p[0], p[1]]), { color: 'b', style: 'dash', width: 2 });
  v.line(ab.map(p => [p[0], -p[1]]), { color: 'b', style: 'dash', width: 2 });
  v.clip(() => cv.line(re, { color: 'a', width: 2 }));
  // はじめの群れのまん中
  v.line([[x0, -1.3], [x0, 1.3]], { color: 'sub', style: 'dot', width: 1 });
  v.text('はじめのまん中', x0, -1.25, { align: 'center', size: 14, color: 'sub', bg: true });
  const xg = x0 + CG * t, xc = x0 + cp * t;
  if (xg < 42) v.dot(xg, 1.22, { color: 'b', shape: 'tri', r: 9 });
  if (xc < 42) v.dot(xc, Math.cos(0) * envAt(ab, xc) + 0.0, { color: 'c', r: 7 });
  cv.text(m.nm, 440, 360, { align: 'center', size: 16, bold: true });
  cv.text(st.med === 'umi' ? '山は群れの2倍の速さ：前のはしで消え、後ろで生まれる' : st.med === 'denshi' ? '山は群れの半分の速さ：群れの中を後ろへずれる' : st.med === 'retsu' ? '山は群れより少し速い' : '山も群れも同じ速さ：形を保って進む', 440, 390, { align: 'center', size: 15 });
}
function envAt(ab, x) { const i = Math.round(x / 42 * (ab.length - 1)); return ab[A.clamp(i, 0, ab.length - 1)][1]; }

function futatsu(cv, st) {
  const k1 = 2 * Math.PI / 0.44, k2 = 2 * Math.PI / 0.36, w = k => 40 * Math.sin(k * 0.05), w1 = w(k1), w2 = w(k2), t = st.t;
  const cp = (w1 + w2) / (k1 + k2), cg = (w2 - w1) / (k2 - k1);
  const v = cv.view({ x0: -1, x1: 2.2, y0: -2.5, y1: 2.9, box: [40, 30, 800, 300] });
  v.axes({ xt: [-0.5, 0, 0.5, 1, 1.5, 2], yt: [], xl: 'x〔m〕', ay: -1, zero: true });
  v.line([[0, -2.5], [0, 2.9]], { color: 'sub', style: 'dot', width: 1 });
  for (const s of [1, -1]) v.plot(x => s * 2 * Math.abs(Math.cos((w1 - w2) / 2 * t - (k1 - k2) / 2 * x)), { color: 'b', style: 'dash', width: 1.8 });
  v.plot(x => Math.cos(w1 * t - k1 * x) + Math.cos(w2 * t - k2 * x), { color: 'a', width: 2, n: 900 });
  v.dot(cg * t, 2.55, { color: 'b', shape: 'tri', r: 9 });
  v.dot(cp * t, 2 * Math.abs(Math.cos((w1 - w2) / 2 * t - (k1 - k2) / 2 * cp * t)), { color: 'c', r: 7 });
  if (t > 0.05) { v.arrow(0, -2.2, cg * t, -2.2, { color: 'b', width: 2 }); v.arrow(0, -1.75, cp * t, -1.75, { color: 'c', width: 2, style: 'dash' }); }
  cv.text('c0 ＝ 2.0 m/s、a ＝ 0.10 m、波長 4.4a と 3.6a', 440, 380, { align: 'center', size: 15, color: 'sub' });
}

function bunsan(cv, st) {
  const c0 = 2, a = 0.1, w0 = 20, ka = st.ka;
  const g = cv.view({ x0: 0, x1: 3.6, y0: 0, y1: 2.5, box: [70, 20, 520, 360] });
  g.axes({ xt: [Math.PI / 4, Math.PI / 2, Math.PI], yt: [1, Math.SQRT2, 2], xl: 'ka', yl: 'ω ÷ √(ks/m)', xfmt: v => A.pi(v, 4), yfmt: v => v === Math.SQRT2 ? '√2' : A.num(v, 0) });
  g.plot(x => x, { x0: 0, x1: 2.45, color: 'sub', style: 'dash', width: 1.5 });
  g.plot(x => 2 * Math.sin(x / 2), { x0: 0, x1: Math.PI, color: 'a', width: 3 });
  const y = 2 * Math.sin(ka / 2), sl = Math.cos(ka / 2);
  g.plot(x => y / ka * x, { x0: 0, x1: Math.min(3.6, ka * 1.25), color: 'd', style: 'dot', width: 2.5 });
  g.plot(x => y + sl * (x - ka), { x0: Math.max(0, ka - 1.1), x1: Math.min(3.6, ka + 1.1), color: 'b', style: 'dashdot', width: 2 });
  g.dot(ka, y, { color: 'b', r: 7 });
  // 表
  const rows = [['λ', '100a', '10a', '6a', '4a', '2a'], ['cp', '2.00', '1.97', '1.91', '1.80', '1.27'], ['cg', '2.00', '1.90', '1.73', '1.41', '0']];
  cv.text('本の表（c0 ＝ 2.0 m/s、単位 m/s）', 615, 60, { size: 14, bold: true });
  rows.forEach((r, i) => r.forEach((s, j) => cv.text(s, 625 + j * 44, 92 + i * 28, { size: 14, align: j ? 'center' : 'left', color: i ? 'ink' : 'sub' })));
  const cp = c0 * Math.sin(ka / 2) / (ka / 2), cg = c0 * Math.cos(ka / 2);
  cv.text('いま：λ ＝ ' + A.num(2 * Math.PI / ka, 1) + 'a', 615, 200, { size: 15 });
  cv.text('位相速度 ' + A.num(cp, 2) + ' m/s', 615, 228, { size: 15, color: 'd' });
  cv.text('群速度 ' + A.num(cg, 2) + ' m/s', 615, 256, { size: 15, color: 'b' });
  cv.text('（a ＝ 0.10 m、√(ks/m) ＝ 20 rad/s）', 615, 290, { size: 14, color: 'sub' });
  void a; void w0;
}
