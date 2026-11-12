// @id m2-21
// @title 2つの波をたす：合成・うなり・方形波
// @vol 数学4
// @from 数学 4-9 ①⑥⑦（ch4-09:81・405・469・518・705）／波-8・波-9、電-10・電-11、6-10、9-1 でも使う
'use strict';
const D21 = Math.PI / 180;
let audio21 = null;
A.item({
  id: 'm2-21', title: '2つの波をたす：合成・うなり・方形波',
  from: '数学 第4巻 4-9 ①「やってみよう」・⑥「合成」・⑦「うなり」の図から（6-10、9-1、物理 波-8・波-9・電-10 でも使う）',
  W: 880, H: 400,
  state: { th: 0, dl: 60, a: 3, b: 4, f2: 12, t: 0, N: 1, u: 0 },
  scenes: [
    {
      key: 'gousei', label: '① ずれた2つの波',
      lead: '$\\sin\\theta$ と、$\\delta$ だけ先に進んだ波 $\\sin(\\theta+\\delta)$ をたします。左の回る2本の矢印をつなぐと、たした波の高さになります。',
      note: '$\\sin\\theta+\\sin(\\theta+60°)=\\sqrt3\\sin(\\theta+30°)$。たした波も同じ周期の波で、山の高さは2ではなく約1.73、山の位置は60°です。ずれ $\\delta$ が 0° なら山がそろって2（強め合い）、180° なら山と谷が重なって0（打ち消し）。',
      legend: [['$\\sin\\theta$', { color: 'a' }], ['$\\sin(\\theta+\\delta)$', { color: 'b', style: 'dash' }], ['たした波', { color: 'c' }]],
      controls: [
        { range: 'dl', label: 'ずれ $\\delta$', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°' },
        { range: 'th', label: '角 $\\theta$', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }
      ],
      init(st) { st.th = 0; st.dl = 60; },
      step(st, dt) { st.th += dt * 50; if (st.th > 360) st.th = 0; },
      draw(cv, st) { drawG(cv, st); },
      readout: st => { const R = 2 * Math.cos(st.dl / 2 * D21); return `たした波の山の高さ ＝ <b>${A.num(R, 2)}</b>（1 ＋ 1 ＝ 2 ${R > 1.995 ? 'と同じ' : 'より小さい'}）、山の位置 ＝ ${A.num(90 - st.dl / 2, 0)}°`; }
    },
    {
      key: 'keisu', label: '② a sin θ ＋ b cos θ',
      lead: '$a\\sin\\theta+b\\cos\\theta$ は、1つの波 $R\\sin(\\theta+\\alpha)$ にまとめられます。$R$ と $\\alpha$ は、点 $(a,\\ b)$ の長さと角です。',
      note: '$R=\\sqrt{a^2+b^2}$、$\\alpha$ は点 $(a,\\ b)$ の動径の角。$\\sin$ の矢印と $\\cos$ の矢印は、いつも 90° ずれて回るので、2本をつないだ矢印の長さは $\\sqrt{a^2+b^2}$ のままです。',
      miss: '合成の最大を、係数の和にしてはいけません。$3\\sin\\theta+4\\cos\\theta$ の最大は $3+4=7$ ではなく $\\sqrt{3^2+4^2}=5$ です。2つの波の山は、ちがう角で来るからです。',
      legend: [['$a\\sin\\theta$', { color: 'a' }], ['$b\\cos\\theta$', { color: 'b', style: 'dash' }], ['たした波 $R\\sin(\\theta+\\alpha)$', { color: 'c' }], ['係数の和 $a+b$（とどかない）', { color: 'd', style: 'dot' }]],
      controls: [
        { range: 'a', label: '$a$', min: -4, max: 4, step: 0.1, d: 1 },
        { range: 'b', label: '$b$', min: -4, max: 4, step: 0.1, d: 1 },
        { range: 'th', label: '角 $\\theta$', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }
      ],
      init(st) { st.th = 0; st.a = 3; st.b = 4; },
      step(st, dt) { st.th += dt * 50; if (st.th > 360) st.th = 0; },
      draw(cv, st) { drawK(cv, st); },
      readout: st => { const R = Math.hypot(st.a, st.b), al = Math.atan2(st.b, st.a) / D21; return `$R$ ＝ √(${A.num(st.a, 1)}² ＋ ${A.num(st.b, 1)}²) ＝ <b>${A.num(R, 2)}</b>、$\\alpha$ ＝ ${A.num(al, 1)}°　（係数の和 ${A.num(st.a + st.b, 1)}）`; }
    },
    {
      key: 'unari', label: '③ うなり',
      lead: '振動数が少しちがう2つの波（10 Hz と 12 Hz）をたします。大きい所と小さい所が、1秒に何回来るでしょう。',
      note: '$\\sin A+\\sin B=2\\sin\\dfrac{A+B}{2}\\cos\\dfrac{A-B}{2}$。速い波の振幅を、ゆっくりした $2\\cos(360°\\times\\dfrac{f_2-f_1}{2}t)$ が変えます。大きさが最大になるのは1秒に $f_2-f_1$ 回。これが**うなり**です。左の2本の矢印は、少しずつ回る速さがちがうので、そろったり反対を向いたりします。',
      legend: [['たした波', { color: 'a' }], ['包絡線 $\\pm2\\cos(\\cdots)$', { color: 'b', style: 'dash' }], ['いまの時刻', { color: 'sub', style: 'dot' }]],
      controls: [
        { range: 'f2', label: '2つめの振動数 $f_2$', min: 10, max: 14, step: 0.5, fmt: v => A.num(v, 1) + ' Hz' },
        { button: '音を聞く（440 Hz と 442 Hz）', act: st => playBeat(440, 442) },
        { button: '音を止める', act: () => stopBeat() }
      ],
      init(st) { st.t = 0; st.f2 = 12; },
      step(st, dt) { st.t += dt * 0.12; if (st.t > 1) st.t = 0; },
      draw(cv, st) { drawU(cv, st); },
      readout: st => `うなり：1秒に <b>${A.num(st.f2 - 10, 1)} 回</b>（${A.num(st.f2, 1)} − 10）　　$t$ ＝ ${A.num(st.t, 3)} s　　（図は見やすいように、ゆっくりした波でかいた）`
    },
    {
      key: 'houkei', label: '④ 波をたしていく',
      lead: '$\\sin\\theta$ に、$\\dfrac{1}{3}\\sin3\\theta$、$\\dfrac{1}{5}\\sin5\\theta$、$\\dfrac{1}{7}\\sin7\\theta$、…とたしていきます。▶ で1つずつたします。',
      note: 'たす数をふやすと、山の上が平らになり、四角い波（方形波、高さ約 0.785）に近づきます。$\\theta=90°$ では $1-\\dfrac{1}{3}+\\dfrac{1}{5}-\\dfrac{1}{7}\\approx0.724$。この考え方を**フーリエ級数**といい、第9巻（9-1）で学びます。左は、回る矢印をつないだもので、先の高さがたした値です。',
      legend: [['たした波', { color: 'a' }], ['もとの $\\sin\\theta$', { color: 'sub' }], ['方形波（高さ 0.785）', { color: 'b', style: 'dash' }]],
      controls: [
        { range: 'N', label: 'たした波の数', min: 1, max: 15, step: 1, d: 0 },
        { range: 'th', label: '角 $\\theta$', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }
      ],
      init(st) { st.N = 1; st.u = 0; st.th = 90; },
      step(st, dt) { st.u += dt; st.th = (st.th + dt * 40) % 360; st.N = Math.min(15, 1 + Math.floor(st.u / 1.2)); if (st.u > 1.2 * 15) return false; },
      draw(cv, st) { drawH(cv, st); },
      readout: st => { let s = 0; for (let k = 0; k < st.N; k++) s += Math.sin((2 * k + 1) * 90 * D21) / (2 * k + 1); return `たした波の数 ${st.N}　　$\\theta$ ＝ 90° の値 ＝ <b>${A.num(s, 3)}</b>（→ 0.785）`; }
    }
  ]
});

// 音（うなり）：Web Audio。小さな音で4秒だけ
function playBeat(f1, f2) {
  try {
    stopBeat();
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = new C(), g = ctx.createGain(), now = ctx.currentTime;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.08, now + 0.2); g.gain.setValueAtTime(0.08, now + 3.6); g.gain.linearRampToValueAtTime(0, now + 4);
    g.connect(ctx.destination);
    const os = [f1, f2].map(f => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(g); o.start(now); o.stop(now + 4.05); return o; });
    audio21 = { ctx, os };
    setTimeout(() => { if (audio21 && audio21.ctx === ctx) stopBeat(); }, 4300);
  } catch (e) { audio21 = null; }
}
function stopBeat() { if (!audio21) return; try { audio21.os.forEach(o => { try { o.stop(); } catch (e) { /* もう止まっている */ } }); audio21.ctx.close(); } catch (e) { /* 何もしない */ } audio21 = null; }

