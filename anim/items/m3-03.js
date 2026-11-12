// @id m3-03
// @title のびた分を引きはなす：(x³)′＝3x² と積の微分
// @vol 数学5
// @uses 3d
// @from 数学 5-2 ②（ch5-02:128 の正方形）・5-4 ④（ch5-04:216〜267 の立方体）・5-6 ③（ch5-06:215 の長方形）／5-8（ch5-08:297）・5-16 でも使う
'use strict';
// 5-2：(1+h)²＝1＋h＋h＋h²。h=0.1 で 1.21
// 5-4：x=1、h=0.1 で 板 0.3・角柱 0.03・小さな立方体 0.001・合計 0.331（÷h で 3.31）。h=0.01 で 0.030301（3.0301）
// 5-6：横 12 ます・たて 8 ますの長方形。のび 4・2・1 で 右の帯 32・16・8、上の帯 48・24・12、右上 16・4・1
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const sh = v => String(Number(v.toPrecision(5))).replace('-', '−');
// 再生：はじめ 1.5 秒で引きはなし、そのあと list の値へ止まりながら小さくする
function playSep(st, dt, key, list) {
  st.t += dt;
  if (st.t < 1.5) { st.sep = ease(st.t / 1.5); return; }
  st.sep = 1;
  const u = st.t - 1.5, seg = Math.floor(u / 1.8);
  if (seg >= list.length - 1) { st[key] = list[list.length - 1]; return false; }
  const a = Math.log(list[seg]), b = Math.log(list[seg + 1]);
  st[key] = Math.exp(a + (b - a) * ease((u - seg * 1.8) / 0.9));
}

A.item({
  id: 'm3-03', title: 'のびた分を引きはなす：(x³)′＝3x² と積の微分',
  from: '数学 第5巻 5-2「正方形の図」・5-4「立方体の図で確かめる」・5-6「積の微分」の図から（5-8・5-16 でも使う）',
  W: 880, H: 440,
  state: { t: 0, sep: 0 },
  scenes: [
    {
      key: 'seihou', label: '① 正方形 $(1+h)^2$',
      lead: '1 辺 $1+h$ の正方形を 4 つに分けて、引きはなします。▶ で引きはなしてから、$h$ を小さくしていきます。',
      note: '$(1+h)^2=1+h+h+h^2=1+2h+h^2$。ふえた分を $h$ でわると $2+h$ で、$h\\to0$ で 2 になります。細長い 2 まいは $h$ に比例して小さくなり、小さな正方形 $h^2$ はもっと速く消えます。',
      state: { h: 0.4 },
      legend: [['$1\\times1=1$', { color: 'a', shape: 'square', noline: true }], ['細長い長方形 $h$（2 まい・実線のふち）', { color: 'b', style: 'solid' }], ['小さな正方形 $h^2$（点線のふち）', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'h', label: '$h$', min: 0.05, max: 0.5, step: 0.01 }, { range: 'sep', label: '引きはなす', min: 0, max: 1, step: 0.01, fmt: v => Math.round(v * 100) + ' %' }],
      step(st, dt) { return playSep(st, dt, 'h', [0.4, 0.2, 0.1]); },
      draw(cv, st) { drawSq(cv, st); },
      readout: st => `$h$ ＝ ${sh(st.h)}：$(1+h)^2$ ＝ ${sh((1 + st.h) ** 2)} ＝ 1 ＋ ${sh(2 * st.h)} ＋ ${sh(st.h * st.h)}　ふえた分 ÷ $h$ ＝ <b>${sh(2 + st.h)}</b>`
    },
    {
      key: 'rippou', label: '② 立方体 $(x+h)^3$',
      lead: '1 辺 $x=1$ の立方体のたて・横・高さを $h$ ずつのばし、ふえた部分を色ごとに引きはなします。図はドラッグで回せます。',
      note: 'ふえた体積は $3x^2h+3xh^2+h^3$。$h$ を $\\frac{1}{10}$ にすると、板は $\\frac{1}{10}$、角柱は $\\frac{1}{100}$、小さな立方体は $\\frac{1}{1000}$ になります。$h$ でわったとき残るのは**板 3 まい分の $3x^2$** です。展開の「3」は、板が 3 まいあることでした。',
      state: { h: 0.4, yaw: -135, pitch: 24 },
      legend: [['もとの立方体', { color: 'a', style: 'solid' }], ['うすい板 3 まい（実線のふち）', { color: 'b', style: 'solid' }], ['細い角柱 3 本（破線のふち）', { color: 'c', style: 'dash' }], ['小さな立方体（点線のふち）', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'h', label: '$h$', min: 0.01, max: 0.5, step: 0.01 }, { range: 'sep', label: '引きはなす', min: 0, max: 1, step: 0.01, fmt: v => Math.round(v * 100) + ' %' }],
      step(st, dt) { return playSep(st, dt, 'h', [0.4, 0.2, 0.1]); },
      drag: A.rotDrag([0, 0, 580, 440]),
      draw(cv, st) { drawCube(cv, st); },
      readout: st => { const h = st.h, tot = 3 * h + 3 * h * h + h ** 3; return `$x=1$、$h$ ＝ ${sh(h)}：ふえた体積 ${sh(tot)}　÷ $h$ ＝ <b>${sh(tot / h)}</b>（板の分は 3 のまま）`; }
    },
    {
      key: 'seki', label: '③ 長方形と積の微分',
      lead: '横 12 ます・たて 8 ますの長方形を、横もたても同じだけのばします。▶ で、のびを 4 → 2 → 1 ますと半分にしていきます。',
      note: 'のびでわると、右の帯はいつも 8、上の帯はいつも 12。右上の小さな四角は 4、2、1 と半分ずつになって 0 に近づきます。だから $\\{f(x)g(x)\\}\'=f\'(x)g(x)+f(x)g\'(x)$（右の帯＋上の帯）です。',
      miss: '「$\\Delta g$ が 0 に近づくなら、$\\frac{\\Delta g}{\\Delta x}$ も 0 に近づく」は誤りです。分子も分母も小さくなるので、わった値は $g\'$ に近づきます。0 に近づくのは、小さい数どうしをかけた右上の四角だけです。',
      state: { d: 4 },
      legend: [['もとの長方形 12×8', { color: 'a', shape: 'square', noline: true }], ['右の帯 8×のび（実線のふち）', { color: 'b', style: 'solid' }], ['上の帯 12×のび（破線のふち）', { color: 'c', style: 'dash' }], ['右上の四角 のび×のび（点線のふち）', { color: 'ink', style: 'dot' }]],
      controls: [{ range: 'd', label: 'のび（ます）', min: 0.25, max: 4, step: 0.05 }, { range: 'sep', label: '引きはなす', min: 0, max: 1, step: 0.01, fmt: v => Math.round(v * 100) + ' %' }],
      step(st, dt) { return playSep(st, dt, 'd', [4, 2, 1]); },
      draw(cv, st) { drawRect(cv, st); },
      readout: st => { const d = st.d; return `のび ${sh(d)}：右の帯 ${sh(8 * d)}、上の帯 ${sh(12 * d)}、右上 ${sh(d * d)}　のびでわると <b>8、12、${sh(d)}</b>`; }
    }
  ]
});

