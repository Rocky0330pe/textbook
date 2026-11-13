// @id m2-09
// @title はかるたびに《平均|へいきん》は《落|お》ち《着|つ》く
// @vol 数学3
// @from 数学 3-13①（ch3-13:151）・3-17①（ch3-17:93）・3-14⑤（ch3-14:435）／物理の実験、原-14、9-4 でも使う
'use strict';
// 本の数：ふりこ（糸 50 cm）の10往復を20人がはかった値。ほんとうの値 14.19 秒。20人の平均 14.20 秒、σ は約 0.108 秒。
//          σ/√n：4回で半分、100回で 1/10。コインの《表|おもて》の割合は 0.5 に、サイコロの1の目は 1/6。
const FURI = [14.37, 14.29, 14.24, 14.12, 14.21, 14.17, 14.33, 14.15, 14.22, 14.19, 14.16, 13.95, 14.18, 14.23, 14.16, 14.27, 14.07, 14.20, 14.44, 14.05];
const TRUE = 14.19, SIG = 0.108;
// 乱数で作る「はかった値」（種を決めて、毎回同じ）
const SIM = (() => { const r = A.rng(2026), a = []; for (let k = 0; k < 400; k++) a.push(TRUE + SIG * A.gauss(r)); return a; })();
const COIN = (() => { const out = []; for (const [seed, first] of [[11, []], [29, [0, 0, 0, 0, 0, 0]]]) { const r = A.rng(seed), a = first.slice(); while (a.length < 1000) a.push(r() < 0.5 ? 1 : 0); out.push(a); } return out; })();
// サイコロ：組ごとの6つの目（種を決めて、毎回同じ）
const DICE = (() => { const r = A.rng(6), a = []; for (let g = 0; g < 300; g++) { const row = []; for (let k = 0; k < 6; k++) row.push(1 + Math.floor(r() * 6)); a.push(row); } return a; })();
function cnt(G) { const c = [0, 0, 0, 0]; for (let g = 0; g < G; g++) { const m = DICE[g].filter(d => d === 1).length; c[Math.min(3, m)]++; } return c; }
const mean = (a, n) => { let s = 0; for (let k = 0; k < n; k++) s += a[k]; return s / n; };
A.item({
  id: 'm2-09', title: 'はかるたびに《平均|へいきん》は《落|お》ち《着|つ》く', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-13①「《何回|なんかい》もはかって、《平均|へいきん》する」・3-14⑤「ずれは $\\frac{\\sigma}{\\sqrt{n}}$」・3-17①「《割合|わりあい》が《落|お》ち《着|つ》く」の《図|ず》から（《物理|ぶつり》の《実験|じっけん》、《原|げん》-14、《第|だい》9《巻|かん》 9-4 でも《使|つか》う）',
  W: 880, H: 420,
  state: { n: 1, g: 0 },
  scenes: [
    {
      key: 'furiko', label: '① ふりこを20《人|にん》で',
      lead: 'ふりこの10《往復|おうふく》の《時間|じかん》を、20《人|にん》がはかりました。▶ を《押|お》すと、1《人|にん》ずつ《値|あたい》を《足|た》して、それまでの《平均|へいきん》を《求|もと》めます。',
      note: '1《人|にん》ずつの《値|あたい》（《灰色|はいいろ》）は《上|うえ》にも《下|した》にもちらばりますが、《人数|にんずう》をふやした《平均|へいきん》（《青|あお》）は、ほんとうの《値|あたい》 14.19 《秒|びょう》（《緑|みどり》の《点線|てんせん》）に《近|ちか》づいていきます。おすのがおくれたり《早|はや》すぎたりするずれが、たくさん《集|あつ》めると《打|う》ち《消|け》しあうからです。',
      legend: [['1《人|にん》ずつの《値|あたい》', { color: 'sub', shape: 'circle', noline: true }], ['それまでの《平均|へいきん》', { color: 'a', shape: 'square' }], ['ほんとうの《値|あたい》 14.19', { color: 'c', style: 'dash' }]],
      controls: [{ range: 'n', label: '《何人|なんにん》《分|ぶん》か', min: 1, max: 20, step: 1, d: 0 }],
      init(st) { st.n = 1; st.t = 0; },
      step(st, dt) { st.t += dt; st.n = Math.min(20, 1 + Math.floor(st.t / 0.6)); if (st.n >= 20) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: 0, x1: 21, y0: 13.9, y1: 14.5, box: [80, 20, 760, 360] });
        v.axes({ xt: [1, 5, 10, 15, 20], yt: [14.0, 14.1, 14.2, 14.3, 14.4, 14.5], ax: 13.9, ay: 0, yfmt: y => A.num(y, 2), xl: 'なんにんぶん', yl: 'じかん（びょう）' });
        v.line([[0, TRUE], [21, TRUE]], { color: 'c', style: 'dash', width: 2 });
        const n = st.n, ms = [];
        for (let k = 1; k <= n; k++) { v.dot(k, FURI[k - 1], { color: 'sub', r: 5 }); ms.push([k, mean(FURI, k)]); }
        v.line(ms, { color: 'a', width: 3 });
        for (const [k, m] of ms) v.dot(k, m, { color: 'a', shape: 'square', r: 5 });
        v.text(`へいきん ${A.num(mean(FURI, n), 3)}`, n > 14 ? n - 0.3 : n + 0.3, mean(FURI, n) + 0.03, { size: 15, color: 'a', bold: true, bg: true, align: n > 14 ? 'right' : 'left' });
      },
      readout: st => `${st.n} 《人|にん》《分|ぶん》　　《合計|ごうけい》 ${A.num(mean(FURI, st.n) * st.n, 2)} 《秒|びょう》　　《平均|へいきん》 **${A.num(mean(FURI, st.n), 3)} 《秒|びょう》**　　ほんとうの《値|あたい》とのずれ ${A.num(Math.abs(mean(FURI, st.n) - TRUE), 3)} 《秒|びょう》`
    },
    {
      key: 'obi', label: '② ずれは $\\frac{\\sigma}{\\sqrt{n}}$',
      lead: '《同|おな》じはかり《方|かた》で、もっとたくさんはかります（1《回|かい》のずれ $\\sigma$ は《約|やく》 0.108 《秒|びょう》）。《平均|へいきん》のまわりの《帯|おび》（《平均|へいきん》のずれ $\\frac{\\sigma}{\\sqrt{n}}$）は、どう《細|ほそ》くなるでしょう。',
      note: '$n$ 《回|かい》はかって《平均|へいきん》すると、《平均|へいきん》のずれは $\\frac{\\sigma}{\\sqrt{n}}$。4《回|かい》で《半分|はんぶん》、16《回|かい》で $\\frac{1}{4}$、100《回|かい》で $\\frac{1}{10}$ になります。ずれを《半分|はんぶん》にするのに、《回数|かいすう》は2《倍|ばい》ではなく4《倍|ばい》もいります。',
      miss: '《平均|へいきん》のずれを $n$ でわるのはまちがい。$\\sigma$ 0.12 《秒|びょう》で4《回|かい》なら、$0.12÷4=0.03$ ではなく、$0.12÷\\sqrt{4}=0.06$。ずれは《全部|ぜんぶ》は《打|う》ち《消|け》しあいません。',
      legend: [['1《回|かい》ずつの《値|あたい》', { color: 'sub', shape: 'circle', noline: true }], ['それまでの《平均|へいきん》', { color: 'a' }], ['《平均|へいきん》 $\\pm\\frac{\\sigma}{\\sqrt{n}}$ の《帯|おび》', { color: 'a', shape: 'square', style: 'dot' }], ['ほんとうの《値|あたい》', { color: 'c', style: 'dash' }]],
      controls: [{ range: 'n', label: '《回数|かいすう》 $n$', min: 1, max: 400, step: 1, d: 0 }],
      init(st) { st.n = 1; },
      step(st, dt) { st.n = Math.min(400, st.n + Math.max(1, Math.round(dt * (st.n < 40 ? 12 : 60)))); if (st.n >= 400) return false; },
      draw(cv, st) {
        // 横は √n の目もり（1・4・16・64・100・400 が見やすいように）
        const sx = n => Math.sqrt(n);
        const v = cv.view({ x0: 0, x1: 21, y0: 13.85, y1: 14.53, box: [80, 20, 760, 360] });
        v.axes({ xt: [1, 2, 4, 8, 10, 20], yt: [13.9, 14.0, 14.1, 14.2, 14.3, 14.4, 14.5], ax: 13.85, ay: 0, xfmt: x => String(x * x), yfmt: y => A.num(y, 1), xl: 'かいすう n', yl: 'びょう' });
        const n = Math.round(st.n), up = [], dn = [], ms = [];
        for (let k = 1; k <= n; k++) { const m = mean(SIM, k), e = SIG / Math.sqrt(k); ms.push([sx(k), m]); up.push([sx(k), m + e]); dn.push([sx(k), m - e]); }
        v.poly(up.concat(dn.reverse()), { fill: 'a', alpha: 0.18, color: 'a', style: 'dot', width: 1 });
        v.clip(() => { for (let k = 1; k <= n; k += (k < 60 ? 1 : 3)) v.dot(sx(k), SIM[k - 1], { color: 'sub', r: 2.5 }); });
        v.line([[0, TRUE], [21, TRUE]], { color: 'c', style: 'dash', width: 2 });
        v.line(ms, { color: 'a', width: 2.5 });
        for (const k of [1, 4, 16, 64]) if (k <= n) { const e = SIG / Math.sqrt(k); v.line([[sx(k), TRUE - e], [sx(k), TRUE + e]], { color: 'ink', width: 2 }); v.text(`±${A.num(e, 3)}`, sx(k) + 0.15, TRUE + e + 0.012, { size: 14, bg: true }); }
      },
      readout: st => `$n$＝${Math.round(st.n)}　　《平均|へいきん》＝${A.num(mean(SIM, Math.round(st.n)), 3)} 《秒|びょう》　　《平均|へいきん》のずれ $\\frac{\\sigma}{\\sqrt{n}}=\\frac{0.108}{${A.num(Math.sqrt(st.n), 2)}}$＝**${A.num(SIG / Math.sqrt(st.n), 3)} 《秒|びょう》**`
    },
    {
      key: 'coin', label: '③ コインの《割合|わりあい》',
      lead: 'ソラさんとミナさんが、コインを1000《回|かい》ずつ《投|な》げます。それまでの《表|おもて》の《割合|わりあい》は、どう《変|か》わるでしょう。▶ を《押|お》してみましょう。',
      note: 'はじめの10《回|かい》くらいまでは、《割合|わりあい》は《大|おお》きくゆれます（ミナさんは、はじめに6《回|かい》《続|つづ》けて《裏|うら》が《出|で》たので0）。でも、《何百回|なんびゃっかい》と《投|な》げていくと、《2人|ふたり》とも0.5の《近|ちか》くに《落|お》ち《着|つ》きます。この《近|ちか》づいていく《数|かず》が、《表|おもて》が《出|で》る**《確率|かくりつ》** $\\frac{1}{2}$ です。',
      miss: '「5《回|かい》《続|つづ》けて《裏|うら》が《出|で》たから、《次|つぎ》は《表|おもて》が《出|で》やすい」はまちがい。コインには《記憶|きおく》がありません。《次|つぎ》も《表|おもて》の《確率|かくりつ》は $\\frac{1}{2}$。《割合|わりあい》が0.5に《近|ちか》づくのは、《何百回|なんびゃっかい》もくり《返|かえ》して、はじめのかたよりがうすまるからです。',
      legend: [['ソラさん', { color: 'a' }], ['ミナさん', { color: 'b', style: 'dash' }], ['0.5', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'n', label: '《投|な》げた《回数|かいすう》', min: 1, max: 1000, step: 1, d: 0 }],
      init(st) { st.n = 1; },
      step(st, dt) { st.n = Math.min(1000, st.n + Math.max(1, Math.round(dt * (st.n < 30 ? 8 : st.n < 200 ? 60 : 200)))); if (st.n >= 1000) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: 0, x1: 1000, y0: 0, y1: 1.05, box: [80, 20, 760, 360] });
        v.axes({ xt: A.range(100, 1000, 100), yt: [0.25, 0.5, 0.75, 1], yfmt: y => A.num(y, 2), xl: 'なげた かいすう', yl: 'おもての わりあい' });
        v.line([[0, 0.5], [1000, 0.5]], { color: 'sub', style: 'dot', width: 2 });
        const n = Math.round(st.n);
        [[0, 'a', 'solid'], [1, 'b', 'dash']].forEach(([i, c, s]) => {
          let h = 0; const pts = [];
          for (let k = 1; k <= n; k++) { h += COIN[i][k - 1]; pts.push([k, h / k]); }
          v.line(pts, { color: c, style: s, width: 2.5 });
          v.dot(n, h / n, { color: c, shape: i ? 'square' : 'circle', r: 6 });
        });
      },
      readout: st => { const n = Math.round(st.n), r = i => COIN[i].slice(0, n).reduce((a, b) => a + b, 0) / n; return `${n} 《回|かい》：ソラさん **${A.num(r(0), 3)}**　ミナさん **${A.num(r(1), 3)}**`; }
    },
    {
      key: 'sai', label: '④ 6《回|かい》で《必|かなら》ず1《回|かい》？',
      lead: 'サイコロを6《回|かい》ふって、1の《目|め》が《何回|なんかい》《出|で》るかを《数|かぞ》えます。これを《何|なん》《組|くみ》もくり《返|かえ》します。▶ を《押|お》すと、1《組|くみ》ずつふります。',
      miss: '「《確率|かくりつ》 $\\frac{1}{6}$ なら、6《回|かい》ふれば1の《目|め》は《必|かなら》ず1《回|かい》《出|で》る」はまちがい。6《回|かい》ふって、1の《目|め》が1《回|かい》も《出|で》ないことも（3《組|くみ》に1《組|くみ》くらい）、2《回|かい》《以上|いじょう》《出|で》ることもあります。《確率|かくりつ》は、たくさんくり《返|かえ》したときの《割合|わりあい》です。',
      note: '6《回|かい》で1の《目|め》が0《回|かい》になる《確率|かくりつ》は $\\left(\\frac{5}{6}\\right)^6=0.335$、1《回|かい》は 0.402、2《回|かい》は 0.201、3《回|かい》《以上|いじょう》は 0.062 です（《点線|てんせん》）。《組|くみ》の《数|かず》をふやすほど、《柱|はしら》は《点線|てんせん》に《近|ちか》づきます。',
      legend: [['《組|くみ》の《割合|わりあい》（《柱|はしら》）', { color: 'a', shape: 'square' }], ['《確率|かくりつ》（《点線|てんせん》）', { color: 'b', style: 'dash' }], ['1の《目|め》', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'g', label: '《組|くみ》の《数|かず》', min: 0, max: 300, step: 1, d: 0 }],
      init(st) { st.g = 0; },
      step(st, dt) { st.g = Math.min(300, st.g + (st.g < 12 ? dt * 2 : dt * 40)); if (st.g >= 300) return false; },
      draw(cv, st) { drawSai(cv, st); },
      readout: st => { const c = cnt(Math.floor(st.g)), G = Math.floor(st.g); return G ? `${G} 《組|くみ》：1の《目|め》が0《回|かい》 ${c[0]} 《組|くみ》（${A.num(c[0] / G, 3)}）、1《回|かい》 ${c[1]} 《組|くみ》、2《回|かい》 ${c[2]} 《組|くみ》、3《回|かい》《以上|いじょう》 ${c[3]} 《組|くみ》` : '▶ を《押|お》して、ふりはじめよう'; }
    }
  ]
});

