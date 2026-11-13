// @id p2-06
// @title 1点のゆれ：y-x と y-t
// @vol 物理3
// @from 物理 波-5 ②③（p3-05 波の要素・進む正弦波と媒質の動き・パルス）／波-6〜8・電-13・電-15、数学 4-9・6-10 でも使う
'use strict';
// 本の図の数：y = 0.02 sin(10πt − 5πx)〔m〕（A=0.02 m、λ=0.4 m、f=5 Hz、c=2 m/s）。
// パルスは本の図と同じ形（0〜0.3 m で 0.1 m まで上がり、0.4 m で 0 にもどる）、c=2 m/s。
// 動きは速いので、①②は10分の1、③は4分の1の速さで見せる（時刻の数は本当の値）。
const C = 2, G1 = [60, 25, 780, 170], G2 = [60, 255, 780, 160];
A.item({
  id: 'p2-06', title: '1点のゆれ：y-x と y-t',
  from: '物理 第3巻 波-5 ②③ の図「ある瞬間の形と1つの場所のゆれ」「右へ進む正弦波」「右へ進むパルス」から（波-6〜8・電-13・電-15 でも使う）',
  W: 880, H: 440,
  state: { t: 0, xp: 0.2, A: 0.02, f: 5, xq: 1.5 },
  scenes: [
    {
      key: 'yt', label: '① 1点を選ぶ',
      lead: '上は波のある瞬間の形（横の軸は場所 $x$）、下は選んだ点 P のゆれ（横の軸は時刻 $t$）です。P はドラッグで動かせます。',
      note: '場所 $x$ の点は、波源と同じ単振動を、角が $kx$ だけおくれて繰り返します（$y=A\\sin(\\omega t-kx)$）。上の山と山の間は波長 $\\lambda$（0.4 m）、下の山と山の間は周期 $T$（0.2 s）です。形は同じ sin でも、横の軸が違います。',
      legend: [['いまの形（$y$-$x$）', { color: 'a' }], ['少しあとの形', { color: 'a', style: 'dash' }], ['P のゆれ（$y$-$t$）', { color: 'b' }], ['P の速度', { color: 'c', style: 'dot' }]],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.1; if (st.t > 0.6) st.t = 0; },
      drag: dragP('xp', 0, 1.2),
      draw(cv, st) { sine(cv, st, false); },
      readout: st => { const v = vel(st, st.xp, st.t); return `P：$x$ ＝ ${A.num(st.xp, 2)} m　　$y$ ＝ ${A.num(100 * st.A * Math.sin(ph(st, st.xp, st.t)), 2)} cm　　速度 ${A.num(v, 2)} m/s（${Math.abs(v) < 0.02 ? '止まる' : v > 0 ? '上へ' : '下へ'}）　　時刻 ${A.num(st.t, 3)} s`; }
    },
    {
      key: 'hayasa', label: '② 媒質の速さと波の速さ',
      lead: '振幅 $A$ と振動数 $f$ を変えて、P が上下する速さと、▼の山が進む速さを比べましょう。',
      note: '媒質の点の速さは $A\\omega\\cos(\\omega t-kx)$ で、いちばん大きいときで $A\\omega$ です。波の形が進む速さ $c=f\\lambda$ とは、まったく別の量です。振幅を2倍にすると点は2倍速く動きますが、$c$ は変わりません。振動数を2倍にすると、$c$ は変わらず、波長が半分になります。',
      miss: '「媒質の点は、波の速さ $c$ で上下に動く」のではありません。$A$=0.02 m・$f$=5 Hz なら、点の速さはいちばん大きくても $A\\omega\\approx0.63$ m/s で、$c$=2 m/s とは違います。',
      legend: [['いまの形', { color: 'a' }], ['山の位置（速さ $c$）', { color: 'c', shape: 'tri', noline: true }], ['P の速度の矢印', { color: 'b', style: 'dot' }]],
      controls: [{ range: 'A', label: '振幅 $A$〔m〕', min: 0.01, max: 0.04, step: 0.005, d: 3 }, { range: 'f', label: '振動数 $f$〔Hz〕', min: 2.5, max: 10, step: 0.5, d: 1 }],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.1; if (st.t > 0.6) st.t = 0; },
      drag: dragP('xp', 0, 1.2),
      draw(cv, st) { sine(cv, st, true); },
      readout: st => { const w = 2 * Math.PI * st.f; return `点の速さのいちばん大きい値 $A\\omega$ ＝ <b>${A.num(st.A * w, 2)} m/s</b>　　波の速さ $c$ ＝ <b>2.0 m/s</b>（変わらない）　　波長 $\\lambda=c/f$ ＝ ${A.num(2 / st.f, 2)} m`; }
    },
    {
      key: 'pulse', label: '③ パルスでは裏返し',
      lead: '形が左右非対称なパルス（1回だけのゆれ）が、速さ 2 m/s で右へ進みます。点 Q（ドラッグで動かせる）のゆれを $y$-$t$ グラフにかきます。',
      note: 'パルスの前のはし（右側の急な所）が先に Q に届くので、Q の $y$-$t$ グラフは、$y$-$x$ グラフを**左右に裏返した**形になります。$y=y_0(x-ct)$ で、場所 $x$ を止めて時刻 $t$ を増やすと、$y_0$ の中身は減っていくからです。',
      miss: '「ある瞬間の波の形（$y$-$x$）と、1つの点のゆれ（$y$-$t$）は同じ形」ではありません。横の軸が違い、パルスでは裏返しになります。',
      legend: [['いまの形（$y$-$x$）', { color: 'a' }], ['$t=0$ の形', { color: 'sub', style: 'dot' }], ['Q のゆれ（$y$-$t$）', { color: 'b' }]],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.25; if (st.t > 1.0) st.t = 0; },
      drag: dragP('xq', 0.5, 2.2),
      draw(cv, st) { pulse(cv, st); },
      readout: st => `Q：$x$ ＝ ${A.num(st.xq, 2)} m　　前のはしが届く時刻 ${A.num((st.xq - 0.4) / 2, 3)} s、後ろのはしが通りすぎる時刻 ${A.num(st.xq / 2, 3)} s　　いま ${A.num(st.t, 3)} s`
    }
  ]
});

