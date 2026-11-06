/* 問題集 第1巻　第4部 表・グラフ・かたち（わざ 1-57〜1-62、 1-89・1-91）　組 f
 * 書き方は v1/README.md。文は第1巻の教科書（1-17〜1-21）と同じ、ひらがなの わかち書き。漢字には《漢字|よ|み》でルビ。
 * 図は まだ つかえないので、ことばと 数で 書く。広さは 教科書 1-21 と同じ「マス」で かぞえる（cm² の 記号は つかわない）。
 * 単位つきの答えは verify で確かめる（楽な形の式の値と、答えの数を くらべる）。
 * 第29回：わなに 同じ部の ほかの わざが つかえる ときは、 行き先を 書いて also に 入れる（dest）。入れかえただけの 問題には key（H-6）。 */
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
  const HAN = '《半回転|はん|かい|てん》';
  const WAKE = '《分|わ》けた';
  const KION = '《気温|き|おん》';
  // 1人・2人は「ひとり」「ふたり」（H-3）
  const nin = n => (n === 1 ? 'ひとり' : n === 2 ? 'ふたり' : `${n}${NIN}`);
  const ji = n => `${n}《時|じ》`;
  const jikan = n => `${n}《時間|じ|かん》`;
  const fun = n => `${n}《分|${[2, 5, 7, 9].includes(n % 10) ? 'ふん' : 'ぷん'}》`;
  // 入れかえただけの 問題は 同じ key（H-6）
  const ks = (tag, v) => tag + v.slice().sort((x, y) => x - y).join(',');

  // ---------------------------------------------------------------- 検算の部品
  // 答え「14人」「55°」「20 cm」「48マス」「6 ℃」の 数の ところ（数が 1つだけ）
  function num(a) {
    const m = M.plain(String(a)).match(/^\s*(\d+)\s*(?:人|こ|°|cm|m|kg|マス|度|目もり|℃|時間|時|分)?\s*$/);
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
  // わなの 問題に、 同じ部の ほかの わざが つかえる ときは、 楽な形に 「わざ 1-60 で」と 書いて also に 入れる（第29回 H-1・H-2）
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(1).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 4 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。 わざ ${also.join('・')} で` : ''}）`;
    return p;
  }

  // ================================================================ 1-57
  // u：1目もりの 数、 w：'nin'（人）か 'ko'（こ）
  const per = (u, w) => (w === 'nin' ? nin(u) : `${u}こ`);
  const unit = w => (w === 'nin' ? NIN : 'こ');
  M.add({
    id: '1-57', part: 4, chap: '1-17・1-18', stars: 1,
    title: `グラフの 1${MEM}を 《見|み》て よむ`,
    mark: `グラフを よむ ときは、 まず 1${MEM}が **いくつか** を たしかめる。`,
    futsu: [`1${MEM} ふたりの ぼうグラフ。`, `ぼうの ${MEM}を 1つずつ`, '2、 4、 6、 … と かぞえる。'],
    raku: [`1${MEM} ふたり、 ぼうは 7${MEM}`, '2が 7つ だから', `2 × 7 ＝ 14 で 14${NIN}`],
    why: `1${MEM}が ふたりなら、 ぼうは 2の いくつ《分|ぶん》。 かけ《算|ざん》で すぐ 《出|で》る（1-17・1-12）。`,
    caution: `1${MEM}が 1の ときは、 ${MEM}の 《数|かず》が そのまま こたえ。`,
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // 1目もりが 1で ない グラフ
    fits(q) {
      let m = q.match(/^1目もり (\d+|ひとり|ふたり)/);
      if (m) return m[1] !== '1' && m[1] !== 'ひとり';
      m = q.match(/^0から (\d+)までが (\d+)目もり/);
      return !!m && +m[1] / +m[2] !== 1;
    },
    steps: {
      s1(r) {
        const u = r.pick([2, 5, 10]), k = r.int(2, 9), w = r.pick(['nin', 'ko']);
        const p = { q: `1${MEM} ${per(u, w)}の グラフ。 ${k}${MEM}の ぼうは □${unit(w)}`, a: `${u * k}${unit(w)}`, easy: `${u} ${T} ${k}` };
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
          const p = { q: `1${MEM} ${nin(u)}。 ${u * t}${NIN}の ぼうは □${MEM}`, a: `${t}${MEM}`, easy: `${u}が ${t}こで ${u * t}` };
          return done(p, t);
        }
        if (k === 2) { // ちがいも 目もりで
          const u = r.pick([2, 5, 10]), a = r.int(4, 9), b = r.int(2, a - 1);
          if (u * (a - b) < 3) return null;   // 答えが「2人」に ならない ように（H-3）
          const p = { q: `1${MEM} ${nin(u)}で、 ${a}と ${b}${MEM}の ちがいは □${NIN}`,
            a: `${u * (a - b)}${NIN}`, easy: `${a - b}${MEM}、 ${u} ${T} ${a - b}` };
          return done(p, u * (a - b));
        }
        // 気温の おれ線グラフ（1-18。 R2-14：単位は ℃、 上がる 数は 小さく）
        const t = r.int(2, 6);
        const p = { q: `1${MEM} 2 ℃。 ${t}${MEM} 《上|あ》がると □ ℃`,
          a: `${2 * t} ℃`, easy: `2 ${T} ${t}` };
        return done(p, 2 * t);
      },
      trap(r) {
        const k = r.int(3, 9), w = r.pick(['nin', 'ko']);
        const p = { q: `1${MEM} ${per(1, w)}の グラフ。 ${k}${MEM}の ぼうは □${unit(w)}`, a: `${k}${unit(w)}`, easy: `（1${MEM}が 1）` };
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
        return { q: `${a} ${P} ${b} ${P} ${c} ${P} ${d}`, a: String(a + b + c + d), easy: `${a + b} ${P} ${c + d}`, key: ks(P, [a, b, c, d]) };
      },
      // くみが はなれて いる（ならべかえる）
      s2(r) {
        const [a, b] = pair(r, 49), [c, d] = pair(r, 69);
        if (a % 10 === c % 10 || a % 10 === d % 10) return null;
        return { q: `${a} ${P} ${c} ${P} ${b} ${P} ${d}`, a: String(a + b + c + d), easy: `${a + b} ${P} ${c + d}`, key: ks(P, [a, b, c, d]) };
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
        return { q: `${a} ${P} ${b} ${P} ${c}`, a: String(a + b + c), easy: `${a + c} ${P} ${b}`, key: ks(P, [a, b, c]) };
      },
      // わな：10の くみが ない（R2-31：3つの 一の くらいを あわせて 10に なる ものも のぞく）
      trap(r) {
        const xs = [r.intNot(11, 49, v => v % 10 === 0), r.intNot(11, 49, v => v % 10 === 0), r.intNot(11, 49, v => v % 10 === 0)];
        for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if ((xs[i] + xs[j]) % 10 === 0) return null;
        if ((xs[0] + xs[1] + xs[2]) % 10 === 0) return null;
        return { q: xs.join(` ${P} `), a: String(xs[0] + xs[1] + xs[2]), easy: '（10の くみが ない）', key: ks(P, xs) };
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
    why: `${CHOK}は 90°、 ${HAN}は 180°、 ${KAI}は 360°。 2つに 《分|わ》けても、 あわせた 《大|おお》きさは かわらない（1-20）。`,
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
          const p = { q: `${CHOK}を ${x}°、 ${y}°、 □° に ${WAKE}`, a: `${90 - x - y}°`, easy: `90 ${S} ${x} ${S} ${y}`, key: ks('c', [x, y]) };
          return done(p, 90 - x - y);
        }
        if (k === 2) { // 半回転
          const x = r.int(2, 16) * 10;
          if (x === 90) return null;
          const p = { q: `${HAN}を ${x}° と □° に ${WAKE}`, a: `${180 - x}°`, easy: `180 ${S} ${x}` };
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
        const p = { q: `${x}° と ${y}° の ${KAKU}を あわせると □°`, a: `${x + y}°`, easy: '（あわせるなら たす）', key: ks('a', [x, y]) };
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
          easy: `（${t} ${P} ${y}） ${T} 2`, key: ks('r', [t, y]) };
        return done(p, 2 * (t + y));
      },
      s2(r) {
        if (r.chance(0.5)) { // 4つの 辺を たす 式
          const t = r.int(2, 8), y = r.int(2, 8);
          if (t === y || t + y > 10) return null;
          const q = r.chance(0.5) ? `${t} ${P} ${y} ${P} ${t} ${P} ${y}` : `${t} ${P} ${t} ${P} ${y} ${P} ${y}`;
          return { q, a: String(2 * (t + y)), easy: `（${t} ${P} ${y}） ${T} 2`, key: ks(P, [t, t, y, y]) };
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
          easy: `（3つの ${HEN}を たす）`, key: ks('t', [a, b, c]) };
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
    fits(q) { return /(長方形|正方形)の 広さは|^たて \d+ cm、 よこ \d+ cm。 1 cm の マスは □こ$|^広さ \d+マスで たて \d+マス。 よこは/.test(q); },
    steps: {
      s1(r) {
        const a = r.int(2, 9), b = r.int(2, 9);
        if (a === b) return null;
        const p = { q: `たて ${a}マス、 よこ ${b}マスの ${CHO}の ${HIRO}は □マス`, a: `${a * b}マス`, easy: `${a} ${T} ${b}`, key: ks('s', [a, b]) };
        return done(p, a * b);
      },
      s2(r) {
        if (r.chance(0.4)) {
          const s = r.int(2, 9);
          const p = { q: `1${HEN}が ${s}マスの ${SEI}の ${HIRO}は □マス`, a: `${s * s}マス`, easy: `${s} ${T} ${s}` };
          return done(p, s * s);
        }
        // R2-18：「たて 7 cm、 よこ 6 cm に 1 cm の マスは」を、 長方形の 文に（1行に 入る ように）
        const a = r.int(2, 9), b = r.int(2, 9);
        if (a === b) return null;
        const p = { q: `たて ${a} cm、 よこ ${b} cm。 1 cm の マスは □こ`, a: `${a * b}こ`, easy: `${a} ${T} ${b}`, key: ks('c', [a, b]) };
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
        const p = { q, a: `${10 * a}マス`, easy: ten ? `10 ${T} ${a}` : `${a} ${T} 10`, key: ks('s', [10, a]) };
        return done(p, 10 * a);
      },
      // わな：広さでは なく まわり（わざ 1-60 へ）
      trap(r) {
        const a = r.int(2, 6), b = r.int(2, 6);
        if (a === b) return null;
        const p = dest({ q: `たて ${a} cm、 よこ ${b} cm の ${CHO}の まわりは □ cm`, a: `${2 * (a + b)} cm`, key: ks('r', [a, b]) },
          '1-61', `${HIRO}では なく まわりの ${NAGA}`);
        return done(p, 2 * (a + b));
      },
    },
  });

  // ================================================================ 1-62
  // R2-16：「たて 5マス、 よこ 6マスの 長方形の …」と 書くと 1問が 2行に なり、 20問が 見開きに 入らない。
  //   問題は 「5 × 6 の かどから 2 × 1 を きりとる。」の まま、 その 意味（たて・よこ・のこりの 広さ）を 左の ページに 書く
  M.add({
    id: '1-62', part: 4, chap: '1-21', stars: 2,
    title: 'かけた 《四角|し|かく》は 《大|おお》きな 《四角|し|かく》から ひく',
    mark: `${CHO}の かどや まん《中|なか》が かけて いる。 **かけて いない** 《大|おお》きな ${CHO}を かんがえる。`,
    futsu: ['かけた かたちを', `2つの ${CHO}に 《分|わ》けて、`, 'それぞれ もとめて たす。'],
    raku: [`《大|おお》きな ${CHO} 6 × 8 ＝ 48`, 'かけた ところ 2 × 3 ＝ 6', '48 － 6 ＝ 42'],
    why: `「《大|おお》きな ${CHO} － きりとった ${CHO}」なら、 かけ《算|ざん》 2つと ひき《算|ざん》 1つで すむ（1-21）。`,
    caution: `「6 × 8 の」は、 たて 6マス、 よこ 8マスの ${CHO}。 □マスは のこりの ${HIRO}。 2つを ならべた かたちには つかえない。`,
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
      // わな：2つを ならべた かたち（ひかずに たす）。 R2-30：同じ くみは 1つ、 辺が そろって 1つの 長方形に なる ものは のぞく
      trap(r) {
        const a = r.int(2, 6), b = r.int(2, 6), c = r.int(2, 6), d = r.int(2, 6);
        if (a === b || c === d || a === c || a === d || b === c || b === d) return null;
        if (a * b > c * d) return null;   // 小さい ほうを さきに 書く
        const ans = a * b + c * d;
        const p = { q: `${a} ${T} ${b} と ${c} ${T} ${d} の ${CHO}を ならべた。 □マス`,
          a: `${ans}マス`, easy: '（2つを たす）', key: 'n' + [[a, b], [c, d]].map(x => x.slice().sort().join(',')).sort().join('/') };
        return done(p, ans);
      },
    },
  });

  // ================================================================ 1-89（第29回 H-9：教科書 1-20 ⑤）
  M.add({
    id: '1-89', part: 4, chap: '1-20', stars: 1,
    title: '《時計|と|けい》の みじかい はりの ' + KAKU,
    mark: 'みじかい はりは 1《時間|じ|かん》に **30°** まわる。 なん《時間|じ|かん》《分|ぶん》 まわったかを 《見|み》る。',
    futsu: ['3《時|じ》の 2《本|ほん》の はりの', `${KAKU}を、 《分度器|ぶん|ど|き》を`, 'あてて はかる。'],
    raku: ['12から 3まで 3《時間|じ|かん》《分|ぶん》', '30 × 3 ＝ 90', `90°（${CHOK}）`],
    why: `${KAI} 360°を 12に 《分|わ》けると、 1つ《分|ぶん》は 30°（1-20）。 30°の いくつ《分|ぶん》なので かけ《算|ざん》（1-12）。`,
    caution: `《長|なが》い はりと まちがえない。 《長|なが》い はりは 《数字|すう|じ》 1つで 5《分|ふん》。`,
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '14mm',
    // みじかい はりの まわった 角（30°の いくつ分）
    fits(q) {
      return /^\d+時の とき、 長い はりと みじかい はりの 角は □°$|^みじかい はりは 1時間に 30°。 \d+時間では □°$|^みじかい はりが \d+から \d+まで うごくと □°$|^みじかい はりが (\d+°|直角|半回転|1回転) (うごく|する)のは □時間$|^\d+時の とき、 12から みじかい はりまで/.test(q);
    },
    steps: {
      // ちょうどの 時こくの 2本の はりの 角（6時まで）・1時間に 30°
      s1(r) {
        if (r.chance(0.5)) {
          const h = r.int(1, 6);
          const p = { q: `${ji(h)}の とき、 《長|なが》い はりと みじかい はりの ${KAKU}は □°`, a: `${30 * h}°`, easy: `30 ${T} ${h}` };
          return done(p, 30 * h);
        }
        const h = r.int(2, 9);
        const p = { q: `みじかい はりは 1《時間|じ|かん》に 30°。 ${jikan(h)}では □°`, a: `${30 * h}°`, easy: `30 ${T} ${h}` };
        return done(p, 30 * h);
      },
      // 数字から 数字まで（ひき算で 時間を 出して から）
      s2(r) {
        const a = r.int(1, 9), b = r.int(a + 1, Math.min(a + 6, 12));
        const p = { q: `みじかい はりが ${a}から ${b}まで うごくと □°`, a: `${30 * (b - a)}°`, easy: `30 ${T} ${b - a}` };
        return done(p, 30 * (b - a));
      },
      s3(r) {
        const k = r.int(1, 3);
        if (k === 1) { // ぎゃく：角から 時間
          const n = r.int(2, 6);
          const p = { q: `みじかい はりが ${30 * n}° うごくのは □《時間|じ|かん》`, a: jikan(n), easy: `30が ${n}こで ${30 * n}` };
          return done(p, n);
        }
        if (k === 2) { // 直角・半回転・1回転
          const [w, n] = r.pick([[`${CHOK} うごく`, 3], [`${HAN} する`, 6], [`${KAI} する`, 12]]);
          const p = { q: `みじかい はりが ${w}のは □《時間|じ|かん》`, a: jikan(n), easy: `30が ${n}こで ${30 * n}` };
          return done(p, n);
        }
        // 7時〜11時：12から 右まわりに
        const h = r.int(7, 11);
        const p = { q: `${ji(h)}の とき、 12から みじかい はりまで、 《右|みぎ》まわりの ${KAKU}は □°`, a: `${30 * h}°`, easy: `30 ${T} ${h}` };
        return done(p, 30 * h);
      },
      // わな：角では なく 時間・長い はり
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.int(1, 8), b = r.int(a + 2, Math.min(a + 6, 12));
          const p = { q: `みじかい はりが ${a}から ${b}まで うごくのは □《時間|じ|かん》`, a: jikan(b - a), easy: `（${KAKU}では なく 《時間|じ|かん》。 ひき《算|ざん》で）` };
          return done(p, b - a);
        }
        const t = r.int(2, 9);
        const p = { q: `《長|なが》い はりが 12から ${t}まで うごくと □《分|ふん》`, a: fun(5 * t), easy: '（《長|なが》い はり。 《数字|すう|じ》 1つで 5《分|ふん》）' };
        return done(p, 5 * t);
      },
    },
  });

  // ================================================================ 1-91（第29回 H-9：教科書 1-18 ④⑤）
  // 1時間ごとの 気温（はじめ s ℃、 ちがいは みんな ちがう 1〜6）。 down なら 下がる
  // 1行に 入る ように、 気温は 1けた（ふゆの あさ・ゆうがた）
  function temps(r, n, down) {
    const d = r.shuffle([1, 2, 3, 4]).slice(0, n - 1);
    const s = down ? r.int(7, 9) : r.int(1, 4), v = [s];
    d.forEach(x => v.push(v[v.length - 1] + (down ? -x : x)));
    return { d, v };
  }
  // 問題は 1行に 入る ように、 1時間ごとの 気温を 「12 → 15 → 21 ℃」と 書く（左の ページで ことわる）
  const arrow = v => v.join(' → ');
  const big = d => Math.max(...d);
  const diffs = v => v.slice(1).map((y, j) => Math.abs(y - v[j]));
  M.add({
    id: '1-91', part: 4, chap: '1-18', stars: 1,
    title: 'かわり《方|かた》は ひき《算|ざん》で くらべる',
    mark: `1《時間|じ|かん》ごとの ${KION}（2 → 5 → 9 ℃）で、 いちばん 《大|おお》きく かわった ところを さがす。 **となりどうしの ちがい** を ひき《算|ざん》で 《出|だ》す。`,
    futsu: ['おれ《線|せん》グラフの かたむきを', '《目|め》で 《見|み》くらべて、', 'どこか まよう。'],
    raku: ['2 → 5 → 9 ℃', '5 － 2 ＝ 3、 9 － 5 ＝ 4', 'あとの 1《時間|じ|かん》が いちばん はやい'],
    why: '《線|せん》の かたむきが 《大|おお》きい ところほど、 ちがいが 《大|おお》きい。 ひき《算|ざん》で 《数|かず》に すると、 《目|め》で 《見|み》るより たしかに くらべられる（1-18）。',
    caution: 'ひくのは となりどうし。 いちばん 《高|たか》い ところと、 いちばん はやく 《上|あ》がった ところは ちがう ことが ある。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1, boxw: '11mm',
    // となりどうしの ちがいを くらべる（「3 → 5 → 9 ℃」「なえ 4 → 7 → 9 cm」）
    fits(q) { return /^[\d →]+ ℃。 いちばん 大きい ちがいは □ ℃$|^(なえ|こいぬ) [\d →]+ (cm|kg)。 いちばん (のびた|ふえた)のは □ (cm|kg)$/.test(q); },
    steps: {
      // 3つの 気温で、 いちばん 大きく 上がった 数
      s1(r) {
        const { d, v } = temps(r, 3, false);
        if (v[2] > 9) return null;
        const p = { q: `${arrow(v)} ℃。 いちばん 《大|おお》きい ちがいは □ ℃`, a: `${big(d)} ℃`,
          easy: d.map((x, i) => `${v[i + 1]} ${S} ${v[i]}`).join('、 ') + `。 ${big(d)}が 《大|おお》きい`, easyCheck: false };
        p.verify = () => (num(p.a) === Math.max(...diffs(v)) && v[2] > v[1] && v[1] > v[0] ? true : 'ちがいが あわない');
        return p;
      },
      // 下がる 気温（夕がた）
      s2(r) {
        const { d, v } = temps(r, 3, true);
        if (v[2] < 1) return null;
        const p = { q: `${arrow(v)} ℃。 いちばん 《大|おお》きい ちがいは □ ℃`, a: `${big(d)} ℃`,
          easy: d.map((x, i) => `${v[i]} ${S} ${v[i + 1]}`).join('、 ') + `。 ${big(d)}が 《大|おお》きい`, easyCheck: false };
        p.verify = () => (num(p.a) === Math.max(...diffs(v)) && v[2] < v[1] && v[1] < v[0] ? true : 'ちがいが あわない');
        return p;
      },
      // なえの 高さ・こいぬの おもさ（気温で ない もの）
      s3(r) {
        const dog = r.chance(0.4), s = r.int(2, 5), d = r.shuffle([1, 2, 3, 4]).slice(0, 2);
        const v = [s, s + d[0], s + d[0] + d[1]];
        const q = dog ? `こいぬ ${arrow(v)} kg。 いちばん ふえたのは □ kg` : `なえ ${arrow(v)} cm。 いちばん のびたのは □ cm`;
        const p = { q, a: `${big(d)} ${dog ? 'kg' : 'cm'}`,
          easy: `${v[1]} ${S} ${v[0]}、 ${v[2]} ${S} ${v[1]}。 ${big(d)}が 《大|おお》きい`, easyCheck: false };
        p.verify = () => (num(p.a) === Math.max(...diffs(v)) ? true : 'のびが あわない');
        return p;
      },
      // わな：いちばん 高い 気温（ちがいでは なく、 いちばん 大きい 数を さがす）
      trap(r) {
        const d = r.shuffle([1, 2, 3]).slice(0, 2), s = r.int(2, 4);
        const v = [s, s + d[0], s + d[0] + d[1], s + d[0] + d[1] - r.int(1, 2)];
        const p = { q: `${arrow(v)} ℃。 いちばん 《高|たか》いのは □ ℃`, a: `${v[2]} ℃`,
          easy: '（ちがいでは なく、 いちばん 《大|おお》きい 《数|かず》を さがす）' };
        p.verify = () => (num(p.a) === Math.max(...v) ? true : '気温が あわない');
        return p;
      },
    },
  });
})(globalThis.MONDAI);
