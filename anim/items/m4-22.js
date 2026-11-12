// @id m4-22
// @title 反対向きに回る2本の矢印：複素フーリエ級数
// @vol 数学9
// @from 数学 9-3 図1・4（ch9-03:264・444）／9-5④・物理 電-10・波-1 でも使う
'use strict';
// 高さ1の方形波の複素フーリエ係数：n が奇数なら c_n = 2/(jnπ) = −2j/(nπ)、偶数と0では0（9-3④）
function cn(n) { return n % 2 ? [0, -2 / (n * Math.PI)] : [0, 0]; }            // [実部, 虚部]
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const ej = th => [Math.cos(th), Math.sin(th)];
function sq(t) { const u = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return u < Math.PI ? 1 : -1; }

A.item({
  id: 'm4-22', title: '反対向きに回る2本の矢印：複素フーリエ級数',
  from: '数学 第9巻 9-3 図1・4 から（9-5、物理 電-10・波-1 でも使う）',
  W: 880, H: 440,
  state: { t: 0, w: 1, op: 'sum', N: 3 },
  scenes: [
    {
      key: 'futatsu', label: '① 2本の矢印の和',
      lead: '左回りの矢印 $e^{j\\omega t}$ と、右回りの矢印 $e^{-j\\omega t}$（長さはどちらも1）をたします。和の矢印の先はどこを動くでしょう。',
      note: '2本はいつも横の軸について折り返した位置にあるので、たての成分が打ち消し合い、和は横の軸の上だけを動きます：$e^{j\\omega t}+e^{-j\\omega t}=2\\cos\\omega t$。右回りの矢印の角周波数 $-\\omega$ を**負の周波数**といいます。マイナスは回る向きの印です。',
      miss: '$e^{-j\\omega t}$ のマイナスを忘れると、2本が同じ向きに回り、和はたてにも動いて、実数の波になりません。',
      legend: [['左回り $e^{j\\omega t}$', { color: 'a' }], ['右回り $e^{-j\\omega t}$', { color: 'b', style: 'dash' }], ['2本の和（差）', { color: 'd', style: 'solid' }]],
      controls: [{ seg: 'op', label: 'たすか、ひくか', options: [['sum', '和 $e^{j\\omega t}+e^{-j\\omega t}$'], ['dif', '差 $e^{j\\omega t}-e^{-j\\omega t}$']], on: st => { st.t = 0; } }, { range: 'w', label: '角周波数 $\\omega$', min: 0.5, max: 3, step: 0.5, d: 1, on: st => { st.t = 0; } }],
      step(st, dt) { st.t += dt * 0.8; if (st.t > 4 * Math.PI) st.t = 0; },
      draw(cv, st) { drawTwo(cv, st); },
      readout: st => { const th = st.w * st.t; return st.op === 'sum' ? `$\\omega t$ ＝ ${Math.round(th * 180 / Math.PI) % 360}°　和 ＝ $2\\cos\\omega t$ ＝ ${A.num(2 * Math.cos(th), 3)}（たての成分は0）` : `$\\omega t$ ＝ ${Math.round(th * 180 / Math.PI) % 360}°　差 ＝ $2j\\sin\\omega t$ ＝ ${A.num(2 * Math.sin(th), 3)}$j$（横の成分は0）`; }
    },
    {
      key: 'hokei', label: '② 矢印をつないで方形波',
      lead: '方形波の $c_n$ をかけた回る矢印を、$n=1,\\ -1,\\ 3,\\ -3,\\ \\ldots$ の順に先から先へつなぎます。いちばん先の点が、方形波をえがきます。',
      note: '$c_n=\\frac{2}{jn\\pi}$（奇数番）。$n$ と $-n$ の矢印は共役の組なので、和はいつも横の軸の上（実数）です。両側スペクトルの棒の高さ $|c_n|=\\frac{2}{|n|\\pi}$ は、振幅 $\\frac{4}{n\\pi}$ の半分で、左回りと右回りの2本が半分ずつ受けもっています。',
      miss: '両側スペクトルの高さを振幅と読むと、半分になってしまいます。振幅 ＝ $2|c_n|=|c_n|+|c_{-n}|$ です。',
      legend: [['左回り（$n>0$）の矢印', { color: 'a' }], ['右回り（$n<0$）の矢印', { color: 'b', style: 'dash' }], ['先の点がえがく波', { color: 'd' }], ['高さ1の方形波', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'N', label: 'つなぐ組の数', min: 1, max: 8, step: 1, d: 0 }],
      step(st, dt) { st.t += dt * 0.6; if (st.t > 2 * Math.PI) st.t -= 2 * Math.PI; },
      draw(cv, st) { drawChain(cv, st); },
      readout: st => { let s = 0; for (let k = 0; k < st.N; k++) { const n = 2 * k + 1; s += 4 / (n * Math.PI) * Math.sin(n * st.t); } return `$n=\\pm1$〜$\\pm${2 * st.N - 1}$ の ${2 * st.N} 本　先の点 ＝ ${A.num(s, 3)}（虚部 0）　$c_{\\pm1}=\\mp0.6366j$、$c_{\\pm3}=\\mp0.2122j$`; }
    }
  ]
});

