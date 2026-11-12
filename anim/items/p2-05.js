// @id p2-05
// @title 形が進み、媒質はその場でゆれる
// @vol 物理3
// @from 物理 波-5 ①（p3-05 横波と縦波・縦波の横波表示）・波-9 ①（p3-09 音圧）／波-7・原-0 でも使う
'use strict';
// 媒質の点は 0.1 m おき（本の図と同じ25点、波長は12点分）。ここでは波長 1.2 m・周期 2 s（c=0.6 m/s）として動かす。
// 左のはし（x=0）が時刻0にゆれ始め、ゆれが右へ伝わる：y = A sin ω(t − x/c)（t > x/c のとき）。
const N = 25, DX = 0.1, LAM = 1.2, TP = 2, C = LAM / TP, AMP = 0.12;
A.item({
  id: 'p2-05', title: '形が進み、媒質はその場でゆれる',
  from: '物理 第3巻 波-5 ① の図「横波と縦波」「縦波の横波表示」、波-9 ① の図「音圧」から（波-7・原-0 でも使う）',
  W: 880, H: 400,
  state: { t: 0, sel: 6, p: false },
  scenes: [
    {
      key: 'yoko', label: '① 横波',
      lead: '左のはしを上下にゆらし続けます。色を変えた点（タップで選べます）と、▼の山の動きを比べましょう。',
      note: '媒質の点は、もとの場所で上下にゆれるだけです。進んでいるのは「ゆれの形（山や谷）」と、ゆれのエネルギーです。1周期 $T$ のあいだに、形はちょうど1波長 $\\lambda$ 進みます（$c=\\lambda/T=f\\lambda$）。',
      miss: '「波といっしょに物も進む」のではありません。海の波にうかんだボールも、その場で上下（と前後）にゆれるだけです。岸へ流れるのは、風や、くだけた波の流れのためです。',
      legend: [['媒質の点', { color: 'a', shape: 'circle', noline: true }], ['選んだ点と、その通り道', { color: 'b', shape: 'diamond' }], ['山の位置', { color: 'c', shape: 'tri', noline: true }]],
      autoplay: true,
      step(st, dt) { adv(st, dt); },
      drag: pick(),
      draw(cv, st) { drawWave(cv, st, false); },
      readout: st => ro(st, false)
    },
    {
      key: 'tate', label: '② 縦波',
      lead: 'こんどは左のはしを左右にゆらします。点は左右にずれ、つまった所（密）とまばらな所（疎）ができます。',
      note: '縦波では、ゆれの向き（左右）が、進む向きと同じです。密と疎が交互に並び、それが右へ進みます。でも、1つ1つの点は、もとの場所の周りで左右にゆれるだけです。音は、空気のこの疎密波です。',
      legend: [['媒質の点（短い線はもとの位置）', { color: 'a', shape: 'circle', noline: true }], ['選んだ点', { color: 'b', shape: 'diamond', noline: true }], ['密', { color: 'c', shape: 'tri', noline: true }]],
      autoplay: true,
      step(st, dt) { adv(st, dt); },
      drag: pick(),
      draw(cv, st) { drawWave(cv, st, true); },
      readout: st => ro(st, true)
    },
    {
      key: 'hyouji', label: '③ 縦波を横波のように書く',
      lead: '下の点の、もとの位置からのずれ（右を正）を、上のグラフのたての長さとして書きます。',
      note: 'グラフが0を**右下がり**に横切る所では、左の点が右へ、右の点が左へずれるので、点が集まって密になります。右上がりに横切る所は疎です。音圧（大気圧からのずれ）は、密の所で正、疎の所で負になります。',
      legend: [['ずれ（右へのずれを上に）', { color: 'b' }], ['点のずれの矢印', { color: 'b', style: 'dot' }], ['音圧 $p$', { color: 'c', style: 'dash' }]],
      controls: [{ check: 'p', label: '重ねる', text: '音圧 $p$ のグラフも見る' }],
      state: { t: 8 },
      step(st, dt) { st.t += dt * 0.5; },
      draw(cv, st) { hyouji(cv, st); },
      readout: () => '密：ずれのグラフが0を右下がりに横切る所　　疎：右上がりに横切る所'
    }
  ]
});

function adv(st, dt) { st.t += dt; if (st.t > 14) st.t = 0; }
// 場所 x・時刻 t のずれ（まだゆれが届いていない所は 0）
function u(x, t) { const s = t - x / C; return s > 0 ? AMP * Math.sin(2 * Math.PI * s / TP) : 0; }
function pick() {
  return {
    hit(st, x, y) { const i = Math.round((x - 50) / 32); return i >= 0 && i < N && y > 60 && y < 340 ? i : null; },
    move(st, x) { st.sel = A.clamp(Math.round((x - 50) / 32), 0, N - 1); }
  };
}
function ro(st, tate) {
  const x0 = st.sel * DX, d = u(x0, st.t);
  const front = Math.min(C * st.t, (N - 1) * DX);
  return `選んだ点：もとの位置 ${A.num(x0, 1)} m、ずれ ${A.num(d * 100, 1)} cm（${tate ? '左右' : '上下'}にゆれるだけ）　　ゆれの先頭：${A.num(front, 2)} m（$c$ ＝ ${A.num(C, 1)} m/s）`;
}

