// @id p1-26
// @title 壁の中の温度が落ち着くまで・地中の温度の波
// @vol 物理2
// @from 物理 熱-11 ⑤⑩（p2-11 の箱に分けた壁の表計算・外断熱と内断熱・地中の温度）／数学8-13・6-2、熱-12、波でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 本の表と同じ：コンクリート 0.15 m（k＝1.6、ρc＝2024000）とグラスウール 0.10 m（k＝0.04、ρc＝13440）を 0.05 m の箱5つに分ける。
//   箱の熱容量 101200・672 J/K、箱の半分の熱抵抗 0.015625・0.625 K/W（面積 1 m²）。部屋の側 20 ℃、外の側 0 ℃、Δt＝60 s。
//   安定の条件 Δt ≦ 672÷(1÷1.25＋1÷0.625)＝280 s。定常の熱の流れ 20÷2.59＝7.7 W/m²。
// 地中：θ＝15＋10 e^(−z/δ) sin(ωt − z/δ)、δ＝√(2α/ω)、土の α＝5×10⁻⁷ m²/s（1年で δ≒2.2 m、1日で 0.12 m）。
const CON = { C: 101200, Rh: 0.015625 }, GW = { C: 672, Rh: 0.625 };
A.item({
  id: 'p1-26', title: '壁の中の温度が落ち着くまで・地中の温度の波',
  from: '物理 第2巻『熱学』 熱-11 ⑤⑩ の図と表から（2層の壁の表計算、地中の温度）',
  W: 880, H: 440,
  state: { order: 'out', dt: 60, tm: 0, per: 'year', td: 0 },
  scenes: [
    {
      key: 'kabe', label: '① 外断熱と内断熱',
      lead: 'はじめ 20 ℃の壁の外側が、急に 0 ℃になります。壁の中の温度と、外へ出ていく熱が、落ち着いていくようすを見ましょう。',
      note: '1つの箱の「次の温度＝今の温度＋（となりから入る熱の和）×$\\Delta t$÷熱容量」をくり返します（6-2 のオイラー法）。落ち着いた先（定常）では、どちらの順でも外へ出る熱は同じ **7.7 W/m²** です（熱抵抗の和は順番によらない）。でも途中はちがい、内断熱ではコンクリートが外の温度近くまで冷え、その熱が出ていくので、はじめの数時間は外へ出る熱が何十倍にもなります。',
      miss: 'グラスウールの箱は熱容量がとても小さい（672 J/K）ので、$\\Delta t$ を大きくすると計算がこわれます。本の条件 $\\Delta t\\leqq280$ s をこえると、箱の温度が1歩ごとに上下にゆれるようになり（本当はありえない動き）、この壁では約 420 s をこえると、ゆれが育って計算がこわれます。$\\Delta t$ を 400 s・450 s にして見ましょう。',
      legend: [['壁の中の温度（いま）', { color: 'b' }], ['定常（24 時間後の折れ線）', { color: 'sub', style: 'dash' }], ['外へ出る熱（右のグラフ）', { color: 'd', style: 'long' }]],
      controls: [
        { seg: 'order', label: '層の順', options: [['out', '外断熱（部屋の側がコンクリート）'], ['in', '内断熱（部屋の側がグラスウール）']], on: wallInit },
        { range: 'dt', label: '時間の刻み $\\Delta t$', min: 10, max: 600, step: 10, fmt: v => v + ' s', on: wallInit }
      ],
      init: wallInit,
      step(st, dt) { return wallStep(st, dt * 30 * (5 + st.tm)); }, // はじめはゆっくり、あとは速く（分）
      draw(cv, st) { drawWall(cv, st); },
      readout: st => `${fmtT(st.tm)}${SP}箱の温度（部屋の側から）${st.th.map(v => A.num(v, 2)).join('・')} ℃${SP}外へ出る熱 <b>${A.num(qout(st), 2)} W/m²</b>`
    },
    {
      key: 'chichuu', label: '② 地中の温度の波',
      lead: '地面の表面の温度が、1年の周期で上がったり下がったりします。そのゆれが、地中へしみこむうちに小さくなり、遅れていくようすを見ましょう。',
      note: '深さ $z$ では、ゆれの大きさが $e^{-z/\\delta}$ 倍になり、$z/\\delta$ だけ（角で）遅れます。土の1年のゆれでは $\\delta\\approx2.2$ m で、深さ 5 m ではゆれが約1割、約130日遅れます。井戸の水が「夏に冷たく、冬に温かい」のはこのためです。速いゆれ（1日）ほど浅い所でならされます（$\\delta\\approx0.12$ m）。',
      miss: '深い所は「1年じゅう平均の温度」ではありますが、それは表面のゆれが消えるからです。遅れがあるので、浅い所では表面と逆の季節の温度になることもあります（真夏に、地下 5 m は春先くらい）。',
      legend: [['いまの温度（深さにそって）', { color: 'b' }], ['ゆれのはば $\\pm10e^{-z/\\delta}$', { color: 'sub', style: 'dash' }], ['表面（右のグラフ）', { color: 'b' }], ['深い所（右のグラフ）', { color: 'a', style: 'dash' }]],
      controls: [{ seg: 'per', label: 'ゆれの周期', options: [['year', '1年（δ≒2.2 m）'], ['day', '1日（δ≒0.12 m）']], on: st => { st.td = 0; } }],
      init(st) { st.td = 0; },
      step(st, dt) { st.td = (st.td + dt / 12) % 2; },
      draw(cv, st) { drawGround(cv, st); },
      readout: st => { const g = ground(st); return `${g.per === 'year' ? Math.round(g.ph * 365) + ' 日め' : A.num(g.ph * 24, 1) + ' 時'}${SP}$\\delta$ ＝ ${A.num(g.delta, 3)} m${SP}表面 ${A.num(g.T(0), 1)} ℃${SP}深さ ${g.zd} m：${A.num(g.T(g.zd), 1)} ℃（ゆれ ${A.num(10 * Math.exp(-g.zd / g.delta), 2)} K、遅れ ${g.per === 'year' ? Math.round(g.zd / g.delta / (2 * Math.PI) * 365.25) + ' 日' : A.num(g.zd / g.delta / (2 * Math.PI) * 24, 1) + ' 時間'}）`; }
    }
  ]
});

