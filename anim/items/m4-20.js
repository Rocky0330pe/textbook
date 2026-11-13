// @id m4-20
// @title sin をたして方形波へ：スペクトルとギブズ現象
// @vol 数学9
// @from 数学 9-1 図1・2・3（ch9-01:271・310・354）、9-0 図5（ch9-00:400）／9-2〜9-4・9-12、物理 波-11・電-11 でも使う
'use strict';
// 高さ1の方形波（0<t<π で1、π<t<2π で −1）＝ 4/π (sin t + sin3t/3 + sin5t/5 + …)
function S(t, N) { let s = 0; for (let k = 0; k < N; k++) { const n = 2 * k + 1; s += Math.sin(n * t) / n; } return 4 / Math.PI * s; }
function sq(t) { const u = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return u < Math.PI ? 1 : -1; }
function peak(N) {   // 角（t=0）のそばの山：0<t≦π/2 でいちばん高い所
  let best = -9, bt = 0; const M = 2000, a = Math.PI / 2;
  for (let j = 1; j <= M; j++) { const t = a * j / M; const v = S(t, N); if (v > best) { best = v; bt = t; } }
  return [best, bt];
}
const deg = t => t * 180 / Math.PI;

A.item({
  id: 'm4-20', title: 'sin をたして方形波へ：スペクトルとギブズ現象',
  from: '数学 第9巻 9-1 図1・2・3・9-0 図5 から（9-2〜9-4・9-12、物理 波-11・電-11 でも使う）',
  W: 880, H: 420,
  state: { N: 1, acc: 0, each: true, G: 10 },
  scenes: [
    {
      key: 'tasu', label: '① 1つずつたす',
      lead: '$\\sin t$ に、$\\frac{1}{3}\\sin3t$、$\\frac{1}{5}\\sin5t$、… を1つずつたしていきます（全体を $\\frac{4}{\\pi}$ 倍）。▶ で、たす数がふえます。',
      note: 'たす数をふやすと、山の上が平らになり、0 と $\\pi$ の所でまっすぐ立ち上がって、高さ1の方形波に近づきます。右の棒グラフ（スペクトル）は、$\\sin nt$ を何倍してたすか：奇数番だけで、大きさは $\\frac{4}{n\\pi}$（$n$ に反比例）。偶数番は0です。',
      miss: '$b_n$ は「$n$ 番めの点での値」ではありません。「$\\sin nt$ をかけて1周期で平均の2倍」という操作の名前で、1周期ぜんぶの値から決まる数です。',
      legend: [['たした和', { color: 'a' }], ['高さ1の方形波', { color: 'b', style: 'dash' }], ['いまたした1つの波', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'N', label: 'たした波の数', min: 1, max: 50, step: 1, d: 0 }, { check: 'each', label: '見る', text: 'いまたした1つの波も見る' }],
      step(st, dt) { st.acc += dt; if (st.acc > (st.N < 6 ? 1.2 : 0.35)) { st.acc = 0; st.N++; } if (st.N >= 50) return false; },
      draw(cv, st) { drawSum(cv, st); },
      readout: st => { const v90 = S(Math.PI / 2, st.N) * Math.PI / 4; return `たした波の数 ${st.N}（$n$ は1〜${2 * st.N - 1}）　90° の値（$\\frac{4}{\\pi}$ をかける前）＝ ${A.num(v90, 4)}　→ $\\frac{\\pi}{4}$ ＝ 0.7854`; }
    },
    {
      key: 'gibbs', label: '② 角の山（ギブズ現象）',
      lead: '角（$t=0$）のそばを横に拡大して見ます。たす数をふやすと、角のそばの山はどうなるでしょう。',
      note: 'たす数をふやすと、山は角に近づき、はばはせまくなりますが、高さは**約1.179のまま**です。とび（$-1$ から1へ、2だけとぶ）に対して、約9 % の行きすぎが残ります（ギブズ現象）。角から少しでもはなれた所では、和は方形波にいくらでも近づきます。',
      miss: '「1000個たせば、角の山はなくなる」ではありません。山の高さは約1.179のままです。',
      legend: [['たした和', { color: 'a' }], ['高さ1の方形波', { color: 'b', style: 'dash' }], ['1.179 の線', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'G', label: 'たした波の数', min: 1, max: 200, step: 1, d: 0 }],
      step(st, dt) { st.acc += dt; if (st.acc > 0.12) { st.acc = 0; st.G = Math.min(200, st.G + Math.max(1, Math.round(st.G * 0.08))); } if (st.G >= 200) return false; },
      draw(cv, st) { drawGibbs(cv, st); },
      readout: st => { const [h, t] = peak(st.G); return `たした波の数 ${st.G}　山の高さ ＝ <b>${A.num(h, 3)}</b>　山の場所 ＝ ${A.num(deg(t), deg(t) < 10 ? 2 : 1)}°`; }
    }
  ]
});

