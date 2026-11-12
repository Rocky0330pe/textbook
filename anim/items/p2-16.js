// @id p2-16
// @title 電気力線と等電位線：電荷を動かす
// @vol 物理4
// @from 物理 電-1 ⑤⑩（p4-01:476・857）、電-2 ⑦（p4-02:509）
'use strict';
// 記号は本と同じ：電場 E〔N/C〕、電位 φ〔V〕、k＝8.99×10⁹、+1 nC を (−0.1, 0)、−1 nC を (0.1, 0)〔m〕
const K16 = 8.99e9;
const QOPT = [[-1, '−1 nC'], [1, '+1 nC'], [-2, '−2 nC'], [2, '+2 nC']];
A.item({
  id: 'p2-16', title: '電気力線と等電位線：電荷を動かす',
  from: '物理 第4巻 電-1 ⑤「電気力線」・⑩「電場の地図」、電-2 ⑦「電気力線と等電位面は垂直」の図から',
  W: 880, H: 440,
  state: { q1: 1, q2: -1, x1: -0.1, y1: 0, x2: 0.1, y2: 0, px: 0, py: 0.06, eq: true, mode: 'free', sgn: 1, tx: -0.05, ty: 0.06, mx: -0.05, my: 0.06, vx: 0, vy: 0, run: false, path: [] },
  scenes: [
    {
      key: 'rikisen', label: '① 電気力線と等電位線',
      lead: '+1 nC と −1 nC の電気力線（矢じりは電場の向き）と等電位線です。電荷（＋・−）や点 P をドラッグしてみましょう。',
      note: '正の電荷から出た線は負の電荷に入り、線がこみ合う所ほど電場が強くなります。どこでも、**電気力線と等電位線は垂直**に交わります。正と正にすると、線は相手をさけるように外へ曲がり、まん中では電場が 0 になります。',
      miss: '電位が 0 でも、電場が 0 とはかぎりません（正と負のまん中は、電位 0 でも 1798 N/C）。反対に、正と正のまん中は電場が 0 でも、電位は 0 ではありません。電位は「高さ」、電場は「坂の急さ」です。',
      legend: [['電気力線（矢じりは電場の向き）', { color: 'a', width: 2 }], ['等電位線', { color: 'c', style: 'dash' }], ['点 P の電場', { color: 'd', width: 3 }], ['点 P', { color: 'd', shape: 'diamond', noline: true }]],
      controls: [
        { seg: 'q2', label: '右の電荷', options: QOPT },
        { check: 'eq', label: '等電位線', text: '等電位線（20 V ごと）を見せる' }
      ],
      draw(cv, st) { drawField(cv, st, { lines: true, eq: st.eq, probe: true }); },
      drag: dragCharges(true),
      readout: st => { const [ex, ey, ph] = field(st, st.px, st.py); return `P（${A.num(st.px, 3)}, ${A.num(st.py, 3)}）m：電場の強さ <b>${A.num(Math.hypot(ex, ey), 0)} N/C</b>、電位 <b>${A.num(ph, 1)} V</b>`; }
    },
    {
      key: 'chizu', label: '② 電場の地図',
      lead: '0.05 m ごとの点で、電場の矢印をかいた地図です。電荷をドラッグすると、地図がかき直されます。',
      note: '矢印の向きが電場の向きです。長さは、強さそのものではなく、強さの3乗根に比例させました（そうしないと、遠くの矢印が見えなくなるため）。2つの電荷の電場は、**矢印として**たし合わせます（重ね合わせ）。',
      miss: '電場を大きさだけでたしてはいけません。まん中 (0, 0) では、+1 nC の電場も −1 nC の電場も右向きなので、899 ＋ 899 ＝ 1798 N/C になりますが、ほかの点では向きがちがうので、成分に分けてたします。',
      legend: [['電場の矢印（長さは強さの3乗根）', { color: 'a', width: 2 }], ['うすい線：電気力線', { color: 'a', width: 1 }]],
      controls: [{ seg: 'q2', label: '右の電荷', options: QOPT }],
      draw(cv, st) { drawField(cv, st, { map: true, lines: true, faint: true }); },
      drag: dragCharges(false),
      readout: st => { const [ex, ey] = field(st, 0, 0); return `まん中 (0, 0) の電場：$E_x$ ＝ ${A.num(ex, 0)} N/C、$E_y$ ＝ ${A.num(ey, 0)} N/C`; }
    },
    {
      key: 'ugoki', label: '③ 電荷を放す',
      lead: 'ためしの電荷を、止まった状態で放します（▶）。電気力線にそって動くでしょうか。放す場所は、ドラッグで決められます。',
      note: '電気力線の向きは、その点の**加速度**の向きです。動き出した電荷は勢いがつくので、曲がった力線からははずれていきます。力線にそって動くのは、まっすぐな力線の上か、水の中のちりのように、すぐに止められて、とても遅く動くときだけです。',
      miss: '負の電荷（電子）は、電場と**反対**の向きに力を受けます（$\\vec F=q\\vec E$ で $q<0$）。「負の電荷」に切りかえてたしかめましょう。',
      legend: [['放した所を通る電気力線', { color: 'a', style: 'dash', width: 2 }], ['ためしの電荷の道すじ', { color: 'b', width: 3 }], ['ためしの電荷', { color: 'b', shape: 'circle', noline: true }]],
      controls: [
        { seg: 'mode', label: 'まわり', options: [['free', '真空（止めるものがない）'], ['water', '水の中（すぐ止められる）']], on: resetT },
        { seg: 'sgn', label: 'ためしの電荷', options: [[1, '正'], [-1, '負']], on: resetT }
      ],
      init: resetT,
      step: stepT,
      draw(cv, st) { drawField(cv, st, { lines: true, faint: true, test: true }); },
      drag: { hit(st, x, y) { const v = fView(st.__cv); const [px, py] = v.P([st.tx, st.ty]); return A.near(x, y, px, py, 26) ? 'T' : null; }, move(st, x, y) { const v = fView(st.__cv); const p = v.inv(x, y); st.mx = st.tx = p[0]; st.my = st.ty = p[1]; resetT(st); } },
      readout: st => { const [ex, ey] = field(st, st.tx, st.ty); return `ためしの電荷のいる所の電場：<b>${A.num(Math.hypot(ex, ey), 0)} N/C</b>　（時間は見やすく縮めてある）`; }
    }
  ]
});

