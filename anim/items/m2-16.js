// @id m2-16
// @title 円を細かく切って並べかえる：円の面積
// @vol 数学4
// @from 数学 4-5 ④⑨（ch4-05:330・723）、4-2 ⑤（ch4-02:486）／5-10 でも使う
'use strict';
const PI16 = Math.PI;
A.item({
  id: 'm2-16', title: '円を細かく切って並べかえる：円の面積',
  from: '数学 第4巻 4-5 ④「円の面積」・⑨「方眼で数えて」、4-2 ⑤「おうぎ形の面積」の図から（5-10 の積分でも使う）',
  W: 880, H: 420,
  state: { k: 3, s: 0, h: 1, hi: 0, t: 0, n: 1 },
  scenes: [
    {
      key: 'narabe', label: '① 切って並べかえる',
      lead: '半径 10 cm の円を、細いおうぎ形に切って、交互に並べかえます。▶ を押してから、切る数をふやしてみましょう。',
      note: '上のでこぼこ（とがった所が下のおうぎ形の弧）を全部つなぐと円周の半分 $\\pi r$、高さは半径 $r$ に近づきます。だから円の面積は $\\pi r\\times r=\\pi r^2$。どれだけ細かくしても、でこぼこは少しのこります。「近づいていく先」の長方形の面積が、円の面積です。',
      legend: [['とがった所が下のおうぎ形', { color: 'b' }], ['とがった所が上のおうぎ形', { color: 'a', style: 'dash' }], ['近づいていく先の長方形（横 $\\pi r$・たて $r$）', { color: 'ink', style: 'dash' }]],
      controls: [
        { range: 'k', label: '切る数', min: 2, max: 7, step: 1, fmt: v => String(2 ** v) },
        { range: 's', label: '並べかえ', min: 0, max: 1, step: 0.01, fmt: v => v < 0.01 ? '円' : v > 0.99 ? '並んだ' : '動いている' }
      ],
      init(st) { st.s = 0; },
      step(st, dt) { st.s = Math.min(1, st.s + dt * 0.4); if (st.s >= 1) return false; },
      draw(cv, st) { drawNarabe(cv, st); },
      readout: st => { const n = 2 ** st.k; return `${n} に切って、二等辺三角形とみなした面積：<b>${A.num(n / 2 * 100 * Math.sin(2 * PI16 / n), 1)} cm²</b>　　$\\pi r^2$ ＝ 314.159…`; }
    },
    {
      key: 'masu', label: '② 方眼で数える',
      lead: '円の $\\dfrac{1}{4}$ を方眼にかいて、マスを数えます。マスを小さくすると、どうなるでしょう。',
      note: '全部が円の内側にあるマス（色の濃いマス）だけの面積は円より小さく、ふちにかかるマス（うすい色・点線のマス）までふくめると円より大きくなります。マスを細かくするほど、2つの数は $\\pi r^2=314.159\\cdots$ をはさんで近づきます。',
      legend: [['全部が内側のマス', { color: 'a' }], ['ふちにかかるマス', { color: 'b', style: 'dot' }], ['半径 10 cm の円', { color: 'b' }]],
      controls: [{ seg: 'h', label: 'マスの1辺', options: [[1, '1 cm'], [0.5, '0.5 cm'], [0.25, '0.25 cm'], [0.1, '0.1 cm']] }],
      init(st) { st.h = 1; st.t = 0; },
      step(st, dt) { st.t += dt; const hs = [1, 0.5, 0.25, 0.1], i = Math.min(3, Math.floor(st.t / 1.6)); st.h = hs[i]; if (st.t > 1.6 * 4) return false; },
      draw(cv, st) { drawMasu(cv, st); },
      readout: st => { const m = count(st.h); return `内側のマスだけ：${A.num(m.lo, m.d)} cm²　＜　$\\pi r^2$ ＝ 314.16　＜　ふちまでふくむ：${A.num(m.hi, m.d)} cm²`; }
    },
    {
      key: 'ougi', label: '③ おうぎ形を三角形に',
      lead: '半径 6 cm、中心角 60° のおうぎ形を、細い三角形に分けて、面積をたします（4-2）。',
      note: '細い三角形は、底辺が小さな弧、高さが半径 $r$ の三角形とほとんど同じです。だから、おうぎ形の面積は $S=\\dfrac{1}{2}rs$（$s$ は弧の長さ）。半径 6 cm・60° なら $\\dfrac{1}{2}\\times6\\times2\\pi=6\\pi\\approx18.850$ cm²。',
      legend: [['細い三角形', { color: 'b' }], ['弧（長さ $s$）', { color: 'a' }]],
      controls: [{ range: 'n', label: '分ける数', min: 1, max: 100, step: 1, d: 0 }],
      init(st) { st.n = 1; st.t = 0; },
      step(st, dt) { st.t += dt; st.n = Math.min(100, 1 + Math.floor(st.t * 2.5) ** 1.6 | 0); if (st.n >= 100) { st.n = 100; return false; } },
      draw(cv, st) { drawOugi(cv, st); },
      readout: st => `${st.n} 個の三角形の面積の合計：<b>${A.num(st.n * 18 * Math.sin(PI16 / 3 / st.n), 3)} cm²</b>　→　$\\dfrac{1}{2}rs$ ＝ $6\\pi$ ≈ 18.850 cm²`
    }
  ]
});

