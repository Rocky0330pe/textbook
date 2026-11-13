// M3-14〜M3-25 のアニメーションに出す数を、本と同じ式・同じ刻みで計算して、本の数とくらべる（node kenzan.js）
'use strict';
const f = (v, d = 2) => v.toFixed(d);
// M3-15：冷めるお湯のオイラー法（10分後）
for (const dt of [5, 2, 1, 0.5, 0.1]) { let T = 80; for (let i = 0; i < Math.round(10 / dt); i++) T += -0.05 * (T - 20) * dt; console.log('M3-15 お湯 Δt=' + dt, f(T, 3), 'ずれ', f(20 + 60 * Math.exp(-0.5) - T, 3)); }
{ let T = 80, s = []; for (let i = 0; i <= 6; i++) { s.push(f(T, 3)); T += -0.05 * (T - 20) * 30; } console.log('M3-15 Δt=30', s.join(' ')); }
{ let T = 80, s = []; for (let i = 0; i <= 6; i++) { s.push(f(T, 1)); T += -0.05 * (T - 20) * 50; } console.log('M3-15 Δt=50', s.join(' ')); }
// M3-15：ばね ふつうのオイラー法 Δt=0.02 の山
{ let x = 0.1, v = 0, dt = 0.02, pk = [], pv = 0; for (let i = 0; i < 250; i++) { const a = -16 * x; const xn = x + v * dt; v += a * dt; x = xn; if (pv > 0 && v <= 0) pk.push(f(x, 3)); pv = v; } console.log('M3-15 ふつう 山', pk.join(' ')); }
{ let x = 0.1, v = 0, dt = 0.02, mn = 1, mx = 0; for (let i = 0; i < 2000; i++) { v += -16 * x * dt; x += v * dt; const r = Math.hypot(x, v / 4); mn = Math.min(mn, r); mx = Math.max(mx, r); } console.log('M3-15 速度を先に 半径', f(mn, 4), f(mx, 4)); }
// M3-16：スカイダイバー
for (const dt of [1, 0.1]) { let v = 0; const out = []; for (let i = 1; i <= Math.round(10 / dt); i++) { v += (9.8 - 0.00325 * v * v) * dt; const t = i * dt; if ([1, 2, 3, 5, 10].some(q => Math.abs(q - t) < 1e-9)) out.push(f(v)); } console.log('M3-16 Δt=' + dt, out.join(' ')); }
{ const vt = Math.sqrt(80 * 9.8 / 0.26); console.log('M3-16 vt', f(vt, 2), [1, 2, 3, 5, 10].map(t => f(vt * Math.tanh(9.8 * t / vt))).join(' ')); }
console.log('M3-16 雨 vt', f(Math.sqrt(4.2e-6 * 9.8 / 9.7e-7), 2));
for (const vt of [1.06, 1.06 * Math.SQRT2, 2.12]) console.log('M3-16 フィルター vt', f(vt), '0.2s の位置', f(vt * vt / 9.8 * Math.log(Math.cosh(9.8 * 0.2 / vt)), 3));
// M3-17：振り子（本のプログラムと同じ）
for (const deg of [10, 30, 60, 90, 120, 150]) { let th = deg * Math.PI / 180, om = 0, t = 0; const dt = 0.001; for (;;) { const a = -9.8 * Math.sin(th); om += a * dt; const th2 = th + om * dt; t += dt; if (th > 0 && th2 <= 0) break; th = th2; } console.log('M3-17 振り子', deg, f(4 * t)); }
// M3-17：エネルギー ふつうのオイラー Δt=0.05 で1周期
{ let x = 0.1, v = 0; const dt = 0.05; for (let i = 0; i < Math.round(1.5708 / dt); i++) { const a = -16 * x; x += v * dt; v += a * dt; } console.log('M3-17 ふつうΔt=0.05 1周期のE', f(0.25 * v * v + 4 * x * x, 3)); }
{ let x = 0.1, v = 0, mn = 1, mx = 0; const dt = 0.01; for (let i = 0; i < 1000; i++) { v += -16 * x * dt; x += v * dt; const E = 0.25 * v * v + 4 * x * x; mn = Math.min(mn, E); mx = Math.max(mx, E); } console.log('M3-17 先にΔt=0.01 E', f(mn, 4), f(mx, 4)); }
// M3-18：行きすぎと落ち着く時刻（速度を先に、Δt=0.01 と、細かい Δt）
for (const dt of [0.01, 0.0001]) for (const c of [0.4, 1, 2, 3, 3.5, 4, 5, 10]) { let x = 0.1, v = 0, t = 0, mn = 0, last = 0; for (let i = 0; i < 20 / dt; i++) { const a = (-8 * x - c * v) / 0.5; v += a * dt; x += v * dt; t += dt; mn = Math.min(mn, x); if (Math.abs(x) >= 0.002) last = t; } console.log('M3-18 Δt=' + dt, 'c=' + c, '行きすぎ', f(-mn / 0.1 * 100, 1) + '%', '落ち着く', f(last, 2)); }
// M3-23：振幅とおくれ
for (const w of [1, 2, 3, 3.5, 3.8, 4, 4.2, 4.5, 5, 6, 8]) console.log('M3-23 ω=' + w, f(0.8 / Math.hypot(8 - 0.5 * w * w, 0.4 * w), 3), 'おくれ', f(Math.atan2(0.4 * w, 8 - 0.5 * w * w) * 180 / Math.PI, 1));
// M3-25：水そう Δt=1、正しい順と、まちがえた順
{ let a = 20, b = 0; const s = []; for (let i = 0; i <= 10; i++) { s.push(f(a, 3) + '/' + f(b, 3)); const d = a - b; a -= 0.1 * d; b += 0.1 * d; } console.log('M3-25 正しい', s.join(' ')); }
{ let a = 20, b = 0; const s = []; for (let i = 0; i <= 5; i++) { s.push(f(a + b, 3)); a -= 0.1 * (a - b); b += 0.1 * (a - b); } console.log('M3-25 まちがえた順 合計', s.join(' ')); }
for (const dt of [1, 0.5, 0.1]) { let a = 20, b = 0; for (let i = 0; i < Math.round(10 / dt); i++) { const d = a - b; a -= 0.1 * d * dt; b += 0.1 * d * dt; } console.log('M3-25 Δt=' + dt, '10分後 h1', f(a, 2)); }
console.log('M3-25 直列 山', f(40 * Math.exp(-1), 3));
// M3-21
for (const n of [1, 2, 4, 10, 100]) { let re = 1, im = 0; for (let k = 0; k < n; k++) { const r2 = re - im / n, i2 = im + re / n; re = r2; im = i2; } console.log('M3-21 n=' + n, f(re, 3), f(im, 3), f(Math.hypot(re, im), 3), f(Math.atan2(im, re), 3)); }