// ---------- 壁 ----------
function layers(st) { return st.order === 'out' ? [CON, CON, CON, GW, GW] : [GW, GW, CON, CON, CON]; }
function wallInit(st) { st.th = [20, 20, 20, 20, 20]; st.tm = 0; st.acc = 0; st.hist = [[0, qout(st)]]; st.broken = false; }
function qout(st) { const L = layers(st); return (st.th[4] - 0) / L[4].Rh; }
function wallStep(st, sec) { // sec：進める時間（秒）
  if (st.broken) return false;
  const L = layers(st);
  st.acc += sec;
  while (st.acc >= st.dt) {
    st.acc -= st.dt; st.tm += st.dt / 60;
    const th = st.th, nx = th.slice();
    for (let i = 0; i < 5; i++) {
      const left = i === 0 ? (20 - th[0]) / L[0].Rh : (th[i - 1] - th[i]) / (L[i - 1].Rh + L[i].Rh);
      const right = i === 4 ? (0 - th[4]) / L[4].Rh : (th[i + 1] - th[i]) / (L[i].Rh + L[i + 1].Rh);
      nx[i] = th[i] + st.dt / L[i].C * (left + right);
    }
    st.th = nx;
    if (st.hist.length === 0 || st.tm - st.hist[st.hist.length - 1][0] >= 1) st.hist.push([st.tm, qout(st)]);
    if (nx.some(v => !isFinite(v) || Math.abs(v) > 1e4)) { st.broken = true; return false; }
    if (st.tm >= 1440) return false;
  }
}
function fmtT(m) { return m < 120 ? `${Math.round(m)} 分後` : `${A.num(m / 60, 1)} 時間後`; }
function drawWall(cv, st) {
  const L = layers(st), v = cv.view({ x0: 0, x1: 0.25, y0: -6, y1: 26, box: [70, 30, 360, 360] });
  for (let i = 0; i < 5; i++) if (L[i] === GW) v.poly([[i * 0.05, -6], [(i + 1) * 0.05, -6], [(i + 1) * 0.05, 26], [i * 0.05, 26]], { fill: 'e', alpha: 0.2 });
  v.axes({ xt: [0, 0.05, 0.1, 0.15, 0.2, 0.25], yt: [0, 5, 10, 15, 20], xl: 'x（m）', yl: 'θ（℃）', zero: true, xfmt: x => A.num(x, 2) });
  cv.text(st.order === 'out' ? 'コンクリート' : 'グラスウール', v.X(st.order === 'out' ? 0.075 : 0.05), v.Y(24.5), { align: 'center', size: 14, bold: true });
  cv.text(st.order === 'out' ? 'グラスウール' : 'コンクリート', v.X(st.order === 'out' ? 0.2 : 0.175), v.Y(24.5), { align: 'center', size: 14, bold: true });
  cv.text('部屋 20 ℃', v.X(0) + 4, v.Y(-4.5), { size: 14, color: 'sub' }); cv.text('外 0 ℃', v.X(0.25) - 4, v.Y(-4.5), { size: 14, color: 'sub', align: 'right' });
  // 定常の折れ線
  let R = 0; const Rt = L.reduce((a, l) => a + 2 * l.Rh, 0), q = 20 / Rt, ss = [[0, 20]];
  for (let i = 0; i < 5; i++) { R += 2 * L[i].Rh; ss.push([(i + 1) * 0.05, 20 - q * R]); }
  v.line(ss, { color: 'sub', style: 'dash', width: 2 });
  const pts = [[0, 20]].concat(st.th.map((t, i) => [0.025 + 0.05 * i, A.clamp(t, -6, 26)]), [[0.25, 0]]);
  v.clip(() => v.line(pts, { color: 'b', width: 3 }));
  st.th.forEach((t, i) => { if (t > -6 && t < 26) v.dot(0.025 + 0.05 * i, t, { color: 'b', r: 6, shape: L[i] === GW ? 'square' : 'circle' }); });
  if (st.broken) cv.text('計算がこわれた（Δt が大きすぎる）', 250, 200, { align: 'center', size: 17, bold: true, color: 'b', bg: true });
  // 外へ出る熱（対数の目もり）
  // 時間も対数の目もり（はじめの数分と 24 時間後を1つのグラフに）
  const lg = Math.log10, g = cv.view({ x0: 0, x1: lg(1440), y0: 0, y1: 3, box: [500, 30, 360, 360] });
  g.axes({ xt: [0, 1, lg(60), lg(360), lg(1440)], yt: [0, 1, 2, 3], xl: '時間（対数）', yl: '外へ出る熱（W/m²）', xfmt: x => ['1分', '10分', '1時間', '6時間', '24時間'][[0, 1, lg(60), lg(360), lg(1440)].indexOf(x)], yfmt: y => String(Math.pow(10, y)), zero: true });
  g.line([[0, lg(7.71)], [lg(1440), lg(7.71)]], { color: 'sub', style: 'dash', width: 1.5 });
  cv.text('定常 7.7', g.X(lg(1440)) - 4, g.Y(lg(7.71)) - 12, { size: 14, color: 'sub', align: 'right' });
  const h = st.hist.filter(p => p[1] > 0 && p[0] >= 1).map(p => [lg(p[0]), A.clamp(lg(p[1]), 0, 3)]);
  if (h.length > 1) g.clip(() => g.line(h, { color: 'd', width: 3, style: 'long' }));
}

