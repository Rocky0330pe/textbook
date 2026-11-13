// @id m1-17
// @title ボールが《落|お》ちる：1《秒|びょう》に《約|やく》10 m/s ずつ
// @vol 数学2
// @from 数学 2-0「だんだん速く」を数で言うと？（ch2-00:50-69・145-159・172-178）・2-13 代入（ch2-13:43-51・171-179・193-201）／5-1・5-2・5-5・5-9・3-9・力-1・力-4 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。本と同じく、速さは1秒ごとに約 10 m/s ずつふえるとして（g ≒ 10）、落ちた距離は 5t²
const G = { earth: 10, moon: 1.6 };

function ball(cv, x, y, r, o) { cv.circle(x, y, r, Object.assign({ fill: 'b', alpha: o.alpha == null ? 1 : o.alpha, color: 'b', width: 1.5 }, o)); }
// ボールの列（0.1 秒ごとの残像・速さの矢印・1 秒ごとの札）
function column(cv, x, top, ppm, g, t, o) {
  const tmax = o.tmax || 3;
  cv.line([[x, top - 10], [x, top + 0.5 * g * tmax * tmax * ppm + 14]], { color: 'grid', width: 2 });
  for (let k = 0; k * 0.1 <= t + 1e-9; k++) { const tk = k * 0.1, yk = top + 0.5 * g * tk * tk * ppm; ball(cv, x, yk, 9, { alpha: 0.18, color: 'b', width: 1 }); }
  let last = -1e9;
  for (let s = 0; s <= Math.floor(t + 1e-9); s++) {
    const ys = top + 0.5 * g * s * s * ppm;
    cv.line([[x - 18, ys], [x - 12, ys]], { color: 'ink', width: 2 });
    if (ys - last < 18 && s < Math.floor(t + 1e-9)) continue;
    if (ys - last < 18) last = -1e9;
    last = ys;
    cv.text(s ? `${s}秒後` : '0秒', x - 22, ys, { align: 'right', size: 15 });
    if (o.vlab) cv.text(s ? `やく ${A.num(g * s, g < 5 ? 1 : 0)} m/s` : '0 m/s', x + 50, ys, { size: 15, color: 'a' });
  }
  const y = top + 0.5 * g * t * t * ppm, v = g * t;
  ball(cv, x, y, 11, {});
  if (v > 0.05) cv.arrow(x + 22, y, x + 22, y + v * (o.vscale || 2.2), { color: 'a', width: 3 });
  return y;
}

// ---------- ① 落ちる ----------
function drawOchiru(cv, st) {
  const top = 30, ppm = 7.6;
  column(cv, 150, top, ppm, G.earth, st.t, { vlab: true, vscale: 1.3 });
  // 右：速さのものさし
  const L = 420, R = 840, y = 120, X = v => L + v / 30 * (R - L);
  cv.text('速さ', L, y - 50, { size: 17, bold: true });
  cv.rect(L, y - 14, X(10 * st.t) - L, 28, { fill: 'a', alpha: 0.5 });
  cv.line([[L, y + 14], [R, y + 14]], { color: 'ink', width: 1.5 });
  for (let v = 0; v <= 30; v += 5) { cv.line([[X(v), y + 14], [X(v), y + (v % 10 ? 20 : 26)]], { color: 'ink', width: 1.5 }); if (v % 10 === 0) cv.text(String(v), X(v), y + 40, { align: 'center', size: 15 }); }
  cv.text('m/s', R + 4, y - 4, { size: 14, color: 'sub' });
  for (let s = 1; s <= Math.floor(st.t + 1e-9); s++) {
    cv.line([[X(10 * (s - 1)) + 3, y - 26], [X(10 * s) - 3, y - 26]], { color: 'b', width: 2 });
    cv.text('＋10', (X(10 * (s - 1)) + X(10 * s)) / 2, y - 38, { align: 'center', size: 15, color: 'b', bold: true });
  }
  cv.text(`${A.num(st.t, 1)} 秒後：速さ やく ${A.num(10 * st.t, 0)} m/s`, L, 230, { size: 18, bold: true });
  cv.text(`落ちたきょり やく ${A.num(5 * st.t * st.t, 1)} m`, L, 262, { size: 17 });
  cv.text('うすい玉：0.1 秒ごとの場所', L, 320, { size: 15, color: 'sub' });
  cv.text('玉と玉のあいだが、だんだん広くなる', L, 346, { size: 15, color: 'sub' });
}

