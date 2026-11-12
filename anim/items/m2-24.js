// @id m2-24
// @title 空間の座標：3本の軸・右手系・円柱座標・球座標
// @vol 数学4
// @uses 3d
// @from 数学 4-13 ①②⑧（ch4-13:191・239・294・639）、4-15 ③④（ch4-15:276・320）／4-14、7-7、8-5・8-6・8-12、原-5 でも使う
'use strict';
const D24 = Math.PI / 180;
const VIEWS = { mitori: [-115, 22], ue: [-90, 89], mae: [-90, 0] };
A.item({
  id: 'm2-24', title: '空間の座標：3本の軸・右手系・円柱座標・球座標',
  from: '数学 第4巻 4-13 ①「3本の軸と、3つの数」・②「右手系」・⑧「投影図」、4-15 ③「円柱座標」・④「球座標」の図から（4-14、7-7、8-5・8-6 でも使う）',
  W: 880, H: 440,
  state: { yaw: -115, pitch: 22, u: 0, x: 3, y: 4, z: 2, w: 3, mi: 'mitori', kei: 'migi', r: 3, th: 50, h: 4, R: 2, tt: 60, ph: 45 },
  scenes: [
    {
      key: 'zahyou', label: '① 3つの数で場所',
      lead: '点 P$(3,\\ 4,\\ 2)$ へは、原点 O から $x$ 軸にそって 3、$y$ の向きに 4、$z$ の向きに 2 進みます。図はドラッグで回せます。',
      note: '空間の場所は、高さ $z$ を加えた3つの数 $(x,\\ y,\\ z)$ で表せます。P から床へまっすぐ下ろした点 Q（真上から照らした影）で $x$・$y$ を読み、PQ の長さが $z$ です。O から P までの距離は $\\sqrt{x^2+y^2+z^2}$（三平方の定理を2回）。',
      miss: '見取図では、手前に出る $x$ 軸をななめに短くかいています。図の上の長さを目で読まず、座標で読みましょう。「真上から」「正面から」に切りかえると、本当の長さで見えます。',
      legend: [['① $x$ の向きに進む', { color: 'b' }], ['② $y$ の向きに進む', { color: 'a', style: 'dash' }], ['③ $z$ の向きに進む', { color: 'c', style: 'long' }], ['真上から照らした影 Q', { color: 'sub', shape: 'circle', noline: true }]],
      controls: [
        { range: 'x', label: '$x$', min: -2, max: 5, step: 0.5, d: 1 },
        { range: 'y', label: '$y$', min: -2, max: 5, step: 0.5, d: 1 },
        { range: 'z', label: '$z$', min: -2, max: 4, step: 0.5, d: 1 },
        { seg: 'mi', label: '見る向き', options: [['mitori', '見取図'], ['ue', '真上から'], ['mae', '正面から（＋x から）']], on: st => { [st.yaw, st.pitch] = VIEWS[st.mi]; } }
      ],
      init(st) { st.w = 0; },
      step(st, dt) { st.w = Math.min(3, st.w + dt * 0.8); if (st.w >= 3) return false; },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawZ(cv, st); },
      readout: st => `P(${A.num(st.x, 1)}, ${A.num(st.y, 1)}, ${A.num(st.z, 1)})　Q(${A.num(st.x, 1)}, ${A.num(st.y, 1)}, 0)　OP ＝ √(${A.num(st.x * st.x, 2)} ＋ ${A.num(st.y * st.y, 2)} ＋ ${A.num(st.z * st.z, 2)}) ＝ <b>${A.num(Math.hypot(st.x, st.y, st.z), 2)}</b>`
    },
    {
      key: 'migite', label: '② 右手系と鏡',
      lead: '$x$ 軸を $y$ 軸のほうへ 90° 回すとき、右ねじが進む向きが $z$ 軸の＋の向きです（右手系）。鏡にうつすとどうなるでしょう。',
      note: '右手の親指を $x$、人さし指を $y$、中指を $z$ に向けた並べ方が**右手系**です。鏡にうつすと $y$ 軸が反対を向いた**左手系**になり、どう回しても右手系にはもどりません（右手の手ぶくろを、回しても左手の手ぶくろにできないのと同じ）。',
      miss: '右を $x$、手前を $y$、上を $z$ にすると左手系になってしまいます。右を $x$ にしたいなら、おくを $y$ にします。',
      legend: [['$x$ から $y$ へ回す向き', { color: 'b' }], ['右ねじが進む向き', { color: 'c', style: 'long' }], ['鏡（$zx$ 平面）', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'kei', label: '軸の並べ方', options: [['migi', '右手系（この本の約束）'], ['hidari', '鏡にうつす（左手系）']] }],
      state: { yaw: -115, pitch: 22 },
      init(st) { st.kei = 'migi'; st.w = 0; st.u = 0; },
      step(st, dt) { st.w = (st.w + dt * 0.5) % 1; st.u += dt * 0.6; st.yaw = -115 + 35 * Math.sin(st.u); },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawM(cv, st); },
      readout: st => st.kei === 'migi' ? '右手系：$x$ から $y$ へ回すと、右ねじは $z$ の＋の向きへ進む' : '左手系：$x$ から $y$ へ回すと、右ねじは $z$ の<b>反対</b>の向きへ進む（4-14 の外積の符号が逆になる）'
    },
    {
      key: 'enchu', label: '③ 円柱座標',
      lead: 'タワークレーンのフックの場所は、柱からの水平な距離 $r$、うでを回した角 $\\theta$、高さ $z$ の3つの数で決まります（円柱座標）。',
      note: '$x=r\\cos\\theta$、$y=r\\sin\\theta$、$z=z$。$r$ を一定にして $\\theta$ と $z$ を動かすと、点は円柱の面の上を動きます。',
      miss: '円柱座標の $r$ は、原点からの距離ではなく、**$z$ 軸からの距離**です。$(3,\\ 0°,\\ 4)$ の点の原点からの距離は 3 ではなく $\\sqrt{3^2+4^2}=5$ です。',
      legend: [['$r$（$z$ 軸からの距離）', { color: 'b' }], ['$z$（高さ）', { color: 'c', style: 'long' }], ['原点からの距離 $\\sqrt{r^2+z^2}$', { color: 'd', style: 'dash' }]],
      controls: [
        { range: 'r', label: '$r$', min: 0.5, max: 4, step: 0.1, d: 1 },
        { range: 'th', label: '$\\theta$', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' },
        { range: 'h', label: '$z$', min: 0, max: 4.2, step: 0.1, d: 1 },
        { button: '$(3,\\ 0°,\\ 4)$', act: st => { st.r = 3; st.th = 0; st.h = 4; } }
      ],
      state: { yaw: -125, pitch: 24 },
      init(st) { st.r = 3; st.th = 50; st.h = 2; },
      step(st, dt) { st.th = (st.th + dt * 30) % 360; },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawE(cv, st); },
      readout: st => { const t = st.th * D24; return `$(x,\\ y,\\ z)$ ＝ (${A.num(st.r * Math.cos(t), 2)}, ${A.num(st.r * Math.sin(t), 2)}, ${A.num(st.h, 1)})　　原点からの距離 ＝ √(${A.num(st.r, 1)}² ＋ ${A.num(st.h, 1)}²) ＝ <b>${A.num(Math.hypot(st.r, st.h), 2)}</b>（$r$ ＝ ${A.num(st.r, 1)} ではない）`; }
    },
    {
      key: 'kyuu', label: '④ 球座標と緯度',
      lead: '原点からの距離 $r$、真上（$z$ 軸）からの角 $\\theta$、床の上の角 $\\varphi$ で、空間の点を表します（球座標）。',
      note: '$x=r\\sin\\theta\\cos\\varphi$、$y=r\\sin\\theta\\sin\\varphi$、$z=r\\cos\\theta$。地球では、$\\varphi$ が経度、$90°-\\theta$ が緯度（北緯）です。',
      miss: '球座標の $\\theta$ は、緯度と同じではありません。緯度は赤道から、$\\theta$ は北極（$z$ 軸）からはかります。北緯 35.7° の東京は $\\theta=90°-35.7°=54.3°$。',
      legend: [['OP（長さ $r$）', { color: 'b' }], ['OQ（床の上、長さ $r\\sin\\theta$）', { color: 'a', style: 'dash' }], ['赤道', { color: 'e', style: 'dot' }]],
      controls: [
        { range: 'tt', label: '$\\theta$（真上から）', min: 0, max: 180, step: 0.1, fmt: v => A.num(v, 1) + '°' },
        { range: 'ph', label: '$\\varphi$（床の上）', min: 0, max: 360, step: 0.1, fmt: v => A.num(v, 1) + '°' },
        { range: 'R', label: '$r$', min: 1, max: 2.5, step: 0.1, d: 1 },
        { button: '例題 $(2,\\ 60°,\\ 45°)$', act: st => { st.R = 2; st.tt = 60; st.ph = 45; } },
        { button: '東京（北緯 35.7°・東経 139.7°）', act: st => { st.R = 2; st.tt = 54.3; st.ph = 139.7; } }
      ],
      state: { yaw: -125, pitch: 20 },
      init(st) { st.R = 2; st.tt = 60; st.ph = 45; },
      step(st, dt) { st.ph = (st.ph + dt * 20) % 360; },
      drag: A.rotDrag([0, 0, 600, 440]),
      draw(cv, st) { drawQ(cv, st); },
      readout: st => { const t = st.tt * D24, p = st.ph * D24, r = st.R; return `$(x,\\ y,\\ z)$ ＝ (${A.num(r * Math.sin(t) * Math.cos(p), 2)}, ${A.num(r * Math.sin(t) * Math.sin(p), 2)}, ${A.num(r * Math.cos(t), 2)})　　緯度 ＝ 90° − ${A.num(st.tt, 1)}° ＝ <b>${st.tt <= 90 ? '北緯 ' + A.num(90 - st.tt, 1) : '南緯 ' + A.num(st.tt - 90, 1)}°</b>`; }
    }
  ]
});

