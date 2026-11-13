// @id m3-01
// @title Q を P に近づける：平均の速さから接線へ
// @vol 数学5
// @from 数学 5-1 ③（ch5-01:195〜211 の x=20t²）・5-3 ②（ch5-03:142〜179 の y=x² と拡大の図）／5-2・5-8・5-17、物理 力-1 でも使う
'use strict';
// 5-1：x=20t²（cm）、P は 1.0 秒。Δt＝1・0.5・0.1・0.01・0.001 で 60・50・42・40.2・40.02
// 5-3：y=x² の P(1,1)。Q を (2,4)→(1.5,2.25)→(1.2,1.44) と近づけると、傾き 3・2.5・2.2 → 接線の傾き 2
// 5-3：拡大の図は、横はば 2・0.4・0.08（中心は P）
const DT_BOOK = [1, 0.5, 0.1, 0.01, 0.001];
const H_BOOK = [1, 0.5, 0.2, 0.05, 0.01];
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
// 本の値のあいだを、止まりながら進む（1つの値に 1.6 秒。はじめの 0.8 秒で動き、あとは止まって見せる）
// mode：'lg'（st[key] に log10 の値を入れる）・'geo'（値を入れる。動きは log で等しく）
function stepList(st, dt, list, key, mode) {
  st.t += dt;
  const seg = Math.floor(st.t / 1.6), out = u => mode === 'geo' ? Math.pow(10, u) : u;
  if (seg >= list.length - 1) { st[key] = out(Math.log10(list[list.length - 1])); return false; }
  const a = Math.log10(list[seg]), b = Math.log10(list[seg + 1]);
  st[key] = out(a + (b - a) * ease((st.t - seg * 1.6) / 0.8));
}

