/* 問題集 第2巻　第4部 累乗・平方根・無理数（わざ 2-44〜2-57、2-98）　組 d
 * 書き方は v2/README.md（文はルビつき・分かち書きなし、式は $…$）と v1/README.md（わざの形）。
 * 教科書 2-7〜2-9 のことば・記号にそろえる（くり返す小数は $0.777\cdots$・$0.1212\cdots$・$0.142857\,142857\cdots$、π は 3.14）。
 * 第29回：わなは、同じ部のほかのわざで楽にならないものにする。当たるときは楽な形に行き先を書き、also に入れる（dest）。
 *   入れかえただけの問題には key をつける（H-6）。 */
(function (M) {
  'use strict';
  const PART = 4;
  const F = M.F;

  // ---------------------------------------------------------------- 数の部品
  // 整数 n を 10^k でわった小数の文字（dec(2512, 2) → '25.12'、dec(5, 3) → '0.005'）。うしろの0はとる
  const dec = (n, k) => {
    const sg = n < 0 ? '-' : '';
    let s = String(Math.abs(n));
    if (!k) return sg + s;
    s = s.padStart(k + 1, '0');
    const t = (s.slice(0, -k) + '.' + s.slice(-k)).replace(/0+$/, '').replace(/\.$/, '');
    return sg + t;
  };
  // 小数の文字 → [整数, 10^k]
  const ratOf = str => { const [i, f = ''] = String(str).split('.'); return [parseInt(i + f, 10), Math.pow(10, f.length), f.length]; };
  const isq = n => { if (n < 0) return -1; const s = Math.round(Math.sqrt(n)); return s * s === n ? s : -1; };
  // √(小数の文字) がわりきれるなら、その小数の文字。わりきれなければ null
  const sqrtDec = str => {
    let [n, , k] = ratOf(str);
    if (k % 2) { n *= 10; k++; }
    const a = isq(n);
    return a < 0 ? null : dec(a, k / 2);
  };
  // n ＝ k^2 × m（m は2乗の数をふくまない）
  const sqf = n => { let k = 1; for (let i = 2; i * i <= n; i++) while (n % (i * i) === 0) { n /= i * i; k *= i; } return [k, n]; };
  const primes = n => { const out = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
  const gcd = (a, b) => F.gcd(a, b);
  // 分母が2と5だけ（約分したあと）
  const only25 = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  const ev = t => M.evalMath(t);
  const sortKey = (...v) => v.map(String).sort().join(',');
  // √ の値のおよそ（教科書の近似値）
  const ROOT = { 2: '1.41', 3: '1.73', 5: '2.24', 6: '2.45', 7: '2.65' };

  // 分数 n/d の小数のけた（くり返す部分 rep と、その前 pre）。d は 0 でない正の整数
  function expand(n, d) {
    const seen = new Map();
    let r = n % d;
    const digits = [];
    while (r !== 0 && !seen.has(r)) { seen.set(r, digits.length); r *= 10; digits.push(Math.floor(r / d)); r %= d; }
    if (r === 0) return { int: Math.floor(n / d), pre: digits.join(''), rep: '' };
    const k = seen.get(r);
    return { int: Math.floor(n / d), pre: digits.slice(0, k).join(''), rep: digits.slice(k).join('') };
  }
  // 小数第 N 位の数字
  function digitAt(n, d, N) {
    const e = expand(n, d);
    if (N <= e.pre.length) return +e.pre[N - 1];
    if (!e.rep) return 0;
    return +e.rep[(N - e.pre.length - 1) % e.rep.length];
  }
  // くり返す小数の書き方（教科書 2-9 と同じ）：1けたは3回、2・3けたは2回、6けたは \, で区切って2回
  function repTeX(intPart, rep) {
    const reps = rep.length === 1 ? 3 : 2;
    const sep = rep.length >= 6 ? '\\,' : '';
    return `${intPart}.${Array(reps).fill(rep).join(sep)}\\cdots`;
  }
  // 素数のかけ算の式（40 → 2\times2\times2\times5）
  const factorTeX = n => primes(n).join('\\times');

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 文が $…$ だけのとき、その中の式
  const onlyMath = q => { const m = /^\$([^$]*)\$$/.exec(q); return m ? m[1] : null; };
  // 文の中の √ の中の数（'□' もふくむ）
  const radicands = q => [...q.matchAll(/\\sqrt\{([\d.]+|□)\}/g)].map(m => m[1]);
  // 小数の文字の積が2乗の数（有理数として）か
  function productIsSquare(list) {
    let num = 1, den = 1;
    for (const s of list) { const [n, d] = ratOf(s); num *= n; den *= d; const g = gcd(num, den); num /= g; den /= g; }
    return isq(num) >= 0 && isq(den) >= 0;
  }
  // 小数点のすぐ後からくり返す小数か（'0.1212\cdots' → true、'0.1222\cdots' → false）
  function pureRepeat(t) {
    const m = /^(\d+)\.(\d+)\\cdots$/.exec(t);
    if (!m) return false;
    const s = m[2];
    for (let p = 1; p * 2 <= s.length; p++) if (s.length % p === 0 && s.slice(0, p).repeat(s.length / p) === s) return true;
    return false;
  }
  // 文の中の分数（\frac{n}{d}）。1つだけのとき [n, d]
  const oneFrac = q => { const L = [...q.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)]; return L.length === 1 ? [+L[0][1], +L[0][2]] : null; };

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // わなの問題に、同じ部のほかのわざが使えるときは、楽な形に「わざ 2-50 で」と書いて also に入れる
  function dest(p, self, why, opt) {
    opt = opt || {};
    const q = M.plain(p.q);
    const also = M.list(2).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    }).concat(opt.also || []);
    if (also.length) p.also = [...new Set(also)];
    p.easy = `（${why}${also.length ? `。わざ ${[...new Set(also)].join('・')} で` : ''}）`;
    if (opt.noCheck) p.easyCheck = false;
    return p;
  }

  // ================================================================ 2-44
  M.add({
    id: '2-44', part: PART, chap: '2-7①・2-13③', stars: 1,
    title: '《累乗|るい|じょう》は《同|おな》じ《数|かず》をならべてかける',
    mark: '**《右|みぎ》かたの《小|ちい》さな《数|かず》**（《指数|し|すう》）がある。$2^{3}$、$(-2)^{3}$、$(-1)^{5}$ など。',
    futsu: ['$3^{4}$ を $3\\times4=12$ としたり、', 'かける《回数|かい|すう》をまちがえたり', 'しやすい。'],
    raku: ['3を4こならべて《書|か》く。', '$3^{4}=3\\times3\\times3\\times3$', '$=9\\times9=81$'],
    why: '《指数|し|すう》は「《同|おな》じ《数|かず》を《何回|なん|かい》かけるか」（2-7①）。ならべて《書|か》けば、《回数|かい|すう》をまちがえない。',
    caution: '$-3^{2}$ は3だけを2《乗|じょう》して $-9$。$(-3)^{2}=9$ とはちがう。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    boxw: { s1: '16mm', s2: '14mm', s3: '18mm', trap: '14mm' },
    boxh: { s3: '12mm' },
    // 累乗が1つだけの式（$3^{4}$、$(-2)^{3}$、$0.3^{2}$、$\left(\frac{2}{3}\right)^{2}$）・立方体の体積
    fits(q) {
      if (/立方体の体積/.test(q)) return true;
      const m = /^\$(\(-\d+\)|\d+(?:\.\d+)?|\\left\(\\frac\{\d+\}\{\d+\}\\right\))\^\{(\d+)\}\$$/.exec(q);
      return !!m && +m[2] >= 2 && (+m[2] <= 6 || m[1] === '(-1)');
    },
    steps: {
      // 整数の累乗
      s1(r) {
        const b = r.int(2, 10);
        const n = b <= 3 ? r.int(2, 5) : b <= 5 ? r.int(2, 4) : b === 10 ? r.int(2, 6) : r.int(2, 3);
        return { q: `$${b}^{${n}}$`, a: `$${Math.pow(b, n)}$`, easy: `$${Array(n).fill(b).join('\\times')}$` };
      },
      // 負の数の累乗（かっこごとかける）・$(-1)^{n}$
      s2(r) {
        if (r.chance(0.55)) {
          const b = -r.int(2, 5), n = b >= -3 ? r.int(2, 4) : r.int(2, 3);
          return { q: `$(${b})^{${n}}$`, a: `$${Math.pow(b, n)}$`, easy: `$${Array(n).fill(`(${b})`).join('\\times')}$` };
        }
        const n = r.int(3, 12), v = n % 2 ? -1 : 1;
        return { q: `$(-1)^{${n}}$`, a: `$${v}$`, easy: `《負|ふ》の《数|かず》が${n}こ（${n % 2 ? '《奇数|き|すう》' : '《偶数|ぐう|すう》'}こ）で $${v}$` };
      },
      // 小数・分数の累乗、立方体の体積
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          if (r.chance(0.3)) { const d = r.int(1, 9), x = 10 + d; return { q: `$1.${d}^{2}$`, a: `$${dec(x * x, 2)}$`, easy: `$1.${d}\\times1.${d}$` }; }
          const d = r.int(1, 9), n = d <= 3 ? r.int(2, 3) : 2;
          return { q: `$0.${d}^{${n}}$`, a: `$${dec(Math.pow(d, n), n)}$`, easy: `$${Array(n).fill('0.' + d).join('\\times')}$` };
        }
        if (k === 1) {
          const b = r.int(2, 7), a = r.int(1, b - 1);
          if (gcd(a, b) !== 1) return null;
          const n = b <= 5 ? r.int(2, 3) : 2;
          return { q: `$\\left(\\frac{${a}}{${b}}\\right)^{${n}}$`, a: `$\\frac{${Math.pow(a, n)}}{${Math.pow(b, n)}}$`,
            easy: `$\\frac{${Array(n).fill(a).join('\\times')}}{${Array(n).fill(b).join('\\times')}}$` };
        }
        const s = r.int(2, 9);
        return { q: `1《辺|ぺん》$${s}\\,\\mathrm{cm}$ の《立方体|りっ|ぽう|たい》の《体積|たい|せき》は □ $\\mathrm{cm}^{3}$`, a: `$${s * s * s}$`, easy: `$${s}^{3}=${s}\\times${s}\\times${s}$` };
      },
      // わな：$-3^{2}$（－は累乗の外。3だけを2乗する）
      trap(r) {
        // 指数は偶数（$-2^{3}$ は $(-2)^{3}$ と同じ値になってしまう）
        const b = r.int(2, 9), n = b <= 3 ? r.pick([2, 4]) : 2;
        const p = { q: `$-${b}^{${n}}$`, a: `$${-Math.pow(b, n)}$` };
        return dest(p, '2-44', `$-$ は《累乗|るい|じょう》の《外|そと》。$-(${Array(n).fill(b).join('\\times')})$`);
      },
    },
  });

  // ================================================================ 2-45
  // 2、4、8、… と2倍していく列（長いときは前を …）
  const dbl = n => { const L = []; for (let k = 1; k <= n; k++) L.push(Math.pow(2, k)); return (n > 7 ? ['2', '4', '8', '…'].concat(L.slice(n - 3)) : L).join('、'); };
  M.add({
    id: '2-45', part: PART, chap: '2-7①', stars: 1,
    title: '2の《累乗|るい|じょう》は2《倍|ばい》ずつ',
    mark: '**2の《累乗|るい|じょう》**（$2^{n}$）。《紙|かみ》を《折|お》る、2《倍|ばい》にふえる、スイッチの《入|いり》と《切|きり》。',
    futsu: ['$2^{7}$ を、2を7こならべて', '$2\\times2\\times2\\times2\\times2\\times2\\times2$', 'と《前|まえ》から《計算|けい|さん》する。'],
    raku: ['2、4、8、16、32、64、128', 'と2《倍|ばい》ずつ7つ《数|かぞ》える。', '$2^{10}=1024$ はおぼえておく。'],
    why: '《指数|し|すう》が1ふえると、2を1《回|かい》《多|おお》くかけるので2《倍|ばい》になる（2-7①の《表|ひょう》）。',
    caution: '$3^{5}$ のように、2でない《数|かず》の《累乗|るい|じょう》は、2《倍|ばい》ずつでは《求|もと》められない。',
    counts: { s1: 8, s2: 7, s3: 6, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '16mm', s2: '12mm', s3: '16mm', trap: '16mm' },
    // $2^{n}$（ちょうどの値。n は 13 まで）、2を何回かけた数、2倍にふえる・紙を折る・スイッチ（およそでない）
    fits(q) {
      if (/およそ/.test(q) && !/およそでなく/.test(q)) return false;
      const m = /^\$2\^\{(\d+)\}\$(.*)$/.exec(q);
      if (m) return +m[1] >= 3 && +m[1] <= 13 && (m[2] === '' || /ちょうど/.test(m[2]));
      return /は、2を□回かけた数/.test(q) || /ごとに2倍にふえる/.test(q) || /紙を\d+回折ると/.test(q) || /^スイッチ\d+こ/.test(q);
    },
    steps: {
      s1(r) {
        const n = r.int(4, 12);
        return { q: `$2^{${n}}$`, a: `$${Math.pow(2, n)}$`, easy: dbl(n) };
      },
      // 2を何回かけた数か
      s2(r) {
        const n = r.int(3, 12), N = Math.pow(2, n);
        return { q: `$${N}$ は、2を□《回|かい》かけた《数|かず》`, a: `$${n}$`, easy: `${dbl(n)} で${n}《番目|ばん|め》`, verify: () => Math.pow(2, n) === N || 'ちがう' };
      },
      // 細菌がふえる・紙を折る・スイッチ
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const iv = r.pick([10, 15, 20, 30]), h = r.int(1, 3), n = 60 * h / iv;
          if (n < 4 || n > 12) return null;
          return { q: `1この《細菌|さい|きん》が${iv}${iv === 15 ? '《分|ふん》' : '《分|ぷん》'}ごとに2《倍|ばい》にふえる。${h}《時間後|じ|かん|ご》には □こ`,
            a: `$${Math.pow(2, n)}$`, easy: `${60 * h}÷${iv}＝${n}《回|かい》で $2^{${n}}$` };
        }
        if (k === 1) {
          const n = r.int(4, 10);
          return { q: `《紙|かみ》を${n}《回|かい》《折|お》ると、《重|かさ》なりは □《枚|まい》`, a: `$${Math.pow(2, n)}$`, easy: `$2^{${n}}$` };
        }
        const n = r.int(3, 10);
        return { q: `スイッチ${n}こ。《入|いり》と《切|きり》の《組|く》み《合|あ》わせは □《通|とお》り`, a: `$${Math.pow(2, n)}$`, easy: `1こ2《通|とお》りが${n}こで $2^{${n}}$` };
      },
      // わな：2でない数の累乗（2倍ずつでは出ない。ならべてかける）
      trap(r) {
        const b = r.pick([3, 3, 4, 5]), n = b === 3 ? r.int(4, 6) : b === 4 ? r.int(3, 5) : r.int(3, 4);
        const L = []; for (let k = 1; k <= n; k++) L.push(Math.pow(b, k));
        return dest({ q: `$${b}^{${n}}$`, a: `$${Math.pow(b, n)}$` }, '2-45', `2の《累乗|るい|じょう》ではない。${b}《倍|ばい》ずつ ${L.join('、')}`);
      },
    },
  });

  // ================================================================ 2-46
  // 2^n のおよその値（n = 10k + rr、rr は 0〜3）：2^rr × 10^(3k)
  const approx2 = n => { const k = Math.floor(n / 10), rr = n % 10; return { k, rr, tex: rr ? `${Math.pow(2, rr)}\\times10^{${3 * k}}` : `10^{${3 * k}}`, val: Math.pow(2, rr) * Math.pow(10, 3 * k) }; };
  M.add({
    id: '2-46', part: PART, chap: '2-7④', stars: 1,
    title: '$2^{10}$ はほぼ1000',
    mark: '2の**《大|おお》きな《累乗|るい|じょう》**。「およそいくつ」「10《回|かい》で《何倍|なん|ばい》」。',
    futsu: ['$2^{20}$ を、2《倍|ばい》ずつ20《回|かい》', '《計算|けい|さん》して1048576を《出|だ》す。'],
    raku: ['$2^{20}=2^{10}\\times2^{10}$', '$\\approx1000\\times1000=10^{6}$', '$2^{10}$ が1つで、0が3つふえる。'],
    why: '$2^{10}=1024$ は1000にとても《近|ちか》い。かけ《算|ざん》は《指数|し|すう》をたす（2-7④）ので、《指数|し|すう》を10ずつに《分|わ》けられる。',
    caution: 'ちょうどの《値|あたい》がいるときは《使|つか》えない。$2^{10}$ は1024で、1000ではない。',
    counts: { s1: 8, s2: 7, s3: 6, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '18mm', s3: '16mm', trap: '18mm' },
    // およそ（2の大きな累乗・2倍を10回以上）、2の累乗と10の累乗のどちらが大きい、2の累乗のけたの数
    fits(q) {
      if (/ちょうど/.test(q)) return false;
      const m = /\$2\^\{(\d+)\}\$/.exec(q);
      if (/およそ/.test(q)) return (!!m && +m[1] >= 11) || /2倍を\d{2,}回/.test(q) || /2倍を□回/.test(q) || /ごとに2倍/.test(q);
      return !!m && +m[1] >= 10 && (/どちらが大きい/.test(q) || /けたの数/.test(q));
    },
    steps: {
      // およそ □×10^△
      s1(r) {
        const k = r.int(1, 4), rr = r.int(0, 3), n = 10 * k + rr;
        if (n < 11) return null;
        const A = approx2(n);
        return { q: `$2^{${n}}$ はおよそ □`, a: `$${A.tex}$`, easy: `$2^{10}$ が${k}こで $10^{${3 * k}}$${rr ? `、$2^{${rr}}=${Math.pow(2, rr)}$ をかける` : ''}`, easyCheck: false,
          verify: () => Math.abs(Math.pow(2, n) / A.val - 1) < 0.2 || 'およそでない' };
      },
      // 10回ごとに約1000倍
      s2(r) {
        const k = r.int(0, 2), m = r.int(1, 5);
        if (k === 0) return { q: `2《倍|ばい》を${10 * m}《回|かい》くり《返|かえ》すと、およそ □《倍|ばい》`, a: `$10^{${3 * m}}$`, easy: `$2^{10}$ が${m}こで、0が${3 * m}こ`, easyCheck: false, verify: () => Math.abs(Math.pow(2, 10 * m) / Math.pow(10, 3 * m) - 1) < 0.2 || 'ちがう' };
        if (k === 1) return { q: `およそ $10^{${3 * m}}$《倍|ばい》にするには、2《倍|ばい》を□《回|かい》くり《返|かえ》す`, a: `$${10 * m}$`, easy: `$10^{3}$ が${m}こなので、10《回|かい》が${m}こ`, easyCheck: false, verify: () => true };
        const iv = r.pick([10, 20]), n = r.int(2, 4) * 10;
        return { q: `1この《細菌|さい|きん》が${iv}《分|ぷん》ごとに2《倍|ばい》にふえる。${iv * n}《分後|ぷん|ご》にはおよそ □こ`, a: `$10^{${3 * n / 10}}$`,
          easy: `${iv * n}÷${iv}＝${n}《回|かい》。$2^{${n}}$ はおよそ $10^{${3 * n / 10}}$`, easyCheck: false, verify: () => Math.abs(Math.pow(2, n) / Math.pow(10, 3 * n / 10) - 1) < 0.2 || 'ちがう' };
      },
      // どちらが大きい・何けた
      s3(r) {
        if (r.chance(0.4)) {
          const k = r.int(1, 5), A = `$2^{${10 * k}}$`, B = `$10^{${3 * k}}$`;
          return { q: `${r.chance(0.5) ? A + ' と ' + B : B + ' と ' + A} では、どちらが《大|おお》きい？ □`, a: A, key: `46c${k}`,
            easy: `$2^{10}=1024$ は1000より《大|おお》きい`, easyCheck: false, verify: () => Math.pow(2, 10 * k) > Math.pow(10, 3 * k) || 'ちがう' };
        }
        const n = r.int(2, 4) * 10 + r.int(0, 3), A = approx2(n);
        return { q: `$2^{${n}}$ は《何|なん》けたの《数|かず》？ □けた`, a: `$${3 * A.k + 1}$`, easy: `およそ $${A.tex}$ なので、1のあとに0が${3 * A.k}こ`, easyCheck: false,
          verify: () => (BigInt(2) ** BigInt(n)).toString().length === 3 * A.k + 1 || 'けたがちがう' };
      },
      // わな：ちょうどの値（1000 にしない。2倍ずつ）
      trap(r) {
        const n = r.int(9, 13);
        return dest({ q: `$2^{${n}}$ を、およそでなく、ちょうどの《数|かず》で`, a: `$${Math.pow(2, n)}$` }, '2-46', `ちょうどの《値|あたい》は、およそでは《出|で》ない。${dbl(n)}`);
      },
    },
  });

  // ================================================================ 2-47
  const FORM = '$\\square\\times10^{\\triangle}$ の《形|かたち》に';
  // 有効数字 m10（11〜99 の2けた、10の倍数なら1けた）と指数 e の数。big は 0がならぶ整数、small は 0.000… の小数
  const mant = m10 => (m10 % 10 ? dec(m10, 1) : String(m10 / 10));
  const bigStr = (m10, e) => (m10 % 10 ? String(m10) + '0'.repeat(e - 1) : String(m10 / 10) + '0'.repeat(e));
  const smallStr = (m10, e) => '0.' + '0'.repeat(e - 1) + (m10 % 10 ? String(m10) : String(m10 / 10));
  // 2つの書き方の値が同じか（分数で）
  const sameNum = (s, m, e) => { const x = F.fromDec(s), y = F.mul(F.fromDec(m), e >= 0 ? F.make(Math.pow(10, e)) : F.make(1, Math.pow(10, -e))); return F.eq(x, y) || `${s} と ${m}×10^${e} がちがう`; };
  M.add({
    id: '2-47', part: PART, chap: '2-7③⑤', stars: 1,
    title: '《大|おお》きな《数|かず》・《小|ちい》さな《数|かず》は $\\square\\times10^{\\triangle}$',
    mark: '0が**たくさんならぶ**《数|かず》。《小数点|しょう|すう|てん》のあとに0がつづく《数|かず》。',
    futsu: ['3200000 の0を《数|かぞ》えて、', '《百万|ひゃく|まん》の《位|くらい》、……と《読|よ》む。'],
    raku: ['《小数点|しょう|すう|てん》を《左|ひだり》へ6つ《動|うご》かすと3.2', '$3200000=3.2\\times10^{6}$', '$0.00045=4.5\\times10^{-4}$（《右|みぎ》へ4つ）'],
    why: '10をかけるたびに《小数点|しょう|すう|てん》が1つ《右|みぎ》へ《動|うご》く（2-1）。《動|うご》かした《数|かず》が《指数|し|すう》になる（2-7③⑤）。',
    caution: '□は1《以上|い|じょう》10《未満|み|まん》にする。$32\\times10^{5}$ は、まだこの《形|かたち》ではない。',
    counts: { s1: 8, s2: 7, s3: 6, trap: 2 },
    cols: 1,
    boxw: '30mm',
    // □×10^△ の形にする・10の累乗の形の数をふつうの数字や小数にする
    fits(q) {
      // もう ×10^n の形の数（×の前が10以上・1未満）は、わな
      if (/\\square\\times10\^\{\\triangle\}/.test(q)) return !/^\$[\d.]+\\times10\^/.test(q);
      return /\\times10\^\{-?\d+\}\$ を(数字|小数)で$/.test(q);
    },
    steps: {
      // 大きな数
      s1(r) {
        const m10 = r.chance(0.3) ? r.int(2, 9) * 10 : r.int(11, 99), e = r.int(4, 9);
        const s = bigStr(m10, e), m = mant(m10);
        return { q: `$${s}$ を ${FORM}`, a: `$${m}\\times10^{${e}}$`, easy: `《小数点|しょう|すう|てん》を《左|ひだり》へ${e}つ《動|うご》かすと${m}`, verify: () => sameNum(s, m, e) };
      },
      // 小さな数（マイナスの指数）
      s2(r) {
        const m10 = r.chance(0.3) ? r.int(2, 9) * 10 : r.int(11, 99), e = r.int(2, 6);
        const s = smallStr(m10, e), m = mant(m10);
        return { q: `$${s}$ を ${FORM}`, a: `$${m}\\times10^{-${e}}$`, easy: `《小数点|しょう|すう|てん》を《右|みぎ》へ${e}つ《動|うご》かすと${m}`, verify: () => sameNum(s, m, -e) };
      },
      // 逆にもどす・万・億・兆
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const m10 = r.chance(0.4) ? r.int(2, 9) * 10 : r.int(11, 99), e = r.int(3, 8), s = bigStr(m10, e), m = mant(m10);
          return { q: `$${m}\\times10^{${e}}$ を《数字|すう|じ》で`, a: `$${s}$`, easy: `《小数点|しょう|すう|てん》を《右|みぎ》へ${e}つ《動|うご》かす`, verify: () => sameNum(s, m, e) };
        }
        if (k === 1) {
          const m10 = r.int(2, 9) * 10, e = r.int(2, 4), s = smallStr(m10, e), m = mant(m10);
          return { q: `$${m}\\times10^{-${e}}$ を《小数|しょう|すう》で`, a: `$${s}$`, easy: `《小数点|しょう|すう|てん》を《左|ひだり》へ${e}つ《動|うご》かす`, verify: () => sameNum(s, m, -e) };
        }
        const [name, e0] = r.pick([['《万|まん》', 4], ['《億|おく》', 8], ['《兆|ちょう》', 12]]);
        const two = r.chance(0.4), n = two ? r.int(11, 99) : r.int(2, 9);
        if (two && n % 10 === 0) return null;
        const m = two ? dec(n, 1) : String(n), e = two ? e0 + 1 : e0;
        return { q: `${n}${name}を ${FORM}`, a: `$${m}\\times10^{${e}}$`, easy: `1${name}は $10^{${e0}}$`, easyCheck: false, verify: () => sameNum(String(n * Math.pow(10, e0)), m, e) };
      },
      // わな：×の前が10以上・1未満（まだこの形ではない）
      trap(r) {
        if (r.chance(0.5)) {
          const m10 = r.int(11, 99), e = r.int(3, 7);
          if (m10 % 10 === 0) return null;
          const p = { q: `$${m10}\\times10^{${e}}$ を ${FORM}`, a: `$${dec(m10, 1)}\\times10^{${e + 1}}$`, verify: () => sameNum(String(m10), dec(m10, 1), 1) };
          return dest(p, '2-47', `×の《前|まえ》は1《以上|い|じょう》10《未満|み|まん》。$${dec(m10, 1)}\\times10\\times10^{${e}}$`);
        }
        const d = r.int(1, 9), e = r.int(3, 7);
        const p = { q: `$0.${d}\\times10^{${e}}$ を ${FORM}`, a: `$${d}\\times10^{${e - 1}}$`, verify: () => sameNum('0.' + d, String(d), -1) };
        return dest(p, '2-47', `×の《前|まえ》は1《以上|い|じょう》10《未満|み|まん》。$${d}\\div10\\times10^{${e}}$`);
      },
    },
  });

  // ================================================================ 2-48
  M.add({
    id: '2-48', part: PART, chap: '2-7④', stars: 1,
    title: 'かけ《算|ざん》は《指数|し|すう》をたす',
    mark: '《同|おな》じ《数|かず》の**《累乗|るい|じょう》どうしのかけ《算|ざん》**。$10^{2}\\times10^{3}$、$2^{3}\\times2^{4}$。',
    futsu: ['$10^{2}\\times10^{3}=100\\times1000$', '$=100000$ と、0を《数|かぞ》える。'],
    raku: ['10を2《回|かい》と3《回|かい》、あわせて5《回|かい》。', '$10^{2}\\times10^{3}=10^{2+3}=10^{5}$'],
    why: 'ならべて《書|か》くと、かけた《回数|かい|すう》があわさる（2-7④）。マイナスの《指数|し|すう》でも《同|おな》じ。',
    caution: 'たし《算|ざん》 $10^{2}+10^{3}$ や、《下|した》の《数|かず》がちがう $2^{3}\\times3^{2}$ には《使|つか》えない。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '18mm', s2: '20mm', s3: '26mm', trap: '18mm' },
    // 同じ数の累乗のかけ算・(a×10^m)×(b×10^n)・累乗の累乗・「10^m の 10^n 倍」
    fits(q) {
      const t = onlyMath(q);
      if (t != null) {
        if (/^(\d+)\^\{-?\d+\}(?:\\times\1(?:\^\{-?\d+\})?)+$/.test(t)) return true;
        if (/^10\\times10\^\{-?\d+\}$/.test(t)) return true;
        if (/^\([\d.]+\\times10\^\{-?\d+\}\)\\times\([\d.]+\\times10\^\{-?\d+\}\)$/.test(t)) return true;
        if (/^\(\d+\^\{\d+\}\)\^\{\d+\}$/.test(t)) return true;
        return false;
      }
      return /^\$10\^\{\d+\}\$ の \$10\^\{\d+\}\$倍/.test(q);
    },
    steps: {
      s1(r) {
        const b = r.pick([10, 10, 10, 2, 3]);
        const m = b === 10 ? r.int(2, 9) : r.int(2, 5), n = b === 10 ? r.int(2, 9) : r.int(2, 5);
        return { q: `$${b}^{${m}}\\times${b}^{${n}}$`, a: `$${b}^{${m + n}}$`, easy: `$${b}^{${m}+${n}}$`, key: `48:${b}:${sortKey(m, n)}` };
      },
      // 3つのかけ算・マイナスの指数・×10（指数1）
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const e = [r.int(2, 5), r.int(2, 5), r.int(2, 5)];
          return { q: `$${e.map(x => `10^{${x}}`).join('\\times')}$`, a: `$10^{${e[0] + e[1] + e[2]}}$`, easy: `$10^{${e.join('+')}}$`, key: `48t:${sortKey(...e)}` };
        }
        if (k === 1) {
          const m = r.int(2, 8), n = r.int(1, 8);
          if (m === n) return null;
          const s = m - n, ans = s === 1 ? '10' : `10^{${s}}`;
          return { q: `$10^{${m}}\\times10^{-${n}}$`, a: `$${ans}$`, easy: `$10^{${m}+(-${n})}$` };
        }
        const m = r.int(2, 9);
        return { q: r.chance(0.5) ? `$10^{${m}}\\times10$` : `$10\\times10^{${m}}$`, a: `$10^{${m + 1}}$`, easy: `$10^{${m}+1}$`, key: `48h:${m}` };
      },
      // 10の累乗の形の数のかけ算・累乗の累乗・ことば
      s3(r) {
        const k = r.int(0, 3);
        if (k <= 1) {
          const [a, b] = r.pick([[2, 3], [2, 4], [3, 3], [2, 2], [1.5, 4], [2.5, 2], [1.5, 6], [4, 2], [1.2, 5], [3, 2], [2.5, 3], [1.5, 3]]);
          const m = r.int(2, 8), n = r.int(2, 8);
          const ab = dec(Math.round(a * b * 100), 2);
          if (+ab >= 10) return null;
          return { q: `$(${a}\\times10^{${m}})\\times(${b}\\times10^{${n}})$`, a: `$${ab}\\times10^{${m + n}}$`, easy: `$${a}\\times${b}\\times10^{${m}+${n}}$`, key: `48s:${sortKey(`${a}e${m}`, `${b}e${n}`)}` };
        }
        if (k === 2) {
          const m = r.int(2, 4), n = r.int(2, 3);
          return { q: `$(10^{${m}})^{${n}}$`, a: `$10^{${m * n}}$`, easy: `$10^{${Array(n).fill(m).join('+')}}$` };
        }
        const m = r.int(2, 6), n = r.int(2, 6);
        return { q: `$10^{${m}}$ の $10^{${n}}$《倍|ばい》`, a: `$10^{${m + n}}$`, easy: `$10^{${m}}\\times10^{${n}}=10^{${m}+${n}}$` };
      },
      // わな：累乗のたし算（指数をたせない）
      trap(r) {
        const b = r.pick([10, 10, 2]);
        const m = b === 10 ? r.int(2, 4) : r.int(2, 5), n = b === 10 ? r.int(2, 4) : r.int(2, 5);
        const p = { q: `$${b}^{${m}}+${b}^{${n}}$`, a: `$${Math.pow(b, m) + Math.pow(b, n)}$`, key: `48x:${b}:${sortKey(m, n)}` };
        return dest(p, '2-48', `たし《算|ざん》は《指数|し|すう》をたせない。$${Math.pow(b, m)}+${Math.pow(b, n)}$`);
      },
    },
  });

  // ================================================================ 2-49
  M.add({
    id: '2-49', part: PART, chap: '2-7④⑤', stars: 1,
    title: 'わり《算|ざん》は《指数|し|すう》をひく（0《乗|じょう》・マイナスの《指数|し|すう》）',
    mark: '《同|おな》じ《数|かず》の**《累乗|るい|じょう》どうしのわり《算|ざん》**。$10^{0}$、$10^{-2}$。',
    futsu: ['$10^{5}\\div10^{2}=100000\\div100$', '$=1000$ と、《大|おお》きな《数|かず》でわる。'],
    raku: ['10が2つ《消|き》えて、《指数|し|すう》は $5-2$。', '$10^{5}\\div10^{2}=10^{5-2}=10^{3}$', '$10^{2}\\div10^{2}=10^{0}=1$'],
    why: 'わり《算|ざん》を《分数|ぶん|すう》にして《約分|やく|ぶん》すると、わる《数|かず》の《指数|し|すう》だけ10が《消|き》える（2-7④⑤）。',
    caution: 'ひき《算|ざん》 $10^{5}-10^{2}$ には《使|つか》えない。$10^{-1}$ は0.1で、マイナスの《数|かず》ではない。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '20mm' },
    boxh: { s3: '12mm' },
    // 同じ数の累乗のわり算・0乗・マイナスの指数
    fits(q) {
      const t = onlyMath(q);
      if (t != null && /^(\d+)\^\{-?\d+\}\\div\1\^\{-?\d+\}$/.test(t)) return true;
      if (t != null && /^\\frac\{(\d+)\^\{\d+\}\}\{\1\^\{\d+\}\}$/.test(t)) return true;
      return /^\$\d+\^\{(-\d+|0)\}\$( を(分数|小数)で)?$/.test(q);
    },
    steps: {
      s1(r) {
        const b = r.pick([10, 10, 10, 2, 3]);
        const m = b === 10 ? r.int(3, 9) : r.int(3, 7), n = r.int(1, m - 1);
        const s = m - n;
        return { q: `$${b}^{${m}}\\div${b}^{${n}}$`, a: s === 1 ? `$${b}$` : `$${b}^{${s}}$`, easy: `$${b}^{${m}-${n}}$` };
      },
      // 0乗・マイナスの指数になる・分数の形・マイナスの指数でわる
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) { const b = r.pick([10, 10, 2, 3, 5]), m = r.int(2, 6); return { q: `$${b}^{${m}}\\div${b}^{${m}}$`, a: '$1$', easy: `$${b}^{${m}-${m}}=${b}^{0}$` }; }
        if (k === 1) { const m = r.int(2, 5), n = r.int(m + 1, 8); return { q: `$10^{${m}}\\div10^{${n}}$`, a: `$10^{${m - n}}$`, easy: `$10^{${m}-${n}}$` }; }
        if (k === 2) { const m = r.int(4, 9), n = r.int(2, m - 2); return { q: `$\\frac{10^{${m}}}{10^{${n}}}$`, a: `$10^{${m - n}}$`, easy: `$10^{${m}-${n}}$` }; }
        const m = r.int(2, 5), n = r.int(1, 4);
        return { q: `$10^{${m}}\\div10^{-${n}}$`, a: `$10^{${m + n}}$`, easy: `$10^{${m}-(-${n})}$` };
      },
      // マイナスの指数・0乗を、分数・小数・整数で
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) { const e = r.int(1, 4); return { q: `$10^{-${e}}$ を《分数|ぶん|すう》で`, a: `$\\frac{1}{${Math.pow(10, e)}}$`, easy: `$\\frac{1}{10^{${e}}}$` }; }
        if (k === 1) { const e = r.int(1, 5); return { q: `$10^{-${e}}$ を《小数|しょう|すう》で`, a: `$${dec(1, e)}$`, easy: `$\\frac{1}{10^{${e}}}$` }; }
        if (k === 2) {
          const b = r.int(2, 5), e = b === 2 ? r.int(1, 5) : r.int(1, 3);
          return { q: `$${b}^{-${e}}$ を《分数|ぶん|すう》で`, a: `$\\frac{1}{${Math.pow(b, e)}}$`, easy: e === 1 ? `$\\frac{1}{${b}}$` : `$\\frac{1}{${b}^{${e}}}$` };
        }
        const b = r.pick([2, 3, 5, 7, 9, 10, 100]);
        return { q: `$${b}^{0}$`, a: '$1$', easy: `$${b}^{1}\\div${b}^{1}=${b}^{0}$` };
      },
      // わな：累乗のひき算（指数をひけない）
      trap(r) {
        const b = r.pick([10, 10, 2]);
        const m = b === 10 ? r.int(2, 5) : r.int(3, 6), n = r.int(1, m - 1);
        const p = { q: `$${b}^{${m}}-${b}^{${n}}$`, a: `$${Math.pow(b, m) - Math.pow(b, n)}$` };
        return dest(p, '2-49', `ひき《算|ざん》は《指数|し|すう》をひけない。$${Math.pow(b, m)}-${Math.pow(b, n)}$`);
      },
    },
  });

  // ================================================================ 2-50
  M.add({
    id: '2-50', part: PART, chap: '2-8③', stars: 1,
    title: '2《乗|じょう》の《数|かず》をおぼえて√をはずす',
    mark: '**√の《中|なか》が2《乗|じょう》の《数|かず》**（1、4、9、……、400、0.49 など）。',
    futsu: ['$\\sqrt{121}$ を、10、11、12、……と', '《順|じゅん》に2《乗|じょう》してさがす。'],
    raku: ['$11^{2}=121$ をおぼえていれば', '$\\sqrt{121}=11$', '$0.7^{2}=0.49$ なので $\\sqrt{0.49}=0.7$'],
    why: '√は「2《乗|じょう》すると《中|なか》の《数|かず》になる《正|せい》の《数|かず》」（2-8③）。2《乗|じょう》の《表|ひょう》を《逆|ぎゃく》に《読|よ》めばよい。',
    caution: '$\\sqrt{0.9}$ は0.3ではない（$0.3^{2}=0.09$）。2《乗|じょう》の《数|かず》でなければ、はさむ（わざ 2-51）。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    cols: { s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '22mm', s3: '16mm', trap: '12mm' },
    // √が1つで、中が2乗の数（整数・小数）／2乗の数の平方根／面積が2乗の数の正方形の1辺
    fits(q) {
      const m = /^\$\\sqrt\{([\d.]+)\}\$/.exec(q);
      if (m) return sqrtDec(m[1]) != null && radicands(q).length === 1;
      let n = /^(\d+)の平方根/.exec(q);
      if (n) return isq(+n[1]) >= 0;
      n = /^面積が \$(\d+)\\,\\mathrm\{m\}\^\{2\}\$ の正方形の1辺は □ m$/.exec(q);
      return !!n && isq(+n[1]) >= 0;
    },
    steps: {
      s1(r) {
        const n = r.int(2, 20);
        return { q: `$\\sqrt{${n * n}}$`, a: `$${n}$`, easy: `$\\sqrt{${n}\\times${n}}$` };
      },
      // 小数の2乗・平方根は2つ
      s2(r) {
        if (r.chance(0.65)) {
          const d = r.int(1, 9), big = r.chance(0.35), x = big ? 10 + d : d;
          const s = dec(x, 1), sq = dec(x * x, 2);
          return { q: `$\\sqrt{${sq}}$`, a: `$${s}$`, easy: `$\\sqrt{${s}\\times${s}}$` };
        }
        const n = r.int(3, 15);
        return { q: `${n * n}の《平方根|へい|ほう|こん》は □`, a: `$${n}$ と $-${n}$`, easy: `$${n}^{2}=${n * n}$、$(-${n})^{2}=${n * n}$`, verify: () => (n * n === (-n) * (-n)) || 'ちがう' };
      },
      // 面積から1辺・大きな2乗の数
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.int(6, 20);
          return { q: `《面積|めん|せき》が $${n * n}\\,\\mathrm{m}^{2}$ の《正方形|せい|ほう|けい》の1《辺|ぺん》は □ m`, a: `$${n}$`, easy: `$\\sqrt{${n * n}}=${n}$` };
        }
        const n = r.int(2, 10), N = 10 * n;
        return { q: `$\\sqrt{${N * N}}$`, a: `$${N}$`, easy: `$\\sqrt{${n * n}\\times100}=${n}\\times10$` };
      },
      // わな：√0.9 は 0.3 ではない（2乗の数ではない。はさむ）
      trap(r) {
        const k = r.int(1, 9), x = dec(k * k, 1);
        if (Number.isInteger(+x)) return null;
        const m = Math.floor(Math.sqrt(10 * k * k)), lo = (m / 10).toFixed(1), hi = ((m + 1) / 10).toFixed(1);
        const p = { q: `$\\sqrt{${x}}$ を、《小数第|しょう|すう|だい》1《位|い》までの□と□ではさむ`, a: `$${lo}$ と $${hi}$`,
          verify: () => (m * m < 10 * k * k && 10 * k * k < (m + 1) * (m + 1)) || 'はさめていない' };
        return dest(p, '2-50', `${x}は2《乗|じょう》の《数|かず》ではない（$${dec(k, 1)}^{2}=${dec(k * k, 2)}$）。$${lo}^{2}<${x}<${hi}^{2}$`);
      },
    },
  });

  // ================================================================ 2-51
  // 整数ではさむ：m^2 < n < (m+1)^2
  const between = n => Math.floor(Math.sqrt(n));
  M.add({
    id: '2-51', part: PART, chap: '2-8①②', stars: 1,
    title: '2《乗|じょう》ではさむ',
    mark: '**√の《中|なか》が2《乗|じょう》の《数|かず》でない**。「どの《整数|せい|すう》の《間|あいだ》」「はさむ」。',
    futsu: ['$\\sqrt{20}$ を《電卓|でん|たく》で4.472……と', '《計算|けい|さん》してから《考|かんが》える。'],
    raku: ['20をはさむ2《乗|じょう》の《数|かず》をさがす。', '$4^{2}=16<20<25=5^{2}$', 'だから4と5の《間|あいだ》'],
    why: '2《乗|じょう》が《大|おお》きいほど、もとの《数|かず》も《大|おお》きい。2《乗|じょう》ではさめば、√もはさめる（2-8②）。',
    caution: '$\\sqrt{49}$ のように2《乗|じょう》の《数|かず》なら、はさまずに7と《答|こた》える（わざ 2-50）。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    cols: { s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '10mm', s2: '12mm', s3: '12mm', trap: '10mm' },
    // 「の間」「はさむ」で、√の中・面積・x×x が2乗の数でない
    fits(q) {
      if (!/の間|ではさむ/.test(q)) return false;
      const rs = radicands(q).filter(x => x !== '□');
      if (rs.length === 1) return sqrtDec(rs[0]) == null;
      const m = /面積が \$(\d+)\\,\\mathrm\{m\}\^\{2\}\$/.exec(q) || /\$x\\times x=(\d+)\$/.exec(q);
      return !!m && isq(+m[1]) < 0;
    },
    steps: {
      s1(r) {
        const n = r.int(2, 99), m = between(n);
        if (m * m === n) return null;
        return { q: `$\\sqrt{${n}}$ は、《整数|せい|すう》□と□の《間|あいだ》`, a: `$${m}$ と $${m + 1}$`, easy: `$${m}^{2}=${m * m}<${n}<${(m + 1) * (m + 1)}=${m + 1}^{2}$`,
          verify: () => (m * m < n && n < (m + 1) * (m + 1)) || 'はさめていない' };
      },
      // 面積から1辺・x×x
      s2(r) {
        const n = r.int(10, 150), m = between(n);
        if (m * m === n) return null;
        const easy = `$${m}^{2}=${m * m}$、$${m + 1}^{2}=${(m + 1) * (m + 1)}$`, verify = () => (m * m < n && n < (m + 1) * (m + 1)) || 'はさめていない';
        if (r.chance(0.5)) return { q: `《面積|めん|せき》が $${n}\\,\\mathrm{m}^{2}$ の《正方形|せい|ほう|けい》の1《辺|ぺん》は、□ m と □ m の《間|あいだ》`, a: `$${m}$ と $${m + 1}$`, easy, verify };
        return { q: `$x\\times x=${n}$ となる《正|せい》の《数|かず》 $x$ は、《整数|せい|すう》□と□の《間|あいだ》`, a: `$${m}$ と $${m + 1}$`, easy, verify };
      },
      // 小数第1位まではさむ（表でためす）
      s3(r) {
        const n = r.int(2, 40), m = Math.floor(Math.sqrt(100 * n));
        if (isq(n) >= 0) return null;
        const lo = (m / 10).toFixed(1), hi = ((m + 1) / 10).toFixed(1);
        return { q: `$\\sqrt{${n}}$ を、《小数第|しょう|すう|だい》1《位|い》までの□と□ではさむ`, a: `$${lo}$ と $${hi}$`,
          easy: `$${lo}^{2}=${dec(m * m, 2)}$、$${hi}^{2}=${dec((m + 1) * (m + 1), 2)}$`, verify: () => (m * m < 100 * n && 100 * n < (m + 1) * (m + 1)) || 'はさめていない' };
      },
      // わな：中が2乗の数（はさまなくてよい）
      trap(r) {
        const n = r.int(3, 12);
        const p = { q: `$\\sqrt{${n * n}}$ は、《整数|せい|すう》□と□の《間|あいだ》`, a: `《間|あいだ》ではない（ちょうど${n}）` };
        return dest(p, '2-51', `${n * n}は2《乗|じょう》の《数|かず》。はさまなくても $\\sqrt{${n * n}}=${n}$`);
      },
    },
  });

  // ================================================================ 2-52
  const SF = [2, 3, 5, 6, 7];   // 2乗の数をふくまない数
  M.add({
    id: '2-52', part: PART, chap: '2-8④', stars: 1,
    title: '√どうしをかけて2《乗|じょう》の《数|かず》を《作|つく》る',
    mark: '**√×√**。《中|なか》どうしをかけると2《乗|じょう》の《数|かず》になる。',
    futsu: ['$\\sqrt{2}=1.414$、$\\sqrt{32}=5.657$ として、', '$1.414\\times5.657$ を《計算|けい|さん》する。'],
    raku: ['《中|なか》どうしをかけて', '$\\sqrt{2}\\times\\sqrt{32}=\\sqrt{64}$', '$=8$'],
    why: '$\\sqrt{2}\\times\\sqrt{3}=\\sqrt{6}$ のように、√のかけ《算|ざん》は《中|なか》どうしをかけてよい（2-8④）。',
    caution: 'たし《算|ざん》は《中|なか》をたせない。$\\sqrt{2}+\\sqrt{3}$ は $\\sqrt{5}$ ではない。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '18mm' },
    // √のかけ算で、中の積が2乗の数（□をもとめるものもふくむ）・(√n)^2
    fits(q) {
      if (/\(\\sqrt\{\d+\}\)\^\{2\}/.test(q)) return true;
      const rs = radicands(q);
      if (rs.length < 2 || !/\\times|たて.*よこ/.test(q) || /\}[+-]\\sqrt/.test(q)) return false;
      if (rs.includes('□')) return true;
      return productIsSquare(rs);
    },
    steps: {
      s1(r) {
        const a = r.pick(SF), p = r.int(1, 4), q = r.int(1, 4);
        const x = a * p * p, y = a * q * q;
        if (x > 99 || y > 99 || (p === q && p > 1)) return null;
        return { q: r.chance(0.5) ? `$\\sqrt{${x}}\\times\\sqrt{${y}}$` : `$\\sqrt{${y}}\\times\\sqrt{${x}}$`, a: `$${a * p * q}$`, easy: `$\\sqrt{${x * y}}$`, key: `52:${sortKey(x, y)}` };
      },
      // 3つの√・小数・(√n)^2・4つかける
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [a, b] = r.shuffle([2, 3, 5, 7]).slice(0, 2), L = r.shuffle([a, b, a * b]);
          return { q: `$${L.map(x => `\\sqrt{${x}}`).join('\\times')}$`, a: `$${a * b}$`, easy: `$\\sqrt{${a * a * b * b}}$`, key: `52t:${sortKey(...L)}` };
        }
        if (k === 1) {
          const [a, kk] = r.pick([[2, 2], [3, 2], [2, 3], [5, 3], [5, 2], [3, 3]]);
          const x = dec(a, 1), y = dec(a * kk * kk, 1);
          return { q: `$\\sqrt{${x}}\\times\\sqrt{${y}}$`, a: `$${dec(a * kk, 1)}$`, easy: `$\\sqrt{${dec(a * a * kk * kk, 2)}}$` };
        }
        if (k === 2) { const n = r.pick([2, 3, 5, 6, 7, 10, 11]); return { q: `$(\\sqrt{${n}})^{2}$`, a: `$${n}$`, easy: `$\\sqrt{${n}}\\times\\sqrt{${n}}$` }; }
        const n = r.pick([2, 3, 5]);
        return { q: `$\\sqrt{${n}}\\times\\sqrt{${n}}\\times\\sqrt{${n}}\\times\\sqrt{${n}}$`, a: `$${n * n}$`, easy: `$${n}\\times${n}$` };
      },
      // 長方形の面積・□をもとめる
      s3(r) {
        const a = r.pick([2, 3, 5]), p = r.int(1, 3), q = r.int(2, 4);
        if (p === q) return null;
        const x = a * p * p, y = a * q * q, v = a * p * q;
        if (r.chance(0.5)) {
          return { q: `たて $\\sqrt{${x}}\\,\\mathrm{cm}$、よこ $\\sqrt{${y}}\\,\\mathrm{cm}$ の《長方形|ちょう|ほう|けい》の《面積|めん|せき》は □ $\\mathrm{cm}^{2}$`, a: `$${v}$`, easy: `$\\sqrt{${x}}\\times\\sqrt{${y}}=\\sqrt{${x * y}}$` };
        }
        return { q: `$\\sqrt{${x}}\\times\\sqrt{□}=${v}$`, a: `$${y}$`, val: `$${v}$`, easy: `$\\sqrt{${x}}\\times\\sqrt{${y}}=\\sqrt{${v * v}}=${v}$`, verify: () => x * y === v * v || 'ちがう' };
      },
      // わな：√のたし算・ひき算（中をたせない。2乗の数を外に出す）
      trap(r) {
        const a = r.pick([2, 3, 5]), k = r.int(2, 3);
        if (r.chance(0.6)) {
          const p = { q: r.chance(0.5) ? `$\\sqrt{${a}}+\\sqrt{${a * k * k}}$` : `$\\sqrt{${a * k * k}}+\\sqrt{${a}}$`, a: `$${k + 1}\\sqrt{${a}}$`, key: `52x:${a}:${k}` };
          return dest(p, '2-52', `たし《算|ざん》は《中|なか》どうしをたせない。$\\sqrt{${a}}+${k}\\sqrt{${a}}=${k + 1}\\sqrt{${a}}$`);
        }
        const c = k - 1 === 1 ? '' : String(k - 1);
        const p = { q: `$\\sqrt{${a * k * k}}-\\sqrt{${a}}$`, a: `$${c}\\sqrt{${a}}$` };
        return dest(p, '2-52', `ひき《算|ざん》は《中|なか》どうしをひけない。$${k}\\sqrt{${a}}-\\sqrt{${a}}=${c}\\sqrt{${a}}$`);
      },
    },
  });

  // ================================================================ 2-53
  const rootTeX = (k, m) => (m === 1 ? String(k) : `${k === 1 ? '' : k}\\sqrt{${m}}`);
  M.add({
    id: '2-53', part: PART, chap: '2-8④の《先|さき》', stars: 2,
    title: '√の《中|なか》の2《乗|じょう》の《数|かず》を《外|そと》に《出|だ》す',
    mark: '√の《中|なか》が**4・9・16・25 の《倍数|ばい|すう》**。',
    futsu: ['$\\sqrt{12}$ を、《電卓|でん|たく》で3.464……と', '《計算|けい|さん》して、そのまま《使|つか》う。'],
    raku: ['$12=4\\times3$ に《分|わ》けて', '$\\sqrt{12}=\\sqrt{4}\\times\\sqrt{3}$', '$=2\\sqrt{3}$'],
    why: '√どうしのかけ《算|ざん》（2-8④）を《逆|ぎゃく》に《使|つか》う。$\\sqrt{4}=2$ が《外|そと》に《出|で》る。',
    caution: '$\\sqrt{15}$ のように、《中|なか》に2《乗|じょう》の《数|かず》がなければ、このまま。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    boxw: '20mm',
    // 答えが k√m（k>1、m>1）になる √1つ・√のかけ算・√のたし算とひき算
    fits(q) {
      const t = onlyMath(q);
      if (t == null) return false;
      let m = /^(\d*)\\sqrt\{(\d+)\}$/.exec(t);
      if (m) { const [k, s] = sqf(+m[2]); return k > 1 && s > 1; }
      if (/^\\sqrt\{\d+\}(\\times\\sqrt\{\d+\})+$/.test(t)) { const P = radicands(t).reduce((x, y) => x * +y, 1); const [k, s] = sqf(P); return k > 1 && s > 1; }
      m = /^\\sqrt\{(\d+)\}[+-]\\sqrt\{(\d+)\}$/.exec(t);
      if (m) { const A = sqf(+m[1]), B = sqf(+m[2]); return A[1] === B[1] && A[1] > 1 && (A[0] > 1 || B[0] > 1); }
      return false;
    },
    steps: {
      s1(r) {
        const k = r.int(2, 5), m = r.pick([2, 3, 5, 6, 7, 10, 11]), N = k * k * m;
        if (N > 200) return null;
        return { q: `$\\sqrt{${N}}$`, a: `$${k}\\sqrt{${m}}$`, easy: `$\\sqrt{${k * k}\\times${m}}$` };
      },
      // 大きな2乗の数・前に数がある
      s2(r) {
        if (r.chance(0.6)) {
          const k = r.int(6, 10), m = r.pick([2, 3, 5]), N = k * k * m;
          if (N > 300) return null;
          return { q: `$\\sqrt{${N}}$`, a: `$${k}\\sqrt{${m}}$`, easy: `$\\sqrt{${k * k}\\times${m}}$` };
        }
        const c = r.int(2, 4), k = r.int(2, 3), m = r.pick([2, 3, 5]);
        return { q: `$${c}\\sqrt{${k * k * m}}$`, a: `$${c * k}\\sqrt{${m}}$`, easy: `$${c}\\times${k}\\sqrt{${m}}$` };
      },
      // √のかけ算・たし算・ひき算のあとで外に出す
      s3(r) {
        if (r.chance(0.5)) {
          const [x, y] = r.pick([[6, 3], [2, 6], [10, 5], [3, 15], [2, 10], [5, 15], [6, 10], [2, 14], [3, 6], [5, 10], [7, 14], [3, 21], [6, 15], [10, 15], [6, 14]]);
          const [k, m] = sqf(x * y);
          return { q: r.chance(0.5) ? `$\\sqrt{${x}}\\times\\sqrt{${y}}$` : `$\\sqrt{${y}}\\times\\sqrt{${x}}$`, a: `$${rootTeX(k, m)}$`, easy: `$\\sqrt{${x * y}}=\\sqrt{${k * k}\\times${m}}$`, key: `53:${sortKey(x, y)}` };
        }
        const m = r.pick([2, 3, 5]), p = r.int(2, 4), q = r.int(2, 4);
        if (p === q) return null;
        if (r.chance(0.5)) return { q: `$\\sqrt{${p * p * m}}+\\sqrt{${q * q * m}}$`, a: `$${p + q}\\sqrt{${m}}$`, easy: `$${p}\\sqrt{${m}}+${q}\\sqrt{${m}}$`, key: `53s:${m}:${sortKey(p, q)}` };
        const [P, Q] = p > q ? [p, q] : [q, p];
        return { q: `$\\sqrt{${P * P * m}}-\\sqrt{${Q * Q * m}}$`, a: `$${rootTeX(P - Q, m)}$`, easy: `$${P}\\sqrt{${m}}-${Q}\\sqrt{${m}}$` };
      },
      // わな：中に2乗の数がない（このまま）
      trap(r) {
        const n = r.pick([6, 10, 14, 15, 21, 22, 26, 30, 33, 35, 42]);
        const f = primes(n);
        return dest({ q: `$\\sqrt{${n}}$`, a: `$\\sqrt{${n}}$` }, '2-53', `${n}は${f.join('と')}に《分|わ》かれ、2《乗|じょう》の《数|かず》がない。このまま`);
      },
    },
  });

  // ================================================================ 2-54
  M.add({
    id: '2-54', part: PART, chap: '2-8①⑤', stars: 1,
    title: '《面積|めん|せき》が $k$ 《倍|ばい》なら1《辺|ぺん》は $\\sqrt{k}$ 《倍|ばい》',
    mark: '**《正方形|せい|ほう|けい》の《面積|めん|せき》**や**《振|ふ》り《子|こ》の《長|なが》さ**が《何倍|なん|ばい》になったか。',
    futsu: ['もとの1《辺|ぺん》を《決|き》めて、《面積|めん|せき》9《倍|ばい》の', '《正方形|せい|ほう|けい》の1《辺|ぺん》を《計算|けい|さん》し、くらべる。'],
    raku: ['《面積|めん|せき》9《倍|ばい》 → 1《辺|ぺん》は $\\sqrt{9}=3$《倍|ばい》', '《振|ふ》り《子|こ》の《長|なが》さ4《倍|ばい》', '→ 《周期|しゅう|き》は $\\sqrt{4}=2$《倍|ばい》'],
    why: '1《辺|ぺん》が□《倍|ばい》なら、たても□《倍|ばい》、よこも□《倍|ばい》で、《面積|めん|せき》は□×□《倍|ばい》（2-8①）。《周期|しゅう|き》は《長|なが》さの√に《比例|ひ|れい》する（2-8⑤）。',
    caution: '1《辺|ぺん》を3《倍|ばい》にしたときの《面積|めん|せき》は、《逆|ぎゃく》の《向|む》き。$3^{2}=9$《倍|ばい》になる。',
    counts: { s1: 8, s2: 7, s3: 6, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '14mm' },
    // 正方形の面積が何倍→1辺・振り子の長さが何倍→周期
    fits(q) {
      return (/面積を[^、]*に(する|した)/.test(q) && /1辺は/.test(q)) || /^1辺を□倍にすると、正方形の面積は\d+倍$/.test(q) || /振り子の長さを[^、]*(倍|にす)[^、]*、周期は/.test(q) || /振り子を、長さ/.test(q);
    },
    steps: {
      s1(r) {
        const k = r.int(2, 10);
        return { q: `《正方形|せい|ほう|けい》の《面積|めん|せき》を${k * k}《倍|ばい》にすると、1《辺|ぺん》は □《倍|ばい》`, a: `$${k}$`, easy: `$\\sqrt{${k * k}}=${k}$` };
      },
      // 振り子・「1辺を何倍にすると、面積が k^2 倍」
      s2(r) {
        const k = r.int(2, 9);
        if (r.chance(0.55)) return { q: `《振|ふ》り《子|こ》の《長|なが》さを${k * k}《倍|ばい》にすると、《周期|しゅう|き》は □《倍|ばい》`, a: `$${k}$`, easy: `$\\sqrt{${k * k}}=${k}$` };
        return { q: `1《辺|ぺん》を□《倍|ばい》にすると、《正方形|せい|ほう|けい》の《面積|めん|せき》は${k * k}《倍|ばい》`, a: `$${k}$`, easy: `$\\sqrt{${k * k}}=${k}$` };
      },
      // 長さや秒の値で・2乗の数でない倍
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const s = r.int(2, 9), k = r.int(2, 4);
          return { q: `1《辺|ぺん》$${s}\\,\\mathrm{cm}$ の《正方形|せい|ほう|けい》の《面積|めん|せき》を${k * k}《倍|ばい》にした《正方形|せい|ほう|けい》の1《辺|ぺん》は □ cm`, a: `$${s * k}$`, easy: `$${s}\\times\\sqrt{${k * k}}$` };
        }
        if (t === 1) {
          // 長さ L cm で周期 T 秒（T は 100 倍した整数）
          const [L, T100] = r.pick([[25, 100], [10, 63], [50, 140], [100, 200]]), k = r.int(2, 3);
          const L2 = L * k * k, len = L2 >= 100 ? `$${dec(L2, 2)}\\,\\mathrm{m}$` : `$${L2}\\,\\mathrm{cm}$`;
          const T = T100 % 10 ? dec(T100, 2) : (T100 / 100).toFixed(1);
          return { q: `《長|なが》さ $${L}\\,\\mathrm{cm}$ で《周期|しゅう|き》${T}《秒|びょう》の《振|ふ》り《子|こ》を、《長|なが》さ${len}にすると《周期|しゅう|き》は □《秒|びょう》`,
            a: `$${T100 % 10 ? dec(T100 * k, 2) : (T100 * k / 100).toFixed(1)}$`, easy: `${k * k}《倍|ばい》の《長|なが》さ。$${T}\\times\\sqrt{${k * k}}$` };
        }
        const k = r.pick([2, 3, 5, 6, 7]);
        return { q: `《正方形|せい|ほう|けい》の《面積|めん|せき》を${k}《倍|ばい》にすると、1《辺|ぺん》は □《倍|ばい》`, a: `$\\sqrt{${k}}$`, easy: `$\\sqrt{${k}}$。およそ${ROOT[k]}《倍|ばい》` };
      },
      // わな：逆の向き（1辺が k 倍 → 面積は k^2 倍、周期を k 倍 → 長さは k^2 倍）
      trap(r) {
        const k = r.int(2, 6);
        const q = r.chance(0.5) ? `1《辺|ぺん》を${k}《倍|ばい》にすると、《正方形|せい|ほう|けい》の《面積|めん|せき》は □《倍|ばい》` : `《周期|しゅう|き》を${k}《倍|ばい》にするには、《振|ふ》り《子|こ》の《長|なが》さを □《倍|ばい》`;
        return dest({ q, a: `$${k * k}$` }, '2-54', `《逆|ぎゃく》の《向|む》き。√ではなく2《乗|じょう》する。$${k}^{2}=${k * k}$`);
      },
    },
  });

  // ================================================================ 2-55
  const fracTeX = x => F.tex(x);
  // くり返す部分 rep（整数部分 ip）の小数の値（分数）
  const repVal = (ip, rep) => F.add(F.make(ip), F.make(parseInt(rep, 10), Math.pow(10, rep.length) - 1));
  M.add({
    id: '2-55', part: PART, chap: '2-9①', stars: 1,
    title: 'くり《返|かえ》す《小数|しょう|すう》は9・99でわった《分数|ぶん|すう》',
    mark: '《小数点|しょう|すう|てん》の**すぐ《後|あと》から**くり《返|かえ》す《小数|しょう|すう》。',
    futsu: ['$0.777\\cdots$ を、$\\frac{7}{10}$ や $\\frac{77}{100}$ に', 'しても、ぴったりにはならない。'],
    raku: ['1けたがくり《返|かえ》す → 9でわる', '$0.777\\cdots=\\frac{7}{9}$', '2けたなら99：$0.1212\\cdots=\\frac{12}{99}$'],
    why: '$\\frac{1}{9}=0.111\\cdots$、$\\frac{1}{99}=0.0101\\cdots$ なので、そのいくつ《分|ぶん》と《考|かんが》える（2-9①）。',
    caution: '$0.1222\\cdots$ のように、すぐ《後|あと》からくり《返|かえ》さない《小数|しょう|すう》には、そのままでは《使|つか》えない。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '24mm', trap: '16mm' },
    boxh: '12mm',
    // 小数点のすぐ後からくり返す小数（$0.777\cdots$、$1.333\cdots$）・分母が 99 の約数の分数を小数に
    fits(q) {
      const t = onlyMath(q);
      if (t != null) return pureRepeat(t);
      const m = /^\$\\frac\{(\d+)\}\{(\d+)\}\$ を小数で$/.exec(q);
      return !!m && +m[2] > 1 && 99 % +m[2] === 0;
    },
    steps: {
      // 1けた・2けた（約分なし）
      s1(r) {
        if (r.chance(0.5)) {
          const d = r.int(1, 8), v = F.make(d, 9);
          return { q: `$${repTeX(0, String(d))}$`, a: `$${fracTeX(v)}$`, easy: `$\\frac{${d}}{9}${v[1] !== 9 ? '=' + fracTeX(v) : ''}$`, verify: () => F.eq(repVal(0, String(d)), v) || 'ちがう' };
        }
        const n = r.int(1, 98);
        if (n % 11 === 0 || gcd(n, 99) !== 1) return null;
        const rep = String(n).padStart(2, '0'), v = F.make(n, 99);
        return { q: `$${repTeX(0, rep)}$`, a: `$${fracTeX(v)}$`, easy: `$\\frac{${n}}{99}$`, verify: () => F.eq(repVal(0, rep), v) || 'ちがう' };
      },
      // 約分がいる2けた・3けた（999）
      s2(r) {
        if (r.chance(0.6)) {
          const n = r.int(3, 96);
          if (n % 11 === 0 || gcd(n, 99) === 1) return null;
          const rep = String(n).padStart(2, '0'), v = F.make(n, 99);
          return { q: `$${repTeX(0, rep)}$`, a: `$${fracTeX(v)}$`, easy: `$\\frac{${n}}{99}=${fracTeX(v)}$`, verify: () => F.eq(repVal(0, rep), v) || 'ちがう' };
        }
        const n = r.pick([37, 74, 135, 108, 27, 54, 185, 296, 148, 216, 270, 189, 162, 324, 81, 259]);
        const rep = String(n).padStart(3, '0'), v = F.make(n, 999);
        return { q: `$${repTeX(0, rep)}$`, a: `$${fracTeX(v)}$`, easy: `$\\frac{${n}}{999}=${fracTeX(v)}$`, verify: () => F.eq(repVal(0, rep), v) || 'ちがう' };
      },
      // 整数の部分がある・0.999…・分数を小数に
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const ip = r.int(1, 3), d = r.pick([1, 2, 3, 4, 5, 6, 7, 8]), v = repVal(ip, String(d));
          return { q: `$${repTeX(ip, String(d))}$`, a: `$${fracTeX(v)}$`, easy: `$${ip}+\\frac{${d}}{9}$`, verify: () => true };
        }
        if (k === 1) {
          const ip = r.int(1, 2), n = r.pick([9, 18, 27, 36, 45, 12, 15, 21, 24]), rep = String(n).padStart(2, '0'), v = repVal(ip, rep);
          return { q: `$${repTeX(ip, rep)}$`, a: `$${fracTeX(v)}$`, easy: `$${ip}+\\frac{${n}}{99}$`, verify: () => true };
        }
        if (k === 2) return r.chance(0.3) ? { q: `$${repTeX(0, '9')}$`, a: '$1$', easy: '$\\frac{9}{9}$' } : null;
        // 分数を、くり返す小数に（逆）
        const d = r.pick([9, 11, 33]), n = r.int(1, d - 1);
        if (gcd(n, d) !== 1) return null;
        const e = expand(n, d), t = repTeX(0, e.rep);
        return { q: `$\\frac{${n}}{${d}}$ を《小数|しょう|すう》で`, a: `$${t}$`, easy: `$\\frac{${n}}{${d}}=\\frac{${n * 99 / d}}{99}$`,
          verify: () => (e.pre === '' && F.eq(repVal(0, e.rep), F.make(n, d))) || 'くり返しがちがう' };
      },
      // わな：すぐ後からくり返さない（0.1222…）
      trap(r) {
        const a = r.int(1, 9), b = r.int(1, 8);
        if (a === b) return null;
        const v = F.make(9 * a + b, 90);
        return dest({ q: `$0.${a}${b}${b}${b}\\cdots$`, a: `$${fracTeX(v)}$`, verify: () => F.eq(F.add(F.make(a, 10), F.make(b, 90)), v) || 'ちがう' }, '2-55',
          `すぐ《後|あと》からはくり《返|かえ》さない。$\\frac{${a}}{10}+\\frac{${b}}{90}=${fracTeX(v)}$`);
      },
    },
  });

  // ================================================================ 2-56
  // くり返す分数（分母は 2・5 をふくまない）：分母 7・13（6けた）、11（2けた）、27・37（3けた）
  function repFrac(r, dens) {
    const d = r.pick(dens), n = r.int(1, d - 1);
    if (gcd(n, d) !== 1) return null;
    const e = expand(n, d);
    if (e.pre !== '') return null;
    return { n, d, rep: e.rep, p: e.rep.length, tex: repTeX(0, e.rep) };
  }
  const nth = (N, p) => { const q = Math.floor(N / p), rr = N % p; return { q, rr, k: rr === 0 ? p : rr }; };
  M.add({
    id: '2-56', part: PART, chap: '2-9①', stars: 1,
    title: 'くり《返|かえ》しの《小数第|しょう|すう|だい》$\\square$《位|い》は、あまりで',
    mark: '「《小数第|しょう|すう|だい》20《位|い》の《数字|すう|じ》」のように、くり《返|かえ》す《小数|しょう|すう》の**ずっと《先|さき》のけた**をきかれる。',
    futsu: ['$\\frac{1}{7}=0.142857\\,142857\\cdots$ を、', '20けた《目|め》まで《書|か》き《出|だ》す。'],
    raku: ['142857の6けたが1《組|くみ》。', '$20\\div6=3$ あまり2', '→ 《組|くみ》の2けた《目|め》の4'],
    why: '《同|おな》じ6けたが《何組|なん|くみ》もならぶので、《組|くみ》の《中|なか》の《何番目|なん|ばん|め》かだけ《見|み》ればよい（2-9①）。',
    caution: 'あまりが0なら《組|くみ》の《最後|さい|ご》のけた。$\\frac{1}{8}=0.125$ のように《終|お》わる《小数|しょう|すう》には《使|つか》えない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '10mm',
    // くり返す小数の「小数第□位の数字」・くり返しならべた列の「□番目」
    fits(q) {
      if (/とくり返すカードの\d+番目/.test(q)) return true;
      if (!/小数第\d+位の数字/.test(q)) return false;
      if (/\\cdots/.test(q)) return true;
      const f = oneFrac(q);
      if (!f) return false;
      const d = f[1] / gcd(f[0], f[1]);
      return d > 1 && d % 2 !== 0 && d % 5 !== 0;
    },
    steps: {
      // 小数が書いてある・あまりが0でない
      s1(r) {
        const f = repFrac(r, [7, 7, 13, 11, 27, 37]);
        if (!f || f.p < 2) return null;
        const N = r.int(7, 60), t = nth(N, f.p);
        if (t.rr === 0 || N <= f.p) return null;
        const dg = +f.rep[t.k - 1];
        return { q: `$\\frac{${f.n}}{${f.d}}=${f.tex}$ の《小数第|しょう|すう|だい》${N}《位|い》の《数字|すう|じ》`, a: `$${dg}$`,
          easy: `${N}÷${f.p}＝${t.q} あまり ${t.rr} → ${t.k}けた《目|め》`, verify: () => digitAt(f.n, f.d, N) === dg || 'ちがう' };
      },
      // あまりが0（組の最後のけた）・2けたのくり返しは自分で小数にする
      s2(r) {
        if (r.chance(0.55)) {
          const f = repFrac(r, [7, 13, 27, 37, 11]);
          if (!f || f.p < 2) return null;
          const N = f.p * r.int(2, 9), t = nth(N, f.p), dg = +f.rep[f.p - 1];
          return { q: `$\\frac{${f.n}}{${f.d}}=${f.tex}$ の《小数第|しょう|すう|だい》${N}《位|い》の《数字|すう|じ》`, a: `$${dg}$`,
            easy: `${N}÷${f.p}＝${t.q} あまり 0 → 《組|くみ》の《最後|さい|ご》`, verify: () => digitAt(f.n, f.d, N) === dg || 'ちがう' };
        }
        const f = repFrac(r, [11]);
        if (!f) return null;
        const N = r.int(9, 40), t = nth(N, 2), dg = +f.rep[t.k - 1];
        return { q: `$\\frac{${f.n}}{11}$ の《小数第|しょう|すう|だい》${N}《位|い》の《数字|すう|じ》`, a: `$${dg}$`,
          easy: `$${f.tex}$。${N}÷2＝${t.q} あまり ${t.rr} → ${t.k}けた《目|め》`, easyCheck: false, verify: () => digitAt(f.n, 11, N) === dg || 'ちがう' };
      },
      // 小数を自分で出す（6けた・3けた）・くり返しならべた列
      s3(r) {
        if (r.chance(0.6)) {
          const f = repFrac(r, [7, 7, 27, 37]);
          if (!f) return null;
          const N = r.int(10, 50), t = nth(N, f.p), dg = +f.rep[t.k - 1];
          return { q: `$\\frac{${f.n}}{${f.d}}$ の《小数第|しょう|すう|だい》${N}《位|い》の《数字|すう|じ》`, a: `$${dg}$`,
            easy: `$${f.tex}$。${N}÷${f.p}＝${t.q} あまり ${t.rr} → ${t.k}けた《目|め》`, easyCheck: false, verify: () => digitAt(f.n, f.d, N) === dg || 'ちがう' };
        }
        const L = r.int(3, 5), seq = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, L), N = r.int(15, 60), t = nth(N, L);
        return { q: `${seq.concat(seq).join('、')}、……とくり《返|かえ》すカードの${N}《番目|ばん|め》は □`, a: `$${seq[t.k - 1]}$`,
          easy: `${N}÷${L}＝${t.q} あまり ${t.rr} → ${t.k}《番目|ばん|め》`, verify: () => seq[(N - 1) % L] === seq[t.k - 1] || 'ちがう' };
      },
      // わな：終わる小数（くり返さないので、その先は0）
      trap(r) {
        const d = r.pick([4, 8, 8, 16, 20, 25, 40]), n = r.int(1, d - 1);
        if (gcd(n, d) !== 1) return null;
        const e = expand(n, d), N = r.int(10, 30);
        const p = { q: `$\\frac{${n}}{${d}}$ の《小数第|しょう|すう|だい》${N}《位|い》の《数字|すう|じ》`, a: '$0$', verify: () => digitAt(n, d, N) === 0 || 'ちがう' };
        return dest(p, '2-56', `$\\frac{${n}}{${d}}=0.${e.pre}$ で《終|お》わる。くり《返|かえ》さないので0`, { noCheck: true });
      },
    },
  });

  // ================================================================ 2-57
  const cm = d => `$${d}\\,\\mathrm{cm}$`;
  M.add({
    id: '2-57', part: PART, chap: '2-9③', stars: 1,
    title: '《円周|えん|しゅう》は《直径|ちょっ|けい》×$\\pi$、《直径|ちょっ|けい》は《円周|えん|しゅう》÷$\\pi$',
    mark: '**《円周|えん|しゅう》・《直径|ちょっ|けい》**、3.14をかける《式|しき》がならぶ。$\\pi$ は3.14で《計算|けい|さん》する。',
    futsu: ['$3.14\\times7+3.14\\times3$ を', '$21.98+9.42=31.4$ と、', '1つずつ《計算|けい|さん》する。'],
    raku: ['3.14でまとめる：', '$3.14\\times(7+3)=3.14\\times10=31.4$', '《円周|えん|しゅう》94.2 → 《直径|ちょっ|けい》 $94.2\\div3.14=30$'],
    why: '《円周|えん|しゅう》＝《直径|ちょっ|けい》×$\\pi$（2-9③）。《直径|ちょっ|けい》×3.14＝《円周|えん|しゅう》なので、《直径|ちょっ|けい》は《円周|えん|しゅう》÷3.14。',
    caution: '《半径|はん|けい》のときは、まず2《倍|ばい》して《直径|ちょっ|けい》にする（《半径|はん|けい》×$\\pi$ ではない）。',
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '20mm', trap: '18mm' },
    // 直径と円周（半径の問題はのぞく）・3.14 をかける式がならぶ
    fits(q) {
      if (/半径/.test(q)) return false;
      if (/3\.14\\times\d+[+-]3\.14\\times\d+|\d+\\times3\.14[+-]\d+\\times3\.14/.test(q)) return true;
      return /直径/.test(q) && /円周|まわり|回転/.test(q);
    },
    steps: {
      // 直径→円周、円周→直径
      s1(r) {
        const d = r.int(2, 30);
        if (r.chance(0.55)) return { q: `《直径|ちょっ|けい》${cm(d)} の《円周|えん|しゅう》は □ cm`, a: `$${dec(d * 314, 2)}$`, easy: `$${d}\\times3.14$` };
        const c = dec(d * 314, 2);
        return { q: `《円周|えん|しゅう》${cm(c)} の《円|えん》の《直径|ちょっ|けい》は □ cm`, a: `$${d}$`, easy: `$${c}\\div3.14$` };
      },
      // 3.14 をまとめる
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const s = r.pick([10, 10, 20, 100]), a = r.int(2, s - 2), b = s - a;
          if (a === b) return null;
          const q = r.chance(0.5) ? `$3.14\\times${a}+3.14\\times${b}$` : `$${a}\\times3.14+${b}\\times3.14$`;
          return { q, a: `$${dec(s * 314, 2)}$`, easy: `$3.14\\times(${a}+${b})=3.14\\times${s}$`, key: `57:${sortKey(a, b)}` };
        }
        if (k === 1) {
          const s = r.pick([10, 20]), b = r.int(2, 9), a = s + b;
          return { q: `$3.14\\times${a}-3.14\\times${b}$`, a: `$${dec(s * 314, 2)}$`, easy: `$3.14\\times(${a}-${b})=3.14\\times${s}$` };
        }
        const d1 = r.int(11, 30), d2 = r.int(2, d1 - 1);
        return { q: `《直径|ちょっ|けい》${cm(d1)} と ${cm(d2)} の《円周|えん|しゅう》の《差|さ》は □ cm`, a: `$${dec((d1 - d2) * 314, 2)}$`, easy: `$3.14\\times(${d1}-${d2})$` };
      },
      // 車輪・木のまわり
      s3(r) {
        if (r.chance(0.6)) {
          const d = r.pick([40, 50, 60, 70]), n = r.pick([100, 200, 500, 1000]);
          return { q: `《直径|ちょっ|けい》${cm(d)} の《車輪|しゃ|りん》が${n}《回転|かい|てん》すると、□ m《進|すす》む`, a: `$${dec(d * n * 314, 4)}$`, easy: `$${d}\\times3.14\\times${n}\\div100$` };
        }
        const d = r.int(2, 9) * 10, c = dec(d * 314, 2);
        return { q: `まわりの《長|なが》さが ${cm(c)} の《木|き》の《直径|ちょっ|けい》は □ cm`, a: `$${d}$`, easy: `$${c}\\div3.14$` };
      },
      // わな：半径（半径×π としない。まず直径に）
      trap(r) {
        const rr = r.int(2, 15);
        return dest({ q: `《半径|はん|けい》${cm(rr)} の《円|えん》の《円周|えん|しゅう》は □ cm`, a: `$${dec(2 * rr * 314, 2)}$` }, '2-57',
          `《半径|はん|けい》×3.14 ではない。《直径|ちょっ|けい》は ${cm(2 * rr)}。$${2 * rr}\\times3.14$`);
      },
    },
  });

  // ================================================================ 2-98
  const TS = [2, 4, 5, 8, 10, 16, 20, 25, 32, 40, 50, 80, 125, 200];   // 2と5だけ
  const RP = [3, 7, 9, 11, 13, 21, 27, 33, 37];                         // 2も5もない
  const MX = [6, 12, 14, 15, 24, 30, 35, 45, 60, 75];                   // 2や5と、ほかの素数
  const YES = 'はい', NO = 'いいえ';
  const fac = d => (primes(d).length === 1 ? `${d}は《素数|そ|すう》` : `$${d}=${factorTeX(d)}$`);
  // 何けたで終わるか（2^a 5^b なら max(a, b)）
  const places = d => { let a = 0, b = 0; while (d % 2 === 0) { d /= 2; a++; } while (d % 5 === 0) { d /= 5; b++; } return Math.max(a, b); };
  M.add({
    id: '2-98', part: PART, chap: '2-9①', stars: 1,
    title: '《分母|ぶん|ぼ》が2と5だけの《分数|ぶん|すう》は、《小数|しょう|すう》で《終|お》わる',
    mark: '《分数|ぶん|すう》を《小数|しょう|すう》にすると**《終|お》わるか**。《分母|ぶん|ぼ》を《素数|そ|すう》に《分|わ》けてみる。',
    futsu: ['$\\frac{3}{40}$ を $3\\div40$ と、わり《算|ざん》を', '《進|すす》めて、あまりが0になるかを《見|み》る。'],
    raku: ['$40=2\\times2\\times2\\times5$', '2と5だけなので《終|お》わる。', '$\\frac{3}{40}=\\frac{75}{1000}=0.075$'],
    why: '2と5だけなら、《分母|ぶん|ぼ》と《分子|ぶん|し》に2や5をかけて、《分母|ぶん|ぼ》を10・100・1000にできる（2-9①）。',
    caution: 'まず《約分|やく|ぶん》する。《約分|やく|ぶん》したあとの《分母|ぶん|ぼ》に3や7があれば、くり《返|かえ》す。',
    counts: { s1: 9, s2: 7, s3: 6, trap: 2 },
    cols: { s3: 1 },
    boxw: { s1: '13mm', s2: '13mm', s3: '18mm', trap: '13mm' },
    // 分数が小数で終わるか／分数を小数にする話で、約分した分母が2と5だけ
    fits(q) {
      if (!/小数/.test(q)) return false;
      const f = oneFrac(q);
      if (!f) return false;
      const d = f[1] / gcd(f[0], f[1]);
      // 「終わる？」は、約分した分母が2と5だけか、2も5もないとき（2や5とほかの素数がまざるのは、わな）
      if (/^\$\\frac\{\d+\}\{\d+\}\$ は小数で終わる？/.test(q)) return d > 1 && (only25(d) || (d % 2 !== 0 && d % 5 !== 0));
      return d > 1 && only25(d);
    },
    steps: {
      // 終わる？（約分ずみ）
      s1(r) {
        const ts = r.chance(0.6), d = r.pick(ts ? TS : RP), n = r.int(1, d - 1);
        if (gcd(n, d) !== 1) return null;
        const e = expand(n, d);
        return { q: `$\\frac{${n}}{${d}}$ は《小数|しょう|すう》で《終|お》わる？ □`, a: ts ? YES : NO,
          easy: ts ? `${fac(d)}。$0.${e.pre}$` : `${fac(d)}。2も5もない`, verify: () => (!e.rep === ts) || 'ちがう' };
      },
      // 約分してから見る
      s2(r) {
        const ts = r.chance(0.65), d0 = r.pick(ts ? TS : RP), n0 = r.int(1, d0 - 1);
        if (gcd(n0, d0) !== 1) return null;
        const c = ts ? r.pick([3, 7, 9]) : r.pick([2, 4, 5, 10]), n = n0 * c, d = d0 * c;
        if (d > 300) return null;
        const e = expand(n, d);
        return { q: `$\\frac{${n}}{${d}}$ は《小数|しょう|すう》で《終|お》わる？ □`, a: ts ? YES : NO,
          easy: `$\\frac{${n}}{${d}}=\\frac{${n0}}{${d0}}$。${fac(d0)}${ts ? '' : '。2も5もない'}`, verify: () => (!e.rep === ts) || 'ちがう' };
      },
      // 小数にする（分母を 10・100・1000 に）・小数第何位で終わる
      s3(r) {
        const d = r.pick(TS.filter(x => x >= 4)), n = r.int(1, d - 1);
        if (gcd(n, d) !== 1) return null;
        const k = places(d), m = Math.pow(10, k) / d, e = expand(n, d);
        if (r.chance(0.6)) {
          return { q: `$\\frac{${n}}{${d}}$ を《小数|しょう|すう》で`, a: `$${dec(n * m, k)}$`, easy: `$\\frac{${n}\\times${m}}{${d}\\times${m}}=\\frac{${n * m}}{${Math.pow(10, k)}}$` };
        }
        return { q: `$\\frac{${n}}{${d}}$ は《小数第|しょう|すう|だい》□《位|い》で《終|お》わる`, a: `$${k}$`, easy: `${fac(d)}。《分母|ぶん|ぼ》を $10^{${k}}$ にできる`, easyCheck: false,
          verify: () => (e.rep === '' && e.pre.length === k) || 'けたがちがう' };
      },
      // わな：分母に2や5があっても、ほかの素数もある（終わらない）
      trap(r) {
        const d = r.pick(MX), n = r.int(1, d - 1);
        if (gcd(n, d) !== 1) return null;
        const other = [...new Set(primes(d).filter(x => x !== 2 && x !== 5))];
        const e = expand(n, d);
        const p = { q: `$\\frac{${n}}{${d}}$ は《小数|しょう|すう》で《終|お》わる？ □`, a: NO, verify: () => e.rep !== '' || 'ちがう' };
        return dest(p, '2-98', `$${d}=${factorTeX(d)}$。2や5のほかに${other.join('と')}があるので、くり《返|かえ》す`);
      },
    },
  });
})(globalThis.MONDAI);
