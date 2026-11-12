// @id m1-05
// @title おはじきの 四角と かけ算
// @vol 数学1
// @from 数学 1-12・1-13 かけ算（ch1-12・ch1-13）／1-14・1-21・2-4・7-1 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 本と同じく「1つ分 × いくつ分」。1つ分は たての 1れつ（おさら 1まい分）、いくつ分は れつの かず。

const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
function ohajiki(cv, x, y, r, col, o = {}) {
  if (o.square) cv.rect(x - r, y - r, 2 * r, 2 * r, { fill: col, alpha: 0.9, color: col, width: 1.5 });
  else cv.circle(x, y, r, { fill: col, alpha: 0.85, color: col, width: 1.5 });
}
function plate(cv, x, y, w) { const g = cv.g; g.beginPath(); g.ellipse(x, y, w / 2, w / 5, 0, 0, A.TAU); g.fillStyle = A.color('panel'); g.fill(); g.strokeStyle = A.color('sub'); g.lineWidth = 2; g.stroke(); }
// 1つ分の わく（たての 1れつを かこむ）
function colFrame(cv, x, y0, y1, col) { cv.rect(x - 17, y0 - 17, 34, y1 - y0 + 34, { color: col || 'c', style: 'dash', width: 2 }); }

// ---------- ① おさらから 四角へ ----------
const P1 = { px: 60, py: 74, pw: 84, gx: 150, gy: 175, dx: 40, dy: 30 };
function drawNarabe(cv, st) {
  const a = st.a, b = st.b, t = st.t;
  cv.text(`おさらに ${a}こずつ、 ${b}まい`, 30, 30, { size: 17, bold: true });
  for (let j = 0; j < b; j++) {
    const cx = P1.px + j * 92 + 20;
    plate(cv, cx, P1.py, P1.pw);
    const u = ease(A.clamp(t - j, 0, 1));
    for (let i = 0; i < a; i++) {
      const sx = cx + ((i % 3) - 1) * 18, sy = P1.py - 8 + (Math.floor(i / 3) - 1) * 14 + 8;
      const tx = P1.gx + j * P1.dx, ty = P1.gy + i * P1.dy;
      ohajiki(cv, lerp(sx, tx, u), lerp(sy, ty, u) - Math.sin(u * Math.PI) * 30, lerp(7, 11, u), 'a');
    }
  }
  const done = Math.min(b, Math.floor(t + 1e-9));
  for (let j = 0; j < done; j++) colFrame(cv, P1.gx + j * P1.dx, P1.gy, P1.gy + (a - 1) * P1.dy, 'c');
  if (done >= b) {
    cv.rect(P1.gx - 24, P1.gy - 24, (b - 1) * P1.dx + 48, (a - 1) * P1.dy + 48, { color: 'a', width: 2.5 });
    cv.text(`しかく`, P1.gx + (b - 1) * P1.dx / 2, P1.gy + (a - 1) * P1.dy + 44, { align: 'center', size: 15, color: 'a', bold: true });
  }
  // たし算の 行
  const x0 = 560;
  let sum = 0;
  for (let j = 0; j < done; j++) {
    sum += a;
    const y = 160 + j * 26;
    cv.text(`${j + 1}まいめ`, x0, y, { size: 15, color: 'sub' });
    cv.text(j ? `${sum - a} ＋ ${a} ＝ ${sum}` : `${a}`, x0 + 76, y, { size: 16 });
  }
  if (done >= b) cv.text(`${a} × ${b} ＝ ${a * b}`, x0, Math.min(160 + b * 26 + 20, 410), { size: 30, bold: true, color: 'a' });
}

