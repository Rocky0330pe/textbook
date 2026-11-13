// @id p2-35
// @title 連鎖反応と増倍率：遅発中性子でゆっくり
// @vol 物理5
// @from 物理 原-15 ②⑥⑧（p5-15 増倍率と連鎖反応・世代ごとの中性子の数・遅発中性子・1点炉の動特性）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：n_g＝n₀k^g（k＝1.1 で20世代 約6.7倍、0.9 で約0.12倍、1.001 で100世代 1.105倍・1万世代 約2万倍）、
// 1回の分裂で平均 2.43 個、1世代は 10⁻⁴ 秒ほど、遅発中性子の割合 β＝0.0065、λ＝0.08 /s、Λ＝1×10⁻⁴ s、
// ρ＝0.001 で即発跳躍 1.18 倍・周期 69 s・60 s で 2.8 倍（2つの指数の和。本のルンゲ・クッタの出力と同じ：checks/アニメ/p2-35/）、
// 即発中性子だけなら 0.12 s で 3.2 倍をこえる。目安の式 T≈0.083 s/ρ。
// 原子力の項目なので、あおらない（N-7）：色は落ち着いた青と灰、「臨界」は物理のことばとして説明する。乱数は A.rng で種を決める。
const NU = 2.43, BETA = 0.0065, LAM = 0.08, LAMB = 1e-4, G = 20, N0 = 20, NB = 10000;
function grow(st) {   // 枝分かれ（中性子1個が、確率 k/2.43 で分裂を起こし、2個か3個（平均2.43個）の中性子を出す）
  const r = A.rng(35 + Math.round(st.k * 100)), gens = [];
  let cur = []; for (let i = 0; i < N0; i++) cur.push({ p: -1 });
  gens.push(cur);
  for (let g = 1; g <= G; g++) {
    const nxt = [];
    cur.forEach((n, i) => { if (r() < st.k / NU) { const m = r() < NU - 2 ? 3 : 2; for (let j = 0; j < m; j++) nxt.push({ p: i }); } });
    gens.push(nxt); cur = nxt;
  }
  // 同じきまりで、1万個から始めたときの数（絵にはせず、グラフの点だけ）
  const big = [NB]; let n = NB;
  for (let g = 1; g <= G; g++) { let m = 0; for (let i = 0; i < n; i++) if (r() < st.k / NU) m += r() < NU - 2 ? 3 : 2; n = m; big.push(n); }
  st.gens = gens; st.big = big; st.gk = st.k;
}
const ensure = st => { if (st.gk !== st.k) grow(st); };
function kin(rho) {   // 1点炉・遅発中性子1群：n(t)＝A₁e^{s₁t}＋A₂e^{s₂t}（はじめはつり合い、n＝1）
  const a = LAMB, b = BETA - rho + LAM * LAMB, c = -LAM * rho, D = Math.sqrt(b * b - 4 * a * c);
  const s1 = (-b + D) / (2 * a), s2 = (-b - D) / (2 * a), A1 = rho > 0 ? (rho / LAMB - s2) / (s1 - s2) : 1;
  return { s1, s2, A1, n: t => A1 * Math.exp(s1 * t) + (1 - A1) * Math.exp(s2 * t) };
}

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
A.item({
  id: 'p2-35', title: '連鎖反応と増倍率：遅発中性子でゆっくり',
  from: '物理 第5巻 原-15 ②⑥⑧ の図から（増倍率と連鎖反応・世代ごとの中性子の数・遅発中性子・1点炉の出力）',
  W: 880, H: 430,
  state: { k: 1, g: 0, kk: 1.001, rho: 0.001, del: true, t: 0 },
  scenes: [
    {
      key: 'sedai', label: '① 世代ごとの数と k',
      lead: '20個の中性子から始めて、1世代ずつ進めます。増倍率 $k$ を変えると、中性子の数はどう変わるでしょう。',
      note: '1回の分裂で平均 2.43 個の中性子が出ますが、全部が次の分裂を起こすわけではありません。燃料以外の物に吸われたり、外へにげたりします。次の世代に残る割合が増倍率 $k$ で、$n_g=n_0k^g$ です。$k=1.1$ では20世代で約6.7倍、$k=0.9$ では約0.12倍です。$k=1$ では数が一定で、これを**臨界**といいます。1個1個は偶然なので、数が少ないうちは式のまわりで大きくばらつきますが、1万個から始めると（右の■）、ほぼ式のとおりになります。原子炉の中の中性子は、もっとずっと多いのです。',
      miss: '「原子炉が臨界になったというのは、危ない状態になったということ」はまちがいです。臨界は $k=1$、中性子の数がつり合って、一定の出力で落ち着いている状態で、運転中の原子炉はいつも臨界です。',
      legend: [['中性子（左：1世代ずつの列）', { color: 'a', shape: 'circle', noline: true }], ['$k=1.1$（超臨界）', { color: 'a' }], ['$k=1$（臨界）', { color: 'sub', style: 'dot' }], ['$k=0.9$（未臨界）', { color: 'b', style: 'dash' }], ['左の木の数（20個から）', { color: 'c', shape: 'diamond', noline: true }], ['1万個から始めたとき', { color: 'd', shape: 'square', noline: true }]],
      controls: [{ seg: 'k', label: '増倍率 $k$', options: [[0.9, '0.9'], [1, '1'], [1.1, '1.1']], on: st => { st.g = 0; } }],
      init(st) { st.g = 0; ensure(st); },
      step(st, dt) { ensure(st); if (st.g >= G) { st.g = G; return false; } st.g = Math.min(G, st.g + dt * 2); },
      draw: drawTree,
      readout: st => { ensure(st); const g = Math.floor(st.g), n = st.gens[g].length; return `${g} 世代め：中性子 <b>${n} 個</b>（はじめの ${A.num(n / N0, 2)} 倍）${GAP}式 $k^g$ ＝ ${A.num(st.k, 1)} の ${g} 乗 ＝ ${A.num(Math.pow(st.k, g), 2)}${GAP}1万個からなら ${A.num(st.big[g] / NB, 2)} 倍${GAP}（1世代は 10⁻⁴ 秒ほど）`; }
    },
    {
      key: 'zure', label: '② 小さなずれが積み重なる',
      lead: '$k$ を 1 からほんの少しずらします。世代を重ねると、どれだけ変わるでしょう（たて軸は10倍ごと）。',
      note: '$k=1.001$ でも、100世代で 1.105 倍、1万世代で約2万倍です。1世代は $10^{-4}$ 秒ほどしかないので、即発中性子だけなら、1万世代は約1秒です。だから、$k$ を1にぴったり合わせ続けることが、原子炉の運転のいちばん大事な仕事です。③の遅発中性子が、この変化をゆっくりにしています。',
      miss: '「1.001 は1とほとんど同じだから、出力もほとんど変わらない」はまちがいです。1世代ごとに 0.1 % ずつでも、世代はとても短いので、積み重なると大きく増えます。増倍率のわずかなずれが、指数の肩にのって効いてきます。',
      legend: [['$n_g/n_0=k^g$', { color: 'a' }], ['$k=1$', { color: 'sub', style: 'dot' }], ['100世代・1万世代', { color: 'c', shape: 'diamond', noline: true }]],
      controls: [{ range: 'kk', label: '増倍率 $k$', min: 0.999, max: 1.002, step: 0.0001, d: 4 }],
      draw: drawDrift,
      readout: st => `$k$ ＝ ${A.num(st.kk, 4)}：100世代で ${A.num(Math.pow(st.kk, 100), 3)} 倍、1万世代（即発中性子だけなら約1秒）で <b>${big(Math.pow(st.kk, 10000))} 倍</b>`
    },
    {
      key: 'chihatsu', label: '③ 遅発中性子でゆっくり',
      lead: '反応度 $\\rho$ を階段のように入れたときの出力を、遅発中性子があるときと、ないときでくらべます。▶ で時間が進みます。',
      note: '分裂で出る中性子の約 0.65 %（$\\beta$＝0.0065）は、分裂片の崩壊を待って、平均約13秒おくれて出ます（遅発中性子）。この少しの中性子が、世代の時間の平均を約 0.083 秒まで引きのばします。$\\rho$＝0.001 では、出力はすぐに 1.18 倍に跳び（即発跳躍）、そのあとは 69 秒で $e$ 倍のペースでゆっくり増え、60 秒で 2.8 倍です。人や機械が出力計を見ながら制御棒を動かす時間が、十分にあります。遅発中性子がなければ（チェックを外す）、同じ $\\rho$＝0.001 で 0.12 秒で 3.2 倍をこえます。原子炉は、$\\rho$ が $\\beta$ よりずっと小さい範囲で運転するように作られています。',
      legend: [['遅発中性子がある（1点炉の式）', { color: 'a' }], ['即発中性子だけ', { color: 'b', style: 'dash' }], ['はじめの出力', { color: 'sub', style: 'dot' }], ['いまの時刻', { color: 'c', shape: 'diamond', noline: true }]],
      controls: [{ range: 'rho', label: '反応度 $\\rho$', min: 0, max: 0.004, step: 0.0001, d: 4, on: st => { st.t = 0; } }, { check: 'del', label: '遅発中性子', text: 'あり（本物の原子炉）' }],
      init(st) { st.t = 0; },
      step(st, dt) { if (st.t >= 60) { st.t = 60; return false; } st.t = Math.min(60, st.t + dt * 5); },
      draw: drawKin,
      readout: st => { const q = kin(st.rho); return st.del ? `$t$ ＝ ${A.num(st.t, 1)} s${GAP}出力 <b>${A.num(q.n(st.t), 2)} 倍</b>${GAP}即発跳躍 ${A.num(BETA / (BETA - st.rho), 2)} 倍、周期 ${st.rho > 0 ? A.num(1 / q.s1, 0) + ' s' : '∞（一定）'}（目安の式 0.083/ρ ＝ ${st.rho > 0 ? A.num(0.083 / st.rho, 0) + ' s' : '∞'}）` : `$t$ ＝ ${A.num(st.t, 1)} s${GAP}即発中性子だけ：$n=e^{\\rho t/\\Lambda}$ は ${st.rho > 0 ? A.num(Math.log(3.2) * LAMB / st.rho, 3) + ' s で 3.2 倍をこえる' : '一定'}`; }
    }
  ]
});

