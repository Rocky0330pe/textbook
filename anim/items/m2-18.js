// @id m2-18
// @title 斜面の上の重力を2つに分ける
// @vol 数学4
// @from 数学 4-6 ⑥（ch4-06:588・634・662・677）／4-11 ③、5-17、力-2・力-7 でも使う
'use strict';
const D18 = Math.PI / 180, MG = 196;
A.item({
  id: 'm2-18', title: '斜面の上の重力を2つに分ける',
  from: '数学 第4巻 4-6 ⑥「斜面にそった向きと、斜面に垂直な向きに分ける」の図から（4-11、5-17、物理 力-2・力-7 でも使う）',
  W: 880, H: 420,
  state: { th: 30, how: 'yuka', wrong: false },
  scenes: [
    {
      key: 'bunkai', label: '① 2つの向きに分ける',
      lead: '斜面の角 $\\theta$ を変えると、重力 $mg$ を分けた2つの力はどう変わるでしょう。（質量 20 kg の台車：$mg=196$ N）',
      note: '重力（黒）を対角線とする長方形の2辺が、分けた2つの力です。重力と青い矢印のあいだの角は、斜面の角 $\\theta$ と同じなので、**斜面にそった力＝$mg\\sin\\theta$**、**斜面へ押しつける力＝$mg\\cos\\theta$**。ゆるやかな坂ほど $\\sin\\theta$ が小さく、小さな力で止めておけます。',
      legend: [['重力 $mg$（長方形の対角線）', { color: 'ink' }], ['斜面にそって下る力 $mg\\sin\\theta$', { color: 'b' }], ['斜面へ押しつける力 $mg\\cos\\theta$', { color: 'a', style: 'dash' }]],
      controls: [
        { range: 'th', label: '斜面の角 $\\theta$', min: 0, max: 85, step: 0.1, fmt: v => A.num(v, 1) + '°' },
        { button: '30° の坂', act: st => { st.th = 30; } }, { button: '傾き 1/12 のスロープ', act: st => { st.th = 4.76; } }
      ],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = Math.min(60, st.th + dt * 12); if (st.th >= 60) return false; },
      draw(cv, st) { drawBunkai(cv, st); },
      readout: st => `そった力 ＝ 196 × sin ${A.num(st.th, 1)}° ＝ <b>${A.num(MG * Math.sin(st.th * D18), 1)} N</b>　　押しつける力 ＝ 196 × cos ${A.num(st.th, 1)}° ＝ <b>${A.num(MG * Math.cos(st.th * D18), 1)} N</b>`
    },
    {
      key: 'naze', label: '② なぜ同じ θ ？',
      lead: '重力と「斜面に垂直な向き」のあいだの角が、なぜ斜面の角 $\\theta$ と同じになるのでしょう。2つの考え方で見てみましょう。',
      note: '**床をかたむける**：はじめ水平な床では、重力（真下）と床に垂直な向きは重なっています。床を $\\theta$ だけかたむけると、垂直な向きも $\\theta$ だけ回りますが、重力は真下のまま。だから、あいだの角は $\\theta$。**三角形の角の和**：荷物の所の角は $180°-90°-\\theta=90°-\\theta$。青は斜面に垂直なので、重力と青のあいだは $90°-(90°-\\theta)=\\theta$。',
      legend: [['重力（いつも真下）', { color: 'ink' }], ['斜面（床）に垂直な向き', { color: 'a', style: 'dash' }], ['斜面（床）', { color: 'sub' }]],
      controls: [
        { range: 'th', label: '斜面の角 $\\theta$', min: 0, max: 60, step: 0.5, fmt: v => A.num(v, 1) + '°' },
        { seg: 'how', label: '考え方', options: [['yuka', '床をかたむける'], ['wa', '三角形の角の和']] }
      ],
      init(st) { st.th = 0; st.how = 'yuka'; },
      step(st, dt) { st.th = Math.min(30, st.th + dt * 10); if (st.th >= 30) return false; },
      draw(cv, st) { drawNaze(cv, st); },
      readout: st => `重力と「斜面に垂直な向き」のあいだの角 ＝ 斜面の角 $\\theta$ ＝ <b>${A.num(st.th, 1)}°</b>`
    },
    {
      key: 'hashi', label: '③ はしの場合で確かめる',
      lead: '$\\theta=0°$（平らな床）と $\\theta=90°$（かべ）で、2つの力がどうなるか確かめましょう。',
      note: '$\\theta=0°$ では、そった力は $mg\\sin0°=0$。平らな床の上の台車は動きません。$\\theta=90°$ では $mg\\sin90°=mg$ で、重力はすべて「かべにそって下る力」になり、物はまっすぐ落ちます。',
      miss: '斜面にそった力を $mg\\cos\\theta$ にすると、$\\theta=0°$（平ら）で $mg$ になり、平らな床の上の台車が動き出すことになってしまいます。「まちがいの式」をオンにして確かめましょう。',
      legend: [['そった力 $mg\\sin\\theta$', { color: 'b' }], ['押しつける力 $mg\\cos\\theta$', { color: 'a', style: 'dash' }], ['いまの角', { color: 'ink', shape: 'diamond', noline: true }]],
      controls: [
        { range: 'th', label: '斜面の角 $\\theta$', min: 0, max: 90, step: 0.5, fmt: v => A.num(v, 1) + '°' },
        { check: 'wrong', label: '比べる', text: 'まちがいの式（そった力を $mg\\cos\\theta$）' }
      ],
      init(st) { st.th = 0; st.wrong = false; },
      step(st, dt) { st.th = Math.min(90, st.th + dt * 15); if (st.th >= 90) return false; },
      draw(cv, st) { drawHashi(cv, st); },
      readout: st => `$\\theta$ ＝ ${A.num(st.th, 1)}°：そった力 ${A.num(MG * Math.sin(st.th * D18), 1)} N、押しつける力 ${A.num(MG * Math.cos(st.th * D18), 1)} N` + (st.wrong ? `（まちがいの式では、そった力 ${A.num(MG * Math.cos(st.th * D18), 1)} N）` : '')
    }
  ]
});

