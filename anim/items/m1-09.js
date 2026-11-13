// @id m1-09
// @title グラフの 1目もりと はじまり
// @vol 数学1
// @from 数学 1-17 ぼうグラフ・1-18 おれ線グラフ（ch1-17・ch1-18）／2-18・3-4・3-13 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 本の数：ペットボトルの ふた 1組40・2組20・3組30・4組10、どんぐり ソラ22・ミナ24、気温 8時〜13時 15・16・18・21・23・24℃。

const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
// たての 目もり：base から 1目もり unit で n 目もり。px は 1目もりの 高さ。label は 何目もりごとに 数を 書くか
function yaxis(cv, x, yb, n, px, base, unit, label, wid, o = {}) {
  for (let k = 0; k <= n; k++) {
    const y = yb - k * px;
    cv.line([[x, y], [x + wid, y]], { color: k % label ? 'grid' : 'line', width: k % label ? 1 : 1.5 });
    if (k % label === 0) cv.text(String(base + k * unit), x - 8, y, { align: 'right', size: 15, bold: true });
  }
  cv.line([[x, yb + 2], [x, yb - n * px - 10]], { color: 'ink', width: 2 });
  cv.line([[x, yb], [x + wid, yb]], { color: 'ink', width: 2 });
  if (o.unit) cv.text(o.unit, x - 8, yb - n * px - 24, { align: 'right', size: 15, color: 'sub' });
  if (o.nami) { const y = yb - px * 0.5; cv.line([[x - 7, y + 4], [x - 2, y - 3], [x + 2, y + 3], [x + 7, y - 4]], { color: 'b', width: 2.5 }); }
}
function bar(cv, x, yb, w, h, o = {}) {
  cv.rect(x, yb - h, w, h, { fill: o.color || 'a', alpha: 0.75, color: o.color || 'a', width: 1.5 });
}

