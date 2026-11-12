// @id p2-34
// @title 放射性崩壊：数で見る半減期とばらつき
// @vol 物理5
// @from 物理 原-12 ③⑤⑨（p5-12 テクネチウム99m の減り方・崩壊の法則・数えるときの統計）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：テクネチウム99m の半減期 6 時間（3時間で 70.7 %、12時間で 4分の1）、平均寿命 τ＝T/ln2＝8.66 h、
// ヨウ素131 約8日、炭素14 5730年。ポアソン分布：1秒に平均0.3回を10秒（μ＝3、P(0)＝0.050、P(2)＝P(3)＝0.224）、
// 100 カウントのばらつき √100＝10。乱数は A.rng で種を決める（同じ種なら毎回同じ）。
// 放射線の項目なので、色や動きで「こわさ」を出さない（N-6・N-7）：残っている原子は青、こわれた原子はうすい灰色。
const ISO = { tc: ['テクネチウム99m', 6, '時間', 'h'], i: ['ヨウ素131', 8, '日', '日'], c: ['炭素14', 5730, '年', '年'] };
const GRID = { 100: [10, 10], 1000: [40, 25], 10000: [100, 100] };
function lifetimes(st) {   // 半減期を1とした寿命（指数分布）
  const r = A.rng(st.seed), n = st.N0, L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = -Math.log(1 - r()) / Math.LN2;
  st.L = L; st.Ls = Float32Array.from(L).sort(); st.lk = st.N0 + '/' + st.seed;
}
const ensure = st => { if (st.lk !== st.N0 + '/' + st.seed) lifetimes(st); };
const left = (st, u) => { const a = st.Ls; let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] <= u) lo = m + 1; else hi = m; } return a.length - lo; };   // u より長く残る数
function poisson(r, mu) { const L = Math.exp(-mu); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
const pois = (n, mu) => { let lp = -mu + n * Math.log(mu); for (let k = 2; k <= n; k++) lp -= Math.log(k); return Math.exp(lp); };

A.item({
  id: 'p2-34', title: '放射性崩壊：数で見る半減期とばらつき',
  from: '物理 第5巻 原-12 ③⑤⑨ の図から（テクネチウム99m の減り方・崩壊の法則・ポアソン分布）／数学 3-11・6-4・6-14 でも使う',
  W: 880, H: 430,
  state: { N0: 10000, iso: 'tc', u: 0, seed: 1, mu: 3 },
  scenes: [
    {
      key: 'hangenki', label: '① 1万個が減っていく',
      lead: '1万個の原子が、1個1個まったく偶然にこわれます。▶ で時間を進め、残りの数を見ましょう。',
      note: '1個1個は偶然でも、数がたくさんあると、残りの数は $N=N_0\\left(\\frac{1}{2}\\right)^{t/T_{1/2}}$ の曲線にそいます。半減期ごとに、**そのとき残っている数の**半分になります。3時間（半減期の半分）では 70.7 % で、直線で考えた 75 % ではありません。半減期は原子の数によらず同じで、100個が50個になるのも、2個が1個になるのも（平均すると）同じ時間です。',
      miss: '「半減期の2倍たつと、全部なくなる」はまちがいです。半減期の2回分で、残りは $\\frac{1}{2}\\times\\frac{1}{2}=\\frac{1}{4}$ です。0にはなりません。',
      legend: [['残っている原子', { color: 'a', shape: 'square', noline: true }], ['こわれた原子', { color: 'grid', shape: 'square', noline: true }], ['数えた残り', { color: 'a' }], ['$N_0(1/2)^{t/T_{1/2}}$', { color: 'b', style: 'dash' }], ['直線なら（まちがい）', { color: 'e', style: 'dot' }]],
      controls: [{ seg: 'N0', label: 'はじめの数', options: [[100, '100個'], [1000, '1000個'], [10000, '1万個']], on: st => { st.u = 0; } }, { seg: 'iso', label: '原子', options: Object.keys(ISO).map(k => [k, ISO[k][0] + '（' + ISO[k][1] + ISO[k][2] + '）']) }],
      init(st) { st.u = 0; ensure(st); },
      step(st, dt) { ensure(st); if (st.u >= 4) { st.u = 4; return false; } st.u = Math.min(4, st.u + dt * 0.35); },
      draw: drawDecay,
      readout: st => { ensure(st); const I = ISO[st.iso], t = st.u * I[1]; return `${I[0]}：$t$ ＝ ${A.num(t, t < 10 ? 1 : 0)} ${I[3]}（半減期の ${A.num(st.u, 2)} 回分）${GAP}残り <b>${left(st, st.u)} 個</b>${GAP}式では ${A.num(st.N0 * Math.pow(0.5, st.u), 0)} 個（${A.num(100 * Math.pow(0.5, st.u), 1)} %）`; }
    },
    {
      key: 'ikko', label: '② 1個はいつかわからない',
      lead: '20個の原子が、それぞれいつこわれたかを、横の棒で見ます。どの原子がいつこわれるかは、前もってわかりません。',
      note: 'どの原子も、1秒の間にこわれる確率は同じ（崩壊定数 $\\lambda$）で、それまで何時間残っていたかによりません。だから、まだ残っている原子が、次の半減期の間にこわれる確率は、いつも $\\frac{1}{2}$ です。1個がこわれるまでの時間の平均（平均寿命）は $\\tau=T_{1/2}/\\ln2$、テクネチウム99m では 6÷0.693＝8.66 時間です。',
      legend: [['こわれるまで（1個ずつ）', { color: 'a' }], ['こわれた時刻', { color: 'a', shape: 'cross', noline: true }], ['半減期ごとの線', { color: 'sub', style: 'dash' }], ['平均寿命 8.66 h', { color: 'c', style: 'dot' }]],
      state: { N0: 10000, iso: 'tc' },
      controls: [{ button: 'ほかの20個を選ぶ', act(st) { st.pick = (st.pick + 20) % 10000; } }],
      init(st) { st.pick = 0; ensure(st); },
      draw: drawOne,
      readout: st => { ensure(st); const c = [1, 2, 3].map(k => { let n = 0; for (let i = 0; i < 20; i++) if (st.L[st.pick + i] > k) n++; return n; }); return `20個のうち、6時間後に残る ${c[0]} 個・12時間後 ${c[1]} 個・18時間後 ${c[2]} 個（式では 10・5・2.5 個）`; }
    },
    {
      key: 'kazoeru', label: '③ はかるたびにばらつく',
      lead: '同じ放射線源を、同じ時間ずつ何度もはかります。数えた数は、毎回同じになるでしょうか。▶ でくり返しはかります。',
      note: '偶然に来る放射線の数は、ポアソン分布 $P(n)=\\dfrac{\\mu^n}{n!}e^{-\\mu}$ にしたがいます。平均3回（1秒に平均0.3回を10秒）なら、1回も数えないことが約 0.050、2回と3回がいちばん多く 0.224 です。ばらつきの目安は $\\sqrt{\\mu}$ で、結果は $n\\pm\\sqrt{n}$ と書きます（100 なら ±10）。',
      miss: '「1回めが 100 カウント、2回めが 108 カウントだったので、どちらかが間違い」はまちがいです。偶然のばらつきは $\\sqrt{100}=10$ ほどあります。8 の違いは、ふつうのばらつきです。',
      legend: [['はかった回数（ヒストグラム）', { color: 'a', shape: 'square', noline: true }], ['ポアソン分布の見こみ', { color: 'b', style: 'dash' }], ['いまの1回', { color: 'c', shape: 'diamond', noline: true }]],
      controls: [{ seg: 'mu', label: '平均', options: [[3, '3 カウント（10秒）'], [100, '100 カウント（1分）']], on: resetCount }, { button: '1回はかる', act(st) { measure(st); } }],
      init: resetCount,
      step(st, dt) { st.acc += dt * (st.k < 20 ? 3 : 25); while (st.acc >= 1) { st.acc -= 1; measure(st); } if (st.k >= 2000) return false; },
      draw: drawCount,
      readout: st => st.k ? `いまの1回：<b>${st.last} カウント</b>${GAP}はかった回数 ${st.k}${GAP}平均 ${A.num(st.sum / st.k, 2)}${GAP}見こみ $\\mu$ ＝ ${st.mu} ± ${A.num(Math.sqrt(st.mu), st.mu < 10 ? 2 : 0)}` : `平均 $\\mu$ ＝ ${st.mu} カウント${GAP}ばらつきの目安 $\\sqrt{\\mu}$ ＝ ${A.num(Math.sqrt(st.mu), st.mu < 10 ? 2 : 0)}`
    }
  ]
});

function resetCount(st) { st.rng = A.rng(12); st.hist = {}; st.k = 0; st.sum = 0; st.last = null; st.acc = 0; }
function measure(st) { const n = poisson(st.rng, st.mu); st.hist[n] = (st.hist[n] || 0) + 1; st.k++; st.sum += n; st.last = n; }

function drawDecay(cv, st) {
  ensure(st);
  const [cx, cy] = GRID[st.N0], S = 360, cell = S / Math.max(cx, cy), x0 = 20, y0 = 30;
  const g = cv.g, ca = A.color('a'), cg = A.color('grid');
  for (let i = 0; i < st.N0; i++) {
    const c = i % cx, r = Math.floor(i / cx);
    g.fillStyle = st.L[i] > st.u ? ca : cg;
    g.fillRect(x0 + c * cell + 0.5, y0 + r * cell + 0.5, Math.max(1, cell - (cell > 6 ? 2 : 0.6)), Math.max(1, cell - (cell > 6 ? 2 : 0.6)));
  }
  cv.text('はじめ ' + st.N0 + ' 個', x0, y0 - 14, { size: 14, color: 'sub' });
  // 右：残りの割合
  const I = ISO[st.iso], T = I[1];
  const v = cv.view({ x0: 0, x1: 4.3, y0: 0, y1: 110, box: [440, 30, 410, 360] });
  v.axes({ xt: [0.5, 1, 2, 3, 4], yt: [25, 50, 70.7, 100], xfmt: u => A.num(u * T, u * T < 10 && u * T % 1 ? 1 : 0), yfmt: y => A.num(y, y % 1 ? 1 : 0), xl: 't（' + I[3] + '）', yl: '残り（%）' });
  v.line([[0, 100], [1, 50]], { color: 'e', style: 'dot', width: 2 });
  v.line([[0.5, 0], [0.5, 70.71], [0, 70.71]], { color: 'sub', width: 1 });
  v.plot(u => 100 * Math.pow(0.5, u), { color: 'b', style: 'dash', width: 2.5 });
  const pts = []; for (let k = 0; k <= 160; k++) { const u = st.u * k / 160; pts.push([u, 100 * left(st, u) / st.N0]); }
  if (st.u > 0) v.line(pts, { color: 'a', width: 2.5 });
  v.dot(st.u, 100 * left(st, st.u) / st.N0, { color: 'a', r: 5 });
  for (const [u, lab] of [[1, '半分'], [2, '4分の1'], [3, '8分の1']]) v.text(lab, u + 0.04, 100 * Math.pow(0.5, u) + 6, { size: 14, color: 'b' });
  v.text('直線なら 75 %', 0.55, 84, { size: 14, color: 'e' });
}

function drawOne(cv, st) {
  ensure(st);
  const v = cv.view({ x0: 0, x1: 4.2, y0: 0, y1: 21, box: [60, 20, 790, 370] });
  v.axes({ xt: [1, 2, 3, 4], yt: [], xfmt: u => A.num(u * 6, 0), xl: 't（h）', grid: false });
  for (const u of [1, 2, 3, 4]) v.line([[u, 0], [u, 21]], { color: 'sub', style: 'dash', width: 1 });
  const tau = 1 / Math.LN2; v.line([[tau, 0], [tau, 21]], { color: 'c', style: 'dot', width: 2 });
  v.text('平均寿命 8.66 h', tau + 0.03, 20.5, { size: 14, color: 'c' });
  for (let i = 0; i < 20; i++) {
    const L = st.L[st.pick + i], y = 19.5 - i;
    v.line([[0, y], [Math.min(4.2, L), y]], { color: 'a', width: 5 });
    if (L < 4.2) v.dot(L, y, { color: 'a', shape: 'cross', r: 6 }); else v.text('→', 4.1, y, { size: 14, color: 'a' });
  }
}

function drawCount(cv, st) {
  const mu = st.mu, lo = mu < 10 ? -0.5 : 60, hi = mu < 10 ? 10.5 : 140;
  let top = 0; for (let n = Math.ceil(lo); n <= hi; n++) top = Math.max(top, pois(n, mu));
  const ytop = top * 1.35;
  const v = cv.view({ x0: lo, x1: hi, y0: 0, y1: ytop, box: [60, 30, 560, 350] });
  const xt = mu < 10 ? A.range(0, 10) : [60, 70, 80, 90, 100, 110, 120, 130, 140];
  v.axes({ xt, yt: [], grid: false, ay: lo, zero: true });
  cv.text('n（カウント）', 620, 402, { align: 'right', size: 14, color: 'sub' });
  const bw = mu < 10 ? 0.35 : 0.42;
  for (const [n, c] of Object.entries(st.hist)) { const f = c / st.k; v.poly([[+n - bw, 0], [+n + bw, 0], [+n + bw, f], [+n - bw, f]], { fill: 'a', alpha: 0.45 }); }
  const pts = []; for (let n = Math.ceil(lo); n <= hi; n++) pts.push([n, pois(n, mu)]);
  if (mu < 10) for (const [n, p] of pts) v.poly([[n - bw, 0], [n + bw, 0], [n + bw, p], [n - bw, p]], { color: 'b', style: 'dash', width: 2 });
  else v.line(pts, { color: 'b', style: 'dash', width: 2 });
  if (mu < 10) { v.text('0.050', 0, pois(0, 3) + ytop * 0.04, { align: 'center', size: 14, color: 'b' }); v.text('0.224', 2.5, pois(2, 3) + ytop * 0.06, { align: 'center', size: 14, color: 'b' }); }
  else { v.line([[90, ytop * 0.88], [110, ytop * 0.88]], { color: 'ink', width: 2 }); v.text('100 ± 10', 100, ytop * 0.94, { align: 'center', size: 15 }); }
  if (st.last != null) v.dot(st.last, ytop * 0.03, { color: 'c', shape: 'diamond', r: 8 });
  // 右：はかった結果の列
  cv.text('はかった結果', 660, 30, { size: 15, bold: true });
  cv.text(mu < 10 ? '（10秒ずつ）' : '（1分ずつ）', 660, 52, { size: 14, color: 'sub' });
  if (st.last != null) cv.text(st.last + ' カウント', 760, 110, { align: 'center', size: 30, bold: true, color: 'c' });
  cv.text(st.k + ' 回はかった', 760, 160, { align: 'center', size: 15 });
  if (st.k) cv.text('平均 ' + A.num(st.sum / st.k, 2), 760, 186, { align: 'center', size: 15 });
  cv.text('同じものを同じ時間はかっても、', 760, 260, { align: 'center', size: 14, color: 'sub' });
  cv.text('数は毎回少しずつちがう。', 760, 282, { align: 'center', size: 14, color: 'sub' });
}
