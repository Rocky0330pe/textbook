// @id m2-05
// @title 《横線|よこせん》の《高|たか》さで《解|かい》の《個数|こすう》が《変|か》わる
// @vol 数学3
// @from 数学 3-10②⑨（ch3-10:153・505）／3-10⑩、6-12 でも使う
'use strict';
// 本の数：x²=4 → x=±2、x²=0 → 1つ、x²=−4 → ない。投げ上げ y=20t−5t² と高さ 15・20・25 m：
//   t²−4t+3=0（D=4、解 1・3）、t²−4t+4=0（D=0、解 2）、t²−4t+5=0（D=−4、解なし）
const n2 = v => A.num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2);
const sg = v => Math.abs(v) < 1e-9 ? '' : v > 0 ? `+${n2(v)}` : `-${n2(-v)}`;
A.item({
  id: 'm2-05', title: '《横線|よこせん》の《高|たか》さで《解|かい》の《個数|こすう》が《変|か》わる', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-10②「2《乗|じょう》して $k$ になる《数|かず》」・3-10⑨「《解|かい》が2つ・1つ・ない：《判別式|はんべつしき》」の《図|ず》から（3-10⑩、《第|だい》6《巻|かん》 6-12 でも《使|つか》う）',
  W: 880, H: 420,
  state: { k: 4, h: 15 },
  scenes: [
    {
      key: 'x2k', label: '① $x^2=k$',
      lead: '$y=x^2$ のグラフと、《高|たか》さ $k$ の《横|よこ》の《直線|ちょくせん》 $y=k$ が《交|まじ》わる《点|てん》の $x$ が、$x^2=k$ の《解|かい》です。▶ を《押|お》すと、《横線|よこせん》が《下|さ》がっていきます。',
      note: '$k$ がプラスなら《交|まじ》わる《点|てん》は2つ（$x=\\pm\\sqrt{k}$）、$k=0$ ならふれる《点|てん》が1つ（$x=0$）、$k$ がマイナスなら《交|まじ》わりません（《解|かい》はない）。《放物線|ほうぶつせん》が《左右対称|さゆうたいしょう》なので、2つの《点|てん》は0から《同|おな》じ《距離|きょり》の《左右|さゆう》にあります。',
      miss: '$x^2=9$ だから $x=3$、と1つだけ《答|こた》えるのはまちがい。$(-3)^2=9$ も《忘|わす》れずに、$x=\\pm3$（3 と $-3$）です。',
      legend: [['$y=x^2$', { color: 'a' }], ['《横|よこ》の《直線|ちょくせん》 $y=k$', { color: 'b', style: 'dash' }], ['《交|まじ》わる《点|てん》（《解|かい》）', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'k', label: '《高|たか》さ $k$', min: -3, max: 9, step: 0.25, d: 2 }],
      init(st) { st.k = 4; },
      step(st, dt) { st.k = Math.max(-2, st.k - dt * 1.2); if (st.k <= -2) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: -4.2, x1: 4.2, y0: -3.4, y1: 10, box: [60, 20, 640, 380] });
        v.axes({ xt: A.range(-4, 4, 1), yt: [-2, 2, 4, 6, 8], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
        v.plot(x => x * x, { color: 'a', width: 3.5 });
        v.line([[-4.2, st.k], [4.2, st.k]], { color: 'b', style: 'dash', width: 2.5 });
        const k = st.k, n = k > 1e-9 ? 2 : Math.abs(k) < 1e-9 ? 1 : 0;
        if (n === 2) for (const x of [-Math.sqrt(k), Math.sqrt(k)]) { v.line([[x, 0], [x, k]], { color: 'sub', style: 'dot', width: 1.5 }); v.dot(x, k, { color: 'b', shape: 'diamond', r: 7 }); v.dot(x, 0, { color: 'b', shape: 'diamond', r: 5 }); }
        if (n === 1) v.dot(0, 0, { color: 'b', shape: 'diamond', r: 8 });
        count(cv, n, `x²＝${n2(k)}`);
      },
      readout: st => { const k = st.k; return k > 1e-9 ? `$x^2=${n2(k)}$ の《解|かい》は　$x=\\pm\\sqrt{${n2(k)}}=\\pm${A.num(Math.sqrt(k), 3).replace(/\.?0+$/, '')}$（2つ）` : Math.abs(k) < 1e-9 ? '$x^2=0$ の《解|かい》は　$x=0$（1つ）' : `$x^2=${n2(k)}$：2《乗|じょう》してマイナスになる《数|かず》はないので、《解|かい》はない`; }
    },
    {
      key: 'hanbetsu', label: '② 《判別式|はんべつしき》 $D$',
      lead: '《真上|まうえ》に 20 m/s で《投|な》げたボールの《高|たか》さは $y=20t-5t^2$。《高|たか》さ $h$ の《横線|よこせん》と《交|まじ》わる《回数|かいすう》が、ボールがその《高|たか》さにいる《時刻|じこく》の《数|かず》です。',
      note: '《高|たか》さ $h$ になる《時刻|じこく》の《方程式|ほうていしき》は、《両辺|りょうへん》から $h$ をひいて $-5$ でわると $t^2-4t+\\frac{h}{5}=0$。《判別式|はんべつしき》 $D=b^2-4ac$ が $D>0$ なら《解|かい》は2つ、$D=0$ なら1つ、$D<0$ ならない。グラフでは、《横|よこ》の《直線|ちょくせん》が《放物線|ほうぶつせん》と2《回|かい》《交|まじ》わる・1《回|かい》だけふれる・《交|まじ》わらない、に《対応|たいおう》します。',
      legend: [['$y=20t-5t^2$', { color: 'a' }], ['《高|たか》さ $h$ の《横線|よこせん》', { color: 'b', style: 'dash' }], ['その《高|たか》さにいる《時刻|じこく》', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'h', label: '《高|たか》さ $h$〔m〕', min: 0, max: 28, step: 0.5, d: 1 }],
      init(st) { st.h = 0; },
      step(st, dt) { st.h = Math.min(25, st.h + dt * 4); if (st.h >= 25) return false; },
      draw(cv, st) {
        const v = cv.view({ x0: 0, x1: 4.6, y0: 0, y1: 29, box: [60, 20, 520, 370] });
        v.axes({ xt: [1, 2, 3, 4], yt: [5, 10, 15, 20, 25], xl: 't（びょう）', yl: 'y（m）' });
        v.plot(t => 20 * t - 5 * t * t, { x0: 0, x1: 4, color: 'a', width: 3.5 });
        v.line([[0, st.h], [4.5, st.h]], { color: 'b', style: 'dash', width: 2.5 });
        const D = 16 - 4 * st.h / 5, n = D > 1e-9 ? 2 : Math.abs(D) < 1e-9 ? 1 : 0;
        if (n === 2) for (const t of [2 - Math.sqrt(D) / 2, 2 + Math.sqrt(D) / 2]) { v.line([[t, 0], [t, st.h]], { color: 'sub', style: 'dot', width: 1.5 }); v.dot(t, st.h, { color: 'b', shape: 'diamond', r: 7 }); }
        if (n === 1) v.dot(2, 20, { color: 'b', shape: 'diamond', r: 8 });
        count(cv, n, `D＝${n2(D)}`);
        // 本の表
        const X0 = 600, rows = [[15, '16−12＝4', '2つ（1、3）'], [20, '16−16＝0', '1つ（2）'], [25, '16−20＝−4', 'ない']];
        cv.text('たかさ', X0, 200, { size: 15, color: 'sub' }); cv.text('D', X0 + 58, 200, { size: 16, color: 'sub', math: true, italic: true }); cv.text('かい', X0 + 172, 200, { size: 15, color: 'sub' });
        rows.forEach(([h, d, s], k) => { const y = 232 + k * 32, on = Math.abs(st.h - h) < 1e-9; if (on) cv.rect(X0 - 8, y - 15, 280, 30, { fill: 'hl', alpha: 1 }); cv.text(h + ' m', X0, y, { size: 15, bold: on }); cv.text(d, X0 + 58, y, { size: 15, bold: on }); cv.text(s, X0 + 172, y, { size: 15, bold: on }); });
      },
      readout: st => { const c = st.h / 5, D = 16 - 4 * c, n = D > 1e-9 ? 2 : Math.abs(D) < 1e-9 ? 1 : 0; return `《方程式|ほうていしき》 $t^2-4t${sg(c)}=0$　　$D=(-4)^2-4\\times1\\times${n2(c)}=${n2(D)}$　→　${n === 2 ? `《解|かい》は2つ：$t=${A.num(2 - Math.sqrt(D) / 2, 2)}$、$${A.num(2 + Math.sqrt(D) / 2, 2)}$（《秒|びょう》）` : n === 1 ? '《解|かい》は1つ：$t=2$（《秒|びょう》）' : '《解|かい》はない（その《高|たか》さに《届|とど》かない）'}`; }
    }
  ]
});

// 交わる回数を、大きな字で書く（色だけでなく、ことばでも）
function count(cv, n, sub) {
  const t = ['まじわらない（0かい）', 'ふれる（1かい）', 'まじわる（2かい）'][n];
  cv.text(t, 860, 40, { align: 'right', size: 18, bold: true, color: n === 0 ? 'sub' : 'b' });
  cv.text(sub, 860, 70, { align: 'right', size: 16, color: 'sub' });
}