function axes(V, L, o = {}) {
  const n = o.names || ['x', 'y', 'z'];
  const ax = [[L[0], 0, 0], [0, L[1], 0], [0, 0, L[2]]];
  ax.forEach((e, k) => {
    V.line3([e.map(v => -v * (o.neg || 0.35)), [0, 0, 0]], { color: 'sub', width: 1.2, style: 'dot', zbias: -20 });
    V.arrow3([0, 0, 0], e, { color: 'sub', width: 1.8, head: 10 });
    V.text3(n[k], e.map(v => v * 1.1), { color: 'ink', italic: true, math: true, size: 18, align: 'center', bold: true });
  });
}
function grid(V, n) { for (let k = -n; k <= n; k++) { V.line3([[k, -n, 0], [k, n, 0]], { color: 'grid', width: 1, zbias: -100 }); V.line3([[-n, k, 0], [n, k, 0]], { color: 'grid', width: 1, zbias: -100 }); } }
function circ3(c, r, n, f) { const pts = []; for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n; pts.push(f(a)); } return pts; }
function text(cv, X, lines) { let y = 40; for (const [s, o] of lines) { if (!s) { y += 12; continue; } cv.text(s, X, y, Object.assign({ size: 16 }, o || {})); y += 28; } }

function drawZ(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: Math.abs(st.pitch) > 60 ? 38 : 48, center: [1.2, 1.8, 1.2] });
  grid(V, 5); axes(V, [5.6, 5.8, 4.4]);
  const x = st.x, y = st.y, z = st.z, w = st.w;
  // 箱（点線）
  const c = [[0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0], [0, 0, z], [x, 0, z], [x, y, z], [0, y, z]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => V.line3([c[i], c[j]], { color: 'sub', width: 1, style: 'dash', zbias: -10 }));
  // 進む道（① x、② y、③ z）
  const seg = (p, q, u, o) => { if (u <= 0) return; const e = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u]; if (Math.hypot(e[0] - p[0], e[1] - p[1], e[2] - p[2]) > 0.05) V.arrow3(p, e, Object.assign({ head: 12, zbias: 50 }, o)); };
  seg([0, 0, 0], [x, 0, 0], A.clamp(w, 0, 1), { color: 'b', width: 4 });
  seg([x, 0, 0], [x, y, 0], A.clamp(w - 1, 0, 1), { color: 'a', width: 4, style: 'dash' });
  seg([x, y, 0], [x, y, z], A.clamp(w - 2, 0, 1), { color: 'c', width: 4, style: 'long' });
  if (w >= 3) {
    V.dot3([x, y, 0], { r: 6, color: 'sub', zbias: 60 }); V.text3('Q', [x + 0.25, y + 0.25, -0.35], { size: 16, bold: true, color: 'sub' });
    V.dot3([x, y, z], { r: 7, color: 'ink', zbias: 60 }); V.text3('P', [x, y + 0.25, z + 0.35], { size: 18, bold: true });
    V.line3([[0, 0, 0], [x, y, z]], { color: 'd', width: 1.5, style: 'dot', zbias: 40 });
  }
  V.text3('O', [-0.3, -0.3, -0.3], { size: 16, bold: true });
  V.flush();
  const nm = { mitori: '見取図（x 軸はななめに短く見える）', ue: '真上から（平面図）：横に y、たてに −x', mae: '正面から（正面図）：横に y、たてに z' }[st.mi];
  text(cv, 610, [['P(' + A.num(x, 1) + ', ' + A.num(y, 1) + ', ' + A.num(z, 1) + ')', { size: 20, bold: true }], ['', 0], ['① x の向きに ' + A.num(x, 1), { color: 'b' }], ['② y の向きに ' + A.num(y, 1), { color: 'a' }], ['③ z の向きに ' + A.num(z, 1), { color: 'c' }], ['', 0], ['OP ＝ √(x² ＋ y² ＋ z²)', {}], ['　 ＝ ' + A.num(Math.hypot(x, y, z), 2), { bold: true }], ['', 0], [nm, { size: 14, color: 'sub' }], ['図はドラッグで回せます', { size: 14, color: 'sub' }]]);
}

