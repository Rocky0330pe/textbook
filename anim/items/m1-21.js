// @id m1-21
// @title √2 と π をはさみうち
// @vol 数学2
// @from 数学 2-8 平方根（ch2-08:32-42・151-173）・2-9 有理数と無理数（ch2-09:189-197・221-235）／5-2・5-3・4-4・2-19・4-5 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける

// 整数 N を 10^d でわった小数の文字（けたを正確に）
function dec(N, d) { const s = String(N).padStart(d + 1, '0'); return d ? s.slice(0, -d) + '.' + s.slice(-d) : s; }
// √2 を k けたではさむ：a = ⌊√2·10^k⌋
const lowK = k => { let a = Math.floor(Math.SQRT2 * Math.pow(10, k)); const q = Math.pow(10, 2 * k) * 2; while (a * a > q) a--; while ((a + 1) * (a + 1) <= q) a++; return a; };

// ---------- ① √2 をはさむ ----------
function drawHasami(cv, st) {
  const K = Math.max(1, Math.round(st.k)), first = Math.max(0, K - 3), L = 40, R = 560;
  for (let i = first, row = 0; i < K; i++, row++) {
    const y = 60 + row * 115, a = i === 0 ? 1 : lowK(i), lo = i === 0 ? 1 : a / Math.pow(10, i), w = Math.pow(10, -i), X = x => L + (x - lo) / w * (R - L);
    const an = lowK(i + 1), nlo = an / Math.pow(10, i + 1), nhi = nlo + w / 10;
    // つぎの線へ広げる台形
    if (i < K - 1) cv.poly([[X(nlo), y + 8], [X(nhi), y + 8], [R, y + 107], [L, y + 107]], { fill: 'a', alpha: 0.08 });
    cv.rect(X(nlo), y - 8, X(nhi) - X(nlo), 16, { fill: 'a', alpha: 0.35 });
    cv.line([[L - 10, y], [R + 10, y]], { color: 'ink', width: 2 });
    for (let j = 0; j <= 10; j++) { const x = L + j * (R - L) / 10; cv.line([[x, y - 8], [x, y + 8]], { color: 'ink', width: j % 10 ? 1.2 : 2 }); }
    cv.text(dec(i === 0 ? 1 : a, i), L, y + 24, { align: 'center', size: 14 });
    cv.text(dec(i === 0 ? 2 : a + 1, i), R, y + 24, { align: 'center', size: 14 });
    cv.text(dec(an, i + 1), X(nlo) - 3, y - 20, { align: 'right', size: 14, bold: true, color: 'a' });
    cv.text(dec(an + 1, i + 1), X(nhi) + 3, y - 20, { align: 'left', size: 14, bold: true, color: 'b' });
    // 2乗
    cv.text(`${dec(an, i + 1)}² ＝ ${dec(an * an, 2 * i + 2)}`, R + 30, y - 10, { size: 15, color: 'a' });
    cv.text(`${dec(an + 1, i + 1)}² ＝ ${dec((an + 1) * (an + 1), 2 * i + 2)}`, R + 30, y + 14, { size: 15, color: 'b' });
  }
  cv.text('2より小さい ↑　↓ 2より大きい', R + 30, 395, { size: 14, color: 'sub' });
}

