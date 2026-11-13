// @id p2-12
// @title ドップラー効果：波面を数える
// @vol 物理3
// @from 物理 波-8 ⑤⑥（p3-08 動く音源の波面・救急車・斜めのドップラー・衝撃波）／原-11・波-10 でも使う
'use strict';
// 本の数：サイレン 960 Hz、音の速さ 340 m/s、救急車 時速 60 km（16.7 m/s）。
//   近づくとき 340/(340−16.7)×960 ≈ 1010 Hz、遠ざかるとき ≈ 915 Hz、人が 16.7 m/s で近づくと ≈ 1007 Hz。
//   道から 10 m・20 m 離れて聞く（本の図）。衝撃波 sin α = c/v_s = 1/Ma。
// 波面の絵は、音の速さを 1 秒に 150 px、波面を 0.35 秒ごとに出す、として動かす（目で追える速さにするため）。
const F = 960, CS = 340, CP = 150, TAU = 0.35, SX0 = 90;
A.item({
  id: 'p2-12', title: 'ドップラー効果：波面を数える',
  from: '物理 第3巻 波-8 ⑤⑥ の図「動く音源の波面」「道から離れて聞く救急車の音」「マッハ円すい」から（原-11・波-10 でも使う）',
  W: 880, H: 420,
  state: { t: 0, vs: 0.35, lx: 700, ly: 210, ma: 2, d: 10, v: 16.7 },
  scenes: [
    {
      key: 'hamen', label: '① 波面がつまる',
      lead: '音源（●）が右へ動きながら、決まった間かくで波面を出します。聞く人（■、ドラッグで動かせる）の所へ届く波面の間かくを見ましょう。',
      note: 'どの円も、それを出したときの音源の位置が中心です。前では波面がつまって波長が $(c-v_{\\mathrm s})/f$ に、後ろではのびて $(c+v_{\\mathrm s})/f$ になります。聞こえる振動数は「1秒に耳に届く波面の数」なので、前では高く、後ろでは低く聞こえます。',
      miss: '「近づくと高く聞こえるのは、音が大きくなるから」ではありません。高さは1秒に届く波面の数で決まります。大きさとは別です（③で確かめよう）。',
      legend: [['波面', { color: 'a' }], ['音源', { color: 'b', shape: 'circle', noline: true }], ['聞く人', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 'vs', label: '音源の速さ $v_{\\mathrm s}/c$', min: 0, max: 0.95, step: 0.05, d: 2, on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > Math.min(7, 740 / (st.vs * CP + 1e-9))) st.t = 0; },
      drag: { hit: (st, x, y) => A.near(x, y, st.lx, st.ly, 30) ? 1 : null, move: (st, x, y) => { st.lx = A.clamp(x, 20, 860); st.ly = A.clamp(y, 20, 400); } },
      draw(cv, st) { hamen(cv, st, st.vs, false); },
      readout: st => { const f2 = heard(st, st.vs); return `$v_{\\mathrm s}$ ＝ ${A.num(st.vs * CS, 0)} m/s　　前の波長 ${A.num((CS - st.vs * CS) / F, 3)} m・後ろの波長 ${A.num((CS + st.vs * CS) / F, 3)} m　　聞く人に聞こえる高さ ≈ <b>${f2 == null ? 'まだ届かない' : A.num(f2, 0) + ' Hz'}</b>（960 Hz の音）`; }
    },
    {
      key: 'shougeki', label: '② 音より速く',
      lead: '音源が音より速く動くと（$v_{\\mathrm s}>c$）、自分が出した波面を追いこします。マッハ数 $\\mathrm{Ma}=v_{\\mathrm s}/c$ を変えましょう。',
      note: '前には波面ができず、たくさんの波面が円すいの形の1枚の面に重なります。これが衝撃波です。$\\sin\\alpha=c/v_{\\mathrm s}=1/\\mathrm{Ma}$ で、速いほど円すいはとがります（Ma＝2 で α＝30°）。',
      legend: [['波面', { color: 'a' }], ['衝撃波（マッハ円すい）', { color: 'b', style: 'dash' }], ['音源', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'ma', label: 'マッハ数 $\\mathrm{Ma}$', min: 1, max: 3, step: 0.05, d: 2, on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 640 / (st.ma * CP)) st.t = 0; },
      draw(cv, st) { hamen(cv, st, st.ma, true); },
      readout: st => `$\\sin\\alpha=1/\\mathrm{Ma}$ ＝ ${A.num(1 / st.ma, 3)}　　円すいの半分の角 $\\alpha$ ＝ <b>${A.num(Math.asin(1 / st.ma) * 180 / Math.PI, 1)}°</b>`
    },
    {
      key: 'kyukyusha', label: '③ 救急車が通りすぎる',
      lead: '時速 60 km の救急車（960 Hz）が、道から離れて立つ人の前を通りすぎます。聞こえる高さと、音の大きさを比べましょう。',
      note: '効くのは、速さの「聞く人へ向かう向きの成分」$v_{\\mathrm s}\\cos\\theta$ だけで、$f\'=\\dfrac{c}{c-v_{\\mathrm s}\\cos\\theta}f$ です。真横では $\\cos\\theta=0$ で 960 Hz。近いほど、高さが急に下がります。音がいちばん大きいのは真横を通る時刻のすぐあとで、そのとき高さは 960 Hz の前後です。',
      miss: '「近づくと高く聞こえるのは、音が大きくなるから」ではありません。真横を通る瞬間、音はいちばん大きいのに、高さは 960 Hz のままです。',
      legend: [['聞こえる高さ（いまの離れ）', { color: 'a' }], ['もう一方の離れ', { color: 'sub', style: 'dash' }], ['音の大きさ（いちばん大きいときを 0 dB）', { color: 'c', style: 'dot' }]],
      controls: [{ seg: 'd', label: '道からの離れ', options: [[10, '10 m'], [20, '20 m']] }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 12.5) st.t = 0; },
      draw(cv, st) { kyukyu(cv, st); },
      readout: st => { const r = amb(st.d, st.t - 6); return `聞いた時刻 ${A.num(st.t - 6, 1)} s　　聞こえる高さ <b>${A.num(r.f, 0)} Hz</b>　　救急車までの距離 ${A.num(r.r, 1)} m（音を出したとき）　　近づくとき約 1010 Hz、遠ざかるとき約 915 Hz`; }
    },
    {
      key: 'dochira', label: '④ どちらが動く？',
      lead: '上は音源が近づく場合、下は聞く人が近づく場合です。近づく速さを同じにして、聞こえる高さを比べましょう。',
      note: '音源が動くと、波面の間かく（波長）が縮みます：$f\'=\\dfrac{c}{c-v}f$。聞く人が動くと、波長はそのままで、波面を横切る速さが $c+v$ になります：$f\'=\\dfrac{c+v}{c}f$。音は空気に対して速さ $c$ で進むので、空気に対してどちらが動くかで少し違います。速さが音よりずっと小さければ、ほぼ同じです。',
      miss: '「近づく速さが同じなら、どちらが動いても高さは同じ」は、少しだけ違います。16.7 m/s では、救急車が近づくと約 1010 Hz、人が近づくと約 1007 Hz です。',
      legend: [['波面', { color: 'a' }], ['音源', { color: 'b', shape: 'circle', noline: true }], ['聞く人', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 'v', label: '近づく速さ $v$〔m/s〕', min: 0, max: 170, step: 0.1, d: 1, on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 6) st.t = 0; },
      draw(cv, st) { dochira(cv, st); },
      readout: st => `音源が動く：$\\frac{c}{c-v}f$ ＝ <b>${A.num(CS / (CS - st.v) * F, 0)} Hz</b>　　聞く人が動く：$\\frac{c+v}{c}f$ ＝ <b>${A.num((CS + st.v) / CS * F, 0)} Hz</b>　　（$c$ ＝ 340 m/s、$f$ ＝ 960 Hz）`
    }
  ]
});

