// @id m2-08
// @title 《倍々|ばいばい》でふえる・《半分|はんぶん》ずつへる：《指数|しすう》と《対数|たいすう》
// @vol 数学3
// @from 数学 3-11②④（ch3-11:310・443・802）・3-12④⑥（ch3-12:284・342・351）／原-12、電-9、波-9、5-14 でも使う
'use strict';
// 本の数：2^x と x²（x=4 で 16、x=20 で 1048576 と 400）、テクネチウム99m の半減期 6 時間（3 時間後は 75 % ではなく 70.7 %）、
//          y=log₂x は y=2^x を y=x で折り返す、片対数グラフで 1・10・100・1000 が同じ《間|ま》かく（1 と 10 のまん中は 3.16）
const fmt = v => v >= 100 ? A.num(v, 0) : v >= 10 ? A.num(v, 1) : A.num(v, 2);
A.item({
  id: 'm2-08', title: '《倍々|ばいばい》でふえる・《半分|はんぶん》ずつへる：《指数|しすう》と《対数|たいすう》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-11②④「《指数関数|しすうかんすう》のグラフ」「《半減期|はんげんき》」・3-12④⑥「$y=\\log_2x$ のグラフ」「《片対数|かたたいすう》グラフ」の《図|ず》から（《物理|ぶつり》 《原|げん》-12・《電|でん》-9・《波|なみ》-9、《第|だい》5《巻|かん》 5-14 でも《使|つか》う）',
  W: 880, H: 420,
  state: { x: 0, t: 0, u: 0, m: 0 },
  scenes: [
    {
      key: 'oinuki', label: '① $2^x$ が《追|お》いぬく',
      lead: '1《次関数|じかんすう》 $y=2x+1$、$y=x^2$、《指数関数|しすうかんすう》 $y=2^x$ を、$x$ を《大|おお》きくしながらくらべます。▶ を《押|お》してみましょう。',
      note: '$x=4$ までは《同|おな》じくらい（$x^2$ も $2^x$ も16）。そこから《先|さき》は、$2^x$ がけたちがいに《大|おお》きくなります。$x=20$ では、$x^2$ は400なのに、$2^x$ は《約|やく》100《万|まん》です。1《次関数|じかんすう》は「ひき《算|ざん》が《一定|いってい》」、《指数関数|しすうかんすう》は「わり《算|ざん》が《一定|いってい》」（となりどうしで2《倍|ばい》）です。',
      legend: [['$y=2^x$', { color: 'a' }], ['$y=x^2$', { color: 'b', style: 'dash' }], ['$y=2x+1$（《直線|ちょくせん》）', { color: 'c', style: 'dashdot' }]],
      controls: [{ range: 'x', label: '$x$', min: 0, max: 7, step: 0.05, d: 2 }],
      init(st) { st.x = 0; },
      step(st, dt) { st.x = Math.min(7, st.x + dt * 0.8); if (st.x >= 7) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: 0, x1: 7.6, y0: 0, y1: 135, box: [70, 20, 760, 360] });
        v.axes({ xt: A.range(1, 7, 1), yt: [20, 40, 60, 80, 100, 120], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        const fs = [[x => 2 ** x, 'a', 'solid', 'circle', '2ˣ'], [x => x * x, 'b', 'dash', 'square', 'x²'], [x => 2 * x + 1, 'c', 'dashdot', 'tri', '2x+1']];
        for (const [f, c, s] of fs) { v.plot(f, { x0: 0, x1: 7.6, color: c, style: s, width: 1.2, alpha: 0.3 }); v.plot(f, { x0: 0, x1: st.x, color: c, style: s, width: 3.5 }); }
        for (const [f, c, , sh, lab] of fs) { v.dot(st.x, f(st.x), { color: c, shape: sh, r: 6 }); v.text(`${lab}＝${fmt(f(st.x))}`, st.x + 0.12, f(st.x) + (lab === 'x²' ? -6 : 6), { size: 15, color: c, bold: true, math: true, bg: true }); }
        if (st.x >= 4) { v.dot(4, 16, { color: 'ink', shape: 'diamond', r: 6 }); v.text('x＝4 で おなじ 16', 4, 30, { align: 'center', size: 15, bg: true }); }
      },
      readout: st => `$x$＝${A.num(st.x, 2)}　　$2^x$＝**${fmt(2 ** st.x)}**　　$x^2$＝${fmt(st.x * st.x)}　　$2x+1$＝${fmt(2 * st.x + 1)}`
    },
    {
      key: 'hangen', label: '② 《半減期|はんげんき》',
      lead: '《病院|びょういん》の《検査|けんさ》で《使|つか》う《薬|くすり》の《物質|ぶっしつ》（テクネチウム99m）は、6《時間|じかん》ごとに《半分|はんぶん》にへります。だから、《検査|けんさ》が《終|お》わると《体|からだ》の《中|なか》からすぐに《少|すく》なくなります。▶ で《時間|じかん》を《進|すす》めましょう。',
      note: '《量|りょう》が《半分|はんぶん》になるまでの《時間|じかん》を**《半減期|はんげんき》**といいます。100 % から 50 % までも6《時間|じかん》、50 % から 25 % までも6《時間|じかん》。のこっている《量|りょう》は（はじめの《量|りょう》）×$\\left(\\frac{1}{2}\\right)^{\\frac{t}{6}}$ です。',
      miss: '3《時間後|じかんご》（《半減期|はんげんき》6《時間|じかん》の《半分|はんぶん》）は、100 % と 50 % のまん《中|なか》の 75 % ではありません。$\\left(\\frac{1}{2}\\right)^{0.5}=\\frac{1}{\\sqrt{2}}=0.707$ で、《約|やく》 70.7 %。75 % が2《回|かい》だと $0.75\\times0.75=0.5625$ で、《半分|はんぶん》になりません。グラフは《直線|ちょくせん》ではなく《曲線|きょくせん》です。',
      legend: [['のこっている《量|りょう》（％）', { color: 'a' }], ['6《時間|じかん》ごとの《点|てん》', { color: 'ink', shape: 'circle', noline: true }], ['《直線|ちょくせん》でつないだ 75 %（まちがい）', { color: 'b', style: 'dash', shape: 'square' }], ['《本当|ほんとう》の《値|あたい》（3《時間|じかん》で 70.7 %）', { color: 'a', shape: 'diamond', noline: true }]],
      controls: [{ range: 't', label: '《時間|じかん》 $t$〔h〕', min: 0, max: 24, step: 0.25, d: 2 }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(24, st.t + dt * 2.4); if (st.t >= 24) return false; },
      draw(cv, st) {
        const r = Math.pow(0.5, st.t / 6), n = 16 * r;
        // 左：16 マス（緑のマスが、のこっている量）
        const s = 44, X0 = 40, Y0 = 70;
        for (let k = 0; k < 16; k++) {
          const cx = X0 + (k % 4) * (s + 6), cy = Y0 + (3 - Math.floor(k / 4)) * (s + 6), f = A.clamp(n - k, 0, 1);
          cv.rect(cx, cy, s, s, { color: 'line', width: 1.5 });
          if (f > 0) cv.rect(cx, cy + s * (1 - f), s, s * f, { fill: 'c', alpha: 0.55, color: 'c', width: 1.5 });
        }
        cv.text(`${A.num(st.t, 1)} じかん`, X0 + 97, Y0 - 30, { align: 'center', size: 17, bold: true });
        cv.text(`${A.num(100 * r, 1)} %`, X0 + 97, Y0 + 4 * (s + 6) + 18, { align: 'center', size: 17, bold: true, color: 'c' });
        // 右：グラフ
        const v = cv.view({ x0: 0, x1: 26.5, y0: 0, y1: 112, box: [300, 20, 550, 360] });
        v.axes({ xt: [3, 6, 12, 18, 24], yt: [25, 50, 75, 100], xl: 't（h）', yl: '%' });
        v.plot(t => 100 * Math.pow(0.5, t / 6), { color: 'a', width: 1.2, alpha: 0.3 });
        v.plot(t => 100 * Math.pow(0.5, t / 6), { x0: 0, x1: st.t, color: 'a', width: 3.5 });
        for (const t of [0, 6, 12, 18, 24]) if (t <= st.t + 1e-9) v.dot(t, 100 * Math.pow(0.5, t / 6), { color: 'ink', r: 4.5 });
        if (st.t >= 3) {
          v.line([[0, 100], [6, 50]], { color: 'b', style: 'dash', width: 2 });
          v.dot(3, 75, { color: 'b', shape: 'square', r: 6 }); v.dot(3, 70.71, { color: 'a', shape: 'diamond', r: 7 });
          v.text('75 %？', 3.9, 82, { size: 15, color: 'b', bold: true, bg: true });
          v.text('ほんとうは 70.7 %', 4.4, 64, { size: 15, color: 'a', bold: true, bg: true });
        }
        v.dot(st.t, 100 * r, { color: 'c', shape: 'square', r: 6 });
      },
      readout: st => `$t$＝${A.num(st.t, 2)} h　　《半分|はんぶん》になった《回数|かいすう》 $\\frac{t}{6}$＝${A.num(st.t / 6, 2)}　　のこっている《量|りょう》＝$100\\times\\left(\\frac{1}{2}\\right)^{${A.num(st.t / 6, 2)}}$＝**${A.num(100 * Math.pow(0.5, st.t / 6), 1)} %**`
    },
    {
      key: 'orikaesi', label: '③ $y=x$ で《折|お》り《返|かえ》す',
      lead: '$y=2^x$ のグラフの《点|てん》を、《直線|ちょくせん》 $y=x$ で《折|お》り《返|かえ》します。▶ を《押|お》すと、《点|てん》 $(x,\\ y)$ が $(y,\\ x)$ へ《動|うご》きます。',
      note: '$y=2^x$ の《点|てん》 $(2,\\ 4)$ は、$y=\\log_2x$ では《点|てん》 $(4,\\ 2)$ になります。2つの《点|てん》を《結|むす》ぶ《点線|てんせん》は、どれも $y=x$ と《直角|ちょっかく》に《交|まじ》わり、まん《中|なか》が $y=x$ の《上|うえ》にあります。だから、$y=\\log_ax$ のグラフは、$y=a^x$ のグラフを《直線|ちょくせん》 $y=x$ で《折|お》り《返|かえ》したものです。',
      legend: [['$y=2^x$', { color: 'b', style: 'dash' }], ['《動|うご》いている《曲線|きょくせん》', { color: 'a' }], ['$y=x$', { color: 'sub', style: 'dot' }], ['$(1,2)$・$(2,4)$・$(3,8)$ とその《行|い》き《先|さき》', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ range: 'u', label: '《折|お》り《返|かえ》す', min: 0, max: 1, step: 0.01, d: 2 }],
      init(st) { st.u = 0; },
      step(st, dt) { st.u = Math.min(1, st.u + dt * 0.35); if (st.u >= 1) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: -2.6, x1: 8.8, y0: -2.6, y1: 8.8, box: [210, 12, 460, 396], equal: true });
        v.axes({ xt: [-2, 2, 4, 6, 8], yt: [-2, 2, 4, 6, 8], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        v.line([[-2.5, -2.5], [8.5, 8.5]], { color: 'sub', style: 'dot', width: 2 });
        v.plot(x => 2 ** x, { x0: -2.5, x1: 3.1, color: 'b', style: 'dash', width: 2 });
        const u = st.u, M = (x, y) => [A.lerp(x, y, u), A.lerp(y, x, u)];
        v.param(s => M(s, 2 ** s)[0], s => M(s, 2 ** s)[1], -2.5, 3.08, { color: 'a', width: 3.5 });
        for (const k of [1, 2, 3]) {
          const p = [k, 2 ** k], q = [2 ** k, k];
          v.line([p, q], { color: 'sub', style: 'dot', width: 1.2 });
          v.dot(p[0], p[1], { color: 'b', r: 4 }); v.dot(q[0], q[1], { color: 'sub', r: 4, open: true });
          const m = M(p[0], p[1]); v.dot(m[0], m[1], { color: 'a', r: 6 });
        }
        v.text('y＝x', 7.6, 8.4, { size: 15, color: 'sub', bg: true });
        if (u > 0.98) v.text('y＝log₂x', 6.2, 2.2, { size: 16, color: 'a', bold: true, bg: true });
        v.text('y＝2ˣ', 2.9, 7.6, { size: 16, color: 'b', bold: true, bg: true, align: 'right' });
      },
      readout: st => `《点|てん》 $(2,\\ 4)$ → いま $(${A.num(A.lerp(2, 4, st.u), 2)},\\ ${A.num(A.lerp(4, 2, st.u), 2)})$ → 《行|い》き《先|さき》 $(4,\\ 2)$`
    },
    {
      key: 'taisu', label: '④ 《対数目|たいすうめ》もり',
      lead: '《細菌|さいきん》の《数|かず》 $y=2^x$ を、ふつうのグラフから《片対数|かたたいすう》グラフへ、たて《軸|じく》の《目|め》もりを《少|すこ》しずつ《変|か》えていきます。▶ を《押|お》してみましょう。',
      note: 'ふつうのグラフでは、はじめのほうの《点|てん》が《横軸|よこじく》にくっついて《読|よ》めません。たて《軸|じく》を《対数目|たいすうめ》もり（1、10、100、1000 が《同|おな》じ《間|ま》かく）にすると、《点|てん》がまっすぐに《並|なら》びます。$\\log_{10}y=0.301x$ で、$x$ が1ふえるごとに0.301ずつ《上|あ》がるからです。',
      miss: '《片対数|かたたいすう》グラフで、1と10の《目|め》もりのまん《中|なか》は5.5ではありません。まん《中|なか》は $10^{0.5}=\\sqrt{10}=3.16\\cdots$ です。5の《目|め》もり（0.699）は、まん《中|なか》より《上|うえ》にあります。',
      legend: [['$y=2^x$ の《点|てん》', { color: 'a', shape: 'circle' }], ['ふつうの《目|め》もり', { color: 'sub', style: 'dot' }], ['《対数目|たいすうめ》もり', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'm', label: 'ふつう → 《対数|たいすう》', min: 0, max: 1, step: 0.01, d: 2 }],
      init(st) { st.m = 0; },
      step(st, dt) { st.m = Math.min(1, st.m + dt * 0.3); if (st.m >= 1) return false; },
      draw(cv, st) { drawLog(cv, st); },
      readout: st => st.m > 0.99 ? 'たて《軸|じく》の《位置|いち》は $\\log_{10}y$。1・10・100・1000 が《同|おな》じ《間|ま》かくで、まん《中|なか》の3.16の《所|ところ》に《印|しるし》があります。' : st.m < 0.01 ? 'ふつうのグラフ：$y$ は1から1024まで。はじめのほうの《点|てん》は《横軸|よこじく》にくっついている' : `《目|め》もりを《変|か》えているところ（${Math.round(st.m * 100)} %）`
    }
  ]
});

