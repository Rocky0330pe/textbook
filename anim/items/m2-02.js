// @id m2-02
// @title 《割線|かっせん》を《近|ちか》づけると《接線|せっせん》になる
// @vol 数学3
// @from 数学 3-9④（ch3-09:323 と h の表）・4-2⑥（ch4-02:553）／5-1・5-3 でも使う
'use strict';
// 落ちるボール y=5x²（x は時間〔s〕、y は落ちた距離〔m〕）。x=1 から 1+h までの変化の割合は 10+5h（本の表：h=1→15、0.5→12.5、0.1→10.5、0.01→10.05）
const f = x => 5 * x * x;
const slope = h => 10 + 5 * h;
A.item({
  id: 'm2-02', title: '《割線|かっせん》を《近|ちか》づけると《接線|せっせん》になる', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-9④「《変化|へんか》の《割合|わりあい》は、《一定|いってい》ではない」の《図|ず》と $h$ の《表|ひょう》から（《第|だい》4《巻|かん》 4-2⑥、《第|だい》5《巻|かん》 5-1・5-3 でも《使|つか》う）',
  W: 880, H: 420,
  state: { h: 1, z: 1, th: 60 },
  scenes: [
    {
      key: 'kassen', label: '① $h$ を《小|ちい》さくする',
      lead: '$y=5x^2$ の《上|うえ》の2つの《点|てん》 A（$x=1$）と P（$x=1+h$）を《結|むす》ぶ《直線|ちょくせん》の《傾|かたむ》きが、《変化|へんか》の《割合|わりあい》 $10+5h$ です。▶ を《押|お》すと、P が A に《近|ちか》づきます。',
      note: 'あいだを《短|みじか》くするほど、《変化|へんか》の《割合|わりあい》は10に《近|ちか》づいていきます。これは「ちょうど1《秒|びょう》のときの、その**《瞬間|しゅんかん》の《速|はや》さ**」が 10 m/s であることを《表|あらわ》しています。P が A に《近|ちか》づくと、2つの《点|てん》を《結|むす》ぶ《直線|ちょくせん》は、A でふれる1《本|ぽん》の《直線|ちょくせん》（《点線|てんせん》）に《近|ちか》づきます。',
      miss: '$h=0$ をそのまま《入|い》れることはできません（$x$ の《変化量|へんかりょう》 $h$ でわるから）。$h$ を0に「《近|ちか》づけて」いくと、《傾|かたむ》きは10に《近|ちか》づきます。',
      legend: [['$y=5x^2$', { color: 'a' }], ['A と P を《結|むす》ぶ《直線|ちょくせん》', { color: 'b' }], ['A でふれる《直線|ちょくせん》（《傾|かたむ》き 10）', { color: 'ink', style: 'dash' }], ['$x$ の《変化量|へんかりょう》 $h$', { color: 'd', style: 'dot' }], ['$y$ の《変化量|へんかりょう》 $10h+5h^2$', { color: 'c', style: 'dashdot' }]],
      controls: [{ range: 'h', label: '$h$', min: 0.01, max: 1, step: 0.01, d: 2 }],
      step(st, dt) { st.h = Math.max(0.01, st.h * Math.exp(-dt * 0.6)); if (st.h <= 0.0101) { st.h = 0.01; return false; } },
      drag: {
        hit(st, x, y) { const v = viewK(); const px = v.X(1 + st.h), py = v.Y(f(1 + st.h)); return A.near(x, y, px, py, 24) ? 1 : null; },
        move(st, x) { const v = viewK(); st.h = A.clamp(Math.round((v.inv(x, 0)[0] - 1) * 100) / 100, 0.01, 1); }
      },
      draw(cv, st) { drawK(cv, st); },
      readout: st => `$h$＝${A.num(st.h, 2)}　　《変化|へんか》の《割合|わりあい》（《直線|ちょくせん》の《傾|かたむ》き）＝$10+5\\times${A.num(st.h, 2)}$＝**${A.num(slope(st.h), 2)}**　m/s`
    },
    {
      key: 'zoom', label: '② 《近|ちか》づいて《見|み》る',
      lead: '《点|てん》 A（$x=1$）のまわりを、《虫|むし》めがねで《大|おお》きくしていきます。▶ を《押|お》すと、どんどん《近|ちか》づいて《見|み》ます。',
      note: '《近|ちか》づいて《見|み》るほど、《曲|ま》がっていたグラフは、A でふれる《直線|ちょくせん》（《点線|てんせん》）とほとんど《重|かさ》なって《見|み》えます。そのまっすぐな《線|せん》の《傾|かたむ》き 10 が、$x=1$ の《瞬間|しゅんかん》の《変化|へんか》の《割合|わりあい》（《瞬間|しゅんかん》の《速|はや》さ 10 m/s）です。',
      legend: [['$y=5x^2$', { color: 'a' }], ['A でふれる《直線|ちょくせん》 $y=10x-5$', { color: 'ink', style: 'dash' }]],
      controls: [{ range: 'z', label: '《大|おお》きくする', min: 1, max: 200, step: 1, fmt: v => A.num(v, 0) + ' 《倍|ばい》' }],
      step(st, dt) { st.z = Math.min(200, st.z * Math.exp(dt * 0.9)); if (st.z >= 200) return false; },
      draw(cv, st) { drawZ(cv, st); },
      readout: st => `${A.num(st.z, 0)} 《倍|ばい》：《見|み》ている《横|よこ》のはば ＝ ${A.num(1.2 / st.z, 4)} 《秒|びょう》`
    },
    {
      key: 'en', label: '③ 《円|えん》の《接線|せっせん》（《第|だい》4《巻|かん》）',
      lead: '《円|えん》の《上|うえ》の《点|てん》 P を T に《近|ちか》づけると、《直線|ちょくせん》 TP は、T でふれる《直線|ちょくせん》（《接線|せっせん》）に《近|ちか》づきます。▶ で P を《近|ちか》づけましょう。',
      note: '《中心|ちゅうしん》の《角|かく》 $\\angle\\text{TOP}$ を《小|ちい》さくするほど、《直線|ちょくせん》 TP と《半径|はんけい》 OT の《角|かく》は 90° に《近|ちか》づきます（60°→60°、30°→75°、10°→85°、2°→89°、0.2°→89.9°）。だから、**《接線|せっせん》は、《接点|せってん》で《半径|はんけい》に《垂直|すいちょく》**です（4-2⑥）。',
      legend: [['《円|えん》', { color: 'sub' }], ['《直線|ちょくせん》 TP', { color: 'b' }], ['T でふれる《直線|ちょくせん》（《接線|せっせん》）', { color: 'ink', style: 'dash' }], ['《三角形|さんかくけい》 OTP', { color: 'a', style: 'dot' }]],
      controls: [{ range: 'th', label: '《中心|ちゅうしん》の《角|かく》 $\\angle\\text{TOP}$', min: 0.2, max: 60, step: 0.1, fmt: v => A.num(v, 1) + '°' }],
      step(st, dt) { st.th = Math.max(0.2, st.th * Math.exp(-dt * 0.6)); if (st.th <= 0.201) { st.th = 0.2; return false; } },
      draw(cv, st) { drawC(cv, st); },
      readout: st => `$\\angle\\text{TOP}$＝${A.num(st.th, 1)}°　　T の《角|かく》（《直線|ちょくせん》 TP と《半径|はんけい》 OT の《角|かく》）＝$(180°-${A.num(st.th, 1)}°)÷2$＝**${A.num((180 - st.th) / 2, 2)}°**`
    }
  ]
});