function views(cv, Y, x1) {
  const c = cv.view({ x0: -Y, x1: Y, y0: -Y, y1: Y, box: [10, 14, 300, 360], equal: true });
  const g = cv.view({ x0: 0, x1: x1, y0: -Y, y1: Y, box: [330, 14, 530, 360] });
  return { c, g };
}

function drawG(cv, st) {
  const { c, g } = views(cv, 2.3, 380);
  c.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2] });
  g.axes({ xt: [90, 180, 270, 360], yt: [-2, -1, 1, 2], xfmt: v => v + '°', xl: 'θ', yl: 'y' });
  const d = st.dl * D21, R = 2 * Math.cos(d / 2);
  g.plot(x => R, { color: 'c', style: 'dot', width: 1, x0: 0, x1: 360 });
  g.plot(x => Math.sin(x * D21), { x1: 360, color: 'a', width: 2.5 });
  g.plot(x => Math.sin(x * D21 + d), { x1: 360, color: 'b', width: 2.5, style: 'dash' });
  g.plot(x => Math.sin(x * D21) + Math.sin(x * D21 + d), { x1: 360, color: 'c', width: 3.5 });
  const pk = 90 - st.dl / 2;
  if (R > 0.05) { g.dot(pk, R, { r: 7, color: 'c', shape: 'diamond' }); g.text('山 ' + A.num(R, 2) + '（' + A.num(pk, 0) + '°）', pk + 8, R + 0.25, { size: 15, color: 'c', bold: true, bg: true }); }
  const t = st.th * D21, p1 = [Math.cos(t), Math.sin(t)], p2 = [p1[0] + Math.cos(t + d), p1[1] + Math.sin(t + d)];
  c.circle(0, 0, 1, { color: 'sub', width: 1 });
  c.arrow(0, 0, p1[0], p1[1], { color: 'a', width: 3 });
  c.arrow(p1[0], p1[1], p2[0], p2[1], { color: 'b', width: 3, style: 'dash' });
  c.arrow(0, 0, p2[0], p2[1], { color: 'c', width: 3.5 });
  c.dot(p2[0], p2[1], { r: 6, color: 'c' });
  cv.line([[c.X(p2[0]), c.Y(p2[1])], [g.X(st.th), g.Y(p2[1])]], { color: 'sub', style: 'dash', width: 1 });
  g.dot(st.th, p2[1], { r: 6, color: 'c' }); g.dot(st.th, Math.sin(t), { r: 5, color: 'a' }); g.dot(st.th, Math.sin(t + d), { r: 5, color: 'b', shape: 'square' });
  c.text(Math.round(st.dl) + '°', p1[0] + 0.35 * Math.cos(t + d / 2), p1[1] + 0.35 * Math.sin(t + d / 2), { size: 14, color: 'b' });
}

