// @id m1-22
// @title 《振|ふ》り《子|こ》の《長|なが》さと《周期|しゅうき》
// @vol 数学2
// @from 数学 2-8 平方根（振り子 ch2-08:205-238・213-220・418-427）／2-15・6-6・波-1 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。周期は本のグラフと同じ 2.007×√長さ（秒）。小さくふらしたときの動き
const TP = L => 2.007 * Math.sqrt(L);
const AMP = 15 * Math.PI / 180;
const MEAS = [[0.1, 0.63], [0.2, 0.90], [0.4, 1.27], [0.9, 1.90]];  // 本の表の、はかった値

function pend(cv, px, py, L, scale, t, col, shape, o) {
  const T = TP(L), th = AMP * Math.cos(2 * Math.PI * t / T), len = L * scale;
  cv.rect(px - 40, py - 8, 80, 8, { fill: 'sub', alpha: 0.5 });
  // ふれる道すじ
  const pts = []; for (let q = 0; q <= 30; q++) { const a = -AMP + 2 * AMP * q / 30; pts.push([px + len * Math.sin(a), py + len * Math.cos(a)]); }
  cv.line(pts, { color: 'grid', width: 2, style: 'dash' });
  if (o && o.ghost) cv.line([[px, py], [px, py + len]], { color: 'grid', width: 1, style: 'dot' });
  const bx = px + len * Math.sin(th), by = py + len * Math.cos(th);
  cv.line([[px, py], [bx, by]], { color: 'ink', width: 2 });
  cv.circle(bx, by, 11, { fill: col, alpha: 0.85, color: col, width: 2 });
  cv.dot(bx, by, { color: 'bg', r: 4, shape });
  return [bx, by];
}

// ---------- ① 長さを変える ----------
function drawShuuki(cv, st) {
  const scale = 330, px = 200, py = 30;
  pend(cv, px, py, st.L, scale, st.t, 'b', 'circle', { ghost: true });
  // 長さの矢印
  cv.arrow(px - 70, py + 4, px - 70, py + st.L * scale, { color: 'sub', width: 1.5 });
  cv.text(`${Math.round(st.L * 100)} cm`, px - 78, py + st.L * scale / 2, { align: 'right', size: 15 });
  const n = Math.floor(st.t / TP(st.L));
  cv.text(`${n} おうふく`, px, 404, { align: 'center', size: 16, bold: true });
  // 右：グラフ
  const g = cv.view({ x0: 0, x1: 1.08, y0: 0, y1: 2.35, box: [480, 30, 360, 330] });
  g.axes({ xt: [0.2, 0.4, 0.6, 0.8, 1], yt: [0.5, 1, 1.5, 2], xl: '長さ（m）', yl: 'しゅうき（秒）', xfmt: v => A.num(v, 1), yfmt: v => A.num(v, 1) });
  g.plot(x => TP(x), { x0: 0, x1: 1, color: 'b', width: 2.5 });
  for (const [x, y] of MEAS) g.dot(x, y, { color: 'ink', r: 5, shape: 'square' });
  g.line([[st.L, 0], [st.L, TP(st.L)], [0, TP(st.L)]], { color: 'a', width: 1.5, style: 'dash' });
  g.dot(st.L, TP(st.L), { color: 'a', r: 7, shape: 'diamond' });
}

// ---------- ② 2 倍・4 倍・9 倍 ----------
function drawKurabe(cv, st) {
  const L1 = 0.1, L2 = 0.1 * st.k, scale = 300, t = st.t;
  pend(cv, 230, 26, L1, scale, t, 'a', 'circle');
  pend(cv, 600, 26, L2, scale, t, 'b', 'square');
  cv.text(`A：10 cm`, 230, 88, { align: 'center', size: 15, bold: true, color: 'a' });
  cv.text(`B：${Math.round(L2 * 100)} cm（${st.k}倍）`, 600 + 70, 70, { size: 15, bold: true, color: 'b' });
  // 下：おうふくのリズム（1 おうふくごとに しるし）
  const L = 80, R = 840, y1 = 340, y2 = 380, span = 8, X = s => L + (s % span) / span * (R - L);
  const t0 = Math.floor(t / span) * span;
  cv.text('A', L - 20, y1, { align: 'right', size: 15, bold: true, color: 'a' });
  cv.text('B', L - 20, y2, { align: 'right', size: 15, bold: true, color: 'b' });
  for (const [y, T, col, sh] of [[y1, TP(L1), 'a', 'circle'], [y2, TP(L2), 'b', 'square']]) {
    cv.line([[L, y], [R, y]], { color: 'grid', width: 2 });
    for (let k = Math.ceil(t0 / T); k * T <= t; k++) cv.dot(X(k * T - t0 + t0), y, { color: col, r: 6, shape: sh });
  }
  cv.line([[X(t), y1 - 16], [X(t), y2 + 16]], { color: 'sub', width: 1.5 });
  for (let s = 0; s <= span; s++) cv.text(String(t0 + s), L + s / span * (R - L), y2 + 26, { align: 'center', size: 13, color: 'sub' });
  cv.text('秒', R + 14, y2 + 26, { size: 13, color: 'sub' });
  cv.text(`A ${Math.floor(t / TP(L1))} おうふく　B ${Math.floor(t / TP(L2))} おうふく`, 440, 300, { align: 'center', size: 16, bold: true });
}

