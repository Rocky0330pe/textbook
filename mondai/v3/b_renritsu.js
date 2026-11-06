/* 問題集 第3巻　第2部 連立方程式と反比例（わざ 3-15〜3-27）　組 b
 * 書き方は v2/README.md（第2・3巻）と v1/README.md（わざの形）。文はルビつき・分かち書きなし、式は $…$。
 *
 * 連立方程式の問題の文（本とアプリの両方で読めるように、波かっこ cases は使わない）：
 *   「$x+y=7$、$x-y=1$ の《解|かい》は □」…… 2つの式を「、」でならべ、最後に「の解は □」。欄は1つ（広い欄 36mm）。
 *   答えは教科書 3-6 と同じ「$x=4$、$y=3$」。解なし・無数は 3-22 で「の解（1組・なし・無数） □」と問う。
 *   文字が a・b（3-16 の見かけがちがう）、I_1・I_2（回路の式）のときも同じ形。
 * 解の組・解なし・無数・ことばの答えは verify で確かめる（式を読みとり、解を2つの式に入れて成り立つか）。
 * 見わけよう（fits）：問題の文から2つの式を読みとり、係数をくらべる（KG）。加減法のわざは、2つとも
 *   「$ax+by=c$」の形（文字が左辺だけ）のときに当たる。「$y=\cdots$」の形があれば代入法（3-15）。
 * わな（第29回 H-1）：連立方程式は、どれかの解き方ではかならず解けるので、わなには行き先を書く（dest）。 */