// 波面：音源の位置 sx(te)（時刻 te に出した）、いまの時刻 t。中心と半径の組を返す
function fronts(t, sx, sy) {
  const out = [];
  for (let k = 0; k * TAU <= t; k++) { const te = k * TAU, r = CP * (t - te); if (r > 0 && r < 1100) out.push([sx(te), sy, r]); }
  return out;
}

// 聞く人の位置に、いま届いている音を出した時刻を探し、斜めの式で高さを出す
function heard(st, ratio) {
  const v = ratio * CP, sx = te => SX0 + v * te, t = st.t;
  let lo = 0, hi = t, ok = false;
  const g = te => Math.hypot(st.lx - sx(te), st.ly - 210) - CP * (t - te);
  if (g(0) > 0) return null;
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (g(m) > 0) hi = m; else { lo = m; ok = true; } }
  const te = lo, dx = st.lx - sx(te), dy = st.ly - 210, r = Math.hypot(dx, dy) || 1, cos = dx / r;
  void ok; return F / (1 - ratio * cos);
}
function hamen(cv, st, ratio, cone) {
  const v = ratio * CP, sx = te => SX0 + v * te, y0 = 210;
  cv.line([[0, y0], [880, y0]], { color: 'grid', width: 1 });
  for (const [x, y, r] of fronts(st.t, sx, y0)) cv.circle(x, y, r, { color: 'a', width: 1.6 });
  const xs = sx(st.t);
  if (cone && ratio > 1) {
    const a = Math.asin(1 / ratio), L = 900;
    for (const s of [1, -1]) cv.line([[xs, y0], [xs - L * Math.cos(a), y0 - s * L * Math.sin(a)]], { color: 'b', style: 'dash', width: 3 });
    cv.text('α ＝ ' + A.num(a * 180 / Math.PI, 1) + '°', xs - 80, y0 - 22, { size: 16, bold: true, bg: true, align: 'right' });
    cv.circle(xs, y0, 70, { color: 'ink', width: 1.5, a0: Math.PI, a1: Math.PI + a, ccw: false });
  }
  cv.dot(xs, y0, { color: 'b', r: 9 });
  cv.arrow(xs + 14, y0 + 22, xs + 14 + 60 * Math.min(ratio, 1.5), y0 + 22, { color: 'b', width: 2.5 });
  cv.text('vs', xs + 18, y0 + 40, { size: 15, color: 'b', italic: true, math: true });
  if (!cone) {
    cv.rect(st.lx - 10, st.ly - 10, 20, 20, { fill: 'c', alpha: 1 });
    cv.text('聞く人', st.lx, st.ly + 24, { align: 'center', size: 14, color: 'c' });
    cv.text('前：つまる（高い）', 860, 30, { align: 'right', size: 15 });
    cv.text('後ろ：のびる（低い）', 20, 30, { size: 15 });
  }
}

