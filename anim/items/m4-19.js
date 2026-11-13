// @id m4-19
// @title はじいた弦：走る波と定在波の和
// @vol 数学8
// @from 数学 8-13 表・図8・⑨（ch8-13:546〜588）、9-1 図11（ch9-01:807）、9-2 図8（ch9-02:658）／物理 波-5・6 でも使う
'use strict';
// 弦の長さ L=1、波の速さ c=1 として描く（時間の目もりは L/c）。はじく高さ h=1
function tri(x, p) { return x <= p ? x / p : (1 - x) / (1 - p); }            // はじめの形（三角形）
function ext(x, p) { let u = ((x % 2) + 2) % 2; return u <= 1 ? tri(u, p) : -tri(2 - u, p); }   // 原点で半回転して広げた形（周期 2L）
function bn(n, p) { return 2 * Math.sin(n * Math.PI * p) / (n * n * Math.PI * Math.PI * p * (1 - p)); }   // 9-2 例題5（p=1/2 で 8h/(n²π²)·sin(nπ/2)）
function initTable(st) { st.rows = [[0, 0, 0, 0, 2, 4, 2, 0, 0, 0, 0]]; st.acc = 0; }
function nextRow(st) {
  const R = st.rows, n = R.length, y = R[n - 1], get = (a, i) => (i < 0 || i > 10) ? 0 : a[i];   // 両はし（玉0と玉12）は止めてある
  let z;
  if (n === 1) z = y.map((v, i) => (get(y, i - 1) + get(y, i + 1)) / 2);                          // 1歩め：となり2つの平均
  else { const w = R[n - 2]; z = y.map((v, i) => get(y, i + 1) + get(y, i - 1) - w[i]); }         // s=1 の式
  R.push(z);
}

A.item({
  id: 'm4-19', title: 'はじいた弦：走る波と定在波の和',
  from: '数学 第8巻 8-13 ⑧⑨・第9巻 9-1 図11・9-2 図8 から（物理 波-5・6 でも使う）',
  W: 880, H: 440,
  state: { p: 0.5, t: 0, N: 5, ex: true, each: false },
  scenes: [
    {
      key: 'hyou', label: '① 波の表計算',
      lead: '弦を11この玉の列と考え、まん中に山（2、4、2）を作って、そっと手をはなします。$s=1$ の表計算を1行ずつ進めます。',
      note: '$s=1$ なら、1歩の式は $y_i^{n+1}=y_{i+1}^{n}+y_{i-1}^{n}-y_i^{n-1}$。高さ4の山が、高さ2の2つの山に分かれ、**1歩に1マスずつ**左右へ走ります。はしでは、山が逆さになってはね返ります。',
      init: initTable,
      legend: [['いまの弦（玉）', { color: 'a', shape: 'circle' }], ['1つ前の行', { color: 'sub', style: 'dot' }]],
      step(st, dt) { st.acc += dt; if (st.acc > 0.7) { st.acc = 0; nextRow(st); } if (st.rows.length > 24) return false; },
      controls: [{ button: '1行進める', act: st => nextRow(st) }],
      draw(cv, st) { drawTable(cv, st); },
      readout: st => `${st.rows.length - 1} 歩め　　山の高さ ＝ ${A.num(Math.max(...st.rows[st.rows.length - 1].map(Math.abs)), 0)}`
    },
    {
      key: 'hashiru', label: '② 2つに分かれて走る',
      lead: 'はじいた弦の形を、半分ずつの2つの山に分けます。1つは右へ、1つは左へ、形を保ったまま走ります。',
      note: 'ダランベールの解 $y=f(x-ct)+g(x+ct)$。$f$ も $g$ も「はじめの形の半分」です。はしでは、弦の外側に原点で半回転した「見えない形」があると考えると、はね返りもこの2つの和で表せます。',
      legend: [['弦 $y$（2つの和）', { color: 'a' }], ['右へ走る半分 $f(x-ct)$', { color: 'b', style: 'dash' }], ['左へ走る半分 $g(x+ct)$', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'p', label: 'はじく場所 $\\frac{p}{L}$', min: 0.1, max: 0.9, step: 0.05, d: 2, on: st => { st.t = 0; } }, { range: 't', label: '時刻 $\\frac{ct}{L}$', min: 0, max: 2, step: 0.01, d: 2 }],
      step(st, dt) { st.t += dt * 0.25; if (st.t > 2) st.t -= 2; },
      draw(cv, st) { drawString(cv, st, 'run'); },
      readout: st => `時刻 ${A.num(st.t, 2)}（1往復 ＝ 2）　まん中の高さ ＝ ${A.num(0.5 * (ext(0.5 - st.t, st.p) + ext(0.5 + st.t, st.p)), 3)}`
    },
    {
      key: 'mode', label: '③ sin のゆれの和',
      lead: '同じ動きを、両はしで0の $\\sin\\frac{n\\pi x}{L}$ のゆれ（定在波）の和でも作ります。たす数 $N$ をふやしてみましょう。',
      note: '$y=\\sum b_n\\sin\\frac{n\\pi x}{L}\\cos\\frac{n\\pi ct}{L}$。$n$ 番めは基本の $n$ 倍の速さでゆれます（ギターの5弦なら110 Hz・220 Hz・330 Hz…）。たす数をふやすと、②の「走る2つの山」とぴったり重なります。まん中ではじくと偶数番が0、はしから $\\frac{1}{5}$ ではじくと5番めが0です。',
      miss: '$\\sin\\frac{n\\pi}{2}$ は $\\sin n\\pi$ とちがって、いつも0ではありません（$1,\\ 0,\\ -1,\\ 0,\\ \\ldots$）。まん中ではじいたとき0になるのは偶数番だけです。',
      legend: [['$N$ 個のゆれの和', { color: 'a' }], ['走る2つの山の和（②）', { color: 'ink', style: 'dot' }], ['1つずつのゆれ（$n=1,\\ 2,\\ 3$）', { color: 'e', style: 'dash' }]],
      controls: [{ range: 'N', label: 'たす数 $N$', min: 1, max: 30, step: 1, d: 0 }, { range: 'p', label: 'はじく場所 $\\frac{p}{L}$', min: 0.1, max: 0.9, step: 0.05, d: 2 }, { check: 'each', label: '見る', text: '1つずつのゆれも見る' }],
      step(st, dt) { st.t += dt * 0.25; if (st.t > 2) st.t -= 2; },
      draw(cv, st) { drawString(cv, st, 'mode'); },
      readout: st => { const b = [1, 2, 3, 4, 5].map(n => A.num(Math.abs(bn(n, st.p)), 3)); return `$|b_1|$〜$|b_5|$ ＝ ${b.join('、')}（はじく高さを1として）`; }
    }
  ]
});

