/* 問題集 第1巻　第3部 かけ算（わざ 1-33〜1-48、 1-92）　組 c
 * 書き方は v1/README.md。文は第1巻の教科書と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。
 * 第29回：わなは、同じ部の ほかの わざで 楽に ならない ものに する。九九の わなの ように どうしても 当たる ときは、
 *   楽な形に 行き先（「わざ 1-36 で」）を 書いて also に 入れる（dest）。入れかえただけの 問題には key を つける（H-6）。 */
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

  // ---------------------------------------------------------------- 同じ問題の key（H-6）
  // 入れかえただけの 問題（7 × 8 と 8 × 7、 2 × 7 × 5 と 5 × 7 × 2）は 同じ key
  const num = (x, y) => x - y;
  const kx = (...v) => T + v.slice().sort(num).join(',');
  const ks = v => P + v.slice().sort(num).join(',');
  // a × c ＋ b × d（項の 入れかえ・かける じゅんの 入れかえ）
  const k47 = (op, a, c, b, d) => op + [[a, c], [b, d]].map(x => x.slice().sort(num).join(',')).sort().join('/');
  // 1人・2人は「ひとり」「ふたり」（H-3）
  const nin = n => (n === 1 ? 'ひとり' : n === 2 ? 'ふたり' : `${n}《人|にん》`);

  // ---------------------------------------------------------------- わなの 行き先（H-1・H-2）
  // わなの 問題に、 同じ部の ほかの わざが つかえる ときは、 楽な形に 「わざ 1-36 で」と 書いて also に 入れる
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(1).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 3 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。 わざ ${also.join('・')} で` : ''}）`;
    return p;
  }

  // ---------------------------------------------------------------- 1-33
  M.add({
    id: '1-33', part: 3, chap: '1-12', stars: 1,
    title: '《同|おな》じ かずを たすなら かけ《算|ざん》',
    mark: '**おなじ かず** を なんども たして いる。 いくつ《分|ぶん》 あるかを かぞえる。',
    futsu: ['7 ＋ 7 ＝ 14、 14 ＋ 7 ＝ 21、', '21 ＋ 7 ＝ 28 と、', 'じゅんに たして いく。'],
    raku: ['7が 4つ《分|ぶん》 だから', '7 ＋ 7 ＋ 7 ＋ 7 ＝ 7 × 4', '　　　　　　 ＝ 28'],
    why: '《同|おな》じ かずが いくつ《分|ぶん》 あるかが わかれば、 《九九|く|く》で すぐ こたえが 《出|で》る（きょうかしょ 1-12）。',
    caution: 'たす かずが ばらばらの ときは、 そのままでは かけ《算|ざん》に できない。',
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
      // わな：たす かずが ばらばら（R2-12）。 1つだけ ちがう もの（8 × 5 － 1 で とける）や、 ならすと 同じ かずに なる ものは のぞく
      trap(r) {
        const n = r.int(4, 5), v = Array.from({ length: n }, () => r.int(3, 9));
        const cnt = {};
        v.forEach(x => { cnt[x] = (cnt[x] || 0) + 1; });
        if (Object.keys(cnt).length < 3 || Math.max(...Object.values(cnt)) > 2) return null;
        const sum = v.reduce((x, y) => x + y, 0);
        if (sum % n === 0) return null;
        return { q: v.join(` ${P} `), a: String(sum), easy: '（たす かずが ばらばら）', key: ks(v) };
      },
    },
  });

  // ---------------------------------------------------------------- 1-34
  M.add({
    id: '1-34', part: 3, chap: '1-13', stars: 1,
    title: '《入|い》れかえても 《同|おな》じ',
    mark: 'いくつ《分|ぶん》の ほうが **おおきい**（2 × 9 など）。 《入|い》れかえても こたえは 《同|おな》じ。',
    futsu: ['2 × 9 を、 2の だんで', '2、 4、 6、 … 18 と', '9かい となえる。'],
    raku: ['9が 2つ と かんがえる。', '2 × 9 ＝ 9 × 2', '　　　＝ 9 ＋ 9 ＝ 18'],
    why: 'おはじきの 《四角|し|かく》を くるっと まわしても、 かずは かわらない（きょうかしょ 1-13）。',
    caution: '《同|おな》じ かずどうし（7 × 7）は、 《入|い》れかえても かわらない。',
    counts: { s1: 8, s2: 8, s3: 6, trap: 2 },
    // 2・3 × 大きい かず（2 × 9）／ 入れかえの □／ ひとり 2こずつ
    fits(q) {
      const k = mul2(q);
      if (k) return (k[0] === 2 || k[0] === 3) && k[1] > k[0] && k[1] < 100;
      let m = q.match(/^(\d+) × (\d+) ＝ (?:□ × (\d+)|(\d+) × □)$/);
      if (m) { const c = m[3] || m[4]; return c === m[1] || c === m[2]; }
      m = q.match(/^ひとり (\d+)こずつ、 (\d+)人で □こ$/);
      return !!m && (+m[1] === 2 || +m[1] === 3) && +m[2] > +m[1];
    },
    steps: {
      // 2・3 × 大きい かず → 入れかえて 大きい かずの だんで
      s1(r) {
        const a = r.int(2, 3), b = r.int(4, 9);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `${b} ${T} ${a}`, key: kx(a, b) };
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
          return { q: `ひとり ${a}こずつ、 ${nin(b)}で □こ`, a: String(a * b), easy: `${b} ${T} ${a}` };
        }
        const a = r.int(2, 3), b = r.int(10, 13);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `${b} ${T} ${a}`, key: kx(a, b) };
      },
      // わな：同じ かずどうし・もう 大きい ほうが まえ（入れかえても 楽に ならない。 ほかの わざの 行き先を 書く）
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.pick([3, 4, 5, 7]);
          return dest({ q: `${a} ${T} ${a}`, a: String(a * a), key: kx(a, a) }, '1-34', '《同|おな》じ かずどうし');
        }
        const [a, b] = r.pick([[3, 2], [4, 2], [4, 3], [5, 2], [6, 2], [6, 3], [7, 2]]);
        return dest({ q: `${a} ${T} ${b}`, a: String(a * b), key: kx(a, b) }, '1-34', 'もう 《大|おお》きい ほうが まえ');
      },
    },
  });

  // ---------------------------------------------------------------- 1-35
  M.add({
    id: '1-35', part: 3, chap: '1-12・1-13', stars: 1,
    title: 'いくつ《分|ぶん》が 1 ふえると',
    mark: '**1つ まえ** の 《九九|く|く》を しって いる。 いくつ《分|ぶん》が 1 ふえると、 1つ《分|ぶん》の かずだけ ふえる。',
    futsu: ['7 × 8 を、 7の だんを', '7、 14、 21、 … と', 'はじめから となえる。'],
    raku: ['7 × 7 ＝ 49 を つかう。', '7 × 8 ＝ 7 × 7 ＋ 7', '　　　＝ 49 ＋ 7 ＝ 56'],
    why: '7が 8こ は、 7が 7こ より 7が 1こ おおい（きょうかしょ 1-12・1-13）。',
    caution: 'たすのは 1では なく、 1つ《分|ぶん》の かず（49 ＋ 1 では ない）。 1つ《分|ぶん》の ほうが 1 ふえたら、 いくつ《分|ぶん》を たす。',
    cols: 1,
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    // 1つ まえの 九九が ある（a × b ＝ … だから、 a × (b＋1)）／ ×6・ましかくの となり（3 × 6、 7 × 8）
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
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `${a} ${T} ${b - 1} ${P} ${a}`, key: kx(a, b) };
      },
      // 表の そと・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const a = r.int(2, 9); return { q: `${a} ${T} 9 ${E} ${9 * a} だから、 ${a} ${T} 10 ${E} □`, a: String(10 * a), easy: `${9 * a} ${P} ${a}` }; }
        if (k === 1) { const a = r.int(2, 9); return { q: `${a} ${T} 10 ${E} ${10 * a} だから、 ${a} ${T} 11 ${E} □`, a: String(11 * a), easy: `${10 * a} ${P} ${a}` }; }
        const a = r.int(3, 9), b = r.int(4, 8), p = a * b;
        return { q: `${a}こずつ ${b}ふくろで ${p}こ。 ${b + 1}ふくろで □こ`, a: String(a * (b + 1)), easy: `${p} ${P} ${a}` };
      },
      // わな：ふえたのが 1つ分の ほう（たすのは いくつ分の かず）
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
    why: '1れつ 7こを 5こと 2こに 《分|わ》けても、 ぜんぶの かずは かわらない（きょうかしょ 1-13）。',
    caution: '1つ《分|ぶん》も いくつ《分|ぶん》も 5までの ときは、 《分|わ》けると かえって ながく なる。 そのまま つかおう。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 6〜9の だん（いくつ分が 6〜9 でも）／ × 11〜13 を 10と のこりに
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
      // 6〜9の だん：1つ分を 5と のこりに（いくつ分の 3・4 は ステップ2 に のこす）
      s1(r) {
        const a = r.int(6, 9), b = r.pick([2, 5, 6, 7, 8, 9]), c = a - 5;
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: `5 ${T} ${b} ${P} ${c} ${T} ${b}`, key: kx(a, b) };
      },
      // いくつ分が 6〜9：いくつ分を 5と のこりに（R2-7：1つ分は 3・4 だけ。 5の だんは 分けない）
      s2(r) {
        const b = r.int(3, 4), a = r.int(6, 9), c = a - 5;
        return { q: `${b} ${T} ${a}`, a: String(a * b), easy: `${b} ${T} 5 ${P} ${b} ${T} ${c}`, key: kx(a, b) };
      },
      // □を うめる・10と のこりに 分ける
      s3(r) {
        const k = r.int(0, 2), a = r.int(6, 9), b = r.int(2, 9);
        if (k === 0) return { q: `${a} ${T} ${b} ${E} □ ${P} ${(a - 5) * b}`, a: String(5 * b), easy: `5 ${T} ${b}` };
        if (k === 1) return { q: `${a} ${T} ${b} ${E} ${5 * b} ${P} □`, a: String((a - 5) * b), easy: `${a - 5} ${T} ${b}` };
        const c = r.int(2, 9), d = r.int(11, 13);
        return { q: `${c} ${T} ${d}`, a: String(c * d), easy: `${c} ${T} 10 ${P} ${c} ${T} ${d - 10}`, key: kx(c, d) };
      },
      // わな：5までの かずだけ（分けなくて よい）
      trap(r) {
        const [a, b] = r.pick([[2, 2], [3, 2], [3, 3], [4, 2], [4, 3], [4, 4], [5, 2], [5, 5]]);
        return dest({ q: `${a} ${T} ${b}`, a: String(a * b), key: kx(a, b) }, '1-36', '6〜9が ない');
      },
    },
  });

  // ---------------------------------------------------------------- 1-37（見本）
  M.add({
    id: '1-37', part: 3, chap: '1-13', stars: 1,
    title: '9の だんは 10の だんから ひく',
    mark: '**9の だん**（9 × □ や □ × 9）。 9は 10より 1 すくない。',
    futsu: ['9 × 7 は、 9の だんを', '9、 18、 27、 … と', 'じゅんに となえて さがす。'],
    raku: ['9 × 7 ＝ 10 × 7 － 7', '　　　 ＝ 70 － 7', '　　　 ＝ 63'],
    why: '9は 10より 1 すくないので、 9が 7こ は、 10が 7こ より 7 すくない。',
    caution: '9の だんで ない ときは、 《九九|く|く》の まま けいさん しよう。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: { s2: 1, s3: 1 },
    // × 9（もう 1つは 2〜12）／ 9 ＋ 9 ＋ 9／ 10 × 7 － □／ 9こ 入りの はこ
    fits(q) {
      if (either(mul2(q), (x, y) => x === 9 && y >= 2 && y <= 12)) return true;
      if (/^9 × (\d+) ＝ 10 × \1 － □$|^(\d+) × 9 ＝ \2 × 10 － □$|^9こ 入りの はこが \d+はこで □こ$/.test(q)) return true;
      const e = expr(q);
      return !!e && e.n.length >= 3 && e.o.every(o => o === P) && e.n.every(x => x === 9);
    },
    steps: {
      // 9 × 7・7 × 9（R2-8：× 1・× 10 は ださない）
      s1(r) {
        const n = r.int(2, 9);
        if (r.chance(0.5)) return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}`, key: kx(9, n) };
        return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n} ${T} 10 ${S} ${n}`, key: kx(9, n) };
      },
      // 9 ＋ 9 ＋ 9 を かけ算に／ 10の だんから ひく しきの □
      s2(r) {
        const k = r.int(0, 2), n = r.int(2, 9);
        if (k === 0) { const m = r.int(3, 6); return { q: rep(9, m), a: String(9 * m), easy: `10 ${T} ${m} ${S} ${m}` }; }
        if (k === 1) return { q: `9 ${T} ${n} ${E} 10 ${T} ${n} ${S} □`, a: String(n), easy: `10 ${T} ${n} ${S} ${n}`, val: 9 * n };
        return { q: `${n} ${T} 9 ${E} ${n} ${T} 10 ${S} □`, a: String(n), easy: `${n} ${T} 10 ${S} ${n}`, val: 9 * n };
      },
      // 九九の そと（× 11・× 12）・ことばの もんだい
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.int(11, 12);
          if (r.chance(0.5)) return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}`, key: kx(9, n) };
          return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n} ${T} 10 ${S} ${n}`, key: kx(9, n) };
        }
        const n = r.int(3, 9);
        return { q: `9こ 《入|い》りの はこが ${n}はこで □こ`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}` };
      },
      // わな：9の だんでは ない（ほかの わざの 行き先を 書く）
      trap(r) {
        const a = r.pick([6, 7, 8]), b = r.pick([2, 3, 7]);
        return dest({ q: `${a} ${T} ${b}`, a: String(a * b), key: kx(a, b) }, '1-37', '9の だんでは ない');
      },
    },
  });

  // ---------------------------------------------------------------- 1-38
  M.add({
    id: '1-38', part: 3, chap: '1-13', stars: 1,
    title: '4の だんは 2ばいの 2ばい',
    mark: '**4の だん**（4 × □ や □ × 4）。 4は 2と 2。',
    futsu: ['4 × 7 を、 4の だんを', '4、 8、 12、 … と', '7かい となえる。'],
    raku: ['2 × 7 ＝ 14 を 2ばい する。', '4 × 7 ＝ 2 × 7 ＋ 2 × 7', '　　　＝ 14 ＋ 14 ＝ 28'],
    why: '1れつ 4こは、 2こと 2こ。 2の だんの こたえを 2つ たせば よい（きょうかしょ 1-13）。',
    caution: '3の だんや 7の だんは、 2ばいの 2ばいでは ない。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: { s2: 1 },
    // × 4（もう 1つは 15まで）・× 8（2ばいの 2ばいの 2ばい）・2の だんから 4の だん
    fits(q) {
      let m = q.match(/^4 × (\d+) ＝ (\d+) ＋ □$/);
      if (m) return +m[2] === 2 * m[1];
      if (/^2 × (\d+) ＝ \d+ だから、 4 × \1 ＝ □$|^(\d+) × 2 ＝ \d+ だから、 \2 × 4 ＝ □$/.test(q)) return true;
      return either(mul2(q), (x, y) => (x === 4 && y >= 2 && y <= 15) || (x === 8 && y >= 3 && y <= 9));
    },
    steps: {
      s1(r) {
        const b = r.int(2, 9);
        if (r.chance(0.5)) return { q: `4 ${T} ${b}`, a: String(4 * b), easy: `${2 * b} ${P} ${2 * b}`, key: kx(4, b) };
        return { q: `${b} ${T} 4`, a: String(4 * b), easy: `${b} ${T} 2 ${P} ${b} ${T} 2`, key: kx(4, b) };
      },
      // 2の だんの こたえから（2ばい する）
      s2(r) {
        const b = r.int(2, 9);
        if (r.chance(0.5)) return { q: `2 ${T} ${b} ${E} ${2 * b} だから、 4 ${T} ${b} ${E} □`, a: String(4 * b), easy: `${2 * b} ${P} ${2 * b}` };
        return { q: `${b} ${T} 2 ${E} ${2 * b} だから、 ${b} ${T} 4 ${E} □`, a: String(4 * b), easy: `${2 * b} ${P} ${2 * b}` };
      },
      // 8の だん（2ばいの 2ばいの 2ばい）・九九の そと・□
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const b = r.intNot(3, 9, v => v === 4); return { q: `8 ${T} ${b}`, a: String(8 * b), easy: `${4 * b} ${P} ${4 * b}`, key: kx(8, b) }; }
        if (k === 1) { const b = r.int(10, 15); return { q: `4 ${T} ${b}`, a: String(4 * b), easy: `${2 * b} ${P} ${2 * b}`, key: kx(4, b) }; }
        const b = r.int(3, 9);
        return { q: `4 ${T} ${b} ${E} ${2 * b} ${P} □`, a: String(2 * b), easy: `2 ${T} ${b}` };
      },
      // わな：4の だんでは ない（ほかの わざの 行き先を 書く）
      trap(r) {
        const [a, b] = r.pick([[3, 2], [3, 3], [6, 2], [6, 3], [7, 2], [7, 3], [7, 7]]);
        return dest({ q: `${a} ${T} ${b}`, a: String(a * b), key: kx(a, b) }, '1-38', '4の だんでは ない');
      },
    },
  });

  // ---------------------------------------------------------------- 1-39
  const half = (n, w) => ({ easy: `${w}の はんぶん`, verify: () => w / 2 === n || 'はんぶん' });
  M.add({
    id: '1-39', part: 3, chap: '1-13', stars: 1,
    title: '5の だんは 10の だんの はんぶん',
    mark: '**5の だん**（5 × □ や □ × 5）。 5は 10の はんぶん。',
    futsu: ['5 × 8 を、 5の だんを', '5、 10、 15、 … と', '8かい となえる。'],
    raku: ['10 × 8 ＝ 80 を つかう。', '5 × 8 ＝ 80の はんぶん', '　　　＝ 40'],
    why: '5こは 10こ の はんぶん。 10の だんは 0を つけるだけ なので、 それを はんぶんに すれば よい。',
    caution: '5の だんで ない ときは つかえない。 5 ＋ 8 の ような たし《算|ざん》にも つかえない。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: { s2: 1 },
    boxw: '15mm',
    // × 5（もう 1つは 20まで）・5円玉・10の だんから 5の だん
    fits(q) {
      if (/^5円玉 \d+まいで □円$/.test(q)) return true;
      if (/^10 × (\d+) ＝ \d+ だから、 5 × \1 ＝ □$|^(\d+) × 10 ＝ \d+ だから、 \2 × 5 ＝ □$/.test(q)) return true;
      return either(mul2(q), (x, y) => x === 5 && y >= 2 && y <= 20);
    },
    steps: {
      s1(r) {
        const b = r.int(2, 9);
        if (r.chance(0.5)) return Object.assign({ q: `5 ${T} ${b}`, a: String(5 * b), key: kx(5, b) }, half(5 * b, 10 * b));
        return Object.assign({ q: `${b} ${T} 5`, a: String(5 * b), key: kx(5, b) }, half(5 * b, 10 * b));
      },
      // 10の だんの こたえから（はんぶんに する）
      s2(r) {
        const b = r.int(2, 9);
        if (r.chance(0.5)) return Object.assign({ q: `10 ${T} ${b} ${E} ${10 * b} だから、 5 ${T} ${b} ${E} □`, a: String(5 * b) }, half(5 * b, 10 * b));
        return Object.assign({ q: `${b} ${T} 10 ${E} ${10 * b} だから、 ${b} ${T} 5 ${E} □`, a: String(5 * b) }, half(5 * b, 10 * b));
      },
      // 九九の そと・お金
      s3(r) {
        if (r.chance(0.4)) { const b = r.int(3, 9); return Object.assign({ q: `5《円|えん》《玉|だま》 ${b}まいで □《円|えん》`, a: String(5 * b) }, half(5 * b, 10 * b)); }
        const b = r.pick([10, 12, 14, 16, 18, 20]);
        if (r.chance(0.5)) return Object.assign({ q: `5 ${T} ${b}`, a: String(5 * b), key: kx(5, b) }, half(5 * b, 10 * b));
        return Object.assign({ q: `${b} ${T} 5`, a: String(5 * b), key: kx(5, b) }, half(5 * b, 10 * b));
      },
      // わな：5 が あるが たし算（第3部の どの わざも 楽に しない）
      trap(r) {
        const b = r.intNot(3, 9, v => v === 5);
        const q = r.chance(0.5) ? `5 ${P} ${b}` : `${b} ${P} 5`;
        return { q, a: String(5 + b), easy: '（かけ《算|ざん》では ない）', key: ks([5, b]) };
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
      if (/^からの さら \d+まいに|^(\d+人|ふたり)に 1こずつで □こ$/.test(q)) return true;
      const k = mul2(q);
      return !!k && k.some(x => x === 0 || x === 1);
    },
    steps: {
      s1(r) {
        const a = r.int(2, 9), k = r.int(0, 3);
        if (k === 0) return { q: `0 ${T} ${a}`, a: '0', easy: '（0が ある）', key: kx(0, a) };
        if (k === 1) return { q: `${a} ${T} 0`, a: '0', easy: '（0が ある）', key: kx(0, a) };
        if (k === 2) return { q: `${a} ${T} 1`, a: String(a), easy: `${a}が 1つ《分|ぶん》`, key: kx(1, a) };
        return { q: `1 ${T} ${a}`, a: String(a), easy: `1が ${a}つ《分|ぶん》`, key: kx(1, a) };
      },
      // 2けたの かず
      s2(r) {
        const n = r.int(11, 99), k = r.int(0, 3);
        if (k === 0) return { q: `0 ${T} ${n}`, a: '0', easy: '（0が ある）', key: kx(0, n) };
        if (k === 1) return { q: `${n} ${T} 0`, a: '0', easy: '（0が ある）', key: kx(0, n) };
        if (k === 2) return { q: `${n} ${T} 1`, a: String(n), easy: `${n}が 1つ《分|ぶん》`, key: kx(1, n) };
        return { q: `1 ${T} ${n}`, a: String(n), easy: `1が ${n}こ`, key: kx(1, n) };
      },
      // □を もとめる・ことばの もんだい
      s3(r) {
        const a = r.int(2, 9), k = r.int(0, 3);
        if (k === 0) return { q: `${a} ${T} □ ${E} 0`, a: '0', easy: `${a} ${T} 0 ${E} 0` };
        if (k === 1) return { q: `${a} ${T} □ ${E} ${a}`, a: '1', easy: `（${a}が 1つ《分|ぶん》で ${a}）` };
        if (k === 2) return { q: `からの さら ${a}まいに、 あめは □こ`, a: '0', easy: `0 ${T} ${a}` };
        return { q: `${nin(a)}に 1こずつで □こ`, a: String(a), easy: `1 ${T} ${a}` };
      },
      // わな：0・1 を たす・ひく（× 10 は わざ 1-92 なので 出さない）
      trap(r) {
        const a = r.int(3, 9), k = r.int(0, 2);
        if (k === 0) return { q: `${a} ${P} 1`, a: String(a + 1), easy: '（たし《算|ざん》。 1 ふえる）', key: ks([a, 1]) };
        if (k === 1) return { q: `${a} ${P} 0`, a: String(a), easy: '（たし《算|ざん》。 かわらない）', key: ks([a, 0]) };
        return { q: `${a} ${S} 1`, a: String(a - 1), easy: '（ひき《算|ざん》。 1 へる）' };
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
    cols: { s3: 1 },
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
      s1(r) { const t = r.int(2, 9), b = r.int(2, 9); return { q: `${10 * t} ${T} ${b}`, a: String(10 * t * b), easy: `${t} ${T} ${b} ${T} 10`, key: kx(10 * t, b) }; },
      // 入れかえ・九九の こたえに 0が ある
      s2(r) {
        if (r.chance(0.4)) {
          const [t, b] = r.pick([[5, 2], [5, 4], [5, 6], [5, 8], [2, 5], [4, 5], [6, 5], [8, 5]]);
          return { q: `${10 * t} ${T} ${b}`, a: String(10 * t * b), easy: `${t} ${T} ${b} ${T} 10`, key: kx(10 * t, b) };
        }
        const t = r.int(2, 9), b = r.int(2, 9);
        return { q: `${b} ${T} ${10 * t}`, a: String(10 * t * b), easy: `${b} ${T} ${t} ${T} 10`, key: kx(10 * t, b) };
      },
      // なん百（こたえは 1000まで。 R2-33）・お金・□
      s3(r) {
        const k = r.int(0, 2), t = r.int(2, 9), b = r.int(2, 9);
        if (k === 0) {
          const h = r.int(2, 5), c = r.int(2, Math.floor(10 / h));
          return { q: `${100 * h} ${T} ${c}`, a: String(100 * h * c), easy: `${h * c} ${T} 100`, key: kx(100 * h, c) };
        }
        if (k === 1) return { q: `${10 * t}《円|えん》の ノート ${b}さつで □《円|えん》`, a: String(10 * t * b), easy: `${t * b} ${T} 10` };
        return { q: `${10 * t} ${T} □ ${E} ${10 * t * b}`, a: String(b), easy: `（${t} ${T} ${b} ${E} ${t * b}）` };
      },
      // わな：なん十では ない（わざ 1-42 へ）・たし算
      trap(r) {
        if (r.chance(0.5)) {
          const n = r.intNot(22, 49, not10), b = r.int(2, 4);
          return dest({ q: `${n} ${T} ${b}`, a: String(n * b), key: kx(n, b) }, '1-41', 'なん《十|じゅう》では ない');
        }
        const t = r.int(2, 9), b = r.int(2, 9);
        return { q: `${10 * t} ${P} ${b}`, a: String(10 * t + b), easy: '（かけ《算|ざん》では ない）', key: ks([10 * t, b]) };
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
    why: '7の だんを 5と 2に 《分|わ》けたのと 《同|おな》じ（きょうかしょ 1-13）。 20 × 4 は わざ 1-41。',
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
        return { q: `${n} ${T} ${b}`, a: String(n * b), easy: `${t} ${T} ${b} ${P} ${u} ${T} ${b}`, key: kx(n, b) };
      },
      s2(r) {
        const n = r.intNot(12, 98, not10), b = r.int(2, 9), t = n - n % 10, u = n % 10;
        if (r.chance(0.5)) return { q: `${b} ${T} ${n}`, a: String(n * b), easy: `${b} ${T} ${t} ${P} ${b} ${T} ${u}`, key: kx(n, b) };
        return { q: `${n} ${T} ${b}`, a: String(n * b), easy: `${t * b} ${P} ${u * b}`, key: kx(n, b) };
      },
      // お金・3けた
      s3(r) {
        if (r.chance(0.5)) {
          const n = r.intNot(12, 49, not10), b = r.int(2, 6), t = n - n % 10, u = n % 10;
          return { q: `${n}《円|えん》の あめ ${b}こで □《円|えん》`, a: String(n * b), easy: `${t * b} ${P} ${u * b}` };
        }
        const n = r.intNot(111, 149, v => v % 10 === 0 || v % 100 < 10), b = r.int(2, 4), t = n % 100 - n % 10, u = n % 10;
        return { q: `${n} ${T} ${b}`, a: String(n * b), easy: `${100 * b} ${P} ${t * b} ${P} ${u * b}`, key: kx(n, b) };
      },
      // わな：一の くらいが 0（わざ 1-41 へ）・× 1（わざ 1-40 へ）
      trap(r) {
        if (r.chance(0.5)) {
          const t = r.int(2, 9), b = r.int(2, 9);
          return dest({ q: `${10 * t} ${T} ${b}`, a: String(10 * t * b), key: kx(10 * t, b) }, '1-42', '《一|いち》の くらいが 0');
        }
        const n = r.intNot(12, 98, not10);
        return dest({ q: `${n} ${T} 1`, a: String(n), key: kx(n, 1) }, '1-42', '1を かけても かわらない');
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
    // 2けた × 9／ 1けた × 99・× 19
    fits(q) {
      return either(mul2(q), (x, y) => (x === 9 && y >= 11 && y <= 99 && y % 10 !== 0) || ((x === 99 || x === 19) && y >= 2 && y <= 9));
    },
    steps: {
      s1(r) { const n = r.intNot(12, 59, not10); return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n * 10} ${S} ${n}`, key: kx(9, n) }; },
      s2(r) { const n = r.intNot(12, 98, not10); return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `${n * 10} ${S} ${n}`, key: kx(9, n) }; },
      // × 99・× 19（R2-33・H-4：4けたの ひき算に ならない ように、 かけるのは 1けた）
      s3(r) {
        if (r.chance(0.5)) { const n = r.int(2, 9); return { q: `${n} ${T} 99`, a: String(99 * n), easy: `${n * 100} ${S} ${n}`, key: kx(99, n) }; }
        const n = r.intNot(3, 9, v => v === 5); return { q: `${n} ${T} 19`, a: String(19 * n), easy: `${n * 20} ${S} ${n}`, key: kx(19, n) };
      },
      // わな：× 8（わざ 1-42 へ）
      trap(r) {
        const n = r.intNot(13, 49, v => not10(v) || v === 19 || v === 21);
        return dest({ q: `${n} ${T} 8`, a: String(8 * n), key: kx(8, n) }, '1-43', '9では なく 8');
      },
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
    // × 11／ 1けた × 101・× 21
    fits(q) {
      return either(mul2(q), (x, y) => (x === 11 && y >= 2 && y <= 99 && y % 10 !== 0) || ((x === 101 || x === 21) && y >= 2 && y <= 9));
    },
    steps: {
      s1(r) { const n = r.intNot(12, 59, not10); return { q: `${n} ${T} 11`, a: String(11 * n), easy: `${n * 10} ${P} ${n}`, key: kx(11, n) }; },
      s2(r) { const n = r.intNot(12, 89, not10); return { q: `11 ${T} ${n}`, a: String(11 * n), easy: `${n * 10} ${P} ${n}`, key: kx(11, n) }; },
      // × 101・× 21（かけるのは 1けた。 R2-33）
      s3(r) {
        if (r.chance(0.5)) { const n = r.int(2, 9); return { q: `${n} ${T} 101`, a: String(101 * n), easy: `${n * 100} ${P} ${n}`, key: kx(101, n) }; }
        const n = r.intNot(3, 9, v => v === 5); return { q: `${n} ${T} 21`, a: String(21 * n), easy: `${n * 20} ${P} ${n}`, key: kx(21, n) };
      },
      // わな：11を たす（R2-11：× 12 は 第1巻に ない 2けた × 2けたなので 出さない）
      trap(r) {
        const n = r.intNot(12, 49, not10);
        const q = r.chance(0.5) ? `${n} ${P} 11` : `11 ${P} ${n}`;
        return { q, a: String(n + 11), easy: '（かけ《算|ざん》では ない。 10 たして 1 たす）', key: ks([n, 11]) };
      },
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
    boxw: '15mm',
    // 2けた（なん十で ない） × 5・2けたの ぐうすう × 50
    fits(q) {
      const m = q.match(/^(\d+) × 5 ＝ □ × 10$/);
      if (m) return +m[1] % 2 === 0;
      return either(mul2(q), (x, y) => (x === 5 && y >= 11 && y <= 99 && y % 10 !== 0) || (x === 50 && y >= 11 && y <= 99 && y % 2 === 0));
    },
    steps: {
      s1(r) { const n = r.intNot(12, 48, v => v % 2 || not10(v)); return Object.assign({ q: `${n} ${T} 5`, a: String(5 * n), key: kx(5, n) }, half(5 * n, 10 * n)); },
      s2(r) { const n = r.intNot(12, 98, v => v % 2 || not10(v)); return Object.assign({ q: `5 ${T} ${n}`, a: String(5 * n), key: kx(5, n) }, half(5 * n, 10 * n)); },
      // 一の くらいが 奇数・× 50・さきに はんぶん
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const n = r.intNot(13, 49, v => !(v % 2) || v % 10 === 5); return Object.assign({ q: `${n} ${T} 5`, a: String(5 * n), key: kx(5, n) }, half(5 * n, 10 * n)); }
        if (k === 1) { const n = r.intNot(12, 18, v => v % 2); return Object.assign({ q: `${n} ${T} 50`, a: String(50 * n), key: kx(50, n) }, half(50 * n, 100 * n)); }
        const n = r.intNot(12, 48, v => v % 2 || not10(v));
        return { q: `${n} ${T} 5 ${E} □ ${T} 10`, a: String(n / 2), easy: `（${n}の はんぶん）` };
      },
      // わな：× 6（わざ 1-42 へ）
      trap(r) {
        const n = r.intNot(12, 48, v => not10(v) || v === 19 || v === 21);
        return dest({ q: `${n} ${T} 6`, a: String(6 * n), key: kx(6, n) }, '1-45', '× 5 では ない');
      },
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
      // 2と 5（まんなかは 1けたか 11〜19）
      s1(r) {
        const a = r.pick([3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19]);
        const q = r.pick([`2 ${T} ${a} ${T} 5`, `5 ${T} ${a} ${T} 2`]);
        return { q, a: String(10 * a), easy: `10 ${T} ${a}`, key: kx(2, 5, a) };
      },
      // 4と 25
      s2(r) {
        const a = r.pick([2, 3, 4, 6, 7, 8, 9, 11, 12]);
        const q = r.pick([`4 ${T} ${a} ${T} 25`, `25 ${T} ${a} ${T} 4`]);
        return { q, a: String(100 * a), easy: `100 ${T} ${a}`, key: kx(4, 25, a) };
      },
      // かくれた 2・4つの かず・20と 5
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const h = r.int(6, 9); return { q: `${2 * h} ${T} 5`, a: String(10 * h), easy: `${h} ${T} 2 ${T} 5 ${E} ${h} ${T} 10`, key: kx(2 * h, 5) }; }
        if (k === 1) { const a = r.int(2, 4), b = r.int(2, 4); return { q: `2 ${T} ${a} ${T} 5 ${T} ${b}`, a: String(10 * a * b), easy: `10 ${T} ${a * b}`, key: kx(2, a, 5, b) }; }
        const a = r.int(3, 9);
        return { q: `20 ${T} ${a} ${T} 5`, a: String(100 * a), easy: `100 ${T} ${a}`, key: kx(20, a, 5) };
      },
      // わな：たし算が まざる・どの 2つを かけても 10・100に ならない（R2-10：5 × 9 × 3 の ような、 わざ 1-45 で とける ものは 出さない）
      trap(r) {
        const a = r.pick([3, 7, 9]);
        if (r.chance(0.5)) return { q: `2 ${T} ${a} ${P} 5`, a: String(2 * a + 5), easy: '（＋ が あるので じゅんばんを かえられない）' };
        const b = r.pick([3, 4, 6, 7, 8, 9]), c = r.pick([3, 4, 6]);
        return { q: `2 ${T} ${b} ${T} ${c}`, a: String(2 * b * c), easy: '（どの 2つを かけても 10・100に ならない）', key: kx(2, b, c) };
      },
    },
  });

  // ---------------------------------------------------------------- 1-47
  const A47 = [2, 3, 4, 6, 7, 8];   // R2-37：5 × 5 ＋ 5 × 5 の ような 同じ 項の 和は 出さない
  M.add({
    id: '1-47', part: 3, chap: '1-13', stars: 2,
    title: '《同|おな》じ かずを かける ところを まとめる',
    mark: '＋ の まえと うしろで、 **おなじ かず** を かけて いる。',
    futsu: ['7 × 6 ＋ 3 × 6 を、', '42 ＋ 18 と けいさん して', 'から たす。'],
    raku: ['どちらも × 6。 7と 3で 10。', '7 × 6 ＋ 3 × 6 ＝ 10 × 6', '　　　　　　 ＝ 60'],
    why: '7こ 6れつと 3こ 6れつを あわせると、 10こ 6れつ（きょうかしょ 1-13 「だんを たして つくる」）。',
    caution: 'おなじ かずが ない とき（7 × 6 ＋ 3 × 5）は まとめられない。',
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
        const a = r.pick(A47), c = r.int(2, 9);
        return { q: `${a} ${T} ${c} ${P} ${10 - a} ${T} ${c}`, a: String(10 * c), easy: `10 ${T} ${c}`, key: k47(P, a, c, 10 - a, c) };
      },
      // 同じ かずが まえに ある・ばらばら
      s2(r) {
        const a = r.pick(A47), c = r.int(2, 9);
        if (r.chance(0.5)) return { q: `${c} ${T} ${a} ${P} ${c} ${T} ${10 - a}`, a: String(10 * c), easy: `${c} ${T} 10`, key: k47(P, a, c, 10 - a, c) };
        return { q: `${a} ${T} ${c} ${P} ${c} ${T} ${10 - a}`, a: String(10 * c), easy: `10 ${T} ${c}`, key: k47(P, a, c, 10 - a, c) };
      },
      // 20・100に なる・ひき算
      s3(r) {
        const k = r.int(0, 2), c = r.int(2, 9);
        if (k === 0) { const a = r.intNot(11, 19, v => v === 10); return { q: `${a} ${T} ${c} ${P} ${20 - a} ${T} ${c}`, a: String(20 * c), easy: `20 ${T} ${c}`, key: k47(P, a, c, 20 - a, c) }; }
        if (k === 1) { const a = r.intNot(21, 79, v => not10(v) || v === 50); return { q: `${a} ${T} ${c} ${P} ${100 - a} ${T} ${c}`, a: String(100 * c), easy: `100 ${T} ${c}`, key: k47(P, a, c, 100 - a, c) }; }
        const b = r.int(1, 5);
        return { q: `${10 + b} ${T} ${c} ${S} ${b} ${T} ${c}`, a: String(10 * c), easy: `10 ${T} ${c}` };
      },
      // わな：おなじ かずが ない（R2-4：4 × 6 ＋ 6 × 5 の ように、 2つの 項に 同じ かずが ある ものは 出さない）
      trap(r) {
        const a = r.pick(A47), b = 10 - a, c = r.int(2, 9), d = r.int(2, 9);
        if (c === d || c === b || a === d) return null;
        return { q: `${a} ${T} ${c} ${P} ${b} ${T} ${d}`, a: String(a * c + b * d), easy: '（おなじ かずが ない）', key: k47(P, a, c, b, d) };
      },
    },
  });

  // ---------------------------------------------------------------- 1-48
  M.add({
    id: '1-48', part: 3, chap: '1-13', stars: 2,
    title: 'まんなかの かずを はさむ かけ《算|ざん》',
    mark: 'かけ《算|ざん》の 2つの かずが **2 ちがい**（6と 8）。 まんなかに 7が ある。',
    futsu: ['6 × 8 を、 6の だんを', '6、 12、 18、 … と', '8かい となえる。'],
    raku: ['6 × 8 ＝ 7 × 7 － 1', '　　　＝ 49 － 1 ＝ 48', '4 ちがい なら 2 × 2 ＝ 4 を ひく。', '5 × 9 ＝ 7 × 7 － 4 ＝ 45'],
    why: '2 ちがいの かけ《算|ざん》は、 まんなかの かずの ましかく（7 × 7）より 1 すくない（きょうかしょ 1-13 ななめの きまり）。',
    caution: '5 × 8 の ように、 まんなかの かずが ない ときは つかえない。 20 × 20 ＝ 400 は 2 × 2 の 100ばい。',
    counts: { s1: 7, s2: 5, s3: 6, trap: 2 },
    cols: { s1: 1, s2: 1 },
    // 2 ちがい・4 ちがいで、 まんなかの ましかくを しって いる（まんなかが 4〜9）／ まんなかが 10・20／ ましかくが 書いて ある
    fits(q) {
      const g = q.match(/^(\d+) × \1 ＝ \d+ だから、 (\d+) × (\d+) ＝ □$/);
      if (g) return +g[2] + +g[3] === 2 * +g[1] && g[2] !== g[3];
      const k = mul2(q);
      if (!k) return false;
      const a = Math.min(k[0], k[1]), b = Math.max(k[0], k[1]), d = b - a, m = (a + b) / 2;
      if (d < 2 || d % 2) return false;
      if (m === 10 || m === 20) return d <= 8;
      return m <= 9 && d <= 4 && a >= 3;
    },
    steps: {
      // まんなかの ましかくを つかう（書いて ある ときと、 じぶんで 出す とき）
      s1(r) {
        const m = r.int(4, 8), [x, y] = r.chance(0.5) ? [m - 1, m + 1] : [m + 1, m - 1];
        if (r.chance(0.5)) return { q: `${m} ${T} ${m} ${E} ${m * m} だから、 ${x} ${T} ${y} ${E} □`, a: String(x * y), easy: `${m * m} ${S} 1`, key: `g2:${m}` };
        return { q: `${x} ${T} ${y}`, a: String(x * y), easy: `${m} ${T} ${m} ${S} 1`, key: kx(x, y) };
      },
      // 4 ちがい（まんなかの ましかくより 4 すくない）
      s2(r) {
        const m = r.int(5, 7), [x, y] = r.chance(0.5) ? [m - 2, m + 2] : [m + 2, m - 2];
        if (r.chance(0.5)) return { q: `${m} ${T} ${m} ${E} ${m * m} だから、 ${x} ${T} ${y} ${E} □`, a: String(x * y), easy: `${m * m} ${S} 4`, key: `g4:${m}` };
        return { q: `${x} ${T} ${y}`, a: String(x * y), easy: `${m} ${T} ${m} ${S} 4`, key: kx(x, y) };
      },
      // まんなかが 10・20（R2-13・H-4：30 × 30 の ような なん十 × なん十は 出さない）
      s3(r) {
        const [m, d] = r.pick([[10, 1], [10, 2], [10, 3], [20, 1], [20, 2], [20, 3], [20, 4]]);
        const [x, y] = r.chance(0.5) ? [m - d, m + d] : [m + d, m - d];
        const easy = m === 10 ? `100 ${S} ${d * d}` : `20 ${T} 20 ${S} ${d * d} ${E} 400 ${S} ${d * d}`;
        return { q: `${x} ${T} ${y}`, a: String(x * y), easy, key: kx(x, y) };
      },
      // わな：まんなかが ない（1 ちがい・3 ちがい）。 ほかの わざの 行き先を 書く
      trap(r) {
        const [a, b] = r.pick([[4, 3], [6, 3], [4, 7], [7, 4], [6, 7], [7, 6], [5, 2]]);
        return dest({ q: `${a} ${T} ${b}`, a: String(a * b), key: kx(a, b) }, '1-48', 'まんなかの かずが ない');
      },
    },
  });

  // ---------------------------------------------------------------- 1-92（第29回 H-9：1-13 の 先）
  M.add({
    id: '1-92', part: 3, chap: '1-13', stars: 2,
    title: '× 10 は 0を つける',
    mark: '**10** を かけて いる。 10ばいは、 うしろに **0を 1つ** つける。',
    futsu: ['23 × 10 を、', '23 ＋ 23 ＋ 23 ＋ … と', '10かい たす。'],
    raku: ['23が 10こ。', '23 × 10 ＝ 230', 'うしろに 0を つけた。'],
    why: '10ばいすると、 どの くらいの 《数字|すう|じ》も 1つ 《上|うえ》の くらいに うつる（きょうかしょ 1-13 の 3 × 10 ＝ 30 と 《同|おな》じ）。',
    caution: '× 10 と ＋ 10 を まちがえない（23 ＋ 10 は 33）。 × 100 なら 0を 2つ つける。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s3: 1 },
    boxw: '15mm',
    // × 10（なん十 × 10 は のぞく）・1けた × 100・□ × 10・10円玉
    fits(q) {
      if (/^□ × 10 ＝ \d+0$|^10円玉 \d+まいで □円$|^1こ \d+円の あめを 10こで □円$/.test(q)) return true;
      return either(mul2(q), (x, y) => (x === 10 && y >= 2 && y <= 99 && !(y >= 20 && y % 10 === 0)) || (x === 100 && y >= 2 && y <= 9));
    },
    steps: {
      // 2けた × 10（なん十は のぞく。 H-4）
      s1(r) {
        const n = r.chance(0.2) ? r.int(2, 9) : r.intNot(11, 99, not10);
        return { q: `${n} ${T} 10`, a: String(10 * n), easy: `${n}の うしろに 0`, key: kx(n, 10), verify: () => +`${n}0` === 10 * n || '0を つける' };
      },
      // 10 × 23・□ × 10
      s2(r) {
        const n = r.intNot(11, 99, not10);
        if (r.chance(0.6)) return { q: `10 ${T} ${n}`, a: String(10 * n), easy: `${n}の うしろに 0`, key: kx(n, 10), verify: () => +`${n}0` === 10 * n || '0を つける' };
        return { q: `□ ${T} 10 ${E} ${10 * n}`, a: String(n), easy: `（${10 * n}の 0を とる）`, key: kx(n, 10) };
      },
      // × 100・お金
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) { const n = r.int(2, 9); return { q: `${n} ${T} 100`, a: String(100 * n), easy: `${n}の うしろに 0を 2つ`, key: kx(n, 100), verify: () => +`${n}00` === 100 * n || '0を つける' }; }
        if (k === 1) { const n = r.intNot(11, 49, not10); return { q: `10《円|えん》《玉|だま》 ${n}まいで □《円|えん》`, a: String(10 * n), easy: `${n} ${T} 10` }; }
        const n = r.intNot(12, 49, not10);
        return { q: `1こ ${n}《円|えん》の あめを 10こで □《円|えん》`, a: String(10 * n), easy: `${n} ${T} 10` };
      },
      // わな：10を たす（第3部の どの わざも 楽に しない）
      trap(r) {
        const n = r.intNot(12, 89, not10);
        const q = r.chance(0.5) ? `${n} ${P} 10` : `10 ${P} ${n}`;
        return { q, a: String(n + 10), easy: '（たし《算|ざん》。 10 ふえるだけ）', key: ks([n, 10]) };
      },
    },
  });
})(globalThis.MONDAI);