// ---------- ② グラフ ----------
function drawGraph(cv, st) {
  const t = st.t;
  const g1 = cv.view({ x0: 0, x1: 3.3, y0: 0, y1: 34, box: [60, 30, 340, 330] });
  g1.axes({ xt: [0, 1, 2, 3], yt: [0, 10, 20, 30], xl: '時間（秒）', yl: '速さ（m/s）' });
  g1.poly([[0, 0], [t, 10 * t], [t, 0]], { fill: 'c', alpha: 0.35 });
  g1.line([[0, 5 * t], [t, 5 * t]], { color: 'c', style: 'dash', width: 2 });
  g1.plot(x => 10 * x, { x0: 0, x1: t, color: 'a', width: 3 });
  g1.dot(t, 10 * t, { color: 'a', r: 6 });
  if (t > 0.5) g1.text(`へいきん ${A.num(5 * t, 0)}`, t / 2, 5 * t + 2.2, { align: 'center', size: 14, color: 'c' });
  if (t > 0.6) g1.text(`めんせき ${A.num(5 * t * t, 1)}`, t * 0.66, 10 * t * 0.25, { align: 'center', size: 15, bold: true, color: 'ink', bg: true });
  const g2 = cv.view({ x0: 0, x1: 3.3, y0: 0, y1: 50, box: [500, 30, 340, 330] });
  g2.axes({ xt: [0, 1, 2, 3], yt: [0, 10, 20, 30, 40, 50], xl: '時間（秒）', yl: '落ちたきょり（m）' });
  g2.plot(x => 5 * x * x, { x0: 0, x1: 3, color: 'sub', width: 1, style: 'dot' });
  g2.plot(x => 5 * x * x, { x0: 0, x1: t, color: 'b', width: 3 });
  for (const s of [1, 2, 3]) if (t >= s - 1e-9) { g2.dot(s, 5 * s * s, { color: 'b', r: 5, shape: 'square' }); g2.text(`${5 * s * s}`, s + 0.12, 5 * s * s, { size: 14, color: 'b' }); }
  g2.dot(t, 5 * t * t, { color: 'b', r: 7, shape: 'diamond' });
}

// ---------- ③ 地球と月 ----------
function drawTsuki(cv, st) {
  const top = 46, ppm = 7.2;
  cv.text('地球', 120, 20, { align: 'center', size: 17, bold: true });
  cv.text('月', 320, 20, { align: 'center', size: 17, bold: true });
  column(cv, 120, top, ppm, G.earth, st.t, { vscale: 1.3 });
  column(cv, 320, top, ppm, G.moon, st.t, { vscale: 1.3 });
  // 右：速さのぼうグラフ（本の図と同じ 1・2・3 秒後）
  const g = cv.view({ x0: 0, x1: 3.6, y0: 0, y1: 34, box: [500, 40, 340, 320] });
  g.axes({ yt: [0, 10, 20, 30], yl: '速さ（m/s）', xlabels: false });
  for (const s of [1, 2, 3]) {
    if (st.t < s - 1e-9) continue;
    g.poly([[s - 0.38, 0], [s - 0.04, 0], [s - 0.04, 10 * s], [s - 0.38, 10 * s]], { fill: 'b', alpha: 0.75 });
    g.poly([[s + 0.04, 0], [s + 0.38, 0], [s + 0.38, 1.6 * s], [s + 0.04, 1.6 * s]], { fill: 'a', alpha: 0.6, color: 'a', style: 'dash', width: 2 });
    g.text(String(10 * s), s - 0.21, 10 * s + 1.6, { align: 'center', size: 14, color: 'b' });
    g.text(A.num(1.6 * s, 1), s + 0.21, 1.6 * s + 1.6, { align: 'center', size: 14, color: 'a' });
    g.text(`${s}秒後`, s, -2.4, { align: 'center', size: 14 });
  }
}

