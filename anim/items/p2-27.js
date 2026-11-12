// @id p2-27
// @title うなりから波束へ：はばのかけ算
// @vol 物理5
// @from 物理 原-3 ⑦（p5-03 波束・不確定性・例題10）、波-8 ②（p3-08 うなり）／数学 9-4 のガウスのはば
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：うなり 22 Hz と 20 Hz（1秒に2回）、7つの波 0.85〜1.15（間かく 0.05、次に山がそろうのは 2π/0.05≈126）、
// ガウスの波束 Δx＝1.0 nm → Δk＝1/(2Δx)＝5.0×10⁸ rad/m、Δp＝ħΔk≈5.3×10⁻²⁶ kg·m/s。
const HBAR = 1.055e-34;
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = (v, d = 1) => { const e = Math.floor(Math.log10(Math.abs(v)) + 1e-9), m = v / 10 ** e; return A.num(m, d) + '×10' + String(e).split('').map(c => SUP[c]).join(''); };
const ks = st => { const N = Math.round(st.N); if (N === 1) return [1]; const a = []; for (let j = 0; j < N; j++) a.push(1 - st.sp / 2 + st.sp * j / (N - 1)); return a; };
const avg = (st, x) => { const k = ks(st); let s = 0; for (const q of k) s += Math.cos(q * x); return s / k.length; };

A.item({
  id: 'p2-27', title: 'うなりから波束へ：はばのかけ算',
  from: '物理 第5巻 原-3 ⑦ の図から（波長の少し違う波を重ねる・例題10）／波-8 ② のうなり・数学 9-4 でも使う',
  W: 880, H: 430,
  state: { f1: 22, t: 0, N: 7, sp: 0.3, dx: 1.0 },
  scenes: [
    {
      key: 'unari', label: '① 2つの波でうなり',
      lead: '振動数が少しちがう2つの波（$f_2$＝20 Hz と $f_1$）を重ねます。振動数の差を変えて、大きくなる回数を見ましょう。',
      note: '$y=A\\sin2\\pi f_1t+A\\sin2\\pi f_2t$ は、まん中の振動数の波に、ゆっくり変わる振幅 $2A\\cos(2\\pi\\frac{f_1-f_2}{2}t)$ をかけた形です。音が大きくなる回数は、1秒に $|f_1-f_2|$ 回です（22 Hz と 20 Hz なら2回）。差が0になると、うなりは消えます。',
      legend: [['$f_1$ の波・$f_2$ の波', { color: 'sub' }], ['2つの和', { color: 'a' }], ['振幅 $\\pm2\\cos(\\cdots)$', { color: 'b', style: 'dash' }], ['大きくなる所', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'f1', label: '$f_1$〔Hz〕', min: 20, max: 26, step: 0.1, d: 1 }],
      step(st, dt) { st.t += dt * 0.25; if (st.t > 1) st.t = 0; },
      draw: drawBeat,
      readout: st => `1秒あたりのうなりの回数 ＝ |${A.num(st.f1, 1)} − 20| ＝ <b>${A.num(Math.abs(st.f1 - 20), 1)} 回</b>${GAP}まん中の振動数 ${A.num((st.f1 + 20) / 2, 1)} Hz`
    },
    {
      key: 'tasu', label: '② 1本ずつ足す',
      lead: '波数が少しずつちがう波を、1本ずつ足していきます。▶ で数が増えます。',
      note: '2つの波では、うなりが同じ形でくり返します。重ねる波の数を増やし、波数の間かくをせまくするほど、次にまた山がそろう所（2π ÷ 間かく）は遠くなり、1つだけのかたまり（**波束**）に近づきます。波数の広がりを半分にすると、かたまりのはばはほぼ2倍になります。',
      legend: [['1本1本の波（上）', { color: 'sub' }], ['平均（下）', { color: 'a' }], ['次に山がそろう所', { color: 'b', shape: 'diamond', noline: true }], ['上の図の範囲', { color: 'e', style: 'dot' }]],
      state: { N: 1 },
      controls: [{ range: 'N', label: '波の数', min: 1, max: 21, step: 1, d: 0 }, { range: 'sp', label: '波数の広がり', min: 0.1, max: 0.6, step: 0.01, fmt: v => A.num(1 - v / 2, 2) + '〜' + A.num(1 + v / 2, 2) }],
      step(st, dt) { st.t += dt; if (st.t > 0.9) { st.t = 0; if (st.N >= 21) return false; st.N++; } },
      draw: drawSum,
      readout: st => { const N = Math.round(st.N); if (N < 2) return '波1本：どこまでも同じ高さで続く（かたまりがない）'; const d = st.sp / (N - 1); return `波 ${N} 本、間かく ${A.num(d, 3)}${GAP}→ 次に山がそろう所 $x$ ＝ 2π ÷ ${A.num(d, 3)} ≒ <b>${A.num(2 * Math.PI / d, 0)}</b>`; }
    },
    {
      key: 'haba', label: '③ はばのかけ算',
      lead: '波束の位置のはば $\\Delta x$ を変えると、波数（運動量）のはば $\\Delta k$ はどう変わるでしょう。',
      note: 'ガウスの形の波束では $\\Delta x\\,\\Delta k=\\frac{1}{2}$ で、ほかの形ではもっと大きくなります。$p=\\hbar k$ なので $\\Delta x\\,\\Delta p\\geqq\\frac{\\hbar}{2}$（不確定性関係）。位置をせまく決めると、運動量が広くばらつきます。',
      miss: '「もっとよい測定器を作れば、位置も運動量もぴったり決められる」はまちがいです。電子が波なので、両方が同時にぴったり決まった状態が、もともとありません。はかり方が下手だからではありません。',
      legend: [['波の高さ $\\psi$', { color: 'a' }], ['包む形', { color: 'a', style: 'dash' }], ['確率 $|\\psi|^2$（位置）・波数の分布', { color: 'b', style: 'long' }], ['はば（標準偏差）', { color: 'ink' }]],
      controls: [{ range: 'dx', label: '位置のはば $\\Delta x$〔nm〕', min: 0.3, max: 2, step: 0.01, d: 2 }],
      draw: drawPacket,
      readout: st => { const dk = 1 / (2 * st.dx); return `$\\Delta x$ ＝ ${A.num(st.dx, 2)} nm${GAP}$\\Delta k=\\dfrac{1}{2\\Delta x}$ ＝ ${sci(dk * 1e9, 1)} rad/m${GAP}$\\Delta x\\,\\Delta k$ ＝ <b>0.50</b>${GAP}$\\Delta p=\\hbar\\Delta k$ ≒ ${sci(HBAR * dk * 1e9, 1)} kg·m/s`; }
    }
  ]
});