function ease(x) { return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2; }
// おうぎ形（とがった所が原点、上向き）を、角 rot だけ回して (px, py) に置いた点の列
function sector(r, h, rot, px, py) {
  const pts = [[px, py]], m = Math.max(3, Math.ceil(h * 40));
  for (let j = 0; j <= m; j++) { const a = PI16 / 2 - h + 2 * h * j / m + rot; pts.push([px + r * Math.cos(a), py + r * Math.sin(a)]); }
  return pts;
}
function drawNarabe(cv, st) {
  const v = cv.view({ x0: 0, x1: 62, y0: -1.5, y1: 22, box: [10, 8, 860, 330], equal: true });
  const n = 2 ** st.k, r = 10, h = PI16 / n, c = 2 * r * Math.sin(h), C0 = [11, 11], x0 = 26, yb = 4.5;
  if (st.s > 0) v.circle(C0[0], C0[1], r, { color: 'sub', width: 1, style: 'dash' });
  for (let i = 0; i < n; i++) {
    // 1切れずつ順に動く（i 番めは s＝0.6i/n から動き出す）
    const e = ease(A.clamp((st.s - 0.6 * i / n) / 0.4, 0, 1));
    const phi = (i + 0.5) * 2 * PI16 / n, rc = phi - PI16 / 2;
    const m = Math.floor(i / 2), down = i % 2 === 0;
    const X = x0 + c / 2 + m * c, P1 = down ? [X, yb] : [X + c / 2, yb + r * Math.cos(h)];
    let rr = down ? 0 : PI16; while (rr - rc > PI16) rr -= 2 * PI16; while (rc - rr > PI16) rr += 2 * PI16;
    const rot = rc + (rr - rc) * e, px = C0[0] + (P1[0] - C0[0]) * e, py = C0[1] + (P1[1] - C0[1]) * e;
    const pts = sector(r, h, rot, px, py);
    v.poly(pts, { fill: down ? 'b' : 'a', alpha: down ? 0.35 : 0.15 });
    v.line(pts, { color: 'ink', width: 0.8, close: true, alpha: 0.6 });
    v.line(pts.slice(1), { color: down ? 'b' : 'a', width: 2.5, style: down ? 'solid' : 'dash' });
  }
  if (st.s < 0.02) { v.circle(C0[0], C0[1], r, { color: 'ink', width: 1.5 }); v.text('半径 10 cm の円', C0[0], -0.8, { size: 15, align: 'center', color: 'sub' }); }
  if (st.s > 0.98) {
    const L = x0 + c / 4, W = PI16 * r;
    v.line([[L, yb], [L + W, yb], [L + W, yb + r], [L, yb + r], [L, yb]], { color: 'ink', style: 'dash', width: 2 });
    v.text('横 πr ≈ 31.4 cm（円周の半分）', L + W / 2, yb + r + 1.6, { size: 15, align: 'center', bold: true, bg: true });
    v.text('たて r ＝ 10', L - 0.6, yb + r / 2, { size: 15, bg: true, align: 'right' });
  }
  // 下の表（4-5 ④）
  const ns = [4, 8, 16, 32, 64, 128], X0 = 140, dx = 110;
  cv.text('切る数', 20, 362, { size: 15, color: 'sub' }); cv.text('面積（cm²）', 20, 392, { size: 15, color: 'sub' });
  ns.forEach((m, j) => { const on = m === n; cv.text(String(m), X0 + j * dx, 362, { size: 15, bold: on, color: on ? 'b' : 'ink', align: 'center' }); cv.text(A.num(m / 2 * 100 * Math.sin(2 * PI16 / m), 1), X0 + j * dx, 392, { size: 15, bold: on, color: on ? 'b' : 'ink', align: 'center' }); });
  cv.text('→ 314.159…', X0 + 6 * dx - 20, 392, { size: 15, color: 'sub' });
}

