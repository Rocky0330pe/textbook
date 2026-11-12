// @id m1-25
// @title 《追|お》いかけっこと1《次方程式|じほうていしき》
// @vol 数学2
// @from 数学 2-16 1次方程式（ch2-16:51-66・109-132・339-351・360-373）／2-3・3-6・力-1 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。兄は秒速 4 m、弟は 10 m 先から秒速 2 m（本の例）

const fmt = v => A.num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1);
// 追いつく時刻（なければ null）
const meet = (va, vb, d) => va === vb ? null : d / (va - vb);

function race(cv, st, o) {
  const va = st.va, vb = st.vb, d = st.d, t = st.t, T = o.T;
  const xa = va * t, xb = d + vb * t, M = Math.max(32, Math.ceil((Math.max(va, d + vb * T, va * T) + 2) / 4) * 4);
  // ---- 上：道 ----
  const L = 60, R = 840, Y = 70, X = m => L + m / M * (R - L);
  cv.line([[L - 20, Y], [R + 10, Y]], { color: 'grid', width: 6 });
  for (let m = 0; m <= M; m += 4) { cv.line([[X(m), Y - 5], [X(m), Y + 5]], { color: 'ink', width: 1.2 }); cv.text(String(m), X(m), Y + 20, { align: 'center', size: 13 }); }
  cv.text('m', R + 20, Y + 20, { size: 13, color: 'sub' });
  const gap = xb - xa;
  if (Math.abs(gap) > 0.05) {
    cv.arrow(X(xa), Y - 30, X(xb), Y - 30, { color: 'b', width: 1.5, head: 8 }); cv.arrow(X(xb), Y - 30, X(xa), Y - 30, { color: 'b', width: 1.5, head: 8 });
    cv.text(`差 ${fmt(Math.abs(gap))} m`, (X(xa) + X(xb)) / 2, Y - 44, { align: 'center', size: 14, color: 'b', bold: true });
  } else cv.text('同じ場所！', X(xa), Y - 40, { align: 'center', size: 15, color: 'b', bold: true });
  cv.dot(X(xa), Y - 10, { color: 'a', r: 9 }); cv.text('兄', X(xa), Y - 10, { align: 'center', size: 13, color: 'bg', bold: true });
  cv.dot(X(xb), Y - 10, { color: 'e', r: 9, shape: 'square' }); cv.text('弟', X(xb), Y - 10, { align: 'center', size: 13, color: 'bg', bold: true });
  // ---- 左下：表 ----
  const tx = 20, ty = 160, cw = 40, rh = 30, cols = Math.floor(T) + 1, tm = meet(va, vb, d);
  const head = ['t（秒）', '兄', '弟', '差'];
  head.forEach((h, i) => cv.text(h, tx + 56, ty + i * rh, { align: 'right', size: 14, bold: i > 0, color: i === 1 ? 'a' : i === 2 ? 'e' : i === 3 ? 'b' : 'sub' }));
  for (let k = 0; k < cols; k++) {
    const x = tx + 64 + k * cw + cw / 2, shown = k <= t + 1e-9;
    const eq = va * k === d + vb * k;
    if (shown && eq) cv.rect(x - cw / 2, ty - 14, cw, rh * 4 - 2, { fill: 'hl', alpha: 1 });
    cv.text(String(k), x, ty, { align: 'center', size: 14, color: 'sub' });
    if (!shown) continue;
    cv.text(fmt(va * k), x, ty + rh, { align: 'center', size: 14 });
    cv.text(fmt(d + vb * k), x, ty + 2 * rh, { align: 'center', size: 14 });
    cv.text(fmt(d + vb * k - va * k), x, ty + 3 * rh, { align: 'center', size: 14, color: 'b' });
  }
  // 表のあいだの答え（4.5 秒など）
  if (tm != null && tm > 0 && tm <= T && Math.abs(tm - Math.round(tm)) > 1e-9 && t >= tm) {
    const x = tx + 64 + tm * cw + cw / 2;
    cv.line([[x, ty - 16], [x, ty + 3 * rh + 14]], { color: 'b', width: 2.5, style: 'dash' });
    cv.text(`表のあいだ：${fmt(tm)} 秒`, x, ty + 3 * rh + 32, { align: 'center', size: 14, bold: true, color: 'b' });
  }
  // ---- 右下：グラフ ----
  const ym = Math.max(34, Math.ceil(Math.max(va * T, d + vb * T) / 10) * 10 + 4);
  const g = cv.view({ x0: 0, x1: T + 0.6, y0: 0, y1: ym, box: [470, 140, 370, 250] });
  g.axes({ xt: A.range(0, T), yt: A.range(0, ym - 4, 10), xl: 't（秒）', yl: 'いち（m）' });
  g.plot(s => va * s, { x0: 0, x1: T, color: 'a', width: 1, alpha: 0.3 });
  g.plot(s => d + vb * s, { x0: 0, x1: T, color: 'e', width: 1, alpha: 0.3, style: 'dash' });
  g.plot(s => va * s, { x0: 0, x1: t, color: 'a', width: 3 });
  g.plot(s => d + vb * s, { x0: 0, x1: t, color: 'e', width: 3, style: 'dash' });
  for (let k = 0; k <= Math.min(T, t + 1e-9); k++) { g.dot(k, va * k, { color: 'a', r: 4 }); g.dot(k, d + vb * k, { color: 'e', r: 4, shape: 'square' }); }
  if (tm != null && tm >= 0 && tm <= T && t >= tm - 1e-9) {
    g.dot(tm, va * tm, { color: 'b', r: 8, shape: 'diamond' });
    g.text(`${fmt(tm)} 秒後に ${fmt(va * tm)} m`, tm - 0.2, va * tm + ym * 0.08, { align: 'right', size: 14, bold: true, color: 'b', bg: true });
  }
  if (o.para && va === vb) g.text('2本の線は、まじわらない', T / 2, d + vb * T / 2 + ym * 0.1, { align: 'center', size: 15, bold: true, color: 'b', bg: true });
}
// 方程式の1行ずつ
function steps(st) {
  const { va, vb, d } = st, dv = va - vb;
  const c = k => k === 1 ? '' : k === -1 ? '-' : String(k);   // 係数（1t は t と書く）
  const s1 = `$${c(va)}t=${d}+${c(vb)}t$`, s2 = `$${c(va)}t-${c(vb)}t=${d}$`;
  if (dv === 0) return `${s1} → ${s2} → $0=${d}$（《解|かい》がない：いつまでも ${d} m はなれたまま）`;
  const tm = d / dv;
  if (dv < 0) return `${s1} → ${s2} → $${c(dv)}t=${d}$ → $t=${fmt(tm)}$（《時刻|じこく》がマイナス：《兄|あに》のほうがおそいので、《追|お》いつかない）`;
  return `${s1} → ${s2} → $${c(dv)}t=${d}$ → <b>$t=${fmt(tm)}$</b>（たしかめ：$${va}\\times${fmt(tm)}=${fmt(va * tm)}$、$${d}+${vb}\\times${fmt(tm)}=${fmt(d + vb * tm)}$）`;
}