A.item({
  id: 'm3-01', title: 'Q を P に近づける：平均の速さから接線へ',
  from: '数学 第5巻 5-1「平均の速さと瞬間の速さ」・5-3「微分係数と導関数」の図から（5-2・5-8・5-17、物理 力-1 でも使う）',
  W: 880, H: 420,
  state: { t: 0 },
  scenes: [
    {
      key: 'heikin', label: '① 平均の速さ → 瞬間の速さ',
      lead: 'ボールの位置は $x=20t^2$（cm）。1.0 秒の点 P と、少しあとの点 Q を結ぶ直線の傾き（平均の速さ）を見ます。▶ で Q が P に近づきます。',
      note: '平均の速さは 60、50、42、40.2、40.02 と、40 に近づきます。40 より大きい分（ずれ）は 20、10、2、0.2、0.02 で、$\\Delta t$ を $\\frac{1}{10}$ にすると、ずれも $\\frac{1}{10}$ です。ずれが消えた先の 40 cm/s が、**1.0 秒の瞬間の速さ**です。',
      miss: 'あいだを 0 にすると、進んだ距離も時間も 0 で、0÷0 になって計算できません。**0 にはしないで、どんどん短くしていく**のです。',
      legend: [['$x=20t^2$', { color: 'a', width: 3 }], ['直線 PQ（傾き＝平均の速さ）', { color: 'b', style: 'dash' }], ['傾き 40 の直線', { color: 'c', style: 'dot' }], ['P・Q', { color: 'ink', shape: 'circle', noline: true }]],
      state: { lg: 0 },
      controls: [{ range: 'lg', label: '$\\Delta t$（s）', min: -3, max: 0, step: 0.01, fmt: v => fmtDt(Math.pow(10, v)) }],
      step(st, dt) { return stepList(st, dt, DT_BOOK, 'lg', 'lg'); },
      drag: {
        hit(st, x, y) { const v = viewX(); const d = Math.pow(10, st.lg); return A.near(x, y, v.X(1 + d), v.Y(20 * (1 + d) ** 2), 26) ? 1 : null; },
        move(st, x) { const v = viewX(); const [t] = v.inv(x, 0); st.lg = A.clamp(Math.log10(Math.max(1e-3, t - 1)), -3, 0); }
      },
      draw(cv, st) { drawHeikin(cv, st); },
      readout: st => { const d = Math.pow(10, st.lg), q = 20 * (1 + d) ** 2; return `$\\Delta t$ ＝ ${fmtDt(d)} s：平均の速さ ＝ (${A.num(q, dig(q))} − 20) ÷ ${fmtDt(d)} ＝ <b>${A.num(40 + 20 * d, dig(40 + 20 * d))} cm/s</b>（40 より ${A.num(20 * d, dig(20 * d))} 大きい）`; }
    },
    {
      key: 'sessen', label: '② 曲線の接線',
      lead: '$y=x^2$ の点 P(1, 1) と、グラフの上の点 Q を結びます。Q をドラッグするか、▶ で P に近づけましょう。',
      note: 'PQ の傾きは $\\frac{f(1+h)-f(1)}{h}=2+h$ です。$h$ を 1、0.5、0.2 にすると傾きは 3、2.5、2.2。$h\\to0$ で、直線 PQ は P での**接線**（傾き 2）に近づきます。Q を P の左に置いても（$h<0$）、同じ 2 に近づきます。',
      miss: '$f(1+h)$ を $f(1)+h$ としてはいけません。$f(1+h)=(1+h)^2=1+2h+h^2$ です（かっこごと入れるのが代入）。',
      legend: [['$y=x^2$', { color: 'a', width: 3 }], ['直線 PQ', { color: 'b', style: 'dash' }], ['接線（傾き 2）', { color: 'c', style: 'dot' }], ['横の変化 $h$・たての変化', { color: 'ink', style: 'solid' }]],
      state: { h: 1, tan: true },
      controls: [{ range: 'h', label: '横のはば $h$', min: -1, max: 1.2, step: 0.01 }, { check: 'tan', text: '接線（傾き 2）を見せる' }],
      step(st, dt) { return stepList(st, dt, H_BOOK, 'h', 'geo'); },
      drag: {
        hit(st, x, y) { const v = viewP(); const q = 1 + st.h; return A.near(x, y, v.X(q), v.Y(q * q), 26) ? 1 : null; },
        move(st, x) { const v = viewP(); const [q] = v.inv(x, 0); let h = A.clamp(q - 1, -1, 1.2); if (Math.abs(h) < 0.005) h = h < 0 ? -0.005 : 0.005; st.h = Math.round(h * 1000) / 1000; }
      },
      draw(cv, st) { drawSessen(cv, st); },
      readout: st => { const h = st.h, q = 1 + h; return `Q(${sh(q)}, ${sh(q * q)})：PQ の傾き ＝ (${sh(q * q)} − 1) ÷ ${h < 0 ? '(' + sh(h) + ')' : sh(h)} ＝ <b>${sh(2 + h)}</b> ＝ 2 + $h$`; }
    },
    {
      key: 'kakudai', label: '③ 拡大するとまっすぐ',
      lead: 'P(1, 1) のまわりを、虫めがねのように拡大していきます。わくの大きさは同じで、横はばを 2 → 0.4 → 0.08 とせまくします。',
      note: '拡大するほど、曲線は接線（傾き 2）とほとんど重なります。わくのはしでの曲線と接線のずれは $w^2$（$w$ は横はばの半分）で、わくの高さ $4w$ よりずっと速く小さくなります。接線は「とても大きく拡大したとき、曲線が見せるまっすぐな線」です。',
      legend: [['$y=x^2$', { color: 'a', width: 3 }], ['接線 $y=2x-1$', { color: 'b', style: 'dash' }], ['わく（左の図で、いま見ている所）', { color: 'sub', style: 'solid' }]],
      state: { lw: Math.log10(2) },
      controls: [{ range: 'lw', label: '横はば', min: -2, max: Math.log10(2), step: 0.01, fmt: v => A.num(Math.pow(10, v), Math.pow(10, v) < 0.1 ? 3 : 2) }],
      step(st, dt) { return stepList(st, dt, [2, 0.4, 0.08, 0.016], 'lw', 'lg'); },
      draw(cv, st) { drawKakudai(cv, st); },
      readout: st => { const w = Math.pow(10, st.lw) / 2; return `横はば ${A.num(2 * w, 3)}：わくのはしのずれ $w^2$ ＝ ${String(Number((w * w).toPrecision(2)))}（わくの高さの ${A.num(w * w / (4 * w) * 100, 1)} %）`; }
    }
  ]
});

function fmtDt(d) { return String(Number(d.toPrecision(2))); }
function sh(v) { return String(Number(v.toFixed(4))).replace('-', '−'); }
function dig(v) { const s = String(+v.toFixed(6)); const k = s.indexOf('.'); return k < 0 ? 0 : Math.min(5, s.length - k - 1); }
function viewX() { return new A.View({ W: 880, H: 420 }, { x0: 0, x1: 2.3, y0: 0, y1: 95, box: [60, 24, 470, 350] }); }
function viewP() { return new A.View({ W: 880, H: 420 }, { x0: -0.3, x1: 2.45, y0: -0.3, y1: 4.6, box: [60, 24, 470, 350] }); }

