// @id m1-03
// @title くり《上|あ》がりの きかい（10・60・2・16）
// @vol 数学1
// @from 数学 1-2・1-7・1-10（ch1-02・ch1-07 きょりメーター・ch1-10）、2-17（ch2-17）／2-1・2-19・9巻 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 位取りカウンター：どの くらいも「b こ あつまると 0 に もどって、となりを 1つ おす」。b を 10・60・2・16 に かえても しくみは 同じ。

const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const HEX = '0123456789ABCDEF';
const digitsOf = (n, b, k) => Math.floor(n / Math.pow(b, k)) % b;
const fmtD = (d, b) => b === 16 ? HEX[d] : b === 60 ? String(d).padStart(2, '0') : String(d);

// わ（数字の 輪）を ならべて かく。places は 左から、k は くらいの 番号（0 が いちばん 右）
function wheels(cv, o) {
  const { n, f, b, K, x0, y, w, h, gap } = o;
  const out = [];
  for (let j = 0; j < K; j++) {
    const k = K - 1 - j, x = x0 + j * (w + gap);
    const pk = Math.pow(b, k), d = digitsOf(n, b, k);
    const rolls = f > 0 && (n % pk) === pk - 1;
    const u = rolls ? ease(f) : 0;
    cv.rect(x, y, w, h, { fill: 'panel', alpha: 1, color: 'ink', width: 2 });
    const g = cv.g; g.save(); g.beginPath(); g.rect(x + 2, y + 2, w - 4, h - 4); g.clip();
    const sz = o.size || 54;
    cv.text(fmtD(d, b), x + w / 2, y + h / 2 - u * h, { align: 'center', size: sz, bold: true, color: rolls && d === b - 1 ? 'b' : 'ink' });
    if (rolls) cv.text(fmtD((d + 1) % b, b), x + w / 2, y + h / 2 + h - u * h, { align: 'center', size: sz, bold: true });
    g.restore();
    // つめで となりを おす（9→0 の ときだけ）
    if (rolls && d === b - 1 && j > 0) {
      const xm = x - gap / 2;
      cv.arrow(x + 8, y - 12, x - gap - 8, y - 12, { color: 'b', width: 3 });
      cv.text('1', xm, y - 30, { align: 'center', bold: true, color: 'b', size: 17 });
    }
    if (o.labels) cv.text(o.labels[k], x + w / 2, y + h + 20, { align: 'center', size: 15, color: 'sub' });
    out.push({ k, x, y, w, h });
  }
  return out;
}
function hitWheel(boxes, x, y) { for (const r of boxes || []) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.k; return null; }
function tick(st, dt, rate, max) {
  if (st.n >= max) return false;
  st.f += dt * rate;
  if (st.f >= 1) { st.f = 0; st.n++; if (st.pause) return false; }
}

// ---------- ブロック（100の いた・10の ぼう・ばら） ----------
function flat(cv, x, y, s) { cv.rect(x, y, s, s, { fill: 'd', alpha: 0.85, color: 'd', width: 1 }); for (let i = 1; i < 10; i++) { cv.line([[x + i * s / 10, y], [x + i * s / 10, y + s]], { color: 'bg', width: 0.8 }); cv.line([[x, y + i * s / 10], [x + s, y + i * s / 10]], { color: 'bg', width: 0.8 }); } }
function rod(cv, x, y, h) { cv.rect(x, y, 9, h, { fill: 'a', alpha: 1 }); for (let i = 1; i < 10; i++) cv.line([[x, y + i * h / 10], [x + 9, y + i * h / 10]], { color: 'bg', width: 0.8 }); }
function cube(cv, x, y) { cv.rect(x, y, 13, 13, { fill: 'c', alpha: 1 }); }

