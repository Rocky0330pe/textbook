// @id m3-21
// @title 少しずつ回すと円になる：オイラーの公式
// @vol 数学6
// @from 数学 6-10 ①③（ch6-10:175・221・313・1076）、5-14 ②（ch5-14:165）
'use strict';
const NS = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50, 100, 1000];
// (1 + jθ/n) を n 回かけた点の列
function walk(n, th) { const p = [[1, 0]]; let re = 1, im = 0; for (let k = 0; k < n; k++) { const r2 = re - im * th / n, i2 = im + re * th / n; re = r2; im = i2; p.push([re, im]); } return p; }
const cf = (re, im, d = 3) => `${A.num(re, d)} ${im < 0 ? '−' : '+'} ${A.num(Math.abs(im), d)}j`;

A.item({
  id: 'm3-21', title: '少しずつ回すと円になる：オイラーの公式',
  from: '数学 第6巻 6-10 ①③ の図から（5-14 の $e$ とつながる）',
  W: 880, H: 440,
  state: { ni: 7, th: 1, t: 0, eu: true },
  scenes: [
    {
      key: 'oresen', label: '① 細かく回す',
      lead: '角 $\\theta$ を $n$ 回に分けて回します。1回分は $1+\\frac{j\\theta}{n}$ をかけること。▶ で $n$ を大きくしていきます。',
      note: '$1+\\frac{j\\theta}{n}$ は、長さがほとんど1で、角がほとんど $\\frac{\\theta}{n}$ の数です。$n$ を大きくすると、折れ線は単位円にそい、終わりの点は単位円の上の角 $\\theta$ の点 $\\cos\\theta+j\\sin\\theta$ に近づきます。5-14 の $(1+\\frac{r}{n})^n\\to e^r$ の $r$ に $j\\theta$ を入れた行き着く先を $e^{j\\theta}$ と書きます：$e^{j\\theta}=\\cos\\theta+j\\sin\\theta$（**オイラーの公式**）。',
      miss: '$e^{j\\theta}$ は「$e$ を $j\\theta$ 回かけた数」ではありません。「ほんの少しだけ回す数を、何回もかけた行き着く先」で、それは単位円の上の、角 $\\theta$ の点です。',
      legend: [['$1+\\frac{j\\theta}{n}$ を1回ずつかけた折れ線', { color: 'b' }], ['単位円', { color: 'sub', style: 'dot' }], ['角 $\\theta$ の点 $\\cos\\theta+j\\sin\\theta$', { color: 'a', shape: 'diamond', noline: true }]],
      controls: [{ range: 'ni', label: '分ける回数 $n$', min: 0, max: NS.length - 1, step: 1, fmt: v => String(NS[v]) }, { range: 'th', label: '回したい角 $\\theta$〔rad〕', min: 0.2, max: 3.14, step: 0.01, d: 2 }],
      init(st) { st.ni = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 1) { st.acc = 0; st.ni++; } if (st.ni >= NS.length - 1) { st.ni = NS.length - 1; return false; } },
      draw(cv, st) {
        const n = NS[st.ni], p = walk(n, st.th), e = p[n];
        const P = cv.view({ x0: -1.25, x1: 1.55, y0: -0.22, y1: 1.8, box: [20, 20, 560, 400], equal: true });
        P.axes({ xt: [-1, 1], yt: [1], xl: '実部', yl: '虚部', yfmt: () => 'j' });
        P.clip(() => P.circle(0, 0, 1, { color: 'sub', style: 'dot', width: 1.5 }));
        P.line([[0, 0], [Math.cos(st.th), Math.sin(st.th)]], { color: 'sub', width: 1 });
        arcP(P, 0.22, st.th);
        P.clip(() => { P.line(p, { color: 'b', width: 2.5 }); if (n <= 30) p.forEach(q => P.dot(q[0], q[1], { color: 'b', r: 3.5 })); });
        P.dot(Math.cos(st.th), Math.sin(st.th), { color: 'a', shape: 'diamond', r: 9 });
        if (e[1] < 1.85) P.dot(e[0], e[1], { color: 'b', r: 6 });
        const x0 = 600;
        cv.text(`n = ${n}`, x0, 50, { size: 20, bold: true });
        cv.text(`(1 + jθ/n) を ${n} 回かけた点`, x0, 90, { size: 15, color: 'b' });
        cv.text(cf(e[0], e[1]), x0, 116, { size: 17, color: 'b', bold: true });
        cv.text(`大きさ ${A.num(Math.hypot(e[0], e[1]), n >= 100 ? 5 : 3)}　角 ${A.num(Math.atan2(e[1], e[0]), n >= 100 ? 5 : 3)}`, x0, 142, { size: 15, color: 'b' });
        cv.text('角 θ の点 cosθ + j sinθ', x0, 196, { size: 15, color: 'a' });
        cv.text(cf(Math.cos(st.th), Math.sin(st.th), 4), x0, 222, { size: 17, color: 'a', bold: true });
        cv.text(`大きさ 1　角 ${A.num(st.th, 3)}`, x0, 248, { size: 15, color: 'a' });
      },
      readout: st => { const n = NS[st.ni], e = walk(n, st.th)[n]; return `$\\left(1+\\frac{j\\theta}{n}\\right)^n$ の大きさ ${A.num(Math.hypot(e[0], e[1]), 4)} → 1、角 ${A.num(Math.atan2(e[1], e[0]), 4)} → $\\theta=$ ${A.num(st.th, 2)}`; }
    },
    {
      key: 'jissu', label: '② 実数の e とくらべる',
      lead: '5-14 の複利 $\\left(1+\\frac{1}{n}\\right)^n$（左：数直線の上）と、$\\left(1+\\frac{j}{n}\\right)^n$（右：平面の上）を、同じ $n$ でくらべます。',
      note: '実数の $1+\\frac{1}{n}$ をかけると、数直線の上を右へのびて、$e=2.718\\cdots$ に近づきます。$1+\\frac{j}{n}$ をかけると、少しずつ回りながら、角 1 の点 $\\cos1+j\\sin1=0.5403+0.8415j$ に近づきます。同じ形の式が、実数なら「のびる」、$j$ なら「回る」になるのです。',
      legend: [['$\\left(1+\\frac{1}{n}\\right)^k$', { color: 'b', shape: 'circle' }], ['$\\left(1+\\frac{j}{n}\\right)^k$', { color: 'd', shape: 'square' }]],
      controls: [{ range: 'ni', label: '分ける回数 $n$', min: 0, max: NS.length - 1, step: 1, fmt: v => String(NS[v]) }],
      init(st) { st.ni = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 1) { st.acc = 0; st.ni++; } if (st.ni >= NS.length - 1) { st.ni = NS.length - 1; return false; } },
      draw(cv, st) {
        const n = NS[st.ni];
        const L = cv.view({ x0: 0.8, x1: 3.1, y0: -1, y1: 1, box: [30, 150, 390, 120] });
        cv.arrow(L.X(0.85), L.Y(0), L.X(3.08), L.Y(0), { color: 'sub', width: 1.5, head: 9 });
        for (const v of [1, 1.5, 2, 2.5, 3]) { cv.line([[L.X(v), L.Y(0) - 5], [L.X(v), L.Y(0) + 5]], { color: 'sub', width: 1 }); cv.text(A.num(v, v % 1 ? 1 : 0), L.X(v), L.Y(0) + 20, { size: 14, align: 'center', color: 'sub' }); }
        L.line([[Math.E, -0.6], [Math.E, 0.6]], { color: 'a', style: 'dash', width: 1.5 }); L.text('e = 2.718…', Math.E, 0.85, { size: 15, color: 'a', align: 'center' });
        let x = 1; const xs = [1]; for (let k = 0; k < n; k++) { x *= 1 + 1 / n; xs.push(x); }
        if (n <= 30) xs.forEach(v => L.dot(v, 0, { color: 'b', r: 4 }));
        L.line([[1, 0.12], [x, 0.12]], { color: 'b', width: 3 });
        L.dot(x, 0, { color: 'b', r: 7 });
        cv.text('実数：(1 + 1/n) を n 回', 40, 90, { size: 16, bold: true, color: 'b' });
        cv.text(`= ${A.num(x, n >= 100 ? 5 : 4)}`, 40, 118, { size: 17, color: 'b' });
        const P = cv.view({ x0: -0.2, x1: 1.5, y0: -0.15, y1: 1.15, box: [470, 60, 390, 340], equal: true });
        P.axes({ xt: [1], yt: [1], xl: '実部', yl: '虚部', yfmt: () => 'j' });
        P.clip(() => P.circle(0, 0, 1, { color: 'sub', style: 'dot', width: 1.5 }));
        const p = walk(n, 1), e = p[n];
        P.clip(() => { P.line(p, { color: 'd', width: 2.5 }); if (n <= 30) p.forEach(q => P.dot(q[0], q[1], { color: 'd', r: 3.5, shape: 'square' })); });
        P.dot(Math.cos(1), Math.sin(1), { color: 'a', shape: 'diamond', r: 8 });
        if (e[1] < 1.15) P.dot(e[0], e[1], { color: 'd', r: 6, shape: 'square' });
        cv.text('j：(1 + j/n) を n 回', 470, 34, { size: 16, bold: true, color: 'd' });
        cv.text(`n = ${n}`, 40, 330, { size: 22, bold: true });
      },
      readout: st => { const n = NS[st.ni], e = walk(n, 1)[n]; return `$\\left(1+\\frac{1}{n}\\right)^n=$ ${A.num((1 + 1 / n) ** n, 5)} → $e=2.71828\\cdots$　　$\\left(1+\\frac{j}{n}\\right)^n=$ ${cf(e[0], e[1], 4)} → $0.5403+0.8415j$`; }
    },
    {
      key: 'sokudo', label: '③ 速度は 90° 先',
      lead: '$z=e^{jt}$ を微分すると $jz$。「速度＝位置に $j$ をかけたもの」です。▶ で点を動かしてみましょう。',
      note: '$j$ をかけると、矢印は長さを変えずに 90° 回ります。速度（オレンジ）がいつも半径（青）に垂直なので、点は原点からの距離を変えずに円をえがきます。速さは1なので、$t$ 秒で角 $t$ ラジアン回り、$e^{jt}=\\cos t+j\\sin t$。「今の速度で $\\Delta t=0.1$ だけまっすぐ進む」（$1+0.1j$ をかける。6-2 のオイラー法）をくり返すと、1歩ごとに円の少し外へ出て、ふくらんでいきます。',
      legend: [['位置 $z=e^{jt}$', { color: 'a' }], ['速度 $jz$', { color: 'b' }], ['オイラー法（$\\Delta t=0.1$）', { color: 'd', style: 'dash' }]],
      controls: [{ check: 'eu', label: 'くらべる', text: 'オイラー法（$1+0.1j$ をかける）も出す' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.8; if (st.t >= 2 * Math.PI) { st.t = 2 * Math.PI; return false; } },
      draw(cv, st) {
        const P = cv.view({ x0: -1.75, x1: 1.75, y0: -1.75, y1: 1.75, box: [20, 20, 540, 400], equal: true });
        P.axes({ xt: [-1, 1], yt: [-1, 1], xl: '実部', yl: '虚部', yfmt: v => (v < 0 ? '−' : '') + 'j' });
        P.circle(0, 0, 1, { color: 'sub', width: 1.5 });
        if (st.eu) { const n = Math.floor(st.t / 0.1 + 1e-9), p = walk(n, n * 0.1); P.line(p, { color: 'd', style: 'dash', width: 2 }); p.forEach(q => P.dot(q[0], q[1], { color: 'd', r: 3, shape: 'square' })); }
        const c = Math.cos(st.t), s = Math.sin(st.t);
        P.arrow(0, 0, c, s, { color: 'a', width: 3.5 });
        P.arrow(c, s, c - s * 0.8, s + c * 0.8, { color: 'b', width: 3.5 });
        const k = 0.12; P.line([[c * (1 - k), s * (1 - k)], [c * (1 - k) - s * k, s * (1 - k) + c * k], [c - s * k, s + c * k]], { color: 'ink', width: 1.2 });
        P.dot(c, s, { color: 'a', r: 6 });
        cv.text(`t = ${A.num(st.t, 2)}`, 600, 60, { size: 20, bold: true });
        cv.text(`位置　${cf(c, s)}`, 600, 100, { size: 16, color: 'a' });
        cv.text(`速度　${cf(-s, c)}`, 600, 128, { size: 16, color: 'b' });
        cv.text('（位置を 90° 回したもの）', 600, 154, { size: 15, color: 'sub' });
        if (st.eu) { const n = Math.floor(st.t / 0.1 + 1e-9), q = walk(n, n * 0.1)[n]; cv.text(`オイラー法 ${n} 歩：大きさ ${A.num(Math.hypot(q[0], q[1]), 3)}`, 600, 200, { size: 16, color: 'd' }); cv.text(`（1歩で √1.01 ≒ 1.005 倍）`, 600, 226, { size: 15, color: 'sub' }); }
      },
      readout: st => `$e^{jt}=\\cos t+j\\sin t$　$t=$ ${A.num(st.t, 2)} ラジアン（${A.num(st.t * 180 / Math.PI, 0)}°）　速度 $jz$ の長さ 1`
    }
  ]
});

function arcP(P, r, th) { const pts = []; for (let i = 0; i <= 30; i++) pts.push([r * Math.cos(th * i / 30), r * Math.sin(th * i / 30)]); P.line(pts, { color: 'ink', width: 1.2 }); P.text('θ', r * 1.5 * Math.cos(th / 2), r * 1.5 * Math.sin(th / 2), { size: 15, align: 'center', italic: true, math: true }); }
