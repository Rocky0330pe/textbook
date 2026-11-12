// @id m2-11
// @title 《偏差|へんさ》の《長方形|ちょうほうけい》と《相関係数|そうかんけいすう》
// @vol 数学3
// @from 数学 3-15②〜⑤（ch3-15:138・283・446・533）／4-12⑦、3-16 でも使う
'use strict';
// 本の数：10人の身長とタイム（A 146 cm・8.5 s … J 176 cm・7.7 s）。平均 (160, 8.3)、共分散 −1.76、r＝−0.54。
//          5つの点で r＝0.14、(12, 12) を加えると r＝0.91。放物線 y＝x² の上の5点で r＝0。
const CLASS = [['A', 146, 8.5], ['B', 150, 8.6], ['C', 153, 8.9], ['D', 156, 8.2], ['E', 158, 7.8], ['F', 162, 8.2], ['G', 164, 8.2], ['H', 166, 8.8], ['I', 169, 8.1], ['J', 176, 7.7]];
const FIVE = [[1, 3], [2, 1], [3, 4], [4, 2], [5, 3]];
const PARA = [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]];
function stats(P) {
  const n = P.length, mx = P.reduce((s, p) => s + p[0], 0) / n, my = P.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of P) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  return { mx, my, cov: sxy / n, sx: Math.sqrt(sxx / n), sy: Math.sqrt(syy / n), r: sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0 };
}
// r がちょうど決まった値になる20個の点（種を決めて、毎回同じ）
const BASE = (() => {
  const g = A.rng(315), x = [], z = []; for (let k = 0; k < 20; k++) { x.push(A.gauss(g)); z.push(A.gauss(g)); }
  const c = a => { const m = a.reduce((s, v) => s + v, 0) / a.length; return a.map(v => v - m); };
  let X = c(x), Z = c(z); const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const k = dot(Z, X) / dot(X, X); Z = Z.map((v, i) => v - k * X[i]);
  const nx = Math.sqrt(dot(X, X) / 20), nz = Math.sqrt(dot(Z, Z) / 20);
  return { X: X.map(v => v / nx), Z: Z.map(v => v / nz) };
})();
const cloud = r => BASE.X.map((x, i) => [5 + 1.5 * x, 5 + 1.5 * (r * x + Math.sqrt(Math.max(0, 1 - r * r)) * BASE.Z[i])]);
const V13 = { x0: -0.5, x1: 13.5, y0: -0.5, y1: 13.5, box: [230, 14, 420, 390], equal: true };
const VPARA = { x0: -3.2, x1: 3.2, y0: -1.2, y1: 5, box: [120, 20, 640, 370], equal: true };
const VCLASS = { x0: 141, x1: 181, y0: 7.45, y1: 9.15, box: [80, 20, 740, 370] };
A.item({
  id: 'm2-11', title: '《偏差|へんさ》の《長方形|ちょうほうけい》と《相関係数|そうかんけいすう》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-15②〜⑤「《相関|そうかん》」「《共分散|きょうぶんさん》」「《相関係数|そうかんけいすう》」「《外|はず》れ《値|あたい》」の《図|ず》から（《第|だい》4《巻|かん》 4-12⑦、3-16 でも《使|つか》う）',
  W: 880, H: 420,
  state: { k: 0, r: 0.9, hz: true, pts: null },
  scenes: [
    {
      key: 'kyobunsan', label: '① 《偏差|へんさ》の《長方形|ちょうほうけい》',
      lead: '《平均|へいきん》の《点|てん》と、その《人|ひと》の《点|てん》を《向|む》かい《合|あ》う《角|かど》にした《長方形|ちょうほうけい》をかきます。▶ で《1人|ひとり》ずつかき、《終|お》わったら《点|てん》をドラッグして《動|うご》かしてみましょう。',
      note: '《偏差|へんさ》の《積|せき》は、《長方形|ちょうほうけい》の《面積|めんせき》に《符号|ふごう》をつけた《数|かず》です。《右上|みぎうえ》・《左下|ひだりした》（《青|あお》）は《正|せい》、《左上|ひだりうえ》・《右下|みぎした》（だいだい）は《負|ふ》。《全員|ぜんいん》の《偏差|へんさ》の《積|せき》の《平均|へいきん》が**《共分散|きょうぶんさん》**です。この10《人|にん》では $-17.6÷10=-1.76$ で《負|ふ》なので、《負|ふ》の《相関|そうかん》です。《平均|へいきん》からはなれた《人|ひと》ほど、《大|おお》きく《数|かぞ》えられます（Jさんの《長方形|ちょうほうけい》は、Hさんの3《倍|ばい》《以上|いじょう》）。',
      miss: '「《背|せ》が《高|たか》いほど《速|はや》い」から《正|せい》の《相関|そうかん》、ではありません。《背|せ》が《高|たか》いほどタイムの《数|かず》は《小|ちい》さいので、《負|ふ》の《相関|そうかん》です。《正|せい》・《負|ふ》は、《表|ひょう》に《書|か》いてある**《数|かず》**が《大|おお》きくなるか《小|ちい》さくなるかで《決|き》めます。',
      legend: [['《偏差|へんさ》の《積|せき》が《正|せい》（《右上|みぎうえ》・《左下|ひだりした》）', { color: 'a', shape: 'square' }], ['《偏差|へんさ》の《積|せき》が《負|ふ》（《左上|ひだりうえ》・《右下|みぎした》）', { color: 'b', style: 'dash', shape: 'square' }], ['《平均|へいきん》の《線|せん》', { color: 'sub', style: 'dot' }], ['《平均|へいきん》の《点|てん》（×）', { color: 'ink', noline: true }]],
      init(st) { st.k = 0; st.pts = CLASS.map(p => [p[1], p[2]]); },
      step(st, dt) { st.k = Math.min(10, st.k + dt * 1.2); if (st.k >= 10) return false; },
      drag: dragPts(() => cvView(VCLASS), [141, 180], [7.5, 9.1], 0.5, 0.05),
      draw(cv, st) {
        const v = cv.view(VCLASS);
        v.axes({ xt: [145, 150, 155, 160, 165, 170, 175, 180], yt: [7.6, 7.8, 8.0, 8.2, 8.4, 8.6, 8.8, 9.0], ax: 7.45, ay: 141, yfmt: y => A.num(y, 1), xl: 'しんちょう（cm）', yl: 'タイム（s）' });
        scatter(v, st.pts, Math.floor(st.k + 1e-9), CLASS.map(p => p[0]));
      },
      readout: st => { const s = stats(st.pts); return `《平均|へいきん》 (${A.num(s.mx, 1)}, ${A.num(s.my, 2)})　　《共分散|きょうぶんさん》 **${A.num(s.cov, 2)}**　　$r=\\frac{${A.num(s.cov, 2)}}{${A.num(s.sx, 2)}\\times${A.num(s.sy, 3)}}$＝**${A.num(s.r, 2)}**`; }
    },
    {
      key: 'r', label: '② $r$ と《点|てん》の《形|かたち》',
      lead: '《相関係数|そうかんけいすう》 $r$ を《変|か》えると、20《個|こ》の《点|てん》の《集|あつ》まり《方|かた》はどう《変|か》わるでしょう。▶ を《押|お》すと、$r$ が 0.9 から $-0.9$ まで《変|か》わります。',
      note: '$r$ が1や $-1$ に《近|ちか》いほど、《点|てん》は《細|ほそ》い《帯|おび》になります。$r=0$ に《近|ちか》いと、どちらでもない《形|かたち》です。$r$ はいつも $-1$ 《以上|いじょう》1《以下|いか》で、《単位|たんい》によりません。',
      miss: '$r=-0.9$ は、$r=0.5$ より「《小|ちい》さいので《弱|よわ》い《相関|そうかん》」ではありません。《符号|ふごう》は《向|む》きを、《符号|ふごう》をとった《大|おお》きさ（$|r|$）は《強|つよ》さを《表|あらわ》します。$|r|=0.9$ のほうが《強|つよ》い《相関|そうかん》です。',
      legend: [['《点|てん》', { color: 'ink', shape: 'circle', noline: true }], ['《偏差|へんさ》の《積|せき》が《正|せい》', { color: 'a', shape: 'square' }], ['《偏差|へんさ》の《積|せき》が《負|ふ》', { color: 'b', style: 'dash', shape: 'square' }]],
      controls: [{ range: 'r', label: '《相関係数|そうかんけいすう》 $r$', min: -1, max: 1, step: 0.01, d: 2 }],
      init(st) { st.r = 0.9; st.T = 0; },
      step(st, dt) { st.T = (st.T || 0) + dt; st.r = Math.round(0.9 * Math.cos(st.T * 0.5) * 100) / 100; if (st.T > Math.PI / 0.5) { st.r = -0.9; return false; } },
      draw(cv, st) {
        const v = cv.view({ x0: 0, x1: 10, y0: 0, y1: 10, box: [230, 14, 420, 390], equal: true });
        v.axes({ xt: [], yt: [], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true, grid: false });
        v.clip(() => scatter(v, cloud(st.r), 20, null, { faint: true }));
        v.text(`r＝${A.num(st.r, 2)}`, 9.6, 9.4, { align: 'right', size: 20, bold: true, bg: true });
      },
      readout: st => `$r$＝${A.num(st.r, 2)}　　${Math.abs(st.r) >= 0.7 ? '《強|つよ》い' : Math.abs(st.r) >= 0.4 ? 'ある' : Math.abs(st.r) >= 0.2 ? '《弱|よわ》い' : 'ほとんどない'}${Math.abs(st.r) >= 0.2 ? (st.r > 0 ? '《正|せい》の《相関|そうかん》（《右上|みぎあ》がり）' : '《負|ふ》の《相関|そうかん》（《右下|みぎさ》がり）') : '《相関|そうかん》'}`
    },
    {
      key: 'hazure', label: '③ はなれた1つの《点|てん》',
      lead: '5つの《点|てん》では、ほとんど《相関|そうかん》がありません（$r=0.14$）。ここに、ほかからずっとはなれた《点|てん》 $(12,\\ 12)$ を1つ《加|くわ》えると？　はなれた《点|てん》はドラッグできます。',
      note: 'はなれた《点|てん》の《偏差|へんさ》は $x$ も $y$ もとても《大|おお》きいので、《偏差|へんさ》の《積|せき》（《長方形|ちょうほうけい》の《面積|めんせき》）がとても《大|おお》きくなり、それだけで《共分散|きょうぶんさん》を《決|き》めてしまいます。$r$ だけを《見|み》ずに、**かならず《散布図|さんぷず》もかいて**《確|たし》かめましょう。はなれた《点|てん》が、はかりまちがいでないかも《調|しら》べます。',
      legend: [['《偏差|へんさ》の《積|せき》が《正|せい》', { color: 'a', shape: 'square' }], ['《偏差|へんさ》の《積|せき》が《負|ふ》', { color: 'b', style: 'dash', shape: 'square' }], ['はなれた《点|てん》（ドラッグできる）', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ check: 'hz', label: 'はなれた《点|てん》', text: '《加|くわ》える' }],
      init(st) { st.hz = false; st.pts = FIVE.map(p => p.slice()).concat([[12, 12]]); st.T = 0; },
      step(st, dt) { st.T = (st.T || 0) + dt; if (st.T > 1.5) { st.hz = true; return false; } },
      drag: { hit(st, x, y) { const v = cvView(V13); const p = st.pts[5]; return st.hz && A.near(x, y, v.X(p[0]), v.Y(p[1]), 26) ? 5 : null; }, move(st, x, y) { const [a, b] = cvView(V13).inv(x, y); st.pts[5] = [A.clamp(Math.round(a * 2) / 2, 0, 13), A.clamp(Math.round(b * 2) / 2, 0, 13)]; } },
      draw(cv, st) {
        const v = cv.view(V13);
        v.axes({ xt: [2, 4, 6, 8, 10, 12], yt: [2, 4, 6, 8, 10, 12], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        const P = st.hz ? st.pts : st.pts.slice(0, 5);
        scatter(v, P, P.length, null, { mark: st.hz ? 5 : -1 });
      },
      readout: st => { const P = st.hz ? st.pts : st.pts.slice(0, 5), s = stats(P); return `${P.length} つの《点|てん》：《共分散|きょうぶんさん》 ${A.num(s.cov, 2)}　　$r$＝**${A.num(s.r, 2)}**`; }
    },
    {
      key: 'magari', label: '④ 《曲|ま》がった《関係|かんけい》',
      lead: '5つの《点|てん》 $(-2,4)$・$(-1,1)$・$(0,0)$・$(1,1)$・$(2,4)$ は、どれも《放物線|ほうぶつせん》 $y=x^2$ の《上|うえ》にあります。とても《強|つよ》い《関係|かんけい》なのに、$r$ はいくつでしょう。',
      note: '《偏差|へんさ》の《積|せき》は $-4$、1、0、$-1$、4 で、たすと0。《共分散|きょうぶんさん》は0、$r=0$ です。《左|ひだり》《半分|はんぶん》は《右下|みぎさ》がり、《右半分|みぎはんぶん》は《右上|みぎあ》がりで、《正|せい》と《負|ふ》が《打|う》ち《消|け》し《合|あ》ったからです。$r$ が《表|あらわ》すのは、**《直線|ちょくせん》にどれだけ《近|ちか》いか**という《関係|かんけい》の《強|つよ》さです。$r=0$ でも、「《関係|かんけい》がない」とはかぎりません。',
      legend: [['《偏差|へんさ》の《積|せき》が《正|せい》', { color: 'a', shape: 'square' }], ['《偏差|へんさ》の《積|せき》が《負|ふ》', { color: 'b', style: 'dash', shape: 'square' }], ['$y=x^2$', { color: 'sub', style: 'dot' }]],
      init(st) { st.pts = PARA.map(p => p.slice()); st.k = 0; },
      step(st, dt) { st.k = Math.min(5, st.k + dt * 1.2); if (st.k >= 5) return false; },
      drag: dragPts(() => cvView(VPARA), [-3, 3], [-1, 5], 0.5, 0.5),
      draw(cv, st) {
        const v = cv.view(VPARA);
        v.axes({ xt: [-2, -1, 1, 2], yt: [1, 2, 3, 4], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        v.plot(x => x * x, { color: 'sub', style: 'dot', width: 2 });
        scatter(v, st.pts, Math.max(Math.floor(st.k + 1e-9), st.k >= 5 ? 5 : 0));
      },
      readout: st => { const s = stats(st.pts); return `《平均|へいきん》 (${A.num(s.mx, 1)}, ${A.num(s.my, 1)})　　《共分散|きょうぶんさん》 **${A.num(s.cov, 2)}**　　$r$＝**${A.num(s.r, 2)}**`; }
    }
  ]
});

function cvView(o) { return new A.View({ W: 880, H: 420 }, o); }
// 点をドラッグ（いちばん近い点をつかむ）
function dragPts(view, xr, yr, dx, dy) {
  return {
    hit(st, x, y) { const v = view(); let best = null, bd = 24; st.pts.forEach((p, i) => { const d = Math.hypot(v.X(p[0]) - x, v.Y(p[1]) - y); if (d < bd) { bd = d; best = i; } }); if (best != null) st.k = st.pts.length; return best; },
    move(st, x, y, api, i) { const [a, b] = view().inv(x, y); st.pts[i] = [A.clamp(Math.round(a / dx) * dx, xr[0], xr[1]), A.clamp(Math.round(b / dy) * dy, yr[0], yr[1])]; }
  };
}
// 散布図：平均の線と、平均の点からの長方形（先頭から m 個ぶん）
function scatter(v, P, m, names, o = {}) {
  const s = stats(P);
  v.line([[s.mx, v.y0], [s.mx, v.y1]], { color: 'sub', style: 'dot', width: 1.5 });
  v.line([[v.x0, s.my], [v.x1, s.my]], { color: 'sub', style: 'dot', width: 1.5 });
  for (let i = 0; i < Math.min(m, P.length); i++) {
    const [x, y] = P[i], pos = (x - s.mx) * (y - s.my) >= 0;
    v.poly([[s.mx, s.my], [x, s.my], [x, y], [s.mx, y]], { fill: pos ? 'a' : 'b', alpha: o.faint ? 0.08 : 0.16, color: pos ? 'a' : 'b', style: pos ? 'solid' : 'dash', width: o.faint ? 0.8 : 1.5 });
  }
  P.forEach(([x, y], i) => {
    v.dot(x, y, i === o.mark ? { color: 'b', shape: 'diamond', r: 8 } : { color: 'ink', r: o.faint ? 4 : 5.5 });
    if (names) v.cv.text(names[i], v.X(x) + 8, v.Y(y) - 10, { size: 15, bold: true });
  });
  v.dot(s.mx, s.my, { color: 'ink', shape: 'cross', r: 7 });
}
