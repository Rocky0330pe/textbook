// @id m1-20
// @title 《紙|かみ》を《折|お》ると2《倍|ばい》：《累乗|るいじょう》
// @vol 数学2
// @from 数学 2-7 累乗（ch2-07:64-74・92-97・127-134・313-320）／2-17・3-11・3-12・5-14 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。紙1枚の厚さは本と同じ約 0.1 mm

const sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || (c === '-' ? '⁻' : c)).join('');
// あつさ（mm）を、本と同じように単位をなおして読む
function thick(mm) {
  if (mm < 10) return `${A.num(mm, 1)} mm`;
  if (mm < 1000) return `${A.num(mm / 10, mm < 100 ? 1 : 0)} cm`;
  if (mm < 1e6) return `${A.num(mm / 1000, mm < 1e4 ? 1 : 0)} m`;
  if (mm < 1e10) return `${Math.round(mm / 1e6)} km`;
  return `${Math.round(mm / 1e10)}万 km`;
}

// ---------- ① 折る ----------
function drawOru(cv, st) {
  const n = Math.floor(st.f + 1e-9), u = st.f - n, layers = Math.pow(2, n);
  const W0 = 520, w = W0 / layers, lh = Math.max(1.2, Math.min(9, 150 / (2 * layers))), h = layers * lh;
  const x0 = 60, base = 240, mid = x0 + w / 2;
  const sheet = (pts, alpha) => cv.poly(pts, { fill: 'c', alpha, color: 'c', width: 1.5 });
  if (u < 1e-6) {
    sheet([[x0, base], [x0 + w, base], [x0 + w, base - h], [x0, base - h]], 0.35);
    for (let k = 1; k < layers && lh >= 2.5; k++) cv.line([[x0, base - k * lh], [x0 + w, base - k * lh]], { color: 'c', width: 1 });
  } else {
    // 左半分はそのまま、右半分は (mid, 上) を軸に、上を通って左へ重なる
    const top = base - h, a = Math.PI * (1 - Math.cos(Math.PI * u)) / 2;
    sheet([[x0, base], [mid, base], [mid, top], [x0, top]], 0.35);
    const R = ([x, y]) => { const dx = x - mid, dy = y - top; return [mid + dx * Math.cos(a) + dy * Math.sin(a), top - dx * Math.sin(a) + dy * Math.cos(a)]; };
    sheet([[mid, top], [mid + w / 2, top], [mid + w / 2, base], [mid, base]].map(R), 0.5);
  }
  cv.line([[x0 - 20, base + 2], [x0 + W0 + 20, base + 2]], { color: 'sub', width: 2 });
  cv.text(`${n} 回おった`, x0, base + 30, { size: 17, bold: true });
  cv.text(`${layers} 枚`, x0 + 140, base + 30, { size: 17, color: 'c', bold: true });
  if (n) cv.text(Array(n).fill('2').join('×') + ` ＝ 2${sup(n)}`, x0 + 220, base + 30, { size: 17 });
  // 右：表（本の「やってみよう」の表）
  const tx = 620, ty = 40, rh = 34;
  cv.text('回', tx + 30, ty, { align: 'center', size: 14, color: 'sub' });
  cv.text('枚', tx + 100, ty, { align: 'center', size: 14, color: 'sub' });
  cv.text('あつさ mm', tx + 190, ty, { align: 'center', size: 14, color: 'sub' });
  for (let k = 0; k <= 6; k++) {
    const y = ty + 30 + k * rh, on = k === n;
    if (on) cv.rect(tx, y - rh / 2, 240, rh, { fill: 'hl', alpha: 1 });
    cv.text(String(k), tx + 30, y, { align: 'center', size: 16 });
    if (k <= n) { cv.text(String(Math.pow(2, k)), tx + 100, y, { align: 'center', size: 16, bold: on }); cv.text(A.num(0.1 * Math.pow(2, k), 1), tx + 190, y, { align: 'center', size: 16, bold: on }); }
    else { cv.text('？', tx + 100, y, { align: 'center', size: 16, color: 'sub' }); cv.text('？', tx + 190, y, { align: 'center', size: 16, color: 'sub' }); }
    if (k) cv.text('×2', tx + 64, y - rh / 2, { align: 'center', size: 13, color: 'b' });
  }
}

