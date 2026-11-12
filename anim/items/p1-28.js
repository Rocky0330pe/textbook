// @id p1-28
// @title 並流と向流：熱交換器の中の温度
// @vol 物理2
// @from 物理 熱-13 ⑧⑨⑩（p2-13 の二重管の熱交換器・対数平均温度差・温度効率と NTU）／熱-11・12 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 本の例：熱い流体 90 ℃（Ch＝2100 W/K）、冷たい流体 20 ℃（Cc＝2520 W/K）、UA＝1765 W/K の並流で 90→60 ℃・20→45 ℃。
//   向流の例（Ch＝Cc、90→50 ℃・20→60 ℃）は、Ch＝Cc＝2100 W/K・UA＝2800 W/K で同じになる。
//   温度効率：向流 (1−x)/(1−Cr x)、x＝e^(−NTU(1−Cr))、並流 (1−e^(−NTU(1+Cr)))/(1+Cr)。
A.item({
  id: 'p1-28', title: '並流と向流：熱交換器の中の温度',
  from: '物理 第2巻『熱学』 熱-13 ⑧⑨⑩ の図から（二重管の熱交換器、温度効率と NTU）',
  W: 880, H: 440,
  state: { flow: 'par', UA: 1765, Cc: 2520, Ch: 2100, t: 0, NTU: 2, Cr: 0.5 },
  scenes: [
    {
      key: 'koukan', label: '① 管にそった温度',
      lead: '内側の管を熱い流体（90 ℃）、外側を冷たい流体（20 ℃）が流れます。同じ向きに流す（並流）か、反対の向きに流す（向流）かで、管にそった温度はどうちがうでしょう。',
      note: '温度差は、管にそって「同じ割合で」変わります（6-4 の冷めるお湯と同じ形）。だから、熱の流れは**対数平均温度差** $\\Delta T_{\\mathrm{lm}}=\\frac{\\Delta T_1-\\Delta T_2}{\\ln(\\Delta T_1/\\Delta T_2)}$ で決まります。**向流では、冷たい流体の出口を、熱い流体の出口より熱くできます**（本の例：60 ℃と 50 ℃）。並流ではできません。',
      miss: '並流で、冷たい流体を熱い流体の出口より熱くすることはできません。管をどんなに長くしても、2つの温度は出口で同じ温度に近づくだけです（本の例題9の(2)）。',
      legend: [['熱い流体の温度', { color: 'b' }], ['冷たい流体の温度', { color: 'a', style: 'dash' }], ['流れの向き', { color: 'ink', shape: 'tri', noline: true }]],
      controls: [
        { seg: 'flow', label: '流し方', options: [['par', '並流'], ['cnt', '向流']] },
        { range: 'UA', label: '大きさ $UA$', min: 300, max: 8000, step: 5, fmt: v => Math.round(v) + ' W/K' },
        { range: 'Cc', label: '冷たい流体 $C_{\\mathrm c}$', min: 1000, max: 6000, step: 10, fmt: v => Math.round(v) + ' W/K' },
        { button: '本の並流の例', act(st) { st.flow = 'par'; st.UA = 1765; st.Cc = 2520; st.Ch = 2100; } },
        { button: '本の向流の例', act(st) { st.flow = 'cnt'; st.UA = 2800; st.Cc = 2100; st.Ch = 2100; } }
      ],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; },
      draw(cv, st) { drawHX(cv, st); },
      readout: st => { const r = hx(st); return `熱い流体 90 → <b>${A.num(r.ThOut, 1)} ℃</b>${SP}冷たい流体 20 → <b>${A.num(r.TcOut, 1)} ℃</b>${SP}熱の流れ ${A.num(r.Q / 1000, 1)} kW${SP}$\\Delta T_{\\mathrm{lm}}$ ＝ ${A.num(r.lm, 1)} K`; }
    },
    {
      key: 'ntu', label: '② 温度効率と NTU',
      lead: '熱交換器を大きくしていく（NTU を増やす）と、温度効率はどこまで上がるでしょう。向流と並流をくらべます。',
      note: '$C_{\\mathrm r}=0.5$ で NTU を 2 から 4 にすると、向流は 0.77 から 0.93 へ上がりますが、並流は 0.63 から 0.67 にしかなりません（並流の上限は $1/(1+C_{\\mathrm r})$）。片方がわいている・凝縮しているとき（$C_{\\mathrm r}=0$）は、どちらも $1-e^{-\\mathrm{NTU}}$ です。',
      miss: '面積を2倍にしても、移る熱は2倍になりません。温度差が小さくなっていくので、増え方はだんだん小さくなります。',
      legend: [['向流', { color: 'a' }], ['並流', { color: 'b', style: 'dash' }], ['$C_{\\mathrm r}=0$（どちらも）', { color: 'c', style: 'dot' }], ['いまの NTU', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ range: 'NTU', label: 'NTU', min: 0, max: 5, step: 0.05, d: 2 }, { range: 'Cr', label: '$C_{\\mathrm r}=C_{\\min}/C_{\\max}$', min: 0, max: 1, step: 0.05, d: 2 }],
      draw(cv, st) { drawNTU(cv, st); },
      readout: st => `NTU ＝ ${A.num(st.NTU, 2)}・$C_{\\mathrm r}$ ＝ ${A.num(st.Cr, 2)}${SP}向流 <b>${A.num(effC(st.NTU, st.Cr), 3)}</b>${SP}並流 <b>${A.num(effP(st.NTU, st.Cr), 3)}</b>（上限 ${A.num(1 / (1 + st.Cr), 2)}）`
    }
  ]
});

