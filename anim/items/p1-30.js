// @id p1-30
// @title もどらないのは起こりやすさの違い：つぼと棚
// @vol 物理2
// @from 物理 熱-15 ①③⑥（p2-15 の並び方の数・エーレンフェストのつぼ・ボルツマン分布）／数学3-17、熱-6・14 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// ① エーレンフェストのつぼ：毎回 N 個から1個を選んで反対のつぼへ。左に L 個なら、左の玉を選ぶ確率は L/N。
//    平均のずれは1回ごとに (1−2/N) 倍、近づいたあとのゆれの標準偏差は約 √N/2 個（本の表計算とプログラム）。乱数は A.rng で種を決める。
// ② 左に k 個いる確率 P(k)＝NCk/2^N。左が 40〜60 % に入る確率は N＝10 で 0.66、N＝100 で 0.96、N＝1000 で 45〜55 % が 0.9986。
// ③ 棚（エネルギー 0, ε, 2ε, …）に分子を置き、エネルギーの粒を1つずつでたらめに渡し合う。いちばん起こりやすい分け方は
//    n_j ∝ e^(−jε/kT)（ボルツマン分布）。1個あたりの粒の平均 q̄ のとき e^(−ε/kT)＝q̄/(1＋q̄)。
const NS = [10, 100, 1000];
A.item({
  id: 'p1-30', title: 'もどらないのは起こりやすさの違い：つぼと棚',
  from: '物理 第2巻『熱学』 熱-15 ①③⑥ の図と表から（エーレンフェストのつぼ、並び方の数、ボルツマン分布）',
  W: 880, H: 440,
  state: { N: 100, step: 0, Nb: 10, q: 1, Nt: 200 },
  scenes: [
    {
      key: 'tsubo', label: '① エーレンフェストのつぼ',
      lead: 'はじめは、玉が全部左のつぼにあります。毎回、玉を1個でたらめに選んで、反対のつぼへ移します。左の割合はどうなるでしょう。',
      note: 'どの $N$ でも、左の割合は半分に近づきます。近づくまでの回数は $N$ に比例し、近づいたあとのゆれは約 $\\sqrt N/2$ 個（割合では $1/(2\\sqrt N)$）。$N$ が大きいほど、半分の所の細い帯から出なくなります。移す向きにかたよりはありません。**半分ずつの並び方が、けたちがいに多いだけ**です。',
      miss: '全部が左にもどることは、禁じられてはいません。全部が左から始めて、もう一度全部が左にもどるまでの平均は $2^N$ 回。$N=10$ なら約 1000 回で起こりえますが、$N=100$ では $1.3\\times10^{30}$ 回で、宇宙の年齢をかけても起こりません。',
      legend: [['左の割合 $L/N$', { color: 'a' }], ['平均のずれ $0.5+0.5(1-2/N)^t$', { color: 'b', style: 'dash' }], ['ゆれの目安 $0.5\\pm1/(2\\sqrt N)$', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'N', label: '玉の数 $N$', options: NS.map(n => [n, String(n)]), on: urnInit }],
      init: urnInit,
      step(st, dt) { if (!st.left || st.left.length !== st.N) urnInit(st); const rate = st.N === 10 ? 30 : st.N === 100 ? 45 : 260; st.acc += dt * rate; while (st.acc >= 1 && st.step < 2000) { st.acc -= 1; urnMove(st); } if (st.step >= 2000) return false; },
      draw(cv, st) { drawUrn(cv, st); },
      readout: st => `${st.step} 回め${SP}左 ${st.L} 個・右 ${st.N - st.L} 個${SP}左の割合 <b>${A.num(st.L / st.N, 3)}</b>${SP}全部が片方に集まった回数 ${st.allSide}`
    },
    {
      key: 'kakuritsu', label: '② 並び方の数',
      lead: '$N$ 個の分子が、箱の左右にでたらめにいるとき、左に $k$ 個いる確率をくらべます。分子を増やすと、山の形はどう変わるでしょう。',
      note: '左に $k$ 個いる並び方は ${}_N\\mathrm{C}_k$ 通りで、確率は $P(k)={}_N\\mathrm{C}_k/2^N$。分子を増やすほど、山は「ちょうど半分」の所で細くとがります。全部が左の確率は $2^{-N}$：$N=100$ で $7.9\\times10^{-31}$。',
      miss: '「半分ずつ」がいちばん起こりやすいといっても、ちょうど半分になる確率そのものは、$N$ が大きいほど小さくなります（$N=4$ で 0.375、$N=100$ で 0.080）。大きくなるのは「半分の近く」に入る確率です。',
      legend: [['左に k 個いる確率', { color: 'a', shape: 'square', noline: true }], ['左が 40〜60 % の所', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ seg: 'Nb', label: '分子の数 $N$', options: [[4, '4'], [10, '10'], [100, '100'], [1000, '1000']] }],
      draw(cv, st) { drawBinom(cv, st); },
      readout: st => { const r = binomInfo(st.Nb); return `${r.band}${SP}全部の並び方 $2^N$ ＝ ${r.all}${SP}全部が左の確率 ${r.left}`; }
    },
    {
      key: 'tana', label: '③ エネルギーの棚',
      lead: '200 個の分子が、エネルギーの粒をでたらめに渡し合います（粒の合計は変わらない）。分子が、エネルギーの棚にどう分かれていくかを見ましょう。',
      note: 'はじめはみな同じ棚にいても、渡し合ううちに、**低い棚ほど多く、高い棚ほど少ない**分け方に落ち着きます。これがいちばん起こりやすい分け方、ボルツマン分布 $P_i\\propto e^{-\\varepsilon_i/(k_{\\mathrm B}T)}$ です。粒の平均（温度）を上げると、高い棚にも分子が上がります。',
      miss: 'エネルギーの粒の合計は決まっているのに、分子1つ1つのエネルギーはそろいません。そろった分け方（全員が同じ棚）は、並び方の数がとても少ないので、すぐにくずれます。',
      legend: [['棚にいる分子の数', { color: 'a', shape: 'square', noline: true }], ['ボルツマン分布の数', { color: 'b', shape: 'diamond' }]],
      controls: [{ range: 'q', label: '1個あたりの粒の平均', min: 0.5, max: 3, step: 0.5, d: 1, on: shelfInit }],
      init: shelfInit,
      step(st, dt) { if (!st.e || st.e.reduce((a, b) => a + b, 0) !== Math.round(st.Nt * st.q)) shelfInit(st); st.sacc += dt * 400; while (st.sacc >= 1) { st.sacc -= 1; shelfMove(st); } },
      draw(cv, st) { drawShelf(cv, st); },
      readout: st => { const x = st.q / (1 + st.q); return `渡した回数 ${st.moves}${SP}棚が1つ上がるごとに $e^{-\\varepsilon/k_{\\mathrm B}T}$ ＝ ${A.num(x, 3)} 倍${SP}$k_{\\mathrm B}T$ ＝ ${A.num(1 / Math.log(1 / x), 2)} $\\varepsilon$`; }
    }
  ]
});

