/* 問題集 第5巻　第6部 置換・部分積分・テイラー展開・まとめ（わざ 5-76〜5-90、5-97〜5-99）　組 f
 * 書き方は v5/README.md（第5巻の手引き）と v4/README.md・v2/README.md。文は教科書 第5巻と同じ：ルビなし・常用漢字まで。式は $…$。
 * 教科書 5-16〜5-18 にそろえる：「はんい」はかなで書く（5-16。L-7）。e はネイピア数（定数）。不定積分の答えには +C（L-5）。
 * 検算：不定積分は calc（kind 'int'）、定積分は calc（kind 'defint'）。5-80 の √(r^2-x^2) だけは verify（DEF：はしで傾きが立ち、
 *   calc のシンプソン法では合わないので、x=r sin θ とおきかえた式をガウス・ルジャンドルの数値積分で積分して答えとくらべる）。
 *   微分方程式の解・近似値・展開・ことばの答えは verify(p) で、代入して式が成り立つか、別の道すじ（ほんとうの値とのずれ、係数の別の求め方）で確かめる。
 * 近似の答えは、分数（M.F）で計算してから決めたけたにし、問題の文に「\approx □」と、使う値・けたを書く（K-3・L-3）。
 * 図は 5-80 のステップ3だけ（円の 1/4・半円・左がわの 1/4。K-2）。
 * 文の長いわざは、見開きの右ページに入るように、列（cols）と問題数（counts）を決めた（5-87 は s2 5問、5-88 は s2 4問・s3 3問）。
 * 同じ形の問題がかたよらないように、key を形ごと（'k0' など）や cap() で決めたステップがある（その形は1つの見開きに1〜3問まで）。
 * わなは、そのわざ自身で解けない問題にし、行き先（わざの番号か「楽な形なし」）をかならず書く（N-3。dest）。
 * 見わけよう（fits）：積分の中身は、数を入れて「中身の微分の何倍か」をくらべて見分ける（chainOf）。 */
