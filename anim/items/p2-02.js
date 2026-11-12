// @id p2-02
// @title 減衰：足りない・臨界・強すぎる
// @vol 物理3
// @from 物理 波-1 ⑦（p3-01 ゆれの記録）・波-4 ⑤（p3-04 2次おくれ）・電-9（p4-09 RLC の減衰）／数学 6-7・6-12
'use strict';
// どの場面も m x'' + c x' + k x = 0 の答えを、減衰比 ζ で場合分けせずにつないでかく（ζ=1 の前後で形がなめらかにつながる）。
// ① 記録：x1=10 mm、山が1回ごとに 0.8 倍（δ=ln1.25≈0.22、ζ≈0.035。例題10）。ωn=2π rad/s（1秒に1回）
// ② RLC：10 mH・1 μF・はじめ 10 V。臨界抵抗 Rc=2√(L/C)=200 Ω。20・200・400 Ω が本の図
// ③ 2次おくれのステップ応答：ζ=0.3・0.5・0.7・1（行き過ぎ 37 %・16 %・4.6 %・0）
A.item({
  id: 'p2-02', title: '減衰：足りない・臨界・強すぎる',
  from: '物理 第3巻 波-1 ⑦「ゆれの記録」・波-4 ⑤「2次おくれ」、第4巻 電-9 ⑦「RLC 回路の減衰」の図から（数学 6-7・6-12 でも使う）',
  W: 880, H: 420,
  state: { t: 0, z: 0.0355, R: 20, z3: 0.5 },
  scenes: [
    {
      key: 'kiroku', label: '① ゆれの記録',
      lead: 'ばね・おもり・ダンパーを 10 mm 引いて放します。山の高さが1回ごとに何倍になるかを見ましょう。',
      note: 'となりの山の比はいつも同じです。その比の自然対数が対数減衰率 $\\delta=\\ln(x_1/x_2)$ で、減衰比は $\\zeta=\\delta/\\sqrt{4\\pi^2+\\delta^2}\\approx\\delta/(2\\pi)$ です。$\\zeta$ を1まで大きくすると、ゆれずにもどるようになります。',
      miss: '対数減衰率の対数は自然対数です。山の比が 1.25 なら $\\delta=\\ln1.25\\approx0.223$。$\\log_{10}1.25\\approx0.097$ ではありません。',
      legend: [['ずれ $x$', { color: 'a' }], ['つつみ $\\pm x_1e^{-\\zeta\\omega_{\\mathrm n}t}$', { color: 'sub', style: 'dash' }], ['山', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'z', label: '減衰比 $\\zeta$', min: 0, max: 1.5, step: 0.0005, fmt: v => A.num(v, 3) }],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 6.3) st.t = 0; },
      draw(cv, st) { kiroku(cv, st); },
      readout: st => {
        if (st.z >= 1) return `$\\zeta$ ＝ ${A.num(st.z, 3)}：ゆれずにもどる（山がない）`;
        const d = 2 * Math.PI * st.z / Math.sqrt(1 - st.z * st.z);
        return `となりの山の比 $x_1/x_2$ ＝ ${A.num(Math.exp(d), 3)}　　$\\delta=\\ln(x_1/x_2)$ ＝ ${A.num(d, 3)}　　$\\zeta=\\delta/\\sqrt{4\\pi^2+\\delta^2}$ ＝ <b>${A.num(st.z, 3)}</b>`;
      }
    },
    {
      key: 'rlc', label: '② RLC 回路',
      lead: '10 V にためた 1 μF のコンデンサーを、10 mH のコイルと抵抗 $R$ につなぎます。$R$ を 0 から 600 Ω まで動かしましょう。',
      note: '減衰比は $\\zeta=R/R_{\\mathrm c}$、臨界抵抗は $R_{\\mathrm c}=2\\sqrt{L/C}=200$ Ω です。$R<200$ Ω ではゆれながら、200 Ω ではゆれずにいちばん早く、それより大きいとゆっくり 0 に近づきます。3つは別のものではなく、$R$ を動かすとなめらかにつながっています。',
      legend: [['コンデンサーの電圧 $v_C$（いまの $R$）', { color: 'a' }], ['20 Ω（$\\zeta=0.1$）', { color: 'sub', style: 'solid' }], ['200 Ω（$\\zeta=1$）', { color: 'sub', style: 'dash' }], ['400 Ω（$\\zeta=2$）', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'R', label: '抵抗 $R$〔Ω〕', min: 0, max: 600, step: 5, d: 0 }],
      state: { t: 0 },
      autoplay: true,
      step(st, dt) { st.t += dt * 0.5; if (st.t > 2.1) st.t = 0; },
      draw(cv, st) { rlc(cv, st); },
      readout: st => { const z = st.R / 200; return `$\\zeta=R/R_{\\mathrm c}$ ＝ ${A.num(st.R, 0)} ÷ 200 ＝ <b>${A.num(z, 2)}</b>　　${z < 1 ? 'ゆれながら減る（足りない減衰）' : z === 1 ? 'ゆれずにいちばん早く（臨界減衰）' : 'ゆれずにゆっくり（強すぎる減衰）'}`; }
    },
    {
      key: 'step', label: '③ ステップ応答',
      lead: '2次おくれに、時刻 0 で高さ1の入力を入れたときの応答です。$\\zeta$ を変えて、行き過ぎを見ましょう。',
      note: '行き過ぎ量は $e^{-\\pi\\zeta/\\sqrt{1-\\zeta^2}}$ で、$\\zeta$ だけで決まります（0.3 で 37 %、0.5 で 16 %、0.7 で 4.6 %）。$\\zeta\\geqq1$ では行き過ぎません。横の軸は $\\omega_{\\mathrm n}t$ なので、$\\omega_{\\mathrm n}$ を2倍にすると、同じ形が半分の時間で起きます。',
      legend: [['いまの $\\zeta$', { color: 'a' }], ['$\\zeta=0.3$', { color: 'sub', style: 'dot' }], ['$\\zeta=0.7$', { color: 'sub', style: 'dash' }], ['$\\zeta=1$', { color: 'sub', style: 'solid' }], ['いちばん高い所', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'z3', label: '減衰比 $\\zeta$', min: 0.1, max: 2, step: 0.01 }],
      state: { t: 0 },
      autoplay: true,
      step(st, dt) { st.t += dt * 2; if (st.t > 10.3) st.t = 0; },
      draw(cv, st) { step2(cv, st); },
      readout: st => { const z = st.z3; if (z >= 1) return `$\\zeta$ ＝ ${A.num(z, 2)}：行き過ぎなし`; const os = Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)); return `行き過ぎ量 $e^{-\\pi\\zeta/\\sqrt{1-\\zeta^2}}$ ＝ <b>${A.num(os * 100, 1)} %</b>　　$\\omega_{\\mathrm n}t_{\\text{ピーク}}=\\pi/\\sqrt{1-\\zeta^2}$ ＝ ${A.num(Math.PI / Math.sqrt(1 - z * z), 2)}　　$\\omega_{\\mathrm n}t_{\\text{整定}}\\approx4/\\zeta$ ＝ ${A.num(4 / z, 1)}`; }
    }
  ]
});

