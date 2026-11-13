// @id p2-28
// @title 箱の中の電子：定在波と確率
// @vol 物理5
// @from 物理 原-5 ①〜④⑩（p5-05 弦と箱の定在波・エネルギー準位・波動関数と確率・重ね合わせ）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：E_n＝n²h²/(8mL²)、幅 1 nm で E₁＝0.376 eV（E₁＝0.376/L² eV、L は nm）、ψ_n＝√(2/L) sin(nπx/L)、
// まん中の 1/3 に見つかる確率 n＝1 で約0.61（例題3）、はてな？は 70 回さがす、
// 重ね合わせ (ψ₁＋ψ₂)/√2 のゆれの周期 T＝h/(E₂−E₁)＝4.14×10⁻¹⁵÷1.128≈3.7 fs（例題8）。
const E1 = L => 0.376 / (L * L);          // eV（L は nm）
const HEV = 4.136e-15, HBAR = 0.6582;      // eV·s、eV·fs
const pMid = n => 1 / 3 - (Math.sin(4 * n * Math.PI / 3) - Math.sin(2 * n * Math.PI / 3)) / (2 * n * Math.PI);
function hatch(cv, x, y0, y1, side) {   // 壁（斜線）
  const w = 14, x0 = side < 0 ? x - w : x;
  cv.rect(x0, y0, w, y1 - y0, { fill: 'sub', alpha: 0.15 });
  for (let y = y0; y < y1; y += 9) cv.line([[x0, Math.min(y1, y + 9)], [x0 + w, y]], { color: 'sub', width: 1 });
  cv.line([[x, y0], [x, y1]], { color: 'ink', width: 2.5 });
}
function sample(st) {   // |ψ|² にしたがって位置を1つ（はねのけ法）
  const n = st.n;
  for (;;) { const x = st.rng(), y = st.rng() * 2; if (y < 2 * Math.sin(n * Math.PI * x) ** 2) return x; }
}