// ---------- ② くるっと まわす ----------
const C2 = { cx: 300, cy: 240, d: 40 };
function drawMawasu(cv, st) {
  const a = st.a, b = st.b, th = st.th * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
  const pts = [];
  for (let j = 0; j < b; j++) for (let i = 0; i < a; i++) {
    const dx = (j - (b - 1) / 2) * C2.d, dy = (i - (a - 1) / 2) * C2.d;
    pts.push([C2.cx + dx * c - dy * s, C2.cy + dx * s + dy * c, j]);
  }
  // わく：はじめは たての れつ（a こ）、まわしおわったら あたらしい たての れつ（b こ）
  if (st.th < 1) for (let j = 0; j < b; j++) { const x = C2.cx + (j - (b - 1) / 2) * C2.d; colFrame(cv, x, C2.cy - (a - 1) / 2 * C2.d, C2.cy + (a - 1) / 2 * C2.d, 'c'); }
  if (st.th > 89) for (let i = 0; i < a; i++) { const x = C2.cx + (i - (a - 1) / 2) * C2.d * -1; colFrame(cv, x, C2.cy - (b - 1) / 2 * C2.d, C2.cy + (b - 1) / 2 * C2.d, 'd'); }
  for (const [x, y, j] of pts) ohajiki(cv, x, y, 13, j % 2 ? 'a' : 'b', { square: j % 2 === 1 });
  // まわる やじるし
  cv.circle(C2.cx, C2.cy, Math.hypot(a, b) * C2.d / 2 + 30, { color: 'sub', width: 2, style: 'dash', a0: -Math.PI * 0.75, a1: -Math.PI * 0.75 + th + 0.01 });
  const rot = st.th > 89, one = rot ? b : a, many = rot ? a : b;
  cv.text(rot ? 'まわした あと' : st.th > 1 ? 'くるっと…' : 'まわす まえ', 600, 70, { size: 18, bold: true });
  cv.text(`1つぶん（たての 1れつ）：${one}こ`, 600, 120, { size: 16 });
  cv.text(`いくつぶん（れつの かず）：${many}`, 600, 150, { size: 16 });
  cv.text(`${one} × ${many} ＝ ${a * b}`, 600, 210, { size: 32, bold: true, color: rot ? 'd' : 'c' });
  cv.text(`おはじきは ${a * b}こ（かわらない）`, 600, 270, { size: 16, color: 'a' });
  cv.text('ゆびで まわせるよ', C2.cx, 420, { align: 'center', size: 15, color: 'sub' });
}

// ---------- ③ いくつ分が 1 ふえると ----------
const C3 = { x0: 110, y0: 90, dx: 44, dy: 36 };
function drawFueru(cv, st) {
  const a = st.a, b = st.b;
  for (let j = 0; j < b; j++) {
    const nw = j === b - 1 && b > 1 && st.added;
    for (let i = 0; i < a; i++) ohajiki(cv, C3.x0 + j * C3.dx, C3.y0 + i * C3.dy, 13, nw ? 'b' : 'a', { square: nw });
    if (nw) colFrame(cv, C3.x0 + j * C3.dx, C3.y0, C3.y0 + (a - 1) * C3.dy, 'b');
  }
  if (b < 9) { const x = C3.x0 + b * C3.dx; cv.rect(x - 17, C3.y0 - 17, 34, (a - 1) * C3.dy + 34, { color: 'sub', style: 'dot', width: 2 }); cv.text('＋', x, C3.y0 + (a - 1) * C3.dy / 2, { align: 'center', size: 22, color: 'sub' }); }
  const x0 = 560;
  cv.text(`${a}の だん`, x0, 60, { size: 18, bold: true });
  for (let k = 1; k <= 9; k++) {
    const y = 60 + k * 34, on = k === b;
    if (on) cv.rect(x0 - 8, y - 15, 300, 30, { fill: 'hl', alpha: 1 });
    cv.text(`${a} × ${k} ＝ ${a * k}`, x0, y, { size: 17, bold: on, color: k <= b ? 'ink' : 'sub' });
    if (k > 1 && k <= b) cv.text(`（${a * (k - 1)} ＋ ${a}）`, x0 + 150, y, { size: 15, color: 'b' });
  }
  cv.text('ゆびで ＋の れつを さわると 1れつ ふえるよ', 240, 432, { align: 'center', size: 15, color: 'sub' });
}