// ---------- ② π をはさむ ----------
const inner = n => n * Math.sin(Math.PI / n), outer = n => n * Math.tan(Math.PI / n);
// 本の表と同じく、内側は小さめに、外側は大きめにけたを切る（96 角形からは 4 けた）
const cut = (v, up, d) => { const p = Math.pow(10, d); return (up ? Math.ceil(v * p - 1e-9) : Math.floor(v * p + 1e-9)) / p; };
const digitsFor = n => n >= 96 ? 4 : 3;
function poly(cv, cx, cy, r, n, o) { const pts = []; for (let k = 0; k < n; k++) { const a = Math.PI / 2 + 2 * Math.PI * k / n; pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]); } cv.poly(pts, o); }
function drawPi(cv, st) {
  const n = Math.round(st.n), cx = 200, cy = 205, r = 160, ro = r / Math.cos(Math.PI / n);
  cv.g.save(); cv.g.beginPath(); cv.g.rect(0, 0, 420, 420); cv.g.clip();
  poly(cv, cx, cy, ro, n, { fill: 'b', alpha: 0.08, color: 'b', width: 2, style: 'dash' });
  cv.circle(cx, cy, r, { color: 'ink', width: 2.5 });
  poly(cv, cx, cy, r, n, { fill: 'a', alpha: 0.12, color: 'a', width: 2 });
  cv.line([[cx, cy], [cx + r * Math.cos(Math.PI / 2), cy - r]], { color: 'sub', width: 1.5 });
  cv.dot(cx, cy, { color: 'ink', r: 3 });
  cv.g.restore();
  cv.text(`正${n}角形`, cx, 404, { align: 'center', size: 16, bold: true });
  // 右：数直線（3〜3.5 と、π のまわりを大きくしたもの）
  const d = digitsFor(n), lo = cut(inner(n), false, d), hi = cut(outer(n), true, d);
  const line = (y, a, b, step, lab) => {
    const L = 470, R = 850, X = x => L + (x - a) / (b - a) * (R - L);
    cv.line([[L - 6, y], [R + 6, y]], { color: 'ink', width: 2 });
    for (let v = a; v <= b + 1e-9; v += step) { cv.line([[X(v), y - 6], [X(v), y + 6]], { color: 'ink', width: 1.2 }); }
    for (const v of lab) cv.text(A.num(v, step < 0.01 ? 2 : step < 0.1 ? 2 : 1), X(v), y + 22, { align: 'center', size: 14 });
    const cl = x => A.clamp(x, L - 6, R + 6);
    cv.rect(cl(X(lo)), y - 16, cl(X(hi)) - cl(X(lo)), 10, { fill: 'c', alpha: 0.4 });
    if (X(lo) >= L - 6) cv.dot(X(lo), y - 11, { color: 'a', r: 6, shape: 'tri' });
    if (X(hi) <= R + 6) cv.dot(X(hi), y - 11, { color: 'b', r: 6, shape: 'square' });
    cv.line([[X(Math.PI), y - 26], [X(Math.PI), y + 6]], { color: 'ink', width: 2.5 });
    cv.text('π', X(Math.PI), y - 36, { align: 'center', size: 17, bold: true, math: true, italic: true });
    return X;
  };
  line(80, 3, 3.5, 0.1, [3, 3.1, 3.2, 3.3, 3.4, 3.5]);
  cv.text('3.1〜3.2 を大きくすると', 470, 140, { size: 14, color: 'sub' });
  line(200, 3.1, 3.2, 0.01, [3.1, 3.12, 3.14, 3.16, 3.18, 3.2]);
  cv.text(`うちがわ：まわり÷ちょっけい ${A.num(lo, d)}`, 470, 280, { size: 16, color: 'a', bold: true });
  cv.text(`そとがわ：まわり÷ちょっけい ${A.num(hi, d)}`, 470, 310, { size: 16, color: 'b', bold: true });
  cv.text(`はさむはば ${A.num(hi - lo, d)}`, 470, 340, { size: 16 });
}