// ---------- ④ ものさしキャッチ ----------
function drawMono(cv, st) {
  const yf = 330, ppc = 10.5, fall = 500 * st.t * st.t, x = 180;
  const caught = st.t >= st.tc - 1e-9;
  // 指
  const gap = caught ? 28 : 48;
  for (const s of [-1, 1]) cv.rect(x + s * gap - (s < 0 ? 46 : 0), yf - 10, 46, 20, { fill: 'e', alpha: 0.3, color: 'e', width: 2 });
  cv.line([[x - 80, yf], [x + 80, yf]], { color: 'b', width: 1.5, style: 'dash' });
  cv.text('指', x - 100, yf, { align: 'right', size: 15 });
  // ものさし：0 cm が下（はじめは指のところ）、上へ 30 cm
  const yb = yf + fall * ppc;
  cv.g.save(); cv.g.beginPath(); cv.g.rect(0, 0, 880, 420); cv.g.clip();
  cv.rect(x - 26, yb - 30.5 * ppc, 52, 31 * ppc, { fill: 'e', alpha: 0.18, color: 'e', width: 1.5 });
  for (let c = 0; c <= 30; c++) { const yc = yb - c * ppc; cv.line([[x - 26, yc], [x - 26 + (c % 5 ? 8 : 14), yc]], { color: 'ink', width: c % 5 ? 1 : 1.8 }); if (c % 5 === 0) cv.text(String(c), x - 8, yc, { size: 14 }); }
  for (let k = 0; k <= 7; k++) { const tk = 0.10 + 0.02 * k, c = 500 * tk * tk, yc = yb - c * ppc; cv.line([[x + 12, yc], [x + 26, yc]], { color: 'b', width: 2.5, style: 'solid' }); cv.text(A.num(tk, 2), x + 32, yc, { size: 14, color: 'b', bold: true }); }
  cv.g.restore();
  // 右：表（本の 2-13 の表）
  const tx = 470, ty = 60, cw = 46;
  cv.text('t（秒）', tx - 8, ty, { align: 'right', size: 14 }); cv.text('cm', tx - 8, ty + 34, { align: 'right', size: 14 });
  for (let k = 0; k <= 7; k++) {
    const tk = 0.10 + 0.02 * k, on = Math.abs(tk - st.tc) < 1e-6;
    if (on) cv.rect(tx + k * cw, ty - 16, cw, 66, { fill: 'hl', alpha: 1 });
    cv.text(A.num(tk, 2), tx + k * cw + cw / 2, ty, { align: 'center', size: 14 });
    cv.text(A.num(500 * tk * tk, 1).replace(/\.0$/, ''), tx + k * cw + cw / 2, ty + 34, { align: 'center', size: 14, bold: on });
  }
  cv.text(`${A.num(st.t, 3)} 秒`, tx, 190, { size: 22, bold: true });
  cv.text(`落ちた長さ ${A.num(fall, 1)} cm`, tx, 226, { size: 18 });
  if (caught) cv.text(`つかんだ！ ${A.num(st.tc, 2)} 秒で ${A.num(500 * st.tc * st.tc, 1)} cm`, tx, 270, { size: 18, bold: true, color: 'b' });
  cv.text('赤いせんは 0.02 秒ごと。上ほど あいだが広い', tx, 330, { size: 15, color: 'sub' });
  cv.text('（スローモーション：じっさいの 1/10 の速さ）', tx, 356, { size: 14, color: 'sub' });
}