function die(cv, x, y, s, n) {
  cv.rect(x, y, s, s, { fill: n === 1 ? 'b' : 'panel', alpha: n === 1 ? 0.25 : 1, color: 'ink', width: 1.5 });
  const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n];
  for (const [i, j] of P) cv.circle(x + s / 2 + i * s * 0.27, y + s / 2 + j * s * 0.27, n === 1 ? s * 0.13 : s * 0.08, { fill: n === 1 ? 'b' : 'ink', alpha: 1, color: n === 1 ? 'b' : 'ink', width: 1 });
  if (n === 1) cv.dot(x + s - 4, y + 4, { color: 'b', shape: 'diamond', r: 3 });
}
function drawSai(cv, st) {
  const G = Math.floor(st.g);
  // 左：さいごの5組
  cv.text('さいごの くみ', 30, 26, { size: 15, color: 'sub' });
  for (let r = 0; r < 5; r++) {
    const g = G - 1 - r; if (g < 0) break;
    const y = 46 + r * 62, ones = DICE[g].filter(d => d === 1).length;
    DICE[g].forEach((d, k) => die(cv, 30 + k * 50, y, 42, d));
    cv.text(`1が ${ones}かい`, 340, y + 21, { size: 15, bold: true, color: ones ? 'b' : 'sub' });
  }
  // 右：0・1・2・3以上 の割合
  const v = cv.view({ x0: -0.6, x1: 3.6, y0: 0, y1: 0.6, box: [470, 30, 380, 330] });
  v.axes({ xt: [0, 1, 2, 3], yt: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: x => x === 3 ? '3いじょう' : x + 'かい', yfmt: y => A.num(y, 1), zero: true, ay: -0.6 });
  const P = [Math.pow(5 / 6, 6), 6 * (1 / 6) * Math.pow(5 / 6, 5), 15 / 36 * Math.pow(5 / 6, 4)]; P.push(1 - P[0] - P[1] - P[2]);
  const c = cnt(G);
  for (let k = 0; k < 4; k++) {
    if (G) v.poly([[k - 0.3, 0], [k + 0.3, 0], [k + 0.3, c[k] / G], [k - 0.3, c[k] / G]], { fill: 'a', alpha: 0.4, color: 'a', width: 1.5 });
    v.line([[k - 0.38, P[k]], [k + 0.38, P[k]]], { color: 'b', style: 'dash', width: 2.5 });
  }
  v.text(`${G} くみ`, 3.5, 0.56, { align: 'right', size: 15, bold: true });
}