function rot(p, a) { return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)]; }
function add(p, q, k = 1) { return [p[0] + k * q[0], p[1] + k * q[1]]; }
function arcA(v, c, r, a0, a1, o) { const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 3)), pts = []; for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * D18; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } v.line(pts, o); }
function rightMark(v, p, d1, d2, s) { v.line([add(p, d1, s), add(add(p, d1, s), d2, s), add(p, d2, s)], { color: 'ink', width: 1.2 }); }
// 台車：斜面の上の点 S（斜面ぞいの位置）に、角 t でのせる。重心 G を返す
function cart(v, S, t) {
  const u = [Math.cos(t), Math.sin(t)], n = [-Math.sin(t), Math.cos(t)];
  const c = (a, b) => add(add(S, u, a), n, b);
  v.poly([c(-1, 0.3), c(1, 0.3), c(1, 1.1), c(-1, 1.1)], { fill: 'e', alpha: 0.35, color: 'e', width: 2 });
  for (const a of [-0.6, 0.6]) { const w = c(a, 0.17); v.circle(w[0], w[1], 0.17, { color: 'ink', width: 1.5 }); }
  return c(0, 0.7);
}
function slope(v, t, L) { const top = [L * Math.cos(t), L * Math.sin(t)]; v.poly([[0, 0], [top[0], 0], top], { fill: 'sub', alpha: 0.15, color: 'sub', width: 2 }); return top; }

function forces(v, G, t, M, o = {}) {
  const down = [0, -M], al = rot([-1, 0], t), pe = rot([0, -1], t);
  const Pa = add(G, al, M * Math.sin(t)), Pp = add(G, pe, M * Math.cos(t)), D = add(G, down);
  v.poly([G, Pa, D, Pp], { fill: 'e', alpha: 0.12 });
  v.line([Pa, D, Pp], { color: 'sub', style: 'dash', width: 1.2 });
  if (M * Math.cos(t) > 0.05) v.arrow(G[0], G[1], Pp[0], Pp[1], { color: 'a', width: 3, style: 'dash' });
  if (M * Math.sin(t) > 0.05) v.arrow(G[0], G[1], Pa[0], Pa[1], { color: 'b', width: 3 });
  v.arrow(G[0], G[1], D[0], D[1], { color: 'ink', width: 3.5 });
  v.dot(G[0], G[1], { r: 4 });
  if (t > 3 * D18 && t < 87 * D18) { rightMark(v, Pp, rot([0, 1], t), rot([-1, 0], t), 0.3); arcA(v, G, M * 0.3, 270, 270 + t / D18, { color: 'ink', width: 1.5 }); v.text('θ', G[0] + M * 0.42 * Math.cos((270 + t / D18 / 2) * D18), G[1] + M * 0.42 * Math.sin((270 + t / D18 / 2) * D18), { size: 16, math: true, italic: true, align: 'center', bg: true }); }
  if (o.labels) {
    v.text('mg', D[0] + 0.3, D[1] + 0.5, { size: 16, math: true, italic: true, bold: true });
    if (M * Math.sin(t) > 0.6) v.text('mg sinθ', Pa[0] - 0.2, Pa[1] + 0.45, { size: 16, color: 'b', bold: true, align: 'right', bg: true });
    if (M * Math.cos(t) > 0.6) v.text('mg cosθ', Pp[0] + 0.3, Pp[1] - 0.2, { size: 16, color: 'a', bold: true, bg: true });
  }
}

