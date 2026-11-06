/* 問題集 第1巻　第2部 はかる（わざ 1-26〜1-32）　組 e
 * 書き方は v1/README.md。文は第1巻の教科書（1-8〜1-11）と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。
 * 単位つきの答えは式の値で確かめられないので、どの問題にも verify を書く（いちばん小さい単位に なおして くらべる）。 */
(function (M) {
  'use strict';
  const P = '＋', S = '－', E = '＝';

  // ---------------------------------------------------------------- 見わけよう（fits）の 部品
  // fits(q)：ほかの わざの 問題でも、 この わざが つかえるか（q は ルビを とった 問題の 文。 README 2章）
  // 「3 m 60 cm － 70 cm ＝ □ m □ cm」を 量（大きい 単位 b・小さい 単位 s）と 記号に わける。
  // ＝ の 左が 2つの 単位の 量だけで できて いなければ null
  function qty(q, big, small) {
    const [L, R] = q.split(' ＝ ');
    if (R == null) return null;
    const re = new RegExp('^(?:(\\d+) ' + big + ')?(?: ?(\\d+) ' + small + ')?$');
    const t = [], ops = [];
    for (const tok of L.split(/ ([＋－]) /)) {
      if (tok === P || tok === S) { ops.push(tok); continue; }
      const m = tok.match(re);
      if (!m || (m[1] == null && m[2] == null)) return null;
      t.push({ big: m[1] != null, s: +(m[2] || 0) });
    }
    return { t, ops, askBig: R.includes('□ ' + big) };
  }
  // くり上がり・くり下がり・単位の なおしが いるか（base：小さい 単位が いくつで 大きい 単位 1つか）
  function regroup(x, base) {
    if (!x) return false;
    const { t, ops, askBig } = x, big = t.some(v => v.big);
    if (t.length === 1) return askBig ? t[0].s >= base : big;
    if (t.length !== 2) return false;
    if (ops[0] === P) return t[0].s + t[1].s >= base || (!askBig && big);
    return t[0].s < t[1].s || (!askBig && big);
  }

  // ---------------------------------------------------------------- 文の部品
  // 「分」の読み：一の位が 2・5・7・9 なら ふん、ほかは ぷん（教科書 1-10 と同じ）
  const fun = n => `${n}《分|${[2, 5, 7, 9].includes(n % 10) ? 'ふん' : 'ぷん'}》`;
  const ji = n => `${n}《時|じ》`;
  const jikan = n => `${n}《時間|じ|かん》`;
  const byou = n => `${n}《秒|びょう》`;
  const BOX_JIFUN = '□《時|じ》 □《分|ふん》';
  const BOX_JIKAN = '□《時間|じ|かん》 □《分|ふん》';
  const tsu = n => (n < 10 ? `${n}つ` : `${n}`);   // 「5つ」「10」

  // ---------------------------------------------------------------- 検算の部品
  // 単位の表（いちばん小さい単位を 1 に する）
  const U_LEN = { mm: 1, cm: 10, m: 1000 };
  const U_KASA = { mL: 1, dL: 100, L: 1000 };
  const U_OMO = { g: 1, kg: 1000 };
  const U_JI = { '時間': 60, '時': 60, '分': 1 };
  const U_BYOU = { '分': 60, '秒': 1 };
  const RE_UNIT = /(\d+)\s*(mm|mL|cm|dL|kg|m|L|g|時間|時|分|秒|℃)/g;
  // 「3 cm 4 mm」→ 34。単位のついた数だけで できて いなければ null
  function amt(s, U) {
    const t = M.plain(String(s));
    let v = 0, n = 0;
    const rest = t.replace(RE_UNIT, (_, d, u) => { if (U[u] == null) { n = -1e9; return '#'; } v += (+d) * U[u]; n++; return ''; });
    if (n <= 0 || rest.trim() !== '') return null;
    return v;
  }
  // 「3 cm 4 mm ＋ 2 cm 8 mm」→ 62。読めなければ null
  function amtExpr(s, U) {
    let total = 0, sign = 1, any = false;
    for (const tok of M.plain(String(s)).split(/\s*([＋－])\s*/)) {
      if (tok === '＋') sign = 1;
      else if (tok === '－') sign = -1;
      else if (tok.trim()) { const v = amt(tok, U); if (v == null) return null; total += sign * v; any = true; }
    }
    return any ? total : null;
  }
  // 確かめ：答えの量が want と同じ。問題の左がわ・楽な形が 量の式なら、その値も同じ。小さい単位が くり上がって いない
  function vf(p, U, want, small) {
    return function () {
      const A = amt(p.a, U);
      if (A == null) return `答え「${M.plain(p.a)}」が 読めない`;
      if (A !== want) return `答え ${A} が ${want} と ちがう`;
      const L = amtExpr(M.plain(p.q).split('＝')[0], U);
      if (L != null && L !== A) return `問題の式の値 ${L} が 答え ${A} と ちがう`;
      for (const part of M.plain(p.easy || '').split('＝')) {
        const e = amtExpr(part, U);
        if (e != null && e !== A) return `楽な形「${part.trim()}」の値 ${e} が 答え ${A} と ちがう`;
        const x = M.evalExpr(part);
        if (x && p.num != null && !M.sameVal(x, [p.num, 1])) return `楽な形「${part.trim()}」の値が ${p.num} と ちがう`;
      }
      if (small) {
        // 答えの 小さい単位は、くり上がりの 数より 小さい（例：mm は 10 より 小さい）
        const re = new RegExp('(\\d+)\\s*' + small[0] + '(?![a-zA-Z間])');
        const m = M.plain(p.a).match(re);
        if (m && +m[1] >= small[1]) return `答えの ${small[0]} が ${small[1]} を こえて いる`;
      }
      return true;
    };
  }
  function done(p, U, want, small) { p.verify = vf(p, U, want, small); return p; }

  // ================================================================ 1-26
  M.add({
    id: '1-26', part: 2, chap: '1-8', stars: 1,
    title: 'たんいを そろえる（cm と mm）',
    mark: 'cm と mm が まじる。 mm どうしを たして **10 mm を こえたら** 1 cm に する。',
    futsu: ['3 cm 4 mm ＋ 2 cm 8 mm を、', 'ものさしに ならべて', '1 mm ずつ かぞえる。'],
    raku: ['cm どうし 3 ＋ 2、 mm どうし 4 ＋ 8', '→ 5 cm 12 mm', '12 mm ＝ 1 cm 2 mm だから', '→ 6 cm 2 mm'],
    why: '1 cm ＝ 10 mm。 10 あつまると 1つ 《上|うえ》の たんいに くり《上|あ》がるのは、 たし《算|ざん》の ひっ《算|さん》と おなじ（1-8）。',
    caution: 'mm が 10に ならない ときは、 くり《上|あ》げない。 cm の 《数|かず》と mm の 《数|かず》を たさない。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '12mm',
    // cm と mm で、 mm が 10を こえる・ひけない・mm を cm に なおす
    fits(q) { return regroup(qty(q, 'cm', 'mm'), 10); },
    steps: {
      // mm どうしで 10を こえる たし算
      s1(r) {
        const a = r.int(1, 8), c = r.int(1, 8), b = r.int(2, 9), d = r.int(2, 9);
        if (b + d <= 10) return null;
        const p = { q: `${a} cm ${b} mm ${P} ${c} cm ${d} mm ${E} □ cm □ mm`, a: `${a + c + 1} cm ${b + d - 10} mm`,
          easy: `${a + c} cm ${b + d} mm` };
        return done(p, U_LEN, (a + c) * 10 + b + d, ['mm', 10]);
      },
      // ひき算：mm が ひけないので、1 cm を 10 mm に もどす
      s2(r) {
        const a = r.int(3, 9), c = r.int(1, a - 2), b = r.int(0, 7), d = r.int(b + 1, 9);
        const left = b ? `${a} cm ${b} mm` : `${a} cm`;
        const A = a - 1 - c, B = 10 + b - d;
        const p = { q: `${left} ${S} ${c} cm ${d} mm ${E} □ cm □ mm`, a: `${A} cm ${B} mm`,
          easy: `${a - 1} cm ${10 + b} mm から` };
        return done(p, U_LEN, a * 10 + b - c * 10 - d, ['mm', 10]);
      },
      s3(r) {
        const k = r.int(1, 4);
        if (k === 1) { // mm を cm と mm に
          const n = r.intNot(21, 99, v => v % 10 === 0);
          const p = { q: `${n} mm ${E} □ cm □ mm`, a: `${Math.floor(n / 10)} cm ${n % 10} mm`, easy: `${10 * Math.floor(n / 10)} mm ${P} ${n % 10} mm` };
          return done(p, U_LEN, n, ['mm', 10]);
        }
        if (k === 2) { // mm どうしで 1 cm を こえる
          const x = r.int(4, 9), y = r.int(11 - x, 9);
          const p = { q: `${x} mm ${P} ${y} mm ${E} □ cm □ mm`, a: `1 cm ${x + y - 10} mm`, easy: `${x + y} mm` };
          return done(p, U_LEN, x + y, ['mm', 10]);
        }
        if (k === 3) { // mm どうしの 2けたの たし算
          const x = r.int(12, 59), y = r.int(12, 59);
          if (x % 10 + y % 10 <= 10 || x + y >= 100) return null;
          const p = { q: `${x} mm ${P} ${y} mm ${E} □ cm □ mm`, a: `${Math.floor((x + y) / 10)} cm ${(x + y) % 10} mm`, easy: `${x + y} mm` };
          return done(p, U_LEN, x + y, ['mm', 10]);
        }
        // くり上がりが あって、 2けたの cm
        const a = r.int(10, 30), c = r.int(2, 9), b = r.int(5, 9), d = r.int(11 - b, 9);
        const p = { q: `${a} cm ${b} mm ${P} ${c} cm ${d} mm ${E} □ cm □ mm`, a: `${a + c + 1} cm ${b + d - 10} mm`,
          easy: `${a + c} cm ${b + d} mm` };
        return done(p, U_LEN, (a + c) * 10 + b + d, ['mm', 10]);
      },
      trap(r) {
        if (r.chance(0.5)) { // mm が 10に ならない
          const a = r.int(1, 5), c = r.int(1, 9 - a), b = r.int(1, 7), d = r.int(1, 8 - b);
          const p = { q: `${a} cm ${b} mm ${P} ${c} cm ${d} mm ${E} □ cm □ mm`, a: `${a + c} cm ${b + d} mm`, easy: '（そのまま たす）' };
          return done(p, U_LEN, (a + c) * 10 + b + d, ['mm', 10]);
        }
        // cm と mm の 数を たさない
        const a = r.int(2, 9), d = r.int(2, 9);
        const p = { q: `${a} cm ${P} ${d} mm ${E} □ cm □ mm`, a: `${a} cm ${d} mm`, easy: '（たんいが べつ）' };
        return done(p, U_LEN, a * 10 + d, ['mm', 10]);
      },
    },
  });

  // ================================================================ 1-27
  M.add({
    id: '1-27', part: 2, chap: '1-8', stars: 1,
    title: 'm と cm',
    mark: 'm と cm が まじって、 cm が ひけない。 **1 m を 100 cm に** して から けいさんする。',
    futsu: ['1 m 20 cm － 45 cm で、', '20 から 45 は ひけない。', 'どこから かりるか まよう。'],
    raku: ['1 m 20 cm ＝ 120 cm', '120 cm － 45 cm ＝ 75 cm'],
    why: '1 m ＝ 100 cm。 ぜんぶ cm に すると、 いつもの ひき《算|ざん》に なる（1-8）。',
    caution: 'cm だけで ひける ときは、 m は そのまま のこして よい。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // m と cm で、 cm が 100を こえる・ひけない・なおす（1 m の テープから きる も）
    fits(q) {
      if (/^1 m の テープから \d+ cm きると/.test(q)) return true;
      return regroup(qty(q, 'm', 'cm'), 100);
    },
    steps: {
      // m と cm を cm に（と、 その ぎゃく）
      s1(r) {
        const m = r.int(1, 4), c = r.chance(0.3) ? r.int(1, 9) : r.int(1, 19) * 5;
        if (r.chance(0.6)) {
          const p = { q: `${m} m ${c} cm ${E} □ cm`, a: `${100 * m + c} cm`, easy: `${100 * m} cm ${P} ${c} cm` };
          return done(p, U_LEN, (100 * m + c) * 10);
        }
        const p = { q: `${100 * m + c} cm ${E} □ m □ cm`, a: `${m} m ${c} cm`, easy: `${100 * m} cm ${P} ${c} cm` };
        return done(p, U_LEN, (100 * m + c) * 10, ['cm', 100]);
      },
      // cm が ひけない ひき算
      s2(r) {
        const m = r.chance(0.6) ? 1 : r.int(2, 3);
        const b = r.int(0, 15) * 5, c = r.int(b / 5 + 1, 19) * 5;
        const left = b ? `${m} m ${b} cm` : `${m} m`;
        const tot = 100 * m + b - c;
        if (m === 1) {
          const p = { q: `${left} ${S} ${c} cm ${E} □ cm`, a: `${tot} cm`, easy: `${100 + b} cm ${S} ${c} cm` };
          return done(p, U_LEN, tot * 10);
        }
        const p = { q: `${left} ${S} ${c} cm ${E} □ m □ cm`, a: `${m - 1} m ${tot - 100 * (m - 1)} cm`, easy: `${100 * m + b} cm ${S} ${c} cm` };
        return done(p, U_LEN, tot * 10, ['cm', 100]);
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // cm どうしで 1 m を こえる
          const x = r.int(7, 19) * 5, y = r.int(Math.max(7, 21 - x / 5), 19) * 5;
          const p = { q: `${x} cm ${P} ${y} cm ${E} □ m □ cm`, a: `1 m ${x + y - 100} cm`, easy: `${x + y} cm` };
          return done(p, U_LEN, (x + y) * 10, ['cm', 100]);
        }
        if (k === 2) { // ことばの もんだい
          const c = r.int(1, 19) * 5;
          const p = { q: `1 m の テープから ${c} cm きると のこりは □ cm`, a: `${100 - c} cm`, easy: `100 cm ${S} ${c} cm` };
          return done(p, U_LEN, (100 - c) * 10);
        }
        const m = r.int(2, 4), c = r.int(1, 19) * 5;
        const p = { q: `${m} m ${S} ${c} cm ${E} □ m □ cm`, a: `${m - 1} m ${100 - c} cm`, easy: `${100 * m} cm ${S} ${c} cm` };
        return done(p, U_LEN, (100 * m - c) * 10, ['cm', 100]);
      },
      trap(r) {
        const m = r.int(1, 3);
        if (r.chance(0.5)) { // cm だけで ひける
          const b = r.int(6, 19) * 5, c = r.int(1, b / 5 - 1) * 5;
          const p = { q: `${m} m ${b} cm ${S} ${c} cm ${E} □ m □ cm`, a: `${m} m ${b - c} cm`, easy: '（cm で ひける）' };
          return done(p, U_LEN, (100 * m + b - c) * 10, ['cm', 100]);
        }
        const c = r.int(2, 19) * 5;
        const p = { q: `${m} m ${P} ${c} cm ${E} □ m □ cm`, a: `${m} m ${c} cm`, easy: '（たんいが べつ）' };
        return done(p, U_LEN, (100 * m + c) * 10, ['cm', 100]);
      },
    },
  });

  // ================================================================ 1-28
  M.add({
    id: '1-28', part: 2, chap: '1-9', stars: 1,
    title: 'かさの たんい（L・dL・mL）',
    mark: 'L と dL が まじる。 **1 L ＝ 10 dL** で、 dL に そろえて から けいさんする。',
    futsu: ['1 L 2 dL ＋ 9 dL で、', 'dL が 11に なって、', '「1 L 11 dL」？ と まよう。'],
    raku: ['1 L 2 dL ＝ 12 dL', '12 dL ＋ 9 dL ＝ 21 dL', '21 dL ＝ 2 L 1 dL'],
    why: '1 L ＝ 10 dL ＝ 1000 mL。 《小|ちい》さい たんいに そろえると、 いつもの たし《算|ざん》・ひき《算|ざん》に なる（1-9）。',
    caution: 'dL が 10に ならない ときは、 そのまま。 1 dL は 10 mL では なく 100 mL。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // L・dL・mL で、 くり上がる・ひけない・なおす
    fits(q) { return regroup(qty(q, 'L', 'dL'), 10) || regroup(qty(q, 'L', 'mL'), 1000) || regroup(qty(q, 'dL', 'mL'), 100); },
    steps: {
      s1(r) {
        const a = r.int(1, 3), b = r.int(1, 9), c = r.int(2, 9);
        if (b + c <= 10) return null;
        const p = { q: `${a} L ${b} dL ${P} ${c} dL ${E} □ L □ dL`, a: `${a + 1} L ${b + c - 10} dL`,
          easy: `${10 * a + b} dL ${P} ${c} dL` };
        return done(p, U_KASA, (10 * a + b + c) * 100, ['dL', 10]);
      },
      s2(r) {
        const a = r.chance(0.6) ? 1 : r.int(2, 3), b = r.int(0, 7), c = r.int(b + 1, 9);
        const left = b ? `${a} L ${b} dL` : `${a} L`;
        const tot = 10 * a + b - c;
        if (a === 1) {
          const p = { q: `${left} ${S} ${c} dL ${E} □ dL`, a: `${tot} dL`, easy: `${10 + b} dL ${S} ${c} dL` };
          return done(p, U_KASA, tot * 100);
        }
        const p = { q: `${left} ${S} ${c} dL ${E} □ L □ dL`, a: `${a - 1} L ${tot - 10 * (a - 1)} dL`, easy: `${10 * a + b} dL ${S} ${c} dL` };
        return done(p, U_KASA, tot * 100, ['dL', 10]);
      },
      s3(r) {
        const k = r.int(1, 4);
        if (k === 1) { // L と mL を mL に
          const a = r.int(1, 3), x = r.pick([50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 900]);
          const p = { q: `${a} L ${x} mL ${E} □ mL`, a: `${1000 * a + x} mL`, easy: `${1000 * a} mL ${P} ${x} mL` };
          return done(p, U_KASA, 1000 * a + x);
        }
        if (k === 2) { // mL どうしで 1 L を こえる
          const x = r.int(3, 9) * 100, y = r.int(11 - x / 100, 9) * 100;
          const p = { q: `${x} mL ${P} ${y} mL ${E} □ L □ mL`, a: `1 L ${x + y - 1000} mL`, easy: `${x + y} mL` };
          return done(p, U_KASA, x + y, ['mL', 1000]);
        }
        if (k === 3) { // 1 L から ひく
          const x = r.int(1, 19) * 50;
          const p = { q: `1 L ${S} ${x} mL ${E} □ mL`, a: `${1000 - x} mL`, easy: `1000 mL ${S} ${x} mL` };
          return done(p, U_KASA, 1000 - x);
        }
        const d = r.int(1, 9); // dL を mL に
        const p = { q: `${d} dL ${E} □ mL`, a: `${100 * d} mL`, easy: `100 mL が ${d}こ` };
        return done(p, U_KASA, 100 * d);
      },
      trap(r) {
        const a = r.int(1, 3);
        if (r.chance(0.5)) {
          const b = r.int(1, 7), c = r.int(1, 8 - b);
          const p = { q: `${a} L ${b} dL ${P} ${c} dL ${E} □ L □ dL`, a: `${a} L ${b + c} dL`, easy: '（そのまま たす）' };
          return done(p, U_KASA, (10 * a + b + c) * 100, ['dL', 10]);
        }
        const c = r.int(2, 9);
        const p = { q: `${a} L ${P} ${c} dL ${E} □ L □ dL`, a: `${a} L ${c} dL`, easy: '（たんいが べつ）' };
        return done(p, U_KASA, (10 * a + c) * 100, ['dL', 10]);
      },
    },
  });

  // ================================================================ 1-29
  M.add({
    id: '1-29', part: 2, chap: '1-9', stars: 1,
    title: 'おもさの たんい（kg・g）',
    mark: 'kg と g が まじる。 **1 kg ＝ 1000 g** で、 g に そろえて から けいさんする。',
    futsu: ['1 kg 200 g ＋ 900 g で、', 'g が 1100に なって、', '「1 kg 1100 g」？ と まよう。'],
    raku: ['1 kg 200 g ＝ 1200 g', '1200 g ＋ 900 g ＝ 2100 g', '2100 g ＝ 2 kg 100 g'],
    why: '1 kg ＝ 1000 g。 g に そろえると、 いつもの たし《算|ざん》・ひき《算|ざん》に なる（1-9）。',
    caution: 'g が 1000に ならない ときは、 そのまま。 1 kg 50 g は 150 g では なく 1050 g。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '16mm',
    // kg と g で、 g が 1000を こえる・ひけない・なおす
    fits(q) {
      const m = q.match(/^\d+ kg (\d+) g に (\d+) g を たすと/);
      if (m) return +m[1] + +m[2] >= 1000;
      return regroup(qty(q, 'kg', 'g'), 1000);
    },
    steps: {
      s1(r) {
        const a = r.int(1, 3), b = r.int(1, 9) * 100, c = r.int(2, 9) * 100;
        if (b + c <= 1000) return null;
        const p = { q: `${a} kg ${b} g ${P} ${c} g ${E} □ kg □ g`, a: `${a + 1} kg ${b + c - 1000} g`,
          easy: `${1000 * a + b} g ${P} ${c} g` };
        return done(p, U_OMO, 1000 * a + b + c, ['g', 1000]);
      },
      s2(r) {
        const a = r.chance(0.6) ? 1 : r.int(2, 3), b = r.int(0, 7) * 100, c = r.int(b / 100 + 1, 9) * 100;
        const left = b ? `${a} kg ${b} g` : `${a} kg`;
        const tot = 1000 * a + b - c;
        if (a === 1) {
          const p = { q: `${left} ${S} ${c} g ${E} □ g`, a: `${tot} g`, easy: `${1000 + b} g ${S} ${c} g` };
          return done(p, U_OMO, tot);
        }
        const p = { q: `${left} ${S} ${c} g ${E} □ kg □ g`, a: `${a - 1} kg ${tot - 1000 * (a - 1)} g`, easy: `${1000 * a + b} g ${S} ${c} g` };
        return done(p, U_OMO, tot, ['g', 1000]);
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // kg と g を g に（0が はいる ところに 気を つける）
          const a = r.int(1, 4), x = r.pick([5, 8, 20, 50, 60, 80, 300, 450, 700]);
          const p = { q: `${a} kg ${x} g ${E} □ g`, a: `${1000 * a + x} g`, easy: `${1000 * a} g ${P} ${x} g` };
          return done(p, U_OMO, 1000 * a + x);
        }
        if (k === 2) { // g を kg と g に
          const a = r.int(1, 3), x = r.int(1, 19) * 50;
          const p = { q: `${1000 * a + x} g ${E} □ kg □ g`, a: `${a} kg ${x} g`, easy: `${1000 * a} g ${P} ${x} g` };
          return done(p, U_OMO, 1000 * a + x, ['g', 1000]);
        }
        const a = r.int(1, 3), b = r.int(1, 9) * 100, c = r.int(2, 9) * 100;
        if (b + c <= 1000) return null;
        const p = { q: `${a} kg ${b} g に ${c} g を たすと □ kg □ g`,
          a: `${a + 1} kg ${b + c - 1000} g`, easy: `${1000 * a + b} g ${P} ${c} g` };
        return done(p, U_OMO, 1000 * a + b + c, ['g', 1000]);
      },
      trap(r) {
        const a = r.int(1, 3);
        if (r.chance(0.5)) {
          const b = r.int(1, 7) * 100, c = r.int(1, 8 - b / 100) * 100;
          const p = { q: `${a} kg ${b} g ${P} ${c} g ${E} □ kg □ g`, a: `${a} kg ${b + c} g`, easy: '（そのまま たす）' };
          return done(p, U_OMO, 1000 * a + b + c, ['g', 1000]);
        }
        const c = r.pick([100, 200, 300, 400, 500, 600, 700, 800, 900]);
        const p = { q: `${a} kg ${P} ${c} g ${E} □ kg □ g`, a: `${a} kg ${c} g`, easy: '（たんいが べつ）' };
        return done(p, U_OMO, 1000 * a + c, ['g', 1000]);
      },
    },
  });

  // ================================================================ 1-30
  M.add({
    id: '1-30', part: 2, chap: '1-10', stars: 1,
    title: 'ちょうどの 《時|じ》こくまで おぎなう',
    mark: '《分|ふん》を たすと **60を こえる**。 まず、 ちょうどの 《時|じ》こくまで あと なん《分|ぷん》かを 《見|み》る。',
    futsu: ['7《時|じ》45《分|ふん》の 30《分|ぷん》 あと。', '45 ＋ 30 ＝ 75 で', '「7《時|じ》75《分|ふん》」？ と まよう。'],
    raku: ['8《時|じ》まで あと 15《分|ふん》（60 － 45）', '30《分|ぷん》を 15《分|ふん》と 15《分|ふん》に わける', '8《時|じ》から 15《分|ふん》で 8《時|じ》15《分|ふん》'],
    why: '10を つくって たす（わざ 1-02）と おなじ。 《時計|と|けい》では、 10の かわりに 60で ひとまとまり（1-10）。',
    caution: '《分|ふん》を たしても 60に ならない ときは、 そのまま たす。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '12mm',
    // 時こくに 分を たすと 60を こえる・ちょうどの 時こくを またぐ
    fits(q) {
      let m = q.match(/^\d+時(\d+)分の (\d+)分 あとは、/);
      if (m) return +m[1] + +m[2] >= 60;
      m = q.match(/^\d+時(\d+)分の (\d+)分 前は、/);
      if (m) return +m[1] < +m[2];
      m = q.match(/^(\d+)時\d+分から (\d+)時\d+分までは、/);
      if (m) return +m[2] > +m[1];
      m = q.match(/^□時 □分の (\d+)分 あとが \d+時(\d+)分$/);
      return !!m && +m[2] < +m[1];
    },
    steps: {
      s1(r) {
        const h = r.int(1, 10), m = r.int(7, 11) * 5, d = r.int(2, 11) * 5;
        if (m + d <= 60) return null;
        const k = 60 - m;
        const p = { q: `${ji(h)}${fun(m)}の ${fun(d)} あとは、 ${BOX_JIFUN}`, a: `${ji(h + 1)} ${fun(m + d - 60)}`,
          easy: `${ji(h + 1)} ${P} ${fun(d - k)}` };
        return done(p, U_JI, h * 60 + m + d, ['分', 60]);
      },
      // ちょうどの 時こくを またぐ 時間
      s2(r) {
        const h = r.int(1, 10), m = r.int(7, 11) * 5, n = r.int(1, 11) * 5;
        const k = 60 - m;
        if (k + n >= 60) return null;
        const p = { q: `${ji(h)}${fun(m)}から ${ji(h + 1)}${fun(n)}までは、 □《分|ふん》`, a: fun(k + n),
          easy: `${k} ${P} ${n}`, num: k + n };
        return done(p, U_JI, k + n);
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // まえに もどる
          const h = r.int(2, 11), m = r.int(1, 6) * 5, d = r.int(m / 5 + 1, 11) * 5;
          const p = { q: `${ji(h)}${fun(m)}の ${fun(d)} 《前|まえ》は、 ${BOX_JIFUN}`, a: `${ji(h - 1)} ${fun(60 - (d - m))}`,
            easy: `${ji(h)} ${S} ${fun(d - m)}` };
          return done(p, U_JI, h * 60 + m - d, ['分', 60]);
        }
        if (k === 2) { // □を もとめる：□時□分の d分 あとが H時M分
          const H = r.int(2, 11), m2 = r.int(1, 6) * 5, d = r.int(m2 / 5 + 1, 11) * 5;
          const p = { q: `${BOX_JIFUN}の ${fun(d)} あとが ${ji(H)}${fun(m2)}`, a: `${ji(H - 1)} ${fun(60 - (d - m2))}`,
            easy: `${ji(H)} ${S} ${fun(d - m2)}` };
          return done(p, U_JI, H * 60 + m2 - d, ['分', 60]);
        }
        // 5とびで ない 分
        const h = r.int(1, 10), m = r.intNot(41, 58, v => v % 5 === 0), d = r.int(4, 9) * 5;
        if (m + d <= 60) return null;
        const p = { q: `${ji(h)}${fun(m)}の ${fun(d)} あとは、 ${BOX_JIFUN}`, a: `${ji(h + 1)} ${fun(m + d - 60)}`,
          easy: `${ji(h + 1)} ${P} ${fun(d - (60 - m))}` };
        return done(p, U_JI, h * 60 + m + d, ['分', 60]);
      },
      trap(r) {
        const h = r.int(1, 10), m = r.int(1, 7) * 5, d = r.int(1, 11 - m / 5) * 5;
        const p = { q: `${ji(h)}${fun(m)}の ${fun(d)} あとは、 ${BOX_JIFUN}`, a: `${ji(h)} ${fun(m + d)}`, easy: '（そのまま たす）' };
        return done(p, U_JI, h * 60 + m + d, ['分', 60]);
      },
    },
  });

  // ================================================================ 1-31
  M.add({
    id: '1-31', part: 2, chap: '1-10', stars: 1,
    title: '60《分|ぷん》で くり《上|あ》がる',
    mark: '《時間|じ|かん》を たす。 《分|ふん》が **60を こえたら**、 60《分|ぷん》を 1《時間|じ|かん》に する。',
    futsu: ['ぜんぶ 《分|ふん》に なおす。', '60 ＋ 40 ＋ 35 ＝ 135《分|ふん》。', 'それを また なおす。'],
    raku: ['1《時間|じ|かん》40《分|ぷん》 ＋ 35《分|ふん》', '→ 1《時間|じ|かん》75《分|ふん》', '75《分|ふん》 ＝ 1《時間|じ|かん》15《分|ふん》', '→ 2《時間|じ|かん》15《分|ふん》'],
    why: '10で くり《上|あ》がる ひっ《算|さん》と おなじ。 《時間|じ|かん》は 60《分|ぷん》で 1つ 《上|うえ》に くり《上|あ》がる（1-10）。',
    caution: '《分|ふん》が 60に ならない ときは、 くり《上|あ》げない。 100《分|ぷん》で くり《上|あ》げない。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '12mm',
    // 時間の たし算・ひき算で 分が 60を こえる・ひけない／ 分を 時間に、 秒を 分に なおす
    fits(q) {
      let m = q.match(/^(?:\d+時間)?(\d+)分 ([＋－]) (?:\d+時間)?(\d+)分 ＝/);
      if (m) return m[2] === P ? +m[1] + +m[3] >= 60 : +m[1] < +m[3];
      if (/^\d+時間 － \d+分 ＝/.test(q)) return true;
      m = q.match(/^(\d+)(?:秒 ＝ □分 □秒|分 ＝ □時間 □分)$/);
      return !!m && +m[1] >= 60;
    },
    steps: {
      s1(r) {
        const a = r.int(1, 3), b = r.int(4, 11) * 5, c = r.int(3, 11) * 5;
        if (b + c <= 60) return null;
        const p = { q: `${jikan(a)}${fun(b)} ${P} ${fun(c)} ${E} ${BOX_JIKAN}`, a: `${jikan(a + 1)} ${fun(b + c - 60)}`,
          easy: `${jikan(a)}${fun(b + c)}` };
        return done(p, U_JI, a * 60 + b + c, ['分', 60]);
      },
      s2(r) {
        const a = r.int(1, 3), b = r.int(4, 11) * 5, c = r.int(1, 2), d = r.int(3, 11) * 5;
        if (b + d <= 60) return null;
        const p = { q: `${jikan(a)}${fun(b)} ${P} ${jikan(c)}${fun(d)} ${E} ${BOX_JIKAN}`, a: `${jikan(a + c + 1)} ${fun(b + d - 60)}`,
          easy: `${jikan(a + c)}${fun(b + d)}` };
        return done(p, U_JI, (a + c) * 60 + b + d, ['分', 60]);
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // 分を 時間と 分に
          const n = r.intNot(65, 175, v => v % 60 === 0 || v % 5 !== 0);
          const h = Math.floor(n / 60);
          const p = { q: `${fun(n)} ${E} ${BOX_JIKAN}`, a: `${jikan(h)} ${fun(n % 60)}`,
            easy: `${60 * h}《分|ぷん》 ${P} ${fun(n % 60)}` };
          return done(p, U_JI, n, ['分', 60]);
        }
        if (k === 2) { // 秒を 分と 秒に
          const n = r.int(61, 119);
          const p = { q: `${byou(n)} ${E} □《分|ふん》 □《秒|びょう》`, a: `1《分|ぷん》 ${byou(n - 60)}`, easy: `60《秒|びょう》 ${P} ${byou(n - 60)}` };
          return done(p, U_BYOU, n, ['秒', 60]);
        }
        // ひき算：1時間を 60分に もどす
        const a = r.int(2, 4), b = r.int(0, 6) * 5, c = r.int(b / 5 + 1, 11) * 5;
        const left = b ? `${jikan(a)}${fun(b)}` : jikan(a);
        const p = { q: `${left} ${S} ${fun(c)} ${E} ${BOX_JIKAN}`, a: `${jikan(a - 1)} ${fun(60 + b - c)}`,
          easy: `1《時間|じ|かん》を 60《分|ぷん》に` };
        return done(p, U_JI, a * 60 + b - c, ['分', 60]);
      },
      trap(r) {
        const a = r.int(1, 3), b = r.int(1, 7) * 5, c = r.int(1, 11 - b / 5) * 5;
        const p = { q: `${jikan(a)}${fun(b)} ${P} ${fun(c)} ${E} ${BOX_JIKAN}`, a: `${jikan(a)} ${fun(b + c)}`, easy: '（そのまま たす）' };
        return done(p, U_JI, a * 60 + b + c, ['分', 60]);
      },
    },
  });

  // ================================================================ 1-32
  // 目もりの 組：0から hi までが n こに 分かれて いて、 1目もりは step
  const STEPS32 = [[2, 5], [2, 10], [5, 2], [5, 4], [5, 10], [10, 2], [10, 5], [10, 10], [20, 5], [50, 2], [50, 10], [100, 5], [100, 10]];
  M.add({
    id: '1-32', part: 2, chap: '1-11', stars: 1,
    title: '1《目|め》もりを さきに 《出|だ》す',
    mark: '《目|め》もりを よむ。 まず 1《目|め》もりが **いくつか** を 《出|だ》して から かぞえる。',
    futsu: ['0の 《目|め》もりから、', '1つずつ たどって', 'ながい あいだ かぞえる。'],
    raku: ['0と 10の あいだが 5つ', '2ずつ 5かいで 10 → 1《目|め》もりは 2', '10から 2ずつ：12、 14'],
    why: '《目|め》もりの あいだは どこも おなじ。 1《目|め》もりが わかれば、 《近|ちか》くの 《数字|すう|じ》から その 《数|かず》ずつ かぞえれば よい（1-11）。',
    caution: '1《目|め》もりが 1の ときは、 そのまま かぞえる。 《線|せん》の 《数|かず》では なく、 あいだの 《数|かず》を かぞえる。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // 目もりの あいだの 数から 1目もりを 出す（1目もりが 1で ない）
    fits(q) {
      const m = q.match(/(\d+)と (\d+)の あいだが (\d+)/);
      if (m) return (+m[2] - +m[1]) / +m[3] !== 1;
      return /ますが \d+に 分かれて いる|^\d+に 分かれた |長い はりは 12の 数字で 60分/.test(q);
    },
    steps: {
      s1(r) {
        const [step, n] = r.pick(STEPS32), hi = step * n;
        const p = { q: `0と ${hi}の あいだが ${tsu(n)}。 1《目|め》もりは □`, a: String(step),
          easy: `${step}ずつ ${n}かい` };
        p.verify = () => (step * n === hi && +p.a === hi / n ? true : `1目もり ${p.a} が あわない`);
        return p;
      },
      // 数字の ある 目もりから かぞえる
      s2(r) {
        const [step, n] = r.pick(STEPS32.filter(x => x[1] >= 4 && x[0] * x[1] <= 500)), L = step * n;
        const j = r.int(0, 2), base = L * j, k = r.int(2, n - 1);
        const seq = []; for (let i = 1; i <= k; i++) seq.push(base + step * i);
        if (k > 5) return null;
        const p = { q: `0と ${L}の あいだが ${tsu(n)}。 ${base}の ${k}《目|め》もり 《先|さき》は □`,
          a: String(base + step * k), easy: `1《目|め》もり ${step}` };
        p.verify = () => (+p.a === seq[seq.length - 1] && seq[seq.length - 1] - base === k * (L / n) ? true : `${p.a} が かぞえた 数と あわない`);
        return p;
      },
      s3(r) {
        const k = r.int(1, 4);
        if (k === 1) { // 1 L ます
          const p = { q: '1 L ますが 10に 《分|わ》かれて いる。 1《目|め》もりは □ mL', a: '100 mL', easy: '10こで 1 L' };
          if (r.chance(0.5)) return done(p, U_KASA, 100);
          const t = r.int(2, 9);
          const p2 = { q: `1 L ますが 10に 《分|わ》かれて いる。 ${t}《目|め》もりは □ dL`, a: `${t} dL`, easy: `1《目|め》もり 1 dL` };
          return done(p2, U_KASA, 100 * t);
        }
        if (k === 2) { // 時計の 長い はり
          const t = r.int(2, 11);
          const p = { q: `《長|なが》い はりは 12の 《数字|すう|じ》で 60《分|ぷん》。 ${t}を さすと □《分|ふん》`,
            a: fun(5 * t), easy: `1つ 5《分|ふん》、 ${t}つ` };
          return done(p, U_JI, 5 * t);
        }
        if (k === 3) { // 温度計
          const step = r.pick([2, 5]), n = 10 / step, base = r.pick([10, 20]), t = r.int(1, n - 1);
          const p = { q: `10と 20の あいだが ${tsu(n)}。 ${base}の ${t}つ 《上|うえ》は □ ℃`,
            a: `${base + step * t} ℃`, easy: `1《目|め》もり ${step}` };
          p.verify = () => (amt(p.a, { '℃': 1 }) === base + (10 / n) * t ? true : '温度が あわない');
          return p;
        }
        // 1 m の ものさし
        const t = r.int(2, 9);
        const p = { q: `10に 《分|わ》かれた 1 m の ものさし。 ${t}《目|め》もりは □ cm`, a: `${10 * t} cm`, easy: `1《目|め》もり 10 cm` };
        return done(p, U_LEN, 100 * t);
      },
      trap(r) {
        if (r.chance(0.5)) { // 1目もりが 1
          const t = r.int(3, 9);
          const p = { q: `0と 10の あいだが 10。 ${t}《目|め》もりは □`, a: String(t), easy: '（1《目|め》もりは 1）' };
          p.verify = () => (+p.a === t ? true : `${p.a} が ${t} と ちがう`);
          return p;
        }
        // 線の 数と、 あいだの 数（線は 2・4・5・7・9本：「本」の 読みが ほん に なる 数）
        const [step, n] = r.pick([[10, 3], [2, 5], [10, 5], [20, 5], [5, 6], [5, 8], [2, 10], [10, 10]]), hi = step * n;
        const p = { q: `0と ${hi}の あいだに 《線|せん》が ${n - 1}《本|ほん》。 1《目|め》もりは □`, a: String(step),
          easy: `（あいだは ${tsu(n)}）` };
        p.verify = () => (+p.a === hi / n ? true : `1目もり ${p.a} が あわない`);
        return p;
      },
    },
  });
})(globalThis.MONDAI);
