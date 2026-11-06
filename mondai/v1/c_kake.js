/* 問題集 第1巻　第3部 かけ算（わざ 1-33〜1-48）　組 c
 * 書き方は v1/README.md。文は第1巻の教科書と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。 */
(function (M) {
  'use strict';
  const T = '×', E = '＝', P = '＋', S = '－';

  M.add({
    id: '1-37', part: 3, chap: '1-13', stars: 1,
    title: '9の だんは 10の だんから ひく',
    mark: 'かける かずに **9** が ある。 9は 10より 1 すくない。',
    futsu: ['9 × 7 は、 9の だんを', '9、 18、 27、 … と', 'じゅんに となえて さがす。'],
    raku: ['9 × 7 ＝ 10 × 7 － 7', '　　　 ＝ 70 － 7', '　　　 ＝ 63'],
    why: '9は 10より 1 すくないので、 9が 7こ は、 10が 7こ より 7 すくない。',
    caution: '9の だんで ない ときは、 《九九|く|く》の まま けいさん しよう。',
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    steps: {
      s1(r) { const n = r.int(1, 9); return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}` }; },
      s2(r) { const n = r.int(1, 9); return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n} ${T} 10 ${S} ${n}` }; },
      s3(r) {
        if (r.chance(0.5)) { const n = r.int(10, 12); return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}` }; }
        const n = r.int(3, 9);
        return { q: Array(n).fill('9').join(` ${P} `), a: String(9 * n), easy: `10 ${T} ${n} ${S} ${n}` };
      },
      trap(r) {
        const a = r.pick([6, 7, 8]), b = r.int(3, 8);
        return { q: `${a} ${T} ${b}`, a: String(a * b), easy: '（9の だんでは ない。 《九九|く|く》で）' };
      },
    },
  });

  M.add({
    id: '1-43', part: 3, chap: '1-13', stars: 2,
    title: '× 9 は 10ばいして ひく',
    mark: '2けたの かずに **9** を かける。 9は 10より 1 すくない。',
    futsu: ['47 × 9 を ひっ《算|さん》で', 'くり《上|あ》がりに', '《気|き》を つけて けいさん。'],
    raku: ['47 × 9 ＝ 47 × 10 － 47', '　　　　＝ 470 － 47', '　　　　＝ 423'],
    why: '9こ は 10こ より 1こ すくない。 10ばいは、 うしろに 0を つけるだけ。',
    caution: '× 8 や × 7 を 10から ひくと、 ひく かずが 2こ、 3こ ぶんに なって、 かえって たいへん。',
    steps: {
      s1(r) { const n = r.intNot(12, 59, v => v % 10 === 0); return { q: `${n} ${T} 9`, a: String(9 * n), easy: `${n * 10} ${S} ${n}` }; },
      s2(r) { const n = r.intNot(12, 98, v => v % 10 === 0); return { q: `9 ${T} ${n}`, a: String(9 * n), easy: `${n * 10} ${S} ${n}` }; },
      s3(r) {
        if (r.chance(0.5)) { const n = r.intNot(12, 49, v => v % 10 === 0); return { q: `${n} ${T} 99`, a: String(99 * n), easy: `${n * 100} ${S} ${n}` }; }
        const n = r.intNot(3, 9, v => v === 5); return { q: `${n} ${T} 19`, a: String(19 * n), easy: `${n * 20} ${S} ${n}` };
      },
      trap(r) { const n = r.intNot(12, 49, v => v % 10 === 0); return { q: `${n} ${T} 8`, a: String(8 * n), easy: '（10ばいして 2こ ひくより、 ひっ《算|さん》で）' }; },
    },
  });
})(globalThis.MONDAI);
