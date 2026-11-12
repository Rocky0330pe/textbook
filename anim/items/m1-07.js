// @id m1-07
// @title 《曜日|ようび》の わと あまり
// @vol 数学1
// @from 数学 1-15 あまりのある わり算（ch1-15）／2-9・1-10・4-8・9-1 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。
// キャンバスの中は ルビが つかないので、曜日の 漢字の 下に 小さく よみを 書く。

const WD = [['月', 'げつ'], ['火', 'か'], ['水', 'すい'], ['木', 'もく'], ['金', 'きん'], ['土', 'ど'], ['日', 'にち']];
const WCOL = ['a', 'b', 'c', 'd', 'e', 'b', 'a'];
const DAYR = { 1: 'いちにち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか' };
const dayR = n => DAYR[n] ? `《${n}日|${DAYR[n]}》` : `${n}《日|にち》`;
const wdR = k => `《${WD[k][0]}曜日|${WD[k][1]}ようび》`;
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);

const RG = { cx: 220, cy: 225, R: 150 };
const ang = k => -Math.PI / 2 + k / 7 * A.TAU;
const nodeXY = k => [RG.cx + RG.R * Math.cos(ang(k)), RG.cy + RG.R * Math.sin(ang(k))];
function ring(cv, d, o = {}) {
  // 1日ずつの やじるし
  for (let k = 0; k < 7; k++) cv.circle(RG.cx, RG.cy, RG.R - 48, { color: 'line', width: 2, a0: ang(k) + 0.12, a1: ang(k + 1) - 0.12 });
  const full = Math.floor(d), u = ease(d - full), cur = full % 7;
  for (let k = 0; k < 7; k++) {
    const [x, y] = nodeXY(k), on = k === cur && u < 0.5 || k === (cur + 1) % 7 && u >= 0.5;
    cv.circle(x, y, 34, { fill: on ? 'hl' : 'panel', alpha: 1, color: k === 0 ? 'a' : 'line', width: k === 0 ? 3 : 2 });
    cv.text(WD[k][0], x, y - 7, { align: 'center', size: 24, bold: true });
    cv.text(WD[k][1], x, y + 18, { align: 'center', size: 14, color: 'sub' });
  }
  const [x0, y0] = nodeXY(0); cv.text('きょう', x0 + 44, y0 - 18, { size: 15, bold: true, color: 'a' });
  // コマ（三角）が わの うえを すすむ
  const a = ang(cur + u), r = RG.R - 70;
  cv.dot(RG.cx + r * Math.cos(a), RG.cy + r * Math.sin(a), { shape: 'tri', r: 11, color: 'b' });
  // まわった かず
  const laps = Math.floor(d / 7);
  cv.text(`${laps}しゅう`, RG.cx, RG.cy - 10, { align: 'center', size: 26, bold: true, color: 'a' });
  cv.text(`あと ${full % 7}`, RG.cx, RG.cy + 24, { align: 'center', size: 18, color: 'b' });
  void o;
}