// ③ 救急車：道（x 軸）を 16.7 m/s、聞く人は (0, d)。音を出した時刻 te、聞いた時刻 th = te + r/c
function amb(d, th) {
  const v = 60 / 3.6; let lo = -60, hi = th;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; const r = Math.hypot(v * m, d); if (m + r / CS > th) hi = m; else lo = m; }
  const te = lo, x = v * te, r = Math.hypot(x, d), cos = -x / r;
  return { f: F * CS / (CS - v * cos), r, x, te };
}
function kyukyu(cv, st) {
  const th = st.t - 6, d = st.d, other = d === 10 ? 20 : 10;
  // 上：道と人
  const m = cv.view({ x0: -110, x1: 110, y0: -8, y1: 26, box: [40, 10, 800, 110] });
  m.line([[-110, 0], [110, 0]], { color: 'sub', width: 8, alpha: 0.4 });
  const vnow = 60 / 3.6 * th;
  m.cv.rect(m.X(vnow) - 14, m.Y(0) - 8, 28, 16, { fill: 'b', alpha: 0.85 });
  m.cv.arrow(m.X(vnow) + 18, m.Y(0), m.X(vnow) + 40, m.Y(0), { color: 'b', width: 2 });
  m.cv.rect(m.X(0) - 7, m.Y(d) - 7, 14, 14, { fill: 'c', alpha: 1 });
  m.text('聞く人（道から ' + d + ' m）', 3, d, { size: 14, color: 'c' });
  m.text('時速 60 km', vnow, -6, { size: 14, align: 'center', color: 'b' });
  // 下：高さと大きさ
  const g = cv.view({ x0: -6, x1: 6.5, y0: 900, y1: 1022, box: [70, 150, 700, 250] });
  g.axes({ xt: [-6, -4, -2, 0, 2, 4, 6], yt: [915, 960, 1010], xl: '聞いた時刻〔s〕', yl: '聞こえる高さ〔Hz〕', ay: -6, zero: true });
  const curve = dd => { const p = []; for (let te = -8; te <= 8; te += 0.02) { const v = 60 / 3.6, r = Math.hypot(v * te, dd); p.push([te + r / CS, F * CS / (CS + v * v * te / r)]); } return p; };
  g.clip(() => { g.line(curve(other), { color: 'sub', style: 'dash', width: 1.5 }); g.line(curve(d).filter(p => p[0] <= th), { color: 'a', width: 3 }); });
  const r = amb(d, th);
  g.dot(th, r.f, { color: 'a', r: 6 });
  // 大きさ（いちばん近いとき 0 dB、−20 dB まで）
  const h = cv.view({ x0: -6, x1: 6.5, y0: -22, y1: 2, box: [70, 150, 700, 250] });
  const lv = dd => { const p = []; for (let te = -8; te <= 8; te += 0.02) { const v = 60 / 3.6, rr = Math.hypot(v * te, dd); p.push([te + rr / CS, -20 * Math.log10(rr / dd)]); } return p; };
  h.clip(() => h.line(lv(d).filter(p => p[0] <= th), { color: 'c', style: 'dot', width: 2.5 }));
  cv.text('音の大きさ（右の目もり）', 775, 165, { align: 'right', size: 14, color: 'c' });
  for (const db of [0, -10, -20]) cv.text(db + ' dB', 790, h.Y(db), { size: 14, color: 'c' });
}