function drawM(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 70, center: [0, 0, 0.8] });
  const mir = st.kei === 'hidari', s = mir ? -1 : 1;
  if (mir) V.poly3([[-2.2, 0, -0.6], [2.6, 0, -0.6], [2.6, 0, 2.8], [-2.2, 0, 2.8]], { fill: 'sub', alpha: 0.1, color: 'sub', style: 'dot', width: 1.5, zbias: -200 });
  // 軸（鏡なら y が反対）
  const X = [2.4, 0, 0], Y = [0, 2.4 * s, 0], Z = [0, 0, 2.4];
  [[X, 'x'], [Y, 'y'], [Z, 'z']].forEach(([e, n]) => { V.arrow3([0, 0, 0], e, { color: 'ink', width: 2.5, head: 12 }); V.text3(n, e.map(v => v * 1.12), { size: 20, bold: true, italic: true, math: true, align: 'center' }); });
  // x から y へ回す弧
  const arc = []; for (let k = 0; k <= 30; k++) { const a = Math.PI / 2 * k / 30; arc.push([1.3 * Math.cos(a), 1.3 * Math.sin(a) * s, 0]); }
  V.line3(arc.slice(0, 28), { color: 'b', width: 3, zbias: 30 }); V.arrow3(arc[25], arc[30], { color: 'b', width: 3, head: 14, zbias: 30 });
  // 右ねじ：x→y の回し方で、ねじが進む向き（右手系なら +z、左手系なら −z）
  const adv = mir ? -1 : 1, u = st.w;
  V.arrow3([0, 0, 0.1 * adv], [0, 0, (0.6 + 1.0 * u) * adv], { color: 'c', width: 6, style: 'long', head: 14, zbias: 40 });
  // ねじの頭（回る印）
  const hz = (0.6 + 1.0 * u) * adv, hd = []; for (let k = 0; k <= 24; k++) { const a = 2 * Math.PI * k / 24 + u * 4 * s; hd.push([0.35 * Math.cos(a), 0.35 * Math.sin(a), hz]); }
  V.line3(hd, { color: 'c', width: 2, zbias: 40 });
  V.flush();
  text(cv, 610, mir ? [['鏡にうつした形（左手系）', { bold: true, color: 'b' }], ['', 0], ['y 軸だけが反対を向く', {}], ['x から y へ回すと、', {}], ['右ねじは z の反対へ進む', { bold: true }], ['', 0], ['ドラッグで回しても、', { color: 'sub' }], ['右手系には重ならない', { color: 'sub' }]] : [['右手系（この本の約束）', { bold: true, color: 'a' }], ['', 0], ['親指 → x', {}], ['人さし指 → y', {}], ['中指 → z', {}], ['', 0], ['x から y へ回すと、', {}], ['右ねじは z の＋へ進む', { bold: true }], ['', 0], ['z の上から見ると左回り', { color: 'sub' }]]);
}