// e の右上に指数を書く（キャンバスの字はルビも上つきもないので、自分で組む）
function eExp(cv, X, Y, base, ex, col) {
  const g = cv.g; g.font = '17px "Times New Roman",serif'; const w1 = g.measureText(base).width; g.font = '14px "Times New Roman",serif'; const w2 = g.measureText(ex).width;
  const x0 = X - (w1 + w2) / 2;
  cv.text(base, x0, Y, { size: 17, math: true, italic: true, color: col, bg: true });
  cv.text(ex, x0 + w1 + 1, Y - 8, { size: 14, math: true, italic: true, color: col });
}
function drawTwo(cv, st) {
  const th = st.w * st.t, sum = st.op === 'sum';
  const c = cv.view({ x0: -2.4, x1: 2.4, y0: -2.4, y1: 2.4, box: [10, 14, 330, 330], equal: true });
  c.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: '実部', yl: '虚部' });
  c.circle(0, 0, 1, { color: 'sub', width: 1, style: 'dot' });
  const p = ej(th), q = ej(-th), s = sum ? [p[0] + q[0], 0] : [0, p[1] - q[1]];
  c.arrow(0, 0, p[0], p[1], { color: 'a', width: 3 });
  c.arrow(0, 0, sum ? q[0] : -q[0], sum ? q[1] : -q[1], { color: 'b', width: 3, style: 'dash' });
  c.line([[p[0], p[1]], [s[0], s[1]]], { color: 'sub', width: 1, style: 'dot' });
  c.arrow(0, 0, s[0], s[1], { color: 'd', width: 4.5 });
  eExp(cv, c.X((sum ? q[0] : -q[0]) * 1.35), c.Y((sum ? q[1] : -q[1]) * 1.35), sum ? 'e' : '−e', '−jωt', 'b');
  eExp(cv, c.X(p[0] * 1.35), c.Y(p[1] * 1.35), 'e', 'jωt', 'a');
  // 右上：波
  const g = cv.view({ x0: 0, x1: 4 * Math.PI, y0: -2.4, y1: 2.4, box: [400, 14, 460, 250] });
  g.axes({ xt: [Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI], yt: [-2, -1, 1, 2], xfmt: x => A.pi(x), xl: 't' });
  const f = sum ? (t => 2 * Math.cos(st.w * t)) : (t => 2 * Math.sin(st.w * t));
  g.plot(f, { x0: 0, x1: 4 * Math.PI, color: 'd', width: 1, alpha: 0.3 });
  g.plot(f, { x0: 0, x1: st.t, color: 'd', width: 3 });
  g.dot(st.t, f(st.t), { color: 'd', r: 6 });
  cv.text(sum ? '和の横の成分 2cos ωt' : '差のたての成分 2 sin ωt（j をのぞく）', 410, 28, { size: 15, color: 'd' });
  // 右下：スペクトル（かける数の棒）
  const s2 = cv.view({ x0: -3.6, x1: 3.6, y0: 0, y1: 0.75, box: [400, 300, 460, 110] });
  s2.line([[-3.6, 0], [3.6, 0]], { color: 'sub', width: 1.5 });
  for (const [x, col, lab] of [[st.w, 'a', sum ? '½' : '−j/2'], [-st.w, 'b', sum ? '½' : 'j/2']]) {
    s2.line([[x, 0], [x, 0.5]], { color: col, width: 4, style: col === 'b' ? 'dash' : 'solid' }); s2.dot(x, 0.5, { color: col, r: 5, shape: col === 'b' ? 'square' : 'circle' });
    s2.text(lab, x, 0.66, { align: 'center', size: 15, bold: true }); s2.text(x > 0 ? 'ω' : '−ω', x, -0.17, { align: 'center', size: 14, color: 'sub' });
  }
  s2.text('0', 0, -0.17, { align: 'center', size: 14, color: 'sub' });
  cv.text((sum ? 'cos ωt' : 'sin ωt') + ' のスペクトル（かける数）', 410, 290, { size: 15, color: 'sub' });
  cv.text('負の周波数＝右回り', 860, 290, { size: 14, color: 'b', align: 'right' });
}