// ---------- ④ L の かたち ----------
const LC = ['e', 'c', 'a', 'b', 'd'];
function drawL(cv, st) {
  const n = st.n, u = st.lt, d = 38, x0 = 200, y0 = 60;
  const full = Math.floor(u), part = u - full;
  for (let k = 1; k <= Math.min(9, full + 1); k++) {
    const f = k <= full ? 1 : ease(part);
    if (f < 0.05) continue;
    const col = LC[(k - 1) % 5];
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
      if (Math.max(i, j) !== k - 1) continue;
      const tx = x0 + j * d, ty = y0 + i * d;
      ohajiki(cv, tx + (1 - f) * 40, ty + (1 - f) * 40, 14 * Math.min(1, f + 0.2), col, { square: k % 2 === 0 });
    }
    if (f >= 1) cv.text(k === 1 ? '1' : `＋${2 * k - 1}`, x0 - 40, y0 + (k - 1) * d, { align: 'right', size: 16, bold: true, color: col });
  }
  void n;
  const k = Math.min(9, full);
  const x1 = 600;
  cv.text('ましかくの かず', x1, 60, { size: 18, bold: true });
  for (let m = 1; m <= k; m++) {
    const y = 60 + m * 36;
    cv.text(`${m} × ${m} ＝ ${m * m}`, x1, y, { size: 17 });
    if (m > 1) cv.text(`＋${2 * m - 1}`, x1 + 140, y, { size: 15, color: LC[(m - 1) % 5], bold: true });
  }
}

