// @id p1-22
// @title カルノーサイクル：p-V 図と T-S 線図を同時に
// @vol 物理2
// @from 物理 熱-5 ②⑤（p2-05 のカルノーサイクル・効率）、熱-6 ⑧（p2-06 の T-S 線図・2つの図の面積）／熱-7〜9・熱-16 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 本の図：単原子分子の理想気体 1 mol、TH＝600 K・TL＝300 K、1→2 で体積 10 L→20 L。
//   QH＝RTH ln2＝3456 J、QL＝1728 J、W出＝1728 J、η＝0.5（本の Python の結果と同じ。R＝8.31）。
// ③ 熱-2 例題12 の長方形のサイクル（2原子の理想気体、A で 300 K、nCp＝2.3335 J/K、nCV＝1.6668 J/K）。囲む面積はどちらも 200 J。
const RG = 8.31, CV1 = 1.5 * RG, V1 = 10, V2 = 20;
const NCP = 2.3335, NCV = 1.6668;
const RECT = [[1, 200, 300], [3, 200, 900], [3, 100, 450], [1, 100, 150]];
A.item({
  id: 'p1-22', title: 'カルノーサイクル：p-V 図と T-S 線図を同時に',
  from: '物理 第2巻『熱学』 熱-5 ⑤ と 熱-6 ⑧ の図から（単原子の理想気体 1 mol、600 K と 300 K）',
  W: 880, H: 440,
  state: { TH: 600, TL: 300, u: 0, dir: 1 },
  scenes: [
    {
      key: 'carnot', label: '① 4つの変化',
      lead: '1→2 等温膨張、2→3 断熱膨張、3→4 等温圧縮、4→1 断熱圧縮。シリンダーの下にあるもの（熱源か断熱材か）と、2つの図の点の動きを見くらべましょう。',
      note: '熱を受けとるのは $T_{\\mathrm H}$ の等温の変化（$Q_{\\mathrm H}$）、捨てるのは $T_{\\mathrm L}$ の等温の変化（$Q_{\\mathrm L}$）だけです。$T$-$S$ 線図では等温は横、断熱はたての線なので、サイクルは**長方形**になり、効率は面積の比から $\\eta_{\\mathrm C}=1-T_{\\mathrm L}/T_{\\mathrm H}$。',
      miss: '温度は必ず K で入れます。600 ℃と 300 ℃なら $1-573/873\\approx0.34$ で、$1-300/600=0.5$ ではありません。また、$T_{\\mathrm H}$ を上げて温度差を2倍にしても、効率は2倍になりません。',
      legend: [['等温（熱源とつながる）', { color: 'b' }], ['断熱（熱の出入りなし）', { color: 'sub', style: 'dash' }], ['囲む面積＝1周の仕事', { color: 'e', shape: 'square', noline: true }]],
      controls: [
        { range: 'TH', label: '高温 $T_{\\mathrm H}$', min: 400, max: 1200, step: 10, fmt: v => v + ' K' },
        { range: 'TL', label: '低温 $T_{\\mathrm L}$', min: 200, max: 390, step: 5, fmt: v => v + ' K' }
      ],
      init(st) { st.u = 0; st.dir = 1; },
      step(st, dt) { st.u = (st.u + dt * 0.07) % 1; },

      draw(cv, st) { drawCarnot(cv, st); },
      readout: st => { const q = heats(st); return `${stage(st).name}${SP}$Q_{\\mathrm H}$ ＝ ${Math.round(q.QH)} J${SP}$Q_{\\mathrm L}$ ＝ ${Math.round(q.QL)} J${SP}$W_{\\text{出}}$ ＝ ${Math.round(q.QH - q.QL)} J${SP}$\\eta$ ＝ 1 − ${st.TL}/${st.TH} ＝ <b>${A.num(1 - st.TL / st.TH, 3)}</b>`; }
    },
    {
      key: 'reitou', label: '② 逆に回すと冷凍機',
      lead: '同じサイクルを逆向き（1→4→3→2→1）に回します。こんどは、低温の側から熱を受けとり、高温の側へ捨てます。',
      note: '可逆なサイクルは逆に回せます。仕事 $W_{\\text{入}}$ を入れて、低温から $Q_{\\mathrm L}$ をくみ上げ、高温へ $Q_{\\mathrm H}=Q_{\\mathrm L}+W_{\\text{入}}$ を出します。成績係数の上限は $\\mathrm{COP}_{\\text{冷}}=T_{\\mathrm L}/(T_{\\mathrm H}-T_{\\mathrm L})$。温度の差が小さいほど大きくなります。',
      miss: '成績係数は「効率」ではありません。くみ上げる熱は、入れた仕事とは別に低温の側からもらうので、1より大きくてよいのです。',
      legend: [['等温（熱源とつながる）', { color: 'a' }], ['断熱（熱の出入りなし）', { color: 'sub', style: 'dash' }], ['囲む面積＝1周に入れる仕事', { color: 'a', shape: 'square', noline: true }]],
      controls: [
        { range: 'TH', label: '高温 $T_{\\mathrm H}$', min: 310, max: 700, step: 5, fmt: v => v + ' K' },
        { range: 'TL', label: '低温 $T_{\\mathrm L}$', min: 200, max: 300, step: 5, fmt: v => v + ' K' }
      ],
      state: { TH: 320, TL: 280 },
      init(st) { st.u = 0; st.dir = -1; if (st.TH <= st.TL) st.TH = st.TL + 10; },
      step(st, dt) { st.u = (st.u + dt * 0.07) % 1; },
      draw(cv, st) { if (st.TH <= st.TL + 5) st.TH = st.TL + 5; drawCarnot(cv, st); },
      readout: st => { const q = heats(st); return `${stage(st).name}${SP}$Q_{\\mathrm L}$ ＝ ${Math.round(q.QL)} J をくみ上げ、$W_{\\text{入}}$ ＝ ${Math.round(q.QH - q.QL)} J を入れて、$Q_{\\mathrm H}$ ＝ ${Math.round(q.QH)} J を出す${SP}$\\mathrm{COP}_{\\text{冷}}$ ＝ ${st.TL}/(${st.TH}−${st.TL}) ＝ <b>${A.num(st.TL / (st.TH - st.TL), 2)}</b>`; }
    },
    {
      key: 'menseki', label: '③ 2つの図の面積',
      lead: '熱-2 の長方形のサイクル（A→B→C→D）を、$p$-$V$ 図と $T$-$S$ 線図に同時にかきます。形はちがっても、囲む面積は同じでしょうか。',
      note: '$p$-$V$ 図の長方形は $100\\text{ kPa}\\times2\\text{ L}=200$ J。$T$-$S$ 線図では、受けとる熱は A→B で 1400 J・D→A で 250 J、捨てる熱は B→C で 750 J・C→D で 700 J で、正味 200 J。$\\oint T\\,\\mathrm{d}S=\\oint p\\,\\mathrm{d}V=W_{\\text{出}}$：**2つの図の囲む面積は同じ**です。',
      miss: '$T$-$S$ 線図の道の下の面積は「受けとった熱」で、仕事ではありません。$p$-$V$ 図は仕事が、$T$-$S$ 線図は熱が、面積で見える図です。1周すると $\\oint\\mathrm{d}U=0$ なので、正味の熱と正味の仕事が等しくなります。',
      legend: [['サイクル', { color: 'ink' }], ['いまの点', { color: 'b', shape: 'circle', noline: true }], ['囲む面積（200 J）', { color: 'e', shape: 'square', noline: true }]],
      init(st) { st.u = 0; },
      step(st, dt) { st.u = (st.u + dt * 0.06) % 1; },
      draw(cv, st) { drawRect(cv, st); },
      readout: st => { const r = rectAt(st.u); return `${r.name}${SP}${A.num(r.V, 2)} L・${Math.round(r.p)} kPa・${Math.round(r.T)} K${SP}$S$ ＝ ${A.num(r.S, 2)} J/K（A を 0）`; }
    }
  ]
});

