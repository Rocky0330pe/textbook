// @id p1-15
// @title はりの荷物を動かす：Q 図・M 図・たわみ
// @vol 物理1
// @from 物理 力-10 ①④⑤⑧⑨（p1-10 の例題3「2点で支えた板」、本棚の板の表計算・たわみの式・代表的なはりの表）、まちがえやすいところ
'use strict';
// 力（荷物・反力）の矢印は実線。Q 図・M 図・たわみは本と同じ向き（M は谷の形に曲げる向きを＋、たわみは下がる向きを下にかく）。
const EB = 7e9, BB = 0.25;   // 本棚の板：すぎ E＝7 GPa、はば 0.25 m
A.item({
  id: 'p1-15', title: 'はりの荷物を動かす：Q 図・M 図・たわみ',
  from: '物理 第1巻『力学』 力-10 ④ 例題3（2点で支えた板）、⑤ 本棚の板の表計算、⑧⑨ たわみの式から（数学 5-9〜5-13、力-11 でも使う）',
  W: 880, H: 440,
  state: { a: 0.5, L: 0.8, h: 18 },
  scenes: [
    {
      key: 'nimotsu', label: '① 荷物をドラッグ',
      lead: '長さ 2.0 m の板を両はし A・B で支え、600 N の荷物をのせます。荷物（↓）をドラッグして、支える力・$Q$ 図・$M$ 図・たわみの形を見ましょう。',
      note: '$R_A=\\dfrac{b}{L}F$、$R_B=\\dfrac{a}{L}F$。$M$ は $Q$ を足していったもの（$\\frac{dM}{dx}=Q$）なので、$Q$ が正から負へ変わる**荷物の所**で最大です（$a=0.5$ m で 450 N・150 N、$M_{max}=225$ N·m）。荷物がまん中なら $FL/4=300$ N·m、A の真上なら $M=0$（板は曲がらない）。いちばん下がる所は、荷物の所とはかぎりません。',
      miss: '「はりの曲げモーメントは、いつもまん中で最大」はまちがい。$M$ が最大になるのは $Q=0$ になる所（荷物の位置・片持ちの根もと）です。',
      legend: [['荷物・反力（実線の矢印）', { color: 'b' }], ['せん断力 $Q$', { color: 'a' }], ['曲げモーメント $M$', { color: 'd' }], ['たわみの形（大きくかいた）', { color: 'c' }]],
      drag: { hit(st, x, y) { return x > 60 && x < 820 && y < 130 ? 'a' : null; }, move(st, x) { st.a = A.clamp(Math.round((x - 90) / 700 * 2 / 0.05) * 0.05, 0, 2); } },
      controls: [{ range: 'a', label: 'A から荷物まで $a$〔m〕', min: 0, max: 2, step: 0.05, d: 2 }],
      draw: drawNimotsu,
      readout: st => { const F = 600, L = 2, a = st.a, b = L - a; return `$R_A$ ＝ ${A.num(b / L * F, 0)} N　　$R_B$ ＝ ${A.num(a / L * F, 0)} N　　$M_{max}$ ＝ ${A.num(b / L * F, 0)} × ${A.num(a, 2)} ＝ <b>${A.num(b / L * F * a, 1)} N·m</b>（荷物の所）　　いちばん下がる所 $x$ ＝ ${A.num(maxDefX(a, L), 2)} m`; }
    },
    {
      key: 'tana', label: '② 本棚の板',
      lead: '本 30 kg を一様に並べた本棚の板（すぎ、はば 0.25 m）。長さ $L$ と厚さ $h$ を変えて、$w\\to Q\\to M\\to$ たわみ の順に見ましょう。',
      note: '$Q$ はまっすぐ減る線、$M$ はまん中で山になる放物線（$wL^2/8=29.4$ N·m）、たわみは $\\delta=\\dfrac{5wL^4}{384EI}$ で約 2.3 mm。1 m あたりの重さ $w$ が同じなら、長さ2倍でたわみは $2^4=16$ 倍。厚さ $h$ を2倍にすると $I=\\frac{bh^3}{12}$ が8倍で、たわみは $\\frac{1}{8}$ です。',
      miss: '「長さが2倍なら、たわみも2倍」はまちがい。同じ力なら長さの3乗で8倍、1 m あたりが同じなら16倍です。',
      legend: [['分布荷重 $w$', { color: 'b' }], ['せん断力 $Q$', { color: 'a' }], ['曲げモーメント $M$', { color: 'd' }], ['たわみ（下がる向きを下）', { color: 'c' }]],
      controls: [{ range: 'L', label: '板の長さ $L$〔m〕', min: 0.4, max: 1.6, step: 0.05, d: 2 }, { range: 'h', label: '板の厚さ $h$〔mm〕', min: 9, max: 36, step: 1, d: 0 }, { button: 'もとにもどす（0.8 m・18 mm）', act: st => { st.L = 0.8; st.h = 18; } }],
      draw: drawTana,
      readout: st => { const w = 367.5, I = BB * (st.h / 1000) ** 3 / 12, EI = EB * I, d = 5 * w * st.L ** 4 / (384 * EI); return `$I$ ＝ ${A.num(I * 1e7, 3)}×10⁻⁷ m⁴　$EI$ ＝ ${A.num(EI, 1)} N·m²　　$M_{max}=wL^2/8$ ＝ ${A.num(w * st.L ** 2 / 8, 1)} N·m　　たわみ $\\delta$ ＝ <b>${A.num(d * 1000, 2)} mm</b>（0.8 m・18 mm のときの ${A.num(d / 0.0023047, 2)} 倍）`; }
    }
  ]
});

