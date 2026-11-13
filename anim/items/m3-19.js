// @id m3-19
// @title 解 s の場所と動き方：複素平面で読む
// @vol 数学6
// @from 数学 6-12 ⑩（ch6-12:678）、6-8 ⑨（ch6-08:563）、6-7
'use strict';
// 特性方程式 ms²+cs+k=0 の解 s。① は 6-7 のばね（m=0.5、k=8、c を変える。はじめ x=0.1、v=0）。
// ② は m=1 で、解 s を直接動かす（はじめ x=1、v=0。6-12 の車A・車B と同じ）。
function xOf(s1, s2, x0, t) {
  if (Math.abs(s1[1]) > 1e-9) { const a = s1[0], b = Math.abs(s1[1]); return x0 * Math.exp(a * t) * (Math.cos(b * t) - a / b * Math.sin(b * t)); }
  const p = s1[0], q = s2[0];
  if (Math.abs(p - q) < 1e-6) return x0 * (1 - p * t) * Math.exp(p * t);
  return x0 * (q * Math.exp(p * t) - p * Math.exp(q * t)) / (q - p);
}
const PB = { x0: -3.5, x1: 2.5, y0: -3.1, y1: 3.1, box: [20, 20, 500, 390] };   // ② の複素平面
function roots(c) { const D = c * c - 16; return D < 0 ? [[-c, Math.sqrt(-D)], [-c, -Math.sqrt(-D)]] : [[-c + Math.sqrt(D), 0], [-c - Math.sqrt(D), 0]]; }
const cs = z => z[1] === 0 ? A.num(z[0], 2) : `${A.num(z[0], 2)} ${z[1] > 0 ? '+' : '−'} ${A.num(Math.abs(z[1]), 2)}j`;

