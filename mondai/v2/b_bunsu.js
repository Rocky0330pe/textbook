/* 問題集 第2巻　第2部 分数と小数（わざ 2-14〜2-28、2-90〜2-93）　組 b
 * 書き方は v2/README.md（と v1/README.md）。文は教科書 第2巻と同じ（漢字にルビ、分かち書きなし）。式は $…$。
 * 分数の計算は M.F（約分ずみの [分子, 分母]）。小数は分数で計算してから文字にする（ずれない）。
 * 第29回：わなは、同じ部のほかのわざで楽にならないものにする。どうしても当たるときは、
 *   楽な形に行き先（「わざ 2-15 で」）を書いて also に入れる（dest）。入れかえただけの問題には key（H-6）。
 * 帯分数（$2\frac{1}{3}$）は、検算の式読み（evalMath）では 2×1/3 と読まれるので、問題の式の中に □ を入れ、
 *   帯分数の答えには val（仮分数）と verify（この組の式読み evalQ で確かめる）をつける。 */
(function (M) {
  'use strict';
  const F = M.F;
  const gcd = F.gcd;
  const PART = 2;

  // ---------------------------------------------------------------- TeX の部品
  const fr = (n, d) => `\\frac{${n}}{${d}}`;             // 約分しない分数
  const tf = x => F.tex(x);                               // 約分ずみ（整数ならそのまま）
  const tm = x => F.tex(x, { mixed: true });              // 帯分数
  const $ = s => '$' + s + '$';
  const T = '\\times', D = '\\div';
  // 整数 n を 10^p でわった小数の文字（うしろの0は消す）
  const ds = (n, p) => {
    if (!p) return String(n);
    const s = String(Math.abs(n)).padStart(p + 1, '0');
    const t = (s.slice(0, -p) + '.' + s.slice(-p)).replace(/0+$/, '').replace(/\.$/, '');
    return (n < 0 ? '-' : '') + t;
  };
  // 分数 → 小数の文字（終わらない小数なら null）
  const dec = x => { for (let p = 0; p <= 9; p++) { const k = x[0] * Math.pow(10, p); if (k % x[1] === 0) return ds(k / x[1], p); } return null; };
  const fd = t => F.fromDec(t);
  // 素数に分ける
  const pf = n => { const out = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
  const pfT = n => pf(n).join(T);
  const dsum = n => String(n).split('').reduce((a, b) => a + +b, 0);
  // 帯分数の TeX（整数部 w と、真分数 n/d）
  const mix = (w, n, d) => `${w}${fr(n, d)}`;
  // 真分数 a/d（約分ずみ）をひとつ
  const pfrac = (r, d) => { const a = r.int(1, d - 1); return gcd(a, d) === 1 ? a : null; };
  const num = (x, y) => x - y;

  // ---------------------------------------------------------------- ことば（ルビ）
  const YB = '《約分|やく|ぶん》', TB = '《通分|つう|ぶん》', BB = '《分母|ぶん|ぼ》', BS = '《分子|ぶん|し》', GS = '《逆数|ぎゃく|すう》';
  const TAI = '《帯分数|たい|ぶん|すう》', KA = '《仮分数|か|ぶん|すう》', BUN = '《分数|ぶん|すう》', SHO = '《小数|しょう|すう》', SEI = '《整数|せい|すう》';
  const SOS = '《素数|そ|すう》', BAI = '《倍数|ばい|すう》', KYO = '《共通|きょう|つう》', DAI = '《大|おお》きい', CHI = '《小|ちい》さい';
  const KS = '《教科書|きょう|か|しょ》';
  const TAIDE = `（${TAI}で）`;

  // ---------------------------------------------------------------- 式を読む（fits と verify 用）
  // q（ルビをとった問題の文）が「$式$」「$式=□$」「$式$ ＝ □」（うしろに（…）があってもよい）なら、項と演算に分ける。
  // 項：{k:'int'|'dec'|'frac'|'mixed', n, d, v（M.F の値）}。演算：'+' '-' '*' '/'。ちがえば null
  function parse(q) {
    const m = /^\$([^$]*)\$(?:\s*＝\s*□)?(?:（[^）]*）)?$/.exec(String(q).trim());
    if (!m) return null;
    const s = m[1].replace(/\s+/g, '').replace(/=□$/, '');
    const t = [], o = [];
    let i = 0;
    const take = re => { const mm = re.exec(s.slice(i)); if (!mm) return null; i += mm[0].length; return mm; };
    for (;;) {
      const n = take(/^\d+(\.\d+)?/);
      if (n) {
        const f = take(/^\\frac\{(\d+)\}\{(\d+)\}/);
        if (f) t.push({ k: 'mixed', w: +n[0], n: +f[1], d: +f[2], v: F.add(F.make(+n[0]), F.make(+f[1], +f[2])) });
        else if (n[1]) t.push({ k: 'dec', s: n[0], v: fd(n[0]) });
        else t.push({ k: 'int', n: +n[0], d: 1, v: F.make(+n[0]) });
      } else {
        const f = take(/^\\frac\{(\d+)\}\{(\d+)\}/);
        if (!f) return null;
        t.push({ k: 'frac', n: +f[1], d: +f[2], v: F.make(+f[1], +f[2]) });
      }
      if (i >= s.length) break;
      const op = take(/^(\+|-|\\times|\\div)/);
      if (!op) return null;
      o.push({ '+': '+', '-': '-', '\\times': '*', '\\div': '/' }[op[1]]);
    }
    return { t, o };
  }
  // 項と演算の値（×÷が先）
  function evalP(e) {
    if (!e) return null;
    const vs = [e.t[0].v], os = [];
    e.o.forEach((op, k) => {
      const v = e.t[k + 1].v;
      if (op === '*' || op === '/') { const l = vs.pop(); vs.push(op === '*' ? F.mul(l, v) : F.div(l, v)); } else { vs.push(v); os.push(op); }
    });
    return os.reduce((acc, op, k) => (op === '+' ? F.add(acc, vs[k + 1]) : F.sub(acc, vs[k + 1])), vs[0]);
  }
  const evalQ = q => { try { return evalP(parse(M.plain(q))); } catch (e) { return null; } };
  // 答えの文字（'$3\frac{2}{3}$'・'$\frac{7}{2}$'・'$4$'）の値
  const evalA = a => evalQ(a);
  // 問題の式（帯分数をふくむ）の値と、答えの値が同じか
  //   （問題の物の verify として呼ばれる。this は問題の物）
  const vq = () => function () { const x = evalQ(this.q), y = evalA(this.a); return !!(x && y && F.eq(x, y)) || `式の値 ${x} と答え ${y} がちがう`; };

  // 項が分数だけの、たし算・ひき算（2-16・2-17・2-90）
  const fracSum = q => { const e = parse(q); if (!e || e.t.length < 2 || !e.t.every(x => x.k === 'frac') || !e.o.every(o => o === '+' || o === '-')) return null; return e; };
  const dens = e => e.t.map(x => x.d);
  // 約分の問題「$\frac{A}{B}$ を約分すると □」の [A, B]
  const yaku = q => { const m = /^\$\\frac\{(\d+)\}\{(\d+)\}\$ を約分すると □$/.exec(q); return m ? [+m[1], +m[2]] : null; };
  const COMMON5 = ['0.5', '0.25', '0.75', '0.2', '0.125'];

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
  // 入れかえただけの問題（a＋b と b＋a、a×b と b×a）の key
  const kk = (op, ...v) => op + v.map(String).sort().join(',');

  // ================================================================ 2-14
  // 約分の問題と、そのわり算の段（fs の順にわる）
  function yakuP(A, B, fs, hint) {
    let a = A, b = B;
    const ch = [fr(A, B)];
    fs.forEach(f => { a /= f; b /= f; ch.push(fr(a, b)); });
    return { q: `${$(fr(A, B))} を${YB}すると □`, a: $(tf(F.make(A, B))), easy: `${hint}：${$(ch.join('='))}` };
  }
  const WAKE = { 2: '《一|いち》の《位|くらい》が《偶数|ぐう|すう》', 5: '《一|いち》の《位|くらい》が0か5', 3: '《各位|かく|い》の《和|わ》が3の' + BAI, 9: '《各位|かく|い》の《和|わ》が9の' + BAI };
  M.add({
    id: '2-14', part: PART, chap: '2-4', stars: 2,
    title: 'わりきれるかを《先|さき》に《見|み》る（2・3・5・9）',
    mark: '**《大|おお》きな《分母|ぶん|ぼ》・《分子|ぶん|し》**の《約分|やく|ぶん》。**《一|いち》の《位|くらい》**と、**《各位|かく|い》の《数|かず》の《和|わ》**を《見|み》る。',
    futsu: ['$\\frac{45}{72}$ の45と72を、2、3、4、…と', '《順|じゅん》にわってみて、', 'わりきれる《数|かず》をさがす。'],
    raku: ['$4+5=9$、$7+2=9$ → 9でわれる', '$\\frac{45}{72}=\\frac{45\\div9}{72\\div9}=\\frac{5}{8}$'],
    why: '10、100、1000は、9でわると1あまる。だから、《各位|かく|い》の《数|かず》の《和|わ》が9（3）でわりきれれば、その《数|かず》も9（3）でわりきれる。',
    caution: '7・11・13でわれるかは、この《方法|ほう|ほう》ではわからない（わざ 2-15）。',
    counts: { s1: 8, s2: 6, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '24mm', trap: '16mm' },
    boxh: { s1: '12mm', s2: '12mm', trap: '12mm' },
    // 大きな数の約分（共通の約数に3か5がある）・「…を3でわると □」
    fits(q) {
      if (/^\$\d+\$ を\d+でわると □$/.test(q)) return true;
      const f = yaku(q);
      if (!f) return false;
      const g = gcd(f[0], f[1]);
      return Math.max(f[0], f[1]) >= 40 && (g % 3 === 0 || g % 5 === 0);
    },
    steps: {
      // 各位の和で、9か3でわれるとわかる
      s1(r) {
        const f = r.pick([9, 9, 3]);
        const n = r.int(f === 9 ? 5 : 14, Math.floor(99 / f)), m = r.int(1, n - 1);
        const A = f * m, B = f * n;
        if (A < 12 || gcd(m, n) !== 1) return null;
        return yakuP(A, B, [f], `《各位|かく|い》の《和|わ》 ${dsum(A)}・${dsum(B)}`);
      },
      // 一の位（2・5）と各位の和（3・9）を2回つかう。1より大きい分数も
      s2(r) {
        const fs = r.pick([[5, 3], [5, 9], [2, 3], [2, 9], [3, 3], [2, 5]]);
        const g = fs[0] * fs[1];
        const n = r.int(2, Math.floor(999 / g));
        const m = r.chance(0.2) ? r.int(n + 1, Math.floor(999 / g)) : r.int(1, n - 1);
        const A = g * m, B = g * n;
        if (A < 20 || B < 30 || A > 999 || gcd(m, n) !== 1) return null;
        return yakuP(A, B, fs, `${fs.join('、')}の《順|じゅん》にわる`);
      },
      // わりきれるか（3けた・4けた）
      s3(r) {
        const d = r.pick([3, 9]);
        const N = r.chance(0.5) ? d * r.int(Math.ceil(120 / d), Math.floor(9999 / d)) : r.int(120, 9999);
        const ok = N % d === 0;
        const dg = String(N).split('');
        const a = ok ? 'わりきれる' : 'わりきれない';
        return { q: `${$(N)} を${d}でわると □`, a, easy: `${$(dg.join('+') + '=' + dsum(N))}${ok ? 'で' : 'は'}${d}の${BAI}${ok ? '' : 'でない'}`,
          verify: () => ((N % d === 0) === (a === 'わりきれる')) || 'わりきれるかがちがう' };
      },
      // わな：7・11・13が共通（2・3・5・9ではわかない）
      trap(r) {
        const g = r.pick([7, 7, 11, 13]);
        const n = r.int(3, Math.floor(150 / g)), m = r.int(2, n - 1);
        const A = g * m, B = g * n;
        if (A < 20 || gcd(m, n) !== 1) return null;
        return dest({ q: `${$(fr(A, B))} を${YB}すると □`, a: $(tf(F.make(A, B))) }, '2-14', `2・3・5・9ではわれない。${g}でわる：${$(fr(A, B) + '=' + tf(F.make(A, B)))}`);
      },
    },
  });

  // ================================================================ 2-15
  M.add({
    id: '2-15', part: PART, chap: '2-4', stars: 1,
    title: `${YB}は${SOS}に《分|わ》けて、${KYO}を《消|け》す`,
    mark: `**${BB}と${BS}に${KYO}の《約数|やく|すう》**がある。どちらも${SOS}のかけ《算|ざん》に《分|わ》ける。`,
    futsu: ['12と18をわれる《数|かず》をさがす。', '2でわって $\\frac{6}{9}$。', 'まだ3でわれる。'],
    raku: ['$\\frac{12}{18}=\\frac{2\\times2\\times3}{2\\times3\\times3}$', '《上下|じょう|げ》の2と3を《消|け》す → $\\frac{2}{3}$'],
    why: `2と3を《消|け》すのは、$2\\times3=6$ でわるのと《同|おな》じ。わる《数|かず》をさがさなくても、のこさず${YB}できる（${KS} 2-4②）。`,
    caution: `${KYO}の${SOS}がなければ、もう${YB}できない（$\\frac{14}{15}$ など）。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    // 約分の問題（共通の約数がある）・分子と分母がかけ算の分数
    fits(q) {
      const f = yaku(q);
      if (f) return gcd(f[0], f[1]) > 1;
      return /\\frac\{\d+\\times\d+\}\{\d+\\times\d+\}/.test(q);
    },
    steps: {
      // 2けたまで
      s1(r) {
        const g = r.pick([2, 3, 4, 5, 6, 7, 6, 4]);
        const n = r.int(2, Math.floor(60 / g)), m = r.int(1, n - 1);
        const A = g * m, B = g * n;
        if (A < 4 || gcd(m, n) !== 1) return null;
        const x = F.make(A, B);
        return { q: `${$(fr(A, B))} を${YB}すると □`, a: $(tf(x)), easy: $(`${fr(A, B)}=${fr(pfT(A), pfT(B))}=${tf(x)}`) };
      },
      // 共通の素数が2つ以上・1より大きい分数
      s2(r) {
        const g = r.pick([12, 14, 15, 18, 20, 21, 24, 30, 10]);
        const n = r.int(2, Math.floor(160 / g));
        const m = r.chance(0.25) ? r.int(n + 1, Math.floor(200 / g)) : r.int(1, n - 1);
        const A = g * m, B = g * n;
        if (gcd(m, n) !== 1 || n === 1) return null;
        const x = F.make(A, B);
        return { q: `${$(fr(A, B))} を${YB}すると □`, a: $(tf(x)), easy: $(`${fr(A, B)}=${fr(pfT(A), pfT(B))}=${tf(x)}`) };
      },
      // かけ算のままの分数・ことばの問題
      s3(r) {
        if (r.chance(0.5)) {
          const a = r.int(2, 15), b = r.int(2, 15), c = r.int(2, 15), d = r.int(2, 15);
          const x = F.make(a * c, b * d);
          if (gcd(a * c, b * d) < 4 || x[1] > 12 || x[1] === 1 || a === b || c === d) return null;
          return { q: $(fr(`${a}${T}${c}`, `${b}${T}${d}`)), a: $(tf(x)), easy: $(`${fr(`${pfT(a)}${T}${pfT(c)}`, `${pfT(b)}${T}${pfT(d)}`)}=${tf(x)}`), key: kk('f', [a, c].sort(num).join('x'), [b, d].sort(num).join('x')) };
        }
        const L = r.pick([24, 36, 48, 60, 72, 84, 90, 96, 120]), U = r.int(6, L - 6);
        const x = F.make(U, L);
        if (gcd(U, L) < 3) return null;
        return { q: `${$(L + '\\,\\mathrm{cm}')} のリボンのうち、${$(U + '\\,\\mathrm{cm}')} を《使|つか》った。《使|つか》ったのは《全体|ぜん|たい》の □`,
          a: $(tf(x)), easy: $(`${fr(U, L)}=${fr(pfT(U), pfT(L))}=${tf(x)}`) };
      },
      // わな：どちらも約数があるが、共通の素数がない
      trap(r) {
        const A = r.int(6, 40), B = r.int(A + 1, 45);
        if (gcd(A, B) !== 1 || pf(A).length < 2 || pf(B).length < 2) return null;
        return dest({ q: `${$(fr(A, B))} を${YB}すると □`, a: $(fr(A, B)) }, '2-15', `${KYO}の${SOS}がない：${$(`${fr(A, B)}=${fr(pfT(A), pfT(B))}`)}`);
      },
    },
  });

  // ================================================================ 2-16
  // a1/d1 ± a2/d2 を、大きいほうの分母 L にそろえる式
  const toL = (n, d, L) => fr(n * L / d, L);
  M.add({
    id: '2-16', part: PART, chap: '2-4', stars: 1,
    title: `《片方|かた|ほう》の${BB}が${BAI}なら、《大|おお》きいほうにそろえる`,
    mark: `${BB}が **3と6、4と8、5と10** のように、《大|おお》きいほうが《小|ちい》さいほうの${BAI}。`,
    futsu: ['3と6をかけて、18にそろえる。', '$\\frac{6}{18}+\\frac{3}{18}=\\frac{9}{18}$', 'このあと9で' + YB + 'する。'],
    raku: ['6は3の' + BAI + '。6にそろえる。', '$\\frac{1}{3}+\\frac{1}{6}=\\frac{2}{6}+\\frac{1}{6}$', '$=\\frac{3}{6}=\\frac{1}{2}$'],
    why: `6は、3にも6にもなれる《数|かず》（${BAI}）のうち、いちばん《小|ちい》さい。《片方|かた|ほう》の${BB}だけを《変|か》えればよい（${KS} 2-4②③）。`,
    caution: `4と6のように、${BAI}でないときは《使|つか》えない（わざ 2-17）。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    fits(q) {
      const e = fracSum(q);
      if (!e) return false;
      const ds0 = dens(e), L = Math.max(...ds0);
      return new Set(ds0).size > 1 && ds0.every(d => L % d === 0);
    },
    steps: {
      // 2つのたし算
      s1(r) {
        const d1 = r.int(2, 6), k = r.int(2, 4), d2 = d1 * k;
        if (d2 > 24) return null;
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const x = F.add(F.make(a1, d1), F.make(a2, d2)), S = a1 * k + a2;
        const [p, q] = r.chance(0.5) ? [fr(a1, d1), fr(a2, d2)] : [fr(a2, d2), fr(a1, d1)];
        const mid = p === fr(a1, d1) ? `${toL(a1, d1, d2)}+${fr(a2, d2)}` : `${fr(a2, d2)}+${toL(a1, d1, d2)}`;
        return { q: $(`${p}+${q}`), a: $(tf(x)), easy: $(`${mid}=${fr(S, d2)}${F.eq(x, F.make(S, d2)) && x[1] === d2 ? '' : '=' + tf(x)}`), key: kk('+', fr(a1, d1), fr(a2, d2)) };
      },
      // ひき算・3つの分数
      s2(r) {
        if (r.chance(0.4)) {
          const d = r.int(2, 4), a = pfrac(r, 2 * d), b = pfrac(r, 4 * d), c = pfrac(r, d);
          if (!a || !b || !c) return null;
          const L = 4 * d, x = F.add(F.add(F.make(c, d), F.make(a, 2 * d)), F.make(b, L)), S = c * 4 + a * 2 + b;
          return { q: $(`${fr(c, d)}+${fr(a, 2 * d)}+${fr(b, L)}`), a: $(tf(x)), easy: $(`${toL(c, d, L)}+${toL(a, 2 * d, L)}+${fr(b, L)}=${fr(S, L)}${x[1] === L ? '' : '=' + tf(x)}`) };
        }
        const d1 = r.int(2, 6), k = r.int(2, 4), d2 = d1 * k;
        if (d2 > 24) return null;
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const v1 = F.make(a1, d1), v2 = F.make(a2, d2);
        const big1 = F.val(v1) > F.val(v2);
        const x = big1 ? F.sub(v1, v2) : F.sub(v2, v1);
        const S = big1 ? a1 * k - a2 : a2 - a1 * k;
        const q = big1 ? `${fr(a1, d1)}-${fr(a2, d2)}` : `${fr(a2, d2)}-${fr(a1, d1)}`;
        const mid = big1 ? `${toL(a1, d1, d2)}-${fr(a2, d2)}` : `${fr(a2, d2)}-${toL(a1, d1, d2)}`;
        return { q: $(q), a: $(tf(x)), easy: $(`${mid}=${fr(S, d2)}${x[1] === d2 ? '' : '=' + tf(x)}`) };
      },
      // ことばの問題
      s3(r) {
        const d1 = r.pick([2, 3, 4, 5]), k = r.int(2, 3), d2 = d1 * k;
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const v1 = F.make(a1, d1), v2 = F.make(a2, d2);
        if (r.chance(0.5)) {
          const x = F.add(v1, v2);
          return { q: `ジュースを、${$(fr(a1, d1) + '\\,\\mathrm{L}')} と ${$(fr(a2, d2) + '\\,\\mathrm{L}')} 《飲|の》んだ。あわせて □ L`, a: $(tf(x)), easy: $(`${toL(a1, d1, d2)}+${fr(a2, d2)}=${tf(x)}`) };
        }
        if (F.val(v1) <= F.val(v2)) return null;
        const x = F.sub(v1, v2);
        return { q: `リボンが ${$(fr(a1, d1) + '\\,\\mathrm{m}')} ある。${$(fr(a2, d2) + '\\,\\mathrm{m}')} 《使|つか》うと、のこりは □ m`, a: $(tf(x)), easy: $(`${toL(a1, d1, d2)}-${fr(a2, d2)}=${tf(x)}`) };
      },
      // わな：どちらも倍数でない（2-17 で）
      trap(r) {
        const [d1, d2] = r.pick([[4, 6], [6, 9], [6, 8], [4, 10], [9, 12], [8, 12], [10, 15], [6, 10]]);
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const L = F.lcm(d1, d2), x = F.add(F.make(a1, d1), F.make(a2, d2));
        return dest({ q: $(`${fr(a1, d1)}+${fr(a2, d2)}`), a: $(tf(x)), key: kk('+', fr(a1, d1), fr(a2, d2)) }, '2-16',
          `${d2}は${d1}の${BAI}でない。${L}にそろえる：${$(`${toL(a1, d1, L)}+${toL(a2, d2, L)}=${tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-17
  const PAIRS17 = [[4, 6], [6, 9], [6, 8], [4, 10], [6, 10], [9, 12], [8, 12], [10, 15], [12, 18], [6, 15], [8, 10], [10, 12], [12, 15], [14, 21], [15, 20], [8, 6], [9, 6], [12, 8]];
  M.add({
    id: '2-17', part: PART, chap: '2-4', stars: 1,
    title: `${TB}は${BB}の《最小公倍数|さい|しょう|こう|ばい|すう》で`,
    mark: `${BB}に **${KYO}の《約数|やく|すう》** がある（4と6、6と9）。かけ《算|ざん》でそろえると《大|おお》きくなりすぎる。`,
    futsu: ['$6\\times9=54$ にそろえる。', '$\\frac{45}{54}+\\frac{12}{54}=\\frac{57}{54}$', 'このあと3で' + YB + 'する。'],
    raku: ['6と9の《公倍数|こう|ばい|すう》で《最小|さい|しょう》は18。', '$\\frac{5}{6}+\\frac{2}{9}=\\frac{15}{18}+\\frac{4}{18}$', '$=\\frac{19}{18}$'],
    why: `6の${BAI}（6、12、18）と9の${BAI}（9、18）で、はじめに《出|で》る18にそろえると、《数|かず》が《小|ちい》さく、あとの${YB}もいらない（${KS} 2-4②）。`,
    caution: `${BB}が《同|おな》じなら${TB}はいらない。《片方|かた|ほう》が${BAI}なら、わざ 2-16。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    fits(q) {
      let e = fracSum(q);
      if (!e) {
        // 大きさくらべ「$\frac{a}{b}$ と $\frac{c}{d}$ では、大きいのは □」
        const m = /^\$\\frac\{\d+\}\{(\d+)\}\$ と \$\\frac\{\d+\}\{(\d+)\}\$ では、大きいのは □$/.exec(q);
        if (!m) return false;
        e = { t: [{ d: +m[1] }, { d: +m[2] }] };
      }
      const ds0 = [...new Set(dens(e))], L = Math.max(...ds0), l = ds0.reduce((a, b) => F.lcm(a, b), 1);
      return ds0.length > 1 && !ds0.every(d => L % d === 0) && l < ds0.reduce((a, b) => a * b, 1);
    },
    steps: {
      s1(r) {
        const [d1, d2] = r.pick(PAIRS17);
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const L = F.lcm(d1, d2), x = F.add(F.make(a1, d1), F.make(a2, d2)), S = a1 * L / d1 + a2 * L / d2;
        return { q: $(`${fr(a1, d1)}+${fr(a2, d2)}`), a: $(tf(x)), easy: $(`${toL(a1, d1, L)}+${toL(a2, d2, L)}=${fr(S, L)}${x[1] === L ? '' : '=' + tf(x)}`), key: kk('+', fr(a1, d1), fr(a2, d2)) };
      },
      // ひき算
      s2(r) {
        const [d1, d2] = r.pick(PAIRS17);
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const v1 = F.make(a1, d1), v2 = F.make(a2, d2);
        if (F.val(v1) <= F.val(v2)) return null;
        const L = F.lcm(d1, d2), x = F.sub(v1, v2), S = a1 * L / d1 - a2 * L / d2;
        return { q: $(`${fr(a1, d1)}-${fr(a2, d2)}`), a: $(tf(x)), easy: $(`${toL(a1, d1, L)}-${toL(a2, d2, L)}=${fr(S, L)}${x[1] === L ? '' : '=' + tf(x)}`) };
      },
      // 大きさくらべ・3つの分数
      s3(r) {
        const [d1, d2] = r.pick(PAIRS17);
        const a1 = pfrac(r, d1), a2 = pfrac(r, d2);
        if (!a1 || !a2) return null;
        const L = F.lcm(d1, d2), v1 = F.make(a1, d1), v2 = F.make(a2, d2);
        if (r.chance(0.5)) {
          if (F.eq(v1, v2) || a1 === a2 || Math.abs(F.val(v1) - F.val(v2)) > 0.2) return null;
          const big = F.val(v1) > F.val(v2) ? v1 : v2;
          const a = $(tf(big));
          return { q: `${$(fr(a1, d1))} と ${$(fr(a2, d2))} では、《大|おお》きいのは □`, a,
            easy: `${$(toL(a1, d1, L))} と ${$(toL(a2, d2, L))}`, easyCheck: false,
            verify: () => (a === $(tf(F.val(v1) > F.val(v2) ? v1 : v2)) && F.val(big) >= Math.max(F.val(v1), F.val(v2))) || '大きいほうがちがう',
            key: kk('<', fr(a1, d1), fr(a2, d2)) };
        }
        const d3 = r.pick([2, 3, 4, 5, 6].filter(d => L % d === 0 && d !== d1 && d !== d2));
        if (!d3) return null;
        const a3 = pfrac(r, d3);
        if (!a3) return null;
        const x = F.add(F.add(v1, v2), F.make(a3, d3)), S = a1 * L / d1 + a2 * L / d2 + a3 * L / d3;
        return { q: $(`${fr(a1, d1)}+${fr(a2, d2)}+${fr(a3, d3)}`), a: $(tf(x)), easy: $(`${toL(a1, d1, L)}+${toL(a2, d2, L)}+${toL(a3, d3, L)}=${fr(S, L)}${x[1] === L ? '' : '=' + tf(x)}`) };
      },
      // わな：分母が同じ（通分はいらない）
      trap(r) {
        const d = r.int(5, 12), a = r.int(1, d - 1), b = r.int(1, d - 1);
        if ((a === 1 && b === 1) || gcd(a, d) !== 1 || gcd(b, d) !== 1) return null;
        const x = F.make(a + b, d);
        return dest({ q: $(`${fr(a, d)}+${fr(b, d)}`), a: $(tf(x)), key: kk('+', a, b, d) }, '2-17', `${BB}が《同|おな》じ。${TB}はいらない：${$(`${fr(a + b, d)}${x[1] === d ? '' : '=' + tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-18
  // かけ算（分数・帯分数をふくむ）の項の分子・分母で、ななめに共通の約数があるか
  function crossCancel(e) {
    if (!e || e.t.length < 2 || e.t.some(x => x.k === 'dec') || !e.t.some(x => x.k === 'frac' || x.k === 'mixed') || !e.o.every(o => o === '*')) return false;
    const ts = e.t.map(x => x.v);
    for (let i = 0; i < ts.length; i++) for (let j = 0; j < ts.length; j++) if (i !== j && gcd(ts[i][0], ts[j][1]) > 1) return true;
    return false;
  }
  M.add({
    id: '2-18', part: PART, chap: '2-4', stars: 1,
    title: `${YB}してからかける`,
    mark: `${BS}と${BB}に **${KYO}の《約数|やく|すう》**（ななめも）。${SEI}×${BUN}も。`,
    futsu: ['$\\frac{4}{7}\\times\\frac{7}{8}=\\frac{28}{56}$', 'このあと56と28をわる《数|かず》をさがす。'],
    raku: ['7と7、4と8を、かける《前|まえ》に' + YB + '。', '$\\frac{4}{7}\\times\\frac{7}{8}=\\frac{1\\times1}{1\\times2}=\\frac{1}{2}$'],
    why: `かけたあとの${BS}・${BB}は、もとの${BS}どうし・${BB}どうしの${'《積|せき》'}。どれとどれで${YB}しても《同|おな》じなので、《小|ちい》さいうちに${YB}する（${KS} 2-4④）。`,
    caution: `${KYO}の《約数|やく|すう》がなければ、そのままかける（$\\frac{2}{3}\\times\\frac{5}{7}$）。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    fits(q) { return crossCancel(parse(q)); },
    steps: {
      // ななめに約分
      s1(r) {
        const p = r.int(1, 5), q = r.int(1, 5), s = r.int(1, 5), t = r.int(1, 5), g1 = r.int(1, 7), g2 = r.int(2, 7);
        const A = p * g1, B = q * g2, C = s * g2, Dd = t * g1;
        if (gcd(A, B) !== 1 || gcd(C, Dd) !== 1 || B < 2 || Dd < 2 || A > 30 || Dd > 30) return null;
        const x = F.mul(F.make(A, B), F.make(C, Dd));
        return { q: $(`${fr(A, B)}${T}${fr(C, Dd)}`), a: $(tf(x)), easy: $(`${fr(`${A / g1}${T}${C / g2}`, `${B / g2}${T}${Dd / g1}`)}=${tf(x)}`), key: kk('x', fr(A, B), fr(C, Dd)) };
      },
      // 整数×分数
      s2(r) {
        const g = r.int(2, 8), u = r.int(2, 9), v = r.int(2, 6), a = r.int(1, 9);
        const N = g * u, b = g * v;
        if (gcd(a, b) !== 1 || gcd(u, v) !== 1 || N > 60 || b > 40) return null;
        const x = F.mul(F.make(N), F.make(a, b));
        const q = r.chance(0.5) ? `${N}${T}${fr(a, b)}` : `${fr(a, b)}${T}${N}`;
        return { q: $(q), a: $(tf(x)), easy: $(`${u}${T}${fr(a, v)}=${tf(x)}`), key: kk('x', N, fr(a, b)) };
      },
      // 3つの分数・ことばの問題
      s3(r) {
        if (r.chance(0.5)) {
          const ns = [r.int(1, 9), r.int(1, 9), r.int(1, 9)], dd = [r.int(2, 9), r.int(2, 9), r.int(2, 9)];
          if (ns.some((n, k) => gcd(n, dd[k]) !== 1)) return null;
          const N = ns.reduce((a, b) => a * b, 1), Dn = dd.reduce((a, b) => a * b, 1), x = F.make(N, Dn);
          if (Dn / x[1] < 6 || x[1] > 12) return null;
          return { q: $(ns.map((n, k) => fr(n, dd[k])).join(T)), a: $(tf(x)), easy: $(`${fr(ns.join(T), dd.join(T))}=${tf(x)}`) };
        }
        const w = F.make(r.int(1, 9), r.int(2, 10)), l = F.make(r.int(1, 9), r.int(2, 9));
        if (w[1] === 1 || l[1] === 1 || (gcd(w[0], l[1]) === 1 && gcd(l[0], w[1]) === 1)) return null;
        const x = F.mul(w, l);
        return { q: `1 m あたり ${$(tf(w) + '\\,\\mathrm{kg}')} の《棒|ぼう》があります。この《棒|ぼう》 ${$(tf(l) + '\\,\\mathrm{m}')} の《重|おも》さは □ kg`,
          a: $(tf(x)), easy: $(`${tf(w)}${T}${tf(l)}=${tf(x)}`) };
      },
      // わな：共通の約数がない
      trap(r) {
        const A = r.int(1, 8), B = r.int(2, 9), C = r.int(1, 8), Dd = r.int(2, 9);
        if (gcd(A, B) !== 1 || gcd(C, Dd) !== 1 || gcd(A, Dd) !== 1 || gcd(C, B) !== 1 || A * C === 1) return null;
        const x = F.mul(F.make(A, B), F.make(C, Dd));
        return dest({ q: $(`${fr(A, B)}${T}${fr(C, Dd)}`), a: $(tf(x)), key: kk('x', fr(A, B), fr(C, Dd)) }, '2-18', `${KYO}の《約数|やく|すう》がない。そのままかける：${$(`${fr(`${A}${T}${C}`, `${B}${T}${Dd}`)}=${tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-19
  M.add({
    id: '2-19', part: PART, chap: '2-4', stars: 1,
    title: `÷${BUN}は${GS}をかける`,
    mark: `**÷のうしろ**が${BUN}・${SEI}。わる《数|かず》の${BS}と${BB}を《入|い》れかえてかける。`,
    futsu: ['$\\frac{2}{5}\\div\\frac{3}{4}$ を、《数直線|すう|ちょく|せん》や', '《面積図|めん|せき|ず》で《考|かんが》えて《求|もと》める。'],
    raku: ['わる《数|かず》 $\\frac{3}{4}$ の' + GS + 'は $\\frac{4}{3}$', '$\\frac{2}{5}\\div\\frac{3}{4}=\\frac{2}{5}\\times\\frac{4}{3}=\\frac{8}{15}$'],
    why: `わられる《数|かず》とわる《数|かず》に、わる《数|かず》の${GS}をかけると、わる《数|かず》が1になる（${BUN}の《中|なか》に${BUN}。${KS} 2-4⑥）。`,
    caution: `かけ《算|ざん》は${GS}にしない。${GS}にするのは、÷のうしろの《数|かず》だけ。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    fits(q) {
      if (/^\$□\\times\\frac\{\d+\}\{\d+\}=\\frac\{\d+\}\{\d+\}\$$/.test(q)) return true;
      const e = parse(q);
      return !!e && e.o.includes('/') && e.t.every(x => x.k !== 'dec') && e.t.some(x => x.k === 'frac' || x.k === 'mixed');
    },
    steps: {
      s1(r) {
        const b = r.int(2, 9), d = r.int(2, 9), a = pfrac(r, b), c = r.int(1, 9);
        if (!a || gcd(c, d) !== 1 || b === d || c === 1 && d < 3) return null;
        const x = F.div(F.make(a, b), F.make(c, d));
        if (x[1] > 30) return null;
        return { q: $(`${fr(a, b)}${D}${fr(c, d)}`), a: $(tf(x)), easy: $(`${fr(a, b)}${T}${fr(d, c)}=${tf(x)}`) };
      },
      // ÷整数・整数÷分数
      s2(r) {
        if (r.chance(0.5)) {
          const b = r.int(2, 9), a = r.int(1, 9), n = r.int(2, 9);
          if (gcd(a, b) !== 1) return null;
          const x = F.div(F.make(a, b), F.make(n));
          return { q: $(`${fr(a, b)}${D}${n}`), a: $(tf(x)), easy: $(`${fr(a, b)}${T}${fr(1, n)}=${tf(x)}`) };
        }
        const n = r.int(2, 12), c = r.int(2, 9), d = r.int(2, 9);
        if (gcd(c, d) !== 1) return null;
        const x = F.div(F.make(n), F.make(c, d));
        return { q: $(`${n}${D}${fr(c, d)}`), a: $(tf(x)), easy: $(`${n}${T}${fr(d, c)}=${tf(x)}`) };
      },
      // □×分数＝分数（答えの確かめの逆）・ことばの問題
      s3(r) {
        const b = r.int(2, 9), d = r.int(2, 9), a = pfrac(r, b), c = pfrac(r, d);
        if (!a || !c || b === d) return null;
        const v = F.make(a, b), w = F.make(c, d), x = F.div(v, w);
        if (x[1] > 20) return null;
        if (r.chance(0.5)) return { q: $(`□${T}${fr(c, d)}=${fr(a, b)}`), a: $(tf(x)), easy: $(`${fr(a, b)}${D}${fr(c, d)}=${fr(a, b)}${T}${fr(d, c)}=${tf(x)}`) };
        return { q: `${$(fr(c, d) + '\\,\\mathrm{dL}')} のペンキで、《壁|かべ》が ${$(fr(a, b) + '\\,\\mathrm{m}^{2}')} ぬれた。1 dL では □ ${$('\\mathrm{m}^{2}')}`,
          a: $(tf(x)), easy: $(`${fr(a, b)}${D}${fr(c, d)}=${fr(a, b)}${T}${fr(d, c)}=${tf(x)}`) };
      },
      // わな：かけ算（逆数にしない）。ななめに約分できないもの
      trap(r) {
        const A = r.int(1, 8), B = r.int(2, 9), C = r.int(1, 8), Dd = r.int(2, 9);
        if (gcd(A, B) !== 1 || gcd(C, Dd) !== 1 || gcd(A, Dd) !== 1 || gcd(C, B) !== 1 || A * C === 1) return null;
        const x = F.mul(F.make(A, B), F.make(C, Dd));
        return dest({ q: $(`${fr(A, B)}${T}${fr(C, Dd)}`), a: $(tf(x)), key: kk('x', fr(A, B), fr(C, Dd)) }, '2-19', `かけ《算|ざん》は${GS}にしない：${$(`${fr(`${A}${T}${C}`, `${B}${T}${Dd}`)}=${tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-20
  // 帯分数をひとつ [w, n, d, 値]
  const mixR = (r, wmax, dmax) => { const d = r.int(2, dmax || 9), n = pfrac(r, d), w = r.int(1, wmax || 3); return n ? [w, n, d, F.add(F.make(w), F.make(n, d))] : null; };
  const mixT = m => mix(m[0], m[1], m[2]);
  M.add({
    id: '2-20', part: PART, chap: '2-4', stars: 1,
    title: `${TAI}は${KA}にしてからかける・わる`,
    mark: `**${TAI}**のかけ《算|ざん》・わり《算|ざん》。`,
    futsu: ['$2\\frac{1}{3}\\times1\\frac{1}{5}$ を、《整数|せい|すう》と', `${BUN}に《分|わ》けて、4つのかけ《算|ざん》を`, 'してからたす。'],
    raku: [`《先|さき》に${KA}にする。`, '$2\\frac{1}{3}\\div1\\frac{3}{4}=\\frac{7}{3}\\div\\frac{7}{4}$', '$=\\frac{7}{3}\\times\\frac{4}{7}=\\frac{4}{3}$'],
    why: `${TAI}は《整数|せい|すう》と${BUN}の《和|わ》。かけ《算|ざん》は《和|わ》のままではできないので、1つの${BUN}（${KA}）にする（${KS} 2-4①⑦）。`,
    caution: `たし《算|ざん》・ひき《算|ざん》は、《整数|せい|すう》と${BUN}に《分|わ》けたほうが《楽|らく》（わざ 2-92）。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '20mm' }, boxh: '12mm',
    fits(q) { const e = parse(q); return !!e && e.t.some(x => x.k === 'mixed') && e.o.some(o => o === '*' || o === '/'); },
    steps: {
      // 帯分数のかけ算
      s1(r) {
        const m1 = mixR(r), y = r.chance(0.5) ? mixR(r, 2) : null;
        if (!m1) return null;
        const yv = y ? y[3] : F.make(r.int(1, 9), r.int(2, 9));
        if (yv[1] === 1 || (!y && yv[0] > yv[1])) return null;
        const yt = y ? mixT(y) : tf(yv);
        const x = F.mul(m1[3], yv);
        if (x[1] > 12 || x[0] > 60) return null;
        const q = $(`${mixT(m1)}${T}${yt}=□`), a = $(tf(x));
        return { q, a, easy: $(`${tf(m1[3])}${T}${tf(yv)}=${tf(x)}`), verify: vq(q, a) };
      },
      // 帯分数のわり算
      s2(r) {
        const m1 = mixR(r), m2 = r.chance(0.7) ? mixR(r, 2) : null;
        if (!m1) return null;
        const yv = m2 ? m2[3] : F.make(r.int(2, 9));
        const x = F.div(m1[3], yv);
        if (x[1] > 12 || x[0] > 60) return null;
        const q = $(`${mixT(m1)}${D}${m2 ? mixT(m2) : yv[0]}=□`), a = $(tf(x));
        return { q, a, easy: $(`${tf(m1[3])}${T}${tf([yv[1], yv[0]])}=${tf(x)}`), verify: vq(q, a) };
      },
      // ことばの問題（面積・ペンキ）
      s3(r) {
        const m1 = mixR(r, 2, 6), m2 = mixR(r, 2, 6);
        if (!m1 || !m2) return null;
        if (r.chance(0.5)) {
          const x = F.mul(m1[3], m2[3]);
          if (x[1] > 8) return null;
          return { q: `たて ${$(mixT(m1) + '\\,\\mathrm{m}')}、よこ ${$(mixT(m2) + '\\,\\mathrm{m}')} の《長方形|ちょう|ほう|けい》の《面積|めん|せき》は □ ${$('\\mathrm{m}^{2}')}`,
            a: $(tf(x)), easy: $(`${tf(m1[3])}${T}${tf(m2[3])}=${tf(x)}`) };
        }
        const x = F.div(m2[3], m1[3]);
        if (x[1] > 8) return null;
        return { q: `${$(mixT(m1) + '\\,\\mathrm{dL}')} のペンキで、《壁|かべ》が ${$(mixT(m2) + '\\,\\mathrm{m}^{2}')} ぬれた。1 dL では □ ${$('\\mathrm{m}^{2}')}`,
          a: $(tf(x)), easy: $(`${tf(m2[3])}${T}${tf([m1[3][1], m1[3][0]])}=${tf(x)}`) };
      },
      // わな：帯分数のたし算（2-92 で）
      trap(r) {
        const d = r.int(3, 9), w1 = r.int(1, 4), w2 = r.int(1, 3), n1 = pfrac(r, d), n2 = pfrac(r, d);
        if (!n1 || !n2 || n1 + n2 >= d) return null;
        const x = F.make(w1 * d + n1 + w2 * d + n2, d);
        const q = $(`${mix(w1, n1, d)}+${mix(w2, n2, d)}=□`) + TAIDE, a = $(tm(x));
        return dest({ q, a, val: $(tf(x)), verify: vq(q, a), key: kk('+', mix(w1, n1, d), mix(w2, n2, d)) }, '2-20',
          `たし《算|ざん》は${KA}にしなくてよい：${$(`${w1 + w2}+${tf(F.make(n1 + n2, d))}`)}`);
      },
    },
  });

  // ================================================================ 2-21
  const DEC21 = ['0.5', '0.25', '0.75', '0.2', '0.4', '0.6', '0.8', '0.125', '0.375', '1.2', '1.5', '2.5', '0.3', '0.9', '0.7', '1.25', '0.15', '0.45'];
  M.add({
    id: '2-21', part: PART, chap: '2-4', stars: 1,
    title: `${SHO}と${BUN}がまざったら${BUN}にそろえる`,
    mark: `1つの《式|しき》に **${SHO}と${BUN}** がまざっている。`,
    futsu: ['$\\frac{3}{8}$ を《小数|しょう|すう》にして $0.375$。', '$0.75\\div0.375$ を《筆算|ひっ|さん》でする。'],
    raku: [`$0.75=\\frac{3}{4}$ にして、${BUN}どうしで。`, '$0.75\\div\\frac{3}{8}=\\frac{3}{4}\\times\\frac{8}{3}=2$'],
    why: `${SHO}はいつも${BUN}にできるが、$\\frac{1}{3}$ のように${SHO}で《終|お》わらない${BUN}もある。だから${BUN}にそろえる（${KS} 2-4⑦）。`,
    caution: `${SHO}どうしのたし《算|ざん》・ひき《算|ざん》は、そのまま${SHO}でよい。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '18mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm' },
    fits(q) { const e = parse(q); return !!e && e.t.some(x => x.k === 'dec') && e.t.some(x => x.k === 'frac' || x.k === 'mixed'); },
    steps: {
      // ×・÷
      s1(r) {
        const s = r.pick(DEC21), v = fd(s), w = F.make(r.int(1, 9), r.int(2, 9));
        if (w[1] === 1) return null;
        const div = r.chance(0.5), x = div ? F.div(v, w) : F.mul(v, w);
        if (x[1] > 12 || x[0] > 40) return null;
        if (div) return { q: $(`${s}${D}${tf(w)}`), a: $(tf(x)), easy: $(`${tf(v)}${T}${tf([w[1], w[0]])}=${tf(x)}`) };
        const first = r.chance(0.5);
        return { q: $(first ? `${s}${T}${tf(w)}` : `${tf(w)}${T}${s}`), a: $(tf(x)), easy: $(first ? `${tf(v)}${T}${tf(w)}=${tf(x)}` : `${tf(w)}${T}${tf(v)}=${tf(x)}`), key: kk('x', s, tf(w)) };
      },
      // ＋・－（小数で終わらない分数）
      s2(r) {
        const s = r.pick(DEC21), v = fd(s), d = r.pick([3, 6, 7, 9, 12]), n = pfrac(r, d);
        if (!n) return null;
        const w = F.make(n, d);
        if (r.chance(0.5)) {
          const x = F.add(v, w);
          return { q: $(`${s}+${tf(w)}`), a: $(tf(x)), easy: $(`${tf(v)}+${tf(w)}=${tf(x)}`), key: kk('+', s, tf(w)) };
        }
        const big = F.val(v) > F.val(w), x = big ? F.sub(v, w) : F.sub(w, v);
        return { q: $(big ? `${s}-${tf(w)}` : `${tf(w)}-${s}`), a: $(tf(x)), easy: $(big ? `${tf(v)}-${tf(w)}=${tf(x)}` : `${tf(w)}-${tf(v)}=${tf(x)}`) };
      },
      // ことばの問題・3つの数
      s3(r) {
        if (r.chance(0.5)) {
          const L = r.pick(['1.2', '1.8', '2.4', '0.6', '3.6', '1.5', '0.9']), w = F.make(r.int(1, 8), r.int(2, 9));
          if (w[0] >= w[1]) return null;
          const x = F.mul(fd(L), w);
          if (x[1] > 10) return null;
          return { q: `${$(L + '\\,\\mathrm{m}')} のテープの ${$(tf(w))} は □ m`, a: $(tf(x)), easy: $(`${tf(fd(L))}${T}${tf(w)}=${tf(x)}`) };
        }
        const s1 = r.pick(DEC21), s2 = r.pick(['0.5', '0.25', '0.2', '0.4']), w = F.make(r.int(1, 9), r.int(2, 9));
        if (w[1] === 1) return null;
        const x = F.div(F.mul(fd(s1), w), fd(s2));
        if (x[1] > 12 || x[0] > 40) return null;
        return { q: $(`${s1}${T}${tf(w)}${D}${s2}`), a: $(tf(x)), easy: $(`${tf(fd(s1))}${T}${tf(w)}${T}${tf([fd(s2)[1], fd(s2)[0]])}=${tf(x)}`) };
      },
      // わな：小数どうしのたし算・ひき算
      trap(r) {
        const a = r.int(1, 9), b = r.int(1, 99), pa = r.int(1, 2);
        if (b % 10 === 0) return null;
        const sa = ds(a * (pa === 1 ? 10 : 1), 2), sb = ds(b, 2);
        if (COMMON5.includes(sa) && COMMON5.includes(sb)) return null;
        const v1 = fd(sa), v2 = fd(sb), plus = r.chance(0.6) || F.val(v1) <= F.val(v2);
        const x = plus ? F.add(v1, v2) : F.sub(v1, v2);
        const q = plus ? `${sa}+${sb}` : `${sa}-${sb}`;
        return dest({ q: $(q), a: $(dec(x)), key: plus ? kk('+', sa, sb) : undefined }, '2-21', `${SHO}どうしは、そのまま：${$(`${q}=${dec(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-22
  const COMMON = [['0.5', 1, 2], ['0.25', 1, 4], ['0.75', 3, 4], ['0.2', 1, 5], ['0.4', 2, 5], ['0.6', 3, 5], ['0.8', 4, 5], ['0.125', 1, 8], ['0.375', 3, 8], ['0.625', 5, 8], ['0.875', 7, 8], ['1.5', 3, 2], ['1.25', 5, 4], ['2.5', 5, 2], ['1.75', 7, 4]];
  const isCommon = s => COMMON.some(c => c[0] === s);
  M.add({
    id: '2-22', part: PART, chap: '2-4', stars: 1,
    title: `よく《出|で》る${SHO}と${BUN}をおぼえる`,
    mark: '**0.5・0.25・0.75・0.2・0.125** が《出|で》てくる。',
    futsu: ['$0.125=\\frac{125}{1000}$ にしてから、', '5で3《回|かい》' + YB + 'する。'],
    raku: ['$0.125=\\frac{1}{8}$（おぼえている）', '$\\frac{3}{4}=0.75$、$\\frac{1}{5}=0.2$'],
    why: `$\\frac{1}{2}$ の《半分|はん|ぶん》が $\\frac{1}{4}=0.25$、その《半分|はん|ぶん》が $\\frac{1}{8}=0.125$。《半分|はん|ぶん》にしていけば、すぐ《思|おも》い《出|だ》せる（${KS} 2-4・2-9①）。`,
    caution: '0.33は $\\frac{33}{100}$。$\\frac{1}{3}$ ではない（$\\frac{1}{3}$ は《小数|しょう|すう》で《終|お》わらない）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '18mm', s3: '18mm', trap: '16mm' }, boxh: { s1: '12mm', trap: '12mm' },
    fits(q) {
      let m = /^\$(\d+\.\d+)\$ を分数にすると □$/.exec(q);
      if (m) return isCommon(m[1]);
      m = /^\$(?:\d*)\\frac\{(\d+)\}\{(\d+)\}\$ を小数にすると □$/.exec(q);
      if (m) return COMMON.some(c => +m[2] === c[2] && (+m[1] % c[2]) === c[1] % c[2]);
      const e = parse(q);
      if (!e) return false;
      return e.t.some(x => x.k === 'dec' && COMMON5.includes(x.s)) && (e.o.some(o => o === '*' || o === '/') || e.t.some(x => x.k === 'frac'));
    },
    steps: {
      // 小数 → 分数
      s1(r) {
        const [s, n, d] = r.pick(COMMON);
        return { q: `${$(s)} を${BUN}にすると □`, a: $(fr(n, d)), easy: $(`${s}=${fr(n, d)}`) };
      },
      // 分数 → 小数
      s2(r) {
        const [s, n, d] = r.pick(COMMON);
        return { q: `${$(fr(n, d))} を${SHO}にすると □`, a: $(s), easy: $(`${fr(n, d)}=${s}`) };
      },
      // 帯分数 → 小数・大きさくらべ
      s3(r) {
        const [s, n, d] = r.pick(COMMON.filter(c => c[1] < c[2]));
        if (r.chance(0.5)) {
          const w = r.int(1, 4), x = F.add(F.make(w), F.make(n, d));
          const q = `${$(mix(w, n, d))} を${SHO}にすると □`, a = $(dec(x));
          return { q, a, easy: $(`${w}+${s}=${dec(x)}`), verify: () => F.eq(fd(dec(x)), evalQ($(mix(w, n, d)))) || 'ちがう' };
        }
        const o = r.pick(COMMON.filter(c => c[1] < c[2] && c[0] !== s));
        const t = r.pick(['0.3', '0.7', '0.35', '0.65', '0.45', '0.55', '0.15', '0.9']);
        const v1 = F.make(n, d), v2 = fd(t);
        if (F.eq(v1, v2) || Math.abs(F.val(v1) - F.val(v2)) > 0.15 || !o) return null;
        const big = F.val(v1) > F.val(v2), a = big ? $(fr(n, d)) : $(t);
        return { q: `${$(fr(n, d))} と ${$(t)} では、《大|おお》きいのは □`, a, easy: `${$(`${fr(n, d)}=${s}`)} と ${$(t)}`, easyCheck: false,
          verify: () => (a === (F.val(v1) > F.val(v2) ? $(fr(n, d)) : $(t))) || '大きいほうがちがう' };
      },
      // わな：よく出る小数ではない（0.33 は 1/3 ではない）
      trap(r) {
        const s = r.pick(['0.3', '0.7', '0.9', '0.33', '0.66', '0.12', '0.15', '0.35', '0.45', '0.24', '0.36', '0.65']);
        const x = fd(s), k = s.length - 2;
        return dest({ q: `${$(s)} を${BUN}にすると □`, a: $(tf(x)) }, '2-22', `よく《出|で》る${SHO}ではない。${k === 1 ? '0.1' : '0.01'}が${s.replace(/^0\.0*/, '')}こ：${$(`${s}=${fr(s.replace(/^0\.0*/, ''), Math.pow(10, k))}=${tf(x)}`).replace(/=([^=]*)=\1\$/, '=$1$')}`);
      },
    },
  });

  // ================================================================ 2-23
  const MUL23 = [['0.5', 2], ['0.25', 4], ['0.2', 5], ['0.125', 8]];
  M.add({
    id: '2-23', part: PART, chap: '2-4', stars: 1,
    title: '×0.5は÷2、×0.25は÷4',
    mark: '**×0.5・×0.25・×0.2・×0.125** をかける。',
    futsu: ['$36\\times0.25$ を《筆算|ひっ|さん》で', '$36\\times25=900$、《小数点|しょう|すう|てん》を2つ《左|ひだり》へ。'],
    raku: ['$0.25=\\frac{1}{4}$ だから、÷4', '$36\\times0.25=36\\div4=9$'],
    why: `$0.5=\\frac{1}{2}$、$0.25=\\frac{1}{4}$、$0.2=\\frac{1}{5}$、$0.125=\\frac{1}{8}$。$\\frac{1}{4}$ をかけるのは、4でわるのと《同|おな》じ（${KS} 2-4⑧）。`,
    caution: '0.24や0.3のように、よく《出|で》る《小数|しょう|すう》でなければ、わり《算|ざん》にならない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 3, s2: 3, s3: 1, trap: 3 },
    boxw: '16mm',
    fits(q) {
      if (/の \$(0\.5|0\.25|0\.2|0\.125)\$ 倍は □$/.test(q)) return true;
      const e = parse(q);
      return !!e && e.t.length === 2 && e.o[0] === '*' && e.t.some(x => x.k === 'dec' && COMMON5.includes(x.s)) && e.t.every(x => x.k === 'int' || x.k === 'dec');
    },
    steps: {
      s1(r) {
        const [s, k] = r.pick(MUL23), t = r.int(3, 40), N = k * t;
        if (N % 100 === 0) return null;
        return { q: $(`${N}${T}${s}`), a: $(t), easy: $(`${N}${D}${k}=${t}`), key: kk('x', N, s) };
      },
      // 入れかえ・×0.75・小数×0.5
      s2(r) {
        const c = r.int(0, 2);
        if (c === 0) { const [s, k] = r.pick(MUL23), t = r.int(3, 30), N = k * t; return { q: $(`${s}${T}${N}`), a: $(t), easy: $(`${N}${D}${k}=${t}`), key: kk('x', N, s) }; }
        if (c === 1) { const t = r.int(3, 25), N = 4 * t; return { q: $(`${N}${T}0.75`), a: $(3 * t), easy: $(`${N}${D}4${T}3=${3 * t}`), key: kk('x', N, '0.75') }; }
        const [s, k] = r.pick(MUL23.slice(0, 3)), n = r.int(2, 9) * k + (r.chance(0.5) ? 0 : k * 10), N = ds(n, 1);
        if (n % 10 === 0) return null;
        const x = F.mul(fd(N), fd(s));
        return { q: $(`${N}${T}${s}`), a: $(dec(x)), easy: $(`${N}${D}${k}=${dec(x)}`), key: kk('x', N, s) };
      },
      // ことばの問題
      s3(r) {
        const [s, k] = r.pick(MUL23), t = r.int(10, 60) * (r.chance(0.5) ? 10 : 1), N = k * t;
        if (r.chance(0.5)) return { q: `1 m ${N}《円|えん》のリボンを ${$(s + '\\,\\mathrm{m}')} 《買|か》うと □ 《円|えん》`, a: $(t), easy: $(`${N}${D}${k}=${t}`) };
        return { q: `${N} の ${$(s)} 《倍|ばい》は □`, a: $(t), easy: $(`${N}${D}${k}=${t}`) };
      },
      // わな：0.25 ではない
      trap(r) {
        const s = r.pick(['0.24', '0.26', '0.52', '0.15', '0.3', '0.45', '0.35']), N = r.int(12, 60);
        if (N % 25 === 0) return null;
        const x = F.mul(F.make(N), fd(s));
        return dest({ q: $(`${N}${T}${s}`), a: $(dec(x)), key: kk('x', N, s) }, '2-23', `${s}は、よく《出|で》る${SHO}ではない：${$(`${N}${T}${s}=${dec(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-24
  const DIV24 = [['0.5', 2], ['0.25', 4], ['0.2', 5], ['0.125', 8]];
  M.add({
    id: '2-24', part: PART, chap: '2-4', stars: 1,
    title: '÷0.5は×2、÷0.25は×4',
    mark: '**÷0.5・÷0.25・÷0.2** でわる。',
    futsu: ['$7\\div0.25$ を、わる《数|かず》とわられる《数|かず》を', '100《倍|ばい》して、$700\\div25$ にする。'],
    raku: ['$0.25=\\frac{1}{4}$ の' + GS + 'は4', '$7\\div0.25=7\\times4=28$'],
    why: `$\\frac{1}{4}$ でわるのは、${GS}の4をかけるのと《同|おな》じ。1 L が0.25 L の4つ《分|ぶん》だから（${KS} 2-4⑤⑧）。`,
    caution: '0.4や0.3でわるときは、×2・×4にならない（わざ 2-27）。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 3, s2: 3, s3: 1, trap: 3 },
    boxw: '16mm',
    fits(q) {
      const e = parse(q);
      return !!e && e.t.length === 2 && e.o[0] === '/' && e.t[1].k === 'dec' && [...COMMON5].includes(e.t[1].s) && e.t[0].k !== 'frac';
    },
    steps: {
      s1(r) {
        const [s, k] = r.pick(DIV24), N = r.int(2, 40);
        return { q: $(`${N}${D}${s}`), a: $(N * k), easy: $(`${N}${T}${k}=${N * k}`) };
      },
      // 小数÷0.5・÷0.75
      s2(r) {
        if (r.chance(0.3)) { const t = r.int(2, 20), N = 3 * t; return { q: $(`${N}${D}0.75`), a: $(4 * t), easy: $(`${N}${D}3${T}4=${4 * t}`) }; }
        const [s, k] = r.pick(DIV24), n = r.int(11, 99);
        if (n % 10 === 0) return null;
        const N = ds(n, 1), x = F.mul(fd(N), F.make(k));
        return { q: $(`${N}${D}${s}`), a: $(dec(x)), easy: $(`${N}${T}${k}=${dec(x)}`) };
      },
      // ことばの問題（1 m あたり・1 kg あたり）
      s3(r) {
        const [s, k] = r.pick(DIV24.slice(0, 3)), P = r.int(3, 40) * 10;
        if (r.chance(0.5)) return { q: `${$(s + '\\,\\mathrm{m}')} で ${P}《円|えん》のリボンは、1 m あたり □ 《円|えん》`, a: $(P * k), easy: $(`${P}${D}${s}=${P}${T}${k}=${P * k}`) };
        return { q: `${$(s + '\\,\\mathrm{kg}')} で ${P}《円|えん》の《肉|にく》は、1 kg あたり □ 《円|えん》`, a: $(P * k), easy: $(`${P}${D}${s}=${P}${T}${k}=${P * k}`) };
      },
      // わな：÷0.4 など（2-27 で）
      trap(r) {
        const s = r.pick(['0.4', '0.8', '0.6', '0.3']), k = +s.slice(2);
        const N = r.int(3, 30) * (k % 3 === 0 ? 3 : 1);
        const x = F.div(F.make(N), fd(s));
        if (!dec(x) || x[1] === 1) return null;
        return dest({ q: $(`${N}${D}${s}`), a: $(dec(x)) }, '2-24', `${s}は0.5・0.25・0.2ではない。10《倍|ばい》して ${$(`${N * 10}${D}${k}=${dec(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-25
  M.add({
    id: '2-25', part: PART, chap: '2-4', stars: 2,
    title: '×25は×100÷4、×125は×1000÷8',
    mark: '**×25・×125・×250** をかける。',
    futsu: ['$36\\times25$ を《筆算|ひっ|さん》でする。', '$36\\times5=180$、$36\\times20=720$、たして900。'],
    raku: ['$25=100\\div4$ だから', '$36\\times25=3600\\div4=900$', '$48\\times125=48000\\div8=6000$'],
    why: `$25\\times4=100$、$125\\times8=1000$。25は100の $\\frac{1}{4}$、125は1000の $\\frac{1}{8}$（よく《出|で》る${BUN}。わざ 2-22 の《先|さき》）。`,
    caution: '25・125と《関係|かん|けい》のない《数|かず》（$43\\times52$）では《使|つか》えない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 3, s2: 3, s3: 1, trap: 3 },
    boxw: '18mm',
    fits(q) {
      const e = parse(q);
      return !!e && e.t.length === 2 && e.o[0] === '*' && e.t.some(x => x.k === 'int' && [25, 125, 250].includes(x.n)) && e.t.every(x => x.k === 'int' || x.k === 'dec');
    },
    steps: {
      s1(r) {
        const t = r.int(3, 30), N = 4 * t;
        if (N % 100 === 0) return null;
        return { q: $(`${N}${T}25`), a: $(25 * N), easy: $(`${N * 100}${D}4=${25 * N}`), key: kk('x', N, 25) };
      },
      // ×125・×250・入れかえ
      s2(r) {
        const c = r.int(0, 2);
        if (c === 0) { const N = 8 * r.int(2, 15); return { q: $(`${N}${T}125`), a: $(125 * N), easy: $(`${N * 1000}${D}8=${125 * N}`), key: kk('x', N, 125) }; }
        if (c === 1) { const N = 4 * r.int(2, 15); return { q: $(`${N}${T}250`), a: $(250 * N), easy: $(`${N * 1000}${D}4=${250 * N}`), key: kk('x', N, 250) }; }
        const N = 4 * r.int(3, 30);
        if (N % 100 === 0) return null;
        return { q: $(`25${T}${N}`), a: $(25 * N), easy: $(`${N * 100}${D}4=${25 * N}`), key: kk('x', N, 25) };
      },
      // 4でわりきれない数・小数・ことばの問題
      s3(r) {
        const c = r.int(0, 2);
        if (c === 0) { const N = r.int(11, 99); if (N % 4 === 0 || N % 5 === 0) return null; return { q: $(`${N}${T}25`), a: $(25 * N), easy: $(`${N * 100}${D}4=${25 * N}`), key: kk('x', N, 25) }; }
        if (c === 1) { const n = 4 * r.int(3, 40); if (n % 10 === 0) return null; const N = ds(n, 1), x = F.mul(fd(N), F.make(25)); return { q: $(`${N}${T}25`), a: $(dec(x)), easy: $(`${n * 10}${D}4=${dec(x)}`) }; }
        const N = r.int(12, 64);
        return { q: `1こ25《円|えん》のガムを${N}こ《買|か》うと、□ 《円|えん》`, a: $(25 * N), easy: $(`${N * 100}${D}4=${25 * N}`) };
      },
      // わな：25・125 と関係がない
      trap(r) {
        const a = r.int(11, 99), b = r.int(11, 99);
        if (a % 5 === 0 || b % 5 === 0 || a === b) return null;
        return dest({ q: $(`${a}${T}${b}`), a: $(a * b), key: kk('x', a, b) }, '2-25', '25・125と《関係|かん|けい》がない');
      },
    },
  });

  // ================================================================ 2-26
  // 小数の文字 → [整数, 小数点の下のけた]
  const dp = s => { const k = s.includes('.') ? s.length - s.indexOf('.') - 1 : 0; return [+s.replace('.', ''), k]; };
  function mulDec(a, b) {
    const [n1, k1] = dp(a), [n2, k2] = dp(b), x = F.mul(fd(a), fd(b));
    return { q: $(`${a}${T}${b}`), a: $(dec(x)), easy: `${$(`${n1}${T}${n2}=${n1 * n2}`)}、《小数点|しょう|すう|てん》の《下|した》は ${$(`${k1}+${k2}=${k1 + k2}`)} けた → ${$(dec(x))}`,
      easyCheck: false, verify: () => F.eq(fd(dec(x)), F.mul(fd(a), fd(b))) || 'ちがう', key: kk('x', a, b) };
  }
  M.add({
    id: '2-26', part: PART, chap: '2-4', stars: 1,
    title: `${SHO}のかけ《算|ざん》は${SEI}でかけて、《小数点|しょう|すう|てん》をもどす`,
    mark: `**${SHO}×${SHO}**。`,
    futsu: ['$0.3\\times0.04$ を、0.3の0.04こ《分|ぶん》と', '《考|かんが》えて、《小数|しょう|すう》のまま《計算|けい|さん》する。'],
    raku: ['$3\\times4=12$、《小数点|しょう|すう|てん》の《下|した》は', '$1+2=3$ けた → $0.012$'],
    why: `$0.3=\\frac{3}{10}$、$0.04=\\frac{4}{100}$。かけると $\\frac{3\\times4}{10\\times100}=\\frac{12}{1000}$ で、《小数点|しょう|すう|てん》の《下|した》のけたは、たした《数|かず》になる（${KS} 2-4④）。`,
    caution: `たし《算|ざん》・ひき《算|ざん》は、けたの《数|かず》をたさない。《位|くらい》をそろえる。`,
    counts: { s1: 8, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 3, s2: 3, s3: 1, trap: 3 },
    boxw: '18mm',
    fits(q) { const e = parse(q); return !!e && e.t.length === 2 && e.o[0] === '*' && e.t.every(x => x.k === 'dec'); },
    steps: {
      s1(r) {
        const a = r.int(2, 9), b = r.int(2, 9), pa = r.int(1, 2), pb = r.int(1, 2);
        return mulDec(ds(a, pa), ds(b, pb));
      },
      // 2けたの小数・0が消える
      s2(r) {
        const a = r.int(11, 99), b = r.int(2, 9), pa = r.int(1, 2), pb = r.int(1, 2);
        if (a % 10 === 0) return null;
        return r.chance(0.5) ? mulDec(ds(a, pa), ds(b, pb)) : mulDec(ds(b, pb), ds(a, pa));
      },
      // ことばの問題（面積・重さ）
      s3(r) {
        const a = ds(r.int(2, 9), 1), b = ds(r.int(11, 39), 1);
        if (!b.includes('.')) return null;
        const x = F.mul(fd(a), fd(b)), [n1, k1] = dp(a), [n2, k2] = dp(b);
        const easy = `${$(`${n1}${T}${n2}=${n1 * n2}`)}、${k1 + k2}けた → ${$(dec(x))}`;
        if (r.chance(0.5)) return { q: `たて ${$(a + '\\,\\mathrm{m}')}、よこ ${$(b + '\\,\\mathrm{m}')} の《長方形|ちょう|ほう|けい》の《面積|めん|せき》は □ ${$('\\mathrm{m}^{2}')}`, a: $(dec(x)), easy, easyCheck: false, verify: () => F.eq(fd(dec(x)), F.mul(fd(a), fd(b))) || 'ちがう' };
        return { q: `1 m あたり ${$(a + '\\,\\mathrm{kg}')} の《棒|ぼう》、${$(b + '\\,\\mathrm{m}')} の《重|おも》さは □ kg`, a: $(dec(x)), easy, easyCheck: false, verify: () => F.eq(fd(dec(x)), F.mul(fd(a), fd(b))) || 'ちがう' };
      },
      // わな：たし算
      trap(r) {
        const a = ds(r.int(1, 9), 1), b = ds(r.int(1, 9), 2);
        const x = F.add(fd(a), fd(b));
        return dest({ q: $(r.chance(0.5) ? `${a}+${b}` : `${b}+${a}`), a: $(dec(x)), key: kk('+', a, b) }, '2-26', `たし《算|ざん》は《位|くらい》をそろえる：${$(`${a}+${b}=${dec(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-27
  M.add({
    id: '2-27', part: PART, chap: '2-4', stars: 1,
    title: `${SHO}のわり《算|ざん》は《両方|りょう|ほう》を10《倍|ばい》・100《倍|ばい》`,
    mark: `**わる《数|かず》が${SHO}**。`,
    futsu: ['$4.8\\div0.06$ を、《分数|ぶん|すう》にして', '$\\frac{48}{10}\\times\\frac{100}{6}$ とする。'],
    raku: ['わる《数|かず》が' + SEI + 'になるように、《両方|りょう|ほう》を100《倍|ばい》', '$4.8\\div0.06=480\\div6=80$'],
    why: `わられる《数|かず》とわる《数|かず》に《同|おな》じ《数|かず》をかけても、《答|こた》えは《変|か》わらない（${KS} 2-4⑦）。わる《数|かず》を${SEI}にすればよい。`,
    caution: `わる《数|かず》が${SEI}なら、10《倍|ばい》しなくてよい（$4.8\\div6$）。`,
    counts: { s1: 10, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 3, s2: 3, s3: 1, trap: 3 },
    boxw: '16mm',
    fits(q) { const e = parse(q); return !!e && e.t.length === 2 && e.o[0] === '/' && e.t[1].k === 'dec' && e.t[0].k !== 'frac' && e.t[0].k !== 'mixed'; },
    steps: {
      // 答えが整数
      s1(r) {
        const k = r.int(2, 9), p = r.int(1, 2), Q = r.int(2, 90);
        const n = Q * k, A = ds(n, p), B = ds(k, p);
        if ((n % 10 === 0 && p === 1) || Q % 10 === 0) return null;
        const pp = Math.pow(10, p);
        return { q: $(`${A}${D}${B}`), a: $(Q), easy: $(`${ds(n * pp, p)}${D}${k}=${Q}`) };
      },
      // わる数が2けた・答えが小数
      s2(r) {
        const k = r.int(11, 25), q10 = r.int(2, 9), p = r.chance(0.5) ? 1 : 2;
        if (k % 10 === 0) return null;
        const B = ds(k, 1), A = ds(k * q10, p);
        const x = F.div(fd(A), fd(B));
        return { q: $(`${A}${D}${B}`), a: $(dec(x)), easy: $(`${ds(k * q10 * 10, p)}${D}${k}=${dec(x)}`) };
      },
      // ことばの問題
      s3(r) {
        const k = r.int(2, 9), Q = r.int(3, 12), L = ds(k * Q, 1), B = ds(k, 1);
        if ((k * Q) % 10 === 0) return null;
        if (r.chance(0.5)) return { q: `${$(L + '\\,\\mathrm{m}')} のリボンを、${$(B + '\\,\\mathrm{m}')} ずつ《切|き》ると □ 《本|ほん》`, a: $(Q), easy: $(`${k * Q}${D}${k}=${Q}`) };
        return { q: `${$(L + '\\,\\mathrm{L}')} の《水|みず》を、${$(B + '\\,\\mathrm{L}')} ずつ《分|わ》けると □ 《本|ほん》`, a: $(Q), easy: $(`${k * Q}${D}${k}=${Q}`) };
      },
      // わな：わる数が整数
      trap(r) {
        const k = r.pick([3, 4, 6, 7, 8, 9]), Q = r.int(2, 30), A = ds(k * Q, 1);
        if (Q % 10 === 0 || (k * Q) % 10 === 0) return null;
        return dest({ q: $(`${A}${D}${k}`), a: $(ds(Q, 1)) }, '2-27', `わる《数|かず》が${SEI}。そのままわる：${$(`${A}${D}${k}=${ds(Q, 1)}`)}`);
      },
    },
  });

  // ================================================================ 2-28
  const LT = '$<$', GT = '$>$', CMPQ = `（${GT} か ${LT}）`;
  const cmpA = (x, y) => (F.val(x) < F.val(y) ? LT : GT);
  const DS28 = ['0.9', '0.8', '0.5', '0.99', '0.75', '0.6', '0.95', '0.4'];
  M.add({
    id: '2-28', part: PART, chap: '2-4', stars: 1,
    title: `1より《小|ちい》さい《数|かず》をかけると《小|ちい》さく、わると《大|おお》きく`,
    mark: `**0と1のあいだの《数|かず》**をかける・わる。《計算|けい|さん》しないで《大小|だい|しょう》を《決|き》める。□には $>$ か $<$。`,
    futsu: ['$120\\times0.9=108$', '$120\\div0.9=133.3\\cdots$', 'と《計算|けい|さん》してからくらべる。'],
    raku: ['0.9は1より《小|ちい》さい。', 'かけると120より《小|ちい》さく、', 'わると120より《大|おお》きい。'],
    why: `1あたり×いくつ《分|ぶん》で、いくつ《分|ぶん》が1より《小|ちい》さければ、1あたりより《少|すく》ない。わるのは${GS}（1より《大|おお》きい）をかけること（${KS} 2-4⑧）。`,
    caution: '1より《大|おお》きい《数|かず》でわると、《小|ちい》さくなる（$120\\div1.5$）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '10mm', s2: '10mm', s3: '20mm', trap: '10mm' },
    fits(q) {
      if (/は1より □$/.test(q)) return true;
      if (!q.endsWith('（$>$ か $<$）')) return false;
      return /\$\d+(?:\\times|\\div)(?:0\.\d+|\\frac\{(\d+)\}\{(\d+)\})\$/.test(q) && !/\\frac\{(\d+)\}\{(\d+)\}/.test(q.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, (s, a, b) => (+a < +b ? '' : s)));
    },
    steps: {
      s1(r) {
        const N = r.int(2, 99) * r.pick([1, 10]), s = r.pick(DS28), mul = r.chance(0.5);
        const v = mul ? F.mul(F.make(N), fd(s)) : F.div(F.make(N), fd(s)), a = cmpA(v, F.make(N));
        return { q: `${$(`${N}${mul ? T : D}${s}`)} □ ${$(N)}${CMPQ}`, a,
          easy: `（${s}は1より《小|ちい》さい。${mul ? 'かけると《小|ちい》さく' : 'わると《大|おお》きく'}なる）`,
          verify: () => (a === (mul ? LT : GT)) || '大小がちがう' };
      },
      // かけるのとわるのをくらべる・分数
      s2(r) {
        const N = r.int(12, 99) * r.pick([1, 10]);
        if (r.chance(0.5)) {
          const s = r.pick(DS28), v1 = F.mul(F.make(N), fd(s)), v2 = F.div(F.make(N), fd(s)), sw = r.chance(0.5);
          const a = sw ? cmpA(v2, v1) : cmpA(v1, v2);
          const L = `${N}${T}${s}`, R = `${N}${D}${s}`;
          return { q: `${$(sw ? R : L)} □ ${$(sw ? L : R)}${CMPQ}`, a, easy: `（かけると${N}より《小|ちい》さく、わると${N}より《大|おお》きい）`, verify: () => (a === (sw ? GT : LT)) || '大小がちがう' };
        }
        const w = F.make(r.int(1, 8), r.int(2, 9));
        if (w[0] >= w[1]) return null;
        const mul = r.chance(0.5), v = mul ? F.mul(F.make(N), w) : F.div(F.make(N), w), a = cmpA(v, F.make(N));
        return { q: `${$(`${N}${mul ? T : D}${tf(w)}`)} □ ${$(N)}${CMPQ}`, a,
          easy: `（${$(tf(w))} は1より《小|ちい》さい。${mul ? 'かけると《小|ちい》さく' : 'わると《大|おお》きく'}なる）`, verify: () => (a === (mul ? LT : GT)) || '大小がちがう' };
      },
      // □にあてはまる数は1より大きいか
      s3(r) {
        const s = r.pick(['0.8', '0.5', '0.75', '0.6', '0.4', '1.2', '1.5', '2.5', '1.25']), k = fd(s), mul = r.chance(0.5);
        const N = r.int(3, 30) * (mul ? k[1] : k[0]);
        const R = mul ? F.mul(F.make(N), k) : F.div(F.make(N), k);
        if (R[1] !== 1) return null;
        const small = F.val(k) < 1, a = small ? `《小|ちい》さい` : `《大|おお》きい`;
        const q = mul ? `${$(`${N}${T}\\square=${R[0]}`)} の ${$('\\square')} は1より □` : `${$(`${N}${D}\\square=${R[0]}`)} の ${$('\\square')} は1より □`;
        const ok = mul ? (R[0] < N) : (R[0] > N);
        return { q, a, easy: `（${R[0]}は${N}より${R[0] < N ? '《小|ちい》さい' : '《大|おお》きい'}。${$('\\square')} は ${$(s)}）`,
          verify: () => (ok === small && (a === '《小|ちい》さい') === small && F.eq(mul ? F.div(R, F.make(N)) : F.div(F.make(N), R), k)) || '大小がちがう' };
      },
      // わな：1より大きい数でわる・かける
      trap(r) {
        const N = r.int(2, 99) * r.pick([1, 10]), s = r.pick(['1.5', '1.2', '2.5', '1.25', '1.1']), mul = r.chance(0.4);
        const v = mul ? F.mul(F.make(N), fd(s)) : F.div(F.make(N), fd(s)), a = cmpA(v, F.make(N));
        return dest({ q: `${$(`${N}${mul ? T : D}${s}`)} □ ${$(N)}${CMPQ}`, a, verify: () => (a === (mul ? GT : LT)) || '大小がちがう' }, '2-28',
          `${s}は1より《大|おお》きい。${mul ? 'かけると《大|おお》きく' : 'わると《小|ちい》さく'}なる`);
      },
    },
  });

  // ================================================================ 2-90
  M.add({
    id: '2-90', part: PART, chap: '2-4', stars: 2,
    title: `${BS}が1の${BUN}の《和|わ》・《差|さ》は $\\frac{a+b}{ab}$`,
    mark: `**${BS}が1** の${BUN}を2つたす・ひく（$\\frac{1}{3}+\\frac{1}{5}$）。`,
    futsu: ['3と5の《公倍数|こう|ばい|すう》15にそろえて、', '$\\frac{5}{15}+\\frac{3}{15}=\\frac{8}{15}$'],
    raku: [`${BS}は${BB}の《和|わ》、${BB}は${BB}の《積|せき》`, '$\\frac{1}{3}+\\frac{1}{5}=\\frac{3+5}{3\\times5}=\\frac{8}{15}$', '《差|さ》なら《上|うえ》は $5-3$'],
    why: `$\\frac{1}{3}=\\frac{5}{15}$、$\\frac{1}{5}=\\frac{3}{15}$。${BB}をそろえると、${BS}にもう1つの${BB}が《出|で》てくる。《並列|へい|れつ》の《抵抗|てい|こう》で《使|つか》う（${KS} 2-4）。`,
    caution: `${BS}が1でないときは、ふつうに${TB}する。${BB}に${KYO}の《約数|やく|すう》があると、あとで${YB}がいる。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    fits(q) {
      if (/並列/.test(q)) return true;
      const e = fracSum(q);
      return !!e && e.t.length === 2 && e.t.every(x => x.n === 1) && e.t[0].d !== e.t[1].d;
    },
    steps: {
      // 共通の約数のない分母の和
      s1(r) {
        const a = r.int(2, 9), b = r.int(a + 1, 13);
        if (gcd(a, b) !== 1) return null;
        const x = F.make(a + b, a * b), sw = r.chance(0.5);
        return { q: $(sw ? `${fr(1, b)}+${fr(1, a)}` : `${fr(1, a)}+${fr(1, b)}`), a: $(tf(x)), easy: $(`${fr(`${a}+${b}`, `${a}${T}${b}`)}=${tf(x)}`), key: kk('+', a, b) };
      },
      // 差・共通の約数がある分母（約分する）
      s2(r) {
        const a = r.int(2, 9), b = r.int(a + 1, 15);
        if (r.chance(0.5)) {
          if (gcd(a, b) !== 1) return null;
          const x = F.make(b - a, a * b);
          return { q: $(`${fr(1, a)}-${fr(1, b)}`), a: $(tf(x)), easy: $(`${fr(`${b}-${a}`, `${a}${T}${b}`)}=${tf(x)}`) };
        }
        if (gcd(a, b) === 1 || a * b > 120) return null;
        const x = F.make(a + b, a * b);
        return { q: $(`${fr(1, a)}+${fr(1, b)}`), a: $(tf(x)), easy: $(`${fr(`${a}+${b}`, `${a}${T}${b}`)}=${fr(a + b, a * b)}=${tf(x)}`), key: kk('+', a, b) };
      },
      // 並列の抵抗（教科書 2-4 のコラム）
      s3(r) {
        const a = r.int(2, 6), b = r.int(a + 1, 12);
        if (a * b > 60) return null;
        const pre = `1 V の《電池|でん|ち》に ${$(a + '\\,\\Omega')} と ${$(b + '\\,\\Omega')} を《並列|へい|れつ》に。`;
        if (r.chance(0.5)) {
          const x = F.make(a + b, a * b);
          return { q: `${pre}《電流|でん|りゅう》は ${$(`${fr(1, a)}+${fr(1, b)}=□`)} A`, a: $(tf(x)), easy: $(`${fr(`${a}+${b}`, `${a}${T}${b}`)}=${tf(x)}`) };
        }
        const x = F.make(a * b, a + b);
        return { q: `${pre}まとめた《抵抗|てい|こう》は □ ${$('\\Omega')}`, a: $(tf(x)), easy: `《電流|でん|りゅう》 ${$(fr(`${a}+${b}`, `${a}${T}${b}`))} の${GS}：${$(`${fr(`${a}${T}${b}`, `${a}+${b}`)}=${tf(x)}`)}`, easyCheck: false,
          verify: () => F.eq(F.div(F.make(1), F.add(F.make(1, a), F.make(1, b))), x) || 'まとめた抵抗がちがう' };
      },
      // わな：分子が1でない
      trap(r) {
        const a = r.int(2, 7), b = r.int(a + 1, 9), c = r.int(2, b - 1);
        if (gcd(a, b) !== 1 || gcd(c, b) !== 1) return null;
        const x = F.add(F.make(1, a), F.make(c, b)), L = a * b;
        return dest({ q: $(`${fr(1, a)}+${fr(c, b)}`), a: $(tf(x)) }, '2-90', `${BS}が1でない。ふつうに${TB}：${$(`${toL(1, a, L)}+${toL(c, b, L)}=${tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-91
  M.add({
    id: '2-91', part: PART, chap: '2-4', stars: 1,
    title: `${BB}が《同|おな》じ${BUN}のわり《算|ざん》は${BS}どうし`,
    mark: `**${BB}が《同|おな》じ** ${BUN}どうしのわり《算|ざん》。`,
    futsu: ['$\\frac{5}{7}\\div\\frac{2}{7}=\\frac{5}{7}\\times\\frac{7}{2}$', '$=\\frac{35}{14}$、7で' + YB + 'して $\\frac{5}{2}$'],
    raku: [`${BB}が《同|おな》じなので、${BS}どうしでわる。`, '$\\frac{5}{7}\\div\\frac{2}{7}=5\\div2=\\frac{5}{2}$'],
    why: `$\\frac{1}{7}$ を1《切|き》れとすると、5《切|き》れ÷2《切|き》れ。《同|おな》じ${'《単位|たん|い》'}どうしなので、《切|き》れの《数|かず》でわれる（${KS} 2-4 もっと）。`,
    caution: `${BB}がちがうときは、${GS}をかける（わざ 2-19）。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '12mm',
    fits(q) { const e = parse(q); return !!e && e.t.length === 2 && e.o[0] === '/' && e.t.every(x => x.k === 'frac') && e.t[0].d === e.t[1].d; },
    steps: {
      s1(r) {
        const d = r.int(3, 13), a = r.int(1, d - 1), b = r.int(1, d - 1);
        if (a === b || b < 2 || gcd(a, d) !== 1 || gcd(b, d) !== 1) return null;
        const x = F.make(a, b);
        return { q: $(`${fr(a, d)}${D}${fr(b, d)}`), a: $(tf(x)), easy: $(`${a}${D}${b}=${tf(x)}`) };
      },
      // そろえるとそろう（整数÷分数、分母が倍数）
      s2(r) {
        if (r.chance(0.5)) {
          const n = r.int(2, 6), d = r.int(2, 9), c = pfrac(r, d) || r.int(d + 1, 2 * d);
          if (gcd(c, d) !== 1 || c < 2) return null;
          const x = F.make(n * d, c);
          return { q: $(`${n}${D}${fr(c, d)}`), a: $(tf(x)), easy: $(`${fr(n * d, d)}${D}${fr(c, d)}=${n * d}${D}${c}=${tf(x)}`) };
        }
        const d = r.int(2, 5), k = r.int(2, 3), D2 = d * k, a = pfrac(r, d), c = pfrac(r, D2);
        if (!a || !c || c < 2) return null;
        const x = F.div(F.make(a, d), F.make(c, D2));
        return { q: $(`${fr(a, d)}${D}${fr(c, D2)}`), a: $(tf(x)), easy: $(`${toL(a, d, D2)}${D}${fr(c, D2)}=${a * k}${D}${c}=${tf(x)}`) };
      },
      // ことばの問題
      s3(r) {
        const d = r.int(5, 13), b = r.int(1, 3), k = r.int(2, 6), a = b * k;
        if (a >= d * 2 || a === d || gcd(b, d) !== 1 || gcd(a, d) !== 1) return null;
        if (r.chance(0.5)) return { q: `${$(fr(a, d) + '\\,\\mathrm{m}')} のリボンから、${$(fr(b, d) + '\\,\\mathrm{m}')} のリボンは □ 《本|ほん》とれる`, a: $(k), easy: $(`${a}${D}${b}=${k}`) };
        const e = r.int(1, d - 1);
        if (gcd(e, d) !== 1 || e === b || e % b === 0) return null;
        const x = F.make(e, b);
        return { q: `${$(fr(e, d) + '\\,\\mathrm{L}')} は、${$(fr(b, d) + '\\,\\mathrm{L}')} の □ 《倍|ばい》`, a: $(tf(x)), easy: $(`${e}${D}${b}=${tf(x)}`) };
      },
      // わな：分母がちがう（2-19 で）
      trap(r) {
        const b = r.int(2, 9), d = r.int(2, 9), a = pfrac(r, b), c = pfrac(r, d);
        if (!a || !c || b === d || gcd(b, d) !== 1) return null;
        const x = F.div(F.make(a, b), F.make(c, d));
        return dest({ q: $(`${fr(a, b)}${D}${fr(c, d)}`), a: $(tf(x)) }, '2-91', `${BB}がちがう。${GS}をかける：${$(`${fr(a, b)}${T}${fr(d, c)}=${tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-92
  // 帯分数の答え（val は仮分数、verify は式読みで確かめる）
  const mixAns = (q, x) => { const a = $(x[0] > x[1] && x[1] > 1 ? tm(x) : tf(x)); return { q, a, val: $(tf(x)), verify: vq(q, a) }; };
  M.add({
    id: '2-92', part: PART, chap: '2-4', stars: 2,
    title: `${TAI}のたし《算|ざん》・ひき《算|ざん》は《整数|せい|すう》と${BUN}に《分|わ》ける`,
    mark: `**${TAI}**のたし《算|ざん》・ひき《算|ざん》。1から${BUN}をひく。`,
    futsu: [`${KA}にして、$\\frac{13}{4}+\\frac{6}{4}=\\frac{19}{4}$`, 'もう《一度|いち|ど》' + TAI + 'にもどす。'],
    raku: ['$3\\frac{1}{4}+1\\frac{2}{4}=(3+1)+\\frac{3}{4}$', '$1-\\frac{3}{8}=\\frac{8}{8}-\\frac{3}{8}=\\frac{5}{8}$'],
    why: `${TAI}は《整数|せい|すう》と${BUN}の《和|わ》。たし《算|ざん》・ひき《算|ざん》は、たす《順番|じゅん|ばん》を《変|か》えてよいので、《整数|せい|すう》どうし・${BUN}どうしでできる（${KS} 2-4①③）。`,
    caution: `${BUN}の《部分|ぶ|ぶん》がひけないときは、《整数|せい|すう》から1をかりる。かけ《算|ざん》・わり《算|ざん》は《分|わ》けられない（わざ 2-20）。`,
    // 「（帯分数で）」が入るので、欄は少しせまく
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '15mm', s2: '15mm', s3: '20mm', trap: '15mm' }, boxh: '12mm',
    fits(q) {
      const e = parse(q);
      if (!e || !e.o.every(o => o === '+' || o === '-')) return false;
      return e.t.some(x => x.k === 'mixed') || (e.t.some(x => x.k === 'int') && e.t.some(x => x.k === 'frac'));
    },
    steps: {
      // くり上がらないたし算
      s1(r) {
        const d = r.int(3, 9), w1 = r.int(1, 5), w2 = r.int(1, 4), n1 = pfrac(r, d), n2 = pfrac(r, d);
        if (!n1 || !n2 || n1 + n2 >= d) return null;
        const x = F.make((w1 + w2) * d + n1 + n2, d), fp = F.make(n1 + n2, d);
        const q = $(`${mix(w1, n1, d)}+${mix(w2, n2, d)}=□`) + TAIDE;
        return Object.assign(mixAns(q, x), { easy: $(`${w1 + w2}+${fr(n1 + n2, d)}${fp[1] === d ? '' : '=' + (w1 + w2) + '+' + tf(fp)}`), key: kk('+', mix(w1, n1, d), mix(w2, n2, d)) });
      },
      // くり上がる・くり下がる・1から（整数から）ひく
      s2(r) {
        const c = r.int(0, 2), d = r.int(3, 9);
        if (c === 0) {
          const w1 = r.int(1, 4), w2 = r.int(1, 3), n1 = pfrac(r, d), n2 = pfrac(r, d);
          if (!n1 || !n2 || n1 + n2 <= d) return null;
          const x = F.make((w1 + w2) * d + n1 + n2, d);
          const q = $(`${mix(w1, n1, d)}+${mix(w2, n2, d)}=□`) + TAIDE;
          return Object.assign(mixAns(q, x), { easy: $(`${w1 + w2}+${fr(n1 + n2, d)}=${w1 + w2 + 1}+${tf(F.make(n1 + n2 - d, d))}`), key: kk('+', mix(w1, n1, d), mix(w2, n2, d)) });
        }
        if (c === 1) {
          const w1 = r.int(2, 5), w2 = r.int(1, w1 - 1), n1 = pfrac(r, d), n2 = pfrac(r, d);
          if (!n1 || !n2 || n1 >= n2) return null;
          const x = F.make((w1 - w2) * d + n1 - n2, d);
          const q = $(`${mix(w1, n1, d)}-${mix(w2, n2, d)}=□`) + (x[0] > x[1] && x[1] > 1 ? TAIDE : '');
          return Object.assign(mixAns(q, x), { easy: $(`${w1 - 1}+${fr(n1 + d, d)}-${w2}-${fr(n2, d)}=${w1 - 1 - w2}+${tf(F.make(n1 + d - n2, d))}`) });
        }
        const W = r.int(1, 4), n = pfrac(r, d), w2 = W > 1 && r.chance(0.5) ? r.int(1, W - 1) : 0;
        if (!n) return null;
        const x = F.make((W - w2) * d - n, d);
        const q = $(`${W}-${w2 ? mix(w2, n, d) : fr(n, d)}=□`) + (x[0] > x[1] && x[1] > 1 ? TAIDE : '');
        return Object.assign(mixAns(q, x), { easy: $(`${W > 1 ? (W - 1) + '+' : ''}${fr(d, d)}-${w2 ? w2 + '-' : ''}${fr(n, d)}=${W - 1 - w2 ? (W - 1 - w2) + '+' : ''}${fr(d - n, d)}`) });
      },
      // ことばの問題（分母が倍数）
      s3(r) {
        const d1 = r.pick([2, 3, 4]), k = 2, d2 = d1 * k, w1 = r.int(1, 4), w2 = r.int(1, 3), n1 = pfrac(r, d1), n2 = pfrac(r, d2);
        if (!n1 || !n2) return null;
        const v1 = F.add(F.make(w1), F.make(n1, d1)), v2 = F.add(F.make(w2), F.make(n2, d2));
        if (r.chance(0.5)) {
          const x = F.add(v1, v2), fp = F.add(F.make(n1, d1), F.make(n2, d2));
          const a = $(x[1] > 1 ? tm(x) : tf(x));
          const carry = fp[0] > fp[1] ? `=${w1 + w2 + 1}+${tf(F.sub(fp, F.make(1)))}` : '';
          return { q: `《砂|すな》が ${$(mix(w1, n1, d1) + '\\,\\mathrm{kg}')} と ${$(mix(w2, n2, d2) + '\\,\\mathrm{kg}')} ある。あわせて □ kg${TAIDE}`, a, val: $(tf(x)),
            easy: $(`${w1 + w2}+${toL(n1, d1, d2)}+${fr(n2, d2)}=${w1 + w2}+${tf(fp)}${carry}`), verify: () => F.eq(evalA(a), F.add(v1, v2)) || 'ちがう' };
        }
        if (w1 <= w2 || n1 * k < n2) return null;
        const x = F.sub(v1, v2), fp = F.sub(F.make(n1, d1), F.make(n2, d2));
        const a = $(x[0] > x[1] && x[1] > 1 ? tm(x) : tf(x));
        return { q: `ジュースが ${$(mix(w1, n1, d1) + '\\,\\mathrm{L}')} ある。${$(mix(w2, n2, d2) + '\\,\\mathrm{L}')} 《飲|の》むと、のこりは □ L${x[0] > x[1] && x[1] > 1 ? TAIDE : ''}`, a, val: $(tf(x)),
          easy: $(`${w1 - w2}+${toL(n1, d1, d2)}-${fr(n2, d2)}=${w1 - w2}+${tf(fp)}`), verify: () => F.eq(evalA(a), F.sub(v1, v2)) || 'ちがう' };
      },
      // わな：帯分数のかけ算は分けられない（2-20 で）
      trap(r) {
        const m1 = mixR(r, 3, 6), m2 = mixR(r, 2, 6);
        if (!m1 || !m2) return null;
        const x = F.mul(m1[3], m2[3]);
        if (x[1] > 12 || x[1] === 1) return null;
        const q = $(`${mixT(m1)}${T}${mixT(m2)}=□`) + TAIDE;
        const p = mixAns(q, x);
        p.key = kk('x', mixT(m1), mixT(m2));
        return dest(p, '2-92', `かけ《算|ざん》は${KA}にする：${$(`${tf(m1[3])}${T}${tf(m2[3])}=${tf(x)}`)}`);
      },
    },
  });

  // ================================================================ 2-93
  M.add({
    id: '2-93', part: PART, chap: '2-4', stars: 2,
    title: '÷5は×2÷10、÷25は×4÷100',
    mark: '**÷5・÷25・÷50** でわる。',
    futsu: ['$370\\div5$ を《筆算|ひっ|さん》でする。', '37÷5＝7あまり2、…と《計算|けい|さん》する。'],
    raku: ['わる《数|かず》とわられる《数|かず》を2《倍|ばい》', '$370\\div5=740\\div10=74$', '÷25は4《倍|ばい》して $\\div100$'],
    why: `わられる《数|かず》とわる《数|かず》に《同|おな》じ《数|かず》をかけても《答|こた》えは《変|か》わらない。$5\\times2=10$、$25\\times4=100$ にして、わり《算|ざん》を《小数点|しょう|すう|てん》の《移動|い|どう》にする。`,
    caution: 'わる《数|かず》が5や25（50・500）でなければ《使|つか》えない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 3, s2: 3, s3: 1, trap: 3 },
    boxw: '16mm',
    fits(q) {
      const e = parse(q);
      return !!e && e.t.length === 2 && e.o[0] === '/' && e.t[1].k === 'int' && [5, 25, 50, 500].includes(e.t[1].n) && e.t[0].k !== 'frac' && e.t[0].k !== 'mixed';
    },
    steps: {
      s1(r) {
        const t = r.int(11, 199), N = 5 * t;
        if (N % 10 === 0) return null;
        return { q: $(`${N}${D}5`), a: $(t), easy: $(`${2 * N}${D}10=${t}`) };
      },
      // ÷25・÷50・答えが小数
      s2(r) {
        const c = r.int(0, 2);
        if (c === 0) { const t = r.int(3, 60), N = 25 * t; if (N % 100 === 0) return null; return { q: $(`${N}${D}25`), a: $(t), easy: $(`${4 * N}${D}100=${t}`) }; }
        if (c === 1) { const t = r.int(3, 40), N = 50 * t; if (N % 100 === 0) return null; return { q: $(`${N}${D}50`), a: $(t), easy: $(`${2 * N}${D}100=${t}`) }; }
        const N = r.int(11, 99);
        if (N % 5 === 0) return null;
        const x = F.make(N, 5);
        return { q: $(`${N}${D}5`), a: $(dec(x)), easy: $(`${2 * N}${D}10=${dec(x)}`) };
      },
      // ÷500・ことばの問題
      s3(r) {
        const c = r.int(0, 2);
        if (c === 0) { const n = r.int(11, 99) * 100; if (n % 500 === 0) return null; const x = F.make(n, 500); return { q: $(`${n}${D}500`), a: $(dec(x)), easy: $(`${2 * n}${D}1000=${dec(x)}`) }; }
        if (c === 1) { const t = r.int(21, 199), N = 5 * t; if (N % 10 === 0) return null; return { q: `${N}《円|えん》を5《人|にん》で《同|おな》じに《分|わ》けると、1《人分|にん|ぶん》は □ 《円|えん》`, a: $(t), easy: $(`${2 * N}${D}10=${t}`) }; }
        const t = r.int(6, 40), N = 25 * t;
        if (N % 100 === 0) return null;
        return { q: `${$(N + '\\,\\mathrm{cm}')} のテープを、${$('25\\,\\mathrm{cm}')} ずつ《切|き》ると □ 《本|ほん》`, a: $(t), easy: $(`${4 * N}${D}100=${t}`) };
      },
      // わな：わる数が5や25ではない
      trap(r) {
        const k = r.pick([4, 6, 8, 15, 12]), t = r.int(11, 60), N = k * t;
        return dest({ q: $(`${N}${D}${k}`), a: $(t) }, '2-93', `わる《数|かず》が5や25ではない：${$(`${N}${D}${k}=${t}`)}`);
      },
    },
  });
})(globalThis.MONDAI);
