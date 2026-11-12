// @id p2-20
// @title 交流：回る矢印・位相のずれ・電力
// @vol 物理4
// @from 物理 電-8 ⑤（p4-08:415・447）→ 電-10 ③④（p4-10:259・308）→ 電-11 ②③（p4-11:218・243）
'use strict';
// 記号は本と同じ：ℰ＝NBSω sin ωt、フェーザ（長さは実効値、横の影）、X_L＝ωL、X_C＝1/(ωC)、v＝√2V sin ωt、i＝√2I sin(ωt−φ)、P＝VI cos φ
const DEG = Math.PI / 180;
A.item({
  id: 'p2-20', title: '交流：回る矢印・位相のずれ・電力',
  from: '物理 第4巻 電-8 ⑤「発電機」、電-10 ③「フェーザ」・④「抵抗・コイル・コンデンサー」、電-11 ②③「瞬時電力と力率」の図から',
  W: 880, H: 430,
  state: { th: 0, f: 50, B: 0.5, part: 'L', fr: 50, phi: 37 },
  scenes: [
    {
      key: 'hatsuden', label: '① 発電機',
      lead: '一様な磁場の中でコイルが回ると、起電力は回る矢印の影（正弦波）になります。例題3 の発電機（$N=100$、$S=0.01$ m²、$B=0.5$ T、50 Hz）です。',
      note: '磁束 $\\Phi=BS\\cos\\omega t$ がいちばん大きい（コイルの面が磁場に垂直な）とき、起電力は 0。磁束が 0（面が磁場にそっている）とき、起電力はいちばん大きくなります。起電力 $ℰ=NBS\\omega\\sin\\omega t$ は、磁束のグラフと 4分の1周期（90°）ずれています。回す速さを2倍にすると、山の高さも周波数も2倍になります。',
      legend: [['起電力 $ℰ$（回る矢印のたての影）', { color: 'b', width: 3 }], ['磁束 $\\Phi$（大きさはそろえてかいた）', { color: 'a', style: 'dash' }], ['コイルの面の向き $\\vec n$', { color: 'c', width: 3 }]],
      controls: [
        { range: 'f', label: '周波数 $f$〔Hz〕', min: 25, max: 100, step: 5, d: 0 },
        { range: 'B', label: '磁場 $B$〔T〕', min: 0.1, max: 0.5, step: 0.05, d: 2 }
      ],
      autoplay: true,
      step(st, dt) { st.th += dt * Math.PI * st.f / 50; if (st.th > 1e4) st.th = 0; },
      draw: drawGen,
      readout: st => { const w = 2 * Math.PI * st.f, Em = 100 * st.B * 0.01 * w; return `$ℰ_{\\max}=NBS\\omega$ ＝ 100 × ${A.num(st.B, 2)} × 0.01 × 2π × ${st.f} ＝ <b>${A.num(Em, 1)} V</b>　いまの $ℰ$ ＝ ${A.num(Em * Math.sin(st.th), 1)} V（画面では、ゆっくり回している）`; }
    },
    {
      key: 'rlc', label: '② 進む・おくれる',
      lead: '電圧の矢印（フェーザ）と電流の矢印が、いっしょに左回りに回ります。横の影が、そのときの値です。部品を切りかえてみましょう。',
      note: '抵抗は電圧と電流の山が同時。**コイルの電流は電圧より 90° おくれ**（右回りに 90°）、**コンデンサーの電流は 90° 進みます**（左回りに 90°）。大きさの比はリアクタンス $X_L=\\omega L$、$X_C=1/(\\omega C)$ で、周波数で変わります（例題：$L=10$ mH、$C=1\\,\\mu$F、$R=20\\,\\Omega$、電圧 100 V）。',
      miss: 'コンデンサーは「電流をためるから、電流がおくれる」のではありません。$i=C\\,dv/dt$ なので、電圧が変わり始めると先に電流が流れて電荷を運びます。コンデンサーの電流は 90° **進み**、コイルの電流は 90° おくれます。',
      legend: [['電圧 $v$', { color: 'a', width: 3 }], ['電流 $i$（長さはそろえてかいた）', { color: 'b', width: 3, style: 'dash' }]],
      controls: [
        { seg: 'part', label: '部品', options: [['R', '抵抗 20 Ω'], ['L', 'コイル 10 mH'], ['C', 'コンデンサー 1 μF']] },
        { range: 'fr', label: '周波数 $f$〔Hz〕', min: 50, max: 2000, step: 10, d: 0 }
      ],
      autoplay: true,
      step(st, dt) { st.th += dt * 1.6; if (st.th > 1e4) st.th = 0; },
      draw: drawRLC,
      readout: st => { const w = 2 * Math.PI * st.fr, X = st.part === 'R' ? 20 : st.part === 'L' ? w * 0.01 : 1 / (w * 1e-6), nm = st.part === 'R' ? '抵抗 $R$' : st.part === 'L' ? '$X_L=\\omega L$' : '$X_C=1/(\\omega C)$'; return `${nm} ＝ <b>${A.num(X, X < 100 ? 2 : 0)} Ω</b>　100 V をかけると電流 ＝ <b>${A.num(100 / X, 100 / X < 1 ? 4 : 2)} A</b>　電流は電圧より ${st.part === 'R' ? '<b>ずれない</b>' : st.part === 'L' ? '<b>90° おくれる</b>' : '<b>90° 進む</b>'}`; }
    },
    {
      key: 'denryoku', label: '③ 電流のおくれと電力',
      lead: '電圧 $v$ と、$\\phi$ だけおくれた電流 $i$ をかけた瞬時電力 $p=vi$ です。おくれ $\\phi$ を変えてみましょう。',
      note: '$p=VI\\cos\\phi-VI\\cos(2\\omega t-\\phi)$。2つめは 2倍の速さでゆれて、平均すると 0 なので、平均の電力は $P=VI\\cos\\phi$（$\\cos\\phi$ は力率）。抵抗だけ（$\\phi=0$）なら $p$ はいつもプラス、コイルだけ（$\\phi=90°$）ならプラスとマイナスが同じだけで、平均は 0 です。',
      miss: '$p$ がマイナスの時刻は、コイルが電気を「捨てている」のではありません。コイルがためた磁場のエネルギーを、**電源へ返している**時刻です（$p=vi$ の符号は、エネルギーの流れの向き）。',
      legend: [['電圧 $v$', { color: 'a', width: 2 }], ['電流 $i$', { color: 'b', width: 2, style: 'dash' }], ['瞬時電力 $p=vi$', { color: 'd', width: 3 }], ['平均 $P=VI\\cos\\phi$', { color: 'c', style: 'dot', width: 3 }]],
      controls: [{ range: 'phi', label: '電流のおくれ $\\phi$', min: -90, max: 90, step: 1, fmt: v => A.num(v, 0) + '°' }],
      autoplay: true,
      step(st, dt) { st.th += dt * 1.6; if (st.th > 1e4) st.th = 0; },
      draw: drawPower,
      readout: st => `力率 $\\cos\\phi$ ＝ cos ${A.num(st.phi, 0)}° ＝ <b>${A.num(Math.cos(st.phi * DEG), 2)}</b>　平均の電力 $P/(VI)$ ＝ <b>${A.num(Math.cos(st.phi * DEG), 2)}</b>${st.phi < 0 ? '（$\\phi<0$：電流が進む。コンデンサーの側）' : ''}`
    }
  ]
});