function drawBunkai(cv, st) {
  const t = st.th * D18, v = cv.view({ x0: -1, x1: 12, y0: -1.5, y1: 10.5, box: [10, 10, 520, 400], equal: true });
  const L = 11, top = slope(v, t, L);
  if (st.th > 1) { arcA(v, [0, 0], 1.6, 0, st.th, { color: 'ink', width: 1.5 }); v.text('θ', 2.1 * Math.cos(t / 2), 2.1 * Math.sin(t / 2), { size: 16, math: true, italic: true, align: 'center' }); }
  const S = [6.5 * Math.cos(t), 6.5 * Math.sin(t)], G = cart(v, S, t);
  forces(v, G, t, 4, { labels: true });
  void top;
  // 右：棒グラフ
  const X = 560, W = 230, s = W / MG;
  let y = 46;
  const bar = (lab, val, col, sty) => { cv.text(lab, X, y, { size: 15, color: col, bold: true }); y += 20; cv.rect(X, y, Math.max(0, val) * s, 18, { fill: col, alpha: 0.3, color: col, width: 1.5, style: sty }); cv.text(A.num(val, 1) + ' N', X + Math.max(0, val) * s + 8, y + 9, { size: 15 }); y += 44; };
  bar('重力 mg', MG, 'ink', 'solid');
  bar('そった力 mg sinθ', MG * Math.sin(t), 'b', 'solid');
  bar('押しつける力 mg cosθ', MG * Math.cos(t), 'a', 'dash');
  cv.text('（質量 20 kg、mg ＝ 20 × 9.8 ＝ 196 N）', X, y, { size: 15, color: 'sub' }); y += 30;
  cv.text('止めておく力 ＝ mg sinθ', X, y, { size: 16, bold: true }); y += 26;
  cv.text('＝ 重力の ' + A.num(Math.sin(t), 3) + ' 倍', X, y, { size: 16 });
}

function drawNaze(cv, st) {
  const t = st.th * D18, v = cv.view({ x0: -1, x1: 12, y0: -2.5, y1: 9.5, box: [10, 10, 560, 400], equal: true });
  if (st.how === 'yuka') {
    const C = [5.5, 3], L = 5;
    v.line([[C[0] - L, C[1]], [C[0] + L, C[1]]], { color: 'grid', width: 3 });
    v.text('水平な床', C[0] - L + 0.2, C[1] + 0.35, { size: 15, color: 'sub' });
    const a = rot([L, 0], t);
    v.line([add(C, a, -1), add(C, a)], { color: 'sub', width: 5 });
    const nrm = rot([0, -1], t);
    v.arrow(C[0], C[1], C[0], C[1] - 4.5, { color: 'ink', width: 3.5 });
    v.arrow(C[0], C[1], C[0] + 4.5 * nrm[0], C[1] + 4.5 * nrm[1], { color: 'a', width: 3, style: 'dash' });
    v.dot(C[0], C[1], { r: 5 });
    if (st.th > 1) {
      arcA(v, C, 3.4, 0, st.th, { color: 'ink', width: 1.5 }); v.text('θ', C[0] + 3.9 * Math.cos(t / 2), C[1] + 3.9 * Math.sin(t / 2), { size: 17, math: true, italic: true, align: 'center', bg: true });
      arcA(v, C, 2.4, 270, 270 + st.th, { color: 'a', width: 2 }); v.text('θ', C[0] + 2.9 * Math.cos((270 + st.th / 2) * D18), C[1] + 2.9 * Math.sin((270 + st.th / 2) * D18), { size: 17, math: true, italic: true, align: 'center', bg: true, color: 'a' });
    }
    v.text('重力', C[0] - 0.3, C[1] - 4.9, { size: 15, align: 'right' });
    v.text('床に垂直', C[0] + 4.7 * nrm[0] + 0.3, C[1] + 4.7 * nrm[1], { size: 15, color: 'a' });
    panelN(cv, ['床を θ だけかたむけると、', '床に垂直な向きも θ だけ回る。', '重力は真下のまま。', '', '→ 重力と「垂直な向き」の', '　あいだの角は θ']);
  } else {
    const L = 11, top = slope(v, t, L), S = [7 * Math.cos(t), 7 * Math.sin(t)], H = [S[0], 0];
    v.poly([[0, 0], H, S], { fill: 'e', alpha: 0.3 });
    v.line([S, H], { color: 'ink', style: 'dash', width: 2 });
    rightMark(v, H, [0, 1], [-1, 0], 0.35);
    void top;
    if (st.th > 2) {
      arcA(v, [0, 0], 1.5, 0, st.th, { color: 'ink', width: 1.5 }); v.text('θ', 2 * Math.cos(t / 2), 2 * Math.sin(t / 2), { size: 16, math: true, italic: true, align: 'center' });
      arcA(v, S, 1.1, 180 + st.th, 270, { color: 'ink', width: 1.5 }); const m = (180 + st.th + 270) / 2 * D18;
      v.text('90°−θ', S[0] + 2.0 * Math.cos(m), S[1] + 2.0 * Math.sin(m), { size: 15, align: 'center', bg: true });
      const nrm = rot([0, -1], t);
      v.arrow(S[0], S[1], S[0] + 3.2 * nrm[0], S[1] + 3.2 * nrm[1], { color: 'a', width: 3, style: 'dash' });
      rightMark(v, S, rot([1, 0], t), nrm, 0.35);
      arcA(v, S, 2.5, 270, 270 + st.th, { color: 'a', width: 2 }); v.text('θ', S[0] + 3.0 * Math.cos((270 + st.th / 2) * D18), S[1] + 3.0 * Math.sin((270 + st.th / 2) * D18), { size: 17, math: true, italic: true, align: 'center', bg: true, color: 'a' });
    }
    v.arrow(S[0], S[1], S[0], S[1] - 2.8, { color: 'ink', width: 3.5 });
    v.dot(S[0], S[1], { r: 5 });
    v.text('H', H[0], H[1] - 0.45, { size: 15, align: 'center' });
    panelN(cv, ['荷物から真下へ線を引く（H）。', '大きな直角三角形の角：', '　ふもと θ、H で 90°', '荷物の所 ＝ 180° − 90° − θ', '　　　　 ＝ 90° − θ', '青は斜面に垂直（90°）なので', '重力と青のあいだ ＝ 90° − (90° − θ)', '　　　　　　　　 ＝ θ']);
  }
}
function panelN(cv, lines) { let y = 50; for (const s of lines) { if (s) cv.text(s, 590, y, { size: 16 }); y += s ? 30 : 14; } }

