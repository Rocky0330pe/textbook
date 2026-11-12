// @id p2-09
// @title インピーダンスの違いで分かれる波
// @vol 物理3
// @from 物理 波-7 ④（p3-07 2本の弦のつなぎ目・反射係数のグラフ）・電-13（p4-13 ケーブルの先の条件）／原-6 でも使う
'use strict';
// ① 本の表計算の数：左の弦 c1=20 m/s・Z1=4.0 N·s/m、つなぎ目 x=2.0 m、高さ 3 cm の三角の山（半分の幅 0.3 m）。
//    張力が同じなら Z2/Z1 = c1/c2。Z2=2Z1 で r=−1/3（反対側に 1 cm）、τ=2/3（2 cm、はば半分）。
//    r・τ は、ゆれの速さ（変位）で数えた値：r=(Z1−Z2)/(Z1+Z2)、τ=2Z1/(Z1+Z2)。
// ② 10 m・50 Ω のケーブル（速さ 2.0×10⁸ m/s、1 m に 5 ns）。入口の電源も 50 Ω。電圧で数えた反射係数 r_V=(Z_L−Z0)/(Z_L+Z0)。
//    開放 +1、短絡 −1、50 Ω で 0、75 Ω で 0.2（はね返る電力は r_V²=4 %）。
A.item({
  id: 'p2-09', title: 'インピーダンスの違いで分かれる波',
  from: '物理 第3巻 波-7 ④ の図「2本の弦のつなぎ目」「反射係数のグラフ」、第4巻 電-13 の図「ケーブルの先ではね返る」から（原-6 でも使う）',
  W: 880, H: 420,
  state: { t: 0, zr: 2, end: '75', lz: 0.301 },
  scenes: [
    {
      key: 'gen', label: '① 2本の弦',
      lead: 'インピーダンス $Z_1$ の弦から $Z_2$ の弦へ、高さ 3 cm の山を送ります。つなぎ目で、はね返る山と通りぬける山に分かれます。',
      note: 'はね返りは、インピーダンスの**違い**で決まります。$Z_2>Z_1$（重い弦へ）では $r<0$ で、はね返る山は反対側。$Z_2<Z_1$（軽い弦へ）では同じ側のまま。$Z_2=Z_1$ なら、つなぎ目があってもはね返りません。通りぬけた山のはばは、右の弦の速さに比例します。',
      legend: [['弦の形', { color: 'a' }], ['つなぎ目', { color: 'sub', style: 'dash' }]],
      controls: [{ seg: 'zr', label: '$Z_2/Z_1$', options: [[0.25, '1/4'], [0.5, '1/2'], [1, '1（同じ）'], [2, '2'], [4, '4']], on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.025; if (st.t > 0.16) st.t = 0; },
      draw(cv, st) { gen(cv, st); },
      readout: st => { const z = st.zr, r = (1 - z) / (1 + z), tau = 2 / (1 + z); return `$r=\\dfrac{Z_1-Z_2}{Z_1+Z_2}$ ＝ ${frac(r)}（山 ${A.num(3 * r, 2)} cm）　　$\\tau=\\dfrac{2Z_1}{Z_1+Z_2}$ ＝ ${frac(tau)}（山 ${A.num(3 * tau, 2)} cm）　　時刻 ${A.num(st.t, 3)} s`; }
    },
    {
      key: 'cable', label: '② ケーブルの先',
      lead: '10 m・50 Ω のケーブルの入口から、電圧のパルスを送ります。先に何をつなぐかで、もどってくるパルスが変わります。',
      note: 'パルスは約 100 ns（10 m を往復）でもどってきます。先を開けると同じ向き（$r_V=+1$）、ショートさせると反対向き（$r_V=-1$）、50 Ω をつなぐともどりません。75 Ω では、0.2 倍の同じ向きのパルスがもどります。入口の電源も 50 Ω なので、もどったパルスは入口でははね返りません。',
      miss: '「反射係数 0.2 なら、電力の 20 % がはね返る」のではありません。$r_V$ は電圧の比で、電力の割合は $r_V^{\\,2}=0.04$、つまり 4 % です。',
      legend: [['ケーブルの上の電圧', { color: 'a' }], ['入口の電圧（オシロスコープ）', { color: 'b' }]],
      controls: [{ seg: 'end', label: '先につなぐもの', options: [['open', '何もつながない'], ['short', 'ショート'], ['50', '50 Ω'], ['75', '75 Ω']], on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt * 25; if (st.t > 135) st.t = 0; },
      draw(cv, st) { cable(cv, st); },
      readout: st => { const r = rv(st.end); return `$r_V=\\dfrac{Z_L-Z_0}{Z_L+Z_0}$ ＝ <b>${A.num(r, 1)}</b>　　はね返る電力の割合 $r_V^{\\,2}$ ＝ <b>${A.num(r * r * 100, 0)} %</b>　　時刻 ${A.num(st.t, 0)} ns`; }
    },
    {
      key: 'wariai', label: '③ 高さとエネルギー',
      lead: '$Z_2/Z_1$ を 0.01 から 100 まで変えて、山の高さの比と、エネルギーの割合を比べましょう。',
      note: 'はね返るエネルギーは $r^2$、通りぬけるエネルギーは $\\dfrac{Z_2}{Z_1}\\tau^2$ で、2つの和はいつも1です。比が1から10倍以上ずれると、半分以上のエネルギーがはね返ります（超音波検査で、すきまの空気をゼリーで追い出すわけ）。',
      miss: '軽い弦へ通りぬけた山（$Z_2=Z_1/2$ で $\\tau=\\frac43$）は来た山より高くなりますが、エネルギーが増えたのではありません。$Z$ が小さいので、エネルギーは $\\frac12\\times\\frac{16}{9}=\\frac89$ に減っています。',
      legend: [['反射係数 $r$', { color: 'a' }], ['はね返る割合 $r^2$', { color: 'b', style: 'dash' }], ['いまの比', { color: 'c', shape: 'diamond', noline: true }]],
      controls: [{ range: 'lz', label: '$Z_2/Z_1$', min: -2, max: 2, step: 0.01, fmt: v => A.num(Math.pow(10, v), Math.pow(10, v) < 1 ? 3 : Math.pow(10, v) < 10 ? 2 : 0) }],
      draw(cv, st) { wariai(cv, st); },
      readout: st => { const z = Math.pow(10, st.lz), r = (1 - z) / (1 + z), tau = 2 / (1 + z); return `$r$ ＝ ${A.num(r, 3)}　　$\\tau$ ＝ ${A.num(tau, 3)}　　はね返る $r^2$ ＝ <b>${A.num(r * r, 3)}</b>　　通りぬける $\\frac{Z_2}{Z_1}\\tau^2$ ＝ <b>${A.num(z * tau * tau, 3)}</b>　　和 ＝ ${A.num(r * r + z * tau * tau, 3)}`; }
    }
  ]
});

function frac(v) { const m = { '0.6': '3/5', '0.333': '1/3', '-0.333': '−1/3', '-0.6': '−3/5', '0': '0', '1.6': '8/5', '1.333': '4/3', '0.667': '2/3', '0.4': '2/5', '1': '1' }; const k = String(+v.toFixed(3)); return m[k] || A.num(v, 3); }
function tri(x, c, w, h) { return Math.max(0, h * (1 - Math.abs(x - c) / w)); }

function gen(cv, st) {
  const z = st.zr, c1 = 20, c2 = c1 / z, xj = 2.0, w = 0.3, r = (1 - z) / (1 + z), tau = 2 / (1 + z);
  const t = st.t, ci = 0.5 + c1 * t, tj = (xj - 0.5) / c1;      // 来た山の中心、つなぎ目に着く時刻（0.075 s）
  const y = x => x <= xj ? tri(x, ci, w, 3) + r * tri(x, 2 * xj - ci, w, 3) : tau * tri(x, xj + c2 * (t - tj), w * c2 / c1, 3);
  const v = cv.view({ x0: 0, x1: 3.1, y0: -3.6, y1: 4.6, box: [55, 20, 780, 330] });
  v.axes({ xt: [0.5, 1, 1.5, 2, 2.5, 3], yt: [-3, -2, -1, 1, 2, 3, 4], xl: 'x〔m〕', yl: 'y〔cm〕' });
  v.poly([[xj, -3.6], [3.1, -3.6], [3.1, 4.6], [xj, 4.6]], { fill: 'grid', alpha: z > 1 ? 0.7 : z < 1 ? 0.25 : 0 });
  v.line([[xj, -3.6], [xj, 4.6]], { color: 'sub', style: 'dash', width: 1.5 });
  v.plot(y, { color: 'a', width: 3, n: 1200 });
  for (const s of [1, -1]) v.line([[0, s], [3.1, s]], { color: 'sub', style: 'dot', width: 1 });
  v.text('弦1（Z1、c1 ＝ 20 m/s）', 1.0, 4.2, { align: 'center', size: 15 });
  v.text('弦2（Z2 ＝ ' + { 0.25: '1/4', 0.5: '1/2', 1: '', 2: '2', 4: '4' }[z] + ' Z1、c2 ＝ ' + A.num(c2, 0) + ' m/s）', 2.55, 4.2, { align: 'center', size: 15 });
  if (t > tj + 0.012) {
    const xr = 2 * xj - ci, xt = xj + c2 * (t - tj);
    if (Math.abs(r) > 0.01 && xr > 0.1) v.text('はね返った山 ' + A.num(3 * r, 2) + ' cm', xr, 3 * r + (r > 0 ? 0.5 : -0.5), { align: 'center', size: 14, bg: true });
    if (xt < 3.0) v.text('通りぬけた山 ' + A.num(3 * tau, 2) + ' cm', Math.min(xt, 2.75), 3 * tau + 0.5, { align: 'center', size: 14, bg: true });
  }
}

function rv(e) { return { open: 1, short: -1, '50': 0, '75': 0.2 }[e]; }
function vp(s) { return s < 0 || s > 10 ? 0 : 1; }   // 幅 10 ns の 1 V のパルス（s は出した時刻からの ns）
function cable(cv, st) {
  const r = rv(st.end), t = st.t;   // 1 m を 5 ns
  const V = x => vp(t - 5 * x) + r * vp(t - 5 * (20 - x));
  const v = cv.view({ x0: -0.8, x1: 11, y0: -1.3, y1: 1.4, box: [60, 20, 760, 160] });
  v.axes({ xt: [2, 4, 6, 8, 10], yt: [-1, 1], yl: 'ケーブルの上の電圧〔V〕', ay: 0 });
  v.text('入口からの距離 x〔m〕', 5, -1.2, { align: 'center', size: 14, color: 'sub' });
  // ケーブルの絵
  v.poly([[0, -0.08], [10, -0.08], [10, 0.08], [0, 0.08]], { fill: 'sub', alpha: 0.25 });
  v.plot(V, { x0: 0, x1: 10, color: 'a', width: 3, n: 1000 });
  const lab = { open: '開', short: '短', '50': '50 Ω', '75': '75 Ω' }[st.end];
  if (st.end === 'short') v.line([[10, -0.3], [10, 0.3]], { color: 'ink', width: 4 });
  else if (st.end !== 'open') v.cv.rect(v.X(10) + 2, v.Y(0) - 14, 34, 28, { color: 'ink', width: 2 });
  v.text(st.end === 'open' ? '先は開いている' : st.end === 'short' ? '先をショート' : lab, 10.1, 0.55, { size: 14, align: 'center' });
  v.text('入口', -0.15, -0.5, { size: 14, align: 'right', color: 'b' });
  // オシロスコープ（入口の電圧と時刻）
  const g = cv.view({ x0: 0, x1: 135, y0: -1.3, y1: 1.4, box: [60, 235, 760, 150] });
  g.axes({ xt: [20, 40, 60, 80, 100, 120], yt: [-1, 1], xl: '時刻〔ns〕', yl: '入口の電圧〔V〕' });
  g.plot(s => vp(s) + r * vp(s - 100), { x0: 0, x1: t, color: 'b', width: 3, n: 1400 });
  g.text('出した', 12, 1.0, { size: 14 });
  if (t > 100) g.text(Math.abs(r) < 1e-9 ? 'もどらない' : 'もどった（' + A.num(r, 1) + ' V）', 105, r >= 0 ? 1.15 * Math.max(r, 0.35) + 0.1 : r - 0.15, { size: 14, align: 'center', bg: true });
  g.line([[100, -1.3], [100, 1.4]], { color: 'sub', style: 'dot', width: 1 });
  g.text('約 100 ns', 100, -1.1, { size: 14, align: 'center', color: 'sub', bg: true });
}

function wariai(cv, st) {
  const g = cv.view({ x0: -2, x1: 2, y0: -1.1, y1: 1.1, box: [70, 20, 520, 360] });
  g.axes({ xt: [-2, -1, 0, 1, 2], yt: [-1, -0.5, 0.5, 1], xl: 'Z2/Z1', xfmt: v => ['0.01', '0.1', '1', '10', '100'][v + 2], ay: -2, zero: true });
  const R = l => { const z = Math.pow(10, l); return (1 - z) / (1 + z); };
  g.plot(R, { color: 'a', width: 3 });
  g.plot(l => R(l) ** 2, { color: 'b', style: 'dash', width: 2.5 });
  const z = Math.pow(10, st.lz), r = R(st.lz), tau = 2 / (1 + z);
  g.line([[st.lz, -1.1], [st.lz, 1.1]], { color: 'c', style: 'dot', width: 1 });
  g.dot(st.lz, r, { color: 'c', shape: 'diamond', r: 7 }); g.dot(st.lz, r * r, { color: 'c', shape: 'diamond', r: 7 });
  // 右：高さとエネルギーの棒
  const bx = 630, by = 330;
  const bars = [['来た山', 1, 'sub'], ['はね返る', r, 'b'], ['通りぬける', tau, 'a']];
  cv.text('山の高さ（来た山を1）', bx + 85, 30, { align: 'center', size: 14, bold: true });
  bars.forEach(([nm, h, c], i) => { const x = bx + i * 78, hh = Math.min(Math.abs(h), 2) * 65; cv.rect(x - 18, 190 - hh, 36, hh, { fill: c, alpha: 0.7 }); cv.text(A.num(h, 2), x, 190 - hh - 10, { align: 'center', size: 14 }); cv.text(nm, x, 205, { align: 'center', size: 14 }); });
  cv.text('エネルギー（来た波を1）', bx + 85, 238, { align: 'center', size: 14, bold: true });
  const e1 = r * r, e2 = z * tau * tau;
  cv.rect(bx - 30, by - 60, 230 * e1, 30, { fill: 'b', alpha: 0.75 }); cv.rect(bx - 30 + 230 * e1, by - 60, 230 * e2, 30, { fill: 'a', alpha: 0.6 });
  cv.rect(bx - 30, by - 60, 230, 30, { color: 'ink', width: 1.5 });
  cv.text('はね返る ' + A.num(e1 * 100, 1) + ' %', bx - 30, by - 8, { size: 14, color: 'b' });
  cv.text('通りぬける ' + A.num(e2 * 100, 1) + ' %', bx - 30, by + 14, { size: 14, color: 'a' });
}
