// @id p2-32
// @title pn 接合：坂の高さと電流、LED
// @vol 物理5
// @from 物理 原-9 ⑥⑦⑨（p5-09 つり合った pn 接合・電圧をかけた坂・ダイオードの電流と電圧・LED の帯の図）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：ケイ素、300 K、k_BT/e＝0.0259 V、内蔵電位 V_bi≈0.72 V（N_a＝N_d＝10¹⁶ cm⁻³、例題7。空乏層 0.43 μm）、
// 禁制帯の幅 1.12 eV、ダイオードの式 I＝I_s(e^{eV/k_BT}−1)、I_s＝1×10⁻¹⁴ A（例題8：1 mA で 0.66 V、10倍で 0.06 V）。
// LED：InGaN 約2.7 eV（青・約460 nm）、約2.3 eV（緑・約540 nm）、AlGaInP 約1.9 eV（赤・約650 nm）、GaAs 1.42 eV（赤外・約870 nm）。
const KT = 0.0259, VBI = 0.72, IS = 1e-14, EG = 1.12, QE = 1.602e-19;
const cur = V => IS * (Math.exp(V / KT) - 1);
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = (v, d = 1) => { const e = Math.floor(Math.log10(Math.abs(v))), m = v / 10 ** e; return A.num(m, d) + '×10' + String(e).split('').map(c => SUP[c]).join(''); };
function amp(I) {   // 電流を A・mA・μA・nA・pA で
  const a = Math.abs(I), s = I < 0 ? '−' : '';
  if (a === 0) return '0';
  for (const [u, f] of [['A', 1], ['mA', 1e-3], ['μA', 1e-6], ['nA', 1e-9], ['pA', 1e-12], ['fA', 1e-15]]) if (a >= f) return s + A.num(a / f, a / f < 10 ? 2 : a / f < 100 ? 1 : 0) + ' ' + u;
  return s + A.num(a / 1e-15, 3) + ' fA';
}
const LEDS = { R: ['赤', 1.9, 650], G: ['緑', 2.3, 540], B: ['青', 2.7, 460], I: ['赤外', 1.42, 870] };
const LEDCOL = { R: 'rgb(220,50,40)', G: 'rgb(40,170,70)', B: 'rgb(50,90,230)', I: 'sub' };

// 帯の下のはしの形（段の形の接合。空乏層の中は放物線。空乏層の片側のはば 0.215 μm×√((V_bi−V)/V_bi)）
function hill(x, h, w) {   // 0（p形の側）→ h だけ下がる（n形の側）
  if (w < 1e-6) return x < 0 ? 0 : h;
  if (x <= -w) return 0;
  if (x <= 0) return h * (x + w) ** 2 / (2 * w * w);
  if (x <= w) return h * (1 - (w - x) ** 2 / (2 * w * w));
  return h;
}