// 右の表（横の棒グラフ）：rows=[[名前, 値, 色, 形]]
function bars(cv, L, T, rows, title, unit) {
  cv.text(title, L, T, { size: 16, bold: true });
  const max = Math.max(...rows.map(r => r[1]));
  rows.forEach(([name, val, col, sty], k) => {
    const y = T + 34 + k * 62;
    cv.text(name, L, y, { size: 15 });
    const w = Math.max(1, 230 * val / max);
    cv.rect(L, y + 12, w, 18, { fill: col, alpha: 0.5, color: col, style: sty, width: 2 });
    cv.text(sh(val) + (unit || ''), L + Math.min(w, 160) + 8, y + 21, { size: 15, bold: true, bg: true });
  });
}

function drawSq(cv, st) {
  const h = st.h, s = 230, ox = 70, oy = 405, g = 36 * st.sep;   // 1 → 230px
  const P = (x, y, dx, dy) => [ox + x * s + dx, oy - y * s - dy];
  const piece = (x0, y0, w, hh, dx, dy, col, sty, label) => {
    const a = P(x0, y0, dx, dy), b = P(x0 + w, y0 + hh, dx, dy);
    cv.rect(a[0], b[1], b[0] - a[0], a[1] - b[1], { fill: col, alpha: 0.35, color: col, style: sty, width: 2.5 });
    if (label && (b[0] - a[0] > 26 || a[1] - b[1] > 26)) cv.text(label, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { align: 'center', size: 16, bold: true, bg: true });
  };
  // 本の図：左上に 1×1、右に h×1、下に 1×h、右下に h×h（ここでは上下を逆にせず、右と上にのばす）
  piece(0, 0, 1, 1, 0, 0, 'a', 'solid', '1×1＝1');
  piece(1, 0, h, 1, g, 0, 'b', 'solid', 'h');
  piece(0, 1, 1, h, 0, g, 'b', 'solid', 'h');
  piece(1, 1, h, h, g, g, 'd', 'dot', 'h²');
  cv.text('1', ox + s / 2, oy + 16, { align: 'center', size: 16 }); cv.text('h', ox + s + h * s / 2 + g, oy + 16, { align: 'center', size: 16, italic: true, math: true });
  cv.text('1', ox - 14, oy - s / 2, { align: 'center', size: 16 }); cv.text('h', ox - 14, oy - s - h * s / 2 - g, { align: 'center', size: 16, italic: true, math: true });
  bars(cv, 560, 40, [['1 × 1', 1, 'a', 'solid'], ['細長い長方形 2 まい　2h', 2 * h, 'b', 'solid'], ['小さな正方形　h²', h * h, 'd', 'dot']], `h ＝ ${sh(h)} のとき`);
  cv.text(`ふえた分 ÷ h ＝ ${sh(2 * h + h * h)} ÷ ${sh(h)}`, 560, 260, { size: 16 });
  cv.text(`＝ 2 ＋ ${sh(h)} ＝ ${sh(2 + h)}`, 560, 290, { size: 16, bold: true });
  cv.text('h → 0 で　2', 560, 330, { size: 16, color: 'b', bold: true });
}