function drawChain(cv, st) {
  const t = st.t, c = cv.view({ x0: -1.5, x1: 1.5, y0: -1.5, y1: 1.5, box: [10, 14, 420, 410], equal: true });
  c.axes({ xt: [-1, 1], yt: [-1, 1], xl: '実部', yl: '虚部' });
  let z = [0, 0];
  for (let k = 0; k < st.N; k++) {
    const n = 2 * k + 1;
    for (const m of [n, -n]) {
      const v = cmul(cn(m), ej(m * t)), z2 = [z[0] + v[0], z[1] + v[1]], r = Math.hypot(...v);
      if (k < 3) c.circle(z[0], z[1], r, { color: 'grid', width: 1 });
      c.arrow(z[0], z[1], z2[0], z2[1], { color: m > 0 ? 'a' : 'b', width: k === 0 ? 3 : 2, style: m > 0 ? 'solid' : 'dash', head: k === 0 ? 12 : 8 });
      z = z2;
    }
  }
  c.dot(z[0], z[1], { color: 'd', r: 7 });
  c.line([[-1, 0], [1, 0]], { color: 'd', width: 1, alpha: 0.4 });
  // 右上：先の点の値（たて）を時刻ごとに
  const g = cv.view({ x0: 0, x1: 2 * Math.PI, y0: -1.5, y1: 1.5, box: [470, 14, 390, 230] });
  g.axes({ xt: [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI], yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't' });
  g.line([[0, 1], [Math.PI, 1], [Math.PI, -1], [2 * Math.PI, -1]], { color: 'sub', style: 'dot', width: 2 });
  const S = u => { let s = 0; for (let k = 0; k < st.N; k++) { const n = 2 * k + 1; s += 4 / (n * Math.PI) * Math.sin(n * u); } return s; };
  g.plot(S, { x0: 0, x1: 2 * Math.PI, color: 'd', width: 1, alpha: 0.3, n: 500 });
  g.plot(S, { x0: 0, x1: t, color: 'd', width: 3, n: 500 });
  g.dot(t, S(t), { color: 'd', r: 6 });
  cv.text('先の点の実部（たてにかいた）', 480, 28, { size: 15, color: 'sub' });
  // 右下：両側スペクトル |c_n|
  const s = cv.view({ x0: -16, x1: 16, y0: 0, y1: 0.8, box: [470, 290, 390, 110] });
  s.line([[-16, 0], [16, 0]], { color: 'sub', width: 1.5 });
  for (let n = -15; n <= 15; n += 2) {
    const h = 2 / (Math.abs(n) * Math.PI), on = (Math.abs(n) + 1) / 2 <= st.N;
    s.line([[n, 0], [n, h]], { color: on ? (n > 0 ? 'a' : 'b') : 'line', width: 3, style: n > 0 ? 'solid' : 'dash' });
    s.dot(n, h, { color: on ? (n > 0 ? 'a' : 'b') : 'line', r: 4, shape: n > 0 ? 'circle' : 'square' });
  }
  for (const n of [-15, -9, -3, 3, 9, 15]) s.text(String(n).replace('-', '−'), n, -0.16, { align: 'center', size: 14, color: 'sub' });
  s.text('0.637', 1.4, 0.7, { size: 14 });
  cv.text('両側スペクトル |cₙ|', 480, 278, { size: 15, color: 'sub' });
}
