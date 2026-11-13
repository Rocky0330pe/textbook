// @id m4-25
// @title たたいた答えをたし合わせる：たたみこみ
// @vol 数学9
// @from 数学 9-6 図7・⑧（ch9-06:518）／9-8・物理 電-9・波-11 でも使う
'use strict';
// インパルス応答 g(t)=e^{−t}（x'+x=δ(t) の答え。9-6⑦）。入力 u はステップ（u=1）またははば1のパルス
const g = t => t < 0 ? 0 : Math.exp(-t);
const U = { step: t => t >= 0 ? 1 : 0, pulse: t => (t >= 0 && t < 1) ? 1 : 0 };
const Y = { step: t => t <= 0 ? 0 : 1 - Math.exp(-t), pulse: t => t <= 0 ? 0 : t < 1 ? 1 - Math.exp(-t) : (Math.E - 1) * Math.exp(-t) };   // たたみこみの積分の答え
const TMAX = 6;

A.item({
  id: 'm4-25', title: 'たたいた答えをたし合わせる：たたみこみ',
  from: '数学 第9巻 9-6 図7・⑧ から（9-8、物理 電-9・波-11 でも使う）',
  W: 880, H: 440,
  state: { inp: 'step', d: 0.5, t: 0, ts: 1.5 },
  scenes: [
    {
      key: 'hashira', label: '① 柱に分けてたす',
      lead: '入力を、はば $\\Delta t_1$ の柱に分けます。1本の柱は「その時刻に、柱の面積だけたたく」のとほぼ同じです。▶ で時刻を進めます。',
      note: '1本の柱の出力は、インパルス応答 $e^{-t}$ を柱の時刻だけおくらせて、柱の面積倍したもの（細い破線）。全部たしたものが出力です。柱を細くした先が、たたみこみ $y(t)=\\int_0^tg(t-t_1)\\,u(t_1)\\,\\mathrm{d}t_1$ で、ステップなら $1-e^{-t}$ です。',
      miss: 'たたみこみを、ふつうのかけ算と思わないこと。$e^{-t}*e^{-2t}=e^{-t}-e^{-2t}$ で、$e^{-3t}$ ではありません。かけ算になるのは $s$ の世界（$G(s)U(s)$）でだけです。',
      init: st => { st.t = 0; },
      legend: [['入力 $u$ と柱', { color: 'a' }], ['柱1本ずつの出力', { color: 'b', style: 'dash' }], ['全部たした出力', { color: 'd' }], ['たたみこみ（柱を細くした先）', { color: 'ink', style: 'dot' }]],
      controls: [{ seg: 'inp', label: '入力', options: [['step', 'ステップ（入れたまま）'], ['pulse', 'パルス（はば1）']], on: st => { st.t = 0; } }, { seg: 'd', label: '柱のはば', options: [[1, '1'], [0.5, '0.5'], [0.25, '0.25'], [0.1, '0.1']], on: st => { st.t = 0; } }],
      step(st, dt) { st.t = Math.min(TMAX, st.t + dt * 0.8); if (st.t >= TMAX) return false; },
      draw(cv, st) { drawColumns(cv, st); },
      readout: st => { const y = colSum(st, st.t); return `時刻 $t$ ＝ ${A.num(st.t, 2)}　柱の和 ＝ ${A.num(y, 4)}　たたみこみ ＝ ${A.num(Y[st.inp](st.t), 4)}`; }
    },
    {
      key: 'hikkuri', label: '② ひっくり返してずらす',
      lead: '同じたたみこみを、別の見方で計算します。$g$ を左右にひっくり返して $t$ だけずらし、$u$ とかけて面積を出します。',
      note: '時刻 $t$ の出力は、「$g(t-t_1)$（ひっくり返してずらした形）× $u(t_1)$」の面積です。$t$ を進めると、ひっくり返した $g$ が右へすべり、重なった所の面積が出力の値になります。昔の入力ほど、$e^{-(t-t_1)}$ で小さく効きます。',
      legend: [['入力 $u(t_1)$', { color: 'a' }], ['ひっくり返した $g(t-t_1)$', { color: 'b', style: 'dash' }], ['かけた積の面積 ＝ $y(t)$', { color: 'd' }]],
      controls: [{ seg: 'inp', label: '入力', options: [['step', 'ステップ'], ['pulse', 'パルス（はば1）']] }, { range: 'ts', label: '時刻 $t$', min: 0, max: TMAX, step: 0.05, d: 2 }],
      step(st, dt) { st.ts += dt * 0.6; if (st.ts > TMAX) st.ts = 0; },
      draw(cv, st) { drawFlip(cv, st); },
      readout: st => `時刻 $t$ ＝ ${A.num(st.ts, 2)}　面積 ＝ $y(t)$ ＝ ${A.num(Y[st.inp](st.ts), 4)}` + (st.inp === 'step' ? `（$1-e^{-t}$）` : '')
    }
  ]
});

