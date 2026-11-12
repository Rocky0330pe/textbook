// @id m1-06
// @title くばる・わける わり算
// @vol 数学1
// @from 数学 1-14・1-15 わり算（ch1-14・ch1-15）／2-4・2-9・2-19 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// どちらも「n から k を なんかい ひけるか」。1こ うごかす たびに st.s を 1 すすめる。

const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
const RC = ['a', 'b', 'c', 'd', 'e'];
const pileXY = i => [52 + (i % 4) * 32, 120 + Math.floor(i / 4) * 32];
function ohajiki(cv, x, y, col, r = 11) { cv.circle(x, y, r, { fill: col, alpha: 0.85, color: col, width: 1.5 }); }
function kid(cv, x, y, j) {
  const col = RC[j % 5];
  cv.circle(x, y, 15, { fill: 'panel', alpha: 1, color: col, width: 2.5 });
  cv.poly([[x - 20, y + 42], [x - 14, y + 18], [x + 14, y + 18], [x + 20, y + 42]], { fill: col, alpha: 0.35, color: col, width: 2 });
  cv.text(String(j + 1), x, y, { align: 'center', size: 15, bold: true, color: col });
}
function plate(cv, x, y, w) { const g = cv.g; g.beginPath(); g.ellipse(x, y, w / 2, w / 5, 0, 0, A.TAU); g.fillStyle = A.color('panel'); g.fill(); g.strokeStyle = A.color('sub'); g.lineWidth = 2; g.stroke(); }
// 数直線：n から k ずつ もどる
function numline(cv, n, k, rounds, o = {}) {
  const x0 = 50, x1 = 840, y = 415, dx = (x1 - x0) / Math.max(n, 1);
  cv.line([[x0 - 10, y], [x1 + 10, y]], { color: 'ink', width: 2 });
  for (let i = 0; i <= n; i++) { cv.line([[x0 + i * dx, y - 6], [x0 + i * dx, y + 6]], { color: 'ink', width: 1.5 }); cv.text(String(i), x0 + i * dx, y + 20, { align: 'center', size: 15 }); }
  cv.dot(x0 + n * dx, y, { r: 6, color: 'a' });
  for (let r = 0; r < rounds; r++) {
    const a = n - r * k, b = a - k, xa = x0 + a * dx, xb = x0 + b * dx, h = 34;
    if (k === 0) { cv.circle(xa, y - 22, 14, { color: 'b', width: 2.5, a0: Math.PI * 0.6, a1: Math.PI * 2.4 }); if (r === 0) cv.text('−0：へらない！', xa - 20, y - 50, { align: 'right', size: 15, bold: true, color: 'b' }); continue; }
    const pts = []; for (let s = 0; s <= 20; s++) { const u = s / 20; pts.push([lerp(xa, xb, u), y - 4 - h * 4 * u * (1 - u)]); }
    cv.line(pts, { color: o.col || 'a', width: 2.5 });
    cv.arrow(pts[18][0], pts[18][1], xb, y - 4, { color: o.col || 'a', width: 2.5 });
    cv.text(`${r + 1}${o.unit || 'かいめ'} −${k}`, (xa + xb) / 2, y - h - 14, { align: 'center', size: 15, bold: true, color: o.col || 'a' });
  }
}
function pile(cv, n, taken) { for (let i = 0; i < n - taken; i++) { const p = pileXY(i); ohajiki(cv, p[0], p[1], 'sub'); } }
const maxMove = (n, k) => k ? Math.floor(n / k) * k : 0;