function big(v) { if (v < 1000 && v >= 0.01) return A.num(v, v < 10 ? 3 : 0); if (v >= 1000 && v < 1e5) return '約 ' + A.num(v / 1e4, 1) + ' 万'; const e = Math.floor(Math.log10(v)); return A.num(v / 10 ** e, 1) + '×10' + String(e).split('').map(c => SUP[c]).join(''); }

function drawTree(cv, st) {
  ensure(st);
  const gN = Math.floor(st.g), x0 = 40, dx = 23, top = 40, H = 340;
  const pos = (g, i, n) => [x0 + g * dx, top + H * (i + 0.5) / Math.max(n, 1)];
  cv.text('世代 →', x0, 24, { size: 14, color: 'sub' });
  for (let g = 0; g <= gN; g++) {
    const L = st.gens[g], n = L.length, r = n > 80 ? 1.6 : n > 30 ? 2.2 : 3.2;
    if (g > 0 && n <= 200) { const P = st.gens[g - 1].length; const g2 = cv.g; g2.strokeStyle = A.color('sub'); g2.globalAlpha = 0.35; g2.lineWidth = 0.8; g2.beginPath(); L.forEach((q, i) => { const a = pos(g - 1, q.p, P), b = pos(g, i, n); g2.moveTo(a[0], a[1]); g2.lineTo(b[0], b[1]); }); g2.stroke(); g2.globalAlpha = 1; }
    for (let i = 0; i < n; i++) { const [x, y] = pos(g, i, n); cv.dot(x, y, { color: 'a', r }); }
    if (g % 5 === 0) cv.text(String(g), x0 + g * dx, 400, { align: 'center', size: 14, color: 'sub' });
  }
  cv.text(st.gens[gN].length + ' 個', x0 + gN * dx, 418, { align: 'center', size: 14, bold: true });
  // 右：n_g/n_0
  const v = cv.view({ x0: 0, x1: 21, y0: 0, y1: 7.5, box: [540, 30, 310, 350] });
  v.axes({ xt: [5, 10, 15, 20], yt: [1, 2, 3, 4, 5, 6, 7], xl: 'g', yl: 'はじめの何倍' });
  v.plot(g => Math.pow(1.1, g), { x0: 0, x1: 20, color: 'a', width: 2.5 });
  v.plot(() => 1, { x0: 0, x1: 20, color: 'sub', style: 'dot', width: 2.5 });
  v.plot(g => Math.pow(0.9, g), { x0: 0, x1: 20, color: 'b', style: 'dash', width: 2.5 });
  for (let g = 0; g <= gN; g++) { v.dot(g, Math.min(7.4, st.gens[g].length / N0), { color: 'c', shape: 'diamond', r: 5 }); v.dot(g, Math.min(7.4, st.big[g] / NB), { color: 'd', shape: 'square', r: 3.5 }); }
  v.text('6.7', 20.2, 6.73, { size: 14, color: 'a' }); v.text('0.12', 20.2, 0.42, { size: 14, color: 'b' });
}