A.item({
  id: 'p2-28', title: '箱の中の電子：定在波と確率',
  from: '物理 第5巻 原-5 ①〜④⑩ の図から（弦と箱の定在波・エネルギーの段・波動関数と確率・重ね合わせのゆれ）',
  W: 880, H: 430,
  state: { n: 1, t: 0, L: 1, found: 0, mid: 0 },
  scenes: [
    {
      key: 'gen', label: '① 弦と同じ定在波',
      lead: '両はしを止めた弦と、壁の間に閉じこめた電子の波をくらべます。$n$ を変えてみましょう。',
      note: '壁の外に出られない電子の波は、壁の所で0になるしかありません。両はしを止めた弦と同じ条件なので、波長は $\\lambda_n=2L/n$ にかぎられます。弦では振動数が $n$ に比例し、電子ではエネルギーが $n^2$ に比例します（②）。',
      legend: [['弦のゆれ', { color: 'b' }], ['電子の波 $\\psi$', { color: 'a' }], ['壁（電子はこえられない）', { color: 'sub', style: 'solid' }]],
      controls: [{ range: 'n', label: '量子数 $n$', min: 1, max: 6, step: 1, d: 0 }],
      step(st, dt) { st.t += dt; },
      draw: drawGen,
      readout: st => `$n$ ＝ ${st.n}：半波長が ${st.n} 個入る${GAP}$\\lambda_n=\\dfrac{2L}{n}$ ＝ ${st.n === 1 ? '2L' : st.n === 2 ? 'L' : '2L/' + st.n}`
    },
    {
      key: 'dan', label: '② エネルギーの段',
      lead: '箱の幅 $L$ を変えて、とびとびのエネルギー $E_n=\\dfrac{n^2h^2}{8mL^2}$ を見ましょう。',
      note: '弦の振動数は等しい間かくですが、箱の電子のエネルギーは $1:4:9:16$ と、上ほど間かくが広がります。幅 1 nm で $E_1$＝0.376 eV、幅を半分にすると4倍です。いちばん低い $E_1$ も0ではありません。',
      miss: '「箱を2倍にすると、エネルギーは半分」はまちがいです。$E\\propto1/L^2$ なので $\\frac{1}{4}$ です（1 nm で 0.376 eV、2 nm で 0.094 eV）。',
      legend: [['弦の振動数（等しい間かく）', { color: 'b' }], ['電子のエネルギー $E_n$', { color: 'a', style: 'dash' }], ['$E_1=0.376/L^2$', { color: 'c' }]],
      controls: [{ range: 'L', label: '箱の幅 $L$〔nm〕', min: 0.5, max: 3, step: 0.01, d: 2 }],
      draw: drawLadder,
      readout: st => `$L$ ＝ ${A.num(st.L, 2)} nm：$E_1$ ＝ 0.376 ÷ ${A.num(st.L, 2)}² ＝ <b>${A.num(E1(st.L), 3)} eV</b>${GAP}$E_2$ ＝ ${A.num(4 * E1(st.L), 3)}${GAP}$E_3$ ＝ ${A.num(9 * E1(st.L), 3)}${GAP}$E_4$ ＝ ${A.num(16 * E1(st.L), 3)} eV`
    },
    {
      key: 'mitsukaru', label: '③ どこで見つかる？',
      lead: '電子をさがすと、どこで見つかるでしょう。▶ で1回ずつさがします（見つかった所に点を打つ）。',
      note: '電子はいつも1か所で、つぶとして見つかります。どこで見つかるかは毎回ちがい、そのばらつきが**確率の密度** $|\\psi|^2$ で決まります。$n=1$ では、まん中の $\\frac{1}{3}$ に約61 % が見つかります（例題3）。',
      miss: '「電子は、$\\sin$ のグラフの形をなぞって、上下にゆれながら進む」はまちがいです。グラフのたての向きは空間の向きではなく、「見つかりやすさ」を決める量です。また、$n=2$ のまん中（節）は確率0ですが、電子は左でも右でも見つかります。1つの波が箱全体に広がっていて、粒が道を通るのではありません。',
      legend: [['$\\psi$', { color: 'a' }], ['$|\\psi|^2$（確率の密度）', { color: 'b', style: 'dash' }], ['見つかった所', { color: 'd', shape: 'circle', noline: true }], ['まん中の $\\frac{1}{3}$', { color: 'e', style: 'dot' }]],
      controls: [{ seg: 'n', label: '量子数 $n$', options: [[1, '$n$＝1'], [2, '$n$＝2'], [3, '$n$＝3']], on: resetFind }, { button: '70回さがす', act(st) { for (let k = 0; k < 70; k++) find(st); } }],
      init: resetFind,
      step(st, dt) { st.acc += dt * (st.found < 70 ? 6 : 40); while (st.acc >= 1) { st.acc -= 1; find(st); } if (st.found >= 2000) return false; },
      draw: drawFind,
      readout: st => `さがした回数 ${st.found}${GAP}まん中の $\\frac{1}{3}$ で見つかった割合：<b>${st.found ? A.num(100 * st.mid / st.found, 0) : '－'} %</b>${GAP}（確率 $\\int|\\psi|^2dx$ ＝ ${A.num(pMid(st.n), 2)}）`
    },
    {
      key: 'yure', label: '④ 重ね合わせでゆれる',
      lead: '$\\psi_1$ と $\\psi_2$ を同じ割合で重ね合わせます。2本の回る矢印と、電子の雲を見ましょう（幅 1 nm の箱）。',
      note: '決まったエネルギーの状態は、矢印 $e^{-iEt/\\hbar}$ が回るだけで、雲（$|\\psi|^2$）は変わりません。2つを重ねると、2本の矢印が違う速さで回り、重なりの項が周期 $T=h/(E_2-E_1)$ でゆれて、雲が左右に行ったり来たりします。幅 1 nm では $T$ ≒ 3.7 fs です（例題8）。',
      legend: [['$|\\Psi|^2$（重ね合わせ）', { color: 'b', style: 'dash' }], ['$\\psi_1$ だけのとき（ゆれない）', { color: 'sub' }], ['矢印 $\\psi_1$・$\\psi_2$', { color: 'a' }]],
      state: { t: 0 },
      step(st, dt) { st.t += dt * 0.7; },
      draw: drawMix,
      readout: st => { const T = HEV / (3 * E1(1)) * 1e15; return `$t$ ＝ ${A.num(st.t, 2)} fs${GAP}周期 $T=\\dfrac{h}{E_2-E_1}$ ＝ 4.14×10⁻¹⁵ ÷ 1.128 ≒ <b>${A.num(T, 1)} fs</b>${GAP}（いま ${A.num((st.t / T) % 1, 2)} 周期め）`; }
    }
  ]
});