A.item({
  id: 'm1-25', title: '《追|お》いかけっこと1《次方程式|じほうていしき》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-16「1《次方程式|じほうていしき》」の《図|ず》から（2-3・3-6、《物理|ぶつり》 《力|りき》-1 でも《使|つか》う）',
  W: 880, H: 420,
  state: { t: 0, va: 4, vb: 2, d: 10 },
  scenes: [
    {
      key: 'oikake', label: '① 《表|ひょう》・グラフ・《方程式|ほうていしき》',
      lead: '《弟|おとうと》は《兄|あに》より10 m《前|まえ》から《秒速|びょうそく》2 m、《兄|あに》は《秒速|びょうそく》4 m で《同|おな》じときに《走|はし》り《出|だ》します。▶ で、《表|ひょう》とグラフが《同時|どうじ》にできていきます。',
      note: '《兄|あに》の《位置|いち》は $4t$、《弟|おとうと》は $10+2t$。《差|さ》は1《秒|びょう》に $4-2=2$ m ずつちぢまり、5《秒後|びょうご》に0。グラフでは2《本|ほん》の《線|せん》が $t=5$、20 m で《交|まじ》わります。《方程式|ほうていしき》 $4t=10+2t$ を《解|と》いても $t=5$。**《表|ひょう》・グラフ・《方程式|ほうていしき》で、《同|おな》じ《答|こた》え**になります。',
      legend: [['《兄|あに》 $4t$', { color: 'a', shape: 'circle' }], ['《弟|おとうと》 $10+2t$', { color: 'e', style: 'dash', shape: 'square' }], ['《差|さ》・《追|お》いつく《点|てん》', { color: 'b', shape: 'diamond' }]],
      controls: [{ range: 't', label: '《時間|じかん》 $t$', min: 0, max: 8, step: 0.1, fmt: v => A.num(v, 1) + ' 《秒|びょう》' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(8, st.t + dt * 0.8); if (st.t >= 8) return false; },
      draw(cv, st) { race(cv, st, { T: 8 }); },
      readout: st => `${A.num(st.t, 1)} 《秒後|びょうご》：《兄|あに》 ${A.num(4 * st.t, 1)} m、《弟|おとうと》 ${A.num(10 + 2 * st.t, 1)} m、《差|さ》 ${A.num(Math.abs(10 - 2 * st.t), 1)} m${st.t >= 5 ? '　　' + steps(st) : ''}`
    },
    {
      key: 'aida', label: '② 《表|ひょう》のあいだの《答|こた》え',
      lead: '《弟|おとうと》が9 m《先|さき》からスタートしたら？　▶ で《走|はし》らせて、《表|ひょう》に《同|おな》じ《数|かず》があるか《見|み》ましょう。',
      note: '4《秒後|びょうご》はまだ《弟|おとうと》が《前|まえ》（16＜17）、5《秒後|びょうご》は《兄|あに》が《前|まえ》（20＞19）。《表|ひょう》のどこにも《同|おな》じ《数|かず》がありません。《方程式|ほうていしき》なら $4t=9+2t$、$2t=9$、$t=4.5$ と、**ぴったり《求|もと》まります**。',
      miss: '《表|ひょう》の《数|かず》だけ《見|み》て「《追|お》いつかない」としないこと。《差|さ》がプラスからマイナスに《変|か》わったら、そのあいだで《追|お》いこしています。',
      state: { d: 9 },
      legend: [['《兄|あに》 $4t$', { color: 'a', shape: 'circle' }], ['《弟|おとうと》', { color: 'e', style: 'dash', shape: 'square' }], ['《追|お》いつく《点|てん》', { color: 'b', shape: 'diamond' }]],
      controls: [{ range: 'd', label: 'はじめの《差|さ》', min: 1, max: 14, step: 1, fmt: v => v + ' m', on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(7, st.t + dt * 0.8); if (st.t >= 7) return false; },
      draw(cv, st) { race(cv, st, { T: 7 }); },
      readout: st => steps(st)
    },
    {
      key: 'onaji', label: '③ 《同|おな》じ《速|はや》さなら？',
      lead: '2《人|にん》の《速|はや》さを《変|か》えてみましょう。《同|おな》じ《速|はや》さにすると、どうなるでしょう。',
      note: '2《人|にん》とも《秒速|びょうそく》2 m なら、$2t=10+2t$。$2t$ を《移項|いこう》すると $0=10$ になり、$t$ に《何|なに》を《入|い》れても《成|な》り《立|た》ちません。この《方程式|ほうていしき》には**《解|かい》がありません**。グラフでは2《本|ほん》の《線|せん》が《平行|へいこう》で、《交|まじ》わりません。',
      state: { va: 2, vb: 2, d: 10 },
      legend: [['《兄|あに》', { color: 'a', shape: 'circle' }], ['《弟|おとうと》（10 m《先|さき》から）', { color: 'e', style: 'dash', shape: 'square' }]],
      controls: [{ range: 'va', label: '《兄|あに》の《速|はや》さ', min: 1, max: 6, step: 1, fmt: v => v + ' m/s', on(st) { st.t = 0; } }, { range: 'vb', label: '《弟|おとうと》の《速|はや》さ', min: 1, max: 6, step: 1, fmt: v => v + ' m/s', on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(8, st.t + dt * 0.8); if (st.t >= 8) return false; },
      draw(cv, st) { race(cv, st, { T: 8, para: true }); },
      readout: st => steps(st)
    }
  ]
});
