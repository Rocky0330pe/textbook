// @id p1-04
// @title エレベーターの体重計：重く感じるわけ
// @vol 物理1
// @from 物理 力-2 ⑥（p1-02 の慣性力・例題1「エレベーターの中の体重計」・目盛りのグラフ）
'use strict';
// 力の矢印は実線、慣性力（見かけの力）は長い破線、速度は破線、加速度は点線。札でも分ける。
const G = 9.8, M = 60;
// 動き方：0〜1 s 止まる、1〜3 s 加速（1.0 m/s²）、3〜7 s 一定（2.0 m/s）、7〜9 s 減速、9〜10 s 止まる
function accel(t, dir) { const a = t >= 1 && t < 3 ? 1 : t >= 7 && t < 9 ? -1 : 0; return a * dir; }
function motion(t, dir) {
  // 位置と速度（区切りごとに式で）
  const seg = [[0, 1, 0], [1, 3, 1], [3, 7, 0], [7, 9, -1], [9, 10, 0]];
  let x = 0, v = 0;
  for (const [a0, a1, a] of seg) { const d = Math.max(0, Math.min(t, a1) - a0); x += v * d + a * d * d / 2; v += a * d; if (t <= a1) break; }
  return { x: x * dir, v: v * dir };
}
A.item({
  id: 'p1-04', title: 'エレベーターの体重計：重く感じるわけ',
  from: '物理 第1巻『力学』 力-2 ⑥（慣性力）と例題1、目盛りのグラフから（力-7 ⑧ でも使う）',
  W: 880, H: 440,
  state: { t: 0, dir: 1, view: 'soto', a: 1 },
  scenes: [
    {
      key: 'ugoki', label: '① 動き出し・一定・停止',
      lead: '60 kg の人が体重計に乗っています。エレベーターが動き出し、同じ速さで進み、止まるまでの目盛りを記録します。',
      note: '目盛りが変わるのは、**加速度があるとき**だけです。同じ速さで動いているあいだは、止まっているときと同じ 60 kg。上へ動き出すときは $N=m(g+a)=60\\times(9.8+1.0)=648$ N で約 66 kg、上へ動いていて止まるときは 528 N で約 54 kg（例題1）。',
      miss: '「速く動いているほど重い」はまちがい。重さの感じ方を決めるのは速度ではなく加速度です。下へ動いていて止まるときも、加速度は上向きなので、目盛りは大きくなります。',
      legend: [['垂直抗力 $N$（実線）', { color: 'a' }], ['重力 $mg$（実線）', { color: 'b' }], ['慣性力 $ma$（見かけの力）', { color: 'd', style: 'long' }], ['加速度（点線）', { color: 'c', style: 'dot' }], ['速度（破線）', { color: 'e', style: 'dash' }]],
      controls: [{ seg: 'view', label: '見る人', options: [['soto', '地面から'], ['naka', 'エレベーターの中から']] }, { seg: 'dir', label: '動く向き', options: [[1, '上へ'], [-1, '下へ']], on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.8; if (st.t >= 10) { st.t = 10; return false; } },
      draw: drawUgoki,
      readout: st => { const a = accel(st.t, st.dir), N = M * (G + a); return `$t$ ＝ ${A.num(st.t, 1)} s　　加速度 ${A.num(a, 1)} m/s²（上向き $+$）　　$N$ ＝ 60 ×（9.8 ${a < 0 ? '−' : '＋'} ${A.num(Math.abs(a), 1)}）＝ ${A.num(N, 0)} N　　目盛り ＝ <b>${A.num(N / G, 1)} kg</b>`; }
    },
    {
      key: 'kasokudo', label: '② 加速度と目盛り',
      lead: 'エレベーターの加速度 $a$ を変えると、体重計の目盛り（$N÷g$）はどうなるでしょう。',
      note: '目盛りは $a$ の1次関数 $60(9.8+a)/9.8$ です。加速度が2倍（1→2）になっても目盛りは2倍にならず、**増える分**（6 kg → 12 kg）が2倍になります。$a=-g$（自由落下）なら $N=0$ で、目盛りは0（無重量の状態）。',
      legend: [['垂直抗力 $N$', { color: 'a' }], ['重力 $mg$', { color: 'b' }], ['目盛り $=60(9.8+a)/9.8$', { color: 'ink' }]],
      controls: [{ range: 'a', label: '加速度 $a$〔m/s²〕（上向き $+$）', min: -9.8, max: 4, step: 0.1, d: 1 }],
      draw: drawKasokudo,
      readout: st => { const N = M * (G + st.a); return `$a$ ＝ ${A.num(st.a, 1)} m/s²　　$N$ ＝ ${A.num(N, 0)} N　　目盛り ＝ <b>${A.num(N / G, 1)} kg</b>`; }
    }
  ]
});

function person(cv, x, yFeet, h) {
  // 立っている人（足もとが yFeet、高さ h px）
  const c = 'ink', w = 2.5;
  cv.circle(x, yFeet - h * 0.88, h * 0.1, { fill: 'bg', alpha: 1, color: c, width: w });
  cv.line([[x, yFeet - h * 0.78], [x, yFeet - h * 0.42]], { color: c, width: w });
  cv.line([[x - h * 0.18, yFeet - h * 0.55], [x, yFeet - h * 0.7], [x + h * 0.18, yFeet - h * 0.55]], { color: c, width: w });
  cv.line([[x - h * 0.12, yFeet], [x, yFeet - h * 0.42], [x + h * 0.12, yFeet]], { color: c, width: w });
}
function cage(cv, cx, top, a, v, view, showVA, ex) {
  ex = ex || 1;   // N と mg の差・慣性力を ex 倍に大きくかく
  // かご（幅 150・高さ 200）と人・体重計・力
  const w = 150, h = 200, bot = top + h;
  cv.rect(cx - w / 2, top, w, h, { fill: 'panel', alpha: 1, color: 'ink', width: 2 });
  cv.line([[cx, top - 60], [cx, top]], { color: 'sub', width: 2 });
  cv.rect(cx - 30, bot - 14, 60, 10, { fill: 'sub', alpha: 0.5, color: 'ink', width: 1 });
  person(cv, cx, bot - 14, 120);
  const N = M * (G + a), sN = 0.11, Nd = Math.max(0, M * G + ex * M * a);   // 1 N を 0.11 px
  if (Nd > 1) cv.arrow(cx - 36, bot - 10, cx - 36, bot - 10 - Nd * sN, { color: 'a', width: 4 });
  cv.text('N', cx - 42, bot - 10 - Nd * sN + 12, { size: 16, color: 'a', math: true, italic: true, bold: true, align: 'right' });
  cv.arrow(cx + 36, bot - 70, cx + 36, bot - 70 + M * G * sN, { color: 'b', width: 4 });
  cv.text('mg', cx + 42, bot - 70 + M * G * sN - 10, { size: 16, color: 'b', math: true, italic: true, bold: true });
  if (view === 'naka' && Math.abs(a) > 0.01) {
    cv.arrow(cx + 58, bot - 70, cx + 58, bot - 70 + M * a * sN * ex, { color: 'd', style: 'long', width: 3.5 });
    cv.text('慣性力', cx + 64, bot - 70 + M * a * sN * ex / 2, { size: 15, color: 'd', bg: true });
  }
  if (showVA) {
    if (Math.abs(a) > 0.01) { cv.arrow(cx - w / 2 - 22, top + h / 2, cx - w / 2 - 22, top + h / 2 - a * 45, { color: 'c', style: 'dot', width: 3.5 }); cv.text('a', cx - w / 2 - 30, top + h / 2 - a * 30, { size: 16, color: 'c', math: true, italic: true, align: 'right' }); }
    if (Math.abs(v) > 0.01) { cv.arrow(cx + w / 2 + 22, top + h / 2, cx + w / 2 + 22, top + h / 2 - v * 30, { color: 'e', style: 'dash', width: 3 }); cv.text('v', cx + w / 2 + 30, top + h / 2 - v * 18, { size: 16, color: 'e', math: true, italic: true }); }
  }
  // 体重計の表示
  cv.rect(cx - 34, bot + 8, 68, 26, { fill: 'bg', alpha: 1, color: 'ink', width: 1.5 });
  cv.text(A.num(N / G, 1) + ' kg', cx, bot + 21, { size: 15, bold: true, align: 'center' });
}
function drawUgoki(cv, st) {
  const t = st.t, a = accel(t, st.dir), m = motion(t, st.dir), px = 12;  // 1 m を 12 px
  // 建物の階（3 m ごと）
  const cx = 150, top0 = st.dir > 0 ? 196 : 52;   // かごの上のはし（はじめ）
  const shift = st.view === 'naka' ? m.x * px : 0;          // 中から見ると、まわりが動く
  const cageTop = st.view === 'naka' ? top0 : top0 - m.x * px;
  cv.g.save(); cv.g.beginPath(); cv.g.rect(0, 36, 300, 370); cv.g.clip();
  // かべの目もり（はじめのかごの床からの高さ、2 m ごと）
  for (let hm = -32; hm <= 32; hm += 4) { const y = top0 + 200 - hm * px + shift; if (y < 30 || y > 410) continue; cv.line([[58, y], [70, y]], { color: 'sub', width: 1.5 }); cv.text((hm < 0 ? '−' : '') + Math.abs(hm) + ' m', 54, y, { size: 14, color: 'sub', align: 'right' }); }
  cv.line([[70, 30], [70, 410]], { color: 'sub', width: 1 });
  cage(cv, cx, cageTop, a, m.v, st.view, st.view === 'soto', 5);
  cv.g.restore();
  cv.text(st.view === 'naka' ? 'エレベーターの中から見る' : '地面から見る', cx, 22, { size: 15, bold: true, align: 'center', bg: true });
  cv.text('N と mg の差・慣性力は5倍に大きくかいた', cx, 424, { size: 13, color: 'sub', align: 'center', bg: true });
  // グラフ：目盛りの記録
  const g = cv.view({ x0: 0, x1: 10.5, y0: 40, y1: 80, box: [380, 30, 470, 250] });
  g.axes({ xt: [1, 3, 5, 7, 9], yt: [50, 54, 60, 66, 70], xl: 't〔s〕', yl: '目盛り〔kg〕', ax: 40 });
  g.plot(s => M * (G + accel(s, st.dir)) / G, { x0: 0, x1: 10, color: 'a', width: 1, alpha: 0.25, n: 600 });
  for (let k = 0; k * 0.25 <= t + 1e-9; k++) { const s = k * 0.25; g.dot(s, M * (G + accel(s, st.dir)) / G, { color: 'a', r: 3.5 }); }
  g.dot(t, M * (G + a) / G, { color: 'a', r: 7, shape: 'diamond' });
  // 速度のグラフ（小さく）
  const h = cv.view({ x0: 0, x1: 10.5, y0: -2.4, y1: 2.4, box: [380, 310, 470, 110] });
  h.axes({ xt: [1, 3, 5, 7, 9], yt: [-2, 2], xl: 't〔s〕', yl: '速度〔m/s〕（上向き＋）' });
  h.plot(s => motion(s, st.dir).v, { x0: 0, x1: 10, color: 'e', style: 'dash', width: 1.5, alpha: 0.35, n: 400 });
  h.plot(s => motion(s, st.dir).v, { x0: 0, x1: t, color: 'e', style: 'dash', width: 3, n: 400 });
  const lab = t < 1 ? '止まっている' : t < 3 ? (st.dir > 0 ? '上へ動き出す' : '下へ動き出す') : t < 7 ? '同じ速さ' : t < 9 ? (st.dir > 0 ? '上へ動いていて止まる' : '下へ動いていて止まる') : '止まった';
  cv.text(lab, 615, 22, { size: 16, bold: true, align: 'center', bg: true });
}
function drawKasokudo(cv, st) {
  cage(cv, 150, 140, st.a, 0, 'soto', false);
  if (Math.abs(st.a) > 0.01) { cv.arrow(40, 240, 40, 240 - st.a * 25, { color: 'c', style: 'dot', width: 3.5 }); cv.text('a', 32, 240 - st.a * 9, { size: 16, color: 'c', math: true, italic: true, align: 'right' }); }
  const g = cv.view({ x0: -10.5, x1: 4.4, y0: 0, y1: 92, box: [380, 30, 470, 370] });
  g.axes({ xt: [-9.8, -8, -6, -4, -2, 2, 4], yt: [30, 60, 90], xl: 'a〔m/s²〕', yl: '目盛り〔kg〕', xfmt: v => v === -9.8 ? '−g' : A.num(v, 0) });
  g.plot(a => M * (G + a) / G, { x0: -9.8, x1: 4, color: 'ink', width: 2.5 });
  for (const [a, lab] of [[1, '66'], [2, '72'], [-1, '54']]) { g.dot(a, M * (G + a) / G, { color: 'a', r: 4 }); g.text(lab, a + 0.2, M * (G + a) / G - 4, { size: 14, color: 'sub' }); }
  g.dot(-9.8, 0, { color: 'a', r: 4 }); g.text('無重量（0）', -9.4, 6, { size: 15, color: 'sub' });
  g.dot(st.a, M * (G + st.a) / G, { color: 'a', r: 8, shape: 'diamond' });
}
