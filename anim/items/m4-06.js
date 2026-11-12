// @id m4-06
// @title 対角化は物差しの取りかえ
// @vol 数学7
// @from 数学 7-9 図1・3（ch7-09:185・263）、まちがえやすいところ①（ch7-09:657）
'use strict';
const HOUSE = [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]], DOOR = [[1.25, 0], [1.75, 0], [1.75, 1], [1.25, 1]];
const SQ = [[0, 0], [1, 0], [1, 1], [0, 1]], FF = [[[0.35, 0.15], [0.35, 0.85], [0.8, 0.85]], [[0.35, 0.5], [0.68, 0.5]]];
const ap = (M, p) => [M[0] * p[0] + M[1] * p[1], M[2] * p[0] + M[3] * p[1]];
const mul = (P, Q) => [P[0] * Q[0] + P[1] * Q[2], P[0] * Q[1] + P[1] * Q[3], P[2] * Q[0] + P[3] * Q[2], P[2] * Q[1] + P[3] * Q[3]];
const inv = M => { const d = M[0] * M[3] - M[1] * M[2]; return [M[3] / d, -M[1] / d, -M[2] / d, M[0] / d]; };
const I2 = [1, 0, 0, 1];
const nn = v => Math.abs(v - Math.round(v)) < 1e-9 ? A.num(v, 0) : A.num(v, 2);
// 主役の行列：P の列が固有ベクトル (1,1)・(1,−1)、D=diag(3,1)
const P1 = [1, 1, 1, -1], Pi1 = inv(P1);
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const Dm = (a, b) => [a, 0, 0, b];

function house(v, M, o) {
  v.poly(HOUSE.map(p => ap(M, p)), { fill: o.fill, alpha: o.alpha == null ? 0.22 : o.alpha, color: o.color, width: o.width || 2.5, style: o.style });
  v.poly(DOOR.map(p => ap(M, p)), { color: o.color, width: 1.5, style: o.style });
}
// ななめの方眼：q1 が同じ線（(1,−1) の向き）と q2 が同じ線（(1,1) の向き）。M をかけた形
function slanted(v, M, K, al) {
  al = al || 0.6;
  v.clip(() => {
    for (let i = -K; i <= K; i++) {
      v.line([ap(M, ap(P1, [i, -K])), ap(M, ap(P1, [i, K]))], { color: 'b', width: 1.4, alpha: al });
      v.line([ap(M, ap(P1, [-K, i])), ap(M, ap(P1, [K, i]))], { color: 'c', width: 1.4, alpha: al, style: 'dash' });
    }
  });
}
function square(v, K) { v.clip(() => { for (let i = -K; i <= K; i++) { v.line([[i, -K], [i, K]], { color: 'grid', width: 1 }); v.line([[-K, i], [K, i]], { color: 'grid', width: 1 }); } }); }

function drawNaname(cv, st) {
  const t = ease(st.t), M = Dm(1, 1).map((x, k) => x + ([2, 1, 1, 2][k] - x) * t);
  const v = cv.view({ x0: -3, x1: 8, y0: -3, y1: 8, box: [10, 10, 540, 420], equal: true });
  if (st.g !== 'n') square(v, 12);
  v.axes({ xt: [-2, 2, 4, 6], yt: [-2, 2, 4, 6], grid: false, xl: 'x', yl: 'y' });
  if (st.g !== 'f') slanted(v, M, 12);
  house(v, I2, { color: 'sub', style: 'dot', width: 1.5, alpha: 0.05, fill: 'sub' });
  house(v, M, { color: 'ink', fill: 'e', alpha: 0.3 });
  const a = ap(M, [1, 1]), b = ap(M, [1, -1]);
  v.arrow(0, 0, a[0], a[1], { color: 'b', width: 4 }); v.arrow(0, 0, b[0], b[1], { color: 'c', width: 4, style: 'dash' });
  const q = ap(M, [1, 3]); v.dot(q[0], q[1], { color: 'd', r: 6, shape: 'diamond' }); v.text('頂点④', q[0] + 0.2, q[1] + 0.25, { size: 14, color: 'd', bg: true });
  const x = 590, s = 1 + 2 * t;
  cv.text('いまの行列', x, 36, { size: 15, color: 'sub' });
  cv.text('1行め (' + nn(M[0]) + ', ' + nn(M[1]) + ')、2行め (' + nn(M[2]) + ', ' + nn(M[3]) + ')', x, 62, { size: 16 });
  cv.text('ななめの物差しで読むと', x, 110, { size: 15, color: 'sub' });
  cv.text('q₁ の線のあいだ：' + A.num(s, 2) + ' 倍', x, 140, { size: 17, color: 'b', bold: true });
  cv.text('q₂ の線のあいだ：1 倍', x, 170, { size: 17, color: 'c', bold: true });
  const qq = ap(Pi1, [1, 3]);
  cv.text('頂点④ (1, 3) の読み', x, 222, { size: 15, color: 'sub' });
  cv.text('(q₁, q₂) ＝ (' + A.num(qq[0] * s, 2) + ', ' + A.num(qq[1], 0) + ')', x, 250, { size: 17, color: 'd', bold: true });
  cv.text('q₁ ＝ (x＋y)/2、q₂ ＝ (x−y)/2', x, 300, { size: 15 });
  cv.text('▶ で A をかける（少しずつ）', x, 400, { size: 14, color: 'sub' });
}

