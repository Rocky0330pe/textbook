// @id p1-25
// @title 空気線図を読む：露点と結露
// @vol 物理2
// @from 物理 熱-9 ⑥⑦⑧（p2-09 の露点・結露・空気線図・湿球温度・空気の変化）／熱-8 ① でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 線図と数は、この章の式でかく：飽和蒸気圧 ps は IAPWS-IF97 の式、x＝0.622 pv/(p−pv)、h＝1.006θ＋x(2501＋1.86θ)、p＝101.325 kPa。
// 本の線図（CoolProp）より x が 0.4 % ほど小さい（本の「せいかくに言うと」）。点 A（25 ℃・60 %）：露点 16.7 ℃。
const PATM = 101.325;
A.item({
  id: 'p1-25', title: '空気線図を読む：露点と結露',
  from: '物理 第2巻『熱学』 熱-9 ⑥⑦⑧ の図から（空気線図、コップの結露、エアコンの中の空気の変化）',
  W: 880, H: 440,
  state: { th: 25, phi: 0.6, cup: 8, t: 0, proc: 'cool' },
  scenes: [
    {
      key: 'senzu', label: '① 空気線図の読み方',
      lead: '空気の点をドラッグして動かしてみましょう。温度と相対湿度がわかると、線図の上の1点が決まり、ほかの量が読めます。',
      note: '点から**左へ水平に**進む（水蒸気の量 $x$ を変えずに冷やす）と、飽和の線（100 %）にぶつかる所が**露点**です。**比エンタルピーが一定の線**（右下がりの細い線）にそって飽和の線までたどった温度が、およその**湿球温度**です。',
      miss: '相対湿度は「空気が何 % 水蒸気をふくんでいるか」ではありません。その温度でふくめる最大の量（飽和）に対する割合です。同じ水蒸気の量でも、温度が上がると相対湿度は下がります。',
      legend: [['相対湿度 100 %（飽和）', { color: 'ink' }], ['相対湿度 20〜80 %', { color: 'b', style: 'dash' }], ['比エンタルピー一定', { color: 'sub', style: 'dot' }], ['空気の点（ドラッグ）', { color: 'd', shape: 'circle', noline: true }]],
      init(st) { st.th = 25; st.phi = 0.6; },
      drag: {
        hit: () => 1,
        move(st, x, y, api) { const v = chart(api.cv), [th, xg] = v.inv(x, y); st.th = A.clamp(Math.round(th * 10) / 10, 1, 39); const xs = xOf(st.th, 1) * 1000; st.phi = A.clamp(Math.max(0, xg) / xs, 0.02, 1); }
      },
      draw(cv, st) { drawChart(cv, st, 'read'); },
      readout: st => { const q = props(st.th, st.phi); return `${A.num(st.th, 1)} ℃・相対湿度 ${Math.round(st.phi * 100)} %${SP}$x$ ＝ ${A.num(q.x * 1000, 2)} g/kg(DA)${SP}$h$ ＝ ${A.num(q.h, 1)} kJ/kg(DA)${SP}露点 <b>${A.num(q.dew, 1)} ℃</b>${SP}湿球（$h$ 一定）約 ${A.num(q.wet, 1)} ℃`; }
    },
    {
      key: 'koppu', label: '② コップに水がつく',
      lead: '25 ℃・60 % の部屋に、冷たい飲み物のコップを置きます。コップのそばの空気が冷やされていくと、どうなるでしょう。',
      note: 'そばの空気は、$x$ を変えずに左へ進み、露点（16.7 ℃）で飽和の線にぶつかります。そこより冷えると、空気はそれ以上水蒸気をふくめないので、あまった水蒸気が水になってコップの外側につきます（**結露**）。水は、ジュースがしみ出したのではなく、**部屋の空気から**来たものです。',
      miss: 'コップが露点より温かければ、水はつきません。部屋の湿度が低いほど露点は低くなり、結露しにくくなります。',
      legend: [['空気の変化', { color: 'd' }], ['飽和の線', { color: 'ink' }], ['水になって出る分', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'cup', label: 'コップの表面', min: 0, max: 24, step: 0.5, fmt: v => A.num(v, 1) + ' ℃', on: st => { st.t = 0; } }, { range: 'phi', label: '部屋の相対湿度', min: 0.3, max: 0.9, step: 0.01, fmt: v => Math.round(v * 100) + ' %', on: st => { st.t = 0; } }],
      init(st) { st.th = 25; st.phi = 0.6; st.cup = 8; st.t = 0; },
      step(st, dt) { st.t = Math.min(1, st.t + dt * 0.18); if (st.t >= 1) return false; },
      draw(cv, st) { drawChart(cv, st, 'cup'); drawCup(cv, st); },
      readout: st => { const q = props(25, st.phi), c = cupPath(st); return `部屋の空気の露点 <b>${A.num(q.dew, 1)} ℃</b>${SP}そばの空気 ${A.num(c.th, 1)} ℃${SP}${c.water > 0 ? '乾き空気 1 kg あたり <b>' + A.num(c.water * 1000, 2) + ' g</b> が水になる' : 'まだ水はつかない'}`; }
    },
    {
      key: 'eakon', label: '③ エアコンの中の空気',
      lead: 'エアコンの中で、空気は線図の上をどう動くでしょう。冷房（冷却除湿）と、冬の暖房（加熱→加湿）を選んで見ましょう。',
      note: '**冷却除湿**：露点までは左へ、露点に着くと飽和の線にそって左下へ進み、その間に水が出ていきます（エアコンのホースの水）。**加熱**：$x$ は一定で右へ。温度が上がると相対湿度が下がります（冬の部屋が乾くわけ）。**加湿**：水を蒸発させて $x$ を増やし、上へ進みます。',
      miss: '暖房で部屋が乾くのは、空気中の水蒸気が減るからではありません。水蒸気の量 $x$ は同じでも、温度が上がって飽和の量が増えるので、相対湿度が下がるのです。',
      legend: [['空気の変化', { color: 'd' }], ['飽和の線', { color: 'ink' }], ['相対湿度の線', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'proc', label: '変化', options: [['cool', '冷房：30 ℃・70 % → 15 ℃'], ['heat', '暖房：0 ℃・80 % → 20 ℃ → 加湿']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; st.proc = 'cool'; },
      step(st, dt) { st.t = Math.min(1, st.t + dt * 0.15); if (st.t >= 1) return false; },
      draw(cv, st) { drawChart(cv, st, 'ac'); },
      readout: st => { const c = acPath(st); return `${c.label}${SP}${A.num(c.th, 1)} ℃・相対湿度 ${Math.round(c.phi * 100)} %${SP}$x$ ＝ ${A.num(c.x * 1000, 2)} g/kg(DA)${SP}$h$ ＝ ${A.num(c.h, 1)} kJ/kg(DA)`; }
    }
  ]
});

// ---------- 湿り空気の式 ----------
function ps(th) { // 飽和蒸気圧〔kPa〕（IAPWS-IF97 の式。θ は ℃）
  const n = [0, 0.11670521452767e4, -0.72421316703206e6, -0.17073846940092e2, 0.12020824702470e5, -0.32325550322333e7, 0.14915108613530e2, -0.48232657361591e4, 0.40511340542057e6, -0.23855557567849, 0.65017534844798e3];
  const T = th + 273.15, t = T + n[9] / (T - n[10]), a = t * t + n[1] * t + n[2], b = n[3] * t * t + n[4] * t + n[5], c = n[6] * t * t + n[7] * t + n[8];
  return Math.pow(2 * c / (-b + Math.sqrt(b * b - 4 * a * c)), 4) * 1000;
}
function xOf(th, phi) { const pv = phi * ps(th); return 0.622 * pv / (PATM - pv); }
function hOf(th, x) { return 1.006 * th + x * (2501 + 1.86 * th); }
function solve(f, lo, hi) { for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; }
function props(th, phi) {
  const x = xOf(th, phi), h = hOf(th, x), pv = phi * ps(th);
  return { x, h, dew: solve(t => ps(t) - pv, -20, 60), wet: solve(t => hOf(t, xOf(t, 1)) - h, -20, 60) };
}

// ---------- 線図 ----------
function chart(cv) { return cv.view({ x0: 0, x1: 40, y0: 0, y1: 30, box: [70, 30, 520, 360] }); }
function drawChart(cv, st, mode) {
  const v = chart(cv);
  v.axes({ xt: [0, 5, 10, 15, 20, 25, 30, 35, 40], yt: [0, 5, 10, 15, 20, 25, 30], xl: '温度（℃）', yl: 'x（g/kg(DA)）', zero: true });
  v.clip(() => {
    for (const hh of [20, 40, 60, 80, 100]) { const t1 = solve(t => hOf(t, xOf(t, 1)) - hh, -10, 50); v.line([[t1, xOf(t1, 1) * 1000], [hh / 1.006 > 40 ? 40 : hh / 1.006, hh / 1.006 > 40 ? (hh - 40.24) / (2501 + 74.4) * 1000 : 0]], { color: 'sub', style: 'dot', width: 1.2 }); }
    for (const phi of [0.2, 0.4, 0.6, 0.8]) v.plot(t => xOf(t, phi) * 1000, { color: 'b', style: 'dash', width: 1.5, x0: 0, x1: 40 });
    v.plot(t => xOf(t, 1) * 1000, { color: 'ink', width: 3, x0: 0, x1: 40 });
  });
  for (const phi of [0.2, 0.4, 0.6, 0.8]) { const t = phi < 0.5 ? 40 : solve(tt => xOf(tt, phi) * 1000 - 28, 0, 45); cv.text(Math.round(phi * 100) + ' %', v.X(Math.min(t, 40)) + 4, v.Y(Math.min(28, xOf(40, phi) * 1000)), { size: 14, color: 'b' }); }
  cv.text('100 %', v.X(solve(t => xOf(t, 1) * 1000 - 28.5, 0, 45)) - 4, v.Y(28.5), { size: 14, align: 'right', bold: true });
  for (const hh of [20, 40, 60, 80]) { const t1 = solve(t => hOf(t, xOf(t, 1)) - hh, -10, 50); cv.text(String(hh), v.X(t1) - 6, v.Y(xOf(t1, 1) * 1000) - 8, { size: 14, color: 'sub', align: 'right' }); }
  cv.text('細い点線：比エンタルピー一定（kJ/kg(DA)）', 330, 418, { align: 'center', size: 14, color: 'sub' });
  if (mode === 'read') {
    const q = props(st.th, st.phi), X = q.x * 1000;
    v.line([[st.th, X], [q.dew, X]], { color: 'd', width: 2.5, style: 'dash' });
    v.dot(q.dew, X, { color: 'd', shape: 'diamond', r: 6 }); cv.text(`露点 ${A.num(q.dew, 1)} ℃`, v.X(q.dew) - 8, v.Y(X) - 14, { size: 15, align: 'right', color: 'd', bold: true, bg: true });
    v.line([[st.th, X], [q.wet, xOf(q.wet, 1) * 1000]], { color: 'e', width: 2.5, style: 'long' });
    v.dot(q.wet, xOf(q.wet, 1) * 1000, { color: 'e', shape: 'tri', r: 6 }); cv.text(`湿球 約 ${A.num(q.wet, 1)} ℃`, v.X(q.wet) + 8, v.Y(xOf(q.wet, 1) * 1000) - 16, { size: 15, color: 'e', bold: true, bg: true });
    v.dot(st.th, X, { color: 'd', r: 8 }); cv.text('A', v.X(st.th) + 12, v.Y(X) + 12, { size: 16, bold: true });
    panel(cv, [['温度', A.num(st.th, 1) + ' ℃'], ['相対湿度', Math.round(st.phi * 100) + ' %'], ['絶対湿度 x', A.num(X, 2) + ' g/kg'], ['比エンタルピー', A.num(q.h, 1) + ' kJ/kg'], ['露点', A.num(q.dew, 1) + ' ℃'], ['湿球温度', '約 ' + A.num(q.wet, 1) + ' ℃']]);
  }
  if (mode === 'cup') {
    const c = cupPath(st), q = props(25, st.phi);
    v.line(c.full, { color: 'd', width: 1.5, alpha: 0.4 });
    v.line(c.done, { color: 'd', width: 4 });
    v.dot(25, q.x * 1000, { color: 'd', r: 6 }); cv.text('部屋の空気', v.X(25) + 10, v.Y(q.x * 1000) - 4, { size: 15 });
    v.dot(c.th, c.x * 1000, { color: 'd', r: 8 });
    if (c.water > 0) v.line([[c.th, c.x * 1000], [c.th, q.x * 1000]], { color: 'a', style: 'dash', width: 2.5 });
    v.line([[q.dew, 0], [q.dew, q.x * 1000]], { color: 'sub', style: 'dot', width: 1.5 });
    cv.text(`露点 ${A.num(q.dew, 1)} ℃`, v.X(q.dew), v.Y(0) - 12, { size: 14, align: 'center', bg: true });
    v.line([[st.cup, 0], [st.cup, 30]], { color: 'a', width: 1.5 });
    cv.text(`コップ ${A.num(st.cup, 1)} ℃`, v.X(st.cup) + 4, v.Y(27), { size: 14, color: 'a' });
  }
  if (mode === 'ac') {
    const c = acPath(st);
    v.line(c.full, { color: 'd', width: 1.5, alpha: 0.4 });
    v.line(c.done, { color: 'd', width: 4 });
    for (const [t, x, lab, dx, dy] of c.marks) { v.dot(t, x, { color: 'ink', r: 5 }); cv.text(lab, v.X(t) + dx, v.Y(x) + dy, { size: 14, bold: true, align: dx < 0 ? 'right' : 'left', bg: true }); }
    v.dot(c.th, c.x * 1000, { color: 'd', r: 8 });
    if (c.water > 0) cv.text(`出ていく水 ${A.num(c.water * 1000, 2)} g/kg(DA)`, 620, 340, { size: 15, color: 'a', bold: true });
    panel(cv, [['温度', A.num(c.th, 1) + ' ℃'], ['相対湿度', Math.round(c.phi * 100) + ' %'], ['絶対湿度 x', A.num(c.x * 1000, 2) + ' g/kg'], ['比エンタルピー', A.num(c.h, 1) + ' kJ/kg']]);
  }
}
function panel(cv, rows) { let y = 60; for (const [a, b] of rows) { cv.text(a, 655, y, { size: 15, color: 'sub' }); cv.text(b, 860, y, { size: 16, bold: true, align: 'right' }); y += 30; } }
// ② コップのそばの空気：まず x 一定で冷え、露点から先は飽和の線にそって、コップの温度まで
function cupPath(st) {
  const q = props(25, st.phi), X = q.x, full = [[25, X * 1000]];
  const end = st.cup;
  if (end >= q.dew) full.push([end, X * 1000]);
  else { full.push([q.dew, X * 1000]); for (let t = q.dew; t >= end; t -= 0.25) full.push([t, xOf(t, 1) * 1000]); full.push([end, xOf(end, 1) * 1000]); }
  const done = sub(full, st.t), cur = done[done.length - 1];
  const x = Math.min(X, xOf(cur[0], 1));
  return { full, done, th: cur[0], x, water: Math.max(0, X - x) };
}
function sub(pts, f) { // 折れ線の長さで f の所まで
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot((pts[i][0] - pts[i - 1][0]) / 40, (pts[i][1] - pts[i - 1][1]) / 30); L.push(l); tot += l; }
  let d = f * tot; const out = [pts[0]];
  for (let i = 0; i < L.length; i++) { if (d >= L[i]) { out.push(pts[i + 1]); d -= L[i]; continue; } const t = L[i] ? d / L[i] : 0; out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]); break; }
  return out;
}
function acPath(st) {
  let full, marks;
  if (st.proc === 'cool') {
    const x0 = xOf(30, 0.7), d = props(30, 0.7).dew;
    full = [[30, x0 * 1000], [d, x0 * 1000]]; for (let t = d; t >= 15; t -= 0.25) full.push([t, xOf(t, 1) * 1000]); full.push([15, xOf(15, 1) * 1000]);
    marks = [[30, x0 * 1000, '30 ℃・70 %', 8, -14], [15, xOf(15, 1) * 1000, '15 ℃・100 %', -10, 4]];
  } else {
    const x0 = xOf(0, 0.8), x2 = xOf(20, 0.5);
    full = [[0, x0 * 1000], [20, x0 * 1000], [20, x2 * 1000]];
    marks = [[0, x0 * 1000, '0 ℃・80 %', 8, -14], [20, x0 * 1000, `20 ℃・${Math.round(x0 / xOf(20, 1) * 100)} %（加熱のあと）`, 10, 12], [20, x2 * 1000, '20 ℃・50 %（加湿のあと）', 10, -12]];
  }
  const done = sub(full, st.t), cur = done[done.length - 1], th = cur[0], x = cur[1] / 1000;
  const phi = Math.min(1, (x * PATM / (0.622 + x)) / ps(th));
  const label = st.proc === 'cool' ? (cur[1] < full[0][1] - 1e-6 ? '冷却除湿：水が出ていく' : '冷却：露点まで x は一定') : (th < 19.99 ? '加熱：x は一定' : st.t >= 1 ? '加湿：おわり' : '加湿：x が増える');
  return { full, done, th, x, phi, h: hOf(th, x), marks, label, water: st.proc === 'cool' ? Math.max(0, full[0][1] - cur[1]) / 1000 : 0 };
}
function drawCup(cv, st) {
  const c = cupPath(st), cx = 740, cy = 330;
  cv.poly([[cx - 45, cy - 120], [cx + 45, cy - 120], [cx + 35, cy + 40], [cx - 35, cy + 40]], { fill: 'a', alpha: 0.12, color: 'ink', width: 2 });
  cv.rect(cx - 38, cy - 70, 76, 105, { fill: 'a', alpha: 0.2 });
  for (const [x, y] of [[-20, -50], [10, -30], [-5, 0]]) cv.rect(cx + x, cy + y, 18, 18, { color: 'a', width: 1.5, fill: 'a', alpha: 0.15 });
  cv.text('冷たい飲み物', cx, cy + 58, { align: 'center', size: 14, color: 'sub' });
  if (c.water > 0) { const r = A.rng(3), n = Math.min(40, Math.round(c.water * 1000 * 6)); for (let i = 0; i < n; i++) { const yy = cy - 110 + r() * 145, side = r() < 0.5 ? -1 : 1, xx = cx + side * (44 - (yy - (cy - 120)) / 160 * 10) + side * 3; cv.dot(xx, yy, { color: 'a', r: 2.5 + r() * 2.5, open: true }); } cv.text('水てき', cx, cy - 140, { align: 'center', size: 15, color: 'a', bold: true }); }
  panel(cv, [['そばの空気', A.num(c.th, 1) + ' ℃']]);
}