function drawHeikin(cv, st) {
  const v = cv.view({ x0: 0, x1: 2.3, y0: 0, y1: 95, box: [60, 24, 470, 350] });
  const d = Math.pow(10, st.lg), tq = 1 + d, xq = 20 * tq * tq, m = 40 + 20 * d;
  v.axes({ xt: [0.5, 1, 1.5, 2], yt: [20, 40, 60, 80], xl: 't（s）', yl: 'x（cm）' });
  v.plot(t => 20 + 40 * (t - 1), { color: 'c', style: 'dot', width: 2.5, x0: 0.5, x1: 2.2 });
  v.plot(t => 20 * t * t, { color: 'a', width: 3, x0: 0, x1: 2.1 });
  v.plot(t => 20 + m * (t - 1), { color: 'b', style: 'dash', width: 2.5, x0: 0.45, x1: 2.25 });
  // Δt と Δx（大きいときだけ）
  if (d > 0.08) {
    v.line([[1, 20], [tq, 20], [tq, xq]], { color: 'ink', width: 1.5 });
    v.text('Δt', (1 + tq) / 2, 20, { align: 'center', base: 'top', size: 15, math: true, italic: true, bg: true });
    v.text('Δx', tq, (20 + xq) / 2, { align: 'left', size: 15, math: true, italic: true, bg: true });
  }
  v.dot(1, 20, { color: 'ink', r: 6 }); v.text('P', 1, 20, { align: 'right', base: 'bottom', size: 17, bold: true });
  v.dot(tq, xq, { color: 'ink', r: 6, shape: 'square' });
  if (d > 0.03) v.text('Q', tq - 0.03, xq + 4, { align: 'right', base: 'bottom', size: 17, bold: true });
  // 右：本の表
  const L = 560, T = 40, cw = [70, 100, 120];
  cv.text('Δt（s）', L, T, { size: 15, color: 'sub' }); cv.text('平均の速さ', L + cw[0] + 10, T, { size: 15, color: 'sub' }); cv.text('40 とのずれ', L + cw[0] + cw[1] + 30, T, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 16], [870, T + 16]], { color: 'line', width: 1 });
  DT_BOOK.forEach((b, k) => {
    const y = T + 46 + k * 40, on = Math.abs(Math.log10(b) - st.lg) < 0.02;
    if (on) cv.rect(L - 6, y - 17, 316, 34, { fill: 'hl', alpha: 1 });
    cv.text(fmtDt(b), L, y, { size: 16, bold: on });
    cv.text(A.num(40 + 20 * b, dig(40 + 20 * b)), L + cw[0] + 30, y, { size: 16, bold: on, color: on ? 'b' : 'ink' });
    cv.text(A.num(20 * b, dig(20 * b)), L + cw[0] + cw[1] + 50, y, { size: 16, bold: on });
  });
  cv.text('→ 0 にすると　40（瞬間の速さ）', L, T + 46 + 5 * 40 + 6, { size: 16, color: 'c', bold: true });
  cv.text('（Q をドラッグしても動かせます）', L, T + 46 + 6 * 40, { size: 14, color: 'sub' });
}

