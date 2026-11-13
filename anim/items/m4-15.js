// @id m4-15
// @title 発散：小さな箱で出−入を数える
// @vol 数学8
// @from 数学 8-9 図1・9・6（ch8-09:241・686・446）、まちがえやすいところ①⑤（ch8-09:1112・1143）
'use strict';
const FIELDS = {
  a: { name: '（ア）広がる', f: (x, y) => [x, y], k: 0.28 },
  i: { name: '（イ）集まる', f: (x, y) => [-x, -y], k: 0.28 },
  u: { name: '（ウ）そろった', f: () => [1, 0], k: 0.56 },
  e: { name: '（エ）うず', f: (x, y) => [-y, x], k: 0.28 },
  o: { name: '（オ）ずれ', f: (x, y) => [y, 0], k: 0.28 },
  ka: { name: '（カ）側溝', f: (x) => [x, 0], k: 0.28 }
};
const FORM = { a: '(x, y)', i: '(−x, −y)', u: '(1, 0)', e: '(−y, x)', o: '(y, 0)', ka: '(x, 0)' };
const pond = (x, y) => { const a = x - 1.5, b = y - 2.5, c = x - 4.5, d = y - 1.5, r1 = a * a + b * b, r2 = c * c + d * d; return [0.6366 * (a / r1 - c / r2), 0.6366 * (b / r1 - d / r2)]; };
const Q = 4, src = (x, y) => { const r2 = x * x + y * y; return [Q / (2 * Math.PI) * x / r2, Q / (2 * Math.PI) * y / r2]; };
const rk = (f, p, h) => { const k1 = f(p[0], p[1]), k2 = f(p[0] + h / 2 * k1[0], p[1] + h / 2 * k1[1]), k3 = f(p[0] + h / 2 * k2[0], p[1] + h / 2 * k2[1]), k4 = f(p[0] + h * k3[0], p[1] + h * k3[1]); return [p[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; };

// 箱の4つの辺を通る量（外へ出る向きを正）。シンプソンの公式で辺にそってたす
function edges(f, cx, cy, h, n) {
  n = n || 60; const a = h / 2, I = g => { let s = 0; for (let k = 0; k <= n; k++) { const t = -a + h * k / n, w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2; s += w * g(t); } return s * h / n / 3; };
  return { R: I(t => f(cx + a, cy + t)[0]), L: -I(t => f(cx - a, cy + t)[0]), T: I(t => f(cx + t, cy + a)[1]), B: -I(t => f(cx + t, cy - a)[1]) };
}
function arrows(v, f, k, x0, x1, y0, y1, step, o = {}) {
  for (let x = x0; x <= x1 + 1e-9; x += step) for (let y = y0; y <= y1 + 1e-9; y += step) {
    const q = f(x, y), L = Math.hypot(q[0], q[1]); if (!isFinite(L)) continue;
    if (L < 1e-9) { v.dot(x, y, { color: 'ink', r: 4, open: true }); continue; }
    let s = k; if (o.max && L * s > o.max) s = o.max / L;
    v.arrow(x - q[0] * s / 2, y - q[1] * s / 2, x + q[0] * s / 2, y + q[1] * s / 2, { color: 'a', width: 1.5, alpha: o.alpha == null ? 0.5 : o.alpha, head: 8 });
  }
}
// 箱と、4つの辺の出入り（出る：オレンジの実線の矢印、入る：むらさきの点線の矢印）
function boxDraw(v, E, cx, cy, h, sc) {
  v.poly([[cx - h / 2, cy - h / 2], [cx + h / 2, cy - h / 2], [cx + h / 2, cy + h / 2], [cx - h / 2, cy + h / 2]], { fill: 'e', alpha: 0.12, color: 'ink', width: 2, style: 'dash' });
  const side = [['R', [1, 0]], ['L', [-1, 0]], ['T', [0, 1]], ['B', [0, -1]]];
  for (const [k, n] of side) {
    const q = E[k], m = [cx + n[0] * h / 2, cy + n[1] * h / 2];
    const len = Math.min(0.7, Math.abs(q) * sc);
    if (Math.abs(q) > 1e-3) {
      if (q > 0) v.arrow(m[0], m[1], m[0] + n[0] * len, m[1] + n[1] * len, { color: 'b', width: 3.5 });
      else v.arrow(m[0] + n[0] * len, m[1] + n[1] * len, m[0], m[1], { color: 'd', width: 3.5, style: 'dash' });
    }
    v.text((q > 0 ? '出 ' : q < 0 ? '入 ' : '') + A.num(Math.abs(q), 2), m[0] + n[0] * (len + 0.2) + (n[0] ? 0 : 0.05), m[1] + n[1] * (len + 0.16), { size: 14, bold: true, align: n[0] > 0 ? 'left' : n[0] < 0 ? 'right' : 'center', bg: true, color: q > 0 ? 'b' : q < 0 ? 'd' : 'sub' });
  }
}
function panel(cv, x, E, h, title) {
  const out = ['R', 'L', 'T', 'B'].reduce((s, k) => s + Math.max(0, E[k]), 0), inn = ['R', 'L', 'T', 'B'].reduce((s, k) => s + Math.max(0, -E[k]), 0), d = out - inn;
  cv.text(title, x, 36, { size: 17, bold: true });
  cv.text('出る量 ' + A.num(out, 3), x, 78, { size: 16, color: 'b', bold: true });
  cv.text('入る量 ' + A.num(inn, 3), x, 104, { size: 16, color: 'd', bold: true });
  cv.text('出 − 入 ＝ ' + A.num(d, 3), x, 140, { size: 18, bold: true });
  cv.text('÷ 面積 ' + A.num(h * h, 2) + ' ＝ ' + A.num(d / (h * h), 3), x, 170, { size: 18, bold: true, color: 'e' });
  cv.text(Math.abs(d) < 0.005 ? '→ わき出しも吸いこみもない' : d > 0 ? '→ 箱の中は わき出し' : '→ 箱の中は 吸いこみ', x, 204, { size: 16 });
  return d;
}
const FV = [10, 10, 440, 420], fview = cv => cv.view({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2, box: FV, equal: true });

function seedP(st, n) { const r = A.rng(5); st.P = []; for (let k = 0; k < n; k++) st.P.push([r() * 4 - 2, r() * 4 - 2]); st.rr = 777; }
function rnd(st) { let s = st.rr >>> 0 || 1; s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; st.rr = s; return s / 4294967296; }
function drawHako(cv, st) {
  const v = fview(cv), F = FIELDS[st.f];
  v.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x', yl: 'y' });
  arrows(v, F.f, F.k, -2, 2, -2, 2, 0.5, { alpha: 0.4 });
  v.clip(() => st.P.forEach(p => v.dot(p[0], p[1], { color: 'sub', r: 2.5 })));
  const E = edges(F.f, st.bx, st.by, st.h);
  boxDraw(v, E, st.bx, st.by, st.h, 0.5);
  const x = 480;
  panel(cv, x, E, st.h, F.name + ' ' + FORM[st.f]);
  cv.text('発散（式）：∂vx/∂x ＋ ∂vy/∂y ＝ ' + ({ a: '1＋1＝2', i: '−1−1＝−2', u: '0＋0＝0', e: '0＋0＝0', o: '0＋0＝0', ka: '1＋0＝1' })[st.f], x, 262, { size: 15 });
  cv.text('箱はドラッグで動かせます', x, 410, { size: 14, color: 'sub' });
}

// 池：S から粒を出し、K で吸いこむ。箱の辺をこえた粒を数える
const PV = [10, 10, 600, 420], pview = cv => cv.view({ x0: -0.2, x1: 6.2, y0: -0.2, y1: 4.2, box: PV, equal: true });
const inBox = (st, p) => Math.abs(p[0] - st.bx) <= st.h / 2 && Math.abs(p[1] - st.by) <= st.h / 2;
function pondStep(st, dt) {
  st.T += dt; st.acc += dt * 14;
  while (st.acc >= 1) { st.acc -= 1; const a = rnd(st) * 2 * Math.PI, p = [1.5 + 0.06 * Math.cos(a), 2.5 + 0.06 * Math.sin(a)]; st.P.push(p); if (inBox(st, p)) st.born++; }
  const keep = [];
  for (const p of st.P) {
    const was = inBox(st, p); let t = dt * 0.8, gone = false;
    while (t > 0) { const q = pond(p[0], p[1]), L = Math.hypot(q[0], q[1]), hh = Math.min(t, 0.02 / (L || 1)); const n = rk(pond, p, hh); p[0] = n[0]; p[1] = n[1]; t -= hh; if (Math.hypot(p[0] - 4.5, p[1] - 1.5) < 0.08) { gone = true; break; } }
    const now = inBox(st, p);
    if (gone) { if (was) st.lost++; continue; }
    if (was && !now) st.out++; else if (!was && now) st.inn++;
    if (p[0] > -0.4 && p[0] < 6.4 && p[1] > -0.4 && p[1] < 4.4) keep.push(p); else if (now) st.lost++;
  }
  st.P = keep;
}
function drawIke(cv, st) {
  const v = pview(cv);
  v.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [1, 2, 3, 4], xl: 'x（m）', yl: 'y（m）' });
  if (st.map) for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
    const E = edges(pond, i + 0.5, j + 0.5, 1, 200), d = E.R + E.L + E.T + E.B;
    if (Math.abs(d) > 0.05) v.poly([[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], { fill: d > 0 ? 'b' : 'a', alpha: 0.25 });
    v.text(A.num(Math.abs(d) < 0.05 ? 0 : d, 1), i + 0.8, j + 0.17, { size: 15, align: 'center', bold: Math.abs(d) > 0.05, color: Math.abs(d) > 0.05 ? 'ink' : 'sub' });
  }
  arrows(v, pond, 0.2, 0.25, 5.75, 0.25, 3.75, 0.5, { alpha: 0.35, max: 0.42 });
  v.clip(() => st.P.forEach(p => v.dot(p[0], p[1], { color: 'b', r: 2.6 })));
  v.dot(1.5, 2.5, { color: 'b', r: 7, shape: 'tri' }); v.dot(4.5, 1.5, { color: 'a', r: 7, shape: 'square' });
  v.text('S', 1.5, 2.8, { size: 15, bold: true, align: 'center', bg: true }); v.text('K', 4.5, 1.2, { size: 15, bold: true, align: 'center', bg: true });
  v.poly([[st.bx - st.h / 2, st.by - st.h / 2], [st.bx + st.h / 2, st.by - st.h / 2], [st.bx + st.h / 2, st.by + st.h / 2], [st.bx - st.h / 2, st.by + st.h / 2]], { fill: 'e', alpha: 0.12, color: 'ink', width: 2.5, style: 'dash' });
  const x = 640, T = Math.max(st.T, 1e-9);
  cv.text('点線の箱をこえた粒', x, 36, { size: 16, bold: true });
  cv.text('出た ' + st.out + '　入った ' + st.inn, x, 72, { size: 16 });
  cv.text('箱の中で生まれた ' + st.born, x, 100, { size: 15, color: 'b' });
  cv.text('箱の中で吸いこまれた ' + st.lost, x, 126, { size: 15, color: 'a' });
  cv.text('出 − 入 ＝ ' + A.num(st.out - st.inn, 0), x, 166, { size: 19, bold: true });
  cv.text('（' + A.num(st.T, 1) + ' 秒）', x + 150, 166, { size: 14, color: 'sub' });
  cv.text('1粒 ＝ 水 0.29 m³ として数えた', x, 206, { size: 14, color: 'sub' });
  cv.text('口のない箱では、出−入 は', x, 250, { size: 14, color: 'sub' }); cv.text('いま箱の中にいる粒の数しかずれない', x, 272, { size: 14, color: 'sub' });
  cv.text('箱はドラッグで動かせます', x, 410, { size: 14, color: 'sub' });
  void T;
}

