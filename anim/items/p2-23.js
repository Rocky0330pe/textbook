// @id p2-23
// @title 電荷をゆらすと電磁波が出る
// @vol 物理4
// @uses 3d
// @from 物理 電-15 ⑧（p4-15:377・414）、波-13 ⑧（p3-13:1116）、波-14 ⑤（p3-14:284）
'use strict';
// 記号は本と同じ：E⊥＝qa sinθ/(4πε₀c²r)、強さ ∝ sin²θ（ゆれの向き θ＝0 には出さない）、ラーモアの式 P＝q²a²/(6πε₀c³)
// かき方：向き u の電気力線の、半径 r の点は「r/c だけ前の時刻の電荷の位置」＋ r u（速さが c よりずっと小さいときの考え）
const C23 = 200;            // 画面の上の光の速さ（px/秒）
const NL = 24;              // 電気力線の本数
A.item({
  id: 'p2-23', title: '電荷をゆらすと電磁波が出る',
  from: '物理 第4巻 電-15 ⑧「加速した電荷の電気力線」、第3巻 波-13 ⑧「散乱のモデル」・波-14 ⑤「アンテナ」の図から',
  W: 880, H: 440,
  state: { t: 0, hist: [], x: 330, y: 220, tx: 330, ty: 220, prog: null, fq: 0.5, yaw: -30, pitch: 15 },
  scenes: [
    {
      key: 'ore', label: '① 折れ曲がる電気力線',
      lead: '止まっていた電荷を、急に動かして、また止めます（▶ のあと「動かす」）。電荷はドラッグでも動かせます。電気力線の折れ目が、光の速さで広がっていきます。',
      note: '外の線は、動く前の位置から、内の線はいまの位置から出ていて、その間の殻で折れ曲がります。殻の中では、進む向きに直角な電場 $E_\\perp$ が強くなっています。これが電磁波です。$E_\\perp$ は $1/r$ でしか弱くならないので、遠くまで届きます。速さが一定の間は、折れ目はできません（加速した時だけ）。',
      legend: [['電気力線', { color: 'a', width: 2 }], ['折れ目の殻（光の速さで広がる）', { color: 'b', style: 'dash' }], ['電荷', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ button: '右へ動かして止める', act(st) { st.prog = { t0: st.t, x0: st.x, y0: st.y }; } }],
      autoplay: true,
      init: initH,
      step(st, dt) { return stepH(st, dt, 'free'); },
      draw(cv, st) { drawLines(cv, st, 1); },
      drag: { hit(st, x, y) { return A.near(x, y, st.x, st.y, 40) ? 'q' : null; }, move(st, x, y) { st.prog = null; st.tx = A.clamp(x, 60, 820); st.ty = A.clamp(y, 40, 400); } },
      readout: st => '折れ目は、1秒に 200 px（画面の上の光の速さ）で広がる。電荷の速さは、光の速さよりずっと小さくしてある'
    },
    {
      key: 'yure', label: '② ゆらし続ける',
      lead: '電荷を上下に単振動させ続けます。折れ目が次々に出て、電磁波になって広がります。',
      note: '横の電場は $E_\\perp\\propto\\sin\\theta$（$\\theta$ はゆれの向きからの角）なので、強さは $\\sin^2\\theta$ に比例します。**ゆれの向き（真上・真下）には出さず**、ゆれに直角な向きにいちばん強く出します（右の8の字）。単振動の加速度の山は $\\omega^2x_0$ なので、出す光の仕事率は $\\omega^4$ に比例します。青い光が赤い光よりよく散らされ、空が青く見えるのはこのためです。',
      legend: [['電気力線', { color: 'a', width: 2 }], ['強さ $\\propto\\sin^2\\theta$（8の字）', { color: 'd', width: 3 }]],
      controls: [{ range: 'fq', label: 'ゆらす振動数〔Hz（画面）〕', min: 0.3, max: 0.8, step: 0.05, d: 2, on: initH }],
      autoplay: true,
      init: initH,
      step(st, dt) { return stepH(st, dt, 'osc'); },
      draw(cv, st) { drawLines(cv, st, 2); },
      readout: st => { const A0 = amp(st), w = 2 * Math.PI * st.fq; return `振幅 ${A.num(A0, 0)} px、速さの山 ${A.num(A0 * w / C23, 2)} c、波長 ＝ c ÷ 振動数 ＝ <b>${A.num(C23 / st.fq, 0)} px</b>`; }
    },
    {
      key: 'donut', label: '③ ドーナツ形（3次元）',
      lead: '上下にゆれる電荷（アンテナ）が出す電磁波の強さを、向きごとに長さで表すと、ドーナツの形になります。図はドラッグで回せます。',
      note: '強さは $\\sin^2\\theta$ で、ゆれに直角な面（水平な面）のどの向きにも同じだけ強く出し、ゆれの向き（アンテナの軸の向き）には出しません。放送局のアンテナが、地面にそってまわり全体へ電波を送れるのはこのためです。半波長のアンテナでは、電流がまん中で大きく、はしで 0 の定在波になります。',
      legend: [['アンテナ（電荷が上下にゆれる）', { color: 'b', width: 4 }], ['向きごとの強さ $\\propto\\sin^2\\theta$', { color: 'd', width: 2 }], ['ゆれの向き（強さ 0）', { color: 'sub', style: 'dot' }]],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 1e4) st.t = 0; },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawDonut,
      readout: st => '真横（θ＝90°）：強さ 1　ななめ 45°：0.5　真上（θ＝0°）：0'
    }
  ]
});

