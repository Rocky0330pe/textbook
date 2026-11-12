// @id p2-21
// @title 回転磁界とモーター
// @vol 物理4
// @from 物理 電-11 ⑨（p4-11:602・552）、電-12 ③⑦（p4-12:160・191・444・471）、電-6 ⑪（p4-06:799）
'use strict';
// 記号は本と同じ：三相の磁場 B₀cos(ωt−120°k)、和 (3/2)B₀、同期速度 n_s、すべり s＝(n_s−n)/n_s、トルク T＝NBSI cos θ
// 誘導モーターの数は例題9 と同じ：200 V・4極・50 Hz、R₂'＝0.1 Ω、X＝0.8 Ω、相電圧 115.47 V、ω_s＝157.08 rad/s
const D21 = Math.PI / 180;
const COL3 = [['a', 'solid', 'a'], ['b', 'dash', 'b'], ['c', 'dot', 'c']];
A.item({
  id: 'p2-21', title: '回転磁界とモーター',
  from: '物理 第4巻 電-11 ⑨「回転磁界」、電-12 ③「直流モーター」・⑦「誘導モーター」の図から',
  W: 880, H: 430,
  state: { wt: 0, each: true, load: 60, ang: 0, rot: 0, th: 10, om: 0, comm: true },
  scenes: [
    {
      key: 'kaiten', label: '① 回転磁界',
      lead: '向きを 120° ずつずらした3つのコイル a・b・c に三相交流を流します。それぞれの磁場は、向きが決まったまま大きさが脈打つだけです。',
      note: '3つの磁場（細い矢印）は、それぞれ $B_0\\cos(\\omega t-120°k)$ で脈打つだけですが、ベクトルとしてたすと（太い矢印）、大きさはいつも $\\frac{3}{2}B_0$ のまま、向きが $\\omega t$ と同じ角だけ回ります（回転磁界）。この中に磁石を置くと、いっしょに回ります。これが三相のモーターの原理です。',
      legend: [['コイル a の磁場', { color: 'a', width: 2 }], ['コイル b の磁場', { color: 'b', width: 2, style: 'dash' }], ['コイル c の磁場', { color: 'c', width: 2, style: 'dot' }], ['3つの和', { color: 'd', width: 5 }]],
      controls: [{ check: 'each', label: '細い矢印', text: '3つのコイルの磁場も見せる' }],
      autoplay: true,
      step(st, dt) { st.wt += dt * 0.9; if (st.wt > 1e4) st.wt = 0; },
      draw: drawRot,
      readout: st => { const [x, y] = sum3(st.wt); return `$\\omega t$ ＝ ${Math.round(((st.wt / D21) % 360 + 360) % 360)}°：和の大きさ ＝ <b>${A.num(Math.hypot(x, y), 2)}</b> $B_0$、向き ＝ <b>${Math.round(((Math.atan2(y, x) / D21) % 360 + 360) % 360)}°</b>`; }
    },
    {
      key: 'yudou', label: '② 誘導モーター',
      lead: '回転磁界の中のかご形の回転子は、磁場に引きずられて回ります。負荷（軸にかかるトルク）を変えてみましょう（画面では、とてもゆっくり回している）。',
      note: '回転子が磁場と同じ速さ（同期速度 $n_{\\mathrm s}$）で回ると、導体は磁場を横切らず、電流もトルクも 0 になります。だから誘導モーターは、いつも同期速度より少しおそく回ります（すべり $s=(n_{\\mathrm s}-n)/n_{\\mathrm s}$）。負荷が重くなると、少しだけ速さが落ち（すべりが増え）、その分トルクが増えて、つり合います。',
      miss: '4極・50 Hz の誘導モーターは、ちょうど毎分 1500 回転では回りません。少しおそく回ります（毎分 1440 回転など）。同期速度で回るのは同期モーターです。',
      legend: [['回転磁界の向き', { color: 'd', width: 5 }], ['回転子の印', { color: 'b', width: 4 }], ['トルクと回転数の線', { color: 'a', width: 3 }], ['負荷のトルク', { color: 'c', style: 'dash' }]],
      controls: [{ range: 'load', label: '負荷のトルク〔N·m〕', min: 5, max: 150, step: 1, d: 0 }],
      autoplay: true,
      step(st, dt) { const s = slip(st.load); st.ang += dt * 2 * Math.PI / 4; st.rot += dt * 2 * Math.PI / 4 * (1 - s); if (st.ang > 1e4) { st.ang -= 1e4; st.rot -= 1e4; } },
      draw: drawInd,
      readout: st => { const s = slip(st.load); return `すべり $s$ ＝ <b>${A.num(s * 100, 2)} %</b>、回転数 $n=1500(1-s)$ ＝ <b>${A.num(1500 * (1 - s), 0)} min⁻¹</b>（同期速度 1500 min⁻¹）、回転子の電流の周波数 $sf$ ＝ ${A.num(s * 50, 2)} Hz`; }
    },
    {
      key: 'seiryushi', label: '③ 直流モーターと整流子',
      lead: '磁石のあいだのコイルに直流を流します。整流子があるときと、ないときをくらべましょう。',
      note: 'トルクは $T=NBSI\\cos\\theta$（$\\theta$ はコイルの面が磁場となす角）。電流の向きがそのままだと、半回転ごとに逆向きのトルクになり、コイルはもどされて、面が磁場に直角な所で止まってしまいます。**整流子**とブラシで半回転ごとに電流を逆にすると、トルクはいつも同じ向きになり、回り続けます。',
      legend: [['コイル（⊙ 手前へ・⊗ 奥へ流れる電流）', { color: 'ink', width: 5 }], ['辺が受ける力', { color: 'd', width: 3 }], ['トルク（いまの電流で）', { color: 'a', width: 3 }], ['トルク（電流がそのまま）', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'comm', label: '整流子', options: [[true, 'あり'], [false, 'なし（電流がそのまま）']], on: st => { st.th = 10; st.om = 0; } }],
      autoplay: true,
      step(st, dt) { for (let k = 0; k < 10; k++) { const h = dt / 10, T = torq(st); st.om += (6 * T - 0.9 * st.om) * h; st.th += st.om * h / D21; } },
      draw: drawDC,
      readout: st => { const c = Math.cos(st.th * D21), I = st.comm ? Math.sign(c || 1) : 1; return `コイルの面と磁場の角 $\\theta$ ＝ ${Math.round(((st.th % 360) + 360) % 360)}°、電流の向き：${I > 0 ? '正' : '<b>逆（整流子で入れかわった）</b>'}、トルク $NBSI\\cos\\theta$ ＝ ${A.num(I * c, 2)}（山を1）`; }
    }
  ]
});

