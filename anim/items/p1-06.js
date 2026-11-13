// @id p1-06
// @title 終端速度とオイラー法：刻みを変えると
// @vol 物理1
// @from 物理 力-2 ⑧⑨（p1-02 のスカイダイバー：m＝80 kg、c＝0.26、オイラー法とルンゲ・クッタ法の表）
'use strict';
// 力の矢印は実線、速度は破線。運動方程式 m dv/dt ＝ mg − cv²（下向きが＋）は本と同じ式。
const G = 9.8, C = 0.26;
const vt = m => Math.sqrt(m * G / C);
const exact = (m, t) => vt(m) * Math.tanh(G * t / vt(m));
A.item({
  id: 'p1-06', title: '終端速度とオイラー法：刻みを変えると',
  from: '物理 第1巻『力学』 力-2 ⑧ 空気の抵抗と終端速度、⑨ オイラー法とルンゲ・クッタ法の表から（数学 6-2・6-5、熱-11 ⑤ でも使う）',
  W: 880, H: 440,
  state: { t: 0, m: 80, h: 1, meth: 'both', n: 0 },
  scenes: [
    {
      key: 'shuutan', label: '① 終端速度',
      lead: 'スカイダイバー（質量 80 kg、抵抗の係数 $c=0.26$）が飛び出します。重力と空気の抵抗の矢印を見ましょう。',
      note: 'はじめ（$v=0$）は抵抗がなく、加速度は $g$。速くなるほど抵抗 $cv^2$ が増えて、加速度は小さくなります。抵抗が重力と等しくなると加速度が0になり、速さは**終端速度** $v_t=\\sqrt{mg/c}$ より大きくなりません（80 kg で約 55 m/s）。質量を2倍にすると、終端速度は $\\sqrt2\\approx1.41$ 倍です。',
      miss: '空気があると、重い物のほうが速く落ちます（終端速度が大きい）。空気がないとき（$v=gt$、破線）は、重さによらず同じです。',
      legend: [['重力 $mg$（実線）', { color: 'b' }], ['空気の抵抗 $cv^2$（実線）', { color: 'd' }], ['速度 $v$（破線の矢印）', { color: 'a', style: 'dash' }], ['$v=v_t\\tanh(gt/v_t)$', { color: 'a' }], ['空気がないとき $v=gt$', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'm', label: '質量 $m$〔kg〕', min: 40, max: 160, step: 1, d: 0, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 1.5; if (st.t >= 20) { st.t = 20; return false; } },
      draw: drawShuutan,
      readout: st => { const v = exact(st.m, st.t); return `$t$ ＝ ${A.num(st.t, 1)} s　　$v$ ＝ ${A.num(v, 1)} m/s　　重力 ${A.num(st.m * G, 0)} N　　抵抗 ${A.num(C * v * v, 0)} N　　終端速度 $v_t$ ＝ <b>${A.num(vt(st.m), 1)} m/s</b>`; }
    },
    {
      key: 'euler', label: '② オイラー法の刻み',
      lead: '$\\dfrac{dv}{dt}=9.8-0.00325v^2$ を、区切る時間 $\\Delta t$ ごとに進めます。▶ で1歩ずつ。刻みを大きくすると、どうなるでしょう。',
      note: 'オイラー法は「次の速さ＝今の速さ＋今の加速度×$\\Delta t$」。区間のはじめの（大きい）加速度のまま進むので、式の値より大きく出ます（$\\Delta t=1$ s で 5 秒後 40.94、式は 39.13）。ルンゲ・クッタ法は同じ 1 s の刻みでも、式の値と小数第2位まで合います。$\\Delta t$ を大きくしすぎると、オイラー法は行き過ぎて、上下にゆれたり、こわれたりします。',
      legend: [['式で解いた値', { color: 'ink' }], ['オイラー法', { color: 'b', style: 'dash', shape: 'square' }], ['ルンゲ・クッタ法', { color: 'c', style: 'dot', shape: 'circle' }]],
      controls: [{ range: 'h', label: '区切る時間 $\\Delta t$〔s〕', min: 0.25, max: 8, step: 0.25, d: 2, on: st => { st.n = 0; st.acc = 0; } }, { seg: 'meth', label: '方法', options: [['euler', 'オイラー法'], ['rk', 'ルンゲ・クッタ法'], ['both', '両方']] }],
      init(st) { st.n = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 0.35) { st.acc = 0; st.n++; if (st.n * st.h > 40) { st.n = Math.floor(40 / st.h); return false; } } },
      draw: drawEuler,
      readout: st => { const s = sims(st.h, st.n); const i = s.e.length - 1; const t = i * st.h; return `${st.n} 歩（$t$ ＝ ${A.num(t, 2)} s）　　オイラー法 ${fmtv(s.e[i])}　　ルンゲ・クッタ法 ${fmtv(s.r[i])}　　式の値 ${A.num(exact(80, t), 2)} m/s`; }
    }
  ]
});