function resetFind(st) { st.rng = A.rng(70); st.xs = []; st.found = 0; st.mid = 0; st.acc = 0; }
function find(st) { const x = sample(st); st.xs.push([x, st.rng()]); st.found++; if (x > 1 / 3 && x < 2 / 3) st.mid++; }

function drawGen(cv, st) {
  const n = st.n;
  // 左：弦
  const g = cv.view({ x0: -0.05, x1: 1.05, y0: -1.4, y1: 1.4, box: [30, 70, 390, 280] });
  const c = Math.cos(n * 2.4 * st.t);
  g.line([[0, 0], [1, 0]], { color: 'grid', width: 1 });
  g.plot(x => Math.sin(n * Math.PI * x) * c, { x0: 0, x1: 1, color: 'b', width: 3 });
  g.plot(x => Math.sin(n * Math.PI * x), { x0: 0, x1: 1, color: 'b', width: 1, style: 'dash' });
  g.plot(x => -Math.sin(n * Math.PI * x), { x0: 0, x1: 1, color: 'b', width: 1, style: 'dash' });
  for (const x of [0, 1]) g.dot(x, 0, { color: 'ink', shape: 'square', r: 6 });
  cv.text('(ア) 両はしを止めた弦', 225, 40, { align: 'center', size: 16, bold: true });
  cv.text('振動数 f ∝ n', 225, 370, { align: 'center', size: 15 });
  // 右：箱の電子
  const e = cv.view({ x0: -0.05, x1: 1.05, y0: -1.4, y1: 1.4, box: [470, 70, 390, 280] });
  hatch(cv, e.X(0), e.Y(1.35), e.Y(-1.35), -1); hatch(cv, e.X(1), e.Y(1.35), e.Y(-1.35), 1);
  e.line([[0, 0], [1, 0]], { color: 'grid', width: 1 });
  e.plot(x => Math.sin(n * Math.PI * x), { x0: 0, x1: 1, color: 'a', width: 3 });
  cv.text('(イ) 壁の間の電子の波 ψ', 665, 40, { align: 'center', size: 16, bold: true });
  cv.text('エネルギー E ∝ n²', 665, 370, { align: 'center', size: 15 });
  // 半波長の目印
  for (let k = 0; k < n; k++) { const xm = (k + 0.5) / n; e.text(String(k + 1), xm, (k % 2 ? -1 : 1) * 1.18, { align: 'center', size: 14, color: 'sub' }); }
  cv.text('L', 665, 392, { align: 'center', size: 15, italic: true, math: true });
  cv.line([[e.X(0), 380], [e.X(1), 380]], { color: 'sub', width: 1 });
}