// ---------- ② ビル・地球・月 ----------
const REF = [
  { mm: 100, name: 'はがきのはば やく10 cm', kind: 'card' },
  { mm: 105000, name: 'ビルの30階 やく105 m', kind: 'bldg' },
  { mm: 1e8, name: 'うちゅうに入る やく100 km', kind: 'line' },
  { mm: 4e10, name: '地球1しゅう やく4万 km', kind: 'line' },
  { mm: 3.8e11, name: '月まで やく38万 km', kind: 'moon' }
];
function nice(top) {  // 目もりの間かく（mm）
  const raw = top / 5, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  return (m < 2 ? 1 : m < 5 ? 2 : 5) * p;
}
function unitLabel(mm, step) {
  if (step < 10) return A.num(mm, step < 1 ? 1 : 0) + ' mm';
  if (step < 1000) return A.num(mm / 10, 0) + ' cm';
  if (step < 1e6) return A.num(mm / 1000, 0) + ' m';
  if (step < 1e10) return A.num(mm / 1e6, 0) + ' km';
  return A.num(mm / 1e10, 0) + '万 km';
}
function drawTsuki(cv, st) {
  const n = st.n, T = 0.1 * Math.pow(2, Math.floor(n + 1e-9)), top = Math.max(0.1 * Math.pow(2, n) * 1.35, 0.6), base = 390, H = 350, X = 150, Y = mm => base - mm / top * H;
  // 目もり
  const step = nice(top);
  for (let v = 0; v <= top + 1e-9; v += step) { const y = Y(v); cv.line([[X - 70, y], [X - 62, y]], { color: 'sub', width: 1 }); cv.line([[X - 60, y], [560, y]], { color: 'grid', width: 1 }); if (v) cv.text(unitLabel(v, step), X - 74, y, { align: 'right', size: 14, color: 'sub' }); }
  cv.line([[X - 66, base], [X - 66, base - H - 10]], { color: 'sub', width: 1.5 });
  cv.line([[20, base], [560, base]], { color: 'ink', width: 2 });
  // くらべるもの
  for (const r of REF) {
    const y = Y(r.mm), hp = base - y;
    if (hp < 2 || y < 20) continue;
    if (r.kind === 'card') cv.rect(X + 110, y, 30, hp, { fill: 'e', alpha: 0.3, color: 'e', width: 1.5 });
    if (r.kind === 'bldg') { cv.rect(X + 100, y, 50, hp, { fill: 'sub', alpha: 0.25, color: 'sub', width: 1.5 }); if (hp > 60) for (let k = 1; k < 30; k++) cv.line([[X + 100, base - hp * k / 30], [X + 150, base - hp * k / 30]], { color: 'sub', width: 0.6 }); }
    if (r.kind === 'line') cv.line([[X + 60, y], [560, y]], { color: 'a', width: 2, style: 'dash' });
    if (r.kind === 'moon') { cv.circle(X + 125, y, 14, { fill: 'e', alpha: 0.6, color: 'e', width: 1.5 }); cv.line([[X + 60, y], [560, y]], { color: 'e', width: 2, style: 'dot' }); }
    cv.text(r.name, X + 170, y - (r.kind === 'line' || r.kind === 'moon' ? 12 : -12), { size: 14, bg: true });
  }
  // おった紙
  const hp = Math.max(1.5, base - Y(T));
  cv.rect(X, base - hp, 36, hp, { fill: 'c', alpha: 0.6, color: 'c', width: 2 });
  cv.text(`${Math.floor(n)} 回`, X + 18, base - hp - 14, { align: 'center', size: 15, bold: true, color: 'c' });
  // 右：表（本の表）
  const tx = 580, ty = 60, rh = 46, ms = [[10, 'はがきのはば'], [20, 'ビルの30階'], [30, 'うちゅうに入る'], [40, '地球をやく3しゅう'], [42, '月をこえる']];
  cv.text('回', tx + 20, ty - 26, { align: 'center', size: 14, color: 'sub' });
  cv.text('あつさ', tx + 90, ty - 26, { align: 'center', size: 14, color: 'sub' });
  ms.forEach(([k, t], i) => {
    const y = ty + i * rh, on = Math.floor(n) >= k;
    if (Math.floor(n) === k) cv.rect(tx - 6, y - 20, 268, rh - 4, { fill: 'hl', alpha: 1 });
    cv.text(String(k), tx + 20, y - 4, { align: 'center', size: 16, bold: true });
    cv.text(on ? 'やく' + thick(0.1 * Math.pow(2, k)).replace(/(\d+)\.\d+/, '$1') : '…', tx + 90, y - 4, { align: 'center', size: 16 });
    cv.text(on ? t : '', tx + 150, y - 4, { size: 14, color: 'sub' });
  });
}