// はじめ x=1・速さ 0 で放したときの答え（ωn=1 の時刻 u=ωn t で）。ζ のどの値でもつながる
function free(z, u) {
  if (Math.abs(z - 1) < 1e-4) return Math.exp(-u) * (1 + u);
  if (z < 1) { const wd = Math.sqrt(1 - z * z); return Math.exp(-z * u) * (Math.cos(wd * u) + z / wd * Math.sin(wd * u)); }
  const q = Math.sqrt(z * z - 1), s1 = -(z - q), s2 = -(z + q);
  return (s2 * Math.exp(s1 * u) - s1 * Math.exp(s2 * u)) / (s2 - s1);
}

function spring(cv, x1, x2, y, o) {
  const n = 10, pts = [[x1, y], [x1 + 6, y]];
  for (let i = 1; i < n; i++) pts.push([x1 + 6 + (x2 - x1 - 12) * i / n, y + (i % 2 ? -8 : 8)]);
  pts.push([x2 - 6, y], [x2, y]);
  cv.line(pts, Object.assign({ color: 'sub', width: 2 }, o || {}));
}

function kiroku(cv, st) {
  const wn = 2 * Math.PI, X = 10, z = st.z;
  const x = u => X * free(z, wn * u);
  // 上：ばね・おもり・ダンパー（右を正）
  const x0p = 300, sc = 6, wx = 70, xm = x0p + x(st.t) * sc;
  cv.rect(wx - 12, 24, 12, 84, { fill: 'sub', alpha: 0.4 });
  cv.line([[wx - 12, 108], [800, 108]], { color: 'sub', width: 1.5 });
  spring(cv, wx, xm - 30, 50);
  // ダンパー（筒とピストン）
  const dm = (wx + xm - 30) / 2;
  cv.line([[wx, 84], [dm - 20, 84]], { color: 'sub', width: 2 });
  cv.line([[dm - 20, 74], [dm + 30, 74]], { color: 'sub', width: 2 }); cv.line([[dm - 20, 94], [dm + 30, 94]], { color: 'sub', width: 2 }); cv.line([[dm - 20, 74], [dm - 20, 94]], { color: 'sub', width: 2 });
  cv.line([[dm + 8, 77], [dm + 8, 91]], { color: 'ink', width: 3 }); cv.line([[dm + 8, 84], [xm - 30, 84]], { color: 'sub', width: 2 });
  cv.rect(xm - 30, 40, 60, 66, { fill: 'a', alpha: 0.3, color: 'a', width: 2 });
  cv.line([[x0p, 30], [x0p, 116]], { color: 'sub', style: 'dash', width: 1 });
  cv.text('x = 0', x0p, 126, { align: 'center', size: 14, color: 'sub', math: true, italic: true });
  cv.text('ばね k', 120, 30, { size: 14, color: 'sub' });
  cv.text('ダンパー c', 120, 112, { size: 14, color: 'sub', base: 'top' });
  cv.text('はじめ 10 mm 右へ引いて放す', 470, 60, { size: 15 });
  // 下：記録
  const g = cv.view({ x0: 0, x1: 6.3, y0: -12.5, y1: 13.5, box: [60, 150, 800, 255] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-10, 10], xl: 't〔s〕', yl: 'x〔mm〕' });
  if (z < 1) { g.plot(u => X * Math.exp(-z * wn * u), { color: 'sub', style: 'dash', width: 1.5 }); g.plot(u => -X * Math.exp(-z * wn * u), { color: 'sub', style: 'dash', width: 1.5 }); }
  g.plot(x, { x0: 0, x1: st.t, color: 'a', width: 2.5, n: 900 });
  // 山（速さが0になる所：u=kπ/ωd の偶数番）
  if (z < 1) {
    const wd = wn * Math.sqrt(1 - z * z);
    for (let k = 0; k <= 6; k++) {
      const tk = 2 * k * Math.PI / wd; if (tk > Math.min(st.t, 6.3)) break;
      const yk = x(tk); g.dot(tk, yk, { color: 'b', r: 5 });
      if (k < 4) g.text(k === 0 ? 'x₁＝10' : k === 1 ? 'x₂＝' + A.num(yk, 1) : A.num(yk, 1), tk + 0.06, yk + 1.4, { size: 14, color: 'b', bg: true });
    }
  }
  g.dot(st.t, x(st.t), { color: 'a', r: 4 });
}

