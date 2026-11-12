// P2-29 の検算：アニメと同じクランク・ニコルソン法（x −40〜40 nm、刻み 0.02 nm、dt 0.05 fs）で、
// 本の図（原-6 ⑦：1.5 eV・2 eV・0.3 nm、30 fs 後にぬけた確率 0.305。checks/物理第5巻/原-6/fig_p5_06.py）と照らす。
// node checks/アニメ/p2-29/cn_check.js
'use strict';
const HBAR = 0.658211957, HB2M = 0.0380998;
function run(E0, U0, a, tEnd, N = 4000, X = 40, dt = 0.05, sig = 1.5, x00 = -12) {
  const dx = 2 * X / (N - 1), x = new Float64Array(N);
  for (let j = 0; j < N; j++) x[j] = -X + j * dx;
  const k0 = Math.sqrt(E0 / HB2M);
  const re = new Float64Array(N), im = new Float64Array(N);
  let s = 0;
  for (let j = 0; j < N; j++) { const g = Math.exp(-((x[j] - x00) ** 2) / (4 * sig * sig)); re[j] = g * Math.cos(k0 * x[j]); im[j] = g * Math.sin(k0 * x[j]); s += (re[j] ** 2 + im[j] ** 2) * dx; }
  for (let j = 0; j < N; j++) { re[j] /= Math.sqrt(s); im[j] /= Math.sqrt(s); }
  const U = new Float64Array(N); for (let j = 0; j < N; j++) U[j] = x[j] >= 0 && x[j] <= a ? U0 : 0;
  const A = HB2M / dx / dx, r = dt / (2 * HBAR);      // r は i をかける前の大きさ
  // M = 1 + i r H：対角 1 + i r(2A+U)、横 −i r A
  const offR = 0, offI = -r * A;
  const cR = new Float64Array(N), cI = new Float64Array(N), dR = new Float64Array(N), dI = new Float64Array(N);
  for (let j = 0; j < N; j++) {
    let mr = 1, mi = r * (2 * A + U[j]);
    if (j > 0) { const pr = offR * cR[j - 1] - offI * cI[j - 1], pi = offR * cI[j - 1] + offI * cR[j - 1]; mr -= pr; mi -= pi; }
    const den = mr * mr + mi * mi; dR[j] = mr / den; dI[j] = -mi / den;            // 1/(…)
    cR[j] = offR * dR[j] - offI * dI[j]; cI[j] = offR * dI[j] + offI * dR[j];     // off/(…)
  }
  const yR = new Float64Array(N), yI = new Float64Array(N);
  const steps = Math.round(tEnd / dt);
  for (let n = 0; n < steps; n++) {
    for (let j = 0; j < N; j++) {
      // rhs = (1 − i r(2A+U))ψ + i r A (ψ_{j−1}+ψ_{j+1})
      const d = r * (2 * A + U[j]);
      let br = re[j] + d * im[j], bi = im[j] - d * re[j];
      const sr = (j > 0 ? re[j - 1] : 0) + (j < N - 1 ? re[j + 1] : 0), si = (j > 0 ? im[j - 1] : 0) + (j < N - 1 ? im[j + 1] : 0);
      br += -r * A * si; bi += r * A * sr;
      if (j > 0) { br -= offR * yR[j - 1] - offI * yI[j - 1]; bi -= offR * yI[j - 1] + offI * yR[j - 1]; }
      yR[j] = br * dR[j] - bi * dI[j]; yI[j] = br * dI[j] + bi * dR[j];
    }
    re[N - 1] = yR[N - 1]; im[N - 1] = yI[N - 1];
    for (let j = N - 2; j >= 0; j--) { re[j] = yR[j] - (cR[j] * re[j + 1] - cI[j] * im[j + 1]); im[j] = yI[j] - (cR[j] * im[j + 1] + cI[j] * re[j + 1]); }
  }
  let pt = 0, pr = 0, tot = 0;
  for (let j = 0; j < N; j++) { const p = (re[j] ** 2 + im[j] ** 2) * dx; tot += p; if (x[j] > a) pt += p; if (x[j] < 0) pr += p; }
  return { pt, pr, tot };
}
const exactT = (E, U0, a) => { const kap = Math.sqrt((U0 - E) / HB2M); return 1 / (1 + U0 * U0 * Math.sinh(kap * a) ** 2 / (4 * E * (U0 - E))); };
const r = run(1.5, 2.0, 0.3, 30);
console.log('本の場面（1.5 eV・2 eV・0.3 nm・30 fs）：ぬけた', r.pt.toFixed(3), 'はね返った', r.pr.toFixed(3), '合計', r.tot.toFixed(4), '（本：0.305・0.695）');
console.log('平面波の正確な透過率', exactT(1.5, 2, 0.3).toFixed(3), '（本：0.303）');
for (const a of [0.15, 0.6]) { const q = run(1.5, 2.0, a, 30); console.log('厚さ', a, 'nm：ぬけた', q.pt.toFixed(4), '平面波', exactT(1.5, 2, a).toFixed(4)); }
const big = run(3.0, 2.0, 0.3, 30); console.log('3 eV（壁より高い）：ぬけた', big.pt.toFixed(3), '合計', big.tot.toFixed(4));