function amp(st) { return Math.min(40, 0.6 * C23 / (2 * Math.PI * st.fq)); }
function initH(st) { st.t = 0; st.x = 330; st.y = 220; st.tx = 330; st.ty = 220; st.hist = [[0, 330, 220]]; st.prog = null; }
function stepH(st, dt, mode) {
  st.t += dt;
  if (mode === 'osc') { st.x = 330; st.y = 220 - amp(st) * Math.sin(2 * Math.PI * st.fq * st.t); }
  else if (st.prog) {
    // 0.2 秒で 0.35c まで速くし、そのまま進み、0.2 秒で止まる（右へ約 105 px）
    const u = st.t - st.prog.t0, a = 0.35 * C23 / 0.2, v = 0.35 * C23, T1 = 0.2, T2 = 1.4, T3 = 1.6;
    const d = u < T1 ? 0.5 * a * u * u : u < T2 ? 0.5 * a * T1 * T1 + v * (u - T1) : u < T3 ? 0.5 * a * T1 * T1 + v * (T2 - T1) + v * (u - T2) - 0.5 * a * (u - T2) ** 2 : 0.5 * a * T1 * T1 + v * (T2 - T1) + v * (T3 - T2) - 0.5 * a * (T3 - T2) ** 2;
    st.x = st.prog.x0 + d; st.y = st.prog.y0; st.tx = st.x; st.ty = st.y;
    if (st.x > 760) { st.prog = null; }
  } else {
    // ドラッグ：目あてへ、光の速さの半分までの速さで近づく
    const dx = st.tx - st.x, dy = st.ty - st.y, L = Math.hypot(dx, dy), m = 0.5 * C23 * dt;
    if (L > m) { st.x += dx / L * m; st.y += dy / L * m; } else { st.x = st.tx; st.y = st.ty; }
  }
  st.hist.push([st.t, st.x, st.y]);
  while (st.hist.length > 2 && st.hist[1][0] < st.t - 3.2) st.hist.shift();
}
function posAt(st, tau) {
  const h = st.hist; if (!h.length) return [st.x, st.y];
  if (tau <= h[0][0]) return [h[0][1], h[0][2]];
  if (tau >= h[h.length - 1][0]) return [h[h.length - 1][1], h[h.length - 1][2]];
  let a = 0, b = h.length - 1; while (b - a > 1) { const m = (a + b) >> 1; if (h[m][0] <= tau) a = m; else b = m; }
  const u = (tau - h[a][0]) / Math.max(1e-9, h[b][0] - h[a][0]); return [h[a][1] + (h[b][1] - h[a][1]) * u, h[a][2] + (h[b][2] - h[a][2]) * u];
}
function drawLines(cv, st, k) {
  const R = 620;
  cv.g.save(); cv.g.beginPath(); cv.g.rect(0, 0, k === 2 ? 640 : 880, 440); cv.g.clip();
  for (let i = 0; i < NL; i++) {
    const a = (i + 0.5) * 2 * Math.PI / NL, ux = Math.cos(a), uy = Math.sin(a), pts = [];
    for (let r = 14; r <= R; r += 4) { const p = posAt(st, st.t - r / C23); pts.push([p[0] + r * ux, p[1] + r * uy]); }
    cv.line(pts, { color: 'a', width: 1.8 });
  }
  // 折れ目の殻（① のときだけ、加速した時刻から）
  if (k === 1 && st.prog) { for (const tk of [0.1, 1.5]) { const r = (st.t - st.prog.t0 - tk) * C23; if (r > 0 && r < R) { const p = posAt(st, st.prog.t0 + tk); cv.circle(p[0], p[1], r, { color: 'b', width: 1.5, style: 'dash', alpha: 0.8 }); } } }
  cv.g.restore();
  cv.circle(st.x, st.y, 13, { fill: 'b', alpha: 1, color: 'ink', width: 1.5 });
  cv.text('+', st.x, st.y + 1, { size: 18, bold: true, align: 'center', color: 'bg' });
  if (k === 2) {
    // 右：8の字（強さ ∝ sin²θ、θ はたて軸から）
    const cx = 760, cy = 220, S = 100;
    cv.rect(640, 0, 240, 440, { fill: 'bg', alpha: 1 });
    cv.line([[cx, cy - 120], [cx, cy + 120]], { color: 'sub', width: 1.5, style: 'dot' });
    const pts = []; for (let j = 0; j <= 240; j++) { const th = j / 240 * 2 * Math.PI, r = S * Math.sin(th) ** 2; pts.push([cx + r * Math.sin(th), cy - r * Math.cos(th)]); }
    cv.line(pts, { color: 'd', width: 3 });
    cv.line([[cx, cy - 8], [cx, cy + 8]], { color: 'b', width: 5 });
    cv.text('向きごとの強さ', cx, 40, { size: 15, align: 'center', bold: true });
    cv.text('ゆれの向き：0', cx, cy - 135, { size: 14, align: 'center', color: 'sub' });
    cv.text('真横：いちばん強い', cx, cy + 150, { size: 14, align: 'center', color: 'd' });
  }
}

