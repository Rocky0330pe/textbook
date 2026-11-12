// @id m4-24
// @title とる回数が少ないと化ける：エイリアシング
// @vol 数学9
// @from 数学 9-4 図11・⑭（ch9-04:860）／物理 波-11・波-10 でも使う
'use strict';
// サンプリング周波数 fs で f〔Hz〕の cos をとると、fs の整数倍だけずらした周波数と区別できない。見かけの周波数は 0〜fs/2 に折り返される
function alias(f, fs) { const r = f - Math.round(f / fs) * fs; return Math.abs(r); }
// 車輪：スポーク8本（45° ごとに同じ形）、1秒に24コマ。1コマで回る角を −22.5°〜22.5° に折り返したものが、見かけの動き
function seen(rps) { const d = rps * 360 / 24; let r = ((d % 45) + 45) % 45; if (r > 22.5) r -= 45; return r; }

A.item({
  id: 'm4-24', title: 'とる回数が少ないと化ける：エイリアシング',
  from: '数学 第9巻 9-4 図11・⑭ から（物理 波-11・波-10 でも使う）',
  W: 880, H: 440,
  state: { f: 7000, fs: 8000, rps: 2.75, tt: 0, play: 0 },
  scenes: [
    {
      key: 'sample', label: '① 同じ点を通る2つの音',
      lead: '1秒に $f_{\\mathrm s}$ 回とった点（赤）から、もとの音の周波数がわかるでしょうか。▶ で、音の周波数を上げていきます。',
      note: '1秒に8000回とると、7000 Hz の音と 1000 Hz の音は、とった点がまったく同じです（$8000-7000=1000$）。$f_{\\mathrm s}/2$ をこえると、周波数を上げても、見かけの周波数は下がっていきます（折り返し）。いちばん高い周波数の2倍より大きい $f_{\\mathrm s}$ でとれば、取りちがえはおきません（サンプリング定理）。',
      miss: '$f_{\\mathrm s}=8000$ Hz のとき、7000 Hz の音は FFT でも 7000 Hz に出る、ではありません。1000 Hz に化けて出ます。とる前に4000 Hz より上を取り除きます。',
      legend: [['もとの音 $\\cos2\\pi ft$', { color: 'sub', style: 'solid' }], ['とった点', { color: 'b', shape: 'square', noline: true }], ['同じ点を通るいちばん低い音', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'f', label: '音の周波数 $f$〔Hz〕', min: 0, max: 16000, step: 100, d: 0 }, { range: 'fs', label: 'とる回数 $f_{\\mathrm s}$〔回/秒〕', min: 2000, max: 16000, step: 500, d: 0 }],
      init: st => { st.f = 7000; },
      step(st, dt) { st.f = Math.min(16000, st.f + dt * 900); if (st.f >= 16000) return false; },
      draw(cv, st) { drawSample(cv, st); },
      readout: st => `$f$ ＝ ${A.num(st.f, 0)} Hz、$f_{\\mathrm s}$ ＝ ${A.num(st.fs, 0)} 回/秒（$f_{\\mathrm s}/2$ ＝ ${A.num(st.fs / 2, 0)} Hz）　見かけの周波数 ＝ <b>${A.num(alias(st.f, st.fs), 0)} Hz</b>` + (st.f > st.fs / 2 ? '（化けている）' : '')
    },
    {
      key: 'sharin', label: '② 動画の車輪',
      lead: 'スポークが8本の車輪を、1秒に24コマの動画でとります。▶ で、とったコマを順に見せます。',
      note: '1秒に2.75回転なら、1コマの間に $2.75\\times360°÷24=41.25°$ 回ります。スポークは45° ごとに同じ形なので、41.25° 進むのは $41.25°-45°=-3.75°$（少しもどった）のと区別がつきません。画面では、1秒に $-3.75°\\times24=-90°$、ゆっくり**逆に**回って見えます。',
      legend: [['本当の車輪（■の印つき）', { color: 'sub', style: 'dot' }], ['動画のコマ', { color: 'a' }], ['見かけの回る速さ', { color: 'b', shape: 'circle' }]],
      controls: [{ range: 'rps', label: '1秒に回る回数', min: 0, max: 6, step: 0.05, d: 2 }],
      step(st, dt) { st.tt += dt; },
      draw(cv, st) { drawWheel(cv, st); },
      readout: st => { const d = st.rps * 360 / 24, s = seen(st.rps); return `1コマで回る角 ＝ ${A.num(d, 2)}°　見かけ ＝ ${A.num(s, 2)}°/コマ ＝ <b>${A.num(s * 24, 1)}°/秒</b>` + (s < -1e-9 ? '（逆に回って見える）' : Math.abs(s) < 1e-9 ? '（止まって見える）' : ''); }
    }
  ]
});