function drawE(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 52, center: [0.5, 0.5, 2.2] });
  grid(V, 4); axes(V, [4.6, 4.6, 5.2], { neg: 0.3 });
  const t = st.th * D24, r = st.r, h = st.h, J = 4.6, u = [Math.cos(t), Math.sin(t), 0];
  // 柱と、うで（ジブ）
  V.line3([[0, 0, 0], [0, 0, 4.8]], { color: 'e', width: 7, zbias: 5 });
  V.line3([[0, 0, 4.6], [4.2 * u[0], 4.2 * u[1], 4.6]], { color: 'e', width: 5, zbias: 6 });
  const T = [r * u[0], r * u[1], J], P = [r * u[0], r * u[1], h], Q = [r * u[0], r * u[1], 0];
  V.line3([T, P], { color: 'ink', width: 1.5, zbias: 7 });
  V.dot3(T, { r: 5, shape: 'square', color: 'ink' });
  // 円柱の面（r 一定）
  V.line3(circ3(0, r, 48, a => [r * Math.cos(a), r * Math.sin(a), 0]), { color: 'b', width: 1, style: 'dot', zbias: -5 });
  V.line3(circ3(0, r, 48, a => [r * Math.cos(a), r * Math.sin(a), h]), { color: 'b', width: 1, style: 'dot', zbias: -5 });
  V.line3([[0, 0, 0], Q], { color: 'b', width: 4, zbias: 20 });
  V.line3([Q, P], { color: 'c', width: 4, style: 'long', zbias: 20 });
  V.line3([[0, 0, 0], P], { color: 'd', width: 2.5, style: 'dash', zbias: 20 });
  const arc = []; for (let k = 0; k <= 30; k++) { const a = t * k / 30; arc.push([0.9 * Math.cos(a), 0.9 * Math.sin(a), 0]); }
  if (st.th > 3) V.line3(arc, { color: 'ink', width: 1.5, zbias: 20 });
  V.dot3(P, { r: 7, color: 'b', zbias: 30 });
  V.text3('フック P', [P[0], P[1], P[2] + 0.35], { size: 15, bold: true });
  V.text3('r', [Q[0] / 2, Q[1] / 2, -0.4], { size: 18, bold: true, italic: true, math: true, color: 'b' });
  V.text3('θ', [1.25 * Math.cos(t / 2), 1.25 * Math.sin(t / 2), 0], { size: 17, italic: true, math: true });
  V.flush();
  text(cv, 610, [['円柱座標 (' + A.num(r, 1) + ', ' + Math.round(st.th) + '°, ' + A.num(h, 1) + ')', { bold: true }], ['', 0], ['x ＝ r cosθ ＝ ' + A.num(r * Math.cos(t), 2), {}], ['y ＝ r sinθ ＝ ' + A.num(r * Math.sin(t), 2), {}], ['z ＝ ' + A.num(h, 1), {}], ['', 0], ['r ＝ z 軸からの距離', { color: 'b', bold: true }], ['原点からの距離', { color: 'd' }], ['　√(r² ＋ z²) ＝ ' + A.num(Math.hypot(r, h), 2), { color: 'd', bold: true }]]);
}

