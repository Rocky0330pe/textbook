/* 問題集 第2巻　第3部 比・割合・はかった数（わざ 2-29〜2-43、2-94〜2-97）　組 c
 * 書き方は v1/README.md と v2/README.md。文は教科書 第2巻と同じ（ルビつき、分かち書きなし）。式は $…$。
 * 小数は浮動小数点でずれるので、整数（10倍・100倍・1000倍）か M.F で計算してから文字にする。
 * 比・単位つき・がい数・ことばの答えは verify で確かめる。
 * 第29回：わなは、同じ部のほかのわざで楽にならないものにする。当たるときは、楽な形に行き先を書いて also（dest）。
 *   入れかえただけで同じになる問題には key（H-6）。 */
(function (M) {
  'use strict';
  const F = M.F;
  const gcd = (a, b) => F.gcd(a, b);
  const lcm = (a, b) => F.lcm(a, b);
  const gcdA = v => v.reduce((x, y) => gcd(x, y));

  // ---------------------------------------------------------------- 小数の文字（整数 n を 10^k でわった数）
  // dec(92, 3) → '0.092'、dec(1460, 2) → '14.60'（けたをそろえる）、decT は終わりの0をとる
  const dec = (n, k) => {
    const neg = n < 0;
    let t = String(Math.abs(n));
    if (k > 0) { t = t.padStart(k + 1, '0'); t = t.slice(0, -k) + '.' + t.slice(-k); }
    return (neg ? '-' : '') + t;
  };
  const decT = (n, k) => { let s = dec(n, k); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
  // 四捨五入（n は正の整数、step の倍数に）
  const roundTo = (n, step) => Math.floor((n + step / 2) / step) * step;
  const ok = (c, msg) => () => (c ? true : msg);
  const nin = n => (n === 1 ? 'ひとり' : n === 2 ? 'ふたり' : `${n}《人|にん》`);   // 1人・2人は「ひとり」「ふたり」（J-3）
  const KATA = { 小数: '《小数|しょう|すう》', 分数: '《分数|ぶん|すう》' };
  // 分数を、終わる小数の文字に（終わらなければ null）
  const fracDec = x => { for (let k = 0; k <= 6; k++) { const t = x[0] * Math.pow(10, k) / x[1]; if (Number.isInteger(t)) return decT(t, k); } return null; };

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(2).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 3 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (!also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    return p;
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  const maths = q => (q.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  // 「$a:b=c:d$」で1つが □（か x）。{ t: [a,b,c,d]（□は NaN）, k: □の場所 }
  function propo(q) {
    const m = q.match(/\$(□|x|\d+(?:\.\d+)?):(□|x|\d+(?:\.\d+)?)=(□|x|\d+(?:\.\d+)?):(□|x|\d+(?:\.\d+)?)\$/);
    if (!m) return null;
    const t = m.slice(1, 5);
    const ks = t.map((x, i) => (x === '□' || x === 'x' ? i : -1)).filter(i => i >= 0);
    if (ks.length !== 1) return null;
    return { t: t.map(Number), k: ks[0] };
  }
  // わかっている2つの組（ななめでなく、前どうし・後ろどうし）が整数倍か。
  // □のない比を先にかんたんにすると整数倍になる（$8:6=12:□$ → $4:3$ で3倍）ときも、何倍かが見える
  function multVisible(P) {
    const [x, y] = (P.k === 1 || P.k === 3) ? [P.t[0], P.t[2]] : [P.t[1], P.t[3]];
    if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
    if (y % x === 0 || x % y === 0) return true;
    const full = P.k <= 1 ? [P.t[2], P.t[3]] : [P.t[0], P.t[1]];
    if (!full.every(Number.isInteger)) return false;
    const [inFull, other] = P.k >= 2 ? [x, y] : [y, x];
    return other % (inFull / gcd(full[0], full[1])) === 0;
  }
  // 「AとBを$p:q$で…Aが$X\,\mathrm{u}$なら、Bは$□\,\mathrm{u}$」（全体・ちがいではない）
  function wordProp(q) {
    if (/合わせて|全体|分け|ちがい|作/.test(q)) return null;
    const m = q.match(/\$(\d+):(\d+)\$[^$]*\$(\d+)\\,\\mathrm\{[^}]*\}\$[^□]*\$□/);
    return m ? { p: +m[1], q: +m[2], X: +m[3] } : null;
  }
  const NICE = { '50': [1, 2], '25': [1, 4], '75': [3, 4], '20': [1, 5], '40': [2, 5], '60': [3, 5], '80': [4, 5], '12.5': [1, 8], '37.5': [3, 8], '62.5': [5, 8], '87.5': [7, 8] };
  // 2-96 で楽になる％（2けたの 24％・36％ なども、10％×3＋1％×6 のように組み合わせられる。R1-9）
  const P96 = ['5', '15', '30', '35', '45', '11', '9', '21', '12', '19', '2', '3', '24', '26', '28', '32', '34', '36'];
  // 「X…の$p\%$」の [X, p]（X は式か、ただの数）。なければ null
  function ofPct(q) {
    const m = q.match(/(?:\$(\d+(?:\.\d+)?)(?:\\,\\mathrm\{[^}]*\})?\$|(\d+))(?:円|人|まい|こ)?(?:のうち|の)\$(\d+(?:\.\d+)?)\\%\$/);
    return m ? [m[1] || m[2], m[3]] : null;
  }

  // ================================================================ 2-29
  M.add({
    id: '2-29', part: 3, chap: '2-5①', stars: 1,
    title: '《比|ひ》は《最大公約数|さい|だい|こう|やく|すう》でわって、かんたんに',
    mark: '《比|ひ》の《両方|りょう|ほう》に**《共通|きょう|つう》の《約数|やく|すう》**がある。いちばん《大|おお》きい《共通|きょう|つう》の《約数|やく|すう》（《最大公約数|さい|だい|こう|やく|すう》）でわれば、1《回|かい》ですむ。',
    futsu: ['$12:18$ を2でわって $6:9$。', 'まだわれるので、3でわって', '$2:3$。《何|なん》《回|かい》もわる。'],
    raku: ['12と18の《最大公約数|さい|だい|こう|やく|すう》は6。', '$12:18=(12\\div6):(18\\div6)$', '$\\phantom{12:18}=2:3$'],
    why: '《比|ひ》の《両方|りょう|ほう》を《同|おな》じ《数|かず》でわっても、《比|ひ》の《値|あたい》は《変|か》わらない（《教科書|きょう|か|しょ》 2-5①）。《最大公約数|さい|だい|こう|やく|すう》でわれば、1《回|かい》でいちばん《小|ちい》さな《整数|せい|すう》の《比|ひ》になる。',
    caution: '《共通|きょう|つう》の《約数|やく|すう》がない《比|ひ》（$7:9$）は、もうかんたんになっている。',
    counts: { s1: 10, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '20mm',
    fits(q) {
      const m = q.match(/^\$(\d+(?::\d+)+)=□\$$/);
      if (m) return gcdA(m[1].split(':').map(Number)) > 1;
      if (!/かんたんに/.test(q) || /\\frac|\d\.\d/.test(q)) return false;
      const v = maths(q).map(t => t.replace(/\\,\\mathrm\{[^}]*\}/, '')).filter(t => /^\d+$/.test(t)).map(Number);
      return v.length >= 2 && gcdA(v) > 1;
    },
    steps: {
      // 2けたまでの比。最大公約数は 2〜9
      s1(r) {
        const g = r.int(2, 9), p = r.int(1, 9), q = r.int(1, 9);
        if (p === q || gcd(p, q) !== 1 || g * p > 99 || g * q > 99) return null;
        return { q: `$${g * p}:${g * q}=□$`, a: `$${p}:${q}$`, easy: `${g}でわる`,
          verify: ok(gcd(p, q) === 1 && (g * p) / g === p && (g * q) / g === q, '比') };
      },
      // 最大公約数が大きい、3つの数の比
      s2(r) {
        if (r.chance(0.5)) {
          const g = r.pick([12, 14, 15, 16, 18, 24, 25, 36]), p = r.int(1, 7), q = r.int(1, 7);
          if (p === q || gcd(p, q) !== 1) return null;
          return { q: `$${g * p}:${g * q}=□$`, a: `$${p}:${q}$`, easy: `${g}でわる`, verify: ok(gcd(p, q) === 1, '比') };
        }
        const g = r.int(2, 9), p = r.int(1, 6), q = r.int(1, 6), s = r.int(1, 6);
        if (gcdA([p, q, s]) !== 1 || new Set([p, q, s]).size < 3) return null;
        return { q: `$${g * p}:${g * q}:${g * s}=□$`, a: `$${p}:${q}:${s}$`, easy: `${g}でわる`, verify: ok(gcdA([p, q, s]) === 1, '比') };
      },
      // ことばの問題（量の比、単位をそろえる）
      s3(r) {
        const k = r.int(0, 2);
        const g = r.int(3, 15), p = r.int(1, 6), q = r.int(1, 6);
        if (p === q || gcd(p, q) !== 1) return null;
        if (k === 0) {
          return { q: `《酢|す》$${5 * g * p}\\,\\mathrm{mL}$と《油|あぶら》$${5 * g * q}\\,\\mathrm{mL}$をまぜます。《酢|す》と《油|あぶら》の《比|ひ》をかんたんにすると □`,
            a: `$${p}:${q}$`, easy: `${5 * g}でわる`, verify: ok(gcd(p, q) === 1, '比') };
        }
        if (k === 1) {
          const u = r.pick([10, 20, 50, 100]);
          return { q: `《兄|あに》は${u * g * p}《円|えん》、《弟|おとうと》は${u * g * q}《円|えん》もっています。《兄|あに》と《弟|おとうと》のお《金|かね》の《比|ひ》をかんたんにすると □`,
            a: `$${p}:${q}$`, easy: `${u * g}でわる`, verify: ok(gcd(p, q) === 1, '比') };
        }
        // 1.2 m と 80 cm → cm にそろえて 120:80 → 3:2
        const u = r.pick([10, 20]), A = u * p, B = u * q;   // cm
        if (A < 100 || A % 10 !== 0 || B >= 100) return null;
        return { q: `《長|なが》さ$${decT(A, 2)}\\,\\mathrm{m}$のひもと$${B}\\,\\mathrm{cm}$のひもの《長|なが》さの《比|ひ》をかんたんにすると □`,
          a: `$${p}:${q}$`, easy: `cm にそろえて $${A}:${B}$、${u}でわる`, easyCheck: false, verify: ok(gcd(p, q) === 1 && A * q === B * p, '比') };
      },
      // わな：共通の約数がない（もうかんたん）
      trap(r) {
        const p = r.int(4, 21), q = r.int(4, 21);
        if (p === q || gcd(p, q) !== 1 || Math.max(p, q) < 8) return null;
        if ([p, q].every(x => [5, 7, 11, 13, 17, 19].includes(x))) return null;
        return dest({ q: `$${p}:${q}=□$`, a: `$${p}:${q}$`, verify: ok(gcd(p, q) === 1, '比') }, '2-29', '《共通|きょう|つう》の《約数|やく|すう》がない。このまま');
      },
    },
  });

  // ================================================================ 2-30
  M.add({
    id: '2-30', part: 3, chap: '2-5①', stars: 2,
    title: '《小数|しょう|すう》・《分数|ぶん|すう》の《比|ひ》は、《整数|せい|すう》にしてから',
    mark: '《比|ひ》の《中|なか》に**《小数|しょう|すう》**や**《分数|ぶん|すう》**がある。まず《両方|りょう|ほう》に《同|おな》じ《数|かず》をかけて《整数|せい|すう》にする。',
    futsu: ['$\\frac{1}{2}:\\frac{1}{3}$ の《比|ひ》の《値|あたい》を', '$\\frac{1}{2}\\div\\frac{1}{3}=\\frac{3}{2}$ と《出|だ》して、', '$3:2$ を《考|かんが》える。'],
    raku: ['《分母|ぶん|ぼ》2と3の《公倍数|こう|ばい|すう》6をかける。', '$\\frac{1}{2}:\\frac{1}{3}=3:2$', '《小数|しょう|すう》なら10《倍|ばい》：$0.6:0.8=6:8=3:4$'],
    why: '《比|ひ》の《両方|りょう|ほう》に《同|おな》じ《数|かず》をかけても、《比|ひ》の《値|あたい》は《変|か》わらない（《教科書|きょう|か|しょ》 2-5①）。《分数|ぶん|すう》は《通分|つう|ぶん》と《同|おな》じく、《分母|ぶん|ぼ》の《公倍数|こう|ばい|すう》をかける（《教科書|きょう|か|しょ》 2-4）。',
    caution: '《分母|ぶん|ぼ》が《同|おな》じ《分数|ぶん|すう》（$\\frac{1}{5}:\\frac{3}{5}$）は、《分子|ぶん|し》の《比|ひ》 $1:3$ でよい。',
    counts: { s1: 8, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: '20mm',
    boxh: { s2: '12mm', s3: '12mm' },
    fits(q) {
      const m = q.match(/^\$([^$]*:[^$]*)=□\$$/);
      // 単位のちがう量の比（$1.2\,\mathrm{m}$ と $80\,\mathrm{cm}$）は、まず単位をそろえる（わざ 2-29）
      if (!m) return /かんたんに/.test(q) && /\d\.\d/.test(q) && new Set(q.match(/\\mathrm\{[a-zA-Z]+\}/g) || []).size <= 1;
      const parts = m[1].split(':');
      if (!parts.some(t => /\d\.\d/.test(t) || /\\frac/.test(t))) return false;
      const dens = parts.map(t => (t.match(/^\\frac\{\d+\}\{(\d+)\}$/) || [])[1]);
      if (dens.every(Boolean) && new Set(dens).size === 1) return false;
      return true;
    },
    steps: {
      // 小数第1位どうし → 10倍
      s1(r) {
        const p = r.int(1, 9), q = r.int(1, 9), g = r.int(1, 9);
        if (p === q || gcd(p, q) !== 1) return null;
        const A = g * p, B = g * q;
        if (A % 10 === 0 || B % 10 === 0 || A > 99 || B > 99) return null;
        return { q: `$${dec(A, 1)}:${dec(B, 1)}=□$`, a: `$${p}:${q}$`, easy: `10《倍|ばい》して $${A}:${B}$${g > 1 ? `、${g}でわる` : ''}`,
          verify: ok(A * q === B * p && gcd(p, q) === 1, '比') };
      },
      // 分数の比（分母がちがう）・小数第2位まである比
      s2(r) {
        if (r.chance(0.7)) {
          const b = r.int(2, 9), d = r.int(2, 9), a = r.int(1, b - 1), c = r.int(1, d - 1);
          if (b === d || gcd(a, b) !== 1 || gcd(c, d) !== 1) return null;
          const L = lcm(b, d), x = a * L / b, y = c * L / d, g = gcd(x, y);
          return { q: `$\\frac{${a}}{${b}}:\\frac{${c}}{${d}}=□$`, a: `$${x / g}:${y / g}$`, easy: `${L}《倍|ばい》して $${x}:${y}$${g > 1 ? `、${g}でわる` : ''}`,
            verify: ok(F.eq(F.div(F.make(a, b), F.make(c, d)), F.make(x / g, y / g)), '比の値がちがう') };
        }
        const p = r.int(1, 9), q = r.int(1, 9), g = r.pick([5, 15, 25, 35, 45]);
        if (p === q || gcd(p, q) !== 1) return null;
        const A = g * p, B = g * q;
        if (A >= 100 || B >= 100 || (A % 10 === 0 && B % 10 === 0)) return null;
        return { q: `$${decT(A, 2)}:${decT(B, 2)}=□$`, a: `$${p}:${q}$`, easy: `100《倍|ばい》して $${A}:${B}$、${g}でわる`,
          verify: ok(A * q === B * p && gcd(p, q) === 1, '比') };
      },
      // 小数と分数・整数と小数・ことばの問題
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a10 = r.int(1, 9), c = r.int(1, 4), d = r.pick([3, 4, 6, 7, 9]);
          if (c >= d || gcd(c, d) !== 1) return null;
          const x = F.make(a10, 10), y = F.make(c, d), L = lcm(x[1], d), X = x[0] * L / x[1], Y = c * L / d, g = gcd(X, Y);
          if (L > 30) return null;
          return { q: `$${dec(a10, 1)}:\\frac{${c}}{${d}}$ をかんたんな《整数|せい|すう》の《比|ひ》にすると □`, a: `$${X / g}:${Y / g}$`,
            easy: `$${dec(a10, 1)}=\\frac{${x[0]}}{${x[1]}}$、${L}《倍|ばい》して $${X}:${Y}$${g > 1 ? `、${g}でわる` : ''}`, easyCheck: false,
            verify: ok(F.eq(F.div(x, y), F.make(X / g, Y / g)), '比の値がちがう') };
        }
        if (k === 1) {
          const n = r.int(1, 9), d = r.pick([2, 4, 5, 6, 8]), B = n * 10, Cc = d;   // n : 0.d → 10n : d
          const g = gcd(B, Cc);
          if (g === Cc) return null;
          return { q: `$${n}:${dec(d, 1)}$ をかんたんな《整数|せい|すう》の《比|ひ》にすると □`, a: `$${B / g}:${Cc / g}$`, easy: `10《倍|ばい》して $${B}:${Cc}$${g > 1 ? `、${g}でわる` : ''}`,
            verify: ok(B * (Cc / g) === Cc * (B / g), '比') };
        }
        const p = r.int(1, 9), q = r.int(1, 9), g = r.int(1, 6);
        if (p === q || gcd(p, q) !== 1) return null;
        const A = g * p, B = g * q;
        if (A % 10 === 0 && B % 10 === 0) return null;
        return { q: `ジュース$${decT(A, 1)}\\,\\mathrm{L}$と《水|みず》$${decT(B, 1)}\\,\\mathrm{L}$の《比|ひ》をかんたんにすると □`, a: `$${p}:${q}$`,
          easy: `10《倍|ばい》して $${A}:${B}$${g > 1 ? `、${g}でわる` : ''}`, verify: ok(A * q === B * p, '比') };
      },
      // わな：単位のちがう量の比（10倍しても、そろわない。まず小さい単位にそろえて、わざ 2-29 で）。J-1
      trap(r) {
        const [B, S, f, w1, w2] = r.pick([['L', 'mL', 1000, 'ジュース', '《水|みず》'], ['kg', 'g', 1000, 'さとう', '《塩|しお》'], ['m', 'cm', 100, '《赤|あか》いひも', '《白|しろ》いひも']]);
        const a10 = r.intNot(2, 25, v => v % 10 === 0), A = a10 * f / 10, b = r.int(1, 9) * f / 10;   // A・b は小さい単位
        if (A === b) return null;
        const g = gcd(A, b);
        return dest({ q: `${w1}$${decT(a10, 1)}\\,\\mathrm{${B}}$と${w2}$${b}\\,\\mathrm{${S}}$の《比|ひ》をかんたんにすると □`, a: `$${A / g}:${b / g}$`, easyCheck: false, verify: ok(gcd(A / g, b / g) === 1, '比') },
          '2-30', `《単位|たん|い》がちがう。10《倍|ばい》ではなく、${S}にそろえて $${A}:${b}$、${g}でわる`, ['2-29']);
      },
    },
  });

  // ================================================================ 2-31
  M.add({
    id: '2-31', part: 3, chap: '2-5①', stars: 1,
    title: '《等|ひと》しい《比|ひ》は「《何倍|なん|ばい》か」を《見|み》る',
    mark: '$a:b=c:□$ で、**$c$ が $a$ の《整数|せい|すう》《倍|ばい》**（または $a$ が $c$ の《整数|せい|すう》《倍|ばい》）になっている。',
    futsu: ['$1:3$ の《比|ひ》の《値|あたい》 $\\frac{1}{3}$ を《出|だ》して、', '$4\\div□=\\frac{1}{3}$ になる□を', 'さがす。'],
    raku: ['1から4は4《倍|ばい》。', '$1:3=4:□$', '□も3の4《倍|ばい》：$3\\times4=12$'],
    why: '《等|ひと》しい《比|ひ》は、《両方|りょう|ほう》に《同|おな》じ《数|かず》をかけた《比|ひ》（《教科書|きょう|か|しょ》 2-5①）。《前|まえ》が4《倍|ばい》なら、《後|うし》ろも4《倍|ばい》。',
    caution: '4が3の《整数|せい|すう》《倍|ばい》でない（$3:5=4:□$）ときは、わざ 2-32 で。',
    counts: { s1: 10, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxh: { trap: '12mm' },
    fits(q) {
      const P = propo(q);
      if (P) return multVisible(P);
      const w = wordProp(q);
      return !!w && w.X % w.p === 0;
    },
    steps: {
      // □が後ろ。前が k 倍
      s1(r) {
        const a = r.int(1, 9), b = r.int(1, 9), k = r.int(2, 9);
        if (a === b) return null;
        if (r.chance(0.6)) return { q: `$${a}:${b}=${a * k}:□$`, a: `$${b * k}$`, easy: `${k}《倍|ばい》：$${b}\\times${k}=${b * k}$`, verify: ok(a * (b * k) === b * (a * k), '比') };
        return { q: `$${a}:${b}=□:${b * k}$`, a: `$${a * k}$`, easy: `${k}《倍|ばい》：$${a}\\times${k}=${a * k}$`, verify: ok(a * (b * k) === b * (a * k), '比') };
      },
      // わって小さくする向き・□が前
      s2(r) {
        const a = r.int(1, 9), b = r.int(1, 9), k = r.int(2, 12);
        if (a === b || gcd(a, b) !== 1) return null;
        if (r.chance(0.5)) return { q: `$${a * k}:${b * k}=${a}:□$`, a: `$${b}$`, easy: `${k}でわる：$${b * k}\\div${k}=${b}$`, verify: ok(a * k * b === b * k * a, '比') };
        return { q: `$□:${b}=${a * k}:${b * k}$`, a: `$${a}$`, easy: `${k}でわる：$${a * k}\\div${k}=${a}$`, verify: ok(a * k * b === b * k * a, '比') };
      },
      // ことばの問題
      s3(r) {
        const t = r.int(0, 2), k = r.int(3, 30);
        if (t === 0) {
          const [a, b] = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [1, 3]]);
          return { q: `《酢|す》と《油|あぶら》を$${a}:${b}$でまぜます。《酢|す》が$${a * k}\\,\\mathrm{mL}$なら、《油|あぶら》は$□\\,\\mathrm{mL}$`, a: `$${b * k}$`, easy: `${k}《倍|ばい》：$${b}\\times${k}=${b * k}$` };
        }
        if (t === 1) {
          const [a, b] = r.pick([[1, 3], [1, 4], [2, 7], [1, 2]]);
          return { q: `セメントと《砂|すな》を$${a}:${b}$でまぜます。セメントが$${a * k}\\,\\mathrm{kg}$なら、《砂|すな》は$□\\,\\mathrm{kg}$`, a: `$${b * k}$`, easy: `${k}《倍|ばい》：$${b}\\times${k}=${b * k}$` };
        }
        const [a, b] = r.pick([[1, 4], [2, 3], [3, 2], [1, 5]]);
        return { q: `《青|あお》と《白|しろ》の《絵|え》の《具|ぐ》を$${a}:${b}$でまぜます。《青|あお》が$${a * k}\\,\\mathrm{g}$なら、《白|しろ》は$□\\,\\mathrm{g}$`, a: `$${b * k}$`, easy: `${k}《倍|ばい》：$${b}\\times${k}=${b * k}$` };
      },
      // わな：かんたんにできない比で、何倍かが整数にならない（内項の積＝外項の積。2-32 で）
      trap(r) {
        const a = r.int(2, 9), b = r.int(2, 12), c = r.int(2, 12);
        if (a === b || gcd(a, b) !== 1 || c % a === 0 || a % c === 0) return null;
        const d = F.make(b * c, a), ds = fracDec(d);
        if (ds && ds.split('.')[1].length > 2) return null;
        return dest({ q: `$${a}:${b}=${c}:□$（${KATA[ds ? '小数' : '分数']}で）`, a: ds ? `$${ds}$` : `$\\frac{${d[0]}}{${d[1]}}$`, verify: ok(F.eq(F.mul(F.make(a), d), F.make(b * c)), '比') },
          '2-31', `${c}は${a}の《整数|せい|すう》《倍|ばい》でない`);
      },
    },
  });

  // ================================================================ 2-32
  // $A:B=u:□$ の組。A:B をかんたんにした $a:b$ でも、u は a の整数倍にならない（答えは小数か分数）。
  // dens：かんたんにした前の数 a のえらび方（2・4・5・8 なら答えは小数で終わる）
  function gen32(r, dens) {
    const a = r.pick(dens), b = r.int(1, 9);
    if (a === b || gcd(a, b) !== 1) return null;
    const g = r.pick([1, 1, 2, 3, 4]), A = a * g, B = b * g, u = r.int(2, 20);
    if (A > 30 || B > 30 || u % a === 0 || a % u === 0 || A % u === 0) return null;
    const d = F.make(b * u, a), ds = fracDec(d);
    if (ds && ds.split('.')[1].length > 2) return null;
    return { A, B, u, d, ans: ds ? `$${ds}$` : `$\\frac{${d[0]}}{${d[1]}}$`, val: ds || `\\frac{${d[0]}}{${d[1]}}`, kata: `（${KATA[ds ? '小数' : '分数']}で）`,
      verify: ok(F.eq(F.mul(F.make(A), d), F.make(B * u)), '比') };
  }
  M.add({
    id: '2-32', part: 3, chap: '2-5①・2-14', stars: 2,
    title: '《内項|ない|こう》の《積|せき》＝《外項|がい|こう》の《積|せき》',
    mark: '$a:b=c:□$ で、かんたんにしても**《何倍|なん|ばい》かが《整数|せい|すう》にならない**。《内側|うち|がわ》の2つ（《内項|ない|こう》）と《外側|そと|がわ》の2つ（《外項|がい|こう》）をかける。',
    futsu: ['$4:6=5:□$。4から5は', '$5\\div4=1.25$ 《倍|ばい》なので、', '$6\\times1.25$ を《計算|けい|さん》する。'],
    raku: ['《内項|ない|こう》の《積|せき》＝《外項|がい|こう》の《積|せき》', '$4\\times□=6\\times5$', '$□=30\\div4=7.5$'],
    why: '$a:b=c:d$ なら、《比|ひ》の《値|あたい》が《等|ひと》しく $\\frac{a}{b}=\\frac{c}{d}$。《両辺|りょう|へん》に $bd$ をかけると $ad=bc$（《教科書|きょう|か|しょ》 2-5①・2-14）。',
    caution: '《何倍|なん|ばい》かが《見|み》える（$2:5=6:□$、かんたんにすると $2:3$ になる $4:6=10:□$）なら、わざ 2-31 のほうが《楽|らく》。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '12mm', s2: '12mm', s3: '16mm' },
    boxh: { s1: '12mm', s2: '12mm' },
    fits(q) {
      const P = propo(q);
      if (P) return !multVisible(P);
      const w = wordProp(q);
      return !!w && w.X % w.p !== 0;
    },
    steps: {
      s1(r) {
        const g = gen32(r, [2, 4, 5, 8, 2, 4, 5, 8, 3, 6, 7, 9]);
        if (!g) return null;
        return { q: `$${g.A}:${g.B}=${g.u}:□$${g.kata}`, a: g.ans, easy: `$${g.A}\\times□=${g.B}\\times${g.u}$、$□=${g.B * g.u}\\div${g.A}=${g.val}$`, easyCheck: false, verify: g.verify };
      },
      // □の場所を変える（R1-38：文字 x は使わない）
      s2(r) {
        const g = gen32(r, [2, 4, 5, 8, 2, 4, 5, 8, 3, 6, 7, 9]);
        if (!g) return null;
        const t = r.int(0, 2), easy = `$${g.B * g.u}\\div${g.A}=${g.val}$`;
        const q = [`$${g.u}:□=${g.A}:${g.B}$`, `$${g.B}:${g.A}=□:${g.u}$`, `$□:${g.u}=${g.B}:${g.A}$`][t];
        return { q: q + g.kata, a: g.ans, easy: `《内項|ない|こう》の《積|せき》＝《外項|がい|こう》の《積|せき》から ${easy}`, verify: g.verify };
      },
      // ことばの問題（かげ・ばね）。答えは小数
      s3(r) {
        const g = gen32(r, [2, 4, 5, 8]);
        if (!g || g.ans.indexOf('.') < 0) return null;
        const easy = `$${g.A}\\times□=${g.B}\\times${g.u}$、$□=${g.B * g.u}\\div${g.A}=${g.val}$`;
        if (r.chance(0.5)) return { q: `《高|たか》さ$${g.A}\\,\\mathrm{m}$のぼうのかげが$${g.B}\\,\\mathrm{m}$のとき、《高|たか》さ$${g.u}\\,\\mathrm{m}$の《木|き》のかげは$□\\,\\mathrm{m}$`, a: g.ans, easy, easyCheck: false, verify: g.verify };
        return { q: `$${g.A * 10}\\,\\mathrm{g}$のおもりで$${g.B}\\,\\mathrm{cm}$のびるばねは、$${g.u * 10}\\,\\mathrm{g}$では$□\\,\\mathrm{cm}$のびます`, a: g.ans,
          easy: `$${g.A * 10}\\times□=${g.B}\\times${g.u * 10}$、$□=${g.B * g.u * 10}\\div${g.A * 10}=${g.val}$`, easyCheck: false, verify: g.verify };
      },
      // わな：何倍かが見える（2-31 で）
      trap(r) {
        const a = r.int(2, 6), b = r.int(2, 9), k = r.int(2, 6);
        if (a === b || gcd(a, b) !== 1) return null;
        return dest({ q: `$${a}:${b}=${a * k}:□$`, a: `$${b * k}$`, verify: ok(a * b * k === b * a * k, '比') }, '2-32', `${a}から${a * k}は${k}《倍|ばい》が《見|み》える`);
      },
    },
  });

  // ================================================================ 2-33
  const AB = (x, y) => `$\\mathrm{A}:\\mathrm{B}=${x}:${y}$`, BC = (x, y) => `$\\mathrm{B}:\\mathrm{C}=${x}:${y}$`;
  // A:B=p:q、B:C=s:t をつなぐ
  function chain(p, q, s, t) {
    const L = lcm(q, s), A = p * L / q, C = t * L / s, g = gcdA([A, L, C]);
    return { L, A, C, a: A / g, b: L / g, c: C / g, g };
  }
  M.add({
    id: '2-33', part: 3, chap: '2-5②⑥もっと', stars: 1,
    title: '《比|ひ》をつなぐときは、まん《中|なか》をそろえる',
    mark: '$\\mathrm{A}:\\mathrm{B}$ と $\\mathrm{B}:\\mathrm{C}$ のように、**2つの《比|ひ》に《同|おな》じもの（B）**がある。Bの《数|かず》を《公倍数|こう|ばい|すう》にそろえる。',
    futsu: ['Aを1とみて、Bは $\\frac{3}{2}$、', 'Cは $\\frac{3}{2}\\times\\frac{5}{4}$……と', '《分数|ぶん|すう》で《考|かんが》える。'],
    raku: ['A:B＝2:3、B:C＝4:5', 'Bの3と4を12にそろえる。', '$8:12$ と $12:15$', '→ $\\mathrm{A}:\\mathrm{B}:\\mathrm{C}=8:12:15$'],
    why: '《比|ひ》は《両方|りょう|ほう》に《同|おな》じ《数|かず》をかけても《変|か》わらない。《通分|つう|ぶん》（《教科書|きょう|か|しょ》 2-4）と《同|おな》じく、Bを《公倍数|こう|ばい|すう》にそろえる（《教科書|きょう|か|しょ》 2-5②⑥もっと）。',
    caution: '$\\mathrm{A}:\\mathrm{B}$ と $\\mathrm{C}:\\mathrm{D}$ のように《同|おな》じものがないと、つなげない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '28mm', s2: '28mm', s3: '15mm', trap: '28mm' },
    fits(q) {
      const ab = q.match(/\\mathrm\{A\}:\\mathrm\{B\}=(\d+):(\d+)/), bc = q.match(/\\mathrm\{B\}:\\mathrm\{C\}=(\d+):(\d+)/), cb = q.match(/\\mathrm\{C\}:\\mathrm\{B\}=(\d+):(\d+)/);
      if (!ab || !(bc || cb)) return false;
      return +ab[2] !== (bc ? +bc[1] : +cb[2]);
    },
    steps: {
      s1(r) {
        const p = r.int(1, 7), q = r.int(2, 9), s = r.int(2, 9), t = r.int(1, 9);
        if (q === s || gcd(p, q) !== 1 || gcd(s, t) !== 1 || lcm(q, s) > 60) return null;
        const c = chain(p, q, s, t);
        return { q: `${AB(p, q)}、${BC(s, t)}のとき、$\\mathrm{A}:\\mathrm{B}:\\mathrm{C}=□$`, a: `$${c.a}:${c.b}:${c.c}$`,
          easy: `Bを${c.L}にそろえる${c.g > 1 ? `（${c.g}でわる）` : ''}`,
          verify: ok(c.a * q === c.b * p && c.b * t === c.c * s && gcdA([c.a, c.b, c.c]) === 1, '比') };
      },
      // A:C だけ・B が後ろにある比（C:B）
      s2(r) {
        const p = r.int(1, 7), q = r.int(2, 9), s = r.int(2, 9), t = r.int(1, 9);
        if (q === s || gcd(p, q) !== 1 || gcd(s, t) !== 1 || lcm(q, s) > 60) return null;
        const c = chain(p, q, s, t);
        if (r.chance(0.5)) {
          const g = gcd(c.a, c.c);
          return { q: `${AB(p, q)}、${BC(s, t)}のとき、$\\mathrm{A}:\\mathrm{C}=□$`, a: `$${c.a / g}:${c.c / g}$`, easy: `Bを${c.L}にそろえて $${c.A}:${c.L}:${c.C}$`,
            verify: ok(c.a * q * t === c.c * p * s && gcd(c.a / g, c.c / g) === 1, '比') };
        }
        // C:B=t:s（B が後ろ）
        return { q: `${AB(p, q)}、$\\mathrm{C}:\\mathrm{B}=${t}:${s}$のとき、$\\mathrm{A}:\\mathrm{B}:\\mathrm{C}=□$`, a: `$${c.a}:${c.b}:${c.c}$`,
          easy: `Bを${c.L}にそろえる${c.g > 1 ? `（${c.g}でわる）` : ''}`,
          verify: ok(c.a * q === c.b * p && c.b * t === c.c * s, '比') };
      },
      // ことばの問題（歯車・おはじき）
      s3(r) {
        if (r.chance(0.5)) {
          const k1 = r.int(2, 5), k2 = r.int(2, 5), n = r.pick([2, 3, 4, 5, 10, 20, 30]);
          return { q: `《歯車|は|ぐるま》で${AB(1, k1)}、${BC(1, k2)}。Aが1《分|ぷん》に${n}《回転|かい|てん》なら、Cは1《分|ぷん》に□《回転|かい|てん》`,
            a: `$${n * k1 * k2}$`, easy: `$\\mathrm{A}:\\mathrm{C}=1:${k1 * k2}$、$${n}\\times${k1 * k2}=${n * k1 * k2}$`, easyCheck: false, verify: ok(n * k1 * k2 > 0, '') };
        }
        const p = r.int(1, 5), q = r.int(2, 6), s = r.int(2, 6), t = r.int(1, 7), m = r.int(2, 5);
        if (q === s || gcd(p, q) !== 1 || gcd(s, t) !== 1) return null;
        const c = chain(p, q, s, t);
        return { q: `おはじきの《数|かず》が${AB(p, q)}、${BC(s, t)}。Aが${c.a * m}こなら、Cは□こ`,
          a: `$${c.c * m}$`, easy: `$\\mathrm{A}:\\mathrm{B}:\\mathrm{C}=${c.a}:${c.b}:${c.c}$、$${c.c}\\times${m}=${c.c * m}$`, easyCheck: false,
          verify: ok(c.a * m * q * t === c.c * m * p * s, '比') };
      },
      // わな：共通のものがない／比が1つだけ（入れかえるだけ）
      trap(r) {
        const p = r.int(1, 5), q = r.int(2, 7), s = r.int(1, 7), t = r.int(2, 9);
        if (gcd(p, q) !== 1 || gcd(s, t) !== 1 || p === q || s === t) return null;
        if (r.chance(0.5)) {
          return dest({ q: `${AB(p, q)}、$\\mathrm{C}:\\mathrm{D}=${s}:${t}$のとき、$\\mathrm{A}:\\mathrm{C}$ は《決|き》まる？ □`, a: '《決|き》まらない', verify: () => true }, '2-33', '《同|おな》じものがないので、つなげない');
        }
        return dest({ q: `${AB(p, q)}のとき、$\\mathrm{B}:\\mathrm{A}=□$`, a: `$${q}:${p}$`, verify: ok(gcd(p, q) === 1, '比') }, '2-33', 'つなぐ《比|ひ》がない。《前|まえ》と《後|うし》ろを《入|い》れかえるだけ');
      },
    },
  });

  // ================================================================ 2-34
  // n のうち m：百分率が整数になる m
  const pctOK = (m, n) => (100 * m) % n === 0;
  M.add({
    id: '2-34', part: 3, chap: '2-5③⑥', stars: 1,
    title: '《割合|わり|あい》は「くらべる《量|りょう》÷もとにする《量|りょう》」',
    mark: '「〜のうち」「〜の《何|なん》％」「〜をもとにすると」。**もとにする《量|りょう》**（「の」の《前|まえ》・ぜんぶの《数|かず》）を《先|さき》に《決|き》める。',
    futsu: ['20《回|かい》で13《回|かい》。100《回|かい》なら', '《何回|なん|かい》になるかを、《表|ひょう》をかいて', '《考|かんが》える。'],
    raku: ['もとにする《量|りょう》は20《回|かい》。', '$13\\div20=0.65$', '100をかけて65％'],
    why: '《割合|わり|あい》は、もとにする《量|りょう》を1とみたとき、くらべる《量|りょう》がいくつにあたるか（《教科書|きょう|か|しょ》 2-5③）。1あたりなので、もとにする《量|りょう》でわる。',
    caution: '《割合|わり|あい》がわかっていて、くらべる《量|りょう》をきかれたら、わらずにかける（もとにする《量|りょう》×《割合|わり|あい》）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    fits(q) {
      return /□％/.test(q) && !/を(百分率|歩合|小数)で|ずれ|\\pm/.test(q) && /のうち|うって|問のテスト|去年|をもとにすると|効率|こう配|人のクラス/.test(q);
    },
    steps: {
      s1(r) {
        const n = r.pick([10, 20, 25, 40, 50]), m = r.int(1, n - 1);
        if (!pctOK(m, n)) return null;
        const P = 100 * m / n, t = r.int(0, 2);
        const q = [
          `シュート${n}《回|かい》のうち${m}《回|かい》《入|はい》りました。《入|はい》った《割合|わり|あい》は □％`,
          `${n}《問|もん》のテストで、${m}《問|もん》《正解|せい|かい》しました。《正解|せい|かい》した《割合|わり|あい》は □％`,
          `${n}《人|にん》のクラスのうち、${nin(m)}が《電車|でん|しゃ》で《来|き》ます。《電車|でん|しゃ》で《来|く》る《人|ひと》の《割合|わり|あい》は □％`,
        ][t];
        return { q, a: `$${P}$`, easy: `$${m}\\div${n}=${decT(P, 2)}$`, val: decT(P, 2), verify: ok(P * n === 100 * m, '割合') };
      },
      // もとにする量があとに出る・100%をこえる・何%ふえた
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const A = r.pick([2, 4, 5, 8, 10, 20, 25, 40, 50]) * r.int(1, 3), B = r.int(1, 60);
          if (A === B || !pctOK(B, A) || 2 * B < A || B > 2 * A) return null;
          const P = 100 * B / A;
          return { q: `《赤|あか》い《玉|たま》は${A}こ、《白|しろ》い《玉|たま》は${B}こです。《赤|あか》い《玉|たま》をもとにすると、《白|しろ》い《玉|たま》は □％`, a: `$${P}$`, easy: `$${B}\\div${A}=${decT(P, 2)}$`, val: decT(P, 2), verify: ok(P * A === 100 * B, '割合') };
        }
        const A = r.pick([200, 250, 300, 400, 500, 600, 800]), up = r.pick([5, 10, 15, 20, 25, 30, 40]), B = A * (100 + up) / 100;
        if (!Number.isInteger(B)) return null;
        if (t === 1) return { q: `《去年|きょ|ねん》は${A}《人|にん》、《今年|ことし》は${B}《人|にん》でした。《今年|ことし》は《去年|きょ|ねん》の □％`, a: `$${100 + up}$`, easy: `$${B}\\div${A}=${decT(100 + up, 2)}$`, val: decT(100 + up, 2), verify: ok((100 + up) * A === 100 * B, '割合') };
        return { q: `《去年|きょ|ねん》は${A}《人|にん》、《今年|ことし》は${B}《人|にん》でした。《去年|きょ|ねん》より □％ ふえました`, a: `$${up}$`, easy: `$(${B}-${A})\\div${A}=${decT(up, 2)}$`, val: decT(up, 2), verify: ok(up * A === 100 * (B - A), '割合') };
      },
      // 効率・こう配・くらべる量が書いていない（ぜんぶ － 書いてある数）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const n = r.pick([20, 25, 40, 50]), m = r.int(Math.ceil(n / 2), n - 2), x = n - m;
          if (!pctOK(x, n)) return null;
          const P = 100 * x / n;
          const q = r.chance(0.5)
            ? `シュート${n}《回|かい》のうち${m}《回|かい》《入|はい》りました。《入|はい》らなかった《割合|わり|あい》は □％`
            : `${n}《問|もん》のテストで、${m}《問|もん》《正解|せい|かい》しました。まちがえた《割合|わり|あい》は □％`;
          return { q, a: `$${P}$`, easy: `くらべる《量|りょう》は $${n}-${m}=${x}$、$${x}\\div${n}=${decT(P, 2)}$`, val: `$${x}\\div${n}$`, easyCheck: false, verify: ok(P * n === 100 * x, '割合') };
        }
        if (k === 0) {
          const A = r.pick([20, 40, 50, 80, 100, 200, 250, 400, 500]), B = r.int(1, A - 1);
          if (!pctOK(B, A) || 100 * B / A < 40) return null;
          const P = 100 * B / A;
          return { q: `$${A}\\,\\mathrm{W}$の《電気|でん|き》で$${B}\\,\\mathrm{W}$《分|ぶん》の《仕事|し|ごと》をするモーターの《効率|こう|りつ》は □％`, a: `$${P}$`, easy: `$${B}\\div${A}=${decT(P, 2)}$`, val: decT(P, 2), verify: ok(P * A === 100 * B, '割合') };
        }
        const A = r.pick([100, 200, 250, 300, 400, 500, 800]), B = r.int(2, 40);
        if (!pctOK(B, A) || 100 * B / A > 15) return null;
        const P = 100 * B / A;
        return { q: `《水平|すい|へい》に$${A}\\,\\mathrm{m}$《進|すす》むと$${B}\\,\\mathrm{m}$《上|あ》がる《坂|さか》のこう《配|ばい》は □％`, a: `$${P}$`, easy: `$${B}\\div${A}=${decT(P, 2)}$`, val: decT(P, 2), verify: ok(P * A === 100 * B, '割合') };
      },
      // わな：割合がわかっていて、くらべる量をきかれる（わらずにかける）。J-1
      trap(r) {
        const n = r.pick([20, 40, 50]), P = r.pick([15, 35, 45, 55, 65, 85, 30, 70, 90]), m = n * P / 100;
        if (!Number.isInteger(m)) return null;
        const q = r.chance(0.5)
          ? `シュート${n}《回|かい》のうち$${P}\\%$が《入|はい》りました。《入|はい》ったのは□《回|かい》`
          : `${n}《問|もん》のテストで、$${P}\\%$《正解|せい|かい》しました。《正解|せい|かい》したのは□《問|もん》`;
        return dest({ q, a: `$${m}$`, verify: ok(m * 100 === n * P, '割合') }, '2-34', `《割合|わり|あい》がわかっている。わらずに $${n}\\times${decT(P, 2)}=${m}$`);
      },
    },
  });

  // ================================================================ 2-35
  // 歩合（t は 1000倍した整数。0.325 → 325 → 3割2分5厘）
  function buai(t) {
    const w = Math.floor(t / 100), b = Math.floor(t / 10) % 10, n = t % 10;
    return (w ? `${w}《割|わり》` : '') + (b ? `${b}《分|ぶ》` : '') + (n ? `${n}《厘|りん》` : '');
  }
  const buaiBack = s => { const g = re => { const m = M.plain(s).match(re); return m ? +m[1] : 0; }; return 100 * g(/(\d+)割/) + 10 * g(/(\d+)分/) + g(/(\d+)厘/); };
  M.add({
    id: '2-35', part: 3, chap: '2-5④', stars: 1,
    title: '《百分率|ひゃく|ぶん|りつ》・《小数|しょう|すう》・《歩合|ぶ|あい》を《行|い》き《来|き》する',
    mark: '％・《割|わり》・《分|ぶ》・《厘|りん》・《小数|しょう|すう》を**《書|か》きかえる**。《割合|わり|あい》の0.01が1％、0.1が1《割|わり》。',
    futsu: ['0.01が1％なので、', '0.325の《中|なか》に0.01が', 'いくつあるかを《数|かぞ》える。'],
    raku: ['《割合|わり|あい》×100＝％', '$0.325\\times100=32.5$ → 32.5％', '0.1が1《割|わり》、0.01が1《分|ぶ》、0.001が1《厘|りん》', '→ 3《割|わり》2《分|ぶ》5《厘|りん》'],
    why: '《百分率|ひゃく|ぶん|りつ》は、もとを1ではなく100とみなおした《割合|わり|あい》。だから100をかける（《教科書|きょう|か|しょ》 2-5④）。％から《割合|わり|あい》へは100でわる。',
    caution: '0.05は5《割|わり》ではなく5《分|ぶ》。0.5％は0.5ではなく0.005。',
    counts: { s1: 10, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s2: '24mm', s3: '24mm', trap: '20mm' },
    fits(q) { return /を(百分率|歩合|小数)で表すと|のうち、いちばん大きい|歩合で：/.test(q) || /^\$\d+(\.\d+)?(\\%)?=□(\\%)?\$$/.test(q) || /^[\d割分厘]+＝□％$/.test(q); },
    steps: {
      // 小数 ⇔ 百分率
      s1(r) {
        const t = r.chance(0.7) ? r.int(1, 99) * 10 : r.int(1, 999);   // 1000倍
        if (t % 1000 === 0) return null;
        const d = decT(t, 3), p = decT(t, 1);
        if (r.chance(0.5)) return { q: `$${d}=□\\%$`, a: `$${p}$`, easy: `$${d}\\times100=${p}$` };
        return { q: `$${p}\\%=□$`, a: `$${d}$`, easy: `$${p}\\div100=${d}$` };
      },
      // 歩合
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t = r.int(101, 999);
          if (t % 10 === 0 || Math.floor(t / 10) % 10 === 0) return null;
          return { q: `《歩合|ぶ|あい》で：$${decT(t, 3)}=$□`, a: buai(t), easy: `0.1が${Math.floor(t / 100)}こ、0.01が${Math.floor(t / 10) % 10}こ、0.001が${t % 10}こ`, verify: ok(buaiBack(buai(t)) === t, '歩合') };
        }
        const t = r.int(11, 99) * 10;
        if (t % 100 === 0) return null;
        if (k === 1) return { q: `${buai(t)}＝□％`, a: `$${t / 10}$`, easy: `$${decT(t, 3)}\\times100=${t / 10}$`, verify: ok(buaiBack(buai(t)) === t, '歩合') };
        return { q: `《歩合|ぶ|あい》で：$${t / 10}\\%=$□`, a: buai(t), easy: `$${t / 10}\\div100=${decT(t, 3)}$`, easyCheck: false, verify: ok(buaiBack(buai(t)) === t, '歩合') };
      },
      // くらべる・100%をこえる・打率・まちがえやすい 0.05 と 0.5%
      s3(r) {
        const k = r.int(0, 4);
        if (k === 3) {
          const b = r.int(1, 9);
          return { q: `《歩合|ぶ|あい》で：$0.0${b}=$□`, a: `${b}《分|ぶ》`, easy: `0.01が${b}こで${b}《分|ぶ》（${b}《割|わり》ではない）`, verify: ok(buaiBack(`${b}分`) === b * 10, '歩合') };
        }
        if (k === 4) {
          const b = r.int(1, 9);
          return { q: `$0.${b}\\%=□$`, a: `$0.00${b}$`, easy: `$0.${b}\\div100=0.00${b}$` };
        }
        if (k === 0) {
          const v = r.shuffle([r.int(20, 49), r.int(20, 49), r.int(20, 49)]).map(x => x * 10);
          if (new Set(v).size < 3) return null;
          const shown = [`$${decT(v[0], 3)}$`, buai(v[1]), `$${v[2] / 10}\\%$`];
          const order = r.shuffle([0, 1, 2]);
          const mx = v.indexOf(Math.max(...v));
          return { q: `${order.map(i => shown[i]).join('、')} のうち、いちばん《大|おお》きいのは □`, a: shown[mx], easy: `《小数|しょう|すう》にそろえる：${order.map(i => decT(v[i], 3)).join('、')}`, verify: ok(v[mx] === Math.max(...v), '大きさ') };
        }
        if (k === 1) {
          const t = r.int(101, 250) * 10;
          return { q: `$${decT(t, 3)}$ を《百分率|ひゃく|ぶん|りつ》で《表|あらわ》すと □％`, a: `$${t / 10}$`, easy: `$${decT(t, 3)}\\times100=${t / 10}$（100％をこえる）` };
        }
        const t = r.int(201, 399);
        if (t % 10 === 0 || Math.floor(t / 10) % 10 === 0) return null;
        return { q: `《打率|だ|りつ》${buai(t)}を《小数|しょう|すう》で《表|あらわ》すと □`, a: `$${decT(t, 3)}$`, easy: `《割|わり》は0.1、《分|ぶ》は0.01、《厘|りん》は0.001`, verify: ok(buaiBack(buai(t)) === t, '歩合') };
      },
      // わな：時間の「分（ふん）」（歩合の「分（ぶ）」ではない。1時間は60分）。J-1
      trap(r) {
        const h10 = r.intNot(1, 25, v => v % 10 === 0), mins = h10 * 6;   // 0.1時間は6分
        return dest({ q: `$${decT(h10, 1)}$《時間|じ|かん》は□${M.fun(mins)}`, a: `$${mins}$`, verify: ok(mins * 10 === h10 * 60, '') },
          '2-35', `《時間|じ|かん》の《分|ふん》。1《時間|じ|かん》は60${M.fun(60)}なので $${decT(h10, 1)}\\times60=${mins}$。《歩合|ぶ|あい》の《分|ぶ》ではない`);
      },
    },
  });

  // ================================================================ 2-36
  const NICE36 = ['50', '25', '75', '20', '40', '60', '80', '12.5', '37.5', '62.5', '87.5'];
  M.add({
    id: '2-36', part: 3, chap: '2-5④の《先|さき》', stars: 2,
    title: 'よく《出|で》る《百分率|ひゃく|ぶん|りつ》は《分数|ぶん|すう》で',
    mark: '**25％・50％・75％・20％・12.5％**など。《分数|ぶん|すう》にすると、わり《算|ざん》1つですむ。',
    futsu: ['3200《円|えん》の25％。', '$3200\\times0.25$ を', '《筆算|ひっ|さん》でする。'],
    raku: ['25％は $\\frac{1}{4}$。', '$3200\\times\\frac{1}{4}=3200\\div4$', '$=800$（《円|えん》）'],
    why: '25％は《割合|わり|あい》0.25で、$\\frac{25}{100}=\\frac{1}{4}$（《教科書|きょう|か|しょ》 2-4・2-5④）。4でわるほうが、0.25をかけるより《楽|らく》。',
    caution: '24％のように、よく《出|で》る《分数|ぶん|すう》にならない％は、10％・1％を《組|く》み《合|あ》わせる（わざ 2-96）か、そのまま《小数|しょう|すう》をかける。',
    counts: { s1: 10, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxh: { s2: '12mm' },
    fits(q) {
      if (/\$(\d+(?:\.\d+)?)\\%\$ を分数で/.test(q)) return true;
      if (/いつもは|もとのねだんは|もとは|去年は|うったのは|入れた電気は|水平に進んだのは|で表すと|いちばん/.test(q) || /^\$[\d.]+\\%=□\$$/.test(q)) return false;
      return (q.match(/\$(\d+(?:\.\d+)?)\\%\$/g) || []).some(t => NICE[t.slice(1, -3)]) && /□(?!％)/.test(q);
    },
    steps: {
      s1(r) {
        const p = r.pick(['50', '25', '75', '20']), [n, d] = NICE[p];
        const X = d * r.int(2, 30) * 10, ans = X * n / d;
        const u = r.int(0, 2);
        const q = u === 0 ? `$${X}$《円|えん》の$${p}\\%$は□《円|えん》` : u === 1 ? `$${X}\\,\\mathrm{g}$の$${p}\\%$は$□\\,\\mathrm{g}$` : `$${X}\\,\\mathrm{mL}$の$${p}\\%$は$□\\,\\mathrm{mL}$`;
        return { q, a: `$${ans}$`, easy: `$${X}\\times\\frac{${n}}{${d}}=${ans}$` };
      },
      // ％を分数に
      s2(r) {
        const p = r.pick(NICE36), [n, d] = NICE[p];
        return { q: `$${p}\\%$ を《分数|ぶん|すう》で《表|あらわ》すと □`, a: `$\\frac{${n}}{${d}}$`, easy: `$${p}\\div100=\\frac{${n}}{${d}}$` };
      },
      // 12.5% など・ことばの問題
      s3(r) {
        const p = r.pick(['12.5', '37.5', '62.5', '87.5', '40', '60', '80', '75']), [n, d] = NICE[p];
        const X = d * r.int(3, 40) * (d === 8 ? 1 : 5), ans = X * n / d;
        if (X > 2000) return null;
        const q = r.chance(0.5)
          ? `${X}《人|にん》のうち$${p}\\%$が《電車|でん|しゃ》で《来|き》ます。《電車|でん|しゃ》で《来|く》るのは□《人|にん》`
          : `${X}《円|えん》のうち$${p}\\%$を《使|つか》いました。《使|つか》ったのは□《円|えん》`;
        return { q, a: `$${ans}$`, easy: `$${X}\\times\\frac{${n}}{${d}}=${ans}$` };
      },
      // わな：よく出る分数にならない
      trap(r) {
        const p = r.pick([24, 36, 28, 32, 26, 34]), X = r.int(11, 49) * 100, ans = X * p / 100;
        const t = Math.floor(p / 10), o = p % 10;
        return dest({ q: `$${X}$《円|えん》の$${p}\\%$は□《円|えん》`, a: `$${ans}$`, verify: ok(ans * 100 === X * p, '') }, '2-36',
          `${p}％はよく《出|で》る《分数|ぶん|すう》にならない。10％×${t}＋1％×${o}：$${X / 10}\\times${t}+${X / 100}\\times${o}=${ans}$`);
      },
    },
  });

  // ================================================================ 2-37
  M.add({
    id: '2-37', part: 3, chap: '2-5⑤', stars: 1,
    title: '20％《引|び》きは×0.8、20％《増|ま》しは×1.2',
    mark: '「**○％《引|び》き**」「**○％《増|ま》し**」「さらに」。《引|ひ》いた《額|がく》を《出|だ》さずに、1つのかけ《算|ざん》にする。',
    futsu: ['3200《円|えん》の25％は800《円|えん》。', '$3200-800=2400$（《円|えん》）。', '2《回|かい》《計算|けい|さん》する。'],
    raku: ['はらうのは $100-25=75$（％）。', '$3200\\times0.75=2400$（《円|えん》）', '2《回|かい》なら：20％《引|び》きの20％《引|び》き', '$\\times0.8\\times0.8=\\times0.64$'],
    why: 'もとを100％とすると、25％《引|び》きは75％で0.75《倍|ばい》、20％《増|ま》しは120％で1.2《倍|ばい》（《教科書|きょう|か|しょ》 2-5⑤）。2《回|かい》なら、《倍|ばい》をかけ《算|ざん》でつなぐ。',
    caution: '20％《引|び》きを2《回|かい》しても、40％《引|び》きではない（0.64《倍|ばい》で36％《引|び》き）。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    cols: 1,
    fits(q) {
      if (/いつもは|もとのねだんは|もとは|去年は|ねびきは/.test(q)) return false;
      return /\\%\$(引き|増し|増量)|割引き|割増し/.test(q);
    },
    steps: {
      s1(r) {
        if (r.chance(0.6)) {
          const p = r.pick([10, 20, 30, 40, 15, 5, 25]), X = r.int(5, 60) * 100, Y = X * (100 - p) / 100;
          return { q: `$${X}$《円|えん》のくつの$${p}\\%$《引|び》きは□《円|えん》`, a: `$${Y}$`, easy: `$${X}\\times${decT(100 - p, 2)}=${Y}$` };
        }
        const p = r.pick([10, 20, 25, 30, 50]), X = r.int(2, 12) * 40, Y = X * (100 + p) / 100;
        if (!Number.isInteger(Y)) return null;
        return { q: `いつも$${X}\\,\\mathrm{mL}$のジュースが、$${p}\\%$《増量|ぞう|りょう》で$□\\,\\mathrm{mL}$`, a: `$${Y}$`, easy: `$${X}\\times${decT(100 + p, 2)}=${Y}$` };
      },
      // 2回続ける・何倍か
      s2(r) {
        if (r.chance(0.6)) {
          const p = r.pick([10, 20, 30]), q2 = r.pick([10, 20, 50]), X = r.int(2, 30) * 100, Y = X * (100 - p) * (100 - q2) / 10000;
          if (!Number.isInteger(Y)) return null;
          return { q: `$${X}$《円|えん》の$${p}\\%$《引|び》きの、さらに$${q2}\\%$《引|び》きは□《円|えん》`, a: `$${Y}$`, easy: `$${X}\\times${decT(100 - p, 2)}\\times${decT(100 - q2, 2)}=${Y}$`, key: `w${X}:${[p, q2].sort()}` };
        }
        const p = r.int(1, 19) * 5;
        if (r.chance(0.5)) return { q: `$${p}\\%$《引|び》きは、もとの□《倍|ばい》`, a: `$${decT(100 - p, 2)}$`, easy: `$(100-${p})\\div100=${decT(100 - p, 2)}$` };
        return { q: `$${p}\\%$《増|ま》しは、もとの□《倍|ばい》`, a: `$${decT(100 + p, 2)}$`, easy: `$(100+${p})\\div100=${decT(100 + p, 2)}$` };
      },
      // 歩合・去年の何%・引いてから同じ％増す（もとにもどらない）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 3) {
          const p = r.pick([10, 20, 30]), X = r.int(2, 30) * 100, Y = X * (100 - p) * (100 + p) / 10000;
          if (!Number.isInteger(Y)) return null;
          return { q: `$${X}$《円|えん》の《品物|しな|もの》を$${p}\\%$《引|び》きにして、そのねだんを$${p}\\%$《増|ま》しにすると□《円|えん》`, a: `$${Y}$`,
            easy: `$${X}\\times${decT(100 - p, 2)}\\times${decT(100 + p, 2)}=${Y}$` };
        }
        if (k === 0) {
          const w = r.int(1, 4), X = r.int(5, 50) * 100, Y = X * (10 - w) / 10;
          return { q: `$${X}$《円|えん》の《品物|しな|もの》が${w}《割|わり》《引|び》きで□《円|えん》`, a: `$${Y}$`, easy: `$${X}\\times${decT(10 - w, 1)}=${Y}$` };
        }
        if (k === 1) {
          const w = r.int(1, 5), X = r.int(2, 20) * 50, Y = X * (10 + w) / 10;
          return { q: `《去年|きょ|ねん》${X}《人|にん》だった《人数|にん|ずう》が、${w}《割|わり》《増|ま》しになると□《人|にん》`, a: `$${Y}$`, easy: `$${X}\\times${decT(10 + w, 1)}=${Y}$` };
        }
        const P = r.pick([105, 110, 115, 120, 125, 130, 150]), X = r.int(2, 20) * 40, Y = X * P / 100;
        if (!Number.isInteger(Y)) return null;
        return { q: `《去年|きょ|ねん》は${X}《人|にん》でした。《今年|ことし》は《去年|きょ|ねん》の$${P}\\%$で□《人|にん》`, a: `$${Y}$`, easy: `$${X}\\times${decT(P, 2)}=${Y}$` };
      },
      // わな：引いたあとのねだんから、もとをきかれる（かけない。わざ 2-38 で）。J-1
      trap(r) {
        const p = r.pick([10, 20, 30, 40, 25]), X = r.int(4, 40) * 100, Y = X * (100 - p) / 100;
        return dest({ q: `$${p}\\%$《引|び》きのねだんが${Y}《円|えん》です。もとのねだんは□《円|えん》`, a: `$${X}$`, verify: ok(X * (100 - p) === Y * 100, '') },
          '2-37', `もとをきかれている。かけずに $${Y}\\div${decT(100 - p, 2)}=${X}$`);
      },
    },
  });

  // ================================================================ 2-38
  M.add({
    id: '2-38', part: 3, chap: '2-5⑤', stars: 1,
    title: 'もとの《量|りょう》は「÷《割合|わり|あい》」でもどす',
    mark: '《増|ま》し・《引|び》きの**あとの《量|りょう》**がわかっていて、**もと**（いつもの《量|りょう》・もとのねだん）をきかれる。',
    futsu: ['10％《増量|ぞう|りょう》で440 mL。いつもを', '400、410、…と《決|き》めて1.1《倍|ばい》し、', '440になるかをためす。'],
    raku: ['440 mL はいつもの1.1《倍|ばい》。', 'もとにする《量|りょう》＝くらべる《量|りょう》÷《割合|わり|あい》', '$440\\div1.1=400$（mL）'],
    why: 'いつもの《量|りょう》を1とみると、10％《増量|ぞう|りょう》は1.1。「もと×1.1＝440」なので、440を1.1でわればもとにもどる（《教科書|きょう|か|しょ》 2-5③⑤）。',
    caution: 'もとがわかっていて、あとの《量|りょう》をきかれたら、わざ 2-37（かける）。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: 1,
    fits(q) {
      return /\\%\$(引き|増し|増量|ふえ)|割引き|割増し|効率|こう配|が入りました/.test(q) && /いつもは|もとのねだんは|もとは|去年は|うったのは|入れた電気は|水平に進んだのは/.test(q);
    },
    steps: {
      s1(r) {
        if (r.chance(0.5)) {
          const p = r.pick([10, 20, 25, 50]), X = r.int(2, 12) * 40, Y = X * (100 + p) / 100;
          if (!Number.isInteger(Y)) return null;
          return { q: `「$${p}\\%$《増量|ぞう|りょう》」で$${Y}\\,\\mathrm{mL}$のシャンプー。いつもは$□\\,\\mathrm{mL}$`, a: `$${X}$`, easy: `$${Y}\\div${decT(100 + p, 2)}=${X}$`, verify: ok(X * (100 + p) === Y * 100, '') };
        }
        const p = r.pick([10, 20, 30, 40, 25]), X = r.int(4, 40) * 100, Y = X * (100 - p) / 100;
        return { q: `$${p}\\%$《引|び》きで${Y}《円|えん》でした。もとのねだんは□《円|えん》`, a: `$${X}$`, easy: `$${Y}\\div${decT(100 - p, 2)}=${X}$`, verify: ok(X * (100 - p) === Y * 100, '') };
      },
      // ふえた・歩合
      s2(r) {
        if (r.chance(0.5)) {
          const p = r.pick([5, 10, 15, 20, 25, 30]), X = r.int(4, 40) * 20, Y = X * (100 + p) / 100;
          if (!Number.isInteger(Y)) return null;
          return { q: `《今年|ことし》の《人数|にん|ずう》は、《去年|きょ|ねん》より$${p}\\%$ふえて${Y}《人|にん》でした。《去年|きょ|ねん》は□《人|にん》`, a: `$${X}$`, easy: `$${Y}\\div${decT(100 + p, 2)}=${X}$`, verify: ok(X * (100 + p) === Y * 100, '') };
        }
        const w = r.int(1, 5), X = r.int(4, 40) * 100, Y = X * (10 - w) / 10;
        return { q: `${w}《割|わり》《引|び》きで${Y}《円|えん》でした。もとのねだんは□《円|えん》`, a: `$${X}$`, easy: `$${Y}\\div${decT(10 - w, 1)}=${X}$`, verify: ok(X * (10 - w) === Y * 10, '') };
      },
      // 割合の場面（シュート・効率・こう配）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const P = r.pick([40, 50, 60, 75, 80]), n = r.int(2, 10) * 4, m = n * P / 100;
          if (!Number.isInteger(m)) return null;
          return { q: `シュートの$${P}\\%$が《入|はい》りました。《入|はい》ったのは${m}《回|かい》です。うったのは□《回|かい》`, a: `$${n}$`, easy: `$${m}\\div${decT(P, 2)}=${n}$`, verify: ok(n * P === m * 100, '') };
        }
        if (k === 1) {
          const P = r.pick([60, 75, 80, 90]), A = r.int(2, 20) * 20, B = A * P / 100;
          if (!Number.isInteger(B)) return null;
          return { q: `《効率|こう|りつ》$${P}\\%$のモーターが$${B}\\,\\mathrm{W}$《分|ぶん》の《仕事|し|ごと》をしました。《入|い》れた《電気|でん|き》は$□\\,\\mathrm{W}$`, a: `$${A}$`, easy: `$${B}\\div${decT(P, 2)}=${A}$`, verify: ok(A * P === B * 100, '') };
        }
        const P = r.pick([4, 5, 8, 10]), A = r.int(2, 9) * 100, h = A * P / 100;
        return { q: `こう《配|ばい》$${P}\\%$の《坂|さか》を$${h}\\,\\mathrm{m}$《上|あ》がりました。《水平|すい|へい》に《進|すす》んだのは$□\\,\\mathrm{m}$`, a: `$${A}$`, easy: `$${h}\\div${decT(P, 2)}=${A}$`, verify: ok(A * P === h * 100, '') };
      },
      // わな：もとがわかっている（かける。2-37 で）
      trap(r) {
        if (r.chance(0.5)) {
          const p = r.pick([10, 30]), X = r.int(2, 12) * 100, Y = X * (100 + p) / 100;
          return dest({ q: `$${X}\\,\\mathrm{mL}$の$${p}\\%$《増|ま》しは$□\\,\\mathrm{mL}$`, a: `$${Y}$` }, '2-38', `もとがわかっている。わらずに $${X}\\times${decT(100 + p, 2)}=${Y}$`);
        }
        const p = r.pick([10, 30]), X = r.int(4, 40) * 100, Y = X * (100 - p) / 100;
        return dest({ q: `$${X}$《円|えん》の$${p}\\%$《引|び》きは□《円|えん》`, a: `$${Y}$` }, '2-38', `もとがわかっている。わらずに $${X}\\times${decT(100 - p, 2)}=${Y}$`);
      },
    },
  });

  // ================================================================ 2-39
  // 数の列（10^k 倍の整数）の文字
  const list = (v, k) => v.map(x => `$${dec(x, k)}$`).join('、');
  M.add({
    id: '2-39', part: 3, chap: '2-6②', stars: 1,
    title: '《平均|へい|きん》は「ちがう《部分|ぶ|ぶん》」だけたす（《仮|かり》の《平均|へい|きん》）',
    mark: '**どれも《近|ちか》い《数|かず》**の《平均|へい|きん》。きりのよい《数|かず》（《仮|かり》の《平均|へい|きん》）をこえた《部分|ぶ|ぶん》だけを《計算|けい|さん》する。',
    futsu: ['$14.63+14.65+14.62+14.66$', '$=58.56$、$58.56\\div4=14.64$', '《大|おお》きな《数|かず》のたし《算|ざん》。'],
    raku: ['14.60をこえた《部分|ぶ|ぶん》だけ：', '$0.03+0.05+0.02+0.06=0.16$', '$0.16\\div4=0.04$', '$14.60+0.04=14.64$'],
    why: '《平均|へい|きん》は、《合計|ごう|けい》を《変|か》えずにならした《数|かず》（《教科書|きょう|か|しょ》 2-6②）。14.60はどれにも《共通|きょう|つう》なので、ならしても14.60のまま。ちがう《部分|ぶ|ぶん》だけをならせばよい。',
    caution: '《数|かず》がはなれている（3、15、9、21）と、ちがう《部分|ぶ|ぶん》も《大|おお》きく、《楽|らく》にならない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (!/の平均は/.test(q)) return false;
      const v = maths(q.split('の平均')[0]).filter(t => /^\d+(\.\d+)?$/.test(t)).map(Number);
      if (v.length < 3) return false;
      const mx = Math.max(...v), mn = Math.min(...v);
      return mn > 0 && mx - mn <= 0.25 * mn;
    },
    steps: {
      // 仮の平均より上だけ
      s1(r) {
        const n = r.int(4, 5), k = r.pick([2, 1, 0]);
        const base = k === 2 ? r.int(100, 2000) * 10 : k === 1 ? r.int(10, 200) * 10 : r.int(5, 99) * 10;
        const d = Array.from({ length: n }, () => r.int(1, 9));
        const s = d.reduce((a, b) => a + b, 0);
        if (s % n !== 0 || new Set(d).size < 3) return null;
        const v = d.map(x => base + x), avg = base + s / n;
        return { q: `${list(v, k)} の《平均|へい|きん》は □`, a: `$${dec(avg, k)}$`, easy: `${dec(base, k)}＋${dec(s / n, k)}（こえた《部分|ぶ|ぶん》の《平均|へい|きん》）`, easyCheck: false,
          key: 'av' + v.slice().sort((x, y) => x - y).join(','), verify: ok(v.reduce((a, b) => a + b, 0) === avg * n, '平均') };
      },
      // 仮の平均より下もある（ひく）
      s2(r) {
        const n = r.int(4, 5), k = r.pick([1, 2, 0]);
        const base = k === 0 ? r.pick([50, 100, 200, 500]) : k === 1 ? r.int(1, 30) * 100 : r.int(1, 30) * 100;
        const d = Array.from({ length: n }, () => r.int(-5, 5));
        const s = d.reduce((a, b) => a + b, 0);
        if (s % n !== 0 || d.filter(x => x < 0).length < 1 || d.filter(x => x > 0).length < 1 || new Set(d).size < 3) return null;
        const v = d.map(x => base + x), avg = base + s / n;
        return { q: `${list(v, k)} の《平均|へい|きん》は □`, a: `$${dec(avg, k)}$`, easy: `${dec(base, k)}${s < 0 ? '－' : '＋'}${dec(Math.abs(s / n), k)}（ちがう《部分|ぶ|ぶん》の《平均|へい|きん》）`, easyCheck: false,
          key: 'av' + v.slice().sort((x, y) => x - y).join(','), verify: ok(v.reduce((a, b) => a + b, 0) === avg * n, '平均') };
      },
      // 合計＝平均×個数・1人ふえたときの平均・ふりこ
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.int(3, 8), a = r.int(55, 95);
          return { q: `${n}《回|かい》のテストの《平均|へい|きん》が${a}《点|てん》でした。《合計|ごう|けい》は□《点|てん》`, a: `$${a * n}$`, easy: `《合計|ごう|けい》＝《平均|へい|きん》×《個数|こ|すう》：$${a}\\times${n}=${a * n}$` };
        }
        if (k === 1) {
          const n = r.int(3, 6), a = r.int(130, 160), d = r.int(-3, 3);
          if (!d) return null;
          const b = a + (n + 1) * d;
          return { q: `${n}《人|にん》の《身長|しん|ちょう》の《平均|へい|きん》は$${a}\\,\\mathrm{cm}$です。そこへ$${b}\\,\\mathrm{cm}$の《人|ひと》が《入|はい》ると、《平均|へい|きん》は$□\\,\\mathrm{cm}$`, a: `$${a + d}$`,
            easy: `${a}を《仮|かり》の《平均|へい|きん》に：$${a}+(${b}-${a})\\div${n + 1}=${a + d}$`, verify: ok(n * a + b === (n + 1) * (a + d), '平均') };
        }
        const base = r.int(100, 200), d = [r.int(0, 6), r.int(0, 6), r.int(0, 6)], s = d[0] + d[1] + d[2];
        if (s % 3 !== 0 || new Set(d).size < 2) return null;
        const v = d.map(x => base + x);
        return { q: `《振|ふ》り《子|こ》の10《往復|おう|ふく》を3《回|かい》はかると、${v.map(x => `$${dec(x, 1)}$`).join('、')}《秒|びょう》でした。《平均|へい|きん》は□《秒|びょう》`, a: `$${dec(base + s / 3, 1)}$`,
          easy: `${dec(base, 1)}＋${dec(s / 3, 1)}（こえた《部分|ぶ|ぶん》の《平均|へい|きん》）`, easyCheck: false, key: 'av' + v.slice().sort((x, y) => x - y).join(','), verify: ok(v[0] + v[1] + v[2] === 3 * (base + s / 3), '平均') };
      },
      // わな：数がはなれている
      trap(r) {
        const n = 4, v = Array.from({ length: n }, () => r.int(2, 40));
        const s = v.reduce((a, b) => a + b, 0), mx = Math.max(...v), mn = Math.min(...v);
        if (s % n !== 0 || mx - mn < 15 || new Set(v).size < n) return null;
        return dest({ q: `${list(v, 0)} の《平均|へい|きん》は □`, a: `$${s / n}$`, key: 'av' + v.slice().sort((x, y) => x - y).join(','), verify: ok(s === n * (s / n), '平均') },
          '2-39', `はなれていて、《仮|かり》の《平均|へい|きん》で《楽|らく》にならない。$${s}\\div${n}=${s / n}$`);
      },
    },
  });

  // ================================================================ 2-40
  const PLACE = { 1: '《小数第|しょう|すう|だい》1《位|い》', 2: '《小数第|しょう|すう|だい》2《位|い》', 0: '《一|いち》の《位|くらい》', '-1': '《十|じゅう》の《位|くらい》', '-2': '《百|ひゃく》の《位|くらい》', '-3': '《千|せん》の《位|くらい》' };
  // n（10^k 倍の整数）を、位 j（小数第 j 位、0 は一の位、-1 は十の位）までに四捨五入 → [結果の整数, 結果のけた]
  function round(n, k, j) {
    const step = Math.pow(10, k - j);
    const v = roundTo(n, step);
    return j >= 0 ? [v / step, j] : [v / Math.pow(10, k), 0];
  }
  const seeDigit = (n, k, j) => Math.floor(n / Math.pow(10, k - j - 1)) % 10;   // すぐ下の位の数字
  M.add({
    id: '2-40', part: 3, chap: '2-6③', stars: 1,
    title: '《四捨五入|し|しゃ|ご|にゅう》は、すぐ《下|した》の《位|くらい》を1《回|かい》だけ《見|み》る',
    mark: '「○の《位|くらい》までのがい《数|すう》」。**すぐ《下|した》の《位|くらい》の《数字|すう|じ》だけ**を《見|み》て、1《回|かい》で《決|き》める。',
    futsu: ['2.348を、2.3と2.4のあいだの', '《数直線|すう|ちょく|せん》にかいて、', 'どちらに《近|ちか》いかを《見|み》る。'],
    raku: ['《小数第|しょう|すう|だい》1《位|い》まで → すぐ《下|した》の', '《小数第|しょう|すう|だい》2《位|い》の **4** だけを《見|み》る。', '4なので《切|き》り《捨|す》て：2.3'],
    why: '《四捨五入|し|しゃ|ご|にゅう》は、《近|ちか》いほうに《決|き》めること（《教科書|きょう|か|しょ》 2-6③）。2.348は2.3と2.4のあいだで、2.35より《小|ちい》さいので2.3に《近|ちか》い。2《回|かい》すると、《遠|とお》いほうになることがある。',
    caution: '「《切|き》り《捨|す》てる」「《切|き》り《上|あ》げる」は、《四捨五入|し|しゃ|ご|にゅう》ではない。くり《上|あ》がって1.96が2.0になるときも、0は《消|け》さない。',
    counts: { s1: 10, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '18mm',
    fits(q) { return /までのがい数にすると/.test(q) && !/見積/.test(q); },
    steps: {
      // 小数を小数第1位・第2位まで
      s1(r) {
        const k = r.pick([2, 3]), j = r.int(1, k - 1), n = r.int(Math.pow(10, k), 30 * Math.pow(10, k));
        if (n % 10 === 0) return null;
        const [v, vk] = round(n, k, j), dg = seeDigit(n, k, j);
        // くり上がって 0 になる（わな）はのぞく
        if (dg >= 5 && v % 10 === 0) return null;
        return { q: `$${dec(n, k)}$ を${PLACE[j]}までのがい《数|すう》にすると □`, a: `$${dec(v, vk)}$`,
          easy: `${PLACE[j + 1]}の${dg}を《見|み》て《切|き》り${dg >= 5 ? '《上|あ》げ' : '《捨|す》て'}`, verify: ok(Math.abs(v * Math.pow(10, k - vk) - n) * 2 <= Math.pow(10, k - vk), '四捨五入') };
      },
      // 2回すると変わる数（x.y4z、z≧5）・整数を十・百の位まで
      s2(r) {
        if (r.chance(0.6)) {
          const a = r.int(10, 300), z = r.int(5, 9), n = a * 100 + 40 + z;   // 小数第3位まで
          return { q: `$${dec(n, 3)}$ を《小数第|しょう|すう|だい》1《位|い》までのがい《数|すう》にすると □`, a: `$${dec(a, 1)}$`,
            easy: `《小数第|しょう|すう|だい》2《位|い》の4だけを《見|み》る（$${dec(a * 10 + 5, 2)}$ にしない）`, easyCheck: false, verify: ok(round(n, 3, 1)[0] === a, '四捨五入') };
        }
        const j = r.pick([-1, -2, -3]), step = Math.pow(10, -j), n = r.int(10, 99) * step + 4 * step / 10 + r.int(5, 9) * step / 100;
        if (!Number.isInteger(n) || n % 10 === 0) return null;
        const v = roundTo(n, step);
        return { q: `$${n}$ を${PLACE[j]}までのがい《数|すう》にすると □`, a: `$${v}$`, easy: `${PLACE[j + 1]}の4だけを《見|み》て《切|き》り《捨|す》て`, verify: ok(Math.abs(v - n) * 2 < step, '四捨五入') };
      },
      // はかった値・くり上がって x.0（0を消さない）
      s3(r) {
        if (r.chance(0.3)) {
          const a = r.int(1, 30), nn = (a - 1) * 100 + 90 + r.int(5, 9);   // (a-1).95〜(a-1).99 → a.0
          const [v] = round(nn, 2, 1);
          return { q: `$${dec(nn, 2)}$ を《小数第|しょう|すう|だい》1《位|い》までのがい《数|すう》にすると □`, a: `$${dec(v, 1)}$`,
            easy: `くり《上|あ》がって $${dec(v, 1)}$。0を《消|け》さない`, verify: ok(v === a * 10, '四捨五入') };
        }
        if (r.chance(0.5)) {
          const n = r.int(1000, 2500);   // cm の100倍
          if (n % 10 === 0) return null;
          const [v] = round(n, 2, 1), dg = seeDigit(n, 2, 1);
          if (dg >= 5 && v % 10 === 0) return null;
          return { q: `えんぴつの《長|なが》さ$${dec(n, 2)}\\,\\mathrm{cm}$を、《小数第|しょう|すう|だい》1《位|い》までのがい《数|すう》にすると$□\\,\\mathrm{cm}$`, a: `$${dec(v, 1)}$`,
            easy: `《小数第|しょう|すう|だい》2《位|い》の${dg}を《見|み》る`, verify: ok(Math.abs(v * 10 - n) * 2 <= 10, '四捨五入') };
        }
        const n = r.int(500, 3000);   // g の10倍
        if (n % 10 === 0) return null;
        const v = roundTo(n, 10) / 10, dg = n % 10;
        return { q: `《電子|でん|し》はかりの《表示|ひょう|じ》$${dec(n, 1)}\\,\\mathrm{g}$を、《一|いち》の《位|くらい》までのがい《数|すう》にすると$□\\,\\mathrm{g}$`, a: `$${v}$`,
          easy: `《小数第|しょう|すう|だい》1《位|い》の${dg}を《見|み》る`, verify: ok(Math.abs(v * 10 - n) * 2 <= 10, '四捨五入') };
      },
      // わな：切り捨て・切り上げ（四捨五入ではない。すぐ下の位を見て決めない）。J-1
      trap(r) {
        const a = r.int(10, 300), up = r.chance(0.5), z = up ? r.int(1, 4) : r.int(5, 9), n = a * 10 + z;   // 小数第2位まで（100倍）
        const v = up ? a + 1 : a;
        return dest({ q: `$${dec(n, 2)}$ の《小数第|しょう|すう|だい》2《位|い》を${up ? '《切|き》り《上|あ》げる' : '《切|き》り《捨|す》てる'}と □`, a: `$${dec(v, 1)}$`, verify: ok(up ? v * 10 > n : v * 10 < n, '切り捨て') },
          '2-40', `《四捨五入|し|しゃ|ご|にゅう》ではない。${z}を《見|み》ずに${up ? '1《上|あ》げる' : '《捨|す》てる'}`);
      },
    },
  });

  // ================================================================ 2-41
  const UNITS = ['cm', 'm', 'g', 'kg', 'mm'];
  M.add({
    id: '2-41', part: 3, chap: '2-6③④', stars: 1,
    title: '「5.0」は±《半分|はん|ぶん》のはば',
    mark: '「《何|なん》《以上|い|じょう》《何|なん》《未満|み|まん》」「ずれのはば」。**《書|か》いたいちばん《下|した》のけた**の1つ《分|ぶん》の、《半分|はん|ぶん》だけずれる。',
    futsu: ['6.0 cm になる《長|なが》さを、', '5.94、5.95、5.96……と', '1つずつ《四捨五入|し|しゃ|ご|にゅう》してためす。'],
    raku: ['6.0 のいちばん《下|した》のけたは0.1。', '《半分|はん|ぶん》は $0.1\\div2=0.05$', '$6.0-0.05=5.95$、$6.0+0.05=6.05$', '→ 5.95 cm《以上|い|じょう》6.05 cm《未満|み|まん》'],
    why: '《四捨五入|し|しゃ|ご|にゅう》は《近|ちか》いほうに《決|き》めるので、ずれは0.1の《半分|はん|ぶん》より《大|おお》きくならない（《教科書|きょう|か|しょ》 2-6③④）。「5」なら0.5、「14.63」なら0.005。',
    caution: '「$12.0\\pm0.2$」のように、はばが《書|か》いてあるときは《半分|はん|ぶん》にしない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '15mm', trap: '15mm' },
    fits(q) { return /以上|未満|ずれのはば/.test(q) && !/割合|倍/.test(q) && !/\\pm\d/.test(q); },
    steps: {
      // 小数第1位まで書いた値の、以上・未満
      s1(r) {
        const v = r.int(11, 300), u = r.pick(UNITS);   // 10倍
        const lo = v * 10 - 5, hi = v * 10 + 5;
        return { q: `「$${dec(v, 1)}\\,\\mathrm{${u}}$」と《書|か》かれた《長|なが》さは、$□\\,\\mathrm{${u}}$《以上|い|じょう》$□\\,\\mathrm{${u}}$《未満|み|まん》`.replace('《長|なが》さ', u === 'g' || u === 'kg' ? '《重|おも》さ' : '《長|なが》さ'),
          a: `$${dec(lo, 2)}$、$${dec(hi, 2)}$`, easy: `$\\pm0.05$`, easyCheck: false, verify: ok(hi - lo === 10 && (lo + hi) / 2 === v * 10, 'はんい') };
      },
      // ずれのはば（けたの数を変える）・整数で書いた値
      s2(r) {
        const k = r.pick([0, 1, 2, 2]), u = r.pick(UNITS);
        const v = k === 0 ? r.int(2, 200) : k === 1 ? r.int(11, 300) : r.int(101, 3000);
        if (v % 10 === 0 && k > 0) return null;
        if (r.chance(0.5)) {
          return { q: `「$${dec(v, k)}\\,\\mathrm{${u}}$」と《書|か》かれた《値|あたい》のずれのはばは、$\\pm□\\,\\mathrm{${u}}$`, a: `$${dec(5, k + 1)}$`, easy: `$${dec(1, k)}\\div2=${dec(5, k + 1)}$`, verify: ok(true, '') };
        }
        const lo = v * 10 - 5, hi = v * 10 + 5;
        return { q: `「$${dec(v, k)}\\,\\mathrm{${u}}$」と《書|か》かれた《値|あたい》は、$□\\,\\mathrm{${u}}$《以上|い|じょう》$□\\,\\mathrm{${u}}$《未満|み|まん》`, a: `$${dec(lo, k + 1)}$、$${dec(hi, k + 1)}$`, easy: `$\\pm${dec(5, k + 1)}$`, easyCheck: false, verify: ok((lo + hi) / 2 === v * 10, 'はんい') };
      },
      // 四捨五入して○になる数
      s3(r) {
        if (r.chance(0.5)) {
          const v = r.int(11, 99), lo = v * 10 - 5, hi = v * 10 + 5;
          return { q: `《小数第|しょう|すう|だい》1《位|い》までの《四捨五入|し|しゃ|ご|にゅう》で$${dec(v, 1)}$になる《数|かず》：□《以上|い|じょう》□《未満|み|まん》`, a: `$${dec(lo, 2)}$、$${dec(hi, 2)}$`, easy: `$${dec(v, 1)}\\pm0.05$`, easyCheck: false, verify: ok(round(lo, 2, 1)[0] === v && round(hi - 1, 2, 1)[0] === v && round(hi, 2, 1)[0] === v + 1, 'はんい') };
        }
        const v = r.int(3, 99) * 10, lo = v * 10 - 5, hi = v * 10 + 5;
        return { q: `《一|いち》の《位|くらい》までの《四捨五入|し|しゃ|ご|にゅう》で$${v / 10}\\,\\mathrm{m}$になる《長|なが》さ：$□\\,\\mathrm{m}$《以上|い|じょう》$□\\,\\mathrm{m}$《未満|み|まん》`, a: `$${dec(v - 5, 1)}$、$${dec(v + 5, 1)}$`, easy: `$${v / 10}\\pm0.5$`, easyCheck: false, verify: ok(roundTo(v - 5, 10) === v && roundTo(v + 4, 10) === v && roundTo(v + 5, 10) === v + 10 && lo < hi, 'はんい') };
      },
      // わな：はばが書いてある（半分にしない）
      trap(r) {
        const v = r.int(20, 300), e = r.pick([1, 2, 3, 4, 5]), u = r.pick(['cm', 'mm', 'g']);
        return dest({ q: `「$${dec(v, 1)}\\pm${dec(e, 1)}\\,\\mathrm{${u}}$」の《値|あたい》は、$□\\,\\mathrm{${u}}$から$□\\,\\mathrm{${u}}$のあいだ`, a: `$${dec(v - e, 1)}$、$${dec(v + e, 1)}$`, verify: ok(true, '') },
          '2-41', `はばが《書|か》いてある。《半分|はん|ぶん》にしない`);
      },
    },
  });

  // ================================================================ 2-42
  M.add({
    id: '2-42', part: 3, chap: '2-6⑤', stars: 1,
    title: 'ずれの《割合|わり|あい》は「ずれ÷はかった《値|あたい》」',
    mark: '$\\pm$ のついた《値|あたい》の「**《何|なん》％**」。はかった《値|あたい》がもとにする《量|りょう》、ずれがくらべる《量|りょう》。',
    futsu: ['30.0の1％、2％、……を', '《順|じゅん》に《計算|けい|さん》して、', 'ずれの0.3になる％をさがす。'],
    raku: ['もとにする《量|りょう》は30.0。', '$0.3\\div30.0=0.01$', '100をかけて1％'],
    why: '《割合|わり|あい》＝くらべる《量|りょう》÷もとにする《量|りょう》（《教科書|きょう|か|しょ》 2-5③）。ずれの《数|かず》が《同|おな》じでも、はかった《値|あたい》が《大|おお》きいほど、ずれの《割合|わり|あい》は《小|ちい》さい（《教科書|きょう|か|しょ》 2-6⑤）。',
    caution: '「はかった《値|あたい》はずれの《何倍|なん|ばい》か」なら、わる《向|む》きが《反対|はん|たい》。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    fits(q) { return /ずれの割合/.test(q) || (/\\pm/.test(q) && /□％/.test(q)); },
    steps: {
      // ± のついた値
      s1(r) {
        const P10 = r.pick([1, 2, 5, 10, 20, 50]), V = r.int(1, 50) * 10, u = r.pick(['mm', 'cm', 'g', 'm']);   // P10：％の10倍、V：10倍
        const eTh = V * P10 / 10;   // ずれ（1000倍）
        if (!Number.isInteger(eTh) || eTh % 100 !== 0) return null;
        const e = dec(eTh / 100, 1), p = decT(P10, 1);   // ずれのけたを値にそろえる（R1-22）
        return { q: `$${dec(V, 1)}\\pm${e}\\,\\mathrm{${u}}$ のずれの《割合|わり|あい》は □％`, a: `$${p}$`, easy: `$${e}\\div${dec(V, 1)}=${decT(P10, 3)}$`, val: decT(P10, 3), verify: ok(eTh * 1000 === V * 100 * P10, '割合') };
      },
      // 書き方から、ずれを出してから割合へ
      s2(r) {
        const k = r.pick([1, 2]), u = r.pick(['cm', 'mm', 'g']);
        const V = r.pick(k === 1 ? [25, 50, 100, 125, 250, 500, 1000] : [125, 250, 500, 1000, 1250, 2500]);   // 10^k 倍
        // ずれは 0.5×10^-k、割合 = 5 / (10 V)
        const ratio = F.make(5, 10 * V), P = F.mul(ratio, F.make(100));
        const Pd = fracDec(P), Rd = fracDec(ratio);
        if (!Pd || !Rd || Pd.length > 5) return null;
        const e = dec(5, k + 1);
        return { q: `「$${dec(V, k)}\\,\\mathrm{${u}}$」と《書|か》いた《値|あたい》の、ずれの《割合|わり|あい》は □％`, a: `$${Pd}$`, easy: `ずれは $\\pm${e}$、$${e}\\div${dec(V, k)}=${Rd}$`,
          val: Rd, verify: ok(F.eq(F.mul(F.fromDec(Rd), F.make(100)), F.fromDec(Pd)), '割合') };
      },
      // ずれを求める（もとにする量×割合）・時間
      s3(r) {
        if (r.chance(0.5)) {
          const P = r.pick([1, 2, 5]), V = r.int(2, 30) * 50, u = r.pick(['cm', 'mm', 'g']);   // V：10倍
          const eH = V * P / 10;   // ずれ（100倍）
          if (!Number.isInteger(eH)) return null;
          return { q: `ずれの《割合|わり|あい》が$${P}\\%$で、はかった《値|あたい》が$${dec(V, 1)}\\,\\mathrm{${u}}$なら、ずれは$\\pm□\\,\\mathrm{${u}}$`, a: `$${decT(eH, 2)}$`, easy: `$${dec(V, 1)}\\times${decT(P, 2)}=${decT(eH, 2)}$`, verify: ok(eH * 100 === V * 10 * P, '') };
        }
        const T = r.pick([50, 100, 200, 250, 500]), P10 = r.pick([1, 2, 4, 5, 10, 20]);   // T：10倍の秒
        const eH = T * P10 / 100;   // 100倍
        if (!Number.isInteger(eH) || eH < 1) return null;
        return { q: `ストップウォッチで$${dec(T * 10, 2)}$《秒|びょう》とはかりました。ずれが$\\pm${dec(eH, 2)}$《秒|びょう》なら、ずれの《割合|わり|あい》は □％`, a: `$${decT(P10, 1)}$`,
          easy: `$${dec(eH, 2)}\\div${dec(T * 10, 2)}=${decT(P10, 3)}$`, val: decT(P10, 3), verify: ok(eH * 1000 === T * P10 * 10, '') };
      },
      // わな：ずれの何倍か（わる向きが反対）
      trap(r) {
        const V = r.int(2, 50) * 10, e = r.pick([5, 2, 1]), u = r.pick(['cm', 'g']);   // V・e：10倍
        const n = V / e;
        if (!Number.isInteger(n)) return null;
        return dest({ q: `$${dec(V, 1)}\\pm${dec(e, 1)}\\,\\mathrm{${u}}$ の$${dec(V, 1)}$は、ずれ$${dec(e, 1)}$の□《倍|ばい》`, a: `$${n}$` }, '2-42', `ずれの《割合|わり|あい》ではない。$${dec(V, 1)}\\div${dec(e, 1)}=${n}$`);
      },
    },
  });

  // ================================================================ 2-43
  M.add({
    id: '2-43', part: 3, chap: '2-6⑥', stars: 1,
    title: 'まとめてはかって、《数|かず》でわる',
    mark: '「100まいで」「20《往復|おう|ふく》で」。**まとめた《量|りょう》**を、まとめた《数|かず》でわる。ストップウォッチの「《分|ふん》:《秒|びょう》」は《秒|びょう》にそろえる。',
    futsu: ['1まいの《厚|あつ》さを、', 'ものさしで1まいだけはかる。', '《目|め》もり1つもなく、はかれない。'],
    raku: ['100まいで9.2 mm', '$9.2\\div100=0.092$（mm）', '「01:05.20」は $60+5.20=65.20$《秒|びょう》'],
    why: 'ものさしやストップウォッチのずれは、まとめてはかっても1《回|かい》《分|ぶん》で《同|おな》じ。わると、1つあたりのずれも《小|ちい》さくなる（《教科書|きょう|か|しょ》 2-6⑥）。',
    caution: '1つ《分|ぶん》がわかっていて、まとめた《量|りょう》をきかれたら、わらずにかける。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /まいを重ねて|まいで|つぶの重さ|往復をはかる|往復で「|往復を3回/.test(q) && /1まい|1つぶ|1往復/.test(q); },
    steps: {
      s1(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.pick([10, 20, 50, 100, 200, 1000]), t = r.int(60, 120);   // 1まい（1000倍 mm）
          const tot = t * n;   // 1000倍 mm
          return { q: `《紙|かみ》${n}まいを《重|かさ》ねてはかると$${decT(tot, 3)}\\,\\mathrm{mm}$でした。1まいの《厚|あつ》さは$□\\,\\mathrm{mm}$`, a: `$${decT(t, 3)}$`, easy: `$${decT(tot, 3)}\\div${n}=${decT(t, 3)}$` };
        }
        if (k === 1) {
          const n = r.pick([10, 100, 1000]), w = r.int(15, 30);   // 1つぶ（1000倍 g）
          return { q: `《米|こめ》${n}つぶの《重|おも》さは$${decT(w * n, 3)}\\,\\mathrm{g}$でした。1つぶは$□\\,\\mathrm{g}$`, a: `$${decT(w, 3)}$`, easy: `$${decT(w * n, 3)}\\div${n}=${decT(w, 3)}$` };
        }
        const n = r.pick([10, 20, 50]), t = r.int(80, 200);   // 1往復（100倍 秒）
        if ((t * n) % 10 !== 0 && n === 10) return null;
        return { q: `《振|ふ》り《子|こ》の${n}《往復|おう|ふく》をはかると$${decT(t * n, 2)}$《秒|びょう》でした。1《往復|おう|ふく》は□《秒|びょう》`, a: `$${decT(t, 2)}$`, easy: `$${decT(t * n, 2)}\\div${n}=${decT(t, 2)}$` };
      },
      // ストップウォッチの「分:秒」
      s2(r) {
        const n = r.pick([10, 20, 30, 40, 50]), t = r.int(100, 300), C = t * n;   // 100倍 秒
        if (C < 6000 || C >= 30000) return null;
        const mi = Math.floor(C / 6000), se = C - mi * 6000;
        const disp = `${String(mi).padStart(2, '0')}:${dec(se, 2).padStart(5, '0')}`;
        return { q: `${n}《往復|おう|ふく》で「${disp}」。1《往復|おう|ふく》は□《秒|びょう》`, a: `$${dec(t, 2)}$`,
          easy: `$(${60 * mi}+${dec(se, 2)})\\div${n}=${dec(t, 2)}$`, verify: ok(mi * 6000 + se === t * n, '秒') };
      },
      // 単位をそろえる・平均してからわる
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.pick([100, 200, 500]), t = r.int(60, 120);   // 1まい（1000倍 mm）
          const cm = t * n / 10;   // 1000倍 cm … t*n/1000 mm = t*n/10000 cm
          if ((t * n) % 100 !== 0) return null;
          return { q: `《紙|かみ》${n}まいを《重|かさ》ねると$${decT(t * n / 10, 3)}\\,\\mathrm{cm}$でした。1まいの《厚|あつ》さは$□\\,\\mathrm{mm}$`, a: `$${decT(t, 3)}$`,
            easy: `mm にして $${decT(t * n, 3)}\\div${n}=${decT(t, 3)}$`, easyCheck: false, verify: ok(cm * 10 === t * n, '') };
        }
        const n = r.pick([10, 20]), t = r.int(100, 250), A = t * n;   // 100倍 秒
        const d = r.shuffle(r.pick([[-30, 0, 30], [-20, 10, 10], [30, -30, 0], [-10, -20, 30], [20, -10, -10]]));
        const v = d.map(x => A + x);
        if (v.some(x => x >= 6000)) return null;
        return { q: `${n}《往復|おう|ふく》を3《回|かい》はかると${v.map(x => `$${dec(x, 2)}$`).join('、')}《秒|びょう》。1《往復|おう|ふく》は□《秒|びょう》`, a: `$${dec(t, 2)}$`,
          easy: `《平均|へい|きん》は${dec(A, 2)}、$${dec(A, 2)}\\div${n}=${dec(t, 2)}$`, verify: ok(v[0] + v[1] + v[2] === 3 * t * n, '') };
      },
      // わな：1まいがわかっている（かける）
      trap(r) {
        const n = r.pick([100, 200, 500, 1000]), t = r.int(60, 120);
        return dest({ q: `1まい$${decT(t, 3)}\\,\\mathrm{mm}$の《紙|かみ》${n}まいの《厚|あつ》さは$□\\,\\mathrm{mm}$`, a: `$${decT(t * n, 3)}$` }, '2-43', `1まいがわかっている。わらずに $${decT(t, 3)}\\times${n}=${decT(t * n, 3)}$`);
      },
    },
  });

  // ================================================================ 2-94
  M.add({
    id: '2-94', part: 3, chap: '2-5の《先|さき》', stars: 2,
    title: '《全体|ぜん|たい》を《比|ひ》で《分|わ》ける（《全体|ぜん|たい》は《比|ひ》の《和|わ》）',
    mark: '**《全体|ぜん|たい》**（《合|あ》わせた《量|りょう》）を $a:b$ に《分|わ》ける。《全体|ぜん|たい》は $a+b$ こ《分|ぶん》とみる。',
    futsu: ['60を $2:3$ に《分|わ》ける。', '20と40？　24と36？……と', 'ためしてさがす。'],
    raku: ['《全体|ぜん|たい》は $2+3=5$ こ《分|ぶん》。', '1こ《分|ぶん》：$60\\div5=12$', '$12\\times2=24$、$12\\times3=36$'],
    why: '$2:3$ は「2こ《分|ぶん》と3こ《分|ぶん》」。《合|あ》わせると5こ《分|ぶん》が《全体|ぜん|たい》なので、《全体|ぜん|たい》を5でわれば1こ《分|ぶん》が《出|で》る（《教科書|きょう|か|しょ》 2-5）。',
    caution: '《全体|ぜん|たい》ではなく、《片方|かた|ほう》の《量|りょう》がわかっているときは、わざ 2-31。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    fits(q) { return /\$\d+(?::\d+)+\$/.test(q) && /に分けると|に分けます|分けて切る|合わせて|を作る|ちがいは/.test(q); },
    steps: {
      s1(r) {
        const p = r.int(1, 7), q = r.int(1, 7), u = r.int(2, 20);
        if (p === q || gcd(p, q) !== 1) return null;
        const X = u * (p + q);
        return { q: `$${X}$を$${p}:${q}$に《分|わ》けると、□と□`, a: `$${u * p}$、$${u * q}$`, easy: `1こ《分|ぶん》は $${X}\\div${p + q}=${u}$`, easyCheck: false,
          verify: ok(u * p + u * q === X && (u * p) * q === (u * q) * p, '分け方') };
      },
      // 3つに分ける・片方だけきく
      s2(r) {
        if (r.chance(0.5)) {
          const p = r.int(1, 5), q = r.int(1, 5), s = r.int(1, 5), u = r.int(2, 15);
          if (new Set([p, q, s]).size < 3) return null;
          const X = u * (p + q + s);
          return { q: `$${X}$を$${p}:${q}:${s}$に《分|わ》けると、□と□と□`, a: `$${u * p}$、$${u * q}$、$${u * s}$`, easy: `1こ《分|ぶん》は $${X}\\div${p + q + s}=${u}$`, easyCheck: false, verify: ok(u * (p + q + s) === X, '') };
        }
        const p = r.int(2, 7), q = r.int(1, 6), u = r.int(2, 30) * 10;
        if (p <= q || gcd(p, q) !== 1) return null;
        const X = u * (p + q);
        return { q: `${X}《円|えん》を、《兄|あに》と《弟|おとうと》で$${p}:${q}$に《分|わ》けます。《兄|あに》は□《円|えん》`, a: `$${u * p}$`, easy: `$${X}\\div${p + q}\\times${p}=${u * p}$` };
      },
      // ジュースを作る・ちがいがわかる・ひもを切る
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [p, q] = r.pick([[1, 4], [1, 3], [2, 3], [1, 5]]), u = r.int(2, 30) * 10, X = u * (p + q);
          return { q: `《原液|げん|えき》と《水|みず》を$${p}:${q}$で、ジュース$${X}\\,\\mathrm{mL}$を《作|つく》る。《原液|げん|えき》は$□\\,\\mathrm{mL}$`, a: `$${u * p}$`, easy: `$${X}\\div${p + q}\\times${p}=${u * p}$` };
        }
        if (k === 1) {
          const p = r.int(3, 9), q = r.int(1, p - 1), u = r.int(2, 15);
          if (gcd(p, q) !== 1) return null;
          return { q: `AとBの《比|ひ》は$${p}:${q}$で、ちがいは${u * (p - q)}です。Aは□`, a: `$${u * p}$`, easy: `ちがいは${p - q}こ《分|ぶん》：$${u * (p - q)}\\div${p - q}\\times${p}=${u * p}$` };
        }
        const p = r.int(1, 6), q = r.int(1, 6), u = r.int(5, 30);
        if (p >= q || gcd(p, q) !== 1) return null;
        const X = u * (p + q);
        return { q: `$${X}\\,\\mathrm{cm}$のひもを$${p}:${q}$に《分|わ》けて《切|き》る。《短|みじか》いほうは$□\\,\\mathrm{cm}$`, a: `$${u * p}$`, easy: `$${X}\\div${p + q}\\times${p}=${u * p}$` };
      },
      // わな：全体ではなく片方がわかっている（2-31 で）
      trap(r) {
        const [p, q] = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [1, 4]]), u = r.int(3, 20);
        return dest({ q: `《酢|す》と《油|あぶら》を$${p}:${q}$でまぜます。《酢|す》が$${u * p}\\,\\mathrm{mL}$なら、《油|あぶら》は$□\\,\\mathrm{mL}$`, a: `$${u * q}$` }, '2-94', `${u * p} mL は《全体|ぜん|たい》ではなく《酢|す》だけ。$${q}\\times${u}=${u * q}$`);
      },
    },
  });

  // ================================================================ 2-95
  M.add({
    id: '2-95', part: 3, chap: '2-5の《先|さき》', stars: 2,
    title: '$b$ の $a\\%$ は $a$ の $b\\%$',
    mark: '「$b$ の $a\\%$」で、**$b$ のほうが50・25・20・10**のような《数|かず》。《入|い》れかえると、よく《出|で》る％になる。',
    futsu: ['50の8％。', '$50\\times0.08$ を', '《計算|けい|さん》する。'],
    raku: ['50の8％＝8の50％', '$8\\times\\frac{1}{2}=4$'],
    why: '$b$ の $a\\%$ は $b\\times a\\div100$。かけ《算|ざん》は《入|い》れかえても《同|おな》じなので、$a\\times b\\div100$ ＝ $a$ の $b\\%$（《教科書|きょう|か|しょ》 2-5）。',
    caution: 'どちらの《数|かず》も、よく《出|で》る％にならない（36の24％）なら、そのまま《計算|けい|さん》する。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    fits(q) {
      if (/引き|増し|増量/.test(q)) return false;
      const m = ofPct(q);
      if (!m || NICE[m[1]] || +m[1] % 10 === 0) return false;
      return !!NICE[m[0]] || ['10', '200'].includes(m[0]);
    },
    steps: {
      s1(r) {
        const X = r.pick(['50', '25', '20', '10']), [n, d] = X === '10' ? [1, 10] : NICE[X];
        const Y = d * r.int(1, 19);
        if (Y >= 100 || NICE[String(Y)] || Y % 10 === 0) return null;
        const ans = Y * n / d;
        return { q: `$${X}$の$${Y}\\%$は□`, a: `$${ans}$`, easy: `${Y}の${X}％：$${Y}\\times\\frac{${n}}{${d}}=${ans}$`, key: 'pp' + [X, Y].sort().join(',') };
      },
      // 75・40・60・80 など、分子が1でない
      s2(r) {
        const X = r.pick(['75', '40', '60', '80']), [n, d] = NICE[X];
        const Y = d * r.int(2, 24);
        if (Y >= 100 || NICE[String(Y)] || Y % 10 === 0) return null;
        const ans = F.make(Y * n, d);
        if (ans[1] !== 1) return null;
        return { q: `$${X}$の$${Y}\\%$は□`, a: `$${ans[0]}$`, easy: `${Y}の${X}％：$${Y}\\times\\frac{${n}}{${d}}=${ans[0]}$`, key: 'pp' + [X, Y].sort().join(',') };
      },
      // ことばの問題
      s3(r) {
        const X = r.pick(['50', '25', '20']), [n, d] = NICE[X];
        const Y = d * r.int(1, 19);
        if (Y >= 100 || NICE[String(Y)] || Y === 10) return null;
        const ans = Y * n / d;
        const q = r.chance(0.5)
          ? `${X}《人|にん》のうち$${Y}\\%$が《電車|でん|しゃ》で《来|き》ます。《電車|でん|しゃ》で《来|く》るのは□《人|にん》`
          : `くじ${X}まいのうち$${Y}\\%$があたりです。あたりは□まい`;
        return { q, a: `$${ans}$`, easy: `${Y}の${X}％：$${Y}\\times\\frac{${n}}{${d}}=${ans}$` };
      },
      // わな：どちらもよく出る％にならない
      trap(r) {
        const X = r.pick([36, 24, 28, 32, 26, 34, 38, 46]), Y = r.pick([24, 36, 28, 32, 26, 34, 38, 46]);
        if (X === Y) return null;
        return dest({ q: `$${X}$の$${Y}\\%$は□`, a: `$${decT(X * Y, 2)}$`, key: 'pp' + [X, Y].sort().join(',') }, '2-95', `どちらもよく《出|で》る％にならない。$${X}\\times${decT(Y, 2)}=${decT(X * Y, 2)}$`);
      },
    },
  });

  // ================================================================ 2-96
  // p％を 10％（t）と 1％（o）で組み立てる式
  function combo(p, X) {
    const t = F.make(X, 10), o = F.make(X, 100), h = F.make(X, 20);
    const s = x => (x[1] === 1 ? String(x[0]) : decT(x[0] * 100 / x[1], 2));
    const T = s(t), O = s(o), H = s(h);
    const map = {
      5: ['10％の《半分|はん|ぶん》', `${T}\\div2`], 15: ['10％＋5％', `${T}+${H}`], 30: ['10％×3', `${T}\\times3`], 35: ['10％×3＋5％', `${T}\\times3+${H}`],
      45: ['10％×4＋5％', `${T}\\times4+${H}`], 11: ['10％＋1％', `${T}+${O}`], 9: ['10％－1％', `${T}-${O}`], 21: ['10％×2＋1％', `${T}\\times2+${O}`],
      12: ['10％＋1％×2', `${T}+${O}\\times2`], 19: ['10％×2－1％', `${T}\\times2-${O}`], 2: ['1％×2', `${O}\\times2`], 3: ['1％×3', `${O}\\times3`],
    };
    return { T, O, txt: map[p][0], ex: map[p][1] };
  }
  M.add({
    id: '2-96', part: 3, chap: '2-5の《先|さき》', stars: 2,
    title: '10％・1％を《先|さき》に《出|だ》して《組|く》み《合|あ》わせる',
    mark: '**15％・5％・30％・11％**など。10％（÷10）と1％（÷100）は《小数点|しょう|すう|てん》を《動|うご》かすだけで《出|で》る。',
    futsu: ['3400《円|えん》の15％。', '$3400\\times0.15$ を', '《筆算|ひっ|さん》でする。'],
    raku: ['10％は340、5％はその《半分|はん|ぶん》で170。', '15％＝10％＋5％', '$340+170=510$'],
    why: '10％は《割合|わり|あい》0.1なので÷10、1％は÷100（《教科書|きょう|か|しょ》 2-1・2-5）。ほかの％は、それを《何倍|なん|ばい》かして、たしたりひいたりすれば《出|で》る。',
    caution: '25％・50％・75％は、《分数|ぶん|すう》（$\\frac{1}{4}$ など）にするほうが《楽|らく》（わざ 2-36）。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    cols: 1,
    fits(q) {
      if (/いつも|もとの|もとは|去年は|引き|増し|増量/.test(q)) return false;
      const m = ofPct(q);
      return !!m && P96.includes(m[1]) && +m[0] >= 100 && +m[0] % 10 === 0;
    },
    steps: {
      s1(r) {
        const p = r.pick([15, 5, 30, 11, 9]), X = r.int(11, 99) * 100, ans = X * p / 100, c = combo(p, X);
        return { q: `$${X}$《円|えん》の$${p}\\%$は□《円|えん》`, a: `$${ans}$`, easy: `${c.txt}：$${c.ex}=${ans}$` };
      },
      // 小数がでる・組み合わせが多い
      s2(r) {
        const p = r.pick([35, 45, 21, 12, 19, 2, 3, 15]), X = r.int(11, 99) * 10, c = combo(p, X);
        const ans = decT(X * p, 2);
        return { q: `$${X}$の$${p}\\%$は□`, a: `$${ans}$`, easy: `${c.txt}：$${c.ex}=${ans}$` };
      },
      // ことばの問題（ふえた人数・ねびき）
      s3(r) {
        const p = r.pick([15, 5, 30, 11, 9, 35]), X = r.int(11, 99) * 100, ans = X * p / 100, c = combo(p, X);
        if (r.chance(0.5)) return { q: `《去年|きょ|ねん》${X}《人|にん》だった《人数|にん|ずう》が、$${p}\\%$ふえました。ふえたのは□《人|にん》`, a: `$${ans}$`, easy: `${c.txt}：$${c.ex}=${ans}$` };
        if (![15, 5, 30].includes(p)) return null;
        return { q: `${X}《円|えん》のくつが$${p}\\%$《引|び》きです。ねびきは□《円|えん》`, a: `$${ans}$`, easy: `${c.txt}：$${c.ex}=${ans}$` };
      },
      // わな：25%・50%・75%（分数のほうが楽。2-36 で）
      trap(r) {
        const p = r.pick(['25', '50', '75']), [n, d] = NICE[p], X = r.int(11, 99) * 100, ans = X * n / d;
        return dest({ q: `$${X}$《円|えん》の$${p}\\%$は□《円|えん》`, a: `$${ans}$` }, '2-96', `${p}％は${d}《分|ぶん》の${n}。$${X}\\times\\frac{${n}}{${d}}=${ans}$`);
      },
    },
  });

  // ================================================================ 2-97
  // 上から1けたのがい数（正の整数）
  const sig1 = n => { const s = Math.pow(10, String(n).length - 1); return roundTo(n, s); };
  M.add({
    id: '2-97', part: 3, chap: '2-6③の《先|さき》', stars: 2,
    title: 'がい《数|すう》で《答|こた》えを《見積|み|つ》もる',
    mark: '「およそ」「《見積|み|つ》もる」。**198→200、31→30** のように、きりのよい《数|かず》にしてから《計算|けい|さん》する。',
    futsu: ['$198\\times31$ を《筆算|ひっ|さん》して', '6138。それから', '「およそ6000」と《言|い》う。'],
    raku: ['198は200、31は30とみる。', '$198\\times31$', '$\\approx200\\times30=6000$'],
    why: '《上|うえ》から1けたのがい《数|すう》（《教科書|きょう|か|しょ》 2-6③）にすると、0をのぞいて1けたの《計算|けい|さん》になる。《答|こた》えの《大|おお》きさ（けた）をまちがえていないかの《確|たし》かめにもなる。',
    caution: 'おつりやねだんのように、ちょうどの《数|かず》が《要|い》るときは、がい《数|すう》にしない。',
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    cols: 1,
    boxw: '20mm',
    fits(q) { return /見積も|およそ/.test(q); },
    steps: {
      // 3けた×2けた
      s1(r) {
        const A = r.int(1, 9) * 100, B = r.int(2, 9) * 10;
        const a = A + r.pick([-4, -3, -2, -1, 1, 2, 3, 4]) * (A >= 500 ? 2 : 1), b = B + r.pick([-2, -1, 1, 2]);
        if (a < 100 || a > 999 || b < 10 || b > 99 || sig1(a) !== A || sig1(b) !== B) return null;
        return { q: `$${a}\\times${b}$ を《上|うえ》から1けたのがい《数|すう》にして《見積|み|つ》もると □`, a: `$${A * B}$`, easy: `$${A}\\times${B}=${A * B}$`, key: 'e' + [a, b].sort().join(','), verify: ok(sig1(a) * sig1(b) === A * B, '見積もり') };
      },
      // わり算・たし算
      s2(r) {
        if (r.chance(0.5)) {
          const B = r.int(2, 9) * 10, Q = r.int(1, 9) * 10, A = B * Q;
          if (String(A).length > 4 || sig1(A) !== A) return null;
          const a = A + r.pick([-3, -2, -1, 1, 2, 3]) * Math.pow(10, String(A).length - 2), b = B + r.pick([-1, 1, 2]);
          if (sig1(a) !== A || sig1(b) !== B) return null;
          return { q: `$${a}\\div${b}$ を《上|うえ》から1けたのがい《数|すう》にして《見積|み|つ》もると □`, a: `$${Q}$`, easy: `$${A}\\div${B}=${Q}$`, verify: ok(sig1(a) / sig1(b) === Q, '見積もり') };
        }
        const v = [0, 1, 2].map(() => r.int(1, 9) * 100 + r.pick([-3, -2, -1, 1, 2, 3]) * r.pick([1, 2, 5]));
        if (v.some(x => x < 100)) return null;
        const w = v.map(x => roundTo(x, 100)), s = w[0] + w[1] + w[2];
        return { q: `$${v.join('+')}$ を《百|ひゃく》の《位|くらい》までのがい《数|すう》にして《見積|み|つ》もると □`, a: `$${s}$`, easy: `$${w.join('+')}=${s}$`, key: 'e+' + v.slice().sort().join(','), verify: ok(s === w.reduce((x, y) => x + y, 0), '見積もり') };
      },
      // 買い物・答えを選ぶ
      s3(r) {
        if (r.chance(0.5)) {
          const A = r.int(1, 3) * 100, n = r.pick([11, 19, 21, 29, 31, 39, 41]), N = roundTo(n, 10);
          const a = A + r.pick([-2, -1, 1, 2]) * 1;
          if (sig1(a) !== A || A === 0) return null;
          return { q: `1こ${a}《円|えん》のパン${n}こは、《上|うえ》から1けたのがい《数|すう》にして《見積|み|つ》もると、およそ□《円|えん》`, a: `$${A * N}$`, easy: `$${A}\\times${N}=${A * N}$`, verify: ok(sig1(n) === N, '見積もり') };
        }
        const x10 = r.int(21, 99) * 10 + r.int(1, 9), y10 = r.int(16, 49);   // 10倍
        if (y10 % 10 === 0) return null;
        const P = x10 * y10;   // 100倍
        const ex = decT(P, 2), c = r.shuffle([ex, decT(P, 1), decT(P, 3)]);
        if (new Set(c).size < 3) return null;
        const X = sig1(Math.round(x10 / 10)), Y = sig1(Math.round(y10 / 10)) || 1;
        return { q: `$${dec(x10, 1)}\\times${dec(y10, 1)}$ を《見積|み|つ》もって《選|えら》ぼう：$${c[0]}$、$${c[1]}$、$${c[2]}$ □`, a: `$${ex}$`,
          easy: `およそ $${X}\\times${Y}=${X * Y}$ に《近|ちか》いもの`, easyCheck: false, verify: ok(Math.abs(P / 100 - (x10 / 10) * (y10 / 10)) < 1e-9, '積') };
      },
      // わな：おつり（ちょうどの数が要る）
      trap(r) {
        const a = r.int(1, 4) * 100 - r.int(1, 3), b = r.int(1, 4) * 100 - r.int(1, 3) * r.pick([1, 10]);
        if (a + b >= 1000) return null;
        return dest({ q: `1000《円|えん》で、${a}《円|えん》と${b}《円|えん》の《品物|しな|もの》を《買|か》いました。おつりは□《円|えん》`, a: `$${1000 - a - b}$` }, '2-97', `おつりはちょうどの《数|かず》が《要|い》る。がい《数|すう》にしない。$1000-${a}-${b}=${1000 - a - b}$`);
      },
    },
  });
})(globalThis.MONDAI);
