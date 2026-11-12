// @id p2-31
// @title 原子をふやすと帯になる
// @vol 物理5
// @from 物理 原-8 ⑦（p5-08 席が分かれて帯になる・ブラッグ反射ですき間ができる・例題7）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 帯の席：N 個の原子を1列につないだときの席のエネルギー E_j＝E₀＋2t·cos(jπ/(N＋1))（j＝1…N）。
//   本の図（原子1個の下の席と上の席が、2個・4個・8個・N 個で分かれる）と同じ形になるよう、帯のはばの比を本の図（3.2 と 5.2）に合わせた。
//   席の形（原子ごとの波の大きさ）は sin(n·jπ/(N＋1))。両はしを止めた、ばねでつないだおもりのゆれの形と同じ。
// すき間：a＝0.25 nm で ħ²(π/a)²/(2m)＝h²/(8ma²)≈6.0 eV（例題7）。でこぼこの強さ V で、すき間のはばは 2V。
const LOW = { c: 0, t: 0.8 }, UP = { c: 9, t: 1.3 };
const lev = (b, N, j) => b.c + 2 * b.t * Math.cos(j * Math.PI / (N + 1));
const EA = 6.016;                                  // h²/(8ma²) eV（a＝0.25 nm）
const band = (k, V) => {                            // k は π/a を単位（|k|≦1.6）
  const s = Math.sign(k) || 1, q = Math.abs(k), e1 = EA * q * q, e2 = EA * (q - 2) ** 2, m = (e1 + e2) / 2, d = (e1 - e2) / 2, r = Math.sqrt(d * d + V * V);
  return q < 1 ? m - r : m + r; void s;
};

