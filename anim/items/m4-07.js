// @id m4-07
// @title 固有値の大きさで行き先が決まる
// @vol 数学7
// @from 数学 7-10 図3・6（ch7-10:254・519）、まちがえやすいところ（ch7-10:1020）
'use strict';
const DG = Math.PI / 180;
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u;
// 複素数のかけ算
const cm = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cabs = a => Math.hypot(a[0], a[1]);
function kind(r, re, im) {
  const s = Math.abs(r - 1) < 0.005 ? '大きさが変わらない' : r < 1 ? '消える（0に近づく）' : 'ふえる';
  const t = Math.abs(im) > 0.005 ? '回りながら' : re < 0 ? '符号が毎回入れかわりながら' : '';
  return (t ? t + '、' : '') + s;
}

function drawKazu(cv, st) {
  const a = st.a, n = Math.floor(st.n);
  // 上：数直線（−1 と 1 のあいだを緑に）
  const L = cv.view({ x0: -2, x1: 2, y0: -1, y1: 1, box: [40, 10, 800, 80] });
  L.poly([[-1, -0.35], [1, -0.35], [1, 0.35], [-1, 0.35]], { fill: 'c', alpha: 0.2 });
  L.line([[-2, 0], [2, 0]], { color: 'sub', width: 1.5 });
  for (const t of [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]) { L.line([[t, -0.2], [t, 0.2]], { color: 'sub', width: 1 }); L.text(A.num(t, 1), t, -0.62, { size: 14, color: 'sub', align: 'center' }); }
  L.text('消える（|a|<1）', 0, 0.62, { size: 14, color: 'c', align: 'center', bold: true });
  L.text('ふえる', -1.6, 0.62, { size: 14, color: 'b', align: 'center' }); L.text('ふえる', 1.6, 0.62, { size: 14, color: 'b', align: 'center' });
  L.dot(a, 0, { color: 'd', r: 8, shape: 'diamond' }); L.text('a', a + 0.05, 0.3, { size: 16, math: true, italic: true, bold: true, color: 'd' });
  // 下：棒グラフ x_n
  const Y = Math.abs(a) > 1 ? 12 : 1.2;
  const g = cv.view({ x0: -0.5, x1: 6.6, y0: -Y, y1: Y, box: [80, 120, 760, 300] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: Y > 2 ? [-10, -5, 5, 10] : [-1, -0.5, 0.5, 1], xl: 'n', yl: 'xₙ', yfmt: v => A.num(v, Y > 2 ? 0 : 1) });
  for (let k = 0; k <= Math.min(n, 6); k++) {
    const x = Math.pow(a, k), y = A.clamp(x, -Y, Y);
    g.poly([[k - 0.18, 0], [k + 0.18, 0], [k + 0.18, y], [k - 0.18, y]], { fill: x >= 0 ? 'b' : 'a', alpha: 0.6, color: x >= 0 ? 'b' : 'a', width: 1.5 });
    g.text(A.num(x, Math.abs(x) >= 10 ? 1 : 3), k, y + (y >= 0 ? 1 : -1) * Y * 0.07, { size: 14, align: 'center', bg: true });
  }
}

function drawFuku(cv, st) {
  const lam = [st.r * Math.cos(st.th * DG), st.r * Math.sin(st.th * DG)], n = Math.floor(st.n);
  // 左：固有値の地図
  const L = cv.view({ x0: -1.7, x1: 1.7, y0: -1.7, y1: 1.7, box: [10, 20, 380, 380], equal: true });
  L.poly(A.range(0, 360, 5).map(d => [Math.cos(d * DG), Math.sin(d * DG)]), { fill: 'c', alpha: 0.15 });
  L.axes({ xt: [-1, 1], yt: [-1, 1], xl: '実部', yl: '虚部', yfmt: v => A.num(v, 0) + 'j' });
  L.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'c', width: 2 });
  L.line([[0, 0], lam], { color: 'd', width: 1.5, style: 'dot' });
  L.dot(lam[0], lam[1], { color: 'd', r: 8, shape: 'diamond' }); L.dot(lam[0], -lam[1], { color: 'd', r: 6, shape: 'diamond', open: true });
  cv.circle(L.X(lam[0]), L.Y(lam[1]), 14, { color: 'd', width: 1.5 });
  L.text('λ', lam[0] + 0.12, lam[1] + 0.16, { size: 18, math: true, italic: true, bold: true, color: 'd' });
  cv.text('固有値 λ（ドラッグできる）', 200, 418, { size: 14, color: 'sub', align: 'center' });
  // 右：点 (1,0) に、行列 rR(θ) を n 回かけた点
  const R = cv.view({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2, box: [450, 20, 420, 380], equal: true });
  R.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x', yl: 'y' });
  R.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'sub', width: 1.2, style: 'dot' });
  let z = [1, 0]; const pts = [z];
  for (let k = 1; k <= Math.min(n, 12); k++) { z = cm(z, lam); pts.push(z); }
  R.clip(() => { R.line(pts, { color: 'b', width: 1.5, alpha: 0.6 }); pts.forEach((p, k) => R.dot(p[0], p[1], { color: k === pts.length - 1 ? 'b' : 'a', r: k === pts.length - 1 ? 7 : 4.5, shape: k === pts.length - 1 ? 'circle' : 'square' })); });
  const last = pts[pts.length - 1];
  if (Math.abs(last[0]) < 2.2 && Math.abs(last[1]) < 2.2) R.text('x' + (pts.length - 1 > 0 ? subN(pts.length - 1) : '₀'), last[0] + 0.12, last[1] + 0.2, { size: 16, bold: true, bg: true });
  else cv.text('画面の外へ出た', 660, 40, { size: 15, color: 'b', bold: true, align: 'center' });
  cv.text('点 (1, 0) に行列 ' + (Math.abs(st.r - 1) < 0.005 ? '' : A.num(st.r, 2)) + 'R(' + Math.round(st.th) + '°) を n 回かけた', 660, 418, { size: 14, color: 'sub', align: 'center' });
}
const subN = k => String(k).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join('');