function drawHashi(cv, st) {
  const v = cv.view({ x0: 0, x1: 90, y0: 0, y1: 220, box: [60, 20, 440, 340] });
  v.axes({ xt: [0, 15, 30, 45, 60, 75, 90], yt: [50, 98, 150, 196], xfmt: x => x + '°', yfmt: y => String(y), xl: 'θ', yl: '力（N）', zero: true });
  v.plot(x => MG * Math.sin(x * D18), { color: 'b', width: 3 });
  v.plot(x => MG * Math.cos(x * D18), { color: 'a', width: 3, style: 'dash' });
  const t = st.th * D18;
  v.line([[st.th, 0], [st.th, 215]], { color: 'sub', width: 1, style: 'dot' });
  v.dot(st.th, MG * Math.sin(t), { r: 7, color: 'b', shape: 'diamond' }); v.dot(st.th, MG * Math.cos(t), { r: 7, color: 'a', shape: 'diamond' });
  v.text('mg sinθ', 84, MG * Math.sin(84 * D18) - 18, { size: 15, color: 'b', bold: true, align: 'right' });
  v.text('mg cosθ', 6, MG * Math.cos(6 * D18) - 18, { size: 15, color: 'a', bold: true });
  // 右：小さな斜面
  const w = cv.view({ x0: -1, x1: 8, y0: -2, y1: 8, box: [540, 20, 320, 340], equal: true });
  slope(w, t, 7.5);
  const S = [4.2 * Math.cos(t), 4.2 * Math.sin(t)], G = cart(w, S, t);
  forces(w, G, t, 3);
  if (st.wrong) {
    const al = rot([-1, 0], t), Pw = add(G, al, 3 * Math.cos(t));
    if (Math.cos(t) > 0.02) w.arrow(G[0], G[1] + 0.15, Pw[0], Pw[1] + 0.15, { color: 'b', width: 3, style: 'dot' });
    w.text('× mg cosθ ＝ ' + A.num(MG * Math.cos(t), 0) + ' N', 3.5, -1.5, { size: 15, color: 'b', bold: true, align: 'center' });
    if (st.th < 1) w.text('平らなのに動き出す？', 3.5, 7, { size: 15, color: 'b', align: 'center' });
  }
  cv.text(st.th < 0.5 ? '平らな床：そった力は 0 → 動かない' : st.th > 89.5 ? 'かべ：重力がすべて「そった力」→ まっすぐ落ちる' : '', 60, 400, { size: 16, bold: true });
}