function drawTen(cv, st) {
  const v = fview(cv);
  v.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x', yl: 'y' });
  arrows(v, src, 0.35, -2, 2, -2, 2, 0.5, { alpha: 0.45, max: 0.45 });
  for (const r of [0.8, 1.6]) v.param(t => r * Math.cos(t), t => r * Math.sin(t), 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.2 });
  v.dot(0, 0, { color: 'b', r: 7, shape: 'tri' }); v.text('口', 0.12, -0.18, { size: 15, bold: true, bg: true });
  const E = edges(src, st.bx, st.by, st.h, 2000);
  boxDraw(v, E, st.bx, st.by, st.h, 0.6);
  const x = 480;
  const d = panel(cv, x, E, st.h, '1つの口からのわき出し');
  cv.text('口から r の所の速さ Q/(2πr)', x, 262, { size: 15 });
  cv.text('外の辺は長いが、そのぶん遅い', x, 288, { size: 15 });
  cv.text(Math.abs(d - Q) < 0.05 ? '口が箱の中：出 − 入 ＝ Q ＝ 4' : '口が箱の外：出 − 入 ＝ 0', x, 330, { size: 16, bold: true, color: Math.abs(d - Q) < 0.05 ? 'b' : 'ink' });
  cv.text('箱はドラッグで動かせます', x, 410, { size: 14, color: 'sub' });
}
function boxDrag(view, lim) {
  return {
    hit(st, x, y) { const v = view({ W: 880, H: 440 }); const [a, b] = v.inv(x, y); return Math.abs(a - st.bx) <= st.h / 2 + 0.15 && Math.abs(b - st.by) <= st.h / 2 + 0.15 ? [a - st.bx, b - st.by] : null; },
    move(st, x, y, api, d) { const [a, b] = view({ W: 880, H: 440 }).inv(x, y); st.bx = A.clamp(Math.round((a - d[0]) * 20) / 20, lim[0], lim[1]); st.by = A.clamp(Math.round((b - d[1]) * 20) / 20, lim[2], lim[3]); if (st.out != null) { st.out = st.inn = st.born = st.lost = 0; st.T = 0; } }
  };
}