function drawWave(cv, st, tate) {
  const X = i => 50 + i * 32, Y0 = tate ? 200 : 210, S = tate ? 32 / DX * 1.0 : 500;
  cv.line([[30, Y0], [850, Y0]], { color: 'grid', width: 1 });
  // 手（波源）
  const hs = u(0, st.t);
  if (!tate) cv.rect(14, Y0 - hs * S - 22, 18, 44, { fill: 'sub', alpha: 0.35 });
  else cv.rect(X(0) + hs * S - 34, Y0 - 30, 14, 60, { fill: 'sub', alpha: 0.35 });
  // 選んだ点の通り道
  const xs = X(st.sel);
  if (!tate) cv.line([[xs, Y0 - AMP * S], [xs, Y0 + AMP * S]], { color: 'b', width: 6, alpha: 0.25 });
  else cv.line([[xs - AMP * S, Y0 + 22], [xs + AMP * S, Y0 + 22]], { color: 'b', width: 6, alpha: 0.25 });
  for (let i = 0; i < N; i++) {
    const d = u(i * DX, st.t);
    if (tate) cv.line([[X(i), Y0 - 34], [X(i), Y0 - 26]], { color: 'sub', width: 1 });
    const px = tate ? X(i) + d * S : X(i), py = tate ? Y0 : Y0 - d * S;
    if (i === st.sel) cv.dot(px, py, { color: 'b', shape: 'diamond', r: 9 });
    else cv.dot(px, py, { color: 'a', r: 7 });
  }
  if (!tate) {
    // 山の位置：ゆれが届いた所で sin が 1 になる所 x = c(t − T/4 − nT)
    for (let n = 0; n < 8; n++) { const xc = C * (st.t - TP / 4 - n * TP); if (xc < 0 || xc > (N - 1) * DX + 0.05) continue; const px = 50 + xc / DX * 32; cv.dot(px, Y0 - AMP * S - 26, { color: 'c', shape: 'tri', r: 8 }); cv.text('山', px, Y0 - AMP * S - 48, { align: 'center', size: 14, color: 'c' }); }
    cv.text('ゆれ（上下）は、進む向き（右）に垂直', 440, 365, { align: 'center', size: 15 });
  } else {
    // 密：ずれが右下がりに 0 を横切る所 → 位相 ω(t − x/c) が 2π の倍数の所 x = c(t − nT)（n=0 はゆれの先頭なので書かない）
    // 疎：位相が π の所 x = c(t − T/2 − nT)
    for (let n = 0; n < 8; n++) {
      const xd = C * (st.t - (n + 1) * TP), xs2 = C * (st.t - TP / 2 - n * TP);
      if (xd >= 0 && xd <= (N - 1) * DX + 0.05) { const px = 50 + xd / DX * 32; cv.dot(px, Y0 - 52, { color: 'c', shape: 'tri', r: 8 }); cv.text('密', px, Y0 - 76, { align: 'center', size: 15, color: 'c', bold: true }); }
      if (xs2 > 0 && xs2 <= (N - 1) * DX + 0.05) { const px = 50 + xs2 / DX * 32; cv.text('疎', px, Y0 - 76, { align: 'center', size: 15, color: 'sub' }); }
    }
    cv.text('ゆれ（左右）は、進む向き（右）と同じ', 440, 365, { align: 'center', size: 15 });
  }
  // 進む向き
  cv.arrow(760, 60, 840, 60, { color: 'ink', width: 2.5 });
  cv.text('波が進む', 800, 40, { align: 'center', size: 15 });
}

function hyouji(cv, st) {
  const X = i => 50 + i * 32, Yg = 130, Yd = 320, S = 32 / DX * 1.0, G = 380;
  const w = 2 * Math.PI / TP, k = 2 * Math.PI / LAM;
  const d = x => AMP * Math.sin(w * st.t - k * x);
  // グラフ
  cv.arrow(30, Yg, 855, Yg, { color: 'sub', width: 1.5, head: 9 }); cv.text('x', 852, Yg - 16, { math: true, italic: true, color: 'sub' });
  cv.text('ずれ（右を正）', 34, 28, { size: 14, color: 'sub' });
  const pts = []; for (let k2 = 0; k2 <= 240; k2++) { const x = k2 / 240 * (N - 1) * DX; pts.push([50 + x / DX * 32, Yg - d(x) * G]); }
  cv.line(pts, { color: 'b', width: 2.5 });
  if (st.p) { const pp = []; for (let k2 = 0; k2 <= 240; k2++) { const x = k2 / 240 * (N - 1) * DX; pp.push([50 + x / DX * 32, Yg - AMP * Math.cos(w * st.t - k * x) * G * 0.8]); } cv.line(pp, { color: 'c', style: 'dash', width: 2 }); cv.text('音圧 p（密で正）', 845, 50, { align: 'right', size: 14, color: 'c' }); }
  // 点とずれの矢印
  cv.line([[30, Yd], [855, Yd]], { color: 'grid', width: 1 });
  for (let i = 0; i < N; i++) {
    const di = d(i * DX);
    cv.line([[X(i), Yd - 22], [X(i), Yd - 14]], { color: 'sub', width: 1 });
    cv.dot(X(i) + di * S, Yd, { color: 'a', r: 7 });
    if (Math.abs(di * G) > 3) cv.arrow(X(i), Yg, X(i), Yg - di * G, { color: 'b', style: 'dot', width: 2, head: 7 });
    cv.line([[X(i), Yg + 6], [X(i), Yd - 26]], { color: 'grid', width: 1, style: 'dot' });
  }
  // 密・疎の場所：位相 wt − kx = 0（ずれが右下がりに0）・π（右上がりに0）
  for (let n = -2; n < 6; n++) {
    for (const [ph, nm, col] of [[0, '密', 'c'], [Math.PI, '疎', 'sub']]) {
      const x = (w * st.t - ph - 2 * Math.PI * n) / k; if (x < 0 || x > (N - 1) * DX) continue;
      cv.text(nm, X(0) + x / DX * 32, Yd + 34, { align: 'center', size: 16, bold: nm === '密', color: col });
    }
  }
}