// ---------- ③ 0乗とマイナスの指数 ----------
function frac(b, e) { return e >= 0 ? String(Math.pow(b, e)) : `1/${Math.pow(b, -e)}`; }
function drawShisuu(cv, st) {
  const b = st.base, lo = b === 10 ? -2 : -3, es = A.range(lo, 3).reverse(), cw = b === 10 ? 128 : 112, x0 = 440 - (es.length * cw) / 2 + cw / 2;
  es.forEach((e, i) => {
    const x = x0 + i * cw, y = 90, shown = e >= st.e, neu = e <= 0;
    cv.text(`${b}${sup(e)}`, x, y - 44, { align: 'center', size: 20, bold: true, color: neu ? 'b' : 'ink' });
    cv.rect(x - cw / 2 + 12, y - 24, cw - 24, 48, { fill: neu ? 'hl' : 'bg', alpha: 1, color: e === st.e ? 'b' : 'line', width: e === st.e ? 3 : 1.5, style: neu ? 'dash' : 'solid' });
    cv.text(shown ? (b === 10 && e < 0 ? A.num(Math.pow(10, e), -e) : frac(b, e)) : '？', x, y, { align: 'center', size: 18, bold: shown });
    if (i < es.length - 1) { cv.arrow(x + cw / 2 - 12, y, x + cw / 2 + 12, y, { color: 'sub', width: 2 }); cv.text(`÷${b}`, x + cw / 2, y + 36, { align: 'center', size: 14, color: 'sub' }); }
  });
  if (b !== 2) { cv.text('指数が1へると、10でわった大きさ。0乗は1、−1乗は 1/10 ＝ 0.1', 440, 210, { align: 'center', size: 16 }); return; }
  // 2 のとき：紙の枚数で（1 より小さいときは、1枚の紙の一部）
  const e = st.e, val = Math.pow(2, e), sw = 38, sh = 54, y0 = 190;
  cv.text(`2${sup(e)} 枚ぶんの紙`, 440, y0 - 14, { align: 'center', size: 16, bold: true });
  if (val >= 1) {
    const x1 = 440 - (val * (sw + 8)) / 2;
    for (let k = 0; k < val; k++) cv.rect(x1 + k * (sw + 8), y0 + 10, sw, sh, { fill: 'c', alpha: 0.4, color: 'c', width: 1.5 });
  } else {
    const x1 = 440 - sw * 2, W = sw * 4, Hh = sh * 2.4;
    cv.rect(x1, y0 + 10, W, Hh, { color: 'c', width: 1.5, style: 'dash' });
    // 半分・そのまた半分…（たて・横を交互に切る）
    let w = W, h = Hh, k = -e;
    for (let q = 0; q < k; q++) { if (q % 2 === 0) w /= 2; else h /= 2; }
    cv.rect(x1, y0 + 10 + Hh - h, w, h, { fill: 'c', alpha: 0.5, color: 'c', width: 2 });
    cv.text(`1枚の ${frac(2, e)}`, x1 + W + 16, y0 + 10 + Hh / 2, { size: 16 });
  }
}