A.item({
  id: 'm4-15', title: '発散：小さな箱で出−入を数える',
  from: '数学 第8巻 8-9「発散」の図から（8-11・8-14、物理 電-2・力-13 でも使う）',
  W: 880, H: 440,
  state: { f: 'a', bx: 0, by: 0, h: 1, P: [], rr: 1 },
  scenes: [
    {
      key: 'hako', label: '① 箱を動かして数える',
      lead: '主役の場の中に、点線の小さな箱を置きます。4つの辺から1秒間に出る量・入る量をたしかめ、箱をドラッグして動かしてみましょう。',
      note: '「出 − 入」を箱の面積でわったものが**発散**です。（ア）では箱をどこに置いても $+2$、（イ）では $-2$、（ウ）（エ）（オ）では0、（カ）の側溝では $+1$。（カ）は矢印がみな右向きなのに、右の辺から出る量のほうが多い（流れの中で水が加わる）のです。箱を小さくしても、面積でわった値は変わりません。',
      miss: '左の辺で右向きに流れる水は、箱に「入る」水です。右向き・上向きを正にしたら、左と下の辺は**ひきます**。右3・左1・上2・下2 なら $(3-1)+(2-2)=2$ で、$3+1+2+2=8$ ではありません。',
      state: { f: 'a', bx: 0.6, by: 0.4, h: 1 },
      legend: [['外へ出る量', { color: 'b' }], ['中へ入る量', { color: 'd', style: 'dash' }], ['場の矢印', { color: 'a' }]],
      controls: [{ seg: 'f', label: '場', options: Object.keys(FIELDS).map(k => [k, FIELDS[k].name]) }, { range: 'h', label: '箱の1辺', min: 0.2, max: 1.5, step: 0.05 }],
      init: st => seedP(st, 60),
      step(st, dt) { const f = FIELDS[st.f].f; st.P = st.P.map(p => { const q = rk(f, p, dt * 0.5); return Math.abs(q[0]) > 2.2 || Math.abs(q[1]) > 2.2 || (st.f === 'i' && Math.hypot(q[0], q[1]) < 0.08) ? [rnd(st) * 4 - 2, rnd(st) * 4 - 2] : q; }); },
      drag: boxDrag(fview, [-1.6, 1.6, -1.6, 1.6]),
      draw: drawHako,
      readout: st => { const E = edges(FIELDS[st.f].f, st.bx, st.by, st.h), d = E.R + E.L + E.T + E.B; return `出 − 入 ＝（右${A.num(E.R, 2)}）＋（左${A.num(E.L, 2)}）＋（上${A.num(E.T, 2)}）＋（下${A.num(E.B, 2)}）＝ ${A.num(d, 3)}、発散 ${A.num(d / (st.h * st.h), 3)}`; }
    },
    {
      key: 'ike', label: '② 池の口をさがす',
      lead: '池（8-5）の S からわき出した粒が、流れにのって K に吸いこまれます。▶ で粒を流し、点線の箱をこえて出る粒・入る粒を数えましょう。',
      note: '口のない所に箱を置くと、入った粒はやがて出ていくので、「出 − 入」は0に近いままです。S をふくむ箱では、中で生まれた分だけ出るほうが多く、K をふくむ箱では、中で吸いこまれた分だけ入るほうが多くなります。マスごとの発散の地図では、0でないのは $+4.0$（S のマス）と $-4.0$（K のマス）の2つだけです。',
      state: { bx: 3, by: 2.5, h: 1, P: [], acc: 0, rr: 31, out: 0, inn: 0, born: 0, lost: 0, T: 0, map: false },
      legend: [['S から出た粒', { color: 'b', shape: 'circle', noline: true }], ['数える箱', { color: 'ink', style: 'dash' }], ['S（わき出し）', { color: 'b', shape: 'tri', noline: true }], ['K（吸いこみ）', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ check: 'map', label: '発散の地図', text: '1 m のマスごとの発散を見せる' }, { button: '数えなおす', act: st => { st.out = st.inn = st.born = st.lost = 0; st.T = 0; } }],
      init: st => { st.P = []; st.acc = 0; st.out = st.inn = st.born = st.lost = 0; st.T = 0; },
      step(st, dt) { pondStep(st, dt); },
      autoplay: true,
      drag: boxDrag(pview, [0.3, 5.7, 0.3, 3.7]),
      draw: drawIke,
      readout: st => `出 ${st.out}、入 ${st.inn}：出 − 入 ＝ ${A.num(st.out - st.inn, 0)}（${A.num(st.T, 1)} 秒）`
    },
    {
      key: 'ten', label: '③ 口の外では0',
      lead: '1つの口から1秒間に $Q=4$ の水がわき出す流れです。矢印はどこでも外向きですが、口をふくまない箱では「出 − 入」はいくつでしょう。',
      note: '口から $r$ はなれた所の速さは $\\frac{Q}{2\\pi r}$ で、遠くほど遅くなります。口をふくまない箱では、外側の辺は長いのに遅いので、出る量と入る量が等しく、「出 − 入」は0です。わき出しは、口の1点だけに集まっています。口を囲めば、どんな箱でも「出 − 入」は $Q=4$ です。',
      miss: '1つの口から水がわき出す池でも、口からはなれた所の発散は0です。矢印が外向きだからといって、どこでもわき出しなのではありません。また、式で発散が0になっても、口（原点）の1点には $Q$ が集まっています。',
      state: { bx: 1, by: 0.5, h: 0.8 },
      legend: [['外へ出る量', { color: 'b' }], ['中へ入る量', { color: 'd', style: 'dash' }], ['口', { color: 'b', shape: 'tri', noline: true }]],
      controls: [{ range: 'h', label: '箱の1辺', min: 0.2, max: 1.5, step: 0.05 }],
      drag: boxDrag(fview, [-1.6, 1.6, -1.6, 1.6]),
      draw: drawTen,
      readout: st => { const E = edges(src, st.bx, st.by, st.h, 2000), d = E.R + E.L + E.T + E.B; return `出 − 入 ＝ ${A.num(Math.abs(d) < 5e-4 ? 0 : d, 3)}（口が箱の${Math.abs(st.bx) < st.h / 2 && Math.abs(st.by) < st.h / 2 ? '中' : '外'}）`; }
    }
  ]
});