function drawLadder(cv, st) {
  const L = st.L, e1 = E1(L);
  const v = cv.view({ x0: 0, x1: 1, y0: 0, y1: 17.5, box: [60, 30, 300, 350] });
  cv.arrow(60, 380, 60, 24, { color: 'sub', width: 1.5 });
  cv.text('弦の振動数', 70, 20, { size: 15 });
  for (let k = 1; k <= 4; k++) { v.line([[0.1, k * 3.4], [0.55, k * 3.4]], { color: 'b', width: 3 }); v.text(k + 'f₁', 0.6, k * 3.4, { size: 15 }); }
  const w = cv.view({ x0: 0, x1: 1, y0: 0, y1: 17.5, box: [250, 30, 220, 350] });
  cv.arrow(250, 380, 250, 24, { color: 'sub', width: 1.5 });
  cv.text('電子のエネルギー（E₁ を単位に）', 260, 20, { size: 15 });
  for (let k = 1; k <= 4; k++) { w.line([[0.1, k * k], [0.55, k * k]], { color: 'a', width: 3, style: 'dash' }); w.text(k * k + 'E₁ ＝ ' + A.num(k * k * e1, 2) + ' eV', 0.6, k * k, { size: 15 }); }
  // 右：E₁ と L
  const g = cv.view({ x0: 0, x1: 3.3, y0: 0, y1: 1.7, box: [560, 40, 290, 330] });
  g.axes({ xt: [0.5, 1, 2, 3], yt: [0.376, 1.504], yfmt: v => A.num(v, v < 1 ? 3 : 2), xl: 'L（nm）', yl: 'E₁（eV）' });
  g.plot(x => 0.376 / (x * x), { x0: 0.45, x1: 3.2, color: 'c', width: 2.5 });
  for (const [x, y] of [[1, 0.376], [0.5, 1.504], [2, 0.094]]) g.dot(x, y, { color: 'c', r: 4 });
  g.dot(L, e1, { color: 'b', shape: 'diamond', r: 8 });
}

function drawFind(cv, st) {
  const n = st.n;
  const v = cv.view({ x0: -0.05, x1: 1.05, y0: -1.7, y1: 2.4, box: [40, 20, 560, 300] });
  v.poly([[1 / 3, -1.7], [2 / 3, -1.7], [2 / 3, 2.4], [1 / 3, 2.4]], { fill: 'e', alpha: 0.1, color: 'e', style: 'dot', width: 1.2 });
  hatch(cv, v.X(0), v.Y(2.35), v.Y(-1.65), -1); hatch(cv, v.X(1), v.Y(2.35), v.Y(-1.65), 1);
  v.line([[0, 0], [1, 0]], { color: 'sub', width: 1 });
  v.area(x => 2 * Math.sin(n * Math.PI * x) ** 2, 1 / 3, 2 / 3, { fill: 'b', alpha: 0.15 });
  v.plot(x => Math.SQRT2 * Math.sin(n * Math.PI * x), { x0: 0, x1: 1, color: 'a', width: 2.5 });
  v.plot(x => 2 * Math.sin(n * Math.PI * x) ** 2, { x0: 0, x1: 1, color: 'b', width: 2.5, style: 'dash' });
  for (const t of [1, 2]) v.text(t + '/3', t / 3, -1.5, { align: 'center', size: 14, color: 'sub' });
  v.text('x/L', 1.02, -1.5, { size: 14, color: 'sub' });
  v.text('ψ', 0.04, 1.75, { size: 16, color: 'a', italic: true, math: true });
  // 下：見つかった所（1回ずつの点）
  const T = 348, Hh = 66, X = x => v.X(x);
  cv.rect(X(0), T, X(1) - X(0), Hh, { fill: 'sub', alpha: 0.06, color: 'sub', width: 1 });
  cv.text('見つかった所（1回ずつ）', X(0), T - 10, { size: 14, color: 'sub' });
  const r = st.found > 400 ? 2 : 3.2;
  const g = cv.g; g.fillStyle = A.color('d');
  for (const [x, y] of st.xs) { g.beginPath(); g.arc(X(x), T + 5 + y * (Hh - 10), r, 0, A.TAU); g.fill(); }
  // 右：まん中の 1/3 の割合の棒
  const bx = 680, by = 300, bh = 240;
  cv.rect(bx, by - bh, 60, bh, { color: 'sub', width: 1 });
  const fr = st.found ? st.mid / st.found : 0;
  cv.rect(bx, by - bh * fr, 60, bh * fr, { fill: 'd', alpha: 0.4 });
  cv.line([[bx - 10, by - bh * pMid(n)], [bx + 70, by - bh * pMid(n)]], { color: 'b', width: 2.5, style: 'dash' });
  cv.text('確率 ' + A.num(pMid(n), 2), bx + 74, by - bh * pMid(n), { size: 15, color: 'b' });
  cv.line([[bx - 10, by - bh / 3], [bx + 70, by - bh / 3]], { color: 'sub', width: 1, style: 'dot' });
  cv.text('1/3', bx - 14, by - bh / 3, { align: 'right', size: 14, color: 'sub' });
  cv.text('まん中の1/3で', bx + 30, by + 20, { align: 'center', size: 14 });
  cv.text('見つかった割合', bx + 30, by + 40, { align: 'center', size: 14 });
}

