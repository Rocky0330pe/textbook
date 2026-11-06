/* 問題集 第1巻　第1部 ひき算（わざ 1-14〜1-25）　組 b
 * 書き方は v1/README.md。文は第1巻の教科書と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。
 * 答えは作るときに決める。楽な形（easy）は、そのわざの考え方で書いた式にする。 */
(function (M) {
  'use strict';
  const P = '＋', S = '－';

  // ---------------------------------------------------------------- 見わけよう（fits）の 部品
  // fits(q)：ほかの わざの 問題でも、 この わざが つかえるか（q は ルビを とった 問題の 文。 README 2章）
  // 式だけの 問題（「a ＋ b － c」）を 数と 記号に わける。 □・ことば・＝ が あれば null
  const expr = q => {
    if (!/^\d+(\.\d+)?( [＋－×÷] \d+(\.\d+)?)+$/.test(q)) return null;
    const t = q.split(' ');
    return { n: t.filter((_, i) => i % 2 === 0).map(Number), o: t.filter((_, i) => i % 2 === 1) };
  };
  // たし算だけの 式の 数。 ちがえば null
  const adds = q => { const e = expr(q); return e && e.o.every(o => o === P) ? e.n : null; };
  // ひき算 a － b の [a, b]（式・「a － □ ＝ c」・「おつりは」「のこりは」の ことばの もんだい）。 ちがえば null
  const subs = q => {
    const e = expr(q);
    if (e) return e.n.length === 2 && e.o[0] === S ? e.n : null;
    const m = q.match(/^(\d+) － □ ＝ (\d+)$/);
    if (m) return [+m[1], +m[2]];
    if (/(おつりは|のこりは) □/.test(q)) { const n = (q.match(/\d+/g) || []).map(Number); if (n.length === 2) return n; }
    return null;
  };
  // 「□ ＋ b ＝ c」「b ＋ □ ＝ c」を ひき算 c － b と みる [c, b]。 ちがえば null
  const boxSub = q => { const m = q.match(/^(?:□ ＋ (\d+)|(\d+) ＋ □) ＝ (\d+)$/); return m ? [+m[3], +(m[1] || m[2])] : null; };
  // なん十 － なん十 で 100を こえる（130 － 50）の [13, 5]。 ちがえば null
  const tens = (a, b) => (a > 100 && a < 200 && a % 10 === 0 && b % 10 === 0 && b <= 90 ? [a / 10, b / 10] : null);
  // a － b で、 どこかの くらいが くり下がる
  const borrow = (a, b) => { for (let x = a, y = b; y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10)) if (x % 10 < y % 10) return true; return false; };
  const KURI = 'くり《下|さ》がらない';
  // 入れかえた だけの たし算（29 ＋ 32 ＋ 29 と 29 ＋ 29 ＋ 32）は、 同じ 問題と みる（第29回 H-6）。
  // 式だけの たし算には、 数を 小さい 順に ならべた key を つける（core.js の makeStep が p.key で 同じかを 見る）
  const addKey = q => { const n = adds(M.plain(q)); return n ? P + n.slice().sort((x, y) => x - y).join(' ') : null; };
  const add = def => {
    for (const s of Object.keys(def.steps)) {
      const f = def.steps[s];
      def.steps[s] = r => { const p = f(r); if (p && !p.key) { const k = addKey(p.q); if (k) p.key = k; } return p; };
    }
    M.add(def);
  };

  // ------------------------------------------------------------ 1-14
  add({
    id: '1-14', part: 1, chap: '1-5', stars: 1,
    title: '10から ひいて たす',
    mark: 'ばらから ひけない。 ひく かずが ばらより **3 いじょう 《大|おお》きい** ときは、 10から ひいて ばらを たす。',
    futsu: ['13 － 8 を、 13から', '12、 11、 10、 … と', '8かい もどって かぞえる。'],
    raku: ['13は 10と 3。 10から 8を ひく。', '13 － 8 ＝ 10 － 8 ＋ 3', '　　　 ＝ 2 ＋ 3 ＝ 5'],
    why: '13は 10の まとまりと ばら 3。 10から ひくと、 10に なる くみで すぐ わかる（きょうかしょ 1-5）。',
    caution: 'ばらから ひける とき（15 － 3 など）は、 ばらから そのまま ひこう。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // くり下がる 1けたの ひき算（13 － 8、 43 － 6、 130 － 80）
    fits(q) {
      const s = subs(q);
      if (!s) return false;
      const [a, b] = tens(s[0], s[1]) || s;
      return b >= 1 && b <= 9 && a > 10 && a % 10 < b;
    },
    steps: {
      // 10いくつ － 1けた（ひく かずが ばらより 3 いじょう 大きい。 1〜2 なら わざ 1-15。 R1-17）
      s1(r) {
        const y = r.int(5, 9), x = r.int(1, y - 3), a = 10 + x;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy: `10 ${S} ${y} ${P} ${x}` };
      },
      // 2けた － 1けたで、 くり下がる（43 は 30と 13）
      s2(r) {
        const t = r.int(2, 9), x = r.int(0, 6), y = r.int(Math.max(x + 3, 5), 9), a = 10 * t + x, h = 10 * (t - 1);
        const easy = x ? `${h} ${P} 10 ${S} ${y} ${P} ${x}` : `${h} ${P} 10 ${S} ${y}`;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy };
      },
      // なん十の ひき算（10が 13こ － 8こ）と、 □を もとめる ひき算
      s3(r) {
        const y = r.int(4, 9), x = r.int(1, y - 3), a = 10 + x;
        if (r.chance(0.5)) {
          return { q: `${a * 10} ${S} ${y * 10}`, a: String((a - y) * 10), easy: `100 ${S} ${y * 10} ${P} ${x * 10} ＝ ${(10 - y) * 10} ${P} ${x * 10}` };
        }
        const z = a - y;
        return { q: `${a} ${S} □ ＝ ${z}`, a: String(y), easy: `${a} ${S} ${z} ＝ 10 ${S} ${z} ${P} ${x}` };
      },
      // ばらから そのまま ひける
      trap(r) {
        const t = r.int(1, 8), x = r.int(3, 9), y = r.int(2, x), a = 10 * t + x;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy: `（ばらの ${x}から ${y}が ひける）` };
      },
    },
  });

  // ------------------------------------------------------------ 1-15
  add({
    id: '1-15', part: 1, chap: '1-5', stars: 1,
    title: 'ばらから ひいて、 のこりを 10から',
    mark: 'ひく かずが ばらより **1か 2** 《大|おお》きい。 ひく かずを、 ばらと おなじ かずと のこりに わける。',
    futsu: ['13 － 4 を、 13から', '12、 11、 10、 9 と', '4かい もどって かぞえる。'],
    raku: ['4を 3と 1に わける。', '13 － 4 ＝ 13 － 3 － 1', '　　　 ＝ 10 － 1 ＝ 9'],
    why: 'さきに ばらを ぜんぶ ひくと、 ちょうど 10に なる。 10から ひくのは かんたん（きょうかしょ 1-5）。',
    caution: 'ばらから ひける ときは わけなくて よい。 ひく かずが ばらより 3 いじょう 《大|おお》きい ときは、 10から ひく（わざ 1-14）ほうが らく。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // くり下がる 1けたの ひき算で、 ひく かずが ばらより 1〜2 大きい（13 － 4、 53 － 5）
    fits(q) {
      const s = subs(q);
      if (!s) return false;
      const [a, b] = tens(s[0], s[1]) || s, x = a % 10;
      return b >= 1 && b <= 9 && a > 10 && x >= 1 && x < b && b - x <= 2;
    },
    steps: {
      // 10いくつ － 1けた（ばらより 1〜2 大きい かずを ひく）
      s1(r) {
        const x = r.int(1, 7), k = r.int(1, Math.min(2, 9 - x)), y = x + k, a = 10 + x;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy: `${a} ${S} ${x} ${S} ${k}` };
      },
      // 2けた － 1けた（53 － 5 ＝ 53 － 3 － 2）
      s2(r) {
        const t = r.int(2, 9), x = r.int(1, 7), k = r.int(1, Math.min(2, 9 - x)), y = x + k, a = 10 * t + x;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy: `${a} ${S} ${x} ${S} ${k}` };
      },
      // なん十の ひき算（130 － 50）と、 100を こえる かず（104 － 6）
      s3(r) {
        const x = r.int(1, 7), k = r.int(1, Math.min(2, 9 - x)), y = x + k;
        if (r.chance(0.5)) {
          const a = (10 + x) * 10;
          return { q: `${a} ${S} ${y * 10}`, a: String(a - y * 10), easy: `${a} ${S} ${x * 10} ${S} ${k * 10} ＝ 100 ${S} ${k * 10}` };
        }
        const h = r.pick([100, 100, 200, 300]), a = h + x;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy: `${a} ${S} ${x} ${S} ${k} ＝ ${h} ${S} ${k}` };
      },
      // ばらから そのまま ひける（15 － 4 は 13 － 4 に にて いるが、 わけなくて よい）
      trap(r) {
        const t = r.int(1, 9), x = r.int(4, 9), y = r.int(x - 2, x - 1), a = 10 * t + x;
        return { q: `${a} ${S} ${y}`, a: String(a - y), easy: '（ばらから ひける。 そのまま）' };
      },
    },
  });

  // ------------------------------------------------------------ 1-16
  add({
    id: '1-16', part: 1, chap: '1-7', stars: 1,
    title: '9を ひくときは 10を ひいて 1 たす',
    mark: 'ひく かずが **9**。 9は 10より 1 すくない。',
    futsu: ['52 － 9 を ひっ《算|さん》で。', '2から 9は ひけないので、', '《十|じゅう》の くらいから くり《下|さ》げる。'],
    raku: ['52 － 9 ＝ 52 － 10 ＋ 1', '　　　 ＝ 42 ＋ 1', '　　　 ＝ 43'],
    why: '10 ひくと、 9より 1 おおく ひいた ことに なる。 おおく ひいた 1を もどす。',
    caution: '10 ひいたら、 1を ひくのでは なく、 1を たして もどす。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // － 9（19・29 …、 90）で くり下がる
    fits(q) {
      const s = subs(q) || boxSub(q);
      if (!s) return false;
      const [a, b] = s;
      if (b % 10 === 9 && b < 90) return a >= b + 2 && a % 10 !== 9;
      return b === 90 && a > 100 && a % 10 === 0 && (a / 10) % 10 !== 9;
    },
    steps: {
      s1(r) {
        const a = r.intNot(11, 98, v => v % 10 === 9);
        return { q: `${a} ${S} 9`, a: String(a - 9), easy: `${a} ${S} 10 ${P} 1` };
      },
      // 19・29・39 を ひく（20・30・40 を ひいて 1 たす）
      s2(r) {
        const b = r.pick([19, 29, 39, 49]), a = r.intNot(b + 3, 98, v => v % 10 === 9);
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${a} ${S} ${b + 1} ${P} 1` };
      },
      // □を もとめる（□ ＋ 9 ＝ 52）、 3けた － 9、 なん十 － 90
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.intNot(21, 98, v => v % 10 === 9);
          return { q: `□ ${P} 9 ＝ ${a}`, a: String(a - 9), easy: `${a} ${S} 10 ${P} 1 ＝ ${a - 10} ${P} 1` };
        }
        if (k === 1) {
          const a = r.intNot(101, 998, v => v % 10 === 9 || v % 100 < 10);
          return { q: `${a} ${S} 9`, a: String(a - 9), easy: `${a} ${S} 10 ${P} 1 ＝ ${a - 10} ${P} 1` };
        }
        const a = r.int(11, 18) * 10;
        return { q: `${a} ${S} 90`, a: String(a - 90), easy: `${a} ${S} 100 ${P} 10 ＝ ${a - 100} ${P} 10` };
      },
      // ばらが 9（そのまま ひける。 2けた・3けた）
      trap(r) {
        const a = r.chance(0.5) ? r.int(2, 9) * 10 + 9 : r.int(10, 99) * 10 + 9;
        return { q: `${a} ${S} 9`, a: String(a - 9), easy: '（ばらが 9。 そのまま）' };
      },
    },
  });

  // ------------------------------------------------------------ 1-17
  add({
    id: '1-17', part: 1, chap: '1-7', stars: 2,
    title: '99を ひくときは 100を ひいて 1 たす',
    mark: 'ひく かずが **99**。 99は 100より 1 すくない。',
    futsu: ['245 － 99 を ひっ《算|さん》で。', '《一|いち》の くらいも 《十|じゅう》の くらいも', 'くり《下|さ》がって たいへん。'],
    raku: ['245 － 99 ＝ 245 － 100 ＋ 1', '　　　　 ＝ 145 ＋ 1', '　　　　 ＝ 146'],
    why: '100 ひくと、 99より 1 おおく ひいた ことに なる。 その 1を たして もどす（わざ 1-16と おなじ）。',
    caution: 'くり《下|さ》がりが ない とき（299 － 99 など）は、 そのまま ひけば よい。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // － 97・98・99（199・999 …）で くり下がる
    fits(q) {
      const s = subs(q) || boxSub(q);
      if (!s) return false;
      const [a, b] = s;
      if (a <= b) return false;
      if (b % 1000 === 999) return a % 1000 !== 999;
      return b > 90 && b % 100 >= 97 && a % 100 < b % 100;
    },
    steps: {
      s1(r) {
        const a = r.intNot(110, 998, v => v % 100 >= 90 || v % 10 === 9);
        return { q: `${a} ${S} 99`, a: String(a - 99), easy: `${a} ${S} 100 ${P} 1` };
      },
      // 98・97・199・299 を ひく
      s2(r) {
        const b = r.pick([98, 97, 98, 199, 299, 198]), k = 100 - (b % 100), c = b + k;
        const a = r.intNot(c + 10, 998, v => v % 100 >= b % 100 || v % 10 === 0);
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${a} ${S} ${c} ${P} ${k}` };
      },
      // □を もとめる（□ ＋ 99 ＝ 245）／ 999を ひく（1000を ひいて 1 たす）
      s3(r) {
        if (r.chance(0.5)) {
          const a = r.intNot(110, 998, v => v % 100 >= 90 || v % 10 === 9);
          return { q: `□ ${P} 99 ＝ ${a}`, a: String(a - 99), easy: `${a} ${S} 100 ${P} 1 ＝ ${a - 100} ${P} 1` };
        }
        const a = r.intNot(1010, 2989, v => v % 1000 >= 990 || v % 10 === 9);
        return { q: `${a} ${S} 999`, a: String(a - 999), easy: `${a} ${S} 1000 ${P} 1` };
      },
      // くり下がらない（くらいごとに ひけば よいので、 わざ 1-18 で。 R1-16）
      trap(r) {
        if (r.chance(0.5)) {
          const h = r.int(1, 9);
          return { q: `${h}99 ${S} 99`, a: String(h * 100), easy: '（ばらが 99。 わざ 1-18 で）', also: ['1-18'] };
        }
        const b = r.int(91, 95), a = r.int(1, 8) * 100 + r.int(b + 1, 98);
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `（${KURI}。 わざ 1-18 で）`, also: ['1-18'] };
      },
    },
  });

  // ------------------------------------------------------------ 1-18
  add({
    id: '1-18', part: 1, chap: '1-7', stars: 1,
    title: 'なん《十|じゅう》を ひく・くらいごとに ひく',
    mark: '**どの くらいも** ひかれる かずの ほうが 《大|おお》きい（くり《下|さ》がらない）。',
    futsu: ['76 － 32 を ひっ《算|さん》で。', 'くらいを たてに そろえて かき、', '《一|いち》の くらいから じゅんに ひく。'],
    raku: ['10の まとまりと ばらに わけて、 しきだけで すぐ。', '70 － 30 ＝ 40、 6 － 2 ＝ 4', '76 － 32 ＝ 40 ＋ 4 ＝ 44'],
    why: '10の まとまりは まとまりどうし、 ばらは ばらどうしで ひく（きょうかしょ 1-7）。',
    caution: 'ばらから ひけない とき（72 － 38 など）は、 くり《下|さ》がりが ある。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // ひく かずが 2けた いじょうで、 どの くらいも くり下がらない
    fits(q) {
      const s = subs(q);
      return !!s && s[1] >= 10 && s[0] > s[1] && !borrow(s[0], s[1]);
    },
    steps: {
      // 2けた － なん十
      s1(r) {
        const t1 = r.int(3, 9), t2 = r.int(1, t1 - 1), u = r.int(0, 9), a = 10 * t1 + u;
        const easy = u ? `${10 * (t1 - t2)} ${P} ${u}` : `10が ${t1 - t2}こ`;
        return { q: `${a} ${S} ${10 * t2}`, a: String(a - 10 * t2), easy };
      },
      // 2けた － 2けた（くり下がらない）
      s2(r) {
        const t1 = r.int(3, 9), t2 = r.int(1, t1 - 1), u1 = r.int(3, 9), u2 = r.int(1, u1 - 1);
        const a = 10 * t1 + u1, b = 10 * t2 + u2;
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${10 * (t1 - t2)} ${P} ${u1 - u2}` };
      },
      // 3けたの ひき算（くり下がらない）
      s3(r) {
        const h1 = r.int(2, 9), t1 = r.int(3, 9), t2 = r.int(1, t1 - 1), u1 = r.int(3, 9), u2 = r.int(1, u1 - 1);
        const a = 100 * h1 + 10 * t1 + u1;
        if (r.chance(0.5)) {
          const h2 = r.int(1, h1 - 1), b = 100 * h2 + 10 * t2 + u2;
          return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${100 * (h1 - h2)} ${P} ${10 * (t1 - t2)} ${P} ${u1 - u2}` };
        }
        const b = 10 * t2 + u2;
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${100 * h1} ${P} ${10 * (t1 - t2)} ${P} ${u1 - u2}` };
      },
      // ばらから ひけない（くり下がる）。 ひく かずの ばらは 3〜6（7・8・9 は わざ 1-16・1-19 で らくに なる）
      trap(r) {
        const t1 = r.int(4, 9), t2 = r.int(1, t1 - 2), u2 = r.int(3, 6), u1 = r.int(1, u2 - 1);
        const a = 10 * t1 + u1, b = 10 * t2 + u2;
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `（${u1}から ${u2}は ひけない）` };
      },
    },
  });

  // ------------------------------------------------------------ 1-19
  add({
    id: '1-19', part: 1, chap: '1-7', stars: 2,
    title: 'ひく かずを きりの よい かずに',
    mark: 'ひく かずが **39、 48** など、 なん《十|じゅう》に ちかい。',
    futsu: ['82 － 39 を ひっ《算|さん》で。', '2から 9は ひけないので、', 'くり《下|さ》げて けいさん。'],
    raku: ['どちらにも 1を たす。', '82 － 39 ＝ 83 － 40', '　　　　＝ 43'],
    why: '2つの かずに おなじ かずを たしても ひいても、 ちがいは かわらない（きょうかしょ 1-5の 「ちがい」）。',
    caution: 'ひく かず だけに たすのでは ない。 2つ とも、 おなじ かずだけ たす。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // ひく かずが 7・8・9で おわり くり下がる（82 － 39、 669 － 99）／ なん十から 1・2で おわる かずを ひく（90 － 61）
    fits(q) {
      const s = subs(q);
      if (!s || s[1] < 10 || s[0] <= s[1]) return false;
      const [a, b] = s;
      if (b % 10 >= 7) return borrow(a, b);
      return a < 100 && a % 10 === 0 && (b % 10 === 1 || b % 10 === 2);
    },
    steps: {
      // ひく かずが 19・29・…・79（どちらにも 1 たす）
      s1(r) {
        const b = 10 * r.int(1, 7) + 9, a = r.intNot(b + 3, 98, v => v % 10 === 9);
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${a + 1} ${S} ${b + 1}` };
      },
      // ひく かずが 8・7で おわる（どちらにも 2・3 たす）
      s2(r) {
        const k = r.pick([2, 2, 3]), b = 10 * r.int(1, 7) + 10 - k;
        const a = r.intNot(b + 4, 99 - k, v => v % 10 >= b % 10);
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${a + k} ${S} ${b + k}` };
      },
      // 3けた（ひく かずが 198 など）／ なん十から 41・62 などを ひく（どちらからも ひく）
      s3(r) {
        if (r.chance(0.5)) {
          const k = r.int(1, 3), b = 100 * r.int(1, 6) - k;
          const a = r.intNot(b + 30, 997, v => v % 100 >= b % 100 || v % 10 === 0);
          return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${a + k} ${S} ${b + k}` };
        }
        const k = r.int(1, 2), b = 10 * r.int(2, 6) + k, a = 10 * r.int(Math.floor(b / 10) + 2, 9);
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `${a - k} ${S} ${b - k}` };
      },
      // ひく かずが 39・48 などで 目印に にて いるが、 くり下がらない（くらいごとに ひけば よい。 わざ 1-18。 R1-16）
      trap(r) {
        const t2 = r.int(1, 5), u2 = r.int(7, 9), t1 = r.int(t2 + 2, 9), u1 = r.int(u2, 9);
        const a = 10 * t1 + u1, b = 10 * t2 + u2;
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: `（${KURI}。 わざ 1-18 で）`, also: ['1-18'] };
      },
    },
  });

  // ------------------------------------------------------------ 1-20
  const kazoe = (b, K, a) => `${K}まで ${K - b}、 あと ${a - K}`;
  add({
    id: '1-20', part: 1, chap: '1-5・1-7', stars: 1,
    title: 'たし《算|ざん》で かんがえる',
    mark: '2つの かずが **ちかい**。 ちがいが 《小|ちい》さい。',
    futsu: ['62 － 58 を ひっ《算|さん》で。', 'くり《下|さ》がりが あって、', 'まちがえやすい。'],
    raku: ['58に いくつ たすと 62？', '58から 60まで 2、 62まで 2', '62 － 58 ＝ 2 ＋ 2 ＝ 4'],
    why: 'ひき《算|ざん》の こたえは 「ちがい」。 《小|ちい》さい ほうから 《大|おお》きい ほうまで、 たして いけば よい（きょうかしょ 1-5）。',
    caution: '2つの かずが はなれて いる ときは、 たして いくと たいへん。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 2つの かずが ちかく（ちがいが 12まで）、 なん十・なん百を またぐ（62 － 58、 58 ＋ □ ＝ 62）
    fits(q) {
      let s = subs(q);
      const m = q.match(/^(\d+) ＋ □ ＝ (\d+)$/);
      if (!s && m && +m[2] % 10 !== 0) s = [+m[2], +m[1]];
      if (!s) return false;
      const [a, b] = s, d = a - b;
      return b >= 10 && d > 0 && d <= 12 && borrow(a, b);
    },
    steps: {
      // なん十を またぐ 2けたの ひき算（62 － 58）
      s1(r) {
        const K = 10 * r.int(2, 9), v = r.int(1, 4), u = r.int(1, 4), a = K + u, b = K - v;
        return { q: `${a} ${S} ${b}`, a: String(u + v), easy: kazoe(b, K, a), verify: () => (b + v + u === a) || 'たしかめが あわない' };
      },
      // なん百を またぐ（302 － 296）
      s2(r) {
        const K = 100 * r.int(1, 9), v = r.int(1, 5), u = r.int(1, 5), a = K + u, b = K - v;
        return { q: `${a} ${S} ${b}`, a: String(u + v), easy: kazoe(b, K, a), verify: () => (b + v + u === a) || 'たしかめが あわない' };
      },
      // □を もとめる たし算（58 ＋ □ ＝ 62）／ 1000を またぐ
      s3(r) {
        if (r.chance(0.5)) {
          const K = 10 * r.int(2, 9), v = r.int(1, 5), u = r.int(1, 5), a = K + u, b = K - v;
          if (u + v >= 10) return null;   // 75 ＋ □ ＝ 85 は なん十を またがない
          return { q: `${b} ${P} □ ＝ ${a}`, a: String(u + v), easy: kazoe(b, K, a), verify: () => (b + v + u === a) || 'たしかめが あわない' };
        }
        const K = 1000, v = r.int(1, 6), u = r.int(1, 6), a = K + u, b = K - v;
        return { q: `${a} ${S} ${b}`, a: String(u + v), easy: kazoe(b, K, a), verify: () => (b + v + u === a) || 'たしかめが あわない' };
      },
      // くり下がるが、 2つの かずが はなれて いる（83 － 45）。 ひく かずの ばらは 3〜6、 ひかれる かずは なん十で ない
      // （ばらが 7・8・9 なら わざ 1-16・1-19、 くり下がらなければ わざ 1-18、 なん十からは わざ 1-21 で らくに なる）
      trap(r) {
        const t1 = r.int(6, 9), t2 = r.int(1, t1 - 3), u2 = r.int(3, 6), u1 = r.int(1, u2 - 1);
        const a = 10 * t1 + u1, b = 10 * t2 + u2;
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: '（はなれて いる。 たして いくと たいへん）' };
      },
    },
  });

  // ------------------------------------------------------------ 1-21
  add({
    id: '1-21', part: 1, chap: '1-7', stars: 1,
    title: '100から ひく',
    mark: '**100から** ひく。 くり《下|さ》がりが 2かい ある。',
    futsu: ['100 － 37 を ひっ《算|さん》で。', '0から ひけないので、', 'くり《下|さ》がりが 2かい。'],
    raku: ['100は 99と 1。', '100 － 37 ＝ 99 － 37 ＋ 1', '　　　　 ＝ 62 ＋ 1 ＝ 63'],
    why: '99から ひくと、 どの くらいも 9から ひく だけで、 くり《下|さ》がりが ない。',
    caution: 'さいごに 1を たすのを わすれない。 なん《十|じゅう》を ひく とき（100 － 40）は、 10の まとまりで（わざ 1-83）。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // なん百から ひく（100 － 37、 300 － 46）／ なん十から 2けたを ひく（70 － 47）。 ひく かずは なん十で ない
    fits(q) {
      const s = subs(q);
      if (!s) return false;
      const [a, b] = s;
      if (b % 10 === 0 || b >= a) return false;
      return (a % 100 === 0 && a <= 900) || (a < 100 && a % 10 === 0 && b >= 10);
    },
    steps: {
      s1(r) {
        const b = r.intNot(11, 89, v => v % 10 === 0);
        return { q: `100 ${S} ${b}`, a: String(100 - b), easy: `99 ${S} ${b} ${P} 1` };
      },
      // なん百から 2けたを ひく（300 － 46 ＝ 299 － 46 ＋ 1）
      s2(r) {
        const H = 100 * r.int(2, 9), b = r.intNot(11, 89, v => v % 10 === 0);
        return { q: `${H} ${S} ${b}`, a: String(H - b), easy: `${H - 1} ${S} ${b} ${P} 1` };
      },
      // なん百 － 3けた ／ なん十 － 2けた
      s3(r) {
        if (r.chance(0.5)) {
          const H = 100 * r.int(3, 9), b = r.intNot(111, H - 50, v => v % 10 === 0 || v % 100 < 10);
          return { q: `${H} ${S} ${b}`, a: String(H - b), easy: `${H - 1} ${S} ${b} ${P} 1 ＝ ${H - 1 - b} ${P} 1` };
        }
        const A = 10 * r.int(4, 9), b = r.intNot(12, A - 12, v => v % 10 === 0);
        return { q: `${A} ${S} ${b}`, a: String(A - b), easy: `${A - 1} ${S} ${b} ${P} 1 ＝ ${A - 1 - b} ${P} 1` };
      },
      // なん十を ひく ／ 99から ひく
      trap(r) {
        if (r.chance(0.5)) {
          const t = r.int(2, 8);
          return { q: `100 ${S} ${10 * t}`, a: String(100 - 10 * t), easy: `（10が ${10 - t}こ。 わざ 1-83 で）`, also: ['1-83'] };
        }
        const b = r.intNot(12, 87, v => v % 10 === 0);
        return { q: `99 ${S} ${b}`, a: String(99 - b), easy: `（${KURI}。 わざ 1-18 で）`, also: ['1-18'] };
      },
    },
  });

  // ------------------------------------------------------------ 1-22
  add({
    id: '1-22', part: 1, chap: '1-7', stars: 2,
    title: '1000から ひく',
    mark: '**1000から** ひく。 くり《下|さ》がりが 3かい ある。',
    futsu: ['1000 － 386 を ひっ《算|さん》で。', '0から ひけないので、', 'くり《下|さ》がりが 3かい。'],
    raku: ['1000は 999と 1。', '1000 － 386 ＝ 999 － 386 ＋ 1', '　　　　　 ＝ 613 ＋ 1 ＝ 614'],
    why: '999から ひくと、 どの くらいも 9から ひく だけ（わざ 1-21と おなじ）。',
    caution: 'さいごに 1を たすのを わすれない。 なん《百|びゃく》を ひく とき（1000 － 300）は、 100の まとまりで（わざ 1-83）。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // なん千から ひく（1000 － 386、 □ ＋ 742 ＝ 1000）。 ひく かずは なん百で ない
    fits(q) {
      const s = subs(q) || boxSub(q);
      if (!s) return false;
      const [a, b] = s;
      return a % 1000 === 0 && a <= 9000 && b >= 10 && b < a && b % 100 !== 0;
    },
    steps: {
      s1(r) {
        const b = r.intNot(102, 989, v => v % 10 === 0);
        return { q: `1000 ${S} ${b}`, a: String(1000 - b), easy: `999 ${S} ${b} ${P} 1` };
      },
      // 1000 － 2けた ／ なん千 － 3けた
      s2(r) {
        if (r.chance(0.4)) {
          const b = r.intNot(11, 98, v => v % 10 === 0);
          return { q: `1000 ${S} ${b}`, a: String(1000 - b), easy: `999 ${S} ${b} ${P} 1` };
        }
        const H = 1000 * r.int(2, 5), b = r.intNot(102, 989, v => v % 10 === 0);
        return { q: `${H} ${S} ${b}`, a: String(H - b), easy: `${H - 1} ${S} ${b} ${P} 1` };
      },
      // □を もとめる（□ ＋ 386 ＝ 1000、 1000 － □ ＝ 386）
      s3(r) {
        const b = r.intNot(102, 989, v => v % 10 === 0);
        const q = r.chance(0.5) ? `□ ${P} ${b} ＝ 1000` : `1000 ${S} □ ＝ ${b}`;
        return { q, a: String(1000 - b), easy: `999 ${S} ${b} ${P} 1 ＝ ${999 - b} ${P} 1` };
      },
      // なん百を ひく ／ 999から ひく
      trap(r) {
        if (r.chance(0.5)) {
          const t = r.int(2, 8);
          return { q: `1000 ${S} ${100 * t}`, a: String(1000 - 100 * t), easy: `（100が ${10 - t}こ。 わざ 1-83 で）`, also: ['1-83'] };
        }
        const b = r.intNot(102, 988, v => v % 10 === 0);
        return { q: `999 ${S} ${b}`, a: String(999 - b), easy: `（${KURI}。 わざ 1-18 で）`, also: ['1-18'] };
      },
    },
  });

  // ------------------------------------------------------------ 1-23
  add({
    id: '1-23', part: 1, chap: '1-7', stars: 1,
    title: 'たして ひくを さきに まとめる',
    mark: '**＋ 28 － 8** のように、 たす かずと ひく かずの ばらが おなじ。',
    futsu: ['63 ＋ 28 ＝ 91 を さきに', 'けいさん して、 91 － 8 ＝ 83。', 'くり《上|あ》がりも くり《下|さ》がりも ある。'],
    raku: ['＋ 28 － 8 は、 ＋ 20 と おなじ。', '63 ＋ 28 － 8 ＝ 63 ＋ 20', '　　　　　　＝ 83'],
    why: '28 たして 8 ひくと、 たしたのは 20 だけ。 さきに まとめると、 なん《十|じゅう》を たす だけに なる。',
    caution: 'ばらが ちがう とき（63 ＋ 28 － 5 など）は、 なん《十|じゅう》に ならない。',
    cols: 1,
    counts: { s1: 9, s2: 6, s3: 6, trap: 2 },
    // ＋ と － が まざった 3つの かずで、 たす かずと ひく かずの 一の くらいが おなじ
    fits(q) {
      const e = expr(q);
      if (!e || e.n.length !== 3 || !e.o.includes(P) || !e.o.includes(S)) return false;
      const plus = [e.n[0]], minus = [];
      e.o.forEach((o, i) => (o === P ? plus : minus).push(e.n[i + 1]));
      return plus.some(x => minus.some(y => x % 10 !== 0 && x % 10 === y % 10));
    },
    steps: {
      // a ＋ b － (bの ばら)
      s1(r) {
        const t = r.int(1, 5), u = r.int(2, 9), b = 10 * t + u, a = r.intNot(11, 89 - 10 * t, v => v % 10 === 0);
        return { q: `${a} ${P} ${b} ${S} ${u}`, a: String(a + 10 * t), easy: `${a} ${P} ${10 * t}` };
      },
      // じゅんばんが ちがう：a － u ＋ b、 a － b ＋ u
      s2(r) {
        const t = r.int(1, 5), u = r.int(2, 9), b = 10 * t + u;
        if (r.chance(0.5)) {
          const a = r.intNot(Math.max(11, u + 1), 89 - 10 * t, v => v % 10 === 0);
          return { q: `${a} ${S} ${u} ${P} ${b}`, a: String(a + 10 * t), easy: `${a} ${P} ${10 * t}` };
        }
        const a = r.intNot(b + 5, 98, v => v % 10 === 0);
        return { q: `${a} ${S} ${b} ${P} ${u}`, a: String(a - 10 * t), easy: `${a} ${S} ${10 * t}` };
      },
      // ひく かずも 2けた：a ＋ 37 － 17、 a － 46 ＋ 16
      s3(r) {
        const u = r.int(1, 9), t1 = r.int(2, 6), t2 = r.int(1, t1 - 1), b = 10 * t1 + u, c = 10 * t2 + u, d = b - c;
        if (r.chance(0.5)) {
          const a = r.intNot(11, 99 - d, v => v % 10 === 0);
          return { q: `${a} ${P} ${b} ${S} ${c}`, a: String(a + d), easy: `${a} ${P} ${d}` };
        }
        const a = r.intNot(b + 5, 98, v => v % 10 === 0);
        return { q: `${a} ${S} ${b} ${P} ${c}`, a: String(a - d), easy: `${a} ${S} ${d}` };
      },
      // ばらが ちがう（ひく かずが まえの かずの ばらと おなじ 34 ＋ 19 － 4 も、 さきに 34 － 4 と できるので のぞく。 R1-12）
      trap(r) {
        const t = r.int(1, 4), u = r.int(3, 9), w = r.intNot(1, 9, v => v === u), b = 10 * t + u;
        const a = r.intNot(11, 89 - 10 * t, v => v % 10 === 0 || v % 10 === w);
        return { q: `${a} ${P} ${b} ${S} ${w}`, a: String(a + b - w), easy: '（ばらが ちがう）' };
      },
    },
  });

  // ------------------------------------------------------------ 1-24
  const seq = (s, d, n) => Array.from({ length: n }, (_, i) => s + d * i);
  // 第1部では × を つかわない（第29回 H-4）。 「11が 5くみ」と かく
  const kumi = (f, l, n) => `${f + l}が ${n / 2}くみ`;
  const kumiOk = (L) => () => {
    const n = L.length, s = L[0] + L[n - 1], sum = L.reduce((x, y) => x + y, 0);
    return (n % 2 === 0 && L.every((v, i) => v + L[n - 1 - i] === s) && s * n / 2 === sum) || 'くみの わが あわない';
  };
  add({
    id: '1-24', part: 1, chap: '1-7', stars: 2,
    title: 'はしと はしを くんで たす',
    mark: 'かずが **おなじ だけ ふえて** ならぶ。 はしと はしを たすと、 どの くみも おなじ。',
    futsu: ['1 ＋ 2 ＝ 3、 3 ＋ 3 ＝ 6、', '6 ＋ 4 ＝ 10、 … と、', '9かい たして いく。'],
    raku: ['1 ＋ 10、 2 ＋ 9、 3 ＋ 8、 …', 'どの くみも 11。 11が 5くみ。', '11 ＋ 11 ＋ 11 ＋ 11 ＋ 11 ＝ 55'],
    why: 'かたほうは 1ずつ ふえ、 もう かたほうは 1ずつ へるので、 くみの わは かわらない。',
    caution: 'ふえかたが そろって いない ときは、 くみの わが ちがって しまう。',
    cols: 1,
    counts: { s1: 9, s2: 6, s3: 6, trap: 2 },
    // 4つ いじょう、 おなじ だけ ふえて ならぶ（「…」の ならびも）
    fits(q) {
      if (/^\d+ ＋ \d+ ＋ \d+ ＋ … ＋ \d+$/.test(q)) return true;
      const n = adds(q);
      if (!n || n.length < 4) return false;
      const d = n[1] - n[0];
      return d > 0 && n.every((x, i) => i === 0 || x - n[i - 1] === d);
    },
    steps: {
      // 1ずつ ふえる 4こ・6こ
      s1(r) {
        const n = r.pick([4, 6]), s = r.int(1, 15), L = seq(s, 1, n), l = L[n - 1];
        return { q: L.join(` ${P} `), a: String(L.reduce((x, y) => x + y, 0)), easy: kumi(s, l, n), verify: kumiOk(L) };
      },
      // 「…」で ながい ならび（1 ＋ 2 ＋ … ＋ 10）
      s2(r) {
        const s = r.pick([1, 1, r.int(2, 11)]), m = r.int(4, 10), e = s + 2 * m - 1, L = seq(s, 1, 2 * m);
        return {
          q: `${s} ${P} ${s + 1} ${P} ${s + 2} ${P} … ${P} ${e}`, a: String(L.reduce((x, y) => x + y, 0)), easy: kumi(s, e, 2 * m),
          verify: kumiOk(L),
        };
      },
      // 2・5・10 ずつ ふえる
      s3(r) {
        const d = r.pick([2, 5, 10]), n = r.pick([4, 6]);
        const s = d === 2 ? r.int(1, 8) : d * r.int(1, 3), L = seq(s, d, n), l = L[n - 1];
        return { q: L.join(` ${P} `), a: String(L.reduce((x, y) => x + y, 0)), easy: kumi(s, l, n), verify: kumiOk(L) };
      },
      // ふえかたが そろって いない
      trap(r) {
        const s = r.int(1, 6), g = r.shuffle([1, 2, 3, r.pick([1, 4])]).slice(0, 3);
        const L = [s, s + g[0], s + g[0] + g[1], s + g[0] + g[1] + g[2]];
        if (L[0] + L[3] === L[1] + L[2]) return null;
        if (L.some((v, i) => L.some((w, j) => i < j && (v + w) % 10 === 0))) return null;   // 10の くみ（わざ 1-06）に ならない
        return { q: L.join(` ${P} `), a: String(L.reduce((x, y) => x + y, 0)), easy: '（くみの わが そろわない）' };
      },
    },
  });

  // ------------------------------------------------------------ 1-25
  const ROUND = [10, 20, 30, 40, 50, 60, 70, 80, 90, 25, 15, 35];
  add({
    id: '1-25', part: 1, chap: '1-7', stars: 1,
    title: 'まんなかの かずに そろえる',
    mark: '3つの かずが、 **まんなかの かず** から おなじ だけ ずれて いる。',
    futsu: ['19 ＋ 20 ＝ 39、', '39 ＋ 21 ＝ 60 と、', 'じゅんに たす。'],
    raku: ['19は 20より 1 《小|ちい》さい。 21は 1 《大|おお》きい。', '19 ＋ 20 ＋ 21 ＝ 20 ＋ 20 ＋ 20', '　　　　　　 ＝ 60'],
    why: '1 《小|ちい》さい ぶんと 1 《大|おお》きい ぶんが、 ちょうど うちけしあう。',
    caution: 'まんなかからの ずれが うちけしあわない ときは、 そろえられない。',
    cols: 1,
    counts: { s1: 9, s2: 6, s3: 6, trap: 2 },
    // 3つの かずが きりの よい まんなか（10・15・20 …）から 4まで ずれて、 ずれが うちけしあう
    fits(q) {
      const n = adds(q);
      if (!n || n.length !== 3) return false;
      const sum = n[0] + n[1] + n[2], m = sum / 3;
      return sum % 15 === 0 && m >= 10 && n.every(x => Math.abs(x - m) <= 4);
    },
    steps: {
      // m－d、 m、 m＋d
      s1(r) {
        const m = r.pick(ROUND), d = r.pick([1, 1, 2, 3]);
        return { q: `${m - d} ${P} ${m} ${P} ${m + d}`, a: String(3 * m), easy: `${m} ${P} ${m} ${P} ${m}` };
      },
      // じゅんばんが ばらばら
      s2(r) {
        const m = r.pick(ROUND), d = r.pick([1, 2, 3]);
        const L = r.shuffle([m - d, m, m + d]);
        if (L[1] === m) return null;
        return { q: L.join(` ${P} `), a: String(3 * m), easy: `${m} ${P} ${m} ${P} ${m}` };
      },
      // ずれが 1と 2（19 ＋ 22 ＋ 19）／ 3けた（99 ＋ 100 ＋ 101）
      s3(r) {
        if (r.chance(0.6)) {
          const m = r.pick(ROUND.slice(1, 9)), d1 = r.int(1, 2), d2 = r.int(1, 2);
          const L = r.shuffle([m - d1, m - d2, m + d1 + d2]);
          return { q: L.join(` ${P} `), a: String(3 * m), easy: `${m} ${P} ${m} ${P} ${m}` };
        }
        const m = 100 * r.int(1, 3), d = r.int(1, 2);
        return { q: `${m - d} ${P} ${m} ${P} ${m + d}`, a: String(3 * m), easy: `${m} ${P} ${m} ${P} ${m}` };
      },
      // まんなかが ない
      trap(r) {
        const L = [r.int(11, 29), r.int(31, 49), r.int(51, 79)];
        if (L[0] + L[2] === 2 * L[1]) return null;
        if (L.some(v => v % 10 === 0)) return null;
        if (L.some((v, i) => L.some((w, j) => i < j && (v + w) % 10 === 0))) return null;  // 10の くみ（わざ 1-12）に ならない
        return { q: r.shuffle(L).join(` ${P} `), a: String(L[0] + L[1] + L[2]), easy: '（まんなかが ない）' };
      },
    },
  });

  // ---------------------------------------------------------------- 第29回 H-9 で 足した わざ（第1部。 番号は うしろに 足す）
  // □の ある 問題の 検算
  const chk = (ok, msg) => () => (ok ? true : msg);

  // ------------------------------------------------------------ 1-85
  add({
    id: '1-85', part: 1, chap: '1-4・1-5', stars: 1,
    title: '0を たす・ひく・《同|おな》じ かずを ひく',
    mark: '**0** を たす・ひく。 **おなじ かず** を ひく。',
    futsu: ['25 － 25 を ひっ《算|さん》で。', '5 － 5 ＝ 0、 2 － 2 ＝ 0。', 'こたえ 0'],
    raku: ['0を たしても ひいても かわらない。', '7 ＋ 0 ＝ 7、 7 － 0 ＝ 7', 'おなじ かずを ひくと 0。', '25 － 25 ＝ 0'],
    why: '0は 「なにも ない」。 なにも たさない・とらないと かずは かわらない。 ぜんぶ とると なにも のこらない（きょうかしょ 1-4・1-5）。',
    caution: '10 － 0 と 10 － 10 を まちがえない。 0を ひくと 10の まま、 10を ひくと 0。',
    cols: { s3: 1 },
    // 0を たす・ひく（7 ＋ 0、 0 ＋ 7、 7 － 0、 □ ＋ 0 ＝ 7）・おなじ かずを ひく（25 － 25、 のこりは □）
    fits(q) {
      const e = expr(q);
      if (e) {
        if (e.n.length !== 2) return false;
        const [a, b] = e.n;
        return e.o[0] === P ? (a === 0 || b === 0) : e.o[0] === S && (b === 0 || a === b);
      }
      let m = q.match(/^(\d+) － □ ＝ (\d+)$/);
      if (m) return +m[2] === 0 || +m[1] === +m[2];
      m = q.match(/^(?:□ ＋ (\d+)|(\d+) ＋ □) ＝ (\d+)$/);
      if (m) { const b = +(m[1] || m[2]); return b === 0 || b === +m[3]; }
      const s = subs(q);
      return !!s && s[0] === s[1];
    },
    steps: {
      // 0を たす・0に たす・0を ひく
      s1(r) {
        const a = r.chance(0.6) ? r.int(1, 20) : r.int(21, 99), k = r.int(0, 2);
        if (k === 0) return { q: `${a} ${P} 0`, a: String(a), easy: `0を たしても ${a}` };
        if (k === 1) return { q: `0 ${P} ${a}`, a: String(a), easy: `0に たしても ${a}` };
        return { q: `${a} ${S} 0`, a: String(a), easy: `0を ひいても ${a}` };
      },
      // おなじ かずを ひく（2けた・3けた）
      s2(r) {
        const a = r.chance(0.6) ? r.int(2, 99) : r.int(101, 999);
        return { q: `${a} ${S} ${a}`, a: '0', easy: 'おなじ かずを ひくと 0' };
      },
      // □を もとめる・ことばの もんだい
      s3(r) {
        const a = r.int(3, 99), k = r.int(0, 3);
        if (k === 0) return { q: `${a} ${S} □ ＝ ${a}`, a: '0', easy: '0を ひいても かわらない', verify: chk(a - 0 === a, 'ちがう') };
        if (k === 1) return { q: `${a} ${S} □ ＝ 0`, a: String(a), easy: 'おなじ かずを ひくと 0', verify: chk(a - a === 0, 'ちがう') };
        if (k === 2) return { q: `□ ${P} 0 ＝ ${a}`, a: String(a), easy: '0を たしても かわらない', verify: chk(a + 0 === a, 'ちがう') };
        const b = r.int(3, 9);
        const q = r.pick([
          `あめが ${b}こ。 ${b}こ たべると、 のこりは □こ。`,
          `シールが ${b}まい。 ${b}まい あげると、 のこりは □まい。`,
        ]);
        return { q, a: '0', easy: 'おなじ かずを ひくと 0', verify: chk(b - b === 0, 'ちがう') };
      },
      // ばらと おなじ かずを ひく（35 － 5 は 0に ならない）
      trap(r) {
        const t = r.int(1, 9), u = r.int(1, 9), a = 10 * t + u;
        return { q: `${a} ${S} ${u}`, a: String(a - u), easy: `（ばらの ${u}だけ ひく。 0に ならない）` };
      },
    },
  });

  // ------------------------------------------------------------ 1-86
  add({
    id: '1-86', part: 1, chap: '1-5・1-7', stars: 1,
    title: 'ひき《算|ざん》の たしかめは たし《算|ざん》で',
    mark: 'ひき《算|ざん》の こたえを **たし《算|ざん》** で たしかめる。 「なにから ひいたか」も たし《算|ざん》で わかる。',
    futsu: ['63 － 27 ＝ 36 が あって いるか、', 'もう いちど ひき《算|ざん》を して', 'くらべる。'],
    raku: ['こたえに ひいた かずを もどす。', '36 ＋ 27 ＝ 63', 'はじめの 63に もどれば あって いる。'],
    why: 'ひいた かずを もどすと、 はじめの かずに もどる（きょうかしょ 1-5）。 「なにから 27 ひくと 36？」も、 36 ＋ 27 で わかる。',
    caution: '「なにに 27 たすと 63？」の ような たし《算|ざん》の ときは、 ぎゃくに ひき《算|ざん》で もとめる（63 － 27）。',
    cols: { s1: 1, s3: 1 },
    counts: { s1: 8, s2: 8, s3: 6, trap: 2 },
    // ひき算の たしかめ（「たしかめは」）・□ － b ＝ c・「のこった。 はじめは □」
    fits(q) {
      return /たしかめは \d+ ＋ \d+ ＝ □$/.test(q) || /^□ － \d+ ＝ \d+$/.test(q) || /のこった。 はじめは □/.test(q);
    },
    steps: {
      // 2けたの ひき算の たしかめ
      s1(r) {
        const A = r.intNot(31, 98, v => v % 10 === 0), B = r.intNot(12, A - 11, v => v % 10 === 0), C = A - B;
        return { q: `${A} ${S} ${B} ＝ ${C}。 たしかめは ${C} ${P} ${B} ＝ □`, a: String(A), easy: `${C} ${P} ${B} ＝ ${A}`, verify: chk(C + B === A, 'たしかめが あわない') };
      },
      // □ － b ＝ c（たし算で もとめる）
      s2(r) {
        const B = r.intNot(12, 59, v => v % 10 === 0), C = r.intNot(11, 98 - B, v => v % 10 === 0), A = B + C;
        return { q: `□ ${S} ${B} ＝ ${C}`, a: String(A), easy: `${C} ${P} ${B} ＝ ${A}`, verify: chk(A - B === C, 'ちがう') };
      },
      // 3けた・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const B = r.intNot(102, 498, v => v % 10 === 0), C = r.intNot(102, 999 - B, v => v % 10 === 0), A = B + C;
          return { q: `□ ${S} ${B} ＝ ${C}`, a: String(A), easy: `${C} ${P} ${B} ＝ ${A}`, verify: chk(A - B === C, 'ちがう') };
        }
        if (k === 1) {
          const B = r.int(12, 39), C = r.int(12, 59), A = B + C;
          const q = r.pick([
            `あめを ${B}こ たべたら、 ${C}こ のこった。 はじめは □こ。`,
            `シールを ${B}まい つかったら、 ${C}まい のこった。 はじめは □まい。`,
          ]);
          return { q, a: String(A), easy: `${C} ${P} ${B} ＝ ${A}`, verify: chk(A - B === C, 'ちがう') };
        }
        const A = r.intNot(312, 989, v => v % 10 === 0), B = r.intNot(102, A - 101, v => v % 10 === 0), C = A - B;
        return { q: `${A} ${S} ${B} ＝ ${C}。 たしかめは ${C} ${P} ${B} ＝ □`, a: String(A), easy: `${C} ${P} ${B} ＝ ${A}`, verify: chk(C + B === A, 'たしかめが あわない') };
      },
      // たし算の □（□ ＋ 27 ＝ 63 は ひき算で もとめる）
      trap(r) {
        const b = r.intNot(12, 58, v => v % 10 === 0 || v % 10 === 9), T = r.intNot(b + 13, 98, v => v % 10 === 0 || v === 2 * b);
        return { q: `□ ${P} ${b} ＝ ${T}`, a: String(T - b), easy: `（たし《算|ざん》の □は ひき《算|ざん》で。 ${T} ${S} ${b}）`, verify: chk(T - b + b === T, 'ちがう') };
      },
    },
  });
})(globalThis.MONDAI);