const J = { x0: 40, x1: 560, L: -1, R: 1 };       // 位置 −1〜1 μm
const jx = x => J.x0 + (x - J.L) / (J.R - J.L) * (J.x1 - J.x0);
const bright = st => { const Eg = LEDS[st.led][1]; return Math.min(1, Math.max(0, Math.exp((st.V - Eg) / 0.05))); };
A.item({
  id: 'p2-32', title: 'pn 接合：坂の高さと電流、LED',
  from: '物理 第5巻 原-9 ⑥⑦⑨ の図から（pn 接合の坂・順方向と逆方向・ダイオードの電流と電圧・LED）',
  W: 880, H: 430,
  state: { V: 0, t: 0, led: 'R' },
  scenes: [
    {
      key: 'saka', label: '① 電圧で坂が変わる',
      lead: 'pn 接合に電圧 $V$ をかけます（p形の側を＋にする向きが正：順方向）。坂の高さと、こえる電子の数を見ましょう。',
      note: 'n形の電子から見ると、p形の伝導帯は高さ $e(V_{\\mathrm{bi}}-V)$ の坂の上にあります（つり合いでは $V_{\\mathrm{bi}}$≈0.72 V）。坂をこえられる電子の数は $e^{-(\\text{坂の高さ})/(k_{\\mathrm B}T)}$ に比例するので、順方向に $V$ 上げると $e^{eV/(k_{\\mathrm B}T)}$ 倍に増えます。0.0259 V ごとに約2.7倍、約0.06 V ごとに10倍です。逆方向では坂が高くなり、ほとんどこえられません。',
      legend: [['伝導帯の下のはし・価電子帯の上のはし', { color: 'ink' }], ['電子', { color: 'a', shape: 'circle', noline: true }], ['正孔', { color: 'b', shape: 'diamond', noline: true }], ['空乏層', { color: 'sub', shape: 'square', noline: true }]],
      controls: [{ range: 'V', label: '電圧 $V$〔V〕', min: -0.4, max: 0.75, step: 0.01, d: 2, on: st => { st.ev = []; } }],
      init: reset,
      step: stepCarriers,
      draw: drawJunction,
      readout: st => { const I = cur(st.V); return `坂の高さ ${A.num(VBI - st.V, 2)} eV${GAP}電流 $I$ ＝ <b>${amp(I)}</b>${GAP}${Math.abs(st.V) < 0.005 ? 'つり合い：こえる数ともどる数が同じで、電流0' : I > 0 ? '1秒に約 ' + sci(I / QE) + ' 個の電子が、正味でこえる' : '逆方向：ほぼ $-I_{\\mathrm s}$ のまま'}`; }
    },
    {
      key: 'iv', label: '② 0.6 V までゼロ？',
      lead: '同じダイオードの電流を、ふつうのグラフと、たて軸を対数にしたグラフで見ます。▶ で電圧が上がります。',
      note: 'ふつうのグラフでは、0.6 V あたりから急に流れ始めるように見えます。片対数のグラフでは、順方向はなめらかな直線で、約 60 mV ごとに電流が10倍です（例題8：1 mA で 0.66 V）。立ち上がりは、指数関数がふつうの目もりでそう見えるだけです。',
      miss: '「0.6 V より小さい電圧では、電流は0」はまちがいです。電流は 0.06 V ごとに10倍ずつ、指数関数で増え続け、0.6 V あたりで mA ほどの目に見える大きさになるだけです。',
      legend: [['$I=I_{\\mathrm s}(e^{eV/k_{\\mathrm B}T}-1)$（ふつうの目もり）', { color: 'a' }], ['同じ式（片対数の目もり）', { color: 'b', style: 'dash' }], ['いまの電圧', { color: 'c', shape: 'diamond', noline: true }]],
      state: { V: 0.45 },
      controls: [{ range: 'V', label: '電圧 $V$〔V〕', min: -0.4, max: 0.78, step: 0.005, d: 3 }],
      step(st, dt) { st.V += dt * 0.05; if (st.V >= 0.78) { st.V = 0.78; return false; } },
      draw: drawIV,
      readout: st => `$V$ ＝ ${A.num(st.V, 3)} V${GAP}$I$ ＝ <b>${amp(cur(st.V))}</b>${GAP}（${A.num(st.V + 0.0596, 3)} V なら ${amp(cur(st.V + 0.0596))}：60 mV で10倍）`
    },
    {
      key: 'led', label: '③ LED で光る',
      lead: 'LED の材料と電圧を変えます。光の色は、何で決まるでしょう。',
      note: '順方向に電圧をかけると、n形から電子が、p形から正孔が接合に入り、出会うと電子が $E_{\\mathrm g}$ だけ落ちて、光子を1個出します。光子のエネルギーは $hf\\approx E_{\\mathrm g}$ なので、波長は $\\lambda\\approx1240/E_{\\mathrm g}$〔nm〕。光らせるには、およそ $E_{\\mathrm g}/e$ の電圧が要ります。',
      miss: '「LED に大きな電圧をかけると、青くなる」はまちがいです。色は材料の $E_{\\mathrm g}$ で決まります。電圧を上げると、電流が増えて明るく（光子の数が多く）なるだけです。',
      legend: [['電子', { color: 'a', shape: 'circle', noline: true }], ['正孔', { color: 'b', shape: 'diamond', noline: true }], ['光子（波の線。色は光の色、赤外は灰色）', { color: 'e' }]],
      state: { V: 2.0, led: 'R' },
      controls: [{ seg: 'led', label: '材料', options: [['R', '赤 1.9 eV'], ['G', '緑 2.3 eV'], ['B', '青 2.7 eV'], ['I', 'GaAs 1.42 eV']], on: st => { st.ev = []; } }, { range: 'V', label: '電圧 $V$〔V〕', min: 0, max: 3.2, step: 0.02, d: 2 }],
      init: reset,
      step: stepLED,
      draw: drawLED,
      readout: st => { const L = LEDS[st.led], b = bright(st); return `$E_{\\mathrm g}$ ＝ ${L[1]} eV → 光子1個 ${L[1]} eV、波長 1240 ÷ ${L[1]} ≒ <b>${Math.round(1240 / L[1] / 10) * 10} nm（${L[0]}）</b>${GAP}明るさ（目安）：${b < 0.02 ? '光らない' : b < 0.3 ? '弱い' : b < 0.8 ? '中くらい' : '明るい'}`; }
    }
  ]
});

