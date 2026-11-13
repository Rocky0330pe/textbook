// @id m4-26
// @title ローパスフィルター：成分ごとのかけ算
// @vol 数学9
// @from 数学 9-3 図7・⑧（ch9-03:619）／9-8⑧⑨・物理 電-10・波-11 でも使う
'use strict';
// 50 Hz・高さ1の方形波を、RC のローパスフィルター（折れ点 fc、τ=1/(2πfc)）に入れる。n 番めの成分は 1/(1+jnω₀τ) 倍（9-3⑧）
const F0 = 50, T = 1 / F0;
const fcOf = st => Math.pow(10, st.lf);
const gain = (f, fc) => 1 / Math.sqrt(1 + (f / fc) * (f / fc));
const bn = (n, inp) => n % 2 === 0 ? 0 : inp === 'sq' ? 4 / (n * Math.PI) : 8 / (Math.PI * Math.PI * n * n) * (((n - 1) / 2) % 2 ? -1 : 1);
function sqIn(t) { const u = ((t % T) + T) % T; return u < T / 2 ? 1 : -1; }
function triIn(t) { const u = ((t % T) + T) % T / T; return u < 0.25 ? 4 * u : u < 0.75 ? 2 - 4 * u : 4 * u - 4; }
// 方形波の出力は式で（落ち着いたあとのくり返し）：前半 1−(1+V)e^{−t/τ}、後半はその符号を変えたもの
function sqOut(t, fc) { const tau = 1 / (2 * Math.PI * fc), h = T / 2, e = Math.exp(-h / tau), V = (1 - e) / (1 + e); const u = ((t % T) + T) % T; return u < h ? 1 - (1 + V) * Math.exp(-u / tau) : -(1 - (1 + V) * Math.exp(-(u - h) / tau)); }
function triOut(t, fc) { let s = 0; for (let n = 1; n < 400; n += 2) { const f = n * F0, k = gain(f, fc), ph = Math.atan(f / fc); s += bn(n, 'tri') * k * Math.sin(2 * Math.PI * f * t - ph); } return s; }

A.item({
  id: 'm4-26', title: 'ローパスフィルター：成分ごとのかけ算',
  from: '数学 第9巻 9-3 図7・⑧ から（9-8、物理 電-10・波-11 でも使う）',
  W: 880, H: 440,
  state: { lf: 2, inp: 'sq', lfs: 2, t: 0 },
  scenes: [
    {
      key: 'oreten', label: '① 折れ点を変える',
      lead: '50 Hz の方形波を、抵抗とコンデンサーのローパスフィルターに入れます。折れ点（周波数）を下げると、出てくる波はどうなるでしょう。',
      note: '回る矢印1本は、この回路を通ると $\\frac{1}{1+j\\omega\\tau}$ 倍になります。高い周波数の成分ほど小さくなるので、出てくる波は角が丸くなります。折れ点 100 Hz なら、50 Hz は1.273から1.139へ、150 Hz は0.424から0.235へ、250 Hz は0.255から0.095へ。時間の世界の「角が丸くなる」と、周波数の世界の「高い成分が小さくなる」は、同じことです。',
      legend: [['入れる波', { color: 'sub', style: 'dash' }], ['出てくる波', { color: 'a' }], ['入れる成分（左の棒）', { color: 'sub', shape: 'square', noline: true }], ['出てくる成分（右の棒）', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'lf', label: '折れ点 $f_c$〔Hz〕', min: Math.log10(20), max: Math.log10(2000), step: 0.01, fmt: v => A.num(Math.pow(10, v), 0) }, { seg: 'inp', label: '入れる波', options: [['sq', '方形波'], ['tri', '三角波']] }],
      draw(cv, st) { drawFilter(cv, st); },
      readout: st => { const fc = fcOf(st); return [1, 3, 5].map(n => `${n * 50} Hz：${A.num(Math.abs(bn(n, st.inp)), 3)} → ${A.num(Math.abs(bn(n, st.inp)) * gain(n * 50, fc), 3)}`).join('　') + `　（$\\tau$ ＝ ${A.num(1000 / (2 * Math.PI * fc), 3)} ms）`; }
    },
    {
      key: 'yajirushi', label: '② 1本の sin を通す',
      lead: '1つの周波数の $\\sin$ の波だけを入れます。周波数を変えると、出てくる波の大きさと山の位置はどう変わるでしょう。',
      note: '出てくる波は、同じ周波数のまま、大きさが $\\frac{1}{\\sqrt{1+(\\omega\\tau)^2}}$ 倍になり、山が少しおくれます。折れ点（$\\omega\\tau=1$）では大きさが約0.707倍、おくれは45°。どんな周期の波も、この倍率を成分ごとにかけて、たし直せば、出てくる波がわかります。',
      miss: '倍率をかけるのは、波の値（時刻ごとの高さ）ではなく、**成分ごと**です。成分によって倍率がちがうので、形が変わります。',
      legend: [['入れる sin', { color: 'sub', style: 'dash' }], ['出てくる sin', { color: 'a' }], ['倍率のグラフ', { color: 'b' }]],
      controls: [{ range: 'lfs', label: '入れる周波数〔Hz〕', min: 1, max: Math.log10(3000), step: 0.01, fmt: v => A.num(Math.pow(10, v), 0) }, { range: 'lf', label: '折れ点 $f_c$〔Hz〕', min: Math.log10(20), max: Math.log10(2000), step: 0.01, fmt: v => A.num(Math.pow(10, v), 0) }],
      step(st, dt) { st.t += dt; },
      draw(cv, st) { drawOne(cv, st); },
      readout: st => { const f = Math.pow(10, st.lfs), fc = fcOf(st); return `入れる ${A.num(f, 0)} Hz、折れ点 ${A.num(fc, 0)} Hz　$\\omega\\tau=\\frac{f}{f_c}$ ＝ ${A.num(f / fc, 2)}　倍率 ＝ <b>${A.num(gain(f, fc), 3)}</b>　おくれ ＝ ${A.num(Math.atan(f / fc) * 180 / Math.PI, 1)}°`; }
    }
  ]
});

