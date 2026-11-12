// @id p1-17
// @title 色水の線が乱れるとき：レイノルズ数と水撃
// @vol 物理1
// @from 物理 力-14 ③⑦⑧⑫（p1-14 のレイノルズの実験・速さの分布・水撃）／熱-12・波でも使う
'use strict';
const SP = '<span style="display:inline-block;width:1.2em"></span>'; // 読み出しの区切り（全角の空白は行の終わりではみ出すので使わない）
// 水（20 ℃）の動粘度 ν＝1.0×10⁻⁶ m²/s。Re＜約2300 で層流、約4000 をこえると乱流（本と同じ目安）。
const NU = 1.0e-6, RHO = 1000;
const PIPE = { x0: 60, x1: 840, yc: 150, R: 62 };
A.item({
  id: 'p1-17', title: '色水の線が乱れるとき：レイノルズ数と水撃',
  from: '物理 第1巻『力学』 力-14 ③⑦⑧⑫ の図から（レイノルズの実験・層流と乱流の速さの分布・水撃）',
  W: 880, H: 440,
  state: { v: 0.04, d: 20, t: 0, ramp: true, mode: 'both', vw: 1, a: 1200, Tc: 0 },
  scenes: [
    {
      key: 'reynolds', label: '① レイノルズの実験',
      lead: '管の入口から細い色水を入れて、水を少しずつ速く流します（蛇口を少しずつ開く）。色水の線がどう変わるかを見ましょう。',
      note: 'ゆっくりのうちは、色水はまっすぐな1本の線（**層流**）。速くすると線がゆれはじめ、さらに速くすると、すぐに管いっぱいに混ざります（**乱流**）。変わり目を決めるのは、速さだけでも太さだけでもなく、$\\mathrm{Re}=vd/\\nu$ です。',
      miss: '「速いと乱流」ではありません。太い管なら遅くても乱流に、細い管なら速くても層流になります。内径 20 mm の水道管で層流にするには、約 0.12 m/s 以下まで遅くする必要があります。',
      legend: [['色水', { color: 'b', shape: 'circle', noline: true }], ['層流の目安 Re＝2300', { color: 'c', style: 'dash' }], ['乱流の目安 Re＝4000', { color: 'b', style: 'dot' }]],
      controls: [
        { range: 'v', label: '平均の速さ $v$', min: 0.02, max: 0.5, step: 0.005, fmt: v => A.num(v, 3) + ' m/s', on: st => { st.ramp = false; } },
        { range: 'd', label: '内径 $d$', min: 5, max: 40, step: 1, fmt: v => v + ' mm', on: st => { st.ramp = false; } }
      ],
      init(st) { st.v = 0.04; st.d = 20; st.t = 0; st.ramp = true; },
      step(st, dt) { st.t += dt; if (st.ramp) { st.v = Math.min(0.32, st.v + dt * 0.012); } },
      draw(cv, st) { drawReynolds(cv, st); },
      readout: st => { const re = st.v * st.d / 1000 / NU; return `$\\mathrm{Re}=vd/\\nu$ ＝ ${A.num(st.v, 3)} × ${A.num(st.d / 1000, 3)} ÷ (1.0×10⁻⁶) ＝ <b>${Math.round(re)}</b>　→ ${regime(re)}`; }
    },
    {
      key: 'bunpu', label: '② 速さの分布',
      lead: '同じ流量で、層流と乱流の速さの分布をくらべます。管を横切る色水の線が、流れでどう曲がるかを見ましょう。',
      note: '層流の分布は放物線 $u=\\frac{\\Delta p}{4\\mu L}(R^2-r^2)$ で、平均の速さは中心の速さの**半分**です。乱流では、渦が混ぜるので、まん中が平らになり（7分の1乗の法則 $u=u_{\\max}(y/R)^{1/7}$）、平均は中心の約 **0.82 倍**です。',
      miss: '乱流の速さの分布は、時間で平均した形です。本当の速さは、時間とともに不規則にゆれています（色水の線のぎざぎざ）。',
      legend: [['層流（放物線）', { color: 'a' }], ['乱流（時間の平均、7分の1乗）', { color: 'b', style: 'dash' }], ['平均の速さ（どちらも同じ）', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'mode', label: '見るもの', options: [['both', '両方'], ['lam', '層流だけ'], ['tur', '乱流だけ']] }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; if (st.t > 3.2) st.t = 0; },
      draw(cv, st) { drawProfile(cv, st); },
      readout: st => '同じ流量（平均の速さを 1 とする）　層流：中心の速さ ＝ <b>2.00</b>' + SP + '乱流：中心の速さ ＝ <b>1.22</b>（平均は中心の 0.82 倍）'
    },
    {
      key: 'suigeki', label: '③ 水撃',
      lead: '長さ 600 m の管の先の弁を急に閉めます。止まった水の部分が、圧力の波として上流へ広がるようすを見ましょう。',
      note: '弁のすぐ前の水が止まり、止まった部分が速さ $a$ で上流へ広がります。運動量の変化＝力積から $\\Delta p=\\rho a\\Delta v$（ジューコフスキーの式）。$\\rho=1000$、$a$ は約 1000〜1300 m/s なので、**1 m/s 止めるだけで約 1 MPa（約10気圧）**上がります。',
      miss: '閉める時間を、波が弁から水そうまで行ってもどる時間 $2L/a$（ここでは約1秒）より長くすると、もどってきた波が圧力を下げるので、上がり方は小さくなります。$\\Delta p=\\rho av$ は「急に閉めた」ときの値です。',
      legend: [['圧力の上がり（管にそって）', { color: 'b' }], ['$\\pm\\rho av$', { color: 'sub', style: 'dash' }], ['弁の所の圧力（時間）', { color: 'd', style: 'long' }]],
      controls: [
        { range: 'vw', label: '流れの速さ $v$', min: 0.5, max: 2, step: 0.05, fmt: v => A.num(v, 2) + ' m/s', on: st => hammerInit(st) },
        { range: 'a', label: '波の速さ $a$', min: 1000, max: 1480, step: 10, fmt: v => v + ' m/s', on: st => hammerInit(st) },
        { range: 'Tc', label: '閉める時間', min: 0, max: 4, step: 0.1, fmt: v => v < 0.05 ? '急に（0 s）' : A.num(v, 1) + ' s', on: st => hammerInit(st) }
      ],
      init(st) { hammerInit(st); },
      step(st, dt) { return hammerStep(st, dt * 0.35); },
      draw(cv, st) { drawHammer(cv, st); },
      readout: st => `$\\rho av$ ＝ 1000 × ${st.a} × ${A.num(st.vw, 2)} ＝ <b>${A.num(RHO * st.a * st.vw / 1e6, 2)} MPa</b>${SP}$2L/a$ ＝ ${A.num(1200 / st.a, 2)} s${SP}弁の所でいちばん上がった圧力：${A.num(st.pmax / 1e6, 2)} MPa`
    }
  ]
});