function drawDonut(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 230, center: [0, 0, 0] });
  const nT = 14, nP = 24, P = (th, ph) => { const r = Math.sin(th) ** 2; return [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)]; };
  for (let i = 0; i < nT; i++) for (let j = 0; j < nP; j++) {
    const t0 = Math.PI * i / nT, t1 = Math.PI * (i + 1) / nT, p0 = 2 * Math.PI * j / nP, p1 = 2 * Math.PI * (j + 1) / nP;
    V.poly3([P(t0, p0), P(t1, p0), P(t1, p1), P(t0, p1)], { fill: 'd', alpha: 0.13, color: 'd', width: 0.6 });
  }
  V.line3([[0, 0, -0.85], [0, 0, 0.85]], { color: 'sub', width: 1.5, style: 'dot', zbias: 50 });
  V.line3([[0, 0, -0.45], [0, 0, 0.45]], { color: 'b', width: 5, zbias: 60 });
  const z = 0.35 * Math.sin(2 * Math.PI * 0.8 * st.t);
  V.dot3([0, 0, z], { color: 'b', r: 8, zbias: 70 });
  for (const thd of [90, 45, 20]) { const th = thd * Math.PI / 180, r = Math.sin(th) ** 2; V.arrow3([0, 0, 0], [r * Math.sin(th) * 1.0, 0, r * Math.cos(th)], { color: 'd', width: 3, head: 12, zbias: 40 }); V.text3(A.num(r, 2), [r * Math.sin(th) + 0.08, 0, r * Math.cos(th) + 0.05], { size: 15, color: 'd', bg: true }); }
  V.text3('ゆれの向き', [0.05, 0, 0.88], { size: 15, color: 'sub' });
  V.flush();
}