// 柱：左はしの時刻 t1 = kΔ、面積 u(t1)·Δ。出力は面積 × g(t − t1)
function colSum(st, t) { let s = 0; const d = +st.d; for (let k = 0; k * d <= t + 1e-9; k++) { const t1 = k * d; s += U[st.inp](t1) * d * g(t - t1); } return s; }
function drawColumns(cv, st) {
  const d = +st.d, u = U[st.inp];
  const a = cv.view({ x0: -0.2, x1: TMAX + 0.3, y0: -0.1, y1: 1.35, box: [50, 14, 800, 110] });
  a.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [1], xl: 't₁', grid: false });
  for (let k = 0; k * d < TMAX; k++) { const t1 = k * d, h = u(t1); if (!h) continue; const on = t1 <= st.t + 1e-9; a.poly([[t1, 0], [t1 + d, 0], [t1 + d, h], [t1, h]], { fill: on ? 'a' : 'sub', alpha: on ? 0.35 : 0.1, color: on ? 'a' : 'line', width: 1 }); }
  a.plot(u, { x0: -0.2, x1: TMAX + 0.3, color: 'a', width: 2.5, n: 700 });
  a.line([[st.t, -0.1], [st.t, 1.35]], { color: 'ink', width: 1.5, style: 'dash' });
  cv.text('入力 u', 60, 24, { size: 15, color: 'a' });
  const v = cv.view({ x0: -0.2, x1: TMAX + 0.3, y0: -0.05, y1: 1.65, box: [50, 160, 800, 250] });
  v.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [0.5, 1], xl: 't' });
  v.plot(Y[st.inp], { x0: 0, x1: TMAX + 0.3, color: 'ink', style: 'dot', width: 2, n: 600 });
  for (let k = 0; k * d <= st.t + 1e-9; k++) { const t1 = k * d, A_ = u(t1) * d; if (!A_) continue; v.plot(t => t < t1 ? NaN : A_ * g(t - t1), { x0: t1, x1: st.t, color: 'b', style: 'dash', width: 1.4, n: 200 }); }
  v.plot(t => colSum(st, t), { x0: 0, x1: st.t, color: 'd', width: 3, n: 900 });
  v.dot(st.t, colSum(st, st.t), { color: 'd', r: 6 });
  cv.text('出力 y', 60, 170, { size: 15, color: 'd' });
}

function drawFlip(cv, st) {
  const t = st.ts, u = U[st.inp], gf = t1 => g(t - t1);
  const a = cv.view({ x0: -2.5, x1: TMAX + 0.3, y0: -0.1, y1: 1.3, box: [50, 14, 800, 190] });
  a.axes({ xt: [-2, -1, 1, 2, 3, 4, 5, 6], yt: [1], xl: 't₁' });
  a.area(t1 => Math.min(u(t1), 1) * gf(t1), 0, Math.max(0.001, t), { fill: 'd', alpha: 0.35, n: 400 });
  a.plot(u, { x0: -2.5, x1: TMAX + 0.3, color: 'a', width: 2.5, n: 800 });
  a.plot(t1 => t1 > t ? NaN : gf(t1), { x0: -2.5, x1: t, color: 'b', style: 'dash', width: 2.5, n: 500 });
  a.plot(t1 => u(t1) * gf(t1), { x0: 0, x1: t, color: 'd', width: 2, n: 400 });
  a.line([[t, -0.1], [t, 1.25]], { color: 'ink', width: 1.5, style: 'dot' });
  a.text('t', t, 1.22, { align: 'center', size: 15, italic: true, math: true, bg: true });
  a.text('ひっくり返した g（ずらして右へ）', t - 0.15, 0.62, { align: 'right', size: 15, color: 'b', bg: true });
  const v = cv.view({ x0: -2.5, x1: TMAX + 0.3, y0: -0.05, y1: 1.15, box: [50, 240, 800, 170] });
  v.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [0.5, 1], xl: 't' });
  v.plot(Y[st.inp], { x0: 0, x1: TMAX + 0.3, color: 'd', width: 1, alpha: 0.3, n: 600 });
  v.plot(Y[st.inp], { x0: 0, x1: t, color: 'd', width: 3, n: 600 });
  v.dot(t, Y[st.inp](t), { color: 'd', r: 6 });
  cv.text('出力 y(t)（上の面積）', 60, 250, { size: 15, color: 'd' });
}
