// @id m3-14
// @title 傾きの場と木の葉：はじめの状態で1本に決まる
// @vol 数学6
// @from 数学 6-1 ⑥⑦（ch6-01:462・521・547）、6-0 ④（ch6-00:359）、5-18 ③（ch5-18:174）
'use strict';
// 冷めるお湯のルール dT/dt = −0.05(T−20)（部屋 20℃、時刻は分）。ばねは 0.5 kg・8 N/m（d²x/dt² = −16x）。
const rule = T => -0.05 * (T - 20);
const sol = (T0, t0, t) => 20 + (T0 - 20) * Math.exp(-0.05 * (t - t0));
const LEAFC = ['c', 'b', 'a', 'd', 'e'];

A.item({
  id: 'm3-14', title: '傾きの場と木の葉：はじめの状態で1本に決まる',
  from: '数学 第6巻 6-1 ⑥⑦ の図から（6-0 ④、5-18 ③ でも使う）',
  W: 880, H: 440,
  state: { T0: 80, t: 0, C: 80, x0: 0.1, v0: 0.4 },
  scenes: [
    {
      key: 'ba', label: '① 傾きの場と木の葉',
      lead: '短い線は、その点での傾き（ルールの右辺）です。▶ で、80 ℃の点から「木の葉」が線にそって流れます。方眼のどこかをクリック（タップ）すると、そこからも流れます。',
      note: '20 ℃より上では線はどれも右下がりで、上ほど急です（熱いほど速く冷める）。20 ℃の高さの線は横向き、20 ℃より下では右上がりです。**式を解かなくても**、傾きの場をかくだけで、解のようすがわかります。',
      legend: [['その点での傾き $-0.05(T-20)$', { color: 'sub' }], ['木の葉が流れたあと（解のグラフ）', { color: 'c' }], ['木の葉', { color: 'c', shape: 'diamond', noline: true }]],
      init(st) { st.leaves = [{ t0: 0, T0: 80, t: 0 }]; st.pend = null; },
      step(st, dt) { let moving = false; for (const L of st.leaves) if (L.t < 60) { L.t = Math.min(60, L.t + dt * 6); moving = true; } return moving; },
      draw(cv, st) {
        const v = fieldView(cv);
        drawField(cv, v, 1);
        st.leaves.forEach((L, k) => {
          const col = LEAFC[k % LEAFC.length];
          v.plot(t => sol(L.T0, L.t0, t), { x0: L.t0, x1: L.t, color: col, width: 3 });
          v.dot(L.t0, L.T0, { color: col, r: 4, open: true });
          leaf(cv, v, L.t, sol(L.T0, L.t0, L.t), col);
        });
        v.text('部屋 20 ℃', 61, 20, { color: 'sub', size: 15, align: 'left', bg: true });
      },
      drag: {
        hit(st, x, y, api) { return fieldView(api.cv).inside(x, y) ? 'p' : null; },
        move(st, x, y, api) {
          const v = fieldView(api.cv); let [t, T] = v.inv(x, y); t = A.clamp(t, 0, 59); T = A.clamp(T, 0, 92);
          if (st.pend == null) { st.leaves.push({ t0: t, T0: T, t }); if (st.leaves.length > 10) st.leaves.shift(); st.pend = st.leaves.length - 1; }
          else { const L = st.leaves[st.pend]; L.t0 = L.t = t; L.T0 = T; }
        },
        end(st, api) { st.pend = null; api.play(true); }
      },
      readout: st => {
        const L = st.leaves[st.leaves.length - 1]; if (!L) return '';
        const T = sol(L.T0, L.t0, L.t);
        return `新しい木の葉：時刻 ${A.num(L.t, 1)} 分、温度 ${A.num(T, 1)} ℃、その点の傾き $-0.05(T-20)$ ＝ ${A.num(rule(T), 2)} ℃/分`;
      }
    },
    {
      key: 'shoki', label: '② はじめの状態',
      lead: '同じルールでも、出発する温度（はじめの状態）を変えると、ちがう曲線になります。スライダーで、はじめの温度を変えてみましょう。',
      note: '80 ℃なら青、50 ℃ならオレンジ、10 ℃なら緑、20 ℃ならずっと 20 ℃のまま（むらさきの横線）。どれも 20 ℃に近づきます。2本の解の曲線が交わることはありません。**ルール（微分方程式）＋はじめの状態（初期条件）→ 解はただ1つ**です。',
      legend: [['はじめ 80 ℃', { color: 'a' }], ['はじめ 50 ℃', { color: 'b', style: 'dash' }], ['はじめ 20 ℃', { color: 'd', style: 'dashdot' }], ['はじめ 10 ℃', { color: 'c', style: 'dot' }], ['あなたが決めたはじめの温度', { color: 'ink', shape: 'circle' }]],
      controls: [{ range: 'T0', label: 'はじめの温度 $T(0)$', min: 0, max: 90, step: 1, fmt: v => A.num(v, 0) + ' ℃', on: st => { st.t = 0; } }],
      step(st, dt) { st.t += dt * 6; if (st.t >= 60) { st.t = 60; return false; } },
      draw(cv, st) {
        const v = fieldView(cv);
        drawField(cv, v, 0.45);
        const book = [[80, 'a', 'solid'], [50, 'b', 'dash'], [20, 'd', 'dashdot'], [10, 'c', 'dot']];
        for (const [T0, col, sty] of book) { v.plot(t => sol(T0, 0, t), { x0: 0, x1: 60, color: col, style: sty, width: 2.2, alpha: 0.75 }); v.dot(0, T0, { color: col, r: 4 }); }
        v.text('はじめ 80 ℃', 9, 76, { color: 'a', size: 15, bg: true });
        v.text('はじめ 50 ℃', 9, 46, { color: 'b', size: 15, bg: true });
        v.text('はじめ 10 ℃', 9, 7, { color: 'c', size: 15, bg: true });
        v.text('はじめ 20 ℃', 61, 20, { color: 'd', size: 15, bg: true });
        v.plot(t => sol(st.T0, 0, t), { x0: 0, x1: Math.max(0.01, st.t), color: 'ink', width: 3.5 });
        v.dot(0, st.T0, { color: 'ink', r: 6, open: true });
        v.dot(st.t, sol(st.T0, 0, st.t), { color: 'ink', r: 7 });
      },
      readout: st => `はじめ $T(0)=$ ${A.num(st.T0, 0)} ℃ → $T=20${st.T0 >= 20 ? '+' : '-'}${Math.abs(st.T0 - 20)}e^{-0.05t}$　　${A.num(st.t, 0)} 分後：${A.num(sol(st.T0, 0, st.t), 1)} ℃`
    },
    {
      key: 'c', label: '③ 数 C を決める',
      lead: '$f=Ce^{-0.1t}$ は、どれも $f\'=-0.1f$ をみたします。▶ で $C$ が変わります。「$t=0$ で 80」をみたすのは、どの曲線でしょう。',
      note: '$t=0$ を入れると $f(0)=Ce^{0}=C$。だから $C$ は、ちょうど「はじめの値」です。「$t=0$ で 80」と決めると、オレンジの点を通る1本（$C=80$）だけが選ばれます。',
      legend: [['$f=Ce^{-0.1t}$（いろいろな $C$）', { color: 'sub' }], ['いまの $C$ の曲線', { color: 'a' }], ['$t=0$ で 80 の点', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'C', label: '数 $C$', min: 10, max: 130, step: 1, d: 0 }],
      init(st) { st.C = 30; st.dir = 1; },
      step(st, dt) { st.C += st.dir * dt * 25; if (st.C >= 130) { st.C = 130; st.dir = -1; } if (st.C <= 10) { st.C = 10; st.dir = 1; } },
      draw(cv, st) {
        const v = cv.view({ x0: 0, x1: 13.5, y0: 0, y1: 140, box: [70, 20, 700, 370] });
        v.axes({ xt: [0, 5, 10], yt: [40, 80, 120], xl: 't', yl: 'f' });
        for (let C = 10; C <= 130; C += 10) v.plot(t => C * Math.exp(-0.1 * t), { x0: 0, x1: 12.5, color: 'sub', width: [40, 80, 120].includes(C) ? 1.8 : 0.8, alpha: [40, 80, 120].includes(C) ? 0.9 : 0.4 });
        for (const C of [40, 80, 120]) v.text('C = ' + C, 12.7, C * Math.exp(-1.25), { color: 'sub', size: 15 });
        const hit = Math.abs(st.C - 80) < 0.5;
        v.plot(t => st.C * Math.exp(-0.1 * t), { x0: 0, x1: 12.5, color: 'a', width: 4 });
        v.dot(0, st.C, { color: 'a', r: 6 });
        v.dot(0, 80, { color: 'b', shape: 'diamond', r: 8 });
        v.text('t = 0 で 80', 0.4, 88, { color: 'b', size: 15, bg: true });
        cv.text(hit ? 'この1本が選ばれた：f = 80e^(−0.1t)' : 'オレンジの点を通るのは C = 80 の1本だけ', 470, 40, { size: 17, bold: hit, color: hit ? 'b' : 'sub', align: 'center', bg: true });
      },
      readout: st => `$C=$ ${A.num(st.C, 0)}　→　$f(0)=Ce^{0}=C=$ ${A.num(st.C, 0)}${Math.abs(st.C - 80) < 0.5 ? '　<b>「$t=0$ で 80」をみたす</b>' : ''}`
    },
    {
      key: 'bane', label: '④ ばねは2つ要る',
      lead: 'ばね $\\frac{d^2x}{dt^2}=-16x$ では、同じ位置 0.1 m から出発しても、はじめの速度がちがうと、ちがう動きになります。▶ で動かしてみましょう。',
      note: '2回微分の式には、決める数が2つ（$A$ と $B$）あります。だから、**はじめの位置とはじめの速度**の2つの初期条件が必要です（5-18）。答えは $x=\\frac{v_0}{4}\\sin4t+x_0\\cos4t$。',
      miss: '「はじめの位置だけ決めれば、動きが決まる」と考えがちです。1回微分のルール（お湯）は1つでよいのですが、2回微分のルール（ばね）は、位置と速度の2つが要ります。',
      legend: [['静かにはなした（速度 0）', { color: 'a', style: 'dash' }], ['はじめの速度 $v_0$ で押し出した', { color: 'b' }], ['いまのおもり', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'x0', label: 'はじめの位置 $x_0$〔m〕', min: -0.1, max: 0.1, step: 0.01, d: 2, on: st => { st.t = 0; } }, { range: 'v0', label: 'はじめの速度 $v_0$〔m/s〕', min: -0.4, max: 0.4, step: 0.05, d: 2, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.7; if (st.t > 3.3) { st.t = 3.3; return false; } },
      draw(cv, st) {
        const xs = t => st.x0 * Math.cos(4 * t) + st.v0 / 4 * Math.sin(4 * t);
        const x = xs(st.t), E = 380, S = 900;
        // 台車とばね（上）
        const yb = 110;
        wall(cv, 60, 40, yb);
        cv.line([[60, yb], [820, yb]], { color: 'ink', width: 2 });
        cv.line([[E, 30], [E, yb + 6]], { color: 'sub', style: 'dash', width: 1.2 });
        cv.text('つり合いの位置', E, 22, { size: 15, color: 'sub', align: 'center' });
        const cx = E + x * S, w = 70;
        spring(cv, 60, cx - w / 2, yb - 30, { n: 9 });
        cv.rect(cx - w / 2, yb - 56, w, 50, { fill: 'b', alpha: 0.3, color: 'b', width: 2 });
        cv.text('0.5 kg', cx, yb - 31, { size: 15, align: 'center' });
        cv.circle(cx - 20, yb - 3, 3, { color: 'ink', width: 1.5 }); cv.circle(cx + 20, yb - 3, 3, { color: 'ink', width: 1.5 });
        // グラフ（下）
        const v = cv.view({ x0: 0, x1: 3.4, y0: -0.19, y1: 0.19, box: [80, 150, 760, 270] });
        v.axes({ xt: [1, 2, 3], yt: [-0.1, 0.1], xl: 't（s）', yl: 'x（m）' });
        v.plot(t => st.x0 * Math.cos(4 * t), { x0: 0, x1: 3.3, color: 'a', style: 'dash', width: 2.2 });
        v.plot(xs, { x0: 0, x1: Math.max(0.01, st.t), color: 'b', width: 3.5 });
        v.dot(0, st.x0, { color: 'ink', r: 5 });
        v.dot(st.t, x, { color: 'b', shape: 'square', r: 6 });
      },
      readout: st => `$x_0=$ ${A.num(st.x0, 2)} m、$v_0=$ ${A.num(st.v0, 2)} m/s　→　$x=$ ${A.num(st.v0 / 4, 3)} $\\sin4t$ ＋ ${A.num(st.x0, 2)} $\\cos4t$　　いちばん遠く：${A.num(Math.hypot(st.x0, st.v0 / 4), 3)} m`
    }
  ]
});

function fieldView(cv) { return cv.view({ x0: -3, x1: 66, y0: -6, y1: 95, box: [80, 20, 730, 370] }); }
// 6分ごと・10℃ごとの点に、傾きの短い線（本の図と同じ点）
function drawField(cv, v, alpha) {
  v.axes({ xt: A.range(0, 60, 10), yt: A.range(0, 90, 10), ax: -6, ay: -3, zero: true, xl: '時刻 t（分）', yl: '温度 T（℃）' });
  cv.line([[v.X(0), v.Y(20)], [v.X(64), v.Y(20)]], { color: 'sub', style: 'dot', width: 1.5 });
  for (let t = 0; t <= 60; t += 6) for (let T = 0; T <= 90; T += 10) {
    const s = rule(T), dx = v.sx, dy = -v.sy * s, L = Math.hypot(dx, dy), h = 11;
    const px = v.X(t), py = v.Y(T);
    cv.line([[px - dx / L * h, py - dy / L * h], [px + dx / L * h, py + dy / L * h]], { color: 'sub', width: 1.8, alpha });
  }
}
// 木の葉（流れの向きにかたむけた葉の形）
function leaf(cv, v, t, T, col) {
  const g = cv.g, px = v.X(t), py = v.Y(T), ang = Math.atan2(-v.sy * rule(T), v.sx);
  g.save(); g.translate(px, py); g.rotate(ang);
  g.beginPath(); g.moveTo(-13, 0); g.quadraticCurveTo(0, -9, 13, 0); g.quadraticCurveTo(0, 9, -13, 0); g.closePath();
  g.fillStyle = A.color(col); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; g.strokeStyle = A.color('ink'); g.lineWidth = 1.2; g.stroke();
  g.beginPath(); g.moveTo(-13, 0); g.lineTo(11, 0); g.stroke();
  g.restore();
}
function wall(cv, x, y0, y1) { cv.line([[x, y0], [x, y1]], { color: 'ink', width: 2.5 }); for (let y = y0; y < y1; y += 10) cv.line([[x, y], [x - 8, y + 8]], { color: 'sub', width: 1.2 }); }
// 横向きのばね（キャンバスの座標）
function spring(cv, x1, x2, y, o = {}) {
  const n = o.n || 10, amp = o.amp || 9, lead = Math.min(12, (x2 - x1) * 0.12), L = x2 - x1 - 2 * lead, pts = [[x1, y], [x1 + lead, y]];
  for (let k = 0; k < 2 * n; k++) pts.push([x1 + lead + L * (k + 0.5) / (2 * n), y + (k % 2 ? amp : -amp)]);
  pts.push([x2 - lead, y], [x2, y]);
  cv.line(pts, { color: o.color || 'ink', width: o.width || 2 });
}
