// @id p2-14
// @title エイリアシング：逆に回って見える車輪
// @vol 物理3
// @from 物理 波-11 ②（p3-11:212・173・221）／数学 9-4⑭・3-17 と同じ題材（M4-24）
'use strict';
// 記号は本と同じ：サンプリング周波数 f_s、見かけの周波数 f_見、ナイキスト周波数 f_s/2
const deg = Math.PI / 180;
function wrap(a, p) { return a - p * Math.round(a / p); }   // −p/2〜p/2 に直す
A.item({
  id: 'p2-14', title: 'エイリアシング：逆に回って見える車輪',
  from: '物理 第3巻 波-11 ②「速すぎるゆれは化ける：エイリアシング」の図から（数学 9-4⑭ と同じ数）',
  W: 880, H: 432,
  state: { t: 0, n: 2.75, fs: 24, mark: false, f: 1, fs2: 8, n3: 25, fl: 24, t3: 0 },
  scenes: [
    {
      key: 'sharin', label: '① 動画の車輪',
      lead: 'スポーク8本の車輪が、左回りに1秒に 2.75 回転しています。動画（1秒に24コマ）に映すと、どう見えるでしょう。',
      note: '1コマの間に回る角は $2.75\\times360°\\div24=41.25°$。スポークは 45° ごとに同じ形なので、41.25° 進んだ写真は、3.75° もどった写真とまったく同じです。目は「いちばん少なく動いた」と受けとるので、車輪は1コマに 3.75° ずつ、1秒に 90°、**逆に**回って見えます。1秒に48コマにすると、1コマに 20.625° しか回らないので、正しい向きに見えます。',
      legend: [['印をつけたスポーク', { color: 'b', width: 4 }], ['ほかのスポーク', { color: 'a', width: 2 }], ['前のコマのスポーク', { color: 'sub', style: 'dot' }]],
      controls: [
        { range: 'n', label: '回転数〔回転/s〕', min: 0, max: 6, step: 0.05, d: 2 },
        { range: 'fs', label: '1秒のコマ数 $f_{\\mathrm s}$', min: 12, max: 60, step: 1, d: 0 },
        { check: 'mark', label: '映った車輪', text: '印をつけたスポークも見せる' }
      ],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 1e4) st.t = 0; },
      draw: drawSharin,
      readout: st => { const a = st.n * 360 / st.fs, ap = wrap(a, 45); return `1コマに回る角 ＝ ${A.num(st.n, 2)} × 360° ÷ ${st.fs} ＝ <b>${A.num(a, 2)}°</b>　→　見かけ ${ap >= 0 ? '' : '−'}${A.num(Math.abs(ap), 2)}°／コマ ＝ 1秒に <b>${A.num(ap * st.fs, 1)}°</b>（${Math.abs(ap) < 0.01 ? '止まって見える' : ap > 0 ? '正しい向き' : '逆向き'}）`; }
    },
    {
      key: 'orikaeshi', label: '② 見かけの周波数',
      lead: '1秒に 8000 回（$f_{\\mathrm s}=8$ kHz）とった点を、もとの音（細い線）と、点を通るいちばん低い音（破線）で見ます。▶ でもとの周波数が上がります。',
      note: '見かけの周波数は $f_{見}=|f-nf_{\\mathrm s}|$（$n$ は、これが $0\\sim f_{\\mathrm s}/2$ に入る整数）。$f_{\\mathrm s}/2$（ナイキスト周波数）で折り返す、のこぎりの歯の線の上にあります。1・7・9・15 kHz はどれも 1 kHz に、3・5・11 kHz はどれも 3 kHz に見えます。',
      miss: '$f_{\\mathrm s}/2$ より高い音は、データに残らないのではありません。消えずに、低い周波数に**化けて**データに残ります（エイリアシング）。化けた音はあとから見分けられないので、とる前にフィルターで取り除きます。',
      legend: [['もとの音 $f$', { color: 'a', width: 1.5 }], ['とった点', { color: 'ink', shape: 'circle', noline: true }], ['見かけの音 $f_{見}$', { color: 'b', style: 'dash' }], ['正しく見える範囲（$f_{\\mathrm s}/2$ まで）', { color: 'c', style: 'dot' }]],
      controls: [
        { range: 'f', label: 'もとの周波数 $f$〔kHz〕', min: 0, max: 26, step: 0.1, d: 1 },
        { range: 'fs2', label: '$f_{\\mathrm s}$〔kHz〕', min: 4, max: 16, step: 1, d: 0 }
      ],
      step(st, dt) { st.f += dt * 1.2; if (st.f >= 26) { st.f = 26; return false; } },
      draw: drawOrikaeshi,
      readout: st => { const fa = Math.abs(wrap(st.f, st.fs2)); return `$f$ ＝ ${A.num(st.f, 1)} kHz を $f_{\\mathrm s}$ ＝ ${st.fs2} kHz でとる　→　$f_{見}$ ＝ <b>${A.num(fa, 1)} kHz</b>${st.f > st.fs2 / 2 + 1e-9 ? '（化けている）' : '（正しく見える）'}`; }
    },
    {
      key: 'strobe', label: '③ ストロボ',
      lead: '1秒に25回転する軸に、印を1つつけました。短い時間だけ光る明かり（ストロボ）で照らすと、光った瞬間の印だけが見えます（画面では 1/20 の速さ）。',
      note: '光る間に軸がちょうど1回転するとき、印は止まって見えます。止まって見えるいちばん大きい光る回数が、1秒の回転数です。光る回数を少しだけ少なくすると、印はゆっくり前へ回って見えます。わざとエイリアシングを起こして、速い回転を「止めて」見ているのです。',
      legend: [['光った瞬間の印', { color: 'b', shape: 'circle', noline: true }], ['その前に光ったときの印', { color: 'sub', shape: 'circle', noline: true }]],
      controls: [
        { range: 'fl', label: '1秒に光る回数〔回〕', min: 10, max: 60, step: 0.5, d: 1 },
        { range: 'n3', label: '回転数〔回転/s〕', min: 10, max: 40, step: 0.5, d: 1 }
      ],
      autoplay: true,
      step(st, dt) { st.t3 += dt / 20; if (st.t3 > 1e3) st.t3 = 0; },
      draw: drawStrobe,
      readout: st => { const a = st.n3 / st.fl * 360, ap = wrap(a, 360); return `光る間に回る角 ＝ ${A.num(st.n3, 1)} ÷ ${A.num(st.fl, 1)} × 360° ＝ ${A.num(a, 1)}°　→　見かけ <b>${A.num(ap, 1)}°</b>／回（${Math.abs(ap) < 0.05 ? '止まって見える' : ap > 0 ? '前へ回って見える' : '後ろへ回って見える'}）`; }
    }
  ]
});