function drawTable(cv, st) {
  const v = cv.view({ x0: 0, x1: 12, y0: -4.6, y1: 4.6, box: [30, 16, 480, 400] });
  v.line([[0, 0], [12, 0]], { color: 'grid', width: 1 });
  const R = st.rows, y = R[R.length - 1], pts = [[0, 0], ...y.map((u, i) => [i + 1, u]), [12, 0]];
  if (R.length > 1) v.line([[0, 0], ...R[R.length - 2].map((u, i) => [i + 1, u]), [12, 0]], { color: 'sub', style: 'dot', width: 2 });
  v.line(pts, { color: 'a', width: 2.5 });
  for (let i = 0; i < 11; i++) { v.dot(i + 1, y[i], { color: 'a', r: 7 }); v.text(String(i + 1), i + 1, -4.3, { align: 'center', size: 14, color: 'sub' }); }
  v.dot(0, 0, { color: 'ink', shape: 'square', r: 6 }); v.dot(12, 0, { color: 'ink', shape: 'square', r: 6 });
  v.text('玉の番号', 6, -3.7, { align: 'center', size: 14, color: 'sub' });
  // 右：表（最後の8行）
  const x0 = 530, y0 = 30, cw = 29, rh = 26, rows = R.slice(-12), start = R.length - rows.length;
  cv.text('歩', x0 + 8, y0, { align: 'center', size: 14, color: 'sub', bold: true });
  for (let i = 0; i < 11; i++) cv.text(String(i + 1), x0 + 36 + i * cw, y0, { align: 'center', size: 14, color: 'sub', bold: true });
  rows.forEach((r, k) => {
    const yy = y0 + (k + 1) * rh, last = k === rows.length - 1;
    if (last) cv.rect(x0 - 6, yy - rh / 2, 36 + 11 * cw, rh, { fill: 'hl', alpha: 0.9 });
    cv.text(String(start + k), x0 + 8, yy, { align: 'center', size: 14, color: 'sub' });
    r.forEach((u, i) => cv.text(A.num(u, 0), x0 + 36 + i * cw, yy, { align: 'center', size: 15, bold: last && u !== 0, color: u === 0 ? 'sub' : 'ink' }));
  });
}

