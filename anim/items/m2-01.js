// @id m2-01
// @title 《歩|ある》いた《記録|きろく》が x-t グラフになる
// @vol 数学3
// @from 数学 3-4③（ch3-04:201・241・605）・3-5⑦（ch3-05:541）／3-9、5-1・5-9、力-1 でも使う
'use strict';
// 第3巻の読者にあわせて、漢字にはルビをつける（キャンバスの中は、ひらがなと記号）
// 数は本と同じ：ソラさんは家から 700 m 先の図書館へ。0〜5 分は 60 m/min、5〜8 分は止まる、8〜12 分は 100 m/min。
const X = t => t <= 5 ? 60 * t : t <= 8 ? 300 : 300 + 100 * (Math.min(t, 12) - 8);
const V = t => t < 5 ? 60 : t < 8 ? 0 : 100;
const fmtT = v => A.num(v, 1) + ' 《分|ふん》';
A.item({
  id: 'm2-01', title: '《歩|ある》いた《記録|きろく》が x-t グラフになる', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-4③「《位置|いち》と《時間|じかん》のグラフ」・3-5⑦「$v$-$t$ グラフでは、《面積|めんせき》が《道|みち》のり」の《図|ず》から（5-1・5-9、《物理|ぶつり》 《力|ちから》-1 でも《使|つか》う）',
  W: 880, H: 440,
  state: { t: 0 },
  scenes: [
    {
      key: 'xt', label: '① 《歩|ある》くと x-t グラフ',
      lead: 'ソラさんが《家|いえ》から《図書館|としょかん》まで《歩|ある》きます。▶ を《押|お》すと、《道|みち》の《数直線|すうちょくせん》を1《分|ぷん》ごとに《右|みぎ》へずらしながら、そのときの《位置|いち》に《点|てん》をうちます。',
      note: '**《横軸|よこじく》を《時間|じかん》** $t$**、たて《軸|じく》を《位置|いち》** $x$ **にしたグラフを、**$x$-$t$ **グラフという**。《線|せん》の《高|たか》さは、その《時刻|じこく》にいる《場所|ばしょ》です。5《分|ふん》から8《分|ぷん》は、《線|せん》が《水平|すいへい》です。《時間|じかん》がたっても《位置|いち》が《変|か》わらない、つまり《止|と》まっています。',
      legend: [['$x$-$t$ グラフ（いままでの《記録|きろく》）', { color: 'a' }], ['1《分|ぷん》ごとの《点|てん》', { color: 'ink', shape: 'circle', noline: true }], ['いまの《時刻|じこく》の《数直線|すうちょくせん》', { color: 'sub', style: 'dash' }], ['ソラさん', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 't', label: '《時刻|じこく》 $t$', min: 0, max: 12, step: 0.05, fmt: fmtT }],
      step(st, dt) { st.t = Math.min(12, st.t + dt); if (st.t >= 12) return false; },
      draw(cv, st) { drawWalk(cv, st); },
      readout: st => `《時刻|じこく》 $t$＝${A.num(st.t, 1)} 《分|ふん》　　《位置|いち》 $x$＝**${A.num(X(st.t), 0)} m**　　（${st.t < 5 ? '《歩|ある》いている' : st.t < 8 ? '《止|と》まっている' : '《急|いそ》いで《歩|ある》いている'}）`
    },
    {
      key: 'vt', label: '② 《傾|かたむ》きと《面積|めんせき》',
      lead: '《上|うえ》の $x$-$t$ グラフと、《下|した》の $v$-$t$ グラフをならべます。《時刻|じこく》を《進|すす》めると、《下|した》の《面積|めんせき》がたまっていきます。',
      note: '$x$-$t$ グラフの**《傾|かたむ》き**（1《分|ぷん》に《進|すす》む《道|みち》のり）が、$v$-$t$ グラフの**《高|たか》さ**（《速|はや》さ）です。$v$-$t$ グラフの**《線|せん》の《下|した》の《面積|めんせき》**が、《進|すす》んだ《道|みち》のりで、$x$-$t$ グラフの《高|たか》さと《同|おな》じになります：$60\\times5+100\\times4=300+400=700$（m）。',
      legend: [['$x$-$t$ グラフ', { color: 'a' }], ['《傾|かたむ》きの《三角形|さんかくけい》（1《分|ぷん》）', { color: 'c', style: 'dot' }], ['$v$-$t$ グラフ', { color: 'b', style: 'dash' }], ['たまった《面積|めんせき》＝《道|みち》のり', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 't', label: '《時刻|じこく》 $t$', min: 0, max: 12, step: 0.05, fmt: fmtT }],
      step(st, dt) { st.t = Math.min(12, st.t + dt * 0.8); if (st.t >= 12) return false; },
      draw(cv, st) { drawPair(cv, st); },
      readout: st => `《速|はや》さ $v$＝${V(Math.min(st.t, 11.999))} m/min　　《面積|めんせき》（《道|みち》のり）＝**${A.num(X(st.t), 0)} m**　　$x$-$t$ グラフの《高|たか》さ＝${A.num(X(st.t), 0)} m`
    },
    {
      key: 'suihei', label: '③ 《水平|すいへい》な《線|せん》のちがい',
      lead: '《同|おな》じ「《水平|すいへい》な《線|せん》」でも、$x$-$t$ グラフと $v$-$t$ グラフでは《意味|いみ》がちがいます。▶ で《2人|ふたり》を《動|うご》かしてくらべましょう。',
      miss: '$x$-$t$ グラフの《水平|すいへい》な《線|せん》は「《同|おな》じ《速|はや》さで《進|すす》んでいる」ではありません。《位置|いち》が《変|か》わらないから《水平|すいへい》、つまり**《止|と》まっている**のです。$v$-$t$ グラフの《水平|すいへい》な《線|せん》（《速|はや》さが《一定|いってい》）と《混|ま》ぜないようにしよう。',
      legend: [['$x$-$t$ グラフ：$x$＝300 のまま', { color: 'a' }], ['$v$-$t$ グラフ：$v$＝60 のまま', { color: 'b', style: 'dash' }], ['その《動|うご》き《方|かた》の《人|ひと》', { color: 'ink', shape: 'diamond', noline: true }]],
      controls: [{ range: 't', label: '《時刻|じこく》 $t$', min: 0, max: 5, step: 0.05, fmt: fmtT }],
      step(st, dt) { st.t = Math.min(5, st.t + dt * 0.7); if (st.t >= 5) return false; },
      draw(cv, st) { drawFlat(cv, st); },
      readout: st => `${A.num(st.t, 1)} 《分|ふん》《後|ご》：《左|ひだり》の《人|ひと》は 300 m の《所|ところ》のまま、《右|みぎ》の《人|ひと》は ${A.num(60 * st.t, 0)} m 《進|すす》んだ`
    }
  ]
});

