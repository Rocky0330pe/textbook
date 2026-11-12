// @id m3-16
// @title 雨つぶの終端速度：重力と抵抗がつり合う
// @vol 数学6
// @from 数学 6-5 ①〜⑤（ch6-05:122・159・285・357・740・746）
'use strict';
// 2乗に比例する抵抗：v = v_t tanh(gt/v_t)、落ちた距離 x = (v_t²/g) ln cosh(gt/v_t)（6-5・6-11）。下向きが＋。
const g = 9.8;
const vq = (vt, t) => vt * Math.tanh(g * t / vt);
const xq = (vt, t) => vt * vt / g * Math.log(Math.cosh(g * t / vt));
const RAIN = { 1: 4.0, 2: 6.5, 5: 9.1 };   // はかった終端速度（ガンとキンザー、1949年）
const VT = Math.sqrt(80 * 9.8 / 0.26);     // スカイダイバー 54.9 m/s
function sky(dt) { const p = [[0, 0]]; let v = 0; for (let i = 1; i <= Math.round(16 / dt); i++) { v = v + (9.8 - 0.00325 * v * v) * dt; p.push([i * dt, v]); } return p; }

A.item({
  id: 'm3-16', title: '雨つぶの終端速度：重力と抵抗がつり合う',
  from: '数学 第6巻 6-5「空気抵抗と終端速度」の図から（6-11、物理 力学 でも使う）',
  W: 880, H: 420,
  state: { d: 2, t: 0, dts: 1, mk: 1, bk: 1, air: true },
  scenes: [
    {
      key: 'ame', label: '① 力がつり合う',
      lead: '落ちる雨つぶには、下向きの重力 $mg$（赤）と、上向きの空気の抵抗 $f$（青）がはたらきます。▶ で落としてみましょう。',
      note: '落ち始めは速さが0なので抵抗も0で、加速度は $g$ です。速くなると抵抗がふえ、やがて重力と同じ大きさになると、力の合計が0になって、速さはもう変わりません。これが**終端速度** $v_{\\mathrm t}=\\sqrt{\\frac{mg}{c}}$ です（直径 2 mm の雨つぶで約 6.5 m/s）。',
      legend: [['重力 $mg$（いつも同じ）', { color: 'b' }], ['空気の抵抗 $f=cv^2$', { color: 'a', style: 'dash' }], ['速さ $v$', { color: 'a' }], ['空気がないとき $v=gt$', { color: 'b', style: 'dot' }]],
      controls: [{ seg: 'd', label: 'つぶの直径', options: [[1, '1 mm'], [2, '2 mm'], [5, '5 mm']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.6; if (st.t >= 3) { st.t = 3; return false; } },
      draw(cv, st) {
        const vt = RAIN[st.d], t = st.t, v = vq(vt, t), r = (v / vt) ** 2;
        // 左：落ちる柱（0.2秒ごとの位置を薄く）
        const top = 40, sc = 340 / 24, X0 = 120;
        cv.line([[X0, top - 10], [X0, top + 345]], { color: 'grid', width: 1 });
        for (let k = 0; k <= 24; k += 4) { cv.line([[X0 - 6, top + k * sc], [X0 + 6, top + k * sc]], { color: 'sub', width: 1 }); cv.text(k + ' m', X0 - 12, top + k * sc, { size: 14, align: 'right', color: 'sub' }); }
        for (let q = 0.2; q < t; q += 0.2) drop(cv, X0 + 40, top + xq(vt, q) * sc, 5, 0.3);
        const y = top + xq(vt, t) * sc;
        drop(cv, X0 + 40, y, 9, 1);
        cv.arrow(X0 + 40, y + 12, X0 + 40, y + 12 + 60, { color: 'b', width: 4 });
        cv.text('mg', X0 + 50, y + 52, { size: 16, color: 'b', bold: true, math: true, italic: true });
        if (r > 0.02) { cv.arrow(X0 + 40, y - 12, X0 + 40, y - 12 - 60 * r, { color: 'a', width: 4, style: 'dash' }); cv.text('f', X0 + 50, y - 12 - 30 * r, { size: 16, color: 'a', bold: true, math: true, italic: true }); }
        // 右：v-t
        const V = cv.view({ x0: 0, x1: 3.2, y0: 0, y1: 11, box: [330, 20, 520, 340] });
        V.axes({ xt: [0.5, 1, 1.5, 2, 2.5, 3], yt: [2, 4, 6, 8, 10], xl: 't（s）', yl: 'v（m/s）' });
        V.plot(x => g * x, { x0: 0, x1: 1.1, color: 'b', style: 'dot', width: 2 });
        V.plot(() => vt, { color: 'sub', style: 'dash', width: 1.5 });
        V.text('終端速度 ' + A.num(vt, 1) + ' m/s', 2.0, vt + 0.55, { size: 15, color: 'sub', bg: true });
        V.text('空気がないとき', 0.55, 9.6, { size: 15, color: 'b', bg: true });
        V.plot(x => vq(vt, x), { x0: 0, x1: Math.max(0.005, t), color: 'a', width: 3.5 });
        V.dot(t, v, { color: 'a', r: 6 });
      },
      readout: st => { const vt = RAIN[st.d], v = vq(vt, st.t); return `${A.num(st.t, 2)} 秒：速さ ${A.num(v, 2)} m/s　抵抗 $f$ は重力 $mg$ の <b>${A.num(100 * (v / vt) ** 2, 1)} %</b>（$f=mg$ で終端速度 ${A.num(vt, 1)} m/s）`; }
    },
    {
      key: 'sky', label: '② 表計算で',
      lead: 'スカイダイバー（80 kg、$c=0.26$）。$\\frac{dv}{dt}=9.8-0.00325v^2$ を、6-2 のオイラー法で進めます。▶ で計算が進みます。',
      note: 'はじめの1秒は、空気がないとき（9.8 m/s）とほとんど同じです。速さが小さいうちは抵抗が小さいからです。10 秒ほどで、ほぼ終端速度 $\\sqrt{\\frac{80\\times9.8}{0.26}}\\approx54.9$ m/s（時速約 198 km）に達します。$\\Delta t=1$ 秒の値は正しい値より少し大きめで、$\\Delta t=0.1$ 秒にすると、正しい値とほぼ同じになります。',
      legend: [['正しい値（6-11 の式）', { color: 'a' }], ['オイラー法', { color: 'ink', shape: 'circle', noline: true }], ['空気がないとき $v=9.8t$', { color: 'b', style: 'dot' }], ['終端速度 54.9 m/s', { color: 'sub', style: 'dash' }]],
      controls: [{ seg: 'dts', label: '$\\Delta t$〔s〕', options: [[1, '1'], [0.1, '0.1']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 2.5; if (st.t >= 16) { st.t = 16; return false; } },
      draw(cv, st) {
        const V = cv.view({ x0: 0, x1: 16.8, y0: 0, y1: 68, box: [70, 20, 780, 350] });
        V.axes({ xt: A.range(2, 16, 2), yt: [20, 40, 54.9], xl: 't（s）', yl: 'v（m/s）', fmt: v => v % 1 ? A.num(v, 1) : A.num(v, 0) });
        V.plot(() => VT, { color: 'sub', style: 'dash', width: 1.5 });
        V.text('終端速度 54.9 m/s', 13.2, 58.5, { size: 15, color: 'sub', bg: true });
        V.plot(x => 9.8 * x, { x0: 0, x1: 6.6, color: 'b', style: 'dot', width: 2.5 });
        V.text('空気がないとき v = 9.8t', 4.2, 63, { size: 15, color: 'b', align: 'right', bg: true });
        V.plot(x => vq(VT, x), { x0: 0, x1: 16, color: 'a', width: 2.5 });
        const p = sky(st.dts).filter(q => q[0] <= st.t + 1e-9);
        if (st.dts === 1) p.forEach(q => V.dot(q[0], q[1], { color: 'ink', r: 5 }));
        else { V.line(p, { color: 'ink', width: 2, style: 'dot' }); p.filter((q, i) => i % 10 === 0).forEach(q => V.dot(q[0], q[1], { color: 'ink', r: 4 })); }
      },
      readout: st => { const p = sky(st.dts).filter(q => q[0] <= st.t + 1e-9).pop(); const T = Math.round(p[0] * 10) / 10; return `${A.num(T, 1)} 秒：オイラー法（$\\Delta t=$ ${st.dts}）<b>${A.num(p[1], 2)}</b> m/s　正しい値 ${A.num(vq(VT, T), 2)} m/s　空気なし ${A.num(9.8 * T, 1)} m/s`; }
    },
    {
      key: 'omosa', label: '③ 質量と係数',
      lead: '速さに比例する抵抗 $f=bv$ では、答えは $v=v_{\\mathrm f}(1-e^{-t/\\tau})$、$v_{\\mathrm f}=\\frac{mg}{b}$、$\\tau=\\frac{m}{b}$ です。質量 $m$ と抵抗の係数 $b$ を変えてみましょう。',
      note: '$m$ を2倍：$v_{\\mathrm f}$ も $\\tau$ も2倍（速く落ちるが、近づくのに2倍の時間）。$b$ を2倍：$v_{\\mathrm f}$ も $\\tau$ も $\\frac{1}{2}$ 倍（おそい速さに、すばやく落ち着く）。どの曲線も、落ち始めは $v=gt$（点線）にそって速くなります。$\\tau$ で 63 %、$3\\tau$ で 95 %、$5\\tau$ で 99.3 % です。',
      miss: '終端速度に「着く」時刻は求められません。$e^{-t/\\tau}$ は0にならないので、終端速度には限りなく近づくだけです。「何 % になるまで」と決めて、時間を求めます。▶ で、% がいつまでも 100 にならないことを確かめましょう。',
      legend: [['いまの $m$・$b$', { color: 'ink' }], ['もと', { color: 'a', style: 'dash' }], ['$m$ を2倍', { color: 'b', style: 'dashdot' }], ['$b$ を2倍', { color: 'c', style: 'long' }], ['$v=gt$（空気がないとき）', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'mk', label: '質量 $m$（もとの何倍）', min: 0.5, max: 2, step: 0.1, d: 1, on: st => { st.t = 0; } }, { range: 'bk', label: '係数 $b$（もとの何倍）', min: 0.5, max: 2, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.8; if (st.t >= 16) { st.t = 16; return false; } },
      draw(cv, st) {
        const V = cv.view({ x0: 0, x1: 8.8, y0: 0, y1: 4.3, box: [70, 20, 780, 350] });
        V.axes({ xt: [1, 2, 3, 4, 5, 6, 7, 8], yt: [0.5, 1, 2, 3, 4], xl: 't（もとの τ の何倍）', yl: 'v（もとの終端速度の何倍）', fmt: v => A.num(v, v % 1 ? 1 : 0) });
        const cur = (m, b) => x => m / b * (1 - Math.exp(-x * b / m));
        V.plot(x => x, { x0: 0, x1: 4.2, color: 'sub', style: 'dot', width: 2 });
        V.plot(cur(1, 1), { x0: 0, x1: 8.6, color: 'a', style: 'dash', width: 2 });
        V.plot(cur(2, 1), { x0: 0, x1: 8.6, color: 'b', style: 'dashdot', width: 2 });
        V.plot(cur(1, 2), { x0: 0, x1: 8.6, color: 'c', style: 'long', width: 2 });
        const vf = st.mk / st.bk, tau = st.mk / st.bk, f = cur(st.mk, st.bk);
        V.plot(() => vf, { color: 'ink', style: 'dot', width: 1.2 });
        V.plot(f, { x0: 0, x1: 8.6, color: 'ink', width: 3.5 });
        for (const [k, s] of [[1, 'τ：63 %'], [3, '3τ：95 %']]) if (k * tau < 8.6) { V.dot(k * tau, f(k * tau), { color: 'ink', shape: 'square', r: 5 }); const right = k * tau > 7; V.text(s, k * tau + (right ? -0.15 : 0.1), f(k * tau) - 0.2, { size: 15, bg: true, align: right ? 'right' : 'left' }); }
        const tt = Math.min(st.t, 8.6); V.dot(tt, f(tt), { color: 'e', r: 7, shape: 'diamond' });
      },
      readout: st => { const tau = st.mk / st.bk, vf = st.mk / st.bk, p = 100 * (1 - Math.exp(-st.t / tau)); return `$v_{\\mathrm f}=\\frac{mg}{b}$：もとの ${A.num(vf, 2)} 倍　$\\tau=\\frac{m}{b}$：もとの ${A.num(tau, 2)} 倍　　$t=$ ${A.num(st.t, 1)} で終端速度の <b>${p < 99.99 ? A.num(p, 2) : A.num(p, 6)} %</b>`; }
    },
    {
      key: 'filter', label: '④ 重い物は速い？',
      lead: '同じコーヒーフィルターを1枚・2枚・4枚重ねて、同時に 2.5 m の高さから落とします（形と大きさは同じで、質量だけがちがう）。',
      note: '空気があると、2乗に比例する抵抗の終端速度 $v_{\\mathrm t}=\\sqrt{\\frac{mg}{c}}$ は $\\sqrt{m}$ に比例します。2枚で $\\sqrt2\\approx1.41$ 倍、4枚で $\\sqrt4=2$ 倍（はかった値は 1.06・1.47・2.05 m/s）。うすい点は 0.1 秒ごとの位置で、はじめの 0.2 秒ほどで間かくがそろいます。',
      miss: '「重い物は、いつでも速く落ちる」はまちがい。重い物が速く落ちるのは、空気の抵抗があるときだけです。空気がなければ、重さによらず同じに落ちます（「空気なし」でたしかめよう。月の上でハンマーと羽根が同時に落ちた、アポロ15号の実験）。',
      legend: [['フィルター', { color: 'sub', shape: 'tri', noline: true }], ['0.1 秒ごとの位置', { color: 'sub', shape: 'circle', noline: true }]],
      controls: [{ seg: 'air', label: '空気', options: [[true, '空気あり'], [false, '空気なし（真空の箱の中）']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; const T = st.air ? 2.6 : 0.75; if (st.t >= T) { st.t = T; return false; } },
      draw(cv, st) {
        const top = 40, floor = 380, sc = (floor - top) / 2.5;
        cv.line([[30, floor + 2], [850, floor + 2]], { color: 'ink', width: 2.5 });
        cv.line([[30, top], [850, top]], { color: 'sub', style: 'dash', width: 1 });
        cv.text('2.5 m', 40, top - 14, { size: 15, color: 'sub' });
        [[1, 1.06, 220], [2, 1.06 * Math.SQRT2, 450], [4, 2.12, 680]].forEach(([n, vt, X]) => {
          const pos = t => Math.min(2.5, st.air ? xq(vt, t) : 0.5 * g * t * t);
          for (let q = 0.1; q < st.t - 1e-9; q += 0.1) { const y = top + pos(q) * sc; cv.circle(X - 46, y, 3, { fill: 'sub', alpha: 0.5, color: 'sub', width: 1 }); }
          const y = top + pos(st.t) * sc;
          filter(cv, X, y, n);
          const v = pos(st.t) >= 2.5 ? 0 : (st.air ? vq(vt, st.t) : g * st.t);
          cv.text(`${n} 枚`, X, 20, { size: 16, bold: true, align: 'center' });
          cv.text(pos(st.t) >= 2.5 ? '着いた' : `${A.num(v, 2)} m/s`, X + 34, y - 14, { size: 15, bg: true });
        });
      },
      readout: st => st.air ? `終端速度：1枚 1.06 m/s、2枚 ${A.num(1.06 * Math.SQRT2, 2)} m/s（√2 倍）、4枚 2.12 m/s（2倍）　　${A.num(st.t, 2)} 秒` : `空気がないと、3つとも $v=gt$ で同じに落ちる（${A.num(st.t, 2)} 秒）`
    }
  ]
});

function drop(cv, x, y, r, alpha) {
  const G = cv.g; G.save(); G.globalAlpha = alpha;
  G.beginPath(); G.moveTo(x, y - r * 2.1); G.bezierCurveTo(x + r * 0.4, y - r * 1.2, x + r, y - r * 0.4, x + r, y + r * 0.2); G.arc(x, y + r * 0.2, r, 0, Math.PI); G.bezierCurveTo(x - r, y - r * 0.4, x - r * 0.4, y - r * 1.2, x, y - r * 2.1);
  G.fillStyle = A.color('a'); G.fill(); G.restore();
}
// コーヒーフィルター（横から見た形）を n 枚重ねる。y は下のはし
function filter(cv, x, y, n) {
  for (let k = 0; k < n; k++) { const yy = y - k * 5; cv.poly([[x - 26, yy - 22], [x + 26, yy - 22], [x + 16, yy], [x - 16, yy]], { fill: 'bg', alpha: 1, color: 'sub', width: 1.5 }); }
}