// ---------- ③ 分数ではぴったりにならない ----------
const BOOK = [[7, 5], [17, 12], [41, 29], [99, 70], [577, 408]];
function drawBunsu(cv, st) {
  const q = Math.round(st.q), p = Math.round(q * Math.SQRT2), err = p / q - Math.SQRT2;
  // 大きな分数
  cv.text(String(p), 120, 90, { align: 'center', size: 34, bold: true });
  cv.line([[70, 112], [170, 112]], { color: 'ink', width: 3 });
  cv.text(String(q), 120, 136, { align: 'center', size: 34, bold: true });
  cv.text('2乗すると', 120, 180, { align: 'center', size: 15, color: 'sub' });
  cv.text(A.num((p * p) / (q * q), 6), 120, 208, { align: 'center', size: 20, bold: true });
  // 分子×分子 と 分母×分母×2
  const x0 = 260;
  cv.text('分子×分子', x0, 70, { size: 16 }); cv.text(`${p}×${p} ＝ ${p * p}`, x0 + 130, 70, { size: 18, bold: true, color: 'a' });
  cv.text('分母×分母×2', x0, 110, { size: 16 }); cv.text(`${q}×${q}×2 ＝ ${2 * q * q}`, x0 + 130, 110, { size: 18, bold: true, color: 'b' });
  const diff = p * p - 2 * q * q;
  cv.text(diff === 0 ? 'ぴったり同じ' : `ちがい ${diff > 0 ? '+' : '−'}${Math.abs(diff)}（ぴったり同じにならない）`, x0, 150, { size: 16, color: diff ? 'b' : 'c', bold: true });
  // √2 のまわりを大きくした数直線
  const half = Math.max(Math.abs(err) * 2.2, 1e-7), e = Math.pow(10, Math.ceil(Math.log10(half))), a = Math.SQRT2 - half, b = Math.SQRT2 + half;
  const L = 60, R = 840, y = 300, X = x => L + (x - a) / (b - a) * (R - L);
  cv.line([[L, y], [R, y]], { color: 'ink', width: 2 });
  const step = e / 10;
  for (let v = Math.ceil(a / step) * step; v <= b; v += step) cv.line([[X(v), y - 6], [X(v), y + 6]], { color: 'ink', width: 1 });
  cv.line([[X(Math.SQRT2), y - 30], [X(Math.SQRT2), y + 8]], { color: 'ink', width: 3 });
  cv.text('√2 ＝ 1.41421356…', X(Math.SQRT2), y - 42, { align: 'center', size: 15, bold: true });
  cv.dot(X(p / q), y, { color: 'b', r: 8, shape: 'diamond' });
  cv.text(`${p}/${q} ＝ ${A.num(p / q, 8)}…`, X(p / q), y + 30, { align: 'center', size: 15, color: 'b' });
  cv.text(`この線のはば：${A.num(b - a, Math.max(2, Math.ceil(-Math.log10(b - a)) + 1))}`, L, 380, { size: 14, color: 'sub' });
}