// ---------- ① つぼ ----------
function urnInit(st) { st.L = st.N; st.step = 0; st.acc = 0; st.rng = A.rng(st.N === 10 ? 11 : st.N === 100 ? 1 : 3); st.hist = [[0, 1]]; st.allSide = 0; st.left = new Array(st.N).fill(true); st.last = -1; }
function urnMove(st) {
  const i = Math.floor(st.rng() * st.N);
  st.left[i] = !st.left[i]; st.L += st.left[i] ? 1 : -1; st.step++; st.last = i;
  if (st.L === 0 || st.L === st.N) st.allSide++;
  st.hist.push([st.step, st.L / st.N]);
}
function drawUrn(cv, st) {
  if (!st.left || st.left.length !== st.N) urnInit(st); // リンク（#tsubo&N=1000）で N だけ変わったとき
  const N = st.N;
  // つぼ（左右）
  const urn = (x0, lab, n) => { cv.line([[x0, 40], [x0 + 6, 190], [x0 + 150, 190], [x0 + 156, 40]], { color: 'ink', width: 2.5 }); cv.text(`${lab}：${n} 個`, x0 + 78, 210, { align: 'center', size: 15, bold: true }); };
  urn(20, '左', st.L); urn(210, '右', N - st.L);
  const per = N <= 10 ? 4 : N <= 100 ? 12 : 30, sz = N <= 10 ? 13 : N <= 100 ? 5 : 2.2, gap = N <= 10 ? 30 : N <= 100 ? 11.5 : 4.6;
  let li = 0, ri = 0;
  for (let i = 0; i < N; i++) {
    const left = st.left[i], k = left ? li++ : ri++, x0 = left ? 32 : 222, col = k % per, row = Math.floor(k / per);
    const x = x0 + 8 + col * gap, y = 180 - sz - row * gap;
    cv.dot(x, y, { color: i === st.last ? 'b' : 'a', r: i === st.last && N <= 100 ? sz + 1.5 : sz });
    if (N <= 10) cv.text(String(i + 1), x, y, { align: 'center', size: 13, color: 'bg', bold: true });
  }
  // グラフ
  const g = cv.view({ x0: 0, x1: 2080, y0: 0, y1: 1.15, box: [440, 30, 420, 360] });
  g.axes({ xt: [500, 1000, 1500, 2000], yt: [0, 0.5, 1], xl: '回', yl: '左の割合 L/N', zero: true, yfmt: v => A.num(v, 1) });
  const s = 1 / (2 * Math.sqrt(N));
  g.line([[0, 0.5 + s], [2080, 0.5 + s]], { color: 'sub', style: 'dot', width: 1.5 }); g.line([[0, 0.5 - s], [2080, 0.5 - s]], { color: 'sub', style: 'dot', width: 1.5 });
  g.plot(t => 0.5 + 0.5 * Math.pow(1 - 2 / N, t), { x0: 0, x1: 2000, color: 'b', style: 'dash', width: 2 });
  const h = st.hist, stp = Math.max(1, Math.floor(h.length / 700));
  g.line(h.filter((p, k) => k % stp === 0 || k === h.length - 1), { color: 'a', width: N === 10 ? 1.5 : 2 });
  cv.text(`N ＝ ${N}`, 845, 50, { align: 'right', size: 16, bold: true });
  // 下の数
  cv.text(`ゆれの目安（標準偏差）：約 √N/2 ＝ ${A.num(Math.sqrt(N) / 2, 1)} 個`, 20, 250, { size: 15 });
  cv.text(`全部が左にもどるまでの平均：2^N ＝ ${N === 10 ? '1024' : N === 100 ? '1.3×10^30' : '1.1×10^301'} 回`, 20, 278, { size: 15 });
  cv.text('赤い玉：いま移した玉', 20, 306, { size: 14, color: 'b' });
}