function drawString(cv, st, mode) {
  const top = mode === 'mode' ? [30, 16, 560, 300] : [40, 16, 800, 330];
  const v = cv.view({ x0: -0.03, x1: 1.03, y0: -1.15, y1: 1.15, box: top });
  v.line([[0, 0], [1, 0]], { color: 'grid', width: 1 });
  const p = st.p, t = st.t, exact = x => 0.5 * (ext(x - t, p) + ext(x + t, p));
  if (mode === 'run') {
    v.plot(x => 0.5 * ext(x - t, p), { x0: 0, x1: 1, color: 'b', style: 'dash', width: 2.5, n: 400 });
    v.plot(x => 0.5 * ext(x + t, p), { x0: 0, x1: 1, color: 'c', style: 'dot', width: 2.5, n: 400 });
    v.plot(exact, { x0: 0, x1: 1, color: 'a', width: 3.5, n: 400 });
    // 走る向きの矢印（山の場所）
    const md = u => ((u % 2) + 2) % 2, pick = (a, b) => md(a) <= 1 ? md(a) : md(b);
    const show = (u, dir, col) => { if (u > 0.04 && u < 0.96) v.arrow(u, 0.62, u + 0.08 * dir, 0.62, { color: col, width: 2.5, head: 11 }); };
    show(pick(p + t, -p + t), 1, 'b'); show(pick(p - t, -p - t), -1, 'c');   // f(x−ct) はいつも右へ、g(x+ct) はいつも左へ（はね返ると上下が逆）
    v.text('はじめの形（灰色）', 0.02, -0.95, { size: 14, color: 'sub' });
    v.plot(x => tri(x, p), { x0: 0, x1: 1, color: 'sub', width: 1, alpha: 0.5 });
  } else {
    const N = st.N, ys = x => { let s = 0; for (let n = 1; n <= N; n++) s += bn(n, p) * Math.sin(n * Math.PI * x) * Math.cos(n * Math.PI * t); return s; };
    if (st.each) for (let n = 1; n <= Math.min(3, N); n++) v.plot(x => bn(n, p) * Math.sin(n * Math.PI * x) * Math.cos(n * Math.PI * t), { x0: 0, x1: 1, color: 'e', style: 'dash', width: 1.8 });
    v.plot(exact, { x0: 0, x1: 1, color: 'ink', style: 'dot', width: 2, n: 300 });
    v.plot(ys, { x0: 0, x1: 1, color: 'a', width: 3.5, n: 300 });
    // 右：スペクトル |b_n|
    const s = cv.view({ x0: 0, x1: 10.8, y0: 0, y1: 0.9, box: [640, 40, 220, 250] });
    s.axes({ xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yt: [0.4, 0.8], xl: 'n', yl: '|bₙ|', grid: false });
    for (let n = 1; n <= 10; n++) { const h = Math.abs(bn(n, p)); s.poly([[n - 0.3, 0], [n + 0.3, 0], [n + 0.3, h], [n - 0.3, h]], { fill: n <= N ? 'b' : 'sub', alpha: n <= N ? 0.75 : 0.25 }); if (h < 1e-6) s.dot(n, 0.02, { color: 'ink', r: 3 }); }
    cv.text('ギターの5弦なら', 750, 330, { align: 'center', size: 14, color: 'sub' });
    cv.text('n 番め ＝ 110 × n Hz', 750, 352, { align: 'center', size: 15 });
  }
  v.dot(0, 0, { color: 'ink', shape: 'square', r: 6 }); v.dot(1, 0, { color: 'ink', shape: 'square', r: 6 });
  // 下：時刻の目もり
  const bx = mode === 'mode' ? 60 : 120, bw = mode === 'mode' ? 500 : 640, by = 395;
  cv.line([[bx, by], [bx + bw, by]], { color: 'sub', width: 2 });
  for (let k = 0; k <= 4; k++) { cv.line([[bx + bw * k / 4, by - 5], [bx + bw * k / 4, by + 5]], { color: 'sub', width: 1.5 }); cv.text(A.num(k / 2, 1), bx + bw * k / 4, by + 20, { align: 'center', size: 14, color: 'sub' }); }
  cv.dot(bx + bw * t / 2, by, { color: 'b', r: 7, shape: 'diamond' });
  cv.text('時刻 ct/L（2 で1往復してもとの形）', bx + bw / 2, by - 20, { align: 'center', size: 14, color: 'sub' });
}