const MAPS = {
  A: { name: '主役 A', pts: [[3, 0], [1, 0]], say: '(1, 1) の向きにそろい、1回ごとに約3倍ずつ大きくなる' },
  M: { name: '天気 M', pts: [[1, 0], [0.4, 0]], say: '1 の部分だけ残り、(2/3, 1/3) に落ち着く' },
  R: { name: 'R(30°)', pts: [[Math.cos(30 * DG), 0.5], [Math.cos(30 * DG), -0.5]], say: '円の上を回り続ける（大きさは変わらない）' },
  Q: { name: '0.9R(30°)', pts: [[0.9 * Math.cos(30 * DG), 0.45], [0.9 * Math.cos(30 * DG), -0.45]], say: 'うずを巻きながら、原点に近づく' },
  G: { name: 'ばねの G', pts: [[1, 0.1], [1, -0.1]], say: '回りながら、少しずつ外へ広がる（1回ごとに約1.005倍）' }
};
function drawChizu(cv, st) {
  const v = cv.view({ x0: -1.4, x1: 3.4, y0: -1.3, y1: 1.3, box: [20, 20, 840, 400], equal: true });
  v.poly(A.range(0, 360, 5).map(d => [Math.cos(d * DG), Math.sin(d * DG)]), { fill: 'c', alpha: 0.15 });
  v.axes({ xt: [-1, 1, 2, 3], yt: [-1, 1], xl: '実部', yl: '虚部', yfmt: v => A.num(v, 0) + 'j' });
  v.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'c', width: 2 });
  v.text('消える（円の中）', -0.75, -0.5, { size: 15, color: 'c', bold: true, align: 'center' });
  v.text('ふえる（円の外）', 2.2, -0.8, { size: 15, color: 'b', bold: true, align: 'center' });
  v.text('円の上：大きさが変わらない', 1.7, 1.12, { size: 15, align: 'center' });
  for (const k of Object.keys(MAPS)) {
    const on = st.m === k;
    MAPS[k].pts.forEach(p => v.dot(p[0], p[1], { color: on ? 'd' : 'sub', r: on ? 8 : 5, shape: on ? 'diamond' : 'circle' }));
  }
  const m = MAPS[st.m];
  m.pts.forEach((p, i) => { if (i === 0 || st.m === 'A' || st.m === 'M') v.text(lab(p), p[0] + 0.06, p[1] + (p[1] >= 0 ? 0.13 : -0.13), { size: 15, color: 'd', bold: true, bg: true }); });
}
const lab = p => Math.abs(p[1]) < 1e-9 ? A.num(p[0], p[0] % 1 ? 1 : 0) : A.num(p[0], 3) + (p[1] >= 0 ? ' ＋ ' : ' − ') + A.num(Math.abs(p[1]), 2) + 'j';