function sum3(wt) { let x = 0, y = 0; for (let k = 0; k < 3; k++) { const a = k * 120 * D21, m = Math.cos(wt - a); x += m * Math.cos(a); y += m * Math.sin(a); } return [x, y]; }
function drawRot(cv, st) {
  const cx = 230, cy = 215, R = 170, s = 95, wt = st.wt;
  cv.circle(cx, cy, R, { color: 'sub', width: 1.5 });
  for (let k = 0; k < 3; k++) {
    const a = k * 120 * D21, [col] = COL3[k], px = cx + R * Math.cos(a), py = cy - R * Math.sin(a);
    // コイル（小さな四角）と名前
    cv.g.save(); cv.g.translate(px, py); cv.g.rotate(-a); cv.rect(-12, -26, 24, 52, { fill: col, alpha: 0.35, color: col, width: 2 }); cv.g.restore();
    cv.text(COL3[k][2], cx + (R + 28) * Math.cos(a), cy - (R + 28) * Math.sin(a), { size: 18, bold: true, align: 'center', color: col });
    cv.line([[cx, cy], [cx + (R - 20) * Math.cos(a), cy - (R - 20) * Math.sin(a)]], { color: 'grid', width: 1 });
    if (st.each) { const m = Math.cos(wt - a); if (Math.abs(m) > 0.02) cv.arrow(cx, cy, cx + s * m * Math.cos(a), cy - s * m * Math.sin(a), { color: col, width: 3, style: COL3[k][1], head: 12 }); }
  }
  const [x, y] = sum3(wt);
  cv.arrow(cx, cy, cx + s * x, cy - s * y, { color: 'd', width: 6, head: 20 });
  cv.circle(cx, cy, s * 1.5, { color: 'd', width: 1, style: 'dot' });
  cv.dot(cx, cy, { color: 'ink', r: 4 });
  // 右：3つの電流（磁場の大きさ）
  const t1 = wt, g = cv.view({ x0: t1 - 2 * Math.PI, x1: t1, y0: -1.3, y1: 1.3, box: [480, 50, 380, 320] });
  g.axes({ yt: [-1, 1], grid: true, ay: t1 - 2 * Math.PI, xt: [], yfmt: v => A.num(v, 0) });
  for (let k = 0; k < 3; k++) { g.plot(t => Math.cos(t - k * 120 * D21), { color: COL3[k][0], width: 2.5, style: COL3[k][1] }); g.dot(t1, Math.cos(t1 - k * 120 * D21), { color: COL3[k][0], r: 6, shape: ['circle', 'square', 'tri'][k] }); }
  cv.text('3つのコイルの電流（磁場の大きさ、山を1）', 486, 30, { size: 15, color: 'sub' });
  cv.text('ωt →（右がいま）', 860, 400, { size: 14, color: 'sub', align: 'right' });
}

