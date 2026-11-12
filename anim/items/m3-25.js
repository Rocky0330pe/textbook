// @id m3-25
// @title つないだ水そう：和は変わらず、差がへる
// @vol 数学6
// @from 数学 6-14 ①③⑤⑦（ch6-14:129・171・601・695・968）
'use strict';
// 左の水そうから右へ、1分に 10(h1−h2) cm³ 流れる管。底面積 100 cm²（②では右を 300 cm²）。
// dh1/dt = −0.1(h1−h2)、dh2/dt = (10/右の底面積)(h1−h2)。はじめ左 20 cm、右は空。
// 直列：時定数 τ = 4 分、はじめ上 40 cm → h1 = 40e^{−t/4}、h2 = 10t e^{−t/4}（4分後に 14.7 cm）。
const ex = (S, t) => { const r = 0.1 + 10 / S, D = 20 * Math.exp(-r * t), V = 2000, hf = V / (100 + S); return [hf + D * S / (100 + S), hf - D * 100 / (100 + S)]; };

A.item({
  id: 'm3-25', title: 'つないだ水そう：和は変わらず、差がへる',
  from: '数学 第6巻 6-14 ①③⑤⑦ の図から（熱・電気・原子の巻でも同じ形）',
  W: 880, H: 440,
  state: { t: 0, S2: 100, dtw: 1 },
  scenes: [
    {
      key: 'suiso', label: '① 和と差',
      lead: '同じ形の2つの水そうを、底の近くで細い管でつなぎます。はじめ左は 20 cm、右は空。▶ で管をあけてみましょう。',
      note: '水は管を通って移るだけなので、**合計はいつも 20 cm**。差は $D=20e^{-0.2t}$ で、毎分 $e^{-0.2}=0.8187$ 倍（約 0.82 倍）にへります。和と差に組みかえると、片方は変わらず、もう片方は 6-4 の形でへるだけ。もとにもどすと $h_1=10+10e^{-0.2t}$、$h_2=10-10e^{-0.2t}$ で、どちらも最後は 10 cm になります。',
      miss: '和と差のまま答えないように。$h_1=20e^{-0.2t}$ は差 $D$ です。最後に $h_1=(S+D)÷2$ にもどします。',
      legend: [['左の水位 $h_1$', { color: 'a' }], ['右の水位 $h_2$', { color: 'b', style: 'dash' }], ['合計 $S$', { color: 'c', style: 'dot' }], ['差 $D$', { color: 'd', style: 'dashdot' }]],
      init(st) { st.t = 0; st.S2 = 100; },
      step(st, dt) { st.t += dt * 2; if (st.t >= 15) { st.t = 15; return false; } },
      draw(cv, st) { tanksAndGraph(cv, st, true); },
      readout: st => { const [a, b] = ex(100, st.t); return `${A.num(st.t, 1)} 分：$h_1=$ ${A.num(a, 2)} cm、$h_2=$ ${A.num(b, 2)} cm　合計 <b>${A.num(a + b, 2)}</b> cm　差 <b>${A.num(a - b, 2)}</b> cm`; }
    },
    {
      key: 'omomi', label: '② 大きさがちがう',
      lead: '右の水そうの底面積を 300 cm²（左の3倍）にします。管は同じです。▶ で管をあけてみましょう。',
      note: '同じ水が入っても、右の水位は3分の1しか上がりません。だから $h_1+h_2$ は一定ではありません。一定なのは水の体積 $100h_1+300h_2=2000$ cm³（**重みつきの和**）。差は $D=20e^{-t/7.5}$ でへり、最後は2つとも 5 cm にそろいます。左は 15 cm 下がり、右は 5 cm しか上がりません。',
      miss: '重みを忘れて「最後は $20÷2=10$ cm」とするのはまちがい。体積が一定なので、$100h+300h=2000$ より $h=5$ cm です。',
      legend: [['左の水位 $h_1$', { color: 'a' }], ['右の水位 $h_2$', { color: 'b', style: 'dash' }], ['体積 $100h_1+300h_2$（÷100）', { color: 'c', style: 'dot' }]],
      controls: [{ seg: 'S2', label: '右の底面積', options: [[100, '100 cm²'], [300, '300 cm²']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; st.S2 = 300; },
      step(st, dt) { st.t += dt * 3; if (st.t >= 30) { st.t = 30; return false; } },
      draw(cv, st) { tanksAndGraph(cv, st, false); },
      readout: st => { const [a, b] = ex(st.S2, st.t); return `${A.num(st.t, 1)} 分：$h_1=$ ${A.num(a, 2)} cm、$h_2=$ ${A.num(b, 2)} cm　$h_1+h_2=$ ${A.num(a + b, 2)} cm　体積 ${A.num(100 * a + st.S2 * b, 0)} cm³（一定）`; }
    },
    {
      key: 'chokuretsu', label: '③ 上から下へ',
      lead: '同じ形の水そうを、階段のように上下に置きます。上の水は下へ落ち、下の水は外へ出ていきます（どちらも時定数 4 分、はじめ上は 40 cm、下は空）。',
      note: '上は $h_1=40e^{-t/4}$ でへります。下には上から水が入り、自分の管から出ていくので、**ふえてから、へります**：$h_2=40\\times\\frac{t}{4}e^{-t/4}=10te^{-t/4}$。いちばん高くなるのは、微分が0になる $t=\\tau=4$ 分で、そのとき $40e^{-1}\\approx14.7$ cm。6-12 の重解の $te^{st}$ が主役になる形で、放射性物質の親と子（ベイトマン、1910年）も同じ形です。',
      legend: [['上の水位 $h_1$', { color: 'a' }], ['下の水位 $h_2$', { color: 'b', style: 'dash' }], ['下がいちばん高い所', { color: 'b', shape: 'diamond', noline: true }]],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 2.5; if (st.t >= 20) { st.t = 20; return false; } },
      draw(cv, st) {
        const t = st.t, h1 = 40 * Math.exp(-t / 4), h2 = 10 * t * Math.exp(-t / 4), s = 3.6;
        tank(cv, 40, 200, 110, 46, h1, s, 'a', 'solid', '上');
        tank(cv, 170, 400, 110, 46, h2, s, 'b', 'dash', '下');
        cv.line([[150, 196], [190, 196], [190, 222]], { color: 'sub', width: 3 }); cv.line([[280, 396], [320, 396]], { color: 'sub', width: 3 });
        if (h1 > 0.3) cv.arrow(190, 222, 190, 222 + Math.min(40, 6 + h1 * 0.8), { color: 'a', width: 3 });
        if (h2 > 0.3) cv.arrow(320, 396, 320 + Math.min(40, 6 + h2 * 2), 396, { color: 'b', width: 3 });
        const g = cv.view({ x0: 0, x1: 21, y0: 0, y1: 44, box: [420, 30, 440, 370] });
        g.axes({ xt: [4, 8, 12, 16, 20], yt: [10, 20, 30, 40], xl: 't（分）', yl: '水位（cm）' });
        g.plot(x => 40 * Math.exp(-x / 4), { x0: 0, x1: Math.max(0.01, t), color: 'a', width: 3 });
        g.plot(x => 10 * x * Math.exp(-x / 4), { x0: 0, x1: Math.max(0.01, t), color: 'b', width: 3, style: 'dash' });
        if (t >= 4) { g.dot(4, 40 * Math.exp(-1), { color: 'b', shape: 'diamond', r: 8 }); g.text('4 分後に 14.7 cm', 4.4, 17.5, { size: 15, color: 'b', bg: true }); }
      },
      readout: st => `${A.num(st.t, 1)} 分：上 ${A.num(40 * Math.exp(-st.t / 4), 2)} cm、下 <b>${A.num(10 * st.t * Math.exp(-st.t / 4), 2)} cm</b>（${st.t < 4 ? 'ふえている' : st.t > 4.05 ? 'へっている' : 'いちばん高い'}）`
    },
    {
      key: 'junban', label: '④ 表計算の順番',
      lead: '表計算で、$\\Delta t=1$ 分ずつ進めます。「正しい」は2つとも「今の行」の差で進めたもの、「まちがい」は、左を先に新しくして、その新しい $h_1$ で右を計算したものです。',
      note: '正しい方法では、左から出た水と右に入る水が同じなので、合計はぴったり 20 cm のまま（表の $h_1$ は 18、16.4、15.12、…）。左を先に新しくすると、1歩めで $h_2=0+0.1\\times(18-0)=1.8$ になり、合計が 19.8 cm。**水が消えてしまいます**。消えた分は、1歩ごとにたまっていきます。',
      miss: '先に出した $h_1=18$ を使って $h_2=0+0.1\\times(18-0)=1.8$ とするのはまちがい。今の行の差 20 を使って $h_2=0+0.1\\times20=2$ です。左から出た水と右に入る水は、同じ時刻の差で決まります。',
      legend: [['正しい：今の行の差で', { color: 'a', shape: 'circle' }], ['まちがい：新しい $h_1$ で', { color: 'b', shape: 'square', style: 'dash' }]],
      controls: [{ button: '1歩進む', act: st => { if (st.n < 15) st.n++; } }],
      init(st) { st.n = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 0.7) { st.acc = 0; st.n++; } if (st.n >= 15) { st.n = 15; return false; } },
      draw(cv, st) {
        const R = rows(st.n);
        const g = cv.view({ x0: 0, x1: 15.6, y0: 18, y1: 20.3, box: [80, 30, 350, 340] });
        g.axes({ xt: [5, 10, 15], yt: [18, 18.5, 19, 19.5, 20], xl: 't（分）', yl: '合計（cm）', ax: 18, fmt: q => A.num(q, q % 1 ? 1 : 0) });
        g.line(R.map(r => [r[0], r[1] + r[2]]), { color: 'a', width: 2 }); R.forEach(r => g.dot(r[0], r[1] + r[2], { color: 'a', r: 4.5 }));
        g.line(R.map(r => [r[0], r[3] + r[4]]), { color: 'b', width: 2, style: 'dash' }); R.forEach(r => g.dot(r[0], r[3] + r[4], { color: 'b', r: 4.5, shape: 'square' }));
        // 表
        const x0 = 465, C1 = [22, 85, 145, 210], C2 = [280, 337, 400], hd = ['t', 'h1', 'h2', '合計'];
        cv.text('正しい', x0 + 60, 30, { size: 15, bold: true, color: 'a' }); cv.text('まちがい', x0 + 300, 30, { size: 15, bold: true, color: 'b' });
        hd.forEach((h, k) => { cv.text(h, x0 + C1[k], 56, { size: 14, color: 'sub', align: 'right' }); if (k) cv.text(h, x0 + C2[k - 1], 56, { size: 14, color: 'sub', align: 'right' }); });
        R.slice(-12).forEach((r, i) => {
          const y = 82 + i * 26, f = v => A.num(v, 3), o = (v, x, col) => cv.text(v, x0 + x, y, { size: 14, align: 'right', color: col || 'ink', bold: !!col });
          o(String(r[0]), C1[0]); o(f(r[1]), C1[1]); o(f(r[2]), C1[2]); o(f(r[1] + r[2]), C1[3], 'a');
          o(f(r[3]), C2[0]); o(f(r[4]), C2[1]); o(f(r[3] + r[4]), C2[2], 'b');
        });
      },
      readout: st => { const r = rows(st.n).pop(); return `${r[0]} 分後の合計：正しい ${A.num(r[1] + r[2], 3)} cm、まちがい <b>${A.num(r[3] + r[4], 3)} cm</b>（${A.num(20 - r[3] - r[4], 3)} cm の水が消えた）`; }
    }
  ]
});

