// @id p1-21
// @title 押すと温まる：ピストンと分子、等温線と断熱線
// @vol 物理2
// @from 物理 熱-2 ⑤（p2-02 の断熱圧縮）、熱-3 ⑤⑥（p2-03 の等温線・断熱線・ポアソンの式・表計算）／熱-14、力-3、熱-4 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 本の数：はじめ 1 L・100 kPa・300 K の空気（n＝0.0401 mol、CV＝5R/2、γ＝1.4）。1/3 まで押すと、
//   等温：300 kPa・300 K、断熱：pV^1.4 一定で 466 K・466 kPa。表計算（20 段）は 457.3 K、200 段で 465 K。
// 分子の絵：ピストンにぶつかった分子は vx' ＝ 2u − vx（動く壁ではね返る）。空気の分子は回る動きにもエネルギーを分けるので、
//   全体の速さは、空気（γ＝1.4）の温度に合わせてそろえる（等温のときは水そうの 300 K に合わせる）。
const NM = 70, R = 8.314, G = 1.4, NMOL = 100 / (R * 300);
const BOX = { x0: 40, y0: 60, h: 250, wmax: 330 };
A.item({
  id: 'p1-21', title: '押すと温まる：ピストンと分子、等温線と断熱線',
  from: '物理 第2巻『熱学』 熱-2 ⑤・熱-3 ⑤⑥ の図と表から（空気 1 L・100 kPa・300 K を 1/3 まで押す）',
  W: 880, H: 440,
  state: { mode: 'adi', Vr: 1, t: 0, N: 20 },
  scenes: [
    {
      key: 'piston', label: '① ピストンと分子',
      lead: 'ピストンで空気を 1/3 まで押し縮め、またもどします。押しこまれてくるピストンにぶつかった分子が、どうなるかを見ましょう。',
      note: '動いてくるピストンにはね返った分子は、ぶつかる前より**速く**なります（赤い分子）。速い分子が増えるので温度が上がります。熱の出入りがない**断熱**では、押す仕事が全部、内部エネルギーになります（$\\Delta U=W$）。ふくらむときは、逃げていくピストンで分子が遅くなり（青い分子）、冷えます。',
      miss: '「断熱なら温度は変わらない」「断熱で冷えるのは熱が逃げたから」はどちらもまちがい。断熱は $Q=0$ という意味です。温度が変わるのは仕事をしたり、されたりしたから（$\\Delta U=W$）。温度一定のまま押すには、熱を外へ逃がす必要があります（等温）。',
      legend: [['断熱 $pV^{1.4}=$一定', { color: 'b' }], ['等温 $pV=$一定', { color: 'a', style: 'dash' }], ['ぶつかって速くなった分子', { color: 'b', shape: 'circle', noline: true }], ['ぶつかって遅くなった分子', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ seg: 'mode', label: '変化', options: [['adi', '断熱（熱が出入りしない）'], ['iso', '等温（水そうにつける）']], on: st => { st.t = 0; st.Vr = 1; resetGas(st); } }],
      init(st) { st.t = 0; st.Vr = 1; resetGas(st); },
      step(st, dt) {
        st.t += dt; const T = 7;
        const Vn = 1 - (2 / 3) * (0.5 - 0.5 * Math.cos(2 * Math.PI * Math.min(st.t, T) / T));
        moveGas(st, Vn, dt); if (st.t >= T) return false;
      },
      drag: {
        hit(st, x, y) { const X = BOX.x0 + BOX.wmax * st.Vr; return Math.abs(x - X) < 30 && y > BOX.y0 - 10 && y < BOX.y0 + BOX.h + 10 ? 1 : null; },
        move(st, x, y, api) { const Vn = A.clamp((x - BOX.x0) / BOX.wmax, 1 / 3, 1); moveGas(st, Vn, 1 / 60); }
      },
      draw(cv, st) { drawGas(cv, st); },
      readout: st => { const s = gasState(st); return `体積 ${A.num(st.Vr, 3)} L${SP}圧力 <b>${Math.round(s.p)} kPa</b>${SP}温度 <b>${Math.round(s.T)} K</b>（${Math.round(s.T - 273)} ℃）${SP}${st.mode === 'adi' ? '断熱：$TV^{0.4}$ が一定' : '等温：$pV$ が一定'}`; }
    },
    {
      key: 'kukiri', label: '② 小さな段に区切る',
      lead: '1 L・100 kPa・300 K の空気を、何段かに分けて 1/3 まで押し縮めます。1段ごとに「される仕事の分だけ温度が上がる」として計算しましょう（オイラー法）。',
      note: '① 今の圧力で押すとして、される仕事 $-p\\Delta V$。② 温度の上がり $\\Delta T=-p\\Delta V/(nC_V)$。③ 新しい圧力 $p=nRT/V$。20 段で最後は 457 K、ポアソンの式の答え $300\\times3^{0.4}\\approx466$ K に近い値です。段を増やすと近づきます（200 段で 465 K）。',
      miss: '少し低めに出るのは、1段の間、圧力を段のはじめの値（少し小さい）として計算したからです。式がまちがっているのではありません。',
      legend: [['ポアソンの式 $pV^{1.4}=$一定', { color: 'b' }], ['段ごとの計算', { color: 'd', shape: 'square' }], ['等温 $pV=$一定', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'N', label: '段の数', min: 2, max: 200, step: 1, d: 0, fmt: v => v + ' 段' }],
      draw(cv, st) { drawEuler(cv, st); },
      readout: st => { const e = euler(st.N); return `${st.N} 段：最後の温度 <b>${A.num(e.T, 1)} K</b>、圧力 ${A.num(e.p, 1)} kPa${SP}ポアソンの式：${A.num(300 * Math.pow(3, 0.4), 1)} K${SP}$pV^{1.4}$ の比 ${A.num(e.p * Math.pow(1 / 3, 1.4) / 100, 3)}`; }
    }
  ]
});

