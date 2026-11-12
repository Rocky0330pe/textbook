// @id p1-23
// @title 4ストロークエンジンと指圧線図
// @vol 物理2
// @from 物理 熱-7 ①③（p2-07 の4ストローク・指圧線図・オットーサイクル・圧縮比）／力-7 ⑥、熱-2 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 空気標準サイクル（本と同じ）：空気 1 kg、γ＝1.40、cv＝0.718 kJ/(kg·K)、R＝0.287 kJ/(kg·K)、
//   はじめ 300 K・100 kPa、2→3 で q入＝1500 kJ/kg（本の Python の値）。η＝1−1/ε^0.4（5：0.475、10：0.602、20：0.698）。
// 吸気・排気の細い輪は、見えるように大気圧より少し下・少し上にかいた（実際の差はもっと小さい）。
const GAM = 1.4, CVA = 0.718, RA = 0.287, T1 = 300, P1 = 100, QIN = 1500, LR = 3.5;
A.item({
  id: 'p1-23', title: '4ストロークエンジンと指圧線図',
  from: '物理 第2巻『熱学』 熱-7 ①③ の図から（4ストローク、指圧線図、オットーサイクル）',
  W: 880, H: 440,
  state: { eps: 8, ph: 0, dies: false },
  scenes: [
    {
      key: 'stroke', label: '① 4つの行程と線図',
      lead: 'ピストンが2往復（クランクが2回転）する間に、吸気→圧縮→燃焼・膨張→排気。行程と、$p$-$V$ 図の点の動きを見くらべましょう。',
      note: 'ピストンがいちばん上（上死点）で体積 $V_2$、いちばん下（下死点）で $V_1$。圧縮で押し縮め、上死点で燃えて圧力が急に上がり、膨張でピストンを押します（仕事をする）。1回の仕事は閉じた道が囲む面積で、吸気と排気の細い輪の面積はわずかです。',
      miss: 'ピストンが2往復するうち、仕事を出すのは「燃焼・膨張」の1行程だけです。ほかの3行程の間は、はずみ車にたくわえた回転の勢いでピストンを動かしています。',
      legend: [['いまの行程の道', { color: 'b' }], ['1周の道（オットーサイクル）', { color: 'sub', style: 'dash' }], ['吸気弁・排気弁', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ range: 'eps', label: '圧縮比 $\\varepsilon$', min: 4, max: 20, step: 0.5, d: 1 }],
      init(st) { st.ph = 0; },
      step(st, dt) { st.ph = (st.ph + dt * 70) % 720; },
      draw(cv, st) { drawEngine(cv, st); },
      readout: st => { const s = at(st); return `クランクの角 ${Math.round(st.ph)}°${SP}${s.name}${SP}圧力 ${A.num(s.p / 1000, 2)} MPa${s.k === 1 || s.k === 2 ? '・温度 ' + Math.round(s.T) + ' K' : ''}`; }
    },
    {
      key: 'kouritsu', label: '② 圧縮比と効率',
      lead: '圧縮比 $\\varepsilon=V_1/V_2$ を変えると、オットーサイクルの形と理論熱効率はどう変わるでしょう。',
      note: '$\\eta=1-\\dfrac{1}{\\varepsilon^{\\gamma-1}}$：効率は圧縮比と $\\gamma$ だけで決まり、受けとる熱の量にはよりません。断熱圧縮で空気を $\\varepsilon^{\\gamma-1}$ 倍の温度に上げてから熱を受けとるので、高い温度で熱を受けとることになり、効率が上がります。',
      miss: '圧縮比を2倍にしても、効率は2倍になりません。10 から 20 にすると 0.60 から 0.70。$1-\\eta$ が 2 倍ごとに $2^{-0.4}=0.76$ 倍になるので、増え方はだんだん小さくなります。',
      legend: [['オットー $1-1/\\varepsilon^{0.4}$', { color: 'a' }], ['ディーゼル（締切比 2）', { color: 'b', style: 'dash' }], ['いまの圧縮比', { color: 'a', shape: 'circle', noline: true }]],
      controls: [{ range: 'eps', label: '圧縮比 $\\varepsilon$', min: 2, max: 21, step: 0.5, d: 1 }],
      draw(cv, st) { drawEff(cv, st); },
      readout: st => { const c = cycle(st.eps); return `$T_2$ ＝ 300 × ${A.num(st.eps, 1)}^0.4 ＝ ${Math.round(c.T2)} K${SP}$T_3$ ＝ ${Math.round(c.T3)} K${SP}$\\eta$ ＝ 1 − 1/${A.num(st.eps, 1)}^0.4 ＝ <b>${A.num(1 - Math.pow(st.eps, 1 - GAM), 3)}</b>`; }
    }
  ]
});