(function (M) {
  'use strict';
  const F = M.F, P = M.P;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const gcd = (a, b) => F.gcd(a, b);
  const fmt = v => String(+(+v).toFixed(10));                       // 0.30000000004 → 0.3
  const rhsOf = a => { const t = strip(a); return t.slice(t.lastIndexOf('=') + 1); };
  const numOK = (ans, want, tol) => { const v = ev(strip(ans)); return near(v, want, tol) || `答え ${ans} は ${fmt(want)} のはず`; };

  // ---------------------------------------------------------------- 数の書き方
  // 分数 f の、正確な小数（分母が 2 と 5 だけのとき）
  function decStr(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1n;
    while (k < 15 && (BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) { k++; p *= 10n; }
    if ((BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) return null;
    const N = (BigInt(Math.abs(n)) * p / BigInt(d)).toString().padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  // 分数 f を、小数第 k 位までに四捨五入した文字
  function roundStr(f, k) {
    const [n, d] = f, sg = n < 0 ? '-' : '', p = 10n ** BigInt(k);
    const N = ((2n * BigInt(Math.abs(n)) * p + BigInt(d)) / (2n * BigInt(d))).toString().padStart(k + 1, '0');
    const t = k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N;
    return (/[1-9]/.test(t) ? sg : '') + t;
  }
  const D = s => F.fromDec(String(s));                               // '0.05' → 分数
  // ほんとうの値（小数。e^3 などで、ちょうど …5 にはならない）を小数第 k 位までに丸めた文字（roundStr とくらべる。O-4）
  const trueRd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  const dt = f => decStr(f);                                         // 分数 → '0.05'
  // 係数 c（分数）× 式 body。over：分数のとき body を分子に（\frac{(x^2+1)^4}{8}）
  function cx(c, body, over) {
    const [n, d] = c; if (n === 0) return '0';
    const sg = n < 0 ? '-' : '', a = Math.abs(n);
    if (d === 1) return sg + (a === 1 ? body : a + body);
    if (over) return `${sg}\\frac{${a === 1 ? '' : a}${body}}{${d}}`;
    return `${sg}\\frac{${a}}{${d}}${body}`;
  }
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  // e の右肩：k=1 → e^{x}、k=-1 → e^{-x}、k=2 → e^{2x}、k=-0.1 → e^{-0.1t}
  const kv = (k, v) => (k === 1 ? v : k === -1 ? '-' + v : fmt(k) + v);
  const ex = (k, v) => `e^{${kv(k, v)}}`;
  // \sin x・\sin2x・\cos3t
  const trig = (fn, k, v) => `\\${fn}${k === 1 ? ' ' : k}${v}`;
  // π の n/d 倍
  function piTeX(n, d) {
    const g = gcd(n, d); n /= g; d /= g;
    if (n === 0) return '0';
    const sg = n < 0 ? '-' : '', a = Math.abs(n), num = `${a === 1 ? '' : a}\\pi`;
    return d === 1 ? sg + num : `${sg}\\frac{${num}}{${d}}`;
  }
  // 積分の式
  const INT = (body, v, lo, hi) => `\\displaystyle\\int${lo != null ? `_{${lo}}^{${hi}}` : ''} ${body}\\,\\dd ${v || 'x'}`;
  // 多項式 D を、かけ算の前に置く形（係数が整数のときだけ。2項以上はかっこ）
  function polyFactor(Dp, v) {
    if (Dp.some(c => c[1] !== 1)) return null;
    const nz = Dp.filter(c => c[0] !== 0).length, t = P.tex(Dp, v);
    return nz > 1 ? `(${t})` : t;
  }
  // c·e^{n} の和（[係数, 指数] の配列）を TeX に。正の項を先に（e-2、2-5e^{-1}）
  function eSum(terms) {
    const m = new Map();
    terms.forEach(([c, n]) => m.set(n, (m.get(n) || 0) + c));
    const ts = [...m].filter(([, c]) => c !== 0).map(([n, c]) => {
      const body = n === 0 ? '' : n === 1 ? 'e' : `e^{${n}}`;
      if (!body) return String(c);
      return (c === -1 ? '-' : c === 1 ? '' : String(c)) + body;
    });
    return sum(ts.filter(t => !/^-/.test(t)).concat(ts.filter(t => /^-/.test(t))));
  }

  // 多項式を、次数の小さい順に（1+10x+45x^2、x-\frac{x^{2}}{2}+\frac{x^{3}}{3}。教科書 5-17 と同じ形）。分子が1の分数は \frac{x^{2}}{8}
  function ascTeX(A, v) {
    v = v || 'x';
    return sum(A.map((c, k) => {
      if (!c || c[0] === 0) return '';
      const sg = c[0] < 0 ? '-' : '', n = Math.abs(c[0]), d = c[1], xk = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
      if (k === 0) return sg + F.tex([n, d]);
      if (d === 1) return sg + (n === 1 ? '' : n) + xk;
      return n === 1 ? `${sg}\\frac{${xk}}{${d}}` : `${sg}\\frac{${n}}{${d}}${xk}`;
    }));
  }
  // 係数の書き方：1 → ''、-1 → '-'（f'=-f、\ddot{x}=-x）
  const co = a => (String(a) === '1' ? '' : String(a) === '-1' ? '-' : String(a));
  // key の部品：同じ形の問題を、1つの見開きに n 問までにする（s が同じなら同じ key。形がかたよらないように）
  const cap = (prefix, s, n) => prefix + (M.hash(String(s)) % n);

  // ---------------------------------------------------------------- 検算の部品
  // 定積分の確かめ（verify）：中身 body（TeX）を a〜b で数値積分（ガウス・ルジャンドル5点×32区間）して、答えの値とくらべる。
  //   R：中身に \sqrt{R^2-x^2} があるとき。はしで傾きが立つので、x=R sin θ とおきかえた式を θ で積分する（教科書 5-16⑥ と同じおきかえ）
  const GLX = [0.5384693101056831, 0.9061798459386640], GLW = [0.5688888888888889, 0.4786286704993665, 0.2369268850561891];
  function quad(g, a, b, n) {
    n = n || 32; const h = (b - a) / n; let s = 0;
    for (let i = 0; i < n; i++) { const m = a + (i + 0.5) * h; s += GLW[0] * g(m); for (let j = 0; j < 2; j++) s += GLW[j + 1] * (g(m + GLX[j] * h / 2) + g(m - GLX[j] * h / 2)); }
    return s * h / 2;
  }
  function defOK(ans, body, lo, hi, v, R) {
    v = v || 'x';
    const a = ev(String(lo)), b = ev(String(hi)), va = ev(strip(ans));
    if (a == null || b == null || va == null) return `はしか答えが読めない（${ans}）`;
    const f = x => { const y = ev(body, { [v]: x }); return y == null ? NaN : y; };
    const I = R ? quad(th => f(R * Math.sin(th)) * R * Math.cos(th), Math.asin(a / R), Math.asin(b / R)) : quad(f, a, b);
    if (!isFinite(I)) return `中身が読めない（${body}）`;
    return Math.abs(I - va) <= 1e-8 * Math.max(1, Math.abs(I)) || `定積分がちがう（${fmt(I)} と ${ans}）`;
  }
  const DEF = (body, lo, hi, v, R) => p => defOK(p.a, body, lo, hi, v, R);
  const dnum = (f, t, h) => (f(t + h) - f(t - h)) / (2 * h);
  const d2num = (f, t, h) => (f(t + h) - 2 * f(t) + f(t - h)) / (h * h);
  // 答えの式（＝ の右、変数 v）が、x'=k(x-s)（order 1）か x''=k x（order 2）をみたし、はじめの値も合うか
  function deOK(ans, o) {
    const R = rhsOf(ans), V = o.v || 't', f = t => ev(R, Object.assign({ [V]: t }, o.vars || {}));
    if (f(0.3) == null) return `答えの式が読めない（${ans}）`;
    for (const t of [0.13, 0.57, 1.1]) {
      const lhs = o.order === 2 ? d2num(f, t, 1e-4) : dnum(f, t, 1e-5), rhs = o.order === 2 ? o.k * f(t) : o.k * (f(t) - (o.s || 0));
      if (Math.abs(lhs - rhs) > 1e-5 * Math.max(Math.abs(lhs), Math.abs(rhs)) + 1e-7) return `${o.order === 2 ? '2回' : ''}微分した式が成り立たない（t=${t}）`;
    }
    if (o.x0 != null && !near(f(0), o.x0, 1e-9)) return `はじめの値が ${o.x0} にならない（${ans}）`;
    if (o.v0 != null && Math.abs(dnum(f, 0, 1e-5) - o.v0) > 1e-6 * Math.max(1, Math.abs(o.v0))) return `はじめの速度が ${o.v0} にならない（${ans}）`;
    return true;
  }
  // 中かっこ・かっこの対応
  function bEnd(s, i, o, c) { o = o || '{'; c = c || '}'; let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === o) d++; else if (s[j] === c) { d--; if (!d) return j; } } return -1; }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 文の中の積分 \int_{lo}^{hi} body \,\dd v を取り出す
  function integ(q) {
    const k = q.indexOf('\\int'); if (k < 0) return null;
    let i = k + 4, lo = null, hi = null;
    const grab = () => {
      if (q[i] === '{') { const j = bEnd(q, i); const t = q.slice(i + 1, j); i = j + 1; return t; }
      return q[i++];
    };
    if (q[i] === '_') { i++; lo = grab(); if (q[i] === '^') { i++; hi = grab(); } }
    const m = /\\,\\dd\s*(\\theta|[a-z])/.exec(q.slice(i)); if (!m) return null;
    return { lo, hi, def: lo != null, body: q.slice(i, i + m.index).trim(), v: m[1].replace('\\', '') };
  }
  // 積分の中身が「(中身の式) × 中身の微分の r 倍」の形か（数を入れて調べる）。
  //   中身の候補：(G)^{n}・\sqrt{G}・e^{G}・\sin(G)・\cos(G)・\sin^{n}x・\ln x・\frac{A}{G}（log）・\frac{A}{(G)^{n}}
  //   中身の微分が定数（1次式）のものは除く（それは置換のわざではない）。答え：[{ log, r }]
  function chainOf(body, v) {
    const vars = x => ({ [v]: x }), B = x => ev(body, vars(x)), out = [];
    const cands = [], s = body;
    const pw = n => u => Math.pow(u, n);
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') {
        const j = bEnd(s, i, '(', ')'); if (j < 0) continue;
        const G = s.slice(i + 1, j), before = s.slice(0, i), after = s.slice(j + 1);
        const fn = /\\(sin|cos|ln|tan|exp)\s*$/.exec(before);
        if (fn) { if (fn[1] === 'sin' || fn[1] === 'cos') cands.push({ G, out: Math[fn[1]] }); continue; }
        if (after.startsWith('^{')) { const n = ev(after.slice(2, bEnd(after, 1))); if (n != null) cands.push({ G, out: pw(n) }); }
      } else if (s.startsWith('\\sqrt{', i)) {
        const j = bEnd(s, i + 5); cands.push({ G: s.slice(i + 6, j), out: pw(0.5) });
      } else if (s.startsWith('e^{', i) && !/[a-zA-Z\\]$/.test(s.slice(0, i).replace(/\s+$/, '').slice(-1) === '\\' ? 'x' : '')) {
        const j = bEnd(s, i + 2); cands.push({ G: s.slice(i + 3, j), out: Math.exp });
      } else if (s.startsWith('\\frac{', i)) {
        const j = bEnd(s, i + 5), k2 = bEnd(s, j + 1), Bt = s.slice(j + 2, k2).trim();
        cands.push({ G: Bt, out: u => 1 / u, log: true });
        let m;
        if (Bt[0] === '(' && bEnd(Bt, 0, '(', ')') > 0 && (m = /^\^\{(.+)\}$/.exec(Bt.slice(bEnd(Bt, 0, '(', ')') + 1)))) { const n = ev(m[1]); if (n != null) cands.push({ G: Bt.slice(1, bEnd(Bt, 0, '(', ')')), out: pw(-n) }); }
        if (Bt.startsWith('\\sqrt{') && bEnd(Bt, 5) === Bt.length - 1) cands.push({ G: Bt.slice(6, -1), out: pw(-0.5) });
      }
    }
    for (const m of s.matchAll(/\\(sin|cos)\^\{(\d+)\}\s*([a-z])/g)) cands.push({ G: `\\${m[1]} ${m[3]}`, out: pw(+m[2]) });
    if (/\\ln\s*[a-z](?![a-z^{(])/.test(s)) cands.push({ G: `\\ln ${v}`, out: pw(1) });
    for (const m of s.matchAll(/\\(sin|cos)\s*([a-z])(?![a-z^])/g)) cands.push({ G: `\\${m[1]} ${m[2]}`, out: pw(1) });   // \sin t\cos t（1乗）
    const xs = [0.37, 0.52, 0.83, 1.07, 1.29];
    for (const c of cands) {
      if (!c.G.includes(v)) continue;
      const g = x => ev(c.G, vars(x)), rs = [], ds = [];
      for (const x of xs) {
        const b = B(x), gx = g(x), gd = (g(x + 1e-6) - g(x - 1e-6)) / 2e-6;
        if (b == null || gx == null || !isFinite(gd)) continue;
        const den = c.out(gx) * gd;
        if (!isFinite(den) || Math.abs(den) < 1e-12) continue;
        rs.push(b / den); ds.push(gd);
      }
      if (rs.length < 3) continue;
      if (Math.max(...ds) - Math.min(...ds) < 1e-3) continue;            // 中身が1次式（微分が定数）
      if (Math.abs(rs[0]) > 1e-9 && rs.every(r => Math.abs(r - rs[0]) <= 1e-5 * Math.abs(rs[0]))) out.push({ log: !!c.log, r: rs[0] });   // 比が一定（小さい数どうしを同じとみない）
    }
    return out;
  }
  const chainFit = (q, test) => { const I = integ(q); if (!I) return false; return chainOf(I.body, I.v).some(c => test(c, I)); };

  // ---------------------------------------------------------------- わなの行き先（H-1・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。楽な形なし）」を書く。extra：ほかの部のわざの番号（fits では見つからない）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(5).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 6 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : '楽な形なし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 置換の中身（多項式）
  // G = x^2+c、x^3+c、x^2+ax+b（kinds で選ぶ）
  function polyG(r, kinds, opt) {
    opt = opt || {};
    const k = r.pick(kinds || [0, 1, 2]);
    if (k === 0) { const c = opt.pos ? r.int(1, 6) : r.intNot(-5, 6, x => x === 0); return P.make(c, 0, 1); }
    if (k === 1) { const c = opt.pos ? r.int(1, 4) : r.intNot(-4, 5, x => x === 0); return P.make(c, 0, 0, 1); }
    let a = r.intNot(-4, 4, x => x === 0); if (opt.even) a = 2 * r.intNot(-2, 2, x => x === 0);
    const b = opt.pos ? r.int(Math.floor(a * a / 4) + 1, Math.floor(a * a / 4) + 4) : r.intNot(-3, 5, x => x === 0);
    return P.make(b, a, 1);
  }
  const degOf = G => G.length - 1;
  // ∫ m G' G^n dx（不定積分）の問題
  function powProb(G, m, n, v) {
    v = v || 'x';
    const fac = polyFactor(P.scale(P.diff(G), m), v); if (!fac) return null;
    const g = P.tex(G, v), body = `${fac}(${g})^{${n}}`;
    const a = cx(F.div(m, fr(n + 1)), `(${g})^{${n + 1}}`, true) + '+C';
    return { body, a, g, fac, f: body };
  }

  // ================================================================ 5-76
  M.add({
    id: '5-76', part: 6, chap: '5-16②③', stars: 1,
    title: '中身の微分がかかっていれば、中身ごと積分（置換 $u=$中身）',
    mark: '積分の中に「$(\\text{中身})^n$」と「中身の微分」がある。$\\displaystyle\\int3x^2(x^3+2)^4\\,\\dd x$、$\\displaystyle\\int\\cos x\\sin^3x\\,\\dd x$。',
    futsu: ['$(x^3+2)^4$ を展開して', '$3x^2$ をかけ、13項を1つずつ積分する'],
    raku: ['$u=x^3+2$ とおくと $\\dd u=3x^2\\,\\dd x$', '$\\displaystyle\\int u^4\\,\\dd u=\\frac{u^5}{5}+C$', '$u$ をもどして $\\dfrac{(x^3+2)^5}{5}+C$'],
    why: '合成関数の微分（5-6）で $\\Bigl\\{\\dfrac{(x^3+2)^5}{5}\\Bigr\\}\'=(x^3+2)^4\\times3x^2$。この式を逆に読むと積分になる。中身の微分 $3x^2$ と $\\dd x$ が、まとめて $\\dd u$ になる（5-16③）。',
    caution: 'さいごに $u$ を $x$ の式にもどし、$+C$ をつける。中身の微分がないとき（$\\displaystyle\\int(x^3+2)^4\\,\\dd x$）は使えない。答えを微分して、積分の中身にもどるか確かめる。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    boxw: '36mm', boxh: '12mm',
    fits(q) { return chainFit(q, (c, I) => !I.def && !c.log && Math.abs(c.r - 1) < 1e-6); },
    steps: {
      // 多項式の中身（教科書の例題1）
      s1(r) {
        const G = polyG(r), n = r.int(2, degOf(G) === 3 ? 4 : 6), pp = powProb(G, fr(1), n);
        if (pp.body === '3x^{2}(x^{3}+2)^{4}') return null;   // 楽な形の例（O-2）
        return { q: `$${INT(pp.body)}$`, a: `$${pp.a}$`, easy: `$u=${pp.g}$、$\\dd u=${pp.fac}\\,\\dd x$。$\\displaystyle\\int u^{${n}}\\,\\dd u$`, easyCheck: false, calc: { kind: 'int', f: pp.f }, key: pp.body };
      },
      // sin・cos・e の中身（教科書の例題2）
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const n = r.int(2, 5), v = r.pick(['x', 'x', 't']);   // \sin x\cos^n x は係数 -1 なので 5-77
          const body = `\\cos ${v}\\sin^{${n}}${v}`;
          return { q: `$${INT(body, v)}$`, a: `$\\frac{\\sin^{${n + 1}}${v}}{${n + 1}}+C$`, easy: `$u=\\sin ${v}$、$\\dd u=\\cos ${v}\\,\\dd ${v}$`, easyCheck: false, calc: { kind: 'int', f: body, x: v }, key: body };
        }
        if (k === 1) {
          const c = r.int(1, 5), n = r.int(2, 4), g = `e^{x}+${c}`, body = `e^{x}(${g})^{${n}}`;
          return { q: `$${INT(body)}$`, a: `$\\frac{(${g})^{${n + 1}}}{${n + 1}}+C$`, easy: `$u=${g}$、$\\dd u=e^{x}\\,\\dd x$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
        }
        if (k === 2) {
          const G = r.pick([P.make(0, 0, 1), P.make(0, 0, 0, 1), P.make(0, 1, 1), P.make(0, 0, -1)]), g = P.tex(G), fac = polyFactor(P.diff(G), 'x');
          const body = `${fac}e^{${g}}`;
          return { q: `$${INT(body)}$`, a: `$e^{${g}}+C$`, easy: `$u=${g}$、$\\dd u=${fac}\\,\\dd x$。$\\displaystyle\\int e^{u}\\,\\dd u$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
        }
        const G = r.pick([P.make(0, 0, 1), P.make(0, 0, 0, 1), P.make(1, 0, 1)]), g = P.tex(G), fac = polyFactor(P.diff(G), 'x'), fn = r.pick(['sin', 'cos']);
        const body = `${fac}\\${fn}(${g})`, a = fn === 'cos' ? `\\sin(${g})+C` : `-\\cos(${g})+C`;
        return { q: `$${INT(body)}$`, a: `$${a}$`, easy: `$u=${g}$、$\\dd u=${fac}\\,\\dd x$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
      },
      // 見かけがちがう：微分がうしろ・分母の中身・ルート・ln x・t の式。key は形ごと（同じ形を2回出さない）
      s3(r) {
        const k = r.int(0, 4);
        if (k === 0) {   // 数は s1 と重ならないように大きめ（s1 の入れかえにしない。N-2）
          const G = r.chance(0.6) ? P.make(r.int(7, 9), 0, 1) : P.make(r.int(6, 8), 0, 0, 1), n = r.int(2, 4), pp = powProb(G, fr(1), n), body = `(${pp.g})^{${n}}\\cdot${pp.fac}`;
          return { q: `$${INT(body)}$`, a: `$${pp.a}$`, easy: `うしろの $${pp.fac}$ が中身 $${pp.g}$ の微分`, easyCheck: false, calc: { kind: 'int', f: pp.f }, key: 'k0' };
        }
        if (k === 1) {
          const c = r.int(1, 6), n = r.int(2, 4), g = `x^{2}+${c}`, body = `\\frac{2x}{(${g})^{${n}}}`;
          const a = n === 2 ? `-\\frac{1}{${g}}+C` : `-\\frac{1}{${n - 1}(${g})^{${n - 1}}}+C`;
          return { q: `$${INT(body)}$`, a: `$${a}$`, easy: `$u=${g}$。$\\displaystyle\\int u^{-${n}}\\,\\dd u=\\frac{u^{-${n - 1}}}{-${n - 1}}$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k1' };
        }
        if (k === 2) {
          const G = polyG(r, [0, 1], { pos: true }), g = P.tex(G), fac = polyFactor(P.diff(G), 'x'), body = `${fac}\\sqrt{${g}}`;
          return { q: `$${INT(body)}$`, a: `$\\frac{2}{3}(${g})^{\\frac{3}{2}}+C$`, easy: `$u=${g}$。$\\displaystyle\\int u^{\\frac{1}{2}}\\,\\dd u=\\frac{2}{3}u^{\\frac{3}{2}}$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k2' };
        }
        if (k === 3) {
          const n = r.int(1, 3), body = n === 1 ? '\\frac{\\ln x}{x}' : `\\frac{(\\ln x)^{${n}}}{x}`;
          return { q: `$${INT(body)}$`, a: `$\\frac{(\\ln x)^{${n + 1}}}{${n + 1}}+C$`, easy: `$u=\\ln x$、$\\dd u=\\frac{1}{x}\\,\\dd x$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k3' };
        }
        const G = P.make(r.int(7, 9), r.pick([0, 1, 3, 5]), 1), n = r.int(2, 4), pp = powProb(G, fr(1), n, 't');   // t の式（数は s1 と重ならない）
        return { q: `$${INT(pp.body, 't')}$`, a: `$${pp.a}$`, easy: `$u=${pp.g}$、$\\dd u=${pp.fac}\\,\\dd t$`, easyCheck: false, calc: { kind: 'int', f: pp.f, x: 't' }, key: 'k4' };
      },
      // わな：中身の微分がない（展開して1項ずつ。5-46）
      trap(r) {
        const G = polyG(r, [0, 0, 1], { pos: true }), n = degOf(G) === 3 || G[0][0] > 3 ? 2 : r.int(2, 3), g = P.tex(G);   // 3乗は、答えが長くならない数だけ
        const body = `(${g})^{${n}}`, A = P.integ(P.pow(G, n));
        return dest({ q: `$${INT(body)}$`, a: `$${P.tex(A)}+C$`, calc: { kind: 'int', f: body }, boxw: '44mm' }, '5-76',
          `中身の微分 $${P.tex(P.diff(G))}$ がかかっていないので、置換できない。展開して1項ずつ積分`, ['5-46']);
      },
    },
  });

  // ================================================================ 5-77
  M.add({
    id: '5-77', part: 6, chap: '5-16④', stars: 1,
    title: '係数が合わないときは、数だけ前に出して調整',
    mark: '中身の微分と「数だけ」ちがう。$\\displaystyle\\int x\\,e^{x^2}\\,\\dd x$（$2x$ がほしいのに $x$）、$\\displaystyle\\int4x(x^2+5)^3\\,\\dd x$。',
    futsu: ['$(x^2+5)^3$ を展開して $4x$ をかけ、', '1項ずつ積分する'],
    raku: ['$u=x^2+5$、$\\dd u=2x\\,\\dd x$', '$4x\\,\\dd x=2\\,\\dd u$', '$\\displaystyle2\\int u^3\\,\\dd u=\\frac{u^4}{2}+C$'],
    why: '$\\dd u=2x\\,\\dd x$ の両辺を何倍かすれば、積分の中の $4x\\,\\dd x$ や $x\\,\\dd x$ になる。数は定数なので積分の前に出せる（5-16④）。',
    caution: '数のずれだけが調整できる。$\\displaystyle\\int e^{x^2}\\,\\dd x$ のように $x$ そのものが足りないとき、$\\displaystyle\\int x^2e^x\\,\\dd x$ のように $x$ の式がかかるときは使えない（$x$ は前に出せない）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    boxw: '36mm', boxh: '12mm',
    fits(q) { return chainFit(q, (c, I) => !I.def && !c.log && Math.abs(c.r - 1) > 1e-6); },
    steps: {
      // 多項式の中身で、前の数がちがう（教科書 章末問題1）
      s1(r) {
        const kind = r.int(0, 2), G = polyG(r, [kind], { even: true });
        let m;
        if (kind === 0) m = fr(r.pick([1, 3, 4, 5, 6]), 2);
        else if (kind === 1) m = fr(r.pick([1, 2, 4, 5, 6]), 3);
        else m = fr(1, 2);
        const n = r.int(2, kind === 1 ? 4 : 5), pp = powProb(G, m, n); if (!pp) return null;
        if (pp.body === '4x(x^{2}+5)^{3}') return null;   // 楽な形の例（O-2）
        return { q: `$${INT(pp.body)}$`, a: `$${pp.a}$`, easy: `$u=${pp.g}$、$${pp.fac}\\,\\dd x=${cx(m, '\\,\\dd u')}$`.replace('=\\,\\dd u', '=\\dd u'), easyCheck: false, calc: { kind: 'int', f: pp.f }, key: pp.body };
      },
      // e・sin・cos の中身（教科書の例題2の（1）（3））
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const a = r.pick([1, -1, 2, 3, -2, -3]), v = r.pick(['x', 'x', 't']), body = `${v}e^{${a === 1 ? '' : a === -1 ? '-' : a}${v}^{2}}`;
          return { q: `$${INT(body, v)}$`, a: `$${cx(fr(1, 2 * a), `e^{${a === 1 ? '' : a === -1 ? '-' : a}${v}^{2}}`)}+C$`, easy: `$u=${a === 1 ? '' : a === -1 ? '-' : a}${v}^{2}$、$${v}\\,\\dd ${v}=${cx(fr(1, 2 * a), '\\dd u')}$`, easyCheck: false, calc: { kind: 'int', f: body, x: v }, key: body };
        }
        if (k === 1) {
          const c = r.pick([1, 2, 1]), body = `${c === 1 ? '' : c}x^{2}e^{x^{3}}`;
          return { q: `$${INT(body)}$`, a: `$${cx(fr(c, 3), 'e^{x^{3}}')}+C$`, easy: '$u=x^{3}$、$x^{2}\\,\\dd x=\\frac{1}{3}\\dd u$', easyCheck: false, calc: { kind: 'int', f: body }, key: body };
        }
        if (k === 2) {
          const n = r.int(2, 5), v = r.pick(['x', 't']), body = `\\sin ${v}\\cos^{${n}}${v}`;
          return { q: `$${INT(body, v)}$`, a: `$-\\frac{\\cos^{${n + 1}}${v}}{${n + 1}}+C$`, easy: `$u=\\cos ${v}$、$\\sin ${v}\\,\\dd ${v}=-\\dd u$`, easyCheck: false, calc: { kind: 'int', f: body, x: v }, key: body };
        }
        const fn = r.pick(['sin', 'cos']), c = r.pick([1, 3]), body = `${c === 1 ? '' : c}x\\${fn}(x^{2})`;
        const a = fn === 'cos' ? `${cx(fr(c, 2), '\\sin(x^{2})')}+C` : `${cx(fr(-c, 2), '\\cos(x^{2})')}+C`;
        return { q: `$${INT(body)}$`, a: `$${a}$`, easy: `$u=x^{2}$、$x\\,\\dd x=\\frac{1}{2}\\dd u$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
      },
      // 見かけがちがう：ルート・分母・e^{2x}
      s3(r) {
        const k = r.int(0, 3), c = r.int(1, 6), g = `x^{2}+${c}`;
        // key は形ごと（4つの形が1つずつ出る）
        if (k === 0) { const body = `x\\sqrt{${g}}`; return { q: `$${INT(body)}$`, a: `$\\frac{1}{3}(${g})^{\\frac{3}{2}}+C$`, easy: `$u=${g}$、$x\\,\\dd x=\\frac{1}{2}\\dd u$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k0' }; }
        if (k === 1) { const body = `\\frac{x}{(${g})^{2}}`; return { q: `$${INT(body)}$`, a: `$-\\frac{1}{2(${g})}+C$`, easy: `$u=${g}$。$\\displaystyle\\frac{1}{2}\\int u^{-2}\\,\\dd u$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k1' }; }
        if (k === 2) { const body = `\\frac{x}{\\sqrt{${g}}}`; return { q: `$${INT(body)}$`, a: `$\\sqrt{${g}}+C$`, easy: `$u=${g}$。$\\displaystyle\\frac{1}{2}\\int u^{-\\frac{1}{2}}\\,\\dd u=u^{\\frac{1}{2}}$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k2' }; }
        const n = r.int(2, 3), cc = r.int(1, 4), gg = `e^{2x}+${cc}`, body = `e^{2x}(${gg})^{${n}}`;
        return { q: `$${INT(body)}$`, a: `$\\frac{(${gg})^{${n + 1}}}{${2 * (n + 1)}}+C$`, easy: `$u=${gg}$、$e^{2x}\\,\\dd x=\\frac{1}{2}\\dd u$`, easyCheck: false, calc: { kind: 'int', f: body }, key: 'k3' };
      },
      // わな：x^2 e^x（x の式がかかる。部分積分を2回 5-82）
      trap(r) {
        const k = r.pick([1, -1]), body = `x^{2}${ex(k, 'x')}`, a = k === 1 ? 'e^{x}(x^{2}-2x+2)+C' : '-e^{-x}(x^{2}+2x+2)+C';
        return dest({ q: `$${INT(body)}$`, a: `$${a}$`, calc: { kind: 'int', f: body } }, '5-77', `$x^{2}$ は中身 $${kv(k, 'x')}$ の微分の数倍ではない（$x$ は前に出せない）。部分積分を2回`);
      },
    },
  });

  // ================================================================ 5-78
  M.add({
    id: '5-78', part: 6, chap: '5-16④ 例題3', stars: 1,
    title: '分子が分母の微分なら $\\ln(\\text{分母})$',
    mark: '分数で、分子が分母の微分（の数倍）になっている。$\\displaystyle\\int\\frac{e^x}{e^x+1}\\,\\dd x$、$\\displaystyle\\int\\frac{x}{x^2+4}\\,\\dd x$。',
    futsu: ['分数のまま、積分の表から', '同じ形をさがす（見つからない）'],
    raku: ['分母 $x^2+4$ の微分は $2x$', '分子 $x$ はその $\\frac{1}{2}$', '$\\dfrac{1}{2}\\ln(x^2+4)+C$'],
    why: '$u=$分母とおくと、分子と $\\dd x$ が $\\dd u$ になり、$\\displaystyle\\int\\frac{1}{u}\\,\\dd u=\\ln u+C$（5-14）。分母がいつも正なら、そのまま $\\ln(\\text{分母})$（5-16④）。',
    caution: '分母が2乗 $\\displaystyle\\frac{2x}{(x^2+1)^2}$ なら $\\ln$ にならない（$u^{-2}$ の積分で $-\\dfrac{1}{x^2+1}$）。$\\ln u$ は $u>0$ のときだけ使う。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    boxw: '32mm', boxh: '12mm',
    fits(q) { return chainFit(q, c => c.log); },
    steps: {
      // 分子がちょうど分母の微分
      s1(r) {
        const k = r.int(0, 2);
        let g, num;
        if (k === 0) { const c = r.intNot(1, 9, x => x === 4); g = `x^{2}+${c}`; num = '2x'; }   // x^2+4 は楽な形の例（O-2）
        else if (k === 1) { const a = r.intNot(-3, 3, x => x === 0), b = r.int(Math.floor(a * a / 4) + 1, Math.floor(a * a / 4) + 4); g = P.tex(P.make(b, a, 1)); num = P.tex(P.make(a, 2)); }
        else { const c = r.int(1, 5); g = `e^{x}+${c}`; num = 'e^{x}'; }
        const body = `\\frac{${num}}{${g}}`;
        return { q: `$${INT(body)}$`, a: `$\\ln(${g})+C$`, easy: `分母 $${g}$ の微分が分子。$u=${g}$（いつも正）`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
      },
      // 分子が分母の微分の数倍（教科書 例題3（2））・sin・cos
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const c = r.intNot(1, 9, x => x === 4), m = r.pick([1, 1, 3, 4, 6]), g = `x^{2}+${c}`, body = `\\frac{${m === 1 ? '' : m}x}{${g}}`;
          return { q: `$${INT(body)}$`, a: `$${cx(fr(m, 2), `\\ln(${g})`)}+C$`, easy: `分母の微分は $2x$。分子はその $${F.tex(fr(m, 2))}$ 倍`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
        }
        if (k === 1) {
          const c = r.int(1, 5), g = `e^{2x}+${c}`, body = `\\frac{e^{2x}}{${g}}`;
          return { q: `$${INT(body)}$`, a: `$\\frac{1}{2}\\ln(${g})+C$`, easy: '分母の微分は $2e^{2x}$。分子はその $\\frac{1}{2}$ 倍', easyCheck: false, calc: { kind: 'int', f: body }, key: 'e2' };
        }
        // e^{2x}・sin・cos の形は1つずつ（のこりは x^2+c の形）
        const c = r.int(2, 4), fn = k === 2 ? ['cos', 'sin'] : ['sin', 'cos'], g = `\\${fn[1]} x+${c}`, body = `\\frac{\\${fn[0]} x}{${g}}`;
        return { q: `$${INT(body)}$`, a: `$${k === 2 ? '' : '-'}\\ln(${g})+C$`, easy: `分母の微分は $${k === 2 ? '' : '-'}\\${fn[0]} x$。分母はいつも正`, easyCheck: false, calc: { kind: 'int', f: body }, key: 't' + k };
      },
      // 定積分で（教科書 章末問題）。ln のわり算にまとめる
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const body = '\\frac{e^{x}}{e^{x}+1}';
          return { q: `$${INT(body, 'x', 0, 1)}$`, a: '$\\ln\\frac{e+1}{2}$', easy: '$\\Bigl[\\,\\ln(e^{x}+1)\\,\\Bigr]_{0}^{1}=\\ln(e+1)-\\ln2$', easyCheck: false, calc: { kind: 'defint', f: body, a: 0, b: 1 }, key: 'e' };
        }
        const [c, b] = r.pick([[1, 1], [1, 2], [1, 3], [3, 1], [9, 3], [5, 2], [2, 1]]), m = k === 0 ? 1 : 2;   // x^2+4 は楽な形の例（O-2）
        const body = `\\frac{${m === 1 ? '' : m}x}{x^{2}+${c}}`, top = b * b + c, g = gcd(top, c), fv = c / g === 1 ? `${top / g}` : `\\frac{${top / g}}{${c / g}}`;
        const lnT = `\\ln${fv}`, a = m === 2 ? lnT : `\\frac{1}{2}${lnT}`;
        return { q: `$${INT(body, 'x', 0, b)}$`, a: `$${a}$`, easy: `$${m === 2 ? '' : '\\frac{1}{2}'}\\Bigl[\\,\\ln(x^{2}+${c})\\,\\Bigr]_{0}^{${b}}=${m === 2 ? `\\ln${top}-\\ln${c}` : `\\frac{1}{2}(\\ln${top}-\\ln${c})`}$`, easyCheck: false, calc: { kind: 'defint', f: body, a: 0, b: b }, key: `d${m},${c},${b}` };
      },
      // わな：分母が2乗（ln にならない。5-76・5-77）
      trap(r) {
        const c = r.int(1, 6), m = r.pick([1, 2]), g = `x^{2}+${c}`, body = `\\frac{${m === 1 ? '' : m}x}{(${g})^{2}}`;
        return dest({ q: `$${INT(body)}$`, a: `$-\\frac{1}{${m === 2 ? g : `2(${g})`}}+C$`, calc: { kind: 'int', f: body } }, '5-78',
          `分母が $(${g})^{2}$ で、$\\ln$ にならない。$u=${g}$ とおいて $u^{-2}$ を積分`);
      },
    },
  });

  // ================================================================ 5-79
  M.add({
    id: '5-79', part: 6, chap: '5-16⑤', stars: 1,
    title: '定積分の置換は、はんいも $u$ に書きかえる（$x$ にもどさない）',
    mark: '置換する定積分。$\\displaystyle\\int_0^12x(x^2+1)^3\\,\\dd x$、$\\displaystyle\\int_0^{\\frac{\\pi}{2}}\\sin^2t\\cos t\\,\\dd t$。',
    futsu: ['$u$ で積分したあと $x$ の式にもどし、', '$x$ のはんいで計算する'],
    raku: ['$u=x^2+1$：$x$ が $0\\to1$ で $u$ は $1\\to2$', '$\\displaystyle\\int_1^2u^3\\,\\dd u=\\frac{16-1}{4}=\\frac{15}{4}$'],
    why: '置換すると積分の横軸が $x$ から $u$ に変わる。下端と上端に、おいた式（$x^2+1$ など）を計算すれば、$u$ のはんいになる。細い長方形1本ずつの面積は $u$ で見ても同じ（5-16⑤）。',
    caution: 'はんいを $x$ のまま $\\displaystyle\\int_0^1u^3\\,\\dd u$ としない（$\\frac{1}{4}$ になって、ずれる）。下端の $u$ が0でないときは、下端の値もひく。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    boxw: '20mm', boxh: '12mm',
    fits(q) { if (/とおくと/.test(q) && /はんい/.test(q)) return true; return chainFit(q, (c, I) => I.def); },
    steps: {
      // 中身の微分がそのまま（教科書 ⑤）
      s1(r) {
        const kind = r.pick([0, 0, 1]), c = r.int(1, kind ? 2 : 3), G = kind ? P.make(c, 0, 0, 1) : P.make(c, 0, 1);
        const lo = r.int(0, 1), hi = r.int(lo + 1, 2), n = r.int(2, 3), pp = powProb(G, fr(1), n);
        const ua = P.at(G, lo)[0], ub = P.at(G, hi)[0];
        if (Math.pow(ub, n + 1) > 1300) return null;
        if (pp.body === '2x(x^{2}+1)^{3}' && lo === 0 && hi === 1) return null;   // 楽な形の例（O-2）
        const val = fr(Math.pow(ub, n + 1) - Math.pow(ua, n + 1), n + 1);
        return {
          q: `$${INT(pp.body, 'x', lo, hi)}$`, a: `$${F.tex(val)}$`, easyCheck: false, calc: { kind: 'defint', f: pp.f, a: lo, b: hi },
          easy: `$u=${pp.g}$：$${ua}\\to${ub}$。$\\displaystyle\\int_{${ua}}^{${ub}}u^{${n}}\\,\\dd u=\\Bigl[\\,\\frac{u^{${n + 1}}}{${n + 1}}\\,\\Bigr]_{${ua}}^{${ub}}$`, key: `p${pp.body}${lo}${hi}`,
        };
      },
      // 係数の調整あり・sin と cos（教科書 例題4）
      s2(r) {
        if (r.chance(0.5)) {
          const c = r.int(1, 3), hi = r.int(1, 2), n = r.int(2, 3), G = P.make(c, 0, 1), pp = powProb(G, fr(1, 2), n);
          const ua = c, ub = c + hi * hi, val = fr(Math.pow(ub, n + 1) - Math.pow(ua, n + 1), 2 * (n + 1));
          if (Math.pow(ub, n + 1) > 1300) return null;
          return {
            q: `$${INT(pp.body, 'x', 0, hi)}$`, a: `$${F.tex(val)}$`, easyCheck: false, calc: { kind: 'defint', f: pp.f, a: 0, b: hi },
            easy: `$u=${pp.g}$：$${ua}\\to${ub}$。$\\displaystyle\\frac{1}{2}\\int_{${ua}}^{${ub}}u^{${n}}\\,\\dd u$`, key: `p${pp.body}0${hi}`,
          };
        }
        const n = r.int(1, 4), fn = r.pick(['sin', 'cos']), v = r.pick(['t', 'x']), other = fn === 'sin' ? 'cos' : 'sin';
        const [lo, hi, uLo, uHi] = r.pick(fn === 'sin' ? [['0', '\\frac{\\pi}{2}', 0, 1], ['0', '\\frac{\\pi}{6}', 0, fr(1, 2)], ['\\frac{\\pi}{6}', '\\frac{\\pi}{2}', fr(1, 2), 1]] : [['0', '\\frac{\\pi}{2}', 1, 0], ['0', '\\frac{\\pi}{3}', 1, fr(1, 2)]]);
        const up = x => (Array.isArray(x) ? x : fr(x)), pw = (x, k) => { let o = fr(1); for (let i = 0; i < k; i++) o = F.mul(o, up(x)); return o; };
        let val = F.div(F.sub(pw(uHi, n + 1), pw(uLo, n + 1)), fr(n + 1)); if (fn === 'cos') val = F.mul(val, fr(-1));
        const body = `\\${fn}^{${n}}${v}\\${other} ${v}`.replace(`\\${fn}^{1}`, `\\${fn} `);
        return {
          q: `$${INT(body, v, lo, hi)}$`, a: `$${F.tex(val)}$`, easyCheck: false, calc: { kind: 'defint', f: body, a: lo, b: hi, x: v },
          easy: `$u=\\${fn} ${v}$：$${F.tex(up(uLo))}\\to${F.tex(up(uHi))}$${fn === 'cos' ? `（$\\sin ${v}\\,\\dd ${v}=-\\dd u$）` : ''}`, key: `t${fn}${n}${lo}${hi}`,
        };
      },
      // 見かけがちがう：e の中身・u のはんいを聞く・0〜π で0。key は形ごと（4つの形が1つずつ出る）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [body, a, e, kk] = r.pick([
            ['xe^{x^{2}}', '\\frac{e-1}{2}', '$u=x^{2}$：$0\\to1$。$\\displaystyle\\frac{1}{2}\\int_{0}^{1}e^{u}\\,\\dd u$', 1],
            ['2xe^{x^{2}}', 'e-1', '$u=x^{2}$：$0\\to1$。$\\displaystyle\\int_{0}^{1}e^{u}\\,\\dd u$', 2],
            ['xe^{-x^{2}}', '\\frac{1-e^{-1}}{2}', '$u=-x^{2}$：$0\\to-1$', 3],
            ['3x^{2}e^{x^{3}}', 'e-1', '$u=x^{3}$：$0\\to1$', 4]]);
          return { q: `$${INT(body, 'x', 0, 1)}$`, a: `$${a}$`, easy: e, easyCheck: false, calc: { kind: 'defint', f: body, a: 0, b: 1 }, key: 'k0' };
        }
        if (k === 1) {
          const c = r.int(1, 4), lo = r.int(0, 1), hi = r.int(lo + 1, 3), n = r.int(2, 4), G = P.make(c, 0, 1), g = P.tex(G);
          const ua = c + lo * lo, ub = c + hi * hi;
          return {
            q: `$${INT(`x(${g})^{${n}}`, 'x', lo, hi)}$ で $u=${g}$ とおくと、$u$ のはんいは □ から □ まで`, a: `${ua} から ${ub} まで`, easyCheck: false,
            easy: `$${lo}^{2}+${c}=${ua}$、$${hi}^{2}+${c}=${ub}$`, verify: p => (p.a === `${P.at(G, lo)[0]} から ${P.at(G, hi)[0]} まで` || 'はんいがちがう'), key: 'k1', boxw: '12mm',
          };
        }
        if (k === 2) {
          const n = r.pick([2, 4]), v = 't', body = `\\sin^{${n}}${v}\\cos ${v}`;
          return { q: `$${INT(body, v, 0, '\\pi')}$`, a: '$0$', easy: '$u=\\sin t$：$0\\to0$（はじめとおわりが同じ）', easyCheck: false, calc: { kind: 'defint', f: body, a: 0, b: '\\pi', x: 't' }, key: 'k2' };
        }
        const c = r.int(1, 3), hi = r.int(1, 2), G = P.make(c, 0, 1), g = P.tex(G), body = `\\frac{x}{(${g})^{2}}`;
        const ua = c, ub = c + hi * hi, val = F.mul(fr(1, 2), F.sub(fr(1, ua), fr(1, ub)));
        return { q: `$${INT(body, 'x', 0, hi)}$`, a: `$${F.tex(val)}$`, easy: `$u=${g}$：$${ua}\\to${ub}$。$\\displaystyle\\frac{1}{2}\\Bigl[\\,-\\frac{1}{u}\\,\\Bigr]_{${ua}}^{${ub}}$`, easyCheck: false, calc: { kind: 'defint', f: body, a: 0, b: hi }, key: 'k3' };
      },
      // わな：置換はいらない（多項式の定積分。5-47）
      trap(r) {
        const A = P.make(r.int(1, 4), r.pick([0, 0, 1, 2]), r.int(1, 3)), lo = 0, hi = r.int(1, 2), V = P.at(P.integ(A), hi);
        const body = `(${P.tex(A)})`;   // かっこの中は中身に見えるが、中身の微分がかかっていない
        return dest({ q: `$${INT(body, 'x', lo, hi)}$`, a: `$${F.tex(V)}$`, calc: { kind: 'defint', f: body, a: lo, b: hi } }, '5-79',
          'かっこの中の微分がかかっていない、ふつうの多項式。置換しないで、そのまま原始関数に上端と下端を入れる', ['5-47']);
      },
    },
  });

  // ================================================================ 5-80
  // 図：グラフ y=√(r^2-x^2) は上半円を全部描き、問う部分だけをぬる（R2-20）：円の 1/4（'q'：0〜r）・半円（'h'：-r〜r）・左がわの 1/4（'l'：-r〜0）。
  //   x と y の倍率を同じにして、弧と、ぬった部分と、目もり。弧は折れ線で描く（'arc' は図の大きさを円全体でとるので、下に大きなあきができる）。
  //   目もりの数は、目もりの線・ぬり・弧と重ならない所に置く（y の目もりの数は、弧の上の外側）
  function circFig(R, mode) {
    const u = 3, G = M.graph({ x0: -R, x1: R, y0: 0, y1: R, w: 2 * u, h: u }), n = 120;
    const arcOf = (d0, d1) => Array.from({ length: n + 1 }, (_, i) => { const th = (d0 + (d1 - d0) * i / n) * Math.PI / 180; return G.T(R * Math.cos(th), R * Math.sin(th)); });
    const all = arcOf(0, 180), part = mode === 'q' ? arcOf(0, 90) : mode === 'l' ? arcOf(90, 180) : all;
    const num = v => `$${v}$`;
    const xt = [-R, R].flatMap(t => [['seg', [t * G.sx, -0.12], [t * G.sx, 0.12]], ['label', [t * G.sx, -0.3], num(t), 's']]);
    const yl = [[-0.1, R * G.sy + 0.1], 'nw'];   // 弧の外（左上）
    return {
      s: 5.5,
      items: [
        ['poly', mode === 'h' ? part : [G.T(0, 0), ...part], { fill: true, noline: true }],
        ['axes', -R * G.sx - 0.6, R * G.sx + 1.4, -0.5, R * G.sy + 0.8, { o: mode === 'l' ? 'se' : 'sw' }],   // x 軸は長めに（目もりの数と x の字が重ならない）。O は、ぬりのない側
        ['path', all, { thick: true }],
        ...xt,
        ['seg', [-0.12, R * G.sy], [0.12, R * G.sy]], ['label', yl[0], num(R), yl[1]],
      ],
    };
  }
  const quarter = R => piTeX(R * R, 4);
  M.add({
    id: '5-80', part: 6, chap: '5-16⑥ 例題5', stars: 1,
    title: '$\\displaystyle\\int_0^r\\sqrt{r^2-x^2}\\,\\dd x$ は円の面積の $\\dfrac{1}{4}$（$x=r\\sin\\theta$ の答えを図で）',
    mark: '$\\sqrt{r^2-x^2}$ の定積分。$\\displaystyle\\int_0^2\\sqrt{4-x^2}\\,\\dd x$、$\\displaystyle\\int_{-3}^{3}\\sqrt{9-x^2}\\,\\dd x$。',
    futsu: ['$x=r\\sin\\theta$ とおき、$\\dd x$ とはんいを書きかえ、', '2倍角の式で $\\cos^2\\theta$ を積分する'],
    raku: ['$y=\\sqrt{4-x^2}$ は半径2の円の上半分', '0から2までは円の $\\frac{1}{4}$', '$\\dfrac{\\pi\\times2^2}{4}=\\pi$'],
    why: '$y=\\sqrt{r^2-x^2}$ の両辺を2乗すると $x^2+y^2=r^2$。グラフは半径 $r$ の円の上半分なので、定積分（面積）は円の面積から出せる。$x=r\\sin\\theta$ の置換で計算しても同じ答え（5-16⑥）。',
    caution: '0から $r$ までは $\\frac{1}{4}$ 円、$-r$ から $r$ までは半円。前に $x$ がかかる $\\displaystyle\\int x\\sqrt{r^2-x^2}\\,\\dd x$ は円の面積ではない（中身の微分があるので置換）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s3: 1 },
    boxw: '18mm', boxh: '12mm',
    fits(q) {
      const I = integ(q); if (!I || !I.def) return false;
      const m = /^(\d*)\\sqrt\{(\d+)-[a-z]\^\{?2\}?\}$/.exec(I.body); if (!m) return false;
      const R = Math.sqrt(+m[2]), lo = ev(I.lo), hi = ev(I.hi);
      return Number.isInteger(R) && [lo, hi].every(b => b != null && [0, R, -R].some(z => near(b, z)));
    },
    steps: {
      // 半径の決め方（同じ積分・左右の 1/4 で同じ答えを、1つの見開きに出さない。N-2・O-2・R2-18）：
      //   右の 1/4 と係数つき（s1・s2）は 1・3〜7、半円（s2）は 1・4・6・7、図（s3）は 右の 1/4 が 8・12、半円が 5、左がわの 1/4 が 9・10（右の 1/4 と同じ半径にしない）。
      //   楽な形の例（半径2の 1/4）と、見わけようの例（半径3の半円）は出さない（O-2）
      s1(r) {
        const R = r.pick([1, 3, 4, 5, 6, 7]), body = `\\sqrt{${R * R}-x^{2}}`;
        return { q: `$${INT(body, 'x', 0, R)}$`, a: `$${quarter(R)}$`, easy: `半径 $${R}$ の円の $\\frac{1}{4}$：$\\frac{\\pi\\times${R}^{2}}{4}$`, easyCheck: false, verify: DEF(body, 0, R, 'x', R), key: 'q' + R };
      },
      // 半円・係数つき（左がわの 1/4 は、ステップ3の図で1問だけ。係数つきは s1 と同じ半径にしない）
      s2(r) {
        const k = r.int(0, 1), R = k === 0 ? r.pick([1, 4, 6, 7]) : r.pick([1, 3, 4, 5, 6, 7]), body0 = `\\sqrt{${R * R}-x^{2}}`;
        if (k === 0) return { q: `$${INT(body0, 'x', -R, R)}$`, a: `$${piTeX(R * R, 2)}$`, easy: `半径 $${R}$ の半円：$\\frac{\\pi\\times${R}^{2}}{2}$`, easyCheck: false, verify: DEF(body0, -R, R, 'x', R), key: 'h' + R };
        const c = r.pick([2, 4]), body = `${c}\\sqrt{${R * R}-x^{2}}`;
        return { q: `$${INT(body, 'x', 0, R)}$`, a: `$${piTeX(c * R * R, 4)}$`, easy: `$${c}\\times\\frac{\\pi\\times${R}^{2}}{4}$`, easyCheck: false, verify: DEF(body, 0, R, 'x', R), key: 'q' + R };
      },
      // 図で（ステップ3）：円の 1/4・半円・左がわの 1/4 が1問ずつ（key は形だけ。R2-18）
      s3(r) {
        const mode = r.pick(['q', 'h', 'l']), R = r.pick({ q: [8, 12], h: [5], l: [9, 10] }[mode]), body = `\\sqrt{${R * R}-x^{2}}`, lo = mode === 'q' ? 0 : -R, hi = mode === 'l' ? 0 : R;
        return {
          q: `図は $y=${body}$ のグラフ。ぬった部分の面積 $${INT(body, 'x', lo, hi)}$`, a: `$${mode === 'h' ? piTeX(R * R, 2) : quarter(R)}$`, fig: circFig(R, mode),
          easy: `半径 $${R}$ の${mode === 'h' ? '半円' : mode === 'q' ? '円の $\\frac{1}{4}$' : '円の $\\frac{1}{4}$（左がわ）'}`, easyCheck: false, verify: DEF(body, lo, hi, 'x', R), key: 'S' + mode,
        };
      },
      // わな：前に x がかかる（円の面積ではない。置換 5-77・5-79）
      trap(r) {
        const R = r.int(1, 3), body = `x\\sqrt{${R * R}-x^{2}}`;
        return dest({ q: `$${INT(body, 'x', 0, R)}$`, a: `$${F.tex(fr(R * R * R, 3))}$`, verify: DEF(body, 0, R, 'x', R) }, '5-80',
          `前の $x$ は中身 $${R * R}-x^{2}$ の微分の $-\\frac{1}{2}$ 倍。$u=${R * R}-x^{2}$：$${R * R}\\to0$ で置換`, ['5-77']);
      },
    },
  });

  // ================================================================ 5-81
  // ∫ c x·(cos kx・sin kx・e^{kx}) dx の答え：c x g − c ∫g
  function partsAns(base, k, c, v) {
    const fx = base === 'exp' ? ex(k, v) : trig(base, k, v);
    if (base === 'cos') return sum([cx(fr(c, k), `${v}${trig('sin', k, v)}`), cx(fr(c, k * k), trig('cos', k, v))]);
    if (base === 'sin') return sum([cx(fr(-c, k), `${v}${trig('cos', k, v)}`), cx(fr(c, k * k), trig('sin', k, v))]);
    return sum([cx(fr(c, k), `${v}${fx}`), cx(fr(-c, k * k), fx)]);
  }
  const PARTS1 = /^(?:\d*|\\frac\{\d+\}\{\d+\})(?:[xt]|\([xt][+-]\d+\))(?:\\(?:cos|sin)\s*\d*[xt]|e\^\{-?\d*[xt]\})$/;
  M.add({
    id: '5-81', part: 6, chap: '5-16⑦⑧⑨ 例題6', stars: 1,
    title: '部分積分 $\\displaystyle\\int fg\'=fg-\\int f\'g$：$x$ を微分する側 $f$、$\\cos x$・$e^{ax}$ を積分する側 $g\'$ に',
    mark: '$x$ と $\\cos x$・$\\sin x$・$e^{ax}$ のかけ算。$\\displaystyle\\int x\\cos x\\,\\dd x$、$\\displaystyle\\int x\\,e^{2x}\\,\\dd x$。',
    futsu: ['$x\\sin x$ を微分してみると', '$\\sin x+x\\cos x$。よぶんな', '$\\sin x$ を消す式をさがす'],
    raku: ['$f=x$（$f\'=1$）、$g\'=\\cos x$（$g=\\sin x$）', '$x\\sin x-\\displaystyle\\int\\sin x\\,\\dd x$', '$=x\\sin x+\\cos x+C$'],
    why: '積の微分 $(fg)\'=f\'g+fg\'$ を逆に読むと、$\\displaystyle\\int fg\'\\,\\dd x$ は $fg-\\displaystyle\\int f\'g\\,\\dd x$。$x$ は微分すると1になって消えるので $f$ にする。のこった積分が簡単になる（5-16⑦⑧）。',
    caution: '$fg$ のあとは「ひく」。$f=\\cos x$、$g\'=x$ と逆にすると、残りの積分に $x^2$ が出て、むずかしくなる。定積分では $fg$ にもはんいをつける（5-16⑨）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '36mm', s2: '22mm', s3: '36mm', trap: '30mm' }, boxh: '12mm',
    fits(q) { const I = integ(q); if (I) return PARTS1.test(I.body); return /電流/.test(q) && /\d*te\^\{-\d*t\}/.test(q); },
    steps: {
      s1(r) {
        const base = r.pick(['cos', 'sin', 'exp', 'exp']), k = base === 'exp' ? r.pick([1, 2, 3, -1, -2]) : r.pick([1, 1, 2, 3]), c = r.pick([1, 1, 1, 2, 3]), v = r.pick(['x', 'x', 't']);
        if (base === 'exp' && c > 1 && Math.abs(k) > 1) return null;
        const body = `${c === 1 ? '' : c}${v}${base === 'exp' ? ex(k, v) : trig(base, k, v)}`;
        if (body === 'x\\cos x') return null;   // 楽な形の例（O-2）
        const g = base === 'exp' ? cx(fr(1, k), ex(k, v)) : base === 'cos' ? cx(fr(1, k), trig('sin', k, v)) : cx(fr(-1, k), trig('cos', k, v));
        return { q: `$${INT(body, v)}$`, a: `$${partsAns(base, k, c, v)}+C$`, easy: `$f=${c === 1 ? '' : c}${v}$、$g=${g}$`, easyCheck: false, calc: { kind: 'int', f: body, x: v }, key: body };
      },
      // 定積分
      s2(r) {
        // [中身, 下端, 上端, 答え, 原始関数（fg − ∫f'g）]。文字は x か t
        const [body0, lo, hi, a, F0] = r.pick([
          ['x\\cos x', 0, '\\frac{\\pi}{2}', '\\frac{\\pi}{2}-1', 'x\\sin x+\\cos x'], ['x\\sin x', 0, '\\pi', '\\pi', '-x\\cos x+\\sin x'], ['x\\sin x', 0, '\\frac{\\pi}{2}', '1', '-x\\cos x+\\sin x'],
          ['x\\cos x', 0, '\\pi', '-2', 'x\\sin x+\\cos x'], ['xe^{x}', 0, 1, '1', 'xe^{x}-e^{x}'], ['xe^{-x}', 0, 1, '1-2e^{-1}', '-xe^{-x}-e^{-x}'], ['xe^{2x}', 0, 1, '\\frac{e^{2}+1}{4}', '\\frac{1}{2}xe^{2x}-\\frac{1}{4}e^{2x}'],
          ['xe^{-x}', 0, 2, '1-3e^{-2}', '-xe^{-x}-e^{-x}'], ['x\\cos2x', 0, '\\frac{\\pi}{4}', '\\frac{\\pi}{8}-\\frac{1}{4}', '\\frac{1}{2}x\\sin2x+\\frac{1}{4}\\cos2x'], ['x\\sin2x', 0, '\\frac{\\pi}{2}', '\\frac{\\pi}{4}', '-\\frac{1}{2}x\\cos2x+\\frac{1}{4}\\sin2x'],
          ['xe^{x}', 0, 2, 'e^{2}+1', 'xe^{x}-e^{x}'], ['xe^{x}', 1, 2, 'e^{2}', 'xe^{x}-e^{x}']]);
        const v = r.pick(['x', 'x', 't']), tv = s => (v === 'x' ? s : s.replace(/x/g, 't')), body = tv(body0);
        return { q: `$${INT(body, v, lo, hi)}$`, a: `$${a}$`, easy: `$\\Bigl[\\,${tv(F0)}\\,\\Bigr]_{${lo}}^{${hi}}$（$fg$ にもはんいをつける）`, easyCheck: false, calc: { kind: 'defint', f: body, a: lo, b: hi, x: v }, key: body0 + lo + hi };
      },
      // 見かけがちがう：流れた電気の量（教科書 例題）・1次式とのかけ算
      s3(r) {
        if (r.chance(0.5)) {
          const [m, k, T] = r.pick([[1, 1, 1], [2, 1, 1], [2, 1, 2], [2, 1, 3], [1, 2, 1], [1, 2, 2], [3, 1, 2]]), a = m * k * k, kT = k * T;
          const body = `${a === 1 ? '' : a}t${ex(-k, 't')}`, ans = `${m}-${m * (kT + 1)}e^{-${kT}}`;
          return {
            q: `電流 $i=${body}$（A）が流れた。$t=0$ から $${T}$ 秒までに流れた電気の量は □ C（$e$ を使った式で）`, a: `$${ans}$`, easyCheck: false,
            easy: `$\\displaystyle\\int_{0}^{${T}}${body}\\,\\dd t$。$f=${a === 1 ? '' : a}t$、$g=${cx(fr(-1, k), ex(-k, 't'))}$`, calc: { kind: 'defint', f: body, a: 0, b: T, x: 't' }, key: `i${a},${k},${T}`, boxw: '24mm',
          };
        }
        const b = r.pick([1, 2, 3, -1, -2]), base = r.pick(['exp', 'cos']), body = `(x${b > 0 ? '+' : ''}${b})${base === 'exp' ? 'e^{x}' : '\\cos x'}`;
        const a = base === 'exp' ? (b - 1 === 0 ? 'xe^{x}' : `(x${b - 1 > 0 ? '+' : ''}${b - 1})e^{x}`) : `(x${b > 0 ? '+' : ''}${b})\\sin x+\\cos x`;
        return { q: `$${INT(body)}$`, a: `$${a}+C$`, easy: `$f=x${b > 0 ? '+' : ''}${b}$（$f'=1$）、$g'=${base === 'exp' ? 'e^{x}' : '\\cos x'}$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
      },
      // わな：x e^{x^2}（中身 x^2 の微分がかかる。置換 5-77）
      trap(r) {
        const k = r.int(0, 1), body = k ? 'x\\cos(x^{2})' : 'xe^{x^{2}}', a = k ? '\\frac{1}{2}\\sin(x^{2})+C' : '\\frac{1}{2}e^{x^{2}}+C';
        return dest({ q: `$${INT(body)}$`, a: `$${a}$`, calc: { kind: 'int', f: body } }, '5-81', `$${k ? '\\cos(x^{2})' : 'e^{x^{2}}'}$ は積分できない。前の $x$ が中身 $x^{2}$ の微分の $\\frac{1}{2}$ 倍なので置換`);
      },
    },
  });

  // ================================================================ 5-82
  // ∫ c x^2 e^{kx} dx = c e^{kx}(k^2x^2-2kx+2)/k^3
  function x2eAns(k, c, v) {
    let p = [2, -2 * k, k * k], den = k * k * k;
    const g = [...p, den].reduce((s, x) => gcd(s, x), 0);
    p = p.map(x => x / g); den /= g;
    if (den < 0) { den = -den; p = p.map(x => -x); }
    let sg = 1;
    if (p[2] < 0) { sg = -1; p = p.map(x => -x); }
    return cx(fr(sg * c, den), `${ex(k, v)}(${P.tex(P.make(...p), v)})`);
  }
  M.add({
    id: '5-82', part: 6, chap: '5-16 例題9', stars: 2,
    title: '$x^2e^x$ は部分積分を2回：微分する側 $x^2\\to2x\\to2$、積分する側はそのまま、符号は ＋－＋',
    mark: '$x^2$ と $e^x$・$e^{-x}$・$\\cos x$ のかけ算。$\\displaystyle\\int x^2e^x\\,\\dd x$。',
    futsu: ['部分積分を1回して $\\displaystyle\\int2xe^x\\,\\dd x$ を残し、', 'もう1回部分積分して、式を整理する'],
    raku: ['$x^2$、$2x$、$2$ に $e^x$ をかけて ＋－＋', '$x^2e^x-2xe^x+2e^x$', '$=e^x(x^2-2x+2)+C$'],
    why: '1回めの部分積分で $x^2$ が $2x$ に、2回めで2になって消える。$e^x$ は積分しても $e^x$ なので、微分した $x^2$・$2x$・$2$ にそのままかかり、ひき算が2回で符号が ＋－＋ になる（5-16 例題9）。',
    caution: '$e^{-x}$ は積分すると $-e^{-x}$（符号が変わる）。$\\cos x$ なら積分する側が $\\sin x\\to-\\cos x\\to-\\sin x$ と変わる。答えを微分して確かめる。',
    counts: { s1: 4, s2: 4, s3: 4, trap: 2 },
    boxw: '40mm', boxh: '12mm',
    fits(q) { const I = integ(q); return !!I && /^\d*(?:[xt]\^\{2\}|\([xt]\^\{2\}[^()]*\))(?:e\^\{-?\d*[xt]\}|\\(?:cos|sin)\s*[xt])$/.test(I.body); },
    steps: {
      s1(r) {
        const k = r.pick([1, -1, 1, -1, 2, -2]), c = Math.abs(k) === 1 ? r.pick([1, 1, 2, 3]) : 1, v = r.pick(['x', 'x', 't']);
        if (k === 1 && c === 1 && v === 'x') return null;   // 楽な形の例 ∫x^2e^x（O-2）
        const body = `${c === 1 ? '' : c}${v}^{2}${ex(k, v)}`;
        const gs = [1, 2, 3].map(j => cx(fr(1, Math.pow(k, j)), ex(k, v)));   // 積分する側：e^{kx} を1回・2回・3回積分したもの
        return { q: `$${INT(body, v)}$`, a: `$${x2eAns(k, c, v)}+C$`, easy: k === 1 ? `$${c === 1 ? '' : c}${v}^{2}$、$${2 * c}${v}$、$${2 * c}$ に $${ex(1, v)}$ をかけて ＋－＋` : `積分する側は $${gs.join('$ → $')}$。$${c === 1 ? '' : c}${v}^{2}$、$${2 * c}${v}$、$${2 * c}$ にかけて ＋－＋`, easyCheck: false, calc: { kind: 'int', f: body, x: v }, key: `${k},${c}` };
      },
      // 定積分（教科書 章末問題）
      s2(r) {
        const k = r.pick([1, -1]), [lo, hi] = r.pick(k === 1 ? [[0, 1], [0, 2], [-1, 0], [1, 2]] : [[0, 1], [0, 2], [0, 3]]), c = r.pick([1, 1, 2, 3]);
        const Fv = x0 => [(k * k * x0 * x0 - 2 * k * x0 + 2) / (k * k * k) * c, k * x0];
        const A = Fv(hi), B = Fv(lo), body = `${c === 1 ? '' : c}x^{2}${ex(k, 'x')}`;
        return { q: `$${INT(body, 'x', lo, hi)}$`, a: `$${eSum([A, [-B[0], B[1]]])}$`, easy: `$\\Bigl[\\,${x2eAns(k, c, 'x')}\\,\\Bigr]_{${lo}}^{${hi}}$`, easyCheck: false, calc: { kind: 'defint', f: body, a: lo, b: hi }, key: body + lo + hi };
      },
      // 見かけがちがう：cos・sin、2次式×e^x
      s3(r) {
        if (r.chance(0.5)) {
          const fn = r.pick(['cos', 'sin']), body = `x^{2}\\${fn} x`;
          const a = fn === 'cos' ? 'x^{2}\\sin x+2x\\cos x-2\\sin x+C' : '-x^{2}\\cos x+2x\\sin x+2\\cos x+C';
          return { q: `$${INT(body)}$`, a: `$${a}$`, easy: `積分する側は $${fn === 'cos' ? '\\sin x\\to-\\cos x\\to-\\sin x' : '-\\cos x\\to-\\sin x\\to\\cos x'}$。＋－＋`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
        }
        const b = r.intNot(-3, 3, x => x === 0), c = r.intNot(-2, 3, x => x === 0), Q = P.make(c, b, 1), body = `(${P.tex(Q)})e^{x}`;
        return { q: `$${INT(body)}$`, a: `$e^{x}(${P.tex(P.make(c - b + 2, b - 2, 1))})+C$`, easy: `$${P.tex(Q)}$、$${P.tex(P.diff(Q))}$、$2$ に $e^{x}$ をかけて ＋－＋`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
      },
      // わな：x^2 e^{x^3}（中身 x^3 の微分の 1/3 倍。置換 5-77）
      trap(r) {
        const c = r.pick([1, 3]), body = `${c === 1 ? '' : c}x^{2}e^{x^{3}}`;
        return dest({ q: `$${INT(body)}$`, a: `$${cx(fr(c, 3), 'e^{x^{3}}')}+C$`, calc: { kind: 'int', f: body } }, '5-82', `$e$ の右肩が $x^{3}$ で、$e^{x^{3}}$ は積分できない。${c === 3 ? '$3x^{2}$ が中身 $x^{3}$ の微分' : '$x^{2}$ が中身 $x^{3}$ の微分 $3x^{2}$ の $\\frac{1}{3}$ 倍'}なので置換`);
      },
    },
  });

  // ================================================================ 5-83
  const fact = n => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };
  // f^{(n)}(0)：e^{ax}・sin ax・cos ax（係数の別の求め方。微分すると a がかかり、sin → cos → -sin と回る）
  const deriv0 = (fn, a, n) => Math.pow(a, n) * (fn === 'exp' ? 1 : Math.round(fn === 'sin' ? Math.sin(n * Math.PI / 2) : Math.cos(n * Math.PI / 2)));
  const FN83 = { exp: (a, v) => ex(a, v), sin: (a, v) => trig('sin', a, v), cos: (a, v) => trig('cos', a, v) };
  M.add({
    id: '5-83', part: 6, chap: '5-17③④⑤ 例題1・8・9', stars: 1,
    title: '階乗は約分してから。テイラー展開は $\\dfrac{f^{(n)}(0)}{n!}$（$e^x$・$\\sin x$・$\\cos x$ は形を覚えて代入）',
    mark: '$5!$、$\\dfrac{6!}{4!}$。$e^{2x}$・$\\cos2x$・$e^{-x^2}$ の展開、$x^3$ の係数。',
    futsu: ['$\\cos2x$ を4回微分して、', '$x=0$ を入れ、$n!$ でわる'],
    raku: ['$\\cos u=1-\\frac{u^2}{2!}+\\frac{u^4}{4!}-\\cdots$ に $u=2x$', '$\\frac{(2x)^2}{2}=2x^2$、$\\frac{(2x)^4}{24}=\\frac{2}{3}x^4$', '$1-2x^2+\\frac{2}{3}x^4-\\cdots$'],
    why: '$x^n$ を $n$ 回微分すると $n!$ が出るので、$n$ 回微分を合わせる係数は $\\dfrac{f^{(n)}(0)}{n!}$（5-17③）。$e^x$・$\\sin x$・$\\cos x$ の展開は形が決まっているので、$x$ のかわりに $2x$ や $-x^2$ をかっこごと入れればよい（5-17 例題8）。',
    caution: '$\\dfrac{f\'\'\'(0)}{3}$ ではなく $\\dfrac{f\'\'\'(0)}{3!}=\\dfrac{f\'\'\'(0)}{6}$。$(2x)^4=16x^4$ のように、数も4乗する。$\\sin x$ は奇数の次数だけ、$\\cos x$ は偶数の次数だけ。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '40mm', trap: '16mm' }, boxh: { s2: '12mm', s3: '12mm' },
    fits(q) { return !/をこえるのは/.test(q) && (/\d!/.test(q) || /テイラー展開/.test(q)); },
    steps: {
      // 階乗（教科書 例題1）
      s1(r) {
        if (r.chance(0.35)) { const n = r.int(3, 7); return { q: `$${n}!$`, a: `$${fact(n)}$`, easy: `$${Array.from({ length: n }, (_, i) => i + 1).join('\\times')}=${fact(n)}$`, key: 'f' + n }; }
        if (r.chance(0.3)) {   // 2次近似の係数 r(r-1)/2 の形（5-84）
          const n = r.int(4, 12), v = n * (n - 1) / 2;
          return { q: `$\\frac{${n}!}{${n - 2}!\\times2!}$`, a: `$${v}$`, easy: `約分して $\\frac{${n}\\times${n - 1}}{2}=${v}$`, key: `b${n}`, boxh: '12mm' };
        }
        const n = r.int(5, 10), m = n - r.int(2, 3), v = fact(n) / fact(m), ks = Array.from({ length: n - m }, (_, i) => n - i);
        return { q: `$\\frac{${n}!}{${m}!}$`, a: `$${v}$`, easy: `約分して $${ks.join('\\times')}=${v}$`, key: `d${n},${m}`, boxh: '12mm' };
      },
      // 展開の、x^k の係数
      s2(r) {
        const fn = r.pick(['exp', 'exp', 'sin', 'cos']), a = r.pick([1, 2, 3, -1, -2]);
        let k = r.int(2, 5);
        if (fn === 'sin' && k % 2 === 0) k++;
        if (fn === 'cos' && k % 2 === 1) k--;
        if ((fn !== 'exp' && a < 0) || (fn === 'cos' && a === 2)) return null;   // cos2x は楽な形の例（O-2）
        const c = fr(deriv0(fn, a, k), fact(k)), f = FN83[fn](a, 'x');
        return {
          q: `$${f}$ のテイラー展開の、$x^{${k}}$ の係数`, a: `$${F.tex(c)}$`, easyCheck: false, key: `${fn}${a}`,   // 同じ関数は1問だけ
          easy: `$\\frac{f^{(${k})}(0)}{${k}!}=\\frac{${deriv0(fn, a, k)}}{${fact(k)}}$`,
          verify: p => { // 別の道すじ：x=0 のまわりで数値で微分（k 回、中心差分）はずれが大きいので、展開の形から：e^u・sin u・cos u に u=ax
            const term = fn === 'exp' ? fr(1, fact(k)) : fr(k % 4 === 1 || k % 4 === 0 ? 1 : -1, fact(k));
            return near(ev(strip(p.a)), F.val(term) * Math.pow(a, k), 1e-12) || '係数がちがう';
          },
        };
      },
      // 式を入れた展開（教科書 例題8・9）。0 でない項を3つ
      s3(r) {
        const k = r.int(0, 3);
        let f, ps, chk;
        // cos2x は楽な形の例なので出さない（O-2）
        if (k === 0) { const fn = r.pick(['sin', 'cos']), a = r.pick([2, 3]); if (fn === 'cos' && a === 2) return null; f = trig(fn, a, 'x'); const ds = fn === 'sin' ? [1, 3, 5] : [0, 2, 4]; ps = ds.map(d => [d, fr(deriv0(fn, a, d), fact(d))]); chk = x => Math[fn](a * x); }
        else if (k === 1) { const b = r.pick([-1, -2, 2, 1]); f = `e^{${b === 1 ? '' : b === -1 ? '-' : b}x^{2}}`; ps = [0, 1, 2].map(j => [2 * j, fr(Math.pow(b, j), fact(j))]); chk = x => Math.exp(b * x * x); }
        else if (k === 2) { const a = r.pick([2, 3, -2, -3]); f = ex(a, 'x'); ps = [0, 1, 2].map(j => [j, fr(Math.pow(a, j), fact(j))]); chk = x => Math.exp(a * x); }
        else { const a = r.pick([1, 1, 2, -1]); f = a === 1 ? '\\ln(1+x)' : a === -1 ? '\\ln(1-x)' : `\\ln(1+${a}x)`; ps = [1, 2, 3].map(j => [j, fr((j % 2 ? 1 : -1) * Math.pow(a, j), j)]); chk = x => Math.log(1 + a * x); }
        const poly = Array.from({ length: Math.max(...ps.map(p => p[0])) + 1 }, () => fr(0));
        ps.forEach(([d, c]) => { poly[d] = c; });
        const T = ascTeX(poly), lnK = k === 3, la = lnK ? ps[0][1][0] : 0;
        return {
          q: `$${f}$ のテイラー展開を、0 でない項を3つ（次数の小さい順に）`, a: `$${T}$`, easyCheck: false, key: 'k' + k,   // 4つの形（sin・cos、e^{bx^2}、e^{ax}、ln）が1つずつ
          easy: lnK ? `$f'(0)=${la}$、$f''(0)=${-la * la}$、$f'''(0)=${2 * la * la * la}$ を $1!$、$2!$、$3!$ でわる` : `${k === 0 ? `$\\${f.slice(1, 4)} u$` : '$e^{u}$'} の展開に $u=${k === 0 ? f.slice(4) : f.slice(3, -1)}$ をかっこごと`,
          verify: p => { // 別の道すじ：0 に近い x で、ほんとうの値とのずれが「次の項」より小さいか（さいごの項の係数が 0.04 ずれると通らない）
            const R = strip(p.a), dg = ps[2][0];
            if (ev(R, { x: 0.1 }) == null) return `式が読めない（${p.a}）`;
            for (const x of [0.002, 0.004]) { const d = Math.abs(chk(x) - ev(R, { x })); if (!(d < 8 * Math.pow(x, dg + 1) + 1e-15)) return `x=${x} でずれが大きい`; }
            return true;
          },
        };
      },
      // わな：x が大きい（sin 3 を 3 としない。π−3 にして小さい角で。5-85）
      trap(r) {
        const fn = r.pick(['sin', 'sin', 'cos']), x = fn === 'cos' ? '3' : r.pick(['3', '3.1', '3.04', '3.12']), y = F.sub(D('3.14'), D(x));
        const ys = dt(y), val = fn === 'sin' ? y : F.mul(fr(-1), F.sub(fr(1), F.div(F.mul(y, y), fr(2))));
        return dest({
          q: `$\\${fn}${x}$ のおよその値（$\\pi=3.14$ として、小数第2位まで）`, a: `$${roundStr(val, 2)}$`,
          verify: p => (Math.abs(ev(strip(p.a)) - Math[fn](+x)) < 0.006 || 'ほんとうの値とずれる'),
        }, '5-83', `$${x}$ は0に近くないので、展開のはじめの項に入れてはいけない。$\\${fn}${x}=${fn === 'cos' ? '-' : ''}\\${fn}(\\pi-${x})$、$\\pi-${x}\\approx3.14-${x}=${ys}$ は小さい角`, ['5-85']);
      },
    },
  });

  // ================================================================ 5-84
  // (1+x)^r の2次近似の係数：1、r、r(r-1)/2
  const binom2 = rr => [fr(1), rr, F.div(F.mul(rr, F.sub(rr, fr(1))), fr(2))];
  const RTEX = { '1/2': ['\\sqrt{1+x}', x => `\\sqrt{${x}}`], '-1': ['\\frac{1}{1+x}', x => `\\frac{1}{${x}}`], '-2': ['\\frac{1}{(1+x)^{2}}', x => `\\frac{1}{${x}^{2}}`], '-1/2': ['\\frac{1}{\\sqrt{1+x}}', x => `\\frac{1}{\\sqrt{${x}}}`], '3/2': ['(1+x)^{\\frac{3}{2}}', x => `${x}^{\\frac{3}{2}}`], '1/3': ['(1+x)^{\\frac{1}{3}}', x => `${x}^{\\frac{1}{3}}`] };
  const rKey = rr => (rr[1] === 1 ? String(rr[0]) : `${rr[0]}/${rr[1]}`);
  // 2次近似の式が、0 のまわりで f にあっているか（別の道すじ：x=0・±0.001 の値から、定数・1次・2次の係数を差で出してくらべる）
  function quadOK(ans, f) {
    const R = strip(ans), h = 1e-3, g = x => ev(R, { x });
    if (g(0.1) == null) return `式が読めない（${ans}）`;
    if (Math.abs(f(0) - g(0)) > 1e-12) return '定数の項がちがう';
    const d1 = u => (u(h) - u(-h)) / (2 * h), d2 = u => (u(h) - 2 * u(0) + u(-h)) / (h * h);
    if (Math.abs(d1(f) - d1(g)) > 2e-3) return '1次の係数がちがう';
    return Math.abs(d2(f) - d2(g)) < 0.02 ? true : '2次の係数がちがう';
  }
  M.add({
    id: '5-84', part: 6, chap: '5-17②⑥ 例題2・10', stars: 1,
    title: '2次近似：$(1+x)^r\\approx1+rx+\\dfrac{r(r-1)}{2}x^2$、$e^{ax}\\approx1+ax+\\dfrac{a^2x^2}{2}$',
    mark: '「2次近似」（$x=0$ のまわり）、「次の項までたす」。$(1+x)^{10}$、$1.01^{10}$、$\\sqrt{1.02}$、$e^{2x}$。',
    futsu: ['$f(0)$、$f\'(0)$、$f\'\'(0)$ を1つずつ微分して求め、', '$f(0)+f\'(0)x+\\frac{f\'\'(0)}{2}x^2$ に入れる'],
    raku: ['$(1+x)^{10}\\approx1+10x+\\frac{10\\times9}{2}x^2$', '$=1+10x+45x^2$', '$1.01^{10}\\approx1+0.1+0.0045=1.1045$'],
    why: '$(1+x)^r$ は $f\'(0)=r$、$f\'\'(0)=r(r-1)$。2回微分で出る2でわって $\\dfrac{r(r-1)}{2}$（5-17⑥）。$e^{ax}$ は微分するたびに $a$ がかかるので $f\'\'(0)=a^2$（5-17②）。',
    caution: '$x^2$ の項の2でわるのをわすれない。$\\sqrt{1+x}$ は $r=\\frac{1}{2}$ なので $\\frac{r(r-1)}{2}=-\\frac{1}{8}$（マイナス）。$x$ が0に近くないと（$1.5^{10}$ など）近似は大きくずれる。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '30mm', s2: '17mm', s3: '22mm', trap: '16mm' }, boxh: { s1: '11mm' },
    fits(q) { return /2次近似/.test(q); },
    steps: {
      // 2次近似の式（教科書 例題2）
      s1(r) {
        if (r.chance(0.35)) {
          const a = r.pick([2, 3, -1, -2, -3, 4]), A = [fr(1), fr(a), fr(a * a, 2)];
          return { q: `$${ex(a, 'x')}$ の2次近似`, a: `$${ascTeX(A)}$`, easy: `$1+${a < 0 ? `(${a})` : a}x+\\frac{${a < 0 ? `(${a})` : a}^{2}}{2}x^{2}$`, easyCheck: false, verify: p => quadOK(p.a, x => Math.exp(a * x)), key: 'e' + a };
        }
        const isInt = r.chance(0.6), rr = isInt ? fr(r.intNot(2, 12, x => x === 10)) : r.pick([fr(1, 2), fr(-1), fr(-2), fr(-1, 2), fr(3, 2), fr(1, 3)]);   // (1+x)^{10} は楽な形の例（O-2）
        const A = binom2(rr), f = isInt ? `(1+x)^{${rr[0]}}` : RTEX[rKey(rr)][0], R = F.val(rr);
        return { q: `$${f}$ の2次近似`, a: `$${ascTeX(A)}$`, easy: `$r=${F.tex(rr)}$、$\\frac{r(r-1)}{2}=${F.tex(A[2])}$`, easyCheck: false, verify: p => quadOK(p.a, x => Math.pow(1 + x, R)), key: 'r' + rKey(rr) };
      },
      // 2次近似で値を（教科書 例題2（2）・例題10）
      s2(r) {
        const kind = r.int(0, 3);
        if (kind === 3) {
          const x = D(r.pick(['0.1', '-0.1', '0.2', '-0.2', '0.05', '0.3'])), A = [fr(1), fr(1), fr(1, 2)];
          const v = P.at(A, x), xs = dt(x);
          return { q: `2次近似で $e^{${xs}}\\approx□$`, a: `$${dt(v)}$`, easy: `$1+${xs.replace(/^-/, '(-') + (/^-/.test(xs) ? ')' : '')}+\\frac{${/^-/.test(xs) ? `(${xs})` : xs}^{2}}{2}$`, easyCheck: false, verify: p => (Math.abs(ev(strip(p.a)) - Math.exp(F.val(x))) < Math.pow(Math.abs(F.val(x)), 3) / 4 + 1e-12 || 'ほんとうの値とずれる'), key: cap('v3', xs, 2) };
        }
        const rr = kind === 0 ? fr(r.int(5, 20)) : kind === 1 ? fr(1, 2) : r.pick([fr(-1), fr(-2), fr(-1, 2)]);
        const x = D(r.pick(kind === 0 ? ['0.01', '0.02', '0.03', '-0.01', '-0.02'] : ['0.02', '0.04', '-0.02', '0.1', '-0.04', '0.06']));
        const base = dt(F.add(fr(1), x)), A = binom2(rr), v = P.at(A, x), R = F.val(rr), X = F.val(x);
        if (Math.abs(R * X) > 0.3 + 1e-9) return null;   // rx が大きいと、2次近似でもずれが大きい（1.03^{20} など）
        if (kind === 0 && R === 10 && dt(x) === '0.01') return null;   // 1.01^{10} は楽な形の例（O-2）
        const qx = rr[1] === 1 && rr[0] > 0 ? `${base}^{${rr[0]}}` : RTEX[rKey(rr)][1](base);
        const c3 = Math.abs(R * (R - 1) * (R - 2) / 6 * X * X * X);
        return {
          q: `2次近似で $${qx}\\approx□$`, a: `$${dt(v)}$`, easyCheck: false, key: cap('v' + kind, qx, 2),   // n 乗・ルート・逆数・e は2問ずつまで
          easy: `$x=${dt(x)}$、$r=${F.tex(rr)}$：$1+${dt(F.mul(rr, x))}${/^-/.test(dt(A[2] && P.at([fr(0), fr(0), A[2]], x))) ? '' : '+'}${dt(P.at([fr(0), fr(0), A[2]], x))}$`.replace('+-', '-'),
          verify: p => (Math.abs(ev(strip(p.a)) - Math.pow(1 + X, R)) <= 2 * c3 + 1e-12 || 'ほんとうの値とずれる'),
        };
      },
      // 見かけがちがう：預金・ルートの中が1に近くない
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.int(3, 10), i = r.pick([1, 2, 3]), x = fr(i, 100), A = binom2(fr(n)), v = F.mul(fr(10000), P.at(A, x));
          if (n === 10 && i === 1) return null;   // 1.01^{10} は楽な形の例（O-2）
          return {
            q: `1年に $${i}$ % の利息がつく預金に $10000$ 円を $${n}$ 年あずけると、$10000\\times${dt(F.add(fr(1), x))}^{${n}}$ 円。2次近似で □ 円`, a: `$${dt(v)}$`, easyCheck: false, key: `m${n % 2}`,   // 預金は2問まで
            easy: `$${dt(F.add(fr(1), x))}^{${n}}\\approx1+${dt(F.mul(fr(n), x))}+${dt(P.at([fr(0), fr(0), A[2]], x))}$`,
            verify: p => (Math.abs(ev(strip(p.a)) - 10000 * Math.pow(1 + i / 100, n)) < 10000 * Math.pow(i / 100, 3) * n * n * n / 6 + 1e-9 || 'ほんとうの値とずれる'),
          };
        }
        const a = r.pick([2, 3, 10]), x = D(r.pick(['0.01', '0.02', '0.04', '-0.02'])), inside = dt(F.mul(fr(a * a), F.add(fr(1), x)));
        const v = F.mul(fr(a), P.at(binom2(fr(1, 2)), x));
        return {
          q: `2次近似で $\\sqrt{${inside}}\\approx□$`, a: `$${dt(v)}$`, easyCheck: false, key: `s${a % 2}`,   // ルートは2問まで（2・10 と 3）
          easy: `$\\sqrt{${inside}}=${a}\\sqrt{${dt(F.add(fr(1), x))}}$ と直してから`,
          verify: p => (Math.abs(ev(strip(p.a)) - Math.sqrt(+inside)) < a * Math.pow(Math.abs(F.val(x)), 3) / 8 + 1e-12 || 'ほんとうの値とずれる'),   // 次の項は a x^3/16
        };
      },
      // わな：x が0に近くない（1.5^4。2次近似は大きくずれる）
      trap(r) {
        const [x, n] = r.pick([['0.5', 4], ['0.5', 5], ['0.5', 6], ['0.4', 4]]), b = dt(F.add(fr(1), D(x))), v = (() => { let o = fr(1); for (let i = 0; i < n; i++) o = F.mul(o, D(b)); return o; })();
        return dest({ q: `$${b}^{${n}}\\approx□$（小数第1位まで）`, a: `$${roundStr(v, 1)}$`, verify: p => (Math.abs(ev(strip(p.a)) - Math.pow(+b, n)) <= 0.05 + 1e-9 || '値がちがう') }, '5-84',
          `$x=${x}$ は0に近くないので、2次近似では $${dt(P.at(binom2(fr(n)), D(x)))}$ になって大きくずれる。$${b}^{2}=${dt(F.mul(D(b), D(b)))}$ から、かけ算でそのまま計算`);
      },
    },
  });

  // ================================================================ 5-85
  M.add({
    id: '5-85', part: 6, chap: '5-17⑥⑧ 例題3・11', stars: 1,
    title: '小さい角では $\\sin\\theta\\approx\\theta$、$\\cos\\theta\\approx1-\\dfrac{\\theta^2}{2}$（rad で。振り子の高さ $\\approx\\dfrac{L\\theta^2}{2}$）',
    mark: 'rad の小さい角の sin・cos、振り子のおもりの高さ。$\\sin0.1$、$\\cos0.2$、長さ $2\\,\\mathrm{m}$ で $0.2\\,\\mathrm{rad}$。',
    futsu: ['$\\cos0.2=1-\\frac{0.2^2}{2!}+\\frac{0.2^4}{4!}-\\cdots$', 'と、テイラー展開の項を何項もたす'],
    raku: ['$\\cos0.2\\approx1-\\frac{0.2^2}{2}=0.98$', '高さ $L(1-\\cos\\theta)\\approx\\frac{L\\theta^2}{2}$', '$\\frac{2\\times0.04}{2}=0.04\\,\\mathrm{m}$'],
    why: '$\\sin\\theta=\\theta-\\frac{\\theta^3}{6}+\\cdots$、$\\cos\\theta=1-\\frac{\\theta^2}{2}+\\frac{\\theta^4}{24}-\\cdots$（5-17⑤）。$\\theta$ が小さいと、うしろの項はとても小さいので、はじめの項だけでよい（5-17⑥）。',
    caution: '角は rad で入れる（$\\sin10^{\\circ}\\approx10$ は大まちがい。$10^{\\circ}=0.1745\\,\\mathrm{rad}$）。角が大きいとき（$\\frac{\\pi}{2}$ など）は使えない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s2: 1, s3: 1 },
    boxw: '18mm',
    fits(q) {
      if (/振り子/.test(q) && /上がって|横に/.test(q)) return true;
      if ([...q.matchAll(/\\(?:sin|cos)\s*(\d+(?:\.\d+)?)\^\{\\circ\}/g)].some(m => +m[1] <= 20)) return true;
      return /\\(?:sin|cos)\s*0\.\d/.test(q);
    },
    steps: {
      // sin θ ≈ θ、cos θ ≈ 1−θ²/2
      s1(r) {
        const t = r.pick(['0.1', '0.2', '0.3', '0.05', '0.02', '0.04', '0.15', '0.12', '0.25', '0.08']), fn = r.pick(['sin', 'cos', 'cos']), x = D(t);
        if (fn === 'cos' && t === '0.2') return null;   // 楽な形の例 cos0.2（O-2）
        const v = fn === 'sin' ? x : F.sub(fr(1), F.div(F.mul(x, x), fr(2)));
        return { q: `小さい角（rad）の近似で $\\${fn}${t}\\approx□$`, a: `$${dt(v)}$`, easy: fn === 'sin' ? `$\\sin\\theta\\approx\\theta$` : `$1-\\frac{${t}^{2}}{2}=1-${dt(F.div(F.mul(x, x), fr(2)))}$`, easyCheck: false, key: fn === 'sin' ? cap('sin', t, 3) : fn + t, verify: p => (Math.abs(ev(strip(p.a)) - Math[fn](+t)) < Math.pow(+t, fn === 'sin' ? 3 : 4) / 5 + 1e-12 || 'ほんとうの値とずれる') };   // sin は3問まで
      },
      // 次の項まで・度を rad に（教科書 例題3）
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t = r.pick(['0.1', '0.2', '0.3']), x = D(t), v = F.sub(x, F.div(F.mul(F.mul(x, x), x), fr(6)));
          return { q: `$\\theta-\\frac{\\theta^{3}}{6}$ で $\\sin${t}\\approx□$（小数第4位まで）`, a: `$${roundStr(v, 4)}$`, easy: `$${t}-\\frac{${dt(F.mul(F.mul(x, x), x))}}{6}$`, easyCheck: false, key: cap('s', t, 2), verify: p => (Math.abs(ev(strip(p.a)) - Math.sin(+t)) < 0.0001 || 'ほんとうの値とずれる') };
        }
        if (k === 1) {
          const t = r.pick(['0.2', '0.3', '0.4']), x = D(t), x2 = F.mul(x, x), v = F.add(F.sub(fr(1), F.div(x2, fr(2))), F.div(F.mul(x2, x2), fr(24)));
          return { q: `$1-\\frac{\\theta^{2}}{2}+\\frac{\\theta^{4}}{24}$ で $\\cos${t}\\approx□$（小数第4位まで）`, a: `$${roundStr(v, 4)}$`, easy: `$1-${dt(F.div(x2, fr(2)))}+\\frac{${dt(F.mul(x2, x2))}}{24}$`, easyCheck: false, key: cap('c', t, 2), verify: p => (Math.abs(ev(strip(p.a)) - Math.cos(+t)) < 0.0001 || 'ほんとうの値とずれる') };   // 次の項までは sin・cos 2問ずつまで（のこりは度）
        }
        const d = r.pick([3, 6, 9, 12, 15, 18]), x = F.div(F.mul(fr(d), D('3.14')), fr(180));
        // 度は rad に直してから（教科書 まちがえやすいところ）。sin θ ≈ θ のずれは θ^3/6（15° で 0.003）なので、小数第3位まで
        const th = d * Math.PI / 180;
        return { q: `$\\sin\\theta\\approx\\theta$ で $\\sin${d}^{\\circ}\\approx□$（$\\pi=3.14$ として、小数第3位まで）`, a: `$${roundStr(x, 3)}$`, easy: `rad に直す：$${d}\\times\\frac{3.14}{180}$`, easyCheck: false, key: 'd' + d, verify: p => (Math.abs(ev(strip(p.a)) - Math.sin(th)) < 1.3 * th * th * th / 6 + 0.0006 || 'ほんとうの値とずれる') };
      },
      // 振り子の高さ・横のずれ（教科書 例題11）
      s3(r) {
        const L = r.pick(['0.5', '0.8', '1', '1.2', '1.5', '2', '2.5', '3']), t = r.pick(['0.1', '0.2', '0.3', '0.15']), up = r.chance(0.7);
        if (L === '2' && t === '0.2') return null;   // 楽な形の例（長さ 2 m で 0.2 rad。O-2）
        const h = up ? F.div(F.mul(F.mul(fr(100), D(L)), F.mul(D(t), D(t))), fr(2)) : F.mul(F.mul(fr(100), D(L)), D(t));
        return {
          q: `長さ $${L}\\,\\mathrm{m}$ の振り子が $${t}\\,\\mathrm{rad}$ ふれた。おもりは、いちばん下から${up ? '約何 cm 上がっているか（$\\cos\\theta\\approx1-\\frac{\\theta^{2}}{2}$ で）' : '横に約何 cm ずれているか（$\\sin\\theta\\approx\\theta$ で）'}　□ cm`,
          a: `$${dt(h)}$`, easyCheck: false, key: up ? cap('u', L + t, 3) : cap('s', L + t, 3),   // 高さは3問まで（横のずれが1問は出る）
          easy: up ? `$h=L(1-\\cos\\theta)\\approx\\frac{L\\theta^{2}}{2}=\\frac{${L}\\times${dt(F.mul(D(t), D(t)))}}{2}$ m` : `$L\\sin\\theta\\approx L\\theta=${L}\\times${t}$ m`,
          verify: p => { const want = 100 * +L * (up ? 1 - Math.cos(+t) : Math.sin(+t)); return Math.abs(ev(strip(p.a)) - want) < want * +t * +t / 5 + 1e-9 || '値がずれる'; },   // ずれの割合は θ^2/12（高さ）・θ^2/6（横）
        };
      },
      // わな：大きい角（π/2 は小さくない）
      trap(r) {
        const [q, a, v] = r.pick([['\\sin\\frac{\\pi}{2}', '1', 1], ['\\cos\\pi', '-1', -1], ['\\cos\\frac{\\pi}{2}', '0', 0], ['\\sin\\frac{2\\pi}{3}', '\\frac{\\sqrt{3}}{2}', Math.sqrt(3) / 2], ['\\cos\\frac{2\\pi}{3}', '-\\frac{1}{2}', -0.5]]);
        return dest({ q: `$${q}$`, a: `$${a}$`, verify: p => ((near(ev(strip(p.a)), v) && Math.abs(ev(strip(p.q)) - v) < 1e-9) || '値がちがう') }, '5-85', '角が大きいので、$\\sin\\theta\\approx\\theta$ や $1-\\frac{\\theta^{2}}{2}$ は大きくずれる。単位円の値を使う');
      },
    },
  });

  // ================================================================ 5-86
  // L/g = k^2（k は 0.1 きざみ）になる長さ。周期は 2kπ
  //   s2 は s1 に出た長さをよける（N-2）ので、数は 6＋6 より多くいる
  //   0.5（長さ 2.45 m、周期 π）は楽な形の例なので出さない（O-2）
  const KS = ['0.1', '0.2', '0.25', '0.3', '0.4', '0.6', '0.7', '0.8', '0.9', '1', '1.2', '1.5', '2'];
  const periodTeX = k => { const t = F.mul(fr(2), D(k)); return t[1] === 1 && t[0] === 1 ? '\\pi' : `${dt(t)}\\pi`; };
  M.add({
    id: '5-86', part: 6, chap: '5-17⑧ 例題5', stars: 1,
    title: '振り子の周期 $2\\pi\\sqrt{\\dfrac{L}{g}}$：$\\dfrac{L}{g}$ が平方数になる長さを見る',
    mark: '振り子の長さと $g=9.8\\,\\mathrm{m/s^2}$。$L=2.45\\,\\mathrm{m}$、$9.8\\,\\mathrm{m}$、$0.098\\,\\mathrm{m}$。',
    futsu: ['$\\sqrt{\\frac{L}{g}}$ を小数で求め、', '$2\\times3.14$ をかける（ルートの計算が長い）'],
    raku: ['$\\frac{2.45}{9.8}=0.25=0.5^2$', '$2\\pi\\times0.5=\\pi$（約3.14秒）'],
    why: '小さいふれでは $\\sin\\theta\\approx\\theta$ なので $\\ddot{\\theta}=-\\frac{g}{L}\\theta$ の単振動になり、$\\omega=\\sqrt{\\frac{g}{L}}$、周期 $\\frac{2\\pi}{\\omega}=2\\pi\\sqrt{\\frac{L}{g}}$（5-17⑧）。$\\frac{L}{g}$ が $0.25$ や $1$ なら、ルートがすぐはずれる。',
    caution: '周期はおもりの質量にも、ふれはばにもよらない（小さいふれのとき）。長さを4倍にすると周期は2倍（ルートの中が4倍）。ふれが大きいと周期は長くなり、この式は使えない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /振り子/.test(q) && /周期|長さ/.test(q) && !/\^\{\\circ\}|上がって|横に/.test(q); },
    steps: {
      s1(r) {
        const k = r.pick(KS), L = dt(F.mul(D('9.8'), F.mul(D(k), D(k))));
        return { q: `長さ $${L}\\,\\mathrm{m}$ の振り子の周期（$g=9.8\\,\\mathrm{m/s^{2}}$）　□ 秒`, a: `$${periodTeX(k)}$`, easyCheck: false, key: 'L' + k,
          easy: `$\\frac{${L}}{9.8}=${dt(F.mul(D(k), D(k)))}=${k}^{2}$`, verify: p => numOK(p.a, 2 * Math.PI * Math.sqrt(+L / 9.8), 1e-9) };
      },
      // 逆に周期から長さ・π=3.14 で秒に（長さの表の、1つおきに形を変える）
      s2(r) {
        const k = r.pick(KS), L = dt(F.mul(D('9.8'), F.mul(D(k), D(k))));
        if (KS.indexOf(k) % 2 === 0) return { q: `周期が $${periodTeX(k)}$ 秒の振り子の長さ（$g=9.8\\,\\mathrm{m/s^{2}}$）　□ m`, a: `$${L}$`, easyCheck: false, key: 'L' + k, easy: `$\\sqrt{\\frac{L}{g}}=${k}$ なので $L=9.8\\times${k}^{2}$`, verify: p => numOK(p.a, 9.8 * Math.pow(+k, 2), 1e-9) };
        // π=3.14 で出した周期を丸めた数と、ほんとうの周期を丸めた数が同じになるけたで聞く（2π×2=12.566… は 12.56 と 12.57 がくいちがうので小数第1位。O-4・R2-2）
        const T = F.mul(F.mul(fr(2), D(k)), D('3.14')), kd = [2, 1].find(d => roundStr(T, d) === (2 * Math.PI * +k).toFixed(d));
        if (!kd) return null;
        const ans = roundStr(T, kd);
        return { q: `長さ $${L}\\,\\mathrm{m}$ の振り子の周期は約 □ 秒（$g=9.8\\,\\mathrm{m/s^{2}}$、$\\pi=3.14$ として、小数第${kd}位まで）`, a: `$${ans}$`, easyCheck: false, key: 'L' + k,
          easy: `$2\\pi\\times${k}=${periodTeX(k)}\\approx${dt(T)}${dt(T) === ans ? '' : `\\approx${ans}`}$`, verify: p => (Math.abs(ev(strip(p.a)) - 2 * Math.PI * +k) <= 0.5 * 10 ** -kd + 1e-9 || '値がずれる') };
      },
      // 見かけがちがう：長さを何倍・月の上（どの形も2問まで）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const m = r.int(2, 5); return { q: `振り子の糸の長さを $${m * m}$ 倍にすると、周期は □ 倍`, a: `$${m}$`, easy: `$\\sqrt{${m * m}}=${m}$`, easyCheck: false, key: 'm' + (m % 2) }; }
        if (k === 1) { const m = r.int(2, 4); return { q: `振り子の周期を $${m}$ 倍にするには、糸の長さを □ 倍にする`, a: `$${m * m}$`, easy: `周期は $\\sqrt{L}$ に比例。$${m}^{2}=${m * m}$`, easyCheck: false, key: 'n' + (m % 2) }; }
        const kk = r.pick(['1', '0.25', '1.5']), L = dt(F.mul(D('1.6'), F.mul(D(kk), D(kk))));
        return { q: `月の上（$g=1.6\\,\\mathrm{m/s^{2}}$）で、長さ $${L}\\,\\mathrm{m}$ の振り子の周期　□ 秒`, a: `$${periodTeX(kk)}$`, easyCheck: false, key: 'g' + (kk.length % 2), easy: `$\\frac{${L}}{1.6}=${dt(F.mul(D(kk), D(kk)))}=${kk}^{2}$`, verify: p => numOK(p.a, 2 * Math.PI * Math.sqrt(+L / 1.6), 1e-9) };
      },
      // わな：ふれが大きい（sin θ ≈ θ が使えない。周期は長くなる）
      trap(r) {
        // 長さは、ステップ1・2の表（KS）にない数（わなの文の周期が、ステップ1・2の答えにならないように。O-2）
        const k = r.pick(['2.5', '3']), L = dt(F.mul(D('9.8'), F.mul(D(k), D(k)))), ang = r.pick([60, 90]), T = periodTeX(k);
        // ふれはば ang の周期（ほんとうの値）：T0 × (2/π) K(sin(ang/2))（数値で積分）
        const ratio = (() => { const m = Math.sin(ang * Math.PI / 360), n = 4000; let s = 0; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n * Math.PI / 2; s += 1 / Math.sqrt(1 - m * m * Math.sin(t) * Math.sin(t)); } return s / n; })();
        return dest({
          q: `長さ $${L}\\,\\mathrm{m}$ の振り子（小さいゆれの周期は $${T}$ 秒）の糸を、真下から $${ang}^{\\circ}$ まで持ち上げてはなすと、周期は $${T}$ 秒より □（長い・短い・同じ）`, a: '長い',
          key: 'a' + ang, verify: p => ((ratio > 1.01) === (p.a === '長い') || '周期の長さの見当がちがう'),
        }, '5-86', `ふれが大きいので $\\sin\\theta\\approx\\theta$ が使えず、周期は $2\\pi\\sqrt{\\frac{L}{g}}$ より長い（$${ang}^{\\circ}$ で約 $${Math.round((ratio - 1) * 100)}$ % 長い）`);
      },
    },
  });

  // ================================================================ 5-87
  const ETAB = { '-1': '0.368', '1': '2.718', '-2': '0.135', '2': '7.389', '-3': '0.0498', '3': '20.09' };
  const AS = ['-3', '-2', '-1', '-0.5', '-0.2', '-0.1', '0.1', '0.2', '0.5', '1', '2', '3'];
  const fnE = (C, a, v) => `${C}${ex(+a, v)}`;
  const eName = at => (String(at) === '1' ? 'e' : `e^{${at}}`);       // e^{1} とは書かない
  const digits = V => (V >= 100 ? 0 : V >= 1 ? 1 : 2);                 // 答えのけた：100 以上は整数、1 以上は小数第1位、1 より小さければ第2位
  const keta = k => (k ? `小数第${k}位まで` : '整数で');
  M.add({
    id: '5-87', part: 6, chap: '5-18②③ 例題1', stars: 1,
    title: '$f\'=af$ なら $f=f(0)e^{at}$（$C$ は $t=0$ の値）',
    mark: '「微分すると自分の□倍」と $f(0)$。$f\'=-3f$、$f(0)=5$。$\\dfrac{\\dd N}{\\dd t}=-0.1N$。',
    futsu: ['$f$ の形をあれこれためして、', '微分して自分の $-3$ 倍になるものをさがす'],
    raku: ['$f\'=-3f$ → $f=Ce^{-3t}$', '$t=0$ で $C=f(0)=5$', '$f=5e^{-3t}$'],
    why: '$(Ce^{at})\'=a\\times Ce^{at}$ なので、$Ce^{at}$ は「微分すると自分の $a$ 倍」（5-18②）。$t=0$ を入れると $e^0=1$ なので、$C$ はちょうどはじめの値（5-18③）。',
    caution: '$e$ の右肩には $t$ をつける（$e^{-3t}$）。$f\'=-3$（右に $f$ がない）なら $e$ ではなく $-3t+C$（1次式）。$C$ は $t=0$ の値で決める。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },   // 文が長いので、ステップ2は5問（右ページに入る数）
    cols: { s1: 1, s2: 1, s3: 1 },
    boxw: { s1: '28mm', s2: '16mm', s3: '16mm', trap: '28mm' },
    fits(q) {
      if (/'=-?[\d.]+\(/.test(q) || /\(T-/.test(q)) return false;
      return /([a-zA-Z])'=-?[\d.]*\1(?![a-zA-Z(])/.test(q) || /\\frac\{\\dd ([A-Za-z])\}\{\\dd t\}=-?[\d.]*\1(?![a-zA-Z(])/.test(q) || /(?<!2回)微分すると自分の/.test(q);
    },
    steps: {
      s1(r) {
        const a = r.pick(AS), C = r.pick([2, 3, 4, 5, 10, 20, 50, 80, 100]);
        if (a === '-3' && C === 5) return null;   // 楽な形の例 f'=-3f、f(0)=5（O-2）
        return { q: `$f'=${co(a)}f$、$f(0)=${C}$ をみたす $f(t)$`, a: `$f(t)=${fnE(C, a, 't')}$`, easy: `$f=Ce^{${kv(+a, 't')}}$、$C=f(0)=${C}$`, easyCheck: false, key: `${a},${C}`, verify: p => deOK(p.a, { order: 1, k: +a, x0: C }) };
      },
      // t での値（e の値を文に。教科書 例題1）。at＝e の右肩（±1・±2・±3）が整数になる時刻だけ
      s2(r) {
        const a = r.pick(AS), C = r.pick([2, 5, 10, 20, 50, 100]);
        const ats = ['-1', '1', '-2', '2', '-3', '3'].filter(e => { const t = F.div(D(e), D(a)); return t[1] === 1 && t[0] > 0 && t[0] <= 30; });
        if (!ats.length) return null;
        const at = r.pick(ats), t = F.div(D(at), D(a))[0], E = ETAB[at], v = F.mul(fr(C), D(E)), k = digits(F.val(v)), want = C * Math.exp(+at);
        if (a === '-3' && C === 5) return null;   // 楽な形の例（O-2）
        // 文の値（e^3=20.09 など）で出した数を丸めた答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（50×20.09=1004.5 → 1005、ほんとうは 1004。O-4・R2-4）
        const ans = roundStr(v, k);
        if (ans !== trueRd(want, k)) return null;
        return {
          q: `$f'=${co(a)}f$、$f(0)=${C}$。$f(${t})\\approx□$（$${eName(at)}=${E}$、${keta(k)}）`, a: `$${ans}$`, easyCheck: false, key: `${a},${C}`,
          easy: `$f=${fnE(C, a, 't')}$。$${C}${eName(at)}\\approx${C}\\times${E}=${dt(v)}${dt(v) === ans ? '' : `\\approx${ans}`}$`, verify: p => (Math.abs(ev(strip(p.a)) - want) < want * 0.003 + 0.51 * Math.pow(10, -k) || '値がずれる'),
        };
      },
      // 見かけがちがう：へる物質・ふえる細菌（dN/dt）
      s3(r) {
        const up = r.chance(0.4), k = up ? r.pick(['0.1', '0.2', '0.5']) : r.pick(['0.1', '0.2', '0.05']), N0 = up ? r.pick([100, 200, 500]) : r.pick([1000, 2000, 500]);
        const at = up ? r.pick(['1', '2']) : r.pick(['-1', '-2']), t = F.div(D(at.replace('-', '')), D(k))[0], E = ETAB[at], v = F.mul(fr(N0), D(E));
        // 文の値で出した数を丸めた答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（2000×0.135=270、ほんとうは 271。O-4・R2-3）
        if (roundStr(v, 0) !== trueRd(N0 * Math.exp(+at), 0)) return null;
        return {
          q: `${up ? '細菌の数 $N$（個）' : '放射性の物質の量 $N$（g）'}が $\\frac{\\dd N}{\\dd t}=${up ? '' : '-'}${k}N$（$t$ は時間）で${up ? 'ふえる' : 'へる'}。はじめ $${N0}$ ${up ? '個' : 'g'} なら、$${t}$ 時間後は約 □ ${up ? '個' : 'g'}（$${eName(at)}=${E}$、整数で）`,
          a: `$${roundStr(v, 0)}$`, easyCheck: false, key: `n${at}`,   // ふえる・へるが2問ずつ（e の右肩 ±1・±2）
          easy: `$N=${N0}${ex(up ? +k : -k, 't')}$。$${N0}${eName(at)}\\approx${N0}\\times${E}=${dt(v)}${dt(v) === roundStr(v, 0) ? '' : `\\approx${roundStr(v, 0)}`}$`, verify: p => (Math.abs(ev(strip(p.a)) - N0 * Math.exp(+at)) < N0 * Math.exp(+at) * 0.003 + 0.6 || '値がずれる'),
        };
      },
      // わな：f' が定数（e ではない。5-57）
      trap(r) {
        const a = r.intNot(-5, 5, x => x === 0 || x === 1), C = r.pick([2, 5, 10, 20]);
        return dest({ q: `$f'=${a}$、$f(0)=${C}$ のとき $f(t)=□$`, a: `$f(t)=${co(a)}t+${C}$`, boxw: '22mm', verify: p => { const R = rhsOf(p.a), f = t => ev(R, { t }); return (near(f(0), C) && near(dnum(f, 0.7, 1e-5), a, 1e-6)) || '式が合わない'; } }, '5-87',
          `右に $f$ がない（変わる速さが一定）。$e$ ではなく1次式 $${co(a)}t+C$`, ['5-57']);
      },
    },
  });

  // ================================================================ 5-88
  M.add({
    id: '5-88', part: 6, chap: '5-18④ 例題5', stars: 1,
    title: 'ずらして使う：$T\'=-k(T-T_{\\mathrm{s}})$ なら $T=T_{\\mathrm{s}}+(T_0-T_{\\mathrm{s}})e^{-kt}$',
    mark: '「部屋の温度との差に比例して冷める（あたたまる）」。$T\'=-0.05(T-20)$、はじめ80 ℃。',
    futsu: ['$T$ の形をためして、微分した式に', '入れ、数を合わせる'],
    raku: ['差 $u=T-20$ は $u\'=-0.05u$', '$u=60e^{-0.05t}$', '$T=20+60e^{-0.05t}$'],
    why: '部屋の温度は定数なので、差 $u=T-T_{\\mathrm{s}}$ を微分しても $u\'=T\'$。だから $u\'=-ku$ で、$u=u_0e^{-kt}$（5-18④）。$u_0$ ははじめの差 $T_0-T_{\\mathrm{s}}$。',
    caution: '$e$ の前の数は、はじめの温度ではなく「はじめの差」（$80-20=60$）。部屋より冷たいもの（5 ℃ の飲み物）は差がマイナスで、$T=20-15e^{-0.1t}$。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },   // 文が長いので、ステップ2は4問、ステップ3は3問（右ページに入る数）
    cols: { s1: 1, s2: 1, s3: 1 },
    boxw: { s1: '30mm', s2: '16mm', s3: '16mm', trap: '28mm' },
    fits(q) { return /'=-[\d.]+\(([A-Z])-[\d.]+\)/.test(q) || /\\frac\{\\dd T\}\{\\dd t\}=-[\d.]+\(T-/.test(q); },
    steps: {
      s1(r) {
        const Ts = r.pick([20, 25, 22, 18, 5]), warm = Ts >= 18 && r.chance(0.3), T0 = warm ? r.pick([5, 10, 2]) : Ts + r.pick([40, 50, 60, 70]), k = r.pick(['0.05', '0.1', '0.02', '0.04', '0.2']), d = T0 - Ts;
        if (Ts === 20 && (T0 === 80 && k === '0.05' || T0 === 5 && k === '0.1')) return null;   // 楽な形・気をつけることの例（O-2）
        return {
          q: `${Ts === 5 ? '冷蔵庫の中' : '部屋'}の温度は $${Ts}$ ℃。$T'=-${k}(T-${Ts})$、$T(0)=${T0}$ をみたす $T$`, a: `$T=${Ts}${d < 0 ? '-' : '+'}${Math.abs(d)}e^{-${k}t}$`, easyCheck: false, key: `${Ts},${T0},${k}`,
          easy: `はじめの差 $${T0}-${Ts}=${d}$`, verify: p => deOK(p.a, { order: 1, k: -k, s: Ts, x0: T0 }),
        };
      },
      // t 分後の温度（e^{-1}・e^{-2} を文に）
      s2(r) {
        const Ts = r.pick([20, 25, 22]), warm = r.chance(0.3), T0 = warm ? r.pick([5, 10]) : Ts + r.pick([40, 50, 60, 70]), k = r.pick(['0.05', '0.1', '0.02', '0.04']), at = r.pick(['-1', '-1', '-2']);
        const t = F.div(D(at.replace('-', '')), D(k))[0], d = T0 - Ts, v = F.add(fr(Ts), F.mul(fr(d), D(ETAB[at]))), ans = roundStr(v, 1);
        if (Ts === 20 && (T0 === 80 && k === '0.05' || T0 === 5 && k === '0.1')) return null;   // 楽な形・気をつけることの例（O-2）
        // 文の値で出した数を丸めた答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（20−10×0.135=18.65 → 18.7、ほんとうは 18.6。O-4・R2-5）
        if (ans !== trueRd(Ts + d * Math.exp(+at), 1)) return null;
        return {
          q: `部屋の温度は $${Ts}$ ℃。$T'=-${k}(T-${Ts})$（$t$ は分）、はじめ $${T0}$ ℃。$${t}$ 分後は約 □ ℃（$e^{${at}}=${ETAB[at]}$ として、小数第1位まで）`, a: `$${ans}$`, easyCheck: false, key: `${Ts},${T0},${k}`,
          easy: `$${Ts}${d < 0 ? '-' : '+'}${Math.abs(d)}e^{${at}}\\approx${Ts}${d < 0 ? '-' : '+'}${Math.abs(d)}\\times${ETAB[at]}=${dt(v)}${dt(v) === ans ? '' : `\\approx${ans}`}$`, verify: p => (Math.abs(ev(strip(p.a)) - (Ts + d * Math.exp(+at))) < 0.1 || '値がずれる'),
        };
      },
      // 見かけがちがう：差が半分になる時刻（ln 2。教科書 例題5）・はじめの冷める速さ・近づく温度が1問ずつ。冷蔵庫・dT/dt の書き方
      s3(r) {
        const kind = r.int(0, 2), k = r.pick(['0.05', '0.1', '0.02', '0.04', '0.07']), Ts = r.pick([20, 25, 5]), d = Ts === 5 ? r.pick([10, 16, 20]) : r.pick([40, 50, 60, 70]), T0 = Ts + d, half = Ts + d / 2;
        const head = `${Ts === 5 ? '冷蔵庫の中' : '部屋'}の温度は $${Ts}$ ℃。$\\frac{\\dd T}{\\dd t}=-${k}(T-${Ts})$（$t$ は分）、はじめ $${T0}$ ℃。`;
        const Tt = t => Ts + d * Math.exp(-k * t);   // 確かめ用：答えの式 T=Ts+d e^{-kt}
        if (Ts === 20 && d === 60 && k === '0.05') return null;   // 楽な形の例（O-2）
        if (kind === 0) {
          const t = F.div(D('0.693'), D(k)), ans = roundStr(t, 1);
          if (ans !== trueRd(Math.LN2 / +k, 1)) return null;   // 文の値とほんとうの値で、丸めた答えがくいちがう組は出さない（O-4）
          return {
            q: `${head}$${half}$ ℃ になるのは約 □ 分後（$\\ln2=0.693$ として、小数第1位まで）`, a: `$${ans}$`, easyCheck: false, key: 'h',
            easy: `差が半分：$e^{-${k}t}=\\frac{1}{2}$、$t=\\frac{\\ln2}{${k}}\\approx\\frac{0.693}{${k}}=${dt(t)}${dt(t) === ans ? '' : `\\approx${ans}`}$`, verify: p => (Math.abs(Tt(ev(strip(p.a))) - half) < d / 2 * k * 0.07 || '時刻がずれる'),
          };
        }
        if (kind === 1) {
          const v = F.mul(D(k), fr(d));
          return {
            q: `${head}はじめ（$t=0$）の冷める速さは、1分あたり □ ℃`, a: `$${dt(v)}$`, easyCheck: false, key: 'r',
            easy: `式の右に $T=${T0}$ を入れる：$${k}\\times(${T0}-${Ts})$`, verify: p => (Math.abs(ev(strip(p.a)) + dnum(Tt, 0, 1e-5)) < 1e-6 || '速さがちがう'),
          };
        }
        return {
          q: `${head}じゅうぶん時間がたつと、温度は □ ℃ に近づく`, a: `$${Ts}$`, easyCheck: false, key: 'inf',
          easy: `$T=${Ts}+${d}e^{-${k}t}$ で $e^{-${k}t}$ が0に近づく（差がなくなる）`, verify: p => (Math.abs(ev(strip(p.a)) - Tt(1e5)) < 1e-9 || '近づく温度がちがう'),
        };
      },
      // わな：部屋の温度がない（ずらさない。5-87）
      trap(r) {
        const k = r.pick(['0.05', '0.1', '0.02']), T0 = r.pick([60, 80, 90]);
        return dest({ q: `$T'=-${k}T$、$T(0)=${T0}$ のとき $T=□$`, a: `$T=${T0}e^{-${k}t}$`, boxw: '24mm', verify: p => deOK(p.a, { order: 1, k: -k, x0: T0 }) }, '5-88', '部屋の温度との差ではなく、$T$ そのものに比例。ずらさずに $Ce^{-kt}$');
      },
    },
  });

  // ================================================================ 5-89
  const AMPS = ['0.1', '0.2', '0.3', '0.5', '2', '3', '0.05'];
  // x=A sin ωt + B cos ωt（sin を先に。教科書と同じ）
  function shmTeX(A, B, w, v) {
    const s = A[0] === 0 ? '' : cx(A, trig('sin', w, 't')), c = B[0] === 0 ? '' : cx(B, trig('cos', w, 't'));
    const dd = x => (decStr(x) && decStr(x).length < 7 ? decStr(x) : null);
    const t1 = A[0] === 0 ? '' : (dd(A) && A[1] !== 1 ? `${dd(A)}${trig('sin', w, 't')}` : s), t2 = B[0] === 0 ? '' : (dd(B) && B[1] !== 1 ? `${dd(B)}${trig('cos', w, 't')}` : c);
    return `${v}=${sum([t1.replace(/^1(?=\\)/, ''), t2.replace(/^1(?=\\)/, '')])}`;
  }
  M.add({
    id: '5-89', part: 6, chap: '5-18②③ 例題2・3', stars: 1,
    title: '$\\ddot{x}=-\\omega^2x$ は $x=x_0\\cos\\omega t+\\dfrac{v_0}{\\omega}\\sin\\omega t$（位置で cos、速度÷$\\omega$ で sin）',
    mark: '$\\ddot{x}=-\\square x$ と $x(0)$・$\\dot{x}(0)$。$\\ddot{x}=-9x$、$x(0)=0.2$、$\\dot{x}(0)=0$。',
    futsu: ['$x=A\\sin\\omega t+B\\cos\\omega t$ を微分し、', '$t=0$ を2回入れて $A$、$B$ の式を解く'],
    raku: ['$\\omega^2=9$ で $\\omega=3$', '位置 $0.2$ → $0.2\\cos3t$', '速度0 → sin の項なし'],
    why: '$t=0$ で $\\sin0=0$、$\\cos0=1$ なので、位置には cos の項だけが効く。微分すると sin の項は $\\omega\\cos$ になり、速度には sin の項だけが効く。だから $B=x_0$、$A=\\frac{v_0}{\\omega}$（5-18③）。',
    caution: '$\\omega$ は2乗をはずした数（$\\ddot{x}=-9x$ なら $\\omega=3$。$\\sin9t$ は×）。速度は $\\omega$ でわってから sin の前に。右がプラス $\\ddot{x}=4x$ なら sin・cos ではない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '30mm', s2: '36mm', s3: '24mm', trap: '36mm' },
    fits(q) { return !/をみたすのは/.test(q) && (/\\ddot\{(\\theta|[a-z])\}=-[\d.]*\s*\\?\1/.test(q) || /\\ddot\{(\\theta|[a-z])\}=-\\frac/.test(q)); },
    steps: {
      // 位置か速度の片方が0（教科書 例題2）
      s1(r) {
        const w = r.int(1, 6), amp = D(r.pick(AMPS)), pos = r.chance(0.55), x0 = pos ? amp : fr(0), v0 = pos ? fr(0) : F.mul(amp, fr(w));
        if (w === 3 && pos && dt(amp) === '0.2') return null;   // 楽な形の例（O-2）
        const a = shmTeX(pos ? fr(0) : amp, pos ? amp : fr(0), w, 'x');
        return {
          q: `$\\ddot{x}=-${w * w === 1 ? '' : w * w}x$、$x(0)=${dt(x0)}$、$\\dot{x}(0)=${dt(v0)}$ をみたす $x$`, a: `$${a}$`, easyCheck: false, key: `${w},${dt(x0)},${dt(v0)}`,
          easy: `$\\omega=${w}$。${pos ? `位置 $${dt(x0)}$ で cos` : `速度 $${dt(v0)}\\div${w}=${dt(amp)}$ で sin`}`, verify: p => deOK(p.a, { order: 2, k: -w * w, x0: F.val(x0), v0: F.val(v0), v: 't' }),
        };
      },
      // 位置も速度も0でない（教科書 例題3）
      s2(r) {
        const w = r.int(2, 5), A = D(r.pick(['0.1', '0.2', '0.3', '0.4', '0.5'])), B = D(r.pick(['0.1', '0.2', '0.3', '-0.1', '-0.2'])), v0 = F.mul(A, fr(w));
        return {
          q: `$\\ddot{x}=-${w * w}x$、$x(0)=${dt(B)}$、$\\dot{x}(0)=${dt(v0)}$ をみたす $x$`, a: `$${shmTeX(A, B, w, 'x')}$`, easyCheck: false, key: `${w},${dt(B)},${dt(v0)}`,
          easy: `$\\omega=${w}$。cos の前は $${dt(B)}$、sin の前は $${dt(v0)}\\div${w}=${dt(A)}$`, verify: p => deOK(p.a, { order: 2, k: -w * w, x0: F.val(B), v0: F.val(v0), v: 't' }),
        };
      },
      // 見かけがちがう：周期・m x'' = −kx・ばねを静かにはなす（教科書 5-18③ の例2）
      s3(r) {
        const k = r.int(0, 2), w = r.intNot(2, 6, x => x === 3);   // ẍ=-9x は楽な形の例（O-2）
        if (k === 0) return { q: `$\\ddot{x}=-${w * w}x$ の動きの周期`, a: `$${piTeX(2, w)}$`, easy: `$\\omega=${w}$、$\\frac{2\\pi}{\\omega}$`, easyCheck: false, key: 'T' + (w % 2), verify: p => numOK(p.a, 2 * Math.PI / w, 1e-9) };
        if (k === 1) {
          const m = r.pick([2, 3, 4]), amp = D(r.pick(['0.1', '0.2', '0.05']));
          return { q: `$${m}\\ddot{x}=-${m * w * w}x$、$x(0)=${dt(amp)}$、$\\dot{x}(0)=0$ をみたす $x$`, a: `$${shmTeX(fr(0), amp, w, 'x')}$`, easy: `両辺を $${m}$ でわって $\\ddot{x}=-${w * w}x$`, easyCheck: false, key: 'm' + (w % 2), verify: p => deOK(p.a, { order: 2, k: -w * w, x0: F.val(amp), v0: 0, v: 't' }) };
        }
        const amp = r.pick(['0.1', '0.2', '0.05']);
        return { q: `ばねのおもりを $${amp}\\,\\mathrm{m}$ 引いて、静かに手をはなした。位置 $x$（m）が $\\ddot{x}=-${w * w}x$ にしたがうとき、$x$ の式`, a: `$${shmTeX(fr(0), D(amp), w, 'x')}$`, easy: '静かにはなす → はじめの速度0。cos だけ', easyCheck: false, key: 's' + (w % 2), verify: p => deOK(p.a, { order: 2, k: -w * w, x0: +amp, v0: 0, v: 't' }) };
      },
      // わな：右がプラス（ゆれない。5-98）
      trap(r) {
        const a = r.int(1, 3), c = D(r.pick(['0.02', '0.2', '2', '0.04'])), half = F.div(c, fr(2));
        return dest({ q: `$\\ddot{x}=${a * a === 1 ? '' : a * a}x$、$x(0)=${dt(c)}$、$\\dot{x}(0)=0$ をみたす $x$`, a: `$x=${dt(half) === '1' ? `${ex(a, 't')}+${ex(-a, 't')}` : `${dt(half)}(${ex(a, 't')}+${ex(-a, 't')})`}$`, verify: p => deOK(p.a, { order: 2, k: a * a, x0: F.val(c), v0: 0 }) }, '5-89',
          `右がプラス（自分の $${a * a}$ 倍）なので、sin・cos ではなく $Ae^{${kv(a, 't')}}+Be^{${kv(-a, 't')}}$`);
      },
    },
  });

  // ================================================================ 5-90
  // A e^{at} + B e^{-at} の TeX
  const expPair = (A, B, a, v) => sum([A === 0 ? '' : `${A === 1 ? '' : A === -1 ? '-' : A}${ex(a, v)}`, B === 0 ? '' : `${B === 1 ? '' : B === -1 ? '-' : B}${ex(-a, v)}`]);
  // 「$y=…$ のとき $y''=□y$」の確かめ（別の道すじ）：問題の文の式を読み、数値で order 回微分して、答えの数×もとの式とくらべる
  function timesOK(p, order) {
    const m = /^\$[a-z]=([^$]+)\$ のとき/.exec(p.q); if (!m) return '問題の式が読めない';
    const f = t => ev(m[1], { t }), c = ev(strip(p.a));
    if (f(0.3) == null || c == null) return '式が読めない';
    for (const t of [0.4, 0.9]) { const d = order === 2 ? d2num(f, t, 1e-4) : dnum(f, t, 1e-5); if (Math.abs(d - c * f(t)) > 1e-5 * Math.max(1, Math.abs(d))) return '倍の数がちがう'; }
    return true;
  }
  M.add({
    id: '5-90', part: 6, chap: '5-18 例題4', stars: 1,
    title: '答えの候補は入れて確かめる：$y\'\'$ を作って、もとの式の何倍か',
    mark: '式が先にあって、「$y\'\'$ は $y$ の何倍か」「みたすのはどれか」。$y=3e^{2t}+e^{-2t}$ のとき $y\'\'=□y$。',
    futsu: ['$y\'\'$ を作ったあと、$y\'\'\\div y$ を', 'いくつかの $t$ で計算してくらべる'],
    raku: ['$e^{2t}$ も $e^{-2t}$ も2回微分で4倍', '$y\'\'=12e^{2t}+4e^{-2t}=4y$'],
    why: '$e^{at}$ と $e^{-at}$ は2回微分するとどちらも $a^2$ 倍、$\\sin\\omega t$ と $\\cos\\omega t$ はどちらも $-\\omega^2$ 倍。項ごとに同じ数がかかるので、前にくくり出せて「もとの式の何倍」になる（5-18②）。',
    caution: '$e^{-2t}$ の2回微分は $(-2)\\times(-2)=4$ 倍（$-4$ 倍ではない）。$te^{2t}$ のように $t$ がかかると、積の微分で項がふえて「何倍」にならない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /のとき\s*\$(?:y''|y'|\\ddot\{[a-z]\})=□/.test(q) || /をみたすのは/.test(q); },
    steps: {
      // e^{at} と e^{-at}（教科書 例題4）
      s1(r) {
        // a は1つずつ（答えが 1・9・16・25・36・0.25 と、ばらばらになる）。a=2（4倍）は楽な形の例なので出さない（O-2）
        const a = r.pick(['1', '3', '4', '5', '6', '0.5']), A = r.intNot(-3, 3, x => x === 0), B = r.intNot(-3, 3, x => x === 0), y = expPair(A, B, +a, 't');
        return { q: `$y=${y}$ のとき $y''=□y$`, a: `$${dt(F.mul(D(a), D(a)))}$`, easy: `どの項も2回微分で $${a}^{2}$ 倍（$(-${a})^{2}$ も同じ）`, easyCheck: false, key: 'e' + a, verify: p => timesOK(p, 2) };
      },
      // sin・cos、1回微分（3問ずつ）
      s2(r) {
        if (r.chance(0.6)) {
          const w = r.int(1, 5), A = r.intNot(-3, 3, x => x === 0), B = r.int(-3, 3), x = sum([`${A === 1 ? '' : A === -1 ? '-' : A}${trig('sin', w, 't')}`, B === 0 ? '' : `${B === 1 ? '' : B === -1 ? '-' : B}${trig('cos', w, 't')}`]);
          return { q: `$x=${x}$ のとき $\\ddot{x}=□x$`, a: `$${-w * w}$`, easy: `sin も cos も2回微分で $-${w}^{2}$ 倍`, easyCheck: false, key: 's' + (w % 3), verify: p => timesOK(p, 2) };
        }
        const AS2 = ['-3', '-2', '-0.5', '0.2', '2', '-0.1'], a = r.pick(AS2), C = r.pick([2, 3, 5, 10]);
        return { q: `$y=${C}${ex(+a, 't')}$ のとき $y'=□y$`, a: `$${a}$`, easy: `微分すると $${a}$ がかかる`, easyCheck: false, key: 'd' + (AS2.indexOf(a) % 3), verify: p => timesOK(p, 1) };
      },
      // 見かけがちがう：どれがみたすか（ア・イ・ウ）
      s3(r) {
        const m = r.int(2, 4), plus = r.chance(0.5), k = m * m;
        const good = plus ? expPair(r.pick([1, 2, 3]), r.pick([1, -1, 2]), m, 't') : `${r.pick(['', '2', '3'])}${trig(r.pick(['sin', 'cos']), m, 't')}`;
        const bads = plus ? [ex(k, 't'), trig('sin', m, 't')] : [trig('cos', k, 't'), ex(m, 't')];
        const opts = r.shuffle([good, ...bads]), L = ['ア', 'イ', 'ウ'], ans = L[opts.indexOf(good)];
        const fOf = t => (x => ev(t, { t: x }));
        return {
          q: `$${plus ? "y''" : '\\ddot{x}'}=${plus ? '' : '-'}${k}${plus ? 'y' : 'x'}$ をみたすのは　ア $${opts[0]}$、イ $${opts[1]}$、ウ $${opts[2]}$　□`, a: ans, easyCheck: false,
          easy: `$${good}$：2回微分で $${plus ? '' : '-'}${m}^{2}=${plus ? '' : '-'}${k}$ 倍`, key: `c${plus},${m},${good}`,
          verify: p => { const ok = opts.map(o => { const f = fOf(o); return near(d2num(f, 0.3, 1e-4), (plus ? k : -k) * f(0.3), 1e-5) && near(d2num(f, 0.9, 1e-4), (plus ? k : -k) * f(0.9), 1e-5); }); return (ok.filter(Boolean).length === 1 && L[ok.indexOf(true)] === p.a) || '答えの記号がちがう'; },
        };
      },
      // わな：t がかかる（積の微分。5-19）
      trap(r) {
        const a = r.int(2, 3), y = `t${ex(a, 't')}`;
        return dest({ q: `$y=${y}$ のとき、$y''=${a * a}y$ は（成り立つ・成り立たない）　□`, a: '成り立たない',
          verify: p => { const f = t => t * Math.exp(a * t); return (near(d2num(f, 0.5, 1e-4), a * a * f(0.5), 1e-6) ? '成り立つ' : '成り立たない') === p.a || '判定がちがう'; } }, '5-90',
          `$t$ がかかっているので、項ごとに $${a * a}$ 倍にならない。積の微分で $y''=${a * a}te^{${a}t}+${2 * a}e^{${a}t}$`, ['5-19']);
      },
    },
  });

  // ================================================================ 5-97
  const LN97 = /^(?:\d*|\\frac\{\d+\}\{\d+\})(?:[xt](?:\^\{\d\})?)?\\ln\s*(?:[xt]|\(\d*[xt]\)|\([xt]\^\{\d\}\))$|^\(\d*\\ln\s*[xt][+-]\d+\)$/;
  M.add({
    id: '5-97', part: 6, chap: '5-16⑧ 例題7', stars: 1,
    title: '$\\displaystyle\\int\\ln x\\,\\dd x=x\\ln x-x+C$',
    mark: '$\\ln x$ だけの積分、$\\ln x$ と $x$ のかけ算。$\\displaystyle\\int_1^e\\ln x\\,\\dd x$、$\\displaystyle\\int x\\ln x\\,\\dd x$。',
    futsu: ['$\\ln x$ になる関数を、微分の表から', 'さがす（表にない）'],
    raku: ['$\\ln x=\\ln x\\times1$、$f=\\ln x$、$g\'=1$', '$x\\ln x-\\displaystyle\\int\\frac{1}{x}\\cdot x\\,\\dd x$', '$=x\\ln x-x+C$'],
    why: '$\\ln x$ は積分のしかたが分からないが、微分すると $\\frac{1}{x}$ と簡単になる。だから $\\ln x$ を微分する側 $f$ にして部分積分する（5-16⑧）。確かめ：$(x\\ln x-x)\'=\\ln x+1-1=\\ln x$。',
    caution: '$\\ln e=1$、$\\ln1=0$。定積分では下端の $-(1\\cdot0-1)=+1$ をわすれない。$\\displaystyle\\int\\frac{\\ln x}{x}\\,\\dd x$ は部分積分でなく置換（$u=\\ln x$）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    boxw: '30mm', boxh: '12mm',
    fits(q) { const I = integ(q); return !!I && LN97.test(I.body); },
    steps: {
      // 係数・定数つき
      s1(r) {
        const k = r.int(1, 5), m = r.chance(0.5) ? r.intNot(-3, 3, x => x === 0) : 0, v = r.pick(['x', 'x', 't']);   // 定数つきと、なしが3問ずつ
        if (k === 1 && m === 0 && v === 'x') return null;   // 楽な形の例 ∫ln x（O-2）
        const body = m === 0 ? `${k === 1 ? '' : k}\\ln ${v}` : `(${k === 1 ? '' : k}\\ln ${v}${m > 0 ? '+' : ''}${m})`;
        const a = sum([`${k === 1 ? '' : k}${v}\\ln ${v}`, (m - k) === 0 ? '' : `${m - k === 1 ? '' : m - k === -1 ? '-' : m - k}${v}`]);
        return { q: `$${INT(body, v)}$`, a: `$${a}+C$`, easy: `$${k === 1 && !m ? `${v}\\ln ${v}-${v}` : `${k === 1 ? '' : k}(${v}\\ln ${v}-${v})`}${m ? `${m > 0 ? '+' : ''}${co(m)}${v}` : ''}$`, easyCheck: false, calc: { kind: 'int', f: body, x: v }, key: (m ? 'm' : 'p') + (k % 3) };
      },
      // 定積分（教科書 例題7）
      s2(r) {
        // [x ln x − x] の 1 から b まで：[係数, 式] の和（e → 1、e^2 → e^2+1、2 → 2 ln 2 − 1、4 → 4 ln 4 − 3 = 8 ln 2 − 3）
        const k = r.int(1, 3), b = r.pick(['e', 'e^{2}', '2', '3', '4']);
        if (k === 1 && b === 'e') return null;   // 見わけようの例 ∫_1^e ln x（答えが楽な形からすぐ出る。O-2）
        const tbl = { e: [[1, '']], 'e^{2}': [[1, 'e^{2}'], [1, '']], 2: [[2, '\\ln2'], [-1, '']], 3: [[3, '\\ln3'], [-2, '']], 4: [[8, '\\ln2'], [-3, '']] };
        const body = `${k === 1 ? '' : k}\\ln x`, ans = sum(tbl[b].map(([c, t]) => (t ? co(k * c) + t : String(k * c))));
        return { q: `$${INT(body, 'x', 1, b)}$`, a: `$${ans}$`, easy: `$${k === 1 ? '' : k}\\Bigl[\\,x\\ln x-x\\,\\Bigr]_{1}^{${b}}$`, easyCheck: false, calc: { kind: 'defint', f: body, a: 1, b: b }, key: body + b };
      },
      // 見かけがちがう：ln(ax)・x ln x・ln(x^k)
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const a = r.int(2, 5), body = `\\ln(${a}x)`; return { q: `$${INT(body)}$`, a: `$x\\ln(${a}x)-x+C$`, easy: `$f=\\ln(${a}x)$（$f'=\\frac{1}{x}$）、$g'=1$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body }; }
        if (k === 1) {
          const n = r.int(1, 2), body = `x${n === 1 ? '' : `^{${n}}`}\\ln x`;
          return { q: `$${INT(body)}$`, a: `$\\frac{x^{${n + 1}}}{${n + 1}}\\ln x-\\frac{x^{${n + 1}}}{${(n + 1) * (n + 1)}}+C$`, easy: `$f=\\ln x$、$g'=x${n === 1 ? '' : `^{${n}}`}$（$g=\\frac{x^{${n + 1}}}{${n + 1}}$）`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
        }
        const n = r.int(2, 3), body = `\\ln(x^{${n}})`;
        return { q: `$${INT(body)}$`, a: `$${n}x\\ln x-${n}x+C$`, easy: `$\\ln(x^{${n}})=${n}\\ln x$`, easyCheck: false, calc: { kind: 'int', f: body }, key: body };
      },
      // わな：ln x / x（置換 u=ln x。5-76）
      trap(r) {
        const n = r.int(1, 2), body = n === 1 ? '\\frac{\\ln x}{x}' : '\\frac{(\\ln x)^{2}}{x}';
        return dest({ q: `$${INT(body)}$`, a: `$\\frac{(\\ln x)^{${n + 1}}}{${n + 1}}+C$`, calc: { kind: 'int', f: body } }, '5-97', '$\\frac{1}{x}$ が中身 $\\ln x$ の微分。部分積分でなく、$u=\\ln x$ で置換');
      },
    },
  });

  // ================================================================ 5-98
  M.add({
    id: '5-98', part: 6, chap: '5-18② 例題7', stars: 1,
    title: '$f\'\'=a^2f$ なら $Ae^{at}+Be^{-at}$（はじめの値で $A$・$B$）',
    mark: '「2回微分すると自分の□倍」で、□がプラス。$\\ddot{\\theta}=4\\theta$、$\\theta(0)=0.01$、$\\dot{\\theta}(0)=0$。',
    futsu: ['sin・cos をためして合わず、', 'ほかの形をさがす'],
    raku: ['$a^2=4$ で $a=2$：$\\theta=Ae^{2t}+Be^{-2t}$', '$A+B=0.01$、$2A-2B=0$', '$\\theta=0.005(e^{2t}+e^{-2t})$'],
    why: '$e^{at}$ も $e^{-at}$ も、2回微分すると $a^2$ 倍（$-a$ が2回かかって $(-a)^2=a^2$）。たしても $a^2$ 倍のまま（5-18②）。$t=0$ で $e^0=1$ なので、位置から $A+B$、速度から $aA-aB$ が決まる。',
    caution: '右がマイナス（$\\ddot{x}=-4x$）なら sin・cos。$a$ は2乗をはずした数。$A$・$B$ は2つの式を連立して求める（片方だけでは決まらない）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '24mm', trap: '30mm' },
    fits(q) { return /\\ddot\{(\\theta|[a-z])\}=[\d.]*\s*\\?\1(?![a-z])/.test(q) || /2回微分すると自分の\s*\$\d/.test(q); },
    steps: {
      // 位置か速度の片方が0（教科書 例題7）
      s1(r) {
        const a = r.int(1, 4), v = r.chance(0.3) ? '\\theta' : 'x', pos = r.chance(0.6), c = D(r.pick(pos ? ['0.01', '0.02', '0.2', '2', '4', '1'] : ['0.1', '0.2', '1', '2']));
        if (a === 2 && pos && dt(c) === '0.01') return null;   // 楽な形の例 θ''=4θ、θ(0)=0.01（O-2）
        const x0 = pos ? c : fr(0), v0 = pos ? fr(0) : F.mul(c, fr(2 * a)), h = pos ? F.div(c, fr(2)) : F.div(v0, fr(2 * a)), ht = dt(h) === '1' ? '' : dt(h);
        const a2 = `${ex(a, 't')}${pos ? '+' : '-'}${ex(-a, 't')}`;
        return {
          q: `$\\ddot{${v}}=${a * a === 1 ? '' : a * a}${v}$、$${v}(0)=${dt(x0)}$、$\\dot{${v}}(0)=${dt(v0)}$ をみたす $${v}$`, a: `$${v}=${ht ? `${ht}(${a2})` : a2}$`, easyCheck: false, key: `${a},${dt(x0)},${dt(v0)}`,
          easy: `$A+B=${dt(x0)}$、$${a}A-${a}B=${dt(v0)}$`.replace('$1A-1B', '$A-B'), verify: p => deOK(p.a, { order: 2, k: a * a, x0: F.val(x0), v0: F.val(v0) }),
        };
      },
      // 位置も速度も0でない
      s2(r) {
        const a = r.int(1, 3), A = D(r.pick(['0.1', '0.2', '0.3', '1', '2'])), B = D(r.pick(['0.1', '-0.1', '0.2', '-0.2', '1', '-1'])), x0 = F.add(A, B), v0 = F.mul(fr(a), F.sub(A, B));
        if (x0[0] === 0 || v0[0] === 0) return null;
        const t = (c, k) => { const s = dt(c); return `${s === '1' ? '' : s === '-1' ? '-' : s}${ex(k, 't')}`; };
        return {
          q: `$\\ddot{x}=${a * a === 1 ? '' : a * a}x$、$x(0)=${dt(x0)}$、$\\dot{x}(0)=${dt(v0)}$ をみたす $x$`, a: `$x=${sum([t(A, a), t(B, -a)])}$`, easyCheck: false, key: `${a},${dt(x0)},${dt(v0)}`,
          easy: `$A+B=${dt(x0)}$、$A-B=${dt(F.div(v0, fr(a)))}$`, verify: p => deOK(p.a, { order: 2, k: a * a, x0: F.val(x0), v0: F.val(v0) }),
        };
      },
      // 見かけがちがう：たおれる棒の t 秒後・答えの形
      s3(r) {
        if (r.chance(0.4)) {
          const a = r.int(2, 4);
          return { q: `2回微分すると自分の $${a * a}$ 倍になる関数は □ の形`, a: `$Ae^{${a}t}+Be^{-${a}t}$`, boxw: '30mm', easy: `$a^{2}=${a * a}$ で $a=${a}$`, easyCheck: false, key: 'f' + a, verify: p => deOK('y=' + strip(p.a), { order: 2, k: a * a, vars: { A: 0.7, B: 1.3 } }) };
        }
        const [a, t, E, Em] = r.pick([[2, 1, '7.389', '0.135'], [2, 2, '54.6', '0.018'], [1, 2, '7.389', '0.135'], [3, 1, '20.09', '0.0498'], [1, 3, '20.09', '0.0498']]), c = r.pick(a * t === 4 ? ['0.01'] : ['0.01', '0.02', '0.04']), h = F.div(D(c), fr(2));   // かたむきが大きくなりすぎない数（1 rad より小さい）
        const v = F.mul(h, F.add(D(E), D(Em)));
        return {
          q: `棒のかたむき $\\theta$（rad）が $\\ddot{\\theta}=${a * a === 1 ? '' : a * a}\\theta$ にしたがって大きくなる。$\\theta(0)=${c}$、$\\dot{\\theta}(0)=0$ のとき、$${t}$ 秒後の $\\theta$（$e^{${a * t}}=${E}$、$e^{-${a * t}}=${Em}$ として、小数第3位まで）`, a: `$${roundStr(v, 3)}$`, easyCheck: false, key: `b${a},${t},${c}`,
          easy: `$\\theta=${dt(h)}(${ex(a, 't')}+${ex(-a, 't')})$`, verify: p => (Math.abs(ev(strip(p.a)) - +c * Math.cosh(a * t)) < 0.001 + 0.003 * +c * Math.cosh(a * t) || '値がずれる'),
        };
      },
      // わな：右がマイナス（ゆれる。5-89）
      trap(r) {
        const w = r.int(2, 4), c = r.pick(['0.1', '0.2', '0.05']);
        return dest({ q: `$\\ddot{x}=-${w * w}x$、$x(0)=${c}$、$\\dot{x}(0)=0$ をみたす $x$`, a: `$x=${c}${trig('cos', w, 't')}$`, verify: p => deOK(p.a, { order: 2, k: -w * w, x0: +c, v0: 0 }) }, '5-98',
          `右がマイナス（自分の $-${w * w}$ 倍）なので、$e$ ではなく sin・cos`);
      },
    },
  });

  // ================================================================ 5-99
  // 関数の「大きさの対数」（t が大きいとき）：ln t → ln(ln t)、t^p → p ln t、e^{ct} → ct
  const GROW = [
    { t: '\\ln t', lg: T => Math.log(Math.log(T)) },
    { t: '\\sqrt{t}', lg: T => 0.5 * Math.log(T) },
    ...[2, 3, 5, 10].map(p => ({ t: `t^{${p}}`, lg: T => p * Math.log(T) })),
    ...[1, 0.5, 0.1].map(c => ({ t: `e^{${c === 1 ? '' : c}t}`, lg: T => c * T })),
  ];
  M.add({
    id: '5-99', part: 6, chap: '5-18⑤', stars: 1,
    title: 'ふえ方は $\\ln t\\ll t^n\\ll e^t$',
    mark: '$t$ が大きいときのくらべ方、$\\displaystyle\\lim_{t\\to\\infty}t^3e^{-t}$。',
    futsu: ['$t=10$、$100$、$1000$ … を入れて、', '値を計算してくらべる', '（$e^{100}$ は手では出せない）'],
    raku: ['$e^t$ の展開には $\\frac{t^4}{4!}$ がある', '$t$ が大きいと $t^3$ をこえる', '$\\ln t\\ll t^3\\ll e^t$'],
    why: '$e^t=1+t+\\frac{t^2}{2!}+\\cdots$ には、どんな $t^n$ より次数の高い項がふくまれるので、最後はかならず $e^t$ が勝つ（5-18⑤）。$\\ln t$ は $t$ が10倍になっても $\\ln10=2.30$ ふえるだけ。',
    caution: '$\\ll$ は $t$ が大きいときの話。$t=3$ では $t^3=27$ のほうが $e^3=20.1$ より大きい。$e^{-t}$ がかかると、$t^n$ がかかっていてもやがて0に近づく。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '12mm', s3: '16mm', trap: '14mm' },
    fits(q) { if (/\$t=\d/.test(q)) return false; return /\\lim_\{t\\to\\infty\}/.test(q) || /小さい順にならべる|をこえるのは/.test(q) || (/ふえる/.test(q) && /\\ln t|e\^\{t\}/.test(q)); },
    steps: {
      // 小さい順にならべる
      s1(r) {
        const pick = r.shuffle([GROW[0], r.pick(GROW.slice(1, 6)), r.pick(GROW.slice(6))]);
        if (r.chance(0.3)) { const extra = r.pick(GROW.slice(1, 6)); if (!pick.includes(extra)) pick.push(extra); }
        const L = r.shuffle(pick), T = 1e8, order = L.slice().sort((x, y) => x.lg(T) - y.lg(T));
        if (L.every((g, i) => g === order[i])) return null;   // はじめから小さい順にならんでいるものは出さない
        if (order.map(g => g.t).join() === '\\ln t,t^{3},e^{t}') return null;   // 楽な形の例 ln t ≪ t^3 ≪ e^t（O-2）
        return {
          q: `$t$ が大きいとき、${L.map(g => `$${g.t}$`).join('、')} を小さい順にならべると　□`, a: order.map(g => `$${g.t}$`).join('、'), easyCheck: false, key: 'o' + order.map(g => g.t).join(),
          easy: '$\\ln t\\ll t^n\\ll e^{ct}$（$t^n$ どうしは指数の大きい順）',
          verify: p => { // 別の道すじ：答えの順に、t=700 の値（e^{700} まではふつうの数で計算できる）が大きくなっていくか
            const vs = p.a.split('、').map(s => ev(strip(s), { t: 700 }));
            return (vs.length === L.length && vs.every((v, i) => v != null && isFinite(v) && (i === 0 || v > vs[i - 1]))) || 'ならべ方がちがう';
          },
        };
      },
      // t → ∞ の行き先。組は（ln と t^n）（ln と e）（t^n と e）。大きい方が分子なら ∞、分母なら 0。e^{-ct} をかけた形も（教科書 ⑤ の t^3e^{-t}）
      s2(r) {
        const kind = r.pick([0, 1, 2, 2, 2]);
        const small = kind === 2 ? r.pick(GROW.slice(1, 6)) : GROW[0], big = kind === 0 ? r.pick(GROW.slice(1, 5)) : r.pick(GROW.slice(6));
        const form = r.int(0, kind === 2 ? 2 : 1);
        const ex2 = form === 0 ? `\\frac{${big.t}}{${small.t}}` : form === 1 ? `\\frac{${small.t}}{${big.t}}` : `${small.t}${big.t.replace('e^{', 'e^{-')}`;
        return {
          q: `$\\displaystyle\\lim_{t\\to\\infty}${ex2}=□$`, a: `$${form === 0 ? '\\infty' : '0'}$`, easyCheck: false, key: form === 2 ? 'p' : (form === 0 ? 'i' : 'z') + kind, boxh: '12mm',   // 形（分子が大きい・分母が大きい・e^{-ct} をかける）と組ごとに1問
          easy: kind === 0 ? `$\\ln t$ は $${big.t}$ よりずっとゆっくりふえる` : `$${big.t}$ は $${small.t}$ よりずっと速くふえる`,
          verify: p => { // 別の道すじ：式の値を t=350 と 700 で計算して、ふえて1より大きいか、へって1より小さいか
            const v1 = ev(ex2, { t: 350 }), v2 = ev(ex2, { t: 700 }), a = strip(p.a);
            if (v1 == null || v2 == null || !isFinite(v1) || !isFinite(v2)) return `式が読めない（${ex2}）`;
            return ((v2 > v1 && v2 > 1 && a === '\\infty') || (v2 < v1 && v2 < 1 && a === '0')) || '行き先がちがう';
          },
        };
      },
      // 見かけがちがう：展開の1項でこえる t・ln t のふえ方
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.pick([1, 2, 4]);   // n=3（t^4/4! と t^3）は楽な形の例（O-2）
          return { q: `$e^{t}$ の展開にある $\\frac{t^{${n + 1}}}{${n + 1}!}$ の項だけで $t^{${n}}$ をこえるのは、$t>□$ のとき`.replace('t^{1}$ をこえる', 't$ をこえる'), a: `$${fact(n + 1)}$`, easy: `$\\frac{t^{${n + 1}}}{${fact(n + 1)}}>${n === 1 ? 't' : `t^{${n}}`}$ より $t>${fact(n + 1)}$`, easyCheck: false, key: 'n' + n, verify: p => { const T = ev(strip(p.a)); const g = t => Math.pow(t, n + 1) / fact(n + 1) - Math.pow(t, n); return (g(T * 1.01) > 0 && g(T * 0.99) < 0) || 'さかい目がちがう'; } };
        }
        // 近似の答えなので「約」と ≈（L-5）。ln10=2.30 の100倍・1000倍は、4.60・6.90 がほんとうの値を丸めた 4.61・6.91 とくいちがうので出さない（O-4・R2-6）。
        //   10倍（2.30）は左ページのわけ（why）にあるので出さない（O-2）
        const n2 = r.pick([1, 2, 3]), m = 2 ** n2, lnv = (n2 * 0.693).toFixed(3);
        return { q: `$t$ が $${m}$ 倍になると、$\\ln t$ は約 □ ふえる（$\\ln2=0.693$ として）`, a: `$${lnv}$`, easy: `$\\ln(${m}t)=\\ln t+\\ln${m}${n2 === 1 ? '' : `=\\ln t+${n2}\\ln2`}\\approx\\ln t+${lnv}$`, easyCheck: false, key: 'g' + m,
          verify: p => (strip(p.a) === (n2 * Math.LN2).toFixed(3) || 'ふえる量がちがう') };
      },
      // わな：t が小さいとき（ならべ方は t が大きいときだけ）
      trap(r) {
        const [t, n, E] = r.pick([[2, 3, '7.389'], [3, 3, '20.09'], [4, 3, '54.6'], [5, 4, '148.4'], [8, 4, '2981']]);
        const tn = Math.pow(t, n);
        return dest({ q: `$t=${t}$ で大きいのは、$t^{${n}}$ と $e^{t}$ のどちらか（$e^{${t}}=${E}$）　□`, a: `$t^{${n}}$`, verify: p => ((tn > Math.exp(t)) === (p.a === `$t^{${n}}$`) || 'くらべ方がちがう') }, '5-99',
          `$\\ll$ は $t$ が大きいときだけ。$${t}^{${n}}=${tn}$ と $${E}$ をそのままくらべる`);
      },
    },
  });
})(globalThis.MONDAI);
