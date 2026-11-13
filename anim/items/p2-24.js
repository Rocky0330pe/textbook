// @id p2-24
// @title ラザフォード散乱：まれに大きくはね返る
// @vol 物理5
// @from 物理 原-1 ⑤⑧（p5-01:455・473・492、例題9〜11）
'use strict';
// 記号は本と同じ：α線の運動エネルギー K、正面から来たときいちばん近づく距離 d＝2Zke²/K（ke²＝1.44 MeV·fm、金 Z＝79）、
// ねらいの距離 b、散乱角 θ、b＝(d/2)cot(θ/2)。道すじは本のプログラムと同じ計算（速さ1、長さ fm、dt＝r/1000、速度を先に進める）
const KE2 = 1.44, ZAU = 79;
const BOOK_B = [200, 85, 40, 22.75, 10];
const dOf = K => 2 * ZAU * KE2 / K;
const cache24 = {};   // 道すじは重いので、b と d ごとに1回だけ計算する
let RNG = null;       // 乱数（種 2024 で毎回同じ）
A.item({
  id: 'p2-24', title: 'ラザフォード散乱：まれに大きくはね返る',
  from: '物理 第5巻 原-1 ⑤「原子核の大きさ」・⑧「散乱の式」の図とプログラムから',
  W: 880, H: 440,
  state: { K: 5.0, b: 22.75, s: 0, live: [], shot: 0, big: 0, seed: 1, clock: 0, Bmax: 300, z: 0 },
  scenes: [
    {
      key: 'kidou', label: '① ねらいの距離と道すじ',
      lead: '5.0 MeV の α線が、金の原子核のそばを通ります。ねらいの距離 $b$ を変えて、▶ で飛ばしてみましょう（細い線は本の図の5本）。',
      note: '$b$ が小さいほど原子核の近くを通り、大きく曲がります。$b=\\frac{d}{2}\\cot\\frac{\\theta}{2}$ で、$b=d/2=22.75$ fm なら 90°、正面（$b=0$）なら真後ろにはね返ります。道すじは、原子核を焦点の1つとする双曲線です。',
      miss: 'ねらいの距離 $b$ は「まっすぐ進んだとしたら」の距離です。退け合う力で道が曲がるので、本当にいちばん近づく距離（◆）は $b$ より大きくなります。',
      legend: [['いま飛ばす α線の道すじ', { color: 'b', width: 3 }], ['本の図の5本（b＝200・85・40・22.75・10 fm）', { color: 'sub', width: 1.5 }], ['まっすぐ進んだとしたら（ねらいの距離 $b$）', { color: 'a', style: 'dot' }], ['正面から来たとき近づける距離 $d$', { color: 'd', style: 'dash' }], ['いちばん近づいた所', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [
        { range: 'b', label: 'ねらいの距離 $b$〔fm〕', min: 0, max: 200, step: 0.25, d: 2, on: st => { st.s = 0; } },
        { range: 'K', label: 'α線のエネルギー $K$〔MeV〕', min: 2, max: 10, step: 0.1, d: 1, on: st => { st.s = 0; } }
      ],
      step(st, dt) { st.s += dt * 0.45; if (st.s > 1) { st.s = 1; return false; } },
      draw: drawPath,
      readout: st => { const d = dOf(st.K), tr = path(st.b, d), thF = 2 * Math.atan2(d / 2, st.b) * 180 / Math.PI, rmin = st.b === 0 ? d : (d / 2) * (1 + 1 / Math.sin(thF * Math.PI / 360)); return `$d$ ＝ ${A.num(d, 1)} fm　曲がった角：計算 <b>${A.num(tr.th, 1)}°</b>（式 ${A.num(thF, 1)}°）　いちばん近づいた距離 <b>${A.num(tr.rmin, 1)} fm</b>（$b$ ＝ ${A.num(st.b, 2)} fm より大きい${Math.abs(rmin - tr.rmin) < 1 ? '' : ''}）`; }
    },
    {
      key: 'ransha', label: '② たくさん撃つ',
      lead: 'ねらいの距離を乱数で決めて、α線をたくさん撃ちます（$b$ は 300 fm までの円の中に一様）。90° より大きく曲がるもの（太い線）は、ごくまれです。',
      note: '原子核はとても小さいので、そのすぐそばを通る α線はほんの少ししかありません。半径 $b_{90}=d/2$ の円の中をねらった α線だけが 90° より大きく曲がるので、その割合は円の面積の比 $(b_{90}/300)^2$ です。本物の金はく（0.40 μm）では、約 2万6千個に1個です（例題11）。',
      legend: [['小さく曲がった α線', { color: 'a', width: 1.5 }], ['90° より大きく曲がった α線', { color: 'b', width: 3.5 }], ['$b_{90}=d/2$ の円の範囲', { color: 'd', style: 'dash' }]],
      controls: [
        { range: 'K', label: 'α線のエネルギー $K$〔MeV〕', min: 2, max: 10, step: 0.1, d: 1, on: resetR },
        { button: 'まとめて 1000 個撃つ', act(st) { for (let i = 0; i < 1000; i++) shoot(st, false); } }
      ],
      init: resetR,
      autoplay: true,
      step: stepR,
      draw: drawR,
      readout: st => { const d = dOf(st.K), p = (d / 2 / st.Bmax) ** 2; return `撃った数 <b>${st.shot}</b>、90° より大きく曲がった数 <b>${st.big}</b>（割合 ${st.shot ? A.num(st.big / st.shot * 100, 2) : '−'} %）　式から：$(b_{90}/300)^2$ ＝ ${A.num(p * 100, 2)} %（${A.num(1 / p, 0)} 個に1個）`; }
    },
    {
      key: 'ookisa', label: '③ 原子と原子核の大きさ',
      lead: 'スライダーで、見る範囲を広げていきます。金の原子核（半径 約 7 fm）と、原子（半径 約 0.144 nm ＝ 144,000 fm）をくらべましょう。',
      note: '原子核の直径は、原子の約2万分の1（体積では約9兆分の1）。原子を直径 100 m の競技場の大きさにすると、原子核は直径 約 5 mm、米つぶほどです。それでも、原子の質量の 99.98 % はこの原子核にあります。',
      miss: '原子の絵で原子核が原子の半分くらいに描いてあるのは、見やすくするためです。本当の大きさで描くと、原子核は点にしか見えません。',
      legend: [['原子核（半径 7 fm）', { color: 'b', shape: 'circle', noline: true }], ['5 MeV の α線が近づける距離 $d$（45.5 fm）', { color: 'd', style: 'dash' }], ['原子（半径 144,000 fm）', { color: 'a', width: 2 }]],
      controls: [{ range: 'z', label: '見る範囲を広げる', min: 0, max: 1, step: 0.005, fmt: v => A.num(halfW(v) * 2, 0) + ' fm' }],
      step(st, dt) { st.z += dt * 0.12; if (st.z >= 1) { st.z = 1; return false; } },
      draw: drawSize,
      readout: st => `画面の横はば ＝ <b>${A.num(halfW(st.z) * 2 / 1000, halfW(st.z) < 5000 ? 2 : 0)}×10³ fm</b>　（原子核の直径：原子の直径 ＝ 14 : 288,000 ≒ 1 : 20,000）`
    }
  ]
});

// 本のプログラムと同じ計算。点は |x|,|y| が 400 fm より内だけ残す
function path(b, d) {
  const key = b.toFixed(3) + ',' + d.toFixed(3); if (cache24[key]) return cache24[key];
  let x = -20000, y = b, vx = 1, vy = 0, r = Math.hypot(x, y), rmin = r, pm = [x, y];
  const pts = [];
  while (r < 20001) {
    const dt = r / 1000, ax = d / 2 * x / r ** 3, ay = d / 2 * y / r ** 3;
    vx += ax * dt; vy += ay * dt; x += vx * dt; y += vy * dt; r = Math.hypot(x, y);
    if (Math.abs(x) < 420 && Math.abs(y) < 420) pts.push([x, y]);
    if (r < rmin) { rmin = r; pm = [x, y]; }
    if (pts.length > 40000) break;
  }
  return (cache24[key] = { pts, th: Math.atan2(vy, vx) * 180 / Math.PI, rmin, pm });
}
function view24(cv) { return cv.view({ x0: -330, x1: 330, y0: -130, y1: 290, box: [10, 10, 860, 420], equal: true }); }
function nucleus(cv, v, d) {
  v.circle(0, 0, d, { color: 'd', width: 1.5, style: 'dash' });
  cv.dot(v.X(0), v.Y(0), { color: 'b', r: 6 });
  cv.text('金の原子核', v.X(0) + 10, v.Y(0) + 16, { size: 14, color: 'sub' });
}
function drawPath(cv, st) {
  const v = view24(cv), d = dOf(st.K);
  v.axes({ xt: [-300, -200, -100, 100, 200, 300], yt: [-100, 100, 200], grid: true, xfmt: x => A.num(x, 0), yfmt: y => A.num(y, 0) });
  cv.text('x（fm）', v.X(330) - 4, v.Y(0) + 30, { size: 14, color: 'sub', align: 'right' });
  cv.text('y（fm）', v.X(0) + 8, 20, { size: 14, color: 'sub' });
  nucleus(cv, v, d);
  v.clip(() => {
    for (const bb of BOOK_B) v.line(path(bb, dOf(5)).pts, { color: 'sub', width: 1.3, alpha: 0.6 });
    v.line([[-330, st.b], [330, st.b]], { color: 'a', width: 1.5, style: 'dot' });
    const tr = path(st.b, d), n = Math.max(2, Math.floor(tr.pts.length * st.s));
    v.line(tr.pts.slice(0, n), { color: 'b', width: 3 });
    const p = tr.pts[n - 1]; if (p) v.dot(p[0], p[1], { color: 'b', r: 7 });
    if (st.s > 0.55 || st.s === 0) { v.line([[0, 0], tr.pm], { color: 'b', width: 1.5, style: 'dash' }); v.dot(tr.pm[0], tr.pm[1], { color: 'b', shape: 'diamond', r: 7 }); }
  });
  cv.text('b', v.X(-300), v.Y(st.b) - 12, { size: 16, bold: true, italic: true, color: 'a', bg: true });
  v.text('d = ' + A.num(d, 1) + ' fm', d * 0.72, -d * 0.72 - 14, { size: 14, color: 'd', bg: true });
}

// ② たくさん撃つ
function resetR(st) { st.live = []; st.shot = 0; st.big = 0; st.seed = 1; st.clock = 0; st.rng = null; }
function shoot(st, live) {
  if (!RNG || st.seed === 1) { RNG = A.rng(2024); st.seed = 2; }
  const u = RNG(), b = st.Bmax * Math.sqrt(u) * (RNG() < 0.5 ? -1 : 1), d = dOf(st.K);
  const th = 2 * Math.atan2(d / 2, Math.abs(b)) * 180 / Math.PI;
  st.shot++; if (th > 90) st.big++;
  if (live) st.live.push({ x: -330, y: b, vx: 1, vy: 0, big: th > 90, pts: [[-330, b]], age: 0 });
}
function stepR(st, dt) {
  st.clock += dt; const d = dOf(st.K);
  while (st.clock > 0.06) { st.clock -= 0.06; shoot(st, true); }
  const adv = dt * 420;
  for (const p of st.live) {
    let s = 0;
    while (s < adv) { const r = Math.hypot(p.x, p.y), h = Math.min(2, Math.max(0.05, r / 80)); const ax = d / 2 * p.x / r ** 3, ay = d / 2 * p.y / r ** 3; p.vx += ax * h; p.vy += ay * h; p.x += p.vx * h; p.y += p.vy * h; s += h; }
    p.pts.push([p.x, p.y]); p.age += dt;
  }
  st.live = st.live.filter(p => Math.abs(p.x) < 360 && p.y > -220 && p.y < 380 && p.age < 4);
}
function drawR(cv, st) {
  const v = cv.view({ x0: -330, x1: 330, y0: -210, y1: 210, box: [10, 10, 860, 420], equal: true }), d = dOf(st.K);
  v.line([[-330, d / 2], [330, d / 2]], { color: 'd', width: 1, style: 'dash' }); v.line([[-330, -d / 2], [330, -d / 2]], { color: 'd', width: 1, style: 'dash' });
  v.clip(() => { for (const p of st.live) v.line(p.pts, { color: p.big ? 'b' : 'a', width: p.big ? 3.5 : 1.3, alpha: p.big ? 1 : 0.5 }); for (const p of st.live) v.dot(p.x, p.y, { color: p.big ? 'b' : 'a', r: p.big ? 6 : 3 }); });
  cv.dot(v.X(0), v.Y(0), { color: 'b', r: 6 });
  cv.text('α線 →', 20, 24, { size: 15, color: 'sub' });
  cv.text(`90° より大きく：${st.big} / ${st.shot}`, 860, 24, { size: 17, bold: true, align: 'right', bg: true });
}

// ③ 大きさくらべ：横はばの半分を 200 fm から 200,000 fm まで（対数で）
function halfW(z) { return 200 * Math.pow(1000, z); }
function drawSize(cv, st) {
  const H = halfW(st.z), cx = 440, cy = 215, s = 420 / H;   // 1 fm のピクセル
  const R = 144000 * s;
  if (R < 2000) cv.circle(cx, cy, R, { color: 'a', width: 2, fill: 'a', alpha: 0.06 });
  else cv.text('原子の外がわは、まだずっと外（半径 144,000 fm）', cx, 30, { size: 15, align: 'center', color: 'a' });
  cv.circle(cx, cy, 45.5 * s, { color: 'd', width: 1.5, style: 'dash' });
  const rn = 7 * s;
  if (rn >= 2) cv.circle(cx, cy, rn, { fill: 'b', alpha: 0.9, color: 'b' });
  else { cv.dot(cx, cy, { color: 'b', r: 2 }); cv.arrow(cx + 60, cy - 50, cx + 6, cy - 5, { color: 'b', width: 2 }); cv.text('原子核（本当の大きさでは点にしか見えない）', cx + 64, cy - 56, { size: 15, color: 'b', bg: true }); }
  // ものさし
  const L = Math.pow(10, Math.floor(Math.log10(H))), px = L * s;
  cv.line([[40, 400], [40 + px, 400]], { color: 'ink', width: 3 }); cv.line([[40, 392], [40, 408]], { color: 'ink', width: 2 }); cv.line([[40 + px, 392], [40 + px, 408]], { color: 'ink', width: 2 });
  cv.text(A.num(L, 0) + ' fm', 40 + px / 2, 384, { size: 15, align: 'center' });
}