function ph(st, x, t) { const w = 2 * Math.PI * st.f, k = w / C; return w * t - k * x; }
function vel(st, x, t) { return st.A * 2 * Math.PI * st.f * Math.cos(ph(st, x, t)); }
function dragP(key, lo, hi) {
  return {
    hit(st, x, y) { const xs = lo === 0 ? 1.25 : 2.35, X = G1[0] + (st[key] - 0) / xs * G1[2]; return Math.abs(x - X) < 24 && y < G1[1] + G1[3] + 10 ? 1 : null; },
    move(st, x) { const xs = lo === 0 ? 1.25 : 2.35; st[key] = A.clamp(Math.round((x - G1[0]) / G1[2] * xs * 100) / 100, lo, hi); }
  };
}

function sine(cv, st, speedMode) {
  const yl = 4.6;
  const g = cv.view({ x0: 0, x1: 1.25, y0: -yl, y1: yl, box: G1 });
  g.axes({ xt: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2], yt: [-4, -2, 2, 4], xl: 'x〔m〕', yl: 'y〔cm〕', xfmt: v => A.num(v, 1) });
  const y = (x, t) => 100 * st.A * Math.sin(ph(st, x, t));
  if (!speedMode) g.plot(x => y(x, st.t + 0.02), { color: 'a', style: 'dash', width: 1.5 });
  g.plot(x => y(x, st.t), { color: 'a', width: 3, n: 600 });
  const yp = y(st.xp, st.t), v = vel(st, st.xp, st.t);
  g.line([[st.xp, -yl], [st.xp, yl]], { color: 'b', style: 'dot', width: 1 });
  g.arrow(st.xp, yp, st.xp, yp + v * 4, { color: speedMode ? 'b' : 'c', style: 'dot', width: 3 });
  g.dot(st.xp, yp, { color: 'b', shape: 'diamond', r: 8 });
  g.text('P', st.xp + 0.02, yp + 0.9, { bold: true, math: true, italic: true, size: 17, color: 'b' });
  const lam = C / st.f;
  if (speedMode) {
    // 山（位相が π/2 の所）を ▼ で
    for (let n = -3; n < 12; n++) { const x = (2 * Math.PI * st.f * st.t - Math.PI / 2 - 2 * Math.PI * n) / (2 * Math.PI * st.f / C); if (x < 0 || x > 1.25) continue; g.dot(x, 100 * st.A + 0.6, { color: 'c', shape: 'tri', r: 7 }); }
  } else {
    // 波長の寸法（最初の山から次の山）
    const x0 = ((2 * Math.PI * st.f * st.t - Math.PI / 2) / (2 * Math.PI * st.f / C)) % lam, xa = x0 < 0 ? x0 + lam : x0;
    if (xa + lam <= 1.25) { const yy = 100 * st.A + 1.2; g.arrow(xa + lam / 2, yy, xa, yy, { color: 'ink', width: 1.5, head: 8 }); g.arrow(xa + lam / 2, yy, xa + lam, yy, { color: 'ink', width: 1.5, head: 8 }); g.text('波長 λ', xa + lam / 2, yy, { align: 'center', size: 15, bg: true }); }
  }
  // 下：P の y-t
  const h = cv.view({ x0: 0, x1: 0.6, y0: -yl, y1: yl, box: G2 });
  h.axes({ xt: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], yt: [-4, -2, 2, 4], xl: 't〔s〕', yl: 'P の y〔cm〕', xfmt: v => A.num(v, 1) });
  h.plot(t => y(st.xp, t), { x0: 0, x1: st.t, color: 'b', width: 3, n: 600 });
  h.dot(st.t, yp, { color: 'b', shape: 'diamond', r: 7 });
  if (!speedMode && st.t > 0.2) {
    let t0 = ((Math.PI / 2 + 2 * Math.PI * st.f / C * st.xp) / (2 * Math.PI * st.f)) % 0.2; const yy = 100 * st.A + 1.2;
    if (t0 + 0.2 <= st.t) { h.arrow(t0 + 0.1, yy, t0, yy, { color: 'ink', width: 1.5, head: 8 }); h.arrow(t0 + 0.1, yy, t0 + 0.2, yy, { color: 'ink', width: 1.5, head: 8 }); h.text('周期 T', t0 + 0.1, yy, { align: 'center', size: 15, bg: true }); }
  }
}