A.item({
  id: 'm1-05', title: 'おはじきの 《四角|しかく》と かけ《算|ざん》', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-12・1-13「かけ《算|ざん》」の《図|ず》から（1-14・1-21、 2-4 でも つかう）',
  W: 880, H: 450,
  state: { a: 3, b: 4, t: 0, th: 0, added: false, n: 4, lt: 0 },
  scenes: [
    {
      key: 'naraberu', label: '① おさらから 《四角|しかく》へ',
      lead: 'おさらの おはじきを、 1まいずつ たての 1れつに ならべなおして みよう。',
      note: 'おさら 1まいの 3こが、 たての 1れつ（1つ《分|ぶん》）に なります。 おさらが 4まいなら 4れつ（いくつ《分|ぶん》）。 **1つ《分|ぶん》 × いくつ《分|ぶん》** の おはじきは、 きちんと 《四角|しかく》に ならびます。 3 ＋ 3 ＋ 3 ＋ 3 ＝ 12 を、 3 × 4 ＝ 12 と かきます。',
      legend: [['おはじき', { color: 'a', shape: 'circle', noline: true }], ['1つ《分|ぶん》（たての 1れつ）', { color: 'c', style: 'dash' }]],
      controls: [{ range: 'a', label: '1つ《分|ぶん》', min: 1, max: 9, step: 1, d: 0, on(st) { st.t = 0; } }, { range: 'b', label: 'いくつ《分|ぶん》', min: 1, max: 9, step: 1, d: 0, on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { if (st.t >= st.b + 0.3) return false; st.t += dt * 1.2; },
      draw(cv, st) { drawNarabe(cv, st); },
      readout: st => st.t >= st.b ? `<b>${st.a} × ${st.b} ＝ ${st.a * st.b}</b>（${st.a}こずつ ${st.b}れつ）` : `${Math.min(st.b, Math.floor(st.t))}まい ならべた`
    },
    {
      key: 'mawasu', label: '② くるっと まわす',
      lead: '3 × 4 の 《四角|しかく》を、 くるっと 90° まわすと どう なるかな？',
      note: 'まわすと、 たての 1れつが 4こに なり、 4 × 3 の 《四角|しかく》に なります。 おはじきは ふえも へりも しないので、 **3 × 4 も 4 × 3 も 12**。 かける かずと かけられる かずを 《入|い》れかえても、 こたえは 《同|おな》じです。',
      legend: [['まわす まえの 1つ《分|ぶん》', { color: 'c', style: 'dash' }], ['まわした あとの 1つ《分|ぶん》', { color: 'd', style: 'dash' }], ['もとの れつ（いろと かたちを かわりばんこに）', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'a', label: '1つ《分|ぶん》', min: 1, max: 6, step: 1, d: 0, on(st) { st.th = 0; } }, { range: 'b', label: 'いくつ《分|ぶん》', min: 1, max: 6, step: 1, d: 0, on(st) { st.th = 0; } }],
      init(st) { st.th = 0; st.dir = 1; },
      step(st, dt) { st.th = A.clamp(st.th + st.dir * dt * 45, 0, 90); if (st.th >= 90 || st.th <= 0) { st.dir = -st.dir; return false; } },
      draw(cv, st) { drawMawasu(cv, st); },
      drag: {
        hit(st, x, y) { return Math.hypot(x - C2.cx, y - C2.cy) < 230 ? { a0: Math.atan2(y - C2.cy, x - C2.cx), th0: st.th } : null; },
        move(st, x, y, api, h) { let d = Math.atan2(y - C2.cy, x - C2.cx) - h.a0; if (d > Math.PI) d -= A.TAU; if (d < -Math.PI) d += A.TAU; st.th = A.clamp(h.th0 + d * 180 / Math.PI, 0, 90); if (st.th > 85) st.th = 90; if (st.th < 5) st.th = 0; st.dir = st.th >= 90 ? -1 : 1; }
      },
      readout: st => `まわした ${Math.round(st.th)}°`
    },
    {
      key: 'fueru', label: '③ いくつ《分|ぶん》が 1 ふえると',
      lead: 'れつを 1つ ふやすと、 おはじきは いくつ ふえるかな？ ▶ で 1れつずつ ふやそう。',
      note: 'いくつ《分|ぶん》が 1 ふえると、 1つ《分|ぶん》の かずだけ ふえます。 3 × 5 は 3 × 4 より 1れつ（3こ） おおいので、 3 × 5 ＝ 12 ＋ 3 ＝ 15。 こたえを わすれても、 1つ 《前|まえ》の こたえに 1つ《分|ぶん》を たせば もとめられます。',
      miss: '3 × 1 を 「3 ＋ 1 ＝ 4」と する まちがい。 3 × 1 は 「3こが 1さら《分|ぶん》」なので 3こ です。 また、 6 × 7 ＝ 42 の つぎの 6 × 8 は 42 ＋ 1 では なく、 42 ＋ 6 ＝ 48 です。',
      legend: [['いままでの れつ', { color: 'a', shape: 'circle', noline: true }], ['ふえた 1れつ', { color: 'b', shape: 'square', noline: true }]],
      state: { a: 3, b: 4 },
      controls: [{ range: 'a', label: '1つ《分|ぶん》', min: 1, max: 9, step: 1, d: 0 }, { button: '1れつ ふやす', act(st) { if (st.b < 9) { st.b++; st.added = true; } } }, { button: '1れつ へらす', act(st) { if (st.b > 1) { st.b--; st.added = false; } } }],
      init(st) { st.added = false; st.acc = 0; },
      step(st, dt) { st.acc = (st.acc || 0) + dt; if (st.acc > 1.1) { st.acc = 0; if (st.b >= 9) return false; st.b++; st.added = true; } },
      draw(cv, st) { drawFueru(cv, st); },
      drag: { hit(st, x, y) { const xb = C3.x0 + st.b * C3.dx; return st.b < 9 && Math.abs(x - xb) < 24 && y > C3.y0 - 24 && y < C3.y0 + (st.a - 1) * C3.dy + 24 ? 1 : null; }, move() {}, end(st) { st.b = Math.min(9, st.b + 1); st.added = true; } },
      readout: st => st.added && st.b > 1 ? `<b>${st.a} × ${st.b} ＝ ${st.a * (st.b - 1)} ＋ ${st.a} ＝ ${st.a * st.b}</b>（1れつ ${st.a}こ ふえた）` : `<b>${st.a} × ${st.b} ＝ ${st.a * st.b}</b>`
    },
    {
      key: 'lgata', label: '④ L の かたち',
      lead: 'ましかくの まわりに、 L の かたちを かさねて いこう。 1、 4、 9、 16 の ふえかたが 《見|み》えるかな？',
      note: '1 × 1 ＝ 1、 2 × 2 ＝ 4、 3 × 3 ＝ 9、 4 × 4 ＝ 16。 ふえる かずは 3、 5、 7 と、 2ずつ 《大|おお》きく なります。 L の かたちが、 たても よこも 1こずつ のびるからです。',
      legend: [['かさねた L（いろと かたちで わける）', { color: 'c', shape: 'square', noline: true }]],
      init(st) { st.lt = 1; },
      step(st, dt) { if (st.lt >= 9) return false; st.lt = Math.min(9, st.lt + dt * 0.8); },
      draw(cv, st) { drawL(cv, st); },
      readout: st => { const k = Math.min(9, Math.floor(st.lt)); return k ? `${k} × ${k} ＝ <b>${k * k}</b>` + (k > 1 ? `（${(k - 1) * (k - 1)} ＋ ${2 * k - 1}）` : '') : ''; }
    }
  ]
});