A.item({
  id: 'm1-21', title: '√2 と π をはさみうち', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-8「《平方根|へいほうこん》」・2-9「《有理数|ゆうりすう》と《無理数|むりすう》」の《図|ず》から（5-2・5-3・4-4・2-19・4-5 でも《使|つか》う）',
  W: 880, H: 420,
  state: { k: 1, n: 6, q: 5, w: 0, bi: 0 },
  scenes: [
    {
      key: 'hasami', label: '① √2 をはさむ',
      lead: '2《乗|じょう》すると2になる《数|かず》（《面積|めんせき》2 m² の《正方形|せいほうけい》の1《辺|ぺん》）を、2より《小|ちい》さい《数|かず》と《大|おお》きい《数|かず》ではさみます。▶ で、はばを $\\frac{1}{10}$ ずつせまくします。',
      note: '$1.4^2=1.96$、$1.5^2=2.25$ なので1.4と1.5のあいだ。その10《分|ぶん》の1のはばで1.41と1.42、さらに1.414と1.415……。**どこまでせまくしても、ぴったり2にはなりません**。この《数|かず》を $\\sqrt{2}=1.41421356\\cdots$ と《書|か》きます。',
      miss: '$1.4^2=1.4\\times2=2.8$ はまちがい。2《乗|じょう》は《同|おな》じ《数|かず》を2《回|かい》かけること。$1.4^2=1.4\\times1.4=1.96$ です。',
      legend: [['2《乗|じょう》が2より《小|ちい》さい', { color: 'a', shape: 'square', noline: true }], ['2《乗|じょう》が2より《大|おお》きい', { color: 'b', shape: 'square', noline: true }], ['つぎの《線|せん》で10《倍|ばい》に《大|おお》きくする《所|ところ》', { color: 'a', style: 'solid' }]],
      controls: [{ range: 'k', label: 'けた《数|すう》', min: 1, max: 6, step: 1, d: 0 }],
      init(st) { st.k = 1; st.w = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.6) { st.w = 0; if (st.k >= 6) return false; st.k++; } },
      draw(cv, st) { drawHasami(cv, st); },
      readout: st => { const k = Math.round(st.k), a = lowK(k); return `${dec(a, k)}² ＝ ${dec(a * a, 2 * k)} ＜ 2 ＜ ${dec((a + 1) * (a + 1), 2 * k)} ＝ ${dec(a + 1, k)}²`; }
    },
    {
      key: 'pi', label: '② π をはさむ',
      lead: '《円|えん》の《内側|うちがわ》と《外側|そとがわ》に《正多角形|せいたかくけい》をかきます。▶ で、《角|かど》の《数|かず》を6・12・24・48・96とふやします。',
      note: '《内側|うちがわ》の《正六角形|せいろっかくけい》のまわりは《直径|ちょっけい》の3《倍|ばい》、《外側|そとがわ》は3.464…《倍|ばい》。《円周|えんしゅう》はそのあいだなので、π は3と3.465のあいだ。《角|かど》の《数|かず》をふやすと、《多角形|たかくけい》が《円|えん》にぴったりよりそい、**はさむはばがせまくなります**。アルキメデスは《正|せい》96《角形|かくけい》で3.14まで《求|もと》めました。',
      miss: 'π ＝ 3.14 ぴったりではありません。π ＝ 3.14159…で、《小数|しょうすう》はどこまでも《終|お》わりません。3.14は《計算|けいさん》に《使|つか》う《近|ちか》い《数|かず》です。',
      legend: [['《内側|うちがわ》の《正多角形|せいたかくけい》', { color: 'a', shape: 'tri' }], ['《外側|そとがわ》の《正多角形|せいたかくけい》', { color: 'b', style: 'dash', shape: 'square' }], ['《円|えん》・π', { color: 'ink' }]],
      controls: [{ range: 'n', label: '《角|かど》の《数|かず》', min: 3, max: 96, step: 1, d: 0 }],
      init(st) { st.n = 6; st.w = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.6) { st.w = 0; if (st.n >= 96) return false; st.n = Math.min(96, st.n * 2); } },
      draw(cv, st) { drawPi(cv, st); },
      readout: st => { const n = Math.round(st.n), d = digitsFor(n); return `《正|せい》${n}《角形|かくけい》：${A.num(cut(inner(n), false, d), d)} ＜ π ＜ ${A.num(cut(outer(n), true, d), d)}`; }
    },
    {
      key: 'bunsu', label: '③ 《分数|ぶんすう》ではぴったりにならない',
      lead: '√2 に《近|ちか》い《分数|ぶんすう》を2《乗|じょう》して、ぴったり2になるものをさがします。▶ で、《本|ほん》の《表|ひょう》の《分数|ぶんすう》を《順|じゅん》に《見|み》ます。',
      note: '2《乗|じょう》がぴったり2になるには、**《分子|ぶんし》×《分子|ぶんし》が、《分母|ぶんぼ》×《分母|ぶんぼ》の2《倍|ばい》とぴったり《同|おな》じ**でなければなりません。7/5、17/12、41/29、99/70、577/408 と、どんどん《近|ちか》づきますが、いつも1だけずれます。√2 は《分数|ぶんすう》で《書|か》けない《数|かず》（《無理数|むりすう》）です。',
      legend: [['√2', { color: 'ink' }], ['いまの《分数|ぶんすう》', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'q', label: '《分母|ぶんぼ》', min: 1, max: 408, step: 1, d: 0 }],
      init(st) { st.q = 5; st.bi = 0; st.w = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.8) { st.w = 0; if (st.bi >= BOOK.length - 1) return false; st.bi++; st.q = BOOK[st.bi][1]; } },
      draw(cv, st) { drawBunsu(cv, st); },
      readout: st => { const q = Math.round(st.q), p = Math.round(q * Math.SQRT2); return `$\\frac{${p}}{${q}}$ の2《乗|じょう》 ＝ $\\frac{${p * p}}{${q * q}}$　（2 ＝ $\\frac{${2 * q * q}}{${q * q}}$）`; }
    }
  ]
});