function drawDrift(cv, st) {
  const k = st.kk, lg = Math.log10(k);
  const v = cv.view({ x0: 0, x1: 10500, y0: -5, y1: 9, box: [80, 30, 760, 350] });
  v.axes({ xt: [2000, 4000, 6000, 8000, 10000], yt: [-4, -2, 0, 2, 4, 6, 8], yfmt: y => y === 0 ? '1' : '10' + String(y).split('').map(c => SUP[c]).join(''), xl: '世代 g', yl: 'はじめの何倍（10倍ごと）', ay: 0, ax: -5 });
  v.plot(() => 0, { color: 'sub', style: 'dot', width: 2 });
  v.plot(g => g * lg, { x0: 0, x1: 10000, color: 'a', width: 3 });
  for (const g of [100, 10000]) { const y = g * lg; if (y > -5 && y < 9) { v.dot(g, y, { color: 'c', shape: 'diamond', r: 7 }); v.text(g === 100 ? '100世代：' + A.num(Math.pow(k, 100), 3) + '倍' : '1万世代：' + big(Math.pow(k, 10000)) + '倍', g === 100 ? 300 : 9800, y + 0.6, { size: 15, align: g === 100 ? 'left' : 'right', bg: true }); } }
  // 時間の目もり（即発中性子だけのとき、1世代 10⁻⁴ s）
  for (const [g, lab] of [[5000, '0.5 s'], [10000, '1 s']]) cv.text('（' + lab + '）', v.X(g), v.Y(-5) + 32, { align: 'center', size: 14, color: 'sub' });
}

