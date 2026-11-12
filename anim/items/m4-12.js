// @id m4-12
// @title 矢印の地図に粒を流す：流線
// @vol 数学8
// @from 数学 8-5 図2・3・4（ch8-05:329・363・394）
'use strict';
// 主役の6つの場（−2≦x≦2、−2≦y≦2）と、池の流れ（S (1.5,2.5) からわき出し、K (4.5,1.5) へ吸いこみ）
const FIELDS = {
  a: { name: '（ア）広がる $(x,\\ y)$', f: (x, y) => [x, y], k: 0.28 },
  i: { name: '（イ）集まる $(-x,\\ -y)$', f: (x, y) => [-x, -y], k: 0.28 },
  u: { name: '（ウ）そろった $(1,\\ 0)$', f: () => [1, 0], k: 0.56 },
  e: { name: '（エ）うず $(-y,\\ x)$', f: (x, y) => [-y, x], k: 0.28 },
  o: { name: '（オ）ずれ $(y,\\ 0)$', f: (x, y) => [y, 0], k: 0.28 },
  ka: { name: '（カ）側溝 $(x,\\ 0)$', f: (x) => [x, 0], k: 0.28 }
};
const SAY = { a: '外へ。遠いほど速い（水をそそぐ口のまわり）', i: '中へ。遠いほど速い（ふろの排水口）', u: 'どこでも同じ矢印（広い川のまん中）', e: '原点のまわりを左回り（ターンテーブル）', o: '上は右へ、下は左へ（トランプをずらす）', ka: '右へ行くほど速い（雨水が流れこむ側溝）' };
const SK = { S: [1.5, 2.5], K: [4.5, 1.5] };
const pond = (x, y) => { const a = x - 1.5, b = y - 2.5, c = x - 4.5, d = y - 1.5, r1 = a * a + b * b, r2 = c * c + d * d; return [0.6366 * (a / r1 - c / r2), 0.6366 * (b / r1 - d / r2)]; };
const VB = [10, 10, 430, 420];
const fview = cv => cv.view({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2, box: VB, equal: true });
const pview = cv => cv.view({ x0: -0.2, x1: 6.2, y0: -0.2, y1: 4.2, box: [10, 10, 640, 420], equal: true });
const fld = st => FIELDS[st.f].f;