A.item({
  id: 'm1-20', title: '《紙|かみ》を《折|お》ると2《倍|ばい》：《累乗|るいじょう》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-7「《累乗|るいじょう》」の《図|ず》から（2-17・3-11・3-12・5-14 でも《使|つか》う）',
  W: 880, H: 420,
  state: { f: 0, n: 0, e: 3, base: 2 },
  scenes: [
    {
      key: 'oru', label: '① 《折|お》るたびに2《倍|ばい》',
      lead: 'コピー《用紙|ようし》を《半分|はんぶん》に《折|お》ります。▶ で、《折|お》るたびに《重|かさ》なりが《何枚|なんまい》になるか《見|み》ましょう。',
      note: '《折|お》るたびに、《重|かさ》なった《枚数|まいすう》は2《倍|ばい》。3《回|かい》《折|お》ると $2\\times2\\times2$ で、これを $2^3$（2の3《乗|じょう》）と《書|か》きます。《右|みぎ》かたの3は**2を《何回|なんかい》かけるか**（《指数|しすう》）で、《折|お》った《回数|かいすう》と《同|おな》じです。',
      miss: '$2^3=2\\times3=6$ はまちがい。$2^3=2\\times2\\times2=8$ です。《指数|しすう》の3は、2を「3《回|かい》かける」という《意味|いみ》です。',
      legend: [['《折|お》った《紙|かみ》（《横|よこ》から）', { color: 'c', shape: 'square', noline: true }], ['いまの《回数|かいすう》', { color: 'e', shape: 'square', noline: true }]],
      controls: [{ range: 'f', label: '《折|お》った《回数|かいすう》', min: 0, max: 6, step: 1, d: 0 }],
      init(st) { st.f = 0; st.w = 0; },
      step(st, dt) {
        if (st.f >= 6) return false;
        const n = Math.floor(st.f + 1e-9), u = st.f - n;
        if (u < 1e-9 && (st.w = (st.w || 0) + dt) < 0.7) return;
        st.w = 0; st.f = Math.min(n + 1, st.f + dt * 1.1); if (st.f > n + 1 - 1e-6) st.f = n + 1;
      },
      draw(cv, st) { drawOru(cv, st); },
      readout: st => { const n = Math.floor(st.f + 1e-9); return `${n} 《回|かい》 → $2^{${n}}$ ＝ <b>${Math.pow(2, n)} 《枚|まい》</b>、《厚|あつ》さ $0.1\\times${Math.pow(2, n)}$ ＝ ${A.num(0.1 * Math.pow(2, n), 1)} mm`; }
    },
    {
      key: 'tsuki', label: '② 42《回|かい》で《月|つき》まで',
      lead: '《何回|なんかい》でも《折|お》れるとしたら？　▶ で、《厚|あつ》さが《何|なに》をこえていくか《見|み》ましょう。《画面|がめん》はどんどん《縮|ちぢ》めて《見|み》せます。',
      note: '$2^{10}=1024$ は、ほぼ1000。だから**10《回|かい》《折|お》るごとに、《厚|あつ》さは《約|やく》1000《倍|ばい》**になります。10《回|かい》で《約|やく》10 cm、20《回|かい》で《約|やく》105 m、30《回|かい》で《約|やく》107 km、40《回|かい》で《約|やく》11《万|まん》 km、42《回|かい》で《約|やく》44《万|まん》 km。《月|つき》までの《約|やく》38《万|まん》 km をこえます。ただし、ほんとうの《紙|かみ》は7〜8《回|かい》《折|お》るのがやっとです。',
      legend: [['《折|お》った《紙|かみ》の《厚|あつ》さ', { color: 'c', shape: 'square', noline: true }], ['《宇宙|うちゅう》・《地球|ちきゅう》1《周|しゅう》', { color: 'a', style: 'dash' }], ['《月|つき》', { color: 'e', style: 'dot' }]],
      controls: [{ range: 'n', label: '《折|お》った《回数|かいすう》', min: 0, max: 42, step: 1, d: 0 }],
      init(st) { st.n = 0; },
      step(st, dt) { st.n = Math.min(42, st.n + dt * 2.2); if (st.n >= 42) return false; },
      draw(cv, st) { drawTsuki(cv, st); },
      readout: st => { const n = Math.floor(st.n); return `${n} 《回|かい》：$2^{${n}}$ 《枚|まい》、《厚|あつ》さ 《約|やく》 <b>${thick(0.1 * Math.pow(2, n)).replace("万", "《万|まん》")}</b>`; }
    },
    {
      key: 'shisuu', label: '③ 0《乗|じょう》とマイナスの《指数|しすう》',
      lead: '《指数|しすう》を1つずつへらしていきます。▶ で、0《乗|じょう》から《先|さき》がどうなるか《見|み》ましょう。',
      note: '《指数|しすう》が1へると、《数|かず》は2（10）でわった《大|おお》きさ。このきまりがつづくように《決|き》めると、$2^0=1$、$2^{-1}=\\frac{1}{2}$、$2^{-2}=\\frac{1}{4}$。0《乗|じょう》は2でも10でも1。**マイナスの《指数|しすう》は「1をその《数|かず》で《何回|なんかい》わるか」**です。',
      miss: '$2^0=0$ ではありません。$2^1=2$ を2でわって $2^0=1$ です。',
      state: { e: 3, base: 2 },
      legend: [['0《乗|じょう》・マイナスの《指数|しすう》（《点線|てんせん》のわく）', { color: 'b', style: 'dash' }], ['《紙|かみ》', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ seg: 'base', label: 'もとの《数|かず》', options: [[2, '2'], [10, '10']], on(st) { st.e = 3; st.w = 0; } }, { range: 'e', label: '《指数|しすう》', min: -3, max: 3, step: 1, d: 0, on(st) { if (st.base === 10 && st.e < -2) st.e = -2; } }],
      init(st) { st.e = 3; st.w = 0; },
      step(st, dt) { const lo = st.base === 10 ? -2 : -3; st.w = (st.w || 0) + dt; if (st.w > 1.1) { st.w = 0; if (st.e <= lo) return false; st.e--; } },
      draw(cv, st) { drawShisuu(cv, st); },
      readout: st => `$${st.base}^{${st.e}}$ ＝ <b>${st.e >= 0 ? Math.pow(st.base, st.e) : '1/' + Math.pow(st.base, -st.e)}</b>${st.e < 0 ? `（＝ ${A.num(Math.pow(st.base, st.e), st.base === 10 ? -st.e : 3)}）` : ''}`
    }
  ]
});
