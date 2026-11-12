// @id m2-15
// @title あいだの角と3つめの辺：三平方から余弦定理・合力へ
// @vol 数学4
// @from 数学 4-4 ①（ch4-04:200）、4-7 ④（ch4-07:465）、4-10 ⑤（ch4-10:342・382）／4-11、力-2 でも使う
'use strict';
const R15 = Math.PI / 180;
A.item({
  id: 'm2-15', title: 'あいだの角と3つめの辺：三平方から余弦定理・合力へ',
  from: '数学 第4巻 4-4 ①「直角でないと、どうなる？」、4-7 ④「余弦定理」、4-10 ⑤「合力の大きさ」の図から（4-11、物理 力-2 でも使う）',
  W: 880, H: 420,
  state: { C: 90, th: 60, pair: 'small', wrong: false, c: 5 },
  scenes: [
    {
      key: 'yogen', label: '① 開く角と3つめの辺',
      lead: '長さ 3 と 4 の2辺のあいだの角 $C$ を、コンパスのように開いていきます。3つめの辺 $c$（点線）はどう変わるでしょう。',
      note: '$c^2=a^2+b^2-2ab\\cos C$（余弦定理）。$C=90°$ なら $\\cos C=0$ で三平方の定理 $c^2=25$ にもどります。$C$ が 90° より小さいと $c$ は 5 より短く、大きいと長くなります。$-2ab\\cos C$ は、直角からのずれを直す部分です。',
      legend: [['長さ 3 の辺 $a$', { color: 'ink' }], ['長さ 4 の辺 $b$', { color: 'a' }], ['3つめの辺 $c$', { color: 'b', style: 'dash' }], ['$-2ab\\cos C$（直角からのずれ）', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'C', label: 'あいだの角 $C$', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°' }],
      init(st) { st.C = 0; },
      step(st, dt) { st.C = Math.min(180, st.C + dt * 30); if (st.C >= 180) return false; },
      draw(cv, st) { drawYogen(cv, st); },
      readout: st => { const c2 = 25 - 24 * Math.cos(st.C * R15); return `$c^2$ ＝ 9 ＋ 16 − 24 × cos ${Math.round(st.C)}° ＝ 25 ${c2 >= 25 ? '＋' : '−'} ${A.num(Math.abs(25 - c2), 2)} ＝ ${A.num(c2, 2)}　　$c$ ＝ <b>${A.num(Math.sqrt(Math.max(0, c2)), 2)}</b>`; }
    },
    {
      key: 'gouryoku', label: '② 2つの力の合力',
      lead: '2つの力のあいだの角を変えると、合力（平行四辺形の対角線）の大きさはどう変わるでしょう。',
      note: '合力は、$\\vec a$ の先に $\\vec b$ をつないだ三角形の、3つめの辺です。その三角形の中の角は $180°-\\theta$ なので、$|\\vec a+\\vec b|^2=|\\vec a|^2+|\\vec b|^2-2|\\vec a||\\vec b|\\cos(180°-\\theta)$。向きがそろうほど合力は大きく、開くほど小さくなります。',
      miss: '合力で、力のあいだの角 $\\theta$ をそのまま余弦定理に入れてはいけません。使うのは三角形の中の角 $180°-\\theta$ です。「まちがいの式」をオンにすると、×の答えが片方の力より小さくなることがわかります。',
      legend: [['力 $\\vec a$', { color: 'a' }], ['力 $\\vec b$（つないだもの）', { color: 'e', style: 'dash' }], ['合力 $\\vec a+\\vec b$', { color: 'b' }], ['まちがいの式の長さ', { color: 'sub', style: 'dot' }]],
      controls: [
        { range: 'th', label: '力のあいだの角 $\\theta$', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°' },
        { seg: 'pair', label: '力の組', options: [['small', '5 N と 3 N（4-10）'], ['big', '30 N と 40 N（4-7）']] },
        { check: 'wrong', label: '比べる', text: 'まちがいの式（$\\cos\\theta$ を使う）も表示' }
      ],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = Math.min(180, st.th + dt * 30); if (st.th >= 180) return false; },
      draw(cv, st) { drawGou(cv, st); },
      readout: st => { const [a, b] = pair(st), t = st.th * R15, R = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(t)); return `$R^2$ ＝ ${a * a} ＋ ${b * b} − ${2 * a * b} × cos ${Math.round(180 - st.th)}° ＝ ${A.num(R * R, 1)}　　合力 <b>${A.num(R, 2)} N</b>（${a} ＋ ${b} ＝ ${a + b} より大きくならない）`; }
    },
    {
      key: 'fugou', label: '③ 3辺から角',
      lead: '2辺 3 と 5 はそのままにして、向かいの辺 $c$ を長くしていきます。$\\cos C$ の符号と角 $C$ はどう変わるでしょう。',
      note: '$\\cos C=\\dfrac{a^2+b^2-c^2}{2ab}$。$c^2$ が $a^2+b^2=34$ より小さいと $\\cos C$ は正で鋭角、等しいと 0 で直角、大きいと負で鈍角です。',
      miss: '鈍角の $\\cos$ は負です。$\\cos120°=0.5$ として計算すると、鈍角の三角形なのに向かいの辺が短くなってしまいます。',
      legend: [['$a=3$', { color: 'ink' }], ['$b=5$', { color: 'a' }], ['向かいの辺 $c$', { color: 'b', style: 'dash' }]],
      controls: [
        { range: 'c', label: '向かいの辺 $c$', min: 2.2, max: 7.8, step: 0.01, d: 2 },
        { button: '$c=5$', act: st => { st.c = 5; } }, { button: '$c=\\sqrt{34}$', act: st => { st.c = Math.sqrt(34); } }, { button: '$c=7$', act: st => { st.c = 7; } }
      ],
      init(st) { st.c = 5; },
      draw(cv, st) { drawFugou(cv, st); },
      readout: st => { const k = (34 - st.c * st.c) / 30; return `$\\cos C$ ＝ (9 ＋ 25 − ${A.num(st.c * st.c, 2)}) ÷ 30 ＝ <b>${A.num(k, 3)}</b>　→　$C$ ＝ ${A.num(Math.acos(A.clamp(k, -1, 1)) / R15, 1)}°`; }
    }
  ]
});

function pair(st) { return st.pair === 'big' ? [30, 40] : [5, 3]; }
function arcD(v, cx, cy, r, a0, a1, o) {
  const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 3)), pts = [];
  for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * R15; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  v.line(pts, o);
}
function lab(v, s, x, y, o) { v.text(s, x, y, Object.assign({ size: 16, align: 'center', bg: true }, o)); }

