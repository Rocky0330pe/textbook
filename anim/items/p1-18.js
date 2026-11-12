// @id p1-18
// @title 0 ℃のまま熱が入る：加熱曲線と分子の並び
// @vol 物理2
// @from 物理 熱-1 ⑤⑥（p2-01 の状態変化・潜熱・加熱曲線・氷水の表計算）／熱-8 ①②・熱-10 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>'; // 読み出しの区切り（全角の空白は行の終わりではみ出すので使わない）
// 本の値：比熱 氷 2.1・水 4.2 kJ/(kg·K)、融解熱 334・蒸発熱 2257 kJ/kg。−10 ℃の氷 100 g を 100 ℃の水蒸気にすると 303.2 kJ。
// 本の表（30 秒ごと）：時刻 s・残りの氷 g・温度 ℃
const SHEET = [[0, 100.0, 0.0], [30, 82.0, 0.0], [60, 64.1, 0.0], [90, 46.1, 0.0], [120, 28.1, 0.0], [150, 10.2, 0.0], [180, 0.0, 2.1], [210, 0.0, 6.8], [240, 0.0, 11.6]];
const C_ICE = 2.1, C_W = 4.2, LF = 334, LV = 2257, NMOL = 48;
A.item({
  id: 'p1-18', title: '0 ℃のまま熱が入る：加熱曲線と分子の並び',
  from: '物理 第2巻『熱学』 熱-1 ⑤⑥ の図と表から（加熱曲線、200 W で温める氷水）',
  W: 880, H: 440,
  state: { Q: 0, P: 500, m: 100, t: 0, ts: 0 },
  scenes: [
    {
      key: 'kanetsu', label: '① 氷から水蒸気まで',
      lead: '−10 ℃の氷 100 g を、一定の電力のヒーターで温めます。温度のグラフと、分子の並び方を見くらべましょう。',
      note: '平らな所（②④）では、入れた熱が分子どうしのつながりを切るのに使われ、温度は上がりません（**潜熱** $Q=mL$）。ななめの所（①③）では温度が上がります（$Q=mc\\Delta T$）。蒸発の段は、とける段の約7倍も長く、全体の約74 % をしめます。',
      miss: '0 ℃の氷が 0 ℃の水になるので $\\Delta T=0$、だから熱は要らない――はまちがいです。状態変化には潜熱 $Q=mL$ が要ります（氷 1 kg なら 334 kJ）。',
      legend: [['温度（加熱曲線）', { color: 'a' }], ['いま', { color: 'b', shape: 'circle', noline: true }], ['分子（固体・液体・気体）', { color: 'a', shape: 'circle', noline: true }]],
      controls: [
        { range: 'P', label: 'ヒーターの電力', min: 200, max: 1000, step: 10, fmt: v => v + ' W' },
        { range: 'm', label: '氷の質量', min: 50, max: 200, step: 5, fmt: v => v + ' g', on: st => { st.Q = 0; st.t = 0; } }
      ],
      init(st) { st.Q = 0; st.t = 0; },
      step(st, dt) { const tot = total(st.m); st.ts += dt; const d = dt * 30 * st.P / 1000; st.Q = Math.min(tot, st.Q + d); st.t += dt * 30; if (st.Q >= tot) return false; },
      draw(cv, st) { drawCurve(cv, st); },
      readout: st => { const s = stateAt(st.Q, st.m); return `入れた熱 ${A.num(st.Q, 1)} kJ（時刻 ${Math.round(st.Q * 1000 / st.P)} s）${SP}温度 <b>${A.num(s.T, 1)} ℃</b>${SP}${s.label}`; }
    },
    {
      key: 'koorimizu', label: '② 200 W で氷水を温める',
      lead: '0 ℃の氷 100 g と 0 ℃の水 200 g を、200 W のヒーターで温めます（熱は逃げないとする）。氷が残っている間、温度はどうなるでしょう。',
      note: '30 秒ごとに入る熱は $200\\times30=6000$ J。氷が残っている間は、その熱で氷がとけ、温度は 0 ℃のまま。150 s から 180 s の間に氷がなくなり、そこから先は 30 秒ごとに $6000÷(4.2\\times300)\\approx4.8$ K ずつ上がります。',
      miss: '氷水を「とけている途中だから少しは温度が上がる」と考えがちですが、よくかき混ぜた氷水は、氷が残っているかぎり 0 ℃です。1気圧で氷と水がいっしょにいられる温度は 0 ℃だけです。',
      legend: [['温度（式で計算）', { color: 'a' }], ['表計算の値（30 秒ごと）', { color: 'b', shape: 'square', noline: true }], ['残りの氷', { color: 'c', style: 'dash' }]],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(240, st.t + dt * 20); if (st.t >= 240) return false; },
      draw(cv, st) { drawSheet(cv, st); },
      readout: st => { const s = mixAt(st.t); return `時刻 ${Math.round(st.t)} s${SP}入った熱 ${Math.round(200 * st.t)} J${SP}残りの氷 <b>${A.num(s.ice, 1)} g</b>${SP}温度 <b>${A.num(s.T, 1)} ℃</b>`; }
    }
  ]
});