function drawK(cv, st) {
  const { c, g } = views(cv, 8.3, 380);
  c.axes({ xt: [-8, -4, 4, 8], yt: [-8, -4, 4, 8] });
  g.axes({ xt: [90, 180, 270, 360], yt: [-8, -4, 4, 8], xfmt: v => v + '°', xl: 'θ', yl: 'y' });
  const a = st.a, b = st.b, R = Math.hypot(a, b), al = Math.atan2(b, a), t = st.th * D21;
  g.plot(() => a + b, { x1: 360, color: 'd', style: 'dot', width: 2 }); g.text('係数の和 a＋b ＝ ' + A.num(a + b, 1), 200, a + b + (a + b > 0 ? 0.6 : -0.6), { size: 15, color: 'd', bg: true });
  g.plot(() => R, { x1: 360, color: 'c', style: 'dot', width: 1 }); g.plot(() => -R, { x1: 360, color: 'c', style: 'dot', width: 1 });
  g.plot(x => a * Math.sin(x * D21), { x1: 360, color: 'a', width: 2.5 });
  g.plot(x => b * Math.cos(x * D21), { x1: 360, color: 'b', width: 2.5, style: 'dash' });
  g.plot(x => a * Math.sin(x * D21) + b * Math.cos(x * D21), { x1: 360, color: 'c', width: 3.5 });
  const pk = (90 - al / D21 + 360) % 360; g.dot(pk, R, { r: 7, color: 'c', shape: 'diamond' }); g.text('山 ' + A.num(R, 2), pk + 8, R + 0.8, { size: 15, color: 'c', bold: true, bg: true });
  c.circle(0, 0, R, { color: 'c', width: 1, style: 'dot' });
  const p1 = [a * Math.cos(t), a * Math.sin(t)], p2 = [p1[0] + b * Math.cos(t + Math.PI / 2), p1[1] + b * Math.sin(t + Math.PI / 2)];
  if (Math.abs(a) > 0.05) c.arrow(0, 0, p1[0], p1[1], { color: 'a', width: 3 });
  if (Math.abs(b) > 0.05) c.arrow(p1[0], p1[1], p2[0], p2[1], { color: 'b', width: 3, style: 'dash' });
  if (R > 0.05) c.arrow(0, 0, p2[0], p2[1], { color: 'c', width: 3.5 });
  c.dot(p2[0], p2[1], { r: 6, color: 'c' });
  cv.line([[c.X(p2[0]), c.Y(p2[1])], [g.X(st.th), g.Y(p2[1])]], { color: 'sub', style: 'dash', width: 1 });
  g.dot(st.th, p2[1], { r: 6, color: 'c' });
  if (st.th < 2) c.text('(' + A.num(a, 1) + ', ' + A.num(b, 1) + ')', p2[0] + 0.3, p2[1] + 0.6, { size: 15, bg: true });
}