// ---------- ① 1目もりの きめかた ----------
const KUMI = [40, 20, 30, 10];
function drawMemori(cv, st) {
  const u = st.u, unit = st.unit, n = 10, px = 30, x0 = 90, yb = 380, wid = 330, top = yb - n * px;
  const lab = unit === 2 ? 5 : 2;
  yaxis(cv, x0, yb, n, px, 0, unit, lab, wid, { unit: '（こ）' });
  KUMI.forEach((v, i) => {
    const bx = x0 + 30 + i * 76, full = v / unit * px, h = full * ease(u);
    if (h > n * px + 6) {
      bar(cv, bx, yb, 46, n * px + 18);
      // はみ出し：ぎざぎざ
      const y = top - 6; cv.line([[bx - 4, y + 6], [bx + 12, y - 2], [bx + 28, y + 6], [bx + 50, y - 2]], { color: 'bg', width: 5 });
      cv.text('はみだす！', bx + 23, top - 34, { align: 'center', size: 15, bold: true, color: 'b' });
    } else bar(cv, bx, yb, 46, h);
    cv.text(`${i + 1}くみ`, bx + 23, yb + 20, { align: 'center', size: 15 });
  });
  const x1 = 500;
  cv.text(`1めもり ${unit}こ`, x1, 70, { size: 22, bold: true, color: 'a' });
  cv.text(`10めもりで ${unit * 10}こ まで かける`, x1, 110, { size: 17 });
  const ok = unit * 10 >= 40, low = unit === 10;
  cv.text(ok ? (low ? 'はいる。 でも ぼうが ひくくて くらべにくい' : 'はいる。 ちょうど よい ○') : '40こが はいらない ×', x1, 150, { size: 17, bold: true, color: ok && !low ? 'c' : 'b' });
  cv.text('1くみ 40こ・2くみ 20こ', x1, 220, { size: 16, color: 'sub' });
  cv.text('3くみ 30こ・4くみ 10こ', x1, 248, { size: 16, color: 'sub' });
}
// ---------- ② ぼうは 0から ----------
function drawHajimari(cv, st) {
  const b = Math.round(st.base), x0 = 110, yb = 390, wid = 300, n = 25 - b, px = Math.min(28, 320 / n);
  yaxis(cv, x0, yb, n, px, b, 1, b % 5 === 0 ? 5 : 1, wid, { unit: '（こ）' });
  if (b > 0) cv.rect(x0 - 50, yb - 10, 42, 20, { fill: 'b', alpha: 0.2 });
  const V = [['ソラ', 22], ['ミナ', 24]];
  V.forEach(([nm, v], i) => {
    const bx = x0 + 50 + i * 130, h = (v - b) * px * ease(st.u);
    bar(cv, bx, yb, 70, h, { color: i ? 'b' : 'a' });
    cv.text(nm, bx + 35, yb + 20, { align: 'center', size: 16, bold: true });
    cv.text(`${v}こ`, bx + 35, yb - h - 14, { align: 'center', size: 16, bold: true });
  });
  const x1 = 480, hs = 22 - b, hm = 24 - b;
  cv.text(b === 0 ? '0から かいた グラフ' : `${b}から かいた グラフ`, x1, 70, { size: 20, bold: true, color: b === 0 ? 'c' : 'b' });
  cv.text(`ぼうの ながさ：ソラ ${hs}めもり、 ミナ ${hm}めもり`, x1, 120, { size: 16 });
  cv.text(`みためは ミナが ソラの ${A.num(hm / hs, hm % hs ? 1 : 0)}ばい`, x1, 160, { size: 18, bold: true, color: hm / hs > 1.3 ? 'b' : 'ink' });
  cv.text('ほんとうの ちがいは 24 − 22 ＝ 2こ', x1, 200, { size: 17, color: 'a' });
}
// ---------- ③ 1目もりと かたむき ----------
const TEMP = [15, 16, 18, 21, 23, 24];
function drawKatamuki(cv, st) {
  const unit = st.unit, base = st.base, x0 = 80, yb = 400, wid = 420;
  const n = Math.ceil((25 - base) / unit), px = 12.5;
  yaxis(cv, x0, yb, n, px, base, unit, unit === 5 ? 2 : 5, wid, { unit: '（℃）', nami: base > 0 });
  const X = i => x0 + 40 + i * 68, Y = v => yb - (v - base) / unit * px;
  TEMP.forEach((v, i) => cv.text(`${8 + i}じ`, X(i), yb + 20, { align: 'center', size: 15 }));
  const k = Math.min(TEMP.length - 1, Math.floor(st.u)), f = ease(st.u - k);
  const pts = TEMP.map((v, i) => [X(i), Y(v)]);
  const shown = pts.slice(0, k + 1); if (k < TEMP.length - 1) shown.push([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]);
  cv.line(shown, { color: 'a', width: 3 });
  for (let i = 0; i <= k; i++) cv.dot(pts[i][0], pts[i][1], { r: 5, color: 'a' });
  if (st.u >= TEMP.length - 1) { cv.line([pts[2], pts[3]], { color: 'b', width: 6 }); cv.text('10じ→11じ：3℃（いちばん はやく あがった）', x0 + 10, 40, { size: 15, bold: true, color: 'b' }); }
  const x1 = 540;
  cv.text(`1めもり ${unit}℃`, x1, 70, { size: 22, bold: true, color: 'a' });
  cv.text(base ? `${base}℃から（≈ で はぶいた）` : '0℃から ぜんぶ かいた', x1, 108, { size: 16 });
  cv.text('すうじは どれも おなじ：', x1, 170, { size: 16, color: 'sub' });
  cv.text('8じ 15℃ → 13じ 24℃', x1, 198, { size: 16, color: 'sub' });
  cv.text(unit === 5 ? 'せんが ゆるやかに みえる' : unit === 1 && base ? 'かたむきが よく みえる' : 'めもりで みえかたが かわる', x1, 250, { size: 17, bold: true, color: 'b' });
  cv.text('かたむきでは なく、', x1, 290, { size: 16 });
  cv.text('すうじを よんで くらべよう', x1, 316, { size: 16 });
}