// ---------- 計算 ----------
function stages(m) { const k = m / 1000; return [k * C_ICE * 10, k * LF, k * C_W * 100, k * LV]; } // kJ
function total(m) { return stages(m).reduce((a, b) => a + b, 0); }
function stateAt(Q, m) {
  const s = stages(m), k = m / 1000;
  if (Q <= s[0]) return { T: -10 + Q / (k * C_ICE), solid: 1, gas: 0, label: '① 氷が温まる' };
  Q -= s[0];
  if (Q <= s[1]) return { T: 0, solid: 1 - Q / s[1], gas: 0, label: `② 0 ℃のまま、とける（とけた割合 ${Math.round(Q / s[1] * 100)} %）` };
  Q -= s[1];
  if (Q <= s[2]) return { T: Q / (k * C_W), solid: 0, gas: 0, label: '③ 水が温まる' };
  Q -= s[2];
  return { T: 100, solid: 0, gas: Math.min(1, Q / s[3]), label: `④ 100 ℃のまま、蒸発する（水蒸気の割合 ${Math.round(Math.min(1, Q / s[3]) * 100)} %）` };
}
function mixAt(t) { // 0 ℃の氷 100 g と水 200 g、200 W（式で：融解熱 334 J/g、水の比熱 4.2 J/(g·K)）
  const Q = 200 * t, need = 100 * 334;
  if (Q <= need) return { ice: 100 - Q / 334, T: 0 };
  return { ice: 0, T: (Q - need) / (4.2 * 300) };
}