// 3段：P⁻¹ で読む → D でのばす → P でもどす
function drawSandan(cv, st) {
  const s = st.s, u1 = ease(s), u2 = ease(s - 1), u3 = ease(s - 2);
  const L = cv.view({ x0: -2.5, x1: 8, y0: -2.5, y1: 8, box: [10, 40, 380, 390], equal: true });
  const R = cv.view({ x0: -1, x1: 7, y0: -4, y1: 4, box: [490, 40, 380, 390], equal: true });
  cv.text('ふつうの方眼（x, y）', 200, 18, { size: 15, bold: true, align: 'center' });
  cv.text('ななめの物差しで読んだ方眼（q₁, q₂）', 680, 18, { size: 15, bold: true, align: 'center' });
  square(L, 10); L.axes({ xt: [2, 4, 6], yt: [2, 4, 6], grid: false, xl: 'x', yl: 'y' }); slanted(L, I2, 10, 0.35);
  square(R, 10); R.axes({ xt: [2, 4, 6], yt: [-2, 2], grid: false, xl: 'q₁', yl: 'q₂' });
  // 左：もとの家
  house(L, I2, { color: 'sub', fill: 'sub', alpha: 0.12, width: 2 });
  // 右：P⁻¹ で読んだ家（u1 で現れ、u2 で q₁ が3倍）
  const Dt = Dm(1 + 2 * u2, 1);
  if (u1 > 0) house(R, mul(Dt, Pi1), { color: 'd', fill: 'd', alpha: 0.22 * u1, width: 2.5 });
  // 左：P でもどした家と、A を直接かけた家
  if (st.direct || s >= 3) house(L, [2, 1, 1, 2], { color: 'b', style: 'dash', width: 2, alpha: 0, fill: 'b' });
  if (u3 > 0) house(L, mul(P1, mul(Dm(3, 1), Pi1)), { color: 'ink', fill: 'e', alpha: 0.35 * u3, width: 2.5 });
  // 点 (1,3) をたどる
  const q0 = ap(Pi1, [1, 3]);
  L.dot(1, 3, { color: 'd', r: 6, shape: 'diamond' }); L.text('(1, 3)', 1.2, 3.35, { size: 14, bg: true });
  if (u1 > 0) { R.dot(q0[0] * (1 + 2 * u2), q0[1], { color: 'd', r: 6, shape: 'diamond' }); R.text('(' + A.num(q0[0] * (1 + 2 * u2), u2 > 0 && u2 < 1 ? 1 : 0) + ', −1)', q0[0] * (1 + 2 * u2) + 0.2, q0[1] - 0.45, { size: 14, bg: true }); }
  if (u3 > 0) { L.dot(5, 7, { color: 'd', r: 6, shape: 'diamond' }); L.text('(5, 7)', 5.2, 7.35, { size: 14, bg: true }); }
  // 段の矢印
  const stg = [['① P⁻¹', 'ななめに読む', 130, '→'], ['② D', 'q₁ を3倍', 230, ''], ['③ P', 'もどす', 330, '←']];
  stg.forEach(([t1, t2, y, ar], k) => { const on = (s > k && s <= k + 1) || (k === 2 && s >= 3); const c = on ? 'd' : 'sub'; cv.text(t1, 440, y, { size: 15, align: 'center', color: c, bold: on }); cv.text(t2, 440, y + 20, { size: 14, align: 'center', color: c, bold: on }); if (ar) cv.text(ar, 440, y + 44, { size: 24, align: 'center', color: c, bold: true }); });
}

