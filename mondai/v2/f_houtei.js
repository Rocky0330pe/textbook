/* 問題集 第2巻　第6部 比例・方程式・コンピュータの数（わざ 2-74〜2-89、2-99）　組 f
 * 書き方は v2/README.md（わざの形は v1/README.md）。文は教科書 第2巻と同じ、ルビつき・分かち書きなし。式は $…$、コードは `…`。
 * 答えが式1つでないもの（方程式の解・2進数・16進数・ことば）と、表計算・プログラムの結果は、verify で確かめる
 *   （方程式は解をもとの式に入れる、進数は計算し直す、表計算とプログラムは JS でまねして計算する）。
 * 第29回 H-1：わなは同じ部のほかのわざで楽にならないものにする。当たるときは楽な形に行き先を書いて also に入れる（dest）。 */
(function (M) {
  'use strict';
  const F = M.F;
  const T = String.raw;          // TeX の \ をそのまま書くため
  const CM = ',\\ ';             // 式の中の「、」（$1,\ 2,\ 3$）
  const PART = 6;

  // ---------------------------------------------------------------- 数の部品
  // 分数 [分子, 分母] を、終わる小数なら小数の文字に（'0.375'）。終わらなければ null
  function dstr(f) {
    const [n, d] = f;
    let t = d;
    while (t % 2 === 0) t /= 2;
    while (t % 5 === 0) t /= 5;
    if (t !== 1) return null;
    let p = 0;
    while (Math.pow(10, p) % d !== 0) p++;
    let s = String(Math.abs(n) * (Math.pow(10, p) / d));
    if (p) { s = s.padStart(p + 1, '0'); s = s.slice(0, -p) + '.' + s.slice(-p); }
    return (n < 0 ? '-' : '') + s;
  }
  const nf = f => dstr(f) || F.tex(f);                          // 数の TeX（小数か分数）
  const fr = x => (Array.isArray(x) ? x : F.make(x));             // 整数も分数に
  const tenth = n => dstr(F.make(n, 10));                         // 12 → '1.2'
  const hund = n => dstr(F.make(n, 100));                         // 25 → '0.25'
  // 1つの項（符号なし）。mode 'f' は分数の形（\frac{2x}{3}）、ほかは整数・小数（0.3x）
  function tm(c, v, mode) {
    const a = [Math.abs(c[0]), c[1]];
    if (!v) return mode === 'f' && a[1] !== 1 ? T`\frac{${a[0]}}{${a[1]}}` : nf(a);
    if (a[1] === 1) return (a[0] === 1 ? '' : a[0]) + v;
    if (mode === 'f' || dstr(a) === null) return T`\frac{${a[0] === 1 ? '' : a[0]}${v}}{${a[1]}}`;
    return dstr(a) + v;
  }
  // 項の列 [[係数, 文字, 形]] を式に（係数0の項は書かない。1x は x）
  function poly(terms) {
    let out = '';
    for (const [c0, v, mode] of terms) {
      const c = fr(c0);
      if (c[0] === 0) continue;
      const s = tm(c, v, mode);
      out += c[0] < 0 ? '-' + s : (out ? '+' : '') + s;
    }
    return out || '0';
  }
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  // 方程式（TeX）に解を入れて、両辺が等しいか（verify）
  function holds(eq, v, val) {
    const [L, R] = eq.split('=');
    const l = M.evalMath(L, { [v]: val }), r = M.evalMath(R, { [v]: val });
    return close(l, r) ? true : `${eq} に ${v}=${val} を入れると ${l} と ${r}`;
  }
  // 方程式の問題の文（答えの欄は「x ＝ □」）
  const solveQ = (eq, v) => `$${eq}$ を《解|と》くと $${v || 'x'}=□$`;
  const same = (got, want, what) => (got === want ? true : `${what || ''}${got} と ${want} がちがう`);
  // 2進数・16進数の TeX
  const bin = n => n.toString(2);
  const hx = n => n.toString(16).toUpperCase();
  const B2 = s => `${s}_{(2)}`;
  const H16 = s => (/[A-F]/.test(s) ? T`\mathrm{${s}}` : s) + '_{(16)}';
  const isPow2 = n => n > 0 && (n & (n - 1)) === 0;
  const ones = n => bin(n).split('').filter(c => c === '1').length;
  // 2進数の位の値の和（1011 → 8+2+1）
  const placeSum = n => bin(n).split('').map((c, i, a) => (c === '1' ? Math.pow(2, a.length - 1 - i) : 0)).filter(x => x).join('+');
  // 「分」の読み（3分＝さんぷん、5分＝ごふん）
  const fun = n => (/[134680]$/.test(String(n)) ? '《分|ぷん》' : '《分|ふん》');
  const funGo = n => (/[134680]$/.test(String(n)) ? '《分後|ぷん|ご》' : '《分後|ふん|ご》');
  // 約数（1と自分をふくむ）
  const divisors = n => { const o = []; for (let i = 1; i <= n; i++) if (n % i === 0) o.push(i); return o; };
  const pick3 = (r, arr) => { const b = r.shuffle(arr).slice(0, 3); return b.length === 3 ? b.sort((x, y) => x - y) : null; };

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 式の中の数のならび（$x=1,\ 2,\ 3$、$0.5,\ 1,\ 1.5\,\mathrm{N}$）。□ もふくむ
  const numOf = s => { const t = s.trim(); if (t === '□') return '□'; return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : NaN; };
  function lists(q) {
    return (q.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1).replace(/^[a-zA-Z]=/, '').replace(/\\,\\mathrm\{[^}]*\}$/, ''))
      .filter(t => t.includes(',')).map(t => t.split(/,\\ |,/).map(numOf))
      .filter(L => L.length >= 3 && L.every(x => x === '□' || !isNaN(x)));
  }
  // 2つのならびが、比例（y÷x が一定）か反比例（x×y が一定）か
  function tableKind(q) {
    const L = lists(q);
    if (L.length < 2 || L[0].length !== L[1].length) return null;
    const pr = L[0].map((x, i) => [x, L[1][i]]).filter(([x, y]) => x !== '□' && y !== '□' && x !== 0);
    if (pr.length < 2) return null;
    const eq = a => a.every(v => close(v, a[0]));
    if (eq(pr.map(([x, y]) => y / x))) return 'hirei';
    if (eq(pr.map(([x, y]) => x * y))) return 'han';
    return null;
  }
  // 問題の文の中の1次方程式（$…$ の中に = が1つ、文字が1つ）。左辺・右辺の文字の係数
  function linEq(q) {
    const ms = (q.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1))
      .filter(t => (t.match(/=/g) || []).length === 1 && !t.includes('□') && !t.includes('_{') && !t.includes(','));
    for (const t of ms) {
      const vs = M.mathVars(t);
      if (vs.length !== 1) continue;
      const v = vs[0], [L, R] = t.split('=');
      if (/^\s*[a-zA-Z]\s*$/.test(L) && !M.mathVars(R).length) continue;    // x=3 は答えの形
      const f = (s, x) => M.evalMath(s, { [v]: x });
      const l = [0, 1, 2].map(x => f(L, x)), r = [0, 1, 2].map(x => f(R, x));
      if (l.concat(r).some(x => x == null)) continue;
      if (!close(l[2] - 2 * l[1] + l[0], 0) || !close(r[2] - 2 * r[1] + r[0], 0)) continue;
      return { v, src: t, aL: l[1] - l[0], aR: r[1] - r[0] };
    }
    return null;
  }

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
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 2-74
  // 比例・反比例の表（xs と、y の式）
  function table(r, kind) {
    if (kind === 'hirei') {
      const a2 = r.pick([4, 6, 8, 10, 12, 14, 16, 18, 24, 30, 40, 50, 80, 120, 160, 3, 5, 7]);   // a の2倍（3・5・7 は 1.5・2.5・3.5）
      const x0 = a2 % 2 ? r.pick([2, 4]) : r.int(1, 3), st = a2 % 2 ? 2 : 1;
      const xs = [x0, x0 + st, x0 + 2 * st];
      return { a: F.make(a2, 2), xs, ys: xs.map(x => F.mul(F.make(a2, 2), F.make(x))) };
    }
    const a = r.pick([12, 18, 24, 30, 36, 40, 48, 60, 72]);
    const xs = pick3(r, divisors(a).filter(x => x < a));
    if (!xs) return null;
    return { a: F.make(a), xs, ys: xs.map(x => F.make(a, x)) };
  }
  const tex74 = (kind, a) => (kind === 'hirei' ? poly([[a, 'x']]) : T`\frac{${a[0]}}{x}`);
  M.add({
    id: '2-74', part: PART, chap: '2-15', stars: 1,
    title: T`《比例|ひ|れい》は $y\div x$、《反比例|はん|ぴ|れい》は $x\times y$ が《一定|いっ|てい》`,
    mark: T`**$x$ と $y$ の《表|ひょう》**を《見|み》たら、$y\div x$ と $x\times y$ を《計算|けい|さん》してみる。`,
    futsu: ['《表|ひょう》をたてや《横|よこ》に《見|み》て、', 'ふえ《方|かた》・へり《方|かた》を', 'あれこれくらべる。'],
    raku: [T`$(1,\ 80)$、$(2,\ 160)$、$(3,\ 240)$`, T`$y\div x=80$ → 《比例|ひ|れい》 $y=80x$`, T`$(2,\ 12)$、$(3,\ 8)$、$(4,\ 6)$`, T`$x\times y=24$ → 《反比例|はん|ぴ|れい》 $y=\frac{24}{x}$`],
    why: T`$y=ax$ なら $y\div x=a$、$y=\frac{a}{x}$ なら $xy=a$。1つの《数|かず》をくらべれば《見|み》わけられる（《教科書|きょう|か|しょ》2-15）。`,
    caution: T`$y\div x$ も $x\times y$ も《一定|いっ|てい》でなければ、どちらでもない（$y=x+20$ など）。`,
    counts: { s1: 7, s2: 6, s3: 4, trap: 3 },
    cols: 1,
    boxw: { s1: '20mm', trap: '20mm' },
    boxh: { s1: '12mm' },
    fits(q) { return !!tableKind(q); },
    steps: {
      // 表から y の式
      s1(r) {
        const kind = r.chance(0.5) ? 'hirei' : 'han';
        const t = table(r, kind);
        if (!t) return null;
        const ex = tex74(kind, t.a);
        return {
          q: T`$x=${t.xs.join(CM)}$ で $y=${t.ys.map(nf).join(CM)}$。《式|しき》は $y=□$`,
          a: `$${ex}$`,
          easy: kind === 'hirei' ? T`$y\div x=${nf(t.a)}$ で《一定|いっ|てい》（《比例|ひ|れい》）` : T`$x\times y=${nf(t.a)}$ で《一定|いっ|てい》（《反比例|はん|ぴ|れい》）`,
          easyCheck: false,
          verify: () => t.xs.every((x, i) => close(M.evalMath(ex, { x }), F.val(t.ys[i]))) || `${ex} が表と合わない`,
        };
      },
      // 表のあいているところ
      s2(r) {
        const kind = r.chance(0.5) ? 'hirei' : 'han';
        const t = table(r, kind);
        if (!t) return null;
        const k = r.int(1, 2), askX = r.chance(0.3);
        const xs = t.xs.map(String), ys = t.ys.map(nf);
        const ans = askX ? t.xs[k] : t.ys[k];
        if (askX) xs[k] = '□'; else ys[k] = '□';
        const known = kind === 'hirei' ? T`$y\div x=${nf(t.a)}$` : T`$x\times y=${nf(t.a)}$`;
        const how = askX ? (kind === 'hirei' ? T`$${nf(t.ys[k])}\div${nf(t.a)}$` : T`$${nf(t.a)}\div${nf(t.ys[k])}$`)
          : (kind === 'hirei' ? T`$${nf(t.a)}\times${t.xs[k]}$` : T`$${nf(t.a)}\div${t.xs[k]}$`);
        return {
          q: T`$x=${xs.join(CM)}$ で $y=${ys.join(CM)}$`,
          a: `$${nf(fr(ans))}$`,
          easy: `${known} なので ${how}`, easyCheck: false,
          verify: () => {
            const xv = askX ? fr(ans) : F.make(t.xs[k]), yv = askX ? t.ys[k] : fr(ans);
            return (kind === 'hirei' ? F.eq(F.div(yv, xv), t.a) : F.eq(F.mul(xv, yv), t.a)) || 'あいている所の数が合わない';
          },
        };
      },
      // ばね・オームの法則・道のり・長方形・代金
      s3(r) {
        const k = r.int(0, 4);
        let q, ans, easy;
        if (k === 0) {        // ばね定数 F÷x
          const kk = r.pick([20, 25, 40, 50]), c = r.int(1, 2), xs = [1, 2, 3].map(i => F.make(i * c, 100));
          const fs = xs.map(x => F.mul(x, F.make(kk)));
          q = T`のび $x$ が $${xs.map(nf).join(CM)}\,\mathrm{m}$ のとき、《力|ちから》 $F$ が $${fs.map(nf).join(CM)}\,\mathrm{N}$。ばね《定数|てい|すう》 $F\div x$ は □ N/m`;
          ans = F.make(kk); easy = T`$${nf(fs[0])}\div${nf(xs[0])}=${kk}$`;
        } else if (k === 1) { // オームの法則 V÷I
          const R = r.pick([20, 30, 50, 100]), s = r.int(1, 2), vs = [1, 2, 3].map(i => F.make(3 * (i + s - 1), 2));
          const is = vs.map(v => F.div(v, F.make(R)));
          if (is.some(i => !dstr(i))) return null;
          q = T`《電圧|でん|あつ》が $${vs.map(nf).join(CM)}\,\mathrm{V}$ のとき、《電流|でん|りゅう》が $${is.map(nf).join(CM)}\,\mathrm{A}$。《抵抗|てい|こう》 $V\div I$ は □ $\Omega$`;
          ans = F.make(R); easy = T`$${nf(vs[0])}\div${nf(is[0])}=${R}$`;
        } else if (k === 2) { // 道のり x×y
          const D = r.pick([600, 1200, 1800, 2400, 3600]), xs = pick3(r, [2, 3, 4, 5, 6, 8, 10, 12].filter(x => D % x === 0));
          if (!xs) return null;
          q = T`《速|はや》さ $x$ が $${xs.join(CM)}\,\mathrm{m/s}$ のとき、かかる《時間|じ|かん》 $y$ が $${xs.map(x => D / x).join(CM)}\,\mathrm{s}$。《道|みち》のりは □ m`;
          ans = F.make(D); easy = T`$${xs[0]}\times${D / xs[0]}=${D}$`;
        } else if (k === 3) { // 長方形の面積
          const S = r.pick([24, 36, 48, 60, 72]), xs = pick3(r, divisors(S).filter(x => x > 1 && x < S / 1.5));
          if (!xs) return null;
          q = T`《面積|めん|せき》が《同|おな》じ《長方形|ちょう|ほう|けい》で、たてが $${xs.join(CM)}\,\mathrm{cm}$ のとき、よこが $${xs.map(x => S / x).join(CM)}\,\mathrm{cm}$。《面積|めん|せき》は □ $\mathrm{cm}^{2}$`;
          ans = F.make(S); easy = T`$${xs[0]}\times${S / xs[0]}=${S}$`;
        } else {              // 個数と代金
          const p = r.pick([60, 80, 90, 120, 150, 160]), xs = pick3(r, [2, 3, 4, 5, 6]);
          q = T`《個数|こ|すう》が $${xs.join(CM)}$ のとき、《代金|だい|きん》が $${xs.map(x => p * x).join(CM)}$ 《円|えん》。1《個|こ》の《値段|ね|だん》は □ 《円|えん》`;
          ans = F.make(p); easy = T`$${p * xs[0]}\div${xs[0]}=${p}$`;
        }
        const L = lists(M.plain(q));
        return {
          q, a: `$${nf(ans)}$`, easy,
          verify: () => {
            const kind = tableKind(M.plain(q));
            if (!kind) return '表が比例でも反比例でもない';
            // 一定の値：比例は y÷x（オームの法則だけは V÷I で、ならびの前÷後ろ）、反比例は x×y
            const v = kind === 'han' ? L[0][0] * L[1][0] : k === 1 ? L[0][0] / L[1][0] : L[1][0] / L[0][0];
            return close(v, F.val(ans)) || `一定の値 ${v} と答えがちがう`;
          },
        };
      },
      // わな：y=x+20 など（どちらでもない）
      trap(r) {
        const k = r.int(0, 2), x0 = r.int(1, 3), xs = [x0, x0 + 1, x0 + 2];
        const c = k === 1 ? r.int(10, 20) : r.int(3, 30);
        const ex = k === 0 ? `x+${c}` : k === 1 ? `${c}-x` : `2x+${c}`;
        const ys = xs.map(x => M.evalMath(ex, { x }));
        return dest({
          q: T`$x=${xs.join(CM)}$ で $y=${ys.join(CM)}$。《式|しき》は $y=□$`,
          a: `$${ex}$`,
          verify: () => !tableKind(M.plain(T`$x=${xs.join(CM)}$ $y=${ys.join(CM)}$`)) || '比例か反比例になっている',
        }, '2-74', T`$y\div x$ も $x\times y$ も《一定|いっ|てい》でない。《比例|ひ|れい》でも《反比例|はん|ぴ|れい》でもない`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-75
  // 比例の場面（ステップ3）：[文の前半, x の単位, y の単位, x の読み]
  const SC75 = [
    (x1, y1, x2) => T`ばねののびは、おもりの《重|おも》さに《比例|ひ|れい》します。$${x1}\,\mathrm{g}$ で $${y1}\,\mathrm{cm}$ のびるとき、$${x2}\,\mathrm{g}$ では □ cm`,
    (x1, y1, x2) => T`《電流|でん|りゅう》は《電圧|でん|あつ》に《比例|ひ|れい》します。$${x1}\,\mathrm{V}$ で $${y1}\,\mathrm{A}$ のとき、$${x2}\,\mathrm{V}$ では □ A`,
    (x1, y1, x2) => `《水|みず》の《量|りょう》は、《入|い》れる《時間|じ|かん》に《比例|ひ|れい》します。${x1}${fun(x1)}で $${y1}\\,\\mathrm{L}$ のとき、${x2}${fun(x2)}では □ L`,
    (x1, y1, x2) => T`《針金|はり|がね》の《重|おも》さは《長|なが》さに《比例|ひ|れい》します。$${x1}\,\mathrm{m}$ で $${y1}\,\mathrm{g}$ のとき、$${x2}\,\mathrm{m}$ では □ g`,
    (x1, y1, x2) => `《同|おな》じ《速|はや》さで《歩|ある》くと、《道|みち》のりは《時間|じ|かん》に《比例|ひ|れい》します。${x1}${fun(x1)}で $${y1}\\,\\mathrm{m}$ のとき、${x2}${fun(x2)}では □ m`,
  ];
  M.add({
    id: '2-75', part: PART, chap: '2-15', stars: 1,
    title: '《比例|ひ|れい》は「《何倍|なん|ばい》か」で《求|もと》める',
    mark: '**《比例|ひ|れい》する** 2つの《量|りょう》で、《一方|いっ|ぽう》が**《何倍|なん|ばい》**になったかを《見|み》る。',
    futsu: ['3《分|ぷん》で $45\\,\\mathrm{L}$ なら、', '1《分|ぷん》あたり $45\\div3=15$、', '12《分|ふん》では $15\\times12=180$。'],
    raku: ['12《分|ふん》は3《分|ぷん》の4《倍|ばい》。', '《水|みず》も4《倍|ばい》なので', '$45\\times4=180$（L）'],
    why: '《比例|ひ|れい》では、$x$ が2《倍|ばい》、3《倍|ばい》になると $y$ も2《倍|ばい》、3《倍|ばい》になる（《教科書|きょう|か|しょ》2-15）。1あたりを《出|だ》さなくてよい。',
    caution: T`《比例|ひ|れい》でない《関係|かん|けい》（$y=2x+3$ など）では、2《倍|ばい》にならない。`,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    // 「比例」の文で「何倍」（反比例・2乗はのぞく）／ y=ax の式で何倍
    fits(q) {
      if (/反比例|2乗|x\^/.test(q)) return false;
      if (/比例/.test(q) && /とき|では/.test(q)) return true;
      return /\$y=\d*x\$/.test(q) && /倍/.test(q);
    },
    steps: {
      s1(r) {
        const x1 = r.int(2, 6), k = r.int(2, 6), a = r.int(2, 20), y1 = a * x1, x2 = k * x1;
        return {
          q: T`$y$ は $x$ に《比例|ひ|れい》し、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
          a: `$${y1 * k}$`, easy: T`${k}《倍|ばい》なので $${y1}\times${k}=${y1 * k}$`,
          verify: () => same(y1 / x1 * x2, y1 * k),
        };
      },
      // 1.5倍・2.5倍、何分の1
      s2(r) {
        if (r.chance(0.5)) {
          const m = r.pick([F.make(3, 2), F.make(5, 2)]), x1 = 2 * r.int(1, 4), y1 = 2 * r.int(3, 15);
          const x2 = x1 * F.val(m), y2 = y1 * F.val(m);
          return {
            q: T`$y$ は $x$ に《比例|ひ|れい》し、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
            a: `$${y2}$`, easy: T`${dstr(m)}《倍|ばい》なので $${y1}\times${dstr(m)}=${y2}$`,
            verify: () => same(y1 / x1 * x2, y2),
          };
        }
        const k = r.int(2, 5), x2 = r.int(1, 6), y2 = r.int(2, 15), x1 = k * x2, y1 = k * y2;
        return {
          q: T`$y$ は $x$ に《比例|ひ|れい》し、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
          a: `$${y2}$`, easy: T`${k}《分|ぶん》の1なので $${y1}\div${k}=${y2}$`,
          verify: () => same(y1 / x1 * x2, y2),
        };
      },
      // ばね・オームの法則・水・針金・歩く
      s3(r) {
        const k = r.int(0, 4);
        const m = r.pick([F.make(2), F.make(3), F.make(4), F.make(5), F.make(3, 2), F.make(5, 2)]);
        let x1, y1;
        if (k === 0) { x1 = F.make(r.pick([20, 50, 100])); y1 = F.make(r.int(2, 6)); }
        else if (k === 1) { x1 = F.make(3, 2); y1 = F.make(r.pick([3, 6, 15]), 100); }
        else if (k === 2) { x1 = F.make(r.int(1, 4) * 2); y1 = F.make(r.int(3, 12) * 10); }
        else if (k === 3) { x1 = F.make(2 * r.int(1, 3)); y1 = F.make(10 * r.int(2, 8)); }
        else { x1 = F.make(2 * r.int(2, 5)); y1 = F.make(80 * x1[0]); }
        const x2 = F.mul(x1, m), y2 = F.mul(y1, m);
        if (!dstr(x2) || !dstr(y2)) return null;
        return {
          q: SC75[k](nf(x1), nf(y1), nf(x2)),
          a: `$${nf(y2)}$`, easy: T`${nf(m)}《倍|ばい》なので $${nf(y1)}\times${nf(m)}=${nf(y2)}$`,
          verify: () => close(F.val(y1) / F.val(x1) * F.val(x2), F.val(y2)) || '1あたりで計算し直すと合わない',
        };
      },
      // わな：y=2x+3（比例でない）
      trap(r) {
        const a = r.int(2, 5), b = r.int(1, 9), x1 = r.int(1, 3), x2 = 2 * x1;
        const y1 = a * x1 + b, y2 = a * x2 + b;
        return dest({
          q: T`$y=${a}x+${b}$ で、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
          a: `$${y2}$`,
          verify: () => same(M.evalMath(`${a}x+${b}`, { x: x2 }), y2),
        }, '2-75', T`《比例|ひ|れい》でないので2《倍|ばい》の $${2 * y1}$ にはならない。$${a}\times${x2}+${b}=${y2}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-76
  M.add({
    id: '2-76', part: PART, chap: '2-15', stars: 1,
    title: T`《反比例|はん|ぴ|れい》は $k$ 《倍|ばい》で $\frac{1}{k}$ 《倍|ばい》`,
    mark: '**かけて《一定|いっ|てい》**（《道|みち》のりが《同|おな》じ、《面積|めん|せき》が《同|おな》じ）の2つの《量|りょう》で、《一方|いっ|ぽう》が《何倍|なん|ばい》になったかを《見|み》る。',
    futsu: ['《道|みち》のりを $12\\times3=36$ と《出|だ》して、', '$36\\div24=1.5$ と《計算|けい|さん》する。'],
    raku: ['《速|はや》さが $24\\div12=2$ 《倍|ばい》なので、', T`《時間|じ|かん》は $\frac{1}{2}$ 《倍|ばい》。`, '$3\\div2=1.5$（《時間|じ|かん》）'],
    why: T`$xy$ が《一定|いっ|てい》なので、$x$ を $k$ 《倍|ばい》にすると、$y$ は $\frac{1}{k}$ 《倍|ばい》にならないと《積|せき》がかわる（《教科書|きょう|か|しょ》2-15）。`,
    caution: T`《和|わ》が《一定|いっ|てい》（$y=10-x$）は《反比例|はん|ぴ|れい》ではない。`,
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '16mm',
    boxh: { s3: '12mm' },
    fits(q) {
      if (/反比例/.test(q)) return true;
      if (/y=\\frac\{\d+\}\{x\}/.test(q) && /倍/.test(q)) return true;
      return /かかる道を|面積が同じ|同じ量を|かかる水そう/.test(q) && /□/.test(q) && !/比例/.test(q) && !lists(q).length;
    },
    steps: {
      s1(r) {
        const x1 = r.int(2, 6), k = r.int(2, 5), m = r.int(1, 12), x2 = k * x1, y1 = k * m;
        return {
          q: T`$y$ は $x$ に《反比例|はん|ぴ|れい》し、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
          a: `$${m}$`, easy: T`${k}《倍|ばい》なので $${y1}\div${k}=${m}$`,
          verify: () => same(x1 * y1 / x2, m),
        };
      },
      // x が何分の1・1.5倍
      s2(r) {
        if (r.chance(0.7)) {
          const k = r.int(2, 5), x2 = r.int(1, 4), y1 = r.int(2, 12), x1 = k * x2, y2 = y1 * k;
          return {
            q: T`$y$ は $x$ に《反比例|はん|ぴ|れい》し、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
            a: `$${y2}$`, easy: T`${k}《分|ぶん》の1なので $${y1}\times${k}=${y2}$`,
            verify: () => same(x1 * y1 / x2, y2),
          };
        }
        const x1 = 2 * r.int(1, 4), m = r.int(2, 9), x2 = x1 * 3 / 2, y1 = 3 * m;
        return {
          q: T`$y$ は $x$ に《反比例|はん|ぴ|れい》し、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
          a: `$${2 * m}$`, easy: T`1.5《倍|ばい》なので $${y1}\div1.5=${2 * m}$`,
          verify: () => same(x1 * y1 / x2, 2 * m),
        };
      },
      // y は何倍・速さと時間・長方形・分ける・水を入れる
      s3(r) {
        const k = r.int(0, 4);
        if (k === 4) {
          const a = r.pick([12, 24, 36, 48, 60]), kk = r.int(2, 6);
          return {
            q: T`$y=\frac{${a}}{x}$ で、$x$ を${kk}《倍|ばい》にすると、$y$ は □ 《倍|ばい》`,
            a: T`$\frac{1}{${kk}}$`, easy: T`${kk}《倍|ばい》の《逆|ぎゃく》で $\frac{1}{${kk}}$`,
            verify: () => close((a / (3 * kk)) / (a / 3), 1 / kk) || '何倍かが合わない',
          };
        }
        if (k === 0) {
          const v1 = r.pick([4, 6, 8, 10, 12, 15]), t1 = r.int(2, 5), m = r.int(2, 4), v2 = v1 * m, t2 = F.make(t1, m);
          if (!dstr(t2)) return null;
          return {
            q: T`《時速|じ|そく》 $${v1}\,\mathrm{km}$ で${t1}《時間|じ|かん》かかる《道|みち》を、《時速|じ|そく》 $${v2}\,\mathrm{km}$ で《進|すす》むと □ 《時間|じ|かん》`,
            a: `$${nf(t2)}$`, easy: T`《速|はや》さが${m}《倍|ばい》なので $${t1}\div${m}=${nf(t2)}$`,
            verify: () => close(v1 * t1 / v2, F.val(t2)) || '道のり÷速さと合わない',
          };
        }
        if (k === 1) {
          const a = r.int(2, 6), b = r.int(3, 12), m = r.int(2, 4);
          if ((b % m) !== 0) return null;
          return {
            q: T`たて $${a}\,\mathrm{cm}$、よこ $${b}\,\mathrm{cm}$ の《長方形|ちょう|ほう|けい》と《面積|めん|せき》が《同|おな》じで、たてが $${a * m}\,\mathrm{cm}$ なら、よこは □ cm`,
            a: `$${b / m}$`, easy: T`たてが${m}《倍|ばい》なので $${b}\div${m}=${b / m}$`,
            verify: () => same(a * b / (a * m), b / m),
          };
        }
        if (k === 2) {
          const n1 = r.int(2, 5), m = r.int(2, 4), each = 60 * r.int(1, 6) * m;
          return {
            q: `ジュースを${n1}《人|にん》で《分|わ》けると《一人|ひと|り》 $${each}\\,\\mathrm{mL}$。《同|おな》じ《量|りょう》を${n1 * m}《人|にん》で《分|わ》けると《一人|ひと|り》 □ mL`,
            a: `$${each / m}$`, easy: T`《人数|にん|ずう》が${m}《倍|ばい》なので $${each}\div${m}=${each / m}$`,
            verify: () => same(n1 * each / (n1 * m), each / m),
          };
        }
        const l1 = r.pick([4, 5, 6, 8, 10]), t1 = r.int(2, 6) * 6, m = r.pick([2, 3]), l2 = l1 * m;
        return {
          q: `1${fun(1)}に $${l1}\\,\\mathrm{L}$ ずつ《入|い》れて${t1}${fun(t1)}かかる《水|みず》そうに、1${fun(1)}に $${l2}\\,\\mathrm{L}$ ずつ《入|い》れると □ 《分|ふん》`,
          a: `$${t1 / m}$`, easy: T`${m}《倍|ばい》ずつ《入|い》れるので $${t1}\div${m}=${t1 / m}$`,
          verify: () => same(l1 * t1 / l2, t1 / m),
        };
      },
      // わな：y=10-x（和が一定。反比例でない）
      trap(r) {
        const c = r.int(8, 20), x1 = r.int(1, 4), x2 = 2 * x1;
        if (x2 >= c) return null;
        return dest({
          q: T`$y=${c}-x$ で、$x=${x1}$ のとき $y=${c - x1}$。$x=${x2}$ のとき $y=□$`,
          a: `$${c - x2}$`,
          verify: () => same(M.evalMath(`${c}-x`, { x: x2 }), c - x2),
        }, '2-76', T`かけて《一定|いっ|てい》ではないので、$\frac{1}{2}$ 《倍|ばい》にはならない。$${c}-${x2}=${c - x2}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-77
  M.add({
    id: '2-77', part: PART, chap: '2-15', stars: 1,
    title: T`2《乗|じょう》に《比例|ひ|れい》は $k$ 《倍|ばい》で $k^{2}$ 《倍|ばい》`,
    mark: T`**$y=ax^{2}$**（《落|お》ちる《距離|きょ|り》・《面積|めん|せき》）で、$x$ を《何倍|なん|ばい》かにする。`,
    futsu: [T`$y=5x^{2}$ に $x=1$ と $x=3$ を`, T`《入|い》れて $5$ と $45$、`, T`$45\div5=9$。`],
    raku: [T`$x$ が3《倍|ばい》なら、`, T`$x^{2}$ は $3^{2}=9$ 《倍|ばい》。`, T`$a$ の5は《見|み》なくてよい。`],
    why: T`$x$ を $k$ 《倍|ばい》にすると、$x\times x$ は $k\times k$ 《倍|ばい》になる（《教科書|きょう|か|しょ》2-15）。`,
    caution: T`$y=3x$ のようなただの《比例|ひ|れい》は、3《倍|ばい》で3《倍|ばい》（わざ 2-75）。`,
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /2乗/.test(q) || /x\^\{2\}/.test(q) || (/面積/.test(q) && /(1辺|半径)/.test(q)) || (/周期/.test(q) && /sqrt/.test(q)); },
    steps: {
      s1(r) {
        const a = r.int(2, 5), k = r.int(2, 5);
        return {
          q: T`$y=${a}x^{2}$ で $x$ を${k}《倍|ばい》にすると、$y$ は □ 《倍|ばい》`,
          a: `$${k * k}$`, easy: T`$${k}^{2}=${k * k}$`,
          verify: () => same(a * Math.pow(3 * k, 2) / (a * 9), k * k),
        };
      },
      s2(r) {
        if (r.chance(0.6)) {
          const a = r.int(1, 5), x1 = r.int(1, 4), k = r.int(2, 4), x2 = k * x1, y1 = a * x1 * x1, y2 = a * x2 * x2;
          return {
            q: T`$y=${a === 1 ? '' : a}x^{2}$ で、$x=${x1}$ のとき $y=${y1}$。$x=${x2}$ のとき $y=□$`,
            a: `$${y2}$`, easy: T`${k}《倍|ばい》なので $${y1}\times${k}^{2}=${y2}$`,
            verify: () => same(a * x2 * x2, y2),
          };
        }
        const a = r.int(2, 5), k = r.int(2, 5);
        return {
          q: T`$y=${a}x^{2}$ で $y$ を${k * k}《倍|ばい》にするには、$x$ を □ 《倍|ばい》`,
          a: `$${k}$`, easy: T`$\sqrt{${k * k}}=${k}$`,
          verify: () => close(Math.sqrt(a * k * k / a), k) || '何倍かが合わない',
        };
      },
      // 落ちる距離・正方形・円・ブレーキ・振り子
      s3(r) {
        const k = r.int(0, 4);
        if (k === 0) {
          const t = r.int(2, 6);
          return {
            q: `《物|もの》が《落|お》ちる《距離|きょ|り》は、《時間|じ|かん》の2《乗|じょう》に《比例|ひ|れい》します。1《秒|びょう》で $5\\,\\mathrm{m}$ 《落|お》ちるとき、${t}《秒|びょう》では □ m`,
            a: `$${5 * t * t}$`, easy: T`${t}《倍|ばい》なので $5\times${t}^{2}=${5 * t * t}$`,
            verify: () => same(M.evalMath('5x^{2}', { x: t }), 5 * t * t),
          };
        }
        if (k === 1 || k === 2) {
          const m = r.int(2, 6);
          const what = k === 1 ? '《正方形|せい|ほう|けい》の1《辺|ぺん》' : '《円|えん》の《半径|はん|けい》';
          return {
            q: `${what}を${m}《倍|ばい》にすると、《面積|めん|せき》は □ 《倍|ばい》`,
            a: `$${m * m}$`, easy: T`$${m}^{2}=${m * m}$`,
            verify: () => same((m * 3) * (m * 3) / 9, m * m),
          };
        }
        if (k === 3) {
          const v1 = r.pick([20, 30, 40]), d1 = r.int(2, 9), m = r.int(2, 3);
          return {
            q: `《車|くるま》が《止|と》まるまでの《距離|きょ|り》は、《速|はや》さの2《乗|じょう》に《比例|ひ|れい》するとします。《時速|じ|そく》 $${v1}\\,\\mathrm{km}$ で $${d1}\\,\\mathrm{m}$ のとき、《時速|じ|そく》 $${v1 * m}\\,\\mathrm{km}$ では □ m`,
            a: `$${d1 * m * m}$`, easy: T`${m}《倍|ばい》なので $${d1}\times${m}^{2}=${d1 * m * m}$`,
            verify: () => close(d1 / (v1 * v1) * (v1 * m) * (v1 * m), d1 * m * m) || '距離が合わない',
          };
        }
        const m = r.int(2, 4);
        return {
          q: `《振|ふ》り《子|こ》の《周期|しゅう|き》は、《糸|いと》の《長|なが》さの $\\sqrt{\\ }$ に《比例|ひ|れい》します。《周期|しゅう|き》を${m}《倍|ばい》にするには、《糸|いと》の《長|なが》さを □ 《倍|ばい》`,
          a: `$${m * m}$`, easy: T`《長|なが》さは2《乗|じょう》で $${m}^{2}=${m * m}$`,
          verify: () => close(Math.sqrt(m * m), m) || '√ が合わない',
        };
      },
      // わな：y=3x（ただの比例。2-75 で）
      trap(r) {
        const a = r.int(2, 6), k = r.int(2, 5);
        return dest({
          q: T`$y=${a}x$ で $x$ を${k}《倍|ばい》にすると、$y$ は □ 《倍|ばい》`,
          a: `$${k}$`,
          verify: () => same(a * 2 * k / (a * 2), k),
        }, '2-77', `2《乗|じょう》がないただの《比例|ひ|れい》。${k}《倍|ばい》で${k}《倍|ばい》`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-78
  M.add({
    id: '2-78', part: PART, chap: '2-16', stars: 1,
    title: '《追|お》いつきは「《差|さ》」で《考|かんが》える',
    mark: '**《同|おな》じ《向|む》き**に《動|うご》く2つ。「〜m《先|さき》」「あとから《追|お》いかける」。',
    futsu: ['1《秒|びょう》ごとに2つの《位置|い|ち》を', '《表|ひょう》に《書|か》いて、《同|おな》じになる', 'ところをさがす。'],
    raku: [T`《近|ちか》づく《速|はや》さは《差|さ》：$25-15=10$`, T`$40\,\mathrm{m}$ をうめるのに`, T`$40\div10=4$（《秒|びょう》）`],
    why: '1《秒|びょう》ごとに、《速|はや》いほうが《差|さ》の《分|ぶん》だけ《近|ちか》づく（《教科書|きょう|か|しょ》2-16）。はじめのへだたりを《近|ちか》づく《速|はや》さでわる。',
    caution: '《向|む》かい《合|あ》って《進|すす》むときは、《近|ちか》づく《速|はや》さは《差|さ》ではなく《和|わ》。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /追いつ|追いか|追いこ|追いぬ/.test(q) || (/同じ向き/.test(q) && /周/.test(q)); },
    steps: {
      // へだたりが書いてある
      s1(r) {
        const k = r.int(0, 2), t = r.int(2, 9);
        if (k === 0) {
          const v1 = r.int(10, 20), dv = r.int(2, 10), v2 = v1 + dv, d = dv * t;
          return {
            q: T`《秒速|びょう|そく》 $${v1}\,\mathrm{m}$ の《車|くるま》Aを、$${d}\,\mathrm{m}$ うしろから《秒速|びょう|そく》 $${v2}\,\mathrm{m}$ の《車|くるま》Bが《追|お》いかけると、□ 《秒後|びょう|ご》に《追|お》いつく`,
            a: `$${t}$`, easy: T`《近|ちか》づく《速|はや》さ $${v2}-${v1}=${dv}$、$${d}\div${dv}=${t}$`, easyCheck: false,
            verify: () => same(v2 * t, d + v1 * t, '追いついた位置 '),
          };
        }
        if (k === 1) {
          const v1 = r.int(1, 4), dv = r.int(1, 3), v2 = v1 + dv, d = dv * t;
          return {
            q: T`$${d}\,\mathrm{m}$ 《先|さき》から《秒速|びょう|そく》 $${v1}\,\mathrm{m}$ で《走|はし》る《弟|おとうと》に、《秒速|びょう|そく》 $${v2}\,\mathrm{m}$ の《兄|あに》は □ 《秒後|びょう|ご》に《追|お》いつく`,
            a: `$${t}$`, easy: T`《近|ちか》づく《速|はや》さ $${v2}-${v1}=${dv}$、$${d}\div${dv}=${t}$`, easyCheck: false,
            verify: () => same(v2 * t, d + v1 * t, '追いついた位置 '),
          };
        }
        const v1 = r.pick([60, 70, 80]), dv = r.pick([100, 120, 150, 160, 180]), v2 = v1 + dv, d = dv * t;
        return {
          q: `《分速|ふん|そく》 $${v1}\\,\\mathrm{m}$ で《歩|ある》く《人|ひと》を、$${d}\\,\\mathrm{m}$ うしろから《分速|ふん|そく》 $${v2}\\,\\mathrm{m}$ の《自転車|じ|てん|しゃ》が《追|お》いかけると、□ 《分後|ふん|ご》に《追|お》いつく`,
          a: `$${t}$`, easy: T`《近|ちか》づく《速|はや》さ $${v2}-${v1}=${dv}$、$${d}\div${dv}=${t}$`, easyCheck: false,
          verify: () => same(v2 * t, d + v1 * t, '追いついた位置 '),
        };
      },
      // あとから出る（へだたりは、先に出た人が進んだ道のり）
      s2(r) {
        const t0 = r.int(2, 8), v1 = r.pick([50, 60, 70, 80]), t = r.int(1, 6);
        const d = v1 * t0;
        if (d % t) return null;
        const dv = d / t, v2 = v1 + dv;
        if (v2 > 300 || v2 % 10) return null;
        const sis = r.chance(0.5);
        return {
          q: `《分速|ふん|そく》 $${v1}\\,\\mathrm{m}$ の${sis ? '《妹|いもうと》' : '《弟|おとうと》'}が《出|で》て${t0}${funGo(t0)}に、《分速|ふん|そく》 $${v2}\\,\\mathrm{m}$ の${sis ? '《姉|あね》' : '《兄|あに》'}が《同|おな》じ《道|みち》を《追|お》いかけると、□ 《分後|ふん|ご》に《追|お》いつく`,
          a: `$${t}$`, easy: T`《先|さき》に $${v1}\times${t0}=${d}$、《差|さ》 $${v2}-${v1}=${dv}$、$${d}\div${dv}=${t}$`, easyCheck: false,
          verify: () => same(v2 * t, v1 * (t0 + t), '追いついた位置 '),
        };
      },
      // トラックで1周の差・追いつく場所
      s3(r) {
        if (r.chance(0.5)) {
          const L = r.pick([200, 300, 400, 600]), v1 = r.int(2, 5), dv = r.pick([1, 2, 4, 5]), v2 = v1 + dv;
          if (L % dv) return null;
          return {
            q: T`1《周|しゅう》 $${L}\,\mathrm{m}$ のトラックを、《秒速|びょう|そく》 $${v2}\,\mathrm{m}$ のAと《秒速|びょう|そく》 $${v1}\,\mathrm{m}$ のBが《同|おな》じ《所|ところ》から《同|おな》じ《向|む》きに《走|はし》ると、Aは □ 《秒後|びょう|ご》にBに《追|お》いつく`,
            a: `$${L / dv}$`, easy: T`1《周|しゅう》を《近|ちか》づく《速|はや》さでわる：$${L}\div${dv}=${L / dv}$`,
            verify: () => same(v2 * (L / dv) - v1 * (L / dv), L, '1周の差 '),
          };
        }
        const t = r.int(2, 8), v1 = r.int(2, 5), dv = r.int(1, 3), v2 = v1 + dv, d = dv * t;
        return {
          q: T`$${d}\,\mathrm{m}$ 《先|さき》から《秒速|びょう|そく》 $${v1}\,\mathrm{m}$ で《走|はし》るAに、《秒速|びょう|そく》 $${v2}\,\mathrm{m}$ のBが《追|お》いつくのは、Bが □ m 《進|すす》んだところ`,
          a: `$${v2 * t}$`, easy: T`$${d}\div${dv}=${t}$ 《秒後|びょう|ご》なので $${v2}\times${t}=${v2 * t}$`, easyCheck: false,
          verify: () => same(v2 * t, d + v1 * t, '追いついた位置 '),
        };
      },
      // わな：向かい合う・反対向き（近づく速さは和）
      trap(r) {
        const v1 = r.pick([50, 60, 70, 80]), v2 = r.pick([60, 70, 80, 90, 100]), t = r.int(2, 9), d = (v1 + v2) * t;
        const q = r.chance(0.5)
          ? T`$${d}\,\mathrm{m}$ はなれた2《人|り》が、《分速|ふん|そく》 $${v1}\,\mathrm{m}$ と《分速|ふん|そく》 $${v2}\,\mathrm{m}$ で《向|む》かい《合|あ》って《歩|ある》くと、□ 《分後|ふん|ご》に《出会|で|あ》う`
          : T`1《周|しゅう》 $${d}\,\mathrm{m}$ の《池|いけ》を、2《人|り》が《分速|ふん|そく》 $${v1}\,\mathrm{m}$ と《分速|ふん|そく》 $${v2}\,\mathrm{m}$ で《同|おな》じ《所|ところ》から《反対|はん|たい》《向|む》きに《歩|ある》くと、□ 《分後|ふん|ご》に《出会|で|あ》う`;
        return dest({ q, a: `$${t}$`, verify: () => same(v1 * t + v2 * t, d, '2人の道のりの和 ') },
          '2-78', T`《近|ちか》づく《速|はや》さは《差|さ》ではなく《和|わ》。$${d}\div(${v1}+${v2})=${t}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-79
  // ax+b=cx+d（解 x0）を作る。b・d は 0 でない
  function eq79(r, v, x0, a, c) {
    const b = r.intNot(-9, 9, x => x === 0), d = (a - c) * x0 + b;
    if (d === 0 || Math.abs(d) > 40) return null;
    return { b, d, eq: `${poly([[a, v], [b, '']])}=${poly([[c, v], [d, '']])}` };
  }
  // 移項してまとめた形（文字は左、数は右）
  const moved = (v, a, b, c, d) => `$${poly([[a, v], [-c, v]])}=${poly([[d, ''], [-b, '']])}$、$${poly([[a - c, v]])}=${d - b}$`;
  M.add({
    id: '2-79', part: PART, chap: '2-16', stars: 1,
    title: T`《文字|も|じ》は《左|ひだり》、《数|かず》は《右|みぎ》へ《移項|い|こう》して $ax=b$`,
    mark: '**《両辺|りょう|へん》に《文字|も|じ》の《項|こう》**がある1《次方程式|じ|ほう|てい|しき》。',
    futsu: [T`$x$ に1、2、3、…と《入|い》れて、`, '《両辺|りょう|へん》が《等|ひと》しくなる《数|かず》を', 'ためしてさがす。'],
    raku: [T`$3x-7=x+5$`, T`$3x-x=5+7$（《移項|い|こう》）`, T`$2x=12$（まとめる）`, T`$x=6$（2でわる）`],
    why: '《移項|い|こう》は、《両辺|りょう|へん》から《同|おな》じものをひく・たすことを1《行|ぎょう》で《書|か》いたもの。いつも3つの《手順|て|じゅん》で《解|と》ける（《教科書|きょう|か|しょ》2-16）。',
    caution: T`《移項|い|こう》すると《文字|も|じ》が《消|き》える（$0=10$）ときは、《解|かい》がない。`,
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '24mm' },
    fits(q) {
      const e = linEq(q);
      return !!e && !/\\frac|\d\.\d/.test(e.src) && !close(e.aL, 0) && !close(e.aR, 0) && !close(e.aL, e.aR);
    },
    steps: {
      s1(r) {
        const x0 = r.int(1, 9), a = r.int(2, 7), c = r.int(1, a - 1);
        const e = eq79(r, 'x', x0, a, c);
        if (!e) return null;
        return { q: solveQ(e.eq), a: `$${x0}$`, easyCheck: false, easy: moved('x', a, e.b, c, e.d), verify: () => holds(e.eq, 'x', x0) };
      },
      // 右の文字のほうが多い・負の解・t や y
      s2(r) {
        const v = r.pick(['x', 't', 'y']), x0 = r.intNot(-6, 9, x => x === 0), c = r.int(2, 6), a = r.int(1, c - 1);
        const e = eq79(r, v, x0, a, c);
        if (!e) return null;
        return { q: solveQ(e.eq, v), a: `$${x0}$`, easyCheck: false, easy: moved(v, a, e.b, c, e.d), verify: () => holds(e.eq, v, x0) };
      },
      // 両辺をわってから・代入して確かめる・かっこ
      s3(r) {
        const k = r.int(0, 2), x0 = r.int(1, 8);
        if (k === 0) {
          const g = r.int(2, 4), a = r.int(2, 5), c = r.int(1, a - 1), e = eq79(r, 'x', x0, a, c);
          if (!e) return null;
          const eq = `${poly([[g * a, 'x'], [g * e.b, '']])}=${poly([[g * c, 'x'], [g * e.d, '']])}`;
          return {
            q: `$${eq}$ を、《両辺|りょう|へん》を${g}でわってから《解|と》くと $x=□$`, a: `$${x0}$`, easyCheck: false,
            easy: `${g}でわって $${e.eq}$`, verify: () => holds(eq, 'x', x0),
          };
        }
        if (k === 1) {
          const a = r.int(2, 6), c = r.int(1, a - 1), e = eq79(r, 'x', x0 + 1, a, c);
          if (!e) return null;
          const cand = [x0, x0 + 1, x0 + 2];
          return {
            q: `${cand.join('、')}のうち、$${e.eq}$ の《解|かい》は □`, a: `$${x0 + 1}$`,
            easy: T`$x=${x0 + 1}$ を《入|い》れると《両辺|りょう|へん》が $${a * (x0 + 1) + e.b}$`, easyCheck: false,
            verify: () => (holds(e.eq, 'x', x0 + 1) === true && holds(e.eq, 'x', x0) !== true && holds(e.eq, 'x', x0 + 2) !== true) || 'ほかの数でも成り立つ',
          };
        }
        const a = r.int(2, 4), b = r.int(1, 6), c = r.intNot(1, 7, z => z === a), d = a * (x0 + b) - c * x0;
        if (d === 0) return null;
        const eq = `${a}(x+${b})=${poly([[c, 'x'], [d, '']])}`;
        return {
          q: solveQ(eq), a: `$${x0}$`, easyCheck: false,
          easy: `かっこをはずして $${poly([[a, 'x'], [a * b, '']])}=${poly([[c, 'x'], [d, '']])}$`, verify: () => holds(eq, 'x', x0),
        };
      },
      // わな：移項すると文字が消える（解がない）／文字の項が1つだけ
      trap(r) {
        if (r.chance(0.6)) {
          const v = r.pick(['t', 'x']), a = r.int(2, 6), b = r.int(3, 15);
          const eq = r.chance(0.5) ? `${a}${v}=${b}+${a}${v}` : `${a}${v}+${b}=${a}${v}`;
          return dest({
            q: `$${eq}$ の《解|かい》は □`, a: '《解|かい》はない',
            verify: () => [0, 1, 2.5, -3].every(x => holds(eq, v, x) !== true) || '成り立つ数がある',
          }, '2-79', `《移項|い|こう》すると $0=${b}$ になり、どんな $${v}$ でも《成|な》り《立|た》たない`);
        }
        const a = r.int(2, 9), x0 = r.int(2, 9), eq = `${a}x=${a * x0}`;
        return dest({ q: solveQ(eq), a: `$${x0}$`, easyCheck: false, verify: () => holds(eq, 'x', x0) },
          '2-79', `《文字|も|じ》の《項|こう》は1つだけ。《移項|い|こう》しないで《両辺|りょう|へん》を${a}でわる`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-80
  M.add({
    id: '2-80', part: PART, chap: '2-16', stars: 1,
    title: '《分数|ぶん|すう》の《方程式|ほう|てい|しき》は《分母|ぶん|ぼ》をはらう',
    mark: T`**《係数|けい|すう》や《項|こう》に《分数|ぶん|すう》**がある（$\frac{x}{4}$、$\frac{2x}{3}$）。`,
    futsu: [T`$\frac{x}{4}-x=-6-3$`, T`$-\frac{3}{4}x=-9$ と、`, '《分数|ぶん|すう》のまま《計算|けい|さん》する。'],
    raku: [T`$\frac{x}{4}+3=x-6$`, '《両辺|りょう|へん》に4をかける', T`$x+12=4x-24$`, T`$-3x=-36$、$x=12$`],
    why: T`$\frac{x}{4}\times4=x$ で《分数|ぶん|すう》が《消|き》える。《等式|とう|しき》をこわさないよう、すべての《項|こう》にかける（《教科書|きょう|か|しょ》2-16）。`,
    caution: T`3にもかけるのを《忘|わす》れない（$x+3=4x-24$ はまちがい）。`,
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm',
    fits(q) {
      if (/ある数を\d+でわって/.test(q)) return true;
      const e = linEq(q);
      return !!e && /\\frac/.test(e.src) && !close(e.aL, e.aR);
    },
    steps: {
      s1(r) {
        const d = r.int(2, 6), x0 = d * r.intNot(-3, 6, z => z === 0), b = r.intNot(-9, 9, z => z === 0), c = r.int(1, 3);
        const e = x0 / d + b - c * x0;
        if (e === 0 || Math.abs(e) > 40) return null;
        const L = poly([[F.make(1, d), 'x', 'f'], [b, '']]), R = poly([[c, 'x'], [e, '']]);
        const swap = r.chance(0.3), eq = swap ? `${R}=${L}` : `${L}=${R}`;
        const L2 = poly([[1, 'x'], [b * d, '']]), R2 = poly([[c * d, 'x'], [e * d, '']]);
        return {
          q: solveQ(eq), a: `$${x0}$`, easyCheck: false,
          easy: `《両辺|りょう|へん》に${d}をかけて $${swap ? `${R2}=${L2}` : `${L2}=${R2}`}$`,
          verify: () => holds(eq, 'x', x0),
        };
      },
      // 分母が2つ（最小公倍数をかける）
      s2(r) {
        const [p0, q0] = r.shuffle([2, 3, 4, 5, 6]).slice(0, 2), A = F.make(r.int(1, 2), p0), Bq = F.make(r.int(1, 2), q0);
        const [m, p] = A, [n, q] = Bq, Lc = F.lcm(p, q);
        if (p === 1 || q === 1 || p === q || Lc > 20) return null;
        const x0 = Lc * r.intNot(-2, 3, z => z === 0);
        let eq, eq2;
        if (r.chance(0.4)) {
          const e = m * x0 / p + n * x0 / q;
          eq = `${poly([[F.make(m, p), 'x', 'f'], [F.make(n, q), 'x', 'f']])}=${e}`;
          eq2 = `${poly([[m * Lc / p, 'x'], [n * Lc / q, 'x']])}=${e * Lc}`;
        } else {
          const b = r.intNot(-6, 6, z => z === 0), e = m * x0 / p + b - n * x0 / q;
          if (e === 0) return null;
          eq = `${poly([[F.make(m, p), 'x', 'f'], [b, '']])}=${poly([[F.make(n, q), 'x', 'f'], [e, '']])}`;
          eq2 = `${poly([[m * Lc / p, 'x'], [b * Lc, '']])}=${poly([[n * Lc / q, 'x'], [e * Lc, '']])}`;
        }
        return { q: solveQ(eq), a: `$${x0}$`, easyCheck: false, easy: `《両辺|りょう|へん》に${Lc}をかけて $${eq2}$`, verify: () => holds(eq, 'x', x0) };
      },
      // ことばの問題・かっこごとの分数
      s3(r) {
        if (r.chance(0.5)) {
          const d = r.int(2, 5), x0 = d * r.int(3, 9), b = r.int(1, 9), e = x0 - x0 / d - b;
          if (e <= 0) return null;
          return {
            q: `ある《数|かず》を${d}でわって${b}をたすと、ある《数|かず》から${e}をひいた《数|かず》と《等|ひと》しくなります。ある《数|かず》は □`,
            a: `$${x0}$`, easy: T`$\frac{x}{${d}}+${b}=x-${e}$、《両辺|りょう|へん》に${d}をかけて $${poly([[1, 'x'], [b * d, '']])}=${poly([[d, 'x'], [-e * d, '']])}$`, easyCheck: false,
            verify: () => same(x0 / d + b, x0 - e, '両方の数 '),
          };
        }
        const [p, q] = r.shuffle([2, 3, 4, 5]).slice(0, 2), Lc = F.lcm(p, q), x0 = r.int(1, 9), b = r.intNot(-5, 5, z => z === 0);
        const e = (q * (x0 + b)) / p - x0;
        if (!Number.isInteger(e) || e === 0 || e === b) return null;
        const eq = T`\frac{${poly([[1, 'x'], [b, '']])}}{${p}}=\frac{${poly([[1, 'x'], [e, '']])}}{${q}}`;
        const co = (k, s) => (k === 1 ? `(${s})` : `${k}(${s})`);
        return {
          q: solveQ(eq), a: `$${x0}$`, easyCheck: false,
          easy: `《両辺|りょう|へん》に${Lc}をかけて $${co(Lc / p, poly([[1, 'x'], [b, '']]))}=${co(Lc / q, poly([[1, 'x'], [e, '']]))}$`,
          verify: () => holds(eq, 'x', x0),
        };
      },
      // わな：小数の方程式（分数でない。2-81 で）
      trap(r) {
        const a = r.pick([2, 4, 5, 8]), x0 = r.int(2, 9) * (10 / F.gcd(a, 10)), b = r.chance(0.5) ? r.int(1, 5) : 0;
        const eq = `${poly([[F.make(a, 10), 'x'], [b, '']])}=${tenth(a * x0) * 1 + b}`;
        return dest({ q: solveQ(eq), a: `$${x0}$`, easyCheck: false, verify: () => holds(eq, 'x', x0) }, '2-80', '《分数|ぶん|すう》ではなく《小数|しょう|すう》');
      },
    },
  });

  // ---------------------------------------------------------------- 2-81
  // 係数・数が 1/10 の方程式 ax+b=cx+e（a・c・b・e は10倍した整数で持つ）
  function eq81(r, v, x0num, x0den, scale) {
    const a = r.int(1, 19), c = r.intNot(1, 19, z => z === a);
    if (a % 10 === 0 && c % 10 === 0) return null;
    const b = r.intNot(-30, 30, z => z === 0);
    const e = F.add(F.mul(F.make(a - c), F.make(x0num, x0den)), F.make(b));   // 10倍した e
    if (e[1] !== 1) return null;
    const s = n => F.make(n, scale);
    const eq = `${poly([[s(a), v], [s(b), '']])}=${poly([[s(c), v], [s(e[0]), '']])}`;
    const eq10 = `${poly([[a, v], [b, '']])}=${poly([[c, v], [e[0], '']])}`;
    return { eq, eq10 };
  }
  M.add({
    id: '2-81', part: PART, chap: '2-16', stars: 2,
    title: '《小数|しょう|すう》の《方程式|ほう|てい|しき》は10《倍|ばい》・100《倍|ばい》',
    mark: T`**《係数|けい|すう》や《項|こう》に《小数|しょう|すう》**がある（$0.3x$、$1.2$）。`,
    futsu: [T`$0.3x-0.5x=-1.2$`, T`$-0.2x=-1.2$、$x=1.2\div0.2$ と、`, '《小数|しょう|すう》のまま《計算|けい|さん》する。'],
    raku: [T`$0.3x+1.2=0.5x$`, '《両辺|りょう|へん》を10《倍|ばい》する', T`$3x+12=5x$`, T`$-2x=-12$、$x=6$`],
    why: '10《倍|ばい》すると《小数点|しょう|すう|てん》が《右|みぎ》へ1つ《動|うご》く（2-1）。すべての《項|こう》を10《倍|ばい》すれば、《整数|せい|すう》だけの《方程式|ほう|てい|しき》になる（《教科書|きょう|か|しょ》2-16）。',
    caution: '《小数点|しょう|すう|てん》の《下|した》が2けたなら100《倍|ばい》。《整数|せい|すう》の《項|こう》にもかける。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      const e = linEq(q);
      return !!e && /\d\.\d/.test(e.src) && !close(e.aL, e.aR);
    },
    steps: {
      s1(r) {
        const x0 = r.intNot(-5, 9, z => z === 0), g = eq81(r, 'x', x0, 1, 10);
        if (!g) return null;
        return { q: solveQ(g.eq), a: `$${x0}$`, easyCheck: false, easy: `《両辺|りょう|へん》を10《倍|ばい》して $${g.eq10}$`, verify: () => holds(g.eq, 'x', x0) };
      },
      // 100倍・t の式
      s2(r) {
        if (r.chance(0.6)) {
          const x0 = r.pick([4, 5, 10, 20, 25, 40, 50, -10, -20]), a = r.pick([5, 15, 25, 35, 45, 12, 8, 4]), c = r.intNot(1, 50, z => z === a || z % 10 === 0);
          const b = r.intNot(-9, 9, z => z === 0) * 100, e = (a - c) * x0 + b;
          if (e % 100 === 0 && e !== 0 && r.chance(0.5)) return null;
          if (e === 0) return null;
          const s = n => F.make(n, 100);
          const eq = `${poly([[s(a), 'x'], [s(b), '']])}=${poly([[s(c), 'x'], [s(e), '']])}`;
          if (!/\d\.\d\d/.test(eq)) return null;
          return { q: solveQ(eq), a: `$${x0}$`, easyCheck: false, easy: `《両辺|りょう|へん》を100《倍|ばい》して $${poly([[a, 'x'], [b, '']])}=${poly([[c, 'x'], [e, '']])}$`, verify: () => holds(eq, 'x', x0) };
        }
        // 教科書 2-16⑧：1.5t=10+2t（追いつけない兄）
        const a = r.pick([5, 15, 25]), c = a + r.pick([5, 10]), b = r.pick([5, 10, 20]);
        const t0 = F.div(F.make(10 * b), F.make(a - c));
        if (t0[1] !== 1) return null;
        const eq = `${tenth(a)}t=${b}+${tenth(c)}t`;
        return { q: solveQ(eq, 't'), a: `$${t0[0]}$`, easyCheck: false, easy: `《両辺|りょう|へん》を10《倍|ばい》して $${a}t=${10 * b}+${c}t$`, verify: () => holds(eq, 't', t0[0]) };
      },
      // 答えが小数
      s3(r) {
        const h = r.pick([1, 3, 5, 7, 9]), den = r.pick([2, 4]);
        if (h % den === 0) return null;
        const g = eq81(r, 'x', h, den, 10);
        if (!g) return null;
        const x0 = dstr(F.make(h, den));
        return { q: solveQ(g.eq), a: `$${x0}$`, easyCheck: false, easy: `《両辺|りょう|へん》を10《倍|ばい》して $${g.eq10}$`, verify: () => holds(g.eq, 'x', parseFloat(x0)) };
      },
      // わな：分数の方程式（2-80 で）
      trap(r) {
        const d = r.pick([10, 5, 4]), n = r.int(2, 9), b = r.chance(0.5) ? r.int(1, 4) : 0;
        const eq = `${poly([[F.make(1, d), 'x', 'f'], [b, '']])}=${n + b}`;
        return dest({ q: solveQ(eq), a: `$${d * n}$`, verify: () => holds(eq, 'x', d * n) }, '2-81', '《小数|しょう|すう》ではなく《分数|ぶん|すう》');
      },
    },
  });

  // ---------------------------------------------------------------- 2-82
  const LAMP = n => bin(n).split('').map(c => (c === '1' ? 'つく' : '《消|き》える')).join('・');
  M.add({
    id: '2-82', part: PART, chap: '2-17', stars: 1,
    title: '2《進数|しん|すう》は、1が《立|た》つ《位|くらい》の《値|あたい》をたす',
    mark: T`**$□_{(2)}$**（0と1だけの《数|かず》）を、ふつうの10《進数|しん|すう》にする。`,
    futsu: ['0から《順|じゅん》に $1$、$10$、$11$、$100$、…と', '《数|かぞ》えていって、《何番目|なん|ばん|め》かを', 'さがす。'],
    raku: ['《位|くらい》は《右|みぎ》から1・2・4・8', T`$1011_{(2)}$ は8・2・1に1`, T`$8+2+1=11$`],
    why: '2《進数|しん|すう》の《位|くらい》は、《左|ひだり》へ1つ《進|すす》むごとに2《倍|ばい》。234を $200+30+4$ と《考|かんが》えるのと《同|おな》じ（《教科書|きょう|か|しょ》2-17）。',
    caution: T`$_{(2)}$ がない $1011$ は、10《進数|しん|すう》の《千十一|せん|じゅう|いち》。`,
    counts: { s1: 10, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '16mm',
    fits(q) {
      if (/^\$[01]+_\{\(2\)\}=□\$$/.test(q)) return true;
      if (/^\$[01]+_\{\(2\)\}[+-][01]+_\{\(2\)\}=□\$$/.test(q)) return true;
      return /ランプ/.test(q) && /表している数/.test(q);
    },
    steps: {
      s1(r) {
        const n = r.int(9, 31);
        if (ones(n) < 2) return null;
        return { q: `$${B2(bin(n))}=□$`, a: `$${n}$`, easy: `$${placeSum(n)}=${n}$`, verify: () => same(parseInt(bin(n), 2), n) };
      },
      s2(r) {
        const n = r.int(33, 255);
        if (ones(n) < 2) return null;
        return { q: `$${B2(bin(n))}=□$`, a: `$${n}$`, easy: `$${placeSum(n)}=${n}$`, verify: () => same(parseInt(bin(n), 2), n) };
      },
      // ランプ・2進数のたし算とひき算
      s3(r) {
        if (r.chance(0.4)) {
          const n = r.int(9, 31);
          if (ones(n) < 2) return null;
          return {
            q: `ランプが《左|ひだり》から「${LAMP(n)}」。つくを1、《消|き》えるを0とした2《進数|しん|すう》が《表|あらわ》している《数|かず》は □`,
            a: `$${n}$`, easy: `$${B2(bin(n))}$、$${placeSum(n)}=${n}$`,
            verify: () => same(parseInt(LAMP(n).split('・').map(s => (s === 'つく' ? 1 : 0)).join(''), 2), n),
          };
        }
        const x = r.int(5, 31), y = r.int(3, 31), plus = r.chance(0.5);
        if (!plus && x <= y) return null;
        const ans = plus ? x + y : x - y;
        return {
          q: `$${B2(bin(x))}${plus ? '+' : '-'}${B2(bin(y))}=□$`, a: `$${ans}$`,
          easy: `$${x}${plus ? '+' : '-'}${y}=${ans}$`,
          verify: () => same(plus ? parseInt(bin(x), 2) + parseInt(bin(y), 2) : parseInt(bin(x), 2) - parseInt(bin(y), 2), ans),
        };
      },
      // わな：(2) のない 1011（10進数）
      trap(r) {
        const x = parseInt(bin(r.int(8, 15)), 10), y = parseInt(bin(r.int(4, 15)), 10);
        return dest({ q: `$${x}+${y}=□$`, a: `$${x + y}$`, verify: () => same(M.evalMath(`${x}+${y}`), x + y) },
          '2-82', T`$_{(2)}$ がないので10《進数|しん|すう》。そのままたす`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-83
  // 大きい位から使う（13 → 8・4・1）
  const used = n => bin(n).split('').map((c, i, a) => (c === '1' ? Math.pow(2, a.length - 1 - i) : 0)).filter(x => x);
  M.add({
    id: '2-83', part: PART, chap: '2-17', stars: 1,
    title: '10《進数|しん|すう》→2《進数|しん|すう》は、《大|おお》きい《位|くらい》から《使|つか》う',
    mark: '**10《進数|しん|すう》を2《進数|しん|すう》**に。1・2・4・8・16・…のどれを《使|つか》うかを、《大|おお》きいほうから《決|き》める。',
    futsu: ['0、1、10、11、100、…と、', '2《進数|しん|すう》で1つずつ《数|かぞ》えていく。'],
    raku: ['13：8を《使|つか》って《残|のこ》り5', '4を《使|つか》って《残|のこ》り1、2は《使|つか》わない', T`1を《使|つか》う → $1101_{(2)}$`],
    why: '《大|おお》きい《位|くらい》を《使|つか》わずに《残|のこ》すと、《小|ちい》さい《位|くらい》を《全部|ぜん|ぶ》《使|つか》っても《届|とど》かない（$4+2+1=7<8$）。だから《大|おお》きいほうから《決|き》まる（《教科書|きょう|か|しょ》2-17）。',
    caution: T`16・32 など《位|くらい》の《大|おお》きさそのものは、1のあとに0をならべるだけ（$16=10000_{(2)}$）。`,
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '22mm', s3: '24mm', trap: '20mm' },
    fits(q) {
      const m = q.match(/^\$(\d+)=□_\{\(2\)\}\$$/);
      if (m) return !isPow2(+m[1]);
      return (/カード/.test(q) && /作り/.test(q)) || /^2でわっていき/.test(q);
    },
    steps: {
      s1(r) {
        const n = r.int(5, 31);
        if (isPow2(n)) return null;
        return { q: `$${n}=□_{(2)}$`, a: `$${B2(bin(n))}$`, easy: `$${n}=${used(n).join('+')}$`, verify: () => same(parseInt(bin(n), 2), n) };
      },
      s2(r) {
        const n = r.int(33, 200);
        if (isPow2(n) || ones(n) > 5) return null;
        return { q: `$${n}=□_{(2)}$`, a: `$${B2(bin(n))}$`, easy: `$${n}=${used(n).join('+')}$`, verify: () => same(parseInt(bin(n), 2), n) };
      },
      // 点のカード・2でわっていく方法
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.int(9, 31);
          if (isPow2(n) || ones(n) < 2) return null;
          return {
            q: `16・8・4・2・1の《点|てん》のカードを、それぞれ1まいまで《使|つか》って${n}を《作|つく》ります。《使|つか》うカードは □`,
            a: used(n).join('・'), easy: `$${B2(bin(n))}$`,
            verify: () => same(used(n).reduce((x, y) => x + y, 0), n),
          };
        }
        const n = r.int(100, 250);
        if (isPow2(n)) return null;
        return {
          q: `2でわっていき、あまりを《下|した》から《読|よ》む《方法|ほう|ほう》で：$${n}=□_{(2)}$`, a: `$${B2(bin(n))}$`,
          easy: `$${n}\\div2=${Math.floor(n / 2)}$ あまり${n % 2}、…`, easyCheck: false,
          verify: () => {
            let m = n, s = '';
            while (m) { s = (m % 2) + s; m = Math.floor(m / 2); }
            return same(s, bin(n));
          },
        };
      },
      // わな：位の大きさそのもの（16 = 10000）
      trap(r) {
        const n = r.pick([4, 8, 16, 32, 64, 128]);
        return dest({ q: `$${n}=□_{(2)}$`, a: `$${B2(bin(n))}$`, verify: () => same(parseInt(bin(n), 2), n) },
          '2-83', `${n}は《位|くらい》の《大|おお》きさそのもの。1のあとに0が${bin(n).length - 1}つ`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-84
  M.add({
    id: '2-84', part: PART, chap: '2-17', stars: 1,
    title: T`$n$ ビットは $2^{n}$ 《通|とお》り、いちばん《大|おお》きい《数|かず》は $2^{n}-1$`,
    mark: '「**《何|なん》ビット**」「**1がならぶ2《進数|しん|すう》**」。',
    futsu: ['000、001、010、…と、', 'ありうるならびを', '《全部|ぜん|ぶ》《書|か》き《出|だ》して《数|かぞ》える。'],
    raku: [T`8ビット → $2^{8}=256$ 《通|とお》り`, '0から《数|かぞ》えるので、いちばん', T`《大|おお》きい《数|かず》は $256-1=255$`, T`$11111_{(2)}=2^{5}-1=31$`],
    why: 'ビットが1つふえると、《前|まえ》のならびの《左|ひだり》に0か1がつくので2《倍|ばい》（《教科書|きょう|か|しょ》2-17）。1がならぶ《数|かず》は、《次|つぎ》の《位|くらい》より1《小|ちい》さい。',
    caution: T`10《進数|しん|すう》の《何|なん》けたなら、1けた10《通|とお》りなので $10^{n}$ 《通|とお》り。`,
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 1, s2: 2, s3: 1, trap: 1 },
    boxw: '18mm',
    fits(q) { return /ビット|バイト/.test(q) || /^\$1{3,}_\{\(2\)\}=□\$$/.test(q); },
    steps: {
      s1(r) {
        const n = r.int(3, 10);
        if (r.chance(0.5)) return { q: `${n}ビットで《表|あらわ》せるのは □ 《通|とお》り`, a: `$${Math.pow(2, n)}$`, easy: `$2^{${n}}=${Math.pow(2, n)}$`, verify: () => same(1 << n, Math.pow(2, n)) };
        return { q: `${n}ビットで《表|あらわ》せるいちばん《大|おお》きい《数|かず》は □`, a: `$${Math.pow(2, n) - 1}$`, easy: `$2^{${n}}-1=${Math.pow(2, n) - 1}$`, verify: () => same(parseInt('1'.repeat(n), 2), Math.pow(2, n) - 1) };
      },
      // 1がならぶ2進数・何ビットで何通り
      s2(r) {
        const n = r.int(3, 9);
        if (r.chance(0.6)) return { q: `$${B2('1'.repeat(n))}=□$`, a: `$${Math.pow(2, n) - 1}$`, easy: `$2^{${n}}-1=${Math.pow(2, n) - 1}$`, verify: () => same(parseInt('1'.repeat(n), 2), Math.pow(2, n) - 1) };
        return { q: `□ ビットで${Math.pow(2, n)}《通|とお》り`, a: `$${n}$`, easy: `$2^{${n}}=${Math.pow(2, n)}$`, val: String(Math.pow(2, n)), verify: () => same(Math.log2(Math.pow(2, n)), n) };
      },
      // 少なくとも何ビット・細かさ・色の数
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const m = r.int(20, 1000), n = Math.ceil(Math.log2(m));
          if (isPow2(m)) return null;
          return {
            q: `${m}《通|とお》りを《表|あらわ》すには、《少|すく》なくとも □ ビットいる`, a: `$${n}$`,
            easy: `$2^{${n - 1}}=${Math.pow(2, n - 1)}$ ではたりず、$2^{${n}}=${Math.pow(2, n)}$`, easyCheck: false,
            verify: () => (Math.pow(2, n) >= m && Math.pow(2, n - 1) < m) || 'ビットの数が合わない',
          };
        }
        if (k === 1) {
          const w = r.pick([16, 32, 64]), n = r.int(2, 6), st = F.make(w, Math.pow(2, n));
          return {
            q: `$${w}\\,\\mathrm{cm}$ のはばを、${n}ビットで《表|あらわ》せる《段階|だん|かい》に《等|ひと》しく《分|わ》けると、1《段階|だん|かい》は □ cm`,
            a: `$${nf(st)}$`, easy: `$${w}\\div2^{${n}}=${nf(st)}$`,
            verify: () => close(w / (1 << n), F.val(st)) || '1段階の大きさが合わない',
          };
        }
        const n = r.int(1, 4), all = Math.pow(2, 3 * n);
        return {
          q: `《赤|あか》・《緑|みどり》・《青|あお》の《明|あか》るさを、それぞれ${n}ビットで《決|き》めると、《色|いろ》は □ 《通|とお》り`,
          a: `$${all}$`, easy: `$2^{${n}}\\times2^{${n}}\\times2^{${n}}=2^{${3 * n}}=${all}$`,
          verify: () => same(Math.pow(1 << n, 3), all),
        };
      },
      // わな：10進数の n けた（10^n 通り）
      trap(r) {
        const n = r.int(2, 5), hi = '9'.repeat(n), lo = '0'.repeat(n);
        return dest({ q: `10《進数|しん|すう》の${n}けた（${lo}から${hi}まで）で《表|あらわ》せるのは □ 《通|とお》り`, a: `$${Math.pow(10, n)}$`, verify: () => same(+hi + 1, Math.pow(10, n)) },
          '2-84', `1けた10《通|とお》りなので $10^{${n}}=${Math.pow(10, n)}$。$2^{${n}}$ ではない`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-85
  // 2進数を右から4けたずつ区切った TeX（0010\,\vert\,1101）
  const split4 = n => { let s = bin(n); while (s.length % 4) s = '0' + s; return s.match(/.{4}/g).join(T`\,\vert\,`); };
  M.add({
    id: '2-85', part: PART, chap: '2-17', stars: 1,
    title: '2《進数|しん|すう》⇔16《進数|しん|すう》は4けたずつ',
    mark: '**2《進数|しん|すう》と16《進数|しん|すう》**のあいだ。10《進数|しん|すう》を《通|とお》らなくてよい。',
    futsu: [T`$101101_{(2)}=32+8+4+1=45$`, T`$45=16\times2+13$ → $\mathrm{2D}_{(16)}$`, 'と、10《進数|しん|すう》を《通|とお》る。'],
    raku: ['《右|みぎ》から4けたずつ《区切|く|ぎ》る', T`$0010\,\vert\,1101$`, T`$0010=2$、$1101=13=\mathrm{D}$`, T`→ $\mathrm{2D}_{(16)}$`],
    why: '2《進数|しん|すう》の4けたは $2^{4}=16$ 《通|とお》り。だから16《進数|しん|すう》の1けたにちょうど《入|はい》る（《教科書|きょう|か|しょ》2-17）。',
    caution: '《区切|く|ぎ》るのは《右|みぎ》（1の《位|くらい》）から。《左|ひだり》のはしは0をつけてそろえる。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '30mm', s3: '36mm', trap: '14mm' },
    fits(q) {
      let m = q.match(/^\$([01]+)_\{\(2\)\}=□_\{\(16\)\}\$$/);
      if (m) return m[1].length > 4;
      m = q.match(/^\$(?:\\mathrm\{)?([0-9A-F]+)\}?_\{\(16\)\}=□_\{\(2\)\}\$$/);
      return !!m && m[1].length >= 2;
    },
    steps: {
      s1(r) {
        const n = r.int(17, 255);
        if (n % 16 === 0) return null;
        return { q: `$${B2(bin(n))}=□_{(16)}$`, a: `$${H16(hx(n))}$`, easy: `$${split4(n)}$`, verify: () => same(parseInt(hx(n), 16), parseInt(bin(n), 2)) };
      },
      s2(r) {
        const n = r.int(17, 255);
        if (n % 16 === 0 || !/[A-F]/.test(hx(n)) && r.chance(0.5)) return null;
        return { q: `$${H16(hx(n))}=□_{(2)}$`, a: `$${B2(bin(n))}$`, easy: `$${split4(n)}$`, verify: () => same(parseInt(bin(n), 2), parseInt(hx(n), 16)) };
      },
      // 3けたの16進数
      s3(r) {
        const n = r.int(257, 4095);
        if (n % 16 === 0) return null;
        if (r.chance(0.5)) return { q: `$${B2(bin(n))}=□_{(16)}$`, a: `$${H16(hx(n))}$`, easy: `$${split4(n)}$`, verify: () => same(parseInt(hx(n), 16), parseInt(bin(n), 2)) };
        return { q: `$${H16(hx(n))}=□_{(2)}$`, a: `$${B2(bin(n))}$`, easy: `$${split4(n)}$`, verify: () => same(parseInt(bin(n), 2), parseInt(hx(n), 16)) };
      },
      // わな：4けた以下（区切らない）
      trap(r) {
        const n = r.int(8, 15);
        return dest({ q: `$${B2(bin(n))}=□_{(16)}$`, a: `$${H16(hx(n))}$`, verify: () => same(parseInt(hx(n), 16), parseInt(bin(n), 2)) },
          '2-85', '4けたなので、《区切|く|ぎ》らずに《表|ひょう》で《読|よ》む');
      },
    },
  });

  // ---------------------------------------------------------------- 2-86
  const DIG = c => parseInt(c, 16);
  const COL = ['《赤|あか》', '《緑|みどり》', '《青|あお》'];
  const hex2 = n => hx(n).padStart(2, '0');
  M.add({
    id: '2-86', part: PART, chap: '2-17', stars: 1,
    title: '16《進数|しん|すう》2けたは「16×《上|うえ》＋《下|した》」',
    mark: T`**$□_{(16)}$**、《色|いろ》の《番号|ばん|ごう》（#80FF00）。2けたの16《進数|しん|すう》を10《進数|しん|すう》に。`,
    futsu: [T`$\mathrm{FF}_{(16)}$ を2《進数|しん|すう》 $11111111_{(2)}$ に`, 'してから、《位|くらい》の《値|あたい》をたす。'],
    raku: [T`$\mathrm{FF}_{(16)}=16\times15+15$`, T`　　　$=240+15=255$`, T`#80 → $16\times8+0=128$`],
    why: '16あつまるごとに《左|ひだり》の《位|くらい》へ《上|あ》がるので、《位|くらい》は《右|みぎ》から1・16。10《進数|しん|すう》の $10\times$ 《上|うえ》＋《下|した》と《同|おな》じ（《教科書|きょう|か|しょ》2-17）。',
    caution: T`3けた（$\mathrm{1F4}_{(16)}$）は、256の《位|くらい》がある。`,
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      if (/^\$(?:\\mathrm\{)?[0-9A-F]{2}\}?_\{\(16\)\}=□\$$/.test(q)) return true;
      if (/#[0-9A-F]{6}/.test(q)) return true;
      const m = q.match(/^\$(\d+)=□_\{\(16\)\}\$$/);
      if (m) return +m[1] >= 16 && +m[1] <= 255;
      return /^\$[^$]*_\{\(16\)\}\$ は \$[^$]*_\{\(16\)\}\$ より/.test(q);
    },
    steps: {
      s1(r) {
        const n = r.int(26, 255);
        if (n % 16 === 0) return null;
        const h = hex2(n);
        return { q: `$${H16(h)}=□$`, a: `$${n}$`, easy: `$16\\times${DIG(h[0])}+${DIG(h[1])}=${n}$`, verify: () => same(parseInt(h, 16), n) };
      },
      // 色の番号
      s2(r) {
        const c = [0, 1, 2].map(() => r.pick([0, 0x33, 0x40, 0x66, 0x80, 0x99, 0xA0, 0xC0, 0xCC, 0xE6, 0xFF, r.int(16, 255)]));
        const k = r.int(0, 2), h = hex2(c[k]);
        if (c[k] < 16) return null;
        const code = '#' + c.map(hex2).join('');
        return {
          q: `《色|いろ》の《番号|ばん|ごう》 ${code} で、${COL[k]}の《明|あか》るさ（${['はじめ', 'まん《中|なか》', '《最後|さい|ご》'][k]}の2けた）は □`,
          a: `$${c[k]}$`, easy: `$\\mathrm{${h}}$ → $16\\times${DIG(h[0])}+${DIG(h[1])}=${c[k]}$`,
          verify: () => same(parseInt(code.slice(1 + 2 * k, 3 + 2 * k), 16), c[k]),
        };
      },
      // 10進数→16進数・2つの16進数の差
      s3(r) {
        if (r.chance(0.6)) {
          const n = r.int(160, 255);
          if (n % 16 === 0) return null;
          return {
            q: `$${n}=□_{(16)}$`, a: `$${H16(hx(n))}$`, easy: `$${n}\\div16=${Math.floor(n / 16)}$ あまり${n % 16}`, easyCheck: false,
            verify: () => same(16 * DIG(hx(n)[0]) + DIG(hx(n)[1]), n),
          };
        }
        const x = r.int(40, 255), y = r.int(17, x - 5);
        return {
          q: `$${H16(hex2(x))}$ は $${H16(hex2(y))}$ より □ 《大|おお》きい`, a: `$${x - y}$`,
          easy: `$${x}-${y}=${x - y}$`,
          verify: () => same(parseInt(hex2(x), 16) - parseInt(hex2(y), 16), x - y),
        };
      },
      // わな：3けたの16進数（256 の位がある）
      trap(r) {
        const n = r.int(256, 1023);
        if (n % 16 === 0) return null;
        const h = hx(n);
        return dest({
          q: `$${H16(h)}=□$`, a: `$${n}$`,
          verify: () => same(256 * DIG(h[0]) + 16 * DIG(h[1]) + DIG(h[2]), n),
        }, '2-86', T`3けたなので256の《位|くらい》がある。$256\times${DIG(h[0])}+16\times${DIG(h[1])}+${DIG(h[2])}=${n}$`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-87・2-88 の部品
  // 表計算：B2 に s、B3 に式を入れて下へコピー。row 行目の値を、1行ずつまねして計算する
  function sheet(s, f, row) { let v = F.make(s); for (let i = 3; i <= row; i++) v = f(v); return v; }
  function loop(s, f, n) { let v = F.make(s); for (let i = 0; i < n; i++) v = f(v); return v; }

  // ---------------------------------------------------------------- 2-87
  M.add({
    id: '2-87', part: PART, chap: '2-18・2-19', stars: 1,
    title: '《同|おな》じ《数|かず》をくり《返|かえ》したすなら「はじめ＋1《回分|かい|ぶん》×《回数|かい|すう》」',
    mark: '《表計算|ひょう|けい|さん》の `=B2+150` を《下|した》へコピー、くり《返|かえ》しの《中|なか》の `m = m + 500`。**《同|おな》じ《数|かず》を《何回|なん|かい》もたす**。',
    futsu: ['B3、B4、B5、B6 と、', '1《行|ぎょう》ずつ150をたして', '《計算|けい|さん》していく。'],
    raku: ['B2 から B6 までに、たすのは4《回|かい》。', T`$2000+150\times4$`, T`$=2600$`],
    why: '1《行|ぎょう》ごとに《同|おな》じ《数|かず》がふえるので、まとめてかけ《算|ざん》にできる（《教科書|きょう|か|しょ》2-18・2-19）。《回数|かい|すう》は《行|ぎょう》の《番号|ばん|ごう》の《差|さ》。',
    caution: '`=B2*2` のように、かけるくり《返|かえ》しは、たし《算|ざん》にならない（わざ 2-88）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /`=B\d+[+-]\d+`/.test(q) || /`(\w+) = \1 [+-] \d+`/.test(q) || /毎月\d+円ずつ/.test(q); },
    steps: {
      s1(r) {
        const s = r.pick([0, 100, 500, 1000, 2000, 3000]), d = r.pick([5, 6, 8, 20, 50, 150, 200, 250, 500]), row = r.int(5, 12), minus = r.chance(0.25) && s > d * 10;
        const v = sheet(s, x => F.add(x, F.make(minus ? -d : d)), row);
        const n = row - 2;
        return {
          q: `B2 に ${s}、B3 に \`=B2${minus ? '-' : '+'}${d}\` を《入|い》れて《下|した》へコピーすると、B${row} は □`,
          a: `$${nf(v)}$`, easy: `$${s}${minus ? '-' : '+'}${d}\\times${n}=${nf(v)}$`,
          verify: () => same(s + (minus ? -d : d) * n, F.val(v)),
        };
      },
      // プログラムのくり返し
      s2(r) {
        const name = r.pick(['x', 'n', 'm']), s = r.pick([0, 10, 100, 1000, 3000]), d = r.pick([2, 3, 5, 7, 50, 500]), n = r.int(4, 12);
        const v = loop(s, x => F.add(x, F.make(d)), n);
        const q = r.chance(0.5)
          ? `\`${name} = ${s}\` のあと \`${name} = ${name} + ${d}\` を${n}《回|かい》くり《返|かえ》すと、\`${name}\` は □`
          : `\`${name} = ${s}\` のあと \`for i in range(${n}):\` で \`${name} = ${name} + ${d}\` をくり《返|かえ》すと、\`${name}\` は □`;
        return { q, a: `$${nf(v)}$`, easy: `$${s}+${d}\\times${n}=${nf(v)}$`, verify: () => same(s + d * n, F.val(v)) };
      },
      // 何行目か・貯金
      s3(r) {
        if (r.chance(0.5)) {
          const s = r.pick([1000, 2000, 3000]), d = r.pick([200, 250, 500]), n = r.int(6, 20), goal = s + d * n;
          let row = 2, v = F.make(s);
          while (F.val(v) < goal) { v = F.add(v, F.make(d)); row++; }
          return {
            q: `B2 に ${s}、B3 に \`=B2+${d}\` を《入|い》れて《下|した》へコピー。${goal} になるのは □ 《行目|ぎょう|め》`,
            a: `$${n + 2}$`, easy: `$${s}+${d}\\times${n}=${goal}$ で${n}《回|かい》たすので、$2+${n}$`, easyCheck: false,
            verify: () => same(row, n + 2),
          };
        }
        const s = r.pick([1000, 2000, 3000, 5000]), d = r.pick([300, 500, 800, 1000]), n = r.pick([6, 10, 12, 18, 24]);
        return {
          q: `${s}《円|えん》から、《毎月|まい|つき》${d}《円|えん》ずつ《貯金|ちょ|きん》すると、${n}か《月後|げつ|ご》は □ 《円|えん》`,
          a: `$${s + d * n}$`, easy: `$${s}+${d}\\times${n}=${s + d * n}$`,
          verify: () => same(F.val(loop(s, x => F.add(x, F.make(d)), n)), s + d * n),
        };
      },
      // わな：毎回2倍（たし算でない。2-88 で）
      trap(r) {
        const s = r.pick([3, 5, 10, 100]), k = r.pick([2, 3]), row = r.int(4, 7);
        const v = sheet(s, x => F.mul(x, F.make(k)), row);
        return dest({
          q: `B2 に ${s}、B3 に \`=B2*${k}\` を《入|い》れて《下|した》へコピーすると、B${row} は □`, a: `$${nf(v)}$`,
          verify: () => same(s * Math.pow(k, row - 2), F.val(v)),
        }, '2-87', `たすのではなく、${k}をかけるくり《返|かえ》し`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-88
  M.add({
    id: '2-88', part: PART, chap: '2-18・2-19', stars: 1,
    title: '《同|おな》じ《数|かず》をくり《返|かえ》しかけるなら《累乗|るい|じょう》',
    mark: '《表計算|ひょう|けい|さん》の `=B2*2` を《下|した》へコピー、くり《返|かえ》しの《中|なか》の `x = x * 2`。**《同|おな》じ《数|かず》を《何回|なん|かい》もかける**。',
    futsu: ['100、200、400、800、…と、', '1つずつ2《倍|ばい》して', '《計算|けい|さん》していく。'],
    raku: ['B2 から B8 までに、かけるのは6《回|かい》。', T`$100\times2^{6}$`, T`$=100\times64=6400$`],
    why: T`2を6《回|かい》かけるのは $2^{6}$（2-7）。《回数|かい|すう》を《数|かぞ》えて《累乗|るい|じょう》にすれば、1つずつ《計算|けい|さん》しなくてよい（《教科書|きょう|か|しょ》2-18・2-19）。`,
    caution: '`=B2+100` のように、たすくり《返|かえ》しは《累乗|るい|じょう》にならない（わざ 2-87）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /`=B\d+\*[\d.]+`/.test(q) || /`(\w+) = \1 \* [\d.]+`/.test(q) || /ごとに[\d.]+倍/.test(q) || /回折る/.test(q); },
    steps: {
      s1(r) {
        const s = r.pick([1, 3, 5, 10, 25, 100]), k = r.pick([2, 2, 3, 10]), row = r.int(5, 9);
        const n = row - 2, v = sheet(s, x => F.mul(x, F.make(k)), row);
        if (F.val(v) > 1e6) return null;
        return {
          q: `B2 に ${s}、B3 に \`=B2*${k}\` を《入|い》れて《下|した》へコピーすると、B${row} は □`,
          a: `$${nf(v)}$`, easy: `$${s === 1 ? '' : `${s}\\times`}${k}^{${n}}=${nf(v)}$`,
          verify: () => same(s * Math.pow(k, n), F.val(v)),
        };
      },
      // プログラムのくり返し
      s2(r) {
        const name = r.pick(['x', 'n', 'a']), s = r.pick([1, 2, 3, 5, 10]), k = r.pick([2, 3, 5]), n = r.int(3, 7);
        const v = loop(s, x => F.mul(x, F.make(k)), n);
        if (F.val(v) > 1e5) return null;
        const q = r.chance(0.5)
          ? `\`${name} = ${s}\` のあと \`${name} = ${name} * ${k}\` を${n}《回|かい》くり《返|かえ》すと、\`${name}\` は □`
          : `\`${name} = ${s}\` のあと \`for i in range(${n}):\` で \`${name} = ${name} * ${k}\` をくり《返|かえ》すと、\`${name}\` は □`;
        return { q, a: `$${nf(v)}$`, easy: `$${s === 1 ? '' : `${s}\\times`}${k}^{${n}}=${nf(v)}$`, verify: () => same(s * Math.pow(k, n), F.val(v)) };
      },
      // ふえる菌・紙を折る・冷めるお湯（部屋との差）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const s = r.pick([10, 50, 100, 200]), step = r.pick([10, 15, 20, 30]), hours = r.int(1, 2), n = 60 * hours / step;
          if (n > 8) return null;
          const v = loop(s, x => F.mul(x, F.make(2)), n);
          return {
            q: `${step}${fun(step)}ごとに2《倍|ばい》にふえる《菌|きん》が、はじめ${s}こ。${hours}《時間後|じ|かん|ご》は □ こ`,
            a: `$${nf(v)}$`, easy: `$${s}\\times2^{${n}}=${nf(v)}$`,
            verify: () => same(s * Math.pow(2, n), F.val(v)),
          };
        }
        if (k === 1) {
          const t = r.pick([1, 2, 5]), n = r.int(3, 7), v = loop(1, x => F.mul(x, F.make(2)), n), th = F.mul(F.make(t, 10), v);
          return {
            q: `《厚|あつ》さ $${tenth(t)}\\,\\mathrm{mm}$ の《紙|かみ》を、《半分|はん|ぶん》に${n}《回|かい》《折|お》ると、《厚|あつ》さは □ mm`,
            a: `$${nf(th)}$`, easy: `$${tenth(t)}\\times2^{${n}}=${nf(th)}$`,
            verify: () => close(t / 10 * Math.pow(2, n), F.val(th)) || '厚さが合わない',
          };
        }
        const d0 = r.pick([40, 50, 60, 70, 80]), n = r.int(1, 3), v = loop(d0, x => F.mul(x, F.make(9, 10)), n);
        return {
          q: `お《湯|ゆ》と《部屋|へ|や》の《温度|おん|ど》の《差|さ》は、1${fun(1)}ごとに0.9《倍|ばい》になります。はじめの《差|さ》が${d0}℃のとき、${n}${funGo(n)}の《差|さ》は □ ℃`,
          a: `$${nf(v)}$`, easy: `$${d0}\\times0.9^{${n}}=${nf(v)}$`,
          verify: () => close(d0 * Math.pow(0.9, n), F.val(v)) || '差が合わない',
        };
      },
      // わな：毎回 ＋100（かけ算でない。2-87 で）
      trap(r) {
        const s = r.pick([100, 200, 500]), d = r.pick([2, 100, 50]), row = r.int(5, 9);
        const v = sheet(s, x => F.add(x, F.make(d)), row);
        return dest({
          q: `B2 に ${s}、B3 に \`=B2+${d}\` を《入|い》れて《下|した》へコピーすると、B${row} は □`, a: `$${nf(v)}$`,
          verify: () => same(s + d * (row - 2), F.val(v)),
        }, '2-88', `かけるのではなく、${d}をたすくり《返|かえ》し`);
      },
    },
  });

  // ---------------------------------------------------------------- 2-89
  // 2進数の小数（分数 f、整数の部分もふくむ）→ '10.11'
  function binFrac(f) {
    const ip = Math.floor(F.val(f));
    let rest = F.sub(f, F.make(ip)), s = '';
    for (let i = 0; i < 12 && rest[0] !== 0; i++) { rest = F.mul(rest, F.make(2)); const b = rest[0] >= rest[1] ? 1 : 0; s += b; if (b) rest = F.sub(rest, F.make(1)); }
    return bin(ip) + (s ? '.' + s : '');
  }
  // '0.011' → 分数（位の値をたす：計算し直し）
  function fromBin(s) {
    const [i, f = ''] = s.split('.');
    let v = F.make(parseInt(i, 2));
    f.split('').forEach((c, k) => { if (c === '1') v = F.add(v, F.make(1, Math.pow(2, k + 1))); });
    return v;
  }
  const fracSum = f => {
    const s = binFrac(f).split('.')[1] || '';
    return s.split('').map((c, k) => (c === '1' ? T`\frac{1}{${Math.pow(2, k + 1)}}` : '')).filter(x => x).join('+');
  };
  M.add({
    id: '2-89', part: PART, chap: '2-19', stars: 1,
    title: T`2《進数|しん|すう》の《小数|しょう|すう》は $\frac{1}{2}$・$\frac{1}{4}$・$\frac{1}{8}$ の《位|くらい》`,
    mark: '**《分母|ぶん|ぼ》が2・4・8・16**になる《小数|しょう|すう》（0.5・0.25・0.375）を2《進数|しん|すう》に。',
    futsu: ['0.375を2《倍|ばい》して0.75、', '2《倍|ばい》して1.5、…と《整数|せい|すう》の', '《部分|ぶ|ぶん》をならべていく。'],
    raku: [T`$0.375=\frac{3}{8}=\frac{1}{4}+\frac{1}{8}$`, T`$\frac{1}{2}$ の《位|くらい》は0、$\frac{1}{4}$ と $\frac{1}{8}$ は1`, T`→ $0.011_{(2)}$`],
    why: T`2《進数|しん|すう》の《小数|しょう|すう》の《位|くらい》は、《右|みぎ》へ1つ《進|すす》むごとに $\frac{1}{2}$ になる（《教科書|きょう|か|しょ》2-19）。《大|おお》きい《位|くらい》から《使|つか》う（2-83）のと《同|おな》じ。`,
    caution: '0.1や0.3は、2《進数|しん|すう》では《終|お》わらない（《分母|ぶん|ぼ》の10に5がある）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 2,
    boxw: { s1: '20mm', s2: '18mm', s3: '22mm', trap: '20mm' },
    fits(q) {
      if (/^\$[01]+\.[01]+_\{\(2\)\}=□\$$/.test(q)) return true;
      const m = q.match(/^\$(\d+\.\d+|\\frac\{\d+\}\{\d+\})=□_\{\(2\)\}\$$/);
      if (!m) return false;
      const f = m[1].startsWith('\\') ? F.make(...m[1].match(/\d+/g).map(Number)) : F.fromDec(m[1]);
      return isPow2(f[1]) && f[1] > 1;
    },
    steps: {
      // 10進数の小数 → 2進数
      s1(r) {
        const d = r.pick([2, 4, 8, 8, 16, 16]), n = r.int(1, d - 1), f = F.make(n, d);
        if (f[1] !== d) return null;
        const s = binFrac(f);
        return { q: `$${dstr(f)}=□_{(2)}$`, a: `$${B2(s)}$`, easy: `$${dstr(f)}=${fracSum(f)}$`, verify: () => F.eq(fromBin(s), F.fromDec(dstr(f))) || '位の値の和が合わない' };
      },
      // 2進数の小数 → 10進数
      s2(r) {
        const d = r.pick([4, 8, 16]), n = r.int(1, d - 1), f = F.make(n, d), s = binFrac(f);
        if (f[1] < 4) return null;
        return {
          q: `$${B2(s)}=□$`, a: `$${dstr(f)}$`, easy: `$${fracSum(f)}=${dstr(f)}$`,
          verify: () => F.eq(fromBin(s), F.fromDec(dstr(f))) || '位の値の和が合わない',
        };
      },
      // 整数の部分がある・分数から
      s3(r) {
        const k = r.int(0, 2), d = k === 2 ? r.pick([4, 8, 16]) : r.pick([2, 4, 8]), n = k === 2 ? 2 * r.int(1, d / 2) - 1 : r.int(1, d - 1), ip = k === 2 ? 0 : r.int(1, 7), f = F.add(F.make(ip), F.make(n, d)), s = binFrac(f);
        if (k === 0) return { q: `$${dstr(f)}=□_{(2)}$`, a: `$${B2(s)}$`, easy: `$${ip}=${B2(bin(ip))}$、$${dstr(F.make(n, d))}=${fracSum(F.make(n, d))}$`, verify: () => F.eq(fromBin(s), f) || '計算し直すと合わない' };
        if (k === 1) return { q: `$${B2(s)}=□$`, a: `$${dstr(f)}$`, easy: `$${B2(bin(ip))}=${ip}$、のこりは $${dstr(F.make(n, d))}$`, easyCheck: false, verify: () => F.eq(fromBin(s), f) || '計算し直すと合わない' };
        const g = F.make(n, d);
        if (g[1] !== d) return null;
        return { q: T`$\frac{${n}}{${d}}=□_{(2)}$`, a: `$${B2(s)}$`, easy: `$\\frac{${n}}{${d}}=${fracSum(g)}$`, verify: () => F.eq(fromBin(s), g) || '計算し直すと合わない' };
      },
      // わな：0.1・0.3（2進数では終わらない）
      trap(r) {
        const n = r.pick([1, 2, 3, 4, 6, 7, 8, 9]), f = F.make(n, 10);
        return dest({
          q: `$${tenth(n)}$ を2《進数|しん|すう》で《表|あらわ》すと、《小数|しょう|すう》のけたは □`, a: '《終|お》わらない',
          verify: () => !isPow2(f[1]) || '分母が2の累乗になっている',
        }, '2-89', '《分母|ぶん|ぼ》に5があるので、$\\frac{1}{2}$・$\\frac{1}{4}$・…をいくら《集|あつ》めてもちょうどにならない');
      },
    },
  });

  // ---------------------------------------------------------------- 2-99
  // 2進数の ×2・×4・×8 は、うしろに0を1・2・3つ
  const zeros = k => ({ 2: 1, 4: 2, 8: 3 })[k];
  M.add({
    id: '2-99', part: PART, chap: '2-17', stars: 2,
    title: '2《進数|しん|すう》を2《倍|ばい》すると、うしろに0がつく',
    mark: T`**2《進数|しん|すう》の $\times2$・$\times4$・$\div2$**。10《進数|しん|すう》の ×10 と《同|おな》じしくみ。`,
    futsu: [T`$101_{(2)}=5$、$5\times2=10$、`, T`$10=8+2=1010_{(2)}$ と、`, '10《進数|しん|すう》を《通|とお》る。'],
    raku: ['どの《位|くらい》も2《倍|ばい》で1つ《左|ひだり》へ', T`$101_{(2)}\times2=1010_{(2)}$`, '（うしろに0を1つ）'],
    why: T`2《進数|しん|すう》の《位|くらい》は2《倍|ばい》ずつ。2《倍|ばい》するとどの1も1つ《左|ひだり》の《位|くらい》へ《動|うご》く。$\times4=\times2\times2$ なら0が2つ。`,
    caution: T`$\times3$ は0をつけるだけではできない。10《進数|しん|すう》の $101\times2$ は202。`,
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '16mm', s3: '24mm', trap: '20mm' },
    fits(q) {
      if (/_\{\(2\)\}\\(times|div)(2|4|8)=□_\{\(2\)\}/.test(q)) return true;
      if (/^\$□_\{\(2\)\}\\times(2|4|8)=[01]+_\{\(2\)\}\$$/.test(q)) return true;
      return /_\{\(2\)\}/.test(q) && /なので/.test(q) && /□/.test(q);
    },
    steps: {
      s1(r) {
        const n = r.int(3, 31), k = r.pick([2, 2, 4, 8]);
        if (n % 2 === 0) return null;
        return {
          q: T`$${B2(bin(n))}\times${k}=□_{(2)}$`, a: `$${B2(bin(n * k))}$`,
          easy: `うしろに0を${zeros(k)}つ`, verify: () => same(parseInt(bin(n * k), 2), parseInt(bin(n), 2) * k),
        };
      },
      // ÷2・÷4、□×2
      s2(r) {
        const n = r.int(3, 31), k = r.pick([2, 4]);
        if (n % 2 === 0) return null;
        if (r.chance(0.6)) {
          return {
            q: T`$${B2(bin(n * k))}\div${k}=□_{(2)}$`, a: `$${B2(bin(n))}$`,
            easy: `うしろの0を${zeros(k)}つとる`, verify: () => same(parseInt(bin(n * k), 2) / k, parseInt(bin(n), 2)),
          };
        }
        return {
          q: T`$□_{(2)}\times${k}=${B2(bin(n * k))}$`, a: `$${B2(bin(n))}$`,
          easy: `うしろの0を${zeros(k)}つとる`, verify: () => same(parseInt(bin(n), 2) * k, parseInt(bin(n * k), 2)),
        };
      },
      // 10進数とのつながり
      s3(r) {
        const n = r.int(5, 31), k = r.pick([2, 4]);
        if (n % 2 === 0) return null;
        if (r.chance(0.5)) {
          return {
            q: `$${n}=${B2(bin(n))}$ なので、$${n * k}=□_{(2)}$`, a: `$${B2(bin(n * k))}$`,
            easy: `${n * k}は${n}の${k}《倍|ばい》。うしろに0を${zeros(k)}つ`, verify: () => same(parseInt(bin(n * k), 2), n * k),
          };
        }
        return {
          q: `$${B2(bin(n))}=${n}$ なので、$${B2(bin(n * k))}=□$`, a: `$${n * k}$`,
          easy: `0が${zeros(k)}つふえたので${k}《倍|ばい》：$${n}\\times${k}=${n * k}$`,
          verify: () => same(parseInt(bin(n * k), 2), n * k),
        };
      },
      // わな：×3（0をつけるだけではできない）／10進数の ×2
      trap(r) {
        const n = r.int(3, 15);
        if (n % 2 === 0) return null;
        if (r.chance(0.5)) {
          return dest({
            q: T`$${B2(bin(n))}\times3=□_{(2)}$`, a: `$${B2(bin(3 * n))}$`,
            verify: () => same(parseInt(bin(3 * n), 2), 3 * n),
          }, '2-99', T`3《倍|ばい》は2《倍|ばい》と1《倍|ばい》の《和|わ》。$${B2(bin(2 * n))}+${B2(bin(n))}$`);
        }
        const x = parseInt(bin(n), 10);
        return dest({ q: T`$${x}\times2=□$`, a: `$${2 * x}$`, verify: () => same(M.evalMath(`${x}*2`), 2 * x) },
          '2-99', T`$_{(2)}$ がない10《進数|しん|すう》。0をつけるのは $\times10$ のとき`);
      },
    },
  });
})(globalThis.MONDAI);
