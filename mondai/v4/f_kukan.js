/* 問題集 第4巻　第6部 空間・外積・いろいろな座標（わざ 4-79〜4-90、4-98・4-99）　組 f
 * 書き方は v4/README.md（第4巻の手引き）と v2/README.md。文は教科書 第4巻と同じ：ルビなし・常用漢字まで。式は $…$。
 * 答えが成分・座標・平面の式・ことばのときは verify で、問題を作った数とは別の道すじで計算し直して確かめる。
 * 図はステップ3（とわな）だけ（K-2）：4-79（直方体の見取図）、4-83（棒と力）、4-90（円運動）。図の点は問題の数から計算する。
 * 電卓は使わない（K-4）：角は 30°・45°・60° の仲間だけ。近似値は使う値を問題の文に書く（K-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const fx = v => (Math.abs(v) < 1e-12 ? "0" : v.toFixed(12));                 // 検算用（けたを落とさない）
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));               // マイナスはかっこごと
  const V = (...c) => `(${c.join(',\\ ')})`;                       // 成分・座標 (1,\ 2,\ 3)
  const VL = (...c) => (c.some(x => /\\frac/.test(x)) ? `\\left(${c.join(',\\ ')}\\right)` : V(...c));   // 分数があれば大きいかっこ
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const rad = d => d * Math.PI / 180;
  const D = d => `${d}^{\\circ}`;                                   // 度
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const mid = (P, Q) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
  const NM = '$\\mathrm{N\\cdot m}$';
  const perm = (r, a) => r.shuffle(a);
  const sgn = (r, a) => a.map(x => (r.chance(0.4) ? -x : x));

  // √n を k√m に（TeX）
  function sqf(n) { let k = 1, m = n; for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; } return [k, m]; }
  function rootTeX(n) { if (n === 0) return '0'; const [k, m] = sqf(n); return m === 1 ? `${k}` : `${k === 1 ? '' : k}\\sqrt{${m}}`; }
  // 根号の数 p/q·√s（s は平方の因数のない正の整数）。三角比の値と、そのかけ算に使う
  function S(p, q = 1, s = 1) {
    if (p === 0) return { p: 0, q: 1, s: 1 };
    const [k, m] = sqf(s); p *= k;
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q); return { p: p / g, q: q / g, s: m };
  }
  const Sr = x => { const q = 10000, p = Math.round(x * q); return S(p, q); };   // 小数（4けたまで）を分数に
  const Smul = (...a) => a.reduce((x, y) => S(x.p * y.p, x.q * y.q, x.s * y.s));
  const Sval = a => a.p / a.q * Math.sqrt(a.s);
  function Stex(a) {
    if (a.p === 0) return '0';
    const sg = a.p < 0 ? '-' : '', n = Math.abs(a.p);
    const num = a.s === 1 ? `${n}` : `${n === 1 ? '' : n}\\sqrt{${a.s}}`;
    return a.q === 1 ? sg + num : `${sg}\\frac{${num}}{${a.q}}`;
  }
  // 30°・45°・60° の仲間の sin・cos（根号の数で）
  function sinS(d) {
    d = ((d % 360) + 360) % 360;
    const sg = d > 180 ? -1 : 1; let t = d > 180 ? d - 180 : d; if (t > 90) t = 180 - t;
    const T = { 0: S(0), 30: S(1, 2), 45: S(1, 2, 2), 60: S(1, 2, 3), 90: S(1) }, v = T[t];
    if (!v) throw new Error('sinS: ' + d);
    return S(sg * v.p, v.q, v.s);
  }
  const cosS = d => sinS(d + 90);
  // π の何倍か（分数 [n, d]）を TeX に：2\pi、\frac{\pi}{3}、\frac{2\pi}{3}
  function piTeX(n, d) {
    const g = gcd(n, d); n /= g; d /= g; if (d < 0) { n = -n; d = -d; }
    if (n === 0) return '0';
    const sg = n < 0 ? '-' : '', a = Math.abs(n), num = `${a === 1 ? '' : a}\\pi`;
    return d === 1 ? sg + num : `${sg}\\frac{${num}}{${d}}`;
  }
  // 大きい数 × π の分数（\frac{6400}{3}\pi の形。地球の距離）
  function piTeX2(n, d) {
    const g = gcd(n, d); n /= g; d /= g;
    return d === 1 ? `${n === 1 ? '' : n}\\pi` : `\\frac{${n}}{${d}}\\pi`;
  }

  // ---------------------------------------------------------------- 検算の部品（verify）
  // 成分・座標の答え「$(6,\ -3,\ 1)$」を成分に分ける
  function tuple(t) {
    t = strip(t).replace(/\\left|\\right/g, '').trim();
    if (t[0] !== '(' || t[t.length - 1] !== ')') return null;
    t = t.slice(1, -1);
    const out = []; let d = 0, cur = '';
    for (const c of t) {
      if (c === '{' || c === '(') d++;
      if (c === '}' || c === ')') d--;
      if (c === ',' && d === 0) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    out.push(cur);
    return out.map(s => s.replace(/^\s*\\ /, '').trim());
  }
  // 答えの成分が、べつに計算した値 want と同じか
  function tupleOK(ans, want) {
    const c = tuple(ans);
    if (!c || c.length !== want.length) return `成分の数がちがう（${ans}）`;
    for (let i = 0; i < want.length; i++) {
      const v = M.evalMath(c[i], {});
      if (v == null) return `成分が読めない（${c[i]}）`;
      if (!close(v, want[i])) return `${i + 1}番めの成分 ${c[i]} は ${fmt(want[i])} のはず（${ans}）`;
    }
    return true;
  }
  // 平面の式「$x+2y+2z=5$」が、法線 n に垂直で、点 pts をすべて通るか
  function planeOK(ans, n, pts) {
    const t = strip(ans), k = t.indexOf('=');
    if (k < 0) return `平面の式が読めない（${ans}）`;
    const L = t.slice(0, k), d = M.evalMath(t.slice(k + 1), {});
    const f = (x, y, z) => M.evalMath(L, { x, y, z });
    const c0 = f(0, 0, 0);
    if (c0 == null || d == null) return `式が読めない（${ans}）`;
    const co = [f(1, 0, 0) - c0, f(0, 1, 0) - c0, f(0, 0, 1) - c0];
    if (co.every(v => Math.abs(v) < 1e-12)) return `係数がない（${ans}）`;
    if (cross(co, n).some(v => Math.abs(v) > 1e-9)) return `係数 (${co.map(fmt)}) が法線 (${n}) と平行でない`;
    for (const P of pts) if (!close(f(...P) , d)) return `点 (${P.map(fmt)}) が平面 ${t} の上にない`;
    return true;
  }
  // 極座標の答え「$(3\sqrt{2},\ 135^{\circ})$」が点 (x, y) を表すか（角は 0 以上 1周未満）
  function polarOK(ans, x, y, inRad) {
    const c = tuple(ans);
    if (!c || c.length !== 2) return `極座標が読めない（${ans}）`;
    if (inRad === /circ/.test(c[1])) return `角の単位がちがう（${ans}）`;
    const r = M.evalMath(c[0], {}), th = M.evalMath(c[1], {});   // 度は rad として読まれる
    if (r == null || th == null) return `読めない（${ans}）`;
    if (!(th > -1e-9 && th < 2 * Math.PI - 1e-9)) return `角が 0 以上 1周未満でない（${ans}）`;
    if (!close(r * Math.cos(th), x) || !close(r * Math.sin(th), y)) return `(${fmt(x)}, ${fmt(y)}) にならない（${ans}）`;
    return true;
  }
  // 数1つの答えが want と同じか
  function numOK(ans, want) {
    const v = M.evalMath(strip(ans), {});
    if (v == null) return `答えが読めない（${ans}）`;
    return close(v, want) ? true : `答え ${ans} は ${fmt(want)} のはず`;
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 文の中の (…,\ …) の組。数の成分だけのものを n こ組で
  const tuplesIn = q => [...q.matchAll(/\(([^()]*)\)/g)].map(m => m[1].split(',').map(s => s.replace(/^\s*\\ /, '').trim()));
  const numT = (q, n) => tuplesIn(q).filter(c => c.length === n && c.every(x => !/circ|pi/.test(x) && M.evalMath(x, {}) != null));
  const has3 = q => numT(q, 3).length > 0;
  const has2 = q => numT(q, 2).length > 0;

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(4).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 6 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (!also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    p.easyCheck = false;
    return p;
  }

  // 原点からの距離が整数になる組（ピタゴラスの4つ組）
  const QUAD = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9], [6, 6, 7], [3, 4, 12], [2, 10, 11], [8, 9, 12], [2, 4, 4], [3, 6, 6]];
  const TRIP = [[3, 4], [6, 8], [5, 12], [8, 15], [1, 1], [1, 2], [2, 3], [1, 3]];
  const sqTerms = a => a.map(x => `${x * x}`).join('+');

  // わざを足す。verify は、問題の物の答え（this.a）を受けて確かめる（答えを書きかえたら気づくように）
  function add(def) {
    for (const k of Object.keys(def.steps)) {
      const f = def.steps[k];
      def.steps[k] = r => { const p = f(r); if (p && p.verify) { const v = p.verify; p.verify = function () { return v(this.a); }; } return p; };
    }
    M.add(def);
  }

  // ================================================================ 4-79
  // 直方体の見取図（教科書 4-13 と同じ向き：x を手前ななめ、y を右、z を上）。O が見えない角で、O から出る3本の辺は点線
  //  ラベルは、線（辺・軸・太線）とほかのラベルに重ならない向きを、候補の順にさがして置く（R2-8）。
  //  太線（聞く2点）は、見えない面（x=0・y=0・z=0 の面）の上にあれば点線（底面の対角線 AC など）。
  function boxFig(a, b, c, ask) {
    const T = p => M.proj3([p[1], -p[0], p[2]], 0.6, 35);
    const P8 = { O: [0, 0, 0], A: [a, 0, 0], B: [a, b, 0], C: [0, b, 0], D: [0, 0, c], E: [a, 0, c], F: [a, b, c], G: [0, b, c] };
    const P = k => T(P8[k]), ex = 1.4;
    const hidden = [0, 1, 2].some(i => P8[ask[0]][i] === 0 && P8[ask[1]][i] === 0);   // 2点が同じ見えない面の上
    //  [線, 重み]：太線（聞く2点）に重なるのがいちばんいけない。点線と軸は軽く
    const segs = [
      [[P('A'), T([a + ex, 0, 0])], 1], [[P('C'), T([0, b + ex, 0])], 1], [[P('D'), T([0, 0, c + ex])], 1],
      ...['AB', 'BC', 'CG', 'GD', 'DE', 'EA', 'EF', 'FG', 'FB'].map(e => [[P(e[0]), P(e[1])], 2]),
      ...['OA', 'OC', 'OD'].map(e => [[P(e[0]), P(e[1])], 1]),
      [[P(ask[0]), P(ask[1])], 4],
    ];
    const items = [
      ['seg', P('A'), T([a + ex, 0, 0]), { arrow: true }], ['seg', P('C'), T([0, b + ex, 0]), { arrow: true }], ['seg', P('D'), T([0, 0, c + ex]), { arrow: true }],
      ['poly', ['A', 'B', 'C', 'G', 'D', 'E'].map(P)], ['seg', P('E'), P('F')], ['seg', P('F'), P('G')], ['seg', P('F'), P('B')],
      ['seg', P('O'), P('A'), { dash: true }], ['seg', P('O'), P('C'), { dash: true }], ['seg', P('O'), P('D'), { dash: true }],
      ['seg', P(ask[0]), P(ask[1]), hidden ? { thick: true, dash: true } : { thick: true }],
      ['label', T([a + ex, 0, 0]), '$x$', 'sw'], ['label', T([0, b + ex, 0]), '$y$', 'e'], ['label', T([0, 0, c + ex]), '$z$', 'n'],
    ];
    const W0 = b + ex + 0.49 * (a + ex) + 1.8, H0 = c + ex + 0.344 * (a + ex) + 1.8, sc = Math.min(5, 52 / W0, 27 / H0);
    // ラベルの四角（図の単位）。字の大きさ 3.4 mm、1字のはば 0.62 字
    const u = 3.4 / sc, V8 = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.8, 0.8], nw: [-0.8, 0.8], se: [0.8, -0.8], sw: [-0.8, -0.8] };
    //  （アプリの SVG と本の TikZ で字の置き方が少しちがうので、両方をふくむ大きさにする）
    const boxOf = (p, t, d) => { const v = V8[d], w = 0.34 * u * String(t).length, hw = w + 0.06 * u, hh = 0.38 * u; const cx = p[0] + v[0] * (0.45 * u + w), cy = p[1] + v[1] * 0.75 * u; return [cx - hw, cy - hh, cx + hw, cy + hh]; };
    const segHit = (B, [p, q]) => {   // 線分 pq が四角 B を通るか（線分を細かく分けて調べる）
      for (let i = 0; i <= 40; i++) { const t = i / 40, x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t; if (x > B[0] && x < B[2] && y > B[1] && y < B[3]) return true; }
      return false;
    };
    const boxHit = (A, B) => A[0] < B[2] && B[0] < A[2] && A[1] < B[3] && B[1] < A[3];
    const placed = [boxOf(T([a + ex, 0, 0]), 'x', 'sw'), boxOf(T([0, b + ex, 0]), 'y', 'e'), boxOf(T([0, 0, c + ex]), 'z', 'n')];
    const put = (p, t, cands) => {
      let best = cands[0], bad = Infinity;
      for (const d of cands) {
        const B = boxOf(p, t, d), n = segs.reduce((m, [s, wt]) => m + (segHit(B, s) ? wt : 0), 0) + 2 * placed.filter(Q => boxHit(B, Q)).length;
        if (n < bad) { bad = n; best = d; }
        if (!n) break;
      }
      placed.push(boxOf(p, t, best));
      return best;
    };
    // 長さのラベルを先に（辺のまん中）、それから頂点の名前
    const lens = [[mid(P('C'), P('B')), `${a}`, ['se', 'e', 'nw']], [mid(P('A'), P('B')), `${b}`, ['s', 'n']], [mid(P('E'), P('A')), `${c}`, ['w', 'e']]];
    const lenItems = lens.map(([p, t, cs]) => ['label', p, t, put(p, t, cs)]);
    const LC = { F: ['se', 'n', 'ne', 'e', 'nw'], E: ['w', 'nw', 'sw', 'n'], D: ['nw', 'n', 'w', 'ne'], G: ['ne', 'n', 'e', 'nw'], C: ['ne', 'se', 'e', 's', 'n'], B: ['s', 'se', 'sw', 'e'], A: ['se', 's', 'w', 'sw', 'nw'], O: ['ne', 'w', 'se', 'nw', 's', 'sw', 'n', 'e'] };
    for (const k of 'FEDGCBAO') items.push(['dot', P(k)], ['label', P(k), k, put(P(k), k, LC[k])]);
    items.push(['label', T([a + ex + 1.4, 0, 0]), '', 'c'], ['label', T([0, b + ex + 1.1, 0]), '', 'c'], ['label', T([0, 0, c + ex + 0.9]), '', 'c']);   // 見えない点（図のはば）
    items.push(...lenItems);
    return { s: +sc.toFixed(2), items };
  }
  add({
    id: '4-79', part: 6, chap: '4-13③', stars: 1,
    title: '空間の距離は、3つの差を2乗してたす',
    mark: '2点の座標 $(x,\\ y,\\ z)$、直方体の頂点。**3つの差**を2乗してたし、$\\sqrt{\\phantom{2}}$ をとる。',
    futsu: ['床の対角線を、三平方の定理で出す', '$\\sqrt{4^2+2^2}=\\sqrt{20}$', 'それと高さで、もう一度三平方の定理'],
    raku: ['$(1,\\ -2,\\ 3)$ と $(5,\\ 0,\\ 7)$', '差は 4、2、4', '$\\sqrt{16+4+16}=\\sqrt{36}=6$'],
    why: '床の対角線の2乗 $4^2+2^2$ を、高さの三平方の定理にそのまま入れると、$4^2+2^2+4^2$ になる。途中の $\\sqrt{20}$ は出さなくてよい（4-13③）。2乗するので、ひく順番を逆にしても答えは同じ。',
    caution: '平面の式のくせで、$z$ の差を入れわすれない。見取図の長さは目で読まずに、座標で読む。',
    counts: { s1: 8, s2: 3, s3: 2, trap: 2 },
    cols: { s2: 1, s3: 1 },
    boxw: '16mm',
    fits(q) { return /距離/.test(q) && (has3(q) || /直方体/.test(q)) && !/軸と|軸の距離|平面|床|円柱|球座標|大円|北緯|南緯|地球|トンネル/.test(q); },
    steps: {
      // 原点からの距離（ほとんどは整数になる4つ組）
      s1(r) {
        let a;
        if (r.chance(0.75)) a = sgn(r, perm(r, r.pick(QUAD)));
        else { a = [r.int(-4, 5), r.int(-4, 5), r.int(-4, 5)]; if (a.filter(Boolean).length < 2) return null; }
        const N = dot(a, a), R = rootTeX(N);
        return {
          q: `原点Oと点P$${V(...a)}$ の距離`, a: `$${R}$`, key: 'o' + a.map(Math.abs).sort().join(','),
          easy: `$\\sqrt{${sqTerms(a)}}=\\sqrt{${N}}${R === `\\sqrt{${N}}` ? '' : '=' + R}$`,
        };
      },
      // 2点の距離（差を出してから。マイナスの座標をふくむ）
      s2(r) {
        let d;
        if (r.chance(0.75)) d = sgn(r, perm(r, r.pick(QUAD.slice(0, 9))));
        else { d = [r.int(-4, 4), r.int(-4, 4), r.int(1, 4)]; if (d.filter(Boolean).length < 3) return null; }
        const A = [r.int(-3, 5), r.int(-3, 5), r.int(-3, 5)], B = A.map((x, i) => x + d[i]);
        if (A.every(x => x >= 0) && B.every(x => x >= 0) && r.chance(0.6)) return null;   // マイナスをふくむものを多く
        const N = dot(d, d), R = rootTeX(N);
        return {
          q: `2点A$${V(...A)}$、B$${V(...B)}$ の距離`, a: `$${R}$`,
          easy: `差は ${d.map(Math.abs).join('、')}。$\\sqrt{${sqTerms(d)}}=\\sqrt{${N}}${R === `\\sqrt{${N}}` ? '' : '=' + R}$`,
          verify: (ans) => numOK(ans, Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2])),
        };
      },
      // 図：直方体の見取図（教科書 4-13 の例題1と同じ名前）。頂点の座標を読んでから距離
      s3(r) {
        let a, b, c;
        if (r.chance(0.7)) {
          const u = r.pick([[2, 3, 6], [2, 4, 4], [4, 4, 7], [3, 6, 6]]);
          [c, a] = u.slice(0, 2); b = u[2];   // 長い辺を y（横）に、短い辺を z（高さ）に
        } else { a = r.int(2, 4); b = r.int(3, 6); c = r.int(2, 3); }
        const P8 = { O: [0, 0, 0], A: [a, 0, 0], B: [a, b, 0], C: [0, b, 0], D: [0, 0, c], E: [a, 0, c], F: [a, b, c], G: [0, b, c] };
        const ask = r.chance(0.7) ? r.pick([['O', 'F'], ['A', 'G'], ['B', 'D'], ['C', 'E']]) : r.pick([['A', 'C'], ['O', 'E'], ['O', 'G'], ['C', 'F'], ['D', 'B']]);
        const d = sub(P8[ask[1]], P8[ask[0]]), N = dot(d, d), R = rootTeX(N);
        return {
          q: `図の直方体（$\\mathrm{OA}=${a}$、$\\mathrm{OC}=${b}$、$\\mathrm{OD}=${c}$）の、${ask[0]}と${ask[1]}の距離`, a: `$${R}$`,
          easy: `${ask[0]}$${V(...P8[ask[0]])}$、${ask[1]}$${V(...P8[ask[1]])}$。$\\sqrt{${sqTerms(d)}}=\\sqrt{${N}}${R === `\\sqrt{${N}}` ? '' : '=' + R}$`,
          verify: (ans) => numOK(ans, Math.hypot(...d)),
          fig: boxFig(a, b, c, ask),
        };
      },
      // わな：z 軸からの距離・床からの高さ（3つの差を全部は使わない）
      trap(r) {
        if (r.chance(0.6)) {
          const t = r.pick(TRIP), [x, y] = sgn(r, r.shuffle(t.slice())), z = r.pick([2, 5, 6, 7, 9, 12]) * (r.chance(0.3) ? -1 : 1);
          const N = x * x + y * y, R = rootTeX(N);
          return dest({ q: `点P$${V(x, y, z)}$ と $z$ 軸の距離`, a: `$${R}$`, verify: (ans) => numOK(ans, Math.hypot(x, y)) }, '4-79',
            `$z$ 軸からの距離は、床の上の $\\sqrt{${x * x}+${y * y}}$ だけ。$z$ は入れない。床の上の2点の距離として、わざ 4-25 で`);
        }
        const p = sgn(r, [r.int(1, 6), r.int(1, 6), r.int(2, 9)]);
        return dest({ q: `点P$${V(...p)}$ と床（$xy$ 平面）の距離`, a: `$${Math.abs(p[2])}$`, verify: (ans) => numOK(ans, Math.abs(p[2])) }, '4-79',
          '楽な形なし。床からの距離は高さ $z$ の大きさだけ。2乗してたさなくてよい');
      },
    },
  });

  // ================================================================ 4-80
  // なす角が 30°・45°・60°・90°… になる組（成分が -2〜2 の整数のベクトル）
  const NICE = (() => {
    const vs = [];
    for (let x = -2; x <= 2; x++) for (let y = -2; y <= 2; y++) for (let z = -2; z <= 2; z++) if ([x, y, z].filter(Boolean).length >= 2) vs.push([x, y, z]);
    const by = {};
    for (const u of vs) for (const v of vs) {
      const d = dot(u, v), P = dot(u, u) * dot(v, v), d2 = d * d;
      let ang = null;
      if (d === 0) ang = 90; else if (4 * d2 === P) ang = d > 0 ? 60 : 120; else if (2 * d2 === P) ang = d > 0 ? 45 : 135; else if (4 * d2 === 3 * P) ang = d > 0 ? 30 : 150;
      if (ang != null) (by[ang] = by[ang] || []).push([u, v]);
    }
    return by;
  })();
  const dotTerms = (a, b) => a.map((x, i) => `${par(x)}\\times${par(b[i])}`).join('+');
  add({
    id: '4-80', part: 6, chap: '4-13⑤', stars: 1,
    title: '空間の内積は $x$・$y$・$z$ の積の和（直交なら0）',
    mark: '3つの成分のベクトルの、**なす角**・**直交**・**仕事**。$x$ どうし・$y$ どうし・$z$ どうしをかけてたす。',
    futsu: ['図をかいて、なす角 $\\theta$ をさがす', '$\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert\\cos\\theta$ を', '計算する'],
    raku: ['$(1,\\ 1,\\ 0)\\cdot(0,\\ 1,\\ 1)=0+1+0=1$', '大きさは $\\sqrt{2}$ ずつ', '$\\cos\\theta=\\frac{1}{2}$ で $60^{\\circ}$'],
    why: '2本の矢印は、根もとをそろえると1枚の平面にのる。その平面の余弦定理から、平面のときと同じく $\\vec{a}\\cdot\\vec{b}=a_xb_x+a_yb_y+a_zb_z$ が出る。$z$ どうしの積が1つふえただけ（4-13⑤）。',
    caution: '内積の答えはふつうの数（ベクトルではない）。$\\times$（外積）と $\\cdot$（内積）を取りちがえない。',
    counts: { s1: 8, s2: 4, s3: 4, trap: 2 },
    cols: { s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '14mm', s3: '14mm', trap: '20mm' },
    fits(q) { return has3(q) && /\\cdot|内積|直交|なす角|仕事/.test(q) && !/\\times|軸のなす角|単位ベクトル|面積|トルク/.test(q); },
    steps: {
      // 内積の計算（3こに1こは直交）
      s1(r) {
        const a = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)];
        if (a.filter(Boolean).length < 2) return null;
        let b;
        if (r.chance(0.35)) {
          const c = [];
          for (let x = -3; x <= 3; x++) for (let y = -3; y <= 3; y++) for (let z = -3; z <= 3; z++) if (dot(a, [x, y, z]) === 0 && [x, y, z].filter(Boolean).length >= 2) c.push([x, y, z]);
          if (!c.length) return null;
          b = r.pick(c);
        } else { b = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]; if (b.filter(Boolean).length < 2) return null; }
        const v = dot(a, b);
        return { q: `$${V(...a)}\\cdot${V(...b)}$`, a: `$${v}$`, easy: `$${dotTerms(a, b)}=${v}$`, key: 'd' + [a.join(','), b.join(',')].sort().join('/') };
      },
      // なす角（cos がきれいな値）と、直交する k
      s2(r) {
        if (r.chance(0.6)) {
          const ang = r.pick([60, 120, 45, 135, 90, 60, 30, 150].filter(x => NICE[x])), [u, v] = r.pick(NICE[ang]);
          const nu = dot(u, u), nv = dot(v, v), d = dot(u, v), c = S(d, nu * nv, nu * nv);
          return {
            q: `$\\vec{a}=${V(...u)}$、$\\vec{b}=${V(...v)}$ のなす角`, a: `$${D(ang)}$`, easyCheck: false,
            easy: `内積 $${d}$、大きさ $${rootTeX(nu)}$ と $${rootTeX(nv)}$。$\\cos\\theta=${Stex(c)}$ で $${D(ang)}$`,
            verify: (ans) => numOK(ans, Math.acos(d / Math.sqrt(nu * nv))),
          };
        }
        const b = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)], j = r.int(0, 2);
        if (Math.abs(b[j]) !== 1 && Math.abs(b[j]) !== 2) return null;
        const a = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
        const rest = dot(a, b) - a[j] * b[j];
        if (rest % b[j]) return null;
        const k = -rest / b[j];
        if (Math.abs(k) > 9) return null;
        const at = a.map((x, i) => (i === j ? 'k' : x));
        return {
          q: `$${V(...at)}$ と $${V(...b)}$ が直交するときの $k$`, a: `$${k}$`, easyCheck: 'last',
          easy: `内積 $=0$：$${at.map((x, i) => `${x === 'k' ? 'k' : par(x)}\\times${par(b[i])}`).join('+')}=0$ から $${k}$`,
          verify: (ans) => { const kk = M.evalMath(strip(ans), {}); return kk != null && dot(a.map((x, i) => (i === j ? kk : x)), b) === 0 ? true : '内積が0にならない'; },
        };
      },
      // 場面：仕事（ドローン、教科書 4-13 の例題）、重力の仕事、直交の判定
      s3(r) {
        const s = [r.int(0, 6) * 2, r.int(-3, 4), r.int(1, 6)];
        const k = r.int(0, 2);
        if (k === 0) {
          const F = [r.int(-3, 6), r.int(-3, 5), r.pick([10, 15, 20, 25, 30])], W = dot(F, s);
          return { q: `ドローンが荷物を引く力は $\\vec{F}=${V(...F)}$（N）で、荷物は $\\vec{s}=${V(...s)}$（m）動いた。力がした仕事（J）`, a: `$${W}$`, easy: `$${dotTerms(F, s)}=${W}$` };
        }
        if (k === 1) {
          const g = r.pick([10, 20, 30, 40, 50]), W = -g * s[2];
          return { q: `荷物が $\\vec{s}=${V(...s)}$（m）動いた。真下向きに $${g}\\,\\mathrm{N}$ の重力がした仕事（J）`, a: `$${W}$`, easyCheck: 'last', easy: `重力は $${V(0, 0, -g)}$。$${par(-g)}\\times${s[2]}=${W}$` };
        }
        const a = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)], b = [r.int(-3, 5), r.int(-3, 5), r.int(-3, 5)];
        if (a.filter(Boolean).length < 3 || b.filter(Boolean).length < 2) return null;
        const v = dot(a, b);
        if (Math.abs(v) > 3) return null;   // 0 のものと、0 に近いもの
        const ans = v === 0 ? 'する' : 'しない';
        return {
          q: `$\\vec{p}=${V(...a)}$ と $\\vec{q}=${V(...b)}$ は、直交 □（する・しない）`, a: ans, easyCheck: false,
          easy: `内積 $${dotTerms(a, b)}=${v}$${v === 0 ? ' なので直交する' : ' で0でないので直交しない'}`,
          verify: (ans) => ((Math.abs(Math.acos(v / Math.sqrt(dot(a, a) * dot(b, b))) - Math.PI / 2) < 1e-9) === (ans === 'する') ? true : '直交の判定がちがう'),
        };
      },
      // わな：平行四辺形の面積（外積の大きさ）、平行になる k（内積0ではない）
      trap(r) {
        if (r.chance(0.5)) {
          const a = [r.int(0, 3), r.int(1, 3), 0], b = [0, r.int(1, 3), r.int(1, 3)];
          const c = cross(a, b), N = dot(c, c), R = rootTeX(N);
          return dest({ q: `$\\vec{a}=${V(...a)}$、$\\vec{b}=${V(...b)}$ がつくる平行四辺形の面積`, a: `$${R}$`, verify: (ans) => numOK(ans, Math.sqrt(dot(a, a) * dot(b, b) - dot(a, b) ** 2)) }, '4-80',
            '内積ではなく、外積の大きさ');
        }
        const a = [r.int(1, 3), r.int(1, 4), r.int(-3, 3)], m = r.pick([2, 3, -2]), j = r.int(0, 2), k = a[j] * m;
        const bt = a.map((x, i) => (i === j ? 'k' : x * m));
        return dest({ q: `$${V(...a)}$ と $${V(...bt)}$ が平行になるときの $k$`, a: `$${k}$`, verify: (ans) => { const kk = M.evalMath(strip(ans), {}), b = a.map((x, i) => (i === j ? kk : x * m)); return kk != null && cross(a, b).every(v => Math.abs(v) < 1e-9) ? true : '平行でない'; } }, '4-80',
          `平行は内積0ではない。ほかの成分が ${m} 倍なので、$k=${par(a[j])}\\times${par(m)}=${k}$。実数倍は成分ごと（わざ 4-68）で`);
      },
    },
  });

  // ================================================================ 4-81
  // 軸とのなす角がきれいな値になるベクトル（成分に √ をふくむ）
  const AXV = [[S(1), S(1), S(1, 1, 2)], [S(1, 1, 3), S(0), S(1)], [S(1), S(1), S(0)], [S(1), S(1, 1, 3), S(0)], [S(1, 1, 2), S(1, 1, 2), S(0)], [S(1, 1, 3), S(1), S(0)]];
  const AX = ['x', 'y', 'z'];
  add({
    id: '4-81', part: 6, chap: '4-13⑥', stars: 1,
    title: '単位ベクトルの成分は、軸とのなす角の cos',
    mark: '「□軸とのなす角の cos」「同じ向きの**単位ベクトル**」。大きさでわった成分が、そのまま cos。',
    futsu: ['$z$ 軸の向きの $\\vec{k}=(0,\\ 0,\\ 1)$ との', '内積と大きさを計算して、', '$\\cos\\theta_z=\\frac{\\vec{a}\\cdot\\vec{k}}{\\lvert\\vec{a}\\rvert\\lvert\\vec{k}\\rvert}$'],
    raku: ['$\\vec{a}=(2,\\ 3,\\ 6)$、大きさ7', '$\\vec{e}=\\left(\\frac{2}{7},\\ \\frac{3}{7},\\ \\frac{6}{7}\\right)$', '$\\cos\\theta_z=\\frac{6}{7}$（$z$ 成分を見るだけ）'],
    why: '$\\vec{a}$ と $\\vec{k}$ の内積は $a_z$、$\\vec{k}$ の大きさは1。だから $\\cos\\theta_z=\\frac{a_z}{\\lvert\\vec{a}\\rvert}$ で、単位ベクトルの $z$ 成分と同じになる（方向余弦。4-13⑥）。',
    caution: '成分は角の cos の値で、角度そのものではない（$\\frac{6}{7}$ 度ではない）。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '14mm', s3: '16mm', trap: '28mm' },
    boxh: { s1: '12mm', s2: '12mm', s3: '12mm' },
    fits(q) { return /単位ベクトル|軸のなす角|真上のなす角|方向余弦/.test(q); },
    steps: {
      // 同じ向きの単位ベクトル
      s1(r) {
        const a = r.chance(0.8) ? sgn(r, perm(r, r.pick(QUAD.slice(0, 9)))) : sgn(r, perm(r, r.pick(TRIP.slice(0, 4)).concat([0])));
        const n = Math.round(Math.sqrt(dot(a, a))), e = a.map(x => Stex(S(x, n)));
        const ans = `$\\left${V(...e)}\\right$`.replace(/\)\\right\$$/, '\\right)$');
        return {
          q: `$\\vec{a}=${V(...a)}$ と同じ向きの単位ベクトル`, a: ans, easyCheck: false,
          easy: `大きさ $\\sqrt{${sqTerms(a)}}=${n}$ で、成分を ${n} でわる`,
          verify: (ans) => tupleOK(ans, a.map(x => x / Math.hypot(...a))),
        };
      },
      // 軸とのなす角の cos
      s2(r) {
        const a = sgn(r, perm(r, r.pick(QUAD.slice(0, 9)))), j = r.int(0, 2), n = Math.round(Math.sqrt(dot(a, a))), c = Stex(S(a[j], n));
        return {
          q: `$\\vec{a}=${V(...a)}$ と $${AX[j]}$ 軸のなす角 $\\theta_${AX[j]}$ の $\\cos\\theta_${AX[j]}$`, a: `$${c}$`, easyCheck: 'last',
          easy: `大きさ $${n}$。$${AX[j]}$ 成分を ${n} でわって $${c}$`,
          verify: (ans) => numOK(ans, dot(a, [0, 1, 2].map(i => (i === j ? 1 : 0))) / Math.hypot(...a)),
        };
      },
      // 軸とのなす角（cos がきれいな値）。場面：ドローンの動いた向き
      s3(r) {
        if (r.chance(0.7)) {
          const k = r.pick([1, 1, 2, 3]), base = r.shuffle(r.pick(AXV).map(x => Smul(x, S(k)))).map(x => (r.chance(0.35) ? Smul(x, S(-1)) : x));
          const vals = base.map(Sval), L = Math.hypot(...vals);
          const js = [0, 1, 2].filter(i => { const c = vals[i] / L; return [0, 0.5, Math.SQRT1_2, Math.sqrt(3) / 2].some(t => close(Math.abs(c), t)); });
          const j = r.pick(js), ang = Math.round(Math.acos(vals[j] / L) * 180 / Math.PI);
          const n = Math.round(L * L);
          return {
            q: `$\\vec{a}=${V(...base.map(Stex))}$ と $${AX[j]}$ 軸のなす角`, a: `$${D(ang)}$`, easyCheck: false,
            easy: `大きさ $\\sqrt{${n}}=${rootTeX(n)}$。$\\cos\\theta_${AX[j]}=${Stex(Smul(base[j], S(1, 1, n), S(1, n)))}$ で $${D(ang)}$`,
            verify: (ans) => numOK(ans, Math.acos(vals[j] / L)),
          };
        }
        const a = sgn(r, perm(r, r.pick(QUAD.slice(0, 6)))), n = Math.round(Math.sqrt(dot(a, a))), e = a.map(x => Stex(S(x, n)));
        const cz = Stex(S(a[2], n));
        return {
          q: `東・北・上を $x$・$y$・$z$ の＋の向きとする。ドローンが${a.map((x, i) => (x ? `${[['東', '西'], ['北', '南'], ['上', '下']][i][x > 0 ? 0 : 1]}へ $${Math.abs(x)}\\,\\mathrm{m}$` : '')).filter(Boolean).join('、')}動いた。動いた向きと真上のなす角を $\\theta$ とするときの $\\cos\\theta$`,
          a: `$${cz}$`, easyCheck: 'last', easy: `$${V(...a)}$ の大きさ $${n}$。$z$ 成分を ${n} でわって $${cz}$`, verify: (ans) => numOK(ans, a[2] / Math.hypot(...a)),
        };
      },
      // わな：大きさが k 倍のベクトル（単位ベクトルを作らなくてよい）、2本のベクトルのなす角
      trap(r) {
        if (r.chance(0.5)) {
          const a = sgn(r, perm(r, r.pick(QUAD.slice(0, 6)))), n = Math.round(Math.sqrt(dot(a, a))), m = r.pick([2, 3]);
          const ans = `$${V(...a.map(x => x * m))}$`;
          return dest({ q: `$\\vec{a}=${V(...a)}$ と同じ向きで、大きさが $${n * m}$ のベクトル`, a: ans, verify: (ans) => tupleOK(ans, a.map(x => x / Math.hypot(...a) * n * m)) }, '4-81',
            `大きさ ${n} の ${m} 倍なので、成分を ${m} 倍するだけ。単位ベクトルを作らなくてよい。実数倍は成分ごと（わざ 4-68）で`);
        }
        const [u, v] = r.pick(NICE[90].filter(([a, b]) => a.every(Boolean) && b.filter(Boolean).length >= 2));
        return dest({ q: `$\\vec{a}=${V(...u)}$ と $\\vec{b}=${V(...v)}$ のなす角`, a: `$${D(90)}$`, verify: (ans) => numOK(ans, Math.acos(dot(u, v) / Math.sqrt(dot(u, u) * dot(v, v)))) }, '4-81',
          '軸ではなく2本のベクトルのなす角。内積で：$' + dotTerms(u, v) + '=0$');
      },
    },
  });

  // ================================================================ 4-82
  function planeTeX(n, d) {
    let s = '';
    n.forEach((c, i) => { if (!c) return; s += (c < 0 ? '-' : (s ? '+' : '')) + (Math.abs(c) === 1 ? '' : Math.abs(c)) + AX[i]; });
    return `${s}=${d}`;
  }
  add({
    id: '4-82', part: 6, chap: '4-13⑦', stars: 1,
    title: '法線 $\\vec{n}=(a,\\ b,\\ c)$ の平面は、$ax+by+cz=$（$\\vec{n}$ と通る点の内積）',
    mark: '通る点と、平面に垂直なベクトル（**法線ベクトル**）。$x$・$y$・$z$ の前の数は法線の成分、右辺は通る点を入れた値。',
    futsu: ['$(x-1)+2(y-1)+2(z-1)=0$', '$x-1+2y-2+2z-2=0$', '$x+2y+2z=5$'],
    raku: ['左辺は法線から：$x+2y+2z$', '右辺は点 $(1,\\ 1,\\ 1)$ を入れて', '$1+2+2=5$ → $x+2y+2z=5$'],
    why: '$\\vec{n}\\cdot\\overrightarrow{\\mathrm{P_0P}}=0$ を展開すると、左辺は $\\vec{n}$ と $(x,\\ y,\\ z)$ の内積、右辺は $\\vec{n}$ と通る点の内積になる。だから、かっこを展開しなくても書ける（4-13⑦）。',
    caution: '法線の成分は $x$・$y$・$z$ の前の数で、通る点の座標ではない。右辺は、通る点を左辺に入れて決める。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    boxh: { trap: '12mm' },
    fits(q) { if (/3点/.test(q)) return false; return /平面の式|平面$/.test(q) || (/法線/.test(q) && /平面/.test(q)) || (/平面/.test(q) && /上にある/.test(q)); },   // 3点だけ（法線がない）は外積が先（4-85）
    steps: {
      // 法線と通る点から（成分はプラスか0）
      s1(r) {
        const n = [r.int(1, 3), r.int(0, 3), r.int(1, 3)], P = [r.int(0, 3), r.int(0, 3), r.int(1, 3)];
        const d = dot(n, P), ans = `$${planeTeX(n, d)}$`;
        return {
          q: `$${V(...P)}$ を通り、法線 $\\vec{n}=${V(...n)}$ の平面`, a: ans, easyCheck: false,
          easy: `右辺は $${dotTerms(n, P)}=${d}$`, verify: (ans) => planeOK(ans, n, [P]),
        };
      },
      // マイナスの成分、法線を答える、平面の上の点の座標
      s2(r) {
        const n = [r.int(1, 4)].concat(sgn(r, [r.int(1, 3), r.int(1, 3)])), P = [r.int(-3, 3), r.int(-3, 3), r.int(-2, 3)];
        const d = dot(n, P), k = r.int(0, 3);
        if (k <= 1) {
          if (n.every(x => x > 0) && P.every(x => x >= 0)) return null;
          const ans = `$${planeTeX(n, d)}$`;
          return { q: `$${V(...P)}$ を通り、法線 $\\vec{n}=${V(...n)}$ の平面`, a: ans, easyCheck: false, easy: `右辺は $${dotTerms(n, P)}=${d}$`, verify: (ans) => planeOK(ans, n, [P]) };
        }
        if (k === 2) {
          const ans = `$${V(...n)}$`;
          return {
            q: `平面 $${planeTeX(n, d)}$ の法線ベクトルを1つ`, a: ans, easyCheck: false, easy: '$x$・$y$・$z$ の前の数をならべる（何倍してもよい）',
            verify: (ans) => { const c = tuple(ans).map(t => M.evalMath(t, {})); return planeOK(`$${planeTeX(n, d)}$`, c, [P]); },
          };
        }
        // 点 (p, q, □) が平面の上にあるときの □
        const j = n.findIndex(x => Math.abs(x) === 1);
        if (j < 0) return null;
        const Pt = P.map((x, i) => (i === j ? 'c' : x)), c = P[j];
        return {
          q: `点 $${V(...Pt)}$ が平面 $${planeTeX(n, d)}$ の上にある。$c$`, a: `$${c}$`, easyCheck: false,
          easy: `点を式に入れて、$${AX[j]}$ のところを $c$ にして解く`,
          verify: (ans) => numOK(ans, (d - dot(n, P.map((x, i) => (i === j ? 0 : x)))) / n[j]),
        };
      },
      // 場面：2点を結ぶ線分に垂直、OP に垂直、床に平行
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const A = [r.int(-2, 3), r.int(-2, 3), r.int(0, 3)], B = A.map(x => x + r.int(-3, 3));
          const AB = sub(B, A), n = AB.find(Boolean) < 0 ? AB.map(x => -x) : AB;
          if (n.filter(Boolean).length < 2) return null;
          const d = dot(n, A), ans = `$${planeTeX(n, d)}$`;
          return { q: `A$${V(...A)}$、B$${V(...B)}$ で、Aを通り直線ABに垂直な平面`, a: ans, easyCheck: false, easy: `法線は $\\overrightarrow{\\mathrm{AB}}=${V(...AB)}$${n === AB ? '' : `（$-1$ 倍して $${V(...n)}$）`}。右辺はAを入れて $${d}$`, verify: (ans) => planeOK(ans, sub(B, A), [A]) };
        }
        if (k === 1) {
          const P = sgn(r, perm(r, r.pick(QUAD.slice(0, 4)))), d = dot(P, P), ans = `$${planeTeX(P, d)}$`;
          return { q: `原点OとP$${V(...P)}$ で、Pを通り直線OPに垂直な平面`, a: ans, easyCheck: false, easy: `法線は $\\overrightarrow{\\mathrm{OP}}=${V(...P)}$。右辺は $${d}$（$\\mathrm{OP}^2$）`, verify: (ans) => planeOK(ans, P, [P]) };
        }
        const j = r.int(0, 2), P = [r.int(-3, 4), r.int(-3, 4), r.int(1, 5)], name = ['$yz$ 平面', '$xz$ 平面', '床（$xy$ 平面）'][j];
        const n = [0, 1, 2].map(i => (i === j ? 1 : 0)), ans = `$${planeTeX(n, P[j])}$`;
        return { q: `$${V(...P)}$ を通り、${name}に平行な平面`, a: ans, easyCheck: false, easy: `法線は $${['\\vec{i}', '\\vec{j}', '\\vec{k}'][j]}$ の向き。$${AX[j]}$ がいつも $${P[j]}$`, verify: (ans) => planeOK(ans, n, [P]) };
      },
      // わな：3点を通る平面（法線がまだない。外積で作る）、原点からの距離
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.pick([1, 2, 3, 4, 6]), b = r.pick([1, 2, 3, 4, 6]), c = r.pick([1, 2, 3, 6]);
          if (a === b && b === c) return null;
          let n = [b * c, a * c, a * b], d = a * b * c; const g = gcd(gcd(n[0], n[1]), gcd(n[2], d)); n = n.map(x => x / g); d /= g;
          const ans = `$${planeTeX(n, d)}$`;
          return dest({ q: `3点A$${V(a, 0, 0)}$、B$${V(0, b, 0)}$、C$${V(0, 0, c)}$ を通る平面`, a: ans, verify: (ans) => planeOK(ans, cross([-a, b, 0], [-a, 0, c]), [[a, 0, 0], [0, b, 0], [0, 0, c]]) }, '4-82',
            '法線ベクトルが書いていない。$\\overrightarrow{\\mathrm{AB}}\\times\\overrightarrow{\\mathrm{AC}}$ で法線を作ってから', ['4-85']);
        }
        const n = r.pick([[1, 2, 2], [2, 1, 2], [2, 2, 1], [2, -1, 2], [1, -2, 2]]), d = 3 * r.int(1, 4) + r.pick([0, 0, 1]);
        const ans = `$${Stex(S(d, 3))}$`;
        return dest({ q: `平面 $${planeTeX(n, d)}$ と原点の距離`, a: ans, verify: (ans) => numOK(ans, Math.abs(d) / Math.hypot(...n)) }, '4-82',
          `平面の式を作る問題ではない。平面の上の点の、法線の単位ベクトル $\\frac{1}{3}${V(...n)}$ の向きの成分（正射影）なので、右辺を法線の大きさ3でわる：$${d % 3 ? `\\frac{${d}}{3}` : `${d}\\div3=${d / 3}`}$。わざ 4-78 で`);
      },
    },
  });

  // ================================================================ 4-83
  // 図：シーソー（支点の三角形・下向きの力・長さのラベル）。長さは数から計算した比で描く
  function seesawFig(L1, W1, L2, W2, lab2) {
    const k = 10 / (L1 + L2), x1 = -L1 * k, x2 = L2 * k, t = 0.45;
    return {
      s: 5, items: [
        ['seg', [x1 - 0.4, 0], [x2 + 0.4, 0], { thick: true }],
        ['poly', [[0, -0.05], [-t, -0.8], [t, -0.8]]], ['label', [0, -0.8], 'O', 's'],
        ['seg', [x1, 0], [x1, -1.7], { arrow: true }], ['seg', [x2, 0], [x2, -1.7], { arrow: true }],
        ['label', [x1, -1.7], `$${W1}\\,\\mathrm{N}$`, 's'], ['label', [x2, -1.7], lab2.w, 's'],
        ['label', [x1 / 2, 0], `$${fmt(L1)}\\,\\mathrm{m}$`, 'n'], ['label', [x2 / 2, 0], lab2.l, 'n'],
      ],
    };
  }
  // 図：うでの先にななめの力（うでの延長は点線、なす角のしるし）
  function armFig(r, F, th) {
    const L = 6, P = [L, 0], f = 3.2, E = [L + 2.6, 0], Q = [L + f * Math.cos(rad(th)), f * Math.sin(rad(th))];
    const fd = th < 60 ? 'e' : th <= 120 ? 'n' : 'nw';
    return {
      s: 4.2, items: [
        ['seg', [0, 0], P, { thick: true }], ['dot', [0, 0]], ['label', [0, 0], 'O', 'w'], ['seg', P, E, { dash: true }],
        ['seg', P, Q, { arrow: true }], ['angle', E, P, Q, '', 1.4], ['label', [L + 2.4 * Math.cos(rad(th / 2)), 2.4 * Math.sin(rad(th / 2))], `$${D(th)}$`, 'c'],
        ['label', [L / 2, 0], `$${fmt(r)}\\,\\mathrm{m}$`, 's'], ['label', Q, `$${F}\\,\\mathrm{N}$`, fd],
        ['label', [-1.4, -1.1], '', 'c'], ['label', [Math.max(Q[0], E[0]) + (fd === 'e' ? 2.6 : 0.8), Q[1]], '', 'c'],   // 見えない点（図のはば）
      ],
    };
  }
  // 図：ドア（上から見た図）。面に垂直な向き（点線）から al° かたむけた力
  function doorFig(r, F, al) {
    const L = 6, P = [L, 0], f = 3.2, Nn = [L, 2.8], Q = [L + f * Math.sin(rad(al)), f * Math.cos(rad(al))];
    return {
      s: 4.2, items: [
        ['seg', [0, 0], P, { thick: true }], ['dot', [0, 0]], ['label', [0, 0], 'O', 'w'], ['seg', P, Nn, { dash: true }], ['right', [0, 0], P, Nn, 0.45],
        ['seg', P, Q, { arrow: true }], ['angle', Nn, P, Q, '', 1.4], ['label', [L + 2.4 * Math.cos(rad(90 - al / 2)), 2.4 * Math.sin(rad(90 - al / 2))], `$${D(al)}$`, 'c'],
        ['label', [L / 2, 0], `$${fmt(r)}\\,\\mathrm{m}$`, 's'], ['label', Q, `$${F}\\,\\mathrm{N}$`, 'e'],
        ['label', [-1.4, -1.1], '', 'c'], ['label', [Q[0] + 2.6, Q[1]], '', 'c'],   // 見えない点（図のはば）
      ],
    };
  }
  const R10 = [2, 3, 4, 5, 6, 8, 10, 12, 15], FS = [10, 20, 30, 40, 50, 60, 80, 100, 120];
  // うで r（m）・力 F・角 th の M を根号の数で
  const moment = (r10, F, th) => Smul(S(r10 * F, 10), sinS(th));
  add({
    id: '4-83', part: 6, chap: '4-14①②', stars: 1,
    title: '力のモーメントは、うでに直角な部分：$M=rF\\sin\\theta$',
    mark: '**うでの長さ**・力・**なす角**、シーソーのつり合い。回すのは、うでに直角な部分 $F\\sin\\theta$ だけ。単位は N·m。',
    futsu: ['力を図の上で、うでにそった部分と', '直角な部分に分けて、長さをはかり、', '直角な部分×うでの長さ'],
    raku: ['0.3 m、50 N、なす角 $30^{\\circ}$', '$0.3\\times50\\times\\sin30^{\\circ}$', '$=0.3\\times50\\times\\frac{1}{2}=7.5$（N·m）'],
    why: 'うでにそった部分 $F\\cos\\theta$ は中心を引くだけで回さない。直角な部分 $F\\sin\\theta$ だけが回すので、$M=r\\times F\\sin\\theta$。つり合いは「左回り＝右回り」（4-14①②）。',
    caution: '$rF\\cos\\theta$ にしない。$\\theta=0^{\\circ}$（中心に向かって押す）で回らないことから、sin とわかる。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },   // 単位 N·m を足して1問が3行になったので s1 を6問に（第36回）
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: '18mm',
    fits(q) { return /うで|スパナ|シーソー|レンチ|棒|ドア|支点/.test(q) && !has2(q) && !has3(q) && !/x=|クレーン|座標/.test(q); },
    steps: {
      // うで・力・なす角（30°・150°・90° は分数、45°・60° は √ が残る）
      s1(r) {
        const th = r.pick([30, 30, 150, 90, 45, 60, 120, 135]), r10 = r.pick(R10), F = r.pick(FS);
        if (th % 90 && th % 30 === 0 && th !== 30 && th !== 150 && (r10 * F) % 20) return null;   // 60°・120° は rF/2 が整数に
        if (th % 45 === 0 && th % 90 && (r10 * F) % 20) return null;
        const Mv = moment(r10, F, th), ans = `$${Stex(Mv)}$`;
        return {
          q: `うで $${fmt(r10 / 10)}\\,\\mathrm{m}$、力 $${F}\\,\\mathrm{N}$、なす角 $${D(th)}$ のモーメントは □ $\\mathrm{N\\cdot m}$`, a: ans,
          easy: `$${fmt(r10 / 10)}\\times${F}\\times\\sin${D(th)}=${Stex(Mv)}$`,
        };
      },
      // シーソーのつり合い（右の長さ、または右の重さを求める）
      s2(r) {
        const W1 = r.pick([200, 240, 300, 350, 360, 400, 450, 500]), L1 = r.int(5, 20) / 10, W2 = r.pick([200, 250, 300, 360, 400, 480, 500, 600].filter(w => w !== W1));
        const L2 = W1 * L1 / W2;
        if (Math.abs(L2 * 100 - Math.round(L2 * 100)) > 1e-9 || L2 < 0.4 || L2 > 2.5) return null;
        if (r.chance(0.65)) {
          return { q: `支点の左 $${fmt(L1)}\\,\\mathrm{m}$ に $${W1}\\,\\mathrm{N}$、右 □ m に $${W2}\\,\\mathrm{N}$ でつり合う`, a: `$${fmt(L2)}$`, easy: `$\\frac{${W1}\\times${fmt(L1)}}{${W2}}=${fmt(L2)}$` };
        }
        return { q: `支点の左 $${fmt(L1)}\\,\\mathrm{m}$ に $${W1}\\,\\mathrm{N}$、右 $${fmt(L2)}\\,\\mathrm{m}$ に □ N でつり合う`, a: `$${W2}$`, easy: `$\\frac{${W1}\\times${fmt(L1)}}{${fmt(L2)}}=${W2}$` };
      },
      // 図：シーソー、ななめに引く棒、ドア（面に垂直な向きからかたむける）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const W1 = r.pick([200, 300, 400, 500]), L1 = r.int(6, 16) / 10, W2 = r.pick([240, 300, 400, 500, 600].filter(w => w !== W1)), L2 = W1 * L1 / W2;
          if (Math.abs(L2 * 100 - Math.round(L2 * 100)) > 1e-9 || L2 < 0.4 || L2 > 2.4) return null;
          return {
            q: `図の棒は支点Oでつり合っている（左 $${fmt(L1)}\\,\\mathrm{m}$ に $${W1}\\,\\mathrm{N}$、右 $x\\,\\mathrm{m}$ に $${W2}\\,\\mathrm{N}$）。$x$`,
            a: `$${fmt(L2)}$`, easy: `左回り $${W1}\\times${fmt(L1)}=${fmt(W1 * L1)}$ ＝ 右回り $${W2}x$ から $\\frac{${fmt(W1 * L1)}}{${W2}}=${fmt(L2)}$`, easyCheck: 'last',
            fig: seesawFig(L1, W1, L2, W2, { w: `$${W2}\\,\\mathrm{N}$`, l: '$x$' }),
          };
        }
        if (k === 1) {
          const th = r.pick([150, 45, 60, 120]), r10 = r.pick([3, 4, 5, 6, 8]), F = r.pick([20, 30, 40, 50, 60]);
          if (th % 30 === 0 && th !== 30 && th !== 150 && (r10 * F) % 20) return null;
          if (th % 45 === 0 && (r10 * F) % 20) return null;
          const Mv = moment(r10, F, th);
          return {
            q: `図のように、Oのまわりに回る長さ $${fmt(r10 / 10)}\\,\\mathrm{m}$ の棒の先を、棒の向きから $${D(th)}$ の向きに $${F}\\,\\mathrm{N}$ で引く。モーメントは □ $\\mathrm{N\\cdot m}$`,
            a: `$${Stex(Mv)}$`, easy: `$${fmt(r10 / 10)}\\times${F}\\times\\sin${D(th)}=${Stex(Mv)}$`, fig: armFig(r10 / 10, F, th),
          };
        }
        if (r.chance(0.5)) {
          // 力がうでにそって支点を向く（わなから移した。R2-11 の言い方）
          const r10 = r.pick([2, 3, 4, 5]), F = r.pick([30, 40, 50, 60]);
          return {
            q: `長さ $${fmt(r10 / 10)}\\,\\mathrm{m}$ のスパナの先を、柄にそってボルトのほうへ $${F}\\,\\mathrm{N}$ で押す。モーメントは □ $\\mathrm{N\\cdot m}$`, a: '$0$', key: 'zero',
            easy: `うでと力のなす角は $${D(0)}$。$${fmt(r10 / 10)}\\times${F}\\times\\sin${D(0)}=0$`, easyCheck: 'last',
            verify: (ans) => numOK(ans, (r10 / 10) * F * Math.sin(0)),
          };
        }
        const al = r.pick([45, 60]), r10 = r.pick([6, 8, 10]), F = r.pick([10, 20, 30, 40]);
        if ((r10 * F) % 20) return null;
        const Mv = moment(r10, F, 90 - al);
        return {
          q: `図はドアを上から見たもの。ちょうつがいOから $${fmt(r10 / 10)}\\,\\mathrm{m}$ のノブを、面に垂直な向きから $${D(al)}$ かたむけて $${F}\\,\\mathrm{N}$ で引く。モーメントは □ $\\mathrm{N\\cdot m}$`,
          a: `$${Stex(Mv)}$`, easyCheck: 'last', easy: `うでと力のなす角は $${D(90 - al)}$。$${fmt(r10 / 10)}\\times${F}\\times\\sin${D(90 - al)}=${Stex(Mv)}$`, fig: doorFig(r10 / 10, F, al),
        };
      },
      // わな：点の座標と力の成分（4-84）。力がうでにそって支点を向く（$\sin0^{\circ}=0$）は自分で解けるので s3 へ（第36回 N-3）
      trap(r) {
        const x = r.int(1, 5) / 10, y = r.int(1, 5) / 10, Fx = r.pick([10, 20, 30]), Fy = r.pick([10, 20, -10, -20]);
        const Mv = x * Fy - y * Fx;
        if (Math.abs(Mv) < 1e-9) return null;
        return dest({ q: `点P$${V(fmt(x), fmt(y))}$（m）に $\\vec{F}=${V(Fx, Fy)}$（N）。原点のまわりのモーメントは □ $\\mathrm{N\\cdot m}$`, a: `$${fmt(Mv)}$`, verify: (ans) => numOK(ans, dot(cross([x, y, 0], [Fx, Fy, 0]), [0, 0, 1])) }, '4-83',
          'うでの長さもなす角も書いていない。座標と力の成分から');
      },
    },
  });

  // ================================================================ 4-84
  const pP = (x, y) => `P$${V(fmt(x), fmt(y))}$`;
  add({
    id: '4-84', part: 6, chap: '4-14③', stars: 1,
    title: '平面のモーメントは $xF_y-yF_x$（＋なら左回り）',
    mark: '力のはたらく点の**座標**と、力の**成分**。角度を求めずに、$M=xF_y-yF_x$。',
    futsu: ['うでの長さ $\\sqrt{0.3^2+0.4^2}$ と', 'うでと力のなす角を求めて、', '$rF\\sin\\theta$ と回る向き'],
    raku: ['P$(0.3,\\ 0.4)$、$\\vec{F}=(20,\\ 10)$', '$0.3\\times10-0.4\\times20=3-8$', '$=-5$：右回りに5 N·m'],
    why: '上向きの $F_y$ はうで $x$ で左回りに $xF_y$、右向きの $F_x$ はうで $y$ で右回りに $yF_x$ 回す。合わせて $xF_y-yF_x$。マイナスの座標や成分でも、符号まで正しく出る（4-14③）。',
    caution: '順番は $xF_y-yF_x$（$x$ と $F_y$ をかけてから、$y$ と $F_x$ をひく）。答えの符号が回る向き。',
    counts: { s1: 6, s2: 3, s3: 3, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '12mm', s3: '16mm', trap: '24mm' },
    fits(q) { return (/モーメント|回る/.test(q) && has2(q)) || (/棒/.test(q) && /x=/.test(q)); },
    steps: {
      // 点と力の成分から
      s1(r) {
        const x = r.int(-5, 5) / 10, y = r.int(-5, 5) / 10, Fx = r.pick([-30, -20, -10, 0, 10, 20, 30, 40]), Fy = r.pick([-30, -20, -10, 10, 20, 30, 40]);
        if (!x || !y || !Fx) return null;
        if (x > 0 && y > 0 && Fx > 0 && Fy > 0 && r.chance(0.5)) return null;
        const Mv = x * Fy - y * Fx;
        return {
          q: `${pP(x, y)}（m）に $\\vec{F}=${V(Fx, Fy)}$（N）。原点のまわりのモーメントは □ $\\mathrm{N\\cdot m}$`, a: `$${fmt(Mv)}$`,
          easy: `$${par(x)}\\times${par(Fy)}-${par(y)}\\times${par(Fx)}=${fmt(Mv)}$`,
        };
      },
      // 横の棒に下向きの力がならぶ（y=0、F_x=0 なので xF_y だけ）
      s2(r) {
        const x1 = -r.int(3, 8) / 10, W1 = r.pick([100, 120, 150, 200]), x2 = r.int(2, 6) / 10, W2 = r.pick([50, 60, 100]), x3 = r.pick([0.8, 1, 1.2, 1.5, 2]);
        const s = -x1 * W1 - x2 * W2, F = s / x3;
        if (F <= 0 || Math.abs(F - Math.round(F)) > 1e-9) return null;
        return {
          q: `支点Oが原点の横の棒。$x=${fmt(x1)}$ に下向き $${W1}\\,\\mathrm{N}$、$x=${fmt(x2)}$ に下向き $${W2}\\,\\mathrm{N}$、$x=${fmt(x3)}$ に下向き □ N でつり合う`,
          a: `$${fmt(F)}$`, easyCheck: 'last',
          easy: `$${par(x1)}\\times(-${W1})+${fmt(x2)}\\times(-${W2})=${fmt(s)}$。$${fmt(x3)}\\times(-F)$ と合わせて0：$F=${fmt(F)}$`,
          verify: (ans) => numOK(ans, (x1 * W1 + x2 * W2) / -x3),
        };
      },
      // 回る向きをことばで、ことばで書いた2つの力
      s3(r) {
        const x = r.int(-5, 5) / 10, y = r.int(-5, 5) / 10;
        if (!x || !y) return null;
        if (r.chance(0.5)) {
          const Fx = r.pick([-30, -20, -10, 10, 20, 30]), Fy = r.pick([-30, -20, -10, 10, 20, 30]), Mv = x * Fy - y * Fx;
          if (Math.abs(Mv) < 1e-9) return null;
          const ans = Mv > 0 ? '左回り' : '右回り';
          return {
            q: `板の点${pP(x, y)} に $\\vec{F}=${V(Fx, Fy)}$。板は原点のまわりに □ に回る（左回り・右回り）`, a: ans, easyCheck: false,
            easy: `$M=${par(x)}\\times${par(Fy)}-${par(y)}\\times${par(Fx)}=${fmt(Mv)}$ が${Mv > 0 ? '＋なので左回り' : '－なので右回り'}`,
            verify: (ans) => ((cross([x, y, 0], [Fx, Fy, 0])[2] > 0) === (ans === '左回り') ? true : '向きがちがう'),
          };
        }
        const up = r.pick([10, 20, 30, 40]), side = r.pick([10, 20, 30]), toR = r.chance(0.5), up1 = r.chance(0.7);
        const Fx = toR ? side : -side, Fy = up1 ? up : -up, Mv = x * Fy - y * Fx;
        return {
          q: `点${pP(x, y)}（m）を、${up1 ? '真上' : '真下'}に $${up}\\,\\mathrm{N}$ と、${toR ? '右' : '左'}へ $${side}\\,\\mathrm{N}$ で同時に押す。原点のまわりのモーメント（左回りを＋）は □ $\\mathrm{N\\cdot m}$`,
          a: `$${fmt(Mv)}$`, easyCheck: 'last', easy: `$\\vec{F}=${V(Fx, Fy)}$。$${par(x)}\\times${par(Fy)}-${par(y)}\\times${par(Fx)}=${fmt(Mv)}$`,
          verify: (ans) => numOK(ans, cross([x, y, 0], [Fx, Fy, 0])[2]),
        };
      },
      // わな：うでの長さとなす角（4-83）、空間のトルク（4-85）
      trap(r) {
        if (r.chance(0.5)) {
          const r10 = r.pick([2, 4, 5, 6]), F = r.pick([20, 40, 60]), th = r.pick([30, 150]);
          const Mv = r10 * F / 20;
          return dest({ q: `長さ $${fmt(r10 / 10)}\\,\\mathrm{m}$ のうでの先に、うでとのなす角 $${D(th)}$ で $${F}\\,\\mathrm{N}$ の力。モーメントの大きさは □ $\\mathrm{N\\cdot m}$`, a: `$${fmt(Mv)}$`, verify: (ans) => numOK(ans, r10 / 10 * F * Math.sin(rad(th))) }, '4-84',
            '座標も成分もない。うでと角から $rF\\sin\\theta$');
        }
        const j = r.int(0, 2), rr = [0, 0, 0], F = [0, 0, 0], k = (j + 1 + r.int(0, 1)) % 3;
        rr[j] = r.int(2, 5) / 10; F[k] = r.pick([20, 40, 50, -30]);
        const c = cross(rr, F), ans = `$${V(...c.map(fmt))}$`;
        return dest({ q: `$\\vec{r}=${V(...rr.map(fmt))}$（m）、$\\vec{F}=${V(...F)}$（N）のトルク $\\vec{r}\\times\\vec{F}$ は □ $\\mathrm{N\\cdot m}$`, a: ans, verify: (ans) => tupleOK(ans, c) }, '4-84',
          '空間のベクトル。答えは数ではなくベクトルで、外積の成分の式');
      },
    },
  });

  // ================================================================ 4-85
  const BV = ['\\vec{i}', '\\vec{j}', '\\vec{k}'];
  const bvec = (c, j) => (c === 1 ? BV[j] : c === -1 ? `-${BV[j]}` : `${c}${BV[j]}`);
  // 外積を、基本ベクトルの表（i×j=k など）で計算し直す（成分の式とは別の道すじ）
  function crossByTable(a, b) {
    const T = [[[0, 0], [2, 1], [1, -1]], [[2, -1], [0, 0], [0, 1]], [[1, 1], [0, -1], [0, 0]]];
    const c = [0, 0, 0];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const [k, s] = T[i][j]; c[k] += s * a[i] * b[j]; }
    return c;
  }
  // 基本ベクトルの答え（「$-\vec{k}$」「$6\vec{k}$」「$\vec{0}$」）を成分に
  function bvecVal(ans) {
    const t = strip(ans);
    if (t === '\\vec{0}') return [0, 0, 0];
    const m = /^(-?)(\d*)\\vec\{([ijk])\}$/.exec(t);
    if (!m) return null;
    const c = (m[1] ? -1 : 1) * (m[2] ? +m[2] : 1), out = [0, 0, 0]; out['ijk'.indexOf(m[3])] = c;
    return out;
  }
  add({
    id: '4-85', part: 6, chap: '4-14⑤⑥', stars: 1,
    title: '外積の成分は $x\\to y\\to z$ の順のたすきがけ（順番を変えると符号が反対）',
    mark: '$\\vec{a}\\times\\vec{b}$、$\\vec{i}\\times\\vec{j}$、トルク $\\vec{r}\\times\\vec{F}$。成分を2回ならべて、たすきにかける。',
    futsu: ['$\\vec{a}=a_x\\vec{i}+a_y\\vec{j}+a_z\\vec{k}$ と書き、', '9組のかけ算をして、', '$\\vec{i}$・$\\vec{j}$・$\\vec{k}$ ごとにまとめる'],
    raku: ['$(1,\\ 2,\\ 0)\\times(0,\\ 1,\\ 3)$', '$x$：$2\\times3-0\\times1=6$、$y$：$0\\times0-1\\times3=-3$', '$z$：$1\\times1-2\\times0=1$ → $(6,\\ -3,\\ 1)$'],
    why: '$x$ 成分は $y$ と $z$ の列で、$y$ 成分は $z$ と $x$ の列で、$z$ 成分は $x$ と $y$ の列で、右下がり－左下がり。$x\\to y\\to z\\to x$ の順なので、成分を2回ならべると見まちがえない（4-14⑤）。',
    caution: '$\\vec{j}\\times\\vec{i}=-\\vec{k}$（順番を変えると符号が反対）。$y$ 成分は $a_zb_x-a_xb_z$（$z$ と $x$ の順）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '22mm', s3: '30mm', trap: '20mm' },
    fits(q) { return /\\times/.test(q) && (has3(q) || /\\vec\{[ijk]\}/.test(q)) && !/面積|大きさ/.test(q); },
    steps: {
      // 成分の計算
      s1(r) {
        const a = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], b = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
        if (a.filter(Boolean).length < 2 || b.filter(Boolean).length < 2) return null;
        const c = cross(a, b);
        if (c.every(x => x === 0)) return null;
        const ans = `$${V(...c)}$`;
        return {
          q: `$${V(...a)}\\times${V(...b)}=□$`, a: ans, easyCheck: false,
          easy: `$x$：$${par(a[1])}\\times${par(b[2])}-${par(a[2])}\\times${par(b[1])}$、$y$：$${par(a[2])}\\times${par(b[0])}-${par(a[0])}\\times${par(b[2])}$、$z$：$${par(a[0])}\\times${par(b[1])}-${par(a[1])}\\times${par(b[0])}$`,
          verify: (ans) => { const t = crossByTable(a, b); if (dot(t, a) || dot(t, b)) return '答えが a・b に垂直でない'; return tupleOK(ans, t); },
        };
      },
      // 基本ベクトル・順番の入れかえ・平行
      s2(r) {
        const k = r.int(0, 3);
        if (k <= 1) {
          const i = r.int(0, 2), j = r.int(0, 2), c1 = r.pick([1, 1, 2, 3, -1]), c2 = r.pick([1, 1, 2, 3, -2]);
          if (i === j && r.chance(0.7)) return null;
          const a = [0, 0, 0], b = [0, 0, 0]; a[i] = c1; b[j] = c2;
          const c = cross(a, b), n = c.findIndex(Boolean), ans = n < 0 ? '$\\vec{0}$' : `$${bvec(c[n], n)}$`;
          const w = (cc, jj) => (cc === 1 ? BV[jj] : `(${bvec(cc, jj)})`);
          return {
            q: `$${w(c1, i)}\\times${w(c2, j)}$`, a: ans, easyCheck: false,
            easy: i === j ? '同じ向きどうしは $\\vec{0}$（平行）' : `$${BV[i]}\\times${BV[j]}=${bvec((j - i + 3) % 3 === 1 ? 1 : -1, 3 - i - j)}$${c1 * c2 === 1 ? '' : ` に、数 $${c1 * c2}$ をかける`}`,
            verify: (ans) => { const v = bvecVal(ans); return v ? tupleOK(`$${V(...v)}$`, crossByTable(a, b)) : `読めない（${ans}）`; },
          };
        }
        if (k === 2) {
          const a = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], b = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], c = cross(a, b);
          if (c.filter(Boolean).length < 2) return null;
          const ans = `$${V(...c.map(x => -x))}$`;
          return { q: `$\\vec{a}\\times\\vec{b}=${V(...c)}$ のとき、$\\vec{b}\\times\\vec{a}$`, a: ans, easyCheck: false, easy: '順番を変えると、どの成分も符号が反対', verify: (ans) => tupleOK(ans, crossByTable(b, a)) };
        }
        const a = [r.int(-2, 3), r.int(1, 3), r.int(-2, 3)], m = r.pick([2, 3, -1, -2]), b = a.map(x => x * m);
        return { q: `$${V(...a)}\\times${V(...b)}$`, a: '$\\vec{0}$', easyCheck: false, easy: `うしろは前の $${m}$ 倍で平行。外積は $\\vec{0}$`, verify: (ans) => { const v = bvecVal(ans); return v ? tupleOK(`$${V(...v)}$`, crossByTable(a, b)) : `読めない（${ans}）`; } };
      },
      // トルク（教科書 4-14⑦）、成分を1つだけ
      s3(r) {
        if (r.chance(0.6)) {
          const rr = [0, 0, 0], F = [0, 0, 0], j = r.int(0, 2);
          rr[j] = r.int(2, 5) / 10;
          if (r.chance(0.4)) rr[(j + 1) % 3] = r.int(1, 3) / 10;
          F[(j + 1 + r.int(0, 1)) % 3] = r.pick([20, 30, 40, 50, -40]);
          if (r.chance(0.4)) F[(j + 2) % 3] = r.pick([10, 20, -20]);
          const c = cross(rr, F).map(x => +x.toFixed(6));
          if (c.every(x => x === 0)) return null;
          const ans = `$${V(...c.map(fmt))}$`;
          return { q: `ボルトから見て $\\vec{r}=${V(...rr.map(fmt))}$（m）の所に、力 $\\vec{F}=${V(...F)}$（N）をかける。トルク $\\vec{r}\\times\\vec{F}$ は □ $\\mathrm{N\\cdot m}$`, a: ans, easyCheck: false, easy: '成分の式で、$x$・$y$・$z$ の順に', verify: (ans) => tupleOK(ans, crossByTable(rr, F)) };
        }
        const a = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], b = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], j = r.int(0, 2), c = cross(a, b);
        if (a.filter(Boolean).length < 2 || b.filter(Boolean).length < 2) return null;
        const u = (j + 1) % 3, w = (j + 2) % 3;
        return { q: `$${V(...a)}\\times${V(...b)}$ の $${AX[j]}$ 成分`, a: `$${c[j]}$`, easy: `$${par(a[u])}\\times${par(b[w])}-${par(a[w])}\\times${par(b[u])}=${c[j]}$`, verify: (ans) => numOK(ans, crossByTable(a, b)[j]) };
      },
      // わな：内積（4-80）、成分のない外積の大きさ
      trap(r) {
        if (r.chance(0.5)) {
          const a = [r.int(-2, 3), r.int(1, 3), r.int(-2, 3)], b = [r.int(-2, 3), r.int(-2, 3), r.int(1, 3)], v = dot(a, b);
          return dest({ q: `$${V(...a)}\\cdot${V(...b)}$`, a: `$${v}$`, verify: (ans) => numOK(ans, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) }, '4-85',
            '$\\cdot$ は内積で、答えは数');
        }
        const A = r.pick([2, 3, 4, 6]), B = r.pick([4, 5, 6, 8]), th = r.pick([30, 150, 90]), v = A * B * (th === 90 ? 1 : 0.5);
        return dest({ q: `$\\lvert\\vec{a}\\rvert=${A}$、$\\lvert\\vec{b}\\rvert=${B}$、なす角 $${D(th)}$ のとき、$\\vec{a}\\times\\vec{b}$ の大きさ`, a: `$${fmt(v)}$`, verify: (ans) => numOK(ans, A * B * Math.sin(rad(th))) }, '4-85',
          `成分がないので、たすきがけは使えない。大きさは2本がつくる平行四辺形の面積で、$\\frac{1}{2}ab\\sin C$ の2倍：$${A}\\times${B}\\times\\sin${D(th)}=${fmt(v)}$。わざ 4-41 で`);
      },
    },
  });

  // ================================================================ 4-86
  const half = N => { const [k, m] = sqf(N); return Stex(S(k, 2, m)); };   // ½√N
  add({
    id: '4-86', part: 6, chap: '4-14⑥', stars: 1,
    title: '三角形の面積は $\\frac{1}{2}\\lvert\\overrightarrow{\\mathrm{AB}}\\times\\overrightarrow{\\mathrm{AC}}\\rvert$（平面なら $\\frac{1}{2}\\lvert a_xb_y-a_yb_x\\rvert$）',
    mark: '3点がつくる**三角形**、2本のベクトルがつくる**平行四辺形**の面積。角度を求めずに、座標だけで。',
    futsu: ['3辺の長さを出して、余弦定理で', '角の cos、そこから sin を出し、', '$\\frac{1}{2}ab\\sin C$'],
    raku: ['$\\overrightarrow{\\mathrm{AB}}=(-1,\\ 2,\\ 0)$、$\\overrightarrow{\\mathrm{AC}}=(-1,\\ 0,\\ 2)$', '外積 $(4,\\ 2,\\ 2)$、大きさ $\\sqrt{24}$', '面積 $\\frac{1}{2}\\sqrt{24}=\\sqrt{6}$'],
    why: '外積の大きさ $\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert\\sin\\theta$ は、2本がつくる平行四辺形の面積。三角形はその半分（4-14⑥）。平面のベクトルなら、外積は $z$ 成分 $a_xb_y-a_yb_x$ だけになる。',
    caution: '平行四辺形の面積は外積の大きさそのもの、三角形はその $\\frac{1}{2}$。平面の $a_xb_y-a_yb_x$ は、絶対値をとる（マイナスの面積はない）。',
    counts: { s1: 8, s2: 3, s3: 3, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    boxh: { s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { return /面積/.test(q) && (has2(q) || has3(q)); },
    steps: {
      // 平面：平行四辺形と三角形
      s1(r) {
        const a = [r.int(-2, 5), r.int(-2, 4)], b = [r.int(-2, 4), r.int(-2, 5)], det = a[0] * b[1] - a[1] * b[0];
        if (!det) return null;
        if (r.chance(0.4)) return { q: `$${V(...a)}$ と $${V(...b)}$ がつくる平行四辺形の面積`, a: `$${Math.abs(det)}$`, easy: `$\\lvert${par(a[0])}\\times${par(b[1])}-${par(a[1])}\\times${par(b[0])}\\rvert=${Math.abs(det)}$` };
        if (det % 2) return null;   // 三角形は面積が整数になるものに
        const A = [r.int(-2, 3), r.int(-2, 3)], B = A.map((x, i) => x + a[i]), C = A.map((x, i) => x + b[i]), ans = Stex(S(Math.abs(det), 2));
        return { q: `A$${V(...A)}$、B$${V(...B)}$、C$${V(...C)}$ の三角形の面積`, a: `$${ans}$`, easy: `$\\overrightarrow{\\mathrm{AB}}=${V(...a)}$、$\\overrightarrow{\\mathrm{AC}}=${V(...b)}$。$\\frac{1}{2}\\lvert${par(a[0])}\\times${par(b[1])}-${par(a[1])}\\times${par(b[0])}\\rvert=${ans}$` };
      },
      // 空間の3点
      s2(r) {
        const A = [r.int(0, 2), r.int(0, 2), r.int(0, 2)], B = [r.int(0, 3), r.int(0, 3), r.int(0, 2)], C = [r.int(0, 2), r.int(0, 3), r.int(0, 3)];
        const u = sub(B, A), v = sub(C, A), c = cross(u, v), N = dot(c, c);
        if (!N || u.filter(Boolean).length < 2 || v.filter(Boolean).length < 2) return null;
        const ans = half(N);
        return {
          q: `3点A$${V(...A)}$、B$${V(...B)}$、C$${V(...C)}$ がつくる三角形の面積`, a: `$${ans}$`,
          easy: `$\\overrightarrow{\\mathrm{AB}}\\times\\overrightarrow{\\mathrm{AC}}=${V(...u)}\\times${V(...v)}=${V(...c)}$。$\\frac{1}{2}\\sqrt{${N}}=${ans}$`,
          verify: (ans) => { const L = x => Math.hypot(...x), a = L(u), b = L(v), cs = dot(u, v) / (a * b); return numOK(ans, 0.5 * a * b * Math.sqrt(1 - cs * cs)); },
        };
      },
      // 空間の平行四辺形、軸の上の3点、平面の土地
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = [r.int(-1, 3), r.int(-1, 3), r.int(-1, 2)], b = [r.int(-1, 2), r.int(-1, 3), r.int(-1, 3)], c = cross(a, b), N = dot(c, c);
          if (!N || a.filter(Boolean).length < 2 || b.filter(Boolean).length < 2) return null;
          return { q: `$\\vec{a}=${V(...a)}$、$\\vec{b}=${V(...b)}$ がつくる平行四辺形の面積`, a: `$${rootTeX(N)}$`, easy: `外積 $${V(...c)}$。大きさ $\\sqrt{${N}}=${rootTeX(N)}$`, easyCheck: 'last', verify: (ans) => numOK(ans, Math.sqrt(dot(a, a) * dot(b, b) - dot(a, b) ** 2)) };
        }
        if (k === 1) {
          const a = r.int(1, 4), b = r.int(1, 4), c = r.int(1, 4), N = b * b * c * c + a * a * c * c + a * a * b * b, ans = half(N);
          return { q: `3点A$${V(a, 0, 0)}$、B$${V(0, b, 0)}$、C$${V(0, 0, c)}$ がつくる三角形の面積`, a: `$${ans}$`, easyCheck: 'last', easy: `外積 $${V(b * c, a * c, a * b)}$。$\\frac{1}{2}\\sqrt{${N}}=${ans}$`, verify: (ans) => numOK(ans, 0.5 * Math.hypot(...cross([-a, b, 0], [-a, 0, c]))) };
        }
        const A = [r.int(0, 4) * 2, r.int(0, 4) * 2], B = [A[0] + r.int(3, 8) * 2, A[1] + r.int(-2, 2) * 2], C = [A[0] + r.int(0, 6) * 2, A[1] + r.int(3, 7) * 2];
        const det = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
        if (!det) return null;
        return { q: `3本のくいA$${V(...A)}$、B$${V(...B)}$、C$${V(...C)}$（m）を結んだ三角形の土地の面積（$\\mathrm{m^2}$）`, a: `$${Math.abs(det) / 2}$`, easyCheck: 'last', easy: `$\\overrightarrow{\\mathrm{AB}}=${V(B[0] - A[0], B[1] - A[1])}$、$\\overrightarrow{\\mathrm{AC}}=${V(C[0] - A[0], C[1] - A[1])}$。$\\frac{1}{2}\\times${Math.abs(det)}=${Math.abs(det) / 2}$` };
      },
      // わな：3辺だけ（4-45 で角、4-41 で面積）、2辺とあいだの角（4-41）。座標がない
      trap(r) {
        if (r.chance(0.5)) {
          const [a, b, c, ar] = r.pick([[3, 5, 7, S(15, 4, 3)], [5, 7, 8, S(10, 1, 3)], [3, 7, 8, S(6, 1, 3)], [7, 8, 13, S(14, 1, 3)]]);
          const ans = `$${Stex(ar)}$`, s = (a + b + c) / 2;
          return dest({ q: `3辺が $${a}$、$${b}$、$${c}$ の三角形の面積`, a: ans, verify: (ans) => numOK(ans, Math.sqrt(s * (s - a) * (s - b) * (s - c))) }, '4-86',
            `座標もベクトルもない。いちばん長い辺 ${c} の向かいの角を余弦定理で出して（わざ 4-45）、$\\frac{1}{2}ab\\sin C$（わざ 4-41）。わざ 4-45・4-41 で`);
        }
        const a = r.pick([4, 6, 8, 10]), b = r.pick([3, 5, 6, 7]), th = r.pick([30, 150]), v = a * b / 4;
        return dest({ q: `$\\mathrm{AB}=${a}$、$\\mathrm{AC}=${b}$、$\\angle\\mathrm{A}=${D(th)}$ の三角形の面積`, a: `$${Stex(S(a * b, 4))}$`, verify: (ans) => numOK(ans, 0.5 * a * b * Math.sin(rad(th))) }, '4-86',
          `座標がない。2辺とあいだの角なので $\\frac{1}{2}bc\\sin A=\\frac{1}{2}\\times${a}\\times${b}\\times\\sin${D(th)}$。わざ 4-41 で`);
      },
    },
  });

  // ================================================================ 4-87
  const AXW = j => `$${AX[j]}$`;
  const dirTxt = (j, s) => `${AXW(j)} の${s > 0 ? '＋' : '－'}の向き`;
  const COMPASS = [['東', '西'], ['北', '南'], ['上', '下']];
  // 答え「$z$ の＋の向きに $0.3\,\mathrm{N}$」を、力のベクトルに読む
  function forceVal(ans) {
    let m = /^\$([xyz])\$ の(＋|－)の向きに \$([\d.]+)\\,\\mathrm\{N\}\$$/.exec(ans);
    if (m) { const v = [0, 0, 0]; v['xyz'.indexOf(m[1])] = (m[2] === '＋' ? 1 : -1) * +m[3]; return v; }
    m = /^(東|西|北|南|上|下)向きに \$([\d.]+)\\,\\mathrm\{N\}\$$/.exec(ans);
    if (m) { const k = '東西北南上下'.indexOf(m[1]), v = [0, 0, 0]; v[k >> 1] = (k % 2 ? -1 : 1) * +m[2]; return v; }
    return null;
  }
  function wire(r, cyc) {
    const I = r.int(1, 5), L10 = r.pick([1, 2, 3, 5]), B10 = r.pick([1, 2, 4, 5]), j = r.int(0, 2);
    const off = cyc ? 1 : r.pick([1, 2]), k = (j + off) % 3;
    let sj = cyc ? 1 : r.pick([1, -1]), sk = cyc ? 1 : r.pick([1, -1]);
    if (!cyc && off === 1 && sj === 1 && sk === 1) sk = -1;   // ステップ2は、逆の順か－の向きをふくむ
    const Lv = [0, 0, 0], Bv = [0, 0, 0]; Lv[j] = sj * L10 / 10; Bv[k] = sk * B10 / 10;
    const F = cross(Lv, Bv).map(x => x * I), n = F.findIndex(x => Math.abs(x) > 1e-12);
    return { I, L10, B10, j, k, sj, sk, Lv, Bv, F, n, mag: +(I * L10 * B10 / 100).toFixed(6) };
  }
  add({
    id: '4-87', part: 6, chap: '4-14⑧', stars: 1,
    title: '電流が受ける力は $I\\vec{L}\\times\\vec{B}$（軸の向きどうしの外積）',
    mark: '**電流**と**磁場**が座標軸の向き。向きは基本ベクトルの外積、大きさは $ILB$。',
    futsu: ['左手の3本の指を', '電流・磁場・力に合わせて、', '力の向きをさがす'],
    raku: ['電流 $x$ の＋、磁場 $y$ の＋', '$\\vec{i}\\times\\vec{j}=\\vec{k}$ で $z$ の＋の向き', '大きさ $3\\times0.2\\times0.5=0.3$（N）'],
    why: '$\\vec{F}=I\\vec{L}\\times\\vec{B}$。電流と磁場が軸の向きなら、$\\vec{L}$ と $\\vec{B}$ は基本ベクトルの何倍かなので、外積は $\\vec{i}\\times\\vec{j}=\\vec{k}$ などの表だけで決まる。直角なので $\\sin90^{\\circ}=1$ で、大きさは $ILB$（4-14⑧）。',
    caution: '$x\\to y\\to z\\to x$ の順なら＋、逆の順なら－。－の向きの電流・磁場は、符号を先にかけておく。電流と磁場が平行なら力は0（$\\vec{i}\\times\\vec{i}=\\vec{0}$）。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '38mm',
    fits(q) { return /電流/.test(q) && /磁場/.test(q) && !has3(q); },   // 磁場が成分で書いてあれば、外積の成分の式（4-85）
    steps: {
      // ＋の向きどうしで、x→y→z の順（i×j=k、j×k=i、k×i=j）
      s1(r) {
        const w = wire(r, true), ans = `${dirTxt(w.n, w.F[w.n])}に $${fmt(w.mag)}\\,\\mathrm{N}$`;
        return {
          q: `電流 $${w.I}\\,\\mathrm{A}$ が${dirTxt(w.j, 1)}（導線 $${fmt(w.L10 / 10)}\\,\\mathrm{m}$）、磁場 $${fmt(w.B10 / 10)}\\,\\mathrm{T}$ が${dirTxt(w.k, 1)}。導線が受ける力は □`,
          a: ans, easyCheck: false, easy: `$${BV[w.j]}\\times${BV[w.k]}=${BV[w.n]}$。大きさ $${w.I}\\times${fmt(w.L10 / 10)}\\times${fmt(w.B10 / 10)}=${fmt(w.mag)}$`,
          verify: (ans) => { const v = forceVal(ans); return v ? tupleOK(`$${V(...v.map(fmt))}$`, w.F) : `読めない（${ans}）`; },
        };
      },
      // 逆の順、－の向き
      s2(r) {
        const w = wire(r, false), ans = `${dirTxt(w.n, w.F[w.n])}に $${fmt(w.mag)}\\,\\mathrm{N}$`;
        const pr = (w.sj < 0 ? `(${bvec(w.sj, w.j)})` : bvec(w.sj, w.j)) + '\\times' + (w.sk < 0 ? `(${bvec(w.sk, w.k)})` : bvec(w.sk, w.k));
        return {
          q: `電流 $${w.I}\\,\\mathrm{A}$ が${dirTxt(w.j, w.sj)}（導線 $${fmt(w.L10 / 10)}\\,\\mathrm{m}$）、磁場 $${fmt(w.B10 / 10)}\\,\\mathrm{T}$ が${dirTxt(w.k, w.sk)}。導線が受ける力は □`,
          a: ans, easyCheck: false, easy: `$${pr}=${bvec(Math.sign(w.F[w.n]), w.n)}$。大きさ $${w.I}\\times${fmt(w.L10 / 10)}\\times${fmt(w.B10 / 10)}=${fmt(w.mag)}$`,
          verify: (ans) => { const v = forceVal(ans); return v ? tupleOK(`$${V(...v.map(fmt))}$`, w.F) : `読めない（${ans}）`; },
        };
      },
      // 場面：東・北・上（教科書 4-13 のドローンと同じ向き）
      s3(r) {
        const cw = (j, s) => COMPASS[j][s > 0 ? 0 : 1];
        if (r.chance(0.25)) {
          // 電流と磁場が平行（力は0。わなから移した。第36回 N-3）
          const I = r.int(1, 5), L10 = r.pick([1, 2, 3, 5]), B10 = r.pick([1, 2, 4, 5]), j = r.int(0, 2), s = r.pick([1, -1]);
          const Lv = [0, 0, 0], Bv = [0, 0, 0]; Lv[j] = L10 / 10; Bv[j] = s * B10 / 10;
          return {
            q: `東・北・上が $x$・$y$・$z$ の＋の向き。電流 $${I}\\,\\mathrm{A}$ が${cw(j, 1)}向き（導線 $${fmt(L10 / 10)}\\,\\mathrm{m}$）、磁場 $${fmt(B10 / 10)}\\,\\mathrm{T}$ が${cw(j, s)}向き。導線が受ける力は □`,
            a: '$0\\,\\mathrm{N}$', easyCheck: false, key: `zero${j},${s}`, easy: `平行なので $${BV[j]}\\times${s < 0 ? `(-${BV[j]})` : BV[j]}=\\vec{0}$。力ははたらかない`,
            verify: (ans) => (ans === '$0\\,\\mathrm{N}$' && crossByTable(Lv, Bv).every(x => x === 0) ? true : '力が0でない'),
          };
        }
        const w = wire(r, r.chance(0.4));
        const ans = `${cw(w.n, w.F[w.n])}向きに $${fmt(w.mag)}\\,\\mathrm{N}$`;
        return {
          q: `東・北・上が $x$・$y$・$z$ の＋の向き。電流 $${w.I}\\,\\mathrm{A}$ が${cw(w.j, w.sj)}向き（導線 $${fmt(w.L10 / 10)}\\,\\mathrm{m}$）、磁場 $${fmt(w.B10 / 10)}\\,\\mathrm{T}$ が${cw(w.k, w.sk)}向き。導線が受ける力は □`,
          a: ans, easyCheck: false, easy: `$${bvec(w.sj, w.j)}\\times${w.sk < 0 ? `(${bvec(w.sk, w.k)})` : bvec(w.sk, w.k)}=${bvec(Math.sign(w.F[w.n]), w.n)}$。大きさ $${fmt(w.mag)}$`,
          verify: (ans) => { const v = forceVal(ans); return v ? tupleOK(`$${V(...v.map(fmt))}$`, w.F) : `読めない（${ans}）`; },
        };
      },
      // わな：磁場が軸の向きでない（成分が2つ）。基本ベクトルの表ではなく、成分のたすきがけ（4-85）
      //   電流と磁場が平行（$\vec{i}\times\vec{i}=\vec{0}$）は自分で解けるので s3・caution へ（第36回 N-3）
      trap(r) {
        const I = r.pick([1, 2, 5]), L = r.pick([0.5, 1, 2]), j = r.int(0, 2), u = (j + 1) % 3, w = (j + 2) % 3;
        const Lv = [0, 0, 0], Bv = [0, 0, 0]; Lv[j] = L; Bv[u] = r.pick([1, 2, 3, 4]) / 10; Bv[w] = r.pick([1, 2, -2, 3, 4]) / 10;
        const F = cross(Lv, Bv).map(x => +(x * I).toFixed(6)), ans = `$${V(...F.map(fmt))}$`;
        return dest({
          q: `電流 $${I}\\,\\mathrm{A}$ が${dirTxt(j, 1)}（導線 $${fmt(L)}\\,\\mathrm{m}$）、磁場 $\\vec{B}=${V(...Bv.map(fmt))}$（T）。導線が受ける力 $\\vec{F}=I\\vec{L}\\times\\vec{B}$ の成分は □ N`,
          a: ans, verify: (ans) => tupleOK(ans, crossByTable(Lv, Bv).map(x => x * I)),
        }, '4-87', `磁場が軸の向きではないので、基本ベクトルの表だけでは決まらない。$I\\vec{L}=${V(...Lv.map(x => fmt(x * I)))}$ と $\\vec{B}$ の外積を成分の式で`, ['4-85']);
      },
    },
  });

  // ================================================================ 4-88
  // 角 th の点を、座標がきれいになる r で：(x, y) と r の TeX
  function polarPt(r, th) {
    let R;
    if (th % 90 === 0) R = S(r.int(1, 6));
    else if (th % 45 === 0) R = S(r.int(1, 4), 1, 2);
    else R = S(r.pick([2, 4, 6, 8]));
    const x = Smul(R, cosS(th)), y = Smul(R, sinS(th));
    return { R, x, y };
  }
  add({
    id: '4-88', part: 6, chap: '4-15①', stars: 1,
    title: '$(x,\\ y)$ から極座標：$r$ は三平方、角は区画を見てから',
    mark: '点の座標を $(r,\\ \\theta)$ に。まず点が**どの区画**にあるかを見て、それから角を決める。',
    futsu: ['$\\cos\\theta=\\frac{-3}{3\\sqrt{2}}=-\\frac{\\sqrt{2}}{2}$ から', '$\\theta$ の候補 $135^{\\circ}$、$225^{\\circ}$ を出し、', '$\\sin\\theta=\\frac{\\sqrt{2}}{2}$ も計算して $135^{\\circ}$ にしぼる'],
    raku: ['$(-3,\\ 3)$：$r=\\sqrt{9+9}=3\\sqrt{2}$', '左上の区画。とがった角は $45^{\\circ}$', '$180^{\\circ}-45^{\\circ}=135^{\\circ}$'],
    why: '$\\tan$ は、180°ちがう向きでも同じ値になる。点が左上・左下・右下のどこにあるかを先に見れば、とがった角（$x$ 軸とのあいだの角）から、180°・360°を使って角が1つに決まる（4-15①）。',
    caution: '$\\tan\\theta=\\frac{y}{x}$ の角をそのまま答えにしない（$(-3,\\ 3)$ は $-45^{\\circ}$ ではない）。$0^{\\circ}\\leqq\\theta<360^{\\circ}$ で答える。$x=0$ の点は $90^{\\circ}$ か $270^{\\circ}$。原点は $r=0$ で、角は決まらない。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '30mm' },
    boxh: { s3: '12mm' },
    fits(q) { return /極座標|\(r,\\ \\theta\)/.test(q) && has2(q) && !/円柱|球/.test(q); },
    steps: {
      // 右上の区画と、＋の軸の上
      s1(r) {
        const th = r.pick([30, 45, 60, 30, 45, 60, 0, 90]), p = polarPt(r, th), ans = `$${V(Stex(p.R), D(th))}$`;
        return {
          q: `点 $${V(Stex(p.x), Stex(p.y))}$ の極座標 $(r,\\ \\theta)$`, a: ans, easyCheck: false,
          easy: `$r=\\sqrt{${Stex(Smul(p.x, p.x))}+${Stex(Smul(p.y, p.y))}}=${Stex(p.R)}$。${th % 90 ? '右上で' : '＋の軸の上で'} $${D(th)}$`,
          verify: (ans) => polarOK(ans, Sval(p.x), Sval(p.y), false),
        };
      },
      // ほかの区画（左上・左下・右下）と、－の軸の上
      s2(r) {
        const th = r.pick([120, 135, 150, 210, 225, 240, 300, 315, 330, 180, 270]), p = polarPt(r, th), ans = `$${V(Stex(p.R), D(th))}$`;
        const t = th % 90 === 0 ? null : th < 180 ? 180 - th : th < 270 ? th - 180 : 360 - th, area = th < 180 ? '左上' : th < 270 ? '左下' : '右下';
        const how = t == null ? `軸の上で $${D(th)}$` : `${area}。とがった角 $${D(t)}$ から $${th < 180 ? `${D(180)}-${D(t)}` : th < 270 ? `${D(180)}+${D(t)}` : `${D(360)}-${D(t)}`}=${D(th)}$`;
        return {
          q: `点 $${V(Stex(p.x), Stex(p.y))}$ の極座標（$0^{\\circ}\\leqq\\theta<360^{\\circ}$）`, a: ans, easyCheck: false,
          easy: `$r=${Stex(p.R)}$。${how}`, verify: (ans) => polarOK(ans, Sval(p.x), Sval(p.y), false),
        };
      },
      // 場面：ロボットのうで（教科書 4-15 のコラム）、角をラジアンで
      s3(r) {
        const th = r.pick([30, 60, 120, 135, 150, 210, 240, 300, 315]), p = polarPt(r, th);
        if (r.chance(0.5)) {
          const ans = `$${V(Stex(p.R), D(th))}$`;
          return { q: `ロボットが手を $${V(Stex(p.x), Stex(p.y))}$（cm）に置く。うでの長さと角の組 $(r,\\ \\theta)$（$0^{\\circ}\\leqq\\theta<360^{\\circ}$）`, a: ans, easyCheck: false, easy: `$r=${Stex(p.R)}$、区画を見て $${D(th)}$`, verify: (ans) => polarOK(ans, Sval(p.x), Sval(p.y), false) };
        }
        const ans = `$\\left${V(Stex(p.R), piTeX(th, 180))}\\right$`.replace(/\)\\right\$$/, '\\right)$');
        return { q: `点 $${V(Stex(p.x), Stex(p.y))}$ の極座標（$\\theta$ はラジアンで、$0\\leqq\\theta<2\\pi$）`, a: ans, easyCheck: false, easy: `$r=${Stex(p.R)}$、$\\theta=${D(th)}=${piTeX(th, 180)}$`, verify: (ans) => polarOK(ans, Sval(p.x), Sval(p.y), true) };
      },
      // わな：反対向き（極座標から (x, y)。4-34 と 4-49）。原点（角が決まらない）は caution へ（第36回 N-3）
      trap(r) {
        const th = r.pick([120, 135, 150, 210, 225, 240, 300, 315, 330]), p = polarPt(r, th), ans = `$${VL(Stex(p.x), Stex(p.y))}$`;
        return dest({ q: `極座標 $${V(Stex(p.R), D(th))}$ の点の $(x,\\ y)$`, a: ans, verify: (ans) => tupleOK(ans, [Sval(p.R) * Math.cos(rad(th)), Sval(p.R) * Math.sin(rad(th))]) }, '4-88',
          `反対向き。$x=${Stex(p.R)}\\cos${D(th)}$、$y=${Stex(p.R)}\\sin${D(th)}$（斜辺×cos・sin：わざ 4-34）。符号は区画で（わざ 4-49）。わざ 4-34・4-49 で`);
      },
    },
  });

  // ================================================================ 4-89
  const lat = b => (b >= 0 ? `北緯 $${D(b)}$` : `南緯 $${D(-b)}$`);
  add({
    id: '4-89', part: 6, chap: '4-15③④', stars: 1,
    title: '円柱座標・球座標は「床の上の極座標＋高さ」（緯度は $90^{\\circ}-\\theta$）',
    mark: '**円柱座標** $(r,\\ \\theta,\\ z)$・**球座標** $(r,\\ \\theta,\\ \\varphi)$、緯度と経度。まず床の上の長さを出して、極座標で直す。',
    futsu: ['球座標の3つの式', '$x=r\\sin\\theta\\cos\\varphi$、$y=r\\sin\\theta\\sin\\varphi$、$z=r\\cos\\theta$', 'を、1つずつ覚えて入れる'],
    raku: ['球 $(2,\\ 60^{\\circ},\\ 45^{\\circ})$：高さ $2\\cos60^{\\circ}=1$', '床の上の長さ $2\\sin60^{\\circ}=\\sqrt{3}$', '床の極座標 $(\\sqrt{3},\\ 45^{\\circ})$ → $\\left(\\frac{\\sqrt{6}}{2},\\ \\frac{\\sqrt{6}}{2},\\ 1\\right)$'],
    why: '円柱座標は、床の上の極座標 $(r,\\ \\theta)$ に高さ $z$ を足しただけ。球座標も、真上からの角 $\\theta$ で高さ $r\\cos\\theta$ と床の上の長さ $r\\sin\\theta$ に分ければ、あとは床の上の極座標（4-15③④）。',
    caution: '円柱座標の $r$ は $z$ 軸からの距離で、原点からの距離ではない。球座標の $\\theta$ は真上からはかるので、北緯 $\\beta$ なら $\\theta=90^{\\circ}-\\beta$。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '40mm', s3: '44mm', trap: '16mm' },
    boxh: { s2: '12mm', s3: '12mm' },
    fits(q) { return /円柱座標|球座標|北緯|南緯|緯度|緯線|クレーン/.test(q) && !/大円|表面にそった|距離/.test(q); },   // 距離を聞くものは、直さずに三平方（4-89 のわな）
    steps: {
      // 円柱座標 → (x, y, z)、(x, y, z) → 円柱座標
      s1(r) {
        const th = r.pick([30, 60, 120, 150, 210, 240, 300, 330, 45, 135, 90, 180]), z = r.int(1, 9) * (r.chance(0.2) ? -1 : 1);
        const R = th % 45 === 0 && th % 90 ? S(r.pick([2, 4, 6])) : S(r.pick([2, 4, 6, 10, 20])), x = Smul(R, cosS(th)), y = Smul(R, sinS(th));
        if (r.chance(0.7)) {
          const ans = `$${V(Stex(x), Stex(y), z)}$`;
          return {
            q: `円柱座標 $${V(Stex(R), D(th), z)}$ の点の $(x,\\ y,\\ z)$`, a: ans, easyCheck: false,
            easy: `床の上は $(${Stex(R)}\\cos${D(th)},\\ ${Stex(R)}\\sin${D(th)})$、高さはそのまま $${z}$`,
            verify: (ans) => tupleOK(ans, [Sval(R) * Math.cos(rad(th)), Sval(R) * Math.sin(rad(th)), z]),
          };
        }
        const ans = `$${V(Stex(R), D(th), z)}$`;
        return {
          q: `点 $${V(Stex(x), Stex(y), z)}$ の円柱座標 $(r,\\ \\theta,\\ z)$`, a: ans, easyCheck: false, easy: `床の上の $${V(Stex(x), Stex(y))}$ を極座標に。高さはそのまま`,
          verify: (ans) => { const c = tuple(ans), rr = M.evalMath(c[0], {}), t = M.evalMath(c[1], {}); return tupleOK(`$${V(fx(rr * Math.cos(t)), fx(rr * Math.sin(t)), c[2])}$`, [Sval(x), Sval(y), z]); },
        };
      },
      // 球座標 → (x, y, z)、緯度 → θ
      s2(r) {
        if (r.chance(0.3)) {
          const b = r.int(1, 17) * 5 * (r.chance(0.3) ? -1 : 1), t = 90 - b;
          return { q: `地球の${lat(b)} の地点の、球座標の $\\theta$（北極の向きが $z$ 軸）`, a: `$${D(t)}$`, easyCheck: 'last', easy: `$\\theta$ は真上（北極）から：$${D(90)}${b >= 0 ? '-' : '+'}${D(Math.abs(b))}=${D(t)}$`, verify: (ans) => numOK(ans, rad(90 - b)) };
        }
        const R = r.pick([2, 4, 6, 8]), th = r.pick([30, 45, 60, 90, 120, 135, 150]), ph = r.pick([0, 30, 45, 60, 90, 120, 135, 180, 270]);
        const h = Smul(S(R), sinS(th)), x = Smul(h, cosS(ph)), y = Smul(h, sinS(ph)), z = Smul(S(R), cosS(th));
        const ans = `$\\left${V(Stex(x), Stex(y), Stex(z))}\\right$`.replace(/\)\\right\$$/, '\\right)$');
        return {
          q: `球座標 $${V(R, D(th), D(ph))}$ の点の $(x,\\ y,\\ z)$`, a: ans, easyCheck: false,
          easy: `高さ $${R}\\cos${D(th)}=${Stex(z)}$、床の上の長さ $${R}\\sin${D(th)}=${Stex(h)}$。床の極座標 $(${Stex(h)},\\ ${D(ph)})$`,
          verify: (ans) => tupleOK(ans, [R * Math.sin(rad(th)) * Math.cos(rad(ph)), R * Math.sin(rad(th)) * Math.sin(rad(ph)), R * Math.cos(rad(th))]),
        };
      },
      // まぜる：地球の上の点、(x, y, z) から球座標、クレーン
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const b = r.pick([30, 45, 60, -30]), ph = r.pick([30, 60, 90, 120, 150, 180]), R = 6400;
          const h = Smul(S(R), cosS(b)), x = Smul(h, cosS(ph)), y = Smul(h, sinS(ph)), z = Smul(S(R), sinS(b)), ans = `$${V(Stex(x), Stex(y), Stex(z))}$`;
          return {
            q: `地球（半径 $6400\\,\\mathrm{km}$。北極が $z$ 軸、東経 $0^{\\circ}$ の赤道が $x$ 軸）の${lat(b)}・東経 $${D(ph)}$ の地点の $(x,\\ y,\\ z)$`,
            a: ans, easyCheck: false, easy: `$\\theta=${D(90 - b)}$。高さ $${b < 0 ? '-' : ''}6400\\sin${D(Math.abs(b))}=${Stex(z)}$、緯線の半径 $6400\\cos${D(Math.abs(b))}=${Stex(h)}$`,
            verify: (ans) => tupleOK(ans, [R * Math.sin(rad(90 - b)) * Math.cos(rad(ph)), R * Math.sin(rad(90 - b)) * Math.sin(rad(ph)), R * Math.cos(rad(90 - b))]),
          };
        }
        if (k === 1) {
          const R = r.pick([2, 4, 6]), th = r.pick([30, 45, 60, 120, 135]), ph = r.pick([45, 90, 135, 225, 315]);
          const h = Smul(S(R), sinS(th)), x = Smul(h, cosS(ph)), y = Smul(h, sinS(ph)), z = Smul(S(R), cosS(th)), ans = `$${V(R, D(th), D(ph))}$`;
          return {
            q: `点 $${V(Stex(x), Stex(y), Stex(z))}$ の球座標 $(r,\\ \\theta,\\ \\varphi)$`, a: ans, easyCheck: false,
            easy: `$r=${R}$、$\\cos\\theta=${Stex(cosS(th))}$ で $${D(th)}$、床の上の点の角 $${D(ph)}$`,
            verify: (ans) => { const c = tuple(ans).map(t => M.evalMath(t, {})); return tupleOK(`$${V(...[c[0] * Math.sin(c[1]) * Math.cos(c[2]), c[0] * Math.sin(c[1]) * Math.sin(c[2]), c[0] * Math.cos(c[1])].map(fx))}$`, [Sval(x), Sval(y), Sval(z)]); },
          };
        }
        const R = r.pick([10, 20, 30]), th = r.pick([30, 60, 120, 150, 210, 300]), z = r.pick([20, 25, 30, 40]), x = Smul(S(R), cosS(th)), y = Smul(S(R), sinS(th)), ans = `$${V(Stex(x), Stex(y), z)}$`;
        return {
          q: `クレーンのフックが、柱から水平に $${R}\\,\\mathrm{m}$、うでを回した角 $${D(th)}$、高さ $${z}\\,\\mathrm{m}$。柱を $z$ 軸とした $(x,\\ y,\\ z)$`,
          a: ans, easyCheck: false, easy: `円柱座標 $${V(R, D(th), z)}$。床の上だけ極座標で直す`, verify: (ans) => tupleOK(ans, [R * Math.cos(rad(th)), R * Math.sin(rad(th)), z]),
        };
      },
      // わな：円柱座標の点の、原点からの距離（直さずに、r と z の直角三角形。ピタゴラス数：4-20）
      //   z 軸からの距離（r そのもの）は自分で解けるので caution へ（第36回 N-3）
      trap(r) {
        const th = r.pick([30, 60, 120, 135, 210, 240, 300]);
        const [a, b] = r.pick([[3, 4], [6, 8], [5, 12], [8, 6], [4, 3], [12, 5], [8, 15], [9, 12]]);
        return dest({ q: `円柱座標 $${V(a, D(th), b)}$ の点の、原点からの距離`, a: `$${Math.hypot(a, b)}$`, verify: (ans) => numOK(ans, Math.hypot(a * Math.cos(rad(th)), a * Math.sin(rad(th)), b)) }, '4-89',
          `$(x,\\ y,\\ z)$ に直さなくてよい。$r=${a}$ は $z$ 軸からの距離なので、$${a}$ と $${b}$ の直角三角形の斜辺。$${a}:${b}$ はピタゴラス数の倍で $${Math.hypot(a, b)}$。わざ 4-20 で`);
      },
    },
  });

  // ================================================================ 4-90
  // 図：座標軸・円・点P・半径・接線の向きの矢印（速度）・角のしるし
  function circFig(th) {
    const R = 2.6, c = Math.cos(rad(th)), sn = Math.sin(rad(th)), P = [R * c, R * sn], e = [-sn, c], Q = [P[0] + 1.7 * e[0], P[1] + 1.7 * e[1]];
    // 角の文字 θ は弧のまん中の向き（軸に近いときは軸から 25° はなす）。O は弧のない側に置く
    let la = th / 2;
    for (const A of [0, 90, 180, 270, 360]) if (Math.abs(la - A) < 25) la = A + (la >= A ? 25 : -25);
    la = Math.min(Math.max(la, 12), th - 12);
    let lo = (th + 360) / 2;
    for (const A of [180, 270]) if (Math.abs(lo - A) < 22) lo = A + (lo >= A ? 22 : -22);
    const on = [c - 0.7 * e[0], sn - 0.7 * e[1]], ol = Math.hypot(...on);
    return {
      s: 3.3, items: [
        ['axes', -3.5, 4.6, -3.5, 3.6, { o: false }], ['circle', [0, 0], R], ['seg', [0, 0], P], ['dot', P],
        ['arc', [0, 0], 0.8, 0, th, { arrow: true }], ['label', [1.45 * Math.cos(rad(la)), 1.45 * Math.sin(rad(la))], '$\\theta$', 'c'],
        ['label', [0.95 * Math.cos(rad(lo)), 0.95 * Math.sin(rad(lo))], 'O', 'c'],
        // v の文字は、矢の先から円の外向き（半径の向き）に置く（矢の先の向きに置くと、軸やその文字に重なる。R2-9）
        ['seg', P, Q, { arrow: true, thick: true }], ['label', [Q[0] + 0.25 * e[0] + 0.7 * c, Q[1] + 0.25 * e[1] + 0.7 * sn], '$\\vec{v}$', 'c'],
        ['label', [P[0] + 0.8 * on[0] / ol, P[1] + 0.8 * on[1] / ol], 'P', 'c'],
        ['label', [Q[0] + 1.3 * c, Q[1] + 1.3 * sn], '', 'c'], ['label', [0, -4.2], '', 'c'],   // 見えない点（図のはば）
      ],
    };
  }
  const vel = (rw, th) => [Smul(S(-rw), sinS(th)), Smul(S(rw), cosS(th))];   // rω(−sinθ, cosθ)
  add({
    id: '4-90', part: 6, chap: '4-15②', stars: 1,
    title: '円運動の速さは $r\\omega$、向きは接線 $\\vec{e}_\\theta=(-\\sin\\theta,\\ \\cos\\theta)$',
    mark: '**半径**・**角速度**と、いまの**角**。速度は $r\\omega\\,\\vec{e}_\\theta$（左回り）。長さは m、時間は s。',
    futsu: ['少しあとの位置 $(r\\cos\\theta,\\ r\\sin\\theta)$ を計算して、', '位置の変化を時間でわる', '（$\\frac{\\Delta x}{\\Delta t}$、$\\frac{\\Delta y}{\\Delta t}$）'],
    raku: ['0.5 m、4 rad/s、$30^{\\circ}$：速さ $0.5\\times4=2$', '$\\vec{e}_\\theta=(-\\sin30^{\\circ},\\ \\cos30^{\\circ})$', '$\\vec{v}=2\\left(-\\frac{1}{2},\\ \\frac{\\sqrt{3}}{2}\\right)=(-1,\\ \\sqrt{3})$'],
    why: '1秒に進む弧の長さは、半径×角で $r\\omega$。向きは円の接線（半径に垂直）で、$\\vec{e}_r=(\\cos\\theta,\\ \\sin\\theta)$ を左回りに $90^{\\circ}$ 回した $\\vec{e}_\\theta=(-\\sin\\theta,\\ \\cos\\theta)$（4-15②）。',
    caution: '$\\vec{e}_\\theta$ の $x$ 成分は $-\\sin\\theta$（マイナスをわすれない）。$\\omega$ は rad/s で使う。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    boxh: { s1: '12mm' },
    fits(q) { return /角速度|rad\/s|\\vec\{e\}_\\theta|円運動/.test(q) && !/加速度|変化/.test(q); },
    steps: {
      // 速さ rω と、e_θ の成分
      s1(r) {
        if (r.chance(0.4)) {
          const r10 = r.pick([2, 3, 4, 5, 6, 8, 15, 20]), w = r.pick([2, 3, 4, 5, 10]), v = r10 * w / 10;
          return { q: `半径 $${fmt(r10 / 10)}\\,\\mathrm{m}$、角速度 $${w}\\,\\mathrm{rad/s}$ の円運動の速さ（m/s）`, a: `$${fmt(v)}$`, easy: `$${fmt(r10 / 10)}\\times${w}=${fmt(v)}$` };
        }
        const th = r.pick([30, 45, 60, 90, 120, 135, 150, 210, 240, 300, 330]), e = vel(1, th), ans = `$\\left${V(Stex(e[0]), Stex(e[1]))}\\right$`.replace(/\)\\right\$$/, '\\right)$');
        return { q: `$\\theta=${D(th)}$ の点の $\\vec{e}_\\theta$`, a: ans, easyCheck: false, easy: `$(-\\sin${D(th)},\\ \\cos${D(th)})$`, verify: (ans) => tupleOK(ans, [Math.cos(rad(th + 90)), Math.sin(rad(th + 90))]) };
      },
      // 速度の成分
      s2(r) {
        const rr = r.pick([0.5, 1, 2, 0.4, 3]), w = r.pick([2, 3, 4, 5, 6]), rw = rr * w;
        if (Math.abs(rw - Math.round(rw)) > 1e-9 || rw > 12 || rw % 2) return null;   // 速さは偶数（成分が分数にならない）
        const th = r.pick([30, 60, 120, 150, 210, 240, 300, 330, 45, 135, 90, 180]);
        if (th % 45 === 0 && th % 90 && rw % 2) return null;
        if (r.chance(0.25)) {
          // 右回り（$\vec{e}_\theta$ と反対向き。わなから移した。第36回 N-3）
          const v = vel(-rw, th), ans = `$${VL(Stex(v[0]), Stex(v[1]))}$`;
          return {
            q: `半径 $${fmt(rr)}\\,\\mathrm{m}$、$${w}\\,\\mathrm{rad/s}$ で**右回り**、$\\theta=${D(th)}$ での速度`, a: ans, easyCheck: false, key: `cw${th}`,
            easy: `右回りは $\\vec{e}_\\theta$ と反対向き：$-${fmt(rw)}(-\\sin${D(th)},\\ \\cos${D(th)})$`, verify: (ans) => tupleOK(ans, [rw * Math.sin(rad(th)), -rw * Math.cos(rad(th))]),
          };
        }
        const v = vel(rw, th), ans = `$${VL(Stex(v[0]), Stex(v[1]))}$`;
        return {
          q: `半径 $${fmt(rr)}\\,\\mathrm{m}$、$${w}\\,\\mathrm{rad/s}$ で左回り、$\\theta=${D(th)}$ での速度`, a: ans, easyCheck: false,
          easy: `速さ $${fmt(rw)}$。$${fmt(rw)}(-\\sin${D(th)},\\ \\cos${D(th)})$`, verify: (ans) => tupleOK(ans, [rr * w * Math.cos(rad(th + 90)), rr * w * Math.sin(rad(th + 90))]),
        };
      },
      // 図：観覧車・洗たく機・回転する点
      s3(r) {
        const sc = r.int(0, 2);
        const [rr, w] = sc === 0 ? [r.pick([20, 40]), 0.1] : sc === 1 ? [0.2, r.pick([10, 20, 30])] : [r.pick([1, 2]), r.pick([2, 4, 6])];   // 速さが偶数（成分が分数にならない）
        const rw = +(rr * w).toFixed(6), th = r.pick([30, 120, 210, 300]);   // 速度の矢印（接線）が次の軸に向かうので、区画のはじめの角だけ（60°・150°・240° は矢印と v が軸に重なる。R2-9）
        const v = vel(rw, th), ans = `$${VL(Stex(v[0]), Stex(v[1]))}$`;
        const head = sc === 0 ? `図の観覧車（半径 $${rr}\\,\\mathrm{m}$）が $0.1\\,\\mathrm{rad/s}$ で左回り。ゴンドラPが $\\theta=${D(th)}$ のとき` :
          sc === 1 ? `図の洗たく機（半径 $0.2\\,\\mathrm{m}$）の点Pが $${w}\\,\\mathrm{rad/s}$ で左回り。$\\theta=${D(th)}$ のとき` :
            `図の点Pが半径 $${fmt(rr)}\\,\\mathrm{m}$、$${w}\\,\\mathrm{rad/s}$ で左回り。$\\theta=${D(th)}$ のとき`;
        return {
          q: `${head}、Pの速度（m/s）`, a: ans, easyCheck: false, easy: `速さ $${fmt(rr)}\\times${w}=${fmt(rw)}$。$${fmt(rw)}(-\\sin${D(th)},\\ \\cos${D(th)})$`,
          verify: (ans) => tupleOK(ans, [rr * w * Math.cos(rad(th + 90)), rr * w * Math.sin(rad(th + 90))]),
          fig: circFig(th),
        };
      },
      // わな：速度の変化の大きさ（4分の1周は直角な速度の差で 4-66、半周は一直線で 4-65）、加速度の大きさ rω²（楽な形なし）
      //   右回り（$-r\omega\,\vec{e}_\theta$）は自分で解けるので s2 へ（第36回 N-3）
      trap(r) {
        const rr = r.pick([0.5, 1, 2]), w = r.pick([2, 4, 6]), rw = rr * w;
        if (r.chance(0.6)) {
          const quarter = r.chance(0.6), t0 = r.pick(quarter ? [0, 90, 180] : [0, 90]), t1 = t0 + (quarter ? 90 : 180), ans = quarter ? `${fmt(rw)}\\sqrt{2}` : fmt(2 * rw);
          const v0 = [-Math.sin(rad(t0)), Math.cos(rad(t0))].map(x => x * rw), v1 = [-Math.sin(rad(t1)), Math.cos(rad(t1))].map(x => x * rw);
          return dest({ q: `半径 $${fmt(rr)}\\,\\mathrm{m}$、$${w}\\,\\mathrm{rad/s}$ で左回り。$\\theta=${D(t0)}$ から $\\theta=${D(t1)}$ まで回るあいだの、速度の変化の大きさは □ m/s`, a: `$${ans}$`,
            verify: (ans) => numOK(ans, Math.hypot(v1[0] - v0[0], v1[1] - v0[1])) }, '4-90',
            quarter ? `成分を出さなくてよい。速さ $${fmt(rw)}$ のまま向きが $${D(90)}$ 変わるので、$\\sqrt{${fmt(rw)}^2+${fmt(rw)}^2}=${ans}$。わざ 4-66 で`
              : `成分を出さなくてよい。速さ $${fmt(rw)}$ のまま反対向きになる一直線なので、$${fmt(rw)}-(-${fmt(rw)})=${ans}$。わざ 4-65 で`);
        }
        const a = rr * w * w;
        return dest({ q: `半径 $${fmt(rr)}\\,\\mathrm{m}$、$${w}\\,\\mathrm{rad/s}$ の円運動の加速度の大きさ（$\\mathrm{m/s^2}$）`, a: `$${fmt(a)}$`, verify: (ans) => numOK(ans, rr * w * w) }, '4-90',
          `楽な形なし。速度ではなく加速度。速度の矢印の先も半径 $r\\omega$ の円を $\\omega$ で回るので、$r\\omega\\times\\omega=${fmt(rr)}\\times${w}^2=${fmt(a)}$`);
      },
    },
  });

  // ================================================================ 4-98
  add({
    id: '4-98', part: 6, chap: '4-15④', stars: 1,
    title: '大円にそった距離は「半径×中心角（rad）」',
    mark: '地球（球）の表面にそった**最短の距離**。中心から見た2地点のなす角（**中心角**）を rad にして、半径にかける。',
    futsu: ['角を度のまま', '$2\\pi\\times6400\\times\\frac{60}{360}$', 'と、円周の何分のいくつかで計算する'],
    raku: ['北緯 $60^{\\circ}$ の東経 $0^{\\circ}$ と $180^{\\circ}$', '北極をこえて、中心角 $30^{\\circ}+30^{\\circ}=60^{\\circ}=\\frac{\\pi}{3}$', '$6400\\times\\frac{\\pi}{3}=\\frac{6400}{3}\\pi$（km）'],
    why: '球の上の2点を結ぶ最短の道は、中心を通る平面で切った大円の弧。弧の長さは「半径×中心角」で、角が rad なら $s=r\\theta$ そのまま（4-2・4-15④）。同じ経度の2地点なら、中心角は緯度の差。',
    caution: '中心角は rad にしてからかける（度のままかけない）。緯線（同じ緯度の円）は大円ではない（赤道だけが大円）。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '20mm' },
    boxh: { s1: '12mm', s2: '12mm', trap: '12mm' },
    fits(q) { return /大円|表面にそった/.test(q); },
    steps: {
      // 中心角から
      s1(r) {
        const al = r.pick([30, 45, 60, 90, 120, 135, 150, 15, 75]), [R, what, u] = r.pick([[6400, '地球', 'km'], [6400, '地球', 'km'], [12, '球', 'cm'], [6, '球', 'cm'], [1800, '月', 'km']]);
        const ans = piTeX2(R * al, 180);
        return {
          q: `半径 $${R}\\,\\mathrm{${u}}$ の${what}で、中心角 $${D(al)}$ の2地点の、大円にそった距離（${u}）`, a: `$${ans}$`,
          easy: `$${R}\\times${piTeX(al, 180)}=${ans}$`,
        };
      },
      // 緯度・経度から中心角を出す（同じ経度、北極をこえる、赤道の上）
      s2(r) {
        const k = r.int(0, 2), R = 6400;
        let al, txt, how;
        if (k === 0) {
          const b1 = r.pick([0, 15, 30, 45, 60, 75]), b2 = r.pick([15, 30, 45, 60, 75]) * (r.chance(0.4) ? -1 : 1);
          al = Math.abs(b1 - b2);
          if (!al || al > 150 || b2 === -90) return null;
          txt = `東経 $${D(r.pick([0, 30, 135, 140]))}$ の${b1 ? lat(b1) + ' ' : '赤道'}の地点と、同じ経度の${lat(b2)} の地点`; how = `緯度の差 $${D(al)}$`;
        } else if (k === 1) {
          const b = r.pick([30, 45, 60, 75]), p = r.pick([0, 30, 45]); al = 180 - 2 * b;
          txt = `${lat(b)}・東経 $${D(p)}$ の地点と、${lat(b)}・${p ? `西経 $${D(180 - p)}$` : '東経 $180^{\\circ}$'} の地点`; how = `北極をこえて、$${D(90 - b)}$ が2つで $${D(al)}$`;
        } else {
          const p1 = r.pick([0, 15, 30, 45]), p2 = p1 + r.pick([30, 45, 60, 90, 120]); al = p2 - p1;
          txt = `赤道の上の東経 $${D(p1)}$ の地点と、東経 $${D(p2)}$ の地点`; how = `赤道は大円。経度の差 $${D(al)}$`;
        }
        const ans = piTeX2(R * al, 180);
        return { q: `地球（半径 $6400\\,\\mathrm{km}$）で、${txt}の、大円にそった距離（km）`, a: `$${ans}$`, easyCheck: 'last', easy: `${how}。$${D(al)}=${piTeX(al, 180)}$。$6400\\times${piTeX(al, 180)}=${ans}$` };
      },
      // 約の値（π=3.14）、北極までの距離
      s3(r) {
        if (r.chance(0.6)) {
          const al = r.pick([45, 90, 135, 180]), v = 6400 * 3.14 * al / 180;
          const where = al === 180 ? 'ちょうど反対がわの地点' : `中心角 $${D(al)}$ の地点`;
          return { q: `地球（半径 $6400\\,\\mathrm{km}$）で、飛行機が、ある空港から${where}まで大円にそって飛ぶ距離は約何 km か（$\\pi=3.14$ として、整数で）`, a: `$${fmt(v)}$`, easy: `$6400\\times\\frac{3.14\\times${al}}{180}=${fmt(v)}$` };
        }
        const b = r.pick([30, 45, 60, 75, 15]), al = 90 - b, ans = piTeX2(6400 * al, 180);
        return { q: `地球（半径 $6400\\,\\mathrm{km}$）で、${lat(b)} の地点から北極まで、地球の表面にそった最短の距離（km）`, a: `$${ans}$`, easyCheck: 'last', easy: `中心角は $${D(90)}-${D(b)}=${D(al)}$。$6400\\times${piTeX(al, 180)}=${ans}$` };
      },
      // わな：緯線にそって進む（大円ではない）、まっすぐなトンネル（弦）
      trap(r) {
        if (r.chance(0.5)) {
          const b = r.pick([60, 30, 45]), dp = r.pick([90, 180, 60]), h = Smul(S(6400), cosS(b)), ans = `$${Stex(Smul(h, S(dp, 180)))}\\pi$`.replace('$1\\pi', '$\\pi');
          return dest({ q: `地球（半径 $6400\\,\\mathrm{km}$）で、${lat(b)} の緯線にそって、東経 $0^{\\circ}$ から東経 $${D(dp)}$ まで進む道のり（km）`, a: ans, verify: (ans) => numOK(ans, 6400 * Math.cos(rad(b)) * rad(dp)) }, '4-98',
            `緯線は大円ではない。緯線の円の半径 $6400\\cos${D(b)}$ に $${piTeX(dp, 180)}$ をかける`);
        }
        const al = r.pick([60, 90, 120]), ch = Smul(S(2 * 6400), sinS(al / 2)), ans = `$${Stex(ch)}$`;
        return dest({ q: `地球（半径 $6400\\,\\mathrm{km}$）で、中心角 $${D(al)}$ の2地点を、地下のまっすぐなトンネルで結んだ長さ（km）`, a: ans, verify: (ans) => numOK(ans, Math.hypot(6400 - 6400 * Math.cos(rad(al)), 6400 * Math.sin(rad(al)))) }, '4-98',
          `表面にそった弧ではなく、まっすぐな弦。中心と2地点の三角形で、2辺 $6400$ とあいだの角 $${D(al)}$ の向かいの辺を余弦定理で。わざ 4-44 で`);
      },
    },
  });

  // ================================================================ 4-99
  const TH = [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [1, 1], [3, 2], [2, 1], [5, 6], [4, 1]];   // θ ＝ n/d π
  const kTeX = k => (k === 1 ? '' : fmt(k));
  add({
    id: '4-99', part: 6, chap: '4-15⑤', stars: 1,
    title: '極方程式は rad で代入',
    mark: '**極方程式** $r=2\\theta$ のように、$\\theta$ が式の中で**数**として使われている。度は rad に直してから入れる。',
    futsu: ['$90^{\\circ}$ は1周の $\\frac{90}{360}=\\frac{1}{4}$ なので、', '半径1の円周 $2\\pi$ の $\\frac{1}{4}$ で $\\theta=\\frac{\\pi}{2}$', '$r=2\\times\\frac{\\pi}{2}=\\pi$'],
    raku: ['$180^{\\circ}=\\pi$ でおきかえて', '$\\theta=90^{\\circ}=\\frac{\\pi}{2}$、$r=2\\times\\frac{\\pi}{2}=\\pi$', '点は $(0,\\ \\pi)$'],
    why: '$r=2\\theta$ の $\\theta$ は、長さ $r$ を決める数として使われている。度の数はただの目もりの数なので、弧の長さ・半径と同じ仲間の数にするには rad で入れる（4-2・4-15⑤）。',
    caution: '度のまま入れて $r=2\\times90=180$ としない。$\\theta$ が $\\cos\\theta$ の中にだけあるときは、度のまま cos の値を使ってよい。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '26mm', s3: '22mm', trap: '26mm' },
    boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { const m = /(?:極方程式|らせん)\s*\$r=([^$]*)\$/.exec(q); return !!m && /\\theta/.test(m[1]) && !/\\cos|\\sin/.test(m[1]); },
    steps: {
      // θ が rad で書いてある
      s1(r) {
        const k = r.pick([1, 2, 3, 0.5, 4]), [n, d] = r.pick(TH), kn = Math.round(k * 2), ans = piTeX(kn * n, 2 * d);
        return { q: `極方程式 $r=${kTeX(k)}\\theta$、$\\theta=${piTeX(n, d)}$ での $r$`, a: `$${ans}$`, easy: `$${fmt(k)}\\times${piTeX(n, d)}=${ans}$` };
      },
      // θ が度で書いてある。点の (x, y)
      s2(r) {
        const k = r.pick([1, 2, 3, 0.5]), kn = Math.round(k * 2);
        if (r.chance(0.5)) {
          const dg = r.pick([30, 45, 60, 90, 120, 180, 270, 360]), ans = piTeX(kn * dg, 2 * 180);
          return { q: `極方程式 $r=${kTeX(k)}\\theta$、$\\theta=${D(dg)}$ での $r$`, a: `$${ans}$`, easyCheck: 'last', easy: `$${D(dg)}=${piTeX(dg, 180)}$ を入れて $${fmt(k)}\\times${piTeX(dg, 180)}=${ans}$` };
        }
        const dg = r.pick([90, 180, 270, 360]), rr = [kn * dg, 360], c = Math.round(Math.cos(rad(dg))), s = Math.round(Math.sin(rad(dg)));
        const ans = `$${VL(piTeX(rr[0] * c, rr[1]), piTeX(rr[0] * s, rr[1]))}$`;
        return {
          q: `極方程式 $r=${kTeX(k)}\\theta$ の、$\\theta=${D(dg)}$ の点の $(x,\\ y)$`, a: ans, easyCheck: false,
          easy: `$r=${fmt(k)}\\times${piTeX(dg, 180)}=${piTeX(rr[0], rr[1])}$。$(r\\cos${D(dg)},\\ r\\sin${D(dg)})$`,
          verify: (ans) => tupleOK(ans, [k * rad(dg) * Math.cos(rad(dg)), k * rad(dg) * Math.sin(rad(dg))]),
        };
      },
      // 場面：かとり線香・ぜんまい（らせん）
      s3(r) {
        const k = r.pick([0.5, 1, 2]), turns = r.pick([1, 2, 3]), kn = Math.round(k * 2);
        if (r.chance(0.5)) {
          const ans = piTeX(kn * 2 * turns, 2);
          return { q: `かとり線香の形を、らせん $r=${kTeX(k)}\\theta$（cm、$\\theta$ は rad）とみる。中心から${turns}周回った所の $r$（cm）`, a: `$${ans}$`, easyCheck: 'last', easy: `${turns}周は $\\theta=${piTeX(2 * turns, 1)}$。$r=${fmt(k)}\\times${piTeX(2 * turns, 1)}=${ans}$` };
        }
        const ans = piTeX(kn * 2, 2);
        return { q: `ぜんまいの形を、らせん $r=${kTeX(k)}\\theta$（mm、$\\theta$ は rad）とみる。1周回るごとに、$r$ は何 mm ふえるか`, a: `$${ans}$`, easyCheck: 'last', easy: `1周で $\\theta$ が $2\\pi$ ふえるので、$${fmt(k)}\\times2\\pi=${ans}$` };
      },
      // わな：θ が cos の中だけ（度のままでよい）、r が一定の円
      trap(r) {
        if (r.chance(0.5)) {
          const dg = r.pick([60, 90, 120, 180]), a = r.pick([1, 2]), v = a + Math.cos(rad(dg)), ans = Stex(Sr(v));
          return dest({ q: `極方程式 $r=${a}+\\cos\\theta$ で、$\\theta=${D(dg)}$ のときの $r$`, a: `$${ans}$`, verify: (ans) => numOK(ans, a + Math.cos(rad(dg))) }, '4-99',
            `$\\theta$ は cos の中だけ。rad に直さなくてよい：$${a}+\\cos${D(dg)}=${ans}$。cos の値は${dg >= 90 ? '単位円で。わざ 4-49 で' : '三角定規の比から。わざ 4-33 で'}`);
        }
        const R = r.pick([2, 4, 6]), dg = r.pick([120, 150, 210, 240, 300]), x = Smul(S(R), cosS(dg)), y = Smul(S(R), sinS(dg)), ans = `$${V(Stex(x), Stex(y))}$`;
        return dest({ q: `極方程式 $r=${R}$ の円の、$\\theta=${D(dg)}$ の点の $(x,\\ y)$`, a: ans, verify: (ans) => tupleOK(ans, [R * Math.cos(rad(dg)), R * Math.sin(rad(dg))]) }, '4-99',
          `$r$ は $\\theta$ によらず ${R}。$(${R}\\cos${D(dg)},\\ ${R}\\sin${D(dg)})$（斜辺×cos・sin：わざ 4-34）。符号は区画で（わざ 4-49）。わざ 4-34・4-49 で`);
      },
    },
  });
})(globalThis.MONDAI);