function drawSum(cv, st) {
  const v = cv.view({ x0: -0.3, x1: 2 * Math.PI + 0.3, y0: -1.5, y1: 1.5, box: [40, 20, 520, 370] });
  v.axes({ xt: [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI], yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't' });
  v.line([[-0.3, -1], [0, -1], [0, 1], [Math.PI, 1], [Math.PI, -1], [2 * Math.PI, -1], [2 * Math.PI, 1], [2 * Math.PI + 0.3, 1]], { color: 'b', style: 'dash', width: 2 });
  if (st.each) { const n = 2 * st.N - 1; v.plot(t => 4 / Math.PI * Math.sin(n * t) / n, { color: 'c', style: 'dot', width: 2.2, n: 600 }); }
  v.plot(t => S(t, st.N), { color: 'a', width: 3, n: 900 });
  v.dot(Math.PI / 2, S(Math.PI / 2, st.N), { color: 'a', r: 5 });
  // 右：スペクトル
  const s = cv.view({ x0: 0, x1: 16, y0: 0, y1: 1.45, box: [610, 40, 250, 300] });
  s.axes({ xt: [1, 3, 5, 7, 9, 11, 13, 15], yt: [0.5, 1, 4 / Math.PI], xl: 'n', yl: '大きさ bₙ', yfmt: y => A.num(y, y > 1.2 ? 3 : 1), grid: false });
  for (let n = 1; n <= 15; n++) {
    if (n % 2 === 0) { s.dot(n, 0.03, { color: 'ink', r: 3 }); continue; }
    const h = 4 / (n * Math.PI), on = (n + 1) / 2 <= st.N;
    s.poly([[n - 0.38, 0], [n + 0.38, 0], [n + 0.38, h], [n - 0.38, h]], { fill: on ? 'b' : 'sub', alpha: on ? 0.8 : 0.2, color: on ? 'b' : 'line', width: 1 });
  }
  cv.text('時間の世界', 300, 405, { align: 'center', size: 15, color: 'sub' });
  cv.text('周波数の世界（スペクトル）', 735, 380, { align: 'center', size: 15, color: 'sub' });
  cv.text('黒い点：偶数番は0', 735, 404, { align: 'center', size: 14, color: 'sub' });
}

function drawGibbs(cv, st) {
  const N = st.G, x1 = Math.min(Math.PI, 2 * Math.PI / N), [h, tp] = peak(N);
  const v = cv.view({ x0: 0, x1, y0: 0, y1: 1.4, box: [60, 20, 560, 360] });
  const tk = [1, 2, 3, 4].map(k => k * x1 / 4);
  v.axes({ xt: tk, yt: [0.5, 1], xfmt: x => A.num(deg(x), deg(x) < 10 ? 2 : 1) + '°', xl: 't' });
  v.line([[0, 1], [x1, 1]], { color: 'b', style: 'dash', width: 2 });
  v.line([[0, 1.1790], [x1, 1.1790]], { color: 'd', style: 'dot', width: 2 });
  v.text('1.179', x1, 1.22, { align: 'right', size: 15, color: 'd', bold: true });
  v.plot(t => S(t, N), { color: 'a', width: 3, n: 700 });
  v.dot(tp, h, { color: 'a', r: 6, shape: 'diamond' });
  // 右：表（本の値）
  const rows = [[1, '1.273', '90°'], [2, '1.200', '45°'], [4, '1.184', '22.5°'], [10, '1.180', '9°'], [50, '1.179', '1.8°'], [200, '1.179', '0.45°']];
  const X = 660, Y = 60;
  cv.text('たした数', X, Y, { size: 15, bold: true }); cv.text('高さ', X + 92, Y, { size: 15, bold: true }); cv.text('場所', X + 152, Y, { size: 15, bold: true });
  rows.forEach(([n, a, b], k) => {
    const y = Y + 32 * (k + 1), on = n === N;
    if (on) cv.rect(X - 6, y - 14, 210, 28, { fill: 'hl', alpha: 0.9 });
    cv.text(String(n), X + 20, y, { size: 15, align: 'center' }); cv.text(a, X + 92, y, { size: 15 }); cv.text(b, X + 152, y, { size: 15 });
  });
  cv.text(`横は ${A.num(Math.PI * 2 / x1, 0)} 倍に拡大（0〜${A.num(deg(x1), 1)}°）`, 610, 345, { align: 'right', size: 15, color: 'sub' });
}