// 誘導モーター：T(s)＝3 I₂² (R/s) / ω_s、I₂＝Vp/√((R/s)²＋X²)
function Tq(s) { const r = 0.1 / s, I = 115.47 / Math.sqrt(r * r + 0.64); return 3 * I * I * r / 157.08; }
function slip(load) { let a = 1e-6, b = 0.125; for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (Tq(m) < load) a = m; else b = m; } return (a + b) / 2; }
function drawInd(cv, st) {
  const cx = 200, cy = 215, s = slip(st.load);
  // 固定子と回転磁界
  cv.circle(cx, cy, 175, { color: 'sub', width: 10, alpha: 0.35 });
  cv.circle(cx, cy, 120, { fill: 'panel', alpha: 1, color: 'sub', width: 2 });
  for (let k = 0; k < 16; k++) { const a = st.rot + k * 2 * Math.PI / 16; cv.dot(cx + 100 * Math.cos(a), cy - 100 * Math.sin(a), { color: 'e', r: 7 }); }
  const fa = st.ang;
  cv.arrow(cx - 150 * Math.cos(fa), cy + 150 * Math.sin(fa), cx + 150 * Math.cos(fa), cy - 150 * Math.sin(fa), { color: 'd', width: 5, head: 20, alpha: 0.8 });
  const ra = st.rot;
  cv.line([[cx, cy], [cx + 100 * Math.cos(ra), cy - 100 * Math.sin(ra)]], { color: 'b', width: 5 });
  cv.dot(cx + 100 * Math.cos(ra), cy - 100 * Math.sin(ra), { color: 'b', r: 10 });
  cv.text('回転子（かご形）', cx, cy + 140, { size: 14, align: 'center', color: 'sub' });
  // 右：トルクと回転数の線
  const g = cv.view({ x0: 0, x1: 1560, y0: 0, y1: 185, box: [450, 40, 400, 320] });
  g.axes({ xt: [0, 300, 600, 900, 1200, 1500], yt: [40, 80, 120, 160], zero: true });
  cv.text('回転数 n（min⁻¹）', 850, 400, { size: 14, color: 'sub', align: 'right' });
  cv.text('トルク T（N·m）', 456, 26, { size: 14, color: 'sub' });
  g.plot(n => { const ss = 1 - n / 1500; return ss <= 0 ? NaN : Tq(ss); }, { color: 'a', width: 3, x1: 1499.9, n: 800 });
  g.line([[1500, 0], [1500, 185]], { color: 'sub', style: 'dash', width: 1.5 });
  g.text('同期速度', 1490, 175, { size: 14, color: 'sub', align: 'right' });
  g.line([[0, st.load], [1560, st.load]], { color: 'c', style: 'dash', width: 2 });
  const n = 1500 * (1 - s);
  g.dot(n, st.load, { color: 'b', r: 7, shape: 'diamond' });
  g.text(`n = ${A.num(n, 0)}`, n - 20, st.load + 12, { size: 15, color: 'b', align: 'right', bg: true });
}

