// @id p2-22
// @title 電磁波：電場と磁場が直角にゆれて進む
// @vol 物理4
// @uses 3d
// @from 物理 電-15 ④（p4-15:228・258・263）、電-14 ⑩（p4-14:559）、波-13 ⑥（p3-13:944）
'use strict';
// 記号は本と同じ：E＝cB、c＝fλ、マリュスの法則 I＝I₀cos²θ、FDTD：h＝η₀H、h ← h−(E_{i+1}−E_i)、E ← E−(h_{i+1/2}−h_{i−1/2})
A.item({
  id: 'p2-22', title: '電磁波：電場と磁場が直角にゆれて進む',
  from: '物理 第4巻 電-15 ④「電場と磁場が直角にゆれる横波」、電-14 ⑩「FDTD 法」、第3巻 波-13 ⑥「偏光」の図から',
  W: 880, H: 440,
  state: { yaw: -40, pitch: 18, t: 0, f: 1, showB: true, th: 30, src: 'lin', n: 0, s: 1, init: 'E', E: [], h: [] },
  scenes: [
    {
      key: 'yokonami', label: '① 電場と磁場',
      lead: '電場（たて）と磁場（横）が、同じ山と谷の位置でゆれながら、どちらにも直角な向きへ進みます。図はドラッグで回せます。',
      note: '電場・磁場・進む向きは、たがいに直角（**横波**）。電場から磁場へ右ねじを回すと、ねじは進む向きに進みます（$\\vec S=\\vec E\\times\\vec H$）。大きさは $E=cB$ で、1 V/m の電場には $3.3\\times10^{-9}$ T の磁場が組になっています（図の磁場は、見やすく大きくかいた）。',
      miss: '周波数が高い電磁波ほど速いのではありません。真空の中では、どの電磁波も同じ速さ $c$ です。周波数を上げると、そのぶん波長が短くなるだけです（$c=f\\lambda$）。周波数を変えて、山の進む速さをくらべましょう。',
      legend: [['電場 $\\vec E$', { color: 'b', width: 3 }], ['磁場 $\\vec B$（大きくかいた）', { color: 'a', width: 3, style: 'dash' }], ['進む向き', { color: 'ink', width: 3 }], ['1つの山の印', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [
        { range: 'f', label: '周波数（はじめを1）', min: 0.5, max: 2.5, step: 0.05, d: 2 },
        { check: 'showB', label: '磁場', text: '磁場も見せる' }
      ],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 1e4) st.t = 0; },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawWave,
      readout: st => `周波数 ${A.num(st.f, 2)} 倍 → 波長 ${A.num(1 / st.f, 2)} 倍、速さ $c=f\\lambda$ は <b>いつも同じ</b>`
    },
    {
      key: 'henkou', label: '② 偏光板',
      lead: 'たてにゆれる光が、通す向きが角 $\\theta$ だけ傾いた偏光板に来ます。偏光板を回してみましょう。図はドラッグで回せます。',
      note: 'ゆれを、通す向きの成分 $E_0\\cos\\theta$ と、それに垂直な成分に分けると、偏光板は前者だけを通します。強さは振幅の2乗に比例するので $I=I_0\\cos^2\\theta$（マリュスの法則）。30° から 60° にすると、0.75 から 0.25 へ、3分の1になります。',
      miss: '自然光にマリュスの法則は使えません。自然光にはゆれの向きが決まっていないので、どの向きに偏光板を回しても、強さは $\\frac{1}{2}$ になります（あらゆる向きの $\\cos^2$ の平均）。',
      legend: [['来る光の電場', { color: 'b', width: 3 }], ['通りぬけた光の電場', { color: 'c', width: 3, style: 'dash' }], ['通す向き', { color: 'ink', width: 2, style: 'dot' }], ['$I/I_0=\\cos^2\\theta$', { color: 'a', width: 3 }]],
      controls: [
        { range: 'th', label: '通す向きの角 $\\theta$', min: 0, max: 180, step: 1, fmt: v => A.num(v, 0) + '°' },
        { seg: 'src', label: '来る光', options: [['lin', 'たてにゆれる光'], ['nat', '自然光']] }
      ],
      state: { yaw: -60, pitch: 15 },
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 1e4) st.t = 0; },
      drag: A.rotDrag([0, 0, 560, 440]),
      draw: drawPol,
      readout: st => { const c2 = Math.cos(st.th * Math.PI / 180) ** 2; return st.src === 'lin' ? `$I/I_0=\\cos^2\\theta$ ＝ cos² ${A.num(st.th, 0)}° ＝ <b>${A.num(c2, 3)}</b>` : '自然光：どの角でも <b>$I/I_0$ ＝ 0.5</b>'; }
    },
    {
      key: 'fdtd', label: '③ FDTD のパルス',
      lead: '電場（●）と磁場 $h$（□）を半マスずらして置き、本と同じ式で1歩ずつ進めます。はじめに電場の山（2・4・2）だけを置きます。',
      note: '電場の山は、高さ2の2つの山に分かれて、1歩に1マスずつ左右へ進みます。右へ進む山では $h$ と $E$ が同じ符号、左へ進む山では逆の符号です（$\\vec S=\\vec E\\times\\vec H$ が進む向き）。「$h$ も同じ形に置く」にすると、山は右へだけ進みます。$c\\Delta t$ を $\\Delta x$ より大きくすると（1.05 など）、計算はこわれます（CFL 条件）。',
      legend: [['電場 $E$（●）', { color: 'b', shape: 'circle' }], ['$h=\\eta_0H$（□）', { color: 'a', shape: 'square', style: 'dash' }]],
      controls: [
        { seg: 'init', label: 'はじめ', options: [['E', '電場だけ'], ['Eh', '$h$ も同じ形に置く']], on: initF },
        { range: 's', label: '$c\\Delta t/\\Delta x$', min: 0.5, max: 1.1, step: 0.05, d: 2, on: initF },
        { button: '1歩', act(st) { stepF(st); } }
      ],
      init: initF,
      step(st, dt) { st.acc = (st.acc || 0) + dt; while (st.acc > 0.3) { st.acc -= 0.3; stepF(st); } if (st.n >= 200) return false; },
      draw: drawF,
      readout: st => `歩 ${st.n}：E[24〜34] ＝ ${st.E.slice(24, 35).map(v => Math.abs(v) > 999 ? (v > 0 ? '大' : '−大') : A.num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2)).join('、')}`
    }
  ]
});

