/* 問題集 第1巻　第3部 わり算・あまり・分数・小数（わざ 1-49〜1-56）　組 d
 * 書き方は v1/README.md。文は第1巻の教科書と同じ、ひらがなの わかち書き。漢字にはルビ（《…|よ|み》）。
 * 「あまり」の答えは '7 あまり 3' の文にする。式で検算できない問題（あまり・曜日・○×・ことば）は verify で確かめる。 */
(function (M) {
  'use strict';
  const T = '×', D = '÷', E = '＝', P = '＋', S = '－';

  // ---------------------------------------------------------------- 見わけよう（fits）の 部品
  // fits(q)：ほかの わざの 問題でも、 この わざが つかえるか（q は ルビを とった 問題の 文。 README 2章）
  // 式だけの 問題（「a ÷ b」「0.7 ＋ 0.5」）を 数と 記号に わける。 □・ことば・＝ が あれば null
  const expr = q => {
    if (!/^\d+(\.\d+)?( [＋－×÷] \d+(\.\d+)?)+$/.test(q)) return null;
    const t = q.split(' ');
    return { n: t.filter((_, i) => i % 2 === 0).map(Number), o: t.filter((_, i) => i % 2 === 1) };
  };
  // 「a ÷ b」だけの 問題の [a, b]。 ちがえば null
  const div2 = q => { const e = expr(q); return e && e.n.length === 2 && e.o[0] === D ? e.n : null; };
  const NIN = '《人|にん》';
  const KUKU = '《九九|く|く》';

  // 「n日」の読み（教科書 1-15 と同じ：《7日|なのか》、 100《日|にち》）。読みが むずかしい日（34日 など）は null
  const DAY_SP = { 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか' };
  function dayR(n) {
    if (DAY_SP[n]) return `《${n}日|${DAY_SP[n]}》`;
    if (n % 10 === 4) return null;
    return `${n}《日|にち》`;
  }
  // 曜日（教科書 1-15 の じゅん：月・火・水・木・金・土・日）
  const WD = [['月', 'げつ'], ['火', 'か'], ['水', 'すい'], ['木', 'もく'], ['金', 'きん'], ['土', 'ど'], ['日', 'にち']];
  const wdFull = i => `《${WD[i][0]}曜日|${WD[i][1]}|よう|び》`;
  // 答えの 欄は「□曜日」なので、 答えは「木」だけ（R2-34）
  const wdOne = i => `《${WD[i][0]}|${WD[i][1]}》`;
  const YOUBI = '《曜日|よう|び》';
  // 小数（0.1 が t こ）を 文字に
  const dec = t => (t % 10 === 0 ? String(t / 10) : `${Math.floor(t / 10)}.${t % 10}`);
  const ok = (cond, msg) => (cond ? true : msg);
  // 入れかえただけの たし算は 同じ key（H-6）
  const ks = v => P + v.slice().sort((x, y) => x - y).join(',');
  // わなの 問題に、 同じ部の ほかの わざが つかえる ときは、 楽な形に 「わざ 1-49 で」と 書いて also に 入れる（第29回 H-1・H-2）
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

  // ------------------------------------------------------------ 1-49
  M.add({
    id: '1-49', part: 3, chap: '1-14', stars: 1,
    title: 'わり《算|ざん》は ' + KUKU + 'を ぎゃくに たどる',
    mark: '÷の うしろの かずの **だん** で、 ÷の まえの かずを さがす。',
    futsu: ['56 ÷ 7 を、 56から 7を', 'なんかいも ひいて、', 'ひけた かいすうを かぞえる。'],
    raku: ['7の だんで 56を さがす。', '7 × 8 ＝ 56', 'だから 56 ÷ 7 ＝ 8'],
    why: 'わり《算|ざん》は かけ《算|ざん》の ぎゃく。 7こずつ 8《人|にん》《分|ぶん》で 56こ だから、 56 ÷ 7 ＝ 8（きょうかしょ 1-14）。',
    caution: '0で わる わり《算|ざん》は できない。 だんに ない かずは、 あまりが 《出|で》る（わざ 1-52）。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    boxw: '20mm',   // わなの こたえ「できない」が 入る はば
    // わりきれて、 こたえが 九九の 中（56 ÷ 7、 56 ÷ □ ＝ 8、 □ × 7 ＝ 56）
    fits(q) {
      let k = div2(q), m;
      if (!k && (m = q.match(/^(\d+) ÷ □ ＝ (\d+)$/))) k = [+m[1], +m[2]];
      if (!k && (m = q.match(/^(?:□ × (\d+)|(\d+) × □) ＝ (\d+)$/))) k = [+m[3], +(m[1] || m[2])];
      if (!k) return false;
      const [a, b] = k;
      return b >= 1 && b <= 9 && a % b === 0 && a / b <= 9;
    },
    steps: {
      // そのまま：九九の こたえ ÷ だん
      s1(r) {
        const b = r.int(2, 9), c = r.int(2, 9), p = b * c;
        return { q: `${p} ${D} ${b}`, a: String(c), easy: `${b}の だん（${b} ${T} ${c} ${E} ${p}）`, verify: () => ok(b * c === p, '九九') };
      },
      // わる かずを もとめる：56 ÷ □ ＝ 8 → 8 × □ ＝ 56
      s2(r) {
        const b = r.int(2, 9), c = r.int(2, 9), p = b * c;
        return { q: `${p} ${D} □ ${E} ${c}`, a: String(b), easy: `${c}の だん（${c} ${T} ${b} ${E} ${p}）`, verify: () => ok(p / b === c, '九九') };
      },
      // 0・1・同じ かず（教科書 1-14）と、 □の ある かけ算
      s3(r) {
        const b = r.int(2, 9), k = r.pick([0, 1, 2, 3, 3]);
        if (k === 0) return { q: `0 ${D} ${b}`, a: '0', easy: `${b}の だん（${b} ${T} 0 ${E} 0）`, verify: () => ok(b * 0 === 0, '0') };
        if (k === 1) return { q: `${b} ${D} ${b}`, a: '1', easy: `${b}の だん（${b} ${T} 1 ${E} ${b}）`, verify: () => ok(b * 1 === b, '1') };
        if (k === 2) return { q: `${b} ${D} 1`, a: String(b), easy: `1の だん（1 ${T} ${b} ${E} ${b}）`, verify: () => ok(1 * b === b, '1') };
        const c = r.int(2, 9), p = b * c;
        return { q: `□ ${T} ${b} ${E} ${p}`, a: String(c), easy: `${p} ${D} ${b}` };
      },
      // わな：0で わる（0の だんに 0 いがいは ない）
      trap(r) {
        const n = r.int(2, 30);
        return { q: `${n} ${D} 0`, a: 'できない', easy: `（0の だんは みんな 0）`,
          verify: () => ok(n !== 0, '0で わる') };
      },
    },
  });

  // ------------------------------------------------------------ 1-50
  // 6 ÷ 3 の ように わりきれる くみ（a は 2〜9、 b は 2〜9）
  const PAIRS = [];
  for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) if (a % b === 0) PAIRS.push([a, b]);
  M.add({
    id: '1-50', part: 3, chap: '1-14', stars: 2,
    title: 'なん《十|じゅう》 ÷ 1けた',
    mark: '÷の まえが **60、 80** の ような なん《十|じゅう》。 10の まとまりが なんこ かで わる。',
    futsu: ['60 ÷ 3 を、 3の だんで', 'さがすが、 60は', KUKU + 'に ない。'],
    raku: ['60は 10が 6こ。', '6 ÷ 3 ＝ 2 だから、 10が 2こ。', '60 ÷ 3 ＝ 20'],
    why: '10の まとまりの まま 《分|わ》ける。 10が 6こを 3つに 《分|わ》けると、 10が 2こずつ（きょうかしょ 1-14）。',
    caution: '30 ÷ 5 の ように 3 ÷ 5 が ' + KUKU + 'に ない ときは、 そのまま 5の だん（5 × 6 ＝ 30）で。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // なん十・なん百 ÷ 1けたで、 10・100の まとまりの かずが わりきれる（60 ÷ 3、 2400 ÷ 3）
    fits(q) {
      const k = div2(q);
      if (!k || k[1] < 2 || k[1] > 9) return false;
      const [a, b] = k;
      for (let t = 10; t <= a && a % t === 0; t *= 10) { const c = a / t; if (c % b === 0 && c / b <= 9) return true; }
      return false;
    },
    steps: {
      s1(r) {
        const [a, b] = r.pick(PAIRS);
        if (a === b && r.chance(0.6)) return null;   // こたえが 10 の ものは すくなめに
        return { q: `${a * 10} ${D} ${b}`, a: String(a / b * 10), easy: `(${a} ${D} ${b}) ${T} 10 ${E} ${a / b} ${T} 10` };
      },
      // 10が 12こ・24こ…（九九の こたえ ÷ だん）
      s2(r) {
        const b = r.int(2, 9), c = r.int(2, 9), p = b * c;
        if (p < 10) return null;
        return { q: `${p * 10} ${D} ${b}`, a: String(c * 10), easy: `(${p} ${D} ${b}) ${T} 10 ${E} ${c} ${T} 10` };
      },
      // なん百・なん千 ÷ 1けた（100の まとまり）
      s3(r) {
        const [a, b] = r.pick(PAIRS);
        if (r.chance(0.5)) return { q: `${a * 100} ${D} ${b}`, a: String(a / b * 100), easy: `(${a} ${D} ${b}) ${T} 100 ${E} ${a / b} ${T} 100` };
        const c = r.int(2, 9), p = b * c;
        if (p < 10) return null;
        return { q: `${p * 100} ${D} ${b}`, a: String(c * 100), easy: `(${p} ${D} ${b}) ${T} 100 ${E} ${c} ${T} 100` };
      },
      // わな：十の くらいが わる かずで われない（九九で すぐ：わざ 1-49、 10の まとまりで 分ける：わざ 1-51 へ）
      trap(r) {
        const b = r.int(2, 8), a = r.int(1, 9);
        if (a % b === 0 || (a * 10) % b !== 0) return null;
        const c = a * 10 / b;
        return Object.assign(dest({ q: `${a * 10} ${D} ${b}`, a: String(c) }, '1-50', `${a} ${D} ${b} が ${KUKU}に ない`),
          { verify: () => ok(c * b === a * 10 && a % b !== 0, 'わりきれる') });
      },
    },
  });

  // ------------------------------------------------------------ 1-51
  M.add({
    id: '1-51', part: 3, chap: '1-14', stars: 2,
    title: '10の まとまりで 《分|わ》けて わる',
    mark: '÷の まえを、 **10の まとまり** と **のこり** に 《分|わ》ける。 どちらも ' + KUKU + 'で わる。',
    futsu: ['84 ÷ 4 を、 4の だんで', 'さがすが、 84は', KUKU + 'に ない。'],
    raku: ['84 ÷ 4 ＝ 80 ÷ 4 ＋ 4 ÷ 4', '　　　 ＝ 20 ＋ 1', '　　　 ＝ 21'],
    why: '84こを 80こと 4こに 《分|わ》けて くばっても、 ひとり《分|ぶん》は かわらない。 20こと 1こで 21こ。',
    caution: '72 ÷ 3 は 70と 2では うまく いかない。 60と 12の ように、 わりきれる なん《十|じゅう》を えらぶ。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // わりきれて、 こたえが 10 いじょう（九九の そと）。 なん十 ÷ 1けた（わざ 1-50）で すぐ でない
    fits(q) {
      const k = div2(q);
      if (!k) return false;
      const [a, b] = k;
      if (b < 2 || b > 9 || a % b !== 0 || a / b < 10 || a >= 1000) return false;
      return !(a % 10 === 0 && (a / 10) % b === 0);
    },
    steps: {
      // 十の くらいも 一の くらいも、 わる かずで われる
      s1(r) {
        const b = r.pick([2, 2, 3, 3, 4, 5, 6, 7, 8, 9]);
        const t = b * r.int(1, Math.floor(9 / b)), u = b * r.int(1, Math.floor(9 / b));
        return { q: `${t * 10 + u} ${D} ${b}`, a: String((t * 10 + u) / b), easy: `${t * 10} ${D} ${b} ${P} ${u} ${D} ${b} ${E} ${t * 10 / b} ${P} ${u / b}` };
      },
      // 72 ÷ 3 ＝ 60 ÷ 3 ＋ 12 ÷ 3（のこりが 10を こえる）
      s2(r) {
        const b = r.int(2, 8), k = r.int(1, Math.floor(9 / b)), m = r.int(1, 9);
        const n = 10 * k * b + b * m;
        if (b * m < 10 || n > 99) return null;
        return { q: `${n} ${D} ${b}`, a: String(10 * k + m), easy: `${10 * k * b} ${D} ${b} ${P} ${b * m} ${D} ${b} ${E} ${10 * k} ${P} ${m}` };
      },
      // 3けた
      s3(r) {
        if (r.chance(0.5)) {
          const b = r.int(2, 4);
          const h = b * r.int(1, Math.floor(9 / b)), t = b * r.int(1, Math.floor(9 / b)), u = b * r.int(1, Math.floor(9 / b));
          const n = 100 * h + 10 * t + u;
          return { q: `${n} ${D} ${b}`, a: String(n / b),
            easy: `${100 * h} ${D} ${b} ${P} ${10 * t + u} ${D} ${b} ${E} ${100 * h / b} ${P} ${(10 * t + u) / b}` };
        }
        const b = r.int(3, 9), k = r.int(2, 9), m = r.int(1, 9);
        if (k * b < 10) return null;
        const n = 10 * k * b + b * m;
        return { q: `${n} ${D} ${b}`, a: String(10 * k + m), easy: `${10 * k * b} ${D} ${b} ${P} ${b * m} ${D} ${b} ${E} ${10 * k} ${P} ${m}` };
      },
      // わな：九九で すぐ わかる（分けなくて よい）
      trap(r) {
        const b = r.int(3, 9), c = r.int(3, 9), p = b * c;
        if (p < 20) return null;
        return dest({ q: `${p} ${D} ${b}`, a: String(c) }, '1-51', `${b} ${T} ${c} ${E} ${p}。 ${KUKU}で すぐ`);
      },
    },
  });

  // ------------------------------------------------------------ 1-52
  M.add({
    id: '1-52', part: 3, chap: '1-15', stars: 1,
    title: 'あまりは ちかい ' + KUKU + 'から',
    mark: 'わる 《数|かず》の だんで、 ÷の まえの かずを **こえない** いちばん 《大|おお》きい ' + KUKU + 'を さがす。',
    futsu: ['38 ÷ 5 を、 38から 5を', 'なんかいも ひいて、 のこりが', '5より 《小|ちい》さく なるまで かぞえる。'],
    raku: ['5の だんで 38を こえない のは', '5 × 7 ＝ 35。 のこりは 38 － 35 ＝ 3', '38 ÷ 5 ＝ 7 あまり 3'],
    why: 'あまりは わる 《数|かず》より 《小|ちい》さい。 だから、 こえない いちばん 《大|おお》きい ' + KUKU + 'を つかう（きょうかしょ 1-15）。',
    caution: 'いちばん ちかくても、 こえる ' + KUKU + '（44 ÷ 5 の 5 × 9 ＝ 45）は つかえない。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '11mm',
    // あまりの ある わり算で、 こたえが 九九の 中（式・ふくろに 分ける・はこに つめる・いすに すわる）
    fits(q) {
      const am = (n, b) => n % b !== 0 && n < 10 * b;
      let m = q.match(/^(\d+) ÷ (\d+) ＝ □ あまり □$/);
      if (m) return am(+m[1], +m[2]);
      m = q.match(/^(\d+)(?:こを|人が) (\d+)(?:こずつ|人で|人ずつ|こ 入りの)/);
      return !!m && am(+m[1], +m[2]);
    },
    steps: {
      // そのまま：あまりが 小さい（ちかい 九九が 下に ある）
      s1(r) {
        const b = r.int(3, 9), c = r.int(2, 9), m = r.int(1, Math.ceil(b / 2) - 1), n = b * c + m;
        return { q: `${n} ${D} ${b} ${E} □ あまり □`, a: `${c} あまり ${m}`, easy: `${b} ${T} ${c} ${E} ${b * c}、 あまり ${m}`,
          verify: () => ok(b * c + m === n && m >= 1 && 2 * m < b, 'あまり') };
      },
      // ことばの もんだい
      s2(r) {
        const b = r.int(3, 9), c = r.int(2, 9), m = r.int(1, b - 1), n = b * c + m;
        if (r.chance(0.5)) {
          return { q: `${n}こを ${b}こずつ ふくろに。 □ふくろ あまり □こ。`,
            a: `${c}ふくろ ${m}こ`, easy: `${b} ${T} ${c} ${E} ${b * c}、 あまり ${m}`, verify: () => ok(b * c + m === n && m < b, 'あまり') };
        }
        return { q: `${n}こを ${b}${NIN}で 《分|わ》けると ひとり □こ、 あまり □こ。`,
          a: `${c}こ ${m}こ`, easy: `${b} ${T} ${c} ${E} ${b * c}、 あまり ${m}`, verify: () => ok(b * c + m === n && m < b, 'あまり') };
      },
      // あまりを どう するか（教科書 1-15 ⑤）・いちばん ちかい 九九が こえて いる
      s3(r) {
        const b = r.int(3, 9), c = r.int(2, 8), m = r.int(1, b - 1), n = b * c + m;
        if (r.chance(0.34)) {
          if (2 * m <= b) return null;
          return { q: `${n} ${D} ${b} ${E} □ あまり □`, a: `${c} あまり ${m}`,
            easy: `${b} ${T} ${c} ${E} ${b * c}、 あまり ${m}（${b * (c + 1)}は こえる）`,
            verify: () => ok(b * c + m === n && m < b && b * (c + 1) > n, 'こえる') };
        }
        if (r.chance(0.5)) {
          const [thing, cnt, v] = r.pick([['ボート', 'そう', 'のる'], ['《長|なが》いす', 'きゃく', 'すわる']]);
          return { q: `${n}${NIN}が ${b}${NIN}ずつ ${thing}に ${v}。 □${cnt} いる。`,
            a: String(c + 1), easy: `${c} あまり ${m}。 あまりにも 1${cnt}`,
            verify: () => ok(b * c + m === n && m > 0 && b * (c + 1) >= n, '1 ふやす') };
        }
        return { q: `${n}こを ${b}こ 《入|はい》りの はこに つめる。 □はこ できる。`,
          a: String(c), easy: `${c} あまり ${m}。 あまりは つかえない`,
          verify: () => ok(b * c + m === n && m < b, 'あまりは つかえない') };
      },
      // わな：あまりが 出ない（あまりは 0。 教科書 1-15）。 ちかい 九九を さがさなくても、 わざ 1-49 で すぐ
      trap(r) {
        const b = r.int(3, 9), c = r.int(2, 9), n = b * c;
        return { q: `${n} ${D} ${b} ${E} □ あまり □`, a: `${c} あまり 0`, also: ['1-49'],
          easy: `（あまりは 0。 わざ 1-49 で ${b} ${T} ${c} ${E} ${n}）`,
          verify: () => ok(b * c === n, 'あまりは 0') };
      },
    },
  });

  // ------------------------------------------------------------ 1-53
  // あまりの ある わり算を 1つ 作る（b：わる数、 c：こたえ、 m：あまり）
  function amari(r, bLo) {
    const b = r.int(bLo || 3, 9), c = r.int(2, 9), m = r.int(1, b - 1);
    return { b, c, m, n: b * c + m };
  }
  M.add({
    id: '1-53', part: 3, chap: '1-15', stars: 1,
    title: 'あまりの たしかめ',
    mark: 'わる 《数|かず》 × こたえ ＋ あまり が、 もとの かずに **もどるか** を 《見|み》る。',
    futsu: ['38 ÷ 5 ＝ 7 あまり 3 が', 'あって いるか、 もう いちど', 'はじめから わり《算|ざん》を する。'],
    raku: ['5 × 7 ＋ 3 ＝ 35 ＋ 3', '　　　　　 ＝ 38', '38に もどったので せいかい。'],
    why: '5こずつ 7さらで 35こ。 あまりの 3こを たすと、 ぜんぶの 38こに もどる。 × を さきに けいさん する（きょうかしょ 1-15）。',
    caution: 'もどっても、 あまりが わる 《数|かず》より 《大|おお》きい ときは まちがい（14 ÷ 3 ＝ 3 あまり 5 は ×）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '12mm',
    // わる 数 × こたえ ＋ あまり で もどす（□ ÷ 5 ＝ 7 あまり 3、 ○か ×か、 くばって あまる）。 あまりが わる 数より 小さい
    fits(q) {
      let m = q.match(/^□ ÷ (\d+) ＝ \d+ あまり (\d+)$/) || q.match(/^ある かずを (\d+)で わると、 \d+ あまり (\d+)。/) ||
        q.match(/^(\d+)人に \d+こずつ くばると (\d+)こ あまる。/);
      if (m) return +m[2] < +m[1];
      m = q.match(/^\d+ ÷ (\d+) ＝ \d+ あまり (\d+)（○か ×か）□$/);
      return !!m && +m[2] < +m[1];
    },
    steps: {
      // たしかめの しきで、 ÷の まえの かずを もとめる
      s1(r) {
        const { b, c, m, n } = amari(r);
        return { q: `□ ${D} ${b} ${E} ${c} あまり ${m}`, a: String(n), easy: `${b} ${T} ${c} ${P} ${m} ${E} ${b * c} ${P} ${m}` };
      },
      // こたえが あって いるか（○か ×か）
      s2(r) {
        const { b, c, m, n } = amari(r);
        let c2 = c, m2 = m;
        const right = r.chance(0.5);
        if (!right) {
          if (r.chance(0.5)) c2 = c + r.pick([-1, 1]);
          else m2 = m + r.pick([-1, 1]);
          if (c2 < 1 || m2 < 1 || m2 >= b) return null;
        }
        const back = b * c2 + m2;
        return { q: `${n} ${D} ${b} ${E} ${c2} あまり ${m2}（○か ×か）□`, a: right ? '○' : '×',
          easy: `${b} ${T} ${c2} ${P} ${m2} ${E} ${back}` + (right ? '' : `（${n}で ない）`),
          verify: () => ok((back === n && m2 < b) === right, '○×') };
      },
      // ことばの もんだい
      s3(r) {
        const { b, c, m, n } = amari(r);
        const q = r.chance(0.4)
          ? `ある かずを ${b}で わると、 ${c} あまり ${m}。 ある かずは □。`
          : `${b}${NIN}に ${c}こずつ くばると ${m}こ あまる。 ぜんぶで □こ`;
        return { q, a: String(n), easy: `${b} ${T} ${c} ${P} ${m} ${E} ${b * c} ${P} ${m}` };
      },
      // わな：たしかめの しきは もどるのに、 あまりが 大きすぎる
      trap(r) {
        const { b, c, m, n } = amari(r);
        if (c < 3) return null;
        const c2 = c - 1, m2 = m + b;
        return { q: `${n} ${D} ${b} ${E} ${c2} あまり ${m2}（○か ×か）□`, a: '×',
          easy: `（あまり ${m2}が ${b}より 《大|おお》きい）`,
          verify: () => ok(b * c2 + m2 === n && m2 >= b, '×') };
      },
    },
  });

  // ------------------------------------------------------------ 1-54
  const weekQ = (s, d) => `きょうは ${wdFull(s)}。 ${dayR(d)}《後|ご》は □${YOUBI}。`;
  function weekP(s, d) {
    const w = Math.floor(d / 7), m = d % 7, ans = (s + d) % 7;
    const tail = m === 0 ? `${E} ${w}。 ちょうど ${w}しゅう` : `${E} ${w} あまり ${m}`;
    return { q: weekQ(s, d), a: wdOne(ans), easy: `${d} ${D} 7 ${tail}`, verify: () => ok((s + w * 7 + m) % 7 === ans && w * 7 + m === d, '曜日') };
  }
  M.add({
    id: '1-54', part: 3, chap: '1-15', stars: 2,
    title: 'くりかえしの あまり（' + YOUBI + '）',
    mark: '《7日|なのか》ごとに おなじ ' + YOUBI + 'に もどる。 7で わった **あまり** だけ すすめる。',
    futsu: ['きょうは 《月曜日|げつ|よう|び》。 100《日|にち》《後|ご》を、', 'カレンダーで 1《日|にち》ずつ', '100かい かぞえる。'],
    raku: ['100 ÷ 7 ＝ 14 あまり 2', '14しゅう たつと、 また 《月|げつ》。', 'あと 《2日|ふつか》 すすめて 《水曜日|すい|よう|び》'],
    why: '《7日|なのか》 すすんでも ' + YOUBI + 'は かわらない。 かわるのは、 あまりの 《日|ひ》の ぶんだけ（きょうかしょ 1-15）。',
    caution: '《7日|なのか》より すくない ときは、 わらずに そのまま かぞえよう。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    // 7日 いじょう あとの 曜日・12時間 いじょう あとの 時計・3つの くりかえしの 4ばんめ いこう
    fits(q) {
      let m = q.match(/^きょうは \S曜日。 (\d+)日後は □曜日。$/);
      if (m) return +m[1] >= 7;
      m = q.match(/^いま \d+時。 (\d+)時間 たつと/);
      if (m) return +m[1] >= 12;
      m = q.match(/^\S+・\S+・\S+ の くりかえし。 (\d+)ばんめは □。$/);
      return !!m && +m[1] > 3;
    },
    steps: {
      // きょうは 月曜日
      s1(r) {
        const d = r.int(8, 100);
        if (!dayR(d)) return null;
        return weekP(0, d);
      },
      // ほかの 曜日から（日曜日を こえて もどる）
      s2(r) {
        const s = r.int(1, 6), d = r.int(8, 60);
        if (!dayR(d) || s + (d % 7) < 7) return null;
        return weekP(s, d);
      },
      // ほかの くりかえし（時計の はり・いろの ならび）
      s3(r) {
        if (r.chance(0.5)) {
          const h = r.int(1, 10), t = r.int(13, 30), m = t % 12;
          if (m === 0 || h + m > 12) return null;
          return { q: `いま ${h}《時|じ》。 ${t}《時間|じ|かん》 たつと、 《短|みじか》い はりは □《時|じ》。`, a: String(h + m),
            easy: `${t} ${D} 12 は ${Math.floor(t / 12)} あまり ${m}。 ${h} ${P} ${m}`,
            verify: () => ok(((h + t - 1) % 12) + 1 === h + m, '時計') };
        }
        const C = ['あか', 'しろ', 'あお'];
        const n = r.int(10, 50), m = n % 3, ans = C[(n - 1) % 3];
        return { q: `あか・しろ・あお の くりかえし。 ${n}ばんめは □。`, a: ans,
          easy: `${n} ${D} 3 ${E} ${Math.floor(n / 3)}` + (m === 0 ? '、 さいごの いろ' : ` あまり ${m}`),
          verify: () => ok(C[m === 0 ? 2 : m - 1] === ans, 'いろ') };
      },
      // わな：7日より すくない（わらなくて よい）
      trap(r) {
        const s = r.int(0, 6), d = r.int(2, 6), ans = (s + d) % 7;
        return { q: weekQ(s, d), a: wdOne(ans), easy: '（《7日|なのか》より すくない）', verify: () => ok(d < 7, '7日より すくない') };
      },
    },
  });

  // ------------------------------------------------------------ 1-55
  const Q4 = '《f:1/4》', Q2 = '《f:1/2》';
  const half2 = n => `${n} ${D} 2 ${D} 2 ${E} ${n / 2} ${D} 2`;
  M.add({
    id: '1-55', part: 3, chap: '1-16', stars: 1,
    title: 'はんぶんの はんぶん（《分数|ぶん|すう》）',
    mark: Q4 + ' は **はんぶんの はんぶん**。 ÷ 4 の かわりに、 2で 2かい わる。',
    futsu: ['12この ' + Q4 + ' を、 12こを', '4つに 1こずつ くばって', 'かぞえる。'],
    raku: ['12の はんぶんは 6。', '6の はんぶんは 3。', '12この ' + Q4 + ' は 3こ。'],
    why: 'はんぶんに 《切|き》って、 また はんぶんに 《切|き》ると、 《同|おな》じ 《大|おお》きさの 4つに なる（きょうかしょ 1-16）。',
    caution: Q2 + ' の ときは、 はんぶんに 1かい するだけ。',
    counts: { s1: 8, s2: 8, s3: 6, trap: 2 },
    // 1/4（4で わりきれる かず）・九九の そとの ÷ 4（72 ÷ 4）
    fits(q) {
      const m = q.match(/^(\d+)(?:こ|円)?の 1\/4/);
      if (m) return +m[1] % 4 === 0;
      const k = div2(q);
      return !!k && k[1] === 4 && k[0] % 4 === 0 && k[0] > 36;
    },
    steps: {
      s1(r) {
        const n = 4 * r.int(2, 12);
        return { q: `${n}この ${Q4} は □こ`, a: String(n / 4), easy: half2(n) };
      },
      // 大きな かず・÷ 4 の しき
      s2(r) {
        const n = 4 * r.int(13, 25);
        return r.chance(0.5)
          ? { q: `${n}の ${Q4}`, a: String(n / 4), easy: half2(n) }
          : { q: `${n} ${D} 4`, a: String(n / 4), easy: half2(n) };
      },
      // 大きな かずの こ・円・3けた
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = 4 * r.int(13, 25);
          return { q: `${n}この ${Q4} は □こ`, a: String(n / 4), easy: half2(n) };
        }
        if (k === 1) {
          const n = 4 * r.int(5, 25);
          return { q: `${n}《円|えん》の ${Q4} は □《円|えん》`, a: String(n / 4), easy: half2(n) };
        }
        const n = 40 * r.int(3, 10);
        return { q: `${n}の ${Q4}`, a: String(n / 4), easy: half2(n) };
      },
      // わな：1/2 は はんぶん 1かい
      trap(r) {
        const n = 2 * r.int(5, 20);
        return { q: `${n}この ${Q2} は □こ`, a: String(n / 2), easy: `（はんぶん 1かい だけ）` };
      },
    },
  });

  // ------------------------------------------------------------ 1-56
  M.add({
    id: '1-56', part: 3, chap: '1-16', stars: 1,
    title: '0.1が いくつ《分|ぶん》',
    mark: '《小数|しょう|すう》の たし《算|ざん》・ひき《算|ざん》は、 **0.1が なんこ** かで かんがえる。',
    futsu: ['0.7 ＋ 0.5 を、 《数直線|すう|ちょく|せん》の', '《目|め》もりを 1つずつ', 'かぞえて すすむ。'],
    raku: ['0.7は 0.1が 7こ、 0.5は 0.1が 5こ。', '7 ＋ 5 ＝ 12 で、 0.1が 12こ。', '0.7 ＋ 0.5 ＝ 1.2'],
    why: '0.1を 1つの まとまりと 《見|み》れば、 ふつうの たし《算|ざん》。 0.1が 10こで 1（きょうかしょ 1-16）。',
    caution: '2 ＋ 0.6 の ように、 ちょうどの かずと あわせる だけなら、 そのまま 2.6。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 小数どうしの たし算・小数を ひく ひき算・0.1が なんこ
    fits(q) {
      if (/^0\.1が \d+こで □$|^\d+(\.\d+)?は 0\.1が □こ$/.test(q)) return true;
      const e = expr(q);
      if (!e || e.n.length !== 2) return false;
      const dec = x => x % 1 !== 0;
      if (e.o[0] === P) return dec(e.n[0]) && dec(e.n[1]);
      return e.o[0] === S && dec(e.n[1]);
    },
    steps: {
      s1(r) {
        const x = r.int(1, 9), y = r.int(1, 9);
        if (x + y < 10 && r.chance(0.6)) return null;   // くり上がる ものを 多めに
        return { q: `${dec(x)} ${P} ${dec(y)}`, a: dec(x + y), easy: `0.1が ${x} ${P} ${y} ${E} ${x + y}こ`, key: ks([x, y]) };
      },
      // ひき算
      s2(r) {
        const A = r.chance(0.7) ? r.int(10, 18) : r.int(2, 9), y = r.int(1, 9);
        if (A - y < 1 || (A >= 10 && A - y >= 10)) return null;
        return { q: `${dec(A)} ${S} ${dec(y)}`, a: dec(A - y), easy: `0.1が ${A} ${S} ${y} ${E} ${A - y}こ` };
      },
      // 0.1が なんこ・1より 大きい 小数
      s3(r) {
        const A = r.int(11, 39), y = r.int(1, 9), k = r.int(0, 3);
        if (A % 10 === 0) return null;
        const w = Math.floor(A / 10), u = A % 10;
        if (k === 0) return { q: `0.1が ${A}こで □`, a: dec(A), easy: `${10 * w}こで ${w}、 ${u}こで 0.${u}`, verify: () => ok(w + u / 10 === A / 10, '0.1') };
        if (k === 1) return { q: `${dec(A)}は 0.1が □こ`, a: String(A), easy: `${w}は ${10 * w}こ、 0.${u}は ${u}こ`, verify: () => ok(w * 10 + u === A, '0.1') };
        const plus = r.chance(0.6), v = plus ? A + y : A - y, op = plus ? P : S;
        return { q: `${dec(A)} ${op} ${dec(y)}`, a: dec(v), easy: `0.1が ${A} ${op} ${y} ${E} ${v}こ` };
      },
      // わな：ちょうどの かずと 0.いくつ を あわせる だけ
      trap(r) {
        const w = r.int(1, 9), x = r.int(1, 9);
        const q = r.chance(0.5) ? `${w} ${P} ${dec(x)}` : `${dec(x)} ${P} ${w}`;
        return { q, a: `${w}.${x}`, easy: `（${w}と 0.${x}で ${w}.${x}）`, key: ks([10 * w, x]) };
      },
    },
  });

  // ------------------------------------------------------------ 1-90（第29回 H-9：教科書 1-16 ⑥）
  // [問題, 答えの 単位, 答えの 数, 楽な形]。 答えの 数は べつに 計算して おき、 verify で くらべる
  const L90 = {
    s1: [
      [`${Q2} L ${E} □ dL`, 'dL', 10 / 2, '1 L ＝ 10 dL の はんぶん'],
      [`0.5 L ${E} □ dL`, 'dL', 0.5 * 10, `0.5 は ${Q2}。 10 dL の はんぶん`],
      [`${Q2} cm ${E} □ mm`, 'mm', 10 / 2, '1 cm ＝ 10 mm の はんぶん'],
      [`0.5 cm ${E} □ mm`, 'mm', 0.5 * 10, `0.5 は ${Q2}。 10 mm の はんぶん`],
      [`${Q2} ${E} 0.□`, '', 5, '0.1が 10この はんぶんで 5こ'],
      ['1 L の はんぶんは □ L', 'L', 1 / 2, `はんぶんは ${Q2}、 0.5`],
      [`1 L の ${Q2} は □ dL`, 'dL', 10 / 2, '10 dL の はんぶん'],
      [`1 cm の ${Q2} は □ mm`, 'mm', 10 / 2, '10 mm の はんぶん'],
    ],
    s2: [
      [`5 dL ${E} □ L`, 'L', 5 / 10, `10 dL の はんぶんで ${Q2} L`],
      [`5 mm ${E} □ cm`, 'cm', 5 / 10, `10 mm の はんぶんで ${Q2} cm`],
      [`2 L の ${Q2} は □ L`, 'L', 2 / 2, '2 L の はんぶん'],
      [`${Q2} L ${P} ${Q2} L ${E} □ L`, 'L', 1, 'はんぶんが 2つで 1'],
      [`0.5 L ${P} 0.5 L ${E} □ L`, 'L', 1, 'はんぶんが 2つで 1'],
      [`0.5 L ${P} ${Q2} L ${E} □ L`, 'L', 1, 'どちらも はんぶん。 2つで 1'],
      [`1 L と ${Q2} L で □ dL`, 'dL', 10 + 5, '10 dL と 5 dL'],
      [`3 L の ${Q2} は □ L`, 'L', 3 / 2, '1 L と 0.5 L'],
    ],
    s3: [
      [`${Q2} 《時間|じ|かん》 ${E} □《分|ぷん》`, '《分|ぷん》', 60 / 2, '60《分|ぷん》の はんぶん'],
      [`1 m の ${Q2} は □ cm`, 'cm', 100 / 2, '100 cm の はんぶん'],
      [`1 kg の ${Q2} は □ g`, 'g', 1000 / 2, '1000 g の はんぶん'],
      [`100《円|えん》の ${Q2} は □《円|えん》`, '《円|えん》', 100 / 2, '100の はんぶん'],
      [`1 L の ${Q2} は □ mL`, 'mL', 1000 / 2, '1000 mL の はんぶん'],
      [`0.5 L ${E} □ mL`, 'mL', 0.5 * 1000, `${Q2} L。 1000 mL の はんぶん`],
      [`1《分|ぷん》の ${Q2} は □《秒|びょう》`, '《秒|びょう》', 60 / 2, '60《秒|びょう》の はんぶん'],
    ],
  };
  function p90(t, also) {
    const [q, u, v, easy] = t;
    const a = u === '' ? String(v) : /^[a-zA-Z]/.test(u) ? `${v} ${u}` : `${v}${u}`;
    const p = { q, a, easy, verify: () => ok(Math.abs(parseFloat(M.plain(a)) - v) < 1e-9, '0.5 と 1/2') };
    if (also) p.also = also;
    return p;
  }
  M.add({
    id: '1-90', part: 3, chap: '1-16', stars: 1,
    title: '0.5 は ' + Q2,
    mark: '0.5 や ' + Q2 + ' が ある。 どちらも **はんぶん** と おなじ 《大|おお》きさ。',
    futsu: [Q2 + ' L は なん dL かを、', '1 L ますに 《水|みず》を 《入|い》れて', '《目|め》もりを よむ。'],
    raku: [Q2 + ' L は 1 L の はんぶん。', '1 L ＝ 10 dL の はんぶんで 5 dL。', '0.5 L も、 0.1 L が 5こで 5 dL。'],
    why: '1を 10こに 《分|わ》けた 5こ《分|ぶん》が 0.5、 2つに 《分|わ》けた 1つ《分|ぶん》が ' + Q2 + '。 どちらも はんぶん（きょうかしょ 1-16）。',
    caution: '0.4 や ' + Q4 + ' は はんぶんでは ない。 ' + Q2 + ' 《時間|じ|かん》は 5《分|ふん》では なく 30《分|ぷん》。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: { s3: 1 },
    boxw: '15mm',
    // 0.5・1/2 を はんぶんと して 単位を なおす（「20この 1/2」の ような 数の はんぶんは わざ 1-55 の わな）
    fits(q) {
      return [/^(1\/2|0\.5) (L|cm) ＝ □ (dL|mm)$/, /^1\/2 ＝ 0\.□$/, /^1 L の はんぶんは □ L$/, /^\d+ (L|cm|m|kg) の 1\/2 は □/,
        /^\d+(円|分)の 1\/2 は □/, /^5 (dL|mm) ＝ □ (L|cm)$/, /^(1\/2|0\.5) L ＋ (1\/2|0\.5) L ＝ □ L$/, /^1 L と 1\/2 L で □ dL$/,
        /^1\/2 時間 ＝ □分$/, /^0\.5 L ＝ □ mL$/].some(re => re.test(q));
    },
    steps: {
      s1(r) { return p90(r.pick(L90.s1)); },
      s2(r) { return p90(r.pick(L90.s2)); },
      s3(r) { return p90(r.pick(L90.s3)); },
      // わな：0.4 や 1/4 は はんぶんでは ない（0.1が いくつ分：わざ 1-56、 はんぶんの はんぶん：わざ 1-55 へ）
      trap(r) {
        if (r.chance(0.5)) {
          const x = r.pick([2, 3, 4, 6, 7, 8]);
          return p90([`0.${x} L ${E} □ dL`, 'dL', x, `（はんぶんでは ない。 0.1 L が ${x}こ。 わざ 1-56 で）`], ['1-56']);
        }
        const t = r.pick([[`1 m の ${Q4} は □ cm`, 'cm', 100 / 4], [`1 L の ${Q4} は □ mL`, 'mL', 1000 / 4], [`1 kg の ${Q4} は □ g`, 'g', 1000 / 4]]);
        return p90([t[0], t[1], t[2], '（はんぶんの はんぶん。 わざ 1-55 で）'], ['1-55']);
      },
    },
  });
})(globalThis.MONDAI);
