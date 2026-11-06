/* 問題集 第1巻　第3部 かけ算（わざ 1-33〜1-48）　組 c
 * 書き方は v1/README.md。文は第1巻の教科書と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。 */
(function (M) {
  'use strict';
  const T = '×', E = '＝', P = '＋', S = '－';

  // ---------------------------------------------------------------- 見わけよう（fits）の 部品
  // fits(q)：ほかの わざの 問題でも、 この わざが つかえるか（q は ルビを とった 問題の 文。 README 2章）
  // 式だけの 問題（「a × b」「a × c ＋ b × c」）を 数と 記号に わける。 □・ことば・＝ が あれば null
  const expr = q => {
    if (!/^\d+(\.\d+)?( [＋－×÷] \d+(\.\d+)?)+$/.test(q)) return null;
    const t = q.split(' ');
    return { n: t.filter((_, i) => i % 2 === 0).map(Number), o: t.filter((_, i) => i % 2 === 1) };
  };
  // 「a × b」だけの 問題の [a, b]。 ちがえば null
  const mul2 = q => { const e = expr(q); return e && e.n.length === 2 && e.o[0] === T ? e.n : null; };
  // かけ算の 2つの かずの どちらかが f(x, もう 1つ) を みたす
  const either = (k, f) => !!k && (f(k[0], k[1]) || f(k[1], k[0]));
  // a を n こ たす しき（a ＋ a ＋ … ＋ a）
  const rep = (a, n) => Array(n).fill(String(a)).join(` ${P} `);
  const not10 = v => v % 10 === 0;

  // ---------------------------------------------------------------- 1-33
  M.add({
    id: '1-33', part: 3, chap: '1-12', stars: 1,
    title: '《同|おな》じ かずを たすなら かけ《算|ざん》',
    mark: '**おなじ かず** を なんども たして いる。 いくつ《分|ぶん》 あるかを かぞえる。',
    futsu: ['7 ＋ 7 ＝ 14、 14 ＋ 7 ＝ 21、', '21 ＋ 7 ＝ 28 と、', 'じゅんに たして いく。'],
    raku: ['7が 4つ《分|ぶん》 だから', '7 ＋ 7 ＋ 7 ＋ 7 ＝ 7 × 4', '　　　　　　　 ＝ 28'],
    why: '《同|おな》じ かずが いくつ《分|ぶん》 あるかが わかれば、 《九九|く|く》で すぐ こたえが 《出|で》る（《教科書|きょう|か|しょ》 1-12）。',
    caution: 'たす かずが 1つでも ちがう ときは、 そのままでは かけ《算|ざん》に できない。',
    cols: 1,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // おなじ かずを 3つ いじょう たす／「1ふくろ □こずつ、 □ふくろで」
    fits(q) {
      const e = expr(q.split(' ＝ ')[0]);
      if (e && e.n.length >= 3 && e.o.every(o => o === P) && e.n.every(x => x === e.n[0])) return true;
      return /1\S+ \d+こずつ、 \d+\S+で □こ$/.test(q);
    },
    steps: {
      // たし算の こたえを もとめる（かけ算に なおす）
      s1(r) { const a = r.int(2, 9), n = r.int(3, 5); return { q: rep(a, n), a: String(a * n), easy: `${a} ${T} ${n}` }; },
      // かけ算の しきに なおす（□を うめる）
      s2(r) {
        const a = r.int(2, 9), n = r.int(3, 6);
        if (r.chance(0.5)) return { q: `${rep(a, n)} ${E} ${a} ${T} □`, a: String(n), easy: `${a}が ${n}つ《分|ぶん》` };
        return { q: `${rep(a, n)} ${E} □ ${T} ${n}`, a: String(a), easy: `${a}が ${n}つ《分|ぶん》` };
      },
      // ことばの もんだい・10の たし算・2けたの たし算
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(3, 9), n = r.int(3, 9);
          return { q: `あめが 1ふくろ ${a}こずつ、 ${n}ふくろで □こ`, a: String(a * n), easy: `${a} ${T} ${n}` };
        }
        if (k === 1) { const n = r.int(3, 6); return { q: rep(10, n), a: String(10 * n), easy: `10 ${T} ${n}` }; }
        const a = r.pick([11, 12, 13, 20, 30]), n = r.int(3, 4);
        return { q: rep(a, n), a: String(a * n), easy: `${a} ${T} ${n}` };
      },
      // 1つだけ ちがう かずが まざって いる
      trap(r) {
        const a = r.int(3, 8), n = r.int(4, 5), at = r.int(1, n - 1);
        const v = Array(n).fill(a); v[at] = a + r.pick([-1, 1]);
        return { q: v.join(` ${P} `), a: String(v.reduce((x, y) => x + y, 0)), easy: '（ちがう かずが ある）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-34
  M.add({
    id: '1-34', part: 3, chap: '1-13', stars: 1,
    title: '《入|い》れかえても 《同|おな》じ',
    mark: 'かける かずの ほうが **おおきい**（2 × 9 など）。 《入|い》れかえても こたえは 《同|おな》じ。',
    futsu: ['2 × 9 を、 2の だんで', '2、 4、 6、 … 18 と', '9かい となえる。'],
    raku: ['9が 2つ と かんがえる。', '2 × 9 ＝ 9 × 2', '　　　＝ 9 ＋ 9 ＝ 18'],
    why: 'おはじきの 《四角|し|かく》を くるっと まわしても、 かずは かわらない（《教科書|きょう|か|しょ》 1-13）。',
    caution: '《同|おな》じ かずどうし（7 × 7）は、 《入|い》れかえても かわらない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 2・3 × 大きい かず（2 × 9）／ 入れかえの □
    fits(q) {
      const k = mul2(q);
      if (k) return (k[0] === 2 || k[0] === 3) && k[1] > k[0] && k[1] < 100;
      let m = q.match(/^(\d+) × (\d+) ＝ (?:□ × (\d+)|(\d+) × □)$/);
      if (m) { const c = m[3] || m[4]; return c === m[1] || c === m[2]; }
      m = q.match(/^1人 (\d+)こずつ、 (\d+)人で □こ$/);
      return !!m && (+m[1] === 2 || +m[1] === 3) && +m[2] > +m[1];
    },
    steps: {
      // 2・3 × 大きい かず → 入れかえて 大きい かずの だんで
      s1(r) {
        const a = r.int(2, 3), b = r.int(5, 9);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `${b} ${T} ${a}` };
      },
      // □に あう かず
      s2(r) {
        const a = r.int(2, 8), b = r.int(a + 1, 9);
        if (r.chance(0.5)) return { q: `${a} ${T} ${b} ${E} ${b} ${T} □`, a: String(a), easy: '（《入|い》れかえても 《同|おな》じ）' };
        return { q: `${a} ${T} ${b} ${E} □ ${T} ${a}`, a: String(b), easy: '（《入|い》れかえても 《同|おな》じ）' };
      },
      // ことばの もんだい・九九の そとの かず
      s3(r) {
        if (r.chance(0.5)) {
          const a = r.int(2, 3), b = r.int(6, 9);
          return { q: `1《人|にん》 ${a}こずつ、 ${b}《人|にん》で □こ`, a: String(a * b), easy: `${b} ${T} ${a}` };
        }
        const a = r.int(2, 3), b = r.int(10, 13);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `${b} ${T} ${a}` };
      },
      // 同じ かずどうし・もう 大きい かずが まえ
      trap(r) {
        if (r.chance(0.5)) { const a = r.int(3, 9); return { q: `${a} ${T} ${a}`, a: String(a * a), easy: '（《同|おな》じ かずどうし）' }; }
        const a = r.int(6, 9), b = r.int(2, 3);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: '（もう 《大|おお》きい ほうが まえ）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-35
  M.add({
    id: '1-35', part: 3, chap: '1-12・1-13', stars: 1,
    title: 'かける 《数|かず》が 1 ふえると',
    mark: '**1つ まえ** の 《九九|く|く》を しって いる。 いくつ《分|ぶん》が 1 ふえると、 1つ《分|ぶん》の かずだけ ふえる。',
    futsu: ['7 × 8 を、 7の だんを', '7、 14、 21、 … と', 'はじめから となえる。'],
    raku: ['7 × 7 ＝ 49 を つかう。', '7 × 8 ＝ 7 × 7 ＋ 7', '　　　＝ 49 ＋ 7 ＝ 56'],
    why: '7が 8こ は、 7が 7こ より 7が 1こ おおい（《教科書|きょう|か|しょ》 1-12・1-13）。',
    caution: 'たすのは 1では なく、 1つ《分|ぶん》の かず（7 × 8 は 49 ＋ 1 では ない）。',
    cols: 1,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // 1つ まえの 九九が ある（a × b ＝ … だから、 a × (b＋1)）／ ×5・ましかくの となり（3 × 6、 7 × 8）
    fits(q) {
      let m = q.match(/^(\d+) × (\d+) ＝ \d+ だから、 (\d+) × (\d+) ＝ □$/);
      if (m) return m[1] === m[3] && +m[4] === +m[2] + 1;
      m = q.match(/^(\d+) × (\d+) ＝ (\d+) × (\d+) ＋ □$/);
      if (m) return m[1] === m[3] && +m[4] === +m[2] - 1;
      m = q.match(/^\d+こずつ (\d+)ふくろで \d+こ。 (\d+)ふくろで □こ$/);
      if (m) return +m[2] === +m[1] + 1;
      const k = mul2(q);
      return !!k && k[0] >= 3 && k[0] <= 9 && k[1] <= 9 && (k[1] === 6 || k[1] === k[0] + 1);
    },
    steps: {
      // 1つ まえの 九九が 書いて ある
      s1(r) {
        const a = r.int(3, 9), b = r.int(3, 9), p = a * (b - 1);
        return { q: `${a} ${T} ${b - 1} ${E} ${p} だから、 ${a} ${T} ${b} ${E} □`, a: String(a * b), easy: `${p} ${P} ${a}` };
      },
      // 1つ まえを じぶんで さがす（5の だん・ななめの かずの となり）
      s2(r) {
        const a = r.int(3, 9), b = r.chance(0.5) ? 6 : a + 1;
        if (b > 9) return null;
        if (r.chance(0.4)) return { q: `${a} ${T} ${b} ${E} ${a} ${T} ${b - 1} ${P} □`, a: String(a), easy: `（1つ《分|ぶん》の ${a}が ふえる）` };
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `${a} ${T} ${b - 1} ${P} ${a}` };
      },
      // 表の そと・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const a = r.int(2, 9); return { q: `${a} ${T} 9 ${E} ${9 * a} だから、 ${a} ${T} 10 ${E} □`, a: String(10 * a), easy: `${9 * a} ${P} ${a}` }; }
        if (k === 1) { const a = r.int(2, 9); return { q: `${a} ${T} 10 ${E} ${10 * a} だから、 ${a} ${T} 11 ${E} □`, a: String(11 * a), easy: `${10 * a} ${P} ${a}` }; }
        const a = r.int(3, 9), b = r.int(4, 8), p = a * b;
        return { q: `${a}こずつ ${b}ふくろで ${p}こ。 ${b + 1}ふくろで □こ`, a: String(a * (b + 1)), easy: `${p} ${P} ${a}` };
      },
      // ふえたのが 1つ分の ほう（たすのは いくつ分の かず）
      trap(r) {
        const a = r.int(3, 8), b = r.int(3, 9), p = a * b;
        return { q: `${a} ${T} ${b} ${E} ${p} だから、 ${a + 1} ${T} ${b} ${E} □`, a: String((a + 1) * b), easy: `（${a}では なく ${b}を たす）` };
      },
    },
  });

  // ---------------------------------------------------------------- 1-36
  M.add({
    id: '1-36', part: 3, chap: '1-13', stars: 1,
    title: 'だんを 《分|わ》けて つくる',
    mark: '6・7・8・9の だんは、 **5の だん** と のこりの だんに 《分|わ》けられる。',
    futsu: ['7 × 8 を、 7の だんを', '7、 14、 21、 … と', '8かい となえる。'],
    raku: ['7を 5と 2に 《分|わ》ける。', '7 × 8 ＝ 5 × 8 ＋ 2 × 8', '　　　＝ 40 ＋ 16 ＝ 56'],
    why: '1れつ 7こを 5こと 2こに 《分|わ》けても、 ぜんぶの かずは かわらない（《教科書|きょう|か|しょ》 1-13）。',
    caution: '2・3・4の だんは、 《分|わ》けると かえって ながく なる。 そのまま つかおう。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 6〜9の だん（かける ほうが 6〜9 でも）／ × 11〜13 を 10と のこりに
    fits(q) {
      const m = q.match(/^(\d) × (\d) ＝ (?:□ ＋ (\d+)|(\d+) ＋ □)$/);
      if (m) { const a = +m[1], b = +m[2], g = +(m[3] || m[4]); return a >= 6 && (g === 5 * b || g === (a - 5) * b); }
      const k = mul2(q);
      if (!k) return false;
      const [a, b] = k;
      if (a >= 2 && a <= 9 && b >= 11 && b <= 13) return true;
      if (a > 9 || b > 9 || b < 2) return false;
      return a >= 6 || (a >= 3 && b >= 6);
    },
    steps: {
      // 6〜9の だん：1つ分を 5と のこりに
      s1(r) {
        const a = r.int(6, 9), b = r.int(2, 9), c = a - 5;
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `5 ${T} ${b} ${P} ${c} ${T} ${b}` };
      },
      // かける ほうが 6〜9：いくつ分を 5と のこりに
      s2(r) {
        const b = r.int(3, 5), a = r.int(6, 9), c = a - 5;
        return { q: `${b} ${T} ${a}`, a: String(a * b), easy: `${b} ${T} 5 ${P} ${b} ${T} ${c}` };
      },
      // □を うめる・10と のこりに 分ける
      s3(r) {
        const k = r.int(0, 2), a = r.int(6, 9), b = r.int(2, 9);
        if (k === 0) return { q: `${a} ${T} ${b} ${E} □ ${P} ${(a - 5) * b}`, a: String(5 * b), easy: `5 ${T} ${b}` };
        if (k === 1) return { q: `${a} ${T} ${b} ${E} ${5 * b} ${P} □`, a: String((a - 5) * b), easy: `${a - 5} ${T} ${b}` };
        const c = r.int(2, 9), d = r.int(11, 13);
        return { q: `${c} ${T} ${d}`, a: String(c * d), easy: `${c} ${T} 10 ${P} ${c} ${T} ${d - 10}` };
      },
      // 6より 小さい かずだけ（分けなくて よい）
      trap(r) {
        const a = r.int(2, 4), b = r.int(2, 5);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: '（6〜9が ない。 そのまま）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-37（見本）
  M.add({
    id: '1-37', part: 3, chap: '1-13', stars: 1,
    title: '9の だんは 10の だんから ひく',
    mark: 'かける かずに **9** が ある。 9は 10より 1 すくない。',
    futsu: ['9 × 7 は、 9の だんを', '9、 18、 27、 … と', 'じゅんに となえて さがす。'],
    raku: ['9 × 7 ＝ 10 × 7 － 7', '　　　 ＝ 70 － 7', '　　　 ＝ 63'],
    why: '9は 10より 1 すくないので、 9が 7こ は、 10が 7こ より 7 すくない。',
    caution: '9の だんで ない ときは、 《九九|く|く》の まま けいさん しよう。',
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    // × 9（もう 1つは 12まで）／ 9 ＋ 9 ＋ 9
    fits(q) {
      if (either(mul2(q), (x, y) => x === 9 && y >= 1 && y <= 12)) return true;
      const e = expr(q);
      return !!e && e.n.length >= 3 && e.o.every(o => o === P) && e.n.every(x => x === 9);
    },
    steps: {
      s1(r) { const n = r.int(1, 9); return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}` }; },
      s2(r) { const n = r.int(1, 9); return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n} ${T} 10 ${S} ${n}` }; },
      s3(r) {
        if (r.chance(0.7)) {
          const n = r.int(10, 12);
          if (r.chance(0.5)) return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}` };
          return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n} ${T} 10 ${S} ${n}` };
        }
        return { q: rep(9, 3), a: '27', easy: `10 ${T} 3 ${S} 3` };
      },
      trap(r) {
        const a = r.pick([6, 7, 8]), b = r.int(3, 8);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: '（9の だんでは ない）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-38
  M.add({
    id: '1-38', part: 3, chap: '1-13', stars: 1,
    title: '4の だんは 2ばいの 2ばい',
    mark: 'かける かずに **4** が ある。 4は 2と 2。',
    futsu: ['4 × 7 を、 4の だんを', '4、 8、 12、 … と', '7かい となえる。'],
    raku: ['2 × 7 ＝ 14 を 2ばい する。', '4 × 7 ＝ 2 × 7 ＋ 2 × 7', '　　　＝ 14 ＋ 14 ＝ 28'],
    why: '1れつ 4こは、 2こと 2こ。 2の だんの こたえを 2つ たせば よい（《教科書|きょう|か|しょ》 1-13）。',
    caution: '3の だんや 7の だんは、 2ばいの 2ばいでは ない。',
    counts: { s1: 8, s2: 7, s3: 7, trap: 2 },
    // × 4（もう 1つは 15まで）・× 8（2ばいの 2ばいの 2ばい）
    fits(q) {
      const m = q.match(/^4 × (\d+) ＝ (\d+) ＋ □$/);
      if (m) return +m[2] === 2 * m[1];
      return either(mul2(q), (x, y) => (x === 4 && y >= 2 && y <= 15) || (x === 8 && y >= 3 && y <= 9));
    },
    steps: {
      s1(r) { const b = r.int(2, 9); return { q: `4 ${T} ${b}`, a: String(4 * b), easy: `${2 * b} ${P} ${2 * b}` }; },
      s2(r) { const b = r.int(2, 9); return { q: `${b} ${T} 4`, a: String(4 * b), easy: `${b} ${T} 2 ${P} ${b} ${T} 2` }; },
      // 8の だん（2ばいの 2ばいの 2ばい）・九九の そと・□
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const b = r.int(3, 9); return { q: `8 ${T} ${b}`, a: String(8 * b), easy: `${4 * b} ${P} ${4 * b}` }; }
        if (k === 1) { const b = r.int(10, 15); return { q: `4 ${T} ${b}`, a: String(4 * b), easy: `${2 * b} ${P} ${2 * b}` }; }
        const b = r.int(3, 9);
        return { q: `4 ${T} ${b} ${E} ${2 * b} ${P} □`, a: String(2 * b), easy: `2 ${T} ${b}` };
      },
      trap(r) {
        const a = r.pick([3, 7]), b = r.intNot(3, 9, v => v === 4 || v === 8);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: '（4の だんでは ない）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-39
  M.add({
    id: '1-39', part: 3, chap: '1-13', stars: 1,
    title: '5の だんは 10の だんの はんぶん',
    mark: 'かける かずに **5** が ある。 5は 10の はんぶん。',
    futsu: ['5 × 8 を、 5の だんを', '5、 10、 15、 … と', '8かい となえる。'],
    raku: ['10 × 8 ＝ 80 を つかう。', '5 × 8 ＝ 80の はんぶん', '　　　＝ 40'],
    why: '5こは 10こ の はんぶん。 10の だんは 0を つけるだけ なので、 それを はんぶんに すれば よい。',
    caution: '5の だんで ない ときは つかえない。',
    counts: { s1: 8, s2: 7, s3: 7, trap: 2 },
    boxw: '11mm',
    // × 5（もう 1つは 20まで）・5円玉
    fits(q) {
      if (/^5円玉 \d+まいで □円$/.test(q)) return true;
      return either(mul2(q), (x, y) => x === 5 && y >= 2 && y <= 20);
    },
    steps: {
      s1(r) { const b = r.int(2, 9); return { q: `5 ${T} ${b}`, a: String(5 * b), easy: `${10 * b}の はんぶん`, verify: () => (10 * b) / 2 === 5 * b || 'はんぶん' }; },
      s2(r) { const b = r.int(2, 9); return { q: `${b} ${T} 5`, a: String(5 * b), easy: `${10 * b}の はんぶん`, verify: () => (10 * b) / 2 === 5 * b || 'はんぶん' }; },
      // 九九の そと・お金
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) { const b = r.int(3, 9); return { q: `5《円|えん》《玉|だま》 ${b}まいで □《円|えん》`, a: String(5 * b), easy: `${10 * b}の はんぶん`, verify: () => (10 * b) / 2 === 5 * b || 'はんぶん' }; }
        const b = r.pick([10, 12, 14, 16, 18, 20]);
        if (k === 0) return { q: `5 ${T} ${b}`, a: String(5 * b), easy: `${10 * b}の はんぶん`, verify: () => (10 * b) / 2 === 5 * b || 'はんぶん' };
        return { q: `${b} ${T} 5`, a: String(5 * b), easy: `${10 * b}の はんぶん`, verify: () => (10 * b) / 2 === 5 * b || 'はんぶん' };
      },
      // 5の だんでは ない・たし算
      trap(r) {
        const b = r.int(3, 9);
        if (r.chance(0.5)) return { q: `5 ${P} ${b}`, a: String(5 + b), easy: '（かけ《算|ざん》では ない）' };
        const a = r.pick([4, 6]);
        if (b === 5) return null;
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `（5の だんでは ない）` };
      },
    },
  });

  // ---------------------------------------------------------------- 1-40
  M.add({
    id: '1-40', part: 3, chap: '1-12', stars: 1,
    title: '0と 1の かけ《算|ざん》',
    mark: '**0** や **1** を かけて いる。',
    futsu: ['0 × 8 を、', '0 ＋ 0 ＋ 0 ＋ … と', '8かい たす。'],
    raku: ['0は いくつ あっても 0。', '0 × 8 ＝ 0', '8が 1つ《分|ぶん》 なら 8。', '8 × 1 ＝ 8'],
    why: '0こ の さらが いくつ あっても 0こ。 1つ《分|ぶん》が 1つ だけ なら、 その かずの まま。',
    caution: '× 1 を ＋ 1 と まちがえない（8 × 1 は 9では ない）。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // × 0・× 1
    fits(q) {
      const m = q.match(/^(\d+) × □ ＝ (\d+)$/);
      if (m) return m[2] === '0' || m[1] === m[2];
      if (/^からの さら \d+まいに|^\d+人に 1こずつで □こ$/.test(q)) return true;
      const k = mul2(q);
      return !!k && k.some(x => x === 0 || x === 1);
    },
    steps: {
      s1(r) {
        const a = r.int(2, 9), k = r.int(0, 3);
        if (k === 0) return { q: `0 ${T} ${a}`, a: '0', easy: '（0が ある）' };
        if (k === 1) return { q: `${a} ${T} 0`, a: '0', easy: '（0が ある）' };
        if (k === 2) return { q: `${a} ${T} 1`, a: String(a), easy: `${a}が 1つ《分|ぶん》` };
        return { q: `1 ${T} ${a}`, a: String(a), easy: `1が ${a}つ《分|ぶん》` };
      },
      // 2けたの かず
      s2(r) {
        const n = r.int(11, 99), k = r.int(0, 3);
        if (k === 0) return { q: `0 ${T} ${n}`, a: '0', easy: '（0が ある）' };
        if (k === 1) return { q: `${n} ${T} 0`, a: '0', easy: '（0が ある）' };
        if (k === 2) return { q: `${n} ${T} 1`, a: String(n), easy: `${n}が 1つ《分|ぶん》` };
        return { q: `1 ${T} ${n}`, a: String(n), easy: `1が ${n}こ` };
      },
      // □を もとめる・ことばの もんだい
      s3(r) {
        const a = r.int(2, 9), k = r.int(0, 3);
        if (k === 0) return { q: `${a} ${T} □ ${E} 0`, a: '0', easy: `${a} ${T} 0 ${E} 0` };
        if (k === 1) return { q: `${a} ${T} □ ${E} ${a}`, a: '1', easy: `（${a}が 1つ《分|ぶん》で ${a}）` };
        if (k === 2) return { q: `からの さら ${a}まいに、 あめは □こ`, a: '0', easy: `0 ${T} ${a}` };
        return { q: `${a}《人|にん》に 1こずつで □こ`, a: String(a), easy: `1 ${T} ${a}` };
      },
      // たし算・× 10
      trap(r) {
        const a = r.int(3, 9), k = r.int(0, 2);
        if (k === 0) return { q: `${a} ${P} 1`, a: String(a + 1), easy: '（たし《算|ざん》。 1 ふえる）' };
        if (k === 1) return { q: `${a} ${P} 0`, a: String(a), easy: '（たし《算|ざん》。 かわらない）' };
        return { q: `${a} ${T} 10`, a: String(10 * a), easy: '（10は 0でも 1でも ない）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-41
  M.add({
    id: '1-41', part: 3, chap: '1-12', stars: 2,
    title: 'なん《十|じゅう》 × 1けた',
    mark: '30、 40 の ような **10の まとまり** に、 1けたの かずを かける。',
    futsu: ['30 × 4 を、', '30 ＋ 30 ＋ 30 ＋ 30', 'と たして いく。'],
    raku: ['30は 10が 3こ。', '30 × 4 ＝ 3 × 4 × 10', '　　　 ＝ 12 × 10 ＝ 120'],
    why: '10の まとまりが 3 × 4 ＝ 12こ。 10が 12こで 120。',
    caution: '0の つけわすれに ちゅうい。 50 × 4 ＝ 200 の ように、 《九九|く|く》の こたえに 0が ある ときも 0を つける。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // なん十（20〜90）・なん百 × 1けた（2〜9）
    fits(q) {
      const rt = x => (x % 10 === 0 && x >= 20 && x <= 90) || (x % 100 === 0 && x >= 200 && x <= 900);
      let m = q.match(/^(\d+)円の ノート (\d+)さつで □円$/);
      if (m) return rt(+m[1]) && +m[2] >= 2;
      m = q.match(/^(\d+) × □ ＝ (\d+)$/);
      if (m) return rt(+m[1]) && +m[2] % +m[1] === 0 && +m[2] / +m[1] >= 2 && +m[2] / +m[1] <= 9;
      return either(mul2(q), (x, y) => rt(x) && y >= 2 && y <= 9);
    },
    steps: {
      s1(r) { const t = r.int(2, 9), b = r.int(2, 9); return { q: `${10 * t} ${T} ${b}`, a: String(10 * t * b), easy: `${t} ${T} ${b} ${T} 10` }; },
      // 入れかえ・九九の こたえに 0が ある
      s2(r) {
        if (r.chance(0.4)) {
          const [t, b] = r.pick([[5, 2], [5, 4], [5, 6], [5, 8], [2, 5], [4, 5], [6, 5], [8, 5]]);
          return { q: `${10 * t} ${T} ${b}`, a: String(10 * t * b), easy: `${t} ${T} ${b} ${T} 10` };
        }
        const t = r.int(2, 9), b = r.int(2, 9);
        return { q: `${b} ${T} ${10 * t}`, a: String(10 * t * b), easy: `${b} ${T} ${t} ${T} 10` };
      },
      // なん百・お金・□
      s3(r) {
        const k = r.int(0, 2), t = r.int(2, 9), b = r.int(2, 9);
        if (k === 0) return { q: `${100 * t} ${T} ${b}`, a: String(100 * t * b), easy: `${t * b} ${T} 100` };
        if (k === 1) return { q: `${10 * t}《円|えん》の ノート ${b}さつで □《円|えん》`, a: String(10 * t * b), easy: `${t * b} ${T} 10` };
        return { q: `${10 * t} ${T} □ ${E} ${10 * t * b}`, a: String(b), easy: `（${t} ${T} ${b} ${E} ${t * b}）` };
      },
      // なん十では ない・たし算
      trap(r) {
        if (r.chance(0.5)) { const n = r.intNot(21, 49, not10), b = r.int(2, 4); return { q: `${n} ${T} ${b}`, a: String(n * b), easy: '（なん《十|じゅう》では ない）' }; }
        const t = r.int(2, 9), b = r.int(2, 9);
        return { q: `${10 * t} ${P} ${b}`, a: String(10 * t + b), easy: '（かけ《算|ざん》では ない）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-42
  M.add({
    id: '1-42', part: 3, chap: '1-13', stars: 2,
    title: 'くらいごとに 《分|わ》けて かける',
    mark: '**2けた × 1けた**。 《十|じゅう》の くらいと 《一|いち》の くらいに 《分|わ》ける。',
    futsu: ['23 × 4 を、', '23 ＋ 23 ＋ 23 ＋ 23', 'と たして いく。'],
    raku: ['23を 20と 3に 《分|わ》ける。', '23 × 4 ＝ 20 × 4 ＋ 3 × 4', '　　　 ＝ 80 ＋ 12 ＝ 92'],
    why: '7の だんを 5と 2に 《分|わ》けたのと 《同|おな》じ（《教科書|きょう|か|しょ》 1-13）。 20 × 4 は わざ 1-41。',
    caution: 'さいごの たし《算|ざん》の くり《上|あ》がりに ちゅうい。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 2けた（なん十で ない）・3けた × 1けた（2〜9）
    fits(q) {
      const nn = x => x >= 11 && x <= 999 && x % 10 !== 0 && (x < 100 || x % 100 >= 10);
      const m = q.match(/^(\d+)円の あめ (\d+)こで □円$/);
      if (m) return nn(+m[1]) && +m[2] >= 2 && +m[2] <= 9;
      return either(mul2(q), (x, y) => nn(x) && y >= 2 && y <= 9);
    },
    steps: {
      s1(r) {
        const n = r.intNot(12, 49, not10), b = r.int(2, 5), t = n - n % 10, u = n % 10;
        return { q: `${n} ${T} ${b}`, a: String(n * b), easy: `${t} ${T} ${b} ${P} ${u} ${T} ${b}` };
      },
      s2(r) {
        const n = r.intNot(12, 98, not10), b = r.int(2, 9), t = n - n % 10, u = n % 10;
        if (r.chance(0.5)) return { q: `${b} ${T} ${n}`, a: String(n * b), easy: `${b} ${T} ${t} ${P} ${b} ${T} ${u}` };
        return { q: `${n} ${T} ${b}`, a: String(n * b), easy: `${t * b} ${P} ${u * b}` };
      },
      // お金・3けた
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.intNot(12, 49, not10), b = r.int(2, 6), t = n - n % 10, u = n % 10;
          return { q: `${n}《円|えん》の あめ ${b}こで □《円|えん》`, a: String(n * b), easy: `${t * b} ${P} ${u * b}` };
        }
        const n = r.intNot(111, 149, v => v % 10 === 0 || v % 100 < 10), b = r.int(2, 4), t = n % 100 - n % 10, u = n % 10;
        return { q: `${n} ${T} ${b}`, a: String(n * b), easy: `${100 * b} ${P} ${t * b} ${P} ${u * b}` };
      },
      // 一の くらいが 0・× 1
      trap(r) {
        if (r.chance(0.5)) { const t = r.int(2, 9), b = r.int(2, 9); return { q: `${10 * t} ${T} ${b}`, a: String(10 * t * b), easy: '（わざ 1-41 で すぐ）' }; }
        const n = r.intNot(12, 98, not10);
        return { q: `${n} ${T} 1`, a: String(n), easy: '（1を かけても かわらない）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-43（見本）
  M.add({
    id: '1-43', part: 3, chap: '1-13', stars: 2,
    title: '× 9 は 10ばいして ひく',
    mark: '2けたの かずに **9** を かける。 9は 10より 1 すくない。',
    futsu: ['47 × 9 を ひっ《算|さん》で', 'くり《上|あ》がりに', '《気|き》を つけて けいさん。'],
    raku: ['47 × 9 ＝ 47 × 10 － 47', '　　　　＝ 470 － 47', '　　　　＝ 423'],
    why: '9こ は 10こ より 1こ すくない。 10ばいは、 うしろに 0を つけるだけ。',
    caution: '× 8 や × 7 を 10から ひくと、 ひく かずが 2こ、 3こ ぶんに なって、 かえって たいへん。',
    // 2けた × 9・× 99／ 1けた × 19
    fits(q) {
      return either(mul2(q), (x, y) => ((x === 9 || x === 99) && y >= 11 && y <= 99 && y % 10 !== 0) || (x === 19 && y >= 2 && y <= 9));
    },
    steps: {
      s1(r) { const n = r.intNot(12, 59, v => v % 10 === 0); return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n * 10} ${S} ${n}` }; },
      s2(r) { const n = r.intNot(12, 98, v => v % 10 === 0); return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `${n * 10} ${S} ${n}` }; },
      s3(r) {
        if (r.chance(0.5)) { const n = r.intNot(12, 49, v => v % 10 === 0); return { q: `${n} ${T} 99`, a: String(99 * n), easy: `${n * 100} ${S} ${n}` }; }
        const n = r.intNot(3, 9, v => v === 5); return { q: `${n} ${T} 19`, a: String(19 * n), easy: `${n * 20} ${S} ${n}` };
      },
      trap(r) { const n = r.intNot(12, 49, v => v % 10 === 0); return { q: `${n} ${T} 8`, a: String(8 * n), easy: '（× 8 は ひっ《算|さん》で）' }; },
    },
  });

  // ---------------------------------------------------------------- 1-44
  M.add({
    id: '1-44', part: 3, chap: '1-13', stars: 2,
    title: '× 11 は 10ばいして たす',
    mark: '2けたの かずに **11** を かける。 11は 10より 1 おおい。',
    futsu: ['23 × 11 を ひっ《算|さん》で', '2だん かいて、', 'さいごに たす。'],
    raku: ['23 × 11 ＝ 23 × 10 ＋ 23', '　　　　 ＝ 230 ＋ 23', '　　　　 ＝ 253'],
    why: '11こ は 10こ より 1こ おおい。 10ばいは、 うしろに 0を つけるだけ。',
    caution: '× 12 や × 13 を 10ばいから つくると、 たす かずが 2こ、 3こ ぶんに なって たいへん。',
    // × 11・× 101／ 1けた × 21
    fits(q) {
      return either(mul2(q), (x, y) => ((x === 11 || x === 101) && y >= 2 && y <= 99 && y % 10 !== 0) || (x === 21 && y >= 2 && y <= 9));
    },
    steps: {
      s1(r) { const n = r.intNot(12, 59, not10); return { q: `${n} ${T} 11`, a: String(11 * n), easy: `${n * 10} ${P} ${n}` }; },
      s2(r) { const n = r.intNot(12, 98, not10); return { q: `11 ${T} ${n}`, a: String(11 * n), easy: `${n * 10} ${P} ${n}` }; },
      // × 101・× 21
      s3(r) {
        if (r.chance(0.5)) { const n = r.intNot(12, 49, not10); return { q: `${n} ${T} 101`, a: String(101 * n), easy: `${n * 100} ${P} ${n}` }; }
        const n = r.intNot(3, 9, v => v === 5); return { q: `${n} ${T} 21`, a: String(21 * n), easy: `${n * 20} ${P} ${n}` };
      },
      trap(r) { const n = r.intNot(12, 49, not10); return { q: `${n} ${T} 12`, a: String(12 * n), easy: '（× 12 は ひっ《算|さん》で）' }; },
    },
  });

  // ---------------------------------------------------------------- 1-45
  M.add({
    id: '1-45', part: 3, chap: '1-13', stars: 2,
    title: '× 5 は 10ばいの はんぶん',
    mark: '2けたの かずに **5** を かける。 5は 10の はんぶん。',
    futsu: ['46 × 5 を、 40 × 5 と', '6 × 5 に 《分|わ》けて かけて、', '200 ＋ 30 と たす。'],
    raku: ['46 × 5 ＝ 460の はんぶん', '　　　 ＝ 230'],
    why: '5こは 10こ の はんぶん。 10ばいして から はんぶんに する（わざ 1-39 と 《同|おな》じ）。',
    caution: '× 5 で ない ときは つかえない。 × 6 は 10ばいの はんぶんでは ない。',
    boxw: '11mm',
    // 2けた（なん十で ない） × 5・2けたの ぐうすう × 50
    fits(q) {
      const m = q.match(/^(\d+) × 5 ＝ □ × 10$/);
      if (m) return +m[1] % 2 === 0;
      return either(mul2(q), (x, y) => (x === 5 && y >= 11 && y <= 99 && y % 10 !== 0) || (x === 50 && y >= 11 && y <= 99 && y % 2 === 0));
    },
    steps: {
      s1(r) { const n = r.intNot(12, 48, v => v % 2 || not10(v)); return { q: `${n} ${T} 5`, a: String(5 * n), easy: `${10 * n}の はんぶん`, verify: () => (10 * n) / 2 === 5 * n || 'はんぶん' }; },
      s2(r) { const n = r.intNot(12, 98, v => v % 2 || not10(v)); return { q: `5 ${T} ${n}`, a: String(5 * n), easy: `${10 * n}の はんぶん`, verify: () => (10 * n) / 2 === 5 * n || 'はんぶん' }; },
      // 一の くらいが 奇数・× 50・さきに はんぶん
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const n = r.intNot(13, 49, v => !(v % 2) || v % 10 === 5); return { q: `${n} ${T} 5`, a: String(5 * n), easy: `${10 * n}の はんぶん`, verify: () => (10 * n) / 2 === 5 * n || 'はんぶん' }; }
        if (k === 1) { const n = r.intNot(12, 18, v => v % 2); return { q: `${n} ${T} 50`, a: String(50 * n), easy: `${100 * n}の はんぶん`, verify: () => (100 * n) / 2 === 50 * n || 'はんぶん' }; }
        const n = r.intNot(12, 48, v => v % 2 || not10(v));
        return { q: `${n} ${T} 5 ${E} □ ${T} 10`, a: String(n / 2), easy: `（${n}の はんぶん）` };
      },
      trap(r) { const n = r.intNot(12, 48, not10); return { q: `${n} ${T} 6`, a: String(6 * n), easy: '（× 5 では ない）' }; },
    },
  });

  // ---------------------------------------------------------------- 1-46
  M.add({
    id: '1-46', part: 3, chap: '1-12', stars: 2,
    title: 'かけて 10・100に なる くみを さきに',
    mark: '3つの かずの かけ《算|ざん》に **2と 5**、 **4と 25** が ある。',
    futsu: ['2 × 7 × 5 を、 まえから', '2 × 7 ＝ 14、 14 × 5 と', 'じゅんに かける。'],
    raku: ['2 × 5 ＝ 10 を さきに する。', '2 × 7 × 5 ＝ 10 × 7', '　　　　　＝ 70'],
    why: 'かけ《算|ざん》は、 かける じゅんばんを かえても こたえは 《同|おな》じ。 10を かけるのは 0を つけるだけ。',
    caution: 'たし《算|ざん》が まざって いる ときは、 じゅんばんを かえては いけない。',
    // かけ算だけで、 かけて 10・100・1000に なる 2つが ある／ 12〜18の ぐうすう × 5（かくれた 2）
    fits(q) {
      const e = expr(q);
      if (!e || !e.o.every(o => o === T)) return false;
      const n = e.n;
      if (n.length === 2) return either(n, (x, y) => x === 5 && y >= 12 && y <= 18 && y % 2 === 0);
      return n.some((x, i) => n.some((y, j) => j > i && [10, 100, 1000].includes(x * y)));
    },
    steps: {
      s1(r) {
        const a = r.int(3, 9);
        if (r.chance(0.5)) return { q: `2 ${T} ${a} ${T} 5`, a: String(10 * a), easy: `10 ${T} ${a}` };
        return { q: `5 ${T} ${a} ${T} 2`, a: String(10 * a), easy: `10 ${T} ${a}` };
      },
      // 4と 25
      s2(r) {
        const a = r.int(2, 9);
        if (r.chance(0.5)) return { q: `4 ${T} ${a} ${T} 25`, a: String(100 * a), easy: `100 ${T} ${a}` };
        return { q: `25 ${T} ${a} ${T} 4`, a: String(100 * a), easy: `100 ${T} ${a}` };
      },
      // かくれた 2・4つの かず・20と 5
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const h = r.int(6, 9); return { q: `${2 * h} ${T} 5`, a: String(10 * h), easy: `${h} ${T} 2 ${T} 5 ${E} ${h} ${T} 10` }; }
        if (k === 1) { const a = r.int(2, 4), b = r.int(2, 4); return { q: `2 ${T} ${a} ${T} 5 ${T} ${b}`, a: String(10 * a * b), easy: `10 ${T} ${a * b}` }; }
        const a = r.int(3, 9);
        return { q: `20 ${T} ${a} ${T} 5`, a: String(100 * a), easy: `100 ${T} ${a}` };
      },
      // たし算が まざる・10に ならない くみ
      trap(r) {
        const a = r.pick([3, 7, 9]);
        if (r.chance(0.5)) return { q: `2 ${T} ${a} ${P} 5`, a: String(2 * a + 5), easy: '（＋ が あるので できない）' };
        const c = r.pick([3, 7, 9]);
        return { q: `${c} ${T} ${a} ${T} 5`, a: String(c * a * 5), easy: `（${c} × 5 は 10に ならない）` };
      },
    },
  });

  // ---------------------------------------------------------------- 1-47
  M.add({
    id: '1-47', part: 3, chap: '1-13', stars: 2,
    title: '《同|おな》じ かずを かける ところを まとめる',
    mark: '＋ の まえと うしろで、 **おなじ かず** を かけて いる。',
    futsu: ['7 × 6 ＋ 3 × 6 を、', '42 ＋ 18 と けいさん して', 'から たす。'],
    raku: ['どちらも × 6。 7と 3で 10。', '7 × 6 ＋ 3 × 6 ＝ 10 × 6', '　　　　　　 ＝ 60'],
    why: '7こ 6れつと 3こ 6れつを あわせると、 10こ 6れつ（《教科書|きょう|か|しょ》 1-13 「だんを たして つくる」）。',
    caution: 'かける かずが ちがう とき（7 × 6 ＋ 3 × 5）は まとめられない。',
    cols: 1,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // a × c ＋ b × c で、 おなじ かずが あって、 のこりを たす（ひく）と なん十
    fits(q) {
      const m = q.match(/^(\d+) × (\d+) ([＋－]) (\d+) × (\d+)$/);
      if (!m) return false;
      const a = +m[1], b = +m[2], c = +m[4], d = +m[5], plus = m[3] === P;
      const ok = (x, y) => (plus ? (x + y) % 10 === 0 : x > y && (x - y) % 10 === 0);
      return (b === d && ok(a, c)) || (a === c && ok(b, d)) || (a === d && ok(b, c)) || (b === c && ok(a, d));
    },
    steps: {
      s1(r) {
        const a = r.int(2, 8), c = r.int(2, 9);
        return { q: `${a} ${T} ${c} ${P} ${10 - a} ${T} ${c}`, a: String(10 * c), easy: `10 ${T} ${c}` };
      },
      // 同じ かずが まえに ある・ばらばら
      s2(r) {
        const a = r.int(2, 8), c = r.int(2, 9);
        if (r.chance(0.5)) return { q: `${c} ${T} ${a} ${P} ${c} ${T} ${10 - a}`, a: String(10 * c), easy: `${c} ${T} 10` };
        return { q: `${a} ${T} ${c} ${P} ${c} ${T} ${10 - a}`, a: String(10 * c), easy: `10 ${T} ${c}` };
      },
      // 20・100に なる・ひき算
      s3(r) {
        const k = r.int(0, 2), c = r.int(2, 9);
        if (k === 0) { const a = r.int(11, 19); return { q: `${a} ${T} ${c} ${P} ${20 - a} ${T} ${c}`, a: String(20 * c), easy: `20 ${T} ${c}` }; }
        if (k === 1) { const a = r.intNot(21, 79, not10); return { q: `${a} ${T} ${c} ${P} ${100 - a} ${T} ${c}`, a: String(100 * c), easy: `100 ${T} ${c}` }; }
        const b = r.int(1, 5);
        return { q: `${10 + b} ${T} ${c} ${S} ${b} ${T} ${c}`, a: String(10 * c), easy: `10 ${T} ${c}` };
      },
      trap(r) {
        const a = r.int(2, 8), c = r.int(3, 9), d = r.intNot(2, 9, v => v === c);
        return { q: `${a} ${T} ${c} ${P} ${10 - a} ${T} ${d}`, a: String(a * c + (10 - a) * d), easy: '（かける かずが ちがう）' };
      },
    },
  });

  // ---------------------------------------------------------------- 1-48
  M.add({
    id: '1-48', part: 3, chap: '1-13', stars: 2,
    title: 'まんなかの かずを はさむ かけ《算|ざん》',
    mark: 'かける 2つの かずが **2 ちがい**（6と 8）。 まんなかに 7が ある。',
    futsu: ['6 × 8 を、 6の だんを', '6、 12、 18、 … と', '8かい となえる。'],
    raku: ['6 × 8 ＝ 7 × 7 － 1', '　　　＝ 49 － 1 ＝ 48', '4 ちがい なら 2 × 2 ＝ 4 を ひく。', '5 × 9 ＝ 7 × 7 － 4 ＝ 45'],
    why: '2 ちがいの かけ《算|ざん》は、 まんなかの かずの ましかく（7 × 7）より 1 すくない（《教科書|きょう|か|しょ》 1-13 ななめの きまり）。',
    caution: '5 × 8 の ように、 まんなかの かずが ない ときは つかえない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 2 ちがい・4 ちがいで、 まんなかの ましかくを しって いる（まんなかが 4〜10、 または なん十）
    fits(q) {
      const k = mul2(q);
      if (!k) return false;
      const a = Math.min(k[0], k[1]), b = Math.max(k[0], k[1]), d = b - a, m = (a + b) / 2;
      if (d !== 2 && d !== 4) return false;
      return (m <= 10 && a >= 3) || (m % 10 === 0 && m <= 50);
    },
    steps: {
      s1(r) {
        const m = r.int(3, 9), [x, y] = r.chance(0.5) ? [m - 1, m + 1] : [m + 1, m - 1];
        return { q: `${x} ${T} ${y}`, a: String(x * y), easy: `${m} ${T} ${m} ${S} 1` };
      },
      // 4 ちがい（まんなかの ましかくより 4 すくない）
      s2(r) {
        const m = r.int(4, 9), [x, y] = r.chance(0.5) ? [m - 2, m + 2] : [m + 2, m - 2];
        return { q: `${x} ${T} ${y}`, a: String(x * y), easy: `${m} ${T} ${m} ${S} 4` };
      },
      // まんなかが 10・20・30 …
      s3(r) {
        const m = r.pick([10, 20, 30, 40, 50]), d = r.pick([1, 1, 2]);
        const [x, y] = r.chance(0.5) ? [m - d, m + d] : [m + d, m - d];
        return { q: `${x} ${T} ${y}`, a: String(x * y), easy: `${m * m} ${S} ${d * d}` };
      },
      // まんなかが ない（1 ちがい・3 ちがい）
      trap(r) {
        const a = r.int(3, 6), d = r.pick([1, 3]);
        return { q: `${a} ${T} ${a + d}`, a: String(a * (a + d)), easy: '（まんなかの かずが ない）' };
      },
    },
  });
})(globalThis.MONDAI);