const W1 = { x0: 120, y: 80, w: 120, h: 90, gap: 34 };
let boxes1 = null, boxes2 = null, boxes3 = null, boxes4 = null;
function drawJuu(cv, st) {
  const L = ['いちの くらい', 'じゅうの くらい', 'ひゃくの くらい', 'せんの くらい'];
  boxes1 = wheels(cv, Object.assign({ n: st.n, f: st.f, b: 10, K: 4, labels: L }, W1));
  cv.text('きょりメーター', 30, 40, { size: 17, bold: true });
  // ブロック（いまの かず）
  const n = st.n, d2 = digitsOf(n, 10, 2), d1 = digitsOf(n, 10, 1), d0 = digitsOf(n, 10, 0), d3 = digitsOf(n, 10, 3);
  const col = j => W1.x0 + j * (W1.w + W1.gap);
  const yb = 220;
  if (d3) cv.text(`1000が ${d3}こ`, col(0) + W1.w / 2, yb + 50, { align: 'center', size: 16 });
  for (let i = 0; i < d2; i++) flat(cv, col(1) + 8 + i * 7, yb + i * 5, 60);
  for (let i = 0; i < d1; i++) rod(cv, col(2) + 4 + i * 12.5, yb, 100);
  for (let i = 0; i < d0; i++) cube(cv, col(3) + 14 + (i % 3) * 20, yb + 14 + Math.floor(i / 3) * 20);
  cv.text(`100が ${d2}こ`, col(1) + W1.w / 2, yb + 122, { align: 'center', size: 15, color: 'sub' });
  cv.text(`10が ${d1}こ`, col(2) + W1.w / 2, yb + 122, { align: 'center', size: 15, color: 'sub' });
  cv.text(`1が ${d0}こ`, col(3) + W1.w / 2, yb + 122, { align: 'center', size: 15, color: 'sub' });
  cv.text('わを ゆびで さわると、 その くらいに 1 たせるよ', 440, 395, { align: 'center', size: 15, color: 'sub' });
}

// ---------- ② 60分で 1時間 ----------
function drawJikan(cv, st) {
  const h = Math.floor(st.n / 60), m = st.n % 60, rolls = st.f > 0, u = ease(st.f);
  const B = [{ k: 1, x: 220, w: 140 }, { k: 0, x: 420, w: 140 }];
  boxes2 = B.map(r => ({ k: r.k, x: r.x, y: 70, w: r.w, h: 90 }));
  for (const r of boxes2) {
    cv.rect(r.x, r.y, r.w, r.h, { fill: 'panel', alpha: 1, color: 'ink', width: 2 });
    const g = cv.g; g.save(); g.beginPath(); g.rect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); g.clip();
    const v = r.k ? h : m, nx = r.k ? (m === 59 ? (h + 1) : h) : (m + 1) % 60, roll = rolls && (r.k === 0 || m === 59);
    cv.text(String(v), r.x + r.w / 2, r.y + 45 - (roll ? u * 90 : 0), { align: 'center', size: 54, bold: true, color: roll && (r.k === 0 ? m === 59 : true) ? 'b' : 'ink' });
    if (roll) cv.text(String(nx), r.x + r.w / 2, r.y + 135 - u * 90, { align: 'center', size: 54, bold: true });
    g.restore();
  }
  cv.text('じ', 372, 125, { size: 26, bold: true });
  cv.text('ふん', 572, 125, { size: 26, bold: true });
  if (rolls && m === 59) { cv.arrow(412, 58, 368, 58, { color: 'b', width: 3 }); cv.text('1', 390, 40, { align: 'center', bold: true, color: 'b', size: 17 }); }
  // 60この 目もり
  const x0 = 110, x1 = 770, yb = 250, dx = (x1 - x0) / 60;
  cv.text('1ぷんが 60こ', x0, yb - 40, { size: 16, bold: true });
  for (let i = 0; i <= 60; i++) cv.line([[x0 + i * dx, yb], [x0 + i * dx, yb - (i % 5 ? 10 : 20)]], { color: 'ink', width: i % 5 ? 1 : 2 });
  cv.line([[x0, yb], [x1, yb]], { color: 'ink', width: 2 });
  cv.rect(x0, yb + 6, (m + (rolls ? u : 0)) * dx, 26, { fill: 'b', alpha: 0.8 });
  for (let i = 0; i <= 60; i += 10) cv.text(String(i), x0 + i * dx, yb + 46, { align: 'center', size: 15, color: 'sub' });
  // 1時間の テープ
  cv.text('60ぷんで 1じかん', x0, 330, { size: 16, bold: true });
  for (let i = 0; i < Math.min(h, 12); i++) { cv.rect(x0 + 160 + i * 48, 316, 44, 26, { fill: 'a', alpha: 0.85 }); }
  cv.text(`${h}じかん`, x0 + 160 + Math.min(h, 12) * 48 + 8, 330, { size: 16, color: 'a', bold: true });
  cv.text('10こで まとまる（1-7）と おなじ しくみ。 じかんは 60で まとまる', 440, 395, { align: 'center', size: 15, color: 'sub' });
}

