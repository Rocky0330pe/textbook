/* 問題集 第1巻　第5部 ひっ算（わざ 1-63〜1-82）　組 g（依頼者の指示 11月6日）
 * ひっ算の問題は hs: { op, a, b } をつける（core.js の M.hissanLayout が方眼の形を作る）。
 * flow: true のわざは、見開きを2つ以上使ってよい（問題が大きいので）。
 * 1-72・1-80・1-82 は、方眼でなく式で考えるので、ふつうの問題（□の欄）。 */
(function (M) {
  'use strict';
  const S = String;
  const OP = { '+': '＋', '-': '－', '*': '×', '/': '÷' };
  const nz = n => !S(n).includes('0');   // 0の ない かず
  const tens = n => Math.floor(n / 10) % 10;
  // ひっ算の 問題（q は 式の 文、 hs は 方眼）
  const hsq = (op, x, y, a, more) => Object.assign({ q: `${x} ${OP[op]} ${y}`, a: S(a), hs: { op, a: S(x), b: S(y) } }, more || {});
  // 入れかえただけの 問題は 同じと みる（H-6）
  const kswap = (op, x, y) => `${op}:${Math.min(x, y)}:${Math.max(x, y)}`;
  // くり上がり・くり下がりの 数
  const carries = (x, y) => { let c = 0, n = 0; while (x || y) { c = (x % 10 + y % 10 + c) >= 10 ? 1 : 0; n += c; x = Math.floor(x / 10); y = Math.floor(y / 10); } return n; };
  const borrows = (x, y) => { let b = 0, n = 0; while (x) { b = (x % 10 - y % 10 - b) < 0 ? 1 : 0; n += b; x = Math.floor(x / 10); y = Math.floor(y / 10); } return n; };
  const divA = (q, rem) => (rem ? `${q} あまり ${rem}` : S(q));
  // 小数：n を 10^F で わった かずの 文字（345, 2 → '3.45'）
  const dec = (n, F) => { if (!F) return S(n); const s = S(n).padStart(F + 1, '0'); return s.slice(0, -F) + '.' + s.slice(-F); };
  // かけ算の 楽な形（下の かずを くらいに 分ける。 0の くらいは 書かない）
  const split = (a, b) => { const out = []; let p = 1; for (let x = b; x; x = Math.floor(x / 10), p *= 10) if (x % 10) out.push(`${a} × ${(x % 10) * p}`); return out.join(' ＋ '); };
  const mulq = (x, y, more) => hsq('*', x, y, x * y, Object.assign({ key: kswap('*', x, y) }, more || {}));
  const addq = (x, y, more) => hsq('+', x, y, x + y, Object.assign({ key: kswap('+', x, y) }, more || {}));
  const kuri = (n, w) => `（くり《${w}|${w === '上' ? 'あ' : 'さ'}》がり ${n}かい）`;

  // ================================================================ たし算・ひき算（教科書 1-7）
  M.add({
    id: '1-63', part: 5, chap: '1-7', stars: 1, flow: true,
    title: 'たし《算|ざん》の ひっ《算|さん》',
    mark: 'くらいを **たてに そろえて**、 《一|いち》の くらいから たす。 10を こえたら 1つ 《左|ひだり》へ くり《上|あ》がる。',
    futsu: ['386 ＋ 47 を、 386から', '47 かぞえたす。'],
    raku: ['① 6 ＋ 7 ＝ 13 → 3を 《書|か》き、 1を くり《上|あ》げる', '② 8 ＋ 4 ＋ 1 ＝ 13 → 3を 《書|か》き、 1を くり《上|あ》げる', '③ 3 ＋ 1 ＝ 4 → こたえは 433'],
    why: '《同|おな》じ くらいどうしを たす。 10の まとまりは、 1つ 《左|ひだり》の くらいの 1に なる（1-7）。',
    caution: '298 ＋ 35 の ように 《切|き》りの よい かずに ちかい ときは、 ひっ《算|さん》に しなくても よい。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const x = r.int(13, 79), y = r.int(12, 89); if (!nz(x) || !nz(y) || x % 10 + y % 10 < 10 || x + y > 99) return null; return addq(x, y, { easy: kuri(1, '上') }); },
      s2(r) { const x = r.int(112, 899), y = r.int(12, 98); if (!nz(x) || !nz(y) || x + y > 999) return null; const c = carries(x, y); if (c < 1) return null; return addq(x, y, { easy: kuri(c, '上') }); },
      s3(r) { const x = r.int(123, 899), y = r.int(123, 899); if (!nz(x) || !nz(y)) return null; const c = carries(x, y); if (c < 2) return null; return addq(x, y, { easy: kuri(c, '上') }); },
      trap(r) {
        const h = r.int(2, 8), k = r.int(1, 3), x = h * 100 - k, y = r.int(23, 98); if (!nz(y)) return null;
        return addq(x, y, { easy: `（${x}は あと ${k}で ${h * 100}。 ${h * 100} ＋ ${y - k} と あんざんで）` });
      },
    },
  });

  M.add({
    id: '1-64', part: 5, chap: '1-7', stars: 1, flow: true,
    title: 'ひき《算|ざん》の ひっ《算|さん》',
    mark: '《一|いち》の くらいが ひけない ときは、 **1つ 《左|ひだり》の くらいから 10を かりる**（くり《下|さ》がり）。',
    futsu: ['352 － 87 を、 352から', '87 かぞえて もどる。'],
    raku: ['① 2 － 7 は できない → 10 かりて 12 － 7 ＝ 5', '② 4 － 8 も できない → 14 － 8 ＝ 6', '③ 《百|ひゃく》の くらいは 3が 2に → こたえは 265'],
    why: '《十|じゅう》の くらいの 1は 10。 1つ かりると、 《十|じゅう》の くらいは 1 へり、 《一|いち》の くらいは 10 ふえる（1-7）。',
    caution: '101 － 96 の ように 2つの かずが ちかい ときは、 ひくより かぞえたす ほうが はやい。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const x = r.int(31, 98), y = r.int(12, x - 10); if (!nz(y) || x % 10 >= y % 10) return null; return hsq('-', x, y, x - y, { easy: kuri(1, '下') }); },
      s2(r) { const x = r.int(211, 999), y = r.int(12, 98); if (!nz(x) || !nz(y) || x - y < 100) return null; const b = borrows(x, y); if (b < 1) return null; return hsq('-', x, y, x - y, { easy: kuri(b, '下') }); },
      s3(r) { const x = r.int(312, 999), y = r.int(123, x - 100); if (!nz(x) || !nz(y)) return null; const b = borrows(x, y); if (b < 2) return null; return hsq('-', x, y, x - y, { easy: kuri(b, '下') }); },
      trap(r) {
        const h = r.int(1, 8), x = h * 100 + r.int(1, 6), y = h * 100 - r.int(2, 6);
        return hsq('-', x, y, x - y, { easy: `（ちかい かず。 ${y}から ${x}まで かぞえたす）` });
      },
    },
  });

  M.add({
    id: '1-65', part: 5, chap: '1-7', stars: 2, flow: true,
    title: '0の ならぶ ひき《算|ざん》の ひっ《算|さん》',
    mark: 'ひかれる かずに **0が ならぶ**。 となりが 0で かりられない ときは、 もっと 《左|ひだり》から じゅんに かりる。',
    futsu: ['1000 － 386 で、 0 － 6 が できない。', 'となりも 0で、 かりられない。'],
    raku: ['① 《千|せん》から かりて、 1000 → 9 9 10', '② 10 － 6 ＝ 4、 9 － 8 ＝ 1、 9 － 3 ＝ 6', '③ こたえは 614'],
    why: '1000は 999 ＋ 1。 だから 1000 － 386 は 999 － 386 ＋ 1 と 《同|おな》じで、 くり《下|さ》がりが いらなく なる。',
    caution: '405 － 203 の ように、 0が あっても どの くらいも ひける ときは、 かりなくて よい。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) {
        const x = r.pick([200, 300, 400, 500, 600, 700, 800, 900, 1000, 1000]), y = r.int(12, Math.min(x - 1, 999));
        if (y % 10 === 0 || tens(y) === 0) return null;
        return hsq('-', x, y, x - y, { easy: `${x - 1} － ${y} ＋ 1` });
      },
      s2(r) {
        const h = r.int(2, 9), o = r.int(0, 8), x = h * 100 + o, y = r.int(18, x - 11);
        if (y % 10 <= o || tens(y) === 0) return null;
        return hsq('-', x, y, x - y, { easy: '（《十|じゅう》の くらいが 0 なので、 《百|ひゃく》の くらいから かりる）' });
      },
      s3(r) {
        const k = r.int(2, 9), o = r.pick([0, 0, r.int(1, 8)]), x = k * 1000 + o, y = r.int(123, k * 1000 - 1);
        if (y % 10 <= o || tens(y) === 0) return null;
        return hsq('-', x, y, x - y, { easy: `${x - o - 1} － ${y} ＋ ${o + 1}` });
      },
      trap(r) {
        const h = r.int(3, 9), o = r.int(2, 9), x = h * 100 + o, y = r.int(1, h - 1) * 100 + r.int(1, o);
        return hsq('-', x, y, x - y, { easy: '（どの くらいも その まま ひける。 くり《下|さ》がりは いらない）' });
      },
    },
  });

  M.add({
    id: '1-66', part: 5, chap: '1-7', stars: 2, flow: true,
    title: '4けた・5けたの たし《算|ざん》・ひき《算|ざん》の ひっ《算|さん》',
    mark: 'けたが ふえても **《一|いち》の くらいから じゅんに**、 くり《上|あ》がり・くり《下|さ》がりを 1つずつ。',
    futsu: ['4867 ＋ 2759 を、 《千|せん》・《百|ひゃく》・', '《十|じゅう》・《一|いち》に 《分|わ》けて あんざんする。'],
    raku: ['① 7 ＋ 9 ＝ 16 → 6、 くり《上|あ》がり 1', '② 6 ＋ 5 ＋ 1 ＝ 12 → 2、 ③ 8 ＋ 7 ＋ 1 ＝ 16 → 6', '④ 4 ＋ 2 ＋ 1 ＝ 7 → こたえは 7626'],
    why: 'どの くらいでも、 10 あつまると 1つ 《左|ひだり》の くらいの 1に なる。 2けたと やりかたは 《同|おな》じ。',
    caution: '4998 ＋ 2456 の ように、 《切|き》りの よい かずに ちかい ときは、 あんざんの ほうが はやい。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const x = r.int(1234, 8999), y = r.int(1234, 8999); if (!nz(x) || !nz(y)) return null; const c = carries(x, y); if (c < 2) return null; return addq(x, y, { easy: kuri(c, '上') }); },
      s2(r) {
        const x = r.int(2345, 9999), y = r.chance(0.3) ? r.int(123, 999) : r.int(1234, x - 1000); if (!nz(x) || !nz(y)) return null;
        const b = borrows(x, y); if (b < 2) return null; return hsq('-', x, y, x - y, { easy: kuri(b, '下') });
      },
      s3(r) {
        const x = r.int(12345, 89999), y = r.chance(0.5) ? r.int(1234, 9999) : r.int(12345, 89999); if (!nz(x) || !nz(y)) return null;
        if (r.chance(0.5)) { const c = carries(x, y); if (c < 2) return null; return addq(x, y, { easy: kuri(c, '上') }); }
        if (y >= x) return null; const b = borrows(x, y); if (b < 2) return null; return hsq('-', x, y, x - y, { easy: kuri(b, '下') });
      },
      trap(r) {
        const h = r.int(2, 7), k = r.int(1, 3), x = h * 1000 - k, y = r.int(1234, 8999); if (!nz(y)) return null;
        return addq(x, y, { easy: `（${x}は あと ${k}で ${h * 1000}。 ${h * 1000} ＋ ${y - k} と あんざんで）` });
      },
    },
  });

  // ================================================================ かけ算（教科書 1-12・1-13 と その 先）
  M.add({
    id: '1-67', part: 5, chap: '1-13', stars: 2, flow: true,
    title: '2けた × 1けたの ひっ《算|さん》',
    mark: '《下|した》の かずが 1けた。 **《一|いち》の くらいから** かけて、 くり《上|あ》がりは つぎの こたえに たす。',
    futsu: ['46 × 3 を、 46 ＋ 46 ＋ 46 と', 'たして もとめる。'],
    raku: ['① 6 × 3 ＝ 18 → 8を 《書|か》き、 1を くり《上|あ》げる', '② 4 × 3 ＝ 12、 12 ＋ 1 ＝ 13', '③ こたえは 138'],
    why: '46は 40と 6。 6 × 3 と 40 × 3 を 《分|わ》けて かけて、 あとで たす（1-13 だんを たして つくる）。',
    caution: '30 × 4 の ように 《一|いち》の くらいが 0 なら、 3 × 4 の 10ばいで よい。',
    counts: { s1: 8, s2: 4, s3: 4, trap: 2 },
    steps: {
      s1(r) { const x = r.int(12, 49), y = r.int(2, 8); if (!nz(x) || (x % 10) * y < 10 || x * y > 99) return null; return mulq(x, y, { easy: split(y, x).replace(/(\d+) × (\d+)/g, '$2 × $1') }); },
      s2(r) { const x = r.int(51, 99), y = r.int(6, 9); if (!nz(x)) return null; return mulq(x, y, { easy: split(y, x).replace(/(\d+) × (\d+)/g, '$2 × $1') }); },
      s3(r) { const x = r.int(12, 99), y = r.int(2, 9); if (!nz(x) || (x * y) % 10) return null; return mulq(x, y, { easy: `（こたえの 《一|いち》の くらいは 0。 くり《上|あ》がりを わすれない）` }); },
      trap(r) { const t = r.int(2, 9), y = r.int(2, 9), x = t * 10; return mulq(x, y, { easy: `（${t} × ${y} の 10ばい。 ひっ《算|さん》は いらない。 わざ 1-72）`, also: ['1-72'] }); },
    },
  });

  M.add({
    id: '1-68', part: 5, chap: '1-13', stars: 2, flow: true,
    title: '3けた × 1けたの ひっ《算|さん》',
    mark: '3けたでも **《一|いち》 → 《十|じゅう》 → 《百|ひゃく》** の じゅんに かけ、 くり《上|あ》がりを たして いく。',
    futsu: ['487 × 6 を、 487を 6かい', 'たして もとめる。'],
    raku: ['① 7 × 6 ＝ 42 → 2、 くり《上|あ》がり 4', '② 8 × 6 ＝ 48、 48 ＋ 4 ＝ 52 → 2、 くり《上|あ》がり 5', '③ 4 × 6 ＝ 24、 24 ＋ 5 ＝ 29 → 2922'],
    why: '487は 400と 80と 7。 くらいごとに かけて たすのと 《同|おな》じ。',
    caution: '300 × 4 の ように なん《百|びゃく》 なら、 3 × 4 の 100ばいで よい。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const x = r.int(112, 399), y = r.int(2, 4); if (!nz(x) || (x % 10) * y < 10) return null; return mulq(x, y, { easy: `${x % 10} × ${y} ＋ ${tens(x) * 10} × ${y} ＋ ${x - x % 100} × ${y}` }); },
      s2(r) { const x = r.int(234, 999), y = r.int(6, 9); if (!nz(x)) return null; return mulq(x, y, { easy: `${x % 10} × ${y} ＋ ${tens(x) * 10} × ${y} ＋ ${x - x % 100} × ${y}` }); },
      s3(r) {
        const h = r.int(1, 9), o = r.int(2, 9), y = r.int(3, 9), x = h * 100 + o; if (o * y < 10) return null;
        return mulq(x, y, { easy: `（《十|じゅう》の くらいは 0 × ${y} が 0。 くり《上|あ》がりの ${Math.floor(o * y / 10)}だけ 《書|か》く）` });
      },
      trap(r) { const h = r.int(2, 9), y = r.int(2, 9), x = h * 100; return mulq(x, y, { easy: `（${h} × ${y} の 100ばい。 ひっ《算|さん》は いらない。 わざ 1-72）`, also: ['1-72'] }); },
    },
  });

  M.add({
    id: '1-69', part: 5, chap: '1-13', stars: 2, flow: true,
    title: '2けた × 2けたの ひっ《算|さん》',
    mark: '《下|した》の かずが 2けた。 **《一|いち》の くらいと 《十|じゅう》の くらいに 《分|わ》けて** かける。',
    futsu: ['38 × 47 を、 38を 47こ', 'たして もとめる。'],
    raku: ['① 38 × 7 ＝ 266 を 《書|か》く', '② 38 × 4 ＝ 152 を 1つ 《左|ひだり》に ずらす', '③ 266 ＋ 1520 ＝ 1786'],
    why: '47は 40と 7。 38 × 40 は 38 × 4 の 10ばいなので、 0を 《書|か》かずに 1つ 《左|ひだり》に ずらす。',
    caution: '《下|した》の かずが 20・30 の ように 0で おわる ときは、 0の だんは いらない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const a = r.intNot(12, 49, v => !nz(v)), b = r.intNot(12, 29, v => !nz(v)); return mulq(a, b, { easy: split(a, b) }); },
      s2(r) { const a = r.intNot(51, 99, v => !nz(v)), b = r.intNot(31, 99, v => !nz(v)); return mulq(a, b, { easy: split(a, b) }); },
      s3(r) { const a = r.intNot(12, 99, v => !nz(v)), b = r.pick([11, 21, 31, 41, 12, 22]); return mulq(a, b, { easy: split(a, b) }); },
      trap(r) { const a = r.intNot(12, 99, v => !nz(v)), b = r.pick([20, 30, 40, 50]); return mulq(a, b, { easy: `（${a} × ${b / 10} の 10ばい。 0の だんは いらない。 わざ 1-72）`, also: ['1-72'] }); },
    },
  });

  M.add({
    id: '1-70', part: 5, chap: '1-13', stars: 2, flow: true,
    title: '3けた × 2けたの ひっ《算|さん》',
    mark: '《上|うえ》が 3けた、 《下|した》が 2けた。 **だんは 2つ**。 2だんめは 1つ 《左|ひだり》に ずらす。',
    futsu: ['386 × 47 を、 386 × 40 と', '386 × 7 に して あんざんする。'],
    raku: ['① 386 × 7 ＝ 2702', '② 386 × 4 ＝ 1544 を 1つ 《左|ひだり》に', '③ 2702 ＋ 15440 ＝ 18142'],
    why: '2けた × 2けたと 《同|おな》じ。 《上|うえ》の かずが 3けたに なっても、 だんの かずは 《下|した》の かずの けたで きまる。',
    caution: '《下|した》の かずが なん《十|じゅう》 なら、 0の だんは いらない（わざ 1-72）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const a = r.int(112, 499), b = r.int(12, 29); if (!nz(a) || !nz(b)) return null; return mulq(a, b, { easy: split(a, b) }); },
      s2(r) { const a = r.int(512, 999), b = r.int(31, 99); if (!nz(a) || !nz(b)) return null; return mulq(a, b, { easy: split(a, b) }); },
      s3(r) { const a = r.int(1234, 9876), b = r.int(12, 99); if (!nz(a) || !nz(b)) return null; return mulq(a, b, { easy: `（4けたでも だんは 2つ） ${split(a, b)}`, easyCheck: false }); },
      trap(r) { const a = r.int(112, 999), t = r.int(2, 9); if (!nz(a)) return null; return mulq(a, t * 10, { easy: `（${a} × ${t} の 10ばい。 0の だんは いらない。 わざ 1-72）`, also: ['1-72'] }); },
    },
  });

  M.add({
    id: '1-71', part: 5, chap: '1-13', stars: 2, flow: true,
    title: '3けた × 3けたの ひっ《算|さん》',
    mark: '《下|した》の かずが 3けた。 **だんは 3つ**、 1だんずつ 1つ 《左|ひだり》に ずらして、 さいごに たす。',
    futsu: ['234 × 156 を、 234 × 100、 234 × 50、', '234 × 6 に 《分|わ》けて あんざんする。'],
    raku: ['① 234 × 6 ＝ 1404', '② 234 × 5 ＝ 1170 を 1つ、 234 × 1 ＝ 234 を 2つ 《左|ひだり》に', '③ 1404 ＋ 11700 ＋ 23400 ＝ 36504'],
    why: '156は 100と 50と 6。 3つに 《分|わ》けて かけ、 ずらした だんを たす。',
    caution: '《下|した》の かずが なん《百|びゃく》 なら、 だんは いらない（わざ 1-72）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    steps: {
      s1(r) { const a = r.int(112, 499), b = r.int(112, 299); if (!nz(a) || !nz(b)) return null; return mulq(a, b, { easy: split(a, b) }); },
      s2(r) { const a = r.int(512, 999), b = r.int(312, 999); if (!nz(a) || !nz(b)) return null; return mulq(a, b, { easy: split(a, b) }); },
      s3(r) { const a = r.int(1234, 9876), b = r.int(123, 987); if (!nz(a) || !nz(b)) return null; return mulq(a, b, { easy: split(a, b) }); },
      trap(r) { const a = r.int(112, 999), h = r.int(2, 9); if (!nz(a)) return null; return mulq(a, h * 100, { easy: `（${a} × ${h} の 100ばい。 0の だんは いらない。 わざ 1-72）`, also: ['1-72'] }); },
    },
  });

  // 1-72：方眼でなく 式で 考える
  const P10 = z => Math.pow(10, z);
  M.add({
    id: '1-72', part: 5, chap: '1-13', stars: 2, flow: true,
    title: 'おわりに 0の ある かけ《算|ざん》',
    mark: 'かけ《算|ざん》の かずの **おわりに 0が ある**。 0を とって かけ、 とった 0を あとで つける。',
    futsu: ['230 × 40 を ひっ《算|さん》で、', '0の だんも 《書|か》いて かける。'],
    raku: ['① 0を とる：23 × 4 ＝ 92', '② とった 0は 1 ＋ 1 ＝ 2こ', '③ 92に 0を 2こ つけて 9200'],
    why: '230は 23の 10ばい、 40は 4の 10ばい。 だから こたえは 23 × 4 の 100ばい。',
    caution: '205 の ような なかの 0は とれない（わざ 1-73）。',
    counts: { s1: 8, s2: 8, s3: 4, trap: 2 },
    cols: { s3: 1 }, boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '18mm' },
    steps: {
      s1(r) {
        const m = r.int(12, 49), n = r.int(2, 9), z = r.int(1, 2); if (!nz(m)) return null;
        const [x, y] = r.chance(0.5) ? [m * P10(z), n] : [m, n * P10(z)];
        return { q: `${x} × ${y}`, a: S(x * y), easy: `${m} × ${n} × ${P10(z)}`, key: kswap('*', x, y) };
      },
      s2(r) {
        const m = r.pick([r.int(2, 9), r.int(12, 49)]), n = r.int(2, 9), za = r.int(1, 2), zb = r.int(1, 2); if (!nz(m) || za + zb > 3) return null;
        const x = m * P10(za), y = n * P10(zb);
        return { q: `${x} × ${y}`, a: S(x * y), easy: `${m} × ${n} × ${P10(za + zb)}`, key: kswap('*', x, y) };
      },
      s3(r) {
        const it = r.pick([['1さつ', 'ノート', 'さつ'], ['1こ', 'ボール', 'こ'], ['1まい', 'シール', 'まい'], ['1こ', 'ケーキ', 'こ']]);
        const m = r.pick([r.int(2, 9), r.int(12, 25)]), k = r.int(2, 9); if (!nz(m)) return null;
        return { q: `${it[0]} ${m * 10}《円|えん》の ${it[1]}を ${k * 10}${it[2]} かうと、 ぜんぶで □《円|えん》。`, a: S(m * k * 100), easy: `${m} × ${k} × 100` };
      },
      trap(r) {
        const h = r.int(1, 9), o = r.int(1, 9), n = r.int(2, 9), x = h * 100 + o;
        return { q: `${x} × ${n * 10}`, a: S(x * n * 10), easy: `（${x}の なかの 0は とれない。 ${x} × ${n} の 10ばい。 わざ 1-73）`, also: ['1-73'] };
      },
    },
  });

  M.add({
    id: '1-73', part: 5, chap: '1-13', stars: 2, flow: true,
    title: 'なかに 0の ある かけ《算|ざん》の ひっ《算|さん》',
    mark: '**なかに 0が ある** かけ《算|ざん》。 《下|した》の かずの 0の だんは 《書|か》かずに とばす。',
    futsu: ['24 × 305 で、 24 × 0 の だんも', '000 と 《書|か》いて たす。'],
    raku: ['① 24 × 5 ＝ 120', '② 0の だんは とばす', '③ 24 × 3 ＝ 72 を 2つ 《左|ひだり》に → 7320'],
    why: '305は 300と 5。 24 × 0 は 0 なので、 たしても かわらない。',
    caution: '《上|うえ》の かずの 0（305 × 24）は とばさない。 0 × 4 ＝ 0 に くり《上|あ》がりを たす。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const a = r.int(1, 9) * 100 + r.int(1, 9), b = r.int(12, 99); if (!nz(b)) return null; return mulq(a, b, { easy: `（《上|うえ》の 0は とばさない） ${split(a, b)}`, easyCheck: false }); },
      s2(r) { const a = r.int(12, 99), b = r.int(1, 9) * 100 + r.int(1, 9); if (!nz(a)) return null; return mulq(a, b, { easy: split(a, b) }); },
      s3(r) { const a = r.int(112, 999), b = r.int(1, 9) * 100 + r.int(1, 9); if (!nz(a)) return null; return mulq(a, b, { easy: split(a, b) }); },
      trap(r) {
        const m = r.int(12, 99), b = r.int(12, 99); if (!nz(m) || !nz(b)) return null; const a = m * 10;
        return mulq(a, b, { easy: `（おわりの 0は とって、 ${m} × ${b} に 0を つける。 わざ 1-72）`, also: ['1-72'] });
      },
    },
  });

  // ================================================================ わり算（教科書 1-14・1-15 と その 先）
  // わる かずが 2けた以上の ときの「かりの しょう」：わる かずの 《一|いち》の くらいを かくして たてる
  const kariQ = (D, d) => { const cut = S(d).length - 1; return Math.min(9, Math.floor(Math.floor(D / P10(cut)) / Math.floor(d / P10(cut)))); };
  const divq = (D, d, more) => hsq('/', D, d, divA(Math.floor(D / d), D % d), more);
  const tashi = (D, d) => { const q = Math.floor(D / d), m = D % d; return `（たしかめ：${d} × ${q}${m ? ` ＋ ${m}` : ''} が ${D}）`; };

  M.add({
    id: '1-74', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: '2けた・3けた ÷ 1けたの ひっ《算|さん》',
    mark: '《大|おお》きい くらいから **たてる → かける → ひく → おろす** を くりかえす。',
    futsu: ['84 ÷ 3 を、 84から 3を', 'なんかいも ひいて かぞえる。'],
    raku: ['① 8 ÷ 3 → 2を たてる、 3 × 2 ＝ 6、 8 － 6 ＝ 2', '② 4を おろして 24', '③ 24 ÷ 3 → 8を たてる → こたえは 28'],
    why: '84は 10が 8こと 1が 4こ。 10の たばを さきに 《分|わ》け、 のこった たばは ばらして つぎの くらいへ。',
    caution: '56 ÷ 7 の ように 《九九|く|く》で すぐ わかる ときは、 ひっ《算|さん》に しなくて よい。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) { const d = r.int(2, 4), q = r.int(11, 49), D = d * q; if (!nz(q) || D > 99) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s2(r) { const d = r.int(2, 8), q = r.int(111, 499), m = r.int(0, d - 1), D = d * q + m; if (!nz(q) || D > 999) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s3(r) {
        const d = r.int(3, 9), q = r.int(12, 99), m = r.int(0, d - 1), D = d * q + m; if (!nz(q) || D < 100 || D > 999 || Math.floor(D / 100) >= d) return null;
        return divq(D, d, { easy: `（${Math.floor(D / 100)}には ${d}が ないので、 ${Math.floor(D / 10)}から わる。 しょうは 2けた）` });
      },
      trap(r) {
        const d = r.int(3, 9), q = r.int(3, 9), m = r.chance(0.5) ? 0 : r.int(1, d - 1), D = d * q + m; if (D < 10) return null;
        return divq(D, d, m ? { easy: `（${d} × ${q} ＝ ${d * q}、 あまり ${m}。 《九九|く|く》で すぐ。 わざ 1-52）`, also: ['1-52'] } : { easy: `（${d} × ${q} ＝ ${D}。 《九九|く|く》で すぐ。 わざ 1-49）`, also: ['1-49'] });
      },
    },
  });

  M.add({
    id: '1-75', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: 'しょうに 0が たつ わり《算|ざん》の ひっ《算|さん》',
    mark: 'おろした かずが わる かずより 《小|ちい》さい。 **0を たてて**、 もう 1つ おろす。',
    futsu: ['612 ÷ 3 で、 1 ÷ 3 が できないので', 'その くらいを とばして 24 と する。'],
    raku: ['① 6 ÷ 3 → 2、 6 － 6 ＝ 0', '② 1を おろす：1 ÷ 3 は できない → 0を たてる', '③ 2を おろして 12 ÷ 3 → 4 → こたえは 204'],
    why: '612は 100が 6こ、 10が 1こ、 1が 2こ。 10の たばは 3つに 《分|わ》けられないので 《十|じゅう》の くらいは 0。',
    caution: '702 ÷ 6 の ように、 わられる かずの 0は、 しょうの 0とは かぎらない。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    steps: {
      s1(r) { const d = r.int(2, 9), q = r.int(1, 4) * 100 + r.int(1, 9), D = d * q; if (D > 999) return null; return divq(D, d, { easy: '（《十|じゅう》の くらいに 0を たてる）' }); },
      s2(r) { const d = r.int(2, 9), q = r.int(1, 4) * 100 + r.int(1, 9), m = r.int(1, d - 1), D = d * q + m; if (D > 999) return null; return divq(D, d, { easy: '（《十|じゅう》の くらいに 0を たてる）' }); },
      s3(r) {
        const d = r.int(3, 9), q = r.chance(0.5) ? r.int(11, 99) * 10 : r.int(1, 9) * 100 + r.int(1, 9), m = r.int(0, d - 1), D = d * q + m;
        if (D < 1000 || D > 9999) return null;
        return divq(D, d, { easy: '（0を たてる ところを わすれずに 《書|か》く）' });
      },
      trap(r) {
        const d = r.int(3, 9), q = r.int(112, 333), m = r.int(0, d - 1), D = d * q + m; if (!nz(q) || D > 999 || tens(D) !== 0) return null;
        return divq(D, d, { easy: '（わられる かずに 0が あっても、 しょうに 0は たたない）' });
      },
    },
  });

  M.add({
    id: '1-76', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: '3けた ÷ 2けたの ひっ《算|さん》',
    mark: 'わる かずが 2けた。 **《一|いち》の くらいを かくして かりの しょうを たて**、 《大|おお》きすぎたら 1 へらす。',
    futsu: ['182 ÷ 26 を、 26 × 1、 26 × 2、 …', 'と じゅんに ためす。'],
    raku: ['① 26を 20と みて、 18 ÷ 2 → 9', '② 26 × 9 ＝ 234 は 《大|おお》きすぎ → 8 → 7', '③ 26 × 7 ＝ 182 → しょうは 7'],
    why: '26は 20より 《大|おお》きいので、 20で わった かりの しょうは 《大|おお》きめに なる。 だから へらして なおす。',
    caution: '180 ÷ 30 の ように どちらも 0で おわる ときは、 18 ÷ 3 で よい（わざ 1-80）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) {
        const d = r.int(12, 98), q = r.int(2, 9), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || D < 100 || D > 999 || kariQ(D, d) !== q) return null;
        return divq(D, d, { easy: `（${d}を ${d - d % 10}と みて ${q}を たてる。 その まま あう）` });
      },
      s2(r) {
        const d = r.int(13, 98), q = r.int(2, 8), m = r.int(0, d - 1), D = d * q + m; if (d % 10 < 3 || D < 100 || D > 999) return null;
        const k = kariQ(D, d); if (k <= q) return null;
        return divq(D, d, { easy: `（かりの しょう ${k} → ${d} × ${k} が ${d * k}で ${D}より 《大|おお》きい → ${q}に なおす）` });
      },
      s3(r) {
        const d = r.int(12, 49), q = r.int(11, 89), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || !nz(q) || D < 100 || D > 999) return null;
        return divq(D, d, { easy: `（${Math.floor(D / 10)} ÷ ${d} から。 しょうは 2けた）` });
      },
      trap(r) {
        const k = r.int(2, 9), q = r.int(2, 9), d = k * 10, D = d * q; if (D < 100) return null;
        return divq(D, d, { easy: `（どちらも 0で おわる。 ${D / 10} ÷ ${k} と 《同|おな》じ。 わざ 1-80）`, also: ['1-80'] });
      },
    },
  });

  M.add({
    id: '1-77', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: '4けた ÷ 2けたの ひっ《算|さん》',
    mark: 'わる かずが 2けた。 **たてる → かける → ひく → おろす** を くりかえす。',
    futsu: ['6120 ÷ 36 を、 36を なんども', 'ひいて かぞえる。'],
    raku: ['① 61 ÷ 36 → 1を たてる', '② 36 × 1 ＝ 36 を ひく → 25', '③ 2を おろす → 252 ÷ 36 → 7'],
    why: '《大|おお》きな くらいから じゅんに 《分|わ》けて いく。 まえの くらいの のこりは、 つぎの くらいに 10ばいして 《入|い》れる。',
    caution: 'たてた かずが 《大|おお》きすぎたら、 1 《小|ちい》さく して やりなおす。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    steps: {
      s1(r) { const d = r.int(12, 49), q = r.int(101, 299), rem = r.int(0, d - 1), D = d * q + rem; if (d % 10 === 0 || D > 9999 || !nz(q)) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s2(r) { const d = r.int(51, 99), q = r.int(11, 99), rem = r.int(0, d - 1), D = d * q + rem; if (d % 10 === 0 || D < 1000 || D > 9999 || !nz(q)) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s3(r) { const d = r.int(21, 49), q = r.pick([105, 203, 301, 120, 240]), D = d * q; if (D > 9999) return null; return divq(D, d, { easy: '（しょうに 0が たつ。 わざ 1-75）' }); },
      trap(r) { const d = r.pick([20, 30, 40, 50]), q = r.int(12, 99), D = d * q * 10; if (D > 9999) return null; return divq(D, d, { easy: `（どちらも 0で おわる。 ${D / 10} ÷ ${d / 10} と 《同|おな》じ。 わざ 1-80）`, also: ['1-80'] }); },
    },
  });

  M.add({
    id: '1-78', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: '5けた ÷ 2けたの ひっ《算|さん》',
    mark: 'わられる かずが 5けた。 **はじめの 2けたで たつか** を 《見|み》て、 たてる → かける → ひく → おろす。',
    futsu: ['38472 ÷ 56 を、 56 × 100、', '56 × 200 … と ためして いく。'],
    raku: ['① 38 ÷ 56 は たたない → 384 ÷ 56 → 6', '② 56 × 6 ＝ 336、 384 － 336 ＝ 48', '③ 7を おろす → 487 ÷ 56 → 8 …'],
    why: 'はじめの 2けたが わる かずより 《小|ちい》さい ときは、 しょうは 《百|ひゃく》の くらいから たつ。',
    caution: '48000 ÷ 60 の ように どちらも 0で おわる ときは、 0を とって わる（わざ 1-80）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cell: 6.5,
    steps: {
      s1(r) { const d = r.int(12, 49), q = r.int(211, 999), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || !nz(q) || D < 10000 || D > 99999) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s2(r) { const d = r.int(51, 99), q = r.int(112, 999), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || !nz(q) || D < 10000 || D > 99999) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s3(r) { const d = r.int(11, 24), q = r.int(1111, 8999), m = r.int(0, d - 1), D = d * q + m; if (d === 20 || !nz(q) || D > 99999) return null; return divq(D, d, { easy: '（はじめの 2けたで たつので、 しょうは 4けた）' }); },
      trap(r) {
        const k = r.int(2, 9), q = r.int(112, 999), d = k * 10, D = d * q; if (!nz(q) || D < 10000 || D > 99999) return null;
        return divq(D, d, { easy: `（どちらも 0で おわる。 ${D / 10} ÷ ${k} と 《同|おな》じ。 わざ 1-80）`, also: ['1-80'] });
      },
    },
  });

  M.add({
    id: '1-79', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: '4けた・5けた ÷ 3けたの ひっ《算|さん》',
    mark: 'わる かずが 3けた。 **《上|うえ》の 1けたで かりの しょう** を たて、 《大|おお》きすぎたら へらす。',
    futsu: ['8946 ÷ 213 を、 213 × 1、 213 × 2、', '… と じゅんに ためす。'],
    raku: ['① 213を 200と みて、 89 ÷ 2 → 4', '② 213 × 4 ＝ 852、 894 － 852 ＝ 42', '③ 6を おろす → 426 ÷ 213 → 2 → 42'],
    why: 'わる かずが 3けたでも、 たてる → かける → ひく → おろす は 《同|おな》じ。 かりの しょうは 《上|うえ》の けたで きめる。',
    caution: '8400 ÷ 300 の ように どちらも 00で おわる ときは、 84 ÷ 3 で よい（わざ 1-80）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cell: 6.5,
    steps: {
      s1(r) { const d = r.int(112, 499), q = r.int(11, 89), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || !nz(q) || D < 1000 || D > 9999) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s2(r) { const d = r.int(112, 999), q = r.int(11, 99), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || !nz(q) || D < 10000 || D > 99999) return null; return divq(D, d, { easy: tashi(D, d) }); },
      s3(r) { const d = r.int(112, 299), q = r.int(1, 8) * 100 + r.int(1, 9), m = r.int(0, d - 1), D = d * q + m; if (d % 10 === 0 || D < 10000 || D > 99999) return null; return divq(D, d, { easy: '（しょうの 《十|じゅう》の くらいに 0が たつ。 わざ 1-75）' }); },
      trap(r) {
        const k = r.int(2, 9), q = r.int(12, 99), d = k * 100, D = d * q; if (!nz(q)) return null;
        return divq(D, d, { easy: `（どちらも 00で おわる。 ${D / 100} ÷ ${k} と 《同|おな》じ。 わざ 1-80）`, also: ['1-80'] });
      },
    },
  });

  // 1-80：方眼でなく 式で 考える
  M.add({
    id: '1-80', part: 5, chap: '1-14・1-15', stars: 2, flow: true,
    title: 'おわりに 0の ある わり《算|ざん》',
    mark: 'わられる かずも わる かずも **おわりに 0が ある**。 おなじ かずずつ 0を とってから わる。',
    futsu: ['4800 ÷ 300 を ひっ《算|さん》で、', '3けたで わる。'],
    raku: ['① どちらからも 0を 2こ とる', '② 4800 ÷ 300 → 48 ÷ 3', '③ 48 ÷ 3 ＝ 16'],
    why: '4800は 100が 48こ、 300は 100が 3こ。 100の たばで かぞえれば、 48 ÷ 3 と 《同|おな》じ。',
    caution: 'あまりが ある ときは、 あまりに とった 0を つけて もどす（250 ÷ 30 は 8 あまり 10）。',
    counts: { s1: 8, s2: 8, s3: 4, trap: 2 },
    cols: { s3: 1 }, boxw: { s1: '15mm', s2: '15mm', s3: '15mm', trap: '30mm' },
    steps: {
      s1(r) { const k = r.int(2, 9), q = r.int(2, 9), z = r.int(1, 2), D = k * q * P10(z), d = k * P10(z); return { q: `${D} ÷ ${d}`, a: S(q), easy: `${k * q} ÷ ${k}` }; },
      s2(r) {
        const k = r.int(2, 9), q = r.int(12, 49), z = r.int(1, 2), D = k * q * P10(z), d = k * P10(z); if (!nz(q)) return null;
        return { q: `${D} ÷ ${d}`, a: S(q), easy: `${k * q} ÷ ${k}` };
      },
      s3(r) {
        const it = r.pick([['あめ', 'こ'], ['ガム', 'こ'], ['シール', 'まい'], ['ノート', 'さつ']]);
        const k = r.int(2, 9), q = r.int(3, 9), d = k * 10, D = d * q * r.pick([1, 10]);
        return { q: `${D}《円|えん》で、 1${it[1]} ${d}《円|えん》の ${it[0]}は □${it[1]} かえる。`, a: S(D / d), easy: `${D / 10} ÷ ${k}` };
      },
      trap(r) {
        const k = r.int(3, 9), m = r.int(k + 1, 10 * k - 1); if (m % k === 0 || m % 10 === 0) return null;
        const q = Math.floor(m / k), rem = (m % k) * 10;
        return { q: `${m * 10} ÷ ${k * 10}`, a: `${q} あまり ${rem}`, easy: `（あまりは ${m % k}では なく ${rem}。 とった 0を もどす）` };
      },
    },
  });

  // ================================================================ 小数（教科書 1-16）
  M.add({
    id: '1-81', part: 5, chap: '1-16', stars: 2, flow: true,
    title: '《小数|しょう|すう》の たし《算|ざん》・ひき《算|ざん》の ひっ《算|さん》',
    mark: '**《小数点|しょう|すう|てん》を たてに そろえて** 《書|か》き、 ふつうの ひっ《算|さん》と 《同|おな》じに する。',
    futsu: ['3.45 ＋ 12.8 を、 《右|みぎ》はしを', 'そろえて 《書|か》いて しまう。'],
    raku: ['① 《小数点|しょう|すう|てん》を そろえる（12.8 は 12.80 と みる）', '② 5 ＋ 0 ＝ 5、 4 ＋ 8 ＝ 12 → 2、 くり《上|あ》がり 1', '③ こたえに 《小数点|しょう|すう|てん》を おろす → 16.25'],
    why: '《小数点|しょう|すう|てん》を そろえると、 《同|おな》じ くらいどうしが たてに ならぶ（1-16 0.1が いくつ《分|ぶん》）。',
    caution: '0.7 ＋ 0.5 の ような 《小|ちい》さな 《小数|しょう|すう》は、 0.1が いくつ《分|ぶん》で あんざんできる（わざ 1-56）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    steps: {
      s1(r) {
        const x = r.int(11, 199), y = r.int(11, 99); if (x % 10 === 0 || y % 10 === 0 || (x + y) % 10 === 0 || x < 20) return null;
        return hsq('+', dec(x, 1), dec(y, 1), dec(x + y, 1), { key: kswap('+', x, y), easy: '（《小数点|しょう|すう|てん》を そろえて、 こたえにも おろす）' });
      },
      s2(r) {
        const x = r.int(21, 199), y = r.int(11, x - 5); if (x % 10 === 0 || y % 10 === 0 || (x - y) % 10 === 0 || x % 10 >= y % 10) return null;
        return hsq('-', dec(x, 1), dec(y, 1), dec(x - y, 1), { easy: '（《小数点|しょう|すう|てん》を そろえて、 くり《下|さ》がりは ふつうと 《同|おな》じ）' });
      },
      s3(r) {
        const x = r.int(101, 999), y = r.int(11, 199); if (x % 10 === 0 || y % 10 === 0) return null;   // x は 100分の、 y は 10分の
        const k = r.int(0, 2);
        if (k === 0) return hsq('+', dec(x, 2), dec(y, 1), dec(x + 10 * y, 2), { easy: `（${dec(y, 1)} は ${dec(y * 10, 2)} と みる）` });
        if (k === 1) { if (10 * y <= x) return null; return hsq('-', dec(y, 1), dec(x, 2), dec(10 * y - x, 2), { easy: `（${dec(y, 1)} は ${dec(y * 10, 2)} と みる）` }); }
        const n = r.int(3, 19), t = r.int(11, 99); if (t % 10 === 0 || t >= n * 10) return null;
        return hsq('-', S(n), dec(t, 1), dec(n * 10 - t, 1), { easy: `（${n} は ${n}.0 と みる）` });
      },
      trap(r) {
        if (r.chance(0.5)) { const x = r.int(2, 9), y = r.int(2, 9); if (x + y <= 10) return null; return hsq('+', dec(x, 1), dec(y, 1), dec(x + y, 1), { key: kswap('+', x, y), easy: `（0.1が ${x} ＋ ${y} ＝ ${x + y}こ。 あんざんで。 わざ 1-56）`, also: ['1-56'] }); }
        const x = r.int(11, 18), y = r.int(x - 9, 9); if (y <= x % 10) return null;
        return hsq('-', dec(x, 1), dec(y, 1), dec(x - y, 1), { easy: `（0.1が ${x} － ${y} ＝ ${x - y}こ。 あんざんで。 わざ 1-56）`, also: ['1-56'] });
      },
    },
  });

  // ================================================================ たしかめ（教科書 1-7・1-15）
  M.add({
    id: '1-82', part: 5, chap: '1-7・1-15', stars: 2, flow: true,
    title: 'ひっ《算|さん》の たしかめ',
    mark: 'こたえを **ぎゃくの けいさん** で たしかめる。 わり《算|ざん》は わる かず × しょう ＋ あまり。',
    futsu: ['もう 1かい 《同|おな》じ ひっ《算|さん》を', 'して、 こたえを くらべる。'],
    raku: ['ひき《算|ざん》 → こたえ ＋ ひく かず', 'かけ《算|ざん》 → 《入|い》れかえて かける', 'わり《算|ざん》 → わる かず × しょう ＋ あまり'],
    why: '《同|おな》じ ひっ《算|さん》を くりかえすと、 《同|おな》じ まちがいを しやすい。 ちがう みちで もとに もどれば たしか（1-7・1-15）。',
    caution: 'あまりは わる かずより 《小|ちい》さい。 たしかめの しきが あっても、 あまりが 《大|おお》きすぎれば まちがい。',
    counts: { s1: 6, s2: 6, s3: 6, trap: 2 },
    cols: 1, boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '30mm' },
    steps: {
      s1(r) {
        const x = r.int(123, 999), y = r.int(28, x - 50); if (!nz(y) || borrows(x, y) < 1) return null; const c = x - y;
        return { q: `${x} － ${y} ＝ ${c}　たしかめ：${c} ＋ ${y} ＝ □`, a: S(x), easy: `${c} ＋ ${y}` };
      },
      s2(r) {
        const a = r.int(12, 99), b = r.int(12, 99); if (!nz(a) || !nz(b) || a === b) return null;
        return { q: `${a} × ${b} ＝ ${a * b}　たしかめ：${b} × ${a} ＝ □`, a: S(a * b), easy: `${b} × ${a}` };
      },
      s3(r) {
        const big = r.chance(0.4), d = big ? r.int(11, 24) : r.int(3, 9), q = big ? r.int(3, 8) : r.int(4, 19), m = r.int(1, d - 1), D = d * q + m;
        if (D < 20 || D > 99) return null;
        return { q: `${D} ÷ ${d} ＝ ${q} あまり ${m}　たしかめ：${d} × ${q} ＋ ${m} ＝ □`, a: S(D), easy: `${d} × ${q} ＋ ${m}` };
      },
      trap(r) {
        const d = r.int(3, 9), D = r.int(30, 99), q = Math.floor(D / d), m = D % d; if (q < 3) return null;
        return { q: `${D} ÷ ${d} ＝ ${q - 1} あまり ${m + d} と した。 たしかめの しき ${d} × ${q - 1} ＋ ${m + d} は ${D}に なるが、 ただしい こたえは □`, a: divA(q, m), easy: `（あまりの ${m + d}が わる かずの ${d}より 《大|おお》きい）` };
      },
    },
  });
})(globalThis.MONDAI);
