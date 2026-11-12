/* 問題集 第4巻　第2部 相似・三平方・面積と体積（わざ 4-15〜4-31、4-92・4-93）　組 b
 * 書き方は v4/README.md（第4巻）と v2/README.md。文は教科書 第4巻と同じ：ルビなし・常用漢字まで。式は $…$。
 * 図はステップ3だけ（K-2）：4-17・4-31 は平面の図、4-19・4-26 は立体の図（M.proj3 の斜投影、見えない辺は点線、円すいの底はだ円）。
 *   図の点の位置は、問題の数から計算する。長さはかならずラベルで書く。図のあるステップ3は2問（見開きに入る数）。
 *   わなは、文だけで形がわかるように書き、図は出さない（図を足すと右ページがあふれるため）。
 * 問題の文は、欄といっしょに1行に入る長さにする（第2部は文が長くなりやすい。ステップ3・わなの場面の問題は2行になってもよい）。
 * 答えが式1つでないもの（ことば・比・近似値）と、楽な形に途中の値を書いたもの（easyCheck: false）は、
 *   verify で別の道すじ（比例式の積・三平方の式・座標など）で確かめる。
 * わなは、そのわざでは楽にならない問題。同じ部のほかのわざで楽になるときは、dest で行き先（also）を書く（H-1）。 */