function viewK() { return new A.View({ W: 880, H: 420 }, { x0: 0, x1: 2.2, y0: -2, y1: 24, box: [60, 24, 500, 360] }); }

function drawK(cv, st) {
  const v = cv.view({ x0: 0, x1: 2.2, y0: -2, y1: 24, box: [60, 24, 500, 360] });
  v.axes({ xt: [0.5, 1, 1.5, 2], yt: [5, 10, 15, 20], xl: 'x（びょう）', yl: 'y（m）', ax: 0, ay: 0 });
  const h = st.h, x1 = 1 + h, y1 = f(x1), m = slope(h);
  v.plot(f, { color: 'a', width: 3.5 });
  v.plot(x => 10 * x - 5, { color: 'ink', style: 'dash', width: 2 });
  v.plot(x => 5 + m * (x - 1), { color: 'b', width: 2.5 });
  // 傾きの三角形
  v.line([[1, 5], [x1, 5]], { color: 'd', style: 'dot', width: 3.5 });
  v.line([[x1, 5], [x1, y1]], { color: 'c', style: 'dashdot', width: 3.5 });
  if (h > 0.12) {
    v.text('h', (1 + x1) / 2, 3.6, { align: 'center', size: 16, color: 'd', math: true, italic: true, bg: true });
    v.text('10h+5h²', x1 + 0.04, (5 + y1) / 2, { size: 15, color: 'c', math: true, italic: true, bg: true });
  }
  v.dot(1, 5, { color: 'ink', r: 6 }); v.dot(x1, y1, { color: 'b', shape: 'square', r: 6 });
  v.text('A', 0.93, 6.3, { size: 17, bold: true, align: 'right' });
  v.text("P", x1 - 0.06, y1 + 1.3, { size: 17, bold: true, color: "b", align: "right", bg: true });
  // 右：本の表
  const X0 = 600, Y0 = 70;
  cv.text('h', X0 + 40, Y0, { align: 'center', size: 17, math: true, italic: true, bold: true });
  cv.text('10+5h', X0 + 170, Y0, { align: 'center', size: 17, math: true, bold: true });
  cv.line([[X0, Y0 + 16], [X0 + 250, Y0 + 16]], { color: 'sub', width: 1 });
  const rows = [1, 0.5, 0.1, 0.01];
  rows.forEach((hh, k) => {
    const y = Y0 + 44 + k * 38, on = Math.abs(hh - st.h) < 1e-6;
    if (on) cv.rect(X0 - 6, y - 17, 262, 34, { fill: 'hl', alpha: 1 });
    cv.text(String(hh), X0 + 40, y, { align: 'center', size: 17 });
    cv.text(A.num(slope(hh), 2).replace(/\.?0+$/, ''), X0 + 170, y, { align: 'center', size: 17, bold: on });
  });
  const y = Y0 + 44 + 4 * 38 + 14;
  cv.line([[X0, y - 18], [X0 + 250, y - 18]], { color: 'sub', width: 1 });
  cv.text(A.num(st.h, 2), X0 + 40, y, { align: 'center', size: 17, color: 'b' });
  cv.text(A.num(slope(st.h), 2), X0 + 170, y, { align: 'center', size: 17, color: 'b', bold: true });
  cv.text('↓ h を 0 に ちかづけると', X0 + 125, y + 50, { align: 'center', size: 15, color: 'sub' });
  cv.text('10 に ちかづく', X0 + 125, y + 78, { align: 'center', size: 17, bold: true });
}