// ---------- ③ 2進数のランプ ----------
function lamp(cv, x, y, on) {
  cv.circle(x, y, 26, { fill: on ? 'e' : 'panel', alpha: 1, color: 'ink', width: 2 });
  if (on) { for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; cv.line([[x + 32 * Math.cos(t), y + 32 * Math.sin(t)], [x + 40 * Math.cos(t), y + 40 * Math.sin(t)]], { color: 'e', width: 2.5 }); } }
  cv.text(on ? '1' : '0', x, y, { align: 'center', size: 22, bold: true, color: on ? 'ink' : 'sub' });
}
function drawNishin(cv, st) {
  const n = st.n, K = 5, u = ease(st.f);
  boxes3 = [];
  cv.text('つく ＝ 1、 きえる ＝ 0。 2こ あつまったら となりへ', 30, 36, { size: 16, bold: true });
  for (let j = 0; j < K; j++) {
    const k = K - 1 - j, x = 190 + j * 120, y = 130, pk = 1 << k, on = digitsOf(n, 2, k) === 1;
    const rolls = st.f > 0 && (n % pk) === pk - 1;
    lamp(cv, x, y, rolls && u > 0.5 ? !on : on);
    cv.text(String(pk), x, y - 62, { align: 'center', size: 18, color: 'sub', bold: true });
    if (rolls && on && j > 0) { cv.arrow(x - 34, y + 54, x - 86, y + 54, { color: 'b', width: 3 }); cv.text('1', x - 60, y + 74, { align: 'center', color: 'b', bold: true, size: 17 }); }
    boxes3.push({ k, x: x - 40, y: y - 40, w: 80, h: 80 });
  }
  cv.text('くらいの おおきさ', 30, 68, { size: 15, color: 'sub' });
  // 2進数と10進数
  const bits = n.toString(2);
  cv.text('2しんすう', 190, 250, { size: 16, color: 'sub' });
  cv.text(bits, 300, 250, { size: 34, bold: true, math: true });
  cv.text('10しんすう', 190, 300, { size: 16, color: 'sub' });
  cv.text(String(n), 300, 300, { size: 34, bold: true, color: 'a' });
  // 2つずつ まとめた ブロック（1・2・4・8・16）
  const x0 = 520, yb = 330;
  let x = x0;
  for (let k = K - 1; k >= 0; k--) {
    if (!digitsOf(n, 2, k)) continue;
    const c = 1 << k, cols = Math.max(1, 1 << Math.floor(k / 2)), rows = c / cols, s = 11;
    for (let i = 0; i < c; i++) cv.rect(x + (i % cols) * s, yb - rows * s + Math.floor(i / cols) * s, s - 1, s - 1, { fill: ['c', 'a', 'b', 'd', 'e'][k], alpha: 1 });
    cv.text(String(c), x + cols * s / 2, yb + 16, { align: 'center', size: 15, color: 'sub' });
    x += cols * s + 16;
  }
  cv.text('ランプを ゆびで さわると、 その くらいに 1 たせるよ', 440, 395, { align: 'center', size: 15, color: 'sub' });
}

