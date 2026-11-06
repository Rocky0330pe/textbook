/* 問題集 第2巻　第5部 単位と文字式（わざ 2-58〜2-73、教科書 2-10〜2-14）　組 e
 * 書き方は v2/README.md・v1/README.md。文は教科書 第2巻と同じ（漢字にルビ、分かち書きなし）。式は $…$。
 * 第29回：わなは、同じ部のほかのわざで楽にならないものにする。どうしても当たるときは、楽な形に行き先
 *   （「わざ 2-61 で」）を書いて also に入れる（dest）。入れかえただけの問題には key をつける（H-6）。
 * 検算：文字式の答えは式1つにして check.js にまかせる。換算・代入・方程式・式の変形は verify で確かめる
 *   （分数 M.F で計算しなおす、解を代入する、変形した式に数を入れてもとの式が成り立つか見る）。 */
(function (M) {
  'use strict';
  const F = M.F;
  const PART = 5;

  // ---------------------------------------------------------------- 数の書き方
  // n×10^e を小数の文字に（4.2、0.035、4200）
  function dec(n, e) {
    const neg = n < 0;
    let s = String(Math.abs(n));
    if (e >= 0) s += '0'.repeat(e);
    else {
      const k = -e;
      s = s.padStart(k + 1, '0');
      s = (s.slice(0, s.length - k) + '.' + s.slice(s.length - k)).replace(/\.?0+$/, '');
    }
    return (neg ? '-' : '') + s;
  }
  // 分数 [n, d] を小数の文字に（終わらないときは null）
  function ds(x) {
    const [n, d] = x;
    for (let k = 0; k <= 9; k++) { const p = Math.pow(10, k); if (p % d === 0) return dec(n * (p / d), -k); }
    return null;
  }
  // 分数 → TeX（小数で書けるなら小数。opt.frac なら分数のまま）
  function num(x, opt) {
    if (x[1] === 1) return String(x[0]);
    if (opt && opt.frac) return F.tex(x);
    const s = ds(x);
    return s != null ? s : F.tex(x);
  }
  const fd = t => F.fromDec(String(t));
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  // 負の数はかっこをつけて書く（代入・かけ算のうしろ）
  const par = s => (String(s).startsWith('-') ? `(${s})` : String(s));
  // 「分」の読み（1・3・4・6・8・0 で終わると「ぷん」）
  const fun = n => `《分|${[1, 3, 4, 6, 8, 0].includes(n % 10) ? 'ぷん' : 'ふん'}》`;

  // ---------------------------------------------------------------- 単位
  const U = (s, p) => `\\,\\mathrm{${s}}${p && p > 1 ? `^{${p}}` : ''}`;
  // 接頭語の表（10の何乗か）。cm は 2-61 のわなで使う
  const PRE = {
    len: { km: 3, m: 0, cm: -2, mm: -3, 'μm': -6 },
    mass: { kg: 3, g: 0, mg: -3, 'μg': -6 },
    vol: { L: 0, mL: -3 },
    pow: { GW: 9, MW: 6, kW: 3, W: 0 },
    pres: { kPa: 3, Pa: 0 },
  };
  function dimOf(u) { for (const k in PRE) if (Object.prototype.hasOwnProperty.call(PRE[k], u)) return [k, PRE[k][u]]; return null; }
  const TIME = { d: 86400, h: 3600, min: 60, s: 1 };

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  const maths = q => (q.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  const onlyMath = q => { const m = /^\s*\$([^$]*)\$\s*$/.exec(q); return m ? m[1] : null; };
  // 換算の問題「$4.2\,\mathrm{km}=□\,\mathrm{m}$」を読む
  function CV(q) {
    const m = /\$(-?[\d.]+)\\,\\mathrm\{([^}]*)\}(?:\^\{(\d)\})?=□\\,\\mathrm\{([^}]*)\}(?:\^\{(\d)\})?\$/.exec(q);
    return m ? { v: m[1], u1: m[2], p1: +(m[3] || 1), u2: m[4], p2: +(m[5] || 1) } : null;
  }
  // 数だけの式（かっこは負の数だけ）を、数と記号に分ける。累乗 ^{n} もよい。読めなければ null
  function numToks(s) {
    if (s == null || /[a-zA-Z]/.test(s.replace(/\\times|\\div/g, ''))) return null;
    const t = s.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s/g, '');
    const re = /^(\(-[\d.]+\)|-?[\d.]+)(?:\^\{(\d)\})?/;
    const nums = [], ops = [];
    let i = 0;
    for (;;) {
      const m = re.exec(t.slice(i));
      if (!m) return null;
      let v = parseFloat(m[1].replace(/[()]/g, ''));
      if (m[2]) v = Math.pow(v, +m[2]);
      nums.push(v); i += m[0].length;
      if (i >= t.length) break;
      const o = t[i];
      if (!'+-*/'.includes(o)) return null;
      ops.push(o); i++;
    }
    return { nums, ops };
  }
  // 「a×c＋b×c」の形（同じ数をかけて、たす・ひく）
  function common(s) {
    const t = (s || '').replace(/\s/g, '');
    const parts = t.split(/(?<=\d)([+-])(?=\d)/);
    if (parts.length < 3) return false;
    const terms = parts.filter((_, i) => i % 2 === 0).map(x => x.split('\\times'));
    if (terms.some(x => x.length !== 2 || x.some(y => !/^[\d.]+$/.test(y)))) return false;
    // どの項にも出てくる数
    return terms[0].some(c => terms.every(x => x.includes(c)));
  }
  // 単項式の和を読む：[{c, mono}]。読めなければ null（かっこ・× があれば null）
  function sumTerms(s) {
    if (s == null || /[()\\]/.test(s.replace(/\\frac\{\d+\}\{\d+\}/g, ''))) return null;
    const t = s.replace(/\s/g, '');
    const re = /^([+-]?)((?:\d+(?:\.\d+)?)|\\frac\{\d+\}\{\d+\})?((?:[a-zA-Z](?:\^\{-?\d+\})?)*)/;
    const out = [];
    let i = 0;
    while (i < t.length) {
      const m = re.exec(t.slice(i));
      if (!m || !m[0] || (!m[2] && !m[3])) return null;
      if (i > 0 && !m[1]) return null;
      out.push({ mono: m[3] }); i += m[0].length;
    }
    return out.length ? out : null;
  }
  const hasLike = s => { const T = sumTerms(s); if (!T) return false; const L = T.filter(x => x.mono).map(x => x.mono); return new Set(L).size < L.length; };
  // 等式の問題「$A=B$ を…《解|と》く…$T=□$」：{ A, B, T }
  function eqOf(q) {
    const ms = maths(q);
    const tm = ms.map(x => /^([a-zA-Z])=□$/.exec(x)).find(Boolean);
    const e = ms.find(x => /=/.test(x) && !x.includes('□'));
    if (!tm || !e || !/解|のとき/.test(q)) return null;
    const k = e.indexOf('=');
    return { A: e.slice(0, k), B: e.slice(k + 1), T: tm[1] };
  }
  // 式をいちばん外側の ＋・－ で項に分ける（かっこ・{} の中は分けない）
  function topTerms(s) {
    const out = []; let d = 0, cur = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '(' || c === '{') d++;
      if (c === ')' || c === '}') d--;
      if (d === 0 && (c === '+' || c === '-') && cur.trim() && !/\\(times|div)\s*$/.test(cur)) { out.push(cur); cur = ''; }
      cur += c;
    }
    if (cur.trim()) out.push(cur);
    return out;
  }
  const letters = s => [...new Set((s.replace(/\\[a-zA-Z]+/g, ' ').match(/[a-zA-Z]/g) || []))];

  // ---------------------------------------------------------------- 文字式の部品（係数は分数 M.F）
  // 項は [係数, 文字の部分]。文字の部分は 'x'・'x^{2}'・'xy'・''（数の項）
  const degOf = mono => (mono.match(/[a-zA-Z](\^\{(-?\d+)\})?/g) || []).reduce((a, t) => a + (t.length > 1 ? +t.slice(3, -1) : 1), 0);
  const order = (a, b) => degOf(b[1]) - degOf(a[1]) || (a[1] === '' ? 1 : 0) - (b[1] === '' ? 1 : 0) || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
  const fc = c => (Array.isArray(c) ? c : F.make(c));
  // 同類項をまとめて、ならべる（次数の大きい順、数の項は最後）
  function collect(terms) {
    const m = new Map();
    terms.forEach(([c, mono]) => m.set(mono, F.add(m.get(mono) || [0, 1], fc(c))));
    return [...m.entries()].filter(([, c]) => c[0] !== 0).map(([mono, c]) => [c, mono]).sort(order);
  }
  // 項の列 → TeX（ならべかえない）
  function poly(terms, opt) {
    let out = '';
    for (const [c0, mono] of terms) {
      const c = fc(c0);
      if (c[0] === 0) continue;
      const neg = c[0] < 0, a = [Math.abs(c[0]), c[1]];
      const body = mono ? ((a[0] === 1 && a[1] === 1) ? mono : num(a, opt) + mono) : num(a, opt);
      out += neg ? '-' + body : (out ? '+' + body : body);
    }
    return out || '0';
  }
  const scale = (terms, k) => terms.map(([c, mono]) => [F.mul(fc(c), fc(k)), mono]);
  // 係数つきの1文字（3x、-x、x）
  const cx = (c, v) => poly([[c, v]]);
  // 文字の候補
  const VARS = ['x', 'a', 'y', 't', 'b'];

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(2).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    return p;
  }
  // 入れかえただけの問題の key（H-6）
  const ks = (tag, v) => tag + ':' + v.map(String).sort().join(',');

  // ---------------------------------------------------------------- fits（第5部の、ほかのわざの問題にも使えるか）
  function f58(q) {
    const c = CV(q);
    if (!c || c.p1 > 1 || c.p2 > 1) return false;
    const a = dimOf(c.u1), b = dimOf(c.u2);
    return !!a && !!b && a[0] === b[0] && [3, 6].includes(Math.abs(a[1] - b[1]));
  }
  function f59(q) {
    if (/としてよい/.test(q)) return false;
    if (/\d+時間\d+分/.test(q) || /□時間□分/.test(q)) return true;
    const c = CV(q);
    if (c && c.p1 === 1 && c.p2 === 1) {
      if (TIME[c.u1] && TIME[c.u2]) return true;
      const s1 = c.u1.split('/'), s2 = c.u2.split('/');
      if (s1.length === 2 && s2.length === 2 && s1[1] !== s2[1] && !(/km\/h|m\/s/.test(c.u1) && /km\/h|m\/s/.test(c.u2))) return true;
      return false;
    }
    // 速さと時間の単位がちがう（$5\,\mathrm{m/s}$ で $2\,\mathrm{min}$）
    const sp = [...q.matchAll(/\\mathrm\{[a-z]+\/([a-z]+)\}(?!\^)/g)].map(m => m[1]);
    const tm = [...q.matchAll(/\\mathrm\{(s|min|h|d)\}/g)].map(m => m[1]);
    return sp.some(b => tm.some(t => t !== b));
  }
  function f60(q) {
    const c = CV(q);
    if (c) return (c.u1 === 'km/h' && c.u2 === 'm/s') || (c.u1 === 'm/s' && c.u2 === 'km/h');
    return (/\\mathrm\{km\/h\}/.test(q) && /\\mathrm\{m\/s\}/.test(q)) || (/時速/.test(q) && /秒速/.test(q))
      || (/時速/.test(q) && /\\mathrm\{s\}/.test(q));
  }
  function f61(q) {
    // 長さから体積を出して L にする（水そう）もふくむ
    return /\\mathrm\{[a-zμ]+\}\^\{[23]\}/.test(q) || (/□\\,\\mathrm\{L\}/.test(q) && /\\mathrm\{cm\}/.test(q));
  }
  function f62(q) {
    const s = onlyMath(q.replace(/\s*＝\s*□$/, ''));
    const k = numToks(s);
    if (!k || !k.ops.some(o => o === '+' || o === '-') || !k.ops.some(o => o === '*' || o === '/')) return false;
    return !common(s);          // 同じ数をかけている所は 2-65
  }
  function f63(q) {
    const s = onlyMath(q.replace(/\s*＝\s*□$/, ''));
    if (s == null || /[+\-()]/.test(s)) return false;
    const fs = s.split(/\\times|\\div/).map(x => x.trim());
    const ops = (s.match(/\\times|\\div/g) || []);
    if (fs.length < 2) return false;
    // ÷ をかけ算になおして入れかえる（a÷b×c で c が b でわれる）
    const di = ops.indexOf('\\div');
    if (di >= 0) {
      if (ops.length !== 2 || di !== 0 || !fs.every(x => /^\d+$/.test(x))) return false;
      const [a, b, c] = fs.map(Number);
      return a % b !== 0 && c % b === 0;
    }
    const ns = fs.filter(x => /^[\d.]+$/.test(x)).map(Number);
    if (fs.some(x => !/^[\d.]+$/.test(x) && !/^[a-z]$/.test(x))) return false;
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
      const p = Math.round(ns[i] * ns[j] * 1000) / 1000;
      if ([1, 10, 100, 1000, 10000].includes(p)) return true;
      // 25×(4の倍数)・125×(8の倍数)
      for (const [x, y] of [[ns[i], ns[j]], [ns[j], ns[i]]]) if ((x === 25 && y % 4 === 0) || (x === 125 && y % 8 === 0) || (x === 250 && y % 4 === 0)) return true;
    }
    return false;
  }
  function f64(q) {
    const s = onlyMath(q.replace(/\s*＝\s*□$/, ''));
    if (s == null || /[+\-()]/.test(s)) return false;
    const fs = s.split('\\times');
    if (fs.length !== 2 || !fs.every(x => /^[\d.]+$/.test(x.trim()))) return false;
    const near = f => [[2, 0.02], [3, 0.03], [5, 0.1], [10, 0.1], [20, 2], [30, 2], [50, 2], [100, 3], [1000, 3]].some(([b, w]) => f !== b && Math.abs(f - b) <= w + 1e-9);
    return fs.map(Number).some(near);
  }
  function f65(q) { return common(onlyMath(q.replace(/\s*＝\s*□$/, ''))); }
  function f66(q) {
    const s = onlyMath(q.replace(/\s*＝\s*□$/, ''));
    return s != null && !/=/.test(s) && /[a-z]/.test(s) && hasLike(s);
  }
  // 数×(式)・(式)÷数・分数の分子が和（かっこの中に ＋－ と文字）。前がマイナスのものは 2-68
  function f67(q) {
    for (const s of maths(q)) {
      if (/=/.test(s) && !/□/.test(s)) continue;
      const re = /(^|[+=(]|\\times)\s*(\d+(?:\.\d+)?|\\frac\{1\}\{\d+\})\(([^()]*)\)/g;
      let m;
      while ((m = re.exec(s))) if (/[a-z]/.test(m[3]) && /.[+-]/.test(m[3])) return true;
      if (/\(([^()]*[a-z][^()]*[+-][^()]*|[^()]*[+-][^()]*[a-z][^()]*)\)\\(div|times)\s*\d/.test(s)) return true;
      if (/\\frac\{[^{}]*[a-z][^{}]*[+-][^{}]*\}\{\d+\}/.test(s)) return true;
    }
    return false;
  }
  function f68(q) {
    for (const s of maths(q)) {
      if (/=/.test(s) && !/□/.test(s)) continue;
      if (/-\s*(\d+(?:\.\d+)?|\\frac\{\d+\}\{\d+\})?\(([^()]*[a-z][^()]*)\)/.test(s)) return true;
      if (/\\div\s*\(-\d+\)/.test(s) && /[a-z]/.test(s)) return true;
    }
    return false;
  }
  function f69(q) {
    const s = onlyMath(q.replace(/\s*＝\s*□$/, ''));
    if (s == null || /=/.test(s)) return false;
    if (topTerms(s.replace(/^\(-/, '(')).length > 1) return false;
    if (!/\\times|\\div|\\frac/.test(s)) return false;
    const fs = s.split(/\\times|\\div|\}\{/);
    if (fs.length < 2) return false;
    const L = fs.map(f => new Set(f.replace(/\\[a-z]+/g, '').replace(/\^\{-?\d+\}/g, '').match(/[a-z]/g) || []));
    return L.some((a, i) => L.some((b, j) => j !== i && [...a].some(c => b.has(c))));
  }
  function f70(q) {
    // 式をかっこごと（$x$ に $t-3$ を代入）・単位ごと代入
    if (/代入/.test(q) && (/\\mathrm/.test(q) || /\$[a-z]\$ に \$[^$]*[a-z]/.test(q))) return true;
    if (!/のとき/.test(q)) return false;
    // 負の数・分数を代入する
    const head = q.split('のとき')[0];
    return [...head.matchAll(/([a-z])=(-?\\frac\{\d+\}\{\d+\}|-?[\d.]+)/g)].some(m => /^-|\\frac/.test(m[2]));
  }
  function f71(q) {
    if (!/とき/.test(q)) return false;
    const e = maths(q).find(x => /□/.test(x));
    if (!e) return false;
    const s = e.replace(/=□$/, '');
    if (hasLike(s)) return true;
    return /\)\s*[+-]/.test(s) && /[a-z]/.test(s) && (s.match(/\(/g) || []).length >= 2;
  }
  function f72(q) {
    const e = eqOf(q);
    if (!e) return false;
    const side = [e.A, e.B].find(x => x.includes(e.T));
    if (!side || [e.A, e.B].every(x => x.includes(e.T))) return false;
    const T = topTerms(side);
    return T.length >= 2 && T.some(t => !t.includes(e.T));
  }
  function f73(q) {
    // 「〜について解く」と、公式に数を入れてほかの文字を求める（$x=vt$ で…のとき、$t=□$）
    const e = eqOf(q);
    if (!e || !/について|のとき/.test(q)) return false;
    if (letters(e.A + e.B).length < 2) return false;
    const side = [e.A, e.B].find(x => x.includes(e.T));
    return !!side && side.trim() !== e.T;
  }

  // ---------------------------------------------------------------- 2-58
  M.add({
    id: '2-58', part: PART, chap: '2-10', stars: 1,
    title: '《接頭語|せっ|とう|ご》は1000《倍|ばい》ごと（k・m・μ）',
    mark: '《単位|たん|い》の《前|まえ》に **k・m・μ** がついている。1《段|だん》ちがうと1000《倍|ばい》。',
    futsu: ['$1\\,\\mathrm{km}=1000\\,\\mathrm{m}$、$0.1\\,\\mathrm{km}=100\\,\\mathrm{m}$', 'と、《位|くらい》ごとに《考|かんが》えて', '$4000+200=4200$'],
    raku: ['k は「1000《倍|ばい》」の《記号|き|ごう》。', '$4.2\\,\\mathrm{km}=4.2\\times1000\\,\\mathrm{m}$', '$=4200\\,\\mathrm{m}$'],
    why: 'k・m・μ は、どの《単位|たん|い》にも《同|おな》じ《意味|い|み》でつく。k→（なし）→m→μ と1《段|だん》《下|お》りるごとに1000《倍|ばい》（2-10）。',
    caution: 'cm の c は100《分|ぶん》の1。《面積|めん|せき》・《体積|たい|せき》は1000《倍|ばい》ではない（わざ 2-61）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '20mm',
    fits: f58,
    steps: {
      // 大きい単位から小さい単位へ（×1000）
      s1(r) {
        const [a, b] = r.pick([['km', 'm'], ['kg', 'g'], ['g', 'mg'], ['L', 'mL'], ['m', 'mm']]);
        const e = r.pick([0, -1, -1, -2]);
        const n = e === 0 ? r.int(2, 15) : r.intNot(1, 99, x => x % 10 === 0);
        const v = dec(n, e), ans = dec(n, e + 3);
        return { q: `$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\times1000=${ans}$`,
          verify: () => F.eq(F.mul(fd(v), [1000, 1]), fd(ans)) || 'ちがう' };
      },
      // 小さい単位から大きい単位へ（÷1000）。μ もふくむ
      s2(r) {
        const [a, b] = r.pick([['m', 'km'], ['g', 'kg'], ['mg', 'g'], ['mL', 'L'], ['mm', 'm'], ['μm', 'mm'], ['μg', 'mg']]);
        const n = r.intNot(1, 99, x => x % 10 === 0) * Math.pow(10, r.int(0, 2));
        const ans = dec(n, -3);
        return { q: `$${n}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${n}\\div1000=${ans}$`,
          verify: () => F.eq(F.div(F.make(n), [1000, 1]), fd(ans)) || 'ちがう' };
      },
      // 2段とぶ・M と G・ことばの問題
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [a, b] = r.pick([['km', 'mm'], ['kg', 'mg'], ['g', 'μg'], ['m', 'μm']]);
          const n = r.int(2, 9), e = r.pick([-3, -2]);
          const v = dec(n, e), ans = dec(n, e + 6);
          return { q: `$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\times1000\\times1000=${ans}$`,
            verify: () => F.eq(F.mul(fd(v), [1000000, 1]), fd(ans)) || 'ちがう' };
        }
        if (k === 1) {
          const [a, b, big] = r.pick([['MW', 'kW', 1], ['GW', 'MW', 1], ['kW', 'MW', 0], ['kPa', 'Pa', 1]]);
          const n = r.intNot(11, 99, x => x % 10 === 0);
          if (a === 'kPa') {
            const v = 10 * r.int(18, 28);
            return { q: `タイヤの《空気|くう|き》がおす《強|つよ》さ $${v}${U(a)}=□${U(b)}$`, a: `$${v * 1000}$`, easy: `$${v}\\times1000=${v * 1000}$` };
          }
          if (big) {
            const v = dec(n, -1), ans = dec(n, 2);
            const what = a === 'GW' ? '《発電所|はつ|でん|しょ》の《電力|でん|りょく》' : '《風車|ふう|しゃ》1つの《電力|でん|りょく》';
            return { q: `${what} $${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\times1000=${ans}$`,
              verify: () => F.eq(F.mul(fd(v), [1000, 1]), fd(ans)) || 'ちがう' };
          }
          const v = n * 100, ans = dec(n, -1);
          return { q: `《工場|こう|じょう》の《電力|でん|りょく》 $${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\div1000=${ans}$`,
            verify: () => F.eq(F.div(F.make(v), [1000, 1]), fd(ans)) || 'ちがう' };
        }
        if (k === 2) {
          const n = r.int(50, 120), ans = dec(n, -3);
          return { q: `かみの《毛|け》の《太|ふと》さ $${n}${U('μm')}=□${U('mm')}$`, a: `$${ans}$`, easy: `$${n}\\div1000=${ans}$`,
            verify: () => F.eq(F.div(F.make(n), [1000, 1]), fd(ans)) || 'ちがう' };
        }
        const n = r.int(1, 9), e = r.pick([-1, -2]), v = dec(n, e), ans = dec(n, e + 3);
        return { q: `《薬|くすり》の《量|りょう》 $${v}${U('mg')}=□${U('μg')}$`, a: `$${ans}$`, easy: `$${v}\\times1000=${ans}$`,
          verify: () => F.eq(F.mul(fd(v), [1000, 1]), fd(ans)) || 'ちがう' };
      },
      // わな：c は100倍（cm）・面積は2乗（2-61）
      trap(r) {
        if (r.chance(0.5)) {
          const [a, b, f] = r.pick([['m', 'cm', 100], ['cm', 'mm', 10]]);
          const n = r.intNot(11, 99, x => x % 10 === 0), v = dec(n, -1), ans = dec(n * f, -1);
          return { q: `$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`,
            easy: `（${b === 'cm' ? 'c は100《分|ぶん》の1' : 'cm と mm は10《倍|ばい》'}。1000《倍|ばい》ではない：$${v}\\times${f}=${ans}$）` };
        }
        const [a, b, f] = r.pick([['km', 'm', 1000000], ['m', 'cm', 10000]]);
        const n = r.int(2, 9);
        return dest({ q: `$${n}${U(a, 2)}=□${U(b, 2)}$`, a: `$${n * f}$` }, '2-58', '2《乗|じょう》なので、1000《倍|ばい》ではない');
      },
    },
  });

  // ---------------------------------------------------------------- 2-59
  M.add({
    id: '2-59', part: PART, chap: '2-10', stars: 1,
    title: '《換算|かん|さん》は「《単位|たん|い》つきの1」をかける',
    mark: '《時間|じ|かん》（d・h・min・s）などの《単位|たん|い》を **かえる**。いくつもの《単位|たん|い》をつなぐ。',
    futsu: ['2《日|にち》は《何|なん》《分|ぷん》？　1《日|にち》は24《時間|じ|かん》、', '1《時間|じ|かん》は60《分|ぷん》だから…と、', 'ことばでたどる。'],
    raku: ['《消|け》したい《単位|たん|い》が《分母|ぶん|ぼ》にくる1をかける。', '$2\\,\\mathrm{d}\\times24\\,\\mathrm{h/d}\\times60\\,\\mathrm{min/h}$', '$=2\\times24\\times60\\,\\mathrm{min}=2880\\,\\mathrm{min}$'],
    why: '$60\\,\\mathrm{s/min}$ などは《単位|たん|い》つきの1なので、かけても《量|りょう》は《変|か》わらない。《単位|たん|い》が《約分|やく|ぶん》されて《消|き》える（2-10）。',
    caution: '《時間|じ|かん》は60ずつ。1《時間|じ|かん》30《分|ぷん》は1.3《時間|じ|かん》ではない（$30\\div60=0.5$）。',
    counts: { s1: 8, s2: 7, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '13mm', s3: '18mm', trap: '34mm' },
    fits: f59,
    steps: {
      // 大きい単位から小さい単位へ（かけていく）
      s1(r) {
        const [a, b] = r.pick([['h', 'min'], ['min', 's'], ['h', 's'], ['d', 'h'], ['d', 'min']]);
        const v = r.pick(['1', '2', '3', '4', '5', '6', '8', '1.5', '2.5', '0.5', '0.25', '0.75']);
        if (a === 'd' && b === 'min' && /\./.test(v)) return null;
        const chain = { h: { min: [60], s: [60, 60] }, min: { s: [60] }, d: { h: [24], min: [24, 60] } }[a][b];
        const ans = num(chain.reduce((x, f) => F.mul(x, [f, 1]), fd(v)));
        return { q: `$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\times${chain.join('\\times')}=${ans}$`,
          verify: () => F.eq(F.mul(fd(v), [TIME[a], 1]), F.mul(fd(ans), [TIME[b], 1])) || 'ちがう' };
      },
      // 小さい単位から大きい単位へ（わる）・「□時間□分」
      s2(r) {
        const k = r.int(0, 3);
        if (k <= 1) {
          const [a, b] = r.pick([['min', 'h'], ['s', 'min'], ['s', 'h'], ['h', 'd']]);
          const ans = r.pick(['1', '2', '3', '5', '1.5', '2.5', '0.5', '0.25', '0.75', '1.25']);
          const chain = { min: { h: [60] }, s: { min: [60], h: [60, 60] }, h: { d: [24] } }[a][b];
          const v = num(chain.reduce((x, f) => F.mul(x, [f, 1]), fd(ans)));
          if (/\./.test(v)) return null;
          return { q: `$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\div${chain.join('\\div')}=${ans}$`,
            verify: () => F.eq(F.mul(fd(v), [TIME[a], 1]), F.mul(fd(ans), [TIME[b], 1])) || 'ちがう' };
        }
        const h = r.int(1, 3), m = r.pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]);
        const v = num(F.add(F.make(h), F.make(m, 60)));
        if (k === 2) {
          return { q: `${h}《時間|じ|かん》${m}${fun(m)} ＝ □《時間|じ|かん》`, a: `$${v}$`, easy: `$${h}+${m}\\div60=${v}$`,
            verify: () => F.eq(fd(v), F.add(F.make(h), F.make(m, 60))) || 'ちがう' };
        }
        return { q: `$${v}${U('h')}$ ＝ □《時間|じ|かん》□《分|ふん》`, a: `${h}《時間|じ|かん》${m}${fun(m)}`, easy: `$${num(F.sub(fd(v), F.make(h)))}\\times60=${m}$`, easyCheck: false,
          verify: () => F.eq(fd(v), F.add(F.make(h), F.make(m, 60))) || 'ちがう' };
      },
      // 速さと時間の単位がちがう・単位も計算できる・長い換算
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [who, lo, hi] = r.pick([['《走|はし》る《人|ひと》', 3, 6], ['《自転車|じ|てん|しゃ》', 4, 8], ['《歩|ある》く《人|ひと》', 1, 2]]);
          const v = r.int(lo, hi), t = r.int(2, 10);
          return { q: `${who}が $${v}${U('m/s')}$ で $${t}${U('min')}$ 《進|すす》む《道|みち》のり ＝ $□${U('m')}$`, a: `$${v * t * 60}$`, easy: `$${v}\\times(${t}\\times60)=${v * t * 60}$`,
            verify: () => v * t * 60 === v * (t * 60) || 'ちがう' };
        }
        if (k === 1) {
          const v = r.pick([30, 36, 40, 45, 48, 54, 60, 72, 80, 90]), t = r.pick([10, 15, 20, 30, 40, 45]);
          if ((v * t) % 60) return null;
          return { q: `《車|くるま》が $${v}${U('km/h')}$ で $${t}${U('min')}$ 《進|すす》む《道|みち》のり ＝ $□${U('km')}$`, a: `$${v * t / 60}$`, easy: `$${v}\\times${t}\\div60=${v * t / 60}$`,
            verify: () => F.eq(F.make(v * t, 60), F.make(v * t / 60)) || 'ちがう' };
        }
        if (k === 2) {
          const t = r.int(2, 10), ans = F.make(r.int(1, 8), 2), vF = F.mul(ans, F.make(t));
          if (F.val(vF) < 4 || F.val(vF) > 30) return null;
          const vS = num(vF);
          return { q: `《止|と》まっていた《車|くるま》が、$${t}${U('s')}$ で $${vS}${U('m/s')}$ になった。1《秒|びょう》ごとにふえた《速|はや》さ ＝ $□${U('m/s')}^{2}$`,
            a: `$${num(ans)}$`, easy: `$${vS}\\div${t}=${num(ans)}$（$\\mathrm{m/s}\\div\\mathrm{s}=\\mathrm{m/s}^{2}$）`,
            verify: () => F.eq(F.mul(ans, F.make(t)), fd(vS)) || 'ちがう' };
        }
        const [v, a, b, chain] = r.pick([[1, 'd', 's', [24, 60, 60]], [2, 'd', 's', [24, 60, 60]], [3, 'h', 's', [60, 60]], [5, 'h', 's', [60, 60]], [7, 'd', 'min', [24, 60]], [3, 'd', 'min', [24, 60]], [10, 'd', 'h', [24]], [365, 'd', 'h', [24]]]);
        const ans = chain.reduce((x, f) => x * f, v);
        const what = v === 365 ? '1《年|ねん》は ' : v === 7 ? '1《週間|しゅう|かん》は ' : '';
        return { q: `${what}$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `$${v}\\times${chain.join('\\times')}=${ans}$`,
          verify: () => v * TIME[a] === ans * TIME[b] || 'ちがう' };
      },
      // わな：上下さかさまの1（単位が消えない）・時間を100ずつと考える
      trap(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.int(2, 9);
          return { q: `$${n}${U('min')}$ を《秒|びょう》にするのに、$${n}${U('min')}\\times\\frac{1${U('min')}}{60${U('s')}}$ としてよい？　□`,
            a: `いいえ（$${n * 60}${U('s')}$）`, easy: `（《向|む》きが《反対|はん|たい》で、min が《消|き》えない。$\\frac{60${U('s')}}{1${U('min')}}$ をかける）`, easyCheck: false,
            verify: () => n * TIME.min === n * 60 * TIME.s || 'ちがう' };
        }
        if (k === 1) {
          const n = r.int(2, 9);
          return { q: `$${n}${U('km')}$ を m にするのに、$${n}${U('km')}\\times\\frac{1${U('km')}}{1000${U('m')}}$ としてよい？　□`,
            a: `いいえ（$${n * 1000}${U('m')}$）`, easy: `（《向|む》きが《反対|はん|たい》で、km が《消|き》えない。$\\frac{1000${U('m')}}{1${U('km')}}$ をかける）`, easyCheck: false,
            verify: () => true };
        }
        const m = r.pick([12, 15, 24, 30, 36, 45, 48]), h = r.int(1, 2);
        const wrong = dec(h * 100 + m, -2), right = num(F.add(F.make(h), F.make(m, 60)));
        return { q: `${h}《時間|じ|かん》${m}${fun(m)}を、${wrong}《時間|じ|かん》としてよい？　□`,
          a: `いいえ（${right}《時間|じ|かん》）`, easy: `（《時間|じ|かん》は60ずつ。$${m}\\div60=${num(F.make(m, 60))}$）`, easyCheck: false,
          verify: () => F.eq(fd(right), F.add(F.make(h), F.make(m, 60))) && wrong !== right || 'ちがう' };
      },
    },
  });

  // ---------------------------------------------------------------- 2-60
  const KMH = F.make(18, 5);   // 1 m/s ＝ 3.6 km/h
  M.add({
    id: '2-60', part: PART, chap: '2-10', stars: 1,
    title: '《時速|じ|そく》→《秒速|びょう|そく》は÷3.6、《秒速|びょう|そく》→《時速|じ|そく》は×3.6',
    mark: '**km/h** と **m/s** を《直|なお》す（《時速|じ|そく》と《秒速|びょう|そく》）。',
    futsu: ['km を m に、h を s に《直|なお》す。', '$72\\times1000\\div3600$', '$=72000\\div3600=20$'],
    raku: ['$\\times1000\\div3600$ は $\\div3.6$ と《同|おな》じ。', '$72\\div3.6=20$', '→ $20\\,\\mathrm{m/s}$'],
    why: '3600は1000の3.6《倍|ばい》。《秒速|びょう|そく》の《数|かず》は《時速|じ|そく》の《数|かず》より《小|ちい》さくなる（2-10）。',
    caution: '《分速|ふん|そく》（m/min・km/min）にするときは3.6ではない（わざ 2-59）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '18mm',
    fits: f60,
    steps: {
      s1(r) {
        const w = r.chance(0.75) ? F.make(5 * r.int(1, 16)) : F.make(5 * (2 * r.int(0, 4) + 1), 2);
        const kmh = num(F.mul(w, KMH)), ms = num(w);
        return { q: `$${kmh}${U('km/h')}=□${U('m/s')}$`, a: `$${ms}$`, easy: `$${kmh}\\div3.6=${ms}$`,
          verify: () => F.eq(F.div(fd(kmh), KMH), fd(ms)) || 'ちがう' };
      },
      s2(r) {
        const w = r.chance(0.8) ? F.make(r.int(2, 40)) : F.make(2 * r.int(1, 9) + 1, 2);
        const kmh = num(F.mul(w, KMH)), ms = num(w);
        return { q: `$${ms}${U('m/s')}=□${U('km/h')}$`, a: `$${kmh}$`, easy: `$${ms}\\times3.6=${kmh}$`,
          verify: () => F.eq(F.mul(fd(ms), KMH), fd(kmh)) || 'ちがう' };
      },
      // 乗り物・何倍・道のり・どちらが速い
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [who, list] = r.pick([['《新幹線|しん|かん|せん》', [216, 252, 270, 288, 306, 324]], ['《電車|でん|しゃ》', [54, 72, 90, 108, 126]], ['《台風|たい|ふう》の《風|かぜ》', [108, 126, 144, 162, 180]], ['《車|くるま》', [36, 45, 54, 63, 81]]]);
          const kmh = r.pick(list), ms = num(F.div(F.make(kmh), KMH));
          return { q: `${who}の《速|はや》さ $${kmh}${U('km/h')}=□${U('m/s')}$`, a: `$${ms}$`, easy: `$${kmh}\\div3.6=${ms}$`,
            verify: () => F.eq(F.mul(fd(ms), KMH), F.make(kmh)) || 'ちがう' };
        }
        if (k === 1) {
          const slow = r.int(2, 6), times = r.int(2, 6), fastMs = slow * times;
          if (fastMs % 5) return null;
          const kmh = num(F.mul(F.make(fastMs), KMH));
          const [a, b] = r.pick([['《自転車|じ|てん|しゃ》', '《歩|ある》く《人|ひと》'], ['《車|くるま》', '《自転車|じ|てん|しゃ》'], ['《電車|でん|しゃ》', '《走|はし》る《人|ひと》']]);
          return { q: `《時速|じ|そく》 $${kmh}${U('km')}$ の${a}の《速|はや》さは、《秒速|びょう|そく》 $${slow}${U('m')}$ の${b}の □《倍|ばい》`,
            a: `$${times}$`, easy: `$${kmh}\\div3.6\\div${slow}=${times}$`, verify: () => F.eq(F.div(F.div(fd(kmh), KMH), F.make(slow)), F.make(times)) || 'ちがう' };
        }
        if (k === 2) {
          const ms = 5 * r.int(2, 6), t = r.int(3, 12), kmh = num(F.mul(F.make(ms), KMH));
          return { q: `《時速|じ|そく》 $${kmh}${U('km')}$ で $${t}${U('s')}$ 《進|すす》む《道|みち》のり ＝ $□${U('m')}$`, a: `$${ms * t}$`, easy: `$${kmh}\\div3.6\\times${t}=${ms * t}$`,
            verify: () => F.eq(F.mul(F.div(fd(kmh), KMH), F.make(t)), F.make(ms * t)) || 'ちがう' };
        }
        const msA = 5 * r.int(3, 8), d = r.pick([-3, -2, 2, 3]), msB = msA + d, kmh = num(F.mul(F.make(msA), KMH));
        const ans = msA > msB ? 'A' : 'B';
        return { q: `《時速|じ|そく》 $${kmh}${U('km')}$ の《車|くるま》Aと、《秒速|びょう|そく》 $${msB}${U('m')}$ の《車|くるま》B。《速|はや》いのは □`,
          a: ans, easy: `$${kmh}\\div3.6=${msA}$ で、$${msA}${msA > msB ? '>' : '<'}${msB}$`, easyCheck: false,
          verify: () => (F.val(F.div(fd(kmh), KMH)) > msB ? 'A' : 'B') === ans || 'ちがう' };
      },
      // わな：分速にする（÷60。2-59）
      trap(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const kmh = 6 * r.int(5, 20), ans = dec(kmh / 6, -1);
          return dest({ q: `$${kmh}${U('km/h')}=□${U('km/min')}$`, a: `$${ans}$` }, '2-60', `《分速|ふん|そく》は÷3.6ではない：$${kmh}\\div60=${ans}$`);
        }
        if (k === 1) {
          const kmh = 3 * r.int(10, 40), ans = kmh * 1000 / 60;
          return dest({ q: `$${kmh}${U('km/h')}=□${U('m/min')}$`, a: `$${ans}$` }, '2-60', `《分速|ふん|そく》は÷3.6ではない：$${kmh}\\times1000\\div60=${ans}$`);
        }
        const ms = r.int(2, 9);
        return dest({ q: `$${ms}${U('m/s')}=□${U('m/min')}$`, a: `$${ms * 60}$` }, '2-60', `《分速|ふん|そく》は×3.6ではない：$${ms}\\times60=${ms * 60}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-61
  M.add({
    id: '2-61', part: PART, chap: '2-10・2-7', stars: 1,
    title: '《面積|めん|せき》は2《乗|じょう》、《体積|たい|せき》は3《乗|じょう》で《換算|かん|さん》',
    mark: '**m²・cm²・m³・cm³・L** の《換算|かん|さん》。《長|なが》さの《単位|たん|い》に2・3がついている。',
    futsu: ['1《辺|ぺん》 $1\\,\\mathrm{m}$ の《正方形|せい|ほう|けい》を、', '1《辺|ぺん》 $1\\,\\mathrm{cm}$ のマスに《分|わ》けて', '《数|かぞ》える。'],
    raku: ['《長|なが》さが100《倍|ばい》 → 《面積|めん|せき》は $100\\times100$ 《倍|ばい》', '$3\\,\\mathrm{m}^{2}=3\\times100\\times100\\,\\mathrm{cm}^{2}$', '$=30000\\,\\mathrm{cm}^{2}$'],
    why: '$\\mathrm{m}^{2}$ は $\\mathrm{m}\\times\\mathrm{m}$ なので、$100\\,\\mathrm{cm/m}$ を2《回|かい》かける。《体積|たい|せき》は3《回|かい》（2-10）。',
    caution: '$1\\,\\mathrm{L}=1000\\,\\mathrm{cm}^{3}$、$1\\,\\mathrm{mL}=1\\,\\mathrm{cm}^{3}$ を《使|つか》う。《長|なが》さだけなら2《乗|じょう》しない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '20mm', s3: '20mm', trap: '18mm' },
    fits: f61,
    steps: {
      s1(r) {
        const [a, b, L, p] = r.pick([['m', 'cm', 100, 2], ['cm', 'mm', 10, 2], ['km', 'm', 1000, 2], ['m', 'cm', 100, 3], ['cm', 'mm', 10, 3]]);
        const v = r.pick(['2', '3', '4', '5', '6', '7', '8', '0.5', '1.5', '2.5', '0.3']);
        if (L === 1000 && /\./.test(v) && v !== '0.5' && v !== '1.5') return null;
        const f = Math.pow(L, p), ans = num(F.mul(fd(v), F.make(f)));
        return { q: `$${v}${U(a, p)}=□${U(b, p)}$`, a: `$${ans}$`, easy: `$${v}${`\\times${L}`.repeat(p)}=${ans}$`,
          verify: () => F.eq(F.mul(fd(v), F.make(f)), fd(ans)) || 'ちがう' };
      },
      // 小さい単位から大きい単位へ・L と cm³
      s2(r) {
        const k = r.int(0, 4);
        if (k <= 1) {
          const [a, b, L] = r.pick([['cm', 'm', 100], ['mm', 'cm', 10]]);
          const ans = r.pick(['2', '3', '5', '0.5', '1.5', '2.5', '0.4', '1.2', '0.25']);
          const v = num(F.mul(fd(ans), F.make(L * L)));
          if (/\./.test(v)) return null;
          return { q: `$${v}${U(a, 2)}=□${U(b, 2)}$`, a: `$${ans}$`, easy: `$${v}\\div(${L}\\times${L})=${ans}$`,
            verify: () => F.eq(F.div(fd(v), F.make(L * L)), fd(ans)) || 'ちがう' };
        }
        if (k === 2) {
          const v = r.pick(['2', '3', '0.5', '1.5', '0.2', '2.5', '0.75']), ans = num(F.mul(fd(v), F.make(1000)));
          return { q: `$${v}${U('L')}=□${U('cm', 3)}$`, a: `$${ans}$`, easy: `$${v}\\times1000=${ans}$`,
            verify: () => F.eq(F.mul(fd(v), F.make(1000)), fd(ans)) || 'ちがう' };
        }
        if (k === 3) {
          const v = r.pick([200, 250, 500, 750, 1500, 2000, 3500]), ans = dec(v, -3);
          return { q: `$${v}${U('cm', 3)}=□${U('L')}$`, a: `$${ans}$`, easy: `$${v}\\div1000=${ans}$`,
            verify: () => F.eq(F.div(F.make(v), F.make(1000)), fd(ans)) || 'ちがう' };
        }
        const v = r.pick(['1', '2', '3', '0.5', '0.2', '1.5']), ans = num(F.mul(fd(v), F.make(1000)));
        return { q: `$${v}${U('m', 3)}=□${U('L')}$`, a: `$${ans}$`, easy: `$${v}\\times100\\times100\\times100\\div1000=${ans}$`,
          verify: () => F.eq(F.div(F.mul(fd(v), F.make(1000000)), F.make(1000)), fd(ans)) || 'ちがう' };
      },
      // 長方形・入れ物・タイル
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(2, 6), b = r.int(2, 9);
          if (a === b) return null;
          return { q: `たて $${a}${U('m')}$、《横|よこ》 $${b}${U('m')}$ の《長方形|ちょう|ほう|けい》の《面積|めん|せき》 ＝ $□${U('cm', 2)}$`, a: `$${a * b * 10000}$`, easy: `$${a * 100}\\times${b * 100}=${a * b * 10000}$`, key: ks('61r', [a, b]) };
        }
        if (k === 1) {
          if (r.chance(0.5)) {
            const s = r.pick([10, 20, 30, 40, 50]);
            return { q: `1《辺|ぺん》 $${s}${U('cm')}$ の《立方体|りっ|ぽう|たい》の《入|い》れ《物|もの》に《入|はい》る《水|みず》 ＝ $□${U('L')}$`, a: `$${s * s * s / 1000}$`, easy: `$${s}\\times${s}\\times${s}\\div1000=${s * s * s / 1000}$` };
          }
          const [a, b, c] = r.pick([[20, 25, 40], [10, 20, 30], [20, 30, 50], [40, 25, 30], [10, 50, 40], [20, 20, 25]]);
          return { q: `たて $${a}${U('cm')}$、《横|よこ》 $${b}${U('cm')}$、《高|たか》さ $${c}${U('cm')}$ の《水|すい》そうに《入|はい》る《水|みず》 ＝ $□${U('L')}$`, a: `$${a * b * c / 1000}$`, easy: `$${a}\\times${b}\\times${c}\\div1000=${a * b * c / 1000}$` };
        }
        const m2 = r.int(1, 4), s = r.pick([10, 20, 25, 50]), n = m2 * 10000 / (s * s);
        return { q: `$${m2}${U('m', 2)}$ のゆかに、1《辺|ぺん》 $${s}${U('cm')}$ の《正方形|せい|ほう|けい》のタイルをしきつめる。タイルは □まい`, a: `$${n}$`, easy: `$${m2}\\times100\\times100\\div(${s}\\times${s})=${n}$` };
      },
      // わな：長さだけ（2乗しない）
      trap(r) {
        const [a, b, f] = r.pick([['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'cm', 100]]);
        const v = r.pick(['3', '4', '6', '1.5', '2.5', '0.8', '1.2', '7']), ans = num(F.mul(fd(v), F.make(f)));
        return { q: `$${v}${U(a)}=□${U(b)}$`, a: `$${ans}$`, easy: `（《長|なが》さは2《乗|じょう》しない：$${v}\\times${f}=${ans}$）` };
      },
    },
  });

  // ---------------------------------------------------------------- 2-62
  // 式と、その値（整数）
  // うしろに文字が来ても TeX の命令がつながらないように、空白をつける（\times x）
  const T_ = '\\times ', D_ = '\\div ';
  M.add({
    id: '2-62', part: PART, chap: '2-11', stars: 1,
    title: '×÷のまとまりで《区切|く|ぎ》ってから《計算|けい|さん》',
    mark: '＋－と **×÷** がまざった1《行|ぎょう》の《式|しき》。',
    futsu: ['どこから《計算|けい|さん》するか、', '1つずつ《考|かんが》えながら、', '《左|ひだり》から《進|すす》む。'],
    raku: ['＋－で《区切|く|ぎ》ると、×÷の《所|ところ》がまとまり。', '$12-8\\div4\\times2$', '$=12-(8\\div4\\times2)$', '$=12-4=8$'],
    why: '×÷でできた《部分|ぶ|ぶん》は、《代金|だい|きん》や《面積|めん|せき》のような1つの《量|りょう》なので、《先|さき》に《計算|けい|さん》する（2-11）。',
    caution: 'かっこがあれば、かっこの《中|なか》が《先|さき》。×÷だけの《所|ところ》は《左|ひだり》から。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm',
    fits: f62,
    steps: {
      s1(r) {
        const k = r.int(0, 4), a = r.int(2, 20), b = r.int(2, 9), c = r.int(2, 9);
        if (k === 0) return { q: `$${a}+${b}${T_}${c}$`, a: `$${a + b * c}$`, easy: `$${a}+${b * c}=${a + b * c}$` };
        if (k === 1) { if (a <= b * c) return null; return { q: `$${a}-${b}${T_}${c}$`, a: `$${a - b * c}$`, easy: `$${a}-${b * c}=${a - b * c}$` }; }
        if (k === 2) return { q: `$${b}${T_}${c}+${a}$`, a: `$${b * c + a}$`, easy: `$${b * c}+${a}=${b * c + a}$` };
        const bc = b * c;
        if (k === 3) return { q: `$${a}+${bc}${D_}${c}$`, a: `$${a + b}$`, easy: `$${a}+${b}=${a + b}$` };
        if (a <= b) return null;
        return { q: `$${a}-${bc}${D_}${c}$`, a: `$${a - b}$`, easy: `$${a}-${b}=${a - b}$` };
      },
      // ×÷のまとまりが2つ、×÷が続く
      s2(r) {
        const k = r.int(0, 2), a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9);
        if (k === 0) {
          const op = r.chance(0.6) ? '+' : '-';
          const v = op === '+' ? a * b + c * d : a * b - c * d;
          if (v < 0 || [a, b].some(x => x === c || x === d)) return null;   // 同じ数をかけている形は 2-65
          return { q: `$${a}${T_}${b}${op}${c}${T_}${d}$`, a: `$${v}$`, easy: `$${a * b}${op}${c * d}=${v}$` };
        }
        if (k === 1) {
          const e = r.int(10, 50), v = e - b * d;   // e－(b×c)÷c×d
          if (v < 0) return null;
          return { q: `$${e}-${b * c}${D_}${c}${T_}${d}$`, a: `$${v}$`, easy: `$${e}-${b * d}=${v}$` };
        }
        const e = r.int(2, 30);
        return { q: `$${e}+${a}${T_}${b}-${c * d}${D_}${d}$`, a: `$${e + a * b - c}$`, easy: `$${e}+${a * b}-${c}=${e + a * b - c}$` };
      },
      // 累乗・負の数・ことばの問題
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const a = r.int(2, 5), b = r.int(2, 4), c = r.int(1, 20);
          if (r.chance(0.5)) return { q: `$${a}${T_}${b}^{2}+${c}$`, a: `$${a * b * b + c}$`, easy: `$${a}${T_}${b * b}+${c}=${a * b * b + c}$` };
          const e = r.int(a * b * b + 1, 60);
          return { q: `$${e}-${b}^{2}${T_}${a}$`, a: `$${e - a * b * b}$`, easy: `$${e}-${b * b}${T_}${a}=${e - a * b * b}$` };
        }
        if (k === 1) {
          const a = r.int(1, 9), b = r.int(2, 6), c = r.int(2, 6);
          if (r.chance(0.5)) return { q: `$-${a}+${b}${T_}(-${c})$`, a: `$${-a - b * c}$`, easy: `$-${a}+(-${b * c})=${-a - b * c}$` };
          return { q: `$(-${b * c})${D_}${c}-${a}$`, a: `$${-b - a}$`, easy: `$(-${b})-${a}=${-b - a}$` };
        }
        if (k === 2) {
          const p = r.pick([80, 90, 110, 120, 130, 150]), n = r.int(2, 5), q = r.pick([60, 70, 80, 100, 120]);
          if (p === q) return null;
          return { q: `1こ ${p}《円|えん》のパンを ${n}こと、${q}《円|えん》の《牛乳|ぎゅう|にゅう》を1《本|ぽん》《買|か》った。《代金|だい|きん》は □《円|えん》`, a: `$${p * n + q}$`, easy: `$${p}${T_}${n}+${q}=${p * n + q}$` };
        }
        const v1 = r.int(3, 6), t1 = r.pick([40, 50, 60, 80]), v2 = r.int(1, 2), t2 = r.pick([100, 120, 150, 200]);
        return { q: `$${v1}${U('m/s')}$ で $${t1}${U('s')}$ 《走|はし》り、$${v2}${U('m/s')}$ で $${t2}${U('s')}$ 《歩|ある》いた。《全部|ぜん|ぶ》で $□${U('m')}$`, a: `$${v1 * t1 + v2 * t2}$`, easy: `$${v1}${T_}${t1}+${v2}${T_}${t2}=${v1 * t1 + v2 * t2}$` };
      },
      // わな：かっこが先
      trap(r) {
        const k = r.int(0, 2), a = r.int(3, 15), b = r.int(2, 15), c = r.int(2, 9);
        if (k === 0) {
          const s = c * r.int(2, 9), x = r.int(1, s - 1);
          return { q: `$(${x}+${s - x})${D_}${c}$`, a: `$${s / c}$`, easy: `（かっこの《中|なか》が《先|さき》：$${s}${D_}${c}=${s / c}$）` };
        }
        if (k === 1) { if (a <= b) return null; return { q: `$(${a}-${b})${T_}${c}$`, a: `$${(a - b) * c}$`, easy: `（かっこの《中|なか》が《先|さき》：$${a - b}${T_}${c}=${(a - b) * c}$）` }; }
        if (a + b === 100) return null;
        return { q: `$${c}${T_}(${a}+${b})$`, a: `$${c * (a + b)}$`, easy: `（かっこの《中|なか》が《先|さき》：$${c}${T_}${a + b}=${c * (a + b)}$）` };
      },
    },
  });

  // ---------------------------------------------------------------- 2-63
  const PAIRS = [[2, 5], [4, 25], [8, 125], [20, 5], [2, 50], [4, 250]];
  M.add({
    id: '2-63', part: PART, chap: '2-11', stars: 1,
    title: '《入|い》れかえ・《組|く》みかえて10・100を《作|つく》る',
    mark: 'かけて **10・100・1000** になる《組|くみ》（2と5、4と25、8と125）がある。',
    futsu: ['$25\\times7=175$、', '$175\\times4=700$ と、', '《左|ひだり》から《計算|けい|さん》する。'],
    raku: ['25と4で100を《作|つく》る。', '$25\\times7\\times4=25\\times4\\times7$', '$=100\\times7=700$'],
    why: 'かけ《算|ざん》だけの《式|しき》は、《入|い》れかえても《組|く》みかえても《答|こた》えは《同|おな》じ（2-11）。',
    caution: '＋－がまざっているときは、×でつながった《所|ところ》の《中|なか》だけで《入|い》れかえる。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '20mm', trap: '16mm' },
    fits: f63,
    steps: {
      s1(r) {
        let [p, q] = r.pick(PAIRS);
        if (r.chance(0.5)) [p, q] = [q, p];
        const m = r.intNot(3, 19, x => x % 5 === 0 || x % 2 === 0 || x === p || x === q);
        const t = p * q, v = t * m;
        return { q: `$${p}${T_}${m}${T_}${q}$`, a: `$${v}$`, easy: `$${p}${T_}${q}${T_}${m}=${t}${T_}${m}=${v}$`, key: ks('63', [p, q, m]) };
      },
      // 小数・4つの数・25×(4の倍数)
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [p, q, t] = r.pick([['0.5', 20, 10], ['0.25', 4, 1], ['0.2', 50, 10], ['0.125', 8, 1], ['0.5', 200, 100], ['2.5', 4, 10]]);
          const m = r.intNot(13, 49, x => x % 5 === 0 || x % 2 === 0);
          const v = t * m;
          return { q: `$${p}${T_}${m}${T_}${q}$`, a: `$${v}$`, easy: `$${p}${T_}${q}${T_}${m}=${t}${T_}${m}=${v}$`, key: ks('63', [p, q, m]) };
        }
        if (k === 1) {
          const [p, q] = r.pick([[2, 5], [4, 25], [8, 125]]);
          const m = r.intNot(3, 9, x => x % 5 === 0 || x % 2 === 0), n = r.intNot(3, 13, x => x % 5 === 0 || x % 2 === 0 || x === m);
          const v = p * q * m * n;
          const order = r.chance(0.5) ? [p, m, q, n] : [m, p, n, q];
          return { q: `$${order.join(T_)}$`, a: `$${v}$`, easy: `$${p}${T_}${q}${T_}${m}${T_}${n}=${p * q}${T_}${m * n}=${v}$`, key: ks('63', order) };
        }
        const [b, c] = r.pick([[25, 4], [125, 8]]);
        const a = c * r.intNot(3, 11, x => x % 5 === 0 || x % 2 === 0);
        return { q: `$${a}${T_}${b}$`, a: `$${a * b}$`, easy: `$${a / c}${T_}${c}${T_}${b}=${a / c}${T_}${b * c}=${a * b}$`, key: ks('63', [a, b]) };
      },
      // ÷を入れかえる・文字の式・ことばの問題
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const b = r.pick([3, 4, 6, 8]), c = b * r.int(2, 5), a = r.intNot(7, 29, x => x % b === 0);
          return { q: `$${a}${D_}${b}${T_}${c}$`, a: `$${a * c / b}$`, easy: `$${a}${T_}${c}${D_}${b}=${a}${T_}${c / b}=${a * c / b}$` };
        }
        if (k === 1) {
          let [p, q] = r.pick([[2, 5], [4, 25], [8, 125], [20, 5]]);
          if (r.chance(0.5)) [p, q] = [q, p];
          const v = r.pick(['a', 'x', 'y', 'b']);
          return { q: `$${p}${T_}${v}${T_}${q}$`, a: `$${p * q}${v}$`, easy: `$${p}${T_}${q}${T_}${v}=${p * q}${v}$`, key: ks('63', [p, q, v]) };
        }
        const m = r.intNot(3, 19, x => x % 5 === 0 || x % 2 === 0);
        const [pr, n] = r.pick([[25, 4], [125, 8], [5, 2], [50, 2]]);
        return { q: `1こ ${pr}《円|えん》のあめが ${m}こ《入|はい》ったふくろを、${n}ふくろ《買|か》った。《代金|だい|きん》は □《円|えん》`, a: `$${pr * m * n}$`, easy: `$${pr}${T_}${m}${T_}${n}=${pr * n}${T_}${m}=${pr * m * n}$` };
      },
      // わな：10・100になる組がない
      trap(r) {
        const p = r.pick([25, 125, 5, 15]), m = r.intNot(3, 9, x => x % 2 === 0 || x % 5 === 0), n = r.intNot(3, 13, x => x % 2 === 0 || x % 5 === 0 || x === m);
        return { q: `$${p}${T_}${m}${T_}${n}$`, a: `$${p * m * n}$`, easy: `（4・8・2がなく、10・100にならない：$${p}${T_}${m * n}=${p * m * n}$）`, key: ks('63', [p, m, n]) };
      },
    },
  });

  // ---------------------------------------------------------------- 2-64
  M.add({
    id: '2-64', part: PART, chap: '2-11', stars: 1,
    title: '100に《近|ちか》い《数|かず》は《分|わ》けて《分配法則|ぶん|ぱい|ほう|そく》',
    mark: '**98・99・101・102** など、100（1000・50・20）に《近|ちか》い《数|かず》のかけ《算|ざん》。',
    futsu: ['$102\\times6$ を、', 'ひっ《算|さん》で《計算|けい|さん》する。'],
    raku: ['$102=100+2$ と《分|わ》ける。', '$102\\times6=(100+2)\\times6$', '$=600+12=612$'],
    why: '《分配法則|ぶん|ぱい|ほう|そく》 $(a+b)\\times c=a\\times c+b\\times c$（2-11）。100のかけ《算|ざん》はすぐできる。',
    caution: '87のように100から《遠|とお》い《数|かず》は、《分|わ》けても《楽|らく》にならない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '18mm',
    fits: f64,
    steps: {
      s1(r) {
        const d = r.pick([-3, -2, -1, 1, 2, 3]), n = r.int(3, 9), a = 100 + d;
        const op = d > 0 ? '+' : '-';
        return { q: `$${a}${T_}${n}$`, a: `$${a * n}$`, easy: `$(100${op}${Math.abs(d)})${T_}${n}=${100 * n}${op}${Math.abs(d) * n}=${a * n}$`, key: ks('64', [a, n]) };
      },
      // 入れかえ・ほかのきりのよい数（20・30・50・1000）
      s2(r) {
        const base = r.pick([20, 30, 50, 100, 1000, 1000]);
        const d = base >= 100 ? r.pick([-3, -2, -1, 1, 2, 3]) : r.pick([-2, -1]);
        const n = r.int(3, 9), a = base + d, op = d > 0 ? '+' : '-';
        const easy = `$(${base}${op}${Math.abs(d)})${T_}${n}=${base * n}${op}${Math.abs(d) * n}=${a * n}$`;
        if (r.chance(0.5)) return { q: `$${n}${T_}${a}$`, a: `$${a * n}$`, easy, key: ks('64', [a, n]) };
        return { q: `$${a}${T_}${n}$`, a: `$${a * n}$`, easy, key: ks('64', [a, n]) };
      },
      // ことばの問題・小数・2けたをかける
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [what, a] = r.pick([['パン', 98], ['ノート', 99], ['ジュース', 102], ['えんぴつ', 49], ['あめ', 19], ['おにぎり', 101]]);
          const n = r.int(4, 9), base = Math.round(a / 10) * 10 === 100 ? 100 : a > 30 ? 50 : 20, d = a - base, op = d > 0 ? '+' : '-';
          return { q: `1こ ${a}《円|えん》の${what}を ${n}こ《買|か》った。《代金|だい|きん》は □《円|えん》`, a: `$${a * n}$`, easy: `$(${base}${op}${Math.abs(d)})${T_}${n}=${base * n}${op}${Math.abs(d) * n}=${a * n}$` };
        }
        if (k === 1) {
          const [a, base, dd] = r.pick([['9.9', 10, '0.1'], ['1.98', 2, '0.02'], ['4.9', 5, '0.1'], ['2.99', 3, '0.01']]);
          const n = r.int(3, 9), v = num(F.mul(fd(a), F.make(n)));
          return { q: `$${a}${T_}${n}$`, a: `$${v}$`, easy: `$(${base}-${dd})${T_}${n}=${base * n}-${num(F.mul(fd(dd), F.make(n)))}=${v}$` };
        }
        const a = r.pick([99, 101, 98, 102]), n = r.int(11, 25), d = a - 100, op = d > 0 ? '+' : '-';
        return { q: `$${a}${T_}${n}$`, a: `$${a * n}$`, easy: `$(100${op}${Math.abs(d)})${T_}${n}=${100 * n}${op}${Math.abs(d) * n}=${a * n}$`, key: ks('64', [a, n]) };
      },
      // わな：100から遠い
      trap(r) {
        const a = r.pick([63, 64, 66, 67, 73, 74, 76, 77, 83, 84, 86, 87, 88]), n = r.pick([3, 6, 7, 9]);
        return { q: `$${a}${T_}${n}$`, a: `$${a * n}$`, easy: '（100から《遠|とお》い。《分|わ》けても《楽|らく》にならない）', key: ks('64', [a, n]) };
      },
    },
  });

  // ---------------------------------------------------------------- 2-65
  M.add({
    id: '2-65', part: PART, chap: '2-11', stars: 1,
    title: '《同|おな》じ《数|かず》をかけている《所|ところ》はまとめる',
    mark: '$a\\times c+b\\times c$ で、**《同|おな》じ《数|かず》** $c$ をかけている。$a+b$ が10・100。',
    futsu: ['$37\\times6=222$、$63\\times6=378$', '$222+378=600$'],
    raku: ['6をかけている《所|ところ》をまとめる。', '$37\\times6+63\\times6$', '$=(37+63)\\times6$', '$=100\\times6=600$'],
    why: '《分配法則|ぶん|ぱい|ほう|そく》を《右|みぎ》から《左|ひだり》へ《使|つか》う：$a\\times c+b\\times c=(a+b)\\times c$（2-11）。',
    caution: 'かけている《数|かず》がちがう（$37\\times6+63\\times5$）と、まとめられない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm',
    fits: f65,
    steps: {
      s1(r) {
        const a = r.intNot(11, 89, x => x % 10 === 0 || x === 50), b = 100 - a, c = r.int(3, 9);
        return { q: `$${a}${T_}${c}+${b}${T_}${c}$`, a: `$${100 * c}$`, easy: `$(${a}+${b})${T_}${c}=100${T_}${c}=${100 * c}$`, key: ks('65', [a, b, c]) };
      },
      // 前にある同じ数・ひき算・小数
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.intNot(11, 89, x => x % 10 === 0 || x === 50), b = 100 - a, c = r.int(3, 9);
          const q = r.chance(0.5) ? `$${c}${T_}${a}+${c}${T_}${b}$` : `$${a}${T_}${c}+${c}${T_}${b}$`;
          return { q, a: `$${100 * c}$`, easy: `$${c}${T_}(${a}+${b})=${c}${T_}100=${100 * c}$`, key: ks('65', [a, b, c]) };
        }
        if (k === 1) {
          const b = r.int(11, 49), a = b + 100, c = r.int(3, 9);
          return { q: `$${a}${T_}${c}-${b}${T_}${c}$`, a: `$${100 * c}$`, easy: `$(${a}-${b})${T_}${c}=100${T_}${c}=${100 * c}$` };
        }
        const n = r.intNot(11, 89, x => x % 10 === 0), a = dec(n, -1), b = dec(100 - n, -1), c = r.int(3, 9);
        return { q: `$${a}${T_}${c}+${b}${T_}${c}$`, a: `$${10 * c}$`, easy: `$(${a}+${b})${T_}${c}=10${T_}${c}=${10 * c}$`, key: ks('65', [a, b, c]) };
      },
      // 3つの項・3.14・ことばの問題
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(11, 40), b = r.int(11, 40), c = 100 - a - b, m = r.int(3, 9);
          if (c < 11 || a % 10 === 0 || b % 10 === 0 || c % 10 === 0) return null;
          return { q: `$${a}${T_}${m}+${b}${T_}${m}+${c}${T_}${m}$`, a: `$${100 * m}$`, easy: `$(${a}+${b}+${c})${T_}${m}=100${T_}${m}=${100 * m}$` };
        }
        if (k === 1) {
          const a = r.int(1, 9), b = 10 - a, v = num(F.mul(fd('3.14'), F.make(10)));
          if (a === 5) return null;
          return { q: `$3.14${T_}${a}+3.14${T_}${b}$`, a: `$${v}$`, easy: `$3.14${T_}(${a}+${b})=3.14${T_}10=${v}$`, key: ks('65pi', [a, b]) };
        }
        const p = r.pick([35, 45, 55, 65, 85, 120]), a = r.int(2, 8), b = 10 - a;
        if (a === b) return null;
        return { q: `1《本|ぽん》 ${p}《円|えん》のえんぴつを、《兄|あに》が ${a}《本|ほん》、《弟|おとうと》が ${b}《本|ほん》《買|か》った。《代金|だい|きん》の《合計|ごう|けい》は □《円|えん》`,
          a: `$${p * 10}$`, easy: `$${p}${T_}(${a}+${b})=${p}${T_}10=${p * 10}$` };
      },
      // わな：かけている数がちがう
      trap(r) {
        const a = r.intNot(11, 89, x => x % 10 === 0 || x === 50), b = 100 - a, c = r.int(3, 9), d = r.intNot(3, 9, x => x === c);
        return dest({ q: `$${a}${T_}${c}+${b}${T_}${d}$`, a: `$${a * c + b * d}$`, key: ks('65t', [a, b, c, d]) }, '2-65',
          `かけている《数|かず》がちがう：$${a * c}+${b * d}=${a * c + b * d}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-66
  M.add({
    id: '2-66', part: PART, chap: '2-12', stars: 1,
    title: '《同類項|どう|るい|こう》をまとめる',
    mark: '《同|おな》じ《文字|も|じ》の《項|こう》（**《同類項|どう|るい|こう》**）が2つ《以上|い|じょう》ある。',
    futsu: ['$4x+3+x+5$ の《項|こう》を、', '1つずつ《左|ひだり》から《見|み》て、', '《長|なが》い《式|しき》のまま《考|かんが》える。'],
    raku: ['$x$ の《項|こう》どうし、《数|かず》どうしを《集|あつ》める。', '$4x+3+x+5=4x+x+3+5$', '$=5x+8$'],
    why: '$3x+2x$ は、$x$ が3つと2つで5つ。《分配法則|ぶん|ぱい|ほう|そく》で $(3+2)x=5x$（2-12）。',
    caution: '$x$ と $y$、$x$ と $x^{2}$ は《同類項|どう|るい|こう》ではない（まとめられない）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: 2,
    boxw: { s1: '22mm', s2: '22mm', s3: '28mm', trap: '22mm' },
    fits: f66,
    steps: {
      s1(r) {
        const v = r.pick(VARS), p = r.int(2, 9), q = r.int(2, 9), k = r.int(0, 2);
        if (k === 0) return { q: `$${p}${v}+${q}${v}$`, a: `$${cx(p + q, v)}$`, easy: `$(${p}+${q})${v}=${cx(p + q, v)}$`, key: ks('66', [p, q, v]) };
        if (p === q) return null;
        if (k === 1) return { q: `$${p}${v}-${q}${v}$`, a: `$${cx(p - q, v)}$`, easy: `$(${p}-${q})${v}=${cx(p - q, v)}$` };
        const c = r.int(1, 9), sg = r.chance(0.5) ? '+' : '-';
        return { q: `$${p}${v}-${q}${v}${sg}${c}$`, a: `$${poly([[p - q, v], [sg === '+' ? c : -c, '']])}$`, easy: `$(${p}-${q})${v}${sg}${c}=${poly([[p - q, v], [sg === '+' ? c : -c, '']])}$` };
      },
      // 同類項がはなれている
      s2(r) {
        const v = r.pick(VARS), p = r.int(1, 9), q = r.int(1, 9), c = r.int(1, 9), d = r.int(1, 9);
        const sp = r.chance(0.7) ? 1 : -1, sc = r.chance(0.6) ? 1 : -1, sd = r.chance(0.6) ? 1 : -1;
        const terms = [[p, v], [sc * c, ''], [sp * q, v], [sd * d, '']];
        if (p + sp * q === 0 || sc * c + sd * d === 0) return null;
        const ans = poly(collect(terms));
        const easy = `$${poly([terms[0], terms[2], terms[1], terms[3]])}=${ans}$`;
        return { q: `$${poly(terms)}$`, a: `$${ans}$`, easy };
      },
      // 2つの文字・2乗・小数
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [u, w] = r.pick([['x', 'y'], ['a', 'b']]);
          const p = r.int(2, 9), q = r.int(1, 9), s = r.int(1, p - 1), t = r.int(1, 9), sq = r.chance(0.5) ? 1 : -1;
          if (q + sq * t === 0) return null;
          const terms = [[p, u], [q, w], [-s, u], [sq * t, w]];
          return { q: `$${poly(terms)}$`, a: `$${poly(collect(terms))}$`, easy: `$${poly([terms[0], terms[2], terms[1], terms[3]])}=${poly(collect(terms))}$` };
        }
        if (k === 1) {
          const v = r.pick(['x', 'a', 't']), p = r.int(1, 5), q = r.int(2, 9), s = r.int(1, 5), t = r.int(1, 9);
          if (q === t) return null;
          const terms = [[p, `${v}^{2}`], [q, v], [s, `${v}^{2}`], [-t, v]];
          return { q: `$${poly(terms)}$`, a: `$${poly(collect(terms))}$`, easy: `$${poly([terms[0], terms[2], terms[1], terms[3]])}=${poly(collect(terms))}$` };
        }
        const v = r.pick(VARS), p = r.intNot(1, 19, x => x % 10 === 0), q = r.intNot(1, 19, x => x % 10 === 0), sg = r.chance(0.5) ? 1 : -1;
        const P = F.make(p, 10), Q = F.make(sg * q, 10), S = F.add(P, Q);
        if (S[0] === 0) return null;
        const terms = [[P, v], [Q, v]];
        return { q: `$${poly(terms)}$`, a: `$${poly([[S, v]])}$`, easy: `$(${num(P)}${sg > 0 ? '+' : '-'}${num([q, 10])})${v}=${poly([[S, v]])}$` };
      },
      // わな：同類項がない
      trap(r) {
        const k = r.int(0, 2), p = r.int(2, 9), q = r.int(2, 9);
        if (k === 0) { const v = r.pick(VARS); return { q: `$${p}${v}+${q}$`, a: `$${p}${v}+${q}$`, easy: '（《同類項|どう|るい|こう》がない。このまま）', easyCheck: false }; }
        if (k === 1) { const [u, w] = r.pick([['x', 'y'], ['a', 'b']]); return { q: `$${p}${u}+${q}${w}$`, a: `$${p}${u}+${q}${w}$`, easy: '（《文字|も|じ》がちがう。このまま）', easyCheck: false }; }
        const v = r.pick(['x', 'a']);
        return { q: `$${v}^{2}+${q}${v}$`, a: `$${v}^{2}+${q}${v}$`, easy: '（2《乗|じょう》の《項|こう》と1つの《項|こう》は《同類項|どう|るい|こう》ではない。このまま）', easyCheck: false };
      },
    },
  });

  // ---------------------------------------------------------------- 2-67
  M.add({
    id: '2-67', part: PART, chap: '2-12', stars: 1,
    title: 'かっこは《分配法則|ぶん|ぱい|ほう|そく》ではずす',
    mark: '《数|かず》×（《式|しき》）、（《式|しき》）÷《数|かず》。かっこの《中|なか》に **＋・－**。',
    futsu: ['$3(x+2)$ のかっこの《中|なか》は', '《計算|けい|さん》できないので、', '《先|さき》に《進|すす》めない。'],
    raku: ['かっこの《外|そと》の3を、《中|なか》の《両方|りょう|ほう》にかける。', '$3(x+2)=3\\times x+3\\times2$', '$=3x+6$'],
    why: '《分配法則|ぶん|ぱい|ほう|そく》 $(a+b)\\times c=a\\times c+b\\times c$（2-11・2-12）。わるときは、1つずつわる。',
    caution: 'かっこの《前|まえ》がマイナスなら、《中|なか》の《符号|ふ|ごう》が《全部|ぜん|ぶ》かわる（わざ 2-68）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '22mm', s3: '28mm', trap: '18mm' },
    fits: f67,
    steps: {
      s1(r) {
        const v = r.pick(VARS), p = r.int(2, 9), q = r.int(1, 5), c = r.int(1, 9), sg = r.chance(0.6) ? 1 : -1;
        const inner = [[q, v], [sg * c, '']], ans = poly(scale(inner, p));
        return { q: `$${p}(${poly(inner)})$`, a: `$${ans}$`, easy: `$${p}${T_}${cx(q, v)}${sg > 0 ? '+' : '-'}${p}${T_}${c}=${ans}$`, key: ks('67', [p, q, sg * c, v]) };
      },
      // まとめてわる・うしろからかける
      s2(r) {
        const v = r.pick(VARS), p = r.int(2, 6), q = p * r.int(1, 5), c = p * r.int(1, 6), sg = r.chance(0.6) ? 1 : -1, k = r.int(0, 2);
        const inner = [[q, v], [sg * c, '']], s = sg > 0 ? '+' : '-';
        if (k === 0) {
          const ans = poly(scale(inner, F.make(1, p)));
          return { q: `$(${poly(inner)})${D_}${p}$`, a: `$${ans}$`, easy: `$${q}${v}${D_}${p}${s}${c}${D_}${p}=${ans}$`, key: ks('67d', [p, q, sg * c, v]) };
        }
        if (k === 1) {
          const ans = poly(scale(inner, F.make(1, p)));
          return { q: `$\\frac{${poly(inner)}}{${p}}$`, a: `$${ans}$`, easy: `$\\frac{${q}${v}}{${p}}${s}\\frac{${c}}{${p}}=${ans}$`, key: ks('67d', [p, q, sg * c, v]) };
        }
        const q2 = r.int(1, 5), c2 = r.int(1, 9), inner2 = [[q2, v], [sg * c2, '']], ans = poly(scale(inner2, p));
        return { q: `$(${poly(inner2)})${T_}${p}$`, a: `$${ans}$`, easy: `$${cx(q2, v)}${T_}${p}${s}${c2}${T_}${p}=${ans}$`, key: ks('67', [p, q2, sg * c2, v]) };
      },
      // かっこが2つ・文字が2つ・ことばの問題
      s3(r) {
        const k = r.int(0, 3), v = r.pick(['x', 'a']);
        if (k === 0) {
          const p = r.int(2, 5), a = r.int(1, 6), s = r.int(2, 5), b = r.int(1, 6);
          const t = [[p, v], [p * a, ''], [s, v], [-s * b, '']];
          return { q: `$${p}(${v}+${a})+${s}(${v}-${b})$`, a: `$${poly(collect(t))}$`, easy: `$${poly(t)}=${poly(collect(t))}$` };
        }
        if (k === 1) {
          const p = r.int(2, 6), q = r.int(2, 5), c = r.int(1, 5), sg = r.chance(0.5) ? 1 : -1;
          const inner = [[q, 'x'], [sg * c, 'y']];
          return { q: `$${p}(${poly(inner)})$`, a: `$${poly(scale(inner, p))}$`, easy: `$${p}${T_}${q}x${sg > 0 ? '+' : '-'}${p}${T_}${cx(c, 'y')}=${poly(scale(inner, p))}$` };
        }
        if (k === 2) {
          const n = r.int(2, 6), j = r.pick([20, 30, 40, 50, 60, 80]);
          return { q: `1こ $x$ 《円|えん》のパンと、${j}《円|えん》のジュースを1つずつ《組|く》みにして、${n}《組|くみ》《買|か》った。《代金|だい|きん》は □《円|えん》`,
            a: `$${n}x+${n * j}$`, easy: `$${n}(x+${j})=${n}x+${n * j}$` };
        }
        const q = 2 * r.int(1, 4), c = 2 * r.int(1, 5);
        return { q: `$\\frac{1}{2}(${q}${v}+${c})$`, a: `$${poly([[q / 2, v], [c / 2, '']])}$`, easy: `$\\frac{1}{2}${T_}${q}${v}+\\frac{1}{2}${T_}${c}=${poly([[q / 2, v], [c / 2, '']])}$` };
      },
      // わな：かっこの中がかけ算だけ
      trap(r) {
        const v = r.pick(VARS), p = r.int(2, 9), q = r.int(2, 9);
        return { q: `$${p}(${q}${v})$`, a: `$${p * q}${v}$`, easy: `（かっこの《中|なか》はかけ《算|ざん》だけ。《分|わ》けて《配|くば》らない：$${p}${T_}${q}${v}=${p * q}${v}$）`, key: ks('67t', [p, q, v]) };
      },
    },
  });

  // ---------------------------------------------------------------- 2-68
  M.add({
    id: '2-68', part: PART, chap: '2-12', stars: 1,
    title: 'マイナスのかっこは、《中|なか》の《符号|ふ|ごう》を《全部|ぜん|ぶ》かえる',
    mark: 'かっこの《前|まえ》に **マイナス**：$-(\\cdots)$、$-2(\\cdots)$。',
    futsu: ['$-1$ を《中|なか》の1つずつにかける。', '$(-1)\\times x+(-1)\\times(-2)$', '$=-x+2$'],
    raku: ['かっこをはずして、', '《中|なか》の《符号|ふ|ごう》を《全部|ぜん|ぶ》かえる。', '$-(x-2)=-x+2$'],
    why: '$-(\\cdots)$ は $-1$ をかけること。$-1$ は、かっこの《中|なか》のどの《項|こう》にもかかる（2-12）。',
    caution: '＋のかっこは、そのままはずす（$+(x-2)=x-2$）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: { s1: '22mm', s2: '22mm', s3: '26mm', trap: '20mm' },
    fits: f68,
    steps: {
      s1(r) {
        const v = r.pick(VARS), p = r.chance(0.5) ? 1 : r.int(2, 5), q = r.int(1, 5), c = r.int(1, 9), sg = r.chance(0.5) ? 1 : -1;
        const inner = [[q, v], [sg * c, '']], ans = poly(scale(inner, -p));
        const easy = `$(-${p})${T_}${cx(q, v)}+(-${p})${T_}${par(sg * c)}=${ans}$`;
        return { q: `$-${p === 1 ? '' : p}(${poly(inner)})$`, a: `$${ans}$`, easy };
      },
      // ほかの項といっしょに
      s2(r) {
        const v = r.pick(VARS), k = r.int(0, 2);
        if (k === 0) {
          const p = r.int(2, 4), a = r.int(1, 6), b = r.int(1, 6), sg = r.chance(0.5) ? 1 : -1;
          const t = [[p, v], [p * a, ''], [-1, v], [-sg * b, '']];
          if (p === 1) return null;
          return { q: `$${p}(${v}+${a})-(${v}${sg > 0 ? '+' : '-'}${b})$`, a: `$${poly(collect(t))}$`, easy: `$${poly(t)}=${poly(collect(t))}$` };
        }
        if (k === 1) {
          const c = r.int(2, 12), q = r.int(2, 5), d = r.int(1, 9), sg = r.chance(0.5) ? 1 : -1;
          const t = [[c, ''], [-q, v], [-sg * d, '']];
          if (c - sg * d === 0) return null;
          return { q: `$${c}-(${q}${v}${sg > 0 ? '+' : '-'}${d})$`, a: `$${poly(collect(t))}$`, easy: `$${poly(t)}=${poly(collect(t))}$` };
        }
        const p = r.int(3, 9), q = r.int(1, p - 1), d = r.int(1, 9), sg = r.chance(0.5) ? 1 : -1;
        const t = [[p, v], [-q, v], [-sg * d, '']];
        return { q: `$${p}${v}-(${cx(q, v)}${sg > 0 ? '+' : '-'}${d})$`, a: `$${poly(collect(t))}$`, easy: `$${poly(t)}=${poly(collect(t))}$` };
      },
      // 文字が2つ・負の数でわる・式どうしのひき算・分数
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const p = r.int(2, 5), q = r.int(2, 5), sg = r.chance(0.5) ? 1 : -1;
          const inner = [[q, 'x'], [sg, 'y']];
          return { q: `$-${p}(${poly(inner)})$`, a: `$${poly(scale(inner, -p))}$`, easy: `$(-${p})${T_}${q}x+(-${p})${T_}${par(poly([[sg, 'y']]))}=${poly(scale(inner, -p))}$` };
        }
        if (k === 1) {
          const p = r.int(2, 4), q = p * r.int(1, 4), c = p * r.int(1, 4), sg = r.chance(0.5) ? 1 : -1, v = r.pick(VARS);
          const inner = [[q, v], [sg * c, '']], ans = poly(scale(inner, F.make(-1, p)));
          return { q: `$(${poly(inner)})${D_}(-${p})$`, a: `$${ans}$`, easy: `$${q}${v}${D_}(-${p})${sg > 0 ? '+' : '-'}${c}${D_}(-${p})=${ans}$` };
        }
        if (k === 2) {
          const v = r.pick(VARS), a = r.int(3, 9), b = r.int(1, 9), c = r.int(1, a - 1), d = r.int(1, 9);
          const t = [[a, v], [b, ''], [-c, v], [d, '']];
          return { q: `$(${a}${v}+${b})-(${cx(c, v)}-${d})$`, a: `$${poly(collect(t))}$`, easy: `$${poly(t)}=${poly(collect(t))}$` };
        }
        const v = r.pick(['x', 'a']), q = 2 * r.int(1, 4), c = 2 * r.int(1, 5);
        const t = [[-q / 2, v], [c / 2, '']];
        return { q: `$-\\frac{1}{2}(${q}${v}-${c})$`, a: `$${poly(t)}$`, easy: `$-\\frac{1}{2}${T_}${q}${v}+\\frac{1}{2}${T_}${c}=${poly(t)}$` };
      },
      // わな：＋のかっこ
      trap(r) {
        const v = r.pick(VARS), k = r.int(0, 1), q = r.int(1, 5), c = r.int(1, 9), d = r.intNot(1, 9, x => x === c);
        if (k === 0) {
          const t = [[q, v], [-c, ''], [d, '']];
          return dest({ q: `$(${poly(t.slice(0, 2))})+${d}$`, a: `$${poly(collect(t))}$`, key: ks('68t', [q, -c, d, v]) }, '2-68', `＋のかっこは、そのままはずす：$${poly(t)}=${poly(collect(t))}$`);
        }
        const t = [[d, ''], [q, v], [-c, '']];
        return dest({ q: `$${d}+(${poly(t.slice(1))})$`, a: `$${poly(collect(t))}$`, key: ks('68t', [q, -c, d, v]) }, '2-68', `＋のかっこは、そのままはずす：$${poly(t)}=${poly(collect(t))}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-69
  const pw = (v, n) => (n === 1 ? v : `${v}^{${n}}`);
  M.add({
    id: '2-69', part: PART, chap: '2-12', stars: 1,
    title: '《指数|し|すう》のきまりを《文字|も|じ》で',
    mark: '《同|おな》じ《文字|も|じ》の **《累乗|るい|じょう》** のかけ《算|ざん》・わり《算|ざん》。',
    futsu: ['$x^{2}\\times x^{3}$ を', '$x\\times x\\times x\\times x\\times x$ と', '《書|か》き《出|だ》して《数|かぞ》える。'],
    raku: ['かける《回数|かい|すう》をたす。', '$x^{2}\\times x^{3}=x^{2+3}=x^{5}$', 'わり《算|ざん》は、《回数|かい|すう》をひく。'],
    why: '$x^{m}\\times x^{n}=x^{m+n}$、$\\frac{x^{m}}{x^{n}}=x^{m-n}$（2-12）。$x^{0}=1$、$x^{-1}=\\frac{1}{x}$。',
    caution: 'たし《算|ざん》（$x^{2}+x^{3}$）は、《指数|し|すう》をたせない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: 2,
    boxw: { s1: '18mm', s2: '20mm', s3: '22mm', trap: '20mm' },
    fits: f69,
    steps: {
      s1(r) {
        const v = r.pick(VARS), k = r.int(0, 2);
        if (k === 0) {
          const m = r.int(1, 6), n = r.int(2, 6);
          return { q: `$${pw(v, m)}${T_}${pw(v, n)}$`, a: `$${pw(v, m + n)}$`, easy: `$${v}^{${m}+${n}}=${pw(v, m + n)}$`, key: ks('69', [m, n, v]) };
        }
        const m = r.int(3, 9), n = r.int(1, m - 2);
        if (k === 1) return { q: `$${pw(v, m)}${D_}${pw(v, n)}$`, a: `$${pw(v, m - n)}$`, easy: `$${v}^{${m}-${n}}=${pw(v, m - n)}$` };
        return { q: `$\\frac{${pw(v, m)}}{${pw(v, n)}}$`, a: `$${pw(v, m - n)}$`, easy: `$${v}^{${m}-${n}}=${pw(v, m - n)}$` };
      },
      // 係数がある・3つ
      s2(r) {
        const v = r.pick(VARS), k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(2, 5), b = r.int(2, 5) * (r.chance(0.3) ? -1 : 1), m = r.int(1, 4), n = r.int(1, 4);
          const B = b < 0 ? `(${b}${pw(v, n)})` : `${b}${pw(v, n)}`;
          return { q: `$${a}${pw(v, m)}${T_}${B}$`, a: `$${a * b}${pw(v, m + n)}$`, easy: `$${a}${T_}${par(b)}${T_}${v}^{${m}+${n}}=${a * b}${pw(v, m + n)}$`, key: ks('69c', [a, b, m, n, v]) };
        }
        if (k === 1) {
          const b = r.int(2, 4), c = r.int(2, 4), m = r.int(4, 8), n = r.int(1, m - 2);
          return { q: `$\\frac{${b * c}${pw(v, m)}}{${b}${pw(v, n)}}$`, a: `$${c}${pw(v, m - n)}$`, easy: `$\\frac{${b * c}}{${b}}${T_}${v}^{${m}-${n}}=${c}${pw(v, m - n)}$` };
        }
        const a = r.int(1, 3), b = r.int(1, 4), c = r.int(1, 4);
        if (a === b && b === c) return null;
        return { q: `$${pw(v, a)}${T_}${pw(v, b)}${T_}${pw(v, c)}$`, a: `$${pw(v, a + b + c)}$`, easy: `$${v}^{${a}+${b}+${c}}=${pw(v, a + b + c)}$`, key: ks('69', [a, b, c, v]) };
      },
      // 負の指数・0乗・文字が2つ
      s3(r) {
        const v = r.pick(['x', 'a', 't']), k = r.pick([0, 0, 1, 1, 2, 3, 3]);
        if (k === 0) {
          const m = r.int(1, 4), n = r.int(m + 1, 7);
          return { q: `$${v}^{-${m}}${T_}${pw(v, n)}$`, a: `$${pw(v, n - m)}$`, easy: `$${v}^{-${m}+${n}}=${pw(v, n - m)}$` };
        }
        if (k === 1) {
          const m = r.int(1, 4), n = r.int(m + 1, 7);
          return { q: `$\\frac{${pw(v, m)}}{${pw(v, n)}}$`, a: `$${v}^{${m - n}}$`, easy: `$${v}^{${m}-${n}}=${v}^{${m - n}}=\\frac{1}{${pw(v, n - m)}}$` };
        }
        if (k === 2) {
          const m = r.int(2, 6);
          return { q: `$${pw(v, m)}${T_}${v}^{-${m}}$`, a: '$1$', easy: `$${v}^{${m}-${m}}=${v}^{0}=1$` };
        }
        const a = r.int(1, 3), b = r.int(1, 3), c = r.int(1, 3), d = r.int(1, 3);
        const L = pw('a', a) + pw('b', b), R = pw('a', c) + pw('b', d);
        return { q: `$${L}${T_}${R}$`, a: `$${pw('a', a + c)}${pw('b', b + d)}$`, easy: `$a^{${a}+${c}}b^{${b}+${d}}=${pw('a', a + c)}${pw('b', b + d)}$`, key: ks('69ab', [L, R]) };
      },
      // わな：たし算・文字がちがう
      trap(r) {
        const k = r.int(0, 1), m = r.int(2, 4), n = r.int(m + 1, 6);
        if (k === 0) { const v = r.pick(VARS); return { q: `$${pw(v, m)}+${pw(v, n)}$`, a: `$${pw(v, m)}+${pw(v, n)}$`, easy: '（たし《算|ざん》は《指数|し|すう》をたせない。このまま）', easyCheck: false }; }
        return { q: `$x^{${m}}${T_}y^{${n}}$`, a: `$x^{${m}}y^{${n}}$`, easy: '（《文字|も|じ》がちがうので、《指数|し|すう》はたせない）', easyCheck: false };
      },
    },
  });

  // ---------------------------------------------------------------- 2-70
  // 文字に値を入れた式の値（分数）。expr は [[係数, 'x'|'x^{2}'|'x^{3}'|'']] の和
  function valOf(terms, x) {
    return terms.reduce((s, [c, mono]) => {
      const n = mono === '' ? 0 : mono.includes('^') ? +mono.match(/\^\{(\d+)\}/)[1] : 1;
      let p = F.make(1); for (let i = 0; i < n; i++) p = F.mul(p, x);
      return F.add(s, F.mul(fc(c), p));
    }, F.make(0));
  }
  // 代入した式（2\times(-3)^{2}）
  function subst(terms, xs) {
    let out = '';
    terms.forEach(([c, mono], i) => {
      const n = mono === '' ? 0 : mono.includes('^') ? +mono.match(/\^\{(\d+)\}/)[1] : 1;
      const cc = fc(c), neg = cc[0] < 0, a = [Math.abs(cc[0]), cc[1]];
      let body;
      if (n === 0) body = num(a);
      else {
        const pv = n === 1 ? xs : `${xs}^{${n}}`;
        body = (a[0] === 1 && a[1] === 1) ? pv : `${num(a)}${T_}${pv}`;
      }
      out += neg ? '-' + body : (i ? '+' + body : body);
    });
    return out;
  }
  M.add({
    id: '2-70', part: PART, chap: '2-13', stars: 1,
    title: '《代入|だい|にゅう》はかっこをつけて',
    mark: '**《負|ふ》の《数|かず》・《分数|ぶん|すう》・《式|しき》** を《代入|だい|にゅう》する。2《乗|じょう》がある。',
    futsu: ['$x^{2}$ の $x$ に、そのまま $-3$ を', '《書|か》くと $-3^{2}$。', 'これは $-9$ で、まちがい。'],
    raku: ['かっこをつけて《入|い》れる。', '$x^{2}=(-3)^{2}$', '$=(-3)\\times(-3)=9$'],
    why: '$-3$ は1つの《数|かず》なので、まるごと《入|い》れる。2《乗|じょう》は、すぐ《前|まえ》の《数|かず》だけにかかる（2-13）。',
    caution: '《正|せい》の《整数|せい|すう》なら、かっこがなくても《同|おな》じ（$x=3$ で $2x=6$）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '24mm', trap: '16mm' },
    boxh: { s2: '12mm' },
    fits: f70,
    steps: {
      s1(r) {
        const x = -r.int(1, 5), v = r.pick(['x', 'a', 't']), k = r.int(0, 4);
        const forms = [[[1, `${v}^{2}`]], [[r.int(2, 5), `${v}^{2}`]], [[-1, `${v}^{2}`]], [[1, `${v}^{3}`]], [[r.int(2, 6), v], [r.intNot(-9, 9, z => z === 0), '']]];
        const t = forms[k];
        if (k === 3 && x < -3) return null;
        const X = F.make(x), ans = valOf(t, X);
        const sub = subst(t, `(${x})`);
        return { q: `$${v}=${x}$ のとき、$${poly(t)}=□$`, a: `$${num(ans)}$`, easy: `$${sub}=${num(ans)}$`,
          verify: () => close(M.evalMath(poly(t), { [v]: x }), F.val(ans)) || 'ちがう' };
      },
      // 分数を代入する・文字が2つ
      s2(r) {
        if (r.chance(0.65)) {
          const v = r.pick(['x', 'a']), d = r.pick([2, 3]), n = r.chance(0.5) ? 1 : -1, X = F.make(n, d);
          const t = r.pick([[[d * d, `${v}^{2}`]], [[d, `${v}^{2}`]], [[1, `${v}^{2}`]], [[2 * d, v], [1, '']], [[d, v], [-2, '']]]);
          const ans = valOf(t, X);
          const xs = `\\left(${n < 0 ? '-' : ''}\\frac{1}{${d}}\\right)`;
          return { q: `$${v}=${F.tex(X)}$ のとき、$${poly(t)}=□$`, a: `$${num(ans, { frac: true })}$`, easy: `$${subst(t, xs)}=${num(ans, { frac: true })}$`,
            verify: () => close(M.evalMath(poly(t), { [v]: F.val(X) }), F.val(ans)) || 'ちがう' };
        }
        const a = -r.int(1, 4), b = r.int(2, 5), k = r.int(0, 2);
        const [expr, val, sub] = [[`a^{2}b`, a * a * b, `(${a})^{2}${T_}${b}`], [`ab^{2}`, a * b * b, `(${a})${T_}${b}^{2}`], [`b-a`, b - a, `${b}-(${a})`]][k];
        return { q: `$a=${a},\\ b=${b}$ のとき、$${expr}=□$`, a: `$${val}$`, easy: `$${sub}=${val}$`,
          verify: () => close(M.evalMath(expr, { a, b }), val) || 'ちがう' };
      },
      // 式をかっこごと・単位をそろえて・2乗のある公式
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const p = r.int(2, 5), c = r.int(1, 9), s = r.int(1, 6), sg = r.chance(0.5) ? 1 : -1;
          const t = [[p, 't'], [p * -s * sg + c, '']];
          return { q: `$y=${p}x+${c}$ の $x$ に $t${sg > 0 ? '-' : '+'}${s}$ を《代入|だい|にゅう》すると、$y=□$`, a: `$${poly(t)}$`,
            easy: `$${p}(t${sg > 0 ? '-' : '+'}${s})+${c}=${poly(t)}$` };
        }
        if (k === 1) {
          const v = r.int(2, 8), m = r.int(2, 10);
          return { q: `$x=vt$ に $v=${v}${U('m/s')}$、$t=${m}${U('min')}$ を《代入|だい|にゅう》すると、$x=□${U('m')}$`, a: `$${v * m * 60}$`,
            easy: `$${v}${T_}(${m}${T_}60)=${v * m * 60}$` };
        }
        const t = r.pick(['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1.2']);
        const ans = num(F.mul(F.make(5), F.mul(fd(t), fd(t))));
        return { q: `$x=5t^{2}$ で、$t=${t}$ のとき、$x=□$`, a: `$${ans}$`, easy: `$5${T_}${t}^{2}=5${T_}${num(F.mul(fd(t), fd(t)))}=${ans}$` };
      },
      // わな：正の整数（かっこがなくても同じ）
      trap(r) {
        const v = r.pick(['x', 'a', 't']), x = r.int(2, 9), p = r.int(2, 9), c = r.int(1, 9);
        return { q: `$${v}=${x}$ のとき、$${p}${v}+${c}=□$`, a: `$${p * x + c}$`, easy: `（《正|せい》の《整数|せい|すう》は、かっこがなくても《同|おな》じ：$${p}${T_}${x}+${c}=${p * x + c}$）` };
      },
    },
  });

  // ---------------------------------------------------------------- 2-71
  M.add({
    id: '2-71', part: PART, chap: '2-12・2-13', stars: 2,
    title: '《式|しき》を《簡単|かん|たん》にしてから《代入|だい|にゅう》',
    mark: '**《同類項|どう|るい|こう》** のある《式|しき》に《代入|だい|にゅう》する。',
    futsu: ['$3x+2x-4x$ に $x=17$ を', 'そのまま《入|い》れて、', '$51+34-68=17$'],
    raku: ['《先|さき》に $x$ にまとめる。', '$3x+2x-4x=x$', '$x=17$ を《入|い》れて $17$'],
    why: '《代入|だい|にゅう》の《前|まえ》でもあとでも、《式|しき》の《値|あたい》は《同|おな》じ。まとめると、《代入|だい|にゅう》する《所|ところ》が1つになる（2-12・2-13）。',
    caution: '$3x+2y$ のように《同類項|どう|るい|こう》がなければ、そのまま《代入|だい|にゅう》する。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits: f71,
    steps: {
      s1(r) {
        const v = r.pick(['x', 'a', 't']), want = r.pick([1, 1, 2, -1, 3]), p = r.int(2, 9), q = r.int(2, 9);
        const s = p + q - want;
        if (s <= 1 || s === p || s === q) return null;
        const x = r.intNot(7, 49, z => z % 10 === 0);
        const t = [[p, v], [q, v], [-s, v]];
        const ans = want * x;
        return { q: `$${v}=${x}$ のとき、$${poly(t)}=□$`, a: `$${ans}$`, easy: `$${poly(t)}=${cx(want, v)}$ に《代入|だい|にゅう》`, easyCheck: false,
          verify: () => F.eq(valOf(t, F.make(x)), F.make(ans)) || 'ちがう' };
      },
      // 数の項が消える・文字が2つ
      s2(r) {
        if (r.chance(0.5)) {
          const v = r.pick(['x', 'a']), p = r.int(3, 9), q = r.int(2, 9), c = r.int(1, 9), want = r.int(1, 3);
          const s = p + q - want;
          if (s <= 1 || s === p) return null;
          const x = r.intNot(6, 39, z => z % 10 === 0);
          const t = [[p, v], [-c, ''], [q, v], [-s, v], [c, '']];
          return { q: `$${v}=${x}$ のとき、$${poly(t)}=□$`, a: `$${want * x}$`, easy: `$${poly(t)}=${cx(want, v)}$ に《代入|だい|にゅう》`, easyCheck: false,
            verify: () => F.eq(valOf(t, F.make(x)), F.make(want * x)) || 'ちがう' };
        }
        const p = r.int(2, 7), q = r.int(2, 7), x = r.int(6, 29), y = r.int(6, 29);
        const t = [[p, 'x'], [q, 'y'], [-(p - 1), 'x'], [-q, 'y']];
        return { q: `$x=${x},\\ y=${y}$ のとき、$${poly(t)}=□$`, a: `$${x}$`, easy: `$${poly(t)}=x$ に《代入|だい|にゅう》`, easyCheck: false,
          verify: () => close(M.evalMath(poly(t), { x, y }), x) || 'ちがう' };
      },
      // かっこがある・分数の係数
      s3(r) {
        if (r.chance(0.6)) {
          const v = r.pick(['x', 'a']), p = r.int(2, 5), a = r.int(1, 6), q = p - 1, b = p * a / q;
          if (!Number.isInteger(b)) return null;
          const x = r.intNot(11, 39, z => z % 10 === 0);
          const e = `${p}(${v}+${a})-${q === 1 ? '' : q}(${v}+${b})`;
          return { q: `$${v}=${x}$ のとき、$${e}=□$`, a: `$${x}$`, easy: `$${e}=${v}$ に《代入|だい|にゅう》`, easyCheck: false,
            verify: () => close(M.evalMath(e, { [v]: x }), x) || 'ちがう' };
        }
        const d = r.pick([2, 3, 4]), m = r.int(1, d * 2 - 1), n = 2 * d - m, x = r.pick(['1.7', '2.3', '3.6', '0.9', '4.1']);
        if (m % d === 0 || n % d === 0) return null;
        const e = `\\frac{${m}}{${d}}x+\\frac{${n}}{${d}}x`;
        const ans = num(F.mul(F.make(2), fd(x)));
        return { q: `$x=${x}$ のとき、$${e}=□$`, a: `$${ans}$`, easy: `$${e}=2x$ に《代入|だい|にゅう》`, easyCheck: false,
          verify: () => close(M.evalMath(e, { x: parseFloat(x) }), parseFloat(ans)) || 'ちがう' };
      },
      // わな：同類項がない
      trap(r) {
        const p = r.int(2, 9), q = r.int(2, 9), x = r.int(2, 9), y = r.int(2, 9);
        return { q: `$x=${x},\\ y=${y}$ のとき、$${p}x+${q}y=□$`, a: `$${p * x + q * y}$`, easy: `（《同類項|どう|るい|こう》がない。そのまま《代入|だい|にゅう》：$${p}${T_}${x}+${q}${T_}${y}=${p * x + q * y}$）` };
      },
    },
  });

  // ---------------------------------------------------------------- 2-72
  // ax+b=c の解を確かめる（式に代入して両辺が等しいか）
  const holds = (A, B, vars) => close(M.evalMath(A, vars), M.evalMath(B, vars)) || `${A}=${B} が ${JSON.stringify(vars)} で成り立たない`;
  M.add({
    id: '2-72', part: PART, chap: '2-14', stars: 1,
    title: '《移項|い|こう》は《符号|ふ|ごう》をかえて',
    mark: '《等式|とう|しき》の《両辺|りょう|へん》に **《数|かず》の《項|こう》** がある：$x+3=11$。',
    futsu: ['《両辺|りょう|へん》から3をひく。', '$x+3-3=11-3$', '$x=8$'],
    raku: ['＋3を、－3にして「＝」の《向|む》こうへ《移|うつ》す。', '$x+3=11$', '$x=11-3=8$'],
    why: '《移項|い|こう》は、《両辺|りょう|へん》から《同|おな》じ《数|かず》をひく（たす）のを、1《行|ぎょう》で《書|か》いたもの（2-14）。',
    caution: '$3x=12$ のように《移|うつ》す《項|こう》がないときは、《両辺|りょう|へん》を3でわる。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '14mm',
    fits: f72,
    steps: {
      s1(r) {
        const v = r.pick(['x', 'x', 'y', 'a']), a = r.int(2, 20), x = r.intNot(-9, 30, z => z === 0);
        if (r.chance(0.5)) {
          const b = x + a;
          return { q: `$${v}+${a}=${b}$ を《解|と》くと、$${v}=□$`, a: `$${x}$`, easy: `$${b}-${a}=${x}$`, verify: () => holds(`${v}+${a}`, String(b), { [v]: x }) };
        }
        const b = x - a;
        if (b === 0) return null;
        return { q: `$${v}-${a}=${b}$ を《解|と》くと、$${v}=□$`, a: `$${x}$`, easy: `$${b}+${a}=${x}$`, verify: () => holds(`${v}-${a}`, String(b), { [v]: x }) };
      },
      // 数が前・ax+b=c・左右が反対
      s2(r) {
        const k = r.int(0, 2), x = r.intNot(-6, 15, z => z === 0);
        if (k === 0) {
          const a = r.int(2, 30), b = a + x;
          return { q: `$${a}+x=${b}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `$${b}-${a}=${x}$`, verify: () => holds(`${a}+x`, String(b), { x }) };
        }
        if (k === 1) {
          const p = r.int(2, 6), c = r.int(1, 20), sg = r.chance(0.6) ? 1 : -1, b = p * x + sg * c;
          const A = `${p}x${sg > 0 ? '+' : '-'}${c}`;
          return { q: `$${A}=${b}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `$(${b}${sg > 0 ? '-' : '+'}${c})${D_}${p}=${x}$`, verify: () => holds(A, String(b), { x }) };
        }
        const a = r.int(2, 20), sg = r.chance(0.5) ? 1 : -1, b = x + sg * a;
        const B = `x${sg > 0 ? '+' : '-'}${a}`;
        return { q: `$${b}=${B}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `$${b}${sg > 0 ? '-' : '+'}${a}=${x}$`, verify: () => holds(String(b), B, { x }) };
      },
      // 小数・x にマイナス・ことばの問題
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick(['2.5', '0.8', '1.5', '3.2', '0.25']), x = r.pick(['1.5', '2', '0.7', '4', '1.25']);
          const b = num(F.add(fd(x), fd(a)));
          return { q: `$x+${a}=${b}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `$${b}-${a}=${x}$`, verify: () => holds(`x+${a}`, b, { x: parseFloat(x) }) };
        }
        if (k === 1) {
          const a = r.int(5, 20), x = r.int(1, a - 1), b = a - x;
          return { q: `$${a}-x=${b}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `$${a}-${b}=${x}$`, verify: () => holds(`${a}-x`, String(b), { x }) };
        }
        const [what, lo, hi] = r.pick([['ノート', 120, 250], ['《消|け》しゴム', 60, 110], ['《筆箱|ふで|ばこ》', 400, 900]]);
        const a = 10 * r.int(lo / 10, hi / 10), x = 10 * r.int(5, 30), b = a + x;
        return { q: `${a}《円|えん》の${what}と、$x$ 《円|えん》のペンを《買|か》うと ${b}《円|えん》。$${a}+x=${b}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `$${b}-${a}=${x}$`, verify: () => holds(`${a}+x`, String(b), { x }) };
      },
      // わな：移す項がない（わる・かける）
      trap(r) {
        const x = r.int(2, 12), p = r.int(2, 9);
        if (r.chance(0.5)) return { q: `$${p}x=${p * x}$ を《解|と》くと、$x=□$`, a: `$${x}$`, easy: `（《移|うつ》す《項|こう》がない。《両辺|りょう|へん》を${p}でわる：$${p * x}${D_}${p}=${x}$）`, verify: () => holds(`${p}x`, String(p * x), { x }) };
        return { q: `$\\frac{x}{${p}}=${x}$ を《解|と》くと、$x=□$`, a: `$${p * x}$`, easy: `（《移|うつ》す《項|こう》がない。《両辺|りょう|へん》に${p}をかける：$${x}${T_}${p}=${p * x}$）`, verify: () => holds(`\\frac{x}{${p}}`, String(x), { x: p * x }) };
      },
    },
  });

  // ---------------------------------------------------------------- 2-73
  // T について解いた式 ans を、もとの式 A=B に入れて、ほかの文字に数を入れても成り立つか
  function solvedOK(A, B, T, ans) {
    const vs = letters(A + B).filter(c => c !== T);
    for (const base of [1.3, 2.7, 0.6]) {
      const vars = {};
      vs.forEach((c, j) => { vars[c] = base + 0.71 * j; });
      const t = M.evalMath(ans, vars);
      if (t == null) return `答え ${ans} の値が出ない`;
      vars[T] = t;
      if (!close(M.evalMath(A, vars), M.evalMath(B, vars))) return `${T}=${ans} を ${A}=${B} に入れると成り立たない`;
    }
    return true;
  }
  M.add({
    id: '2-73', part: PART, chap: '2-14', stars: 1,
    title: 'ほしい《文字|も|じ》について《解|と》く（《外側|そと|がわ》からはずす）',
    mark: '《公式|こう|しき》から、**ほかの《文字|も|じ》** を《求|もと》める（〜について《解|と》く）。',
    futsu: ['《数|かず》を《入|い》れてから、', '$1200=4t$ の $t$ を、', 'そのつど《求|もと》める。'],
    raku: ['$x=vt$ の《両辺|りょう|へん》を $v$ でわる。', '$t=\\frac{x}{v}$', 'あとからした《計算|けい|さん》から、《先|さき》にもどす。'],
    why: '《等式|とう|しき》の《両辺|りょう|へん》に《同|おな》じことをしても、《等式|とう|しき》は《成|な》り《立|た》つ。ほしい《文字|も|じ》についている《計算|けい|さん》を、《反対|はん|たい》の《計算|けい|さん》でもどす（2-14）。',
    caution: 'もう《解|と》けている《式|しき》（$x=vt$ を $x$ について）は、そのままでよい。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '24mm', trap: '18mm' },
    boxh: { s1: '11mm', s2: '10mm', s3: '10mm' },
    fits: f73,
    steps: {
      // 2つの文字のかけ算
      s1(r) {
        const [L, a, b] = r.pick([['x', 'v', 't'], ['V', 'R', 'I'], ['F', 'm', 'a'], ['W', 'F', 'x'], ['P', 'I', 'V'], ['S', 'a', 'b'], ['y', 'a', 'x']]);
        const [T, o] = r.chance(0.5) ? [a, b] : [b, a];
        const ans = `\\frac{${L}}{${o}}`;
        return { q: `$${L}=${a}${b}$ を $${T}$ について《解|と》くと、$${T}=□$`, a: `$${ans}$`, easy: `《両辺|りょう|へん》を $${o}$ でわる`, easyCheck: false,
          key: `73:${L}${a}${b}:${T}`, verify: () => solvedOK(L, `${a}${b}`, T, ans) };
      },
      // 移項してからわる・かける
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [y, x] = r.pick([['y', 'x'], ['L', 'x'], ['y', 't']]), p = r.int(2, 9), c = r.int(2, 40), sg = r.chance(0.6) ? 1 : -1;
          const B = `${p}${x}${sg > 0 ? '+' : '-'}${c}`, ans = `\\frac{${y}${sg > 0 ? '-' : '+'}${c}}{${p}}`;
          return { q: `$${y}=${B}$ を $${x}$ について《解|と》くと、$${x}=□$`, a: `$${ans}$`, easy: `${sg > 0 ? '＋' : '－'}${c}を《移項|い|こう》して、《両辺|りょう|へん》を${p}でわる`, easyCheck: false,
            verify: () => solvedOK(y, B, x, ans) };
        }
        if (k === 1) {
          const p = r.int(2, 9), [y, x] = r.pick([['y', 'x'], ['m', 'a'], ['h', 't']]);
          const B = `\\frac{${x}}{${p}}`, ans = `${p}${y}`;
          return { q: `$${y}=${B}$ を $${x}$ について《解|と》くと、$${x}=□$`, a: `$${ans}$`, easy: `《両辺|りょう|へん》に${p}をかける`, easyCheck: false,
            verify: () => solvedOK(y, B, x, ans) };
        }
        const T = r.pick(['a', 'b']), o = T === 'a' ? 'b' : 'a';
        const ans = `2m-${o}`;
        return { q: `$m=\\frac{a+b}{2}$ を $${T}$ について《解|と》くと、$${T}=□$`, a: `$${ans}$`, easy: `《両辺|りょう|へん》に2をかけて、$${o}$ を《移項|い|こう》`, easyCheck: false,
          verify: () => solvedOK('m', '\\frac{a+b}{2}', T, ans) };
      },
      // 物理の公式・解いた式に数を入れる
      s3(r) {
        const k = r.int(0, 4);
        if (k === 0) return { q: '$F=1.8C+32$ を $C$ について《解|と》くと、$C=□$', a: '$\\frac{F-32}{1.8}$', easy: '32を《移項|い|こう》して、《両辺|りょう|へん》を1.8でわる', easyCheck: false, verify: () => solvedOK('F', '1.8C+32', 'C', '\\frac{F-32}{1.8}') };
        if (k === 1) {
          const x0 = r.int(2, 30), v = r.int(2, 9), B = `${x0}+${v}t`, ans = `\\frac{x-${x0}}{${v}}`;
          return { q: `$x=${B}$ を $t$ について《解|と》くと、$t=□$`, a: `$${ans}$`, easy: `${x0}を《移項|い|こう》して、《両辺|りょう|へん》を${v}でわる`, easyCheck: false, verify: () => solvedOK('x', B, 't', ans) };
        }
        if (k === 2) {
          const T = r.pick(['a', 'h']), o = T === 'a' ? 'h' : 'a', ans = `\\frac{2S}{${o}}`;
          return { q: `$S=\\frac{1}{2}ah$ を $${T}$ について《解|と》くと、$${T}=□$`, a: `$${ans}$`, easy: `《両辺|りょう|へん》に2をかけて、$${o}$ でわる`, easyCheck: false, verify: () => solvedOK('S', '\\frac{1}{2}ah', T, ans) };
        }
        if (k === 3) {
          const T = r.pick(['a', 'b']), o = T === 'a' ? 'b' : 'a', ans = `\\frac{L}{2}-${o}`;
          return { q: `$L=2(a+b)$ を $${T}$ について《解|と》くと、$${T}=□$`, a: `$${ans}$`, easy: `《両辺|りょう|へん》を2でわって、$${o}$ を《移項|い|こう》`, easyCheck: false, verify: () => solvedOK('L', '2(a+b)', T, ans) };
        }
        const v = r.int(2, 8), t = 10 * r.int(3, 40), x = v * t;
        return { q: `$x=vt$ で、$x=${x}$、$v=${v}$ のとき、$t=□$`, a: `$${t}$`, easy: `$t=\\frac{x}{v}$ に《代入|だい|にゅう》：$\\frac{${x}}{${v}}=${t}$`, easyCheck: false, verify: () => v * t === x || 'ちがう' };
      },
      // わな：もう解けている
      trap(r) {
        const [L, B] = r.pick([['x', 'vt'], ['V', 'RI'], ['F', 'ma'], ['y', '3x+2'], ['y', '2x-5'], ['L', 'x+12']]);
        return { q: `$${L}=${B}$ を $${L}$ について《解|と》くと、$${L}=□$`, a: `$${B}$`, easy: `（もう $${L}$ について《解|と》けている。このまま）`, easyCheck: false,
          verify: () => solvedOK(L, B, L, B) };
      },
    },
  });
})(globalThis.MONDAI);
