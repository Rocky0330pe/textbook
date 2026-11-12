// @id p1-27
// @title 熱い物の光：プランクの分布と σT⁴
// @vol 物理2
// @from 物理 熱-13 ②③（p2-13 のシュテファン・ボルツマンの法則・ウィーンの変位則・プランクの式・表計算）／原-2、波、数学3-12 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 本と同じ定数：c1＝3.742×10⁸ W·μm⁴/m²、c2＝14388 μm·K、σ＝5.670×10⁻⁸ W/(m²·K⁴)、λmax T＝2898 μm·K。
// 色の見本は、熱した鉄の色のおよその見え方（暗い赤 約 900 K、明るいだいだい 約 1300 K、白っぽい黄色 約 1500 K）を表すためのもの。
const C1 = 3.742e8, C2 = 14388, SIG = 5.670e-8;
const ROWS = [['氷（0 ℃）', 273.15], ['皮膚（33 ℃）', 306.15], ['湯（100 ℃）', 373.15], ['なべ（300 ℃）', 573.15], ['たき火のまき', 1100], ['電球の線', 2800], ['太陽の表面', 5772]];
A.item({
  id: 'p1-27', title: '熱い物の光：プランクの分布と σT⁴',
  from: '物理 第2巻『熱学』 熱-13 ②③ の図と表から（黒体の光の強さの分布、σT⁴、ウィーンの変位則）',
  W: 880, H: 440,
  state: { T: 1200, T2: 300 },
  scenes: [
    {
      key: 'yama', label: '① 温度で山が動く',
      lead: '黒体の温度を上げていきます。波長ごとの光の強さの山と、物の色がどう変わるかを見ましょう。',
      note: '温度が上がると、山は高くなり、**左（短い波長）へ動きます**：$\\lambda_{\\max}T=2898$ μm·K（ウィーンの変位則）。曲線の下の面積が全体の強さで、$\\sigma T^4$ になります。2000 K でも、可視光の帯に入るのはほんの少しで、ほとんどは赤外線です。',
      miss: '「赤い物は温度が低く、青白い物は高い」は合っていますが、色の変わり方は「山が可視光の帯に入ってくる」ためです。山の頂上が可視光に入るのは、太陽の表面（約 5800 K）くらいからです。',
      legend: [['いまの温度の分布', { color: 'b' }], ['1200・1600・2000 K（本の図）', { color: 'sub', style: 'dash' }], ['山の頂上をつなぐ線', { color: 'd', style: 'dot' }], ['可視光の帯', { color: 'e', shape: 'square', noline: true }]],
      controls: [{ range: 'T', label: '温度 $T$', min: 700, max: 2000, step: 10, fmt: v => v + ' K' }],
      init(st) { st.T = 700; st.tf = 700; },
      step(st, dt) { st.tf = Math.min(2000, (st.tf || st.T) + dt * 110); st.T = Math.round(st.tf / 10) * 10; if (st.T >= 2000) return false; },
      draw(cv, st) { drawYama(cv, st); },
      readout: st => `$\\lambda_{\\max}$ ＝ 2898 ÷ ${st.T} ＝ <b>${A.num(2898 / st.T, 2)} μm</b>${SP}全体の強さ $\\sigma T^4$ ＝ <b>${A.num(SIG * Math.pow(st.T, 4) / 1000, 1)} kW/m²</b>${SP}そのうち可視光 ${(visFrac(st.T) * 100).toPrecision(2)} %`
    },
    {
      key: 'yonjou', label: '② T⁴ で増える',
      lead: '氷から太陽まで、いろいろな温度の物の放射をくらべます。温度を2倍にすると、放射の強さは何倍になるでしょう。',
      note: '$E_{\\mathrm b}=\\sigma T^4$ なので、絶対温度が2倍なら $2^4=16$ 倍。300 K で 0.46 kW/m²、600 K で 7.3、1200 K で 118 kW/m²。下のグラフ（波長は対数の目もり）では、山の高さを1にそろえて、山の位置だけをくらべています。',
      miss: '℃の数を2倍にしても16倍にはなりません。25 ℃（298 K）の2倍は 596 K、つまり 323 ℃です。$T$ は必ず K で入れます。',
      legend: [['$E_{\\mathrm b}=\\sigma T^4$', { color: 'a' }], ['表の物', { color: 'b', shape: 'square', noline: true }], ['分布（山の高さを1にそろえた）', { color: 'd' }], ['可視光の帯', { color: 'e', shape: 'square', noline: true }]],
      controls: [{ range: 'T2', label: '温度 $T$', min: 250, max: 6000, step: 1, fmt: v => Math.round(v) + ' K' }, { seg: 'T2', label: '表の物', options: ROWS.map(r => [r[1], r[0].replace(/（.*）/, '')]) }],
      draw(cv, st) { drawT4(cv, st); },
      readout: st => `$\\sigma T^4$ ＝ 5.670×10⁻⁸ × ${Math.round(st.T2)}⁴ ＝ <b>${fmtW(SIG * Math.pow(st.T2, 4))}</b>${SP}$\\lambda_{\\max}$ ＝ <b>${A.num(2898 / st.T2, 2)} μm</b>${SP}2倍の温度（${Math.round(2 * st.T2)} K）なら ${fmtW(16 * SIG * Math.pow(st.T2, 4))}`
    }
  ]
});

