// @id m1-10
// @title 温度計から おれ線グラフへ
// @vol 数学1
// @from 数学 1-18 おれ線グラフ（ch1-18）／2-3・3-5・5-1・熱-1 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 本の表：8時 15、9時 16、10時 18、11時 21、12時 23、13時 24、14時 24、15時 23、16時 21、17時 19（℃）。

const T = [15, 16, 18, 21, 23, 24, 24, 23, 21, 19];
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const G = { x0: 80, x1: 560, yb: 380, px: 18 };       // 1目もり 1℃、10℃から（≈）
const X = i => G.x0 + 34 + i * 48, Y = v => G.yb - (v - 10) * G.px;
function grid(cv, o = {}) {
  for (let v = 10; v <= 25; v++) cv.line([[G.x0, Y(v)], [G.x1, Y(v)]], { color: v % 5 ? 'grid' : 'line', width: v % 5 ? 1 : 1.5 });
  for (let v = 10; v <= 25; v += o.even ? 2 : 5) cv.text(String(v), G.x0 - 8, Y(v), { align: 'right', size: 15, bold: true });
  cv.line([[G.x0, G.yb + 2], [G.x0, Y(25) - 14]], { color: 'ink', width: 2 });
  cv.line([[G.x0, G.yb], [G.x1, G.yb]], { color: 'ink', width: 2 });
  const y = G.yb - 8; cv.line([[G.x0 - 7, y + 4], [G.x0 - 2, y - 3], [G.x0 + 2, y + 3], [G.x0 + 7, y - 4]], { color: 'b', width: 2.5 });
  cv.text('（℃）', G.x0 - 6, Y(25) - 26, { align: 'right', size: 15, color: 'sub' });
  T.forEach((v, i) => cv.text(`${8 + i}`, X(i), G.yb + 27, { align: 'center', size: 15 }));
  cv.text('（じ）', G.x1 + 6, G.yb + 27, { size: 15, color: 'sub' });
}
function thermo(cv, x, v, a = 1) {
  const g = cv.g; g.globalAlpha = a;
  cv.rect(x - 8, Y(25) - 10, 16, G.yb - Y(25) + 10, { fill: 'bg', alpha: 1, color: 'sub', width: 1.5 });
  g.globalAlpha = a; cv.circle(x, G.yb + 2, 12, { fill: 'b', alpha: a, color: 'sub', width: 1.5 });
  g.globalAlpha = a; cv.rect(x - 4, Y(v), 8, G.yb - Y(v), { fill: 'b', alpha: a });
  g.globalAlpha = 1;
}

