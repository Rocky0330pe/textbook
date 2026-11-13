// M4-18 の検算：8-13 の表計算（11点、Δx=0.01 m、α=1e-4）と 8-12 の板のならし
// node checks/アニメ/M4-18/heat.js
'use strict';
function rod(r, dt, tEnd, rightFixed) {
  let T = Array(11).fill(20); T[0] = 100; let t = 0; const snaps = {}; let cross = null;
  while (t < tEnd - 1e-9) {
    const U = T.slice();
    for (let i = 1; i < 10; i++) U[i] = T[i] + r * (T[i + 1] - 2 * T[i] + T[i - 1]);
    U[10] = rightFixed ? 20 : T[10] + 2 * r * (T[9] - T[10]);
    T = U; t = +(t + dt).toFixed(6);
    if (cross === null && T[5] >= 50) cross = t;
    for (const s of [1, 5, 6, 12, 15.5, 16.5, 30, 100]) if (Math.abs(t - s) < 1e-9) snaps[s] = T.map(v => +v.toFixed(1));
  }
  return { cross, snaps };
}
const a = rod(0.25, 0.25, 100, false);
console.log('右はし断熱 r=0.25：50℃をこえる', a.cross, 's');
for (const s of [1, 5, 15.5, 30, 100]) console.log(' ', s, 's', a.snaps[s].join(' '));
const b = rod(0.25, 0.25, 20, true);
console.log('右はし20℃：50℃をこえる', b.cross, 's', (b.snaps[16.5] || []).join(' '));
const c = rod(0.6, 0.6, 12.000001, false);
console.log('r=0.6 6秒後', c.snaps[6].join(' '));
console.log('r=0.6 12秒後 min/max', Math.min(...c.snaps[12]), Math.max(...c.snaps[12]));
let P = [[0, 100, 100, 100, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
for (let k = 1; k <= 30; k++) {
  const Q = P.map(r => r.slice());
  for (let i = 1; i < 4; i++) for (let j = 1; j < 4; j++) Q[i][j] = (P[i - 1][j] + P[i + 1][j] + P[i][j - 1] + P[i][j + 1]) / 4;
  P = Q;
  if (k === 1 || k === 2 || k === 30) console.log('板', k, '回', P.slice(1, 4).map(r => r.slice(1, 4).map(v => +v.toFixed(2)).join('・')).join(' / '));
}