A.item({
  id: 'p2-31', title: '原子をふやすと帯になる',
  from: '物理 第5巻 原-8 ⑦ の図から（原子をたくさん並べると席が帯になる・ブラッグ反射ですき間・例題7）',
  W: 880, H: 430,
  state: { N: 1, j: 1, t: 0, V: 0.8, k: 0.5 },
  scenes: [
    {
      key: 'obi', label: '① 席が分かれて帯に',
      lead: '原子を1列に並べて、数 $N$ をふやします。原子1個の1つの席は、どうなるでしょう。▶ で $N$ が増えます。',
      note: '2つの原子を近づけると、1つの席が「結合」と「反結合」の2つに分かれました（原-7 ⑪）。$N$ 個並べると、1つの席が $N$ 個の席に分かれ、決まったはばの中にぎっしりつまって**帯**になります。1つの帯には $N$ 個の席があり、スピンの2つをかけて $2N$ 個の電子が入れます。下の席と上の席から生まれた帯のあいだには、どの席もない**すき間**が残ります。',
      legend: [['下の席から生まれた帯', { color: 'a' }], ['上の席から生まれた帯', { color: 'b', style: 'dash' }], ['すき間', { color: 'ink' }]],
      controls: [{ range: 'N', label: '原子の数 $N$', min: 1, max: 40, step: 1, d: 0 }],
      step(st, dt) { st.t += dt; if (st.t > 0.6) { st.t = 0; if (st.N >= 40) return false; st.N = Math.min(40, st.N < 8 ? st.N * 2 : st.N + 4); } },
      draw: drawSplit,
      readout: st => { const N = st.N, wA = N > 1 ? lev(LOW, N, 1) - lev(LOW, N, N) : 0, wB = N > 1 ? Math.abs(lev(UP, N, 1) - lev(UP, N, N)) : 0; return `$N$ ＝ ${N}：1つの帯に ${N} 個の席（電子は ${2 * N} 個まで）${GAP}帯のはば：下 ${A.num(wA, 2)}・上 ${A.num(wB, 2)}（$N$ が大きいと 3.2・5.2 に近づく。目安の目もり）`; }
    },
    {
      key: 'katachi', label: '② 席の形とばねのゆれ',
      lead: '帯の中の1つの席を選ぶと、原子ごとの波の大きさは、どんな形でしょう。下のばねでつないだおもりとくらべます。',
      note: 'いちばん低い席は、どの原子でも同じ向き（結合の形）、いちばん高い席は、となりどうしで向きが入れかわる形（反結合の形）です。この形は、ばねでつないだおもりのゆれの形（モード。波-3）と、まったく同じです。帯は、つないだ振動子のモードと同じしくみでできているのです。',
      legend: [['原子ごとの波の大きさ', { color: 'a', shape: 'square', noline: true }], ['包む形 $\\sin(nj\\pi/(N+1))$', { color: 'a', style: 'dash' }], ['おもりのゆれ（同じ形）', { color: 'b', shape: 'circle', noline: true }], ['選んだ席', { color: 'c' }]],
      state: { N: 8, j: 1 },
      controls: [{ range: 'N', label: '原子の数 $N$', min: 2, max: 16, step: 1, d: 0, on: st => { st.j = Math.min(st.j, st.N); } }, { range: 'j', label: '席の番号（下から）', min: 1, max: 16, step: 1, d: 0, on: st => { st.j = Math.min(st.j, st.N); } }],
      step(st, dt) { st.t += dt; },
      draw: drawMode,
      readout: st => `${st.N} 個の原子の、下から ${st.j} 番めの席${GAP}エネルギー（目安）${A.num(lev(LOW, st.N, st.N + 1 - st.j), 2)} ${st.j === 1 ? '：どの原子でも同じ向き（結合の形）' : st.j === st.N ? '：となりどうし反対向き（反結合の形）' : ''}`
    },
    {
      key: 'sukima', label: '③ 波で見るすき間',
      lead: '自由な電子の波が、間かく $a$＝0.25 nm で並んだイオンの中を進みます。波長が $2a$ になると、何が起きるでしょう。',
      note: '波長が $\\lambda=2a$（$k=\\pi/a$）のとき、となりのイオンではね返る波がそろって強め合い（ブラッグ反射）、進めなくなって定在波になります。定在波は2通りあり、山がイオンの上にくる $\\cos^2$ は低いエネルギー、イオンのあいだにくる $\\sin^2$ は高いエネルギーです。そのあいだのエネルギーの進む波はなく、これが帯のすき間です。$a$＝0.25 nm では、すき間ができる所の自由電子のエネルギーは約 6.0 eV（例題7）。',
      legend: [['自由な電子 $E\\propto k^2$', { color: 'sub', style: 'dot' }], ['結晶の中の電子', { color: 'a' }], ['$\\cos^2$：イオンの上（低い）', { color: 'a' }], ['$\\sin^2$：イオンのあいだ（高い）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'k', label: '波数 $k$（$\\pi/a$ を単位）', min: 0, max: 1.5, step: 0.01, d: 2 }, { range: 'V', label: 'でこぼこの強さ（eV）', min: 0, max: 1.5, step: 0.05, d: 2 }],
      draw: drawGap,
      readout: st => `$k$ ＝ ${A.num(st.k, 2)}π/$a$（波長 ${st.k > 0.01 ? A.num(0.5 / st.k, 2) + ' nm' : '∞'}）${GAP}$E$ ＝ ${A.num(band(st.k, st.V), 2)} eV${GAP}すき間：${A.num(EA - st.V, 2)}〜${A.num(EA + st.V, 2)} eV（はば ${A.num(2 * st.V, 2)} eV）${GAP}$\\dfrac{h^2}{8ma^2}$ ≒ 6.0 eV`
    }
  ]
});

function column(cv, x, w, N, y, hiJ) {   // 1つの列（N 個の原子の席）
  for (const [b, col, sty] of [[LOW, 'a', 'solid'], [UP, 'b', 'dash']]) {
    if (N > 24) { const lo = lev(b, N, N), hi = lev(b, N, 1), y1 = y(Math.max(lo, hi)), y2 = y(Math.min(lo, hi)); cv.rect(x, y1, w, y2 - y1, { fill: col, alpha: 0.25, color: col, width: 1.5, style: sty }); }
    for (let j = 1; j <= N; j++) cv.line([[x, y(lev(b, N, j))], [x + w, y(lev(b, N, j))]], { color: col, width: N > 24 ? 1 : 2.2, style: N > 24 ? 'solid' : sty });
  }
  if (hiJ) cv.line([[x - 6, y(lev(LOW, N, N + 1 - hiJ))], [x + w + 6, y(lev(LOW, N, N + 1 - hiJ))]], { color: 'c', width: 4 });
}

function drawSplit(cv, st) {
  const y = E => 390 - (E + 2.4) / 14.4 * 360;
  cv.arrow(36, 400, 36, 22, { color: 'sub', width: 1.5 });
  cv.text('エネルギー', 44, 24, { size: 14, color: 'sub' });
  const cols = [[1, 70], [2, 190], [4, 310], [8, 430]];
  for (const [n, x] of cols) { column(cv, x, 70, n, y); cv.text(n + '個', x + 35, 412, { align: 'center', size: 15 }); }
  const N = st.N;
  column(cv, 600, 130, N, y);
  cv.text('N ＝ ' + N + ' 個', 665, 412, { align: 'center', size: 16, bold: true });
  const top = Math.max(lev(LOW, N, 1), lev(LOW, N, N)), bot = Math.min(lev(UP, N, 1), lev(UP, N, N));
  cv.arrow(760, y(top), 760, y(bot), { color: 'ink', width: 1.5, head: 8 }); cv.arrow(760, y(bot), 760, y(top), { color: 'ink', width: 1.5, head: 8 });
  cv.text('すき間', 768, (y(top) + y(bot)) / 2, { size: 15 });
  cv.text('帯', 768, y(UP.c), { size: 15, color: 'b' }); cv.text('帯', 768, y(LOW.c), { size: 15, color: 'a' });
  cv.line([[560, 30], [560, 400]], { color: 'grid', width: 1 });
}

function drawMode(cv, st) {
  const N = st.N, j = Math.min(st.j, N);
  // 左：エネルギーの列
  const y = E => 380 - (E + 2) / 4 * 340;
  cv.text('下の帯の席', 70, 22, { align: 'center', size: 14, color: 'sub' });
  for (let q = 1; q <= N; q++) cv.line([[30, y(lev(LOW, N, q))], [110, y(lev(LOW, N, q))]], { color: 'a', width: 2 });
  cv.line([[22, y(lev(LOW, N, N + 1 - j))], [118, y(lev(LOW, N, N + 1 - j))]], { color: 'c', width: 4 });
  cv.text(j + '番め', 124, y(lev(LOW, N, N + 1 - j)), { size: 14, color: 'c' });
  // 右上：原子ごとの波の大きさ
  const x0 = 220, x1 = 850, X = n => x0 + (x1 - x0) * n / (N + 1), amp = 70, yc = 120;
  cv.line([[x0, yc], [x1, yc]], { color: 'grid', width: 1 });
  const pts = []; for (let k = 0; k <= 200; k++) { const u = k / 200 * (N + 1); pts.push([X(u), yc - amp * Math.sin(u * j * Math.PI / (N + 1))]); }
  cv.line(pts, { color: 'a', style: 'dash', width: 1.5 });
  for (let n = 1; n <= N; n++) { const c = Math.sin(n * j * Math.PI / (N + 1)); cv.line([[X(n), yc], [X(n), yc - amp * c]], { color: 'a', width: 5 }); cv.dot(X(n), yc, { color: 'ink', r: 4 }); }
  cv.text('電子の席：原子ごとの波の大きさ（●は原子）', x0, 30, { size: 15 });
  // 右下：ばねでつないだおもり（両はしは止めてある）
  const yb = 320, w = Math.sqrt(2 - 2 * Math.cos(j * Math.PI / (N + 1))), c = Math.cos(2.2 * w * st.t);
  cv.text('ばねでつないだおもり：同じ形のゆれ（両はしは止めてある）', x0, 228, { size: 15 });
  const ys = n => n === 0 || n === N + 1 ? yb : yb - amp * 0.8 * Math.sin(n * j * Math.PI / (N + 1)) * c;
  for (let n = 0; n <= N; n++) {   // ばね（ジグザグ）
    const xa = X(n), xb = X(n + 1), ya = ys(n), yb2 = ys(n + 1), m = 8, zz = [];
    for (let k = 0; k <= m; k++) { const u = k / m, off = k === 0 || k === m ? 0 : (k % 2 ? 5 : -5); zz.push([xa + (xb - xa) * u, ya + (yb2 - ya) * u + off]); }
    cv.line(zz, { color: 'sub', width: 1.4 });
  }
  cv.rect(X(0) - 8, yb - 30, 8, 60, { fill: 'sub', alpha: 0.4 }); cv.rect(X(N + 1), yb - 30, 8, 60, { fill: 'sub', alpha: 0.4 });
  for (let n = 1; n <= N; n++) cv.dot(X(n), ys(n), { color: 'b', r: 8 });
}

function drawGap(cv, st) {
  const V = st.V;
  const g = cv.view({ x0: -1.6, x1: 1.6, y0: 0, y1: 15.5, box: [50, 30, 360, 360] });
  g.axes({ xt: [-1, 0, 1], yt: [EA, 12], yfmt: v => A.num(v, v < 7 ? 1 : 0), xfmt: v => v === 0 ? '0' : (v < 0 ? '−' : '') + 'π/a', xl: 'k', yl: 'E（eV）' });
  g.plot(k => EA * k * k, { color: 'sub', style: 'dot', width: 1.6 });
  g.plot(k => band(k, V), { x0: -0.999, x1: 0.999, color: 'a', width: 3 });
  g.plot(k => band(k, V), { x0: 1.001, x1: 1.6, color: 'a', width: 3 });
  g.plot(k => band(k, V), { x0: -1.6, x1: -1.001, color: 'a', width: 3 });
  if (V > 0.02) { g.arrow(1.12, EA - V, 1.12, EA + V, { color: 'ink', width: 1.5, head: 7 }); g.arrow(1.12, EA + V, 1.12, EA - V, { color: 'ink', width: 1.5, head: 7 }); g.text('すき間', 1.17, EA + 1.4, { size: 14 }); }
  g.dot(st.k, band(st.k, V), { color: 'c', shape: 'diamond', r: 8 });
  // 右：k＝π/a の2つの定在波と、いまの k の波
  const v = cv.view({ x0: 0, x1: 4.2, y0: -0.4, y1: 3.4, box: [470, 30, 390, 360] });
  for (let n = 0; n <= 4; n++) for (const yy of [0, 1.45]) v.dot(n, yy, { color: 'd', r: 6 });
  v.plot(x => Math.cos(Math.PI * x) ** 2, { color: 'a', width: 2.5 });
  v.plot(x => 1.45 + Math.sin(Math.PI * x) ** 2, { color: 'b', width: 2.5, style: 'dash' });
  v.text('cos²：イオンの上 → 低い', 2.1, 1.15, { align: 'center', size: 14, color: 'a', bg: true });
  v.text('sin²：イオンのあいだ → 高い', 2.1, 2.6, { align: 'center', size: 14, color: 'b', bg: true });
  v.text('k ＝ π/a（波長 2a）の定在波', 0, 3.25, { size: 15 });
  // いまの k の進む波（実部）
  const yk = -0.15;
  v.line([[0, yk], [4.2, yk]], { color: 'grid', width: 1 });
  v.plot(x => yk + 0.22 * Math.cos(Math.PI * st.k * x), { color: 'c', width: 2 });
  v.text('いまの k の波', 4.2, yk - 0.22, { align: 'right', size: 14, color: 'c' });
  v.line([[0, -0.35], [1, -0.35]], { color: 'ink', width: 1.5 }); v.text('a', 0.5, -0.27, { align: 'center', size: 14, italic: true, math: true });
}
