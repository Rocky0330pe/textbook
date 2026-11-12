// @id m4-23
// @title 周期をのばすと線が帯に：フーリエ変換
// @vol 数学9
// @from 数学 9-4 図2・3・7（ch9-04:281・351・580）、9-13 図6（ch9-13:396）／物理 原-3・波-14 でも使う
'use strict';
// はば2（−1<t<1）・高さ1のパルスが周期 T でくり返す。Tc_n = 2 sin(nω₀)/(nω₀)（n≠0）、Tc_0 = 2（9-4②）
const env = w => Math.abs(w) < 1e-9 ? 2 : 2 * Math.sin(w) / w;
function pulseTrain(t, T) { const u = ((t + T / 2) % T + T) % T - T / 2; return Math.abs(u) < 1 ? 1 : 0; }

A.item({
  id: 'm4-23', title: '周期をのばすと線が帯に：フーリエ変換',
  from: '数学 第9巻 9-4 図2・3・7・9-13 図6 から（物理 原-3・波-14 でも使う）',
  W: 880, H: 440,
  state: { T: 4, shape: 'pulse', a: 1 },
  scenes: [
    {
      key: 'nobasu', label: '① 周期をのばす',
      lead: 'はば2のパルスが、周期 $T$ ごとにくり返します。▶ で $T$ をのばしていくと、スペクトルの棒はどうなるでしょう。',
      note: '棒の高さ $Tc_n$ は、いつも同じ曲線 $\\frac{2\\sin\\omega}{\\omega}$（点線）の上にあります。周期を2倍にすると、棒の間かく $\\omega_0=\\frac{2\\pi}{T}$ は半分になり、棒の数が2倍になります。周期を限りなく長くした先（1回だけのパルス）では、棒が曲線をすきまなくうめます。これがフーリエ変換 $F(\\omega)$ です。',
      miss: '$c_n$（1周期の平均）のままでは、$T$ を長くすると0に近づいて形が見えません（$T=4$ で $c_1=0.318$、$T=16$ で0.122）。だから $T$ をかけた「1周期の合計」で見ます。',
      legend: [['くり返すパルス', { color: 'a' }], ['棒 $Tc_n$（$\\omega=n\\omega_0$ の所）', { color: 'b', shape: 'circle' }], ['曲線 $\\frac{2\\sin\\omega}{\\omega}$', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'T', label: '周期 $T$', min: 4, max: 64, step: 1, d: 0 }],
      step(st, dt) { st.T = Math.min(64, st.T * Math.exp(dt * 0.35)); if (st.T >= 64) return false; },
      draw(cv, st) { drawNobasu(cv, st); },
      readout: st => { const w0 = 2 * Math.PI / st.T; return `$T$ ＝ ${A.num(st.T, 1)}　棒の間かく $\\omega_0$ ＝ ${A.num(w0, 3)}　$c_1$ ＝ ${A.num(env(w0) / st.T, 3)}、$Tc_1$ ＝ ${A.num(env(w0), 3)}`; }
    },
    {
      key: 'haba', label: '② 短いほど広い',
      lead: '時間の世界のはばを変えると、周波数の世界のはばはどうなるでしょう。パルスとガウスの形でくらべます。',
      note: 'はばを半分にすると、スペクトルのはばは2倍に広がり、高さ $F(0)$（グラフの面積）は半分になります。ガウスの形 $e^{-t^2/(2\\sigma^2)}$ の変換は $\\sigma\\sqrt{2\\pi}\\,e^{-\\sigma^2\\omega^2/2}$ で、時間のはば $\\sigma$ × 周波数のはば $\\frac{1}{\\sigma}$ ＝ 1 と、いつも一定です。手をたたく音（短い）は広い帯、かねの音（長い）は細い山になります。',
      miss: '$\\omega$〔rad/s〕と周波数〔Hz〕を取りちがえないこと。$\\omega=2\\pi f$ です。この図の横軸は $\\omega$ です。',
      legend: [['いまの形', { color: 'a' }], ['くらべる形（パルスはば2、$\\sigma=1$）', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'shape', label: '形', options: [['pulse', '方形パルス'], ['gauss', 'ガウスの形']] }, { range: 'a', label: 'はば（パルスは半分のはば $a$、ガウスは $\\sigma$）', min: 0.25, max: 2.5, step: 0.05, d: 2 }],
      draw(cv, st) { drawHaba(cv, st); },
      readout: st => st.shape === 'pulse'
        ? `はば $2a$ ＝ ${A.num(2 * st.a, 2)}　$F(0)$ ＝ ${A.num(2 * st.a, 2)}　はじめて0になる $\\omega$ ＝ $\\frac{\\pi}{a}$ ＝ ${A.num(Math.PI / st.a, 3)}　かけると ${A.num(2 * Math.PI, 3)}（いつも $2\\pi$）`
        : `時間のはば $\\sigma$ ＝ ${A.num(st.a, 2)}　周波数のはば $\\frac{1}{\\sigma}$ ＝ ${A.num(1 / st.a, 3)}　かけると 1　$F(0)$ ＝ $\\sigma\\sqrt{2\\pi}$ ＝ ${A.num(st.a * Math.sqrt(2 * Math.PI), 3)}`
    }
  ]
});

