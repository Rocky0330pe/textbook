// @id m3-15
// @title 1歩ずつ進む：オイラー法のずれとこわれ方
// @vol 数学6
// @from 数学 6-2 ①⑤⑥⑨⑩⑪（ch6-02:135・292・327・525・602・884）、6-0 ①（ch6-00:240）、5-8、6-10 ③
'use strict';
// 本と同じ式・同じ刻み：冷めるお湯 dT/dt = −0.05(T−20)、はじめ 80℃。ばね a = −16x、はじめ x=0.1・v=0、Δt=0.02 s。
const rate = T => -0.05 * (T - 20);
const trueT = t => 20 + 60 * Math.exp(-0.05 * t);
function euler(dt, tEnd) { const p = [[0, 80]]; let T = 80; const n = Math.round(tEnd / dt); for (let i = 1; i <= n; i++) { T = T + rate(T) * dt; p.push([i * dt, T]); } return p; }

A.item({
  id: 'm3-15', title: '1歩ずつ進む：オイラー法のずれとこわれ方',
  from: '数学 第6巻 6-2 ①⑤⑥⑨⑩⑪ の図から（6-0、5-8、6-10 ③ でも使う）',
  W: 880, H: 440,
  state: { dt: 1, dtz: 1, dtf: 30, meth: 'b', dts: 0.02 },
  scenes: [
    {
      key: 'ippo', label: '① 接線にそって1歩',
      lead: '「次の温度＝今の温度＋今の変わる速さ×$\\Delta t$」。▶ か「1歩進む」で、今いる点の接線の向きに $\\Delta t$ だけ進みます（冷めるお湯、はじめ 80 ℃）。',
      note: 'オレンジの点は、どれも1つ前の点での接線の上にあります。青い線（ほんとうの温度 $T=20+60e^{-0.05t}$）は曲がっていて、接線は線より下にあるので、1歩ごとに少し下へずれます。$\\Delta t=1$ 分なら 10 分後は 55.92 ℃（ほんとうは 56.39 ℃）。2-18 の冷めるお湯の表と同じ数です。',
      miss: '$\\Delta t$ をかけ忘れないように（$\\Delta t=0.5$ なら $80+(-3)\\times0.5=78.5$）。また、使う速さは「今」（1つ上の行）の速さです。1分後の温度を、1分のときの速さ $-2.85$ で計算するのはまちがいです。',
      legend: [['ほんとうの温度', { color: 'a' }], ['1歩ずつ進めた温度', { color: 'b', shape: 'circle' }], ['次の1歩（接線の向き）', { color: 'ink', style: 'dash' }]],
      controls: [{ range: 'dt', label: '$\\Delta t$〔分〕', min: 0.5, max: 5, step: 0.5, d: 1, on: st => { st.n = 0; st.acc = 0; } }, { button: '1歩進む', act: st => { stepOne(st); } }],
      init(st) { st.n = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 0.7) { st.acc = 0; if (!stepOne(st)) return false; } if (st.n * st.dt >= 10 - 1e-9) return false; },
      draw(cv, st) {
        const p = euler(st.dt, 10).slice(0, st.n + 1);
        const v = cv.view({ x0: 0, x1: 10.6, y0: 50, y1: 82.5, box: [70, 20, 560, 370] });
        v.axes({ xt: A.range(0, 10, 1), yt: [50, 55, 60, 65, 70, 75, 80], ax: 50, xl: 't（分）', yl: 'T（℃）' });
        v.plot(trueT, { x0: 0, x1: 10.4, color: 'a', width: 2.5 });
        v.line(p, { color: 'b', width: 2 });
        p.forEach(q => v.dot(q[0], q[1], { color: 'b', r: 5 }));
        const [t, T] = p[p.length - 1];
        if (t < 10 - 1e-9) {
          const s = rate(T), t2 = t + st.dt;
          v.line([[t, T], [t2, T + s * st.dt]], { color: 'ink', style: 'dash', width: 2 });
          v.line([[t, T], [t2, T], [t2, T + s * st.dt]], { color: 'sub', style: 'dot', width: 1.5 });
          v.text('Δt = ' + A.num(st.dt, 1), (t + t2) / 2, T + 1.1, { size: 15, align: 'center', bg: true });
          v.text('速さ×Δt = ' + A.num(s * st.dt, 2), t2 + 0.15, T + s * st.dt / 2, { size: 15, bg: true });
        }
        // 右：表（本の表と同じ形）
        table(cv, 600, 30, ['t', 'T', '速さ', 'ほんとう'], p.slice(-11).map(([t, T]) => [A.num(t, 1), A.num(T, 2), A.num(rate(T), 2), A.num(trueT(t), 2)]));
      },
      readout: st => { const p = euler(st.dt, 10)[st.n]; return `${A.num(p[0], 1)} 分後：オイラー法 <b>${A.num(p[1], 2)} ℃</b>、ほんとう ${A.num(trueT(p[0]), 2)} ℃、ずれ ${A.num(trueT(p[0]) - p[1], 2)} ℃`; }
    },
    {
      key: 'zure', label: '② Δt を小さく',
      lead: '$\\Delta t$ を 5・2・1・0.5・0.1 分に変えて、10 分後の温度をくらべます。▶ で計算が進みます。',
      note: '$\\Delta t$ を半分にすると（2→1→0.5）、ずれもほぼ半分になります（0.96、0.47、0.23）。右のグラフの点は、原点を通る直線にほぼのります。ずれは $\\Delta t$ に比例します（**1次の方法**）。そのかわり、歩数はふえます。',
      legend: [['ほんとうの温度', { color: 'a' }], ['オイラー法（選んだ $\\Delta t$）', { color: 'b', shape: 'circle' }], ['ずれ＝0.47×$\\Delta t$', { color: 'sub', style: 'dash' }]],
      controls: [{ seg: 'dtz', label: '$\\Delta t$〔分〕', options: [[5, '5'], [2, '2'], [1, '1'], [0.5, '0.5'], [0.1, '0.1']], on: st => { st.time = 0; } }],
      init(st) { st.time = 0; },
      step(st, dt) { st.time += dt * 3; if (st.time >= 10) { st.time = 10; return false; } },
      draw(cv, st) {
        const all = euler(st.dtz, 10), p = all.filter(q => q[0] <= st.time + 1e-9);
        const v = cv.view({ x0: 0, x1: 10.6, y0: 50, y1: 82.5, box: [70, 20, 480, 370] });
        v.axes({ xt: A.range(0, 10, 2), yt: [50, 60, 70, 80], ax: 50, xl: 't（分）', yl: 'T（℃）' });
        v.plot(trueT, { x0: 0, x1: 10.4, color: 'a', width: 2.5 });
        v.line(p, { color: 'b', width: 2 });
        if (st.dtz >= 0.5) p.forEach(q => v.dot(q[0], q[1], { color: 'b', r: st.dtz >= 1 ? 5 : 3.5 }));
        const last = p[p.length - 1]; v.dot(last[0], last[1], { color: 'b', r: 6 });
        // 右：ずれのグラフ
        const g = cv.view({ x0: 0, x1: 5.6, y0: 0, y1: 2.9, box: [630, 40, 220, 300] });
        g.axes({ xt: [1, 2, 3, 4, 5], yt: [1, 2], xl: 'Δt', yl: 'ずれ（℃）' });
        g.plot(x => 0.47 * x, { x0: 0, x1: 5.5, color: 'sub', style: 'dash', width: 1.5 });
        for (const d of [5, 2, 1, 0.5, 0.1]) { const e = trueT(10) - euler(d, 10).pop()[1]; g.dot(d, e, { color: d === st.dtz ? 'b' : 'sub', r: d === st.dtz ? 7 : 4.5, shape: d === st.dtz ? 'diamond' : 'circle' }); }
      },
      readout: st => { const n = Math.round(10 / st.dtz), T = euler(st.dtz, 10).pop()[1]; return `$\\Delta t=$ ${st.dtz} 分：${n} 歩で 10 分後 <b>${A.num(T, st.dtz < 0.5 ? 3 : 2)} ℃</b>　ほんとう 56.39 ℃　ずれ ${A.num(trueT(10) - T, st.dtz < 0.5 ? 3 : 2)} ℃`; }
    },
    {
      key: 'furafura', label: '③ 大きすぎる Δt',
      lead: '計算を楽にしようと $\\Delta t$ を大きくすると、どうなるでしょう。▶ で1歩ずつ進めます（はじめは $\\Delta t=30$ 分）。',
      note: '差（温度−20）は、1歩ごとに $(1-0.05\\,\\Delta t)$ 倍になります。$\\Delta t=30$ なら $-0.5$ 倍で、＋と−が毎回入れかわるので**ふらふら**します。$\\Delta t\\leqq20$ ならふらふらせず、$\\Delta t<40$ ならこわれません。$\\Delta t=50$ では $-1.5$ 倍で、ふらふらしながら差が大きくなり、計算がこわれます（**数値の不安定**）。',
      miss: '$\\Delta t$ は、ようすが変わる時間（このお湯なら 1÷0.05＝20 分）よりずっと短くします。部屋より冷たいお湯のような、ありえない数が出たら、$\\Delta t$ を小さくして計算しなおします。',
      legend: [['ほんとうの温度', { color: 'a' }], ['オイラー法', { color: 'b', shape: 'circle' }], ['部屋 20 ℃', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'dtf', label: '$\\Delta t$〔分〕', min: 5, max: 50, step: 1, d: 0, on: st => { st.n = 0; st.acc = 0; } }],
      init(st) { st.n = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 0.6) { st.acc = 0; st.n++; } if ((st.n + 1) * st.dtf > 195) return false; },
      draw(cv, st) {
        const p = euler(st.dtf, 200).slice(0, st.n + 1);
        const v = cv.view({ x0: 0, x1: 205, y0: -40, y1: 100, box: [70, 20, 760, 340] });
        v.axes({ xt: A.range(0, 180, 30), yt: [-20, 0, 20, 40, 60, 80], xl: 't（分）', yl: 'T（℃）' });
        v.plot(() => 20, { x0: 0, x1: 200, color: 'sub', style: 'dash', width: 1.5 });
        v.plot(trueT, { x0: 0, x1: 200, color: 'a', width: 2.5 });
        v.clip(() => { v.line(p, { color: 'b', width: 2 }); p.forEach(q => v.dot(q[0], q[1], { color: 'b', r: 5 })); });
        // 画面の外へ出た点は、はしに矢印と数
        p.forEach(([t, T]) => { if (T > 100 || T < -40) { const y = T > 100 ? 100 : -40; v.arrow(t, T > 100 ? 92 : -32, t, y, { color: 'b', width: 2 }); v.text(A.num(T, 0) + ' ℃', t + 2, T > 100 ? 88 : -28, { color: 'b', size: 15, bg: true }); } });
        const r = 1 - 0.05 * st.dtf;
        const kind = st.dtf <= 20 ? 'ふらふらしない' : st.dtf < 40 ? 'ふらふらする（こわれない）' : st.dtf === 40 ? 'ふらふらが小さくならない' : 'ふらふらしながら大きくなる：こわれる';
        cv.text(`1歩で差は ${A.num(r, 2)} 倍 → ${kind}`, 450, 395, { size: 17, bold: true, align: 'center', color: st.dtf < 40 ? 'ink' : 'b' });
      },
      readout: st => { const p = euler(st.dtf, 200).slice(0, st.n + 1); return `$\\Delta t=$ ${st.dtf} 分：` + p.slice(0, 7).map(q => String(+q[1].toFixed(3)).replace('-', '−')).join(' → ') + (p.length > 7 ? ' …' : '') + ' ℃'; }
    },
    {
      key: 'bane', label: '④ ばね：うずと円',
      lead: 'ばね $a=-16x$（はじめ $x=0.1$、$v=0$）を $\\Delta t=0.02$ s で進めます。左は点 $(x,\\ v/4)$、右は $x$ のグラフです。▶ で5秒まで進めます。',
      note: 'ふつうのオイラー法の1歩は円の接線の向きにまっすぐ進むので、1歩ごとに円の外へ出ます（半径が $\\sqrt{1+(4\\Delta t)^2}$ 倍。$\\Delta t=0.02$ なら 1.0032 倍、1周で約 1.29 倍）。山は 0.1、0.129、0.165、0.212 m とふくらみます。**速度を先に進める**と、1歩の向きが少し内側にかたむき、半径 0.1 の円の上を回り続けます。',
      miss: 'ばねの表で、位置を古い速度で進める（表計算で B3 に =B2+C2*＄E＄2 と書く）と、ゆれがふくらみます。新しい速度 C3 で進めます。ばねが勝手に大きくゆれだしたら、計算の順番をうたがいましょう。',
      legend: [['ほんとう（半径 0.1 の円・$0.1\\cos4t$）', { color: 'sub' }], ['ふつうのオイラー法', { color: 'b' }], ['速度を先に進めるオイラー法', { color: 'a', style: 'dash' }]],
      controls: [{ seg: 'meth', label: '計算の方法', options: [['f', 'ふつう'], ['s', '速度を先に'], ['b', '両方']] }, { range: 'dts', label: '$\\Delta t$〔s〕', min: 0.005, max: 0.1, step: 0.005, d: 3, on: st => { st.time = 0; } }],
      init(st) { st.time = 0; },
      step(st, dt) { st.time += dt * 0.8; if (st.time >= 5) { st.time = 5; return false; } },
      draw(cv, st) {
        const F = spring(st.dts, false, st.time), S = spring(st.dts, true, st.time);
        const P = cv.view({ x0: -0.24, x1: 0.24, y0: -0.24, y1: 0.24, box: [20, 20, 360, 360], equal: true });
        P.axes({ xt: [-0.2, 0.2], yt: [-0.2, 0.2], xl: 'x', yl: 'v/4', fmt: v => A.num(v, 1) });
        P.text('半径 0.1', 0.075, 0.085, { size: 15, color: 'sub', bg: true });
        P.circle(0, 0, 0.1, { color: 'sub', width: 2.5 });
        P.clip(() => {
          if (st.meth !== 's') { P.line(F.map(q => [q[1], q[2] / 4]), { color: 'b', width: 2 }); const q = F[F.length - 1]; P.dot(q[1], q[2] / 4, { color: 'b', r: 6 }); }
          if (st.meth !== 'f') { P.line(S.map(q => [q[1], q[2] / 4]), { color: 'a', style: 'dash', width: 2.2 }); const q = S[S.length - 1]; P.dot(q[1], q[2] / 4, { color: 'a', r: 6, shape: 'square' }); }
        });
        P.dot(0.1, 0, { color: 'ink', r: 4 });
        const G = cv.view({ x0: 0, x1: 5.2, y0: -0.25, y1: 0.25, box: [440, 30, 420, 330] });
        G.axes({ xt: [1, 2, 3, 4, 5], yt: [-0.2, -0.1, 0.1, 0.2], xl: 't（s）', yl: 'x（m）', fmt: v => A.num(v, v % 1 ? 1 : 0) });
        G.plot(t => 0.1 * Math.cos(4 * t), { x0: 0, x1: 5, color: 'sub', width: 3, alpha: 0.6 });
        G.clip(() => {
          if (st.meth !== 's') G.line(F.map(q => [q[0], q[1]]), { color: 'b', width: 2 });
          if (st.meth !== 'f') G.line(S.map(q => [q[0], q[1]]), { color: 'a', style: 'dash', width: 2.2 });
        });
        const rF = Math.hypot(F[F.length - 1][1], F[F.length - 1][2] / 4), rS = Math.hypot(S[S.length - 1][1], S[S.length - 1][2] / 4);
        if (st.meth !== 's' && rF > 0.24) cv.text(`ふつう：半径 ${A.num(rF, 2)} m（画面の外）`, 200, 400, { color: 'b', size: 15, align: 'center', bold: true });
        void rS;
      },
      readout: st => {
        const F = spring(st.dts, false, st.time), S = spring(st.dts, true, st.time), f = F[F.length - 1], s = S[S.length - 1];
        return `${A.num(st.time, 2)} s　半径 $\\sqrt{x^2+(v/4)^2}$：ふつう <b>${A.num(Math.hypot(f[1], f[2] / 4), 4)}</b> m、速度を先に ${A.num(Math.hypot(s[1], s[2] / 4), 4)} m（はじめ 0.1）　1歩で $\\sqrt{1+(4\\Delta t)^2}=$ ${A.num(Math.sqrt(1 + 16 * st.dts * st.dts), 4)} 倍`;
      }
    }
  ]
});

