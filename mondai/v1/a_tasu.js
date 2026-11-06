/* 問題集 第1巻　第1部 たし算（わざ 1-01〜1-13）　組 a
 * 書き方は v1/README.md。
 * ・楽な形（easy）は、こたえの らんの 2れつに 1行で 入るように 短く する（見分けようでは「わざ 1-xx：」が 前に つく）。
 * ・**…** の 中に ルビ（《…》）を 入れない（core.js の 変換で 太字に ならない）。 */
(function (M) {
  'use strict';
  const P = '＋', S = '－';
  // 一の くらいが 0で ない 2けたの かず
  const two = (r, lo, hi) => r.intNot(lo || 11, hi || 89, v => v % 10 === 0);
  // □の ある 問題の 検算（式に 答えを 入れて、 左と 右が 同じか）
  const chk = (ok, msg) => () => (ok ? true : msg);

  M.add({
    id: '1-01', part: 1, chap: '1-2・1-4', stars: 1,
    title: '10に なる くみ',
    mark: 'こたえが **10** に なる たし《算|ざん》。 「あと いくつで 10」を さがす。',
    futsu: ['3に いくつ たすと 10？', '4、 5、 6、 … 10 と', 'ゆびで かぞえる。'],
    raku: ['10に なる くみを おぼえる。', '1と 9　2と 8　3と 7', '4と 6　5と 5', '3は 7と くんで 10。'],
    why: '10は 「いくつと いくつ」に わけられる（《教科書|きょう|か|しょ》 1-4）。 くみを おぼえれば、 かぞえなくて よい。',
    caution: 'こたえが 10で ない ときは、 この くみは つかえない。 しきの こたえを よく 《見|み》よう。',
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    steps: {
      // a ＋ □ ＝ 10
      s1(r) {
        const a = r.int(1, 9), b = 10 - a;
        return { q: `${a} ${P} □ ＝ 10`, a: String(b), easy: `${a}と ${b}で 10`, verify: chk(a + b === 10, 'たして 10に ならない') };
      },
      // □が まえ・「10は ○と □」
      s2(r) {
        const a = r.int(1, 9), b = 10 - a;
        const q = r.chance(0.5) ? `□ ${P} ${a} ＝ 10` : `10は ${a}と □`;
        return { q, a: String(b), easy: `${a}と ${b}で 10`, verify: chk(a + b === 10, 'たして 10に ならない') };
      },
      // つぎの なん十まで・ことばの もんだい
      s3(r) {
        const u = r.int(1, 9), b = 10 - u;
        if (r.chance(0.65)) {
          const t = r.int(1, 8), n = t * 10 + u;
          return { q: `${n} ${P} □ ＝ ${(t + 1) * 10}`, a: String(b), easy: `${u}と ${b}で 10`, verify: chk(n + b === (t + 1) * 10, 'つぎの なん十に ならない') };
        }
        const q = r.pick([
          `おはじきが ${u}こ。 あと □こで 10こ。`,
          `10《円|えん》で ${u}《円|えん》の あめ。 おつりは □《円|えん》。`,
        ]);
        return { q, a: String(b), easy: `${u}と ${b}で 10`, verify: chk(u + b === 10, 'たして 10に ならない') };
      },
      // こたえが 10で ない
      trap(r) {
        const n = r.pick([8, 9]), a = r.int(2, n - 2), b = n - a;
        return { q: `${a} ${P} □ ＝ ${n}`, a: String(b), easy: `（10で ない。 ${a}と ${b}で ${n}）`, verify: chk(a + b === n, 'ちがう') };
      },
    },
  });

  M.add({
    id: '1-02', part: 1, chap: '1-4', stars: 1,
    title: '10を つくって たす（さくらんぼ）',
    mark: 'こたえが 10を こえる。 **あと いくつで 10** かを 《見|み》る。',
    futsu: ['8 ＋ 5 を、 8から', '9、 10、 11、 12、 13 と', 'ゆびで かぞえる。'],
    raku: ['8は あと 2で 10。 5を 2と 3に わける。', '8 ＋ 5 ＝ 8 ＋ 2 ＋ 3', '　　　＝ 10 ＋ 3 ＝ 13'],
    why: '10の まとまりが できると、 あとは 10と いくつ で すぐ わかる（《教科書|きょう|か|しょ》 1-2）。',
    caution: 'こたえが 10より 《小|ちい》さい ときは、 10を つくらなくても よい。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    steps: {
      // 大きい かず ＋ 小さい かず（大きい ほうを 10に する）
      s1(r) {
        const a = r.int(6, 9), b = r.int(11 - a, 9);
        if (b > a) return null;
        const k = 10 - a;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${a} ${P} ${k} ${P} ${b - k} ＝ 10 ${P} ${b - k}` };
      },
      // 小さい かず ＋ 大きい かず（大きい ほうを 10に する。 じゅんばんを かえて よい）
      s2(r) {
        const b = r.int(6, 9), a = r.int(11 - b, b - 1);
        if (a < 2) return null;
        const k = 10 - b;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${b} ${P} ${k} ${P} ${a - k} ＝ 10 ${P} ${a - k}` };
      },
      // 2けた ＋ 1けたで、 くり上がる
      s3(r) {
        const t = r.int(1, 7), u = r.int(5, 9), b = r.int(11 - u, 9);
        const a = t * 10 + u, k = 10 - u;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${a} ${P} ${k} ${P} ${b - k} ＝ ${a + k} ${P} ${b - k}` };
      },
      // くり上がらない（10を つくらなくて よい）。 8 ＋ 1 の ように、 目印に にて いる もの
      trap(r) {
        const a = r.int(5, 8), b = r.int(1, Math.min(9 - a, a - 2));
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: '（10を こえない。 そのまま たす）' };
      },
    },
  });

  M.add({
    id: '1-03', part: 1, chap: '1-4', stars: 1,
    title: '5の まとまりで たす',
    mark: 'たす かずが どちらも **6・7・8・9** の どれか。 どれも 「5と いくつ」。',
    futsu: ['6 ＋ 7 を、 6から', '7、 8、 9、 … 13 と', 'ゆびで 7つ かぞえる。'],
    raku: ['6は 5と 1、 7は 5と 2。', '6 ＋ 7 ＝ （5 ＋ 5） ＋ （1 ＋ 2）', '　　　＝ 10 ＋ 3 ＝ 13'],
    why: '5と 5で 10の まとまりが できるので、 のこりの 1と 2を たすだけ（いくつと いくつ。 《教科書|きょう|か|しょ》 1-4）。',
    caution: 'どちらかが 5より 《小|ちい》さい ときは、 5が 2つ できない。 10を つくって たそう（わざ 1-02）。',
    steps: {
      // 6〜9 ＋ 6〜9
      s1(r) {
        const a = r.int(6, 9), b = r.int(6, 9);
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `10 ${P} ${a - 5} ${P} ${b - 5}` };
      },
      // 5が そのまま ある・2けた（1□）＋ 6〜9
      s2(r) {
        const b = r.int(6, 9);
        if (r.chance(0.4)) {
          const q = r.chance(0.5) ? `5 ${P} ${b}` : `${b} ${P} 5`;
          return { q, a: String(5 + b), easy: `5 ${P} 5 ${P} ${b - 5}` };
        }
        const u = r.int(6, 9);
        return { q: `${10 + u} ${P} ${b}`, a: String(10 + u + b), easy: `20 ${P} ${u - 5} ${P} ${b - 5}` };
      },
      // なん十（50の まとまり）・ことばの もんだい
      s3(r) {
        const a = r.int(6, 9), b = r.int(6, 9);
        if (r.chance(0.6)) {
          return { q: `${a * 10} ${P} ${b * 10}`, a: String((a + b) * 10), easy: `100 ${P} ${(a - 5) * 10} ${P} ${(b - 5) * 10}` };
        }
        const q = r.pick([
          `カード ${a}まいと ${b}まい。 あわせて □まい。`,
          `あめ ${a}こと ${b}こ。 あわせて □こ。`,
        ]);
        return { q, a: String(a + b), easy: `10 ${P} ${a - 5} ${P} ${b - 5}` };
      },
      // かたほうが 5より 小さい
      trap(r) {
        const a = r.int(6, 8), b = r.int(1, Math.min(4, 9 - a));
        const q = r.chance(0.5) ? `${a} ${P} ${b}` : `${b} ${P} ${a}`;
        return { q, a: String(a + b), easy: `（${b}は 5より 《小|ちい》さい。 そのまま）` };
      },
    },
  });

  M.add({
    id: '1-04', part: 1, chap: '1-4', stars: 1,
    title: '《同|おな》じ かずの たし《算|ざん》',
    mark: '**おなじ かず** どうしを たす。 6 ＋ 6、 8 ＋ 8 など。',
    futsu: ['7 ＋ 7 を、 7から', '8、 9、 10、 … 14 と', 'ゆびで かぞえる。'],
    raku: ['《同|おな》じ かずの たし《算|ざん》は おぼえる。', '5 ＋ 5 ＝ 10　6 ＋ 6 ＝ 12', '7 ＋ 7 ＝ 14　8 ＋ 8 ＝ 16', '9 ＋ 9 ＝ 18'],
    why: '7 ＋ 7 は、 5 ＋ 5 ＝ 10 と 2 ＋ 2 ＝ 4 で 14（わざ 1-03）。 いちど たしかめたら、 おぼえて しまおう。',
    caution: '2つの かずが ちがう ときは、 そのままでは つかえない。 1 ちがいなら わざ 1-05。',
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    steps: {
      // a ＋ a
      s1(r) {
        const a = r.int(2, 10);
        const easy = a >= 6 && a <= 9 ? `10 ${P} ${a - 5} ${P} ${a - 5}` : `${a}が 2つで ${2 * a}`;
        return { q: `${a} ${P} ${a}`, a: String(2 * a), easy };
      },
      // □を もとめる（同じ かずの たし算の こたえから もどる）
      s2(r) {
        const a = r.int(3, 9);
        const q = r.chance(0.5) ? `${a} ${P} □ ＝ ${2 * a}` : `□ ${P} ${a} ＝ ${2 * a}`;
        return { q, a: String(a), easy: `${a}と ${a}で ${2 * a}`, verify: chk(a + a === 2 * a, 'ちがう') };
      },
      // なん十・25 ＋ 25 など・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(2, 9);
          return { q: `${a * 10} ${P} ${a * 10}`, a: String(20 * a), easy: `10が ${2 * a}こ` };
        }
        if (k === 1) {
          const t = r.int(1, 4), n = t * 10 + 5;
          return { q: `${n} ${P} ${n}`, a: String(2 * n), easy: `${t * 20} ${P} 10` };
        }
        const a = r.int(3, 9);
        const q = r.pick([
          `おさら 2まいに ${a}こずつ。 ぜんぶで □こ。`,
          `ソラも ミナも ${a}さい。 あわせて □さい。`,
        ]);
        return { q, a: String(2 * a), easy: `${a} ${P} ${a} ＝ ${2 * a}` };
      },
      // 同じ かずでは ない
      trap(r) {
        const a = r.int(2, 7), b = r.int(2, 7);
        if (Math.abs(a - b) < 2 || a + b > 9) return null;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: '（《同|おな》じ かずで ない）' };
      },
    },
  });

  M.add({
    id: '1-05', part: 1, chap: '1-4', stars: 1,
    title: '《同|おな》じ かずの となり',
    mark: '2つの かずが **1 ちがい**（となりどうし）。 7と 8、 8と 9 など。',
    futsu: ['7 ＋ 8 を、 7から', '8、 9、 10、 … 15 と', 'ゆびで 8つ かぞえる。'],
    raku: ['8は 7より 1 《大|おお》きい。', '7 ＋ 8 ＝ 7 ＋ 7 ＋ 1', '　　　＝ 14 ＋ 1 ＝ 15'],
    why: '7 ＋ 7 ＝ 14 を おぼえて いれば（わざ 1-04）、 1 たすだけ。 2 ちがいなら、 1を うつして 《同|おな》じ かずに する。',
    caution: 'ちがいが 3 いじょう ある ときは、 10を つくって たそう（わざ 1-02）。',
    steps: {
      // a ＋ (a＋1)、 (a＋1) ＋ a
      s1(r) {
        const a = r.int(3, 8);
        const q = r.chance(0.5) ? `${a} ${P} ${a + 1}` : `${a + 1} ${P} ${a}`;
        return { q, a: String(2 * a + 1), easy: `${a} ${P} ${a} ${P} 1` };
      },
      // 2 ちがい：1を うつして 同じ かずに（6 ＋ 8 ＝ 7 ＋ 7）
      s2(r) {
        const a = r.int(3, 7);
        const q = r.chance(0.5) ? `${a} ${P} ${a + 2}` : `${a + 2} ${P} ${a}`;
        return { q, a: String(2 * a + 2), easy: `${a + 1} ${P} ${a + 1}` };
      },
      // なん十・25 ＋ 26 など・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(2, 8);
          const q = r.chance(0.5) ? `${a * 10} ${P} ${a * 10 + 10}` : `${a * 10 + 10} ${P} ${a * 10}`;
          return { q, a: String(20 * a + 10), easy: `${a * 10} ${P} ${a * 10} ${P} 10` };
        }
        if (k === 1) {
          const n = r.pick([15, 25, 35, 45]);
          const q = r.chance(0.5) ? `${n} ${P} ${n + 1}` : `${n + 1} ${P} ${n}`;
          return { q, a: String(2 * n + 1), easy: `${n} ${P} ${n} ${P} 1` };
        }
        const a = r.int(5, 8);
        const q = r.pick([
          `カード ${a}まいと ${a + 1}まい。 あわせて □まい。`,
          `どんぐり ${a}こと ${a + 1}こ。 あわせて □こ。`,
        ]);
        return { q, a: String(2 * a + 1), easy: `${a} ${P} ${a} ${P} 1` };
      },
      // ちがいが 3 いじょう
      trap(r) {
        const a = r.int(1, 3), b = r.int(a + 3, 9 - a);
        const q = r.chance(0.5) ? `${a} ${P} ${b}` : `${b} ${P} ${a}`;
        return { q, a: String(a + b), easy: `（${b - a} ちがう。 そのまま たす）` };
      },
    },
  });

  M.add({
    id: '1-06', part: 1, chap: '1-4', stars: 1,
    title: 'たす じゅんばんを かえて 10を つくる',
    mark: '3つ たす とき、 **たして 10に なる くみ**（7と 3 など）が はなれて いる。',
    futsu: ['7 ＋ 6 ＋ 3 を まえから。', '7 ＋ 6 ＝ 13（くり《上|あ》がる）', '13 ＋ 3 ＝ 16'],
    raku: ['7と 3で 10。 さきに たす。', '7 ＋ 6 ＋ 3 ＝ 7 ＋ 3 ＋ 6', '　　　　　 ＝ 10 ＋ 6 ＝ 16'],
    why: 'たし《算|ざん》は、 たす じゅんばんを 《入|い》れかえても こたえは おなじ（《教科書|きょう|か|しょ》 1-4・1-7）。 10の まとまりを さきに つくる。',
    caution: '10に なる くみが ない ときは、 まえから じゅんに たそう。',
    steps: {
      // a ＋ c ＋ (10－a)
      s1(r) {
        const a = r.int(1, 9), b = 10 - a, c = r.int(2, 9);
        if (c === a || c === b) return null;
        return { q: `${a} ${P} ${c} ${P} ${b}`, a: String(10 + c), easy: `（${a} ${P} ${b}） ${P} ${c}` };
      },
      // 2けたの かずを なん十に する（56 ＋ 8 ＋ 4、 8 ＋ 5 ＋ 12）
      s2(r) {
        const t = r.int(1, 6), u = r.int(1, 9), x = t * 10 + u, c = r.int(2, 9);
        if (c === u || c === 10 - u) return null;
        if (r.chance(0.5)) {
          return { q: `${x} ${P} ${c} ${P} ${10 - u}`, a: String(x + c + 10 - u), easy: `（${x} ${P} ${10 - u}） ${P} ${c}` };
        }
        const y = 10 + u, a = 10 - u;
        return { q: `${a} ${P} ${c} ${P} ${y}`, a: String(a + c + y), easy: `（${a} ${P} ${y}） ${P} ${c}` };
      },
      // □を もとめる・ことばの もんだい
      s3(r) {
        const a = r.int(1, 9), b = 10 - a, c = r.int(2, 9);
        if (c === a || c === b) return null;
        if (r.chance(0.5)) {
          return { q: `${a} ${P} □ ${P} ${b} ＝ ${10 + c}`, a: String(c), easy: `${a}と ${b}で 10`, verify: chk(a + c + b === 10 + c, 'ちがう') };
        }
        const q = r.pick([
          `あめを ${a}こ、 ${c}こ、 ${b}こ もらった。 ぜんぶで □こ。`,
          `おはじき ${a}こ、 ${c}こ、 ${b}こ。 ぜんぶで □こ。`,
        ]);
        return { q, a: String(10 + c), easy: `（${a} ${P} ${b}） ${P} ${c}` };
      },
      // 10に なる くみが ない
      trap(r) {
        const a = r.int(2, 8), b = r.int(2, 8), c = r.int(2, 8);
        if (a + b === 10 || a + c === 10 || b + c === 10) return null;
        return { q: `${a} ${P} ${b} ${P} ${c}`, a: String(a + b + c), easy: '（10に なる くみが ない）' };
      },
    },
  });

  M.add({
    id: '1-07', part: 1, chap: '1-7', stars: 1,
    title: '9を たすときは 10を たして 1 ひく',
    mark: 'たす かずが **9**。 9は 10より 1 すくない。',
    futsu: ['25 ＋ 9 を ひっ《算|さん》で。', '5 ＋ 9 ＝ 14、 1 くり《上|あ》げて', '2 ＋ 1 ＝ 3。 こたえ 34'],
    raku: ['9は 10より 1 すくない。', '25 ＋ 9 ＝ 25 ＋ 10 － 1', '　　　 ＝ 35 － 1 ＝ 34'],
    why: '10を たすのは、 《十|じゅう》の くらいを 1 ふやすだけ（《教科書|きょう|か|しょ》 1-7）。 たしすぎた 1を あとで ひく。',
    caution: 'たす かずが 9（19、 29 …）で ない ときは、 くらいごとに たそう。',
    steps: {
      // 2けた ＋ 9
      s1(r) {
        const n = two(r, 11, 89);
        return { q: `${n} ${P} 9`, a: String(n + 9), easy: `${n} ${P} 10 ${S} 1` };
      },
      // 9 ＋ 2けた（入れかえ）・＋ 19、 ＋ 29
      s2(r) {
        if (r.chance(0.5)) {
          const n = two(r, 11, 89);
          return { q: `9 ${P} ${n}`, a: String(n + 9), easy: `${n} ${P} 10 ${S} 1` };
        }
        const m = r.pick([19, 29]), n = two(r, 11, 99 - m - 1);
        return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `${n} ${P} ${m + 1} ${S} 1` };
      },
      // 3けた ＋ 9・＋ 39、 49・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.intNot(101, 389, v => v % 10 === 0);
          return { q: `${n} ${P} 9`, a: String(n + 9), easy: `${n} ${P} 10 ${S} 1` };
        }
        if (k === 1) {
          const m = r.pick([39, 49]), n = two(r, 11, 99 - m - 1);
          return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `${n} ${P} ${m + 1} ${S} 1` };
        }
        const n = two(r, 21, 89);
        const q = r.pick([
          `シールが ${n}まい。 9まい もらうと □まい。`,
          `${n}《円|えん》 もって いる。 9《円|えん》 もらうと □《円|えん》。`,
        ]);
        return { q, a: String(n + 9), easy: `${n} ${P} 10 ${S} 1` };
      },
      // なん十 ＋ 9（くり上がらない。 そのまま かく）
      trap(r) {
        const t = r.int(1, 9) * 10;
        const q = r.chance(0.5) ? `${t} ${P} 9` : `9 ${P} ${t}`;
        return { q, a: String(t + 9), easy: '（くり《上|あ》がらない）' };
      },
    },
  });

  M.add({
    id: '1-08', part: 1, chap: '1-7', stars: 1,
    title: 'なん《十|じゅう》を たす',
    mark: 'たす かずが **20、 30、 40 …** の ような なん《十|じゅう》（《一|いち》の くらいが 0）。',
    futsu: ['34 ＋ 20 を ひっ《算|さん》で。', '4 ＋ 0 ＝ 4、 3 ＋ 2 ＝ 5。', 'こたえ 54'],
    raku: ['《一|いち》の くらいは その まま 4。', '《十|じゅう》の くらいだけ 3と 2で 5。', '34 ＋ 20 ＝ 50 ＋ 4 ＝ 54'],
    why: '20は 10の まとまりが 2つ。 10の まとまりの かずだけ たせば よく、 ばらは かわらない（《教科書|きょう|か|しょ》 1-7）。',
    caution: 'たす かずの 《一|いち》の くらいが 0で ない ときは、 くらいごとに たそう（わざ 1-09）。',
    steps: {
      // 2けた ＋ なん十（100より 小さい）
      s1(r) {
        const m = r.int(2, 7), t = r.int(1, 9 - m), u = r.int(1, 9), n = t * 10 + u;
        return { q: `${n} ${P} ${m * 10}`, a: String(n + m * 10), easy: `${(t + m) * 10} ${P} ${u}` };
      },
      // なん十 ＋ 2けた（入れかえ）・100を こえる
      s2(r) {
        const t = r.int(1, 9), u = r.int(1, 9), n = t * 10 + u;
        if (r.chance(0.5)) {
          const m = r.int(10 - t, 9);
          return { q: `${n} ${P} ${m * 10}`, a: String(n + m * 10), easy: `${(t + m) * 10} ${P} ${u}` };
        }
        if (t > 7) return null;
        const m = r.int(2, 9 - t);
        return { q: `${m * 10} ${P} ${n}`, a: String(n + m * 10), easy: `${(t + m) * 10} ${P} ${u}` };
      },
      // 3けた ＋ なん十・ことばの もんだい
      s3(r) {
        const t = r.int(1, 7), u = r.int(1, 9), m = r.int(1, 9 - t);
        if (r.chance(0.6)) {
          const h = r.int(1, 8), n = h * 100 + t * 10 + u;
          return { q: `${n} ${P} ${m * 10}`, a: String(n + m * 10), easy: `${h * 100 + (t + m) * 10} ${P} ${u}` };
        }
        const n = t * 10 + u;
        const q = r.pick([
          `${n}《円|えん》と ${m * 10}《円|えん》。 あわせて □《円|えん》。`,
          `シールが ${n}まい。 ${m * 10}まい もらうと □まい。`,
        ]);
        return { q, a: String(n + m * 10), easy: `${(t + m) * 10} ${P} ${u}` };
      },
      // 1けたの かずを たす（十の くらいに たさない）
      trap(r) {
        const t = r.int(2, 8), u = r.int(1, 6), m = r.int(2, 9 - u), n = t * 10 + u;
        return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `（${m}は 《一|いち》の くらい）` };
      },
    },
  });

  M.add({
    id: '1-09', part: 1, chap: '1-7', stars: 1,
    title: 'くらいごとに たす',
    mark: '2けた ＋ 2けた。 **おなじ くらいどうし** で たす（《十|じゅう》と 《十|じゅう》、 《一|いち》と 《一|いち》）。',
    futsu: ['36 ＋ 27 を ひっ《算|さん》で。', 'くらいを たてに そろえて かき、', 'くり《上|あ》がりの 1を かく。'],
    raku: ['30 ＋ 20 ＝ 50、 6 ＋ 7 ＝ 13', '36 ＋ 27 ＝ 50 ＋ 13', '　　　 ＝ 63'],
    why: '36は 30と 6、 27は 20と 7。 10の まとまりと ばらに わけて たしても、 ぜんぶの かずは かわらない（《教科書|きょう|か|しょ》 1-7）。',
    caution: '9や 99を たす ときは、 10・100を たして ひく ほうが らく（わざ 1-07・1-13）。',
    steps: {
      // 2けた ＋ 2けた（100より 小さい）
      s1(r) {
        const a = r.int(1, 7), b = r.int(1, 8 - a), x = r.int(1, 8), y = r.int(1, 8);
        return { q: `${a * 10 + x} ${P} ${b * 10 + y}`, a: String((a + b) * 10 + x + y), easy: `${(a + b) * 10} ${P} ${x + y}` };
      },
      // 100を こえる
      s2(r) {
        const a = r.int(2, 9), b = r.int(10 - a, 9), x = r.int(1, 8), y = r.int(1, 8);
        return { q: `${a * 10 + x} ${P} ${b * 10 + y}`, a: String((a + b) * 10 + x + y), easy: `${(a + b) * 10} ${P} ${x + y}` };
      },
      // 3けた ＋ 3けた・ことばの もんだい
      s3(r) {
        const x = r.int(1, 8), y = r.int(1, 8);
        if (r.chance(0.6)) {
          const h = r.int(1, 7), k = r.int(1, 8 - h), a = r.int(1, 8), b = r.int(0, 8 - a);
          const A = h * 100 + a * 10 + x, B = k * 100 + b * 10 + y;
          return { q: `${A} ${P} ${B}`, a: String(A + B), easy: `${(h + k) * 100} ${P} ${(a + b) * 10} ${P} ${x + y}` };
        }
        const a = r.int(1, 7), b = r.int(1, 8 - a), A = a * 10 + x, B = b * 10 + y;
        const q = r.pick([
          `${A}《円|えん》と ${B}《円|えん》。 あわせて □《円|えん》。`,
          `1くみ ${A}《人|にん》、 2くみ ${B}《人|にん》。 あわせて □《人|にん》。`,
        ]);
        return { q, a: String(A + B), easy: `${(a + b) * 10} ${P} ${x + y}` };
      },
      // 1けたを たす・29 などを たす
      trap(r) {
        const u = r.int(1, 6), m = r.int(2, 9 - u);
        const n = r.chance(0.5) ? r.int(2, 8) * 10 + u : r.int(11, 89) * 10 + u;
        return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `（${m}は 《一|いち》の くらいだけ）` };
      },
    },
  });

  M.add({
    id: '1-10', part: 1, chap: '1-7', stars: 1,
    title: 'きりの よい かずに そろえて たす',
    mark: 'かたほうが **きりの よい かずに ちかい**。 38は 40の 2 てまえ。',
    futsu: ['38 ＋ 27 を ひっ《算|さん》で。', '8 ＋ 7 ＝ 15、 1 くり《上|あ》げて', '3 ＋ 2 ＋ 1 ＝ 6。 こたえ 65'],
    raku: ['38は あと 2で 40。', '27から 2を 38へ うつす。', '38 ＋ 27 ＝ 40 ＋ 25', '　　　 ＝ 65'],
    why: 'かたほうに 2を たし、 もう かたほうから 2を ひくと、 あわせた かずは かわらない（わざ 1-02 の さくらんぼと 《同|おな》じ）。',
    caution: 'どちらも なん《十|じゅう》に ちかく ない（34 ＋ 25 など）ときは、 くらいごとに たそう（わざ 1-09）。',
    steps: {
      // ○8・○7 ＋ 2けた
      s1(r) {
        const ua = r.pick([7, 8]), k = 10 - ua, a = r.int(1, 7), ub = r.int(k + 1, 6), b = r.int(1, 8 - a);
        const A = a * 10 + ua, B = b * 10 + ub;
        return { q: `${A} ${P} ${B}`, a: String(A + B), easy: `${A + k} ${P} ${B - k}` };
      },
      // うしろの かずを きりの よい かずに（入れかえ）
      s2(r) {
        const ua = r.pick([7, 8]), k = 10 - ua, a = r.int(1, 7), ub = r.int(k + 1, 6), b = r.int(1, 8 - a);
        const A = a * 10 + ua, B = b * 10 + ub;
        return { q: `${B} ${P} ${A}`, a: String(A + B), easy: `${A + k} ${P} ${B - k}` };
      },
      // 98・198 など・ことばの もんだい
      s3(r) {
        const ua = r.pick([97, 98]), k = 100 - ua;
        if (r.chance(0.6)) {
          const h = r.int(1, 4), A = h * 100 + ua, B = r.intNot(112, 499, v => v % 10 <= k || v % 10 === 9);
          if (A + B >= 1000) return null;
          const q = r.chance(0.5) ? `${A} ${P} ${B}` : `${B} ${P} ${A}`;
          return { q, a: String(A + B), easy: `${A + k} ${P} ${B - k}` };
        }
        const A = ua, B = r.intNot(12, 89, v => v % 10 <= k || v % 10 === 9);
        const q = r.pick([
          `${A}《円|えん》と ${B}《円|えん》。 あわせて □《円|えん》。`,
          `カードが ${A}まい。 ${B}まい もらうと □まい。`,
        ]);
        return { q, a: String(A + B), easy: `${A + k} ${P} ${B - k}` };
      },
      // どちらも きりの よい かずに ちかく ない
      trap(r) {
        const u = r.pick([7, 8]), n = r.int(1, 8) * 10 + u, m = r.int(1, 9 - u);
        const q = r.chance(0.5) ? `${n} ${P} ${m}` : `${m} ${P} ${n}`;
        return { q, a: String(n + m), easy: '（くり《上|あ》がらない。 そのまま）' };
      },
    },
  });

  M.add({
    id: '1-11', part: 1, chap: '1-7', stars: 1,
    title: '100に なる くみ',
    mark: 'こたえが **100**。 《一|いち》の くらいは たして 10、 《十|じゅう》の くらいは たして 9。',
    futsu: ['37に いくつ たすと 100？', '37から 10ずつ、 1ずつ', 'かぞえて 100まで すすむ。'],
    raku: ['《一|いち》の くらい：7と 3で 10', '《十|じゅう》の くらい：3と 6で 9', '37 ＋ 63 ＝ 100'],
    why: '《一|いち》の くらいの 10が くり《上|あ》がって、 《十|じゅう》の くらいに 1 ふえる。 だから 《十|じゅう》の くらいは 9で 10に なり、 ぜんぶで 100（《教科書|きょう|か|しょ》 1-7）。',
    caution: '《一|いち》の くらいが 0の ときは、 《十|じゅう》の くらいを たして 10に する（40と 60）。',
    steps: {
      // n ＋ □ ＝ 100
      s1(r) {
        const t = r.int(1, 8), u = r.int(1, 9), n = t * 10 + u, b = 100 - n;
        return { q: `${n} ${P} □ ＝ 100`, a: String(b), easy: `${t}と ${9 - t}、 ${u}と ${10 - u}`, verify: chk(n + b === 100, '100に ならない') };
      },
      // □ ＋ n ＝ 100・100は nと □
      s2(r) {
        const t = r.int(1, 8), u = r.int(1, 9), n = t * 10 + u, b = 100 - n;
        const q = r.chance(0.5) ? `□ ${P} ${n} ＝ 100` : `100は ${n}と □`;
        return { q, a: String(b), easy: `${t}と ${9 - t}、 ${u}と ${10 - u}`, verify: chk(n + b === 100, '100に ならない') };
      },
      // おつり（100円）・1000に なる くみ
      s3(r) {
        if (r.chance(0.5)) {
          const h = r.int(1, 8), t = r.int(1, 9), n = h * 100 + t * 10, b = 1000 - n;
          return { q: `${n} ${P} □ ＝ 1000`, a: String(b), easy: `${h}と ${9 - h}、 ${t}と ${10 - t}`, verify: chk(n + b === 1000, '1000に ならない') };
        }
        const t = r.int(1, 8), u = r.int(1, 9), n = t * 10 + u, b = 100 - n;
        const q = r.pick([
          `100《円|えん》 だして ${n}《円|えん》の かいもの。 おつりは □《円|えん》。`,
          `100ページの ほん。 ${n}ページ よんだ。 のこりは □ページ。`,
        ]);
        return { q, a: String(b), easy: `${t}と ${9 - t}、 ${u}と ${10 - u}`, verify: chk(n + b === 100, '100に ならない') };
      },
      // 一の くらいが 0（十の くらいは たして 10）
      trap(r) {
        const n = two(r, 11, 88), b = 99 - n;
        if (b % 10 === 0) return null;
        return { q: `${n} ${P} □ ＝ 99`, a: String(b), easy: '（100で ない。 くり《上|あ》がらない）', verify: chk(n + b === 99, '99に ならない') };
      },
    },
  });

  M.add({
    id: '1-12', part: 1, chap: '1-7', stars: 1,
    title: 'ならべかえて きりの よい くみを つくる',
    mark: '**100に なる くみ**（なん《十|じゅう》でも よい）を さがす。 3つ いじょう たす ときに つかう。',
    futsu: ['25 ＋ 37 ＝ 62、', '62 ＋ 75 ＝ 137', '（くり《上|あ》がりが 3かい）'],
    raku: ['25と 75で 100。 さきに たす。', '25 ＋ 37 ＋ 75 ＝ 25 ＋ 75 ＋ 37', '　　　　　　 ＝ 100 ＋ 37', '　　　　　　 ＝ 137'],
    why: 'たす じゅんばんを かえても こたえは おなじ（わざ 1-06）。 100の まとまりを つくると、 あとは ならべて かくだけ。',
    caution: 'たして なん《十|じゅう》に なる くみが ない ときは、 まえから じゅんに たそう。',
    // 2けたの かず 3つの しきは 2れつに 入らないので 1れつ。 ページに 入るように 数を へらす
    cols: 1,
    counts: { s1: 9, s2: 6, s3: 4, trap: 2 },
    steps: {
      // a ＋ c ＋ (100－a)
      s1(r) {
        const a = two(r, 11, 89), b = 100 - a, c = two(r, 11, 89);
        if ((c % 10) + (a % 10) === 10 || c % 10 === a % 10) return null;
        return { q: `${a} ${P} ${c} ${P} ${b}`, a: String(100 + c), easy: `（${a} ${P} ${b}） ${P} ${c}` };
      },
      // たして なん十に なる くみ
      s2(r) {
        const u = r.int(1, 9), t1 = r.int(1, 4), t2 = r.int(1, 7 - t1);
        const a = t1 * 10 + u, b = t2 * 10 + (10 - u), c = two(r, 11, 89), uc = c % 10;
        if (uc === u || uc === 10 - u) return null;
        const q = r.chance(0.5) ? `${a} ${P} ${c} ${P} ${b}` : `${b} ${P} ${c} ${P} ${a}`;
        return { q, a: String(a + b + c), easy: `（${a} ${P} ${b}） ${P} ${c}` };
      },
      // 4つの かず・ことばの もんだい
      s3(r) {
        const a = two(r, 11, 89), b = two(r, 11, 89);
        if (r.chance(0.5)) {
          if (a === b || a + b === 100 || (a % 10) + (b % 10) === 10) return null;
          return { q: `${a} ${P} ${b} ${P} ${100 - a} ${P} ${100 - b}`, a: '200', easy: `（${a} ${P} ${100 - a}） ${P} （${b} ${P} ${100 - b}）` };
        }
        const A = r.pick([25, 35, 45, 15]), c = b;
        if ((c % 10) === 5) return null;
        const q = `${A}《円|えん》と ${c}《円|えん》と ${100 - A}《円|えん》。 あわせて □《円|えん》。`;
        return { q, a: String(100 + c), easy: `（${A} ${P} ${100 - A}） ${P} ${c}` };
      },
      // なん十に なる くみが ない
      trap(r) {
        const a = two(r, 11, 59), b = two(r, 11, 59), c = two(r, 11, 59);
        const ua = a % 10, ub = b % 10, uc = c % 10;
        if (ua + ub === 10 || ua + uc === 10 || ub + uc === 10) return null;
        return { q: `${a} ${P} ${b} ${P} ${c}`, a: String(a + b + c), easy: '（なん《十|じゅう》に なる くみが ない）' };
      },
    },
  });

  M.add({
    id: '1-13', part: 1, chap: '1-7', stars: 2,
    title: '99・98を たす',
    mark: 'たす かずが **99・98**。 100より 1・2 すくない。',
    futsu: ['46 ＋ 99 を ひっ《算|さん》で。', '6 ＋ 9 ＝ 15、 4 ＋ 9 ＋ 1 ＝ 14', 'くり《上|あ》がりが 2かい。'],
    raku: ['99は 100より 1 すくない。', '46 ＋ 99 ＝ 46 ＋ 100 － 1', '　　　 ＝ 146 － 1 ＝ 145'],
    why: '100を たすのは、 《百|ひゃく》の くらいを 1 ふやすだけ。 たしすぎた 1（98なら 2）を あとで ひく（わざ 1-07 と 《同|おな》じ）。',
    caution: '97より 《小|ちい》さいと、 あとで ひく かずが ふえて まちがえやすい。 くらいごとに たそう。',
    steps: {
      // 2けた ＋ 99
      s1(r) {
        const n = two(r, 12, 98);
        return { q: `${n} ${P} 99`, a: String(n + 99), easy: `${n} ${P} 100 ${S} 1` };
      },
      // ＋ 98・99 ＋ 2けた（入れかえ）
      s2(r) {
        const n = two(r, 12, 98), m = r.pick([98, 98, 99]);
        const q = m === 99 || r.chance(0.4) ? `${m} ${P} ${n}` : `${n} ${P} ${m}`;
        return { q, a: String(n + m), easy: `${n} ${P} 100 ${S} ${100 - m}` };
      },
      // 3けた ＋ 99・199・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.intNot(102, 798, v => v % 10 === 0), m = r.pick([99, 98]);
          return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `${n} ${P} 100 ${S} ${100 - m}` };
        }
        if (k === 1) {
          const n = r.intNot(102, 698, v => v % 10 === 0), m = r.pick([199, 299]);
          if (n + m >= 1000) return null;
          return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `${n} ${P} ${m + 1} ${S} 1` };
        }
        const n = two(r, 21, 98);
        const q = r.pick([
          `${n}《円|えん》 もって いる。 99《円|えん》 もらうと □《円|えん》。`,
          `シールが ${n}まい。 99まい もらうと □まい。`,
        ]);
        return { q, a: String(n + 99), easy: `${n} ${P} 100 ${S} 1` };
      },
      // 99では なく 9・90
      trap(r) {
        const n = two(r, 12, 98), m = r.pick([100, 100, 200]);
        const q = r.chance(0.5) ? `${n} ${P} ${m}` : `${m} ${P} ${n}`;
        return { q, a: String(n + m), easy: `（ちょうど ${m}。 ひかない）` };
      },
    },
  });
})(globalThis.MONDAI);
