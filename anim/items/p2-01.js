// @id p2-01
// @title 単振動は回る点の影
// @vol 物理3
// @from 物理 波-1 ②（p3-01 の図「回る点の影」、ばねとおもり）／電-8・電-10・原-5、数学 6-10 でも使う
'use strict';
// 単振動 x = A sin(ωt + φ) を、半径 A・角速度 ω で回る点 P の影として見せる。
// ④ の数は本の例（ばね定数 200 N/m、0.5 kg で 0.31 s、2 kg で 0.63 s）。
A.item({
  id: 'p2-01', title: '単振動は回る点の影',
  from: '物理 第3巻 波-1 ② の図「円を回る点Pの影」から（電-8・電-10・原-5、数学 6-10 でも使う）',
  W: 880, H: 420,
  state: { t: 0, A: 1, w: 1, ph: 0, k: 200, m: 0.5 },
  scenes: [
    {
      key: 'kage', label: '① 影が上下する',
      lead: '円を回る点 P に横から光を当てると、影（たての軸の上の点）は上下にゆれ、右のグラフをかきます。',
      note: '影の高さは $x=A\\sin(\\omega t+\\phi)$ です。ばねにつるしたおもり（左の図）も、影とまったく同じ動きをします。単振動は「回る点の影」です。1周する時間が周期 $T$ で、$\\omega T=2\\pi$ です。',
      legend: [['影の高さ $x$（おもりの位置）', { color: 'a' }], ['P と影を結ぶ光の線', { color: 'sub', style: 'dash' }], ['P', { color: 'b', shape: 'circle', noline: true }], ['影', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ range: 'w', label: '角速度 $\\omega$〔rad/s〕', min: 0.5, max: 3, step: 0.05, on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { adv(st, dt, 1); },
      draw(cv, st) { scene(cv, st, {}); },
      readout: st => `$\\omega$ ＝ ${A.num(st.w, 2)} rad/s　　周期 $T=2\\pi/\\omega$ ＝ <b>${A.num(2 * Math.PI / st.w, 2)} s</b>　　振動数 $f=1/T$ ＝ ${A.num(st.w / 2 / Math.PI, 3)} Hz`
    },
    {
      key: 'isou', label: '② 振幅と初期位相',
      lead: '振幅 $A$ と初期位相 $\\phi$ を変えると、どこから、どれだけゆれ始めるかが変わります。',
      note: '$\\phi$ は、時刻 0 に P がどの角にいたかです。$\\phi$ を変えるとグラフは左右にずれ、$A$ を変えると高さが変わります。でも周期 $T$ は変わりません。$A$ と $\\phi$ は「はじめにどこから、どんな速さで放したか」で決まり、$\\omega$ はばねとおもりだけで決まります。',
      legend: [['$x=A\\sin(\\omega t+\\phi)$', { color: 'a' }], ['$\\phi=0$・$A=1$ のとき（比べるため）', { color: 'sub', style: 'dot' }], ['時刻 0 の P', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'A', label: '振幅 $A$', min: 0.3, max: 1.3, step: 0.05 }, { range: 'ph', label: '初期位相 $\\phi$', min: -Math.PI, max: Math.PI, step: Math.PI / 12, fmt: v => Math.round(v * 180 / Math.PI) + '°' }],
      step(st, dt) { adv(st, dt, 1); },
      draw(cv, st) { scene(cv, st, { ref: true }); },
      readout: st => `時刻 0 の位置 $x=A\\sin\\phi$ ＝ ${A.num(st.A * Math.sin(st.ph), 2)}　　時刻 0 の速度 $A\\omega\\cos\\phi$ ＝ ${A.num(st.A * st.w * Math.cos(st.ph), 2)}　　周期 ${A.num(2 * Math.PI / st.w, 2)} s（変わらない）`
    },
    {
      key: 'sokudo', label: '③ 速度と加速度',
      lead: 'P の速度の矢印（円の接線）と、P の加速度の矢印（中心向き）の、影（上下の成分）を見ましょう。',
      note: '速度は $v=A\\omega\\cos(\\omega t+\\phi)$、加速度は $a=-\\omega^2x$ です。いちばん速いのはまん中（$x=0$）を通るときで $A\\omega$、加速度がいちばん大きいのは、はし（$x=\\pm A$）で $A\\omega^2$ です。加速度は、いつもずれと反対向きです。',
      legend: [['位置 $x$', { color: 'a' }], ['速度 $v$', { color: 'c', style: 'dash' }], ['加速度 $a$', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'w', label: '角速度 $\\omega$〔rad/s〕', min: 0.5, max: 1.5, step: 0.05, on: st => { st.t = 0; } }],
      state: { w: 1 },
      autoplay: true,
      step(st, dt) { adv(st, dt, 1); },
      draw(cv, st) { scene(cv, st, { vel: true }); },
      readout: st => { const p = st.w * st.t + st.ph; return `$x$ ＝ ${A.num(st.A * Math.sin(p), 2)}　　$v$ ＝ ${A.num(st.A * st.w * Math.cos(p), 2)}　　$a=-\\omega^2x$ ＝ ${A.num(-st.w * st.w * st.A * Math.sin(p), 2)}`; }
    },
    {
      key: 'bane', label: '④ ばねとおもり',
      lead: 'ばね定数 $k$ と質量 $m$ を変えて、周期 $T=2\\pi\\sqrt{m/k}$ を確かめましょう（動きは10分の1の速さで見せています）。',
      note: '質量を4倍にすると、周期は2倍です（200 N/m のばねで、0.5 kg なら 0.31 s、2 kg なら 0.63 s）。周期は $\\sqrt m$ に比例して、ゆっくり増えます。振幅にはよりません。',
      miss: '$\\omega$ と $f$ を取り違えないように。$\\omega_{\\mathrm n}=20$ rad/s は「1秒に20回ゆれる」ではありません。1秒の往復の回数は $f=\\omega_{\\mathrm n}/(2\\pi)\\approx3.2$ Hz です。',
      legend: [['$T=2\\pi\\sqrt{m/k}$（いまの $k$）', { color: 'a' }], ['いまの $m$', { color: 'b', shape: 'circle', noline: true }], ['本の例（200 N/m）', { color: 'sub', shape: 'square', noline: true }]],
      controls: [{ range: 'k', label: 'ばね定数 $k$〔N/m〕', min: 50, max: 800, step: 10, d: 0, on: st => { st.t = 0; } }, { range: 'm', label: '質量 $m$〔kg〕', min: 0.1, max: 2.2, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      state: { A: 1, ph: 0 },
      autoplay: true,
      step(st, dt) { adv(st, dt, 0.1); },
      draw(cv, st) { bane(cv, st); },
      readout: st => { const w = Math.sqrt(st.k / st.m); return `$\\omega_{\\mathrm n}=\\sqrt{k/m}$ ＝ ${A.num(w, 1)} rad/s　　$f=\\omega_{\\mathrm n}/2\\pi$ ＝ ${A.num(w / 2 / Math.PI, 2)} Hz　　$T$ ＝ <b>${A.num(2 * Math.PI / w, 2)} s</b>`; }
    }
  ]
});

// 時刻を進める（sl は見せる速さ：1 はそのまま、0.1 は10分の1）。グラフのはしまで来たら、はじめから
function adv(st, dt, sl) { st.t += dt * sl; const tm = sl < 1 ? 1.2 : 12.5; if (st.t > tm) st.t = 0; }

// ばね（ジグザグ）を (x, y1)〜(x, y2) にかく
function spring(cv, x, y1, y2, o) {
  const n = 12, pts = [[x, y1], [x, y1 + 8]];
  for (let i = 1; i < n; i++) pts.push([x + (i % 2 ? 12 : -12), y1 + 8 + (y2 - y1 - 16) * i / n]);
  pts.push([x, y2 - 8], [x, y2]);
  cv.line(pts, Object.assign({ color: 'sub', width: 2 }, o || {}));
}

function scene(cv, st, o) {
  const R = 1.6;
  // 円とグラフのたての目もりをそろえる（影の高さがグラフの高さと同じになるように）
  const s = 360 / (2 * R), hw = 160 / s;
  const c = cv.view({ x0: -hw, x1: hw, y0: -R, y1: R, box: [0, 30, 320, 360] });
  const sx = 350;                  // 影の軸（ばねをつるす所）
  const g = cv.view({ x0: 0, x1: 12.5, y0: -R, y1: R, box: [425, 30, 440, 360] });
  c.axes({ xt: [], yt: [] });
  c.circle(0, 0, st.A, { color: 'sub', width: 1.5 });
  g.axes({ xt: A.range(0, 12, 2), yt: [-1, 1], xl: 't〔s〕', yl: 'x', xlItalic: false, ylItalic: true });
  const ph = st.ph, w = st.w, p = w * st.t + ph, px = st.A * Math.cos(p), py = st.A * Math.sin(p);
  // A と −A の点線
  for (const s of [1, -1]) cv.line([[g.X(0), g.Y(s * st.A)], [g.X(12.5), g.Y(s * st.A)]], { color: 'sub', style: 'dot', width: 1 });
  cv.text('A', g.X(0) - 7, g.Y(st.A) - 12, { align: 'right', math: true, italic: true, color: 'sub' });
  if (o.ref) g.plot(t => Math.sin(w * t), { color: 'sub', style: 'dot', width: 2 });
  g.plot(t => st.A * Math.sin(w * t + ph), { x0: 0, x1: st.t, color: 'a', width: 3 });
  if (o.vel) {
    const sc = 1 / Math.max(1, w);
    g.plot(t => st.A * w * Math.cos(w * t + ph) * sc, { x0: 0, x1: st.t, color: 'c', style: 'dash', width: 2 });
    g.plot(t => -st.A * w * w * Math.sin(w * t + ph) * sc * sc, { x0: 0, x1: st.t, color: 'd', style: 'dot', width: 2.5 });
  }
  // 周期 T の寸法（1周期より長くかいたら）
  const T = 2 * Math.PI / w;
  if (st.t > T * 1.05 && !o.vel) {
    let t0 = ((Math.PI / 2 - ph) / w) % T; if (t0 < 0) t0 += T;
    if (t0 + T <= Math.min(st.t, 12.5)) {
      const yy = st.A + 0.22;
      g.arrow(t0 + T / 2, yy, t0, yy, { color: 'ink', width: 1.5, head: 8 }); g.arrow(t0 + T / 2, yy, t0 + T, yy, { color: 'ink', width: 1.5, head: 8 });
      g.text('周期 T', t0 + T / 2, yy + 0.16, { align: 'center', bg: true, size: 15 });
    }
  }
  // 円と P
  const a0 = Math.min(0.3, st.A * 0.4);
  cv.line(A.range(0, 1, 0.05).map(u => c.P([a0 * Math.cos(u * (((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))), a0 * Math.sin(u * (((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)))])), { color: 'ink', width: 1.2 });
  cv.text('ωt+φ', c.X(a0 + 0.08), c.Y(-0.18), { size: 15, math: true, italic: true });
  c.line([[0, 0], [px, py]], { color: 'ink', width: 2 });
  // 光の線と影の軸
  cv.line([[sx, c.Y(-R) + 10], [sx, c.Y(R) - 6]], { color: 'sub', width: 1 });
  cv.line([c.P([px, py]), [sx, c.Y(py)]], { color: 'sub', style: 'dash', width: 1.2 });
  cv.line([[sx, c.Y(py)], [g.X(Math.min(st.t, 12.5)), g.Y(py)]], { color: 'sub', style: 'dash', width: 1 });
  // ばねとおもり（影と同じ高さ）
  cv.rect(sx - 26, 22, 52, 8, { fill: 'sub', alpha: 0.4 });
  spring(cv, sx, 30, c.Y(py) - 14);
  cv.rect(sx - 15, c.Y(py) - 14, 30, 28, { fill: 'a', alpha: 0.35, color: 'a', width: 2 });
  cv.dot(sx, c.Y(py), { color: 'a', shape: 'square', r: 5 });
  if (o.vel) {
    const vv = st.A * w * Math.cos(p), aa = -w * w * st.A * Math.sin(p), s = c.sy * 0.55;
    c.arrow(px, py, px - st.A * w * Math.sin(p) * 0.55, py + vv * 0.55, { color: 'c', style: 'dash', width: 2.5 });
    c.arrow(px, py, px - px * w * w * 0.55, py - py * w * w * 0.55, { color: 'd', style: 'dot', width: 2.5 });
    cv.arrow(sx + 26, c.Y(py), sx + 26, c.Y(py) - vv * s, { color: 'c', style: 'dash', width: 2.5 });
    cv.arrow(sx - 26, c.Y(py), sx - 26, c.Y(py) - aa * s, { color: 'd', style: 'dot', width: 2.5 });
    cv.text('v', sx + 32, c.Y(py) - vv * s * 0.5, { math: true, italic: true, color: 'c', bold: true });
    cv.text('a', sx - 42, c.Y(py) - aa * s * 0.5, { math: true, italic: true, color: 'd', bold: true });
  }
  if (o.ref) { c.dot(st.A * Math.cos(ph), st.A * Math.sin(ph), { color: 'b', shape: 'diamond', r: 6 }); g.dot(0, st.A * Math.sin(ph), { color: 'b', shape: 'diamond', r: 6 }); }
  c.dot(px, py, { color: 'b', r: 7 });
  c.text('P', px + 0.13, py + 0.16, { bold: true, math: true, italic: true, size: 17 });
  g.dot(Math.min(st.t, 12.5), py, { color: 'a', shape: 'square', r: 5 });
}

function bane(cv, st) {
  const w = Math.sqrt(st.k / st.m), T = 2 * Math.PI / w, x = Math.sin(w * st.t);
  // 左：ばねとおもり
  const sx = 70, y0 = 210;
  cv.rect(sx - 30, 22, 60, 8, { fill: 'sub', alpha: 0.4 });
  const ym = y0 - x * 110, hm = 22 + 16 * Math.sqrt(st.m);
  spring(cv, sx, 30, ym - hm / 2);
  cv.rect(sx - hm / 2 - 4, ym - hm / 2, hm + 8, hm, { fill: 'a', alpha: 0.35, color: 'a', width: 2 });
  cv.text(A.num(st.m, 1) + ' kg', sx, ym, { align: 'center', size: 14 });
  cv.line([[sx - 50, y0], [sx + 50, y0]], { color: 'sub', style: 'dash', width: 1 });
  cv.text('つり合いの', sx, y0 + 140, { size: 14, color: 'sub', align: 'center' });
  cv.text('位置（破線）', sx, y0 + 160, { size: 14, color: 'sub', align: 'center' });
  // 上：x-t（本当の時間で 0〜1.2 s）
  const g = cv.view({ x0: 0, x1: 1.2, y0: -1.4, y1: 1.4, box: [190, 25, 660, 160] });
  g.axes({ xt: A.range(0, 1.2, 0.2), yt: [-1, 1], xl: 't〔s〕', yl: 'x/A', ylItalic: true, xfmt: v => A.num(v, 1) });
  g.plot(t => Math.sin(w * t), { x0: 0, x1: st.t, color: 'a', width: 2.5, n: 900 });
  g.dot(st.t, x, { color: 'a', shape: 'square', r: 5 });
  // 1周期の寸法
  if (T < 1.15) { const yy = -1.25; g.arrow(T / 2, yy, 0, yy, { color: 'ink', width: 1.5, head: 8 }); g.arrow(T / 2, yy, T, yy, { color: 'ink', width: 1.5, head: 8 }); g.text('T ＝ ' + A.num(T, 2) + ' s', T / 2, yy, { align: 'center', bg: true, size: 15 }); }
  // 下：T と m（いまの k）
  const h = cv.view({ x0: 0, x1: 2.3, y0: 0, y1: 1.4, box: [190, 245, 440, 150] });
  h.axes({ xt: [0.5, 1, 1.5, 2], yt: [0.31, 0.63, 1.26], xl: 'm〔kg〕', yl: 'T〔s〕', yfmt: v => A.num(v, 2) });
  h.plot(m => 2 * Math.PI * Math.sqrt(m / 200), { color: 'sub', style: 'dash', width: 1.5 });
  h.plot(m => 2 * Math.PI * Math.sqrt(m / st.k), { color: 'a', width: 3 });
  h.dot(0.5, 0.314, { color: 'sub', shape: 'square', r: 5 }); h.dot(2, 0.628, { color: 'sub', shape: 'square', r: 5 });
  h.dot(st.m, T, { color: 'b', r: 7 });
  cv.text('質量を4倍 → 周期は2倍', 660, 290, { size: 15 });
  cv.text('200 N/m のばね（破線）で', 660, 318, { size: 15, color: 'sub' });
  cv.text('0.5 kg：0.31 s、2 kg：0.63 s', 660, 343, { size: 15, color: 'sub' });
}