// ---------- ② 確率 ----------
function lnC(n, k) { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }
function P(n, k) { return Math.exp(lnC(n, k) - n * Math.LN2); }
function binomInfo(N) {
  let band = '';
  if (N === 1000) { let s = 0; for (let k = 450; k <= 550; k++) s += P(N, k); band = `左が 45〜55 % に入る確率 <b>${A.num(s, 4)}</b>`; }
  else { let s = 0; for (let k = 0; k <= N; k++) if (k / N >= 0.4 - 1e-9 && k / N <= 0.6 + 1e-9) s += P(N, k); band = `左が 40〜60 % に入る確率 <b>${A.num(s, 2)}</b>`; }
  const exp10 = x => { const e = Math.floor(x), m = Math.pow(10, x - e); return e < 6 ? String(Math.round(Math.pow(10, x))) : `${A.num(m, 1)}×10<sup>${e}</sup>`; };
  return { band, all: exp10(N * Math.log10(2)), left: N <= 10 ? A.num(Math.pow(2, -N), 4).replace(/0+$/, '') : `${A.num(Math.pow(10, -N * Math.log10(2) - Math.floor(-N * Math.log10(2))), 1)}×10<sup>${A.num(Math.floor(-N * Math.log10(2)), 0)}</sup>` };
}
function drawBinom(cv, st) {
  const N = st.Nb, ks = []; let pm = 0;
  for (let k = 0; k <= N; k++) { const p = P(N, k); ks.push(p); pm = Math.max(pm, p); }
  const g = cv.view({ x0: -0.05, x1: 1.05, y0: 0, y1: pm * 1.15, box: [80, 30, 760, 340] });
  const tick = pm > 0.2 ? 0.1 : pm > 0.05 ? 0.02 : 0.005;
  g.axes({ xt: [0, 0.25, 0.5, 0.75, 1], yt: A.range(tick, pm * 1.1, tick), xl: 'k/N（左にいる割合）', yl: 'P（左に k 個いる確率）', ay: -0.05, yfmt: v => String(+v.toFixed(3)), xfmt: v => String(v) });
  const lo = N === 1000 ? 0.45 : 0.4, hi = N === 1000 ? 0.55 : 0.6;
  const w = Math.max(0.0015, 0.5 / (N + 1));
  ks.forEach((p, k) => { const x = k / N, inb = x >= lo - 1e-9 && x <= hi + 1e-9; g.poly([[x - w, 0], [x + w, 0], [x + w, p], [x - w, p]], { fill: inb ? 'b' : 'a', alpha: 0.6 }); });
  cv.text(`N ＝ ${N}`, 830, 50, { align: 'right', size: 18, bold: true });
  cv.text(`ちょうど半分の確率 ${A.num(P(N, Math.floor(N / 2)), 3)}`, 830, 78, { align: 'right', size: 15 });
  cv.text('たての目もりは N ごとにちがう', 830, 104, { align: 'right', size: 14, color: 'sub' });
}