A.item({
  id: 'm1-09', title: 'グラフの 1《目|め》もりと はじまり', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-17「ぼうグラフ」・1-18「おれ《線|せん》グラフ」の《図|ず》から（2-18、 3-4 でも つかう）',
  W: 880, H: 440,
  state: { u: 0, unit: 5, base: 0 },
  scenes: [
    {
      key: 'memori', label: '① 1《目|め》もりを きめる',
      lead: 'ペットボトルの ふたの かずを、 10《目|め》もりの ぼうグラフに かきます。 1《目|め》もりを いくつに すると よいかな？',
      note: '1《目|め》もりを きめると、 10《目|め》もりで いくつまで かけるかが きまります。 1《目|め》もり 2こでは 20こまで なので、 40こや 30こが はみ《出|だ》します。 10こでは ぼうが ひくくて くらべにくい。 **1《目|め》もり 5こ** が ちょうど よい です。',
      legend: [['ふたの かず（ぼう）', { color: 'a', shape: 'square', noline: true }]],
      state: { unit: 2 },
      controls: [{ seg: 'unit', label: '1《目|め》もり', options: [[2, '2こ'], [5, '5こ'], [10, '10こ']], on(st) { st.u = 0; } }],
      init(st) { st.u = 0; },
      step(st, dt) { if (st.u >= 1) return false; st.u = Math.min(1, st.u + dt * 0.6); },
      draw(cv, st) { drawMemori(cv, st); },
      readout: st => `1《目|め》もり ${st.unit}こ → 10《目|め》もりで ${st.unit * 10}こ まで`
    },
    {
      key: 'hajimari', label: '② ぼうは 0から',
      lead: 'どんぐりを ソラは 22こ、 ミナは 24こ ひろいました。 グラフの はじまりを かえると、 どう みえるかな？',
      note: 'ぼうの ながさで かずを くらべるので、 **ぼうグラフは 0から かきます**。 とちゅうから かくと、 ちがいが 《大|おお》きく みえて しまいます。',
      miss: 'ぼうを とちゅう（20）から かくと、 ソラの ぼうは 2《目|め》もり、 ミナの ぼうは 4《目|め》もり。 ミナが ソラの 2つ《分|ぶん》も ひろった ように みえます。 でも、 ほんとうは 24 － 22 ＝ 2で、 2こしか ちがいません。',
      legend: [['ソラ', { color: 'a', shape: 'square', noline: true }], ['ミナ', { color: 'b', shape: 'square', noline: true }]],
      state: { base: 0, u: 1 },
      controls: [{ range: 'base', label: 'グラフの はじまり', min: 0, max: 20, step: 1, d: 0 }],
      init(st) { st.u = 1; },
      step(st, dt) { if (st.base >= 20) return false; st.base = Math.min(20, st.base + dt * 5); },
      draw(cv, st) { drawHajimari(cv, st); },
      readout: st => { const b = Math.round(st.base); return `${b}から かくと：ソラ ${22 - b}《目|め》もり、 ミナ ${24 - b}《目|め》もり（ほんとうの ちがいは 2こ）`; }
    },
    {
      key: 'katamuki', label: '③ 1《目|め》もりと かたむき',
      lead: 'おなじ 《気温|きおん》でも、 1《目|め》もりや はじまりを かえると、 《線|せん》の かたむきが かわって みえます。',
      note: 'つかわない ところ（0℃から 10℃）は ≈ で はぶけます。 1《目|め》もりが ちがう グラフどうしは、 かたむきでは くらべられません。 **《数|かず》を よんで くらべよう**。',
      miss: '1《目|め》もり 1℃の A と、 1《目|め》もり 5℃の B。 B の 《線|せん》の ほうが ゆるやかに みえますが、 A は 2℃、 B は 5℃ 《上|あ》がって います。',
      legend: [['《気温|きおん》（おれ《線|せん》）', { color: 'a', shape: 'circle' }], ['10《時|じ》→11《時|じ》', { color: 'b' }], ['≈ はぶいた しるし', { color: 'b', style: 'dot' }]],
      state: { unit: 1, base: 10, u: 0 },
      controls: [{ seg: 'unit', label: '1《目|め》もり', options: [[1, '1℃'], [2, '2℃'], [5, '5℃']] }, { seg: 'base', label: 'はじまり', options: [[0, '0℃'], [10, '10℃（≈）']] }],
      init(st) { st.u = 0; },
      step(st, dt) { if (st.u >= TEMP.length - 1) return false; st.u = Math.min(TEMP.length - 1, st.u + dt * 1.2); },
      draw(cv, st) { drawKatamuki(cv, st); },
      readout: st => `1《目|め》もり ${st.unit}℃、 ${st.base}℃から。 10《時|じ》→11《時|じ》は どれでも 21 － 18 ＝ 3℃`
    }
  ]
});