// ---------- カルノー ----------
function vols(st) { const k = Math.pow(st.TH / st.TL, 1.5); return [V1, V2, V2 * k, V1 * k]; }
function heats(st) { return { QH: RG * st.TH * Math.log(V2 / V1), QL: RG * st.TL * Math.log(V2 / V1) }; }
// u（0〜1）の所の状態。dir＝1：1→2→3→4→1、dir＝−1：1→4→3→2→1
function stage(st) {
  const [Va, Vb, Vc, Vd] = vols(st), TH = st.TH, TL = st.TL;
  let u = st.dir > 0 ? st.u : 1 - st.u; // 逆向きは時間を逆にたどる
  const k = Math.min(3, Math.floor(u * 4)), f = u * 4 - k;
  let V, T, name;
  if (k === 0) { V = Va * Math.pow(Vb / Va, f); T = TH; name = st.dir > 0 ? '1→2 等温膨張：高温から熱を受けとる' : '2→1 等温圧縮：高温へ熱を捨てる'; }
  else if (k === 1) { T = TH + (TL - TH) * f; V = Vb * Math.pow(TH / T, 1.5); name = st.dir > 0 ? '2→3 断熱膨張：温度が下がる' : '3→2 断熱圧縮：温度が上がる'; }
  else if (k === 2) { V = Vc * Math.pow(Vd / Vc, f); T = TL; name = st.dir > 0 ? '3→4 等温圧縮：低温へ熱を捨てる' : '4→3 等温膨張：低温から熱を受けとる'; }
  else { T = TL + (TH - TL) * f; V = Vd * Math.pow(TL / T, 1.5); name = st.dir > 0 ? '4→1 断熱圧縮：温度が上がる' : '1→4 断熱膨張：温度が下がる'; }
  return { V, T, p: RG * T / V, S: RG * Math.log(V / Va) + CV1 * Math.log(T / TH), k, name };
}
function niceStep(x) { const e = Math.pow(10, Math.floor(Math.log10(x))); for (const m of [1, 2, 2.5, 5, 10]) if (m * e >= x) return m * e; return 10 * e; }
function niceMax(x) { const s = niceStep(x / 4); return Math.ceil(x / s) * s; }
function ticks(mx) { const s = niceStep(mx / 4.5), r = []; for (let v = s; v <= mx + 1e-9; v += s) r.push(+v.toFixed(6)); return r; }
function drawCarnot(cv, st) {
  const [Va, Vb, Vc, Vd] = vols(st), TH = st.TH, TL = st.TL, s = stage(st), eng = st.dir > 0;
  const iso = eng ? 'b' : 'a';
  // シリンダー
  const cx = 120, cyB = 300, h = 60 + 120 * (Math.log(s.V / Va) / Math.log(Vc / Va));
  const plate = s.k === 0 ? ['b', `高温の熱源 ${TH} K`] : s.k === 2 ? ['a', `低温の熱源 ${TL} K`] : ['sub', '断熱材'];
  cv.rect(cx - 70, cyB, 140, 26, { fill: plate[0], alpha: 0.35, color: plate[0], width: 2 });
  cv.text(plate[1], cx, cyB + 13, { align: 'center', size: 14, bold: true });
  cv.line([[cx - 50, cyB - 200], [cx - 50, cyB], [cx + 50, cyB], [cx + 50, cyB - 200]], { color: 'ink', width: 2.5 });
  cv.rect(cx - 48, cyB - h, 96, h - 2, { fill: 'b', alpha: 0.08 + 0.4 * (s.T - TL) / Math.max(1, TH - TL) });
  cv.rect(cx - 48, cyB - h - 10, 96, 10, { fill: 'sub', alpha: 0.85 });
  cv.line([[cx, cyB - h - 10], [cx, cyB - h - 40]], { color: 'sub', width: 4 });
  cv.text(`${Math.round(s.T)} K`, cx, cyB - h / 2, { align: 'center', size: 16, bold: true });
  // 熱の矢印
  // 熱の矢印（上向き＝気体に入る、下向き＝気体から出る）
  if (s.k === 0 || s.k === 2) {
    const into = (s.k === 0) === eng, col = s.k === 0 ? 'b' : 'a', lab = (s.k === 0 ? 'QH' : 'QL') + (into ? ' が入る' : ' が出る');
    if (into) cv.arrow(cx - 30, cyB + 75, cx - 30, cyB + 30, { color: col, width: 4 }); else cv.arrow(cx - 30, cyB + 30, cx - 30, cyB + 75, { color: col, width: 4, style: 'dash' });
    cv.text(lab, cx - 18, cyB + 58, { size: 15, color: col, bold: true });
  }
  // p-V 図
  const Vm = niceMax(Vc * 1.12), pm = niceMax(RG * TH / Va * 1.1);
  const g = cv.view({ x0: 0, x1: Vm, y0: 0, y1: pm, box: [255, 30, 300, 360] });
  g.axes({ xt: ticks(Vm), yt: ticks(pm), xl: 'V（L）', yl: 'p（kPa）' });
  const path = [];
  const N = 40;
  for (let i = 0; i <= N; i++) path.push([Va * Math.pow(Vb / Va, i / N), RG * TH / (Va * Math.pow(Vb / Va, i / N))]);
  for (let i = 0; i <= N; i++) { const T = TH + (TL - TH) * i / N, V = Vb * Math.pow(TH / T, 1.5); path.push([V, RG * T / V]); }
  for (let i = 0; i <= N; i++) { const V = Vc * Math.pow(Vd / Vc, i / N); path.push([V, RG * TL / V]); }
  for (let i = 0; i <= N; i++) { const T = TL + (TH - TL) * i / N, V = Vd * Math.pow(TL / T, 1.5); path.push([V, RG * T / V]); }
  g.poly(path, { fill: eng ? 'e' : 'a', alpha: 0.22 });
  g.line(path.slice(0, N + 1), { color: iso, width: 3 }); g.line(path.slice(2 * N + 2, 3 * N + 3), { color: iso, width: 3 });
  g.line(path.slice(N + 1, 2 * N + 2), { color: 'sub', width: 2.5, style: 'dash' }); g.line(path.slice(3 * N + 3), { color: 'sub', width: 2.5, style: 'dash' });
  [[Va, TH, '1', -10, -12], [Vb, TH, '2', 12, -10], [Vc, TL, '3', 10, -14], [Vd, TL, '4', -12, 12]].forEach(([V, T, n, dx, dy]) => { g.dot(V, RG * T / V, { color: 'ink', r: 4 }); cv.text(n, g.X(V) + dx, g.Y(RG * T / V) + dy, { size: 15, bold: true, align: 'center' }); });
  g.dot(s.V, s.p, { color: 'b', r: 7 });
  cv.text('p-V 図', 405, 418, { align: 'center', size: 15, bold: true });
  // T-S 線図
  const dS = RG * Math.log(Vb / Va), Tm = niceMax(TH * 1.15);
  // 1 の S を 1 J/K とした（目もりの数と重ならないように）
  const t = cv.view({ x0: 0, x1: 8, y0: 0, y1: Tm, box: [585, 30, 275, 360] }), S1 = 1;
  t.axes({ xt: [2, 4, 6], yt: [TL, TH], xl: 'S（J/K）', yl: 'T（K）', ay: 0 });
  t.poly([[S1, TL], [S1 + dS, TL], [S1 + dS, TH], [S1, TH]], { fill: eng ? 'e' : 'a', alpha: 0.22 });
  t.poly([[S1, 0], [S1 + dS, 0], [S1 + dS, TL], [S1, TL]], { fill: 'a', alpha: 0.08 });
  t.line([[S1, TH], [S1 + dS, TH]], { color: iso, width: 3 }); t.line([[S1 + dS, TL], [S1, TL]], { color: iso, width: 3 });
  t.line([[S1 + dS, TH], [S1 + dS, TL]], { color: 'sub', width: 2.5, style: 'dash' }); t.line([[S1, TL], [S1, TH]], { color: 'sub', width: 2.5, style: 'dash' });
  t.text(eng ? 'W出' : 'W入', S1 + dS / 2, (TH + TL) / 2, { align: 'center', size: 15, bold: true });
  t.text(eng ? 'QL（捨てる熱）' : 'QL（くみ上げる熱）', S1 + dS / 2, TL / 2, { align: 'center', size: 15, color: 'a' });
  [[S1, TH, '1', -10, -12], [S1 + dS, TH, '2', 10, -12], [S1 + dS, TL, '3', 10, 12], [S1, TL, '4', -10, 12]].forEach(([S, T, n, dx, dy]) => cv.text(n, t.X(S) + dx, t.Y(T) + dy, { size: 15, bold: true, align: 'center' }));
  t.dot(S1 + s.S, s.T, { color: 'b', r: 7 });
  cv.text('T-S 線図', 722, 418, { align: 'center', size: 15, bold: true });
}