function drawSessen(cv, st) {
  const v = cv.view({ x0: -0.3, x1: 2.45, y0: -0.3, y1: 4.6, box: [60, 24, 470, 350] });
  const h = st.h, q = 1 + h, m = 2 + h;
  v.axes({ xt: [1, 2], yt: [1, 2, 3, 4], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  // 本の図の3本（うすく）
  for (const hb of [1, 0.5, 0.2]) v.plot(x => 1 + (2 + hb) * (x - 1), { color: 'sub', width: 1, alpha: 0.35, x0: 0.6, x1: 2.4 });
  if (st.tan) v.plot(x => 2 * x - 1, { color: 'c', style: 'dot', width: 3, x0: 0.3, x1: 2.4 });
  v.plot(x => x * x, { color: 'a', width: 3, x0: -0.3, x1: 2.12 });
  v.plot(x => 1 + m * (x - 1), { color: 'b', style: 'dash', width: 2.5 });
  if (Math.abs(h) > 0.06) {
    v.line([[1, 1], [q, 1], [q, q * q]], { color: 'ink', width: 1.5 });
    v.text('h', (1 + q) / 2, 1, { align: 'center', base: h > 0 ? 'top' : 'bottom', size: 16, math: true, italic: true, bg: true });
  }
  v.dot(1, 1, { color: 'ink', r: 6 }); v.text('P', 1.04, 0.92, { align: 'left', base: 'top', size: 17, bold: true });
  v.dot(q, q * q, { color: 'ink', r: 6, shape: 'square' });
  if (Math.abs(h) > 0.04) v.text('Q', q - 0.04, q * q + 0.08, { align: 'right', base: 'bottom', size: 17, bold: true });
  // 右：本の数
  const L = 560, T = 40;
  cv.text('h', L, T, { size: 15, color: 'sub', italic: true, math: true }); cv.text('Q', L + 70, T, { size: 15, color: 'sub' }); cv.text('PQ の傾き ＝ 2 + h', L + 180, T, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 16], [870, T + 16]], { color: 'line', width: 1 });
  [1, 0.5, 0.2, 0.01].forEach((b, k) => {
    const y = T + 46 + k * 40, on = Math.abs(b - h) < 0.004;
    if (on) cv.rect(L - 6, y - 17, 316, 34, { fill: 'hl', alpha: 1 });
    cv.text(sh(b), L, y, { size: 16, bold: on });
    cv.text(`(${sh(1 + b)}, ${sh((1 + b) ** 2)})`, L + 70, y, { size: 16, bold: on });
    cv.text(sh(2 + b), L + 220, y, { size: 16, bold: on, color: on ? 'b' : 'ink' });
  });
  cv.text('h → 0 で　接線の傾き 2', L, T + 46 + 4 * 40 + 6, { size: 16, color: 'c', bold: true });
  cv.text('f′(1) ＝ lim (2 + h) ＝ 2', L, T + 46 + 5 * 40 + 6, { size: 16, math: true });
  cv.text('（Q をドラッグできます）', L, T + 46 + 6 * 40, { size: 14, color: 'sub' });
}

function drawKakudai(cv, st) {
  const w = Math.pow(10, st.lw) / 2;
  // 左：全体と、いま見ているわく
  const o = cv.view({ x0: -0.3, x1: 2.4, y0: -0.4, y1: 4.6, box: [50, 30, 250, 340] });
  o.axes({ xt: [1, 2], yt: [1, 2, 3, 4], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  o.plot(x => x * x, { color: 'a', width: 2.5, x0: -0.3, x1: 2.14 });
  o.plot(x => 2 * x - 1, { color: 'b', style: 'dash', width: 1.5, x0: 0.2, x1: 2.4 });
  const rw = Math.max(w, 0.03);
  o.poly([[1 - rw, 1 - 2 * rw], [1 + rw, 1 - 2 * rw], [1 + rw, 1 + 2 * rw], [1 - rw, 1 + 2 * rw]], { color: 'ink', width: 2, fill: 'hl', alpha: 0.5 });
  o.dot(1, 1, { color: 'ink', r: 4 });
  // 右：拡大したわく（正方形）
  const B = [400, 20, 380, 380];
  const z = cv.view({ x0: 1 - w, x1: 1 + w, y0: 1 - 2 * w, y1: 1 + 2 * w, box: B });
  cv.rect(B[0], B[1], B[2], B[3], { color: 'sub', width: 1.5 });
  z.clip(() => {
    z.plot(x => 2 * x - 1, { color: 'b', style: 'dash', width: 3 });
    z.plot(x => x * x, { color: 'a', width: 3, n: 200 });
  });
  z.dot(1, 1, { color: 'ink', r: 6 });
  cv.text('P', z.X(1) + 10, z.Y(1) + 14, { size: 17, bold: true });
  cv.text(`横はば ${A.num(2 * w, w < 0.05 ? 3 : 2)}`, B[0] + B[2] / 2, B[1] + B[3] - 16, { align: 'center', size: 16, bg: true });
  // はしでのずれ
  // 左はしでのずれ（曲線 (1−w)² と接線 1−2w の差 w²）
  const xe = 1 - w;
  if (z.Y(2 * xe - 1) - z.Y(xe * xe) > 6) {
    cv.line([[z.X(xe) + 8, z.Y(xe * xe)], [z.X(xe) + 8, z.Y(2 * xe - 1)]], { color: 'ink', width: 2.5 });
    cv.text('ずれ', z.X(xe) + 14, (z.Y(xe * xe) + z.Y(2 * xe - 1)) / 2 - 18, { align: 'left', size: 15, bg: true });
  }
  cv.text('拡大', 340, 200, { align: 'center', size: 15, color: 'sub' });
  cv.arrow(312, 214, 372, 214, { color: 'sub', width: 2 });
}
