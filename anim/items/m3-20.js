// @id m3-20
// @title 複素数のかけ算：長さはかけ算、角はたし算
// @vol 数学6
// @from 数学 6-8 ②（ch6-08:117・217）、6-9 ⑤⑥⑧⑨（ch6-09:116・336・452・693・796）
'use strict';
const deg = (re, im) => Math.atan2(im, re) * 180 / Math.PI;
const cfmt = (re, im, d = 2) => {
  const r = Math.abs(re) < 5e-4 ? 0 : re, i = Math.abs(im) < 5e-4 ? 0 : im, n = v => String(+v.toFixed(d)).replace('-', '−');
  if (!i) return n(r); const js = (Math.abs(i) === 1 ? '' : n(Math.abs(i))) + 'j';
  if (!r) return (i < 0 ? '−' : '') + js; return n(r) + (i < 0 ? '−' : '+') + js;
};
const PZ = { x0: -4.5, x1: 4.5, y0: -3.45, y1: 3.45, box: [20, 20, 520, 400] };
const PJ = { x0: -4.3, x1: 4.3, y0: -4.3, y1: 4.3, box: [20, 20, 520, 400] };

A.item({
  id: 'm3-20', title: '複素数のかけ算：長さはかけ算、角はたし算',
  from: '数学 第6巻 6-8 ②・6-9 ⑤⑥⑧⑨ の図から（6-10・6-13、物理 電磁気・波動でも使う）',
  W: 880, H: 440,
  state: { z: [1, 1], w: [1, 1.732], path: false, mul: 'a' },
  scenes: [
    {
      key: 'kakeru', label: '① z × w',
      lead: '矢印 $z$（青）と $w$（オレンジ）の先をドラッグして動かしてみましょう。むらさきの矢印が、かけ算の答え $zw$ です。',
      note: '$zw$ の長さは $|z|\\times|w|$（**かけ算**）、角は「$z$ の角＋$w$ の角」（**たし算**）です。たとえば $z=1+j$（$\\sqrt2$、45°）と $w=1+\\sqrt3j$（2、60°）の積は、長さ $2\\sqrt2\\approx2.83$、角 105° の $-0.732+2.732j$。「道すじ」を出すと、$w=c\\times1+d\\times j$ の三角形を、$|z|$ 倍に拡大して $z$ の角だけ回したものが、$zw=c\\times z+d\\times(jz)$ の三角形だとわかります。',
      miss: 'かけ算で、角をかけてしまうのはまちがい（30° と 60° の数の積の角は 1800° ではなく、$30°+60°=90°$）。かけ算では、長さはかけ算、角は**たし算**です。',
      legend: [['$z$', { color: 'a' }], ['$w$', { color: 'b', style: 'dash' }], ['$zw$', { color: 'd', style: 'long' }], ['道すじ（三角形）', { color: 'sub', style: 'dot' }]],
      controls: [{ check: 'path', label: '道すじ', text: '三角形の道すじを出す' }, { button: '本の例にもどす', act: st => { st.z = [1, 1]; st.w = [1, 1.732]; } }],
      draw(cv, st) {
        const P = cplane(cv, PZ, [-4, -3, -2, -1, 1, 2, 3, 4], [-3, -2, -1, 1, 2, 3]);
        const [a, b] = st.z, [c, d] = st.w, p = [a * c - b * d, a * d + b * c];
        if (st.path) {
          P.line([[0, 0], [c, 0], [c, d]], { color: 'b', style: 'dot', width: 2 });
          P.line([[0, 0], [c * a, c * b], [p[0], p[1]]], { color: 'd', style: 'dot', width: 2 });
          P.text('c×z', c * a / 2 + 0.3, c * b / 2 - 0.3, { size: 15, color: 'd', bg: true });
          P.text('d×(jz)', (c * a + p[0]) / 2 - 0.2, (c * b + p[1]) / 2 + 0.2, { size: 15, color: 'd', bg: true, align: 'right' });
        }
        arc(P, 0.45, deg(a, b), 'a'); arc(P, 0.7, deg(c, d), 'b'); arc(P, 0.95, deg(p[0], p[1]), 'd');
        P.clip(() => P.arrow(0, 0, p[0], p[1], { color: 'd', width: 4, style: 'long' }));
        P.arrow(0, 0, a, b, { color: 'a', width: 3.5 }); P.arrow(0, 0, c, d, { color: 'b', width: 3.5, style: 'dash' });
        P.dot(a, b, { color: 'a', r: 8 }); P.dot(c, d, { color: 'b', r: 8, shape: 'square' });
        lab(P, 'z', a, b, 'a'); lab(P, 'w', c, d, 'b'); lab(P, 'zw', p[0], p[1], 'd');
        const L = Math.hypot, rows = [
          ['z', `${cfmt(a, b)}`, `長さ ${A.num(L(a, b), 2)}　角 ${A.num(deg(a, b), 0)}°`, 'a'],
          ['w', `${cfmt(c, d)}`, `長さ ${A.num(L(c, d), 2)}　角 ${A.num(deg(c, d), 0)}°`, 'b'],
          ['zw', `${cfmt(p[0], p[1])}`, `長さ ${A.num(L(p[0], p[1]), 2)}　角 ${A.num(deg(p[0], p[1]), 0)}°`, 'd']];
        rows.forEach(([n, s, t, col], i) => { cv.text(n + ' = ' + s, 565, 60 + i * 64, { size: 17, bold: true, color: col }); cv.text(t, 565, 86 + i * 64, { size: 15, color: col }); });
        const sum = deg(a, b) + deg(c, d), sumN = ((sum + 540) % 360) - 180;
        cv.text(`長さ：${A.num(L(a, b), 2)} × ${A.num(L(c, d), 2)} = ${A.num(L(a, b) * L(c, d), 2)}`, 565, 270, { size: 16 });
        cv.text(`角：${A.num(deg(a, b), 0)}° + ${A.num(deg(c, d), 0)}° = ${A.num(sum, 0)}°`, 565, 300, { size: 16 });
        if (Math.abs(sum - sumN) > 1) cv.text(`（${A.num(sum, 0)}° は ${A.num(sumN, 0)}° と同じ向き）`, 565, 328, { size: 15, color: 'sub' });
      },
      drag: {
        hit(st, x, y, api) { const P = api.cv.view(Object.assign({ equal: true }, PZ)); if (A.near(x, y, P.X(st.z[0]), P.Y(st.z[1]), 24)) return 'z'; if (A.near(x, y, P.X(st.w[0]), P.Y(st.w[1]), 24)) return 'w'; return null; },
        move(st, x, y, api, h) { const P = api.cv.view(Object.assign({ equal: true }, PZ)); let [re, im] = P.inv(x, y); re = Math.round(re * 20) / 20; im = Math.round(im * 20) / 20; const r = Math.hypot(re, im); if (r > 1.85) { re *= 1.85 / r; im *= 1.85 / r; } if (r < 0.2) return; st[h] = [re, im]; }
      },
      readout: st => { const [a, b] = st.z, [c, d] = st.w; return `$zw=(${cfmt(a, b)})(${cfmt(c, d)})=$ <b>${cfmt(a * c - b * d, a * d + b * c, 3)}</b>（展開して $j^2=-1$）`; }
    },
    {
      key: 'jkake', label: '② ×j は 90°',
      lead: '「$\\times j$」は、0 を中心に左回りに 90° 回すかけ算です。▶ か「$\\times j$」のボタンで回してみましょう。点 P はドラッグで動かせます。',
      note: '$(x,\\ y)$ に $j$ をかけると $(-y,\\ x)$。2回くり返すと $(-x,\\ -y)$ で、180° 回したこと、つまり $\\times(-1)$ と同じです。だから $j^2=-1$。4回で、もとにもどります（$j^4=1$）。',
      legend: [['いまの点', { color: 'd', shape: 'circle', noline: true }], ['回ったあと', { color: 'sub', style: 'dot' }]],
      controls: [{ button: '$\\times j$', act: (st, api) => { if (st.ang === st.target) { st.target += 90; st.stop = true; api.play(true); } } }, { button: '$\\times(-1)$', act: (st, api) => { if (st.ang === st.target) { st.target += 180; st.stop = true; api.play(true); } } }],
      init(st) { st.p = [3, 1]; st.ang = 0; st.target = 0; st.stop = false; st.wait = 0; },
      step(st, dt) {
        if (st.ang < st.target) { st.ang = Math.min(st.target, st.ang + dt * 110); return; }
        if (st.stop) { st.stop = false; return false; }
        st.wait += dt; if (st.wait > 0.6) { st.wait = 0; st.target += 90; }
      },
      draw(cv, st) {
        const P = cplane(cv, PJ, [-4, -3, -2, -1, 1, 2, 3, 4], [-4, -3, -2, -1, 1, 2, 3, 4]);
        const rot = (q, t) => { const c = Math.cos(t * Math.PI / 180), s = Math.sin(t * Math.PI / 180); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; };
        const nDone = Math.floor((st.ang + 1e-6) / 90);
        for (let k = 0; k <= Math.min(nDone, 4); k++) { const q = rot(st.p, 90 * k); P.line([[0, 0], q], { color: 'sub', style: 'dot', width: 1.5 }); P.dot(q[0], q[1], { color: 'sub', r: 5 }); P.text(['P', 'P×j', 'P×j²', 'P×j³', 'P×j⁴'][k] + `（${cfmt(...q.map(v => Math.round(v * 100) / 100), 2)}）`, q[0] + 0.15, q[1] + 0.3, { size: 15, color: 'sub', bg: true }); }
        const cur = rot(st.p, st.ang), a0 = Math.floor(st.ang / 90) * 90;
        if (st.ang > a0 + 1e-6) arc(P, 0.9, st.ang - a0, 'd', deg(...rot(st.p, a0)));
        P.arrow(0, 0, cur[0], cur[1], { color: 'd', width: 3.5 });
        P.dot(cur[0], cur[1], { color: 'd', r: 8 });
        cv.text(`j を ${nDone} 回かけた`, 565, 70, { size: 18, bold: true });
        const pw = ['1', 'j', '−1', '−j'][nDone % 4];
        cv.text(`j の ${nDone} 乗 ＝ ${pw}`, 565, 104, { size: 17 });
        cv.text('(x, y) → (−y, x)', 565, 150, { size: 17, color: 'd' });
        cv.text('2回で (−x, −y)：×(−1) と同じ', 565, 182, { size: 15, color: 'sub' });
        cv.text('だから j² = −1', 565, 210, { size: 17, bold: true, color: 'b' });
      },
      drag: {
        hit(st, x, y, api) { const P = api.cv.view(Object.assign({ equal: true }, PJ)); return st.ang === st.target && A.near(x, y, P.X(st.p[0] * Math.cos(st.ang * Math.PI / 180) - st.p[1] * Math.sin(st.ang * Math.PI / 180)), P.Y(st.p[0] * Math.sin(st.ang * Math.PI / 180) + st.p[1] * Math.cos(st.ang * Math.PI / 180)), 24) ? 'p' : null; },
        move(st, x, y, api) { const P = api.cv.view(Object.assign({ equal: true }, PJ)); let [re, im] = P.inv(x, y); re = A.clamp(Math.round(re * 2) / 2, -3.5, 3.5); im = A.clamp(Math.round(im * 2) / 2, -3.5, 3.5); st.p = [re, im]; st.ang = st.target = 0; }
      },
      readout: st => { const n = Math.floor((st.ang + 1e-6) / 90), q = [[1, 0], [0, 1], [-1, 0], [0, -1]][n % 4], r = [st.p[0] * q[0] - st.p[1] * q[1], st.p[0] * q[1] + st.p[1] * q[0]]; return `P ＝ ${cfmt(st.p[0], st.p[1])}　→　P に $j$ を ${n} 回かけると ${cfmt(r[0], r[1])}`; }
    },
    {
      key: 'uzu', label: '③ (1+j) を何回も',
      lead: '1 に $1+j$ を1回ずつかけていきます。▶ か「$\\times(1+j)$」で、点がどう動くか見てみましょう。',
      note: '$1+j$ は、長さ $\\sqrt2$、角 45° の数です。だからかけるたびに、点は $\\sqrt2$ 倍に遠ざかりながら、45° ずつ左回りに回ります。もとの向き（0°）にもどるのは、$45°\\times8=360°$ で8回かけたとき。そのとき距離は $(\\sqrt2)^8=16$ 倍なので、$(1+j)^8=16$。長さ1の数（$\\frac{\\sqrt2}{2}(1+j)$）をかけると、回るだけで、遠ざかりません。',
      miss: '$(1+j)^8=1$ はまちがい。角だけ $45°\\times8=360°$ にして、長さ $\\sqrt2$ の8乗を忘れています。正しくは $(\\sqrt2)^8=16$ なので $(1+j)^8=16$ です。',
      legend: [['かけた点', { color: 'a', shape: 'circle', noline: true }], ['点を順につないだ線', { color: 'b', style: 'dash' }], ['原点からの矢印', { color: 'sub' }]],
      controls: [{ seg: 'mul', label: 'かける数', options: [['a', '$1+j$'], ['b', '$\\frac{\\sqrt2}{2}(1+j)$（長さ1）']], on: st => { st.n = 0; } }, { button: '$\\times(1+j)$', act: st => { if (st.n < 8) st.n++; } }],
      init(st) { st.n = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 0.8) { st.acc = 0; st.n++; } if (st.n >= 8) { st.n = 8; return false; } },
      draw(cv, st) {
        const k = st.mul === 'a' ? 1 : Math.SQRT1_2, pts = [[1, 0]];
        for (let i = 1; i <= st.n; i++) { const [x, y] = pts[i - 1]; pts.push([k * (x - y), k * (x + y)]); }
        const o = st.mul === 'a' ? { x0: -6.5, x1: 17.5, y0: -9.4, y1: 3.4, box: [20, 20, 840, 390] } : { x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6, box: [20, 20, 840, 390] };
        const P = cv.view(Object.assign({ equal: true }, o));
        P.axes(st.mul === 'a' ? { xt: [-4, 4, 8, 12, 16], yt: [-8, -4], xl: '実部', yl: '虚部', yfmt: v => A.num(v, 0) + 'j' } : { xt: [-1, 1], yt: [-1, 1], xl: '実部', yl: '虚部', yfmt: v => (v < 0 ? '−' : '') + 'j' });
        if (st.mul === 'b') P.circle(0, 0, 1, { color: 'sub', style: 'dot', width: 1.5 });
        pts.forEach(q => P.line([[0, 0], q], { color: 'sub', width: 1, alpha: 0.6 }));
        if (pts.length > 1) P.line(pts, { color: 'b', style: 'dash', width: 2.2 });
        pts.forEach((q, i) => { P.dot(q[0], q[1], { color: 'a', r: i === pts.length - 1 ? 8 : 5 }); const s = i === 0 ? '1（n=0）' : cfmt(q[0], q[1], 3); P.text(s, q[0] + (q[0] < 0 ? -0.15 : 0.15) * (st.mul === 'a' ? 2 : 0.4), q[1] + (q[1] >= 0 ? 0.35 : -0.35) * (st.mul === 'a' ? 1 : 0.25), { size: 15, align: q[0] < 0 ? 'right' : 'left', bg: true }); });
      },
      readout: st => { const k = st.mul === 'a' ? Math.SQRT2 : 1, r = k ** st.n, a = 45 * st.n, re = r * Math.cos(a * Math.PI / 180), im = r * Math.sin(a * Math.PI / 180); return `$n=$ ${st.n}：実部 ${A.num(re, 3)}、虚部 ${A.num(im, 3)}、距離 ${A.num(r, 3)}、角 ${a}°${a >= 360 ? '（' + (a - 360) + '° と同じ向き）' : ''}`; }
    }
  ]
});

function cplane(cv, o, xt, yt) {
  const P = cv.view(Object.assign({ equal: true }, o));
  P.axes({ xt, yt, xl: '実部', yl: '虚部', yfmt: v => (v === 1 ? '' : v === -1 ? '−' : A.num(v, 0)) + 'j' });
  return P;
}
// 原点のまわりの角の弧（a0 から ang 度ぶん）
function arc(P, r, ang, col, a0 = 0) {
  const pts = [], n = 30; for (let i = 0; i <= n; i++) { const t = (a0 + ang * i / n) * Math.PI / 180; pts.push([r * Math.cos(t), r * Math.sin(t)]); }
  P.line(pts, { color: col, width: 2 });
}
function lab(P, s, x, y, col) { const r = Math.hypot(x, y) || 1; P.text(s, x + 0.3 * x / r, y + 0.3 * y / r, { size: 18, bold: true, italic: true, math: true, color: col, align: 'center', bg: true }); }