// [t, 正しい h1, h2, まちがい h1, h2]（Δt = 1 分）
function rows(n) { const R = [[0, 20, 0, 20, 0]]; let a = 20, b = 0, c = 20, d = 0; for (let i = 1; i <= n; i++) { const D = a - b; a -= 0.1 * D; b += 0.1 * D; c -= 0.1 * (c - d); d += 0.1 * (c - d); R.push([i, a, b, c, d]); } return R; }
// 水そう：左上 (x, yb は底)、はば w、高さ（cm を s 倍の px）
function tank(cv, x, yb, w, H, h, s, col, sty, name) {
  const top = yb - H * s;
  cv.rect(x, yb - h * s, w, h * s, { fill: col, alpha: 0.35 });
  cv.line([[x, top], [x, yb], [x + w, yb], [x + w, top]], { color: 'ink', width: 2.2 });
  cv.line([[x, yb - h * s], [x + w, yb - h * s]], { color: col, width: 2.5, style: sty });
  cv.text(name, x + w / 2, yb + 16, { size: 15, align: 'center' });
  cv.text(A.num(h, 1) + ' cm', x + w / 2, yb - h * s - 12, { size: 15, align: 'center', color: col, bg: true });
}
function tanksAndGraph(cv, st, eq) {
  const S2 = eq ? 100 : st.S2, [h1, h2] = ex(S2, st.t), s = 13, yb = 390;
  const w1 = 90, w2 = S2 === 100 ? 90 : 156;
  tank(cv, 30, yb, w1, 24, h1, s, 'a', 'solid', '左（100 cm²）');
  tank(cv, 160, yb, w2, 24, h2, s, 'b', 'dash', `右（${S2} cm²）`);
  cv.rect(120, yb - 12, 40, 8, { fill: 'sub', alpha: 0.5, color: 'ink', width: 1 });
  const flow = h1 - h2; if (flow > 0.2) cv.arrow(118, yb - 30, 118 + Math.min(44, 8 + flow * 2.2), yb - 30, { color: 'a', width: 3 });
  if (eq) cv.line([[30, yb - 10 * s], [160 + w2, yb - 10 * s]], { color: 'c', style: 'dot', width: 1.5 });
  const T = eq ? 15 : 30, g = cv.view({ x0: 0, x1: T * 1.05, y0: 0, y1: 22.5, box: [420, 30, 440, 370] });
  g.axes({ xt: eq ? [5, 10, 15] : [10, 20, 30], yt: [5, 10, 15, 20], xl: 't（分）', yl: 'cm' });
  const t = Math.max(0.01, st.t);
  g.plot(x => ex(S2, x)[0], { x0: 0, x1: t, color: 'a', width: 3 });
  g.plot(x => ex(S2, x)[1], { x0: 0, x1: t, color: 'b', width: 3, style: 'dash' });
  if (eq) { g.plot(() => 20, { x0: 0, x1: t, color: 'c', width: 2.5, style: 'dot' }); g.plot(x => 20 * Math.exp(-0.2 * x), { x0: 0, x1: t, color: 'd', width: 2.5, style: 'dashdot' }); }
  else g.plot(x => (100 * ex(S2, x)[0] + S2 * ex(S2, x)[1]) / 100, { x0: 0, x1: t, color: 'c', width: 2.5, style: 'dot' });
}