const OK2 = [4, 1, 2, 3], P2 = [1, 1, 1, -2], Pi2 = inv(P2), D2 = Dm(5, 2);
function drawJunban(cv, st) {
  const good = st.o === 'ok', M = good ? mul(P2, mul(D2, Pi2)) : mul(Pi2, mul(D2, P2)), t = ease(st.t);
  const Mt = I2.map((x, k) => x + (M[k] - x) * t);
  const v = cv.view({ x0: -1.5, x1: 7, y0: -1.5, y1: 6.5, box: [10, 10, 500, 420], equal: true });
  square(v, 10); v.axes({ xt: [2, 4, 6], yt: [2, 4, 6], grid: false, xl: 'x', yl: 'y' });
  v.clip(() => { v.line([[-3, -3], [8, 8]], { color: 'b', style: 'dash', width: 1.4 }); v.line([[-1.5, 3], [4, -8]], { color: 'c', style: 'dash', width: 1.4 }); });
  const sq = (M, o) => { v.poly(SQ.map(p => ap(M, p)), o); FF.forEach(s => v.line(s.map(p => ap(M, p)), { color: o.color, width: 3, style: o.style })); };
  sq(I2, { color: 'sub', style: 'dot', width: 1.5 });
  sq(OK2, { color: 'b', style: 'dash', width: 2.5, fill: 'b', alpha: 0.08 });
  sq(Mt, { color: good ? 'ink' : 'd', fill: good ? 'e' : 'd', alpha: 0.3, width: 2.5 });
  const x = 550;
  cv.text('A：1行め (4, 1)、2行め (2, 3)（例題2）', x, 34, { size: 15 });
  cv.text('P の列：(1, 1)・(1, −2)、D：5 と 2', x, 60, { size: 15 });
  cv.text(good ? 'P D P⁻¹ ＝' : 'P⁻¹ D P ＝', x, 100, { size: 18, bold: true, color: good ? 'ink' : 'd' });
  cv.text('1行め (' + nn(M[0]) + ', ' + nn(M[1]) + ')、2行め (' + nn(M[2]) + ', ' + nn(M[3]) + ')', x, 126, { size: 17, bold: true, color: good ? 'ink' : 'd' });
  cv.text(good ? '→ A と同じ（点線の形と重なる）' : '→ A とちがう形になる', x, 154, { size: 15, color: good ? 'ink' : 'd' });
  cv.text('右から順にはたらく：', x, 200, { size: 15, color: 'sub' });
  cv.text(good ? 'P⁻¹（読む）→ D（のばす）→ P（もどす）' : 'P（もどす）→ D → P⁻¹（読む）', x, 226, { size: 15 });
  cv.text('同じように、対角行列にするのは', x, 280, { size: 15, color: 'sub' });
  cv.text('P⁻¹AP ＝ (5, 0)、(0, 2)', x, 306, { size: 16, bold: true });
  cv.text('PAP⁻¹ ＝ (5.33, 0.67)、(−1.67, 1.67)', x, 332, { size: 15, color: 'd' });
  cv.text('（右上が 2/3 で、対角行列にならない）', x, 356, { size: 14, color: 'd' });
}