// ---------- ③ 棚 ----------
function shelfInit(st) {
  const N = st.Nt, tot = Math.round(N * st.q); st.e = [];
  for (let i = 0; i < N; i++) st.e.push(Math.floor(tot / N) + (i < tot % N ? 1 : 0)); // はじめは、みなほぼ同じ棚
  st.srng = A.rng(15); st.moves = 0; st.sacc = 0;
}
function shelfMove(st) { // 粒をもつ分子を1つ選び、ほかの分子に粒を1つ渡す
  const N = st.Nt; let i;
  for (let k = 0; k < 50; k++) { i = Math.floor(st.srng() * N); if (st.e[i] > 0) break; }
  if (st.e[i] <= 0) return;
  let j = Math.floor(st.srng() * (N - 1)); if (j >= i) j++;
  st.e[i]--; st.e[j]++; st.moves++;
}
function drawShelf(cv, st) {
  if (!st.e || st.e.reduce((a, b) => a + b, 0) !== Math.round(st.Nt * st.q)) shelfInit(st); // リンクで q だけ変わったとき
  const L = 9, cnt = new Array(L).fill(0), x = st.q / (1 + st.q);
  for (const e of st.e) cnt[Math.min(L - 1, e)]++;
  // 棚の絵
  const y0 = 395, dy = 40;
  for (let j = 0; j < L; j++) {
    const y = y0 - j * dy;
    cv.line([[70, y], [600, y]], { color: 'ink', width: 2 });
    cv.text(j === 0 ? '0' : j + 'ε' + (j === L - 1 ? '〜' : ''), 60, y - 2, { align: 'right', size: 14, color: 'sub' });
    const n = cnt[j], cols = Math.min(n, 106);
    for (let k = 0; k < cols; k++) cv.dot(78 + k * 4.9, y - 7, { color: 'a', r: 2.4 });
    if (n > 106) cv.text('…', 602, y - 8, { size: 14 });
    const th = j === L - 1 ? st.Nt * Math.pow(x, j) : st.Nt * (1 - x) * Math.pow(x, j); // いちばん上は、それより上の全部
    if (th > 0.3) { cv.dot(78 + Math.min(106, th) * 4.9, y - 7, { color: 'b', shape: 'diamond', r: 6 }); }
    cv.text(`${n}`, 645, y - 7, { size: 14, align: 'right' });
    cv.text(`${A.num(th, 1)}`, 700, y - 7, { size: 14, align: 'right', color: 'b' });
  }
  cv.text('数えた', 645, 22, { size: 14, align: 'right', bold: true }); cv.text('分布', 700, 22, { size: 14, align: 'right', bold: true, color: 'b' });
  cv.text('エネルギー', 18, 22, { size: 14, color: 'sub' });
  cv.text(`分子 ${st.Nt} 個`, 725, 160, { size: 15, bold: true }); cv.text(`粒 ${Math.round(st.Nt * st.q)} 個`, 725, 185, { size: 15, bold: true });
  cv.text('◆：ボルツマン', 725, 215, { size: 14, color: 'b' }); cv.text('　分布の数', 725, 237, { size: 14, color: 'b' });
  cv.text('点1つが', 725, 267, { size: 14, color: 'sub' }); cv.text('分子1個', 725, 289, { size: 14, color: 'sub' });
}
