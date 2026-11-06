/* 問題集 第3巻　第5部 指数と対数（わざ 3-60〜3-74・3-97・3-98）　組 e
 * 書き方は v2/README.md（第2・3巻）と v1/README.md（わざの形）。文はルビつき・分かち書きなし、式は $…$。
 * 近似値は教科書 3-11・3-12 と同じ：log10 2 = 0.301、log10 3 = 0.477、log10 5 = 0.699、(1/2)^0.5 = 0.707。
 *   近似値を使う答えは、使う値を問題の文に書き、verify で「近似値で計算した値」と答えが合うかを確かめる。
 *   けた数・回数・小数第何位など、近似値で決める答えは、本当の値（Math.log10）で決めた答えとも同じになる数だけを出す。
 * 第29回：わなは、同じ部のほかのわざで楽にならないものにする。どうしても当たるときは、楽な形に行き先を書き also に入れる（dest）。
 *   入れかえただけの問題には key をつける（H-6）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- ことば（ルビつき）
  const BAI = '《倍|ばい》', KAI = '《回|かい》';
  const SAIKIN = '《細菌|さい|きん》', HGK = '《半減期|はん|げん|き》', BUSSHITSU = '《物質|ぶっ|しつ》';
  const JIKAN = '《時間|じ|かん》', NEN = '《年|ねん》', GO = '《後|ご》';
  const TSUKATTE = 'を《使|つか》って';
  const RUIJO = '《累乗|るい|じょう》';
  const SHOSU = '《小数第|しょう|すう|だい》';
  const isLetter = b => typeof b === 'string' && /^[a-z]$/.test(b);
  const DENRYOKU = '《電力|でん|りょく》', DENATSU = '《電圧|でん|あつ》', ZOFUKU = '《増幅器|ぞう|ふく|き》';
  const L2 = '$\\log_{10}2=0.301$', L3 = '$\\log_{10}3=0.477$', L5 = '$\\log_{10}5=0.699$';
  // 「□分」の読み（1・3・4・6・8・0 で終わる数は「ぷん」）
  const FUN = n => `${n}${M.fun(n)}`;
  // 「□本」の読み（1・6・8・10 は ぽん、3 は ぼん）
  const HON = n => `${n}《本|${n % 10 === 3 ? 'ぼん' : [0, 1, 6, 8].includes(n % 10) ? 'ぽん' : 'ほん'}》`;
  // 答えの形を問いに書く（J-8）：数の底の累乗は「（累乗で）」（底はそのまま）、値を出すときは「の値は □」
  const RU = b => (isLetter(b) ? '' : '（《累乗|るい|じょう》で）');
  const ATAI = ' の《値|あたい》は □';
  // 時間（分）を「1時間30分」のように
  const HM = min => { const h = Math.floor(min / 60), m = min % 60; return (h ? `${h}${JIKAN}` : '') + (m ? FUN(m) : ''); };
  const pw = (b, e) => `${b}^{${e}}`;

  // ---------------------------------------------------------------- 数の書き方（近似値の計算は 1000倍した整数で）
  // 1000倍した整数 → 小数の文字（うしろの0はとる）
  function dec(m, den) {
    den = den || 1000;
    const neg = m < 0; m = Math.abs(m);
    const w = String(den).length - 1;
    let s = String(Math.floor(m / den));
    const f = m % den;
    if (f) s += '.' + String(f).padStart(w, '0').replace(/0+$/, '');
    return (neg ? '-' : '') + s;
  }
  // 答えの数：負の数は式（$-0.176$）にして、マイナスの記号を正しく組む
  const ans = s => (String(s).startsWith('-') ? `$${s}$` : String(s));
  // 小数第3位まで（1000倍した整数 → 1.380）・小数第4位まで（10000倍した整数 → 0.2385）
  const fix = (m, w) => { const D = Math.pow(10, w), a = Math.abs(m); return (m < 0 ? '-' : '') + Math.floor(a / D) + '.' + String(a % D).padStart(w, '0'); };
  const d3 = m => fix(m, 3), d4 = m => fix(m, 4);
  const SHO = n => `《小数第|しょう|すう|だい》${n}《位|い》まで`;
  const near = (x, y) => Math.abs(x - y) < 1e-9;
  const numOf = a => parseFloat(String(a).replace(/\$/g, ''));
  // 2^i 3^j 10^d の常用対数（近似値で、1000倍した整数）
  const lg = (i, j, d) => 301 * i + 477 * j + 1000 * d;
  const lgTrue = (i, j, d) => i * Math.log10(2) + j * Math.log10(3) + d;
  // 分数 p/q を TeX で
  const fr = (p, q) => `\\frac{${p}}{${q}}`;

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 問題の文の中の式（$…$ の中）だけを取り出す
  const maths = q => (q.match(/\$[^$]*\$/g) || []).map(s => s.slice(1, -1));
  // 問題の文に書いた近似値（$\log_{10}2=0.301$ など）は、式から除く
  const stripGiven = m => m.replace(/\\log_\{?\d+\}?\s*[\d.]+\s*=\s*-?[\d.]+/g, ' ').replace(/\\left\(\\frac\{1\}\{2\}\\right\)\^\{0\.5\}\s*=\s*0\.707/g, ' ');
  const mathsOf = q => maths(q).map(stripGiven);
  const isPow = (n, r) => { if (n < r) return false; while (n % r === 0) n /= r; return n === 1; };
  // 2つのちがう数が、同じ数（2・3・5・10）の累乗になっている（4 と 8、9 と 27 など）
  function sameRoot(q) {
    if (/を使うと/.test(q)) return false;
    // 「（3の累乗で）$27^{2}=□$」のように、底をそろえる先が書いてある
    const to = /(\d+)の累乗で/.exec(q) || /\\frac\{1\}\{(\d+)\}\$\s*の累乗で/.exec(q);
    for (const m of mathsOf(q)) {
      if (/\\log/.test(m)) continue;
      // かけるだけの 1/2（$16\times\frac{1}{2}$）は底ではない。累乗の (1/4)^3 は底
      const s = m.replace(/\\frac\{1\}\{\d+\}(?!\s*(?:\\right\))?\^)/g, ' ').replace(/\^\{[^}]*\}/g, '^').replace(/\^\d/g, '^').replace(/\\sqrt\[\d+\]/g, '\\sqrt');
      const set = [...new Set((s.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter(n => Number.isInteger(n) && n >= 2))];
      if (to && set.some(n => n > +to[1] && isPow(n, +to[1]))) return true;
      for (const r of [2, 3, 5, 10]) {
        const ps = set.filter(n => isPow(n, r));
        if (ps.length >= 2 && ps.some(n => n > r)) return true;
      }
    }
    return false;
  }
  // \log_{a}X の a と X（X が数・分数・小数・累乗のとき。ほかは null）
  function logArgs(m) {
    const out = [];
    const re = /\\log_\{?(\d+(?:\.\d+)?)\}?\s*/g;
    let t;
    while ((t = re.exec(m))) {
      const rest = m.slice(re.lastIndex);
      let x = null, p = null, d = 1, k;
      if ((k = /^\\frac\{(\d+)\}\{(\d+)\}/.exec(rest))) { x = k[1] / k[2]; p = +k[1]; d = +k[2]; }
      else if ((k = /^(\d+(?:\.\d+)?)(?:\^\{(-?\d+)\})?/.exec(rest))) {
        x = Math.pow(+k[1], k[2] ? +k[2] : 1);
        if (!k[2]) { const f = (k[1].split('.')[1] || '').length; p = Math.round(+k[1] * Math.pow(10, f)); d = Math.pow(10, f); }
      }
      out.push({ a: +t[1], x, p, d, rest });
    }
    return out;
  }
  // log_a x が整数か、分母が4までの分数になる（指数の形になおせば すぐわかる）
  const exactLog = (a, x) => {
    if (!(x > 0) || !(a > 0) || a === 1) return false;
    const v = Math.log(x) / Math.log(a);
    return [1, 2, 3, 4].some(d => Math.abs(v * d - Math.round(v * d)) < 1e-9);
  };
  // 数 p/q（整数の分数。q をはぶくと小数 x）を 2^i 3^j 10^d に分ける（できなければ null）
  function factor10(p, q) {
    if (q == null) {
      if (!(p > 0)) return null;
      q = 1;
      for (let k = 0; k < 6 && Math.abs(p - Math.round(p)) > 1e-9; k++) { p *= 10; q *= 10; }
      p = Math.round(p);
    }
    const e = { 2: 0, 3: 0, 5: 0 };
    const take = (n, s) => { for (const r of [2, 3, 5]) while (n % r === 0) { n /= r; e[r] += s; } return n; };
    if (take(p, 1) !== 1 || take(q, -1) !== 1) return null;
    // 5 = 10 ÷ 2
    return { i: e[2] - e[5], j: e[3], d: e[5] };
  }
  // 常用対数の近似値が書いてあって、log10 X の X が 2・3・10 の2つ以上でできている（6、15、0.2、2/3 など）
  function composite10(q) {
    if (!/0\.301|0\.477|0\.699/.test(q)) return false;
    return mathsOf(q).some(m => logArgs(m).some(({ a, p, d, rest }) => {
      if (a !== 10 || /^[\d.]+\^/.test(rest)) return false;
      // √ の中（$\log_{10}\sqrt{6}$）も見る
      const sq = /^\\sqrt\{(\d+(?:\.\d+)?)\}/.exec(rest);
      const f = sq ? factor10(+sq[1]) : p != null ? factor10(p, d) : null;
      return !!f && [f.i, f.j, f.d].filter(v => v).length >= 2;
    }));
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // わなの問題に、同じ部のほかのわざが使えるときは、楽な形に「わざ 3-74 で」と書いて also に入れる
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(3).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 5 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    return p;
  }

  // ---------------------------------------------------------------- 3-60
  M.add({
    id: '3-60', part: 5, chap: '3-11③', stars: 1,
    title: 'かけ《算|ざん》は《指数|し|すう》のたし《算|ざん》',
    mark: '**《同|おな》じ《底|てい》**の《累乗|るい|じょう》どうしの**かけ《算|ざん》**（$2^{5}\\times 2^{3}$、$x^{4}\\times x^{3}$）。',
    futsu: ['$2^{5}=32$、$2^{3}=8$ を《先|さき》に《出|だ》して、', '$32\\times 8=256$'],
    raku: ['$2^{5}\\times 2^{3}=2^{5+3}$', '$=2^{8}=256$'],
    why: '2を5《回|かい》かけて、さらに3《回|かい》かけるので、《全部|ぜん|ぶ》で8《回|かい》かける（3-11③）。',
    caution: '《底|てい》がちがう（$2^{3}\\times 3^{2}$）ときや、たし《算|ざん》（$2^{3}+2^{5}$）では、《指数|し|すう》はたせない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    boxw: { s2: '20mm', s3: '24mm' },
    cols: { s3: 1 },
    fits(q) {
      if (/\$\d+\^\{\d+\}=\d+\$\s*を使うと/.test(q) || /秒では/.test(q)) return true;
      if (/倍になり、さらに/.test(q)) return true;
      return maths(q).some(m => /(?<![\d.])(\d+)\^\{[^}]*\}\s*\\times\s*\1\^/.test(m) || /([a-z])\^\{[^}]*\}\s*\\times\s*\d*\1\^/.test(m) || /\^\{[a-z]\+\d+\}/.test(m));
    },
    steps: {
      // 同じ底の2つの累乗のかけ算 → 累乗の形で
      s1(r) {
        const b = r.pick([2, 3, 5, 10, 'x', 'a']), m = r.int(2, 9), n = r.int(2, 9);
        return { q: `${RU(b)}$${pw(b, m)}\\times ${pw(b, n)}$`, a: `$${pw(b, m + n)}$`, easy: `$${pw(b, `${m}+${n}`)}=${pw(b, m + n)}$`, key: `60:${b}:${[m, n].sort()}` };
      },
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {   // 3つの累乗
          const b = r.pick([2, 3, 10, 'x']), e = [r.int(2, 6), r.int(2, 6), r.int(2, 6)], s = e[0] + e[1] + e[2];
          return { q: `${RU(b)}$${e.map(x => pw(b, x)).join('\\times ')}$`, a: `$${pw(b, s)}$`, easy: `$${pw(b, e.join('+'))}=${pw(b, s)}$`, key: `60:${b}:${e.slice().sort()}` };
        }
        if (k === 1) {   // 数がかかった文字の累乗
          const v = r.pick(['x', 'a', 'y']), c = r.int(2, 5), d = r.int(2, 5), m = r.int(2, 6), n = r.int(2, 6);
          return { q: `$${c}${pw(v, m)}\\times ${d}${pw(v, n)}$`, a: `$${c * d}${pw(v, m + n)}$`, easy: `$${c}\\times ${d}\\times ${pw(v, `${m}+${n}`)}=${c * d}${pw(v, m + n)}$` };
        }
        if (k === 2) {   // マイナスの指数
          const b = r.pick([2, 10, 'x']), m = r.int(4, 9), n = r.int(1, m - 1);
          return { q: `${RU(b)}$${pw(b, m)}\\times ${pw(b, -n)}$`, a: `$${pw(b, m - n)}$`, easy: `$${pw(b, `${m}+(-${n})`)}=${pw(b, m - n)}$` };
        }
        // 逆向き：2^{x+3} ＝ □ × 2^x
        const b = r.pick([2, 3, 5, 10]), h = b === 2 ? r.int(2, 5) : r.int(2, 3), v = Math.pow(b, h);
        return { q: `$${pw(b, `x+${h}`)}=□\\times ${pw(b, 'x')}$`, a: String(v), easy: `$${pw(b, h)}=${v}$` };
      },
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {   // わかっている累乗を使う
          const [b, e0, v0, n] = r.pick([[2, 10, 1024, 11], [2, 10, 1024, 12], [2, 10, 1024, 13], [3, 5, 243, 6], [3, 5, 243, 7], [5, 4, 625, 5], [5, 4, 625, 6]]);
          const h = Math.pow(b, n - e0), v = v0 * h;
          return { q: `$${pw(b, e0)}=${v0}$ を《使|つか》うと、$${pw(b, n)}=□$`, a: String(v),easy: `$${pw(b, e0)}\\times ${pw(b, n - e0)}=${v0}\\times ${h}=${v}$` };
        }
        if (k === 1) {   // 指数の □
          const b = r.pick([2, 3, 5, 7, 10]), n = r.int(2, 6), m = r.int(2, 6);
          return { q: `$${pw(b, 'n')}\\times ${pw(b, m)}=${pw(b, m + n)}$ のとき、$n=□$`, a: String(n), easy: `$${m + n}-${m}=${n}$` };
        }
        if (k === 2) {   // 光の進む道のり
          const t = r.int(2, 5);
          return { q: `《光|ひかり》は1《秒|びょう》に《約|やく》$3\\times 10^{8}\\,\\mathrm{m}$《進|すす》む。$10^{${t}}$《秒|びょう》では、《約|やく》 □ m`, a: `$3\\times 10^{${8 + t}}$`, val: `$10^{${8 + t}}$`, easy: `$10^{8}\\times 10^{${t}}=10^{${8 + t}}$` };
        }
        // 細菌：続けてふえると、倍率はかけ算
        const m = r.int(2, 4), n = r.int(2, 5);
        return { q: `${SAIKIN}が、1《時間|じ|かん》で$2^{${m}}$${BAI}になり、さらに2《時間|じ|かん》で$2^{${n}}$${BAI}になった。《全部|ぜん|ぶ》で □ ${BAI}（2の${RUIJO}で）`, a: `$2^{${m + n}}$`, easy: `$2^{${m}}\\times 2^{${n}}=2^{${m + n}}$` };
      },
      // わな：底がちがう・たし算（指数はたせない）
      trap(r) {
        if (r.chance(0.5)) {
          // 指数はそろえない（そろうと (ab)^n にまとめられる）
          const [b, c] = r.pick([[2, 3], [2, 5], [3, 2], [5, 2], [3, 5], [2, 7]]), m = r.int(3, 4), n = 2;
          const x = Math.pow(b, m), y = Math.pow(c, n);
          return dest({ q: `$${pw(b, m)}\\times ${pw(c, n)}$${ATAI}`, a: String(x * y), key: `60t:${[b + '^' + m, c + '^' + n].sort()}` }, '3-60', `《底|てい》がちがう。$${x}\\times ${y}=${x * y}$`);
        }
        const b = r.pick([2, 3]), m = r.int(2, 3), n = r.int(m + 1, b === 2 ? 6 : 4);
        const x = Math.pow(b, m), y = Math.pow(b, n);
        return dest({ q: `$${pw(b, m)}+${pw(b, n)}$${ATAI}`, a: String(x + y) }, '3-60', `たし《算|ざん》。$${x}+${y}=${x + y}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-61
  M.add({
    id: '3-61', part: 5, chap: '3-11③', stars: 1,
    title: '《累乗|るい|じょう》の《累乗|るい|じょう》は《指数|し|すう》のかけ《算|ざん》',
    mark: '**かっこの《累乗|るい|じょう》**を、さらに《累乗|るい|じょう》している（$(a^{m})^{n}$）。',
    futsu: ['$(2^{3})^{2}=8^{2}$', '$=8\\times 8=64$'],
    raku: ['$(2^{3})^{2}=2^{3\\times 2}$', '$=2^{6}=64$'],
    why: '3《回|かい》かけるまとまりが2つで、2を $3\\times 2=6$ 《回|かい》かける（3-11③）。',
    caution: 'かっこのない $2^{3}\\times 2^{2}$ は《指数|し|すう》をたす（$2^{5}$）。かっこの《中|なか》がたし《算|ざん》なら、《先|さき》に《計算|けい|さん》する。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    boxw: { s2: '20mm', s3: '20mm' },
    cols: { s3: 1 },
    fits(q) {
      if (/で\s*\$2\^\{\d+\}\$\s*倍.*では/.test(q) || /辺が\s*\$10\^/.test(q)) return true;
      return maths(q).some(m => /\((?:\d*[a-z]|\d+)\^\{[^}]*\}\)\^/.test(m));
    },
    steps: {
      s1(r) {
        const b = r.pick([2, 3, 5, 10, 'x', 'a']), m = r.int(2, 5), n = r.int(2, 4);
        return { q: `${RU(b)}$(${pw(b, m)})^{${n}}$`, a: `$${pw(b, m * n)}$`, easy: `$${pw(b, `${m}\\times ${n}`)}=${pw(b, m * n)}$` };
      },
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {   // 小さい数は値まで
          const [b, m, n] = r.pick([[2, 2, 2], [2, 2, 3], [2, 3, 2], [2, 4, 2], [2, 2, 4], [3, 2, 2], [10, 2, 2], [10, 3, 2], [5, 2, 2]]);
          const v = Math.pow(b, m * n);
          return { q: `$(${pw(b, m)})^{${n}}$${ATAI}`, a: String(v), easy: `$${pw(b, `${m}\\times ${n}`)}=${pw(b, m * n)}=${v}$` };
        }
        if (k === 1) {   // 累乗の累乗と、かけ算
          const v = r.pick(['x', 'a']), m = r.int(2, 4), n = r.int(2, 3), p = r.int(1, 4);
          const pp = p === 1 ? v : pw(v, p);
          return { q: `$(${pw(v, m)})^{${n}}\\times ${pp}$`, a: `$${pw(v, m * n + p)}$`, easy: `$${pw(v, m * n)}\\times ${pp}=${pw(v, m * n + p)}$` };
        }
        if (k === 2) {   // マイナスの指数
          const m = r.int(1, 3), n = r.int(2, 4);
          return { q: `${RU(10)}$(10^{-${m}})^{${n}}$`, a: `$10^{-${m * n}}$`, easy: `$10^{-${m}\\times ${n}}=10^{-${m * n}}$` };
        }
        // 数と文字の積の累乗
        const c = r.int(2, 3), v = r.pick(['x', 'a']), m = r.int(2, 4), n = r.int(2, 3);
        return { q: `$(${c}${pw(v, m)})^{${n}}$`, a: `$${Math.pow(c, n)}${pw(v, m * n)}$`, easy: `$${pw(c, n)}\\times ${pw(v, `${m}\\times ${n}`)}=${Math.pow(c, n)}${pw(v, m * n)}$` };
      },
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // 細菌：1時間の倍率をくり返す
          const T = r.pick([10, 15, 20, 30]), c = 60 / T, h = r.int(2, 5);
          return { q: `${FUN(T)}ごとに2${BAI}にふえる${SAIKIN}は、1${JIKAN}で$2^{${c}}$${BAI}になる。${h}${JIKAN}では □ ${BAI}（2の${RUIJO}で）`, a: `$2^{${c * h}}$`, easy: `$(2^{${c}})^{${h}}=2^{${c}\\times ${h}}=2^{${c * h}}$` };
        }
        if (k === 1) {   // 立方体の体積
          const m = r.int(1, 4);
          return { q: `1《辺|へん》が$10^{${m}}\\,\\mathrm{cm}$の《立方体|りっ|ぽう|たい》の《体積|たい|せき》は □ $\\mathrm{cm}^{3}$`, a: `$10^{${3 * m}}$`, easy: `$(10^{${m}})^{3}=10^{${m}\\times 3}=10^{${3 * m}}$` };
        }
        // かっこの中の指数を求める
        const b = r.pick([2, 3, 10, 'x']), m = r.int(2, 5), n = r.int(2, 4);
        return { q: `$(${pw(b, 'n')})^{${m}}=${pw(b, m * n)}$ のとき、$n=□$`, a: String(n), easy: `$${m * n}\\div ${m}=${n}$` };
      },
      // わな：かっこの中がたし算・ひき算（先に計算する。指数はかけない）
      trap(r) {
        const b = r.pick([2, 3]), m = r.int(2, 3), c = r.pick([1, -1, 2]), n = 2;
        const inner = Math.pow(b, m) + c;
        if (inner <= 1) return null;
        return dest({ q: `$(${pw(b, m)}${c > 0 ? '+' : '-'}${Math.abs(c)})^{${n}}$${ATAI}`, a: String(inner * inner) }, '3-61', `かっこの《中|なか》がたし《算|ざん》・ひき《算|ざん》。$${inner}^{2}=${inner * inner}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-62
  M.add({
    id: '3-62', part: 5, chap: '3-11③', stars: 1,
    title: 'わり《算|ざん》は《指数|し|すう》のひき《算|ざん》（$a^{0}=1$、$a^{-x}=\\frac{1}{a^{x}}$）',
    mark: '**《同|おな》じ《底|てい》**の《累乗|るい|じょう》の**わり《算|ざん》**、**0《乗|じょう》**、**マイナスの《指数|し|すう》**。',
    futsu: ['$2^{5}\\div 2^{8}=32\\div 256$', '$=\\frac{32}{256}=\\frac{1}{8}$（《約分|やく|ぶん》する）'],
    raku: ['$2^{5}\\div 2^{8}=2^{5-8}$', '$=2^{-3}=\\frac{1}{2^{3}}=\\frac{1}{8}$'],
    why: 'わる《数|かず》の《分|ぶん》だけ、かけた《回数|かい|すう》を《取|と》り《消|け》す。$a^{0}=1$、$a^{-x}=\\frac{1}{a^{x}}$（3-11③）。',
    caution: '《指数|し|すう》をわるのではない（$2^{6}\\div 2^{2}$ は $2^{4}$）。マイナスの《指数|し|すう》は、マイナスの《数|かず》にならない。',
    counts: { s1: 10, s2: 8, s3: 5, trap: 2 },
    boxw: { s3: '20mm' },
    boxh: { s2: '12mm', trap: '12mm' },
    cols: { s3: 1 },
    fits(q) {
      if (/前の数は/.test(q)) return true;
      return maths(q).some(m => /(?<![\d.])(\d+)\^\{[^}]*\}\s*\\div\s*\1\^/.test(m) || /([a-z])\^\{[^}]*\}\s*\\div\s*\1\^/.test(m)
        || /([a-z])\^\{\d+\}\}\{\1\^/.test(m) || /\^\{0\}/.test(m) || /\^\{-\d+\}/.test(m) || /^\\frac\{1\}\{\d+\^\{\d+\}\}$/.test(m.trim()));
    },
    steps: {
      // 累乗のわり算 → 累乗の形で（指数がマイナスになってもよい）
      s1(r) {
        if (r.chance(0.3)) {
          const v = r.pick(['x', 'a']), n = r.int(2, 6), m = r.int(n + 1, 9);
          return { q: `$${pw(v, m)}\\div ${pw(v, n)}$`, a: `$${pw(v, m - n)}$`, easy: `$${pw(v, `${m}-${n}`)}=${pw(v, m - n)}$` };
        }
        const b = r.pick([2, 3, 5, 10]), m = r.int(2, 9), n = r.intNot(2, 9, x => x === m);
        return { q: `${RU(b)}$${pw(b, m)}\\div ${pw(b, n)}$`, a: `$${pw(b, m - n)}$`, easy: `$${pw(b, `${m}-${n}`)}=${pw(b, m - n)}$` };
      },
      // 値を求める（分数・1）
      s2(r) {
        const k = r.int(0, 3);
        const lim = { 2: 6, 3: 4, 5: 3, 10: 3 };
        if (k === 0) {   // a^{-n}
          const b = r.pick([2, 3, 5, 10]), n = r.int(2, lim[b]), v = Math.pow(b, n);
          return { q: `$${pw(b, -n)}$${ATAI}`, a: `$${fr(1, v)}$`, easy: `$${fr(1, pw(b, n))}=${fr(1, v)}$` };
        }
        if (k === 1) {   // a^0
          const b = r.pick([2, 3, 5, 7, 10, 'x', 'a']);
          return { q: `$${pw(b, 0)}$${ATAI}`, a: '1', easy: '0《回|かい》かけると、はじめのまま' };
        }
        if (k === 2) {   // 小さい ÷ 大きい
          const b = r.pick([2, 3, 10]), m = r.int(2, 4), d = r.int(1, lim[b]), n = m + d, v = Math.pow(b, d);
          return { q: `$${pw(b, m)}\\div ${pw(b, n)}$${ATAI}`, a: `$${fr(1, v)}$`, easy: `$${pw(b, `${m}-${n}`)}=${pw(b, -d)}=${fr(1, v)}$` };
        }
        // 1/a^n を累乗の形に
        const b = r.pick([2, 3, 5, 10]), n = r.int(2, 5);
        return { q: `$${fr(1, pw(b, n))}$ を${b}の${RUIJO}で《表|あらわ》すと □`, a: `$${pw(b, -n)}$`, easy: `$${pw(b, `0-${n}`)}=${pw(b, -n)}$` };
      },
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {   // マイナスの数でわる
          const m = r.int(2, 6), n = r.int(1, 4);
          return { q: `${RU(10)}$10^{${m}}\\div 10^{-${n}}$`, a: `$10^{${m + n}}$`, easy: `$10^{${m}-(-${n})}=10^{${m + n}}$` };
        }
        if (k === 1) {   // かけ算とわり算のまじった式
          const v = r.pick(['x', 'a']), p = r.int(2, 5), s = r.int(2, 5), t = r.int(2, p + s - 1);
          return { q: `$${fr(`${pw(v, p)}\\times ${pw(v, s)}`, pw(v, t))}$`, a: `$${pw(v, p + s - t)}$`, easy: `$${pw(v, `${p}+${s}-${t}`)}=${pw(v, p + s - t)}$` };
        }
        if (k === 2) {   // 細菌：さかのぼると、わり算
          const T = r.pick([15, 20, 30]), h = r.int(1, 2), n = h * 60 / T;
          if (n > 8) return null;
          return { q: `${FUN(T)}ごとに2${BAI}の${SAIKIN}の${h}${JIKAN}《前|まえ》の《数|かず》は、いまの □ ${BAI}（2の${RUIJO}で）`, a: `$2^{-${n}}$`, easy: `${n}${KAI}さかのぼるので $2^{-${n}}=${fr(1, Math.pow(2, n))}$`, val: `$2^{-${n}}$` };
        }
        // 長さの単位：km と mm など
        const [big, eb, small, es] = r.pick([['km', 3, 'mm', -3], ['km', 3, 'cm', -2], ['m', 0, 'mm', -3], ['m', 0, 'cm', -2]]);
        const U = u => `\\mathrm{${u}}`;
        const lhs = eb === 0 ? '' : `$1\\,${U(big)}=10^{${eb}}\\,\\mathrm{m}$、`;
        return { q: `${lhs}$1\\,${U(small)}=10^{${es}}\\,\\mathrm{m}$。$1\\,${U(big)}$ は $1\\,${U(small)}$ の □ ${BAI}（10の${RUIJO}で）`, a: `$10^{${eb - es}}$`, easy: `$10^{${eb}}\\div 10^{${es}}=10^{${eb - es}}$` };
      },
      // わな：ひき算・底がちがう（指数はひけない）
      trap(r) {
        if (r.chance(0.5)) {
          const b = r.pick([2, 3]), n = r.int(2, 3), m = r.int(n + 1, b === 2 ? 6 : 4), x = Math.pow(b, m), y = Math.pow(b, n);
          return dest({ q: `$${pw(b, m)}-${pw(b, n)}$${ATAI}`, a: String(x - y) }, '3-62', `ひき《算|ざん》。$${x}-${y}=${x - y}$`);
        }
        // 指数はそろえない（そろうと (a/b)^n にまとめられる）
        const [b, c] = r.pick([[2, 3], [3, 2], [2, 5], [5, 2], [3, 5]]), m = r.int(2, 3), n = 5 - m, x = Math.pow(b, m), y = Math.pow(c, n);
        return dest({ q: `$${fr(pw(b, m), pw(c, n))}$${ATAI}`, a: `$${fr(x, y)}$` }, '3-62', `《底|てい》がちがう。$${fr(x, y)}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-63
  // 2・3・5・10 の累乗になっている底
  const ROOTS = { 2: [[4, 2], [8, 3], [16, 4], [32, 5]], 3: [[9, 2], [27, 3], [81, 4]], 5: [[25, 2], [125, 3]], 10: [[100, 2], [1000, 3]] };
  const LIM63 = { 2: 12, 3: 8, 5: 6, 10: 9 };
  M.add({
    id: '3-63', part: 5, chap: '3-11③の《先|さき》', stars: 2,
    title: '《底|てい》をそろえる',
    mark: '4・8・9・27・100 のように、**ほかの《数|かず》の《累乗|るい|じょう》**になっている《底|てい》がまじっている。',
    futsu: ['$4^{3}\\times 8=64\\times 8$', '$=512$'],
    raku: ['$4=2^{2}$、$8=2^{3}$ なので', '$4^{3}\\times 8=2^{6}\\times 2^{3}$', '$=2^{9}=512$'],
    why: '《底|てい》が《同|おな》じになれば、《指数|し|すう》のたし《算|ざん》・ひき《算|ざん》・かけ《算|ざん》が《使|つか》える（3-11③の《先|さき》）。',
    caution: '2と3、6と4のように、《同|おな》じ《数|かず》の《累乗|るい|じょう》にならない《組|くみ》はそろえられない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    boxw: { s1: '20mm', s3: '24mm' },
    boxh: { s3: '12mm' },
    cols: { s3: 1 },
    fits(q) { return sameRoot(q) || /倍ずつふえる量の\d+回分は/.test(q); },
    steps: {
      // r の累乗で表す
      s1(r) {
        const root = r.pick([2, 2, 3, 3, 5, 10]);
        const [B, k] = r.pick(ROOTS[root]);
        const form = r.int(0, 2);
        if (form === 0) {
          const m = r.int(2, Math.max(2, Math.floor(LIM63[root] / k)));
          return { q: `（${root}の${RUIJO}で）$${pw(B, m)}=□$`, a: `$${pw(root, k * m)}$`, easy: `$(${pw(root, k)})^{${m}}=${pw(root, k * m)}$` };
        }
        const m = r.int(1, 3), n = r.int(1, 3), e = k * m + (form === 1 ? n : -n);
        if (e > LIM63[root] || e < 2 || (m === 1 && n === 1)) return null;
        const op = form === 1 ? '\\times ' : '\\div ';
        const mm = m === 1 ? String(B) : pw(B, m), nn = n === 1 ? String(root) : pw(root, n);
        return { q: `（${root}の${RUIJO}で）$${mm}${op}${nn}=□$`, a: `$${pw(root, e)}$`, easy: `$${pw(root, k * m)}${op}${pw(root, n)}=${pw(root, e)}$` };
      },
      // 値を求める（2つとも、ほかの数の累乗の形）
      s2(r) {
        if (r.chance(0.15)) {   // 9^{1/2} × 27、4^{1/2} × 8 の形（3-66 の分数の指数と）
          const [B, C, root, kb, kc] = r.pick([[9, 27, 3, 2, 3], [4, 8, 2, 2, 3], [16, 8, 2, 4, 3], [4, 32, 2, 2, 5], [25, 125, 5, 2, 3]]), e = kb / 2 + kc, v = Math.pow(root, e);
          return { q: `$${B}^{\\tfrac{1}{2}}\\times ${C}$${ATAI}`, a: String(v), easy: `$${pw(root, kb / 2)}\\times ${pw(root, kc)}=${pw(root, e)}=${v}$` };
        }
        const root = r.pick([2, 2, 2, 3, 3, 5]);
        const [[B1, k1], [B2, k2]] = r.shuffle(ROOTS[root].concat([[root, 1]])).slice(0, 2);
        if (k1 === 1 && k2 === 1) return null;
        const m = r.int(1, 3), n = r.int(1, 3), op = r.pick(['\\times ', '\\div ']);
        if (m === 1 && n === 1) return null;
        const e = k1 * m + (op === '\\times ' ? 1 : -1) * k2 * n;
        if (e < 1 || e > (root === 2 ? 10 : root === 3 ? 6 : 4)) return null;
        const v = Math.pow(root, e);
        const t1 = m === 1 ? String(B1) : pw(B1, m), t2 = n === 1 ? String(B2) : pw(B2, n);
        return { q: `$${t1}${op}${t2}$${ATAI}`, a: String(v), easy: `$${pw(root, k1 * m)}${op}${pw(root, k2 * n)}=${pw(root, e)}=${v}$` };
      },
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // 指数を求める
          const root = r.pick([2, 3]), [B, kb] = r.pick(ROOTS[root].slice(0, 2)), n = r.int(2, 5), e = kb * n;
          const other = r.chance(0.5) || e % 2 ? `${pw(root, e)}` : `${pw(root * root, e / 2)}`;
          if (other.startsWith(String(B) + '^')) return null;
          return { q: `$${pw(B, 'n')}=${other}$ のとき、$n=□$`, a: String(n), easy: `$${pw(root, `${kb}n`)}=${pw(root, e)}$` };
        }
        if (k === 1) {   // 倍率を2倍ずつの回数で
          const [B, kb] = r.pick([[4, 2], [8, 3], [16, 4]]), n = r.int(2, 5);
          return { q: `${B}${BAI}ずつふえる《量|りょう》の${n}${KAI}《分|ぶん》は、2${BAI}ずつふえる《量|りょう》の □ ${KAI}《分|ぶん》`, a: String(kb * n), easy: `$${pw(B, n)}=${pw(2, `${kb}\\times ${n}`)}=${pw(2, kb * n)}$`, val: String(Math.pow(B, n)) };
        }
        // 1/4 の累乗を 1/2 の累乗で
        const [B, kb] = r.pick([[4, 2], [8, 3], [9, 2], [27, 3]]), root = B % 3 ? 2 : 3, n = r.int(2, 4);
        return { q: `（$${fr(1, root)}$ の${RUIJO}で）$\\left(${fr(1, B)}\\right)^{${n}}=□$`, a: `$\\left(${fr(1, root)}\\right)^{${kb * n}}$`, easy: `$\\left(${fr(1, root)}\\right)^{${kb}\\times ${n}}=\\left(${fr(1, root)}\\right)^{${kb * n}}$` };
      },
      // わな：同じ数の累乗にならない組
      trap(r) {
        // 指数をそろえない（同じ指数だと (ab)^n にまとめられてしまう）
        const [b, c] = r.pick([[6, 4], [6, 2], [6, 8], [2, 3], [3, 4], [6, 9], [3, 2]]), m = 2, n = r.pick([1, 3]);
        const x = Math.pow(b, m), y = Math.pow(c, n);
        if (x * y > 2000) return null;
        const t2 = n === 1 ? String(c) : pw(c, n);
        return dest({ q: `$${pw(b, m)}\\times ${t2}$${ATAI}`, a: String(x * y), key: `63t:${b}:${c}:${n}` }, '3-63', `${b}と${c}は《同|おな》じ《数|かず》の${RUIJO}にならない。$${x}\\times ${y}=${x * y}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-64
  const HALF = [
    { name: 'テクネチウム99m', T: 6, u: JIKAN },
    { name: 'セシウム137', T: 30, u: NEN },
    { name: '《炭素|たん|そ》14', T: 5730, u: NEN },
    { name: `ある${BUSSHITSU}`, T: 10, u: '《分|ぷん》' },
    { name: `ある${BUSSHITSU}`, T: 8, u: JIKAN },
  ];
  M.add({
    id: '3-64', part: 5, chap: '3-11①④', stars: 1,
    title: '《倍々|ばい|ばい》・《半減|はん|げん》は「《回数|かい|すう》＝《時間|じ|かん》÷1《回|かい》の《時間|じ|かん》」',
    mark: '「**□《分|ふん》ごとに2《倍|ばい》**」「**《半減期|はん|げん|き》**」と、たった《時間|じ|かん》が《書|か》いてある。',
    futsu: ['20《分|ぷん》ごとに2《倍|ばい》で2《時間|じ|かん》：', '2、4、8、16、…と、《表|ひょう》を《作|つく》ってたどる。'],
    raku: ['$120\\div 20=6$ 《回|かい》なので', '$2^{6}=64$ 《倍|ばい》'],
    why: '1《回|かい》ごとに《同|おな》じ《倍率|ばい|りつ》をかけるので、《回数|かい|すう》だけ《累乗|るい|じょう》する（3-11①④）。',
    caution: '《時間|じ|かん》の《単位|たん|い》（《分|ふん》と《時間|じ|かん》）をそろえる。「□《個|こ》ずつ」ふえるときは、たし《算|ざん》。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    boxh: { s2: '12mm' },
    fits(q) {
      if (/こえる|以下になる|ずつふえる|ずつへる|ずつ下がる|片対数|回分かれた/.test(q)) return false;
      return /ごとに\s*\d+\s*倍/.test(q) || /半減期/.test(q);
    },
    steps: {
      // 倍々：回数＝時間÷1回の時間
      s1(r) {
        const T = r.pick([10, 15, 20, 30, 40]), base = r.pick([2, 2, 2, 3]), n = r.int(3, base === 2 ? 8 : 5), t = T * n;
        if (t > 300 || t < 60) return null;
        const v = Math.pow(base, n);
        return { q: `${FUN(T)}ごとに${base}${BAI}になる${SAIKIN}は、${HM(t)}で □ ${BAI}`, a: String(v), easy: `$${t}\\div ${T}=${n}$ ${KAI}、$${pw(base, n)}=${v}$`, easyCheck: false, verify: () => (Math.pow(base, t / T) === v ? true : 'ちがう') };
      },
      // 半減期
      s2(r) {
        const s = r.pick(HALF), n = r.int(2, 5), t = s.T * n, d = Math.pow(2, n);
        if (r.chance(0.4)) {
          const m0 = r.pick([400, 800, 1600, 3200]);
          // 名前の長いテクネチウム99m は、□ と mg が1行に入らないので、倍を聞く問いだけにする
          if (m0 % d || s.u === JIKAN && s.T === 6) return null;
          return { q: `${HGK}${s.T}${s.u}の${s.name}が ${m0} mg。${t}${s.u}${GO}は □ mg`, a: String(m0 / d), easy: `$${n}$ ${KAI}、$${m0}\\times\\left(${fr(1, 2)}\\right)^{${n}}=${m0 / d}$`, easyCheck: false, verify: () => (m0 * Math.pow(0.5, t / s.T) === m0 / d ? true : 'ちがう') };
        }
        return { q: `${HGK}${s.T}${s.u}の${s.name}は、${t}${s.u}で □ ${BAI}`, a: `$${fr(1, d)}$`, easy: `$${t}\\div ${s.T}=${n}$ ${KAI}、$\\left(${fr(1, 2)}\\right)^{${n}}=${fr(1, d)}$`, easyCheck: false, verify: () => (near(Math.pow(0.5, t / s.T), 1 / d) ? true : 'ちがう') };
      },
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // 逆向き：何年後
          const s = r.pick(HALF), n = r.int(2, 5), d = Math.pow(2, n);
          return { q: `${HGK}${s.T}${s.u}の${s.name}が$${fr(1, d)}$になるのは □ ${s.u}${GO}`, a: String(s.T * n), easy: `$${fr(1, d)}=\\left(${fr(1, 2)}\\right)^{${n}}$ で${n}${KAI}、$${s.T}\\times ${n}=${s.T * n}$`, easyCheck: false, verify: () => (near(Math.pow(0.5, (s.T * n) / s.T), 1 / d) ? true : 'ちがう') };
        }
        if (k === 1) {   // はじめの数がある
          const T = r.pick([15, 20, 30]), n = r.int(3, 6), t = T * n, c0 = r.pick([100, 200, 300, 500, 1000]);
          if (t < 60 || t > 180) return null;
          const v = c0 * Math.pow(2, n);
          return { q: `${FUN(T)}ごとに2${BAI}になる${SAIKIN}${c0}《個|こ》は、${HM(t)}で □ 《個|こ》`, a: String(v), easy: `$${t}\\div ${T}=${n}$ ${KAI}、$${c0}\\times 2^{${n}}=${v}$`, easyCheck: false, verify: () => (c0 * Math.pow(2, t / T) === v ? true : 'ちがう') };
        }
        // 逆向き：何分後
        const T = r.pick([10, 20, 30]), n = r.int(4, 8), v = Math.pow(2, n);
        return { q: `${FUN(T)}ごとに2${BAI}になる${SAIKIN}が${v}${BAI}になるのは □ ${M.fun(T * n)}${GO}`, a: String(T * n), easy: `$${v}=2^{${n}}$ で${n}${KAI}、$${T}\\times ${n}=${T * n}$`, easyCheck: false, verify: () => (Math.pow(2, (T * n) / T) === v ? true : 'ちがう') };
      },
      // わな：同じ数ずつふえる・へる（倍々ではない）
      trap(r) {
        if (r.chance(0.5)) {
          const T = r.pick([10, 20, 30]), d = r.pick([50, 100, 200]), t = r.pick([60, 90, 120]), n = t / T, v = 1 + d * n;
          if (!Number.isInteger(n)) return null;
          return dest({ q: `はじめ1《個|こ》で、${FUN(T)}ごとに${d}《個|こ》ずつふえると、${HM(t)}で □ 《個|こ》`, a: String(v) }, '3-64', `2${BAI}ずつではなく、${d}《個|こ》ずつ。$1+${d}\\times ${n}=${v}$`);
        }
        const L0 = r.pick([100, 120, 150]), d = r.pick([5, 8, 10, 12]), T = r.pick([10, 15, 20]), t = r.pick([60, 90]), n = t / T, v = L0 - d * n;
        if (!Number.isInteger(n) || v <= 0) return null;
        return dest({ q: `${L0} Lの《水|みず》が、${FUN(T)}ごとに${d} Lずつへると、${HM(t)}で □ L`, a: String(v) }, '3-64', `${HGK}ではなく、${d} Lずつ。$${L0}-${d}\\times ${n}=${v}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-65
  const pct = (p, up) => dec(100 + (up ? p : -p), 100);
  M.add({
    id: '3-65', part: 5, chap: '3-11①', stars: 1,
    title: '%でふえる・へるは《倍率|ばい|りつ》をかける',
    mark: '「**□%ずつ**ふえる・へる」（《利息|り|そく》、《値段|ね|だん》が《下|さ》がる、など）。',
    futsu: ['1《年目|ねん|め》の《利息|り|そく》を《出|だ》してたし、', '2《年目|ねん|め》の《利息|り|そく》を《出|だ》してたす。'],
    raku: ['4%ふえる＝1.04《倍|ばい》', '$50000\\times 1.04^{2}=54080$'],
    why: 'ふえる《量|りょう》が、いまある《量|りょう》に《比例|ひ|れい》する。1《回|かい》ごとに $(1+0.04)$ 《倍|ばい》になる（3-11①）。',
    caution: '「□《円|えん》ずつ」のように《同|おな》じ《量|りょう》がふえるときは、たし《算|ざん》。10%ずつ2《回|かい》は、20%ではない。',
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s2: '22mm' },
    fits(q) { return /\d+%/.test(q); },
    steps: {
      // 1回の倍率
      s1(r) {
        const p = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]), up = r.chance(0.5), v = pct(p, up);
        return { q: `${p}%${up ? 'ふえる' : 'へる'} → □ ${BAI}`, a: v, easy: `$1${up ? '+' : '-'}${dec(p, 100)}=${v}$`, key: `65:${p}:${up}` };
      },
      // 2年・3年あと
      s2(r) {
        if (r.chance(0.5)) {   // 貯金
          const P = r.pick([10000, 20000, 40000, 50000, 100000, 200000]), p = r.pick([2, 3, 4, 5, 10, 20]), y = r.pick([2, 2, 3]);
          const num = P * Math.pow(100 + p, y), den = Math.pow(100, y);
          if (num % den) return null;
          const v = num / den, rate = pct(p, true);
          return { q: `《毎年|まい|とし》${p}%の《利息|り|そく》がつく《貯金|ちょ|きん》に${P}《円|えん》。${y}${NEN}${GO}は □ 《円|えん》`, a: String(v), easy: `$${P}\\times ${rate}^{${y}}=${v}$` };
        }
        const P = r.pick([80, 100, 200, 400, 500, 800]), p = r.pick([10, 20, 25, 50]), y = r.pick([2, 3]);
        const num = P * Math.pow(100 - p, y), den = Math.pow(100, y);
        if (num % den) return null;
        const v = num / den, rate = pct(p, false);
        return { q: `${P}《万|まん》《円|えん》の《機械|き|かい》が《毎年|まい|とし》${p}%ずつ《値下|ね|さ》がり。${y}${NEN}${GO}は □ 《万|まん》《円|えん》`, a: String(v), easy: `$${P}\\times ${rate}^{${y}}=${v}$` };
      },
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // 何年で何倍
          const [p, up, y] = r.pick([[10, true, 2], [10, true, 3], [20, true, 2], [30, true, 2], [50, true, 2], [10, false, 2], [10, false, 3], [20, false, 2], [30, false, 2], [20, true, 3]]);
          const rate = pct(p, up), v = dec((100 + (up ? p : -p)) ** y, 100 ** y);
          return { q: `1${NEN}ごとに${p}%ずつ${up ? 'ふえる' : 'へる'}《量|りょう》は、${y}${NEN}で □ ${BAI}`, a: v, easy: `$${rate}^{${y}}=${v}$` };
        }
        if (k === 1) {   // 何％へるか（たし算ではない）
          const [p, y] = r.pick([[10, 2], [20, 2], [30, 2], [50, 2], [10, 3], [20, 3]]);
          const left = (100 - p) ** y, v = dec(100 ** y - left, 100 ** (y - 1));
          const rate = pct(p, false);
          return { q: `1${NEN}ごとに${p}%ずつへる《量|りょう》は、${y}${NEN}で □ %へる`, a: v, easy: `$${rate}^{${y}}=${dec(left, 100 ** y)}$ で、$100-${dec(left, 100 ** (y - 1))}=${v}$`, easyCheck: false, verify: () => (near(100 - 100 * Math.pow(1 - p / 100, y), numOf(v)) ? true : 'ちがう') };
        }
        // ふえてからへる
        const [p, q] = r.pick([[50, 50], [20, 20], [10, 10], [25, 20], [50, 20], [20, 25], [100, 50], [30, 30]]);
        const v = dec((100 + p) * (100 - q), 10000);
        return { q: `${p}%ふえてから${q}%へると、はじめの □ ${BAI}`, a: v, easy: `$${pct(p, true)}\\times ${pct(q, false)}=${v}$`, key: `65s3:${p}:${q}` };
      },
      // わな：同じ量ずつ下がる・のびる（％ではない）
      trap(r) {
        if (r.chance(0.5)) {
          const P = r.pick([80, 100, 120, 150]), d = r.pick([5, 10, 15, 20]), y = r.int(2, 4), v = P - d * y;
          if (v <= 0) return null;
          return dest({ q: `${P}《万|まん》《円|えん》の《機械|き|かい》が《毎年|まい|とし》${d}《万|まん》《円|えん》ずつ《値下|ね|さ》がり。${y}${NEN}${GO}は □ 《万|まん》《円|えん》`, a: String(v) }, '3-65', `%ではなく、《同|おな》じ《金額|きん|がく》ずつ。$${P}-${d}\\times ${y}=${v}$`);
        }
        const L0 = r.pick([50, 80, 100]), d = r.pick([6, 8, 12, 15]), y = r.int(3, 6), v = L0 + d * y;
        return dest({ q: `${L0} cmの《木|き》が《毎年|まい|とし》${d} cmずつのびると、${y}${NEN}${GO}は □ cm`, a: String(v) }, '3-65', `%ではなく、《同|おな》じ《長|なが》さずつ。$${L0}+${d}\\times ${y}=${v}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-66
  const SQ = [[4, 2], [9, 3], [16, 4], [25, 5], [36, 6], [49, 7], [64, 8], [81, 9], [100, 10], [121, 11], [144, 12]];
  M.add({
    id: '3-66', part: 5, chap: '3-11⑤⑥', stars: 1,
    title: '《分数|ぶん|すう》の《指数|し|すう》は $\\sqrt{\\quad}$',
    mark: '《指数|し|すう》が**《分数|ぶん|すう》・《小数|しょう|すう》**（$a^{\\tfrac{1}{2}}$、$a^{1.5}$、$a^{-\\tfrac{1}{2}}$）。',
    futsu: ['$16^{1.5}$ は「1.5《回|かい》かける」？', 'そのままでは《計算|けい|さん》できない。'],
    raku: ['$16^{1.5}=16^{1}\\times 16^{0.5}$', '$=16\\times\\sqrt{16}=16\\times 4=64$'],
    why: '$a^{\\tfrac{1}{2}}$ は、2《乗|じょう》すると $a$ になる《数|かず》なので $\\sqrt{a}$（3-11⑤⑥）。',
    caution: '$9^{\\tfrac{1}{2}}$ は $9\\div 2$ ではない。《底|てい》がマイナスのときは《考|かんが》えない。',
    counts: { s1: 10, s2: 8, s3: 5, trap: 2 },
    cols: { s3: 1 },
    boxw: { s3: '20mm' },
    boxh: { s2: '12mm', trap: '12mm' },
    fits(q) {
      if (/0\.707/.test(q)) return true;
      if (/時間ごとに\s*\d+\s*倍.*(?:30分では|1時間30分では)/.test(q)) return true;
      return mathsOf(q).some(m => !/\\log/.test(m) && (/\^\{-?\\t?frac/.test(m) || /\^\{-?\d+\.\d+\}/.test(m)));
    },
    steps: {
      s1(r) {
        const [n, s] = r.pick(SQ), half = r.chance(0.6) ? '\\tfrac{1}{2}' : '0.5';
        return { q: `$${n}^{${half}}$`, a: String(s), easy: `$\\sqrt{${n}}=${s}$` };
      },
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {   // a^{-1/2}
          const [n, s] = r.pick(SQ.slice(0, 9));
          return { q: `$${n}^{-\\tfrac{1}{2}}$`, a: `$${fr(1, s)}$`, easy: `$${fr(1, `\\sqrt{${n}}`)}=${fr(1, s)}$` };
        }
        if (k === 1) {   // a^{1.5}
          const [n, s] = r.pick([[4, 2], [9, 3], [16, 4], [25, 5], [36, 6], [100, 10]]);
          return { q: `$${n}^{1.5}$`, a: String(n * s), easy: `$${n}^{1}\\times ${n}^{0.5}=${n}\\times ${s}=${n * s}$` };
        }
        if (k === 2) {   // a^{2.5}
          const [n, s] = r.pick([[4, 2], [9, 3], [16, 4]]);
          return { q: `$${n}^{2.5}$`, a: String(n * n * s), easy: `$${n}^{2}\\times ${n}^{0.5}=${n * n}\\times ${s}=${n * n * s}$` };
        }
        // 3乗するともとにもどる数（3-11 もっと）
        const [n, s] = r.pick([[8, 2], [27, 3], [64, 4], [125, 5], [1000, 10]]);
        return { q: `$${n}^{\\tfrac{1}{3}}$`, a: String(s), easy: `$${s}\\times ${s}\\times ${s}=${n}$`, val: String(n) };
      },
      s3(r) {
        if (r.chance(0.4)) {   // 細菌：1時間でn倍 → 30分・1時間30分で
          const [n, s] = r.pick([[4, 2], [9, 3], [16, 4], [25, 5], [100, 10]]), long = r.chance(0.5);
          return { q: `1${JIKAN}ごとに${n}${BAI}になる${SAIKIN}は、${long ? `1${JIKAN}30《分|ぷん》` : '30《分|ぷん》'}では □ ${BAI}`, a: String(long ? n * s : s), easy: long ? `$${n}^{1.5}=${n}\\times ${s}=${n * s}$` : `$${n}^{0.5}=\\sqrt{${n}}=${s}$` };
        }
        // 半減期の途中（0.707 を使う）
        const s = r.pick(HALF.slice(0, 2)), m0 = r.pick([200, 400, 600, 800, 1000, 1200]), h = r.pick([1, 3, 5]);   // 0.5回・1.5回・2.5回
        const t = s.T * h / 2, k = (h - 1) / 2, d = Math.pow(2, k), unit = s.u === NEN ? 'g' : 'mg';
        if (!Number.isInteger(t)) return null;
        const v10 = m0 * 707 / 100 / d;   // 10倍（小数第1位まで）
        if (!Number.isInteger(v10) || v10 % 10 === 0) return null;
        const v = dec(v10, 10);
        const part = k ? `\\left(${fr(1, 2)}\\right)^{${k}}\\times ` : '';
        return { q: `${HGK}${s.T}${s.u}の${s.name}が ${m0} ${unit}。${t}${s.u}${GO}は《約|やく》 □ ${unit}（$\\left(${fr(1, 2)}\\right)^{0.5}=0.707$）`, a: v, easy: `$${['0.5', '1.5', '2.5'][k]}$ ${KAI}、$${m0}\\times ${part}0.707=${v}$`, easyCheck: false, verify: () => (near(m0 * Math.pow(0.5, k) * 0.707, numOf(v)) && Math.abs(m0 * Math.pow(0.5, t / s.T) - numOf(v)) < m0 * 0.001 ? true : 'ちがう') };
      },
      // わな：指数は整数（分数は底の方）・ただのかけ算
      trap(r) {
        if (r.chance(0.5)) {
          const [p, q] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 2], [1, 5]]), n = r.int(2, 3);
          if (Math.pow(q, n) > 64) return null;
          return dest({ q: `$\\left(${fr(p, q)}\\right)^{${n}}$`, a: `$${fr(Math.pow(p, n), Math.pow(q, n))}$` }, '3-66', `《指数|し|すう》は《整数|せい|すう》。$${fr(`${p}^{${n}}`, `${q}^{${n}}`)}=${fr(Math.pow(p, n), Math.pow(q, n))}$`);
        }
        const [n] = r.pick(SQ.slice(0, 6));
        return dest({ q: `$${n}\\times ${fr(1, 2)}$`, a: n % 2 ? `$${fr(n, 2)}$` : String(n / 2) }, '3-66', `ただのかけ《算|ざん》。$\\sqrt{\\quad}$ にしない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-67
  const LOGB = { 2: 8, 3: 5, 5: 4, 10: 6 };
  M.add({
    id: '3-67', part: 5, chap: '3-12①②', stars: 1,
    title: '$\\log_{a}b$ は「$a$ を《何乗|なん|じょう》すると $b$ か」',
    mark: '$\\log_{2}32$、$\\log_{4}2$、$\\log_{10}0.01$ のような **log の《値|あたい》**を《求|もと》める。',
    futsu: ['《電卓|でん|たく》の log のキーは《底|てい》が10だけ。', '$\\log_{2}32$ は、そのままでは《出|で》ない。'],
    raku: ['$2^{\\square}=32$ になおす。', '$2^{5}=32$ なので $\\log_{2}32=5$'],
    why: '$a^{p}=b$ と $\\log_{a}b=p$ は《同|おな》じこと（3-12②）。$\\log_{a}1=0$、$\\log_{a}a=1$。',
    caution: '$\\log_{2}8$ は $8\\div 2$ ではない。0やマイナスの《数|かず》の log はない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s3: 1 },
    boxh: { s2: '12mm' },
    fits(q) {
      if (/y=\\log_/.test(q) || /\d\^\{\\log_/.test(q) || /\\log_\{?(?:\d+|[a-z])\}?\s*[a-z]\s*=\s*\d/.test(q) || /\\log_\{[a-z]\}/.test(q)) return true;
      if (/倍になるのは.*回分かれた/.test(q)) return true;
      return mathsOf(q).some(m => logArgs(m).some(({ a, x }) => x != null && exactLog(a, x)));
    },
    steps: {
      s1(r) {
        const a = r.pick([2, 2, 3, 5, 10]), k = r.int(0, LOGB[a]), b = Math.pow(a, k);
        return { q: `$\\log_{${a}}${b}$`, a: String(k), easy: `$${pw(a, k)}=${b}$`, val: String(b), verify: () => (near(Math.log(b) / Math.log(a), k) ? true : 'ちがう') };
      },
      s2(r) {
        const kk = r.int(0, 2);
        if (kk === 0) {   // 1/b
          const a = r.pick([2, 3, 5]), k = r.int(1, Math.min(4, LOGB[a])), b = Math.pow(a, k);
          return { q: `$\\log_{${a}}${fr(1, b)}$`, a: `$-${k}$`, easy: `$${pw(a, -k)}=${fr(1, b)}$`, val: `$${fr(1, b)}$` };
        }
        if (kk === 1) {   // 0.01 など
          const k = r.int(1, 4), b = dec(1, Math.pow(10, k));
          return { q: `$\\log_{10}${b}$`, a: `$-${k}$`, easy: `$10^{-${k}}=${b}$`, val: b };
        }
        // 底のほうが大きい：答えは分数
        const [a, b, p, q] = r.pick([[4, 2, 1, 2], [9, 3, 1, 2], [16, 4, 1, 2], [25, 5, 1, 2], [100, 10, 1, 2], [8, 2, 1, 3], [27, 3, 1, 3], [1000, 10, 1, 3], [16, 2, 1, 4], [4, 8, 3, 2], [9, 27, 3, 2]]);
        return { q: `$\\log_{${a}}${b}$`, a: `$${fr(p, q)}$`, easy: `$${a}^{\\tfrac{${p}}{${q}}}=${b}$`, val: String(b) };
      },
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {   // log_a x = k の x
          const a = r.pick([2, 3, 5, 10]), n = r.int(2, Math.min(5, LOGB[a])), b = Math.pow(a, n);
          return { q: `$\\log_{${a}}x=${n}$ のとき、$x=□$`, a: String(b), easy: `$${pw(a, n)}=${b}$` };
        }
        if (k === 1) {   // log_a b = k の a
          const a = r.pick([2, 3, 5]), n = r.int(2, Math.min(4, LOGB[a])), b = Math.pow(a, n);
          return { q: `$\\log_{a}${b}=${n}$ のとき、$a=□$`, a: String(a), easy: `$${pw(a, n)}=${b}$`, val: String(b) };
        }
        if (k === 2) {   // 細菌：何回分かれたか
          const n = r.int(4, 10), b = Math.pow(2, n);
          return { q: `1${KAI}ごとに2${BAI}になる${SAIKIN}が${b}${BAI}になるのは、□ ${KAI}《分|わ》かれたとき`, a: String(n), easy: `$\\log_{2}${b}=${n}$`, verify: () => (Math.pow(2, n) === b ? true : 'ちがう') };
        }
        // a^{log_a b} = b
        const a = r.pick([2, 3, 5, 10]), b = r.intNot(2, 9, x => x === a);
        return { q: `$${a}^{\\log_{${a}}${b}}$`, a: String(b), easy: `$\\log_{${a}}${b}$ は、${a}を${b}にする《指数|し|すう》`, verify: () => (near(Math.pow(a, Math.log(b) / Math.log(a)), b) ? true : 'ちがう') };
      },
      // わな：0やマイナスの数の log（ない）
      trap(r) {
        const a = r.pick([2, 3, 5, 10]), x = r.pick([0, -1, -2, -4, -8, -9, -10]);
        return dest({ q: `$\\log_{${a}}${x < 0 ? `(${x})` : x}$`, a: 'ない', verify: () => true }, '3-67', `${a}を《何乗|なん|じょう》しても、0やマイナスにならない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-68
  // 和・差がきりのよい対数になる組（それぞれは整数にならない）
  function sumPairs() {
    const out = [];
    for (const a of [6, 10, 12]) for (let k = 1; k <= 3; k++) {
      const T = Math.pow(a, k);
      for (let x = 2; x * x <= T; x++) if (T % x === 0) {
        const y = T / x;
        if (y > 125 || isPow(x, a) || isPow(y, a) || x === y) continue;
        out.push({ a, x, y, k, op: '+' });
      }
    }
    for (const a of [2, 3, 5, 10]) for (let k = 1; k <= 3; k++) for (const y of [2, 3, 5, 6, 7]) {
      const x = Math.pow(a, k) * y;
      if (x > 400 || isPow(y, a) || isPow(x, a)) continue;
      out.push({ a, x, y, k, op: '-' });
    }
    return out;
  }
  const PAIRS68 = sumPairs();
  M.add({
    id: '3-68', part: 5, chap: '3-12③', stars: 1,
    title: 'log のかけ《算|ざん》はたし《算|ざん》、わり《算|ざん》はひき《算|ざん》',
    mark: '**《同|おな》じ《底|てい》の log のたし《算|ざん》・ひき《算|ざん》**、log の《中|なか》が**かけ《算|ざん》・わり《算|ざん》**。',
    futsu: ['$\\log_{2}12$ と $\\log_{2}3$ は、2を《何乗|なん|じょう》しても', '12や3にならず、《求|もと》められない。'],
    raku: ['$\\log_{2}12-\\log_{2}3=\\log_{2}\\frac{12}{3}$', '$=\\log_{2}4=2$'],
    why: '「かけ《算|ざん》は《指数|し|すう》をたす」（3-11）を、log のことばで《言|い》いなおしたもの（3-12③）。',
    caution: '$\\log(2+3)$ のように、《中|なか》がたし《算|ざん》のときは《分|わ》けられない。《底|てい》がちがう log どうしもまとめられない。',
    counts: { s1: 10, s2: 7, s3: 5, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    fits(q) {
      if (composite10(q)) return true;
      return maths(q).some(m => /\\log_\{?(\d+)\}?[^;]*?[+-]\s*\\log_\{?\1\}?/.test(m) || /\\log_\{?\d+\}?\s*[\d\\{}]+=\\log/.test(m));
    },
    steps: {
      // 和・差を1つの log にして値を出す
      s1(r) {
        const { a, x, y, k, op } = r.pick(PAIRS68);
        const [s, t] = op === '+' && r.chance(0.5) ? [y, x] : [x, y];
        const inner = op === '+' ? `(${s}\\times ${t})` : fr(s, t);
        return { q: `$\\log_{${a}}${s}${op}\\log_{${a}}${t}$`, a: String(k), easy: `$\\log_{${a}}${inner}=\\log_{${a}}${Math.pow(a, k)}=${k}$`, key: `68:${a}:${op}:${op === '+' ? [s, t].sort() : [s, t]}`, verify: () => (near((Math.log(s) + (op === '+' ? 1 : -1) * Math.log(t)) / Math.log(a), k) ? true : 'ちがう') };
      },
      s2(r) {
        if (r.chance(0.5)) {   // □ をうめる
          const a = r.pick([2, 3, 10]), p = r.pick([2, 3, 5, 7]), q = r.pick([3, 5, 7, 11]);
          if (p === q || p === a || q === a) return null;
          if (r.chance(0.5)) return { q: `$\\log_{${a}}${p * q}=\\log_{${a}}${p}+\\log_{${a}}□$`, a: String(q), easy: `$${p}\\times ${q}=${p * q}$`, val: String(p * q), verify: () => true };
          return { q: `$\\log_{${a}}${fr(p, q)}=\\log_{${a}}${p}-\\log_{${a}}□$`, a: String(q), easy: `$${fr(p, q)}=${p}\\div ${q}$`, val: `$${fr(p, q)}$`, verify: () => true };
        }
        // 近似値で：2つの数のかけ算・わり算
        const [arg, i, j, d, how] = r.pick([['6', 1, 1, 0, '2\\times 3'], ['1.5', -1, 1, 0, '\\frac{3}{2}'], [fr(2, 3), 1, -1, 0, '2\\div 3'], ['5', -1, 0, 1, '\\frac{10}{2}'], ['20', 1, 0, 1, '2\\times 10'], ['30', 0, 1, 1, '3\\times 10'], ['0.2', 1, 0, -1, '\\frac{2}{10}'], ['0.3', 0, 1, -1, '\\frac{3}{10}'], [fr(10, 3), 0, -1, 1, '10\\div 3']]);
        const v = lg(i, j, d);
        const given = [i ? L2 : '', j ? L3 : ''].filter(Boolean).join('、');
        return { q: `$\\log_{10}${arg}=□$（${given}）`, a: ans(d3(v)), easy: `$${arg}=${how}$ → $${sum70(i, j, d)}$`, easyCheck: false, verify: () => (near(i * 0.301 + j * 0.477 + d, numOf(d3(v))) && Math.abs(lgTrue(i, j, d) - v / 1000) < 0.002 ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.5)) {   // 3つの log
          const a = r.pick([2, 6, 10]), k = r.int(1, 3), z = r.pick([2, 3, 5, 7]);
          if (isPow(z, a)) return null;
          const T = Math.pow(a, k) * z;
          const divs = []; for (let x = 2; x * x <= T; x++) if (T % x === 0 && !isPow(x, a) && !isPow(T / x, a) && x !== z && T / x !== z && T / x <= 300) divs.push(x);
          if (!divs.length) return null;
          const x = r.pick(divs), y = T / x;
          return { q: `$\\log_{${a}}${x}+\\log_{${a}}${y}-\\log_{${a}}${z}$`, a: String(k), easy: `$\\log_{${a}}${fr(`${x}\\times ${y}`, z)}=\\log_{${a}}${Math.pow(a, k)}=${k}$`, verify: () => (near((Math.log(x) + Math.log(y) - Math.log(z)) / Math.log(a), k) ? true : 'ちがう') };
        }
        // 分数の真数をふくむ
        const y = r.pick([3, 5, 7]), i = r.int(1, 3), j = r.int(1, 3), x = Math.pow(2, i) * y;
        return { q: `$\\log_{2}${x}+\\log_{2}${fr(Math.pow(2, j), y)}$`, a: String(i + j), easy: `$\\log_{2}\\left(${x}\\times ${fr(Math.pow(2, j), y)}\\right)=\\log_{2}${Math.pow(2, i + j)}=${i + j}$`, verify: () => (near(Math.log2(x) + Math.log2(Math.pow(2, j) / y), i + j) ? true : 'ちがう') };
      },
      // わな：log の中のたし算（分けられない。先に計算する）
      trap(r) {
        const [s, v] = r.pick([[7, 845], [11, 1041], [13, 1114]]);
        const x = r.int(2, s - 2), y = s - x;
        if (x > y || y > 9) return null;
        return dest({ q: `$\\log_{10}(${x}+${y})=□$（$\\log_{10}${s}=${dec(v)}$）`, a: dec(v), verify: () => (Math.abs(Math.log10(s) - v / 1000) < 0.001 ? true : 'ちがう') }, '3-68', `たし《算|ざん》の log は《分|わ》けられない。《先|さき》に $${x}+${y}=${s}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-69
  M.add({
    id: '3-69', part: 5, chap: '3-12③', stars: 1,
    title: 'log の《中|なか》の《累乗|るい|じょう》は《前|まえ》に《出|だ》す',
    mark: 'log の《中|なか》が**《累乗|るい|じょう》**（$\\log_{10}2^{10}$、$\\log_{10}\\sqrt{3}$）。',
    futsu: ['$2^{10}=1024$ を《先|さき》に《計算|けい|さん》しても、', '$\\log_{10}1024$ はわからない。'],
    raku: ['$\\log_{10}2^{10}=10\\times\\log_{10}2$', '$=10\\times 0.301=3.01$'],
    why: '$b^{r}$ は $b$ を $r$ 《回|かい》かけるので、log では $r$ 《回|かい》たす（3-12③）。',
    caution: '$(\\log_{10}2)^{3}$ とはちがう。《指数|し|すう》が log の《外|そと》にあるときは、《前|まえ》に《出|だ》せない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1 },
    boxh: { s2: '12mm' },
    fits(q) {
      if (/10の約\s*□\s*乗/.test(q) || /y=(?:\d+\\times\s*)?\d+\^\{x\}.*常用対数/.test(q)) return true;
      return mathsOf(q).some(m => /\\log_\{?\d+\}?\s*(?:\d+|[a-z])\^\{/.test(m) || /\\log_\{?\d+\}?\s*\\sqrt/.test(m) || /\\log_\{?\d+\}?\s*\\frac\{1\}\{\d+\^/.test(m));
    },
    steps: {
      s1(r) {
        if (r.chance(0.3)) {   // ちょうど整数になる
          const [a, b, e] = r.pick([[2, 8, 3], [2, 4, 2], [3, 9, 2], [10, 100, 2], [2, 16, 4], [3, 27, 3], [5, 25, 2], [10, 1000, 3]]), n = r.int(2, 6);
          return { q: `$\\log_{${a}}${b}^{${n}}$`, a: String(e * n), easy: `$${n}\\times\\log_{${a}}${b}=${n}\\times ${e}=${e * n}$` };
        }
        const two = r.chance(0.6), n = two ? r.int(2, 15) : r.int(2, 9), L = two ? 301 : 477;
        const v = n * L;
        return { q: `$\\log_{10}${two ? 2 : 3}^{${n}}=□$（${two ? L2 : L3}）`, a: d3(v), easy: `$${n}\\times ${dec(L)}=${dec(v)}$`, verify: () => (near(n * (two ? 0.301 : 0.477), numOf(d3(v))) ? true : 'ちがう') };
      },
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // √ は 1/2 乗
          const two = r.chance(0.5), L = two ? 301 : 477, v = d4(L * 10 / 2);
          if (r.chance(0.5)) return { q: `$\\log_{10}\\sqrt{${two ? 2 : 3}}=□$（${two ? L2 : L3}）`, a: v, easy: `$${fr(1, 2)}\\times ${dec(L)}=${v}$`, verify: () => (near((two ? 0.301 : 0.477) / 2, numOf(v)) ? true : 'ちがう') };
          const n = r.pick([3, 5]), w = d4(L * 10 * n / 2);
          return { q: `$\\log_{10}\\sqrt{${two ? 2 : 3}^{${n}}}=□$（${two ? L2 : L3}）`, a: w, easy: `$${fr(n, 2)}\\times ${dec(L)}=${w}$`, verify: () => (near((two ? 0.301 : 0.477) * n / 2, numOf(w)) ? true : 'ちがう') };
        }
        if (k === 1) {   // 1/2^n は -n 乗
          const two = r.chance(0.6), n = r.int(2, two ? 6 : 4), L = two ? 301 : 477, v = -n * L;
          return { q: `$\\log_{10}${fr(1, pw(two ? 2 : 3, n))}=□$（${two ? L2 : L3}）`, a: ans(d3(v)), easy: `$-${n}\\times ${dec(L)}=${dec(v)}$`, verify: () => (near(-n * (two ? 0.301 : 0.477), numOf(d3(v))) ? true : 'ちがう') };
        }
        // 累乗根：答えは分数
        const [a, m, j] = r.pick([[2, 3, 2], [2, 2, 1], [2, 2, 3], [2, 2, 5], [3, 2, 3], [3, 3, 2], [10, 3, 1], [10, 2, 3], [5, 2, 3]]);
        const g = (x, y) => (y ? g(y, x % y) : x), c = g(j, m);
        const inner = Math.pow(a, j), root = m === 2 ? `\\sqrt{${inner}}` : `${inner}^{\\tfrac{1}{${m}}}`;
        return { q: `$\\log_{${a}}${root}$`, a: `$${fr(j / c, m / c)}$`, easy: `$${fr(1, m)}\\times\\log_{${a}}${inner}=${fr(1, m)}\\times ${j}=${fr(j / c, m / c)}$` };
      },
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // 10の約何乗
          const two = r.chance(0.6), n = r.int(5, 20), L = two ? 301 : 477, v = d3(n * L);
          return { q: `$${two ? 2 : 3}^{${n}}$ は、10の《約|やく》 □ 《乗|じょう》（${two ? L2 : L3}）`, a: v,easy: `$\\log_{10}${two ? 2 : 3}^{${n}}=${n}\\times ${dec(L)}=${v}$`, easyCheck: false, verify: () => (near(n * (two ? 0.301 : 0.477), numOf(v)) ? true : 'ちがう') };
        }
        if (k === 1) {   // y = a^x の常用対数
          const [b, given, L] = r.pick([[2, L2, 301], [3, L3, 477], [5, L5, 699]]), c = r.pick([1, 1, 3, 5]);
          if (c !== 1) {
            const lc = c === 3 ? '0.477' : '0.699';
            if (c === b) return null;
            return { q: `$y=${c}\\times ${b}^{x}$ の《常用対数|じょう|よう|たい|すう》は、$\\log_{10}y=${lc}+□x$（${given}）`, a: dec(L), easy: `$\\log_{10}${b}^{x}=x\\log_{10}${b}$`, easyCheck: false, verify: () => true };
          }
          return { q: `$y=${b}^{x}$ の《常用対数|じょう|よう|たい|すう》は、$\\log_{10}y=□x$（${given}）`, a: dec(L), easy: `$\\log_{10}${b}^{x}=x\\log_{10}${b}$`, easyCheck: false, verify: () => true };
        }
        // log10 x がわかっているとき
        const [lx, L] = r.pick([['0.301', 301], ['0.477', 477], ['0.699', 699], ['1.2', 1200], ['0.5', 500]]), n = r.int(2, 6);
        return { q: `$\\log_{10}x=${lx}$ のとき、$\\log_{10}x^{${n}}=□$`, a: dec(L * n), easy: `$${n}\\times ${lx}=${dec(L * n)}$`, verify: () => (near(n * parseFloat(lx), numOf(dec(L * n))) ? true : 'ちがう') };
      },
      // わな：log の外の累乗（前に出さない。log を先に出して累乗する）
      trap(r) {
        const [a, b, e] = r.pick([[2, 8, 3], [2, 4, 2], [3, 9, 2], [10, 100, 2], [2, 16, 4], [3, 27, 3], [10, 1000, 3]]), n = r.int(2, 3);
        return dest({ q: `$(\\log_{${a}}${b})^{${n}}$`, a: String(Math.pow(e, n)), easyCheck: false, verify: () => (near(Math.pow(Math.log(b) / Math.log(a), n), Math.pow(e, n)) ? true : 'ちがう') }, '3-69', `《累乗|るい|じょう》が log の《外|そと》。$${e}^{${n}}=${Math.pow(e, n)}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-70
  // 2^i 3^j 10^d でできた数（表す文字と、log の近似値）
  function list70() {
    const out = [];
    for (let i = -3; i <= 4; i++) for (let j = -2; j <= 3; j++) for (let d = -2; d <= 3; d++) {
      const x = Math.pow(2, i) * Math.pow(3, j) * Math.pow(10, d);
      const nz = [i, j, d].filter(v => v).length;
      if (nz < 2 || x < 0.01 || x > 2000) continue;
      // 小数（2けたまで）か整数で書ける数
      let s = null;
      for (let k = 0; k <= 2; k++) { const y = x * Math.pow(10, k); if (Math.abs(y - Math.round(y)) < 1e-9) { s = dec(Math.round(y), Math.pow(10, k)); break; } }
      out.push({ i, j, d, x, s });
    }
    return out;
  }
  const L70 = list70();
  const given70 = (i, j) => [i ? L2 : '', j ? L3 : ''].filter(Boolean).join('、');
  const facTeX = (i, j, d) => {
    const top = [], bot = [];
    const put = (b, e) => { if (e > 0) top.push(e === 1 ? b : pw(b, e)); if (e < 0) bot.push(-e === 1 ? b : pw(b, -e)); };
    put(2, i); put(3, j); put(10, d);
    const T = top.join('\\times ') || '1';
    return bot.length ? fr(T, bot.join('\\times ')) : T;
  };
  const sum70 = (i, j, d) => [i ? `${i === 1 ? '' : i === -1 ? '-' : i + '\\times '}0.301` : '', j ? `${j === 1 ? '' : j === -1 ? '-' : j + '\\times '}0.477` : '', d ? String(d) : ''].filter(Boolean).join('+').replace(/\+-/g, '-');
  function make70(e, arg) {
    const { i, j, d } = e, v = lg(i, j, d);
    const f = facTeX(i, j, d);
    return { q: `$\\log_{10}${arg}=□$（${given70(i, j)}）`, a: ans(d3(v)), easy: `${f === arg ? '' : `$${arg}=${f}$ → `}$${sum70(i, j, d)}$`, easyCheck: false, verify: () => (near(i * 0.301 + j * 0.477 + d, numOf(d3(v))) && Math.abs(lgTrue(i, j, d) - v / 1000) < 0.003 ? true : 'ちがう') };
  }
  M.add({
    id: '3-70', part: 5, chap: '3-12③', stars: 1,
    title: '$\\log_{10}2$・$\\log_{10}3$ で《組|く》み《立|た》てる',
    mark: '2・3・5・10 の**かけ《算|ざん》・わり《算|ざん》**でできた《数|かず》の《常用対数|じょう|よう|たい|すう》。',
    futsu: ['$\\log_{10}18$ は、《電卓|でん|たく》がないと', '《求|もと》められない？'],
    raku: ['$18=2\\times 3^{2}$ なので', '$\\log_{10}18=0.301+2\\times 0.477$', '$=1.255$'],
    why: 'かけ《算|ざん》はたし《算|ざん》、わり《算|ざん》はひき《算|ざん》、《累乗|るい|じょう》はかけ《算|ざん》（3-12③）。5は $\\frac{10}{2}$。',
    caution: '7・11 などをふくむ《数|かず》は、2・3・10 からは《作|つく》れない。',
    counts: { s1: 10, s2: 5, s3: 5, trap: 2 },
    cols: 1,
    boxh: { s3: '12mm' },
    fits(q) { return composite10(q); },
    steps: {
      // 2 と 3 だけの整数
      s1(r) {
        const e = r.pick(L70.filter(e => e.d === 0 && e.i > 0 && e.j > 0 && Number.isInteger(e.x) && e.x <= 200));
        return make70(e, e.s);
      },
      // 10（と5）をふくむ数・小数
      s2(r) {
        const e = r.pick(L70.filter(e => e.d !== 0 && e.s && e.x <= 200 && Math.abs(e.i) <= 2 && Math.abs(e.j) <= 2));
        return make70(e, e.s);
      },
      // 分数・√・大きい数
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const e = r.pick(L70.filter(e => e.d === 0 && (e.i < 0 || e.j < 0) && !e.s));
          const p = Math.pow(2, Math.max(e.i, 0)) * Math.pow(3, Math.max(e.j, 0)), q = Math.pow(2, Math.max(-e.i, 0)) * Math.pow(3, Math.max(-e.j, 0));
          return make70(e, fr(p, q));
        }
        if (k === 1) {   // √（2で割る）
          const [n, i, j] = r.pick([[6, 1, 1], [12, 2, 1], [18, 1, 2], [24, 3, 1], [1.5, -1, 1]]), v = lg(i, j, 0) * 10 / 2;
          const w = d4(v);
          return { q: `$\\log_{10}\\sqrt{${n}}=□$（${given70(i, j)}）`, a: w,easy: `$${fr(1, 2)}\\times\\log_{10}${n}$ → $${fr(1, 2)}\\times(${sum70(i, j, 0)})$`, easyCheck: false, verify: () => (near((i * 0.301 + j * 0.477) / 2, numOf(w)) ? true : 'ちがう') };
        }
        const e = r.pick(L70.filter(e => e.s && (e.x >= 300 || e.x < 0.1)));
        return make70(e, e.s);
      },
      // わな：7・11・13 をふくむ数（2・3・10 では作れない）
      trap(r) {
        const x = r.pick([7, 14, 21, 28, 35, 42, 11, 22, 33, 13, 26, 39, 70, 0.7]);
        const p = [7, 11, 13].find(pp => Math.round(x * 10) % pp === 0);
        return dest({ q: `$\\log_{10}${x}=□$（${L2}、${L3} だけで。できなければ「できない」）`, a: 'できない',verify: () => (factor10(x) === null ? true : 'できる') }, '3-70', `${p}をふくむ`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-71
  // n log10(b) の近似値（1000倍）と、本当の値で、けたの数が同じで、整数すれすれでないもの
  const keta = (L, n, tru) => {
    const v = L * n, ip = Math.floor(v / 1000), f = v - ip * 1000;
    if (f < 15 || f > 985) return null;
    if (Math.floor(n * tru) !== ip) return null;
    return { v, d: ip + 1 };
  };
  M.add({
    id: '3-71', part: 5, chap: '3-12①③', stars: 1,
    title: 'けた《数|すう》は log の《整数|せい|すう》の《部分|ぶ|ぶん》＋1',
    mark: '「$2^{40}$ は**《何|なん》けた**の《数|かず》か」。',
    futsu: ['$2^{40}$ を《全部|ぜん|ぶ》《計算|けい|さん》して、', 'けたを《数|かぞ》える。'],
    raku: ['$\\log_{10}2^{40}=40\\times 0.301=12.04$', '$10^{12}\\leqq 2^{40}<10^{13}$ → 13けた'],
    why: '1000《以上|い|じょう》10000《未満|み|まん》の《数|かず》は4けた。log の《整数|せい|すう》の《部分|ぶ|ぶん》＋1が、けたの《数|かず》（3-12①）。',
    caution: '$10^{3}=1000$ のように log がちょうど《整数|せい|すう》なら、それ＋1（4けた）。',
    counts: { s1: 10, s2: 5, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    fits(q) { return /けた/.test(q) && !/一の位/.test(q); },
    steps: {
      s1(r) {
        const two = r.chance(0.6), n = two ? r.int(15, 100) : r.int(8, 60), L = two ? 301 : 477;
        const z = keta(L, n, Math.log10(two ? 2 : 3));
        if (!z) return null;
        return { q: `$${two ? 2 : 3}^{${n}}$ は □ けた（${two ? L2 : L3}）`, a: String(z.d), easy: `$${n}\\times ${dec(L)}=${dec(z.v)}$`, easyCheck: false, verify: () => (Math.floor(n * (two ? 0.301 : 0.477)) + 1 === z.d && String(BigInt(two ? 2 : 3) ** BigInt(n)).length === z.d ? true : 'ちがう') };
      },
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // 5^n、6^n、4^n、8^n、9^n
          const [b, i, j, d] = r.pick([[5, -1, 0, 1], [6, 1, 1, 0], [4, 2, 0, 0], [8, 3, 0, 0], [9, 0, 2, 0], [12, 2, 1, 0]]), n = r.int(5, 40);
          const L = lg(i, j, d), z = keta(L, n, Math.log10(b));
          if (!z) return null;
          return { q: `$${b}^{${n}}$ は □ けた（${given70(i, j)}）`, a: String(z.d), easy: `$\\log_{10}${b}=${dec(L)}$、$${n}\\times ${dec(L)}=${dec(z.v)}$`, easyCheck: false, verify: () => (String(BigInt(b) ** BigInt(n)).length === z.d ? true : 'ちがう') };
        }
        // 2^a × 3^b
        const a = r.int(5, 30), b = r.int(5, 20), L = 301 * a + 477 * b, ip = Math.floor(L / 1000), f = L - ip * 1000;
        if (f < 15 || f > 985) return null;
        return { q: `$2^{${a}}\\times 3^{${b}}$ は □ けた（${L2}、${L3}）`, a: String(ip + 1), easy: `$${a}\\times 0.301+${b}\\times 0.477=${dec(L)}$`, easyCheck: false, verify: () => (String((2n ** BigInt(a)) * (3n ** BigInt(b))).length === ip + 1 ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.5)) {   // 細菌
          const T = r.pick([10, 20, 30]), h = r.int(5, 12), n = h * 60 / T, z = keta(301, n, Math.log10(2));
          if (!z) return null;
          return { q: `${SAIKIN}1《個|こ》が${FUN(T)}ごとに2${BAI}。${h}${JIKAN}${GO}は □ けた（${L2}）`, a: String(z.d), easy: `$${n}$ ${KAI}、$${n}\\times 0.301=${dec(z.v)}$`, easyCheck: false, verify: () => (String(2n ** BigInt(n)).length === z.d ? true : 'ちがう') };
        }
        // 3倍ずつ n 回
        const n = r.int(10, 40), z = keta(477, n, Math.log10(3));
        if (!z) return null;
        return { q: `1を3${BAI}することを${n}${KAI} → □ けた（${L3}）`, a: String(z.d), easy: `$\\log_{10}3^{${n}}=${n}\\times 0.477=${dec(z.v)}$`, easyCheck: false, verify: () => (String(3n ** BigInt(n)).length === z.d ? true : 'ちがう') };
      },
      // わな：一の位の数（log ではわからない。くり返しを見る）
      trap(r) {
        const b = r.pick([2, 3]), n = r.int(10, 60), cyc = b === 2 ? [6, 2, 4, 8] : [1, 3, 9, 7], v = cyc[n % 4];
        return dest({ q: `$${b}^{${n}}$ の《一|いち》の《位|くらい》の《数|かず》は □`, a: String(v), verify: () => (Number((BigInt(b) ** BigInt(n)) % 10n) === v ? true : 'ちがう') }, '3-71', `けたの《数|かず》ではない。《一|いち》の《位|くらい》は ${b === 2 ? '2、4、8、6' : '3、9、7、1'} のくり《返|かえ》し`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-72
  const LV = { 2: [301, 1, 0, 0], 3: [477, 0, 1, 0], 5: [699, -1, 0, 1], 6: [778, 1, 1, 0], 10: [1000, 0, 0, 1] };
  // ceil(k / L) を近似値と本当の値で
  const firstOver = (lk, la, lkT, laT) => { const n = Math.floor(lk / la) + 1, nT = Math.floor(lkT / laT) + 1; return Math.abs(lk / la - Math.round(lk / la)) < 0.02 || n !== nT ? null : n; };
  M.add({
    id: '3-72', part: 5, chap: '3-12⑤', stars: 1,
    title: '《底|てい》の《変換|へん|かん》で《回数|かい|すう》を《出|だ》す',
    mark: '$\\log_{2}3$ のように《底|てい》が10でない log、「**はじめて□《倍|ばい》をこえる**のは《何|なん》《回目|かい|め》か」。',
    futsu: ['2、4、8、16、…と《倍|ばい》にしていき、', '1000をこえるまで《数|かぞ》える。'],
    raku: ['$\\log_{2}1000=\\frac{\\log_{10}1000}{\\log_{10}2}=\\frac{3}{0.301}$', '$=9.96\\cdots$ → 10《回目|かい|め》'],
    why: '$2^{p}=1000$ の《両辺|りょう|へん》の《常用対数|じょう|よう|たい|すう》をとると、$p\\times 0.301=3$（3-12⑤）。',
    caution: '《回数|かい|すう》は《整数|せい|すう》なので、《小数|しょう|すう》になったら《次|つぎ》の《整数|せい|すう》。ちょうど《整数|せい|すう》（$\\log_{2}8$）なら、わざ 3-67 で。',
    counts: { s1: 8, s2: 5, s3: 5, trap: 2 },
    cols: 1,
    fits(q) {
      if (/はじめて.*(?:こえる|以下になる)/.test(q) && /倍|半減期|％/.test(q)) return true;
      // 底が10でなく、指数の形ではすぐ出ない log（たし算・ひき算でまとめるもの、指数の中の log は除く）
      return maths(q).some(m => !/\\log[^;]*[+-]\s*\\log/.test(m) && !/\^\{\\log/.test(m) && logArgs(stripGiven(m)).some(({ a, x }) => a !== 10 && x > 0 && !exactLog(a, x)));
    },
    steps: {
      // log_a b を小数第2位まで
      s1(r) {
        const a = r.pick([2, 3, 5, 6]), b = r.pick([2, 3, 5, 6, 10]);
        if (a === b) return null;
        const [La, ia, ja] = LV[a], [Lb, ib, jb] = LV[b];
        const x = Lb / La, h = Math.round(x * 100);
        if (Math.abs(x * 100 - Math.floor(x * 100) - 0.5) < 0.1) return null;
        if (Math.round(Math.log(b) / Math.log(a) * 100) !== h) return null;
        const v = (h / 100).toFixed(2);
        const need = { i: ia || ib, j: ja || jb };
        return { q: `$\\log_{${a}}${b}=□$（${SHOSU}2《位|い》まで。${given70(need.i, need.j)}）`, a: v, easy: `$${fr(`\\log_{10}${b}`, `\\log_{10}${a}`)}=${fr(dec(Lb), dec(La))}$`, easyCheck: false, key: `72:${a}:${b}`, verify: () => (Math.round((Lb / 1000) / (La / 1000) * 100) / 100 === h / 100 ? true : 'ちがう') };
      },
      // はじめて 10^k 倍をこえる回数
      s2(r) {
        const b = r.pick([2, 2, 3, 5]), k = r.int(2, 6);
        const [Lb] = LV[b];
        const n = firstOver(k * 1000, Lb, k, Math.log10(b));
        if (!n) return null;
        const big = `$10^{${k}}$`;
        return { q: `${b}${BAI}ずつ：はじめて${big}${BAI}をこえるのは □ ${KAI}《目|め》（${b === 3 ? L3 : b === 5 ? L5 : L2}）`, a: String(n), easy: `$${fr(k, dec(Lb))}=${dec(Math.floor(k * 1000 * 100 / Lb), 100)}\\cdots$`, easyCheck: false, verify: () => (Math.pow(b, n) > Math.pow(10, k) && Math.pow(b, n - 1) <= Math.pow(10, k) ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.5)) {   // 半減期で 1/10^k 以下
          const s = r.pick(HALF.slice(0, 2)), k = r.int(2, 4), n = firstOver(k * 1000, 301, k, Math.log10(2));
          if (!n) return null;
          const tgt = Math.pow(10, k);
          return { q: `${HGK}${s.T}${s.u}で、はじめて$${fr(1, tgt)}$《以下|い|か》になるのは □ ${s.u}${GO}（${L2}）`, a: String(n * s.T), easy: `$2^{n}\\geqq ${tgt}$、$${fr(k, '0.301')}=${dec(Math.floor(k * 100000 / 301), 100)}\\cdots$ で${n}${KAI}`, easyCheck: false, verify: () => (Math.pow(0.5, n) <= 1 / tgt && Math.pow(0.5, n - 1) > 1 / tgt ? true : 'ちがう') };
        }
        // 1.5倍・1.2倍で 2・3・10倍をこえる
        const [rate, Lr, gv] = r.pick([[1.5, 176, '$\\log_{10}1.5=0.176$'], [1.2, 79, '$\\log_{10}1.2=0.079$']]);
        const [tg, Lt, gt] = r.pick([[2, 301, L2], [3, 477, L3], [10, 1000, '']]);
        const n = firstOver(Lt, Lr, Math.log10(tg), Math.log10(rate));
        if (!n) return null;
        return { q: `《毎年|まい|とし》${rate}${BAI}で、はじめて${tg}${BAI}をこえるのは □ ${NEN}${GO}（${[gv, gt].filter(Boolean).join('、')}）`, a: String(n), easy: `$${fr(dec(Lt), dec(Lr))}=${dec(Math.floor(Lt * 100 / Lr), 100)}\\cdots$`, easyCheck: false, verify: () => (Math.pow(rate, n) > tg && Math.pow(rate, n - 1) <= tg ? true : 'ちがう') };
      },
      // わな：同じ数ずつふえる（たし算。log はいらない）
      trap(r) {
        const d = r.pick([3, 4, 6, 7, 8, 9]), lim = r.pick([100, 200, 500]), s = r.pick([1, 2, 5]);
        const n = Math.floor((lim - s) / d) + 1;
        if ((lim - s) % d === 0) return null;
        return dest({ q: `${s}から${d}ずつふやすと、はじめて${lim}をこえるのは □ ${KAI}《目|め》`, a: String(n), val: String(s + d * n), verify: () => (s + d * n > lim && s + d * (n - 1) <= lim ? true : 'ちがう') }, '3-72', `《倍|ばい》ではなく、《同|おな》じ《数|かず》ずつ。$${s}+${d}\\times ${n}=${s + d * n}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-73
  const BIG = k => ['1', '10', '100', '1000', '10000', '100000', '1000000'][k];
  M.add({
    id: '3-73', part: 5, chap: '3-12⑦', stars: 1,
    title: 'デシベルは10《倍|ばい》で10 dB、つなぐとたし《算|ざん》',
    mark: '**《電力|でん|りょく》・《音|おと》の《強|つよ》さ**の《比|ひ》を dB で。**《増幅器|ぞう|ふく|き》をつなぐ**。',
    futsu: ['100《倍|ばい》と1000《倍|ばい》をつなぐと100000《倍|ばい》。', 'その log をとって5、10《倍|ばい》して50 dB。'],
    raku: ['20 dB ＋ 30 dB ＝ 50 dB'],
    why: 'dB は《比|ひ》の《常用対数|じょう|よう|たい|すう》の10《倍|ばい》。かけ《算|ざん》がたし《算|ざん》になる（3-12⑦）。',
    caution: '《同|おな》じ《強|つよ》さの《音|おと》2つは、dB をたさない（2《倍|ばい》なので＋3 dB）。《電圧|でん|あつ》の《比|ひ》は、わざ 3-74。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '22mm' },
    fits(q) { return /dB/.test(q) && !/電圧|音圧/.test(q); },
    steps: {
      s1(r) {
        if (r.chance(0.3)) {   // dB → 倍
          const k = r.int(1, 6);
          return { q: `${DENRYOKU}の《比|ひ》${10 * k} dB → □ ${BAI}`, a: BIG(k), easy: `$${10 * k}\\div 10=${k}$、$10^{${k}}=${BIG(k)}$`, easyCheck: false, verify: () => (near(10 * Math.log10(+BIG(k)), 10 * k) ? true : 'ちがう') };
        }
        const k = r.int(1, 6), down = r.chance(0.25);
        if (down && k > 3) return null;
        return { q: `${DENRYOKU}${down ? `$${fr(1, BIG(k))}$` : BIG(k)}${BAI} → □ dB`, a: down ? `$-${10 * k}$` : String(10 * k), easy: `$10\\times ${down ? `(-${k})` : k}=${down ? -10 * k : 10 * k}$`, verify: () => (near(10 * Math.log10(down ? 1 / +BIG(k) : +BIG(k)), down ? -10 * k : 10 * k) ? true : 'ちがう') };
      },
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // dB をつなぐ
          const a = 10 * r.int(1, 4), b = 10 * r.int(1, 4);
          return { q: `${a} dBと${b} dBの${ZOFUKU}をつなぐと □ dB`, a: String(a + b), easy: `$${a}+${b}=${a + b}$`, key: `73:${[a, b].sort()}` };
        }
        if (k === 1) {   // 倍率の増幅器をつなぐ
          const i = r.int(1, 3), j = r.int(1, 3);
          return { q: `${DENRYOKU}${BIG(i)}${BAI}と${BIG(j)}${BAI}の${ZOFUKU}をつなぐと □ dB`, a: String(10 * (i + j)), easy: `$${10 * i}+${10 * j}=${10 * (i + j)}$`, key: `73:${[10 * i, 10 * j].sort()}` };
        }
        // dB の差 → 強さの比
        const hi = r.pick([60, 70, 80, 90, 100]), lo = r.pick([20, 30, 40, 50]), d = (hi - lo) / 10;
        if (d < 2 || d > 7) return null;
        return { q: `${hi} dBと${lo} dBの《音|おと》の《強|つよ》さは □ ${BAI}ちがう`, a: `$10^{${d}}$`, easy: `$${hi}-${lo}=${hi - lo}$ dB、$10^{${d}}$`, easyCheck: false, verify: () => (near(10 * Math.log10(Math.pow(10, d)), hi - lo) ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.3)) {   // 同じ強さの音を2つ
          const L0 = r.pick([40, 50, 60, 70, 80]);
          return { q: `${L0} dBのスピーカー2《台|だい》を《同|おな》じ《強|つよ》さで《鳴|な》らすと《約|やく》 □ dB（${L2}）`, a: String(L0 + 3), easy: `2${BAI}なので $${L0}+10\\times 0.301$`, easyCheck: false, verify: () => (Math.round(L0 + 10 * 0.301) === L0 + 3 ? true : 'ちがう') };
        }
        // 2^i × 10^j 倍は約 3i + 10j dB
        const i = r.pick([1, 2, 3, -1]), j = r.int(0, 2);
        const x = Math.pow(2, i) * Math.pow(10, j);
        if (x < 0.4) return null;
        const v = Math.round(10 * (i * 0.301 + j));
        const xs = Number.isInteger(x) ? String(x) : `$${fr(1, 1 / x)}$`;
        if (!Number.isInteger(x) && !Number.isInteger(1 / x)) return null;
        return { q: `${DENRYOKU}${xs}${BAI} → 《約|やく》 □ dB（${L2}）`, a: ans(String(v)), easy: `$10\\times(${sum70(i, 0, j)})$`, easyCheck: false, verify: () => (Math.round(10 * Math.log10(x)) === v && v === 3 * i + 10 * j ? true : 'ちがう') };
      },
      // わな：電圧の比（20倍。→ 3-74）・電池をつなぐ（dB ではなく、電圧のたし算）
      trap(r) {
        if (r.chance(0.5)) {
          const k = r.int(1, 3);
          return dest({ q: `${DENATSU}${BIG(k)}${BAI} → □ dB`, a: String(20 * k) }, '3-73', `《電力|でん|りょく》ではなく《電圧|でん|あつ》。$20\\times ${k}=${20 * k}$`);
        }
        const [v0, n] = [r.pick([1.5, 1.2, 9]), r.int(2, 6)];
        const v = dec(Math.round(v0 * 10) * n, 10);
        return dest({ q: `${v0} Vの《電池|でん|ち》${HON(n)}を《直列|ちょく|れつ》につなぐと □ V`, a: v, verify: () => (near(v0 * n, numOf(v)) ? true : 'ちがう') }, '3-73', `dB ではない。《電圧|でん|あつ》のたし《算|ざん》 $${v0}\\times ${n}=${v}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-74
  M.add({
    id: '3-74', part: 5, chap: '3-12⑦', stars: 1,
    title: '《電圧|でん|あつ》の《比|ひ》は20《倍|ばい》で dB',
    mark: '**《電圧|でん|あつ》**・《音圧|おん|あつ》の《比|ひ》を dB で（《電力|でん|りょく》は《電圧|でん|あつ》の2《乗|じょう》に《比例|ひ|れい》）。',
    futsu: ['《電圧|でん|あつ》1000《倍|ばい》 → 《電力|でん|りょく》は $1000^{2}=10^{6}$ 《倍|ばい》', '→ $10\\times 6=60$ dB'],
    raku: ['$20\\times\\log_{10}1000=20\\times 3$', '$=60$ dB'],
    why: '《電力|でん|りょく》は《電圧|でん|あつ》の2《乗|じょう》。$10\\log_{10}k^{2}=20\\log_{10}k$（3-12⑦）。',
    caution: '《電力|でん|りょく》・《音|おと》の《強|つよ》さの《比|ひ》は10《倍|ばい》（わざ 3-73）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s2: '20mm' },
    fits(q) { return (/dB/.test(q) && /電圧|音圧/.test(q)) || /電圧\d+倍と\d+倍の増幅器/.test(q); },
    steps: {
      s1(r) {
        const k = r.int(1, 5), down = r.chance(0.2), what = r.chance(0.8) ? DENATSU : '《音圧|おん|あつ》';
        if (down && k > 2) return null;
        return { q: `${what}${down ? `$${fr(1, BIG(k))}$` : BIG(k)}${BAI} → □ dB`, a: down ? `$-${20 * k}$` : String(20 * k), easy: `$20\\times ${down ? `(-${k})` : k}=${down ? -20 * k : 20 * k}$`, verify: () => (near(20 * Math.log10(+BIG(k)), 20 * k) ? true : 'ちがう') };
      },
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // dB → 電圧の比
          const d = 20 * r.int(1, 4);
          return { q: `${DENATSU}の《比|ひ》${d} dBのとき、${DENATSU}は □ ${BAI}`, a: BIG(d / 20), easy: `$${d}\\div 20=${d / 20}$、$10^{${d / 20}}$`, easyCheck: false, verify: () => (near(20 * Math.log10(+BIG(d / 20)), d) ? true : 'ちがう') };
        }
        if (k === 1) {   // dB → 電力の比
          const d = 20 * r.int(1, 3);
          return { q: `${DENATSU}の《比|ひ》${d} dBのとき、${DENRYOKU}は □ ${BAI}`, a: BIG(d / 10), easy: `$${d}\\div 10=${d / 10}$、$10^{${d / 10}}$`, easyCheck: false, verify: () => (near(10 * Math.log10(+BIG(d / 10)), d) ? true : 'ちがう') };
        }
        // 2倍・4倍・1/2 は約 6 dB ずつ
        const i = r.pick([1, 2, 3, -1]), v = Math.round(20 * i * 0.301);
        const xs = i > 0 ? String(Math.pow(2, i)) : `$${fr(1, 2)}$`;
        return { q: `${DENATSU}${xs}${BAI} → 《約|やく》 □ dB（${L2}）`, a: ans(String(v)), easy: `$20\\times ${i === 1 ? '' : i === -1 ? '(-1)\\times ' : i + '\\times '}0.301$`, easyCheck: false, verify: () => (Math.round(20 * i * Math.log10(2)) === v ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.5)) {   // 電圧の増幅器をつなぐ
          const i = r.int(1, 3), j = r.int(1, 3);
          return { q: `${DENATSU}${BIG(i)}${BAI}と${BIG(j)}${BAI}の${ZOFUKU}をつなぐと □ dB`, a: String(20 * (i + j)), easy: `$${20 * i}+${20 * j}=${20 * (i + j)}$`, key: `74:${[i, j].sort()}` };
        }
        const i = r.int(1, 2), j = r.int(1, 2);
        return { q: `${DENATSU}${BIG(i)}${BAI}と${BIG(j)}${BAI}の${ZOFUKU}をつなぐと、${DENRYOKU}は □ ${BAI}`, a: `$10^{${2 * (i + j)}}$`, easy: `$${20 * i}+${20 * j}=${20 * (i + j)}$ dB、$${20 * (i + j)}\\div 10=${2 * (i + j)}$`, easyCheck: false, key: `74p:${[i, j].sort()}`, verify: () => (near(10 * Math.log10(Math.pow(Math.pow(10, i + j), 2)), 20 * (i + j)) ? true : 'ちがう') };
      },
      // わな：電力の比（10倍。→ 3-73）
      trap(r) {
        const k = r.int(1, 5);
        return dest({ q: `${DENRYOKU}${BIG(k)}${BAI} → □ dB`, a: String(10 * k) }, '3-74', `《電圧|でん|あつ》ではなく《電力|でん|りょく》。$10\\times ${k}=${10 * k}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-97
  const SLOPE = [[301, 2, L2], [477, 3, L3], [699, 5, L5], [1000, 10, ''], [2000, 100, ''], [3000, 1000, ''], [845, 7, '$\\log_{10}7=0.845$'], [4000, 10000, '']];
  const KATA = '《片対数|かた|たい|すう》グラフ';
  const giv = g => (g ? `（${g}）` : '');
  M.add({
    id: '3-97', part: 5, chap: '3-12⑥', stars: 1,
    title: '《片対数|かた|たい|すう》グラフの《傾|かたむ》きから《倍率|ばい|りつ》',
    mark: '《片対数|かた|たい|すう》グラフ（たて《軸|じく》が $\\log_{10}y$）の**《直線|ちょく|せん》の《傾|かたむ》き**から、1つ《進|すす》むごとの《倍率|ばい|りつ》を《出|だ》す。',
    futsu: ['グラフから $y$ の《値|あたい》を《読|よ》んで、', 'わり《算|ざん》で《倍率|ばい|りつ》を《出|だ》す。'],
    raku: ['《傾|かたむ》き0.301 → $10^{0.301}=10^{\\log_{10}2}$', '$=2$ 《倍|ばい》ずつ'],
    why: '$\\log_{10}y$ が $d$ ふえることは、$y$ が $10^{d}$ 《倍|ばい》になること（3-12⑥、$a^{\\log_{a}b}=b$）。',
    caution: 'ふつうのグラフ（《目|め》もりが《同|おな》じ《間|ま》かく）の《傾|かたむ》きは、ふえる《量|りょう》で、《倍率|ばい|りつ》ではない。',
    counts: { s1: 8, s2: 5, s3: 5, trap: 2 },
    cols: 1,
    fits(q) { return /片対数/.test(q); },
    steps: {
      // 傾き → 1つ進むごとの倍率
      s1(r) {
        const [d, f, g] = r.pick(SLOPE);
        return { q: `${KATA}の《傾|かたむ》き${dec(d)} → □ ${BAI}ずつ${giv(g)}`, a: String(f), easy: `$10^{${dec(d)}}=${f}$`, easyCheck: false, verify: () => (Math.abs(Math.log10(f) - d / 1000) < 0.001 ? true : 'ちがう') };
      },
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {   // いくつか進む
          const [d, f, g] = r.pick(SLOPE.slice(0, 3)), n = r.int(2, 4), v = Math.pow(f, n);
          return { q: `${KATA}の《傾|かたむ》き${dec(d)}。${n}つ《進|すす》むと □ ${BAI}${giv(g)}`, a: String(v), easy: `$${f}^{${n}}=${v}$`, easyCheck: false, verify: () => (Math.abs(n * d / 1000 - Math.log10(v)) < 0.003 ? true : 'ちがう') };
        }
        if (k === 1) {   // 組み立てた傾き
          const [d, f, i, j] = r.pick([[602, 4, 2, 0], [778, 6, 1, 1], [954, 9, 0, 2], [903, 8, 3, 0], [1301, 20, 1, 0], [1477, 30, 0, 1]]);
          return { q: `${KATA}の《傾|かたむ》き${dec(d)} → □ ${BAI}ずつ（${given70(i, j)}）`, a: String(f), easy: `$${dec(d)}=\\log_{10}${f}$`, easyCheck: false, verify: () => (Math.abs(Math.log10(f) - d / 1000) < 0.002 ? true : 'ちがう') };
        }
        // 傾きがマイナス（へる）
        const [d, f, g] = r.pick([SLOPE[0], SLOPE[2], SLOPE[3]]);
        return { q: `${KATA}の《傾|かたむ》き$-${dec(d)}$ → □ ${BAI}ずつ${giv(g)}`, a: dec(1000 / f), easy: `$10^{-${dec(d)}}=${fr(1, f)}=${dec(1000 / f)}$`, easyCheck: false, verify: () => (Math.abs(Math.log10(1 / f) + d / 1000) < 0.001 ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.4)) {   // 倍率 → 傾き
          const [d, f, g] = r.pick(SLOPE.slice(0, 4));
          return { q: `${f}${BAI}ずつふえる《量|りょう》の${KATA}の《傾|かたむ》きは □ ${giv(g)}`, a: dec(d), easy: `$\\log_{10}${f}=${dec(d)}$`, easyCheck: false, verify: () => (Math.abs(Math.log10(f) - d / 1000) < 0.001 ? true : 'ちがう') };
        }
        // 2点から傾きを出す
        const [d, f, g] = r.pick(SLOPE.slice(0, 3)), n = r.int(2, 5), y0 = r.pick([0, 1000, 2000]);
        return { q: `${KATA}：${n}つ《進|すす》むと $\\log_{10}y$ が$${dec(y0)}\\to ${dec(y0 + n * d)}$。□ ${BAI}ずつ（${g}）`, a: String(f), easy: `$(${dec(y0 + n * d)}-${dec(y0)})\\div ${n}=${dec(d)}$`, easyCheck: false, verify: () => (Math.abs(Math.log10(f) - d / 1000) < 0.001 ? true : 'ちがう') };
      },
      // わな：ふつうのグラフの傾き（ふえる量。1次関数）
      trap(r) {
        const d = r.pick([2, 3, 5, 0.5, 1.5]), y0 = r.pick([1, 2, 10, 20]), t = r.int(3, 10);
        const v = dec(Math.round((y0 + d * t) * 10), 10);
        return dest({ q: `ふつうのグラフの《傾|かたむ》き${d}の《直線|ちょく|せん》。$y=${y0}$ から${t}つ《進|すす》むと $y=□$`, a: v, verify: () => (near(y0 + d * t, numOf(v)) ? true : 'ちがう') }, '3-97', `《片対数|かた|たい|すう》ではない。1《次関数|じ|かん|すう》 $${y0}+${d}\\times ${t}=${v}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-98
  // 0 < x < 1 で log10 x ＝ -L（L は 1000倍）のとき、はじめて0でない位
  const firstPlace = (L, tru) => { const p = Math.ceil(L / 1000), f = L % 1000; if (f < 15 || f > 985) return null; return Math.ceil(tru - 1e-12) === p ? p : null; };
  M.add({
    id: '3-98', part: 5, chap: '3-12①の《先|さき》', stars: 2,
    title: '《小数|しょう|すう》ではじめて0でない《位|くらい》',
    mark: 'とても《小|ちい》さい《数|かず》が、**《小数第|しょう|すう|だい》《何位|なん|い》**ではじめて0でないか。',
    futsu: ['$\\frac{1}{2}$ を20《回|かい》かけて、', '《小数|しょう|すう》を《書|か》き《出|だ》す。'],
    raku: ['$\\log_{10}\\left(\\frac{1}{2}\\right)^{20}=-20\\times 0.301=-6.02$', '$10^{-7}\\leqq\\left(\\frac{1}{2}\\right)^{20}<10^{-6}$ → 《小数第|しょう|すう|だい》7《位|い》'],
    why: '$10^{-7}=0.0000001$。log が $-7$ 《以上|い|じょう》 $-6$ 《未満|み|まん》なら7《位|い》（3-12①の《先|さき》）。',
    caution: '$-6.02$ より《小|ちい》さい《整数|せい|すう》 $-7$ を《見|み》る（$-6$ ではない）。',
    counts: { s1: 9, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    fits(q) { return /はじめて0でない/.test(q) && !/^\$1-/.test(q.trim()); },
    steps: {
      s1(r) {
        const two = r.chance(0.6), n = two ? r.int(10, 60) : r.int(6, 40), L = (two ? 301 : 477) * n;
        const p = firstPlace(L, n * Math.log10(two ? 2 : 3));
        if (!p) return null;
        return { q: `$\\left(${fr(1, two ? 2 : 3)}\\right)^{${n}}$ は${SHOSU} □ 《位|い》ではじめて0でない（${two ? L2 : L3}）`, a: String(p), easy: `$-${n}\\times ${two ? '0.301' : '0.477'}=-${dec(L)}$`, easyCheck: false, verify: () => (Math.ceil(n * (two ? 0.301 : 0.477)) === p ? true : 'ちがう') };
      },
      s2(r) {
        const [base, Lb, tru, i, j, how] = r.pick([['0.2', 699, Math.log10(5), 1, 0, '\\log_{10}0.2=0.301-1'], ['0.3', 523, Math.log10(10 / 3), 0, 1, '\\log_{10}0.3=0.477-1'], ['0.5', 301, Math.log10(2), 1, 0, '\\log_{10}0.5=-0.301']]);
        const n = r.int(8, 40), L = Lb * n, p = firstPlace(L, n * tru);
        if (!p) return null;
        return { q: `$${base}^{${n}}$ は${SHOSU} □ 《位|い》ではじめて0でない（${given70(i, j)}）`, a: String(p), easy: `$${how}$、$-${n}\\times ${dec(Lb)}=-${dec(L)}$`, easyCheck: false, verify: () => (Math.ceil(n * Lb / 1000) === p ? true : 'ちがう') };
      },
      s3(r) {
        if (r.chance(0.5)) {   // 半減期
          const s = r.pick(HALF.slice(0, 2)), n = r.int(10, 30), t = s.T * n, L = 301 * n, p = firstPlace(L, n * Math.log10(2));
          if (!p) return null;
          return { q: `${HGK}${s.T}${s.u}で${t}${s.u}${GO}ののこり（はじめを1）は、${SHOSU} □ 《位|い》ではじめて0でない（${L2}）`, a: String(p), easy: `$${n}$ ${KAI}、$-${n}\\times 0.301=-${dec(L)}$`, easyCheck: false, verify: () => (Math.ceil(n * 0.301) === p ? true : 'ちがう') };
        }
        // フィルター
        const [f, Lf, g, tru] = r.pick([[2, 301, L2, Math.log10(2)], [3, 477, L3, Math.log10(3)]]), n = r.int(8, 30), L = Lf * n, p = firstPlace(L, n * tru);
        if (!p) return null;
        return { q: `《光|ひかり》を$${fr(1, f)}$にするフィルター${n}《枚|まい》ののこりは、${SHOSU} □ 《位|い》ではじめて0でない（${g}）`, a: String(p), easy: `$\\left(${fr(1, f)}\\right)^{${n}}$、$-${n}\\times ${dec(Lf)}=-${dec(L)}$`, easyCheck: false, verify: () => (Math.ceil(n * Lf / 1000) === p ? true : 'ちがう') };
      },
      // わな：1 からひいた数（0.999…。log はいらない）
      trap(r) {
        const b = r.pick([2, 3]), n = r.int(10, 40);
        return dest({ q: `$1-\\left(${fr(1, b)}\\right)^{${n}}$ は${SHOSU} □ 《位|い》ではじめて0でない`, a: '1', verify: () => true }, '3-98', '1から《小|ちい》さい《数|かず》をひくので0.99…。log はいらない');
      },
    },
  });
})(globalThis.MONDAI);
