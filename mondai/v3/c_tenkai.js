/* 問題集 第3巻　第3部 展開と恒等式・平方完成（わざ 3-28〜3-43、3-95・3-96）　組 c
 * 書き方は v1/README.md と v2/README.md（第2・3巻）。文はルビつき・分かち書きなし、式は $…$。
 * 答えが式1つ（$x^2+6x+9$ など）のときは、check.js が文字に値を入れて、問題の式・楽な形と同じ値か確かめる。
 * 問題の文が式だけでないとき（「くくる：…」「平方完成：…」）や、答えが式でないとき（$p=4$、$q=4$）は verify で確かめる。
 * 第29回：わなは、同じ部のほかのわざで楽にならないものにする。当たるときは楽な形に行き先を書き、also に入れる（dest）。
 *   入れかえただけの問題（$(x+3)(x-5)$ と $(x-5)(x+3)$、$103\times97$ と $97\times103$）には key をつける（H-6）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 式を書く部品
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // 分数 [分子, 分母]（約分して、分母はプラス）
  const Q = (n, d) => { d = d || 1; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const qAdd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
  const qSub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
  const qMul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
  const qTeX = x => (x[1] === 1 ? String(Math.abs(x[0])) : `\\frac{${Math.abs(x[0])}}{${x[1]}}`);   // 絶対値
  // 項の列 [[係数, 文字の部分], …] を式に。係数は数か分数 [n, d]。0 の項は書かない。文字があれば係数の 1 は書かない
  function T(list) {
    let s = '';
    for (const [c0, m] of list) {
      const c = Array.isArray(c0) ? c0 : [c0, 1];
      if (!c[0]) continue;
      const one = Math.abs(c[0]) === 1 && c[1] === 1;
      const body = (one && m) ? m : qTeX(c) + m;
      s += c[0] < 0 ? '-' + body : (s ? '+' : '') + body;
    }
    return s || '0';
  }
  // 係数の配列（高い次数から）：[2, -5, -3] → 2x^2-5x-3
  const poly = (cs, v) => { v = v || 'x'; return T(cs.map((c, i) => { const d = cs.length - 1 - i; return [c, d === 0 ? '' : d === 1 ? v : `${v}^${d}`]; })); };
  const lin = (a, b, v) => T([[a, v || 'x'], [b, '']]);          // 2x+1
  const linC = (a, b, v) => T([[b, ''], [a, v || 'x']]);         // 3-2x（数が先）
  const sg = n => (n < 0 ? String(n) : '+' + n);                  // +3、-3
  const pn = n => (n < 0 ? `(${n})` : String(n));                 // (-3)、3
  // 多項式（係数の配列、低い次数から）のかけ算
  const pmul = (a, b) => { const r = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; })); return r; };
  const hi = lo => lo.slice().reverse();                          // 低い次数から → 高い次数から
  // 小数：n ÷ 10^s を文字に（1.1025、0.9996）
  function D(n, s) {
    const neg = n < 0; let t = String(Math.abs(n)).padStart(s + 1, '0');
    let r = s ? t.slice(0, t.length - s) + '.' + t.slice(t.length - s) : t;
    if (s) r = r.replace(/0+$/, '').replace(/\.$/, '');
    return (neg ? '-' : '') + r;
  }
  const key2 = (tag, x, y) => tag + [String(x), String(y)].sort().join('|');

  // ---------------------------------------------------------------- 検算の部品
  const VALS = [0.37, 1.71, -2.29, 2.93];
  const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  // 2つの式（$ のない TeX）が、文字にどんな値を入れても等しいか
  function same(e1, e2) {
    const names = [...new Set([e1, e2].flatMap(M.mathVars))];
    for (let k = 0; k < VALS.length; k++) {
      const vs = Object.fromEntries(names.map((n, j) => [n, VALS[k] + 0.41 * j]));
      const a = M.evalMath(e1, vs), b = M.evalMath(e2, vs);
      if (a == null || b == null) return `式が読めない「${e1}」「${e2}」`;
      if (!near(a, b)) return `「${e1}」と「${e2}」がちがう`;
    }
    return true;
  }
  const ev = (e, vs) => M.evalMath(e, vs || {});
  // 1つでも合わない値をさがす（恒等式か）。合わない値の組と、そのときの左右の値。どれも合えば null
  function diffAt(l, r) {
    const names = [...new Set([l, r].flatMap(M.mathVars))];
    const tries = [1, 0, 2, -1, 3];
    const cand = names.length === 1 ? tries.map(v => ({ [names[0]]: v }))
      : [Object.fromEntries(names.map(n => [n, 1])), Object.fromEntries(names.map((n, j) => [n, j + 1])), Object.fromEntries(names.map((n, j) => [n, 2 - j]))];
    const ok = [];
    for (const vs of cand) {
      const a = ev(l, vs), b = ev(r, vs);
      if (a == null || b == null) return { err: true };
      if (!near(a, b)) return { vs, a, b, ok };
      ok.push(vs);
    }
    return null;
  }
  const isId = (l, r) => same(l, r) === true;

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // fits の q は、ルビをとった問題の文（$…$ をふくむ）。\left・\right ははずして見る
  const norm = q => String(q).replace(/\\left|\\right/g, '').replace(/\s+/g, ' ').trim();
  // 文が「$…$」だけ（＋「＝ □」）なら、その式
  const only = q => { const m = /^\$([^$]*)\$(?:\s*＝\s*□)?$/.exec(norm(q)); return m ? m[1].trim() : null; };
  // いちばん外の + と - で区切った項（かっこ・{} の中は区切らない）
  function topTerms(s) {
    const out = []; let d = 0, cur = '';
    for (const c of s) {
      if (c === '(' || c === '{') d++; else if (c === ')' || c === '}') d--;
      if (d === 0 && (c === '+' || c === '-') && cur.trim() !== '') { out.push(cur); cur = c; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur);
    return out;
  }
  // 「2x-3」「a-3b」「x^2+1」の項を {c, m} の列に（数と文字のかけ算だけ。分数などは null）
  function terms(s) {
    s = String(s).replace(/\s/g, '');
    const out = []; let i = 0;
    if (!s) return null;
    while (i < s.length) {
      let sign = 1;
      if (s[i] === '+' || s[i] === '-') { if (s[i] === '-') sign = -1; i++; } else if (out.length) return null;
      const m = /^(\d+(?:\.\d+)?)?((?:[a-z](?:\^\{?\d+\}?)?)*)/.exec(s.slice(i));
      if (!m || !m[0]) return null;
      i += m[0].length;
      out.push({ c: sign * (m[1] ? parseFloat(m[1]) : 1), m: (m[2] || '').replace(/[{}]/g, '') });
    }
    return out;
  }
  const pairOf = s => { const m = /^\(([^()]+)\)\(([^()]+)\)$/.exec(s || ''); return m ? [terms(m[1]), terms(m[2])] : null; };
  const powOf = (s, n) => { const m = new RegExp(`^\\(([^()]+)\\)\\^\\{?${n}\\}?$`).exec(s || ''); return m ? m[1] : null; };
  const numPow = (s, n) => { const m = new RegExp(`^(\\d+(?:\\.\\d+)?)\\^\\{?${n}\\}?$`).exec(s || ''); return m ? m[1] : null; };
  const coefOf = (ts, m) => { const t = ts.find(u => u.m === m); return t ? t.c : 0; };
  const sameMonos = (a, b) => a.length === b.length && a.every(t => b.some(u => u.m === t.m)) && new Set(a.map(t => t.m)).size === a.length;
  // 和と差の積か（同じ2つの項で、1つだけ符号がちがう）
  function isSumDiff(a, b) {
    if (!a || !b || a.length !== 2 || b.length !== 2 || !sameMonos(a, b)) return false;
    const same1 = a.filter(t => coefOf(b, t.m) === t.c).length, opp = a.filter(t => coefOf(b, t.m) === -t.c).length;
    return same1 === 1 && opp === 1;
  }
  // 1次式どうし（文字1つ＋数、または文字2つ）のかっこ×かっこ
  function linPair(s) {
    const p = pairOf(s);
    if (!p || !p[0] || !p[1] || p[0].length !== 2 || p[1].length !== 2 || !sameMonos(p[0], p[1])) return null;
    if (p[0].some(t => !/^[a-z]?$/.test(t.m))) return null;
    return p;
  }
  // 2次式を {a, b, c, v}（$x^2$、$x$、数の係数）に。ならぶ順はどれでもよい。ちがう形は null
  function quad(s) {
    const ts = terms(s);
    if (!ts) return null;
    const v = (ts.find(t => /\^2$/.test(t.m)) || {}).m;
    if (!v) return null;
    const x = v[0];
    const r = { a: 0, b: 0, c: 0, v: x };
    for (const t of ts) {
      if (t.m === x + '^2') r.a += t.c; else if (t.m === x) r.b += t.c; else if (t.m === '') r.c += t.c; else return null;
    }
    return r;
  }
  // 1次式「x+3」「x-2」（$x$ の係数が1）。{ r：かっこが0になる x }
  function monicLin(s) {
    const ts = terms(s);
    if (!ts || ts.length < 1 || ts.length > 2) return null;
    const v = ts.find(t => /^[a-z]$/.test(t.m));
    if (!v || Math.abs(v.c) !== 1) return null;
    const c = coefOf(ts, '');
    if (ts.length === 2 && !c) return null;
    return { v: v.m, r: -c / v.c };
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // わなの問題に、同じ部のほかのわざが使えるときは、楽な形に「わざ 3-30 で」と書いて also に入れる
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(3).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 3 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    }).concat(extra || []);
    const u = [...new Set(also)].sort();
    if (u.length) p.also = u;
    p.easy = `（${why}${u.length ? `。わざ ${u.join('・')} で` : ''}）`;
    return p;
  }

  // ---------------------------------------------------------------- 3-28
  M.add({
    id: '3-28', part: 3, chap: '3-8②', stars: 2,
    title: '$(ax+b)(cx+d)$ の $x$ の《係数|けい|すう》は《外|そと》×《外|そと》＋《内|うち》×《内|うち》',
    mark: '**1《次式|じ|しき》どうしのかけ《算|ざん》**。$x$ の《項|こう》は2つの《組|く》み《合|あ》わせからしか《出|で》ない。',
    futsu: ['4つの《組|く》み《合|あ》わせを《全部|ぜん|ぶ》《書|か》き、', '$2x^2-6x+x-3$ としてから', '《同類項|どう|るい|こう》をまとめる。'],
    raku: ['$x^2$：$2\\times1=2$、《数|かず》：$1\\times(-3)=-3$', '$x$：$2\\times(-3)+1\\times1=-5$', '$(2x+1)(x-3)=2x^2-5x-3$'],
    why: '$x$ の《項|こう》は、《外側|そと|がわ》どうし（$2x$ と $-3$）と《内側|うち|がわ》どうし（$1$ と $x$）の2つだけ。《先|さき》にたせば、まとめる《手間|て|ま》がない（3-8②）。',
    caution: 'かっこの《中|なか》が3つの《項|こう》のときは、《組|く》み《合|あ》わせが6つになる。この《形|かたち》では《使|つか》えない。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    boxw: { s1: '34mm', s2: '34mm', s3: '38mm', trap: '38mm' },
    // 1次式どうしで、$x$ の係数の少なくとも一方が 1 でない（和と差の積・同じかっこは のぞく）
    fits(q) {
      const t = norm(q);
      const m = /^\$(\([^()]+\)\([^()]+\))\$(?: の \$[a-z]\$ の係数)?(?:\s*＝\s*□)?$/.exec(t);
      const p = m && linPair(m[1]);
      if (!p || isSumDiff(p[0], p[1])) return false;
      if (p[0].every(u => p[1].some(w => w.m === u.m && w.c === u.c))) return false;
      const v = p[0].find(u => u.m)?.m;
      return p.some(br => Math.abs(coefOf(br, v)) !== 1);
    },
    steps: {
      s1(r) {
        const a = r.int(1, 5), c = r.int(1, 4);
        if (a === 1 && c === 1) return null;
        const b = r.intNot(-7, 7, x => !x || gcd(x, a) > 1), d = r.intNot(-7, 7, x => !x || gcd(x, c) > 1);
        if (a === c && (b === d || b === -d)) return null;
        const L1 = lin(a, b), L2 = lin(c, d);
        return {
          q: `$(${L1})(${L2})$`, a: `$${poly([a * c, a * d + b * c, b * d])}$`,
          easy: `$${a * c}x^2+(${a * d}${sg(b * c)})x${sg(b * d)}$`, key: key2('m', L1, L2),
        };
      },
      // $x$ の係数だけを聞く／数が先のかっこ
      s2(r) {
        const a = r.int(2, 6), c = r.int(2, 5), b = r.intNot(-9, 9, x => !x || gcd(x, a) > 1), d = r.intNot(-9, 9, x => !x || gcd(x, c) > 1);
        if (a === c && (b === d || b === -d)) return null;
        if (r.chance(0.5)) {
          const e = `(${lin(a, b)})(${lin(c, d)})`;
          return {
            q: `$${e}$ の $x$ の《係数|けい|すう》`, a: `$${a * d + b * c}$`, easy: `$${a}\\times ${pn(d)}+${pn(b)}\\times ${c}$`,
            verify: () => { const f1 = ev(e, { x: 1 }), f2 = ev(e, { x: -1 }); return (f1 - f2) / 2 === a * d + b * c || '係数がちがう'; },
          };
        }
        // 数が先のかっこは、数をプラスにする（$(3-2x)(5+x)$）
        const A = r.chance(0.5) ? -a : a, C = r.chance(0.3) ? -c : c, B0 = Math.abs(b), D0 = Math.abs(d);
        const L1 = linC(A, B0), L2 = linC(C, D0);
        return { q: `$(${L1})(${L2})$`, a: `$${poly([A * C, A * D0 + B0 * C, B0 * D0])}$`, easy: `$${A * C}x^2+(${A * D0}${sg(B0 * C)})x+${B0 * D0}$`, key: key2('m', L1, L2) };
      },
      // 文字が2つ：$(2a+b)(a-3b)$
      s3(r) {
        const [u, w] = r.pick([['a', 'b'], ['x', 'y'], ['s', 't']]);
        const p = r.int(1, 4), q = r.intNot(-5, 5, x => !x || gcd(x, p) > 1), s = r.int(1, 3), t = r.intNot(-5, 5, x => !x || gcd(x, s) > 1);
        if (p === 1 && s === 1) return null;
        if (p === s && (q === t || q === -t)) return null;
        const L1 = T([[p, u], [q, w]]), L2 = T([[s, u], [t, w]]);
        return {
          q: `$(${L1})(${L2})$`, a: `$${T([[p * s, u + '^2'], [p * t + q * s, u + w], [q * t, w + '^2']])}$`,
          easy: `$${p * s}${u}^2+(${p * t}${sg(q * s)})${u}${w}${sg(q * t)}${w}^2$`, key: key2('m', L1, L2),
        };
      },
      // わな：かっこの中が3つの項（組み合わせが6つ）
      trap(r) {
        const a = r.int(1, 2), b = r.intNot(-3, 3, x => !x), m = r.intNot(-3, 3, x => !x), n = r.intNot(-4, 4, x => !x);
        const A = [b, a], B = [n, m, 1];
        return dest({ q: `$(${lin(a, b)})(${poly([1, m, n])})$`, a: `$${poly(hi(pmul(A, B)))}$` }, '3-28', 'かっこの《中|なか》が3つの《項|こう》。6つの《組|く》み《合|あ》わせをかけてたす');
      },
    },
  });

  // ---------------------------------------------------------------- 3-29
  M.add({
    id: '3-29', part: 3, chap: '3-8③', stars: 1,
    title: '2《乗|じょう》の《展開|てん|かい》はまん《中|なか》が2《倍|ばい》',
    mark: '$(a+b)^2$・$(a-b)^2$ のような **2《乗|じょう》のかっこ**。$b$ が $2x$ のような《単項式|たん|こう|しき》でも《同|おな》じ。',
    futsu: ['$(x-5)^2=(x-5)(x-5)$ として、', '4つの《組|く》み《合|あ》わせを', 'かけてたす。'],
    raku: ['$a^2$、$2ab$、$b^2$ をならべる。', '$(x-5)^2=x^2-2\\times5x+5^2$', '$=x^2-10x+25$'],
    why: '《正方形|せい|ほう|けい》の《図|ず》で、$ab$ の《長方形|ちょう|ほう|けい》が2まいあるから、まん《中|なか》は $2ab$（3-8③）。',
    caution: '$(2x)^2=4x^2$ で、$2x^2$ ではない。$(a+b)^2=a^2+b^2$ はまちがい。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    boxw: '34mm',
    fits(q) { const s = powOf(only(q), 2); return !!s && topTerms(s).length === 2; },
    steps: {
      s1(r) {
        const k = r.intNot(-9, 9, x => !x);
        return { q: `$(${lin(1, k)})^2$`, a: `$${poly([1, 2 * k, k * k])}$`, easy: `$x^2${k < 0 ? '-' : '+'}${Math.abs(k) === 1 ? '2x' : `2\\times ${Math.abs(k)}x`}+${Math.abs(k)}^2$` };
      },
      // $b$ が $2x$ など。数が先の $(12-2x)^2$ は教科書と同じく数から書く
      s2(r) {
        const a = r.int(2, 5), b = r.intNot(-9, 9, x => !x || gcd(x, a) > 1);
        const sgn = b < 0 ? '-' : '+', B = Math.abs(b);
        if (r.chance(0.6)) {
          return { q: `$(${lin(a, b)})^2$`, a: `$${poly([a * a, 2 * a * b, b * b])}$`, easy: `$(${a}x)^2${sgn}2\\times ${a}x\\times ${B}+${B}^2$` };
        }
        const c = r.int(3, 12), A = r.pick([-a, a]);
        if (gcd(c, a) > 1) return null;
        return {
          q: `$(${linC(A, c)})^2$`, a: `$${T([[c * c, ''], [2 * A * c, 'x'], [A * A, 'x^2']])}$`,
          easy: `$${c}^2${A < 0 ? '-' : '+'}2\\times ${c}\\times ${a}x+(${a}x)^2$`,
        };
      },
      // $(1+h)^2$、文字が2つ、分数
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const h = r.pick(['h', 't']), c = r.pick([1, 2, 3]), s = r.pick([1, -1]), ch = c === 1 ? h : c + h;
          return { q: `$(${linC(s * c, 1, h)})^2$`, a: `$${T([[1, ''], [2 * s * c, h], [c * c, h + '^2']])}$`, easy: `$1${s < 0 ? '-' : '+'}2\\times ${ch}+(${ch})^2$` };
        }
        if (k === 1) {
          const [u, w] = r.pick([['a', 'b'], ['x', 'y']]), c = r.intNot(-4, 4, x => !x || x === 1);
          return { q: `$(${T([[1, u], [c, w]])})^2$`, a: `$${T([[1, u + '^2'], [2 * c, u + w], [c * c, w + '^2']])}$`, easy: Math.abs(c) === 1 ? `$${u}^2${c < 0 ? '-' : '+'}2${u}${w}+${w}^2$` : `$${u}^2${c < 0 ? '-' : '+'}2\\times ${Math.abs(c)}${u}${w}+(${Math.abs(c)}${w})^2$` };
        }
        const f = r.pick([[1, 2], [1, 3], [3, 2], [1, 4]]), s = r.pick([1, -1]);
        const fr = Q(s * f[0], f[1]);
        return {
          q: `$\\left(x${s < 0 ? '-' : '+'}${qTeX(fr)}\\right)^2$`, a: `$${T([[1, 'x^2'], [qMul([2, 1], fr), 'x'], [qMul(fr, fr), '']])}$`,
          easy: `$x^2${s < 0 ? '-' : '+'}2\\times ${qTeX(fr)}x+\\left(${qTeX(fr)}\\right)^2$`,
        };
      },
      // わな：2乗ではなく、和と差の積（教科書の例題 $(x+5)(x-5)$）
      trap(r) {
        const k = r.int(2, 9), first = r.chance(0.5);
        return dest({ q: first ? `$(x+${k})(x-${k})$` : `$(x-${k})(x+${k})$`, a: `$x^2-${k * k}$`, key: 'sd' + k }, '3-29', '2《乗|じょう》ではなく、《和|わ》と《差|さ》の《積|せき》');
      },
    },
  });

  // ---------------------------------------------------------------- 3-30
  M.add({
    id: '3-30', part: 3, chap: '3-8④', stars: 1,
    title: '《和|わ》と《差|さ》の《積|せき》は2《乗|じょう》ひく2《乗|じょう》',
    mark: '$(a+b)(a-b)$：**《同|おな》じ2つの《項|こう》の《和|わ》と《差|さ》** をかけている。',
    futsu: ['4つの《組|く》み《合|あ》わせをかけて、', '$x^2-7x+7x-49$', 'としてからまとめる。'],
    raku: ['まん《中|なか》の2つは《消|き》える。', '$(x+7)(x-7)=x^2-7^2$', '$=x^2-49$'],
    why: '$-ab$ と $+ab$ が《打|う》ち《消|け》し《合|あ》うので、のこるのは $a^2-b^2$ だけ（3-8④）。',
    caution: '《符号|ふ|ごう》に《注意|ちゅう|い》（$x^2+49$ ではない）。2つの《数|かず》がちがう $(x+7)(x-6)$ には《使|つか》えない。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    boxw: '30mm',
    fits(q) { const p = pairOf(only(q)); return !!p && isSumDiff(p[0], p[1]); },
    steps: {
      s1(r) {
        const k = r.int(1, 12), first = r.chance(0.5);
        const v = r.chance(0.8) ? 'x' : r.pick(['a', 't']);
        return { q: first ? `$(${v}+${k})(${v}-${k})$` : `$(${v}-${k})(${v}+${k})$`, a: `$${v}^2-${k * k}$`, easy: `$${v}^2-${k}^2$`, key: `sd${v}${k}` };
      },
      // $(3x+2)(3x-2)$、数が先の $(5-x)(5+x)$
      s2(r) {
        if (r.chance(0.6)) {
          const a = r.int(2, 5), b = r.intNot(1, 9, x => gcd(x, a) > 1);
          const L1 = lin(a, b), L2 = lin(a, -b);
          return { q: r.chance(0.5) ? `$(${L1})(${L2})$` : `$(${L2})(${L1})$`, a: `$${a * a}x^2-${b * b}$`, easy: `$(${a}x)^2-${b}^2$`, key: `sd${a}x${b}` };
        }
        const b = r.int(2, 9), a = r.pick([1, 1, 2, 3]);
        if (a > 1 && gcd(a, b) > 1) return null;
        const L1 = linC(a, b), L2 = linC(-a, b);
        return { q: r.chance(0.5) ? `$(${L1})(${L2})$` : `$(${L2})(${L1})$`, a: `$${T([[b * b, ''], [-a * a, 'x^2']])}$`, easy: `$${b}^2-${a === 1 ? 'x' : `(${a}x)`}^2$`, key: `sdc${a}x${b}` };
      },
      // 文字が2つ・$x^2$ のかっこ
      s3(r) {
        if (r.chance(0.6)) {
          const [u, w] = r.pick([['a', 'b'], ['x', 'y'], ['p', 'q']]), c = r.int(2, 5), first = r.chance(0.5);
          const L1 = T([[1, u], [c, w]]), L2 = T([[1, u], [-c, w]]);
          return { q: first ? `$(${L1})(${L2})$` : `$(${L2})(${L1})$`, a: `$${u}^2-${c * c}${w}^2$`, easy: `$${u}^2-(${c}${w})^2$`, key: `sd${u}${w}${c}` };
        }
        const k = r.int(1, 6);
        return { q: `$(x^2+${k})(x^2-${k})$`, a: `$x^4-${k * k}$`, easy: `$(x^2)^2-${k}^2$`, key: `sd4${k}` };
      },
      // わな：数が入れかわっていて、和と差ではない（$(2x+3)(3x-2)$）
      trap(r) {
        const a = r.int(2, 5), b = r.intNot(2, 5, x => x === a || gcd(x, a) > 1), s = r.pick([1, -1]);
        const A = [s * b, a], B = [-s * a, b];
        return dest({ q: `$(${lin(a, s * b)})(${lin(b, -s * a)})$`, a: `$${poly(hi(pmul(A, B)))}$`, easyCheck: false }, '3-30', `$${a}x$ と $${b}x$ がちがう。《和|わ》と《差|さ》ではない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-31
  M.add({
    id: '3-31', part: 3, chap: '3-8④', stars: 1,
    title: '$(x+a)(x+b)$ は《和|わ》と《積|せき》',
    mark: '$x$ の《係数|けい|すう》が **1のかっこどうし** のかけ《算|ざん》（$(x-3)(x+5)$）。',
    futsu: ['$(x-3)(x+5)$ を', '$x^2+5x-3x-15$ と', '4つ《書|か》いてからまとめる。'],
    raku: ['《和|わ》：$-3+5=2$', '《積|せき》：$(-3)\\times5=-15$', '$(x-3)(x+5)=x^2+2x-15$'],
    why: '$ax$ と $bx$ はまとめて $(a+b)x$、《数|かず》だけの《項|こう》は $ab$ になる（3-8④）。',
    caution: '$x$ の《係数|けい|すう》が1でない $(2x+1)(x+3)$ には、このままでは《使|つか》えない。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    boxw: '34mm',
    // 2つのかっこに、係数が1の同じ項がある（もう一方の項はちがい、和と差でもない）
    fits(q) {
      const p = pairOf(only(q));
      if (!p || !p[0] || !p[1] || p[0].length !== 2 || p[1].length !== 2 || !sameMonos(p[0], p[1]) || isSumDiff(p[0], p[1])) return false;
      return p[0].some(t => t.m && t.c === 1 && coefOf(p[1], t.m) === 1 && (() => { const o = p[0].find(u => u !== t); const o2 = coefOf(p[1], o.m); return o.c !== o2; })());
    },
    steps: {
      s1(r) {
        const a = r.intNot(-9, 9, x => !x), b = r.intNot(-9, 9, x => !x || x === a || x === -a);
        const L1 = lin(1, a), L2 = lin(1, b);
        return { q: `$(${L1})(${L2})$`, a: `$${poly([1, a + b, a * b])}$`, easy: `$x^2+(${a}${sg(b)})x+${pn(a)}\\times ${pn(b)}$`, key: key2('m', L1, L2) };
      },
      // 文字を変える・数が先のかっこ
      s2(r) {
        const v = r.pick(['t', 'y', 'a']), a = r.intNot(-12, 12, x => !x), b = r.intNot(-12, 12, x => !x || x === a || x === -a);
        if (Math.abs(a) < 6 && Math.abs(b) < 6) return null;
        const L1 = a > 0 && r.chance(0.3) ? linC(1, a, v) : lin(1, a, v), L2 = lin(1, b, v);
        return { q: `$(${L1})(${L2})$`, a: `$${poly([1, a + b, a * b], v)}$`, easy: `$${v}^2+(${a}${sg(b)})${v}+${pn(a)}\\times ${pn(b)}$`, key: key2('m', L1, L2) };
      },
      // 文字が2つ $(x+2y)(x-5y)$・$x^2$ のかっこ
      s3(r) {
        const a = r.intNot(-6, 6, x => !x), b = r.intNot(-6, 6, x => !x || x === a || x === -a);
        if (r.chance(0.6)) {
          const w = r.pick(['y', 'b']), u = w === 'y' ? 'x' : 'a';
          const L1 = T([[1, u], [a, w]]), L2 = T([[1, u], [b, w]]);
          return { q: `$(${L1})(${L2})$`, a: `$${T([[1, u + '^2'], [a + b, u + w], [a * b, w + '^2']])}$`, easy: `$${u}^2+(${a}${sg(b)})${u}${w}+${pn(a)}\\times ${pn(b)}${w}^2$`, key: key2('m', L1, L2) };
        }
        const L1 = T([[1, 'x^2'], [a, '']]), L2 = T([[1, 'x^2'], [b, '']]);
        return { q: `$(${L1})(${L2})$`, a: `$${T([[1, 'x^4'], [a + b, 'x^2'], [a * b, '']])}$`, easy: `$x^4+(${a}${sg(b)})x^2+${pn(a)}\\times ${pn(b)}$`, key: key2('m', L1, L2) };
      },
      // わな：$x$ の係数が1でない
      trap(r) {
        const c = r.int(2, 4), a = r.intNot(-6, 6, x => !x || gcd(x, c) > 1), b = r.intNot(-6, 6, x => !x);
        const A = [a, c], B = [b, 1];
        return dest({ q: `$(${lin(c, a)})(${lin(1, b)})$`, a: `$${poly(hi(pmul(A, B)))}$`, easyCheck: false }, '3-31', '$x$ の《係数|けい|すう》が1でない');
      },
    },
  });

  // ---------------------------------------------------------------- 3-32
  // きりのよい数：50 の倍数、または 1・10
  function nearRound(n) {
    if (Number.isInteger(n)) { if (n < 44) return false; const R = Math.round(n / 50) * 50; const d = Math.abs(n - R); return d >= 1 && d <= 6; }
    return [1, 10].some(R => { const d = Math.abs(n - R); return d > 1e-9 && d <= 0.2 + 1e-9; });
  }
  M.add({
    id: '3-32', part: 3, chap: '3-8④', stars: 1,
    title: 'きりのよい《数|かず》に《近|ちか》い《数|かず》の2《乗|じょう》',
    mark: '**100・50・1 に《近|ちか》い《数|かず》** の2《乗|じょう》（$98^2$、$201^2$、$1.05^2$）。',
    futsu: ['$98\\times98$ を《筆算|ひっ|さん》で', '《計算|けい|さん》する。'],
    raku: ['$98=100-2$ と《見|み》る。', '$98^2=(100-2)^2$', '$=10000-400+4=9604$'],
    why: '$(a-b)^2=a^2-2ab+b^2$ で、$a$ がきりのよい《数|かず》なら、どの《項|こう》も《暗算|あん|ざん》できる（3-8④）。',
    caution: '$63^2$ のように、きりのよい《数|かず》から《遠|とお》いと《楽|らく》にならない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    boxw: '24mm',
    fits(q) { const n = numPow(only(q), 2); return !!n && nearRound(+n); },
    steps: {
      s1(r) {
        const k = r.intNot(-6, 6, x => !x), n = 100 + k, s = k < 0 ? '-' : '+', K = Math.abs(k);
        return { q: `$${n}^2$`, a: `$${n * n}$`, easy: `$(100${s}${K})^2=10000${s}${200 * K}+${K * K}$` };
      },
      // 50・200・300・1000 の近く
      s2(r) {
        const R = r.pick([50, 200, 300, 1000]), k = r.intNot(-4, 4, x => !x), n = R + k, s = k < 0 ? '-' : '+', K = Math.abs(k);
        return { q: `$${n}^2$`, a: `$${n * n}$`, easy: `$(${R}${s}${K})^2=${R * R}${s}${2 * R * K}+${K * K}$` };
      },
      // 小数（1.05、0.98、9.9）
      s3(r) {
        let R, k, sc;
        if (r.chance(0.7)) { R = 1; sc = r.pick([1, 2]); k = sc === 1 ? r.intNot(-2, 2, x => !x) : r.intNot(-5, 5, x => !x); } else { R = 10; sc = 1; k = r.intNot(-2, 2, x => !x); }
        const N = R * 10 ** sc + k, s = k < 0 ? '-' : '+', K = Math.abs(k);
        return { q: `$${D(N, sc)}^2$`, a: `$${D(N * N, 2 * sc)}$`, easy: `$(${R}${s}${D(K, sc)})^2=${R * R}${s}${D(2 * R * K, sc)}+${D(K * K, 2 * sc)}$` };
      },
      // わな：100 からも 50 からも遠い（一の位が5の数・50 に近い数は のぞく）
      trap(r) {
        const n = r.pick([27, 28, 32, 33, 37, 38, 62, 63, 67, 68, 72, 73, 77, 78]);
        return dest({ q: `$${n}^2$`, a: `$${n * n}$` }, '3-32', '100・50 から《遠|とお》い');
      },
    },
  });

  // ---------------------------------------------------------------- 3-33
  const roundMid = m => (m >= 10 ? Number.isInteger(m) && m % 10 === 0 : Math.abs(m - Math.round(m)) < 1e-9);
  M.add({
    id: '3-33', part: 3, chap: '3-8④', stars: 1,
    title: 'まん《中|なか》をはさむかけ《算|ざん》は2《乗|じょう》ひく2《乗|じょう》',
    mark: '2つの《数|かず》の **まん《中|なか》（《平均|へい|きん》）がきりのよい《数|かず》**。',
    futsu: ['$103\\times97$ を《筆算|ひっ|さん》で', '《計算|けい|さん》する。'],
    raku: ['まん《中|なか》は100、はなれは3。', '$(100+3)(100-3)$', '$=10000-9=9991$'],
    why: '《和|わ》と《差|さ》の《積|せき》 $(a+b)(a-b)=a^2-b^2$ を《数|かず》に《使|つか》う（3-8④）。',
    caution: '$52\\times47$ のように、まん《中|なか》がきりのよい《数|かず》でないときは《使|つか》えない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    boxw: '24mm',
    fits(q) {
      const m = /^(\d+(?:\.\d+)?)\s*\\times\s*(\d+(?:\.\d+)?)$/.exec(only(q) || '');
      if (!m || m[1] === m[2]) return false;
      const a = +m[1], b = +m[2], mid = (a + b) / 2;
      return roundMid(Math.round(mid * 1e6) / 1e6) && Math.abs(a - b) / 2 <= Math.max(5, mid / 8);
    },
    steps: {
      s1(r) {
        const k = r.int(1, 12), a = 100 + k, b = 100 - k, f = r.chance(0.5);
        return { q: f ? `$${a}\\times ${b}$` : `$${b}\\times ${a}$`, a: `$${a * b}$`, easy: `$(100+${k})(100-${k})=10000-${k * k}$`, key: 'x' + k };
      },
      // 20・30・…・90 をはさむ
      s2(r) {
        const m = r.pick([20, 30, 40, 50, 60, 70, 80, 90]), k = r.int(1, m <= 30 ? 3 : 4), f = r.chance(0.5);
        const a = m + k, b = m - k;
        return { q: f ? `$${a}\\times ${b}$` : `$${b}\\times ${a}$`, a: `$${a * b}$`, easy: `$(${m}+${k})(${m}-${k})=${m * m}-${k * k}$`, key: `x${m}|${k}` };
      },
      // 200・1000、小数（1.02×0.98、10.3×9.7）
      s3(r) {
        const t = r.int(0, 2), f = r.chance(0.5);
        let m, k, sc;
        if (t === 0) { m = r.pick([200, 1000]); k = r.int(1, 5); sc = 0; } else if (t === 1) { m = 1; k = r.int(1, 5); sc = 2; } else { m = 10; k = r.int(1, 3); sc = 1; }
        const M10 = m * 10 ** sc, A = M10 + k, B = M10 - k;
        const a = D(A, sc), b = D(B, sc);
        return { q: f ? `$${a}\\times ${b}$` : `$${b}\\times ${a}$`, a: `$${D(A * B, 2 * sc)}$`, easy: `$(${m}+${D(k, sc)})(${m}-${D(k, sc)})=${m * m}-${D(k * k, 2 * sc)}$`, key: `x${m}|${k}` };
      },
      // わな：まん中がきりのよい数にならない（$52\times47$）
      trap(r) {
        const R = r.pick([50, 100]), k = r.int(1, 4), a = R + k, b = R - k - 1;
        return dest({ q: `$${a}\\times ${b}$`, a: `$${a * b}$`, key: 'xt' + a }, '3-33', `まん《中|なか》が ${(a + b) / 2} で、きりがよくない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-34
  M.add({
    id: '3-34', part: 3, chap: '3-8③', stars: 2,
    title: '《一|いち》の《位|くらい》が5の《数|かず》の2《乗|じょう》',
    mark: '**《一|いち》の《位|くらい》が5** の《数|かず》の2《乗|じょう》（$35^2$、$85^2$、$4.5^2$）。',
    futsu: ['$35\\times35$ を《筆算|ひっ|さん》で', '《計算|けい|さん》する。'],
    raku: ['《十|じゅう》の《位|くらい》の3と、1《大|おお》きい4をかける。', '$3\\times4=12$ のうしろに 25 をつける。', '$35^2=1225$'],
    why: '$(10a+5)^2=100a^2+100a+25=100a(a+1)+25$。$a(a+1)$ のうしろに 25 がつく（3-8③）。',
    caution: '《一|いち》の《位|くらい》が5でない $36^2$ には《使|つか》えない。',
    counts: { s1: 8, s2: 6, s3: 6, trap: 2 },
    boxw: '24mm',
    fits(q) { const n = numPow(only(q), 2); return !!n && (/^\d*5$/.test(n) && +n >= 15 || /^\d+\.5$/.test(n) || /^0\.\d5$/.test(n)); },
    steps: {
      s1(r) { const a = r.int(1, 9), n = 10 * a + 5; return { q: `$${n}^2$`, a: `$${n * n}$`, easy: `$100\\times(${a}\\times ${a + 1})+25$` }; },
      // 3けた（105〜205）
      s2(r) { const a = r.int(10, 20), n = 10 * a + 5; return { q: `$${n}^2$`, a: `$${n * n}$`, easy: `$100\\times(${a}\\times ${a + 1})+25$` }; },
      // 小数（4.5、0.35）
      s3(r) {
        const a = r.int(1, 9);
        if (r.chance(0.6)) { const N = 10 * a + 5; return { q: `$${D(N, 1)}^2$`, a: `$${D(N * N, 2)}$`, easy: `$${a}\\times ${a + 1}+0.25$` }; }
        const N = 10 * a + 5;
        return { q: `$${D(N, 2)}^2$`, a: `$${D(N * N, 4)}$`, easy: `$${a}\\times ${a + 1}\\div100+0.0025$` };
      },
      // わな：一の位が5でない（50・100 の近くは のぞく）
      trap(r) {
        const n = r.pick([14, 16, 24, 26, 34, 36, 64, 66, 74, 76, 84, 86]);
        return dest({ q: `$${n}^2$`, a: `$${n * n}$` }, '3-34', '《一|いち》の《位|くらい》が5でない');
      },
    },
  });

  // ---------------------------------------------------------------- 3-35
  M.add({
    id: '3-35', part: 3, chap: '3-8④・3-10④', stars: 2,
    title: '2《乗|じょう》の《差|さ》は《和|わ》×《差|さ》',
    mark: '$\\square^2-\\triangle^2$：**2《乗|じょう》どうしのひき《算|ざん》**（《数|かず》の《計算|けい|さん》）。',
    futsu: ['$53^2=2809$、$47^2=2209$ を', 'それぞれ《計算|けい|さん》してからひく。'],
    raku: ['$53^2-47^2=(53+47)(53-47)$', '$=100\\times6=600$'],
    why: '$a^2-b^2=(a+b)(a-b)$（3-8④を《右|みぎ》から《左|ひだり》へ《読|よ》む）。《和|わ》がきりのよい《数|かず》になることが《多|おお》い。',
    caution: '2《乗|じょう》の《和|わ》 $53^2+47^2$ には《使|つか》えない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '24mm',
    cols: { s3: 1 },
    fits(q) {
      if (/^\$(\d+(?:\.\d+)?)\^\{?2\}?-(\d+(?:\.\d+)?)\^\{?2\}?\$/.test(norm(q))) return true;
      return /半径.*円から.*半径.*円/.test(q);
    },
    steps: {
      // 和が 100・50
      s1(r) {
        const S = r.pick([100, 100, 50]), k = r.int(1, S === 100 ? 9 : 4), a = S / 2 + k, b = S / 2 - k;
        return { q: `$${a}^2-${b}^2$`, a: `$${a * a - b * b}$`, easy: `$(${a}+${b})(${a}-${b})=${S}\\times ${a - b}$` };
      },
      // 差が 1・2
      s2(r) {
        const d = r.pick([1, 2]), b = r.int(21, 98), a = b + d;
        if ((a + b) % 10 === 0) return null;
        return { q: `$${a}^2-${b}^2$`, a: `$${a * a - b * b}$`, easy: `$(${a}+${b})(${a}-${b})=${a + b}\\times ${d}$` };
      },
      // 小数・リングの面積
      s3(r) {
        if (r.chance(0.5)) {
          const k = r.int(1, 4), A = 50 + k, B = 50 - k;
          return { q: `$${D(A, 1)}^2-${D(B, 1)}^2$`, a: `$${D(A * A - B * B, 2)}$`, easy: `$(${D(A, 1)}+${D(B, 1)})(${D(A, 1)}-${D(B, 1)})=10\\times ${D(A - B, 1)}$` };
        }
        const S = r.pick([20, 30, 40, 50]), d = r.pick([1, 2, 3, 4].filter(x => (S - x) % 2 === 0 && x < S / 4)) || null;
        if (!d) return null;
        const R = (S + d) / 2, s = (S - d) / 2;
        return {
          q: `《半径|はん|けい》 $${R}$ の《円|えん》から、《半径|はん|けい》 $${s}$ の《円|えん》を《切|き》りとった《面積|めん|せき》`,
          a: `$${S * d}\\pi$`, easy: `$(${R}^2-${s}^2)\\pi=(${R}+${s})(${R}-${s})\\pi$`,
          verify: () => near(ev(`(${R}^2-${s}^2)\\pi`), ev(`${S * d}\\pi`)) || '面積がちがう',
        };
      },
      // わな：2乗の和（和は100でも、50 から遠く、一の位が5でない）
      trap(r) {
        const a = r.pick([62, 63, 64, 66, 67, 68, 71, 72, 73, 74, 76, 77, 78]), b = 100 - a;
        return dest({ q: `$${a}^2+${b}^2$`, a: `$${a * a + b * b}$` }, '3-35', '2《乗|じょう》の《和|わ》には《使|つか》えない');
      },
    },
  });

  // ---------------------------------------------------------------- 3-36
  const cubeTerms = (a, b) => [a * a * a, 3 * a * a * b, 3 * a * b * b, b * b * b];
  M.add({
    id: '3-36', part: 3, chap: '3-8⑤', stars: 1,
    title: '$(a+b)^3$ は 1・3・3・1',
    mark: '**3《乗|じょう》のかっこ**（$(x+2)^3$）、$11^3$、$1.1^3$。',
    futsu: ['$(x+2)^3=(x+2)^2(x+2)$ として、', '2《回|かい》《展開|てん|かい》する。'],
    raku: ['《係数|けい|すう》は 1・3・3・1。', '$(x+2)^3=x^3+3\\times2x^2+3\\times4x+8$', '$=x^3+6x^2+12x+8$'],
    why: '$(a+b)^3=a^3+3a^2b+3ab^2+b^3$。《立方体|りっ|ぽう|たい》の《板|いた》3まいと《角柱|かく|ちゅう》3《本|ぼん》が「3」（3-8⑤）。',
    caution: '$(x+1)(x+2)(x+3)$ のように、3つのかっこがちがうと《使|つか》えない。$(a-b)^3$ は《符号|ふ|ごう》が ＋－＋－ とかわる。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: { s1: '40mm', s2: '24mm', s3: '40mm', trap: '40mm' },
    fits(q) {
      const s = only(q);
      const c = powOf(s, 3);
      if (c) return topTerms(c).length === 2;
      const n = numPow(s, 3);
      if (!n) return false;
      const v = +n;
      return [1, 10, 20, 30, 100].some(R => { const d = Math.abs(v - R); return d > 1e-9 && d <= (R === 1 ? 0.2 : 2) + 1e-9; });
    },
    steps: {
      s1(r) {
        const v = r.pick(['x', 'x', 'a', 't']), k = r.intNot(-4, 4, x => !x), K = Math.abs(k), s = k < 0 ? '-' : '+';
        return { q: `$(${lin(1, k, v)})^3$`, a: `$${poly([1, 3 * k, 3 * k * k, k * k * k], v)}$`, easy: `$${v}^3${s}${K === 1 ? '3' : `3\\times ${K}`}${v}^2+${K === 1 ? '3' : `3\\times ${K * K}`}${v}${s}${K ** 3}$` };
      },
      // 数：$11^3$、$99^3$、$1.1^3$
      s2(r) {
        const [R, k, sc] = r.pick([[10, 1, 0], [10, -1, 0], [10, 2, 0], [20, 1, 0], [20, -1, 0], [30, 1, 0], [100, 1, 0], [100, -1, 0], [1, 1, 1], [1, -1, 1], [1, 2, 1], [1, -2, 1]]);
        const N = R * 10 ** sc + k, s = k < 0 ? '-' : '+', K = Math.abs(k);
        const t = [R ** 3 * 1000 ** sc, 3 * R * R * K * 100 ** sc, 3 * R * K * K * 10 ** sc, K ** 3];   // 10^(3sc) 倍
        return {
          q: `$${D(N, sc)}^3$`, a: `$${D(N ** 3, 3 * sc)}$`,
          easy: `$(${R}${s}${D(K, sc)})^3=${D(t[0], 3 * sc)}${s}${D(t[1], 3 * sc)}+${D(t[2], 3 * sc)}${s}${D(t[3], 3 * sc)}$`,
        };
      },
      // $(2x+1)^3$、$(1+h)^3$、文字が2つ
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const a = r.int(2, 3), b = r.intNot(-2, 2, x => !x), c = cubeTerms(a, b);
          return { q: `$(${lin(a, b)})^3$`, a: `$${poly(c)}$`, easy: `$(${a}x)^3${b < 0 ? '-' : '+'}3(${a}x)^2\\times ${Math.abs(b)}+3\\times ${a}x\\times ${b * b}${b < 0 ? '-' : '+'}${Math.abs(b ** 3)}$` };
        }
        if (t === 1) {
          const h = r.pick(['h', 't']), s = r.pick([1, -1]);
          return { q: `$(${linC(s, 1, h)})^3$`, a: `$${T([[1, ''], [3 * s, h], [3, h + '^2'], [s, h + '^3']])}$`, easy: `$1${s < 0 ? '-' : '+'}3${h}+3${h}^2${s < 0 ? '-' : '+'}${h}^3$` };
        }
        const [u, w] = r.pick([['a', 'b'], ['x', 'y']]), c = r.intNot(-2, 2, x => !x || x === 1), cw = T([[c, w]]);
        return {
          q: `$(${T([[1, u], [c, w]])})^3$`, a: `$${T([[1, u + '^3'], [3 * c, u + '^2' + w], [3 * c * c, u + w + '^2'], [c ** 3, w + '^3']])}$`,
          easy: `$${u}^3+3${u}^2\\times(${cw})+3${u}\\times(${cw})^2+(${cw})^3$`,
        };
      },
      // わな：3つのかっこがちがう（1・3・3・1 は使えない）
      trap(r) {
        const a = r.intNot(-3, 3, x => !x), b = r.intNot(-3, 3, x => !x || x === a), c = r.intNot(-4, 4, x => !x || x === a || x === b);
        const P = pmul(pmul([a, 1], [b, 1]), [c, 1]);
        return dest({ q: `$(${lin(1, a)})(${lin(1, b)})(${lin(1, c)})$`, a: `$${poly(hi(P))}$`, key: 'c3' + [a, b, c].sort().join(',') }, '3-36', '3つのかっこがちがう');
      },
    },
  });

  // ---------------------------------------------------------------- 3-37
  M.add({
    id: '3-37', part: 3, chap: '3-8⑥', stars: 1,
    title: '《共通因数|きょう|つう|いん|すう》でくくる',
    mark: 'どの《項|こう》も **《同|おな》じ《数|かず》・《文字|も|じ》でわれる**。',
    futsu: ['$12x^2-96x+144$ のまま', '《計算|けい|さん》を《進|すす》める。《数|かず》が', '《大|おお》きく、まちがえやすい。'],
    raku: ['どの《項|こう》も12でわれる。', '$12\\times x^2-12\\times8x+12\\times12$', '$=12(x^2-8x+12)$'],
    why: '《分配法則|ぶん|ぱい|ほう|そく》を《右|みぎ》から《左|ひだり》へ《読|よ》む。かっこの《中|なか》の《数|かず》が《小|ちい》さくなる（3-8⑥）。',
    caution: '$2x^2-8x$ は $2x(x-4)$ まで くくる。$2(x^2-4x)$ では、かっこの《中|なか》に $x$ がのこる。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    boxw: '34mm',
    // 「くくる：」の式で、どの項にもかかる数（1より大きい）か文字がある
    fits(q) {
      const m = /^くくる：\$([^$]*)\$$/.exec(norm(q));
      if (!m) return false;
      const ts = terms(m[1]);
      if (!ts) return true;
      const g = ts.map(t => Math.abs(t.c)).reduce(gcd);
      const L = ts.map(t => new Set(t.m.replace(/[\^\d{}]/g, '').split('').filter(Boolean)));
      return g > 1 || [...L[0]].some(ch => L.every(x => x.has(ch)));
    },
    steps: {
      s1(r) {
        const k = r.int(2, 12), p = r.intNot(-9, 9, x => !x), c = r.intNot(-9, 9, x => !x);
        const e = poly([k, k * p, k * c]), ans = `${k}(${poly([1, p, c])})`;
        return {
          q: `くくる：$${e}$`, a: `$${ans}$`,
          easy: `$${k}\\times x^2${p < 0 ? '-' : '+'}${k}\\times ${Math.abs(p) === 1 ? '' : Math.abs(p)}x${c < 0 ? '-' : '+'}${k}\\times ${Math.abs(c)}$`,
          verify: () => same(e, ans),
        };
      },
      // 文字でもくくれる：$2x^2-8x=2x(x-4)$
      s2(r) {
        const v = r.pick(['x', 'x', 't']), g = r.int(1, 6), a = r.int(1, 4), b = r.intNot(-9, 9, x => !x || gcd(x, a) > 1);
        if (g === 1 && a === 1) return null;
        const three = r.chance(0.3);
        let e, ans;
        const c3 = r.intNot(-5, 5, x => !x);
        if (three) {
          e = poly([g * a, g * b, g * c3, 0], v); ans = `${g === 1 ? '' : g}${v}(${poly([a, b, c3], v)})`;
        } else {
          e = poly([g * a, g * b, 0], v); ans = `${g === 1 ? '' : g}${v}(${lin(a, b, v)})`;
        }
        const G = `${g === 1 ? '' : g}${v}`, inner = three ? [[a, v + '^2'], [b, v], [c3, '']] : [[a, v], [b, '']];
        const ez = inner.map(([co, mm], i) => `${co < 0 ? '-' : i ? '+' : ''}${G}\\times ${Math.abs(co) === 1 && mm ? '' : Math.abs(co)}${mm}`).join('');
        return { q: `くくる：$${e}$`, a: `$${ans}$`, easy: `$${ez}$`, verify: () => same(e, ans) };
      },
      // 文字が2つ・物理の式
      s3(r) {
        if (r.chance(0.25)) {
          const [e, ans, ez] = r.pick([
            ['mgh+\\frac{1}{2}mv^2', 'm\\left(gh+\\frac{1}{2}v^2\\right)', 'm\\times gh+m\\times\\frac{1}{2}v^2'],
            ['4\\pi r^2+2\\pi rh', '2\\pi r(2r+h)', '2\\pi r\\times2r+2\\pi r\\times h'],
            ['2\\pi r^2+2\\pi rh', '2\\pi r(r+h)', '2\\pi r\\times r+2\\pi r\\times h'],
          ]);
          return { q: `くくる：$${e}$`, a: `$${ans}$`, easy: `$${ez}$`, verify: () => same(e, ans) };
        }
        const [u, w] = r.pick([['a', 'b'], ['x', 'y']]), g = r.int(2, 5), p = r.int(1, 4), s = r.intNot(-5, 5, x => !x || gcd(x, p) > 1);
        const e = T([[g * p, `${u}^2${w}`], [g * s, `${u}${w}^2`]]), ans = `${g}${u}${w}(${T([[p, u], [s, w]])})`;
        return { q: `くくる：$${e}$`, a: `$${ans}$`, easy: `$${g}${u}${w}\\times ${p === 1 ? '' : p}${u}${s < 0 ? '-' : '+'}${g}${u}${w}\\times ${Math.abs(s) === 1 ? '' : Math.abs(s)}${w}$`, verify: () => same(e, ans) };
      },
      // わな：はじめの2つはくくれるが、数の項がわれない
      trap(r) {
        const g = r.pick([2, 3, 4, 5]), a = r.int(1, 3), b = r.intNot(-5, 5, x => !x), c = r.intNot(-9, 9, x => !x || gcd(x, g) > 1);
        const co = [g * a, g * b, c];
        if (co.reduce(gcd) !== 1) return null;
        return {
          q: `くくる：$${poly(co)}$`, a: 'くくれない', easy: `（$${c}$ が $${g}$ でわれない。どの《項|こう》にもかかる《数|かず》・《文字|も|じ》がない）`,
          verify: () => (co.reduce(gcd) === 1 && c !== 0) || 'くくれる',
        };
      },
    },
  });

  // ---------------------------------------------------------------- 3-38
  M.add({
    id: '3-38', part: 3, chap: '3-8⑦', stars: 1,
    title: '《恒等式|こう|とう|しき》かは《数|かず》を《入|い》れてためす',
    mark: '「**《恒等式|こう|とう|しき》か**」と《聞|き》かれている。',
    futsu: ['《左辺|さ|へん》を《展開|てん|かい》して、', '《右辺|う|へん》と《同|おな》じ《式|しき》になるか', 'くらべる。'],
    raku: ['$(x+2)^2=x^2+4$ に $x=1$ を《入|い》れる。', '《左|ひだり》は9、《右|みぎ》は5。', '1つ《合|あ》わないので、《恒等式|こう|とう|しき》ではない。'],
    why: '《恒等式|こう|とう|しき》はどんな $x$ でも《成|な》り《立|た》つ。1つでも《合|あ》わない $x$ があれば、そこで《終|お》わり（3-8⑦）。',
    caution: 'いくつかの $x$ で《合|あ》っても、たまたまかもしれない。《恒等式|こう|とう|しき》だと《言|い》うには、《展開|てん|かい》してくらべる。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '30mm',
    boxh: { trap: '12mm' },
    fits(q) { return /は恒等式か/.test(q); },
    steps: {
      s1(r) {
        const k = r.intNot(-6, 6, x => !x), l = `(${lin(1, k)})^2`;
        const right = r.pick([poly([1, 2 * k, k * k]), poly([1, 0, k * k]), poly([1, k, k * k]), poly([1, 2 * k, -k * k]), poly([1, 2 * k, k * k])]);
        return idq(l, right);
      },
      // 和と差の積・$(x+a)(x+b)$・分配法則
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const k = r.int(2, 7);
          return idq(`(x+${k})(x-${k})`, r.pick([`x^2-${k * k}`, `x^2+${k * k}`, `x^2-${2 * k}x-${k * k}`]));
        }
        if (t === 1) {
          const a = r.intNot(-5, 5, x => !x), b = r.intNot(-5, 5, x => !x || x === a || x === -a);
          return idq(`(${lin(1, a)})(${lin(1, b)})`, r.pick([poly([1, a + b, a * b]), poly([1, a * b, a + b]), poly([1, a + b, a * b])]));
        }
        const k = r.int(2, 6), c = r.intNot(-7, 7, x => !x);
        return idq(`${k}(${lin(1, c)})`, r.pick([lin(k, k * c), lin(k, c)]));
      },
      // 2つの文字・3乗・2つの値で合ってしまう式
      s3(r) {
        const t = r.int(0, 3);
        if (t === 0) { const [u, w] = r.pick([['a', 'b'], ['x', 'y']]); return idq(`(${u}+${w})^2`, r.pick([`${u}^2+${w}^2`, `${u}^2+2${u}${w}+${w}^2`])); }
        if (t === 1) { const [u, w] = r.pick([['a', 'b'], ['x', 'y']]); return idq(`(${u}-${w})^2`, r.pick([`(${w}-${u})^2`, `${u}^2-${w}^2`])); }
        if (t === 2) return r.pick([idq('(x+1)^3', 'x^3+1'), idq('(x-1)(x^2+x+1)', 'x^3-1'), idq('(x+1)(x^2-x+1)', 'x^3+1'), idq('x(x+1)(x-1)', 'x^3-x')]);
        // $x=0$、1 では合ってしまう：$(x+a)^2=(2a+1)x+a^2$
        const a = r.int(1, 4);
        return idq(`(x+${a})^2`, lin(2 * a + 1, a * a));
      },
      // わな：「恒等式か」ではなく、成り立つ $x$ を聞いている（方程式）
      trap(r) {
        const a = r.intNot(-4, 4, x => !x), m = r.intNot(1, 9, x => x % (2 * a) === 0);
        const c = a * a + m, x = Q(m, 2 * a), l = `(${lin(1, a)})^2`, rr = `x^2+${c}`;
        // 左辺の展開には 3-29 が使える（H-2）
        return dest({
          q: `$${l}=${rr}$ が《成|な》り《立|た》つ $x$`, a: `$${x[0] < 0 ? '-' : ''}${qTeX(x)}$`, easyCheck: false,
          verify: () => near(ev(l, { x: x[0] / x[1] }), ev(rr, { x: x[0] / x[1] })) || '成り立たない',
        }, '3-38', `《恒等式|こう|とう|しき》ではなく《方程式|ほう|てい|しき》。《展開|てん|かい》して $${2 * a}x=${m}$`, ['3-29']);
      },
    },
  });
  // 「… は恒等式か」の問題と答え
  function idq(l, rr) {
    if (l === rr) return null;
    const id = isId(l, rr), d = diffAt(l, rr);
    if (id !== !d || (d && d.err)) return null;
    let easy;
    if (id) easy = '（《展開|てん|かい》すると《同|おな》じ《式|しき》）';
    else {
      const at = vs => Object.entries(vs).map(([k, v]) => `$${k}=${v}$`).join('、');
      const pre = d.ok.length ? `${d.ok.map(at).join('、')} では《合|あ》うが、` : '';
      easy = `（${pre}${at(d.vs)} で《左|ひだり》は $${d.a}$、《右|みぎ》は $${d.b}$）`;
    }
    return {
      q: `$${l}=${rr}$ は《恒等式|こう|とう|しき》か □`, a: id ? '《恒等式|こう|とう|しき》' : '《恒等式|こう|とう|しき》ではない', easy,
      verify: () => (isId(l, rr) === id) || '判定がちがう',
    };
  }

  // ---------------------------------------------------------------- 3-39
  // 「恒等式：$…$　$p=□$、$q=□$」の文（1行に入るように短く）
  const unk = (names, vals) => ({ q: names.map(n => `$${n}=□$`).join('、'), a: names.map((n, i) => `$${n}=${vals[i]}$`).join('、') });
  const koq = (eq, u) => `《恒等式|こう|とう|しき》：$${eq}$　${u}`;
  const KO = /^恒等式：/;
  M.add({
    id: '3-39', part: 3, chap: '3-8⑧', stars: 1,
    title: '《係数|けい|すう》を《比|くら》べる',
    mark: '「**《恒等式|こう|とう|しき》になるように**《数|かず》を《決|き》める」で、《右辺|う|へん》を《展開|てん|かい》できる。',
    futsu: ['$x$ にいくつも《数|かず》を《入|い》れて、', '$p$、$q$ の《連立方程式|れん|りつ|ほう|てい|しき》を', '《作|つく》って《解|と》く。'],
    raku: ['《右辺|う|へん》$=x^2+2px+p^2+q$', '$x$ の《係数|けい|すう》：$2p=8$ で $p=4$', '《数|かず》の《項|こう》：$16+q=20$ で $q=4$'],
    why: '《恒等式|こう|とう|しき》なら、《同|おな》じ《次数|じ|すう》の《係数|けい|すう》どうしが《等|ひと》しい（3-8⑧）。《上|うえ》から1つずつ《決|き》まる。',
    caution: '1つの $x$ でだけ《成|な》り《立|た》つ《方程式|ほう|てい|しき》では、《係数|けい|すう》を《比|くら》べてはいけない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '12mm',
    // 「恒等式になる」で、3-40 の形（A・B と、$x$ の係数が1のかっこ2つ）でないもの
    fits(q) { return KO.test(q) && !fits40(q); },
    steps: {
      s1(r) {
        const p = r.intNot(-6, 6, x => !x), qq = r.intNot(-9, 9, x => !x), c = p * p + qq;
        const L = poly([1, 2 * p, c]), R = '(x+p)^2+q', u = unk(['p', 'q'], [p, qq]);
        return {
          q: koq(`${L}=${R}`, u.q), a: u.a,
          easy: `$2p=${2 * p}$、$${p * p}+q=${c}$`, verify: () => same(L, `(x+${pn(p)})^2+${pn(qq)}`),
        };
      },
      // 1次式：$3x+7=a(x+2)+b$
      s2(r) {
        const m = r.intNot(-6, 6, x => !x), n = r.intNot(-9, 9, x => !x), k = r.intNot(-5, 5, x => !x), b = n - m * k;
        const L = lin(m, n), u = unk(['a', 'b'], [m, b]);
        return {
          q: koq(`${L}=a(${lin(1, k)})+b`, u.q), a: u.a,
          easy: `$a=${m}$、$${T([[k, 'a'], [1, 'b']])}=${n}$`, verify: () => same(L, `${pn(m)}(x+${pn(k)})+${pn(b)}`),
        };
      },
      // かっこのかけ算・$x^2$ の係数が2
      s3(r) {
        if (r.chance(0.6)) {
          const k = r.intNot(-5, 5, x => !x), a = r.intNot(-6, 6, x => !x || x === k), c = k * a, b = k + a;
          const u = unk(['a', 'b'], [a, b]), L = `(${lin(1, k)})(x+a)`, R = `x^2+bx${sg(c)}`;
          return {
            q: koq(`${L}=${R}`, u.q), a: u.a,
            easy: `$${k}a=${c}$、$${k}+a=b$`, verify: () => same(`(${lin(1, k)})(x+${pn(a)})`, `x^2+${pn(b)}x${sg(c)}`),
          };
        }
        const p = r.intNot(-4, 4, x => !x), qq = r.intNot(-9, 9, x => !x), L = poly([2, 4 * p, 2 * p * p + qq]), u = unk(['p', 'q'], [p, qq]);
        return {
          q: koq(`${L}=2(x+p)^2+q`, u.q), a: u.a,
          easy: `$4p=${4 * p}$、$${2 * p * p}+q=${2 * p * p + qq}$`, verify: () => same(L, `2(x+${pn(p)})^2+${pn(qq)}`),
        };
      },
      // わな：1つの $x$ でだけ成り立つ等式（係数は比べない）
      trap(r) {
        const x0 = r.int(2, 4), m = r.intNot(-5, 5, x => !x), n = r.intNot(-9, 9, x => !x), s = r.intNot(-9, 9, x => !x || x === n);
        const num = m * x0 + s - n;
        if (num % x0) return null;
        const p = num / x0;
        if (p === m || !p) return null;
        return dest({
          q: `$px${sg(n)}=${lin(m, s)}$ が $x=${x0}$ のとき《成|な》り《立|た》つ $p=□$`, a: `$p=${p}$`,
          verify: () => p * x0 + n === m * x0 + s || '成り立たない',
        }, '3-39', `$x=${x0}$ のときだけの《等式|とう|しき》。《係数|けい|すう》は《比|くら》べない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-40
  // 「恒等式になる」で、$A(x-r)+B(x-s)$（$x$ の係数が1のかっこ2つ、0になる $x$ が整数）
  function fits40(q) {
    if (!KO.test(q)) return false;
    const m = /([A-Z])\(([^()]+)\)\s*\+\s*([A-Z])\(([^()]+)\)/.exec(q);
    if (!m) return false;
    const a = monicLin(m[2]), b = monicLin(m[4]);
    return !!a && !!b && a.v === b.v && a.r !== b.r;
  }
  M.add({
    id: '3-40', part: 3, chap: '3-8⑨', stars: 1,
    title: '《消|け》したい《項|こう》が0になる $x$ を《入|い》れる',
    mark: '$A(x+1)+B(x-1)$ のように、**かっこが1《次式|じ|しき》** で、0になる $x$ が《整数|せい|すう》。',
    futsu: ['《右辺|う|へん》を《展開|てん|かい》して、', '$A+B=5$、$A-B=1$ の', '《連立方程式|れん|りつ|ほう|てい|しき》を《解|と》く。'],
    raku: ['$5x+1=A(x+1)+B(x-1)$', '$x=1$ で $B$ が《消|き》える：$6=2A$', '$x=-1$ で $A$ が《消|き》える：$-4=-2B$'],
    why: '《恒等式|こう|とう|しき》なので、どんな $x$ を《入|い》れてもよい。かっこが0になる $x$ なら、1つずつ《決|き》まる（3-8⑨）。',
    caution: 'かっこが0になる $x$ が《分数|ぶん|すう》のとき（$2x+1$ など）は、《係数|けい|すう》を《比|くら》べるほうが《楽|らく》なこともある。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '12mm',
    fits: fits40,
    steps: {
      s1(r) {
        const d1 = r.intNot(-4, 4, x => !x), s = r.intNot(-4, 4, x => !x || x === -d1), A = r.intNot(-6, 6, x => !x), B = r.intNot(-6, 6, x => !x || x === -A);
        return q40(A, B, 1, d1, s, 'x', false);
      },
      // 左が数だけ（$A+B=0$）／左に数の項がない
      s2(r) {
        const d1 = r.intNot(-5, 5, x => !x), s = r.intNot(-5, 5, x => !x || x === -d1), A = r.intNot(-4, 4, x => !x);
        const B = r.chance(0.5) ? -A : A * d1 / s;
        if (!Number.isInteger(B) || !B) return null;
        return q40(A, B, 1, d1, s, 'x', false);
      },
      // 文字を変える・左右を入れかえる・数が先のかっこ（$3-t$）
      s3(r) {
        const v = r.pick(['t', 'y']), c1 = r.pick([1, -1]), d1 = r.intNot(-4, 4, x => !x || (c1 < 0 && x < 0)), s =r.intNot(-4, 4, x => !x || x === -d1 / c1);
        const A = r.intNot(-6, 6, x => !x), B = r.intNot(-6, 6, x => !x || x === -A * c1);
        return q40(A, B, c1, d1, s, v, r.chance(0.6));
      },
      // わな：かっこが0になる $x$ が分数（係数を比べるほうが楽）
      trap(r) {
        const a = r.int(2, 3), b = r.intNot(2, 4, x => x === a), A = r.intNot(-4, 4, x => !x), B = r.intNot(-4, 4, x => !x);
        const m = a * A + b * B, n = A + B;
        if (!m) return null;
        const e = `A(${a}x+1)+B(${b}x+1)`, L = lin(m, n);
        return dest({
          q: koq(`${L}=${e}`, '$A=□$、$B=□$'), a: `$A=${A}$、$B=${B}$`,
          verify: () => same(L, `${pn(A)}(${a}x+1)+${pn(B)}(${b}x+1)`),
        }, '3-40', `0になる $x$ が《分数|ぶん|すう》。《係数|けい|すう》を《比|くら》べて $${a}A+${b}B=${m}$、$A+B=${n}$`);
      },
    },
  });
  // 3-40 の問題：右辺は $A(c_1v+d_1)+B(v-s)$（$c_1$ は ±1。−1 のときは数が先の「3-t」）
  function q40(A, B, c1, d1, s, v, swap) {
    const br1 = c1 === 1 ? lin(1, d1, v) : linC(-1, d1, v), br2 = lin(1, -s, v), r1 = -d1 / c1;
    const m = A * c1 + B, n = A * d1 - B * s;
    if (!m && !n) return null;
    const L = lin(m, n, v), R = `A(${br1})+B(${br2})`;
    const coef = (c, X) => (c === 1 ? X : c === -1 ? '-' + X : c + X);
    // $v=s$ で B の項が消え、$v=r_1$ で A の項が消える
    const Ls = m * s + n, Lr = m * r1 + n, kA = c1 * s + d1, kB = r1 - s;
    return {
      q: koq(swap ? R + '=' + L : L + '=' + R, '$A=□$、$B=□$'), a: `$A=${A}$、$B=${B}$`,
      easy: `$${v}=${s}$ で $${Ls}=${coef(kA, 'A')}$、$${v}=${r1}$ で $${Lr}=${coef(kB, 'B')}$`,
      verify: () => same(L, `${pn(A)}(${br1})+${pn(B)}(${br2})`),
    };
  }

  // ---------------------------------------------------------------- 3-41
  M.add({
    id: '3-41', part: 3, chap: '3-8⑩', stars: 1,
    title: '《平方完成|へい|ほう|かん|せい》は $x$ の《係数|けい|すう》の《半分|はん|ぶん》',
    mark: '$x^2+bx+c$ を **「（かっこ）の2《乗|じょう》＋《数|かず》」** の《形|かたち》にする。',
    futsu: ['$x^2+6x+10=(x+p)^2+q$ とおき、', '《右辺|う|へん》を《展開|てん|かい》して', '《係数|けい|すう》を《比|くら》べる。'],
    raku: ['6の《半分|はん|ぶん》は3。', '$x^2+6x+10=(x+3)^2-9+10$', '$=(x+3)^2+1$'],
    why: '$6x$ の《長方形|ちょう|ほう|けい》を《半分|はん|ぶん》ずつ2《辺|へん》にはり、《欠|か》けた《角|かど》 $3^2$ をうめると《正方形|せい|ほう|けい》（3-8⑩）。',
    caution: 'うめた $p^2$ をひいて《返|かえ》すのをわすれない（$(x+3)^2+10$ ではない）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '34mm',
    boxh: { trap: '12mm' },
    // $x^2$ の係数が1で、$x$ の係数が偶数（半分が整数）
    fits(q) {
      const t = norm(q);
      const m = /^平方完成：\$([^$]*)\$$/.exec(t) || /^\$([^$]*)\$ のいちばん小さい値/.exec(t);
      const f = m && quad(m[1]);
      return !!f && f.a === 1 && f.b !== 0 && f.b % 2 === 0;
    },
    steps: {
      s1(r) {
        const p = r.intNot(-6, 6, x => !x), c = r.intNot(-9, 15, x => x === p * p || x === 0);
        return pc(poly([1, 2 * p, c]), 1, [p, 1], [c - p * p, 1], `$(x${sg(p)})^2-${p * p}${sg(c)}$`);
      },
      // 数の項がない・ならびがちがう・文字がちがう
      s2(r) {
        const p = r.intNot(-7, 7, x => !x), t = r.int(0, 2), v = t === 2 ? r.pick(['t', 'y']) : 'x';
        const c = t === 0 ? 0 : r.intNot(-9, 20, x => x === p * p);
        const e = t === 1 ? T([[c, ''], [2 * p, 'x'], [1, 'x^2']]) : poly([1, 2 * p, c], v);
        return pc(e, 1, [p, 1], [c - p * p, 1], `$(${v}${sg(p)})^2-${p * p}${c ? sg(c) : ''}$`, v);
      },
      // いちばん小さい値（そのときの $x$）
      s3(r) {
        const p = r.intNot(-6, 6, x => !x), m = r.intNot(-9, 9, x => !x), c = m + p * p, e = poly([1, 2 * p, c]);
        const askX = r.chance(0.4);
        return {
          q: `$${e}$ のいちばん《小|ちい》さい《値|あたい》${askX ? 'になる $x$' : ''}`, a: `$${askX ? -p : m}$`,
          easy: `$${e}=(x${sg(p)})^2${sg(m)}$`, easyCheck: false,
          verify: () => { const f = x => ev(e, { x }); return (f(-p) === m && f(-p + 0.1) > m && f(-p - 0.1) > m) || 'いちばん小さい値がちがう'; },
        };
      },
      // わな：$x$ の係数が奇数（半分が分数。使えるが楽ではない）
      trap(r) {
        const b = r.pick([1, 3, 5, 7, -1, -3, -5]), c = r.int(-3, 4), h = Q(b, 2), k = qSub([c, 1], qMul(h, h));
        const e = poly([1, b, c]);
        const p = pc(e, 1, h, k, '');
        return dest(p, '3-41', '《半分|はん|ぶん》が《分数|ぶん|すう》になる。《使|つか》えるが《楽|らく》ではない');
      },
    },
  });
  // 平方完成の問題：e を a(x+h)^2+k に。h・k は分数 [n, d]
  function pc(e, a, h, k, easy, v) {
    v = v || 'x';
    const fracIn = h[1] !== 1;
    const inner = `${v}${h[0] < 0 ? '-' : '+'}${qTeX(h)}`;
    const sq = fracIn ? `\\left(${inner}\\right)^2` : `(${inner})^2`;
    const ans = `${a === 1 ? '' : a === -1 ? '-' : a}${sq}${k[0] ? (k[0] < 0 ? '-' : '+') + qTeX(k) : ''}`;
    return { q: `《平方完成|へい|ほう|かん|せい》：$${e}$`, a: `$${ans}$`, easy, verify: () => same(e, ans) };
  }

  // ---------------------------------------------------------------- 3-42
  M.add({
    id: '3-42', part: 3, chap: '3-8⑩', stars: 1,
    title: '$x^2$ に《数|かず》がかかっていたら《先|さき》にくくって《平方完成|へい|ほう|かん|せい》',
    mark: '$x^2$ の《係数|けい|すう》が **1でない**（$2x^2-8x+5$、$-5t^2+20t$）。',
    futsu: ['$2x^2-8x+5=a(x+p)^2+q$ とおき、', '《展開|てん|かい》して3つの《係数|けい|すう》を', '《比|くら》べる。'],
    raku: ['$2x^2-8x+5=2(x^2-4x)+5$', '$=2\\{(x-2)^2-4\\}+5$', '$=2(x-2)^2-3$'],
    why: 'くくると、かっこの《中|なか》は $x^2$ の《係数|けい|すう》が1になり、わざ 3-41 がそのまま《使|つか》える（3-8⑩）。',
    caution: 'かっこをはずすとき、《外|そと》の《数|かず》をかけわすれない（$2\\times(-4)=-8$）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '34mm',
    cols: { s3: 1 },
    boxh: { trap: '12mm' },
    // $x^2$ の係数が1でなく、$x$ の係数が「$x^2$ の係数×2」でわれる。ボールのいちばん高い所
    fits(q) {
      const t = norm(q);
      if (/いちばん高い/.test(t) && /\$h=/.test(t)) return true;
      const m = /^平方完成：\$([^$]*)\$$/.exec(t) || /^\$([^$]*)\$ のいちばん小さい値/.exec(t);
      const f = m && quad(m[1]);
      return !!f && f.a !== 1 && f.a !== 0 && f.b !== 0 && f.b % (2 * f.a) === 0;
    },
    steps: {
      s1(r) {
        const a = r.int(2, 5), p = r.intNot(-4, 4, x => !x), c = r.intNot(-9, 9, x => !x), k = c - a * p * p;
        return pc42(a, p, c, k, 'x');
      },
      // $x^2$ の係数がマイナス
      s2(r) {
        const a = r.pick([-1, -2, -3, -5]), p = r.intNot(-4, 4, x => !x), c = r.int(-6, 9), k = c - a * p * p, v = a === -5 ? 't' : 'x';
        return pc42(a, p, c, k, v);
      },
      // ボールのいちばん高い所・いちばん小さい値
      s3(r) {
        if (r.chance(0.6)) {
          const v = r.pick([10, 20, 30, 40]), h0 = r.pick([0, 0, 1, 2, 5, 10]), T0 = v / 10, top = h0 + v * v / 20;
          const e = T([[v, 't'], [-5, 't^2'], [h0, '']]), askT = r.chance(0.4);
          return {
            q: `ボールの《高|たか》さ $h=${e}$（m）。いちばん《高|たか》いのは ${askT ? '□《秒後|びょう|ご》' : '□ m'}`, a: `$${askT ? T0 : top}$`,
            easy: `$h=-5(t-${T0})^2${h0 + v * v / 20 ? '+' + top : ''}$`, easyCheck: false,
            verify: () => { const f = t => ev(e, { t }); return (near(f(T0), top) && f(T0 + 0.1) < top && f(T0 - 0.1) < top) || 'いちばん高い所がちがう'; },
          };
        }
        const a = r.int(2, 4), p = r.intNot(-3, 3, x => !x), m = r.intNot(-9, 9, x => !x), c = m + a * p * p, e = poly([a, 2 * a * p, c]);
        return {
          q: `$${e}$ のいちばん《小|ちい》さい《値|あたい》`, a: `$${m}$`, easy: `$${e}=${a}(x${sg(p)})^2${sg(m)}$`, easyCheck: false,
          verify: () => { const f = x => ev(e, { x }); return (f(-p) === m && f(-p + 0.1) > m && f(-p - 0.1) > m) || 'いちばん小さい値がちがう'; },
        };
      },
      // わな：くくるとかっこの中の $x$ の係数が奇数（半分が分数）
      trap(r) {
        const a = r.pick([2, 3]), j = r.pick([1, 3, 5, -1, -3]), c = r.int(-3, 5), b = a * j;
        const h = Q(j, 2), k = qSub([c, 1], qMul([a, 1], qMul(h, h))), e = poly([a, b, c]);
        const p = pc(e, a, h, k, '');
        return dest(p, '3-42', 'くくると《半分|はん|ぶん》が《分数|ぶん|すう》になる。《使|つか》えるが《楽|らく》ではない');
      },
    },
  });
  function pc42(a, p, c, k, v) {
    const e = poly([a, 2 * a * p, c], v);
    const A = a === -1 ? '-' : String(a);
    const p0 = pc(e, a, [p, 1], [k, 1], '', v);
    p0.easy = `$${A}(${poly([1, 2 * p, 0], v)})${c ? sg(c) : ''}=${A}\\{(${v}${sg(p)})^2-${p * p}\\}${c ? sg(c) : ''}$`;
    return p0;
  }

  // ---------------------------------------------------------------- 3-43
  // $\frac{N}{(x-r)(x-s)}$ の答え：$\frac{A}{x-r}+\frac{B}{x-s}$ の形の式
  const par = D => (/^[a-z]$/.test(D) ? D : `(${D})`);
  const fracTerm = (c, den, first) => { if (!c[0]) return ''; const s = c[0] < 0 ? '-' : (first ? '' : '+'); return `${s}\\frac{${Math.abs(c[0])}}{${c[1] === 1 ? den : c[1] + par(den)}}`; };
  M.add({
    id: '3-43', part: 3, chap: '3-8', stars: 1,
    title: '《部分分数分解|ぶ|ぶん|ぶん|すう|ぶん|かい》',
    mark: '$\\frac{1}{(x+a)(x+b)}$：**《分母|ぶん|ぼ》が1《次式|じ|しき》のかけ《算|ざん》**。',
    futsu: ['$\\frac{A}{x+1}+\\frac{B}{x+2}$ を《通分|つう|ぶん》して、', '《分子|ぶん|し》の《係数|けい|すう》を《比|くら》べる。'],
    raku: ['《分母|ぶん|ぼ》をはらう：$1=A(x+2)+B(x+1)$', '$x=-1$ で $A=1$、$x=-2$ で $B=-1$', '$\\frac{1}{(x+1)(x+2)}=\\frac{1}{x+1}-\\frac{1}{x+2}$'],
    why: '《分母|ぶん|ぼ》をはらうと《恒等式|こう|とう|しき》になり、かっこが0になる $x$ を《入|い》れると $A$、$B$ が1つずつ《決|き》まる（わざ 3-40）。',
    caution: '《分子|ぶん|し》と《分母|ぶん|ぼ》に《同|おな》じかっこがあれば、《先|さき》に《約分|やく|ぶん》する。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    boxw: '24mm',
    boxh: '12mm',
    fits(q) {
      const m = /^\\frac\{([^{}]*)\}\{(\([^()]+\)|[a-z])(\([^()]+\)|[a-z])\}$/.exec(only(q) || '');
      if (!m) return false;
      const strip = t => t.replace(/^\(|\)$/g, '');
      const a = monicLin(strip(m[2])), b = monicLin(strip(m[3])), n = terms(m[1]);
      if (!a || !b || a.v !== b.v || a.r === b.r || !n) return false;
      // 分子が分母のかっこの何倍か（約分できる）なら false
      const nx = coefOf(n, a.v), nc = coefOf(n, '');
      return ![a, b].some(f => nx !== 0 && Math.abs(nc + nx * f.r) < 1e-9);
    },
    steps: {
      s1(r) {
        const a = r.int(-5, 6), v = 'x';
        return pf(1, a, a + 1, v);
      },
      // かっこの数のちがいが 2・3（分子がその数か、1）
      s2(r) {
        const a = r.int(-4, 5), d = r.pick([2, 3]), num = r.chance(0.5) ? d : 1;
        return pf(num, a, a + d, 'x');
      },
      // 分子が1次式（$\frac{5x+1}{(x+1)(x-1)}$）・文字がちがう
      s3(r) {
        const v = r.pick(['x', 'x', 't']), rr = r.intNot(-4, 4, x => !x), s = r.intNot(-4, 4, x => !x || x === rr), A = r.intNot(-5, 5, x => !x), B = r.intNot(-5, 5, x => !x || x === -A);
        // 分子 = A(v - s) + B(v - rr)
        const nx = A + B, nc = -(A * s + B * rr);
        const N = lin(nx, nc, v), D1 = lin(1, -rr, v), D2 = lin(1, -s, v);
        const ans = fracTerm([A, 1], D1, true) + fracTerm([B, 1], D2, false);
        return { q: `$\\frac{${N}}{(${D1})(${D2})}$`, a: `$${ans}$`, easy: `$${N}=A(${D2})+B(${D1})$`, easyCheck: false, key: `pf${v}|${[D1, D2].sort().join('|')}|${N}` };
      },
      // わな：分子が分母のかっこの何倍か（約分するだけ）
      trap(r) {
        const k = r.int(1, 4), a = r.intNot(-4, 4, x => !x), b = r.intNot(-4, 4, x => !x || x === a);
        const N = lin(k, k * a), D1 = lin(1, a), D2 = lin(1, b);
        return dest({ q: `$\\frac{${N}}{(${D1})(${D2})}$`, a: `$\\frac{${k}}{${D2}}$` }, '3-43', '《約分|やく|ぶん》するだけ');
      },
    },
  });
  // $\frac{num}{(x+a)(x+b)}$（a < b）
  function pf(num, a, b, v) {
    const D1 = lin(1, a, v), D2 = lin(1, b, v), d = b - a, c = Q(num, d);
    const ans = fracTerm(c, D1, true) + fracTerm([-c[0], c[1]], D2, false);
    const swap = a % 2 === 0;
    // $x$ だけのかっこは前に（$x(x+1)$）
    const den = (swap && D1 !== 'x') || D2 === 'x' ? par(D2) + par(D1) : par(D1) + par(D2);
    return { q: `$\\frac{${num}}{${den}}$`, a: `$${ans}$`, easy: `$${v}=${-a}$ で $A=${qTeX(c)}$、$${v}=${-b}$ で $B=-${qTeX(c)}$`, easyCheck: false, key: `pf${num}|${a}|${b}` };
  }

  // ---------------------------------------------------------------- 3-95
  // 項 [[係数, 文字], …] の和の2乗：2乗3つ、2つずつの積の2倍3つ（$a^2+b^2+c^2+2ab+2bc+2ca$ の順）
  const mono = (x, y) => { const s = (x + y).split('').filter(ch => /[a-z]/.test(ch)); const cnt = {}; s.forEach(ch => { cnt[ch] = (cnt[ch] || 0) + 1; }); return Object.keys(cnt).sort().map(ch => cnt[ch] > 1 ? `${ch}^${cnt[ch]}` : ch).join(''); };
  function sq3(ts) {
    const [p, q, r] = ts;
    return T([[p[0] * p[0], mono(p[1], p[1])], [q[0] * q[0], mono(q[1], q[1])], [r[0] * r[0], mono(r[1], r[1])],
      [2 * p[0] * q[0], mono(p[1], q[1])], [2 * q[0] * r[0], mono(q[1], r[1])], [2 * r[0] * p[0], mono(r[1], p[1])]]);
  }
  // 楽な形：$x^2+y^2+6^2+2\times x\times y+2\times y\times6+2\times6\times x$（マイナスの項はかっこ）
  function sq3ez(ts) {
    const sq = t => (t[1] && t[0] === 1 ? (t[1].includes('^') ? `(${t[1]})^2` : `${t[1]}^2`) :!t[1] && t[0] > 0 ? `${t[0]}^2` : `(${T([t])})^2`);
    const f = t => (t[0] < 0 ? `(${T([t])})` : T([t]));
    const [p, q, r] = ts;
    return `2《乗|じょう》は $${sq(p)}$、$${sq(q)}$、$${sq(r)}$。2《倍|ばい》は $2\\times ${f(p)}\\times ${f(q)}$、$2\\times ${f(q)}\\times ${f(r)}$、$2\\times ${f(r)}\\times ${f(p)}$`;
  }
  M.add({
    id: '3-95', part: 3, chap: '3-8', stars: 1,
    title: '$(a+b+c)^2$',
    mark: '**3つの《項|こう》のかっこ** の2《乗|じょう》（$(x+y+1)^2$）。',
    futsu: ['$(x+y+1)(x+y+1)$ の', '9つの《組|く》み《合|あ》わせを', 'かけてたす。'],
    raku: ['2《乗|じょう》が3つと、2つずつの《積|せき》の2《倍|ばい》。', '$(x+y+1)^2$', '$=x^2+y^2+1+2xy+2y+2x$'],
    why: '1《辺|ぺん》 $a+b+c$ の《正方形|せい|ほう|けい》は、$a^2$、$b^2$、$c^2$ が1まい、$ab$、$bc$、$ca$ が2まいずつ（3-8）。',
    caution: '$a^2+b^2+c^2$ だけではない。マイナスの《項|こう》は《符号|ふ|ごう》ごと2《乗|じょう》・かけ《算|ざん》する。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '64mm',
    fits(q) { const s = powOf(only(q), 2); return !!s && topTerms(s).length === 3; },
    steps: {
      s1(r) {
        const [u, w] = r.pick([['x', 'y'], ['a', 'b'], ['s', 't']]), k = r.int(1, 6), c = r.pick([1, 1, 2]);
        const ts = [[1, u], [c, w], [k, '']];
        return { q: `$(${T(ts)})^2$`, a: `$${sq3(ts)}$`, easy: sq3ez(ts), easyCheck: false };
      },
      // マイナスの項・文字が3つ
      s2(r) {
        if (r.chance(0.4)) {
          const s1 = r.pick([1, -1]), s2 = r.pick([1, -1]);
          if (s1 === 1 && s2 === 1) return null;
          const ts = [[1, 'a'], [s1, 'b'], [s2, 'c']];
          return { q: `$(${T(ts)})^2$`, a: `$${sq3(ts)}$`, easy: `$a^2+b^2+c^2${s1 < 0 ? '-' : '+'}2ab${s1 * s2 < 0 ? '-' : '+'}2bc${s2 < 0 ? '-' : '+'}2ca$` };
        }
        const [u, w] = r.pick([['x', 'y'], ['a', 'b']]), a = r.pick([1, 2]), b = r.pick([-1, -2, 1, 2]), k = r.intNot(-5, 5, x => !x);
        if (b > 0 && k > 0) return null;
        const ts = [[a, u], [b, w], [k, '']];
        return { q: `$(${T(ts)})^2$`, a: `$${sq3(ts)}$`, easy: sq3ez(ts), easyCheck: false };
      },
      // $(x^2+x+1)^2$（同じ文字の項をまとめる）
      s3(r) {
        const b = r.intNot(-3, 3, x => !x), c = r.intNot(-3, 3, x => !x), P = [c, b, 1];
        return { q: `$(${poly([1, b, c])})^2$`, a: `$${poly(hi(pmul(P, P)))}$`, easy: sq3ez([[1, 'x^2'], [b, 'x'], [c, '']]) + '。《同|おな》じ《次数|じ|すう》をまとめる', easyCheck: false };
      },
      // わな：2乗ではない $(x+k+y)(x+k-y)$（$(x+k)^2-y^2$。和と差の積）
      trap(r) {
        const k = r.int(1, 5), [u, w] = r.pick([['x', 'y'], ['a', 'b']]);
        const A = `${u}+${k}`;
        return dest({
          q: `$(${u}+${w}+${k})(${u}-${w}+${k})$`, a: `$${T([[1, u + '^2'], [2 * k, u], [k * k, ''], [-1, w + '^2']])}$`,
        }, '3-95', `2《乗|じょう》ではない。$(${A})^2-${w}^2$ と《見|み》る`, ['3-30']);
      },
    },
  });

  // ---------------------------------------------------------------- 3-96
  // 数の分数の和を分数で（[分子, 分母]）
  const sumQ = list => list.reduce((s, x) => qAdd(s, x), [0, 1]);
  const fq = x => (x[1] === 1 ? String(x[0]) : `${x[0] < 0 ? '-' : ''}\\frac{${Math.abs(x[0])}}{${x[1]}}`);
  M.add({
    id: '3-96', part: 3, chap: '3-8', stars: 2,
    title: '《部分分数|ぶ|ぶん|ぶん|すう》で《和|わ》を《消|け》す',
    mark: '$\\frac{1}{1\\times2}+\\frac{1}{2\\times3}+\\cdots$：**《分母|ぶん|ぼ》がつながったかけ《算|ざん》**。',
    futsu: ['9つの《分数|ぶん|すう》を《通分|つう|ぶん》してたす。', '《分母|ぶん|ぼ》がとても《大|おお》きくなる。'],
    raku: ['$\\frac{1}{1\\times2}=1-\\frac{1}{2}$、$\\frac{1}{2\\times3}=\\frac{1}{2}-\\frac{1}{3}$', 'まん《中|なか》が《消|き》えて、', '$1-\\frac{1}{10}=\\frac{9}{10}$'],
    why: '$\\frac{1}{n(n+1)}=\\frac{1}{n}-\\frac{1}{n+1}$ で、《最初|さい|しょ》と《最後|さい|ご》だけがのこる。',
    caution: '$1\\times2$、$3\\times4$ のようにつながっていないと《消|き》えない。',
    counts: { s1: 8, s2: 5, s3: 5, trap: 2 },
    cols: 1,
    boxw: '20mm',
    boxh: '10mm',
    // 分母がつながったかけ算の分数の和（$\cdots$ をふくんでよい）、$\frac{1}{x(x+1)}+\frac{1}{(x+1)(x+2)}$
    fits(q) {
      const s = only(q);
      if (!s) return false;
      if (/\\frac\{1\}\{(?:[a-z]|\([a-z]\+\d+\))\([a-z]\+\d+\)\}\+\\frac\{1\}\{\([a-z]\+\d+\)\([a-z]\+\d+\)\}/.test(s)) return true;
      const fs = [...s.matchAll(/\\frac\{\d+\}\{(\d+)\s*\\times\s*(\d+)\}/g)].map(m => [+m[1], +m[2]]);
      if (fs.length < 2) return false;
      const d = fs[0][1] - fs[0][0], dots = /\\cdots/.test(s);
      if (d <= 0 || fs.some(f => f[1] - f[0] !== d) || fs[0][1] !== fs[1][0]) return false;
      for (let i = 0; i + 1 < fs.length; i++) {
        const g = fs[i + 1][0] - fs[i][1];
        if (g !== 0 && !(dots && g > 0 && g % d === 0)) return false;
      }
      return true;
    },
    steps: {
      // 1 から n まで
      s1(r) {
        const n = r.int(4, 19);
        return tel(1, n, 1, 1);
      },
      // とちゅうから・分母が2ずつ
      s2(r) {
        if (r.chance(0.5)) { const m = r.int(2, 5), n = r.int(m + 3, 15); return tel(m, n, 1, 1); }
        const n = r.int(3, 9), num = r.pick([1, 2]);
        return tel(1, 2 * n - 1, 2, num);
      },
      // 3つだけ・文字の式・$\frac{1}{3}+\frac{1}{15}+\frac{1}{35}$（かけ算が見えない）
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const a = r.int(0, 2), k = a === 0 ? r.int(2, 3) : 2;
          const D = i => (i === 0 ? 'x' : `x+${i}`), DD = i => (i === 0 ? 'x' : `(x+${i})`);
          const fs = Array.from({ length: k }, (_, i) => `\\frac{1}{${DD(a + i)}${DD(a + i + 1)}}`);
          const e = fs.join('+');
          return { q: `$${e}$`, a: `$\\frac{${k}}{${DD(a)}${DD(a + k)}}$`, easy: `$\\frac{1}{${D(a)}}-\\frac{1}{${D(a + k)}}$`, verify: () => same(e, `\\frac{${k}}{${DD(a)}${DD(a + k)}}`) };
        }
        if (t === 1) {
          const m = r.int(2, 6);
          const fs = [0, 1, 2].map(i => `\\frac{1}{${m + i}\\times ${m + i + 1}}`);
          return { q: `$${fs.join('+')}$`, a: `$${fq(qSub([1, m], [1, m + 3]))}$`, easy: `$\\frac{1}{${m}}-\\frac{1}{${m + 3}}$` };
        }
        const k = r.int(3, 4), st = r.pick([1, 3]);
        const dens = Array.from({ length: k }, (_, i) => (st + 2 * i) * (st + 2 * i + 2));
        const val = qMul([1, 2], qSub([1, st], [1, st + 2 * k]));
        return { q: `$${dens.map(d => `\\frac{1}{${d}}`).join('+')}$`, a: `$${fq(val)}$`, easy: `$\\frac{1}{2}\\left(${st === 1 ? '1' : `\\frac{1}{${st}}`}-\\frac{1}{${st + 2 * k}}\\right)$` };
      },
      // わな：分母がつながっていない（$\frac{1}{1\times2}+\frac{1}{3\times4}+\frac{1}{5\times6}$）
      trap(r) {
        const s = r.int(1, 3), fs = (r.chance(0.5) ? [0, 2] : [0, 2, 4]).map(i => [s + i, s + i + 1]);
        const val = sumQ(fs.map(([a, b]) => [1, a * b]).map(x => Q(x[0], x[1])));
        return dest({ q: `$${fs.map(([a, b]) => `\\frac{1}{${a}\\times ${b}}`).join('+')}$`, a: `$${fq(val)}$` }, '3-96', '《分母|ぶん|ぼ》がつながっていない。となりが《消|き》えない');
      },
    },
  });
  // 楽な形が式1つで「＝」をふくむときは、「$A$ ＝ $B$」に分ける（こたえのページで、＝ のところで改行できるように）
  ['3-28', '3-29', '3-30', '3-31', '3-32', '3-33', '3-34', '3-35', '3-36', '3-37', '3-38', '3-39', '3-40', '3-41', '3-42', '3-43', '3-95', '3-96'].forEach(id => {
    const st = M.waza[id].steps;
    Object.keys(st).forEach(k => {
      const fn = st[k];
      st[k] = r => {
        const p = fn(r);
        if (p && typeof p.easy === 'string' && /^\$[^$]*\$$/.test(p.easy) && p.easy.includes('=')) p.easy = p.easy.split('=').join('$ ＝ $');
        return p;
      };
    });
  });

  // $\frac{num}{m(m+d)}+\cdots+\frac{num}{n(n+d)}$
  function tel(m, n, d, num) {
    const terms0 = [];
    for (let i = m; i <= n; i += d) terms0.push(i);
    const f = i => `\\frac{${num}}{${i}\\times ${i + d}}`;
    const e = terms0.length > 4 ? `${f(terms0[0])}+${f(terms0[1])}+\\cdots+${f(terms0[terms0.length - 1])}` : terms0.map(f).join('+');
    const val = sumQ(terms0.map(i => Q(num, i * (i + d))));
    const c = Q(num, d), last = terms0[terms0.length - 1] + d;
    const easy = c[0] === 1 && c[1] === 1 ? `$\\frac{1}{${m}}-\\frac{1}{${last}}$` : `$${qTeX(c)}\\left(\\frac{1}{${m}}-\\frac{1}{${last}}\\right)$`;
    return {
      q: `$${e}$`, a: `$${fq(val)}$`, easy: easy.replace('\\frac{1}{1}', '1'),
      verify: () => M.sameVal(val, qMul(c, qSub([1, m], [1, last]))) || '和がちがう',
    };
  }
})(globalThis.MONDAI);
