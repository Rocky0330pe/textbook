// @id m1-08
// @title ピザを わける 分数
// @vol 数学1
// @from 数学 1-16 半分と分数（ch1-16）／2-4・2-1 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 本（1-16）は 1/2 と 1/4 だけを あつかう。② では わける かずを 1〜8 に して、たくさんに わけるほど 1つ分が 小さく なるのを 見る。

const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
// 分数を たてに 書く
function frac(cv, x, y, num, den, o = {}) {
  const s = o.size || 26, w = Math.max(String(num).length, String(den).length) * s * 0.62 + 8;
  cv.text(String(num), x, y - s * 0.62, { align: 'center', size: s, bold: true, color: o.color });
  cv.line([[x - w / 2, y], [x + w / 2, y]], { color: o.color || 'ink', width: 2.5 });
  cv.text(String(den), x, y + s * 0.66, { align: 'center', size: s, bold: true, color: o.color });
}
// ピザ：n きれ、hi 番めの 1きれを こく ぬる。gap で きれを はなす
function pizza(cv, x, y, R, n, o = {}) {
  const g = cv.g, gap = o.gap || 0;
  for (let k = 0; k < n; k++) {
    const a0 = -Math.PI / 2 + k / n * A.TAU, a1 = a0 + A.TAU / n, am = (a0 + a1) / 2;
    const ox = n > 1 ? gap * Math.cos(am) : 0, oy = n > 1 ? gap * Math.sin(am) : 0;
    g.beginPath(); if (n > 1) g.moveTo(x + ox, y + oy); g.arc(x + ox, y + oy, R, a0, a1); g.closePath();
    const on = o.hi != null && k < (o.cnt || 1) && k >= o.hi;
    g.fillStyle = A.color(on ? 'b' : 'e'); g.globalAlpha = on ? 0.75 : 0.28; g.fill(); g.globalAlpha = 1;
    g.strokeStyle = A.color('ink'); g.lineWidth = 2; g.setLineDash([]); g.stroke();
    if (on) { g.save(); g.clip(); for (let s = -R; s < R; s += 9) { g.beginPath(); g.moveTo(x + ox + s, y + oy - R); g.lineTo(x + ox + s + R, y + oy + R); g.strokeStyle = A.color('bg'); g.globalAlpha = 0.5; g.lineWidth = 2; g.stroke(); } g.restore(); g.globalAlpha = 1; }
  }
}
function tape(cv, x, y, w, h, n, hi, o = {}) {
  for (let k = 0; k < n; k++) cv.rect(x + k * w / n, y, w / n, h, { fill: k < (hi || 0) ? (o.col || 'b') : 'e', alpha: k < (hi || 0) ? 0.7 : 0.22, color: 'ink', width: 1.5 });
}
function numline(cv, x0, x1, y, o = {}) {
  cv.line([[x0 - 10, y], [x1 + 10, y]], { color: 'ink', width: 2 });
  for (let i = 0; i <= 10; i++) { const x = x0 + (x1 - x0) * i / 10, big = i % 5 === 0; cv.line([[x, y - (big ? 9 : 5)], [x, y + (big ? 9 : 5)]], { color: 'ink', width: big ? 2 : 1 }); }
  cv.text('0', x0, y + 24, { align: 'center', size: 17 }); cv.text('1', x1, y + 24, { align: 'center', size: 17 });
  if (o.labels) for (let i = 1; i < 10; i++) cv.text('0.' + i, x0 + (x1 - x0) * i / 10, y + 24, { align: 'center', size: 14, color: i === 5 ? 'a' : 'sub', bold: i === 5 });
}