function regime(re) { return re < 2300 ? '層流' : re < 4000 ? '層流と乱流が入れかわる（線がゆれる）' : '乱流'; }

// ---------- ① レイノルズの実験 ----------
// 色水の粒：入口から出た時刻 te で位置を決める（毎回同じ乱数：A.rng）
function dyeAt(te, t, re) {
  const r = A.rng(Math.round(te * 90) * 2654435761 + 977), U = 230, x = PIPE.x0 + 10 + U * (t - te);
  r(); r(); r(); // 種が近いと最初の数が似るので、少し捨てる
  if (x > PIPE.x1) return null;
  const s = (x - PIPE.x0) / (PIPE.x1 - PIPE.x0);
  let y = 0;
  const g = A.clamp((re - 2300) / 1700, 0, 1); // 乱れの割合（入れかわりの所で 0→1）
  const puff = re >= 4000 || (re > 2300 && Math.sin(te * 2.6) + Math.sin(te * 1.1) > 2 - 3.2 * g);
  if (re > 1900 && !puff) { // 線がゆれる
    const amp = PIPE.R * 0.35 * A.clamp((re - 1900) / 2100, 0, 1) * Math.max(0, s - 0.25);
    y = amp * Math.sin(s * 26 - t * 6);
  }
  if (puff) { // すぐに混ざる
    const xm = re >= 4000 ? A.clamp(0.25 - (re - 4000) / 40000, 0.06, 0.25) : 0.45;
    const target = (r() * 2 - 1) * PIPE.R * 0.92, f = A.clamp(s / xm, 0, 1), sm = f * f * (3 - 2 * f);
    y = target * sm + PIPE.R * 0.12 * sm * Math.sin(s * 40 + r() * 6 + t * 5);
  }
  return [x, PIPE.yc + A.clamp(y, -PIPE.R + 3, PIPE.R - 3)];
}
function drawReynolds(cv, st) {
  const re = st.v * st.d / 1000 / NU, P = PIPE;
  cv.rect(P.x0, P.yc - P.R, P.x1 - P.x0, 2 * P.R, { fill: 'a', alpha: 0.08 });
  cv.line([[P.x0, P.yc - P.R], [P.x1, P.yc - P.R]], { color: 'sub', width: 3 });
  cv.line([[P.x0, P.yc + P.R], [P.x1, P.yc + P.R]], { color: 'sub', width: 3 });
  cv.line([[P.x0 - 40, P.yc], [P.x0 + 10, P.yc]], { color: 'sub', width: 3 });
  cv.text('色水', P.x0 - 40, P.yc - 16, { size: 15, color: 'sub' });
  for (let k = 0; k < 4; k++) cv.arrow(P.x0 + 520 + k * 70, P.yc - P.R - 20, P.x0 + 570 + k * 70, P.yc - P.R - 20, { color: 'a', width: 2 });
  cv.text('流れ', P.x0 + 500, P.yc - P.R - 20, { align: 'right', size: 15, color: 'a' });
  const t = st.t;
  for (let k = Math.ceil(Math.max(0, t - 4) * 90); k <= t * 90; k++) {
    const p = dyeAt(k / 90, t, re); if (p) cv.dot(p[0], p[1], { color: 'b', r: 2.6 });

  }
  cv.text(`内径 ${st.d} mm（絵の太さは同じにしてかいた）`, P.x1, P.yc + P.R + 18, { align: 'right', size: 14, color: 'sub' });
  // Re の物差し（対数）
  const g = cv.view({ x0: Math.log10(300), x1: Math.log10(30000), y0: 0, y1: 1, box: [60, 300, 780, 60] });
  const L = Math.log10;
  g.poly([[g.x0, 0], [L(2300), 0], [L(2300), 1], [g.x0, 1]], { fill: 'c', alpha: 0.12 });
  g.poly([[L(2300), 0], [L(4000), 0], [L(4000), 1], [L(2300), 1]], { fill: 'e', alpha: 0.15 });
  g.poly([[L(4000), 0], [g.x1, 0], [g.x1, 1], [L(4000), 1]], { fill: 'b', alpha: 0.12 });
  g.line([[L(2300), -0.1], [L(2300), 1.1]], { color: 'c', style: 'dash', width: 2 });
  g.line([[L(4000), -0.1], [L(4000), 1.1]], { color: 'b', style: 'dot', width: 2.5 });
  g.line([[g.x0, 0], [g.x1, 0]], { color: 'sub', width: 1.5 });
  for (const v of [300, 1000, 2300, 4000, 10000, 30000]) g.text(String(v), L(v), -0.35, { align: 'center', size: 14, color: 'sub' });
  g.text('層流', L(800), 0.5, { align: 'center', size: 15, color: 'c', bold: true });
  g.text('入れかわる', L(3030), 0.5, { align: 'center', size: 14, color: 'e', bold: true });
  g.text('乱流', L(12000), 0.5, { align: 'center', size: 15, color: 'b', bold: true });
  const xr = A.clamp(L(Math.max(re, 1)), g.x0, g.x1);
  g.dot(xr, 1.25, { color: 'ink', shape: 'tri', r: 8 });
  g.text('Re ＝ ' + Math.round(re), xr, 1.75, { align: 'center', size: 15, bold: true });
  cv.text('レイノルズ数 Re（対数の目もり）', 60, 410, { size: 14, color: 'sub' });
}