// ---------- 計算 ----------
function cycle(eps) {
  const V1 = RA * T1 / P1, V2 = V1 / eps, T2 = T1 * Math.pow(eps, GAM - 1), p2 = P1 * Math.pow(eps, GAM);
  const T3 = T2 + QIN / CVA, p3 = p2 * T3 / T2, T4 = T3 / Math.pow(eps, GAM - 1), p4 = p3 / Math.pow(eps, GAM);
  return { V1, V2, T2, p2, T3, p3, T4, p4 };
}
function pistonX(ph) { const a = ph * Math.PI / 180; return (1 - Math.cos(a)) / 2 + (LR - Math.sqrt(LR * LR - Math.sin(a) ** 2)) / 2; } // 0（上死点）〜1（下死点）
function at(st) {
  const c = cycle(st.eps), ph = st.ph, x = A.clamp(pistonX(ph % 360), 0, 1), V = c.V2 + (c.V1 - c.V2) * x;
  const dp = 0.04 * P1;
  if (ph < 180) return { V, p: P1 - dp, T: T1, k: 0, name: '① 吸気：空気を吸う（吸気弁が開く）' };
  if (ph < 360) { const p = P1 * Math.pow(c.V1 / V, GAM); return { V, p, T: p * V / RA, k: 1, name: '② 圧縮：断熱で押し縮める' }; }
  if (ph < 540) { const p = c.p3 * Math.pow(c.V2 / V, GAM); return { V, p, T: p * V / RA, k: 2, name: '③ 燃焼・膨張：燃えて、ピストンを押す（仕事をする）' }; }
  return { V, p: P1 + dp, T: c.T4, k: 3, name: '④ 排気：燃えたガスを押し出す（排気弁が開く）' };
}
function ottoPts(c, n = 60) {
  const a = [], b = [];
  for (let i = 0; i <= n; i++) { const V = c.V1 + (c.V2 - c.V1) * i / n; a.push([V, P1 * Math.pow(c.V1 / V, GAM)]); }
  for (let i = 0; i <= n; i++) { const V = c.V2 + (c.V1 - c.V2) * i / n; b.push([V, c.p3 * Math.pow(c.V2 / V, GAM)]); }
  return a.concat(b);
}
function ticks(mx) { const e = Math.pow(10, Math.floor(Math.log10(mx / 4.5))); let st = e; for (const m of [1, 2, 2.5, 5, 10]) if (m * e >= mx / 4.5) { st = m * e; break; } const r = []; for (let v = st; v <= mx + 1e-9; v += st) r.push(+v.toFixed(6)); return r; }
function niceMax(x) { const e = Math.pow(10, Math.floor(Math.log10(x))); for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= x) return m * e; return 10 * e; }

