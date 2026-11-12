// @id p1-20
// @title 仕事は道で変わる：p-V 図の面積
// @vol 物理2
// @from 物理 熱-2 ③⑧（p2-02 の3つの道・台形の表・長方形のサイクル）／数学8-7（同じ図）、熱-5・熱-7 でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>';
// 本の数：はじめ 1 L・200 kPa、おわり 3 L・100 kPa。道1 400 J、道2 200 J、まっすぐ 300 J（kPa×L＝J）。
// 表：pV＝100 の曲がった道（A）と、まっすぐな道（B）を 1 L→2 L、0.1 L ずつの台形でたす（A 69.38 J、B 75.00 J）。
const S0 = [1, 200], E0 = [3, 100];
const PRESET = { m1: [3, 200], m2: [1, 100], st: [2, 150] };
A.item({
  id: 'p1-20', title: '仕事は道で変わる：p-V 図の面積',
  from: '物理 第2巻『熱学』 熱-2 ③⑧ の図と表から（数学 第8巻 8-7⑩ と同じ3つの道）',
  W: 880, H: 440,
  state: { path: 'm1', px: 3, py: 200, u: 0, N: 10, dir: 1 },
  scenes: [
    {
      key: 'michi', label: '① 3つの道',
      lead: 'はじめ（1 L・200 kPa）からおわり（3 L・100 kPa）まで、気体をちがう道で変化させます。ぬった面積（気体がする仕事）をくらべましょう。',
      note: '気体がする仕事 $W\'=\\int p\\,\\mathrm{d}V$ は、道の下の面積です（kPa×L＝J）。はじめとおわりが同じでも、道1 は 400 J、道2 は 200 J、まっすぐは 300 J。**仕事は道で変わります**。一方、内部エネルギー $U$ は状態だけで決まるので、どの道でも変化は同じです。',
      miss: '「はじめとおわりの圧力と体積がわかれば、仕事は決まる」はまちがい。決まるのは状態量の変化 $\\Delta U$ だけで、仕事と熱は道すじで変わります。',
      legend: [['いま選んだ道', { color: 'b' }], ['道の下の面積＝気体がする仕事', { color: 'e', shape: 'square', noline: true }], ['曲がり角（ドラッグで動かせる）', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ seg: 'path', label: '道', options: [['m1', '道1'], ['m2', '道2'], ['st', 'まっすぐ'], ['free', '自分で（角をドラッグ）']], on: st => { if (PRESET[st.path]) { st.px = PRESET[st.path][0]; st.py = PRESET[st.path][1]; } st.u = 0; } }],
      init(st) { st.u = 0; st.path = 'm1'; st.px = 3; st.py = 200; },
      step(st, dt) { st.u = Math.min(1, st.u + dt * 0.25); if (st.u >= 1) return false; },
      drag: {
        hit(st, x, y, api) { const v = pvView(api.cv); return A.near(x, y, v.X(st.px), v.Y(st.py), 26) ? 1 : null; },
        move(st, x, y, api) { const v = pvView(api.cv), [V, p] = v.inv(x, y); st.px = A.clamp(Math.round(V * 20) / 20, 0.5, 3.5); st.py = A.clamp(Math.round(p / 5) * 5, 20, 240); st.path = 'free'; st.u = 1; }
      },
      draw(cv, st) { drawPath(cv, st); },
      readout: st => { const w = pathWork(st, 1); return `気体がする仕事 $W'$ ＝ <b>${Math.round(w)} J</b>${SP}（いままで ${Math.round(pathWork(st, st.u))} J）${SP}$pV$：はじめ 200 → おわり 300（どの道でも同じ）`; }
    },
    {
      key: 'daikei', label: '② 台形でたす',
      lead: '1 L・100 kPa から 2 L・50 kPa まで、$pV$ が一定の曲がった道（A）と、まっすぐな道（B）の仕事を、細い台形に区切ってたします。',
      note: '0.1 L ずつの台形でたすと、A は約 69.4 J、B は 75.0 J（本の表）。区切りを細かくすると、A は $100\\ln2\\approx69.3$ J に近づきます。B はまっすぐなので、台形の和はいつも 75 J ちょうどです。',
      miss: '台形の上の辺を、曲がった線の代わりにまっすぐにつなぐので、A では台形の和が少し大きめになります（曲線は、台形の上の辺より下を通るから）。区切りを細かくすると、その差は小さくなります。',
      legend: [['A：$pV=100$', { color: 'a' }], ['B：まっすぐ', { color: 'b', style: 'dash' }], ['台形（A の区切り）', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ range: 'N', label: '区切る数', min: 1, max: 50, step: 1, d: 0, fmt: v => v + ' 個' }],
      draw(cv, st) { drawTrap(cv, st); },
      readout: st => `ΔV ＝ ${A.num(1 / st.N, 3)} L${SP}A の台形の和 ＝ <b>${A.num(trapA(st.N), 2)} J</b>（$100\\ln2$ ＝ 69.31 J）${SP}B の台形の和 ＝ <b>${A.num(75, 2)} J</b>`
    },
    {
      key: 'cycle', label: '③ 1周するサイクル',
      lead: 'A→B→C→D→A と1周して、はじめの状態にもどります。1周で、気体は差し引きどれだけ仕事をするでしょう。',
      note: 'A→B でふくらむときにする仕事 $200\\times2=400$ J から、C→D で縮むときにされる仕事 $100\\times2=200$ J をひいた **200 J** が、1周の正味の仕事で、長方形の面積です。1周すると状態はもどるので $\\oint\\mathrm{d}U=0$：正味の仕事＝正味の熱。',
      miss: '反時計回りに回すと、正味の仕事は −200 J（外から仕事をされる）になります。面積は同じでも、回る向きで符号が変わります（時計回り：熱機関、反時計回り：冷凍機）。',
      legend: [['いまの道', { color: 'b' }], ['ふくらむときにする仕事', { color: 'e', shape: 'square', noline: true }], ['縮むときにされる仕事', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ seg: 'dir', label: '回る向き', options: [[1, '時計回り（A→B→C→D）'], [-1, '反時計回り（A→D→C→B）']], on: st => { st.u = 0; } }],
      init(st) { st.u = 0; st.dir = 1; },
      step(st, dt) { st.u = Math.min(1, st.u + dt * 0.12); if (st.u >= 1) return false; },
      draw(cv, st) { drawCycle(cv, st); },
      readout: st => { const c = cyc(st); return `いま ${A.num(c.V, 2)} L・${Math.round(c.p)} kPa${SP}$pV$ ＝ ${Math.round(c.V * c.p)}${SP}ふくらむときにした仕事 ${Math.round(c.out)} J − 縮むときにされた仕事 ${Math.round(c.inn)} J ＝ <b>${Math.round(c.out - c.inn)} J</b>`; }
    }
  ]
});