function drawQ(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 75, center: [0, 0, 0.3] });
  const r = st.R, t = st.tt * D24, p = st.ph * D24;
  // 球の網（うすく）
  for (const lat of [-60, -30, 30, 60]) { const a = lat * D24; V.line3(circ3(0, 0, 60, f => [r * Math.cos(a) * Math.cos(f), r * Math.cos(a) * Math.sin(f), r * Math.sin(a)]), { color: 'grid', width: 1, zbias: -50 }); }
  for (let m = 0; m < 6; m++) { const f = m * Math.PI / 6; V.line3(circ3(0, 0, 60, a => [r * Math.cos(a) * Math.cos(f), r * Math.cos(a) * Math.sin(f), r * Math.sin(a)]), { color: 'grid', width: 1, zbias: -50 }); }
  V.line3(circ3(0, 0, 72, f => [r * Math.cos(f), r * Math.sin(f), 0]), { color: 'e', width: 2, style: 'dot', zbias: -40 });
  axes(V, [r + 0.8, r + 0.8, r + 0.8], { neg: 0.4 });
  const P = [r * Math.sin(t) * Math.cos(p), r * Math.sin(t) * Math.sin(p), r * Math.cos(t)], Q = [P[0], P[1], 0];
  V.line3([[0, 0, 0], P], { color: 'b', width: 4, zbias: 30 });
  V.line3([[0, 0, 0], Q], { color: 'a', width: 3, style: 'dash', zbias: 30 });
  V.line3([P, Q], { color: 'sub', width: 1.5, style: 'dash', zbias: 30 });
  // θ の弧（z 軸から OP へ）と φ の弧（x 軸から OQ へ）
  const at = []; for (let k = 0; k <= 30; k++) { const a = t * k / 30; at.push([0.7 * Math.sin(a) * Math.cos(p), 0.7 * Math.sin(a) * Math.sin(p), 0.7 * Math.cos(a)]); }
  V.line3(at, { color: 'ink', width: 2, zbias: 40 });
  const ap = []; for (let k = 0; k <= 30; k++) { const a = p * k / 30; ap.push([0.55 * Math.cos(a), 0.55 * Math.sin(a), 0]); }
  if (st.ph > 2) V.line3(ap, { color: 'ink', width: 2, zbias: 40 });
  V.text3('θ', [0.95 * Math.sin(t / 2) * Math.cos(p), 0.95 * Math.sin(t / 2) * Math.sin(p), 0.95 * Math.cos(t / 2)], { size: 17, italic: true, math: true, bold: true });
  V.text3('φ', [0.8 * Math.cos(p / 2), 0.8 * Math.sin(p / 2), 0], { size: 17, italic: true, math: true, bold: true });
  V.dot3(P, { r: 7, color: 'b', zbias: 50 }); V.dot3(Q, { r: 5, color: 'a', zbias: 50 });
  V.text3('P', [P[0], P[1], P[2] + 0.25], { size: 18, bold: true }); V.text3('Q', [Q[0], Q[1], -0.3], { size: 16, bold: true });
  V.flush();
  const lat = 90 - st.tt;
  text(cv, 610, [['球座標 (' + A.num(r, 1) + ', ' + A.num(st.tt, 1) + '°, ' + A.num(st.ph, 1) + '°)', { bold: true }], ['', 0], ['z ＝ r cosθ ＝ ' + A.num(P[2], 2), {}], ['OQ ＝ r sinθ ＝ ' + A.num(r * Math.sin(t), 2), { color: 'a' }], ['x ＝ r sinθ cosφ ＝ ' + A.num(P[0], 2), {}], ['y ＝ r sinθ sinφ ＝ ' + A.num(P[1], 2), {}], ['', 0], ['θ は真上（北極）から', { color: 'sub' }], [(lat >= 0 ? '北緯 ' + A.num(lat, 1) : '南緯 ' + A.num(-lat, 1)) + '°（＝ 90° − θ）', { bold: true }], ['経度 φ ＝ ' + A.num(st.ph, 1) + '°', { bold: true }]]);
}
