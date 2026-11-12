// @id m2-07
// @title 《切|き》って《動|うご》かす：《面積|めんせき》と《体積|たいせき》で《見|み》る《式|しき》
// @vol 数学3
// @uses 3d
// @from 数学 3-8③④⑤⑩（ch3-08:213・245・287・383・681）・4-4②（ch4-04:251）・4-5①（ch4-05:128）／3-9⑥・3-10⑥、5-4 でも使う
'use strict';
// 本の数：(a+b)² で a=10・b=3（100+60+9=169）、101×99=9999、x²+6x+10=(x+3)²+1、(a+b)³ で a=10・b=1（1331）、
//          平行四辺形は底辺6・高さ4（24 マス）
const nn = v => A.num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1);
const ease = u => { u = A.clamp(u, 0, 1); return u * u * (3 - 2 * u); };
const stepS = (st, dt, sp = 0.22) => { st.s = Math.min(1, st.s + dt * sp); if (st.s >= 1) return false; };
A.item({
  id: 'm2-07', title: '《切|き》って《動|うご》かす：《面積|めんせき》と《体積|たいせき》で《見|み》る《式|しき》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-8③④⑤⑩「2《乗|じょう》の《展開|てんかい》」「《和|わ》と《差|さ》の《積|せき》」「《立方体|りっぽうたい》で《見|み》る $(a+b)^3$」「《平方完成|へいほうかんせい》」、《第|だい》4《巻|かん》 4-4②・4-5① の《図|ず》から（《第|だい》5《巻|かん》 5-4 でも《使|つか》う）',
  W: 880, H: 440,
  state: { a: 10, b: 3, s: 0, x: 5, p: 6, yaw: -38, pitch: 24, mode: 'sanhei' },
  scenes: [
    {
      key: 'nijou', label: '① $(a+b)^2$',
      lead: '1《辺|ぺん》 $a+b$ の《正方形|せいほうけい》を、たてと《横|よこ》の《線|せん》で《切|き》りはなします。▶ を《押|お》すと、《部品|ぶひん》が《分|わ》かれます。',
      note: '《大|おお》きな《正方形|せいほうけい》 $a^2$、《細長|ほそなが》い《長方形|ちょうほうけい》 $ab$ が2まい、《小|ちい》さな《正方形|せいほうけい》 $b^2$ に《分|わ》かれます。$(a+b)^2=a^2+2ab+b^2$。まん《中|なか》の「2」は、《長方形|ちょうほうけい》 $ab$ が2まいあることです。',
      miss: '$(a+b)^2=a^2+b^2$ としてしまうのはまちがい。まん《中|なか》の $2ab$（《長方形|ちょうほうけい》2まい）をわすれないこと。',
      legend: [['$a^2$', { color: 'a', shape: 'square' }], ['$ab$（2まい）', { color: 'b', style: 'dash', shape: 'square' }], ['$b^2$', { color: 'd', style: 'dot', shape: 'square' }]],
      controls: [{ range: 'a', label: '$a$', min: 1, max: 12, step: 1, d: 0 }, { range: 'b', label: '$b$', min: 1, max: 8, step: 1, d: 0 }],
      init(st) { st.a = 10; st.b = 3; st.s = 0; },
      step: (st, dt) => stepS(st, dt),
      draw(cv, st) { drawSq(cv, st); },
      readout: st => { const a = st.a, b = st.b; return `$(${a}+${b})^2=${(a + b) ** 2}$　　$a^2+2ab+b^2=${a * a}+${2 * a * b}+${b * b}=${a * a + 2 * a * b + b * b}$`; }
    },
    {
      key: 'wasa', label: '② $(a+b)(a-b)$',
      lead: '1《辺|ぺん》 $a$ の《正方形|せいほうけい》から、《角|かど》の $b^2$ をとった《形|かたち》です。▶ を《押|お》すと、《上|うえ》のオレンジの《長方形|ちょうほうけい》が90°《回|まわ》って、《右|みぎ》へ《移|うつ》ります。',
      note: '《左|ひだり》の《形|かたち》の《面積|めんせき》は $a^2-b^2$。オレンジを90°《回|まわ》して《右|みぎ》にならべると、《横|よこ》 $a+b$・たて $a-b$ の《長方形|ちょうほうけい》になります。《面積|めんせき》は《変|か》わらないので、$(a+b)(a-b)=a^2-b^2$。《暗算|あんざん》にも《使|つか》えます：$101\\times99=(100+1)(100-1)=10000-1=9999$。',
      legend: [['$a(a-b)$', { color: 'a', shape: 'square' }], ['$b(a-b)$（《回|まわ》して《移|うつ》す）', { color: 'b', style: 'dash', shape: 'square' }], ['とった《角|かど》 $b^2$', { color: 'd', style: 'dot' }]],
      controls: [{ range: 'a', label: '$a$', min: 3, max: 12, step: 1, d: 0, on: st => { if (st.b >= st.a) st.b = st.a - 1; } }, { range: 'b', label: '$b$', min: 1, max: 8, step: 1, d: 0, on: st => { if (st.b >= st.a) st.a = st.b + 1; } }],
      init(st) { st.a = 10; st.b = 3; st.s = 0; },
      step: (st, dt) => stepS(st, dt),
      draw(cv, st) { drawWasa(cv, st); },
      readout: st => { const a = st.a, b = st.b; return `$a^2-b^2=${a * a}-${b * b}=${a * a - b * b}$　　$(a+b)(a-b)=${a + b}\\times${a - b}=${(a + b) * (a - b)}$`; }
    },
    {
      key: 'heihou', label: '③ 《平方完成|へいほうかんせい》',
      lead: '$x^2+6x$ を《図|ず》にします。▶ を《押|お》すと、$6x$ の《長方形|ちょうほうけい》を《半分|はんぶん》に《切|き》って2《辺|へん》にはりつけ、《欠|か》けた《角|かど》をうめます。',
      note: '$x^2+6x$ に9をたすと、1《辺|ぺん》 $x+3$ の《大|おお》きな《正方形|せいほうけい》が《完成|かんせい》します。うめた9は《本当|ほんとう》はないものなので、あとで《返|かえ》します：$x^2+6x+10=(x+3)^2-9+10=(x+3)^2+1$。3は「$x$ の《係数|けいすう》6の《半分|はんぶん》」で、9はその2《乗|じょう》です。',
      miss: 'たした9を《返|かえ》しわすれると、$x^2+6x+10=(x+3)^2+10$ になってしまいます。$x=0$ を《入|い》れて、もとの《式|しき》（10）と《合|あ》うか《確|たし》かめましょう。',
      legend: [['$x^2$', { color: 'a', shape: 'square' }], ['$6x$ を《半分|はんぶん》に《切|き》った $3x$', { color: 'b', style: 'dash', shape: 'square' }], ['うめた《角|かど》 $3\\times3=9$', { color: 'd', style: 'dot', shape: 'square' }]],
      controls: [{ range: 'x', label: '$x$', min: 2, max: 10, step: 1, d: 0 }, { range: 'p', label: '$x$ の《係数|けいすう》', min: 2, max: 10, step: 2, d: 0 }],
      init(st) { st.x = 5; st.p = 6; st.s = 0; },
      step: (st, dt) => stepS(st, dt, 0.18),
      draw(cv, st) { drawHei(cv, st); },
      readout: st => { const x = st.x, p = st.p, h = p / 2; return `$x^2+${p}x=${x * x}+${p * x}=${x * x + p * x}$　　$(x+${h})^2-${h * h}=${(x + h) ** 2}-${h * h}=${(x + h) ** 2 - h * h}$`; }
    },
    {
      key: 'cube', label: '④ $(a+b)^3$',
      lead: '1《辺|ぺん》 $a+b$ の《立方体|りっぽうたい》を、《色|いろ》ごとに《引|ひ》きはなします。《図|ず》はドラッグで《回|まわ》せます。▶ で《引|ひ》きはなします。',
      note: '《青|あお》い《立方体|りっぽうたい》 $a^3$、うすい《板|いた》（オレンジ）が3まいで $3a^2b$、《細|ほそ》い《角柱|かくちゅう》（《緑|みどり》）が3《本|ぼん》で $3ab^2$、《小|ちい》さな《立方体|りっぽうたい》（《紫|むらさき》）が $b^3$。《板|いた》が3まい、《角柱|かくちゅう》が3《本|ぼん》あるのが、《式|しき》の「3」です：$(a+b)^3=a^3+3a^2b+3ab^2+b^3$。',
      legend: [['$a^3$（1こ）', { color: 'a', shape: 'square' }], ['《板|いた》 $a^2b$（3まい）', { color: 'b', shape: 'square' }], ['《角柱|かくちゅう》 $ab^2$（3《本|ぼん》）', { color: 'c', shape: 'square' }], ['$b^3$（1こ）', { color: 'd', shape: 'square' }]],
      controls: [{ range: 'a', label: '$a$', min: 1, max: 10, step: 1, d: 0 }, { range: 'b', label: '$b$', min: 1, max: 5, step: 1, d: 0 }, { range: 's', label: '《引|ひ》きはなす', min: 0, max: 1, step: 0.01, d: 2 }],
      init(st) { st.a = 3; st.b = 1; st.s = 0; st.yaw = -38; st.pitch = 24; },
      step: (st, dt) => stepS(st, dt, 0.3),
      drag: A.rotDrag([0, 0, 880, 440]),
      draw(cv, st) { drawCube(cv, st); },
      readout: st => { const a = st.a, b = st.b; return `$(${a}+${b})^3=${(a + b) ** 3}$　　$a^3+3a^2b+3ab^2+b^3=${a ** 3}+${3 * a * a * b}+${3 * a * b * b}+${b ** 3}=${a ** 3 + 3 * a * a * b + 3 * a * b * b + b ** 3}$`; }
    },
    {
      key: 'kitte', label: '⑤ 《三平方|さんへいほう》・《平行四辺形|へいこうしへんけい》（《第|だい》4《巻|かん》）',
      lead: '《同|おな》じ《形|かたち》を、《切|き》ったり、ならべかえたりしても、《面積|めんせき》は《変|か》わりません。▶ で《動|うご》かしてみましょう。',
      note: '**《三平方|さんへいほう》**：《同|おな》じ《板|いた》に、《同|おな》じ《直角|ちょっかく》《三角形|さんかくけい》を4まいずつ《置|お》きます。かくれていない《部分|ぶぶん》は、《左|ひだり》は $c^2$、《右|みぎ》は $a^2$ と $b^2$。だから $a^2+b^2=c^2$。**《平行四辺形|へいこうしへんけい》**：《左|ひだり》はしの《三角形|さんかくけい》を《右|みぎ》はしへ《移|うつ》すと、たて4・《横|よこ》6の《長方形|ちょうほうけい》。《面積|めんせき》は $6\\times4=24$ マス。',
      legend: [['《動|うご》かす《三角形|さんかくけい》', { color: 'sub', shape: 'tri' }], ['$c^2$', { color: 'c', style: 'dash', shape: 'square' }], ['$a^2$', { color: 'a', shape: 'square' }], ['$b^2$', { color: 'b', style: 'dot', shape: 'square' }]],
      controls: [{ seg: 'mode', label: '《見|み》るもの', options: [['sanhei', '《三平方|さんへいほう》の《定理|ていり》'], ['heikou', '《平行四辺形|へいこうしへんけい》']], on: st => { st.s = 0; } }, { range: 'b', label: '$b$（《三平方|さんへいほう》）', min: 1, max: 4, step: 0.5, d: 1 }],
      init(st) { st.a = 4; st.b = 2; st.s = 0; st.mode = 'sanhei'; },
      step: (st, dt) => stepS(st, dt, 0.2),
      draw(cv, st) { if (st.mode === 'heikou') drawHeikou(cv, st); else drawSan(cv, st); },
      readout: st => st.mode === 'heikou' ? '《平行四辺形|へいこうしへんけい》の《面積|めんせき》＝《底辺|ていへん》×《高|たか》さ＝$6\\times4=24$（マス）' : `$a=${nn(st.a)}$、$b=${nn(st.b)}$：$a^2+b^2=${nn(st.a * st.a)}+${nn(st.b * st.b)}=${nn(st.a * st.a + st.b * st.b)}=c^2$`
    }
  ]
});