function drawU(cv, st) {
  const { c, g } = views(cv, 2.6, 1.06);
  const f1 = 10, f2 = st.f2, df = f2 - f1;
  c.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2] });
  g.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [-2, 2], xfmt: v => A.num(v, 2).replace(/0$/, ''), xl: 't（s）', yl: 'y' });
  g.plot(x => 2 * Math.cos(Math.PI * df * x), { x1: 1, color: 'b', width: 2, style: 'dash' });
  g.plot(x => -2 * Math.cos(Math.PI * df * x), { x1: 1, color: 'b', width: 2, style: 'dash' });
  g.plot(x => Math.sin(2 * Math.PI * f1 * x) + Math.sin(2 * Math.PI * f2 * x), { x1: 1, color: 'a', width: 1.8, n: 800 });
  g.line([[st.t, -2.2], [st.t, 2.2]], { color: 'sub', style: 'dot', width: 1.5 });
  if (df > 0) for (let k = 0; k * (1 / df) <= 1.0001; k++) g.text('大', k / df, 2.35, { size: 15, align: 'center', bold: true, bg: true });
  // 回る矢印（高さが sin の値）
  const a1 = 2 * Math.PI * f1 * st.t, a2 = 2 * Math.PI * f2 * st.t;
  const v1 = [Math.cos(a1), Math.sin(a1)], v2 = [Math.cos(a2), Math.sin(a2)], s = [v1[0] + v2[0], v1[1] + v2[1]];
  c.circle(0, 0, 1, { color: 'sub', width: 1 });
  c.arrow(0, 0, v1[0], v1[1], { color: 'a', width: 2.5 });
  c.arrow(v1[0], v1[1], s[0], s[1], { color: 'b', width: 2.5, style: 'dash' });
  c.arrow(0, 0, s[0], s[1], { color: 'c', width: 3 });
  c.circle(0, 0, Math.hypot(s[0], s[1]), { color: 'c', width: 1, style: 'dot' });
  cv.line([[c.X(s[0]), c.Y(s[1])], [g.X(st.t), g.Y(s[1])]], { color: 'sub', style: 'dash', width: 1 });
  g.dot(st.t, s[1], { r: 6, color: 'a' });
  c.text('10 Hz', -2.5, -1.85, { size: 14, color: 'a' }); c.text(A.num(f2, 1) + ' Hz', -2.5, -2.15, { size: 14, color: 'b' });
  c.text('つないだ矢印の長さ ' + A.num(Math.hypot(s[0], s[1]), 2), -2.5, -2.45, { size: 14, color: 'c' });
}