// ---------- 計算 ----------
function E(lam, T) { return C1 / (Math.pow(lam, 5) * (Math.exp(C2 / (lam * T)) - 1)); } // W/(m²·μm)
function band(T, a, b) { let s = 0; const n = 200; for (let i = 0; i < n; i++) { const l = a + (b - a) * (i + 0.5) / n; s += E(l, T); } return s * (b - a) / n; }
function visFrac(T) { return band(T, 0.38, 0.78) / (SIG * Math.pow(T, 4)); }
function fmtW(w) { return w >= 1e6 ? A.num(w / 1e6, 2) + ' MW/m²' : w >= 1e4 ? A.num(w / 1000, 1) + ' kW/m²' : Math.round(w) + ' W/m²'; }
function glow(T) { // およその見え方（色合い × 明るさ）
  const t = T / 100;
  let r = 255, g = t <= 66 ? 99.47 * Math.log(Math.max(t, 1)) - 161.12 : 288.12 * Math.pow(t - 60, -0.0755), b = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  if (t > 66) r = 329.7 * Math.pow(t - 60, -0.133);
  const lv = Math.log10(band(T, 0.38, 0.78) + 1e-30), lo = Math.log10(band(750, 0.38, 0.78)), hi = Math.log10(band(1500, 0.38, 0.78));
  const k = A.clamp((lv - lo) / (hi - lo), 0, 1);
  const c = x => Math.round(A.clamp(x, 0, 255) * k);
  return { css: `rgb(${c(r)},${c(g)},${c(b)})`, k };
}

