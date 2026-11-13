// @id m1-04
// @title とけいの はりを うごかす
// @vol 数学1
// @from 数学 1-10 時こくと時間（ch1-10）／1-20・4-2・4-8・力-6 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// st.m は 0時0分から の 分（小数も よい）。長い はりは 1時間で 1まわり、みじかい はりは 12時間で 1まわり。

const FUN = m => ([0, 1, 3, 4, 6, 8].includes(m % 10) ? 'ぷん' : 'ふん');
const hm = m => { const t = Math.floor(m + 1e-6), h = Math.floor(t / 60) % 24, mi = t % 60; return [h, mi]; };
const hon12 = h => h % 12 === 0 && h ? 12 : h % 12;
const kanaTime = (m, h12) => { const [h, mi] = hm(m); const hh = h12 ? hon12(h) : h; return `${hh}じ` + (mi ? ` ${mi}${FUN(mi)}` : ''); };
const rubyTime = m => { const [h, mi] = hm(m); return `${hon12(h)}《時|じ》` + (mi ? `${mi}《分|${FUN(mi)}》` : ''); };

function clock(cv, cx, cy, R, m, o = {}) {
  cv.circle(cx, cy, R, { fill: 'panel', alpha: 1, color: 'ink', width: 3 });
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * A.TAU - Math.PI / 2, big = i % 5 === 0, r0 = R - (big ? 16 : 9);
    cv.line([[cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + (R - 3) * Math.cos(a), cy + (R - 3) * Math.sin(a)]], { color: 'ink', width: big ? 2.5 : 1 });
  }
  for (let k = 1; k <= 12; k++) { const a = k / 12 * A.TAU - Math.PI / 2; cv.text(String(k), cx + (R - 40) * Math.cos(a), cy + (R - 40) * Math.sin(a), { align: 'center', size: Math.max(16, R * 0.14), bold: true }); }
  if (o.fives) for (let k = 1; k <= 12; k++) { const a = k / 12 * A.TAU - Math.PI / 2; cv.text(String(k * 5 % 60 === 0 ? 60 : k * 5), cx + (R + 20) * Math.cos(a), cy + (R + 20) * Math.sin(a), { align: 'center', size: 15, color: 'c' }); }
  const am = (m % 60) / 60 * A.TAU - Math.PI / 2, ah = (m % 720) / 720 * A.TAU - Math.PI / 2;
  // 長い はりの 通った あと（緑の 点線）
  if (o.trail != null && m > o.trail) {
    const a0 = (o.trail % 60) / 60 * A.TAU - Math.PI / 2, a1 = a0 + Math.min(A.TAU - 1e-3, (m - o.trail) / 60 * A.TAU);
    cv.circle(cx, cy, R + 8, { color: 'c', width: 4, style: 'dash', a0, a1 });
  }
  cv.line([[cx, cy], [cx + R * 0.5 * Math.cos(ah), cy + R * 0.5 * Math.sin(ah)]], { color: 'ink', width: 10 });
  cv.line([[cx, cy], [cx + R * 0.9 * Math.cos(am), cy + R * 0.9 * Math.sin(am)]], { color: 'b', width: 4.5 });
  if (o.grip) cv.circle(cx + R * 0.9 * Math.cos(am), cy + R * 0.9 * Math.sin(am), 9, { color: 'b', width: 2, fill: 'b', alpha: 0.25 });
  cv.circle(cx, cy, 7, { fill: 'ink', alpha: 1 });
}
// 長い はりを ドラッグ：角度 → 分。12を こえたら 時も うごく（つづけて 数える）
function dragHand(cx, cy, R) {
  return {
    hit(st, x, y) { return Math.hypot(x - cx, y - cy) < R + 24 ? 1 : null; },
    move(st, x, y) {
      let a = Math.atan2(y - cy, x - cx) + Math.PI / 2; if (a < 0) a += A.TAU;
      const mm = Math.round(a / A.TAU * 60) % 60, cur = ((st.m % 60) + 60) % 60;
      let d = mm - cur; if (d > 30) d -= 60; if (d < -30) d += 60;
      st.m = A.clamp(Math.round(st.m + d), st.lo || 0, st.hi || 1439);
    }
  };
}
// ② の 再生は、つぎの 時を 5分 すぎるまで
function setStop(st) { st.stop = Math.floor(st.m / 60) * 60 + 65; }
function digital(cv, x, y, m, o = {}) {
  const [h, mi] = hm(m);
  cv.rect(x, y, 230, 80, { fill: 'panel', alpha: 1, color: 'line', width: 2 });
  cv.text(`${o.h12 ? hon12(h) : h}:${String(mi).padStart(2, '0')}`, x + 115, y + 42, { align: 'center', size: 46, bold: true, math: false });
  cv.text(o.label || 'デジタルどけい', x + 115, y - 14, { align: 'center', size: 15, color: 'sub' });
}

