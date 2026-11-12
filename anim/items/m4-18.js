// @id m4-18
// @title 熱がならされる：棒の表計算と r≦½
// @vol 数学8
// @from 数学 8-13 図3〜6（ch8-13:229・252・351・394）、8-12 図4（ch8-12:262）／9-1・9-11・物理 熱-11 でも使う
'use strict';
// 8-13 やってみよう：長さ 0.1 m のアルミの棒を Δx=0.01 m の11点に。左はし100℃、はじめ20℃。α=1×10⁻⁴ m²/s
// r = αΔt/Δx² なので、この棒では Δt〔s〕と r が同じ数になる
const SNAP = [1, 5, 15.5, 30];
function stepRod(T, r, fixedRight) {
  const U = T.slice();
  for (let i = 1; i < 10; i++) U[i] = T[i] + r * (T[i + 1] - 2 * T[i] + T[i - 1]);   // 1歩の式
  U[10] = fixedRight ? 20 : T[10] + 2 * r * (T[9] - T[10]);                          // 右はし（断熱）
  return U;
}
function initRod(st) { st.T = Array(11).fill(20); st.T[0] = 100; st.n = 0; st.acc = 0; st.cross = null; }
function snaps(fixed) {   // 1・5・15.5・30 秒の形（r=0.25）
  const out = {}; let T = Array(11).fill(20); T[0] = 100;
  for (let k = 1; k <= 120; k++) { T = stepRod(T, 0.25, fixed); const t = k * 0.25; if (SNAP.includes(t)) out[t] = T.slice(); }
  return out;
}
const SN = { false: snaps(false), true: snaps(true) };
function initPlate(st) { st.P = [[0, 100, 100, 100, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]; st.k = 0; st.acc = 0; }
function narasu(st) {
  const P = st.P, Q = P.map(r => r.slice());
  for (let i = 1; i < 4; i++) for (let j = 1; j < 4; j++) Q[i][j] = (P[i - 1][j] + P[i + 1][j] + P[i][j - 1] + P[i][j + 1]) / 4;
  st.P = Q; st.k++;
}

A.item({
  id: 'm4-18', title: '熱がならされる：棒の表計算と r≦½',
  from: '数学 第8巻 8-13 図3〜6・8-12 図4 から（9-1・9-11、物理 熱-11 でも使う）',
  W: 880, H: 440,
  state: { r: 0.25, fixed: false, ghost: true },
  scenes: [
    {
      key: 'bou', label: '① 棒の温度',
      lead: '左はしを100 ℃のお湯につけた棒（はじめ20 ℃）。▶ で、0.25秒ずつ表計算を進めます。',
      note: '1歩の式は「次の温度＝今の温度＋$r\\times$（左 $-2\\times$ 自分 $+$ 右）」、$r=0.25$。熱は1歩に1マスずつしみこみ、でこぼこはすぐにならされます。まん中が50 ℃をこえるのは15.5秒（右はし20 ℃なら16.5秒）。右はしを20 ℃に保つと、6-3 のかべと同じ直線に落ち着きます。',
      miss: 'はしの点には1歩の式を使いません。左はしは100 ℃のまま（境界条件）、右はし（断熱）は左どなりからだけ熱をもらう式 $T+2r(T_{\\text{左}}-T)$ です。',
      init: initRod,
      legend: [['いまの温度', { color: 'b', shape: 'circle' }], ['1・5・15.5・30秒の形', { color: 'sub', style: 'dot' }], ['落ち着く先（右はし20 ℃のとき）', { color: 'c', style: 'dash' }]],
      controls: [{ seg: 'fixed', label: '右はし', options: [[false, '断熱材でくるむ'], [true, '20 ℃の水につける']], on: initRod }, { check: 'ghost', label: '見本', text: '1・5・15.5・30秒の形を重ねる' }],
      step(st, dt) {
        st.acc += dt * 6;   // 1秒で6秒ぶん進める
        while (st.acc >= 0.25) { st.acc -= 0.25; st.T = stepRod(st.T, 0.25, st.fixed); st.n++; if (st.cross === null && st.T[5] >= 50) st.cross = st.n * 0.25; }
        if (st.n * 0.25 >= 100) return false;
      },
      draw(cv, st) { drawRod(cv, st, false); },
      readout: st => `$t$ ＝ ${A.num(st.n * 0.25, 2)} 秒（${st.n} 歩め）　まん中（$x=0.05$）＝ <b>${A.num(st.T[5], 2)} ℃</b>` + (st.cross !== null ? `　50 ℃をこえたのは ${A.num(st.cross, 2)} 秒` : '')
    },
    {
      key: 'kowareru', label: '② r を大きくすると',
      lead: '1歩を大きくすれば速く計算できるでしょうか。$r$（＝この棒では $\\Delta t$ の秒数）を変えて、▶ で進めます。',
      note: 'となりどうしが $+a$、$-a$ と入れかわる「ぎざぎざ」は、1歩ごとに $1-4r$ 倍になります。$r\\leqq\\frac{1}{2}$ なら $1-4r$ は $-1$ 以上で消えていきますが、$r=0.6$ では $-1.4$ 倍ずつ育ち、12秒後には $-410$ ℃から519 ℃になります。熱いお湯につけた棒が $-410$ ℃になるはずはありません。**計算がこわれた**のです。',
      miss: '$\\Delta t$ を10倍にすれば10倍速く答えが出る、ではありません。$r=\\frac{\\alpha\\Delta t}{\\Delta x^2}\\leqq\\frac{1}{2}$ をこえると、計算がこわれます。',
      state: { r: 0.6 },
      init: initRod,
      legend: [['温度（点は計算した所）', { color: 'b', shape: 'square' }], ['$r=0.25$ の同じ時刻', { color: 'a', style: 'dash' }], ['ぎざぎざの1歩の倍率 $1-4r$', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ range: 'r', label: '$r$（$\\Delta t$ 秒）', min: 0.1, max: 0.6, step: 0.05, d: 2, on: initRod }],
      step(st, dt) {
        st.acc += dt;
        if (st.acc >= 0.35) { st.acc = 0; st.T = stepRod(st.T, st.r, false); st.n++; }
        if (st.n >= 30) return false;
      },
      draw(cv, st) { drawRod(cv, st, true); },
      readout: st => `$r$ ＝ ${A.num(st.r)}（$\\Delta t$ ＝ ${A.num(st.r)} 秒）　${st.n} 歩め（${A.num(st.n * st.r, 2)} 秒）　$x=0.01$ の温度 ＝ ${A.num(st.T[1], 2)} ℃　　$1-4r$ ＝ ${A.num(1 - 4 * st.r, 2)}`
    },
    {
      key: 'ita', label: '③ 板をならす',
      lead: '上のふちが100 ℃、ほかのふちが0 ℃の板。まん中の9点を、「まわり4点の平均」に置きかえることをくり返します。',
      note: '1回めは上の段だけが25（$(100+0+0+0)÷4$）、2回めにはまん中の段に6.25がしみこみます。30回ほどで、ほとんど変わらなくなります。どの点も「まわり4点の平均と同じ温度」が、温度の落ち着いた形（定常）です。',
      init: initPlate,
      legend: [['100 ℃のふち', { color: 'b', shape: 'square', noline: true }], ['0 ℃のふち', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ button: '1回ならす', act: st => narasu(st) }],
      step(st, dt) { st.acc += dt; if (st.acc > 0.4) { st.acc = 0; narasu(st); } if (st.k >= 40) return false; },
      draw(cv, st) { drawPlate(cv, st); },
      readout: st => `${st.k} 回め　まん中の点 ＝ ${A.num(st.P[2][2], 2)} ℃`
    }
  ]
});

function heatCol(T) { return T >= 20 ? 'b' : 'a'; }
function drawRod(cv, st, unstable) {
  // 上：棒のマス（色の濃さが温度。数も書く）
  const L0 = 60, w = 70, top = 22;
  for (let i = 0; i <= 10; i++) {
    const T = st.T[i], a = A.clamp(Math.abs(T - 20) / 80, 0, 1);
    cv.rect(L0 + i * w, top, w - 4, 38, { fill: heatCol(T), alpha: 0.08 + 0.55 * a, color: 'line', width: 1 });
    cv.text(Math.abs(T) < 1000 ? A.num(T, Math.abs(T) < 100 ? 1 : 0) : (T > 0 ? '大' : '−大'), L0 + i * w + w / 2 - 2, top + 19, { align: 'center', size: 15 });
  }
  cv.text('左はし', L0 + 33, top + 52, { align: 'center', size: 14, color: 'sub' }); cv.text(st.fixed ? '右はし 20℃' : '右はし 断熱', L0 + 10 * w + 33, top + 52, { align: 'center', size: 14, color: 'sub' });
  // 下：温度のグラフ
  const yl = unstable ? [-60, 160] : [0, 110];
  const v = cv.view({ x0: 0, x1: 0.105, y0: yl[0], y1: yl[1], box: [70, 96, unstable ? 520 : 760, 310] });
  v.axes({ xt: [0, 0.02, 0.04, 0.06, 0.08, 0.1], yt: unstable ? [-50, 0, 50, 100, 150] : [20, 40, 60, 80, 100], xl: 'x（m）', yl: '温度（℃）', xfmt: x => A.num(x, 2), zero: true });
  const X = i => i * 0.01;
  if (!unstable) {
    if (st.ghost) for (const s of SNAP) { const S = SN[st.fixed][s]; v.line(S.map((T, i) => [X(i), T]), { color: 'sub', style: 'dot', width: 1.5 }); const li = { 1: 2.3, 5: 4.4, 15.5: 7.3, 30: 7.3 }[s], lv = S[Math.floor(li)] + (S[Math.ceil(li)] - S[Math.floor(li)]) * (li % 1); v.text(s + '秒', X(li) + 0.002, lv + 5, { size: 14, color: 'sub', bg: true }); }
    if (st.fixed) v.line([[0, 100], [0.1, 20]], { color: 'c', style: 'dash', width: 2 });
    v.line([[0.05, 0], [0.05, 50]], { color: 'grid', width: 1 }); v.line([[0, 50], [0.1, 50]], { color: 'grid', width: 1 });
  } else {
    // r=0.25 で同じ時刻まで進めた形
    let R = Array(11).fill(20); R[0] = 100; const nn = Math.round(st.n * st.r / 0.25); for (let k = 0; k < nn; k++) R = stepRod(R, 0.25, false);
    v.line(R.map((T, i) => [X(i), T]), { color: 'a', style: 'dash', width: 2 });
  }
  v.clip(() => { v.line(st.T.map((T, i) => [X(i), T]), { color: 'b', width: 3 }); });
  st.T.forEach((T, i) => { if (T > yl[0] && T < yl[1]) v.dot(X(i), T, { color: 'b', r: 5, shape: unstable ? 'square' : 'circle' }); });
  if (unstable) {
    const bad = st.T.some(T => T < -1 || T > 101);
    if (bad) cv.text('こわれた：0〜100 ℃の外へ出た', 330, 120, { align: 'center', size: 17, bold: true, color: 'd', bg: true });
    // 右：1−4r の数直線（緑の区間 −1〜1 ならこわれない）
    const n = cv.view({ x0: -1.7, x1: 1.2, y0: -1, y1: 1, box: [620, 150, 240, 140] });
    n.poly([[-1, -0.35], [1, -0.35], [1, 0.35], [-1, 0.35]], { fill: 'c', alpha: 0.18 });
    n.line([[-1.7, 0], [1.15, 0]], { color: 'sub', width: 1.5 });
    for (const t of [-1.5, -1, -0.5, 0, 0.5, 1]) { n.line([[t, -0.12], [t, 0.12]], { color: 'sub', width: 1 }); n.text(A.num(t, t % 1 ? 1 : 0), t, -0.55, { align: 'center', size: 14, color: 'sub' }); }
    const m = 1 - 4 * st.r; n.dot(m, 0, { color: 'd', shape: 'diamond', r: 8 });
    n.text('1−4r ＝ ' + A.num(m, 2), m, 0.65, { align: 'center', size: 15, bold: true, color: 'd' });
    cv.text('ぎざぎざの1歩の倍率', 740, 132, { align: 'center', size: 15 });
    cv.text(Math.abs(m) <= 1 ? '緑の中：こわれない' : '緑の外：こわれる', 740, 318, { align: 'center', size: 16, bold: true, color: Math.abs(m) <= 1 ? 'c' : 'd' });
  }
}

function drawPlate(cv, st) {
  const s = 66, L = 70, T0 = 40;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const val = st.P[i][j], edge = i === 0 || i === 4 || j === 0 || j === 4;
    const x = L + j * s, y = T0 + i * s;
    if (edge) cv.rect(x, y, s - 3, s - 3, { fill: i === 0 && j > 0 && j < 4 ? 'b' : 'a', alpha: i === 0 && j > 0 && j < 4 ? 0.45 : 0.15, color: 'line', width: 1 });
    else cv.rect(x, y, s - 3, s - 3, { fill: 'b', alpha: 0.05 + 0.6 * val / 100, color: 'ink', width: 1.5 });
    cv.text(edge ? A.num(val, 0) : A.num(val, val % 1 ? 2 : 0), x + s / 2 - 1, y + s / 2, { align: 'center', size: edge ? 15 : 16, bold: !edge, color: edge ? 'sub' : 'ink' });
  }
  cv.text(st.k + ' 回め', L + 2.5 * s, T0 + 5 * s + 26, { align: 'center', size: 17, bold: true });
  // 右：まん中の点の変わり方
  const v = cv.view({ x0: 0, x1: 40, y0: 0, y1: 60, box: [480, 40, 370, 320] });
  v.axes({ xt: [10, 20, 30, 40], yt: [10, 20, 30, 40, 50], xl: '回数', yl: '℃' });
  const P0 = [[0, 100, 100, 100, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], tmp = { P: P0, k: 0 };
  const top = [[0, 0]], mid = [[0, 0]], bot = [[0, 0]];
  for (let k = 1; k <= st.k; k++) { narasu(tmp); top.push([k, tmp.P[1][2]]); mid.push([k, tmp.P[2][2]]); bot.push([k, tmp.P[3][2]]); }
  v.line(top, { color: 'b', width: 2.5 }); v.line(mid, { color: 'd', width: 2.5, style: 'dash' }); v.line(bot, { color: 'a', width: 2.5, style: 'dot' });
  if (st.k > 0) { v.dot(st.k, tmp.P[1][2], { color: 'b', r: 5 }); v.dot(st.k, tmp.P[2][2], { color: 'd', r: 5, shape: 'square' }); v.dot(st.k, tmp.P[3][2], { color: 'a', r: 5, shape: 'tri' }); }
  cv.text('上の段のまん中（実線）', 500, 392, { size: 15, color: 'b' }); cv.text('まん中（破線）', 690, 392, { size: 15, color: 'd' }); cv.text('下の段のまん中（点線）', 500, 416, { size: 15, color: 'a' });
}