// 直方体（min の角 p、大きさ s）。見える面だけを、1 つの箱としてまとめて描く
function box3(V, p, s, o) {
  const c = [p[0] + s[0] / 2, p[1] + s[1] / 2, p[2] + s[2] / 2], dc = V.P(c)[2];
  const faces = [];
  for (let ax = 0; ax < 3; ax++) for (const sg of [-1, 1]) {
    const n = [0, 0, 0]; n[ax] = sg;
    const fc = c.map((v, i) => v + n[i] * s[i] / 2), probe = fc.map((v, i) => v + n[i] * 0.01);
    if (V.P(probe)[2] <= V.P(fc)[2]) continue;
    const u = (ax + 1) % 3, w = (ax + 2) % 3, pts = [];
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const q = fc.slice(); q[u] += a * s[u] / 2; q[w] += b * s[w] / 2; pts.push(q); }
    faces.push({ pts, shade: ax === 2 ? 0.55 : ax === 0 ? 0.42 : 0.3 });
  }
  V.queue.push({ z: dc, f: () => faces.forEach(fa => { const q2 = fa.pts.map(q => V.P(q)); V.cv.poly(q2, { fill: 'bg', alpha: 1 }); V.cv.poly(q2, { fill: o.color, alpha: fa.shade, color: o.color, style: o.style, width: o.width || 1.6 }); }) });
}
function drawCube(cv, st) {
  const h = st.h, x = 1, g = 0.55 * st.sep;
  const V = new A.View3(cv, { box: [0, 0, 580, 440], yaw: st.yaw, pitch: st.pitch, scale: 140, center: [0.7, 0.7, 0.72], persp: 0.05 });
  const pc = (p, s, dir, o) => box3(V, [p[0] + dir[0] * g, p[1] + dir[1] * g, p[2] + dir[2] * g], s, o);
  pc([0, 0, 0], [x, x, x], [0, 0, 0], { color: 'a', style: 'solid' });
  pc([x, 0, 0], [h, x, x], [1, 0, 0], { color: 'b', style: 'solid', width: 2 });
  pc([0, x, 0], [x, h, x], [0, 1, 0], { color: 'b', style: 'solid', width: 2 });
  pc([0, 0, x], [x, x, h], [0, 0, 1], { color: 'b', style: 'solid', width: 2 });
  pc([x, x, 0], [h, h, x], [1, 1, 0], { color: 'c', style: 'dash', width: 2 });
  pc([x, 0, x], [h, x, h], [1, 0, 1], { color: 'c', style: 'dash', width: 2 });
  pc([0, x, x], [x, h, h], [0, 1, 1], { color: 'c', style: 'dash', width: 2 });
  pc([x, x, x], [h, h, h], [1, 1, 1], { color: 'd', style: 'dot', width: 2.5 });
  if (st.sep > 0.3) {
    V.text3('板', [0.5, 0.5, x + h + g + 0.12], { size: 16, bold: true, align: 'center', bg: true });
    V.text3('角柱', [x + h / 2 + g, x + h / 2 + g, 0.5 + 0.0], { size: 16, bold: true, align: 'center', bg: true });
    V.text3('h³', [x + h + g, x + h + g, x + h + g + 0.18], { size: 16, bold: true, align: 'center', bg: true });
  }
  V.flush();
  bars(cv, 600, 34, [['板 3 まい　3x²h', 3 * h, 'b', 'solid'], ['角柱 3 本　3xh²', 3 * h * h, 'c', 'dash'], ['小さな立方体　h³', h ** 3, 'd', 'dot']], `x＝1、h ＝ ${sh(h)}`);
  const tot = 3 * h + 3 * h * h + h ** 3;
  cv.text(`合計 ${sh(tot)}（板は ${Math.round(300 * h / tot)} %）`, 600, 250, { size: 16 });
  cv.text(`÷ h ＝ 3 ＋ ${sh(3 * h)} ＋ ${sh(h * h)}`, 600, 284, { size: 16 });
  cv.text(`＝ ${sh(tot / h)}`, 600, 312, { size: 16, bold: true });
  cv.text('h → 0 で　3（＝3x²）', 600, 350, { size: 16, color: 'b', bold: true });
  cv.text('（図はドラッグで回せます）', 600, 400, { size: 14, color: 'sub' });
}