function count(h) {
  const n = Math.round(10 / h); let ins = 0, bd = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const far = Math.hypot((i + 1) * h, (j + 1) * h), near = Math.hypot(i * h, j * h); if (far <= 10 + 1e-9) ins++; else if (near < 10) bd++; }
  return { ins, bd, lo: ins * h * h * 4, hi: (ins + bd) * h * h * 4, d: h >= 0.5 ? 0 : 1 };
}
function drawMasu(cv, st) {
  const h = st.h, v = cv.view({ x0: -0.5, x1: 10.6, y0: -0.6, y1: 10.5, box: [10, 8, 400, 400], equal: true });
  const n = Math.round(10 / h), g = cv.g;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const far = Math.hypot((i + 1) * h, (j + 1) * h), near = Math.hypot(i * h, j * h);
    if (far <= 10 + 1e-9) { g.fillStyle = A.color('a'); g.globalAlpha = 0.45; }
    else if (near < 10) { g.fillStyle = A.color('b'); g.globalAlpha = 0.25; }
    else continue;
    g.fillRect(v.X(i * h), v.Y((j + 1) * h), h * v.sx, h * v.sy);
  }
  g.globalAlpha = 1;
  if (h >= 0.25) {
    for (let i = 0; i <= n; i++) { v.line([[i * h, 0], [i * h, 10]], { color: 'grid', width: 1 }); v.line([[0, i * h], [10, i * h]], { color: 'grid', width: 1 }); }
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const far = Math.hypot((i + 1) * h, (j + 1) * h), near = Math.hypot(i * h, j * h); if (far > 10 + 1e-9 && near < 10) v.line([[i * h, j * h], [(i + 1) * h, j * h], [(i + 1) * h, (j + 1) * h], [i * h, (j + 1) * h]], { color: 'b', style: 'dot', width: 1.2, close: true }); }
  }
  const pts = []; for (let k = 0; k <= 90; k++) { const a = k * PI16 / 180; pts.push([10 * Math.cos(a), 10 * Math.sin(a)]); }
  v.line(pts, { color: 'b', width: 3 });
  v.line([[0, 0], [10, 0]], { color: 'ink', width: 1.5 }); v.line([[0, 0], [0, 10]], { color: 'ink', width: 1.5 });
  v.text('10 cm', 5, -0.35, { size: 15, align: 'center' });
  const m = count(h), X = 450; let y = 40; const t = (s, o) => { cv.text(s, X, y, Object.assign({ size: 16 }, o)); y += 30; };
  t('マスの1辺 ' + h + ' cm（円の 1/4）', { bold: true });
  t('全部が内側：' + m.ins + ' マス', { color: 'a' });
  t('ふちにかかる：' + m.bd + ' マス', { color: 'b' });
  y += 8;
  t('円全体（4倍）の面積は', { color: 'sub' });
  t(A.num(m.lo, m.d) + ' cm² より大きく、', { bold: true, color: 'a' });
  t(A.num(m.hi, m.d) + ' cm² より小さい', { bold: true, color: 'b' });
  // 数直線 270〜350 にはさむようす
  const L = 450, R = 860, Y = 330, X2 = x => L + (x - 270) / 80 * (R - L);
  cv.line([[L, Y], [R, Y]], { color: 'sub', width: 1.5 });
  for (let k = 270; k <= 350; k += 10) { cv.line([[X2(k), Y - 5], [X2(k), Y + 5]], { color: 'sub', width: 1 }); cv.text(String(k), X2(k), Y + 18, { size: 14, align: 'center', color: 'sub' }); }
  cv.rect(X2(m.lo), Y - 14, X2(m.hi) - X2(m.lo), 28, { fill: 'e', alpha: 0.25 });
  cv.dot(X2(m.lo), Y, { r: 7, color: 'a', shape: 'square' }); cv.dot(X2(m.hi), Y, { r: 7, color: 'b', shape: 'tri' });
  cv.line([[X2(Math.PI * 100), Y - 26], [X2(Math.PI * 100), Y + 26]], { color: 'ink', width: 2 });
  cv.text('πr² ＝ 314.16', X2(Math.PI * 100), Y - 36, { size: 15, align: 'center', bold: true });
}