// ---------- 長方形のサイクル ----------
function rectAt(u) {
  const k = Math.min(3, Math.floor(u * 4)), f = u * 4 - k, a = RECT[k], b = RECT[(k + 1) % 4];
  const V = a[0] + (b[0] - a[0]) * f, p = a[1] + (b[1] - a[1]) * f, T = a[2] * (V * p) / (a[0] * a[1]);
  const S0 = [0, NCP * Math.log(3), NCP * Math.log(3) + NCV * Math.log(0.5), NCP * Math.log(3) + NCV * Math.log(0.5) + NCP * Math.log(150 / 450)];
  const c = k % 2 === 0 ? NCP : NCV, S = S0[k] + c * Math.log(T / a[2]);
  const names = ['A→B 圧力一定でふくらむ（熱 1400 J を受けとる）', 'B→C 体積一定で冷える（熱 750 J を捨てる）', 'C→D 圧力一定で縮む（熱 700 J を捨てる）', 'D→A 体積一定で温まる（熱 250 J を受けとる）'];
  return { V, p, T, S, k, name: names[k], S0 };
}
function drawRect(cv, st) {
  const r = rectAt(st.u);
  const g = cv.view({ x0: 0, x1: 3.6, y0: 0, y1: 250, box: [70, 30, 330, 360] });
  g.axes({ xt: [1, 2, 3], yt: [100, 200], xl: 'V（L）', yl: 'p（kPa）' });
  g.poly(RECT.map(q => [q[0], q[1]]), { fill: 'e', alpha: 0.25, color: 'ink', width: 2.5 });
  g.text('200 J', 2, 150, { align: 'center', size: 17, bold: true });
  ['A', 'B', 'C', 'D'].forEach((n, i) => cv.text(n, g.X(RECT[i][0]) + (i === 0 || i === 3 ? -14 : 14), g.Y(RECT[i][1]) + (i < 2 ? -14 : 14), { size: 16, bold: true, align: 'center' }));
  g.dot(r.V, r.p, { color: 'b', r: 7 });
  cv.text('p-V 図', 235, 418, { align: 'center', size: 15, bold: true });
  const t = cv.view({ x0: -1.5, x1: 3.2, y0: 0, y1: 1000, box: [500, 30, 360, 360] });
  t.axes({ xt: [-1, 0, 1, 2, 3], yt: [150, 300, 450, 900], xl: 'S（J/K）', yl: 'T（K）', ay: -1.5, zero: true });
  const pts = []; for (let i = 0; i <= 400; i++) { const q = rectAt(i / 400 * 0.99999); pts.push([q.S, q.T]); }
  t.poly(pts, { fill: 'e', alpha: 0.25, color: 'ink', width: 2.5 });
  t.text('囲む面積 200 J', -0.4, 700, { align: 'center', size: 16, bold: true });
  t.arrow(-0.2, 660, 0.45, 420, { color: 'ink', width: 1.5 });
  const S0 = r.S0; [['A', -18, -10], ['B', 14, -10], ['C', 16, 14], ['D', -6, -16]].forEach(([n, dx, dy], i) => cv.text(n, t.X(S0[i]) + dx, t.Y(RECT[i][2]) + dy, { size: 16, bold: true, align: 'center' }));
  t.dot(r.S, r.T, { color: 'b', r: 7 });
  cv.text('T-S 線図（A を S＝0）', 680, 418, { align: 'center', size: 15, bold: true });
}