function drawRect(cv, st) {
  const d = st.d, u = 22, ox = 62, oy = 410, g = 30 * st.sep;   // 1 ます＝22px
  const R = (x0, y0, w, hh, dx, dy, col, sty, label) => {
    const X = ox + x0 * u + dx, Y = oy - (y0 + hh) * u - dy;
    cv.rect(X, Y, w * u, hh * u, { fill: col, alpha: col === 'a' ? 0.18 : 0.38, color: col, style: sty, width: 2.2 });
    // ます目
    for (let i = 1; i < w - 1e-9; i++) cv.line([[X + i * u, Y], [X + i * u, Y + hh * u]], { color: 'grid', width: 1 });
    for (let j = 1; j < hh - 1e-9; j++) cv.line([[X, Y + j * u], [X + w * u, Y + j * u]], { color: 'grid', width: 1 });
    cv.rect(X, Y, w * u, hh * u, { color: col, style: sty, width: 2.2 });
    if (label && w * u > 30 && hh * u > 18) cv.text(label, X + w * u / 2, Y + hh * u / 2, { align: 'center', size: 15, bold: true, bg: true });
  };
  R(0, 0, 12, 8, 0, 0, 'a', 'solid', 'g × f ＝ 8 × 12');
  R(12, 0, d, 8, g, 0, 'b', 'solid', '');
  R(0, 8, 12, d, 0, g, 'c', 'dash', '上の帯 f Δg');
  R(12, 8, d, d, g, g, 'ink', 'dot', '');
  cv.text('右の帯 g Δf', ox + (12 + d) * u + g + 8, oy - 4 * u, { size: 15, bold: true, bg: true });
  cv.text('f ＝ 12', ox + 6 * u, oy + 16, { align: 'center', size: 15 });
  cv.text('Δf', ox + (12 + d / 2) * u + g, oy + 16, { align: 'center', size: 15 });
  cv.text('g ＝ 8', ox - 6, oy - 4 * u, { align: 'right', size: 15 });
  cv.text('Δg', ox - 6, oy - (8 + d / 2) * u - g, { align: 'right', size: 15 });
  // 右の表
  const L = 590, T = 40;
  cv.text(`のび ${sh(d)} ます`, L, T, { size: 16, bold: true });
  const rows = [['右の帯（8×のび）', 8 * d, 8, 'b'], ['上の帯（12×のび）', 12 * d, 12, 'c'], ['右上（のび×のび）', d * d, d, 'ink']];
  cv.text('面積', L + 145, T + 36, { size: 14, color: 'sub' }); cv.text('÷ のび', L + 205, T + 36, { size: 14, color: 'sub' });
  rows.forEach(([n, a, q, c], k) => {
    const y = T + 70 + k * 40;
    cv.text(n, L, y, { size: 15, color: c === 'ink' ? 'ink' : c });
    cv.text(sh(a), L + 145, y, { size: 16 });
    cv.text(sh(q), L + 212, y, { size: 16, bold: true, color: c === 'ink' ? 'ink' : c });
  });
  cv.text('のび → 0 で', L, T + 210, { size: 16 });
  cv.text('ふえ方 → 8 ＋ 12 ＋ 0', L, T + 240, { size: 16, bold: true });
  cv.text('＝ gf′ ＋ fg′', L, T + 270, { size: 16, bold: true, color: 'b' });
}