// 直流モーター
function torq(st) { const c = Math.cos(st.th * D21); return st.comm ? Math.abs(c) : c; }
function drawDC(cv, st) {
  const cx = 220, cy = 200, R = 110, th = st.th * D21;
  // 磁石
  cv.rect(cx - 210, cy - 80, 50, 160, { fill: 'b', alpha: 0.7, color: 'ink', width: 1.5 }); cv.text('N', cx - 185, cy, { size: 22, bold: true, align: 'center', color: 'bg' });
  cv.rect(cx + 160, cy - 80, 50, 160, { fill: 'a', alpha: 0.7, color: 'ink', width: 1.5 }); cv.text('S', cx + 185, cy, { size: 22, bold: true, align: 'center', color: 'bg' });
  for (let y = -60; y <= 60; y += 30) cv.arrow(cx - 155, cy + y, cx + 155, cy + y, { color: 'sub', width: 1, head: 8, alpha: 0.5 });
  // コイル（軸の向きから見る）：θ はコイルの面と磁場（横）の角
  const ex = Math.cos(th), ey = Math.sin(th), A1 = [cx + R * ex, cy - R * ey], A2 = [cx - R * ex, cy + R * ey];
  cv.line([A1, A2], { color: 'ink', width: 5 });
  const c = Math.cos(th), I = st.comm ? Math.sign(c || 1) : 1;
  // 辺1（A1）：I＞0 で ⊙（手前へ）、辺2：⊗
  const sym = (p, out) => { cv.circle(p[0], p[1], 13, { fill: 'bg', alpha: 1, color: 'ink', width: 2 }); if (out) cv.dot(p[0], p[1], { color: 'ink', r: 4 }); else { cv.line([[p[0] - 8, p[1] - 8], [p[0] + 8, p[1] + 8]], { color: 'ink', width: 2 }); cv.line([[p[0] + 8, p[1] - 8], [p[0] - 8, p[1] + 8]], { color: 'ink', width: 2 }); } };
  sym(A1, I > 0); sym(A2, I < 0);
  // 力：B は右（+x）。手前へ（+z）の電流：F ∝ z×x＝＋y（上）
  const f = 60;
  cv.arrow(A1[0], A1[1] - 16 * I, A1[0], A1[1] - (f + 16) * I, { color: 'd', width: 3.5 });
  cv.arrow(A2[0], A2[1] + 16 * I, A2[0], A2[1] + (f + 16) * I, { color: 'd', width: 3.5 });
  // 整流子とブラシ（小さく下に）
  const kx = cx, ky = cy + 165;
  if (st.comm) {
    for (let h = 0; h < 2; h++) { const a0 = th + Math.PI / 2 + h * Math.PI + 0.15, a1 = a0 + Math.PI - 0.3; const pts = []; for (let k = 0; k <= 20; k++) { const a = a0 + (a1 - a0) * k / 20; pts.push([kx + 22 * Math.cos(a), ky - 22 * Math.sin(a)]); } cv.line(pts, { color: h ? 'e' : 'c', width: 7 }); }
    cv.rect(kx - 48, ky - 6, 22, 12, { fill: 'sub', alpha: 1 }); cv.rect(kx + 26, ky - 6, 22, 12, { fill: 'sub', alpha: 1 });
    cv.text('整流子とブラシ', kx + 60, ky, { size: 14, color: 'sub' });
  } else cv.text('整流子なし：電流の向きはいつも同じ', kx, ky, { size: 14, color: 'sub', align: 'center' });
  // 右：トルクのグラフ
  const g = cv.view({ x0: 0, x1: 370, y0: -1.25, y1: 1.35, box: [500, 40, 350, 330] });
  g.axes({ xt: [0, 90, 180, 270, 360], yt: [-1, 1], xfmt: v => v + '°' });
  cv.text('θ（コイルの面と磁場の角）', 850, 405, { size: 14, color: 'sub', align: 'right' });
  cv.text('トルク（山を1）', 506, 26, { size: 14, color: 'sub' });
  g.plot(x => Math.cos(x * D21), { color: 'b', style: 'dash', width: 2 });
  if (st.comm) g.plot(x => Math.abs(Math.cos(x * D21)), { color: 'a', width: 3, n: 400 });
  const tt = ((st.th % 360) + 360) % 360;
  g.dot(tt, torq(st), { color: 'a', r: 7, shape: 'diamond' });
}