function reset(st) { st.ev = []; st.acc = 0; st.t = 0; st.rng = A.rng(32); }

// ---------- ① ----------
function stepCarriers(st, dt) {
  st.t += dt;
  const rate = Math.min(14, 3 * Math.max(0, cur(st.V)) / 1e-3);
  st.acc += dt * rate;
  while (st.acc >= 1) { st.acc -= 1; st.ev.push({ k: st.ev.length % 2 ? 'h' : 'e', s: 0, o: st.rng() }); }
  for (const e of st.ev) e.s += dt * 0.6;
  st.ev = st.ev.filter(e => e.s < 1.25);
}
function bandsGeom(st, Vbi, Eg, V) {
  const h = Math.max(0, Vbi - V), w = 0.215 * Math.sqrt(h / 0.72);
  const top = 70, sc = 150;                      // 1 eV＝150 px
  const Ec = x => top + sc * hill(x, h, w), Ev = x => Ec(x) + sc * Eg;
  return { h, w, Ec, Ev, sc, top };
}
function drawBands(cv, st, G, Eg) {
  const { w, Ec, Ev } = G;
  cv.rect(jx(-w), 40, jx(w) - jx(-w), 340, { fill: 'sub', alpha: 0.15 });
  cv.rect(J.x0, 40, jx(0) - J.x0, 340, { fill: 'b', alpha: 0.05 }); cv.rect(jx(0), 40, J.x1 - jx(0), 340, { fill: 'a', alpha: 0.05 });
  const pc = [], pv = [];
  for (let k = 0; k <= 200; k++) { const x = J.L + (J.R - J.L) * k / 200; pc.push([jx(x), Ec(x)]); pv.push([jx(x), Ev(x)]); }
  cv.line(pc, { color: 'ink', width: 3 }); cv.line(pv, { color: 'ink', width: 3 });
  cv.text('p形', jx(-0.6), 30, { align: 'center', size: 16, bold: true }); cv.text('n形', jx(0.6), 30, { align: 'center', size: 16, bold: true });
  cv.text('空乏層', jx(0), 395, { align: 'center', size: 14, color: 'sub' });
  cv.text('伝導帯', J.x0 + 4, Ec(J.L) - 12, { size: 14, color: 'sub' }); cv.text('価電子帯', J.x1 - 4, Ev(J.R) + 16, { align: 'right', size: 14, color: 'sub' });
  // 坂の高さ
  if (G.h > 0.08) { const xa = jx(-0.86); cv.line([[xa - 20, Ec(0.9)], [J.x1, Ec(0.9)]], { color: 'sub', width: 1, style: 'dot' }); cv.arrow(xa, Ec(0.9), xa, Ec(-0.9) + 1, { color: 'ink', width: 1.5, head: 8 }); cv.arrow(xa, Ec(-0.9) + 1, xa, Ec(0.9), { color: 'ink', width: 1.5, head: 8 }); cv.text('坂 ' + A.num(G.h, 2) + ' eV', xa + 6, (Ec(0.9) + Ec(-0.9)) / 2, { size: 15, bg: true }); }
  // 多数キャリア（ゆれる）
  for (let i = 0; i < 12; i++) { const x = 0.32 + 0.6 * ((i * 0.37) % 1), j = Math.sin(st.t * 3 + i * 1.7) * 4; cv.dot(jx(x), Ec(x) + 9 + (i % 3) * 7 + j * 0.5, { color: 'a', r: 5 }); }
  for (let i = 0; i < 12; i++) { const x = -0.32 - 0.6 * ((i * 0.37) % 1), j = Math.sin(st.t * 3 + i * 1.3) * 4; cv.dot(jx(x), Ev(x) - 9 - (i % 3) * 7 + j * 0.5, { color: 'b', shape: 'diamond', r: 5, open: true }); }
  void Eg;
}
function drawCrossers(cv, st, G, onMeet) {
  const { Ec, Ev } = G;
  for (const e of st.ev) {
    if (e.k === 'e') { const x = 0.35 - 1.0 * Math.min(1, e.s), y = Ec(x) + 6 + e.o * 6; if (e.s < 1) cv.dot(jx(x), y, { color: 'a', r: 6 }); else if (onMeet) onMeet(e, jx(x), y); }
    else { const x = -0.35 + 1.0 * Math.min(1, e.s), y = Ev(x) - 6 - e.o * 6; if (e.s < 1) cv.dot(jx(x), y, { color: 'b', shape: 'diamond', r: 6, open: true }); }
  }
}
function drawJunction(cv, st) {
  const G = bandsGeom(st, VBI, EG, st.V);
  drawBands(cv, st, G, EG);
  drawCrossers(cv, st, G, (e, x, y) => { if (e.s < 1.2) cv.circle(x, y, 6 + 20 * (e.s - 1), { color: 'a', width: 1, alpha: 1 - 5 * (e.s - 1) }); });
  cv.text(st.V > 0.005 ? '順方向：坂が低くなる' : st.V < -0.005 ? '逆方向：坂が高くなる' : 'つり合い（V＝0）', 300, 410, { align: 'center', size: 15, color: 'sub' });
  // 右：電流のメーター（10倍ごとの目もり）
  const m = cv.view({ x0: 0, x1: 1, y0: -15, y1: 0, box: [680, 40, 60, 340] });
  for (let e = -15; e <= 0; e += 3) { m.line([[0, e], [0.25, e]], { color: 'sub', width: 1 }); m.text('10' + String(e).split('').map(c => SUP[c]).join('') + ' A', -0.1, e, { align: 'right', size: 14, color: 'sub' }); }
  m.line([[0, -15], [0, 0]], { color: 'sub', width: 1.5 });
  const I = cur(st.V), y = I > 1e-15 ? Math.min(0, Math.log10(I)) : -15;
  m.poly([[0.1, -15], [0.6, -15], [0.6, y], [0.1, y]], { fill: 'a', alpha: 0.5, color: 'a', width: 1 });
  m.text(Math.abs(st.V) < 0.005 ? '0' : I > 0 ? amp(I) : '逆向き ' + amp(I), 0.7, y, { size: 14, bg: true });
  m.text('電流（10倍ごと）', 0.5, 1.3, { align: 'center', size: 14 });
}