// 人の形（頭と体）。色だけでなく形でも見分ける
function person(cv, x, y, col, s = 1) {
  cv.circle(x, y - 26 * s, 6 * s, { fill: col, alpha: 1, color: col, width: 1.5 });
  cv.line([[x, y - 20 * s], [x, y - 8 * s]], { color: col, width: 3 });
  cv.line([[x - 6 * s, y], [x, y - 8 * s], [x + 6 * s, y]], { color: col, width: 3 });
  cv.line([[x - 7 * s, y - 15 * s], [x + 7 * s, y - 15 * s]], { color: col, width: 3 });
}

function drawWalk(cv, st) {
  const road = cv.view({ x0: -1, x1: 1, y0: -40, y1: 800, box: [40, 30, 110, 370] });
  const g = cv.view({ x0: 0, x1: 13, y0: -40, y1: 800, box: [210, 30, 640, 370] });
  // 左：道をたてにした数直線
  cv.arrow(road.X(0), road.Y(0), road.X(0), road.Y(790), { color: 'ink', width: 2, head: 10 });
  for (let m = 0; m <= 700; m += 100) { cv.line([[road.X(0) - 6, road.Y(m)], [road.X(0) + 6, road.Y(m)]], { color: 'ink', width: 1.5 }); if (m % 200 === 0) cv.text(String(m), road.X(0) - 10, road.Y(m), { align: 'right', size: 14, color: 'sub' }); }
  cv.text('いえ', road.X(0) + 12, road.Y(0), { size: 15 });
  cv.text('としょかん', road.X(0) + 12, road.Y(700), { size: 15 });
  cv.text('みち（m）', road.X(0), 18, { align: 'center', size: 14, color: 'sub' });
  // 右：x-t グラフ
  g.axes({ xt: A.range(0, 12, 1), yt: [200, 400, 600], xl: 't（ふん）', yl: 'x（m）', xfmt: v => v % 2 ? '' : String(v) });
  const x = X(st.t);
  // いまの時刻の数直線（右へずらした道）
  g.line([[st.t, 0], [st.t, 760]], { color: 'sub', style: 'dash', width: 1.5 });
  for (let m = 0; m <= 700; m += 100) g.line([[st.t - 0.08, m], [st.t + 0.08, m]], { color: 'sub', width: 1.5 });
  // いままでの線と、1分ごとの点
  g.plot(X, { x0: 0, x1: st.t, color: 'a', width: 3.5, n: 400 });
  for (let k = 0; k <= Math.floor(st.t + 1e-9); k++) g.dot(k, X(k), { color: 'ink', r: 4.5 });
  // ソラさんと、その位置を結ぶ線
  cv.line([[road.X(0), road.Y(x)], [g.X(st.t), g.Y(x)]], { color: 'b', style: 'dot', width: 1.5 });
  road.dot(0, x, { color: 'b', shape: 'diamond', r: 7 });
  person(cv, road.X(0) - 28, road.Y(x) + 2, 'b', 0.9);
  g.dot(st.t, x, { color: 'b', shape: 'diamond', r: 7 });
  if (st.t > 5.4) g.text('すいへい＝とまっている', 6.5, 360, { align: 'center', size: 15, color: 'a', bg: true });
  if (st.t > 9) g.text('きゅう＝はやい', 9.4, 600, { align: 'right', size: 15, color: 'a', bg: true });
}

