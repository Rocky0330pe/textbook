// @id p2-07
// @title すれ違うパルスと、はしの反射
// @vol 物理3
// @from 物理 波-5 ⑥（p3-05 重ね合わせ）・波-6 ①（p3-06 固定端と自由端・表計算のはね返り）／電-13・波-7 でも使う
'use strict';
// パルスは本の図と同じ三角形。③は波-5 ⑧の表計算（s=1、点0〜20、はじめ点9・10・11 に 0.5・1・0.5）で、
// 左はし（点0）を固定端（いつも0）か自由端（点1と同じ値）にしたもの。表の値（6・8・10・12歩）は本の表と同じになる。
const L = 10, W = 1, H = 1;   // 弦の長さ、パルスの半分の幅、高さ（目もりは図と同じく省く）
A.item({
  id: 'p2-07', title: 'すれ違うパルスと、はしの反射',
  from: '物理 第3巻 波-5 ⑥ の図「2つのパルスの重ね合わせ」、波-6 ① の図「はしでの反射」と表計算から（電-13・波-7 でも使う）',
  W: 880, H: 400,
  state: { t: 0, mode: 'tani', vel: false, end: 'fix', mir: true, n: 0, ys: null, yp: null },
  scenes: [
    {
      key: 'surechigai', label: '① すれ違う',
      lead: '左から山、右から山（または谷）が近づきます。破線はそれぞれの波、太い線はその和（弦の本当の形）です。',
      note: '2つの波が同じ所に来たときのずれは、それぞれのずれの和です（重ね合わせの原理）。山と谷がぴったり重なった瞬間、弦はまっすぐになりますが、波が消えたのではありません。弦の各部分はそのとき**動いて**いて（「速さの矢印」で確かめよう）、次の瞬間にはまた山と谷に分かれ、もとの形のまま進んでいきます。',
      legend: [['左から来る波', { color: 'a', style: 'dash' }], ['右から来る波', { color: 'b', style: 'dash' }], ['和（弦の形）', { color: 'ink' }], ['弦の各部分の速さ', { color: 'c', style: 'dot' }]],
      controls: [{ seg: 'mode', label: '右から来る波', options: [['yama', '山'], ['tani', '谷']] }, { check: 'vel', label: '矢印', text: '弦の各部分の速さを見る' }, { button: 'コマ送り', act: (st, api) => { api.play(false); st.t = Math.round((st.t + 0.25) * 4) / 4; if (st.t > 6.5) st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 6.5) st.t = 0; },
      draw(cv, st) { pass(cv, st); },
      readout: st => `時刻 ${A.num(st.t, 2)}　　${Math.abs(st.t - 3) < 0.03 ? (st.mode === 'tani' ? '<b>ぴったり重なった：弦はまっすぐ。でも動いている</b>' : '<b>ぴったり重なった：高さは2倍</b>') : st.t > 3 + 2 * W ? '通りぬけた後は、もとの形' : ''}`
    },
    {
      key: 'hansha', label: '② はしでの反射',
      lead: '右のはしへ山を送ります。はしが止めてある（固定端）か、自由に動ける（自由端）かで、はね返り方を比べましょう。',
      note: 'はしの向こうから「鏡のパルス」が同じ速さで来ると考えます。固定端では上下さかさまの鏡のパルスで、はしのずれがいつも0になります。自由端ではそのままの鏡のパルスで、はしの傾きがいつも0になり、はしの輪は山の2倍の高さまで上がります。2つの和を、はしの手前だけ見たものが弦の形です。',
      miss: '「山のパルスは、かべではね返っても山のまま」ではありません。固定端では、山は谷になってもどります。山のままもどるのは自由端のときです。',
      legend: [['来た山', { color: 'a', style: 'dash' }], ['鏡のパルス', { color: 'b', style: 'dash' }], ['弦の形（和）', { color: 'ink' }]],
      controls: [{ seg: 'end', label: 'はし', options: [['fix', '固定端'], ['free', '自由端']], on: st => { st.t = 0; } }, { check: 'mir', label: '鏡', text: '鏡のパルスを見る' }, { button: 'コマ送り', act: (st, api) => { api.play(false); st.t = Math.round((st.t + 0.25) * 4) / 4; if (st.t > 12) st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 12) st.t = 0; },
      draw(cv, st) { refl(cv, st); },
      readout: st => { const e = endY(st); return `はしのずれ ＝ ${A.num(e, 2)}（山の高さを1として）　　${st.end === 'fix' ? 'はしは動かない' : 'はしは傾き0のまま上下する'}`; }
    },
    {
      key: 'hyou', label: '③ 表計算で確かめる',
      lead: '弦を21個の点に分けた表計算（$s=1$）で、左はしではね返るようすを1歩ずつ見ます。',
      note: '1歩の式は「次の値＝（左となり＋右となり）－（1つ前の同じ点）」です。固定端では点0をいつも0に、自由端では点0に点1と同じ値を入れます。固定端では10歩めに一瞬まっすぐになり、12歩めには谷になってもどります。自由端のはしが山の2倍（1）まで上がらず 0.75 なのは、山をたった3つの点で表した粗い計算だからです。',
      legend: [['いまの歩の値', { color: 'a', shape: 'circle' }], ['はじめの形（0歩）', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'end', label: '左はし（点0）', options: [['fix', '固定端'], ['free', '自由端']], on: reset }, { button: '1歩', act: (st, api) => { api.play(false); stepSheet(st); } }],
      init: reset,
      step(st, dt) { st.acc = (st.acc || 0) + dt; if (st.acc > 0.5) { st.acc = 0; stepSheet(st); } if (st.n >= 14) return false; },
      draw(cv, st) { sheet(cv, st); },
      readout: st => `${st.n} 歩め　点0〜6：${st.ys.slice(0, 7).map(v => A.num(v, 2)).join('　')}`
    }
  ]
});

// 三角のパルス（中心 c）と、その傾き
function tri(x, c) { return Math.max(0, H * (1 - Math.abs(x - c) / W)); }
function dtri(x, c) { const d = x - c; return Math.abs(d) >= W ? 0 : d > 0 ? -H / W : H / W; }

function pass(cv, st) {
  const s = st.mode === 'tani' ? -1 : 1, c1 = 2 + st.t, c2 = 8 - st.t;
  const v = cv.view({ x0: 0, x1: L, y0: -2.3, y1: 2.3, box: [40, 20, 800, 340] });
  v.line([[0, 0], [L, 0]], { color: 'grid', width: 1.5 });
  v.plot(x => tri(x, c1), { color: 'a', style: 'dash', width: 2, n: 800 });
  v.plot(x => s * tri(x, c2), { color: 'b', style: 'dash', width: 2, n: 800 });
  v.plot(x => tri(x, c1) + s * tri(x, c2), { color: 'ink', width: 3.5, n: 800 });
  v.arrow(c1, H + 0.35, c1 + 0.7, H + 0.35, { color: 'a', width: 2 });
  v.arrow(c2, s * H + s * 0.35, c2 - 0.7, s * H + s * 0.35, { color: 'b', width: 2 });
  if (st.vel) {
    for (let x = 0.25; x < L; x += 0.25) {
      const vy = -dtri(x, c1) + s * dtri(x, c2);   // ∂y/∂t（左の波は右へ、右の波は左へ速さ1）
      if (Math.abs(vy) > 1e-6) { const y = tri(x, c1) + s * tri(x, c2); v.arrow(x, y, x, y + vy * 0.8, { color: 'c', style: 'dot', width: 2.5, head: 8 }); }
    }
  }
}

function endY(st) { const c = 3 + st.t, s = st.end === 'fix' ? -1 : 1; return tri(L, c) + s * tri(L, 2 * L - c); }
function refl(cv, st) {
  const c = 3 + st.t, cm = 2 * L - c, s = st.end === 'fix' ? -1 : 1;
  const v = cv.view({ x0: 0, x1: 14, y0: -2.4, y1: 2.6, box: [30, 20, 820, 340] });
  // はしの向こう（実在しない側）
  v.poly([[L, -2.4], [14, -2.4], [14, 2.6], [L, 2.6]], { fill: 'grid', alpha: 0.6 });
  v.text('はしの向こう（考えるだけ）', 12, -2.0, { align: 'center', size: 14, color: 'sub' });
  v.line([[0, 0], [L, 0]], { color: 'grid', width: 1.5 });
  if (st.mir) {
    v.plot(x => tri(x, c), { color: 'a', style: 'dash', width: 2, n: 800 });
    v.plot(x => s * tri(x, cm), { color: 'b', style: 'dash', width: 2, n: 800 });
  }
  v.plot(x => tri(x, c) + s * tri(x, cm), { x0: 0, x1: L, color: 'ink', width: 3.5, n: 800 });
  const e = endY(st);
  if (st.end === 'fix') { v.poly([[L, -2.2], [L + 0.25, -2.2], [L + 0.25, 2.4], [L, 2.4]], { fill: 'sub', alpha: 0.6 }); v.dot(L, 0, { color: 'ink', r: 5 }); v.text('固定端', L - 0.1, 2.2, { align: 'right', size: 15 }); }
  else { v.line([[L, -2.3], [L, 2.5]], { color: 'sub', width: 3 }); v.cv.rect(v.X(L) - 7, v.Y(e) - 12, 14, 24, { color: 'ink', width: 2.5 }); v.text('自由端（輪）', L - 0.1, 2.2, { align: 'right', size: 15 }); }
}

function reset(st) { st.n = 0; st.acc = 0; const y = new Array(21).fill(0); y[9] = 0.5; y[10] = 1; y[11] = 0.5; st.y0 = y.slice(); st.ys = y.slice(); st.yp = y.slice(); }
function stepSheet(st) {
  if (st.n >= 14) return;
  const y = st.ys, p = st.yp, N = y.length;
  const nx = y.map((v, i) => i === 0 || i === N - 1 ? 0 : st.n === 0 ? v + 0.5 * (y[i + 1] - 2 * v + y[i - 1]) : y[i + 1] + y[i - 1] - p[i]);
  if (st.end === 'free') nx[0] = nx[1];
  st.yp = y; st.ys = nx.map(v => Math.round(v * 1e9) / 1e9); st.n++;
}
function sheet(cv, st) {
  const v = cv.view({ x0: -0.8, x1: 20.5, y0: -1.15, y1: 1.25, box: [60, 20, 790, 300] });
  v.axes({ xt: A.range(0, 20, 2), yt: [-1, -0.5, 0.5, 1], xl: '点の番号 i', yfmt: x => A.num(x, x % 1 ? 2 : 0), zero: false });
  v.line(st.y0.map((y, i) => [i, y]), { color: 'sub', style: 'dot', width: 1.5 });
  v.line(st.ys.map((y, i) => [i, y]), { color: 'a', width: 2.5 });
  st.ys.forEach((y, i) => { v.dot(i, y, { color: 'a', r: 5 }); if (i <= 6 && Math.abs(y) > 1e-9) v.text(A.num(y, 2), i, y + (y > 0 ? 0.13 : -0.13), { align: 'center', size: 14, color: 'a', bg: true }); });
  // 左はし
  if (st.end === 'fix') v.poly([[-0.6, -1.1], [-0.25, -1.1], [-0.25, 1.2], [-0.6, 1.2]], { fill: 'sub', alpha: 0.6 });
  else v.line([[-0.1, -1.1], [-0.1, 1.2]], { color: 'sub', width: 3 });
  cv.text(st.n + ' 歩め', 440, 345, { align: 'center', size: 18, bold: true });
  cv.text(st.end === 'fix' ? '本の表：10歩めはすべて0、12歩めは −0.25・−0.5・−0.25' : '本の表：10歩めは 0.75・0.75・0.25、12歩めは山のまま', 440, 375, { align: 'center', size: 15, color: 'sub' });
}