// ---------- ② ----------
function drawIV(cv, st) {
  const v = cv.view({ x0: -0.42, x1: 0.8, y0: -0.5, y1: 11, box: [60, 30, 330, 340] });
  v.axes({ xt: [-0.4, 0, 0.4, 0.8], yt: [2, 4, 6, 8, 10], xl: 'V（V）', yl: 'I（mA）' });
  v.plot(V => cur(V) * 1e3, { color: 'a', width: 3 });
  v.dot(st.V, Math.min(11, cur(st.V) * 1e3), { color: 'c', shape: 'diamond', r: 8 });
  v.text('逆はほぼ0', -0.38, 0.9, { size: 14 });
  const g = cv.view({ x0: 0.45, x1: 0.8, y0: -3, y1: 3, box: [500, 30, 340, 340] });
  g.axes({ xt: [0.5, 0.6, 0.7, 0.8], yt: [-3, -2, -1, 0, 1, 2, 3], yfmt: y => ['0.001', '0.01', '0.1', '1', '10', '100', '1000'][y + 3], xl: 'V（V）', yl: 'I（mA）', ay: 0.45, ax: -3 });
  g.plot(V => Math.log10(cur(V) * 1e3), { color: 'b', width: 3, style: 'dash' });
  g.line([[0.6, Math.log10(cur(0.6) * 1e3)], [0.6596, Math.log10(cur(0.6) * 1e3)], [0.6596, Math.log10(cur(0.6596) * 1e3)]], { color: 'ink', width: 1.5 });
  g.text('60 mV で10倍', 0.61, Math.log10(cur(0.6) * 1e3) - 0.3, { size: 14 });
  if (st.V >= 0.45) g.dot(st.V, Math.max(-3, Math.min(3, Math.log10(Math.max(1e-20, cur(st.V)) * 1e3))), { color: 'c', shape: 'diamond', r: 8 });
  else g.text('いまの電圧は 0.45 V より左', 0.47, 2.6, { size: 14, color: 'c' });
}