// 本のパルスの形：0〜0.3 m で 0.1 m まで上がり、0.4 m で 0 にもどる
function y0(x) { return x <= 0 || x >= 0.4 ? 0 : x <= 0.3 ? 0.1 * x / 0.3 : 0.1 * (0.4 - x) / 0.1; }
function pulse(cv, st) {
  const g = cv.view({ x0: 0, x1: 2.35, y0: -0.02, y1: 0.14, box: G1 });
  g.axes({ xt: [0.5, 1, 1.5, 2], yt: [0.05, 0.1], xl: 'x〔m〕', yl: 'y〔m〕', yfmt: v => A.num(v, 2) });
  g.plot(y0, { color: 'sub', style: 'dot', width: 2, n: 700 });
  g.plot(x => y0(x - C * st.t), { color: 'a', width: 3, n: 700 });
  g.arrow(0.6, 0.12, 0.85, 0.12, { color: 'ink', width: 2 });
  g.text('c ＝ 2 m/s で右へ', 0.88, 0.12, { size: 15 });
  if (C * st.t + 0.4 < 2.1) g.text('前のはし', C * st.t + 0.42, 0.04, { size: 14, color: 'sub' });
  const yq = y0(st.xq - C * st.t);
  g.line([[st.xq, -0.02], [st.xq, 0.14]], { color: 'b', style: 'dot', width: 1 });
  g.dot(st.xq, yq, { color: 'b', shape: 'diamond', r: 8 });
  g.text('Q', st.xq + 0.03, yq + 0.018, { bold: true, math: true, italic: true, size: 17, color: 'b' });
  const h = cv.view({ x0: 0, x1: 1.0, y0: -0.02, y1: 0.14, box: G2 });
  h.axes({ xt: [0.2, 0.4, 0.6, 0.8, 1.0], yt: [0.05, 0.1], xl: 't〔s〕', yl: 'Q の y〔m〕', xfmt: v => A.num(v, 1), yfmt: v => A.num(v, 2) });
  h.plot(t => y0(st.xq - C * t), { x0: 0, x1: st.t, color: 'b', width: 3, n: 700 });
  h.dot(st.t, yq, { color: 'b', shape: 'diamond', r: 7 });
  const ta = (st.xq - 0.4) / C;
  if (st.t > ta + 0.02 && ta > 0) h.text('前のはしが先に届く', ta - 0.01, 0.115, { size: 14, color: 'b', align: 'right', bg: true });
}