function charges(st) { return [[st.q1 * 1e-9, st.x1, st.y1], [st.q2 * 1e-9, st.x2, st.y2]]; }
function field(st, x, y) {
  let ex = 0, ey = 0, ph = 0;
  for (const [q, cx, cy] of charges(st)) { const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, r = Math.sqrt(r2); if (r < 1e-6) continue; const e = K16 * q / r2; ex += e * dx / r; ey += e * dy / r; ph += K16 * q / r; }
  return [ex, ey, ph];
}
function fView(cv) { return cv.view({ x0: -0.3, x1: 0.3, y0: -0.18, y1: 0.18, box: [30, 14, 830, 400], equal: true }); }
// 電気力線を1本たどる（電場の向きに少しずつ進む。dir＝−1 で逆向き）
function trace(st, x, y, dir) {
  const pts = [[x, y]], cs = charges(st), h = 0.0025;
  const f = (p) => { const [ex, ey] = field(st, p[0], p[1]); const e = Math.hypot(ex, ey) || 1; return [dir * ex / e, dir * ey / e]; };
  let p = [x, y];
  for (let k = 0; k < 700; k++) {
    p = A.rk4((t, q) => f(q), 0, p, h);
    pts.push(p);
    if (Math.abs(p[0]) > 0.45 || Math.abs(p[1]) > 0.35) break;
    if (cs.some(([q, cx, cy]) => Math.hypot(p[0] - cx, p[1] - cy) < 0.006)) break;
  }
  return pts;
}
function fieldLines(st) {
  const cs = charges(st), pos = cs.filter(c => c[0] > 0), neg = cs.filter(c => c[0] < 0);
  const sp = pos.reduce((s, c) => s + c[0], 0), sn = -neg.reduce((s, c) => s + c[0], 0);
  const from = sp >= sn ? pos : neg, dir = sp >= sn ? 1 : -1, out = [];
  for (const [q, cx, cy] of from) {
    const n = Math.round(Math.abs(q) * 1e9 * 14);
    for (let k = 0; k < n; k++) { const a = (k + 0.5) * 2 * Math.PI / n; out.push(trace(st, cx + 0.007 * Math.cos(a), cy + 0.007 * Math.sin(a), dir)); }
  }
  return { lines: out, dir };
}
// 等電位線：格子で φ を計算し、四角を1つずつ見て線分を作り、つないで折れ線にする
function contours(st, v, levels) {
  const nx = 150, ny = 92, x0 = v.x0, y0 = v.y0, dx = (v.x1 - v.x0) / nx, dy = (v.y1 - v.y0) / ny, P = [];
  for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(field(st, x0 + i * dx, y0 + j * dy)[2]); P.push(row); }
  const res = [];
  for (const L of levels) {
    const segs = new Map(), add = (a, b) => { (segs.get(a.k) || segs.set(a.k, []).get(a.k)).push([a, b]); (segs.get(b.k) || segs.set(b.k, []).get(b.k)).push([b, a]); };
    const pt = (i, j, h) => { // h：横の辺（i,j)-(i+1,j)、たて：(i,j)-(i,j+1)
      const a = P[j][i], b = h ? P[j][i + 1] : P[j + 1][i], t = (L - a) / (b - a);
      return { k: (h ? 'h' : 'v') + i + ',' + j, x: x0 + (i + (h ? t : 0)) * dx, y: y0 + (j + (h ? 0 : t)) * dy };
    };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const c = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]];
      if (c.some(z => Math.abs(z) > 2000)) continue;
      const e = [];
      if ((c[0] - L) * (c[1] - L) < 0) e.push(pt(i, j, true));
      if ((c[1] - L) * (c[2] - L) < 0) e.push(pt(i + 1, j, false));
      if ((c[3] - L) * (c[2] - L) < 0) e.push(pt(i, j + 1, true));
      if ((c[0] - L) * (c[3] - L) < 0) e.push(pt(i, j, false));
      if (e.length === 2) add(e[0], e[1]); else if (e.length === 4) { add(e[0], e[1]); add(e[2], e[3]); }
    }
    const used = new Set();
    for (const list of segs.values()) for (const [a0, b0] of list) {
      const id = a0.k < b0.k ? a0.k + '|' + b0.k : b0.k + '|' + a0.k; if (used.has(id)) continue;
      used.add(id); const line = [a0, b0];
      for (let end = 0; end < 2; end++) {   // 両はしへのばす
        let cur = end ? line[0] : line[line.length - 1];
        for (;;) { const nx2 = (segs.get(cur.k) || []).find(([p, q]) => { const id2 = p.k < q.k ? p.k + '|' + q.k : q.k + '|' + p.k; return !used.has(id2); }); if (!nx2) break; const [p, q] = nx2; used.add(p.k < q.k ? p.k + '|' + q.k : q.k + '|' + p.k); if (end) line.unshift(q); else line.push(q); cur = q; }
      }
      res.push({ L, pts: line.map(p => [p.x, p.y]) });
    }
  }
  return res;
}
function drawField(cv, st, o) {
  st.__cv = cv;
  const v = fView(cv);
  v.axes({ xt: A.range(-0.3, 0.3, 0.1), yt: [-0.1, 0.1], xfmt: x => A.num(x, 1), yfmt: y => A.num(y, 1) });
  cv.text('x（m）', v.X(0.3) - 4, v.Y(0) + 32, { size: 14, color: 'sub', align: 'right' });
  if (o.eq) {
    const lv = A.range(-300, 300, 20);
    v.clip(() => { for (const c of contours(st, v, lv)) v.line(c.pts, { color: 'c', width: c.L === 0 ? 2.2 : 1.4, style: 'dash' }); });
  }
  if (o.lines) {
    const { lines, dir } = fieldLines(st);
    v.clip(() => {
      for (const pts of lines) {
        v.line(pts, { color: 'a', width: o.faint ? 1 : 2, alpha: o.faint ? 0.45 : 1 });
        if (!o.faint && pts.length > 30) { const m = Math.min(pts.length - 10, 40), a = pts[m + (dir > 0 ? 0 : 8)], b = pts[m + (dir > 0 ? 8 : 0)]; if (b) v.arrow(a[0], a[1], b[0], b[1], { color: 'a', width: 2, head: 11 }); }
      }
    });
  }
  if (o.map) {
    for (let x = -0.25; x <= 0.2501; x += 0.05) for (let y = -0.15; y <= 0.1501; y += 0.05) {
      const [ex, ey] = field(st, x, y), e = Math.hypot(ex, ey); if (e < 1e-6) continue;
      const len = Math.min(0.045, 0.0042 * Math.cbrt(e));
      const ux = ex / e * len, uy = ey / e * len;
      v.arrow(x - ux / 2, y - uy / 2, x + ux / 2, y + uy / 2, { color: 'a', width: 2, head: 9 });
    }
  }
  if (o.test) drawTest(cv, st, v);
  // 電荷
  for (const [q, cx, cy] of charges(st)) {
    const r = 13 + 3 * Math.abs(q * 1e9);
    cv.circle(v.X(cx), v.Y(cy), r, { fill: q > 0 ? 'b' : 'a', alpha: 1, color: 'ink', width: 1.5 });
    cv.text(q > 0 ? '+' : '−', v.X(cx), v.Y(cy) + 1, { size: 20, bold: true, align: 'center', color: 'bg' });
    cv.text((q > 0 ? '+' : '−') + A.num(Math.abs(q * 1e9), 0) + ' nC', v.X(cx), v.Y(cy) + r + 13, { size: 14, align: 'center', bg: true });
  }
  if (o.probe) {
    const [ex, ey] = field(st, st.px, st.py), e = Math.hypot(ex, ey), P = v.P([st.px, st.py]);
    if (e > 1) { const L = Math.min(90, 14 * Math.cbrt(e)); cv.arrow(P[0], P[1], P[0] + ex / e * L, P[1] - ey / e * L, { color: 'd', width: 3.5 }); }
    cv.dot(P[0], P[1], { color: 'd', shape: 'diamond', r: 8 });
    cv.text('P', P[0] - 12, P[1] - 14, { size: 16, bold: true, color: 'd', bg: true });
  }
}
function dragCharges(probe) {
  return {
    hit(st, x, y) {
      const v = fView(st.__cv);
      if (probe && A.near(x, y, v.X(st.px), v.Y(st.py), 22)) return 'P';
      if (A.near(x, y, v.X(st.x1), v.Y(st.y1), 24)) return 1;
      if (A.near(x, y, v.X(st.x2), v.Y(st.y2), 24)) return 2;
      return probe && v.inside(x, y) ? 'P' : null;
    },
    move(st, x, y, api, h) {
      const v = fView(st.__cv), p = v.inv(x, y), X = A.clamp(p[0], -0.28, 0.28), Y = A.clamp(p[1], -0.17, 0.17);
      if (h === 'P') { st.px = X; st.py = Y; } else if (h === 1) { st.x1 = X; st.y1 = Y; } else { st.x2 = X; st.y2 = Y; }
    }
  };
}
// ③ ためしの電荷（質量のある粒）。真空：a＝c E、水の中：v＝μ E（すぐ止められる）
function resetT(st) { st.tx = st.mx; st.ty = st.my; st.vx = 0; st.vy = 0; st.path = [[st.tx, st.ty]]; }
function stepT(st, dt) {
  const cs = charges(st), n = 8, h = dt / n;
  for (let k = 0; k < n; k++) {
    const [ex, ey] = field(st, st.tx, st.ty);
    if (st.mode === 'free') { const c = 4e-5 * st.sgn; st.vx += c * ex * h; st.vy += c * ey * h; }
    else { const mu = 6e-5 * st.sgn, e = Math.hypot(ex, ey), cap = Math.min(1, 1500 / e); st.vx = mu * ex * cap; st.vy = mu * ey * cap; }
    st.tx += st.vx * h; st.ty += st.vy * h;
  }
  st.path.push([st.tx, st.ty]);
  if (st.path.length > 3000) st.path.shift();
  if (Math.abs(st.tx) > 0.32 || Math.abs(st.ty) > 0.2) return false;
  if (cs.some(([q, cx, cy]) => Math.hypot(st.tx - cx, st.ty - cy) < 0.012)) return false;
}
function drawTest(cv, st, v) {
  // 放した点を通る電気力線（両向きにたどる）
  const a = trace(st, st.mx, st.my, 1), b = trace(st, st.mx, st.my, -1);
  v.clip(() => { v.line(a, { color: 'a', width: 2.2, style: 'dash' }); v.line(b, { color: 'a', width: 2.2, style: 'dash' }); v.line(st.path, { color: 'b', width: 3 }); });
  v.dot(st.mx, st.my, { color: 'b', r: 5, open: true });
  v.dot(st.tx, st.ty, { color: 'b', r: 9 });
  v.text(st.sgn > 0 ? '+' : '−', st.tx, st.ty, { size: 15, bold: true, align: 'center', color: 'bg' });
  v.text('放した所', st.mx, st.my + 0.022, { size: 14, align: 'center', bg: true });
}
