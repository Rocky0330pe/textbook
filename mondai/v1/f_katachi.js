/* 問題集 第1巻　第4部 表・グラフ・かたち（わざ 1-57〜1-62）　組 f
 * 書き方は v1/README.md。文は第1巻の教科書（1-17〜1-21）と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。
 * 図は まだ つかえないので、ことばと 数で 書く。広さは 教科書 1-21 と同じ「マス」で かぞえる（cm² の 記号は つかわない）。
 * 単位つきの答えは verify で確かめる（楽な形の式の値と、答えの数を くらべる）。 */
(function (M) {
  'use strict';
  const P = '＋', S = '－', T = '×', E = '＝';

  // ---------------------------------------------------------------- 見わけよう（fits）の 部品
  // fits(q)：ほかの わざの 問題でも、 この わざが つかえるか（q は ルビを とった 問題の 文。 README 2章）
  // たし算だけの 式（「a ＋ b ＋ c」）の 数。 ちがえば null
  const adds = q => {
    if (!/^\d+( ＋ \d+)+$/.test(q)) return null;
    return q.split(' ＋ ').map(Number);
  };

  // ---------------------------------------------------------------- 文の部品
  const MEM = '《目|め》もり';
  const NIN = '《人|にん》';
  const CHO = '《長方形|ちょう|ほう|けい》';
  const SEI = '《正方形|せい|ほう|けい》';
  const HEN = '《辺|へん》';
  const NAGA = '《長|なが》さ';
  const HIRO = '《広|ひろ》さ';
  const KAKU = '《角|かく》';
  const CHOK = '《直角|ちょっ|かく》';
  const KAI = '1《回転|かい|てん》';
  const WAKE = '《分|わ》けた';

  // ---------------------------------------------------------------- 検算の部品
  // 答え「14人」「55°」「20 cm」「48マス」の 数の ところ（数が 1つだけ）
  function num(a) {
    const m = M.plain(String(a)).match(/^\s*(\d+)\s*(?:人|こ|°|cm|m|マス|度|目もり)?\s*$/);
    return m ? +m[1] : null;
  }
  // 確かめ：答えの数が want。楽な形の「＝」で区切った 式は、読めれば どれも want
  function vf(p, want) {
    return function () {
      const A = num(p.a);
      if (A == null) return `答え「${M.plain(p.a)}」が 読めない`;
      if (A !== want) return `答え ${A} が ${want} と ちがう`;
      for (const part of M.plain(p.easy || '').split('＝')) {
        const v = M.evalExpr(part);
        if (v && !M.sameVal(v, [want, 1])) return `楽な形「${part.trim()}」の値が ${want} と ちがう`;
      }
      return true;
    };
  }
  function done(p, want) { p.verify = vf(p, want); return p; }

  // ================================================================ 1-57
  const WHO = [[NIN, 'ぼうグラフ'], ['こ', 'ぼうグラフ']];
  M.add({
    id: '1-57', part: 4, chap: '1-17・1-18', stars: 1,
    title: `グラフの 1${MEM}を 《見|み》て よむ`,
    mark: `グラフを よむ ときは、 まず 1${MEM}が **いくつか** を たしかめる。`,
    futsu: [`1${MEM} 2${NIN}の ぼうグラフ。`, `ぼうの ${MEM}を 1つずつ`, '2、 4、 6、 … と かぞえる。'],
    raku: [`1${MEM} 2${NIN}、 ぼうは 7${MEM}`, '2が 7つ だから', '2 × 7 ＝ 14 で 14《人|にん》'],
    why: `1${MEM}が 2${NIN}なら、 ぼうは 2の いくつ《分|ぶん》。 かけ《算|ざん》で すぐ 《出|で》る（1-17・1-12）。`,
    caution: `1${MEM}が 1の ときは、 ${MEM}の 《数|かず》が そのまま こたえ。`,
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // 1目もりが 1で ない グラフ
    fits(q) {
      let m = q.match(/^1目もり (\d+)/);
      if (m) return +m[1] !== 1;
      m = q.match(/^0から (\d+)までが (\d+)目もり/);
      return !!m && +m[1] / +m[2] !== 1;
    },
    steps: {
      s1(r) {
        const u = r.pick([2, 5, 10]), k = r.int(2, 9), [w, g] = r.pick(WHO);
        const p = { q: `1${MEM} ${u}${w}の グラフ。 ${k}${MEM}の ぼうは □${w}`, a: `${u * k}${w}`, easy: `${u} ${T} ${k}` };
        return done(p, u * k);
      },
      // 1目もりを さきに 出す
      s2(r) {
        const [L, n] = r.pick([[10, 5], [20, 10], [10, 2], [20, 4], [50, 5], [50, 10], [100, 10]]), u = L / n, k = r.int(2, 9);
        if (k === n) return null;
        const p = { q: `0から ${L}までが ${n}${MEM}。 ${k}${MEM}は □${NIN}`, a: `${u * k}${NIN}`,
          easy: `1${MEM} ${u}、 ${u} ${T} ${k}` };
        return done(p, u * k);
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // ぎゃく：人数から 目もりの 数
          const u = r.pick([2, 5, 10]), t = r.int(2, 9);
          const p = { q: `1${MEM} ${u}${NIN}。 ${u * t}${NIN}の ぼうは □${MEM}`, a: `${t}${MEM}`, easy: `${u}が ${t}こで ${u * t}` };
          return done(p, t);
        }
        if (k === 2) { // ちがいも 目もりで
          const u = r.pick([2, 5, 10]), a = r.int(4, 9), b = r.int(2, a - 1);
          const p = { q: `1${MEM} ${u}${NIN}で、 ${a}と ${b}${MEM}の ちがいは □${NIN}`,
            a: `${u * (a - b)}${NIN}`, easy: `${a - b}${MEM}、 ${u} ${T} ${a - b}` };
          return done(p, u * (a - b));
        }
        // おれ線グラフ（1-18）
        const u = r.pick([2, 5]), t = r.int(2, 6);
        const p = { q: `1${MEM} ${u}《度|ど》の グラフで ${t}${MEM} 《上|あ》がると □《度|ど》`,
          a: `${u * t}《度|ど》`, easy: `${u} ${T} ${t}` };
        return done(p, u * t);
      },
      trap(r) {
        const k = r.int(3, 9), [w, g] = r.pick(WHO);
        const p = { q: `1${MEM} 1${w}の グラフ。 ${k}${MEM}の ぼうは □${w}`, a: `${k}${w}`, easy: `（1${MEM}が 1）` };
        return done(p, k);
      },
    },
  });

  // ================================================================ 1-58
  // 一の位を あわせて 10に なる 2つの 数（2けた）
  function pair(r, hi) {
    const x = r.intNot(11, hi, v => v % 10 === 0);
    const y = r.int(1, Math.floor((hi - (10 - x % 10)) / 10)) * 10 + (10 - x % 10);
    return [x, y];
  }
  M.add({
    id: '1-58', part: 4, chap: '1-17', stars: 1,
    title: '《表|ひょう》の ごうけいは 10・100の くみで',
    mark: '《数|かず》を ぜんぶ たす。 《一|いち》の くらいを **あわせて 10** に なる くみを さきに たす。',
    futsu: ['23 ＋ 17 ＋ 45 ＋ 55 を', 'じゅんに たすと、', 'くり《上|あ》がりが 3かい。'],
    raku: ['23 ＋ 17 ＝ 40', '45 ＋ 55 ＝ 100', '40 ＋ 100 ＝ 140'],
    why: '《一|いち》の くらいが 10に なる くみは、 たすと きりの よい 《数|かず》に なる。 たす じゅんばんは かえて よい（1-4・1-7）。',
    caution: '10に なる くみが ない ときは、 じゅんに たす。 くみを つくっても ぜんぶ たすのを わすれない。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // 3つ いじょう たして、 一の くらいを たすと 10に なる くみが ある（表の ごうけい も）
    fits(q) {
      const n = /\d+組 \d+/.test(q) ? [...q.matchAll(/\d+組 (\d+)/g)].map(m => +m[1]) : adds(q);
      return !!n && n.length >= 3 && n.some((x, i) => n.some((y, j) => j > i && x % 10 !== 0 && (x + y) % 10 === 0));
    },
    steps: {
      // くみが となりあって いる
      s1(r) {
        const [a, b] = pair(r, 49), [c, d] = pair(r, 69);
        const p = { q: `${a} ${P} ${b} ${P} ${c} ${P} ${d}`, a: String(a + b + c + d), easy: `${a + b} ${P} ${c + d}` };
        return p;
      },
      // くみが はなれて いる（ならべかえる）
      s2(r) {
        const [a, b] = pair(r, 49), [c, d] = pair(r, 69);
        if (a % 10 === c % 10 || a % 10 === d % 10) return null;
        const p = { q: `${a} ${P} ${c} ${P} ${b} ${P} ${d}`, a: String(a + b + c + d), easy: `${a + b} ${P} ${c + d}` };
        return p;
      },
      s3(r) {
        if (r.chance(0.6)) { // 表の ことば（1組と 3組で くむ）
          const [a, c] = pair(r, 39), b = r.intNot(12, 39, v => v % 10 === 0 || (v + a) % 10 === 0 || (v + c) % 10 === 0);
          const tot = a + b + c;
          const p = { q: `1《組|くみ》 ${a}、 2《組|くみ》 ${b}、 3《組|くみ》 ${c}${NIN}。 ごうけい □${NIN}`,
            a: `${tot}${NIN}`, easy: `${a + c} ${P} ${b}` };
          return done(p, tot);
        }
        // 3つの 数で、 まん中を とばして くむ
        const [a, c] = pair(r, 69), b = r.intNot(12, 89, v => v % 10 === 0 || (v + a) % 10 === 0 || (v + c) % 10 === 0);
        const p = { q: `${a} ${P} ${b} ${P} ${c}`, a: String(a + b + c), easy: `${a + c} ${P} ${b}` };
        return p;
      },
      trap(r) {
        const xs = [r.intNot(11, 49, v => v % 10 === 0), r.intNot(11, 49, v => v % 10 === 0), r.intNot(11, 49, v => v % 10 === 0)];
        for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if ((xs[i] + xs[j]) % 10 === 0) return null;
        return { q: xs.join(` ${P} `), a: String(xs[0] + xs[1] + xs[2]), easy: '（10の くみが ない）' };
      },
    },
  });

  // ================================================================ 1-59
  M.add({
    id: '1-59', part: 4, chap: '1-20', stars: 1,
    title: `${CHOK}・${KAI}から ひく`,
    mark: `のこりの ${KAKU}を もとめる。 もとが ${CHOK}（**90°**）や ${KAI}（**360°**）なら、 そこから ひく。`,
    futsu: [`のこりの ${KAKU}に`, '《分度器|ぶん|ど|き》を あてて', 'はかりなおす。'],
    raku: [`${CHOK}は 90°`, '90 － 35 ＝ 55', 'のこりは 55°'],
    why: `${CHOK}は 90°、 《半回転|はん|かい|てん》は 180°、 ${KAI}は 360°。 2つに 《分|わ》けても、 あわせた 《大|おお》きさは かわらない（1-20）。`,
    caution: `もとの ${KAKU}が ${CHOK}か ${KAI}か わからない ときは、 ひけない。 あわせる ときは たす。`,
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // 直角・1回転・半回転を 分けた のこりの 角
    fits(q) { return /^(直角|1回転|半回転)を .*分けた$/.test(q); },
    steps: {
      s1(r) {
        const x = r.chance(0.7) ? r.int(1, 17) * 5 : r.intNot(11, 79, v => v % 5 === 0);
        const p = { q: `${CHOK}を ${x}° と □° に ${WAKE}`, a: `${90 - x}°`, easy: `90 ${S} ${x}` };
        return done(p, 90 - x);
      },
      s2(r) {
        const x = r.pick([90, 180, 270, 30, 60, 100, 120, 150, 200, 240, 300, 330]);
        const p = { q: `${KAI}を ${x}° と □° に ${WAKE}`, a: `${360 - x}°`, easy: `360 ${S} ${x}` };
        return done(p, 360 - x);
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // 直角を 3つに
          const x = r.int(2, 8) * 5, y = r.int(2, 8) * 5;
          if (x + y >= 85 || x === y) return null;
          const p = { q: `${CHOK}を ${x}°、 ${y}°、 □° に ${WAKE}`, a: `${90 - x - y}°`, easy: `90 ${S} ${x} ${S} ${y}` };
          return done(p, 90 - x - y);
        }
        if (k === 2) { // 半回転
          const x = r.int(2, 16) * 10;
          if (x === 90) return null;
          const p = { q: `《半回転|はん|かい|てん》を ${x}° と □° に ${WAKE}`, a: `${180 - x}°`, easy: `180 ${S} ${x}` };
          return done(p, 180 - x);
        }
        // 1回転を 3つに（直角が 1つ ある）
        const y = r.int(2, 22) * 10;
        const p = { q: `${KAI}を ${CHOK}、 ${y}°、 □° に ${WAKE}`, a: `${270 - y}°`, easy: `270 ${S} ${y}` };
        return done(p, 270 - y);
      },
      trap(r) {
        const x = r.int(2, 8) * 5, y = r.int(2, 8) * 5;
        if (x === y) return null;
        const p = { q: `${x}° と ${y}° の ${KAKU}を あわせると □°`, a: `${x + y}°`, easy: '（あわせるなら たす）' };
        return done(p, x + y);
      },
    },
  });

  // ================================================================ 1-60
  M.add({
    id: '1-60', part: 4, chap: '1-19・1-21', stars: 1,
    title: `まわりの ${NAGA}は (たて ＋ よこ) × 2`,
    mark: `${CHO}の まわり。 **たてと よこが 2つずつ** ある。`,
    futsu: ['たて 4、 よこ 6 の まわりを', '4 ＋ 6 ＋ 4 ＋ 6 と', `4つの ${HEN}を じゅんに たす。`],
    raku: ['たて ＋ よこ ＝ 4 ＋ 6 ＝ 10', 'それが 2つ ある', '10 × 2 ＝ 20'],
    why: `${CHO}は、 むかいあう ${HEN}の ${NAGA}が 《同|おな》じ。 「たて ＋ よこ」が 2つ《分|ぶん》で まわりに なる（1-19・1-21）。`,
    caution: `${HEN}の ${NAGA}が みんな ちがう 《三角形|さん|かく|けい》には つかえない。 ${HIRO}（たて × よこ）と まちがえない。`,
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '12mm',
    // 長方形・正方形の まわり／ a ＋ a ＋ b ＋ b
    fits(q) {
      if (/(長方形|正方形|へや)の まわりは|^長方形の まわり \d+/.test(q)) return true;
      const n = adds(q);
      if (!n || n.length !== 4) return false;
      const s = n.slice().sort((a, b) => a - b);
      return s[0] === s[1] && s[2] === s[3];
    },
    steps: {
      s1(r) {
        const t = r.int(2, 8), y = r.int(2, 8);
        if (t === y || t + y > 10) return null;
        const p = { q: `たて ${t} cm、 よこ ${y} cm の ${CHO}の まわりは □ cm`, a: `${2 * (t + y)} cm`,
          easy: `（${t} ${P} ${y}） ${T} 2` };
        return done(p, 2 * (t + y));
      },
      s2(r) {
        if (r.chance(0.5)) { // 4つの 辺を たす 式
          const t = r.int(2, 8), y = r.int(2, 8);
          if (t === y || t + y > 10) return null;
          const q = r.chance(0.5) ? `${t} ${P} ${y} ${P} ${t} ${P} ${y}` : `${t} ${P} ${t} ${P} ${y} ${P} ${y}`;
          return { q, a: String(2 * (t + y)), easy: `（${t} ${P} ${y}） ${T} 2` };
        }
        const s = r.int(2, 9); // 正方形
        const p = { q: `1${HEN} ${s} cm の ${SEI}の まわりは □ cm`, a: `${4 * s} cm`, easy: `${s} ${T} 4` };
        return done(p, 4 * s);
      },
      s3(r) {
        if (r.chance(0.5)) { // ぎゃく：まわりから よこ
          const t = r.int(2, 8), y = r.int(2, 8);
          if (t === y || t + y > 10) return null;
          const P2 = 2 * (t + y);
          const p = { q: `${CHO}の まわり ${P2} cm、 たて ${t} cm。 よこは □ cm`, a: `${y} cm`,
            easy: `${t + y} ${S} ${t}` };
          return done(p, y);
        }
        // m で はかる へや（★2：2けた × 2）
        const t = r.int(3, 9), y = r.int(4, 12);
        if (t >= y) return null;
        const p = { q: `たて ${t} m、 よこ ${y} m の へやの まわりは □ m`, a: `${2 * (t + y)} m`,
          easy: `（${t} ${P} ${y}） ${T} 2` };
        return done(p, 2 * (t + y));
      },
      trap(r) {
        const a = r.int(3, 9), b = r.int(3, 9), c = r.int(3, 9);
        if (a === b || b === c || a === c || a + b <= c || b + c <= a || a + c <= b) return null;
        const p = { q: `${HEN}が ${a}、 ${b}、 ${c} cm の 《三角形|さん|かく|けい》の まわりは □ cm`, a: `${a + b + c} cm`,
          easy: `（3つの ${HEN}を たす）` };
        return done(p, a + b + c);
      },
    },
  });

  // ================================================================ 1-61
  M.add({
    id: '1-61', part: 4, chap: '1-21', stars: 1,
    title: `《四角|し|かく》の ${HIRO}は たて × よこ`,
    mark: `${CHO}の ${HIRO}。 マスが **1れつ いくつ** で、 **なんれつ** あるかを 《見|み》る。`,
    futsu: ['マスを 1つずつ', '1、 2、 3、 … と', 'ぜんぶ かぞえる。'],
    raku: ['たて 6マスの れつが 8れつ', '6 × 8 ＝ 48', '48マス'],
    why: '1れつの マスの 《数|かず》 × れつの 《数|かず》。 かけ《算|ざん》の 「1つ《分|ぶん》 × いくつ《分|ぶん》」（1-21・1-12）。',
    caution: 'たてと よこを たさない。 たして 2ばい するのは、 まわりの 《長|なが》さ（わざ 1-60）。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '12mm',
    // 長方形・正方形の 広さ（マス）
    fits(q) { return /(長方形|正方形)の 広さは|に 1 cm の マスは □こ|^広さ \d+マスで たて \d+マス。 よこは/.test(q); },
    steps: {
      s1(r) {
        const a = r.int(2, 9), b = r.int(2, 9);
        if (a === b) return null;
        const p = { q: `たて ${a}マス、 よこ ${b}マスの ${CHO}の ${HIRO}は □マス`, a: `${a * b}マス`, easy: `${a} ${T} ${b}` };
        return done(p, a * b);
      },
      s2(r) {
        if (r.chance(0.4)) {
          const s = r.int(2, 9);
          const p = { q: `1${HEN}が ${s}マスの ${SEI}の ${HIRO}は □マス`, a: `${s * s}マス`, easy: `${s} ${T} ${s}` };
          return done(p, s * s);
        }
        const a = r.int(2, 9), b = r.int(2, 9);
        if (a === b) return null;
        const p = { q: `たて ${a} cm、 よこ ${b} cm に 1 cm の マスは □こ`, a: `${a * b}こ`, easy: `${a} ${T} ${b}` };
        return done(p, a * b);
      },
      s3(r) {
        if (r.chance(0.5)) { // ぎゃく：広さと たてから よこ
          const a = r.int(2, 9), b = r.int(2, 9);
          if (a === b) return null;
          const p = { q: `${HIRO} ${a * b}マスで たて ${a}マス。 よこは □マス`, a: `${b}マス`, easy: `${a}の だんで ${a * b}` };
          return done(p, b);
        }
        // 10の れつ（★2）
        const a = r.int(2, 9), ten = r.chance(0.5);
        const q = ten ? `たて 10マス、 よこ ${a}マスの ${CHO}の ${HIRO}は □マス` : `たて ${a}マス、 よこ 10マスの ${CHO}の ${HIRO}は □マス`;
        const p = { q, a: `${10 * a}マス`, easy: ten ? `10 ${T} ${a}` : `${a} ${T} 10` };
        return done(p, 10 * a);
      },
      trap(r) {
        const a = r.int(2, 6), b = r.int(2, 6);
        if (a === b) return null;
        const p = { q: `たて ${a} cm、 よこ ${b} cm の ${CHO}の まわりは □ cm`, a: `${2 * (a + b)} cm`,
          easy: `（まわりの ${NAGA}）` };
        return done(p, 2 * (a + b));
      },
    },
  });

  // ================================================================ 1-62
  M.add({
    id: '1-62', part: 4, chap: '1-21', stars: 2,
    title: 'かけた 《四角|し|かく》は 《大|おお》きな 《四角|し|かく》から ひく',
    mark: `${CHO}の かどや まん《中|なか》が かけて いる。 **かけて いない** 《大|おお》きな ${CHO}を かんがえる。`,
    futsu: ['かけた かたちを', `2つの ${CHO}に 《分|わ》けて、`, 'それぞれ もとめて たす。'],
    raku: [`《大|おお》きな ${CHO} 6 × 8 ＝ 48`, 'かけた ところ 2 × 3 ＝ 6', '48 － 6 ＝ 42'],
    why: `「《大|おお》きな ${CHO} － きりとった ${CHO}」なら、 かけ《算|ざん》 2つと ひき《算|ざん》 1つで すむ（1-21）。`,
    caution: `きりとった ところが ${CHO}で ない ときや、 2つを ならべた かたちには つかえない。`,
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '12mm',
    // かど・まん中を きりとった 長方形
    fits(q) { return /の (かど|まん中)から \d+ × \d+ を きり(とる|ぬく)|の かど \d+つから/.test(q); },
    steps: {
      // かどを きりとる
      s1(r) {
        const A = r.int(4, 9), B = r.int(5, 9), a = r.int(1, A - 2), b = r.int(1, B - 2);
        const ans = A * B - a * b;
        const p = { q: `${A} ${T} ${B} の かどから ${a} ${T} ${b} を きりとる。 □マス`,
          a: `${ans}マス`, easy: `${A * B} ${S} ${a * b}` };
        return done(p, ans);
      },
      // まん中を きりぬく
      s2(r) {
        const A = r.int(4, 9), B = r.int(4, 9), a = r.int(1, A - 2), b = r.int(1, B - 2);
        const ans = A * B - a * b;
        const p = { q: `${A} ${T} ${B} の まん《中|なか》から ${a} ${T} ${b} を きりぬく。 □マス`,
          a: `${ans}マス`, easy: `${A * B} ${S} ${a * b}` };
        return done(p, ans);
      },
      s3(r) {
        if (r.chance(0.5)) { // 2つの かどを きりとる
          const A = r.int(5, 9), B = r.int(5, 9), a = r.int(1, Math.floor((A - 1) / 2)), b = r.int(1, Math.floor((B - 1) / 2));
          const ans = A * B - 2 * a * b;
          const p = { q: `${A} ${T} ${B} の かど 2つから ${a} ${T} ${b} ずつ とる。 □マス`,
            a: `${ans}マス`, easy: `${A * B} ${S} ${2 * a * b}` };
          return done(p, ans);
        }
        // 1辺 10マスの 正方形の 紙（100から ひく）
        const a = r.int(2, 9), b = r.int(2, 9);
        const ans = 100 - a * b;
        const p = { q: `10 ${T} 10 の かどから ${a} ${T} ${b} を きりとる。 □マス`,
          a: `${ans}マス`, easy: `100 ${S} ${a * b}` };
        return done(p, ans);
      },
      // 2つを ならべた かたち（ひかずに たす）
      trap(r) {
        const a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 5), d = r.int(2, 5);
        if (a === c && b === d) return null;
        const ans = a * b + c * d;
        const p = { q: `${a} ${T} ${b} と ${c} ${T} ${d} の ${CHO}を ならべた。 □マス`,
          a: `${ans}マス`, easy: '（2つを たす）' };
        return done(p, ans);
      },
    },
  });
})(globalThis.MONDAI);
