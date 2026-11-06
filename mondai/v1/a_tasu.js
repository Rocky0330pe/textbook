/* 問題集 第1巻　第1部 たし算（わざ 1-01〜1-13）　組 a
 * 書き方は v1/README.md。
 * ・楽な形（easy）は、こたえの らんの 2れつに 1行で 入るように 短く する（見分けようでは「わざ 1-xx：」が 前に つく）。
 * ・**…** の 中に ルビ（《…》）を 入れない（core.js の 変換で 太字に ならない）。 */
(function (M) {
  'use strict';
  const P = '＋', S = '－';

  // ---------------------------------------------------------------- 見わけよう（fits）の 部品
  // fits(q)：ほかの わざの 問題でも、 この わざが つかえるか（q は ルビを とった 問題の 文。 README 2章）
  // 式だけの 問題（「a ＋ b ＋ c」）を 数と 記号に わける。 □・ことば・＝ が あれば null
  const expr = q => {
    if (!/^\d+(\.\d+)?( [＋－×÷] \d+(\.\d+)?)+$/.test(q)) return null;
    const t = q.split(' ');
    return { n: t.filter((_, i) => i % 2 === 0).map(Number), o: t.filter((_, i) => i % 2 === 1) };
  };
  // たし算の 数（式か、「あわせて」「もらうと」「ぜんぶで」の ことばの もんだい）。 ちがえば null
  const adds = q => {
    const e = expr(q);
    if (e) return e.o.every(o => o === P) ? e.n : null;
    if (!/(あわせて|もらうと|ぜんぶで) □/.test(q) || /ずつ|\./.test(q)) return null;
    const t = q.replace(/\d+くみ /g, '');
    const n = (t.match(/\d+/g) || []).map(Number);
    return n.length >= 2 ? n : null;
  };
  // ひき算 a － b の [a, b]（式・「a － □ ＝ c」・「おつりは」「のこりは」の ことばの もんだい）。 ちがえば null
  const subs = q => {
    const e = expr(q);
    if (e) return e.n.length === 2 && e.o[0] === S ? e.n : null;
    const m = q.match(/^(\d+) － □ ＝ (\d+)$/);
    if (m) return [+m[1], +m[2]];
    if (/(おつりは|のこりは) □/.test(q)) { const n = (q.match(/\d+/g) || []).map(Number); if (n.length === 2) return n; }
    return null;
  };
  // 「a ＋ □ ＝ T」「□ ＋ a ＝ T」「Tは aと □」の [a, T]。 ちがえば null
  const toT = q => {
    let m = q.match(/^(?:(\d+) ＋ □|□ ＋ (\d+)) ＝ (\d+)$/);
    if (m) return [+(m[1] || m[2]), +m[3]];
    m = q.match(/^(\d+)は (\d+)と □$/);
    return m ? [+m[2], +m[1]] : null;
  };
  // どこか 2つの 一の くらいを たすと 10（gap：はなれて いる ことが いる）
  const pair10 = (n, gap, ok) => n.some((x, i) => n.some((y, j) => j >= i + gap && x % 10 !== 0 && (x + y) % 10 === 0 && (!ok || ok(x, y))));
  // 一の くらいが 0で ない 2けたの かず
  const two = (r, lo, hi) => r.intNot(lo || 11, hi || 89, v => v % 10 === 0);
  // □の ある 問題の 検算（式に 答えを 入れて、 左と 右が 同じか）
  const chk = (ok, msg) => () => (ok ? true : msg);
  // 入れかえた だけの たし算（8 ＋ 7 と 7 ＋ 8）は、 同じ 問題と みる（第29回 H-6）。
  // 式だけの たし算には、 数を 小さい 順に ならべた key を つける（core.js の makeStep が p.key で 同じかを 見る）
  const addKey = q => { const t = M.plain(q), e = expr(t); return e && e.o.every(o => o === P) ? P + e.n.slice().sort((x, y) => x - y).join(' ') : null; };
  const add = def => {
    for (const s of Object.keys(def.steps)) {
      const f = def.steps[s];
      def.steps[s] = r => { const p = f(r); if (p && !p.key) { const k = addKey(p.q); if (k) p.key = k; } return p; };
    }
    M.add(def);
  };

  add({
    id: '1-01', part: 1, chap: '1-2・1-4', stars: 1,
    title: '10に なる くみ',
    mark: 'こたえが **10** に なる たし《算|ざん》。 「あと いくつで 10」を さがす。',
    futsu: ['3に いくつ たすと 10？', '4、 5、 6、 … 10 と', 'ゆびで かぞえる。'],
    raku: ['10に なる くみを おぼえる。', '1と 9　2と 8　3と 7', '4と 6　5と 5', '3は 7と くんで 10。'],
    why: '10は 「いくつと いくつ」に わけられる（きょうかしょ 1-4）。 くみを おぼえれば、 かぞえなくて よい。',
    caution: 'こたえが 10で ない ときは、 この くみは つかえない。 しきの こたえを よく 《見|み》よう。',
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    // 10・なん十まで あと 1けた（3 ＋ □ ＝ 10、 36 ＋ □ ＝ 40、 10 － 3、 あと □こで 10こ）
    fits(q) {
      if (/あと □\S*で 10\S*。$/.test(q)) return true;
      const n = adds(q);
      if (n && n.length === 2 && n[0] + n[1] === 10 && n.every(x => x >= 1)) return true;   // 4 ＋ 6
      const t = toT(q), s = subs(q), [a, T] = t || (s ? [s[1], s[0]] : [0, 0]);
      return T > 0 && T % 10 === 0 && a % 10 !== 0 && T - a > 0 && T - a < 10;
    },
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
          `10《円|えん》 だして ${u}《円|えん》の あめを かう。 おつりは □《円|えん》。`,
        ]);
        return { q, a: String(b), easy: `${u}と ${b}で 10`, verify: chk(u + b === 10, 'たして 10に ならない') };
      },
      // こたえが 10で ない（4 ＋ □ ＝ 8 は おなじ かずの たし算に なるので のぞく）
      trap(r) {
        const n = r.pick([8, 9]), a = r.int(2, n - 2), b = n - a;
        if (a === b) return null;
        return { q: `${a} ${P} □ ＝ ${n}`, a: String(b), easy: `（10で ない。 ${a}と ${b}で ${n}）`, verify: chk(a + b === n, 'ちがう') };
      },
    },
  });

  add({
    id: '1-02', part: 1, chap: '1-4', stars: 1,
    title: '10を つくって たす（さくらんぼ）',
    mark: 'こたえが 10を こえる。 **あと いくつで 10** かを 《見|み》る。',
    futsu: ['8 ＋ 5 を、 8から', '9、 10、 11、 12、 13 と', 'ゆびで かぞえる。'],
    raku: ['8は あと 2で 10。 5を 2と 3に わける。', '8 ＋ 5 ＝ 8 ＋ 2 ＋ 3', '　　　＝ 10 ＋ 3 ＝ 13'],
    why: '10の まとまりが できると、 あとは 10と いくつ で すぐ わかる（きょうかしょ 1-2）。',
    caution: 'こたえが 10より 《小|ちい》さい ときは、 10を つくらなくても よい。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    // 1けたを たして 一の くらいが 10を こえる（8 ＋ 5、 77 ＋ 9）
    fits(q) {
      const n = adds(q);
      return !!n && n.length === 2 && n.some(x => x >= 1 && x <= 9) && n.every(x => x % 10 !== 0) && n[0] % 10 + n[1] % 10 > 10;
    },
    steps: {
      // 大きい かず ＋ 小さい かず（大きい ほうを 10に する）
      s1(r) {
        const a = r.int(6, 9), b = r.int(11 - a, 9);
        if (b > a) return null;
        const k = 10 - a;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${a} ${P} ${k} ${P} ${b - k} ＝ 10 ${P} ${b - k}` };
      },
      // 小さい かず ＋ 大きい かず（大きい ほうを 10に する。 じゅんばんを かえて よい）・1けた ＋ 10いくつ
      // （8 ＋ 5 と 5 ＋ 8 は 同じ 問題と みるので、 ステップ1に ない くみを 10いくつで おぎなう）
      s2(r) {
        if (r.chance(0.5)) {
          const u = r.int(5, 9), a = r.int(11 - u, 9), k = 10 - u, b = 10 + u;
          return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${b} ${P} ${k} ${P} ${a - k} ＝ 20 ${P} ${a - k}` };
        }
        const b = r.int(6, 9), a = r.int(11 - b, b - 1);
        if (a < 2) return null;
        const k = 10 - b;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${b} ${P} ${k} ${P} ${a - k} ＝ 10 ${P} ${a - k}` };
      },
      // 2けた ＋ 1けたで、 くり上がる
      s3(r) {
        const t = r.int(2, 7), u = r.int(5, 9), b = r.int(11 - u, 9);
        const a = t * 10 + u, k = 10 - u;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${a} ${P} ${k} ${P} ${b - k} ＝ ${a + k} ${P} ${b - k}` };
      },
      // 10に ちかいが こえない（6 ＋ 3、 34 ＋ 5）。 ちがいが 3 いじょうで、 わざ 1-05 にも ならない もの
      trap(r) {
        if (r.chance(0.5)) {
          const [a, b] = r.pick([[6, 3], [7, 2], [6, 2], [5, 2], [7, 1]]);
          const q = r.chance(0.5) ? `${a} ${P} ${b}` : `${b} ${P} ${a}`;
          return { q, a: String(a + b), easy: '（10を こえない。 そのまま たす）' };
        }
        const t = r.int(2, 8), u = r.int(3, 7), b = r.int(Math.max(1, 8 - u), 9 - u), n = t * 10 + u;
        return { q: `${n} ${P} ${b}`, a: String(n + b), easy: `（${u} ${P} ${b}は 10を こえない。 そのまま）` };
      },
    },
  });

  add({
    id: '1-03', part: 1, chap: '1-4', stars: 1,
    title: '5の まとまりで たす',
    mark: 'たす かずが どちらも **6・7・8・9** の どれか。 どれも 「5と いくつ」。',
    futsu: ['6 ＋ 7 を、 6から', '7、 8、 9、 … 13 と', 'ゆびで 7つ かぞえる。'],
    raku: ['6は 5と 1、 7は 5と 2。', '6 ＋ 7 ＝ （5 ＋ 5） ＋ （1 ＋ 2）', '　　　＝ 10 ＋ 3 ＝ 13'],
    why: '5と 5で 10の まとまりが できるので、 のこりの 1と 2を たすだけ（いくつと いくつ。 きょうかしょ 1-4）。',
    caution: 'どちらかが 5より 《小|ちい》さい ときは、 5が 2つ できない。 10を つくって たそう（わざ 1-02）。',
    // 2つとも 5〜9（9 ＋ 5、 19 ＋ 8、 90 ＋ 60）
    fits(q) {
      const n = adds(q);
      if (!n || n.length !== 2) return false;
      let d;
      if (n.every(x => x % 10 === 0 && x <= 90)) d = n.map(x => x / 10);
      else if (n.every(x => x % 10 !== 0 && x < 20) && n.some(x => x < 10)) d = n.map(x => x % 10);
      else return false;
      return d.every(x => x >= 5) && d[0] + d[1] > 10;
    },
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
      // くり上がるが、 かたほうが 5より 小さい（8 ＋ 4）。 5が 2つ できないので、 10を つくって たす
      trap(r) {
        const [a, b] = r.pick([[8, 3], [8, 4], [7, 4]]);
        const q = r.chance(0.5) ? `${a} ${P} ${b}` : `${b} ${P} ${a}`;
        return { q, a: String(a + b), easy: `（${b}は 5より 《小|ちい》さい。 わざ 1-02 で）`, also: ['1-02'] };
      },
    },
  });

  add({
    id: '1-04', part: 1, chap: '1-4', stars: 1,
    title: '《同|おな》じ かずの たし《算|ざん》',
    mark: '**おなじ かず** どうしを たす。 6 ＋ 6、 8 ＋ 8 など。',
    futsu: ['7 ＋ 7 を、 7から', '8、 9、 10、 … 14 と', 'ゆびで かぞえる。'],
    raku: ['《同|おな》じ かずの たし《算|ざん》は おぼえる。', '5 ＋ 5 ＝ 10　6 ＋ 6 ＝ 12', '7 ＋ 7 ＝ 14　8 ＋ 8 ＝ 16', '9 ＋ 9 ＝ 18'],
    why: '7 ＋ 7 は、 5 ＋ 5 ＝ 10 と 2 ＋ 2 ＝ 4 で 14（わざ 1-03）。 いちど たしかめたら、 おぼえて しまおう。',
    caution: '2つの かずが ちがう ときは、 そのままでは つかえない。 1 ちがいなら わざ 1-05。',
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    // おなじ かず どうし（7 ＋ 7、 8 ＋ □ ＝ 16）
    fits(q) {
      const n = adds(q);
      if (n) return n.length === 2 && n[0] === n[1];
      const t = toT(q);
      if (t) return 2 * t[0] === t[1];
      return /^\S+ 2\S*に \d+こずつ。 ぜんぶで □/.test(q) || /^\S+と \S+が \S+を \d+こずつ。 あわせて □/.test(q);
    },
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
          `ソラと ミナが どんぐりを ${a}こずつ。 あわせて □こ。`,
        ]);
        return { q, a: String(2 * a), easy: `${a} ${P} ${a} ＝ ${2 * a}` };
      },
      // 同じ かずでは ない
      trap(r) {
        const a = r.int(2, 7), b = r.int(2, 7);
        if (Math.abs(a - b) < 3 || a + b > 9) return null;   // 2 ちがいは わざ 1-05
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: '（《同|おな》じ かずで ない）' };
      },
    },
  });

  add({
    id: '1-05', part: 1, chap: '1-4', stars: 1,
    title: '《同|おな》じ かずの となり',
    mark: '2つの かずが **1 ちがい**（となりどうし）。 7と 8、 8と 9 など。',
    futsu: ['7 ＋ 8 を、 7から', '8、 9、 10、 … 15 と', 'ゆびで 8つ かぞえる。'],
    raku: ['8は 7より 1 《大|おお》きい。', '7 ＋ 8 ＝ 7 ＋ 7 ＋ 1', '　　　＝ 14 ＋ 1 ＝ 15'],
    why: '7 ＋ 7 ＝ 14 を おぼえて いれば（わざ 1-04）、 1 たすだけ。 2 ちがいなら、 1を うつして 《同|おな》じ かずに する。',
    caution: 'ちがいが 3 いじょう ある ときは、 10を つくって たそう（わざ 1-02）。',
    // 1 ちがい・2 ちがい（7 ＋ 8、 6 ＋ 8、 70 ＋ 60、 25 ＋ 26）
    fits(q) {
      const n = adds(q);
      if (!n || n.length !== 2) return false;
      const a = Math.min(n[0], n[1]), b = Math.max(n[0], n[1]), d = b - a;
      if (b <= 9) return a >= 3 && (d === 1 || d === 2);
      if (a % 10 === 0 && b % 10 === 0 && b <= 90) return a >= 20 && (d === 10 || d === 20);
      return a >= 11 && b <= 99 && (d === 1 || d === 2);
    },
    // 8 ＋ 7 と 7 ＋ 8 は 同じ 問題と みるので、 ステップ1・2は 10いくつも 入れる（R1-19）
    counts: { s1: 9, s2: 8, s3: 6, trap: 2 },
    steps: {
      // a ＋ (a＋1)、 (a＋1) ＋ a（1けたと 10いくつ）
      s1(r) {
        const a = r.chance(0.6) ? r.int(3, 8) : r.int(11, 14);
        const q = r.chance(0.5) ? `${a} ${P} ${a + 1}` : `${a + 1} ${P} ${a}`;
        return { q, a: String(2 * a + 1), easy: `${a} ${P} ${a} ${P} 1` };
      },
      // 2 ちがい：1を うつして 同じ かずに（6 ＋ 8 ＝ 7 ＋ 7、 12 ＋ 14 ＝ 13 ＋ 13）
      s2(r) {
        const a = r.chance(0.6) ? r.int(3, 7) : r.int(11, 14);
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

  add({
    id: '1-06', part: 1, chap: '1-4', stars: 1,
    title: 'たす じゅんばんを かえて 10を つくる',
    mark: '3つ たす とき、 **たして 10に なる くみ**（7と 3 など）が はなれて いる。',
    futsu: ['7 ＋ 6 ＋ 3 を まえから。', '7 ＋ 6 ＝ 13（くり《上|あ》がる）', '13 ＋ 3 ＝ 16'],
    raku: ['7と 3で 10。 さきに たす。', '7 ＋ 6 ＋ 3 ＝ 7 ＋ 3 ＋ 6', '　　　　　 ＝ 10 ＋ 6 ＝ 16'],
    why: 'たし《算|ざん》は、 たす じゅんばんを 《入|い》れかえても こたえは おなじ（きょうかしょ 1-4・1-7）。 10の まとまりを さきに つくる。',
    caution: '10に なる くみが ない ときは、 まえから じゅんに たそう。',
    // 3つ いじょう たす。 はなれた 2つで 10（1つは 1けた）
    fits(q) {
      const m = q.match(/^(\d+) ＋ □ ＋ (\d+) ＝ \d+$/);
      if (m) return (+m[1] + +m[2]) % 10 === 0;
      const n = adds(q);
      return !!n && n.length >= 3 && pair10(n, 2, (x, y) => Math.min(x, y) < 10);
    },
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

  add({
    id: '1-07', part: 1, chap: '1-7', stars: 1,
    title: '9を たすときは 10を たして 1 ひく',
    mark: 'たす かずが **9**。 9は 10より 1 すくない。',
    futsu: ['25 ＋ 9 を ひっ《算|さん》で。', '5 ＋ 9 ＝ 14、 1 くり《上|あ》げて', '2 ＋ 1 ＝ 3。 こたえ 34'],
    raku: ['9は 10より 1 すくない。', '25 ＋ 9 ＝ 25 ＋ 10 － 1', '　　　 ＝ 35 － 1 ＝ 34'],
    why: '10を たすのは、 《十|じゅう》の くらいを 1 ふやすだけ（きょうかしょ 1-7）。 たしすぎた 1を あとで ひく。',
    caution: 'たす かずが 9（19、 29 …）で ない ときは、 くらいごとに たそう。',
    // ＋ 9（19・29 …）。 もう 1つは なん十で ない
    fits(q) {
      const n = adds(q);
      return !!n && n.length === 2 && n.some((x, i) => x % 10 === 9 && x < 90 && n[1 - i] % 10 !== 0);
    },
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

  add({
    id: '1-08', part: 1, chap: '1-7', stars: 1,
    title: 'なん《十|じゅう》を たす',
    mark: 'たす かずが **20、 30、 40 …** の ような なん《十|じゅう》（《一|いち》の くらいが 0）。',
    futsu: ['34 ＋ 20 を ひっ《算|さん》で。', '4 ＋ 0 ＝ 4、 3 ＋ 2 ＝ 5。', 'こたえ 54'],
    raku: ['《一|いち》の くらいは その まま 4。', '《十|じゅう》の くらいだけ 3と 2で 5。', '34 ＋ 20 ＝ 50 ＋ 4 ＝ 54'],
    why: '20は 10の まとまりが 2つ。 10の まとまりの かずだけ たせば よく、 ばらは かわらない（きょうかしょ 1-7）。',
    caution: 'たす かずの 《一|いち》の くらいが 0で ない ときは、 くらいごとに たそう（わざ 1-09）。',
    // ＋ なん十（10〜90）。 もう 1つは 2けた いじょう
    fits(q) {
      const n = adds(q);
      return !!n && n.length === 2 && n.some((x, i) => x % 10 === 0 && x >= 10 && x <= 90 && n[1 - i] >= 10);
    },
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

  add({
    id: '1-09', part: 1, chap: '1-7', stars: 1,
    title: 'くらいごとに たす',
    mark: '2けた ＋ 2けた。 **おなじ くらいどうし** で たす（《十|じゅう》と 《十|じゅう》、 《一|いち》と 《一|いち》）。',
    futsu: ['36 ＋ 27 を ひっ《算|さん》で。', 'くらいを たてに そろえて かき、', 'くり《上|あ》がりの 1を かく。'],
    raku: ['30 ＋ 20 ＝ 50、 6 ＋ 7 ＝ 13', '36 ＋ 27 ＝ 50 ＋ 13', '　　　 ＝ 63'],
    why: '36は 30と 6、 27は 20と 7。 10の まとまりと ばらに わけて たしても、 ぜんぶの かずは かわらない（きょうかしょ 1-7）。',
    caution: '9や 29を たす とき、 なん《十|じゅう》を たす とき、 38の ように なん《十|じゅう》に ちかい ときは、 ほかの わざが らく（わざ 1-07・1-08・1-10）。',
    // 2けた ＋ 2けた・3けた ＋ 3けた（どちらも なん十・なん百で ない）
    fits(q) {
      const n = adds(q);
      if (!n || n.length !== 2 || n.some(x => x % 10 === 0)) return false;
      return n.every(x => x >= 11 && x <= 99) || n.every(x => x >= 101 && x <= 999);
    },
    steps: {
      // 2けた ＋ 2けた（100より 小さい）。 ばらが 7・8・9 の かずは わざ 1-07・1-10 の ほうが らくなので 入れない（R1-18）
      s1(r) {
        const a = r.int(1, 7), b = r.int(1, 8 - a), x = r.int(1, 6), y = r.int(1, 6);
        return { q: `${a * 10 + x} ${P} ${b * 10 + y}`, a: String((a + b) * 10 + x + y), easy: `${(a + b) * 10} ${P} ${x + y}` };
      },
      // 100を こえる
      s2(r) {
        const a = r.int(2, 9), b = r.int(10 - a, 9), x = r.int(1, 6), y = r.int(1, 6);
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
      // 2けた ＋ 1けた（54 ＋ 4 を 94 と しない。 4は 《一|いち》の くらいどうし）・2けた ＋ なん十（わざ 1-08 の ほうが らく。 R1-15）
      // （45 ＋ 29、 38 ＋ 27 も わざ 1-07・1-10 の ほうが らくだが、 くらいごとにも たせるので、 わなには しない）
      trap(r) {
        const t = r.int(1, 6), u = r.int(1, 6), n = t * 10 + u;
        if (r.chance(0.5)) {
          const m = r.int(1, 9 - u);
          return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `（${m}は 《一|いち》の くらいと たす。 ${n + m}）` };
        }
        const m = r.int(1, 8 - t) * 10;
        if (Math.abs(n - m) <= 2) return null;   // わざ 1-05 に なる
        return { q: `${n} ${P} ${m}`, a: String(n + m), easy: `（${m}は なん《十|じゅう》。 わざ 1-08 で）`, also: ['1-08'] };
      },
    },
  });

  add({
    id: '1-10', part: 1, chap: '1-7', stars: 1,
    title: 'きりの よい かずに そろえて たす',
    mark: 'かたほうが **きりの よい かずに ちかい**。 38は 40の 2 てまえ。',
    futsu: ['38 ＋ 27 を ひっ《算|さん》で。', '8 ＋ 7 ＝ 15、 1 くり《上|あ》げて', '3 ＋ 2 ＋ 1 ＝ 6。 こたえ 65'],
    raku: ['38は あと 2で 40。', '27から 2を 38へ うつす。', '38 ＋ 27 ＝ 40 ＋ 25', '　　　 ＝ 65'],
    why: 'かたほうに 2を たし、 もう かたほうから 2を ひくと、 あわせた かずは かわらない（わざ 1-02 の さくらんぼと 《同|おな》じ）。',
    caution: 'どちらも なん《十|じゅう》に ちかく ない（34 ＋ 25 など）ときは、 くらいごとに たそう（わざ 1-09）。',
    // かたほうが なん十の 2・3 てまえ（38、 27、 198）で、 もう かたほうから その ぶん うつせる
    fits(q) {
      const n = adds(q);
      return !!n && n.length === 2 && n.some((x, i) => {
        const y = n[1 - i];
        const near = (x >= 11 && x <= 99 && (x % 10 === 7 || x % 10 === 8)) || (x >= 100 && (x % 100 === 97 || x % 100 === 98));
        return near && y >= 10 && y % 10 !== 0 && y % 10 >= 10 - x % 10;
      });
    },
    steps: {
      // ○8・○7 ＋ 2けた（《十|じゅう》の くらいが かたよらないように、 2つの 《十|じゅう》の くらいを さきに きめる。 R1-24）
      s1(r) {
        const ua = r.pick([7, 8]), k = 10 - ua, a = r.int(1, 7), b = r.int(1, 7), ub = r.int(k + 1, 6);
        if (a + b > 8) return null;
        const A = a * 10 + ua, B = b * 10 + ub;
        return { q: `${A} ${P} ${B}`, a: String(A + B), easy: `${A + k} ${P} ${B - k}` };
      },
      // うしろの かずを きりの よい かずに（入れかえ）
      s2(r) {
        const ua = r.pick([7, 8]), k = 10 - ua, a = r.int(1, 7), b = r.int(1, 7), ub = r.int(k + 1, 6);
        if (a + b > 8) return null;
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
        return { q: `${n} ${P} ${m}`, a: String(n + m), easy: '（くり《上|あ》がらない。 そのまま）' };
      },
    },
  });

  add({
    id: '1-11', part: 1, chap: '1-7', stars: 1,
    title: '100に なる くみ',
    mark: 'こたえが **100**。 《一|いち》の くらいは たして 10、 《十|じゅう》の くらいは たして 9。',
    futsu: ['37に いくつ たすと 100？', '37から 10ずつ、 1ずつ', 'かぞえて 100まで すすむ。'],
    raku: ['《一|いち》の くらい：7と 3で 10', '《十|じゅう》の くらい：3と 6で 9', '37 ＋ 63 ＝ 100'],
    why: '《一|いち》の くらいの 10が くり《上|あ》がって、 《十|じゅう》の くらいに 1 ふえる。 だから 《十|じゅう》の くらいは 9で 10に なり、 ぜんぶで 100（きょうかしょ 1-7）。',
    caution: '《一|いち》の くらいが 0の ときは、 《十|じゅう》の くらいを たして 10に する（40と 60）。',
    // ステップ3は ことばの もんだいが まざるので 1れつ（R1-23）
    cols: { s3: 1 },
    // こたえが 100（37 ＋ □ ＝ 100、 100 － 37、 おつり）・1000（310 ＋ □ ＝ 1000）
    fits(q) {
      const t = toT(q), s = subs(q), [a, T] = t || (s ? [s[1], s[0]] : [0, 0]);
      return (T === 100 && a >= 1 && a <= 99 && a % 10 !== 0) || (T === 1000 && a < 1000 && a % 10 === 0 && a % 100 !== 0);
    },
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

  add({
    id: '1-12', part: 1, chap: '1-7', stars: 1,
    title: 'ならべかえて きりの よい くみを つくる',
    mark: '**100に なる くみ**（なん《十|じゅう》でも よい）を さがす。 3つ いじょう たす ときに つかう。',
    futsu: ['25 ＋ 37 ＝ 62、', '62 ＋ 75 ＝ 137', '（くり《上|あ》がりが 3かい）'],
    raku: ['25と 75で 100。 さきに たす。', '25 ＋ 37 ＋ 75 ＝ 25 ＋ 75 ＋ 37', '　　　　　　 ＝ 100 ＋ 37', '　　　　　　 ＝ 137'],
    why: 'たす じゅんばんを かえても こたえは おなじ（わざ 1-06）。 100の まとまりを つくると、 あとは ならべて かくだけ。',
    caution: 'たして なん《十|じゅう》に なる くみが ない ときは、 まえから じゅんに たそう。',
    // 2けたの かず 3つの しきは 2れつに 入らないので 1れつ。 ページに 入るように 数を へらす
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },   // ステップ1は みじかい しきなので 2れつ（左ページに入るように）
    boxw: { s1: '12mm' },
    counts: { s1: 9, s2: 7, s3: 5, trap: 2 },
    // 2けたを 3つ いじょう たす。 一の くらいを たして 10に なる くみが ある
    fits(q) {
      const n = adds(q);
      return !!n && n.length >= 3 && n.every(x => x >= 10) && pair10(n, 1);
    },
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
        const m = (a + b + c) / 3;
        if ([a, b, c].every(x => Math.abs(x - m) <= 4)) return null;   // まんなかに そろえられる（わざ 1-25）
        return { q: `${a} ${P} ${b} ${P} ${c}`, a: String(a + b + c), easy: '（なん《十|じゅう》に なる くみが ない）' };
      },
    },
  });

  add({
    id: '1-13', part: 1, chap: '1-7', stars: 2,
    title: '99・98を たす',
    mark: 'たす かずが **99・98**。 100より 1・2 すくない。',
    futsu: ['46 ＋ 99 を ひっ《算|さん》で。', '6 ＋ 9 ＝ 15、 4 ＋ 9 ＋ 1 ＝ 14', 'くり《上|あ》がりが 2かい。'],
    raku: ['99は 100より 1 すくない。', '46 ＋ 99 ＝ 46 ＋ 100 － 1', '　　　 ＝ 146 － 1 ＝ 145'],
    why: '100を たすのは、 《百|ひゃく》の くらいを 1 ふやすだけ。 たしすぎた 1（98なら 2）を あとで ひく（わざ 1-07 と 《同|おな》じ）。',
    caution: '97より 《小|ちい》さいと、 あとで ひく かずが ふえて まちがえやすい。 くらいごとに たそう。',
    // ＋ 98・99（198・299 …）。 もう 1つは なん十で ない
    fits(q) {
      const n = adds(q);
      return !!n && n.length === 2 && n.some((x, i) => (x % 100 === 98 || x % 100 === 99) && n[1 - i] % 10 !== 0);
    },
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
      // 100から とおい 94・95・96（R1-13）。 100を たして ひく かずが おおく なるので、 くらいごとに たす
      trap(r) {
        const n = r.intNot(12, 89, v => v % 10 === 0 || v % 10 >= 7), m = r.pick([94, 95, 96]);
        const q = r.chance(0.5) ? `${n} ${P} ${m}` : `${m} ${P} ${n}`;
        return { q, a: String(n + m), easy: `（${m}は 100から ${100 - m} はなれて いる。 わざ 1-09 で）`, also: ['1-09'] };
      },
    },
  });

  // ---------------------------------------------------------------- 第29回 H-9 で 足した わざ（第1部。 番号は うしろに 足す）
  // 2つの かずの たし算・ひき算の [数, 記号]（式・「a － □ ＝ c」・ことばの もんだい）。 ちがえば null
  const two2 = q => {
    const e = expr(q);
    if (e) return e.n.length === 2 ? [e.n, e.o[0]] : null;
    const s = subs(q);
    if (s) return [s, S];
    const n = adds(q);
    return n && n.length === 2 ? [n, P] : null;
  };
  add({
    id: '1-83', part: 1, chap: '1-7', stars: 1,
    title: 'なん《十|じゅう》・なん《百|びゃく》の まとまりで たす・ひく',
    mark: 'どちらの かずも **なん《十|じゅう》**（なん《百|びゃく》）。 10の まとまりが いくつかで かんがえる。',
    futsu: ['60 ＋ 70 を、 60から', '70、 80、 90、 … と', '10ずつ 7かい かぞえる。'],
    raku: ['60は 10が 6こ、 70は 10が 7こ。', '6 ＋ 7 ＝ 13 で、 10が 13こ。', '60 ＋ 70 ＝ 130'],
    why: '10の まとまりの かずだけで けいさん すれば、 1けたの たし《算|ざん》・ひき《算|ざん》と おなじ（きょうかしょ 1-7）。 100の まとまりでも おなじ。',
    caution: '《一|いち》の くらいに 0で ない かずが ある ときは、 まとまりだけでは できない。 60 ＋ 7 は 67。',
    cols: { s3: 1 },
    // 2つの かずが どちらも なん十（なん百）。 ひき算は 大きい ほうから
    fits(q) {
      const t = two2(q);
      if (!t) return false;
      const [n, o] = t;
      if ((o !== P && o !== S) || (o === S && n[0] <= n[1])) return false;
      return n.every(x => x >= 10 && x % 10 === 0);
    },
    steps: {
      // なん十 ＋ なん十（10を こえる）
      s1(r) {
        const a = r.int(2, 9), b = r.int(2, 9);
        if (a + b < 10) return null;
        return { q: `${a * 10} ${P} ${b * 10}`, a: String((a + b) * 10), easy: `10が ${a} ${P} ${b} ＝ ${a + b}こ`, easyCheck: false };
      },
      // なん十の ひき算（130 － 70、 90 － 40）
      s2(r) {
        const b = r.int(2, 9), a = r.chance(0.6) ? r.int(Math.max(11, b + 1), b + 9) : r.int(b + 1, 9);
        return { q: `${a * 10} ${S} ${b * 10}`, a: String((a - b) * 10), easy: `10が ${a} ${S} ${b} ＝ ${a - b}こ`, easyCheck: false };
      },
      // なん百（300 ＋ 500、 1000 － 300）・ことばの もんだい
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(1, 8), b = r.int(1, 10 - a);
          return { q: `${a * 100} ${P} ${b * 100}`, a: String((a + b) * 100), easy: `100が ${a} ${P} ${b} ＝ ${a + b}こ`, easyCheck: false };
        }
        if (k === 1) {
          const a = r.int(5, 10), b = r.int(2, a - 1);
          return { q: `${a * 100} ${S} ${b * 100}`, a: String((a - b) * 100), easy: `100が ${a} ${S} ${b} ＝ ${a - b}こ`, easyCheck: false };
        }
        const a = r.int(3, 9), b = r.int(2, 9);
        if (r.chance(0.5)) {
          if (a + b < 10) return null;
          return { q: `${a * 10}《円|えん》の ノートと ${b * 10}《円|えん》の けしゴム。 あわせて □《円|えん》。`, a: String((a + b) * 10), easy: `10が ${a + b}こ`, easyCheck: false };
        }
        const A = r.int(5, 10), B = r.int(2, A - 1);
        return { q: `${A * 100}《円|えん》 もって いる。 ${B * 100}《円|えん》 つかうと、 のこりは □《円|えん》。`, a: String((A - B) * 100), easy: `100が ${A - B}こ`, easyCheck: false };
      },
      // なん十 ＋ 1けた（60 ＋ 7 を 130 と しない）・なん百 ＋ 1けた
      trap(r) {
        const b = r.int(2, 9);
        if (r.chance(0.6)) {
          const a = r.int(2, 9) * 10;
          return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `（${b}は ばら。 ${a}と ${b}で ${a + b}）` };
        }
        const a = r.int(1, 9) * 100;
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `（${b}は ばら。 ${a}と ${b}で ${a + b}）` };
      },
    },
  });

  add({
    id: '1-84', part: 1, chap: '1-4', stars: 1,
    title: '《大|おお》きい ほうから たす',
    mark: 'まえの かずが **《小|ちい》さい** たし《算|ざん》。 《入|い》れかえて、 《大|おお》きい ほうから かぞえる。',
    futsu: ['3 ＋ 48 を、 3から', '4、 5、 6、 … と', '48かい かぞえる。'],
    raku: ['《入|い》れかえて 48 ＋ 3。', '48から 49、 50、 51 と', '3つ かぞえる。', '3 ＋ 48 ＝ 48 ＋ 3 ＝ 51'],
    why: 'たし《算|ざん》は、 《入|い》れかえても こたえは おなじ（きょうかしょ 1-4）。 《大|おお》きい ほうから かぞえると、 かぞえる かずが すくない。',
    caution: 'ひき《算|ざん》は 《入|い》れかえられない。 48 － 3 を 3 － 48 には できない。',
    cols: { s3: 1 },
    // まえが 1けた、 うしろが 2けた いじょう（なん十は のぞく）の たし算
    fits(q) {
      const n = adds(q);
      return !!n && n.length === 2 && n[0] >= 1 && n[0] <= 9 && n[1] >= 10 && n[1] % 10 !== 0;
    },
    steps: {
      // 1けた ＋ 2けた
      s1(r) {
        const a = r.int(1, 4), b = two(r, 11, 89);
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${b} ${P} ${a}` };
      },
      // 1けた ＋ 3けた・くり上がる 1けた ＋ 2けた
      s2(r) {
        if (r.chance(0.5)) {
          const a = r.int(2, 5), b = r.intNot(101, 989, v => v % 10 === 0 || v % 10 + a >= 10);
          return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${b} ${P} ${a}` };
        }
        const a = r.int(5, 9), b = r.intNot(21, 89, v => v % 10 === 0 || v % 10 + a < 10);
        return { q: `${a} ${P} ${b}`, a: String(a + b), easy: `${b} ${P} ${a}` };
      },
      // ことばの もんだい
      s3(r) {
        const a = r.int(2, 9), b = two(r, 21, 89);
        const q = r.pick([
          `シールが ${a}まい。 ${b}まい もらうと □まい。`,
          `あかい ビーだまが ${a}こ、 あおい ビーだまが ${b}こ。 あわせて □こ。`,
          `カードが ${a}まい ある。 ${b}まい もらうと □まい。`,
        ]);
        return { q, a: String(a + b), easy: `${b} ${P} ${a}` };
      },
      // ひき算（入れかえられない）
      trap(r) {
        const b = r.int(2, 8), t = r.int(2, 9), u = r.int(b, 9), a = t * 10 + u;
        return { q: `${a} ${S} ${b}`, a: String(a - b), easy: '（ひき《算|ざん》は 《入|い》れかえられない。 そのまま ひく）' };
      },
    },
  });
})(globalThis.MONDAI);
