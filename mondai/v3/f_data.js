/* 問題集 第3巻　第6部 データと確率（わざ 3-75〜3-90、3-99）　組 f
 * 書き方は v1/README.md・v2/README.md。文は教科書 第3巻と同じ（漢字にルビ、分かち書きなし）。式は $…$。
 * データは、答え（平均・傾き・確率）がきりのよい数になるように、先に答えを決めて逆に作る。
 * 答えはかならず verify で、データから計算しなおした値（有理数で正確に）とくらべる。
 * 第29回 H-1：わなは、同じ部のほかのわざで楽にならないもの。どうしても当たるときは、楽な形に行き先を書き、also に入れる（dest）。 */
(function (M) {
  'use strict';
  const PART = 6;
  const AVG = '《平均|へい|きん》', PROB = '《確率|かく|りつ》', SIG = '$\\sigma$';
  const BUN = '《分散|ぶん|さん》', KYO = '《共分散|きょう|ぶん|さん》', SOU = '《相関係数|そう|かん|けい|すう》';
  const LSQ = '《最小二乗法|さい|しょう|に|じょう|ほう》', GEN = '《原点|げん|てん》を《通|とお》る', LINE = '《直線|ちょく|せん》';
  const OMO = '《表|おもて》', URA = '《裏|うら》', MAI = '《枚|まい》', KAI = '《回|かい》', KO = '《個|こ》', NIN = '《人|にん》';
  const DICE2 = 'サイコロ2《個|こ》';

  // ---------------------------------------------------------------- 有理数（検算用）
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const Q = (n, d) => { d = d == null ? 1 : d; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const qa = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
  const qs = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
  const qm = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
  const qd = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
  const qeq = (x, y) => !!x && !!y && x[0] === y[0] && x[1] === y[1];
  const qsum = L => L.reduce(qa, Q(0));
  const qmean = L => qd(qsum(L), Q(L.length));
  // 答えの文字（'$\frac{3}{8}$'、'14.20'、'$-2.6$'、'+3'）を有理数に
  function num(s) {
    s = M.plain(String(s)).replace(/\$/g, '').replace(/\s/g, '');
    let m = /^([+-]?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(s);
    if (m) return Q((m[1] === '-' ? -1 : 1) * +m[2], +m[3]);
    m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s);
    if (m) { const f = m[3] || ''; return Q((m[1] === '-' ? -1 : 1) * parseInt(m[2] + f, 10), 10 ** f.length); }
    return null;
  }
  // verify：答え a が、計算しなおした値 want と同じか
  const same = (a, want) => () => (qeq(num(a), want) ? true : `答え ${a} と、計算しなおした ${want[0]}/${want[1]} がちがう`);

  // ---------------------------------------------------------------- 数の書き方
  // 10^d 倍した整数 v を、小数 d けたの文字に（けたを 0 でそろえる）
  function fx(v, d) {
    const s = v < 0 ? '-' : '';
    v = Math.abs(v);
    if (!d) return s + v;
    const p = 10 ** d;
    return s + Math.floor(v / p) + '.' + String(v % p).padStart(d, '0');
  }
  // 有理数を小数の文字に。d がないときは、いちばん短いけた。割り切れなければ null
  function dq(q, d) {
    if (d == null) { d = 0; while (d <= 4 && (10 ** d) % q[1]) d++; }
    if (d > 6 || (10 ** d) % q[1]) return null;
    return fx(q[0] * ((10 ** d) / q[1]), d);
  }
  const decs = s => (String(s).split('.')[1] || '').length;
  const nm = s => (String(s)[0] === '-' ? `$${s}$` : String(s));                // 負の数は $…$
  const sg = v => (v > 0 ? `$+${v}$` : v < 0 ? `$${v}$` : '0');                   // 偏差（符号つき）
  const fr = q => (q[1] === 1 ? nm(String(q[0])) : `$${q[0] < 0 ? '-' : ''}\\frac{${Math.abs(q[0])}}{${q[1]}}$`);   // 約分した分数
  const sum = L => L.reduce((a, b) => a + b, 0);
  const sorted = L => L.slice().sort((a, b) => a - b);
  // 「本」の読み（教科書と同じ：1本・6本・10本は ぽん、3本・1000本は ぼん）
  const HON = n => `${n}《本|${n % 1000 === 0 || n % 10 === 3 ? 'ぼん' : [0, 1, 6].includes(n % 10) ? 'ぽん' : 'ほん'}》`;
  const pt = (x, y) => `$(${x},\\ ${y})$`;
  // 項をつないだ式（2 つ目からは符号つき）
  const terms = L => L.map((v, i) => (i && !String(v).startsWith('-') ? '+' : '') + v).join('');

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 問題の文の中の、「、」でつないだ数の列（3こ以上）。なければ null
  function nums(q) {
    const m = /-?\d+(?:\.\d+)?(?:、-?\d+(?:\.\d+)?){2,}/.exec(q);
    return m ? m[0].split('、').map(Number) : null;
  }
  // わなの行き先（H-1・H-2）：同じ部のほかのわざが使えるときは、楽な形に「わざ 3-xx で」と書いて also に入れる
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(3).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    return p;
  }

  // ---------------------------------------------------------------- 3-75
  // 仮の平均：B（そろった上のけた）、d（小数のけた）、hi（はなれの大きさ。10^d 倍）
  const KARI = [
    { B: [8, 12, 24, 36], d: 1, hi: 9 },
    { B: [9, 14, 21], d: 2, hi: 40 },
    { B: [150, 250, 500, 1000], d: 0, hi: 9 },
  ];
  function kari(r, n, neg, t) {
    const p = 10 ** t.d, B = r.pick(t.B) * p;
    const dv = Array.from({ length: n }, () => r.int(neg ? -Math.ceil(t.hi / 2) : 1, t.hi));
    if (neg ? !dv.some(x => x < 0) : dv.some(x => x <= 0)) return null;
    const S = sum(dv);
    if (!S || S % n || new Set(dv).size < 3) return null;
    const xs = dv.map(x => fx(B + x, t.d)), a = fx(B + S / n, t.d);
    return {
      L: xs.join('、'), a, key: `k${B}:${sorted(dv).join(',')}`,
      easy: `$${fx(B, t.d)}${S > 0 ? '+' : '-'}${fx(Math.abs(S), t.d)}\\div${n}$`,
      verify: same(a, qmean(xs.map(num))),
    };
  }
  const SC75 = [
    { t: { B: [8, 12], d: 1, hi: 6 }, f: (n, L) => `ばねののび ${L} cm の${AVG}は □ cm` },
    { t: { B: [24, 36], d: 1, hi: 9 }, f: (n, L) => `《水|みず》の《温度|おん|ど》 ${L} ℃ の${AVG}は □ ℃` },
    { t: { B: [500, 1000], d: 0, hi: 6 }, f: (n, L) => `お《茶|ちゃ》の《量|りょう》 ${L} mL の${AVG}は □ mL` },
    { t: { B: [14], d: 2, hi: 40 }, n: 5, f: (n, L) => `ふりこ ${L} 《秒|びょう》の${AVG}は □ 《秒|びょう》` },
  ];
  M.add({
    id: '3-75', part: PART, chap: '3-13', stars: 1,
    title: '《仮|かり》の《平均|へい|きん》でたす',
    mark: 'どの《数|かず》も「14.《何|なん》」のように、**《上|うえ》のけたがそろっている**。',
    futsu: ['$14.23+\\cdots+14.18=71.00$', '$71.00\\div5=14.20$', '《大|おお》きな《数|かず》のたし《算|ざん》でまちがえやすい。'],
    raku: ['14.00 をこえた《分|ぶん》だけたす。', '$0.23+0.18+0.25+0.16+0.18=1.00$', '$1.00\\div5=0.20$', '$14.00+0.20=14.20$'],
    why: 'どの《数|かず》も「14.00＋はなれ」。14.00 はならしても 14.00 のまま《残|のこ》るので、はなれだけをならせばよい（3-13①）。',
    caution: '《上|うえ》のけたがそろっていないと、はなれが《大|おお》きくなり、《楽|らく》にならない。',
    cols: 1, boxw: '20mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // 「平均」を聞いていて、数の列の上のけたがそろっている（はばが、いちばん小さい数の1割まで）
    fits(q) {
      if (!/平均/.test(q) || /分散|偏差|中央値|sigma|残り|とると|めは □|階級|度数|期待値|共分散|正規分布|ずれ|組|だけ/.test(q)) return false;
      const L = nums(q);
      if (!L || L.length < 4) return false;
      const mn = Math.min(...L), mx = Math.max(...L);
      return mn > 0 && mx - mn <= mn * 0.2;
    },
    steps: {
      // どれも仮の平均より大きい
      s1(r) {
        const k = kari(r, 5, false, r.pick(KARI));
        return k && { q: `${k.L} の${AVG}`, a: k.a, easy: k.easy, key: k.key, verify: k.verify };
      },
      // 仮の平均より小さい数もある（はなれがマイナス）。6こも
      s2(r) {
        const k = kari(r, r.int(5, 6), true, r.pick(KARI));
        return k && { q: `${k.L} の${AVG}`, a: k.a, easy: k.easy, key: k.key, verify: k.verify };
      },
      // はかった値の場面（単位つき）
      s3(r) {
        const sc = r.pick(SC75), n = 5;
        const k = kari(r, n, r.chance(0.6), sc.t);
        return k && { q: sc.f(n, k.L), a: k.a, easy: k.easy, key: k.key, verify: k.verify };
      },
      // わな：上のけたがそろっていない（2.4 と 21.7 など）。仮の平均を決めても、はなれが大きい
      trap(r) {
        const n = 5, xs = Array.from({ length: n }, () => r.int(15, 250));
        if (Math.max(...xs) < 4 * Math.min(...xs) || new Set(xs.map(x => Math.floor(x / 100))).size < 3) return null;
        const S = sum(xs);
        if (S % n) return null;
        const L = xs.map(x => fx(x, 1)), a = fx(S / n, 1);
        return dest({ q: `${L.join('、')} の${AVG}`, a, key: 't' + sorted(xs).join(','), verify: same(a, qmean(L.map(num))) },
          '3-75', `《上|うえ》のけたがそろっていない。《全部|ぜん|ぶ》たして $${fx(S, 1)}\\div${n}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-76
  // 度数分布表の平均：階級値 vs（10^d 倍の整数）と度数 fs から。値を度数の数だけならべて平均しなおす
  const tableMean = (vs, fs, d) => qmean(vs.flatMap((v, i) => Array(fs[i]).fill(Q(v, 10 ** (d || 0)))));
  const freqs = (r, k) => Array.from({ length: k }, () => r.int(1, 9));
  M.add({
    id: '3-76', part: PART, chap: '3-13', stars: 1,
    title: '《度数分布表|ど|すう|ぶん|ぷ|ひょう》の《平均|へい|きん》は《階級値|かい|きゅう|ち》×《度数|ど|すう》',
    mark: '**《度数分布表|ど|すう|ぶん|ぷ|ひょう》だけ**があり、1つ1つの《値|あたい》はわからない。',
    futsu: ['10 が2こ、20 が5こ、30 が3こを', '1つずつならべて10こたす。', '$10+10+20+\\cdots+30=210$'],
    raku: ['《階級値|かい|きゅう|ち》×《度数|ど|すう》をたす。', '$10\\times2+20\\times5+30\\times3$', '$=20+100+90=210$', '$210\\div10=21$'],
    why: 'その《階級|かい|きゅう》の《数|かず》は、みんな《階級値|かい|きゅう|ち》だったとみなす。《同|おな》じ《数|かず》のたし《算|ざん》はかけ《算|ざん》になる（3-13④）。',
    caution: '《階級|かい|きゅう》が 0〜10 なら、《階級値|かい|きゅう|ち》はまん《中|なか》の5。《元|もと》のデータの《平均|へい|きん》とは《少|すこ》しずれる。',
    cols: 1, boxw: '20mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // 度数分布表の平均／人数のちがう組の平均（平均×人数をたす。階級値×度数と同じ）
    fits(q) {
      if (/階級|度数/.test(q) && /平均/.test(q)) return true;
      return (q.match(/組\d+人の平均/g) || []).length >= 2;
    },
    steps: {
      // 階級値と度数
      s1(r) {
        const k = r.int(3, 4), w = r.pick([2, 4, 5, 10, 20]), c = r.int(1, 5) * w;
        const vs = Array.from({ length: k }, (_, i) => c + i * w), fs = freqs(r, k);
        const N = sum(fs), T = sum(vs.map((v, i) => v * fs[i])), a = dq(Q(T, N));
        if (a == null || decs(a) > 1) return null;
        return { q: `《階級値|かい|きゅう|ち》 ${vs.join('・')}、《度数|ど|すう》 ${fs.join('・')} の${AVG}`, a,
          easy: `$(${vs.map((v, i) => v * fs[i]).join('+')})\\div${N}$`, verify: same(a, tableMean(vs, fs)) };
      },
      // 階級の区切りだけ（階級値はまん中を先に出す）
      s2(r) {
        const w = r.pick([2, 4, 10]), lo = r.int(0, 3) * w, k = lo + 4 * w < 10 ? r.int(3, 4) : 3;
        const ed = Array.from({ length: k + 1 }, (_, i) => lo + i * w), vs = ed.slice(0, k).map(x => x + w / 2), fs = freqs(r, k);
        const N = sum(fs), T = sum(vs.map((v, i) => v * fs[i])), a = dq(Q(T, N));
        if (a == null || decs(a) > 1) return null;
        const cls = ed.slice(0, k).map((x, i) => `${x}〜${ed[i + 1]}`).join('・');
        return { q: `《階級|かい|きゅう》 ${cls}、《度数|ど|すう》 ${fs.join('・')} の${AVG}`, a,
          easy: `《階級値|かい|きゅう|ち》 ${vs.join('・')} → $(${vs.map((v, i) => v * fs[i]).join('+')})\\div${N}$`, verify: same(a, tableMean(vs, fs)) };
      },
      // 相対度数・単位のある場面（ふりこの時間）
      s3(r) {
        if (r.chance(0.5)) {
          const k = 3, w = r.pick([10, 20]), c = r.int(1, 3) * w, N = r.pick([10, 20]);
          const vs = Array.from({ length: k }, (_, i) => c + i * w), fs = freqs(r, k - 1);
          const last = N - sum(fs);
          if (last < 1) return null;
          fs.push(last);
          const ps = fs.map(f => dq(Q(f, N))), a = dq(Q(sum(vs.map((v, i) => v * fs[i])), N));
          if (a == null || decs(a) > 2) return null;
          return { q: `《階級値|かい|きゅう|ち》 ${vs.join('・')}、《相対度数|そう|たい|ど|すう》 ${ps.join('・')} の${AVG}`, a,
            easy: `$${vs.map((v, i) => `${v}\\times${ps[i]}`).join('+')}$`, verify: same(a, qsum(vs.map((v, i) => qm(Q(v), num(ps[i]))))) };
        }
        const k = 3, st = r.pick([1385, 1395, 1405]);
        const vs = Array.from({ length: k }, (_, i) => st + 10 * i), fs = freqs(r, k);
        const N = sum(fs), a = dq(tableMean(vs, fs, 2));
        if (a == null || decs(a) > 3) return null;
        const V = vs.map(v => fx(v, 2));
        return { q: `《階級値|かい|きゅう|ち》 ${V.join('・')} 《秒|びょう》、《度数|ど|すう》 ${fs.join('・')} の${AVG}は □ 《秒|びょう》`, a,
          easy: `$(${V.map((v, i) => `${v}\\times${fs[i]}`).join('+')})\\div${N}$`, verify: same(a, tableMean(vs, fs, 2)) };
      },
      // わな：同じ表で「最頻値」を聞く（平均ではない。度数がいちばん多い階級の階級値を読むだけ）
      trap(r) {
        const k = r.int(3, 4), w = r.pick([5, 10, 20]), c = r.int(1, 4) * w;
        const vs = Array.from({ length: k }, (_, i) => c + i * w), fs = freqs(r, k), mx = Math.max(...fs);
        if (fs.filter(f => f === mx).length > 1) return null;
        const a = String(vs[fs.indexOf(mx)]);
        return dest({ q: `《階級値|かい|きゅう|ち》 ${vs.join('・')}、《度数|ど|すう》 ${fs.join('・')} の《最頻値|さい|ひん|ち》`, a,
          verify: () => (fs.every((f, i) => f < mx || String(vs[i]) === a) ? true : '最頻値がちがう') },
        '3-76', `${AVG}ではない。《度数|ど|すう》がいちばん《多|おお》い《階級|かい|きゅう》の《階級値|かい|きゅう|ち》`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-77
  const med = a => { const n = a.length, h = n >> 1; return n % 2 ? Q(a[h]) : Q(a[h - 1] + a[h], 2); };
  const halves = a => { const n = a.length, h = n >> 1; return [a.slice(0, h), a.slice(n - h)]; };
  // 検算用：ならべかえを使わずに、k 番め（1から）に小さい数を数えて出す
  const kth = (xs, k) => xs.find(v => xs.filter(x => x < v).length < k && xs.filter(x => x <= v).length >= k);
  const medV = xs => { const n = xs.length; return n % 2 ? Q(kth(xs, (n + 1) / 2)) : Q(kth(xs, n / 2) + kth(xs, n / 2 + 1), 2); };
  const posTxt = h => (h % 2 ? `${(h + 1) / 2}《番|ばん》め` : `${h / 2}・${h / 2 + 1}《番|ばん》め`);
  function dataL(r, n, lo, hi) {
    const xs = Array.from({ length: n }, () => r.int(lo, hi));
    if (new Set(xs).size < n - 1) return null;
    if (xs.every((x, i) => !i || xs[i - 1] <= x)) return null;   // はじめからならんでいるものは出さない
    return xs;
  }
  M.add({
    id: '3-77', part: PART, chap: '3-13', stars: 1,
    title: '《中央値|ちゅう|おう|ち》・《四分位数|し|ぶん|い|すう》は《位置|い|ち》を《先|さき》に',
    mark: 'データの《個数|こ|すう》が**《偶数|ぐう|すう》か《奇数|き|すう》か**。',
    futsu: ['ならべてから、まん《中|なか》を《目|め》でさがす。', '12こだと、6《番|ばん》めか7《番|ばん》めかで', 'まよってしまう。'],
    raku: ['《先|さき》に《位置|い|ち》を《決|き》める。', '12こ → 6《番|ばん》めと7《番|ばん》めの《平均|へい|きん》', '《前|まえ》の6こ → 3・4《番|ばん》め（《第|だい》1《四分位数|し|ぶん|い|すう》）', '11こ → 6《番|ばん》め。《前|まえ》の5こは3《番|ばん》め'],
    why: '《位置|い|ち》は《個数|こ|すう》だけで《決|き》まる。《外|はず》れ《値|ち》は《箱|はこ》から《四分位範囲|し|ぶん|い|はん|い》の1.5《倍|ばい》より《外|そと》（3-13④⑤）。',
    caution: 'かならず《小|ちい》さい《順|じゅん》にならべてから。《奇数|き|すう》こなら、まん《中|なか》をのぞいて《前|まえ》と《後|うし》ろに《分|わ》ける。',
    cols: 1, boxw: '18mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /中央値|四分位|外れ値/.test(q); },
    steps: {
      // 中央値（ならべる前のまん中とはちがうデータ）
      s1(r) {
        const n = r.int(5, 8), xs = dataL(r, n, 10, 40);
        if (!xs) return null;
        const s = sorted(xs), md = med(s), h = n >> 1;
        if (qeq(med(xs), md)) return null;
        const a = dq(md);
        const easy = n % 2 ? `${s.join('、')} の${h + 1}《番|ばん》め` : `${s.join('、')} の${h}・${h + 1}《番|ばん》め $(${s[h - 1]}+${s[h]})\\div2$`;
        return { q: `${xs.join('、')} の《中央値|ちゅう|おう|ち》`, a, easy, key: 'm' + s.join(','), verify: same(a, medV(xs)) };
      },
      // 第1・第3四分位数、四分位範囲
      s2(r) {
        const n = r.int(6, 8), xs = dataL(r, n, 10, 40);
        if (!xs) return null;
        const s = sorted(xs), [A, B] = halves(s), q1 = med(A), q3 = med(B), h = A.length;
        const kind = r.pick(['1', '3', 'iqr']);
        const side = (n % 2 ? 'まん《中|なか》をのぞいた' : '') + (kind === '3' ? '《後|うし》ろ' : '《前|まえ》');
        // 検算：前・後ろの半分を、ならべかえずに数えて作る
        const half = which => { const k = n >> 1; return Array.from({ length: k }, (_, i) => kth(xs, which ? n - k + 1 + i : 1 + i)); };
        if (kind === 'iqr') {
          const a = dq(qs(q3, q1));
          return { q: `${xs.join('、')} の《四分位範囲|し|ぶん|い|はん|い》`, a, easy: `$${dq(q3)}-${dq(q1)}$`, key: 'r' + s.join(','),
            verify: same(a, qs(medV(half(1)), medV(half(0)))) };
        }
        const a = dq(kind === '1' ? q1 : q3);
        return { q: `${xs.join('、')} の《第|だい》${kind}《四分位数|し|ぶん|い|すう》`, a, easy: `${n}こ → ${side}の${h}この${posTxt(h)}`, key: kind + s.join(','),
          verify: same(a, medV(half(kind === '3' ? 1 : 0))) };
      },
      // 外れ値をさがす・場面の中央値
      s3(r) {
        if (r.chance(0.6)) {
          const c = r.int(10, 30), xs = Array.from({ length: 7 }, () => r.int(c, c + 8));
          const up = r.chance(0.6), out = up ? c + 8 + r.int(12, 25) : c - r.int(10, 9 + Math.min(6, c - 4));
          if (out <= 0) return null;
          xs.splice(r.int(0, 7), 0, out);
          const s = sorted(xs), [A, B] = halves(s), q1 = med(A), q3 = med(B), iqr = qs(q3, q1), w = qm(iqr, Q(3, 2));
          const loF = qs(q1, w), hiF = qa(q3, w);
          const outs = xs.filter(x => qs(Q(x), loF)[0] < 0 || qs(Q(x), hiF)[0] > 0);
          if (outs.length !== 1 || outs[0] !== out || !iqr[0]) return null;
          return { q: `${xs.join('、')} の《中|なか》で、《外|はず》れ《値|ち》は □`, a: String(out), key: 'o' + s.join(','),
            easy: `《箱|はこ》は ${dq(q1)}〜${dq(q3)}、$${dq(iqr)}\\times1.5=${dq(w)}$ より《外|そと》`,
            verify: () => {
              // 検算：ならべかえずに数えて、前・後ろの4こ・四分位数・外れ値の境目を作りなおす
              const A2 = [1, 2, 3, 4].map(i => kth(xs, i)), B2 = [5, 6, 7, 8].map(i => kth(xs, i)), Q1 = medV(A2), Q3 = medV(B2), W = qm(qs(Q3, Q1), Q(3, 2));
              const o = xs.filter(x => qs(Q(x), qs(Q1, W))[0] < 0 || qs(Q(x), qa(Q3, W))[0] > 0);
              return o.length === 1 && String(o[0]) === String(out) ? true : '外れ値が1つでない';
            } };
        }
        const n = 6, xs = dataL(r, n, 12, 22);
        if (!xs) return null;
        const s = sorted(xs), a = dq(med(s)), h = n >> 1;
        return { q: `《長|なが》さ ${xs.join('、')} cm の《中央値|ちゅう|おう|ち》は □ cm`, a, key: 'm' + s.join(','),
          easy: `${n}こ → ${h}・${h + 1}《番|ばん》め $(${s[h - 1]}+${s[h]})\\div2$`, verify: same(a, medV(xs)) };
      },
      // わな：範囲・最頻値（ならべて位置を決めなくてよい）
      trap(r) {
        const n = r.int(6, 8);
        if (r.chance(0.5)) {
          const xs = dataL(r, n, 10, 40);
          if (!xs) return null;
          const mx = Math.max(...xs), mn = Math.min(...xs), a = String(mx - mn);
          return dest({ q: `${xs.join('、')} の《範囲|はん|い》`, a, key: 'w' + sorted(xs).join(','), verify: () => (xs.every(x => x >= mn && x <= mx) ? true : '範囲') },
            '3-77', `ならべなくてよい。いちばん《大|おお》きい《数|かず》－いちばん《小|ちい》さい《数|かず》 $${mx}-${mn}$`);
        }
        const m = r.int(12, 30), xs = Array.from({ length: n - 3 }, () => r.int(10, 40));
        if (xs.includes(m) || new Set(xs).size < n - 3) return null;
        [0, 1, 2].forEach(() => xs.splice(r.int(0, xs.length), 0, m));
        return dest({ q: `${xs.join('、')} の《最頻値|さい|ひん|ち》`, a: String(m), key: 'f' + sorted(xs).join(','),
          verify: () => (xs.every(x => x === m || xs.filter(y => y === x).length < 3) ? true : '最頻値') },
        '3-77', '《位置|い|ち》ではなく、いちばん《多|おお》く《出|で》てくる《数|かず》');
      },
    },
  });

  // ---------------------------------------------------------------- 3-78
  M.add({
    id: '3-78', part: PART, chap: '3-14', stars: 1,
    title: '《偏差|へん|さ》の《和|わ》は0（《欠|か》けた《値|あたい》を《出|だ》す）',
    mark: '**《平均|へい|きん》がわかっていて**、1つの《値|あたい》だけがわからない。',
    futsu: ['《合計|ごう|けい》＝《平均|へい|きん》×《個数|こ|すう》で $60\\times5=300$', '4《人|にん》の《合計|ごう|けい》 236 をひいて', '$300-236=64$'],
    raku: ['《偏差|へん|さ》（《値|あたい》－60）だけを《見|み》る。', '$-5+2-2+1=-4$', '《和|わ》は0なので、《残|のこ》りの《偏差|へん|さ》は $+4$', '$60+4=64$'],
    why: '《偏差|へん|さ》の《和|わ》は、いつも0（3-14①）。《小|ちい》さな《数|かず》の《計算|けい|さん》ですむ。',
    caution: '《人数|にん|ずう》がちがう2つの《組|くみ》の《平均|へい|きん》は、たして2でわってはいけない。',
    cols: 1, boxw: '18mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return (/平均/.test(q) && /残り|あと1回|めは □/.test(q)) || /偏差が[^。]*□/.test(q); },
    steps: {
      // n 人の平均と、n-1 人の点
      s1(r) {
        const n = r.int(4, 5), m = r.int(50, 85), dv = Array.from({ length: n - 1 }, () => r.int(-9, 9));
        const S = sum(dv), last = -S;
        if (!last || Math.abs(last) > 12 || m + last > 100 || dv.some(x => m + x > 100)) return null;
        const xs = dv.map(x => m + x), a = String(m + last);
        return { q: `${n}${NIN}の${AVG} ${m} 《点|てん》、${n - 1}${NIN}は ${xs.join('、')}。《残|のこ》りの1${NIN}は □ 《点|てん》`, a,
          easy: `《偏差|へん|さ》の《和|わ》 ${sg(S)} → $${m}${last > 0 ? '+' : '-'}${Math.abs(last)}$`, key: `${m}:${sorted(xs).join(',')}`,
          verify: same(a, qs(Q(m * n), Q(sum(xs)))) };
      },
      // 偏差の列の □・小数のデータ
      s2(r) {
        if (r.chance(0.5)) {
          const n = r.int(5, 6), dv = Array.from({ length: n - 1 }, () => r.intNot(-6, 6, x => !x)), S = sum(dv);
          if (!S || Math.abs(S) > 8) return null;
          const a = sg(-S);
          return { q: `${n}つの《偏差|へん|さ》が ${dv.map(sg).join('、')}、□`, a, easy: `《和|わ》は0 → $-(${terms(dv)})$`, key: 'd' + sorted(dv).join(','),
            verify: () => (qeq(qa(Q(S), num(a)), Q(0)) ? true : '偏差の和が0にならない') };
        }
        const n = 4, m = r.int(60, 95), dv = Array.from({ length: n - 1 }, () => r.int(-4, 4)), last = -sum(dv);
        if (!last || Math.abs(last) > 5 || new Set(dv).size < 2) return null;
        const xs = dv.map(x => fx(m + x, 1)), a = fx(m + last, 1);
        return { q: `のび${n}${KAI}の${AVG} ${fx(m, 1)} cm、3${KAI}は ${xs.join('、')}。${n}${KAI}めは □ cm`, a,
          easy: `《偏差|へん|さ》の《和|わ》 $${fx(-last, 1)}$ → $${fx(m, 1)}${last > 0 ? '+' : '-'}${fx(Math.abs(last), 1)}$`, key: `b${m}:${sorted(dv).join(',')}`,
          verify: same(a, qs(qm(Q(m, 10), Q(n)), qsum(xs.map(num)))) };
      },
      // あと1回で平均を上げる・お茶の量
      s3(r) {
        if (r.chance(0.6)) {
          const k = r.int(3, 5), m1 = r.int(60, 80), d = r.int(1, 5), m2 = m1 + d, x = m2 + d * k;
          if (x > 100) return null;
          const a = String(x);
          return { q: `テスト${k}${KAI}の${AVG} ${m1} 《点|てん》。あと1${KAI}で □ 《点|てん》とれば${AVG} ${m2} 《点|てん》`, a,
            easy: `${k}${KAI}は ${m2} より ${d} ずつ《低|ひく》い → $${m2}+${d}\\times${k}$`,
            verify: same(a, qs(Q(m2 * (k + 1)), Q(m1 * k))) };
        }
        const n = 4, m = r.pick([350, 500]), dv = Array.from({ length: n - 1 }, () => r.int(-4, 4)), last = -sum(dv);
        if (!last || Math.abs(last) > 6 || new Set(dv).size < n - 2) return null;
        const xs = dv.map(x => m + x), a = String(m + last);
        return { q: `お《茶|ちゃ》${HON(n)}の${AVG}が ${m} mL、${HON(n - 1)}は ${xs.join('、')}。《残|のこ》りは □ mL`, a,
          easy: `《偏差|へん|さ》の《和|わ》 ${sg(-last)} → $${m}${last > 0 ? '+' : '-'}${Math.abs(last)}$`, key: `c${m}:${sorted(dv).join(',')}`,
          verify: same(a, qs(Q(m * n), Q(sum(xs)))) };
      },
      // わな：人数のちがう2つの組の平均（偏差の和が0、では出ない。平均×人数をたす）
      trap(r) {
        const A = r.pick([10, 20, 30, 40]), B = r.pick([10, 20, 30, 40]), m1 = r.int(55, 75), m2 = m1 + r.intNot(-12, 12, x => !x);
        if (A === B || (m1 * A + m2 * B) % (A + B)) return null;
        const a = String((m1 * A + m2 * B) / (A + B));
        return dest({ q: `A《組|くみ》${A}${NIN}の${AVG} ${m1} 《点|てん》、B《組|くみ》${B}${NIN}の${AVG} ${m2} 《点|てん》。《全体|ぜん|たい》の${AVG}`, a,
          verify: same(a, qmean([...Array(A).fill(Q(m1)), ...Array(B).fill(Q(m2))])) },
        '3-78', `《人数|にん|ずう》がちがうので $(${m1}+${m2})\\div2$ ではない。$(${m1}\\times${A}+${m2}\\times${B})\\div${A + B}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-79
  // 分散を、定義（偏差の2乗の平均）で計算しなおす
  const varDef = xs => { const L = xs.map(x => (Array.isArray(x) ? x : Q(x))), m = qmean(L); return qmean(L.map(v => { const d = qs(v, m); return qm(d, d); })); };
  const short = (q, k) => { const s = dq(q); return s != null && decs(s) <= k ? s : null; };
  M.add({
    id: '3-79', part: PART, chap: '3-14', stars: 2,
    title: '《分散|ぶん|さん》は「2《乗|じょう》の《平均|へい|きん》－《平均|へい|きん》の2《乗|じょう》」',
    mark: '**《平均|へい|きん》が《整数|せい|すう》でない**・データが《多|おお》い。',
    futsu: ['1、2、4、5、6 の《平均|へい|きん》は 3.6。', '《偏差|へん|さ》 $-2.6$、$-1.6$、… を', '1つずつ2《乗|じょう》するのは《大変|たい|へん》。'],
    raku: ['2《乗|じょう》をそのままたす。', '$1+4+16+25+36=82$', '$82\\div5-3.6^2$', '$=16.4-12.96=3.44$'],
    why: '《偏差|へん|さ》の2《乗|じょう》を《展開|てん|かい》してまとめると、この《形|かたち》になる（3-8・3-14②の《先|さき》）。',
    caution: '《数|かず》が《大|おお》きくて《平均|へい|きん》が《整数|せい|すう》なら、《偏差|へん|さ》の2《乗|じょう》のほうが《楽|らく》。',
    cols: 1, boxw: '20mm', boxh: { s3: '12mm' },
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // 分散を聞いていて、数が小さい・2乗の平均がある
    fits(q) {
      if (!/分散/.test(q) || /共分散|単位|倍|たす|で表す|sigma/.test(q)) return false;
      if (/2乗の平均|サイコロ|までの整数| が \d+こ/.test(q)) return true;
      const L = nums(q);
      return !!L && Math.max(...L) < 20;
    },
    steps: {
      // 平均が整数でない、小さな数のデータ
      s1(r) {
        const n = r.int(4, 5), xs = Array.from({ length: n }, () => r.int(0, 9));
        if (new Set(xs).size < n - 1) return null;
        const S = sum(xs), S2 = sum(xs.map(x => x * x));
        if (S % n === 0) return null;
        const a = short(Q(n * S2 - S * S, n * n), 2);
        if (a == null) return null;
        return { q: `${xs.join('、')} の${BUN}`, a, easy: `$${S2}\\div${n}-${dq(Q(S, n))}^2$`, key: 'v' + sorted(xs).join(','), verify: same(a, varDef(xs)) };
      },
      // 2乗の平均・平均・分散のうち2つから、残りの1つ／6このデータ
      s2(r) {
        const k = r.int(0, 2);
        if (k < 2) {
          const m = r.int(2, 9), v = r.int(1, 9), s = v + m * m;
          if (k === 0) return { q: `${AVG}が ${m}、${BUN}が ${v} のとき、2《乗|じょう》の${AVG}は □`, a: String(s), easy: `$${v}+${m}^2$`, verify: same(String(s), qa(Q(v), Q(m * m))) };
          return { q: `2《乗|じょう》の${AVG}が ${s}、${AVG}が ${m} のとき、${BUN}は □`, a: String(v), easy: `$${s}-${m}^2$`, verify: same(String(v), qs(Q(s), Q(m * m))) };
        }
        const n = 6, xs = Array.from({ length: n }, () => r.int(0, 9));
        const S = sum(xs), S2 = sum(xs.map(x => x * x));
        if (S % n === 0 || new Set(xs).size < 4) return null;
        const a = short(Q(n * S2 - S * S, n * n), 2);
        if (a == null) return null;
        return { q: `${xs.join('、')} の${BUN}`, a, easy: `$${S2}\\div${n}-${dq(Q(S, n))}^2$`, key: 'v' + sorted(xs).join(','), verify: same(a, varDef(xs)) };
      },
      // 1〜n の整数・サイコロの目・同じ値がいくつもあるデータ・身長
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.int(3, 8), xs = Array.from({ length: n }, (_, i) => i + 1), S2 = sum(xs.map(x => x * x));
          const v = varDef(xs), a = short(v, 2) || fr(v);
          const q = n === 6 ? `サイコロ1${KO}の《目|め》 1〜6 の6つの《数|かず》の${BUN}` : `1から${n}までの《整数|せい|すう》 ${n}こ の${BUN}`;
          return { q, a, easy: `$\\frac{${S2}}{${n}}-${dq(Q(n + 1, 2))}^2$`, verify: same(a, v) };
        }
        if (k === 1) {
          const x = r.int(1, 5), y = x + r.int(2, 6), p = r.int(1, 5), c = r.int(1, 5);
          if (p === c) return null;
          const xs = [...Array(p).fill(x), ...Array(c).fill(y)], N = p + c, S = p * x + c * y, S2 = p * x * x + c * y * y;
          const v = varDef(xs), a = short(v, 2) || fr(v);
          return { q: `${x} が ${p}こ、${y} が ${c}こ のデータの${BUN}`, a, easy: `$\\frac{${S2}}{${N}}-\\left(\\frac{${S}}{${N}}\\right)^2$`, verify: same(a, v) };
        }
        const m = r.int(150, 170), v = r.pick([4, 9, 16, 25, 36, 49]), s = m * m + v;
        return { q: `《身長|しん|ちょう》の${AVG} ${m} cm、2《乗|じょう》の${AVG} ${s} の${BUN}`, a: String(v), easy: `$${s}-${m}^2$`, verify: same(String(v), qs(Q(s), Q(m * m))) };
      },
      // わな：数が大きく、平均が整数（498、502 など）。偏差の2乗の平均（定義どおり）のほうが楽
      trap(r) {
        const B = r.pick([100, 250, 500, 1000]), dv = Array.from({ length: 4 }, () => r.int(-3, 3));
        dv.push(-sum(dv));
        if (Math.abs(dv[4]) > 3 || new Set(dv).size < 4) return null;
        const xs = r.shuffle(dv).map(d => B + d), D2 = sum(dv.map(d => d * d)), a = dq(Q(D2, 5));
        return dest({ q: `${xs.join('、')} の${BUN}`, a, key: 'b' + sorted(xs).join(','), verify: same(a, varDef(xs)) },
          '3-79', `${AVG}が ${B} で、《数|かず》が《大|おお》きい。《偏差|へん|さ》の2《乗|じょう》の${AVG} $${D2}\\div5$ が《楽|らく》`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-80
  // 単位の変えかた：平均と σ（10^d 倍の整数）を作る
  const U80 = [
    { u: 'mm', v: 'cm', f: Q(1, 10), gen: r => [r.int(100, 600), 1, r.int(1, 9), 1] },
    { u: 'cm', v: 'mm', f: Q(10), gen: r => [r.int(50, 300), 1, r.int(1, 9), 1] },
    { u: 'mL', v: 'L', f: Q(1, 1000), gen: r => [r.int(20, 100) * 10, 0, r.int(1, 9), 0] },
    { u: 'g', v: 'kg', f: Q(1, 1000), gen: r => [r.int(10, 90) * 10, 0, r.int(2, 9), 0] },
    { u: 'm', v: 'cm', f: Q(100), gen: r => [r.int(120, 200), 2, r.int(2, 9), 2] },
  ];
  // 単位を変えた数：小数のある量は、けたの数をそのまま（20.0 mm → 2.00 cm）、整数の量は短く
  function conv(x, d, f) {
    const v = qm(Q(x, 10 ** d), f);
    if (!d) return dq(v);
    const e = Math.round(Math.log10(f[1] / f[0]));
    return dq(v, Math.max(0, d + e));
  }
  M.add({
    id: '3-80', part: PART, chap: '3-14', stars: 1,
    title: '《単位|たん|い》を《変|か》えたときの《平均|へい|きん》と $\\sigma$',
    mark: '**《全部|ぜん|ぶ》を□《倍|ばい》する**・**《全部|ぜん|ぶ》に□をたす**。',
    futsu: ['《値|あたい》を1つずつ cm に《直|なお》して、', '《平均|へい|きん》と $\\sigma$ を', 'はじめから《計算|けい|さん》しなおす。'],
    raku: ['mm → cm は《全部|ぜん|ぶ》 $\\div10$。', '《平均|へい|きん》 $20.0\\div10=2.00$、$\\sigma$ $0.3\\div10=0.03$', '《全部|ぜん|ぶ》に 5 mm たすと《平均|へい|きん》は 25.0', '$\\sigma$ は 0.3 のまま'],
    why: '□《倍|ばい》すると《偏差|へん|さ》も□《倍|ばい》、たすだけなら《偏差|へん|さ》は《変|か》わらない（3-14④）。',
    caution: '1つだけを《変|か》えたときは、このきまりは《使|つか》えない。《分散|ぶん|さん》は□の2《乗|じょう》《倍|ばい》になる。',
    cols: 1, boxw: '20mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /sigma|分散|平均/.test(q) && /で表|全部|倍して/.test(q) && !/だけ|共分散|相関|正規分布/.test(q); },
    steps: {
      // 単位を変える（何倍か・何分の1か）
      s1(r) {
        const U = r.pick(U80), [m, d, s, sd] = U.gen(r), ask = r.chance(0.5) ? 'm' : 's';
        const M0 = fx(m, d), S0 = fx(s, sd), X = ask === 'm' ? M0 : S0;
        const a = conv(ask === 'm' ? m : s, ask === 'm' ? d : sd, U.f);
        const op = U.f[1] > 1 ? `\\div${U.f[1]}` : `\\times${U.f[0]}`;
        return { q: `${AVG} ${M0} ${U.u}、${SIG} ${S0} ${U.u} を ${U.v} で《表|あらわ》すと、${ask === 'm' ? AVG : SIG}は □ ${U.v}`, a,
          easy: `$${X}${op}$`, verify: same(a, qm(num(X), U.f)) };
      },
      // 全部に同じ数をたす
      s2(r) {
        const U = r.pick(U80.slice(0, 4)), [m, d, s, sd] = U.gen(r), M0 = fx(m, d), S0 = fx(s, sd);
        const b = d ? fx(r.int(1, 9) * 10 ** (d - 1) * r.pick([1, 5]), d - (r.chance(0.5) ? 1 : 0)) : String(r.int(1, 20) * 5);
        const k = r.int(0, 2);
        if (k === 0) {
          const a = dq(qa(num(M0), num(b)), d);
          return { q: `${AVG} ${M0}、${SIG} ${S0} ${U.u}。《全部|ぜん|ぶ》に ${b} ${U.u} たすと${AVG}は □ ${U.u}`, a,
            easy: `$${M0}+${b}$`, verify: same(a, qa(num(M0), num(b))) };
        }
        if (k === 1) {
          return { q: `${AVG} ${M0}、${SIG} ${S0} ${U.u}。《全部|ぜん|ぶ》に ${b} ${U.u} たすと${SIG}は □ ${U.u}`, a: S0,
            easy: '《偏差|へん|さ》は《変|か》わらないので、そのまま', verify: same(S0, num(S0)) };
        }
        const v = r.int(2, 30);
        return { q: `${BUN}が ${v} のデータの《全部|ぜん|ぶ》に ${r.int(3, 50)} をたすと、${BUN}は □`, a: String(v),
          easy: '《偏差|へん|さ》は《変|か》わらないので、そのまま', verify: same(String(v), Q(v)) };
      },
      // 何倍かしてからたす・単位を変えてからたす
      s3(r) {
        const k = r.int(0, 3);
        if (k < 3) {
          const s = r.int(1, 6), c = r.int(2, 5), b = r.int(1, 20), m = r.int(3, 30);
          if (k === 0) { const a = String((c * s) ** 2); return { q: `${SIG}が ${s} のデータを、《全部|ぜん|ぶ》${c}《倍|ばい》して ${b} をたすと、${BUN}は □`, a, easy: `$(${c}\\times${s})^2$`, verify: same(a, qm(Q(c * c), Q(s * s))) }; }
          if (k === 1) { const a = String(c * s); return { q: `${SIG}が ${s} のデータを、《全部|ぜん|ぶ》${c}《倍|ばい》して ${b} をたすと、${SIG}は □`, a, easy: `$${c}\\times${s}$（たしても《変|か》わらない）`, verify: same(a, Q(c * s)) }; }
          const a = String(c * m + b);
          return { q: `${AVG}が ${m} のデータを、《全部|ぜん|ぶ》${c}《倍|ばい》して ${b} をたすと、${AVG}は □`, a, easy: `$${c}\\times${m}+${b}$`, verify: same(a, qa(qm(Q(c), Q(m)), Q(b))) };
        }
        const m = r.int(100, 200), s = r.int(1, 5), b = r.int(2, 9), ask = r.chance(0.6) ? 'm' : 's';
        const a = ask === 'm' ? String(m + b) : String(s);
        return { q: `${ask === 'm' ? `${AVG} ${fx(m, 1)}` : `${SIG} ${fx(s, 1)}`} cm を mm で《表|あらわ》して ${b} mm たすと${ask === 'm' ? AVG : SIG}は □ mm`, a,
          easy: ask === 'm' ? `$${fx(m, 1)}\\times10+${b}$` : `$${fx(s, 1)}\\times10$（たしても《変|か》わらない）`,
          verify: same(a, ask === 'm' ? qa(qm(Q(m, 10), Q(10)), Q(b)) : qm(Q(s, 10), Q(10))) };
      },
      // わな：1つだけに数をたす（全部ではない。平均は b ではなく b÷n ふえる）
      trap(r) {
        const n = r.pick([4, 5, 8, 10]), m = r.int(10, 50), b = r.int(1, 6) * (n === 8 ? 4 : n === 4 ? 2 : 5) * r.pick([1, 2]);
        const a = dq(qa(Q(m), Q(b, n)));
        if (a == null || decs(a) > 1) return null;
        return dest({ q: `${n}つの《値|あたい》の${AVG}が ${m}。1つだけに ${b} をたすと、${AVG}は □`, a,
          verify: same(a, qd(Q(m * n + b), Q(n))) },
        '3-80', `《全部|ぜん|ぶ》ではない。《合計|ごう|けい》が ${b} ふえるので $${b}\\div${n}$ だけふえる`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-81
  const SQ = [4, 9, 16, 25, 36, 49, 64, 100];
  const U81 = ['g', '《秒|びょう》', 'mm', '℃'];
  // ずれ t（有理数）と回数 n から、1回の σ（= t√n）
  M.add({
    id: '3-81', part: PART, chap: '3-14', stars: 1,
    title: '《平均|へい|きん》のずれは $\\frac{\\sigma}{\\sqrt{n}}$',
    mark: '「□《回|かい》はかって**《平均|へい|きん》すると**」、その《平均|へい|きん》のずれ',
    futsu: ['16《回|かい》なら、ずれも16《分|ぶん》の1？', '$0.8\\div16=0.05$', '（これはまちがい）'],
    raku: ['$\\sqrt{n}$ でわる。', '$0.8\\div\\sqrt{16}=0.8\\div4=0.2$', 'ずれを《半分|はん|ぶん》にするには、', '$2^2=4$ 《倍|ばい》の《回数|かい|すう》'],
    why: 'ずれはプラスとマイナスで《打|う》ち《消|け》しあうが、《全部|ぜん|ぶ》は《消|き》えない（3-14⑤）。',
    caution: '1《回|かい》ずつの《値|あたい》のずれは、《回数|かい|すう》をふやしても $\\sigma$ のまま。',
    cols: 1, boxw: '18mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /平均のずれ|回はかって平均/.test(q) && !/1回ずつ/.test(q); },
    steps: {
      s1(r) {
        const n = r.pick(SQ), rt = Math.sqrt(n), t = Q(r.int(1, 9), 10 ** r.int(1, 2)), u = r.pick(U81);
        const s = dq(qm(t, Q(rt))), a = dq(t);
        return { q: `1${KAI}の${SIG}が ${s} ${u}。${n}${KAI}はかった${AVG}のずれは □ ${u}`, a,
          easy: `$${s}\\div\\sqrt{${n}}=${s}\\div${rt}$`, verify: same(a, qd(num(s), Q(Math.round(Math.sqrt(n))))) };
      },
      // 何回はかればよいか・回数を何倍にするか
      s2(r) {
        if (r.chance(0.7)) {
          const n = r.pick(SQ), rt = Math.sqrt(n), t = Q(r.int(1, 9), 10 ** r.int(1, 2)), u = r.pick(U81);
          const s = dq(qm(t, Q(rt))), T = dq(t);
          return { q: `1${KAI}の${SIG}が ${s} ${u}。${AVG}のずれを ${T} ${u} にするには □ ${KAI}`, a: String(n),
            easy: `$${s}\\div${T}=${rt}$ → $${rt}^2$`, verify: same(String(n), qm(qd(num(s), t), qd(num(s), t))) };
        }
        const [w, k] = r.pick([['《半分|はん|ぶん》', 2], ['3《分|ぶん》の1', 3], ['4《分|ぶん》の1', 4], ['5《分|ぶん》の1', 5], ['10《分|ぶん》の1', 10]]);
        return { q: `${AVG}のずれを${w}にするには、はかる《回数|かい|すう》を □ 《倍|ばい》にする`, a: String(k * k),
          easy: `$\\sqrt{n}$ を ${k} 《倍|ばい》 → $${k}^2$`, verify: same(String(k * k), Q(k * k)) };
      },
      // 1回の σ をもどす・回数を変える・手とセンサー
      s3(r) {
        const k = r.int(0, 2), u = r.pick(U81);
        if (k === 0) {
          const n = r.pick(SQ.slice(0, 5)), rt = Math.sqrt(n), t = Q(r.int(1, 9), 10 ** r.int(1, 2)), T = dq(t), a = dq(qm(t, Q(rt)));
          return { q: `${n}${KAI}はかった${AVG}のずれが ${T} ${u} だった。1${KAI}の${SIG}は □ ${u}`, a, easy: `$${T}\\times\\sqrt{${n}}$`, verify: same(a, qm(t, Q(rt))) };
        }
        if (k === 1) {
          const n1 = r.pick([4, 9, 16, 25]), c = r.int(2, 3), n2 = n1 * c * c, t2 = Q(r.int(1, 9), 10 ** r.int(1, 2)), T1 = dq(qm(t2, Q(c))), a = dq(t2);
          return { q: `${n1}${KAI}の${AVG}のずれが ${T1} ${u}。${n2}${KAI}なら □ ${u}`, a,
            easy: `《回数|かい|すう》が${c * c}《倍|ばい》 → $${T1}\\div${c}$`, verify: same(a, qd(qm(num(T1), Q(Math.sqrt(n1))), Q(Math.sqrt(n2)))) };
        }
        const s1 = Q(r.int(1, 3), 10), c = r.pick([2, 4, 5, 10, 20, 25]), S1 = dq(s1), S2 = dq(qd(s1, Q(c)));
        return { q: `${SIG}が ${S1} 《秒|びょう》の《手|て》で □ ${KAI}はかって${AVG}すると、ずれが ${S2} 《秒|びょう》`, a: String(c * c),
          easy: `$${S1}\\div${S2}=${c}$ → $${c}^2$`, verify: same(String(c * c), qm(qd(s1, num(S2)), qd(s1, num(S2)))) };
      },
      // わな：何回はかっても、1回ずつの値のずれ（σ）は変わらない
      trap(r) {
        const n = r.pick(SQ), t = Q(r.int(1, 9), 10 ** r.int(1, 2)), u = r.pick(U81), s = dq(qm(t, Q(Math.sqrt(n))));
        return dest({ q: `1${KAI}の${SIG}が ${s} ${u}。${n}${KAI}はかったときの1${KAI}ずつのずれは □ ${u}`, a: s, verify: same(s, num(s)) },
          '3-81', `${AVG}ではなく1${KAI}ずつの《値|あたい》。ずれは ${SIG} のまま`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-82
  const SC82 = [
    { w: '《身長|しん|ちょう》', u: 'cm', who: NIN, gen: r => [r.int(150, 170), 0, r.int(5, 8), 0] },
    { w: '《部品|ぶ|ひん》の《重|おも》さ', u: 'g', who: KO, gen: r => [r.int(100, 300), 0, r.int(2, 4), 0] },
    { w: 'テストの《点|てん》', u: '《点|てん》', who: NIN, gen: r => [r.int(5, 7) * 10, 0, r.int(8, 12), 0] },
  ];
  function seiki(r) {
    const sc = r.pick(SC82), [m, d, s] = sc.gen(r);
    const at = k => fx(m + k * s, d);
    return { sc, M0: fx(m, d), S0: fx(s, d), at, head: `${AVG} ${fx(m, d)}、${SIG} ${fx(s, d)} ${sc.u} の《正規分布|せい|き|ぶん|ぷ》` };
  }
  M.add({
    id: '3-82', part: PART, chap: '3-14', stars: 1,
    title: '《平均|へい|きん》$\\pm\\sigma$ に68%、$\\pm2\\sigma$ に95%',
    mark: '**《正規分布|せい|き|ぶん|ぷ》**（つりがね《形|がた》）で「□から□までは《何人|なん|にん》」',
    futsu: ['500《人|にん》の《身長|しん|ちょう》を1つずつ《見|み》て、', '145〜159 cm の《人|ひと》を《数|かぞ》える。'],
    raku: ['145〜159 は $152\\pm7$（$\\pm\\sigma$）', '$500\\times0.68=340$ 《人|にん》', '$\\pm2\\sigma$ なら $500\\times0.95$'],
    why: 'つりがね《形|がた》のちらばりでは、いつもこの《割合|わり|あい》になる（3-14③・3-17⑤）。',
    caution: 'データがあれば《数|かぞ》える。《平均|へい|きん》$+\\sigma$ より《上|うえ》は、《外|そと》の32%の《半分|はん|ぶん》。',
    cols: 1, boxw: '18mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /正規分布|つりがね/.test(q); },
    steps: {
      // ±σ・±2σ の中の数
      s1(r) {
        const g = seiki(r), N = r.pick([200, 300, 400, 500, 600, 800, 1000, 2000]), k = r.int(1, 2);
        const p = k === 1 ? Q(68, 100) : Q(95, 100), a = dq(qm(Q(N), p));
        return { q: `${g.head}、${N}${g.sc.who}で ${g.at(-k)}〜${g.at(k)} は《約|やく》 □ ${g.sc.who}`, a,
          easy: `$${N}\\times${k === 1 ? '0.68' : '0.95'}$`, verify: same(a, qm(Q(N), p)) };
      },
      // 片側・半分
      s2(r) {
        const g = seiki(r), N = r.pick([200, 400, 600, 800, 1000, 2000]), u = g.sc.u;
        const [rng, p, ez] = r.pick([
          [`${g.at(1)} 《以上|い|じょう》`, Q(16, 100), '(1-0.68)\\div2'],
          [`${g.at(-1)} 《以下|い|か》`, Q(16, 100), '(1-0.68)\\div2'],
          [`${g.M0}〜${g.at(1)}`, Q(34, 100), '0.68\\div2'],
          [`${g.at(2)} 《以上|い|じょう》`, Q(25, 1000), '(1-0.95)\\div2'],
          [`${g.at(-2)}〜${g.M0}`, Q(475, 1000), '0.95\\div2'],
        ]);
        const a = dq(qm(Q(N), p));
        return { q: `${g.head}、${N}${g.sc.who}で ${rng} は《約|やく》 □ ${g.sc.who}`, a,
          easy: `$${N}\\times${ez}$`, verify: same(a, qm(Q(N), p)) };
      },
      // 全体の何%か・95% の範囲
      s3(r) {
        const g = seiki(r), u = g.sc.u;
        if (r.chance(0.3)) {
          const k = r.int(1, 2), lo = g.at(-k), hi = g.at(k);
          return { q: `${g.head}で、まん《中|なか》の ${k === 1 ? 68 : 95}% が《入|はい》る《範囲|はん|い》（${u}）`, a: `${lo}〜${hi}`,
            easy: `$${g.M0}\\pm${k === 1 ? '' : '2\\times'}${g.S0}$`,
            verify: () => (qeq(qs(num(hi), num(g.M0)), qm(Q(k), num(g.S0))) && qeq(qs(num(g.M0), num(lo)), qm(Q(k), num(g.S0))) ? true : '範囲') };
        }
        const [lo, hi, p, ez] = r.pick([
          [-1, 2, '81.5', '34+47.5'], [-2, 1, '81.5', '47.5+34'], [0, 2, '47.5', '95\\div2'], [1, 2, '13.5', '47.5-34'],
          [-2, -1, '13.5', '47.5-34'], [-1, 9, '84', '50+34'], [-9, 2, '97.5', '50+47.5'],
        ]);
        const rng = hi === 9 ? `${g.at(lo)} 《以上|い|じょう》` : lo === -9 ? `${g.at(hi)} 《以下|い|か》` : `${g.at(lo)}〜${g.at(hi)}`;
        // 検算：片側の割合（0〜σ は 34、σ〜2σ は 13.5、2σ より外は 2.5）を足しなおす
        const band = [2.5, 13.5, 34, 34, 13.5, 2.5], idx = x => (x === -9 ? 0 : x === 9 ? 6 : x + 3);
        const want = band.slice(idx(lo), idx(hi)).reduce((a, b) => a + b, 0);
        return { q: `${g.head}で、${rng} は《全体|ぜん|たい》の《約|やく》 □ %`, a: p,
          easy: `$${ez}$`, verify: () => (Math.abs(want - Number(p)) < 1e-9 ? true : `割合 ${want} と ${p}`) };
      },
      // わな：データが手もとにある（つりがね形かわからない）。68% を使わずに数える
      trap(r) {
        const s = r.int(2, 3), n = 6, m = r.int(15, 40);
        let dv = null;
        for (let t = 0; t < 400 && !dv; t++) {
          const L = Array.from({ length: n - 1 }, () => r.int(-2 * s, 2 * s));
          L.push(-sum(L));
          if (Math.abs(L[n - 1]) <= 2 * s && sum(L.map(d => d * d)) === n * s * s) dv = L;
        }
        if (!dv) return null;
        const xs = dv.map(d => m + d), c = dv.filter(d => Math.abs(d) <= s).length;
        return dest({ q: `${xs.join('、')}（${AVG} ${m}、${SIG} ${s}）のうち、${AVG}$\\pm\\sigma$ に《入|はい》るのは □ こ`, a: String(c), key: 't' + sorted(xs).join(','),
          verify: () => (qeq(qmean(xs.map(x => Q(x))), Q(m)) && qeq(varDef(xs), Q(s * s)) ? true : '平均か σ がデータと合わない') },
        '3-82', `データがあるので、68% を《使|つか》わずに ${m - s}〜${m + s} を《数|かぞ》える`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-83
  const covOf = (xs, ys) => { const mx = qmean(xs.map(x => Q(x))), my = qmean(ys.map(y => Q(y))); return qmean(xs.map((x, i) => qm(qs(Q(x), mx), qs(Q(ys[i]), my)))); };
  M.add({
    id: '3-83', part: PART, chap: '3-15', stars: 1,
    title: '《共分散|きょう|ぶん|さん》は《偏差|へん|さ》の《積|せき》の《平均|へい|きん》（$r$ は《単位|たん|い》で《変|か》わらない）',
    mark: '2つの《量|りょう》の《組|くみ》 $(x,\\ y)$ が、いっしょにどう《変|か》わるか',
    futsu: ['《散布図|さん|ぷ|ず》の4つの《区画|く|かく》の《点|てん》を《数|かぞ》える。', 'はなれた《点|てん》も、すぐそばの《点|てん》も', '《同|おな》じ1こになってしまう。'],
    raku: ['《平均|へい|きん》の《点|てん》からの《偏差|へん|さ》をかけてたす。', '$(-2)\\times(+5)+\\cdots=-13$', '$-13\\div5=-2.6$', '$x$ を10《倍|ばい》 → 《共分散|きょう|ぶん|さん》も10《倍|ばい》、$r$ は《同|おな》じ'],
    why: '《偏差|へん|さ》の《積|せき》の《符号|ふ|ごう》で《区画|く|かく》がわかる。$r$ は《分子|ぶん|し》と《分母|ぶん|ぼ》が《同|おな》じ《倍|ばい》になる（3-15③④）。',
    caution: '$y$ を $-y$ にすると、《向|む》きが《逆|ぎゃく》になって $r$ の《符号|ふ|ごう》が《変|か》わる。',
    cols: 1, boxw: '20mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return !/最小二乗法|直線|-y|符号/.test(q) && (/共分散/.test(q) || (/相関係数/.test(q) && /倍|sigma|から.*にする/.test(q))); },
    steps: {
      // 4〜5組のデータの共分散（平均は整数）
      s1(r) {
        const n = r.int(4, 5), xs = sorted(r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n)), ys = Array.from({ length: n }, () => r.int(1, 9));
        const fix = (sum(ys) % n);
        ys[n - 1] += ys[n - 1] - fix >= 1 ? -fix : n - fix;
        if (sum(xs) % n || ys[n - 1] > 9) return null;
        const mx = sum(xs) / n, my = sum(ys) / n, P = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
        if (!P) return null;
        const a = nm(dq(Q(P, n)));
        return { q: `${xs.map((x, i) => pt(x, ys[i])).join('、')} の${KYO}`, a, easyCheck: false,
          easy: `《平均|へい|きん》の《点|てん》 ${pt(mx, my)}、《偏差|へん|さ》の《積|せき》の《和|わ》 ${nm(P)} → $${P}\\div${n}$`,
          key: xs.map((x, i) => x + ':' + ys[i]).join(','), verify: same(a, covOf(xs, ys)) };
      },
      // 単位を変えたとき（共分散は何倍、r は同じ）
      s2(r) {
        const c = Q(r.intNot(-30, 30, x => !x), 10), C = nm(dq(c)), rr = nm(dq(Q(r.intNot(-9, 9, x => !x), 10)));
        const [uw, k] = r.pick([['$x$ を cm から mm にする', 10], ['$x$ を m から cm にする', 100], ['$x$ を kg から g にする', 1000], ['$x$ を《時間|じ|かん》から《分|ふん》にする', 60], ['$x$ を《全部|ぜん|ぶ》3《倍|ばい》にする', 3]]);
        const t = r.int(0, 2);
        if (t === 0) { const a = nm(dq(qm(c, Q(k)))); return { q: `${KYO} ${C}。${uw}と${KYO}は □`, a, easyCheck: false, easy: `$${dq(c)}\\times${k}$`, verify: same(a, qm(c, Q(k))) }; }
        if (t === 1) return { q: `${SOU} ${rr}。${uw}と${SOU}は □`, a: rr, easyCheck: false, easy: `《分子|ぶん|し》も《分母|ぶん|ぼ》も ${k} 《倍|ばい》なので《変|か》わらない`, verify: same(rr, num(rr)) };
        const b = r.int(2, 20);
        return { q: `${KYO} ${C}。$x$ の《全部|ぜん|ぶ》に ${b} をたすと${KYO}は □`, a: C, easyCheck: false, easy: '《偏差|へん|さ》は《変|か》わらないので、そのまま', verify: same(C, c) };
      },
      // 相関係数 r＝共分散÷(σx×σy)・偏差の積の和から
      s3(r) {
        if (r.chance(0.6)) {
          const sx = r.int(1, 5), sy = r.int(1, 10), rv = Q(r.pick([2, 4, 5, 6, 8, 9, -2, -4, -5, -6, -8]), 10), c = qm(rv, Q(sx * sy));
          const C = dq(c), a = nm(dq(rv));
          if (C == null || decs(C) > 2 || sx === sy) return null;
          return { q: `${KYO} ${nm(C)}、$\\sigma_x=${sx}$、$\\sigma_y=${sy}$ のとき、${SOU} $r$ は □`, a, easyCheck: false,
            easy: `$${C}\\div(${sx}\\times${sy})$`, verify: same(a, qd(c, Q(sx * sy))) };
        }
        const n = r.int(4, 10), P = r.intNot(-40, 40, x => !x), a = dq(Q(P, n));
        if (a == null || decs(a) > 2) return null;
        return { q: `${n}${NIN}の《偏差|へん|さ》の《積|せき》の《和|わ》が ${nm(P)} のとき、${KYO}は □`, a: nm(a), easyCheck: false, easy: `$${P}\\div${n}$`, verify: same(nm(a), Q(P, n)) };
      },
      // わな：y の符号を変える（-1 倍）。単位を変えるのとちがい、r の符号が変わる
      trap(r) {
        const rv = dq(Q(r.intNot(-9, 9, x => !x), 10)), a = nm(dq(qm(num(rv), Q(-1))));
        return dest({ q: `$x$ と $y$ の${SOU}が ${nm(rv)} のとき、$x$ と $-y$ の${SOU}は □`, a, easyCheck: false,
          verify: same(a, qm(num(rv), Q(-1))) },
        '3-83', `《単位|たん|い》を《変|か》えるのとはちがう。《向|む》きが《逆|ぎゃく》になり、《符号|ふ|ごう》が《変|か》わる`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-84
  // x・(ずれ) の和が 0 になるずれ（x＝1、2、3）
  const E84 = [[1, 1, -1], [-1, -1, 1], [2, -1, 0], [-2, 1, 0], [1, -2, 1], [-1, 2, -1], [3, 0, -1], [-3, 0, 1], [0, 3, -2], [0, -3, 2], [1, 4, -3], [-1, -4, 3]];
  const slope0 = (xs, ys) => qd(qsum(xs.map((x, i) => qm(x, ys[i]))), qsum(xs.map(x => qm(x, x))));   // (xy の和)÷(x² の和)
  M.add({
    id: '3-84', part: PART, chap: '3-16', stars: 1,
    title: '《原点|げん|てん》を《通|とお》る《直線|ちょく|せん》は（$xy$ の《和|わ》）÷（$x^2$ の《和|わ》）',
    mark: '「**《原点|げん|てん》を《通|とお》る**《直線|ちょく|せん》 $y=ax$ を《最小二乗法|さい|しょう|に|じょう|ほう》で」',
    futsu: ['ずれの2《乗|じょう》の《和|わ》 $S$ を $a$ の《式|しき》にして、', '《平方完成|へい|ほう|かん|せい》する。'],
    raku: ['$xy$ と $x^2$ の《和|わ》だけ《出|だ》す。', `${pt(1, 5)}、${pt(2, 9)}、${pt(3, 11)}`, '$xy$ の《和|わ》56、$x^2$ の《和|わ》14', '$a=56\\div14=4$'],
    why: '《平方完成|へい|ほう|かん|せい》すると、いつも $a=$（$xy$ の《和|わ》）÷（$x^2$ の《和|わ》）になる（3-16②）。',
    caution: '$y=ax+b$（《原点|げん|てん》を《通|とお》らない）のときは、このわり《算|ざん》ではない（わざ 3-85）。',
    cols: 1, boxw: '18mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /最小二乗法/.test(q) && /y=ax\$/.test(q); },
    steps: {
      s1(r) {
        const a = r.int(2, 6), e = r.pick(E84), xs = [1, 2, 3], ys = xs.map((x, i) => a * x + e[i]);
        if (ys.some(y => y <= 0)) return null;
        const Sxy = sum(xs.map((x, i) => x * ys[i]));
        return { q: `${xs.map((x, i) => pt(x, ys[i])).join('、')} に $y=ax$（${LSQ}）。$a=□$`, a: String(a),
          easy: `$${Sxy}\\div14$`, verify: same(String(a), slope0(xs.map(x => Q(x)), ys.map(y => Q(y)))) };
      },
      // 小数のデータ（x＝1〜4）・x＝2、4、6
      s2(r) {
        if (r.chance(0.6)) {
          const A = r.int(10, 40), e = r.pick(E84), xs = [1, 2, 3], ys = xs.map((x, i) => fx(A * x + e[i], 1)), a = fx(A, 1);
          const Sxy = dq(qsum(xs.map((x, i) => qm(Q(x), num(ys[i])))));
          return { q: `${xs.map((x, i) => pt(x, ys[i])).join('、')} に $y=ax$（${LSQ}）。$a=□$`, a,
            easy: `$${Sxy}\\div14$`, verify: same(a, slope0(xs.map(x => Q(x)), ys.map(num))) };
        }
        const a = r.int(2, 9), e = r.pick(E84), xs = [2, 4, 6], ys = xs.map((x, i) => a * x + e[i]);
        if (ys.some(y => y <= 0)) return null;
        return { q: `${xs.map((x, i) => pt(x, ys[i])).join('、')} に $y=ax$（${LSQ}）。$a=□$`, a: String(a),
          easy: `$${sum(xs.map((x, i) => x * ys[i]))}\\div56$`, verify: same(String(a), slope0(xs.map(x => Q(x)), ys.map(y => Q(y)))) };
      },
      // 和だけが与えられている・ばねののび
      s3(r) {
        if (r.chance(0.5)) {
          const Sxx = r.pick([14, 30, 55, 91]), a = Q(r.int(5, 60), 10), Sxy = dq(qm(Q(Sxx), a)), A = dq(a);
          return { q: `$x^2$ の《和|わ》 ${Sxx}、$xy$ の《和|わ》 ${Sxy} で $y=ax$（${LSQ}）。$a=□$`, a: A,
            easy: `$${Sxy}\\div${Sxx}$`, verify: same(A, qd(num(Sxy), Q(Sxx))) };
        }
        const A = r.int(10, 30), e = r.pick(E84), xs = [1, 2, 3], ys = xs.map((x, i) => fx(A * x + e[i], 1)), a = fx(A, 1);
        return { q: `1、2、3 N でのび ${ys.join('、')} cm。$y=ax$（${LSQ}）の $a=□$`, a,
          easy: `$${dq(qsum(xs.map((x, i) => qm(Q(x), num(ys[i])))))}\\div14$`, verify: same(a, slope0(xs.map(x => Q(x)), ys.map(num))) };
      },
      // わな：原点を通らない y=ax+b（平均の点を通る直線。わざ 3-85）
      trap(r) {
        const a = r.int(1, 4), b = r.int(2, 6), c = r.pick([1, -1]), xs = [1, 2, 3], e = [c, -2 * c, c], ys = xs.map((x, i) => a * x + b + e[i]);
        // 検算：偏差の積の和 ÷ x の偏差の2乗の和
        const want = qd(qsum(xs.map((x, i) => qm(Q(x - 2), qs(Q(ys[i]), qmean(ys.map(y => Q(y))))))), Q(2));
        return dest({ q: `${xs.map((x, i) => pt(x, ys[i])).join('、')} に $y=ax+b$（${LSQ}）。$a=□$`, a: String(a),
          verify: same(String(a), want) },
        '3-84', `${GEN}とは《決|き》めていないので、（$xy$ の《和|わ》）÷（$x^2$ の《和|わ》）ではない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-85
  // 直線の式 ax+b の TeX（a、b は有理数。y= はつけない）
  function lineTeX(a, b) {
    let s = a[0] === 0 ? '' : (a[0] === a[1] ? '' : a[0] === -a[1] ? '-' : dq(a)) + 'x';
    if (b[0] !== 0 || !s) s += (b[0] > 0 && s ? '+' : '') + dq(b);
    return s;
  }
  // 答えの式 ax+b を、x＝0、1 で計算して a、b にもどして確かめる
  const lineOK = (ans, a, b) => () => {
    const t = String(ans).replace(/\$/g, ''), v0 = M.evalMath(t, { x: 0 }), v1 = M.evalMath(t, { x: 1 });
    const A = a[0] / a[1], B = b[0] / b[1];
    return v0 != null && v1 != null && Math.abs(v0 - B) < 1e-9 && Math.abs(v1 - v0 - A) < 1e-9 ? true : `直線 ${ans} が a=${A}、b=${B} と合わない`;
  };
  M.add({
    id: '3-85', part: PART, chap: '3-16', stars: 1,
    title: '$y=ax+b$ は《共分散|きょう|ぶん|さん》÷《分散|ぶん|さん》、《直線|ちょく|せん》は《平均|へい|きん》の《点|てん》を《通|とお》る',
    mark: `「${LSQ}で $y=ax+b$」：**《原点|げん|てん》を《通|とお》るとは《決|き》めていない**`,
    futsu: ['$a$ と $b$ の2つの《文字|も|じ》で $S$ を《作|つく》り、', '《平方完成|へい|ほう|かん|せい》を2《回|かい》する。'],
    raku: ['$a=$ 《共分散|きょう|ぶん|さん》÷$x$ の《分散|ぶん|さん》 $=2\\div2=1$', `《平均|へい|きん》の《点|てん》 ${pt(3, 4)} を《通|とお》る`, '$b=4-1\\times3=1$ → $y=x+1$'],
    why: 'いちばんよい $b$ は「$y-ax$ の《平均|へい|きん》」なので、《直線|ちょく|せん》は《平均|へい|きん》の《点|てん》を《通|とお》る（3-16③）。',
    caution: '《原点|げん|てん》を《通|とお》ると《決|き》めたときは、《平均|へい|きん》の《点|てん》は《通|とお》らない（わざ 3-84）。',
    cols: 1, boxw: { s1: '26mm', s2: '26mm', s3: '18mm', trap: '18mm' },
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return !/原点を通る/.test(q) && (/y=ax\+b|回帰直線/.test(q) || (/最小二乗法/.test(q) && /平均/.test(q))); },
    steps: {
      // 平均・共分散・分散から直線の式
      s1(r) {
        const m = r.int(2, 6), a = Q(r.pick([1, 2, 3, -1, -2, 1, 2]) * (r.chance(0.2) ? 1 : 2), 2), b = Q(r.int(-5, 12));
        const vx = Q(r.pick([2, 4, 5, 8, 10]), r.pick([1, 1, 2])), cv = qm(a, vx), ym = qa(qm(a, Q(m)), b);
        const C = dq(cv), V = dq(vx), Y = dq(ym);
        if (C == null || V == null || Y == null || decs(C) > 1 || decs(Y) > 0) return null;
        const ans = `$${lineTeX(a, b)}$`;
        return { q: `${KYO} ${nm(C)}、$x$ の${BUN} ${V}、${AVG} ${pt(m, Y)} の《回帰直線|かい|き|ちょく|せん》 $y=□$`, a: ans, easyCheck: false,
          easy: `$a=${C}\\div${V}=${dq(a)}$、$b=${Y}-${a[0] < 0 ? `(${dq(a)})` : dq(a)}\\times${m}=${dq(b)}$`,
          verify: lineOK(ans, qd(cv, vx), qs(ym, qm(qd(cv, vx), Q(m)))) };
      },
      // データ（x＝1〜5）から
      s2(r) {
        const a = r.pick([2, 3, 4, -1, -2]), b = r.int(2, 14), e = [r.int(-1, 1), r.int(-1, 1), r.int(-1, 1)];
        const A = -(e[0] + e[1] + e[2]), B = 2 * e[0] + e[1], e5 = B - A, e4 = A - e5;
        if (Math.abs(e4) > 2 || Math.abs(e5) > 2 || [...e, e4, e5].every(x => !x)) return null;
        e.push(e4, e5);
        const xs = [1, 2, 3, 4, 5], ys = xs.map((x, i) => String(a * x + b + e[i]));
        if (ys.some(y => +y <= 0)) return null;
        const ans = `$${lineTeX(Q(a), Q(b))}$`;
        // 検算：偏差から傾き、平均の点から切片
        const X = xs.map(x => Q(x)), Y = ys.map(num), mx = qmean(X), my = qmean(Y);
        const sl = qd(qsum(X.map((x, i) => qm(qs(x, mx), qs(Y[i], my)))), qsum(X.map(x => qm(qs(x, mx), qs(x, mx)))));
        return { q: `$y$ が ${ys.join('、')}（$x=1$〜5）の《回帰直線|かい|き|ちょく|せん》 $y=□$`, a: ans, easyCheck: false,
          easy: `《平均|へい|きん》の《点|てん》 ${pt(3, dq(my))}、$a=${2 * a}\\div2$`, verify: lineOK(ans, sl, qs(my, qm(sl, mx))) };
      },
      // 平均の点を通ることだけを使う
      s3(r) {
        const a = r.pick([1, 2, 3, 4, -1, -2]), b = r.int(-4, 12), m = r.int(2, 8), ym = a * m + b, aT = lineTeX(Q(a), Q(0));
        if (r.chance(0.5)) {
          return { q: `《回帰直線|かい|き|ちょく|せん》 $y=${aT}+b$ が《平均|へい|きん》の《点|てん》 ${pt(m, ym)} を《通|とお》る。$b=□$`, a: nm(b), easyCheck: false,
            easy: `$${ym}-${a < 0 ? `(${a})` : a}\\times${m}$`, verify: same(nm(b), Q(ym - a * m)) };
        }
        return { q: `《回帰直線|かい|き|ちょく|せん》が $y=${lineTeX(Q(a), Q(b))}$、$y$ の${AVG}が ${nm(ym)} のとき、$x$ の${AVG}は □`, a: String(m), easyCheck: false,
          easy: `$${ym}=${lineTeX(Q(a), Q(b)).replace('x', `\\times x`)}$ を《解|と》く`, verify: same(String(m), qd(Q(ym - b), Q(a))) };
      },
      // わな：原点を通る直線 y=ax（平均の点は通らない。わざ 3-84）
      trap(r) {
        const a = r.int(2, 6), e = r.pick(E84), xs = [1, 2, 3], ys = xs.map((x, i) => a * x + e[i]);
        if (ys.some(y => y <= 0)) return null;
        return dest({ q: `${xs.map((x, i) => pt(x, ys[i])).join('、')} に $y=ax$（${LSQ}）。$a=□$`, a: String(a),
          verify: same(String(a), slope0(xs.map(x => Q(x)), ys.map(y => Q(y)))) },
        '3-85', `$y=ax$ は${GEN}と《決|き》めた《直線|ちょく|せん》。《平均|へい|きん》の《点|てん》は《通|とお》らない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-86
  // 2個のサイコロ：36 通りを全部数えて確率（検算用）
  const dice2 = f => { let c = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (f(i, j)) c++; return Q(c, 36); };
  const ways = s => 6 - Math.abs(s - 7);
  M.add({
    id: '3-86', part: PART, chap: '3-17', stars: 1,
    title: '2《個|こ》のサイコロの《和|わ》は《表|ひょう》のななめ',
    mark: '**2《個|こ》のサイコロ**（《大小|だい|しょう》）の《目|め》の《和|わ》',
    futsu: ['《和|わ》が9になる《組|くみ》を', `${pt(3, 6)}、${pt(4, 5)}、${pt(5, 4)}、… と`, '1つずつ《書|か》き《出|だ》す。'],
    raku: ['36《通|とお》りの《表|ひょう》で、《和|わ》は《同|おな》じななめ', '《和|わ》が7のななめは6《通|とお》り', '9は7から2はなれる → $6-2=4$', '$\\frac{4}{36}=\\frac{1}{9}$'],
    why: '《和|わ》が7からはなれるごとに、ななめは1つずつ《短|みじか》くなる（3-17②の《表|ひょう》）。',
    caution: '3《個|こ》のサイコロは、36《通|とお》りの《表|ひょう》にならない。',
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 }, boxw: '15mm', boxh: '12mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /サイコロ/.test(q) && /2個/.test(q) && /和|差/.test(q) && !/3個|とも|少なくとも/.test(q); },
    steps: {
      s1(r) {
        const s = r.int(2, 12), c = ways(s), a = fr(Q(c, 36));
        const how = s === 7 ? 'まん《中|なか》のななめ' : `7から${Math.abs(s - 7)}はなれる`;
        const fz = Q(c, 36)[1] === 36 ? '' : `=${a.slice(1, -1)}`;
        return { q: `${DICE2}の《和|わ》が ${s} の${PROB}`, a, easy: `${how} → ${c}《通|とお》り → $\\frac{${c}}{36}${fz}$`,
          verify: same(a, dice2((i, j) => i + j === s)) };
      },
      // 以上・以下・2つの和
      s2(r) {
        const k = r.int(0, 2);
        let L, w;
        if (k === 0) { const t = r.int(9, 11); L = Array.from({ length: 13 - t }, (_, i) => t + i); w = `${t} 《以上|い|じょう》`; }
        else if (k === 1) { const t = r.int(3, 5); L = Array.from({ length: t - 1 }, (_, i) => 2 + i); w = `${t} 《以下|い|か》`; }
        else { const s1 = r.int(2, 6), s2 = 14 - s1 + r.intNot(-2, 2, x => 14 - s1 + x === s1 || 14 - s1 + x > 12); L = [s1, s2]; w = `${s1} か ${s2}`; }
        const c = L.map(ways), a = fr(Q(sum(c), 36));
        return { q: `${DICE2}の《和|わ》が ${w} の${PROB}`, a, easy: `$\\frac{${c.join('+')}}{36}=${a.slice(1, -1)}$`,
          verify: same(a, dice2((i, j) => L.includes(i + j))) };
      },
      // 場合の数・差・3の倍数
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const s = r.intNot(3, 11, x => x === 7), c = ways(s);
          return { q: `${DICE2}の《和|わ》が ${s} になるのは、36《通|とお》りのうち □ 《通|とお》り`, a: String(c), easy: `7から${Math.abs(s - 7)}はなれる → $6-${Math.abs(s - 7)}$`,
            verify: same(String(c), qm(dice2((i, j) => i + j === s), Q(36))) };
        }
        if (k === 1) {
          const d = r.int(0, 4), c = d ? 2 * (6 - d) : 6, a = fr(Q(c, 36));
          return { q: `${DICE2}をふって、《目|め》の《差|さ》が ${d} になる${PROB}`, a, easy: d ? `《向|む》きのちがうななめ2《本|ほん》 $\\frac{${6 - d}+${6 - d}}{36}=${a.slice(1, -1)}$` : `《同|おな》じ《目|め》のななめ $\\frac{6}{36}=${a.slice(1, -1)}$`,
            verify: same(a, dice2((i, j) => Math.abs(i - j) === d)) };
        }
        const m = r.pick([3, 4, 5]), L = [];
        for (let s = 2; s <= 12; s++) if (s % m === 0) L.push(s);
        const c = L.map(ways), a = fr(Q(sum(c), 36));
        return { q: `${DICE2}をふって、《目|め》の《和|わ》が ${m} の《倍数|ばい|すう》になる${PROB}`, a, easy: `《和|わ》 ${L.join('・')} → $\\frac{${c.join('+')}}{36}=${a.slice(1, -1)}$`,
          verify: same(a, dice2((i, j) => (i + j) % m === 0)) };
      },
      // わな：3個のサイコロ（36 通りの表のななめにならない。216 通り）
      trap(r) {
        const s = r.pick([3, 4, 5, 6, 15, 16, 17, 18]);
        let c = 0;
        for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) for (let k = 1; k <= 6; k++) if (i + j + k === s) c++;
        const a = fr(Q(c, 216));
        return dest({ q: `サイコロ3${KO}の《和|わ》が ${s} の${PROB}`, a, verify: same(a, Q([0, 0, 0, 1, 3, 6, 10][Math.min(s, 21 - s)], 216)) },
          '3-86', `3${KO}は36《通|とお》りの《表|ひょう》にならない。216《通|とお》りのうち ${c}《通|とお》り $\\frac{${c}}{216}=${a.slice(1, -1)}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-87
  // コイン n 枚：2^n 通りを全部数えて確率（f は表の枚数を受けとる）
  const coins = (n, f) => { let c = 0; for (let b = 0; b < 2 ** n; b++) { let k = 0; for (let i = 0; i < n; i++) if (b >> i & 1) k++; if (f(k, b)) c++; } return Q(c, 2 ** n); };
  // サイコロを n 回：6^n 通り（f は目の列）
  const diceN = (n, f) => { let c = 0; const T = 6 ** n; for (let b = 0; b < T; b++) { const L = []; let x = b; for (let i = 0; i < n; i++) { L.push(x % 6 + 1); x = Math.floor(x / 6); } if (f(L)) c++; } return Q(c, T); };
  const DEV = [['1 の《目|め》', 1, x => x === 1], ['6 の《目|め》', 1, x => x === 6], ['《偶数|ぐう|すう》', 3, x => x % 2 === 0], ['《奇数|き|すう》', 3, x => x % 2 === 1], ['3 の《倍数|ばい|すう》', 2, x => x % 3 === 0], ['5 《以上|い|じょう》', 2, x => x >= 5], ['4 《以上|い|じょう》', 3, x => x >= 4], ['2 《以下|い|か》', 2, x => x <= 2]];
  M.add({
    id: '3-87', part: PART, chap: '3-17', stars: 1,
    title: '「《少|すく》なくとも1つ」は《全部|ぜん|ぶ》からひく',
    mark: '「**《少|すく》なくとも**」「1《枚|まい》《以上|い|じょう》」',
    futsu: ['《裏|うら》が1《枚|まい》、2《枚|まい》、3《枚|まい》の《場合|ば|あい》を', 'べつべつに《数|かぞ》えてたす。', '$\\frac{3}{8}+\\frac{3}{8}+\\frac{1}{8}$'],
    raku: ['《起|お》こらないのは「《全部|ぜん|ぶ》《表|おもて》」の1《通|とお》りだけ。', '$1-\\frac{1}{8}=\\frac{7}{8}$'],
    why: '《起|お》こる《場合|ば|あい》と《起|お》こらない《場合|ば|あい》をあわせると《全部|ぜん|ぶ》で、《確率|かく|りつ》は1（3-17②）。',
    caution: '「ちょうど1《枚|まい》」は「《少|すく》なくとも」ではない（わざ 3-88）。',
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 }, boxw: '15mm', boxh: '12mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /少なくとも|1(枚|個|回)以上/.test(q); },
    steps: {
      s1(r) {
        if (r.chance(0.7)) {
          const n = r.int(2, 5), side = r.chance(0.5) ? OMO : URA, all = side === OMO ? URA : OMO, a = fr(Q(2 ** n - 1, 2 ** n));
          return { q: `コイン ${n} ${MAI}で、《少|すく》なくとも1${MAI}${side}の${PROB}`, a,
            easy: `《全部|ぜん|ぶ》${all}の《反対|はん|たい》 $1-\\frac{1}{${2 ** n}}=${a.slice(1, -1)}$`, verify: same(a, coins(n, k => (side === OMO ? k >= 1 : k <= n - 1))) };
        }
        const [w, c, f] = r.pick(DEV), a = fr(qs(Q(1), qm(Q(6 - c, 6), Q(6 - c, 6))));
        return { q: `サイコロ2${KAI}で、${w}が《少|すく》なくとも1${KAI}《出|で》る${PROB}`, a,
          easy: `$1-\\left(\\frac{${6 - c}}{6}\\right)^2=${a.slice(1, -1)}$`, verify: same(a, diceN(2, L => L.some(f))) };
      },
      // 「1枚以上」・3回
      s2(r) {
        if (r.chance(0.5)) {
          const n = r.int(3, 6), a = fr(Q(2 ** n - 1, 2 ** n));
          return { q: `コイン ${n} ${MAI}で、${OMO}が1${MAI}《以上|い|じょう》の${PROB}`, a,
            easy: `$1-\\frac{1}{${2 ** n}}=${a.slice(1, -1)}$`, verify: same(a, coins(n, k => k >= 1)) };
        }
        const [w, c, f] = r.pick(DEV), n = 3, a = fr(qs(Q(1), Q((6 - c) ** n, 6 ** n)));
        return { q: `サイコロ${n}${KAI}で、${w}が1${KAI}《以上|い|じょう》《出|で》る${PROB}`, a,
          easy: `$1-\\left(\\frac{${6 - c}}{6}\\right)^${n}=${a.slice(1, -1)}$`, verify: same(a, diceN(n, L => L.some(f))) };
      },
      // 小数の確率・場合の数
      s3(r) {
        if (r.chance(0.5)) {
          const p = r.int(2, 8), n = r.int(2, 3), a = dq(qs(Q(1), Q((10 - p) ** n, 10 ** n)));
          return { q: `${PROB} 0.${p} で《上向|うわ|む》き。${n}${KAI}で《少|すく》なくとも1${KAI}《上向|うわ|む》きの${PROB}`, a,
            easy: `$1-0.${10 - p}^${n}$`, verify: same(a, qs(Q(1), qm(Q((10 - p) ** n), Q(1, 10 ** n)))) };
        }
        const n = r.int(3, 6), a = String(2 ** n - 1);
        return { q: `コイン ${n} ${MAI}で、《少|すく》なくとも1${MAI}${OMO}になるのは □ 《通|とお》り`, a,
          easy: `$2^${n}-1$`, verify: same(a, qm(coins(n, k => k >= 1), Q(2 ** n))) };
      },
      // わな：「ちょうど1枚」（少なくともではない。わざ 3-88）
      trap(r) {
        const n = r.int(3, 5), side = r.chance(0.5) ? OMO : URA, a = fr(Q(n, 2 ** n));
        return dest({ q: `コイン ${n} ${MAI}で、${side}がちょうど1${MAI}の${PROB}`, a, verify: same(a, coins(n, k => (side === OMO ? k : n - k) === 1)) },
          '3-87', `「《少|すく》なくとも」ではない。ちょうど1${MAI}は ${n}《通|とお》り $\\frac{${n}}{${2 ** n}}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-88
  const C = (n, k) => { let v = 1; for (let i = 0; i < k; i++) v = v * (n - i) / (i + 1); return Math.round(v); };
  const row = n => Array.from({ length: n + 1 }, (_, k) => C(n, k)).join('、');
  const nCr = (n, k) => `{}_{${n}}\\mathrm{C}_{${k}}`;
  M.add({
    id: '3-88', part: PART, chap: '3-17', stars: 1,
    title: '《表|おもて》が $k$ 《枚|まい》の《数|かず》はパスカルの《三角形|さん|かく|けい》・${}_n\\mathrm{C}_r$',
    mark: 'コイン $n$ 《枚|まい》で、《表|おもて》が**ちょうど** $k$ 《枚|まい》',
    futsu: ['4《枚|まい》の《樹形図|じゅ|けい|ず》をかいて、', '16《通|とお》りを《全部|ぜん|ぶ》《書|か》き《出|だ》す。'],
    raku: ['パスカルの《三角形|さん|かく|けい》の4《枚|まい》の《段|だん》', '1、4、6、4、1 の 6 → $\\frac{6}{16}=\\frac{3}{8}$', '${}_5\\mathrm{C}_3={}_5\\mathrm{C}_2=\\frac{5\\times4}{2\\times1}=10$'],
    why: '「どの $k$ 《枚|まい》が《表|おもて》か」を《選|えら》ぶ《数|かず》と《同|おな》じ（3-17③）。',
    caution: 'どの《枚|まい》が《表|おもて》か《決|き》まっているときは、1《通|とお》りだけ。',
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 }, boxw: '15mm', boxh: { s1: '12mm', s3: '12mm', trap: '12mm' },
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return (/コイン/.test(q) && /ちょうど|枚以上/.test(q) && !/少なくとも/.test(q)) || /mathrm\{C\}|選び方/.test(q); },
    steps: {
      s1(r) {
        const n = r.int(3, 6), k = r.int(1, n - 1), c = C(n, k), a = fr(Q(c, 2 ** n));
        return { q: `コイン ${n} ${MAI}で${OMO}がちょうど ${k} ${MAI}の${PROB}`, a,
          easy: `${row(n)} の ${c} → $\\frac{${c}}{${2 ** n}}=${a.slice(1, -1)}$`, verify: same(a, coins(n, x => x === k)) };
      },
      // nCr の値
      s2(r) {
        const n = r.int(4, 8), k = r.int(2, n - 1), kk = Math.min(k, n - k), c = C(n, k);
        if (kk < 1) return null;
        const num0 = Array.from({ length: kk }, (_, i) => n - i).join('\\times'), den = Array.from({ length: kk }, (_, i) => kk - i).join('\\times');
        return { q: `$${nCr(n, k)}$`, a: String(c), easy: `$${k !== kk ? `${nCr(n, k)}=${nCr(n, kk)}=` : ''}\\frac{${num0}}{${den}}$`,
          verify: same(String(c), qm(coins(n, x => x === k), Q(2 ** n))) };
      },
      // ◯枚以上・選び方・場合の数
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const n = r.int(4, 6), k = r.int(Math.ceil(n / 2), n - 1), L = Array.from({ length: n - k + 1 }, (_, i) => C(n, k + i)), a = fr(Q(sum(L), 2 ** n));
          return { q: `コイン ${n} ${MAI}を《投|な》げて、${OMO}が ${k} ${MAI}《以上|い|じょう》になる${PROB}`, a,
            easy: `$\\frac{${L.join('+')}}{${2 ** n}}=${a.slice(1, -1)}$`, verify: same(a, coins(n, x => x >= k)) };
        }
        if (t === 1) {
          const n = r.int(4, 8), k = r.int(2, Math.min(3, n - 2)), c = C(n, k);
          return { q: `${n}${NIN}から${k}${NIN}を《選|えら》ぶ《選|えら》び《方|かた》は □ 《通|とお》り`, a: String(c), easy: `$${nCr(n, k)}$`,
            verify: same(String(c), qm(coins(n, x => x === k), Q(2 ** n))) };
        }
        const n = r.int(5, 7), k = r.int(2, n - 2), c = C(n, k);
        return { q: `コイン ${n} ${MAI}で、${OMO}がちょうど ${k} ${MAI}になるのは □ 《通|とお》り`, a: String(c), easy: `${row(n)} の ${c}`,
          verify: same(String(c), qm(coins(n, x => x === k), Q(2 ** n))) };
      },
      // わな：どの枚が表か決まっている（1通り。わざ 3-99）／奇数枚で表と裏が同じ枚数（0）
      trap(r) {
        if (r.chance(0.5)) {
          const n = r.int(3, 4), L = Array.from({ length: n }, () => r.chance(0.5));
          if (L.every(x => x) || L.every(x => !x)) return null;
          const a = fr(Q(1, 2 ** n)), want = coins(n, (k, b) => L.every((h, i) => !!(b >> i & 1) === h));
          return dest({ q: `コイン ${n} ${MAI}を1${MAI}ずつ《投|な》げて、《順|じゅん》に${L.map(h => (h ? OMO : URA)).join('・')}の${PROB}`, a, verify: same(a, want) },
            '3-88', `どの${MAI}が${OMO}か《決|き》まっているので1《通|とお》り $\\frac{1}{${2 ** n}}$`);
        }
        const n = r.pick([3, 5, 7]);
        return dest({ q: `コイン ${n} ${MAI}で、${OMO}と${URA}が《同|おな》じ《枚数|まい|すう》の${PROB}`, a: '0', verify: same('0', coins(n, k => 2 * k === n)) },
          '3-88', `${n}${MAI}は《奇数|き|すう》なので、《同|おな》じ《枚数|まい|すう》にはならない`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-89
  const PRIZE = [[1000, 100, 20], [500, 100, 10], [1000, 500, 100], [300, 50, 10], [200, 50, 10], [1000, 200, 50]];
  M.add({
    id: '3-89', part: PART, chap: '3-17', stars: 1,
    title: '《期待値|き|たい|ち》は「もらえる《合計|ごう|けい》÷《本数|ほん|すう》」',
    mark: 'くじの《等|とう》ごとの**《本数|ほん|すう》と《金額|きん|がく》**',
    futsu: ['$1000\\times\\frac{2}{200}+100\\times\\frac{20}{200}+\\cdots$', 'と、《確率|かく|りつ》の《分数|ぶん|すう》を《作|つく》ってかける。'],
    raku: ['《全部|ぜん|ぶ》《引|ひ》いたときにもらえる《合計|ごう|けい》', '$2000+2000+1000=5000$', '$5000\\div200=25$ 《円|えん》'],
    why: '《期待値|き|たい|ち》は、たくさんやったときの1《回|かい》あたりの《平均|へい|きん》（3-17④）。',
    caution: '「なにか《当|あ》たる《確率|かく|りつ》」は《金額|きん|がく》を《使|つか》わない。',
    cols: 1, boxw: '18mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /期待値/.test(q); },
    steps: {
      s1(r) {
        const N = r.pick([50, 100, 200, 500]), P = r.pick(PRIZE).slice(r.int(0, 1)).slice(0, 2), cs = [r.int(1, 5), r.int(5, 30)];
        const T = sum(P.map((p, i) => p * cs[i]));
        if (sum(cs) >= N || T % N) return null;
        const a = String(T / N);
        return { q: `${P.map((p, i) => `${p}《円|えん》${HON(cs[i])}`).join('・')}が《当|あ》たりの${HON(N)}のくじの《期待値|き|たい|ち》`, a,
          easy: `$(${P.map((p, i) => p * cs[i]).join('+')})\\div${N}$`, verify: same(a, qsum(P.map((p, i) => qm(Q(p), Q(cs[i], N))))) };
      },
      // サイコロのゲーム（場合の数で割る）
      s2(r) {
        const k = r.int(0, 2);
        let pts, w;
        if (k === 0) { const m = r.pick([2, 10, 20, 100]); pts = [1, 2, 3, 4, 5, 6].map(x => x * m); w = `《出|で》た《目|め》の${m}《倍|ばい》の《点|てん》`; }
        else if (k === 1) { const m = r.pick([30, 60, 120]); const ev = r.chance(0.5); pts = [1, 2, 3, 4, 5, 6].map(x => ((x % 2 === 0) === ev ? m : 0)); w = `${ev ? '《偶数|ぐう|すう》' : '《奇数|き|すう》'}なら ${m}、ほかは0《点|てん》`; }
        else { const m = r.pick([60, 120, 300]), h = r.pick([30, 60]); pts = [0, 0, 0, 0, h, m]; w = `6 なら ${m}、5 なら ${h}、ほかは0《点|てん》`; }
        const T = sum(pts);
        if (T % 6) return null;
        const a = String(T / 6);
        return { q: `サイコロで ${w}。《期待値|き|たい|ち》は □ 《点|てん》`, a,
          easy: `$(${pts.filter(x => x).join('+')})\\div6$`, verify: same(a, qsum(pts.map(x => Q(x, 6)))) };
      },
      // 本数を逆に求める・コイン
      s3(r) {
        if (r.chance(0.5)) {
          const N = r.pick([100, 200]), p = r.pick([500, 1000, 200]), c = r.int(2, 10), T = p * c;
          if (T % N) return null;
          const e = T / N;
          return { q: `《当|あ》たりが${p}《円|えん》だけの${HON(N)}のくじ。《期待値|き|たい|ち》 ${e} 《円|えん》なら □ 《本|ほん》`, a: String(c),
            easy: `$${e}\\times${N}\\div${p}$`, verify: same(String(c), qd(Q(e * N), Q(p))) };
        }
        const n = r.int(2, 4), m = r.pick([10, 50, 100]), a = String(n * m / 2);
        const want = qmean(Array.from({ length: 2 ** n }, (_, b) => { let k = 0; for (let i = 0; i < n; i++) if (b >> i & 1) k++; return Q(k * m); }));
        return { q: `コイン ${n} ${MAI}で、${OMO}1${MAI}につき ${m} 《円|えん》。《期待値|き|たい|ち》は □ 《円|えん》`, a,
          easy: `${2 ** n}《通|とお》りでもらえる《合計|ごう|けい》 $${m * n * 2 ** (n - 1)}\\div${2 ** n}$`, verify: same(a, want) };
      },
      // わな：なにか当たる確率（金額を使わない）
      trap(r) {
        const N = r.pick([50, 100, 200]), P = r.pick(PRIZE).slice(1), cs = [r.int(1, 5), r.int(5, 20)];
        const a = fr(Q(sum(cs), N));
        return dest({ q: `${P.map((p, i) => `${p}《円|えん》${HON(cs[i])}`).join('・')}が《当|あ》たりの${HON(N)}のくじで、《当|あ》たる${PROB}`, a,
          verify: same(a, qa(Q(cs[0], N), Q(cs[1], N))) },
        '3-89', `《期待値|き|たい|ち》ではない。《当|あ》たりの《本数|ほん|すう》÷《全部|ぜん|ぶ》 $\\frac{${sum(cs)}}{${N}}=${a.slice(1, -1)}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-90
  M.add({
    id: '3-90', part: PART, chap: '3-17', stars: 1,
    title: '《一部|いち|ぶ》の《割合|わり|あい》で《全体|ぜん|たい》を《見|み》つもる',
    mark: '「□《回|かい》のうち□《回|かい》」「□《個|こ》《取|と》り《出|だ》すと」「1 L に□ひき」',
    futsu: ['2000《回|かい》をあらためて《投|な》げて、', '《数|かぞ》えなおす？'],
    raku: ['$780\\div1200=0.65$', '2000《回|かい》なら $2000\\times0.65=1300$', '1 L に36ぴき、5000 L なら $36\\times5000$'],
    why: 'たくさんくり《返|かえ》すと、《割合|わり|あい》は《確率|かく|りつ》に《落|お》ち《着|つ》く。かたよりなく《取|と》り《出|だ》せば、《全体|ぜん|たい》と《同|おな》じ《割合|わり|あい》（3-17①⑥）。',
    caution: '《回数|かい|すう》が《少|すく》ないと《割合|わり|あい》はゆれる。コインやサイコロは、《場合|ば|あい》を《数|かぞ》える。',
    cols: 1, boxw: '20mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /およそ/.test(q) && /回|個|ひき|ぴき|本/.test(q) && !/正規分布|平均/.test(q); },
    steps: {
      // 投げた回数の割合から
      s1(r) {
        const N = r.pick([500, 1000, 1200, 1500, 2000, 2500]), p = r.int(20, 80), Mx = r.pick([1000, 2000, 3000, 4000, 5000]);
        if ((N * p) % 100 || (Mx * p) % 100) return null;
        const a0 = N * p / 100, a = String(Mx * p / 100), P = dq(Q(p, 100)), w = r.pick(['《画|が》びょう', 'キャップ']);
        return { q: `${w} ${N}${KAI}で《上向|うわ|む》き ${a0}${KAI}。${Mx}${KAI}ならおよそ □ ${KAI}`, a,
          easy: `$${a0}\\div${N}=${P}$ → $${Mx}\\times${P}$`, verify: same(a, qm(Q(Mx), Q(a0, N))) };
      },
      // 取り出した一部から全体
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const T = r.pick([5000, 8000, 10000, 20000]), n = r.pick([100, 200, 400, 500]), d = r.int(1, 9), a = T * d / n;
          if (a % 1) return null;
          return { q: `${T}${KO}から ${n}${KO}《取|と》り《出|だ》すと《不良品|ふ|りょう|ひん》${d}${KO}。《全体|ぜん|たい》でおよそ □ ${KO}`, a: String(a),
            easy: `$${T}\\times${d}\\div${n}$`, verify: same(String(a), qm(Q(T), Q(d, n))) };
        }
        if (k === 1) {
          const T = r.pick([300, 600, 900, 1200]), n = r.pick([20, 30, 40, 50]), b = r.int(2, n - 2), a = T * b / n;
          if (a % 1) return null;
          return { q: `《碁石|ご|いし》${T}${KO}から ${n}${KO}《取|と》り《出|だ》すと《黒|くろ》${b}${KO}。《黒|くろ》はおよそ □ ${KO}`, a: String(a),
            easy: `$${T}\\times${b}\\div${n}$`, verify: same(String(a), qm(Q(T), Q(b, n))) };
        }
        const c = r.int(12, 60), V = r.pick([100, 500, 2000, 5000]), a = String(c * V);
        return { q: `《池|いけ》の《水|みず》1 L にミジンコ ${c} ひき。${V} L ならおよそ □ ひき`, a, easy: `$${c}\\times${V}$`, verify: same(a, Q(c * V)) };
      },
      // 印をつけて数える（全体を逆に）・回数を逆に
      s3(r) {
        if (r.chance(0.5)) {
          const m = r.pick([20, 30, 40, 50, 60]), n = r.pick([30, 40, 50, 60]), k = r.int(2, 6), a = m * n / k;
          if (a % 1) return null;
          return { q: `《魚|さかな》${m}ひきに《印|しるし》→ ${n}ひき《中|ちゅう》${k}ひきに《印|しるし》。《池|いけ》におよそ □ ひき`, a: String(a),
            easy: `《印|しるし》つきの《割合|わり|あい》 $\\frac{${k}}{${n}}$ → $${m}\\div\\frac{${k}}{${n}}$`, easyCheck: false, verify: same(String(a), qd(Q(m), Q(k, n))) };
        }
        const p = r.int(20, 80), c = r.pick([150, 200, 310, 450, 600]), N = c * 100 / p;
        if (N % 1 || N > 10000) return null;
        return { q: `《上向|うわ|む》きの《割合|わり|あい》 ${dq(Q(p, 100))}。□ ${KAI}《投|な》げると、およそ ${c}${KAI}《上向|うわ|む》き`, a: String(N),
          easy: `$${c}\\div${dq(Q(p, 100))}$`, verify: same(String(N), qd(Q(c), Q(p, 100))) };
      },
      // わな：正しいコイン・サイコロの確率は、少ない回数の割合ではなく場合を数えて出す
      trap(r) {
        if (r.chance(0.5)) {
          const n = r.pick([10, 12, 20]), h = r.intNot(Math.ceil(n * 0.6), n - 1, x => 2 * x === n);
          return dest({ q: `《正|ただ》しいコインを ${n}${KAI}《投|な》げて${OMO}が ${h}${KAI}。${OMO}が《出|で》る${PROB}は □`, a: '$\\frac{1}{2}$', verify: same('$\\frac{1}{2}$', coins(1, k => k === 1)) },
            '3-90', `${n}${KAI}では《割合|わり|あい》はゆれる。《場合|ば|あい》を《数|かぞ》えて $\\frac{1}{2}$`);
        }
        const n = r.pick([12, 18, 30]), f = r.pick([1, 2, 3, 4, 5, 6]), h = r.intNot(Math.ceil(n / 6) + 2, Math.ceil(n / 3), x => 6 * x === n);
        return dest({ q: `《正|ただ》しいサイコロを ${n}${KAI}ふって ${f} が ${h}${KAI}。${f} が《出|で》る${PROB}は □`, a: '$\\frac{1}{6}$', verify: same('$\\frac{1}{6}$', diceN(1, L => L[0] === f)) },
          '3-90', `${n}${KAI}では《割合|わり|あい》はゆれる。《場合|ば|あい》を《数|かぞ》えて $\\frac{1}{6}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-99
  M.add({
    id: '3-99', part: PART, chap: '3-17', stars: 2,
    title: 'どくりつな《試行|し|こう》の《確率|かく|りつ》はかける',
    mark: '「**《何回|なん|かい》とも**」「1《回|かい》めが…で、2《回|かい》めが…」（1《回|かい》めの《結果|けっ|か》が2《回|かい》めに《関係|かん|けい》しない）',
    futsu: ['コイン3《枚|まい》の《樹形図|じゅ|けい|ず》で8《通|とお》りを《書|か》き《出|だ》し、', '《全部|ぜん|ぶ》《表|おもて》は1《通|とお》り。'],
    raku: ['1《枚|まい》ずつの《確率|かく|りつ》をかける。', '$\\frac{1}{2}\\times\\frac{1}{2}\\times\\frac{1}{2}=\\frac{1}{8}$', 'サイコロ2《回|かい》とも6 → $\\left(\\frac{1}{6}\\right)^2=\\frac{1}{36}$'],
    why: '《樹形図|じゅ|けい|ず》の《枝|えだ》の《数|かず》がかけ《算|ざん》になる（3-17の《先|さき》）。1《回|かい》めの《結果|けっ|か》で、2《回|かい》めの《確率|かく|りつ》が《変|か》わらないときに《使|つか》える。',
    caution: 'くじをもどさずに《引|ひ》くときは、2《回|かい》めの《確率|かく|りつ》が《変|か》わる。',
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 }, boxw: '15mm', boxh: '12mm',
    counts: { s1: 10, s2: 6, s3: 4, trap: 2 },
    fits(q) { return /確率/.test(q) && /とも|1(回|枚)めが.*2(回|枚)めが|サイコロで.*コインで|順に/.test(q) && !/もどさず|少なくとも|和/.test(q); },
    steps: {
      // 何回とも（同じことをくり返す）
      s1(r) {
        if (r.chance(0.4)) {
          const n = r.int(2, 5), a = fr(Q(1, 2 ** n));
          return { q: `コイン ${n} ${MAI}とも${OMO}の${PROB}`, a,
            easy: `$\\left(\\frac{1}{2}\\right)^${n}=${a.slice(1, -1)}$`, verify: same(a, coins(n, k => k === n)) };
        }
        const [w, c, f] = r.pick(DEV), n = r.int(2, 3), p = Q(c, 6), a = fr(Q(c ** n, 6 ** n));
        return { q: `サイコロ${n}${KAI}とも${w}の${PROB}`, a,
          easy: `$\\left(\\frac{${p[0]}}{${p[1]}}\\right)^${n}=${a.slice(1, -1)}$`, verify: same(a, diceN(n, L => L.every(f))) };
      },
      // ちがうことがらを続ける（サイコロとコイン）
      s2(r) {
        const [w1, c1, f1] = r.pick(DEV), p1 = Q(c1, 6), side = r.chance(0.5) ? OMO : URA;
        const a = fr(qm(p1, Q(1, 2)));
        return { q: `サイコロで${w1}、コインで${side}の${PROB}`, a,
          easy: `$\\frac{${p1[0]}}{${p1[1]}}\\times\\frac{1}{2}=${a.slice(1, -1)}$`, verify: same(a, qm(diceN(1, L => f1(L[0])), coins(1, k => k === (side === OMO ? 1 : 0)))) };
      },
      // 2回で別のことがら・小数の確率・もどして引くくじ
      s3(r) {
        if (r.chance(0.35)) {
          const [w1, c1, f1] = r.pick(DEV), [w2, c2, f2] = r.pick(DEV), p1 = Q(c1, 6), p2 = Q(c2, 6);
          if (w1 === w2) return null;
          const a = fr(qm(p1, p2));
          return { q: `サイコロ2${KAI}で、1${KAI}めが${w1}、2${KAI}めが${w2}の${PROB}`, a,
            easy: `$\\frac{${p1[0]}}{${p1[1]}}\\times\\frac{${p2[0]}}{${p2[1]}}=${a.slice(1, -1)}$`, verify: same(a, diceN(2, L => f1(L[0]) && f2(L[1]))) };
        }
        if (r.chance(0.6)) {
          const p = r.int(2, 9), n = r.int(2, 3), a = dq(Q(p ** n, 10 ** n));
          const w = r.pick([['シュートが《入|はい》る', '《入|はい》る'], ['《上向|うわ|む》きの', '《上向|うわ|む》きの']]);
          return { q: `${w[0]}${PROB} 0.${p}。${n}${KAI}とも${w[1]}${PROB}`, a,
            easy: `$0.${p}^${n}$`, verify: same(a, qm(Q(p ** n), Q(1, 10 ** n))) };
        }
        const N = r.pick([4, 5, 6, 8, 10]), w = r.int(1, Math.min(3, N - 1)), a = fr(Q(w * w, N * N));
        return { q: `《当|あ》たり${w}・はずれ${HON(N - w)}を、もどして2${KAI}。2${KAI}とも《当|あ》たる${PROB}`, a,
          easy: `$\\frac{${w}}{${N}}\\times\\frac{${w}}{${N}}=${a.slice(1, -1)}$`, verify: same(a, qm(Q(w, N), Q(w, N))) };
      },
      // わな：もどさずに引く（2回めの確率が変わる）
      trap(r) {
        const N = r.pick([5, 6, 8, 10, 12]), w = r.int(2, Math.min(4, N - 2)), a = fr(Q(w * (w - 1), N * (N - 1)));
        // 検算：引き方の組を全部数える
        let c = 0, T = 0;
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) { T++; if (i < w && j < w) c++; }
        return dest({ q: `《当|あ》たり${w}・はずれ${HON(N - w)}を、もどさず2《本|ほん》。2《本|ほん》とも《当|あ》たる${PROB}`, a, verify: same(a, Q(c, T)) },
          '3-99', `もどさないので、2《本|ほん》めの${PROB}が《変|か》わる $\\frac{${w}}{${N}}\\times\\frac{${w - 1}}{${N - 1}}=${a.slice(1, -1)}$`);
      },
    },
  });
})(globalThis.MONDAI);