// ---- 2次元の部品 ----
function piece(v, x, y, w, h, col, style, lab, o = {}) {
  v.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill: col, alpha: o.alpha == null ? 0.28 : o.alpha, color: col, style, width: 2.5 });
  if (lab && Math.min(w, h) * v.sx > 18) v.text(lab, x + w / 2, y + h / 2, { align: 'center', size: o.size || 17, math: true, italic: true, bold: true });
}
function drawSq(cv, st) {
  const a = st.a, b = st.b, g = ease(st.s) * (a + b) * 0.12, L = a + b;
  const v = cv.view({ x0: -1, x1: L * 2.2, y0: -L * 0.25, y1: L * 1.18, box: [20, 16, 840, 408], equal: true });
  // 部品（左下が原点、上へ＋）
  piece(v, 0, b + g, a, a, 'a', 'solid', 'a²');
  piece(v, a + g, b + g, b, a, 'b', 'dash', 'ab');
  piece(v, 0, 0, a, b, 'b', 'dash', 'ab');
  piece(v, a + g, 0, b, b, 'd', 'dot', 'b²', { size: 15 });
  // 寸法
  const ty = L + g + L * 0.06;
  v.text('a', a / 2, ty, { align: 'center', size: 17, math: true, italic: true }); v.text('b', a + g + b / 2, ty, { align: 'center', size: 17, math: true, italic: true });
  v.text('a', -0.4, b + g + a / 2, { align: 'right', size: 17, math: true, italic: true }); v.text('b', -0.4, b / 2, { align: 'right', size: 17, math: true, italic: true });
  // 右：数で
  const X = v.X(L * 1.35);
  cv.text(`${a * a} ＋ ${a * b} ＋ ${a * b} ＋ ${b * b}`, X, 150, { size: 18 });
  cv.text(`＝ ${(a + b) ** 2}`, X, 186, { size: 18, bold: true });
  cv.text(`（${a + b} × ${a + b} の せいほうけい）`, X, 222, { size: 15, color: 'sub' });
}
function drawWasa(cv, st) {
  const a = st.a, b = st.b, u = ease(st.s), L = a + b;
  const v = cv.view({ x0: -1.5, x1: L + 2, y0: -2, y1: a + 1.5, box: [30, 16, 820, 408], equal: true });
  // 青：横 a、たて a−b
  piece(v, 0, 0, a, a - b, 'a', 'solid', 'a(a−b)');
  // とった角 b²
  if (u < 0.05) v.poly([[a - b, a - b], [a, a - b], [a, a], [a - b, a]], { color: 'd', style: 'dot', width: 2 });
  if (u < 0.05) v.text('b²', a - b / 2, a - b / 2, { align: 'center', size: 16, math: true, italic: true, color: 'd' });
  // オレンジ：横 a−b、たて b。中心を動かしながら 90° 回す
  const c0 = [(a - b) / 2, (a - b) + b / 2], c1 = [a + b / 2, (a - b) / 2];
  const rot = A.clamp(u * 1.6, 0, 1) * Math.PI / 2, mv = ease(A.clamp((u - 0.25) / 0.75, 0, 1));
  const c = [A.lerp(c0[0], c1[0], mv), A.lerp(c0[1], c1[1], mv) + Math.sin(Math.PI * mv) * b * 0.8];
  const hw = (a - b) / 2, hh = b / 2, co = Math.cos(rot), si = Math.sin(rot);
  const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [c[0] + x * co - y * si, c[1] + x * si + y * co]);
  v.poly(pts, { fill: 'b', alpha: 0.3, color: 'b', style: 'dash', width: 2.5 });
  if (b * v.sx > 22) v.text('b(a−b)', c[0], c[1], { align: 'center', size: 15, math: true, italic: true, bold: true });
  // 寸法
  v.text(`a＝${a}`, a / 2, -0.9, { align: 'center', size: 16 });
  if (u > 0.98) { v.text(`a＋b＝${a + b}`, L / 2, -1.6, { align: 'center', size: 16, bold: true }); v.text(`a−b＝${a - b}`, L + 0.4, (a - b) / 2, { size: 16, bold: true }); }
  else v.text(`a＝${a}`, -0.4, a / 2, { align: 'right', size: 16 });
}
function drawHei(cv, st) {
  const x = st.x, p = st.p, h = p / 2, s = st.s;
  const u1 = ease(s / 0.3), u2 = ease((s - 0.3) / 0.4), u3 = ease((s - 0.75) / 0.25);
  const L = x + p;
  const v = cv.view({ x0: -1.5, x1: L + 5, y0: -h - 1.5, y1: x + 1.8, box: [20, 16, 840, 408], equal: true });
  // x² は左上（たて x：y=0〜x）
  piece(v, 0, 0, x, x, 'a', 'solid', 'x²');
  // 6x を半分に切る：右の 3x はそのまま、もう1まい（右はし）を回して下へ
  const gap = u1 * 0.5;
  piece(v, x, 0, h, x, 'b', 'dash', h + 'x');
  // 2まいめ：はじめは x+h〜x+p。動かすと、x 軸の下（たて h、横 x）へ
  const c0 = [x + h + h / 2 + gap, x / 2], c1 = [x / 2, -h / 2];
  const rot = u2 * Math.PI / 2, c = [A.lerp(c0[0], c1[0], u2), A.lerp(c0[1], c1[1], u2)];
  const hw = h / 2, hh = x / 2, co = Math.cos(rot), si = Math.sin(rot);
  const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([X, Y]) => [c[0] + X * co - Y * si, c[1] + X * si + Y * co]);
  v.poly(pts, { fill: 'b', alpha: 0.28, color: 'b', style: 'dash', width: 2.5 });
  if (h * v.sx > 22) v.text(h + 'x', c[0], c[1], { align: 'center', size: 17, math: true, italic: true, bold: true });
  // 欠けた角
  if (s > 0.7) {
    v.poly([[x, -h], [x + h, -h], [x + h, 0], [x, 0]], { fill: 'd', alpha: 0.3 * u3, color: 'd', style: 'dot', width: 2.5 });
    v.text(u3 > 0.5 ? String(h * h) : '？', x + h / 2, -h / 2, { align: 'center', size: 17, bold: true, color: 'd' });
  }
  // 寸法
  v.text('x', x / 2, x + 0.7, { align: 'center', size: 17, math: true, italic: true });
  v.text(s < 0.3 ? String(p) : String(h), s < 0.3 ? x + p / 2 : x + h / 2, x + 0.7, { align: 'center', size: 17 });
  if (u3 > 0.98) {
    v.poly([[0, -h], [x + h, -h], [x + h, x], [0, x]], { color: 'ink', width: 3 });
    cv.text(`1へん x＋${h} の せいほうけい`, v.X(x + h + 1), v.Y(x / 2), { size: 16, bold: true });
    cv.text(`x²＋${p}x＋${h * h}＝(x＋${h})²`, v.X(x + h + 1), v.Y(x / 2) + 30, { size: 17, math: true });
  }
}