(function (M) {
  'use strict';
  const PART = 2;

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const close = (x, y, e) => x != null && y != null && Math.abs(x - y) <= (e || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const ev = s => M.evalMath(strip(s), {});
  const ok = (s, v) => close(ev(s), v) || `答え ${s} の値が ${fmt(v)} とちがう`;
  const fr = (n, d) => M.F.tex(M.F.make(n, d));                    // 約分した分数（整数なら整数）
  const rm = s => `\\mathrm{${s}}`;                                 // 点・辺の名前
  const P = (x, y) => `(${fmt(x)},\\ ${fmt(y)})`;                   // 座標
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));               // マイナスはかっこごと
  const range = (a, b, st) => { const o = []; for (let i = a; i <= b + 1e-9; i += (st || 1)) o.push(+i.toFixed(6)); return o; };
  // √n を k√m に（n は正の整数）
  const sqf = n => { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; };
  function rt(n, c) {                                               // c√n を簡単にした TeX
    c = c || 1;
    const [k, m] = sqf(n), K = c * k;
    if (m === 1) return `${K}`;
    return `${K === 1 ? '' : K}\\sqrt{${m}}`;
  }
  function piT(n, d) {                                              // (n/d)π の TeX：12\pi、\frac{4}{3}\pi、\pi
    const [a, b] = M.F.make(n, d || 1);
    if (b === 1) return `${a === 1 ? '' : a}\\pi`;
    return `\\frac{${a}}{${b}}\\pi`;
  }
  // 四捨五入：n/d（正の整数）を小数第 k 位まで。整数で計算するので、ずれない
  function rnd(n, d, k) { const p = 10 ** k, q = Math.floor((2 * n * p + d) / (2 * d)); return (q / p).toFixed(k); }
  // 10^e 倍すると、どれも整数になる 10^e（e は 0〜3）
  function scaleInt(...vs) { for (let e = 0; e <= 3; e++) { const f = 10 ** e; if (vs.every(v => Math.abs(v * f - Math.round(v * f)) < 1e-9)) return f; } return null; }
  const isSq = n => Number.isInteger(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
  // 同じ見開きの重なり（第36回 N-2）の key：数を小さい順にならべる。入れかえただけの問題・逆の問題（答えと数を入れかえたもの）が同じ key になる
  const NK = (tag, ...v) => tag + ':' + v.map(Number).sort((a, b) => a - b).join(',');

  // ---------------------------------------------------------------- 直角三角形の辺（見わけようの判定にも使う）
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  function isTripleLegs(a, b) {                                     // 直角をはさむ2辺が、ピタゴラス数の倍か
    const f = scaleInt(a, b); if (!f) return false;
    let x = Math.round(a * f), y = Math.round(b * f); const g = gcd(x, y); x /= g; y /= g; if (x > y) [x, y] = [y, x];
    return TRIPLES.some(t => t[0] === x && t[1] === y);
  }
  function isTripleHL(c, a) {                                       // 斜辺と1辺が、ピタゴラス数の倍か
    const f = scaleInt(c, a); if (!f) return false;
    let x = Math.round(c * f), y = Math.round(a * f); const g = gcd(x, y); x /= g; y /= g;
    return TRIPLES.some(t => t[2] === x && (t[0] === y || t[1] === y));
  }
  // 問題の文から、直角三角形の辺の組を読む：['legs', a, b]（直角をはさむ2辺）、['hl', c, a]（斜辺と1辺）、['tri', a, b, c]（3辺）
  const NUM = '\\$([0-9.]+)(?:\\\\,\\\\mathrm\\{[a-z]+\\})?\\$';  // $12$、$1.4\,\mathrm{m}$
  const coords = q => [...q.matchAll(/\(([^(),]+),\\ ([^()]+?)\)/g)].map(m => [m[1].trim(), m[2].trim()]);
  const numCoords = q => coords(q).filter(c => c.every(v => /^-?\d+(\.\d+)?$/.test(v))).map(c => c.map(Number));
  function rightPairs(q) {
    const out = [];
    const tryRe = (s, type) => { const m = new RegExp(s.replace(/#/g, NUM)).exec(q); if (m) out.push([type, +m[1], +m[2], m[3] != null ? +m[3] : null]); };
    tryRe('直角をはさむ2辺が # と #', 'legs');
    tryRe('斜辺が #、1辺が #', 'hl');
    tryRe('長さ # のはしご.*?かべから #', 'hl');
    tryRe('たて #、横 # の(?:長方形|画面|長方形の公園)の対角線', 'legs');
    tryRe('半径 # の円で、中心から #', 'hl');
    tryRe('底面の半径 #、高さ # の円すいの(?:表面積|側面積)', 'legs');
    tryRe('横 #、おく行き #、高さ # の直方体の、底面の対角線', 'legs');
    tryRe('3辺が #、#、#', 'tri');
    const c = numCoords(q);
    if (/距離/.test(q) && c.length >= 2) {
      const dx = Math.abs(c[1][0] - c[0][0]), dy = Math.abs(c[1][1] - c[0][1]);
      if (dx && dy) out.push(['legs', +fmt(dx), +fmt(dy)]);
    } else if (/距離/.test(q) && /原点/.test(q) && c.length === 1 && c[0][0] && c[0][1]) out.push(['legs', Math.abs(c[0][0]), Math.abs(c[0][1])]);
    return out;
  }
  function triTriple(a, b, c) {                                     // 3辺がピタゴラス数の倍か
    const s = [a, b, c].sort((x, y) => x - y);
    return isTripleLegs(s[0], s[1]) && close(s[0] * s[0] + s[1] * s[1], s[2] * s[2]);
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。keep なら楽な形の検算を残す
  function dest(p, self, why, keep) {
    const q = M.plain(p.q);
    const also = M.list(4).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    if (!keep) p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 図の部品
  const mid = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const lerp = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  // 辺 AB のまん中の外側（点 away と反対の側）に、長さのラベル
  function sideLab(A, B, t, away, off) {
    off = off || 0.7;
    const m = mid(A, B), dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
    let nx = -dy / L, ny = dx / L;
    if (away && (away[0] - m[0]) * nx + (away[1] - m[1]) * ny > 0) { nx = -nx; ny = -ny; }
    return ['label', [m[0] + nx * off, m[1] + ny * off], t, 'c'];
  }
  // たての寸法線（x の所に、y0 から y1 まで。はしに短い横線）
  function dimV(x, y0, y1, t, dir) {
    return [['seg', [x, y0], [x, y1]], ['seg', [x - 0.2, y0], [x + 0.2, y0]], ['seg', [x - 0.2, y1], [x + 0.2, y1]], ['label', [x, (y0 + y1) / 2], t, dir]];
  }
  // 図全体を動かす（点の配列を f で写す）。items の中の点を写しなおす
  function mapFig(items, f) {
    const pt = a => Array.isArray(a) && a.length === 2 && typeof a[0] === 'number';
    return items.map(it => it.map(a => (pt(a) ? f(a) : Array.isArray(a) && a.length && pt(a[0]) ? a.map(f) : a)));
  }
  const NUMLAB = v => (typeof v === 'number' ? fmt(v) : v);
  // 図の字の重なりを見る（第36回 N-6）：字の箱（ラベル）どうし、字の箱と線・点。重なれば、そのわけを返す（なければ ''）
  // 字のはばは core.js の figBox と同じ見つもり（字の大きさ 3.4 mm、数字・ローマ字は 0.6 字ぶん）
  const FONT = 3.4, LANCH = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.8, 0.8], nw: [-0.8, 0.8], se: [0.8, -0.8], sw: [-0.8, -0.8], c: [0, 0] };
  const textW = (t, sc) => [...String(t).replace(/\$/g, '').replace(/\\(?:mathrm|text)\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_ ]/g, '')].reduce((a, ch) => a + (/[　-鿿]/.test(ch) ? 1 : 0.6), 0) * FONT / sc;
  // ラベルの箱：アプリ（SVG）の置き方と、本（TikZ：点から 1.5pt はなして above・right…）の置き方の両方
  function labBoxes(it, sc) {
    const u = FONT / sc, v = LANCH[it[3] || 'c'], w = textW(it[2], sc), P = it[1], sep = 1.5 * 0.3528 / sc, h = 0.8 * u;
    const cx = P[0] + v[0] * 0.75 * u, cy = P[1] + v[1] * 0.75 * u, L = v[0] > 0.3 ? cx : v[0] < -0.3 ? cx - w : cx - w / 2;
    const tx = v[0] > 0.3 ? P[0] + sep : v[0] < -0.3 ? P[0] - sep - w : P[0] - w / 2, ty = v[1] > 0.3 ? P[1] + sep : v[1] < -0.3 ? P[1] - sep - h : P[1] - h / 2;
    return [[L, cy - 0.4 * u, L + w, cy + 0.4 * u, it[2]], [tx, ty, tx + w, ty + h, it[2]]];
  }
  // 線分 PQ が箱 b（[x0, y0, x1, y1]、まわりを e だけ小さくした箱）を通るか
  function segBox(P, Q, b, e) {
    let t0 = 0, t1 = 1;
    const dx = Q[0] - P[0], dy = Q[1] - P[1];
    for (const [pp, qq] of [[-dx, P[0] - (b[0] + e)], [dx, (b[2] - e) - P[0]], [-dy, P[1] - (b[1] + e)], [dy, (b[3] - e) - P[1]]]) {
      if (pp === 0) { if (qq < 0) return false; continue; }
      const t = qq / pp;
      if (pp < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return t0 < t1;
  }
  function figClash(fig) {
    const sc = fig.s || 5, boxes = [], segs = [], pts = [];
    for (const it of fig.items) {
      const k = it[0];
      if (k === 'label' && it[2]) { const id = boxes.length; labBoxes(it, sc).forEach(b => boxes.push(b.concat(id))); }
      else if (k === 'seg') segs.push([it[1], it[2]]);
      else if (k === 'poly' || k === 'path') { const ps = it[1]; for (let i = 0; i + 1 < ps.length; i++) segs.push([ps[i], ps[i + 1]]); if (k === 'poly') segs.push([ps[ps.length - 1], ps[0]]); }
      else if (k === 'ellipse') { const [, C, rx, ry, d0 = 0, d1 = 360] = it; for (let j = 0; j < 24; j++) { const a0 = (d0 + (d1 - d0) * j / 24) * Math.PI / 180, a1 = (d0 + (d1 - d0) * (j + 1) / 24) * Math.PI / 180; segs.push([[C[0] + rx * Math.cos(a0), C[1] + ry * Math.sin(a0)], [C[0] + rx * Math.cos(a1), C[1] + ry * Math.sin(a1)]]); } }
      else if (k === 'dot') pts.push(it[1]);
    }
    const e = 0.06, inB = (q, b) => q[0] > b[0] + e && q[0] < b[2] - e && q[1] > b[1] + e && q[1] < b[3] - e;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      for (let j = i + 1; j < boxes.length; j++) { const c = boxes[j], g = 0.15; if (c[5] === b[5]) continue; if (b[0] < c[2] + g && c[0] < b[2] + g && b[1] < c[3] + g && c[1] < b[3] + g) return `字「${b[4]}」と字「${c[4]}」`; }
      for (const [A, B] of segs) if (segBox(A, B, b, e)) return `字「${b[4]}」と線`;
      for (const q of pts) if (inB(q, b)) return `字「${b[4]}」と点`;
    }
    return '';
  }
  // 辺の長さのラベルが、その辺にいちばん近いか（ほかの辺のほうが近いと、どの辺の長さか読みにくい。R1-20）
  function labNearest(lab, own, others) {
    const d = (q, [A, B]) => { const ab = [B[0] - A[0], B[1] - A[1]], t = Math.max(0, Math.min(1, ((q[0] - A[0]) * ab[0] + (q[1] - A[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2))); return Math.hypot(q[0] - A[0] - t * ab[0], q[1] - A[1] - t * ab[1]); };
    const c = lab[1], mine = d(c, own);
    return others.every(sg => d(c, sg) > mine + 0.25);
  }
  const FIGPAD = 1.0;                                               // 図のまわりの余白（単位）。はしのラベルの字が切れないように

  // ================================================================ 4-15
  const RAT15 = [[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [1, 3], [3, 2], [4, 3], [5, 3], [2, 1], [5, 2], [5, 4]];
  const sideOf = (T, i) => T[i] + T[(i + 1) % 3];                  // 記号の順の i 番めの辺（AB、BC、CA）
  const sortName = s => [...s].sort().join('');                     // DF のように、アルファベット順で書く
  // △T1 ∽ △T2。i 番めの辺の組の長さと、もう1つの辺から、対応する辺を聞く
  function soji15(r, T1, T2, opt) {
    opt = opt || {};
    const [s, t] = r.pick(RAT15), m = r.int(2, 4);
    const i = r.int(0, 2), j = (i + r.int(1, 2)) % 3;
    const X = s * m, Xp = t * m;
    if (X > 30 || Xp > 30) return null;
    const [f, g] = opt.askFirst ? [t, s] : [s, t];                 // わかっている側：聞く側＝f：g
    const Ys = range(2, 18).filter(y => (2 * y * g) % f === 0 && y * g / f <= 36 && y !== (opt.askFirst ? Xp : X));
    if (!Ys.length) return null;
    const Y = r.pick(Ys), ans = Y * g / f;
    const nm = opt.sorted ? sortName : (x => x);
    const s1i = sideOf(T1, i), s1j = sideOf(T1, j), s2i = nm(sideOf(T2, i)), s2j = nm(sideOf(T2, j));
    const known = opt.askFirst ? s2j : s1j, asked = opt.askFirst ? s1j : s2j;
    const q = `$\\triangle${rm(T1)}\\sojisym\\triangle${rm(T2)}$、$${rm(s1i)}=${X}$、$${rm(s2i)}=${Xp}$、$${rm(known)}=${Y}$ のとき $${rm(asked)}$`;
    const ratio = opt.askFirst ? `${rm(s2i)}:${rm(s1i)}=${Xp}:${X}=${t}:${s}` : `${rm(s1i)}:${rm(s2i)}=${X}:${Xp}=${s}:${t}`;
    return {
      q, a: `$${fmt(ans)}$`, key: NK('415', X, Xp) + '|' + NK('', Y, ans),
      easy: `$${ratio}$、$${rm(asked)}=${Y}\\times${fr(g, f)}=${fmt(ans)}$`,
      verify: () => close(ans * (opt.askFirst ? Xp : X), Y * (opt.askFirst ? X : Xp)) || '比例式が合わない',
    };
  }
  M.add({
    id: '4-15', part: PART, chap: '4-3②', stars: 1,
    title: '相似は記号の順に組み、比を簡単にしてからかける',
    mark: '$\\triangle\\mathrm{ABC}\\sojisym\\triangle\\mathrm{DEF}$ と、**対応する辺**の長さが1組わかっている。',
    futsu: ['求める辺ごとに、比例式', '$8:x=6:9$ を作って、', '1つずつ解く。'],
    raku: ['$\\mathrm{AB}:\\mathrm{DE}=6:9=2:3$', '大きいほうは $\\frac{3}{2}$ 倍', '$\\mathrm{EF}=8\\times\\frac{3}{2}=12$', '$\\mathrm{FD}=5\\times\\frac{3}{2}=7.5$'],
    why: '相似の記号は、対応する頂点を同じ順に書く約束（1番めどうし・2番めどうし）。相似比を簡単にして倍率にすれば、どの辺も同じ倍率をかけるだけで求められる（4-3②）。',
    caution: '図が回ったり裏返ったりしていても、見た目の位置で辺を組まない。記号の順番で対応を決める。相似と書いていなければ、この方法は使えない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '16mm', s3: '14mm', trap: '22mm' },
    fits(q) { return /\\sojisym/.test(q) && !/面積|体積/.test(q); },
    steps: {
      // △ABC∽△DEF：小さいほう（または大きいほう）の辺から、対応する辺
      s1(r) { return soji15(r, 'ABC', 'DEF'); },
      // 聞くのが前の三角形の辺／ほかの文字／相似比そのもの
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) return soji15(r, 'ABC', 'DEF', { askFirst: true });
        if (k === 1) { const [T1, T2] = r.pick([['PQR', 'STU'], ['PQR', 'XYZ'], ['ABC', 'PQR'], ['ABC', 'XYZ']]); return soji15(r, T1, T2, { askFirst: r.chance(0.5) }); }
        const [s, t] = r.pick(RAT15), m = r.int(2, 5), i = r.int(0, 2);
        const X = s * m, Xp = t * m, a1 = sideOf('ABC', i), a2 = sideOf('DEF', i);
        return {
          q: `$\\triangle\\mathrm{ABC}\\sojisym\\triangle\\mathrm{DEF}$、$${rm(a1)}=${X}$、$${rm(a2)}=${Xp}$。相似比（簡単な比で）`,
          a: `$${s}:${t}$`, easy: `$${X}:${Xp}$ を ${m} でわって $${s}:${t}$`,
          verify: () => (gcd(s, t) === 1 && s * Xp === t * X) || '比が合わない',
        };
      },
      // 見かけがちがう：2つめの三角形の頂点の順が入れかわっている（図が回って・裏返って いる）
      s3(r) {
        const T2 = r.pick(['DFE', 'EDF', 'EFD', 'FDE', 'FED']);
        return soji15(r, 'ABC', T2, { sorted: true, askFirst: r.chance(0.3) });
      },
      // わな：相似と書いていない（辺の組が1つと角1つだけでは、形が決まらない）
      trap(r) {
        const X = r.int(4, 9), Y = r.int(3, 12), Xp = r.intNot(4, 15, v => v === X), ang = r.chance(0.5);
        const p = {
          q: `$\\triangle\\mathrm{ABC}$ と $\\triangle\\mathrm{DEF}$、${ang ? '$\\angle\\mathrm{B}=\\angle\\mathrm{E}$、' : ''}$\\mathrm{AB}=${X}$、$\\mathrm{BC}=${Y}$、$\\mathrm{DE}=${Xp}$。$\\mathrm{EF}$ は$\\text{（決まる・決まらない）}□$`,
          a: '決まらない',
          // EF がどんな長さでも、DE と（∠E と）は三角形DEFを作れる：2とおりの EF で、ともに条件をみたす
          verify: () => [Y * Xp / X, Y * Xp / X + 1].every(e => e > 0) || 'まちがい',
        };
        return dest(p, '4-15', `相似と書いていない。${ang ? '角が1つ等しいだけでは、' : ''}辺の比が等しいかわからないので、$\\mathrm{EF}$ は決まらない`);
      },
    },
  });

  // ================================================================ 4-16
  const RAT16 = [[2, 3], [3, 4], [4, 5], [1, 2], [3, 2], [4, 3], [5, 4], [5, 6], [6, 5], [2, 5], [3, 5], [5, 3]];
  const OBJ16 = ['ビル', '木', '電柱', '塔'];
  function shadow(r, person) {
    const [a, b] = r.pick(RAT16);
    const us = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6].filter(u => a * u <= 2.4 && b * u <= 3 && a * u >= 0.5 && (!person || (a * u >= 1.2 && a * u <= 1.9)));
    if (!us.length) return null;
    const u = r.pick(us), h1 = +(a * u).toFixed(6), s1 = +(b * u).toFixed(6);
    const t = r.pick([2, 3, 4, 5, 6, 8, 10]);
    if (b * t > 40 || a * t > 40) return null;
    return { a, b, h1, s1, H: a * t, S: b * t, obj: r.pick(OBJ16) };
  }
  // X字形：点Oで交わる2本の直線、AB∥CD
  function xshape(r) {
    const [s, t] = r.pick([[2, 1], [3, 1], [3, 2], [4, 3], [1, 2], [2, 3], [5, 2], [4, 1], [3, 4]]), m = r.int(1, 3);
    const OA = s * m, OC = t * m, n = r.int(1, 4), AB = s * n * r.pick([1, 2]) / 1, CD = AB * t / s;
    if (!Number.isInteger(CD * 2) || OA > 16 || OC > 16 || AB > 20 || CD > 20 || AB < 2 || CD < 2) return null;
    return { OA, OC, AB, CD, s, t };
  }
  const xq = x => `ACとBDが点Oで交わるX字形で $\\mathrm{AB}\\parallel\\mathrm{CD}$、$\\mathrm{OA}=${x.OA}$、$\\mathrm{OC}=${x.OC}$、$\\mathrm{AB}=${x.AB}$ のとき、$\\mathrm{CD}$`;
  M.add({
    id: '4-16', part: PART, chap: '4-3③④', stars: 1,
    title: '影は「高さ÷影」が同じ（ピンホールは距離の比）',
    mark: '**同じ時刻**の棒と木の影、または小さな**穴**を通る光（X字形：AC と BD が点Oで交わり、$\\mathrm{AB}\\parallel\\mathrm{CD}$）。',
    futsu: ['日光の線をかいて2つの三角形の', '対応する辺を探し、比例式', '$1.2:x=1.8:15$ を解く。'],
    raku: ['棒の 高さ÷影＝$1.2\\div1.8=\\frac{2}{3}$', 'ビルも同じ $\\frac{2}{3}$', '$15\\times\\frac{2}{3}=10$（m）'],
    why: '同じ時刻なら日光のかたむきが同じで、棒の三角形とビルの三角形は相似（2つの角）。だから1つの三角形の中の比「高さ÷影」も同じになる（4-3③）。ピンホールは、穴で交わるX字形の相似で、相似比は穴からの距離の比（4-3④）。',
    caution: 'ピンホールは、単位をそろえてから比を作る（4 m と 10 cm は 400 cm と 10 cm）。時刻がちがう影は、日光のかたむきがちがうので使えない。',
    counts: { s1: 7, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: '14mm',
    fits(q) { return /同じ時刻/.test(q) || /穴|X字形/.test(q); },
    steps: {
      // 棒の影から、ビル・木の高さ
      s1(r) {
        const x = shadow(r); if (!x) return null;
        return {
          q: `$${fmt(x.h1)}\\,\\mathrm{m}$ の棒の影が $${fmt(x.s1)}\\,\\mathrm{m}$。同じ時刻に影 $${x.S}\\,\\mathrm{m}$ の${x.obj}の高さ □ m`,
          a: `$${x.H}$`, easyCheck: false, key: NK('416', x.h1, x.s1, x.H, x.S),
          easy: `高さ÷影＝$${fmt(x.h1)}\\div${fmt(x.s1)}=${fr(x.a, x.b)}$、$${x.S}\\times${fr(x.a, x.b)}=${x.H}$`,
          verify: () => close(x.H * x.s1, x.S * x.h1) || '比例式が合わない',
        };
      },
      // 高さから影を／人の身長で
      s2(r) {
        const person = r.chance(0.5), x = shadow(r, person); if (!x) return null;
        const who = person ? `身長 $${fmt(x.h1)}\\,\\mathrm{m}$ の人` : `$${fmt(x.h1)}\\,\\mathrm{m}$ の棒`;
        if (r.chance(0.5)) {
          return {
            q: `${who}の影が $${fmt(x.s1)}\\,\\mathrm{m}$。同じ時刻に高さ $${x.H}\\,\\mathrm{m}$ の${x.obj}の影 □ m`,
            a: `$${x.S}$`, easyCheck: false, key: NK('416', x.h1, x.s1, x.H, x.S),
            easy: `影÷高さ＝$${fmt(x.s1)}\\div${fmt(x.h1)}=${fr(x.b, x.a)}$、$${x.H}\\times${fr(x.b, x.a)}=${x.S}$`,
            verify: () => close(x.H * x.s1, x.S * x.h1) || '比例式が合わない',
          };
        }
        return {
          q: `${who}の影が $${fmt(x.s1)}\\,\\mathrm{m}$。同じ時刻に影 $${x.S}\\,\\mathrm{m}$ の${x.obj}の高さ □ m`,
          a: `$${x.H}$`, easyCheck: false, key: NK('416', x.h1, x.s1, x.H, x.S),
          easy: `高さ÷影＝$${fmt(x.h1)}\\div${fmt(x.s1)}=${fr(x.a, x.b)}$、$${x.S}\\times${fr(x.a, x.b)}=${x.H}$`,
          verify: () => close(x.H * x.s1, x.S * x.h1) || '比例式が合わない',
        };
      },
      // 見かけがちがう：ピンホールカメラ（単位をそろえる）、X字形
      s3(r) {
        if (r.chance(0.3)) {
          const x = xshape(r); if (!x) return null;
          return { q: xq(x), a: `$${fmt(x.CD)}$`, easy: `相似比 $\\mathrm{OA}:\\mathrm{OC}=${x.OA}:${x.OC}$、$\\mathrm{CD}=${x.AB}\\times${fr(x.OC, x.OA)}=${fmt(x.CD)}$`, verify: () => close(x.CD * x.OA, x.AB * x.OC) || 'まちがい' };
        }
        const D = r.pick([2, 4, 5, 8, 10, 20]), d = r.pick([4, 5, 8, 10, 20]), H10 = r.pick([15, 16, 18, 20, 24, 30, 40, 50, 60, 80, 100, 120]);
        const img10 = H10 * d / D;
        if (!Number.isInteger(img10) || img10 < 10) return null;
        const H = H10 / 10, img = img10 / 10;
        const what = H10 <= 20 ? `身長 $${fmt(H)}\\,\\mathrm{m}$ の人` : `高さ $${fmt(H)}\\,\\mathrm{m}$ の${r.pick(['木', '建物', '塔'])}`;
        return {
          q: `ピンホールカメラで、穴から $${D}\\,\\mathrm{m}$ の${what}をうつす。穴から像までが $${d}\\,\\mathrm{cm}$ のとき、像の高さ □ cm`,
          a: `$${fmt(img)}$`,
          easy: `cm にそろえて、相似比は $${D * 100}:${d}$。$${H10 * 10}\\times${fr(d, D * 100)}=${fmt(img)}$`,
          verify: () => close(img * D * 100, H10 * 10 * d) || 'まちがい',
        };
      },
      // わな：時刻がちがう影（日光のかたむきがちがうので、相似にならない）
      trap(r) {
        const x = shadow(r); if (!x) return null;
        const [t1, t2] = r.pick([['午前9時', '正午'], ['午前10時', '午後3時'], ['正午', '午後4時'], ['午前8時', '午前11時']]);
        const S = x.S + r.pick([-2, 3, 5]);
        if (S <= 0) return null;
        const p = {
          q: `${t1}に $${fmt(x.h1)}\\,\\mathrm{m}$ の棒の影が $${fmt(x.s1)}\\,\\mathrm{m}$。${t2}に影 $${S}\\,\\mathrm{m}$ の${x.obj}の高さは$\\text{（決まる・決まらない）}□$`,
          a: '決まらない', verify: () => t1 !== t2 || 'まちがい',
        };
        return dest(p, '4-16', '時刻がちがうと、日光のかたむきがちがう。2つの三角形は相似にならない');
      },
    },
  });

  // ================================================================ 4-17
  const RAT17 = [[1, 1], [1, 2], [2, 1], [2, 3], [3, 2], [3, 1], [1, 3], [3, 4], [4, 3], [2, 5], [5, 2], [4, 1]];
  const TRI17 = '$\\triangle\\mathrm{ABC}$、$\\mathrm{DE}\\parallel\\mathrm{BC}$、';
  const K417 = x => NK('417', ...Object.values(x.given), x[x.ask]);
  // 平行線と線分の比の問題（kind：DE・EC・DB・DE2）。AD:DB＝a:b、BC＝(a+b)n
  function heikou(r, kind, rats) {
    const [a, b] = r.pick(rats || RAT17), m = r.int(1, 3), n = r.int(1, 4), k = r.int(1, 3);
    const AD = a * m, DB = b * m, AB = AD + DB, BC = (a + b) * n, DE = a * n, AE = a * k, EC = b * k;
    if (AB > 24 || BC > 30 || AE + EC > 24 || BC < 6 || AB < 3) return null;
    const v = (nm, x) => `$${rm(nm)}=${x}$`;
    if (kind === 'DE') {
      return {
        kind, AD, DB, AE, EC, BC, DE, given: { AD, DB, BC }, ask: 'DE',
        q: `${v('AD', AD)}、${v('DB', DB)}、${v('BC', BC)} のとき $\\mathrm{DE}$`, a: `$${DE}$`,
        easy: `$\\mathrm{AD}:\\mathrm{AB}=${AD}:(${AD}+${DB})=${a}:${a + b}$、$\\mathrm{DE}=${BC}\\times${fr(a, a + b)}=${DE}$`,
        verify: () => close(DE * (AD + DB), BC * AD) || '比例式が合わない',
      };
    }
    if (kind === 'DE2') {
      return {
        kind, AD, DB, AE, EC, BC, DE: a * n, given: { AE, EC, BC }, ask: 'DE',
        q: `${v('AE', AE)}、${v('EC', EC)}、${v('BC', BC)} のとき $\\mathrm{DE}$`, a: `$${DE}$`,
        easy: `$\\mathrm{AE}:\\mathrm{AC}=${AE}:(${AE}+${EC})=${a}:${a + b}$、$\\mathrm{DE}=${BC}\\times${fr(a, a + b)}=${DE}$`,
        verify: () => close(DE * (AE + EC), BC * AE) || '比例式が合わない',
      };
    }
    if (kind === 'EC') {
      if (AE === AD && EC === DB) return null;
      return {
        kind, AD, DB, AE, EC, BC, DE, given: { AD, DB, AE }, ask: 'EC',
        q: `${v('AD', AD)}、${v('DB', DB)}、${v('AE', AE)} のとき $\\mathrm{EC}$`, a: `$${EC}$`,
        easy: `$\\mathrm{AE}:\\mathrm{EC}=\\mathrm{AD}:\\mathrm{DB}=${a}:${b}$、$\\mathrm{EC}=${AE}\\times${fr(b, a)}=${EC}$`,
        verify: () => close(AD * EC, DB * AE) || '比例式が合わない',
      };
    }
    // DB：AD・DE・BC から（AB＝AD×BC÷DE をさきに）
    return {
      kind, AD, DB, AE, EC, BC, DE, given: { AD, DE, BC }, ask: 'DB',
      q: `${v('AD', AD)}、${v('DE', DE)}、${v('BC', BC)} のとき $\\mathrm{DB}$`, a: `$${DB}$`, easyCheck: false,
      easy: `$\\mathrm{AB}=${AD}\\times${fr(BC, DE)}=${AB}$、$\\mathrm{DB}=${AB}-${AD}=${DB}$`,
      verify: () => close((AD + DB) * DE, AD * BC) || '比例式が合わない',
    };
  }
  // 三角形ABCと、DE∥BC の図。長さのラベルは x.given（と、聞く辺に x）
  // 点 P から、向き v のほうにラベルを置くときの向きの名前（n・ne・e…）
  function dirOf(v) {
    const a = Math.atan2(v[1], v[0]) * 180 / Math.PI, names = ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'];
    return names[((Math.round(a / 45) % 8) + 8) % 8];
  }
  const unit = v => { const L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L]; };
  function fig17(r, x) {
    // 形を決める：図に書く長さがわかる2辺と、そのあいだの角（55〜75°）。点の位置はその長さから計算する
    const AB = x.AD + x.DB, AC = x.AE + x.EC, BC = x.BC, th = r.int(55, 75) * Math.PI / 180;
    let A, B, C;
    if (x.kind === 'EC') {
      // A の角（45〜65°）をはさむ AB・AC。そのあと BC が横になるように回す
      const ta = r.int(45, 65) * Math.PI / 180, a1 = ta * (0.35 + 0.3 * r.next());
      const A0 = [0, 0], B0 = [AB * Math.cos(-Math.PI / 2 - a1), AB * Math.sin(-Math.PI / 2 - a1)], C0 = [AC * Math.cos(-Math.PI / 2 + ta - a1), AC * Math.sin(-Math.PI / 2 + ta - a1)];
      const ang = Math.atan2(C0[1] - B0[1], C0[0] - B0[0]);
      const R2 = p => { const q = [p[0] - B0[0], p[1] - B0[1]]; return [q[0] * Math.cos(-ang) - q[1] * Math.sin(-ang), q[0] * Math.sin(-ang) + q[1] * Math.cos(-ang)]; };
      A = R2(A0); B = [0, 0]; C = R2(C0);
    } else if (x.kind === 'DE2') { B = [0, 0]; C = [BC, 0]; A = [BC - AC * Math.cos(th), AC * Math.sin(th)]; }
    else { B = [0, 0]; C = [BC, 0]; A = [AB * Math.cos(th), AB * Math.sin(th)]; }
    const xs = [A[0], B[0], C[0]], w = Math.max(...xs) - Math.min(...xs), k = Math.min(8 / w, 4.4 / A[1]);
    const S = p => [p[0] * k, p[1] * k];
    const t = x.AD / AB, pA = S(A), pB = S(B), pC = S(C), pD = lerp(pA, pB, t), pE = lerp(pA, pC, t);
    const lab = Object.assign({}, x.given); lab[x.ask] = '$x$';
    const segs = { AD: [pA, pD, pC], DB: [pD, pB, pC], AE: [pA, pE, pB], EC: [pE, pC, pB], BC: [pB, pC, pA], DE: [pD, pE, pB] };
    let items = [['poly', [pA, pB, pC]], ['seg', pD, pE], ['par', pD, pE, 1], ['par', pB, pC, 1], ['dot', pD], ['dot', pE]];
    const sides = { AD: [pA, pD], DB: [pD, pB], AE: [pA, pE], EC: [pE, pC], BC: [pB, pC], DE: [pD, pE] };
    for (const key of Object.keys(lab)) {
      const [P1, P2, aw] = segs[key], L = sideLab(P1, P2, NUMLAB(lab[key]), key === 'DE' ? pA : aw, key === 'DE' ? 0.5 : 0.7);
      if (!labNearest(L, sides[key], Object.keys(sides).filter(k => k !== key).map(k => sides[k]))) return null;
      items.push(L);
    }
    // D・E のラベルは、辺の外がわ（辺の長さのラベルと同じ向き。2つの長さのラベルのあいだに来る）
    const out = (P1, P2, away) => { const n = unit([-(P2[1] - P1[1]), P2[0] - P1[0]]); return (away[0] - P1[0]) * n[0] + (away[1] - P1[1]) * n[1] > 0 ? [-n[0], -n[1]] : n; };
    items.push(['label', pA, 'A', 'n'], ['label', pB, 'B', 'sw'], ['label', pC, 'C', 'se'], ['label', pD, 'D', dirOf(out(pA, pB, pC))], ['label', pE, 'E', dirOf(out(pA, pC, pB))]);
    const FLIP = { n: 's', s: 'n', ne: 'se', se: 'ne', nw: 'sw', sw: 'nw', e: 'e', w: 'w', c: 'c' };
    if (r.chance(0.3)) items = mapFig(items, p => [p[0], -p[1]]).map(it => (it[0] === 'label' ? [it[0], it[1], it[2], FLIP[it[3]]] : it));   // 見かけ：上下さかさま（A が下）
    return { s: 5, pad: FIGPAD, items };
  }
  M.add({
    id: '4-17', part: PART, chap: '4-3④', stars: 1,
    title: 'DE∥BC なら AD:AB（全体）で',
    mark: '三角形ABCの辺AB上の点D、辺AC上の点Eと、**$\\mathrm{DE}\\parallel\\mathrm{BC}$**。',
    futsu: ['相似な2つの三角形をかき分けて、', '比例式 $4:6=x:9$ を作って解く。'],
    raku: ['$\\mathrm{AB}=4+2=6$ を先に', '$\\mathrm{AD}:\\mathrm{AB}=4:6=2:3$', '$\\mathrm{DE}=9\\times\\frac{2}{3}=6$'],
    why: '$\\mathrm{DE}\\parallel\\mathrm{BC}$ なら同位角が等しく、$\\triangle\\mathrm{ADE}\\sojisym\\triangle\\mathrm{ABC}$（2つの角）。BC に対応するのは、DB ではなく辺AB全体（4-3④）。',
    caution: 'DE を出すときに $\\mathrm{AD}:\\mathrm{DB}$ を使わない（$4:2$ ではなく $4:6$）。$\\mathrm{AE}:\\mathrm{EC}$ なら $\\mathrm{AD}:\\mathrm{DB}$ と同じでよい。',
    counts: { s1: 7, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: '14mm',
    fits(q) { return /\\parallel/.test(q) && /DE/.test(q) && !/X字形/.test(q); },
    steps: {
      // AD・DB・BC から DE
      s1(r) { const x = heikou(r, 'DE'); if (!x) return null; return { q: TRI17 + x.q, a: x.a, easy: x.easy, easyCheck: x.easyCheck, verify: x.verify, key: K417(x) }; },
      // AE:EC、DB を求める、E の側から DE
      s2(r) {
        const x = heikou(r, r.pick(['EC', 'DB', 'DE2'])); if (!x) return null;
        return { q: TRI17 + x.q, a: x.a, easy: x.easy, easyCheck: x.easyCheck, verify: x.verify, key: K417(x) };
      },
      // 図で（さかさまの三角形も）
      s3(r) {
        // 図では、短すぎる線分ができないように AD:DB を 1:2〜2:1 くらいに
        const x = heikou(r, r.pick(['DE', 'EC', 'DB', 'DE2']), [[1, 1], [1, 2], [2, 1], [2, 3], [3, 2], [3, 4], [4, 3], [3, 5], [5, 3]]); if (!x) return null;
        // 図に書く2辺の長さが近いもの（細長い三角形にしない）
        const AB = x.AD + x.DB, AC = x.AE + x.EC, q = x.kind === 'EC' ? AB / AC : x.kind === 'DE2' ? AC / x.BC : AB / x.BC;
        if (q < 0.6 || q > 1.6) return null;
        const fig = fig17(r, x); if (!fig || figClash(fig)) return null;
        return { q: '図で、$\\mathrm{DE}\\parallel\\mathrm{BC}$ のとき、$x$', a: x.a, easy: x.easy, easyCheck: x.easyCheck, verify: x.verify, fig, key: K417(x) };
      },
      // わな：X字形（全体ではなく、交わる点Oからの長さの比）
      trap(r) {
        const x = xshape(r); if (!x || x.AB < 0.8 * x.OA || x.AB > 2.4 * x.OA) return null;   // 図が細長くならないもの
        const p = { q: xq(x), a: `$${fmt(x.CD)}$`, verify: () => close(x.CD * x.OA, x.AB * x.OC) || 'まちがい' };
        return dest(p, '4-17', `O は AC と BD の交点。X字形は「全体」ではなく、交わる点Oからの長さの比 $\\mathrm{OA}:\\mathrm{OC}=${x.OA}:${x.OC}$：$${x.AB}\\times${fr(x.OC, x.OA)}=${fmt(x.CD)}$`);
      },
    },
  });

  // ================================================================ 4-18
  const RAT18 = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4], [4, 5]];
  const kTeX = (s, t, e) => (t % s === 0 ? `${t / s}^${e}` : `\\left(${fr(t, s)}\\right)^${e}`);
  M.add({
    id: '4-18', part: PART, chap: '4-3⑤', stars: 1,
    title: '面積は $k^2$ 倍、体積は $k^3$ 倍',
    mark: '**相似比**（縮尺・模型・半径が□倍）と、**面積・体積**。',
    futsu: ['大きいほうの辺の長さを', '1つずつ出して、面積や', '体積の公式に入れなおす。'],
    raku: ['相似比 $2:3$ → $k=\\frac{3}{2}$', '表面積 $36\\times\\left(\\frac{3}{2}\\right)^2=81$', '体積 $24\\times\\left(\\frac{3}{2}\\right)^3=81$'],
    why: '相似比が $1:k$ なら、たても横も $k$ 倍なので面積は $k^2$ 倍、高さも $k$ 倍なので体積は $k^3$ 倍（4-3⑤）。形がわからなくても、比だけで計算できる。',
    caution: '面積の比 $4:9$ から体積の比を出すときは、相似比 $2:3$ にもどしてから3乗する（$8:27$）。たてと横を別の倍率にしたものは、相似ではない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '16mm', s3: '14mm', trap: '12mm' },
    fits(q) { return /面積|体積|ペンキ|重さ/.test(q) && /相似|縮尺|模型|倍にした|小さいほうの □ 倍/.test(q) && !/だけ/.test(q); },
    steps: {
      // 小さいほうの面積・体積から、大きいほうの
      s1(r) {
        const [s, t] = r.pick(RAT18), vol = r.chance(0.5), tri = !vol && r.chance(0.4);
        const base = vol ? s ** 3 * r.int(1, 4) : s * s * r.int(1, 6), ans = base * (t / s) ** (vol ? 3 : 2);
        if (ans > 1000) return null;
        const what = vol ? '体積' : '表面積', unit = vol ? 'cm^3' : 'cm^2';
        if (tri) return { q: `相似比 $${s}:${t}$ の三角形の、小さいほうの面積が $${base}$。大きいほう`, a: `$${fmt(ans)}$`, easy: `$${base}\\times${kTeX(s, t, 2)}=${fmt(ans)}$`, key: `418:${s}:${t}:${vol}:${base}` };
        return {
          q: `相似比 $${s}:${t}$ の立体の、小さいほうの${what}が $${base}$。大きいほう`,
          a: `$${fmt(ans)}$`, easy: `$${base}\\times${kTeX(s, t, vol ? 3 : 2)}=${fmt(ans)}$`, key: `418:${s}:${t}:${vol}:${base}`,
        };
      },
      // 大きいほうから小さいほうへ／面積の比から体積の比／□倍にした
      s2(r) {
        const k = r.int(0, 2), [s, t] = r.pick(RAT18);
        if (k === 0) {
          const vol = r.chance(0.5), big = vol ? t ** 3 * r.int(1, 3) : t * t * r.int(1, 4), ans = big * (s / t) ** (vol ? 3 : 2);
          const what = vol ? '体積' : '表面積';
          return { q: `相似比 $${s}:${t}$ の立体の、大きいほうの${what}が $${big}$。小さいほう`, a: `$${fmt(ans)}$`, easy: `$${big}\\times${kTeX(t, s, vol ? 3 : 2)}=${fmt(ans)}$`, key: `418:${s}:${t}:${vol}:${fmt(ans)}` };
        }
        if (k === 1) {
          return {
            q: `相似な立体の表面積の比が $${s * s}:${t * t}$ のとき、体積の比`, a: `$${s ** 3}:${t ** 3}$`,
            easy: `相似比にもどして $${s}:${t}$、3乗して $${s ** 3}:${t ** 3}$`,
            verify: () => (close(Math.sqrt(s * s / (t * t)) ** 3, s ** 3 / t ** 3) && gcd(s ** 3, t ** 3) === 1) || 'まちがい',
          };
        }
        const m = r.pick([2, 3, 4, 5, 10]), sph = r.chance(0.5), vol = r.chance(0.5);
        const shape = sph ? `半径を $${m}$ 倍にした球` : `1辺を $${m}$ 倍にした立方体`, what = vol ? '体積' : '表面積', ans = m ** (vol ? 3 : 2);
        return { q: `${shape}の${what}は、もとの □ 倍`, a: `$${ans}$`, easy: `$${m}^${vol ? 3 : 2}=${ans}$` };
      },
      // 場面：模型をぬるペンキ、模型の重さ、ピザ
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const N = r.pick([10, 20, 25, 50]), P = r.pick([2, 4, 5, 8, 10, 12, 15, 20]), mL = P * N * N, L = mL / 1000;
          if (L > 60) return null;
          return {
            q: `縮尺 $1:${N}$ の船の模型をぬるのに、ペンキ $${P}\\,\\mathrm{mL}$。本物をぬるには □ L`,
            a: `$${fmt(L)}$`, easyCheck: false,
            easy: `面積は $${N}^2=${N * N}$ 倍。$${P}\\times${N * N}=${mL}$ mL で $${fmt(L)}$ L`,
            verify: () => close(L, (P / 1000) * N * N) || 'まちがい',
          };
        }
        if (k === 1) {
          const N = r.pick([10, 20, 5]), g = r.pick([20, 40, 50, 80, 100, 200, 300, 500]), kg = g * N ** 3 / 1000;
          if (kg > 5000) return null;
          return {
            q: `同じ材料の縮尺 $1:${N}$ の模型が $${g}\\,\\mathrm{g}$ のとき、本物の重さ □ kg`,
            a: `$${fmt(kg)}$`, easyCheck: false,
            easy: `重さは体積に比例。$${N}^3=${N ** 3}$ 倍で $${g}\\times${N ** 3}=${g * N ** 3}$ g、$${fmt(kg)}$ kg`,
            verify: () => close(kg * 1000 / g, N * N * N) || 'まちがい',
          };
        }
        const [d1, d2] = r.pick([[20, 30], [10, 20], [20, 40], [10, 15], [24, 36], [20, 50], [10, 30]]), ans = (d2 / d1) ** 2;
        return {
          q: `直径 $${d1}\\,\\mathrm{cm}$ と $${d2}\\,\\mathrm{cm}$ のピザ。大きいほうの面積は小さいほうの □ 倍`,
          a: `$${fmt(ans)}$`, easy: `相似比 $${d1}:${d2}=${d1 / gcd(d1, d2)}:${d2 / gcd(d1, d2)}$。$${kTeX(d1, d2, 2)}=${fmt(ans)}$`,
        };
      },
      // わな：横だけ・高さだけをのばす（相似ではない。面積・体積は k 倍）
      trap(r) {
        const m = r.pick([2, 3, 4]);
        if (r.chance(0.5)) {
          const h = r.int(2, 6), w = r.int(3, 9);
          const p = { q: `たて $${h}$、横 $${w}$ の長方形を、横だけ $${m}$ 倍にのばす。面積は □ 倍`, a: `$${m}$`, verify: () => close((h * w * m) / (h * w), m) || 'まちがい' };
          return dest(p, '4-18', `横だけのばすと形が変わり、相似ではない。面積は $${h}\\times${w * m}\\div(${h}\\times${w})=${m}$ 倍（$${m}^2$ 倍ではない）`);
        }
        const rad = r.int(2, 5), hh = r.int(2, 6);
        const p = { q: `半径 $${rad}$、高さ $${hh}$ の円柱の、高さだけを $${m}$ 倍にする。体積は □ 倍`, a: `$${m}$`, verify: () => close((rad * rad * hh * m) / (rad * rad * hh), m) || 'まちがい' };
        return dest(p, '4-18', `高さだけのばすと相似ではない。底面積は同じなので、体積は高さと同じ $${m}$ 倍（$${m}^3$ 倍ではない）`);
      },
    },
  });
  // ================================================================ 4-19
  const RAT19 = [[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [2, 5], [3, 5], [4, 5]];
  // 円すい・四角すいを頂点から y の所で切る。h＝b t、y＝a t、底面の半径（1辺）R
  function sui(r, pyr) {
    const [a, b] = r.pick(RAT19), t = r.int(1, 4), h = b * t, y = a * t;
    if (h > 20 || h < 4) return null;
    // 底面の半径（1辺）は、高さの 1/4 〜 1倍くらい（つぶれた形・細すぎる形にしない）
    const Rs = range(2, 15).filter(R => (2 * R * a) % b === 0 && R <= Math.max(h, 3) && R * (pyr ? 2 : 4) >= h);
    if (!Rs.length) return null;
    const R = r.pick(Rs), c = R * a / b;
    return { a, b, h, y, R, c, pyr };
  }
  const K419 = x => `419:${x.pyr}${x.h},${x.y},${x.R}`;
  const suiName = x => (x.pyr ? `底面の1辺 $${x.R}$ の正四角すい` : `半径 $${x.R}$ の円すい`);
  // 円すい（または四角すい・円柱）と、底面に平行な切り口の図。dim：'top'（頂点から）か 'bot'（底面から）
  function figSui(x, dim) {
    const k = Math.min(4.6 / x.h, 3.4 / x.R), H = x.h * k, R = x.R * k, yc = H - x.y * k;
    const items = [];
    const dimL = dim === 'bot' ? dimV(-(x.pyr ? 0.2 : R) - 0.8, 0, yc, NUMLAB(x.h - x.y), 'w') : dimV(-(x.pyr ? 0.2 : R) - 0.8, yc, H, NUMLAB(x.y), 'w');
    if (!x.pyr) {
      const ry = R * 0.28, rc = R * x.y / x.h, T = [0, H];
      items.push(['seg', T, [-R, 0]], ['seg', T, [R, 0]], ['ellipse', [0, 0], R, ry, 180, 360], ['ellipse', [0, 0], R, ry, 0, 180, { dash: true }],
        ['ellipse', [0, yc], rc, rc * 0.28, 180, 360], ['ellipse', [0, yc], rc, rc * 0.28, 0, 180, { dash: true }],
        ['seg', T, [0, 0], { dash: true }], ['seg', [0, 0], [R, 0]], ['right', T, [0, 0], [R, 0], 0.35], ['label', [R / 2, 0], NUMLAB(x.R), 'n'],
        ...dimV(R + 0.8, 0, H, NUMLAB(x.h), 'e'), ...dimL);
      return { s: 5, pad: FIGPAD, items };
    }
    // 四角すい：底面の正方形（1辺 R）、頂点は中心の上
    const kp = Math.min(4.6 / (x.h + 0.25 * x.R), 5.5 / (1.43 * x.R)), Hp = x.h * kp;
    const Q = p => M.proj3(p), a = x.R * kp, z = x.y / x.h, zc = Hp - x.y * kp, s = a * z;
    const b0 = [0, 0, 0], b1 = [a, 0, 0], b2 = [a, a, 0], b3 = [0, a, 0], T = [a / 2, a / 2, Hp];
    const c0 = [a / 2 - s / 2, a / 2 - s / 2, zc], c1 = [a / 2 + s / 2, a / 2 - s / 2, zc], c2 = [a / 2 + s / 2, a / 2 + s / 2, zc], c3 = [a / 2 - s / 2, a / 2 + s / 2, zc];
    items.push(['seg', Q(b0), Q(b1)], ['seg', Q(b1), Q(b2)], ['seg', Q(b2), Q(b3), { dash: true }], ['seg', Q(b3), Q(b0), { dash: true }],
      ['seg', Q(T), Q(b0)], ['seg', Q(T), Q(b1)], ['seg', Q(T), Q(b2)], ['seg', Q(T), Q(b3), { dash: true }],
      ['seg', Q(c0), Q(c1)], ['seg', Q(c1), Q(c2)], ['seg', Q(c2), Q(c3), { dash: true }], ['seg', Q(c3), Q(c0), { dash: true }],
      ['label', mid(Q(b0), Q(b1)), NUMLAB(x.R), 's']);
    const xr = Q(b2)[0] + 0.7, y0 = Q([a / 2, a / 2, 0])[1], yT = Q(T)[1], ycp = Q([a / 2, a / 2, zc])[1];
    items.push(['seg', Q([a / 2, a / 2, 0]), Q(T), { dash: true }], ...dimV(xr, y0, yT, NUMLAB(x.h), 'e'));
    items.push(...(dim === 'bot' ? dimV(-0.8, y0, ycp, NUMLAB(x.h - x.y), 'w') : dimV(-0.8, ycp, yT, NUMLAB(x.y), 'w')));
    return { s: 5, pad: FIGPAD, items };
  }
  M.add({
    id: '4-19', part: PART, chap: '4-3⑥', stars: 1,
    title: 'すいを底面に平行に切ると、頂点からの長さの比',
    mark: '円すい・角すいを、頂点から□の所で**底面に平行に**切る（このわざの問題の「断面」は、どれも底面に平行に切った切り口）。',
    futsu: ['横から見た三角形をかいて、', '断面の半径を $x$ とし、', '$9:12=x:4$ から', '$12x=36$ を解く。'],
    raku: ['頂点からの長さの比 $\\frac{9}{12}=\\frac{3}{4}$', '半径 $4\\times\\frac{3}{4}=3$、面積 $9\\pi$', '小さいすいの体積は', 'もとの $\\left(\\frac{3}{4}\\right)^3=\\frac{27}{64}$'],
    why: '頂点から切りとった小さいすいは、もとのすいと相似で、相似比は「頂点からの長さ：高さ」。だから断面の半径（1辺）は頂点からの長さに比例する（4-3⑥）。面積はその2乗、体積は3乗（4-3⑤）。',
    caution: '「底面から□の所」と書いてあったら、頂点からの長さ＝高さ－□ にしてから比を作る。柱（円柱・角柱）は、どこで切っても断面は底面と同じ。',
    counts: { s1: 7, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '12mm', s2: '16mm', s3: '12mm', trap: '12mm' },
    fits(q) { return /すい/.test(q) && /平行に切|断面/.test(q); },
    steps: {
      // 断面の半径（1辺）
      s1(r) {
        const x = sui(r, r.chance(0.3)); if (!x) return null;
        return {
          q: `高さ $${x.h}$、${suiName(x)}の、頂点から $${x.y}$ の断面の${x.pyr ? '1辺' : '半径'}`,
          a: `$${fmt(x.c)}$`, key: K419(x), easy: `$${x.R}\\times\\frac{${x.y}}{${x.h}}=${x.y === x.a ? '' : `${x.R}\\times${fr(x.a, x.b)}=`}${fmt(x.c)}$`,
        };
      },
      // 断面の面積／底面からの長さ／切りとった小さいすいの体積
      s2(r) {
        const x = sui(r, r.chance(0.3)); if (!x) return null;
        const k = r.int(0, 2);
        if (k === 0) {
          const A = x.c * x.c, a = x.pyr ? `$${fmt(A)}$` : `$${piT(Math.round(A * 4), 4)}$`;
          if (!Number.isInteger(A * 4)) return null;
          return {
            q: `高さ $${x.h}$、${suiName(x)}の、頂点から $${x.y}$ の断面の面積`, a, key: K419(x),
            easy: x.pyr ? `1辺 $${x.R}\\times${fr(x.a, x.b)}=${fmt(x.c)}$、$${fmt(x.c)}^2=${fmt(A)}$` : `半径 $${x.R}\\times${fr(x.a, x.b)}=${fmt(x.c)}$、$\\pi\\times${fmt(x.c)}^2=${piT(Math.round(A * 4), 4)}$`,
            easyCheck: false, verify: () => ok(a, (x.pyr ? 1 : Math.PI) * (x.R * x.R) * (x.y / x.h) ** 2),
          };
        }
        if (k === 1) {
          return {
            q: `高さ $${x.h}$、${suiName(x)}の、底面から $${x.h - x.y}$ の断面の${x.pyr ? '1辺' : '半径'}`,
            a: `$${fmt(x.c)}$`, easyCheck: false, key: K419(x),
            easy: `頂点からは $${x.h}-${x.h - x.y}=${x.y}$、$${x.R}\\times${fr(x.y, x.h)}=${fmt(x.c)}$`,
            verify: () => close(x.c * x.h, x.R * x.y) || 'まちがい',
          };
        }
        return {
          q: `高さ $${x.h}$ の${x.pyr ? '四角すい' : '円すい'}を頂点から $${x.y}$ で平行に切った、上のすいともとの体積の比`,
          a: `$${x.a ** 3}:${x.b ** 3}$`, easy: `相似比 $${x.y}:${x.h}=${x.a}:${x.b}$ を3乗して $${x.a ** 3}:${x.b ** 3}$`,
          verify: () => (gcd(x.a ** 3, x.b ** 3) === 1 && close(x.a ** 3 / x.b ** 3, (x.y / x.h) ** 3)) || 'まちがい',
        };
      },
      // 図で（頂点から・底面から）
      s3(r) {
        const x = sui(r, r.chance(0.35)); if (!x) return null;
        const dim = r.chance(0.4) ? 'bot' : 'top';
        if (dim === 'bot' && x.h - x.y < 1) return null;
        return {
          q: `図の${x.pyr ? '正四角すい' : '円すい'}を、底面に平行に切った断面の${x.pyr ? '1辺' : '半径'}`,
          a: `$${fmt(x.c)}$`, easyCheck: false, fig: figSui(x, dim), key: K419(x),
          easy: `${dim === 'bot' ? `頂点からは $${x.h}-${x.h - x.y}=${x.y}$。` : ''}$${x.R}\\times\\frac{${x.y}}{${x.h}}=${fmt(x.c)}$`,
          verify: () => close(x.c * x.h, x.R * x.y) || 'まちがい',
        };
      },
      // わな：円柱を切る（太さが変わらないので、比はいらない）
      trap(r) {
        const x = sui(r, false); if (!x) return null;
        const p = {
          q: `高さ $${x.h}$、半径 $${x.R}$ の円柱の、上の面から $${x.y}$ の断面の半径`,
          a: `$${x.R}$`, verify: () => x.R > 0 || 'まちがい',
        };
        return dest(p, '4-19', `円柱は太さが変わらないので、断面は底面と同じ円。半径は $${x.R}$ のまま`);
      },
    },
  });

  // ================================================================ 4-20
  // ピタゴラス数の k 倍（k は 0.1・0.2・0.5 などの小数も）
  function triple(r, ks) {
    const [a, b, c] = r.pick(TRIPLES), k = r.pick(ks.filter(k => c * k <= 60));
    if (k == null) return null;
    return { a: +fmt(a * k), b: +fmt(b * k), c: +fmt(c * k), k, t: [a, b, c] };
  }
  const ladder = (L, d) => `長さ $${fmt(L)}\\,\\mathrm{m}$ のはしごを、下のはしをかべから $${fmt(d)}\\,\\mathrm{m}$ はなして立てかける。上のはしの高さは □ m`;
  const pyth = (a, b, c) => close(a * a + b * b, c * c) || '三平方の定理が成り立たない';
  M.add({
    id: '4-20', part: PART, chap: '4-4③', stars: 1,
    title: 'ピタゴラス数の倍を見ぬく',
    mark: '直角三角形の辺が $3:4:5$、$5:12:13$、$8:15:17$、$7:24:25$ の**倍**（小数なら10倍して見る）。',
    futsu: ['$9^2+12^2=81+144$', '$=225$ を計算して、', '2乗して225になる', '数をさがす。'],
    raku: ['$9$、$12$ は $3\\times(3,\\ 4)$', '斜辺は $3\\times5=15$'],
    why: '3辺が整数の直角三角形（3・4・5 など）を何倍かした三角形は、もとと相似（4-3）。だから斜辺も同じ倍率になり、2乗の計算も $\\sqrt{\\phantom{2}}$ もいらない（4-4③）。',
    caution: '2辺が4と6のように、どの組の倍でもないときは、ふつうに $\\sqrt{16+36}=\\sqrt{52}=2\\sqrt{13}$ と計算する。3と5が直角をはさむ2辺なら、斜辺は4ではない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '20mm' },
    fits(q) {
      return rightPairs(q).some(([t, a, b, c]) => (t === 'legs' ? isTripleLegs(a, b) : t === 'hl' ? isTripleHL(a, b) : triTriple(a, b, c)));
    },
    steps: {
      // 直角をはさむ2辺から斜辺
      s1(r) {
        const x = triple(r, [2, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); if (!x || x.k > 4 && x.t[2] > 5) return null;
        const [p, q] = r.chance(0.5) ? [x.a, x.b] : [x.b, x.a];
        return {
          q: `直角をはさむ2辺が $${p}$ と $${q}$ の直角三角形の斜辺`, a: `$${x.c}$`, easyCheck: false, key: NK('420', x.a, x.b, x.c),
          easy: `$${x.k}\\times(${x.t[0]},\\ ${x.t[1]},\\ ${x.t[2]})$ と見て、$${x.k}\\times${x.t[2]}=${x.c}$`, verify: () => pyth(p, q, x.c),
        };
      },
      // 斜辺と1辺から、のこりの辺。小数は10倍して見る
      s2(r) {
        const x = triple(r, r.chance(0.5) ? [2, 3, 4, 5, 6, 8] : [0.1, 0.2, 0.3, 0.4, 0.5]); if (!x) return null;
        if (x.k > 2 && x.t[2] > 13) return null;
        const [g, w] = r.chance(0.5) ? [x.a, x.b] : [x.b, x.a];
        const dec = x.k < 1, kk = dec ? x.k * 10 : x.k;
        return {
          q: `斜辺が $${x.c}$、1辺が $${g}$ の直角三角形の、のこりの辺`, a: `$${w}$`, easyCheck: false, key: NK('420', x.a, x.b, x.c),
          easy: dec ? `10倍すると ${fmt(x.c * 10)} と ${fmt(g * 10)}、$${fmt(kk)}\\times(${x.t.join(',\\ ')})$。のこりは $${fmt(w * 10)}\\div10=${w}$` : `$${x.k}\\times(${x.t.join(',\\ ')})$ と見て、$${x.k}\\times${x.t[0] * x.k === g ? x.t[1] : x.t[0]}=${w}$`,
          verify: () => pyth(g, w, x.c),
        };
      },
      // 場面：はしご、画面の大きさ、長方形の公園の対角線
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const x = triple(r, [0.1, 0.2, 0.5, 1]); if (!x || x.c > 8 || x.c < 2) return null;
          const [d, h] = x.a < x.b ? [x.a, x.b] : [x.b, x.a];
          return { q: ladder(x.c, d), a: `$${h}$`, easyCheck: false, key: NK('420', x.a, x.b, x.c), easy: `はしごが斜辺。$${fmt(x.k * 10)}\\times(${x.t.join(',\\ ')})$ の $\\frac{1}{10}$ と見て、高さは $${h}$`, verify: () => pyth(d, h, x.c) };
        }
        const x = triple(r, [2, 3, 4, 5, 6, 8, 10, 20]); if (!x || x.c > 60) return null;
        const place = k === 1 ? '画面' : '長方形の公園', unit = k === 1 ? 'cm' : 'm';
        return {
          q: `たて $${x.a}\\,\\mathrm{${unit}}$、横 $${x.b}\\,\\mathrm{${unit}}$ の${place}の対角線は □ ${unit}`,
          a: `$${x.c}$`, easyCheck: false, key: NK('420', x.a, x.b, x.c), easy: `$${x.k}\\times(${x.t.join(',\\ ')})$ と見て、$${x.k}\\times${x.t[2]}=${x.c}$`, verify: () => pyth(x.a, x.b, x.c),
        };
      },
      // わな：どの組の倍でもない2辺（3と5も、直角をはさむなら斜辺は $\sqrt{34}$）
      trap(r) {
        let a, b;
        if (r.chance(0.5)) { const k = r.int(1, 3); [a, b] = r.pick([[3, 5], [5, 13], [4, 5], [12, 13]]).map(v => v * k); }
        else [a, b] = r.pick([[4, 6], [2, 3], [3, 6], [2, 5], [4, 7], [6, 9], [5, 10], [2, 6]]);
        if (isTripleLegs(a, b)) return null;
        const s = a * a + b * b, ans = rt(s);
        const p = { q: `直角をはさむ2辺が $${a}$ と $${b}$ の直角三角形の斜辺`, a: `$${ans}$`, key: NK('420t', a, b), verify: () => ok(ans, Math.hypot(a, b)) };
        const hl = isTripleHL(b, a);   // 1辺と斜辺なら組になる（3と5、6と10 など）が、ここでは2辺とも直角をはさむ辺
        return dest(p, '4-20', `直角をはさむ2辺が ${a}、${b} になる組はない${hl ? `（${b} が斜辺なら組になるが、ここでは ${b} も直角をはさむ辺）` : ''}。ふつうに $\\sqrt{${a}^2+${b}^2}=\\sqrt{${s}}${ans === `\\sqrt{${s}}` ? '' : `=${ans}`}$`, true);
      },
    },
  });

  // ================================================================ 4-21
  // b²＝(c＋a)(c－a)。c・a は 0.1 きざみの数も（10倍して整数で計算する）
  function hlByDiff(r, bs, ds, cmax) {
    const B = r.pick(bs) * 10, D = r.pick(ds) * 10;                // 10倍した b と d＝c－a
    if ((B * B) % D) return null;
    const S = B * B / D;                                            // c＋a（10倍）
    if ((S + D) % 2) return null;
    const C = (S + D) / 2, A = (S - D) / 2;
    if (A <= 0 || C / 10 > cmax) return null;
    return { c: C / 10, a: A / 10, b: B / 10 };
  }
  M.add({
    id: '4-21', part: PART, chap: '4-4③の先', stars: 2,
    title: 'のこりの辺は「2乗の差＝和×差」',
    mark: '**斜辺**と1辺がわかっていて、のこりの辺を求める。',
    futsu: ['$13^2-5^2=169-25=144$ と、', '2乗を計算してからひく。'],
    raku: ['$\\sqrt{13^2-5^2}=\\sqrt{(13+5)(13-5)}$', '$=\\sqrt{18\\times8}=\\sqrt{144}=12$'],
    why: '$c^2-a^2=(c+a)(c-a)$（わざ 3-35 の和と差の積）。大きい数の2乗を計算しなくてよく、$\\sqrt{\\phantom{2}}$ の中も、かけ算の形のまま整理できる。',
    caution: 'どれが斜辺かを先に確かめる。直角をはさむ2辺がわかっているときは、たし算 $a^2+b^2$ なので、この方法は使えない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '14mm', s3: '16mm', trap: '16mm' },
    fits(q) { return rightPairs(q).some(t => t[0] === 'hl'); },
    steps: {
      // 斜辺と1辺が近い（差が小さい）整数
      s1(r) {
        const c = r.int(6, 65), a = c - r.pick([1, 1, 2, 2, 3, 4, 5, 7, 8]);
        if (a < 2) return null;
        const S = c + a, D = c - a, b2 = S * D, ans = rt(b2);
        if (!isSq(b2) && (sqf(b2)[1] > 15 || r.chance(0.5))) return null;   // 整数か、√ の中が小さい数になるものを
        const sq = isSq(b2) ? `${Math.sqrt(b2)}` : `\\sqrt{${b2}}${ans === `\\sqrt{${b2}}` ? '' : `=${ans}`}`;
        return {
          q: `斜辺が $${c}$、1辺が $${a}$ の直角三角形の、のこりの辺`, a: `$${ans}$`, key: NK('421', c, a, Math.sqrt(b2)),
          easy: `$\\sqrt{(${c}+${a})(${c}-${a})}=\\sqrt{${S}\\times${D}}=${isSq(b2) ? `\\sqrt{${b2}}=` : ''}${sq}$`,
        };
      },
      // 小数・大きい数（和と差がきりのよい数）
      s2(r) {
        const x = r.chance(0.5) ? hlByDiff(r, [2, 3, 4, 5, 6, 8], [0.2, 0.4, 0.5, 1, 2], 20) : hlByDiff(r, [10, 12, 14, 16, 20, 24, 30], [1, 2, 4, 8], 120);
        if (!x || x.c === Math.round(x.c) && x.c < 30) return null;
        const S = +fmt(x.c + x.a), D = +fmt(x.c - x.a);
        return {
          q: `斜辺が $${fmt(x.c)}$、1辺が $${fmt(x.a)}$ の直角三角形の、のこりの辺`, a: `$${fmt(x.b)}$`, key: NK('421', x.a, x.b, x.c),
          easy: `$\\sqrt{(${fmt(x.c)}+${fmt(x.a)})(${fmt(x.c)}-${fmt(x.a)})}=\\sqrt{${fmt(S)}\\times${fmt(D)}}=\\sqrt{${fmt(S * D)}}=${fmt(x.b)}$`,
        };
      },
      // 場面：はしご、円の弦（中心からの長さ）
      s3(r) {
        if (r.chance(0.5)) {
          const x = hlByDiff(r, [1.2, 1.5, 2, 2.4, 3, 3.6, 4], [0.2, 0.4, 0.5, 0.8, 1], 7); if (!x || x.a >= x.c || x.a > x.b) return null;
          return {
            q: ladder(x.c, x.a), a: `$${fmt(x.b)}$`, key: NK('421', x.a, x.b, x.c),
            easy: `はしごが斜辺。$\\sqrt{(${fmt(x.c)}+${fmt(x.a)})(${fmt(x.c)}-${fmt(x.a)})}=\\sqrt{${fmt(x.c + x.a)}\\times${fmt(x.c - x.a)}}=${fmt(x.b)}$`,
          };
        }
        const c = r.int(5, 30), d = c - r.pick([1, 2, 3, 4, 5, 8]);
        if (d < 1) return null;
        const b2 = (c + d) * (c - d); if (!isSq(b2)) return null;
        const half = Math.sqrt(b2), ans = 2 * half;
        return {
          q: `半径 $${c}$ の円で、中心から $${d}$ の所を通る弦の長さ（弦は、中心からの垂線で2等分される）`, a: `$${ans}$`, easyCheck: false,
          easy: `半分は $\\sqrt{(${c}+${d})(${c}-${d})}=\\sqrt{${c + d}\\times${c - d}}=${half}$、弦は $2\\times${half}=${ans}$`,
          verify: () => close((ans / 2) ** 2 + d * d, c * c) || 'まちがい',
        };
      },
      // わな：直角をはさむ2辺がわかっている（たし算。和×差は使えない）
      trap(r) {
        let a, b;
        if (r.chance(0.6)) { const x = triple(r, [1, 2, 3]); if (!x) return null; [a, b] = [x.a, x.b]; }
        else [a, b] = r.pick([[4, 6], [2, 3], [3, 6], [2, 5], [4, 8], [6, 9]]);
        if (r.chance(0.5)) [a, b] = [b, a];
        const s = a * a + b * b, ans = rt(s);
        const p = { q: `直角をはさむ2辺が $${a}$ と $${b}$ の直角三角形の斜辺`, a: `$${ans}$`, verify: () => ok(ans, Math.hypot(a, b)) };
        return dest(p, '4-21', `斜辺を求めるのは2乗の和：$\\sqrt{${a}^2+${b}^2}=\\sqrt{${s}}${ans === `\\sqrt{${s}}` ? '' : `=${ans}`}$。差ではないので和×差は使えない`);
      },
    },
  });

  // ================================================================ 4-22
  M.add({
    id: '4-22', part: PART, chap: '4-4④', stars: 1,
    title: '正方形の対角線・45°は $1:1:\\sqrt2$',
    mark: '**45°**の直角三角形（直角二等辺三角形）、**正方形の対角線**。',
    futsu: ['$x^2=6^2+6^2=72$、', '$x=\\sqrt{72}=\\sqrt{36\\times2}=6\\sqrt2$', 'と三平方の定理で計算する。'],
    raku: ['$1:1:\\sqrt2$ の「1」が $6$', '対角線は $6\\times\\sqrt2=6\\sqrt2$', '対角線10なら1辺は $\\frac{10}{\\sqrt2}=5\\sqrt2$'],
    why: '45°の直角三角形はどれも相似で、辺の比はいつも $1:1:\\sqrt2$（4-4④）。1辺を $\\sqrt2$ 倍すれば斜辺、斜辺を $\\sqrt2$ でわれば1辺。',
    caution: '$\\frac{10}{\\sqrt2}$ は分母を有理化して $\\frac{10\\sqrt2}{2}=5\\sqrt2$ にする。30°・60°の直角三角形は比がちがう（$1:2:\\sqrt3$）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '16mm', trap: '14mm' },
    fits(q) { return /45\^\{\\circ\}|直角二等辺|正方形/.test(q) && !/すい|柱|体積|中心角|おうぎ形/.test(q); },
    steps: {
      // 1辺から斜辺（対角線）
      s1(r) {
        const a = r.int(2, 15), k = r.int(0, 2);
        const q = k === 0 ? `1辺が $${a}$ の正方形の対角線` : k === 1 ? `直角をはさむ辺が $${a}$ の直角二等辺三角形の斜辺` : `$\\angle\\mathrm{C}=90^{\\circ}$、$\\angle\\mathrm{A}=45^{\\circ}$ の $\\triangle\\mathrm{ABC}$ で、$\\mathrm{BC}=${a}$ のとき $\\mathrm{AB}$`;
        return { q, a: `$${a}\\sqrt{2}$`, easy: `$${a}\\times\\sqrt{2}=${a}\\sqrt{2}$`, key: '422a:' + a };
      },
      // 斜辺（対角線）から1辺、√2 のついた辺
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const h = 2 * r.int(1, 9);
          return { q: `斜辺が $${h}$ の直角二等辺三角形の、直角をはさむ辺`, a: `$${rt(2, h / 2)}$`, key: '422h:' + h, easy: `$\\frac{${h}}{\\sqrt{2}}=\\frac{${h}\\sqrt{2}}{2}=${rt(2, h / 2)}$` };
        }
        if (k === 1) {
          const d = 2 * r.int(1, 9);
          return { q: `対角線が $${d}$ の正方形の1辺`, a: `$${rt(2, d / 2)}$`, key: '422h:' + d, easy: `$\\frac{${d}}{\\sqrt{2}}=\\frac{${d}\\sqrt{2}}{2}=${rt(2, d / 2)}$` };
        }
        const m = r.int(2, 9);
        return { q: `1辺が $${m}\\sqrt{2}$ の正方形の対角線`, a: `$${2 * m}$`, key: '422h:' + 2 * m, easy: `$${m}\\sqrt{2}\\times\\sqrt{2}=${m}\\times2=${2 * m}$` };
      },
      // 場面と、約の値（$\sqrt2=1.414$）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(5, 20), v = rnd(a * 1414, 1000, 1);
          return {
            q: `直角をはさむ辺が $${a}\\,\\mathrm{cm}$ の直角二等辺三角形の斜辺は、約 □ cm（$\\sqrt{2}=1.414$、小数第1位まで）`,
            a: `$${v}$`, easyCheck: false, key: '422a:' + a, easy: `$${a}\\sqrt{2}$ に $1.414$ を入れて $${a}\\times1.414=${fmt(a * 1414 / 1000)}$、約 $${v}$`,
            verify: () => (Math.abs(+v - a * Math.SQRT2) < 0.06 && +v === Math.round(a * 1.414 * 10 + 1e-9) / 10) || 'まちがい',
          };
        }
        if (k === 1) {
          const L = 2 * r.int(2, 15);
          return { q: `$45^{\\circ}$ の坂を、斜面にそって $${L}\\,\\mathrm{m}$ 進むと、□ m 高くなる`, a: `$${rt(2, L / 2)}$`, key: '422h:' + L, easy: `斜面が斜辺。$\\frac{${L}}{\\sqrt{2}}=${rt(2, L / 2)}$` };
        }
        const a = r.int(2, 12);
        return { q: `1辺 $${a}\\,\\mathrm{cm}$ の正方形の紙を、対角線で切った切り口の長さ □ cm`, a: `$${a}\\sqrt{2}$`, key: '422a:' + a, easy: `$${a}\\times\\sqrt{2}=${a}\\sqrt{2}$` };
      },
      // わな：30°・60°の直角三角形、正方形でない長方形の対角線
      trap(r) {
        if (r.chance(0.5)) {
          const h = 2 * r.int(2, 9);
          const p = { q: `$\\angle\\mathrm{C}=90^{\\circ}$、$\\angle\\mathrm{A}=30^{\\circ}$ の $\\triangle\\mathrm{ABC}$ で、$\\mathrm{AB}=${h}$ のとき $\\mathrm{BC}$`, a: `$${h / 2}$`, verify: () => close(h / 2, h * Math.sin(Math.PI / 6)) || 'まちがい' };
          return dest(p, '4-22', `45°ではない。$1:2:\\sqrt3$ なので $${h}\\div2=${h / 2}$`);
        }
        const x = triple(r, [1, 2, 3]); if (!x) return null;
        const p = { q: `たて $${x.a}$、横 $${x.b}$ の長方形の対角線`, a: `$${x.c}$`, verify: () => pyth(x.a, x.b, x.c) };
        return dest(p, '4-22', `正方形ではないので $1:1:\\sqrt2$ は使えない。$\\sqrt{${x.a}^2+${x.b}^2}=${x.c}$`);
      },
    },
  });

  // ================================================================ 4-23
  const T306 = '$\\angle\\mathrm{C}=90^{\\circ}$、$\\angle\\mathrm{A}=30^{\\circ}$ の $\\triangle\\mathrm{ABC}$ で、';
  M.add({
    id: '4-23', part: PART, chap: '4-4④', stars: 1,
    title: '正三角形の高さ・30°と60°は $1:2:\\sqrt3$',
    mark: '**30°・60°**の直角三角形、**正三角形の高さ**。',
    futsu: ['$h^2=8^2-4^2=48$、', '$h=\\sqrt{48}=\\sqrt{16\\times3}=4\\sqrt3$', 'と三平方の定理で計算する。'],
    raku: ['正三角形の1辺8の半分4が「1」', '高さは $4\\times\\sqrt3=4\\sqrt3$', 'いちばん短い辺が5なら、', '斜辺は $5\\times2=10$'],
    why: '30°・60°の直角三角形は、正三角形を半分にした形で、どれも相似。辺の比はいつも「短い辺：斜辺：のこりの辺＝$1:2:\\sqrt3$」（4-4④）。',
    caution: '斜辺は「2」にあたる（いちばん長い辺）。$\\sqrt3=1.73$ は2より小さいので、斜辺を短い辺の $\\sqrt3$ 倍にしない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '16mm', trap: '16mm' },
    fits(q) { return /30\^\{\\circ\}|60\^\{\\circ\}|正三角形/.test(q) && !/中心角|おうぎ形/.test(q); },
    steps: {
      // 正三角形の高さ、短い辺から斜辺・のこりの辺
      s1(r) {
        const k = r.int(0, 2);
        if (k === 0) { const s = 2 * r.int(1, 10); return { q: `1辺が $${s}$ の正三角形の高さ`, a: `$${rt(3, s / 2)}$`, easy: `$${s}\\div2\\times\\sqrt{3}=${rt(3, s / 2)}$` }; }
        const a = r.int(2, 12);
        if (k === 1) return { q: `${T306}$\\mathrm{BC}=${a}$ のとき $\\mathrm{AB}$`, a: `$${2 * a}$`, easy: `$${a}\\times2=${2 * a}$`, key: '423ab:' + a };
        return { q: `${T306}$\\mathrm{BC}=${a}$ のとき $\\mathrm{AC}$`, a: `$${rt(3, a)}$`, easy: `$${a}\\times\\sqrt{3}=${rt(3, a)}$`, key: '423ac:' + a };
      },
      // 斜辺から、長いほうの辺から、高さから1辺
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) { const h = 2 * r.int(2, 10); return { q: `${T306}$\\mathrm{AB}=${h}$ のとき $\\mathrm{BC}$`, a: `$${h / 2}$`, easy: `$${h}\\div2=${h / 2}$`, key: '423ab:' + h / 2 }; }
        if (k === 1) { const h = 2 * r.int(2, 10); return { q: `${T306}$\\mathrm{AB}=${h}$ のとき $\\mathrm{AC}$`, a: `$${rt(3, h / 2)}$`, easy: `$${h}\\div2\\times\\sqrt{3}=${rt(3, h / 2)}$`, key: '423ac:' + h / 2 }; }
        if (k === 2) { const L = 3 * r.int(1, 6); return { q: `${T306}$\\mathrm{AC}=${L}$ のとき $\\mathrm{BC}$`, a: `$${rt(3, L / 3)}$`, easy: `$\\frac{${L}}{\\sqrt{3}}=\\frac{${L}\\sqrt{3}}{3}=${rt(3, L / 3)}$` }; }
        const h = 3 * r.int(1, 5);
        return { q: `高さが $${h}$ の正三角形の1辺`, a: `$${rt(3, 2 * h / 3)}$`, easy: `半分は $\\frac{${h}}{\\sqrt{3}}$、1辺は $2\\times\\frac{${h}}{\\sqrt{3}}=\\frac{${2 * h}\\sqrt{3}}{3}=${rt(3, 2 * h / 3)}$`, easyCheck: false, verify: () => ok(`$${rt(3, 2 * h / 3)}$`, 2 * h / Math.sqrt(3)) };
      },
      // 場面：すべり台・たこ糸、約の値（$\sqrt3=1.73$）、正三角形の面積
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const L = 2 * r.int(2, 9), what = r.pick(['すべり台', 'たこの糸']);
          return {
            q: `地面と $30^{\\circ}$ の角をつくる長さ $${L}\\,\\mathrm{m}$ の${what}。${what === 'すべり台' ? 'いちばん上の高さ' : 'たこの高さ（手から）'}は □ m`,
            a: `$${L / 2}$`, key: '423ab:' + L / 2, easy: `${what === 'すべり台' ? 'すべり台' : '糸'}が斜辺。高さは斜辺の半分：$${L}\\div2=${L / 2}$`,
          };
        }
        if (k === 1) {
          const L = 2 * r.int(2, 8), v = rnd(L / 2 * 173, 100, 1);
          return {
            q: `地面と $30^{\\circ}$ の角をつくる長さ $${L}\\,\\mathrm{m}$ のすべり台の横はばは、約 □ m（$\\sqrt{3}=1.73$、小数第1位まで）`,
            a: `$${v}$`, easyCheck: false, key: '423ac:' + L / 2, easy: `横は $${L / 2}\\sqrt{3}$。$${L / 2}\\times1.73=${fmt(L / 2 * 1.73)}$、約 $${v}$`,
            verify: () => (Math.abs(+v - L / 2 * Math.sqrt(3)) < 0.07 && +v === Math.round(L / 2 * 173 / 10 + 1e-9) / 10) || 'まちがい',
          };
        }
        const s = 2 * r.int(1, 8), A = s * s / 4;
        return { q: `1辺が $${s}$ の正三角形の面積`, a: `$${rt(3, A)}$`, easyCheck: false, easy: `高さ $${rt(3, s / 2)}$、面積 $${s}\\times${rt(3, s / 2)}\\div2=${rt(3, A)}$`, verify: () => ok(`$${rt(3, A)}$`, Math.sqrt(3) / 4 * s * s) };
      },
      // わな：45°の三角形、角のわからない直角三角形
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.int(2, 12);
          const p = { q: `$\\angle\\mathrm{C}=90^{\\circ}$、$\\angle\\mathrm{A}=45^{\\circ}$ の $\\triangle\\mathrm{ABC}$ で、$\\mathrm{BC}=${a}$ のとき $\\mathrm{AB}$`, a: `$${a}\\sqrt{2}$`, verify: () => ok(`$${a}\\sqrt{2}$`, Math.hypot(a, a)) };
          return dest(p, '4-23', `30°・60°ではない。$1:1:\\sqrt2$ なので $${a}\\sqrt2$`);
        }
        const x = triple(r, [1, 2, 3]); if (!x) return null;
        const p = { q: `直角をはさむ2辺が $${x.a}$ と $${x.b}$ の直角三角形の斜辺`, a: `$${x.c}$`, verify: () => pyth(x.a, x.b, x.c) };
        return dest(p, '4-23', `角が30°・60°かどうかわからない。$1:2:\\sqrt3$ は使えない。$\\sqrt{${x.a}^2+${x.b}^2}=${x.c}$`);
      },
    },
  });

  // ================================================================ 4-24
  // 3辺が直角三角形か（ある・ない）。ない場合は、ピタゴラス数の1辺を少し変える
  function threeSides(r, right, ks) {
    const x = triple(r, ks); if (!x) return null;
    let s = [x.a, x.b, x.c];
    if (!right) { const i = r.int(0, 2), d = r.pick([-1, 1, 2]) * (x.k < 1 ? 0.1 : 1); s[i] = +fmt(s[i] + d); if (s[i] <= 0) return null; }
    const sorted = s.slice().sort((p, q) => p - q);
    if (sorted[0] + sorted[1] <= sorted[2]) return null;
    return { s: r.shuffle(s), sorted, right: close(sorted[0] ** 2 + sorted[1] ** 2, sorted[2] ** 2) };
  }
  const isRight = (a, b, c) => { const t = [a, b, c].sort((p, q) => p - q), cosC = (t[0] ** 2 + t[1] ** 2 - t[2] ** 2) / (2 * t[0] * t[1]); return Math.abs(cosC) < 1e-9; };
  M.add({
    id: '4-24', part: PART, chap: '4-4⑤', stars: 1,
    title: '直角かどうかは、いちばん長い辺の2乗とくらべる',
    mark: '**3辺の長さ**だけがわかっている三角形。',
    futsu: ['どの2辺の組でも', '$a^2+b^2$ を計算して、', 'のこりの辺の2乗と', '1つずつくらべる。'],
    raku: ['いちばん長い15を $c$ に', '$9^2+12^2=81+144=225=15^2$', '等しいので直角三角形', '（15の向かいが直角）'],
    why: '三平方の定理の逆（4-4⑤）：$a^2+b^2=c^2$ なら、$c$ の向かいの角は直角。直角の向かいはいちばん長い辺なので、くらべるのは「いちばん長い辺の2乗」と「のこりの2辺の2乗の和」の1回だけでよい。',
    caution: '2辺しかわからないときは、直角かどうかもわからないので、三平方の定理は使えない。$a^2+b^2>c^2$ なら直角より小さい角、$a^2+b^2<c^2$ なら直角より大きい角。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '12mm', s2: '14mm', s3: '12mm', trap: '20mm' },
    fits(q) { return (/3辺|1周/.test(q) && /直角/.test(q)) || /直角なのは/.test(q); },
    steps: {
      // 3辺の整数。直角三角形で（ある・ない）
      s1(r) {
        const x = threeSides(r, r.chance(0.5), [1, 2, 3, 4, 5]); if (!x) return null;
        const [a, b, c] = x.sorted, s = a * a + b * b;
        return {
          q: `3辺が $${x.s[0]}$、$${x.s[1]}$、$${x.s[2]}$ の三角形は、直角三角形で$\\text{（ある・ない）}□$`, a: x.right ? 'ある' : 'ない', key: NK('424', ...x.s),
          easy: `いちばん長い ${c} とくらべる：$${a}^2+${b}^2=${s}$、$${c}^2=${c * c}$${x.right ? '。等しい' : '。等しくない'}`,
          verify: () => (isRight(...x.s) === x.right) || 'まちがい',
        };
      },
      // 角の大きさの見分け、どの角が直角か、√ のある辺
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const x = threeSides(r, r.chance(0.3), [1, 2, 3]); if (!x) return null;
          const [a, b, c] = x.sorted, s = a * a + b * b, ans = s === c * c ? '直角' : s > c * c ? '鋭角' : '鈍角';
          return {
            q: `3辺が $${x.s[0]}$、$${x.s[1]}$、$${x.s[2]}$ の三角形の最大の角は$\\text{（直角・鋭角・鈍角）}□$`, a: ans, key: NK('424', ...x.s),
            easy: `$${a}^2+${b}^2=${s}$、$${c}^2=${c * c}$。${s === c * c ? '等しい' : s > c * c ? `$${s}>${c * c}$` : `$${s}<${c * c}$`}`,
            verify: () => { const cosC = (a * a + b * b - c * c) / (2 * a * b); return (ans === (Math.abs(cosC) < 1e-9 ? '直角' : cosC > 0 ? '鋭角' : '鈍角')) || 'まちがい'; },
          };
        }
        if (k === 1) {
          const x = triple(r, [1, 2, 3]); if (!x) return null;
          const names = r.shuffle(['A', 'B', 'C']), opp = { A: 'BC', B: 'CA', C: 'AB' };
          // names[2] の向かいが斜辺
          const len = { [opp[names[0]]]: x.a, [opp[names[1]]]: x.b, [opp[names[2]]]: x.c };
          return {
            q: `$\\mathrm{BC}=${len.BC}$、$\\mathrm{CA}=${len.CA}$、$\\mathrm{AB}=${len.AB}$ の $\\triangle\\mathrm{ABC}$ で、直角なのは □`, a: `$\\angle\\mathrm{${names[2]}}$`, key: NK('424', x.a, x.b, x.c),
            easy: `いちばん長い $${rm(opp[names[2]])}=${x.c}$ の向かいの角。$${x.a}^2+${x.b}^2=${x.c * x.c}=${x.c}^2$`,
            verify: () => { const L = [['A', len.BC], ['B', len.CA], ['C', len.AB]].sort((p, q) => q[1] - p[1]); return (L[0][0] === names[2] && pyth(L[1][1], L[2][1], L[0][1]) === true) || 'まちがい'; },
          };
        }
        const [s1, s2, s3, ans] = r.pick([['1', '\\sqrt{3}', '2', 'ある'], ['1', '1', '\\sqrt{2}', 'ある'], ['2', '\\sqrt{5}', '3', 'ある'], ['\\sqrt{2}', '\\sqrt{3}', '\\sqrt{5}', 'ある'], ['2', '3', '\\sqrt{10}', 'ない'], ['1', '2', '\\sqrt{3}', 'ある'], ['3', '\\sqrt{7}', '4', 'ある'], ['2', '\\sqrt{3}', '3', 'ない']]);
        const v = [s1, s2, s3].map(t => M.evalMath(t, {})), sorted = v.slice().sort((p, q) => p - q);
        return {
          q: `3辺が $${s1}$、$${s2}$、$${s3}$ の三角形は、直角三角形で$\\text{（ある・ない）}□$`, a: ans, key: '424r:' + [s1, s2, s3].sort().join(','),
          easy: `2乗すると ${v.map(t => fmt(Math.round(t * t * 1e6) / 1e6)).join('、')}。$${fmt(Math.round(sorted[0] ** 2))}+${fmt(Math.round(sorted[1] ** 2))}${ans === 'ある' ? '=' : '\\ne'}${fmt(Math.round(sorted[2] ** 2))}$`,
          verify: () => (isRight(...v) === (ans === 'ある')) || 'まちがい',
        };
      },
      // 場面：ひも・大工の直角、1周のひもで作る三角形
      s3(r) {
        if (r.chance(0.5)) {
          const x = threeSides(r, r.chance(0.6), [0.3, 0.2, 0.1, 1]); if (!x || x.sorted[2] > 6) return null;
          const unit = 'm', [a, b, c] = x.sorted;
          return {
            q: `ひもで作った3辺 $${x.s[0]}\\,\\mathrm{${unit}}$、$${x.s[1]}\\,\\mathrm{${unit}}$、$${x.s[2]}\\,\\mathrm{${unit}}$ の三角形は、直角三角形で$\\text{（ある・ない）}□$`,
            a: x.right ? 'ある' : 'ない', key: NK('424', ...x.s), easy: `$${a}^2+${b}^2=${fmt(a * a + b * b)}$、$${c}^2=${fmt(c * c)}$${x.right ? '。等しい' : '。等しくない'}`,
            verify: () => (isRight(...x.s) === x.right) || 'まちがい',
          };
        }
        const x = triple(r, [1, 2, 3]); if (!x) return null;
        const right = r.chance(0.5), a = x.a, b = right ? x.b : x.b + 1, n = a + b + x.c, c = n - a - b;
        return {
          q: `1周 $${n}\\,\\mathrm{m}$ のひもで、2辺が $${a}\\,\\mathrm{m}$、$${b}\\,\\mathrm{m}$ の三角形を作ると、直角三角形で$\\text{（ある・ない）}□$`,
          a: right ? 'ある' : 'ない', key: NK('424', a, b, c), easy: (() => { const t = [a, b, c].sort((p, q) => p - q); return `のこりは $${n}-${a}-${b}=${c}$。$${t[0]}^2+${t[1]}^2=${t[0] ** 2 + t[1] ** 2}$、$${t[2]}^2=${t[2] ** 2}$`; })(),
          verify: () => (isRight(a, b, c) === right) || 'まちがい',
        };
      },
      // わな：2辺だけ（直角がわからないので、3つめの辺は決まらない）
      trap(r) {
        const [a, b] = r.pick([[4, 6], [3, 4], [5, 7], [6, 8], [5, 12], [2, 3]]);
        const p = { q: `2辺が $${a}$ と $${b}$ の三角形の、3つめの辺は$\\text{（決まる・決まらない）}□$`, a: '決まらない', key: NK('424t', a, b), verify: () => (b - a < b + a) || 'まちがい' };
        return dest(p, '4-24', `直角があるかわからないので、三平方の定理は使えない。3つめの辺は $${b - a}$ より長く $${a + b}$ より短い、どんな長さにもなる`);
      },
    },
  });

  // ================================================================ 4-25
  M.add({
    id: '4-25', part: PART, chap: '4-4⑥⑦', stars: 1,
    title: '2点の距離は、座標の差で三平方（円の内外は2乗のまま）',
    mark: '**2点の座標**、または円 $x^2+y^2=r^2$ と点。',
    futsu: ['方眼に2点をかいて', '直角三角形を作り、辺の長さを', '数えて三平方の定理。', '円の内外は、距離を出して', 'から半径とくらべる。'],
    raku: ['差だけを出す：', '$3-(-1)=4$、$-5-3=-8$', '$\\sqrt{4^2+8^2}=\\sqrt{80}=4\\sqrt5$', '$x^2+y^2=25$ と $(2,\\ 4)$：', '$4+16=20<25$ で内側'],
    why: '横の差とたての差が、直角をはさむ2辺になる（4-4⑥）。2乗すればマイナスは消えるので、ひく順番は気にしなくてよい。円の内外は、$x^2+y^2$ と $r^2$ を2乗のままくらべれば、$\\sqrt{\\phantom{2}}$ を出さなくてすむ（4-4⑦）。',
    caution: 'マイナスの差は、かっこをつけて2乗する（$(-8)^2=64$）。道にそって歩く道のりは、直線の距離ではない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '22mm', s3: '16mm', trap: '12mm' },
    fits(q) {
      if (/道のり/.test(q)) return false;
      return (/距離/.test(q) && numCoords(q).length >= 1) || /x\^2\+y\^2/.test(q) || (/範囲|円の式/.test(q) && numCoords(q).length >= 1);
    },
    steps: {
      // 2点の距離
      s1(r) {
        const x1 = r.int(-6, 5), y1 = r.int(-6, 5), x2 = r.intNot(-6, 7, v => v === x1 || Math.abs(v - x1) > 8), y2 = r.intNot(-6, 7, v => v === y1 || Math.abs(v - y1) > 8);
        const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1), s = dx * dx + dy * dy, ans = rt(s);
        const named = r.chance(0.4);
        return {
          q: named ? `$\\mathrm{A}${P(x1, y1)}$、$\\mathrm{B}${P(x2, y2)}$ の距離 $\\mathrm{AB}$` : `2点 $${P(x1, y1)}$、$${P(x2, y2)}$ の距離`, a: `$${ans}$`,
          easy: `差は ${dx} と ${dy}。$\\sqrt{${dx}^2+${dy}^2}=\\sqrt{${s}}${ans === `\\sqrt{${s}}` ? '' : `=${ans}`}$`,
          key: [[x1, y1], [x2, y2]].map(c => c.join(',')).sort().join('/'),
        };
      },
      // 円と点（上・内側・外側）、点を通る円の式
      s2(r) {
        if (r.chance(0.7)) {
          const R2 = r.pick([25, 100, 169, 13, 50, 20, 10, 36, 16]);
          const pts = [];
          for (let x = -12; x <= 12; x++) for (let y = -12; y <= 12; y++) if (x && y && Math.abs(x * x + y * y - R2) <= 8) pts.push([x, y]);
          const [x, y] = r.pick(pts), s = x * x + y * y, ans = s === R2 ? '上' : s < R2 ? '内側' : '外側';
          return {
            q: `点 $${P(x, y)}$ は、円 $x^2+y^2=${R2}$ の$\\text{（上・内側・外側）}□$`, a: ans, key: NK(`425c${R2}`, Math.abs(x), Math.abs(y)),
            easy: `$${par(x)}^2+${par(y)}^2=${s}$、$${s}${s === R2 ? '=' : s < R2 ? '<' : '>'}${R2}$`,
            verify: () => (ans === (Math.abs(Math.hypot(x, y) - Math.sqrt(R2)) < 1e-9 ? '上' : Math.hypot(x, y) < Math.sqrt(R2) ? '内側' : '外側')) || 'まちがい',
          };
        }
        const x = r.intNot(-9, 9, v => v === 0), y = r.intNot(-9, 9, v => v === 0), s = x * x + y * y;
        return {
          q: `原点を中心とし、点 $${P(x, y)}$ を通る円の式`, a: `$x^2+y^2=${s}$`, key: NK('425o', Math.abs(x), Math.abs(y)), easy: `$r^2=${par(x)}^2+${par(y)}^2=${s}$（$\\sqrt{\\phantom{2}}$ にしない）`,
          verify: () => close(M.evalMath('x^2+y^2', { x, y }), s) || 'まちがい',
        };
      },
      // 場面：地図の直線距離（km）、半径□ km の範囲に入るか
      s3(r) {
        const x = triple(r, [0.1, 0.2, 0.3, 0.5]); if (!x || x.c > 4) return null;
        const sx = r.pick([1, -1]), sy = r.pick([1, -1]), [px, py] = r.chance(0.5) ? [x.a * sx, x.b * sy] : [x.b * sx, x.a * sy];
        const what = r.pick(['学校', '図書館', '公園', '病院']);
        if (r.chance(0.6)) {
          return {
            q: `駅を原点、東を $x$、北を $y$ の向き（単位 km）として、${what} $${P(px, py)}$ までの直線距離 □ km`, key: NK('425s', x.a, x.b),
            a: `$${x.c}$`, easyCheck: false, easy: `$\\sqrt{${par(+fmt(px))}^2+${par(+fmt(py))}^2}=\\sqrt{${fmt(x.c * x.c)}}=${x.c}$`, verify: () => pyth(px, py, x.c),
          };
        }
        const R = +fmt(x.c + r.pick([-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.5])), s = +fmt(px * px + py * py), ans = s <= R * R + 1e-9 ? '入る' : '入らない';
        if (R < 0.5) return null;
        return {
          q: `駅を原点、東を $x$、北を $y$ の向き（単位 km）として、${what} $${P(px, py)}$ は駅から半径 $${fmt(R)}\\,\\mathrm{km}$ の範囲に$\\text{（入る・入らない）}□$`,
          a: ans, easy: `$${par(+fmt(px))}^2+${par(+fmt(py))}^2=${fmt(s)}$、$${fmt(R)}^2=${fmt(R * R)}$`,
          verify: () => (ans === (Math.hypot(px, py) <= R + 1e-9 ? '入る' : '入らない')) || 'まちがい',
        };
      },
      // わな：道にそって歩いた道のり（直線の距離ではない）
      trap(r) {
        const a = r.int(2, 8), b = r.int(2, 8);
        const [d1, d2] = r.pick([['東', '北'], ['西', '北'], ['東', '南'], ['北', '東']]);
        const p = { q: `原点から道にそって${d1}へ $${a}$ km、${d2}へ $${b}$ km 歩いた道のり □ km`, a: `$${a + b}$`, key: NK('425t', a, b), verify: () => (a + b > Math.hypot(a, b)) || 'まちがい' };
        return dest(p, '4-25', `道のりは直線の距離ではない。$${a}+${b}=${a + b}$（三平方の定理はいらない）`);
      },
    },
  });

  // ================================================================ 4-26
  // a²＋b²＋c² が平方数になる3辺（2〜15）
  const BOX = (() => { const o = []; for (let a = 1; a <= 12; a++) for (let b = a; b <= 12; b++) for (let c = b; c <= 20; c++) if (isSq(a * a + b * b + c * c)) o.push([a, b, c]); return o; })();
  // 直方体の見取図。A（手前の左下）・G（おくの右上）、見えない辺は点線
  function figBox(a, b, c) {
    const k = Math.min(7.5 / (a + 0.433 * b), 4.6 / (c + 0.25 * b)), A3 = [0, 0, 0];
    const Q = p => M.proj3([p[0] * k, p[1] * k, p[2] * k]);
    const V = { A: [0, 0, 0], B: [a, 0, 0], C: [a, b, 0], D: [0, b, 0], E: [0, 0, c], F: [a, 0, c], G: [a, b, c], H: [0, b, c] };
    const S = (p, q, o) => ['seg', Q(V[p]), Q(V[q]), o];
    const items = [S('A', 'B'), S('B', 'C'), S('C', 'D', { dash: true }), S('D', 'A', { dash: true }), S('E', 'F'), S('F', 'G'), S('G', 'H'), S('H', 'E'),
      S('A', 'E'), S('B', 'F'), S('C', 'G'), S('D', 'H', { dash: true })];
    items.push(S('A', 'G', { thick: true }), ['label', Q(V.G), 'G', 'ne']);
    items.push(['label', Q(A3), 'A', 'sw'], ['label', mid(Q(V.A), Q(V.B)), NUMLAB(a), 's'], ['label', mid(Q(V.B), Q(V.C)), NUMLAB(b), 'se'], ['label', mid(Q(V.A), Q(V.E)), NUMLAB(c), 'w']);
    return { s: 5, pad: FIGPAD, items };
  }
  M.add({
    id: '4-26', part: PART, chap: '4-4⑧', stars: 1,
    title: '直方体の対角線は $\\sqrt{a^2+b^2+c^2}$',
    mark: '**直方体**の3辺（横・おく行き・高さ）と、立体の**対角線**。',
    futsu: ['底面の対角線', '$\\sqrt{3^2+4^2}=5$ を出してから、', 'もう一度 $\\sqrt{5^2+12^2}=13$', 'と、2回計算する。'],
    raku: ['3辺をまとめて2乗してたす', '$\\sqrt{3^2+4^2+12^2}=\\sqrt{9+16+144}$', '$=\\sqrt{169}=13$'],
    why: '底面の対角線の2乗は $a^2+b^2$。それと高さ $c$ が直角をはさむので、立体の対角線の2乗は $a^2+b^2+c^2$（4-4⑧）。底面の対角線を $\\sqrt{\\phantom{2}}$ で出さなくてよい。',
    caution: '立方体（1辺 $a$）なら $\\sqrt{3a^2}=\\sqrt3\\,a$。面の対角線 $\\sqrt{a^2+b^2}$ と、立体の対角線をまちがえない。見取図の長さは目で読まず、書いてある数を使う。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '18mm', s3: '14mm', trap: '14mm' },
    fits(q) { return /直方体|立方体/.test(q) && /対角線|棒/.test(q) && !/面の対角線/.test(q); },
    steps: {
      // 3辺から（答えが整数）
      s1(r) {
        const [a, b, c] = r.shuffle(r.pick(BOX)), s = a * a + b * b + c * c;
        return { q: `横 $${a}$、おく行き $${b}$、高さ $${c}$ の直方体の対角線`, a: `$${Math.sqrt(s)}$`, key: NK('426', a, b, c), easy: `$\\sqrt{${a}^2+${b}^2+${c}^2}=\\sqrt{${s}}=${Math.sqrt(s)}$` };
      },
      // 立方体、答えが √、対角線から3つめの辺
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) { const a = r.int(2, 12); return { q: `1辺が $${a}$ の立方体の対角線`, a: `$${rt(3, a)}$`, easy: `$\\sqrt{3\\times${a}^2}=${rt(3, a)}$` }; }
        if (k === 1) {
          const a = r.int(1, 6), b = r.int(1, 6), c = r.int(2, 8), s = a * a + b * b + c * c;
          if (isSq(s) || a === b && b === c) return null;
          const ans = rt(s);
          return { q: `横 $${a}$、おく行き $${b}$、高さ $${c}$ の直方体の対角線`, a: `$${ans}$`, key: NK('426', a, b, c), easy: `$\\sqrt{${a}^2+${b}^2+${c}^2}=\\sqrt{${s}}${ans === `\\sqrt{${s}}` ? '' : `=${ans}`}$` };
        }
        const [a, b, c] = r.shuffle(r.pick(BOX)), d = Math.sqrt(a * a + b * b + c * c);
        return { q: `対角線が $${d}$、横 $${a}$、おく行き $${b}$ の直方体の高さ`, a: `$${c}$`, key: NK('426', a, b, c), easy: `$\\sqrt{${d}^2-${a}^2-${b}^2}=\\sqrt{${c * c}}=${c}$` };
      },
      // 見取図で（立体の対角線、箱に入る棒）
      s3(r) {
        const [a, b, c] = r.shuffle(r.pick(BOX.filter(t => t[2] <= 15))), s = a * a + b * b + c * c, d = Math.sqrt(s);
        const bo = r.chance(0.4);
        return {
          q: bo ? '図の箱（直方体）に入る、まっすぐな棒のいちばん長い長さ' : '図の直方体の対角線 $\\mathrm{AG}$ の長さ',
          a: `$${d}$`, fig: figBox(a, b, c), key: NK('426', a, b, c),
          easy: `$\\sqrt{${a}^2+${b}^2+${c}^2}=\\sqrt{${s}}=${d}$`,
        };
      },
      // わな：底面の対角線（平面の三平方。3辺の式は使わない）
      trap(r) {
        const x = triple(r, [1, 2, 3]); if (!x) return null;
        const c = r.int(2, 9);
        const p = { q: `横 $${x.a}$、おく行き $${x.b}$、高さ $${c}$ の直方体の、底面の対角線`, a: `$${x.c}$`, verify: () => pyth(x.a, x.b, x.c) };
        return dest(p, '4-26', `底面の長方形の対角線なので、高さは使わない。$\\sqrt{${x.a}^2+${x.b}^2}=${x.c}$`);
      },
    },
  });

  // ================================================================ 4-27
  M.add({
    id: '4-27', part: PART, chap: '4-5③', stars: 1,
    title: '四角形は対角線で2つの三角形に',
    mark: '四角形の**対角線**の長さと、のこりの2つの頂点から対角線までの**高さ** $h_1$、$h_2$（ひし形は対角線2本）。',
    futsu: ['三角形ABCとACDの面積を', '$10\\times3\\div2=15$、', '$10\\times5\\div2=25$ と', '1つずつ出してたす。'],
    raku: ['底辺ACが同じなので、', '高さを先にたす', '$10\\times(3+5)\\div2=40$', 'ひし形は $8\\times6\\div2=24$'],
    why: '2つの三角形は底辺ACが同じなので、$\\mathrm{AC}\\times h_1\\div2$ と $\\mathrm{AC}\\times h_2\\div2$ の和は $\\mathrm{AC}\\times(h_1+h_2)\\div2$（分配法則。4-5③）。対角線が垂直に交わるひし形では、$h_1+h_2$ がもう1本の対角線になる。',
    caution: '高さは、対角線に垂直にはかった長さ。ななめの辺の長さを高さにしない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },   // ステップ1は文が2行（高さが何かを書く。R1-12）なので6問
    cols: 1,
    boxw: '12mm',
    fits(q) { return /対角線/.test(q) && /面積/.test(q) && /四角形|ひし形|正方形|畑|タイル/.test(q) && !/直方体/.test(q); },
    steps: {
      // 対角線と2つの高さ
      s1(r) {
        const d = r.int(4, 16), h1 = r.int(2, 9), h2 = r.intNot(2, 9, v => v === h1);
        if ((d * (h1 + h2)) % 2) return null;
        return {
          q: `四角形ABCDの対角線 $\\mathrm{AC}=${d}$、ACとB、Dの距離 $h_1=${h1}$、$h_2=${h2}$ のときの面積`, key: `427:${d}|` + NK('', h1, h2),
          a: `$${d * (h1 + h2) / 2}$`, easy: `$${d}\\times(${h1}+${h2})\\div2=${d * (h1 + h2) / 2}$`,
        };
      },
      // ひし形・正方形・対角線が垂直な四角形
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) { const p = r.int(3, 16), q = r.intNot(3, 16, v => v === p); if ((p * q) % 2) return null; return { q: `対角線が $${p}$ と $${q}$ のひし形の面積`, a: `$${p * q / 2}$`, key: NK('427d', p, q), easy: `$${p}\\times${q}\\div2=${p * q / 2}$` }; }
        if (k === 1) { const d = 2 * r.int(2, 9); return { q: `対角線が $${d}$ の正方形の面積`, a: `$${d * d / 2}$`, easy: `$${d}\\times${d}\\div2=${d * d / 2}$` }; }
        const p = r.int(4, 14), q = r.intNot(4, 14, v => v === p); if ((p * q) % 2) return null;
        return { q: `2本の対角線が垂直に交わり、長さが $${p}$ と $${q}$ の四角形の面積`, a: `$${p * q / 2}$`, key: NK('427d', p, q), easy: `$${p}\\times${q}\\div2=${p * q / 2}$` };
      },
      // 場面：畑・タイル、面積から対角線
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const d = 10 * r.int(2, 6), h1 = r.int(5, 20), h2 = r.int(5, 20);
          return { q: `四角形の畑ABCDで、対角線ACが $${d}\\,\\mathrm{m}$、ACとB、Dの距離 $${h1}\\,\\mathrm{m}$、$${h2}\\,\\mathrm{m}$。面積 $□\\,\\mathrm{m^2}$`, a: `$${d * (h1 + h2) / 2}$`, easy: `$${d}\\times(${h1}+${h2})\\div2=${d * (h1 + h2) / 2}$` };
        }
        if (k === 1) {
          const p = r.int(4, 12), q = r.int(4, 12); if ((p * q) % 2) return null;
          return { q: `対角線が $${p}\\,\\mathrm{cm}$、$${q}\\,\\mathrm{cm}$ のひし形のタイル10まいの面積 $□\\,\\mathrm{cm^2}$`, a: `$${p * q * 5}$`, key: NK('427d', p, q), easyCheck: false, easy: `1まい $${p}\\times${q}\\div2=${p * q / 2}$、10まいで $${p * q * 5}$`, verify: () => close(p * q * 5, 10 * (p * q / 2)) || 'まちがい' };
        }
        const p = r.int(3, 12), q = r.intNot(3, 14, v => v === p), S = p * q / 2;
        if (!Number.isInteger(S)) return null;
        return { q: `面積が $${S}$ のひし形で、1本の対角線が $${p}$ のとき、もう1本の対角線`, a: `$${q}$`, key: NK('427d', p, q), easy: `$${S}\\times2\\div${p}=${q}$` };
      },
      // わな：平行四辺形・三角形の面積にななめの辺（対角線で分ける形ではない）
      trap(r) {
        const b = r.int(5, 12), h = r.int(3, 8), s = h + r.int(1, 3);
        if (r.chance(0.5)) {
          const p = { q: `底辺 $${b}$、ななめの辺 $${s}$、高さ $${h}$ の平行四辺形の面積`, a: `$${b * h}$`, verify: () => close(b * h, b * s * (h / s)) || 'まちがい' };
          return dest(p, '4-27', `対角線で分ける問題ではない。底辺×高さで $${b}\\times${h}=${b * h}$（ななめの辺 ${s} は使わない）`, true);
        }
        if ((b * h) % 2) return null;
        const p = { q: `底辺 $${b}$、ななめの辺 $${s}$、高さ $${h}$ の三角形の面積`, a: `$${b * h / 2}$`, verify: () => close(b * h / 2, b * s * (h / s) / 2) || 'まちがい' };
        return dest(p, '4-27', `四角形ではない。底辺×高さ÷2 で $${b}\\times${h}\\div2=${b * h / 2}$（ななめの辺は使わない）`, true);
      },
    },
  });

  // ================================================================ 4-28
  const PI314 = k => fmt(Math.round(k * 314) / 100);                // k×3.14（k は整数か 0.5 きざみ）
  M.add({
    id: '4-28', part: PART, chap: '4-5④', stars: 1,
    title: '$\\pi$ は残して計算し、最後に3.14',
    mark: '円・おうぎ形・円柱・球の面積や体積の「**約**」（$\\pi=3.14$）。',
    futsu: ['$3.14\\times6\\times6=113.04$', 'を先に計算して、', '$113.04\\times\\frac{60}{360}$ と、', '小数のまま進める。'],
    raku: ['$\\pi\\times6^2\\times\\frac{60}{360}=6\\pi$', '最後に1回だけ $6\\times3.14=18.84$'],
    why: '$\\pi$ を文字のように残しておくと、約分やかけ算が整数だけですむ。3.14 をかけるのは最後の1回だけなので、計算がへり、まちがいもへる（4-5④）。',
    caution: '正しい答えは $6\\pi$ のように $\\pi$ を残した形。約の値は、問題に書いてある $\\pi$ の値で出す。直径と半径をまちがえない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /3\.14/.test(q) && !/(円周の長さ|面積)が \$/.test(q); },
    steps: {
      // 円・おうぎ形の面積、弧の長さ
      s1(r) {
        const k = r.int(0, 2), rad = r.int(2, 10);
        if (k === 0) {
          const c = rad * rad;
          return { q: `半径 $${rad}$ の円の面積（$\\pi=3.14$）`, a: `$${PI314(c)}$`, key: '428A:' + rad, easyCheck: false, easy: `$\\pi\\times${rad}^2=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * rad * rad) };
        }
        const ang = r.pick([30, 40, 45, 60, 72, 90, 120, 150, 180, 240, 270]);
        if (k === 1) {
          const c = rad * rad * ang / 360; if (!Number.isInteger(c) || c < 2) return null;
          return { q: `半径 $${rad}$、中心角 $${ang}^{\\circ}$ のおうぎ形の面積（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `$\\pi\\times${rad}^2\\times${fr(ang, 360)}=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * rad * rad * ang / 360) };
        }
        const c = 2 * rad * ang / 360; if (!Number.isInteger(c) || c < 2) return null;
        return { q: `半径 $${rad}$、中心角 $${ang}^{\\circ}$ のおうぎ形の弧の長さ（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `$2\\pi\\times${rad}\\times${fr(ang, 360)}=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * 2 * rad * ang / 360) };
      },
      // 立体：球・円柱（直径で書いたものも）
      s2(r) {
        const k = r.int(0, 2), dia = r.chance(0.4), rad = r.int(1, 6) * (k === 0 ? 3 : 1);
        const R = dia ? `直径 $${2 * rad}$ ` : `半径 $${rad}$ `;
        if (k === 0) {
          const c = 4 * rad ** 3 / 3; if (c > 400) return null;
          return { q: `${R}の球の体積（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `${dia ? `半径 ${rad}。` : ''}$\\frac{4}{3}\\pi\\times${rad}^3=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * 4 / 3 * rad ** 3) };
        }
        if (k === 1) {
          const c = 4 * rad * rad;
          return { q: `${R}の球の表面積（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `${dia ? `半径 ${rad}。` : ''}$4\\pi\\times${rad}^2=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * 4 * rad * rad) };
        }
        const h = r.int(2, 10), c = rad * rad * h;
        return { q: `底面の${R.trim()}、高さ $${h}$ の円柱の体積（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `${dia ? `半径 ${rad}。` : ''}$\\pi\\times${rad}^2\\times${h}=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * rad * rad * h) };
      },
      // 場面：車輪が1回転で進む長さ、ピザの1切れ、円形の花だん
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const D = r.pick([20, 30, 40, 50, 60, 70]), n = r.int(1, 10);
          return { q: `直径 $${D}\\,\\mathrm{cm}$ の車輪が $${n}$ 回転すると □ cm 進む（$\\pi=3.14$）`, a: `$${PI314(D * n)}$`, easyCheck: false, easy: `1回転で $${D}\\pi$、$${n}$ 回転で $${piT(D * n)}$。$${D * n}\\times3.14=${PI314(D * n)}$`, verify: () => ok(`$${PI314(D * n)}$`, 3.14 * D * n) };
        }
        if (k === 1) {
          const D = r.pick([20, 24, 28, 32, 36, 40]), n = r.pick([4, 6, 8]), c = (D / 2) ** 2 / n;
          if (!Number.isInteger(c)) return null;
          return { q: `直径 $${D}\\,\\mathrm{cm}$ の丸いピザを $${n}$ 等分した1切れの面積 $□\\,\\mathrm{cm^2}$（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `半径 ${D / 2}。$\\pi\\times${D / 2}^2\\div${n}=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * (D / 2) ** 2 / n) };
        }
        const rad = r.int(2, 9), w = 1;
        const c = (rad + w) ** 2 - rad * rad;
        return { q: `半径 $${rad}\\,\\mathrm{m}$ の円い花だんのまわりの、はば $${w}\\,\\mathrm{m}$ の道の面積 $□\\,\\mathrm{m^2}$（$\\pi=3.14$）`, a: `$${PI314(c)}$`, easyCheck: false, easy: `$\\pi\\times${rad + w}^2-\\pi\\times${rad}^2=${piT(c)}$、$${c}\\times3.14=${PI314(c)}$`, verify: () => ok(`$${PI314(c)}$`, 3.14 * ((rad + w) ** 2 - rad * rad)) };
      },
      // わな：円周・面積から半径（はじめから3.14でわる。最後にかける形ではない）
      trap(r) {
        const rad = r.int(2, 10);
        if (r.chance(0.5)) {
          const C = PI314(2 * rad);
          const p = { q: `円周の長さが $${C}$ の円の半径（$\\pi=3.14$）`, a: `$${rad}$`, verify: () => close(rad * 2 * 3.14, +C) || 'まちがい' };
          return dest(p, '4-28', `はじめから3.14でわる：$${C}\\div3.14=${2 * rad}$ が直径、半径は $${rad}$`);
        }
        const A = PI314(rad * rad);
        const p = { q: `面積が $${A}$ の円の半径（$\\pi=3.14$）`, a: `$${rad}$`, key: '428A:' + rad, verify: () => close(rad * rad * 3.14, +A) || 'まちがい' };
        return dest(p, '4-28', `はじめから3.14でわる：$${A}\\div3.14=${rad * rad}$、2乗して ${rad * rad} になる数で、半径は $${rad}$`);
      },
    },
  });

  // ================================================================ 4-29
  M.add({
    id: '4-29', part: PART, chap: '4-5⑥', stars: 1,
    title: 'すいは柱の $\\frac{1}{3}$',
    mark: '**円すい・角すい**の体積。',
    futsu: ['$\\frac13\\times\\pi\\times3^2\\times4$ を、左から順に', '分数のまま計算する。'],
    raku: ['同じ底面・同じ高さの円柱は', '$\\pi\\times3^2\\times4=36\\pi$', 'その $\\frac{1}{3}$ で $12\\pi$'],
    why: 'すいの体積は、同じ底面・同じ高さの柱の $\\frac{1}{3}$（4-5⑥）。先に柱の体積を整数で出して、最後に3でわれば、約分は1回ですむ。',
    caution: '円柱・角柱には $\\frac{1}{3}$ をかけない。高さは、底面に垂直にはかった長さ（母線ではない）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return (/すい/.test(q) && /体積/.test(q) && !/平行に切/.test(q)) || (/直角三角形/.test(q) && /1回転/.test(q) && /体積/.test(q)); },
    steps: {
      // 円すい・四角すい
      s1(r) {
        const pyr = r.chance(0.35), R = r.int(2, 9), h = r.int(2, 12), V = R * R * h;
        if (V % 3) return null;
        if (pyr) return { q: `底面が1辺 $${R}$ の正方形で、高さ $${h}$ の四角すいの体積`, a: `$${V / 3}$`, easy: `$${R}\\times${R}\\times${h}\\times\\frac{1}{3}=${V}\\times\\frac{1}{3}=${V / 3}$` };
        return { q: `底面の半径 $${R}$、高さ $${h}$ の円すいの体積`, a: `$${piT(V / 3)}$`, key: `429:${R},${h}`, easy: `$\\pi\\times${R}^2\\times${h}\\times\\frac{1}{3}=${piT(V)}\\times\\frac{1}{3}=${piT(V / 3)}$` };
      },
      // 底面積がわかる三角すい、直径、体積から高さ
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) { const S = r.int(4, 30), h = r.int(3, 12); if ((S * h) % 3) return null; return { q: `底面積が $${S}$、高さが $${h}$ の三角すいの体積`, a: `$${S * h / 3}$`, easy: `$${S}\\times${h}\\times\\frac{1}{3}=${S * h / 3}$` }; }
        if (k === 1) { const R = r.int(1, 6), h = r.int(2, 12), V = R * R * h; if (V % 3) return null; return { q: `底面の直径 $${2 * R}$、高さ $${h}$ の円すいの体積`, a: `$${piT(V / 3)}$`, key: `429:${R},${h}`, easyCheck: false, easy: `半径は ${R}。$\\pi\\times${R}^2\\times${h}\\times\\frac{1}{3}=${piT(V / 3)}$`, verify: () => ok(`$${piT(V / 3)}$`, Math.PI * R * R * h / 3) }; }
        const R = r.int(2, 6), h = r.int(2, 12), V = R * R * h;
        if (V % 3) return null;
        return { q: `体積が $${piT(V / 3)}$、底面の半径が $${R}$ の円すいの高さ`, a: `$${h}$`, key: `429:${R},${h}`, easy: `同じ底面・高さの円柱なら $${piT(V)}$。底面積 $${piT(R * R)}$ でわって $${V}\\div${R * R}=${h}$`, easyCheck: false, verify: () => close(Math.PI * R * R * h / 3, ev(`$${piT(V / 3)}$`)) || 'まちがい' };
      },
      // 場面：円すい形の容器、砂山、円柱から円すいをくりぬく
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const R = r.int(2, 6), h = r.int(6, 15), V = R * R * h; if (V % 3) return null;
          return { q: `底面の半径 $${R}\\,\\mathrm{cm}$、深さ $${h}\\,\\mathrm{cm}$ の円すい形の容器に入る水の体積は $□\\,\\mathrm{cm^3}$`, a: `$${piT(V / 3)}$`, easy: `$\\pi\\times${R}^2\\times${h}\\times\\frac{1}{3}=${piT(V / 3)}$` };
        }
        if (k === 1) {
          const R = r.int(2, 5), h = r.int(1, 4), V = R * R * h; if (V % 3) return null;
          return { q: `直径 $${2 * R}\\,\\mathrm{m}$、高さ $${h}\\,\\mathrm{m}$ の円すい形の砂山の体積は $□\\,\\mathrm{m^3}$`, a: `$${piT(V / 3)}$`, easyCheck: false, easy: `半径は ${R}。$\\pi\\times${R}^2\\times${h}\\times\\frac{1}{3}=${piT(V / 3)}$`, verify: () => ok(`$${piT(V / 3)}$`, Math.PI * R * R * h / 3) };
        }
        const R = r.int(2, 6), h = r.int(3, 12), V = R * R * h; if (V % 3) return null;
        return { q: `底面の半径 $${R}$、高さ $${h}$ の円柱から、同じ底面・同じ高さの円すいをくりぬいた。残りの体積`, a: `$${piT(2 * V / 3)}$`, easyCheck: false, easy: `円柱 $${piT(V)}$ の $1-\\frac{1}{3}=\\frac{2}{3}$ で $${piT(2 * V / 3)}$`, verify: () => ok(`$${piT(2 * V / 3)}$`, Math.PI * R * R * h - Math.PI * R * R * h / 3) };
      },
      // わな：円柱・角柱（$\frac13$ をかけない）
      trap(r) {
        const R = r.int(2, 6), h = r.int(2, 10), V = R * R * h, pr = r.chance(0.4);
        const p = pr ? { q: `底面が1辺 $${R}$ の正方形で、高さ $${h}$ の四角柱の体積`, a: `$${V}$`, verify: () => close(V, R * R * h) || 'まちがい' }
          : { q: `底面の半径 $${R}$、高さ $${h}$ の円柱の体積`, a: `$${piT(V)}$`, verify: () => ok(`$${piT(V)}$`, Math.PI * R * R * h) };
        return dest(p, '4-29', `柱なので $\\frac{1}{3}$ をかけない：$${pr ? `${R}\\times${R}\\times${h}` : `\\pi\\times${R}^2\\times${h}`}=${pr ? V : piT(V)}$`);
      },
    },
  });

  // ================================================================ 4-30
  M.add({
    id: '4-30', part: PART, chap: '4-5⑧', stars: 1,
    title: '円すいの側面積は $\\pi r\\ell$',
    mark: '円すいの**表面積・側面積**（母線 $\\ell$）。',
    futsu: ['展開図のおうぎ形の中心角を', '$360^{\\circ}\\times\\frac{3}{5}=216^{\\circ}$ と出してから、', 'おうぎ形の面積を求める。'],
    raku: ['側面積 $\\pi\\times3\\times5=15\\pi$', '底面 $\\pi\\times3^2=9\\pi$', '表面積 $15\\pi+9\\pi=24\\pi$'],
    why: '側面のおうぎ形は、弧が底面の円周 $2\\pi r$、半径が母線 $\\ell$。おうぎ形の面積＝$\\frac{1}{2}\\times$弧$\\times$半径（4-2）なので、$\\frac{1}{2}\\times2\\pi r\\times\\ell=\\pi r\\ell$（4-5⑧）。中心角はいらない。',
    caution: '$\\ell$ は高さではなく母線。高さしかわからないときは、$\\ell=\\sqrt{r^2+h^2}$ を先に出す。表面積には、底面の $\\pi r^2$ をわすれずにたす。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /円すい/.test(q) && /表面積|側面積|紙の面積|布の面積/.test(q); },
    steps: {
      // 半径と母線から、側面積・表面積
      s1(r) {
        const R = r.int(2, 9), L = R + r.int(1, 9), tot = r.chance(0.5);
        if (tot) return { q: `底面の半径 $${R}$、母線 $${L}$ の円すいの表面積`, a: `$${piT(R * L + R * R)}$`, easy: `$\\pi\\times${R}\\times${L}+\\pi\\times${R}^2=${piT(R * L)}+${piT(R * R)}=${piT(R * L + R * R)}$` };
        return { q: `底面の半径 $${R}$、母線 $${L}$ の円すいの側面積`, a: `$${piT(R * L)}$`, easy: `$\\pi\\times${R}\\times${L}=${piT(R * L)}$` };
      },
      // 半径と高さから（母線を先に）
      s2(r) {
        const x = triple(r, [1, 2, 3]); if (!x || x.c > 30) return null;
        const [R, h] = r.chance(0.5) ? [x.a, x.b] : [x.b, x.a], L = x.c, tot = r.chance(0.6);
        const ans = tot ? piT(R * L + R * R) : piT(R * L);
        return {
          q: `底面の半径 $${R}$、高さ $${h}$ の円すいの${tot ? '表面積' : '側面積'}`, a: `$${ans}$`, easyCheck: false,
          easy: `母線 $\\ell=\\sqrt{${R}^2+${h}^2}=${L}$。${tot ? `$\\pi\\times${R}\\times${L}+\\pi\\times${R}^2=${ans}$` : `$\\pi\\times${R}\\times${L}=${ans}$`}`,
          // 別の道すじ：展開図のおうぎ形（半径 ℓ、中心角 360×r/ℓ）の面積
          verify: () => ok(`$${ans}$`, Math.PI * L * L * (R / Math.hypot(R, h)) + (tot ? Math.PI * R * R : 0)),
        };
      },
      // 場面：とんがり帽子、テント
      s3(r) {
        if (r.chance(0.5)) {
          const R = r.int(4, 10), L = R + r.int(4, 14);
          return { q: `底面の半径 $${R}\\,\\mathrm{cm}$、母線 $${L}\\,\\mathrm{cm}$ の円すいの形の帽子（底はない）を作る。いる紙の面積は $□\\,\\mathrm{cm^2}$`, a: `$${piT(R * L)}$`, easy: `側面だけ。$\\pi\\times${R}\\times${L}=${piT(R * L)}$` };
        }
        const x = triple(r, [0.5, 1]); if (!x) return null;
        const [R, h] = x.a > x.b ? [x.a, x.b] : [x.b, x.a];
        if (R > 8) return null;
        return {
          q: `底面の半径 $${fmt(R)}\\,\\mathrm{m}$、高さ $${fmt(h)}\\,\\mathrm{m}$ の円すいの形のテント（底はない）の、布の面積は $□\\,\\mathrm{m^2}$`, a: `$${piT(Math.round(R * x.c * 4), 4)}$`, easyCheck: false,
          easy: `母線 $\\sqrt{${fmt(R)}^2+${fmt(h)}^2}=${fmt(x.c)}$。$\\pi\\times${fmt(R)}\\times${fmt(x.c)}=${piT(Math.round(R * x.c * 4), 4)}$`,
          verify: () => ok(`$${piT(Math.round(R * x.c * 4), 4)}$`, Math.PI * x.c * x.c * (R / Math.hypot(R, h))),
        };
      },
      // わな：円柱の側面（長方形）、母線がわかる円すいの体積（高さがいる）
      trap(r) {
        if (r.chance(0.5)) {
          const R = r.int(2, 8), h = r.int(2, 10);
          const p = { q: `底面の半径 $${R}$、高さ $${h}$ の円柱の側面積`, a: `$${piT(2 * R * h)}$`, verify: () => ok(`$${piT(2 * R * h)}$`, 2 * Math.PI * R * h) };
          return dest(p, '4-30', `円柱の側面は長方形：横 $2\\pi\\times${R}$、たて $${h}$ で $${piT(2 * R * h)}$（$\\pi r\\ell$ ではない）`);
        }
        const x = triple(r, [1, 2]); if (!x || x.c > 26) return null;
        const [R, h] = r.chance(0.5) ? [x.a, x.b] : [x.b, x.a], V = R * R * h;
        if (R > 12) return null;
        if (V % 3) return null;
        const p = { q: `底面の半径 $${R}$、母線 $${x.c}$ の円すいの体積`, a: `$${piT(V / 3)}$`, verify: () => ok(`$${piT(V / 3)}$`, Math.PI * R * R * Math.sqrt(x.c * x.c - R * R) / 3) };
        return dest(p, '4-30', `体積には母線ではなく高さがいる。高さ $\\sqrt{${x.c}^2-${R}^2}=${h}$、$\\pi\\times${R}^2\\times${h}\\times\\frac{1}{3}=${piT(V / 3)}$`);
      },
    },
  });

  // ================================================================ 4-31
  // 回転させる図形と、回す軸（点線、$\ell$）の図。shape：'rect'・'tri'。w：軸に垂直な長さ、h：軸にそった長さ
  function figRot(shape, w, h, opt) {
    opt = opt || {};
    const k = Math.min(5.5 / w, 4.4 / h), W = w * k, H = h * k;
    let items = [];
    if (shape === 'rect') {
      items.push(['poly', [[0, 0], [W, 0], [W, H], [0, H]]], ['right', [W, 0], [0, 0], [0, H], 0.35], ['label', [W / 2, 0], opt.wl, 's'], ['label', [W, H / 2], opt.hl, 'e']);
    } else {
      items.push(['poly', [[0, 0], [W, 0], [0, H]]], ['right', [W, 0], [0, 0], [0, H], 0.35], ['label', [W / 2, 0], opt.wl, 's'], ['label', [0, H / 2], opt.hl, 'w']);
    }
    items.push(['seg', [0, -0.9], [0, H + 0.9], { dash: true }], ['label', [0, H + 0.9], '軸', 'n']);
    if (opt.right) items = mapFig(items, p => [-p[0], p[1]]).map(it => (it[0] === 'label' && it[3] === 'e' ? [it[0], it[1], it[2], 'w'] : it[0] === 'label' && it[3] === 'w' ? [it[0], it[1], it[2], 'e'] : it));
    if (opt.horiz) items = mapFig(items, p => [p[1], -p[0]]).map(it => (it[0] === 'label' ? [it[0], it[1], it[2], { s: 'w', e: 's', w: 'n', n: 'e' }[it[3]] || it[3]] : it));
    return { s: 5, pad: FIGPAD, items };
  }
  M.add({
    id: '4-31', part: PART, chap: '4-5⑧', stars: 1,
    title: '回転体は、軸に垂直な辺が半径',
    mark: '長方形・直角三角形を、**1辺を軸にして1回転**させた立体。',
    futsu: ['見取図をかいて、どんな', '立体になるかをたしかめて', 'から、半径と高さを読む。'],
    raku: ['軸にくっついた辺が高さ、', '軸に垂直な辺が半径', 'たて4・横3の長方形をたてで', '→ 半径3・高さ4の円柱 $36\\pi$', '6と8の直角三角形を8の辺で', '→ 半径6・高さ8の円すい $96\\pi$'],
    why: '軸のまわりに回すと、軸からいちばん遠い点が、いちばん大きい円をえがく（4-5⑧）。軸にくっついた辺は、立体のまん中の線（高さ）になる。長方形なら円柱、直角三角形なら円すい。',
    caution: 'どの辺を軸にするかで、半径と高さが入れかわり、体積も変わる。直角三角形の斜辺は母線になる（半径ではない）。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: '14mm',
    fits(q) { return /1回転/.test(q) && !/半円|おうぎ形/.test(q); },
    steps: {
      // 長方形 → 円柱
      s1(r) {
        const a = r.int(2, 8), b = r.intNot(2, 8, v => v === a), ax = r.pick(['たて', '横']);
        const [R, h] = ax === 'たて' ? [b, a] : [a, b];
        return {
          q: `たて $${a}$、横 $${b}$ の長方形を、${ax}の辺を軸に1回転した体積`, a: `$${piT(R * R * h)}$`, key: `431cyl:${R},${h}`,
          easy: `半径 ${R}・高さ ${h} の円柱：$\\pi\\times${R}^2\\times${h}=${piT(R * R * h)}$`,
        };
      },
      // 直角三角形 → 円すい
      s2(r) {
        const p = r.int(2, 9), q = r.intNot(2, 9, v => v === p), ax = r.pick([p, q]), R = ax === p ? q : p, V = R * R * ax;
        if (V % 3) return null;
        return {
          q: `直角の2辺が $${p}$、$${q}$ の直角三角形を辺 $${ax}$ を軸に1回転した体積`, a: `$${piT(V / 3)}$`, key: `431cone:${R},${ax}`,
          easy: `半径 ${R}・高さ ${ax} の円すい：$\\pi\\times${R}^2\\times${ax}\\times\\frac{1}{3}=${piT(V / 3)}$`,
        };
      },
      // 図で（軸が右・横にあるものも）
      s3(r) {
        const tri = r.chance(0.5), w = r.int(2, 8), h = r.intNot(2, 9, v => v === w), V = w * w * h;
        if (tri && V % 3) return null;
        const ans = tri ? piT(V / 3) : piT(V), horiz = r.chance(0.3), right = !horiz && r.chance(0.4);
        return {
          q: `図の${tri ? '直角三角形' : '長方形'}を、点線を軸に1回転した体積`, a: `$${ans}$`,
          fig: figRot(tri ? 'tri' : 'rect', w, h, { wl: String(w), hl: String(h), horiz, right }), key: `431${tri ? 'cone' : 'cyl'}:${w},${h}`,
          easy: `半径 ${w}・高さ ${h} の${tri ? '円すい' : '円柱'}：$\\pi\\times${w}^2\\times${h}${tri ? '\\times\\frac{1}{3}' : ''}=${ans}$`,
        };
      },
      // わな：半円・四分円（長方形・直角三角形ではない。球・半球になる）
      trap(r) {
        if (r.chance(0.5)) {
          const R = r.int(1, 6), D = 2 * R, V = 4 * R ** 3;
          const p = { q: `直径 $${D}$ の半円を、直径を軸に1回転した体積`, a: `$${piT(V, 3)}$`, verify: () => ok(`$${piT(V, 3)}$`, 4 / 3 * Math.PI * R ** 3) };
          return dest(p, '4-31', `半円を回すと球。半径は直径の半分の ${R}：$\\frac{4}{3}\\pi\\times${R}^3=${piT(V, 3)}$`, true);
        }
        const R = r.int(1, 6), V = 2 * R ** 3;
        const p = { q: `半径 $${R}$、中心角 $90^{\\circ}$ のおうぎ形を、半径の1つを軸に1回転した体積`, a: `$${piT(V, 3)}$`, verify: () => ok(`$${piT(V, 3)}$`, 2 / 3 * Math.PI * R ** 3) };
        return dest(p, '4-31', `おうぎ形を回すと半球（球の半分）：$\\frac{4}{3}\\pi\\times${R}^3\\div2=${piT(V, 3)}$`, true);
      },
    },
  });

  // ================================================================ 4-92
  const kmStr = cm => fmt(cm / 100000), mStr = cm => fmt(cm / 100);
  M.add({
    id: '4-92', part: PART, chap: '4-3①', stars: 1,
    title: '縮尺は「1 cm が何 m か」を先に',
    mark: '地図・設計図の**縮尺** $1:25000$ と、図の上の長さ・本物の長さ。',
    futsu: ['$6\\times25000=150000$ cm', 'を出してから、', '$150000\\div100\\div1000$', '$=1.5$ km と2回わる。'],
    raku: ['$1:25000$ → 1 cm は 25000 cm＝250 m', '6 cm は $6\\times250=1500$ m＝1.5 km'],
    why: '縮尺 $1:25000$ は「図の1 cm が本物の 25000 cm」。1 cm が何 m かを先に出しておけば、図の長さにかけるだけで、単位のまちがいもへる（4-3①）。',
    caution: '本物の長さから図の長さを出すときはわり算（2 km＝2000 m、$2000\\div250=8$ cm）。面積は縮尺の2乗になる（わざ 4-18）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '14mm', s3: '18mm', trap: '18mm' },
    fits(q) { return /縮尺/.test(q) && !/面積|ペンキ|重さ/.test(q); },
    steps: {
      // 地図の長さから本物（km・m）
      s1(r) {
        const N = r.pick([10000, 20000, 25000, 50000, 100000, 5000, 2500]), L = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 1.5, 2.5, 3.5]);
        const cm = L * N, inKm = cm >= 100000;
        const ans = inKm ? kmStr(cm) : mStr(cm), unit = inKm ? 'km' : 'm', per = N / 100;
        return {
          q: `縮尺 $1:${N}$ の地図で $${fmt(L)}\\,\\mathrm{cm}$ の長さは、本物で □ ${unit}`, a: `$${ans}$`, easyCheck: false, key: `492:${N},${L}`,
          easy: `1 cm は $${fmt(per)}$ m。$${fmt(L)}\\times${fmt(per)}=${fmt(L * per)}$ m${inKm ? `＝$${ans}$ km` : ''}`,
          verify: () => close(+ans * (inKm ? 100000 : 100), L * N) || 'まちがい',
        };
      },
      // 本物から地図の長さ／設計図（1:50・1:100）
      s2(r) {
        if (r.chance(0.5)) {
          const N = r.pick([10000, 20000, 25000, 50000]), per = N / 100, L = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), m = L * per;
          const useKm = m >= 1000 && r.chance(0.7);
          return {
            q: `縮尺 $1:${N}$ の地図で、本物の $${useKm ? fmt(m / 1000) : fmt(m)}\\,\\mathrm{${useKm ? 'km' : 'm'}}$ は、地図の上で □ cm`, a: `$${L}$`, easyCheck: false, key: `492:${N},${L}`,
            easy: `1 cm は $${fmt(per)}$ m。${useKm ? `$${fmt(m / 1000)}$ km＝$${fmt(m)}$ m、` : ''}$${fmt(m)}\\div${fmt(per)}=${L}$`,
            verify: () => close(L * N, m * 100) || 'まちがい',
          };
        }
        const N = r.pick([50, 100, 200]), L = r.pick([3, 4.5, 6, 7.5, 8, 9, 12, 15]), m = L * N / 100;
        return {
          q: `縮尺 $1:${N}$ の家の設計図で $${fmt(L)}\\,\\mathrm{cm}$ の長さは、本物で □ m`, a: `$${fmt(m)}$`, easyCheck: false, key: `492:${N},${L}`,
          easy: `1 cm は $${fmt(N / 100)}$ m。$${fmt(L)}\\times${fmt(N / 100)}=${fmt(m)}$`,
          verify: () => close(m * 100, L * N) || 'まちがい',
        };
      },
      // 縮尺を求める、模型の高さ
      s3(r) {
        if (r.chance(0.5)) {
          const N = r.pick([10000, 20000, 25000, 50000, 100000]), L = r.pick([2, 3, 4, 5, 6, 8]), km = L * N / 100000;
          return {
            q: `地図で $${L}\\,\\mathrm{cm}$ が本物で $${fmt(km)}\\,\\mathrm{km}$ のとき、縮尺は $1:□$`, a: `$${N}$`, easyCheck: false, key: `492:${N},${L}`,
            easy: `$${fmt(km)}$ km＝$${fmt(km * 100000)}$ cm。$${fmt(km * 100000)}\\div${L}=${N}$`,
            verify: () => close(L * N, km * 100000) || 'まちがい',
          };
        }
        const N = r.pick([100, 200, 250, 500, 1000]), L = r.pick([4, 6, 8, 10, 12, 15, 20]), m = L * N / 100;
        return {
          q: `縮尺 $1:${N}$ の建物の模型の高さが $${L}\\,\\mathrm{cm}$。本物の高さ □ m`, a: `$${fmt(m)}$`, easyCheck: false, key: `492:${N},${L}`,
          easy: `1 cm は $${fmt(N / 100)}$ m。$${L}\\times${fmt(N / 100)}=${fmt(m)}$`, verify: () => close(m * 100, L * N) || 'まちがい',
        };
      },
      // わな：地図の上の面積（縮尺の2乗）
      trap(r) {
        const N = r.pick([500, 1000, 2000, 5000]), A = r.pick([2, 3, 4, 5, 6]), per = N / 100, ans = A * per * per;
        const p = { q: `縮尺 $1:${N}$ の地図で、面積が $${A}\\,\\mathrm{cm^2}$ の土地は、本物で $□\\,\\mathrm{m^2}$`, a: `$${fmt(ans)}$`, verify: () => close(ans * 10000, A * N * N) || 'まちがい' };
        return dest(p, '4-92', `面積は縮尺の2乗。1 cm は ${fmt(per)} m なので、$1\\,\\mathrm{cm^2}$ は $${fmt(per)}\\times${fmt(per)}=${fmt(per * per)}\\,\\mathrm{m^2}$。$${A}\\times${fmt(per * per)}=${fmt(ans)}$`);
      },
    },
  });

  // ================================================================ 4-93
  M.add({
    id: '4-93', part: PART, chap: '4-5⑤', stars: 1,
    title: '体積の単位は長さの換算を3回：$1\\,\\mathrm{m^3}=1000\\,\\mathrm{L}$',
    mark: '体積を **L・$\\mathrm{m^3}$・$\\mathrm{cm^3}$** で答える（タンク・水そう）。',
    futsu: ['$1\\,\\mathrm{m^3}$ を', '$100\\times100\\times100$', '$=1000000\\,\\mathrm{cm^3}$ になおし、', 'それを1000でわって L にする。'],
    raku: ['$1\\,\\mathrm{m^3}=1000\\,\\mathrm{L}$、$1\\,\\mathrm{L}=1000\\,\\mathrm{cm^3}$', '$1.5\\pi\\,\\mathrm{m^3}$ → $1.5\\times3.14=4.71\\,\\mathrm{m^3}$', '$4.71\\times1000=4710$ L'],
    why: '1 m＝100 cm なので、$1\\,\\mathrm{m^3}=100\\times100\\times100\\,\\mathrm{cm^3}$。体積では長さの換算の数を3回かける（2-10）。$1\\,\\mathrm{L}=1000\\,\\mathrm{cm^3}$ なので、$1\\,\\mathrm{m^3}=1000\\,\\mathrm{L}$（4-5⑤）。',
    caution: '$1\\,\\mathrm{m^3}$ は 100 L ではない。cm と m がまざっていたら、先にどちらかにそろえる。面積なら換算は2回（$1\\,\\mathrm{m^2}=10000\\,\\mathrm{cm^2}$）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /□ L|\\mathrm\{L\}/.test(q) && /\\,\\mathrm\{(?:cm|m)\}|\\mathrm\{(?:cm|m)\^3\}/.test(q); },
    steps: {
      // 水そう（cm）から L、$\mathrm{m^3}$ から L
      s1(r) {
        if (r.chance(0.6)) {
          const a = 10 * r.int(2, 9), b = 10 * r.int(2, 9), c = r.pick([12, 15, 20, 24, 25, 30, 36, 40, 45]), V = a * b * c, L = V / 1000;
          return {
            q: `たて $${a}\\,\\mathrm{cm}$・横 $${b}\\,\\mathrm{cm}$・深さ $${c}\\,\\mathrm{cm}$ の水そうに入る水 □ L`, a: `$${fmt(L)}$`, easyCheck: false, key: NK('493c', a, b, c),
            easy: `$${a}\\times${b}\\times${c}=${V}$ $\\mathrm{cm^3}$、$${V}\\div1000=${fmt(L)}$`,
            verify: () => close(L, (a / 10) * (b / 10) * (c / 10)) || 'まちがい',   // 10 cm の立方体（1 L）がいくつ入るか
          };
        }
        const v = r.pick([0.5, 1.2, 1.5, 2, 2.4, 3, 4.5, 6, 0.8, 0.25]);
        return { q: `$${fmt(v)}\\,\\mathrm{m^3}$ は □ L`, a: `$${fmt(v * 1000)}$`, key: '493v:' + fmt(v), easy: `$${fmt(v)}\\times1000=${fmt(v * 1000)}$` };
      },
      // m の水そう、L から $\mathrm{m^3}$、cm と m がまざる
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick([1, 1.5, 2, 2.5, 3]), b = r.pick([0.5, 1, 1.2, 1.5, 2]), c = r.pick([0.4, 0.5, 0.8, 1, 1.2]), V = +fmt(a * b * c);
          return { q: `たて $${a}\\,\\mathrm{m}$・横 $${b}\\,\\mathrm{m}$・深さ $${c}\\,\\mathrm{m}$ の水そうに入る水 □ L`, a: `$${fmt(V * 1000)}$`, key: NK('493m', a, b, c), easyCheck: false, easy: `$${a}\\times${b}\\times${c}=${fmt(V)}$ $\\mathrm{m^3}$、$${fmt(V)}\\times1000=${fmt(V * 1000)}$`, verify: () => close(V * 1000, (a * 10) * (b * 10) * (c * 10)) || 'まちがい' };
        }
        if (k === 1) { const L = r.pick([500, 1200, 2500, 3000, 4800, 750, 200, 6000]); return { q: `$${L}\\,\\mathrm{L}$ は $□\\,\\mathrm{m^3}$`, a: `$${fmt(L / 1000)}$`, key: '493v:' + fmt(L / 1000), easy: `$${L}\\div1000=${fmt(L / 1000)}$` }; }
        const a = r.pick([1, 1.2, 1.5, 2]), b = r.pick([40, 50, 60, 80]), c = r.pick([30, 40, 50]), L = a * 10 * (b / 10) * (c / 10);
        return { q: `たて $${a}\\,\\mathrm{m}$・横 $${b}\\,\\mathrm{cm}$・深さ $${c}\\,\\mathrm{cm}$ の水そうに入る水 □ L`, a: `$${fmt(L)}$`, easyCheck: false, easy: `cm にそろえて $${fmt(a * 100)}\\times${b}\\times${c}=${fmt(a * 100 * b * c)}$ $\\mathrm{cm^3}$、$\\div1000$ で $${fmt(L)}$`, verify: () => close(L * 1000, a * 100 * b * c) || 'まちがい' };
      },
      // 円柱のタンク（$\pi=3.14$）、毎分□ L で入れる時間
      s3(r) {
        const D = r.pick([1, 2, 2, 3]), h = r.pick([1, 1.5, 2, 2.5, 3]), c = (D / 2) ** 2 * h, m3 = +fmt(c * 3.14), L = +fmt(c * 3140), cq = M.F.fromDec(fmt(c));
        if (r.chance(0.65)) {
          return {
            q: `直径 $${D}\\,\\mathrm{m}$、高さ $${fmt(h)}\\,\\mathrm{m}$ の円柱のタンクに入る水 □ L（$\\pi=3.14$）`, a: `$${fmt(L)}$`, easyCheck: false,
            easy: `半径 ${fmt(D / 2)}。$\\pi\\times${fmt(D / 2)}^2\\times${fmt(h)}=${piT(cq[0], cq[1])}$ $\\mathrm{m^3}$、$${fmt(c)}\\times3.14=${fmt(m3)}$、$\\times1000$ で $${fmt(L)}$`,
            verify: () => close(L, 3.14 * (D * 100 / 2) ** 2 * (h * 100) / 1000) || 'まちがい',
          };
        }
        const a = r.pick([1, 2]), b = r.pick([1, 1.5, 2]), d = r.pick([0.5, 1, 1.2]), V = +fmt(a * b * d * 1000), q = r.pick([20, 25, 40, 50, 100]), t = V / q;
        if (!Number.isInteger(t)) return null;
        return { q: `たて $${a}\\,\\mathrm{m}$・横 $${b}\\,\\mathrm{m}$・深さ $${d}\\,\\mathrm{m}$ の水そうに毎分 $${q}\\,\\mathrm{L}$ 入れると、いっぱいまで □ 分`, a: `$${t}$`, key: NK('493t', a, b, d), easyCheck: false, easy: `$${fmt(a * b * d)}\\,\\mathrm{m^3}=${V}$ L、$${V}\\div${q}=${t}$`, verify: () => close(t * q, a * 10 * b * 10 * d * 10) || 'まちがい' };
      },
      // わな：面積の単位（換算は2回）
      trap(r) {
        const A = r.pick([2, 3, 1.5, 0.5, 4, 2.5]), ans = A * 10000;
        const p = { q: `$${fmt(A)}\\,\\mathrm{m^2}$ は $□\\,\\mathrm{cm^2}$`, a: `$${fmt(ans)}$`, verify: () => close(ans, A * 100 * 100) || 'まちがい' };
        return dest(p, '4-93', `面積は長さの換算を2回：$100\\times100=10000$ 倍で $${fmt(A)}\\times10000=${fmt(ans)}$（体積の3回ではない）`);
      },
    },
  });
})(globalThis.MONDAI);