// ---------- ① くばる ----------
const kidX = j => 300 + j * 92;
function drawKubaru(cv, st) {
  const n = st.n, k = st.k, S = Math.min(st.s, maxMove(n, k)), full = Math.floor(S), u = ease(S - full);
  cv.text(`おはじき ${n}こ`, 40, 80, { size: 16, bold: true });
  for (let j = 0; j < k; j++) kid(cv, kidX(j), 72, j);
  pile(cv, n, Math.min(maxMove(n, k), full + (u > 0 ? 1 : 0)));
  for (let q = 0; q <= full && q < maxMove(n, k); q++) {
    const f = q < full ? 1 : u; if (f <= 0) continue;
    const from = pileXY(n - 1 - q), j = q % k, r = Math.floor(q / k), to = [kidX(j), 145 + r * 26];
    ohajiki(cv, lerp(from[0], to[0], f), lerp(from[1], to[1], f) - Math.sin(f * Math.PI) * 40, RC[r % 5], 10);
    if (j === 0 && f >= 1) cv.text(`${r + 1}かいめ`, kidX(0) - 34, to[1], { align: 'right', size: 15, color: RC[r % 5] });
  }
  const rounds = Math.floor(full / k);
  numline(cv, n, k, rounds);
  const left = n - full;
  cv.text(`のこり ${left}こ`, 40, 300, { size: 18, bold: true, color: left > 0 && left < k ? 'b' : 'ink' });
  if (S >= maxMove(n, k) && left > 0) cv.text(`${k}にんに 1こずつ くばれない`, 40, 328, { size: 15, color: 'b' });
}
// ---------- ② わける ----------
const plateXY = p => [330 + (p % 5) * 104, 150 + Math.floor(p / 5) * 110];
function drawWakeru(cv, st) {
  const n = st.n, k = st.k, M = maxMove(n, k), S = Math.min(st.s, M), full = Math.floor(S), u = ease(S - full);
  cv.text(`おはじき ${n}こ`, 40, 80, { size: 16, bold: true });
  pile(cv, n, Math.min(M, full + (u > 0 ? 1 : 0)));
  const plates = Math.ceil((full + (u > 0 ? 1 : 0)) / k);
  for (let p = 0; p < plates; p++) { const c = plateXY(p); plate(cv, c[0], c[1], 90); cv.text(`${p + 1}まいめ`, c[0], c[1] + 38, { align: 'center', size: 15, color: 'sub' }); }
  for (let q = 0; q <= full && q < M; q++) {
    const f = q < full ? 1 : u; if (f <= 0) continue;
    const p = Math.floor(q / k), i = q % k, c = plateXY(p), to = [c[0] + ((i % 3) - 1) * 22, c[1] - 8 - Math.floor(i / 3) * 18], from = pileXY(n - 1 - q);
    ohajiki(cv, lerp(from[0], to[0], f), lerp(from[1], to[1], f) - Math.sin(f * Math.PI) * 40, RC[p % 5], 9);
  }
  numline(cv, n, k, Math.floor(full / k), { unit: 'まいめ', col: 'c' });
  const left = n - full;
  cv.text(`のこり ${left}こ`, 40, 300, { size: 18, bold: true, color: left > 0 && left < k ? 'b' : 'ink' });
}
// ---------- ③ 0で わる ----------
function drawZero(cv, st) {
  const n = 12;
  if (st.mode === 'nin') {
    pile(cv, n, 0);
    cv.rect(330, 90, 360, 160, { color: 'sub', style: 'dash', width: 2 });
    cv.text('？', 510, 170, { align: 'center', size: 60, bold: true, color: 'sub' });
    cv.text('わける ひとが いない', 510, 280, { align: 'center', size: 18, bold: true, color: 'b' });
    cv.text('12 ÷ 0：くばれない', 510, 316, { align: 'center', size: 17 });
    numline(cv, n, 0, 0);
    return;
  }
  const plates = Math.floor(st.s);
  pile(cv, n, 0);
  for (let p = 0; p < Math.min(plates, 10); p++) { const c = plateXY(p); plate(cv, c[0], c[1], 90); cv.text(`${p + 1}まいめ`, c[0], c[1] + 38, { align: 'center', size: 15, color: 'sub' }); }
  cv.text('のこり 12こ', 40, 300, { size: 18, bold: true, color: 'b' });
  cv.text(`おさら ${plates}まい`, 40, 328, { size: 16 });
  numline(cv, n, 0, plates ? 1 : 0);
  if (plates >= 10) cv.text('なんかい のせても へらない。 おわらない！', 560, 310, { align: 'center', size: 17, bold: true, color: 'b' });
}
// ---------- ④ あまり ----------
function drawAmari(cv, st) {
  const n = st.n, k = 3, P = st.stop ? 3 : Math.floor(n / k);
  pile(cv, 0, 0);
  for (let p = 0; p < P; p++) { const c = plateXY(p); plate(cv, c[0] - 250, c[1], 90); for (let i = 0; i < k; i++) ohajiki(cv, c[0] - 250 + (i - 1) * 22, c[1] - 8, RC[p % 5], 9); }
  const left = n - P * k;
  for (let i = 0; i < left; i++) ohajiki(cv, 60 + i * 26, 360, 'b', 10);
  cv.rect(42, 342, left * 26 + 10, 36, { color: left >= k ? 'b' : 'c', width: 2, style: left >= k ? 'solid' : 'dash' });
  cv.text(`のこり ${left}こ`, 60 + left * 26 + 12, 360, { size: 17, bold: true, color: left >= k ? 'b' : 'c' });
  if (left >= k) { cv.text('まだ 3こ くばれる！', 300, 320, { size: 18, bold: true, color: 'b' }); }
  // ひょう
  const x0 = 560, y0 = 90;
  cv.text('3こずつ わけた のこり', x0, y0 - 40, { size: 16, bold: true });
  for (let m = 12; m <= 20; m++) {
    const y = y0 + (m - 12) * 30, on = m === n;
    if (on) cv.rect(x0 - 6, y - 14, 280, 28, { fill: 'hl', alpha: 1 });
    cv.text(`${m}こ → ${Math.floor(m / 3)}さら、 のこり ${m % 3}`, x0, y, { size: 16, bold: on, color: m <= n ? 'ink' : 'sub' });
  }
}