function fmtv(v) { return Math.abs(v) > 1e4 || !isFinite(v) ? '（大きくなりすぎた）' : A.num(v, 2) + ' m/s'; }
function sims(h, n) {
  const fa = (t, y) => [G - C / 80 * y[0] * y[0]];
  const e = [0], r = [0];
  for (let i = 0; i < n; i++) {
    const ve = e[i]; e.push(Math.abs(ve) > 1e6 ? ve : ve + fa(0, [ve])[0] * h);
    r.push(A.rk4(fa, 0, [r[i]], h)[0]);
  }
  return { e, r };
}
function diver(cv, x, y) {
  // 腕と足を広げた人（上から押されるように下向きに落ちる）
  cv.circle(x, y - 22, 8, { fill: 'bg', alpha: 1, color: 'ink', width: 2.5 });
  cv.line([[x, y - 14], [x, y + 12]], { color: 'ink', width: 2.5 });
  cv.line([[x - 24, y - 20], [x, y - 8], [x + 24, y - 20]], { color: 'ink', width: 2.5 });
  cv.line([[x - 16, y + 34], [x, y + 12], [x + 16, y + 34]], { color: 'ink', width: 2.5 });
}
function drawShuutan(cv, st) {
  const v = exact(st.m, st.t), x = 120, y = 200, s = 0.12;   // 1 N を 0.12 px
  // 流れていく空気（落ちる速さに合わせて上へ）
  for (let k = 0; k < 9; k++) { const yy = ((k * 47 - st.t * v * 4) % 420 + 420) % 420 + 10; cv.line([[30, yy], [30, yy + 18]], { color: 'grid', width: 2 }); cv.line([[210, (yy + 23) % 420 + 10], [210, (yy + 23) % 420 + 28]], { color: 'grid', width: 2 }); }
  diver(cv, x, y);
  cv.arrow(x + 40, y, x + 40, y + st.m * G * s, { color: 'b', width: 4 }); cv.text('mg', x + 46, y + st.m * G * s - 12, { size: 16, color: 'b', math: true, italic: true, bold: true });
  const fr = C * v * v;
  if (fr > 2) { cv.arrow(x - 40, y, x - 40, y - fr * s, { color: 'd', width: 4 }); cv.text('cv²', x - 46, y - fr * s + 12, { size: 16, color: 'd', math: true, italic: true, bold: true, align: 'right' }); }
  if (v > 0.5) { cv.arrow(x + 70, y - 40, x + 70, y - 40 + v * 1.6, { color: 'a', style: 'dash', width: 3 }); cv.text('v', x + 76, y - 40 + v * 0.8, { size: 16, color: 'a', math: true, italic: true }); }
  const g = cv.view({ x0: 0, x1: 21, y0: 0, y1: 100, box: [300, 25, 550, 385] });
  g.axes({ xt: [5, 10, 15, 20], yt: [20, 40, 60, 80, 100], xl: 't〔s〕', yl: 'v〔m/s〕' });
  g.plot(t => G * t, { x0: 0, x1: 11, color: 'sub', style: 'dash', width: 1.5 });
  if (st.m !== 80) g.plot(t => exact(80, t), { x0: 0, x1: 20, color: 'a', width: 1.5, alpha: 0.35 });
  g.plot(() => vt(st.m), { x0: 0, x1: 20, color: 'a', style: 'dot', width: 1.5 });
  g.text('終端速度 ' + A.num(vt(st.m), 1), 20, vt(st.m) + 4, { size: 14, color: 'a', align: 'right', bg: true });
  g.plot(t => exact(st.m, t), { x0: 0, x1: st.t, color: 'a', width: 3 });
  g.dot(st.t, v, { color: 'a', r: 6 });
  if (st.m !== 80) g.text('80 kg', 20, exact(80, 20) - 4, { size: 14, color: 'sub', align: 'right' });
  g.text('v = gt', 9.4, 90, { size: 14, color: 'sub', align: 'right' });
}
function drawEuler(cv, st) {
  const h = st.h, n = st.n, s = sims(h, n);
  const g = cv.view({ x0: 0, x1: 41, y0: -20, y1: 110, box: [60, 20, 790, 390] });
  g.axes({ xt: [5, 10, 15, 20, 25, 30, 35, 40], yt: [20, 40, 60, 80, 100], xl: 't〔s〕', yl: 'v〔m/s〕', ax: 0 });
  g.plot(t => exact(80, t), { x0: 0, x1: 40, color: 'ink', width: 2 });
  g.plot(() => vt(80), { x0: 0, x1: 40, color: 'sub', style: 'dot', width: 1 });
  const show = k => st.meth === 'both' || st.meth === k;
  const pts = arr => arr.map((v, i) => [i * h, A.clamp(v, -1e3, 1e3)]);
  g.clip(() => {
    if (show('euler')) { g.line(pts(s.e), { color: 'b', style: 'dash', width: 2.5 }); s.e.forEach((v, i) => { if (Math.abs(v) < 200) g.dot(i * h, v, { color: 'b', r: 4.5, shape: 'square' }); }); }
    if (show('rk')) { g.line(pts(s.r), { color: 'c', style: 'dot', width: 2.5 }); s.r.forEach((v, i) => { if (Math.abs(v) < 200) g.dot(i * h, v, { color: 'c', r: 4.5 }); }); }
  });
  // 今の1歩の加速度（オイラー法）の矢印
  const i = s.e.length - 1;
  if (show('euler') && Math.abs(s.e[i]) < 100) { const a = G - C / 80 * s.e[i] * s.e[i]; g.clip(() => g.line([[i * h, s.e[i]], [(i + 1) * h, s.e[i] + a * h]], { color: 'b', width: 1, alpha: 0.6 })); }
  const bad = s.e.some(v => Math.abs(v) > 110 || v < -20);
  if (show('euler') && bad) cv.text('オイラー法がこわれた：行き過ぎて、値がとんでもない所へ', 450, 405, { size: 15, color: 'b', bold: true, align: 'center', bg: true });
  else if (show('euler') && s.e.some((v, k) => k > 0 && v > vt(80) + 0.5)) cv.text('オイラー法が終端速度を行き過ぎて、上下にゆれている', 450, 405, { size: 15, color: 'b', bold: true, align: 'center', bg: true });
}