function rlc(cv, st) {
  const z = st.R / 200, w = 10;           // ωn = 1/√(LC) = 10 /ms
  const v = t => 10 * free(z, w * t);
  const i = t => { const h = 1e-4; return -1e-3 * (v(t + h) - v(t - h)) / (2 * h); };   // i = −C dv/dt〔A〕（C=1 μF、t は ms）
  // 左：回路（コンデンサーの電荷を板の上の印の数で）
  const L0 = 80, T0 = 70, Wc = 160, Hc = 200;
  cv.line([[L0, T0], [L0 + Wc, T0], [L0 + Wc, T0 + Hc], [L0, T0 + Hc], [L0, T0]], { color: 'ink', width: 2 });
  // C（左の辺）
  cv.rect(L0 - 20, T0 + 88, 40, 24, { fill: 'bg', alpha: 1 });
  cv.line([[L0 - 18, T0 + 92], [L0 + 18, T0 + 92]], { color: 'ink', width: 3 }); cv.line([[L0 - 18, T0 + 108], [L0 + 18, T0 + 108]], { color: 'ink', width: 3 });
  const q = v(st.t) / 10, nq = Math.round(Math.abs(q) * 5);
  for (let k = 0; k < nq; k++) { const xx = L0 - 14 + k * 7; cv.text(q > 0 ? '+' : '−', xx, T0 + 84, { size: 13, color: 'b', align: 'center' }); cv.text(q > 0 ? '−' : '+', xx, T0 + 118, { size: 13, color: 'a', align: 'center' }); }
  cv.text('C', L0 + 26, T0 + 92, { math: true, italic: true, size: 17 });
  cv.text('1 μF', L0 + 26, T0 + 114, { size: 14, color: 'sub' });
  // R（上の辺）
  cv.rect(L0 + 60, T0 - 10, 60, 20, { fill: 'bg', alpha: 1, color: 'ink', width: 2 });
  cv.text('R ＝ ' + A.num(st.R, 0) + ' Ω', L0 + 90, T0 - 24, { align: 'center', size: 15 });
  // L（右の辺）
  cv.rect(L0 + Wc - 12, T0 + 60, 24, 80, { fill: 'bg', alpha: 1 });
  for (let k = 0; k < 4; k++) cv.circle(L0 + Wc, T0 + 70 + k * 20, 10, { color: 'ink', width: 2, a0: -Math.PI / 2, a1: Math.PI / 2 });
  cv.text('L', L0 + Wc + 18, T0 + 100, { math: true, italic: true, size: 17 });
  cv.text('10 mH', L0 + Wc + 18, T0 + 122, { size: 14, color: 'sub' });
  // 電流の矢印（大きさに合わせる）
  const I = i(st.t), al = A.clamp(I / 0.06, -1, 1) * 60;
  if (Math.abs(al) > 3) cv.arrow(L0 + 90 - al / 2, T0 + Hc + 22, L0 + 90 + al / 2, T0 + Hc + 22, { color: 'c', width: 3 });
  cv.text('電流 ' + A.num(I * 1000, 0) + ' mA', L0 + 90, T0 + Hc + 44, { align: 'center', size: 14, color: 'c' });
  // 右：v_C のグラフ（t は ms）
  const g = cv.view({ x0: 0, x1: 2.1, y0: -8.5, y1: 11.5, box: [320, 20, 520, 360] });
  g.axes({ xt: [0.5, 1, 1.5, 2], yt: [-5, 5, 10], xl: 't〔ms〕', yl: 'vC〔V〕' });
  g.plot(t => 10 * free(0.1, w * t), { color: 'sub', width: 1, alpha: 0.6 });
  g.plot(t => 10 * free(1, w * t), { color: 'sub', style: 'dash', width: 1.5 });
  g.plot(t => 10 * free(2, w * t), { color: 'sub', style: 'dot', width: 2 });
  g.plot(v, { color: 'a', width: 3, n: 700 });
  g.dot(st.t, v(st.t), { color: 'a', r: 6 });
}