// ---------- ① 1まわり ----------
function drawMawaru(cv, st) {
  const cx = 250, cy = 230, R = 170;
  clock(cv, cx, cy, R, st.m, { fives: true, trail: 180 });
  // みじかい はりの すすんだ ところ
  const a0 = 3 / 12 * A.TAU - Math.PI / 2, a1 = ((st.m % 720) / 720) * A.TAU - Math.PI / 2;
  if (st.m > 180) cv.circle(cx, cy, R * 0.5 + 10, { color: 'ink', width: 3, style: 'dot', a0, a1 });
  digital(cv, 560, 80, st.m, { h12: true });
  const pass = Math.round(st.m - 180);
  cv.text(`ながい はりが すすんだ めもり：${pass}こ`, 560, 220, { size: 17, bold: true, color: 'b' });
  cv.text(`＝ ${pass}${FUN(pass)}`, 560, 252, { size: 17, color: 'b' });
  if (pass >= 60) { cv.text('1まわり ＝ 60ぷん ＝ 1じかん', 560, 310, { size: 18, bold: true, color: 'a' }); cv.text('みじかい はりは 3から 4へ', 560, 342, { size: 17, color: 'a' }); }
}
// ---------- ② 何時？ ----------
function drawYomu(cv, st) {
  const cx = 250, cy = 230, R = 170;
  clock(cv, cx, cy, R, st.m, { grip: true });
  const [h, mi] = hm(st.m), h12 = hon12(h), nx = h12 % 12 + 1;
  // みじかい はりが いる あいだ（h と h+1 の あいだ）を うすく ぬる
  const a0 = (h12 % 12) / 12 * A.TAU - Math.PI / 2, a1 = a0 + A.TAU / 12;
  const g = cv.g; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R * 0.62, a0, a1); g.closePath(); g.fillStyle = A.color('a'); g.globalAlpha = 0.16; g.fill(); g.globalAlpha = 1;
  digital(cv, 560, 80, st.m, { h12: true });
  cv.text(kanaTime(st.m, true), 675, 196, { align: 'center', size: 24, bold: true });
  if (mi) {
    cv.text(`みじかい はりは ${h12}と ${nx}の あいだ`, 560, 260, { size: 17, color: 'a', bold: true });
    cv.text(`→ まだ ${nx}じに なって いない`, 560, 292, { size: 17, color: 'a' });
    cv.text(`→ ${h12}じ ${mi}${FUN(mi)}`, 560, 324, { size: 17, color: 'a', bold: true });
  } else cv.text(`みじかい はりが ${h12}に ついた → ${h12}じ`, 560, 270, { size: 17, color: 'a', bold: true });
  cv.text('ながい はりを ゆびで まわそう', 560, 400, { size: 15, color: 'sub' });
}
// ---------- ③ 午前と午後 ----------
function drawGozen(cv, st) {
  const cx = 190, cy = 175, R = 140;
  clock(cv, cx, cy, R, st.m, { grip: true });
  const [h] = hm(st.m), pm = h >= 12;
  // 太陽と月（形で わける）
  const sx = 420, sy = 70;
  if (h >= 6 && h < 18) { cv.circle(sx, sy, 20, { fill: 'e', alpha: 1 }); for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; cv.line([[sx + 26 * Math.cos(t), sy + 26 * Math.sin(t)], [sx + 34 * Math.cos(t), sy + 34 * Math.sin(t)]], { color: 'e', width: 3 }); } }
  else { const g = cv.g; g.fillStyle = A.color('e'); g.beginPath(); g.arc(sx, sy, 20, 0, A.TAU); g.arc(sx + 9, sy - 6, 17, 0, A.TAU, true); g.fill('evenodd'); }
  cv.text(h >= 6 && h < 18 ? 'ひる' : 'よる', sx + 48, sy, { size: 18, bold: true });
  const ex = st.m % 720 === 0 ? (h === 12 ? 'ひるの 12じ（しょうご）' : 'よなかの 12じ') : (h === 12 ? 'ひるの ' : pm ? 'ごご ' : 'ごぜん ') + kanaTime(st.m, true);
  cv.text(ex, 420, 140, { size: 26, bold: true, color: pm ? 'b' : 'a' });
  cv.text(`24じかんせいで いうと ${hm(st.m)[0]}:${String(hm(st.m)[1]).padStart(2, '0')}`, 420, 182, { size: 16, color: 'sub' });
  cv.text(st.m >= 1440 ? 'みじかい はりは 2まわり した' : `みじかい はりは、 いま ${pm ? 2 : 1}まわりめ`, 420, 222, { size: 17 });
  // 1日の 帯
  const x0 = 40, x1 = 840, yb = 360, sx_ = (x1 - x0) / 1440, X = v => x0 + v * sx_;
  cv.rect(X(0), yb, X(720) - X(0), 36, { fill: 'a', alpha: 0.18, color: 'a', width: 1.5 });
  cv.rect(X(720), yb, X(1440) - X(720), 36, { fill: 'b', alpha: 0.18, color: 'b', width: 1.5, style: 'dash' });
  cv.text('ごぜん（よなか → ひる）', X(360), yb + 18, { align: 'center', size: 16, bold: true, color: 'a' });
  cv.text('ごご（ひる → よなか）', X(1080), yb + 18, { align: 'center', size: 16, bold: true, color: 'b' });
  for (let k = 0; k <= 24; k++) cv.line([[X(k * 60), yb + 36], [X(k * 60), yb + 36 + (k % 6 ? 6 : 12)]], { color: 'ink', width: k % 6 ? 1 : 2 });
  [[0, '0じ'], [6, '6'], [12, '12じ（しょうご）'], [18, '6'], [24, '12じ']].forEach(([k, s]) => cv.text(s, X(k * 60), yb + 62, { align: 'center', size: 15 }));
  cv.line([[X(st.m), yb - 6], [X(st.m), yb + 42]], { color: 'ink', width: 3 });
  cv.dot(X(st.m), yb - 8, { shape: 'tri', r: 8, color: 'ink' });
}