function dochira(cv, st) {
  const ratio = st.v / CS, t = st.t;
  // 上：音源が動く
  cv.text('音源が近づく', 20, 22, { size: 15, bold: true });
  const y1 = 105;
  cv.g.save(); cv.g.beginPath(); cv.g.rect(0, 35, 880, 155); cv.g.clip();
  for (const [x, y, r] of fronts(t, te => 80 + ratio * CP * te, y1)) cv.circle(x, y, r, { color: 'a', width: 1.4 });
  cv.g.restore();
  cv.dot(80 + ratio * CP * t, y1, { color: 'b', r: 8 });
  cv.rect(800 - 9, y1 - 9, 18, 18, { fill: 'c', alpha: 1 });
  // 下：聞く人が動く
  cv.text('聞く人が近づく', 20, 222, { size: 15, bold: true });
  const y2 = 310;
  cv.g.save(); cv.g.beginPath(); cv.g.rect(0, 235, 880, 175); cv.g.clip();
  for (const [x, y, r] of fronts(t, () => 80, y2)) cv.circle(x, y, r, { color: 'a', width: 1.4 });
  cv.g.restore();
  cv.dot(80, y2, { color: 'b', r: 8 });
  const lx = 800 - ratio * CP * t;
  cv.rect(lx - 9, y2 - 9, 18, 18, { fill: 'c', alpha: 1 });
  cv.arrow(lx - 14, y2 + 24, lx - 14 - 60 * ratio * 2, y2 + 24, { color: 'c', width: 2.5 });
  cv.text(A.num(CS / (CS - st.v) * F, 0) + ' Hz', 860, y1 - 30, { align: 'right', size: 16, bold: true });
  cv.text(A.num((CS + st.v) / CS * F, 0) + ' Hz', 860, y2 - 30, { align: 'right', size: 16, bold: true });
  cv.line([[0, 200], [880, 200]], { color: 'line', width: 1 });
}