A.item({
  id: 'm4-06', title: '対角化は物差しの取りかえ',
  from: '数学 第7巻 7-9「対角化」の図から（7-9⑦、9-11、物理 波-3 でも使う）',
  W: 880, H: 440,
  state: { t: 0, g: 'r', s: 0, direct: true, o: 'ok' },
  scenes: [
    {
      key: 'naname', label: '① ななめの方眼で見る',
      lead: '固有ベクトル $(1,\\ 1)$・$(1,\\ -1)$ を物差しにした、ななめの方眼をかきました。▶ で主役の行列 $A$ をかけていくと、ななめの方眼はどう変わるでしょう。',
      note: 'ふつうの方眼で見ると「ななめにゆがむ」のに、ななめの方眼で見ると、$(1,\\ 1)$ の向き（オレンジの線のあいだ）が3倍に広がるだけで、$(1,\\ -1)$ の向き（緑の線のあいだ）は変わりません。ななめの物差しで読んだ数 $(q_1,\\ q_2)$ は、$A$ をかけると $(3q_1,\\ q_2)$ になります。',
      legend: [['$q_1$ が同じ線（$(1,\\ 1)$ の本数）', { color: 'b' }], ['$q_2$ が同じ線（$(1,\\ -1)$ の本数）', { color: 'c', style: 'dash' }], ['もとの家', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'g', label: '方眼', options: [['r', '両方'], ['f', 'ふつうの方眼'], ['n', 'ななめの方眼']] }],
      step(st, dt) { st.t = Math.min(1, st.t + dt * 0.4); if (st.t >= 1) return false; },
      draw: drawNaname,
      readout: st => { const s = 1 + 2 * ease(st.t); return `$A$ をかけた割合 ${Math.round(ease(st.t) * 100)}%：$q_1$ は ${A.num(s, 2)} 倍、$q_2$ は 1 倍`; }
    },
    {
      key: 'sandan', label: '② 3段に分ける',
      lead: '$A$ を直接かけるかわりに、①ななめに読む（$P^{-1}$）→ ②のばす（$D$）→ ③もどす（$P$）の3段で計算します。▶ で1段ずつ進みます。',
      note: '下の道（$P^{-1}$→$D$→$P$）と、$A$ を直接かけた形（青の点線）は、ぴったり重なります。だから $A=PDP^{-1}$ です。点 $(1,\\ 3)$ は、$(2,\\ -1)$ と読まれ、$(6,\\ -1)$ にのび、$(5,\\ 7)$ にもどります。$A(1,\\ 3)=(5,\\ 7)$ と同じです。',
      state: { s: 0, direct: false },
      legend: [['ななめに読んだ家（$q$ の方眼）', { color: 'd' }], ['$P$ でもどした家', { color: 'ink' }], ['$A$ を直接かけた家', { color: 'b', style: 'dash' }]],
      controls: [{ button: '1段すすむ', act: st => { st.s = st.s >= 3 ? 0 : Math.min(3, Math.floor(st.s + 1e-9) + 1); } }, { check: 'direct', label: '重ねる', text: '$A$ を直接かけた家を点線で見せる' }],
      step(st, dt) { st.s = Math.min(3, st.s + dt * 0.5); if (st.s >= 3) return false; },
      draw: drawSandan,
      readout: st => ['はじめ：点 $(1,\\ 3)$', '① $P^{-1}$ で読む：$q=(2,\\ -1)$', '② $D$ で $q_1$ を3倍：$(6,\\ -1)$', '③ $P$ でもどす：$(6-1,\\ 6+1)=(5,\\ 7)$'][Math.min(3, Math.ceil(st.s - 1e-9))]
    },
    {
      key: 'junban', label: '③ P と P⁻¹ の順',
      lead: '例題2の行列 $A$（1行め $(4,\\ 1)$、2行め $(2,\\ 3)$） で、$P$ と $P^{-1}$ の順番を入れかえると、どうなるでしょう。',
      note: '$PDP^{-1}$ は、右から「ななめに読む→のばす→もどす」の順にはたらき、$A$ と同じになります。順番を入れかえた $P^{-1}DP$ は、ちがう行列です。対角行列 $D$ を作るときも、$P^{-1}AP$ の順です。',
      miss: '$D=PAP^{-1}$ ではありません。$D=P^{-1}AP$（$A=PDP^{-1}$）です。$PAP^{-1}$ を計算すると、右上が $\\frac{2}{3}$ になり、対角行列になりません。',
      state: { o: 'ok', t: 0 },
      legend: [['$A$ をかけた正方形', { color: 'b', style: 'dash' }], ['えらんだ順でかけた正方形', { color: 'ink' }], ['固有ベクトルの直線', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'o', label: '順番', options: [['ok', '$PDP^{-1}$（正しい）'], ['ng', '$P^{-1}DP$（入れかえた）']], on: st => { st.t = 0; } }],
      step(st, dt) { st.t = Math.min(1, st.t + dt * 0.6); if (st.t >= 1) return false; },
      draw: drawJunban,
      readout: st => st.o === 'ok' ? '$PDP^{-1}=A$：点線の正方形とぴったり重なる' : '$P^{-1}DP\\neq A$：点線の正方形と重ならない'
    }
  ]
});