A.item({
  id: 'm3-19', title: '解 s の場所と動き方：複素平面で読む',
  from: '数学 第6巻 6-12 ⑩ の図から（6-8・6-7、第9巻の極でも使う）',
  W: 880, H: 430,
  state: { c: 0, t: 0, r1: [-1, 2], r2: [-1, -2] },
  scenes: [
    {
      key: 'kiseki', label: '① c を変えると',
      lead: '6-7 のばね（0.5 kg・8 N/m）の特性方程式 $0.5s^2+cs+8=0$ の解 $s$ を、複素平面に打ちます。▶ でダンパーの強さ $c$ を 0 から大きくしていきます。',
      note: '$c=0$ では、解は虚軸の上の $\\pm4j$（ゆれ続ける）。$c$ をふやすと、2つの解は半径 4 の円にそって左へ動き（ゆれながら止まる）、$c=4$（$\\zeta=1$）で $-4$ に重なります（重解・ちょうど）。その先は実軸の上で左右に分かれ、1つは 0 に近づくので、かえってゆっくりもどります。**実部はへる速さ、虚部はゆれの速さ**です。',
      legend: [['解 $s$（2つ）', { color: 'b', shape: 'circle', noline: true }], ['$c$ を変えたときの解の道すじ', { color: 'sub', style: 'dash' }], ['$x(t)$（はじめ 0.1 m）', { color: 'a' }]],
      controls: [{ range: 'c', label: 'ダンパーの強さ $c$', min: 0, max: 8, step: 0.05, d: 2 }],
      init(st) { st.c = 0; },
      step(st, dt) { st.c += dt * 0.8; if (st.c >= 8) { st.c = 8; return false; } },
      draw(cv, st) {
        const P = plane(cv, { x0: -16, x1: 4, y0: -6.5, y1: 6.5, box: [20, 20, 500, 390] }, [-12, -8, -4, 4], [-4, 4]);
        P.circle(0, 0, 4, { color: 'sub', style: 'dot', width: 1.2 });
        const up = [], lo = [], re1 = [], re2 = [];
        for (let c = 0; c <= 8.001; c += 0.05) { const [a, b] = roots(c); if (c <= 4) { up.push(a); lo.push(b); } else { re1.push(a); re2.push(b); } }
        for (const l of [up, lo, re1, re2]) P.line(l, { color: 'sub', style: 'dash', width: 1.5 });
        const [s1, s2] = roots(st.c);
        P.dot(s1[0], s1[1], { color: 'b', r: 8 }); P.dot(s2[0], s2[1], { color: 'b', r: 8, shape: 'square' });
        P.text('s', s1[0] + 0.4, s1[1] + 0.6, { size: 17, italic: true, math: true, color: 'b', bold: true });
        const g = cv.view({ x0: 0, x1: 6.2, y0: -0.11, y1: 0.12, box: [580, 40, 280, 330] });
        g.axes({ xt: [2, 4, 6], yt: [-0.1, 0.1], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, 1) });
        g.plot(t => xOf(s1, s2, 0.1, t), { x0: 0, x1: 6.1, color: 'a', width: 2.5 });
      },
      readout: st => { const [s1, s2] = roots(st.c); return `$c=$ ${A.num(st.c, 2)}（$\\zeta=$ ${A.num(st.c / 4, 2)}）　解 $s=$ ${s1[1] ? A.num(s1[0], 2) + ' ± ' + A.num(s1[1], 2) + 'j' : cs(s1) + '、' + cs(s2)}　${st.c < 4 - 1e-9 ? '（$|s|=4$ の円の上）' : ''}`; }
    },
    {
      key: 'basho', label: '② s を動かす',
      lead: '解 $s$ の点をドラッグしてみましょう（もう1つは、実軸について対称に動きます）。実軸の上におろすと2つの解に分かれ、別々に動かせます。右は、はじめ $x=1$、速度 0 のときの動きです。',
      note: '**実部**が負なら $e^{-\\alpha t}$ でへり、虚軸から左へ遠いほど早く落ち着きます。**虚部**があればゆれ、その大きさがゆれの角振動数です。虚軸の上（実部0）はダンパーのないばねで、ゆれ続けます。右半分に1つでも解があると、動きはどんどん大きくなります（第9巻の制御では、この点を「極」とよびます）。',
      legend: [['解 $s$（ドラッグできる）', { color: 'b', shape: 'circle', noline: true }], ['$x(t)$', { color: 'a' }]],
      controls: [
        { button: '車A　$s=-1,\\ -2$', act: st => { st.r1 = [-1, 0]; st.r2 = [-2, 0]; } },
        { button: '車B　$s=-1\\pm2j$', act: st => { st.r1 = [-1, 2]; st.r2 = [-1, -2]; } },
        { button: '$s=\\pm2j$（6-6）', act: st => { st.r1 = [0, 2]; st.r2 = [0, -2]; } },
        { button: '$s=1\\pm2j$', act: st => { st.r1 = [1, 2]; st.r2 = [1, -2]; } }
      ],
      draw(cv, st) {
        const P = plane(cv, PB, [-3, -2, -1, 1, 2], [-2, -1, 1, 2]);
        P.dot(st.r1[0], st.r1[1], { color: 'b', r: 9 }); P.dot(st.r2[0], st.r2[1], { color: 'b', r: 9, shape: 'square' });
        const g = cv.view({ x0: 0, x1: 6.2, y0: -2.2, y1: 2.2, box: [560, 30, 300, 360] });
        g.axes({ xt: [2, 4, 6], yt: [-2, -1, 1, 2], xl: 't', yl: 'x' });
        g.plot(t => xOf(st.r1, st.r2, 1, t), { x0: 0, x1: 6.1, color: 'a', width: 2.8 });
        const a = st.r1[1] ? st.r1[0] : Math.max(st.r1[0], st.r2[0]);
        const msg = a < -1e-6 ? (st.r1[1] ? 'ゆれながら止まる' : 'ゆれずにもどる') : a > 1e-6 ? (st.r1[1] ? 'ゆれがふくらむ' : 'どんどん大きくなる') : (st.r1[1] ? 'ゆれ続ける' : '止まらない');
        cv.text(msg, 710, 405, { size: 17, bold: true, align: 'center', color: a > 1e-6 ? 'b' : 'ink' });
      },
      drag: {
        hit(st, x, y, api) { const P = api.cv.view(PB); for (const [k, r] of [[1, st.r1], [2, st.r2]]) if (A.near(x, y, P.X(r[0]), P.Y(r[1]), 22)) return k; return null; },
        move(st, x, y, api, h) {
          const P = api.cv.view(PB); let [re, im] = P.inv(x, y); re = A.clamp(Math.round(re * 20) / 20, -3.4, 2.4); im = A.clamp(Math.round(im * 20) / 20, -2.9, 2.9);
          if (Math.abs(im) < 0.15) im = 0;
          const me = h === 1 ? 'r1' : 'r2', other = h === 1 ? 'r2' : 'r1';
          const wasComplex = st[me][1] !== 0;
          st[me] = [re, im];
          if (im !== 0) st[other] = [re, -im];
          else if (wasComplex) st[other] = [re, 0];
        }
      },
      readout: st => {
        let c, k; if (st.r1[1]) { c = -2 * st.r1[0]; k = st.r1[0] ** 2 + st.r1[1] ** 2; } else { c = -(st.r1[0] + st.r2[0]); k = st.r1[0] * st.r2[0]; }
        const sg = v => (v < 0 ? ' − ' : ' + ') + A.num(Math.abs(v), 2);
        return `解 $s=$ ${st.r1[1] ? A.num(st.r1[0], 2) + ' ± ' + A.num(Math.abs(st.r1[1]), 2) + 'j' : cs(st.r1) + '、' + cs(st.r2)}　→　式 $x''$${sg(c)}$x'$${sg(k)}$x=0$`;
      }
    }
  ]
});

// 複素平面（左半分：落ち着く、右半分：大きくなる）
function plane(cv, o, xt, yt) {
  const P = cv.view(Object.assign({ equal: true }, o));
  cv.rect(P.L, P.T, P.X(0) - P.L, P.Hp, { fill: 'c', alpha: 0.08 });
  cv.rect(P.X(0), P.T, P.L + P.Wp - P.X(0), P.Hp, { fill: 'b', alpha: 0.08 });
  P.axes({ xt, yt, xl: '実部', yl: '虚部', yfmt: v => (v === 1 ? '' : v === -1 ? '−' : A.num(v, 0)) + 'j' });
  cv.text('落ち着く', P.L + 10, P.T + P.Hp - 16, { size: 15, color: 'c', bold: true });
  cv.text('大きくなる', P.L + P.Wp - 10, P.T + P.Hp - 16, { size: 15, color: 'b', bold: true, align: 'right' });
  return P;
}