function wheel(cv, cx, cy, r, ang, o) {
  cv.circle(cx, cy, r, { color: 'sub', width: 3 });
  cv.circle(cx, cy, r * 0.1, { fill: 'sub', alpha: 0.6 });
  for (let k = 0; k < (o.spokes || 8); k++) {
    const a = ang + k * 2 * Math.PI / (o.spokes || 8), mk = o.mark && k === 0;
    const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
    cv.line([[cx, cy], [x, y]], { color: o.ghost ? 'sub' : mk ? 'b' : 'a', width: o.ghost ? 1.5 : mk ? 5 : 2.5, style: o.ghost ? 'dot' : 'solid' });
    if (mk) cv.dot(x, y, { color: 'b', r: 6 });
  }
}
function drawSharin(cv, st) {
  const w = 2 * Math.PI * st.n, ang = w * st.t;
  const kf = Math.floor(st.t * st.fs), angF = w * kf / st.fs, angP = w * (kf - 1) / st.fs;
  cv.text('本当の動き（印あり）', 160, 22, { size: 16, align: 'center', bold: true });
  wheel(cv, 160, 165, 115, ang, { mark: true });
  cv.text('動画に映る車輪（1コマずつ）', 470, 22, { size: 16, align: 'center', bold: true });
  wheel(cv, 470, 165, 115, angP, { ghost: true });
  wheel(cv, 470, 165, 115, angF, { mark: st.mark });
  // 左回りの矢印
  const arc = []; for (let k = 0; k <= 16; k++) { const a = (20 + 40 * k / 16) * deg; arc.push([160 + 132 * Math.cos(a), 165 - 132 * Math.sin(a)]); }
  cv.line(arc, { color: 'ink', width: 2 }); cv.arrow(arc[15][0], arc[15][1], arc[16][0], arc[16][1], { color: 'ink', width: 2, head: 11 });
  cv.text('左回り', 255, 40, { size: 14, color: 'sub' });
  // 右：直近の4コマ（本の図のように）
  cv.text('最近の4コマ（印つき）', 760, 22, { size: 15, align: 'center', color: 'sub' });
  for (let i = 0; i < 4; i++) {
    const k = kf - 3 + i, cy = 70 + i * 80;
    wheel(cv, 720, cy, 30, w * k / st.fs, { mark: true });
    cv.text((i === 3 ? 'いま' : A.num(i - 3, 0) + ' コマ'), 765, cy, { size: 14, color: 'sub' });
  }
  const a = st.n * 360 / st.fs, ap = wrap(a, 45);
  cv.text(`1コマに ${A.num(a, 2)}°　＝　45° × ${Math.round(a / 45)} ${ap >= 0 ? '＋' : '−'} ${A.num(Math.abs(ap), 2)}°`, 315, 315, { size: 16, align: 'center', bg: true });
  cv.text(`映った車輪は 1コマに ${A.num(Math.abs(ap), 2)}° ${Math.abs(ap) < 0.01 ? '（止まって見える）' : ap > 0 ? '左回り（正しい向き）' : '右回り（逆向き）'}`, 315, 345, { size: 16, align: 'center', bold: true, color: ap < -0.01 ? 'b' : 'ink', bg: true });
  cv.text(`スポークの形の周波数 ${A.num(st.n * 8, 1)} Hz を ${st.fs} Hz でとる → 見かけ ${A.num(wrap(st.n * 8, st.fs), 1)} Hz`, 315, 380, { size: 14, align: 'center', color: 'sub' });
}