A.item({
  id: 'm1-17', title: 'ボールが《落|お》ちる：1《秒|びょう》に《約|やく》10 m/s ずつ', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-0「「だんだん《速|はや》く」を《数|かず》で《言|い》うと？」・2-13「《代入|だいにゅう》」の《図|ず》から（5-1・5-2・5-5・5-9・3-9、《物理|ぶつり》 《力|りき》-1・《力|りき》-4 でも《使|つか》う）',
  W: 880, H: 420,
  state: { t: 0, tc: 0.2 },
  scenes: [
    {
      key: 'ochiru', label: '① ボールが《落|お》ちる',
      lead: '▶ で、はなしたボールが《落|お》ちていきます。うすい《玉|たま》は0.1《秒|びょう》ごとの《場所|ばしょ》、《矢印|やじるし》は《速|はや》さです。',
      note: 'はなした《瞬間|しゅんかん》の《速|はや》さは 0 m/s。1《秒後|びょうご》には《約|やく》10 m/s、2《秒後|びょうご》には《約|やく》20 m/s。**1《秒|びょう》たつたびに、《速|はや》さに《約|やく》10 m/s がたされます**（くわしくは9.8 m/s）。だから、0.1《秒|びょう》ごとの《玉|たま》のあいだは、だんだん《広|ひろ》くなります。',
      miss: '「だんだん《速|はや》くなる」だけでは、どれくらいかわかりません。《数|かず》と《単位|たんい》で《言|い》うと「1《秒|びょう》ごとに《約|やく》10 m/s ずつふえる」です。',
      legend: [['ボール（うすいのは0.1《秒|びょう》ごと）', { color: 'b', shape: 'circle', noline: true }], ['《速|はや》さの《矢印|やじるし》', { color: 'a' }]],
      controls: [{ range: 't', label: '《時刻|じこく》', min: 0, max: 3, step: 0.01, fmt: v => A.num(v, 2) + ' 《秒|びょう》' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(3, st.t + dt * 0.5); if (st.t >= 3) return false; },
      draw(cv, st) { drawOchiru(cv, st); },
      readout: st => `${A.num(st.t, 2)} 《秒後|びょうご》　《速|はや》さ $10\\times${A.num(st.t, 2)}$ ＝ 《約|やく》 <b>${A.num(10 * st.t, 1)} m/s</b>　《落|お》ちた《距離|きょり》 《約|やく》 ${A.num(5 * st.t * st.t, 1)} m`
    },
    {
      key: 'graph', label: '② グラフと《面積|めんせき》',
      lead: '《左|ひだり》は《速|はや》さのグラフ、《右|みぎ》は《落|お》ちた《距離|きょり》のグラフです。▶ で《時刻|じこく》を《進|すす》めます。',
      note: '《速|はや》さは《同|おな》じ《割合|わりあい》でふえるので、グラフはまっすぐ。《色|いろ》の《三角|さんかく》の《面積|めんせき》が《落|お》ちた《距離|きょり》です。《三角|さんかく》は《高|たか》さを《半分|はんぶん》にした《長方形|ちょうほうけい》（《点線|てんせん》、《平均|へいきん》の《速|はや》さ）と《同|おな》じ《面積|めんせき》なので、$5t\\times t=5t^2$。**《時間|じかん》が2《倍|ばい》になると、《落|お》ちた《距離|きょり》は4《倍|ばい》**です。',
      miss: '2《秒|びょう》で20 mなら、3《秒|びょう》で30 m…ではありません。$5\\times3^2=45$ で45 m。《距離|きょり》は《時間|じかん》の2《乗|じょう》でふえます。',
      legend: [['《速|はや》さ $10t$', { color: 'a' }], ['《三角|さんかく》の《面積|めんせき》＝《落|お》ちた《距離|きょり》', { color: 'c', shape: 'square', noline: true }], ['《平均|へいきん》の《速|はや》さ', { color: 'c', style: 'dash' }], ['《落|お》ちた《距離|きょり》 $5t^2$', { color: 'b' }]],
      controls: [{ range: 't', label: '《時刻|じこく》', min: 0, max: 3, step: 0.01, fmt: v => A.num(v, 2) + ' 《秒|びょう》' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(3, st.t + dt * 0.5); if (st.t >= 3) return false; },
      draw(cv, st) { drawGraph(cv, st); },
      readout: st => `《面積|めんせき》 ＝ $(0+${A.num(10 * st.t, 1)})÷2\\times${A.num(st.t, 2)}$ ＝ <b>${A.num(5 * st.t * st.t, 1)} m</b>　（$5t^2=5\\times${A.num(st.t, 2)}^2$）`
    },
    {
      key: 'tsuki', label: '③ 《地球|ちきゅう》と《月|つき》',
      lead: '《月|つき》でもボールはだんだん《速|はや》くなります。▶ で、《地球|ちきゅう》と《月|つき》でならべて《落|お》とします。',
      note: '《月|つき》では、《速|はや》さが1《秒|びょう》ごとに《約|やく》1.6 m/s ずつしかふえません。1.6を6《倍|ばい》すると9.6で、ほぼ10。**《地球|ちきゅう》でふえる《速|はや》さは、《月|つき》の《約|やく》6《倍|ばい》**です。《数|かず》にすると、くらべられます。',
      legend: [['《地球|ちきゅう》（1《秒|びょう》に《約|やく》10 m/s ずつ）', { color: 'b', shape: 'square', noline: true }], ['《月|つき》（1《秒|びょう》に《約|やく》1.6 m/s ずつ）', { color: 'a', style: 'dash' }]],
      controls: [{ range: 't', label: '《時刻|じこく》', min: 0, max: 3, step: 0.01, fmt: v => A.num(v, 2) + ' 《秒|びょう》' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(3, st.t + dt * 0.5); if (st.t >= 3) return false; },
      draw(cv, st) { drawTsuki(cv, st); },
      readout: st => `${A.num(st.t, 2)} 《秒後|びょうご》　《地球|ちきゅう》 《約|やく》 ${A.num(10 * st.t, 1)} m/s　　《月|つき》 《約|やく》 ${A.num(1.6 * st.t, 1)} m/s`
    },
    {
      key: 'monosashi', label: '④ ものさしキャッチ',
      lead: '《友|とも》だちがはなしたものさしを、すばやくつかみます。つかむまでの《時間|じかん》を《決|き》めて ▶（ゆっくり《動|うご》きます）。',
      note: '$x=5t^2$ に $t$ を《代入|だいにゅう》すると、つかむまでに《落|お》ちる《長|なが》さがわかります。0.20《秒|びょう》なら $5\\times0.2^2=0.2$ で 0.2 m（20 cm）。《赤|あか》い《線|せん》は《同|おな》じ0.02《秒|びょう》ずつなのに、《上|うえ》へ《行|い》くほど《間隔|かんかく》が《広|ひろ》くなっています。《落|お》ちるものさしは、だんだん《速|はや》くなるからです。',
      miss: '0.10《秒|びょう》から0.20《秒|びょう》へ2《倍|ばい》になると、《落|お》ちた《長|なが》さは 5 cm から 20 cm へ4《倍|ばい》。2《倍|ばい》ではありません。',
      legend: [['cm の《目|め》もり', { color: 'ink' }], ['《秒|びょう》の《目|め》もり（0.02《秒|びょう》ごと）', { color: 'b' }]],
      state: { tc: 0.2 },
      controls: [{ range: 'tc', label: 'つかむまでの《時間|じかん》', min: 0.1, max: 0.24, step: 0.02, fmt: v => A.num(v, 2) + ' 《秒|びょう》', on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(st.tc, st.t + dt * 0.1); if (st.t >= st.tc - 1e-9) { st.t = st.tc; return false; } },
      draw(cv, st) { drawMono(cv, st); },
      readout: st => `$x=5t^2=5\\times${A.num(st.tc, 2)}^2=${A.num(5 * st.tc * st.tc, 3)}$（m）＝ <b>${A.num(500 * st.tc * st.tc, 1)} cm</b>`
    }
  ]
});
