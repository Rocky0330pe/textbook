// @id p2-19
// @title 電磁誘導：磁束が変わると電流が流れる
// @vol 物理4
// @from 物理 電-8 ①③④（p4-08:214・297・358・314、例題2）
'use strict';
// 記号は本と同じ：磁束 Φ〔Wb〕、誘導起電力 ℰ＝−N ΔΦ/Δt、レールの間かく l、速さ v、磁場 B、抵抗 R
A.item({
  id: 'p2-19', title: '電磁誘導：磁束が変わると電流が流れる',
  from: '物理 第4巻 電-8 ①「磁石を動かすと、電流が流れる」・③「ファラデーの法則・レンツの法則」・④「磁場を横切る棒」の図から',
  W: 880, H: 440,
  state: { xm: 7, pole: 'N', t: 0, E: 0, phiPrev: null, hist: [], v: 1, vr: 2.0, Br: 0.10, xb: 0.4 },
  scenes: [
    {
      key: 'jishaku', label: '① 磁石とコイル',
      lead: '磁石を近づける → 止める → 遠ざける → 止める。▶ で4コマが続けて動きます。磁石はドラッグでも動かせます。',
      note: '電流が流れるのは、コイルを通る磁束 $\\Phi$ が**変わっている**あいだだけです（$ℰ=-N\\,\\Delta\\Phi/\\Delta t$）。誘導電流は、それが作る磁場（破線の矢印）が、磁束の**変化をじゃまする**向きに流れます（レンツの法則）。近づけるとコイルは磁石を押し返し、遠ざけると引きとめます。',
      miss: '誘導電流の磁場は、いつも磁石の磁場と反対向きではありません。打ち消すのは磁場の**変化**です。遠ざけるときは、磁石の磁場と**同じ向き**の磁場を作って、減るのを補います。また、強い磁石を止めておいても、電圧は 0 です。',
      legend: [['コイルを通る磁束（磁石の磁場）', { color: 'a', width: 2.5 }], ['誘導電流が作る磁場', { color: 'b', style: 'dash', width: 3 }], ['誘導電流の向き', { color: 'd', width: 3 }]],
      controls: [{ seg: 'pole', label: 'コイルに向けた極', options: [['N', 'N 極'], ['S', 'S 極']] }],
      init(st) { st.t = 0; st.hist = []; st.phiPrev = null; },
      step(st, dt) {
        st.t += dt; const c = st.t % 8;
        st.xm = c < 2 ? 7.5 - 5 * c / 2 : c < 4 ? 2.5 : c < 6 ? 2.5 + 5 * (c - 4) / 2 : 7.5;
        const ph = flux(st.xm) * (st.pole === 'N' ? 1 : -1);
        // E：磁束（左向き）の増える速さ。＋なら針は右
        st.E = st.phiPrev == null ? 0 : (ph - st.phiPrev) / dt; st.phiPrev = ph;
        st.hist.push([st.t, ph, st.E]); while (st.hist.length && st.hist[0][0] < st.t - 8) st.hist.shift();
      },
      draw: drawMagnet,
      drag: {
        hit(st, x, y) { const X = 120 + st.xm * 40; return x > X - 70 && x < X + 70 && y > 70 && y < 150 ? 'm' : null; },
        move(st, x) { const now = performance.now(), xm = A.clamp((x - 120) / 40, 2.2, 8); const p0 = flux(st.xm), p1 = flux(xm), d = Math.max(0.016, (now - (st._tm || now)) / 1000); st.E = (p1 - p0) / d * (st.pole === 'N' ? 1 : -1); st._tm = now; st.xm = xm; },
        end(st) { st.E = 0; st._tm = 0; }
      },
      readout: st => { const ph = flux(st.xm); return `コイルを通る磁束（いちばん近いときを1とする）：<b>${A.num(ph, 2)}</b>　　誘導起電力：<b>${Math.abs(st.E) < 0.02 ? '0（磁束が変わっていない）' : (st.E > 0 ? '生まれている（針は右）' : '生まれている（針は左）')}</b>`; }
    },
    {
      key: 'hayasa', label: '② 速さを2倍に',
      lead: '磁石がコイルの中を通りぬけます。速さを変えると、起電力の山はどう変わるでしょう。',
      note: '速さを2倍にすると、同じ磁束の変化が半分の時間で起きるので、起電力の山は2倍の高さで、はばは半分になります。山の**面積**（$ℰ$ を時間で積分したもの $=-N\\times$磁束の変化）は変わりません。電圧計の針は大きくふれますが、流れる電気の量の合計は、速さによらないのです。',
      legend: [['いまの速さ', { color: 'a', width: 3 }], ['速さ 1（くらべる）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'v', label: '磁石の速さ（はじめを1）', min: 0.5, max: 3, step: 0.05, d: 2 }],
      init(st) { st.t = -3.2; },
      step(st, dt) { st.t += dt * 0.8; if (st.t > 3.2) st.t = -3.2; },
      draw: drawSpeed,
      readout: st => `起電力の山の高さ：速さ 1 の <b>${A.num(st.v, 2)} 倍</b>、はば：<b>${A.num(1 / st.v, 2)} 倍</b>、山の面積：<b>1 倍（変わらない）</b>`
    },
    {
      key: 'rail', label: '③ レールの上の棒',
      lead: '向こう向きの磁場（⊗）の中で、レールの上の棒を右へ動かします（例題：$l=0.50$ m、$R=1.0\\,\\Omega$）。▶ で棒が動きます。',
      note: '見方1：棒の中の電荷は、棒といっしょに動くので、ローレンツ力 $q\\vec v\\times\\vec B$ を棒にそって上向きに受けます。1 C を長さ $l$ 運ぶ仕事が $vBl$。見方2：囲む面積が1秒に $lv$ ずつ増えるので、磁束は1秒に $Blv$ ずつ増えます。**2つの見方で同じ** $ℰ=vBl$ です。電流は、増える向こう向きの磁束をじゃまする向き（反時計回り）に流れ、棒は磁場から左向きの力 $IBl$ を受けます。動かし続ける手の仕事が、抵抗の熱になります。',
      legend: [['増えた面積（磁束が増える）', { color: 'c', width: 8 }], ['誘導電流（反時計回り）', { color: 'd', width: 3 }], ['電荷が受ける力 $q\\vec v\\times\\vec B$', { color: 'b', style: 'dot', width: 3 }], ['棒が受ける力 $IBl$（左）', { color: 'a', style: 'dash', width: 3 }]],
      controls: [
        { range: 'vr', label: '速さ $v$〔m/s〕', min: 0.5, max: 4, step: 0.1, d: 1 },
        { range: 'Br', label: '磁場 $B$〔T〕', min: 0.02, max: 0.2, step: 0.01, d: 2 }
      ],
      autoplay: true,
      init(st) { st.xb = 0.4; },
      step(st, dt) { st.xb += st.vr * dt * 0.25; if (st.xb > 2.0) st.xb = 0.4; },
      draw: drawRail,
      readout: st => { const E = st.vr * st.Br * 0.5, I = E / 1.0, F = I * st.Br * 0.5; return `$ℰ=vBl$ ＝ ${A.num(st.vr, 1)} × ${A.num(st.Br, 2)} × 0.50 ＝ <b>${A.num(E, 3)} V</b>、$I$ ＝ <b>${A.num(I, 3)} A</b>、力 $IBl$ ＝ ${A.num(F * 1000, 2)}×10⁻³ N、仕事率 $Fv$ ＝ ${A.num(F * st.vr, 4)} W ＝ $I^2R$`; }
    }
  ]
});

// 磁石の中心がコイルから xm（磁石のはしは xm−1.5）のときの磁束（いちばん近い所で1）
function flux(xm) { const d = Math.max(0, xm - 2.5); return 1 / Math.pow(1 + (d / 1.6) ** 2, 1.5); }
function coil(cv, X, Y, R, o) {   // 横から見た輪：手前の半分を濃く（ok は電流の向き：＋で手前を下向き）
  const pts = a => { const r = []; for (let k = 0; k <= 40; k++) { const t = a[0] + (a[1] - a[0]) * k / 40; r.push([X - 0.35 * R * Math.sin(t), Y - R * Math.cos(t)]); } return r; };
  cv.line(pts([0, Math.PI]), { color: 'sub', width: 3, alpha: 0.5 });   // おくの半分
  for (let i = -2; i <= 2; i++) cv.line(pts([Math.PI, 2 * Math.PI]).map(([x, y]) => [x + i * 6, y]), { color: 'ink', width: 3 });
  if (o && o.cur) { const s = o.cur > 0 ? 1 : -1; cv.arrow(X + 0.35 * R + 10, Y - 20 * s, X + 0.35 * R + 10, Y + 20 * s, { color: 'd', width: 3.5, head: 14 }); }
}
function magnet(cv, X, Y, pole, w, h, dir) {   // dir：N（または pole）が向く向き −1＝左
  const near = pole, far = pole === 'N' ? 'S' : 'N';
  const xa = X - w / 2, xb = X + w / 2;
  const nearX = dir < 0 ? xa : xb - w / 2, farX = dir < 0 ? X : xa;
  cv.rect(nearX, Y - h / 2, w / 2, h, { fill: near === 'N' ? 'b' : 'a', alpha: 0.85, color: 'ink', width: 1.5 });
  cv.rect(farX, Y - h / 2, w / 2, h, { fill: far === 'N' ? 'b' : 'a', alpha: 0.35, color: 'ink', width: 1.5 });
  cv.text(near, nearX + w / 4, Y, { size: 20, bold: true, align: 'center', color: near === 'N' ? 'bg' : 'bg' });
  cv.text(far, farX + w / 4, Y, { size: 20, bold: true, align: 'center' });
}
function drawMagnet(cv, st) {
  const X0 = 120, Y0 = 110, sg = st.pole === 'N' ? 1 : -1, ph = flux(st.xm);
  // コイルを通る磁束の矢印（N 極なら左向き）
  const n = Math.round(ph * 5);
  for (let i = 0; i < n; i++) { const y = Y0 + (i - (n - 1) / 2) * 13; const x1 = X0 + 60, x2 = X0 - 60; cv.arrow(sg > 0 ? x1 : x2, y, sg > 0 ? x2 : x1, y, { color: 'a', width: 2.5, head: 11 }); }
  coil(cv, X0, Y0, 55, { cur: Math.abs(st.E) > 0.02 ? sg * Math.sign(st.E) * sg : 0 });
  // 誘導電流の磁場（変化をじゃまする）：E＞0 のとき右向き
  if (Math.abs(st.E) > 0.02) { const L = A.clamp(Math.abs(st.E) * 60, 30, 110), s = Math.sign(st.E); cv.arrow(X0 - s * L / 2, Y0 + 72, X0 + s * L / 2, Y0 + 72, { color: 'b', width: 3.5, style: 'dash', head: 14 }); cv.text('誘導電流の磁場', X0, Y0 + 92, { size: 14, color: 'b', align: 'center' }); }
  magnet(cv, X0 + st.xm * 40, Y0, st.pole, 120, 40, -1);
  cv.text('ドラッグで動かせる', X0 + st.xm * 40, Y0 - 34, { size: 14, color: 'sub', align: 'center' });
  // 検流計
  const gx = X0, gy = 330;
  cv.line([[X0 - 20, Y0 + 55], [X0 - 20, gy - 32], [gx - 30, gy - 32]], { color: 'sub', width: 2 });
  cv.line([[X0 + 20, Y0 + 55], [X0 + 20, gy - 40], [gx + 30, gy - 32]], { color: 'sub', width: 2 });
  cv.circle(gx, gy, 46, { color: 'ink', width: 2, fill: 'panel', alpha: 1 });
  for (let k = -4; k <= 4; k++) { const a = k * 0.25; cv.line([[gx + 36 * Math.sin(a), gy + 10 - 36 * Math.cos(a)], [gx + 42 * Math.sin(a), gy + 10 - 42 * Math.cos(a)]], { color: 'sub', width: 1.5 }); }
  const na = A.clamp(st.E * 0.9, -1.1, 1.1);
  cv.line([[gx, gy + 10], [gx + 40 * Math.sin(na), gy + 10 - 40 * Math.cos(na)]], { color: 'b', width: 3 });
  cv.text('G', gx, gy + 28, { size: 16, bold: true, align: 'center' });
  cv.text('検流計', gx + 54, gy + 30, { size: 14, color: 'sub' });
  // 右：Φ と ℰ のグラフ
  const t1 = Math.max(8, st.t), t0 = t1 - 8;
  const g1 = cv.view({ x0: t0, x1: t1, y0: -1.2, y1: 1.2, box: [500, 30, 360, 150] });
  const g2 = cv.view({ x0: t0, x1: t1, y0: -3.6, y1: 3.6, box: [500, 240, 360, 170] });
  g1.axes({ yt: [-1, 1], grid: true, ay: t0 }); g2.axes({ yt: [-2, 2], grid: true, ay: t0, ylabels: false });
  cv.text('磁束 Φ', 506, 22, { size: 15, color: 'a', bold: true });
  cv.text('起電力 ℰ（針のふれ）', 506, 232, { size: 15, color: 'd', bold: true });
  cv.text('時間 →', 860, 425, { size: 14, color: 'sub', align: 'right' });
  if (st.hist.length > 1) { g1.clip(() => g1.line(st.hist.map(h => [h[0], h[1]]), { color: 'a', width: 2.5 })); g2.clip(() => g2.line(st.hist.map(h => [h[0], A.clamp(h[2], -3.5, 3.5)]), { color: 'd', width: 2.5 })); }
  // 4コマの名前
  if (st.hist.length) { const c = st.t % 8; const lab = c < 2 ? '近づける' : c < 4 ? '止める' : c < 6 ? '遠ざける' : '止める'; cv.text(lab, X0 + 230, 30, { size: 18, bold: true, align: 'center', bg: true }); }
}
function drawSpeed(cv, st) {
  const v = st.v, x = -v * st.t * 1.0;   // 磁石は右から左へ
  const Phi = (t, s) => 1 / Math.pow(1 + (s * t / 0.9) ** 2, 1.5);
  const Emf = (t, s) => { const h = 1e-4; return -(Phi(t + h, s) - Phi(t - h, s)) / (2 * h); };
  // 左：コイルと磁石
  const X0 = 210, Y0 = 210;
  coil(cv, X0, Y0, 70, { cur: Math.abs(Emf(st.t, v)) > 0.05 ? -Math.sign(Emf(st.t, v)) : 0 });
  const mx = X0 + x * 60;
  cv.g.save(); cv.g.beginPath(); cv.g.rect(10, 60, 400, 300); cv.g.clip();
  magnet(cv, mx, Y0, 'N', 110, 36, -1);
  cv.g.restore();
  cv.arrow(X0 + 130, Y0 - 100, X0 + 50, Y0 - 100, { color: 'ink', width: 2.5 });
  cv.text('磁石が通りぬける', X0 + 140, Y0 - 100, { size: 15 });
  // 右：グラフ
  const g1 = cv.view({ x0: -3.2, x1: 3.2, y0: 0, y1: 1.25, box: [450, 30, 400, 110] });
  const g2 = cv.view({ x0: -3.2, x1: 3.2, y0: -3.4, y1: 3.4, box: [450, 190, 400, 210] });
  g1.axes({ yt: [1], grid: false }); g2.axes({ yt: [0], grid: false, ylabels: false });
  cv.text('磁束 Φ', 456, 22, { size: 15, color: 'sub', bold: true });
  cv.text('起電力 ℰ', 456, 182, { size: 15, color: 'sub', bold: true });
  cv.text('時刻 t（中央を通る時を0）', 850, 425, { size: 14, color: 'sub', align: 'right' });
  g1.plot(t => Phi(t, 1), { color: 'b', style: 'dash', width: 2 }); g2.plot(t => Emf(t, 1), { color: 'b', style: 'dash', width: 2 });
  g2.area(t => Emf(t, v), -3.2, 0, { fill: 'a', alpha: 0.15 });
  g1.plot(t => Phi(t, v), { color: 'a', width: 3 }); g2.plot(t => Emf(t, v), { color: 'a', width: 3, n: 600 });
  g1.line([[st.t, 0], [st.t, 1.25]], { color: 'sub', style: 'dot', width: 1.5 }); g2.line([[st.t, -3.4], [st.t, 3.4]], { color: 'sub', style: 'dot', width: 1.5 });
  g1.dot(st.t, Phi(st.t, v), { color: 'a', r: 6 }); g2.dot(st.t, Emf(st.t, v), { color: 'a', r: 6 });
  cv.text('ぬった山の面積は、速さによらない', g2.X(-3.1), g2.Y(-2.9), { size: 14, color: 'a' });
}
function drawRail(cv, st) {
  const v = cv.view({ x0: -0.35, x1: 2.45, y0: -0.12, y1: 0.75, box: [20, 20, 840, 390], equal: true });
  for (let x = -0.2; x < 2.45; x += 0.2) for (let y = -0.05; y < 0.75; y += 0.2) { const X = v.X(x), Y = v.Y(y); cv.circle(X, Y, 7, { color: 'sub', width: 1.2 }); cv.line([[X - 4.5, Y - 4.5], [X + 4.5, Y + 4.5]], { color: 'sub', width: 1.2 }); cv.line([[X + 4.5, Y - 4.5], [X - 4.5, Y + 4.5]], { color: 'sub', width: 1.2 }); }
  const xb = st.xb, l = 0.5;
  v.poly([[0, 0], [xb, 0], [xb, l], [0, l]], { fill: 'c', alpha: 0.18 });
  v.line([[0, 0], [2.4, 0]], { color: 'ink', width: 4 }); v.line([[0, l], [2.4, l]], { color: 'ink', width: 4 });
  // 抵抗
  const zz = []; for (let k = 0; k <= 8; k++) zz.push([k % 2 ? -0.04 : 0.04, 0.1 + 0.3 * k / 8]); zz.unshift([0, 0]); zz.push([0, l]);
  v.line(zz, { color: 'ink', width: 2.5 });
  v.text('R = 1.0 Ω', -0.08, 0.25, { size: 15, align: 'right' });
  // 棒
  v.line([[xb, -0.05], [xb, l + 0.05]], { color: 'e', width: 10 });
  v.arrow(xb + 0.04, l + 0.1, xb + 0.04 + 0.08 * st.vr, l + 0.1, { color: 'ink', width: 3 });
  v.text('v', xb + 0.06 + 0.08 * st.vr, l + 0.12, { size: 17, bold: true, italic: true });
  // 見方1：電荷が受ける力（棒にそって上）
  for (const y of [0.12, 0.25, 0.38]) { v.dot(xb, y, { color: 'b', r: 6 }); v.arrow(xb + 0.035, y - 0.03, xb + 0.035, y + 0.09, { color: 'b', width: 3, style: 'dot', head: 12 }); }
  // 電流（反時計回り）：棒の中は上、上のレールは左、抵抗は下、下のレールは右
  const I = st.vr * st.Br * 0.5;
  if (I > 0) {
    v.arrow(xb - 0.05, 0.36, xb - 0.05, 0.46, { color: 'd', width: 3.5, head: 13 });
    v.arrow(xb * 0.55 + 0.08, l + 0.035, xb * 0.55 - 0.08, l + 0.035, { color: 'd', width: 3.5, head: 13 });
    v.arrow(0.06, 0.32, 0.06, 0.2, { color: 'd', width: 3.5, head: 13 });
    v.arrow(xb * 0.55 - 0.08, -0.035, xb * 0.55 + 0.08, -0.035, { color: 'd', width: 3.5, head: 13 });
    v.text('I', xb * 0.55, l + 0.1, { size: 17, bold: true, italic: true, color: 'd', align: 'center' });
  }
  // 棒が受ける力 IBl（左）
  const F = I * st.Br * l, L = A.clamp(F * 40, 0.08, 0.4);
  v.arrow(xb - 0.02, 0.25, xb - 0.02 - L, 0.25, { color: 'a', width: 3.5, style: 'dash', head: 13 });
  v.text('IBl', xb - 0.04 - L, 0.29, { size: 15, color: 'a', align: 'right', bg: true });
  cv.text('l = 0.50 m', v.X(2.3), v.Y(l / 2), { size: 15, align: 'center', bg: true });
  cv.text('B（向こう向き ⊗）', 30, 400, { size: 15, color: 'sub', bg: true });
  cv.text(`面積は1秒に l × v ＝ ${A.num(0.5 * st.vr, 2)} m² ずつ増える`, v.X(xb / 2), v.Y(0.12), { size: 14, align: 'center', color: 'c', bg: true });
}
