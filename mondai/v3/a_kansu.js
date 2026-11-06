/* 問題集 第3巻　第1部 関数と直線（わざ 3-01〜3-14、3-91）　組 a
 * 書き方は v2/README.md（第2・3巻の手引き）と v1/README.md。文は教科書 第3巻と同じ：漢字にルビ、分かち書きはしない。式は $…$。
 * 第3巻は答えの欄だけ（途中の計算はノート）。答えが式1つでないもの（直線の式・変域・不等式・ことば）は verify で確かめる。
 * 1つのわざは見開き2ページ。問題の文は、なるべく1行に入る長さにする（欄の高さで行が高くなるため）。
 * わなは、同じ部のほかのわざで楽にならないものにする。どうしても当たるときは、easy に行き先を書いて also に入れる（dest。第29回 H-1）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));               // マイナスはかっこごと
  const P = (x, y) => `(${x},\\ ${y})`;                            // 座標 (x,\ y)
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // 分数（[分子, 分母]）
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const qv = q => q[0] / q[1];
  const isInt = q => q[1] === 1;
  // 分数を TeX に。dec なら、きりのよい小数（0.5 など）で書く
  const tq = (q, dec) => {
    if (q[1] === 1) return `${q[0]}`;
    if (dec && [2, 4, 5, 10, 20, 25].includes(q[1])) return fmt(q[0] / q[1]);
    return `${q[0] < 0 ? '-' : ''}\\frac{${Math.abs(q[0])}}{${q[1]}}`;
  };
  // ax+b の式（a、b は分数）
  function lin(a, b, v, dec) {
    v = v || 'x';
    let s = '';
    if (a[0] !== 0) s = (isInt(a) && Math.abs(a[0]) === 1 ? (a[0] < 0 ? '-' : '') : tq(a, dec)) + v;
    if (b[0] !== 0) s += (s && b[0] > 0 ? '+' : '') + tq(b, dec);
    return s || '0';
  }
  // b+ax の順（定数が先）
  function linR(a, b, v) {
    v = v || 'x';
    const ax = (isInt(a) && Math.abs(a[0]) === 1 ? '' : tq([Math.abs(a[0]), a[1]])) + v;
    return `${tq(b)}${a[0] < 0 ? '-' : '+'}${ax}`;
  }
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  // 「3分」「3分後」のルビ：エンジンの M.funYomi（一の位が 1・3・4・6・8・0 なら ぷん）。小数（2.5 分）は最後の数字で読む
  const pun = h => M.funYomi(+String(h).slice(-1));
  const fun = (h, go) => `${h}《分${go ? '後' : ''}|${pun(h)}${go ? '|ご' : ''}》`;

  // ---------------------------------------------------------------- 検算の部品（verify）
  // 直線の式の答え（「$y=2x+10$」「$2x+10$」）が、点をすべて通るか
  function lineOK(ans, pts) {
    const t = strip(ans), rhs = t.slice(t.lastIndexOf('=') + 1);
    for (const [x, y] of pts) {
      const v = M.evalMath(rhs, { x });
      if (!close(v, y)) return `点 (${x}, ${y}) を通らない（${t}）`;
    }
    return true;
  }
  // 不等式（TeX）を「左辺、記号、右辺」に
  const OPS = [['\\leqq', (a, b) => a <= b + 1e-9], ['\\geqq', (a, b) => a >= b - 1e-9], ['<', (a, b) => a < b - 1e-9], ['>', (a, b) => a > b + 1e-9]];
  function splitIneq(t) {
    for (const [op, f] of OPS) { const k = t.indexOf(op); if (k >= 0) return { L: t.slice(0, k), R: t.slice(k + op.length), f }; }
    return null;
  }
  // 不等式の答え（「$x>3.5$」）が、もとの不等式（$-20x+100<30$）の解と同じか。境目のまわりの数を入れて比べる
  function ineqOK(orig, ans) {
    const o = splitIneq(strip(orig)), a = splitIneq(strip(ans));
    if (!o || !a || a.L.trim() !== 'x') return `不等式が読めない（${ans}）`;
    const k = M.evalMath(a.R, {});
    if (k == null) return `境目が読めない（${ans}）`;
    for (const x of [k - 3, k - 1, k - 0.25, k, k + 0.25, k + 1, k + 3]) {
      const l = M.evalMath(o.L, { x }), r = M.evalMath(o.R, { x });
      if (l == null || r == null) return `もとの不等式が読めない（${orig}）`;
      if (o.f(l, r) !== a.f(x, k)) return `x=${x} で、もとの不等式と答え ${ans} が合わない`;
    }
    return true;
  }
  // 変域の答え（「$-4\leqq y\leqq8$」）が、関数 F の x の変域 p〜q での最小・最大と同じか
  function rangeOK(F, p, q, ans) {
    const m = /^(.+)\\leqq y\\leqq(.+)$/.exec(strip(ans));
    if (!m) return `変域が読めない（${ans}）`;
    const xs = [];
    for (let i = 0; i <= 600; i++) xs.push(p + (q - p) * i / 600);
    for (let x = Math.ceil(p); x <= q; x++) xs.push(x);
    const ys = xs.map(x => M.evalMath(F, { x }));
    if (ys.some(y => y == null)) return `式が読めない（${F}）`;
    const lo = Math.min(...ys), hi = Math.max(...ys);
    if (!close(M.evalMath(m[1], {}), lo) || !close(M.evalMath(m[2], {}), hi)) return `変域は ${lo}〜${hi}（答え ${ans}）`;
    return true;
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 問題の文（ルビをとったもの）の中の座標 (x,\ y)。数でない座標（(a,\ 3)）も文字のまま
  const coords = q => [...q.matchAll(/\(([^(),]+),\\ ([^()]+?)\)/g)].map(m => [m[1].trim(), m[2].trim()]);
  const numCoords = q => coords(q).filter(c => c.every(v => /^-?\d+(\.\d+)?$/.test(v))).map(c => c.map(Number));
  // 文の中の式（$…$）
  const maths = q => (q.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(3).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 1 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    p.easyCheck = false;
    return p;
  }
  // 2点の key（入れかえただけの問題を同じとみる。H-6）
  const k2 = (tag, a, b) => tag + [a, b].map(c => c.join(',')).sort().join('/');

  // よく使うことば
  const W = {
    heniki: '《変域|へん|いき》', katamuki: '《傾|かたむ》き', seppen: '《切片|せっ|ぺん》', kyori: '《距離|きょ|り》',
    ten: '《点|てん》', tooru: '《通|とお》る', chokusen: '《直線|ちょく|せん》', shiki: '《式|しき》',
    henka: '《変化量|へん|か|りょう》', kawaru: '《変|か》わる', ichi: '《位置|い|ち》',
    hayasa: '《速|はや》さ', michi: '《道|みち》のり', kion: '《気温|き|おん》', toki: 'のとき',
  };

  // ================================================================ 3-01
  // 「$y=-4x$（$-2\leqq x\leqq1$）の $y$ の変域は $□\leqq y\leqq□$」
  const hq = (F, p, q) => `$y=${F}$（$${p}\\leqq x\\leqq${q}$）の${W.heniki}は $□\\leqq y\\leqq□$`;
  function heniki(F, p, q, f) {
    const lo = Math.min(f(p), f(q)), hi = Math.max(f(p), f(q)), ans = `$${fmt(lo)}\\leqq y\\leqq${fmt(hi)}$`;
    return { a: ans, easy: `$x=${p}$ で $${fmt(f(p))}$、$x=${q}$ で $${fmt(f(q))}$`, verify: () => rangeOK(F, p, q, ans) };
  }
  M.add({
    id: '3-01', part: 1, chap: '3-1③・3-3⑥', stars: 1,
    title: '《変域|へん|いき》は《両|りょう》はしの《値|あたい》で',
    mark: `$x$ の${W.heniki}が $\\square\\leqq x\\leqq\\square$ で、**1《次関数|じ|かん|すう》**か**《反比例|はん|ぴ|れい》**。《両|りょう》はしの $x$ だけを《入|い》れる。`,
    futsu: ['$x=-2,\\ -1,\\ 0,\\ 1$ と', '1つずつ《入|い》れて《表|ひょう》を《作|つく》り、', '《最大|さい|だい》・《最小|さい|しょう》の $y$ をさがす。'],
    raku: ['$y=-4x$、$-2\\leqq x\\leqq1$', '《両|りょう》はしだけ：$x=-2$ で $8$、$x=1$ で $-4$', '《小|ちい》さいほうを《左|ひだり》に：$-4\\leqq y\\leqq8$'],
    why: '《直線|ちょく|せん》や《反比例|はん|ぴ|れい》のグラフは、《変域|へん|いき》の《中|なか》でずっと《上|あ》がるか、ずっと《下|さ》がる。だから、いちばん《大|おお》きい《値|あたい》と《小|ちい》さい《値|あたい》は《両|りょう》はしにある（3-1③・3-3⑥）。',
    caution: '$y=x^2$ のように、とちゅうで《上|あ》がり《下|さ》がりが《変|か》わるグラフは、《両|りょう》はしだけでは《足|た》りない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '12mm',
    fits(q) { return q.includes('変域') && !/\^/.test(q); },
    steps: {
      // 1次関数。傾きがマイナスなら、x の大きいはしで y は小さいはし
      s1(r) {
        const a = r.pick([-5, -4, -3, -2, -2, -1, 1, 2, 3, 4]), b = r.int(-6, 6);
        const p = r.int(-4, 1), q = r.int(p + 1, p + 5);
        const F = lin(Q(a), Q(b));
        return { q: hq(F, p, q), ...heniki(F, p, q, x => a * x + b) };
      },
      // 反比例（x はプラスの変域）と、定数が先の1次関数（y=6-2x）
      s2(r) {
        if (r.chance(0.65)) {
          const k = r.pick([6, 8, 12, 18, 24, 36]) * (r.chance(0.35) ? -1 : 1);
          const ds = [1, 2, 3, 4, 6, 8, 9, 12].filter(d => Math.abs(k) % d === 0 && d < Math.abs(k));
          const p = r.pick(ds), q = r.pick(ds.filter(d => d > p));
          if (q == null) return null;
          const F = `${k < 0 ? '-' : ''}\\frac{${Math.abs(k)}}{x}`;
          return { q: hq(F, p, q), ...heniki(F, p, q, x => k / x) };
        }
        const a = r.pick([-4, -3, -2, 2, 3]), b = r.int(2, 9), p = r.int(-3, 0), q = r.int(p + 2, p + 5);
        const F = linR(Q(a), Q(b));
        return { q: hq(F, p, q), ...heniki(F, p, q, x => a * x + b) };
      },
      // 場面：水そう・電池・速さと時間・山の気温（教科書 3-1③・3-3⑥・3-5③）
      s3(r) {
        const k = r.int(0, 3);
        let F, p, q, text;
        if (k === 0) {
          const c = r.pick([2, 3, 4, 5]), h = r.pick([0, 5, 10, 15]);
          p = 0; q = r.int(2, 5); F = h ? `${c}x+${h}` : `${c}x`;
          text = `${h ? `はじめ ${h} cm の` : '《空|から》の'}《水|みず》そうに、1《分|ぷん》に ${c} cm ずつ《水|みず》を《入|い》れる。$x$ 《分後|ふん|ご》の《深|ふか》さは $y=${F}$（cm）。`;
        } else if (k === 1) {
          const d = r.pick([10, 20, 25]); p = r.int(0, 2); q = r.int(p + 1, Math.min(4, Math.floor(100 / d)));
          if (q <= p) return null;
          F = `100-${d}x`;
          text = `《電池|でん|ち》の《残|のこ》りは、$x$ 《時間後|じ|かん|ご》に $y=100-${d}x$（%）。`;
        } else if (k === 2) {
          const L = r.pick([600, 1200, 1800, 2400]);
          const ds = [1, 2, 3, 4, 5, 6, 8, 10, 12].filter(d => L % d === 0);
          p = r.pick(ds); q = r.pick(ds.filter(d => d > p && d <= 12));
          if (q == null) return null;
          F = `\\frac{${L}}{x}`;
          text = `${L} m を《秒速|びょう|そく》 $x$ m で《行|い》くと、$y=\\frac{${L}}{x}$ 《秒|びょう》かかる。`;
        } else {
          p = 0; q = r.int(1, 4); F = '-6x';
          text = '《高|たか》さ $x$ km の《気温|き|おん》は、《地面|じ|めん》より $y=-6x$（℃）だけ《変|か》わる。';
        }
        return { q: `${text}$${p}\\leqq x\\leqq${q}$ ${W.toki}、$y$ の${W.heniki}は $□\\leqq y\\leqq□$`, ...heniki(F, p, q, x => M.evalMath(F, { x })) };
      },
      // わな：y=ax^2 で、x の変域が0をはさむ（両はしだけでは最小をおとす。第4部 3-46）
      trap(r) {
        const a = r.pick([1, 1, 2, 3]), p = r.int(1, 3), q = r.int(1, 4);
        const F = a === 1 ? 'x^2' : `${a}x^2`, hi = a * Math.max(p, q) ** 2, ans = `$0\\leqq y\\leqq${hi}$`;
        return {
          q: hq(F, -p, q), a: ans, easyCheck: false,
          easy: '（とちゅうの $x=0$ で $y=0$ がいちばん《小|ちい》さい。《両|りょう》はしだけでは《足|た》りない。4《部|ぶ》のわざ 3-46）',
          verify: () => rangeOK(F, -p, q, ans),
        };
      },
    },
  });

  // ================================================================ 3-02
  M.add({
    id: '3-02', part: 1, chap: '3-2⑦', stars: 1,
    title: '《横|よこ》・たてに《並|なら》んだ2《点|てん》の《距離|きょ|り》',
    mark: '2《点|てん》の $y$ 《座標|ざ|ひょう》が**《同|おな》じ**（《横|よこ》に《並|なら》ぶ）か、$x$ 《座標|ざ|ひょう》が**《同|おな》じ**（たてに《並|なら》ぶ）。',
    futsu: ['《方眼|ほう|がん》に2《点|てん》をかいて、', 'マス《目|め》を1つずつ《数|かぞ》える。'],
    raku: ['$(-2,\\ 1)$ と $(3,\\ 1)$ は $y$ が《同|おな》じ', '$x$ 《座標|ざ|ひょう》だけをひく：', '$\\lvert3-(-2)\\rvert=5$'],
    why: '《横|よこ》に《並|なら》んだ2《点|てん》は、$x$ 《座標|ざ|ひょう》だけがちがう。《数直線|すう|ちょく|せん》の2《点|てん》の《距離|きょ|り》と《同|おな》じで、《大|おお》きいほう－《小|ちい》さいほう（3-2⑦）。',
    caution: '$x$ も $y$ もちがう（《斜|なな》めに《並|なら》ぶ）2《点|てん》は、この《方法|ほう|ほう》では《求|もと》められない（4-4）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    fits(q) {
      if (/最高|最低/.test(q) && /差/.test(q)) return true;
      if (!/距離|周|辺|まわり|面積/.test(q)) return false;
      const c = coords(q);
      for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) {
        if ((c[i][0] === c[j][0]) !== (c[i][1] === c[j][1])) return true;
      }
      return false;
    },
    steps: {
      // 横か、たてに並んだ2点
      s1(r) {
        const c = r.int(-5, 6), x1 = r.int(-6, 5), x2 = r.intNot(-6, 8, v => v === x1 || (x1 >= 0 && v >= 0 && r.chance(0.6)));
        const d = Math.abs(x2 - x1), [hi, lo] = x2 > x1 ? [x2, x1] : [x1, x2];
        const yoko = r.chance(0.5);
        const A = yoko ? [x1, c] : [c, x1], B = yoko ? [x2, c] : [c, x2];
        return { q: `2${W.ten} $${P(...A)}$、$${P(...B)}$ の${W.kyori}`, a: `$${d}$`, easy: `$\\lvert${hi}-${par(lo)}\\rvert=${d}$`, key: k2('d', A, B) };
      },
      // A・B の名前つき、どちらもマイナス。または、距離から座標を求める
      s2(r) {
        if (r.chance(0.5)) {
          const c = r.int(-6, -1), y1 = r.int(-7, -1), y2 = r.intNot(-7, 4, v => v === y1);
          const A = [c, y1], B = [c, y2], d = Math.abs(y2 - y1);
          return { q: `《点|てん》A $${P(...A)}$ と《点|てん》B $${P(...B)}$ の${W.kyori}`, a: `$${d}$`, easy: `$\\lvert${Math.max(y1, y2)}-${par(Math.min(y1, y2))}\\rvert=${d}$`, key: k2('d', A, B) };
        }
        const c = r.int(-4, 5), x2 = r.int(-2, 6), d = r.int(3, 9), a = x2 - d;
        return {
          q: `2${W.ten} $${P('a', c)}$、$${P(x2, c)}$ の${W.kyori}が $${d}$ で、$a<${x2}$ ${W.toki}、$a=□$`,
          a: `$${a}$`, easy: `$${x2}-${d}=${a}$`, verify: () => (Math.abs(x2 - a) === d && a < x2) || '距離が合わない',
        };
      },
      // 長方形のまわりの長さ・面積、気温の差
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const lo = r.int(-8, -1), hi = r.int(2, 12), d = hi - lo;
          return { q: `《最低|さい|てい》${W.kion} $${lo}$ ℃ と《最高|さい|こう》${W.kion} $${hi}$ ℃ の《差|さ》は □ ℃`, a: `$${d}$`, easy: `$\\lvert${hi}-${par(lo)}\\rvert=${d}$` };
        }
        const x1 = r.int(-5, -1), x2 = r.int(1, 6), y1 = r.int(-5, -1), y2 = r.int(1, 5), w = x2 - x1, h = y2 - y1;
        const name = `《頂点|ちょう|てん》が $${P(x1, y1)}$、$${P(x2, y1)}$、$${P(x2, y2)}$、$${P(x1, y2)}$ の《長方形|ちょう|ほう|けい》の`;
        if (k === 0) return { q: `${name}まわりの《長|なが》さ`, a: `$${2 * (w + h)}$`, easy: `$2\\times(${w}+${h})=${2 * (w + h)}$` };
        return { q: `${name}《面積|めん|せき》`, a: `$${w * h}$`, easy: `$${w}\\times${h}=${w * h}$` };
      },
      // わな：斜めに並んだ2点（x も y もちがう。たてと横をたしても距離にならない）
      trap(r) {
        const x1 = r.int(-4, 3), y1 = r.int(-4, 3), dx = r.int(1, 5), dy = r.int(1, 5), sx = r.pick([1, -1]);
        const A = [x1, y1], B = [x1 + sx * dx, y1 + dy];
        return {
          q: `2${W.ten} $${P(...A)}$、$${P(...B)}$ の${W.kyori}は $${dx}+${dy}$ より（《長|なが》い・《短|みじか》い） □`,
          a: '《短|みじか》い', easyCheck: false, key: k2('t', A, B),
          easy: `（《斜|なな》めに《並|なら》ぶ。《斜|なな》めの《近道|ちか|みち》は、たてと《横|よこ》をたした $${dx + dy}$ より《短|みじか》い。《距離|きょ|り》は 4-4 で）`,
          verify: () => (Math.hypot(dx, dy) < dx + dy) || 'まちがい',
        };
      },
    },
  });

  // ================================================================ 3-03
  // 関数の式を、x の所に s（かっこつき）を入れた形で作る。terms：[[係数, 次数], …]
  function poly(terms, s) {
    let out = '';
    for (const [c, e] of terms) {
      if (!c) continue;
      const sign = c < 0 ? '-' : (out ? '+' : '');
      const ac = Math.abs(c);
      let t;
      if (e === 0) t = `${ac}`;
      else {
        const base = e === 2 ? `${s}^2` : s;
        if (/^[a-z]$/.test(s)) t = (ac === 1 ? '' : `${ac}`) + base;
        else t = ac === 1 ? base : `${ac}\\times${base}`;
      }
      out += sign + t;
    }
    return out || '0';
  }
  const polyVal = (terms, x) => terms.reduce((s, [c, e]) => s + c * x ** e, 0);

  M.add({
    id: '3-03', part: 1, chap: '3-3③④', stars: 1,
    title: '$f(\\square)$ はかっこごと《入|い》れる',
    mark: '$f(-3)$、$f(a+h)$、$f(2a)$ のように、$x$ の《所|ところ》に**マイナスの《数|かず》や《式|しき》**を《入|い》れる。',
    futsu: ['$f(x)=x^2+x$ の $x$ に $-3$ を', 'そのまま《置|お》いて $-3^2-3$ とすると、', '2《乗|じょう》が3だけにかかってしまう。'],
    raku: ['$x$ を《全部|ぜん|ぶ》、かっこごとおきかえる', '$f(-3)=(-3)^2+(-3)$', '$=9-3=6$', '$f(a+h)=(a+h)^2+(a+h)$'],
    why: '$f(x)$ の $x$ は「《入|い》れる《物|もの》の《場所|ば|しょ》」。《入|い》れる《物|もの》をかっこでつつめば、《符号|ふ|ごう》や2《乗|じょう》をまちがえない（3-3④）。',
    caution: '$f$ はかけ《算|ざん》ではない。$f(2)+f(3)$ は $f(5)$ ではない。1つずつ《入|い》れる。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: { s1: '15mm', s2: '34mm', s3: '15mm', trap: '15mm' },
    fits(q) {
      if (/(?<![A-Za-z\\])[a-z]\([a-z]\(/.test(q)) return false;   // f(g(…)) は 3-04
      for (const m of q.matchAll(/(?<![A-Za-z\\])[a-z]\(([^()]*)\)(?!\s*=)/g)) if (/^-\d/.test(m[1]) || /[a-z]/.test(m[1])) return true;
      return false;
    },
    steps: {
      // マイナスの数を入れる
      s1(r) {
        const k = r.int(0, 3);
        const terms = k === 0 ? [[1, 2], [r.pick([1, 2, 3, -2, -3]), 1]]
          : k === 1 ? [[r.pick([2, 3, -1, -2]), 2]]
          : k === 2 ? [[r.pick([2, 3, 4, -3, -5]), 1], [r.int(-6, 6), 0]]
          : [[1, 2], [r.pick([-4, -2, 2, 5]), 1], [r.int(-5, 5), 0]];
        const n = r.int(-5, -1), v = polyVal(terms, n);
        return {
          q: `$f(x)=${poly(terms, 'x')}$ ${W.toki}、$f(${n})$`,
          a: `$${v}$`, easy: `$${poly(terms, `(${n})`)}=${v}$`,
          verify: () => M.evalMath(poly(terms, 'x'), { x: n }) === v || 'まちがい',
        };
      },
      // 式を入れる：f(a+h)、f(2a)、f(a-1)、f(x+1)
      s2(r) {
        const ins = r.pick(['a+h', '2a', 'a-1', 'x+1', '-a', '3t']);
        let terms, ans;
        if (r.chance(0.5)) {
          // 1次関数：かっこをはずす（分配法則。2-12）
          const p = r.pick([2, 3, 4, -2, -3]), c = r.intNot(-6, 6, v => v === 0);
          terms = [[p, 1], [c, 0]];
          const ex = { 'a+h': [[p, 'a'], [p, 'h'], [c, '']], '2a': [[2 * p, 'a'], [c, '']], 'a-1': [[p, 'a'], [c - p, '']], 'x+1': [[p, 'x'], [c + p, '']], '-a': [[-p, 'a'], [c, '']], '3t': [[3 * p, 't'], [c, '']] }[ins];
          ans = ex.filter(([k]) => k).map(([k, s], i) => `${k < 0 ? '-' : i ? '+' : ''}${s && Math.abs(k) === 1 ? '' : Math.abs(k)}${s}`).join('');
        } else {
          // x^2（＋x）：かっこごと2乗。(2a)^2 = 4a^2 などはまとめる
          const plusX = r.chance(0.5);
          terms = plusX ? [[1, 2], [1, 1]] : [[1, 2]];
          const sq = { '2a': '4a^2', '-a': 'a^2', '3t': '9t^2' }[ins];
          if (sq) ans = sq + (plusX ? (ins === '-a' ? '-a' : `+${ins}`) : '');
          else ans = `(${ins})^2` + (plusX ? `+(${ins})` : '');
        }
        const Fx = poly(terms, 'x');
        return {
          q: `$f(x)=${Fx}$ ${W.toki}、$f(${ins})$`,
          a: `$${ans}$`, easy: `$${poly(terms, `(${ins})`)}$`,
          verify: () => {
            for (const vs of [{ a: 1.3, h: 0.7, x: -0.4, t: 2.1 }, { a: -2.2, h: 1.9, x: 1.7, t: -0.6 }]) {
              const u = M.evalMath(ins, vs), want = M.evalMath(Fx, { x: u }), got = M.evalMath(ans, vs);
              if (!close(want, got)) return `${ans} の値がちがう`;
            }
            return true;
          },
        };
      },
      // 場面の関数：落ちる距離 x(t)=5t^2、投げ上げ h(t)、温度の f(x)=1.8x+32、小数を入れる
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const t = r.int(1, 5), v = 5 * t * t;
          return { q: `ボールが《落|お》ちはじめて $t$ 《秒後|びょう|ご》に《落|お》ちた《距離|きょ|り》は $x(t)=5t^2$（m）。$x(${t})$`, a: `$${v}$`, easy: `$5\\times${t}^2=${v}$` };
        }
        if (k === 1) {
          const v0 = r.pick([20, 30]), t = r.int(1, v0 / 5 - 1), v = v0 * t - 5 * t * t;
          return { q: `まっすぐ《上|うえ》に《投|な》げたボールの $t$ 《秒後|びょう|ご》の《高|たか》さは $h(t)=${v0}t-5t^2$（m）。$h(${t})$`, a: `$${v}$`, easy: `$${v0}\\times${t}-5\\times${t}^2=${v}$` };
        }
        if (k === 2) {
          const c = r.pick([-40, -30, -20, -15, -10, -5]), v = Math.round(1.8 * c + 32);
          return { q: `$x$ ℃を°F（《華氏|か|し》）になおす《関数|かん|すう》 $f(x)=1.8x+32$ で、$f(${c})$`, a: `$${v}$`, easy: `$1.8\\times(${c})+32=${v}$` };
        }
        const n = r.pick([-0.5, -0.2, -0.1, -1.5]), b = r.pick([1, 2, 3]);
        const v = +(n * n + b * n).toFixed(6);
        return { q: `$f(x)=x^2+${b === 1 ? '' : b}x$ ${W.toki}、$f(${n})$`, a: `$${fmt(v)}$`, easy: `$(${n})^2+${b === 1 ? '' : `${b}\\times`}(${n})=${fmt(v)}$` };
      },
      // わな：f(2)+f(3) は f(5) ではない／2f(3) は f(6) ではない（かっこの中に入れるのではない）
      trap(r) {
        const c = r.pick([0, 1, -1]), F = poly([[1, 2], [c, 0]], 'x'), f = x => x * x + c;
        if (r.chance(0.5)) {
          const p = r.int(1, 4), q = r.intNot(1, 5, v => v === p), v = f(p) + f(q);
          return { q: `$f(x)=${F}$ ${W.toki}、$f(${p})+f(${q})$`, a: `$${v}$`, easyCheck: false, key: `t+${c}:${[p, q].sort()}`,
            easy: `（$f(${p + q})$ ではない。1つずつ《入|い》れてたす：$${f(p)}+${f(q)}=${v}$）`, verify: () => v === M.evalMath(F, { x: p }) + M.evalMath(F, { x: q }) || 'まちがい' };
        }
        const k = r.pick([2, 3]), p = r.int(2, 4), v = k * f(p);
        return { q: `$f(x)=${F}$ ${W.toki}、$${k}f(${p})$`, a: `$${v}$`, easyCheck: false,
          easy: `（$f(${k * p})$ ではない。$f(${p})=${f(p)}$ を ${k}《倍|ばい》する）`, verify: () => v === k * M.evalMath(F, { x: p }) || 'まちがい' };
      },
    },
  });

  // ================================================================ 3-04
  M.add({
    id: '3-04', part: 1, chap: '3-3⑤', stars: 1,
    title: '《合成関数|ごう|せい|かん|すう》は《内側|うち|がわ》から',
    mark: '$f(g(2))$ のように、**かっこの《中|なか》に《関数|かん|すう》**がある。',
    futsu: ['《先|さき》に $f(g(x))$ の《式|しき》を', '《作|つく》ってから、2を《入|い》れる。'],
    raku: ['$g(x)=3x+1$、$f(x)=x^2$', '《内側|うち|がわ》の $g(2)=7$ を《先|さき》に', '$f(g(2))=f(7)=49$'],
    why: '《内側|うち|がわ》の《箱|はこ》から《出|で》た《数|かず》を、《外側|そと|がわ》の《箱|はこ》に《入|い》れる。《数|かず》を《先|さき》に《出|だ》せば、《式|しき》を《作|つく》らなくてよい（3-3⑤）。',
    caution: '《順番|じゅん|ばん》を《入|い》れかえると《答|こた》えが《変|か》わる。$g(f(2))=g(4)=13$。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '15mm', s2: '15mm', s3: '28mm', trap: '15mm' },
    fits(q) { return /(?<![A-Za-z\\])[a-z]\([a-z]\(/.test(q) || /クーポン/.test(q); },
    steps: {
      // f(g(n))
      s1(r) {
        const p = r.pick([2, 3, 4, -2]), c = r.intNot(-4, 5, v => v === 0), n = r.int(-2, 3);
        const G = poly([[p, 1], [c, 0]], 'x');
        const fk = r.int(0, 2), F = fk === 0 ? 'x^2' : fk === 1 ? `x^2-${r.int(1, 9)}` : `${r.pick([2, 3, 5])}x-1`;
        const gv = p * n + c, fv = M.evalMath(F, { x: gv });
        return {
          q: `$g(x)=${G}$、$f(x)=${F}$ ${W.toki}、$f(g(${n}))$`,
          a: `$${fv}$`, easyCheck: false, easy: `$g(${n})=${gv}$ を《先|さき》に。$f(${gv})=${fv}$`,
          verify: () => fv === M.evalMath(F, { x: M.evalMath(G, { x: n }) }) || 'まちがい',
        };
      },
      // 順番を入れかえた g(f(n))、同じ関数を2回 g(g(n))
      s2(r) {
        const p = r.pick([2, 3, -1, -2]), c = r.intNot(-4, 5, v => v === 0), n = r.int(-3, 3);
        const G = poly([[p, 1], [c, 0]], 'x'), F = r.pick(['x^2', 'x^2+1', '2x^2']);
        if (r.chance(0.6)) {
          const fv = M.evalMath(F, { x: n }), gv = M.evalMath(G, { x: fv });
          return {
            q: `$f(x)=${F}$、$g(x)=${G}$ ${W.toki}、$g(f(${n}))$`,
            a: `$${gv}$`, easyCheck: false, easy: `$f(${n})=${fv}$ を《先|さき》に。$g(${fv})=${gv}$`,
            verify: () => gv === M.evalMath(G, { x: M.evalMath(F, { x: n }) }) || 'まちがい',
          };
        }
        const g1 = p * n + c, g2 = p * g1 + c;
        return {
          q: `$g(x)=${G}$ ${W.toki}、$g(g(${n}))$`,
          a: `$${g2}$`, easyCheck: false, easy: `$g(${n})=${g1}$ を《先|さき》に。$g(${g1})=${g2}$`,
          verify: () => g2 === M.evalMath(G, { x: M.evalMath(G, { x: n }) }) || 'まちがい',
        };
      },
      // 場面（クーポンと消費税）と、合成関数の式
      s3(r) {
        if (r.chance(0.5)) {
          const price = r.pick([800, 1000, 1200, 1500, 2000, 3000]), off = r.pick([100, 200, 300]);
          if (r.chance(0.5)) {
            const v = Math.round((price - off) * 1.1);
            return { q: `${price}《円|えん》の《品物|しな|もの》に ${off}《円|えん》ひくクーポンを《使|つか》ってから、《消費税|しょう|ひ|ぜい》で1.1《倍|ばい》。はらうのは □《円|えん》`,
              a: `$${v}$`, easy: `$(${price}-${off})\\times1.1=${v}$` };
          }
          const v = Math.round(price * 1.1 - off);
          return { q: `${price}《円|えん》の《品物|しな|もの》を《消費税|しょう|ひ|ぜい》で1.1《倍|ばい》してから、${off}《円|えん》ひくクーポンを《使|つか》う。はらうのは □《円|えん》`,
            a: `$${v}$`, easy: `$${price}\\times1.1-${off}=${v}$` };
        }
        const p = r.pick([2, 3, 4]), c = r.pick([1, -1, 2, -3]), G = poly([[p, 1], [c, 0]], 'x');
        const F = r.pick(['x^2', '2x^2', 'x^2+1']);
        if (r.chance(0.5)) {
          const ans = F.replace('x', `(${G})`);
          return { q: `$g(x)=${G}$、$f(x)=${F}$ ${W.toki}、$f(g(x))=□$`, a: `$${ans}$`, easy: `（$f$ の $x$ に $${G}$ をかっこごと《入|い》れる）`, easyCheck: false,
            verify: () => { for (const x of [-1.3, 0.4, 2.2]) if (!close(M.evalMath(ans, { x }), M.evalMath(F, { x: M.evalMath(G, { x }) }))) return 'まちがい'; return true; } };
        }
        // g(f(x)) = p×F + c（F は x^2、2x^2、x^2+1）。かっこをはずしてまとめる
        const ans = F === 'x^2' ? poly([[p, 2], [c, 0]], 'x') : F === '2x^2' ? poly([[2 * p, 2], [c, 0]], 'x') : poly([[p, 2], [p + c, 0]], 'x');
        return { q: `$f(x)=${F}$、$g(x)=${G}$ ${W.toki}、$g(f(x))=□$`, a: `$${ans}$`, easy: `（$g$ の $x$ に $${F}$ をかっこごと《入|い》れる）`, easyCheck: false,
          verify: () => { for (const x of [-1.3, 0.4, 2.2]) if (!close(M.evalMath(ans, { x }), M.evalMath(G, { x: M.evalMath(F, { x }) }))) return 'まちがい'; return true; } };
      },
      // わな：つないでいない。f(n)+g(n)、f(n)×g(n) はべつべつに入れる
      trap(r) {
        const p = r.pick([2, 3]), c = r.int(1, 4), n = r.int(1, 3);
        const G = poly([[p, 1], [c, 0]], 'x'), fv = n * n, gv = p * n + c;
        if (r.chance(0.5)) {
          return { q: `$f(x)=x^2$、$g(x)=${G}$ ${W.toki}、$f(${n})+g(${n})$`, a: `$${fv + gv}$`, easyCheck: false,
            easy: `（つないでいない。べつべつに《入|い》れてたす：$${fv}+${gv}=${fv + gv}$）`, verify: () => true };
        }
        return { q: `$f(x)=x^2$、$g(x)=${G}$ ${W.toki}、$f(${n})\\times g(${n})$`, a: `$${fv * gv}$`, easyCheck: false,
          easy: `（つないでいない。べつべつに《入|い》れてかける：$${fv}\\times${gv}=${fv * gv}$）`, verify: () => true };
      },
    },
  });

  // ================================================================ 3-05
  // 傾きの式 \frac{y2-y1}{x2-x1}=…
  function slopeEasy(A, B) {
    const dy = B[1] - A[1], dx = B[0] - A[0], s = Q(dy, dx);
    const mid = dx === 1 ? '' : `=\\frac{${dy}}{${dx}}`, last = tq(s);
    return `$\\frac{${B[1]}-${par(A[1])}}{${B[0]}-${par(A[0])}}${mid === `=${last}` ? '' : mid}=${last}$`;
  }
  M.add({
    id: '3-05', part: 1, chap: '3-5①②', stars: 1,
    title: '《傾|かたむ》きは「たての《変化|へん|か》÷《横|よこ》の《変化|へん|か》」',
    mark: '《直線|ちょく|せん》の《上|うえ》の**2《点|てん》の《座標|ざ|ひょう》**がわかっていて、**《傾|かたむ》き**を《聞|き》かれる。',
    futsu: ['グラフをかいて、マス《目|め》を', '《数|かぞ》えて《急|きゅう》さを《見|み》る。'],
    raku: ['$(1,\\ 2)$、$(5,\\ 4)$', '$\\frac{4-2}{5-1}=\\frac{2}{4}=\\frac{1}{2}$', '《逆|ぎゃく》の《順|じゅん》でひいても《同|おな》じ'],
    why: '《傾|かたむ》きは、《横|よこ》に1《進|すす》むと《上|あ》がる《高|たか》さ。どの2《点|てん》でも《同|おな》じ（3-5①）。',
    caution: 'たてと《横|よこ》で、ひく《順番|じゅん|ばん》をそろえる。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxh: { s1: '12mm' },
    fits(q) {
      if (!/傾き|変化の割合/.test(q) || /式/.test(q)) return false;
      const c = numCoords(q);
      if (c.length >= 2) return c[0][0] !== c[1][0];
      return (q.match(/\$x=-?\d+\$ で \$y=-?\d+\$/g) || []).length >= 2;
    },
    steps: {
      s1(r) {
        const x1 = r.int(-3, 4), dx = r.int(1, 6), dy = r.intNot(-9, 9, v => v === 0), y1 = r.int(-4, 5);
        const A = [x1, y1], B = [x1 + dx, y1 + dy];
        return { q: `2${W.ten} $${P(...A)}$、$${P(...B)}$ を${W.tooru}${W.chokusen}の${W.katamuki}`, a: `$${tq(Q(dy, dx))}$`, easy: slopeEasy(A, B), key: k2('k', A, B) };
      },
      // 右の点が先に書いてある・名前つき・マイナスの座標（傾きは整数）
      s2(r) {
        const x1 = r.int(-6, -1), dx = r.int(1, 5), a = r.intNot(-4, 4, v => v === 0), y1 = r.int(-6, 4);
        const A = [x1, y1], B = [x1 + dx, y1 + a * dx];
        return { q: `《点|てん》A $${P(...B)}$、《点|てん》B $${P(...A)}$ を${W.tooru}${W.chokusen}の${W.katamuki}`, a: `$${a}$`, easy: slopeEasy(B, A), key: k2('k', A, B) };
      },
      // 坂・変化の割合・ばね
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const h = r.pick([5, 10, 20, 25, 40, 50]), v = r.intNot(1, 6, x => x >= h);
          return { q: `《横|よこ》に ${h} m 《進|すす》むと ${v} m 《上|あ》がる《坂|さか》の${W.katamuki}（《小数|しょう|すう》で）`, a: `$${fmt(v / h)}$`, easy: `$${v}\\div${h}=${fmt(v / h)}$`, key: `saka${v}/${h}` };
        }
        if (k === 1) {
          const x1 = r.int(-2, 3), dx = r.int(2, 5), a = r.intNot(-4, 5, v => v === 0), b = r.int(-5, 5);
          const y1 = a * x1 + b, x2 = x1 + dx, y2 = a * x2 + b;
          return { q: `$x=${x1}$ で $y=${y1}$、$x=${x2}$ で $y=${y2}$ の1《次関数|じ|かん|すう》の《変化|へん|か》の《割合|わり|あい》`, a: `$${a}$`, easy: slopeEasy([x1, y1], [x2, y2]) };
        }
        const n1 = r.int(1, 3), n2 = r.int(n1 + 2, 7), d = r.pick([2, 3, 4, 5]), L0 = r.int(8, 15);
        const l1 = L0 + d * n1, l2 = L0 + d * n2;
        return { q: `ばねは、おもり ${n1}《個|こ》で ${l1} cm、${n2}《個|こ》で ${l2} cm。1《個|こ》あたり □ cm のびる`, a: `$${d}$`, easy: `$\\frac{${l2}-${l1}}{${n2}-${n1}}=${d}$` };
      },
      // わな：x 座標が同じ（たての直線）。横の変化が0で、傾きはない
      trap(r) {
        const x = r.intNot(-5, 6, v => v === 0), y1 = r.int(-5, 3), y2 = r.intNot(-4, 8, v => v === y1);
        return {
          q: `2${W.ten} $${P(x, y1)}$、$${P(x, y2)}$ を${W.tooru}${W.chokusen}の${W.katamuki}`,
          a: 'ない', easyCheck: false, key: k2('kt', [x, y1], [x, y2]),
          easy: `（$x$ 《座標|ざ|ひょう》が《同|おな》じたての${W.chokusen}。《横|よこ》の《変化|へん|か》が0で、わり《算|ざん》ができない）`,
          verify: () => true,
        };
      },
    },
  });

  // ================================================================ 3-06
  // 「$y=-2x+7$ で、$x$ が $2$ から $5$ までの $y$ の変化量」
  const hk = (F, p, q) => `$y=${F}$ で、$x$：$${p}\\to${q}$ の $y$ の${W.henka}`;
  M.add({
    id: '3-06', part: 1, chap: '3-5③', stars: 1,
    title: '$y$ の《変化量|へん|か|りょう》＝《傾|かたむ》き×$x$ の《変化量|へん|か|りょう》',
    mark: '「$x$ が□から□まで《変|か》わるとき、$y$ の**《変化量|へん|か|りょう》**」。《式|しき》は $y=ax+b$。',
    futsu: ['$x=2$ と $x=5$ で $y$ を', '2《回|かい》《計算|けい|さん》して、あと－まえ。'],
    raku: ['$y=-2x+7$、$x$：$2\\to5$（2から5まで）', '$x$ の《変化量|へん|か|りょう》は $5-2=3$', '$-2\\times3=-6$'],
    why: '1《次関数|じ|かん|すう》では、$y$ の《変化量|へん|か|りょう》＝$a$×$x$ の《変化量|へん|か|りょう》。$b$ はひき《算|ざん》で《消|き》えるので、《見|み》なくてよい（3-5③）。',
    caution: '《聞|き》かれているのが $y$ の《値|あたい》（$x=5$ のときの $y$）なら、ふつうに《代入|だい|にゅう》する。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    fits(q) { return /変化量/.test(q) && !/\^/.test(q); },
    steps: {
      s1(r) {
        const a = r.intNot(-6, 6, v => v === 0 || v === 1), b = r.int(-9, 9), p = r.int(-3, 4), q = r.int(p + 1, p + 6);
        const F = lin(Q(a), Q(b)), d = a * (q - p);
        return { q: hk(F, p, q), a: `$${d}$`, easy: `$${a}\\times(${q}-${par(p)})=${d}$`,
          verify: () => d === M.evalMath(F, { x: q }) - M.evalMath(F, { x: p }) || 'まちがい' };
      },
      // 定数が先の式・分数の傾き・x がへる
      s2(r) {
        const k = r.int(0, 2);
        let a, F, p, q;
        if (k === 0) { a = Q(r.pick([-5, -4, -3, -2, 2, 3])); F = linR(a, Q(r.int(3, 20))); p = r.int(0, 3); q = r.int(p + 2, p + 6); }
        else if (k === 1) { const d = r.pick([2, 3]); a = Q(r.pick([1, -1, 2, -2].filter(n => gcd(n, d) === 1)), d); F = lin(a, Q(r.int(-5, 5))); p = r.int(-2, 2) * d; q = p + d * r.int(1, 3); }
        else { a = Q(r.pick([-4, -3, 2, 3, 5])); F = lin(a, Q(r.int(-6, 6))); q = r.int(-3, 2); p = q + r.int(2, 5); }
        const d = Q(a[0] * (q - p), a[1]);
        return { q: hk(F, p, q), a: `$${tq(d)}$`, easy: `$${a[1] === 1 ? par(a[0]) : `\\left(${tq(a)}\\right)`}\\times(${q}-${par(p)})=${tq(d)}$`,
          verify: () => close(qv(d), M.evalMath(F, { x: q }) - M.evalMath(F, { x: p })) || 'まちがい' };
      },
      // 場面：水そう・電池・山の気温
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const c = r.int(2, 6), b = r.int(2, 10), p = r.int(1, 4), q = r.int(p + 2, p + 7), d = c * (q - p);
          return { q: `《水|みず》そうの《水|みず》の《量|りょう》は、$x$ 《分後|ふん|ご》に $y=${c}x+${b}$（L）。${fun(p, 1)}から ${fun(q, 1)}までの《水|みず》の《量|りょう》の${W.henka}は □ L`,
            a: `$${d}$`, easy: `$${c}\\times(${q}-${p})=${d}$` };
        }
        if (k === 1) {
          const c = r.pick([10, 20, 25]), p = r.int(1, 2), q = r.int(p + 1, Math.floor(100 / c)), d = -c * (q - p);
          return { q: `《電池|でん|ち》の《残|のこ》りは、$x$ 《時間後|じ|かん|ご》に $y=-${c}x+100$（%）。${p}《時間後|じ|かん|ご》から ${q}《時間後|じ|かん|ご》までの $y$ の${W.henka}は □ %`,
            a: `$${d}$`, easy: `$-${c}\\times(${q}-${p})=${d}$` };
        }
        const p = r.pick([0, 0.5, 1]), q = p + r.pick([1, 1.5, 2, 2.5, 3]), d = +(-6 * (q - p)).toFixed(6);
        return { q: `《高|たか》さ $x$ km の《気温|き|おん》は《地面|じ|めん》より $y=-6x$（℃）だけ《変|か》わる。$x$ が ${p} から ${q} までの《気温|き|おん》の${W.henka}は □ ℃`,
          a: `$${fmt(d)}$`, easy: `$-6\\times(${q}-${p})=${fmt(d)}$` };
      },
      // わな：変化量ではなく y の値／1次関数でない（y=x^2）
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.intNot(-5, 5, v => v === 0 || v === 1), b = r.int(-6, 6), n = r.int(2, 7), F = lin(Q(a), Q(b)), v = a * n + b;
          return { q: `$y=${F}$ で、$x=${n}$ ${W.toki}の $y$ の《値|あたい》`, a: `$${v}$`, easyCheck: false,
            easy: `（${W.henka}ではない。そのまま《代入|だい|にゅう》する：$${a}\\times${n}${b < 0 ? '' : '+'}${b}=${v}$）`, verify: () => v === M.evalMath(F, { x: n }) || 'まちがい' };
        }
        const c = r.pick([1, 2]), p = r.int(0, 2), q = r.int(p + 1, p + 3), F = c === 1 ? 'x^2' : '2x^2', d = c * (q * q - p * p);
        return { q: hk(F, p, q), a: `$${d}$`, easyCheck: false,
          easy: `（1《次関数|じ|かん|すう》ではない。《傾|かたむ》きが《一定|いっ|てい》でないので、2《回|かい》《計算|けい|さん》してひく：$${c * q * q}-${c * p * p}=${d}$）`,
          verify: () => d === M.evalMath(F, { x: q }) - M.evalMath(F, { x: p }) || 'まちがい' };
      },
    },
  });

  // ================================================================ 3-07
  // 式 eq（TeX、x と y の等式）に、点 (x, y) が入るか
  function onEq(eq, x, y) {
    const k = eq.indexOf('=');
    return close(M.evalMath(eq.slice(0, k), { x, y }), M.evalMath(eq.slice(k + 1), { x, y }));
  }
  function readOK(eq, a, b) {
    for (const x of [0, 1, 3]) if (!onEq(eq, x, qv(a) * x + qv(b))) return `$${eq}$ に (${x}, ${qv(a) * x + qv(b)}) が入らない`;
    return true;
  }
  // 「$2x+3y=6$ の傾きは □、切片は □」
  function readProb(eq, a, b, easy) {
    return { q: `$${eq}$ の${W.katamuki}は □、${W.seppen}は □`, a: `$${tq(a)}$、$${tq(b)}$`, easy, easyCheck: false, verify: () => readOK(eq, a, b) };
  }
  M.add({
    id: '3-07', part: 1, chap: '3-5③', stars: 1,
    title: '$y=$ の《形|かたち》に《直|なお》して《傾|かたむ》き・《切片|せっ|ぺん》を《読|よ》む',
    mark: '$y$ が**《左|ひだり》にひとりでいない**《式|しき》（$2x+3y=6$、$y=100-20x$）。',
    futsu: ['$x=0$ と $x=1$ を《入|い》れて', '$y$ を《求|もと》め、2《点|てん》から', '《傾|かたむ》きを《計算|けい|さん》する。'],
    raku: ['$2x+3y=6$', '$3y=-2x+6$', '$y=-\\frac{2}{3}x+2$', '《傾|かたむ》き $-\\frac{2}{3}$、《切片|せっ|ぺん》2'],
    why: '$y=ax+b$ の《形|かたち》にすれば、$a$ が《傾|かたむ》き、$b$ が《切片|せっ|ぺん》と、そのまま《読|よ》める（3-5③）。',
    caution: '$x$ の《係数|けい|すう》は、マイナスごと《読|よ》む。$y=100-20x$ の《傾|かたむ》きは $-20$。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxh: { s3: '12mm' },
    fits(q) {
      if (!/傾き/.test(q) || !/切片/.test(q)) return false;
      const eq = maths(q).find(t => t.includes('='));
      if (!eq || !/x/.test(eq) || !/y/.test(eq) || /xy/.test(eq)) return false;
      return !/^y=-?(\\frac\{\d+\}\{\d+\}|\d+(\.\d+)?)?x([+-](\\frac\{\d+\}\{\d+\}|\d+(\.\d+)?))?$/.test(eq);
    },
    steps: {
      // y=b+ax（定数が先）
      s1(r) {
        const a = Q(r.pick([-20, -5, -4, -3, -2, 2, 3, 4, 6, 10])), b = Q(r.pick([100, 50, 12, 8, 5, 3, -3, -6]));
        return readProb(`y=${linR(a, b)}`, a, b, `$y=${lin(a, b)}$`);
      },
      // 答えが整数になる形：px+y=c、ky=…（k でわる）、y-n=mx
      s2(r) {
        const k = r.int(0, 2), m = r.intNot(-5, 5, v => v === 0), n = r.intNot(-8, 9, v => v === 0), a = Q(m), b = Q(n);
        if (k === 0) return readProb(`${lin(Q(-m), Q(0))}+y=${n}`, a, b, `$${lin(Q(-m), Q(0))}$ を《移項|い|こう》して $y=${lin(a, b)}$`);
        if (k === 1) { const c = r.pick([2, 3, 4]); return readProb(`${c}y=${lin(Q(c * m), Q(c * n))}`, a, b, `${c} でわって $y=${lin(a, b)}$`); }
        return readProb(`y${n < 0 ? '+' : '-'}${Math.abs(n)}=${lin(a, Q(0))}`, a, b, `$${-n}$ を《移項|い|こう》して $y=${lin(a, b)}$`);
      },
      // 分数になる形：px+qy=c、px-qy=c、\frac{x}{m}+\frac{y}{n}=1
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const p = r.pick([1, 2, 3, 4, 5, -2, -3]), q = r.pick([2, 3, 4, 5]), c = q * r.intNot(-4, 5, v => v === 0);
          if (gcd(p, q) !== 1) return null;
          const a = Q(-p, q), b = Q(c, q), eq = `${poly([[p, 1]], 'x')}+${q}y=${c}`;
          return readProb(eq, a, b, `$${q}y=${lin(Q(-p), Q(c))}$ を ${q} でわって $y=${lin(a, b)}$`);
        }
        if (k === 1) {
          const p = r.pick([2, 3, 4, 5]), q = r.pick([2, 3]), c = q * r.intNot(-3, 4, v => v === 0);
          if (gcd(p, q) !== 1) return null;
          const a = Q(p, q), b = Q(-c, q), eq = `${p}x-${q}y=${c}`;
          return readProb(eq, a, b, `$-${q}y=${lin(Q(-p), Q(c))}$ を $-${q}$ でわって $y=${lin(a, b)}$`);
        }
        const m = r.pick([2, 3, 4, 5]), n = r.pick([2, 3, 4, 6]);
        if (m === n) return null;
        const a = Q(-n, m), b = Q(n), eq = `\\frac{x}{${m}}+\\frac{y}{${n}}=1`;
        return readProb(eq, a, b, `${n} 《倍|ばい》して $y=${lin(a, b)}$`);
      },
      // わな：x だけの式（たての直線）、xy=k（反比例）。y= の形にできない
      trap(r) {
        if (r.chance(0.5)) {
          const k = r.pick([2, 3, 4, 5]), v = r.intNot(-4, 5, x => x === 0);
          return { q: `$${k}x=${k * v}$ の${W.katamuki}は □、${W.seppen}は □`, a: 'ない、ない', easyCheck: false,
            easy: `（$x=${v}$ のたての${W.chokusen}。$y$ がないので $y=$ の《形|かたち》にできない）`, verify: () => true };
        }
        const k = r.pick([6, 8, 12, 18, 24]);
        return { q: `$xy=${k}$ の${W.katamuki}は □、${W.seppen}は □`, a: 'ない、ない', easyCheck: false,
          easy: `（$y=\\frac{${k}}{x}$ の《反比例|はん|ぴ|れい》。グラフは${W.chokusen}ではない）`, verify: () => true };
      },
    },
  });

  // ================================================================ 3-08
  // 「位置は 0 s で 0 m、200 s で 1000 m。」（時刻と位置の表を1行で）
  const tbl = (ts, xs, tu, xu) => `《位置|い|ち》は ${ts.map((t, i) => `${t} ${tu} で ${xs[i]} ${xu}`).join('、')}。`;
  M.add({
    id: '3-08', part: 1, chap: '3-5④・3-4③', stars: 1,
    title: '《位置|い|ち》の《表|ひょう》の《傾|かたむ》きは《速|はや》さ',
    mark: '**《時刻|じ|こく》と《位置|い|ち》**の《表|ひょう》（$x$-$t$）。《傾|かたむ》きの《単位|たん|い》は、たて÷《横|よこ》。',
    futsu: ['グラフをかいて、', '《線|せん》の《急|きゅう》さを《目|め》で《見|み》る。'],
    raku: ['0 s で 0 m、200 s で 1000 m', '$\\frac{1000-0}{200-0}=5$ で 5 m/s', '《止|と》まれば0、もどれば《負|ふ》'],
    why: '$x$-$t$ グラフの《傾|かたむ》き $\\frac{\\Delta x}{\\Delta t}$ は、《進|すす》んだ《道|みち》のり÷かかった《時間|じ|かん》で、《速|はや》さそのもの（3-5④）。',
    caution: '《単位|たん|い》はたての《単位|たん|い》÷《横|よこ》の《単位|たん|い》。km と h なら km/h。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    fits(q) { return /位置/.test(q) && /速さ/.test(q); },
    steps: {
      s1(r) {
        const v = r.int(1, 8), t2 = r.pick([10, 20, 50, 100, 200, 300, 400]), x2 = v * t2;
        return { q: `${tbl([0, t2], [0, x2], 's', 'm')}${W.hayasa}は □ m/s`, a: `$${v}$`, easy: `$\\frac{${x2}-0}{${t2}-0}=${v}$` };
      },
      // とちゅうの時刻から。止まっている・もどる（0 や負の速さ）
      s2(r) {
        const t1 = r.pick([100, 200, 300]), x1 = r.pick([600, 800, 1000, 1200]);
        if (r.chance(0.35)) {
          const t2 = t1 + r.pick([100, 200, 300]);
          return { q: `${tbl([t1, t2], [x1, x1], 's', 'm')}${W.hayasa}は □ m/s`, a: '$0$', easy: `$\\frac{${x1}-${x1}}{${t2}-${t1}}=0$（《止|と》まっている）` };
        }
        const back = r.pick([2, 3, 4, 5]);
        if (x1 % back) return null;
        const t2 = t1 + x1 / back;
        return { q: `${tbl([t1, t2], [x1, 0], 's', 'm')}${W.hayasa}は □ m/s`, a: `$${-back}$`, easy: `$\\frac{0-${x1}}{${t2}-${t1}}=${-back}$（もどる）` };
      },
      // km と h、m と min
      s3(r) {
        if (r.chance(0.5)) {
          const v = r.pick([40, 50, 60, 80]), t1 = r.int(1, 2), t2 = t1 + r.int(1, 3), x1 = r.pick([10, 20, 30]), x2 = x1 + v * (t2 - t1);
          return { q: `${tbl([t1, t2], [x1, x2], 'h', 'km')}${W.hayasa}は □ km/h`, a: `$${v}$`, easy: `$\\frac{${x2}-${x1}}{${t2}-${t1}}=${v}$` };
        }
        const v = r.pick([60, 70, 80, 150, 200]), t1 = r.int(2, 5), t2 = t1 + r.int(2, 6), x1 = r.pick([100, 300, 500]), x2 = x1 + v * (t2 - t1);
        return { q: `${tbl([t1, t2], [x1, x2], 'min', 'm')}${W.hayasa}は □ m/min`, a: `$${v}$`, easy: `$\\frac{${x2}-${x1}}{${t2}-${t1}}=${v}$` };
      },
      // わな：1 m 進むのにかかる時間（時間÷道のり。速さとは逆）
      trap(r) {
        const v = r.pick([2, 4, 5, 8, 10]), t2 = r.pick([20, 40, 80, 100, 200]), x2 = v * t2, ans = fmt(t2 / x2);
        return { q: `${tbl([0, t2], [0, x2], 's', 'm')}1 m 《進|すす》むのにかかる《時間|じ|かん》は □ s`, a: `$${ans}$`,
          easy: `（たて÷《横|よこ》ではなく、《時間|じ|かん》÷《道|みち》のり：$${t2}\\div${x2}=${ans}$）` };
      },
    },
  });

  // ================================================================ 3-09
  function lineProb(A, B, opt) {
    opt = opt || {};
    const dx = B[0] - A[0], dy = B[1] - A[1], a = Q(dy, dx), b = Q(A[1] * a[1] - a[0] * A[0], a[1]);
    const ans = `y=${lin(a, b, 'x', opt.dec)}`;
    const sl = dx === 1 ? `${dy}` : `\\frac{${dy}}{${dx}}=${tq(a, opt.dec)}`;   // 横の変化が1なら分数にしない（3-05 と同じ）
    return { a, b, ans, easy: `《傾|かたむ》き $${sl}$、$${A[1]}=${tq(a, opt.dec)}\\times${par(A[0])}+b$ より $b=${tq(b, opt.dec)}$` };
  }
  // 「2点 $(2,\ 14)$、$(5,\ 20)$ を通る直線の式は □」
  const lq = (A, B) => `2${W.ten} $${P(...A)}$、$${P(...B)}$ を${W.tooru}${W.chokusen}の${W.shiki}は □`;
  M.add({
    id: '3-09', part: 1, chap: '3-5⑤', stars: 1,
    title: '2《点|てん》を《通|とお》る《直線|ちょく|せん》は《傾|かたむ》きを《先|さき》に',
    mark: '《直線|ちょく|せん》の《上|うえ》の**2《点|てん》だけ**がわかっていて、《直線|ちょく|せん》の《式|しき》を《聞|き》かれる。',
    futsu: ['$y=ax+b$ に2《点|てん》を《入|い》れて、', '$a$ と $b$ の《連立方程式|れん|りつ|ほう|てい|しき》を《解|と》く。'],
    raku: ['$(2,\\ 14)$、$(5,\\ 20)$', '《傾|かたむ》き $\\frac{20-14}{5-2}=2$', '$14=2\\times2+b$、$b=10$', '$y=2x+10$'],
    why: '《傾|かたむ》きは、2《点|てん》のひき《算|ざん》でわかる。あとは1《点|てん》を《入|い》れれば、$b$ だけの《方程式|ほう|てい|しき》になる（3-5⑤）。',
    caution: '《最後|さい|ご》に、もう1《点|てん》を《入|い》れて《確|たし》かめる。1《点|てん》が $(0,\\ b)$ なら、わざ 3-10 がもっと《楽|らく》。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '30mm',
    fits(q) {
      if (!/直線の式/.test(q)) return false;
      const c = numCoords(q);
      return c.length >= 2 && c[0][0] !== c[1][0];
    },
    steps: {
      s1(r) {
        const a = r.intNot(-4, 5, v => v === 0), b = r.int(-6, 12), x1 = r.int(1, 4), x2 = r.int(x1 + 1, x1 + 4);
        const A = [x1, a * x1 + b], B = [x2, a * x2 + b], L = lineProb(A, B);
        return { q: lq(A, B), a: `$${L.ans}$`, easy: L.easy, key: k2('l', A, B), verify: () => lineOK(L.ans, [A, B]) };
      },
      // マイナスの座標・右の点が先
      s2(r) {
        const a = Q(r.intNot(-5, 4, v => v === 0)), x1 = r.int(-5, -1), x2 = r.intNot(-4, 4, v => v === 0 || v === x1);
        const b = r.int(-6, 8), f = x => qv(a) * x + b, A = [x1, f(x1)], B = [x2, f(x2)], L = lineProb(A, B);
        return { q: lq(A, B), a: `$${L.ans}$`, easy: L.easy, key: k2('l', A, B), verify: () => lineOK(L.ans, [A, B]) };
      },
      // 場面：ばね・ろうそく・水をぬく（y を x の式で）
      s3(r) {
        const k = r.int(0, 2);
        let A, B, text, dec = false;
        if (k === 0) {
          const d = r.int(2, 4), L0 = r.int(6, 12), n1 = r.int(1, 3), n2 = r.int(n1 + 2, 7);
          A = [n1, L0 + d * n1]; B = [n2, L0 + d * n2];
          text = `ばねの《長|なが》さは、おもり ${n1}《個|こ》で ${A[1]} cm、${n2}《個|こ》で ${B[1]} cm。おもり $x$ 《個|こ》で $y$ cm とすると、$y=□$`;
        } else if (k === 1) {
          const L0 = r.int(15, 24), t1 = r.pick([2, 4]), t2 = t1 + r.pick([4, 6, 8]);
          A = [t1, L0 - t1 / 2]; B = [t2, L0 - t2 / 2]; dec = true;
          text = `ろうそくの《長|なが》さは、${fun(t1, 1)}に ${fmt(A[1])} cm、${fun(t2, 1)}に ${fmt(B[1])} cm。$x$ 《分後|ふん|ご》に $y$ cm とすると、$y=□$`;
        } else {
          const c = r.int(2, 5), V0 = r.int(6, 12) * c, t1 = r.int(1, 3), t2 = t1 + r.int(2, 4);
          A = [t1, V0 - c * t1]; B = [t2, V0 - c * t2];
          text = `《水|みず》をぬくと、《水|みず》そうの《水|みず》は ${fun(t1, 1)}に ${A[1]} L、${fun(t2, 1)}に ${B[1]} L。$x$ 《分後|ふん|ご》に $y$ L とすると、$y=□$`;
        }
        const L = lineProb(A, B, { dec }), ans = L.ans.slice(2);
        return { q: text, a: `$${ans}$`, easy: L.easy, easyCheck: false, verify: () => lineOK(ans, [A, B]) };
      },
      // わな：x 座標が同じ2点（たての直線。y=ax+b の形にならない）
      trap(r) {
        const x = r.intNot(-4, 6, v => v === 0), y1 = r.int(-3, 4), y2 = r.intNot(-2, 9, v => v === y1);
        return { q: lq([x, y1], [x, y2]), a: `$x=${x}$`, easyCheck: false, key: k2('lt', [x, y1], [x, y2]),
          easy: `（$x$ 《座標|ざ|ひょう》が《同|おな》じ。《傾|かたむ》きがない、たての${W.chokusen}）`, verify: () => true };
      },
    },
  });

  // ================================================================ 3-10
  M.add({
    id: '3-10', part: 1, chap: '3-5③⑤', stars: 1,
    title: '$(0,\\ b)$ があれば《切片|せっ|ぺん》はすぐ',
    mark: '2《点|てん》の《一方|いっ|ぽう》が、$x$ 《座標|ざ|ひょう》**0**の《点|てん》 $(0,\\ b)$。',
    futsu: ['《傾|かたむ》きを《出|だ》して、', '1《点|てん》を《代入|だい|にゅう》して $b$ の《方程式|ほう|てい|しき》を《解|と》く。'],
    raku: ['$(0,\\ 3)$、$(2,\\ 7)$', '$b=3$（そのまま《読|よ》む）', '$a=\\frac{7-3}{2-0}=2$', '$y=2x+3$'],
    why: '$x=0$ のとき $y=a\\times0+b=b$。$(0,\\ b)$ を《通|とお》るなら、その $y$ 《座標|ざ|ひょう》が《切片|せっ|ぺん》（3-5③）。',
    caution: '$(b,\\ 0)$ のように $y$ 《座標|ざ|ひょう》が0の《点|てん》は、《切片|せっ|ぺん》ではない（$x$ 《軸|じく》と《交|まじ》わる《点|てん》）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '30mm',
    fits(q) {
      if (/切片が/.test(q) && /通る直線の式/.test(q)) return true;
      if (!/直線の式/.test(q)) return false;
      const c = numCoords(q);
      return c.length >= 2 && c.some(p => p[0] === 0) && !c.every(p => p[0] === c[0][0]);
    },
    steps: {
      s1(r) {
        const a = r.intNot(-5, 5, v => v === 0), b = r.intNot(-8, 9, v => v === 0), x2 = r.intNot(-3, 5, v => v === 0);
        const A = [0, b], B = [x2, a * x2 + b], ans = `y=${lin(Q(a), Q(b))}`;
        return { q: lq(A, B), a: `$${ans}$`, key: k2('l', A, B),
          easy: `$b=${b}$、$a=\\frac{${B[1]}-${par(b)}}{${x2}-0}=${a}$`, easyCheck: false, verify: () => lineOK(ans, [A, B]) };
      },
      // (0, b) があとに書いてある・「切片が b で」
      s2(r) {
        const k = r.int(0, 2), b = r.intNot(-6, 8, v => v === 0);
        const a = Q(r.intNot(-4, 4, v => v === 0)), x2 = r.intNot(-4, 4, v => v === 0);
        const B = [x2, qv(a) * x2 + b], A = [0, b], ans = `y=${lin(a, Q(b))}`;
        if (k === 2) {
          return { q: `${W.seppen}が $${b}$ で、${W.ten} $${P(...B)}$ を${W.tooru}${W.chokusen}の${W.shiki}は □`, a: `$${ans}$`, key: k2('l', A, B),
            easy: `$${B[1]}=a\\times${par(x2)}+${par(b)}$ より $a=${tq(a)}$`, easyCheck: false, verify: () => lineOK(ans, [A, B]) };
        }
        return { q: lq(B, A), a: `$${ans}$`, key: k2('l', A, B),
          easy: `$b=${b}$、$a=\\frac{${B[1]}-${par(b)}}{${x2}-0}=${tq(a)}$`, easyCheck: false, verify: () => lineOK(ans, [A, B]) };
      },
      // 場面：はじめの量（0分のとき）がわかっている
      s3(r) {
        const k = r.int(0, 2);
        let A, B, text;
        if (k === 0) {
          const b = r.int(2, 9), c = r.int(2, 5), t = r.int(2, 6);
          A = [0, b]; B = [t, b + c * t];
          text = `《水|みず》そうの《水|みず》は、《入|い》れはじめに ${b} L、${fun(t, 1)}に ${B[1]} L。$x$ 《分後|ふん|ご》に $y$ L とすると、$y=□$`;
        } else if (k === 1) {
          const b = r.int(8, 14), d = r.int(2, 4), n = r.int(3, 6);
          A = [0, b]; B = [n, b + d * n];
          text = `ばねの《長|なが》さは、おもりなしで ${b} cm、おもり ${n}《個|こ》で ${B[1]} cm。おもり $x$ 《個|こ》で $y$ cm とすると、$y=□$`;
        } else {
          const d = r.pick([10, 20, 25]), t = r.int(1, Math.floor(100 / d) - 1);
          A = [0, 100]; B = [t, 100 - d * t];
          text = `《電池|でん|ち》の《残|のこ》りは、はじめ 100 %、${t}《時間後|じ|かん|ご》に ${B[1]} %。$x$ 《時間後|じ|かん|ご》に $y$ % とすると、$y=□$`;
        }
        const a = Q(B[1] - A[1], B[0]), ans = lin(a, Q(A[1]));
        return { q: text, a: `$${ans}$`, easy: `${W.seppen}は $${A[1]}$、${W.katamuki}は $\\frac{${B[1]}-${A[1]}}{${B[0]}}=${tq(a)}$`, easyCheck: false, verify: () => lineOK(ans, [A, B]) };
      },
      // わな：(p, 0)（y 座標が0）は切片ではない。2点からふつうに（わざ 3-09 で）
      trap(r) {
        const p = r.intNot(-4, 5, v => v === 0), a = r.intNot(-3, 3, v => v === 0), x2 = r.intNot(p - 3, p + 4, v => v === p || v === 0);
        const A = [p, 0], B = [x2, a * (x2 - p)], ans = `y=${lin(Q(a), Q(-a * p))}`;
        return dest({ q: lq(A, B), a: `$${ans}$`, key: k2('l', A, B), verify: () => lineOK(ans, [A, B]) },
          '3-10', `$${P(p, 0)}$ は $x$ 《座標|ざ|ひょう》が0ではない。《切片|せっ|ぺん》は $${-a * p}$`);
      },
    },
  });

  // ================================================================ 3-11
  // y-y1=m(x-x1) の形（m が 1・-1 なら書かない）
  const mcoef = (m, dec) => (isInt(m) && Math.abs(m[0]) === 1 ? (m[0] < 0 ? '-' : '') : tq(m, dec));
  const pointSlope = (m, x1, y1, dec) => `y${y1 < 0 ? '+' : '-'}${fmt(Math.abs(y1))}=${mcoef(m, dec)}(x${x1 < 0 ? '+' : '-'}${fmt(Math.abs(x1))})`.replace(/^y-0=/, 'y=').replace(/\(x-0\)$/, 'x');
  M.add({
    id: '3-11', part: 1, chap: '3-5⑥', stars: 1,
    title: '1《点|てん》と《傾|かたむ》きなら $y-y_1=m(x-x_1)$',
    mark: '**《傾|かたむ》きと1《点|てん》**がわかっている（「1《個|こ》ふやすごとに□」）。',
    futsu: ['$y=ax+b$ に《傾|かたむ》きと《点|てん》を《入|い》れて、', '$b$ の《方程式|ほう|てい|しき》を《解|と》く。'],
    raku: ['《傾|かたむ》き2、$(-1,\\ 3)$', '$y-3=2(x+1)$', '$y=2x+2+3=2x+5$'],
    why: '《傾|かたむ》きの《式|しき》 $\\frac{y-y_1}{x-x_1}=m$ の《分母|ぶん|ぼ》をはらった《形|かたち》。《数|かず》を《入|い》れて《展開|てん|かい》するだけ（3-5⑥）。',
    caution: '$x_1$ がマイナスなら、かっこごと《入|い》れる：$x-(-1)=x+1$。',
    counts: { s1: 9, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '30mm', s2: '30mm', s3: '24mm', trap: '24mm' },
    boxh: { s2: '12mm' },
    fits(q) { return /傾きが/.test(q) && /通る直線の式/.test(q) && coords(q).length === 1 && !/切片が/.test(q); },
    steps: {
      s1(r) {
        const m = r.intNot(-5, 5, v => v === 0), x1 = r.intNot(-3, 5, v => v === 0), y1 = r.int(-6, 9), b = y1 - m * x1, ans = `y=${lin(Q(m), Q(b))}`;
        return { q: `${W.katamuki}が $${m}$ で、${W.ten} $${P(x1, y1)}$ を${W.tooru}${W.chokusen}の${W.shiki}は □`, a: `$${ans}$`,
          easy: `$${pointSlope(Q(m), x1, y1)}$`, easyCheck: false, verify: () => lineOK(ans, [[x1, y1], [x1 + 1, y1 + m]]) };
      },
      // 分数の傾き・マイナスの x1
      s2(r) {
        const d = r.pick([2, 3]), m = Q(r.pick([1, -1, 2, -2].filter(n => gcd(n, d) === 1)), d);
        const x1 = d * r.intNot(-3, 2, v => v === 0), y1 = r.int(-5, 6), b = y1 - qv(m) * x1, ans = `y=${lin(m, Q(b))}`;
        return { q: `${W.katamuki}が $${tq(m)}$ で、${W.ten} $${P(x1, y1)}$ を${W.tooru}${W.chokusen}の${W.shiki}は □`, a: `$${ans}$`,
          easy: `$${pointSlope(m, x1, y1)}$`, easyCheck: false, verify: () => lineOK(ans, [[x1, y1], [x1 + m[1], y1 + m[0]]]) };
      },
      // 場面：「1つふやすごとに」「1時間に」
      s3(r) {
        const k = r.int(0, 2);
        let mq, x1, y1, text, dec = false;
        if (k === 0) {
          const m = r.int(2, 4); mq = Q(m); x1 = r.int(2, 4); y1 = r.int(6, 12) + m * x1;
          text = `ばねは、おもり ${x1}《個|こ》で ${y1} cm、1《個|こ》ふやすごとに ${m} cm のびる。おもり $x$ 《個|こ》で $y$ cm とすると、$y=□$`;
        } else if (k === 1) {
          const m = r.pick([1, 2, 3]); mq = Q(m); x1 = r.int(8, 10); y1 = r.int(14, 22);
          text = `《気温|き|おん》は ${x1}《時|じ》に ${y1} ℃ で、1《時間|じ|かん》に ${m} ℃ ずつ《上|あ》がる。$x$ 《時|じ》に $y$ ℃ とすると、$y=□$`;
        } else {
          mq = Q(-1, 2); x1 = r.pick([2, 4, 6]); y1 = r.int(14, 20); dec = true;
          text = `ろうそくは、${fun(x1, 1)}に ${y1} cm で、1《分|ぷん》に 0.5 cm ずつ《短|みじか》くなる。$x$ 《分後|ふん|ご》に $y$ cm とすると、$y=□$`;
        }
        const b = Q(y1 * mq[1] - mq[0] * x1, mq[1]), ans = lin(mq, b, 'x', dec);
        return { q: text, a: `$${ans}$`, easy: `$${pointSlope(mq, x1, y1, dec)}$`, easyCheck: false, verify: () => lineOK(ans, [[x1, y1], [x1 + 2, y1 + 2 * qv(mq)]]) };
      },
      // わな：1点だけで、傾きがわからない。比例なら y=ax に入れて a を求める
      trap(r) {
        const a = r.intNot(-4, 5, v => v === 0 || v === 1), x1 = r.intNot(-3, 4, v => v === 0), ans = `y=${lin(Q(a), Q(0))}`;
        return { q: `${W.ten} $${P(x1, a * x1)}$ を${W.tooru}《比例|ひ|れい》のグラフの${W.shiki}は □`, a: `$${ans}$`, easyCheck: false,
          also: ['3-10'], easy: `（《傾|かたむ》きはわかっていない。《比例|ひ|れい》なので $(0,\\ 0)$ も《通|とお》り、《切片|せっ|ぺん》は0。わざ 3-10 の《考|かんが》えで $a=${a}$）`, verify: () => lineOK(ans, [[0, 0], [x1, a * x1]]) };
      },
    },
  });

  // ================================================================ 3-12
  M.add({
    id: '3-12', part: 1, chap: '3-5⑦・3-4③', stars: 1,
    title: '《速|はや》さが《一定|いっ|てい》の《区切|く|ぎ》りは《面積|めん|せき》で《道|みち》のり',
    mark: '「0〜3 s は 4 m/s、3〜8 s は 2 m/s」のように、**《区切|く|ぎ》りごとに《速|はや》さが《一定|いっ|てい》**（$v$-$t$）。',
    futsu: ['《区切|く|ぎ》りごとの《道|みち》のりを、', '《文|ぶん》を《読|よ》みながら1つずつ《出|だ》す。'],
    raku: ['$v$-$t$ グラフは《長方形|ちょう|ほう|けい》がならぶ', '《面積|めん|せき》（《速|はや》さ×《時間|じ|かん》）をたす：', '$4\\times3+2\\times5=22$ m'],
    why: '$v$-$t$ グラフの《長方形|ちょう|ほう|けい》の《面積|めん|せき》が、その《区切|く|ぎ》りの《道|みち》のり。たすだけでよい（3-5⑦）。',
    caution: '《時間|じ|かん》は「おわり－はじめ」。《止|と》まっている《区切|く|ぎ》りの《道|みち》のりは0。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    fits(q) { return /道のり/.test(q) && /m\/s|km\/h|m\/min|速さ/.test(q) && /〜/.test(q); },
    steps: {
      s1(r) {
        const t1 = r.int(2, 6), t2 = t1 + r.int(2, 6), v1 = r.int(1, 8), v2 = r.intNot(1, 8, v => v === v1), d = v1 * t1 + v2 * (t2 - t1);
        return { q: `0〜${t1} s：${v1} m/s、${t1}〜${t2} s：${v2} m/s の${W.michi}は □ m`, a: `$${d}$`, easy: `$${v1}\\times${t1}+${v2}\\times${t2 - t1}=${d}$` };
      },
      // 3つの区切り（止まっているときがある）、はじめが0でない
      s2(r) {
        const t0 = r.pick([0, 0, 2, 5]), t1 = t0 + r.int(2, 5), t2 = t1 + r.int(1, 4), t3 = t2 + r.int(2, 5);
        const v1 = r.int(2, 6), v3 = r.int(1, 6), d = v1 * (t1 - t0) + v3 * (t3 - t2);
        return { q: `${t0}〜${t1} s：${v1} m/s、${t1}〜${t2} s：0 m/s、${t2}〜${t3} s：${v3} m/s の${W.michi}は □ m`,
          a: `$${d}$`, easy: `$${v1}\\times${t1 - t0}+0\\times${t2 - t1}+${v3}\\times${t3 - t2}=${d}$` };
      },
      // わからない速さを求める・km/h・m/min
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t1 = r.int(2, 6), t2 = t1 + r.int(2, 5), v1 = r.int(1, 5), v2 = r.intNot(1, 8, v => v === v1), d = v1 * t1 + v2 * (t2 - t1);
          return { q: `0〜${t1} s：${v1} m/s、${t1}〜${t2} s：□ m/s で、${W.michi}が ${d} m`, a: `$${v2}$`,
            easy: `$(${d}-${v1}\\times${t1})\\div${t2 - t1}=${v2}$`, verify: () => v1 * t1 + v2 * (t2 - t1) === d || 'まちがい' };
        }
        if (k === 1) {
          const v1 = r.pick([30, 40, 60]), h1 = r.pick([1, 2]), v2 = r.pick([50, 80, 100]), h2 = r.pick([0.5, 1, 1.5]), d = v1 * h1 + v2 * h2;
          return { q: `《車|くるま》が ${h1} h は ${v1} km/h、つぎの ${h2} h は ${v2} km/h で《走|はし》った。${W.michi}は □ km`, a: `$${fmt(d)}$`, easy: `$${v1}\\times${h1}+${v2}\\times${h2}=${fmt(d)}$` };
        }
        const w = r.pick([60, 70, 80]), m1 = r.int(5, 15), run = r.pick([150, 200]), m2 = r.int(3, 8), d = w * m1 + run * m2;
        return { q: `${m1} min は ${w} m/min で《歩|ある》き、${m2} min は ${run} m/min で《走|はし》った。${W.michi}は □ m`, a: `$${d}$`, easy: `$${w}\\times${m1}+${run}\\times${m2}=${d}$` };
      },
      // わな：速さではなく位置の表（面積ではなく、あと－まえ。いつも前へ進む）
      trap(r) {
        const x0 = r.pick([0, 0, 5, 10]), t1 = r.int(2, 4), t2 = t1 + r.int(3, 6), x1 = x0 + r.int(2, 5) * t1, x2 = x1 + r.int(1, 4) * (t2 - t1), d = x2 - x0;
        return { q: `${W.ichi}は 0 s で ${x0} m、${t1} s で ${x1} m、${t2} s で ${x2} m（《前|まえ》へだけ《進|すす》む）。${W.michi}は □ m`, a: `$${d}$`,
          easy: `（《速|はや》さではなく《位置|い|ち》。《面積|めん|せき》ではなく、あと－まえ：$${x2}-${x0}=${d}$）` };
      },
    },
  });

  // ================================================================ 3-13
  // 「気温は 9時 18 ℃、12時 24 ℃。直線なら 10時は □ ℃」（あいだは直線で変わるとして読む）
  const yomu = '《直線|ちょく|せん》なら';
  const nq = (pts, h) => `${W.kion} ${pts.map(([t, T]) => `${t}《時|じ》 ${T} ℃`).join('、')}。${yomu} ${h}《時|じ》は □ ℃`;
  M.add({
    id: '3-13', part: 1, chap: '3-5⑧・3-4④', stars: 1,
    title: '《表|ひょう》のあいだは《傾|かたむ》きで《読|よ》む（《内挿|ない|そう》）',
    mark: '《表|ひょう》の**2つの《値|あたい》のあいだ**の《値|あたい》を《聞|き》かれる。',
    futsu: ['グラフをかいて、', '《線|せん》から《目|め》で《読|よ》む。'],
    raku: ['9《時|じ》 18 ℃、12《時|じ》 24 ℃', '1《時間|じ|かん》に $\\frac{24-18}{12-9}=2$ ℃', '10《時|じ》は $18+2\\times1=20$ ℃'],
    why: 'あいだは《直線|ちょく|せん》で《変|か》わると《考|かんが》える。《傾|かたむ》き×《進|すす》んだ《分|ぶん》を、はじめの《値|あたい》にたす（3-5⑧）。',
    caution: '《表|ひょう》の《外|そと》（《外挿|がい|そう》）は、《直線|ちょく|せん》がつづくとはかぎらない。ふえ《方|かた》が《一定|いっ|てい》でない《表|ひょう》にも《使|つか》えない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    fits(q) { return q.includes('直線なら') && !/\^/.test(q); },
    steps: {
      s1(r) {
        const h1 = r.int(6, 10), dh = r.int(2, 4), m = r.int(1, 4), T1 = r.int(8, 20), h = r.int(h1 + 1, h1 + dh - 1);
        const T2 = T1 + m * dh, T = T1 + m * (h - h1);
        return { q: nq([[h1, T1], [h1 + dh, T2]], h), a: `$${T}$`, easy: `1《時間|じ|かん》に $${m}$ ℃。$${T1}+${m}\\times${h - h1}=${T}$`, easyCheck: false,
          verify: () => close(T, T1 + (T2 - T1) * (h - h1) / dh) || 'まちがい' };
      },
      // 下がる・3つの値から区切りを選ぶ
      s2(r) {
        if (r.chance(0.5)) {
          const h1 = r.int(14, 17), dh = r.int(2, 4), m = r.int(1, 3), T1 = r.int(18, 28), h = r.int(h1 + 1, h1 + dh - 1);
          const T2 = T1 - m * dh, T = T1 - m * (h - h1);
          return { q: nq([[h1, T1], [h1 + dh, T2]], h), a: `$${T}$`, easy: `1《時間|じ|かん》に $${-m}$ ℃。$${T1}-${m}\\times${h - h1}=${T}$`, easyCheck: false,
            verify: () => close(T, T1 + (T2 - T1) * (h - h1) / dh) || 'まちがい' };
        }
        const h1 = r.pick([6, 9]), T1 = r.int(10, 16), m1 = r.int(1, 3), m2 = r.int(1, 2);
        const h2 = h1 + 3, h3 = h2 + 3, T2 = T1 + 3 * m1, T3 = T2 - 3 * m2, h = r.int(h2 + 1, h3 - 1), T = T2 - m2 * (h - h2);
        return { q: nq([[h1, T1], [h2, T2], [h3, T3]], h), a: `$${T}$`, easy: `${h2}《時|じ》と ${h3}《時|じ》のあいだを《使|つか》う。$${T2}-${m2}\\times${h - h2}=${T}$`, easyCheck: false,
          verify: () => close(T, T2 + (T3 - T2) * (h - h2) / 3) || 'まちがい' };
      },
      // やかん・ばね（小数の答えも）
      s3(r) {
        if (r.chance(0.5)) {
          const t1 = r.int(1, 3), dt = r.pick([2, 4]), m = r.pick([3, 4, 5, 6]), T1 = r.int(20, 40), t = t1 + r.pick([1, 0.5, 1.5].filter(x => x < dt));
          const T = T1 + m * (t - t1);
          return { q: `やかんの《水|みず》：${fun(t1, 1)} ${T1} ℃、${fun(t1 + dt, 1)} ${T1 + m * dt} ℃。${yomu} ${fun(fmt(t), 1)}は □ ℃`,
            a: `$${fmt(T)}$`, easy: `1《分|ぷん》に $${m}$ ℃。$${T1}+${m}\\times${fmt(t - t1)}=${fmt(T)}$`, easyCheck: false,
            verify: () => close(T, T1 + m * dt * (t - t1) / dt) || 'まちがい' };
        }
        const n1 = r.int(1, 2), n2 = n1 + r.pick([2, 4]), d = r.pick([2, 3, 5]), L0 = r.int(8, 14), n = n1 + 1;
        const l1 = L0 + d * n1, l2 = L0 + d * n2, l = L0 + d * n;
        return { q: `ばね：${n1}《個|こ》で ${l1} cm、${n2}《個|こ》で ${l2} cm。${yomu} ${n}《個|こ》では □ cm`,
          a: `$${l}$`, easy: `1《個|こ》で $${d}$ cm。$${l1}+${d}\\times1=${l}$`, easyCheck: false,
          verify: () => close(l, l1 + (l2 - l1) * (n - n1) / (n2 - n1)) || 'まちがい' };
      },
      // わな：ふえ方が一定でない表（y=x^2）。直線で読むとずれる
      trap(r) {
        const c = r.pick([1, 2]), n = r.int(1, 4), F = c === 1 ? 'x^2' : '2x^2', x = n + 0.5, v = c * x * x;
        const xs = [n - 1, n, n + 1, n + 2].filter(t => t >= 0).slice(0, 3);
        const lin2 = c * (n * n + (n + 1) * (n + 1)) / 2;
        return { q: `$y=${F}$ の《表|ひょう》（$x$：${xs.join('、')}／$y$：${xs.map(t => c * t * t).join('、')}）で、$x=${fmt(x)}$ のとき $y=□$`, a: `$${fmt(v)}$`, easyCheck: false,
          easy: `（ふえ《方|かた》が《一定|いっ|てい》でない。《直線|ちょく|せん》で《読|よ》むと $${fmt(lin2)}$ でずれる。《式|しき》に《入|い》れる）`,
          verify: () => close(v, M.evalMath(F, { x })) || 'まちがい' };
      },
    },
  });

  // ================================================================ 3-14
  const OPN = { '<': '>', '>': '<', '\\leqq': '\\geqq', '\\geqq': '\\leqq' };
  const iq = orig => `《不等式|ふ|とう|しき》 $${orig}$ を《解|と》くと □`;
  M.add({
    id: '3-14', part: 1, chap: '3-5⑨', stars: 1,
    title: '《不等式|ふ|とう|しき》はマイナスでわると《向|む》きが《反対|はん|たい》',
    mark: '$x$ の《係数|けい|すう》が**マイナス**の《不等式|ふ|とう|しき》。',
    futsu: ['$x$ にいろいろな《数|かず》を《入|い》れて、', '《成|な》り《立|た》つかどうかを《調|しら》べる。'],
    raku: ['$-20x+100<30$', '$-20x<-70$', '$x>3.5$（$-20$ でわる。《向|む》きを《反対|はん|たい》に）'],
    why: 'マイナスをかける・わると、《数直線|すう|ちょく|せん》の《左右|さ|ゆう》が《入|い》れかわる。だから《大小|だい|しょう》も《入|い》れかわる（3-5⑨）。',
    caution: '《両辺|りょう|へん》にマイナスの《数|かず》を**たす・ひく**だけなら、《向|む》きは《変|か》わらない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '28mm',
    fits(q) {
      for (const t of maths(q)) {
        const o = splitIneq(t);
        if (!o || !/x/.test(t) || /\\leqq x\\leqq|<x<|y/.test(t)) continue;
        const g = x => M.evalMath(o.L, { x }) - M.evalMath(o.R, { x });
        const s = g(1) - g(0);
        if (Number.isFinite(s) && s < 0) return true;
      }
      return false;
    },
    steps: {
      // -ax+b<c（境目は整数か .5）
      s1(r) {
        const a = -r.int(2, 6), k = r.int(-6, 8) + (r.chance(0.25) && a % 2 === 0 ? 0.5 : 0), b = r.int(-9, 12);
        const c = a * k + b, op = r.pick(['<', '>', '\\leqq', '\\geqq']);
        if (!Number.isInteger(c)) return null;
        const orig = `${lin(Q(a), Q(b))}${op}${c}`, ans = `x${OPN[op]}${fmt(k)}`;
        return { q: iq(orig), a: `$${ans}$`, easy: `$${a}x${op}${c - b}$ を $${a}$ でわる（《向|む》きが《反対|はん|たい》）`, easyCheck: false, verify: () => ineqOK(orig, ans) };
      },
      // 両辺に x がある・定数が先
      s2(r) {
        if (r.chance(0.5)) {
          const p = r.int(1, 4), q = p + r.int(1, 4), k = r.int(-4, 6), s = r.int(-8, 8), t = (q - p) * k + s;
          const op = r.pick(['<', '>', '\\leqq', '\\geqq']);
          const orig = `${lin(Q(p), Q(t))}${op}${lin(Q(q), Q(s))}`, ans = `x${OPN[op]}${k}`;
          return { q: iq(orig), a: `$${ans}$`, easy: `$${lin(Q(p - q), Q(0))}${op}${s - t}$ を $${p - q}$ でわる（《向|む》きが《反対|はん|たい》）`, easyCheck: false, verify: () => ineqOK(orig, ans) };
        }
        const a = r.int(2, 5), b = r.int(3, 15), k = r.int(-4, 5), c = b - a * k, op = r.pick(['<', '>', '\\leqq', '\\geqq']);
        const orig = `${b}-${a}x${op}${c}`, ans = `x${OPN[op]}${k}`;
        return { q: iq(orig), a: `$${ans}$`, easy: `$-${a}x${op}${c - b}$ を $-${a}$ でわる（《向|む》きが《反対|はん|たい》）`, easyCheck: false, verify: () => ineqOK(orig, ans) };
      },
      // 場面：電池・山の気温・冷める湯
      s3(r) {
        const kk = r.int(0, 2);
        if (kk === 0) {
          const d = r.pick([10, 20, 25]), lim = r.pick([10, 20, 30, 40, 50]), k = (100 - lim) / d;
          const orig = `100-${d}x<${lim}`, ans = `x>${fmt(k)}`;
          return { q: `《電池|でん|ち》の《残|のこ》りは、$x$ 《時間後|じ|かん|ご》に $(100-${d}x)$ %。${lim} % より《少|すく》なくなるのは □ のとき`, a: `$${ans}$`,
            easy: `$${orig}$ より $-${d}x<${lim - 100}$`, easyCheck: false, verify: () => ineqOK(orig, ans) };
        }
        if (kk === 1) {
          const T0 = r.int(20, 30), k = r.int(1, 3), lim = T0 - 6 * k;
          const orig = `${T0}-6x\\leqq${lim}`, ans = `x\\geqq${k}`;
          return { q: `《高|たか》さ $x$ km の《気温|き|おん》は $(${T0}-6x)$ ℃。${lim} ℃ 《以下|い|か》になるのは □ のとき`, a: `$${ans}$`,
            easy: `$-6x\\leqq${lim - T0}$ を $-6$ でわる`, easyCheck: false, verify: () => ineqOK(orig, ans) };
        }
        const T0 = r.pick([80, 90]), c = r.pick([2, 4, 5]), lim = r.pick([20, 30, 40]), k = (T0 - lim) / c;
        const orig = `${T0}-${c}x<${lim}`, ans = `x>${fmt(k)}`;
        return { q: `お《湯|ゆ》の《温度|おん|ど》は、$x$ 《分後|ふん|ご》に $(${T0}-${c}x)$ ℃。${lim} ℃ より《低|ひく》くなるのは □ のとき`, a: `$${ans}$`,
          easy: `$-${c}x<${lim - T0}$ を $-${c}$ でわる`, easyCheck: false, verify: () => ineqOK(orig, ans) };
      },
      // わな：マイナスの数をたす・ひくだけ／わる数は正（右辺がマイナスでも）。向きはそのまま
      trap(r) {
        const op = r.pick(['<', '>', '\\leqq', '\\geqq']);
        if (r.chance(0.5)) {
          const b = r.int(3, 9), c = r.int(-6, b - 1), orig = `x+${b}${op}${c}`, ans = `x${op}${c - b}`;
          return { q: iq(orig), a: `$${ans}$`, easyCheck: false, easy: `（${b} をひくだけ。マイナスでわっていないので、《向|む》きはそのまま）`, verify: () => ineqOK(orig, ans) };
        }
        const a = r.int(2, 5), k = -r.int(1, 5), orig = `${a}x${op}${a * k}`, ans = `x${op}${k}`;
        return { q: iq(orig), a: `$${ans}$`, easyCheck: false, easy: `（《右辺|う|へん》はマイナスでも、わる《数|かず》 ${a} は《正|せい》。《向|む》きはそのまま）`, verify: () => ineqOK(orig, ans) };
      },
    },
  });

  // ================================================================ 3-91
  // 比例式 a:b=c:d（どれか1つが x）が成り立つか
  const ratioOK = (t, x) => { const [l, rr] = t.split('='), [a, b] = l.split(':'), [c, d] = rr.split(':'); const v = s => M.evalMath(s, { x }); return close(v(a) / v(b), v(c) / v(d)) || `${t} が x=${x} で成り立たない`; };
  M.add({
    id: '3-91', part: 1, chap: '3-3⑥', stars: 1,
    title: '《比例式|ひ|れい|しき》は《比|ひ》の《値|あたい》で',
    mark: '$x:9=4:6$ のような**《比例式|ひ|れい|しき》**（《比|ひ》が《等|ひと》しい《式|しき》）。',
    futsu: ['《比|ひ》をかんたんにしてから、', '《何|なん》《倍|ばい》になっているかをさがす。'],
    raku: ['$x:9=4:6$', '《比|ひ》の《値|あたい》で $\\frac{x}{9}=\\frac{4}{6}=\\frac{2}{3}$', '$x=\\frac{2}{3}\\times9=6$'],
    why: '《比|ひ》が《等|ひと》しければ、《比|ひ》の《値|あたい》（《前|まえ》÷《後|うし》ろ）も《等|ひと》しい。《分数|ぶん|すう》にすると、かけ《算|ざん》1つで $x$ が《出|で》る（3-3⑥）。',
    caution: '2つの《比|ひ》で、《前|まえ》と《後|うし》ろの《順|じゅん》をそろえる。$x:9=6:4$ とはちがう。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    fits(q) { return maths(q).some(t => /^[a-z0-9.]+:[a-z0-9.]+=[a-z0-9.]+:[a-z0-9.]+$/.test(t)); },
    steps: {
      // x:b=c:d
      s1(r) {
        const c = r.int(2, 9), d = r.intNot(2, 9, v => v === c), b = d * r.int(1, 4) / gcd(d, c), x = b * c / d;
        if (!Number.isInteger(b) || !Number.isInteger(x) || b === x || b === d) return null;
        const t = `x:${b}=${c}:${d}`;
        return { q: `$${t}$ ${W.toki}、$x=□$`, a: `$${x}$`, easy: `$\\frac{x}{${b}}=\\frac{${c}}{${d}}$ より $x=\\frac{${c}}{${d}}\\times${b}=${x}$`, easyCheck: false, verify: () => ratioOK(t, x) };
      },
      // x がほかの場所にある
      s2(r) {
        const g = r.int(2, 4), [p, q] = r.pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [1, 3], [3, 2], [5, 2], [4, 3]]);
        const m = r.int(2, 4), A = p * g, B = q * g, C = p * m, D = q * m;       // A:B=C:D
        if (A === C) return null;
        const pos = r.int(1, 3), arr = [A, B, C, D], x = arr[pos];
        const t = arr.map((v, i) => (i === pos ? 'x' : v)).join(':').replace(/^(\w+):(\w+):/, '$1:$2=');
        return { q: `$${t}$ ${W.toki}、$x=□$`, a: `$${x}$`, easy: `《比|ひ》の《値|あたい》 $\\frac{${p}}{${q}}$ がどちらも《同|おな》じ`, easyCheck: false, verify: () => ratioOK(t, x) };
      },
      // 場面：ばね・しお水・地図・かげ
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const n = r.int(2, 4), d = r.int(2, 3) * n, m = r.int(n + 1, 8), y = d * m / n;
          return { q: `ばねは、おもり ${n}《個|こ》で ${d} cm のびる。${m}《個|こ》では □ cm のびる`, a: `$${y}$`, easy: `$${d}:${n}=y:${m}$ より $y=\\frac{${d}}{${n}}\\times${m}=${y}$`, easyCheck: false, verify: () => ratioOK(`${d}:${n}=x:${m}`, y) };
        }
        if (k === 1) {
          const s = r.int(1, 4), w = r.pick([50, 100]), W2 = w * r.int(2, 6), y = s * W2 / w;
          return { q: `しお ${s} g に《水|みず》 ${w} mL の《割合|わり|あい》でまぜる。《水|みず》 ${W2} mL なら、しおは □ g`, a: `$${y}$`, easy: `$${s}:${w}=y:${W2}$ より $y=${y}$`, easyCheck: false, verify: () => ratioOK(`${s}:${w}=x:${W2}`, y) };
        }
        if (k === 2) {
          const c = r.pick([1, 2, 4]), m = r.pick([250, 500, 1000]), c2 = r.int(c + 1, 9), y = m * c2 / c;
          if (!Number.isInteger(y)) return null;
          return { q: `《地図|ち|ず》の ${c} cm が《実際|じっ|さい》の ${m} m。《地図|ち|ず》の ${c2} cm は、《実際|じっ|さい》は □ m`, a: `$${y}$`, easy: `$${m}:${c}=y:${c2}$ より $y=${y}$`, easyCheck: false, verify: () => ratioOK(`${m}:${c}=x:${c2}`, y) };
        }
        const h = r.pick([1, 1.5, 2]), s = r.pick([2, 3, 4]), S = s * r.int(2, 6), y = +(h * S / s).toFixed(6);
        return { q: `《高|たか》さ ${h} m の《棒|ぼう》のかげが ${s} m のとき、かげが ${S} m の《木|き》の《高|たか》さは □ m`, a: `$${fmt(y)}$`, easy: `$${h}:${s}=y:${S}$ より $y=${fmt(y)}$`, easyCheck: false, verify: () => ratioOK(`${h}:${s}=x:${S}`, y) };
      },
      // わな：反比例（人数と日数・速さと時間。積が一定）。比例式はそのまま使えない
      trap(r) {
        if (r.chance(0.5)) {
          // 1人・2人（ひとり・ふたり）は使わない。日数は読みが変わるので時間にする（J-3）
          const n1 = r.pick([3, 4, 6]), d1 = r.pick([4, 6, 8, 12]), n2 = r.intNot(3, 8, v => v === n1 || (n1 * d1) % v !== 0), d2 = n1 * d1 / n2;
          return { q: `ある《仕事|し|ごと》を ${n1}《人|にん》ですると ${d1} 《時間|じ|かん》かかる。${n2}《人|にん》ですると □ 《時間|じ|かん》かかる`, a: `$${d2}$`, easyCheck: false,
            easy: `（《人数|にん|ずう》と《時間|じ|かん》は《反比例|はん|ぴ|れい》。《積|せき》が《一定|いっ|てい》：$${n1}\\times${d1}\\div${n2}=${d2}$。わざ 3-26）`, verify: () => n1 * d1 === n2 * d2 || 'まちがい' };
        }
        const L = r.pick([1200, 1800, 2400]), v1 = r.pick([40, 60, 80].filter(v => L % v === 0)), v2 = r.intNot(4, 12, v => v * 10 === v1 || L % (v * 10) !== 0) * 10, t2 = L / v2;
        return { q: `${L} m を《分速|ふん|そく》 ${v1} m で《行|い》くと ${fun(L / v1)}かかる。《分速|ふん|そく》 ${v2} m では □《分|ふん》かかる`, a: `$${t2}$`, easyCheck: false,
          easy: `（《速|はや》いほど《時間|じ|かん》は《短|みじか》い《反比例|はん|ぴ|れい》。$${L}\\div${v2}=${t2}$。わざ 3-26）`, verify: () => v2 * t2 === L || 'まちがい' };
      },
    },
  });
})(globalThis.MONDAI);
