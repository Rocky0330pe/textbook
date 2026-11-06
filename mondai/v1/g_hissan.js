/* 問題集 第1巻　第5部 ひっ算（わざ 1-63〜）　組 g（依頼者の指示 11月6日）
 * ひっ算の問題は hs: { op, a, b } をつける（core.js の M.hissanLayout が方眼の形を作る）。
 * flow: true のわざは、見開きを2つ以上使ってよい（問題が大きいので）。 */
(function (M) {
  'use strict';
  const nz = n => !String(n).includes('0');   // 0の ない かず

  M.add({
    id: '1-69', part: 5, chap: '1-13', stars: 2, flow: true,
    title: '2けた × 2けたの ひっ《算|さん》',
    mark: 'かける かずが 2けた。 **《一|いち》の くらいと 《十|じゅう》の くらいに 《分|わ》けて** かける。',
    futsu: ['38 × 47 を、 38を 47こ', 'たして もとめる。'],
    raku: ['① 38 × 7 ＝ 266 を 《書|か》く', '② 38 × 4 ＝ 152 を 1つ 《左|ひだり》に ずらす', '③ 266 ＋ 1520 ＝ 1786'],
    why: '47は 40と 7。 38 × 40 は 38 × 4 の 10ばいなので、 0を 《書|か》かずに 1つ 《左|ひだり》に ずらす。',
    caution: 'かける かずに 0が ある ときは、 その だんを とばす。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const a = r.intNot(12, 49, v => !nz(v)), b = r.intNot(12, 29, v => !nz(v)); return { q: `${a} × ${b}`, a: String(a * b), easy: `${a} × ${b % 10} ＋ ${a} × ${b - b % 10}`, hs: { op: '*', a: String(a), b: String(b) } }; },
      s2(r) { const a = r.intNot(51, 99, v => !nz(v)), b = r.intNot(31, 99, v => !nz(v)); return { q: `${a} × ${b}`, a: String(a * b), easy: `${a} × ${b % 10} ＋ ${a} × ${b - b % 10}`, hs: { op: '*', a: String(a), b: String(b) } }; },
      s3(r) { const a = r.intNot(12, 99, v => !nz(v)), b = r.pick([11, 21, 31, 41, 12, 22]); return { q: `${a} × ${b}`, a: String(a * b), easy: `${a} × ${b % 10} ＋ ${a} × ${b - b % 10}`, hs: { op: '*', a: String(a), b: String(b) } }; },
      trap(r) { const a = r.intNot(12, 99, v => !nz(v)), b = r.pick([20, 30, 40, 50]); return { q: `${a} × ${b}`, a: String(a * b), easy: `（${a} × ${b / 10} の 10ばい。 0の だんは いらない）`, hs: { op: '*', a: String(a), b: String(b) } }; },
    },
  });

  M.add({
    id: '1-77', part: 5, chap: '1-14', stars: 2, flow: true,
    title: '4けた ÷ 2けたの ひっ《算|さん》',
    mark: 'わる かずが 2けた。 **たてる → かける → ひく → おろす** を くりかえす。',
    futsu: ['6120 ÷ 36 を、 36を なんども', 'ひいて かぞえる。'],
    raku: ['① 61 ÷ 36 → 1を たてる', '② 36 × 1 ＝ 36 を ひく → 25', '③ 2を おろす → 252 ÷ 36 → 7'],
    why: '《大|おお》きな くらいから じゅんに 《分|わ》けて いく。 まえの くらいの のこりは、 つぎの くらいに 10ばいして 《入|い》れる。',
    caution: 'たてた かずが 《大|おお》きすぎたら、 1 《小|ちい》さく して やりなおす。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    steps: {
      s1(r) { const d = r.int(12, 49), q = r.int(101, 299), rem = r.int(0, d - 1), D = d * q + rem; if (D > 9999) return null; return { q: `${D} ÷ ${d}`, a: rem ? `${q} あまり ${rem}` : String(q), hs: { op: '/', a: String(D), b: String(d) } }; },
      s2(r) { const d = r.int(51, 99), q = r.int(11, 99), rem = r.int(0, d - 1), D = d * q + rem; if (D < 1000 || D > 9999) return null; return { q: `${D} ÷ ${d}`, a: rem ? `${q} あまり ${rem}` : String(q), hs: { op: '/', a: String(D), b: String(d) } }; },
      s3(r) { const d = r.int(21, 49), q = r.pick([105, 203, 301, 120, 240]), D = d * q; if (D > 9999) return null; return { q: `${D} ÷ ${d}`, a: String(q), easy: '（しょうに 0が たつ）', hs: { op: '/', a: String(D), b: String(d) } }; },
      trap(r) { const d = r.pick([20, 30, 40, 50]), q = r.int(12, 99), D = d * q * 10; if (D > 9999) return null; return { q: `${D} ÷ ${d}`, a: String(q * 10), easy: `（どちらも 0で おわる。 ${D / 10} ÷ ${d / 10} と おなじ）`, hs: { op: '/', a: String(D), b: String(d) } }; },
    },
  });
})(globalThis.MONDAI);