// ---------- ① 7日で もどる ----------
function drawWa(cv, st) {
  ring(cv, st.d);
  const full = Math.floor(st.d);
  const x = 470;
  cv.text('すすんだ かず', x, 70, { size: 16, color: 'sub' });
  for (let i = 0; i < Math.min(full, 7); i++) { cv.rect(x + i * 52, 90, 46, 40, { fill: WCOL[(i + 1) % 7], alpha: 0.25, color: 'line', width: 1 }); cv.text(String(i + 1), x + i * 52 + 23, 110, { align: 'center', size: 18, bold: true }); cv.text(WD[(i + 1) % 7][0], x + i * 52 + 23, 150, { align: 'center', size: 17 }); }
  if (full >= 7) { cv.text('7かい すすむと、 また げつようびに', x, 210, { size: 19, bold: true, color: 'a' }); cv.text('もどる。 7この まとまりが 1しゅう', x, 242, { size: 19, bold: true, color: 'a' }); }
}
// ---------- ② 100日後 ----------
function drawNanshuu(cv, st) {
  ring(cv, st.d);
  const N = st.N, full = Math.floor(st.d), laps = Math.floor(full / 7);
  const x = 450;
  cv.text(`${N}にちごまで すすむ`, x, 50, { size: 17, bold: true });
  // 7ずつの かたまり
  const per = 7, cols = 7, w = 56;
  for (let i = 0; i < Math.floor(N / 7); i++) {
    const bx = x + (i % cols) * w, by = 80 + Math.floor(i / cols) * 50, on = i < laps;
    cv.rect(bx, by, w - 6, 42, { fill: on ? 'a' : 'panel', alpha: on ? 0.22 : 1, color: on ? 'a' : 'line', width: 1.5 });
    cv.text(String((i + 1) * per), bx + (w - 6) / 2, by + 21, { align: 'center', size: 16, bold: on, color: on ? 'ink' : 'sub' });
  }
  const rows = Math.ceil(Math.floor(N / 7) / cols), yb = 80 + rows * 50 + 30;
  if (full >= N) {
    cv.text(`${N} ÷ 7 ＝ ${Math.floor(N / 7)} あまり ${N % 7}`, x, yb, { size: 26, bold: true, color: 'a' });
    cv.text(`${Math.floor(N / 7)}しゅう たつと また げつようび。`, x, yb + 40, { size: 17 });
    cv.text(`そこから あと ${N % 7} すすむと ${WD[N % 7][0]}ようび`, x, yb + 70, { size: 17, bold: true, color: 'b' });
  }
}
// ---------- ③ 7日ずつ ならべる ----------
function drawHyou(cv, st) {
  const N = st.N, x0 = 40, y0 = 46, cw = 54, ch = 25, show = Math.floor(st.d);
  for (let c = 0; c < 7; c++) cv.text(WD[c][0], x0 + c * cw + cw / 2, y0 - 16, { align: 'center', size: 17, bold: true, color: c === N % 7 ? 'b' : 'ink' });
  cv.rect(x0, y0, cw, ch * (Math.floor(N / 7) + 1), { fill: 'a', alpha: 0.1 });
  for (let n = 0; n <= Math.min(N, show); n++) {
    const r = Math.floor(n / 7), c = n % 7, x = x0 + c * cw, y = y0 + r * ch;
    cv.rect(x, y, cw, ch, { color: 'line', width: 1 });
    cv.text(n ? String(n) : 'きょう', x + cw / 2, y + ch / 2 + 1, { align: 'center', size: n ? 15 : 14, bold: n === N || !n, color: n === N ? 'b' : !n ? 'a' : 'ink' });
    if (n === N) cv.rect(x + 2, y + 2, cw - 4, ch - 4, { color: 'b', width: 3 });
  }
  const R = Math.floor(N / 7), x1 = 470;
  if (show >= N) {
    cv.line([[x0 + 7 * cw + 8, y0], [x0 + 7 * cw + 14, y0], [x0 + 7 * cw + 14, y0 + R * ch], [x0 + 7 * cw + 8, y0 + R * ch]], { color: 'sub', width: 1.5 });
    cv.text(`${R}だんで ${R * 7}（${R}しゅう）`, x1, 120, { size: 20, bold: true });
    cv.text(`あと ${N % 7}で ${N}`, x1, 160, { size: 20, bold: true, color: 'b' });
    cv.text(`${N} ÷ 7 ＝ ${R} あまり ${N % 7}`, x1, 230, { size: 26, bold: true, color: 'a' });
    cv.text('ようびは、 あまりの かずで きまる', x1, 280, { size: 17 });
    cv.text('（ひだりの はしの れつは ぜんぶ げつようび）', x1, 310, { size: 15, color: 'sub' });
  }
}