// ---- 3次元の箱：見えている面だけを描く ----
function box3(V, x, y, z, dx, dy, dz, col) {
  const P = (i, j, k) => [x + i * dx, y + j * dy, z + k * dz];
  const faces = [
    [[P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)], [-1, 0, 0]], [[P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], [1, 0, 0]],
    [[P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], [0, -1, 0]], [[P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)], [0, 1, 0]],
    [[P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], [0, 0, -1]], [[P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], [0, 0, 1]]
  ];
  const cx = x + dx / 2, cy = y + dy / 2, cz = z + dz / 2;
  for (const [pts, n] of faces) {
    const c = pts.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4, s[2] + p[2] / 4], [0, 0, 0]);
    if (V.P([c[0] + n[0] * 0.01, c[1] + n[1] * 0.01, c[2] + n[2] * 0.01])[2] <= V.P(c)[2]) continue;
    // 色はぬりつぶし（すけない）、面の向きで少しだけ暗くする
    const shade = n[2] > 0 ? 0 : n[0] !== 0 ? 0.18 : 0.32;
    V.poly3(pts, { fill: col, alpha: 1, zbias: 0 });
    if (shade) V.poly3(pts, { fill: '#000', alpha: shade, zbias: 0.001 });
    V.poly3(pts, { color: 'ink', width: 1.2, zbias: 0.002 });
    void cx; void cy; void cz;
  }
}
function drawCube(cv, st) {
  const a = st.a, b = st.b, L = a + b, g = ease(st.s) * L * 0.35;
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 150 / L, center: [L / 2 + g / 2, L / 2 + g / 2, L / 2 + g / 2], persp: 0 });
  // 部品：はじめの位置と、a より先にあるかどうか（ある向きへ g だけ離す）
  const parts = [
    [0, 0, 0, a, a, a, 'a'],
    [0, 0, a, a, a, b, 'b'], [a, 0, 0, b, a, a, 'b'], [0, a, 0, a, b, a, 'b'],
    [a, a, 0, b, b, a, 'c'], [a, 0, a, b, a, b, 'c'], [0, a, a, a, b, b, 'c'],
    [a, a, a, b, b, b, 'd']
  ];
  // 奥から手前へ：箱ごとに奥行きで並べてから描く
  const items = parts.map(([x, y, z, dx, dy, dz, col]) => {
    const ox = x >= a ? g : 0, oy = y >= a ? g : 0, oz = z >= a ? g : 0;
    const c = V.P([x + ox + dx / 2, y + oy + dy / 2, z + oz + dz / 2]);
    return { d: c[2], f: () => { const W = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 150 / L, center: [L / 2 + g / 2, L / 2 + g / 2, L / 2 + g / 2], persp: 0 }); box3(W, x + ox, y + oy, z + oz, dx, dy, dz, col); W.flush(); } };
  });
  items.sort((p, q) => p.d - q.d).forEach(it => it.f());
  // 寸法（はじめの形のとき）
  if (st.s < 0.05) {
    const T = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 150 / L, center: [L / 2, L / 2, L / 2], persp: 0 });
    T.text3('a', [a / 2, -L * 0.08, 0], { size: 17, math: true, italic: true, bold: true, align: 'center' });
    T.text3('b', [a + b / 2, -L * 0.08, 0], { size: 17, math: true, italic: true, bold: true, align: 'center' });
    T.flush();
  }
}