function step2(cv, st) {
  const z = st.z3, y = (zz, u) => 1 - free(zz, u);
  const g = cv.view({ x0: 0, x1: 10.3, y0: 0, y1: 1.85, box: [70, 20, 760, 360] });
  g.axes({ xt: [2, 4, 6, 8, 10], yt: [0.5, 1, 1.16, 1.37], xl: 'ωn t', yl: 'y', yfmt: v => A.num(v, v === 1 || v === 0.5 ? 1 : 2) });
  g.line([[0, 1], [10.3, 1]], { color: 'sub', style: 'dash', width: 1 });
  g.plot(u => y(0.3, u), { color: 'sub', style: 'dot', width: 1.8 });
  g.plot(u => y(0.7, u), { color: 'sub', style: 'dash', width: 1.5 });
  g.plot(u => y(1, u), { color: 'sub', width: 1.2 });
  // 整定の帯 ±2 %
  g.poly([[0, 0.98], [10.3, 0.98], [10.3, 1.02], [0, 1.02]], { fill: 'c', alpha: 0.15 });
  g.text('±2 % の帯', 10.2, 0.93, { align: 'right', size: 14, color: 'c' });
  g.plot(u => y(z, u), { color: 'a', width: 3 });
  g.dot(Math.min(st.t, 10.3), y(z, Math.min(st.t, 10.3)), { color: 'a', r: 6 });
  if (z < 1) {
    const tp = Math.PI / Math.sqrt(1 - z * z), yp = y(z, tp);
    g.dot(tp, yp, { color: 'b', shape: 'diamond', r: 7 });
    g.text('行き過ぎ ' + A.num((yp - 1) * 100, 1) + ' %', tp + 0.2, yp + 0.08, { size: 15, color: 'b', bg: true });
    const ts = 4 / z;
    if (ts < 10.3) { g.line([[ts, 0], [ts, 1]], { color: 'c', style: 'dashdot', width: 1.5 }); g.text('整定の目安 4/ζ', ts + 0.1, 0.2, { size: 14, color: 'c', bg: true }); }
  }
}