// ---------- ① 半分の 半分 ----------
function drawKiru(cv, st) {
  const t = st.t, R = 110, cy = 170;
  const c1 = ease(t - 1), c2 = ease(t - 3);
  // 1まい
  pizza(cv, 140, cy, R * 0.75, 1, {});
  cv.text('1まい', 140, cy + 115, { align: 'center', size: 18, bold: true });
  cv.arrow(240, cy, 290, cy, { color: 'a', width: 3 }); cv.text('はんぶん', 265, cy - 22, { align: 'center', size: 15, color: 'a', bold: true });
  // 半分
  if (t > 0.5) {
    pizza(cv, 410, cy, R * 0.75, c1 > 0 ? 2 : 1, { gap: 6 * c1, hi: c1 >= 1 ? 0 : null });
    if (c1 > 0 && c1 < 1) cv.line([[410, cy - 100], [410, cy - 100 + 200 * c1]], { color: 'b', width: 3, style: 'dash' });
    if (c1 >= 1) frac(cv, 410, cy + 125, 1, 2, { color: 'b' });
  }
  cv.arrow(510, cy, 560, cy, { color: 'a', width: 3 }); cv.text('また はんぶん', 535, cy - 22, { align: 'center', size: 15, color: 'a', bold: true });
  if (t > 2.5) {
    pizza(cv, 680, cy, R * 0.75, c2 > 0 ? 4 : 2, { gap: 6 + 2 * c2, hi: c2 >= 1 ? 0 : (c2 > 0 ? null : 0) });
    if (c2 > 0 && c2 < 1) cv.line([[580, cy], [580 + 200 * c2, cy]], { color: 'b', width: 3, style: 'dash' });
    if (c2 >= 1) frac(cv, 680, cy + 125, 1, 4, { color: 'b' });
  }
  if (t > 5) {
    cv.text('おなじ おおきさの 4きれの 1きれ', 680, 410, { align: 'center', size: 16, bold: true, color: 'b' });
    cv.text('2きれの 1きれ', 410, 410, { align: 'center', size: 16, color: 'sub' });
  }
}
// ---------- ② 分ける数を ふやす ----------
function drawWakeru(cv, st) {
  const n = st.n, cy = 150, R = 95;
  cv.text('くらべる', 140, 34, { align: 'center', size: 16, color: 'sub' });
  pizza(cv, 140, cy, R, 2, { hi: 0, gap: 3 });
  frac(cv, 140, cy + 135, 1, 2);
  pizza(cv, 400, cy, R, n, { hi: 0, gap: 3 });
  if (n === 1) cv.text('1まい', 400, cy + 135, { align: 'center', size: 22, bold: true }); else frac(cv, 400, cy + 135, 1, n, { color: 'b' });
  cv.text(`${n}つに わけた 1きれ`, 400, 34, { align: 'center', size: 16, bold: true, color: 'b' });
  // テープと 数直線
  const x0 = 560, x1 = 840;
  cv.text('テープ（1の ながさ）', x0, 70, { size: 15, color: 'sub' });
  tape(cv, x0, 86, x1 - x0, 28, 2, 1, { col: 'a' });
  tape(cv, x0, 124, x1 - x0, 28, n, 1);
  cv.text('1/2', x1 + 8, 100, { size: 15, color: 'sub' });
  numline(cv, x0, x1, 230, {});
  const X = v => x0 + (x1 - x0) * v;
  cv.dot(X(1 / 2), 230, { shape: 'square', r: 7, color: 'a' }); cv.text('1/2', X(1 / 2), 200, { align: 'center', size: 15, color: 'a', bold: true });
  cv.dot(X(1 / n), 230, { shape: 'tri', r: 9, color: 'b' }); cv.text(n === 1 ? '1' : `1/${n}`, X(1 / n), 268, { align: 'center', size: 16, color: 'b', bold: true });
  const cmp = n === 2 ? 'おなじ' : n > 2 ? '1/2 の ほうが おおきい' : '1まいの ほうが おおきい';
  cv.text(cmp, 700, 320, { align: 'center', size: 18, bold: true, color: n > 2 ? 'a' : 'ink' });
  if (n > 2) cv.text(`${n}は 2より おおきいけど、 1きれは ちいさい`, 700, 352, { align: 'center', size: 15, color: 'b' });
}
// ---------- ③ 0.5 と 1/2 ----------
function drawOnaji(cv, st) {
  const x0 = 120, x1 = 780, X = v => x0 + (x1 - x0) * v, n = st.parts;
  cv.text('2つに わけた テープ', x0, 60, { size: 15, color: 'sub' });
  tape(cv, x0, 76, x1 - x0, 36, 2, 1, { col: 'a' });
  frac(cv, X(0.25), 94, 1, 2, { size: 17 });
  if (n === 4) { cv.text('4つに わけた テープ', x0, 140, { size: 15, color: 'sub' }); tape(cv, x0, 156, x1 - x0, 36, 4, 2); frac(cv, X(0.125), 174, 1, 4, { size: 17 }); frac(cv, X(0.375), 174, 1, 4, { size: 17 }); }
  numline(cv, x0, x1, 290, { labels: true });
  cv.line([[X(0.5), 70], [X(0.5), 290]], { color: 'a', width: 2, style: 'dash' });
  // うごかす 点
  const v = st.v;
  cv.line([[X(0), 334], [X(v), 334]], { color: 'b', width: 6 });
  for (let i = 1; i <= Math.round(v * 10); i++) cv.line([[X(i / 10), 328], [X(i / 10), 340]], { color: 'bg', width: 2 });
  cv.dot(X(v), 290, { shape: 'diamond', r: 10, color: 'b' });
  cv.text(`0.1が ${Math.round(v * 10)}こ ＝ ${A.num(v, 1)}`, X(v), 362, { align: 'center', size: 18, bold: true, color: 'b' });
  if (Math.abs(v - 0.5) < 1e-6) cv.text('1/2 と おなじ おおきさ！', 450, 405, { align: 'center', size: 20, bold: true, color: 'a' });
  else cv.text('◆を ゆびで うごかそう', 450, 405, { align: 'center', size: 15, color: 'sub' });
}
// ---------- ④ あめ 8この 1/2・1/4 ----------
function candy(cv, x, y, col) {
  const g = cv.g; g.fillStyle = A.color(col); g.beginPath(); g.ellipse(x, y, 11, 8, 0, 0, A.TAU); g.fill();
  g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x - 19, y - 7); g.lineTo(x - 19, y + 7); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(x + 10, y); g.lineTo(x + 19, y - 7); g.lineTo(x + 19, y + 7); g.closePath(); g.fill();
}
function drawAme(cv, st) {
  const n = st.g, u = Math.min(st.t, 8);
  const gw = 820 / n;
  for (let j = 0; j < n; j++) cv.rect(30 + j * gw + 6, 210, gw - 12, 150, { color: j ? 'line' : 'b', width: j ? 1.5 : 3, style: j ? 'dash' : 'solid' });
  for (let i = 0; i < 8; i++) {
    const f = ease(A.clamp(u - i * 0.9, 0, 1)), j = i % n, r = Math.floor(i / n);
    const sx = 260 + i * 48, sy = 90, per = 8 / n, cols = Math.min(per, 2), tx = 30 + j * gw + gw / 2 + ((r % cols) - (cols - 1) / 2) * 50, ty = 255 + Math.floor(r / cols) * 44;
    candy(cv, sx + (tx - sx) * f, sy + (ty - sy) * f - Math.sin(f * Math.PI) * 40, j === 0 && f >= 1 ? 'b' : 'a');
  }
  cv.text('あめ 8こ', 150, 90, { align: 'center', size: 18, bold: true });
  if (u >= 7.2) {
    cv.text(`1/${n} は ${8 / n}こ`, 30 + gw / 2, 385, { align: 'center', size: 18, bold: true, color: 'b' });
    cv.text(`8 ÷ ${n} ＝ ${8 / n}`, 700, 150, { align: 'center', size: 26, bold: true, color: 'a' });
  }
}

