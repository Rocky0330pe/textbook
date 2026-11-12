// P2-35 の検算：1点炉・遅発中性子1群（本の原-15 ⑧と同じ式・同じ値）。
// アニメは2つの指数の和（正確な解）で描くので、本のプログラム（ルンゲ・クッタ法、h＝10⁻⁴ s）の出力と照らす。
// node checks/アニメ/p2-35/kinetics_check.js
'use strict';
const beta = 0.0065, lam = 0.08, Lam = 1e-4;
function exact(rho) {
  const a = Lam, b = beta - rho + lam * Lam, c = -lam * rho, D = Math.sqrt(b * b - 4 * a * c);
  const s1 = (-b + D) / (2 * a), s2 = (-b - D) / (2 * a), A1 = (rho / Lam - s2) / (s1 - s2);
  return { s1, s2, A1, A2: 1 - A1, n: t => A1 * Math.exp(s1 * t) + (1 - A1) * Math.exp(s2 * t) };
}
function rk4(rho, ts) {
  const f = ([n, C]) => [(rho - beta) / Lam * n + lam * C, beta / Lam * n - lam * C];
  let y = [1, beta / (Lam * lam)]; const h = 1e-4, out = {};
  for (let i = 1; i <= Math.round(Math.max(...ts) / h); i++) {
    const k1 = f(y), k2 = f(y.map((v, j) => v + h / 2 * k1[j])), k3 = f(y.map((v, j) => v + h / 2 * k2[j])), k4 = f(y.map((v, j) => v + h * k3[j]));
    y = y.map((v, j) => v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    for (const t of ts) if (Math.abs(i * h - t) < h / 2) out[t] = y[0];
  }
  return out;
}
const e = exact(0.001);
console.log('ρ＝0.001：s1', e.s1.toFixed(5), '（本 0.0145）、s2', e.s2.toFixed(2), '（本 −55）、A1', e.A1.toFixed(3), '（本 1.181）、周期', (1 / e.s1).toFixed(1), 's（本 69）');
const r = rk4(0.001, [0.1, 1, 10, 60]);
for (const t of [0.1, 1, 10, 60]) console.log('t', t, '正確な解', e.n(t).toFixed(3), 'ルンゲ・クッタ', r[t].toFixed(3));
console.log('本の出力：0.1 1.182、1.0 1.198、10.0 1.366、60.0 2.823');
console.log('即発中性子だけ（n＝e^{ρt/Λ}）が 3.2 倍をこえる時刻', (Math.log(3.2) * Lam / 0.001).toFixed(3), 's（本：0.12 s）');
console.log('k^g：1.1^20', (1.1 ** 20).toFixed(2), '（本 約6.7）、0.9^20', (0.9 ** 20).toFixed(3), '（本 約0.12）、1.001^100', (1.001 ** 100).toFixed(3), '（本 1.105）、1.001^10000', Math.round(1.001 ** 10000), '（本 約2万）');
for (const rho of [0.002, 0.003]) { const q = exact(rho); console.log('ρ＝' + rho, '周期', (1 / q.s1).toFixed(1), 's　目安の式 0.083/ρ', (0.083 / rho).toFixed(1), 's'); }
