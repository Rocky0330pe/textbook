// @id p2-18
// @title 電場と磁場の中の荷電粒子
// @vol 物理4
// @from 物理 電-6 ③⑩（p4-06:280・722・732）、電-1 ⑧（p4-01:699）、原-1 ②（p5-01:183）
'use strict';
// 記号は本と同じ：電荷 q、質量 m、比電荷 q/m、速さ v、電場 E〔V/m〕、磁場 B〔T〕、半径 r＝mv/(qB)、v＝E/B
// 粒子：陽子 9.58×10⁷ C/kg（原-1）、重水素の原子核（質量2倍）、H⁻ イオン（陽子に電子2個：負、ほぼ同じ比電荷）
const PART = { p: [9.58e7, '陽子'], d: [4.79e7, '重水素の原子核'], hm: [-9.57e7, 'H⁻ イオン（負）'] };
A.item({
  id: 'p2-18', title: '電場と磁場の中の荷電粒子',
  from: '物理 第4巻 電-1 ⑧「一様な電場の中の粒」、電-6 ③「ローレンツ力」・⑩「円運動・速度選別器」の図から（原-1 のトムソンの実験にもつながる）',
  W: 880, H: 420,
  state: { pt: 'p', v: 1.0, E: 1.0, B: 0.010, bdir: 1, run: [], tr: [], clock: 0, emit: 0, done: false },
  scenes: [
    {
      key: 'denba', label: '① 電場：放物線',
      lead: '2枚の板のあいだ（下向きの電場）に、粒子を横向きに入れます。▶ で何度も撃ちます。',
      note: '電場の力 $qE$ は一定なので、粒子は電場の向き（負の電荷なら反対向き）に一定の加速度 $(q/m)E$ を受け、放物線をえがきます。板のあいだを通る時間は $t=l/v$ で、そのあいだに $\\frac{1}{2}at^2$ ずれます。速いほど、ずれは小さくなります。',
      miss: '負の電荷（H⁻ イオンや電子）は、電場と**反対**の向きに力を受けます。',
      legend: [['粒子の道すじ', { color: 'b', width: 3 }], ['電場 $E$（下向き）', { color: 'c', style: 'dot' }], ['板', { color: 'ink', width: 5 }]],
      controls: [
        { seg: 'pt', label: '粒子', options: Object.keys(PART).map(k => [k, PART[k][1]]), on: clear },
        { range: 'E', label: '電場 $E$〔×10⁴ V/m〕', min: 0, max: 2, step: 0.1, d: 1, on: clear },
        { range: 'v', label: '速さ $v$〔×10⁶ m/s〕', min: 0.5, max: 2, step: 0.05, d: 2, on: clear }
      ],
      init: clear,
      autoplay: true,
      step(st, dt) { return stepAll(st, dt, 1); },
      draw(cv, st) { drawScene(cv, st, 1); },
      readout: st => { const qm = PART[st.pt][0], a = qm * st.E * 1e4, t = 0.1 / (st.v * 1e6); return `加速度 $(q/m)E$ ＝ ${sci(Math.abs(a))} m/s²、板（長さ 0.10 m）を通る時間 ${sci(t)} s、ずれ $\\frac{1}{2}at^2$ ＝ <b>${A.num(0.5 * Math.abs(a) * t * t * 1000, 1)} mm</b>（${a >= 0 ? '下' : '上'}へ）`; }
    },
    {
      key: 'jiba', label: '② 磁場：円',
      lead: '一様な磁場（紙の手前へ ⊙）の中に、粒子を入れます。力の矢印は、いつも速度に垂直です。',
      note: '力が速度に垂直なので、速さは変わらず、向きだけが曲がる**等速円運動**です。$m v^2/r=qvB$ から $r=mv/(qB)$。速いほど・重いほど大きく、磁場が強いほど小さい円です。1周の時間 $2\\pi m/(qB)$ は速さによりません。正の電荷は手前から見て右回り、負の電荷は左回り。点線は、ほかの粒子が同じ速さで入ったときの円です。',
      miss: 'ローレンツ力で粒子は速くなりません。力はいつも速度に垂直で仕事をしないので、速さは変わらず、向きだけが変わります（サイクロトロンで速くしているのは、すき間の**電場**）。',
      legend: [['粒子の道すじ', { color: 'b', width: 3 }], ['速度 $\\vec v$', { color: 'a', width: 3 }], ['ローレンツ力 $q\\vec v\\times\\vec B$', { color: 'd', style: 'dash', width: 3 }], ['ほかの粒子の円', { color: 'sub', style: 'dot' }]],
      controls: [
        { seg: 'pt', label: '粒子', options: Object.keys(PART).map(k => [k, PART[k][1]]), on: clear },
        { range: 'B', label: '磁場 $B$〔T〕', min: 0.01, max: 0.05, step: 0.001, d: 3, on: clear },
        { range: 'v', label: '速さ $v$〔×10⁶ m/s〕', min: 0.5, max: 2, step: 0.05, d: 2, on: clear }
      ],
      init: clear,
      autoplay: true,
      state: { B: 0.02 },
      step(st, dt) { return stepAll(st, dt, 2); },
      draw(cv, st) { drawScene(cv, st, 2); },
      readout: st => { const qm = PART[st.pt][0], r = st.v * 1e6 / (Math.abs(qm) * st.B), T = 2 * Math.PI / (Math.abs(qm) * st.B); const p = st.run[0]; const sp = p ? Math.hypot(p.vx, p.vy) / 1e6 : st.v; return `$r=mv/(qB)$ ＝ <b>${A.num(r, 3)} m</b>、1周の時間 ＝ ${sci(T)} s　いまの速さ ＝ <b>${A.num(sp, 3)}×10⁶ m/s</b>（変わらない）`; }
    },
    {
      key: 'sentaku', label: '③ 速度選別器',
      lead: '下向きの電場とおく向き（⊗）の磁場を重ねた所へ、いろいろな速さの陽子を入れます。出口のすき間を通りぬけるのはどれでしょう。',
      note: '電場の力 $qE$（下）と磁場の力 $qvB$（上）がつり合う $v=E/B$ の粒子だけがまっすぐ進みます。それより速いと磁場の力が勝って上へ、遅いと電場の力が勝って下へ曲がります。電荷や質量によらず、速さだけで選べます。トムソンは、この考えで電子の速さを知り、比電荷 $e/m$ をはかりました（原-1）。',
      legend: [['0.6×10⁶ m/s', { color: 'd', shape: 'tri', noline: true }], ['0.8', { color: 'e', shape: 'square', noline: true }], ['1.0', { color: 'b', shape: 'circle', noline: true }], ['1.2', { color: 'a', shape: 'diamond', noline: true }], ['1.4', { color: 'c', shape: 'cross', noline: true }]],
      controls: [
        { range: 'E', label: '電場 $E$〔×10⁴ V/m〕', min: 0.4, max: 1.6, step: 0.05, d: 2, on: clear },
        { range: 'B', label: '磁場 $B$〔T〕', min: 0.005, max: 0.02, step: 0.0005, d: 4, on: clear }
      ],
      init: clear,
      autoplay: true,
      step(st, dt) { return stepAll(st, dt, 3); },
      draw(cv, st) { drawScene(cv, st, 3); },
      readout: st => `まっすぐ通る速さ $v=E/B$ ＝ ${A.num(st.E, 2)}×10⁴ ÷ ${A.num(st.B, 4)} ＝ <b>${A.num(st.E * 1e4 / st.B / 1e6, 2)}×10⁶ m/s</b>`
    }
  ]
});