A.item({
  id: 'm1-06', title: 'くばる・わける わり《算|ざん》', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-14・1-15「わり《算|ざん》」の《図|ず》から（2-4・2-9 でも つかう）',
  W: 880, H: 450,
  state: { n: 12, k: 3, s: 0, mode: 'kozutsu', stop: false },
  scenes: [
    {
      key: 'kubaru', label: '① くばる',
      lead: 'おはじきを、 1こずつ じゅんばんに くばろう（はじめは 12こを 3《人|にん》に）。 ひとり なんこ かな？',
      note: '1かい くばる たびに、 おはじきは 3こ へります。 12 － 3 － 3 － 3 － 3 ＝ 0。 4かいで なくなったので、 ひとり 4こ。 **12 ÷ 3 ＝ 4** です。',
      legend: [['のこりの おはじき', { color: 'sub', shape: 'circle', noline: true }], ['1かいめに くばった ぶん', { color: 'a', shape: 'circle', noline: true }], ['3こ へった（すうちょくせん）', { color: 'a' }]],
      controls: [{ range: 'n', label: 'おはじき', min: 2, max: 18, step: 1, d: 0, fmt: v => v + 'こ', on(st) { st.s = 0; } }, { range: 'k', label: '《人数|にんずう》', min: 2, max: 6, step: 1, d: 0, fmt: v => v + '《人|にん》', on(st) { st.s = 0; } }],
      init(st) { st.s = 0; },
      step(st, dt) { if (st.s >= maxMove(st.n, st.k)) return false; st.s = Math.min(maxMove(st.n, st.k), st.s + dt * 3); },
      draw(cv, st) { drawKubaru(cv, st); },
      readout: st => { const M = maxMove(st.n, st.k), q = Math.floor(st.n / st.k), r = st.n % st.k; return st.s >= M ? `<b>${st.n} ÷ ${st.k} ＝ ${q}${r ? ` あまり ${r}` : ''}</b>（ひとり ${q}こ${r ? `、 ${r}こ のこる` : ''}）` : `${Math.floor(Math.floor(st.s) / st.k)}かい くばった。 のこり ${st.n - Math.floor(st.s)}こ`; }
    },
    {
      key: 'wakeru', label: '② 3こずつ わける',
      lead: 'こんどは、 おなじ かずずつ おさらに のせよう（はじめは 12こを 3こずつ）。 おさらは なんまい いるかな？',
      note: '3こずつ のせても、 1まい のせる たびに 3こ へります。 くばるのと おなじく 「12から 3を なんかい ひけるか」を しらべて いるので、 どちらも **12 ÷ 3 ＝ 4** に なります。',
      legend: [['のこりの おはじき', { color: 'sub', shape: 'circle', noline: true }], ['おさらに のせた ぶん', { color: 'a', shape: 'circle', noline: true }], ['3こ へった（すうちょくせん）', { color: 'c' }]],
      controls: [{ range: 'n', label: 'おはじき', min: 2, max: 18, step: 1, d: 0, fmt: v => v + 'こ', on(st) { st.s = 0; } }, { range: 'k', label: 'なんこずつ', min: 2, max: 6, step: 1, d: 0, fmt: v => v + 'こずつ', on(st) { st.s = 0; } }],
      init(st) { st.s = 0; },
      step(st, dt) { if (st.s >= maxMove(st.n, st.k)) return false; st.s = Math.min(maxMove(st.n, st.k), st.s + dt * 3); },
      draw(cv, st) { drawWakeru(cv, st); },
      readout: st => { const M = maxMove(st.n, st.k), q = Math.floor(st.n / st.k), r = st.n % st.k; return st.s >= M ? `<b>${st.n} ÷ ${st.k} ＝ ${q}${r ? ` あまり ${r}` : ''}</b>（おさら ${q}まい${r ? `、 ${r}こ のこる` : ''}）` : `おさら ${Math.ceil(Math.floor(st.s) / st.k)}まい。 のこり ${st.n - Math.floor(st.s)}こ`; }
    },
    {
      key: 'zero', label: '③ 0で わる？',
      lead: '12こを 0こずつ わけると、 どう なるかな？ ▶ を おして 《見|み》て みよう。',
      note: '12から 0を ひいても 12の まま。 なんかい ひいても へらないので、 おわりません。 0《人|にん》で わけようと しても、 わける 《人|ひと》が いません。 だから **0で わる わり《算|ざん》は できません**。 （0 × □ ＝ 12 に なる □は ないからです。）',
      legend: [['のこりの おはじき（へらない）', { color: 'sub', shape: 'circle', noline: true }], ['0 ひいた', { color: 'b' }]],
      state: { mode: 'kozutsu' },
      controls: [{ seg: 'mode', label: 'わけかた', options: [['kozutsu', '0こずつ わける'], ['nin', '0《人|にん》で わける']], on(st) { st.s = 0; } }],
      init(st) { st.s = 0; },
      step(st, dt) { if (st.mode === 'nin' || st.s >= 10) return false; st.s = Math.min(10, st.s + dt * 1.5); },
      draw(cv, st) { drawZero(cv, st); },
      readout: st => st.mode === 'nin' ? '12 ÷ 0：わける 《人|ひと》が いない' : `おさら ${Math.floor(st.s)}まい、 のこりは ずっと 12こ`
    },
    {
      key: 'amari', label: '④ あまりは わる《数|かず》より 《小|ちい》さい',
      lead: 'おはじきを 1こずつ ふやして、 3こずつ わけよう。 のこりは どう かわるかな？',
      note: 'のこりは 0、 1、 2、 0、 1、 2… と くりかえし、 3には なりません。 3こ いじょう のこって いたら、 もう 1さら できるからです。 だから **あまりは わる《数|かず》の 3より 《小|ちい》さく** なります。',
      miss: '14 ÷ 3 を 「3 あまり 5」と する まちがい。 のこりの 5こから、 まだ 3こ くばれます。 ただしくは 4 あまり 2 です。',
      legend: [['のこり（3より 《小|ちい》さい）', { color: 'c', style: 'dash' }], ['のこり（まだ くばれる）', { color: 'b' }]],
      state: { n: 14, stop: false },
      controls: [{ range: 'n', label: 'おはじき', min: 12, max: 20, step: 1, d: 0, fmt: v => v + 'こ' }, { check: 'stop', label: 'ためす', text: '3さらで やめて みる（まちがい）' }],
      init(st) { st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 1) { st.acc = 0; if (st.n >= 20) return false; st.n++; } },
      draw(cv, st) { drawAmari(cv, st); },
      readout: st => st.stop ? `${st.n} ÷ 3 ＝ 3 あまり ${st.n - 9}？ → のこりが 3こ いじょう なので まちがい` : `<b>${st.n} ÷ 3 ＝ ${Math.floor(st.n / 3)}${st.n % 3 ? ' あまり ' + (st.n % 3) : ''}</b>`
    }
  ]
});