function drawOugi(cv, st) {
  const v = cv.view({ x0: -4.2, x1: 4.2, y0: -0.6, y1: 6.8, box: [10, 8, 470, 400], equal: true });
  const n = st.n, a0 = PI16 / 3, a1 = 2 * PI16 / 3, r = 6;
  for (let i = 0; i < n; i++) {
    const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n;
    const tri = [[0, 0], [r * Math.cos(p), r * Math.sin(p)], [r * Math.cos(q), r * Math.sin(q)]];
    v.poly(tri, { fill: 'b', alpha: i % 2 ? 0.15 : 0.35 });
    if (n <= 40) v.line(tri, { color: 'b', width: 0.8, close: true });
  }
  const arc = []; for (let k = 0; k <= 60; k++) { const a = a0 + (a1 - a0) * k / 60; arc.push([r * Math.cos(a), r * Math.sin(a)]); }
  v.line(arc, { color: 'a', width: 3 });
  v.dot(0, 0, { r: 4 });
  v.text('中心', 0, -0.35, { size: 15, align: 'center' });
  v.text('弧の長さ s ＝ 2π ≈ 6.28', 0, 6.4, { size: 15, align: 'center', color: 'a', bold: true });
  v.text('高さ r ＝ 6', -2.9, 2.6, { size: 15, align: 'center', bg: true });
  // 右：表
  const X = 520; let y = 40;
  cv.text('分ける数と、三角形の面積の合計（cm²）', X, y, { size: 15, bold: true }); y += 30;
  for (const m of [1, 2, 4, 8, 16, 100]) {
    const on = m === n; cv.text(String(m), X + 20, y, { size: 16, align: 'right', color: on ? 'b' : 'ink', bold: on });
    cv.text(A.num(m * 18 * Math.sin(PI16 / 3 / m), m === 100 ? 3 : 2), X + 60, y, { size: 16, color: on ? 'b' : 'ink', bold: on }); y += 26;
  }
  y += 10;
  cv.text('いま：' + n + ' 個 → ' + A.num(n * 18 * Math.sin(PI16 / 3 / n), 3), X, y, { size: 16, bold: true, color: 'b' }); y += 34;
  cv.text('S ＝ ½ × r × s ＝ ½ × 6 × 2π ＝ 6π', X, y, { size: 16 }); y += 26;
  cv.text('　≈ 18.850 cm²', X, y, { size: 16, bold: true });
}