function drawLog(cv, st) {
  const m = st.m, L = 70, T = 20, Wd = 760, Hd = 360;
  const P = y => (1 - m) * y / 1150 + m * Math.log10(Math.max(y, 1)) / 3.25;
  const X = x => L + x / 11 * Wd, Y = y => T + Hd - P(y) * Hd;
  const g = cv.g;
  // ふつうの目もり（だんだんうすく）
  g.globalAlpha = 1 - m;
  for (const y of [200, 400, 600, 800, 1000]) { cv.line([[L, Y(y)], [L + Wd, Y(y)]], { color: 'sub', style: 'dot', width: 1, alpha: 1 - m }); g.globalAlpha = 1 - m; cv.text(String(y), L - 8, Y(y), { align: 'right', size: 14, color: 'sub' }); }
  // 対数目もり（だんだんこく）
  g.globalAlpha = m;
  for (let d = 0; d < 4; d++) for (let k = 1; k <= 9; k++) { const y = k * 10 ** d; if (y > 1150) break; cv.line([[L, Y(y)], [L + Wd, Y(y)]], { color: 'b', style: k === 1 ? 'dash' : 'dot', width: k === 1 ? 1.5 : 0.8, alpha: m * (k === 1 ? 1 : 0.5) }); g.globalAlpha = m; if (k === 1) cv.text(String(y), L - 8, Y(y), { align: 'right', size: 15, color: 'b', bold: true }); }
  g.globalAlpha = 1;
  // 軸
  cv.arrow(L, T + Hd, L + Wd + 10, T + Hd, { color: 'sub', width: 1.5, head: 9 });
  cv.arrow(L, T + Hd, L, T - 6, { color: 'sub', width: 1.5, head: 9 });
  for (let x = 0; x <= 10; x += 2) { cv.line([[X(x), T + Hd - 4], [X(x), T + Hd + 4]], { color: 'sub', width: 1 }); cv.text(String(x), X(x), T + Hd + 14, { align: 'center', size: 14, color: 'sub' }); }
  cv.text('x', L + Wd + 6, T + Hd - 14, { size: 15, math: true, italic: true, color: 'sub' });
  cv.text('y', L + 8, T - 2, { size: 15, math: true, italic: true, color: 'sub' });
  // 曲線と点
  const pts = []; for (let k = 0; k <= 200; k++) { const x = k / 20; pts.push([X(x), Y(2 ** x)]); }
  cv.line(pts, { color: 'a', width: 2.5 });
  for (let x = 0; x <= 10; x++) cv.dot(X(x), Y(2 ** x), { color: 'a', r: 5 });
  // 1 と 10 のまん中
  if (m > 0.99) {
    const yA = Y(1), yB = Y(10), ym = (yA + yB) / 2;
    cv.line([[L - 4, yA], [L - 4, yB]], { color: 'ink', width: 3 });
    cv.dot(L, ym, { color: 'ink', shape: 'diamond', r: 6 });
    cv.text('まんなか＝3.16', L + 12, ym - 2, { size: 15, bold: true, bg: true });
    cv.line([[L, Y(5)], [L + 40, Y(5)]], { color: 'b', width: 2.5 });
    cv.text('5', L + 46, Y(5), { size: 15, color: 'b', bold: true });
  }
}
