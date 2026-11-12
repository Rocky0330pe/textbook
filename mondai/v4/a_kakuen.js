/* 問題集 第4巻『形と向き』　第1部 角と円（わざ 4-01〜4-14、4-91）　組 a
 * 書き方は v4/README.md（第4巻の手引き）と v2/README.md。文は教科書 第4巻と同じ：ルビなし・常用漢字まで、分かち書きはしない。式は $…$。
 * 角は度（30^{\circ}）。答えは √・π を残した形。答えが式1つでないもの（ことば・座標・2つの角）は verify で、別の道すじで計算し直す。
 * 図（K-2）：ステップ1・2 は図なし。図は 4-01・4-02・4-06・4-13・4-14 のステップ3とわなに出す（fig）。点の位置は問題の数から計算する。
 * わなは「見わけよう」に図なしで出るので、文だけで解けるように書く（図は助け）。
 * わなは、同じ部のほかのわざで楽にならないものにする。当たるときは、easy に行き先を書いて also に入れる（dest。第29回 H-1）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const D = v => `${fmt(v)}^{\\circ}`;                              // 65^{\circ}
  const MD = v => `$${D(v)}$`;
  const ANG = t => `\\angle\\mathrm{${t}}`;                         // \angle\mathrm{ABC}
  const TRI = t => `\\triangle\\mathrm{${t}}`;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const tq = q => (q[1] === 1 ? `${q[0]}` : `\\frac{${q[0]}}{${q[1]}}`);
  // π の有理数倍（[n, d]）を TeX に：2\pi、\frac{\pi}{3}、\frac{5\pi}{6}
  const piT = q => { const [n, d] = q; if (n === 0) return '0'; const top = (n === 1 ? '' : n === -1 ? '-' : n) + '\\pi'; return d === 1 ? top : `\\frac{${top}}{${d}}`; };
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const KAN = '〇一二三四五六七八九';
  const kan = n => (n < 10 ? KAN[n] : (Math.floor(n / 10) > 1 ? KAN[Math.floor(n / 10)] : '') + '十' + (n % 10 ? KAN[n % 10] : ''));   // 12 → 十二
  const unkan = s => { const m = /^(.?)十(.?)$/.exec(s); if (!m) return KAN.indexOf(s); return (m[1] ? KAN.indexOf(m[1]) : 1) * 10 + (m[2] ? KAN.indexOf(m[2]) : 0); };
  // 数と単位は1つの式に（R1-21）。欄のあとの単位も同じ式に入れて、別の行にしない（R1-22）
  const CM = v => `$${v}\\,\\mathrm{cm}$`;
  const BOX = u => `$□\\,\\mathrm{${u}}$`;
  // 正多角形の名前（正四角形は正方形。R1-28）
  const SEI = n => (n === 4 ? '正方形' : `正${kan(n)}角形`);
  // π の小数倍：1\pi は \pi に（R1-27）
  const piC = v => (+fmt(v) === 1 ? '\\pi' : `${fmt(v)}\\pi`);

  // ---------------------------------------------------------------- 図の部品（点は [x, y]、角は度）
  const rad = d => d * Math.PI / 180;
  const at = (deg, r = 1, c = [0, 0]) => [c[0] + r * Math.cos(rad(deg)), c[1] + r * Math.sin(rad(deg))];
  const plus = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const minus = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const times = (p, k) => [p[0] * k, p[1] * k];
  // 角 ABC（B が頂点）の大きさ（0〜180°）
  const angAt = (A, B, C) => { const u = minus(A, B), v = minus(C, B); const c = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v)); return Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI; };
  const rot = (p, deg, c = [0, 0]) => { const d = minus(p, c), cs = Math.cos(rad(deg)), sn = Math.sin(rad(deg)); return [c[0] + d[0] * cs - d[1] * sn, c[1] + d[0] * sn + d[1] * cs]; };
  // 向き（ベクトル）に近いラベルの向き n・ne・e…
  const ANCH = ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'];
  const anch = v => ANCH[Math.round(((Math.atan2(v[1], v[0]) * 180 / Math.PI + 360) % 360) / 45) % 8];
  // 2本の直線の交わる点：P1 + t d1 と P2 + u d2
  function inter(P1, d1, P2, d2) {
    const det = d2[0] * d1[1] - d1[0] * d2[1], w = minus(P2, P1);
    const t = (d2[0] * w[1] - w[0] * d2[1]) / det;
    return plus(P1, times(d1, t));
  }
  const LX = '$x$';
  const FS = 4.0;   // 図の1単位の mm（本の1列。見開きに入る高さ）
  const ELL = 'ℓ';   // 直線 ℓ のラベル（図の SVG の字の表に \ell がないので、字そのものを書く）
  // 字のはば（単位）。core.js の figBox と同じ見つもり（字の大きさ 3.4 mm、数字・ローマ字は 0.6 字ぶん）
  const FONT = 3.4;
  const textW = (t, s = FS) => [...String(t).replace(/\$/g, '').replace(/\\(?:mathrm|text)\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_ ]/g, '')].reduce((a, ch) => a + (/[　-鿿]/.test(ch) ? 1 : 0.6), 0) * FONT / s;
  const unitV = v => { const L = Math.hypot(...v) || 1; return [v[0] / L, v[1] / L]; };
  const bisect = (A, B, C) => unitV(plus(unitV(minus(A, B)), unitV(minus(C, B))));
  // 線分 PQ が箱 b（[x0, y0, x1, y1]、まわりを e だけ小さくした箱）を通るか
  function segBox(P, Q, b, e = 0.06) {
    let t0 = 0, t1 = 1;
    const dx = Q[0] - P[0], dy = Q[1] - P[1];
    for (const [pp, qq] of [[-dx, P[0] - (b[0] + e)], [dx, (b[2] - e) - P[0]], [-dy, P[1] - (b[1] + e)], [dy, (b[3] - e) - P[1]]]) {
      if (pp === 0) { if (qq < 0) return false; continue; }
      const t = qq / pp;
      if (pp < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return t0 < t1;
  }
  // 角のしるし。小さい角ほど、弧を大きくして文字を線からはなす。文字は、字のはばの分だけ弧からはなし（弧に字がかからない）、
  // 角の2本の線にかからない所まで、二等分線にそって外へ出す
  const markR = a => (a < 40 ? 1.3 : a < 60 ? 1.0 : a < 90 ? 0.75 : 0.6);
  function mark(A, B, C, t, r) {
    r = r || markR(angAt(A, B, C));
    const m = bisect(A, B, C), w = textW(t) / 2, h = 0.4 * FONT / FS;
    const ra = plus(B, times(unitV(minus(A, B)), 20)), rc = plus(B, times(unitV(minus(C, B)), 20));
    let d = 0.3 + w * Math.abs(m[0]) + h * Math.abs(m[1]);
    for (let k = 0; k < 40; k++, d += 0.05) {
      const c = plus(B, times(m, r + d)), b = [c[0] - w, c[1] - h, c[0] + w, c[1] + h];
      if (!segBox(B, ra, b, -0.08) && !segBox(B, rc, b, -0.08)) break;
    }
    return ['angle', A, B, C, t, r, 1, +d.toFixed(3)];
  }
  // 角のしるしの文字の位置（core.js と同じ：頂点から、弧の半径＋距離（ふつう 0.75）だけ二等分線の向きへ）
  const markPos = it => plus(it[2], times(bisect(it[1], it[2], it[3]), it[5] + (it[7] != null ? it[7] : 0.75)));
  const segDist = (p, a, b) => { const ab = minus(b, a), t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return Math.hypot(p[0] - a[0] - t * ab[0], p[1] - a[1] - t * ab[1]); };
  // 図の字の重なりを見る（第36回 N-6）：字の箱（ラベル・角の文字）どうし、字の箱と線・円・角の弧・点。重なれば、そのわけを返す（なければ ''）
  const LANCH = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.8, 0.8], nw: [-0.8, 0.8], se: [0.8, -0.8], sw: [-0.8, -0.8], c: [0, 0] };
  function labBoxes(it, s) {
    const u = FONT / s, v = LANCH[it[3] || 'c'], w = textW(it[2], s), P = it[1], sep = 1.5 * 0.3528 / s, h = 0.8 * u;
    const cx = P[0] + v[0] * 0.75 * u, cy = P[1] + v[1] * 0.75 * u, L = v[0] > 0.3 ? cx : v[0] < -0.3 ? cx - w : cx - w / 2;
    const tx = v[0] > 0.3 ? P[0] + sep : v[0] < -0.3 ? P[0] - sep - w : P[0] - w / 2, ty = v[1] > 0.3 ? P[1] + sep : v[1] < -0.3 ? P[1] - sep - h : P[1] - h / 2;
    return [[L, cy - 0.4 * u, L + w, cy + 0.4 * u, it[2]], [tx, ty, tx + w, ty + h, it[2]]];
  }
  function figClash(fig) {
    const s = fig.s || 5, u = FONT / s, boxes = [], segs = [], circles = [], pts = [];
    for (const it of fig.items) {
      const k = it[0];
      if (k === 'label' && it[2]) { const id = boxes.length; labBoxes(it, s).forEach(b => boxes.push(b.concat(id))); }
      else if (k === 'angle') {
        const [, A, B, C, t, r] = it, m = bisect(A, B, C), half = rad(angAt(A, B, C)) / 2, mid = Math.atan2(m[1], m[0]);
        for (let j = 0; j <= 12; j++) { const th = mid - half + 2 * half * j / 12; pts.push([B[0] + r * Math.cos(th), B[1] + r * Math.sin(th)]); }
        if (t) { const c = markPos(it), w = textW(t, s); boxes.push([c[0] - w / 2, c[1] - 0.4 * u, c[0] + w / 2, c[1] + 0.4 * u, t, boxes.length]); }
      } else if (k === 'seg') segs.push([it[1], it[2]]);
      else if (k === 'poly' || k === 'path') { const ps = it[1]; for (let i = 0; i + 1 < ps.length; i++) segs.push([ps[i], ps[i + 1]]); if (k === 'poly') segs.push([ps[ps.length - 1], ps[0]]); }
      else if (k === 'circle') circles.push([it[1], it[2]]);
      else if (k === 'dot') pts.push(it[1]);
      else if (k === 'right') { const [, A, B, C, q] = it, a = times(unitV(minus(A, B)), q), c = times(unitV(minus(C, B)), q); segs.push([plus(B, a), plus(plus(B, a), c)], [plus(plus(B, a), c), plus(B, c)]); }
    }
    const e = 0.06, inB = (p, b) => p[0] > b[0] + e && p[0] < b[2] - e && p[1] > b[1] + e && p[1] < b[3] - e;
    const segHit = (P, Q, b) => segBox(P, Q, b, e);
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      for (let j = i + 1; j < boxes.length; j++) { const c = boxes[j], g = 0.15; if (c[5] === b[5]) continue; if (b[0] < c[2] + g && c[0] < b[2] + g && b[1] < c[3] + g && c[1] < b[3] + g) return `字「${b[4]}」と字「${c[4]}」`; }
      for (const [P, Q] of segs) if (segHit(P, Q, b)) return `字「${b[4]}」と線`;
      for (const [C, R] of circles) {
        const nx = Math.max(b[0], Math.min(C[0], b[2])), ny = Math.max(b[1], Math.min(C[1], b[3])), near = Math.hypot(nx - C[0], ny - C[1]);
        const far = Math.max(...[[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(p => Math.hypot(p[0] - C[0], p[1] - C[1])));
        if (near < R - e && far > R + e) return `字「${b[4]}」と円`;
      }
      for (const p of pts) if (inB(p, b)) return `字「${b[4]}」と弧・点`;
    }
    return '';
  }
  // 点 Pt のラベルを、線分（segs）と角の文字（marks）からいちばんはなれる向きに置く
  function freeAnch(Pt, segs, marks) {
    const pos = marks.map(markPos);
    let best = 'n', bd = -1;
    for (const [k, v] of [['e', [1, 0]], ['ne', [0.8, 0.8]], ['n', [0, 1]], ['nw', [-0.8, 0.8]], ['w', [-1, 0]], ['sw', [-0.8, -0.8]], ['s', [0, -1]], ['se', [0.8, -0.8]]]) {
      const c = plus(Pt, times(v, 0.7));
      const d = Math.min(...segs.map(([a, b]) => segDist(c, a, b)), ...pos.map(q => Math.hypot(c[0] - q[0], c[1] - q[1]) * 0.8));
      if (d > bd) { bd = d; best = k; }
    }
    return best;
  }
  // 図を作る：ラベルの字のはばは、エンジンの図の大きさ（figBox）が数える。角の文字は数えないので、
  // 文字の位置（中身のないラベル）を足して、図の大きさに入れる
  function edge(items) {
    const out = items.slice();
    for (const it of items) if (it[0] === 'angle' && it[4]) { const c = markPos(it), w = textW(it[4]) / 2, h = 0.4 * FONT / FS; out.push(['label', [c[0] - w, c[1] - h], '', 'c'], ['label', [c[0] + w, c[1] + h], '', 'c']); }
    return out;
  }
  // 円の図：中心Oのラベルを、線と角の文字から空いている向きに置きなおす
  function placeO(items) {
    const segs = [], marks = items.filter(it => it[0] === 'angle');
    for (const it of items) {
      if (it[0] === 'seg') segs.push([it[1], it[2]]);
      if (it[0] === 'path' || it[0] === 'poly') { const ps = it[1]; for (let i = 0; i + 1 < ps.length; i++) segs.push([ps[i], ps[i + 1]]); if (it[0] === 'poly') segs.push([ps[ps.length - 1], ps[0]]); }
    }
    return items.map(it => (it[0] === 'label' && it[2] === 'O' ? ['label', it[1], 'O', freeAnch(it[1], segs, marks)] : it));
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  const givenAngles = q => [...q.matchAll(/\\angle\\mathrm\{(\w{1,3})\}=/g)].map(m => (m[1].length === 3 ? m[1][1] : m[1]));

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // 行き先：同じ部の fits が当たるわざと、to（fits では見ぬけない行き先）。どれもなければ「わざなし」（第36回 N-3）
  function dest(p, self, why, to) {
    const q = M.plain(p.q);
    const also = M.list(4).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 1 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    }).concat((to || []).filter(id => id !== self)).filter((id, i, a) => a.indexOf(id) === i).sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 4-01 平行線の角
  // 図：平行な2直線 ℓ（上）と m（下）、交わる直線 n。交わる点 P（ℓ の上）と Q（m の上）のまわりの4つの角（k＝0 右上、1 左上、2 左下、3 右下）
  // tilt：m のかたむき（わなで、平行でないとき）
  function fig401(theta, marks, tilt = 0) {
    const W = 9, h = 2.2, C0 = [4.5, h / 2], u = at(theta);
    const P = inter(C0, u, [0, h], [1, 0]), Qp = inter(C0, u, [4.5, 0], at(tilt));
    const mY = x => (x - 4.5) * Math.tan(rad(tilt));
    const rays = X => (X === 'P' ? [0, theta, 180, theta + 180] : [tilt, theta, tilt + 180, theta + 180]);
    const pt = X => (X === 'P' ? P : Qp);
    const val = (X, k) => { const r = rays(X); return ((r[(k + 1) % 4] - r[k]) % 360 + 360) % 360; };
    const base = [['seg', [0, h], [W, h]], ['seg', [0, mY(0)], [W, mY(W)]], ['label', [W, h], ELL, 'e'], ['label', [W, mY(W)], '$m$', 'e']];
    if (!tilt) { const x0 = P[0] > 4.5 ? 0.6 : 6.4; base.push(['par', [x0, h], [x0 + 2, h], 1], ['par', [x0, 0], [x0 + 2, 0], 1]); }
    for (const [X, k, t] of marks) { const r = rays(X), B = pt(X); base.push(mark(at(r[k], 1, B), B, at(r[(k + 1) % 4], 1, B), t)); }
    // 直線 n のラベルは、角の文字とぶつからないはしに置く（上のはし・下のはし。だめなら線を長くする。R1-18）
    let items;
    for (const [up, ext] of [[true, 0.9], [false, 0.9], [true, 1.7], [false, 1.7]]) {
      const top = plus(P, times(u, up ? ext : 0.9)), bot = minus(Qp, times(u, up ? 0.9 : ext));
      items = base.concat([['seg', bot, top], up ? ['label', top, '$n$', anch(u)] : ['label', bot, '$n$', anch(times(u, -1))]]);
      if (!figClash({ s: FS, items })) break;
    }
    return { fig: { s: FS, items: edge(items) }, val };
  }
  // 2つの角（交わる点と場所）の関係の名前と、等しいかどうか
  function rel401(g, x) {
    const [X1, k1] = g, [X2, k2] = x;
    if (X1 === X2) return (k1 + 2) % 4 === k2 ? ['対頂角', true] : ['一直線', false];
    if (k1 === k2) return ['同位角', true];
    const pk = X1 === 'P' ? k1 : k2, qk = X1 === 'P' ? k2 : k1;
    if ((pk === 2 && qk === 0) || (pk === 3 && qk === 1)) return ['錯角', true];
    if ((k1 + k2) % 2 === 0) return ['同位角で移して、対頂角', true];
    return ['同位角で移して、一直線', false];
  }
  // 錯角は、ℓ と m のあいだの角（R1-36）
  const KAKU = w => (w === '錯角' ? '$\\ell\\parallel m$ と直線 $n$ がつくる角のうち、$\\ell$ と $m$ のあいだの角の1つが ' : '$\\ell\\parallel m$ と直線 $n$ の角の1つが ');
  const NONRIGHT = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145];
  M.add({
    id: '4-01', part: 1, chap: '4-1③', stars: 1,
    title: '平行線の角は、対頂角・同位角・錯角で移す',
    mark: '$\\ell\\parallel m$ と、2本に交わる1本の直線。**等しい角を移して**、求める角の所まで運ぶ。',
    futsu: ['分度器で、角を1つずつはかる。', 'はかるたびに、少しずつずれる。'],
    raku: ['$\\angle a=65^{\\circ}$ なら', '対頂角・同位角・錯角は $65^{\\circ}$', '一直線のとなりは $180^{\\circ}-65^{\\circ}=115^{\\circ}$'],
    why: '対頂角はいつも等しい。$\\ell\\parallel m$ なら、同位角も錯角も等しい。だから、交わる所の角は $65^{\\circ}$ と $115^{\\circ}$ の2種類しかない（4-1③）。',
    caution: '$\\ell$ と $m$ が平行でないときは、同位角・錯角は等しいとはかぎらない。「$\\ell\\parallel m$」を確かめてから使う。',
    counts: { s1: 8, s2: 3, s3: 2, trap: 1 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '20mm' },
    fits(q) { return /\\parallel/.test(q) && !/折れ/.test(q); },
    steps: {
      // ことばで：錯角・同位角・対頂角
      s1(r) {
        const g = r.pick(NONRIGHT), w = r.pick(['錯角', '同位角', '対頂角']);
        return { q: `${KAKU(w)}${MD(g)} のとき、その${w}`, a: MD(g), easy: `（${w}は等しい）${MD(g)}`, key: '401:' + g };
      },
      // 2回移す、一直線、式で書いた角
      s2(r) {
        const k = r.int(0, 2), g = r.pick(NONRIGHT);
        if (k === 0) return { q: `${KAKU('錯角')}${MD(g)} のとき、その錯角のとなりの角`, a: MD(180 - g), easy: `$180^{\\circ}-${D(g)}=${D(180 - g)}$`, key: '401:k0:' + Math.min(g, 180 - g) };
        if (k === 1) return { q: `${KAKU('同位角')}${MD(g)} のとき、その同位角の対頂角`, a: MD(g), easy: `（同位角も対頂角も等しい）${MD(g)}`, key: '401:' + g };
        // 同位角が (ax+b)° と (cx+d)°
        const x = r.pick([10, 15, 20, 25, 30, 35, 40]), a = r.int(2, 4), c = r.intNot(1, 3, v => v >= a), b = r.pick([-10, -5, 0, 5, 10, 15]), d = (a - c) * x + b;
        const ex = (m, n) => `${m === 1 ? '' : m}x${n > 0 ? '+' + n : n < 0 ? n : ''}`;
        if (a * x + b <= 20 || a * x + b >= 160) return null;
        return {
          q: `$\\ell\\parallel m$ のときの同位角が $(${ex(a, b)})^{\\circ}$ と $(${ex(c, d)})^{\\circ}$ のとき、$x=□$`,
          a: `$${x}$`, easy: `$${ex(a, b)}=${ex(c, d)}$ より $x=${x}$`, easyCheck: false,
          verify: () => (a * x + b === c * x + d) || '同位角が等しくならない',
        };
      },
      // 図：平行線と交わる直線。わかっている角と x の場所を、乱数で選ぶ
      s3(r) {
        const g = r.pick(NONRIGHT), G = [r.pick(['P', 'Q']), r.int(0, 3)];
        let X = r.chance(0.75) ? [G[0] === 'P' ? 'Q' : 'P', r.int(0, 3)] : [G[0], (G[1] + r.pick([1, 2, 3])) % 4];
        const theta = G[1] % 2 === 0 ? g : 180 - g;
        const { fig, val } = fig401(theta, [[G[0], G[1], MD(g)], [X[0], X[1], LX]]);
        if (figClash(fig)) return null;
        const [name, same] = rel401(G, X), ans = val(X[0], X[1]);
        return {
          q: '図で、$\\ell\\parallel m$ のとき、$\\angle x$ の大きさ', a: MD(ans), fig, key: `${g}${G}${X}`,
          easy: same ? `（${name}）$\\angle x=${D(g)}$` : `（${name}）$\\angle x=180^{\\circ}-${D(g)}=${D(180 - g)}$`,
          verify: () => (close(val(G[0], G[1]), g) && close(ans, same ? g : 180 - g)) || `図の角 ${val(X[0], X[1])} と答えがちがう`,
        };
      },
      // わな：平行でない2直線（同位角は等しくない。4-1 のまちがえやすいところ）
      trap(r) {
        const g = r.pick([50, 55, 60, 65, 70, 110, 115, 120, 125]), k = r.int(0, 3), tilt = r.pick([-14, -11, 11, 14]);
        const theta = k % 2 === 0 ? g : 180 - g;
        const { fig, val } = fig401(theta, [['P', k, MD(g)], ['Q', k, LX]], tilt);
        if (figClash(fig)) return null;
        const p = {
          q: `$\\ell$ と $m$ は平行でない。$n$ と $\\ell$ の角の1つが ${MD(g)} のとき、同位角 $\\angle x$`,
          a: '決まらない', fig, key: `${g}${k}${tilt}`,
          verify: () => (!close(val('Q', k), g)) || '図の同位角が等しくなっている',
        };
        return dest(p, '4-01', '平行でないので、同位角は等しいとはかぎらない。角の大きさは決まらない');
      },
    },
  });

  // ================================================================ 4-02 外角
  // 三角形の図：内角 aA・aB・aC（度）。B を原点、C を右に置き、高さが 4 をこえないように小さくする。ext：外角をつくる頂点（'B' か 'C'）
  function triPts(aA, aB, aC) {
    const L = 6, c = L * Math.sin(rad(aC)) / Math.sin(rad(aA));
    let A = at(aB, c), B = [0, 0], C = [L, 0];
    const k = Math.min(1, 4 / A[1]);
    return [times(A, k), B, times(C, k)];
  }
  function fig402(aA, aB, aC, ext, labs) {
    const [A, B, C] = triPts(aA, aB, aC);
    const Dp = ext === 'C' ? plus(C, [2.6, 0]) : minus(B, [2.6, 0]);
    const items = [['poly', [A, B, C]], ['seg', ext === 'C' ? C : B, Dp, { dash: true }],
      ['label', A, 'A', 'n'], ['label', B, 'B', ext === 'B' ? 's' : 'sw'], ['label', C, 'C', ext === 'C' ? 's' : 'se']];
    if (labs.A) items.push(mark(B, A, C, labs.A));
    if (labs.B) items.push(mark(A, B, C, labs.B));
    if (labs.C) items.push(mark(A, C, B, labs.C));
    if (labs.ext) items.push(ext === 'C' ? mark(A, C, Dp, labs.ext) : mark(A, B, Dp, labs.ext));
    return { s: FS, items: edge(items), pts: { A, B, C, D: Dp } };
  }
  // 内角を3つ、どれも 25° 以上で選ぶ（5° きざみ）
  function tri3(r) {
    const a = r.int(6, 20) * 5, b = r.int(5, 20) * 5, c = 180 - a - b;
    if (c < 25 || c > 110) return null;
    return [a, b, c];
  }
  // 図にする三角形：底辺 6 に対して高さが 3 以上（平たいと角の文字が重なる）
  // （高すぎると全体を小さくするので、底辺が短くなりすぎないように高さ 5.4 まで）
  const tall = t => { const y = 6 * Math.sin(rad(t[2])) / Math.sin(rad(t[0])) * Math.sin(rad(t[1])); return y >= 3 && y <= 5.4; };
  const VS = ['A', 'B', 'C'];
  // 同じ見開きの重なり（N-2）：2つの内角の組（小さい順）。外角から内角を出す問題（逆の問題）も、同じ組なら同じ key
  const K402 = (a, b) => '402:' + Math.min(a, b) + '/' + Math.max(a, b);
  M.add({
    id: '4-02', part: 1, chap: '4-1④', stars: 1,
    title: '外角は、となりにない2つの内角の和',
    mark: '三角形の2つの内角がわかっていて、**のこりの頂点の外角**を聞かれている。',
    futsu: ['内角の和 $180^{\\circ}$ から、のこりの内角を出す。', '一直線の $180^{\\circ}$ からひいて、外角を出す。'],
    raku: ['$\\angle\\mathrm{A}=50^{\\circ}$、$\\angle\\mathrm{B}=70^{\\circ}$', '$\\angle\\mathrm{C}$ を出さずに、', 'Cの外角は $50^{\\circ}+70^{\\circ}=120^{\\circ}$'],
    why: '外角も $\\angle\\mathrm{A}+\\angle\\mathrm{B}$ も、どちらも「$180^{\\circ}$ から $\\angle\\mathrm{C}$ をひいた角」なので等しい（4-1④）。',
    caution: '外角ととなり合う内角（同じ頂点の内角）は、たさない。$\\angle\\mathrm{C}$ がわかっているなら、Cの外角は $180^{\\circ}-\\angle\\mathrm{C}$。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 1 },
    cols: 1,
    boxw: '16mm',
    fits(q) {
      const m = /頂点(\w)の外角/.exec(q);
      if (!m || !/triangle|三角形/.test(q)) return false;
      return !givenAngles(q).includes(m[1]);
    },
    steps: {
      s1(r) {
        const t = tri3(r); if (!t) return null;
        const e = r.int(0, 2), [i, j] = [0, 1, 2].filter(v => v !== e);
        return { q: `$${TRI('ABC')}$ で、$${ANG(VS[i])}=${D(t[i])}$、$${ANG(VS[j])}=${D(t[j])}$ のとき、頂点${VS[e]}の外角`, a: MD(t[i] + t[j]), easy: `$${D(t[i])}+${D(t[j])}=${D(t[i] + t[j])}$`, key: K402(t[i], t[j]) };
      },
      // 外角から内角を、等しい2つの内角
      s2(r) {
        const t = tri3(r); if (!t) return null;
        const e = r.int(0, 2), [i, j] = r.shuffle([0, 1, 2].filter(v => v !== e)), ext = t[i] + t[j];
        if (r.chance(0.7)) return { q: `$${TRI('ABC')}$ で、頂点${VS[e]}の外角が ${MD(ext)}、$${ANG(VS[i])}=${D(t[i])}$ のとき、$${ANG(VS[j])}$`, a: MD(t[j]), easy: `$${D(ext)}-${D(t[i])}=${D(t[j])}$`, key: K402(t[i], t[j]) };
        const h = r.int(5, 16) * 10;
        return { q: `$${TRI('ABC')}$ で、頂点${VS[e]}の外角が ${MD(h)}、$${ANG(VS[i])}=${ANG(VS[j])}$ のとき、$${ANG(VS[i])}$`, a: MD(h / 2), easy: `$${D(h)}\\div2=${D(h / 2)}$`, key: '402:h' + h };
      },
      // 図：辺をのばした点線と外角。外角を求めるか、外角から内角を求める
      s3(r) {
        const t = tri3(r); if (!t || !tall(t)) return null;
        const [aA, aB, aC] = t, ext = r.pick(['C', 'B']), o = ext === 'C' ? 'B' : 'C', tO = ext === 'C' ? aB : aC, tE = ext === 'C' ? aC : aB;
        if (r.chance(0.6)) {
          const f = fig402(aA, aB, aC, ext, { A: MD(aA), [o]: MD(tO), ext: LX });
          const P = f.pts, xg = angAt(P.A, P[ext], P.D);
          delete f.pts;
          if (figClash(f)) return null;
          return { q: `図で、$\\angle x$（頂点${ext}の外角）の大きさ`, a: MD(aA + tO), fig: f, easy: `$${D(aA)}+${D(tO)}=${D(aA + tO)}$`, key: K402(aA, tO), verify: () => close(xg, aA + tO) || `図の外角 ${xg}` };
        }
        const f = fig402(aA, aB, aC, ext, { [o]: LX, A: MD(aA), ext: MD(180 - tE) });
        const P = f.pts, xg = angAt(P.A, P[o], P[ext]);
        delete f.pts;
        if (figClash(f)) return null;
        return { q: '図で、$\\angle x$ の大きさ', a: MD(tO), fig: f, easy: `$${D(180 - tE)}-${D(aA)}=${D(tO)}$`, key: K402(aA, tO), verify: () => close(xg, tO) || `図の角 ${xg}` };
      },
      // わな：わかっている内角の1つが、外角ととなり合う角（たすのはまちがい。一直線から）
      trap(r) {
        const t = tri3(r); if (!t || !tall(t)) return null;
        const [aA, aB, aC] = t; if (aB === aC) return null;
        const f = fig402(aA, aB, aC, 'C', { A: MD(aA), C: MD(aC), ext: LX }); delete f.pts;
        if (figClash(f)) return null;
        const p = { q: `$${TRI('ABC')}$ で、$${ANG('A')}=${D(aA)}$、$${ANG('C')}=${D(aC)}$ のとき、頂点Cの外角 $\\angle x$`, a: MD(180 - aC), fig: f,
          verify: () => close(180 - aC, aA + aB) || 'まちがい' };
        return dest(p, '4-02', `$${ANG('C')}$ は外角ととなり合う内角。$${D(aA)}+${D(aC)}$ ではなく、一直線から $180^{\\circ}-${D(aC)}=${D(180 - aC)}$`);
      },
    },
  });

  // ================================================================ 4-03 二等辺三角形
  M.add({
    id: '4-03', part: 1, chap: '4-1②④', stars: 1,
    title: '二等辺三角形の底角は（180°－頂角）÷2',
    mark: '$\\mathrm{AB}=\\mathrm{AC}$ のように**2つの辺が等しい**三角形で、頂角か底角の1つがわかっている。',
    futsu: ['底角を $x$ として、', '$40+x+x=180$ の方程式を立てて解く。'],
    raku: ['頂角 $40^{\\circ}$ なら、底角は', '$(180^{\\circ}-40^{\\circ})\\div2=70^{\\circ}$', '底角 $35^{\\circ}$ なら、頂角は $180^{\\circ}-2\\times35^{\\circ}=110^{\\circ}$'],
    why: '二等辺三角形は線対称なので、2つの底角は等しい。内角の和 $180^{\\circ}$ から頂角をひいて、2つに分ける（4-1②④）。',
    caution: '頂角は、等しい2辺にはさまれた角。$\\mathrm{BA}=\\mathrm{BC}$ なら頂角は $\\angle\\mathrm{B}$。どの角が頂角かを先に確かめる。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '50mm' },
    fits(q) {
      if (/頂角|底角/.test(q) && /二等辺|屋根/.test(q)) return true;
      return [...q.matchAll(/\\mathrm\{(\w)(\w)\}=\\mathrm\{(\w)(\w)\}/g)].some(m => m[1] === m[3] && m[2] !== m[4] && /angle|角/.test(q));
    },
    steps: {
      s1(r) {
        const a = r.int(5, 34) * 4;
        return { q: `$\\mathrm{AB}=\\mathrm{AC}$ の二等辺三角形ABCで、頂角 $${ANG('A')}=${D(a)}$ のとき、底角 $${ANG('B')}$`, a: MD((180 - a) / 2), easy: `$(180^{\\circ}-${D(a)})\\div2=${D((180 - a) / 2)}$`, key: '403:' + a };
      },
      // 底角から頂角、頂点がAでない二等辺三角形
      s2(r) {
        const b = r.int(5, 17) * 5;
        if (r.chance(0.5)) return { q: `$\\mathrm{AB}=\\mathrm{AC}$ の二等辺三角形ABCで、底角 $${ANG('B')}=${D(b)}$ のとき、頂角 $${ANG('A')}$`, a: MD(180 - 2 * b), easy: `$180^{\\circ}-2\\times${D(b)}=${D(180 - 2 * b)}$`, key: '403:' + (180 - 2 * b) };
        const [V, X, Y] = r.pick([['B', 'A', 'C'], ['C', 'A', 'B'], ['B', 'C', 'A'], ['C', 'B', 'A']]);
        if (r.chance(0.5)) return { q: `$\\mathrm{${V}${X}}=\\mathrm{${V}${Y}}$ の二等辺三角形ABCで、$${ANG(X)}=${D(b)}$ のとき、$${ANG(V)}$`, a: MD(180 - 2 * b), easy: `（頂角は $${ANG(V)}$）$180^{\\circ}-2\\times${D(b)}=${D(180 - 2 * b)}$`, key: '403:' + (180 - 2 * b) };
        const a = r.int(5, 34) * 4;
        return { q: `$\\mathrm{${V}${X}}=\\mathrm{${V}${Y}}$ の二等辺三角形ABCで、$${ANG(V)}=${D(a)}$ のとき、$${ANG(X)}$`, a: MD((180 - a) / 2), easy: `（頂角は $${ANG(V)}$）$(180^{\\circ}-${D(a)})\\div2=${D((180 - a) / 2)}$`, key: '403:' + a };
      },
      // 円の半径でできる二等辺三角形、外角から、屋根
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(5, 34) * 4;
          return { q: `円Oの2本の半径OA、OBがつくる角が $${ANG('AOB')}=${D(a)}$ のとき、$${ANG('OAB')}$`, a: MD((180 - a) / 2), easy: `（$\\mathrm{OA}=\\mathrm{OB}$）$(180^{\\circ}-${D(a)})\\div2=${D((180 - a) / 2)}$`, key: '403:' + a };
        }
        if (k === 1) {
          const b = r.int(10, 17) * 5, e = 180 - b;
          return { q: `$\\mathrm{AB}=\\mathrm{AC}$ の二等辺三角形ABCで、頂点Bの外角が ${MD(e)} のとき、頂角 $${ANG('A')}$`, a: MD(180 - 2 * b), easy: `底角は $180^{\\circ}-${D(e)}=${D(b)}$、頂角は $180^{\\circ}-2\\times${D(b)}=${D(180 - 2 * b)}$`, easyCheck: 'last', key: '403:' + (180 - 2 * b) };
        }
        const a = r.pick([100, 110, 120, 130, 140, 150]);
        return { q: `屋根の切り口は、2つの斜面の長さが等しい二等辺三角形。てっぺんの角が ${MD(a)} のとき、斜面と水平な天井がつくる角（底角）`, a: MD((180 - a) / 2), easy: `$(180^{\\circ}-${D(a)})\\div2=${D((180 - a) / 2)}$`, key: '403:' + a };
      },
      // わな：どの角が頂角か書いていない（2通りある）
      trap(r) {
        const g = r.pick([30, 40, 50, 70, 80]), b = (180 - g) / 2, t = 180 - 2 * g;
        const ans = `$${D(b)}$ と $${D(b)}$、または $${D(g)}$ と $${D(t)}$`;
        const p = { q: `二等辺三角形の1つの角が ${MD(g)} のとき、のこりの2つの角`, a: ans,
          verify: () => {   // 頂角のとき・底角のときの2通りを、内角の和で確かめる
            if (!close(g + b + b, 180) || !close(g + g + t, 180) || t <= 0) return '内角の和が180°にならない';
            return (strip(ans).includes(D(b)) && strip(ans).includes(D(t))) || '答えがちがう';
          } };
        return dest(p, '4-03', `${MD(g)} が頂角か底角か決まらない。頂角なら底角は $(180^{\\circ}-${D(g)})\\div2=${D(b)}$、底角なら頂角は $180^{\\circ}-2\\times${D(g)}=${D(t)}$ の2通り`);
      },
    },
  });

  // ================================================================ 4-04 内角の和
  const NGON = [5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 20];
  M.add({
    id: '4-04', part: 1, chap: '4-1④', stars: 1,
    title: '$n$ 角形の内角の和は $180^{\\circ}\\times(n-2)$',
    mark: '「□角形の**内角の和**」。頂点の数 $n$ から2をひいた数が、三角形の数。',
    futsu: ['対角線を引いて、三角形に分け、', '三角形の数を図で数えて、', '$180^{\\circ}$ ずつたしていく。'],
    raku: ['八角形', '三角形は $8-2=6$ こ', '$180^{\\circ}\\times6=1080^{\\circ}$'],
    why: '1つの頂点から対角線を引くと、自分ととなりの2つの頂点には引けないので、三角形の数は頂点の数より2少ない（4-1④）。',
    caution: '$180^{\\circ}\\times n$ ではない（五角形は $900^{\\circ}$ ではなく $540^{\\circ}$）。三角形（$n=3$）で $180^{\\circ}$ になるかで確かめる。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '18mm' },
    fits(q) { return /内角の和|内角のうち|対角線を引/.test(q) || (/正\S+角形の1つの内角/.test(q) && !/外角/.test(q)); },
    steps: {
      s1(r) {
        const n = r.pick(NGON), S = 180 * (n - 2);
        return { q: `${kan(n)}角形の内角の和`, a: MD(S), easy: `$180^{\\circ}\\times(${n}-2)=${D(S)}$`, key: '404:' + n };
      },
      // 和から何角形か、のこりの1つの角
      s2(r) {
        if (r.chance(0.5)) {
          const n = r.pick(NGON), S = 180 * (n - 2), ans = `${kan(n)}角形`;
          return { q: `内角の和が ${MD(S)} の多角形は □`, a: ans, easy: `$${S}\\div180=${n - 2}$、$${n - 2}+2=${n}$`, easyCheck: false,
            verify: () => (180 * (unkan(ans.replace('角形', '')) - 2) === S) || '内角の和が合わない', key: '404:' + n };
        }
        const n = r.pick([5, 6]), S = 180 * (n - 2), last = r.int(19, 34) * 5;
        const others = []; let rest = S - last;
        for (let i = 0; i < n - 2; i++) { const v = r.int(18, 34) * 5; others.push(v); rest -= v; }
        if (rest < 90 || rest > 170 || rest % 5) return null;
        others.push(rest);
        const sum = others.reduce((a, b) => a + b, 0);
        return { q: `${kan(n)}角形の内角のうち${n - 1}つが ${others.map(MD).join('、')} のとき、のこりの内角`, a: MD(last), easy: `$${D(S)}-${D(sum)}=${D(last)}$` };
      },
      // 三角形の数、2つの多角形の差、n を求める
      s3(r) {
        const k = r.int(0, 2), n = r.pick(NGON);
        if (k === 0) return { q: `${kan(n)}角形の1つの頂点から対角線を引くと、三角形は □ こに分かれる`, a: `$${n - 2}$`, easy: `$${n}-2=${n - 2}$` };
        if (k === 1) {
          if (n > 12) return null;
          const m = r.intNot(5, 12, v => v === n), [hi, lo] = n > m ? [n, m] : [m, n];
          return { q: `${kan(hi)}角形と${kan(lo)}角形の、内角の和の差`, a: MD(180 * (hi - lo)), easy: `三角形の数の差は $${hi}-${lo}=${hi - lo}$ なので $180^{\\circ}\\times${hi - lo}=${D(180 * (hi - lo))}$`, easyCheck: 'last', key: 'd' + hi + lo };
        }
        const S = 180 * (n - 2);
        return { q: `$n$ 角形の内角の和が ${MD(S)} のとき、$n=□$`, a: `$${n}$`, easy: `$${S}\\div180+2=${n}$`, key: '404:' + n };
      },
      // わな：外角の和（何角形でも 360°。わざ 4-05）
      trap(r) {
        const n = r.pick(NGON);
        const p = { q: `${kan(n)}角形の外角の和`, a: MD(360), verify: () => close(180 * n - 180 * (n - 2), 360) || 'まちがい' };
        return dest(p, '4-04', `内角の和ではない。外角の和は何角形でも $${D(360)}$`);
      },
    },
  });

  // ================================================================ 4-05 外角の和・正多角形
  const REG = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36];
  M.add({
    id: '4-05', part: 1, chap: '4-1④', stars: 1,
    title: '外角の和はいつも360°（正多角形は外角から）',
    mark: '**正多角形**の1つの内角・外角や、何角形か。外角の和は何角形でも $360^{\\circ}$。',
    futsu: ['内角の和 $180^{\\circ}\\times(n-2)$ を出して、', '$n$ でわる。', '内角から $n$ を出すときは、方程式を解く。'],
    raku: ['正十角形の外角は $360^{\\circ}\\div10=36^{\\circ}$', '内角は $180^{\\circ}-36^{\\circ}=144^{\\circ}$', '内角 $150^{\\circ}$ → 外角 $30^{\\circ}$ → $360\\div30=12$'],
    why: 'どの頂点でも、内角と外角を合わせると一直線の $180^{\\circ}$。外角の和は、1周して元の向きにもどるので、何角形でも $360^{\\circ}$（4-1④）。',
    caution: '正多角形は、辺も角もすべて等しい多角形。辺が等しいだけ（ひし形など）では、角は等しいとはかぎらない。',
    counts: { s1: 8, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '30mm', s3: '16mm', trap: '16mm' },
    fits(q) { return (/外角の和|外角が|外角のうち|1つの外角/.test(q) && !/\\triangle|三角形/.test(q)) || (/正(?:多|\S+)角形/.test(q) && /1つの内角|外角/.test(q)) || /左に.*曲が/.test(q); },
    steps: {
      s1(r) {
        const n = r.pick(REG), e = 360 / n;
        if (r.chance(0.7)) return { q: `正${kan(n)}角形の1つの内角`, a: MD(180 - e), easy: `$180^{\\circ}-360^{\\circ}\\div${n}=${D(180 - e)}$`, key: 'i' + n };
        return { q: `正${kan(n)}角形の1つの外角`, a: MD(e), easy: `$360^{\\circ}\\div${n}=${D(e)}$`, key: 'e' + n };
      },
      // 内角・外角から、正何角形か
      s2(r) {
        const n = r.pick(REG), e = 360 / n, ans = `正${kan(n)}角形`;
        const vf = () => close(unkan(ans.slice(1, -2)) * e, 360) || '外角の和が360°にならない';
        if (r.chance(0.6)) return { q: `1つの内角が ${MD(180 - e)} の正多角形は □`, a: ans, easy: `外角 $180^{\\circ}-${D(180 - e)}=${D(e)}$、$360\\div${e}=${n}$`, easyCheck: false, verify: vf, key: 'i' + n };
        return { q: `1つの外角が ${MD(e)} の正多角形は □`, a: ans, easy: `$360\\div${e}=${n}$`, easyCheck: false, verify: vf, key: 'e' + n };
      },
      // のこりの外角、ロボット掃除機、外角から内角の和
      s3(r) {
        const k = r.int(0, 2);
        if (k < 2) {
          // n－1 この外角を、のこりが 20°〜120° になるまで選びなおす
          const n = r.pick([5, 6]), lo = n === 5 ? 9 : 7, hi = n === 5 ? 17 : 14;
          let ex = [], rest = 0;
          for (let t = 0; t < 40; t++) { ex = Array.from({ length: n - 1 }, () => r.int(lo, hi) * 5); rest = 360 - ex.reduce((a, b) => a + b, 0); if (rest >= 20 && rest <= 120) break; }
          if (rest < 20 || rest > 120) return null;
          const sum = 360 - rest;
          if (k === 0) return { q: `${kan(n)}角形の外角のうち${n - 1}つが ${ex.map(MD).join('、')} のとき、のこりの外角`, a: MD(rest), easy: `$360^{\\circ}-${D(sum)}=${D(rest)}$` };
          return { q: `ロボット掃除機が${kan(n)}角形の部屋のかべにそって左回りに1周し、${n - 1}つの角で左に ${ex.map(MD).join('、')} 曲がった。のこりの角で左に曲がった角`, a: MD(rest), easy: `1周で $360^{\\circ}$：$360^{\\circ}-${D(sum)}=${D(rest)}$`, easyCheck: 'last' };
        }
        const n = r.pick([8, 9, 10, 12, 15, 18]), e = 360 / n;
        return { q: `1つの外角が ${MD(e)} の正多角形の内角の和`, a: MD(180 * (n - 2)), easy: `$360\\div${e}=${n}$ で正${kan(n)}角形。$180^{\\circ}\\times${n - 2}=${D(180 * (n - 2))}$`, easyCheck: 'last' };
      },
      // わな：辺がすべて等しいだけ（ひし形は正多角形ではない。4-1⑦ の反例）
      trap(r) {
        const g = r.pick([50, 55, 60, 65, 70, 75, 80, 100, 110, 115, 120, 125]);
        const p = { q: `4つの辺の長さがすべて等しい四角形（ひし形）で、1つの内角が ${MD(g)} のとき、そのとなりの内角`, a: MD(180 - g),
          verify: () => close(g + (180 - g) + g + (180 - g), 360) || '内角の和が360°にならない' };
        return dest(p, '4-05', `ひし形は角が等しくないので、正多角形ではない（$360^{\\circ}\\div4$ ではない）。四角形の内角の和は $360^{\\circ}$ で、向かい合う角は等しいので、となり合う2つの角の和は $360^{\\circ}\\div2=180^{\\circ}$：$180^{\\circ}-${D(g)}=${D(180 - g)}$`, ['4-04']);
      },
    },
  });

  // ================================================================ 4-06 平行線のあいだの折れ線
  // 図：ℓ（y＝h）、m（y＝0）。P は右に折れる点。A（ℓ の上）、B（m の上）。α：ℓ と PA の右側の角、β：m と PB の右側の角
  // out：P が m より下（2本のあいだにない。わな）。flip：左右を反転
  function fig406(al, be, labs, out, flip) {
    const h = out ? 2.4 : 3.8;
    let A, B, P;
    if (!out) { const d = h / (Math.tan(rad(al)) + Math.tan(rad(be))); P = [0, d * Math.tan(rad(be))]; A = [-d, h]; B = [-d, 0]; }
    else { const py = -2.7; P = [0, py]; A = [-(h - py) / Math.tan(rad(al)), h]; B = [py / Math.tan(rad(be)), 0]; }
    // 横はば：A・B の左に 1.2、P の右に 2.8。はばが 8.5 をこえたら全体を小さくする（角は変わらない）
    const x0 = Math.min(A[0], B[0]) - 1.2, x1 = P[0] + 2.8, k = Math.min(1, 9.6 / (x1 - x0));
    const S = p => [(p[0] - x0) * k, p[1] * k];
    [A, B, P] = [A, B, P].map(S);
    const H = h * k, W = (x1 - x0) * k;
    const items = [['seg', [0, H], [W, H]], ['seg', [0, 0], [W, 0]], ['path', [A, P, B]],
      ['label', [W, H], ELL, 'e'], ['label', [W, 0], '$m$', 'e'],
      ['par', [W - 1.7, H], [W - 0.5, H], 1], ['par', [W - 1.7, 0], [W - 0.5, 0], 1],
      ['label', A, 'A', 'n'], ['label', B, 'B', out ? 'nw' : 's'], ['label', P, 'P', out ? 's' : 'e'],
      mark([A[0] + 1.5, H], A, P, labs.al), mark([B[0] + 1.5, 0], B, P, labs.be), out ? mark(A, P, B, labs.x, 0.6) : mark(A, P, B, labs.x)];   // わなは P の角が小さく B に近いので、弧を小さく
    const chk = { al: angAt([A[0] + 1.5, H], A, P), be: angAt([B[0] + 1.5, 0], B, P), x: angAt(A, P, B) };
    if (!flip) return { fig: { s: FS, items: edge(items) }, chk };
    // 左右を反転（点の x を W－x に、ラベルの向きの e と w を入れかえる）
    const F = p => [W - p[0], p[1]], SW = { e: 'w', w: 'e', ne: 'nw', nw: 'ne', se: 'sw', sw: 'se' };
    const fl = items.map(it => {
      const k0 = it[0];
      if (k0 === 'seg' || k0 === 'par') return [k0, F(it[1]), F(it[2]), ...it.slice(3)];
      if (k0 === 'path') return [k0, it[1].map(F), ...it.slice(2)];
      if (k0 === 'label') return [k0, F(it[1]), it[2], SW[it[3]] || it[3]];
      if (k0 === 'angle') return [k0, F(it[1]), F(it[2]), F(it[3]), ...it.slice(4)];
      return it;
    });
    return { fig: { s: FS, items: edge(fl) }, chk };
  }
  const K406 = (a, b) => '406:' + Math.min(a, b) + '/' + Math.max(a, b);
  const ORE = (al, be, side) => `$\\ell\\parallel m$ の間の点Pで${side}に折れた線APBで、$\\ell$ との${side}側の角が ${MD(al)}、$m$ との${side}側の角が ${MD(be)}`;
  M.add({
    id: '4-06', part: 1, chap: '4-1③', stars: 1,
    title: '平行線のあいだの折れ線は、平行な補助線で錯角の和',
    mark: '$\\ell\\parallel m$ の**あいだ**で折れた線の角 $\\angle x$。',
    futsu: ['線をのばして三角形を作り、', '外角や内角の和を何回も使う。'],
    raku: ['折れた点Pを通って $\\ell$ に平行な線を引く', '上の錯角 $40^{\\circ}$、下の錯角 $35^{\\circ}$', '$\\angle x=40^{\\circ}+35^{\\circ}=75^{\\circ}$'],
    why: '引いた線は $\\ell$ にも $m$ にも平行なので、$\\angle x$ は上と下の2つの錯角に分かれる（4-1③の例題）。',
    caution: '折れた点が2本の平行線のあいだにないときは、たすのではなく、大きい角から小さい角をひく。',
    counts: { s1: 6, s2: 2, s3: 2, trap: 1 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /折れ/.test(q) && /\\parallel/.test(q) && !/間にない/.test(q); },
    steps: {
      s1(r) {
        const al = r.int(5, 12) * 5, be = r.int(5, 12) * 5, side = r.pick(['右', '左']);
        return { q: `${ORE(al, be, side)} のとき、$${ANG('APB')}$`, a: MD(al + be), easy: `Pを通る平行線で錯角に分ける：$${D(al)}+${D(be)}=${D(al + be)}$`, easyCheck: 'last', key: K406(al, be) };
      },
      // ∠APB から、のこりの角
      s2(r) {
        const al = r.int(5, 12) * 5, be = r.int(5, 12) * 5, side = r.pick(['右', '左']), x = al + be;
        return { q: `$\\ell\\parallel m$ の間の点Pで${side}に折れた線APBで、$${ANG('APB')}=${D(x)}$、$\\ell$ との${side}側の角が ${MD(al)} のとき、$m$ との${side}側の角`, a: MD(be), easy: `$${D(x)}-${D(al)}=${D(be)}$`, key: K406(al, be) };
      },
      // 図：∠x を求めるか、上か下の角を求める
      s3(r) {
        const al = r.int(5, 11) * 5, be = r.int(5, 11) * 5, flip = r.chance(0.4), k = r.int(0, 2);
        const L = [MD(al), MD(be), MD(al + be)]; L[k] = LX;
        const { fig, chk } = fig406(al, be, { al: L[0], be: L[1], x: L[2] }, false, flip);
        if (figClash(fig)) return null;
        const ans = [al, be, al + be][k];
        const easy = k === 2 ? `$${D(al)}+${D(be)}=${D(al + be)}$` : `$${D(al + be)}-${D(k === 0 ? be : al)}=${D(ans)}$`;
        return { q: '図の折れ線APBで、$\\ell\\parallel m$ のとき、$\\angle x$ の大きさ', a: MD(ans), easy, fig, key: K406(al, be),
          verify: () => (close(chk.al, al) && close(chk.be, be) && close(chk.x, al + be)) || `図の角が合わない ${JSON.stringify(chk)}` };
      },
      // わな：P が2本のあいだにない（たすのではなく、ひく）
      trap(r) {
        const al = r.int(7, 10) * 5, be = al + r.int(4, 7) * 5;
        const { fig, chk } = fig406(al, be, { al: MD(al), be: MD(be), x: LX }, true, false);
        if (figClash(fig)) return null;
        const p = { q: `$\\ell\\parallel m$ で、点Pは $m$ より下（2本の間にない）。折れ線APBの、$\\ell$ との右側の角が ${MD(al)}、$m$ との右側の角が ${MD(be)} のとき、$\\angle x=${ANG('APB')}$`,
          a: MD(be - al), fig, verify: () => close(chk.x, be - al) || `図の角 ${chk.x}` };
        return dest(p, '4-06', `Pを通る平行線を引くと、$\\angle x$ は2つの錯角（同位角）の差：$${D(be)}-${D(al)}=${D(be - al)}$。たすと $${D(al + be)}$ でまちがい`);
      },
    },
  });

  // ================================================================ 4-07 合同条件
  // 三角形ABC の辺（'AB' など、ならびは文字の順）と角（'B' など）の値から、三角形がいくつかけるか（別の道すじの確かめ）
  const sideKey = s => [...s].sort().join('');
  function countTri(sides, angs) {
    const S = Object.keys(sides), G = Object.keys(angs);
    const sumG = G.reduce((a, g) => a + angs[g], 0);
    if ((G.length === 2 && sumG >= 180) || (G.length === 3 && Math.abs(sumG - 180) > 1e-9)) return 0;
    if (S.length === 3) { const [a, b, c] = S.map(k => sides[k]).sort((x, y) => x - y); return a + b > c ? 1 : 0; }
    if (S.length === 0) return Infinity;
    if (G.length >= 2) return 1;
    if (S.length === 2 && G.length === 1) {
      const V = G[0];
      if (S.every(s => s.includes(V))) return 1;
      const adj = S.find(s => s.includes(V)), opp = S.find(s => !s.includes(V));
      if (!adj) return Infinity;
      const c = sides[adj], b = sides[opp], h = c * Math.sin(rad(angs[V]));
      if (b < h - 1e-9) return 0;
      if (Math.abs(b - h) < 1e-9 || b >= c) return 1;
      return 2;
    }
    return Infinity;
  }
  const JOKEN = { 3: '3辺', 2: '2辺とそのあいだの角', 1: '1辺とその両はしの角' };
  const MAP = { A: 'D', B: 'E', C: 'F' };
  // 問題の文：items は ['s', 'AB', 5] か ['a', 'B', 40]。opt.rev で辺の字をさかさまに、opt.three で角を3文字に
  function gq(items, opt = {}) {
    const other = (v, all) => 'ABC'.split('').filter(c => c !== v);
    const parts = items.map(([k, n, v]) => {
      if (k === 's') { const t = opt.rev && opt.rev.includes(n) ? [...n].reverse().join('') : n; return `$\\mathrm{${t}}=\\mathrm{${[...t].map(c => MAP[c]).join('')}}=${v}\\,\\mathrm{cm}$`; }
      if (opt.three) { const [p, q] = other(n); return `$${ANG(p + n + q)}=${ANG(MAP[p] + MAP[n] + MAP[q])}=${D(v)}$`; }
      return `$${ANG(n)}=${ANG(MAP[n])}=${D(v)}$`;
    });
    return `$${TRI('ABC')}$ と $${TRI('DEF')}$ で、${parts.join('、')} のとき、合同条件は □`;
  }
  function goudou(items, ans, easy, opt) {
    const sides = {}, angs = {};
    items.forEach(([k, n, v]) => { if (k === 's') sides[sideKey(n)] = v; else angs[n] = v; });
    return {
      q: gq(items, opt), a: ans, easy, easyCheck: false, key: '407:' + ['s', 'a'].map(k => items.filter(x => x[0] === k).map(x => x[2]).sort((p, q) => p - q).join(',')).join('/') + ans,
      verify: () => {
        const n = countTri(sides, angs);
        const want = n === 1 ? JOKEN[Object.keys(sides).length] : '合同とはかぎらない';
        if (n === 0) return '三角形がかけない';
        return ans === want || `三角形は ${n} こ。答えは「${want}」のはず`;
      },
    };
  }
  const ANGS = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 100, 110, 120];
  function randTri(r, kind) {
    const V = r.pick(['A', 'B', 'C']), [X, Y] = 'ABC'.split('').filter(c => c !== V);
    if (kind === 'SSS') {
      const a = r.int(3, 9), b = r.int(3, 9), c = r.int(3, 9);
      if (a + b <= c || b + c <= a || c + a <= b || (a === b && b === c)) return null;
      return [['s', 'AB', a], ['s', 'BC', b], ['s', 'CA', c]];
    }
    if (kind === 'SAS') { const a = r.int(3, 9), b = r.intNot(3, 9, v => v === a); return [['s', V < X ? V + X : X + V, a], ['a', V, r.pick(ANGS)], ['s', V < Y ? V + Y : Y + V, b]]; }
    // ASA：辺 XY と両はしの角
    const g1 = r.pick(ANGS), g2 = r.pick(ANGS);
    if (g1 + g2 >= 165) return null;
    if (kind === 'ASA') return [['a', X, g1], ['s', X + Y, r.int(3, 9)], ['a', Y, g2]];
    // AAS：辺 XY と、X の角と、のこりの頂点 V の角
    return [['s', X + Y, r.int(3, 9)], ['a', X, g1], ['a', V, g2]];
  }
  const KIND = { SSS: '3辺', SAS: '2辺とそのあいだの角', ASA: '1辺とその両はしの角', AAS: '1辺とその両はしの角' };
  M.add({
    id: '4-07', part: 1, chap: '4-1⑥', stars: 1,
    title: '合同条件は「あいだの角」「両はしの角」を見る',
    mark: '2つの三角形で、**等しい辺と角の組**。角が、どの辺のあいだ・両はしにあるかを見る。',
    futsu: ['コンパスと定規で、', '同じ三角形をかいて、重なるか確かめる。'],
    raku: ['$\\mathrm{AB}$、$\\mathrm{BC}$ と $\\angle\\mathrm{B}$', '$\\angle\\mathrm{B}$ は AB と BC のあいだの角', '→ 2辺とそのあいだの角'],
    why: '3辺、2辺とそのあいだの角、1辺とその両はしの角のどれかがわかれば、三角形は1つに決まる（4-1⑥）。',
    caution: '角が2辺のあいだにないと、三角形が2つかけることがある。3つの角だけでは、大きさが決まらない。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '46mm',
    fits(q) {
      if (!/合同/.test(q)) return false;
      const sides = new Set([...q.matchAll(/\\mathrm\{([A-C])([A-C])\}=\\mathrm\{[D-F]{2}\}/g)].map(m => sideKey(m[1] + m[2])));
      const angs = new Set([...q.matchAll(/\\angle\\mathrm\{([A-C]{1,3})\}=\\angle/g)].map(m => (m[1].length === 3 ? m[1][1] : m[1])));
      if (sides.size === 3) return true;
      if (sides.size >= 1 && angs.size >= 2) return true;
      if (sides.size === 2 && angs.size === 1) { const v = [...angs][0]; return [...sides].every(s => s.includes(v)); }
      return false;
    },
    steps: {
      s1(r) {
        const kind = r.pick(['SSS', 'SAS', 'ASA']), it = randTri(r, kind); if (!it) return null;
        return goudou(it, KIND[kind], kind === 'SSS' ? '（3つの辺が等しい）' : kind === 'SAS' ? '（等しい角が、等しい2辺のあいだにある）' : '（等しい2つの角が、等しい辺の両はしにある）');
      },
      // 順番をまぜる、辺の字をさかさまに、角を3文字で
      s2(r) {
        const kind = r.pick(['SSS', 'SAS', 'ASA']), it = randTri(r, kind); if (!it) return null;
        const items = r.shuffle(it), rev = items.filter(x => x[0] === 's' && r.chance(0.5)).map(x => x[1]);
        const vtx = it.filter(x => x[0] === 'a').map(x => x[1]);
        return goudou(items, KIND[kind], kind === 'SAS' ? `（$${ANG(vtx[0])}$ は、等しい2辺のあいだの角）` : kind === 'ASA' ? `（$${ANG(vtx[0])}$ と $${ANG(vtx[1])}$ は、等しい辺の両はしの角）` : '（3つの辺が等しい）', { rev, three: r.chance(0.6) });
      },
      // 1辺と、両はしでない角（のこりの角を出すと、両はしの角になる）
      s3(r) {
        const it = randTri(r, 'AAS'); if (!it) return null;
        const [, XY, ] = it[0], X = it[1][1], V = it[2][1], Y = XY.replace(X, '');
        const third = 180 - it[1][2] - it[2][2];
        return goudou(r.shuffle(it), '1辺とその両はしの角', `（のこりの角 $${ANG(Y)}=180^{\\circ}-${D(it[1][2])}-${D(it[2][2])}=${D(third)}$ で、辺 ${XY} の両はしの角がわかる）`, { three: r.chance(0.4) });
      },
      // わな：2辺と、あいだでない角（三角形が2つかける）／3つの角だけ
      trap(r) {
        if (r.chance(0.65)) {
          // 角 V、となりの辺 c（V をふくむ）、向かいの辺 b：c·sinV < b < c のとき2つ
          const V = r.pick(['A', 'B', 'C']), [X, Y] = 'ABC'.split('').filter(ch => ch !== V), g = r.pick([30, 35, 40, 45, 50]);
          const c = r.int(5, 9), lo = Math.floor(c * Math.sin(rad(g))) + 1, b = r.int(lo, c - 1);
          if (b <= c * Math.sin(rad(g)) + 1e-6 || b >= c) return null;
          const adj = V < X ? V + X : X + V, opp = X + Y;
          const it = r.shuffle([['s', adj, c], ['s', opp, b], ['a', V, g]]);
          return dest(goudou(it, '合同とはかぎらない', ''), '4-07', `$${ANG(V)}$ は、等しい2辺 ${adj}・${opp} のあいだの角ではない。三角形が2つかけることがある`);
        }
        const t = tri3(r); if (!t) return null;
        return dest(goudou([['a', 'A', t[0]], ['a', 'B', t[1]], ['a', 'C', t[2]]], '合同とはかぎらない', ''), '4-07', '角だけで、辺の長さがない。形は同じでも、大きさが決まらない');
      },
    },
  });

  // ================================================================ 4-08 弧と面積（度）
  const NICE = [30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315];
  const arcOf = (rr, a) => Q(2 * rr * a, 360);           // 弧の長さ ÷ π
  const areaOf = (rr, a) => Q(rr * rr * a, 360);         // 面積 ÷ π
  M.add({
    id: '4-08', part: 1, chap: '4-2②', stars: 1,
    title: '弧と面積は「中心角÷360」を約分してから',
    mark: 'おうぎ形の**中心角が 360 の約数**（30、40、45、60、72、90、120…）か、その倍。',
    futsu: ['$2\\pi r\\times\\frac{a}{360}$ を、', '左から順に計算する。'],
    raku: ['半径6、$60^{\\circ}$ → $\\frac{60}{360}=\\frac{1}{6}$', '弧は $12\\pi\\times\\frac{1}{6}=2\\pi$', '面積は $36\\pi\\times\\frac{1}{6}=6\\pi$'],
    why: '弧の長さも面積も、中心角に比例する。中心角 $a^{\\circ}$ のおうぎ形は、円全体の $\\frac{a}{360}$（4-2②）。先に約分すると、かけ算が小さくなる。',
    caution: '半径と直径をまちがえない。円周は $2\\pi r$、円の面積は $\\pi r^{2}$。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    boxh: '12mm',
    fits(q) {
      const m = /中心角(?:が)?\s*\$(\d+)\^\{\\circ\}\$/.exec(q);
      if (!m || !/おうぎ形/.test(q) || !/弧|面積/.test(q)) return false;
      return 360 / gcd(+m[1], 360) <= 12;
    },
    steps: {
      s1(r) {
        const a = r.pick(NICE), rr = r.int(2, 12), f = Q(a, 360), L = arcOf(rr, a);
        return { q: `半径 ${CM(rr)}、中心角 ${MD(a)} のおうぎ形の弧の長さは ${BOX('cm')}`, a: `$${piT(L)}$`, easy: `$${2 * rr}\\pi\\times${tq(f)}=${piT(L)}$`, key: `408:${rr}/${a}` };
      },
      s2(r) {
        const a = r.pick(NICE), rr = r.int(2, 12), f = Q(a, 360), S = areaOf(rr, a);
        return { q: `半径 ${CM(rr)}、中心角 ${MD(a)} のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${piT(S)}$`, easy: `$${rr * rr}\\pi\\times${tq(f)}=${piT(S)}$` };
      },
      // ピザ、時計の針、弧から中心角
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.pick([4, 6, 8, 12]), rr = r.pick([6, 8, 9, 10, 12, 15]), L = arcOf(rr, 360 / n);
          return { q: `半径 ${CM(rr)} の丸いピザを、中心から $${n}$ 等分した1切れの弧の長さは ${BOX('cm')}`, a: `$${piT(L)}$`, easy: `中心角は $360^{\\circ}\\div${n}$。$${2 * rr}\\pi\\times\\frac{1}{${n}}=${piT(L)}$`, easyCheck: 'last' };
        }
        if (k === 1) {
          const t = r.pick([5, 10, 15, 20, 30, 40, 45]), rr = r.pick([6, 9, 10, 12]), a = 6 * t, L = arcOf(rr, a), f = Q(t, 60);
          return { q: `長さ ${CM(rr)} の時計の長い針の先が、$${t}$ 分で動く道のりは ${BOX('cm')}`, a: `$${piT(L)}$`, easy: `${t} 分は1周の $${tq(f)}$。$${2 * rr}\\pi\\times${tq(f)}=${piT(L)}$`, easyCheck: 'last' };
        }
        const a = r.pick(NICE.filter(v => v < 360)), rr = r.int(3, 12), L = arcOf(rr, a), f = Q(a, 360);
        return { q: `半径 ${CM(rr)} で、弧の長さが $${piT(L)}\\,\\mathrm{cm}$ のおうぎ形の中心角`, a: MD(a), easy: `円周 $${2 * rr}\\pi$ の $${tq(f)}$ なので $360^{\\circ}\\times${tq(f)}=${D(a)}$`, easyCheck: 'last', key: `408:${rr}/${a}` };
      },
      // わな：中心角が書いていない（弧の長さと半径 → わざ 4-09）、中心角が rad（→ わざ 4-11）。中心角÷360 は使わない（R1-6）
      trap(r) {
        const rr = r.int(2, 9);
        if (r.chance(0.5)) {
          const s = r.intNot(2, 12, v => (v * rr) % 2 === 1 || v >= 2 * Math.PI * rr); if (s == null) return null;
          return dest({ q: `半径 ${CM(rr)}、弧の長さ ${CM(s)} のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${s * rr / 2}$`, key: '408t:' + Math.min(s, rr) + '/' + Math.max(s, rr), verify: () => close(s * rr / 2, rr * rr * (s / rr) / 2) || 'まちがい' },
            '4-08', `中心角が書いていないので、中心角÷360 は使えない。弧と半径から $\\frac{1}{2}\\times${s}\\times${rr}=${s * rr / 2}$`);
        }
        const t = r.int(2, 15);
        return dest({ q: `半径 ${CM(rr)}、中心角 $${fmt(t / 10)}\\,\\mathrm{rad}$ のおうぎ形の弧の長さは ${BOX('cm')}`, a: `$${fmt(rr * t / 10)}$`, verify: () => close(rr * t / 10, 2 * Math.PI * rr * (t / 10) / (2 * Math.PI)) || 'まちがい' },
          '4-08', `中心角が rad なので、360 でわらない。$${rr}\\times${fmt(t / 10)}=${fmt(rr * t / 10)}$`);
      },
    },
  });

  // ================================================================ 4-09 S＝½×弧×半径
  // 同じ見開きの重なり（N-2）：弧と半径の組（小さい順）。面積から半径・弧を出す問題（逆の問題）も同じ key
  const K409 = (s, rr) => '409:' + Math.min(s, rr) + '/' + Math.max(s, rr);
  M.add({
    id: '4-09', part: 1, chap: '4-2⑤', stars: 1,
    title: 'おうぎ形の面積は $\\frac{1}{2}\\times$弧$\\times$半径',
    mark: '**弧の長さと半径**がわかっていて、中心角が書いていない。',
    futsu: ['弧の長さから中心角を出して、', '$\\pi r^{2}\\times\\frac{a}{360}$ で面積を出す。'],
    raku: ['弧6、半径5', '中心角を出さずに', '$\\frac{1}{2}\\times6\\times5=15$'],
    why: 'おうぎ形を細い三角形に分けると、底辺の合計が弧、高さが半径。三角形の「底辺×高さ÷2」と同じ形になる（4-2⑤）。',
    caution: '中心角だけがわかっていて弧がわからないときは、この式は使えない（わざ 4-08・4-11）。',
    counts: { s1: 8, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /おうぎ形/.test(q) && /弧の長さ/.test(q) && /面積/.test(q) && !/中心角/.test(q); },
    steps: {
      s1(r) {
        const s = r.int(2, 12), rr = r.int(2, 12); if ((s * rr) % 2) return null;
        return { q: `弧の長さ ${CM(s)}、半径 ${CM(rr)} のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${s * rr / 2}$`, easy: `$\\frac{1}{2}\\times${s}\\times${rr}=${s * rr / 2}$`, key: K409(s, rr) };
      },
      // 面積と弧から半径、面積と半径から弧
      s2(r) {
        const s = r.int(2, 12), rr = r.int(2, 12), S = s * rr / 2; if (S % 1) return null;
        if (r.chance(0.5)) return { q: `面積 $${S}\\,\\mathrm{cm^{2}}$、弧の長さ ${CM(s)} のおうぎ形の半径は ${BOX('cm')}`, a: `$${rr}$`, easy: `$${S}=\\frac{1}{2}\\times${s}\\times r$ より $r=${rr}$`, easyCheck: false, verify: () => close(s * rr / 2, S) || 'まちがい', key: K409(s, rr) };
        return { q: `面積 $${S}\\,\\mathrm{cm^{2}}$、半径 ${CM(rr)} のおうぎ形の弧の長さは ${BOX('cm')}`, a: `$${s}$`, easy: `$${S}=\\frac{1}{2}\\times s\\times${rr}$ より $s=${s}$`, easyCheck: false, verify: () => close(s * rr / 2, S) || 'まちがい', key: K409(s, rr) };
      },
      // π のついた弧、円すいの側面
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.int(2, 9), rr = r.int(3, 12), S = Q(n * rr, 2);
          if (n >= 2 * rr) return null;   // 弧は円周 $2\pi r$ より短い（N-1）
          return { q: `弧の長さ $${piT([n, 1])}\\,\\mathrm{cm}$、半径 ${CM(rr)} のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${piT(S)}$`, easy: `$\\frac{1}{2}\\times${piT([n, 1])}\\times${rr}=${piT(S)}$`, key: K409(n, rr), verify: () => (n < 2 * rr) || '弧が円周より長い' };
        }
        const [a, l] = r.pick([[3, 5], [4, 5], [5, 13], [12, 13], [6, 10], [8, 10], [2, 6], [3, 9], [4, 7]]), S = a * l;
        return { q: `底面の半径 ${CM(a)}、母線 ${CM(l)} の円すいの側面（おうぎ形）の面積は ${BOX('cm^{2}')}`, a: `$${piT([S, 1])}$`, easy: `弧は底面の円周 $${piT([2 * a, 1])}$。$\\frac{1}{2}\\times${piT([2 * a, 1])}\\times${l}=${piT([S, 1])}$`, easyCheck: 'last' };
      },
      // わな：中心角がわかっていて、弧がない（わざ 4-08）
      trap(r) {
        const a = r.pick([60, 90, 120, 45, 72]), rr = r.pick([3, 4, 5, 6]), S = areaOf(rr, a);
        return dest({ q: `半径 ${CM(rr)}、中心角 ${MD(a)} のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${piT(S)}$` }, '4-09', `弧の長さがわからない。中心角から $${rr * rr}\\pi\\times${tq(Q(a, 360))}=${piT(S)}$`);
      },
    },
  });

  // ================================================================ 4-10 度とラジアン
  const DEGS = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 225, 240, 270, 300, 315, 330, 360];
  M.add({
    id: '4-10', part: 1, chap: '4-2④', stars: 1,
    title: '度とラジアンは「$180^{\\circ}=\\pi$」でおきかえて約分',
    mark: '度の数が15・30・45の倍数、または $\\pi$ をふくむラジアンの角。',
    futsu: ['$1^{\\circ}\\approx0.01745\\,\\mathrm{rad}$ をかけて、', '小数で計算する。'],
    raku: ['$150^{\\circ}=\\frac{150}{180}\\pi=\\frac{5\\pi}{6}$', '$\\frac{2\\pi}{3}$ は $\\pi$ を $180^{\\circ}$ にかえて', '$\\frac{2\\times180^{\\circ}}{3}=120^{\\circ}$'],
    why: '$\\pi\\,\\mathrm{rad}$ と $180^{\\circ}$ は同じ角（4-2④）。$\\pi$ と $180^{\\circ}$ をおきかえて、約分するだけで換算できる。',
    caution: '度をラジアンにするとき、$\\frac{180}{\\pi}$ をかけるのはさかさま。消したい単位が分母にくる分数をかける。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    boxh: { s1: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { return /をラジアンで|を度で/.test(q); },
    steps: {
      s1(r) {
        const d = r.pick(DEGS), f = Q(d, 180);
        return { q: `${MD(d)} をラジアンで`, a: `$${piT(f)}$`, easy: `$\\frac{${d}}{180}\\pi=${piT(f)}$`, key: '410:' + d };
      },
      s2(r) {
        const d = r.pick(DEGS), f = Q(d, 180);
        const num = f[0] === 1 ? '180^{\\circ}' : `${f[0]}\\times180^{\\circ}`;
        return { q: `$${piT(f)}\\,\\mathrm{rad}$ を度で`, a: MD(d), easy: f[1] === 1 ? `$${num}=${D(d)}$` : `$\\frac{${num}}{${f[1]}}=${D(d)}$`, key: '410:' + d };
      },
      // 1回転の何分の1か、時計の針、正多角形の内角（度でもラジアンでも）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.pick([3, 4, 6, 8, 12]), m = r.intNot(1, n - 1, v => gcd(v, n) !== 1), f = Q(2 * m, n);
          return { q: `1回転の $\\frac{${m}}{${n}}$ の角をラジアンで`, a: `$${piT(f)}$`, easy: `1回転は $2\\pi$。$2\\pi\\times\\frac{${m}}{${n}}=${piT(f)}$`, easyCheck: 'last', key: '410:' + 360 * m / n };
        }
        if (k === 1) {
          const t = r.pick([5, 10, 15, 20, 25, 30, 40, 45, 50]), f = Q(t, 30);
          return { q: `時計の長い針が $${t}$ 分で回る角の大きさをラジアンで`, a: `$${piT(f)}$`, easy: `60 分で $2\\pi$。$2\\pi\\times\\frac{${t}}{60}=${piT(f)}$`, easyCheck: 'last', key: '410:' + 6 * t };
        }
        const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), d = 180 - 360 / n, f = Q(d, 180);
        return { q: `${SEI(n)}の1つの内角をラジアンで`, a: `$${piT(f)}$`, easy: `内角は $180^{\\circ}-360^{\\circ}\\div${n}=${D(d)}$。$\\frac{${d}}{180}\\pi=${piT(f)}$`, easyCheck: 'last', key: '410:' + d };
      },
      // わな：ラジアンの中心角で弧の長さ（換算しなくてよい。わざ 4-11）
      trap(r) {
        const d = r.pick([30, 45, 60, 90, 120, 150]), f = Q(d, 180), rr = r.pick([2, 3, 4, 6, 8, 9, 12]), L = Q(rr * f[0], f[1]);
        return dest({ q: `半径 ${CM(rr)}、中心角 $${piT(f)}\\,\\mathrm{rad}$ のおうぎ形の弧の長さは ${BOX('cm')}`, a: `$${piT(L)}$` }, '4-10', `度に直さなくてよい。$s=r\\theta$ で $${rr}\\times${piT(f)}=${piT(L)}$`);
      },
    },
  });

  // ================================================================ 4-11 s＝rθ、S＝½r²θ
  M.add({
    id: '4-11', part: 1, chap: '4-2⑤', stars: 1,
    title: 'ラジアンなら $s=r\\theta$、$S=\\frac{1}{2}r^{2}\\theta$',
    mark: 'おうぎ形の中心角が **rad**（ラジアン）で書いてある。',
    futsu: ['ラジアンを度に直して、', '$2\\pi r\\times\\frac{a}{360}$ で計算する。'],
    raku: ['半径5、$0.8\\,\\mathrm{rad}$', '$s=5\\times0.8=4$', '$S=\\frac{1}{2}\\times25\\times0.8=10$'],
    why: 'ラジアンは「弧の長さ÷半径」で決めた角なので、弧の長さは「半径×角」（4-2⑤）。360 でわる計算がいらない。',
    caution: '度のまま $s=r\\theta$ に入れない（半径2、$30^{\\circ}$ で $2\\times30=60$ とするのはまちがい）。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    boxh: { s3: '12mm', trap: '12mm' },
    fits(q) { return /rad/.test(q) && /おうぎ形|弧|針の先/.test(q) && !/をラジアンで|を度で/.test(q); },
    steps: {
      s1(r) {
        const rr = r.int(2, 12), t = r.int(2, 25), th = t / 10, s = rr * t / 10;
        return { q: `半径 $${rr}\\,\\mathrm{m}$、中心角 $${fmt(th)}\\,\\mathrm{rad}$ のおうぎ形の弧の長さは ${BOX('m')}`, a: `$${fmt(s)}$`, easy: `$${rr}\\times${fmt(th)}=${fmt(s)}$`, key: `411:${rr}/${t}` };
      },
      // 面積、弧から中心角
      s2(r) {
        const rr = r.int(2, 10), t = r.int(2, 25), th = t / 10;
        if (r.chance(0.55)) { const S = rr * rr * t / 20; if ((rr * rr * t) % 2) return null; return { q: `半径 ${CM(rr)}、中心角 $${fmt(th)}\\,\\mathrm{rad}$ のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${fmt(S)}$`, easy: `$\\frac{1}{2}\\times${rr * rr}\\times${fmt(th)}=${fmt(S)}$` }; }
        const s = rr * t / 10;
        return { q: `半径 ${CM(rr)}、弧の長さ ${CM(fmt(s))} のおうぎ形の中心角は ${BOX('rad')}`, a: `$${fmt(th)}$`, easy: `$\\theta=\\frac{s}{r}=\\frac{${fmt(s)}}{${rr}}=${fmt(th)}$`, easyCheck: 'last', key: `411:${rr}/${t}` };
      },
      // π のついた角、時計の針の先
      s3(r) {
        const k = r.int(0, 2);
        if (k < 2) {
          const f = Q(1, r.pick([2, 3, 4, 6])), m = r.int(1, Math.max(1, f[1] - 1)), th = Q(m, f[1]), rr = r.pick([2, 3, 4, 6, 8, 9, 12]);
          if (k === 0) { const L = Q(rr * th[0], th[1]); return { q: `半径 ${CM(rr)}、中心角 $${piT(th)}\\,\\mathrm{rad}$ のおうぎ形の弧の長さは ${BOX('cm')}`, a: `$${piT(L)}$`, easy: `$${rr}\\times${piT(th)}=${piT(L)}$` }; }
          const S = Q(rr * rr * th[0], 2 * th[1]);
          return { q: `半径 ${CM(rr)}、中心角 $${piT(th)}\\,\\mathrm{rad}$ のおうぎ形の面積は ${BOX('cm^{2}')}`, a: `$${piT(S)}$`, easy: `$\\frac{1}{2}\\times${rr * rr}\\times${piT(th)}=${piT(S)}$` };
        }
        const rr = r.pick([6, 9, 10, 12, 15]), t = r.pick([1, 2, 3, 5]), L = Q(rr * t, 30);
        return { q: `長い針は1分で $\\frac{\\pi}{30}\\,\\mathrm{rad}$ 回る。長さ ${CM(rr)} の長い針の先が $${t}$ 分で進む道のりは ${BOX('cm')}`, a: `$${piT(L)}$`, easy: `$${rr}\\times\\frac{${t === 1 ? '' : t}\\pi}{30}=${piT(L)}$` };
      },
      // わな：中心角が度（そのまま θ に入れない。わざ 4-08）
      trap(r) {
        const a = r.pick([30, 45, 60, 90, 120]), rr = r.pick([2, 3, 4, 6]), L = arcOf(rr, a), th = Q(a, 180);
        return dest({ q: `半径 ${CM(rr)}、中心角 ${MD(a)} のおうぎ形の弧の長さは ${BOX('cm')}`, a: `$${piT(L)}$` }, '4-11', `${MD(a)} はラジアンではない。$${rr}\\times${a}$ はまちがい。$${D(a)}=${piT(th)}$ rad に直して $${rr}\\times${piT(th)}=${piT(L)}$`);
      },
    },
  });

  // ================================================================ 4-12 ベルトと車輪
  M.add({
    id: '4-12', part: 1, chap: '4-2⑤', stars: 1,
    title: 'ベルト・転がる車輪は「動いた長さ÷半径」',
    mark: '**ベルト**でつないだ2つの車（プーリー）、すべらずに**転がる**タイヤ。',
    futsu: ['1回転で動く長さ $2\\pi r$ を出して、', '何回転したかを出し、', '角度に直す。'],
    raku: ['ベルトが $30\\,\\mathrm{cm}$ 動く', '半径 $5\\,\\mathrm{cm}$：$\\theta=\\frac{30}{5}=6\\,\\mathrm{rad}$', '半径 $15\\,\\mathrm{cm}$：$\\theta=\\frac{30}{15}=2\\,\\mathrm{rad}$'],
    why: 'すべらなければ、車のふちはベルト（地面）と同じ長さ $s$ だけ動く。$s=r\\theta$ から $\\theta=\\frac{s}{r}$。半径が大きいほど、回る角は小さい（4-2⑤）。',
    caution: '同じ軸に固定した2つの車は、回る角が同じ（ふちの動く長さは半径に比例する）。ベルトでつないだときと区別する。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /ベルト|タイヤ|プーリー|転が/.test(q) && !/同じ軸/.test(q); },
    steps: {
      s1(r) {
        const rr = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]), th = r.int(2, 8), s = rr * th;
        return { q: `ベルトが ${CM(s)} 動くと、ベルトをかけた半径 ${CM(rr)} のプーリー（車）は ${BOX('rad')} 回る`, a: `$${th}$`, easy: `$\\frac{${s}}{${rr}}=${th}$` };
      },
      // 2つのプーリー（回る角は半径に反比例）
      s2(r) {
        const r1 = r.pick([2, 3, 4, 5, 6]), k = r.pick([2, 3, 4]), r2 = r1 * k, th2 = r.int(1, 4), th1 = th2 * k;
        if (r.chance(0.6)) return { q: `半径 ${CM(r1)} と ${CM(r2)} のプーリーをベルトでつなぐ。小さいほうが $${th1}\\,\\mathrm{rad}$ 回ると、大きいほうは ${BOX('rad')} 回る`, key: `412:${r1}/${r2}/${th1}`, a: `$${th2}$`, easy: `ベルトは $${r1}\\times${th1}=${r1 * th1}$ cm 動く。$\\frac{${r1 * th1}}{${r2}}=${th2}$`, easyCheck: 'last' };
        return { q: `半径 ${CM(r1)} と ${CM(r2)} のプーリーをベルトでつなぐ。大きいほうが $${th2}\\,\\mathrm{rad}$ 回ると、小さいほうは ${BOX('rad')} 回る`, key: `412:${r1}/${r2}/${th1}`, a: `$${th1}$`, easy: `ベルトは $${r2}\\times${th2}=${r2 * th2}$ cm 動く。$\\frac{${r2 * th2}}{${r1}}=${th1}$`, easyCheck: 'last' };
      },
      // タイヤ：回転数から道のり（π を残す・約）、道のりから角
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const rr = r.pick([0.3, 0.25, 0.35, 0.4, 0.5]), n = r.pick([10, 20, 50, 100]), L = +(2 * rr * n).toFixed(6); return { q: `半径 $${rr}\\,\\mathrm{m}$ のタイヤが、すべらずに $${n}$ 回転すると ${BOX('m')} 進む`, a: `$${piC(L)}$`, easy: `1回転で $2\\pi\\times${rr}=${piC(2 * rr)}$。$${piC(2 * rr)}\\times${n}=${piC(L)}$`, easyCheck: 'last', key: `412:t${rr}/${n}` }; }
        if (k === 1) { const rr = r.pick([0.3, 0.25, 0.4, 0.5]), n = r.pick([10, 20, 50]), L = +(2 * rr * n).toFixed(6), ap = +(L * 3.14).toFixed(6); return { q: `半径 $${rr}\\,\\mathrm{m}$ のタイヤが、すべらずに $${n}$ 回転すると約 ${BOX('m')} 進む（$\\pi=3.14$ とする）`, a: `$${fmt(ap)}$`, key: `412:t${rr}/${n}`, easy: `$${piC(L)}=${fmt(L)}\\times3.14=${fmt(ap)}$`, easyCheck: false, verify: () => close(ap, 2 * rr * n * 3.14) || 'まちがい' }; }
        const rr = r.pick([0.2, 0.25, 0.4, 0.5]), th = r.pick([10, 20, 30, 40, 50]), s = +(rr * th).toFixed(6);
        return { q: `半径 $${rr}\\,\\mathrm{m}$ のタイヤが、すべらずに $${fmt(s)}\\,\\mathrm{m}$ 進むと、タイヤは ${BOX('rad')} 回る`, a: `$${th}$`, easy: `$\\frac{${fmt(s)}}{${rr}}=${th}$` };
      },
      // わな：同じ軸に固定した2つの車（回る角は同じ）
      trap(r) {
        const r1 = r.pick([2, 3, 4, 5]), r2 = r1 * r.pick([2, 3, 4]), th = r.pick([1, 2, 3, 0.5, 1.5]);
        return dest({ q: `同じ軸に固定した半径 ${CM(r1)} と ${CM(r2)} の2つの車がある。小さいほうが $${fmt(th)}\\,\\mathrm{rad}$ 回ると、大きいほうは ${BOX('rad')} 回る`, a: `$${fmt(th)}$`, verify: () => true }, '4-12', `同じ軸なので、回る角は同じ。ベルトではないので、半径でわらない`);
      },
    },
  });

  // ================================================================ 4-13 接線
  // 図：円O（半径 R）、外の点P、接点A・B。全体を rho 度回す。rP：Pの角のしるしの半径
  const R13 = 2.6;
  function fig413(phi, labs, rho, one, rP) {
    const R = one ? 3.1 : R13, d = R / Math.sin(rad(phi / 2)), O = [0, 0];
    let P = [d, 0], A = at(90 - phi / 2, R), B = at(-(90 - phi / 2), R);
    [P, A, B] = [P, A, B].map(p => rot(p, rho));
    const items = [['circle', O, R], ['dot', O], ['label', O, 'O', anch(minus(O, P))], ['seg', O, A], ['seg', A, P],
      ['label', A, 'A', anch(A)], ['label', P, 'P', anch(minus(P, O))], ['right', O, A, P, 0.35]];
    if (one) items.push(['seg', O, P], mark(A, P, O, labs.P, rP), mark(A, O, P, labs.O, 1.1));   // Oの角の弧は大きく（字が弧のそばに来る）
    else items.push(['seg', O, B], ['seg', B, P], ['label', B, 'B', anch(B)], ['right', O, B, P, 0.35], mark(A, P, B, labs.P, rP), mark(A, O, B, labs.O));
    return { fig: { s: FS, items: edge(placeO(items)) }, chk: { P: one ? angAt(A, P, O) : angAt(A, P, B), O: one ? angAt(A, O, P) : angAt(A, O, B), A: angAt(O, A, P) } };
  }
  const SEN = '円Oの外の点Pから引いた2本の接線の接点がA、B。';  // 同じ見開きの重なり（N-2）：∠APB と ∠AOB の組（小さい順）。逆の問題も同じ key
  const K413 = g => '413:' + Math.min(g, 180 - g);
  M.add({
    id: '4-13', part: 1, chap: '4-2⑥', stars: 1,
    title: '接線は半径に垂直：$\\angle\\mathrm{AOB}=180^{\\circ}-\\angle\\mathrm{APB}$',
    mark: '円の外の点Pから**2本の接線**。接点と中心を結ぶと、直角が2つできる。',
    futsu: ['円の中心と接点を結んで、', '四角形の内角の和 $360^{\\circ}$ から、', '3つの角をひく。'],
    raku: ['$\\angle\\mathrm{APB}=50^{\\circ}$', '直角が2つで $180^{\\circ}$', '$\\angle\\mathrm{AOB}=180^{\\circ}-50^{\\circ}=130^{\\circ}$'],
    why: '接線は接点で半径に垂直なので、四角形OAPBには直角が2つある。のこりの2つの角の和は $360^{\\circ}-180^{\\circ}=180^{\\circ}$（4-2⑥）。',
    caution: 'Pが円の上にあるとき（PA・PBが接線でないとき）は使えない。そのときは円周角（わざ 4-14）。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 1 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /接線/.test(q) && /\\angle/.test(q); },
    steps: {
      s1(r) {
        const g = r.int(4, 32) * 5;
        return { q: `${SEN}$${ANG('APB')}=${D(g)}$ のとき、$${ANG('AOB')}$`, a: MD(180 - g), easy: `$180^{\\circ}-${D(g)}=${D(180 - g)}$`, key: K413(g) };
      },
      // ∠AOB から ∠APB、1本の接線（三角形OAP）
      s2(r) {
        if (r.chance(0.55)) { const g = r.int(4, 32) * 5; return { q: `${SEN}$${ANG('AOB')}=${D(g)}$ のとき、$${ANG('APB')}$`, a: MD(180 - g), easy: `$180^{\\circ}-${D(g)}=${D(180 - g)}$`, key: K413(g) }; }
        const g = r.int(4, 14) * 5;
        return { q: `円Oの接線PA（接点A）で、$${ANG('APO')}=${D(g)}$ のとき、$${ANG('AOP')}$`, a: MD(90 - g), easy: `$${ANG('OAP')}=90^{\\circ}$ なので $90^{\\circ}-${D(g)}=${D(90 - g)}$`, easyCheck: 'last', key: '413t:' + Math.min(g, 90 - g) };
      },
      // 図：2本の接線か1本の接線。Pの角が大きい（Pが円に近い）ときは、Pを上か下に置いて、角の文字が円にかからないようにする（R1-16）
      s3(r) {
        // （Oの角の数は字のはばが広いので、Oの角に数を書くときも、Pを上か下に置く）
        if (r.chance(0.7)) {
          const toO = r.chance(0.6), phi = toO ? r.int(8, 15) * 5 : r.int(11, 15) * 5, vert = !toO || phi > 55;
          const rho = vert ? r.pick([80, 90, 100, 260, 270, 280]) : r.pick([0, 20, 160, 180, 200, 340]);
          const { fig, chk } = fig413(phi, toO ? { P: MD(phi), O: LX } : { P: LX, O: MD(180 - phi) }, rho, false, vert ? 0.45 : null);
          if (figClash(fig)) return null;
          const ans = toO ? 180 - phi : phi;
          return { q: '図で、PA、PBは円Oの接線、A、Bは接点のとき、$\\angle x$ の大きさ', a: MD(ans), fig, easy: `$180^{\\circ}-${D(180 - ans)}=${D(ans)}$`, key: K413(phi),
            verify: () => (close(chk.A, 90) && close(chk.P, phi) && close(chk.O, 180 - phi)) || `図の角が合わない ${JSON.stringify(chk)}` };
        }
        // 1本の接線：Pの角はせまいので、Pの角に数を書けるのは 25° のときだけ（ほかは x をPの角に）
        const g = r.int(5, 7) * 5, phi = 2 * g, rho = r.pick([0, 20, 160, 180, 200, 340]), xP = r.chance(0.6);
        const { fig, chk } = fig413(phi, xP ? { P: LX, O: MD(90 - g) } : { P: MD(g), O: LX }, rho, true, 0.9);
        if (figClash(fig)) return null;
        const ans = xP ? g : 90 - g;
        return { q: '図で、PAは円Oの接線、Aは接点のとき、$\\angle x$ の大きさ', a: MD(ans), fig, easy: `$90^{\\circ}-${D(90 - ans)}=${D(ans)}$`, key: '413t:' + Math.min(g, 90 - g),
          verify: () => (close(chk.A, 90) && close(chk.P, g) && close(chk.O, 90 - g)) || `図の角が合わない ${JSON.stringify(chk)}` };
      },
      // わな：Pが円の上（接線ではない。円周角 わざ 4-14）
      trap(r) {
        const c = r.int(5, 16) * 10, rho = r.pick([0, 40, 90, 200]);
        const A = rot(at(270 - c / 2, 2.4), rho), B = rot(at(270 + c / 2, 2.4), rho), P = rot(at(r.int(70, 110), 2.4), rho);
        // 図は出さない（見開きに入らない。図は 4-14 の図と同じ形になる）。点は答えの確かめにだけ使う
        const xg = angAt(A, P, B);
        return dest({ q: `円Oの上に3点A、B、Pがある。$${ANG('AOB')}=${D(c)}$ のとき、$\\angle x=${ANG('APB')}$（Pは弧ABの上にない）`, a: MD(c / 2), verify: () => close(xg, c / 2) || `図の角 ${xg}` },
          '4-13', `PA、PBは接線ではない（Pは円の上）。$180^{\\circ}-${D(c)}$ ではなく、円周角は中心角の半分：$${D(c)}\\div2=${D(c / 2)}$`);
      },
    },
  });

  // ================================================================ 4-14 円周角
  const R14 = 3;
  M.add({
    id: '4-14', part: 1, chap: '4-2⑧', stars: 1,
    title: '円周角は中心角の半分、直径なら90°',
    mark: '1つの弧に対する**中心角と円周角**、または**直径**と円の上の点。',
    futsu: ['半径を引いて二等辺三角形を作り、', '底角と外角を使って、', '角を1つずつ求める。'],
    raku: ['中心角 $100^{\\circ}$ → 円周角 $50^{\\circ}$', 'ABが直径 → $\\angle\\mathrm{APB}=90^{\\circ}$', '$\\angle\\mathrm{PBA}=90^{\\circ}-35^{\\circ}=55^{\\circ}$'],
    why: '三角形OPBは二等辺三角形で、中心角はその外角なので、底角の2倍になる。直径は中心角 $180^{\\circ}$ なので、円周角は $90^{\\circ}$（4-2⑧）。',
    caution: '円周角を中心角と同じや2倍にしない。Pが弧ABの上にあるときは、反対がわの弧の中心角（$360^{\\circ}-\\angle\\mathrm{AOB}$）の半分になる。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /円/.test(q) && (/円周角|直径/.test(q) || /\\angle\\mathrm\{A[PQ]B\}/.test(q)) && !/接線/.test(q); },
    steps: {
      s1(r) {
        const c = r.int(4, 34) * 5 * (r.chance(0.5) ? 2 : 1);
        if (c >= 180 || c % 2) return null;
        return { q: `弧ABに対する中心角 $${ANG('AOB')}=${D(c)}$ のとき、円周角 $${ANG('APB')}$`, a: MD(c / 2), easy: `$${D(c)}\\div2=${D(c / 2)}$`, key: '414:' + c };
      },
      // 円周角から中心角（逆の問題は、同じ中心角をよける）、直径
      s2(r) {
        if (r.chance(0.5)) { const i = r.int(4, 17) * 5; return { q: `弧ABに対する円周角 $${ANG('APB')}=${D(i)}$ のとき、中心角 $${ANG('AOB')}$`, a: MD(2 * i), easy: `$${D(i)}\\times2=${D(2 * i)}$`, key: '414:' + 2 * i }; }
        const a = r.int(4, 14) * 5;
        return { q: `ABが円Oの直径で、Pは円の上の点。$${ANG('PAB')}=${D(a)}$ のとき、$${ANG('PBA')}$`, a: MD(90 - a), easy: `$${ANG('APB')}=90^{\\circ}$ なので $90^{\\circ}-${D(a)}=${D(90 - a)}$`, easyCheck: 'last', key: '414d:' + Math.min(a, 90 - a) };
      },
      // 図：中心角と円周角、直径、同じ弧の円周角。P と Q ははなして置く（R1-17）
      s3(r) {
        const k = r.int(0, 2), rho = r.pick([0, 0, 30, 90, 180, 270, 330]), O = [0, 0], T = p => rot(p, rho);
        if (k === 1) {
          const a = r.int(4, 13) * 5, A = T([-R14, 0]), B = T([R14, 0]), P = T(at(2 * a, R14));
          const fig = { s: FS, items: edge(placeO([['circle', O, R14], ['dot', O], ['label', O, 'O', anch(T([0, -1]))], ['poly', [A, B, P]], ['right', A, P, B, 0.35],
            ['label', A, 'A', anch(A)], ['label', B, 'B', anch(B)], ['label', P, 'P', anch(P)], mark(B, A, P, MD(a)), mark(A, B, P, LX)])) };
          if (figClash(fig)) return null;
          const chk = [angAt(B, A, P), angAt(A, B, P), angAt(A, P, B)];
          return { q: '図で、ABは円Oの直径のとき、$\\angle x$ の大きさ', a: MD(90 - a), fig, easy: `$90^{\\circ}-${D(a)}=${D(90 - a)}$`, key: '414d:' + Math.min(a, 90 - a),
            verify: () => (close(chk[0], a) && close(chk[1], 90 - a) && close(chk[2], 90)) || `図の角が合わない ${chk}` };
        }
        const c = r.int(5, 16) * 10, angP = r.int(75, 105), A = T(at(270 - c / 2, R14)), B = T(at(270 + c / 2, R14)), P = T(at(angP, R14));
        const items = [['circle', O, R14], ['dot', O], ['label', O, 'O', anch(minus(O, plus(A, B)))], ['path', [A, P, B]],
          ['label', A, 'A', anch(A)], ['label', B, 'B', anch(B)], ['label', P, 'P', anch(P)]];
        if (k === 0) {
          const toP = r.chance(0.6);
          items.push(['seg', A, O], ['seg', O, B], mark(A, O, B, toP ? MD(c) : LX), mark(A, P, B, toP ? LX : MD(c / 2)));
          const chk = [angAt(A, O, B), angAt(A, P, B)], fig = { s: FS, items: edge(placeO(items)) };
          if (figClash(fig)) return null;
          return { q: '図で、Oは円の中心のとき、$\\angle x$ の大きさ', a: MD(toP ? c / 2 : c), fig, easy: toP ? `$${D(c)}\\div2=${D(c / 2)}$` : `$${D(c / 2)}\\times2=${D(c)}$`, key: '414:' + c,
            verify: () => (close(chk[0], c) && close(chk[1], c / 2)) || `図の角が合わない ${chk}` };
        }
        const far = (u, v, d) => Math.abs(((u - v) % 360 + 540) % 360 - 180) >= d, pA = 270 - c / 2, pB = 270 + c / 2, pP = angP;
        const qs = []; for (let t = 0; t < 360; t += 5) if ((t < pA || t > pB) && far(t, pA, 45) && far(t, pB, 45) && far(t, pP, 50)) qs.push(t);
        if (!qs.length) return null;
        const Qp = T(at(r.pick(qs), R14));
        items.push(['path', [A, Qp, B]], ['label', Qp, 'Q', anch(Qp)], mark(A, P, B, MD(c / 2)), mark(A, Qp, B, LX));
        const chk = [angAt(A, P, B), angAt(A, Qp, B)], fig = { s: FS, items: edge(placeO(items)) };
        if (figClash(fig)) return null;
        return { q: '図で、4点A、B、P、Qは円Oの上にある。$\\angle x$ の大きさ', a: MD(c / 2), fig, easy: `（同じ弧ABに対する円周角は等しい）$\\angle x=${D(c / 2)}$`, key: '414q:' + c,
          verify: () => (close(chk[0], c / 2) && close(chk[1], c / 2)) || `図の角が合わない ${chk}` };
      },
      // わな：PA、PBが接線（Pは円の外。円周角ではない → わざ 4-13）。Pが弧ABの上にあるときの円周角は、4-14 そのもので解けるので caution へ（R1-7）
      trap(r) {
        const c = r.int(4, 16) * 10;
        // 確かめ：A、B での接線（半径に垂直）の交わる点Pを作って、∠APB をはかる
        const A = at(c / 2, 3), B = at(-c / 2, 3), P = inter(A, [-A[1], A[0]], B, [-B[1], B[0]]), xg = angAt(A, P, B);
        return dest({ q: `円Oの上の2点A、Bで、$${ANG('AOB')}=${D(c)}$。円の外の点Pから引いたPA、PBが円Oの接線のとき、$${ANG('APB')}$`, a: MD(180 - c), key: '414t:' + Math.min(c, 180 - c), verify: () => close(xg, 180 - c) || `図の角 ${xg}` },
          '4-14', `Pは円の上にないので、$\\angle\\mathrm{APB}$ は円周角ではない（$${D(c)}\\div2$ ではない）。接線は半径に垂直なので $180^{\\circ}-${D(c)}=${D(180 - c)}$`);
      },
    },
  });

  // ================================================================ 4-91 方位角から極座標の角へ
  // 方位角 φ（北から右回り）→ 極座標の角 θ（東から左回り）。確かめ：向きのベクトル（東、北）で比べる
  const toPolar = phi => ((90 - phi) % 360 + 360) % 360;
  const sameDir = (phi, th) => close(Math.sin(rad(phi)), Math.cos(rad(th))) && close(Math.cos(rad(phi)), Math.sin(rad(th)));
  const K491 = v => { const w = toPolar(v); return '491:' + Math.min(v % 360, w) + '/' + Math.max(v % 360, w); };
  const HOU = { 北東: 45, 南東: 135, 南西: 225, 北西: 315 };
  M.add({
    id: '4-91', part: 1, chap: '4-2⑩・もっと', stars: 1,
    title: '方位角から極座標の角へ：$90^{\\circ}-$方位角',
    mark: '**方位角**（北から右回り）で書いた向きを、極座標の角（東から左回り）に直す。',
    futsu: ['東西南北をかいた図に向きをかいて、', '東から左回りに、分度器ではかる。'],
    raku: ['方位角 $60^{\\circ}$', '$90^{\\circ}-60^{\\circ}=30^{\\circ}$', 'マイナスになったら $360^{\\circ}$ をたす'],
    why: '方位角の $0^{\\circ}$（北）は、極座標の $90^{\\circ}$。回る向きが反対なので、方位角がふえるほど極座標の角はへる。だから「$90^{\\circ}-$方位角」（4-2⑩、もっと）。',
    caution: '東からはかった右回りの角は、この方法ではない（$360^{\\circ}$ からひく）。どこから、どちら回りにはかった角かを先に見る。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '30mm', trap: '16mm' },
    fits(q) { return /方位角/.test(q); },
    steps: {
      s1(r) {
        const phi = r.int(0, 18) * 5, th = toPolar(phi);
        return { q: `方位角（北から右回り）が ${MD(phi)} の向きを、極座標の角（東から左回り）で`, a: MD(th), easy: `$90^{\\circ}-${D(phi)}=${D(th)}$`, verify: () => sameDir(phi, th) || '向きがちがう', key: K491(phi) };
      },
      // 方位角が 90° より大きい（360° をたす）、極座標の角から方位角
      s2(r) {
        const phi = r.int(7, 23) * 15, th = toPolar(phi);
        if (r.chance(0.65)) return { q: `方位角（北から右回り）が ${MD(phi)} の向きを、極座標の角（東から左回り）で`, a: MD(th), easy: `$90^{\\circ}-${D(phi)}+360^{\\circ}=${D(th)}$`, verify: () => sameDir(phi, th) || '向きがちがう', key: K491(phi) };
        const t2 = r.int(7, 23) * 15, p2 = toPolar(t2);
        return { q: `極座標の角（東から左回り）が ${MD(t2)} の向きを、方位角（北から右回り）で`, a: MD(p2), easy: t2 > 90 ? `$90^{\\circ}-${D(t2)}+360^{\\circ}=${D(p2)}$` : `$90^{\\circ}-${D(t2)}=${D(p2)}$`, verify: () => sameDir(p2, t2) || '向きがちがう', key: K491(t2) };
      },
      // 船の極座標、東西南北のことば
      s3(r) {
        const d = r.int(2, 9);
        if (r.chance(0.55)) {
          const phi = r.int(1, 23) * 15, th = toPolar(phi), ans = `$(${d},\\ ${D(th)})$`;
          return { q: `灯台から方位角 ${MD(phi)} の向きに $${d}\\,\\mathrm{km}$ の所にいる船の、灯台を中心にした極座標（距離は km）`, a: ans, key: K491(phi), easy: `距離 ${d}、角は $90^{\\circ}-${D(phi)}${phi > 90 ? '+360^{\\circ}' : ''}=${D(th)}$`, easyCheck: false,
            verify: () => sameDir(phi, th) && strip(ans) === `(${d},\\ ${D(th)})` || '向きがちがう' };
        }
        const w = r.pick(Object.keys(HOU)), phi = HOU[w], th = toPolar(phi), ans = `$(${d},\\ ${D(th)})$`;
        return { q: `中心Oから${w}へ $${d}\\,\\mathrm{km}$ の所の、Oを中心にした極座標（距離は km）`, a: ans, key: K491(phi), easy: `${w}は方位角 ${MD(phi)}。角は $90^{\\circ}-${D(phi)}${phi > 90 ? '+360^{\\circ}' : ''}=${D(th)}$`, easyCheck: false,
          verify: () => sameDir(phi, th) || '向きがちがう' };
      },
      // わな：東から右回りにはかった角（90° からひかない。360° からひく）
      trap(r) {
        const g = r.int(2, 17) * 5, th = 360 - g;
        return dest({ q: `東から右回りに ${MD(g)} の向きを、極座標の角（東から左回り）で`, a: MD(th),
          verify: () => (close(Math.cos(rad(-g)), Math.cos(rad(th))) && close(Math.sin(rad(-g)), Math.sin(rad(th)))) || '向きがちがう' },
        '4-91', `方位角ではない（はかりはじめが東）。$90^{\\circ}$ からひかずに、右回りなので $360^{\\circ}-${D(g)}=${D(th)}$`);
      },
    },
  });
})(globalThis.MONDAI);