// ---------- 計算 ----------
function effC(N, Cr) { if (Math.abs(1 - Cr) < 1e-9) return N / (1 + N); const x = Math.exp(-N * (1 - Cr)); return (1 - x) / (1 - Cr * x); }
function effP(N, Cr) { return (1 - Math.exp(-N * (1 + Cr))) / (1 + Cr); }
function hx(st) {
  const Ch = st.Ch, Cc = st.Cc, Cmin = Math.min(Ch, Cc), Cr = Cmin / Math.max(Ch, Cc), N = st.UA / Cmin;
  const eff = st.flow === 'par' ? effP(N, Cr) : effC(N, Cr), Q = eff * Cmin * 70;
  const ThOut = 90 - Q / Ch, TcOut = 20 + Q / Cc;
  const d1 = st.flow === 'par' ? 70 : 90 - TcOut, d2 = st.flow === 'par' ? ThOut - TcOut : ThOut - 20;
  const lm = Math.abs(d1 - d2) < 1e-6 ? d1 : (d1 - d2) / Math.log(d1 / d2);
  // a（0〜1：熱い流体の入口から測った面積の割合）での温度
  const M = st.flow === 'par' ? 1 / Ch + 1 / Cc : 1 / Ch - 1 / Cc;
  const qa = a => Math.abs(M) < 1e-12 ? st.UA * d1 * a : d1 * (1 - Math.exp(-M * st.UA * a)) / M;
  const Th = a => 90 - qa(a) / Ch, Tc = a => st.flow === 'par' ? 20 + qa(a) / Cc : TcOut - qa(a) / Cc;
  return { Q, ThOut, TcOut, lm, Th, Tc, eff };
}
function tcol(T) { // 20 ℃（青）〜90 ℃（赤）を色に
  const u = A.clamp((T - 20) / 70, 0, 1), c0 = [70, 120, 215], c1 = [215, 70, 40];
  return `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * u)).join(',')})`;
}