// ---------- ② 速さの分布 ----------
function drawProfile(cv, st) {
  const R = 1, show = { lam: st.mode !== 'tur', tur: st.mode !== 'lam' };
  const panels = [];
  if (show.lam) panels.push('lam'); if (show.tur) panels.push('tur');
  const w = 860 / panels.length;
  panels.forEach((kind, i) => {
    const v = cv.view({ x0: -0.3, x1: 3.3, y0: -1.25, y1: 1.25, box: [10 + i * w, 40, w - 20, 340] });
    const u = kind === 'lam' ? y => 2 * (1 - y * y) : y => 1.2245 * Math.pow(Math.max(0, 1 - Math.abs(y)), 1 / 7);
    const col = kind === 'lam' ? 'a' : 'b', sty = kind === 'lam' ? 'solid' : 'dash';
    v.poly([[-0.3, -1], [3.3, -1], [3.3, 1], [-0.3, 1]], { fill: 'a', alpha: 0.06 });
    v.line([[-0.3, 1], [3.3, 1]], { color: 'sub', width: 3 }); v.line([[-0.3, -1], [3.3, -1]], { color: 'sub', width: 3 });
    v.line([[0, -1], [0, 1]], { color: 'sub', width: 1 });
    for (let k = -6; k <= 6; k++) { const y = k / 7.5; v.arrow(0, y, u(y) * 0.95, y, { color: col, width: 1.8 }); }
    v.param(y => u(y) * 0.95, y => y, -1, 1, { color: col, width: 3, style: sty, n: 200 });
    v.line([[0.95, -1], [0.95, 1]], { color: 'sub', style: 'dot', width: 2 });
    // 流れていく色水の線（はじめは x＝0 のたての線）
    const tt = st.t * 0.9, pts = [];
    const r = A.rng(7);
    for (let k = 0; k <= 80; k++) { const y = -1 + 2 * k / 80; let x = u(y) * tt; if (kind === 'tur') x += 0.06 * tt * (r() - 0.5) * 2; pts.push([x, y]); }
    v.clip(() => v.line(pts, { color: 'd', width: 2.5 }));
    v.text(kind === 'lam' ? '層流：放物線' : '乱流（時間の平均）：平ら', 1.5, -1.17, { align: 'center', size: 16, bold: true, color: col });
    v.text('中心の速さ ' + (kind === 'lam' ? '2.00' : '1.22'), u(0) * 0.95 + 0.05, 0.12, { size: 15, color: col, bg: true });
    v.text('平均 1', 1.0, 0.86, { size: 14, color: 'sub', bg: true });
  });
  cv.text('紫の線：はじめはたてにまっすぐだった色水の線が、流れで曲がっていく', 440, 410, { align: 'center', size: 15, color: 'd' });
}