// ---------- ④ いろいろな くり上がり ----------
const START = { 10: 996, 60: 3596, 2: 4, 16: 4092 };
const KOF = b => b === 60 ? 3 : 4;
function drawKurabe(cv, st) {
  const b = st.base, K = KOF(b);
  const L = [0, 1, 2, 3].map(k => String(Math.pow(b, k)));
  cv.text(`${b}こ あつまると、 0に もどって となりを 1つ おす`, 440, 34, { align: 'center', size: 17, bold: true });
  boxes4 = wheels(cv, Object.assign({ n: st.n, f: st.f, b, K, labels: L, size: b === 60 ? 44 : 54 }, W1, { y: 90, x0: W1.x0 + (4 - K) * (W1.w + W1.gap) / 2 }));
  cv.text('くらいの おおきさ ↑', 440, 222, { align: 'center', size: 15, color: 'sub' });
  cv.text(`10しんすうで いうと ${st.n}`, 440, 280, { align: 'center', size: 22, bold: true, color: 'a' });
  const dig = b === 16 ? '0〜9 と A〜F（Aが 10、 Fが 15）' : b === 60 ? '0〜59（とけいの ふん）' : b === 2 ? '0と 1 だけ' : '0〜9';
  cv.text(`つかう すうじ：${dig}`, 440, 320, { align: 'center', size: 16 });
}