function sci(x) { if (x === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e); return A.num(m, 2) + '×10' + String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]); }
function clear(st) { st.run = []; st.tr = []; st.clock = 0; st.emit = 0; }
const SP3 = [[0.6, 'd', 'tri'], [0.8, 'e', 'square'], [1.0, 'b', 'circle'], [1.2, 'a', 'diamond'], [1.4, 'c', 'cross']];
// 場：① 板のあいだ（0≦x≦0.10 m、|y|≦0.02）に下向き E。② 一様な B（手前へ）。③ 0≦x≦0.5、|y|≦0.05 に下向き E とおく向き B
function fieldsAt(st, k, x, y) {
  if (k === 1) return (x >= 0 && x <= 0.10 && Math.abs(y) <= 0.02) ? [-st.E * 1e4, 0] : [0, 0];
  if (k === 2) return [0, st.B];
  return (x >= 0 && x <= 0.5 && Math.abs(y) <= 0.05) ? [-st.E * 1e4, -st.B] : [0, 0];   // [E_y, B_z]
}
function launch(st, k, v, extra) {
  const qm = k === 3 ? PART.p[0] : PART[st.pt][0];
  const p = Object.assign({ x: k === 2 ? 0 : -0.02, y: 0, vx: v * 1e6, vy: 0, qm, path: [], alive: true }, extra || {});
  if (k === 2) { const r = v * 1e6 / (Math.abs(qm) * st.B); p.y = qm > 0 ? Math.min(0.95, r) : -Math.min(0.95, r); p.x = 0; }
  p.path.push([p.x, p.y]); st.run.push(p);
}
function stepAll(st, dt, k) {
  const scale = k === 1 ? 6e-8 : k === 2 ? (2 * Math.PI / (Math.abs(PART[st.pt][0]) * st.B)) / 6 : 2.0e-7;   // 画面の1秒＝本当の何秒
  st.clock += dt;
  if (k === 1 && st.clock > st.emit) { launch(st, 1, st.v); st.emit = st.clock + 1.2; }
  if (k === 2 && !st.run.length) launch(st, 2, st.v);
  if (k === 3 && st.clock > st.emit) { const s = SP3[st.tr.length % 5]; launch(st, 3, s[0], { c: s[1], sh: s[2] }); st.tr.push(1); st.emit = st.clock + 0.45; }
  const T = dt * scale, n = 40, h = T / n;
  for (const p of st.run) {
    if (!p.alive) continue;
    for (let i = 0; i < n; i++) {
      const [Ey, Bz] = fieldsAt(st, k, p.x, p.y);
      const ax = p.qm * (p.vy * Bz), ay = p.qm * (Ey - p.vx * Bz);   // a＝(q/m)(E＋v×B)、v×B＝(vy Bz, −vx Bz)
      p.vx += ax * h; p.vy += ay * h; p.x += p.vx * h; p.y += p.vy * h;
      if (k === 2) { const s = Math.hypot(p.vx, p.vy), s0 = st.v * 1e6; p.vx *= s0 / s; p.vy *= s0 / s; }   // 数値の誤差で速さがずれないように
    }
    p.path.push([p.x, p.y]);
    if (p.path.length > 1500) p.path.shift();
    if (k === 1 && (p.x > 0.16 || Math.abs(p.y) > 0.05 || (p.x >= 0 && p.x <= 0.10 && Math.abs(p.y) >= 0.02))) p.alive = false;
    if (k === 3) { if (p.x >= 0 && p.x <= 0.5 && Math.abs(p.y) >= 0.05) p.alive = false; if (p.x >= 0.55 && p.x < 0.56 && Math.abs(p.y) > 0.004) p.alive = false; if (p.x > 0.68) p.alive = false; }
  }
  if (k !== 2) st.run = st.run.filter(p => p.alive || st.clock - (p.dead || (p.dead = st.clock)) < 1.5);
  if (st.run.length > 30) st.run.shift();
}
function bSym(cv, x, y, out) { cv.circle(x, y, 7, { color: 'sub', width: 1.3 }); if (out) cv.dot(x, y, { color: 'sub', r: 2.2 }); else { cv.line([[x - 4.5, y - 4.5], [x + 4.5, y + 4.5]], { color: 'sub', width: 1.3 }); cv.line([[x + 4.5, y - 4.5], [x - 4.5, y + 4.5]], { color: 'sub', width: 1.3 }); } }
function drawScene(cv, st, k) {
  if (k === 1) {
    const v = cv.view({ x0: -0.03, x1: 0.16, y0: -0.05, y1: 0.05, box: [30, 40, 820, 330] });
    v.line([[0, 0.02], [0.10, 0.02]], { color: 'ink', width: 6 }); v.line([[0, -0.02], [0.10, -0.02]], { color: 'ink', width: 6 });
    v.text('＋ の板', 0.05, 0.026, { size: 15, align: 'center' }); v.text('− の板', 0.05, -0.026, { size: 15, align: 'center' });
    if (st.E > 0) for (let x = 0.01; x < 0.1; x += 0.02) v.arrow(x, 0.017, x, -0.017, { color: 'c', width: 1.6, style: 'dot', head: 10 });
    v.line([[0.16, -0.05], [0.16, 0.05]], { color: 'sub', width: 4 }); v.text('スクリーン', 0.157, 0.046, { size: 14, align: 'right', color: 'sub' });
    v.line([[-0.03, 0], [0.16, 0]], { color: 'sub', width: 1, style: 'dash' });
    for (const p of st.run) { v.clip(() => v.line(p.path, { color: 'b', width: 3, alpha: p.alive ? 1 : 0.4 })); if (p.alive) v.dot(p.x, p.y, { color: 'b', r: 7 }); }
    cv.text('E', v.X(0.105), v.Y(0), { size: 18, bold: true, italic: true, color: 'c' });
    cv.text('l = 0.10 m', v.X(0.05), 395, { size: 15, align: 'center', color: 'sub' });
    cv.text('（たての向きを大きく引きのばしてある）', 450, 18, { size: 14, align: 'center', color: 'sub' });
  } else if (k === 2) {
    const v = cv.view({ x0: -1.1, x1: 1.1, y0: -1.05, y1: 1.05, box: [20, 10, 840, 400], equal: true });
    for (let x = -2.2; x <= 2.2; x += 0.3) for (let y = -0.9; y <= 0.91; y += 0.3) bSym(cv, v.X(x), v.Y(y), true);
    cv.text('B（紙の手前へ ⊙）', 30, 24, { size: 15, color: 'sub', bg: true });
    // ほかの粒子の円（同じ速さ）
    const r0 = st.v * 1e6 / (Math.abs(PART[st.pt][0]) * st.B);
    for (const key of Object.keys(PART)) { if (key === st.pt) continue; const qm = PART[key][0], r = st.v * 1e6 / (Math.abs(qm) * st.B); if (Math.abs(r / r0 - 1) < 0.02) continue; const y0 = qm > 0 ? Math.min(0.95, r) : -Math.min(0.95, r); const cy = qm > 0 ? y0 - r : y0 + r; v.clip(() => v.circle(0, cy, r, { color: 'sub', style: 'dot', width: 1.8 })); v.clip(() => v.text(PART[key][1] + '（同じ速さ）', Math.min(r, 0.7) + 0.03, cy + (r > 0.7 ? Math.sqrt(r * r - 0.49) : 0) * (qm > 0 ? 1 : -1), { size: 14, color: 'sub', bg: true })); }
    const p = st.run[0];
    const qm = PART[st.pt][0], r = st.v * 1e6 / (Math.abs(qm) * st.B);
    if (!p) { const y0 = qm > 0 ? Math.min(0.95, r) : -Math.min(0.95, r); v.dot(0, y0, { color: 'b', r: 8 }); return; }
    v.clip(() => v.line(p.path, { color: 'b', width: 3 }));
    const s = Math.hypot(p.vx, p.vy), ux = p.vx / s, uy = p.vy / s, L = 0.32;
    v.arrow(p.x, p.y, p.x + ux * L, p.y + uy * L, { color: 'a', width: 3.5 });
    const fs = Math.sign(qm);   // F ∝ q (v×B)、B＝＋z：v×B＝(vy, −vx)
    v.arrow(p.x, p.y, p.x + fs * uy * L, p.y - fs * ux * L, { color: 'd', width: 3.5, style: 'dash' });
    v.dot(p.x, p.y, { color: 'b', r: 8 });
    v.text('v', p.x + ux * L * 1.15, p.y + uy * L * 1.15, { size: 17, bold: true, italic: true, color: 'a', bg: true });
    v.text('F', p.x + fs * uy * L * 1.2, p.y - fs * ux * L * 1.2, { size: 17, bold: true, italic: true, color: 'd', bg: true });
    cv.text(PART[st.pt][1] + '：' + (qm > 0 ? '右回り' : '左回り') + '（手前から見て）', 30, 52, { size: 15, color: 'b', bg: true, bold: true });
  } else {
    const v = cv.view({ x0: -0.05, x1: 0.68, y0: -0.07, y1: 0.07, box: [20, 34, 840, 340] });
    v.poly([[0, -0.05], [0.5, -0.05], [0.5, 0.05], [0, 0.05]], { fill: 'c', alpha: 0.06 });
    v.line([[0, 0.05], [0.5, 0.05]], { color: 'ink', width: 6 }); v.line([[0, -0.05], [0.5, -0.05]], { color: 'ink', width: 6 });
    for (let x = 0.04; x < 0.5; x += 0.06) for (let y = -0.035; y <= 0.036; y += 0.035) bSym(cv, v.X(x), v.Y(y), false);
    for (let x = 0.07; x < 0.5; x += 0.12) v.arrow(x, 0.045, x, 0.02, { color: 'c', width: 1.6, style: 'dot', head: 9 });
    v.text('＋ の板', 0.25, 0.058, { size: 14, align: 'center' }); v.text('− の板', 0.25, -0.06, { size: 14, align: 'center' });
    v.line([[0.555, 0.004], [0.555, 0.07]], { color: 'ink', width: 5 }); v.line([[0.555, -0.004], [0.555, -0.07]], { color: 'ink', width: 5 });
    v.text('出口のすき間', 0.56, 0.062, { size: 14 });
    cv.text('E は下向き（点線の矢印）、B はおく向き（⊗）。たての向きを大きく引きのばしてある', 440, 16, { size: 14, align: 'center', color: 'sub' });
    for (const p of st.run) { v.clip(() => v.line(p.path, { color: p.c, width: 2, alpha: p.alive ? 0.9 : 0.35 })); if (p.alive) v.dot(p.x, p.y, { color: p.c, shape: p.sh, r: 7 }); }
    const vs = st.E * 1e4 / st.B / 1e6;
    cv.text(`通りぬける速さ E/B ＝ ${A.num(vs, 2)}×10⁶ m/s`, 440, 400, { size: 16, align: 'center', bold: true });
  }
}