// ---------- 絵 ----------
function drawEngine(cv, st) {
  const s = at(st), c = cycle(st.eps), ph = st.ph;
  // エンジン（たて）
  const cx = 150, top = 70, bore = 110, stroke = 100, x = pistonX(ph % 360);
  const clear = stroke / (st.eps - 1); // すきま（上死点の上の高さ）
  const yTop = top, yP = top + clear + stroke * x; // ピストンの上の面
  const colGas = s.k === 0 ? 'a' : s.k === 1 ? 'e' : s.k === 2 ? 'b' : 'sub';
  cv.rect(cx - bore / 2, yTop, bore, yP - yTop, { fill: colGas, alpha: s.k === 2 ? 0.25 + 0.4 * Math.max(0, 1 - (ph - 360) / 180) : 0.2 });
  cv.line([[cx - bore / 2, yTop + clear + stroke + 30], [cx - bore / 2, yTop], [cx + bore / 2, yTop], [cx + bore / 2, yTop + clear + stroke + 30]], { color: 'ink', width: 3 });
  cv.rect(cx - bore / 2 + 2, yP, bore - 4, 26, { fill: 'sub', alpha: 0.85 });
  // 弁
  const openIn = ph < 180 ? Math.sin(ph / 180 * Math.PI) : 0, openEx = ph >= 540 ? Math.sin((ph - 540) / 180 * Math.PI) : 0;
  const valve = (vx, op, col, lab) => { const dy = 10 * op; cv.line([[vx, yTop - 40], [vx, yTop + dy]], { color: col, width: 3 }); cv.line([[vx - 14, yTop + dy], [vx + 14, yTop + dy]], { color: col, width: 5 }); cv.text(lab, vx, yTop - 52, { align: 'center', size: 14, color: col }); };
  valve(cx - 30, openIn, 'a', '吸気弁'); valve(cx + 30, openEx, 'b', '排気弁');
  if (openIn > 0.05) cv.arrow(cx - 60, yTop - 25, cx - 38, yTop + 8, { color: 'a', width: 2.5 });
  if (openEx > 0.05) cv.arrow(cx + 38, yTop + 8, cx + 60, yTop - 25, { color: 'b', width: 2.5 });
  // 点火
  if (ph > 352 && ph < 380) { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; cv.line([[cx + 6 * Math.cos(a), yTop + 12 + 6 * Math.sin(a)], [cx + 15 * Math.cos(a), yTop + 12 + 15 * Math.sin(a)]], { color: 'e', width: 2.5 }); } cv.text('火花', cx - bore / 2 - 8, yTop + 14, { align: 'right', size: 15, bold: true, color: 'e' }); }
  // 連接棒とクランク（クランクの半径 rc、連接棒の長さ 3.5 rc。ピストンの位置は同じ式で計算している）
  const rc = stroke / 2, Lr = LR * rc, a = (ph % 360) * Math.PI / 180, wrist = [cx, yP + 13];
  const Yc = top + clear + 13 + Lr + rc, pin = [cx + rc * Math.sin(a), Yc - rc * Math.cos(a)];
  cv.circle(cx, Yc, rc, { color: 'sub', width: 1.5, style: 'dot' });
  cv.line([wrist, pin], { color: 'ink', width: 4 });
  cv.line([[cx, Yc], pin], { color: 'ink', width: 5 });
  cv.dot(cx, Yc, { color: 'sub', r: 5 }); cv.dot(pin[0], pin[1], { color: 'ink', r: 4 });
  cv.text('クランク', cx + rc + 8, Yc, { size: 14, color: 'sub' });
  cv.text(s.name.split('：')[0], cx, 425, { align: 'center', size: 16, bold: true });
  // p-V 図（指圧線図）
  const pm = niceMax(c.p3 / 1000 * 1.08), Vm = c.V1 * 1.12;
  const g = cv.view({ x0: 0, x1: Vm, y0: 0, y1: pm, box: [330, 30, 520, 360] });
  g.axes({ xt: [c.V2, c.V1], yt: ticks(pm), xl: 'V', yl: 'p（MPa）', xfmt: v => v < c.V1 / 2 ? 'V₂' : 'V₁', yfmt: v => A.num(v, 1) });
  const op = ottoPts(c).map(q => [q[0], q[1] / 1000]);
  g.poly(op, { fill: 'e', alpha: 0.18 });
  g.line(op, { color: 'sub', width: 1.5, style: 'dash' });
  g.line([[c.V1, (P1 + 4) / 1000], [c.V2, (P1 + 4) / 1000]], { color: 'sub', width: 1.5, style: 'dash' });
  // いまの行程の道（はじめから今まで）
  const tr = []; for (let q = Math.floor(ph / 180) * 180; q <= ph; q += 3) { const s2 = at({ eps: st.eps, ph: q }); tr.push([s2.V, s2.p / 1000]); }
  tr.push([s.V, s.p / 1000]);
  if (s.k === 2) tr.unshift([c.V2, c.p2 / 1000]);
  if (s.k === 3 && ph < 548) tr.unshift([c.V1, c.p4 / 1000]);
  g.line(tr, { color: 'b', width: 3.5 });
  g.dot(s.V, s.p / 1000, { color: 'b', r: 7 });
  const Vm2 = c.V1 * Math.max(0.12, 1.6 / st.eps), mid = (P1 * Math.pow(c.V1 / Vm2, GAM) + c.p3 * Math.pow(c.V2 / Vm2, GAM)) / 2000;
  g.text('面積 ＝ 1回の仕事', Vm2, mid, { size: 15, align: 'center', bg: true });
  g.text('燃焼で圧力が急に上がる', c.V2 + Vm * 0.03, c.p3 / 1000 * 0.97, { size: 14, color: 'b' });
  g.text('吸気・排気（細い輪）', c.V1 * 0.8, pm * 0.16, { size: 14, color: 'sub', align: 'center' });
  g.arrow(c.V1 * 0.85, pm * 0.13, c.V1 * 0.93, pm * 0.02, { color: 'sub', width: 1.5 });
}
function drawEff(cv, st) {
  const c = cycle(st.eps), pm = niceMax(c.p3 / 1000 * 1.08);
  const g = cv.view({ x0: 0, x1: c.V1 * 1.12, y0: 0, y1: pm, box: [60, 30, 360, 360] });
  g.axes({ xt: [c.V2, c.V1], yt: ticks(pm), xl: 'V', yl: 'p（MPa）', xfmt: v => v < c.V1 / 2 ? 'V₂' : 'V₁', yfmt: v => A.num(v, 1) });
  const op = ottoPts(c).map(q => [q[0], q[1] / 1000]);
  g.poly(op, { fill: 'e', alpha: 0.3, color: 'ink', width: 2.5 });
  g.text('1', c.V1, P1 / 1000 + pm * 0.04, { size: 15, bold: true }); g.text('2', c.V2 - c.V1 * 0.04, c.p2 / 1000, { size: 15, bold: true, align: 'right' });
  g.text('3', c.V2 - c.V1 * 0.04, c.p3 / 1000, { size: 15, bold: true, align: 'right' }); g.text('4', c.V1 + c.V1 * 0.02, c.p4 / 1000 + pm * 0.04, { size: 15, bold: true });
  const Vm2 = c.V1 * Math.max(0.12, 1.6 / st.eps), mid = (P1 * Math.pow(c.V1 / Vm2, GAM) + c.p3 * Math.pow(c.V2 / Vm2, GAM)) / 2000;
  g.text('w出', Vm2, mid, { size: 15, bold: true, align: 'center' });
  const e = cv.view({ x0: 0, x1: 23, y0: 0, y1: 0.8, box: [490, 30, 370, 360] });
  e.axes({ xt: [5, 10, 15, 20], yt: [0.2, 0.4, 0.6, 0.7], xl: 'ε', yl: 'η', yfmt: v => A.num(v, 1) });
  e.plot(x => 1 - Math.pow(x, -0.4), { x0: 1, x1: 21, color: 'a', width: 3 });
  e.plot(x => 1 - Math.pow(x, -0.4) * (Math.pow(2, 1.4) - 1) / 1.4, { x0: 2, x1: 21, color: 'b', width: 2.5, style: 'dash' });
  for (const k of [5, 10, 20]) e.dot(k, 1 - Math.pow(k, -0.4), { color: 'sub', r: 4, shape: 'square' });
  e.dot(st.eps, 1 - Math.pow(st.eps, -0.4), { color: 'a', r: 7 });
  e.text('オットー', 15, 0.73, { size: 15, color: 'a', bold: true, align: 'center' });
  e.text('ディーゼル σ＝2', 13, 0.5, { size: 15, color: 'b', align: 'center' });
}