// ---------- ③ ----------
function stepLED(st, dt) {
  st.t += dt;
  st.acc += dt * 14 * bright(st);
  while (st.acc >= 1) { st.acc -= 1; st.ev.push({ k: 'e', s: 0, o: st.rng() }, { k: 'h', s: 0, o: st.rng() }); }
  for (const e of st.ev) e.s += dt * 0.6;
  st.ev = st.ev.filter(e => e.s < 2.0);
}
function drawLED(cv, st) {
  const L = LEDS[st.led], Eg = L[1], col = LEDCOL[st.led];
  const Gs = bandsGeom(st, Eg - 0.1, Eg, st.V);
  // 縦の目もりを、禁制帯の幅が入るように縮める
  const k = Math.min(1, 300 / ((Eg + Gs.h) * 150 + 10));
  const Ec = x => 60 + (Gs.Ec(x) - 70) * k, Ev = x => Ec(x) + 150 * k * Eg;
  const G2 = { h: Gs.h, w: Gs.w, Ec, Ev };
  drawBands(cv, st, G2, Eg);
  // 禁制帯の幅
  const xg = jx(-0.12);
  cv.arrow(xg, Ec(-0.12) + 4, xg, Ev(-0.12) - 4, { color: 'sub', width: 1.2, head: 7 }); cv.arrow(xg, Ev(-0.12) - 4, xg, Ec(-0.12) + 4, { color: 'sub', width: 1.2, head: 7 });
  cv.text('Eg ＝ ' + Eg + ' eV', xg - 6, (Ec(-0.12) + Ev(-0.12)) / 2, { align: 'right', size: 15, bg: true });
  // 電子：n形から接合へ → 落ちる → 光子が右へ。正孔：p形から接合へ
  const xm = -0.05;
  for (const e of st.ev) {
    if (e.k === 'h') { if (e.s < 0.8) { const x = -0.6 + (xm + 0.6) * e.s / 0.8; cv.dot(jx(x), Ev(x) - 6 - e.o * 4, { color: 'b', shape: 'diamond', r: 6, open: true }); } continue; }
    if (e.s < 0.6) { const x = 0.6 + (xm - 0.6) * e.s / 0.6; cv.dot(jx(x), Ec(x) + 6 + e.o * 4, { color: 'a', r: 6 }); }
    else if (e.s < 0.8) { const u = (e.s - 0.6) / 0.2, y = Ec(xm) + 6 + (Ev(xm) - 12 - Ec(xm)) * u; cv.dot(jx(xm), y, { color: 'a', r: 6 }); }
    else if (e.s < 2.0) {
      const u = (e.s - 0.8) / 1.2, y0 = (Ec(xm) + Ev(xm)) / 2 + (e.o - 0.5) * 0.45 * (Ev(xm) - Ec(xm)), ang = 0;
      const px = jx(xm) + 600 * u * Math.cos(ang), py = y0 + 600 * u * Math.sin(ang);
      if (px < 650) { const pts = []; for (let q = 0; q <= 16; q++) { const v = q / 16; pts.push([px - 34 * v * Math.cos(ang) - 5 * Math.sin(v * 4 * Math.PI) * Math.sin(ang), py - 34 * v * Math.sin(ang) + 5 * Math.sin(v * 4 * Math.PI) * Math.cos(ang)]); } cv.line(pts, { color: col, width: 3 }); }
    }
  }
  // 右：光の色と明るさ
  const b = bright(st);
  cv.circle(740, 150, 60, { fill: col, alpha: 0.08 + 0.7 * b, color: 'sub', width: 1.5 });
  cv.text(L[0] + '（' + Math.round(1240 / Eg / 10) * 10 + ' nm）', 740, 240, { align: 'center', size: 16, bold: true });
  cv.text('光子1個 ＝ Eg ＝ ' + Eg + ' eV', 740, 264, { align: 'center', size: 15 });
  cv.text('明るさ（目安）', 740, 300, { align: 'center', size: 14, color: 'sub' });
  cv.rect(670, 312, 140, 16, { color: 'sub', width: 1 }); cv.rect(670, 312, 140 * b, 16, { fill: 'e', alpha: 0.7 });
  cv.text('光り始めるのは、およそ', 740, 352, { align: 'center', size: 14, color: 'sub' });
  cv.text('Eg/e ＝ ' + Eg + ' V から', 740, 372, { align: 'center', size: 14, color: 'sub' });
  if (st.led === 'I') cv.text('赤外線は目に見えない', 740, 70, { align: 'center', size: 14, color: 'sub' });
}
