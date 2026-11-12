// @id p2-25
// @title 光電効果：光子1個が電子1個に
// @vol 物理5
// @from 物理 原-2 ④⑤（p5-02 の光電効果のエネルギーの図・電流と電圧・阻止電圧と振動数）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 数は本と同じ：hc＝1240 eV·nm、h/e＝4.136×10⁻¹⁵ V/Hz、仕事関数（目安）Cs 2.1・K 2.3・W 4.5・Cu 4.7 eV、
// 例題4（カリウム 400 nm → K₀＝0.80 eV）、例題5 の金属（W＝2.0 eV、点 5.5・6.5・7.5・8.5×10¹⁴ Hz）。
const HC = 1240, HE = 0.41357;           // eV·nm、V／(10¹⁴ Hz)
const METALS = { Cs: ['セシウム', 2.1], K: ['カリウム', 2.3], W: ['タングステン', 4.5], Cu: ['銅', 4.7], X: ['例題5の金属', 2.0] };
const hf = st => HC / st.lam;
const Wf = st => METALS[st.metal][1];
const K0 = st => Math.max(0, hf(st) - Wf(st));
// 波長の色（目安）。紫外線・赤外線は灰色にして、文字の札をつける
function lamColor(l) {
  if (l < 380 || l > 780) return 'sub';
  let r = 0, g = 0, b = 0;
  if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
  else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
  const f = v => Math.round(40 + 190 * v);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const lamName = l => l < 380 ? '紫外線' : l > 780 ? '赤外線' : l < 450 ? '紫' : l < 495 ? '青' : l < 570 ? '緑' : l < 590 ? '黄' : l < 620 ? 'だいだい' : '赤';
const fmtLam = v => Math.round(v) + ' nm';
const P1 = { px: 410, top: 60, bot: 380 };   // 金属の板（右の絵）
const cur = (st, V) => { const V0 = K0(st); if (V0 <= 0 || V < -V0) return 0; return st.inten / 10 * (1 - Math.exp(-(V + V0) / 0.45)); };
const metalSeg = keys => ({ seg: 'metal', label: '金属', options: keys.map(k => [k, METALS[k][0] + ' ' + A.num(METALS[k][1], 1)]), on: st => { st.ev = []; st.out = 0; st.inn = 0; } });

A.item({
  id: 'p2-25', title: '光電効果：光子1個が電子1個に',
  from: '物理 第5巻 原-2 ④⑤ の図から（光電効果のエネルギーの図・光電管の電流と電圧・阻止電圧と振動数）',
  W: 880, H: 420,
  state: { lam: 600, inten: 5, metal: 'K', V: 0, f: 7.5, f0: 0 },
  scenes: [
    {
      key: 'koshi', label: '① 光子1個で電子1個',
      lead: '光の色（波長）と強さを変えて、金属から電子が飛び出すかを見ましょう。▶ で光子が1個ずつ届きます。',
      note: '光子1個のエネルギー $hf$ は、電子1個にまとめて渡されます。$hf$ が仕事関数 $W$ より大きいと、電子は外へ出て、残り $K_0=hf-W$ を運動エネルギーとしてもちます。光を強くすると、光子の**数**が増え、飛び出す電子の数が増えますが、1個の電子の勢いは変わりません。',
      miss: '「赤い光でも、うんと強くすれば電子が飛び出す」はまちがいです。$hf$ が $W$ より小さいと、強さ（光子の数）を増やしても飛び出しません。カリウムに 600 nm の光で、強さを最大にしてたしかめましょう。',
      legend: [['光子（波の線。色は光の色、灰色は紫外線）', { color: 'e' }], ['飛び出した電子', { color: 'a', shape: 'circle', noline: true }], ['外へ出られなかった電子', { color: 'sub', shape: 'cross', noline: true }]],
      controls: [{ range: 'lam', label: '波長 $\\lambda$', min: 200, max: 800, step: 5, fmt: fmtLam, on: reset }, { range: 'inten', label: '光の強さ', min: 1, max: 10, step: 1, d: 0 }, metalSeg(['Cs', 'K', 'W', 'Cu'])],
      init: reset,
      step: step1,
      draw: draw1,
      readout: st => `光子1個 $hf$ ＝ 1240 ÷ ${Math.round(st.lam)} ＝ ${A.num(hf(st), 2)} eV${GAP}仕事関数 $W$ ＝ ${A.num(Wf(st), 1)} eV → ` + (hf(st) > Wf(st) ? `<b>飛び出す</b>：$K_0$ ＝ ${A.num(K0(st), 2)} eV（速さ 約 ${A.num(5.93 * Math.sqrt(K0(st)), 1)}×10⁵ m/s）` : `<b>飛び出さない</b>（限界の波長 $hc/W$ ＝ 約 ${Math.round(HC / Wf(st) / 10) * 10} nm）`)
    },
    {
      key: 'iv', label: '② 電流と阻止電圧',
      lead: '光電管の電極の電圧 $V$ を下げていくと、ある電圧で電流が0になります。強さを変えても、その電圧は変わるでしょうか。',
      note: '電極の電位を光電面より低くすると、電子は押しもどされ、運動エネルギーを $eV$ 失います。いちばん速い電子も届かなくなる電圧が**阻止電圧** $V_0$ で、$eV_0=K_0$ です。強さを2倍にすると電流は2倍になりますが、$V_0$ は変わりません。$V_0$ を変えるのは振動数（色）です。',
      legend: [['電流と電圧（形の模式図）', { color: 'a' }], ['いまの電圧', { color: 'b', shape: 'diamond', noline: true }], ['電極へ届く電子', { color: 'a', shape: 'circle', noline: true }], ['押しもどされる電子', { color: 'b', shape: 'square', noline: true }]],
      state: { lam: 400, metal: 'K', V: 0 },
      controls: [{ range: 'V', label: '電圧 $V$〔V〕（電極－光電面）', min: -2.4, max: 3, step: 0.02 }, { range: 'lam', label: '波長 $\\lambda$', min: 250, max: 520, step: 5, fmt: fmtLam, on: reset }, { range: 'inten', label: '光の強さ', min: 1, max: 10, step: 1, d: 0 }],
      init: reset,
      step: step2,
      draw: draw2,
      readout: st => `カリウム（$W$＝2.3 eV）：$K_0$ ＝ ${A.num(hf(st), 2)} － 2.3 ＝ ${A.num(K0(st), 2)} eV → 阻止電圧 $V_0$ ＝ <b>${A.num(K0(st), 2)} V</b>${GAP}いまの電流（目安）：${A.num(cur(st, st.V), 2)}`
    },
    {
      key: 'millikan', label: '③ 阻止電圧と振動数',
      lead: '光の振動数 $f$ を変えて、阻止電圧 $V_0$ がどう変わるかを見ましょう。「$f$ を2倍」のボタンも押してみましょう。',
      note: '$V_0=\\dfrac{h}{e}f-\\dfrac{W}{e}$ は、傾きが $h/e$ の直線です。傾きは金属の種類によらず同じで、ずれは仕事関数の違いです。直線を横の軸まで延ばした所が限界振動数 $f_0$、たての軸と交わる所が $-W/e$ です。',
      miss: '振動数を2倍にしても、$K_0$ は2倍ではなく、2倍より**大きく**増えます（$K_0=hf-W$）。比例するのは $K_0+W$ です。例題4 の 400 nm（$K_0$＝0.80 eV）を 200 nm にすると、$K_0$＝3.9 eV で約5倍です。',
      legend: [['例題5の金属（$W$＝2.0 eV）と、はかった値', { color: 'a' }], ['カリウム（$W$＝2.3 eV）', { color: 'b', style: 'dash' }], ['横の軸まで延ばした所', { color: 'a', style: 'dot' }], ['いまの振動数', { color: 'c', shape: 'diamond', noline: true }]],
      state: { f: 7.5, metal: 'K' },
      controls: [{ range: 'f', label: '振動数 $f$（$10^{14}$ Hz）', min: 4, max: 16, step: 0.05, d: 2 }, { seg: 'metal', label: '金属', options: [['X', '例題5の金属'], ['K', 'カリウム']] }, { button: '$f$ を2倍', act(st) { st.f0 = st.f; st.f = Math.min(16, st.f * 2); } }],
      draw: draw3,
      readout: st => { const W = Wf(st), K = HE * st.f - W; return `$hf$ ＝ ${A.num(HE * st.f, 2)} eV（波長 ${Math.round(3000 / st.f)} nm）${GAP}$K_0$ ＝ ${K > 0 ? A.num(K, 2) + ' eV' + GAP + '$V_0$ ＝ ' + A.num(K, 2) + ' V' : '0（飛び出さない）'}` + (st.f0 && Math.abs(st.f - 2 * st.f0) < 1e-6 ? `${GAP}（2倍の前は $K_0$ ＝ ${A.num(Math.max(0, HE * st.f0 - W), 2)} eV）` : ''); }
    }
  ]
});

function reset(st) { st.ev = []; st.t = 0; st.acc = 0; st.rng = A.rng(25); st.out = 0; st.inn = 0; st.last = null; }

// ---------- ① ----------
function step1(st, dt) {
  st.t += dt; st.acc += dt * st.inten * 0.9;
  while (st.acc >= 1) { st.acc -= 1; st.ev.push({ t0: st.t, y: P1.top + 20 + st.rng() * (P1.bot - P1.top - 40), d: st.rng() * 0.25 }); }
  for (const e of st.ev) {
    const age = st.t - e.t0;
    if (age >= 0.9 && !e.hit) { e.hit = true; st.inn++; e.ok = hf(st) > Wf(st); if (e.ok) st.out++; st.last = { t: st.t, ok: e.ok, d: e.d }; }
  }
  st.ev = st.ev.filter(e => st.t - e.t0 < 4.5);
}
function wave(cv, x, y, ang, col, L = 46) {
  const pts = []; for (let k = 0; k <= 24; k++) { const s = k / 24 * L, w = 5 * Math.sin(k / 24 * 6 * Math.PI); pts.push([x - s * Math.cos(ang) - w * Math.sin(ang), y - s * Math.sin(ang) + w * Math.cos(ang)]); }
  cv.line(pts, { color: col, width: 2.5 });
  cv.arrow(pts[3][0], pts[3][1], x, y, { color: col, width: 2.5, head: 9 });
}
function draw1(cv, st) {
  const W = Wf(st), H = hf(st), col = lamColor(st.lam);
  // 左：エネルギーの図（本の図と同じ形：金属の上の面が0、外は W だけ高い）
  const v = cv.view({ x0: 0, x1: 1, y0: -0.9, y1: 6.7, box: [40, 22, 320, 380] });
  v.poly([[0, -0.9], [0.4, -0.9], [0.4, 0], [0, 0]], { fill: 'sub', alpha: 0.18 });
  v.line([[0, 0], [0.4, 0], [0.4, W], [1, W]], { color: 'ink', width: 2.5 });
  v.text('金属', 0.2, -0.5, { align: 'center', color: 'sub' });
  v.text('金属の外（止まった電子）', 1, W - 0.32, { align: 'right', size: 14, color: 'sub' });
  v.arrow(0.45, 0.03, 0.45, W - 0.03, { color: 'sub', width: 1.5, head: 8 }); v.arrow(0.45, W - 0.03, 0.45, 0.03, { color: 'sub', width: 1.5, head: 8 });
  v.text('W ＝ ' + A.num(W, 1) + ' eV', 0.48, W / 2, { size: 15 });
  for (const x of [0.05, 0.12, 0.3, 0.36]) v.dot(x, 0, { color: 'a', r: 5 });
  // 光子1個の矢印（いつも全部の長さ）と、それを受けとった電子
  const la = st.last, age = la ? st.t - la.t : 99, ex = 0.21, Ht = Math.min(H, 6.6);
  v.arrow(ex, 0.08, ex, Ht, { color: 'd', width: 3, head: 11 });
  v.text('hf ＝ ' + A.num(H, 2) + ' eV', ex - 0.03, Ht / 2, { align: 'right', size: 15, color: 'd', bg: true });
  const up = Math.min(1, age / 0.4);
  if (H > W) {
    v.line([[ex + 0.02, H], [0.97, H]], { color: 'sub', width: 1, style: 'dot' });
    v.arrow(0.62, W + 0.03, 0.62, H - 0.03, { color: 'a', width: 2, head: 8 }); v.arrow(0.62, H - 0.03, 0.62, W + 0.03, { color: 'a', width: 2, head: 8 });
    v.text('K₀ ＝ hf − W ＝ ' + A.num(K0(st), 2) + ' eV', 0.5, Math.min(6.2, H + 0.35), { size: 15, color: 'a', bg: true });
    const s = Math.min(1, Math.max(0, (age - 0.4) / 0.9));
    if (age < 1.3) v.dot(ex + (0.95 - ex) * s, H * up, { color: 'a', r: 6 });
  } else {
    const s = Math.min(1, Math.max(0, (age - 0.4) / 0.5));
    if (age < 1.2) v.dot(ex + 0.04, H * up * (1 - s), { color: 'sub', shape: 'cross', r: 6 });
    v.text('hf < W：外へ出られない', 0.03, W + 0.75, { size: 15, color: 'b' });
  }
  v.text('エネルギー（eV）', 0.0, 6.45, { size: 14, color: 'sub' });
  // 右：金属の板と光子
  const p = P1;
  cv.rect(p.px - 34, p.top, 34, p.bot - p.top, { fill: 'sub', alpha: 0.25, color: 'sub', width: 1 });
  cv.text(METALS[st.metal][0], p.px - 17, p.bot + 18, { align: 'center', size: 15 });
  const ang = Math.atan2(150, -330);   // 右上から来る
  for (const e of st.ev) {
    const age = st.t - e.t0;
    if (age < 0.9) { const s = age / 0.9, x = p.px + 330 * (1 - s), y = e.y - 150 * (1 - s); wave(cv, x, y, Math.PI + ang, col); }
    else if (e.ok) { const s = age - 0.9, sp = 60 + 110 * Math.sqrt(K0(st)) * (1 - e.d); const x = p.px + 6 + sp * s; if (x < 870) cv.dot(x, e.y, { color: 'a', r: 6 }); }
    else if (age < 1.6) { cv.dot(p.px - 6, e.y, { color: 'sub', shape: 'cross', r: 6 }); }
  }
  if (!st.ev.length) { for (let k = 0; k < 3; k++) wave(cv, p.px + 160 - 60 * k, 130 + 90 * k - 75 + 30, Math.PI + ang, col); }
  cv.text(`来た光子 ${st.inn} 個　飛び出した電子 ${st.out} 個`, 860, 30, { align: 'right', size: 15 });
  cv.text(lamName(st.lam) + '（' + Math.round(st.lam) + ' nm）の光', 860, 54, { align: 'right', size: 15, color: col === 'sub' ? 'sub' : 'ink' });
}

// ---------- ② ----------
function step2(st, dt) {
  st.t += dt; st.acc += dt * st.inten * 1.2;
  const K = K0(st);
  while (st.acc >= 1) { st.acc -= 1; if (K > 0) st.ev.push({ s: 0, dir: 1, K: K * (0.15 + 0.85 * st.rng()), y: 120 + st.rng() * 160, back: false }); }
  for (const e of st.ev) {
    const E = e.K + st.V * e.s, sp = 0.18 + 0.45 * Math.sqrt(Math.max(0, E));
    if (e.dir > 0 && E <= 0.01) { e.dir = -1; e.back = true; }
    e.s += e.dir * sp * dt;
  }
  st.ev = st.ev.filter(e => e.s > -0.02 && e.s < 1.0);
}
function draw2(cv, st) {
  // 左：光電管
  const x0 = 80, x1 = 330, yT = 90, yB = 310;
  cv.line([[x0 - 14, yT + 10], [x0 + 6, (yT + yB) / 2], [x0 - 14, yB - 10]], { color: 'ink', width: 5 });
  cv.line([[x1, yT + 20], [x1, yB - 20]], { color: 'ink', width: 5 });
  cv.text('光電面', x0 - 10, yB + 22, { align: 'center', size: 15 }); cv.text('電極', x1, yB + 22, { align: 'center', size: 15 });
  cv.text('カリウム', x0 - 10, yB + 44, { align: 'center', size: 14, color: 'sub' });
  const col = lamColor(st.lam);
  for (let k = 0; k < 3; k++) wave(cv, x0 + 8, 150 + 50 * k, Math.atan2(40, 70), col, 54);
  cv.text(`電圧 V ＝ ${A.num(st.V, 2)} V`, (x0 + x1) / 2 + 20, yT - 30, { align: 'center', size: 16, bold: true });
  cv.text(st.V < 0 ? '電極が低い：電子は押しもどされる' : '電極が高い：電子は引かれる', (x0 + x1) / 2 + 20, yT - 8, { align: 'center', size: 14, color: 'sub' });
  for (const e of st.ev) { const x = x0 + 12 + (x1 - x0 - 16) * e.s; cv.dot(x, e.y, e.back ? { color: 'b', shape: 'square', r: 5 } : { color: 'a', r: 5 }); }
  if (K0(st) <= 0) cv.text('この光では、電子が飛び出さない', (x0 + x1) / 2, (yT + yB) / 2, { align: 'center', size: 15, color: 'b', bg: true });
  // 右：電流と電圧のグラフ
  const g = cv.view({ x0: -2.4, x1: 3.2, y0: 0, y1: 1.15, box: [440, 40, 410, 330] });
  g.axes({ xt: [-2, -1, 0, 1, 2, 3], yt: [], xl: 'V（V）', yl: '電流（目安）' });
  g.plot(V => cur(st, V) || (V < -K0(st) ? 0 : 0), { color: 'a', width: 3 });
  const V0 = K0(st);
  if (V0 > 0) { g.line([[-V0, 0], [-V0, 0.25]], { color: 'b', style: 'dot', width: 1.5 }); g.text('−V₀＝−' + A.num(V0, 2), -V0 - 0.08, 0.3, { align: 'right', size: 15, color: 'b', bg: true }); }
  g.dot(st.V, cur(st, st.V), { color: 'b', shape: 'diamond', r: 7 });
}

// ---------- ③ ----------
function draw3(cv, st) {
  const g = cv.view({ x0: 0, x1: 16.5, y0: -2.6, y1: 4.6, box: [60, 24, 650, 360] });
  g.axes({ xt: [2, 4, 6, 8, 10, 12, 14, 16], yt: [-2, -1, 1, 2, 3, 4], xl: '振動数 f（10¹⁴ Hz）', yl: '阻止電圧 V₀（V）' });
  const line = (W, o, dot) => { const f0 = W / HE; g.plot(f => HE * f - W, Object.assign({ x0: f0, x1: 16.5 }, o)); if (dot) g.plot(f => HE * f - W, { x0: 0, x1: f0, color: o.color, style: 'dot', width: 1.6 }); return f0; };
  const f0X = line(2.0, { color: 'a', width: 3 }, true);
  line(2.3, { color: 'b', width: 2.5, style: 'dash' }, false);
  for (const [f, v] of [[5.5, 0.27], [6.5, 0.69], [7.5, 1.10], [8.5, 1.51]]) g.dot(f, v, { color: 'a', r: 5 });
  g.text('f₀', f0X, -0.32, { align: 'center', size: 15 });
  g.text('−W/e', 0.25, -2.25, { size: 15, color: 'a' });
  // 傾きの三角
  g.line([[10, HE * 10 - 2.0], [12, HE * 10 - 2.0], [12, HE * 12 - 2.0]], { color: 'sub', width: 1.5 });
  g.text('傾き h/e ＝ 4.14×10⁻¹⁵ V/Hz', 12.2, HE * 11 - 2.0, { size: 14, color: 'sub' });
  // いまの振動数
  const W = Wf(st), V0 = HE * st.f - W;
  g.line([[st.f, -2.6], [st.f, 4.6]], { color: 'c', width: 1.2, style: 'dot' });
  if (V0 > 0) g.dot(st.f, V0, { color: 'c', shape: 'diamond', r: 8 });
  else g.text('ここでは飛び出さない', st.f + 0.2, 0.35, { size: 14, color: 'c' });
  // K₀ と W を積んだ棒（比例するのは K₀＋W）
  const bx = 818, by = 372, sc = 46;
  const bar = (f, x, lab) => { const E = HE * f, K = Math.max(0, E - W); cv.rect(x, by - Math.min(E, W) * sc, 26, Math.min(E, W) * sc, { fill: 'sub', alpha: 0.3, color: 'sub', width: 1 }); if (K > 0) cv.rect(x, by - E * sc, 26, K * sc, { fill: 'c', alpha: 0.35, color: 'c', width: 1.5 }); cv.text(lab, x + 13, by + 14, { align: 'center', size: 14 }); };
  if (st.f0 && Math.abs(st.f - 2 * st.f0) < 1e-6) { bar(st.f0, bx - 40, 'f'); bar(st.f, bx, '2f'); cv.text('灰：W　緑：K₀', bx - 5, by - HE * st.f * sc - 16, { align: 'center', size: 14, color: 'sub' }); }
}
