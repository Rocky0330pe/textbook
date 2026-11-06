/* 問題集 第3巻　第4部 放物線と2次方程式（わざ 3-44〜3-59、3-92〜3-94）　組 d
 * 書き方は v1/README.md と v2/README.md。文は教科書 第3巻と同じ（漢字にルビ、分かち書きなし）。式は $…$。
 * 答えが式1つ（因数分解・√ の計算など）なら check.js が文字に値を入れて確かめる。
 * 方程式の解・頂点・最大と最小・不等式の答えは verify で確かめる（解をもとの式に入れて0になるか。√ は小数で、誤差 1e-9）。
 * 答え（解）を先に決めて、逆に式を作る。わなは、同じ部のほかのわざで楽になるときは、楽な形に行き先を書いて also に入れる（H-1）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の部品
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const gcd3 = (a, b, c) => gcd(gcd(a, b), c);
  const isSq = n => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
  // n = s^2 × d（d は2乗の数でわれない）→ [s, d]
  const sqf = n => { let s = 1, d = n; for (let k = 2; k * k <= d; k++) while (d % (k * k) === 0) { d /= k * k; s *= k; } return [s, d]; };
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));

  // ---------------------------------------------------------------- 式の書き方（TeX）
  // 項：係数 c と文字の部分 body。first なら + をつけない
  const term = (c, body, first) => {
    if (!c) return '';
    const a = Math.abs(c);
    return (c < 0 ? '-' : (first ? '' : '+')) + (body && a === 1 ? '' : String(a)) + body;
  };
  // [a, b, c] → ax^2+bx+c（係数の多い式もよい。高い次数から）
  function poly(cs, v) {
    const n = cs.length - 1;
    let out = '';
    cs.forEach((c, i) => { const d = n - i; out += term(c, d === 0 ? '' : d === 1 ? v : `${v}^${d}`, out === ''); });
    return out || '0';
  }
  const lin = (a, b, v) => poly([a, b], v);            // ax+b
  const par = (a, b, v) => `(${lin(a, b, v)})`;        // (ax+b)
  // (x-a)(x-b)。0 になる所が0の因数は x と書いて、前に置く（x(x-3)。(x)(x-3) とは書かない）
  const prod2 = (a, b, v) => { const f = t => (t === 0 ? v : `(${lin(1, -t, v)})`); return b === 0 ? f(b) + f(a) : f(a) + f(b); };
  // 左辺が「(1次式)^2」か「x^2」で、右辺が数（3-47 の形。展開せずに ±√ で解く）
  const sqForm = m => /^(-?\d*)(\(\d*[a-z][+-]\d+\)|[a-z])\^2([+-]\d+)?=(-?\d+)$/.test(String(m).replace(/\s/g, ''));
  // 分数 n/d（約分。整数なら整数）
  function fr(n, d) {
    d = d || 1;
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g;
    return d === 1 ? String(n) : `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
  }
  // s√d
  const rt = (s, d) => (d === 1 ? String(s) : `${s === 1 ? '' : s === -1 ? '-' : s}\\sqrt{${d}}`);
  // (n/m)√d を約分して書く
  function rtFr(n, m, d) {
    if (m < 0) { n = -n; m = -m; }
    const g = gcd(n, m) || 1; n /= g; m /= g;
    if (m === 1) return rt(n, d);
    return `${n < 0 ? '-' : ''}\\frac{${rt(Math.abs(n), d)}}{${m}}`;
  }
  // (n/m)√N（N の中の2乗も外に出す）
  const rtN = (n, m, N) => { const [s, d] = sqf(N); return rtFr(n * s, m, d); };
  // 数を文の中に書く（マイナスは式に）
  const ns = n => (n < 0 ? `$${n}$` : String(n));
  // 解の答え：[[分子, 分母], …] → $x=-3,\ \frac{1}{2}$（小さい順。同じ解は1つ）
  function sols(v, rs) {
    const u = [];
    rs.forEach(r => { r = r.length ? r : [r, 1]; if (!u.some(x => x[0] * r[1] === r[0] * x[1])) u.push(r); });
    u.sort((x, y) => x[0] / x[1] - y[0] / y[1]);
    return `$${v}=${u.map(r => fr(r[0], r[1])).join(',\\ ')}$`;
  }
  // 解の公式の答え（D は正で2乗の数でない）
  function formula(a, b, c, v) {
    const D = b * b - 4 * a * c;
    let [s, d] = sqf(D);
    let p = -b, q = 2 * a;
    if (q < 0) { p = -p; q = -q; }
    const g = gcd3(p, s, q); p /= g; s /= g; q /= g;
    const num = (p ? String(p) : '') + '\\pm' + rt(s, d);
    return `$${v}=${q === 1 ? num : `\\frac{${num}}{${q}}`}$`;
  }
  const KAINASHI = '《解|かい》なし';
  const SEC = '《秒後|びょう|ご》';

  // ---------------------------------------------------------------- 式を読む（fits と verify の部品）
  // q（ルビをとった文）の中の $…$ の式
  const segs = q => (String(q).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1).trim());
  // 1つの文字 v の式 src の係数 [a, b, c]（2次まで。3次以上や読めない式は null）
  function quadOf(src, v) {
    const f = x => M.evalMath(src, { [v]: x });
    const y = [0, 1, -1, 2, -3].map(f);
    if (y.some(z => z == null)) return null;
    const c = y[0], a = (y[1] + y[2]) / 2 - c, b = (y[1] - y[2]) / 2;
    if (Math.abs(4 * a + 2 * b + c - y[3]) > 1e-6 || Math.abs(9 * a - 3 * b + c - y[4]) > 1e-6) return null;
    return [a, b, c].map(z => (Math.abs(z - Math.round(z)) < 1e-9 ? Math.round(z) : z));
  }
  const allInt = co => co && co.every(Number.isInteger);
  // 方程式（不等式・欄のある式は除く）。文字が1つ。{ L, R, v, m }
  function eqRaw(q) {
    for (const m of segs(q)) {
      if (/[<>]|\\[lg]eqq|\\pm|\\square|□/.test(m)) continue;
      const k = m.split('=');
      if (k.length !== 2) continue;
      const vs = M.mathVars(m);
      if (vs.length !== 1) continue;
      return { L: k[0].trim(), R: k[1].trim(), v: vs[0], m };
    }
    return null;
  }
  // 2次方程式：L－R の係数 co をつける（1次の式「x=2」などはとばす）
  function eqInfo(q) {
    for (const m of segs(q)) {
      if (/[<>]|\\[lg]eqq|\\pm|\\square|□/.test(m)) continue;
      const k = m.split('=');
      if (k.length !== 2) continue;
      const vs = M.mathVars(m);
      if (vs.length !== 1) continue;
      const co = quadOf(`${k[0]}-(${k[1]})`, vs[0]);
      if (!co || !co[0]) continue;
      return { L: k[0].trim(), R: k[1].trim(), v: vs[0], m, co };
    }
    return null;
  }
  // 式だけの問題（因数分解・√ の計算）：{ src, vs, v, co, paren }
  function exprInfo(q) {
    const s = segs(q);
    if (s.length !== 1 || String(q).replace(/\$[^$]*\$/, '').replace(/[＝□\s]/g, '') !== '') return null;
    const m = s[0];
    if (/[=<>]/.test(m)) return null;
    const vs = M.mathVars(m);
    return { src: m, vs, v: vs[0], co: vs.length === 1 ? quadOf(m, vs[0]) : null, paren: /\(/.test(m) };
  }
  const disc = co => co[1] * co[1] - 4 * co[0] * co[2];
  // 答えの解を数にする：「$x=…$」→ [数…]、「解なし」→ []
  function rootsOfAns(a) {
    const t = M.plain(a);
    if (/解なし/.test(t)) return [];
    const m = /\$\s*[a-z]=([^$]*)\$/.exec(t);
    if (!m) return null;
    const out = [];
    m[1].split(/,\\ /).forEach(p => {
      if (p.includes('\\pm')) { out.push(M.evalMath(p.replace('\\pm', '+'))); out.push(M.evalMath(p.replace('\\pm', '-'))); } else out.push(M.evalMath(p));
    });
    return out;
  }
  // 解を方程式に入れて確かめる。n（解の数）を渡さなければ、2次式なら判別式の符号で決める
  function checkEq(q, a, n) {
    const e = eqRaw(M.plain(q));
    const rs = rootsOfAns(a);
    if (!e || !rs) return '方程式か解が読めない';
    if (rs.some(x => x == null)) return '解が読めない';
    const f = x => M.evalMath(e.L, { [e.v]: x }) - M.evalMath(e.R, { [e.v]: x });
    for (const x of rs) { const y = f(x); if (y == null || Math.abs(y) > 1e-9 * Math.max(1, Math.abs(x) ** 3)) return `${x} を入れても0にならない（${y}）`; }
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (near(rs[i], rs[j])) return '同じ解が2回';
    if (n == null) {
      const co = quadOf(`${e.L}-(${e.R})`, e.v);
      if (co && co[0]) { const D = disc(co); n = Math.abs(D) < 1e-9 ? 1 : D > 0 ? 2 : 0; }
    }
    if (n != null && rs.length !== n) return `解が ${rs.length}こ（${n}こ のはず）`;
    return true;
  }
  const vEq = (p, n) => { p.verify = () => checkEq(p.q, p.a, n); return p; };
  // 不等式の答え（「$1<x<3$」「$x<1,\ 3<x$」「$-1\leqq x\leqq2$」）が、truth(x) と同じ範囲か（細かい点と、はしの近くで）
  function inSet(a, x) {
    const ms = segs(M.plain(a));
    if (!ms.length) return null;
    return ms.flatMap(m => m.split(/,\\ /)).some(piece => {
      const tk = piece.split(/(<|>|\\leqq|\\geqq)/).map(s => s.trim());
      const vals = tk.filter((_, i) => i % 2 === 0).map(s => M.evalMath(s, { x, t: x }));
      if (vals.some(v => v == null)) throw new Error('よめない');
      for (let i = 1; i < tk.length; i += 2) {
        const u = vals[(i - 1) / 2], w = vals[(i + 1) / 2], op = tk[i];
        if (!(op === '<' ? u < w : op === '>' ? u > w : op === '\\leqq' ? u <= w + 1e-12 : u >= w - 1e-12)) return false;
      }
      return true;
    });
  }
  function checkIneq(a, truth, bounds) {
    try {
      const pts = [];
      for (let x = -15; x <= 15; x += 0.125) pts.push(x + 0.0371);
      (bounds || []).forEach(b => pts.push(b - 1e-6, b + 1e-6));
      for (const x of pts) if (inSet(a, x) !== truth(x)) return `x=${x} で答えの範囲と式の符号が合わない`;
      (bounds || []).filter(Number.isInteger).forEach(b => { if (inSet(a, b) !== truth(b)) throw new Error(`はし ${b} が合わない`); });
      return true;
    } catch (e) { return e.message; }
  }
  // 答えの中の数（$…$ ごと）
  const ansNums = a => segs(M.plain(a)).map(s => M.evalMath(s));

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(3).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 4 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  const noZeroRhs = e => e.R !== '0';
  const prodForm = L => {   // かけ算の形（x(x-2)、(x+1)(x-3)、-5(t-1)(t-3)）の因数の数
    const s = L.replace(/^-?\d*/, '');
    if (!/^[a-z]?(\([^()]+\)(\^2)?)+$/.test(s)) return 0;
    return (/^[a-z]/.test(s) ? 1 : 0) + (s.match(/\([^()]+\)(\^2)?/g) || []).reduce((n, t) => n + (t.endsWith('^2') ? 2 : 1), 0);
  };
  // 移項して x^2 の係数でわると、和と積の整数の組で因数分解できる（b≠0、c≠0）
  const monicInt = co => {
    if (!allInt(co) || co[1] % co[0] || co[2] % co[0]) return false;
    const b = co[1] / co[0], c = co[2] / co[0];
    return b !== 0 && c !== 0 && isSq(b * b - 4 * c);
  };
  // 方程式を解く問い（解の個数・届くかを聞く問いではない）
  const solveQ = q => !/個数|届|1つになる/.test(q);

  // ================================================================ 3-44
  M.add({
    id: '3-44', part: 4, chap: '3-9①', stars: 1,
    title: '$y=ax^2$ は $x$ が $k$ 《倍|ばい》なら $y$ は $k^2$ 《倍|ばい》',
    mark: '$y$ が $x$ の**2《乗|じょう》に《比例|ひ|れい》**していて、「$x$ を□《倍|ばい》にすると」と《聞|き》かれている。',
    futsu: ['$y=ax^2$ に $x=2$、$y=12$ を《入|い》れて $a=3$。', 'それから $x=6$ を《入|い》れて $y=3\\times6^2=108$。'],
    raku: ['$x$ が3《倍|ばい》なので、$y$ は $3^2=9$ 《倍|ばい》。', '$y=12\\times9=108$'],
    why: '$a(kx)^2=k^2\\times ax^2$。$k$ が2《回|かい》かけられるので $k^2$ 《倍|ばい》（3-9①）。',
    caution: '$y=ax^2+1$ のように《数|かず》がたしてあると、$k^2$ 《倍|ばい》にならない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '15mm',
    fits(q) { return /2乗に比例|y=ax\^2/.test(q); },
    steps: {
      // 何倍か・何になるか
      s1(r) {
        const k = r.int(2, 5);
        if (r.chance(0.25)) return { q: `$y=ax^2$ で $x$ が${k}《倍|ばい》なら、$y$ は □《倍|ばい》`, a: `$${k * k}$`, easy: `$${k}^2=${k * k}$` };
        const a = r.int(1, 5), x0 = r.int(1, 3), y0 = a * x0 * x0;
        return { q: `$y=ax^2$、$x=${x0}$ で $y=${y0}$。$x$ が${k}《倍|ばい》なら $y=□$`, a: `$${y0 * k * k}$`, easy: `$${y0}\\times${k}^2=${y0 * k * k}$` };
      },
      // 何倍かを自分で見つける（半分・マイナス）、比例定数
      s2(r) {
        const t = r.int(0, 3);
        const a = r.pick([1, 2, 3, 4, 5, -1, -2, -3]);
        if (t === 3) { const x0 = r.int(2, 5), y0 = a * x0 * x0; return { q: `$y=ax^2$、$x=${x0}$ で $y=${y0}$。$a=□$`, a: `$${a}$`, easy: `$${y0}\\div${x0}^2=${a}$` }; }
        if (t === 2) {   // 半分にする
          const x0 = r.pick([2, 4, 6]), y0 = a * x0 * x0;
          return { q: `$y=ax^2$、$x=${x0}$ で $y=${y0}$。$x=${x0 / 2}$ なら $y=□$`, a: `$${y0 / 4}$`, easy: `$${y0}\\div2^2=${y0 / 4}$` };
        }
        const x0 = r.int(1, 3), k = r.int(2, 4) * (t === 1 ? -1 : 1), y0 = a * x0 * x0;
        return { q: `$y=ax^2$、$x=${x0}$ で $y=${y0}$。$x=${k * x0}$ なら $y=□$`, a: `$${y0 * k * k}$`, easy: `$${y0}\\times${k < 0 ? `(${k})` : k}^2=${y0 * k * k}$` };
      },
      // 落ちる距離・止まるまでの距離・正方形の面積
      s3(r) {
        const t = r.int(0, 2), k = r.int(2, 4);
        if (t === 0) {
          const t0 = r.int(1, 2), d0 = 5 * t0 * t0;
          return { q: `《落|お》ちる《距離|きょ|り》は《時間|じ|かん》の2《乗|じょう》に《比例|ひ|れい》。${t0}《秒間|びょう|かん》で ${d0} m なら、${t0 * k}《秒間|びょう|かん》では □ m`, a: `$${d0 * k * k}$`, easy: `$${d0}\\times${k}^2=${d0 * k * k}$` };
        }
        if (t === 1) {
          const v0 = r.pick([20, 30]), d0 = r.pick([3, 4, 5, 6, 8]);
          const kk = v0 === 30 ? r.int(2, 3) : k;
          return { q: `《止|と》まるまでの《距離|きょ|り》は《速|はや》さの2《乗|じょう》に《比例|ひ|れい》。《時速|じ|そく》${v0} km で ${d0} m なら、${v0 * kk} km では □ m`, a: `$${d0 * kk * kk}$`, easy: `$${d0}\\times${kk}^2=${d0 * kk * kk}$` };
        }
        const s = r.int(2, 6), what = r.chance(0.5) ? '《正方形|せい|ほう|けい》の1《辺|ぺん》' : '《円|えん》の《半径|はん|けい》';
        return { q: `${what}を${s}《倍|ばい》にすると、《面積|めん|せき》は □《倍|ばい》`, a: `$${s * s}$`, easy: `$${s}^2=${s * s}$` };
      },
      // わな：数がたしてある・1次の比例
      trap(r) {
        const a = r.int(1, 3), x0 = r.int(1, 2), k = r.int(2, 3);
        if (r.chance(0.6)) {
          const c = r.int(1, 5), y0 = a * x0 * x0 + c, x1 = k * x0;
          return dest({ q: `$y=${a === 1 ? '' : a}x^2+${c}$、$x=${x0}$ で $y=${y0}$。$x$ が${k}《倍|ばい》なら $y=□$`, a: `$${a * x1 * x1 + c}$`, verify() { return ansNums(this.a)[0] === a * x1 * x1 + c && y0 === a * x0 * x0 + c ? true : 'ちがう'; } }, '3-44', `$+${c}$ があるので ${k * k}《倍|ばい》にならない。$${a === 1 ? '' : a + '\\times'}${x1}^2+${c}$ を《計算|けい|さん》`);
        }
        const b = r.int(2, 6);
        return dest({ q: `$y=${b}x$ で $x$ が${k}《倍|ばい》なら、$y$ は □《倍|ばい》`, a: `$${k}$`, verify() { return ansNums(this.a)[0] * b * x0 === b * k * x0 ? true : 'ちがう'; } }, '3-44', `$y=${b}x$ は《比例|ひ|れい》なので ${k}《倍|ばい》`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-45・3-46 の部品
  // 「y=…」の式（右辺）と文字
  function fnOf(q) {
    for (const m of segs(M.plain(q))) { const k = /^y=(.*)$/.exec(m); if (k && !/[a-z]/.test(k[1].replace(/[xt]/g, ''))) { const v = /t/.test(k[1]) ? 't' : 'x'; const co = quadOf(k[1], v); if (co) return { src: k[1], v, co }; } }
    return null;
  }
  function vtxCheck(q, a) {
    const F = fnOf(q); if (!F) return '式が読めない';
    const [A, B] = F.co, p = -B / (2 * A), qq = M.evalMath(F.src, { [F.v]: p });
    const m = /\((.+),\\ (.+)\)/.exec(segs(M.plain(a))[0] || '');
    if (!m) return '頂点が読めない';
    return near(M.evalMath(m[1]), p) && near(M.evalMath(m[2]), qq) ? true : `頂点は (${p}, ${qq})`;
  }
  // 範囲のない最大値・最小値：頂点の y と、上に開くか下に開くか
  function mmCheck(q, a) {
    const F = fnOf(q); if (!F) return '式が読めない';
    const [A, B] = F.co, p = -B / (2 * A), v = M.evalMath(F.src, { [F.v]: p }), t = M.plain(q);
    if ((/最小値/.test(t) && A < 0) || (/最大値/.test(t) && A > 0)) return '最大と最小がちがう';
    return near(ansNums(a)[0], v) ? true : `値は ${v}`;
  }
  // 範囲 lo≦x≦hi での最大と最小（はしと頂点）
  function maxMin(co, lo, hi) {
    const f = x => co[0] * x * x + co[1] * x + co[2];
    const xs = [lo, hi]; const p = -co[1] / (2 * co[0]); if (p > lo && p < hi) xs.push(p);
    const ys = xs.map(f);
    return [Math.max(...ys), Math.min(...ys)];
  }

  // ================================================================ 3-45
  M.add({
    id: '3-45', part: 4, chap: '3-9⑤⑥・3-8⑩', stars: 1,
    title: '《平方完成|へい|ほう|かん|せい》で《頂点|ちょう|てん》と《最大|さい|だい》・《最小|さい|しょう》',
    mark: '$y=x^2+bx+c$ の**《頂点|ちょう|てん》や《最大|さい|だい》・《最小|さい|しょう》**を《聞|き》かれている。$y=a(x-p)^2+q$ なら《頂点|ちょう|てん》は $(p,\\ q)$。',
    futsu: ['$x$ にいろいろな《数|かず》を《入|い》れて《表|ひょう》を《作|つく》り、', 'いちばん《小|ちい》さい $y$ をさがす。'],
    raku: ['$x^2-6x+5=(x-3)^2-9+5$', '$=(x-3)^2-4$', '《頂点|ちょう|てん》 $(3,\\ -4)$、《最小値|さい|しょう|ち》 $-4$'],
    why: '$(x-3)^2$ は0より《小|ちい》さくならないので、$x=3$ のときがいちばん《小|ちい》さい（3-9⑥）。',
    caution: '$x$ の《範囲|はん|い》があって、《頂点|ちょう|てん》がその《外|そと》なら、《両|りょう》はしを《見|み》る（わざ 3-46）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: { s1: '20mm', s2: '20mm', s3: '12mm', trap: '14mm' },
    fits(q) { return /頂点|最大値|最小値|いちばん高/.test(q) && !/\\[lg]eqq/.test(q) && /\^2/.test(q); },
    steps: {
      // x^2 の係数が1
      s1(r) {
        const p = r.intNot(-5, 5, v => v === 0), qq = r.int(-9, 9), co = [1, -2 * p, p * p + qq];
        const P = poly(co, 'x'), V = `(${lin(1, -p, 'x')})^2${qq ? term(qq, '', false) : ''}`;
        if (r.chance(0.6)) return { q: `$y=${P}$ の《頂点|ちょう|てん》は □`, a: `$(${p},\\ ${qq})$`, easy: `$${P}=${V}$`, verify() { return vtxCheck(this.q, this.a); } };
        return { q: `$y=${P}$ の《最小値|さい|しょう|ち》は □`, a: `$${qq}$`, easy: `$${P}=${V}$`, val: `$${P}$`, verify() { return mmCheck(this.q, this.a); } };
      },
      // x^2 の係数が1でない（先にくくる）。下に開くなら最大
      s2(r) {
        const a = r.pick([2, 3, -1, -2, -3]), p = r.intNot(-3, 3, v => v === 0), qq = r.int(-6, 9);
        const co = [a, -2 * a * p, a * p * p + qq], P = poly(co, 'x');
        const V = `${a === -1 ? '-' : a}(${lin(1, -p, 'x')})^2${qq ? term(qq, '', false) : ''}`;
        if (r.chance(0.5)) return { q: `$y=${P}$ の《頂点|ちょう|てん》は □`, a: `$(${p},\\ ${qq})$`, easy: `$${P}=${V}$`, verify() { return vtxCheck(this.q, this.a); } };
        const w = a > 0 ? '《最小値|さい|しょう|ち》' : '《最大値|さい|だい|ち》';
        return { q: `$y=${P}$ の${w}は □`, a: `$${qq}$`, easy: `$${P}=${V}$`, val: `$${P}$`, verify() { return mmCheck(this.q, this.a); } };
      },
      // 投げ上げ：いちばん高くなる時刻と高さ
      s3(r) {
        const v0 = r.pick([10, 20, 30, 40]), h0 = r.pick([0, 0, 5, 10, 15, 20, 25, 30]);
        const tt = v0 / 10, H = v0 * v0 / 20 + h0, P = poly([-5, v0, h0], 't');
        return {
          q: `《高|たか》さ $y=${P}$ が《最大|さい|だい》になるのは $t=□$ で、□ m`,
          a: `$${tt}$、$${H}$`, easy: `$${P}=-5(t-${tt})^2+${H}$`,
          verify() { const F = fnOf(this.q), c = F.co, t0 = -c[1] / (2 * c[0]); const n = ansNums(this.a); return near(n[0], t0) && near(n[1], M.evalMath(F.src, { t: t0 })) && c[0] < 0 ? true : 'ちがう'; },
        };
      },
      // わな：範囲があって、頂点が範囲の外（頂点の値は最小値ではない）
      trap(r) {
        const p = r.intNot(-3, 3, v => v === 0), qq = r.int(-5, 5), co = [1, -2 * p, p * p + qq];
        const lo = p > 0 ? p + r.int(1, 2) : p - r.int(3, 4), hi = lo + r.int(1, 2);
        const mn = maxMin(co, lo, hi)[1];
        return dest({ q: `$y=${poly(co, 'x')}$（$${lo}\\leqq x\\leqq${hi}$）の《最小値|さい|しょう|ち》は □`, a: `$${mn}$`, verify() { return mn !== qq ? rangeCheck(this.q, this.a) : '頂点の値と同じ'; } }, '3-45', `《頂点|ちょう|てん》 $x=${p}$ は《範囲|はん|い》の《外|そと》`);
      },
    },
  });

  // ================================================================ 3-46
  // 範囲つきの問いの検算：q の「y=…」と「lo≦x≦hi」から、最大と最小を計算してくらべる
  function rangeCheck(q, a) {
    const F = fnOf(q), t = M.plain(q);
    const m = /(-?\d+)\\leqq [xt]\\leqq ?(-?\d+)/.exec(t);
    if (!F || !m) return '式か範囲が読めない';
    const [mx, mn] = maxMin(F.co, +m[1], +m[2]), got = ansNums(a);
    const want = [];
    if (/最大値/.test(t)) want.push(mx);
    if (/最小値/.test(t)) want.push(mn);
    return want.length === got.length && want.every((w, i) => near(w, got[i])) ? true : `最大 ${mx}、最小 ${mn}`;
  }
  M.add({
    id: '3-46', part: 4, chap: '3-9⑦', stars: 1,
    title: '《範囲|はん|い》のある《最大|さい|だい》・《最小|さい|しょう》は《両|りょう》はしと《頂点|ちょう|てん》',
    mark: '《放物線|ほう|ぶつ|せん》の《式|しき》と、$x$ の**《範囲|はん|い》**（$-1\\leqq x\\leqq2$ など）がある。',
    futsu: ['$x=-1$、0、1、2 と《表|ひょう》を《作|つく》り、', 'グラフをかいて《調|しら》べる。'],
    raku: ['《頂点|ちょう|てん》 $x=0$ は《範囲|はん|い》の《中|なか》。', '《両|りょう》はし：$x=-1$ で1、$x=2$ で4', '《頂点|ちょう|てん》：$x=0$ で0', '→ 《最大値|さい|だい|ち》4、《最小値|さい|しょう|ち》0'],
    why: '《放物線|ほう|ぶつ|せん》は《頂点|ちょう|てん》で《向|む》きが《変|か》わる。だから、いちばん《大|おお》きい・《小|ちい》さいのは、はしか《頂点|ちょう|てん》（3-9⑦）。',
    caution: '《頂点|ちょう|てん》が《範囲|はん|い》の《外|そと》なら、《両|りょう》はしだけでよい。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '12mm',
    fits(q) { return /最大値|最小値/.test(q) && /\\leqq [a-z]\\leqq/.test(q) && /\^2/.test(q); },
    steps: {
      // y=ax^2 で、頂点 x=0 が範囲の中
      s1(r) {
        const a = r.pick([1, 1, 2, 3, -1, -2]), lo = r.int(-4, -1), hi = r.intNot(1, 4, v => v === -lo);
        const co = [a, 0, 0], [mx, mn] = maxMin(co, lo, hi), f = x => a * x * x;
        return { q: `$y=${poly(co, 'x')}$（$${lo}\\leqq x\\leqq${hi}$）の《最大値|さい|だい|ち》 □、《最小値|さい|しょう|ち》 □`, a: `$${mx}$、$${mn}$`,
          easy: `《両|りょう》はし ${ns(f(lo))} と ${ns(f(hi))}、《頂点|ちょう|てん》 0`, verify() { return rangeCheck(this.q, this.a); } };
      },
      // 頂点が (p, q) の放物線。範囲の中にあるときと、外にあるとき
      s2(r) {
        const a = r.pick([1, 1, -1, 2]), p = r.intNot(-3, 3, v => v === 0), qq = r.int(-5, 5), co = [a, -2 * a * p, a * p * p + qq];
        const inside = r.chance(0.6);
        const lo = inside ? p - r.int(1, 3) : (r.chance(0.5) ? p + 1 : p - 3), hi = inside ? p + r.int(1, 3) : lo + 2;
        if (inside && hi - p === p - lo) return null;
        const [mx, mn] = maxMin(co, lo, hi), f = x => co[0] * x * x + co[1] * x + co[2];
        return { q: `$y=${poly(co, 'x')}$（$${lo}\\leqq x\\leqq${hi}$）の《最大値|さい|だい|ち》 □、《最小値|さい|しょう|ち》 □`, a: `$${mx}$、$${mn}$`,
          easy: `《頂点|ちょう|てん》 $x=${p}$ は《範囲|はん|い》の${inside ? '《中|なか》' : '《外|そと》'}。はし ${ns(f(lo))} と ${ns(f(hi))}${inside ? `、《頂点|ちょう|てん》 ${ns(qq)}` : ''}`,
          verify() { return rangeCheck(this.q, this.a); } };
      },
      // 投げ上げの高さ（時刻の範囲つき）
      s3(r) {
        const v0 = r.pick([20, 30, 40]), T = v0 / 10, P = poly([-5, v0, 0], 't');
        const lo = r.int(0, T - 1), hi = r.intNot(T + 1, 2 * T, v => v === 2 * T - lo);
        const [mx, mn] = maxMin([-5, v0, 0], lo, hi);
        const f = t => -5 * t * t + v0 * t;
        return { q: `《高|たか》さ $y=${P}$（$${lo}\\leqq t\\leqq${hi}$）の《最大値|さい|だい|ち》 □ m、《最小値|さい|しょう|ち》 □ m`, a: `$${mx}$、$${mn}$`,
          easy: `《両|りょう》はし ${ns(f(lo))} と ${ns(f(hi))}、《頂点|ちょう|てん》 $t=${T}$ で ${f(T)}`, verify() { return rangeCheck(this.q, this.a); } };
      },
      // わな：はしが1つしかない範囲（どこまでも大きく・小さくなる）
      trap(r) {
        const p = r.intNot(-2, 2, v => v === 0), qq = r.int(-4, 4);
        if (r.chance(0.5)) {
          const co = [1, -2 * p, p * p + qq], lo = p + r.int(1, 3);
          return dest({ q: `$y=${poly(co, 'x')}$（$x\\geqq${lo}$）の《最大値|さい|だい|ち》は □`, a: 'ない', verify: () => true }, '3-46', '《右|みぎ》のはしがない。$x$ を《大|おお》きくすると $y$ はいくらでも《大|おお》きくなる');
        }
        const co = [-1, 2 * p, -p * p + qq], hi = p - r.int(1, 3);
        return dest({ q: `$y=${poly(co, 'x')}$（$x\\leqq${hi}$）の《最小値|さい|しょう|ち》は □`, a: 'ない', verify: () => true }, '3-46', '《左|ひだり》のはしがない。$y$ はいくらでも《小|ちい》さくなる');
      },
    },
  });

  // ================================================================ 3-47
  M.add({
    id: '3-47', part: 4, chap: '3-10②', stars: 1,
    title: '$x^2=k$ は $\\pm\\sqrt{k}$（かたまりでも）',
    mark: '《左辺|さ|へん》が**2《乗|じょう》だけ**、《右辺|う|へん》が《数|かず》（$x^2=5$、$(x-2)^2=9$）。',
    futsu: ['$(x-2)^2=9$ を《展開|てん|かい》して $x^2-4x-5=0$、', '《因数分解|いん|すう|ぶん|かい》して $(x+1)(x-5)=0$'],
    raku: ['$x-2$ をひとかたまりと《見|み》る。', '$x-2=\\pm3$', '$x=5,\\ -1$'],
    why: '2《乗|じょう》して $k$ になる《数|かず》は、$\\sqrt{k}$ と $-\\sqrt{k}$ の2つ（3-10②）。',
    caution: '$k$ がマイナスなら《解|かい》はない。$x^2+2x=3$ のように $x$ の《項|こう》があると、この《形|かたち》ではない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s3: 1 },
    boxw: '30mm',
    boxh: { s3: '12mm' },
    fits(q) {
      const e = eqRaw(q);
      if (!e || !solveQ(q)) return false;
      // A(…)^2+c=R の形。2乗が (R－c)÷A になるので、それがマイナスなら使えない（わな）
      const m = /^(-?\d*)(\(\d*[a-z][+-]\d+\)|[a-z])\^2([+-]\d+)?=(-?\d+)$/.exec(e.m.replace(/\s/g, ''));
      if (!m || (m[3] && e.R !== '0')) return false;
      const A = m[1] === '' ? 1 : m[1] === '-' ? -1 : +m[1];
      return (+m[4] - (+m[3] || 0)) / A >= 0;
    },
    steps: {
      // x^2=k、ax^2=b
      s1(r) {
        const v = r.pick(['x', 'x', 't']), t = r.int(0, 2);
        if (t === 0) { const s = r.int(1, 12); return vEq({ q: `$${v}^2=${s * s}$ □`, a: `$${v}=\\pm${s}$`, easy: `$${v}=\\pm\\sqrt{${s * s}}$`, easyCheck: false }); }
        const k = r.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 18, 20]), [s, d] = sqf(k);
        if (t === 1) return vEq({ q: `$${v}^2=${k}$ □`, a: `$${v}=\\pm${rt(s, d)}$`, easyCheck: false });
        const c = r.int(2, 5);
        return vEq({ q: `$${c}${v}^2=${c * k}$ □`, a: `$${v}=\\pm${rt(s, d)}$`, easy: `$${v}^2=${k}$`, easyCheck: false });
      },
      // (x-p)^2=k
      s2(r) {
        const p = r.intNot(-5, 5, v => v === 0), inner = lin(1, -p, 'x');
        if (r.chance(0.55)) {
          const s = r.int(1, 6);
          return vEq({ q: `$(${inner})^2=${s * s}$ □`, a: sols('x', [p + s, p - s]), easy: `$${inner}=\\pm${s}$`, easyCheck: false });
        }
        const k = r.pick([2, 3, 5, 6, 7, 8, 12]), [s, d] = sqf(k);
        return vEq({ q: `$(${inner})^2=${k}$ □`, a: `$x=${p}\\pm${rt(s, d)}$`, easy: `$${inner}=\\pm${rt(s, d)}$`, easyCheck: false });
      },
      // 落ちる時間・移項してから・(2x-1)^2・4x^2=9
      s3(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const s = r.int(1, 6), d = 5 * s * s;
          return { q: `《落|お》とした《物|もの》は $t$《秒間|びょう|かん》に $5t^2$ m《落|お》ちる。${d} m《落|お》ちるのは □${SEC}`, a: `$${s}$`, easy: `$5t^2=${d}$、$t^2=${s * s}$、$t>0$ なので $t=${s}$`, easyCheck: false, verify() { const t = ansNums(this.a)[0]; return t > 0 && 5 * t * t === d ? true : 'ちがう'; } };
        }
        if (t === 1) {
          const p = r.intNot(-4, 4, v => v === 0), k = r.pick([2, 3, 5, 7, 4, 9, 16]), [s, d] = sqf(k), inner = lin(1, -p, 'x');
          const a = d === 1 ? sols('x', [p + s, p - s]) : `$x=${p}\\pm${rt(s, d)}$`;
          return vEq({ q: `$(${inner})^2-${k}=0$ □`, a, easy: `$(${inner})^2=${k}$`, easyCheck: false });
        }
        if (t === 2) {
          const m = r.int(2, 3), n = r.intNot(-5, 5, v => v === 0 || gcd(v, m) !== 1), s = r.int(1, 5);
          return vEq({ q: `$(${lin(m, n, 'x')})^2=${s * s}$ □`, a: sols('x', [[s - n, m], [-s - n, m]]), easy: `$${lin(m, n, 'x')}=\\pm${s}$`, easyCheck: false });
        }
        const m = r.int(2, 5), n = r.intNot(1, 9, v => gcd(v, m) !== 1);
        return vEq({ q: `$${m * m}x^2=${n * n}$ □`, a: `$x=\\pm${fr(n, m)}$`, easy: `$x^2=${fr(n * n, m * m)}$`, easyCheck: false });
      },
      // わな：右辺がマイナス（解なし）・x の項がある
      trap(r) {
        if (r.chance(0.5)) {
          const k = r.int(1, 9);
          return vEq(dest({ q: `$x^2=-${k}$ □`, a: KAINASHI }, '3-47', '2《乗|じょう》してマイナスになる《数|かず》はない'));
        }
        const r1 = r.intNot(-6, 6, v => v === 0), r2 = r.intNot(-6, 6, v => v === 0 || v === r1 || v === -r1);
        const b = -(r1 + r2), c = r1 * r2;
        return vEq(dest({ q: `$${poly([1, b, 0], 'x')}=${-c}$ □`, a: sols('x', [r1, r2]) }, '3-47', `$x$ の《項|こう》がある。《右辺|う|へん》を0にして $${poly([1, b, c], 'x')}=0$`));
      },
    },
  });

  // ================================================================ 3-48
  M.add({
    id: '3-48', part: 4, chap: '3-10③', stars: 1,
    title: 'かけて0なら、どちらかが0',
    mark: '**かけ《算|ざん》＝0** の《形|かたち》（$x(x-2)=0$、$(x+1)(x-3)=0$）。',
    futsu: ['《展開|てん|かい》して $x^2-2x=0$ にしてから、', '《解|と》き《方|かた》を《考|かんが》える。'],
    raku: ['$x(x-2)=0$ なので', '$x=0$ または $x-2=0$', '$x=0,\\ 2$'],
    why: '0でない《数|かず》どうしをかけても0にならない。だから、どちらかが0（3-10③）。',
    caution: '$(x-1)(x-3)=3$ のように、《右辺|う|へん》が0でないときは《使|つか》えない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '30mm',
    boxh: { s2: '12mm' },
    fits(q) { const e = eqRaw(q); return !!e && e.R === '0' && prodForm(e.L.replace(/\s/g, '')) >= 2; },
    steps: {
      // (x-a)(x-b)=0、x(x-a)=0
      s1(r) {
        const v = r.pick(['x', 'x', 'x', 't']);
        const a = r.intNot(-9, 9, x => x === 0);
        if (r.chance(0.3)) return vEq({ q: `$${v}(${lin(1, -a, v)})=0$ □`, a: sols(v, [0, a]), easy: `$${v}=0$ または $${lin(1, -a, v)}=0$`, easyCheck: false });
        const b = r.intNot(-9, 9, x => x === 0 || x === a);
        const [p, q] = a < b ? [a, b] : [b, a];
        return vEq({ q: `$(${lin(1, -p, v)})(${lin(1, -q, v)})=0$ □`, a: sols(v, [p, q]), easy: `$${lin(1, -p, v)}=0$ または $${lin(1, -q, v)}=0$`, easyCheck: false });
      },
      // 係数のある因数（分数の解）
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const c = r.int(2, 5), a = r.intNot(-7, 7, x => x === 0);
          return vEq({ q: `$${c}x(${lin(1, -a, 'x')})=0$ □`, a: sols('x', [0, a]), easy: `$x=0$ または $${lin(1, -a, 'x')}=0$`, easyCheck: false });
        }
        const m = r.int(2, 5), n = r.intNot(-7, 7, x => x === 0 || gcd(x, m) !== 1), b = r.intNot(-6, 6, x => x === 0);
        if (t === 1) return vEq({ q: `$(${lin(m, n, 'x')})(${lin(1, -b, 'x')})=0$ □`, a: sols('x', [[-n, m], b]), easy: `$${lin(m, n, 'x')}=0$ または $${lin(1, -b, 'x')}=0$`, easyCheck: false });
        const m2 = r.int(2, 4), n2 = r.intNot(-5, 5, x => x === 0 || gcd(x, m2) !== 1 || x * m === n * m2);
        return vEq({ q: `$(${lin(m, n, 'x')})(${lin(m2, n2, 'x')})=0$ □`, a: sols('x', [[-n, m], [-n2, m2]]), easy: `$${lin(m, n, 'x')}=0$ または $${lin(m2, n2, 'x')}=0$`, easyCheck: false });
      },
      // 3つのかけ算・数がかかっている・同じ因数の2乗
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const xs = r.shuffle([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b);
          return vEq({ q: `$${xs.map(a => `(${lin(1, -a, 'x')})`).join('')}=0$ □`, a: sols('x', xs), easy: '3つのどれかが0', easyCheck: false }, 3);
        }
        if (t === 1) {
          const c = r.pick([-5, -3, -2, 2, 3, 5]), a = r.int(1, 4), b = r.intNot(1, 6, x => x === a);
          const [p, q] = a < b ? [a, b] : [b, a];
          return vEq({ q: `$${c}(${lin(1, -p, 't')})(${lin(1, -q, 't')})=0$ □`, a: sols('t', [p, q]), easy: `$${c}$ は0でない。$${lin(1, -p, 't')}=0$ または $${lin(1, -q, 't')}=0$`, easyCheck: false });
        }
        const a = r.intNot(-8, 8, x => x === 0);
        return vEq({ q: `$(${lin(1, -a, 'x')})^2=0$ □`, a: sols('x', [a]), easy: `$${lin(1, -a, 'x')}=0$ だけ`, easyCheck: false });
      },
      // わな：右辺が0でない（展開して右辺を0にする）
      trap(r) {
        for (let k = 0; k < 50; k++) {
          const a = r.int(-3, 5), b = r.int(a + 1, 7), s = a + b, r1 = r.int(-4, 8), r2 = s - r1, c = a * b - r1 * r2;
          if (!c || Math.abs(c) > 20 || r1 === r2 || [a, b].includes(r1) || [a, b].includes(r2)) continue;
          return vEq(dest({ q: `$${prod2(a, b, 'x')}=${c}$ □`, a: sols('x', [r1, r2]) }, '3-48', `《右辺|う|へん》が0でない。《展開|てん|かい》して $${poly([1, -s, r1 * r2], 'x')}=0$`));
        }
        return null;
      },
    },
  });

  // ================================================================ 3-49
  M.add({
    id: '3-49', part: 4, chap: '3-10④', stars: 1,
    title: 'たして$\\square$・かけて$\\square$の2《数|すう》で《因数分解|いん|すう|ぶん|かい》',
    mark: '$x^2+\\square x+\\square$ の《形|かたち》で、$x^2$ の**《係数|けい|すう》が1**。',
    futsu: ['$(x+a)(x+b)$ の $a$、$b$ に《数|かず》を《入|い》れて《展開|てん|かい》し、', '《合|あ》うまでためす。'],
    raku: ['$x^2-8x+12$：たして $-8$、かけて12', '→ $-2$ と $-6$', '$=(x-2)(x-6)$'],
    why: '$(x+a)(x+b)=x^2+(a+b)x+ab$ を、《右|みぎ》から《左|ひだり》へ《読|よ》む（3-10④）。',
    caution: 'たして・かけて《合|あ》う《整数|せい|すう》の《組|くみ》がなければ、《解|かい》の《公式|こう|しき》（わざ 3-57）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '30mm',
    fits(q) {
      const x = exprInfo(q);
      if (x) return !x.paren && allInt(x.co) && x.co[0] === 1 && monicInt(x.co);
      const e = eqInfo(q);
      return !!e && solveQ(q) && !/\(/.test(e.m) && monicInt(e.co);
    },
    steps: {
      // 2つの数が同じ符号
      s1(r) {
        const sg = r.chance(0.5) ? 1 : -1, a = r.int(1, 9) * sg, b = r.intNot(1, 9, x => x * sg === a) * sg;
        const [p, q] = Math.abs(a) < Math.abs(b) ? [a, b] : [b, a];
        return { q: `$${poly([1, p + q, p * q], 'x')}$`, a: `$(${lin(1, p, 'x')})(${lin(1, q, 'x')})$`, easy: `たして $${p + q}$、かけて $${p * q}$ → $${p}$ と $${q}$`, easyCheck: false };
      },
      // 符号がちがう（積がマイナス）・ほかの文字
      s2(r) {
        const v = r.pick(['x', 'x', 't', 'a']), a = r.int(1, 9), b = -r.intNot(1, 9, x => x === a);
        const [p, q] = r.chance(0.5) ? [a, b] : [b, a];
        if (p + q === 0) return null;
        return { q: `$${poly([1, p + q, p * q], v)}$`, a: `$(${lin(1, p, v)})(${lin(1, q, v)})$`, easy: `たして $${p + q}$、かけて $${p * q}$ → $${p}$ と $${q}$`, easyCheck: false };
      },
      // 方程式で・大きい数
      s3(r) {
        if (r.chance(0.5)) {
          const r1 = r.intNot(-9, 9, x => x === 0), r2 = r.intNot(-9, 9, x => x === 0 || x === r1 || x === -r1);
          return vEq({ q: `$${poly([1, -(r1 + r2), r1 * r2], 'x')}=0$ □`, a: sols('x', [r1, r2]), easy: `$(${lin(1, -r1, 'x')})(${lin(1, -r2, 'x')})=0$`, easyCheck: false });
        }
        const a = r.int(6, 12) * r.pick([1, -1]), b = r.intNot(6, 15, x => x === Math.abs(a)) * r.pick([1, -1]);
        if (a + b === 0) return null;
        const [p, q] = Math.abs(a) < Math.abs(b) ? [a, b] : [b, a];
        return { q: `$${poly([1, p + q, p * q], 'x')}$`, a: `$(${lin(1, p, 'x')})(${lin(1, q, 'x')})$`, easy: `たして $${p + q}$、かけて $${p * q}$ → $${p}$ と $${q}$`, easyCheck: false };
      },
      // わな：整数の組がない（解の公式へ）
      trap(r) {
        const b = r.intNot(-7, 7, x => x === 0), c = r.intNot(-9, 9, x => x === 0);
        const D = b * b - 4 * c;
        if (D <= 0 || isSq(D)) return null;
        return vEq(dest({ q: `$${poly([1, b, c], 'x')}=0$ □`, a: formula(1, b, c, 'x') }, '3-49', `たして ${ns(b)}、かけて ${ns(c)} の《整数|せい|すう》の《組|くみ》はない`));
      },
    },
  });

  // ================================================================ 3-50
  M.add({
    id: '3-50', part: 4, chap: '3-10④', stars: 1,
    title: '2《乗|じょう》ひく2《乗|じょう》は《和|わ》と《差|さ》に',
    mark: '$x$ の《項|こう》がなく、**2《乗|じょう》ひく2《乗|じょう》**（$x^2-9$、$4x^2-25$）。',
    futsu: ['$x^2+0x-9$ と《見|み》て、たして0、', 'かけて $-9$ の2つの《数|かず》をさがす。'],
    raku: ['$x^2-9=x^2-3^2$', '$=(x+3)(x-3)$'],
    why: '$(a+b)(a-b)=a^2-b^2$ を、《右|みぎ》から《左|ひだり》へ《読|よ》む（3-10④）。',
    caution: '$x^2+9$ のような2《乗|じょう》たす2《乗|じょう》は、《和|わ》と《差|さ》にできない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '30mm',
    boxh: { s3: '12mm' },
    fits(q) {
      const x = exprInfo(q);
      const sq2 = co => allInt(co) && co[1] === 0 && co[0] * co[2] < 0 && isSq(Math.abs(co[0])) && isSq(Math.abs(co[2]));
      if (x) {
        if (x.vs.length === 2) { const m = /^(\d*)([a-z])\^2-(\d*)([a-z])\^2$/.exec(x.src); return !!m && isSq(+(m[1] || 1)) && isSq(+(m[3] || 1)); }
        return !x.paren && sq2(x.co);
      }
      const e = eqInfo(q);
      return !!e && solveQ(q) && e.R === '0' && !/\(/.test(e.m) && sq2(e.co);
    },
    steps: {
      s1(r) { const v = r.pick(['x', 'x', 't']), n = r.int(1, 12); return { q: `$${v}^2-${n * n}$`, a: `$(${lin(1, n, v)})(${lin(1, -n, v)})$`, easy: `$${v}^2-${n}^2$`, easyCheck: false }; },
      // 係数が2乗・数が先・2つの文字
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) { const m = r.int(2, 5), n = r.intNot(1, 9, x => gcd(x, m) !== 1); return { q: `$${m * m}x^2-${n * n}$`, a: `$(${lin(m, n, 'x')})(${lin(m, -n, 'x')})$`, easy: `$(${m}x)^2-${n}^2$`, easyCheck: false }; }
        if (t === 1) { const n = r.int(2, 9); return { q: `$${n * n}-x^2$`, a: `$(${n}+x)(${n}-x)$`, easy: `$${n}^2-x^2$`, easyCheck: false }; }
        const n = r.int(2, 6); return { q: `$x^2-${n * n}y^2$`, a: `$(x+${n}y)(x-${n}y)$`, easy: `$x^2-(${n}y)^2$`, easyCheck: false };
      },
      // 方程式で
      s3(r) {
        if (r.chance(0.5)) { const n = r.int(1, 12); return vEq({ q: `$x^2-${n * n}=0$ □`, a: `$x=\\pm${n}$`, easy: `$(x+${n})(x-${n})=0$`, easyCheck: false }); }
        const m = r.int(2, 5), n = r.intNot(1, 9, x => gcd(x, m) !== 1);
        return vEq({ q: `$${m * m}x^2-${n * n}=0$ □`, a: `$x=\\pm${fr(n, m)}$`, easy: `$(${lin(m, n, 'x')})(${lin(m, -n, 'x')})=0$`, easyCheck: false });
      },
      // わな：2乗たす2乗（解なし）
      trap(r) {
        const n = r.int(1, 10);
        return vEq(dest({ q: `$x^2+${n * n}=0$ □`, a: KAINASHI }, '3-50', `2《乗|じょう》たす2《乗|じょう》は《和|わ》と《差|さ》にできない。$x^2=-${n * n}$`));
      },
    },
  });

  // ================================================================ 3-51
  M.add({
    id: '3-51', part: 4, chap: '3-10④・3-8⑩', stars: 1,
    title: '$x^2\\pm2px+p^2$ は $(x\\pm p)^2$',
    mark: '《数|かず》の《項|こう》が、$x$ の**《係数|けい|すう》の《半分|はん|ぶん》の2《乗|じょう》**（$x^2-6x+9$）。',
    futsu: ['たして $-6$、かけて9 の2つの《数|かず》を、', '《組|くみ》を《書|か》き《出|だ》してさがす。'],
    raku: ['$-6$ の《半分|はん|ぶん》は $-3$、$(-3)^2=9$', '$x^2-6x+9=(x-3)^2$'],
    why: '$(x-p)^2=x^2-2px+p^2$ を、《右|みぎ》から《左|ひだり》へ《読|よ》む（3-8⑩・3-10④）。',
    caution: '《数|かず》の《項|こう》が《半分|はん|ぶん》の2《乗|じょう》でなければ（$x^2-6x+8$）、ほかのわざで。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '26mm', s2: '26mm', s3: '14mm', trap: '30mm' },
    fits(q) {
      const ok = co => allInt(co) && co[0] > 0 && co[2] > 0 && co[1] !== 0 && isSq(co[0]) && isSq(co[2]) && co[1] * co[1] === 4 * co[0] * co[2];
      const x = exprInfo(q);
      if (x) return !x.paren && ok(x.co);
      if (/\(x[+-]□\)\^2/.test(q)) return true;
      const e = eqInfo(q);
      return !!e && solveQ(q) && e.R === '0' && !/\(/.test(e.m) && ok(e.co);
    },
    steps: {
      s1(r) { const v = r.pick(['x', 'x', 't']), p = r.intNot(-10, 10, x => x === 0); return { q: `$${poly([1, 2 * p, p * p], v)}$`, a: `$(${lin(1, p, v)})^2$`, easy: `${ns(2 * p)} の《半分|はん|ぶん》は ${ns(p)}、$${p < 0 ? `(${p})` : p}^2=${p * p}$`, easyCheck: false }; },
      // (mx±n)^2
      s2(r) {
        const m = r.int(2, 4), n = r.intNot(-5, 5, x => x === 0 || gcd(x, m) !== 1);
        // 数の項が先（$9-12x+4x^2=(3-2x)^2$）
        if (r.chance(0.3)) return { q: `$${n * n}${term(2 * m * n, 'x', false)}${term(m * m, 'x^2', false)}$`, a: `$(${Math.abs(n)}${n > 0 ? '+' : '-'}${m}x)^2$`, easy: `$${n * n}=${Math.abs(n)}^2$、$${m * m}x^2=(${m}x)^2$`, easyCheck: false };
        const nn = n < 0 ? `(${n})` : String(n);
        return { q: `$${poly([m * m, 2 * m * n, n * n], 'x')}$`, a: `$(${lin(m, n, 'x')})^2$`, easy: `$(${m}x)^2$ と $${nn}^2$、まん《中|なか》は $2\\times${m}x\\times${nn}$`, easyCheck: false };
      },
      // □をうめる・方程式で
      s3(r) {
        const p = r.intNot(-9, 9, x => x === 0);
        if (r.chance(0.5)) {
          return { q: `$x^2${term(2 * p, 'x', false)}+□=(x${p < 0 ? '-' : '+'}□)^2$`, a: `$${p * p}$、$${Math.abs(p)}$`, easy: `${ns(2 * p)} の《半分|はん|ぶん》は ${ns(p)}`, verify() { const [c, h] = ansNums(this.a); return h === Math.abs(p) && c === h * h ? true : 'ちがう'; } };
        }
        return vEq({ q: `$${poly([1, -2 * p, p * p], 'x')}=0$ □`, a: sols('x', [p]), easy: `$(${lin(1, -p, 'x')})^2=0$`, easyCheck: false });
      },
      // わな：数の項が半分の2乗でない（和と積で）
      trap(r) {
        const p = r.int(2, 6) * r.pick([1, -1]), d = r.int(1, Math.abs(p) - 1), r1 = p - d, r2 = p + d;
        return dest({ q: `$${poly([1, -2 * p, r1 * r2], 'x')}$`, a: `$(${lin(1, -r1, 'x')})(${lin(1, -r2, 'x')})$` }, '3-51', `${r1 * r2} は $(${-p})^2=${p * p}$ ではない`);
      },
    },
  });

  // ================================================================ 3-52
  M.add({
    id: '3-52', part: 4, chap: '3-10④', stars: 1,
    title: 'くくってから、もう《一度|いち|ど》《因数分解|いん|すう|ぶん|かい》',
    mark: '**どの《項|こう》も《同|おな》じ《数|かず》でわれる**2《次式|じ|しき》（$3x^2-3$、$12x^2-96x+144$）。',
    futsu: ['$12x^2-96x+144$ のまま、かけて144、', 'たして $-96$ … と《大|おお》きな《数|かず》でさがす。'],
    raku: ['$12x^2-96x+144=12(x^2-8x+12)$', '$=12(x-2)(x-6)$'],
    why: '《先|さき》にくくると、かっこの《中|なか》の《数|かず》が《小|ちい》さくなる（3-10④）。',
    caution: 'くくったあと、かっこの《中|なか》がもう《一度|いち|ど》《因数分解|いん|すう|ぶん|かい》できないか、かならず《見|み》る。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '34mm',
    fits(q) {
      const x = exprInfo(q);
      if (!x || x.paren || x.vs.length !== 1) return false;
      if (/\^3/.test(x.src)) return near(M.evalMath(x.src, { [x.v]: 0 }), 0);
      const co = x.co;
      return allInt(co) && (gcd3(...co) > 1 || co[0] < 0) && isSq(disc(co)) && disc(co) > 0;
    },
    steps: {
      // k(x-a)(x-b)、k(x^2-n^2)
      s1(r) {
        const k = r.pick([2, 3, 4, 5, 6, 10]);
        if (r.chance(0.3)) { const n = r.int(1, 5); return { q: `$${poly([k, 0, -k * n * n], 'x')}$`, a: `$${k}(x+${n})(x-${n})$`, easy: `$${k}(x^2-${n * n})$`, easyCheck: false }; }
        const a = r.intNot(-6, 6, x => x === 0), b = r.intNot(-6, 6, x => x === 0 || x === a || x === -a);
        const [p, q] = Math.abs(a) < Math.abs(b) ? [a, b] : [b, a];
        return { q: `$${poly([k, k * (p + q), k * p * q], 'x')}$`, a: `$${k}(${lin(1, p, 'x')})(${lin(1, q, 'x')})$`, easy: `$${k}(${poly([1, p + q, p * q], 'x')})$`, easyCheck: false };
      },
      // x^2 の係数がマイナス（－でくくる）
      s2(r) {
        const k = r.pick([-1, -1, -2, -3, -5]), a = r.intNot(-6, 6, x => x === 0), b = r.intNot(-6, 6, x => x === 0 || x === a || x === -a);
        const [p, q] = Math.abs(a) < Math.abs(b) ? [a, b] : [b, a];
        return { q: `$${poly([k, k * (p + q), k * p * q], 'x')}$`, a: `$${k === -1 ? '-' : k}(${lin(1, p, 'x')})(${lin(1, q, 'x')})$`, easy: `$${k === -1 ? '-' : k}(${poly([1, p + q, p * q], 'x')})$`, easyCheck: false };
      },
      // x でくくる（3次式）
      s3(r) {
        const k = r.pick([1, 1, 2, 3]);
        if (r.chance(0.4)) { const n = r.int(1, 5); return { q: `$${poly([k, 0, -k * n * n, 0], 'x')}$`, a: `$${k === 1 ? '' : k}x(x+${n})(x-${n})$`, easy: `$${k === 1 ? '' : k}x(x^2-${n * n})$`, easyCheck: false }; }
        const a = r.intNot(-5, 5, x => x === 0), b = r.intNot(-5, 5, x => x === 0 || x === a || x === -a);
        const [p, q] = Math.abs(a) < Math.abs(b) ? [a, b] : [b, a];
        return { q: `$${poly([k, k * (p + q), k * p * q, 0], 'x')}$`, a: `$${k === 1 ? '' : k}x(${lin(1, p, 'x')})(${lin(1, q, 'x')})$`, easy: `$${k === 1 ? '' : k}x(${poly([1, p + q, p * q], 'x')})$`, easyCheck: false };
      },
      // わな：くくれない（たすきがけへ）
      trap(r) {
        const m = r.pick([2, 3, 5]), n = r.intNot(-5, 5, x => x === 0 || gcd(x, m) !== 1), b = r.intNot(-5, 5, x => x === 0);
        const co = [m, m * b + n, n * b];
        if (!co[1]) return null;
        return dest({ q: `$${poly(co, 'x')}$`, a: `$(${lin(m, n, 'x')})(${lin(1, b, 'x')})$` }, '3-52', 'どの《項|こう》にも《共通|きょう|つう》な《数|かず》がない');
      },
    },
  });

  // ================================================================ 3-53
  M.add({
    id: '3-53', part: 4, chap: '3-10④の《先|さき》', stars: 2,
    title: 'たすきがけ',
    mark: '$x^2$ の**《係数|けい|すう》が1でなく**、《共通|きょう|つう》の《数|かず》でくくれない（$2x^2+5x-3$）。',
    futsu: ['$(2x+\\square)(x+\\square)$ の□に《数|かず》を《入|い》れて、', '1つずつ《全部|ぜん|ぶ》《展開|てん|かい》してためす。'],
    raku: ['$2=2\\times1$、$-3=(-1)\\times3$', 'ななめにかけてたす：$2\\times3+1\\times(-1)=5$', '$2x^2+5x-3=(2x-1)(x+3)$'],
    why: '$(ax+b)(cx+d)$ の $x$ の《係数|けい|すう》は $ad+bc$（3-8②）。ななめにかけてたすと、そこだけためせる。',
    caution: 'どの《項|こう》も《同|おな》じ《数|かず》でわれるなら、《先|さき》にくくる（わざ 3-52）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '32mm',
    boxh: { s3: '12mm' },
    fits(q) {
      const ok = co => allInt(co) && Math.abs(co[0]) !== 1 && co[1] !== 0 && gcd3(...co) === 1 && disc(co) > 0 && isSq(disc(co));
      const x = exprInfo(q);
      if (x) return !x.paren && ok(x.co);
      const e = eqInfo(q);
      return !!e && solveQ(q) && e.R === '0' && !/\(/.test(e.m) && ok(e.co);
    },
    steps: {
      // (px+q)(x+s)、p は 2・3・5
      s1(r) {
        const p = r.pick([2, 3, 5]), q = r.intNot(-5, 5, x => x === 0 || gcd(x, p) !== 1), s = r.intNot(-5, 5, x => x === 0);
        const co = [p, p * s + q, q * s];
        if (!co[1]) return null;
        return { q: `$${poly(co, 'x')}$`, a: `$(${lin(p, q, 'x')})(${lin(1, s, 'x')})$`, easy: `$${p}\\times${s < 0 ? `(${s})` : s}+1\\times${q < 0 ? `(${q})` : q}=${co[1]}$`, easyCheck: false };
      },
      // (px+q)(rx+s)、x^2 の係数 4・6 など（組み合わせが多い）
      s2(r) {
        const [p, rr] = r.pick([[2, 2], [2, 3], [3, 2], [2, 5], [3, 3]]);
        const q = r.intNot(-5, 5, x => x === 0 || gcd(x, p) !== 1), s = r.intNot(-5, 5, x => x === 0 || gcd(x, rr) !== 1);
        const co = [p * rr, p * s + q * rr, q * s];
        if (!co[1] || (p === rr && q === s)) return null;
        return { q: `$${poly(co, 'x')}$`, a: `$(${lin(p, q, 'x')})(${lin(rr, s, 'x')})$`, easy: `$${p}\\times${s < 0 ? `(${s})` : s}+${rr}\\times${q < 0 ? `(${q})` : q}=${co[1]}$`, easyCheck: false, key: [[p, q], [rr, s]].map(String).sort().join('|') };
      },
      // 方程式で（分数の解）
      s3(r) {
        const p = r.pick([2, 3, 4, 5]), q = r.intNot(-5, 5, x => x === 0 || gcd(x, p) !== 1), s = r.intNot(-5, 5, x => x === 0);
        const co = [p, p * s + q, q * s];
        if (!co[1]) return null;
        return vEq({ q: `$${poly(co, 'x')}=0$ □`, a: sols('x', [[-q, p], -s]), easy: `$(${lin(p, q, 'x')})(${lin(1, s, 'x')})=0$`, easyCheck: false });
      },
      // わな：共通な数でくくれる（先にくくる）
      trap(r) {
        const k = r.pick([2, 3]), s = r.intNot(-5, 5, x => x === 0), t = r.intNot(-5, 5, x => x === 0 || x === s || x === -s);
        const [p, q] = Math.abs(s) < Math.abs(t) ? [s, t] : [t, s];
        return dest({ q: `$${poly([k, k * (p + q), k * p * q], 'x')}$`, a: `$${k}(${lin(1, p, 'x')})(${lin(1, q, 'x')})$` }, '3-53', `どの《項|こう》も${k}でわれる。たすきがけはいらない`);
      },
    },
  });

  // ================================================================ 3-54
  M.add({
    id: '3-54', part: 4, chap: '3-10①⑤', stars: 1,
    title: '《右辺|う|へん》を0にして、《全体|ぜん|たい》を《同|おな》じ《数|かず》でわる',
    mark: '**《両辺|りょう|へん》に《項|こう》がある**、または、どの《項|こう》も**《同|おな》じ《数|かず》でわれる**2《次方程式|じ|ほう|てい|しき》。',
    futsu: ['$20t-5t^2=15$ のまま、', '$t$ にいろいろな《数|かず》を《入|い》れてためす。'],
    raku: ['《移項|い|こう》して $-5t^2+20t-15=0$', '$-5$ でわって $t^2-4t+3=0$', '$(t-1)(t-3)=0$、$t=1,\\ 3$'],
    why: '《右辺|う|へん》が0なら「かけて0」が《使|つか》える。わると《係数|けい|すう》が《小|ちい》さくなる（3-10①⑤）。',
    caution: '$x^2=3x$ を $x$ でわると、$x=0$ を《落|お》とす。$x$ でわらずに、$x(x-3)=0$。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s2: 1, s3: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '12mm', trap: '24mm' },
    fits(q) {
      const e = eqInfo(q);
      if (!e || !solveQ(q)) return false;
      const L = e.L.replace(/\s/g, '');
      if (/\(/.test(e.m)) return prodForm(L) >= 2 && noZeroRhs(e) && !/^-?\d*\([^()]+\)\^2$/.test(L);
      if (e.co[1] === 0) return false;   // x^2=k は 3-47
      return noZeroRhs(e) || (allInt(e.co) && gcd3(...e.co) > 1) || e.co[2] === 0;
    },
    steps: {
      // 数の項を右に置いた式・どの項も同じ数でわれる式（数の項がなければ、わってから x でくくる）
      s1(r) {
        const v = r.pick(['x', 'x', 't']);
        if (r.chance(0.3)) {
          const k = r.pick([2, 3, 4, 5, -2, -3, -5]), a = r.intNot(-8, 8, x => x === 0);
          return vEq({ q: `$${poly([k, -k * a, 0], v)}=0$ □`, a: sols(v, [0, a]), easy: `$${k}$ でわって $${poly([1, -a, 0], v)}=0$、$${v}(${lin(1, -a, v)})=0$`, easyCheck: false });
        }
        const k = r.pick([2, 3, 5, -1, -2, -5]), r1 = r.intNot(-6, 6, x => x === 0), r2 = r.intNot(-6, 6, x => x === 0 || x === r1 || x === -r1);
        const co = [k, -k * (r1 + r2), k * r1 * r2];
        return vEq({ q: `$${poly([co[0], co[1], 0], v)}=${-co[2]}$ □`, a: sols(v, [r1, r2]), easy: `$${poly([1, -(r1 + r2), r1 * r2], v)}=0$`, easyCheck: false });
      },
      // 両辺に x の項がある
      s2(r) {
        const r1 = r.intNot(-6, 6, x => x === 0), r2 = r.intNot(-6, 6, x => x === 0 || x === r1 || x === -r1);
        const k = r.pick([1, 1, 2, 3]), co = [k, -k * (r1 + r2), k * r1 * r2];
        const d = r.intNot(-5, 5, x => x === 0 || x === co[1]), e = r.intNot(-12, 12, x => x === co[2]);
        if (r.chance(0.3)) {   // ax^2=bx（数の項なし）
          const a = r.intNot(-7, 7, x => x === 0), c = r.int(1, 4);
          return vEq({ q: `$${c === 1 ? '' : c}x^2=${poly([c * a, 0], 'x')}$ □`, a: sols('x', [0, a]), easy: `$${poly([c, -c * a, 0], 'x')}=0$`, easyCheck: false });
        }
        return vEq({ q: `$${poly([co[0], co[1] + d, co[2] + e], 'x')}=${poly([d, e], 'x')}$ □`, a: sols('x', [r1, r2]), easy: `$${poly(co, 'x')}=0$`, easyCheck: false });
      },
      // 投げ上げ：高さが h m になる時刻（2つとも場面に合う）
      s3(r) {
        const [v0, t1, t2] = r.pick([[20, 1, 3], [30, 1, 5], [30, 2, 4], [40, 1, 7], [40, 2, 6], [40, 3, 5], [50, 1, 9], [50, 2, 8], [50, 3, 7], [50, 4, 6]]);
        const h = 5 * t1 * t2;
        return {
          q: `《高|たか》さ $${v0}t-5t^2$〔m〕が ${h} m になるのは □${SEC}と □${SEC}`,
          a: `$${t1}$、$${t2}$`, easy: `$t^2-${v0 / 5}t+${h / 5}=0$、$(t-${t1})(t-${t2})=0$`, easyCheck: false,
          verify() { const [u, w] = ansNums(this.a); return u < w && [u, w].every(t => v0 * t - 5 * t * t === h) ? true : 'ちがう'; },
        };
      },
      // わな：かっこの2乗＝数（展開せずに 3-47）
      trap(r) {
        const p = r.intNot(-5, 5, x => x === 0), s = r.int(2, 6), inner = lin(1, -p, 'x');
        return vEq(dest({ q: `$(${inner})^2=${s * s}$ □`, a: sols('x', [p + s, p - s]) }, '3-54', `《展開|てん|かい》して《右辺|う|へん》を0にするより、$${inner}=\\pm${s}$ が《早|はや》い`));
      },
    },
  });

  // ================================================================ 3-55
  M.add({
    id: '3-55', part: 4, chap: '3-10⑦', stars: 1,
    title: '$\\sqrt{\\phantom{2}}$ の《中|なか》の2《乗|じょう》を《外|そと》に《出|だ》す',
    mark: '$\\sqrt{12}$ の《中|なか》が、**4、9、16、25 … でわれる**。$\\sqrt{6}\\times\\sqrt{3}$ のようなかけ《算|ざん》も。',
    futsu: ['$\\sqrt{12}$ を《小数|しょう|すう》（3.464…）にして', 'そのまま《計算|けい|さん》する。'],
    raku: ['$12=4\\times3=2^2\\times3$', '$\\sqrt{12}=\\sqrt{4}\\times\\sqrt{3}=2\\sqrt{3}$'],
    why: '$\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}$ を《反対|はん|たい》に《使|つか》う。$\\sqrt{4}=2$ が《外|そと》に《出|で》る（3-10⑦）。',
    caution: '$\\sqrt{9+16}$ は $\\sqrt{9}+\\sqrt{16}$ ではない。《中|なか》を《先|さき》に《計算|けい|さん》する。',
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    boxw: '18mm',
    fits(q) {
      return segs(q).some(m => {
        if (/\\times/.test(m)) { const n = (m.match(/\\sqrt\{(\d+)\}/g) || []).map(t => +t.slice(6, -1)); if (n.length >= 2) return sqf(n.reduce((a, b) => a * b, 1))[0] > 1; }
        return (m.match(/\\sqrt\{(\d+)\}/g) || []).some(t => sqf(+t.slice(6, -1))[0] > 1);
      });
    },
    steps: {
      s1(r) { const s = r.int(2, 6), d = r.pick([2, 3, 5, 6, 7]); return { q: `$\\sqrt{${s * s * d}}$`, a: `$${rt(s, d)}$`, easy: `$\\sqrt{${s * s}\\times${d}}=${rt(s, d)}$` }; },
      // √a×√b
      s2(r) {
        const a = r.int(2, 15), b = r.intNot(2, 15, x => x === a);
        if (isSq(a) || isSq(b)) return null;
        const [s, d] = sqf(a * b);
        if (s === 1) return null;
        return { q: `$\\sqrt{${a}}\\times\\sqrt{${b}}$`, a: `$${rt(s, d)}$`, easy: `$\\sqrt{${a * b}}=${rt(s, d)}$`, key: [a, b].sort((x, y) => x - y).join('x') };
      },
      // 係数つき・大きな数
      s3(r) {
        if (r.chance(0.5)) { const c = r.int(2, 5), s = r.int(2, 3), d = r.pick([2, 3, 5]); return { q: `$${c}\\sqrt{${s * s * d}}$`, a: `$${rt(c * s, d)}$`, easy: `$${c}\\times${rt(s, d)}=${rt(c * s, d)}$` }; }
        const N = r.pick([48, 72, 75, 98, 108, 147, 200, 243, 300, 128, 162, 242]), [s, d] = sqf(N);
        return { q: `$\\sqrt{${N}}$`, a: `$${rt(s, d)}$`, easy: `$\\sqrt{${s * s}\\times${d}}=${rt(s, d)}$` };
      },
      // わな：中がたし算・2乗でわれない
      trap(r) {
        if (r.chance(0.5)) {
          const [a, b] = r.pick([[9, 16], [36, 64], [25, 144], [64, 36], [81, 144], [144, 256]]);
          return dest({ q: `$\\sqrt{${a}+${b}}$`, a: `$${Math.round(Math.sqrt(a + b))}$` }, '3-55', `$\\sqrt{${a}}+\\sqrt{${b}}$ ではない。《中|なか》を《先|さき》に`);
        }
        const N = r.pick([6, 10, 14, 15, 21, 22, 30, 33, 35]);
        return dest({ q: `$\\sqrt{${N}}$`, a: `$\\sqrt{${N}}$` }, '3-55', '4、9、25 … でわれない。このまま');
      },
    },
  });

  // ================================================================ 3-56
  M.add({
    id: '3-56', part: 4, chap: '3-10⑦', stars: 1,
    title: '《分母|ぶん|ぼ》の《有理化|ゆう|り|か》',
    mark: '**《分母|ぶん|ぼ》**に $\\sqrt{2}$ や $\\sqrt{3}$ がある（$\\frac{1}{\\sqrt{2}}$）。',
    futsu: ['$\\frac{1}{\\sqrt{2}}=1\\div1.414\\cdots$ を', 'わり《算|ざん》で《計算|けい|さん》する。'],
    raku: ['《分母|ぶん|ぼ》と《分子|ぶん|し》に $\\sqrt{2}$ をかける。', '$\\frac{1}{\\sqrt{2}}=\\frac{1\\times\\sqrt{2}}{\\sqrt{2}\\times\\sqrt{2}}=\\frac{\\sqrt{2}}{2}$'],
    why: '《分母|ぶん|ぼ》と《分子|ぶん|し》に《同|おな》じ《数|かず》をかけても、《大|おお》きさは《変|か》わらない。$\\sqrt{2}\\times\\sqrt{2}=2$（3-10⑦）。',
    caution: '$\\sqrt{9}=3$ のように《整数|せい|すう》になる $\\sqrt{\\phantom{2}}$ なら、《先|さき》に《整数|せい|すう》にする。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '18mm',
    boxh: '12mm',
    fits(q) {
      return segs(q).some(m => {
        if (/\\sqrt\{\\frac\{\d+\}\{\d+\}\}/.test(m)) return true;
        const re = /\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g;
        let k;
        while ((k = re.exec(m))) { const dn = /\\sqrt\{(\d+)\}/.exec(k[2]); if (dn && !isSq(+dn[1])) return true; }
        return false;
      });
    },
    steps: {
      // a/√n
      s1(r) {
        const n = r.pick([2, 3, 5, 6, 7, 10]), a = r.int(1, 12);
        return { q: `$\\frac{${a}}{\\sqrt{${n}}}$`, a: `$${rtFr(a, n, n)}$`, easy: `$\\frac{${a}\\times\\sqrt{${n}}}{\\sqrt{${n}}\\times\\sqrt{${n}}}=\\frac{${a === 1 ? '' : a}\\sqrt{${n}}}{${n}}$` };
      },
      // a/(b√n)・√a/√b・a/√(s^2 d)
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) { const n = r.pick([2, 3, 5, 6]), b = r.int(2, 3), a = r.int(1, 12); return { q: `$\\frac{${a}}{${b}\\sqrt{${n}}}$`, a: `$${rtFr(a, b * n, n)}$`, easy: `$\\frac{${a}\\sqrt{${n}}}{${b}\\times${n}}$` }; }
        if (t === 1) {
          const a = r.pick([2, 3, 5, 7]), b = r.pick([2, 3, 5, 7].filter(x => x !== a));
          return { q: `$\\frac{\\sqrt{${a}}}{\\sqrt{${b}}}$`, a: `$${rtN(1, b, a * b)}$`, easy: `$\\frac{\\sqrt{${a}}\\times\\sqrt{${b}}}{${b}}$` };
        }
        const s = r.int(2, 3), d = r.pick([2, 3, 5]), a = r.int(1, 12);
        return { q: `$\\frac{${a}}{\\sqrt{${s * s * d}}}$`, a: `$${rtFr(a, s * d, d)}$`, easy: `$\\frac{${a}}{${rt(s, d)}}$` };
      },
      // √(a/b)・小数の値
      s3(r) {
        if (r.chance(0.5)) {
          const b = r.pick([2, 3, 5, 7]), a = r.intNot(1, 6, x => x % b === 0 || x === b);
          return { q: `$\\sqrt{\\frac{${a}}{${b}}}$`, a: `$${rtN(1, b, a * b)}$`, easy: `$\\frac{\\sqrt{${a}}}{\\sqrt{${b}}}$` };
        }
        if (r.chance(0.5)) {
          const a = r.pick([1, 2, 3, 4, 5, 6, 8, 10]), v = a * 1414 / 2 / 1000;
          return { q: `$\\sqrt{2}=1.414$ として、$\\frac{${a}}{\\sqrt{2}}$ の《値|あたい》 □`, a: `$${v}$`, easy: `$\\frac{${a === 1 ? '' : a}\\sqrt{2}}{2}$`, easyCheck: false, verify() { return Math.abs(ansNums(this.a)[0] - a / Math.SQRT2) < 0.005 ? true : 'ちがう'; } };
        }
        const a = r.pick([3, 6, 9, 12, 15]), v = Math.round(a * 173 / 3) / 100;
        return { q: `$\\sqrt{3}=1.73$ として、$\\frac{${a}}{\\sqrt{3}}$ の《値|あたい》 □`, a: `$${v}$`, easy: `$${rtFr(a, 3, 3)}$`, easyCheck: false, verify() { return Math.abs(ansNums(this.a)[0] - a / Math.sqrt(3)) < 0.02 ? true : 'ちがう'; } };
      },
      // わな：分母の √ がはずれる
      trap(r) {
        const s = r.int(2, 5), a = r.intNot(1, 9, x => x === s);
        return dest({ q: `$\\frac{${a}}{\\sqrt{${s * s}}}$`, a: `$${fr(a, s)}$` }, '3-56', `$\\sqrt{${s * s}}=${s}$。《有理化|ゆう|り|か》はいらない`);
      },
    },
  });

  // ================================================================ 3-57
  M.add({
    id: '3-57', part: 4, chap: '3-10⑥⑧', stars: 1,
    title: '《因数分解|いん|すう|ぶん|かい》できなければ《解|かい》の《公式|こう|しき》',
    mark: 'たして・かけての《整数|せい|すう》の《組|くみ》が**《見|み》つからない**2《次方程式|じ|ほう|てい|しき》。',
    futsu: ['《整数|せい|すう》の《組|くみ》をさがしつづける。', 'または、《平方完成|へい|ほう|かん|せい》を1《行|ぎょう》ずつ《進|すす》める。'],
    raku: ['$2x^2+x-2=0$：$a=2$、$b=1$、$c=-2$', '$x=\\frac{-1\\pm\\sqrt{1+16}}{4}=\\frac{-1\\pm\\sqrt{17}}{4}$'],
    why: '《解|かい》の《公式|こう|しき》 $x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$ は、《平方完成|へい|ほう|かん|せい》の《手順|て|じゅん》をまとめたもの（3-10⑧）。',
    caution: '《因数分解|いん|すう|ぶん|かい》できるなら、そのほうが《早|はや》い（わざ 3-49）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '26mm',
    boxh: '12mm',
    fits(q) {
      const e = eqInfo(q);
      // (x-3)^2=12 は展開せずに ±√（わざ 3-47）。解の公式の目印にしない
      if (!e || !solveQ(q) || !allInt(e.co) || sqForm(e.m)) return false;
      const D = disc(e.co);
      return D > 0 && !isSq(D) && e.co[1] !== 0;
    },
    steps: {
      s1(r) {
        const b = r.intNot(-7, 7, x => x === 0), c = r.intNot(-9, 9, x => x === 0), D = b * b - 4 * c;
        if (D <= 0 || isSq(D)) return null;
        return vEq({ q: `$${poly([1, b, c], 'x')}=0$ □`, a: formula(1, b, c, 'x'), easy: `$x=\\frac{${-b}\\pm\\sqrt{${D}}}{2}$`, easyCheck: false });
      },
      // x^2 の係数が1でない
      s2(r) {
        const a = r.int(2, 5), b = r.intNot(-7, 7, x => x === 0), c = r.intNot(-6, 6, x => x === 0), D = b * b - 4 * a * c;
        if (D <= 0 || isSq(D) || gcd3(a, b, c) !== 1) return null;
        return vEq({ q: `$${poly([a, b, c], 'x')}=0$ □`, a: formula(a, b, c, 'x'), easy: `$x=\\frac{${-b}\\pm\\sqrt{${D}}}{${2 * a}}$`, easyCheck: false });
      },
      // 移項してから・かっこのある式
      s3(r) {
        const b = r.intNot(-5, 5, x => x === 0), c = r.intNot(-6, 6, x => x === 0), D = b * b - 4 * c;
        if (D <= 0 || isSq(D)) return null;
        const easy = `$${poly([1, b, c], 'x')}=0$`;
        if (r.chance(0.5)) return vEq({ q: `$x^2=${poly([-b, -c], 'x')}$ □`, a: formula(1, b, c, 'x'), easy, easyCheck: false });
        return vEq({ q: `$x(${lin(1, b, 'x')})=${-c}$ □`, a: formula(1, b, c, 'x'), easy, easyCheck: false });
      },
      // わな：因数分解できる（和と積で）
      trap(r) {
        const r1 = r.intNot(-6, 6, x => x === 0), r2 = r.intNot(-6, 6, x => x === 0 || x === r1 || x === -r1);
        return vEq(dest({ q: `$${poly([1, -(r1 + r2), r1 * r2], 'x')}=0$ □`, a: sols('x', [r1, r2]) }, '3-57', `$(${lin(1, -r1, 'x')})(${lin(1, -r2, 'x')})=0$ と《因数分解|いん|すう|ぶん|かい》できる`));
      },
    },
  });

  // ================================================================ 3-58
  M.add({
    id: '3-58', part: 4, chap: '3-10⑧の《先|さき》', stars: 2,
    title: "$b$ が《偶数|ぐう|すう》なら $b'$ の《公式|こう|しき》",
    mark: "$x$ の《係数|けい|すう》が**《偶数|ぐう|すう》**（$b=2b'$）の2《次方程式|じ|ほう|てい|しき》。",
    futsu: ['$x^2-6x+4=0$ に《解|かい》の《公式|こう|しき》を《使|つか》い、', '$x=\\frac{6\\pm\\sqrt{20}}{2}=\\frac{6\\pm2\\sqrt{5}}{2}$', 'から、さらに2で《約分|やく|ぶん》する。'],
    raku: ["$b'=-3$、$x=\\frac{-b'\\pm\\sqrt{{b'}^2-ac}}{a}$", '$x=3\\pm\\sqrt{9-4}=3\\pm\\sqrt{5}$'],
    why: "$b=2b'$ を《解|かい》の《公式|こう|しき》に《入|い》れると、2が《約分|やく|ぶん》で《消|き》える（3-10⑧の《先|さき》）。",
    caution: '$b$ が《奇数|き|すう》（$x^2+5x+1=0$）なら、ふつうの《解|かい》の《公式|こう|しき》で。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s3: 1 },
    boxw: '24mm',
    boxh: { s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) {
      const e = eqInfo(q);
      if (!e || !solveQ(q) || !allInt(e.co) || sqForm(e.m)) return false;
      const D = disc(e.co);
      return D > 0 && !isSq(D) && e.co[1] !== 0 && e.co[1] % 2 === 0;
    },
    steps: {
      s1(r) {
        const v = r.pick(['x', 'x', 't']), h = r.intNot(-5, 5, x => x === 0), c = r.intNot(-9, 9, x => x === 0), D = h * h - c;
        if (D <= 0 || isSq(D)) return null;
        return vEq({ q: `$${poly([1, 2 * h, c], v)}=0$ □`, a: formula(1, 2 * h, c, v), easy: `$b'=${h}$、$${v}=${-h}\\pm\\sqrt{${D}}$`, easyCheck: false });
      },
      // x^2 の係数が1でない
      s2(r) {
        const a = r.int(2, 5), h = r.intNot(-5, 5, x => x === 0), c = r.intNot(-6, 6, x => x === 0), D = h * h - a * c;
        if (D <= 0 || isSq(D) || gcd3(a, 2 * h, c) !== 1) return null;
        return vEq({ q: `$${poly([a, 2 * h, c], 'x')}=0$ □`, a: formula(a, 2 * h, c, 'x'), easy: `$b'=${h}$、$x=\\frac{${-h}\\pm\\sqrt{${D}}}{${a}}$`, easyCheck: false });
      },
      // 投げ上げの時刻・移項してから
      s3(r) {
        if (r.chance(0.5)) {
          const [v0, h] = r.pick([[20, 5], [20, 10], [30, 5], [30, 10], [30, 15], [30, 20], [30, 30], [30, 35], [40, 5], [40, 15], [40, 20], [40, 30], [40, 50]]);
          const b = -v0 / 5, c = h / 5;
          return vEq({ q: `$${v0}t-5t^2=${h}$（ボールの《高|たか》さが ${h} m の《時刻|じ|こく》） □`, a: formula(1, b, c, 't'), easy: `$${poly([1, b, c], 't')}=0$、$b'=${b / 2}$`, easyCheck: false });
        }
        const h = r.intNot(-5, 5, x => x === 0), c = r.intNot(-9, 9, x => x === 0), D = h * h - c;
        if (D <= 0 || isSq(D)) return null;
        return vEq({ q: `$x^2=${poly([-2 * h, -c], 'x')}$ □`, a: formula(1, 2 * h, c, 'x'), easy: `$${poly([1, 2 * h, c], 'x')}=0$、$b'=${h}$`, easyCheck: false });
      },
      // わな：b が奇数
      trap(r) {
        const a = r.int(1, 3), b = r.pick([-7, -5, -3, -1, 1, 3, 5, 7]), c = r.intNot(-5, 5, x => x === 0), D = b * b - 4 * a * c;
        if (D <= 0 || isSq(D) || gcd3(a, b, c) !== 1) return null;
        return vEq(dest({ q: `$${poly([a, b, c], 'x')}=0$ □`, a: formula(a, b, c, 'x') }, '3-58', `$b=${b}$ は《奇数|き|すう》`));
      },
    },
  });

  // ================================================================ 3-59
  // 解の個数の答え
  const KOSU = D => (D > 0 ? '2つ' : D === 0 ? '1つ' : 'ない');
  const cntCheck = (q, a) => { const e = eqInfo(M.plain(q)); if (!e) return '式が読めない'; const D = disc(e.co); return KOSU(Math.abs(D) < 1e-9 ? 0 : D) === a ? true : `D=${D}`; };
  M.add({
    id: '3-59', part: 4, chap: '3-10⑨', stars: 1,
    title: '《判別式|はん|べつ|しき》で《解|かい》の《個数|こ|すう》',
    mark: '「《解|かい》はいくつ」「その《高|たか》さに《届|とど》くか」と、**《解|かい》の《個数|こ|すう》**だけを《聞|き》かれている。',
    futsu: ['《解|かい》の《公式|こう|しき》で《解|かい》を《全部|ぜん|ぶ》《求|もと》めてから、', 'いくつあるか《数|かぞ》える。'],
    raku: ['$x^2+2x+3=0$：$D=2^2-4\\times1\\times3$', '$=4-12=-8<0$', '→ 《解|かい》はない'],
    why: '《解|かい》の《公式|こう|しき》の $\\sqrt{b^2-4ac}$ の《中|なか》が $D$。マイナスなら $\\sqrt{\\phantom{2}}$ がとれない（3-10⑨）。',
    caution: '《右辺|う|へん》が0でないときは、《先|さき》に0にしてから $D$ を《計算|けい|さん》する。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '22mm', trap: '14mm' },
    fits(q) { const e = eqRaw(q); if (e && e.R === '0' && prodForm(e.L.replace(/\s/g, '')) >= 2) return false; return /個数|届|1つになる/.test(q); },
    steps: {
      // x^2+bx+c=0
      s1(r) {
        const kind = r.int(0, 2);
        let b, c;
        if (kind === 1) { const p = r.intNot(-6, 6, x => x === 0); b = 2 * p; c = p * p; }
        else { b = r.int(-7, 7); c = r.intNot(-9, 12, x => x === 0); if (kind === 0 ? b * b - 4 * c <= 0 : b * b - 4 * c >= 0) return null; }
        const D = b * b - 4 * c;
        return { q: `$${poly([1, b, c], 'x')}=0$ の《解|かい》の《個数|こ|すう》 □`, a: KOSU(D), easy: `$D=${D}${D > 0 ? '>0' : D < 0 ? '<0' : ''}$`, easyCheck: false, verify() { return cntCheck(this.q, this.a); } };
      },
      // x^2 の係数が1でない
      s2(r) {
        const a = r.int(2, 5), kind = r.int(0, 2);
        let b, c;
        if (kind === 1) {   // (mx+n)^2 を展開した式
          const [m, n] = r.pick([[2, 1], [2, 3], [3, 1], [3, 2], [2, -1], [3, -1], [2, -3], [3, -2], [2, 5], [4, 1], [4, -3]]), co = [m * m, 2 * m * n, n * n];
          return { q: `$${poly(co, 'x')}=0$ の《解|かい》の《個数|こ|すう》 □`, a: '1つ', easy: `$D=${co[1] * co[1]}-${4 * co[0] * co[2]}=0$`, easyCheck: false, verify() { return cntCheck(this.q, this.a); } };
        }
        b = r.int(-7, 7); c = r.intNot(-6, 6, x => x === 0);
        const D = b * b - 4 * a * c;
        if (D === 0 || (kind === 0) !== (D > 0)) return null;
        return { q: `$${poly([a, b, c], 'x')}=0$ の《解|かい》の《個数|こ|すう》 □`, a: KOSU(D), easy: `$D=${b * b}${c < 0 ? '+' : '-'}${Math.abs(4 * a * c)}=${D}$`, easyCheck: false, verify() { return cntCheck(this.q, this.a); } };
      },
      // 投げ上げたボールがその高さに届くか・解が1つになる k
      s3(r) {
        if (r.chance(0.6)) {
          const v0 = r.pick([10, 20, 30]), H = r.pick([5, 10, 15, 20, 25, 30, 40, 45, 50, 60]);
          const D = v0 * v0 - 20 * H;
          return { q: `ボールを《真上|ま|うえ》に《秒速|びょう|そく》${v0} m で《投|な》げ《上|あ》げると、$t$《秒後|びょう|ご》の《高|たか》さは $${v0}t-5t^2$〔m〕。${H} m の《高|たか》さに《届|とど》くか □`,
            a: D >= 0 ? '《届|とど》く' : '《届|とど》かない', easy: `$5t^2-${v0}t+${H}=0$ の $D=${v0 * v0}-${20 * H}=${D}$`, easyCheck: false, verify() { return this.a.includes('かない') === (v0 * v0 / 20 < H) ? true : 'ちがう'; } };
        }
        const p = r.intNot(-6, 6, x => x === 0);
        return { q: `$x^2${term(2 * p, 'x', false)}+k=0$ の《解|かい》が1つになる $k$ □`, a: `$k=${p * p}$`, easy: `$D=${4 * p * p}-4k=0$`, easyCheck: false, verify() { const k = M.evalMath(segs(this.a)[0].split('=')[1]); return near((2 * p) ** 2 - 4 * k, 0) ? true : 'ちがう'; } };
      },
      // わな：かけ算＝0 の形（展開して D を計算しなくても、解が見える）
      trap(r) {
        const a = r.intNot(-6, 6, x => x === 0), b = r.chance(0.3) ? a : r.intNot(-6, 6, x => x === 0 || x === a);
        const L = a === b ? `(${lin(1, -a, 'x')})^2` : `(${lin(1, -a, 'x')})(${lin(1, -b, 'x')})`;
        return dest({ q: `$${L}=0$ の《解|かい》の《個数|こ|すう》 □`, a: a === b ? '1つ' : '2つ', verify() { return cntCheck(this.q, this.a); } }, '3-59', a === b ? `$x=${a}$ だけ。$D$ はいらない` : `$x=${a}$ と $x=${b}$。$D$ はいらない`);
      },
    },
  });

  // ================================================================ 3-92
  const rateV = (f, p, q) => function () { return near(ansNums(this.a)[0], (f(q) - f(p)) / (q - p)) ? true : 'ちがう'; };
  M.add({
    id: '3-92', part: 4, chap: '3-9④の《先|さき》', stars: 2,
    title: '$y=ax^2$ の《変化|へん|か》の《割合|わり|あい》は $a(p+q)$',
    mark: '$y=ax^2$ で、「$x$ が $p$ から $q$ まで《変|か》わるときの**《変化|へん|か》の《割合|わり|あい》**」。',
    futsu: ['$x=1$、$x=3$ の $y$ を《計算|けい|さん》して（5と45）、', '$\\frac{45-5}{3-1}=\\frac{40}{2}=20$'],
    raku: ['$a(p+q)=5\\times(1+3)$', '$=20$'],
    why: '$\\frac{aq^2-ap^2}{q-p}=\\frac{a(q+p)(q-p)}{q-p}=a(p+q)$（2《乗|じょう》ひく2《乗|じょう》、3-10④）。',
    caution: '$y=ax^2$ の《形|かたち》のときだけ。1《次関数|じ|かん|すう》や《反比例|はん|ぴ|れい》には《使|つか》えない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '12mm',
    fits(q) { return /変化の割合|平均の速さ/.test(q) && segs(q).some(m => /^y=-?(\d+|\\frac\{\d+\}\{\d+\})?[a-z]\^2$/.test(m)); },
    steps: {
      s1(r) {
        const a = r.int(1, 6), p = r.int(0, 4), q = r.int(p + 1, 6);
        return { q: `$y=${a === 1 ? '' : a}x^2$ で、$x$ が${p}から${q}まで《変|か》わるときの《変化|へん|か》の《割合|わり|あい》 □`, a: `$${a * (p + q)}$`, easy: `$${a}\\times(${p}+${q})=${a * (p + q)}$`, verify: rateV(x => a * x * x, p, q) };
      },
      // マイナス・分数の比例定数
      s2(r) {
        const t = r.int(0, 2);
        if (t === 2) {
          const p = r.int(-4, 3), q = r.intNot(p + 1, 6, x => (p + x) % 2 !== 0);
          return { q: `$y=\\frac{1}{2}x^2$ で、$x$ が${ns(p)}から${ns(q)}まで《変|か》わるときの《変化|へん|か》の《割合|わり|あい》 □`, a: `$${(p + q) / 2}$`, easy: `$\\frac{1}{2}\\times(${p}${q < 0 ? q : '+' + q})=${(p + q) / 2}$`, verify: rateV(x => x * x / 2, p, q) };
        }
        const a = t === 0 ? r.pick([-1, -2, -3, -4, -5]) : r.int(1, 5), p = r.int(-5, 2), q = r.intNot(p + 1, 5, x => x + p === 0);
        return { q: `$y=${a === 1 ? '' : a === -1 ? '-' : a}x^2$ で、$x$ が${ns(p)}から${ns(q)}まで《変|か》わるときの《変化|へん|か》の《割合|わり|あい》 □`, a: `$${a * (p + q)}$`, easy: `$${a < 0 ? `(${a})` : a}\\times(${p}${q < 0 ? q : '+' + q})=${a * (p + q)}$`, verify: rateV(x => a * x * x, p, q) };
      },
      // 平均の速さ（落ちるボール・坂を転がる球）
      s3(r) {
        const ball = r.chance(0.5), a = ball ? 5 : r.pick([1, 2, 3]), p = r.int(0, 4), q = r.int(p + 1, 6);
        const what = ball ? '《落|お》ちるボール $y=5t^2$〔m〕の、' : `《坂|さか》を《転|ころ》がる《球|たま》 $y=${a === 1 ? '' : a}t^2$〔m〕の、`;
        return { q: `${what}${p}〜${q}《秒|びょう》の《平均|へい|きん》の《速|はや》さ □ m/s`, a: `$${a * (p + q)}$`, easy: `$${a}\\times(${p}+${q})=${a * (p + q)}$`, verify: rateV(x => a * x * x, p, q) };
      },
      // わな：1次関数・反比例
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.intNot(-5, 5, x => x === 0), b = r.int(1, 9), p = r.int(0, 3), q = r.int(p + 1, 6);
          return dest({ q: `$y=${poly([a, b], 'x')}$ で、$x$ が${p}から${q}まで《変|か》わるときの《変化|へん|か》の《割合|わり|あい》 □`, a: `$${a}$`, verify: rateV(x => a * x + b, p, q) }, '3-92', `1《次関数|じ|かん|すう》なので、《変化|へん|か》の《割合|わり|あい》は《傾|かたむ》き ${ns(a)}`);
        }
        const [p, q] = r.pick([[1, 2], [1, 3], [2, 3], [2, 4], [1, 4], [3, 4], [2, 6], [3, 6]]), a = p * q * r.int(1, 3);
        return dest({ q: `$y=\\frac{${a}}{x}$ で、$x$ が${p}から${q}まで《変|か》わるときの《変化|へん|か》の《割合|わり|あい》 □`, a: `$${-a / (p * q)}$`, verify: rateV(x => a / x, p, q) }, '3-92', `《反比例|はん|ぴ|れい》。$-\\frac{${a}}{${p}\\times${q}}$（わざ 3-27）`);
      },
    },
  });

  // ================================================================ 3-93
  // (x-a)(x-b) の符号の答え（k は x^2 の係数の符号、op は <・>・≦・≧）。外側の2つは「または」でつなぐ（3-48 と同じ）
  function ineqAns(v, a, b, k, op) {
    const le = op === '\\leqq' || op === '\\geqq';
    const neg = (op === '<' || op === '\\leqq') === (k > 0);   // あいだ
    const L = le ? '\\leqq ' : '<';
    return neg ? `$${a}${L}${v}${L}${b}$` : `$${v}${L}${a}$ または $${b}${L}${v}$`;
  }
  const opTeX = op => (op === '<' || op === '>' ? op : op + ' ');
  const truthOf =(co, op) => x => { const y = co[0] * x * x + co[1] * x + co[2]; return op === '<' ? y < 0 : op === '>' ? y > 0 : op === '\\leqq' ? y <= 1e-12 : y >= -1e-12; };
  M.add({
    id: '3-93', part: 4, chap: '3-10⑩', stars: 1,
    title: '2《次不等式|じ|ふ|とう|しき》は《符号|ふ|ごう》の《表|ひょう》',
    mark: '$(x-1)(x-3)<0$ のように、**かけ《算|ざん》と0をくらべる**《不等式|ふ|とう|しき》。',
    futsu: ['$x$ にいろいろな《数|かず》を《入|い》れて、', 'プラスかマイナスかを1つずつためす。'],
    raku: ['《符号|ふ|ごう》の《表|ひょう》：$x<1$ で $(-)\\times(-)=+$', '$1<x<3$ で $(+)\\times(-)=-$、$x>3$ で $+$', '→ $1<x<3$'],
    why: 'かけ《算|ざん》の《符号|ふ|ごう》は、それぞれの《符号|ふ|ごう》で《決|き》まる。《符号|ふ|ごう》が《変|か》わるのは0になる《所|ところ》だけ（3-10⑩）。',
    caution: '$x^2+4$ のように、いつもプラスで0にならない《式|しき》は、《表|ひょう》がいらない。《右辺|う|へん》が0でなければ、《先|さき》に0にする。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: { s1: '40mm', s2: '40mm', s3: '22mm', trap: '30mm' },
    cols: { s3: 1 },
    // 2次式と0をくらべていて、2次式が0になる所が2つある（符号の表が作れる）
    fits(q) {
      if (/より(高|低)い/.test(q)) return true;
      return segs(q).some(m => {
        const k = m.split(/<|>|\\leqq|\\geqq/);
        if (k.length !== 2 || k[1].trim() !== '0') return false;
        const vs = M.mathVars(k[0]);
        if (vs.length !== 1) return false;
        const co = quadOf(k[0], vs[0]);
        return !!co && co[0] !== 0 && disc(co) > 0;
      });
    },
    steps: {
      // (x-a)(x-b) と0
      s1(r) {
        const a = r.int(-6, 5), b = r.int(a + 1, 7), op = r.pick(['<', '>', '<', '>', '\\leqq', '\\geqq']);
        const co = [1, -(a + b), a * b], ans = ineqAns('x', a, b, 1, op);
        return { q: `$${prod2(a, b, 'x')}${opTeX(op)}0$ □`, a: ans, easy: `《符号|ふ|ごう》が《変|か》わるのは $x=${a}$ と $x=${b}$`, easyCheck: false, verify() { return checkIneq(this.a, truthOf(co, op), [a, b]); } };
      },
      // 展開した形・x^2 の係数がマイナス
      s2(r) {
        const a = r.int(-6, 5), b = r.int(a + 1, 7), k = r.pick([1, 1, -1]), op = r.pick(['<', '>', '\\leqq', '\\geqq']);
        const co = [k, -k * (a + b), k * a * b], ans = ineqAns('x', a, b, k, op);
        return { q: `$${poly(co, 'x')}${opTeX(op)}0$ □`, a: ans, easy: `$${k < 0 ? '-' : ''}${prod2(a, b, 'x')}${opTeX(op)}0$`, easyCheck: false, verify() { return checkIneq(this.a, truthOf(co, op), [a, b]); } };
      },
      // 投げ上げ：その高さより高い時刻
      s3(r) {
        const [v0, t1, t2] = r.pick([[20, 1, 3], [30, 1, 5], [30, 2, 4], [40, 1, 7], [40, 2, 6], [40, 3, 5], [50, 1, 9], [50, 2, 8], [50, 4, 6]]);
        const h = 5 * t1 * t2, ans = `$${t1}<t<${t2}$`;
        return { q: `ボールの《高|たか》さが $y=${v0}t-5t^2$〔m〕のとき、《高|たか》さが ${h} m より《高|たか》い《時刻|じ|こく》 $t$ の《範囲|はん|い》は □`, a: ans,
          easy: `$-5${prod2(t1, t2, 't')}>0$`, easyCheck: false, verify() { return checkIneq(this.a, x => v0 * x - 5 * x * x > h, [t1, t2]); } };
      },
      // わな：いつもプラスの式（0になる所がなく、符号の表がいらない）。答えは「すべての x」か「解なし」
      trap(r) {
        const op = r.pick(['<', '>', '\\leqq', '\\geqq']), c = r.int(1, 9);
        let L, co;
        if (r.chance(0.5)) { L = `x^2+${c}`; co = [1, 0, c]; }
        else { const p = r.intNot(-5, 5, x => x === 0); L = `(${lin(1, -p, 'x')})^2+${c}`; co = [1, -2 * p, p * p + c]; }
        const all = op === '>' || op === '\\geqq';
        return dest({ q: `$${L}${opTeX(op)}0$ □`, a: all ? 'すべての $x$' : KAINASHI,
          verify() { const t = truthOf(co, op); for (let x = -15; x <= 15; x += 0.125) if (t(x + 0.0371) !== all) return `x=${x} で合わない`; return true; } },
        '3-93', `$${L}$ はいつもプラス。《符号|ふ|ごう》の《表|ひょう》はいらない`);
      },
    },
  });

  // ================================================================ 3-94
  M.add({
    id: '3-94', part: 4, chap: '3-10⑦の《先|さき》', stars: 2,
    title: '《同|おな》じ $\\sqrt{\\phantom{2}}$ はまとめる',
    mark: '$\\sqrt{12}+\\sqrt{27}$ のような《和|わ》・《差|さ》。《中|なか》を《小|ちい》さくすると、**《中|なか》が《同|おな》じ《数|かず》**になる。',
    futsu: ['$\\sqrt{12}=3.464\\cdots$、$\\sqrt{27}=5.196\\cdots$ と', '《小数|しょう|すう》にしてたす。'],
    raku: ['$\\sqrt{12}=2\\sqrt{3}$、$\\sqrt{27}=3\\sqrt{3}$', '$2\\sqrt{3}+3\\sqrt{3}=5\\sqrt{3}$'],
    why: '$\\sqrt{3}$ を1つの《文字|も|じ》と《見|み》れば、$2a+3a=5a$ と《同|おな》じ（2-11）。',
    caution: '$\\sqrt{2}+\\sqrt{3}$ は $\\sqrt{5}$ ではない。《中|なか》がちがえば、まとめられない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '26mm' },
    boxh: { s3: '12mm' },
    fits(q) {
      return segs(q).some(m => {
        if (/\\times/.test(m) || !/[+-]/.test(m.replace(/^-/, ''))) return false;
        const ds = (m.match(/\\sqrt\{(\d+)\}/g) || []).map(t => sqf(+t.slice(6, -1))[1]).filter(d => d > 1);
        return ds.some((d, i) => ds.indexOf(d) !== i);
      });
    },
    steps: {
      // √(a^2 d) ± √(b^2 d)
      s1(r) {
        const d = r.pick([2, 3, 5, 6, 7]), a = r.int(1, 4), b = r.intNot(1, 5, x => x === a || (a === 1 && x === 1)), sg = r.chance(0.65) ? 1 : -1;
        if (a === 1 && b === 1) return null;
        const c = a + sg * b;
        if (!c) return null;
        return { q: `$\\sqrt{${a * a * d}}${sg > 0 ? '+' : '-'}\\sqrt{${b * b * d}}$`, a: `$${rt(c, d)}$`, easy: `$${rt(a, d)}${sg > 0 ? '+' : '-'}${rt(b, d)}=${rt(c, d)}$`, key: sg > 0 ? `+${d}:${[a, b].sort().join(',')}` : undefined };
      },
      // 3つの項・係数つき
      s2(r) {
        const d = r.pick([2, 3, 5]), ks = [r.int(1, 4), r.int(1, 4), r.int(1, 4)], sg = [1, r.pick([1, -1]), r.pick([1, -1])];
        if (new Set(ks).size < 3) return null;
        const c = ks.reduce((s, k, i) => s + sg[i] * k, 0);
        if (!c) return null;
        const Q = ks.map((k, i) => `${i === 0 ? '' : sg[i] > 0 ? '+' : '-'}\\sqrt{${k * k * d}}`).join('');
        return { q: `$${Q}$`, a: `$${rt(c, d)}$`, easy: `$${ks.map((k, i) => `${i === 0 ? '' : sg[i] > 0 ? '+' : '-'}${rt(k, d)}`).join('')}=${rt(c, d)}$` };
      },
      // 分母に √ のある項とまとめる
      s3(r) {
        const d = r.pick([2, 3, 5]), a = r.int(1, 4), c = r.int(1, 3) * (r.chance(0.5) ? d : 1), sg = r.chance(0.6) ? 1 : -1;
        if (a === 1 && c === 1) return null;
        const N = a * d + sg * c;
        if (!N) return null;
        return { q: `$\\sqrt{${a * a * d}}${sg > 0 ? '+' : '-'}\\frac{${c}}{\\sqrt{${d}}}$`, a: `$${rtFr(N, d, d)}$`, easy: `$${rt(a, d)}${sg > 0 ? '+' : '-'}${rtFr(c, d, d)}$` };
      },
      // わな：中が同じ数にならない
      trap(r) {
        const [d1, d2] = r.shuffle([2, 3, 5]).slice(0, 2), a = r.int(1, 3), b = r.int(1, 3);
        return dest({ q: `$\\sqrt{${a * a * d1}}+\\sqrt{${b * b * d2}}$`, a: `$${rt(a, d1)}+${rt(b, d2)}$` }, '3-94', `《中|なか》が ${d1} と ${d2} でちがう。これ《以上|い|じょう》まとめられない`);
      },
    },
  });
})(globalThis.MONDAI);