function drawPair(cv, st) {
  const g1 = cv.view({ x0: 0, x1: 13, y0: 0, y1: 800, box: [80, 24, 760, 190] });
  const g2 = cv.view({ x0: 0, x1: 13, y0: 0, y1: 130, box: [80, 262, 760, 140] });
  g1.axes({ xt: A.range(0, 12, 1), yt: [200, 400, 600], xl: 't（ふん）', yl: 'x（m）', xfmt: v => v % 2 ? '' : String(v) });
  g2.axes({ xt: A.range(0, 12, 1), yt: [60, 100], xl: 't（ふん）', yl: 'v（m/min）', xfmt: v => v % 2 ? '' : String(v) });
  const t = st.t;
  // 下：面積
  const segs = [[0, 5, 60], [5, 8, 0], [8, 12, 100]];
  for (const [a, b, v] of segs) { if (t <= a || !v) continue; const e = Math.min(t, b); g2.poly([[a, 0], [e, 0], [e, v], [a, v]], { fill: 'b', alpha: 0.22 }); }
  if (t >= 5) g2.text('60×5＝300', 2.5, 30, { align: 'center', size: 15, math: false });
  if (t >= 12) g2.text('100×4＝400', 10, 50, { align: 'center', size: 15 });
  for (const [a, b, v] of segs) g2.line([[a, v], [b, v]], { color: 'b', style: 'dash', width: 3 });
  g2.line([[t, 0], [t, 125]], { color: 'sub', width: 1, style: 'dot' });
  // 上：x-t と、傾きの三角形
  g1.plot(X, { x0: 0, x1: 12, color: 'a', width: 1.5, alpha: 0.3, n: 300 });
  g1.plot(X, { x0: 0, x1: t, color: 'a', width: 3.5, n: 300 });
  const a = Math.max(0, Math.min(11, Math.floor(t - 1e-9) - (t >= 1 ? 0 : 0)));
  const t0 = Math.max(0, Math.min(t, 12) - 1), t1 = t0 + 1;
  if (t >= 1) {
    const x0 = X(t0), x1 = X(t1);
    g1.line([[t0, x0], [t1, x0], [t1, x1]], { color: 'c', style: 'dot', width: 3 });
    g1.text('1ぷん', (t0 + t1) / 2, x0 - 45, { align: 'center', size: 14, color: 'c', bg: true });
    g1.text(x1 > x0 ? A.num(x1 - x0, 0) + ' m' : '0 m（とまっている）', t1 + 0.25, x1 > x0 ? (x0 + x1) / 2 : x1 + 70, { size: 15, color: 'c', bg: true });
  }
  void a;
  g1.dot(t, X(t), { color: 'a', r: 6 });
  g2.dot(t, V(Math.min(t, 11.999)), { color: 'b', shape: 'square', r: 6 });
  cv.text('うえ：x-t グラフ　した：v-t グラフ', 860, 14, { align: 'right', size: 14, color: 'sub' });
}