function drawYogen(cv, st) {
  const v = cv.view({ x0: -4.6, x1: 3.8, y0: -0.8, y1: 4.6, box: [16, 16, 470, 380], equal: true });
  const t = st.C * R15, Ax = 4 * Math.cos(t), Ay = 4 * Math.sin(t);
  // 目安の角（60°・90°・120°）の、うすい線
  for (const g of [60, 90, 120]) v.line([[0, 0], [4 * Math.cos(g * R15), 4 * Math.sin(g * R15)]], { color: 'grid', width: 1.5 });
  arcD(v, 0, 0, 4, 0, 180, { color: 'grid', width: 1 });
  v.poly([[0, 0], [3, 0], [Ax, Ay]], { fill: Math.abs(st.C - 90) < 0.5 ? 'c' : st.C < 90 ? 'a' : 'b', alpha: 0.1 });
  v.line([[3, 0], [Ax, Ay]], { color: 'b', style: 'dash', width: 3 });
  v.line([[0, 0], [3, 0]], { color: 'ink', width: 4 });
  v.line([[0, 0], [Ax, Ay]], { color: 'a', width: 4 });
  if (st.C > 2) arcD(v, 0, 0, 0.6, 0, st.C, { color: 'ink', width: 1.5 });
  if (Math.abs(st.C - 90) < 0.5) v.line([[0.35, 0], [0.35, 0.35], [0, 0.35]], { color: 'ink', width: 1.5 });
  v.dot(0, 0, { r: 4 }); v.dot(3, 0, { r: 4 }); v.dot(Ax, Ay, { r: 5, color: 'a' });
  lab(v, 'C', -0.25, -0.35, { color: 'sub' });
  lab(v, Math.round(st.C) + '°', 0.95 * Math.cos(t / 2 + 0.05), 0.95 * Math.sin(t / 2 + 0.05) + 0.05, { size: 15 });
  lab(v, 'a ＝ 3', 1.5, -0.4);
  lab(v, 'b ＝ 4', 2 * Math.cos(t) - 0.45 * Math.sin(t), 2 * Math.sin(t) + 0.45 * Math.cos(t), { color: 'a' });
  const c = Math.sqrt(Math.max(0, 25 - 24 * Math.cos(t)));
  lab(v, 'c ＝ ' + A.num(c, 2), (3 + Ax) / 2 + 0.55, (Ay) / 2 + 0.3, { color: 'b' });
  // 右：c² の棒
  const L = 520, R = 860, s = (R - L) / 50, y0 = 70, h = 26;
  const bar = (y, val, o) => cv.rect(L, y, val * s, h, o);
  cv.text('2乗でくらべる（目もり 0〜50）', L, 34, { size: 15, color: 'sub' });
  bar(y0, 9, { fill: 'ink', alpha: 0.25, color: 'ink', width: 1 }); bar(y0, 25, { color: 'ink', width: 1.5 });
  cv.rect(L + 9 * s, y0, 16 * s, h, { fill: 'a', alpha: 0.25 });
  cv.text('a² ＋ b² ＝ 9 ＋ 16 ＝ 25', L, y0 + h + 18, { size: 15 });
  const c2 = 25 - 24 * Math.cos(t), y1 = y0 + 80;
  bar(y1, Math.min(c2, 25), { fill: 'b', alpha: 0.35, color: 'b', width: 1.5 });
  if (c2 > 25) cv.rect(L + 25 * s, y1, (c2 - 25) * s, h, { fill: 'd', alpha: 0.3, color: 'd', style: 'dot', width: 2 });
  else if (c2 < 25) cv.rect(L + c2 * s, y1, (25 - c2) * s, h, { color: 'd', style: 'dot', width: 2 });
  cv.line([[L + 25 * s, y0 - 6], [L + 25 * s, y1 + h + 6]], { color: 'sub', style: 'dash', width: 1 });
  cv.text('c² ＝ ' + A.num(c2, 2), L, y1 + h + 18, { size: 15, color: 'b', bold: true });
  const k = -24 * Math.cos(t);
  cv.text('−2ab cos C ＝ −24 × ' + A.num(Math.cos(t), 3) + ' ＝ ' + (k >= 0 ? '＋' : '') + A.num(k, 2), L, y1 + h + 44, { size: 15, color: 'd' });
  // 表（4-7 の表）
  let y = 282; const cols = [L, L + 70, L + 160];
  [['C', 'cos C', 'c'], ['0°', '1', '1'], ['60°', '0.5', '√13 ≈ 3.61'], ['90°', '0', '5'], ['120°', '−0.5', '√37 ≈ 6.08'], ['180°', '−1', '7']].forEach((r, i) => {
    const near = i > 0 && Math.abs([0, 60, 90, 120, 180][i - 1] - st.C) < 0.5;
    r.forEach((s2, j) => cv.text(s2, cols[j], y, { size: 15, color: i === 0 ? 'sub' : near ? 'b' : 'ink', bold: near }));
    y += 21;
  });
}

