// M4-29 の検算：9-1 のフーリエ級数（奇数番200項）と、9-11 の 9×9 の熱の行列（固有ベクトル sin(mπi/10)）
// node checks/アニメ/M4-29/modes.js
'use strict';
const L = 0.1, al = 1e-4;
function series(x, t, N = 200) { let s = 0; for (let k = 0; k < N; k++) { const n = 2 * k + 1; s += 400 / (n * Math.PI) * Math.exp(-al * (n * Math.PI / L) ** 2 * t) * Math.sin(n * Math.PI * x / L); } return s; }
const lam = m => -4 * Math.sin(m * Math.PI / 20) ** 2;
function matrix(i, t) {   // 9点（i=1..9）、はじめ100℃、両はし0℃。dT/dt = A T（α/Δx² = 1）
  let s = 0;
  for (let m = 1; m <= 9; m++) { let c = 0; for (let j = 1; j <= 9; j++) c += 100 * Math.sin(m * Math.PI * j / 10); c *= 2 / 10; s += c * Math.exp(lam(m) * t) * Math.sin(m * Math.PI * i / 10); }
  return s;
}
for (const t of [2, 5, 10, 20]) console.log('t =', t, '級数', series(L / 2, t).toFixed(2), '行列', matrix(5, t).toFixed(2));
console.log('固有値', [1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => lam(m).toFixed(4)).join(' '));
console.log('連続の消える速さ', [1, 2, 3].map(m => (al * (m * Math.PI / L) ** 2).toFixed(4)).join(' '));
console.log('いちばん遅い固有ベクトル', [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => Math.sin(Math.PI * i / 10).toFixed(3)).join(' '));
let t = 0; while (series(L / 2, t) > 50) t += 0.001; console.log('級数で50℃になる時刻', t.toFixed(2));
t = 0; while (matrix(5, t) > 50) t += 0.001; console.log('行列で50℃になる時刻', t.toFixed(2));