function drawGen(cv, st) {
  const th = st.th, w = 2 * Math.PI * st.f, Em = 100 * st.B * 0.01 * w, YM = 330;
  const T = 1 / st.f, tNow = (th / (2 * Math.PI)) * T, t0 = Math.max(0, tNow - 0.04);
  const gg = cv.view({ x0: t0, x1: t0 + 0.04, y0: -YM, y1: YM, box: [480, 40, 380, 350] });
  // 左：コイルを、回る軸の向きから見る（B は右向き）。n の向きに、長さ ℰmax の矢印をかくと、そのたての影が ℰ
  const cx = 240, cy = gg.Y(0), R = 70, r = Em * gg.sy;
  for (let y = -150; y <= 150; y += 50) cv.arrow(cx - 210, cy + y, cx + 200, cy + y, { color: 'sub', width: 1.2, head: 9, alpha: 0.55 });
  cv.text('B', cx + 190, cy - 165, { size: 17, bold: true, italic: true, color: 'sub' });
  const ex = Math.sin(th), ey = Math.cos(th), nx = Math.cos(th), ny = Math.sin(th);
  cv.circle(cx, cy, r, { color: 'b', width: 1.2, style: 'dot' });
  cv.line([[cx - R * ex, cy - R * ey], [cx + R * ex, cy + R * ey]], { color: 'ink', width: 8 });
  cv.dot(cx - R * ex, cy - R * ey, { color: 'ink', r: 6 }); cv.dot(cx + R * ex, cy + R * ey, { color: 'ink', r: 6, shape: 'square', open: true });
  cv.arrow(cx, cy, cx + r * nx, cy - r * ny, { color: 'b', width: 3 });
  cv.arrow(cx, cy, cx + 55 * nx, cy - 55 * ny, { color: 'c', width: 4 });
  cv.text('n', cx + 40 * nx - 14 * ny, cy - 40 * ny - 14 * nx, { size: 17, bold: true, italic: true, color: 'c', align: 'center', bg: true });
  cv.dot(cx, cy, { color: 'ink', r: 4 });
  const qx = cx + r * nx, qy = cy - r * ny;
  cv.line([[qx, qy], [qx, cy]], { color: 'b', width: 1.5, style: 'dot' });
  cv.text('回る軸の向きから見たコイル', 20, 22, { size: 14, color: 'sub' });
  cv.text(`Φ = BS cos ωt ＝ ${A.num(Math.cos(th), 2)} BS`, 20, 412, { size: 15, color: 'a' });
  // 右：グラフ（ms）
  gg.axes({ xt: A.range(Math.ceil(t0 / 0.01 - 1e-9) * 0.01, t0 + 0.04, 0.01), yt: [-300, -150, 150, 300], xfmt: v => A.num(v * 1000, 0), ay: t0 });
  cv.text('t（ms）', 862, gg.Y(0) + 32, { size: 14, color: 'sub', align: 'right' });
  cv.text('ℰ（V）', 488, 26, { size: 14, color: 'sub' });
  gg.plot(t => Em * Math.cos(2 * Math.PI * st.f * t), { color: 'a', style: 'dash', width: 2, x1: tNow });
  gg.plot(t => Em * Math.sin(2 * Math.PI * st.f * t), { color: 'b', width: 3, x1: tNow, n: 500 });
  cv.line([[qx, qy], [gg.X(tNow), qy]], { color: 'sub', width: 1, style: 'dash' });
  gg.dot(tNow, Em * Math.sin(th), { color: 'b', r: 6 });
  for (const v of [Em, -Em]) gg.line([[t0, v], [t0 + 0.04, v]], { color: 'b', width: 1, style: 'dot', alpha: 0.6 });
  gg.text(A.num(Em, 1) + ' V', t0 + 0.0395, Em + 18, { size: 14, color: 'b', align: 'right', bg: true });
}