// ---- 第4巻：三平方と平行四辺形 ----
function tri(v, P, th, a, b, o) {
  const co = Math.cos(th), si = Math.sin(th), m = ([x, y]) => [P[0] + x * co - y * si, P[1] + x * si + y * co];
  v.poly([m([0, 0]), m([a, 0]), m([0, b])], o);
}
function drawSan(cv, st) {
  const a = st.a, b = st.b, L = a + b, u = st.s;
  const v = cv.view({ x0: -1, x1: L * 2 + 3, y0: -1.6, y1: L + 0.8, box: [20, 10, 840, 410], equal: true });
  const O1 = [0, 0], O2 = [L + 2, 0];
  const plate = O => v.poly([[O[0], O[1]], [O[0] + L, O[1]], [O[0] + L, O[1] + L], [O[0], O[1] + L]], { color: 'ink', width: 3 });
  // 左：c² の正方形
  const sq = O => [[O[0] + a, O[1]], [O[0] + L, O[1] + a], [O[0] + b, O[1] + L], [O[0], O[1] + b]];
  v.poly(sq(O1), { fill: 'c', alpha: 0.25, color: 'c', style: 'dash', width: 2 });
  v.text('c²', O1[0] + L / 2, O1[1] + L / 2, { align: 'center', size: 20, math: true, italic: true, bold: true });
  // 右：a² と b²
  v.poly([[O2[0], O2[1] + b], [O2[0] + a, O2[1] + b], [O2[0] + a, O2[1] + L], [O2[0], O2[1] + L]], { fill: 'a', alpha: 0.22, color: 'a', width: 2 });
  v.poly([[O2[0] + a, O2[1]], [O2[0] + L, O2[1]], [O2[0] + L, O2[1] + b], [O2[0] + a, O2[1] + b]], { fill: 'b', alpha: 0.22, color: 'b', style: 'dot', width: 2 });
  v.text('a²', O2[0] + a / 2, O2[1] + b + a / 2, { align: 'center', size: 20, math: true, italic: true, bold: true });
  v.text('b²', O2[0] + a + b / 2, O2[1] + b / 2, { align: 'center', size: 18, math: true, italic: true, bold: true });
  plate(O1); plate(O2);
  // 4まいの三角形：左の置き方 → 右の置き方（向きは同じで、すべらせるだけ）
  const from = [[0, 0], [L, 0], [L, L], [0, L]], to = [[0, 0], [L, b], [a, b], [a, L]], th = [0, 90, 180, 270];
  for (let k = 0; k < 4; k++) {
    // 左の板の三角形は、そのまま。右の板へ、同じ三角形を1まいずつすべらせて置く
    tri(v, [O1[0] + from[k][0], O1[1] + from[k][1]], th[k] * Math.PI / 180, a, b, { fill: 'sub', alpha: 0.45, color: 'ink', width: 1.5 });
    const w = ease((u - k * 0.2) / 0.3);
    if (w <= 0) continue;
    const P = [A.lerp(O1[0] + from[k][0], O2[0] + to[k][0], w), A.lerp(O1[1] + from[k][1], O2[1] + to[k][1], w) + Math.sin(Math.PI * w) * 1.2];
    tri(v, P, th[k] * Math.PI / 180, a, b, { fill: 'sub', alpha: 0.55, color: 'ink', width: 1.5 });
  }
  v.text('ひだりの おきかた', O1[0] + L / 2, -1.0, { align: 'center', size: 15, color: 'sub' });
  v.text('みぎの おきかた', O2[0] + L / 2, -1.0, { align: 'center', size: 15, color: 'sub' });
}
function drawHeikou(cv, st) {
  const u = ease(st.s);
  const v = cv.view({ x0: -0.5, x1: 8.5, y0: -1.2, y1: 4.6, box: [40, 10, 800, 410], equal: true });
  for (let i = 0; i <= 8; i++) v.line([[i, 0], [i, 4]], { color: 'grid', width: 1 });
  for (let j = 0; j <= 4; j++) v.line([[0, j], [8, j]], { color: 'grid', width: 1 });
  v.poly([[2, 0], [6, 0], [8, 4], [2, 4]], { fill: 'a', alpha: 0.22 });
  if (u < 0.02) v.poly([[0, 0], [6, 0], [8, 4], [2, 4]], { color: 'ink', width: 3 });
  const dx = 6 * u, lift = Math.sin(Math.PI * u) * 0.8;
  v.poly([[0 + dx, lift], [2 + dx, lift], [2 + dx, 4 + lift]], { fill: 'b', alpha: 0.4, color: 'b', width: 2.5 });
  v.line([[2, 0], [2, 4]], { color: 'b', style: 'dash', width: 2 });
  if (u > 0.98) v.poly([[2, 0], [8, 0], [8, 4], [2, 4]], { color: 'ink', width: 3 });
  v.text(u > 0.98 ? 'よこ 6' : 'ていへん 6', u > 0.98 ? 5 : 3, -0.5, { align: 'center', size: 16 });
  v.text(u > 0.98 ? 'たて 4' : 'たかさ 4', 2.15, 2, { size: 16, color: 'b', bg: true });
}