function drawKin(cv, st) {
  const q = kin(st.rho);
  const v = cv.view({ x0: 0, x1: 63, y0: 0, y1: 3.4, box: [70, 30, 560, 350] });
  v.axes({ xt: [10, 20, 30, 40, 50, 60], yt: [1, 2, 3], xl: 't（s）', yl: 'n/n₀（出力）' });
  v.plot(() => 1, { color: 'sub', style: 'dot', width: 2 });
  if (st.del) v.plot(t => q.n(t), { x0: 0, x1: Math.max(0.001, st.t), color: 'a', width: 3, n: 600 });
  else v.plot(t => Math.exp(st.rho * t / LAMB), { x0: 0, x1: Math.max(0.001, Math.min(st.t, 1)), color: 'b', style: 'dash', width: 3, n: 600 });
  const y = st.del ? q.n(st.t) : Math.exp(st.rho * st.t / LAMB);
  if (y < 3.4) v.dot(st.t, y, { color: 'c', shape: 'diamond', r: 8 });
  else v.text('たての軸のすぐ右で 3.2 倍をこえる（' + A.num(Math.log(3.2) * LAMB / Math.max(1e-9, st.rho), 2) + ' s）', 2, 3.2, { size: 14, color: 'b', bg: true });
  if (st.del && st.rho > 0) v.text('即発跳躍 ' + A.num(BETA / (BETA - st.rho), 2) + ' 倍', 3, BETA / (BETA - st.rho) - 0.18, { size: 14, color: 'a' });
  // 右：出力計
  const m = cv.view({ x0: 0, x1: 1, y0: 0, y1: 3.4, box: [700, 30, 50, 350] });
  m.poly([[0, 0], [1, 0], [1, 3.4], [0, 3.4]], { color: 'sub', width: 1 });
  m.poly([[0, 0], [1, 0], [1, Math.min(3.4, y)], [0, Math.min(3.4, y)]], { fill: y > 3.4 ? 'sub' : 'a', alpha: 0.45 });
  if (y > 3.4) m.text('目もりの外', 0.5, 3.6, { align: 'center', size: 14, color: 'sub' });
  for (const yy of [1, 2, 3]) { m.line([[1, yy], [1.2, yy]], { color: 'sub', width: 1 }); m.text(yy + '倍', 1.3, yy, { size: 14, color: 'sub' }); }
  cv.text('出力計', 725, 400, { align: 'center', size: 14 });
}