// ---------- 絵 ----------
function drawHX(cv, st) {
  const r = hx(st), x0 = 140, x1 = 750, N = 60, w = (x1 - x0) / N;
  const yc = 95, ri = 16, ro = 40;
  for (let i = 0; i < N; i++) {
    const a = (i + 0.5) / N;
    cv.rect(x0 + i * w, yc - ro, w + 0.6, ro - ri, { fill: tcol(r.Tc(a)), alpha: 0.85 });
    cv.rect(x0 + i * w, yc + ri, w + 0.6, ro - ri, { fill: tcol(r.Tc(a)), alpha: 0.85 });
    cv.rect(x0 + i * w, yc - ri, w + 0.6, 2 * ri, { fill: tcol(r.Th(a)), alpha: 0.95 });
  }
  for (const y of [yc - ro, yc - ri, yc + ri, yc + ro]) cv.line([[x0, y], [x1, y]], { color: 'ink', width: 2 });
  // 流れの粒
  const sp = 0.12;
  for (let k = 0; k < 8; k++) {
    const f = ((st.t * sp + k / 8) % 1);
    cv.dot(x0 + f * (x1 - x0), yc, { color: 'ink', shape: 'tri', r: 4 });
    const fc = st.flow === 'par' ? f : 1 - f;
    cv.dot(x0 + fc * (x1 - x0), yc - (ro + ri) / 2, { color: 'ink', shape: 'circle', r: 3 });
    cv.dot(x0 + fc * (x1 - x0), yc + (ro + ri) / 2, { color: 'ink', shape: 'circle', r: 3 });
  }
  cv.text('熱い 90 ℃ →', x0 - 6, yc, { align: 'right', size: 14, bold: true, color: 'b' });
  if (st.flow === 'par') { cv.text('冷たい 20 ℃ →', x0 - 6, yc - ro + 4, { align: 'right', size: 14, color: 'a', bold: true }); cv.text(`→ ${A.num(r.TcOut, 1)} ℃`, x1 + 6, yc - ro + 4, { size: 14, color: 'a', bold: true }); }
  else { cv.text('← 冷たい 20 ℃', x1 + 6, yc - ro + 4, { size: 14, color: 'a', bold: true }); cv.text(`${A.num(r.TcOut, 1)} ℃ ←`, x0 - 6, yc - ro + 4, { align: 'right', size: 14, color: 'a', bold: true }); }
  cv.text(`→ ${A.num(r.ThOut, 1)} ℃`, x1 + 6, yc, { size: 14, color: 'b', bold: true });
  cv.text('色：赤いほど熱い、青いほど冷たい', 440, yc + ro + 16, { align: 'center', size: 14, color: 'sub' });
  // 温度のグラフ
  const g = cv.view({ x0: 0, x1: 1, y0: 10, y1: 100, box: [140, 175, 610, 225] });
  g.axes({ xt: [0, 1], yt: [20, 40, 60, 80, 100], xl: '位置（左：熱い流体の入口）', yl: '温度（℃）', xfmt: x => x ? '出口' : '入口', ax: 10, ay: 0, zero: true });
  g.plot(r.Th, { color: 'b', width: 3.5, x0: 0, x1: 1 });
  g.plot(r.Tc, { color: 'a', width: 3.5, style: 'dash', x0: 0, x1: 1 });
  g.line([[0, r.Th(0)], [0, r.Tc(0)]], { color: 'sub', width: 1.5, style: 'dot' }); g.line([[1, r.Th(1)], [1, r.Tc(1)]], { color: 'sub', width: 1.5, style: 'dot' });
  cv.text(`ΔT₁ ＝ ${A.num(r.Th(0) - r.Tc(0), 1)} K`, g.X(0) + 8, g.Y((r.Th(0) + r.Tc(0)) / 2), { size: 15, bg: true });
  cv.text(`ΔT₂ ＝ ${A.num(r.Th(1) - r.Tc(1), 1)} K`, g.X(1) - 8, g.Y((r.Th(1) + r.Tc(1)) / 2), { size: 15, align: 'right', bg: true });
  if (st.flow === 'cnt' && r.TcOut > r.ThOut + 0.05) cv.text(`冷たい流体の出口 ${A.num(r.TcOut, 1)} ℃ ＞ 熱い流体の出口 ${A.num(r.ThOut, 1)} ℃`, 440, 190, { align: 'center', size: 15, bold: true, color: 'd', bg: true });
}
function drawNTU(cv, st) {
  const g = cv.view({ x0: 0, x1: 5, y0: 0, y1: 1.05, box: [80, 30, 760, 360] });
  g.axes({ xt: [0, 1, 2, 3, 4, 5], yt: [0.2, 0.4, 0.6, 0.8, 1], xl: 'NTU', yl: '温度効率 ηT', zero: true, yfmt: v => A.num(v, 1) });
  g.plot(N => 1 - Math.exp(-N), { color: 'c', width: 2.5, style: 'dot' });
  g.plot(N => effC(N, st.Cr), { color: 'a', width: 3.5 });
  g.plot(N => effP(N, st.Cr), { color: 'b', width: 3, style: 'dash' });
  g.line([[0, 1 / (1 + st.Cr)], [5, 1 / (1 + st.Cr)]], { color: 'sub', width: 1, style: 'dot' });
  cv.text(`並流の上限 ${A.num(1 / (1 + st.Cr), 2)}`, g.X(5) - 4, g.Y(1 / (1 + st.Cr)) + 14, { size: 14, align: 'right', color: 'sub' });
  if (Math.abs(st.Cr - 0.5) < 1e-6) for (const N of [2, 4]) { g.dot(N, effC(N, 0.5), { color: 'sub', r: 4, shape: 'square' }); g.dot(N, effP(N, 0.5), { color: 'sub', r: 4, shape: 'square' }); }
  g.line([[st.NTU, 0], [st.NTU, 1.02]], { color: 'sub', width: 1.5, style: 'dot' });
  g.dot(st.NTU, effC(st.NTU, st.Cr), { color: 'a', r: 7 }); g.dot(st.NTU, effP(st.NTU, st.Cr), { color: 'b', r: 7, shape: 'diamond' });
  g.text('向流', 3.3, effC(3.3, st.Cr) + 0.05, { size: 16, bold: true, color: 'a' });
  g.text('並流', 3.3, effP(3.3, st.Cr) - 0.06, { size: 16, bold: true, color: 'b' });
}