function drawGou(cv, st) {
  const [a, b] = pair(st), S = a + b, t = st.th * R15;
  const v = cv.view({ x0: -0.55 * S, x1: 1.12 * S, y0: -0.12 * S, y1: 0.75 * S, box: [16, 16, 540, 390], equal: true });
  const B = [b * Math.cos(t), b * Math.sin(t)], Rv = [a + B[0], B[1]], R = Math.hypot(Rv[0], Rv[1]);
  v.poly([[0, 0], [a, 0], Rv, B], { fill: 'a', alpha: 0.06 });
  v.line([B, Rv], { color: 'grid', width: 1.5, style: 'dash' });
  v.poly([[0, 0], [a, 0], Rv], { fill: 'e', alpha: 0.15 });
  v.arrow(0, 0, B[0], B[1], { color: 'e', width: 2, alpha: 0.5, style: 'dash' });
  v.arrow(a, 0, Rv[0], Rv[1], { color: 'e', width: 3, style: 'dash' });
  v.arrow(0, 0, a, 0, { color: 'a', width: 3.5 });
  if (R > 0.02 * S) v.arrow(0, 0, Rv[0], Rv[1], { color: 'b', width: 4 });
  if (st.wrong) {
    const Rw = Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(t))), u = R > 1e-6 ? [Rv[0] / R, Rv[1] / R] : [1, 0];
    v.line([[0, -0.06 * S], [u[0] * Rw, u[1] * Rw - 0.06 * S]], { color: 'sub', style: 'dot', width: 3.5 });
    lab(v, '× ' + A.num(Rw, 2), u[0] * Rw * 0.55 + 0.05 * S * u[1], u[1] * Rw * 0.55 - 0.06 * S - 0.06 * S * u[0], { color: 'sub', size: 15 });
  }
  // 角
  const r1 = 0.09 * S;
  if (st.th > 1) arcD(v, 0, 0, r1, 0, st.th, { color: 'ink', width: 1.5 });
  if (st.th < 179) arcD(v, a, 0, r1 * 0.8, st.th, 180, { color: 'e', width: 2 });
  v.dot(0, 0, { r: 5 });
  lab(v, 'θ ＝ ' + Math.round(st.th) + '°', 0.2 * S * Math.cos(t / 2), 0.2 * S * Math.sin(t / 2) + 0.02 * S, { size: 15 });
  const m = (st.th + 180) / 2 * R15;
  lab(v, Math.round(180 - st.th) + '°', a + 0.17 * S * Math.cos(m), 0.17 * S * Math.sin(m), { size: 15, color: 'e' });
  lab(v, a + ' N', a / 2, -0.06 * S, { color: 'a' });
  lab(v, b + ' N', a + B[0] / 2 + 0.06 * S * Math.sin(t), B[1] / 2 - 0.06 * S * Math.cos(t) + 0.02 * S, { color: 'e' });
  if (R > 0.05 * S) lab(v, '合力 ' + A.num(R, 2) + ' N', Rv[0] / 2 - 0.08 * S * Math.sin(Math.atan2(Rv[1], Rv[0])), Rv[1] / 2 + 0.08 * S * Math.cos(Math.atan2(Rv[1], Rv[0])), { color: 'b' });
  // 右：表
  const X = 590; let y = 40;
  cv.text('合力の大きさ（N）', X, y, { size: 15, bold: true }); y += 28;
  for (const g of [0, 60, 90, 120, 180]) {
    const val = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(g * R15)), near = Math.abs(g - st.th) < 0.5;
    cv.text('θ ＝ ' + g + '°', X, y, { size: 15, color: near ? 'b' : 'ink', bold: near });
    cv.text(A.num(val, 2), X + 110, y, { size: 15, color: near ? 'b' : 'ink', bold: near }); y += 24;
  }
  y += 14;
  cv.text('三角形の中の角 ＝ 180° − θ', X, y, { size: 15, color: 'e' }); y += 26;
  cv.text('R² ＝ ' + a * a + ' ＋ ' + b * b, X, y, { size: 15 }); y += 22;
  cv.text('　 − ' + 2 * a * b + ' × cos' + Math.round(180 - st.th) + '°', X, y, { size: 15 }); y += 22;
  cv.text('　＝ ' + A.num(R * R, 1), X, y, { size: 15, bold: true }); y += 30;
  if (st.wrong) { const Rw2 = a * a + b * b - 2 * a * b * Math.cos(t); cv.text('×cos' + Math.round(st.th) + '° を使うと ' + A.num(Math.sqrt(Math.max(0, Rw2)), 2), X, y, { size: 15, color: 'sub' }); }
}