(function (M) {
  'use strict';
  const PART = 2;

  // ---------------------------------------------------------------- 数と式の書き方
  const nm = v => String(+(+v).toFixed(6));          // 0.30000000004 などを出さない
  // 項：係数 c、文字 v（'' なら数の項）。first は式の先頭
  function term(c, v, first) {
    if (!c) return '';
    const sg = c < 0 ? '-' : first ? '' : '+';
    const m = Math.abs(c);
    return sg + (v ? (m === 1 ? '' : nm(m)) + v : nm(m));
  }
  // 1次式 [[係数, 文字], …]
  function lin(ts) {
    let out = '';
    for (const [c, v] of ts) out += term(c, v, out === '');
    return out || '0';
  }
  const std = (a, b, c, u, w) => `${lin([[a, u || 'x'], [b, w || 'y']])}=${nm(c)}`;      // ax+by=c
  const stdR = (a, b, c, u, w) => `${lin([[b, w || 'y'], [a, u || 'x']])}=${nm(c)}`;     // by+ax=c（y の項が先）
  const yf = (m, k, u, w) => `${w || 'y'}=${lin([[m, u || 'x'], [k, '']])}`;             // y=mx+k
  const SOLVE = 'の《解|かい》は □';
  const WHICH = 'の《解|かい》（1《組|くみ》・なし・《無数|む|すう》） □';
  const sysQ = (e1, e2) => `$${e1}$、$${e2}$ ${SOLVE}`;
  const solA = (x, y, u, w) => `$${u || 'x'}=${nm(x)}$、$${w || 'y'}=${nm(y)}$`;
  const two = (x, y) => `$${nm(x)}$、$${nm(y)}$`;
  const keyOf = (e1, e2) => 'sys:' + [e1, e2].sort().join('|');   // 式の順を入れかえただけなら同じ問題（H-6）
  const nz = (r, lo, hi) => r.intNot(lo, hi, v => v === 0);
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  // 約分した分数（TeX）
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    if (d === 1) return String(n);
    return (n < 0 ? '-' : '') + `\\frac{${Math.abs(n)}}{${d}}`;
  }
  const isFrac = (n, d) => n % d !== 0;
  const U = (n, u) => `$${nm(n)}\\,\\mathrm{${u}}$`;
  const FUN = '《分速|ふん|そく》';
  // 「3分」「3分後」の読み（第30回 J-3。一の位が 1・3・4・6・8・0 なら ぷん）
  const FN = n => `${n} ${M.fun(n)}`, FG = n => `${n}《分後|${M.funYomi(n)}|ご》`;
  const close = (a, b) => Math.abs(a - b) < 1e-9;
  const isInt = v => close(v, Math.round(v));

  // ---------------------------------------------------------------- 連立方程式を読む（fits・verify）
  // I_{1}・I_{2} は1字の文字 u・w として読む
  const prep = s => s.replace(/I_\{?1\}?/g, 'u').replace(/I_\{?2\}?/g, 'w');
  // 1つの1次方程式「左辺=右辺」を ax+by=c に（vs は文字2つ）。1次式でなければ null
  function coef(eq, vs) {
    const k = eq.split('=');
    if (k.length !== 2) return null;
    const f = (x, y) => {
      const o = { [vs[0]]: x, [vs[1]]: y };
      const L = M.evalMath(k[0], o), R = M.evalMath(k[1], o);
      return L == null || R == null ? null : L - R;
    };
    const c0 = f(0, 0), fx = f(1, 0), fy = f(0, 1), f2 = f(2, 3);
    if ([c0, fx, fy, f2].some(v => v == null)) return null;
    const a = fx - c0, b = fy - c0;
    if (!close(f2, c0 + 2 * a + 3 * b)) return null;
    return { a, b, c: -c0 };
  }
  // 式の形：'std'（文字は左辺だけ）、'sub'（片方の辺が文字1つだけ。$y=\cdots$）、'other'
  function form(eq, vs) {
    const [L, R] = eq.split('=').map(t => t.trim());
    const has = (t, v) => M.mathVars(t).includes(v);
    for (const v of vs) if ((L === v && !has(R, v)) || (R === v && !has(L, v))) return 'sub';
    return vs.some(v => has(R, v)) ? 'other' : 'std';
  }
  // 「$式1$、$式2$ の解は □」を読む（q はルビをとった文）
  function parseSys(q) {
    const m = /\$([^$]*)\$、\$([^$]*)\$ の解(は|（1組・なし・無数）) □$/.exec(prep(q));
    if (!m) return null;
    const vs = [...new Set(M.mathVars(m[1]).concat(M.mathVars(m[2])))].sort();
    if (vs.length !== 2) return null;
    const e = [m[1], m[2]].map(t => coef(t, vs));
    if (e.some(v => !v)) return null;
    const f = [m[1], m[2]].map(t => form(t, vs));
    return { e, f, vs, det: e[0].a * e[1].b - e[0].b * e[1].a, which: m[3] !== 'は' };
  }
  const solveSys = q => { const p = parseSys(q); return p && !p.which && !close(p.det, 0) ? p : null; };
  // 2つの式の、同じ文字の係数のくらべ（k=0 は1つめの文字、1 は2つめ）
  function rel(p, k) {
    const c1 = k ? p.e[0].b : p.e[0].a, c2 = k ? p.e[1].b : p.e[1].a;
    if (!c1 || !c2) return 'zero';
    if (close(c1, c2)) return 'eq';
    if (close(c1, -c2)) return 'op';
    if (isInt(c1) && isInt(c2) && (isInt(c1 / c2) || isInt(c2 / c1))) return 'mul';
    return 'none';
  }
  const REL = p => [rel(p, 0), rel(p, 1)];
  const allInt = p => p.e.every(e => isInt(e.a) && isInt(e.b));
  const bothStd = p => p.f[0] === 'std' && p.f[1] === 'std';
  const swapped = p => {
    const [e1, e2] = p.e;
    return !close(Math.abs(e1.a), Math.abs(e1.b)) && ((close(e1.a, e2.b) && close(e1.b, e2.a)) || (close(e1.a, -e2.b) && close(e1.b, -e2.a)));
  };
  // 加減法のわざ：2つとも ax+by=c の形のとき
  const KG = {
    '3-16': p => REL(p).includes('eq'),
    '3-17': p => REL(p).includes('op'),
    '3-18': p => allInt(p) && !REL(p).some(x => x === 'eq' || x === 'op') && REL(p).includes('mul'),
    '3-19': p => allInt(p) && REL(p).every(x => x === 'none'),
    '3-20': p => allInt(p) && swapped(p),
  };
  const kgFits = id => q => { const p = solveSys(q); return !!p && bothStd(p) && KG[id](p); };
  // ax+by=c の係数（E）に当たる加減法のわざ
  const kgOf = E => Object.keys(KG).filter(id => KG[id]({ e: E, f: ['std', 'std'] }));

  // 解 (x, y) を2つの式に入れて確かめる（文から読みとる）
  function vSys(q, x, y) {
    return () => {
      const p = parseSys(M.plain(q));
      if (!p) return '式が読めない';
      if (close(p.det, 0)) return '解が1組でない';
      for (const e of p.e) if (!close(e.a * x + e.b * y, e.c)) return `解 ${x}, ${y} が式に合わない`;
      return true;
    };
  }
  // 1つの式の係数と右辺が、同じ数でわれないか（第30回 J-2・第3巻 R1-8・R1-12）。
  // 小数の式は 10・100 倍してから見る（$0.6x+0.4y=4.4$ → $6x+4y=44$ は 2 でわれる）。分数の式は分母の公倍数をかけて見る
  function primEq(e) {
    for (const m of [1, 10, 100, 1000].concat(Array.from({ length: 1000 }, (_, i) => i + 1))) {
      const v = [e.a, e.b, e.c].map(t => t * m);
      if (v.every(isInt)) return v.reduce((g, t) => gcd(g, Math.round(t)), 0) === 1;
    }
    return true;
  }
  const primSys = q => { const p = parseSys(M.plain(q)); return !p || p.e.every(primEq); };
  // 連立方程式の問題（どちらかの式が同じ数でわれるときは null。作り直す）
  function mk(e1, e2, x, y, easy, extra) {
    if (!primSys(sysQ(e1, e2))) return null;
    const p = { q: sysQ(e1, e2), a: solA(x, y), easy, key: keyOf(e1, e2) };
    p.verify = vSys(p.q, x, y);
    return Object.assign(p, extra || {});
  }
  // 係数 {a,b,c} を2つ。解 (x, y) から右辺を決める
  const E = (a, b, x, y) => ({ a, b, c: a * x + b * y });
  // 加減法の楽な形：k の文字を消す。1つめ×m1、2つめ×m2 してから、たす・ひく
  // xy に解 [x, y] を渡すと、残った文字の係数が1でないとき、その値も書く
  function elim(Es, k, m1, m2, vs, xy) {
    vs = vs || ['x', 'y'];
    const g = e => (k ? e.b : e.a), o = e => (k ? e.a : e.b);
    const sub = Math.sign(m1 * g(Es[0])) === Math.sign(m2 * g(Es[1]));
    const s = sub ? -1 : 1;
    const co = m1 * o(Es[0]) + s * m2 * o(Es[1]), cc = m1 * Es[0].c + s * m2 * Es[1].c;
    const mul = [m1 > 1 ? `1つめ×${m1}` : '', m2 > 1 ? `2つめ×${m2}` : ''].filter(Boolean).join('、');
    const ov = vs[k ? 0 : 1];
    const val = xy && co !== 1 ? `、$${ov}=${nm(xy[k ? 0 : 1])}$` : '';
    return `${mul ? mul + 'で、' : ''}${sub ? 'ひいて' : 'たして'} $${lin([[co, ov]])}=${nm(cc)}$${val}`;
  }
  // わなの行き先（H-1・H-2）：同じ部のほかのわざの fits と、extra（形を変えると使えるわざ）
  function dest(p, self, why, extra) {
    if (!p) return null;
    const q = M.plain(p.q);
    const also = M.list(3).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `${why.endsWith('して') ? '' : '。'}わざ ${also.join('・')} で` : ''}）`;
    return p;
  }
  // 解の組（整数）
  const sol = r => [nz(r, -4, 6), nz(r, -4, 6)];
  const KO = '《個|こ》', EN = '《円|えん》';
  const ITEMS = [['りんご', 'みかん'], ['ケーキ', 'プリン'], ['おにぎり', 'パン'], ['ノート', 'ペン']];

  // ---------------------------------------------------------------- 3-15
  // a·u + b·(inner)=c の形（代入した式）
  const paren = (a, inner, first) => (a === 1 ? (first ? '' : '+') : a === -1 ? '-' : (a > 0 && !first ? '+' : '') + nm(a)) + `(${inner})`;
  M.add({
    id: '3-15', part: PART, chap: '3-6②', stars: 1,
    title: '$y=$ の《式|しき》があれば《代入法|だい|にゅう|ほう》',
    mark: '「$y=\\cdots$」か「$x=\\cdots$」の《式|しき》が**ある**。どちらも $y=$ なら、《右辺|う|へん》どうしを《等|ひと》しくおく。',
    futsu: ['$y=2x-1$ を $-2x+y=-1$ と《移項|い|こう》し、', '《係数|けい|すう》をそろえて《加減法|か|げん|ほう》で《解|と》く。'],
    raku: ['$3x+2y=12$ の $y$ に $2x-1$ を《入|い》れる。', '$3x+2(2x-1)=12$', '$7x=14$、$x=2$、$y=3$'],
    why: '$y$ は $2x-1$ と《等|ひと》しいので、そのまま《入|い》れれば $y$ が《消|き》える（3-6②）。',
    caution: 'かっこをつけないと、$-1$ にかけ《忘|わす》れる。$2y=\\cdots$ のように $y$ に《数|かず》がつけば《加減法|か|げん|ほう》で。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '20mm', trap: '36mm' },
    counts: { s1: 9, s2: 6, s3: 4, trap: 2 },
    fits(q) { const p = solveSys(q); return !!p && p.f.includes('sub'); },
    steps: {
      // y=mx+k と ax+by=c
      s1(r) {
        const [x, y] = sol(r), m = nz(r, -3, 4), k = y - m * x;
        if (!k || Math.abs(k) > 12) return null;
        const a = nz(r, -3, 5), b = r.pick([-4, -3, -2, 2, 3, 4]);
        if (a + b * m === 0) return null;
        const c = a * x + b * y, e1 = yf(m, k), e2 = std(a, b, c);
        const easy = `$${lin([[a, 'x']])}${paren(b, lin([[m, 'x'], [k, '']]))}=${c}$、$x=${x}$`;
        return r.chance(0.5) ? mk(e1, e2, x, y, easy) : mk(e2, e1, x, y, easy);
      },
      // どちらも y=（右辺どうしを等しく）・x= の形・もう1つの式の y の係数が ±1（加減法でもよい）
      s2(r) {
        const [x, y] = sol(r), kind = r.int(0, 2);
        if (kind === 0) {
          const m1 = nz(r, -3, 4), m2 = nz(r, -3, 4);
          if (m1 === m2) return null;
          const k1 = y - m1 * x, k2 = y - m2 * x;
          if (!k1 || !k2 || Math.abs(k1) > 12 || Math.abs(k2) > 12) return null;
          const l = lin([[m1, 'x'], [k1, '']]), rr = lin([[m2, 'x'], [k2, '']]);
          return mk(yf(m1, k1), yf(m2, k2), x, y, `$${l}=${rr}$、$x=${x}$`);
        }
        if (kind === 1) {
          const m = nz(r, -3, 3), k = x - m * y;
          if (!k || Math.abs(k) > 12) return null;
          const a = r.pick([-3, -2, 2, 3, 4]), b = nz(r, -4, 4);
          if (a * m + b === 0) return null;
          const c = a * x + b * y, e1 = yf(m, k, 'y', 'x'), e2 = std(a, b, c);
          const easy = `$${paren(a, lin([[m, 'y'], [k, '']]), true)}${term(b, 'y', false)}=${c}$、$y=${y}$`;
          return r.chance(0.5) ? mk(e1, e2, x, y, easy) : mk(e2, e1, x, y, easy);
        }
        const m = nz(r, -3, 4), k = y - m * x;
        if (!k || Math.abs(k) > 12) return null;
        const a = nz(r, -3, 4), b = r.pick([1, -1]);
        if (a + b * m === 0 || a === -b * m || a === b * m) return null;
        const c = a * x + b * y;
        // y=mx+k を -mx+y=k にすると、y の係数がそろう（3-16）・符号だけちがう（3-17）
        return mk(yf(m, k), std(a, b, c), x, y, `$${lin([[a, 'x']])}${paren(b, lin([[m, 'x'], [k, '']]))}=${c}$、$x=${x}$`, { also: [b === 1 ? '3-16' : '3-17'] });
      },
      // 交点の座標・2人で荷物をかつぐ（力のつり合い）・ねだんの差
      s3(r) {
        const kind = r.pick([0, 0, 1, 2]);
        if (kind === 0) {
          const [x, y] = sol(r), m = nz(r, -3, 3), k = y - m * x;
          if (!k || Math.abs(k) > 10) return null;
          const a = nz(r, 1, 4), b = r.pick([-3, -2, 2, 3]);
          if (a + b * m === 0) return null;
          const c = a * x + b * y;
          if (gcd(gcd(a, b), c) > 1) return null;   // 式が同じ数でわれない（J-2）
          return {
            q: `《直線|ちょく|せん》 $${yf(m, k)}$ と $${std(a, b, c)}$ の《交点|こう|てん》の《座標|ざ|ひょう》 □`,
            a: `$(${x},\\ ${y})$`, easy: `$${lin([[a, 'x']])}${paren(b, lin([[m, 'x'], [k, '']]))}=${c}$、$x=${x}$`,
            verify: () => (y === m * x + k && a * x + b * y === c) || '交点が合わない',
          };
        }
        if (kind === 1) {
          const k = r.int(2, 4), B = r.int(5, 15) * 10, W = (k + 1) * B;
          return {
            q: `${U(W, 'N')} の《荷物|に|もつ》をAとBでかつぐ。Aの《力|ちから》はBの${k}《倍|ばい》。A □ N、B □ N`,
            a: two(k * B, B), easy: `$x+y=${W}$ に $x=${k}y$ を《入|い》れて $${k + 1}y=${W}$`,
            verify: () => (k * B + B === W) || '力の和が合わない',
          };
        }
        const [s, t] = r.pick(ITEMS), y = r.int(5, 12) * 10, d = r.int(2, 8) * 10, x = y + d;
        const p = r.int(2, 4), q = r.int(1, 4), c = p * x + q * y;
        return {
          q: `${s}は${t}より1${KO} ${d} ${EN}《高|たか》く、${s}${p}${KO}と${t}${q}${KO}で ${c} ${EN}。${s} □ ${EN}、${t} □ ${EN}（1${KO}）`,
          a: two(x, y), easy: `$${p}(y+${d})+${q}y=${c}$、$y=${y}$`,
          verify: () => (x - y === d && p * x + q * y === c) || 'ねだんが合わない',
        };
      },
      // わな：$2y=\cdots$（y に数がつく。入れると分数になる）。移項して加減法へ
      trap(r) {
        const [x, y] = sol(r), k = r.pick([2, 3]), m = r.intNot(-5, 5, v => Math.abs(v) < 2 || v % k === 0);   // x も y もひとりにならない
        const c1 = k * y - m * x;
        const a = nz(r, -4, 5), b = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
        if (b % k === 0 || k % b === 0) return null;
        const E1 = { a: -m, b: k, c: c1 }, E2 = E(a, b, x, y);
        if (E1.a * E2.b - E1.b * E2.a === 0 || !c1 || Math.abs(c1) > 20) return null;
        const e1 = `${k}y=${lin([[m, 'x'], [c1, '']])}`, e2 = std(a, b, E2.c);
        const p = mk(e1, e2, x, y, '');
        return dest(p, '3-15', '$y=$ の《形|かたち》ではない。$y$ が《分数|ぶん|すう》になる。《移項|い|こう》して', kgOf([E1, E2]));
      },
    },
  });

  // ---------------------------------------------------------------- 3-16
  M.add({
    id: '3-16', part: PART, chap: '3-6③', stars: 1,
    title: '《係数|けい|すう》がそろった《文字|も|じ》はひいて《消|け》す',
    mark: '2つの《式|しき》で、《同|おな》じ《文字|も|じ》の《係数|けい|すう》が**そろっている**（《符号|ふ|ごう》も《同|おな》じ）。',
    futsu: ['$2x+3y=420$、$2x+y=300$', '$y=300-2x$ にして《代入|だい|にゅう》し、', '$2x+3(300-2x)=420$ を《解|と》く。'],
    raku: ['1つめから2つめをひく。', '$2y=120$、$y=60$', '$2x+60=300$、$x=120$'],
    why: '《等式|とう|しき》どうしをひいても、つり《合|あ》いは《変|か》わらない。そろった《項|こう》は0になる（3-6③）。',
    caution: '《符号|ふ|ごう》が《反対|はん|たい》ならたす（わざ 3-17）。マイナスの《項|こう》をひくとプラスになる。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '36mm', trap: '36mm' },
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    fits: kgFits('3-16'),
    steps: {
      s1(r) {
        const [x, y] = sol(r), k = r.int(0, 1), s = r.int(2, 5), p = nz(r, -5, 6), q = nz(r, -5, 6);
        if (p === q || p === -q) return null;
        const E1 = k ? E(p, s, x, y) : E(s, p, x, y), E2 = k ? E(q, s, x, y) : E(s, q, x, y);
        return mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, elim([E1, E2], k, 1, 1, null, [x, y]));
      },
      // そろった係数がマイナス・y の項が先に書いてある
      s2(r) {
        const [x, y] = sol(r), k = r.int(0, 1), neg = r.chance(0.6), s = (neg ? -1 : 1) * r.int(1, 5), p = nz(r, -5, 6), q = nz(r, -5, 6);
        if (p === q || p === -q || (!neg && s === 1)) return null;
        const E1 = k ? E(p, s, x, y) : E(s, p, x, y), E2 = k ? E(q, s, x, y) : E(s, q, x, y);
        const f = (e, rev) => (rev ? stdR : std)(e.a, e.b, e.c);
        const rev = neg ? r.int(0, 2) : r.int(1, 2);   // 0：そのまま 1：1つめを y から 2：2つめを y から
        return mk(f(E1, rev === 1), f(E2, rev === 2), x, y, elim([E1, E2], k, 1, 1, null, [x, y]));
      },
      // ねだんの問題・文字が a と b
      s3(r) {
        if (r.chance(0.5)) {
          const [s, t] = r.pick(ITEMS), x = r.int(6, 15) * 10, y = r.int(3, 9) * 10, n = r.int(2, 4), p = r.int(1, 5), q = r.int(1, 5);
          if (p === q || gcd(n, p) > 1 || gcd(n, q) > 1) return null;   // 1つの式が同じ数でわれない（J-2）
          const c1 = n * x + p * y, c2 = n * x + q * y;
          return {
            q: `${s}${n}${KO}と${t}${p}${KO}で ${c1} ${EN}、${s}${n}${KO}と${t}${q}${KO}で ${c2} ${EN}。${s} □ ${EN}、${t} □ ${EN}（1${KO}）`,
            a: two(x, y), easy: `ひいて $${lin([[p - q, 'y']])}=${c1 - c2}$、$y=${y}$`,
            verify: () => (n * x + p * y === c1 && n * x + q * y === c2) || 'ねだんが合わない',
          };
        }
        const [x, y] = sol(r), k = r.int(0, 1), s = r.pick([-3, -2, 2, 3, 4]), p = nz(r, -4, 5), q = nz(r, -4, 5);
        if (p === q || p === -q) return null;
        const E1 = k ? E(p, s, x, y) : E(s, p, x, y), E2 = k ? E(q, s, x, y) : E(s, q, x, y);
        const e1 = std(E1.a, E1.b, E1.c, 'a', 'b'), e2 = std(E2.a, E2.b, E2.c, 'a', 'b');
        const p2 = mk(e1, e2, x, y, elim([E1, E2], k, 1, 1, ['a', 'b'], [x, y]));
        if (!p2) return null;
        p2.a = solA(x, y, 'a', 'b');
        return p2;
      },
      // わな：係数が入れかわっている（2x+3y と 3x+2y。そろっていない）
      trap(r) {
        const [x, y] = sol(r), a = r.int(2, 6), b = r.int(2, 6);
        if (a === b) return null;
        const E1 = E(a, b, x, y), E2 = E(b, a, x, y);
        return dest(mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, ''), '3-16', '《係数|けい|すう》がそろっていない');
      },
    },
  });

  // ---------------------------------------------------------------- 3-17
  M.add({
    id: '3-17', part: PART, chap: '3-6③', stars: 1,
    title: '《符号|ふ|ごう》だけちがう《係数|けい|すう》はたして《消|け》す',
    mark: '$+y$ と $-y$、$+2x$ と $-2x$ のように、《係数|けい|すう》の**《符号|ふ|ごう》だけがちがう**。',
    futsu: ['$x+y=7$、$x-y=1$ で、', '$y=7-x$ にして《代入|だい|にゅう》し、', '$x-(7-x)=1$ を《解|と》く。'],
    raku: ['2つの《式|しき》をたす。', '$2x=8$、$x=4$', '$4+y=7$、$y=3$'],
    why: '$+y$ と $-y$ は、たすと0になって《消|き》える（3-6③）。',
    caution: '《符号|ふ|ごう》が《同|おな》じなら、たさずにひく（わざ 3-16）。《大|おお》きさがちがえば、かけてそろえる。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '15mm', trap: '36mm' },
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits: kgFits('3-17'),
    steps: {
      s1(r) {
        const [x, y] = sol(r), k = r.int(0, 1), s = r.int(1, 4), p = nz(r, -5, 6), q = nz(r, -5, 6);
        if (p === q || p === -q) return null;
        const E1 = k ? E(p, s, x, y) : E(s, p, x, y), E2 = k ? E(q, -s, x, y) : E(-s, q, x, y);
        return mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, elim([E1, E2], k, 1, 1, null, [x, y]));
      },
      // マイナスが1つめにある・y の項が先・x を消す
      s2(r) {
        const [x, y] = sol(r), k = r.int(0, 1), s = r.int(2, 5), p = nz(r, -5, 6), q = nz(r, -5, 6);
        if (p === q || p === -q) return null;
        const E1 = k ? E(p, -s, x, y) : E(-s, p, x, y), E2 = k ? E(q, s, x, y) : E(s, q, x, y);
        const rev = r.int(0, 2);
        const f = (e, rv) => (rv ? stdR : std)(e.a, e.b, e.c);
        return mk(f(E1, rev === 1), f(E2, rev === 2), x, y, elim([E1, E2], k, 1, 1, null, [x, y]));
      },
      // 和と差・川の上り下り
      s3(r) {
        if (r.chance(0.5)) {
          const b = r.int(3, 40), a = b + r.int(2, 30), S = a + b, D = a - b;
          return {
            q: `《和|わ》が ${S}、《差|さ》が ${D} の2つの《数|かず》。《大|おお》きい《数|かず》 □、《小|ちい》さい《数|かず》 □`,
            a: two(a, b), easy: `$x+y=${S}$ と $x-y=${D}$ をたして $2x=${2 * a}$`,
            verify: () => (a + b === S && a - b === D) || '和と差が合わない',
          };
        }
        const v = r.int(5, 12) * 10, w = r.int(1, 4) * 10;
        if (w >= v) return null;
        return {
          q: `ボートが《川|かわ》を《下|くだ》ると${FUN} ${U(v + w, 'm')}、《上|のぼ》ると ${U(v - w, 'm')}。《静|しず》かな《水|みず》での${FUN} □ m、《流|なが》れの${FUN} □ m`,
          a: two(v, w), easy: `$x+y=${v + w}$、$x-y=${v - w}$ をたして $2x=${2 * v}$`,
          verify: () => true,
        };
      },
      // わな：符号が同じ（−2y と −2y。ひく）・符号はちがうが大きさがちがう（+3y と −2y）
      trap(r) {
        const [x, y] = sol(r), k = r.int(0, 1), p = nz(r, -5, 6), q = nz(r, -5, 6);
        if (p === q || p === -q) return null;
        let s1, s2, why;
        if (r.chance(0.5)) { s1 = s2 = -r.int(1, 4); why = '《符号|ふ|ごう》が《同|おな》じ'; }
        else { s1 = r.int(2, 5); s2 = -r.int(1, 5); if (s1 === -s2) return null; why = '《符号|ふ|ごう》はちがうが、《大|おお》きさがちがう'; }
        const E1 = k ? E(p, s1, x, y) : E(s1, p, x, y), E2 = k ? E(q, s2, x, y) : E(s2, q, x, y);
        if (E1.a * E2.b - E1.b * E2.a === 0) return null;
        const pr = mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, '');
        if (KG['3-17']({ e: [E1, E2] })) return null;
        return dest(pr, '3-17', why);
      },
    },
  });

  // ---------------------------------------------------------------- 3-18
  M.add({
    id: '3-18', part: PART, chap: '3-6③', stars: 1,
    title: '1つの《式|しき》を《何倍|なん|ばい》かしてそろえる',
    mark: '《片方|かた|ほう》の《係数|けい|すう》が、もう《片方|かた|ほう》の**《倍数|ばい|すう》**（1と3、2と4）。',
    futsu: ['$x+2y=8$、$3x-y=3$ で、', '$x=8-2y$ にして《代入|だい|にゅう》し、', '$3(8-2y)-y=3$ を《解|と》く。'],
    raku: ['2つめ×2で $6x-2y=6$', '1つめとたして $7x=14$', '$x=2$、$y=3$'],
    why: '《両辺|りょう|へん》に《同|おな》じ《数|かず》をかけても《等式|とう|しき》は《成|な》り《立|た》つ。1つだけかければそろう。',
    caution: '《右辺|う|へん》にもかける（$x+2y=8$ の2《倍|ばい》は $2x+4y=16$）。《倍数|ばい|すう》でなければ、わざ 3-19。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '36mm', trap: '36mm' },
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits: kgFits('3-18'),
    steps: {
      // 係数が1と k
      s1(r) { return mul18(r, 1, r.int(2, 4)); },
      // 係数が2と4、3と6 など（小さいほうも1でない）
      s2(r) { return mul18(r, r.int(2, 3), r.int(2, 3)); },
      // ねだん・回路の式（I_1、I_2）
      s3(r) {
        if (r.chance(0.5)) {
          const [s, t] = r.pick(ITEMS), x = r.int(6, 15) * 10, y = r.int(3, 9) * 10, n = r.int(2, 4), p = r.int(1, 5), q = r.int(1, 5);
          if (p === n * q || n * q === -p || p === q || gcd(n, p) > 1) return null;
          const c1 = n * x + p * y, c2 = x + q * y;
          return {
            q: `${s}${n}${KO}と${t}${p}${KO}で ${c1} ${EN}、${s}1${KO}と${t}${q}${KO}で ${c2} ${EN}。${s} □ ${EN}、${t} □ ${EN}（1${KO}）`,
            a: two(x, y), easy: `2つめ×${n}：$${n}x+${n * q}y=${n * c2}$、ひいて $${lin([[n * q - p, 'y']])}=${n * c2 - c1}$`,
            verify: () => (n * x + p * y === c1 && x + q * y === c2) || 'ねだんが合わない',
          };
        }
        const k = r.int(2, 5), j = r.int(2, 5), i1 = r.int(1, 4), i2 = r.int(1, 4);
        const E1 = E(k, 1, i1, i2), E2 = E(1, j, i1, i2);
        const U1 = 'I_{1}', U2 = 'I_{2}';
        const e1 = std(E1.a, E1.b, E1.c, U1, U2), e2 = std(E2.a, E2.b, E2.c, U1, U2);
        const p = mk(e1, e2, i1, i2, elim([E1, E2], 0, 1, k, [U1, U2], [i1, i2]));
        if (!p) return null;
        p.q = `《回路|かい|ろ》の《式|しき》 ${p.q}`;
        p.a = solA(i1, i2, U1, U2);
        p.verify = vSys(p.q, i1, i2);
        return p;
      },
      // わな：4と6 のように、どちらも倍数でない（両方かける）
      trap(r) {
        const [x, y] = sol(r), k = r.int(0, 1);
        const [c1, c2] = r.pick([[4, 6], [6, 4], [6, 9], [9, 6], [4, 10], [6, 8], [8, 6], [10, 4]]);
        const p = nz(r, -5, 5), q = nz(r, -5, 5);
        const E1 = k ? E(p, c1, x, y) : E(c1, p, x, y), E2 = k ? E(q, (r.chance(0.5) ? 1 : -1) * c2, x, y) : E((r.chance(0.5) ? 1 : -1) * c2, q, x, y);
        const pr = { e: [E1, E2], f: ['std', 'std'] };
        if (rel(pr, k ? 0 : 1) !== 'none' || E1.a * E2.b - E1.b * E2.a === 0) return null;
        return dest(mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, ''), '3-18', `${c1} と ${c2} は《倍数|ばい|すう》でない`);
      },
    },
  });
  // 3-18 の連立：消す文字の係数が b と b×n（符号は自由）。もう1つの文字は、そろっていない
  function mul18(r, b, n) {
    const [x, y] = sol(r), k = r.int(0, 1), first = r.chance(0.5);
    const cs = r.chance(0.5) ? 1 : -1, cb = r.chance(0.5) ? 1 : -1;
    const small = cb * b, big = cs * b * n;
    const p = nz(r, -5, 6), q = nz(r, -5, 6);
    const [g1, g2] = first ? [small, big] : [big, small];
    const E1 = k ? E(p, g1, x, y) : E(g1, p, x, y), E2 = k ? E(q, g2, x, y) : E(g2, q, x, y);
    const pr = { e: [E1, E2], f: ['std', 'std'] };
    const o = rel(pr, k ? 0 : 1);
    if (o === 'eq' || o === 'op' || o === 'zero' || E1.a * E2.b - E1.b * E2.a === 0) return null;
    return mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, elim([E1, E2], k, first ? n : 1, first ? 1 : n, null, [x, y]));
  }

  // ---------------------------------------------------------------- 3-19
  M.add({
    id: '3-19', part: PART, chap: '3-6③', stars: 1,
    title: '《両方|りょう|ほう》の《式|しき》を《何倍|なん|ばい》かしてそろえる',
    mark: '《係数|けい|すう》が**《倍数|ばい|すう》でない**（3と4、2と3）。《公倍数|こう|ばい|すう》が《小|ちい》さいほうの《文字|も|じ》を《消|け》す。',
    futsu: ['$3x+2y=12$、$4x+3y=17$ で、', '$x$ を12にそろえようとして、', '1つめ×4、2つめ×3 と《大|おお》きくする。'],
    raku: ['$y$ は2と3なので、6にそろえる。', '1つめ×3：$9x+6y=36$', '2つめ×2：$8x+6y=34$', 'ひいて $x=2$、$y=3$'],
    why: '2つの《係数|けい|すう》の《公倍数|こう|ばい|すう》にそろえれば、ひくかたすかで《消|き》える。《小|ちい》さい《公倍数|こう|ばい|すう》ほど《数|かず》が《小|ちい》さい。',
    caution: '1つだけかければそろうとき（1と3、2と4）は、わざ 3-18 のほうが《楽|らく》。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '36mm', trap: '36mm' },
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits: kgFits('3-19'),
    steps: {
      s1(r) { return both19(r, false); },
      // 符号がちがう（そろえてたす）
      s2(r) { return both19(r, true); },
      // どの文字を消すと楽か・ねだん・回路の式
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const p = both19(r, r.chance(0.5));
          if (!p) return null;
          const P = parseSys(M.plain(p.q)), Lx = lcm(P.e[0].a, P.e[1].a), Ly = lcm(P.e[0].b, P.e[1].b);
          if (Lx === Ly) return null;
          const v = Lx < Ly ? 'x' : 'y';
          return {
            q: p.q.replace(SOLVE, 'を《解|と》くとき、《先|さき》に《消|け》すと《楽|らく》な《文字|も|じ》 □'),
            a: `$${v}$`, easy: `$x$ は ${Lx}、$y$ は ${Ly} にそろう`, easyCheck: false, key: p.key + ':v',
            verify: () => (v === (Lx < Ly ? 'x' : 'y')) || '文字がちがう',
          };
        }
        if (kind === 1) {
          const [s, t] = r.pick(ITEMS), x = r.int(6, 15) * 10, y = r.int(3, 9) * 10;
          const n1 = r.int(2, 5), n2 = r.int(2, 5), p = r.int(2, 5), q = r.int(2, 5);
          const pr = { e: [E(n1, p, x, y), E(n2, q, x, y)], f: ['std', 'std'] };
          if (!KG['3-19'](pr) || swapped(pr) || gcd(n1, p) > 1 || gcd(n2, q) > 1) return null;
          const c1 = n1 * x + p * y, c2 = n2 * x + q * y;
          const k = lcm(n1, n2) <= lcm(p, q) ? 0 : 1, L = k ? lcm(p, q) : lcm(n1, n2), g = k ? [p, q] : [n1, n2];
          return {
            q: `${s}${n1}${KO}と${t}${p}${KO}で ${c1} ${EN}、${s}${n2}${KO}と${t}${q}${KO}で ${c2} ${EN}。${s} □ ${EN}、${t} □ ${EN}（1${KO}）`,
            a: two(x, y), easy: elim(pr.e, k, L / g[0], L / g[1], null, [x, y]),
            verify: () => (n1 * x + p * y === c1 && n2 * x + q * y === c2) || 'ねだんが合わない',
          };
        }
        const pr = both19(r, false, ['I_{1}', 'I_{2}'], [1, 4]);
        if (!pr) return null;
        pr.q = `《回路|かい|ろ》の《式|しき》 ${pr.q}`;
        return pr;
      },
      // わな：1つの文字は倍数（1つだけかければよい）
      trap(r) {
        const [x, y] = sol(r), k = r.int(0, 1), b = r.int(2, 3), n = r.int(2, 3);
        const g1 = b, g2 = (r.chance(0.5) ? 1 : -1) * b * n;
        const p = r.intNot(2, 7, v => v % b === 0), q = r.intNot(-7, 7, v => Math.abs(v) < 2 || v % p === 0 || p % v === 0);
        const E1 = k ? E(p, g1, x, y) : E(g1, p, x, y), E2 = k ? E(q, g2, x, y) : E(g2, q, x, y);
        if (E1.a * E2.b - E1.b * E2.a === 0) return null;
        return dest(mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, ''), '3-19', `${b} と ${Math.abs(g2)} は《倍数|ばい|すう》。1つだけかければよい`);
      },
    },
  });
  // 3-19 の連立：どちらの文字の係数も倍数でない。入れかえ（3-20）でもない。mix なら符号がちがう
  function both19(r, mix, vs, rg) {
    vs = vs || ['x', 'y'];
    const x = rg ? r.int(rg[0], rg[1]) : nz(r, -4, 6), y = rg ? r.int(rg[0], rg[1]) : nz(r, -4, 6);
    const c = () => r.int(2, 7);
    const a1 = c(), b1 = c(), a2 = c(), b2 = (mix ? -1 : 1) * c();
    const pr = { e: [E(a1, b1, x, y), E(a2, b2, x, y)], f: ['std', 'std'] };
    if (!KG['3-19'](pr) || swapped(pr) || close(pr.e[0].a * pr.e[1].b - pr.e[0].b * pr.e[1].a, 0)) return null;
    const Lx = lcm(a1, a2), Ly = lcm(b1, b2), k = Lx <= Ly ? 0 : 1, L = k ? Ly : Lx;
    const g = k ? [b1, b2] : [a1, a2];
    const [E1, E2] = pr.e;
    const p = mk(std(E1.a, E1.b, E1.c, vs[0], vs[1]), std(E2.a, E2.b, E2.c, vs[0], vs[1]), x, y,
      elim(pr.e, k, L / Math.abs(g[0]), L / Math.abs(g[1]), vs, [x, y]));
    if (!p) return null;
    p.a = solA(x, y, vs[0], vs[1]);
    return p;
  }

  // ---------------------------------------------------------------- 3-20
  M.add({
    id: '3-20', part: PART, chap: '3-6③の《先|さき》', stars: 2,
    title: '《係数|けい|すう》が《入|い》れかわった《連立|れん|りつ》は、たして・ひいて',
    mark: '《係数|けい|すう》が**《入|い》れかわっている**（$ax+by$ と $bx+ay$）。',
    futsu: ['$2x+3y=7$、$3x+2y=8$ で、', '1つめ×3、2つめ×2 で $x$ を6にそろえ、', 'ひいて $5y=5$ を《解|と》く。'],
    raku: ['たして $5x+5y=15$、$x+y=3$', 'ひいて $-x+y=-1$、$x-y=1$', '$x+y=3$、$x-y=1$ から $x=2$、$y=1$'],
    why: 'たすと《係数|けい|すう》がどちらも $a+b$、ひくと $a-b$ と $b-a$（《符号|ふ|ごう》だけちがう）になり、$x+y$ と $x-y$ の《式|しき》になる。',
    caution: '《符号|ふ|ごう》が《片方|かた|ほう》だけちがうとき（$2x+3y$ と $3x-2y$）は《使|つか》えない。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '15mm', trap: '36mm' },
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    fits: kgFits('3-20'),
    steps: {
      s1(r) {
        const [x, y] = sol(r), a = r.int(2, 7), b = r.int(2, 7);
        if (a === b) return null;
        const E1 = E(a, b, x, y), E2 = E(b, a, x, y);
        return mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, `たして $x+y=${x + y}$、ひいて $x-y=${x - y}$`);
      },
      // 2つめの式の項の順がちがう・マイナスつき（ax−by と bx−ay）
      s2(r) {
        const [x, y] = sol(r), a = r.int(1, 7), b = r.int(1, 7);
        if (a === b) return null;
        if (r.chance(0.5)) {
          const E1 = E(a, b, x, y), E2 = E(b, a, x, y);
          return mk(std(E1.a, E1.b, E1.c), stdR(E2.a, E2.b, E2.c), x, y, `たして $x+y=${x + y}$、ひいて $x-y=${x - y}$`);
        }
        const E1 = E(a, -b, x, y), E2 = E(b, -a, x, y);
        return mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, `たして $x-y=${x - y}$、ひいて $x+y=${x + y}$`);
      },
      // 解かずに x+y・x−y の値
      s3(r) {
        const [x, y] = sol(r), a = r.int(2, 7), b = r.int(2, 7), plus = r.chance(0.5);
        if (a === b || gcd(a, b) > 1) return null;   // 式が同じ数でわれない（J-2）
        const E1 = E(a, b, x, y), E2 = E(b, a, x, y), e1 = std(E1.a, E1.b, E1.c), e2 = std(E2.a, E2.b, E2.c);
        const v = plus ? x + y : x - y;
        return {
          q: `$${e1}$、$${e2}$ のとき、$x${plus ? '+' : '-'}y$ の《値|あたい》 □`,
          a: `$${v}$`, easyCheck: false, key: keyOf(e1, e2) + (plus ? '+' : '-'),
          easy: plus ? `たして $${a + b}x+${a + b}y=${E1.c + E2.c}$` : `ひいて $${lin([[a - b, 'x'], [b - a, 'y']])}=${E1.c - E2.c}$`,
          verify: () => (plus ? (E1.c + E2.c) / (a + b) : (E1.c - E2.c) / (a - b)) === v || '値が合わない',
        };
      },
      // わな：符号が片方だけ入れかわっている（2x+3y と 3x−2y）
      trap(r) {
        const [x, y] = sol(r), a = r.int(2, 7), b = r.int(2, 7);
        if (a === b || a % b === 0 || b % a === 0) return null;
        const E1 = E(a, b, x, y), E2 = E(b, -a, x, y);
        return dest(mk(std(E1.a, E1.b, E1.c), std(E2.a, E2.b, E2.c), x, y, ''), '3-20', 'たしてもひいても、《係数|けい|すう》がそろわない');
      },
    },
  });

  // ---------------------------------------------------------------- 3-21
  const pct = n => `$${n}\\,\\%$`;
  M.add({
    id: '3-21', part: PART, chap: '3-6③の《先|さき》', stars: 2,
    title: '《小数|しょう|すう》・《分数|ぶん|すう》の《係数|けい|すう》は、《先|さき》に《整数|せい|すう》に',
    mark: '《係数|けい|すう》が**《小数|しょう|すう》**（$0.2x$）や**《分数|ぶん|すう》**（$\\frac{x}{2}$）。',
    futsu: ['$0.2x+0.3y=1.3$ のまま、', '《小数|しょう|すう》の《係数|けい|すう》をそろえようとして、', '$0.2\\times3$ などの《計算|けい|さん》がふえる。'],
    raku: ['10《倍|ばい》して $2x+3y=13$', '$\\frac{x}{2}+\\frac{y}{3}=2$ は6《倍|ばい》して $3x+2y=12$', 'あとは《整数|せい|すう》の《連立|れん|りつ》'],
    why: '《両辺|りょう|へん》に《同|おな》じ《数|かず》をかけても《等式|とう|しき》は《成|な》り《立|た》つ。《整数|せい|すう》にすると、まちがいがへる。',
    caution: '《右辺|う|へん》にもかける。《分数|ぶん|すう》は《分母|ぶん|ぼ》の《公倍数|こう|ばい|すう》をかける。',
    cols: 1,
    boxw: { s1: '36mm', s2: '36mm', s3: '28mm', trap: '28mm' },
    counts: { s1: 9, s2: 6, s3: 4, trap: 2 },
    // 小数・分数の係数。ただし、もう係数がそろっている（そのままたす・ひくで消える）ものは、わざ 3-16・3-17（わな）
    fits(q) { const p = solveSys(q); return !!p && !allInt(p) && !REL(p).some(x => x === 'eq' || x === 'op'); },
    steps: {
      // 小数の係数（10倍）
      s1(r) {
        const [x, y] = sol(r), A = r.intNot(-9, 9, v => v === 0 || v === 5 || v === -5), B = r.intNot(-9, 9, v => v === 0);
        const a = nz(r, -5, 5), b = nz(r, -5, 5);
        const D = E(A, B, x, y), I = E(a, b, x, y);
        if (D.a * I.b - D.b * I.a === 0) return null;
        const e1 = std(A / 10, B / 10, D.c / 10), e2 = std(a, b, I.c);
        const first = r.chance(0.5);
        return first ? mk(e1, e2, x, y, `1つめ×10：$${std(A, B, D.c)}$`) : mk(e2, e1, x, y, `2つめ×10：$${std(A, B, D.c)}$`);
      },
      // 分数の係数（分母の公倍数）
      s2(r) {
        const [x, y] = sol(r), p = r.int(2, 6), q = r.int(2, 6), sg = r.chance(0.7) ? 1 : -1;
        if (p === q) return null;
        const L = lcm(p, q), K = x / p + sg * y / q;
        if (!isInt(K)) return null;
        const a = nz(r, -4, 4), b = nz(r, -4, 4), I = E(a, b, x, y);
        const F = { a: L / p, b: sg * L / q, c: L * K };
        if (F.a * I.b - F.b * I.a === 0) return null;
        const e1 = `\\frac{x}{${p}}${sg < 0 ? '-' : '+'}\\frac{y}{${q}}=${nm(K)}`, e2 = std(a, b, I.c);
        const first = r.chance(0.5);
        const easy = `${first ? '1' : '2'}つめ×${L}：$${std(F.a, F.b, F.c)}$`;
        return first ? mk(e1, e2, x, y, easy) : mk(e2, e1, x, y, easy);
      },
      // 食塩水を混ぜる・どちらも小数
      s3(r) {
        if (r.chance(0.4)) {
          // 濃さ P を先に決め、濃いほうの重さ x が 10 g の倍数になる組を選ぶ
          const p1 = r.pick([8, 10, 12, 15, 20]), p2 = r.pick([2, 3, 4, 5]), T = r.pick([200, 300, 400, 500, 600]);
          const P = r.int(p2 + 1, p1 - 1), x = T * (P - p2) / (p1 - p2), y = T - x;
          if (!isInt(x / 10)) return null;
          return {
            q: `${pct(p1)} と ${pct(p2)} の《食塩水|しょく|えん|すい》を《混|ま》ぜて ${pct(P)} を ${U(T, 'g')} 《作|つく》る。${pct(p1)} □ g、${pct(p2)} □ g`,
            a: two(x, y), easy: `$x+y=${T}$、$${nm(p1 / 100)}x+${nm(p2 / 100)}y=${nm(P * T / 100)}$ を100《倍|ばい》`,
            verify: () => (x + y === T && p1 * x + p2 * y === P * T) || '食塩の重さが合わない',
          };
        }
        const [x, y] = sol(r), A = nz(r, -9, 9), B = nz(r, -9, 9), C = nz(r, -9, 9), D = nz(r, -9, 9);
        if ([A, B, C, D].some(v => v % 5 === 0) || A * D - B * C === 0) return null;
        if (Math.abs(A) === Math.abs(C) || Math.abs(B) === Math.abs(D)) return null;   // そのままたす・ひくで消える（わなの形。R1-11）
        const E1 = E(A, B, x, y), E2 = E(C, D, x, y);
        return mk(std(A / 10, B / 10, E1.c / 10), std(C / 10, D / 10, E2.c / 10), x, y, `どちらも×10：$${std(A, B, E1.c)}$、$${std(C, D, E2.c)}$`);
      },
      // わな：小数でも、もう係数がそろっている（そのままひく・たす）
      trap(r) {
        const [x, y] = sol(r), k = r.int(0, 1), s = r.intNot(1, 9, v => v === 5), p = r.intNot(-9, 9, v => v === 0 || v === 5 || v === -5), q = r.intNot(-9, 9, v => v === 0 || v === 5 || v === -5);
        if (p === q || p === -q) return null;
        const sg = r.chance(0.6) ? 1 : -1;
        const E1 = k ? E(p, s, x, y) : E(s, p, x, y), E2 = k ? E(q, sg * s, x, y) : E(sg * s, q, x, y);
        const e1 = std(E1.a / 10, E1.b / 10, E1.c / 10), e2 = std(E2.a / 10, E2.b / 10, E2.c / 10);
        const t = `$${nm(s / 10)}${k ? 'y' : 'x'}$`, t2 = `$-${nm(s / 10)}${k ? 'y' : 'x'}$`;
        return dest(mk(e1, e2, x, y, ''), '3-21', `10《倍|ばい》しなくても、${sg > 0 ? `${t} がもうそろっている` : `${t} と ${t2} で《符号|ふ|ごう》だけちがう`}`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-22
  const NASHI = 'なし', MUSU = '《無数|む|すう》', ICHI = '1《組|くみ》';
  // 2つの式の解の数（文から読む）
  function kindOf(q) {
    const p = parseSys(M.plain(q));
    if (!p) return null;
    if (!close(p.det, 0)) return ICHI;
    const [e1, e2] = p.e;
    return close(e1.a * e2.c - e2.a * e1.c, 0) && close(e1.b * e2.c - e2.b * e1.c, 0) ? MUSU : NASHI;
  }
  function which(e1, e2, ans, easy) {
    const q = `$${e1}$、$${e2}$ ${WHICH}`;
    return { q, a: ans, easy, key: keyOf(e1, e2), verify: () => (kindOf(q) === ans) || `答えは ${kindOf(q)}` };
  }
  M.add({
    id: '3-22', part: PART, chap: '3-6④', stars: 1,
    title: '《傾|かたむ》きが《同|おな》じなら《解|かい》なし、《同|おな》じ《直線|ちょく|せん》なら《無数|む|すう》',
    mark: '2つの《式|しき》の $x$ と $y$ の《係数|けい|すう》の**《比|ひ》が《同|おな》じ**（$y=$ の《形|かたち》なら《傾|かたむ》きが《同|おな》じ）。',
    futsu: ['$y=2x$、$y=2x+10$ を《代入法|だい|にゅう|ほう》で《解|と》き、', '$0=10$ となってから《気|き》づく。'],
    raku: ['《傾|かたむ》きが《同|おな》じ2、《切片|せっ|ぺん》がちがう', '→ 《平行|へい|こう》なので《解|かい》なし', '$4x-2y=-2$ は $y=2x+1$ と《同|おな》じ', '→ 《重|かさ》なるので《無数|む|すう》'],
    why: '《解|かい》は2《本|ほん》の《直線|ちょく|せん》の《交点|こう|てん》。《平行|へい|こう》なら《交点|こう|てん》がなく、《重|かさ》なればどの《点|てん》も《交点|こう|てん》（3-6④）。',
    caution: '《傾|かたむ》きがちがえば、《交点|こう|てん》はちょうど1つ。$0=10$ を「《解|かい》は0」としない。',
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '15mm', trap: '36mm' },
    counts: { s1: 8, s2: 7, s3: 5, trap: 2 },
    fits(q) {
      if (/（1組・なし・無数）|解がない|解が無数/.test(q)) return true;
      const p = parseSys(q);
      return !!p && close(p.det, 0);
    },
    steps: {
      // どちらも y= の形
      s1(r) {
        const m = nz(r, -4, 4), k1 = r.int(-6, 9);
        if (r.chance(0.7)) {
          const k2 = r.intNot(-6, 9, v => v === k1);
          return which(yf(m, k1), yf(m, k2), NASHI, `《傾|かたむ》きがどちらも $${m}$、《切片|せっ|ぺん》がちがう`);
        }
        const n = r.int(2, 3);
        return which(yf(m, k1), `${n}y=${lin([[n * m, 'x'], [n * k1, '']])}`, MUSU, `2つめを${n}でわると1つめと《同|おな》じ`);
      },
      // ax+by=c の形を、y= に直してくらべる
      s2(r) {
        const m = nz(r, -3, 3), k1 = r.int(-5, 6), n = r.pick([2, 3, -2, -3]), same = r.chance(0.5);
        if (r.chance(0.5)) {
          const k2 = same ? k1 : r.intNot(-5, 6, v => v === k1);
          const e2 = std(-n * m, n, n * k2);
          return which(yf(m, k1), e2, same ? MUSU : NASHI, `$${e2}$ は $${yf(m, k2)}$`);
        }
        const a = nz(r, -4, 4), b = nz(r, -4, 4), c = r.int(-6, 9), j = r.int(2, 3);
        if (gcd(a, b) !== 1) return null;
        const c2 = same ? j * c : r.intNot(-12, 18, v => v === j * c);
        return which(std(a, b, c), std(j * a, j * b, c2), same ? MUSU : NASHI, `1つめを${j}《倍|ばい》すると $${std(j * a, j * b, j * c)}$`);
      },
      // 解がない・無数になる文字の値
      s3(r) {
        if (r.chance(0.5)) {
          const m = nz(r, -4, 4), B = r.pick([1, 2, -2, 3, -3]), k = r.int(-5, 6);
          const C = r.intNot(-9, 9, v => close(v / B, k));   // 切片 C/B が k とちがう（平行）
          const e2 = std(-m * B, B, C);
          return {
            q: `$y=ax${term(k, '', false)}$ と $${e2}$ の《解|かい》がないとき、$a=$□`,
            a: `$${m}$`, easy: `$${e2}$ の《傾|かたむ》きは $${m}$`, easyCheck: false, key: `a:${k}:${e2}`,
            verify: () => { const p = parseSys(M.plain(`$${yf(m, k)}$、$${e2}$ の解は □`)); return (!!p && close(p.det, 0) && kindOf(`$${yf(m, k)}$、$${e2}$ ${WHICH}`) === NASHI) || '解なしにならない'; },
          };
        }
        const a = nz(r, -4, 5), b = nz(r, -4, 5), c = nz(r, -6, 9), j = r.int(2, 4);
        if (gcd(a, b) !== 1) return null;
        const e1 = std(a, b, c);
        return {
          q: `$${e1}$ と $${lin([[j * a, 'x'], [j * b, 'y']])}=k$ の《解|かい》が《無数|む|すう》のとき、$k=$□`,
          a: `$${j * c}$`, easy: `1つめを${j}《倍|ばい》すると《同|おな》じ《式|しき》`, easyCheck: false, key: `k:${e1}:${j}`,
          verify: () => (kindOf(`$${e1}$、$${std(j * a, j * b, j * c)}$ ${WHICH}`) === MUSU) || '無数にならない',
        };
      },
      // わな：解を聞く。傾きが同じに見えるが、ちがう（解は1組）。代入して解く（R1-10・J-1）
      trap(r) {
        const [x, y] = sol(r), m = r.intNot(-4, 4, v => Math.abs(v) < 2), k1 = y - m * x;
        if (!k1 || Math.abs(k1) > 12) return null;
        if (r.chance(0.5)) {
          const k2 = y + m * x;   // y=-mx+k2（傾きの符号だけちがう）
          if (!k2 || Math.abs(k2) > 12) return null;
          return dest(mk(yf(m, k1), yf(-m, k2), x, y, ''), '3-22', `《傾|かたむ》きが $${m}$ と $${-m}$ でちがうので、《解|かい》は1《組|くみ》。《右辺|う|へん》どうしを《等|ひと》しくおいて`);
        }
        const n = r.int(2, 3), c = n * y - m * x;   // ny=mx+c（n でわると、x の係数は m/n）
        if (m % n === 0 || !c || Math.abs(c) > 20) return null;
        return dest(mk(yf(m, k1), `${n}y=${lin([[m, 'x'], [c, '']])}`, x, y, ''), '3-22', `2つめを${n}でわると《傾|かたむ》きは $${frac(m, n)}$ でちがうので、《解|かい》は1《組|くみ》。《代入|だい|にゅう》して`);
      },
    },
  });

  // ---------------------------------------------------------------- 3-23
  const pt = (x, y) => `$(${x},\\ ${y})$`;
  M.add({
    id: '3-23', part: PART, chap: '3-6③・3-5⑤', stars: 1,
    title: '2《点|てん》を《通|とお》る《直線|ちょく|せん》の $b$ はひいて《消|け》す',
    mark: '$y=ax+b$ に2つの《点|てん》を《入|い》れた《連立|れん|りつ》。$b$ の《係数|けい|すう》が、どちらも**1でそろう**。',
    futsu: ['《点|てん》 $(-1,\\ 1)$、$(2,\\ 7)$ で、', '$-a+b=1$ を $b=a+1$ にして', '$2a+(a+1)=7$ を《解|と》く。'],
    raku: ['$2a+b=7$ から $-a+b=1$ をひく。', '$3a=6$、$a=2$', '$-2+b=1$、$b=3$'],
    why: '2つの《式|しき》の $b$ はいつも $+b$。ひけばすぐ $b$ が《消|き》え、$a$ は《傾|かたむ》きになる（3-5⑤）。',
    caution: '$x$ が0の《点|てん》 $(0,\\ 3)$ があれば、$b=3$ がすぐわかる。ひかなくてよい。',
    cols: 1,
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    counts: { s1: 9, s2: 6, s3: 4, trap: 2 },
    fits(q) {
      // (0, b) の点があれば、b はすぐわかる（わざ 3-10。わな）
      if (/を通る/.test(q) && /\$\(-?\d+,\\ -?\d+\)\$、\$\(-?\d+,\\ -?\d+\)\$/.test(q)) return ![...q.matchAll(/\$\((-?\d+),\\ /g)].some(m => +m[1] === 0);
      const p = solveSys(q);
      return !!p && p.vs.join('') === 'ab' && bothStd(p) && close(p.e[0].b, 1) && close(p.e[1].b, 1);
    },
    steps: {
      s1(r) {
        const g = line23(r);
        if (!g) return null;
        const { a, b, x1, y1, x2, y2 } = g;
        return {
          q: `2《点|てん》 ${pt(x1, y1)}、${pt(x2, y2)} を《通|とお》る $y=ax+b$ の $a$、$b$ □`,
          a: solA(a, b, 'a', 'b'), easy: g.easy, key: `ab:${x1},${y1}|${x2},${y2}`,
          verify: () => (a * x1 + b === y1 && a * x2 + b === y2) || '点が直線にのらない',
        };
      },
      // 直線の式で答える
      s2(r) {
        const g = line23(r);
        if (!g) return null;
        const { a, b, x1, y1, x2, y2 } = g;
        return {
          q: `2《点|てん》 ${pt(x1, y1)}、${pt(x2, y2)} を《通|とお》る《直線|ちょく|せん》の《式|しき》 □`,
          a: `$${yf(a, b)}$`, easy: g.easy, key: `eq:${x1},${y1}|${x2},${y2}`,
          verify: () => (a * x1 + b === y1 && a * x2 + b === y2) || '点が直線にのらない',
        };
      },
      // ばねの長さ・水の温度
      s3(r) {
        if (r.chance(0.5)) {
          const a = r.int(1, 4), b = r.int(8, 20), x1 = r.int(1, 3), x2 = r.int(x1 + 2, 8);
          return {
            q: `ばねの《長|なが》さは、おもり${x1}《個|こ》で ${U(a * x1 + b, 'cm')}、${x2}《個|こ》で ${U(a * x2 + b, 'cm')}。$x$ 《個|こ》で $y=ax+b$（cm）の $a$、$b$ □`,
            a: solA(a, b, 'a', 'b'), easy: `ひいて $${x2 - x1}a=${a * (x2 - x1)}$`,
            verify: () => true,
          };
        }
        const a = r.int(2, 8), b = r.int(10, 25), x1 = r.int(1, 4), x2 = r.int(x1 + 2, 10);
        return {
          q: `《水|みず》の《温度|おん|ど》は ${FG(x1)}に ${a * x1 + b} ℃、${FG(x2)}に ${a * x2 + b} ℃。$x$ 《分後|ふん|ご》に $y=ax+b$（℃）の $a$、$b$ □`,
          a: solA(a, b, 'a', 'b'), easy: `ひいて $${x2 - x1}a=${a * (x2 - x1)}$`,
          verify: () => true,
        };
      },
      // わな：x が0の点がある（b がすぐわかる）
      trap(r) {
        const a = nz(r, -4, 4), b = nz(r, -6, 8), x2 = nz(r, -4, 5), first = r.chance(0.5);
        const P = [[0, b], [x2, a * x2 + b]], [p1, p2] = first ? P : [P[1], P[0]];
        return {
          q: `2《点|てん》 ${pt(p1[0], p1[1])}、${pt(p2[0], p2[1])} を《通|とお》る $y=ax+b$ の $a$、$b$ □`,
          a: solA(a, b, 'a', 'b'), easy: `（${pt(0, b)} を《通|とお》るので、すぐ $b=${b}$。ひかなくてよい。わざ 3-10）`,
          verify: () => (a * x2 + b === P[1][1]) || '点が直線にのらない',
        };
      },
    },
  });
  // 3-23 の2点（x は0でない、ちがう2つ）
  function line23(r) {
    const a = nz(r, -4, 4), b = r.int(-6, 8), x1 = nz(r, -4, 5), x2 = nz(r, -4, 6);
    if (x1 === x2) return null;
    const y1 = a * x1 + b, y2 = a * x2 + b;
    if (Math.abs(y1) > 20 || Math.abs(y2) > 20) return null;
    const [u, v] = x1 < x2 ? [[x1, y1], [x2, y2]] : [[x2, y2], [x1, y1]];
    return { a, b, x1: u[0], y1: u[1], x2: v[0], y2: v[1], easy: `$${lin([[v[0], 'a'], [1, 'b']])}=${v[1]}$ から $${lin([[u[0], 'a'], [1, 'b']])}=${u[1]}$ をひいて $${lin([[v[0] - u[0], 'a']])}=${v[1] - u[1]}$` };
  }

  // ---------------------------------------------------------------- 3-24
  M.add({
    id: '3-24', part: PART, chap: '3-6②・3-4⑤', stars: 1,
    title: '《出会|で|あ》いは《速|はや》さの《和|わ》、《追|お》いつきは《速|はや》さの《差|さ》',
    mark: '**《向|む》かい《合|あ》って**《進|すす》む・あとから**《追|お》いかける**。2つの《速|はや》さを1つにまとめる。',
    futsu: ['$y=60x$、$y=-90x+1500$ の', '《連立方程式|れん|りつ|ほう|てい|しき》を《作|つく》って《解|と》く。'],
    raku: ['1《分|ぷん》で $60+90=150$ m 《近|ちか》づく。', '$1500\\div150=10$（10《分後|ぷん|ご》）'],
    why: '《向|む》かい《合|あ》うと、あいだは《速|はや》さの《和|わ》ずつちぢむ。《同|おな》じ《向|む》きなら《速|はや》さの《差|さ》ずつちぢむ。',
    caution: '《追|お》いかけるほうが《速|はや》くないと、いつまでも《追|お》いつかない（《差|さ》が0なら、あいだは《変|か》わらない）。',
    cols: 1,
    boxw: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '28mm' },
    counts: { s1: 9, s2: 4, s3: 3, trap: 2 },
    fits(q) {
      if (!/向かい合|追いかけ|追う|反対向きに|同じ向きに/.test(q)) return false;
      // 追いかけるほうが速くないと、追いつかない（わな）
      const m = /分速 \$(\d+)\\,\\mathrm\{m\}\$ で歩く人を、分速 \$(\d+)\\,\\mathrm\{m\}\$ で追/.exec(q);
      return !(m && +m[2] <= +m[1]);
    },
    steps: {
      // 出会い（速さの和）。「1分で □ m 近づく」は1つの見開きに2問まで（key を2とおりだけにする。s2 も同じ。R1-24）
      s1(r) {
        const v1 = r.int(5, 8) * 10, v2 = r.int(5, 12) * 10, t = r.int(4, 15), D = (v1 + v2) * t;
        if (v1 === v2) return null;
        if (r.chance(0.4)) {
          return {
            q: `《向|む》かい《合|あ》う${FUN} ${U(v1, 'm')} と ${U(v2, 'm')} のふたりは、1《分|ぷん》で □ m 《近|ちか》づく`,
            a: `$${v1 + v2}$`, easy: `$${v1}+${v2}=${v1 + v2}$`, key: `deai1:${r.int(0, 1)}`,
          };
        }
        return {
          q: `${U(D, 'm')} はなれて${FUN} ${U(v1, 'm')} と ${U(v2, 'm')} で《向|む》かい《合|あ》う。□ 《分|ふん》で《出会|で|あ》う`,
          a: `$${t}$`, easy: `$${D}\\div(${v1}+${v2})=${t}$`, key: `deai:${D}:${[v1, v2].sort()}`,
        };
      },
      // 追いつき（速さの差）
      s2(r) {
        const v1 = r.int(4, 8) * 10, v2 = v1 + r.int(1, 5) * 10, t0 = r.int(3, 12), d = v1 * t0;
        if (d % (v2 - v1)) return null;
        const t = d / (v2 - v1);
        if (r.chance(0.25)) {
          return {
            q: `${FUN} ${U(v2, 'm')} で、${FUN} ${U(v1, 'm')} の《人|ひと》を《追|お》いかける。1《分|ぷん》で □ m 《近|ちか》づく`,
            a: `$${v2 - v1}$`, easy: `$${v2}-${v1}=${v2 - v1}$`, key: `oi1:${r.int(0, 1)}`,
          };
        }
        if (r.chance(0.5)) {
          return {
            q: `《弟|おとうと》が${FUN} ${U(v1, 'm')} で《出|で》た ${FG(t0)}に、《兄|あに》が${FUN} ${U(v2, 'm')} で《追|お》う。《兄|あに》が《出|で》て □ 《分後|ふん|ご》に《追|お》いつく`,
            a: `$${t}$`, easy: `$${v1}\\times${t0}\\div(${v2}-${v1})=${t}$`,
          };
        }
        return {
          q: `${U(d, 'm')} 《先|さき》を${FUN} ${U(v1, 'm')} で《歩|ある》く《人|ひと》を、${FUN} ${U(v2, 'm')} で《追|お》う。□ 《分後|ふん|ご》に《追|お》いつく`,
          a: `$${t}$`, easy: `$${d}\\div(${v2}-${v1})=${t}$`,
        };
      },
      // 池のまわり・出会う場所・秒速
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const v1 = r.int(5, 8) * 10, v2 = r.int(5, 12) * 10, same = r.chance(0.5);
          if (v1 >= v2) return null;
          const sp = same ? v2 - v1 : v1 + v2, t = r.int(4, 20), L = sp * t;
          if (L > 3000 || L < 400) return null;
          return {
            q: `1《周|しゅう》 ${U(L, 'm')} の《池|いけ》を、《同|おな》じ《所|ところ》から${same ? '《同|おな》じ《向|む》きに' : '《反対|はん|たい》《向|む》きに'}${FUN} ${U(v1, 'm')} と ${U(v2, 'm')} で《歩|ある》く。はじめて${same ? '《追|お》いつく' : '《出会|で|あ》う'}のは □ 《分後|ふん|ご》`,
            a: `$${t}$`, easy: same ? `1《周|しゅう》の《差|さ》がつく：$${L}\\div(${v2}-${v1})=${t}$` : `$${L}\\div(${v1}+${v2})=${t}$`,
          };
        }
        if (kind === 1) {
          const v1 = r.int(5, 8) * 10, v2 = r.int(5, 12) * 10, t = r.int(4, 12), D = (v1 + v2) * t;
          if (v1 === v2) return null;
          return {
            q: `${U(D, 'm')} はなれたAとBから、${FUN} ${U(v1, 'm')}（Aから）と ${U(v2, 'm')}（Bから）で《向|む》かい《合|あ》って《歩|ある》く。《出会|で|あ》うのはAから □ m`,
            a: `$${v1 * t}$`, easy: `$${v1}\\times(${D}\\div${v1 + v2})=${v1 * t}$`,
          };
        }
        const v1 = r.int(10, 20), v2 = r.int(10, 25), t = r.int(5, 20), D = (v1 + v2) * t;
        if (v1 === v2) return null;
        return {
          q: `${U(D, 'm')} はなれた2《台|だい》の《車|くるま》が、《秒速|びょう|そく》 ${U(v1, 'm')} と ${U(v2, 'm')} で《向|む》かい《合|あ》う。□ 《秒後|びょう|ご》にすれちがう`,
          a: `$${t}$`, easy: `$${D}\\div(${v1}+${v2})=${t}$`,
        };
      },
      // わな：追いかけるほうが速くない（いつまでも追いつかない）
      trap(r) {
        const v1 = r.int(5, 9) * 10, d = r.int(2, 6) * 100, same = r.chance(0.5), v2 = same ? v1 : v1 - r.int(1, 2) * 10;
        return {
          q: `${U(d, 'm')} 《先|さき》を${FUN} ${U(v1, 'm')} で《歩|ある》く《人|ひと》を、${FUN} ${U(v2, 'm')} で《追|お》う。《何分後|なん|ぷん|ご》に《追|お》いつく？ □`,
          a: '《追|お》いつかない',
          easy: same ? `（《速|はや》さの《差|さ》が0。いつまでも ${U(d, 'm')} はなれたまま）` : '（《前|まえ》の《人|ひと》のほうが《速|はや》い。あいだは《広|ひろ》がる）',
          verify: () => (v2 <= v1) || '追いつく',
        };
      },
    },
  });

  // ---------------------------------------------------------------- 3-25
  const DIV = [6, 8, 12, 18, 20, 24, 30, 36, 48, 60, 72];
  const divisors = n => { const o = []; for (let i = 1; i <= n; i++) if (n % i === 0) o.push(i); return o; };
  const listM = v => v.map(nm).join(',\\ ');
  // 楽な形：$2\times9$・$3\times6$・$6\times3$ がどれも $18$
  const par = v => (v < 0 ? `(${v})` : String(v));
  const xyEasy = (xs, a) => xs.map(x => `$${par(x)}\\times${par(a / x)}$`).join('・') + ` がどれも $${a}$`;
  const tbl = (xs, ys) => `$x$ が $${listM(xs)}$ のとき、$y$ は $${listM(ys)}$。$y=$□`;
  M.add({
    id: '3-25', part: PART, chap: '3-7①⑥', stars: 1,
    title: '$xy$ が《一定|いっ|てい》なら《反比例|はん|ぴ|れい》',
    mark: '《表|ひょう》の《組|くみ》ごとに $x\\times y$ を《計算|けい|さん》すると、**どれも《同|おな》じ《数|かず》**になる。',
    futsu: ['《表|ひょう》の《点|てん》をグラフにかいて、', '《曲線|きょく|せん》の《形|かたち》を《見|み》る。'],
    raku: ['$2\\times9=3\\times6=6\\times3=18$', '$xy=18$ なので $y=\\frac{18}{x}$'],
    why: '$y=\\frac{a}{x}$ では、$xy$ がいつも $a$（3-7⑥）。かけ《算|ざん》1つで $a$ が《出|で》る。',
    caution: '$y\\div x$ が《一定|いっ|てい》なら《比例|ひ|れい》。$x+y$ が《一定|いっ|てい》なら、どちらでもない。',
    cols: 1,
    boxw: '22mm',
    boxh: { s1: '12mm', s3: '12mm' },
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    fits(q) {
      if (/反比例/.test(q)) return true;
      // 表：どの組も x×y が同じ数（同じでなければ わな）
      const m = /\$x\$ が \$([^$]*)\$ のとき、\$y\$ は \$([^$]*)\$/.exec(q);
      if (!m) return false;
      const xs = m[1].split(/,\\ /).map(Number), ys = m[2].split(/,\\ /).map(Number);
      return xs.length === ys.length && xs.every((x, i) => close(x * ys[i], xs[0] * ys[0]));
    },
    steps: {
      s1(r) {
        const a = r.pick(DIV), d = divisors(a).filter(v => v < a);
        const xs = r.shuffle(d).slice(0, 3).sort((u, v) => u - v);
        if (xs.length < 3) return null;
        return { q: tbl(xs, xs.map(x => a / x)), a: `$\\frac{${a}}{x}$`, val: String(a), easy: xyEasy(xs, a) };
      },
      // マイナスの a・マイナスの x・1組から式を作って別の y
      s2(r) {
        if (r.chance(0.65)) {
          const a = r.pick(DIV.concat([-12, -24, -18])), d = divisors(Math.abs(a)), x1 = r.pick(d) * r.pick([1, -1]), x2 = r.pick(d) * r.pick([1, -1]);
          if (x1 === x2) return null;
          return {
            q: `《反比例|はん|ぴ|れい》で、$x=${x1}$ のとき $y=${a / x1}$。$x=${x2}$ なら $y=$□`,
            a: `$${a / x2}$`, easy: `$${x1}\\times(${a / x1})\\div(${x2})=${a / x2}$`.replace(/\((\d+)\)/g, '$1'),
          };
        }
        const a = r.pick([-24, -18, -12, 12, 18, 24, 36]), d = divisors(Math.abs(a)), x1 = r.pick(d) * r.pick([1, -1]), x2 = r.pick(d) * r.pick([1, -1]);
        if (x1 === x2) return null;
        return {
          q: `《反比例|はん|ぴ|れい》のグラフが ${pt(x1, a / x1)} と $(${x2},\\ □)$ を《通|とお》る`,
          a: `$${a / x2}$`, easy: `$${x1}\\times(${a / x1})\\div(${x2})=${a / x2}$`.replace(/\((\d+)\)/g, '$1'),
        };
      },
      // マイナスの a・マイナスの x の表・長方形の面積・道のりが同じ（答えは分数の式）
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const a = r.pick(DIV), d = divisors(a).filter(v => v < a), sx = r.chance(0.5) ? -1 : 1, sa = sx > 0 ? -1 : r.pick([1, -1]);
          const xs = r.shuffle(d).slice(0, 3).sort((u, v) => u - v).map(v => sx * v).sort((u, v) => u - v);
          if (xs.length < 3) return null;
          const A = sa * a;
          return { q: tbl(xs, xs.map(x => A / x)), a: `$${frac(A, 1).replace(/^(-?)(\d+)$/, (m, s, n) => `${s}\\frac{${n}}{x}`)}$`, val: String(A), easy: xyEasy(xs, A) };
        }
        if (kind === 1) {
          const S = r.pick([12, 18, 20, 24, 30, 36, 40, 48]);
          return { q: `《面積|めん|せき》 $${S}\\,\\mathrm{cm}^{2}$ の《長方形|ちょう|ほう|けい》の《横|よこ》 $x$ cm、たて $y$ cm。$y=$□`, a: `$\\frac{${S}}{x}$`, val: String(S), easy: `$xy=${S}$` , easyCheck: false };
        }
        if (kind === 2) {
          const v = r.int(4, 8) * 10, t = r.int(10, 30), D = v * t;
          return {
            q: `ある《道|みち》を${FUN} ${U(v, 'm')} で ${FN(t)}。${FUN} $x$ m なら $y$ 《分|ふん》。$y=$□`,
            a: `$\\frac{${D}}{x}$`, val: String(D), easy: `$${v}\\times${t}=${D}$`,
          };
        }
      },
      // わな：y÷x が一定（比例）・x+y が一定（どちらでもない）
      trap(r) {
        const xs = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort((u, v) => u - v);
        if (r.chance(0.5)) {
          const k = r.int(2, 5);
          return { q: tbl(xs, xs.map(x => k * x)), a: `$${k}x$`, easy: `（$xy$ が《一定|いっ|てい》でない。$y\\div x=${k}$ なので《比例|ひ|れい》）`, easyCheck: false, verify: () => true };
        }
        const S = r.int(8, 12);
        return { q: tbl(xs, xs.map(x => S - x)), a: `$-x+${S}$`, easy: `（$xy$ が《一定|いっ|てい》でない。$x+y=${S}$ が《一定|いっ|てい》）`, easyCheck: false, verify: () => true };
      },
    },
  });

  // ---------------------------------------------------------------- 3-26
  M.add({
    id: '3-26', part: PART, chap: '3-7⑥', stars: 1,
    title: '《積|せき》が《一定|いっ|てい》なら $p_{1}V_{1}=p_{2}V_{2}$',
    mark: '《圧力|あつ|りょく》と《体積|たい|せき》、《歯車|は|ぐるま》の《歯|は》の《数|かず》と《回転|かい|てん》の《数|かず》など、**かけると《一定|いっ|てい》**の2つの《量|りょう》。',
    futsu: ['$p=\\frac{a}{V}$ の $a$ を《求|もと》めて、', '《式|しき》を《作|つく》ってから《新|あたら》しい $V$ を《入|い》れる。'],
    raku: ['$100\\times50=p\\times20$', '$p=100\\times50\\div20=250$（kPa）'],
    why: '《温度|おん|ど》が《変|か》わらなければ $pV$ は《一定|いっ|てい》（ボイルの《法則|ほう|そく》、3-7⑥）。まえの《積|せき》＝あとの《積|せき》。',
    caution: '《体積|たい|せき》をへらすと《圧力|あつ|りょく》はふえる（《反対|はん|たい》に《動|うご》く）。《比例|ひ|れい》する《量|りょう》には《使|つか》えない。',
    cols: 1,
    boxw: '12mm',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    fits(q) { return /kPa|歯車|支点|かかる仕事|^ある道を分速/.test(q); },
    steps: {
      // ボイルの法則：圧力を求める
      s1(r) {
        const p1 = r.pick([100, 120, 150, 200]), V1 = r.int(2, 8) * 10, V2 = r.int(1, 8) * 5;
        if (V2 === V1 || (p1 * V1) % V2) return null;
        const p2 = p1 * V1 / V2;
        if (p2 > 1200) return null;
        return {
          q: `${U(p1, 'kPa')}・${U(V1, 'mL')} の《空気|くう|き》を ${U(V2, 'mL')} に（《温度|おん|ど》は《一定|いっ|てい》）。《圧力|あつ|りょく》 □ kPa`,
          a: `$${p2}$`, easy: `$${p1}\\times${V1}\\div${V2}=${p2}$`,
        };
      },
      // 体積を求める・歯車
      s2(r) {
        if (r.chance(0.5)) {
          const p1 = r.pick([100, 120, 150, 200]), V1 = r.int(2, 8) * 10, p2 = r.pick([50, 60, 75, 80, 150, 200, 240, 250, 300, 400]);
          if (p2 === p1 || (p1 * V1) % p2) return null;
          const V2 = p1 * V1 / p2;
          return {
            q: `${U(p1, 'kPa')}・${U(V1, 'mL')} の《空気|くう|き》を ${U(p2, 'kPa')} に（《温度|おん|ど》は《一定|いっ|てい》）。《体積|たい|せき》 □ mL`,
            a: `$${V2}$`, easy: `$${p1}\\times${V1}\\div${p2}=${V2}$`,
          };
        }
        const n1 = r.pick([12, 15, 16, 18, 20, 24, 30, 36, 40]), r1 = r.int(2, 12) * 5, n2 = r.pick([10, 12, 15, 16, 18, 20, 24, 30, 45, 60]);
        if (n1 === n2 || (n1 * r1) % n2) return null;
        return {
          q: `《歯|は》が ${n1} の《歯車|は|ぐるま》は1《分|ぷん》に ${r1} 《回転|かい|てん》。かみ《合|あ》う《歯|は》 ${n2} の《歯車|は|ぐるま》は □ 《回転|かい|てん》`,
          a: `$${n1 * r1 / n2}$`, easy: `$${n1}\\times${r1}\\div${n2}=${n1 * r1 / n2}$`,
        };
      },
      // 仕事の時間・てこ・道のりが同じ
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const w1 = r.int(3, 8), w2 = r.int(3, 10);
          if (w1 === w2) return null;
          const W = lcm(w1, w2) * r.int(1, 3), h1 = W / w1;
          if (h1 > 24 || W / w2 > 24) return null;
          return {
            q: `${w1}《人|にん》で ${h1} 《時間|じ|かん》かかる《仕事|し|ごと》は、${w2}《人|にん》なら □ 《時間|じ|かん》`,
            a: `$${w1 * h1 / w2}$`, easy: `$${w1}\\times${h1}\\div${w2}=${w1 * h1 / w2}$`,
          };
        }
        if (kind === 1) {
          const L1 = r.int(2, 8) * 5, L2 = r.int(2, 10) * 5;
          if (L1 === L2) return null;
          const T = lcm(L1, L2) * r.int(1, 4) * (r.chance(0.5) ? 10 : 5), m1 = T / L1;
          if (m1 > 200 || T / L2 > 200) return null;
          return {
            q: `てこの《支点|し|てん》から《左|ひだり》 ${U(L1, 'cm')} に ${U(m1, 'g')}、《右|みぎ》 ${U(L2, 'cm')} に □ g でつり《合|あ》う`,
            a: `$${L1 * m1 / L2}$`, easy: `$${L1}\\times${m1}\\div${L2}=${L1 * m1 / L2}$`,
          };
        }
        const v1 = r.int(4, 9) * 10, v2 = r.int(4, 12) * 10;
        if (v1 === v2) return null;
        const D = lcm(v1, v2) * r.int(1, 3), t1 = D / v1;
        if (t1 > 40 || D / v2 > 40) return null;
        return {
          q: `ある《道|みち》を${FUN} ${U(v1, 'm')} で ${FN(t1)}。${FUN} ${U(v2, 'm')} なら □ 《分|ふん》`,
          a: `$${v1 * t1 / v2}$`, easy: `$${v1}\\times${t1}\\div${v2}=${v1 * t1 / v2}$`,
        };
      },
      // わな：比例する量（ばねののび・同じ速さで歩く時間と道のり）
      trap(r) {
        if (r.chance(0.5)) {
          const m1 = r.int(1, 5) * 10, l1 = r.int(2, 6), m2 = r.int(1, 10) * 10;
          if (m1 === m2 || (l1 * m2) % m1) return null;
          return {
            q: `ばねは ${U(m1, 'g')} で ${U(l1, 'cm')} のびる。${U(m2, 'g')} なら □ cm のびる`,
            a: `$${l1 * m2 / m1}$`, easy: `（《積|せき》は《一定|いっ|てい》でない。《比例|ひ|れい》なので $${l1}\\times${m2}\\div${m1}=${l1 * m2 / m1}$。わざ 3-91）`,
          };
        }
        const v = r.int(4, 8) * 10, t1 = r.int(5, 15), t2 = r.int(5, 30);
        if (t1 === t2) return null;
        return {
          q: `${FUN} ${U(v, 'm')} で ${FN(t1)}《歩|ある》くと ${U(v * t1, 'm')}。${FN(t2)}なら □ m`,
          a: `$${v * t2}$`, easy: `（《積|せき》は《一定|いっ|てい》でない。《比例|ひ|れい》なので $${v * t1}\\div${t1}\\times${t2}=${v * t2}$。わざ 3-91）`,
        };
      },
    },
  });

  // ---------------------------------------------------------------- 3-27
  const rate = (a, p, q) => frac(-a, p * q);
  M.add({
    id: '3-27', part: PART, chap: '3-7⑤', stars: 1,
    title: '《反比例|はん|ぴ|れい》の《変化|へん|か》の《割合|わり|あい》は $-\\frac{a}{pq}$',
    mark: '$y=\\frac{a}{x}$ で、$x$ が $p$ から $q$ まで《変|か》わるときの**《変化|へん|か》の《割合|わり|あい》**。',
    futsu: ['$x=2$ で $y=6$、$x=3$ で $y=4$ を《出|だ》し、', '$\\frac{4-6}{3-2}=-2$ と《計算|けい|さん》する。'],
    raku: ['$a$ を、《両|りょう》はしの $x$ の《積|せき》でわる。', '$-\\frac{12}{2\\times3}=-2$'],
    why: '$\\frac{a}{q}-\\frac{a}{p}=-\\frac{a(q-p)}{pq}$ を $q-p$ でわると $-\\frac{a}{pq}$（3-7⑤）。',
    caution: '$y=\\frac{x}{4}$ のように $x$ が《分子|ぶん|し》なら《比例|ひ|れい》。《変化|へん|か》の《割合|わり|あい》はいつも $\\frac{1}{4}$。',
    cols: 1,
    boxw: '18mm',
    boxh: { s2: '12mm', trap: '12mm' },   // 分数の答えは s2・わなだけ
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    fits(q) { return /変化(の割合|量)/.test(q) && /\\frac\{\d+\}\{[a-zA-Z]\}/.test(q); },
    steps: {
      // 答えが整数
      s1(r) {
        const p = r.int(1, 6), q = r.int(p + 1, 8), a = p * q * r.int(1, 3);
        if (a > 60) return null;
        return {
          q: `$y=\\frac{${a}}{x}$ で、$x$ が ${p} から ${q} までの《変化|へん|か》の《割合|わり|あい》 □`,
          a: `$${rate(a, p, q)}$`, easy: `$-\\frac{${a}}{${p}\\times${q}}=${rate(a, p, q)}$`,
        };
      },
      // 答えが分数・マイナスの a・マイナスの x
      s2(r) {
        const p0 = r.int(1, 6), q0 = r.int(p0 + 1, 9), a0 = r.pick([6, 8, 10, 12, 18, 20, 24, 30, 36]);
        const sa = r.chance(0.4) ? -1 : 1, sx = r.chance(0.3) ? -1 : 1, a = sa * a0;
        const [p, q] = sx > 0 ? [p0, q0] : [-q0, -p0];
        if (!isFrac(a0, p0 * q0) && sa > 0 && sx > 0) return null;
        const yq = `$y=${a < 0 ? '-' : ''}\\frac{${a0}}{x}$`;
        return {
          q: `${yq} で、$x$ が $${p}$ から $${q}$ までの《変化|へん|か》の《割合|わり|あい》 □`,
          a: `$${rate(a, p, q)}$`, easy: `$-\\frac{${a}}{${p}\\times${q}}=${rate(a, p, q)}$`.replace(/\{(-\d+)\}/, '{($1)}').replace(/\\times(-\d+)/, '\\times($1)'),
        };
      },
      // y の変化量・ボイルの法則
      s3(r) {
        if (r.chance(0.5)) {
          const p = r.int(1, 5), q = r.int(p + 1, 8), a = p * q * r.int(1, 3);
          return {
            q: `$y=\\frac{${a}}{x}$ で、$x$ が ${p} から ${q} までの $y$ の《変化量|へん|か|りょう》 □`,
            a: `$${frac(-a * (q - p), p * q)}$`, easy: `$-\\frac{${a}}{${p}\\times${q}}\\times(${q}-${p})=${frac(-a * (q - p), p * q)}$`, key: `dy:${a}:${p}:${q}`,
          };
        }
        const V1 = r.pick([5, 8, 10, 20, 25]), V2 = r.pick([10, 20, 25, 40, 50]), A = r.pick([1000, 2000, 4000]);
        if (V1 >= V2 || A % (V1 * V2)) return null;
        return {
          q: `$p=\\frac{${A}}{V}$ で、$V$ が ${V1} から ${V2} までの《変化|へん|か》の《割合|わり|あい》 □`,
          a: `$${rate(A, V1, V2)}$`, easy: `$-\\frac{${A}}{${V1}\\times${V2}}=${rate(A, V1, V2)}$`,
        };
      },
      // わな：x が分子（比例）
      trap(r) {
        const a = r.int(2, 9), sg = r.chance(0.6) ? 1 : -1, p = r.int(1, 5), q = r.int(p + 1, 9);
        const f = `${sg < 0 ? '-' : ''}\\frac{x}{${a}}`, v = frac(sg, a);
        return {
          q: `$y=${f}$ で、$x$ が ${p} から ${q} までの《変化|へん|か》の《割合|わり|あい》 □`,
          a: `$${v}$`, easy: `（《分子|ぶん|し》に《文字|も|じ》があるので《比例|ひ|れい》。いつも $${v}$）`, key: `trap:${sg * a}`,
          verify: () => close((sg * q / a - sg * p / a) / (q - p), sg / a) || '値が合わない',
        };
      },
    },
  });
})(globalThis.MONDAI);