function drawNobasu(cv, st) {
  const T = st.T, w0 = 2 * Math.PI / T;
  const u = cv.view({ x0: -34, x1: 34, y0: -0.3, y1: 1.4, box: [30, 14, 820, 110] });
  u.axes({ xt: [-32, -16, -8, -4, 4, 8, 16, 32], yt: [1], xl: 't', grid: false });
  u.plot(t => pulseTrain(t, T), { color: 'a', width: 2.5, n: 1600 });
  const v = cv.view({ x0: -0.6, x1: 13, y0: -0.6, y1: 2.3, box: [50, 160, 800, 250] });
  v.axes({ xt: [Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI], yt: [-0.5, 1, 2], xfmt: x => A.pi(x), xl: 'ω', yl: 'Tcₙ' });
  v.plot(env, { x0: 0, x1: 13, color: 'sub', style: 'dash', width: 2, n: 500 });
  for (let n = 0; n * w0 <= 13; n++) { const w = n * w0, h = env(w); v.line([[w, 0], [w, h]], { color: 'b', width: T > 40 ? 1.5 : 3 }); v.dot(w, h, { color: 'b', r: T > 40 ? 2.5 : 4.5 }); }
  v.text('棒の間かく ω₀ ＝ 2π/T', 9, 1.9, { size: 15, color: 'b', bold: true });
}

function drawHaba(cv, st) {
  const P = st.shape === 'pulse';
  const f = P ? (t => Math.abs(t) < st.a ? 1 : 0) : (t => Math.exp(-t * t / (2 * st.a * st.a)));
  const f0 = P ? (t => Math.abs(t) < 1 ? 1 : 0) : (t => Math.exp(-t * t / 2));
  const F = P ? (w => Math.abs(w) < 1e-9 ? 2 * st.a : 2 * Math.sin(st.a * w) / w) : (w => st.a * Math.sqrt(2 * Math.PI) * Math.exp(-st.a * st.a * w * w / 2));
  const F0 = P ? (w => Math.abs(w) < 1e-9 ? 2 : 2 * Math.sin(w) / w) : (w => Math.sqrt(2 * Math.PI) * Math.exp(-w * w / 2));
  const u = cv.view({ x0: -6, x1: 6, y0: -0.25, y1: 1.35, box: [30, 40, 380, 340] });
  u.axes({ xt: [-6, -4, -2, 2, 4, 6], yt: [1], xl: 't', yl: 'f(t)' });
  u.plot(f0, { color: 'b', style: 'dash', width: 2, n: 800 });
  u.plot(f, { color: 'a', width: 3, n: 800 });
  const yM = P ? 4.4 : 6.6;
  const v = cv.view({ x0: -8, x1: 8, y0: -0.2 * yM, y1: yM, box: [470, 40, 390, 340] });
  v.axes({ xt: [-2 * Math.PI, -Math.PI, Math.PI, 2 * Math.PI], yt: P ? [1, 2, 3, 4] : [2, 4, 6], xfmt: x => A.pi(x), xl: 'ω', yl: 'F(ω)' });
  v.plot(F0, { color: 'b', style: 'dash', width: 2, n: 600 });
  v.plot(F, { color: 'a', width: 3, n: 600 });
  if (P) { const z = Math.PI / st.a; if (z < 8) { v.dot(z, 0, { color: 'a', r: 6, shape: 'diamond' }); v.dot(-z, 0, { color: 'a', r: 6, shape: 'diamond' }); } }
  else { const s = 1 / st.a; v.line([[-s, F(s)], [s, F(s)]], { color: 'a', width: 2, style: 'dot' }); u.line([[-st.a, f(st.a)], [st.a, f(st.a)]], { color: 'a', width: 2, style: 'dot' }); }
  cv.text('時間の世界', 40, 22, { size: 16, bold: true }); cv.text('周波数の世界', 480, 22, { size: 16, bold: true });
  cv.text('変換する →', 440, 400, { align: 'center', size: 15, color: 'sub' });
}