function stepOne(st) { if ((st.n + 1) * st.dt > 10 + 1e-9) return false; st.n++; return true; }
// ばね a=−16x を tEnd まで。semi=true は速度を先に進める（6-2 ⑪）。[t, x, v] の列
function spring(dt, semi, tEnd) {
  let x = 0.1, v = 0; const p = [[0, x, v]], n = Math.floor(tEnd / dt + 1e-9);
  for (let i = 1; i <= n; i++) { const a = -16 * x; if (semi) { v = v + a * dt; x = x + v * dt; } else { const xn = x + v * dt; v = v + a * dt; x = xn; } p.push([i * dt, x, v]); }
  return p;
}
// 表（見出しと行）
function table(cv, x, y, head, rows) {
  const w = [44, 70, 60, 76], h = 27;
  let cx = x; head.forEach((s, k) => { cv.text(s, cx + w[k] / 2, y, { size: 15, bold: true, align: 'center', color: 'sub' }); cx += w[k]; });
  cv.line([[x, y + 13], [x + w.reduce((a, b) => a + b), y + 13]], { color: 'line', width: 1 });
  rows.forEach((r, i) => { let cx2 = x; r.forEach((s, k) => { cv.text(s, cx2 + w[k] - 6, y + h * (i + 1) + 2, { size: 15, align: 'right', color: k === 1 ? 'b' : k === 3 ? 'a' : 'ink' }); cx2 += w[k]; }); });
}