// ---------- 計算 ----------
function pvView(cv) { return cv.view({ x0: 0, x1: 3.7, y0: 0, y1: 260, box: [330, 30, 520, 360] }); }
function pathPts(st) { return [S0, [st.px, st.py], E0]; }
function along(pts, u) { // 道の長さ（図の上の見た目）で u の所
  const sc = p => [p[0] / 3.7, p[1] / 260];
  const L = []; let tot = 0;
  for (let i = 0; i < pts.length - 1; i++) { const a = sc(pts[i]), b = sc(pts[i + 1]); const l = Math.hypot(b[0] - a[0], b[1] - a[1]); L.push(l); tot += l; }
  let d = u * tot; const out = [pts[0]];
  for (let i = 0; i < L.length; i++) {
    if (d >= L[i] || L[i] === 0) { out.push(pts[i + 1]); d -= L[i]; continue; }
    const t = d / L[i]; out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]); break;
  }
  return out;
}
function workOf(pts) { let w = 0; for (let i = 0; i < pts.length - 1; i++) w += (pts[i][1] + pts[i + 1][1]) / 2 * (pts[i + 1][0] - pts[i][0]); return w; }
function pathWork(st, u) { return workOf(along(pathPts(st), u)); }
function trapA(N) { let s = 0; for (let i = 0; i < N; i++) { const a = 1 + i / N, b = 1 + (i + 1) / N; s += (100 / a + 100 / b) / 2 * (b - a); } return s; }
const CYC = [[1, 200], [3, 200], [3, 100], [1, 100], [1, 200]];
function cyc(st) {
  const pts = st.dir > 0 ? CYC : CYC.slice().reverse();
  const tr = along(pts, st.u), cur = tr[tr.length - 1];
  let out = 0, inn = 0;
  for (let i = 0; i < tr.length - 1; i++) { const w = (tr[i][1] + tr[i + 1][1]) / 2 * (tr[i + 1][0] - tr[i][0]); if (w > 0) out += w; else inn -= w; }
  return { tr, V: cur[0], p: cur[1], out, inn };
}