// ---------- ① 温度計の 先を つなぐ ----------
function drawOndo(cv, st) {
  const t = st.t;
  grid(cv);
  const lineU = A.clamp((t - 10.3) / 2, 0, 1), fade = 1 - 0.7 * A.clamp((t - 12.5) / 1, 0, 1);
  T.forEach((v, i) => {
    if (t < i) return;
    const u = ease((t - i) / 0.7), vv = 10 + (v - 10) * u;
    thermo(cv, X(i), vv, fade);
    if (u >= 1) { cv.dot(X(i), Y(v), { r: 6, color: 'a' }); if (lineU <= 0) cv.text(String(v), X(i), Y(v) - 26, { align: 'center', size: 15, bold: true, color: 'b' }); }
  });
  if (lineU > 0) {
    const s = lineU * (T.length - 1), k = Math.floor(s), f = s - k, pts = T.slice(0, k + 1).map((v, i) => [X(i), Y(v)]);
    if (k < T.length - 1) pts.push([X(k) + (X(k + 1) - X(k)) * f, Y(T[k]) + (Y(T[k + 1]) - Y(T[k])) * f]);
    cv.line(pts, { color: 'a', width: 3.5 });
    T.forEach((v, i) => cv.dot(X(i), Y(v), { r: 6, color: 'a' }));
  }
  const x1 = 600;
  cv.text('1じかんごとに はかった', x1, 70, { size: 17, bold: true });
  const k = Math.min(9, Math.floor(t));
  for (let i = 0; i <= k; i++) cv.text(`${8 + i}じ　${T[i]}℃`, x1 + (i < 5 ? 0 : 130), 110 + (i % 5) * 30, { size: 16, color: i === k && t < 10.3 ? 'b' : 'ink', bold: i === k && t < 10.3 });
  if (lineU >= 1) { cv.text('あかい ところの はしを', x1, 290, { size: 17, bold: true, color: 'a' }); cv.text('つないだ グラフ', x1, 318, { size: 17, bold: true, color: 'a' }); }
}
// ---------- ② 点を うつ ----------
function drawUtsu(cv, st) {
  grid(cv, { even: true });
  const h = st.h, k = Math.min(9, Math.floor(h)), f = h - k;
  const pts = [];
  for (let i = 0; i < k; i++) pts.push([X(i), Y(T[i])]);
  if (pts.length > 1) cv.line(pts, { color: 'a', width: 3 });
  pts.forEach(p => cv.dot(p[0], p[1], { r: 6, color: 'a' }));
  if (k <= 9) {
    const v = T[k], u1 = ease(f / 0.4), u2 = ease((f - 0.4) / 0.4);
    if (u1 > 0) cv.arrow(X(k), G.yb - 2, X(k), G.yb - 2 + (Y(v) - G.yb + 2) * u1, { color: 'a', width: 2.5 });
    if (u2 > 0) cv.arrow(G.x0 + 2, Y(v), G.x0 + 2 + (X(k) - G.x0 - 2) * u2, Y(v), { color: 'c', width: 2.5, style: 'dash' });
    if (f >= 0.85) { cv.dot(X(k), Y(v), { r: 8, color: 'b', shape: 'diamond' }); cv.text('ここ！', X(k) + 14, Y(v) - 16, { size: 16, bold: true, color: 'b', bg: true }); if (k > 0) cv.line([[X(k - 1), Y(T[k - 1])], [X(k), Y(v)]], { color: 'a', width: 3 }); }
  }
  const x1 = 600, v = T[k];
  cv.text(`${8 + k}じの きおんは ${v}℃`, x1, 70, { size: 18, bold: true });
  cv.text('① よこの ' + (8 + k) + 'じから うえへ', x1, 120, { size: 16, color: 'a' });
  cv.text('② たての ' + v + 'から みぎへ', x1, 152, { size: 16, color: 'c' });
  cv.text('③ ぶつかる ところに てん', x1, 184, { size: 16, color: 'b' });
  cv.text('1めもりは 1℃', x1, 240, { size: 15, color: 'sub' });
  cv.text('（すうじは 2めもりごと）', x1, 264, { size: 15, color: 'sub' });
  cv.text('グラフを ゆびで さわっても', x1, 330, { size: 15, color: 'sub' });
  cv.text('えらべるよ', x1, 354, { size: 15, color: 'sub' });
}
// ---------- ③ かたむき ----------
function drawKyuu(cv, st) {
  grid(cv);
  const pts = T.map((v, i) => [X(i), Y(v)]);
  cv.line(pts, { color: 'a', width: 3 });
  pts.forEach(p => cv.dot(p[0], p[1], { r: 5, color: 'a' }));
  const k = st.k, d = T[k + 1] - T[k];
  cv.line([pts[k], pts[k + 1]], { color: 'b', width: 7 });
  cv.line([pts[k], [pts[k + 1][0], pts[k][1]]], { color: 'sub', width: 2, style: 'dash' });
  cv.line([[pts[k + 1][0], pts[k][1]], pts[k + 1]], { color: d >= 0 ? 'c' : 'd', width: 4 });
  cv.text('1じかん', (pts[k][0] + pts[k + 1][0]) / 2, pts[k][1] + (d >= 0 ? 16 : -16), { align: 'center', size: 15, color: 'sub', bg: true });
  const far = pts[k + 1][0] > 440, lx = far ? pts[k][0] - 10 : pts[k + 1][0] + 10, ly = far ? (pts[k][1] + pts[k + 1][1]) / 2 + 26 : (pts[k][1] + pts[k + 1][1]) / 2;
  cv.text(d ? `${Math.abs(d)}℃ ${d > 0 ? 'あがった' : 'さがった'}` : 'かわらない', lx, ly, { size: 16, bold: true, color: d >= 0 ? 'c' : 'd', bg: true, align: far ? 'right' : 'left' });
  // 1時間ごとの ちがい（ぼう）
  const x1 = 610, y0 = 230;
  cv.text('1じかんで かわった ℃', x1, 60, { size: 16, bold: true });
  cv.line([[x1, y0], [x1 + 250, y0]], { color: 'ink', width: 1.5 });
  for (let i = 0; i < 9; i++) {
    const di = T[i + 1] - T[i], bx = x1 + 6 + i * 27, h = di * 28;
    cv.rect(bx, h >= 0 ? y0 - h : y0, 20, Math.abs(h) || 2, { fill: i === k ? 'b' : di >= 0 ? 'c' : 'd', alpha: i === k ? 0.9 : 0.5 });
    cv.text(String(Math.abs(di)), bx + 10, di >= 0 ? y0 - h - 12 : y0 - h + 12, { align: 'center', size: 14, bold: i === k });
    cv.text(String(8 + i), bx + 10, di < 0 ? y0 - 12 : y0 + 14, { align: 'center', size: 14, color: 'sub' });
  }
  cv.text('（なんじから の 1じかん）', x1, y0 + 100, { size: 15, color: 'sub' });
  const top = d === 3;
  cv.text(top ? 'いちばん きゅう！ いちばん はやく あがった' : d === 0 ? 'たいら：かわらない' : d < 0 ? 'さがった' : 'あがった', x1, y0 + 140, { size: 16, bold: true, color: top ? 'b' : 'ink' });
}

