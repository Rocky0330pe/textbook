// @id m1-18
// @title 《道|みち》のりは《長方形|ちょうほうけい》の《面積|めんせき》
// @vol 数学2
// @from 数学 2-3 量の足し算・引き算と、速さ（ch2-03:69-92・220-232・316-324）／2-13・5-9・5-12・力-1 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける

// 自転車（横から。x は後ろのタイヤの下のまん中、y は道）
function bike(cv, x, y, col) {
  const r = 13, f = x + 34;
  cv.circle(x, y - r, r, { color: col, width: 2.5 }); cv.circle(f, y - r, r, { color: col, width: 2.5 });
  cv.line([[x, y - r], [x + 14, y - r - 20], [f - 4, y - r - 22], [f, y - r]], { color: col, width: 3 });
  cv.line([[x, y - r], [x + 18, y - r]], { color: col, width: 3 });
  cv.line([[x + 18, y - r], [x + 14, y - r - 20]], { color: col, width: 3 });
  cv.line([[x + 10, y - r - 26], [x + 19, y - r - 26]], { color: col, width: 4 });
  cv.line([[f - 4, y - r - 22], [f - 8, y - r - 30], [f - 1, y - r - 32]], { color: col, width: 3 });
}
// segs：[[速さ, 何秒], …]。t までに進んだ道のり
function dist(segs, t) { let x = 0, t0 = 0; for (const [v, d] of segs) { const u = A.clamp(t - t0, 0, d); x += v * u; t0 += d; } return x; }
function speedAt(segs, t) { let t0 = 0; for (const [v, d] of segs) { if (t < t0 + d) return v; t0 += d; } return segs[segs.length - 1][0]; }
function total(segs) { return segs.reduce((s, [, d]) => s + d, 0); }

function scene(cv, st, segs, o) {
  const T = total(segs), t = Math.min(st.t, T), X = dist(segs, t), Xmax = o.xmax, vmax = o.vmax, tmax = o.tmax;
  // 上：道と自転車
  const L = 70, R = 830, yr = 92, px = x => L + x / Xmax * (R - L);
  cv.line([[L - 30, yr + 2], [R + 30, yr + 2]], { color: 'grid', width: 6 });
  const tk = o.xtick;
  for (let m = 0; m <= Xmax + 1e-9; m += tk) { cv.line([[px(m), yr - 4], [px(m), yr + 8]], { color: 'ink', width: 1.5 }); cv.text(`${m}`, px(m), yr + 22, { align: 'center', size: 14 }); }
  cv.text('m', R + 18, yr + 22, { size: 14, color: 'sub' });
  // 1 秒ごとの場所
  for (let s = 1; s <= Math.floor(t + 1e-9); s++) cv.dot(px(dist(segs, s)), yr - 54, { color: 'b', r: 4 });
  cv.line([[px(0), yr + 34], [px(X), yr + 34]], { color: 'b', width: 4 });
  if (X > 0) cv.text(`${A.num(X, 1).replace(/\.0$/, '')} m`, px(X / 2), yr + 48, { align: 'center', size: 15, bold: true, color: 'b' });
  bike(cv, px(X) - 34, yr, A.color('a'));
  // 下：速さと時間のグラフ
  const g = cv.view({ x0: 0, x1: tmax, y0: 0, y1: vmax, box: [70, 170, 740, 220] });
  g.axes({ xt: A.range(0, Math.floor(tmax - 0.3)), yt: A.range(0, Math.floor(vmax - 0.3), vmax > 8 ? 2 : 1), xl: '時間（s）', yl: '速さ（m/s）' });
  let t0 = 0;
  for (const [v, d] of segs) {
    for (let s = 0; s < d; s++) {
      const a = t0 + s, b = Math.min(a + 1, t);
      if (b <= a) continue;
      const dark = Math.round(a) % 2 === 0;
      g.poly([[a, 0], [b, 0], [b, v], [a, v]], { fill: o.two && t0 > 0 ? 'c' : 'b', alpha: dark ? 0.45 : 0.25 });
      if (b - a > 0.6) g.text(`${A.num(v, 0)} m`, a + 0.5, v / 2, { align: 'center', size: 14, bold: true });
    }
    t0 += d;
  }
  if (o.two) { g.text('はじめの2秒', 1, segs[0][0] + 0.7, { align: 'center', size: 14, color: 'sub' }); if (t > 2) g.text('あとの2秒', 3, segs[1][0] + 0.7, { align: 'center', size: 14, color: 'sub' }); }
  g.plot(x => speedAt(segs, x), { x0: 0, x1: t, color: 'a', width: 3, n: 400 });
  g.line([[t, 0], [t, speedAt(segs, Math.max(0, t - 1e-6))]], { color: 'a', width: 1.5, style: 'dash' });
}