function drawH(cv, st) {
  const { c, g } = views(cv, 1.25, 380);
  c.axes({ xt: [-1, 1], yt: [-1, 1] });
  g.axes({ xt: [90, 180, 270, 360], yt: [-1, -0.785, 0.785, 1], xfmt: v => v + '°', yfmt: v => A.num(v, Math.abs(v) < 1 ? 3 : 0), xl: 'θ', yl: 'y' });
  const N = st.N, F = x => { let s = 0; for (let k = 0; k < N; k++) s += Math.sin((2 * k + 1) * x * D21) / (2 * k + 1); return s; };
  g.plot(x => Math.sin(x * D21), { x1: 360, color: 'sub', width: 1.5, alpha: 0.6 });
  g.line([[0, 0.785], [180, 0.785], [180, -0.785], [360, -0.785]], { color: 'b', style: 'dash', width: 2 });
  g.plot(F, { x1: 360, color: 'a', width: 3, n: 600 });
  // 回る矢印をつなぐ
  let p = [0, 0];
  for (let k = 0; k < N; k++) {
    const m = 2 * k + 1, r = 1 / m, a = m * st.th * D21, q = [p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)];
    if (k < 6) c.circle(p[0], p[1], r, { color: 'grid', width: 1 });
    c.line([p, q], { color: k % 2 ? 'b' : 'a', width: k === 0 ? 2.5 : 1.8 });
    p = q;
  }
  c.dot(p[0], p[1], { r: 5, color: 'a' });
  cv.line([[c.X(p[0]), c.Y(p[1])], [g.X(st.th), g.Y(p[1])]], { color: 'sub', style: 'dash', width: 1 });
  g.dot(st.th, p[1], { r: 6, color: 'a' });
  const v90 = F(90); g.dot(90, v90, { r: 7, color: 'b', shape: 'diamond' }); g.text(A.num(v90, 3), 98, v90 + 0.13, { size: 15, color: 'b', bold: true, bg: true });
  c.text(N + ' 本の矢印', -1.2, -1.15, { size: 15 });
}