function arrows(v, f, k, x0, x1, y0, y1, step, o = {}) {
  for (let x = x0; x <= x1 + 1e-9; x += step) for (let y = y0; y <= y1 + 1e-9; y += step) {
    const q = f(x, y), L = Math.hypot(q[0], q[1]);
    if (L < 1e-9) { v.dot(x, y, { color: 'ink', r: 4, open: true }); continue; }
    let s = k; if (o.max && L * s > o.max) s = o.max / L;
    v.arrow(x - q[0] * s / 2, y - q[1] * s / 2, x + q[0] * s / 2, y + q[1] * s / 2, { color: o.color || 'a', width: 1.6, alpha: o.alpha == null ? 0.8 : o.alpha, head: 8 });
  }
}
const rk = (f, p, h) => { const k1 = f(p[0], p[1]), k2 = f(p[0] + h / 2 * k1[0], p[1] + h / 2 * k1[1]), k3 = f(p[0] + h / 2 * k2[0], p[1] + h / 2 * k2[1]), k4 = f(p[0] + h * k3[0], p[1] + h * k3[1]); return [p[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; };

// 粒（種を決めた乱数で、毎回同じ）
function seed(st, n) { const r = A.rng(7); st.P = []; for (let k = 0; k < n; k++) st.P.push({ x: (r() * 4 - 2), y: (r() * 4 - 2), tr: [] }); st.rr = 12345; }
function rnd(st) { let s = st.rr >>> 0 || 1; s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; st.rr = s; return s / 4294967296; }
function stepParticles(st, dt) {
  const f = fld(st);
  for (const p of st.P) {
    const q = rk(f, [p.x, p.y], dt * 0.6); p.tr.push([p.x, p.y]); if (p.tr.length > 14) p.tr.shift();
    p.x = q[0]; p.y = q[1];
    if (Math.abs(p.x) > 2.2 || Math.abs(p.y) > 2.2 || (st.f === 'i' && Math.hypot(p.x, p.y) < 0.08)) { p.x = rnd(st) * 4 - 2; p.y = rnd(st) * 4 - 2; p.tr = []; }
  }
}
function drawTsubu(cv, st) {
  const v = fview(cv), F = FIELDS[st.f];
  v.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x', yl: 'y' });
  arrows(v, F.f, F.k, -2, 2, -2, 2, 0.5, { alpha: 0.55 });
  v.clip(() => { for (const p of st.P) { if (p.tr.length > 1) v.line(p.tr.concat([[p.x, p.y]]), { color: 'b', width: 2, alpha: 0.45 }); v.dot(p.x, p.y, { color: 'b', r: 3.5 }); } });
  side(cv, st);
}
function side(cv, st) {
  const x = 470;
  cv.text(A.txt ? FIELDS[st.f].name.replace(/\$|\\ |\\/g, '') : '', x, 40, { size: 18, bold: true });
  cv.text(SAY[st.f], x, 72, { size: 15 });
}

function stream(f, p0, dir, inside, stop) {
  const pts = [p0]; let p = p0;
  for (let k = 0; k < 900; k++) {
    const g = (x, y) => { const q = f(x, y), L = Math.hypot(q[0], q[1]) || 1e-9; return [dir * q[0] / L, dir * q[1] / L]; };
    const q0 = f(p[0], p[1]); if (Math.hypot(q0[0], q0[1]) < 1e-4) break;
    p = rk(g, p, 0.02); pts.push(p); if (!inside(p) || (stop && stop(p))) break;
  }
  return pts;
}
function drawRyusen(cv, st) {
  const v = fview(cv), F = FIELDS[st.f], ins = p => Math.abs(p[0]) < 2.25 && Math.abs(p[1]) < 2.25;
  v.axes({ xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2], xl: 'x', yl: 'y' });
  arrows(v, F.f, F.k, -2, 2, -2, 2, 0.5, { alpha: 0.35 });
  v.clip(() => {
    for (const s of st.S) {
      const a = stream(F.f, s, 1, ins), b = stream(F.f, s, -1, ins);
      const line = b.reverse().concat(a.slice(1));
      v.line(line, { color: 'd', width: 2.5 });
      const m = a[Math.min(a.length - 1, 25)], m0 = a[Math.min(a.length - 1, 20)];
      if (a.length > 26) v.arrow(m0[0], m0[1], m[0], m[1], { color: 'd', width: 2.5, head: 12 });
      v.dot(s[0], s[1], { color: 'd', r: 5, shape: 'diamond' });
    }
  });
  side(cv, st);
  cv.text('キャンバスをおすと、そこを通る流線が', 470, 120, { size: 15 });
  cv.text('ふえます（◆はドラッグで動かせる）。', 470, 144, { size: 15 });
  cv.text('流線は、矢印の向きをつないだ線。', 470, 196, { size: 15 });
  cv.text('2本の流線は、とちゅうで交わらない。', 470, 220, { size: 15, bold: true, color: 'd' });
}
const SEEDS = { a: [[0.5, 0.3], [-0.6, 0.4], [0.2, -0.7], [-0.4, -0.5]], i: [[1.8, 1.0], [-1.6, 1.4], [1.2, -1.9], [-1.9, -0.6]], u: [[0, 1.5], [0, 0.5], [0, -0.5], [0, -1.5]], e: [[0.5, 0], [1, 0], [1.5, 0], [2, 0]], o: [[0, 1.5], [0, 0.7], [0, -0.7], [0, -1.5]], ka: [[0.3, 1.5], [0.3, 0.5], [-0.3, -0.5], [-0.3, -1.5]] };

function pondSteps(st, dt) {
  const r = A.rng(1);
  st.acc += dt * 14;
  while (st.acc >= 1) { st.acc -= 1; const a = rnd(st) * 2 * Math.PI; st.P.push({ x: 1.5 + 0.08 * Math.cos(a), y: 2.5 + 0.08 * Math.sin(a), tr: [] }); }
  void r;
  const keep = [];
  for (const p of st.P) {
    let t = dt * 0.8;
    p.tr.push([p.x, p.y]); if (p.tr.length > 10) p.tr.shift();
    while (t > 0) { const q = pond(p.x, p.y), L = Math.hypot(q[0], q[1]), h = Math.min(t, 0.02 / (L || 1)); const n = rk(pond, [p.x, p.y], h); p.x = n[0]; p.y = n[1]; t -= h; if (Math.hypot(p.x - 4.5, p.y - 1.5) < 0.1) break; }
    if (Math.hypot(p.x - 4.5, p.y - 1.5) >= 0.1 && p.x > -0.2 && p.x < 6.2 && p.y > -0.2 && p.y < 4.2) keep.push(p);
  }
  st.P = keep.slice(-260);
}
function drawIke(cv, st) {
  const v = pview(cv);
  v.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [1, 2, 3, 4], xl: 'x（m）', yl: 'y（m）', grid: true });
  arrows(v, pond, 0.2, 0.25, 5.75, 0.25, 3.75, 0.5, { alpha: 0.45, max: 0.42 });
  if (st.lines) {
    const ins = p => p[0] > -0.2 && p[0] < 6.2 && p[1] > -0.2 && p[1] < 4.2, near = p => Math.hypot(p[0] - 4.5, p[1] - 1.5) < 0.06;
    v.clip(() => { for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * 2 * Math.PI; v.line(stream(pond, [1.5 + 0.05 * Math.cos(a), 2.5 + 0.05 * Math.sin(a)], 1, ins, near), { color: 'd', width: 1.6, alpha: 0.8 }); } });
  }
  v.clip(() => { for (const p of st.P) { if (p.tr.length > 1) v.line(p.tr.concat([[p.x, p.y]]), { color: 'b', width: 2, alpha: 0.4 }); v.dot(p.x, p.y, { color: 'b', r: 3 }); } });
  v.dot(1.5, 2.5, { color: 'b', r: 8, shape: 'tri' }); v.text('S（わき出し）', 1.5, 2.85, { size: 15, bold: true, align: 'center', bg: true });
  v.dot(4.5, 1.5, { color: 'a', r: 8, shape: 'square' }); v.text('K（吸いこみ）', 4.5, 1.15, { size: 15, bold: true, align: 'center', bg: true });
  const x = 680;
  cv.text('S から出た粒は、K に入る', x, 60, { size: 15 }); cv.text('（図の外を回る粒もある）', x, 84, { size: 14, color: 'sub' });
  cv.text('流線（むらさき）も', x, 132, { size: 15 }); cv.text('S から出て K に入り、', x, 156, { size: 15 }); cv.text('たがいに交わらない。', x, 180, { size: 15, bold: true, color: 'd' });
  cv.text('1秒に 4 m³ が', x, 230, { size: 15, color: 'sub' }); cv.text('わき出し、吸いこまれる', x, 254, { size: 15, color: 'sub' });
}

