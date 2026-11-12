// @id p1-19
// @title 温度がそろうまで：重みつき平均とエントロピー
// @vol 物理2
// @from 物理 熱-1 ①④（p2-01 の熱平衡・混ぜた温度）、熱-6 ③④（p2-06 のお湯と水のエントロピー）／数学6-4・6-14⑧、熱-15 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>'; // 読み出しの区切り
// ① お湯 80 ℃ 200 g と水 20 ℃（本の例：600 g で 35 ℃、200 g で 50 ℃、400 g で 40 ℃、800 g で 32 ℃）。
//    そろい方は本の図（お茶と水、1：3 で時定数 2 分）と同じになるように、板を通る熱の流れやすさを決めた。
// ② お湯 80 ℃ 1 kg と水 20 ℃ 1 kg。1 回に 4200 J ずつ移し、その回のまん中の温度でわる（本の表と同じ）。
const C_W = 4.2; // J/(g·K)
const K_PLATE = 0.375 * 200 * C_W; // J/(K·分)：C1＝200 g 分、C2＝3 倍のとき τ＝2 分
A.item({
  id: 'p1-19', title: '温度がそろうまで：重みつき平均とエントロピー',
  from: '物理 第2巻『熱学』 熱-1 ①④ と 熱-6 ③ の図と表から（お湯と水の熱平衡、エントロピーの合計の増え）',
  W: 880, H: 440,
  state: { m2: 600, t: 0, n: 0, rev: false, tt: 0 },
  scenes: [
    {
      key: 'soroeru', label: '① 温度がそろう',
      lead: '80 ℃のお湯 200 g と 20 ℃の水を、金属の板ごしにくっつけます。熱が移って、2つの温度がそろうようすを見ましょう。',
      note: '熱は温度の高いほうから低いほうへ移り、温度がそろうと止まります（熱平衡）。そろった温度は、**熱容量で重みをつけた平均**です：$2520\\times15=840\\times45$。右のてんびんのつり合う所が、最後の温度です。',
      miss: '80 ℃と 20 ℃を混ぜたら、いつも 50 ℃――ではありません。量が同じときだけ 50 ℃です。最後の温度は、量（熱容量）の大きいほうに寄ります。水をどんなに増やしても、20 ℃より下がることはありません。',
      legend: [['お湯の温度', { color: 'b' }], ['水の温度', { color: 'a', style: 'dash' }], ['最後の温度（重みつきの平均）', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'm2', label: '水の量', min: 100, max: 1200, step: 50, fmt: v => v + ' g', on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(10, st.t + dt * 0.8); if (st.t >= 10) return false; },
      draw(cv, st) { drawMix(cv, st); },
      readout: st => { const f = final(st.m2), s = temps(st.m2, st.t); return `時刻 ${A.num(st.t, 1)} 分${SP}お湯 ${A.num(s[0], 1)} ℃${SP}水 ${A.num(s[1], 1)} ℃${SP}最後の温度 ＝ (840×80 ＋ ${Math.round(st.m2 * C_W)}×20) ÷ ${Math.round(840 + st.m2 * C_W)} ＝ <b>${A.num(f, 1)} ℃</b>`; }
    },
    {
      key: 'entropy', label: '② エントロピーを数える',
      lead: '80 ℃のお湯 1 kg と 20 ℃の水 1 kg の間で、4200 J ずつ熱を移します。1回ごとに、エントロピーの合計がどれだけ増えるかを数えましょう。',
      note: 'お湯のエントロピーは毎回減り（$-\\Delta Q/T_{お湯}$）、水は毎回増えます（$+\\Delta Q/T_{水}$）。水のほうが温度が低いので、同じ 4200 J でも増え方が大きく、**合計は毎回増えます**。温度の差が大きいはじめほど大きく（2.39）、そろうと止まります。30 回で 36.35 J/K（積分で 36.355 J/K）。',
      miss: '1回で 30 K 分（126000 J）を一度に移して、はじめの温度でわると約 73 J/K と、2倍もずれます。温度が変わるときは、細かく分けて、そのときの温度でわります。',
      legend: [['お湯の $\\Delta S$（減る）', { color: 'b' }], ['水の $\\Delta S$（増える）', { color: 'a', style: 'dash' }], ['合計の増え（本の表の点）', { color: 'd', shape: 'circle' }]],
      controls: [{ button: '逆向きに1回移す', act(st) { st.rev = true; st.n = 0; st.tt = 0; } }],
      init(st) { st.n = 0; st.rev = false; st.tt = 0; },
      step(st, dt) { st.tt += dt; if (st.rev) return false; if (st.tt > 0.35) { st.tt = 0; st.n = Math.min(30, st.n + 1); } if (st.n >= 30) return false; },
      draw(cv, st) { drawEntropy(cv, st); },
      readout: st => {
        if (st.rev) return `逆向きに 1 回（水 20 ℃ → お湯 80 ℃へ 4200 J）：4200/352.65 − 4200/293.65 ≒ <b>−2.39 J/K</b>${SP}合計が減る → ひとりでは起きない向き`;
        const r = row(st.n); return `${st.n} 回め${SP}お湯 ${80 - st.n} ℃・水 ${20 + st.n} ℃${SP}その回の増え ${A.num(r.inc, 3)} J/K${SP}合計 <b>${A.num(r.sum, 2)} J/K</b>`;
      }
    }
  ]
});

// ---------- 計算 ----------
function final(m2) { const c1 = 200 * C_W, c2 = m2 * C_W; return (c1 * 80 + c2 * 20) / (c1 + c2); }
function temps(m2, t) { // 分
  const c1 = 200 * C_W, c2 = m2 * C_W, f = final(m2), k = K_PLATE * (1 / c1 + 1 / c2), e = Math.exp(-k * t);
  return [f + (80 - f) * e, f + (20 - f) * e];
}
function row(n) { // n 回めまでの表の値
  let sum = 0, inc = 0, dh = 0, dw = 0;
  for (let i = 1; i <= n; i++) { dh = -4200 / (80 - i + 0.5 + 273.15); dw = 4200 / (20 + i - 0.5 + 273.15); inc = dh + dw; sum += inc; }
  return { sum, inc, dh, dw };
}

// ---------- 絵 ----------
function drawMix(cv, st) {
  const s = temps(st.m2, st.t), f = final(st.m2);
  // 入れ物と板
  const box = (x, w, h, th, lab, col) => {
    const y0 = 200 - h;
    cv.rect(x, 60, w, 140, { color: 'sub', width: 2 });
    cv.rect(x + 2, y0, w - 4, h, { fill: col, alpha: 0.15 + 0.5 * (th - 20) / 60 });
    cv.text(lab, x + w / 2, 45, { align: 'center', size: 15, bold: true, color: col });
    cv.text(A.num(th, 1) + ' ℃', x + w / 2, y0 + h / 2, { align: 'center', size: 17, bold: true });
  };
  const hw = 90, ww = A.clamp(40 + st.m2 / 1200 * 160, 50, 200);
  box(30, hw, 50, s[0], 'お湯 200 g', 'b');
  cv.rect(30 + hw, 120, 12, 80, { fill: 'sub', alpha: 0.7 });
  box(30 + hw + 12, ww, 50 + 80 * 0 + Math.min(120, st.m2 / 600 * 50), s[1], `水 ${st.m2} g`, 'a');
  if (s[0] - s[1] > 0.5) cv.arrow(30 + hw - 20, 160, 30 + hw + 32, 160, { color: 'b', width: 3 });
  cv.text('熱', 30 + hw + 6, 230, { align: 'center', size: 15, color: 'b' });
  // てんびん（温度の物差し）
  const v = cv.view({ x0: 15, x1: 85, y0: 0, y1: 1, box: [30, 300, 330, 90] });
  v.line([[20, 0.4], [80, 0.4]], { color: 'ink', width: 3 });
  for (const t of [20, 35, 50, 80]) v.text(t + ' ℃', t, 0.02, { align: 'center', size: 14, color: 'sub' });
  v.poly([[f, 0.4], [f - 1.6, 0.12], [f + 1.6, 0.12]], { fill: 'ink', alpha: 0.9 });
  const c1 = 840, c2 = st.m2 * C_W, sz = c => 8 + 26 * Math.sqrt(c / 5040);
  cv.rect(v.X(80) - sz(c1) / 2, v.Y(0.4) - sz(c1) * 1.2, sz(c1), sz(c1) * 1.2, { fill: 'b', alpha: 0.5, color: 'b' });
  cv.rect(v.X(20) - sz(c2) / 2, v.Y(0.4) - sz(c2) * 1.2, sz(c2), sz(c2) * 1.2, { fill: 'a', alpha: 0.5, color: 'a' });
  cv.text(`${Math.round(c2)} J/K`, v.X(20), v.Y(0.4) - sz(c2) * 1.2 - 12, { align: 'center', size: 14, color: 'a' });
  cv.text('840 J/K', v.X(80), v.Y(0.4) - sz(c1) * 1.2 - 12, { align: 'center', size: 14, color: 'b' });
  cv.text(`てんびん：${Math.round(c2)}×${A.num(f - 20, 1)} ＝ 840×${A.num(80 - f, 1)}`, 195, 425, { align: 'center', size: 14, color: 'sub' });
  // グラフ
  const g = cv.view({ x0: 0, x1: 10.5, y0: 0, y1: 92, box: [430, 30, 430, 360] });
  g.axes({ xt: [2, 4, 6, 8, 10], yt: [20, 40, 60, 80], xl: '時間（分）', yl: '温度（℃）' });
  g.line([[0, f], [10.5, f]], { color: 'sub', style: 'dot', width: 2 });
  g.text(A.num(f, 1) + ' ℃', 10.4, f + (f > 50 ? -5 : 5), { align: 'right', size: 15, color: 'sub' });
  g.plot(t => temps(st.m2, t)[0], { x0: 0, x1: st.t, color: 'b', width: 3 });
  g.plot(t => temps(st.m2, t)[1], { x0: 0, x1: st.t, color: 'a', width: 3, style: 'dash' });
  g.dot(st.t, s[0], { color: 'b', r: 6 }); g.dot(st.t, s[1], { color: 'a', r: 6, shape: 'square' });
  g.text('お湯', 0.4, 86, { size: 15, color: 'b' }); g.text('水', 0.4, 13, { size: 15, color: 'a' });
}
function drawEntropy(cv, st) {
  const n = st.n;
  // 2つの入れ物
  const th = st.rev ? [80 + 1, 20 - 1] : [80 - n, 20 + n];
  const cup = (x, t, lab, col) => { cv.rect(x, 60, 110, 110, { color: 'sub', width: 2 }); cv.rect(x + 2, 90, 106, 78, { fill: col, alpha: 0.12 + 0.5 * (t - 19) / 62 }); cv.text(lab, x + 55, 45, { align: 'center', size: 15, bold: true, color: col }); cv.text(t + ' ℃', x + 55, 128, { align: 'center', size: 18, bold: true }); };
  cup(30, th[0], 'お湯 1 kg', 'b'); cup(170, th[1], '水 1 kg', 'a');
  cv.rect(142, 100, 26, 70, { fill: 'sub', alpha: 0.6 });
  if (st.rev) { cv.arrow(190, 200, 120, 200, { color: 'd', width: 3 }); cv.text('逆向き 4200 J', 155, 222, { align: 'center', size: 14, color: 'd', bold: true }); }
  else if (n > 0 && n < 30) { cv.arrow(120, 200, 190, 200, { color: 'b', width: 3 }); cv.text('4200 J', 155, 222, { align: 'center', size: 14, color: 'b' }); }
  // その回の ΔS の棒
  const r = st.rev ? { dh: 4200 / 352.65, dw: -4200 / 293.65 } : row(Math.max(1, n));
  const b = cv.view({ x0: 0, x1: 3, y0: -16, y1: 16, box: [40, 250, 240, 160] });
  b.line([[0, 0], [3, 0]], { color: 'sub', width: 1.5 });
  if (n > 0 || st.rev) {
    b.poly([[0.3, 0], [1.2, 0], [1.2, r.dh], [0.3, r.dh]], { fill: 'b', alpha: 0.35, color: 'b', width: 2 });
    b.poly([[1.8, 0], [2.7, 0], [2.7, r.dw], [1.8, r.dw]], { fill: 'a', alpha: 0.25, color: 'a', style: 'dash', width: 2 });
    b.text(A.num(r.dh, 2), 0.75, r.dh + (r.dh < 0 ? -2.5 : 2.5), { align: 'center', size: 14, color: 'b' });
    b.text(A.num(r.dw, 2), 2.25, r.dw + (r.dw < 0 ? -2.5 : 2.5), { align: 'center', size: 14, color: 'a' });
  }
  cv.text('その回の ΔS（J/K）', 160, 240, { align: 'center', size: 14, color: 'sub' });
  // 合計のグラフ（本の図と同じ点）
  const g = cv.view({ x0: 0, x1: 32, y0: -4, y1: 42, box: [380, 30, 480, 370] });
  g.axes({ xt: [10, 20, 30], yt: [10, 20, 30, 36.35], xl: '回', yl: 'エントロピーの合計の増え（J/K）', yfmt: v => v === 36.35 ? '36.4' : A.num(v, 0) });
  g.line([[0, 36.35], [32, 36.35]], { color: 'b', style: 'dash', width: 1.5 });
  for (let i = 1; i <= (st.rev ? 0 : n); i++) { const rr = row(i); g.dot(i, rr.sum, { color: 'd', r: 4.5 }); }
  if (st.rev) { g.dot(1, -2.39, { color: 'd', r: 6, shape: 'tri' }); g.text('−2.39（減る）', 1.8, -2.4, { size: 15, color: 'd', bold: true }); }
  if (n >= 30) g.text('温度がそろうと、増えが止まる', 31, 39.5, { align: 'right', size: 15, color: 'b' });

}