A.item({
  id: 'm1-22', title: '《振|ふ》り《子|こ》の《長|なが》さと《周期|しゅうき》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-8「《平方根|へいほうこん》」の《振|ふ》り《子|こ》の《図|ず》から（2-15・6-6、《物理|ぶつり》 《波|なみ》-1 でも《使|つか》う）',
  W: 880, H: 420,
  state: { t: 0, L: 0.4, k: 4 },
  scenes: [
    {
      key: 'shuuki', label: '① 《長|なが》さと《周期|しゅうき》',
      lead: '《糸|いと》の《長|なが》さを《変|か》えて ▶。1《往復|おうふく》する《時間|じかん》（《周期|しゅうき》）は、どう《変|か》わるでしょう。',
      note: '《長|なが》さ（m）の √ を2《倍|ばい》すると、《周期|しゅうき》（《秒|びょう》）のおよその《値|あたい》です。1 m の《振|ふ》り《子|こ》なら《約|やく》2《秒|びょう》。《長|なが》くなるほど《周期|しゅうき》はふえにくくなるので、**グラフは《直線|ちょくせん》ではなく、だんだんねていく《曲線|きょくせん》**になります。■は《本|ほん》の《表|ひょう》のはかった《値|あたい》です。',
      legend: [['《周期|しゅうき》 ＝ 《約|やく》2×√《長|なが》さ', { color: 'b' }], ['はかった《値|あたい》（《本|ほん》の《表|ひょう》）', { color: 'ink', shape: 'square', noline: true }], ['いまの《長|なが》さ', { color: 'a', shape: 'diamond', style: 'dash' }]],
      controls: [{ range: 'L', label: '《糸|いと》の《長|なが》さ', min: 0.1, max: 1, step: 0.01, fmt: v => Math.round(v * 100) + ' cm', on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; if (st.t > 60) st.t = 0; },
      draw(cv, st) { drawShuuki(cv, st); },
      readout: st => `《長|なが》さ ${A.num(st.L, 2)} m　√${A.num(st.L, 2)} ＝ ${A.num(Math.sqrt(st.L), 3)}　→　《周期|しゅうき》 《約|やく》 <b>${A.num(TP(st.L), 2)} 《秒|びょう》</b>`
    },
    {
      key: 'kurabe', label: '② 2《倍|ばい》・4《倍|ばい》・9《倍|ばい》',
      lead: 'A は10 cm。B を A の2《倍|ばい》・4《倍|ばい》・9《倍|ばい》の《長|なが》さにして ▶。《下|した》の《点|てん》は、1《往復|おうふく》するごとにつきます。',
      note: '《長|なが》さを4《倍|ばい》にすると《周期|しゅうき》は2《倍|ばい》、9《倍|ばい》にすると3《倍|ばい》。$\\sqrt{4}=2$、$\\sqrt{9}=3$ です。2《倍|ばい》のときは $\\sqrt{2}$ 《倍|ばい》で、《約|やく》1.41《倍|ばい》。《周期|しゅうき》は**《長|なが》さの √ に《比例|ひれい》**します。',
      miss: '《長|なが》さ2《倍|ばい》→《周期|しゅうき》2《倍|ばい》はまちがい。《周期|しゅうき》は $\\sqrt{2}$ 《倍|ばい》（《約|やく》1.41《倍|ばい》）です。《周期|しゅうき》を2《倍|ばい》にするには、《長|なが》さを4《倍|ばい》にします。',
      state: { k: 4 },
      legend: [['A（10 cm）', { color: 'a', shape: 'circle', noline: true }], ['B', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ seg: 'k', label: 'B の《長|なが》さ', options: [[2, '2《倍|ばい》'], [4, '4《倍|ばい》'], [9, '9《倍|ばい》']], on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; if (st.t > 80) st.t = 0; },
      draw(cv, st) { drawKurabe(cv, st); },
      readout: st => `A の《周期|しゅうき》 ${A.num(TP(0.1), 2)} 《秒|びょう》、B の《周期|しゅうき》 ${A.num(TP(0.1 * st.k), 2)} 《秒|びょう》　→　B は A の <b>√${st.k} ＝ ${A.num(Math.sqrt(st.k), st.k === 2 ? 2 : 0)} 《倍|ばい》</b>`
    }
  ]
});
