// @id m2-04
// @title 《投|な》げたボールの《通|とお》り《道|みち》：かげと《放物線|ほうぶつせん》
// @vol 数学3
// @from 数学 3-9⑧（ch3-09:595・635）・3-9⑥の注意（ch3-09:543 付近）・4-9⑤（ch4-09:362）／4-11④、力-1 でも使う
'use strict';
// 本の数：机から 2 m/s で飛び出す。横 x=2t、下がった長さ y=5t²（0.1 秒ごと：横 0.2・0.4・0.6・0.8 m、下 0.05・0.20・0.45・0.80 m）
//          真上に 20 m/s で投げ上げ：y=20t−5t²（2 秒後に 20 m）。噴水：速さ 10 m/s、届く距離 x=10 sin2θ（m）
A.item({
  id: 'm2-04', title: '《投|な》げたボールの《通|とお》り《道|みち》：かげと《放物線|ほうぶつせん》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-9⑧「《横|よこ》は《比例|ひれい》、たては2《乗|じょう》に《比例|ひれい》」・3-9⑥の《注意|ちゅうい》、《第|だい》4《巻|かん》 4-9⑤の《図|ず》から（4-11、《物理|ぶつり》 《力|ちから》-1 でも《使|つか》う）',
  W: 880, H: 440,
  state: { t: 0, mode: 'yt', th: 45 },
  scenes: [
    {
      key: 'kage', label: '① 《上|うえ》と《左|ひだり》のかげ',
      lead: '《机|つくえ》から《飛|と》び《出|だ》したボールの《位置|いち》を、《真上|まうえ》と《真横|まよこ》から《見|み》た「かげ」に《分|わ》けます。▶ を《押|お》すと、0.1《秒|びょう》ごとの《位置|いち》がのこります。',
      note: '《上|うえ》のかげは、《同|おな》じ《間隔|かんかく》でならびます（《横|よこ》は**《比例|ひれい》**：$x=2t$）。《左|ひだり》のかげは、0.05、0.2、0.45、0.8 と、《間隔|かんかく》が1、3、5、7 の《割合|わりあい》で《広|ひろ》がります（たては**2《乗|じょう》に《比例|ひれい》**：$y=5t^2$）。2つを《合|あ》わせると、《通|とお》り《道|みち》は《放物線|ほうぶつせん》 $y=1.25x^2$ になります。',
      legend: [['ボールの《通|とお》り《道|みち》', { color: 'a', style: 'dash' }], ['《上|うえ》のかげ（《横|よこ》の《位置|いち》）', { color: 'c', shape: 'circle' }], ['《左|ひだり》のかげ（《下|さ》がった《長|なが》さ）', { color: 'b', shape: 'square', style: 'dot' }]],
      controls: [{ range: 't', label: '《時間|じかん》 $t$', min: 0, max: 0.4, step: 0.005, fmt: v => A.num(v, 2) + ' 《秒|びょう》' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(0.4, st.t + dt * 0.1); if (st.t >= 0.4) return false; },
      draw(cv, st) { drawKage(cv, st); },
      readout: st => `$t$＝${A.num(st.t, 2)} 《秒|びょう》　　《横|よこ》 $x=2t$＝**${A.num(2 * st.t, 3)} m**　　《下|さ》がった《長|なが》さ $y=5t^2$＝**${A.num(5 * st.t * st.t, 3)} m**`
    },
    {
      key: 'yt', label: '② グラフと《通|とお》り《道|みち》',
      lead: 'ボールを《真上|まうえ》に 20 m/s で《投|な》げ《上|あ》げます。$y$-$t$ グラフ（《横軸|よこじく》が《時刻|じこく》）と、ボールの《本当|ほんとう》の《通|とお》り《道|みち》をくらべましょう。',
      miss: '《山|やま》の《形|かたち》のグラフは、ボールの《通|とお》り《道|みち》ではありません。《真上|まうえ》に《投|な》げたボールは、まっすぐ《上|あ》がって、まっすぐ《下|お》りてきます。グラフが《山|やま》の《形|かたち》なのは、**《横軸|よこじく》が「《時刻|じこく》」**だからです。',
      note: '$y=20t-5t^2=-5(t-2)^2+20$。《頂点|ちょうてん》 $(2,\\ 20)$ なので、2《秒後|びょうご》にいちばん《高|たか》い 20 m に《届|とど》きます。',
      legend: [['ボールの《高|たか》さ', { color: 'b', shape: 'circle', noline: true }], ['$y$-$t$ グラフ', { color: 'a' }], ['《本当|ほんとう》の《通|とお》り《道|みち》（たての《線|せん》）', { color: 'c', style: 'dash' }]],
      controls: [{ range: 't', label: '《時刻|じこく》 $t$', min: 0, max: 4, step: 0.02, fmt: v => A.num(v, 2) + ' 《秒|びょう》' }, { seg: 'mode', label: '《右|みぎ》の《図|ず》', options: [['yt', '$y$-$t$ グラフ'], ['path', '《通|とお》り《道|みち》']] }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(4, st.t + dt * 0.8); if (st.t >= 4) return false; },
      draw(cv, st) { drawUp(cv, st); },
      readout: st => `$t$＝${A.num(st.t, 2)} 《秒|びょう》　　《高|たか》さ $y=20t-5t^2$＝**${A.num(20 * st.t - 5 * st.t * st.t, 1)} m**`
    },
    {
      key: 'funsui', label: '③ 《噴水|ふんすい》の《角度|かくど》（《第|だい》4《巻|かん》）',
      lead: '《噴水|ふんすい》の《水|みず》を、《速|はや》さ 10 m/s で、《角度|かくど》 $\\theta$ をつけて《出|だ》します。どの《角度|かくど》でいちばん《遠|とお》くへ《届|とど》くでしょう。',
      note: '《届|とど》く《距離|きょり》は $x=\\dfrac{v^2\\sin2\\theta}{10}=10\\sin2\\theta$（m）。$\\sin2\\theta$ がいちばん《大|おお》きい1になるのは $2\\theta=90°$、つまり $\\theta=45°$ のときです。30° と 60°（15° と 75°）の《届|とど》く《距離|きょり》は《同|おな》じです。《空気|くうき》の《抵抗|ていこう》は《考|かんが》えません。',
      legend: [['いまの《角度|かくど》の《通|とお》り《道|みち》', { color: 'a' }], ['30°', { color: 'c', style: 'dash' }], ['45°', { color: 'sub', style: 'dot' }], ['60°', { color: 'b', style: 'dashdot' }]],
      controls: [{ range: 'th', label: '《角度|かくど》 $\\theta$', min: 5, max: 85, step: 1, fmt: v => v + '°' }],
      init(st) { st.th = 15; st.t = 0; },
      step(st, dt) { st.t += dt; st.th = Math.min(75, st.th + dt * 12); if (st.th >= 75) { st.th = 75; return false; } },
      draw(cv, st) { drawFun(cv, st); },
      readout: st => `$\\theta$＝${Math.round(st.th)}°　　$\\sin2\\theta$＝${A.num(Math.sin(2 * st.th * Math.PI / 180), 3)}　　《届|とど》く《距離|きょり》＝**${A.num(10 * Math.sin(2 * st.th * Math.PI / 180), 2)} m**`
    }
  ]
});

function ball(cv, x, y, r, col, o = {}) { cv.circle(x, y, r, { fill: col, alpha: o.alpha == null ? 0.9 : o.alpha, color: 'ink', width: 1 }); }

function drawKage(cv, st) {
  // 1 m を 400 px。下を＋にした「下がった長さ」は、画面では下へ
  const v = cv.view({ x0: -0.32, x1: 1.55, y0: -0.92, y1: 0.18, box: [10, 10, 860, 410], equal: true });
  // 机
  v.poly([[-0.3, 0], [0, 0], [0, -0.92], [-0.3, -0.92]], { fill: 'sub', alpha: 0.18, color: 'sub', width: 1.5 });
  cv.text('つくえ', v.X(-0.15), v.Y(-0.5), { align: 'center', size: 15, color: 'sub' });
  // 上のかげの線と左のかげの線
  const yTop = 0.1, xLeft = -0.06;
  v.line([[-0.02, yTop], [0.9, yTop]], { color: 'c', width: 2 });
  v.line([[xLeft, 0.03], [xLeft, -0.88]], { color: 'b', style: 'dot', width: 2.5 });
  v.param(t => 2 * t, t => -5 * t * t, 0, 0.42, { color: 'a', style: 'dash', width: 2 });
  const T = st.t, n = Math.floor(T / 0.1 + 1e-9);
  for (let k = 0; k <= n; k++) {
    const t = k * 0.1, x = 2 * t, y = 5 * t * t;
    v.line([[x, yTop], [x, -y]], { color: 'grid', width: 1.5 });
    v.line([[xLeft, -y], [x, -y]], { color: 'grid', width: 1.5 });
    ball(cv, v.X(x), v.Y(-y), 9, 'a', { alpha: 0.35 });
    v.dot(x, yTop, { color: 'c', r: 6 });
    v.dot(xLeft, -y, { color: 'b', shape: 'square', r: 6 });
    if (k) {
      v.text(A.num(x, 1), x, yTop + 0.045, { align: 'center', size: 15, color: 'c' });
      v.text(A.num(y, 2), xLeft - 0.03, -y, { align: 'right', size: 15, color: 'b' });
    }
  }
  // いまのボール
  const x = 2 * T, y = 5 * T * T;
  v.line([[x, yTop], [x, -y]], { color: 'c', style: 'dash', width: 1.5 });
  v.line([[xLeft, -y], [x, -y]], { color: 'b', style: 'dot', width: 1.5 });
  ball(cv, v.X(x), v.Y(-y), 11, 'a');
  v.dot(x, yTop, { color: 'c', r: 7 }); v.dot(xLeft, -y, { color: 'b', shape: 'square', r: 7 });
  // 説明
  cv.text('うえの かげ：おなじ あいだ', v.X(0.95), v.Y(yTop), { size: 15, color: 'c', bold: true });
  cv.text('（ひれい）', v.X(0.95), v.Y(yTop) + 22, { size: 15, color: 'c' });
  if (n >= 2) {
    cv.text('ひだりの かげ：', v.X(0.95), v.Y(-0.45), { size: 15, color: 'b', bold: true });
    cv.text('あいだが 1、3、5、7 の', v.X(0.95), v.Y(-0.45) + 22, { size: 15, color: 'b' });
    cv.text('わりあいで ひろがる（2じょうに ひれい）', v.X(0.95), v.Y(-0.45) + 44, { size: 15, color: 'b' });
  }
  cv.text('（m）', v.X(0.9), v.Y(yTop) - 16, { size: 14, color: 'sub' });
}

function drawUp(cv, st) {
  const t = st.t, y = 20 * t - 5 * t * t;
  // 左：ボールの動き（たての線の上）
  const L = cv.view({ x0: -1, x1: 1, y0: -1, y1: 24, box: [20, 20, 150, 390] });
  L.line([[0, 0], [0, 20]], { color: 'c', style: 'dash', width: 2 });
  for (const m of [5, 10, 15, 20]) { L.line([[-0.15, m], [0.15, m]], { color: 'sub', width: 1.5 }); L.text(String(m), -0.25, m, { align: 'right', size: 14, color: 'sub' }); }
  L.line([[-0.9, 0], [0.9, 0]], { color: 'ink', width: 2 });
  ball(cv, L.X(0), L.Y(y), 11, 'b');
  cv.text('ボール', L.X(0), 418, { align: 'center', size: 15, color: 'sub' });
  cv.text('（m）', L.X(-0.6), L.Y(23), { size: 14, color: 'sub' });
  // 右：y-t グラフ または 通り道
  if (st.mode === 'yt') {
    const g = cv.view({ x0: 0, x1: 4.6, y0: 0, y1: 24, box: [260, 20, 580, 370] });
    g.axes({ xt: [1, 2, 3, 4], yt: [5, 10, 15, 20], xl: 't（びょう）', yl: 'y（m）' });
    g.plot(s => 20 * s - 5 * s * s, { x0: 0, x1: 4, color: 'a', width: 1.5, alpha: 0.3 });
    g.plot(s => 20 * s - 5 * s * s, { x0: 0, x1: t, color: 'a', width: 3.5 });
    g.dot(t, y, { color: 'b', r: 7 });
    cv.line([[L.X(0) + 14, L.Y(y)], [g.X(t), g.Y(y)]], { color: 'sub', style: 'dot', width: 1.2 });
    if (t >= 2) { g.dot(2, 20, { color: 'ink', shape: 'diamond', r: 6 }); g.text('ちょうてん (2, 20)', 2.15, 21.8, { size: 15, bg: true }); }
    cv.text('よこじくは「じこく」', 840, 36, { align: 'right', size: 15, color: 'a', bold: true });
  } else {
    const g = cv.view({ x0: -3, x1: 3, y0: 0, y1: 24, box: [260, 20, 580, 370] });
    g.axes({ xt: [-2, -1, 1, 2], yt: [5, 10, 15, 20], xl: 'よこ（m）', yl: 'たかさ（m）', ay: 0 });
    g.line([[0, 0], [0, Math.max(y, 20 * Math.min(t, 2) - 5 * Math.min(t, 2) ** 2)]], { color: 'c', style: 'dash', width: 3.5 });
    ball(cv, g.X(0), g.Y(y), 11, 'b');
    cv.line([[L.X(0) + 14, L.Y(y)], [g.X(0) - 12, g.Y(y)]], { color: 'sub', style: 'dot', width: 1.2 });
    cv.text('まっすぐ あがって、まっすぐ おりる', 840, 36, { align: 'right', size: 15, color: 'c', bold: true });
  }
}

function drawFun(cv, st) {
  const v = cv.view({ x0: -0.6, x1: 11.2, y0: -0.6, y1: 5.2, box: [30, 20, 820, 390], equal: true });
  v.poly([[-0.6, 0], [11.2, 0], [11.2, -0.6], [-0.6, -0.6]], { fill: 'a', alpha: 0.12 });
  v.line([[-0.6, 0], [11.2, 0]], { color: 'a', width: 1.5 });
  for (let m = 0; m <= 10; m += 1) { v.line([[m, -0.08], [m, 0.08]], { color: 'sub', width: 1.2 }); if (m % 2 === 0 || m === 5) v.text(String(m), m, -0.35, { align: 'center', size: 14, color: 'sub' }); }
  v.text('m', 10.9, -0.35, { size: 14, color: 'sub' });
  const path = (deg, o) => { const a = deg * Math.PI / 180, R = 10 * Math.sin(2 * a); v.param(x => x, x => x * Math.tan(a) - 5 * x * x / (100 * Math.cos(a) ** 2), 0, R, o); return R; };
  path(30, { color: 'c', style: 'dash', width: 2 });
  path(45, { color: 'sub', style: 'dot', width: 2.5 });
  path(60, { color: 'b', style: 'dashdot', width: 2 });
  const R = path(st.th, { color: 'a', width: 4 });
  // 水の玉（時間で流れる）
  const a = st.th * Math.PI / 180, T = 2 * 10 * Math.sin(a) / 10;
  for (let k = 0; k < 8; k++) { const s = ((st.t || 0) * 0.5 + k / 8) % 1 * T, x = 10 * Math.cos(a) * s, y = 10 * Math.sin(a) * s - 5 * s * s; v.dot(x, y, { color: 'a', r: 4 }); }
  v.poly([[-0.25, 0], [0.25, 0], [0.25, 0.25], [-0.25, 0.25]], { fill: 'sub', alpha: 0.8 });
  v.dot(R, 0, { color: 'a', shape: 'diamond', r: 7 });
  v.text(A.num(R, 2) + ' m', R, 0.45, { align: 'center', size: 16, color: 'a', bold: true, bg: true });
  v.text('30°', 5.8, 1.15 + 0.4, { align: 'center', size: 15, color: 'c' });
  v.text('45°', 5, 2.5 + 0.4, { align: 'center', size: 15, color: 'sub' });
  v.text('60°', 4.33, 3.75 + 0.4, { align: 'center', size: 15, color: 'b' });
}