function V3(cv, st, box, sc) { return new A.View3(cv, { box: box || [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: sc || 70, center: [0, 0, 0] }); }
function drawWave(cv, st) {
  const V = V3(cv, st), k = 2 * Math.PI * st.f / 2.4, w = 2 * Math.PI * st.f * 0.4, X0 = -4, X1 = 4;   // 速さ w/k＝0.384 はいつも同じ
  V.arrow3([X0 - 0.3, 0, 0], [X1 + 0.6, 0, 0], { color: 'ink', width: 2.5, head: 14 });
  V.text3('進む向き', [X1 + 0.7, 0, -0.35], { size: 15 });
  const E = x => 1.3 * Math.sin(k * x - w * st.t), ptsE = [], ptsB = [];
  for (let i = 0; i <= 200; i++) { const x = X0 + (X1 - X0) * i / 200; ptsE.push([x, 0, E(x)]); ptsB.push([x, -E(x), 0]); }
  V.line3(ptsE, { color: 'b', width: 2.5 });
  if (st.showB) V.line3(ptsB, { color: 'a', width: 2.5, style: 'dash' });
  for (let i = 0; i <= 32; i++) { const x = X0 + (X1 - X0) * i / 32, e = E(x); if (Math.abs(e) > 0.08) { V.arrow3([x, 0, 0], [x, 0, e], { color: 'b', width: 1.8, head: 8 }); if (st.showB) V.arrow3([x, 0, 0], [x, -e, 0], { color: 'a', width: 1.8, head: 8, style: 'solid', alpha: 0.8 }); } }
  // 1つの山の印：速さ w/k で進む
  const v = w / k; let xp = ((v * st.t + Math.PI / 2 / k - X0) % (2 * Math.PI / k)) + X0; while (xp < X0) xp += 2 * Math.PI / k;
  V.dot3([xp, 0, 1.3], { color: 'd', shape: 'diamond', r: 8, zbias: 5 });
  V.text3('E', [X0 - 0.2, 0, 1.6], { size: 18, bold: true, italic: true, color: 'b' });
  if (st.showB) V.text3('B', [X0 - 0.2, -1.7, 0], { size: 18, bold: true, italic: true, color: 'a' });
  V.flush();
  cv.text('波長 λ', 20, 26, { size: 15, color: 'sub' });
  const lam = 2 * Math.PI / k; cv.line([[80, 26], [80 + lam * 70, 26]], { color: 'd', width: 3 }); cv.line([[80, 18], [80, 34]], { color: 'd', width: 2 }); cv.line([[80 + lam * 70, 18], [80 + lam * 70, 34]], { color: 'd', width: 2 });
}

function drawPol(cv, st) {
  const V = V3(cv, st, [0, 0, 560, 440], 62), th = st.th * Math.PI / 180, w = 2 * Math.PI * 0.6, k = 2 * Math.PI / 2.2, nat = st.src === 'nat';
  const X0 = -4, Xp = 0.3, X1 = 4;
  V.arrow3([X0 - 0.3, 0, 0], [X1 + 0.5, 0, 0], { color: 'ink', width: 2, head: 12 });
  // 偏光板（通す向き：yz 面の中で、たてから θ）
  const ux = 0, uy = Math.sin(th), uz = Math.cos(th);
  const sq = [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([a, b]) => [Xp, a, b]);
  V.poly3(sq, { fill: 'sub', alpha: 0.18, color: 'sub', width: 1.5 });
  for (let j = -4; j <= 4; j++) { const o = j * 0.3, py = -uz * o, pz = uy * o; const L = Math.sqrt(Math.max(0, 1.4 * 1.4 - o * o)); V.line3([[Xp, py - uy * L, pz - uz * L], [Xp, py + uy * L, pz + uz * L]], { color: 'ink', width: 1, style: 'dot', alpha: 0.6 }); }
  V.line3([[Xp, -uy * 1.7, -uz * 1.7], [Xp, uy * 1.7, uz * 1.7]], { color: 'ink', width: 2.5, style: 'dot' });
  void ux;
  // 来る光
  const ph = x => w * st.t - k * x;
  if (!nat) {
    const pts = []; for (let i = 0; i <= 100; i++) { const x = X0 + (Xp - X0) * i / 100; pts.push([x, 0, 1.2 * Math.cos(ph(x))]); }
    V.line3(pts, { color: 'b', width: 2.5 });
    for (let i = 0; i <= 14; i++) { const x = X0 + (Xp - X0) * i / 14, e = 1.2 * Math.cos(ph(x)); if (Math.abs(e) > 0.08) V.arrow3([x, 0, 0], [x, 0, e], { color: 'b', width: 1.6, head: 7 }); }
  } else {
    const r = A.rng(7 + Math.floor(st.t * 6));
    for (let i = 0; i <= 14; i++) { const x = X0 + (Xp - X0) * i / 14, a = r() * Math.PI, e = 1.2 * Math.cos(ph(x)); V.arrow3([x, 0, 0], [x, Math.sin(a) * e, Math.cos(a) * e], { color: 'b', width: 1.6, head: 7 }); }
  }
  // 通りぬけた光：振幅 cosθ（自然光は平均で強さ 1/2：振幅 1/√2 でかく）
  const amp = nat ? Math.SQRT1_2 : Math.cos(th);
  const pts2 = []; for (let i = 0; i <= 100; i++) { const x = Xp + (X1 - Xp) * i / 100, e = 1.2 * amp * Math.cos(ph(x)); pts2.push([x, uy * e, uz * e]); }
  V.line3(pts2, { color: 'c', width: 2.5, style: 'dash' });
  for (let i = 0; i <= 14; i++) { const x = Xp + (X1 - Xp) * i / 14, e = 1.2 * amp * Math.cos(ph(x)); if (Math.abs(e) > 0.08) V.arrow3([x, 0, 0], [x, uy * e, uz * e], { color: 'c', width: 1.6, head: 7 }); }
  V.text3('偏光板', [Xp, 0, 1.85], { size: 15, align: 'center' });
  V.flush();
  // 右：cos² のグラフ
  const g = cv.view({ x0: 0, x1: 180, y0: 0, y1: 1.15, box: [590, 50, 270, 300] });
  g.axes({ xt: [0, 30, 60, 90, 120, 150, 180], yt: [0.25, 0.5, 0.75, 1], xfmt: v => v % 60 ? '' : v + '°', yfmt: v => A.num(v, 2), zero: true });
  cv.text('I / I₀', 596, 34, { size: 15, color: 'sub' });
  cv.text('θ', 862, 392, { size: 15, color: 'sub', align: 'right' });
  g.plot(x => Math.cos(x * Math.PI / 180) ** 2, { color: 'a', width: 3 });
  g.line([[0, 0.5], [180, 0.5]], { color: 'sub', width: 1.5, style: 'dash' });
  g.text('自然光は 0.5', 95, 0.56, { size: 14, color: 'sub' });
  for (const x of [30, 60]) g.dot(x, Math.cos(x * Math.PI / 180) ** 2, { color: 'b', r: 4 });
  const y = nat ? 0.5 : Math.cos(th) ** 2;
  g.dot(st.th, y, { color: 'd', shape: 'diamond', r: 8 });
}

// FDTD：60 マス。E[0]・E[59] は 0（はし）
function initF(st) {
  const N = 60; st.E = new Array(N).fill(0); st.h = new Array(N).fill(0); st.n = 0; st.acc = 0;
  st.E[28] = 2; st.E[29] = 4; st.E[30] = 2;
  // h[i] は E[i] と E[i+1] の間（i＋½）。右へだけ進むのは、h を半マス左（h[27〜29]）に同じ形で置いたとき
  if (st.init === 'Eh') { st.h[27] = 2; st.h[28] = 4; st.h[29] = 2; }
}
function stepF(st) {
  const N = st.E.length, s = st.s;
  for (let i = 0; i < N - 1; i++) st.h[i] = st.h[i] - s * (st.E[i + 1] - st.E[i]);
  for (let i = 1; i < N - 1; i++) st.E[i] = st.E[i] - s * (st.h[i] - st.h[i - 1]);
  st.n++;
}
function drawF(cv, st) {
  const N = st.E.length, g = cv.view({ x0: -1, x1: N, y0: -5, y1: 5, box: [40, 40, 820, 340] });
  g.axes({ xt: A.range(0, 60, 10), yt: [-4, -2, 2, 4], ax: 0, ay: -1, xfmt: v => v + '' });
  cv.text('マスの番号', 860, 400, { size: 14, color: 'sub', align: 'right' });
  g.clip(() => {
    g.line(st.E.map((v, i) => [i, A.clamp(v, -6, 6)]), { color: 'b', width: 2, alpha: 0.6 });
    g.line(st.h.map((v, i) => [i + 0.5, A.clamp(v, -6, 6)]), { color: 'a', width: 2, style: 'dash', alpha: 0.6 });
    st.E.forEach((v, i) => { if (Math.abs(v) > 1e-9) g.dot(i, A.clamp(v, -6, 6), { color: 'b', r: 5 }); });
    st.h.forEach((v, i) => { if (Math.abs(v) > 1e-9) g.dot(i + 0.5, A.clamp(v, -6, 6), { color: 'a', r: 4.5, shape: 'square' }); });
  });
  cv.text(`歩 ${st.n}　（1歩で ${A.num(st.s, 2)} マス進む時間）`, 50, 22, { size: 16, bold: true });
  const big = st.E.some(v => Math.abs(v) > 6);
  if (big) cv.text('計算がこわれて、値が大きくなりすぎた（cΔt > Δx）', 450, 22, { size: 16, bold: true, color: 'b' });
}
