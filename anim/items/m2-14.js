// @id m2-14
// @title 1ラジアン：半径のひもを円にまきつける
// @vol 数学4
// @from 数学 4-2 ③⑤（ch4-02:343・261・486）／4-8、5-15、力-6、波 でも使う
'use strict';
const TAU14 = Math.PI * 2, DEG = 180 / Math.PI;
A.item({
  id: 'm2-14', title: '1ラジアン：半径のひもを円にまきつける',
  from: '数学 第4巻 4-2 ③「弧度法とラジアン」の図から（4-8、5-15、物理 力-6・波動 でも使う）',
  W: 880, H: 420,
  state: { p: 0, r: 5, q: 0, th: 90, deg: 30 },
  scenes: [
    {
      key: 'himo', label: '① 1 rad をつくる',
      lead: '半径と同じ長さのひもを、円のふちにそわせて曲げます。ひもの両はしと中心がつくる角が 1 rad です。▶ を押してみましょう。',
      note: '1 rad は、**弧の長さが半径と同じになる角**です。半径を変えても、ひもの長さも同じ割合で変わるので、角は変わりません（約 57.3°）。',
      miss: '1 rad は 1° くらいの小さい角ではありません。約 57.3° です。図の点線が 1° の角で、1 rad はその約57倍です。',
      legend: [['半径', { color: 'a' }], ['半径と同じ長さのひも', { color: 'b', style: 'long' }], ['1° の角', { color: 'b', style: 'dot' }]],
      controls: [
        { range: 'p', label: '進みぐあい', min: 0, max: 3, step: 0.01, fmt: v => v < 1 ? '立てる' : v < 2 ? 'まく' : 'できた' },
        { range: 'r', label: '半径', min: 2.5, max: 6, step: 0.1, d: 1, fmt: v => A.num(v, 1) + ' cm' }
      ],
      init(st) { st.p = 0; },
      step(st, dt) { st.p = Math.min(3, st.p + dt * 0.6); if (st.p >= 3) return false; },
      draw(cv, st) { drawHimo(cv, st); },
      readout: st => { const u = wrapU(st.p); return `まきつけた長さ ＝ ${A.num(u * st.r, 2)} cm　　角 ＝ 弧の長さ ÷ 半径 ＝ ${A.num(u * st.r, 2)} ÷ ${A.num(st.r, 1)} ＝ <b>${A.num(u, 2)} rad</b>（${A.num(u * DEG, 1)}°）`; }
    },
    {
      key: 'shuu', label: '② 何本で1周？',
      lead: '半径と同じ長さのひもを、次々に円にまきつけていきます。1周するのに何本いるでしょう。',
      note: '円周は $2\\pi r$ なので、半径の $2\\pi\\approx6.28$ 倍です。ひもは6本と、あと0.28本分で1周します。だから **1周は $2\\pi$ rad**、半周（180°）は $\\pi$ rad です。',
      legend: [['奇数番めのひも', { color: 'a' }], ['偶数番めのひも', { color: 'b', style: 'dash' }], ['のこりの 0.28 本分', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'q', label: 'まいた本数', min: 0, max: TAU14, step: 0.01, fmt: v => A.num(v, 2) + ' 本' }],
      init(st) { st.q = 0; st.r = 5; },
      step(st, dt) { st.q = Math.min(TAU14, st.q + dt * 0.9); if (st.q >= TAU14) return false; },
      draw(cv, st) { drawShuu(cv, st); },
      readout: st => `まいた本数 ${A.num(st.q, 2)} 本 → 角 ${A.num(st.q, 2)} rad ＝ ${A.num(st.q * DEG, 1)}°` + (st.q > TAU14 - 0.005 ? '　　<b>1周 ＝ 2π ≈ 6.28 rad</b>' : '')
    },
    {
      key: 'mina', label: '③ 半径がちがっても',
      lead: '回転する遊具で、ミナさんは中心から 1 m、ソラさんは 2 m の所に乗っています。同じ角だけ回ると、「弧の長さ ÷ 半径」はどうなるでしょう。',
      note: '進んだ道のり（弧の長さ）はソラさんがミナさんの2倍ですが、「弧の長さ ÷ 半径」は2人とも同じです。この数を角の大きさとして使うのがラジアンです。90° なら $\\dfrac{\\pi}{2}\\approx1.57$ rad。',
      legend: [['ミナさん（半径 1 m）', { color: 'a' }], ['ソラさん（半径 2 m）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'th', label: '回った角', min: 0, max: 360, step: 1, fmt: v => v + '°' }, { button: '90°', act: st => { st.th = 90; } }],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = Math.min(360, st.th + dt * 40); if (st.th >= 360) return false; },
      draw(cv, st) { drawMina(cv, st); },
      readout: st => { const t = st.th / DEG; return `ミナ：${A.num(t, 2)} ÷ 1 ＝ <b>${A.num(t, 2)}</b>　　ソラ：${A.num(2 * t, 2)} ÷ 2 ＝ <b>${A.num(t, 2)}</b>（rad）`; }
    },
    {
      key: 'dosu', label: '④ 度のまま入れると',
      lead: '半径 2 の円で、中心角 30° の弧の長さを求めます。$s=r\\theta$ に、度のまま 30 を入れるとどうなるでしょう。',
      miss: '$s=r\\theta$ は、$\\theta$ がラジアンのときの式です。$2\\times30=60$ は、円周（約 12.6）よりずっと長く、おかしいとわかります。$30°=\\dfrac{\\pi}{6}$ rad なので、$s=2\\times\\dfrac{\\pi}{6}\\approx1.05$ です。',
      legend: [['正しい弧の長さ $s=r\\theta$（rad）', { color: 'a' }], ['円周 $2\\pi r$', { color: 'sub', style: 'dash' }], ['度のまま入れた「長さ」（まちがい）', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'deg', label: '中心角', min: 0, max: 360, step: 1, fmt: v => v + '°' }],
      init(st) { st.deg = 30; },
      draw(cv, st) { drawDosu(cv, st); },
      readout: st => `${st.deg}° ＝ ${st.deg} × π ÷ 180 ＝ ${A.num(st.deg / DEG, 3)} rad　→　$s$ ＝ 2 × ${A.num(st.deg / DEG, 3)} ＝ <b>${A.num(2 * st.deg / DEG, 2)}</b>（まちがい：2 × ${st.deg} ＝ ${2 * st.deg}）`
    }
  ]
});

// 進みぐあい p（0〜3）→ まきつけた割合 u（0〜1）
function wrapU(p) { return A.clamp(p - 1, 0, 1); }
function arcV(v, r, a0, a1, o, cx = 0, cy = 0) {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) * 30)), pts = [];
  for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  v.line(pts, o);
}
function base(cv, r, box) {
  const v = cv.view({ x0: -7.2, x1: 7.2, y0: -7.2, y1: 7.2, box: box || [20, 10, 440, 400], equal: true });
  v.line([[-7, 0], [7, 0]], { color: 'grid', width: 1 }); v.line([[0, -7], [0, 7]], { color: 'grid', width: 1 });
  v.circle(0, 0, r, { color: 'sub', width: 1.5 });
  v.dot(0, 0, { r: 4, color: 'ink' });
  return v;
}
function drawHimo(cv, st) {
  const r = st.r, v = base(cv, r), u = wrapU(st.p);
  v.line([[0, 0], [r, 0]], { color: 'a', width: 4 });
  v.text('半径 ' + A.num(r, 1), r / 2, -0.5, { size: 15, color: 'a', align: 'center', bold: true });
  // ひも
  if (st.p < 1) {
    const ps = Math.PI - st.p * Math.PI / 2;
    v.line([[r, 0], [r + r * Math.cos(ps), r * Math.sin(ps)]], { color: 'b', style: 'long', width: 5 });
  } else {
    arcV(v, r, 0, u, { color: 'b', style: 'long', width: 5 });
    const bx = r * Math.cos(u), by = r * Math.sin(u), L = (1 - u) * r;
    if (L > 0.01) v.line([[bx, by], [bx - L * Math.sin(u), by + L * Math.cos(u)]], { color: 'b', style: 'long', width: 5 });
  }
  if (st.p >= 2) {
    const k = A.clamp(st.p - 2, 0, 1);
    v.line([[0, 0], [r * Math.cos(1), r * Math.sin(1)]], { color: 'ink', width: 2, alpha: k });
    arcV(v, 1.1, 0, 1, { color: 'ink', width: 2, alpha: k });
    v.text('1 rad', 1.9 * Math.cos(0.5), 1.9 * Math.sin(0.5), { size: 17, bold: true, align: 'center', bg: true });
    v.text('弧も ' + A.num(r, 1), (r + 0.5) * Math.cos(0.5), (r + 0.5) * Math.sin(0.5), { size: 15, color: 'b', bold: true });
  }
  // 1° の角（比べるため）
  v.line([[0, 0], [6.9 * Math.cos(1 / DEG), 6.9 * Math.sin(1 / DEG)]], { color: 'b', style: 'dot', width: 2 });
  // 右の欄
  const X = 490; let y = 50; const t = (s, o) => { cv.text(s, X, y, Object.assign({ size: 16 }, o)); y += 30; };
  t('角（rad）＝ 弧の長さ ÷ 半径', { bold: true });
  t('ひもの長さ ＝ 半径 ＝ ' + A.num(r, 1) + ' cm', { color: 'b' });
  t('まきつけた弧 ＝ ' + A.num(u * r, 2) + ' cm', { color: 'b' });
  t('角 ＝ ' + A.num(u * r, 2) + ' ÷ ' + A.num(r, 1) + ' ＝ ' + A.num(u, 2) + ' rad');
  y += 14;
  t('1 rad ≈ 57.3°', { size: 22, bold: true });
  t('（360° ÷ 6.28 ≈ 57.3°）', { color: 'sub' });
  y += 14;
  t('点線 ＝ 1° の角', { color: 'b' });
  t('1° は x 軸とほとんど重なるほど小さい', { color: 'sub', size: 15 });
}
function drawShuu(cv, st) {
  const r = 5, v = base(cv, r), q = st.q, n = Math.floor(q);
  for (let k = 0; k <= Math.min(n, 6); k++) {
    const a1 = Math.min(q, k + 1); if (a1 <= k) continue;
    const odd = k % 2 === 0, o = k === 6 ? { color: 'sub', style: 'dot', width: 6 } : { color: odd ? 'a' : 'b', style: odd ? 'solid' : 'dash', width: 6 };
    arcV(v, r, k + 0.015, a1 - 0.015, o);
    if (a1 - k > 0.5 && k < 6) v.text(String(k + 1), (r - 0.8) * Math.cos(k + 0.5), (r - 0.8) * Math.sin(k + 0.5), { size: 17, bold: true, align: 'center' });
  }
  // いま まいている ひもの、まだ まいていない部分
  if (q < TAU14 && n < 6) {
    const u = q - n, bx = r * Math.cos(q), by = r * Math.sin(q), L = (1 - u) * r, odd = n % 2 === 0;
    v.line([[bx, by], [bx - L * Math.sin(q), by + L * Math.cos(q)]], { color: odd ? 'a' : 'b', style: odd ? 'solid' : 'dash', width: 4, alpha: 0.6 });
  }
  if (q > 6.05) {
    v.text('あと 0.28', r + 1.1, -0.9, { size: 16, bold: true, color: 'sub', align: 'center', bg: true });
  }
  v.line([[0, 0], [r * Math.cos(q), r * Math.sin(q)]], { color: 'ink', width: 1.5 });
  const X = 490; let y = 50; const t = (s, o) => { cv.text(s, X, y, Object.assign({ size: 16 }, o)); y += 30; };
  t('まいたひも：' + A.num(q, 2) + ' 本', { bold: true });
  t('角：' + A.num(q, 2) + ' rad ＝ ' + A.num(q * DEG, 1) + '°');
  y += 12;
  t('円周 ＝ 2πr ＝ 半径の 2π 倍', { color: 'sub' });
  t('2π ≈ 6.28', { color: 'sub' });
  y += 12;
  if (q >= TAU14 - 0.005) { t('1周 ＝ 2π rad ≈ 6.28 rad', { size: 20, bold: true, color: 'a' }); t('半周 ＝ π rad（180°）', { size: 16 }); t('1/4 周 ＝ π/2 rad（90°）', { size: 16 }); }
}
function drawMina(cv, st) {
  const v = cv.view({ x0: -2.5, x1: 2.5, y0: -2.5, y1: 2.5, box: [20, 10, 420, 400], equal: true });
  v.line([[-2.4, 0], [2.4, 0]], { color: 'grid', width: 1 }); v.line([[0, -2.4], [0, 2.4]], { color: 'grid', width: 1 });
  const t = st.th / DEG;
  v.circle(0, 0, 1, { color: 'sub', width: 1 }); v.circle(0, 0, 2, { color: 'sub', width: 1 });
  arcV(v, 2, 0, t, { color: 'b', style: 'dash', width: 5 });
  arcV(v, 1, 0, t, { color: 'a', width: 5 });
  v.line([[0, 0], [2.2 * Math.cos(t), 2.2 * Math.sin(t)]], { color: 'ink', width: 1.5 });
  v.dot(Math.cos(t), Math.sin(t), { r: 8, color: 'a' }); v.dot(2 * Math.cos(t), 2 * Math.sin(t), { r: 8, color: 'b', shape: 'square' });
  v.text('ミナ', Math.cos(t) - 0.2, Math.sin(t) + 0.28, { size: 15, color: 'a', bold: true, bg: true, align: 'center' });
  v.text('ソラ', 2 * Math.cos(t) + 0.15, 2 * Math.sin(t) + 0.28, { size: 15, color: 'b', bold: true, bg: true, align: 'center' });
  v.dot(0, 0, { r: 4 });
  // 右：表
  const X = 470, cols = [470, 560, 700, 790]; let y = 60;
  const row = (a, o) => { a.forEach((s, k) => cv.text(s, cols[k], y, Object.assign({ size: 16 }, o))); y += 34; };
  row(['', '半径', '弧の長さ', '弧÷半径'], { bold: true, color: 'sub' });
  cv.line([[X, y - 18], [860, y - 18]], { color: 'line', width: 1 });
  row(['ミナ', '1 m', A.num(t, 2) + ' m', A.num(t, 2)], { color: 'a', bold: true });
  row(['ソラ', '2 m', A.num(2 * t, 2) + ' m', A.num(t, 2)], { color: 'b', bold: true });
  y += 20;
  cv.text('回った角：' + Math.round(st.th) + '°', X, y, { size: 16 }); y += 30;
  cv.text('＝ ' + A.num(t, 2) + ' rad', X, y, { size: 20, bold: true }); y += 40;
  cv.text('道のりは2倍ちがっても、', X, y, { size: 15, color: 'sub' }); y += 24;
  cv.text('「弧÷半径」は同じ数になる', X, y, { size: 15, color: 'sub' });
}
function drawDosu(cv, st) {
  const v = cv.view({ x0: -2.6, x1: 2.6, y0: -2.6, y1: 2.6, box: [10, 10, 300, 300], equal: true });
  const t = st.deg / DEG;
  v.circle(0, 0, 2, { color: 'sub', width: 1.5, style: 'dash' });
  v.line([[0, 0], [2, 0]], { color: 'ink', width: 1.5 }); v.line([[0, 0], [2 * Math.cos(t), 2 * Math.sin(t)]], { color: 'ink', width: 1.5 });
  arcV(v, 2, 0, t, { color: 'a', width: 5 });
  arcV(v, 0.5, 0, t, { color: 'ink', width: 1.5 });
  v.text(st.deg + '°', 0.8 * Math.cos(t / 2), 0.8 * Math.sin(t / 2), { size: 15, align: 'center', bg: true });
  v.text('r ＝ 2', 1, -0.3, { size: 15, align: 'center' });
  v.dot(0, 0, { r: 4 });
  // 右：長さのくらべ（横の棒）
  const L = 340, R = 860, s = (R - L) / 720, bar = (y, len, o, lab) => {
    cv.line([[L, y], [L + Math.min(len, 720) * s, y]], o);
    cv.text(lab, L, y - 18, { size: 15, color: o.color, bold: true });
  };
  bar(80, 2 * t, { color: 'a', width: 8 }, '正しい弧の長さ ' + A.num(2 * t, 2));
  bar(160, 4 * Math.PI, { color: 'sub', width: 8, style: 'dash' }, '円周 2π×2 ≈ 12.57（弧はこれより長くならない）');
  bar(240, 2 * st.deg, { color: 'b', width: 8, style: 'dash' }, 'まちがい：2 × ' + st.deg + ' ＝ ' + 2 * st.deg + (2 * st.deg > 720 ? '（はみ出す）' : ''));
  for (let k = 0; k <= 720; k += 60) { cv.line([[L + k * s, 290], [L + k * s, 296]], { color: 'sub', width: 1 }); cv.text(String(k), L + k * s, 310, { size: 14, color: 'sub', align: 'center' }); }
  cv.line([[L, 290], [R, 290]], { color: 'sub', width: 1 });
  cv.text('長さ（同じ目もり）', L, 340, { size: 15, color: 'sub' });
  cv.text('換算：' + st.deg + '° × π rad ÷ 180° ＝ ' + A.num(t, 3) + ' rad', 20, 360, { size: 16 });
  cv.text('（' + st.deg + ' × 180 ÷ π ＝ ' + A.num(st.deg * DEG, 0) + ' とするのは、分数がさかさま）', 20, 392, { size: 15, color: 'sub' });
}
