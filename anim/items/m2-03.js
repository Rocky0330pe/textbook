// @id m2-03
// @title 《放物線|ほうぶつせん》を《動|うご》かす：a・p・q と《範囲|はんい》
// @vol 数学3
// @from 数学 3-9③⑤⑥⑦（ch3-09:255・289・404・477・551・562）／3-10、4-8⑦、5-2 でも使う
'use strict';
// 数は本と同じ：a=2・1・1/2・−1、y=(x−2)²+1、y=x²+6x+10=(x+3)²+1、y=x²（1≦x≦3 と −1≦x≦2）
const n1 = v => A.num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : Math.abs(v * 2 - Math.round(v * 2)) < 1e-9 ? 1 : 2);
// 「x−2」「x+3」「x」のように、符号を整えて書く
const xm = p => Math.abs(p) < 1e-9 ? 'x' : p > 0 ? `(x-${n1(p)})` : `(x+${n1(-p)})`;
const pl = q => Math.abs(q) < 1e-9 ? '' : q > 0 ? `+${n1(q)}` : `-${n1(-q)}`;
const co = a => Math.abs(a - 1) < 1e-9 ? '' : Math.abs(a + 1) < 1e-9 ? '-' : n1(a);
const VIEW = { x0: -5.5, x1: 5.5, y0: -6, y1: 10.5, box: [50, 18, 780, 390] };
A.item({
  id: 'm2-03', title: '《放物線|ほうぶつせん》を《動|うご》かす：a・p・q と《範囲|はんい》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-9③⑤⑥⑦「《放物線|ほうぶつせん》を《動|うご》かす」「《平方完成|へいほうかんせい》で、《頂点|ちょうてん》を《見|み》つける」「《範囲|はんい》があるときの、《最大|さいだい》と《最小|さいしょう》」の《図|ず》から（3-10、4-8、5-2 でも《使|つか》う）',
  W: 880, H: 420,
  state: { a: 1, p: 0, q: 0, s: 1, e: 3, b: 0, c: 10, t: 0 },
  scenes: [
    {
      key: 'a', label: '① $a$ で《形|かたち》が《変|か》わる',
      lead: '$y=ax^2$ の $a$ を《変|か》えると、《放物線|ほうぶつせん》の《形|かたち》はどう《変|か》わるでしょう。▶ を《押|お》すと、$a$ が2から $-2$ まで《変|か》わります。',
      note: '$a>0$ なら**《上|うえ》に《開|ひら》いた《形|かたち》**（《頂点|ちょうてん》がいちばん《低|ひく》い）、$a<0$ なら**《下|した》に《開|ひら》いた《形|かたち》**（《頂点|ちょうてん》がいちばん《高|たか》い）。$a$ の《大|おお》きさ（《符号|ふごう》をのぞいた《大|おお》きさ）が《大|おお》きいほど、《細|ほそ》い《形|かたち》になります。$x=2$ のときの $y$ は $a\\times4$ で、$a$ に《比例|ひれい》します。',
      legend: [['$y=ax^2$', { color: 'a' }], ['$y=x^2$（くらべる）', { color: 'sub', style: 'dash' }], ['$x=2$ の《点|てん》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'a', label: '$a$', min: -3, max: 3, step: 0.05, d: 2 }],
      step(st, dt) { st.t += dt; st.a = Math.round(2 * Math.cos(st.t * 0.6) * 20) / 20; if (st.t > Math.PI / 0.6) { st.t = 0; return false; } },
      init(st) { st.a = 2; st.t = 0; },
      draw(cv, st) { const v = base(cv); v.plot(x => x * x, { color: 'sub', style: 'dash', width: 2 }); v.plot(x => st.a * x * x, { color: 'a', width: 3.5 }); v.dot(2, 4 * st.a, { color: 'b', shape: 'square', r: 6 }); v.text(`(2, ${n1(4 * st.a)})`, 2.2, 4 * st.a, { size: 15, color: 'b', bg: true }); v.dot(0, 0, { color: 'ink', r: 5 }); },
      readout: st => `$y=${co(st.a)}x^2$　　（$a$＝${A.num(st.a, 2)}：${st.a > 0 ? '《上|うえ》に《開|ひら》いた《形|かたち》' : st.a < 0 ? '《下|した》に《開|ひら》いた《形|かたち》' : '$x$ 《軸|じく》そのもの（《放物線|ほうぶつせん》ではない）'}）`
    },
    {
      key: 'idou', label: '② 《右|みぎ》へ $p$、《上|うえ》へ $q$',
      lead: '$y=a(x-p)^2+q$ は、$y=ax^2$ を《右|みぎ》へ $p$、《上|うえ》へ $q$ 《動|うご》かした《放物線|ほうぶつせん》です。▶ で $y=(x-2)^2+1$ を《作|つく》ります。',
      note: '《頂点|ちょうてん》は $(p,\\ q)$、《軸|じく》は《直線|ちょくせん》 $x=p$。$p$ がマイナスなら《左|ひだり》へ、$q$ がマイナスなら《下|した》へ《動|うご》かします。',
      miss: '$y=(x-2)^2+1$ の《頂点|ちょうてん》は $(-2,\\ 1)$ ではありません。$x-2=0$ になる $x=2$ が《頂点|ちょうてん》なので、$(2,\\ 1)$ です。「かっこの《中|なか》が0になる $x$」が《頂点|ちょうてん》の $x$ 《座標|ざひょう》です。',
      legend: [['$y=a(x-p)^2+q$', { color: 'a' }], ['もとの $y=ax^2$', { color: 'sub', style: 'dash' }], ['《動|うご》かした《向|む》き', { color: 'b', style: 'dot' }], ['《頂点|ちょうてん》', { color: 'b', shape: 'diamond', noline: true }], ['《軸|じく》 $x=p$', { color: 'c', style: 'dashdot' }]],
      controls: [{ range: 'a', label: '$a$', min: -2, max: 2, step: 0.25, d: 2 }, { range: 'p', label: '$p$（《右|みぎ》へ）', min: -4, max: 4, step: 0.5, d: 1 }, { range: 'q', label: '$q$（《上|うえ》へ）', min: -4, max: 6, step: 0.5, d: 1 }],
      init(st) { st.a = 1; st.p = 0; st.q = 0; st.t = 0; },
      step(st, dt) { st.t += dt * 0.7; st.p = Math.round(Math.min(2, st.t) * 20) / 20; st.q = Math.round(A.clamp(st.t - 2.3, 0, 1) * 20) / 20; if (st.t > 3.4) { st.p = 2; st.q = 1; return false; } },
      draw(cv, st) {
        const v = base(cv);
        v.plot(x => st.a * x * x, { color: 'sub', style: 'dash', width: 2 });
        v.line([[st.p, -6], [st.p, 10.5]], { color: 'c', style: 'dashdot', width: 1.5 });
        if (Math.abs(st.p) > 0.01) v.arrow(0, 0, st.p, 0, { color: 'b', style: 'dot', width: 2.5 });
        if (Math.abs(st.q) > 0.01) v.arrow(st.p, 0, st.p, st.q, { color: 'b', style: 'dot', width: 2.5 });
        v.plot(x => st.a * (x - st.p) ** 2 + st.q, { color: 'a', width: 3.5 });
        v.dot(st.p, st.q, { color: 'b', shape: 'diamond', r: 7 });
        v.text(`(${n1(st.p)}, ${n1(st.q)})`, st.p + 0.25, st.q + (st.a >= 0 ? -0.7 : 0.7), { size: 16, color: 'b', bold: true, bg: true });
      },
      readout: st => `$y=${co(st.a)}${xm(st.p)}^2${pl(st.q)}$　　《頂点|ちょうてん》 $(${n1(st.p)},\\ ${n1(st.q)})$　　《軸|じく》 $x=${n1(st.p)}$`
    },
    {
      key: 'heihou', label: '③ 《平方完成|へいほうかんせい》で《頂点|ちょうてん》',
      lead: '$y=x^2+bx+c$ の《頂点|ちょうてん》は、《式|しき》を《見|み》ただけではわかりません。《平方完成|へいほうかんせい》すると、$(x+\\frac{b}{2})^2$ の《形|かたち》になって、《頂点|ちょうてん》が《読|よ》めます。',
      note: '$x^2+6x+10=(x+3)^2+1$ なので、《頂点|ちょうてん》は $(-3,\\ 1)$。$y=x^2$ を《左|ひだり》へ3、《上|うえ》へ1《動|うご》かした《放物線|ほうぶつせん》です。3は「$x$ の《係数|けいすう》6の《半分|はんぶん》」、9はその2《乗|じょう》です。',
      legend: [['$y=x^2+bx+c$', { color: 'a' }], ['《頂点|ちょうてん》', { color: 'b', shape: 'diamond', noline: true }], ['《軸|じく》', { color: 'c', style: 'dashdot' }], ['$y=x^2$', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'b', label: '$b$（$x$ の《係数|けいすう》）', min: -8, max: 8, step: 1, d: 0 }, { range: 'c', label: '$c$（《数|かず》）', min: -6, max: 14, step: 1, d: 0 }],
      init(st) { st.b = 0; st.c = 10; st.t = 0; },
      step(st, dt) { st.t += dt; st.b = Math.min(6, Math.floor(st.t * 1.5)); if (st.b >= 6 && st.t > 5) return false; },
      draw(cv, st) {
        const v = base(cv), p = -st.b / 2, q = st.c - st.b * st.b / 4;
        v.plot(x => x * x, { color: 'sub', style: 'dash', width: 2 });
        v.line([[p, -6], [p, 10.5]], { color: 'c', style: 'dashdot', width: 1.5 });
        v.plot(x => x * x + st.b * x + st.c, { color: 'a', width: 3.5 });
        v.dot(p, q, { color: 'b', shape: 'diamond', r: 7 });
        v.text(`(${n1(p)}, ${n1(q)})`, p + 0.25, q - 0.7, { size: 16, color: 'b', bold: true, bg: true });
      },
      readout: st => { const h = st.b / 2, q = st.c - h * h; return `$y=x^2${pl(st.b) ? pl(st.b) + 'x' : ''}${pl(st.c)}$　＝　$${xm(-h)}^2${pl(q)}$　　（$${n1(Math.abs(h))}^2=${n1(h * h)}$ をたして、ひいた）　《頂点|ちょうてん》 $(${n1(-h)},\\ ${n1(q)})$`; }
    },
    {
      key: 'hani', label: '④ 《範囲|はんい》の《最大|さいだい》・《最小|さいしょう》',
      lead: '$y=x^2$ で、$x$ の《範囲|はんい》を《決|き》めます。《範囲|はんい》の《窓|まど》を《動|うご》かすと、《最大値|さいだいち》と《最小値|さいしょうち》はどこになるでしょう。',
      note: '①《頂点|ちょうてん》が《範囲|はんい》の《中|なか》にあるかを《見|み》る。②《範囲|はんい》のはしの2つの《値|あたい》と、（《中|なか》にあれば）《頂点|ちょうてん》の《値|あたい》を《計算|けいさん》する。③その《中|なか》で、いちばん《大|おお》きいのが《最大値|さいだいち》、いちばん《小|ちい》さいのが《最小値|さいしょうち》。',
      miss: '$y=x^2$（$-1\\leqq x\\leqq2$）の《最小値|さいしょうち》は、はしの $x=-1$ のときの1ではありません。《頂点|ちょうてん》 $x=0$ が《範囲|はんい》の《中|なか》にあるので、《最小値|さいしょうち》は0です。',
      legend: [['《範囲|はんい》の《中|なか》のグラフ', { color: 'a' }], ['《範囲|はんい》の《外|そと》', { color: 'sub', style: 'dot' }], ['《最大|さいだい》', { color: 'b', shape: 'tri', noline: true }], ['《最小|さいしょう》', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 's', label: '《左|ひだり》のはし', min: -4, max: 4, step: 0.5, d: 1, on: st => { if (st.e < st.s) st.e = st.s; } }, { range: 'e', label: '《右|みぎ》のはし', min: -4, max: 4, step: 0.5, d: 1, on: st => { if (st.s > st.e) st.s = st.e; } }],
      init(st) { st.s = 1; st.e = 3; st.t = 0; },
      step(st, dt) { st.t += dt * 0.6; const k = Math.round(Math.min(st.t, 4) * 2) / 2; st.s = 1 - k; st.e = 3 - k; if (st.t > 4.2) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: -4.6, x1: 4.6, y0: -1.5, y1: 17, box: [50, 18, 780, 390] });
        v.axes({ xt: A.range(-4, 4, 1), yt: [1, 4, 9, 16], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        v.poly([[st.s, -1.5], [st.e, -1.5], [st.e, 17], [st.s, 17]], { fill: 'hl', alpha: 0.6 });
        v.plot(x => x * x, { color: 'sub', style: 'dot', width: 2 });
        v.plot(x => x * x, { x0: st.s, x1: st.e, color: 'a', width: 4.5 });
        const r = mm(st);
        v.dot(r.xmax, r.max, { color: 'b', shape: 'tri', r: 8 });
        v.dot(r.xmin, r.min, { color: 'c', shape: 'square', r: 7 });
        v.text(`さいだい ${n1(r.max)}`, r.xmax + (r.xmax > 0 ? 0.25 : -0.25), r.max + 0.6, { size: 16, color: 'b', bold: true, bg: true, align: r.xmax > 0 ? 'left' : 'right' });
        v.text(`さいしょう ${n1(r.min)}`, r.xmin, r.min - 1.0, { size: 16, color: 'c', bold: true, bg: true, align: 'center' });
      },
      readout: st => { const r = mm(st); return `$${n1(st.s)}\\leqq x\\leqq${n1(st.e)}$：《頂点|ちょうてん》 $x=0$ は《範囲|はんい》の${r.inside ? '**《中|なか》**' : '**《外|そと》**'}　　《最大値|さいだいち》 ${n1(r.max)}（$x=${n1(r.xmax)}$）　《最小値|さいしょうち》 ${n1(r.min)}（$x=${n1(r.xmin)}$）`; }
    }
  ]
});

function base(cv) {
  const v = cv.view(VIEW);
  v.axes({ xt: A.range(-5, 5, 1), yt: [-4, -2, 2, 4, 6, 8, 10], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true, xfmt: x => x % 2 ? '' : n1(x), yfmt: n1 });
  return v;
}
function mm(st) {
  const cand = [[st.s, st.s * st.s], [st.e, st.e * st.e]];
  const inside = st.s <= 0 && st.e >= 0;
  if (inside) cand.push([0, 0]);
  let mx = cand[0], mn = cand[0];
  for (const c of cand) { if (c[1] > mx[1] + 1e-9) mx = c; if (c[1] < mn[1] - 1e-9) mn = c; }
  return { max: mx[1], xmax: mx[0], min: mn[1], xmin: mn[0], inside };
}