// ---------- 絵 ----------
function drawCurve(cv, st) {
  const m = st.m, s = stages(m), tot = total(m), k = m / 1000;
  const xs = [0, s[0], s[0] + s[1], s[0] + s[1] + s[2], tot], ys = [-10, 0, 0, 100, 100];
  const g = cv.view({ x0: 0, x1: Math.max(335, tot * 1.08), y0: -40, y1: 122, box: [70, 30, 500, 360] });
  const xt = [xs[2], xs[3], tot].map(v => +v.toFixed(1));
  g.axes({ xt, yt: [-10, 0, 50, 100], xl: '入れた熱（kJ）', yl: 'θ（℃）', ay: 0, ax: -40, xfmt: v => A.num(v, 1), zero: true });
  g.line([[0, 0], [g.x1, 0]], { color: 'sub', width: 1 });
  g.line(xs.map((x, i) => [x, ys[i]]), { color: 'a', width: 1.5, alpha: 0.35 });
  // いままでの道
  const pts = [[0, -10]];
  for (let i = 1; i < xs.length; i++) { if (st.Q >= xs[i]) pts.push([xs[i], ys[i]]); else { pts.push([st.Q, ys[i - 1] + (ys[i] - ys[i - 1]) * (st.Q - xs[i - 1]) / (xs[i] - xs[i - 1] || 1)]); break; } }
  g.line(pts, { color: 'a', width: 3.5 });
  g.line([[tot, 100], [tot + 5, 112]], { color: 'a', style: 'dash', width: 2 });
  const S = stateAt(st.Q, m);
  g.dot(st.Q, S.T, { color: 'b', r: 7 });
  g.text('① 氷が温まる', xs[1] + 8, -22, { size: 14, color: 'sub' });
  g.text('② 0 ℃のまま、とける', xs[1] + 8, -9, { size: 14, color: 'sub' });
  g.text('③ 水が温まる', (xs[2] + xs[3]) / 2 + 12, 50, { size: 14, color: 'sub' });
  g.text('④ 100 ℃のまま、蒸発する', (xs[3] + tot) / 2, 109, { size: 14, color: 'sub', align: 'center' });
  // 分子の箱
  drawMolecules(cv, st, S, [600, 50, 260, 250]);
  const bars = [['① 氷', s[0]], ['② とかす', s[1]], ['③ 水', s[2]], ['④ 蒸発', s[3]]];
  let y = 320;
  for (const [nm, v] of bars) { cv.text(`${nm}　${A.num(v, 1)} kJ`, 600, y, { size: 14, color: 'sub' }); y += 22; }
  void k;
}
function drawMolecules(cv, st, S, box) {
  const [L, T, Wd, Ht] = box, r = A.rng(5), t = st.ts || 0;
  cv.rect(L, T, Wd, Ht, { color: 'sub', width: 1.5 });
  const nS = Math.round(NMOL * S.solid), nG = Math.round(NMOL * S.gas), cols = 8;
  const heat = A.clamp((S.T + 10) / 110, 0, 1);
  for (let i = 0; i < NMOL; i++) {
    const a = r(), b = r(), c = r(), d = r();
    let x, y;
    if (i < nS) { // 固体：格子の上で小さくふるえる（下にかたまって並ぶ）
      const ix = i % cols, iy = Math.floor(i / cols);
      x = L + 22 + ix * 31 + 2.5 * (0.4 + heat) * Math.sin(t * 9 + a * 20);
      y = T + Ht - 20 - iy * 26 + 2.5 * (0.4 + heat) * Math.cos(t * 11 + b * 20);
    } else if (i >= NMOL - nG) { // 気体：箱いっぱいに飛ぶ
      const vx = (c - 0.5) * 300, vy = (d - 0.5) * 300;
      x = L + 10 + tri((a * (Wd - 20) + vx * t), Wd - 20); y = T + 10 + tri((b * (Ht - 20) + vy * t), Ht - 20);
    } else { // 液体：下のほうで、ふれ合いながら動く
      const j = i - nS, ix = j % cols, iy = Math.floor(j / cols) + Math.floor(nS / cols);
      x = L + 22 + ix * 31 + 9 * Math.sin(t * (1 + c) + a * 30) ; y = T + Ht - 20 - iy * 22 + 6 * Math.cos(t * (1.3 + d) + b * 30);
    }
    cv.dot(x, y, { color: 'a', r: 7, shape: 'circle', open: i >= NMOL - nG });
    if (i < nS && (i % cols) < cols - 1 && i + 1 < nS) { const x2 = L + 22 + (i % cols + 1) * 31, y2 = T + Ht - 20 - Math.floor(i / cols) * 26; cv.line([[x + 7, y], [x2 - 7, y2]], { color: 'a', width: 1.5, alpha: 0.5 }); }
  }
  const lab = S.solid === 1 ? '固体（氷）：並んで手をつなぐ' : S.gas >= 1 ? '気体（水蒸気）：ばらばらに飛ぶ' : S.solid > 0 ? '氷と水：つながりが切れていく' : S.gas > 0 ? '水と水蒸気：飛び出していく' : '液体（水）：ふれ合いながら動く';
  cv.text(lab, L + Wd / 2, T - 14, { align: 'center', size: 15, bold: true });
}
function tri(v, w) { const p = ((v % (2 * w)) + 2 * w) % (2 * w); return p < w ? p : 2 * w - p; }
function drawSheet(cv, st) {
  const g = cv.view({ x0: 0, x1: 255, y0: -2, y1: 14, box: [70, 30, 520, 360] });
  g.axes({ xt: [0, 30, 60, 90, 120, 150, 180, 210, 240], yt: [0, 2, 4, 6, 8, 10, 12], xl: '時刻（s）', yl: '温度（℃）', zero: true });
  g.plot(t => mixAt(t).T, { x0: 0, x1: st.t, color: 'a', width: 3 });
  for (const [t, , T] of SHEET) if (t <= st.t + 1e-6) g.dot(t, T, { color: 'b', shape: 'square', r: 5 });
  const s = mixAt(st.t);
  g.dot(st.t, s.T, { color: 'a', r: 6 });
  g.line([[167, -2], [167, 14]], { color: 'sub', style: 'dot', width: 1.5 });
  g.text('氷がなくなる（167 s）', 170, 12.8, { size: 14, color: 'sub' });
  // 残りの氷の棒
  const bx = 640, by = 60, bh = 260;
  cv.rect(bx, by, 60, bh, { color: 'sub', width: 1.5 });
  cv.rect(bx, by + bh * (1 - s.ice / 100), 60, bh * s.ice / 100, { fill: 'c', alpha: 0.35, color: 'c', style: 'dash', width: 2 });
  cv.text('残りの氷', bx + 30, by - 16, { align: 'center', size: 15 });
  cv.text(A.num(s.ice, 1) + ' g', bx + 30, by + bh + 18, { align: 'center', size: 15, bold: true });
  // 表
  cv.text('表計算（本の表）', 740, 60, { size: 14, color: 'sub' });
  let y = 84;
  cv.text('時刻　氷　温度', 740, y, { size: 14, bold: true }); y += 22;
  for (const [t, ice, T] of SHEET) { cv.text(`${t}　${A.num(ice, 1)}　${A.num(T, 1)}`, 740, y, { size: 14, color: t <= st.t + 1e-6 ? 'ink' : 'grid' }); y += 21; }
}