function drawBeat(cv, st) {
  const f1 = st.f1, f2 = 20;
  const top = cv.view({ x0: 0, x1: 1.08, y0: -2.4, y1: 2.4, box: [60, 16, 780, 120] });
  top.plot(t => Math.sin(2 * Math.PI * f1 * t) + 1.2, { x1: 1, color: 'sub', width: 1.2, n: 900 });
  top.plot(t => Math.sin(2 * Math.PI * f2 * t) - 1.2, { x1: 1, color: 'sub', width: 1.2, n: 900 });
  top.text('f₁ ＝ ' + A.num(f1, 1) + ' Hz', 1.0, 1.2, { size: 15, color: 'sub', bg: true });
  top.text('f₂ ＝ 20 Hz', 1.0, -1.2, { size: 15, color: 'sub', bg: true });
  const v = cv.view({ x0: 0, x1: 1.08, y0: -2.6, y1: 2.6, box: [60, 160, 780, 230] });
  v.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [-2, 2], xl: 't（s）', grid: false });
  v.plot(t => Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t), { x1: 1, color: 'a', width: 1.8, n: 1400 });
  const df = f1 - f2;
  v.plot(t => 2 * Math.cos(Math.PI * df * t), { x1: 1, color: 'b', style: 'dash', width: 2 });
  v.plot(t => -2 * Math.cos(Math.PI * df * t), { x1: 1, color: 'b', style: 'dash', width: 2 });
  if (df > 0.05) for (let k = 0; k / df <= 1 + 1e-9; k++) v.dot(k / df, 2.25, { color: 'b', shape: 'diamond', r: 6 });
  v.line([[st.t, -2.6], [st.t, 2.6]], { color: 'sub', width: 1, style: 'dot' });
  const y = Math.sin(2 * Math.PI * f1 * st.t) + Math.sin(2 * Math.PI * f2 * st.t);
  v.dot(st.t, y, { color: 'a', r: 6 });
  cv.text('見やすいように低い振動数でかいた（本の図と同じ）', 840, 412, { align: 'right', size: 14, color: 'sub' });
}