// ---------- 絵 ----------
function drawYama(cv, st) {
  const v = cv.view({ x0: 0, x1: 6, y0: 0, y1: 490, box: [80, 30, 560, 360] });
  v.poly([[0.38, 0], [0.78, 0], [0.78, 490], [0.38, 490]], { fill: 'e', alpha: 0.25 });
  v.axes({ xt: [0, 1, 2, 3, 4, 5, 6], yt: [100, 200, 300, 400], xl: '波長 λ（μm）', yl: '強さ（kW/(m²·μm)）', zero: true });
  v.area(l => E(l, st.T) / 1000, 0.2, 6, { fill: 'b', alpha: 0.18 });
  for (const T of [1200, 1600, 2000]) v.plot(l => E(l, T) / 1000, { x0: 0.2, x1: 6, color: 'sub', style: 'dash', width: 1.5 });
  v.plot(l => E(l, 2898 / l) / 1000, { x0: 1.449, x1: 4.2, color: 'd', style: 'dot', width: 2 });
  v.plot(l => E(l, st.T) / 1000, { x0: 0.2, x1: 6, color: 'b', width: 3.5 });
  const lm = 2898 / st.T, em = E(lm, st.T) / 1000;
  v.dot(lm, em, { color: 'b', r: 6 });
  v.line([[lm, 0], [lm, em]], { color: 'b', style: 'dot', width: 1.5 });
  cv.text(`λmax ＝ ${A.num(lm, 2)} μm`, v.X(lm) + 8, v.Y(em) - 14, { size: 15, color: 'b', bold: true, bg: true });
  for (const [T, y] of [[2000, 420], [1600, 150], [1200, 52]]) cv.text(T + ' K', v.X(2898 / T) + 26, v.Y(Math.min(y, E(2898 / T, T) / 1000)) - 2, { size: 14, color: 'sub' });
  cv.text('← 可視光', v.X(0.8) + 2, v.Y(470), { size: 14, color: 'e', bold: true });
  cv.text(`面積 ＝ σT⁴ ＝ ${A.num(SIG * Math.pow(st.T, 4) / 1000, 1)} kW/m²`, v.X(3.2), v.Y(250), { size: 15, color: 'b', bold: true, bg: true });
  // 物の色
  const gl = glow(st.T);
  cv.rect(690, 70, 150, 150, { fill: gl.css, alpha: 1, color: 'sub', width: 1.5 });
  cv.text(`${st.T} K の物`, 765, 50, { align: 'center', size: 15, bold: true });
  cv.text(st.T < 800 ? '目には見えない（赤外線だけ）' : st.T < 1100 ? '暗い赤（約 900 K）' : st.T < 1400 ? '明るいだいだい（約 1300 K）' : '白っぽい黄色（約 1500 K）', 765, 240, { align: 'center', size: 15 });
  cv.text('（およその見え方）', 765, 262, { align: 'center', size: 14, color: 'sub' });
}
function drawT4(cv, st) {
  const T = st.T2;
  // σT⁴ のグラフ（本の図と同じ範囲：〜1250 K）
  const g = cv.view({ x0: 0, x1: 1250, y0: 0, y1: 140, box: [70, 30, 360, 230] });
  g.axes({ xt: [300, 600, 900, 1200], yt: [40, 80, 120], xl: 'T（K）', yl: 'Eb（kW/m²）' });
  g.plot(x => SIG * Math.pow(x, 4) / 1000, { x0: 0, x1: 1240, color: 'a', width: 3 });
  for (const x of [300, 600, 1200]) g.dot(x, SIG * Math.pow(x, 4) / 1000, { color: 'sub', r: 4 });
  cv.text('0.46', g.X(300), g.Y(0.46) - 14, { size: 14, align: 'center', color: 'sub' });
  cv.text('7.3（16倍）', g.X(600) - 8, g.Y(7.35) - 14, { size: 14, align: 'right', color: 'sub' });
  cv.text('118（さらに16倍）', g.X(1200) - 8, g.Y(117.6), { size: 14, align: 'right', color: 'sub' });
  if (T <= 1250) g.dot(T, SIG * Math.pow(T, 4) / 1000, { color: 'b', r: 7, shape: 'square' });
  else cv.text(`→ ${Math.round(T)} K は右の外（${fmtW(SIG * Math.pow(T, 4))}）`, 250, 40, { size: 14, color: 'b', bold: true, align: 'center' });
  // 表
  let y = 40;
  cv.text('物', 470, y, { size: 14, bold: true }); cv.text('T（K）', 640, y, { size: 14, bold: true, align: 'right' }); cv.text('σT⁴', 760, y, { size: 14, bold: true, align: 'right' }); cv.text('λmax', 855, y, { size: 14, bold: true, align: 'right' });
  for (const [nm, t] of ROWS) { y += 25; const on = Math.abs(t - T) < 0.5; const col = on ? 'b' : 'ink'; cv.text(nm, 470, y, { size: 14, color: col, bold: on }); cv.text(A.num(t, t % 1 ? 2 : 0), 640, y, { size: 14, align: 'right', color: col }); cv.text(fmtW(SIG * Math.pow(t, 4)).replace('/m²', ''), 760, y, { size: 14, align: 'right', color: col }); cv.text(A.num(2898 / t, t > 5000 ? 2 : 1) + ' μm', 855, y, { size: 14, align: 'right', color: col }); }
  // 分布（山の高さを 1 にそろえる。波長は対数）
  const L = Math.log10, h = cv.view({ x0: L(0.1), x1: L(100), y0: 0, y1: 1.15, box: [70, 300, 790, 110] });
  h.poly([[L(0.38), 0], [L(0.78), 0], [L(0.78), 1.15], [L(0.38), 1.15]], { fill: 'e', alpha: 0.25 });
  h.axes({ xt: [0.1, 0.38, 0.78, 1, 10, 100].map(L), yt: [], xl: 'λ（μm、対数）', yfmt: () => '', xfmt: x => String(+Math.pow(10, x).toFixed(2)), zero: true, grid: false, ay: L(0.1) });
  const em = E(2898 / T, T);
  h.plot(x => E(Math.pow(10, x), T) / em, { color: 'd', width: 3 });
  h.line([[L(2898 / T), 0], [L(2898 / T), 1]], { color: 'd', style: 'dot', width: 1.5 });
}