// ---------- 気体 ----------
function gasState(st) {
  const V = st.Vr, T = st.mode === 'adi' ? 300 * Math.pow(1 / V, G - 1) : 300;
  return { T, p: NMOL * R * T / V };
}
function resetGas(st) {
  const r = A.rng(21); st.mol = [];
  for (let i = 0; i < NM; i++) {
    const a = r() * 2 * Math.PI, s = 120 * Math.sqrt(-Math.log(1 - r() * 0.999)) ; // 2次元のマクスウェル分布（平均の2乗 ＝ 120²）
    st.mol.push({ x: BOX.x0 + 10 + r() * (BOX.wmax - 30), y: BOX.y0 + 10 + r() * (BOX.h - 20), vx: s * Math.cos(a), vy: s * Math.sin(a), hit: 0, fast: 0 });
  }
  st.hist = [[1, 100]];
}
function moveGas(st, Vn, dt) {
  if (!st.mol) resetGas(st);
  const X0 = BOX.x0 + BOX.wmax * st.Vr, X1 = BOX.x0 + BOX.wmax * Vn, u = (X1 - X0) / Math.max(dt, 1e-3); // ピストンの速さ（px/s）
  const sub = 4, h = dt / sub;
  for (let k = 0; k < sub; k++) {
    const Xp = X0 + (X1 - X0) * (k + 1) / sub;
    for (const m of st.mol) {
      m.x += m.vx * h; m.y += m.vy * h;
      if (m.x < BOX.x0 + 6) { m.x = 2 * (BOX.x0 + 6) - m.x; m.vx = Math.abs(m.vx); }
      if (m.y < BOX.y0 + 6) { m.y = 2 * (BOX.y0 + 6) - m.y; m.vy = Math.abs(m.vy); }
      if (m.y > BOX.y0 + BOX.h - 6) { m.y = 2 * (BOX.y0 + BOX.h - 6) - m.y; m.vy = -Math.abs(m.vy); }
      if (m.x > Xp - 6) { const before = Math.hypot(m.vx, m.vy); if (m.vx > u) { m.vx = 2 * u - m.vx; } m.x = Xp - 6 - 0.5; const after = Math.hypot(m.vx, m.vy); if (Math.abs(after - before) > 2) { m.hit = 0.6; m.fast = after > before ? 1 : -1; } }
    }
  }
  st.Vr = Vn;
  // 全体の速さを、空気の温度（または水そうの温度）に合わせる
  const T = gasState(st).T; let e = 0; for (const m of st.mol) e += m.vx * m.vx + m.vy * m.vy; e /= st.mol.length;
  const want = 120 * 120 * T / 300, f = Math.sqrt(want / Math.max(e, 1)); // 平均の2乗 ∝ T
  for (const m of st.mol) { m.vx *= f; m.vy *= f; m.hit = Math.max(0, m.hit - dt); }
  const s = gasState(st), last = st.hist[st.hist.length - 1];
  if (Math.abs(last[0] - st.Vr) > 0.004) st.hist.push([st.Vr, s.p]);
}
function drawGas(cv, st) {
  if (!st.mol) resetGas(st);
  const X = BOX.x0 + BOX.wmax * st.Vr, s = gasState(st);
  if (st.mode === 'iso') { cv.rect(BOX.x0 - 6, BOX.y0 + BOX.h, BOX.wmax + 30, 22, { fill: 'b', alpha: 0.18 }); cv.text('300 K の大きな水そう（熱が出入りする）', BOX.x0 + 170, BOX.y0 + BOX.h + 11, { align: 'center', size: 14, color: 'b' }); }
  else cv.text('まわりは断熱材（熱が出入りしない）', BOX.x0 + 170, BOX.y0 + BOX.h + 14, { align: 'center', size: 14, color: 'sub' });
  cv.rect(BOX.x0, BOX.y0, X - BOX.x0, BOX.h, { fill: 'b', alpha: 0.04 + 0.25 * A.clamp((s.T - 300) / 166, 0, 1) });
  cv.line([[BOX.x0 + BOX.wmax + 30, BOX.y0], [BOX.x0, BOX.y0], [BOX.x0, BOX.y0 + BOX.h], [BOX.x0 + BOX.wmax + 30, BOX.y0 + BOX.h]], { color: 'ink', width: st.mode === 'adi' ? 5 : 2.5 });
  cv.rect(X, BOX.y0 + 2, 14, BOX.h - 4, { fill: 'sub', alpha: 0.85 });
  cv.line([[X + 14, BOX.y0 + BOX.h / 2], [X + 70, BOX.y0 + BOX.h / 2]], { color: 'sub', width: 5 });
  for (const m of st.mol) {
    if (m.x > X) continue;
    const c = m.hit > 0 ? (m.fast > 0 ? 'b' : 'a') : 'sub';
    cv.dot(m.x, m.y, { color: c, r: m.hit > 0 ? 5.5 : 4, shape: m.hit > 0 && m.fast < 0 ? 'square' : 'circle' });
  }
  cv.text('ピストン', X + 7, BOX.y0 - 14, { align: 'center', size: 15 });
  // 温度計
  cv.text(`${Math.round(s.T)} K`, 400, BOX.y0 + 30, { size: 18, bold: true, color: s.T > 301 ? 'b' : 'ink' });
  // p-V 図
  const g = cv.view({ x0: 0, x1: 1.12, y0: 0, y1: 500, box: [470, 30, 390, 360] });
  g.axes({ xt: [1 / 3, 0.5, 1], yt: [100, 200, 300, 466], xl: 'V/V₁', yl: 'p（kPa）', xfmt: v => v < 0.4 ? '1/3' : v < 0.6 ? '1/2' : '1', yfmt: v => String(v) });
  g.plot(x => 100 / x, { x0: 0.3, x1: 1.08, color: 'a', width: 2.5, style: 'dash' });
  g.plot(x => 100 / Math.pow(x, 1.4), { x0: 0.3, x1: 1.08, color: 'b', width: 2.5 });
  g.text('断熱', 0.36, 490, { size: 15, color: 'b', bold: true });
  g.text('等温', 0.2, 330, { size: 15, color: 'a', bold: true });
  if (st.hist && st.hist.length > 1) g.line(st.hist, { color: 'd', width: 4, alpha: 0.5 });
  g.dot(st.Vr, s.p, { color: st.mode === 'adi' ? 'b' : 'a', r: 7 });
}
function euler(N) {
  let V = 1, T = 300, p = 100; const dV = -(2 / 3) / N, pts = [[1, 100, 300]];
  const Cv = 2.5 * R;
  for (let i = 0; i < N; i++) { T += -p * dV / (NMOL * Cv); V += dV; p = NMOL * R * T / V; pts.push([V, p, T]); }
  return { T, p, pts };
}
function drawEuler(cv, st) {
  const e = euler(st.N);
  const g = cv.view({ x0: 0, x1: 1.1, y0: 0, y1: 500, box: [70, 30, 380, 360] });
  g.axes({ xt: [1 / 3, 0.5, 1], yt: [100, 200, 300, 400], xl: 'V（L）', yl: 'p（kPa）', xfmt: v => v < 0.4 ? '0.333' : v < 0.6 ? '0.5' : '1' });
  g.plot(x => 100 / x, { x0: 0.3, x1: 1.08, color: 'a', width: 2, style: 'dash' });
  g.plot(x => 100 / Math.pow(x, 1.4), { x0: 0.3, x1: 1.08, color: 'b', width: 2.5 });
  g.line(e.pts.map(q => [q[0], q[1]]), { color: 'd', width: 2 });
  if (st.N <= 60) for (const q of e.pts) g.dot(q[0], q[1], { color: 'd', shape: 'square', r: 3.5 });
  const t = cv.view({ x0: 0.3, x1: 1.05, y0: 280, y1: 480, box: [520, 30, 340, 360] });
  t.axes({ xt: [1 / 3, 0.5, 1], yt: [300, 350, 400, 450, 466], xl: 'V（L）', yl: 'T（K）', ay: 0.3, ax: 280, xfmt: v => v < 0.4 ? '0.333' : v < 0.6 ? '0.5' : '1' });
  t.plot(x => 300 * Math.pow(1 / x, 0.4), { x0: 1 / 3, x1: 1, color: 'b', width: 2.5 });
  t.line(e.pts.map(q => [q[0], q[2]]), { color: 'd', width: 2 });
  if (st.N <= 60) for (const q of e.pts) t.dot(q[0], q[2], { color: 'd', shape: 'square', r: 3.5 });
  t.text(`${st.N} 段：${A.num(e.T, 1)} K`, 0.36, e.T - 14, { size: 15, color: 'd', bold: true });
  t.text('式：465.6 K', 0.36, 474, { size: 15, color: 'b' });
}