A.item({
  id: 'm4-07', title: '固有値の大きさで行き先が決まる',
  from: '数学 第7巻 7-10「くり返しと固有値」の図から（9-9・9-10・9-11 でも使う）',
  W: 880, H: 440,
  state: { a: 1.5, n: 0, pre: 1.5, r: 0.9, th: 30, m: 'A' },
  scenes: [
    {
      key: 'kazu', label: '① 1つの数のくり返し',
      lead: '$x_{n+1}=a\\,x_n$（$x_0=1$）を、6回くり返します。$a$ を変えて ▶ をおしてみましょう。',
      note: 'ふえるか、0に近づくかは、$a$ の大きさ $|a|$ で決まります（$|a|>1$ でふえ、$|a|<1$ で消える）。$a$ が負なら、符号が毎回入れかわります。$|a|=1$ がちょうど境目です。',
      miss: '$a=-1.5$ は負の数ですが、大きさ $|-1.5|=1.5>1$ なので、くり返すと**ゆれながらふえ**ます。負の符号は、向きが毎回入れかわることを表すだけです。',
      state: { a: 1.5, n: 0 },
      legend: [['$x_n>0$', { color: 'b', shape: 'square', noline: true }], ['$x_n<0$', { color: 'a', shape: 'square', noline: true }], ['消える区間 $-1<a<1$', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ seg: 'a', label: '$a$ の例', options: [[1.5, '1.5'], [0.5, '0.5'], [-0.5, '−0.5'], [-1.5, '−1.5']], on: st => { st.n = 0; } }, { range: 'a', label: '$a$', min: -1.6, max: 1.6, step: 0.05, on: st => { st.n = 6; } }],
      step(st, dt) { st.n = Math.min(6, st.n + dt * 1.5); if (st.n >= 6) return false; },
      draw: drawKazu,
      readout: st => { const n = Math.floor(st.n); return `$a=${A.num(st.a, 2)}$：$x_${n}=a^${n}=${A.num(Math.pow(st.a, n), 3)}$　→　${kind(Math.abs(st.a), st.a, 0)}`; }
    },
    {
      key: 'fukuso', label: '② 固有値を動かす',
      lead: '左の複素数平面で、固有値 $\\lambda$（◆）をドラッグします。右は、その固有値をもつ行列（$r$ 倍した回転）を点 $(1,\\ 0)$ に12回かけた点の列です。',
      note: '$\\lambda=r\\,e^{j\\theta}$ を $n$ 回かけると、大きさは $r^n$、角は $n\\theta$ です。1回ごとに角が $\\theta$ 進み、大きさが $r$ 倍になります。円の上（$r=1$）なら回り続け、円の中ならうずを巻いて消え、円の外ならうずを巻いて広がります。実数の負の固有値は、角が180°の場合で、1回ごとに向きが反対になります。',
      miss: '$|1+0.1j|$ は $1+0.1=1.1$ ではなく、$\\sqrt{1^2+0.1^2}=\\sqrt{1.01}\\approx1.005$ です。',
      state: { r: 0.9, th: 30, n: 0, pre: 'b' },
      legend: [['固有値 $\\lambda$（と、ならんで出る共役な数）', { color: 'd', shape: 'diamond', noline: true }], ['単位円 $|\\lambda|=1$', { color: 'c' }], ['かけた点 $\\vec x_n$', { color: 'a', shape: 'square' }]],
      controls: [{ seg: 'pre', label: '例', options: [['a', '$R(30°)$'], ['b', '$0.9R(30°)$'], ['c', '$1.1R(30°)$'], ['d', '$-0.8$'], ['e', '$1+0.1j$']], on: st => { const P = { a: [1, 30], b: [0.9, 30], c: [1.1, 30], d: [0.8, 180], e: [Math.hypot(1, 0.1), Math.atan2(0.1, 1) / DG] }[st.pre]; st.r = P[0]; st.th = P[1]; st.n = 0; } }],
      step(st, dt) { st.n = Math.min(12, st.n + dt * 2); if (st.n >= 12) return false; },
      drag: {
        hit(st, x, y) { const L = cv0(); const p = L.P([st.r * Math.cos(st.th * DG), st.r * Math.sin(st.th * DG)]); return A.near(x, y, p[0], p[1], 26) ? 1 : (L.inside(x, y) ? 1 : null); },
        move(st, x, y) { const [a, b] = cv0().inv(x, y); let r = Math.hypot(a, b), th = Math.atan2(b, a) / DG; if (Math.abs(r - 1) < 0.03) r = 1; st.r = A.clamp(Math.round(r * 100) / 100, 0, 1.6); st.th = Math.round(th); st.n = 12; st.pre = ''; }
      },
      draw: drawFuku,
      readout: st => `$|\\lambda|=${A.num(st.r, 3)}$、角 $${Math.round(st.th)}°$　→　${kind(st.r, Math.cos(st.th * DG), Math.abs(Math.sin(st.th * DG)) < 1e-6 ? 0 : 1)}`
    },
    {
      key: 'chizu', label: '③ 固有値の地図',
      lead: 'これまでの行列の固有値を、複素数平面にかきました。行列をえらぶと、その固有値が ◆ で光ります。',
      note: '行き先を決めるのは、固有値の**大きさ** $|\\lambda|$ です。いちばん大きい固有値が円の外なら全体はふえ、円の上なら残り、すべて円の中なら消えます。主役の行列は3が円の外、天気の行列は1が円の上、0.4が円の中です。',
      state: { m: 'A' },
      legend: [['えらんだ行列の固有値', { color: 'd', shape: 'diamond', noline: true }], ['ほかの行列の固有値', { color: 'sub', shape: 'circle', noline: true }], ['単位円', { color: 'c' }]],
      controls: [{ seg: 'm', label: '行列', options: Object.keys(MAPS).map(k => [k, MAPS[k].name]) }],
      draw: drawChizu,
      readout: st => `${MAPS[st.m].name}：固有値の大きさ ${MAPS[st.m].pts.map(p => A.num(cabs(p), 3)).join('、')}　→　${MAPS[st.m].say}`
    }
  ]
});
function cv0() { return new A.View({ W: 880, H: 440 }, { x0: -1.7, x1: 1.7, y0: -1.7, y1: 1.7, box: [10, 20, 380, 380], equal: true }); }