function drawFlat(cv, st) {
  const t = st.t;
  const L = cv.view({ x0: 0, x1: 5.6, y0: 0, y1: 420, box: [60, 30, 340, 200] });
  const R = cv.view({ x0: 0, x1: 5.6, y0: 0, y1: 110, box: [500, 30, 340, 200] });
  L.axes({ xt: [1, 2, 3, 4, 5], yt: [100, 200, 300, 400], xl: 't（ふん）', yl: 'x（m）' });
  R.axes({ xt: [1, 2, 3, 4, 5], yt: [20, 40, 60, 80, 100], xl: 't（ふん）', yl: 'v（m/min）' });
  L.line([[0, 300], [5, 300]], { color: 'a', width: 3.5 });
  R.line([[0, 60], [5, 60]], { color: 'b', style: 'dash', width: 3.5 });
  L.dot(t, 300, { color: 'a', r: 6 }); R.dot(t, 60, { color: 'b', shape: 'square', r: 6 });
  cv.text('x-t グラフの すいへい', 230, 258, { align: 'center', size: 15, bold: true, color: 'a' });
  cv.text('v-t グラフの すいへい', 670, 258, { align: 'center', size: 15, bold: true, color: 'b' });
  // 下：それぞれの人の動き（道 0〜400 m）
  const road = (x0, col, pos, label) => {
    const r = cv.view({ x0: -20, x1: 420, y0: 0, y1: 1, box: [x0, 300, 360, 80] });
    cv.line([[r.X(0), r.Y(0.2)], [r.X(400), r.Y(0.2)]], { color: 'ink', width: 2 });
    for (let m = 0; m <= 400; m += 100) { cv.line([[r.X(m), r.Y(0.2) - 5], [r.X(m), r.Y(0.2) + 5]], { color: 'ink', width: 1.5 }); cv.text(String(m), r.X(m), r.Y(0.2) + 16, { align: 'center', size: 14, color: 'sub' }); }
    person(cv, r.X(pos), r.Y(0.2) - 4, col, 1);
    cv.text(label, r.X(200), 290, { align: 'center', size: 15, color: col, bg: true });
  };
  road(50, 'a', 300, 'とまっている（ずっと 300 m）');
  road(480, 'b', Math.min(400, 60 * t), 'おなじ はやさで すすむ');
}