function drawOrikaeshi(cv, st) {
  const fs = st.fs2, f = st.f, fa = Math.abs(wrap(f, fs));
  // 上：波ととった点（0〜1 ms）
  const g = cv.view({ x0: 0, x1: 1.0, y0: -1.3, y1: 1.3, box: [60, 26, 790, 160] });
  g.axes({ xt: A.range(0, 1, 0.125), yt: [-1, 1], xfmt: v => A.num(v, 3).replace(/0+$/, '').replace(/\.$/, ''), grid: false });
  g.plot(t => Math.cos(2 * Math.PI * f * t), { color: 'a', width: 1.5, n: 1600 });
  cv.text('時刻 t（ms）', 850, 200, { size: 14, color: 'sub', align: 'right', bg: true });
  g.plot(t => Math.cos(2 * Math.PI * fa * t), { color: 'b', width: 2.5, style: 'dash', n: 600 });
  for (let m = 0; m * 1 / fs <= 1.0001; m++) { const t = m / fs; g.dot(t, Math.cos(2 * Math.PI * f * t), { color: 'ink', r: 6 }); }
  // 下：のこぎりの歯
  const h = cv.view({ x0: 0, x1: 26, y0: 0, y1: 9, box: [60, 236, 790, 150] });
  h.poly([[0, 0], [fs / 2, 0], [fs / 2, fs / 2], [0, fs / 2]], { fill: 'c', alpha: 0.12 });
  h.axes({ xt: A.range(0, 26, 2), yt: [1, 3, fs / 2], yl: '見かけ（kHz）' });
  h.line([[fs / 2, 0], [fs / 2, 9]], { color: 'c', style: 'dot', width: 2 });
  h.line([[0, fs / 2], [26, fs / 2]], { color: 'c', style: 'dot', width: 2 });
  h.plot(x => Math.abs(wrap(x, fs)), { color: 'ink', width: 2, n: 800 });
  cv.text('もとの周波数 f（kHz）', 850, 420, { size: 14, color: 'sub', align: 'right', bg: true });
  if (fs === 8) { for (const x of [1, 7, 9, 15]) h.dot(x, 1, { color: 'sub', r: 4 }); for (const x of [3, 5, 11]) h.dot(x, 3, { color: 'sub', r: 4, shape: 'square' }); }
  h.text(`fₛ/2 = ${A.num(fs / 2, 1)} kHz（ナイキスト周波数）`, fs / 2 + 0.3, fs / 2 + 0.9, { size: 14, color: 'c', bg: true });
  h.line([[f, 0], [f, fa]], { color: 'b', width: 1, style: 'dot' });
  h.dot(f, fa, { color: 'b', shape: 'diamond', r: 8 });
}

function drawStrobe(cv, st) {
  const t = st.t3, k = Math.floor(t * st.fl), cx = 300, cy = 205, r = 150;
  cv.circle(cx, cy, r, { color: 'sub', width: 3, fill: 'panel', alpha: 1 });
  cv.circle(cx, cy, 18, { fill: 'sub', alpha: 0.6 });
  for (let i = 4; i >= 0; i--) {
    const tk = (k - i) / st.fl, a = 2 * Math.PI * st.n3 * tk + Math.PI / 2;
    const x = cx + r * 0.8 * Math.cos(a), y = cy - r * 0.8 * Math.sin(a);
    if (i === 0) { cv.line([[cx, cy], [x, y]], { color: 'b', width: 3 }); cv.dot(x, y, { color: 'b', r: 13 }); }
    else cv.dot(x, y, { color: 'sub', r: 9 - i, open: true });
  }
  cv.text('軸を正面から見る', cx, 30, { size: 15, align: 'center', color: 'sub' });
  const a = st.n3 / st.fl * 360, ap = wrap(a, 360);
  const x0 = 520;
  cv.text(`1秒に ${A.num(st.n3, 1)} 回転`, x0, 80, { size: 17 });
  cv.text(`1秒に ${A.num(st.fl, 1)} 回光る`, x0, 115, { size: 17 });
  cv.text(`光る間に ${A.num(st.n3 / st.fl, 3)} 回転`, x0, 160, { size: 17 });
  cv.text(`見かけ：1回に ${A.num(ap, 1)}°`, x0, 205, { size: 18, bold: true, color: 'b' });
  cv.text(Math.abs(ap) < 0.05 ? '止まって見える' : ap > 0 ? '前へ（左回り）回って見える' : '後ろへ（右回り）回って見える', x0, 245, { size: 17, bold: true });
  cv.text(`止まって見える光る回数：${[1, 2, 3, 4].map(q => A.num(st.n3 / q, 1)).filter(v => +v >= 10).join('・')} …`, x0, 300, { size: 15, color: 'sub' });
  cv.text('（いちばん大きいものが回転数）', x0, 325, { size: 15, color: 'sub' });
}
