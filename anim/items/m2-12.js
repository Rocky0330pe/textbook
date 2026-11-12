// @id m2-12
// @title いちばんよい《直線|ちょくせん》をさがす：《最小二乗法|さいしょうにじょうほう》
// @vol 数学3
// @from 数学 3-16①〜④（ch3-16:97・119・181・295・356）／3-0、5-7、7-5、物理の実験 でも使う
'use strict';
// 本の数：ばねB (1,22)(2,39)(3,60) に y=ax：S＝14(a−20)²+5（a=18→61、19→19、20→5）。
//          ばねC (1,14.0)(2,15.9)(3,18.1)(4,20.1)(5,21.9)：平均 (3,18)、S＝10(a−2)²+0.04、y=2x+12。
//          残差：3-0 のばねと y=1.497x、輪ゴム（5,1.0)…(25,8.0) と y=0.35x−1.25。
const BANE = [[1, 22], [2, 39], [3, 60]];
const BANEC = [[1, 14.0], [2, 15.9], [3, 18.1], [4, 20.1], [5, 21.9]];
const SORA = [[0, 0], [1, 1.6], [2, 2.9], [3, 4.6], [4, 5.9], [5, 7.6], [6, 8.9]];
const WAGOMU = [[5, 1.0], [10, 2.0], [15, 3.5], [20, 5.5], [25, 8.0]];
const V1 = { x0: 0, x1: 3.6, y0: 0, y1: 75, box: [70, 20, 380, 370] };
const V2 = { x0: 0, x1: 5.8, y0: 10, y1: 27, box: [70, 20, 380, 370] };
const SB = a => BANE.reduce((s, [x, y]) => s + (y - a * x) ** 2, 0);
const SC = a => BANEC.reduce((s, [x, y]) => s + (y - 18 - a * (x - 3)) ** 2, 0);
const n2 = v => A.num(v, Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? (Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1) : 2);
A.item({
  id: 'm2-12', title: 'いちばんよい《直線|ちょくせん》をさがす：《最小二乗法|さいしょうにじょうほう》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-16①〜④「ずれを《数|かず》で《表|あらわ》す」「$y=ax$」「$y=ax+b$」「《残差|ざんさ》を《見|み》る」の《図|ず》から（3-0、《第|だい》5《巻|かん》 5-7・《第|だい》7《巻|かん》 7-5、《物理|ぶつり》の《実験|じっけん》 でも《使|つか》う）',
  W: 880, H: 420,
  state: { a: 18, c: 1.2, mode: 'bane' },
  scenes: [
    {
      key: 'S', label: '① ずれの2《乗|じょう》の《和|わ》 $S$',
      lead: 'ばねBのデータに、《原点|げんてん》を《通|とお》る《直線|ちょくせん》 $y=ax$ を《引|ひ》きます。ずれ（《点|てん》と《線|せん》のたての《差|さ》）を1《辺|ぺん》とする《正方形|せいほうけい》の《面積|めんせき》の《合計|ごうけい》が $S$ です。▶ を《押|お》すと、$S$ の《谷|たに》の《底|そこ》をさがします。',
      note: '$S=14(a-20)^2+5$ で、$a=20$ のとき $S=5$ がいちばん《小|ちい》さくなります（$a=18$ と 22 で61、19 と 21 で19）。ずれは、《目|め》もりを《読|よ》んだ $y$ のほうにあるので、**たての《方向|ほうこう》**のずれを《考|かんが》えます。',
      legend: [['《直線|ちょくせん》 $y=ax$', { color: 'a' }], ['ずれ（《残差|ざんさ》）', { color: 'b', style: 'dash' }], ['ずれの2《乗|じょう》（《正方形|せいほうけい》）', { color: 'b', shape: 'square', style: 'dot' }], ['$S$ のグラフ', { color: 'c' }]],
      controls: [{ range: 'a', label: '《傾|かたむ》き $a$', min: 17, max: 23, step: 0.05, d: 2 }],
      init(st) { st.a = 17.5; },
      step(st, dt) { const g = 28 * (st.a - 20); st.a -= g * dt * 0.04; if (Math.abs(st.a - 20) < 0.005) { st.a = 20; return false; } },
      drag: { hit(st, x, y) { return x < 470 ? 1 : null; }, move(st, x, y) { const v = cv1(); const [px, py] = v.inv(x, y); if (px > 0.3) st.a = A.clamp(Math.round(py / px * 20) / 20, 17, 23); } },
      draw(cv, st) {
        const v = cv.view(V1);
        v.axes({ xt: [1, 2, 3], yt: [10, 20, 30, 40, 50, 60, 70], xl: 'x（こ）', yl: 'y（mm）', ay: 0 });
        squares(v, BANE.map(([x, y]) => [x, y, st.a * x]));
        v.plot(x => st.a * x, { x0: 0, x1: 3.5, color: 'a', width: 3 });
        BANE.forEach(([x, y]) => v.dot(x, y, { color: 'ink', r: 6 }));
        sPanel(cv, SB, st.a, [17, 23], 70, 0, a => `a＝${n2(a)}`);
      },
      readout: st => `$y=${n2(st.a)}x$：ずれ ${BANE.map(([x, y]) => n2(y - st.a * x)).join('、')}　　$S$＝**${A.num(SB(st.a), 2)}**`
    },
    {
      key: 'kaiten', label: '② 《平均|へいきん》の《点|てん》で《回|まわ》す',
      lead: 'ばねCの《全体|ぜんたい》の《長|なが》さ。いちばんよい《直線|ちょくせん》は、《平均|へいきん》の《点|てん》 $(3,\\ 18)$ を《通|とお》ります。《直線|ちょくせん》をドラッグして《平均|へいきん》の《点|てん》のまわりに《回|まわ》し、$S$ がいちばん《小|ちい》さい《所|ところ》をさがしましょう（▶ でも《回|まわ》ります）。',
      note: '《平均|へいきん》の《点|てん》を《通|とお》る《直線|ちょくせん》 $y-18=a(x-3)$ では $S=10(a-2)^2+0.04$。$a=2$ のときいちばん《小|ちい》さく、$y=2x+12$。$a$ は（《偏差|へんさ》の《積|せき》の《和|わ》）÷（$x$ の《偏差|へんさ》の2《乗|じょう》の《和|わ》）＝20÷10＝2 で、（**《共分散|きょうぶんさん》**）÷（$x$ の**《分散|ぶんさん》**）です。$b=12$ は、ばねのもとの《長|なが》さが《約|やく》 12 cm だということです。',
      legend: [['《平均|へいきん》の《点|てん》を《通|とお》る《直線|ちょくせん》', { color: 'a' }], ['ずれ', { color: 'b', style: 'dash' }], ['ずれの2《乗|じょう》', { color: 'b', shape: 'square', style: 'dot' }], ['《平均|へいきん》の《点|てん》 $(3,\\ 18)$', { color: 'ink', shape: 'diamond', noline: true }]],
      controls: [{ range: 'c', label: '《傾|かたむ》き $a$', min: 0, max: 4, step: 0.02, d: 2 }],
      init(st) { st.c = 0.6; },
      step(st, dt) { const g = 20 * (st.c - 2); st.c -= g * dt * 0.08; if (Math.abs(st.c - 2) < 0.004) { st.c = 2; return false; } },
      drag: { hit(st, x, y) { return x < 470 ? 1 : null; }, move(st, x, y) { const v = cv2(); const [px, py] = v.inv(x, y); if (Math.abs(px - 3) > 0.2) st.c = A.clamp(Math.round((py - 18) / (px - 3) * 50) / 50, 0, 4); } },
      draw(cv, st) {
        const v = cv.view(V2);
        v.axes({ xt: [1, 2, 3, 4, 5], yt: [10, 14, 18, 22, 26], xl: 'x（こ）', yl: 'y（cm）', ax: 10, ay: 0 });
        squares(v, BANEC.map(([x, y]) => [x, y, 18 + st.c * (x - 3)]));
        v.plot(x => 18 + st.c * (x - 3), { x0: 0, x1: 5.8, color: 'a', width: 3 });
        BANEC.forEach(([x, y]) => v.dot(x, y, { color: 'ink', r: 6 }));
        v.dot(3, 18, { color: 'ink', shape: 'diamond', r: 8 });
        sPanel(cv, SC, st.c, [0, 4], 50, 0, a => `a＝${n2(a)}`);
      },
      readout: st => { const b = 18 - 3 * st.c; return `$y=${n2(st.c)}x${b >= 0 ? '+' : '-'}${n2(Math.abs(b))}$　　$S$＝**${A.num(SC(st.c), 2)}**`; }
    },
    {
      key: 'wa', label: '③ ずれの《和|わ》が0なら？',
      lead: 'ずれをそのままたすと、どうなるでしょう。《平均|へいきん》の《点|てん》を《通|とお》る《直線|ちょくせん》を《回|まわ》しても、ずれの《和|わ》はいつも0です。2《乗|じょう》の《和|わ》 $S$ とくらべましょう。',
      miss: '「ずれをたすと0になったので、この《線|せん》がいちばん《合|あ》っている」はまちがい。《上|うえ》へのずれと《下|した》へのずれは《打|う》ち《消|け》し《合|あ》います。まったく《合|あ》わない《線|せん》でも、ずれの《和|わ》が0になることがあります。ずれは**2《乗|じょう》してからたして**、その《和|わ》がいちばん《小|ちい》さい《線|せん》をさがします。',
      legend: [['《平均|へいきん》の《点|てん》を《通|とお》る《直線|ちょくせん》', { color: 'a' }], ['《上|うえ》へのずれ（＋）', { color: 'c', style: 'solid' }], ['《下|した》へのずれ（−）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'c', label: '《傾|かたむ》き $a$', min: -2, max: 6, step: 0.05, d: 2 }],
      init(st) { st.c = 2; st.T = 0; },
      step(st, dt) { st.T = (st.T || 0) + dt; st.c = Math.round((2 - 3.5 * Math.sin(st.T * 0.6)) * 20) / 20; if (st.T > Math.PI / 0.6 * 2) { st.c = 2; return false; } },
      draw(cv, st) {
        const v = cv.view(V2);
        v.axes({ xt: [1, 2, 3, 4, 5], yt: [10, 14, 18, 22, 26], xl: 'x（こ）', yl: 'y（cm）', ax: 10, ay: 0 });
        v.clip(() => v.plot(x => 18 + st.c * (x - 3), { x0: 0, x1: 5.8, color: 'a', width: 3 }));
        let sum = 0;
        BANEC.forEach(([x, y]) => { const f = 18 + st.c * (x - 3), e = y - f; sum += e; v.line([[x, f], [x, y]], { color: e >= 0 ? 'c' : 'b', style: e >= 0 ? 'solid' : 'dash', width: 3 }); v.dot(x, y, { color: 'ink', r: 6 }); v.text((e >= 0 ? '+' : '−') + A.num(Math.abs(e), 1), x + 0.12, (y + f) / 2, { size: 15, color: e >= 0 ? 'c' : 'b', bold: true, bg: true }); });
        v.dot(3, 18, { color: 'ink', shape: 'diamond', r: 8 });
        cv.text('ずれの わ', 560, 120, { size: 17, color: 'sub' });
        cv.text(A.num(Math.abs(sum) < 1e-9 ? 0 : sum, 2), 560, 152, { size: 26, bold: true });
        cv.text('ずれの 2じょうの わ S', 560, 230, { size: 17, color: 'sub' });
        cv.text(A.num(SC(st.c), 2), 560, 262, { size: 26, bold: true, color: 'b' });
      },
      readout: st => `《傾|かたむ》き $a$＝${n2(st.c)}：ずれの《和|わ》＝0（どの《傾|かたむ》きでも）　　$S$＝${A.num(SC(st.c), 2)}`
    },
    {
      key: 'zansa', label: '④ 《残差|ざんさ》を《見|み》る',
      lead: '《最小二乗法|さいしょうにじょうほう》は、どんなデータにも《直線|ちょくせん》を1《本|ぽん》《出|だ》してくれます。《最後|さいご》に、《残差|ざんさ》（ずれ）のならび《方|かた》を《見|み》て、《直線|ちょくせん》でよいかを《確|たし》かめます。',
      note: '《残差|ざんさ》が0のまわりに《小|ちい》さく、＋と−がばらばらにならぶ → 《直線|ちょくせん》でよい（3-0 のばね）。《残差|ざんさ》が《山|やま》や《谷|たに》の《形|かたち》にならぶ → 《曲|ま》がった《関係|かんけい》で、《直線|ちょくせん》は《合|あ》わない（《輪|わ》ゴム：＋、−、−、−、＋ の《谷|たに》の《形|かたち》）。',
      legend: [['データと《直線|ちょくせん》', { color: 'a' }], ['《残差|ざんさ》（＋）', { color: 'c', shape: 'circle' }], ['《残差|ざんさ》（−）', { color: 'b', style: 'dash', shape: 'square' }]],
      controls: [{ seg: 'mode', label: 'データ', options: [['bane', 'ばね（$y=1.497x$）'], ['gomu', '《輪|わ》ゴム（$y=0.35x-1.25$）']] }],
      init(st) { st.mode = 'bane'; st.T = 0; },
      step(st, dt) { st.T = (st.T || 0) + dt; if (st.T > 2.5) { st.mode = 'gomu'; return false; } },
      draw(cv, st) { drawZansa(cv, st); },
      readout: st => { const [D, f] = st.mode === 'bane' ? [SORA, x => 136.2 / 91 * x] : [WAGOMU, x => 0.35 * x - 1.25]; return '《残差|ざんさ》：' + D.map(([x, y]) => { const e = y - f(x); return (e >= 0 ? '+' : '−') + A.num(Math.abs(e), 3); }).join('、 ') + ' （cm）'; }
    }
  ]
});

function cv1() { return new A.View({ W: 880, H: 420 }, V1); }
function cv2() { return new A.View({ W: 880, H: 420 }, V2); }
// ずれを1辺とする正方形（画面の上で、たての長さと同じ横はばにする）
function squares(v, D) {
  for (const [x, y, f] of D) {
    const px = v.X(x), py = v.Y(y), pf = v.Y(f), s = Math.abs(py - pf);
    v.cv.rect(px, Math.min(py, pf), s, s, { fill: 'b', alpha: 0.18, color: 'b', style: 'dot', width: 1.5 });
    v.cv.line([[px, py], [px, pf]], { color: 'b', style: 'dash', width: 3 });
  }
}
// 右：S のグラフ（谷の形）と、いまの点
function sPanel(cv, S, a, rng, ymax, ymin, lab) {
  const g = cv.view({ x0: rng[0], x1: rng[1], y0: ymin, y1: ymax, box: [530, 30, 320, 330] });
  const xt = A.range(Math.ceil(rng[0]), Math.floor(rng[1]), 1);
  g.axes({ xt, yt: ymax > 60 ? [20, 40, 60] : [10, 20, 30, 40], ay: rng[0], xl: 'a', yl: 'S', xlItalic: true, ylItalic: true, zero: true });
  g.plot(S, { color: 'c', width: 3 });
  const s = Math.min(S(a), ymax);
  g.line([[a, ymin], [a, s]], { color: 'sub', style: 'dot', width: 1.5 });
  g.dot(a, s, { color: 'b', shape: 'square', r: 7 });
  g.text(lab(a), a, Math.min(ymax * 0.95, s + ymax * 0.08), { align: 'center', size: 15, bold: true, bg: true });
}
function drawZansa(cv, st) {
  const bane = st.mode === 'bane';
  const D = bane ? SORA : WAGOMU, f = bane ? x => 136.2 / 91 * x : x => 0.35 * x - 1.25;
  const v = cv.view(bane ? { x0: 0, x1: 6.6, y0: 0, y1: 10, box: [70, 20, 360, 370] } : { x0: 0, x1: 28, y0: -1, y1: 9, box: [70, 20, 360, 370] });
  v.axes({ xt: bane ? [1, 2, 3, 4, 5, 6] : [5, 10, 15, 20, 25], yt: bane ? [2, 4, 6, 8] : [2, 4, 6, 8], xl: bane ? 'おもり（こ）' : '10えんだま（まい）', yl: 'のび（cm）', ay: 0 });
  v.plot(f, { color: 'a', width: 2.5 });
  D.forEach(([x, y]) => v.dot(x, y, { color: 'ink', r: 5 }));
  // 右：残差のグラフ
  const lim = bane ? 0.2 : 0.8;
  const g = cv.view({ x0: bane ? -0.4 : 0, x1: bane ? 6.6 : 28, y0: -lim, y1: lim, box: [500, 40, 350, 290] });
  g.line([[g.x0, 0], [g.x1, 0]], { color: 'ink', width: 1.5 });
  g.axes({ xt: bane ? [1, 2, 3, 4, 5, 6] : [5, 10, 15, 20, 25], yt: bane ? [-0.1, 0, 0.1] : [-0.5, 0, 0.5], ax: -lim, zero: true, yfmt: y => A.num(y, 1), xl: 'x', yl: 'ざんさ（cm）', xlItalic: true });
  D.forEach(([x, y]) => { const e = y - f(x); g.line([[x, 0], [x, e]], { color: e >= 0 ? 'c' : 'b', style: e >= 0 ? 'solid' : 'dash', width: 3.5 }); g.dot(x, e, e >= 0 ? { color: 'c', r: 6 } : { color: 'b', shape: 'square', r: 6 }); });
  cv.text(bane ? '＋と−が まざる → ちょくせんで よい' : '＋ − − − ＋ の たにの かたち → まがっている', 675, 398, { align: 'center', size: 15, bold: true, color: bane ? 'c' : 'b' });
}