A.item({
  id: 'm4-12', title: '矢印の地図に粒を流す：流線',
  from: '数学 第8巻 8-5「ベクトル場」の図から（8-7・8-9〜8-11、物理 電-1・6、力-13 でも使う）',
  W: 880, H: 440,
  state: { f: 'e', P: [], S: [], acc: 0, rr: 1, lines: true },
  scenes: [
    {
      key: 'tsubu', label: '① 6つの場に粒を流す',
      lead: '主役の6つの場（矢印の地図）に、色の粒をまいて流します。▶ をおして、場を切りかえてみましょう。',
      note: '粒は、いる場所の矢印の向きに、矢印の長さの速さで進みます。矢印の地図は「その場所で、流れがどちらへどれだけ速いか」を表した**流れの地図**です。（ア）と（エ）はどちらも遠いほど矢印が長いのに、粒の動きはまったくちがいます。（カ）は矢印がみな右向きなのに、右ほど速く、粒の間かくが広がります。',
      miss: '$\\vec F=(-y,\\ x)$ の点 $(1,\\ 2)$ の矢印は $(1,\\ 2)$ ではありません。$F_x=-2$、$F_y=1$ で $(-2,\\ 1)$ です。',
      state: { f: 'e' },
      legend: [['場の矢印（縮めてかいた）', { color: 'a' }], ['流れる粒', { color: 'b', shape: 'circle' }], ['長さ0の場所', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ seg: 'f', label: '場', options: Object.keys(FIELDS).map(k => [k, FIELDS[k].name.replace(/ \$.*$/, '')]), on: st => seed(st, 70) }],
      init: st => seed(st, 70),
      step(st, dt) { stepParticles(st, dt); },
      autoplay: true,
      draw: drawTsubu,
      readout: st => `${FIELDS[st.f].name}：${SAY[st.f]}`
    },
    {
      key: 'ryusen', label: '② 流線をかく',
      lead: '矢印の向きにそって、なめらかにつないだ線（流線）をかきます。キャンバスをおすと、そこを通る流線がふえます。',
      note: '流線は、どの点でも、線の向きがその点の矢印の向きになっている線です。1つの場所には矢印が1本しかないので、そこを通る線の向きも1つに決まり、**流線はたがいに交わりません**（交わってよいのは、矢印の長さが0の場所だけ）。（エ）のうずでは流線が円になり、（ア）では原点から放射状に出ます。',
      miss: '2本の流線が、とちゅうで交わることはありません。交わって見えるのは、長さ0の点（白い丸）だけです。',
      state: { f: 'e' },
      legend: [['流線', { color: 'd' }], ['流線を通す点（ドラッグできる）', { color: 'd', shape: 'diamond', noline: true }], ['場の矢印', { color: 'a' }]],
      controls: [{ seg: 'f', label: '場', options: Object.keys(FIELDS).map(k => [k, FIELDS[k].name.replace(/ \$.*$/, '')]), on: st => { st.S = SEEDS[st.f].map(p => p.slice()); } }, { button: '流線を消す', act: st => { st.S = []; } }],
      init: st => { st.S = SEEDS[st.f].map(p => p.slice()); },
      drag: {
        hit(st, x, y) { const v = fview({ W: 880, H: 440 }); if (!v.inside(x, y)) return null; for (let k = 0; k < st.S.length; k++) { const p = v.P(st.S[k]); if (A.near(x, y, p[0], p[1], 16)) return k; } st.S.push(v.inv(x, y)); if (st.S.length > 10) st.S.shift(); return st.S.length - 1; },
        move(st, x, y, api, k) { const v = fview({ W: 880, H: 440 }); const p = v.inv(x, y); st.S[k] = [A.clamp(p[0], -2.2, 2.2), A.clamp(p[1], -2.2, 2.2)]; }
      },
      draw: drawRyusen,
      readout: st => `流線 ${st.S.length} 本：${FIELDS[st.f].name}`
    },
    {
      key: 'ike', label: '③ 池の流れ',
      lead: '広い池（6 m×4 m）で、点 S の口から水がわき出し、点 K の口に吸いこまれています。▶ で、S から粒を流します。',
      note: 'S の近くでは矢印が外向きに長く、K の近くでは内向きに長くなります。粒も流線も、S から出て K に入ります。矢印しかわからないときに、どこにわき出しや吸いこみがあるかを数で見つけるのが、8-9 の発散です（M4-15）。',
      state: { P: [], acc: 0, rr: 99, lines: true },
      legend: [['池の流れの矢印（0.5 m ごと）', { color: 'a' }], ['流線', { color: 'd' }], ['S から出た粒', { color: 'b', shape: 'circle' }], ['S（わき出し）', { color: 'b', shape: 'tri', noline: true }], ['K（吸いこみ）', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ check: 'lines', label: '流線', text: '流線をかく' }],
      init: st => { st.P = []; st.acc = 0; },
      step(st, dt) { pondSteps(st, dt); },
      autoplay: true,
      draw: drawIke,
      readout: st => `いま池にいる粒：${st.P.length} こ`
    }
  ]
});