function drawSample(cv, st) {
  const f = st.f / 1000, fs = st.fs / 1000, fa = alias(st.f, st.fs) / 1000;   // kHz、時間は ms
  const v = cv.view({ x0: 0, x1: 1.05, y0: -1.3, y1: 1.3, box: [50, 14, 800, 200] });
  v.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [-1, 1], xl: 't（ms）', xfmt: x => A.num(x, 2) });
  v.plot(t => Math.cos(2 * Math.PI * f * t), { x0: 0, x1: 1, color: 'sub', width: 1.2, n: 1600 });
  v.plot(t => Math.cos(2 * Math.PI * fa * t), { x0: 0, x1: 1, color: 'a', style: 'dash', width: 3, n: 400 });
  for (let m = 0; m / fs <= 1.0001; m++) { const t = m / fs; v.dot(t, Math.cos(2 * Math.PI * f * t), { color: 'b', shape: 'square', r: 5 }); }
  // 下：本当の周波数と、見かけの周波数（折り返しのグラフ）
  const g = cv.view({ x0: 0, x1: 16.5, y0: 0, y1: 8.5, box: [60, 262, 780, 150] });
  g.axes({ xt: [2, 4, 6, 8, 10, 12, 14, 16], yt: [2, 4, 6, 8], xl: 'もとの周波数（kHz）', yl: '見かけ（kHz）' });
  g.plot(x => alias(x * 1000, st.fs) / 1000, { x0: 0, x1: 16.5, color: 'a', width: 2.5, n: 800 });
  g.line([[0, fs / 2], [16.5, fs / 2]], { color: 'd', style: 'dot', width: 2 });
  g.text('fs/2', 16.4, fs / 2 + 0.6, { align: 'right', size: 15, color: 'd', bold: true });
  for (let k = 1; k * fs <= 16.5; k++) g.line([[k * fs, 0], [k * fs, 0.5]], { color: 'd', width: 2 });
  g.dot(f, fa, { color: 'b', r: 7 });
  g.line([[f, 0], [f, fa]], { color: 'b', width: 1, style: 'dot' });
}

function wheel(cv, X, Y, R, ang, o) {
  cv.circle(X, Y, R, { color: o.color, width: o.width || 3, style: o.style });
  for (let k = 0; k < 8; k++) { const a = ang + k * Math.PI / 4; cv.line([[X, Y], [X + R * Math.cos(a), Y - R * Math.sin(a)]], { color: o.color, width: (o.width || 3) - 0.5, style: o.style }); }
  if (o.mark) cv.dot(X + R * 0.8 * Math.cos(ang), Y - R * 0.8 * Math.sin(ang), { color: 'b', shape: 'square', r: 7 });
  cv.dot(X, Y, { color: o.color, r: 5 });
}
function drawWheel(cv, st) {
  const fr = Math.floor(st.tt * 24), angF = fr * st.rps * 2 * Math.PI / 24, angT = st.tt * st.rps * 2 * Math.PI;   // 左回りを正
  wheel(cv, 160, 190, 120, angT, { color: 'sub', width: 2, style: 'dot', mark: true });
  wheel(cv, 450, 190, 120, angF, { color: 'a', width: 3.5 });
  cv.text('本当の車輪', 160, 335, { align: 'center', size: 16 }); cv.text('動画のコマ（1秒に24まい）', 450, 335, { align: 'center', size: 16 });
  cv.text(`コマ ${fr} まいめ`, 450, 362, { align: 'center', size: 15, color: 'sub' });
  // 右：本当の速さと見かけの速さ（°/秒）
  const g = cv.view({ x0: 0, x1: 6.3, y0: -600, y1: 600, box: [630, 40, 230, 330] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-540, -270, 270, 540], xl: '回/秒', yl: '見かけ（°/秒）', yfmt: y => A.num(y, 0) });
  g.plot(x => Math.abs(seen(x)) > 22.3 ? NaN : seen(x) * 24, { x0: 0, x1: 6.3, color: 'b', width: 2.5, n: 900 });
  g.dot(st.rps, seen(st.rps) * 24, { color: 'b', r: 7 });
  cv.text('3回/秒ごとに止まって見える', 745, 400, { align: 'center', size: 14, color: 'sub' });
}
