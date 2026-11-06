/* 問題集 第1巻　第1部 たし算（わざ 1-01〜1-13）　組 a
 * 書き方は v1/README.md。 */
(function (M) {
  'use strict';
  const P = '＋';

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
      // くり上がらない（10を つくらなくて よい）
      trap(r) {
        const a = r.int(2, 6), b = r.int(1, 9 - a);
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: '（10を こえない。 そのまま たす）' };
      },
    },
  });
})(globalThis.MONDAI);
