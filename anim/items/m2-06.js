// @id m2-06
// @title 《反比例|はんぴれい》のグラフ：《面積|めんせき》12の《長方形|ちょうほうけい》
// @vol 数学3
// @from 数学 3-7②③④⑥（ch3-07:184・236・271・366）／熱-3、5-4・5-14 でも使う
'use strict';
// 本の数：y=12/x（面積 12 cm² の長方形）。x=1,2,3,4,6,12 → 12,6,4,3,2,1。注射器 pV=2000（20 mL で 101 kPa …）
const f = x => 12 / x;
const nn = v => A.num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : Math.abs(v) >= 0.1 ? 2 : 4);
const V1o = { x0: 0, x1: 13.5, y0: 0, y1: 13.5, box: [200, 14, 480, 372], equal: true };
function V1() { return new A.View({ W: 880, H: 420 }, V1o); }
const DATA = [[20, 101], [16, 125], [12, 168], [10, 201], [8, 249], [5, 402]];
A.item({
  id: 'm2-06', title: '《反比例|はんぴれい》のグラフ：《面積|めんせき》12の《長方形|ちょうほうけい》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-7②③④⑥「《軸|じく》に《近|ちか》づくけれど、くっつかない」「$pV$ が《一定|いってい》」の《図|ず》から（《物理|ぶつり》 《熱|ねつ》-3、《第|だい》5《巻|かん》 5-4・5-14 でも《使|つか》う）',
  W: 880, H: 420,
  state: { x: 4, a: 12, V: 20 },
  scenes: [
    {
      key: 'menseki', label: '① 《面積|めんせき》12の《長方形|ちょうほうけい》',
      lead: 'グラフの《上|うえ》の《点|てん》 $(x,\\ y)$ と《原点|げんてん》を、《向|む》かい《合|あ》う《角|かど》にした《長方形|ちょうほうけい》をかきます。《点|てん》をドラッグして《動|うご》かしましょう（▶ でも《動|うご》きます）。',
      note: '《横|よこ》が $x$、たてが $y$ なので、《面積|めんせき》は $xy=12$ です。《点|てん》が《右|みぎ》へ《行|い》くほど、《長方形|ちょうほうけい》は《横|よこ》に《長|なが》く、うすくなります。でも、《面積|めんせき》を12のままにするには、《高|たか》さを0にすることはできません。',
      legend: [['$y=\\frac{12}{x}$', { color: 'a' }], ['《面積|めんせき》12の《長方形|ちょうほうけい》', { color: 'b', shape: 'square' }], ['《点|てん》 $(x,\\ y)$（ドラッグできる）', { color: 'b', shape: 'diamond', noline: true }], ['《表|ひょう》の《点|てん》', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ range: 'x', label: '《横|よこ》 $x$', min: 0.8, max: 13, step: 0.1, d: 1 }],
      init(st) { st.x = 1; st.t = 0; },
      step(st, dt) { st.t += dt; st.x = Math.min(12, 1 + st.t * 1.4); if (st.x >= 12) return false; },
      drag: { hit(st, x, y) { const v = V1(); return A.near(x, y, v.X(st.x), v.Y(f(st.x)), 26) ? 1 : null; }, move(st, x) { st.x = A.clamp(Math.round(V1().inv(x, 0)[0] * 10) / 10, 0.8, 13); } },
      draw(cv, st) {
        const v = cv.view(V1o);
        v.axes({ xt: [1, 2, 3, 4, 6, 12], yt: [1, 2, 3, 4, 6, 12], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        const x = st.x, y = f(x);
        v.poly([[0, 0], [x, 0], [x, y], [0, y]], { fill: 'b', alpha: 0.2, color: 'b', width: 2 });
        v.plot(f, { x0: 0.85, x1: 13.5, color: 'a', width: 3.5 });
        for (const p of [1, 2, 3, 4, 6, 12]) v.dot(p, f(p), { color: 'ink', r: 4 });
        v.dot(x, y, { color: 'b', shape: 'diamond', r: 8 });
        v.text(`${nn(x)} × ${nn(y)} ＝ 12`, x / 2, Math.min(y, 13) / 2, { align: 'center', size: 16, bold: true, bg: true });
      },
      readout: st => `$x$＝${nn(st.x)}　　$y=12÷${nn(st.x)}$＝${nn(f(st.x))}　　$x\\times y$＝**12**`
    },
    {
      key: 'kuttsukanai', label: '② 《軸|じく》にくっつかない',
      lead: '$x$ をうんと《大|おお》きくしていくと、グラフは $x$ 《軸|じく》にくっつくでしょうか。▶ を《押|お》すと、$x$ を 12 → 120 → 1200 … と《大|おお》きくして、たての《目|め》もりを《拡大|かくだい》します。',
      note: 'どんなに《小|ちい》さい《数|かず》を《決|き》めても、$y$ をそれより《小|ちい》さくできます。それでも $y$ は0にはなりません。グラフは $x$ 《軸|じく》にも $y$ 《軸|じく》にも、**《近|ちか》づくけれど、くっつかない**のです。',
      miss: 'グラフを、《右|みぎ》のはしで $x$ 《軸|じく》につなげてかくのはまちがい。くっついた《所|ところ》では $y=0$ ですが、$x\\times0=0$ は12になりません。グラフの《上|うえ》の《点|てん》は、どれも $xy=12$ です。',
      legend: [['$y=\\frac{12}{x}$', { color: 'a' }], ['いまの《点|てん》', { color: 'b', shape: 'diamond', noline: true }], ['$x$ 《軸|じく》（$y=0$）', { color: 'ink' }]],
      controls: [{ range: 'x', label: '$x$（10 の《何乗|なんじょう》か）', min: 1, max: 6, step: 0.01, fmt: v => nn(12 * 10 ** (v - 1)) }],
      init(st) { st.x = 1; },
      step(st, dt) { st.x = Math.min(6, st.x + dt * 0.5); if (st.x >= 6) return false; },
      draw(cv, st) {
        const X = 12 * 10 ** (st.x - 1), Y = 12 / X;
        // 横は X の 1.2 倍まで、たては Y の 6 倍まで見る（いまの点が、いつも同じ高さに見える）
        const v = cv.view({ x0: 0, x1: X * 1.25, y0: 0, y1: Y * 6, box: [80, 20, 760, 360] });
        v.axes({ xt: [X / 2, X], yt: [Y, Y * 2, Y * 4], fmt: nn, xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        v.plot(f, { x0: X * 0.15, x1: X * 1.25, color: 'a', width: 3.5, n: 400 });
        v.dot(X, Y, { color: 'b', shape: 'diamond', r: 8 });
        v.line([[X, 0], [X, Y]], { color: 'sub', style: 'dot', width: 1.5 });
        cv.text(`たての めもり：1めもり ${nn(Y)}`, 840, 30, { align: 'right', size: 15, color: 'sub' });
        cv.text('すきまは なくならない', v.X(X) + 12, v.Y(Y / 2), { size: 15, color: 'b', bold: true, bg: true });
      },
      readout: st => { const X = 12 * 10 ** (st.x - 1); return `$x$＝${nn(X)}　　$y=12÷${nn(X)}$＝**${nn(12 / X)}**　（0 ではない）`; }
    },
    {
      key: 'a', label: '③ $a$ を《変|か》える',
      lead: '$y=\\frac{a}{x}$ の $a$ を《変|か》えると、グラフはどう《変|か》わるでしょう。$x$ が《負|ふ》のがわも《見|み》ます。',
      note: '$a$ が《大|おお》きいほど、《曲線|きょくせん》は《原点|げんてん》から《遠|とお》い《所|ところ》を《通|とお》ります（《面積|めんせき》 $a$ の《長方形|ちょうほうけい》の《角|かど》をつないだ《線|せん》）。$a$ が《負|ふ》なら、《枝|えだ》は《右下|みぎした》と《左上|ひだりうえ》の《区画|くかく》に《入|はい》ります。2《本|ほん》の《枝|えだ》は $x=0$ のところでつながりません。',
      miss: '「《反比例|はんぴれい》は、ふえるとへる」とはかぎりません。$a<0$ のとき、$x>0$ の《枝|えだ》は《右上|みぎあ》がりです（$y=-\\frac{6}{x}$：$x=1$ で $-6$、$x=2$ で $-3$）。',
      legend: [['$y=\\frac{a}{x}$', { color: 'a' }], ['$y=\\frac{12}{x}$（くらべる）', { color: 'sub', style: 'dash' }], ['$x=2$ の《点|てん》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'a', label: '$a$', min: -24, max: 24, step: 1, d: 0 }],
      init(st) { st.a = 4; st.t = 0; },
      step(st, dt) { st.t += dt; const seq = [4, 12, 24, -12, -6]; const k = Math.min(seq.length - 1, Math.floor(st.t / 1.6)); st.a = seq[k]; if (st.t > seq.length * 1.6) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: -13.5, x1: 13.5, y0: -13.5, y1: 13.5, box: [200, 14, 480, 392], equal: true });
        v.axes({ xt: [-12, -6, 6, 12], yt: [-12, -6, 6, 12], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        const g = a => x => a / x;
        v.plot(g(12), { x0: 0.5, x1: 13.5, color: 'sub', style: 'dash', width: 1.5 }); v.plot(g(12), { x0: -13.5, x1: -0.5, color: 'sub', style: 'dash', width: 1.5 });
        if (st.a !== 0) { v.plot(g(st.a), { x0: 0.02, x1: 13.5, color: 'a', width: 3.5, n: 600 }); v.plot(g(st.a), { x0: -13.5, x1: -0.02, color: 'a', width: 3.5, n: 600 }); }
        else v.line([[-13.5, 0], [13.5, 0]], { color: 'a', width: 3.5 });
        v.dot(2, st.a / 2, { color: 'b', shape: 'square', r: 6 });
        v.text(`(2, ${nn(st.a / 2)})`, 2.6, st.a / 2 + (st.a >= 0 ? 1 : -1), { size: 15, color: 'b', bold: true, bg: true });
      },
      readout: st => `$y=\\frac{${st.a}}{x}$　　$x=2$ のとき $y$＝${nn(st.a / 2)}　　${st.a > 0 ? '《枝|えだ》は《右上|みぎうえ》と《左下|ひだりした》' : st.a < 0 ? '《枝|えだ》は《右下|みぎした》と《左上|ひだりうえ》（$x>0$ では《右上|みぎあ》がり）' : '$a=0$ は《反比例|はんぴれい》ではない'}`
    },
    {
      key: 'piston', label: '④ 《注射器|ちゅうしゃき》の《空気|くうき》',
      lead: '《注射器|ちゅうしゃき》の《空気|くうき》をおしちぢめます。▶ を《押|お》すと、ピストンがゆっくり《進|すす》みます（《速|はや》くおすと、《空気|くうき》の《温度|おんど》が《上|あ》がってしまうので、ゆっくり）。',
      note: '$p\\times V$ はどれも2000の《近|ちか》くです（はかった《値|あたい》は2000の《近|ちか》く：2020、2000、2016、2010、1992、2010）。$p=\\frac{2000}{V}$ の《反比例|はんぴれい》です。《体積|たいせき》を《半分|はんぶん》の 10 mL にすると《圧力|あつりょく》は《約|やく》2《倍|ばい》、$\\frac{1}{4}$ の 5 mL なら《約|やく》4《倍|ばい》。《体積|たいせき》を0に《近|ちか》づけるほど《圧力|あつりょく》はどこまでも《大|おお》きくなり、《空気|くうき》を0にすることはできません。',
      legend: [['$p=\\frac{2000}{V}$', { color: 'a' }], ['はかった《点|てん》', { color: 'ink', shape: 'circle', noline: true }], ['いまの《体積|たいせき》と《圧力|あつりょく》', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'V', label: '《体積|たいせき》 $V$〔mL〕', min: 3, max: 20, step: 0.5, d: 1 }],
      init(st) { st.V = 20; },
      step(st, dt) { st.V = Math.max(3, st.V - dt * 3); if (st.V <= 3) return false; },
      draw(cv, st) {
        // 左：注射器（20 mL を 300 px）
        const sx = 40, sy = 120, len = 300, h = 70, w = st.V / 20 * len;
        cv.rect(sx, sy, len + 20, h, { color: 'sub', width: 2 });
        cv.rect(sx, sy, w, h, { fill: 'a', alpha: 0.18 });
        // 空気のつぶ（同じ数が、せまい所につめこまれる）
        const r = A.rng(7);
        for (let k = 0; k < 40; k++) { const px = sx + 6 + r() * (w - 12), py = sy + 6 + r() * (h - 12); cv.circle(px, py, 2.5, { fill: 'a', alpha: 0.8, color: 'a', width: 1 }); }
        cv.rect(sx + w, sy + 3, 10, h - 6, { fill: 'ink', alpha: 0.8 });
        cv.line([[sx + w + 10, sy + h / 2], [sx + len + 70, sy + h / 2]], { color: 'ink', width: 6 });
        cv.rect(sx - 14, sy + h / 2 - 6, 14, 12, { fill: 'ink', alpha: 0.8 });
        for (let m = 0; m <= 20; m += 5) { const x = sx + m / 20 * len; cv.line([[x, sy + h], [x, sy + h + 8]], { color: 'sub', width: 1.5 }); cv.text(String(m), x, sy + h + 20, { align: 'center', size: 14, color: 'sub' }); }
        cv.text('mL', sx + len + 30, sy + h + 20, { size: 14, color: 'sub' });
        cv.text(`${nn(st.V)} mL`, sx + 10, sy - 16, { size: 16, bold: true });
        cv.text(`${nn(2000 / st.V)} kPa`, sx + 10, sy + h + 54, { size: 16, bold: true, color: 'b' });
        cv.text(`はじめの ${nn(2000 / st.V / 100)} ばい`, sx + 10, sy + h + 80, { size: 15, color: 'b' });
        // 右：グラフ
        const v = cv.view({ x0: 0, x1: 23, y0: 0, y1: 700, box: [460, 20, 390, 360] });
        v.axes({ xt: [5, 10, 15, 20], yt: [100, 200, 300, 400, 500, 600], xl: 'V（mL）', yl: 'p（kPa）', yfmt: v => v % 200 ? '' : String(v) });
        v.plot(V => 2000 / V, { x0: 2.9, x1: 22.5, color: 'a', width: 3 });
        for (const [V, p] of DATA) v.dot(V, p, { color: 'ink', r: 4 });
        v.dot(st.V, 2000 / st.V, { color: 'b', shape: 'diamond', r: 8 });
        v.line([[st.V, 0], [st.V, 2000 / st.V]], { color: 'b', style: 'dot', width: 1.5 });
      },
      readout: st => `《体積|たいせき》 $V$＝${nn(st.V)} mL　　《圧力|あつりょく》 $p=2000÷${nn(st.V)}$＝**${nn(2000 / st.V)} kPa**　　$p\\times V$＝2000`
    }
  ]
});

