// @id m3-24
// @title ばねでつながった2台：ゆれが行き来する
// @vol 数学6
// @from 数学 6-14 ②④⑥（ch6-14:253・350・513・987）、6-13
'use strict';
// m = 1 kg、両はしのばね k = 100 N/m、つなぎのばね K（本は 10 N/m）。和 u は ω1=√(k/m)、差 w は ω2=√((k+2K)/m) でゆれる。
// 静かにはなすとき：x1 = (u0 cos ω1t + w0 cos ω2t)/2、x2 = (u0 cos ω1t − w0 cos ω2t)/2（u0 = x1+x2、w0 = x1−x2）。
const om = K => [10, Math.sqrt(100 + 2 * K)];
function pos(st, t) { const [w1, w2] = om(st.K), u0 = st.a1 + st.a2, d0 = st.a1 - st.a2; return [(u0 * Math.cos(w1 * t) + d0 * Math.cos(w2 * t)) / 2, (u0 * Math.cos(w1 * t) - d0 * Math.cos(w2 * t)) / 2]; }
const E1 = 300, E2 = 580, SC = 800, YB = 120;

A.item({
  id: 'm3-24', title: 'ばねでつながった2台：ゆれが行き来する',
  from: '数学 第6巻 6-14 ②④⑥ の図から（6-13、物理 波動でも使う）',
  W: 880, H: 440,
  state: { K: 10, a1: 0.1, a2: 0, t: 0, mode: 'one' },
  scenes: [
    {
      key: 'uneri', label: '① ゆれが行き来する',
      lead: '台車1だけを右へ 10 cm 引き、2台とも静かにはなします（$m=1$ kg、両はしのばね $k=100$ N/m、まん中は弱いばね $K=10$ N/m）。▶ で動かしてみましょう。',
      note: 'はじめは台車1だけが大きくゆれますが、そのゆれはだんだん台車2にうつり、約 3.3 秒で台車1はほとんど止まります。約 6.6 秒で、ゆれはまた台車1にもどります。弱いばね1本で、ゆれが行ったり来たりするのです。点線のつつみ $\\pm0.1\\cos0.477t$・$\\pm0.1\\sin0.477t$ は、4-9 のうなりと同じ形です。',
      legend: [['台車1 $x_1$', { color: 'a' }], ['台車2 $x_2$', { color: 'b', style: 'dash' }], ['つつみ', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'K', label: 'つなぎのばね $K$〔N/m〕', min: 1, max: 100, step: 1, d: 0, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; st.a1 = 0.1; st.a2 = 0; },
      step(st, dt) { st.t += dt * 0.6; if (st.t >= 7.2) { st.t = 7.2; return false; } },
      draw(cv, st) {
        const [x1, x2] = pos(st, st.t);
        track(cv, x1, x2, st);
        const [w1, w2] = om(st.K), b = (w2 - w1) / 2;
        [[0, 'a', 'solid', 'x₁（m）', t => 0.1 * Math.cos(b * t)], [1, 'b', 'dash', 'x₂（m）', t => 0.1 * Math.sin(b * t)]].forEach(([k, col, sty, yl, env]) => {
          const g = cv.view({ x0: 0, x1: 7.4, y0: -0.13, y1: 0.13, box: [80, 175 + k * 132, 780, 110] });
          g.axes({ xt: [1, 2, 3, 4, 5, 6, 7], yt: [-0.1, 0.1], xl: k ? 't（s）' : '', yl, fmt: q => A.num(q, 1), xfmt: q => A.num(q, 0) });
          if (st.K <= 30) { g.plot(t => Math.abs(env(t)), { x0: 0, x1: 7.2, color: 'sub', style: 'dot', width: 1.5 }); g.plot(t => -Math.abs(env(t)), { x0: 0, x1: 7.2, color: 'sub', style: 'dot', width: 1.5 }); }
          g.plot(t => pos(st, t)[k], { x0: 0, x1: Math.max(0.01, st.t), color: col, style: sty, width: 2, n: 1400 });
        });
      },
      readout: st => { const [w1, w2] = om(st.K); return `$\\omega_1=\\sqrt{\\frac{k}{m}}=10$、$\\omega_2=\\sqrt{\\frac{k+2K}{m}}=$ ${A.num(w2, 2)}（rad/s）　ゆれがうつりきる時刻 $\\frac{\\pi}{\\omega_2-\\omega_1}\\approx$ <b>${A.num(Math.PI / (w2 - w1), 1)} 秒</b>`; }
    },
    {
      key: 'mode', label: '② 振動モード',
      lead: 'はじめのずらし方を選んで、▶ で動かしてみましょう。止まっているときは、台車をドラッグして、好きなずらし方にもできます。',
      note: '同じ向きに同じだけずらすと、つなぎのばねはのびず、2台はいつまでも $\\omega_1=\\sqrt{\\frac{k}{m}}$ でいっしょに動きます（**1次モード**）。反対向きにずらすと、つなぎのばねは2倍のびちぢみして、速い $\\omega_2=\\sqrt{\\frac{k+2K}{m}}$ で反対に動きます（**2次モード**）。どんな動きも、この2つのモードのたし算です。右の棒は、いまのずらし方に、それぞれのモードがどれだけ入っているかを表します。',
      miss: '「台車1は $\\omega_1+\\omega_2$ でゆれる」はまちがい。たすのは cos の式どうし（$\\omega_1$ のゆれと $\\omega_2$ のゆれのたし算）で、角振動数どうしではありません。',
      legend: [['台車1', { color: 'a' }], ['台車2', { color: 'b', style: 'dash' }], ['1次モード（いっしょ）', { color: 'c' }], ['2次モード（反対）', { color: 'd', style: 'dashdot' }]],
      controls: [{ seg: 'mode', label: 'ずらし方', options: [['same', 'いっしょ'], ['opp', '反対'], ['one', '台車1だけ']], on: st => { setMode(st); } }, { range: 'K', label: 'つなぎのばね $K$〔N/m〕', min: 1, max: 100, step: 1, d: 0, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; setMode(st); },
      step(st, dt) { st.t += dt * 0.5; if (st.t >= 3) { st.t = 3; return false; } },
      draw(cv, st) {
        const [x1, x2] = pos(st, st.t);
        track(cv, x1, x2, st);
        const g = cv.view({ x0: 0, x1: 3.1, y0: -0.13, y1: 0.13, box: [80, 185, 560, 230] });
        g.axes({ xt: [1, 2, 3], yt: [-0.1, 0.1], xl: 't（s）', yl: 'x（m）', fmt: q => A.num(q, 1), xfmt: q => A.num(q, 0) });
        g.plot(t => pos(st, t)[0], { x0: 0, x1: Math.max(0.01, st.t), color: 'a', width: 2.2, n: 800 });
        g.plot(t => pos(st, t)[1], { x0: 0, x1: Math.max(0.01, st.t), color: 'b', style: 'dash', width: 2.2, n: 800 });
        // モードの棒
        const u = (st.a1 + st.a2) / 2, w = (st.a1 - st.a2) / 2, base = 330, sc = 900;
        cv.line([[680, base], [860, base]], { color: 'ink', width: 1.5 });
        [[u, 'c', '1次', 'solid'], [w, 'd', '2次', 'dashdot']].forEach(([v, col, name, sty], k) => {
          const x = 700 + k * 85, h = Math.abs(v) * sc;
          cv.rect(x, base - h, 55, h, { fill: col, alpha: 0.4, color: col, width: 2, style: sty });
          cv.text(name, x + 27, base + 16, { size: 15, align: 'center' }); cv.text(A.num(Math.abs(v) * 100, 1) + ' cm', x + 27, base - h - 12, { size: 15, align: 'center', bg: true });
        });
        cv.text('モードの大きさ', 770, 200, { size: 15, align: 'center', color: 'sub' });
      },
      drag: {
        hit(st, x, y) { if (Math.abs(y - (YB - 30)) > 34) return null; const [x1, x2] = pos(st, st.t); if (Math.abs(x - (E1 + x1 * SC)) < 34) return 1; if (Math.abs(x - (E2 + x2 * SC)) < 34) return 2; return null; },
        move(st, x, y, api, h) { api.play(false); const v = A.clamp(Math.round((x - (h === 1 ? E1 : E2)) / SC * 200) / 200, -0.12, 0.12); const [x1, x2] = pos(st, st.t); st.a1 = h === 1 ? v : x1; st.a2 = h === 2 ? v : x2; st.t = 0; st.mode = ''; }
      },
      readout: st => `はじめ $x_1=$ ${A.num(st.a1 * 100, 1)} cm、$x_2=$ ${A.num(st.a2 * 100, 1)} cm　→　1次モード（和の半分）${A.num((st.a1 + st.a2) * 50, 1)} cm ＋ 2次モード（差の半分）${A.num((st.a1 - st.a2) * 50, 1)} cm　　$\\omega_1=10$、$\\omega_2=$ ${A.num(om(st.K)[1], 2)}`
    }
  ]
});

function setMode(st) { st.t = 0; if (st.mode === 'same') { st.a1 = 0.1; st.a2 = 0.1; } else if (st.mode === 'opp') { st.a1 = 0.1; st.a2 = -0.1; } else { st.a1 = 0.1; st.a2 = 0; } }
// 台車2台とばね3本
function track(cv, x1, x2, st) {
  const c1 = E1 + x1 * SC, c2 = E2 + x2 * SC, w = 60;
  wall(cv, 60, YB - 64, YB, 1); wall(cv, 820, YB - 64, YB, -1); cv.line([[60, YB], [820, YB]], { color: 'ink', width: 1.8 });
  for (const E of [E1, E2]) cv.line([[E, YB - 78], [E, YB + 4]], { color: 'sub', style: 'dash', width: 1.2 });
  spring(cv, 60, c1 - w / 2, YB - 30, 8); spring(cv, c1 + w / 2, c2 - w / 2, YB - 30, 8, st.K >= 50 ? 2.8 : 1.6); spring(cv, c2 + w / 2, 820, YB - 30, 8);
  cart(cv, c1, YB, w, 'a', 'solid', '1'); cart(cv, c2, YB, w, 'b', 'dash', '2');
  cv.text('k', 140, YB - 54, { size: 16, italic: true, math: true }); cv.text('K', (E1 + E2) / 2, YB - 54, { size: 16, italic: true, math: true, align: 'center' }); cv.text('k', 740, YB - 54, { size: 16, italic: true, math: true });
}
function wall(cv, x, y0, y1, s) { cv.line([[x, y0], [x, y1]], { color: 'ink', width: 2.5 }); for (let y = y0; y < y1; y += 10) cv.line([[x, y], [x - 8 * s, y + 8]], { color: 'sub', width: 1.2 }); }
function spring(cv, x1, x2, y, n, wd) {
  const amp = 7, lead = 8, L = x2 - x1 - 2 * lead, pts = [[x1, y], [x1 + lead, y]];
  for (let k = 0; k < 2 * n; k++) pts.push([x1 + lead + L * (k + 0.5) / (2 * n), y + (k % 2 ? amp : -amp)]);
  pts.push([x2 - lead, y], [x2, y]); cv.line(pts, { color: 'ink', width: wd || 2 });
}
function cart(cv, x, yb, w, col, sty, name) {
  cv.rect(x - w / 2, yb - 54, w, 48, { fill: col, alpha: 0.3, color: col, width: 2, style: sty });
  cv.text(name, x, yb - 30, { size: 17, bold: true, align: 'center' });
  cv.circle(x - w / 4, yb - 3, 3.5, { color: 'ink', width: 1.5 }); cv.circle(x + w / 4, yb - 3, 3.5, { color: 'ink', width: 1.5 });
}