function drawFugou(cv, st) {
  const v = cv.view({ x0: -5.4, x1: 5.6, y0: -0.8, y1: 5.6, box: [16, 16, 520, 360], equal: true });
  const k = A.clamp((34 - st.c * st.c) / 30, -1, 1), C = Math.acos(k), Ax = 5 * Math.cos(C), Ay = 5 * Math.sin(C);
  const kind = Math.abs(k) < 0.004 ? 0 : k > 0 ? 1 : -1;
  v.poly([[0, 0], [3, 0], [Ax, Ay]], { fill: kind === 0 ? 'c' : kind > 0 ? 'a' : 'b', alpha: 0.12 });
  v.line([[3, 0], [Ax, Ay]], { color: 'b', style: 'dash', width: 3.5 });
  v.line([[0, 0], [3, 0]], { color: 'ink', width: 4 });
  v.line([[0, 0], [Ax, Ay]], { color: 'a', width: 4 });
  arcD(v, 0, 0, 0.7, 0, C / R15, { color: 'ink', width: 1.5 });
  if (kind === 0) v.line([[0.4, 0], [0.4, 0.4], [0, 0.4]], { color: 'ink', width: 1.5 });
  lab(v, 'C', -0.3, -0.35, { color: 'sub' });
  lab(v, A.num(C / R15, 1) + '°', 1.15 * Math.cos(C / 2), 1.15 * Math.sin(C / 2) + 0.1, { size: 15 });
  lab(v, '3', 1.5, -0.4);
  lab(v, '5', 2.5 * Math.cos(C) - 0.4 * Math.sin(C), 2.5 * Math.sin(C) + 0.4 * Math.cos(C), { color: 'a' });
  lab(v, 'c ＝ ' + A.num(st.c, 2), (3 + Ax) / 2 + 0.6, Ay / 2 + 0.3, { color: 'b' });
  // cos C のものさし
  const L = 590, R = 850, Y = 120, X = x => L + (x + 1) / 2 * (R - L);
  cv.text('cos C の値', L, 40, { size: 15, bold: true });
  cv.rect(L, Y - 10, (R - L) / 2, 20, { fill: 'b', alpha: 0.12 }); cv.rect((L + R) / 2, Y - 10, (R - L) / 2, 20, { fill: 'a', alpha: 0.12 });
  cv.line([[L, Y], [R, Y]], { color: 'sub', width: 1.5 });
  for (const m of [-1, -0.5, 0, 0.5, 1]) { cv.line([[X(m), Y - 12], [X(m), Y + 12]], { color: 'sub', width: 1 }); cv.text(A.num(m, m % 1 ? 1 : 0), X(m), Y + 26, { size: 14, align: 'center', color: 'sub' }); }
  cv.text('負', L + 10, Y - 26, { size: 15, color: 'b' }); cv.text('正', R - 10, Y - 26, { size: 15, color: 'a', align: 'right' });
  cv.dot(X(k), Y, { r: 9, shape: 'diamond', color: kind === 0 ? 'c' : kind > 0 ? 'a' : 'b' });
  const nm = kind === 0 ? '直角（cos C ＝ 0）' : kind > 0 ? '鋭角（cos C が正）' : '鈍角（cos C が負）';
  cv.text(nm, L, Y + 70, { size: 20, bold: true, color: kind === 0 ? 'c' : kind > 0 ? 'a' : 'b' });
  cv.text('c² ＝ ' + A.num(st.c * st.c, 2), L, Y + 110, { size: 16 });
  cv.text('a² ＋ b² ＝ 34 とくらべる', L, Y + 136, { size: 15, color: 'sub' });
  cv.text(st.c * st.c < 33.9 ? 'c² ＜ 34' : st.c * st.c > 34.1 ? 'c² ＞ 34' : 'c² ＝ 34', L, Y + 162, { size: 16, bold: true });
}