A.item({
  id: 'm1-10', title: '《温度計|おんどけい》から おれ《線|せん》グラフへ', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-18「おれ《線|せん》グラフ」の《図|ず》から（2-3、 3-5・5-1、 《物理|ぶつり》 《熱|ねつ》-1 でも つかう）',
  W: 880, H: 430,
  state: { t: 0, h: 0, k: 2, hh: 10 },
  scenes: [
    {
      key: 'ondokei', label: '① 《温度計|おんどけい》の はしを つなぐ',
      lead: '1《時間|じかん》ごとに 《気温|きおん》を はかります。 《温度計|おんどけい》の あかい ところの はしに、 《点|てん》が のこって いくよ。',
      note: '《点|てん》を じゅんに 《線|せん》で むすんだ グラフを、 **おれ《線|せん》グラフ** と いいます。 《線|せん》が 《点|てん》の ところで おれまがって いるからです。 《線|せん》が 《上|うえ》へ むかうと ふえる、 《下|した》へ むかうと へる。',
      legend: [['《温度計|おんどけい》の えき', { color: 'b', shape: 'circle', noline: true }], ['はかった 《点|てん》と おれ《線|せん》', { color: 'a', shape: 'circle' }]],
      init(st) { st.t = 0; },
      step(st, dt) { if (st.t >= 13.5) return false; st.t = Math.min(13.5, st.t + dt * 1.4); },
      draw(cv, st) { drawOndo(cv, st); },
      readout: st => { const k = Math.min(9, Math.floor(st.t)); return `${8 + k}《時|じ》：<b>${T[k]}℃</b>`; }
    },
    {
      key: 'utsu', label: '② 《点|てん》を うつ',
      lead: 'よこの 《目|め》もりで 《時|じ》こくを、 たての 《目|め》もりで 《気温|きおん》を さがして、 2つが かさなる ところに 《点|てん》を うとう。',
      note: '① たての 1《目|め》もりを たしかめる（ここでは 1℃）。 ② よこの 《時|じ》こくから まっすぐ 《上|うえ》へ。 ③ たての 《気温|きおん》から まっすぐ 《右|みぎ》へ。 ④ ぶつかる ところに 《点|てん》を うつ。 となりの 《点|てん》どうしを じょうぎで まっすぐ むすびます。',
      legend: [['《時|じ》こくから 《上|うえ》へ', { color: 'a' }], ['《気温|きおん》から 《右|みぎ》へ', { color: 'c', style: 'dash' }], ['うつ 《点|てん》', { color: 'b', shape: 'diamond', noline: true }]],
      state: { h: 2, hh: 10 },
      controls: [{ range: 'hh', label: '《時|じ》こく', min: 8, max: 17, step: 1, d: 0, fmt: v => v + '《時|じ》', on(st) { st.h = st.hh - 8 + 0.99; } }],
      init(st) { st.h = 0; },
      step(st, dt) { if (st.h >= 9.99) return false; st.h = Math.min(9.99, st.h + dt * 0.8); st.hh = 8 + Math.min(9, Math.floor(st.h)); },
      draw(cv, st) { drawUtsu(cv, st); },
      drag: { hit(st, x, y) { return x > G.x0 && x < G.x1 && y > 40 && y < G.yb + 30 ? 1 : null; }, move(st, x) { const i = A.clamp(Math.round((x - G.x0 - 34) / 48), 0, 9); st.h = i + 0.99; st.hh = 8 + i; } },
      readout: st => { const k = Math.min(9, Math.floor(st.h)); return `${8 + k}《時|じ》の 《気温|きおん》は <b>${T[k]}℃</b>`; }
    },
    {
      key: 'kyuu', label: '③ かたむきと はやさ',
      lead: '《点|てん》と 《点|てん》の あいだは、 どこも 《同|おな》じ 1《時間|じかん》。 かたむきが きゅうな ところほど、 はやく かわります。',
      note: '10《時|じ》から 11《時|じ》は 21 － 18 ＝ 3℃。 1、 2、 3、 2、 1 の 《中|なか》で いちばん 《大|おお》きい ので、 **いちばん はやく 《上|あ》がったのは 10《時|じ》から 11《時|じ》** です。 かたむきが きゅうなほど、 はやく かわります。',
      miss: '「いちばん はやく 《上|あ》がったのは 13《時|じ》（いちばん 《高|たか》い）」と する まちがい。 12《時|じ》から 13《時|じ》は 24 － 23 ＝ 1℃しか 《上|あ》がって いません。 「《高|たか》い」と 「はやく 《上|あ》がる」は ちがいます。 《高|たか》さでは なく、 かたむきを 《見|み》よう。',
      legend: [['えらんだ 1《時間|じかん》', { color: 'b' }], ['《上|あ》がった ぶん', { color: 'c' }], ['《下|さ》がった ぶん', { color: 'd' }], ['1《時間|じかん》（よこ）', { color: 'sub', style: 'dash' }]],
      state: { k: 2 },
      controls: [{ range: 'k', label: 'しらべる 1《時間|じかん》', min: 0, max: 8, step: 1, d: 0, fmt: v => `${8 + v}→${9 + v}《時|じ》` }],
      init(st) { st.acc = 0; st.k = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 1.3) { st.acc = 0; if (st.k >= 8) return false; st.k++; } },
      draw(cv, st) { drawKyuu(cv, st); },
      drag: { hit(st, x, y) { return x > G.x0 && x < G.x1 && y > 40 && y < G.yb ? 1 : null; }, move(st, x) { st.k = A.clamp(Math.floor((x - G.x0 - 34) / 48), 0, 8); } },
      readout: st => { const d = T[st.k + 1] - T[st.k]; return `${8 + st.k}《時|じ》から ${9 + st.k}《時|じ》：` + (d >= 0 ? `${T[st.k + 1]} － ${T[st.k]} ＝ <b>${d}℃</b> 《上|あ》がった` : `${T[st.k]} － ${T[st.k + 1]} ＝ <b>${-d}℃</b> 《下|さ》がった`); }
    }
  ]
});