// ---------- 絵 ----------
function cylinder(cv, V, p, x0, y0) { // 横向きのシリンダー：体積に比例してピストンが動く
  const L = 60 * V, h = 90;
  cv.line([[x0 + 250, y0], [x0, y0], [x0, y0 + h], [x0 + 250, y0 + h]], { color: 'ink', width: 2.5 });
  cv.rect(x0 + 2, y0 + 2, L - 2, h - 4, { fill: 'a', alpha: 0.12 + 0.25 * p / 250 });
  cv.rect(x0 + L, y0 + 2, 12, h - 4, { fill: 'sub', alpha: 0.8 });
  cv.line([[x0 + L + 12, y0 + h / 2], [x0 + 250, y0 + h / 2]], { color: 'sub', width: 4 });
  cv.text(`${A.num(V, 2)} L`, x0 + L / 2, y0 + h / 2 - 12, { align: 'center', size: 15, bold: true });
  cv.text(`${Math.round(p)} kPa`, x0 + L / 2, y0 + h / 2 + 12, { align: 'center', size: 15 });
}
function pvAxes(v) { v.axes({ xt: [1, 2, 3], yt: [50, 100, 150, 200, 250], xl: 'V（L）', yl: 'p（kPa）' }); }
function drawPath(cv, st) {
  const v = pvView(cv), pts = pathPts(st), tr = along(pts, st.u), cur = tr[tr.length - 1];
  pvAxes(v);
  // 面積（いままで通った道の下。左へもどる所は引く：色を変える）
  for (let i = 0; i < tr.length - 1; i++) {
    const a = tr[i], b = tr[i + 1]; if (Math.abs(b[0] - a[0]) < 1e-9) continue;
    v.poly([[a[0], 0], a, b, [b[0], 0]], { fill: b[0] > a[0] ? 'e' : 'a', alpha: 0.3 });
  }
  v.line(pts, { color: 'b', width: 1.5, alpha: 0.35 });
  v.line(tr, { color: 'b', width: 3.5 });
  if (st.u > 0 && st.u < 1) { const p2 = tr[tr.length - 2]; v.arrow(p2[0], p2[1], cur[0], cur[1], { color: 'b', width: 3.5 }); }
  for (const [k, lab] of [['m1', '道1'], ['m2', '道2'], ['st', 'まっすぐ']]) { if (k === st.path) continue; v.line([S0, PRESET[k], E0], { color: 'sub', width: 1, style: 'dot' }); void lab; }
  v.dot(S0[0], S0[1], { color: 'ink', r: 6 }); v.text('はじめ', S0[0] - 0.08, S0[1] + 14, { align: 'right', size: 15 });
  v.dot(E0[0], E0[1], { color: 'ink', r: 6 }); v.text('おわり', E0[0] + 0.08, E0[1] - 14, { size: 15 });
  v.dot(st.px, st.py, { color: 'd', shape: 'diamond', r: 7 });
  v.dot(cur[0], cur[1], { color: 'b', r: 7 });
  v.text(`${Math.round(pathWork(st, 1))} J`, (S0[0] + E0[0]) / 2, 40, { align: 'center', size: 18, bold: true, bg: true });
  cylinder(cv, cur[0], cur[1], 30, 120);
  cv.text('シリンダーの中の気体', 155, 100, { align: 'center', size: 15, color: 'sub' });
}
function drawTrap(cv, st) {
  const v = cv.view({ x0: 0, x1: 2.4, y0: 0, y1: 115, box: [60, 30, 780, 360] });
  v.axes({ xt: [0.5, 1, 1.5, 2], yt: [25, 50, 75, 100], xl: 'V（L）', yl: 'p（kPa）' });
  const N = st.N;
  for (let i = 0; i < N; i++) { const a = 1 + i / N, b = 1 + (i + 1) / N; v.poly([[a, 0], [a, 100 / a], [b, 100 / b], [b, 0]], { fill: 'a', alpha: i % 2 ? 0.18 : 0.3, color: 'a', width: 1 }); }
  v.plot(x => 100 / x, { x0: 0.6, x1: 2.3, color: 'a', width: 3 });
  v.line([[1, 100], [2, 50]], { color: 'b', width: 3, style: 'dash' });
  v.text('A：pV ＝ 100', 0.62, 100, { size: 16, color: 'a', bold: true });
  v.text('B：まっすぐ', 1.55, 82, { size: 16, color: 'b', bold: true });
  v.dot(1, 100, { color: 'ink', r: 5 }); v.dot(2, 50, { color: 'ink', r: 5 });
}
function drawCycle(cv, st) {
  const v = pvView(cv), c = cyc(st);
  pvAxes(v);
  v.poly(CYC.slice(0, 4), { fill: 'e', alpha: 0.12 });
  // 通った所の下の面積
  for (let i = 0; i < c.tr.length - 1; i++) { const a = c.tr[i], b = c.tr[i + 1]; if (Math.abs(b[0] - a[0]) < 1e-9) continue; v.poly([[a[0], 0], a, b, [b[0], 0]], { fill: b[0] > a[0] ? 'e' : 'a', alpha: 0.28 }); }
  v.line(CYC, { color: 'sub', width: 1.5 });
  const pts = st.dir > 0 ? CYC : CYC.slice().reverse();
  for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[i + 1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = [(b[0] - a[0]) * 0.08, (b[1] - a[1]) * 0.08]; v.arrow(m[0] - d[0], m[1] - d[1], m[0] + d[0], m[1] + d[1], { color: 'sub', width: 2, head: 12 }); }
  v.line(c.tr, { color: 'b', width: 3.5 });
  v.dot(c.V, c.p, { color: 'b', r: 7 });
  for (const [lab, V, p, dx, dy] of [['A', 1, 200, -14, -14], ['B', 3, 200, 14, -14], ['C', 3, 100, 14, 16], ['D', 1, 100, -14, 16]]) cv.text(lab, v.X(V) + dx, v.Y(p) + dy, { size: 16, bold: true, align: 'center' });
  v.text('200 J', 2, 150, { align: 'center', size: 18, bold: true, color: 'e' });
  cylinder(cv, c.V, c.p, 30, 120);
  cv.text('シリンダーの中の気体', 155, 100, { align: 'center', size: 15, color: 'sub' });
}