const SEGS1 = [[5, 4]];
A.item({
  id: 'm1-18', title: '《道|みち》のりは《長方形|ちょうほうけい》の《面積|めんせき》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-3「《量|りょう》のたし《算|ざん》・ひき《算|ざん》と、《速|はや》さ」の《図|ず》から（2-13・5-9・5-12、《物理|ぶつり》 《力|りき》-1 でも《使|つか》う）',
  W: 880, H: 420,
  state: { t: 0, v: 5, T: 4, v1: 6, v2: 3 },
  scenes: [
    {
      key: 'menseki', label: '① 《道|みち》のりと《面積|めんせき》',
      lead: '《自転車|じてんしゃ》が1《秒|びょう》に5 mずつ《進|すす》みます（《速|はや》さ5 m/s）。▶ で、《進|すす》んだ《道|みち》のりと、《下|した》のグラフの《長方形|ちょうほうけい》を《見|み》くらべます。',
      note: 'たて5、よこ1の《細|ほそ》い《長方形|ちょうほうけい》の《面積|めんせき》 $5\\times1=5$ は、1《秒間|びょうかん》に《進|すす》む5 m。4つならべた《長方形|ちょうほうけい》の《面積|めんせき》 $5\\times4=20$ は、4《秒間|びょうかん》の《道|みち》のり20 m です。**《速|はや》さ×《時間|じかん》も、たて×よこも、《同|おな》じかけ《算|ざん》**。たまたまではありません。',
      legend: [['《進|すす》んだ《道|みち》のり', { color: 'b' }], ['1《秒|びょう》ごとの《場所|ばしょ》', { color: 'b', shape: 'circle', noline: true }], ['《速|はや》さのグラフ（$v$-$t$ グラフ）', { color: 'a' }], ['1《秒|びょう》ぶんの《長方形|ちょうほうけい》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 't', label: '《時間|じかん》', min: 0, max: 4, step: 0.01, fmt: v => A.num(v, 2) + ' s' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(4, st.t + dt * 0.8); if (st.t >= 4) return false; },
      draw(cv, st) { scene(cv, st, SEGS1, { xmax: 20, xtick: 5, vmax: 6.6, tmax: 4.9 }); },
      readout: st => `5 m/s × ${A.num(st.t, 2)} s ＝ <b>${A.num(5 * st.t, 1)} m</b>　（たて5 × よこ ${A.num(st.t, 2)} の《面積|めんせき》）`
    },
    {
      key: 'kaeru', label: '② 《速|はや》さと《時間|じかん》を《変|か》える',
      lead: '《速|はや》さと《時間|じかん》を《変|か》えて ▶。《長方形|ちょうほうけい》のたてとよこが《変|か》わります。',
      note: '《道|みち》のり＝《速|はや》さ×《時間|じかん》。《単位|たんい》も m/s × s ＝ m で、《道|みち》のりの m になります。《速|はや》さが《一定|いってい》なら、$v$-$t$ グラフの《長方形|ちょうほうけい》の《面積|めんせき》が、《進|すす》んだ《道|みち》のりです。',
      miss: '20 m を4《秒|びょう》で《進|すす》んだ《速|はや》さは $20÷4=5$ で5 m/s。$4÷20=0.2$ ではありません。《速|はや》さは「1《秒|びょう》あたり」の《道|みち》のりなので、《秒|びょう》でわります。',
      legend: [['《進|すす》んだ《道|みち》のり', { color: 'b' }], ['1《秒|びょう》ごとの《場所|ばしょ》', { color: 'b', shape: 'circle', noline: true }], ['《速|はや》さのグラフ', { color: 'a' }], ['1《秒|びょう》ぶんの《長方形|ちょうほうけい》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'v', label: '《速|はや》さ', min: 1, max: 10, step: 1, fmt: v => v + ' m/s', on: re }, { range: 'T', label: '《時間|じかん》', min: 1, max: 8, step: 1, fmt: v => v + ' s', on: re }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(st.T, st.t + dt * 1.2); if (st.t >= st.T) return false; },
      draw(cv, st) { scene(cv, st, [[st.v, st.T]], { xmax: 80, xtick: 10, vmax: 11, tmax: 8.8 }); },
      readout: st => `${st.v} m/s × ${A.num(Math.min(st.t, st.T), 1)} s ＝ <b>${A.num(st.v * Math.min(st.t, st.T), 1)} m</b>　（${st.T} 《秒|びょう》で ${st.v * st.T} m）`
    },
    {
      key: 'kawaru', label: '③ とちゅうで《速|はや》さが《変|か》わる',
      lead: 'はじめの2《秒|びょう》と、あとの2《秒|びょう》で《速|はや》さを《変|か》えます。▶ で、《面積|めんせき》がどうなるか《見|み》ましょう。',
      note: '《速|はや》さがとちゅうで《変|か》わっても、《長方形|ちょうほうけい》を2つに《分|わ》けて、《面積|めんせき》をたせば《道|みち》のりになります（1-21の「《分|わ》けてたす」）。《速|はや》さがなめらかに《変|か》わるときも、グラフの《面積|めんせき》が《道|みち》のりになることを、5-9で《確|たし》かめます。',
      legend: [['《進|すす》んだ《道|みち》のり', { color: 'b' }], ['1《秒|びょう》ごとの《場所|ばしょ》', { color: 'b', shape: 'circle', noline: true }], ['はじめの2《秒|びょう》', { color: 'b', shape: 'square', noline: true }], ['あとの2《秒|びょう》', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 'v1', label: 'はじめの《速|はや》さ', min: 1, max: 10, step: 1, fmt: v => v + ' m/s', on: re }, { range: 'v2', label: 'あとの《速|はや》さ', min: 1, max: 10, step: 1, fmt: v => v + ' m/s', on: re }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(4, st.t + dt * 0.8); if (st.t >= 4) return false; },
      draw(cv, st) { scene(cv, st, [[st.v1, 2], [st.v2, 2]], { xmax: 40, xtick: 5, vmax: 11, tmax: 4.9, two: true }); },
      readout: st => { const a = st.v1 * Math.min(2, st.t), b = st.v2 * A.clamp(st.t - 2, 0, 2); return `${st.v1} × ${A.num(Math.min(2, st.t), 1)} ＋ ${st.v2} × ${A.num(A.clamp(st.t - 2, 0, 2), 1)} ＝ <b>${A.num(a + b, 1)} m</b>`; }
    }
  ]
});
function re(st) { st.t = 0; }