A.item({
  id: 'm1-07', title: '《曜日|ようび》の わと あまり', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-15「あまりの ある わり《算|ざん》」の《図|ず》から（2-9、 1-10 でも つかう）',
  W: 880, H: 440,
  state: { d: 0, N: 100 },
  scenes: [
    {
      key: 'wa', label: '① 《7日|なのか》で もとに もどる',
      lead: 'きょうは 《月曜日|げつようび》。 1《日|にち》ずつ すすむと、 なん《日|にち》で また 《月曜日|げつようび》に もどるかな？',
      note: '《曜日|ようび》は 《月|げつ》・《火|か》・《水|すい》・《木|もく》・《金|きん》・《土|ど》・《日|にち》の 7つ。 《7日|なのか》で 1しゅう して、 また 《同|おな》じ 《曜日|ようび》に もどります。',
      legend: [['いま いる ところ', { color: 'b', shape: 'tri', noline: true }], ['きょう（《月曜日|げつようび》）', { color: 'a', shape: 'circle', noline: true }]],
      init(st) { st.d = 0; },
      step(st, dt) { if (st.d >= 7) return false; st.d = Math.min(7, st.d + dt * 1.2); },
      draw(cv, st) { drawWa(cv, st); },
      readout: st => `${Math.floor(st.d) ? dayR(Math.floor(st.d)) + '《後|ご》' : 'きょう'}：<b>${wdR(Math.floor(st.d) % 7)}</b>`
    },
    {
      key: 'nanshuu', label: '② 100《日後|にちご》は？',
      lead: '100《日後|にちご》は なに《曜日|ようび》？ 1《日|にち》ずつ かぞえないで、 しゅうの かずと あまりで かんがえよう。',
      note: '《7日|なのか》の まとまりが いくつ あっても、 《曜日|ようび》は かわりません。 かわるのは、 まとまりに ならない 「あまりの 《日|ひ》」の ぶんだけ。 **100 ÷ 7 ＝ 14 あまり 2** は、 「14しゅうと あと 《2日|ふつか》」。 《月曜日|げつようび》から 《火|か》、 《水|すい》 と すすんで、 《水曜日|すいようび》です。',
      legend: [['いま いる ところ', { color: 'b', shape: 'tri', noline: true }], ['すんだ 1しゅう（《7日|なのか》）', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ range: 'N', label: 'なん《日後|にちご》？', min: 1, max: 100, step: 1, d: 0, on(st) { st.d = 0; } }, { button: '1しゅうずつ とぶ', act(st) { const w = Math.floor(st.d / 7) * 7 + 7; st.d = w <= st.N ? w : st.N; } }],
      init(st) { st.d = 0; },
      step(st, dt) { if (st.d >= st.N) return false; st.d = Math.min(st.N, st.d + dt * 10); },
      draw(cv, st) { drawNanshuu(cv, st); },
      readout: st => { const d = Math.floor(st.d); return `${d ? dayR(d) + '《後|ご》' : 'きょう'}：<b>${wdR(d % 7)}</b>（${Math.floor(d / 7)}しゅうと あと ${d % 7 ? dayR(d % 7) : '0《日|にち》'}）`; }
    },
    {
      key: 'hyou', label: '③ 7つずつ ならべる',
      lead: '《7日|なのか》ずつ 1だんに ならべて みよう。 100は どの れつに くるかな？',
      note: '《7日|なのか》ずつ ならべると、 おなじ たての れつは みんな おなじ 《曜日|ようび》です。 14だんで 98《日|にち》（14しゅう）。 その つぎの だんで あと 《2日|ふつか》 すすむと 100《日|にち》です。 7の だんの 《九九|くく》（7 × 9 ＝ 63）の あとは、 7ずつ たして（1-7） 70、 77、 … 98 と すすめます。',
      legend: [['きょう・《月曜日|げつようび》の れつ', { color: 'a', shape: 'square', noline: true }], ['しらべる 《日|ひ》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'N', label: 'なん《日後|にちご》？', min: 1, max: 100, step: 1, d: 0, on(st) { st.d = st.N; } }],
      init(st) { st.d = 0; },
      step(st, dt) { if (st.d >= st.N) return false; st.d = Math.min(st.N, st.d + dt * 14); },
      draw(cv, st) { drawHyou(cv, st); },
      readout: st => `${dayR(st.N)}《後|ご》は <b>${wdR(st.N % 7)}</b>（${st.N} ÷ 7 ＝ ${Math.floor(st.N / 7)} あまり ${st.N % 7}）`
    }
  ]
});