function drawZ(cv, st) {
  const z = st.z, wx = 1.2 / z, wy = 11 / z;
  const v = cv.view({ x0: 1 - wx, x1: 1 + wx, y0: 5 - wy, y1: 5 + wy, box: [60, 20, 760, 370] });
  v.clip(() => {
    // 目もりの代わりに、方眼（見ているはばの 1/4 ごと）
    for (let k = -4; k <= 4; k++) { v.line([[1 + k * wx / 4, 5 - wy], [1 + k * wx / 4, 5 + wy]], { color: 'grid', width: 1 }); v.line([[1 - wx, 5 + k * wy / 4], [1 + wx, 5 + k * wy / 4]], { color: 'grid', width: 1 }); }
  });
  v.plot(x => 10 * x - 5, { color: 'ink', style: 'dash', width: 2.5 });
  v.plot(f, { color: 'a', width: 4 });
  v.dot(1, 5, { color: 'ink', r: 6 });
  v.text('A（1, 5）', 1 + wx * 0.04, 5 - wy * 0.1, { size: 16, bold: true });
  cv.rect(60, 20, 760, 370, { color: 'line', width: 1 });
  cv.text(`よこの はば ${A.num(2 * wx, 4)} びょう`, 72, 42, { size: 15, color: "sub", bg: true });
}

function drawC(cv, st) {
  const v = cv.view({ x0: -1.6, x1: 1.6, y0: -1.25, y1: 1.15, box: [30, 16, 820, 390], equal: true });
  const th = st.th * Math.PI / 180;
  const O = [0, 0], T = [0, -1], P = [Math.sin(th), -Math.cos(th)];
  v.circle(0, 0, 1, { color: 'sub', width: 2 });
  v.poly([O, T, P], { fill: 'a', alpha: 0.12, color: 'a', style: 'dot', width: 2 });
  v.line([[-1.5, -1], [1.5, -1]], { color: 'ink', style: 'dash', width: 2 });
  // 直線 TP を両側へのばす
  const d = [P[0] - T[0], P[1] - T[1]], L = Math.hypot(d[0], d[1]), u = [d[0] / L, d[1] / L];
  v.clip(() => v.line([[T[0] - u[0] * 1.6, T[1] - u[1] * 1.6], [T[0] + u[0] * 3, T[1] + u[1] * 3]], { color: 'b', width: 3 }));
  // T の《角|かく》（OT と TP のあいだ）
  const aT = (180 - st.th) / 2 * Math.PI / 180, r = 0.22, arc = [];
  for (let k = 0; k <= 30; k++) { const a = Math.PI / 2 - aT * k / 30; arc.push([T[0] + r * Math.cos(a), T[1] + r * Math.sin(a)]); }
  v.line(arc, { color: 'b', width: 2 });
  v.text(A.num((180 - st.th) / 2, 1) + '°', T[0] + 0.26, T[1] + 0.3, { size: 16, color: 'b', bold: true, bg: true });
  v.dot(0, 0, { color: 'ink', r: 5 }); v.dot(T[0], T[1], { color: 'ink', r: 5 }); v.dot(P[0], P[1], { color: 'b', shape: 'square', r: 6 });
  v.text('O', -0.1, 0.05, { size: 17, bold: true, align: 'right' });
  v.text('T', -0.08, -1.1, { size: 17, bold: true, align: 'right' });
  v.text('P', P[0] + 0.08, P[1] + 0.06, { size: 17, bold: true, color: 'b' });
  v.text(A.num(st.th, 1) + '°', 0.04, -0.28, { size: 15, color: 'a', bg: true });
  v.text('せっせん', 1.25, -1.1, { size: 15, align: 'center' });
}