// ---------- 地中 ----------
function ground(st) {
  const per = st.per, alpha = 5e-7, Tp = per === 'year' ? 365.25 * 86400 : 86400, w = 2 * Math.PI / Tp, delta = Math.sqrt(2 * alpha / w);
  const ph = st.td % 1, zd = per === 'year' ? 5 : 0.3, zmax = per === 'year' ? 8 : 0.4;
  // 表面がいちばん暑いのが ph＝0.25（本の図の「夏」）
  return { per, delta, ph, zd, zmax, T: z => 15 + 10 * Math.exp(-z / delta) * Math.sin(2 * Math.PI * ph - z / delta) };
}
function drawGround(cv, st) {
  const g = ground(st);
  const v = cv.view({ x0: 3, x1: 27, y0: -g.zmax, y1: 0, box: [60, 62, 330, 328] });
  v.axes({ xt: [5, 10, 15, 20, 25], yt: (g.per === 'year' ? [-8, -6, -4, -2, 0] : [-0.4, -0.3, -0.2, -0.1, 0]), xl: '温度 θ（℃）', yl: '深さ z（m）', ax: -g.zmax, ay: 3, zero: true, yfmt: y => A.num(-y, g.per === 'year' ? 0 : 1) });
  v.line([[3, 0], [27, 0]], { color: 'ink', width: 2 }); cv.text('地面', v.X(26.8), v.Y(0) - 10, { size: 14, color: 'sub', align: 'right' });
  v.param(z => 15 + 10 * Math.exp(-z / g.delta), z => -z, 0, g.zmax, { color: 'sub', style: 'dash', width: 1.5 });
  v.param(z => 15 - 10 * Math.exp(-z / g.delta), z => -z, 0, g.zmax, { color: 'sub', style: 'dash', width: 1.5 });
  v.param(z => g.T(z), z => -z, 0, g.zmax, { color: 'b', width: 3.5 });
  v.line([[3, -g.zd], [27, -g.zd]], { color: 'a', style: 'dot', width: 1.5 });
  v.dot(g.T(0), 0, { color: 'b', r: 6 }); v.dot(g.T(g.zd), -g.zd, { color: 'a', r: 6, shape: 'square' });
  cv.text(`深さ ${g.zd} m`, v.X(26.5), v.Y(-g.zd) - 12, { size: 14, color: 'a', align: 'right' });
  const season = ['春', '夏', '秋', '冬'][Math.floor(((g.ph + 0.125) % 1) * 4)];
  cv.text(g.per === 'year' ? `表面の季節：${season}` : `表面：${g.ph < 0.5 ? '昼' : '夜'}`, 225, 22, { align: 'center', size: 16, bold: true });
  // 時間のグラフ：表面と深い所
  const q = cv.view({ x0: 0, x1: 2, y0: 3, y1: 27, box: [480, 40, 380, 330] });
  q.axes({ xt: [0.5, 1, 1.5, 2], yt: [5, 10, 15, 20, 25], xl: g.per === 'year' ? '年' : '日', yl: '温度（℃）', ax: 3, xfmt: x => A.num(x, 1) });
  const tt = st.td;
  const at = (z, t) => 15 + 10 * Math.exp(-z / g.delta) * Math.sin(2 * Math.PI * t - z / g.delta);
  q.plot(t => at(0, t), { x0: 0, x1: tt, color: 'b', width: 3 });
  q.plot(t => at(g.zd, t), { x0: 0, x1: tt, color: 'a', width: 3, style: 'dash' });
  q.dot(tt, at(0, tt), { color: 'b', r: 6 }); q.dot(tt, at(g.zd, tt), { color: 'a', r: 6, shape: 'square' });
  q.text('表面', 0.05, 26, { size: 15, color: 'b', bold: true }); q.text(`深さ ${g.zd} m`, 0.4, 26, { size: 15, color: 'a', bold: true });
}