function drawRLC(cv, st) {
  const th = st.th, d = st.part === 'R' ? 0 : st.part === 'L' ? -90 : 90;   // 電流の角（電圧に対して）
  const cx = 190, cy = 215, R = 150;
  cv.line([[cx - R - 20, cy], [cx + R + 20, cy]], { color: 'sub', width: 1.2 }); cv.line([[cx, cy - R - 20], [cx, cy + R + 20]], { color: 'sub', width: 1.2 });
  cv.text('実部（横の影）', cx - R - 18, cy + 18, { size: 14, color: 'sub' });
  cv.text('虚部', cx + 8, cy - R - 12, { size: 14, color: 'sub' });
  cv.circle(cx, cy, R, { color: 'grid', width: 1 });
  const va = th, ia = th + d * DEG, Ri = R * 0.72;
  cv.arrow(cx, cy, cx + R * Math.cos(va), cy - R * Math.sin(va), { color: 'a', width: 3.5 });
  cv.arrow(cx, cy, cx + Ri * Math.cos(ia), cy - Ri * Math.sin(ia), { color: 'b', width: 3.5, style: 'dash' });
  cv.text('V', cx + (R + 16) * Math.cos(va), cy - (R + 16) * Math.sin(va), { size: 17, bold: true, italic: true, color: 'a', align: 'center' });
  cv.text('I', cx + (Ri + 16) * Math.cos(ia), cy - (Ri + 16) * Math.sin(ia), { size: 17, bold: true, italic: true, color: 'b', align: 'center' });
  // 横の影
  cv.dot(cx + R * Math.cos(va), cy, { color: 'a', r: 6 }); cv.dot(cx + Ri * Math.cos(ia), cy + 0, { color: 'b', r: 6, shape: 'square' });
  // 角の弧
  if (d) { const pts = []; for (let k = 0; k <= 20; k++) { const a = va + d * DEG * k / 20; pts.push([cx + 50 * Math.cos(a), cy - 50 * Math.sin(a)]); } cv.line(pts, { color: 'ink', width: 2 }); cv.arrow(pts[18][0], pts[18][1], pts[20][0], pts[20][1], { color: 'ink', width: 2, head: 10 }); const am = va + d * DEG / 2; cv.text('90°', cx + 70 * Math.cos(am), cy - 70 * Math.sin(am), { size: 15, align: 'center', bg: true }); }
  // 右：時間のグラフ（ωt を横に）
  const t1 = th, t0 = th - 4 * Math.PI;
  const g = cv.view({ x0: t0, x1: t1, y0: -1.3, y1: 1.3, box: [410, 40, 450, 340] });
  g.axes({ yt: [-1, 1], grid: false, ylabels: false, ay: t0, xt: [] });
  cv.text('ωt →（右がいま）', 860, 400, { size: 14, color: 'sub', align: 'right' });
  g.plot(x => Math.cos(x), { color: 'a', width: 3, n: 500 });
  g.plot(x => 0.72 * Math.cos(x + d * DEG), { color: 'b', width: 3, style: 'dash', n: 500 });
  g.dot(t1, Math.cos(t1), { color: 'a', r: 6 }); g.dot(t1, 0.72 * Math.cos(t1 + d * DEG), { color: 'b', r: 6, shape: 'square' });
  // いちばん新しい電圧の山と電流の山に印
  const lastPeak = (off, amp, col, sh, lab) => { let x = Math.floor((t1 + off) / (2 * Math.PI)) * 2 * Math.PI - off; if (x > t1) x -= 2 * Math.PI; g.dot(x, amp, { color: col, r: 7, shape: sh }); g.text(lab, x, amp + 0.17, { size: 14, color: col, align: 'center', bg: true }); };
  lastPeak(0, 1, 'a', 'circle', 'v の山');
  lastPeak(d * DEG, 0.72, 'b', 'square', 'i の山');
  cv.text(st.part === 'R' ? '山は同時' : st.part === 'L' ? 'i の山は v の山より 90° あと（おくれ）' : 'i の山は v の山より 90° 先（進み）', 635, 24, { size: 16, bold: true, align: 'center' });
}