A.item({
  id: 'm1-03', title: 'くり《上|あ》がりの きかい（10・60・2・16）', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-2・1-7・1-10、 《第|だい》2《巻|かん》 2-17 の《図|ず》から（2-1・2-19 でも つかう）',
  W: 880, H: 420,
  state: { n: 196, f: 0, base: 10 },
  scenes: [
    {
      key: 'juu', label: '① 10で となりへ',
      lead: 'きょりメーターの わが まわります。 9の つぎで なにが おきるかな？ ▶ を おしてみよう。',
      note: 'どの わも、 9から 0に なる ときだけ、 となりの わを 1つ おします。 0199の つぎは 0200。 ばらが 10こで ぼう 1《本|ぽん》、 ぼうが 10《本|ぽん》で 100の いた。 **10 あつまると 1つ 《左|ひだり》の くらいへ** うつります。',
      legend: [['100の いた', { color: 'd', shape: 'square', noline: true }], ['10の ぼう', { color: 'a', shape: 'square', noline: true }], ['ばら', { color: 'c', shape: 'square', noline: true }], ['となりを おす', { color: 'b' }]],
      controls: [{ seg: 'n', label: 'はじめの かず', options: [[36, '36'], [96, '96'], [196, '196'], [996, '996']], on(st) { st.f = 0; } }],
      step(st, dt) { return tick(st, dt, 1.6, 9999); },
      draw(cv, st) { drawJuu(cv, st); },
      drag: { hit(st, x, y) { return hitWheel(boxes1, x, y); }, move() {}, end(st, api, k) { st.n = Math.min(9999, st.n + Math.pow(10, k)); st.f = 0; } },
      readout: st => `いまの かず：<b>${String(st.n).padStart(4, '0')}</b>　（${st.n}）`
    },
    {
      key: 'jikan', label: '② 60《分|ぷん》で 1《時間|じかん》',
      lead: '《時計|とけい》の 「《分|ふん》」は、 いくつ あつまると 「《時|じ》」へ くり《上|あ》がるかな？',
      note: '《長|なが》い はりの 1まわりは 60《分|ぷん》。 **60《分|ぷん》 あつまると 1《時間|じかん》に くり《上|あ》がり**、 《分|ふん》は 0に もどります。 10で まとまる かずと、 まとまる かずが ちがうだけで、 しくみは おなじです。',
      legend: [['すすんだ 《分|ふん》', { color: 'b', shape: 'square', noline: true }], ['1《時間|じかん》の まとまり', { color: 'a', shape: 'square', noline: true }]],
      state: { n: 3 * 60 + 50, f: 0 },
      controls: [{ seg: 'n', label: 'はじめの 《時|じ》こく', options: [[3 * 60 + 50, '3《時|じ》50《分|ぷん》'], [8 * 60 + 55, '8《時|じ》55《分|ふん》'], [11 * 60 + 40, '11《時|じ》40《分|ぷん》']], on(st) { st.f = 0; } }],
      step(st, dt) { return tick(st, dt, 8, 12 * 60 + 59); },
      draw(cv, st) { drawJikan(cv, st); },
      drag: { hit(st, x, y) { return hitWheel(boxes2, x, y); }, move() {}, end(st, api, k) { st.n = Math.min(12 * 60 + 59, st.n + (k ? 60 : 1)); st.f = 0; } },
      readout: st => { const m = st.n % 60; return `いまの 《時|じ》こく：<b>${Math.floor(st.n / 60)}《時|じ》${m ? m + '《分|' + ([1, 3, 4, 6, 8, 0].includes(m % 10) ? 'ぷん' : 'ふん') + '》' : 'ちょうど'}</b>`; }
    },
    {
      key: 'nishin', label: '③ 2で となりへ（2《進数|しんすう》）',
      lead: 'ランプは 「つく」と 「きえる」の 2つ だけ。 2こ あつまったら となりへ くり《上|あ》がります。',
      note: '0、 1 の つぎは 10、 11 の つぎは 100。 **2 あつまると 1つ 《左|ひだり》へ**。 だから くらいの 《大|おお》きさは 1・2・4・8・16 と 2《倍|ばい》ずつに なります（2《巻|かん》 2-17）。 コンピューターの 《中|なか》は、 この しくみで かぞえて います。',
      legend: [['ついた ランプ（1）', { color: 'e', shape: 'circle', noline: true }], ['となりを おす', { color: 'b' }]],
      state: { n: 0, f: 0 },
      controls: [{ seg: 'n', label: 'はじめの かず', options: [[0, '0'], [6, '6'], [14, '14']], on(st) { st.f = 0; } }],
      step(st, dt) { return tick(st, dt, 1.2, 31); },
      draw(cv, st) { drawNishin(cv, st); },
      drag: { hit(st, x, y) { return hitWheel(boxes3, x, y); }, move() {}, end(st, api, k) { st.n = Math.min(31, st.n + (1 << k)); st.f = 0; } },
      readout: st => `2《進数|しんすう》 <b>${st.n.toString(2)}</b> ＝ 10《進数|しんすう》 <b>${st.n}</b>`
    },
    {
      key: 'kurabe', label: '④ 10・60・2・16',
      lead: 'まとまる かずを かえても、 くり《上|あ》がりの しくみは おなじです。 えらんで ▶ を おそう。',
      note: '10《進数|しんすう》は 10で、 2《進数|しんすう》は 2で、 16《進数|しんすう》は 16で くり《上|あ》がります。 999 ＋ 1 ＝ 1000 と、 111 ＋ 1 ＝ 1000（2《進数|しんすう》）は、 どの くらいも 0に なって くり《上|あ》がる、 おなじ うごきです。',
      state: { base: 10, n: 996, f: 0 },
      controls: [{ seg: 'base', label: 'いくつで まとまる？', options: [[10, '10'], [60, '60'], [2, '2'], [16, '16']], on(st) { st.n = START[st.base]; st.f = 0; } }],
      step(st, dt) { return tick(st, dt, 1.4, Math.pow(st.base, KOF(st.base)) - 1); },
      draw(cv, st) { drawKurabe(cv, st); },
      drag: { hit(st, x, y) { return hitWheel(boxes4, x, y); }, move() {}, end(st, api, k) { st.n = Math.min(Math.pow(st.base, KOF(st.base)) - 1, st.n + Math.pow(st.base, k)); st.f = 0; } },
      readout: st => `${st.base}で まとまる かき《方|かた》：<b>${[3, 2, 1, 0].slice(4 - KOF(st.base)).map(k => fmtD(digitsOf(st.n, st.base, k), st.base)).join(st.base === 60 ? ':' : ' ')}</b>　＝ ${st.n}`
    }
  ]
});