// 単純支持・点 a に荷重 F のたわみ（EI＝1 の形）
function defl(x, a, L) {
  const b = L - a; if (a <= 0 || b <= 0) return 0;
  if (x <= a) return b * x * (L * L - b * b - x * x) / (6 * L);
  const xr = L - x; return a * xr * (L * L - a * a - xr * xr) / (6 * L);
}
function maxDefX(a, L) {
  if (a <= 0 || a >= L) return L / 2;
  const b = L - a; return a >= b ? Math.sqrt((L * L - b * b) / 3) : L - Math.sqrt((L * L - a * a) / 3);
}
function supports(cv, xa, xb, y) {
  cv.poly([[xa, y], [xa - 10, y + 16], [xa + 10, y + 16]], { fill: 'sub', alpha: 0.4, color: 'ink', width: 1.5 });
  cv.circle(xb, y + 8, 7, { fill: 'sub', alpha: 0.4, color: 'ink', width: 1.5 });
  cv.text('A', xa - 16, y - 2, { size: 15, bold: true, align: 'right' }); cv.text('B', xb + 16, y - 2, { size: 15, bold: true });
}
function drawNimotsu(cv, st) {
  const F = 600, L = 2, a = st.a, b = L - a, RA = b / L * F, RB = a / L * F, X = x => 90 + x / L * 700;
  // 板と力
  const yb = 82;
  cv.rect(X(0), yb - 8, 700, 8, { fill: 'e', alpha: 0.5, color: 'e', width: 1 });
  supports(cv, X(0), X(L), yb);
  cv.arrow(X(a), yb - 56, X(a), yb - 10, { color: 'b', width: 4 }); cv.text('F = 600 N', X(a) + 8, yb - 44, { size: 15, color: 'b', bold: true });
  if (RA > 1) cv.arrow(X(0) - 26, yb + 6 + RA * 0.06, X(0) - 26, yb + 2, { color: 'b', width: 3 }); cv.text(A.num(RA, 0) + ' N', X(0) - 32, yb + 22, { size: 14, color: 'b', align: 'right' });
  if (RB > 1) cv.arrow(X(L) + 26, yb + 6 + RB * 0.06, X(L) + 26, yb + 2, { color: 'b', width: 3 }); cv.text(A.num(RB, 0) + ' N', X(L) + 32, yb + 22, { size: 14, color: 'b' });
  cv.text('ドラッグ ↔', X(a), yb - 66, { size: 13, color: 'sub', align: 'center' });
  // Q 図
  const q = cv.view({ x0: 0, x1: 2.2, y0: -650, y1: 650, box: [90, 132, 770, 85] });
  q.axes({ xt: [], yt: [], yl: 'Q〔N〕', grid: false, ax: 0 });
  const Qp = [[0, 0], [0, RA], [a, RA], [a, RA - F], [L, RA - F], [L, 0]];
  q.poly(Qp, { fill: 'a', alpha: 0.15 }); q.line(Qp, { color: 'a', width: 2.5 });
  q.text(A.num(RA, 0), Math.max(a, 0.12) + 0.03, RA + 110, { size: 14, color: 'a' }); q.text(A.num(RA - F, 0), L - 0.03, RA - F - 90, { size: 14, color: 'a', align: 'right' });
  // M 図
  const m = cv.view({ x0: 0, x1: 2.2, y0: 0, y1: 330, box: [90, 232, 770, 90] });
  m.axes({ xt: [], yt: [], yl: 'M〔N·m〕', grid: false, ax: 0 });
  const Mp = [[0, 0], [a, RA * a], [L, 0]];
  m.poly(Mp, { fill: 'd', alpha: 0.15 }); m.line(Mp, { color: 'd', width: 2.5 });
  m.dot(a, RA * a, { color: 'd', r: 5, shape: 'diamond' }); m.text('Mmax = ' + A.num(RA * a, 0), a, RA * a + 45, { size: 14, color: 'd', align: 'center', bg: true });
  // たわみの形（大きさは、まん中に置いたときの最大を 1 として）
  const y = cv.view({ x0: 0, x1: 2.2, y0: -1.25, y1: 0.15, box: [90, 335, 770, 95] });
  y.axes({ xt: [0.5, 1, 1.5, 2], yt: [], xl: 'x〔m〕', yl: 'たわみ', grid: false, ax: 0 });
  const dm = defl(1, 1, 2);
  y.plot(x => -defl(x, a, L) / dm, { x0: 0, x1: L, color: 'c', width: 3 });
  const xm = maxDefX(a, L);
  if (a > 0 && a < L) { y.dot(xm, -defl(xm, a, L) / dm, { color: 'c', r: 5 }); y.text('いちばん下がる所', xm, -defl(xm, a, L) / dm - 0.22, { size: 14, color: 'c', align: 'center' }); }
  y.line([[a, 0.1], [a, -1.2]], { color: 'b', width: 1, style: 'dot' });
  cv.text('（形だけ。まん中に置いたときの最大を 1 としてかいた）', 860, 425, { size: 13, color: 'sub', align: 'right' });
}
function drawTana(cv, st) {
  const w = 367.5, L = st.L, I = BB * (st.h / 1000) ** 3 / 12, EI = EB * I, Lm = 1.6, X0 = 110, Wd = 700;
  const px = Wd / Lm, Xx = x => X0 + x * px;
  // 板と分布荷重
  const yb = 55, th = Math.max(4, st.h * 0.35);
  cv.rect(Xx(0), yb - th, L * px, th, { fill: 'e', alpha: 0.5, color: 'e', width: 1 });
  cv.rect(Xx(0), yb - th - 20, L * px, 16, { fill: 'b', alpha: 0.18, color: 'b', width: 1 });
  for (let k = 0; k <= 8; k++) { const x = Xx(L * k / 8); cv.arrow(x, yb - th - 22, x, yb - th - 2, { color: 'b', width: 1.5, head: 7 }); }
  cv.text('w = 367.5 N/m', Xx(L) + 12, yb - th - 12, { size: 14, color: 'b' });
  supports(cv, Xx(0), Xx(L), yb);
  const RA = w * L / 2;
  // w, Q, M, y を同じ横の目もりで
  const rows = [[105, 'Q〔N〕', 'a'], [205, 'M〔N·m〕', 'd'], [310, 'たわみ〔mm〕', 'c']];
  const Qm = w * 1.6 / 2, Mm = w * 1.6 ** 2 / 8;
  const q = cv.view({ x0: 0, x1: Lm * 1.08, y0: -Qm, y1: Qm, box: [X0, 95, Wd * 1.08, 90] });
  q.axes({ xt: [], yt: [], yl: rows[0][1], grid: false, ax: 0 });
  q.poly([[0, 0], [0, RA], [L, -RA], [L, 0]], { fill: 'a', alpha: 0.15 }); q.line([[0, 0], [0, RA], [L, -RA], [L, 0]], { color: 'a', width: 2.5 });
  q.text(A.num(RA, 1), 0.04, RA + Qm * 0.18, { size: 14, color: 'a' });
  const m = cv.view({ x0: 0, x1: Lm * 1.08, y0: 0, y1: Mm * 1.15, box: [X0, 195, Wd * 1.08, 95] });
  m.axes({ xt: [], yt: [], yl: rows[1][1], grid: false, ax: 0 });
  m.area(x => RA * x - w * x * x / 2, 0, L, { fill: 'd', alpha: 0.15 }); m.plot(x => RA * x - w * x * x / 2, { x0: 0, x1: L, color: 'd', width: 2.5 });
  m.text(A.num(w * L * L / 8, 1), L / 2, w * L * L / 8 + Mm * 0.12, { size: 14, color: 'd', align: 'center' });
  // たわみ：y ＝ w/(24EI)(L³x − 2Lx³ + x⁴)
  const dmax = 5 * w * L ** 4 / (384 * EI) * 1000, Dm = Math.max(5, Math.min(60, Math.ceil(dmax * 1.15)));
  const y = cv.view({ x0: 0, x1: Lm * 1.08, y0: -Dm, y1: Dm * 0.12, box: [X0, 305, Wd * 1.08, 115] });
  y.axes({ xt: A.range(0.2, 1.6, 0.2), yt: [], xl: 'x〔m〕', yl: rows[2][1], grid: false, ax: 0, xfmt: v => A.num(v, 1) });
  y.plot(x => -w / (24 * EI) * (L ** 3 * x - 2 * L * x ** 3 + x ** 4) * 1000, { x0: 0, x1: L, color: 'c', width: 3 });
  y.dot(L / 2, -dmax, { color: 'c', r: 5 }); y.text(A.num(dmax, 2) + ' mm', L / 2 + 0.03, -dmax - Dm * 0.05, { size: 14, color: 'c' });
  // まん中の目もり（このグラフのたての目もり）
  y.text('↕ ' + Dm + ' mm', Lm * 1.06, -Dm * 0.5, { size: 13, color: 'sub', align: 'right' });
}