function drawPower(cv, st) {
  const ph = st.phi * DEG, t1 = st.th, t0 = t1 - 4 * Math.PI;
  const v = x => Math.SQRT2 * Math.sin(x), i = x => Math.SQRT2 * Math.sin(x - ph), p = x => v(x) * i(x);
  const g = cv.view({ x0: t0, x1: t1, y0: -1.6, y1: 2.3, box: [60, 30, 560, 370] });
  g.axes({ yt: [-1, 1, 2], grid: true, ay: t0, xt: [], yfmt: y => A.num(y, 0) });
  cv.text('（たての目もりは p/(VI)、v/V、i/I）', 66, 18, { size: 14, color: 'sub' });
  cv.text('ωt →（右がいま）', 620, 410, { size: 14, color: 'sub', align: 'right' });
  // p がマイナスの所をぬる
  g.area(x => Math.min(0, p(x)), t0, t1, { fill: 'b', alpha: 0.22, n: 500 });
  g.area(x => Math.max(0, p(x)), t0, t1, { fill: 'd', alpha: 0.12, n: 500 });
  g.plot(v, { color: 'a', width: 2 }); g.plot(i, { color: 'b', width: 2, style: 'dash' });
  g.plot(p, { color: 'd', width: 3, n: 600 });
  g.line([[t0, Math.cos(ph)], [t1, Math.cos(ph)]], { color: 'c', width: 3, style: 'dot' });
  g.text('P = VI cos φ', t0 + 0.2, Math.cos(ph) + 0.15, { size: 15, color: 'c', bg: true });
  if (Math.abs(st.phi) > 3) { const xm = t0 + (Math.PI / 2 + ph / 2) + (st.phi > 0 ? 0 : Math.PI); let x = xm; while (p(x) > -0.01 && x < t1) x += 0.05; if (x < t1) g.text('マイナス：電源へ返す', x, -0.75, { size: 14, color: 'b', align: 'center', bg: true }); }
  // 右：フェーザ（sin を基準にしたときの、止めた矢印）
  const cx = 750, cy = 215, R = 100;
  cv.line([[cx - R - 10, cy], [cx + R + 10, cy]], { color: 'sub', width: 1 }); cv.line([[cx, cy - R - 10], [cx, cy + R + 10]], { color: 'sub', width: 1 });
  cv.arrow(cx, cy, cx + R, cy, { color: 'a', width: 3.5 });
  cv.arrow(cx, cy, cx + R * Math.cos(-ph), cy - R * Math.sin(-ph), { color: 'b', width: 3.5, style: 'dash' });
  cv.line([[cx + R * Math.cos(ph), cy + R * Math.sin(ph)], [cx + R * Math.cos(ph), cy]], { color: 'c', width: 1.5, style: 'dot' });
  cv.line([[cx, cy + 4], [cx + R * Math.cos(ph), cy + 4]], { color: 'c', width: 5 });
  cv.text('V', cx + R + 14, cy, { size: 17, bold: true, italic: true, color: 'a', align: 'center' });
  cv.text('I', cx + (R + 14) * Math.cos(ph), cy + (R + 14) * Math.sin(ph), { size: 17, bold: true, italic: true, color: 'b', align: 'center' });
  cv.text('φ = ' + A.num(st.phi, 0) + '°', cx + 20, cy - 24 * Math.sign(st.phi || 1) + (st.phi >= 0 ? 48 : 0), { size: 15, bg: true });
  cv.text('電圧にそろった分 I cos φ', cx, cy + R + 34, { size: 14, color: 'c', align: 'center' });
}
