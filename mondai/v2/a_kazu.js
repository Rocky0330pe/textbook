/* 問題集 第2巻　第1部 数と正負の数・四則の意味（わざ 2-01〜2-13）　組 a
 * 書き方は v2/README.md（形は v1/README.md と同じ）。文は教科書 第2巻と同じ、漢字にルビ、分かち書きなし。式は $…$。
 * 負の数は かっこつき（$(-3)+5$）。単位は $5\,\mathrm{m}$。小数は 整数（10倍・100倍）で計算してから 文字にする（dec）。
 * 単位つきの答え・ことばの答え・不等号の答えは verify で確かめる（vUnit・vNum・chk）。
 * 第29回 H-1：わなは、同じ部の ほかの わざで 楽に ならない ものに する。どうしても 当たる ときは、
 *   楽な形に 行き先（「わざ 2-09 で」）を 書いて also に 入れる（dest）。入れかえただけの 問題には key を つける（H-6）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の文字
  // n を 10^k でわった数の文字（整数で持つので ずれない）。dec(57, 2) → '0.57'、dec(-35, 1) → '-3.5'、dec(57, -1) → '570'
  function dec(n, k) {
    k = k || 0;
    const sg = n < 0 ? '-' : '';
    let s = String(Math.abs(n));
    if (k <= 0) return sg + s + (Math.abs(n) ? '0'.repeat(-k) : '');
    s = s.padStart(k + 1, '0');
    const i = s.slice(0, s.length - k), f = s.slice(s.length - k).replace(/0+$/, '');
    return sg + i + (f ? '.' + f : '');
  }
  const pn = (n, k) => (n < 0 ? `(${dec(n, k)})` : dec(n, k));     // 負の数はかっこつき（式の中）
  const sgn = (n, k) => (n > 0 ? '+' : '') + dec(n, k);             // 変化量：正の数にも ＋ をつける
  const U = x => `\\,\\mathrm{${x}}`;                                 // 単位（式の中）
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  const chk = (ok, msg) => () => (ok ? true : msg);
  const mathOf = s => (String(s).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  const fun = n => `${n}${M.fun(n)}`;                               // 「分」の読みは M.fun（第30回 J-3）
  const byo = n => `${n}《秒|びょう》`;
  const nin = n => (n === 1 ? 'ひとり' : n === 2 ? 'ふたり' : `${n}《人|にん》`);   // 1人・2人は「ひとり」「ふたり」（J-3）
  const kai = n => `${n}《階|${n === 3 ? 'がい' : 'かい'}》`;
  const FUTO = '（$>$ か $<$）';                                    // 不等号の指示（第2部 2-28 とそろえる）
  const BOX = '\\quad□\\quad';
  const num = (x, y) => x - y;
  const lg = n => ({ 1: 0, 10: 1, 100: 2, 1000: 3, 10000: 4 })[n];   // 10 の何乗か

  // ---------------------------------------------------------------- 量（数値×単位）
  // 種類と、いちばん小さい単位でいくつ分か
  const KIND = { mm: ['長', 1], cm: ['長', 10], m: ['長', 1000], km: ['長', 1000000], mL: ['か', 1], dL: ['か', 100], L: ['か', 1000],
    g: ['重', 1], kg: ['重', 1000], s: ['時', 1] };
  const fac = (b, s) => KIND[b][1] / KIND[s][1];
  // 文の中の量：{ v: '0.4', u: 'm', sq: 2乗か }
  function qtys(s) {
    const re = /(-?\d+(?:\.\d+)?)\\,\\mathrm\{([a-zA-Z/]+)\}(\^\{2\})?/g;
    const out = []; let m;
    while ((m = re.exec(String(s)))) out.push({ v: m[1], u: m[2], sq: !!m[3] });
    return out;
  }
  const baseOf = (v, u) => M.F.mul(M.F.fromDec(v), M.F.make(KIND[u][1]));
  // 量の＋－の式（「2\,\mathrm{m}+40\,\mathrm{cm}」「12\,\mathrm{cm}\,6\,\mathrm{mm}」）の値。読めなければ null
  function sumQ(s) {
    let rest = String(s), sign = 1, total = M.F.make(0), any = false, kind = null;
    const re = /^(?:\s|\\,)*(?:([+-])|(\d+(?:\.\d+)?)\\,\\mathrm\{([a-zA-Z]+)\}(?!\^))/;
    while (rest.replace(/\s|\\,/g, '').length) {
      const m = re.exec(rest);
      if (!m) return null;
      if (m[1]) sign = m[1] === '+' ? 1 : -1;
      else {
        if (!KIND[m[3]] || (kind && KIND[m[3]][0] !== kind)) return null;
        kind = KIND[m[3]][0];
        const b = baseOf(m[2], m[3]);
        total = sign > 0 ? M.F.add(total, b) : M.F.sub(total, b);
        any = true;
      }
      rest = rest.slice(m[0].length);
    }
    return any ? total : null;
  }
  // 楽な形の式（＝で区切ったどれも）が、数なら want と同じか
  function easyNums(p, want) {
    for (const t of mathOf(M.plain(p.easy || ''))) for (const part of t.split('=')) {
      if (!part.trim()) continue;
      const v = M.evalMath(part);
      if (v != null && !near(v, want)) return `楽な形「${part}」の値 ${v} が ${want} とちがう`;
    }
    return true;
  }
  // 単位つきの答えの確かめ：答えの量が want（いちばん小さい単位でいくつ分か。整数か分数）と同じ。
  // □のあとの単位と答えの単位が同じ。問題の式（量の＋－）と楽な形の量・数も同じ
  function vUnit(p, want) {
    want = Array.isArray(want) ? want : M.F.make(want);
    return () => {
      let A = qtys(M.plain(p.a));
      const t = /□\\,\\mathrm\{([a-zA-Z]+)\}/.exec(M.plain(p.q));
      // 欄のあとに単位があるときは、答えは数だけ（J-5）。単位は □ のあとの単位
      if (!A.length && t) { const m = /^\$?(-?\d+(?:\.\d+)?)\$?$/.exec(M.plain(p.a).trim()); if (m) A = [{ v: m[1], u: t[1], sq: false }]; }
      if (A.length !== 1 || !KIND[A[0].u]) return `答え「${M.plain(p.a)}」が読めない`;
      if (t && t[1] !== A[0].u) return `答えの単位 ${A[0].u} が □ の単位 ${t[1]} とちがう`;
      if (!M.F.eq(baseOf(A[0].v, A[0].u), want)) return `答え ${A[0].v} ${A[0].u} が ${want.join('/')} とちがう`;
      const m0 = mathOf(M.plain(p.q))[0];
      if (m0 && m0.includes('=')) { const L = sumQ(m0.split('=')[0]); if (L && !M.F.eq(L, want)) return '問題の式の値が答えとちがう'; }
      for (const tx of mathOf(M.plain(p.easy || ''))) for (const part of tx.split('=')) {
        const s = sumQ(part);
        if (s && !M.F.eq(s, want)) return `楽な形「${part}」の量が答えとちがう`;
      }
      return easyNums(p, +A[0].v);
    };
  }
  // 数の答え（単位が m/s などでも）：答えの はじめの数と、楽な形の数が want と同じか。ok は作ったときの確かめ
  function vNum(p, want, ok) {
    return () => {
      if (ok !== undefined && ok !== true) return ok || '作り方の確かめが合わない';
      const a = M.plain(String(p.a)).match(/-?\d+(?:\.\d+)?/);
      if (!a || !near(+a[0], want)) return `答え ${M.plain(p.a)} が ${want} とちがう`;
      return easyNums(p, want);
    };
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // fits(q)：ほかのわざの問題でも、このわざが使えるか（q はルビをとった問題の文。式は $…$ のまま）
  const only = q => { const m = /^\$([^$]*)\$(?: ＝ □)?$/.exec(q); return m ? m[1] : null; };
  // 数と ＋ － × ÷ だけの式を、数の列と記号の列に。読めなければ null（先頭の － は はじめの数につける）
  function arith(s) {
    if (s == null) return null;
    s = s.replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\s+/g, '');
    const nums = [], ops = [];
    let i = 0, lead = 1;
    if (s[0] === '-') { lead = -1; i = 1; }
    for (;;) {
      const m = /^\((-?\d+(?:\.\d+)?)\)|^(\d+(?:\.\d+)?)/.exec(s.slice(i));
      if (!m) return null;
      const v = +(m[1] != null ? m[1] : m[2]);
      nums.push({ v: nums.length ? v : lead * v, paren: m[1] != null });
      i += m[0].length;
      if (i === s.length) break;
      if (!'+-×÷'.includes(s[i])) return null;
      ops.push(s[i]); i++;
    }
    return { nums, ops };
  }
  const isPM = e => !!e && e.ops.length > 0 && e.ops.every(o => o === '+' || o === '-');
  const isMD = e => !!e && e.ops.length > 0 && e.ops.every(o => o === '×' || o === '÷');
  const effs = e => e.nums.map((x, j) => (j && e.ops[j - 1] === '-' ? -x.v : x.v));   // ひき算を たし算に なおした 項
  const mixed = v => v.some(x => x > 0) && v.some(x => x < 0);
  const subNeg = e => e.ops.some((o, j) => o === '-' && e.nums[j + 1].v < 0);
  const isInt = x => Math.abs(x - Math.round(x)) < 1e-9;
  // 「□\,\mathrm{cm}」の単位（2乗なら sq）
  const target = q => { const m = /□\\,\\mathrm\{([a-zA-Z/]+)\}(\^\{2\})?/.exec(q); return m ? { u: m[1], sq: !!m[2] } : null; };
  const sameKind = L => L.length > 0 && L.every(x => KIND[x.u] && !x.sq && KIND[x.u][0] === KIND[L[0].u][0]);
  // 「1あたり」の量が書いてある（m/s・人/m²・「あたり 3人」）／きかれている（□ m/s・「あたり □」）
  const RATE = /\\mathrm\{[a-zA-Z]+\/[a-zA-Z]+\}/;
  const askRate = q => /□(?:\\,)?\\mathrm\{[a-zA-Z]+\/[a-zA-Z]+\}|□ ?人\/|あたり ?\$?□/.test(q);
  const givenRate = q => { const t = q.replace(/□(?:\\,)?\\mathrm\{[^}]*\}/g, ''); return /\d\\,\\mathrm\{[a-zA-Z]+\/[a-zA-Z]+\}|あたり ?\$?\d|あたり(?:ひとり|ふたり)/.test(t); };

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // わなの問題に、同じ部の ほかのわざが使えるときは、楽な形に「わざ 2-09 で」と書いて also に入れる（extra は手で足す行き先）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(2).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 1 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (!also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    return p;
  }

  // ---------------------------------------------------------------- 答えの単位（第30回 J-5）
  // 問題の文で欄のあとに単位がある（「$□\,\mathrm{cm}$」）ときは、答え a は数だけにする（アプリで単位が2回出ないように）。
  // 答えの文字は「数＋単位」で作ってよい。ここで、□ のあとの単位と同じ単位をとる（検算の vUnit は □ の単位で読む）
  function bare(p) {
    if (!p || typeof p.a !== 'string') return p;
    const t = /□\\,\\mathrm\{([a-zA-Z/]+)\}(\^\{2\})?/.exec(String(p.q));
    if (!t) return p;
    const tail = `\\,\\mathrm{${t[1]}}${t[2] || ''}$`;
    if (p.a.endsWith(tail)) p.a = p.a.slice(0, -tail.length) + '$';
    return p;
  }
  // わざを足す（ステップの問題の答えを bare にとおす）
  function add(d) {
    Object.keys(d.steps).forEach(s => { const f = d.steps[s]; d.steps[s] = r => bare(f(r)); });
    M.add(d);
  }

  // ================================================================ 2-01
  const P10 = { '×': [10, 100, 1000, 0.1, 0.01, 0.001], '÷': [10, 100, 1000] };
  add({
    id: '2-01', part: 1, chap: '2-1⑤', stars: 1,
    title: '×10・÷10は《小数点|しょう|すう|てん》を《動|うご》かす',
    mark: '**×10・×100・×1000**、**÷10・÷100・÷1000** の《計算|けい|さん》。《数字|すう|じ》のならびはそのままで、《小数点|しょう|すう|てん》だけが《動|うご》く。',
    futsu: ['$0.57\\times100$ を、ひっ《算|さん》で', '$57\\times100$ を《計算|けい|さん》してから、', '《小数点|しょう|すう|てん》の《場所|ば|しょ》を《考|かんが》える。'],
    raku: ['100《倍|ばい》は、10《倍|ばい》を2《回|かい》。', '《小数点|しょう|すう|てん》を《右|みぎ》へ2つ《動|うご》かす。', '$0.57\\times100=57$'],
    why: '10こ《集|あつ》まると1つ《上|うえ》の《位|くらい》になるので、10《倍|ばい》するとどの《数字|すう|じ》も《位|くらい》が1つ《上|あ》がる（《教科書|きょう|か|しょ》 2-1）。',
    caution: 'たし《算|ざん》・ひき《算|ざん》（$0.57+100$）では、《小数点|しょう|すう|てん》は《動|うご》かない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '22mm', trap: '18mm' },
    // ×10・×100・×1000・×0.1、÷10・÷100（つづけてもよい）／ □ をもとめる形
    fits(q) {
      if (/^\$[\d.]+\\times□=[\d.]+\$$|^\$[\d.]+\$ の \$\\frac\{1\}\{10+\}\$ は □$|を10+本つなぐと|が1000こで|^100こで/.test(q)) return true;
      const e = arith(only(q));
      if (!isMD(e) || e.nums.some(x => x.v <= 0)) return false;
      return e.nums.slice(1).every((x, j) => P10[e.ops[j]].includes(x.v));
    },
    steps: {
      // 小数（2〜3けたの数字のならび）× 10・100・1000、÷ 10・100
      s1(r) {
        const k = r.int(1, 2), m = r.intNot(11, 999, v => v % 10 === 0), e = r.int(1, 3), mul = r.chance(0.6);
        if (!mul && e === 3) return null;
        if (!mul && k + e > 4) return null;
        const res = mul ? dec(m, k - e) : dec(m, k + e);
        return { q: `$${dec(m, k)}\\${mul ? 'times' : 'div'}${10 ** e}$`, a: `$${res}$`,
          easy: `《小数点|しょう|すう|てん》を《${mul ? '右|みぎ' : '左|ひだり'}》へ${e}つ` };
      },
      // ×0.1・×0.01（÷10・÷100 と同じ）／ 0を書きたす／ □をもとめる
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const k = r.int(0, 1), m = r.intNot(12, 999, v => v % 10 === 0), e = r.int(1, 2);
          return { q: `$${dec(m, k)}\\times${dec(1, e)}$`, a: `$${dec(m, k + e)}$`,
            easy: `$\\times${dec(1, e)}$ は $\\div${10 ** e}$。《左|ひだり》へ${e}つ` };
        }
        if (t === 1) {   // 一の位や、あいた位に0を書く（0.4 × 100、35 ÷ 1000）
          if (r.chance(0.5)) {
            const d = r.int(1, 9), k = r.int(1, 2), e = r.int(k + 1, 3);
            return { q: `$${dec(d, k)}\\times${10 ** e}$`, a: `$${dec(d, k - e)}$`, easy: `《右|みぎ》へ${e}つ。あいた《位|くらい》に0` };
          }
          const m = r.intNot(2, 99, v => v % 10 === 0), e = r.int(2, 3);
          if (String(m).length >= e) return null;
          return { q: `$${m}\\div${10 ** e}$`, a: `$${dec(m, e)}$`, easy: `《左|ひだり》へ${e}つ。《一|いち》の《位|くらい》に0` };
        }
        const k = r.int(1, 2), m = r.intNot(11, 999, v => v % 10 === 0), e = r.int(1, 3);
        return { q: `$${dec(m, k)}\\times□=${dec(m, k - e)}$`, a: `$${10 ** e}$`, easy: `《小数点|しょう|すう|てん》が《右|みぎ》へ${e}つ`,
          verify: chk(near(+dec(m, k) * 10 ** e, +dec(m, k - e)), '□の数がちがう') };
      },
      // つづけてかける・わる／ 1/10 ／ ことばの問題（テープ・コイン・ビーズ）
      s3(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const k = r.int(1, 2), m = r.intNot(11, 999, v => v % 10 === 0);
          if (r.chance(0.5)) return { q: `$${dec(m, k)}\\times10\\times10$`, a: `$${dec(m, k - 2)}$`, easy: '$\\times100$ と《同|おな》じ。《右|みぎ》へ2つ' };
          const [x, y] = r.pick([[100, 1000], [10, 1000], [1000, 10], [1000, 100]]);
          const e = lg(x) - lg(y);
          if (k - e > 4) return null;
          return { q: `$${dec(m, k)}\\times${x}\\div${y}$`, a: `$${dec(m, k - e)}$`,
            easy: `${e > 0 ? `$\\times${10 ** e}$` : `$\\div${10 ** -e}$`} と《同|おな》じ。《${e > 0 ? '右|みぎ' : '左|ひだり'}》へ${Math.abs(e)}つ` };
        }
        if (t === 1) {
          const k = r.int(0, 1), m = r.intNot(12, 999, v => v % 10 === 0), e = r.int(1, 2);
          return { q: `$${dec(m, k)}$ の $\\frac{1}{${10 ** e}}$ は □`, a: `$${dec(m, k + e)}$`, easy: `$\\div${10 ** e}$。《左|ひだり》へ${e}つ`,
            verify: chk(near(+dec(m, k) / 10 ** e, +dec(m, k + e)), 'ちがう') };
        }
        if (t === 2) {   // 1本の長さ × 10本・100本
          const n = r.pick([10, 100]), m = r.intNot(105, 295, v => v % 5 !== 0 || v % 10 === 0);
          const p = { q: `1《本|ぽん》 $${dec(m, 2)}${U('m')}$ のテープを${n}《本|ぽん》つなぐと、$□${U('m')}$`, a: `$${dec(m * n, 2)}${U('m')}$`,
            easy: `$${dec(m, 2)}\\times${n}=${dec(m * n, 2)}$` };
          p.verify = vUnit(p, M.F.make(m * n * 10)); return p;
        }
        // 1こあたり → 1000こ ／ 100こで → 1こ
        if (r.chance(0.5)) {
          const m = r.intNot(15, 99, v => v % 5 !== 0 || v % 10 === 0);
          const p = { q: `1こ $${dec(m, 1)}${U('g')}$ のコインが1000こで、$□${U('g')}$`, a: `$${dec(m * 1000, 1)}${U('g')}$`,
            easy: `$${dec(m, 1)}\\times1000=${dec(m * 1000, 1)}$` };
          p.verify = vUnit(p, M.F.make(m * 100)); return p;
        }
        const w = r.intNot(120, 990, v => v % 10 === 0);
        const p = { q: `100こで $${w}${U('g')}$ のビーズ。1こは $□${U('g')}$`, a: `$${dec(w, 2)}${U('g')}$`, easy: `$${w}\\div100=${dec(w, 2)}$` };
        p.verify = vUnit(p, M.F.make(w, 100)); return p;
      },
      // わな：たし算・ひき算（小数点は動かない）
      trap(r) {
        const k = r.int(1, 2), m = r.intNot(11, 99, v => v % 10 === 0), e = r.int(1, 3);
        if (r.chance(0.6)) return { q: `$${dec(m, k)}+${10 ** e}$`, a: `$${dec(m + 10 ** (e + k), k)}$`, easy: '（たし《算|ざん》。《小数点|しょう|すう|てん》は《動|うご》かない）' };
        return { q: `$${10 ** e}-${dec(m, k)}$`, a: `$${dec(10 ** (e + k) - m, k)}$`, easy: '（ひき《算|ざん》。《小数点|しょう|すう|てん》は《動|うご》かない）' };
      },
    },
  });

  // ================================================================ 2-02
  const UNIT = k => (k === 1 ? '0.1' : '0.01');
  add({
    id: '2-02', part: 1, chap: '2-1④', stars: 1,
    title: '《小数|しょう|すう》は0.1・0.01のいくつ《分|ぶん》',
    mark: '《小数|しょう|すう》のたし《算|ざん》・ひき《算|ざん》。**0.1や0.01のいくつ《分|ぶん》**かで《考|かんが》えると、《整数|せい|すう》の《計算|けい|さん》になる。',
    futsu: ['$0.07+0.05$ を、《位|くらい》をそろえて', 'ひっ《算|さん》で《計算|けい|さん》する。'],
    raku: ['0.01が $7+5=12$ こ。', 'だから $0.07+0.05=0.12$'],
    why: '0.01が10こで0.1、100こで1（《教科書|きょう|か|しょ》 2-1）。いくつ《分|ぶん》かを《数|かぞ》えれば、《整数|せい|すう》のたし《算|ざん》・ひき《算|ざん》になる。',
    caution: '0.1と0.01がまじるときは、《小|ちい》さいほう（0.01）のいくつ《分|ぶん》にそろえる。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '18mm',
    // 小数どうしの たし算・ひき算（整数がまじらない）／「0.01を□こ集めた数」
    fits(q) {
      if (/0\.0?1を ?\d+ ?こ集めた|は0\.0?1を ?□ ?こ|^0\.1を\d+回たした/.test(q)) return true;
      const e = arith(only(q));
      return isPM(e) && e.nums.every(x => x.v > 0 && !isInt(x.v));
    },
    steps: {
      // 同じ位どうし（0.1 か 0.01 のいくつ分）
      s1(r) {
        const k = r.int(1, 2), x = r.intNot(2, 19, v => v % 10 === 0), y = r.intNot(2, 19, v => v % 10 === 0 || v === x);
        if (r.chance(0.55)) {
          if (x + y < 10 && r.chance(0.7)) return null;
          return { q: `$${dec(x, k)}+${dec(y, k)}$`, a: `$${dec(x + y, k)}$`, easy: `${UNIT(k)}が $${x}+${y}=${x + y}$ こ`, val: String(x + y), key: `+${k}:${[x, y].sort(num)}` };
        }
        const [a, b] = x > y ? [x, y] : [y, x];
        if (a - b < 2 || a < 10) return null;
        return { q: `$${dec(a, k)}-${dec(b, k)}$`, a: `$${dec(a - b, k)}$`, easy: `${UNIT(k)}が $${a}-${b}=${a - b}$ こ`, val: String(a - b) };
      },
      // 0.1 と 0.01 がまじる（0.01 のいくつ分にそろえる）
      s2(r) {
        const x = r.intNot(1, 19, v => v % 10 === 0) * 10, y = r.intNot(1, 99, v => v % 10 === 0);
        if (r.chance(0.5)) {
          const [s, t] = r.chance(0.5) ? [x, y] : [y, x];
          return { q: `$${dec(s, 2)}+${dec(t, 2)}$`, a: `$${dec(x + y, 2)}$`, easy: `0.01が $${s}+${t}=${x + y}$ こ`, val: String(x + y), key: `+:${[x, y].sort(num)}` };
        }
        if (x <= y) return null;
        return { q: `$${dec(x, 2)}-${dec(y, 2)}$`, a: `$${dec(x - y, 2)}$`, easy: `0.01が $${x}-${y}=${x - y}$ こ`, val: String(x - y) };
      },
      // 「0.01を□こ集めた数」・「0.1を□回たす」・3つの小数のたし算
      s3(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const n = r.intNot(101, 399, v => v % 10 === 0);
          return { q: `0.01を${n}こ《集|あつ》めた《数|かず》は □`, a: `$${dec(n, 2)}$`, easy: `1が${Math.floor(n / 100)}こ、0.1が${Math.floor(n / 10) % 10}こ、0.01が${n % 10}こ`,
            verify: chk(near(n * 0.01, +dec(n, 2)), 'ちがう') };
        }
        if (t === 1) {
          const k = r.int(1, 2), n = r.intNot(11, k === 1 ? 99 : 399, v => v % 10 === 0);
          return { q: `${dec(n, k)}は${UNIT(k)}を □ こ《集|あつ》めた《数|かず》`, a: `$${n}$`, easy: `${dec(n, k)}${k === 1 ? '×10' : '×100'}＝${n}`, easyCheck: false,
            verify: chk(near(+dec(n, k) * 10 ** k, n), 'ちがう') };
        }
        if (t === 2) {
          const n = r.intNot(11, 39, v => v % 10 === 0);
          return { q: `0.1を${n}《回|かい》たした《数|かず》は □`, a: `$${dec(n, 1)}$`, easy: `0.1が${n}こ。$${n}\\div10=${dec(n, 1)}$`,
            verify: chk(near(n / 10, +dec(n, 1)), 'ちがう') };
        }
        const v = [r.int(1, 9), r.int(1, 9), r.int(1, 9)];
        if (new Set(v).size < 3) return null;
        const s = v[0] + v[1] + v[2];
        return { q: `$${v.map(x => dec(x, 1)).join('+')}$`, a: `$${dec(s, 1)}$`, easy: `0.1が $${v.join('+')}=${s}$ こ`, val: String(s), key: `+3:${v.slice().sort(num)}` };
      },
      // わな：整数とのたし算（位をそろえるだけ）
      trap(r) {
        const k = r.int(1, 2), m = r.intNot(11, 99, v => v % 10 === 0), n = r.int(1, 9);
        const [s, t] = r.chance(0.5) ? [dec(m, k), String(n)] : [String(n), dec(m, k)];
        return { q: `$${s}+${t}$`, a: `$${dec(m + n * 10 ** k, k)}$`, easy: '（《整数|せい|すう》とは、《位|くらい》をそろえてたすだけ）', key: `+t:${m},${k},${n}` };
      },
    },
  });

  // ================================================================ 2-03
  // [大きい単位, 小さい単位]
  const CONV = [['m', 'cm'], ['cm', 'mm'], ['m', 'mm'], ['km', 'm'], ['L', 'mL'], ['L', 'dL'], ['dL', 'mL'], ['kg', 'g']];
  add({
    id: '2-03', part: 1, chap: '2-1②③④', stars: 1,
    title: '《単位|たん|い》をかえるときは「1あたり」をかける',
    mark: '**《大|おお》きい《単位|たん|い》**を《小|ちい》さい《単位|たん|い》にかえる。《大|おお》きい《単位|たん|い》1つが、《小|ちい》さい《単位|たん|い》でいくつかをかける。',
    futsu: ['$0.4\\,\\mathrm{m}$ は、$0.1\\,\\mathrm{m}$ が4こ。', '$0.1\\,\\mathrm{m}$ は $10\\,\\mathrm{cm}$ だから…と、', '《少|すこ》しずつ《考|かんが》える。'],
    raku: ['$1\\,\\mathrm{m}=100\\,\\mathrm{cm}$ なので、', '$0.4\\,\\mathrm{m}=0.4\\times100\\,\\mathrm{cm}$', '$=40\\,\\mathrm{cm}$'],
    why: '《量|りょう》＝《数値|すう|ち》×《単位|たん|い》。《単位|たん|い》を、《同|おな》じ《量|りょう》の《小|ちい》さい《単位|たん|い》におきかえる（《教科書|きょう|か|しょ》 2-1）。',
    caution: '《小|ちい》さい《単位|たん|い》から《大|おお》きい《単位|たん|い》へは、わる。$\\mathrm{m}^{2}$ のような2《乗|じょう》の《単位|たん|い》は、×100ではない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '18mm', trap: '20mm' },
    // 「□\,\mathrm{cm}」をきかれ、同じ種類の量に、それより大きい単位か、2つの単位がまじった量がある（×÷はない）
    fits(q) {
      const t = target(q);
      if (!t || t.sq || !KIND[t.u] || /\\times|\\div/.test(q)) return false;
      const L = qtys(q);
      if (!sameKind(L) || KIND[L[0].u][0] !== KIND[t.u][0]) return false;
      return L.some(x => KIND[x.u][1] > KIND[t.u][1]) || /\\mathrm\{[a-zA-Z]+\}\\,\d/.test(q);
    },
    steps: {
      // 大きい単位 → 小さい単位
      s1(r) {
        const [b, s] = r.pick(CONV), f = fac(b, s), k = r.int(1, 2), n = r.intNot(1, k === 1 ? 99 : 299, v => v % 10 === 0);
        if (f === 10 && k === 2) return null;
        const p = { q: `$${dec(n, k)}${U(b)}=□${U(s)}$`, a: `$${dec(n * f, k)}${U(s)}$`, easy: `$${dec(n, k)}\\times${f}=${dec(n * f, k)}$` };
        p.verify = vUnit(p, M.F.make(n * KIND[b][1], 10 ** k)); return p;
      },
      // 2つの単位がまじった量を、小さい単位に（1 m 45 cm → cm）。大きい単位へ（わる）は、わなと同じ形なので入れない（R1-3）
      s2(r) {
        const [b, s] = r.pick(CONV.filter(c => c[0] !== 'm' || c[1] !== 'mm')), f = fac(b, s);
        const a = r.int(1, f >= 100 ? 5 : 19), c = r.intNot(1, f - 1, v => f >= 100 && v % 10 === 0 && r.chance(0.7));
        const want = M.F.make(a * KIND[b][1] + c * KIND[s][1]);
        const q0 = `${a}${U(b)}\\,${c}${U(s)}`;
        const p = { q: `$${q0}=□${U(s)}$`, a: `$${a * f + c}${U(s)}$`, easy: `$${a}\\times${f}+${c}=${a * f + c}$` };
        p.verify = vUnit(p, want); return p;
      },
      // ものの長さ・かさ・重さ
      s3(r) {
        const t = r.int(0, 5);
        let p, want;
        if (t === 0) { const n = r.intNot(15, 95, v => v % 5 !== 0 || v % 10 === 0); p = { q: `《長|なが》さ $${dec(n, 2)}${U('m')}$ のテープは、$□${U('cm')}$`, a: `$${n}${U('cm')}$`, easy: `$${dec(n, 2)}\\times100=${n}$` }; want = n * 10; }
        else if (t === 1) { const n = r.int(11, 29); p = { q: `ペットボトルの《水|みず》 $${dec(n, 1)}${U('L')}$ は、$□${U('mL')}$`, a: `$${n * 100}${U('mL')}$`, easy: `$${dec(n, 1)}\\times1000=${n * 100}$` }; want = n * 100; }
        else if (t === 2) { const n = r.intNot(131, 169, v => v % 10 === 0); p = { q: `ソラの《身長|しん|ちょう》は $${dec(n, 2)}${U('m')}$。cm で《表|あらわ》すと $□${U('cm')}$`, a: `$${n}${U('cm')}$`, easy: `$${dec(n, 2)}\\times100=${n}$` }; want = n * 10; }
        else if (t === 3) { const n = r.intNot(12, 49, v => v % 10 === 0); p = { q: `《駅|えき》まで $${dec(n, 1)}${U('km')}$。m で《表|あらわ》すと $□${U('m')}$`, a: `$${n * 100}${U('m')}$`, easy: `$${dec(n, 1)}\\times1000=${n * 100}$` }; want = n * 100000; }
        else if (t === 4) { const n = r.intNot(11, 99, v => v % 10 === 0); p = { q: `お《米|こめ》 $${dec(n, 1)}${U('kg')}$ は、$□${U('g')}$`, a: `$${n * 100}${U('g')}$`, easy: `$${dec(n, 1)}\\times1000=${n * 100}$` }; want = n * 100; }
        else { const a = r.int(8, 17), c = r.int(1, 9); p = { q: `えんぴつの《長|なが》さ $${a}${U('cm')}\\,${c}${U('mm')}$ は、$□${U('mm')}$`, a: `$${a * 10 + c}${U('mm')}$`, easy: `$${a}\\times10+${c}=${a * 10 + c}$` }; want = a * 10 + c; }
        p.verify = vUnit(p, want); return p;
      },
      // わな：2乗の単位（×100 ではない。第5部 2-61）／小さい単位から大きい単位（わる）
      trap(r) {
        if (r.chance(0.5)) {
          const n = r.int(2, 9);
          return { q: `$${n}\\,\\mathrm{m}^{2}=□\\,\\mathrm{cm}^{2}$`, a: `$${n * 10000}\\,\\mathrm{cm}^{2}$`, easy: '（2《乗|じょう》の《単位|たん|い》。×100ではなく ×100×100。わざ 2-61）',
            verify: chk(n * 100 * 100 === n * 10000, 'ちがう') };
        }
        const [b, s] = r.pick([['kg', 'g'], ['L', 'mL'], ['m', 'cm']]), f = fac(b, s), n = r.intNot(120, 950, v => v % 10 !== 0 || v % 100 === 0);
        const e = lg(f);
        const p = dest({ q: `$${n}${U(s)}=□${U(b)}$`, a: `$${dec(n, e)}${U(b)}$` }, '2-03', `《小|ちい》さい《単位|たん|い》から《大|おお》きい《単位|たん|い》へは、わる。$${n}\\div${f}=${dec(n, e)}$`, ['2-01']);
        p.verify = vUnit(p, M.F.make(n * KIND[s][1])); return p;
      },
    },
  });

  // ================================================================ 2-04
  const WORD = { 長: ['《長|なが》い', '《短|みじか》い'], か: ['《多|おお》い', '《少|すく》ない'], 重: ['《重|おも》い', '《軽|かる》い'] };
  // 2つの量（不等号）の確かめ
  function vIneq(p) {
    return () => {
      const L = qtys(M.plain(p.q));
      if (L.length !== 2) return '量が2つない';
      const x = baseOf(L[0].v, L[0].u), y = baseOf(L[1].v, L[1].u), d = M.F.val(M.F.sub(x, y));
      const want = d > 0 ? '$>$' : d < 0 ? '$<$' : null;
      return p.a === want || `答え ${p.a} がちがう`;
    };
  }
  // いちばん大きい・小さい量の確かめ
  function vMax(p, big) {
    return () => {
      const L = qtys(M.plain(p.q)).map(x => [M.F.val(baseOf(x.v, x.u)), `$${x.v}${U(x.u)}$`]);
      const vs = L.map(x => x[0]);
      if (new Set(vs).size !== vs.length) return '同じ量がある';
      const w = (big ? Math.max : Math.min)(...vs);
      return L.find(x => x[0] === w)[1] === p.a || `答え ${p.a} がちがう`;
    };
  }
  add({
    id: '2-04', part: 1, chap: '2-1③', stars: 1,
    title: '《小|ちい》さい《単位|たん|い》にそろえてくらべる',
    mark: '《単位|たん|い》のちがう、**《同|おな》じ《種類|しゅ|るい》の《量|りょう》**をくらべる。《小|ちい》さい《単位|たん|い》にそろえると、《整数|せい|すう》でくらべられる。',
    futsu: ['m にそろえて、1.3、1.28、1.35 と', '《小数|しょう|すう》の《位|くらい》ごとに', 'くらべる。'],
    raku: ['cm にそろえる。', '130、128、135', '→ $1350\\,\\mathrm{mm}$ がいちばん《長|なが》い。'],
    why: '《同|おな》じ《単位|たん|い》なら、《数値|すう|ち》をくらべればよい。《小|ちい》さい《単位|たん|い》にすると、《小数|しょう|すう》が《消|き》える（《教科書|きょう|か|しょ》 2-1）。',
    caution: '《重|おも》さと《長|なが》さのように、《種類|しゅ|るい》がちがう《量|りょう》はくらべられない。',
    counts: { s1: 8, s2: 6, s3: 6, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '26mm', s3: '22mm', trap: '34mm' },
    // 同じ種類で単位のちがう量を2つ以上くらべる（不等号・いちばん・〜のは □）
    fits(q) {
      const L = qtys(q);
      if (L.length < 2 || !sameKind(L) || new Set(L.map(x => x.u)).size < 2) return false;
      if (/\\mathrm\{[^}]*\}\s*[+-]/.test(q)) return false;
      return /\$>\$ か \$<\$|いちばん|のは □|より \$□/.test(q);
    },
    steps: {
      // 2つの量に不等号
      s1(r) {
        const [b, s] = r.pick([['m', 'cm'], ['cm', 'mm'], ['kg', 'g'], ['L', 'mL'], ['L', 'dL'], ['km', 'm']]), f = fac(b, s);
        let X, bs;
        if (f === 10) { X = r.intNot(11, 199, v => v % 10 === 0); bs = dec(X, 1); }
        else if (f === 100) { X = r.intNot(101, 399, v => v % 100 === 0); bs = dec(X, 2); }
        else { X = r.intNot(101, 399, v => v % 100 === 0) * 10; bs = dec(X, 3); }
        const Y = X + r.intNot(-9, 9, v => v === 0) * (f === 1000 ? 10 : 1);
        if (Y <= 0) return null;
        const A = `${bs}${U(b)}`, B = `${Y}${U(s)}`, swap = r.chance(0.5);
        const [L, R, l, rr] = swap ? [B, A, Y, X] : [A, B, X, Y];
        const p = { q: `$${L}${BOX}${R}$${FUTO}`, a: l > rr ? '$>$' : '$<$', easy: `$${l}${U(s)}${l > rr ? '>' : '<'}${rr}${U(s)}$`, key: `${b}${[X, Y].sort(num)}` };
        p.verify = vIneq(p); return p;
      },
      // 3つの量で、いちばん長い・短い（多い・少ない）
      s2(r) {
        // V は いちばん小さい単位（mm・mL）でいくつ分か。長さは 10 mm、かさは 100 mL きざみ（cm・dL で整数になる）
        const vol = r.chance(0.4), us = vol ? ['L', 'dL', 'mL'] : ['m', 'cm', 'mm'];
        const step = vol ? 100 : 10, base0 = r.int(11, 29) * 100;
        const ks = r.shuffle([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]).slice(0, 2).concat([0]);
        const vals = r.shuffle(ks.map(k => base0 + k * step));
        const items = vals.map((V, i) => ({ V, t: `$${dec(V, lg(KIND[us[i]][1]))}${U(us[i])}$` }));
        const big = r.chance(0.5);
        const w = (big ? Math.max : Math.min)(...vals), ans = items.find(x => x.V === w).t;
        const word = WORD[vol ? 'か' : '長'][big ? 0 : 1];
        const mid = vol ? 'dL' : 'cm';
        const p = { q: `${items.map(x => x.t).join('、')}で、いちばん${word}のは □`, a: ans,
          easy: `${mid} で ${vals.map(V => (vol ? V / 100 : V / 10)).join('、')}`, key: `3${vol}${vals.slice().sort(num)}${big}` };
        p.verify = vMax(p, big); return p;
      },
      // ことばの問題（身長・水とう・くだもの・ひもの差）
      s3(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const X = r.intNot(131, 169, v => v % 10 === 0), Y = X + r.intNot(-6, 6, v => v === 0);
          const p = { q: `ソラの《身長|しん|ちょう》は $${dec(X, 2)}${U('m')}$、ミナは $${Y}${U('cm')}$。《背|せ》が《高|たか》いのは □`, a: X > Y ? 'ソラ' : 'ミナ', easy: `cm で ${X} と ${Y}` };
          p.verify = chk((X > Y) === (p.a === 'ソラ'), 'ちがう'); return p;
        }
        if (t === 1) {
          const X = r.int(5, 15) * 100, Y = X + r.intNot(-9, 9, v => v === 0) * 10;
          const p = { q: `《水|すい》とうAに $${dec(X / 100, 1)}${U('L')}$、Bに $${Y}${U('mL')}$ 《入|はい》っている。《多|おお》いのは □`, a: X > Y ? 'A' : 'B', easy: `mL で ${X} と ${Y}` };
          p.verify = chk((X > Y) === (p.a === 'A'), 'ちがう'); return p;
        }
        if (t === 2) {
          const X = r.intNot(21, 49, v => v % 10 === 0) * 10, Y = X + r.intNot(-9, 9, v => v === 0) * 5;
          const p = { q: `りんごは $${dec(X, 3)}${U('kg')}$、なしは $${Y}${U('g')}$。《重|おも》いのは □`, a: X > Y ? 'りんご' : 'なし', easy: `g で ${X} と ${Y}` };
          p.verify = chk((X > Y) === (p.a === 'りんご'), 'ちがう'); return p;
        }
        const X = r.intNot(11, 39, v => v % 10 === 0) * 10, d = r.int(2, 9), Y = X - d;
        const p = { q: `$${dec(X, 2)}${U('m')}$ のひもは、$${Y}${U('cm')}$ のひもより $□${U('cm')}$ 《長|なが》い`, a: `$${d}${U('cm')}$`, easy: `$${X}-${Y}=${d}$` };
        p.verify = vUnit(p, d * 10); return p;
      },
      // わな：種類のちがう量（くらべられない）
      trap(r) {
        const [u1, u2, why] = r.pick([['kg', 'm', '《重|おも》さと《長|なが》さ'], ['L', 'g', 'かさと《重|おも》さ'], ['m', 's', '《長|なが》さと《時間|じ|かん》'], ['kg', 'L', '《重|おも》さとかさ']]);
        const a = r.int(2, 9), b = r.int(12, 95) * (u2 === 's' ? 1 : 100);
        const [x, y] = r.chance(0.5) ? [`${a}${U(u1)}`, `${b}${U(u2)}`] : [`${b}${U(u2)}`, `${a}${U(u1)}`];
        return { q: `$${x}$ と $${y}$ で、《大|おお》きいのは □`, a: 'くらべられない', easy: `（${why}。《種類|しゅ|るい》がちがう）`,
          verify: chk(KIND[u1][0] !== KIND[u2][0], '同じ種類') };
      },
    },
  });

  // ================================================================ 2-05
  // 問題の式の中の数（単位のない問題）
  const numsOf = q => mathOf(M.plain(q)).join(' ').replace(/\\[a-zA-Z]+/g, ' ').match(/-?\d+(?:\.\d+)?/g).map(Number);
  add({
    id: '2-05', part: 1, chap: '2-2②③', stars: 1,
    title: '《負|ふ》の《数|かず》は0から《遠|とお》いほど《小|ちい》さい',
    mark: '**《負|ふ》の《数|かず》どうし**の《大|おお》きさをくらべる。0から《遠|とお》いほうが《小|ちい》さい。',
    futsu: ['《数直線|すう|ちょく|せん》をかいて、', '$-5$ と $-2$ の《場所|ば|しょ》に《点|てん》をうち、', '《左|ひだり》にあるほうをさがす。'],
    raku: ['0から《遠|とお》いのは $-5$。', '《遠|とお》いほうが《小|ちい》さいので', '$-5<-2$'],
    why: '《数直線|すう|ちょく|せん》では、《左|ひだり》へ《行|い》くほど《小|ちい》さい。《負|ふ》の《数|かず》は0の《左|ひだり》にならぶ（《教科書|きょう|か|しょ》 2-2）。',
    caution: '《正|せい》の《数|かず》と《負|ふ》の《数|かず》なら、《正|せい》の《数|かず》がいつも《大|おお》きい（$-5<2$）。',
    counts: { s1: 8, s2: 6, s3: 6, trap: 2 },
    cols: 1,
    boxw: { s1: '12mm', s2: '14mm', s3: '14mm', trap: '12mm' },
    // 単位のない数を2つ以上くらべる（不等号・いちばん）。負の数が2つ以上
    fits(q) {
      if (/寒いのは|低いのは地下|(?:以上|より大きく) \$-?\d+\$ (?:以下|未満|より小さい)/.test(q)) return true;
      if (/\\mathrm/.test(q) || !/\$>\$ か \$<\$|いちばん/.test(q)) return false;
      const n = mathOf(q).join(' ').match(/-\d+(?:\.\d+)?/g) || [];
      return n.length >= 2;
    },
    steps: {
      // 負の数どうしに不等号
      s1(r) {
        const k = r.chance(0.3) ? 1 : 0;
        const x = -r.int(1, k ? 99 : 15), y = -r.intNot(1, k ? 99 : 15, v => v === -x);
        if (k && x % 10 === 0 && y % 10 === 0) return null;
        const far = Math.min(x, y);
        const p = { q: `$${dec(x, k)}${BOX}{${dec(y, k)}}$${FUTO}`, a: x < y ? '$<$' : '$>$', easy: `0から《遠|とお》いのは $${dec(far, k)}$`, key: `<${k}:${[x, y].sort(num)}` };
        p.verify = () => { const [s, t] = numsOf(p.q); return p.a === (s < t ? '$<$' : '$>$') || 'ちがう'; };
        return p;
      },
      // 3つの数で、いちばん小さい・大きい（小数・0がまじる）
      s2(r) {
        const v = [-r.int(10, 90), -r.int(10, 90), r.chance(0.3) ? 0 : -r.int(10, 90)].map(x => (r.chance(0.5) ? Math.round(x / 10) * 10 : x));
        if (new Set(v).size < 3 || v.every(x => x % 10 === 0) && r.chance(0.5)) return null;
        const small = r.chance(0.6), w = small ? Math.min(...v) : Math.max(...v);
        const p = { q: `$${dec(v[0], 1)}$、$${dec(v[1], 1)}$、$${dec(v[2], 1)}$ で、いちばん${small ? '《小|ちい》さい' : '《大|おお》きい'}のは □`, a: `$${dec(w, 1)}$`,
          easy: small ? `0から《遠|とお》いのは $${dec(w, 1)}$` : `0に《近|ちか》いのは $${dec(w, 1)}$`, key: `m${small}${v.slice().sort(num)}` };
        p.verify = () => { const n = numsOf(p.q); return near((small ? Math.min : Math.max)(...n), w / 10) || 'ちがう'; };
        return p;
      },
      // 気温・以上と未満・地下の階
      s3(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const a = -r.int(1, 12), b = -r.intNot(1, 12, v => v === -a), [w1, w2] = r.pick([['《朝|あさ》', '《夜|よる》'], ['きのう', 'きょう'], ['《東|とう》《京|きょう》', 'ソラの《町|まち》']]);
          const p = { q: `${w1}の《気温|き|おん》は $${a}$ ℃、${w2}は $${b}$ ℃。《寒|さむ》いのは □`, a: a < b ? w1 : w2, easy: `0から《遠|とお》いのは $${Math.min(a, b)}$` };
          p.verify = chk((a < b) === (p.a === w1), 'ちがう'); return p;
        }
        if (t === 1) {
          const lo = -r.int(1, 6), hi = r.int(0, 4), i1 = r.chance(0.6), i2 = r.chance(0.5);
          const n = (hi - lo + 1) - (i1 ? 0 : 1) - (i2 ? 0 : 1);
          const list = []; for (let x = i1 ? lo : lo + 1; x <= (i2 ? hi : hi - 1); x++) list.push(x);
          return { q: `$${lo}$ ${i1 ? '《以上|い|じょう》' : 'より《大|おお》きく'} $${hi}$ ${i2 ? '《以下|い|か》' : '《未満|み|まん》'}の《整数|せい|すう》は □ こ`, a: `$${n}$`,
            easy: `$${list.join('$、$')}$`, easyCheck: false, verify: chk(list.length === n, 'ちがう') };
        }
        if (t === 2) {
          const lo = -r.int(3, 9), hi = r.int(lo + 3, 2);
          return { q: `$${lo}$ より《大|おお》きく $${hi}$ より《小|ちい》さい《整数|せい|すう》で、いちばん《小|ちい》さいのは □`, a: `$${lo + 1}$`,
            easy: `$${lo}$ はふくまない`, easyCheck: false, verify: chk(lo + 1 < hi, 'ちがう') };
        }
        const h = r.int(3, 5), n1 = r.int(1, 4), n2 = r.intNot(1, 4, v => v === n1);
        return { q: `《地下|ち|か》${kai(n1)}の《床|ゆか》は $${-h * n1}${U('m')}$、《地下|ち|か》${kai(n2)}の《床|ゆか》は $${-h * n2}${U('m')}$。《低|ひく》いのは《地下|ち|か》□《階|かい》`,
          a: `$${Math.max(n1, n2)}$`, easy: `0から《遠|とお》いのは $${-h * Math.max(n1, n2)}$`, easyCheck: false, verify: chk(-h * Math.max(n1, n2) === Math.min(-h * n1, -h * n2), 'ちがう') };
      },
      // わな：正の数と負の数（正の数のほうが0から遠くても、正の数が大きい）
      trap(r) {
        const n = -r.int(1, 6), pz = r.int(-n + 1, 15);
        const [x, y] = r.chance(0.5) ? [n, pz] : [pz, n];
        const p = { q: `$${x}${BOX}{${y}}$${FUTO}`, a: x < y ? '$<$' : '$>$', easy: '（《正|せい》の《数|かず》のほうが《大|おお》きい。0からの《遠|とお》さではない）', key: `<t${[x, y].sort(num)}` };
        p.verify = () => { const [s, t] = numsOf(p.q); return p.a === (s < t ? '$<$' : '$>$') || 'ちがう'; };
        return p;
      },
    },
  });

  // ================================================================ 2-06
  // 符号のちがう2つの数の和の楽な形：$-(8-5)$ か $8-5$（k は小数のけた）
  function diffForm(x, y, k) {
    const s = x + y, big = Math.max(Math.abs(x), Math.abs(y)), small = Math.min(Math.abs(x), Math.abs(y));
    return s < 0 ? `$-(${dec(big, k)}-${dec(small, k)})=${dec(s, k)}$` : `$${dec(big, k)}-${dec(small, k)}=${dec(s, k)}$`;
  }
  add({
    id: '2-06', part: 1, chap: '2-2⑤', stars: 1,
    title: '《符号|ふ|ごう》のちがう《数|かず》のたし《算|ざん》は、《差|さ》に、0から《遠|とお》いほうの《符号|ふ|ごう》',
    mark: '**《正|せい》の《数|かず》と《負|ふ》の《数|かず》**のたし《算|ざん》。0からの《遠|とお》さの《差|さ》をとり、《遠|とお》いほうの《符号|ふ|ごう》をつける。',
    futsu: ['《数直線|すう|ちょく|せん》で、$-8$ から', '《右|みぎ》へ1つずつ、5《回|かい》《進|すす》む。'],
    raku: ['$8-5=3$', '8のほうが《遠|とお》くて－だから', '$(-8)+5=-3$'],
    why: '$-8$ から《右|みぎ》へ8《進|すす》めば0。5しか《進|すす》まないので、0の《手前|て|まえ》3で《止|と》まる（《教科書|きょう|か|しょ》 2-2）。',
    caution: '《同|おな》じ《符号|ふ|ごう》どうし（$(-3)+(-4)$）は、たして《符号|ふ|ごう》はそのまま（$-7$）。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '14mm' },
    // ＋－だけの式で、（ひき算をたし算になおした）項に正と負がまじる。負の数をひく形はのぞく（2-07）。
    // 2つだけのときは、符号のちがう数のたし算か、小さい数から大きい数をひく形（大きい数から ひくだけの $1.6-0.8$ はのぞく）
    // ことばの問題：気温が上がる・もらって使う・東へ行って西へ（2つの動き）
    fits(q) {
      if (/までに \$\d+\$ ℃上がった|もらって、\d+円使った|東へ \$\d+\\,\\mathrm\{m\}\$ 歩いてから、西へ/.test(q)) return true;
      const e = arith(only(q));
      if (!isPM(e) || subNeg(e) || !mixed(effs(e))) return false;
      if (e.nums.length > 2) return true;
      const [x, y] = e.nums;
      return e.ops[0] === '+' || (x.v >= 0 && x.v < y.v);
    },
    steps: {
      // (−8)+5、7+(−4)
      s1(r) {
        const a = r.int(1, 15), b = r.intNot(1, 15, v => v === a), x = -a, y = b;
        const [s, t] = r.chance(0.5) ? [x, y] : [y, x];
        return { q: `$${pn(s)}+${pn(t)}$`, a: `$${s + t}$`, easy: diffForm(s, t, 0), key: `+${[s, t].sort(num)}` };
      },
      // −6+9（かっこのない形）・大きい数・小数・正の数が先
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const a = r.int(2, 20), b = r.intNot(2, 20, v => v === a);
          return { q: `$-${a}+${b}$`, a: `$${b - a}$`, easy: diffForm(-a, b, 0) };
        }
        if (t === 1) {
          const a = r.int(11, 60), b = r.intNot(11, 60, v => v === a), [s, u] = r.chance(0.5) ? [-a, b] : [b, -a];
          return { q: `$${pn(s)}+${pn(u)}$`, a: `$${s + u}$`, easy: diffForm(s, u, 0), key: `+${[s, u].sort(num)}` };
        }
        const a = r.intNot(5, 95, v => v % 10 === 0), b = r.int(1, 9) * 10;
        if (a === b) return null;
        const [s, u] = r.chance(0.5) ? [-a, b] : [b, -a];
        return { q: `$${pn(s, 1)}+${pn(u, 1)}$`, a: `$${dec(s + u, 1)}$`, easy: diffForm(s, u, 1), key: `+${[s, u].sort(num)}` };
      },
      // 気温・お金・東西に歩く
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const a = r.int(2, 9), b = r.intNot(2, 12, v => v === a);
          return { q: `《朝|あさ》の《気温|き|おん》は $-${a}$ ℃。《昼|ひる》までに $${b}$ ℃《上|あ》がった。《昼|ひる》の《気温|き|おん》は □ ℃`, a: `$${b - a}$`,
            easy: `$(-${a})+${b}=${b - a}$`, verify: chk(b - a === -a + b, 'ちがう') };
        }
        if (t === 1) {
          const a = r.int(2, 9) * 100, b = r.intNot(2, 9, v => v * 100 === a) * 100;
          return { q: `${a}《円|えん》もらって、${b}《円|えん》《使|つか》った。お《金|かね》の《変化量|へん|か|りょう》は □ 《円|えん》`, a: `$${a - b}$`,
            easy: `$${a}+(-${b})=${a - b}$`, verify: chk(a + (-b) === a - b, 'ちがう') };
        }
        const a = r.int(2, 12), b = r.intNot(2, 12, v => v === a);
        const p = { q: `《東|ひがし》を＋とする。《東|ひがし》へ $${a}${U('m')}$ 《歩|ある》いてから、《西|にし》へ $${b}${U('m')}$ 《歩|ある》いた。はじめの《場所|ば|しょ》から $□${U('m')}$ の《所|ところ》`,
          a: `$${a - b}${U('m')}$`, easy: `$${a}+(-${b})=${a - b}$` };
        p.verify = vNum(p, a - b); return p;
      },
      // わな：同じ符号どうし（差ではなく和）
      trap(r) {
        const k = r.chance(0.25) ? 1 : 0, a = r.int(1, k ? 49 : 12), b = r.int(1, k ? 49 : 12);
        if (k && (a % 10 === 0 || b % 10 === 0)) return null;
        return { q: `$(-${dec(a, k)})+(-${dec(b, k)})$`, a: `$${dec(-a - b, k)}$`, easy: '（《同|おな》じ《符号|ふ|ごう》。たして《符号|ふ|ごう》はそのまま）', key: `++${k}${[a, b].sort(num)}` };
      },
    },
  });

  // ================================================================ 2-07
  add({
    id: '2-07', part: 1, chap: '2-2⑥', stars: 1,
    title: 'ひき《算|ざん》は《反対|はん|たい》の《数|かず》をたす',
    mark: '**《負|ふ》の《数|かず》をひく**、《小|ちい》さい《数|かず》から《大|おお》きい《数|かず》をひく。ひく《数|かず》の《符号|ふ|ごう》をかえて、たし《算|ざん》にする。',
    futsu: ['$2-(-3)$ を、《数直線|すう|ちょく|せん》の', '「《左|ひだり》へ $-3$ 《進|すす》む」と《考|かんが》える。'],
    raku: ['$-3$ をひく＝$+3$ をたす。', '$2-(-3)=2+3=5$'],
    why: 'ひくことは、《反対|はん|たい》の《数|かず》をたすことと《同|おな》じ（《教科書|きょう|か|しょ》 2-2）。たし《算|ざん》にすれば、《右|みぎ》と《左|ひだり》のどちらへ《進|すす》むかがすぐわかる。',
    caution: 'かけ《算|ざん》（$(-3)\\times(-2)$）では、《反対|はん|たい》の《数|かず》にしない。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '14mm',
    // 負の数をひく／負の数から ひく／小さい数から大きい数をひく（2つだけ）
    fits(q) {
      if (/^\$-\d+\$ より \$\d+\$ 小さい数は □$|^\$\d+\$ は \$-\d+\$ より □ 大きい$|^\$□-\(-\d+\)=-?\d+\$$/.test(q)) return true;
      const e = arith(only(q));
      if (!isPM(e)) return false;
      if (subNeg(e)) return true;
      return e.nums.length === 2 && e.ops[0] === '-' && (e.nums[0].v < 0 || e.nums[0].v < e.nums[1].v);
    },
    steps: {
      // a − (−b)、(−a) − b、(−a) − (−b)
      s1(r) {
        const t = r.int(0, 2), a = r.int(1, 9), b = r.int(1, 9);
        const [x, y] = t === 0 ? [r.chance(0.5) ? a : 0, -b] : t === 1 ? [-a, b] : [-a, -b];
        if (x === 0 && t === 0) return null;
        return { q: `$${pn(x)}-${pn(y)}$`, a: `$${x - y}$`, easy: `$${pn(x)}+${pn(-y)}=${x - y}$` };
      },
      // 小さい数 − 大きい数、0 − (−b)、小数、2けたの数
      s2(r) {
        const t = r.pick([0, 0, 1, 2, 2, 3, 3]);
        if (t === 0) { const a = r.int(1, 9), b = r.int(a + 2, a + 12); return { q: `$${a}-${b}$`, a: `$${a - b}$`, easy: `$${a}+(-${b})=${a - b}$` }; }
        if (t === 1) { const b = r.int(1, 12); return { q: `$0-(-${b})$`, a: `$${b}$`, easy: `$0+${b}=${b}$` }; }
        if (t === 2) {
          const a = r.intNot(5, 49, v => v % 10 === 0), b = r.int(1, 5) * 10, [x, y] = r.chance(0.5) ? [a, -b] : [-a, b];
          return { q: `$${pn(x, 1)}-${pn(y, 1)}$`, a: `$${dec(x - y, 1)}$`, easy: `$${pn(x, 1)}+${pn(-y, 1)}=${dec(x - y, 1)}$` };
        }
        const a = r.int(11, 60), b = r.intNot(11, 60, v => v === a);
        return { q: `$(-${a})-(-${b})$`, a: `$${b - a}$`, easy: `$(-${a})+${b}=${b - a}$` };
      },
      // 「〜より □ 小さい数」・□をもとめる・「〜より いくつ大きいか」
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const a = r.int(1, 9), b = r.int(2, 9);
          return { q: `$-${a}$ より $${b}$ 《小|ちい》さい《数|かず》は □`, a: `$${-a - b}$`, easy: `$(-${a})-${b}=(-${a})+(-${b})=${-a - b}$`, verify: chk(-a - b < -a, 'ちがう') };
        }
        if (t === 1) {
          const b = r.int(1, 9), c = r.int(b + 1, b + 9);
          return { q: `$□-(-${b})=${c}$`, a: `$${c - b}$`, easy: `$□+${b}=${c}$ なので $${c}-${b}=${c - b}$`, easyCheck: false,
            verify: chk((c - b) - (-b) === c, 'ちがう') };
        }
        const a = r.int(1, 9), b = r.int(1, 12);
        return { q: `$${b}$ は $-${a}$ より □ 《大|おお》きい`, a: `$${a + b}$`, easy: `$${b}-(-${a})=${b}+${a}=${a + b}$`, verify: chk(-a + (a + b) === b, 'ちがう') };
      },
      // わな：かけ算・わり算（反対の数にしない。2-09 で）
      trap(r) {
        if (r.chance(0.6)) {
          const a = r.int(2, 9), b = r.int(2, 9);
          return dest({ q: `$(-${a})\\times(-${b})$`, a: `$${a * b}$`, key: `x${[a, b].sort(num)}` }, '2-07', 'かけ《算|ざん》。《反対|はん|たい》の《数|かず》にしない');
        }
        const a = r.int(2, 9), b = r.int(2, 9);
        return dest({ q: `$(-${a * b})\\div(-${a})$`, a: `$${b}$` }, '2-07', 'わり《算|ざん》。《反対|はん|たい》の《数|かず》にしない');
      },
    },
  });

  // ================================================================ 2-08
  // 正の項・負の項に分けた楽な形：$(5+4)-(3+7)=9-10=-1$
  function group(v) {
    const P = v.filter(x => x > 0), N = v.filter(x => x < 0).map(x => -x);
    const sp = P.reduce((a, b) => a + b, 0), sn = N.reduce((a, b) => a + b, 0);
    const w = L => (L.length > 1 ? `(${L.join('+')})` : String(L[0]));
    return `$${w(P)}-${w(N)}$ $=${sp}-${sn}=${sp - sn}$`;   // 式を2つに分けて、こたえのページで改行できるように
  }
  const termStr = v => v.map((x, i) => (x < 0 ? `-${-x}` : (i ? `+${x}` : `${x}`))).join('');
  add({
    id: '2-08', part: 1, chap: '2-2⑤⑥', stars: 2,
    title: '＋と－を《分|わ》けて《集|あつ》める',
    mark: '3つ《以上|い|じょう》の《数|かず》の**たし《算|ざん》・ひき《算|ざん》**。＋の《数|かず》と－の《数|かず》を、べつべつに《集|あつ》める。',
    futsu: ['$-3+5-7+4$ を、《左|ひだり》から', '$2$、$-5$、$-1$ と', '1つずつ《計算|けい|さん》する。'],
    raku: ['＋は $5+4=9$、－は $3+7=10$', '$9-10=-1$'],
    why: 'たし《算|ざん》は、たす《順番|じゅん|ばん》をかえても《答|こた》えは《同|おな》じ。＋どうし・－どうしは、まとめて《計算|けい|さん》できる（《教科書|きょう|か|しょ》 2-2）。',
    caution: '×・÷がまざっているときは、×・÷を《先|さき》に《計算|けい|さん》する。',
    counts: { s1: 8, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '14mm',
    // ＋－だけで、数が3つ以上、正と負がまじる／お金の出入り・3つ以上の動き（ことばの問題）
    fits(q) {
      if (/出入り：|階動いた|(?:[東西]へ \$\d+\\,\\mathrm\{m\}\$、){2}/.test(q)) return true;
      const e = arith(only(q));
      return isPM(e) && e.nums.length >= 3 && mixed(effs(e));
    },
    steps: {
      // −3+5−7+4（項の形）
      s1(r) {
        const n = r.chance(0.25) ? 5 : 4, v = Array.from({ length: n }, () => r.int(1, n === 5 ? 9 : 12) * (r.chance(0.5) ? 1 : -1));
        if (!mixed(v) || new Set(v.map(Math.abs)).size < n) return null;
        const s = v.reduce((a, b) => a + b, 0);
        return { q: `$${termStr(v)}$`, a: `$${s}$`, easy: group(v) };
      },
      // かっこのある形をなおす／打ち消しあう組
      s2(r) {
        if (r.chance(0.6)) {
          const n = 3, v = Array.from({ length: n }, () => r.int(1, 12) * (r.chance(0.5) ? 1 : -1));
          const ops = v.map(() => (r.chance(0.5) ? '+' : '-'));
          if (new Set(v.map(Math.abs)).size < n || !ops.slice(1).some((o, i) => o === '-' && v[i + 1] < 0)) return null;
          const eff = v.map((x, i) => (i && ops[i] === '-' ? -x : x));
          if (!mixed(eff)) return null;
          const q = v.map((x, i) => (i ? ops[i] : '') + pn(x)).join('');
          const s = eff.reduce((a, b) => a + b, 0);
          return { q: `$${q}$`, a: `$${s}$`, easy: `$${termStr(eff)}$ にして ${group(eff)}` };
        }
        const a = r.int(2, 15), b = r.intNot(1, 15, x => x === a), c = r.intNot(1, 15, x => x === a || x === b);
        const sb = r.chance(0.5) ? b : -b, sc = r.chance(0.5) ? c : -c;
        if (sb + sc === 0) return null;
        const v = r.shuffle([a, -a, sb, sc]);
        const s = sb + sc;
        const p = { q: `$${termStr(v)}$`, a: `$${s}$`, easy: `$${a}$ と $-${a}$ で0。のこりは $${termStr([sb, sc])}=${s}$`, easyCheck: false };
        p.verify = chk(v.reduce((x, y) => x + y, 0) === s, 'ちがう');
        return p;
      },
      // お金の出入り・エレベーター・東西に歩く
      s3(r) {
        const t = r.int(0, 2);
        const n = 3, v = Array.from({ length: n }, (_, i) => r.int(1, 9) * (i % 2 ? -1 : 1) * (t === 0 ? 100 : 1));
        if (r.chance(0.5)) v.forEach((x, i) => { v[i] = -x; });
        if (new Set(v.map(Math.abs)).size < n) return null;
        const s = v.reduce((a, b) => a + b, 0);
        const sv = x => (x > 0 ? `+${x}` : `${x}`);
        let q;
        if (t === 0) q = `おこづかいの《出入|で|い》り：${v.map(x => `$${sv(x)}$《円|えん》`).join('、')}。《合|あ》わせて □ 《円|えん》`;
        else if (t === 1) q = `（《上|うえ》が＋）エレベーターが ${v.map(x => `$${sv(x)}$`).join('、')} 《階|かい》《動|うご》いた。はじめから □ 《階|かい》`;
        else q = `（《東|ひがし》が＋）${v.map(x => `${x > 0 ? '《東|ひがし》' : '《西|にし》'}へ $${Math.abs(x)}${U('m')}$`).join('、')} 《歩|ある》くと、はじめから $□${U('m')}$`;
        return { q, a: `$${s}$`, easy: group(v), verify: chk(v.reduce((a, b) => a + b, 0) === s, 'ちがう') };
      },
      // わな：×がまざる（×が先。2-09 で）
      trap(r) {
        const a = r.int(2, 6), b = r.int(2, 6), c = r.int(1, 9);
        // 楽な形の式は途中の式（答えと値がちがう）なので easyCheck: false。答えは問題の式で検算される
        if (r.chance(0.5)) return dest({ q: `$${a}\\times(-${b})-${c}$`, a: `$${-a * b - c}$`, easyCheck: false }, '2-08', `×が《先|さき》。$${a}\\times(-${b})$ から`, ['2-09']);
        return dest({ q: `$${c}+(-${a * b})\\div${a}$`, a: `$${c - b}$`, easyCheck: false }, '2-08', `÷が《先|さき》。$(-${a * b})\\div${a}$ から`, ['2-09']);
      },
    },
  });

  // ================================================================ 2-09
  // 符号を先に決めた楽な形：負が奇数こなら $-(2\times3\times5)=-30$
  function signForm(nums, ops) {
    const neg = nums.filter(x => x < 0).length;
    const body = nums.map((x, i) => (i ? (ops[i - 1] === '÷' ? '\\div' : '\\times') : '') + Math.abs(x)).join('');
    let v = Math.abs(nums[0]);
    nums.slice(1).forEach((x, i) => { v = ops[i] === '÷' ? v / Math.abs(x) : v * Math.abs(x); });
    const res = neg % 2 ? -v : v;
    return { text: `《負|ふ》が${neg}こで${neg % 2 ? '－' : '＋'}。${neg % 2 ? `$-(${body})=${res}$` : `$${body}=${res}$`}`, res };
  }
  add({
    id: '2-09', part: 1, chap: '2-2⑧⑨', stars: 1,
    title: '×÷の《符号|ふ|ごう》は《先|さき》に《決|き》める',
    mark: '**×・÷だけ**の《式|しき》に《負|ふ》の《数|かず》がある。《負|ふ》の《数|かず》の《個数|こ|すう》で、《符号|ふ|ごう》を《先|さき》に《決|き》める。',
    futsu: ['$(-2)\\times3\\times(-5)$ を、《左|ひだり》から', '$(-2)\\times3=-6$、', '$(-6)\\times(-5)=30$ と《計算|けい|さん》する。'],
    raku: ['《負|ふ》が2こ（《偶数|ぐう|すう》こ）で＋。', '$2\\times3\\times5=30$'],
    why: '《負|ふ》の《数|かず》を1つかけるたびに、《向|む》きが1《回|かい》《反対|はん|たい》になる。2《回|かい》で、もとの《向|む》きにもどる（《教科書|きょう|か|しょ》 2-2⑧）。',
    caution: 'ひき《算|ざん》（$(-2)-(-5)$）には《使|つか》えない。＋・－がまざるときは、×・÷のまとまりごとに《考|かんが》える。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '14mm' },
    // ×÷だけの式に負の数がある／負の数をいくつかかけた符号・西へ進む人の前と後の場所（ことばの問題）
    fits(q) {
      if (/負の数を\d+こかけた|1秒に .* ずつ進む人が、今0の場所/.test(q)) return true;
      const e = arith(only(q));
      return isMD(e) && e.nums.some(x => x.v < 0);
    },
    steps: {
      // 2〜3この かけ算
      s1(r) {
        const n = r.int(2, 3), v = Array.from({ length: n }, () => r.int(2, 9) * (r.chance(0.55) ? -1 : 1));
        if (!v.some(x => x < 0)) return null;
        const f = signForm(v, v.slice(1).map(() => '×'));
        return { q: `$${v.map(x => pn(x)).join('\\times')}$`, a: `$${f.res}$`, easy: f.text, key: `x${v.slice().sort(num)}` };
      },
      // ÷がまざる・4つ以上
      s2(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const b = r.int(2, 9), c = r.int(2, 9), sa = r.chance(0.5) ? -1 : 1, sb = r.chance(0.5) ? -1 : 1;
          if (sa > 0 && sb > 0) return null;
          const v = [sa * b * c, sb * b];
          const f = signForm(v, ['÷']);
          return { q: `$${pn(v[0])}\\div${pn(v[1])}$`, a: `$${f.res}$`, easy: f.text };
        }
        if (t === 1) {
          const b = r.int(2, 6), c = r.int(2, 5), d = r.int(2, 5), s = [0, 0, 0].map(() => (r.chance(0.5) ? -1 : 1));
          if (!s.some(x => x < 0)) return null;
          const v = [s[0] * b * c, s[1] * b, s[2] * d];
          const f = signForm(v, ['÷', '×']);
          return { q: `$${pn(v[0])}\\div${pn(v[1])}\\times${pn(v[2])}$`, a: `$${f.res}$`, easy: f.text };
        }
        const n = 4, v = Array.from({ length: n }, () => (r.chance(0.5) ? -1 : 1) * r.pick([1, 1, 2, 3, 5]));
        if (v.filter(x => x < 0).length < 2) return null;
        const f = signForm(v, v.slice(1).map(() => '×'));
        return { q: `$${v.map(x => pn(x)).join('\\times')}$`, a: `$${f.res}$`, easy: f.text, key: `x${v.slice().sort(num)}` };
      },
      // 同じ負の数をかける・符号だけきく・西へ進む人の場所
      s3(r) {
        const t = r.pick([0, 1, 2, 2]);
        if (t === 0) {
          const a = r.pick([1, 2, 3]), n = a === 1 ? r.int(4, 7) : r.int(2, 4), v = Array(n).fill(-a);
          const f = signForm(v, v.slice(1).map(() => '×'));
          return { q: `$${v.map(x => pn(x)).join('\\times')}$`, a: `$${f.res}$`, easy: f.text };
        }
        if (t === 1) {
          const n = r.int(2, 9);
          return { q: `《負|ふ》の《数|かず》を${n}こかけた《答|こた》えの《符号|ふ|ごう》は □`, a: n % 2 ? '－' : '＋', easy: n % 2 ? '（《奇数|き|すう》こ）' : '（《偶数|ぐう|すう》こ）',
            verify: chk((n % 2 === 1) === (Math.pow(-1, n) < 0), 'ちがう') };
        }
        const v = r.int(2, 6), s = r.int(2, 5), before = r.chance(0.6);
        const tm = before ? -s : s, pos = -v * tm;
        const p = { q: `《東|ひがし》を＋とする。《西|にし》へ1《秒|びょう》に $${v}${U('m')}$ ずつ《進|すす》む《人|ひと》が、《今|いま》0の《場所|ば|しょ》にいる。${before ? `${s}《秒前|びょう|まえ》` : `${s}《秒後|びょう|ご》`}の《場所|ば|しょ》は $□${U('m')}$`,
          a: `$${pos}${U('m')}$`, easy: `$(-${v})\\times${pn(tm)}=${pos}$` };
        p.verify = vNum(p, pos, (-v) * tm === pos); return p;
      },
      // わな：ひき算（符号を先に決めるのは×÷だけ。2-07 で）
      trap(r) {
        const a = r.int(1, 9), b = r.intNot(1, 9, v => v === a);
        return dest({ q: `$(-${a})-(-${b})$`, a: `$${b - a}$` }, '2-09', 'ひき《算|ざん》。《符号|ふ|ごう》を《先|さき》に《決|き》めるのは×・÷だけ');
      },
    },
  });

  // ================================================================ 2-10
  // 変化量の場面：[まえ・あとの文, 単位（□のあと）, 数のはんい]
  // u は欄のあとの単位（m・L などは式の中に書いて、欄と同じ行に置く）
  const HENKA = [
    { w: (b, a) => `《気温|き|おん》が $${b}$ ℃ から $${a}$ ℃ になった`, u: '□ ℃', lo: -9, hi: 20 },
    { w: (b, a) => `《水|みず》そうの《水|みず》が $${b}${U('L')}$ から $${a}${U('L')}$ になった`, u: `$□${U('L')}$`, lo: 5, hi: 60 },
    { w: (b, a) => `《位置|い|ち》が $${b}${U('m')}$ から $${a}${U('m')}$ になった`, u: `$□${U('m')}$`, lo: -30, hi: 90 },
    { w: (b, a) => `《貯金|ちょ|きん》が ${b * 100}《円|えん》から ${a * 100}《円|えん》になった`, u: '□ 《円|えん》', lo: 3, hi: 40, x: 100 },
    { w: (b, a) => `ろうそくの《長|なが》さが $${b}${U('cm')}$ から $${a}${U('cm')}$ になった`, u: `$□${U('cm')}$`, lo: 2, hi: 20, down: true },
  ];
  add({
    id: '2-10', part: 1, chap: '2-2⑦・2-3②', stars: 1,
    title: '《変化量|へん|か|りょう》は「あと－まえ」',
    mark: '「**《何|なん》℃《上|あ》がった**」「かわった《量|りょう》」「$\\Delta$」をきかれる。あとの《量|りょう》から、まえの《量|りょう》をひく。',
    futsu: ['$-1$ ℃ から $6$ ℃ まで、', '《温度計|おん|ど|けい》の《目|め》もりを', '1つずつ《数|かぞ》える。'],
    raku: ['あと－まえ', '$6-(-1)=6+1=7$', '→ $+7$ ℃（7℃《上|あ》がった）'],
    why: '「まえ＋かわった《分|ぶん》＝あと」なので、かわった《分|ぶん》は「あと－まえ」。へったときはマイナスになる（《教科書|きょう|か|しょ》 2-3）。',
    caution: '2つの《町|まち》の《気温|き|おん》の《差|さ》のように「あと」がないときは、《大|おお》きいほうから《小|ちい》さいほうをひく。',
    counts: { s1: 7, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: '14mm',
    // 「もらって、使った」（2つの動きの和。わざ 2-06）は、あと－まえ ではない
    fits(q) { return /変化量|\\Delta|になった。□ ℃下がった/.test(q) && !/もらって/.test(q); },
    steps: {
      // まえ → あと の変化量
      s1(r) {
        const H = r.pick(HENKA), b = r.int(H.lo, H.hi), a = H.down ? r.int(H.lo, b - 1) : r.intNot(H.lo, H.hi, v => v === b);
        if (a === b) return null;
        const x = H.x || 1, d = (a - b) * x;
        return { q: `${H.w(b, a)}。《変化量|へん|か|りょう》は ${H.u}`, a: `$${sgn(d)}$`, easy: `$${a * x}-${pn(b * x)}=${d}$`,
          verify: chk(b * x + d === a * x, 'まえ＋変化量があとにならない') };
      },
      // 「あと」が先に書いてある／ $\Delta x$・$\Delta t$
      s2(r) {
        if (r.chance(0.5)) {
          const [w1, w2] = r.pick([['《昼|ひる》', '《夜|よる》'], ['《朝|あさ》', '《昼|ひる》']]);
          const b = r.int(-6, 25), a = r.intNot(-8, 25, v => v === b);
          return { q: `${w2}の《気温|き|おん》は $${a}$ ℃、${w1}は $${b}$ ℃。${w1}→${w2}の《変化量|へん|か|りょう》は □ ℃`, a: `$${sgn(a - b)}$`,
            easy: `あとは${w2}。$${a}-${pn(b)}=${a - b}$`, verify: chk(b + (a - b) === a, 'ちがう') };
        }
        const t1 = r.int(0, 30), t2 = t1 + r.int(5, 40), x1 = r.int(0, 30) * 5, x2 = r.intNot(0, 40, v => v * 5 === x1) * 5;
        if (r.chance(0.5)) {
          return { q: `《時刻|じ|こく》 $${t1}${U('s')}$ に《位置|い|ち》 $${x1}${U('m')}$、《時刻|じ|こく》 $${t2}${U('s')}$ に $${x2}${U('m')}$。$\\Delta x$ は $□${U('m')}$`, a: `$${sgn(x2 - x1)}$`,
            easy: `$${x2}-${x1}=${x2 - x1}$`, verify: chk(x1 + (x2 - x1) === x2, 'ちがう') };
        }
        return { q: `《時刻|じ|こく》 $${t1}${U('s')}$ に《位置|い|ち》 $${x1}${U('m')}$、《時刻|じ|こく》 $${t2}${U('s')}$ に $${x2}${U('m')}$。$\\Delta t$ は $□${U('s')}$`, a: `$${sgn(t2 - t1)}$`,
          easy: `$${t2}-${t1}=${t2 - t1}$`, verify: chk(t1 + (t2 - t1) === t2, 'ちがう') };
      },
      // 変化量から まえ をもとめる／3つの時刻／「□ ℃下がった」
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const d = r.intNot(-9, 12, v => v === 0), a = r.int(-5, 15), b = a - d;
          return { q: `《気温|き|おん》の《変化量|へん|か|りょう》が $${sgn(d)}$ ℃ で、あとが $${a}$ ℃。まえは □ ℃`, a: `$${b}$`, easy: `まえ＝あと－《変化量|へん|か|りょう》。$${a}-${pn(d)}=${b}$`,
            verify: chk(b + d === a, 'ちがう') };
        }
        if (t === 1) {
          const v = [r.int(-5, 8), r.int(4, 18), r.int(-3, 10)];
          if (v[0] === v[1] || v[1] === v[2]) return null;
          const k = r.int(0, 1), N = ['《朝|あさ》', '《昼|ひる》', '《夜|よる》'];
          return { q: `《気温|き|おん》：《朝|あさ》 $${v[0]}$ ℃ → 《昼|ひる》 $${v[1]}$ ℃ → 《夜|よる》 $${v[2]}$ ℃。${N[k]}→${N[k + 1]}の《変化量|へん|か|りょう》は □ ℃`,
            a: `$${sgn(v[k + 1] - v[k])}$`, easy: `$${v[k + 1]}-${pn(v[k])}=${v[k + 1] - v[k]}$`, verify: chk(v[k] + (v[k + 1] - v[k]) === v[k + 1], 'ちがう') };
        }
        const b = r.int(-3, 15), a = r.int(-9, b - 2), d = a - b;
        return { q: `《気温|き|おん》が $${b}$ ℃ から $${a}$ ℃ になった。□ ℃《下|さ》がった`, a: `$${-d}$`, easy: `$${a}-${pn(b)}=${d}$。マイナスは《下|さ》がった`, val: String(d),
          verify: chk(b - (-d) === a, 'ちがう') };
      },
      // わな：2つの町の気温の差（「あと」がない。大きいほうから小さいほうを）
      trap(r) {
        const x = r.int(3, 25), y = r.intNot(3, 25, v => v === x);
        const big = Math.max(x, y), small = Math.min(x, y);
        let q;
        if (r.chance(0.5)) q = `《東|ひがし》の《町|まち》は $${x}$ ℃、《西|にし》の《町|まち》は $${y}$ ℃。2つの《町|まち》の《気温|き|おん》の《差|さ》は □ ℃`;
        else q = `ある《日|ひ》の《気温|き|おん》は、《最低|さい|てい》 $${small}$ ℃、《最高|さい|こう》 $${big}$ ℃。《差|さ》は □ ℃`;
        return { q, a: `$${big - small}$`, easy: `（「あと」がない。《大|おお》きいほうから《小|ちい》さいほうをひく。$${big}-${small}=${big - small}$）`,
          verify: chk(big - small > 0, 'ちがう') };
      },
    },
  });

  // ================================================================ 2-11
  const ADD = [['m', 'cm'], ['kg', 'g'], ['L', 'mL'], ['cm', 'mm'], ['km', 'm'], ['L', 'dL']];
  add({
    id: '2-11', part: 1, chap: '2-3①', stars: 1,
    title: '《単位|たん|い》をそろえてからたす・ひく',
    mark: '《同|おな》じ《種類|しゅ|るい》で、**《単位|たん|い》のちがう《量|りょう》**のたし《算|ざん》・ひき《算|ざん》。《単位|たん|い》をそろえてから、《数値|すう|ち》を《計算|けい|さん》する。',
    futsu: ['$2\\,\\mathrm{m}+40\\,\\mathrm{cm}$ を、', 'テープの《図|ず》をかいて《考|かんが》える。'],
    raku: ['cm にそろえる。', '$200\\,\\mathrm{cm}+40\\,\\mathrm{cm}$', '$=240\\,\\mathrm{cm}$'],
    why: '《量|りょう》＝《数値|すう|ち》×《単位|たん|い》。1つ《分|ぶん》の《大|おお》きさ（《単位|たん|い》）が《同|おな》じなら、《数値|すう|ち》どうしをたせる（《教科書|きょう|か|しょ》 2-3）。',
    caution: 'かけ《算|ざん》（$2\\,\\mathrm{m}\\times3$）は、そろえなくてよい。《長|なが》さと《時間|じ|かん》のように《種類|しゅ|るい》がちがうと、たせない。',
    counts: { s1: 8, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '18mm' },
    // 同じ種類で単位のちがう量の ＋・－ の式／つなぐ・のこり・合わせて・入れる（ことばの問題）
    fits(q) {
      const L = qtys(q);
      if (/つなぐと|のこりは|合わせて|入れると/.test(q) && target(q) && L.length >= 2 && sameKind(L) && new Set(L.map(x => x.u)).size >= 2) return true;
      return mathOf(q).some(m => {
        const left = m.split('=')[0];
        if (!/\}\s*[+-]/.test(left)) return false;
        const L = qtys(left);
        return L.length >= 2 && sameKind(L) && new Set(L.map(x => x.u)).size >= 2 && sumQ(left) != null;
      });
    },
    steps: {
      // 大きい単位＋小さい単位 → 小さい単位
      s1(r) {
        const [b, s] = r.pick(ADD.concat(ADD.slice(0, 3))), f = fac(b, s), a = r.int(1, 9), c = r.intNot(1, f >= 100 ? 990 : f - 1, v => v >= f || (f >= 1000 && v % 10 !== 0));
        const sw = r.chance(0.3);
        const q0 = sw ? `${c}${U(s)}+${a}${U(b)}` : `${a}${U(b)}+${c}${U(s)}`;
        const e0 = sw ? `${c}${U(s)}+${a * f}${U(s)}` : `${a * f}${U(s)}+${c}${U(s)}`;
        const p = { q: `$${q0}=□${U(s)}$`, a: `$${a * f + c}${U(s)}$`, easy: `$${e0}=${a * f + c}${U(s)}$`, key: `${b}+${a},${c}` };
        p.verify = vUnit(p, a * KIND[b][1] + c * KIND[s][1]); return p;
      },
      // ひき算／大きい単位にそろえる／小数の量
      s2(r) {
        const t = r.int(0, 2), [b, s] = r.pick(ADD.slice(0, 3)), f = fac(b, s);
        if (t === 0) {
          const a = r.int(1, 5), c = r.intNot(1, f - 1, v => f >= 1000 ? v % 10 !== 0 : false);
          const p = { q: `$${a}${U(b)}-${c}${U(s)}=□${U(s)}$`, a: `$${a * f - c}${U(s)}$`, easy: `$${a * f}${U(s)}-${c}${U(s)}=${a * f - c}${U(s)}$` };
          p.verify = vUnit(p, a * KIND[b][1] - c * KIND[s][1]); return p;
        }
        if (t === 1) {
          const e = lg(f), a = r.int(1, 9), c = r.intNot(1, f - 1, v => v % (f / 10) !== 0);
          const p = { q: `$${a}${U(b)}+${c}${U(s)}=□${U(b)}$`, a: `$${dec(a * f + c, e)}${U(b)}$`, easy: `$${a}${U(b)}+${dec(c, e)}${U(b)}=${dec(a * f + c, e)}${U(b)}$` };
          p.verify = vUnit(p, a * KIND[b][1] + c * KIND[s][1]); return p;
        }
        const a = r.intNot(11, 39, v => v % 10 === 0), c = r.intNot(1, f / 2, v => v % (f / 100) !== 0 || v % (f / 10) === 0);
        const A = a * f / 10;
        const p = { q: `$${dec(a, 1)}${U(b)}+${c}${U(s)}=□${U(s)}$`, a: `$${A + c}${U(s)}$`, easy: `$${A}${U(s)}+${c}${U(s)}=${A + c}${U(s)}$` };
        p.verify = vUnit(p, M.F.add(M.F.make(a * KIND[b][1], 10), M.F.make(c * KIND[s][1]))); return p;
      },
      // ひも・お茶・かばん・道のり・テープ
      s3(r) {
        const t = r.int(0, 4);
        let p, want;
        if (t === 0) { const a = r.int(1, 4), c = r.intNot(5, 95, v => v % 5 !== 0); p = { q: `$${a}${U('m')}$ のひもと $${c}${U('cm')}$ のひもをつなぐと、$□${U('cm')}$`, a: `$${a * 100 + c}${U('cm')}$`, easy: `$${a * 100}${U('cm')}+${c}${U('cm')}=${a * 100 + c}${U('cm')}$` }; want = a * 1000 + c * 10; }
        else if (t === 1) { const a = r.int(1, 2), c = r.int(1, 9) * 50 + (r.chance(0.5) ? 0 : 20); p = { q: `$${a}${U('L')}$ のお《茶|ちゃ》から $${c}${U('mL')}$ 《飲|の》むと、のこりは $□${U('mL')}$`, a: `$${a * 1000 - c}${U('mL')}$`, easy: `$${a * 1000}${U('mL')}-${c}${U('mL')}=${a * 1000 - c}${U('mL')}$` }; want = a * 1000 - c; }
        else if (t === 2) { const a = r.int(1, 3), c = r.int(12, 95) * 10; p = { q: `$${a}${U('kg')}$ のかばんに $${c}${U('g')}$ の《本|ほん》を《入|い》れると、$□${U('g')}$`, a: `$${a * 1000 + c}${U('g')}$`, easy: `$${a * 1000}${U('g')}+${c}${U('g')}=${a * 1000 + c}${U('g')}$` }; want = a * 1000 + c; }
        else if (t === 3) { const a = r.int(1, 5), c = r.int(1, 9) * 100 + r.pick([0, 50]); p = { q: `《家|いえ》から《駅|えき》まで $${a}${U('km')}$、《駅|えき》から《学校|がっ|こう》まで $${c}${U('m')}$。《合|あ》わせて $□${U('m')}$`, a: `$${a * 1000 + c}${U('m')}$`, easy: `$${a * 1000}${U('m')}+${c}${U('m')}=${a * 1000 + c}${U('m')}$` }; want = (a * 1000 + c) * 1000; }
        else { const a = r.int(2, 5), c = r.intNot(15, 95, v => v % 5 !== 0); p = { q: `$${a}${U('m')}$ のテープから $${c}${U('cm')}$ 《切|き》りとると、のこりは $□${U('cm')}$`, a: `$${a * 100 - c}${U('cm')}$`, easy: `$${a * 100}${U('cm')}-${c}${U('cm')}=${a * 100 - c}${U('cm')}$` }; want = (a * 100 - c) * 10; }
        p.verify = vUnit(p, want); return p;
      },
      // わな：かけ算（そろえなくてよい）／種類のちがう量（たせない）
      trap(r) {
        if (r.chance(0.5)) {
          const u = r.pick(['m', 'kg', 'L', 'cm']), a = r.int(2, 9), n = r.int(2, 9);
          const p = { q: `$${a}${U(u)}\\times${n}=□${U(u)}$`, a: `$${a * n}${U(u)}$`, easy: `（かけ《算|ざん》。《単位|たん|い》はそろえなくてよい。$${a}\\times${n}=${a * n}$）` };
          p.verify = vUnit(p, a * n * KIND[u][1]); return p;
        }
        const a = r.int(2, 9), b = r.int(2, 30);
        return { q: `$${a}${U('m')}+${b}${U('s')}$`, a: 'たせない', easy: '（《長|なが》さと《時間|じ|かん》。《種類|しゅ|るい》がちがう）', verify: chk(KIND.m[0] !== KIND.s[0], 'ちがう') };
      },
    },
  });

  // ================================================================ 2-12
  add({
    id: '2-12', part: 1, chap: '2-3③', stars: 1,
    title: '1あたりは「÷」、《単位|たん|い》を《見|み》て《決|き》める',
    mark: '**m/s・《人|にん》/$\\mathrm{m}^{2}$** のような「/」のついた《単位|たん|い》や「1あたり」をきかれる。「/」の《前|まえ》の《量|りょう》を、うしろの《量|りょう》でわる。',
    futsu: ['$15\\,\\mathrm{m}$ を $10\\,\\mathrm{s}$ で《進|すす》んだ《速|はや》さを、', '$10\\div15$ か $15\\div10$ か、', '《図|ず》をかいて《考|かんが》える。'],
    raku: ['m/s は m÷s。', '$15\\div10=1.5$', '→ $1.5\\,\\mathrm{m/s}$'],
    why: '「/」は÷のしるし（《教科書|きょう|か|しょ》 2-3）。《単位|たん|い》のならび（m÷s）が、そのまま《計算|けい|さん》の《順番|じゅん|ばん》になる。',
    caution: '1あたりの《量|りょう》がもうわかっていて、《全体|ぜん|たい》をきかれたら、かけ《算|ざん》（わざ 2-13）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '12mm', trap: '16mm' },
    fits(q) { return askRate(q) && !givenRate(q); },
    steps: {
      // 道のり÷時間 → m/s
      s1(r) {
        // 速さ（0.1 m/s がいくつか）は、道のりが整数になるように時間から決める（t が 5 なら 0.2 きざみ、偶数なら 0.5 きざみ）
        const t = r.int(2, 12), step = r.chance(0.4) ? 10 : 10 / M.F.gcd(t, 10);
        const v10 = r.int(Math.ceil(12 / step), Math.floor(250 / step)) * step, d = v10 * t / 10;
        const p = { q: `$${d}${U('m')}$ を $${t}${U('s')}$ で《進|すす》んだ。《速|はや》さは $□${U('m/s')}$`, a: `$${dec(v10, 1)}${U('m/s')}$`, easy: `$${d}\\div${t}=${dec(v10, 1)}$` };
        p.verify = vNum(p, v10 / 10, d * 10 === v10 * t); return p;
      },
      // こみぐあい・1分あたりの水・1 m あたりの重さ・1 m あたりの時間
      s2(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const s = r.int(4, 12), c10 = r.pick([10, 15, 20, 25, 30, 35, 40]), n = s * c10 / 10;
          if (!Number.isInteger(n)) return null;
          const p = { q: `《広|ひろ》さ $${s}\\,\\mathrm{m}^{2}$ に${nin(n)}いる。こみぐあいは □《人|にん》/$\\mathrm{m}^{2}$`, a: `$${dec(c10, 1)}$`, easy: `$${n}\\div${s}=${dec(c10, 1)}$` };
          p.verify = vNum(p, c10 / 10, n * 10 === c10 * s); return p;
        }
        if (t === 1) {
          const m = r.int(2, 9), w = r.int(3, 12), L = m * w;
          const p = { q: `${fun(m)}で $${L}${U('L')}$ の《水|みず》が《入|はい》った。1《分|ぷん》あたり $□${U('L')}$`, a: `$${w}$`, easy: `$${L}\\div${m}=${w}$` };
          p.verify = vNum(p, w, L === m * w); return p;
        }
        if (t === 2) {
          const m = r.int(2, 8), g = r.int(3, 30) * 10, W = m * g;
          const p = { q: `《長|なが》さ $${m}${U('m')}$ で $${W}${U('g')}$ のはり《金|がね》。1 m あたり $□${U('g')}$`, a: `$${g}$`, easy: `$${W}\\div${m}=${g}$` };
          p.verify = vNum(p, g, W === m * g); return p;
        }
        const d = r.pick([10, 20, 50, 100]), s10 = r.int(3, 15);
        if ((d * s10) % 10) return null;
        const tt = d * s10 / 10;
        if (!Number.isInteger(tt)) return null;
        const p = { q: `$${d}${U('m')}$ を${byo(tt)}で《進|すす》んだ。1 m あたり □ 《秒|びょう》`, a: `$${dec(s10, 1)}$`, easy: `《秒|びょう》÷m。$${tt}\\div${d}=${dec(s10, 1)}$` };
        p.verify = vNum(p, s10 / 10, tt * 10 === s10 * d); return p;
      },
      // 時刻と位置・水そう・ろうそく（2つの時刻から）
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const v = r.int(5, 25), t1 = r.int(1, 6) * 10, dt = r.int(2, 6) * 5, x1 = r.int(1, 30) * 10, x2 = x1 + v * dt;
          const p = { q: `《電車|でん|しゃ》の《位置|い|ち》が、《時刻|じ|こく》${byo(t1)}に $${x1}${U('m')}$、${byo(t1 + dt)}に $${x2}${U('m')}$。《速|はや》さは $□${U('m/s')}$`,
            a: `$${v}${U('m/s')}$`, easy: `$(${x2}-${x1})\\div(${t1 + dt}-${t1})=${v}$` };
          p.verify = vNum(p, v, x2 - x1 === v * dt); return p;
        }
        if (t === 1) {
          const w = r.int(3, 12), m1 = r.int(1, 6), dm = r.int(2, 6), L1 = r.int(2, 30), L2 = L1 + w * dm;
          const p = { q: `《水|みず》の《量|りょう》は${fun(m1)}《後|ご》に $${L1}${U('L')}$、${fun(m1 + dm)}《後|ご》に $${L2}${U('L')}$。1《分|ぷん》あたり $□${U('L')}$ ふえた`,
            a: `$${w}$`, easy: `$(${L2}-${L1})\\div(${m1 + dm}-${m1})=${w}$` };
          p.verify = vNum(p, w, L2 - L1 === w * dm); return p;
        }
        const s10 = r.int(1, 5), dm = r.pick([10, 20, 30]), c1 = r.int(12, 20), dc = s10 * dm / 10;
        if (!Number.isInteger(dc) || dc >= c1) return null;
        const p = { q: `ろうそくは、はじめ $${c1}${U('cm')}$、${fun(dm)}《後|ご》に $${c1 - dc}${U('cm')}$。1《分|ぷん》あたり $□${U('cm')}$ へった`,
          a: `$${dec(s10, 1)}$`, easy: `$${dc}\\div${dm}=${dec(s10, 1)}$` };
        p.verify = vNum(p, s10 / 10, dc * 10 === s10 * dm); return p;
      },
      // わな：1あたりがもうわかっている（全体をきかれる。2-13 で）
      trap(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const v = r.int(2, 12), s = r.int(3, 9);
          return dest({ q: `$${v}${U('m/s')}$ で${byo(s)}《進|すす》むと、$□${U('m')}$`, a: `$${v * s}${U('m')}$`,
            verify: chk(v * s > 0, 'ちがう') }, '2-12', '1あたりはもうわかっている。かけ《算|ざん》');
        }
        if (t === 1) {
          const c = r.int(2, 4), s = r.int(5, 15);
          return dest({ q: `1 $\\mathrm{m}^{2}$ あたり${nin(c)}で、$${s}\\,\\mathrm{m}^{2}$ には □《人|にん》`, a: `$${c * s}$`, verify: chk(c * s > 0, 'ちがう') }, '2-12', '1あたりはもうわかっている。かけ《算|ざん》');
        }
        const w = r.int(3, 9), m = r.int(3, 9);
        return dest({ q: `1《分|ぷん》あたり $${w}${U('L')}$ の《水|みず》を${fun(m)}《入|い》れると、$□${U('L')}$`, a: `$${w * m}${U('L')}$`, verify: chk(w * m > 0, 'ちがう') }, '2-12', '1あたりはもうわかっている。かけ《算|ざん》');
      },
    },
  });

  // ================================================================ 2-13
  add({
    id: '2-13', part: 1, chap: '2-3④', stars: 1,
    title: '《全体|ぜん|たい》は「1あたり×いくつ《分|ぶん》」',
    mark: '**1あたりの《量|りょう》**（m/s など）と、《時間|じ|かん》・《広|ひろ》さなどの**いくつ《分|ぶん》**がわかっている。かけると《全体|ぜん|たい》が《出|で》る。',
    futsu: ['《速|はや》さ $5\\,\\mathrm{m/s}$ で4《秒|びょう》の《道|みち》のりを、', '$5+5+5+5$ と1《秒|びょう》ずつたす。'],
    raku: ['$5\\,\\mathrm{m/s}\\times4\\,\\mathrm{s}$', 's が《消|き》えて m が《残|のこ》る。', '$5\\times4=20$ → $20\\,\\mathrm{m}$'],
    why: '《同|おな》じ《数|かず》を《何回|なん|かい》もたすのは、かけ《算|ざん》。《単位|たん|い》もいっしょに《計算|けい|さん》できる（《教科書|きょう|か|しょ》 2-3）。',
    caution: '1あたりの《量|りょう》をきかれているときは、わり《算|ざん》（わざ 2-12）。',
    counts: { s1: 8, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { return givenRate(q) && !askRate(q) && /□/.test(q); },
    steps: {
      // m/s × s
      s1(r) {
        const v = r.int(2, 25), t = r.int(2, 12);
        const p = { q: `$${v}${U('m/s')}\\times${t}${U('s')}=□${U('m')}$`, a: `$${v * t}${U('m')}$`, easy: `$${v}\\times${t}=${v * t}$`, key: `vt${v},${t}` };
        p.verify = vNum(p, v * t); return p;
      },
      // ことばで（速さ・こみぐあい・水・はり金・小数の速さ）
      s2(r) {
        const t = r.int(0, 3);
        if (t === 0) {
          const v10 = r.intNot(12, 45, x => x % 10 === 0), s = r.int(2, 10) * 2, d10 = v10 * s;
          const p = { q: `《速|はや》さ $${dec(v10, 1)}${U('m/s')}$ で${byo(s)}《進|すす》むと、$□${U('m')}$`, a: `$${dec(d10, 1)}${U('m')}$`, easy: `$${dec(v10, 1)}\\times${s}=${dec(d10, 1)}$` };
          p.verify = vNum(p, d10 / 10); return p;
        }
        if (t === 1) {
          const c = r.int(2, 5), s = r.int(4, 15);
          const p = { q: `1 $\\mathrm{m}^{2}$ あたり${nin(c)}のこみぐあいで、《広|ひろ》さ $${s}\\,\\mathrm{m}^{2}$ の《場所|ば|しょ》には、□《人|にん》`, a: `$${c * s}$`, easy: `$${c}\\times${s}=${c * s}$` };
          p.verify = vNum(p, c * s); return p;
        }
        if (t === 2) {
          const w = r.int(3, 12), m = r.int(2, 9);
          const p = { q: `1《分|ぷん》あたり $${w}${U('L')}$ の《水|みず》を${fun(m)}《入|い》れると、$□${U('L')}$`, a: `$${w * m}${U('L')}$`, easy: `$${w}\\times${m}=${w * m}$` };
          p.verify = vNum(p, w * m); return p;
        }
        const g = r.int(3, 30) * 10, m = r.int(2, 8);
        const p = { q: `1 m あたり $${g}${U('g')}$ のはり《金|がね》 $${m}${U('m')}$ は、$□${U('g')}$`, a: `$${g * m}${U('g')}$`, easy: `$${g}\\times${m}=${g * m}$` };
        p.verify = vNum(p, g * m); return p;
      },
      // 2つの区間をたす・電気の量・単位だけ
      s3(r) {
        const t = r.int(0, 2);
        if (t === 0) {
          const v1 = r.int(2, 9), t1 = r.int(2, 6), v2 = r.intNot(2, 9, x => x === v1), t2 = r.int(2, 6), d = v1 * t1 + v2 * t2;
          const p = { q: `《自転車|じ|てん|しゃ》が $${v1}${U('m/s')}$ で${byo(t1)}、$${v2}${U('m/s')}$ で${byo(t2)}《走|はし》った。《全部|ぜん|ぶ》で $□${U('m')}$`, a: `$${d}${U('m')}$`,
            easy: `$${v1}\\times${t1}+${v2}\\times${t2}=${d}$` };
          p.verify = vNum(p, d); return p;
        }
        if (t === 1) {
          const e1 = r.int(5, 15), h1 = r.int(2, 4), e2 = r.int(2, 6), h2 = r.int(2, 5), e = e1 * h1 + e2 * h2;
          const p = { q: `エアコンが、1《時間|じ|かん》あたり $${dec(e1, 1)}${U('kWh')}$ で${h1}《時間|じ|かん》、そのあと $${dec(e2, 1)}${U('kWh')}$ で${h2}《時間|じ|かん》。《全部|ぜん|ぶ》で $□${U('kWh')}$`,
            a: `$${dec(e, 1)}${U('kWh')}$`, easy: `$${dec(e1, 1)}\\times${h1}+${dec(e2, 1)}\\times${h2}=${dec(e, 1)}$` };
          p.verify = vNum(p, e / 10); return p;
        }
        const [x, y, z] = r.pick([['\\mathrm{m/s}', '\\mathrm{s}', 'm'], ['《人|にん》/\\mathrm{m}^{2}', '\\mathrm{m}^{2}', '《人|にん》'], ['\\mathrm{g/m}', '\\mathrm{m}', 'g'], ['\\mathrm{kWh/h}', '\\mathrm{h}', 'kWh']]);
        const q = x.includes('《') ? `《人|にん》/$\\mathrm{m}^{2}$ に $\\mathrm{m}^{2}$ をかけた《単位|たん|い》は □` : `$${x}\\times${y}$ の《単位|たん|い》は □`;
        // 答えの単位は「/」の前の単位（÷y と ×y で もとにもどる）
        return { q, a: z, easy: '（わってかけると、もとにもどる）', verify: chk(M.plain(x).replace(/\\mathrm\{|\}/g, '').split('/')[0] === M.plain(z), '単位がちがう') };
      },
      // わな：1あたりをもとめる（わり算。2-12 で）
      trap(r) {
        const v = r.int(2, 12), s = r.int(3, 9);
        return dest({ q: `$${v * s}${U('m')}$ を${byo(s)}で《進|すす》んだ。《速|はや》さは $□${U('m/s')}$`, a: `$${v}${U('m/s')}$`, verify: chk((v * s) / s === v, 'ちがう') },
          '2-13', '1あたりをもとめる。わり《算|ざん》');
      },
    },
  });
})(globalThis.MONDAI);