function drawMix(cv, st) {
  const e1 = E1(1), w1 = e1 / HBAR, w2 = 4 * e1 / HBAR;    // rad/fs
  const a1 = -w1 * st.t, a2 = -w2 * st.t;                   // 右回り（e^{−iEt/ħ}）
  // 左：回る矢印
  const R = 58;
  for (const [cx, a, lab, sp] of [[110, a1, 'ψ₁ の矢印', 'E₁'], [110, a2, 'ψ₂ の矢印', 'E₂（4倍の速さ）']]) {
    const cy = lab[1] === '₁' ? 110 : 305;
    cv.circle(cx, cy, R, { color: 'grid', width: 1 });
    cv.line([[cx - R - 8, cy], [cx + R + 8, cy]], { color: 'grid', width: 1 }); cv.line([[cx, cy - R - 8], [cx, cy + R + 8]], { color: 'grid', width: 1 });
    cv.arrow(cx, cy, cx + R * Math.cos(a), cy - R * Math.sin(a), { color: 'a', width: 3 });
    cv.text(lab, cx, cy - R - 18, { align: 'center', size: 15 });
    cv.text(sp, cx, cy + R + 18, { align: 'center', size: 14, color: 'sub' });
  }
  // 右：雲
  const v = cv.view({ x0: 0, x1: 1.08, y0: 0, y1: 3.4, box: [270, 30, 580, 340] });
  v.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [1, 2, 3], xl: 'x/L', grid: false, xfmt: v => A.num(v, v === 1 ? 0 : 2) });
  hatch(cv, v.X(0), v.Y(3.35), v.Y(0), -1); hatch(cv, v.X(1), v.Y(3.35), v.Y(0), 1);
  const c = Math.cos((w2 - w1) * st.t);
  const P = x => { const p1 = Math.SQRT2 * Math.sin(Math.PI * x), p2 = Math.SQRT2 * Math.sin(2 * Math.PI * x); return 0.5 * (p1 * p1 + p2 * p2 + 2 * p1 * p2 * c); };
  v.area(P, 0, 1, { fill: 'b', alpha: 0.15 });
  v.plot(x => 2 * Math.sin(Math.PI * x) ** 2, { x0: 0, x1: 1, color: 'sub', width: 1.4 });
  v.plot(P, { x0: 0, x1: 1, color: 'b', width: 3, style: 'dash' });
  // 平均の位置 ⟨x⟩
  let m = 0, s = 0; for (let k = 0; k < 200; k++) { const x = (k + 0.5) / 200; m += x * P(x); s += P(x); }
  const xm = m / s; v.dot(xm, 0.12, { color: 'd', shape: 'tri', r: 7 });
  v.text('平均の位置', xm, 0.42, { align: 'center', size: 14, color: 'd', bg: true });
}