// ---------- ③ 水撃（特性曲線法：摩擦なし。管の長さ 600 m、上流は大きな水そう） ----------
const HN = 40;
function hammerInit(st) {
  st.t = 0; st.pmax = 0; st.hist = [];
  st.p = new Array(HN + 1).fill(0); st.u = new Array(HN + 1).fill(st.vw);
}
function hammerStep(st, dt) {
  const L = 600, dts = L / HN / st.a, B = RHO * st.a;
  st.acc = (st.acc || 0) + dt;
  while (st.acc >= dts) {
    st.acc -= dts; st.t += dts;
    const p = st.p, u = st.u, np = p.slice(), nu = u.slice();
    for (let i = 1; i < HN; i++) { // 内側：C+ と C− の交わり
      const cp = p[i - 1] + B * u[i - 1], cm = p[i + 1] - B * u[i + 1];
      np[i] = (cp + cm) / 2; nu[i] = (cp - cm) / (2 * B);
    }
    np[0] = 0; nu[0] = (np[0] - (p[1] - B * u[1])) / B; // 水そう：圧力はそのまま
    const uv = st.Tc < 0.05 ? 0 : Math.max(0, st.vw * (1 - st.t / st.Tc)); // 弁：決めた速さ
    nu[HN] = uv; np[HN] = p[HN - 1] + B * u[HN - 1] - B * uv;
    st.p = np; st.u = nu;
    st.pmax = Math.max(st.pmax, np[HN]);
    st.hist.push([st.t, np[HN]]);
  }
  if (st.t > 7.5) return false;
}
function drawHammer(cv, st) {
  const dp = RHO * st.a * st.vw / 1e6;
  // 管（色で圧力）
  const x0 = 60, x1 = 820, y = 70, h = 34, dx = (x1 - x0) / HN;
  cv.rect(10, y - 45, 50, 75, { fill: 'a', alpha: 0.18, color: 'sub', width: 1.5 });
  cv.text('水そう', 35, y - 56, { align: 'center', size: 14, color: 'sub' });
  for (let i = 0; i < HN; i++) {
    const pm = (st.p[i] + st.p[i + 1]) / 2 / 1e6 / Math.max(dp, 0.01);
    cv.rect(x0 + i * dx, y - h / 2, dx + 0.5, h, { fill: pm >= 0 ? 'b' : 'a', alpha: 0.08 + 0.55 * Math.min(1, Math.abs(pm)) });
  }
  cv.line([[x0, y - h / 2], [x1, y - h / 2]], { color: 'ink', width: 2 }); cv.line([[x0, y + h / 2], [x1, y + h / 2]], { color: 'ink', width: 2 });
  const open = st.Tc < 0.05 ? (st.t > 0 ? 0 : 1) : Math.max(0, 1 - st.t / st.Tc);
  cv.rect(x1, y - h / 2 - 6, 10, (h + 12) * (1 - open), { fill: 'ink', alpha: 0.85 });
  cv.text('弁', x1 + 5, y - h / 2 - 16, { align: 'center', size: 15, bold: true });
  for (let i = 2; i < HN; i += 5) { const uu = st.u[i] / Math.max(st.vw, 0.01); if (Math.abs(uu) > 0.08) cv.arrow(x0 + i * dx, y, x0 + i * dx + 26 * uu, y, { color: 'ink', width: 2 }); }
  cv.text('色：赤いほど圧力が高い、青いほど低い。矢印：水の速さ', 440, y + 34, { align: 'center', size: 14, color: 'sub' });
  // 管にそった圧力
  const g = cv.view({ x0: 0, x1: 600, y0: -2.6, y1: 2.6, box: [60, 140, 420, 260] });
  g.axes({ xt: [0, 200, 400, 600], yt: [-2, -1, 1, 2], yl: '圧力の上がり（MPa）', zero: true });
  cv.text('水そうからの距離（m）', 270, 418, { align: 'center', size: 14, color: 'sub' });
  g.line([[0, dp], [600, dp]], { color: 'sub', style: 'dash', width: 1.5 }); g.line([[0, -dp], [600, -dp]], { color: 'sub', style: 'dash', width: 1.5 });
  g.line(st.p.map((p, i) => [600 * i / HN, A.clamp(p / 1e6, -2.6, 2.6)]), { color: 'b', width: 3 });
  // 弁の所の圧力の時間の変化
  const q = cv.view({ x0: 0, x1: 7.5, y0: -2.6, y1: 2.6, box: [540, 140, 320, 260] });
  q.axes({ xt: [1, 2, 3, 4, 5, 6, 7], yt: [-2, -1, 1, 2], yl: '弁の所の圧力の上がり（MPa）' });
  cv.text('時刻（s）', 700, 418, { align: 'center', size: 14, color: 'sub' });

  q.line([[0, dp], [7.5, dp]], { color: 'sub', style: 'dash', width: 1.5 }); q.line([[0, -dp], [7.5, -dp]], { color: 'sub', style: 'dash', width: 1.5 });
  if (st.hist.length > 1) q.line(st.hist.filter((h, k) => k % 2 === 0).map(h => [h[0], A.clamp(h[1] / 1e6, -2.6, 2.6)]), { color: 'd', width: 2.5, style: 'long' });
  q.text('ρav', 7.3, dp + 0.3, { align: 'right', size: 15, color: 'sub', math: true, italic: true });
}