A.item({
  id: 'm1-04', title: 'とけいの はりを うごかす', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-10「《時|じ》こくと 《時間|じかん》」の《図|ず》から（1-20、 4-2・4-8 でも つかう）',
  W: 880, H: 440,
  state: { m: 180 },
  scenes: [
    {
      key: 'mawaru', label: '① 1まわりで 60《分|ぷん》',
      lead: '3《時|じ》から、 《長|なが》い はりを ぐるっと 1まわり させよう。 みじかい はりは どこへ いくかな？',
      note: '《長|なが》い はりの 1まわりは、 《小|ちい》さい 《目|め》もり 60こ、 つまり 60《分|ぷん》。 その あいだに みじかい はりは、 3から 4まで 1つ すすみます。 だから **60《分|ぷん》 ＝ 1《時間|じかん》** です。',
      legend: [['みじかい はり（ふとい）', { color: 'ink' }], ['《長|なが》い はり（ほそい）', { color: 'b' }], ['《長|なが》い はりが とおった ところ', { color: 'c', style: 'dash' }], ['みじかい はりが とおった ところ', { color: 'ink', style: 'dot' }]],
      state: { m: 180 },
      step(st, dt) { if (st.m >= 240) return false; st.m = Math.min(240, st.m + dt * 10); },
      draw(cv, st) { drawMawaru(cv, st); },
      readout: st => `いま：<b>${rubyTime(st.m)}</b>`
    },
    {
      key: 'yomu', label: '② なん《時|じ》 なん《分|ぷん》？',
      lead: '《長|なが》い はりを ゆびで まわしてみよう。 みじかい はりも いっしょに うごきます。',
      note: 'みじかい はりは、 8から 9まで 1《時間|じかん》 かけて ゆっくり すすみます。 みじかい はりが 8と 9の あいだに ある あいだは、 まだ 9《時|じ》に なって いないので 「8《時|じ》なん《分|ぷん》」です。 《長|なが》い はりが 12を こえると、 60《分|ぷん》で くり《上|あ》がって つぎの 《時|じ》に なります。',
      miss: '8《時|じ》50《分|ぷん》の とけいを 「9《時|じ》50《分|ぷん》」と よむ まちがい。 みじかい はりは 9の ちかくに ありますが、 まだ 9に ついて いないので 8《時|じ》です。',
      legend: [['みじかい はり', { color: 'ink' }], ['《長|なが》い はり（ゆびで うごかせる）', { color: 'b', shape: 'circle' }], ['みじかい はりが いる あいだ', { color: 'a', shape: 'square', noline: true }]],
      state: { m: 8 * 60 + 50, lo: 0, hi: 1439 },
      controls: [{ seg: 'm', label: 'はじめの 《時|じ》こく', options: [[8 * 60 + 50, '8《時|じ》50《分|ぷん》'], [8 * 60, '8《時|じ》'], [3 * 60 + 15, '3《時|じ》15《分|ふん》']], on(st) { setStop(st); } }],
      step(st, dt) { if (st.m >= st.stop) return false; st.m = Math.min(st.stop, st.m + dt * 6); },
      init(st) { setStop(st); },
      draw(cv, st) { drawYomu(cv, st); },
      drag: (() => { const d = dragHand(250, 230, 170); return { hit: d.hit, move(st, x, y) { d.move(st, x, y); setStop(st); } }; })(),
      readout: st => `いまの 《時|じ》こく：<b>${rubyTime(st.m)}</b>`
    },
    {
      key: 'gozen', label: '③ 《午前|ごぜん》と 《午後|ごご》',
      lead: '1《日|にち》は 24《時間|じかん》。 みじかい はりは 1《日|にち》に 2まわり します。 ▶ で 1《日|にち》を すすめよう。',
      note: 'よなかの 12《時|じ》から ひるの 12《時|じ》までを **《午前|ごぜん》**、 ひるの 12《時|じ》から よなかの 12《時|じ》までを **《午後|ごご》** と いいます。 あさの 7《時|じ》と よるの 7《時|じ》は、 はりが おなじ ところを さすので、 「《午前|ごぜん》7《時|じ》」「《午後|ごご》7《時|じ》」と いえば まちがえずに つたわります。',
      legend: [['《午前|ごぜん》', { color: 'a' }], ['《午後|ごご》', { color: 'b', style: 'dash' }], ['いま', { color: 'ink', shape: 'tri', noline: true }]],
      state: { m: 7 * 60, lo: 0, hi: 1440 },
      controls: [{ range: 'm', label: '《時|じ》こく', min: 0, max: 1440, step: 5, fmt: v => v >= 1440 ? 'よなかの 12じ' : (v >= 720 && v < 780 ? 'ひるの ' : v > 720 ? 'ごご ' : 'ごぜん ') + kanaTime(v, true) }],
      step(st, dt) { if (st.m >= 1440) { st.m = 1440; return false; } st.m = Math.min(1440, st.m + dt * 100); },
      draw(cv, st) { drawGozen(cv, st); },
      drag: (() => { const d = dragHand(190, 175, 140); return { hit(st, x, y) { if (y > 340 && y < 410) return 2; return d.hit(st, x, y); }, move(st, x, y, api, h) { if (h === 2) st.m = A.clamp(Math.round((x - 40) / 800 * 1440 / 5) * 5, 0, 1440); else d.move(st, x, y); } }; })(),
      readout: st => { const [h] = hm(st.m); return st.m >= 1440 ? 'よなかの 12《時|じ》：1《日|にち》が おわりました（みじかい はりは 2まわり）' : `${h < 12 ? '《午前|ごぜん》' : h === 12 ? 'ひるの' : '《午後|ごご》'} <b>${rubyTime(st.m)}</b>`; }
    }
  ]
});
