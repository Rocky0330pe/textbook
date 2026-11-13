// @id m1-01
// @title かえるが《数直線|すうちょくせん》をとぶ
// @vol 数学1
// @from 数学 1-6 数直線（ch1-06）／1-3・1-4・2-2 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける
A.item({
  id: 'm1-01', title: 'かえるが《数直線|すうちょくせん》をとぶ', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-6「《数直線|すうちょくせん》」の《図|ず》から（1-3・1-4、2-2 でも つかう）',
  W: 880, H: 300,
  state: { a: 3, b: 4, hop: 0, t: 0, done: false, gap: 1 },
  scenes: [
    {
      key: 'susumu', label: '① 右へ すすむ',
      lead: 'かえるが 3 から 4 すすむと、どこに つくかな？　▶ を おしてみよう。',
      note: 'とぶ たびに、とんだ かいすうが 1 ふえます。はじめの 3 は「いる ところ」なので、かぞえません。**たしざんは 右へ すすむ** ことです。',
      miss: '「3, 4, 5, 6」と はじめの 3 から かぞえると、ひとつ たりなく なります。かぞえるのは、とんだ「あいだ」の かずです。',
      legend: [['かえるが とんだ みち', { color: 'a' }], ['いま いる ところ', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'a', label: 'はじめの かず', min: 0, max: 10, step: 1, d: 0, on: reset }, { range: 'b', label: 'すすむ かず', min: 1, max: 10, step: 1, d: 0, on: reset }],
      init: reset,
      step(st, dt) { return hopStep(st, dt, +1); },
      draw(cv, st) { drawLine(cv, st, +1); },
      readout: st => `${st.a} から ${Math.floor(st.hop)} すすんだ ところ：<b>${st.a + Math.floor(st.hop)}</b>　　（${st.a} ＋ ${st.b} ＝ ${st.a + st.b}）`
    },
    {
      key: 'modoru', label: '② 左へ もどる',
      lead: 'こんどは 9 から 4 もどります。どこに つくかな？',
      note: '**ひきざんは 左へ もどる** ことです。もどる ときも、とんだ かいすうを かぞえます。',
      state: { a: 9, b: 4 },
      legend: [['かえるが もどった みち', { color: 'b' }], ['いま いる ところ', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'a', label: 'はじめの かず', min: 1, max: 20, step: 1, d: 0, on: reset }, { range: 'b', label: 'もどる かず', min: 1, max: 9, step: 1, d: 0, on: reset }],
      init: reset,
      step(st, dt) { return hopStep(st, dt, -1); },
      draw(cv, st) { drawLine(cv, st, -1); },
      readout: st => `${st.a} から ${Math.floor(st.hop)} もどった ところ：<b>${Math.max(0, st.a - Math.floor(st.hop))}</b>　　（${st.a} − ${Math.min(st.b, st.a)} ＝ ${Math.max(0, st.a - st.b)}）`
    },
    {
      key: 'memori', label: '③ めもりの あいだ',
      lead: 'めもりの あいだを ひろげたり せばめたり してみよう。',
      note: 'めもりの あいだは、どこも おなじ ながさに します。おなじ ながさだから、「いくつ ぶん」で かずが わかります。ばらばらだと、かずが わからなく なります。',
      state: { a: 2, b: 5 },
      legend: [['かえるが とんだ みち', { color: 'a' }]],
      controls: [{ range: 'gap', label: 'めもりの あいだ', min: 0.5, max: 1.5, step: 0.01, fmt: v => v < 0.8 ? 'せまい' : v > 1.2 ? 'ひろい' : 'ふつう' }, { seg: 'uneven', label: 'めもりの つけかた', options: [[false, 'おなじ あいだ'], [true, 'ばらばら（まちがい）']] }],
      init(st) { reset(st); st.uneven = false; },
      step(st, dt) { return hopStep(st, dt, +1); },
      draw(cv, st) { drawLine(cv, st, +1); }
    }
  ]
});

function reset(st) { st.hop = 0; st.t = 0; }
function hopStep(st, dt, dir) {
  if (st.hop >= st.b || (dir < 0 && st.a - st.hop <= 0)) return false;
  st.hop = Math.min(st.b, st.hop + dt * 1.6);
}
function drawLine(cv, st, dir) {
  const lo = dir > 0 ? 0 : 0, hi = Math.max(10, st.a + (dir > 0 ? st.b : 0) + 1);
  const g = st.gap || 1;
  const v = cv.view({ x0: -0.6, x1: hi + 0.6, y0: -1, y1: 3, box: [40, 30, 800, 230] });
  // めもりの場所（ばらばらのときは、わざとずらす）
  const pos = n => st.uneven ? n + 0.35 * Math.sin(n * 2.3) : n;
  const cx = (v.x0 + v.x1) / 2, P = n => cx + (pos(n) - cx) * g;
  v.line([[P(lo) - 0.4, 0], [P(hi) + 0.4, 0]], { color: 'ink', width: 2 });
  v.arrow(P(hi), 0, P(hi) + 0.5, 0, { color: 'ink', width: 2 });
  for (let n = lo; n <= hi; n++) { v.line([[P(n), -0.15], [P(n), 0.15]], { color: 'ink', width: 2 }); v.text(String(n), P(n), -0.45, { align: 'center', size: 17 }); }
  // とんだ弧
  const full = Math.floor(st.hop), part = st.hop - full;
  for (let k = 0; k < Math.min(st.b, Math.ceil(st.hop)); k++) {
    const f = k < full ? 1 : part, x0 = st.a + dir * k;
    if (dir < 0 && x0 <= 0) break;
    const pts = []; for (let s = 0; s <= 20 * f; s++) { const u = s / 20; pts.push([P(x0) + (P(x0 + dir) - P(x0)) * u, 1.4 * u * (1 - u) * 2]); }
    v.line(pts, { color: dir > 0 ? 'a' : 'b', width: 3 });
    if (k < full) v.text(String(k + 1), (P(x0) + P(x0 + dir)) / 2, 0.95, { align: 'center', color: dir > 0 ? 'a' : 'b', bold: true, size: 15 });
  }
  // かえる（いまの場所）
  const xn = st.a + dir * st.hop, xi = Math.floor(st.hop), u = st.hop - xi;
  const x = P(st.a + dir * xi) + (P(st.a + dir * (xi + 1)) - P(st.a + dir * xi)) * (st.hop >= st.b ? 0 : u);
  const y = st.hop >= st.b ? 0 : 1.4 * u * (1 - u) * 2;
  v.dot(x, y + 0.25, { color: 'b', r: 10 });
  v.text('かえる', x, y + 0.75, { align: 'center', size: 14, color: 'sub' });
  void xn;
}