A.item({
  id: 'm1-08', title: 'ピザを わける 《分数|ぶんすう》', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-16「《半分|はんぶん》と 《分数|ぶんすう》」の《図|ず》から（2-4、 2-1 でも つかう）',
  W: 880, H: 430,
  state: { t: 0, n: 2, v: 0, parts: 2, g: 2 },
  scenes: [
    {
      key: 'kiru', label: '① 《半分|はんぶん》の 《半分|はんぶん》',
      lead: 'ピザ 1まいを 《半分|はんぶん》に 《切|き》り、 それを また 《半分|はんぶん》に 《切|き》ります。 1きれは 1まいの どれだけ かな？',
      note: '《同|おな》じ 《大|おお》きさに 2つに わけた 1つ《分|ぶん》が $\\frac{1}{2}$（にぶんの いち）、 4つに わけた 1つ《分|ぶん》が $\\frac{1}{4}$（よんぶんの いち）。 《分数|ぶんすう》の 《下|した》の かずは いくつに わけたか、 《上|うえ》の かずは その うちの いくつ《分|ぶん》か です。',
      legend: [['1きれ（ぬって しるし）', { color: 'b', shape: 'square', noline: true }], ['《切|き》る ところ', { color: 'b', style: 'dash' }]],
      init(st) { st.t = 0; },
      step(st, dt) { if (st.t >= 6) return false; st.t = Math.min(6, st.t + dt); },
      draw(cv, st) { drawKiru(cv, st); },
      readout: st => st.t < 2 ? '1まい' : st.t < 4 ? '《半分|はんぶん》：$\\frac{1}{2}$' : '《半分|はんぶん》の 《半分|はんぶん》：$\\frac{1}{4}$（1まいの 4つ《分|ぶん》の 1）'
    },
    {
      key: 'kazu', label: '② わける かずを ふやす',
      lead: 'わける かずを ふやすと、 1きれは どう なるかな？ ▶ か スライダーで ためそう。',
      note: 'たくさんに わけるほど、 1つ《分|ぶん》は 《小|ちい》さく なります。 《数直線|すうちょくせん》の 《点|てん》も、 0の ほうへ ちかづきます。',
      miss: '「4は 2より 《大|おお》きいから、 $\\frac{1}{4}$ の ほうが 《大|おお》きい」と かんがえる まちがい。 4つに わけた 1きれは、 2つに わけた 1きれより 《小|ちい》さいので、 《大|おお》きいのは $\\frac{1}{2}$ です。',
      legend: [['1/2', { color: 'a', shape: 'square', noline: true }], ['1/わける かず', { color: 'b', shape: 'tri', noline: true }]],
      controls: [{ range: 'n', label: 'わける かず', min: 1, max: 8, step: 1, d: 0, fmt: v => v + 'つ' }],
      init(st) { st.acc = 0; },
      step(st, dt) { st.acc = (st.acc || 0) + dt; if (st.acc > 1.2) { st.acc = 0; if (st.n >= 8) return false; st.n++; } },
      draw(cv, st) { drawWakeru(cv, st); },
      readout: st => st.n === 1 ? 'わけない：1まい' : `${st.n}つに わけた 1つ《分|ぶん》：$\\frac{1}{${st.n}}$`
    },
    {
      key: 'onaji', label: '③ 0.5 と 1/2',
      lead: '0から 1までを 10に わけた 《数直線|すうちょくせん》と、 2つに わけた テープを ならべて みよう。',
      note: '1の 《半分|はんぶん》の ところは、 0.1が 5こ《分|ぶん》で 0.5。 0.5と $\\frac{1}{2}$ は、 **《同|おな》じ 《大|おお》きさ** を ちがう かきかたで あらわして います（0.1が 10こで 1、 その 《半分|はんぶん》は 5こ）。 $\\frac{1}{4}$ が 2つでも $\\frac{1}{2}$ と 《同|おな》じ 《長|なが》さです。',
      legend: [['テープの $\\frac{1}{2}$', { color: 'a', shape: 'square', noline: true }], ['0.1の いくつ《分|ぶん》', { color: 'b', shape: 'diamond' }]],
      state: { v: 0, parts: 2 },
      controls: [{ seg: 'parts', label: 'もう 1つの テープ', options: [[2, 'なし'], [4, '4つに わける']] }],
      init(st) { st.v = 0; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 0.7) { st.acc = 0; if (st.v >= 0.5 - 1e-9) return false; st.v = Math.round(st.v * 10 + 1) / 10; } },
      draw(cv, st) { drawOnaji(cv, st); },
      drag: { hit(st, x, y) { return y > 240 && y < 360 ? 1 : null; }, move(st, x) { st.v = A.clamp(Math.round((x - 120) / 660 * 10) / 10, 0, 1); } },
      readout: st => `0.1が ${Math.round(st.v * 10)}こ：<b>${A.num(st.v, 1)}</b>${Math.abs(st.v - 0.5) < 1e-6 ? ' ＝ $\\frac{1}{2}$' : ''}`
    },
    {
      key: 'ame', label: '④ あめ 8この 1/2・1/4',
      lead: 'あめ 8こを、 《同|おな》じ かずずつ わけて みよう。 8この $\\frac{1}{2}$ は なんこ かな？',
      note: '8こを 《同|おな》じ かずずつ 2つに わけた 1つ《分|ぶん》が、 8この $\\frac{1}{2}$。 わり《算|ざん》（1-14）で 8 ÷ 2 ＝ 4 です。 8この $\\frac{1}{4}$ は 8 ÷ 4 ＝ 2 で 2こ です。',
      legend: [['1つ《分|ぶん》の あめ', { color: 'b', shape: 'circle', noline: true }]],
      state: { g: 2 },
      controls: [{ seg: 'g', label: 'いくつに わける？', options: [[2, '2つ（1/2）'], [4, '4つ（1/4）']], on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { if (st.t >= 8) return false; st.t = Math.min(8, st.t + dt * 1.6); },
      draw(cv, st) { drawAme(cv, st); },
      readout: st => st.t >= 7.2 ? `8この $\\frac{1}{${st.g}}$ は <b>${8 / st.g}こ</b>（8 ÷ ${st.g} ＝ ${8 / st.g}）` : 'じゅんばんに くばって いる…'
    }
  ]
});