function drawFilter(cv, st) {
  const fc = fcOf(st), sq = st.inp === 'sq';
  const v = cv.view({ x0: 0, x1: 0.042, y0: -1.4, y1: 1.4, box: [40, 20, 470, 370] });
  v.axes({ xt: [0.01, 0.02, 0.03, 0.04], yt: [-1, 1], xfmt: x => A.num(x * 1000, 0), xl: 't（ms）' });
  v.plot(sq ? sqIn : triIn, { x0: 0, x1: 0.042, color: 'sub', style: 'dash', width: 2, n: 1000 });
  v.plot(t => sq ? sqOut(t, fc) : triOut(t, fc), { x0: 0, x1: 0.042, color: 'a', width: 3, n: 700 });
  cv.text('時間の世界', 60, 400, { size: 15, color: 'sub' });
  // 右：成分ごとの振幅（50・150・250・350・450 Hz）
  const s = cv.view({ x0: 0, x1: 500, y0: 0, y1: 1.45, box: [560, 30, 300, 340] });
  s.axes({ xt: [50, 150, 250, 350, 450], yt: [0.5, 1], xl: 'Hz', yl: '振幅', grid: false });
  for (let n = 1; n <= 9; n += 2) {
    const f = n * 50, a = Math.abs(bn(n, st.inp)), b = a * gain(f, fc);
    s.poly([[f - 17, 0], [f - 3, 0], [f - 3, a], [f - 17, a]], { fill: 'sub', alpha: 0.35, color: 'sub', width: 1 });
    s.poly([[f + 3, 0], [f + 17, 0], [f + 17, b], [f + 3, b]], { fill: 'b', alpha: 0.8 });
  }
  s.plot(f => gain(f, fc), { x0: 1, x1: 500, color: 'b', style: 'dot', width: 2, n: 300 });
  s.text('倍率（点線）', 490, gain(490, fc) + 0.08, { align: 'right', size: 14, color: 'b' });
  cv.text('周波数の世界', 580, 400, { size: 15, color: 'sub' });
  cv.text('折れ点 ' + A.num(fc, 0) + ' Hz', 860, 400, { align: 'right', size: 15, bold: true });
}

function drawOne(cv, st) {
  const f = Math.pow(10, st.lfs), fc = fcOf(st), k = gain(f, fc), ph = Math.atan(f / fc);
  // 左：2周期ぶん（時間の目もりは周期）
  const v = cv.view({ x0: 0, x1: 2, y0: -1.3, y1: 1.3, box: [40, 20, 470, 370] });
  v.axes({ xt: [0.5, 1, 1.5, 2], yt: [-1, 1], xl: '周期', xfmt: x => A.num(x, 1) });
  const sh = st.t * 0.5;
  v.plot(x => Math.sin(2 * Math.PI * (x - sh)), { color: 'sub', style: 'dash', width: 2, n: 400 });
  v.plot(x => k * Math.sin(2 * Math.PI * (x - sh) - ph), { color: 'a', width: 3, n: 400 });
  // 右：倍率のグラフ（横は対数の目もり）
  const g = cv.view({ x0: 1, x1: Math.log10(3000), y0: 0, y1: 1.15, box: [570, 30, 290, 300] });
  g.axes({ xt: [1, 2, 3], yt: [0.5, 0.707, 1], xfmt: x => A.num(Math.pow(10, x), 0), yfmt: y => A.num(y, y === 0.707 ? 3 : 1), xl: 'Hz', yl: '倍率' });
  g.plot(x => gain(Math.pow(10, x), fc), { color: 'b', width: 3, n: 300 });
  g.line([[st.lf, 0], [st.lf, 0.707]], { color: 'b', style: 'dot', width: 1.5 });
  g.text('折れ点', st.lf, 0.79, { align: 'center', size: 14, color: 'b', bg: true });
  g.dot(st.lfs, k, { color: 'a', r: 7 });
  cv.text('（横の目もりは 10 倍ごと）', 715, 375, { align: 'center', size: 14, color: 'sub' });
}