function drawSum(cv, st) {
  const k = ks(st), N = k.length;
  // 上：1本1本（x は −30〜30）
  const up = cv.view({ x0: -30, x1: 30, y0: 0, y1: 1, box: [60, 12, 780, 190] });
  const h = 1 / Math.max(N, 4);
  k.forEach((q, j) => { const y0 = 1 - h * (j + 0.5); up.plot(x => y0 + 0.42 * h * Math.cos(q * x), { color: 'sub', width: N > 12 ? 0.8 : 1.2, n: 500 }); });
  if (N <= 9) k.forEach((q, j) => up.text('k＝' + A.num(q, 3), 30, 1 - h * (j + 0.5), { size: 14, color: 'sub', align: 'right', bg: true }));
  // 下：平均（x は −130〜130）
  const v = cv.view({ x0: -135, x1: 135, y0: -1.15, y1: 1.3, box: [60, 222, 780, 175] });
  v.poly([[-30, -1.15], [30, -1.15], [30, 1.3], [-30, 1.3]], { fill: 'e', alpha: 0.08, color: 'e', style: 'dot', width: 1.2 });
  v.axes({ xt: [-120, -60, 0, 60, 120], yt: [-1, 1], xl: 'x', grid: false });
  v.plot(x => avg(st, x), { color: 'a', width: 1.6, n: 1600 });
  if (N >= 2) { const d = st.sp / (N - 1), X = 2 * Math.PI / d; for (const s of [-1, 1]) if (X < 135) v.dot(s * X, 1.15, { color: 'b', shape: 'diamond', r: 7 }); }
  // 上と下をつなぐ線
  cv.line([[up.X(-30), 204], [v.X(-30), 222]], { color: 'e', width: 1, style: 'dot' }); cv.line([[up.X(30), 204], [v.X(30), 222]], { color: 'e', width: 1, style: 'dot' });
}

function drawPacket(cv, st) {
  const dx = st.dx, dk = 1 / (2 * dx), k0 = 8;
  const v = cv.view({ x0: -6, x1: 6, y0: -1.15, y1: 1.3, box: [50, 30, 470, 340] });
  v.axes({ xt: [-6, -4, -2, 0, 2, 4, 6], yt: [], xl: 'x（nm）', grid: false });
  v.plot(x => Math.exp(-x * x / (4 * dx * dx)) * Math.cos(k0 * x), { color: 'a', width: 1.8, n: 900 });
  v.plot(x => Math.exp(-x * x / (4 * dx * dx)), { color: 'a', style: 'dash', width: 1.4 });
  v.plot(x => -Math.exp(-x * x / (4 * dx * dx)), { color: 'a', style: 'dash', width: 1.4 });
  v.plot(x => Math.exp(-x * x / (2 * dx * dx)), { color: 'b', style: 'long', width: 2.5 });
  const y = 1.17; v.line([[-dx, y], [dx, y]], { color: 'ink', width: 2 }); for (const s of [-dx, dx]) v.line([[s, y - 0.05], [s, y + 0.05]], { color: 'ink', width: 2 });
  v.text('2Δx', dx + 0.15, y, { size: 15 });
  cv.text('位置', 60, 22, { size: 15, bold: true });
  // 右：波数の分布（|φ(k)|² は、はば Δk の正規分布）
  const w = cv.view({ x0: k0 - 3, x1: k0 + 3, y0: 0, y1: 1.3, box: [570, 30, 280, 340] });
  w.axes({ xt: [5, 6, 7, 8, 9, 10, 11], yt: [], xl: 'k（nm⁻¹）', grid: false, ay: k0 - 3 });
  w.area(k => Math.exp(-(k - k0) * (k - k0) / (2 * dk * dk)), k0 - 3, k0 + 3, { fill: 'b', alpha: 0.15 });
  w.plot(k => Math.exp(-(k - k0) * (k - k0) / (2 * dk * dk)), { color: 'b', style: 'long', width: 2.5 });
  const y2 = 1.17; w.line([[k0 - dk, y2], [k0 + dk, y2]], { color: 'ink', width: 2 }); for (const s of [k0 - dk, k0 + dk]) w.line([[s, y2 - 0.05], [s, y2 + 0.05]], { color: 'ink', width: 2 });
  w.text('2Δk', Math.min(k0 + dk + 0.15, k0 + 2.2), y2 - (k0 + dk + 0.15 > k0 + 2.2 ? 0.12 : 0), { size: 15, bg: true });
  cv.text('波数（運動量 p＝ħk）', 580, 22, { size: 15, bold: true });
}
