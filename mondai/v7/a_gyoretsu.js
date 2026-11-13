/* 問題集 第7巻　第1部 行列の和と積（わざ 7-01〜7-15、7-91）　組 a
 * 書き方は v7/README.md → v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第7巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 行列は M.Mat（成分は M.F の分数）で計算し、問題と答えを同じ行列から書く。答えが行列・ベクトルのときは calc（kind 'mat'）で確かめる。
 * verify は、問題の文に書いた行列を読みなおして（M.readMat と同じ読み方）、ふつうの小数の計算で答えを出しなおす（別の道すじ）。
 * 7-15 はプログラムを読むわざ（p.code）。図はない（第1部は図なし。CATALOG の「図がいる問題」）。表は 7-01・7-15 のステップ3だけ（p.table）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」）を書く（dest。第36回 N-3）。
 * 左ページの「ふつうに解くと」「楽な形にすると」の例の数（行列）は、同じ見開きの問題に出さない（O-2。EX で よける）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と行列の部品
  const F = M.F, X = M.Mat;
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(strip);
  const lastMath = q => { const m = maths(q); return m.length ? m[m.length - 1] : ''; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const gcdAll = A => A.flat().reduce((g, v) => gcd(g, v), 0);
  const close = (x, y) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  // 同じステップの中で、問題の形を順番に回す（第5巻 組 d と同じ）。はじめの形は乱数、あとは1ずつ
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const nz = (r, lo, hi) => r.intNot(lo, hi, v => v === 0);
  // 数の TeX（整数はそのまま、小数はきりのよい形）
  const num = v => (Number.isInteger(v) ? String(v) : String(+(+v).toFixed(6)));
  const par = v => (v < 0 ? `(${num(v)})` : num(v));                         // 負の数はかっこごと
  const pm = A => '\\begin{pmatrix}' + A.map(row => row.map(num).join('&')).join('\\\\') + '\\end{pmatrix}';
  const vecH = v => '(' + v.map(num).join(',\\ ') + ')';                       // (3,\ 2)
  const col = v => v.map(x => [x]);                                            // たてのベクトル（n×1）
  // M.Mat との行き来（小数は M.F.fromDec で分数に）
  const toM = A => A.map(row => row.map(v => (Number.isInteger(v) ? F.make(v) : F.fromDec(String(v)))));
  const fromM = A => A.map(row => row.map(x => +(x[0] / x[1]).toFixed(9)));
  const Mmul = (A, B) => fromM(X.mul(toM(A), toM(B)));
  const Madd = (A, B, k, m) => fromM(X.add(X.scale(toM(A), k == null ? 1 : k), X.scale(toM(B), m == null ? 1 : m)));
  const MT = A => fromM(X.T(toM(A)));
  const calcM = A => ({ kind: 'mat', want: toM(A) });
  const kM = A => A.map(row => row.join(',')).join(';');                       // 同じ問題の判定（key）
  // 乱数の行列
  const rmat = (r, n, m, lo, hi) => Array.from({ length: n }, () => Array.from({ length: m }, () => r.int(lo, hi)));
  const zero = A => A.every(row => row.every(v => v === 0));

  // ---------------------------------------------------------------- 検算の部品（問題の文を読みなおして、小数で計算しなおす）
  const PMRE = /\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g;
  const readP = body => body.split('\\\\').map(row => row.split('&').map(c => M.evalMath(c.trim(), {})));
  const matsOf = t => [...String(t).matchAll(PMRE)].map(m => readP(m[1]));
  const ansM = a => { const g = M.readMat(a); return g && g.map(row => row.map(v => v[0])); };
  const mul = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, x, k) => s + x * B[k][j], 0)));
  const same = (A, B) => !!A && !!B && A.length === B.length && A.every((row, i) => row.length === B[i].length && row.every((x, j) => close(x, B[i][j])));
  const okM = (got, want, what) => same(got, want) || `${what}：答えの行列がちがう（${JSON.stringify(want)}）`;
  // 答えの文の中の $…$ の数（単位・記号をのぞく）
  const numsOf = a => maths(a).map(t => M.evalMath(t.replace(/^.*=/, '').replace(/\\,\\mathrm\{[^}]*\}/g, ''), {})).filter(v => v != null);
  // 「定義 L=…」を読む：$P=\begin{pmatrix}…\end{pmatrix}$
  const defs = q => { const o = {}; maths(q).forEach(m => { const k = /^([A-Z])=(\\begin\{pmatrix\}[\s\S]*\\end\{pmatrix\})$/.exec(m); if (k) o[k[1]] = matsOf(k[2])[0]; }); return o; };

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  // 式の中の行列を「M0」「M1」… に置きかえた形（間の記号を見るため）と、その行列
  function shapes(q) {
    return maths(q).map(m => { const ms = []; const s = m.replace(PMRE, (_, b) => { ms.push(readP(b)); return ' M' + (ms.length - 1) + ' '; }).replace(/\s+/g, ' ').trim(); return { s, ms }; });
  }
  const dimOf = A => [A.length, A[0].length];
  // 数だけの行列の積（間に記号がない2つの行列）：[[A, B], …]
  function prods(q) {
    const out = [];
    shapes(q).forEach(({ s, ms }) => { for (const m of s.matchAll(/M(\d+) (?=M(\d+))/g)) out.push([ms[+m[1]], ms[+m[2]]]); });
    return out;
  }
  // 数だけの行列の和・差：[[A, B, 前の数], …]
  function sums(q) {
    const out = [];
    shapes(q).forEach(({ s, ms }) => { for (const m of s.matchAll(/(?:^|[=(]\s?)(-?[\d.]*)\s?M(\d+) ?[+-] ?[\d.]*\s?M(\d+)/g)) out.push([ms[+m[2]], ms[+m[3]], m[1]]); });
    return out;
  }
  const isDiag = A => A.length === A[0].length && A.every((row, i) => row.every((v, j) => i === j || v === 0));
  const canMul = (A, B) => A[0].length === B.length;

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(7).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 1 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 7-01
  // 左ページの例：B=(4 0 -1; 7 3 5)（O-2。この行列は出さない）
  const EX01 = kM([[4, 0, -1], [7, 3, 5]]);
  const LET = ['A', 'B', 'C', 'D', 'P', 'Q'];
  const DAYS = ['月', '火', '水', '木', '金'];
  // ちがう数だけの行列（成分の場所を聞くので、同じ数を2つ入れない）
  const distinct = (r, n, m, lo, hi) => { const pool = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)); return Array.from({ length: n }, (_, i) => pool.slice(i * m, i * m + m)); };
  const elemQ = q => { const m = /\$([a-z])_\{(\d)(\d)\}\$/.exec(q); return m ? [+m[2], +m[3]] : null; };
  M.add({
    id: '7-01', part: 1, chap: '7-1① 例題1', stars: 1,
    title: '成分 $a_{ij}$ は「行が先」：横の段を先に決めて、その段を左から数える',
    mark: '$a_{ij}$・$b_{23}$、「何行め何列めの成分」。',
    futsu: ['$B=\\begin{pmatrix}4&0&-1\\\\7&3&5\\end{pmatrix}$ の $b_{23}$ を、', '左上から横に「1つめ、2つめ、…」と', '全部の成分を順に数えて、', '6つめでさがす。'],
    raku: ['$b_{23}$ は2行め3列め（行が先）', '2段め $(7,\\ 3,\\ 5)$ の3つめで $5$', '$b_{12}=0$、$b_{21}=7$（取りちがえない）'],
    why: '行列 $A$ の成分は、小文字の $a$ に行の番号と列の番号を下につけて $a_{ij}$ と書く。下つきは「行列」ということばと同じ順で、行が先、列があと（7-1①）。行は横の段なので、先に段を決めれば、あとはその段を左から数えるだけ。',
    caution: '$a_{12}$（1行め2列め）と $a_{21}$（2行め1列め）は別の場所。表計算のセルの番地は「列の文字が先」（2-18）で、順番が反対なので気をつける。',
    counts: { s1: 6, s2: 2, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '14mm', s3: '30mm', trap: '22mm' },
    fits(q) {
      if (/セル|MMULT|表計算|mathsf|積|和|かけ|たし|ひい|対称|転置/.test(q)) return false;
      if (prods(q).length || sums(q).length) return false;
      return /[a-z]_\{(?:\d\d|ij)\}/.test(q) || /何行め何列め/.test(q);
    },
    steps: {
      // 2×2・2×3 の成分を読む
      s1(r) {
        const [n, m] = r.pick([[2, 2], [2, 3], [2, 3]]), A = distinct(r, n, m, -9, 9);
        if (kM(A) === EX01) return null;
        const L = r.pick(LET), l = L.toLowerCase(), i = r.int(1, n), j = r.int(1, m);
        if (n === 2 && m === 2 && i === j && r.chance(0.6)) return null;   // 2×2 は ななめでない成分を多めに
        return {
          q: `$${L}=${pm(A)}$ の $${l}_{${i}${j}}$`, a: `$${A[i - 1][j - 1]}$`, key: kM(A) + `|${i}${j}`,
          easy: `${i}行め $${vecH(A[i - 1])}$ の${j}つめ`, easyCheck: false,
          verify: p => { const B = matsOf(p.q)[0], [a, b] = elemQ(p.q); return close(numsOf(p.a)[0], B[a - 1][b - 1]) || `${a}行め${b}列めは ${B[a - 1][b - 1]}`; },
        };
      },
      // 3×3・3×2 の成分を読む・成分の場所を記号で
      s2(r) {
        const [n, m] = r.pick([[3, 3], [3, 2]]), A = distinct(r, n, m, -9, 9);
        const L = r.pick(LET), l = L.toLowerCase(), i = r.int(1, n), j = r.int(1, m);
        if (turn(r, '01s2', 2)) {
          const v = A[i - 1][j - 1];
          return {
            q: `$${L}=${pm(A)}$ の成分 $${v}$ は何行め何列めにあるか。記号でも □`, a: `${i}行め${j}列め。$${l}_{${i}${j}}=${v}$`, key: kM(A) + `|${i}${j}`, boxw: '34mm',
            easy: `$${v}$ は上から${i}段めの、左から${j}つめ`, easyCheck: false,
            verify: p => { const B = matsOf(p.q)[0], v2 = M.evalMath(maths(p.q)[1].replace(/^.*=/, ''), {}), m2 = /(\d)行め(\d)列め/.exec(p.a); return (m2 && close(B[+m2[1] - 1][+m2[2] - 1], v2) && p.a.includes(`_{${m2[1]}${m2[2]}}`)) || '場所がちがう'; },
          };
        }
        return {
          q: `$${L}=${pm(A)}$ の $${l}_{${i}${j}}$`, a: `$${A[i - 1][j - 1]}$`, key: kM(A) + `|${i}${j}`,
          easy: `${i}行め $${vecH(A[i - 1])}$ の${j}つめ`, easyCheck: false,
          verify: p => { const B = matsOf(p.q)[0], [a, b] = elemQ(p.q); return close(numsOf(p.a)[0], B[a - 1][b - 1]) || `${a}行め${b}列めは ${B[a - 1][b - 1]}`; },
        };
      },
      // 時間わり（行が曜日、列が時間め）・個数の表（表）
      s3(r) {
        const t = turn(r, '01s3', 3);
        if (t < 2) {
          const i = r.int(1, 5), j = r.int(1, 6);
          if (i === j || (i === 3 && j === 2) || (i === 2 && j === 1)) return null;   // 3行め2列め・2行め1列めは教科書の例
          const lead = '行が曜日（1行めが月曜日）、列が時間め（1列めが1時間め）の時間わりを、行列 $T$ と見る。';
          if (t === 0) return {
            q: `${lead}$t_{${i}${j}}$ は、何曜日の何時間めのマスか □`, a: `${DAYS[i - 1]}曜日の${j}時間め`, key: `t${i}${j}`,
            easy: `行（${i}行め）が曜日で${DAYS[i - 1]}曜日、列（${j}列め）が時間めで${j}時間め`, easyCheck: false,
            verify: p => { const m = /t_\{(\d)(\d)\}/.exec(p.q); return p.a === `${DAYS[+m[1] - 1]}曜日の${m[2]}時間め` || 'マスがちがう'; },
          };
          return {
            q: `${lead}${DAYS[i - 1]}曜日の${j}時間めのマスを、$t_{ij}$ の形の記号で □`, a: `$t_{${i}${j}}$`, key: `t${i}${j}`, boxw: '14mm',
            easy: `曜日が行で${i}行め、時間めが列で${j}列め。行が先`, easyCheck: false,
            verify: p => { const m = /(.)曜日の(\d)時間めのマス/.exec(p.q); return p.a === `$t_{${DAYS.indexOf(m[1]) + 1}${m[2]}}$` || '記号がちがう'; },
          };
        }
        // 個数の表（表で出す。行がソラ・ミナ、列がりんご・みかん・バナナ）
        const FR = ['りんご', 'みかん', 'バナナ'], WHO = ['ソラ', 'ミナ'];
        const A = distinct(r, 2, 3, 1, 9), i = r.int(1, 2), j = r.int(1, 3);
        if (i === j) return null;
        return {
          q: `下の表の数だけを行列 $N$ にした。$n_{${i}${j}}$ は、だれが何を何個買ったことか □`,
          table: { head: ['個数（個）', ...FR], rows: WHO.map((w, k) => [w, ...A[k].map(String)]) },
          a: `${WHO[i - 1]}さんが${FR[j - 1]}を${A[i - 1][j - 1]}個`, key: kM(A) + `|${i}${j}`, boxw: '36mm',
          easy: `${i}行めは${WHO[i - 1]}さん、${j}列めは${FR[j - 1]}`, easyCheck: false,
          verify: p => { const m = /n_\{(\d)(\d)\}/.exec(p.q), row = p.table.rows[+m[1] - 1]; return p.a === `${row[0]}さんが${p.table.head[+m[2]]}を${row[+m[2]]}個` || '表の読み方がちがう'; },
        };
      },
      // わな：表計算のセルの番地（列の文字が先。2-18）
      trap(r) {
        const ABC = 'ABCDEF', c = r.int(1, 6), w = r.int(1, 9);
        if (c === w || (c === 2 && w === 3)) return null;   // B3 は目録の例
        if (turn(r, '01t', 2)) {
          return dest({ q: `表計算のセル ${ABC[c - 1]}${w} は、何行め何列めのセルか □`, a: `${w}行め${c}列め`, key: `c${c}${w}`,
            verify: p => { const m = /セル ([A-F])(\d)/.exec(p.q); return p.a === `${m[2]}行め${ABC.indexOf(m[1]) + 1}列め` || '番地の読み方がちがう'; } }, '7-01',
          `表計算の番地は列の文字が先（${ABC[c - 1]} は${c}列め）。行列の $a_{ij}$ とは順が反対（2-18）`);
        }
        return dest({ q: `行列 $A$ を表計算のセル A1 から入れた。$a_{${w}${c}}$ が入るセルの番地 □`, a: `${ABC[c - 1]}${w}`, key: `c${c}${w}`, boxw: '14mm',
          verify: p => { const m = /a_\{(\d)(\d)\}/.exec(p.q); return p.a === `${ABC[+m[2] - 1]}${m[1]}` || '番地がちがう'; } }, '7-01',
        `$a_{${w}${c}}$ は${w}行め${c}列め。表計算の番地は列の文字（${c}列めは ${ABC[c - 1]}）が先（2-18）`);
      },
    },
  });

  // ================================================================ 7-02
  // 左ページの例：3×2 の (6 -2; 1 8; 0 9)、成分6個、九九の表 9×9（O-2。大きさ 3×2・成分6個・9×9 は出さない）
  const SIZE = (n, m) => `${n}×${m} 行列`;
  M.add({
    id: '7-02', part: 1, chap: '7-1①', stars: 1,
    title: '大きさは「行の数×列の数」（行が先）。成分の数はそのかけ算、行と列が同じなら正方行列',
    mark: '「何行何列」「何×何行列」「成分は何個」。',
    futsu: ['$\\begin{pmatrix}6&-2\\\\1&8\\\\0&9\\end{pmatrix}$ の成分を、', '1つずつ指でおさえて数え、', '横とたてのどちらを先に言うか', '考えなおす。'],
    raku: ['横の段（行）が3つ、たての列が2つ', '→ 3×2 行列（2×3 ではない）', '成分は $3\\times2=6$ 個', '九九の表は 9×9 の正方行列'],
    why: '行列の大きさは、行の数を先に言う約束（$m$ 行 $n$ 列の行列が $m\\times n$ 行列。7-1①）。1つの行に成分が列の数だけ並ぶので、成分の数は $m\\times n$ 個。行の数と列の数が同じ行列を、正方行列という。',
    caution: '横のならびが行、たてのならびが列。たて長の行列（4×2 など）で、行と列を逆に言わない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '40mm', trap: '20mm' },
    fits(q) {
      if (/積|かけ|和|たし|たせ|セル|対称|転置|mathsf/.test(q)) return false;
      return /何行何列|何×何|成分は何個|成分の数|正方行列/.test(q);
    },
    steps: {
      // 数の行列を見て、何行何列か・成分は何個か
      s1(r) {
        const [n, m] = r.pick([[2, 3], [2, 4], [4, 2], [3, 3], [1, 3], [3, 1], [2, 2], [4, 3], [3, 4], [1, 4]]);
        const A = rmat(r, n, m, -9, 9);
        if (turn(r, '02s1', 2)) {
          if (n * m === 6) return null;
          return { q: `$${pm(A)}$ の成分は何個か □`, a: `${n * m}個`, key: kM(A), easy: `${n}行${m}列なので $${n}\\times${m}=${n * m}$`, easyCheck: false,
            verify: p => { const B = matsOf(p.q)[0]; return p.a === `${B.length * B[0].length}個` || '成分の数がちがう'; } };
        }
        if (n === 3 && m === 2) return null;
        return { q: `$${pm(A)}$ は何×何行列か □`, a: SIZE(n, m), key: kM(A), easy: `横の段（行）が${n}つ、たての列が${m}つ`, easyCheck: false,
          verify: p => { const B = matsOf(p.q)[0]; return p.a === SIZE(B.length, B[0].length) || '大きさがちがう'; } };
      },
      // 行列を書かずに：成分の数・大きさ・正方行列はどれ
      s2(r) {
        const t = turn(r, '02s2', 3), n = r.int(2, 6), m = r.int(2, 7);
        if (n === m && t < 2) return null;
        if (t === 0) {
          if (n * m === 6) return null;
          return { q: `${n}×${m} 行列の成分の数 □`, a: `${n * m}個`, key: `n${n},${m}`, easy: `$${n}\\times${m}=${n * m}$`, easyCheck: false,
            verify: p => { const k = /(\d)×(\d)/.exec(p.q); return p.a === `${+k[1] * +k[2]}個` || '数がちがう'; } };
        }
        if (t === 1) {
          if (n === 3 && m === 2) return null;
          return { q: `成分が${n * m}個で、行が${n}つある行列は、何×何行列か □`, a: SIZE(n, m), key: `n${n},${m}`, easy: `1つの行に $${n * m}\\div${n}=${m}$ 個ずつ並ぶので、列は${m}つ`, easyCheck: false,
            verify: p => { const k = /成分が(\d+)個で、行が(\d)つ/.exec(p.q); return p.a === SIZE(+k[2], +k[1] / +k[2]) || '大きさがちがう'; } };
        }
        const sq = r.int(2, 5), c = r.shuffle([[sq, sq], [sq, sq + 1], [sq + 1, 1]]), lab = ['ア', 'イ', 'ウ'];
        const ans = lab[c.findIndex(([a, b]) => a === b)];
        return { q: `次のうち、正方行列はどれか □　${c.map(([a, b], k) => `${lab[k]} ${a}×${b} 行列`).join('　')}`, a: ans, key: `sq${c.flat().join(',')}`, boxw: '12mm',
          easy: `行の数と列の数が同じなのは ${ans}`, easyCheck: false,
          verify: p => { const hit = [...p.q.matchAll(/([アイウ]) (\d)×(\d)/g)].filter(m => m[2] === m[3]).map(m => m[1]); return (hit.length === 1 && hit[0] === p.a) || '正方行列がちがう'; } };
      },
      // 表を行列にする（何人×何種類、時間わり、写真の画素）
      s3(r) {
        const t = turn(r, '02s3', 3);
        if (t === 0) {
          const n = r.int(3, 6), m = r.int(2, 5); if (n === m) return null;
          return { q: `${n}人が${m}種類の品物を買った個数を、行が人、列が品物の行列にした。何×何行列で、成分は何個か □`, a: `${SIZE(n, m)}で、成分は${n * m}個`, key: `n${n},${m}`,
            easy: `行は人の数で${n}、列は品物の数で${m}。成分は $${n}\\times${m}=${n * m}$ 個`, easyCheck: false,
            verify: p => { const k = /(\d)人が(\d)種類/.exec(p.q); return p.a === `${SIZE(+k[1], +k[2])}で、成分は${+k[1] * +k[2]}個` || 'ちがう'; } };
        }
        if (t === 1) {
          const n = r.pick([5, 6]), m = r.int(4, 7); if (n === m) return null;
          return { q: `月曜日から${n === 5 ? '金' : '土'}曜日までの、${m}時間めまでの時間わりを、行が曜日、列が時間めの行列にした。何×何行列で、成分は何個か □`, a: `${SIZE(n, m)}で、成分は${n * m}個`, key: `n${n},${m}`,
            easy: `行は曜日の数で${n}、列は時間めの数で${m}`, easyCheck: false,
            verify: p => { const k = /(.)曜日までの、(\d)時間め/.exec(p.q), d = k[1] === '金' ? 5 : 6; return p.a === `${SIZE(d, +k[2])}で、成分は${d * +k[2]}個` || 'ちがう'; } };
        }
        const h = r.pick([20, 30, 40]), w = r.pick([30, 40, 50, 60]); if (h === w) return null;
        return { q: `たてに${h}個、横に${w}個の画素が並ぶ白黒の写真を、画素の明るさの行列にした（行は横のならび）。何×何行列で、成分は何個か □`, a: `${SIZE(h, w)}で、成分は${h * w}個`, key: `n${h},${w}`,
          easy: `横のならび（行）は、たての画素の数だけ${h}本。1本に${w}個`, easyCheck: false,
          verify: p => { const k = /たてに(\d+)個、横に(\d+)個/.exec(p.q); return p.a === `${SIZE(+k[1], +k[2])}で、成分は${+k[1] * +k[2]}個` || 'ちがう'; } };
      },
      // わな：2つの行列の積の大きさ（7-05）
      trap(r) {
        const m = r.int(1, 4), n = r.int(2, 4), k = r.int(1, 4);
        if (m === n && n === k) return null;
        return dest({ q: `${m}×${n} 行列と ${n}×${k} 行列の積（この順）は、何×何行列か □`, a: SIZE(m, k), key: `p${m},${n},${k}`,
          verify: p => { const s = [...p.q.matchAll(/(\d)×(\d)/g)]; return p.a === SIZE(+s[0][1], +s[1][2]) || 'ちがう'; } }, '7-02',
        '1つの行列の大きさではなく、2つの行列の積の大きさ。外側の2つの数が答えの大きさ', ['7-05']);
      },
    },
  });

  // ================================================================ 7-03
  // 左ページの例：P=(3 1; 0 2)、Q=(1 4; 5 -1)（O-2。この2つの行列は出さない）
  const EX03 = [kM([[3, 1], [0, 2]]), kM([[1, 4], [5, -1]]), kM([[6, 2], [0, 4]])];
  const bad03 = (...As) => As.some(A => EX03.includes(kM(A)));
  const coefT = (k, L, first) => (k === 1 ? (first ? '' : '+') : k === -1 ? '-' : (k > 0 && !first ? '+' : '') + k) + L;   // 2P、-Q、+3Q
  const keySum = (A, B) => 's|' + [kM(A), kM(B)].sort().join('|');
  const keyDif = (A, B) => 'd|' + kM(A) + '|' + kM(B);
  // kP+mQ の式（$2P-Q$）を読んで計算しなおす
  function linEval(expr, D) {
    let out = null;
    for (const m of expr.replace(/\s/g, '').matchAll(/([+-]?\d*)([A-Z])/g)) {
      const k = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : +m[1], A = D[m[2]];
      out = out ? out.map((row, i) => row.map((v, j) => v + k * A[i][j])) : A.map(row => row.map(v => k * v));
    }
    return out;
  }
  M.add({
    id: '7-03', part: 1, chap: '7-1③ 例題2', stars: 1,
    title: '和・差は同じ場所どうし。$2P-Q$ は成分ごとに「$2p-q$」を1回で',
    mark: '2つの行列の和・差、「○倍－○倍」（$2P-Q$ など）。',
    futsu: ['$P=\\begin{pmatrix}3&1\\\\0&2\\end{pmatrix}$、$Q=\\begin{pmatrix}1&4\\\\5&-1\\end{pmatrix}$ の $2P-Q$ は、', '先に $2P=\\begin{pmatrix}6&2\\\\0&4\\end{pmatrix}$ を書いてから、', '$Q$ を成分ごとにひく。'],
    raku: ['同じ場所どうし「$2p-q$」を1回で：', '$6-1$、$2-4$、$0-5$、$4+1$', '$2P-Q=\\begin{pmatrix}5&-2\\\\-5&5\\end{pmatrix}$'],
    why: '和・差・実数倍は、4-11 のベクトルと同じく成分ごとに計算する（7-1③）。$2P-Q$ の (1, 1) 成分は $2p_{11}-q_{11}$ なので、$2P$ の行列を書かなくても、成分ごとに「2倍してひく」を1回ですませられる。',
    caution: 'ひく行列の成分が負なら、ひくとたすことになる（$4-(-1)=5$）。大きさのちがう行列は、たしたりひいたりできない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '22mm', s3: '22mm', trap: '24mm' }, boxh: '12mm',
    fits(q) {
      if (/かけられ|たせ|大きさ|mathsf/.test(q)) return false;
      if (sums(q).some(([A, B]) => A.length === B.length && A[0].length === B[0].length)) return true;
      if (/のとき/.test(q) && /^-?\d*[A-Z](?:[+-]\d*[A-Z])+$/.test(lastMath(q).replace(/\s/g, ''))) return true;
      return /2日間|多いか|となる \$X\$/.test(q);
    },
    steps: {
      // 2×2 の和・差
      s1(r) {
        const A = rmat(r, 2, 2, -5, 9), B = rmat(r, 2, 2, -5, 9), op = r.pick(['+', '-']);
        if (bad03(A, B) || zero(A) || zero(B)) return null;
        const C = op === '+' ? Madd(A, B) : Madd(A, B, 1, -1);
        return {
          q: `$${pm(A)}${op}${pm(B)}$`, a: `$${pm(C)}$`, key: op === '+' ? keySum(A, B) : keyDif(A, B), calc: calcM(C),
          easy: `同じ場所どうし：${A.flat().map((v, k) => `$${num(v)}${op}${par(B.flat()[k])}$`).join('、')}`, easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q), s = p.q.includes('}+\\begin') ? 1 : -1; return okM(ansM(p.a), U.map((row, i) => row.map((v, j) => v + s * V[i][j])), '和・差'); },
        };
      },
      // kP+mQ（P、Q は文字で）・2×3 の和・差
      s2(r) {
        if (turn(r, '03s2', 3) === 0) {
          const A = rmat(r, 2, 3, -5, 9), B = rmat(r, 2, 3, -5, 9), op = r.pick(['+', '-']);
          const C = op === '+' ? Madd(A, B) : Madd(A, B, 1, -1);
          return {
            q: `$${pm(A)}${op}${pm(B)}$`, a: `$${pm(C)}$`, key: op === '+' ? keySum(A, B) : keyDif(A, B), calc: calcM(C), boxw: '28mm',
            easy: '2×3 でも同じ場所どうし。6つの成分を1つずつ', easyCheck: false,
            verify: p => { const [U, V] = matsOf(p.q), s = p.q.includes('}+\\begin') ? 1 : -1; return okM(ansM(p.a), U.map((row, i) => row.map((v, j) => v + s * V[i][j])), '和・差'); },
          };
        }
        const A = rmat(r, 2, 2, -4, 6), B = rmat(r, 2, 2, -4, 6);
        const [k, m] = r.pick([[2, -1], [3, -1], [2, -3], [3, -2], [1, 2], [2, 1], [1, -2], [-1, 2], [3, 2], [2, 3]]);
        if (bad03(A, B) || zero(A) || zero(B)) return null;
        const C = Madd(A, B, k, m), ex = coefT(k, 'P', true) + coefT(m, 'Q', false);
        return {
          q: `$P=${pm(A)}$、$Q=${pm(B)}$ のとき、$${ex}$`, a: `$${pm(C)}$`, key: `l${k},${m}|${kM(A)}|${kM(B)}`, calc: calcM(C),
          easy: `成分ごとに「$${coefT(k, 'p', true)}${coefT(m, 'q', false)}$」：${A.flat().map((v, j) => `$${k === 1 ? num(v) : (k === -1 ? '-' : k + '\\times') + par(v)}${m < 0 ? '-' : '+'}${Math.abs(m) === 1 ? '' : Math.abs(m) + '\\times'}${par(B.flat()[j])}$`).join('、')}`, easyCheck: false,
          verify: p => okM(ansM(p.a), linEval(lastMath(p.q), defs(p.q)), lastMath(p.q)),
        };
      },
      // 土曜と日曜の個数・日曜は何個多いか・A+X=B の X
      s3(r) {
        const t = turn(r, '03s3', 3), A = rmat(r, 2, 2, 0, 6), B = rmat(r, 2, 2, 0, 6);
        if (bad03(A, B) || kM(A) === kM(B)) return null;
        const lead = '2人が土曜と日曜に買った個数の行列（行は人、列はりんご・みかん）は、';
        if (t === 0) {
          const C = Madd(A, B);
          return { q: `${lead}土曜 $${pm(A)}$、日曜 $${pm(B)}$。2日間で買った個数の行列 □`, a: `$${pm(C)}$`, key: keySum(A, B), calc: calcM(C),
            easy: '2日間の個数は、同じ人・同じくだものどうしをたす（和）', easyCheck: false,
            verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), U.map((row, i) => row.map((v, j) => v + V[i][j])), '和'); } };
        }
        if (t === 1) {
          const C = Madd(B, A, 1, -1);
          if (C.flat().every(v => v >= 0)) return null;   // 少なかった所（負の成分）もある組
          return { q: `${lead}土曜 $${pm(A)}$、日曜 $${pm(B)}$。日曜は土曜より何個多いか（少ないときは負）の行列 □`, a: `$${pm(C)}$`, key: keyDif(B, A), calc: calcM(C),
            easy: '日曜－土曜を、同じ場所どうしで', easyCheck: false,
            verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), V.map((row, i) => row.map((v, j) => v - U[i][j])), '差'); } };
        }
        const A2 = rmat(r, 2, 2, -5, 9), B2 = rmat(r, 2, 2, -5, 9); if (bad03(A2, B2)) return null;
        const C = Madd(B2, A2, 1, -1);
        return { q: `$A=${pm(A2)}$、$B=${pm(B2)}$ のとき、$A+X=B$ となる $X$`, a: `$${pm(C)}$`, key: keyDif(B2, A2), calc: calcM(C),
          easy: '数の式と同じく $X=B-A$。同じ場所どうしでひく', easyCheck: false,
          verify: p => { const D = defs(p.q); return okM(ansM(p.a), D.B.map((row, i) => row.map((v, j) => v - D.A[i][j])), 'B-A'); } };
      },
      // わな：間に記号のない2つの行列（積。7-10）
      trap(r) {
        const A = rmat(r, 2, 2, 1, 5), B = rmat(r, 2, 2, 1, 6), C = Mmul(A, B);
        return dest({ q: `$${pm(A)}${pm(B)}$`, a: `$${pm(C)}$`, key: 'p|' + kM(A) + '|' + kM(B), calc: calcM(C),
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } }, '7-03',
        '間に＋も－もないので、和ではなく積。行と列をなぞって「かけて、たす」', ['7-10']);
      },
    },
  });

  // ================================================================ 7-04
  // 左ページの例：1.1(120 100; 60 80)、(6 12; 18 24)=6(1 2; 3 4)、1/12(4 -2; -2 4)（O-2。これらの行列は出さない）
  const EX04 = [kM([[120, 100], [60, 80]]), kM([[6, 12], [18, 24]]), kM([[1, 2], [3, 4]]), kM([[4, -2], [-2, 4]])];
  const bad04 = (...As) => As.some(A => EX04.includes(kM(A)));
  const scaleN = (A, k) => fromM(X.scale(toM(A), Number.isInteger(k) ? k : F.fromDec(String(k))));
  // 「数×行列」の答え（$6\begin{pmatrix}…\end{pmatrix}$）の前の数
  const facOf = a => { const m = /^\$(-?[\d.]+)\\begin\{pmatrix\}/.exec(String(a)); return m ? +m[1] : null; };
  const KUKURI = 'を、成分の最大公約数をくくり出した形に □';
  M.add({
    id: '7-04', part: 1, chap: '7-1③・7-5①', stars: 1,
    title: '実数倍は全部の成分に同じ数をかける。共通の数は外にくくり出したまま計算する',
    mark: '$k\\begin{pmatrix}\\cdots\\end{pmatrix}$、成分がみな同じ数の倍数。',
    futsu: ['$1.1\\begin{pmatrix}120&100\\\\60&80\\end{pmatrix}$ を、', '$1.1\\times120$ のような', '小数のかけ算を4回して求める。'],
    raku: ['1.1倍は「1割たす」：$120+12=132$ など', '$\\begin{pmatrix}132&110\\\\66&88\\end{pmatrix}$', '$\\begin{pmatrix}6&12\\\\18&24\\end{pmatrix}=6\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$', '$\\frac{1}{12}\\begin{pmatrix}4&-2\\\\-2&4\\end{pmatrix}$ は $\\frac{1}{12}$ を外に出したまま'],
    why: '行列の実数倍は、すべての成分に同じ数をかけること（7-1③）。逆に、成分がみな同じ数の倍数なら、その数を外に出して「数×行列」と書ける。外に出したままにすると中の数が小さくなり、逆行列（7-5①）などの計算が楽になる。',
    caution: 'かけるのは全部の成分（1つの行や列だけではない）。くくり出す数は、どの成分もわりきれる数にする。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '26mm', s3: '22mm', trap: '30mm' }, boxh: '12mm',
    fits(q) {
      if (/かけられ|たせ|mathsf|対称/.test(q)) return false;
      if (/くくり出/.test(q)) {
        const A = matsOf(q)[0]; if (!A || A.flat().some(v => v == null)) return false;
        return A.flat().some(v => !Number.isInteger(v)) || gcdAll(A) > 1;
      }
      if (shapes(q).some(({ s, ms }) => ms.length === 1 && /^(-?[\d.]+|-|\\frac\{1\}\{\d+\}) ?M0$/.test(s))) return true;
      return /倍|割引|割上げ/.test(q) && matsOf(q).length === 1;
    },
    steps: {
      // 整数倍・0.5倍・1.1倍
      s1(r) {
        const k = r.pick([2, 3, 4, 5, -1, -2, -3, 0.5, 1.1]);
        let A;
        if (k === 0.5) A = rmat(r, 2, 2, -4, 9).map(row => row.map(v => 2 * v));
        else if (k === 1.1) A = rmat(r, 2, 2, 2, 15).map(row => row.map(v => 10 * v));
        else A = rmat(r, 2, 2, -5, 9);
        if (bad04(A) || zero(A)) return null;
        const C = scaleN(A, k);
        return {
          q: `$${k === -1 ? '-' : num(k)}${pm(A)}$`, a: `$${pm(C)}$`, key: `k${k}|${kM(A)}`, calc: calcM(C),
          easy: k === 1.1 ? 'すべての成分を1割ふやす（$x+0.1x$）' : k === 0.5 ? 'すべての成分を半分に' : `すべての成分に $${num(k)}$ をかける`, easyCheck: false,
          verify: p => { const m = /^\$(-?[\d.]*)\\begin/.exec(p.q), kk = m[1] === '-' ? -1 : +m[1]; return okM(ansM(p.a), matsOf(p.q)[0].map(row => row.map(v => kk * v)), '実数倍'); },
        };
      },
      // くくり出す・1/k×行列（成分が k の倍数）
      s2(r) {
        if (turn(r, '04s2', 2)) {
          const g = r.int(2, 9), B = rmat(r, 2, 2, -5, 9);
          if (gcdAll(B) !== 1 || B.flat().filter(v => v === 0).length > 1) return null;
          const A = scaleN(B, g); if (bad04(A, B)) return null;
          return {
            q: `$${pm(A)}$ ${KUKURI}`, a: `$${g}${pm(B)}$`, key: `g|${kM(A)}`, calc: calcM(A),
            easy: `どの成分も $${g}$ でわりきれる：$${g}${pm(B)}$`, easyCheck: false,
            verify: p => { const A2 = matsOf(p.q)[0], f = facOf(p.a), B2 = matsOf(p.a)[0]; return (f === gcdAll(A2) && gcdAll(B2) === 1 && same(ansM(p.a), A2)) || 'くくり出しがちがう'; },
          };
        }
        const k = r.int(2, 5), B = rmat(r, 2, 2, -4, 6); if (zero(B)) return null;
        const A = scaleN(B, k); if (bad04(A, B)) return null;
        return {
          q: `$\\frac{1}{${k}}${pm(A)}$`, a: `$${pm(B)}$`, key: `f${k}|${kM(A)}`, calc: calcM(B),
          easy: `すべての成分を $${k}$ でわる`, easyCheck: false,
          verify: p => { const m = /\\frac\{1\}\{(\d+)\}/.exec(p.q); return okM(ansM(p.a), matsOf(p.q)[0].map(row => row.map(v => v / +m[1])), '1/k 倍'); },
        };
      },
      // 値段の2割引き・写真を明るく・小数をくくり出す
      s3(r) {
        const t = turn(r, '04s3', 3);
        if (t === 0) {
          const A = rmat(r, 2, 2, 1, 6).map(row => row.map(v => 50 * v)); if (bad04(A)) return null;
          const C = scaleN(A, 0.8);
          return { q: `値段の行列 $${pm(A)}$（円）の値段を、すべて2割引きにした行列 □`, a: `$${pm(C)}$`, key: `w|${kM(A)}`, calc: calcM(C),
            easy: '2割引きは0.8倍。すべての成分を0.8倍（$50$ 円ごとに $40$ 円）', easyCheck: false,
            verify: p => okM(ansM(p.a), matsOf(p.q)[0].map(row => row.map(v => v * 0.8)), '0.8倍') };
        }
        if (t === 1) {
          const A = rmat(r, 2, 2, 1, 8).map(row => row.map(v => 20 * v)), C = scaleN(A, 1.5);
          return { q: `白黒の写真の4つの画素の明るさ（0〜255）の行列 $${pm(A)}$ を、1.5倍明るくした行列 □`, a: `$${pm(C)}$`, key: `b|${kM(A)}`, calc: calcM(C),
            easy: 'すべての成分を1.5倍（半分をたす）。どれも255をこえない', easyCheck: false,
            verify: p => okM(ansM(p.a), matsOf(p.q)[0].map(row => row.map(v => v * 1.5)), '1.5倍') };
        }
        const g = r.pick([0.5, 0.1]), B = rmat(r, 2, 2, -5, 9);
        if (gcdAll(B) !== 1 || B.flat().filter(v => v === 0).length > 1) return null;
        const A = scaleN(B, g); if (A.flat().every(Number.isInteger)) return null;
        return { q: `$${pm(A)}$ を、$${g}$ をくくり出した形に □`, a: `$${g}${pm(B)}$`, key: `g|${kM(A)}`, calc: calcM(A),
          easy: `どの成分も $${g}$ の何倍かで書ける：$${g}${pm(B)}$`, easyCheck: false,
          verify: p => { const f = facOf(p.a); return (close(f, M.evalMath(maths(p.q)[1], {})) && matsOf(p.a)[0].flat().every(Number.isInteger) && same(ansM(p.a), matsOf(p.q)[0])) || 'くくり出しがちがう'; } };
      },
      // わな：1つの成分だけが倍数でない（共通の数がない）
      trap(r) {
        const g = r.int(2, 9), B = rmat(r, 2, 2, 1, 9), i = r.int(0, 1), j = r.int(0, 1);
        const A = scaleN(B, g); A[i][j] += r.pick([1, -1]);
        if (gcdAll(A) !== 1 || bad04(A)) return null;
        const v = A[i][j];
        return dest({ q: `$${pm(A)}$ ${KUKURI}`, a: '共通な数はない（くくり出せない）', key: `g|${kM(A)}`,
          verify: p => gcdAll(matsOf(p.q)[0]) === 1 || '共通な数がある' }, '7-04',
        `ほかの成分は $${g}$ の倍数だが、$${v}$ だけは $${g}$ でわりきれない。どの成分もわりきれる数（1より大きい）はない`);
      },
    },
  });

  // ================================================================ 7-05
  // 左ページの例：(2×3)(3×2)、(3×2)(3×2)、(4×2)(2×3)、2×2 と2×3 の和（O-2。この組は出さない）
  const EX05 = ['2,3,3,2', '3,2,3,2', '4,2,2,3'];
  const canTxt = (m, n, p, q) => (n === p ? `かけられて、${SIZE(m, q)}` : 'かけられない');
  const sz = s => [...String(s).matchAll(/(\d)×(\d)/g)].map(m => [+m[1], +m[2]]);
  M.add({
    id: '7-05', part: 1, chap: '7-1③⑥ 例題6', stars: 1,
    title: 'かけられるかは「内側の2つの数」、答えの大きさは「外側の2つの数」（たせるのは同じ大きさどうしだけ）',
    mark: '「かけられますか」「答えの大きさ」「たせますか」。',
    futsu: ['2×3 行列と3×2 行列の積を、', '数を入れた行列で', '実際に行と列をなぞって計算し、', 'かけられるか、何行何列になるかを見る。'],
    raku: ['$(2\\times\\mathbf{3})(\\mathbf{3}\\times2)$ → 内側が同じ → 2×2', '$(3\\times2)(3\\times2)$ → 内側が2と3 → かけられない', '$(4\\times2)(2\\times3)$ → 4×3', '2×2 と2×3 の和 → たせない'],
    why: '積 $AB$ の成分は、$A$ の1行と $B$ の1列をなぞって作る（7-1⑥）。$A$ の1行の数の個数（$A$ の列の数）と、$B$ の1列の数の個数（$B$ の行の数）が同じでないと、相手のいない数が出る。答えは $A$ の行の数だけ行があり、$B$ の列の数だけ列がある。',
    caution: 'かける順を入れかえると、かけられるかどうかも変わることがある。和・差は、大きさがまったく同じときだけ（内側・外側ではない）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '16mm' },
    fits(q) {
      if (/かけられ|たせる|たせるか/.test(q)) return true;
      if (/積/.test(q) && /\d×\d/.test(q) && /何×何|大きさ/.test(q)) return true;
      if (/何×何行列|大きさ/.test(q) && !/成分/.test(q) && (/積/.test(q) || /\$[A-Z]{2,3}\$/.test(q))) return true;
      if (prods(q).some(([A, B]) => !canMul(A, B))) return true;
      return sums(q).some(([A, B]) => A.length !== B.length || A[0].length !== B[0].length);
    },
    steps: {
      // 大きさだけで：かけられるか、答えの大きさ
      s1(r) {
        const m = r.int(1, 4), n = r.int(2, 4), q = r.int(1, 4), p = r.chance(0.65) ? n : r.intNot(1, 4, v => v === n);
        if (EX05.includes([m, n, p, q].join(',')) || p * q === 1) return null;
        return { q: `${m}×${n} 行列と ${p}×${q} 行列の積（この順）は、かけられるか。かけられるなら、答えの大きさも □`, a: canTxt(m, n, p, q), key: `m${m},${n},${p},${q}`,
          easy: n === p ? `内側が ${n} と ${p} で同じ。外側の ${m} と ${q} で ${m}×${q}` : `内側が ${n} と ${p} でちがう`, easyCheck: false,
          verify: p0 => { const [[a, b], [c, d]] = sz(p0.q); return p0.a === canTxt(a, b, c, d) || 'ちがう'; } };
      },
      // 数の行列の積・和
      s2(r) {
        if (turn(r, '05s2', 2)) {
          const [m, n] = [r.int(1, 3), r.int(1, 3)], p = r.chance(0.5) ? n : r.intNot(1, 3, v => v === n), q = r.int(1, 3);
          if (m * n === 1 || p * q === 1 || EX05.includes([m, n, p, q].join(','))) return null;
          const A = rmat(r, m, n, 0, 5), B = rmat(r, p, q, 0, 5);
          return { q: `$${pm(A)}${pm(B)}$ は、かけられるか。かけられるなら、答えの大きさも □`, a: canTxt(m, n, p, q), key: `m${m},${n},${p},${q}|${kM(A)}|${kM(B)}`,
            easy: `$(${m}\\times${n})(${p}\\times${q})$。` + (n === p ? `内側が同じで、答えは ${m}×${q}` : '内側がちがう'), easyCheck: false,
            verify: p0 => { const [U, V] = matsOf(p0.q); return p0.a === canTxt(U.length, U[0].length, V.length, V[0].length) || 'ちがう'; } };
        }
        const m = r.int(1, 4), n = r.int(1, 4), same0 = r.chance(0.5), p = same0 ? m : r.int(1, 4), q = same0 ? n : r.int(1, 4);
        if ((m === 2 && n === 2 && p === 2 && q === 3) || (m === 2 && n === 3 && p === 2 && q === 2) || m * n === 1 || p * q === 1) return null;
        const ok = m === p && n === q;
        return { q: `${m}×${n} 行列と ${p}×${q} 行列の和は、たせるか。たせるなら、答えの大きさも □`, a: ok ? `たせて、${SIZE(m, n)}` : 'たせない', key: `s${m},${n},${p},${q}`,
          easy: ok ? '大きさが同じなので、同じ場所どうしでたせる' : '大きさがちがうので、たす相手のない成分が出る', easyCheck: false,
          verify: p0 => { const [[a, b], [c, d]] = sz(p0.q); return p0.a === (a === c && b === d ? `たせて、${SIZE(a, b)}` : 'たせない') || 'ちがう'; } };
      },
      // AB と BA・3つの積・買い物の行列の積
      s3(r) {
        const t = turn(r, '05s3', 3);
        if (t === 0) {
          const m = r.int(1, 4), n = r.int(1, 4), p = r.intNot(1, 4, v => v === m);
          if (m * n === 1 || n * p === 1) return null;
          return { q: `$A$ は ${m}×${n} 行列、$B$ は ${n}×${p} 行列。$AB$ と $BA$ のうち、かけられるのはどちらか。その大きさも □`, a: `$AB$ だけで、${SIZE(m, p)}`, key: `m${m},${n},${n},${p}`,
            easy: `$AB$ は $(${m}\\times${n})(${n}\\times${p})$ で内側が同じ。$BA$ は $(${n}\\times${p})(${m}\\times${n})$ で内側が ${p} と ${m}`, easyCheck: false,
            verify: p0 => { const [[a, b], [c, d]] = sz(p0.q); return (b === c && d !== a && p0.a === `$AB$ だけで、${SIZE(a, d)}`) || 'ちがう'; } };
        }
        if (t === 1) {
          const a = r.int(1, 4), b = r.int(2, 4), c = r.int(2, 4), d = r.int(1, 4);
          return { q: `$A$ は ${a}×${b} 行列、$B$ は ${b}×${c} 行列、$C$ は ${c}×${d} 行列のとき、$ABC$ の大きさ □`, a: SIZE(a, d), key: `c${a},${b},${c},${d}`, boxw: '20mm',
            easy: `$AB$ は ${a}×${c}、それに $C$ をかけて ${a}×${d}（いちばん外側の2つ）`, easyCheck: false,
            verify: p0 => { const s = sz(p0.q); return (s[0][1] === s[1][0] && s[1][1] === s[2][0] && p0.a === SIZE(s[0][0], s[2][1])) || 'ちがう'; } };
        }
        const n = r.int(2, 6), k = r.int(2, 5), s = r.int(2, 3);
        return { q: `${n}人が${k}種類の品物を買った個数の行列 $N$（行が人、列が品物）と、${k}種類の品物の${s}つの店での値段の行列 $P$（行が品物、列が店）がある。積 $NP$ は何×何行列か □`, a: SIZE(n, s), key: `m${n},${k},${k},${s}`, boxw: '20mm',
          easy: `$N$ は ${n}×${k}、$P$ は ${k}×${s}。内側の ${k} がそろい、答えは ${n}×${s}（人×店）`, easyCheck: false,
          verify: p0 => { const m = /(\d)人が(\d)種類の品物を買った.*?(\d)つの店/.exec(p0.q); return p0.a === SIZE(+m[1], +m[3]) || 'ちがう'; } };
      },
      // わな：1つの行列の成分の数（7-02）
      trap(r) {
        const m = r.int(2, 6), n = r.int(2, 6);
        if ([[2, 3], [3, 2], [2, 2], [4, 2], [4, 3]].some(([a, b]) => a === m && b === n)) return null;
        return dest({ q: `${m}×${n} 行列の成分は何個か □`, a: `${m * n}個`, key: `n${m},${n}`,
          verify: p => { const [[a, b]] = sz(p.q); return p.a === `${a * b}個` || 'ちがう'; } }, '7-05',
        `積ではなく、1つの行列の成分の数。$${m}\\times${n}=${m * n}$`, ['7-02']);
      },
    },
  });

  // ================================================================ 7-06
  // 左ページの例：(3 1; 2 4)(5; 2)、(1 -2; 3 0)(4; -1)（O-2。この組は出さない）
  const EX06 = [kM([[3, 1], [2, 4]]) + '|5,2', kM([[1, -2], [3, 0]]) + '|4,-1'];
  const bad06 = (A, v) => EX06.includes(kM(A) + '|' + v) || [kM([[3, 1], [2, 4]]), kM([[1, -2], [3, 0]])].includes(kM(A)) || ['5,2', '4,-1'].includes(String(v));
  // 1行ずつの「かけて、たす」（0の項はとばす。2つめからの負の係数は －）
  const dotTxt = (row, v) => { const t = row.map((a, k) => [a, k]).filter(([a]) => a !== 0).map(([a, k], j) => (j === 0 ? num(a) : (a < 0 ? '-' + num(-a) : '+' + num(a))) + `\\times${par(v[k])}`).join(''); return t || '0'; };
  const rowsTxt = (A, v) => A.map((row, i) => `${i + 1}行め：$${dotTxt(row, v)}=${num(row.reduce((s, a, k) => s + a * v[k], 0))}$`).join('、');
  const vecOf = q => { const m = /\\vec x=\(([^)]*)\)/.exec(q); return m ? m[1].split(',').map(t => M.evalMath(t.replace(/\\ /g, '').trim(), {})) : null; };
  M.add({
    id: '7-06', part: 1, chap: '7-1④ 例題3・7-2②', stars: 1,
    title: '行列×ベクトルは行ごとに「かけて、たす」（行とベクトルの内積）。0の項はとばす',
    mark: '行列の右に、たてのベクトル。',
    futsu: ['$\\begin{pmatrix}3&1\\\\2&4\\end{pmatrix}\\begin{pmatrix}5\\\\2\\end{pmatrix}$ を、文字の式', '$\\begin{pmatrix}ax+by\\\\cx+dy\\end{pmatrix}$ に $a=3$、$b=1$、…と', '6つの数を入れて計算する。'],
    raku: ['1行め：$15+2=17$、2行め：$10+8=18$', '$\\begin{pmatrix}1&-2\\\\3&0\\end{pmatrix}\\begin{pmatrix}4\\\\-1\\end{pmatrix}$ → $4+2=6$、$12$', '（$0\\times(-1)$ は書かない）'],
    why: '答えの $i$ 番めの成分は、行列の $i$ 行めとベクトルの「同じ番号どうしの積の和」（内積。7-1④）。1行ずつ、左手で行を左から右へ、右手でベクトルを上から下へなぞる。0の成分の積は0なので、とばしてよい。',
    caution: '負の数どうしの積は正（$(-2)\\times(-1)=2$）。答えのベクトルの成分の数は、行列の行の数と同じ。',
    counts: { s1: 6, s2: 2, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '12mm', s3: '14mm', trap: '24mm' }, boxh: { s1: '12mm', s2: '16mm', s3: '12mm', trap: '8mm' },
    fits(q) {
      if (/かけられ|大きさ/.test(q)) return false;
      if (prods(q).some(([A, B]) => B[0].length === 1 && B.length >= 2 && A.length >= 2 && canMul(A, B))) return true;
      return /A\\vec x/.test(q) && !!vecOf(q);
    },
    steps: {
      // 2×2 × 2
      s1(r) {
        const A = rmat(r, 2, 2, -4, 6), v = [nz(r, -4, 6), r.int(-4, 6)];
        if (zero(A) || bad06(A, v)) return null;
        const C = Mmul(A, col(v));
        return { q: `$${pm(A)}${pm(col(v))}$`, a: `$${pm(C)}$`, key: kM(A) + '|' + v, calc: calcM(C), easy: rowsTxt(A, v), easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // 3×2 × 2・2×3 × 3（0の成分あり）
      s2(r) {
        const [n, m] = turn(r, '06s2', 2) ? [3, 2] : [2, 3];
        const A = rmat(r, n, m, -3, 5), v = Array.from({ length: m }, () => r.int(-3, 5));
        if (!A.flat().includes(0) || v.every(x => x === 0) || A.some(row => row.every(x => x === 0))) return null;
        const C = Mmul(A, col(v));
        return { q: `$${pm(A)}${pm(col(v))}$`, a: `$${pm(C)}$`, key: kM(A) + '|' + v, calc: calcM(C), easy: rowsTxt(A, v), easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // ベクトルを横に書いた形・1つの成分だけ
      s3(r) {
        const A = rmat(r, 2, 2, -4, 6), v = [nz(r, -4, 6), nz(r, -4, 6)];
        if (A[0].every(x => x === 0) || A[1].every(x => x === 0) || (A[0][0] === 0 && A[1][0] === 0) || (A[0][1] === 0 && A[1][1] === 0) || bad06(A, v)) return null;
        const C = Mmul(A, col(v));
        if (turn(r, '06s3', 2)) {
          return { q: `$A=${pm(A)}$、$\\vec x=${vecH(v)}$ のとき、$A\\vec x$ をたてのベクトルで □`, a: `$${pm(C)}$`, key: kM(A) + '|' + v, calc: calcM(C),
            easy: `$\\vec x$ をたてに書いて、${rowsTxt(A, v)}`, easyCheck: false,
            verify: p => okM(ansM(p.a), mul(defs(p.q).A, col(vecOf(p.q))), 'A x') };
        }
        const i = r.int(1, 2);
        return { q: `$A=${pm(A)}$、$\\vec x=${vecH(v)}$ のとき、$A\\vec x$ の${i}番めの成分 □`, a: `$${num(C[i - 1][0])}$`, key: kM(A) + '|' + v, boxw: '12mm', boxh: '8mm',
          easy: `${i}行めだけ：$${dotTxt(A[i - 1], v)}=${num(C[i - 1][0])}$`, easyCheck: false,
          verify: p => { const k = +/(\d)番め/.exec(p.q)[1], w = mul(defs(p.q).A, col(vecOf(p.q))); return close(numsOf(p.a)[0], w[k - 1][0]) || 'ちがう'; } };
      },
      // わな：ベクトルが左（かけられない。7-05）
      trap(r) {
        const A = rmat(r, 2, 2, -3, 6), v = [nz(r, 1, 6), r.int(-3, 6)];
        if (zero(A)) return null;
        return dest({ q: `$${pm(col(v))}${pm(A)}$`, a: 'かけられない', key: kM(A) + '|' + v + '|L',
          verify: p => { const [U, V] = matsOf(p.q); return (!canMul(U, V) && p.a === 'かけられない') || 'かけられる'; } }, '7-06',
        'ベクトルが左にある。$(2\\times1)(2\\times2)$ は内側の1と2がちがうので、かけられない（まちがえやすいところ⑥）', ['7-05']);
      },
    },
  });

  // ================================================================ 7-07
  // 左ページの例：3人 (2,3)(2,1)(5,5)、りんご120円・みかん60円、スーパー100円・80円（O-2。この値段の組は出さない）
  const badPrice = (p, q) => (p === 120 && q === 60) || (p === 100 && q === 80);
  const NUT = [[156, 2.5], [142, 12.2]];   // 100 g あたりの栄養（ごはん・卵。教科書 7-1 の物理・工学）
  const numsIn = (s, re) => [...String(s).matchAll(re)].map(m => +m[1]);
  M.add({
    id: '7-07', part: 1, chap: '7-1④⑥ 例題4', stars: 1,
    title: '合計は「個数の行列（行が人、列が品物）×値段のたてのベクトル」。店が2つなら値段を2列にして1回で',
    mark: '何人分・何店分の買い物の合計。',
    futsu: ['3人の合計を、1人ずつ', '$2\\times120+3\\times60$、…と', '別々の式で計算する。', '店が2つなら、それを2回くり返す。'],
    raku: ['$\\begin{pmatrix}2&3\\\\2&1\\\\5&5\\end{pmatrix}\\begin{pmatrix}120\\\\60\\end{pmatrix}=\\begin{pmatrix}420\\\\300\\\\900\\end{pmatrix}$', '店が2つなら、値段を2列にして1回で：', '$\\begin{pmatrix}2&3\\\\2&1\\end{pmatrix}\\begin{pmatrix}120&100\\\\60&80\\end{pmatrix}$', '$=\\begin{pmatrix}420&440\\\\300&280\\end{pmatrix}$'],
    why: '1人の合計は「個数×値段」の和で、個数の行と値段の列の内積（7-1④）。人を行に並べれば、行列×ベクトルで全員分が1回で出る。店ごとの値段を列に並べた行列をかけると、人×店の合計の表が1回の積で出る（7-1⑥）。',
    caution: '個数の行列は「行が人、列が品物」、値段は「行が品物」のたてに並べる。値段を横に並べると、かけられない（まちがえやすいところ③）。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '24mm', trap: '40mm' }, boxh: { s1: '12mm', s2: '16mm', s3: '12mm', trap: '8mm' },
    fits(q) {
      if (/値段を求め|かけられ/.test(q)) return false;
      return (/合計/.test(q) && /円/.test(q) && /個/.test(q)) || (/エネルギー/.test(q) && /たんぱく質/.test(q));
    },
    steps: {
      // 2人・りんごとみかん・1つの店
      s1(r) {
        const N = [[r.int(1, 6), r.int(1, 6)], [r.int(1, 6), r.int(1, 6)]], p = 10 * r.int(10, 15), q = 10 * r.int(4, 9);
        if (badPrice(p, q)) return null;
        const C = Mmul(N, col([p, q]));
        return {
          q: `ソラさんはりんご${N[0][0]}個とみかん${N[0][1]}個、ミナさんはりんご${N[1][0]}個とみかん${N[1][1]}個を買う。りんご1個${p}円、みかん1個${q}円のとき、2人の合計（円）を行列×ベクトルで □`,
          a: `$${pm(C)}$`, key: `${kM(N)}|${p},${q}`, calc: calcM(C),
          easy: `個数の行列×値段のベクトル。${rowsTxt(N, [p, q])}`, easyCheck: false,
          verify: p0 => { const c = numsIn(p0.q, /(\d+)個/g), pr = numsIn(p0.q, /(\d+)円/g); return okM(ansM(p0.a), [[c[0] * pr[0] + c[1] * pr[1]], [c[2] * pr[0] + c[3] * pr[1]]], '合計'); },
        };
      },
      // 3人・2つの品物、2人・3つの品物
      s2(r) {
        if (turn(r, '07s2', 2)) {
          const N = [0, 1, 2].map(() => [r.int(0, 6), r.int(0, 6)]), p = 10 * r.int(10, 15), q = 10 * r.int(4, 9);
          if (badPrice(p, q) || N.some(row => row[0] + row[1] === 0)) return null;
          const C = Mmul(N, col([p, q]));
          return {
            q: `3人が、りんごとみかんを、1人めから順に（${N[0][0]}個、${N[0][1]}個）、（${N[1][0]}個、${N[1][1]}個）、（${N[2][0]}個、${N[2][1]}個）買う。りんご1個${p}円、みかん1個${q}円のとき、3人の合計（円）を行列×ベクトルで □`,
            a: `$${pm(C)}$`, key: `${kM(N)}|${p},${q}`, calc: calcM(C),
            easy: `個数の行列×値段のベクトル。${rowsTxt(N, [p, q])}`, easyCheck: false,
            verify: p0 => { const c = numsIn(p0.q, /(\d+)個/g), pr = numsIn(p0.q, /(\d+)円/g); return okM(ansM(p0.a), [0, 1, 2].map(i => [c[2 * i] * pr[0] + c[2 * i + 1] * pr[1]]), '合計'); },
          };
        }
        const N = [[r.int(1, 5), r.int(1, 5), r.int(1, 5)], [r.int(1, 5), r.int(1, 5), r.int(1, 5)]], pr = [10 * r.int(10, 15), 10 * r.int(4, 9), 10 * r.int(2, 6)];
        if (badPrice(pr[0], pr[1])) return null;
        const C = Mmul(N, col(pr));
        return {
          q: `ソラさんはりんご${N[0][0]}個・みかん${N[0][1]}個・バナナ${N[0][2]}本、ミナさんはりんご${N[1][0]}個・みかん${N[1][1]}個・バナナ${N[1][2]}本を買う。りんご1個${pr[0]}円、みかん1個${pr[1]}円、バナナ1本${pr[2]}円のとき、2人の合計（円）を行列×ベクトルで □`,
          a: `$${pm(C)}$`, key: `${kM(N)}|${pr}`, calc: calcM(C), boxh: '12mm',
          easy: `個数の行列×値段のベクトル。${rowsTxt(N, pr)}`, easyCheck: false,
          verify: p0 => { const c = numsIn(p0.q, /(\d+)[個本]・?/g), v = numsIn(p0.q, /(\d+)円/g); return okM(ansM(p0.a), [[c[0] * v[0] + c[1] * v[1] + c[2] * v[2]], [c[3] * v[0] + c[4] * v[1] + c[5] * v[2]]], '合計'); },
        };
      },
      // 店が2つ（行列×行列）・食事の栄養
      s3(r) {
        if (turn(r, '07s3', 2)) {
          const N = [[r.int(1, 5), r.int(1, 5)], [r.int(1, 5), r.int(1, 5)]], P = [[10 * r.int(10, 15), 10 * r.int(8, 14)], [10 * r.int(4, 9), 10 * r.int(4, 9)]];
          if (badPrice(P[0][0], P[1][0]) || badPrice(P[0][1], P[1][1]) || P[0][0] === P[0][1]) return null;
          const C = Mmul(N, P);
          return {
            q: `ソラさんはりんご${N[0][0]}個とみかん${N[0][1]}個、ミナさんはりんご${N[1][0]}個とみかん${N[1][1]}個を買う。くだもの屋ではりんご1個${P[0][0]}円・みかん1個${P[1][0]}円、スーパーではりんご1個${P[0][1]}円・みかん1個${P[1][1]}円。2人がそれぞれの店で買う4つの合計（円）を、1回の積で行列（行が人、列が店）に □`,
            a: `$${pm(C)}$`, key: `${kM(N)}|${kM(P)}`, calc: calcM(C),
            easy: `値段を2列に並べた行列との積。${prodTxt(N, P, C)}`, easyCheck: false,
            verify: p0 => { const c = numsIn(p0.q, /(\d+)個[とを、]/g), v = numsIn(p0.q, /(\d+)円/g); const N2 = [[c[0], c[1]], [c[2], c[3]]], P2 = [[v[0], v[2]], [v[1], v[3]]]; return okM(ansM(p0.a), mul(N2, P2), '合計'); },
          };
        }
        const Q = [[r.pick([0.5, 1, 1.5, 2]), r.pick([0.5, 1])], [r.pick([1, 1.5, 2, 2.5]), r.pick([0.5, 1, 1.5])]];
        if (kM(Q) === kM([[1.5, 0.5], [2, 1]]) || kM(Q) === kM([[2, 0.5], [1.5, 1]])) return null;   // 教科書の例題・章末問題の組
        const C = Mmul(Q, NUT), g = v => `${num(v * 100)}\\,\\mathrm{g}`;
        return {
          q: `朝食にごはん $${g(Q[0][0])}$ と卵 $${g(Q[0][1])}$、昼食にごはん $${g(Q[1][0])}$ と卵 $${g(Q[1][1])}$ を食べた。$100\\,\\mathrm{g}$ あたり、ごはんは $156\\,\\mathrm{kcal}$・たんぱく質 $2.5\\,\\mathrm{g}$、卵は $142\\,\\mathrm{kcal}$・$12.2\\,\\mathrm{g}$。食事ごとのエネルギー（kcal）とたんぱく質（g）の行列（行が食事）を、積で □`,
          a: `$${pm(C)}$`, key: `n|${kM(Q)}`, calc: calcM(C), boxw: '28mm',
          easy: `食べた量の行列×栄養の行列。${prodTxt(Q, NUT, C)}`, easyCheck: false,
          verify: p0 => { const v = [...p0.q.matchAll(/ごはん \$(\d+)\\,\\mathrm\{g\}\$ と卵 \$(\d+)\\,/g)].map(m => [+m[1] / 100, +m[2] / 100]); return okM(ansM(p0.a), mul(v, [[156, 2.5], [142, 12.2]]), '栄養'); },
        };
      },
      // わな：合計から値段を求める（連立方程式。7-40）
      trap(r) {
        const N = [[r.int(1, 5), r.int(1, 5)], [r.int(1, 5), r.int(1, 5)]], p = 10 * r.int(10, 15), q = 10 * r.int(4, 9);
        if (N[0][0] * N[1][1] - N[0][1] * N[1][0] === 0 || badPrice(p, q)) return null;
        const T = Mmul(N, col([p, q]));
        return dest({ q: `ソラさんはりんご${N[0][0]}個とみかん${N[0][1]}個で${T[0][0]}円、ミナさんはりんご${N[1][0]}個とみかん${N[1][1]}個で${T[1][0]}円はらった。りんご1個とみかん1個の値段を求めよう □`, a: `りんご${p}円、みかん${q}円`, key: `t|${kM(N)}|${p},${q}`,
          verify: p0 => { const c = numsIn(p0.q, /(\d+)個/g), pr = numsIn(p0.a, /(\d+)円/g), tt = numsIn(p0.q, /(\d+)円/g); return (c[0] * pr[0] + c[1] * pr[1] === tt[0] && c[2] * pr[0] + c[3] * pr[1] === tt[1]) || '合計に合わない'; } }, '7-07',
        '合計から値段を求めるのは逆向きで、$N\\vec x=\\vec b$ の連立方程式を解くこと', ['7-40']);
      },
    },
  });

  // ================================================================ 7-08
  // 左ページの例：3x+2y=12、y=4x-5（行 (3,2)(-4,1)、右辺 12・-5）、x+2z=7（O-2。この式は出さない）
  const VARS = ['x', 'y', 'z'];
  const term = (k, v, first) => (k === 0 ? '' : (k === 1 ? (first ? '' : '+') : k === -1 ? '-' : (k > 0 && !first ? '+' : '') + k) + v);
  const cst = c => (c === 0 ? '' : c > 0 ? `+${c}` : `${c}`);
  const lhsTxt = (row, vs) => { let o = ''; row.forEach((k, i) => { if (k) o += term(k, vs[i], !o); }); return o || '0'; };
  // 式（行 row・右辺 rhs）を、形 form で書く。0 そのまま、1 項を入れかえ、2「1つの文字＝…」、3 1つの項を右辺へ
  function eqTxt(row, rhs, form, r, vs) {
    vs = vs || VARS;
    const nzi = row.map((k, i) => (k ? i : -1)).filter(i => i >= 0);
    if (form === 1 && nzi.length >= 2) return lhsTxt(nzi.slice().reverse().map(i => row[i]), nzi.slice().reverse().map(i => vs[i])) + '=' + rhs;
    if (form === 2) {   // y=ax+c（行で係数が1の文字を左に残し、ほかを右へ）
      const i = nzi.find(k => row[k] === 1); if (i == null || nzi.length < 2) return null;
      const rest = row.map((k, j) => (j === i ? 0 : -k));
      return `${vs[i]}=${lhsTxt(rest, vs)}${cst(rhs)}`;
    }
    if (form === 3 && nzi.length >= 2) {   // ax=by+c
      const j = nzi[nzi.length - 1], left = row.map((k, i) => (i === j ? 0 : k));
      return `${lhsTxt(left, vs)}=${term(-row[j], vs[j], true)}${cst(rhs)}`;
    }
    return lhsTxt(row, vs) + '=' + rhs;
  }
  // ない文字も 0x のように書いた左辺（楽な形の説明用）
  const fullTxt = row => row.map((k, j) => (j === 0 ? (k === 1 ? '' : k === -1 ? '-' : String(k)) : (k < 0 ? (k === -1 ? '-' : String(k)) : '+' + (k === 1 ? '' : String(k)))) + VARS[j]).join('');
  const xvec = n => '\\begin{pmatrix}' + VARS.slice(0, n).join('\\\\') + '\\end{pmatrix}';
  const axb = (A, b, vs) => `$${pm(A)}${vs ? '\\begin{pmatrix}' + vs.join('\\\\') + '\\end{pmatrix}' : xvec(A.length)}=${pm(col(b))}$`;
  // 式の文から、$…=…$ の式を読む
  const eqsOf = q => maths(q).filter(m => (m.match(/=/g) || []).length === 1 && !/pmatrix|vec|^\(|^[xyz]=-?\d+$/.test(m));
  // 答えの A・b で A v−b が、式の（左辺−右辺）と比例するか（どの点でも同じ倍率。0倍でない）
  function axbCheck(p, eqs, vs) {
    const ms = matsOf(p.a); if (ms.length !== 3) return '答えの行列が3つない';
    const [A, , b] = ms, n = A.length;
    if (eqs.length !== n) return '式の数がちがう';
    for (let i = 0; i < n; i++) {
      const [L, R] = eqs[i].split('='); let ratio = null;
      for (let t = 0; t < 3; t++) {
        const pt = {}; vs.forEach((v, k) => { pt[v.replace(/[_{}]/g, '')] = 0.37 + 1.1 * k * k + 0.73 * t * (k + 1) * (k + 2); });
        const ev = s => M.evalMath(s.replace(/I_(\d)/g, 'I$1'), pt);
        const e = ev(L) - ev(R), w = A[i].reduce((s, a, k) => s + a * pt[vs[k].replace(/[_{}]/g, '')], 0) - b[i][0];
        if (!isFinite(e)) return `式が読めない（${eqs[i]}）`;
        if (Math.abs(w) < 1e-12 && Math.abs(e) < 1e-12) continue;
        const rr = e / w; if (ratio == null) ratio = rr; else if (!close(ratio, rr)) return `${i + 1}つめの式と、答えの${i + 1}行めが合わない`;
      }
      if (!ratio) return `${i + 1}行めが0`;
    }
    return true;
  }
  const det2 = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const det3 = A => fromM([[X.det(toM(A))]])[0][0];
  M.add({
    id: '7-08', part: 1, chap: '7-1⑤ 例題5', stars: 1,
    title: '連立方程式は $A\\vec x=\\vec b$：文字を左辺に同じ順で並べ、ない文字は係数0',
    mark: '連立方程式を、行列とベクトルで書く（$A\\vec x=\\vec b$ の形）。',
    futsu: ['$A=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$ とおいて、', '$A\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}ax+by\\\\cx+dy\\end{pmatrix}$ を計算し、', 'もとの2つの式と1つずつ見くらべて、', '$a$、$b$、$c$、$d$ を決める。'],
    raku: ['$3x+2y=12$、$y=4x-5$', '→ $-4x+y=-5$（$x$、$y$ の順に左辺へ）', '$\\begin{pmatrix}3&2\\\\-4&1\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}12\\\\-5\\end{pmatrix}$', '$x+2z=7$ は $y$ がない → 1行め $(1,\\ 0,\\ 2)$'],
    why: '左辺 $A\\vec x$ の $i$ 番めの成分は、$A$ の $i$ 行めと $\\vec x$ の内積（7-1④⑤）。だから、式を「文字の項を決めた順に左辺、数だけを右辺」に整えれば、係数を1行に並べたものが $A$ の行、右辺の数が $\\vec b$ になる。',
    caution: '移項すると符号が変わる。ない文字の係数は0と書き、行の長さをそろえる（つめて書かない）。文字の順は、すべての式で同じにする。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '50mm', s2: '62mm', s3: '58mm', trap: '30mm' }, boxh: { s1: '12mm', s2: '16mm', s3: '16mm', trap: '8mm' },
    fits(q) { return /A\\vec x=\\vec b/.test(q) && /形/.test(q); },
    steps: {
      // 2つの文字：そのまま・入れかえ・y=…・項が右辺
      s1(r) {
        const sol = [r.int(-3, 5), r.int(-3, 5)];
        const A = [[nz(r, -5, 6), nz(r, -5, 6)], [nz(r, -5, 6), nz(r, -5, 6)]];
        const forms = [r.int(0, 1), r.int(2, 3)];
        if (forms[0] === 0 && r.chance(0.5)) forms.reverse();
        forms.forEach((f, i) => { if (f === 2) A[i][r.int(0, 1)] = 1; });
        if (det2(A) === 0) return null;
        const b = Mmul(A, col(sol)).map(x => x[0]);
        if (kM(A) === kM([[3, 2], [-4, 1]])) return null;
        const t = A.map((row, i) => eqTxt(row, b[i], forms[i], r)); if (t.some(x => !x)) return null;
        return {
          q: `連立方程式 $${t[0]}$、$${t[1]}$ を、$x$、$y$ の順で $A\\vec x=\\vec b$ の形に □`, a: axb(A, b), key: `${kM(A)}|${b}`,
          easy: `文字を左辺に $x$、$y$ の順で：$${lhsTxt(A[0], VARS)}=${b[0]}$、$${lhsTxt(A[1], VARS)}=${b[1]}$`, easyCheck: false,
          verify: p => axbCheck(p, eqsOf(p.q), ['x', 'y']),
        };
      },
      // 3つの文字（ない文字がある）
      s2(r) {
        const sol = [r.int(-2, 4), r.int(-2, 4), r.int(-2, 4)];
        const A = [0, 1, 2].map(() => [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]);
        if (!A.some(row => row.includes(0)) || A.some(row => row.filter(k => k).length < 2) || det3(A) === 0) return null;
        if (A.some(row => kM([row]) === '1,0,2')) return null;
        const b = Mmul(A, col(sol)).map(x => x[0]);
        const t = A.map((row, i) => eqTxt(row, b[i], r.pick([0, 0, 1, 3]), r)); if (t.some(x => !x)) return null;
        return {
          q: `連立方程式 $${t[0]}$、$${t[1]}$、$${t[2]}$ を、$x$、$y$、$z$ の順で $A\\vec x=\\vec b$ の形に □`, a: axb(A, b), key: `${kM(A)}|${b}`,
          easy: `ない文字は係数0：$${A.map((row, i) => fullTxt(row) + '=' + b[i]).join('$、$')}$`, easyCheck: false,
          verify: p => axbCheck(p, eqsOf(p.q), ['x', 'y', 'z']),
        };
      },
      // 文章（買い物・文房具）、かっこのある式
      s3(r) {
        const t = turn(r, '08s3', 3);
        if (t === 0) {
          const A = [[r.int(1, 5), r.int(1, 5)], [r.int(1, 5), r.int(1, 5)]], p = 10 * r.int(10, 15), q = 10 * r.int(4, 9);
          if (det2(A) === 0 || badPrice(p, q)) return null;
          const b = Mmul(A, col([p, q])).map(x => x[0]);
          return {
            q: `りんご1個を $x$ 円、みかん1個を $y$ 円とする。りんご${A[0][0]}個とみかん${A[0][1]}個で${b[0]}円、りんご${A[1][0]}個とみかん${A[1][1]}個で${b[1]}円だった。この連立方程式を、$x$、$y$ の順で $A\\vec x=\\vec b$ の形に □`,
            a: axb(A, b), key: `${kM(A)}|${b}`, boxh: '12mm', boxw: '50mm',
            easy: `$${lhsTxt(A[0], VARS)}=${b[0]}$、$${lhsTxt(A[1], VARS)}=${b[1]}$ の係数を並べる`, easyCheck: false,
            verify: p0 => { const c = numsIn(p0.q, /(\d+)個[とで]/g), T = [...p0.q.matchAll(/(\d+)円[、だ]/g)].map(m => +m[1]), ms = matsOf(p0.a); return (same(ms[0], [[c[0], c[1]], [c[2], c[3]]]) && same(ms[2], col(T))) || 'ちがう'; },
          };
        }
        if (t === 1) {
          const sol = [10 * r.int(10, 16), 10 * r.int(6, 12), 10 * r.int(4, 9)];
          const A = [[r.int(1, 3), r.int(1, 3), 0], [0, r.int(1, 3), r.int(1, 3)], [r.int(1, 3), 0, r.int(1, 3)]];
          if (det3(A) === 0) return null;
          const b = Mmul(A, col(sol)).map(x => x[0]);
          return {
            q: `ノート1さつ $x$ 円、ペン1本 $y$ 円、消しゴム1個 $z$ 円とする。ノート${A[0][0]}さつとペン${A[0][1]}本で${b[0]}円、ペン${A[1][1]}本と消しゴム${A[1][2]}個で${b[1]}円、ノート${A[2][0]}さつと消しゴム${A[2][2]}個で${b[2]}円だった。この連立方程式を、$x$、$y$、$z$ の順で $A\\vec x=\\vec b$ の形に □`,
            a: axb(A, b), key: `${kM(A)}|${b}`,
            easy: '1つめの式に消しゴム、2つめにノート、3つめにペンがないので、その係数は0', easyCheck: false,
            verify: p0 => { const n = numsIn(p0.q, /(\d+)(?:さつ|本|個)[とで]/g), T = [...p0.q.matchAll(/(\d+)円[、だ]/g)].map(m => +m[1]), ms = matsOf(p0.a); return (same(ms[0], [[n[0], n[1], 0], [0, n[2], n[3]], [n[4], 0, n[5]]]) && same(ms[2], col(T))) || 'ちがう'; },
          };
        }
        const sol = [r.int(-3, 6), r.int(-3, 4)], k = r.int(2, 4), pp = nz(r, -3, 3), qq = nz(r, -3, 4), m = r.int(2, 4);
        const A = [[k * pp, k * qq], [1, -m]];
        if (det2(A) === 0) return null;
        const b = [k * (pp * sol[0] + qq * sol[1]), sol[0] - m * sol[1]];
        if (b[1] % m !== 0 || b[1] === 0) return null;   // 2つめの式は x=m(y+n)（x-my=mn）
        const e1 = `${k}(${lhsTxt([pp, qq], VARS)})=${b[0]}`, e2 = `x=${m}(y${cst(b[1] / m)})`;
        return {
          q: `連立方程式 $${e1}$、$${e2}$ を、$x$、$y$ の順で $A\\vec x=\\vec b$ の形に □`, a: axb(A, b), key: `${kM(A)}|${b}`, boxh: '12mm', boxw: '50mm',
          easy: `かっこをはずしてから：$${lhsTxt(A[0], VARS)}=${b[0]}$、$${lhsTxt(A[1], VARS)}=${b[1]}$`, easyCheck: false,
          verify: p => axbCheck(p, eqsOf(p.q), ['x', 'y']),
        };
      },
      // わな：連立方程式を解く（7-40）
      trap(r) {
        const sol = [r.int(-3, 6), r.int(-3, 6)], A = [[nz(r, -4, 5), nz(r, -4, 5)], [nz(r, -4, 5), nz(r, -4, 5)]];
        if (Math.abs(det2(A)) !== 1 && Math.abs(det2(A)) !== 2 && Math.abs(det2(A)) !== 3) return null;
        const b = Mmul(A, col(sol)).map(x => x[0]);
        return dest({ q: `連立方程式 $${lhsTxt(A[0], VARS)}=${b[0]}$、$${lhsTxt(A[1], VARS)}=${b[1]}$ を解こう □`, a: `$x=${sol[0]}$、$y=${sol[1]}$`, key: `t|${kM(A)}|${b}`,
          verify: p => { const e = eqsOf(p.q), v = numsOf(p.a); return e.every(s => { const [L, R] = s.split('='); return close(M.evalMath(L, { x: v[0], y: v[1] }), M.evalMath(R, {})); }) || '式をみたさない'; } }, '7-08',
        '形に書くのではなく、解を求める問題。逆行列か掃き出し法で解く', ['7-40']);
      },
    },
  });

  // ================================================================ 7-09
  // 左ページの例：(1 1 1; 1 -1 0; 0 1 -1)(4; 3; 2)=(9; 1; 1)（O-2。この行列は出さない）
  const EX09 = kM([[1, 1, 1], [1, -1, 0], [0, 1, -1]]);
  M.add({
    id: '7-09', part: 1, chap: '7-1 例題4・7-2⑥ 例題2', stars: 1,
    title: '3×3 も1行ずつ。答えの確かめは、答えを並べたベクトルを係数行列にかけて右辺とくらべる',
    mark: '3×3 の行列×ベクトル、「答えであることを確かめよう」。',
    futsu: ['$x=4$、$y=3$、$z=2$ を', '3つの式 $x+y+z=9$、$x-y=1$、$y-z=1$ の', '1つずつに入れなおして、', '左辺を計算する。'],
    raku: ['$\\begin{pmatrix}1&1&1\\\\1&-1&0\\\\0&1&-1\\end{pmatrix}\\begin{pmatrix}4\\\\3\\\\2\\end{pmatrix}$', '1行め $9$、2行め $4-3=1$、3行め $3-2=1$', '→ 右辺 $(9,\\ 1,\\ 1)$ と同じで、答え'],
    why: '3×3 でも、答えの $i$ 番めの成分は $i$ 行めとベクトルの内積（7-1④）。連立方程式は $A\\vec x=\\vec b$ なので、答えの候補を並べたベクトルに $A$ をかけて $\\vec b$ になれば答え。3つの式に入れなおすのと同じ計算を、行列の形で1回にまとめている。',
    caution: 'ない文字の係数0も、行列の中に書いておく（行の数がずれない）。1つの行でも右辺とちがえば、答えではない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '44mm', s3: '44mm', trap: '22mm' }, boxh: { s1: '16mm', s2: '8mm', s3: '8mm', trap: '16mm' },
    fits(q) {
      if (prods(q).some(([A, B]) => A.length === 3 && A[0].length === 3 && B.length === 3 && B[0].length === 1)) return true;
      return (/確かめ/.test(q) && /答え/.test(q)) || (/合計/.test(q) && /ノート・ペン・消しゴム/.test(q));
    },
    steps: {
      // 3×3 × 3
      s1(r) {
        const A = rmat(r, 3, 3, -2, 4), v = [r.int(-2, 5), r.int(-2, 5), r.int(-2, 5)];
        if (kM(A) === EX09 || String(v) === '4,3,2' || !A.flat().includes(0) || A.some(row => row.every(x => x === 0)) || v.filter(x => x).length < 2) return null;
        const C = Mmul(A, col(v));
        return { q: `$${pm(A)}${pm(col(v))}$`, a: `$${pm(C)}$`, key: kM(A) + '|' + v, calc: calcM(C), easy: rowsTxt(A, v), easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // 連立方程式の答えかどうか（係数行列にかける）
      s2(r) {
        const A = rmat(r, 3, 3, -2, 3), sol = [r.int(-2, 5), r.int(-2, 5), r.int(-2, 5)];
        if (kM(A) === EX09 || A.some(row => row.filter(k => k).length < 2) || det3(A) === 0) return null;
        const b = Mmul(A, col(sol)).map(x => x[0]), ok = r.chance(0.5), c = sol.slice();
        if (!ok) { const k = r.int(0, 2); c[k] += r.pick([1, -1, 2]); }
        if (String(c) === '4,3,2') return null;
        const Ac = Mmul(A, col(c)).map(x => x[0]);
        const verdict = ok ? `答えである（$A\\vec x=${vecH(Ac)}$）` : `答えでない（$A\\vec x=${vecH(Ac)}$）`;
        return {
          q: `連立方程式 $${A.map((row, i) => lhsTxt(row, VARS) + '=' + b[i]).join('$、$')}$ で、$(x,\\ y,\\ z)=${vecH(c)}$ は答えか。係数行列にかけて確かめよう □`, a: verdict, key: kM(A) + '|' + c,
          easy: `${rowsTxt(A, c)}。右辺は $${vecH(b)}$`, easyCheck: false,
          verify: p => {
            const e = eqsOf(p.q), v = /\(x,\\ y,\\ z\)=\(([^)]*)\)/.exec(p.q)[1].split(',').map(t => +t.replace(/\\ /g, ''));
            const w = e.map(s => M.evalMath(s.split('=')[0], { x: v[0], y: v[1], z: v[2] })), okk = e.every((s, i) => close(w[i], M.evalMath(s.split('=')[1], {})));
            return (p.a.startsWith(okk ? '答えである' : '答えでない') && p.a.includes(vecH(w))) || '確かめがちがう';
          },
        };
      },
      // 文房具の答えの確かめ・3人の3つの品物の合計
      s3(r) {
        if (turn(r, '09s3', 2)) {
          const sol = [10 * r.int(10, 16), 10 * r.int(6, 12), 10 * r.int(4, 9)];
          const A = [[r.int(1, 3), r.int(1, 3), 0], [0, r.int(1, 3), r.int(1, 3)], [r.int(1, 3), 0, r.int(1, 3)]];
          if (det3(A) === 0) return null;
          const b = Mmul(A, col(sol)).map(x => x[0]), ok = r.chance(0.5), c = sol.slice();
          if (!ok) { const k = r.int(0, 2); c[k] += r.pick([10, -10, 20]); }
          const Ac = Mmul(A, col(c)).map(x => x[0]);
          return {
            q: `ノート1さつ $x$ 円、ペン1本 $y$ 円、消しゴム1個 $z$ 円。ノート${A[0][0]}さつとペン${A[0][1]}本で${b[0]}円、ペン${A[1][1]}本と消しゴム${A[1][2]}個で${b[1]}円、ノート${A[2][0]}さつと消しゴム${A[2][2]}個で${b[2]}円だった。$x=${c[0]}$、$y=${c[1]}$、$z=${c[2]}$ は答えか。係数行列にかけて確かめよう □`,
            a: ok ? `答えである（$A\\vec x=${vecH(Ac)}$）` : `答えでない（$A\\vec x=${vecH(Ac)}$）`, key: kM(A) + '|' + c,
            easy: `係数行列に $${vecH(c)}$ をかける。${rowsTxt(A, c)}。右辺は $${vecH(b)}$`, easyCheck: false,
            verify: p0 => { const n = numsIn(p0.q, /(\d+)(?:さつ|本|個)[とで]/g), T = [...p0.q.matchAll(/(\d+)円[、だ]/g)].map(m => +m[1]), v = numsOf(p0.q).slice(-3); const AA = [[n[0], n[1], 0], [0, n[2], n[3]], [n[4], 0, n[5]]], w = mul(AA, col(v)).map(x => x[0]); const okk = w.every((x, i) => x === T[i]); return (p0.a.startsWith(okk ? '答えである' : '答えでない') && p0.a.includes(vecH(w))) || '確かめがちがう'; },
          };
        }
        const N = [0, 1, 2].map(() => [r.int(0, 4), r.int(0, 4), r.int(0, 4)]), pr = [10 * r.int(10, 16), 10 * r.int(6, 12), 10 * r.int(4, 9)];
        if (N.some(row => row.every(x => x === 0))) return null;
        const C = Mmul(N, col(pr));
        return {
          q: `3人が、ノート・ペン・消しゴムを、1人めから順に（${N[0].join('、')}）、（${N[1].join('、')}）、（${N[2].join('、')}）買う（さつ・本・個）。ノート1さつ${pr[0]}円、ペン1本${pr[1]}円、消しゴム1個${pr[2]}円のとき、3人の合計（円）をたてのベクトルで □`,
          a: `$${pm(C)}$`, key: `${kM(N)}|${pr}`, calc: calcM(C), boxw: '14mm', boxh: '16mm',
          easy: `個数の行列×値段のベクトル。${rowsTxt(N, pr)}`, easyCheck: false,
          verify: p0 => { const g = [...p0.q.matchAll(/（(\d)、(\d)、(\d)）/g)].map(m => [+m[1], +m[2], +m[3]]), v = numsIn(p0.q, /(\d+)円/g); return okM(ansM(p0.a), mul(g, col(v)), '合計'); },
        };
      },
      // わな：A x = b の x を求める（7-43）
      trap(r) {
        const sol = [r.int(-2, 5), r.int(-2, 5), r.int(-2, 5)];
        const A = [[1, r.int(-2, 2), r.int(-2, 2)], [0, 1, r.int(-2, 2)], [r.int(-1, 1), 0, 1]];
        if (det3(A) === 0) return null;
        const b = Mmul(A, col(sol)).map(x => x[0]);
        return dest({ q: `$${pm(A)}\\vec x=${pm(col(b))}$ となる $\\vec x$ を求めよう □`, a: `$\\vec x=${pm(col(sol))}$`, key: `t|${kM(A)}|${b}`, calc: calcM(col(sol)),
          verify: p => { const [U, V] = matsOf(p.q); return okM(mul(U, ansM(p.a)), V, 'A x=b'); } }, '7-09',
        '答えを確かめるのではなく、$\\vec x$ を求める問題。掃き出し法で解く', ['7-43']);
      },
    },
  });

  // ================================================================ 7-10
  // 左ページの例：(1 2; 3 4)(5 6; 7 8)（O-2。この組は出さない）
  const EX10 = kM([[1, 2], [3, 4]]) + '|' + kM([[5, 6], [7, 8]]);
  const colOf = (B, j) => B.map(row => row[j]);
  // 積の成分ごとの「かけて、たす」：(1, 1)：$1\times5+2\times7=19$
  const prodTxt = (A, B, C) => C.map((row, i) => row.map((c, j) => `(${i + 1}, ${j + 1})：$${dotTxt(A[i], colOf(B, j))}=${num(c)}$`).join('、')).join('、');
  const keyP = (A, B) => 'p|' + kM(A) + '|' + kM(B);
  M.add({
    id: '7-10', part: 1, chap: '7-1⑥・7-3③ 例題1', stars: 1,
    title: '行列×行列の $(i,\\ j)$ 成分は「左の $i$ 行めと右の $j$ 列めの内積」：右の行列を1列ずつ',
    mark: '2×2 どうしの積など、行列×行列。',
    futsu: ['文字の公式', '$\\begin{pmatrix}ae+bg&af+bh\\\\ce+dg&cf+dh\\end{pmatrix}$ を書き、', '$a=1$、$b=2$、…と', '8つの文字に数を入れて計算する。'],
    raku: ['$\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}$', '(1, 1)：1行めと1列め $5+14=19$', '(1, 2)：$6+16=22$、(2, 1)：$15+28=43$', '(2, 2)：$18+32=50$（$5$、$12$、$21$、$32$ ではない）'],
    why: '積 $AB$ は、$B$ の列ごとに「$A$×列ベクトル」をして、答えを横に並べたもの（7-1⑥）。だから $(i,\\ j)$ 成分は、$A$ の $i$ 行めと $B$ の $j$ 列めの内積。指で $A$ の行を横に、$B$ の列をたてになぞる。',
    caution: '同じ場所どうしをかけるのではない（それは Python の `*`）。かける順を入れかえると、答えが変わることがある（$AB\\neq BA$）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '22mm', s3: '22mm', trap: '20mm' }, boxh: { s1: '12mm', s2: '16mm', s3: '12mm', trap: '8mm' },
    fits(q) {
      if (/かけられ|大きさ|たせ/.test(q) || (/成分/.test(q) && !/すべて/.test(q))) return false;
      if (prods(q).some(([A, B]) => canMul(A, B) && B[0].length >= 2)) return true;
      return /のとき/.test(q) && /^(?:[A-Z][A-Z]|[A-Z]\^\{\d\})$/.test(lastMath(q).replace(/\s/g, ''));
    },
    steps: {
      // 2×2 どうし
      s1(r) {
        const A = rmat(r, 2, 2, -3, 5), B = rmat(r, 2, 2, -3, 5);
        if (isDiag(A) || isDiag(B) || [A, B].some(Z => [kM([[1, 2], [3, 4]]), kM([[5, 6], [7, 8]])].includes(kM(Z))) || [A, B].some(Z => Z.some(row => row.every(v => v === 0)))) return null;
        const C = Mmul(A, B);
        return { q: `$${pm(A)}${pm(B)}$`, a: `$${pm(C)}$`, key: keyP(A, B), calc: calcM(C), easy: prodTxt(A, B, C), easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // 2×3・3×2、3×2・2×2、負の数の多い 2×2
      s2(r) {
        const t = turn(r, '10s2', 3);
        const [A, B] = t === 0 ? [rmat(r, 2, 3, -2, 4), rmat(r, 3, 2, -2, 4)] : t === 1 ? [rmat(r, 3, 2, -2, 4), rmat(r, 2, 2, -3, 4)] : [rmat(r, 2, 2, -5, 5), rmat(r, 2, 2, -5, 5)];
        if (isDiag(A) || isDiag(B) || zero(A) || zero(B)) return null;
        const C = Mmul(A, B);
        return { q: `$${pm(A)}${pm(B)}$`, a: `$${pm(C)}$`, key: keyP(A, B), calc: calcM(C), easy: prodTxt(A, B, C), easyCheck: false, boxh: C.length === 3 ? '16mm' : '12mm',
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // 文字の行列：QP（順に気をつける）・A^2
      s3(r) {
        if (turn(r, '10s3', 2)) {
          const P = rmat(r, 2, 2, -3, 4), Q = rmat(r, 2, 2, -3, 4);
          if (isDiag(P) || isDiag(Q)) return null;
          const C = Mmul(Q, P); if (same(C, Mmul(P, Q))) return null;   // PQ と同じになる組はさける（順のちがいを見る問題）
          return { q: `$P=${pm(P)}$、$Q=${pm(Q)}$ のとき、$QP$`, a: `$${pm(C)}$`, key: keyP(Q, P), calc: calcM(C),
            easy: `左が $Q$、右が $P$。${prodTxt(Q, P, C)}`, easyCheck: false,
            verify: p => { const D = defs(p.q); return okM(ansM(p.a), mul(D.Q, D.P), 'QP'); } };
        }
        const A = rmat(r, 2, 2, -3, 4); if (isDiag(A)) return null;
        const C = Mmul(A, A);
        return { q: `$A=${pm(A)}$ のとき、$A^{2}$`, a: `$${pm(C)}$`, key: keyP(A, A), calc: calcM(C),
          easy: `$A^{2}=AA$。${prodTxt(A, A, C)}`, easyCheck: false,
          verify: p => { const D = defs(p.q); return okM(ansM(p.a), mul(D.A, D.A), 'A^2'); } };
      },
      // わな：2×3 × 2×3（かけられない。7-05）
      trap(r) {
        const [n, m] = r.pick([[2, 3], [3, 2]]), A = rmat(r, n, m, 0, 5), B = rmat(r, n, m, 0, 5);
        return dest({ q: `$${pm(A)}${pm(B)}$`, a: 'かけられない', key: 't|' + kM(A) + '|' + kM(B),
          verify: p => { const [U, V] = matsOf(p.q); return (!canMul(U, V) && p.a === 'かけられない') || 'かけられる'; } }, '7-10',
        `$(${n}\\times${m})(${n}\\times${m})$ は内側の ${m} と ${n} がちがうので、かけられない`, ['7-05']);
      },
    },
  });

  // ================================================================ 7-11
  // 左ページの例：(1 2 0; 0 1 1; 1 0 1)(2 0 1; 1 1 0; 0 3 1) の (2, 3)（O-2。この組は出さない）
  const EX11 = kM([[1, 2, 0], [0, 1, 1], [1, 0, 1]]) + '|' + kM([[2, 0, 1], [1, 1, 0], [0, 3, 1]]);
  const ijOf = q => { const m = /\((\d), (\d)\) 成分/.exec(q); return m ? [+m[1], +m[2]] : null; };
  const STORE = ['くだもの屋', 'スーパー'], WHO2 = ['ソラ', 'ミナ'], MEAL = ['朝食', '昼食'], NUTN = ['エネルギー', 'たんぱく質'], NUTU = ['kcal', 'g'];
  M.add({
    id: '7-11', part: 1, chap: '7-1 例題7・7-3 例題7', stars: 1,
    title: '1つの成分だけ聞かれたら、その行とその列だけ（積の全部を作らない）',
    mark: '「積の (2, 1) 成分」「3×3 の積の2行め3列め」、その成分の意味。',
    futsu: ['3×3 の積を、', '9つの成分とも計算してから、', 'その中の2行め3列めを読む。'],
    raku: ['$\\begin{pmatrix}1&2&0\\\\0&1&1\\\\1&0&1\\end{pmatrix}\\begin{pmatrix}2&0&1\\\\1&1&0\\\\0&3&1\\end{pmatrix}$ の (2, 3)', '→ 2行め $(0,\\ 1,\\ 1)$ と3列め $(1,\\ 0,\\ 1)$', '$0+0+1=1$ だけ（9成分を出さない）'],
    why: '積の $(i,\\ j)$ 成分は、左の $i$ 行めと右の $j$ 列めだけで決まる（7-1⑥）。ほかの行や列は使わないので、聞かれた成分だけなら、内積を1回するだけでよい。成分の意味（だれが、どの店で買う合計か）も、その行と列の意味から読める。',
    caution: '$(2,\\ 1)$ 成分は「左の2行めと、右の1列め」（左の1列めではない）。行と列を取りちがえない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '12mm', s3: '44mm', trap: '20mm' }, boxh: { trap: '12mm' },
    fits(q) {
      if (/すべて|かけられ/.test(q) || !ijOf(q)) return false;
      return prods(q).length > 0 || /積/.test(q) || /\$[A-Z]{2}\$ の \(/.test(q);
    },
    steps: {
      // 2×2 の積の1つの成分
      s1(r) {
        const A = rmat(r, 2, 2, -3, 6), B = rmat(r, 2, 2, -3, 6), i = r.int(1, 2), j = r.int(1, 2);
        if (isDiag(A) || isDiag(B)) return null;
        const v = Mmul(A, B)[i - 1][j - 1];
        return { q: `$${pm(A)}${pm(B)}$ の (${i}, ${j}) 成分`, a: `$${num(v)}$`, key: keyP(A, B) + `|${i}${j}`,
          easy: `${i}行め $${vecH(A[i - 1])}$ と${j}列め $${vecH(colOf(B, j - 1))}$：$${dotTxt(A[i - 1], colOf(B, j - 1))}=${num(v)}$`, easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q), [a, b] = ijOf(p.q); return close(numsOf(p.a)[0], mul(U, V)[a - 1][b - 1]) || 'ちがう'; } };
      },
      // 3×3 の積の1つの成分
      s2(r) {
        const A = rmat(r, 3, 3, -1, 3), B = rmat(r, 3, 3, -1, 3), i = r.int(1, 3), j = r.int(1, 3);
        if (keyP(A, B).slice(2) === EX11 || isDiag(A) || isDiag(B)) return null;
        const v = Mmul(A, B)[i - 1][j - 1];
        return { q: `$${pm(A)}${pm(B)}$ の (${i}, ${j}) 成分`, a: `$${num(v)}$`, key: keyP(A, B) + `|${i}${j}`,
          easy: `${i}行め $${vecH(A[i - 1])}$ と${j}列め $${vecH(colOf(B, j - 1))}$：$${dotTxt(A[i - 1], colOf(B, j - 1))}=${num(v)}$`, easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q), [a, b] = ijOf(p.q); return close(numsOf(p.a)[0], mul(U, V)[a - 1][b - 1]) || 'ちがう'; } };
      },
      // 積の成分の意味（買い物・栄養）
      s3(r) {
        const i = r.int(1, 2), j = r.int(1, 2);
        if (turn(r, '11s3', 2)) {
          const N = rmat(r, 2, 2, 1, 5), P = [[10 * r.int(10, 15), 10 * r.int(8, 14)], [10 * r.int(4, 9), 10 * r.int(4, 9)]];
          if (badPrice(P[0][0], P[1][0]) || badPrice(P[0][1], P[1][1])) return null;
          const v = Mmul(N, P)[i - 1][j - 1];
          return {
            q: `個数 $N=${pm(N)}$（行はソラ・ミナ、列はりんご・みかん）、値段 $P=${pm(P)}$（円。列はくだもの屋・スーパー）。$NP$ の (${i}, ${j}) 成分は何を表すか。値も □`,
            a: `${WHO2[i - 1]}さんが${STORE[j - 1]}で買うときの合計で、${num(v)}円`, key: `n|${kM(N)}|${kM(P)}|${i}${j}`,
            easy: `$N$ の${i}行めは${WHO2[i - 1]}さん、$P$ の${j}列めは${STORE[j - 1]}。$${dotTxt(N[i - 1], colOf(P, j - 1))}=${num(v)}$`, easyCheck: false,
            verify: p => { const D = defs(p.q), [a, b] = ijOf(p.q); return p.a === `${WHO2[a - 1]}さんが${STORE[b - 1]}で買うときの合計で、${num(mul(D.N, D.P)[a - 1][b - 1])}円` || 'ちがう'; },
          };
        }
        const Q = [[r.pick([0.5, 1, 1.5, 2]), r.pick([0.5, 1])], [r.pick([1, 1.5, 2, 2.5]), r.pick([0.5, 1, 1.5])]];
        if (kM(Q) === kM([[1.5, 0.5], [2, 1]])) return null;   // 教科書のじぶんでとこうの組
        const v = Mmul(Q, NUT)[i - 1][j - 1];
        return {
          q: `食べた量 $M=${pm(Q)}$（行は朝食・昼食、列はごはん・卵、$100\\,\\mathrm{g}$ 単位）、$100\\,\\mathrm{g}$ あたりの栄養 $F=${pm(NUT)}$（列はエネルギー〔kcal〕・たんぱく質〔g〕）。$MF$ の (${i}, ${j}) 成分は何を表すか。値も □`,
          a: `${MEAL[i - 1]}の${NUTN[j - 1]}で、$${num(v)}\\,\\mathrm{${NUTU[j - 1]}}$`, key: `m|${kM(Q)}|${i}${j}`,
          easy: `$M$ の${i}行めは${MEAL[i - 1]}、$F$ の${j}列めは${NUTN[j - 1]}。$${dotTxt(Q[i - 1], colOf(NUT, j - 1))}=${num(v)}$`, easyCheck: false,
          verify: p => { const D = defs(p.q), [a, b] = ijOf(p.q); return (p.a.startsWith(`${MEAL[a - 1]}の${NUTN[b - 1]}で`) && close(numsOf(p.a)[0], mul(D.M, D.F)[a - 1][b - 1])) || 'ちがう'; },
        };
      },
      // わな：積の4つの成分すべて（7-10）
      trap(r) {
        const A = rmat(r, 2, 2, -2, 5), B = rmat(r, 2, 2, -2, 5);
        if (isDiag(A) || isDiag(B)) return null;
        const C = Mmul(A, B);
        return dest({ q: `$${pm(A)}${pm(B)}$ の積（4つの成分すべて）`, a: `$${pm(C)}$`, key: 't|' + keyP(A, B), calc: calcM(C),
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } }, '7-11',
        '1つの成分ではなく、4つの成分すべてを聞いている。行と列の組を4回なぞる', ['7-10']);
      },
    },
  });

  // ================================================================ 7-12
  // 左ページの例：(2 0; 0 3)(1 4; 5 6)、右からかけた (1 4; 5 6)(2 0; 0 3)（O-2。この行列は出さない）
  const EX12 = kM([[1, 4], [5, 6]]);
  const diag = ds => ds.map((d, i) => ds.map((_, j) => (i === j ? d : 0)));
  const powM = (A, k) => { let R = A; for (let t = 1; t < k; t++) R = mul(R, A); return R; };
  const DS = [2, 3, 4, 5, -1, -2, -3];
  M.add({
    id: '7-12', part: 1, chap: '7-1⑧・7-3④・7-9 例題6', stars: 1,
    title: '$I$・$O$・対角行列とのかけ算は計算を省く：$IA=A$、左から対角なら行を何倍、右からなら列を何倍',
    mark: 'ななめ（対角成分）以外が0の行列とのかけ算。',
    futsu: ['$\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}\\begin{pmatrix}1&4\\\\5&6\\end{pmatrix}$ を、', '$2\\times1+0\\times5$、$2\\times4+0\\times6$、…と', '0の積もふくめて、', '8回かけて計算する。'],
    raku: ['左から対角：1行めを2倍、2行めを3倍', '→ $\\begin{pmatrix}2&8\\\\15&18\\end{pmatrix}$', '右からなら、列を2倍・3倍', '→ $\\begin{pmatrix}2&12\\\\10&18\\end{pmatrix}$。$IP=P$'],
    why: '対角行列 $D$ の $i$ 行めは、$i$ 番めだけが $d_i$ で、ほかは0。だから $DA$ の $i$ 行めは「$A$ の $i$ 行めの $d_i$ 倍」になる。右からかけると、同じ理由で $A$ の $j$ 列めが $d_j$ 倍になる（7-1⑧・7-3④）。$I$ は全部1倍なので変えない。$O$ とかけると、すべて0。',
    caution: '左からは「行」、右からは「列」。取りちがえると答えが変わる。ななめの外に0でない成分がある行列には使えない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '24mm', s3: '22mm', trap: '20mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) {
      if (/かけられ|大きさ|成分/.test(q)) return false;
      if (prods(q).some(([A, B]) => canMul(A, B) && (isDiag(A) || isDiag(B) || zero(A) || zero(B)))) return true;
      return /[A-Z]D\^\{\d\}|D\^\{\d\}[A-Z]/.test(q);
    },
    steps: {
      // 左から対角（2×2）
      s1(r) {
        const d = [r.pick(DS), r.pick(DS)], A = rmat(r, 2, 2, -3, 6);
        if (d[0] === d[1] || String(d) === '2,3' || isDiag(A) || kM(A) === EX12) return null;
        const C = Mmul(diag(d), A);
        return { q: `$${pm(diag(d))}${pm(A)}$`, a: `$${pm(C)}$`, key: 'L|' + d + '|' + kM(A), calc: calcM(C),
          easy: `左から対角：1行めを $${num(d[0])}$ 倍、2行めを $${num(d[1])}$ 倍`, easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // 右から対角（2×2・2×3）・I とのかけ算・3×3 の対角
      s2(r) {
        const t = turn(r, '12s2', 3);
        if (t === 0) {
          const m = r.pick([2, 3]), d = Array.from({ length: m }, () => r.pick(DS)), A = rmat(r, 2, m, -3, 6);
          if (new Set(d).size < m || String(d) === '2,3' || zero(A) || kM(A) === EX12) return null;
          const C = Mmul(A, diag(d));
          return { q: `$${pm(A)}${pm(diag(d))}$`, a: `$${pm(C)}$`, key: 'R|' + d + '|' + kM(A), calc: calcM(C), boxw: m === 3 ? '28mm' : '22mm',
            easy: `右から対角：${d.map((x, k) => `${k + 1}列めを $${num(x)}$ 倍`).join('、')}`, easyCheck: false,
            verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
        }
        if (t === 1) {
          const n = r.pick([2, 3]), A = rmat(r, n, n, -4, 7), left = r.chance(0.5);
          if (isDiag(A)) return null;
          return { q: left ? `$${pm(diag(Array(n).fill(1)))}${pm(A)}$` : `$${pm(A)}${pm(diag(Array(n).fill(1)))}$`, a: `$${pm(A)}$`, key: 'I|' + kM(A), calc: calcM(A), boxh: n === 3 ? '16mm' : '12mm',
            easy: `単位行列 $I$ なので、${left ? '$IA=A$' : '$AI=A$'}（変わらない）`, easyCheck: false,
            verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
        }
        const d = [r.pick(DS), r.pick(DS), r.pick(DS)], A = rmat(r, 3, 3, -2, 5);
        if (new Set(d).size < 3 || isDiag(A)) return null;
        const C = Mmul(diag(d), A);
        return { q: `$${pm(diag(d))}${pm(A)}$`, a: `$${pm(C)}$`, key: 'L|' + d + '|' + kM(A), calc: calcM(C), boxw: '28mm', boxh: '16mm',
          easy: `左から対角：${d.map((x, k) => `${k + 1}行めを $${num(x)}$ 倍`).join('、')}`, easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } };
      },
      // 対角行列の累乗：PD^k・D^kP（7-9 例題6 の形）
      s3(r) {
        const d = [r.pick([2, 3, -1, -2]), r.pick([2, 3, -1, -2, 1])], k = r.pick([2, 3]), P = rmat(r, 2, 2, -3, 5);
        if (d[0] === d[1] || String(d) === '2,3' || isDiag(P)) return null;
        const dk = d.map(x => x ** k), right = turn(r, '12s3', 2) === 0;
        const C = right ? Mmul(P, diag(dk)) : Mmul(diag(dk), P);
        return {
          q: `$P=${pm(P)}$、$D=${pm(diag(d))}$ のとき、$${right ? `PD^{${k}}` : `D^{${k}}P`}$`, a: `$${pm(C)}$`, key: (right ? 'R|' : 'L|') + dk + '|' + kM(P), calc: calcM(C),
          easy: `$D^{${k}}$ は対角に $${num(dk[0])}$、$${num(dk[1])}$。` + (right ? `$P$ の1列めを $${num(dk[0])}$ 倍、2列めを $${num(dk[1])}$ 倍` : `$P$ の1行めを $${num(dk[0])}$ 倍、2行めを $${num(dk[1])}$ 倍`), easyCheck: false,
          verify: p => { const D = defs(p.q), kk = +/\^\{(\d)\}/.exec(lastMath(p.q))[1], Dk = powM(D.D, kk); return okM(ansM(p.a), /^P/.test(lastMath(p.q)) ? mul(D.P, Dk) : mul(Dk, D.P), 'PD^k'); },
        };
      },
      // わな：ななめの外に0でない成分がある（対角でない。7-10）
      trap(r) {
        const T = [[r.pick([2, 3, -1]), nz(r, -2, 3)], [0, r.pick([2, 3, -2])]], A = rmat(r, 2, 2, -3, 6);
        if (isDiag(A)) return null;
        const C = Mmul(T, A);
        return dest({ q: `$${pm(T)}${pm(A)}$`, a: `$${pm(C)}$`, key: 't|' + kM(T) + '|' + kM(A), calc: calcM(C),
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } }, '7-12',
        `左の行列の (1, 2) 成分が $${num(T[0][1])}$ で、対角行列ではない。行を何倍するだけではすまないので、行と列をなぞる`, ['7-10']);
      },
    },
  });

  // ================================================================ 7-13
  // 左ページの例：(4 0 -1; 7 3 5)^T（O-2。この行列は出さない）
  const TQ = A => `$${pm(A)}^{\\mathsf T}$`;
  const symm = A => A.length === A[0].length && A.every((row, i) => row.every((v, j) => v === A[j][i]));
  M.add({
    id: '7-13', part: 1, chap: '7-1⑦ 例題8', stars: 1,
    title: '転置は「1行め → 1列め」：$m\\times n$ は $n\\times m$ に、対角成分は動かない',
    mark: '$A^{\\mathsf T}$（転置）。',
    futsu: ['$A^{\\mathsf T}$ の $(i,\\ j)$ 成分は $a_{ji}$ なので、', '6つの成分を1つずつ、', '$(1,\\ 1)$、$(1,\\ 2)$、…と', '番号を入れかえて書きうつす。'],
    raku: ['$\\begin{pmatrix}4&0&-1\\\\7&3&5\\end{pmatrix}^{\\mathsf T}=\\begin{pmatrix}4&7\\\\0&3\\\\-1&5\\end{pmatrix}$', '1行め $(4,\\ 0,\\ -1)$ を、そのまま1列めに', '2×3 の転置は 3×2'],
    why: '転置は、行と列を入れかえること（7-1⑦）。$A$ の $i$ 行めが、$A^{\\mathsf T}$ の $i$ 列めになる。行を1本ずつ、たてに書きなおせば、成分を1つずつ考えなくてすむ。対角線を折り目に裏返すので、対角成分は動かない。',
    caution: '$\\mathsf T$ は $T$ 乗ではない。大きさも入れかわる（2×3 → 3×2）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '20mm', s3: '20mm', trap: '14mm' }, boxh: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '8mm' },
    fits(q) { return /mathsf T/.test(q) && !/対称|\\vec|積/.test(q) && !/\\mathsf T\}\s*[A-Z\\]/.test(q); },
    steps: {
      // 2×2・2×3
      s1(r) {
        const [n, m] = r.pick([[2, 2], [2, 3], [2, 3]]), A = rmat(r, n, m, -5, 9);
        if (symm(A) || kM(A) === kM([[4, 0, -1], [7, 3, 5]])) return null;
        const C = MT(A);
        return { q: TQ(A), a: `$${pm(C)}$`, key: kM(A), calc: calcM(C), boxh: m === 3 ? '16mm' : '12mm',
          easy: A.map((row, i) => `${i + 1}行め $${vecH(row)}$ → ${i + 1}列め`).join('、'), easyCheck: false,
          verify: p => { const U = matsOf(p.q)[0]; return okM(ansM(p.a), U[0].map((_, j) => U.map(row => row[j])), '転置'); } };
      },
      // 3×2・3×3・たてのベクトル
      s2(r) {
        const t = turn(r, '13s2', 3), [n, m] = t === 0 ? [3, 2] : t === 1 ? [3, 3] : [3, 1], A = rmat(r, n, m, -5, 9);
        if (symm(A)) return null;
        const C = MT(A);
        return { q: TQ(A), a: `$${pm(C)}$`, key: kM(A), calc: calcM(C), boxw: m === 1 ? '20mm' : '18mm', boxh: m === 1 ? '8mm' : m === 2 ? '12mm' : '16mm',
          easy: m === 1 ? 'たてのベクトルの転置は、横のベクトル（1×3）' : A.map((row, i) => `${i + 1}行め $${vecH(row)}$ → ${i + 1}列め`).join('、'), easyCheck: false,
          verify: p => { const U = matsOf(p.q)[0]; return okM(ansM(p.a), U[0].map((_, j) => U.map(row => row[j])), '転置'); } };
      },
      // 表の向きを変える・A^T の1つの成分・A+A^T
      s3(r) {
        const t = turn(r, '13s3', 3);
        if (t === 0) {
          const N = rmat(r, 2, 3, 0, 6), C = MT(N);
          return { q: `個数の行列 $N=${pm(N)}$（行はソラ・ミナ、列はりんご・みかん・バナナ）を、行がくだもの、列が人の行列にした $N^{\\mathsf T}$ □`, a: `$${pm(C)}$`, key: kM(N), calc: calcM(C),
            easy: 'ソラさんの行が、ソラさんの列になる（3×2）', easyCheck: false,
            verify: p => { const U = defs(p.q).N; return okM(ansM(p.a), U[0].map((_, j) => U.map(row => row[j])), '転置'); } };
        }
        if (t === 1) {
          const n = r.pick([2, 3]), m = 3, A = rmat(r, n, m, -5, 9), i = r.int(1, m), j = r.int(1, n);
          if (i === j || A[j - 1][i - 1] === A[i - 1]?.[j - 1]) return null;
          (r.ans13 || (r.ans13 = new Set())).add(A[j - 1][i - 1]);   // わなの答えと重ねない（O-2）
          return { q: `$A=${pm(A)}$ のとき、$A^{\\mathsf T}$ の (${i}, ${j}) 成分`, a: `$${num(A[j - 1][i - 1])}$`, key: kM(A) + `|${i}${j}`, boxw: '12mm', boxh: '8mm',
            easy: `$A^{\\mathsf T}$ の (${i}, ${j}) 成分は、$A$ の (${j}, ${i}) 成分 $a_{${j}${i}}$`, easyCheck: false,
            verify: p => { const U = defs(p.q).A, m2 = /\((\d), (\d)\) 成分/.exec(p.q); return close(numsOf(p.a)[0], U[+m2[2] - 1][+m2[1] - 1]) || 'ちがう'; } };
        }
        const A = rmat(r, 2, 2, -5, 9); if (symm(A)) return null;
        const C = Madd(A, MT(A));
        return { q: `$A=${pm(A)}$ のとき、$A+A^{\\mathsf T}$`, a: `$${pm(C)}$`, key: kM(A) + '|s', calc: calcM(C), boxh: '12mm',
          easy: `$A^{\\mathsf T}=${pm(MT(A))}$ をたす。答えは対称な行列になる`, easyCheck: false,
          verify: p => { const U = defs(p.q).A; return okM(ansM(p.a), U.map((row, i) => row.map((v, j) => v + U[j][i])), 'A+A^T'); } };
      },
      // わな：A^T A の成分（7-11）
      trap(r) {
        const n = r.pick([2, 3]), A = rmat(r, n, 2, -3, 4), i = r.int(1, 2), j = r.int(1, 2);
        if (zero(A)) return null;
        const v = A.reduce((s, row) => s + row[i - 1] * row[j - 1], 0);
        if (r.ans13 && r.ans13.has(v)) return null;
        return dest({ q: `$A=${pm(A)}$ のとき、積 $A^{\\mathsf T}A$ の (${i}, ${j}) 成分`, a: `$${num(v)}$`, key: `t|${kM(A)}|${i}${j}`,
          verify: p => { const U = defs(p.q).A, m2 = /\((\d), (\d)\) 成分/.exec(p.q); return close(numsOf(p.a)[0], mul(U[0].map((_, k) => U.map(row => row[k])), U)[+m2[1] - 1][+m2[2] - 1]) || 'ちがう'; } }, '7-13',
        `転置だけでなく、積の1つの成分。$A^{\\mathsf T}$ の${i}行めは $A$ の${i}列めなので、$A$ の${i}列めと${j}列めの内積`, ['7-11']);
      },
    },
  });

  // ================================================================ 7-14
  // 左ページの例：(4 a; -2 1)、(3 0 2; 0 1 4; 2 4 6)（O-2。この行列は出さない）
  const pmS = A => '\\begin{pmatrix}' + A.map(row => row.map(v => (typeof v === 'string' ? v : num(v))).join('&')).join('\\\\') + '\\end{pmatrix}';
  const rawP = t => { const m = /\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/.exec(t); return m[1].split('\\\\').map(row => row.split('&').map(c => c.trim())); };
  const LAB = ['ア', 'イ', 'ウ'];
  M.add({
    id: '7-14', part: 1, chap: '7-1⑦ 例題8', stars: 1,
    title: '対称かどうかは、対角をはさんで向かい合う組だけを見る（2×2 は1組、3×3 は3組）',
    mark: '「対称な行列はどれ」「□がいくつで対称」。',
    futsu: ['$\\begin{pmatrix}3&0&2\\\\0&1&4\\\\2&4&6\\end{pmatrix}$ の転置を', '全部書いてから、', 'もとの行列と9つの成分を', '1つずつくらべる。'],
    raku: ['向かい合う組だけ：0と0、2と2、4と4', '→ 対称（転置を書かない）', '$\\begin{pmatrix}4&a\\\\-2&1\\end{pmatrix}$ → $a=-2$'],
    why: '対称な行列は、転置しても変わらない行列（$a_{ij}=a_{ji}$。7-1⑦）。転置で動かないのは対角成分だけなので、くらべるのは、対角をはさんで向かい合う組だけ（2×2 は1組、3×3 は3組）。',
    caution: '対角成分どうし（$a_{11}$ と $a_{22}$）は、くらべなくてよい。符号だけちがう組（5 と $-5$）は等しくない。正方行列でないと、対称にはならない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '40mm', s3: '24mm', trap: '40mm' },
    fits(q) {
      if (!/対称/.test(q)) return false;
      const ms = shapes(q).flatMap(x => x.ms);
      return ms.length > 0 && ms.every(A => A.length === A[0].length && A.length > 1);
    },
    steps: {
      // 2×2：1つの文字
      s1(r) {
        const p0 = r.int(-5, 9), s0 = r.int(-5, 9), v = nz(r, -6, 9), up = r.chance(0.5);
        const A = up ? [[p0, 'a'], [v, s0]] : [[p0, v], ['a', s0]];
        if (up && p0 === 4 && v === -2 && s0 === 1) return null;
        return { q: `$${pmS(A)}$ が対称な行列になる $a$`, a: `$a=${v}$`, key: `${p0},${s0},${v},${up}`,
          easy: `向かい合う ${up ? '(1, 2) と (2, 1)' : '(2, 1) と (1, 2)'} の1組だけ：$a=${v}$`, easyCheck: false,
          verify: p => { const R = rawP(p.q), at = R[0][1] === 'a' ? R[1][0] : R[0][1]; return p.a === `$a=${at}$` || 'ちがう'; } };
      },
      // 3×3：2つの文字・対称かどうか
      s2(r) {
        const d = [r.int(-3, 9), r.int(-3, 9), r.int(-3, 9)], o = [r.int(-5, 9), r.int(-5, 9), r.int(-5, 9)];
        const S = [[d[0], o[0], o[1]], [o[0], d[1], o[2]], [o[1], o[2], d[2]]];
        if (kM(S) === kM([[3, 0, 2], [0, 1, 4], [2, 4, 6]])) return null;
        if (turn(r, '14s2', 2)) {
          const pos = r.shuffle([[0, 1], [0, 2], [1, 2], [1, 0], [2, 0], [2, 1]]);
          const [pa, pb] = [pos[0], pos.slice(1).find(([i, j]) => !(i === pos[0][1] && j === pos[0][0]))];
          const A = S.map(row => row.slice()); A[pa[0]][pa[1]] = 'a'; A[pb[0]][pb[1]] = 'b';
          const va = S[pa[1]][pa[0]], vb = S[pb[1]][pb[0]];
          return { q: `$${pmS(A)}$ が対称な行列になる $a$、$b$`, a: `$a=${va}$、$b=${vb}$`, key: kM(S) + `|${pa}|${pb}`,
            easy: `$a$ と $b$ の向かい合う成分を見る：$a=${va}$、$b=${vb}$`, easyCheck: false,
            verify: p => { const R = rawP(p.q), at = ch => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (R[i][j] === ch) return R[j][i]; }; return p.a === `$a=${at('a')}$、$b=${at('b')}$` || 'ちがう'; } };
        }
        const ok = r.chance(0.5), A = S.map(row => row.slice());
        let bad = null;
        if (!ok) { const [i, j] = r.pick([[0, 1], [0, 2], [1, 2]]); A[j][i] = A[i][j] + r.pick([1, -1, 2]); if (A[i][j] !== 0 && r.chance(0.4)) A[j][i] = -A[i][j]; bad = [i, j]; }
        if (!ok && A[bad[0]][bad[1]] === A[bad[1]][bad[0]]) return null;
        return { q: `$${pm(A)}$ は対称な行列か □`, a: ok ? '対称である' : `対称でない（(${bad[0] + 1}, ${bad[1] + 1}) 成分と (${bad[1] + 1}, ${bad[0] + 1}) 成分がちがう）`, key: kM(A),
          easy: '向かい合う3組（(1, 2) と (2, 1)、(1, 3) と (3, 1)、(2, 3) と (3, 2)）だけを見る', easyCheck: false,
          verify: p => { const U = matsOf(p.q)[0]; const diff = [[0, 1], [0, 2], [1, 2]].filter(([i, j]) => U[i][j] !== U[j][i]); return (diff.length === 0 ? p.a === '対称である' : p.a === `対称でない（(${diff[0][0] + 1}, ${diff[0][1] + 1}) 成分と (${diff[0][1] + 1}, ${diff[0][0] + 1}) 成分がちがう）`) || 'ちがう'; } };
      },
      // ア〜ウから選ぶ・式の入った成分
      s3(r) {
        if (turn(r, '14s3', 2)) {
          const make = kind => {
            const n = r.pick([2, 3]), A = rmat(r, n, n, -3, 9); for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) A[i][j] = A[j][i];
            if (kind === 1) { const [i, j] = n === 2 ? [0, 1] : r.pick([[0, 1], [0, 2], [1, 2]]); A[j][i] = A[i][j] === 0 ? 1 : -A[i][j]; }
            if (kind === 2) { const [i, j] = n === 2 ? [0, 1] : r.pick([[0, 1], [0, 2], [1, 2]]); A[j][i] = A[i][j] + 1; }
            return A;
          };
          const kinds = r.shuffle([0, r.pick([0, 1, 2]), r.pick([1, 2])]), As = kinds.map(make);
          if (As.some(A => kM(A) === kM([[3, 0, 2], [0, 1, 4], [2, 4, 6]]))) return null;
          const ans = As.map((A, k) => (symm(A) ? LAB[k] : null)).filter(Boolean).join('と');
          return { q: `次のうち、対称な行列はどれか（すべて）□　${As.map((A, k) => `${LAB[k]} $${pm(A)}$`).join('　')}`, a: ans, key: As.map(kM).join('/'), boxw: '20mm',
            easy: '向かい合う組だけをくらべる。符号だけちがう組も等しくない', easyCheck: false,
            verify: p => { const ms = matsOf(p.q); return p.a === ms.map((A, k) => (symm(A) ? LAB[k] : null)).filter(Boolean).join('と') || 'ちがう'; } };
        }
        const v = r.int(-4, 9), k = r.pick([1, 2, 3]), c = r.int(-5, 5), x = (v - c) / k;
        if (!Number.isInteger(x) || c === 0) return null;
        const ex = `${k === 1 ? '' : k}x${c > 0 ? '+' : ''}${c}`, d1 = r.int(-3, 9), d2 = r.int(-3, 9), up = r.chance(0.5);
        const A = up ? [[d1, ex], [v, d2]] : [[d1, v], [ex, d2]];
        return { q: `$${pmS(A)}$ が対称な行列になる $x$`, a: `$x=${x}$`, key: `x|${kM(A)}`, boxw: '16mm',
          easy: `向かい合う成分が等しい：$${ex}=${v}$ を解いて $x=${x}$`, easyCheck: false,
          verify: p => { const R = rawP(p.q), [e, w] = /x/.test(R[0][1]) ? [R[0][1], R[1][0]] : [R[1][0], R[0][1]], xx = numsOf(p.a)[0]; return close(M.evalMath(e, { x: xx }), +w) || 'ちがう'; } };
      },
      // わな：正方行列でない（7-02）
      trap(r) {
        const [n, m] = r.pick([[2, 3], [3, 2]]), A = rmat(r, n, m, 0, 6);
        for (let i = 0; i < Math.min(n, m); i++) for (let j = 0; j < i; j++) A[i][j] = A[j][i];   // 向かい合う組は等しく見える
        return dest({ q: `$${pm(A)}$ は対称な行列か □`, a: `対称ではない（${n}×${m} で、正方行列ではない）`, key: 't|' + kM(A),
          verify: p => { const U = matsOf(p.q)[0]; return (U.length !== U[0].length && p.a.startsWith('対称ではない')) || 'ちがう'; } }, '7-14',
        `${n}×${m} 行列は正方行列ではない。転置すると ${m}×${n} になり、もとと同じにはならない`, ['7-02']);
      },
    },
  });

  // ================================================================ 7-15
  // 左ページの例：A=[[2,1],[1,2]]、B=[[1,0],[3,1]]、A2:B3 と C2:D3 の MMULT（O-2。この組は出さない）
  const npA = A => `np.array([${A.map(row => '[' + row.join(', ') + ']').join(', ')}])`;
  const codeMats = c => { const o = {}; for (const m of String(c).matchAll(/^(\w+) = np\.array\((\[.*\])\)$/gm)) o[m[1]] = JSON.parse(m[2]); return o; };
  const COLS = 'ABCDEFGH';
  const rng = (c0, r0, n, m) => `${COLS[c0]}${r0}:${COLS[c0 + m - 1]}${r0 + n - 1}`;   // 左上の列番号 c0（0 が A）・行 r0、n 行 m 列
  const isEx15 = (A, B) => kM(A) === kM([[2, 1], [1, 2]]) && kM(B) === kM([[1, 0], [3, 1]]);
  // プログラムの print を、別の道すじで計算する
  function runCode(c) {
    const D = codeMats(c), line = /print\((.*)\)\s*$/.exec(String(c).trim())[1];
    let m;
    if ((m = /^(\w+) @ (\w+)$/.exec(line))) { const B = D[m[2]]; return mul(D[m[1]], Array.isArray(B[0]) ? B : col(B)); }
    if ((m = /^(\w+) \* (\w+)$/.exec(line))) return D[m[1]].map((row, i) => row.map((v, j) => v * D[m[2]][i][j]));
    if ((m = /^(\w+)\.T$/.exec(line))) return D[m[1]][0].map((_, j) => D[m[1]].map(row => row[j]));
    return null;
  }
  M.add({
    id: '7-15', part: 1, chap: '7-1⑨ 例題9', stars: 1,
    title: 'Python の `@` は行列の積、`*` は同じ場所どうしの積。表計算は `=MMULT(左の範囲,右の範囲)`',
    mark: 'プログラムの `A @ B`・`A * B`、表計算の MMULT。',
    futsu: ['プログラムをコンピュータに打ちこんで', '実行し、表示を見て答える', '（コンピュータがないと答えられない）。'],
    raku: ['`A=[[2,1],[1,2]]`、`B=[[1,0],[3,1]]`', '`A @ B` は積：`[[5 1] [7 2]]`', '`A * B` は同じ場所：`[[2 0] [3 2]]`', '表計算：`=MMULT(A2:B3,C2:D3)`'],
    why: 'numpy の `@` は行列の積（行と列をなぞって、かけて、たす）、`*` は同じ場所の成分どうしのかけ算、`.T` は転置（7-1⑨）。表計算の MMULT も行列の積で、かっこの中は（左の範囲,右の範囲）の順。',
    caution: '`*` の答えは、行列の積とはちがう（まちがえやすいところ④）。MMULT の範囲の順を入れかえると、$BA$ になる。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '44mm', trap: '12mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '8mm', trap: '8mm' },
    fits(q, p) {
      if (p && p.code) return /@|\*|\.T\b/.test(p.code) && !/linalg/.test(p.code);
      return /MMULT/.test(q) || (/表計算/.test(q) && /積/.test(q)) || !!(p && p.table && JSON.stringify(p.table).includes('MMULT'));
    },
    steps: {
      // A @ B・A * B（2×2）
      s1(r) {
        const A = rmat(r, 2, 2, 0, 5), B = rmat(r, 2, 2, 0, 5), op = turn(r, '15s1', 2) ? '@' : '*';
        if (isEx15(A, B) || isDiag(A) || isDiag(B)) return null;
        const C = op === '@' ? Mmul(A, B) : A.map((row, i) => row.map((v, j) => v * B[i][j]));
        return { q: '次のプログラムで表示される数を、行列の形で □', code: `import numpy as np\nA = ${npA(A)}\nB = ${npA(B)}\nprint(A ${op} B)`, a: `$${pm(C)}$`, key: `${op}|${kM(A)}|${kM(B)}`, calc: calcM(C),
          easy: op === '@' ? `\`@\` は行列の積。${prodTxt(A, B, C)}` : '`*` は同じ場所どうしの積（行列の積ではない）', easyCheck: false,
          verify: p => okM(ansM(p.a), runCode(p.code), 'プログラム') };
      },
      // B @ A・A.T・A @ v
      s2(r) {
        const t = turn(r, '15s2', 3), A = rmat(r, 2, 2, 0, 5), B = rmat(r, 2, 2, 0, 5);
        if (isEx15(A, B) || isDiag(A) || isDiag(B)) return null;
        if (t === 0) {
          const C = Mmul(B, A);
          return { q: '次のプログラムで表示される数を、行列の形で □', code: `import numpy as np\nA = ${npA(A)}\nB = ${npA(B)}\nprint(B @ A)`, a: `$${pm(C)}$`, key: `@|${kM(B)}|${kM(A)}`, calc: calcM(C),
            easy: `\`B @ A\` は $BA$（左が $B$）。${prodTxt(B, A, C)}`, easyCheck: false, verify: p => okM(ansM(p.a), runCode(p.code), 'プログラム') };
        }
        if (t === 1) {
          const A3 = rmat(r, 2, 3, 0, 9), C = MT(A3);
          return { q: '次のプログラムで表示される数を、行列の形で □', code: `import numpy as np\nA = ${npA(A3)}\nprint(A.T)`, a: `$${pm(C)}$`, key: `T|${kM(A3)}`, calc: calcM(C), boxh: '16mm',
            easy: '`.T` は転置。1行めが1列めになり、3×2 になる', easyCheck: false, verify: p => okM(ansM(p.a), runCode(p.code), 'プログラム') };
        }
        const v = [r.int(1, 6), r.int(0, 6)], C = Mmul(A, col(v));
        return { q: '次のプログラムで表示される数を、たてのベクトルで □', code: `import numpy as np\nA = ${npA(A)}\nv = np.array([${v.join(', ')}])\nprint(A @ v)`, a: `$${pm(C)}$`, key: `v|${kM(A)}|${v}`, calc: calcM(C), boxw: '12mm',
          easy: `\`A @ v\` は行列×ベクトル（表示は横1行）。${rowsTxt(A, v)}`, easyCheck: false, verify: p => okM(ansM(p.a), runCode(p.code), 'プログラム') };
      },
      // 表計算の MMULT（範囲を書く・BA・表の答え）
      s3(r) {
        const t = turn(r, '15s3', 3);
        if (t < 2) {
          let n, k, m, ba = t === 1;
          if (ba) { n = k = m = r.pick([2, 3]); } else { [n, k, m] = r.pick([[3, 3, 1], [2, 3, 2], [3, 2, 2], [2, 2, 1], [3, 2, 1], [2, 3, 1]]); }
          const rA = rng(0, 2, n, k), rB = rng(k, 2, k, m), out = `${COLS[k + m]}2`;
          const what = m === 1 ? 'ベクトル $\\vec b$' : '行列 $B$', prod = ba ? '$BA$' : (m === 1 ? '$A\\vec b$' : '$AB$');
          const ans = ba ? `=MMULT(${rB},${rA})` : `=MMULT(${rA},${rB})`;
          return { q: `表計算で、${rA} に${n}×${k} の行列 $A$、${rB} に${what} を入れた。積 ${prod} を ${out} から出すには、${out} に何と入れるか □`, a: '`' + ans + '`', key: `x${n},${k},${m},${ba}`,
            easy: `かっこの中は（左の範囲,右の範囲）。${ba ? '$BA$ は $B$ が左' : '$A$ が左'}`, easyCheck: false,
            verify: p => { const R = [...p.q.matchAll(/([A-H]\d:[A-H]\d) に/g)].map(x => x[1]); const want = /\$BA\$/.test(p.q) ? `=MMULT(${R[1]},${R[0]})` : `=MMULT(${R[0]},${R[1]})`; return p.a === '`' + want + '`' || 'ちがう'; } };
        }
        const A = rmat(r, 2, 2, 1, 6), v = [10 * r.int(2, 9), 10 * r.int(2, 9)], C = Mmul(A, col(v));
        return { q: '下の表計算の画面で、D2 に式を入れた。D2・D3 に出る数を、たてのベクトルで □', key: `t|${kM(A)}|${v}`, a: `$${pm(C)}$`, calc: calcM(C), boxw: '14mm', boxh: '12mm',
          table: { head: ['', 'A', 'B', 'C', 'D'], rows: [['1', '行列', '', 'ベクトル', '答え'], ['2', String(A[0][0]), String(A[0][1]), String(v[0]), '`=MMULT(A2:B3,C2:C3)`'], ['3', String(A[1][0]), String(A[1][1]), String(v[1]), '']] },
          easy: `A2:B3 の行列と C2:C3 のベクトルの積。${rowsTxt(A, v)}`, easyCheck: false,
          verify: p => { const R = p.table.rows; return okM(ansM(p.a), mul([[+R[1][1], +R[1][2]], [+R[2][1], +R[2][2]]], [[+R[1][3]], [+R[2][3]]]), 'MMULT'); } };
      },
      // わな：np.linalg.det（行列式。7-31）
      trap(r) {
        const A = rmat(r, 2, 2, -3, 6), d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        if (d === 0 || isDiag(A)) return null;
        return dest({ q: '次のプログラムで表示される数（小数のわずかなずれは考えない）□', code: `import numpy as np\nA = ${npA(A)}\nprint(np.linalg.det(A))`, a: `$${d}$`, key: `d|${kM(A)}`,
          verify: p => { const U = codeMats(p.code).A; return close(numsOf(p.a)[0], U[0][0] * U[1][1] - U[0][1] * U[1][0]) || 'ちがう'; } }, '7-15',
        '`np.linalg.det` は行列の積ではなく、行列式 $ad-bc$', ['7-31']);
      },
    },
  });

  // ================================================================ 7-91
  // 左ページの例：(2 3)(4; -1)=5（O-2。この組は出さない）
  const vdefs = q => { const o = {}; maths(q).forEach(m => { const k = /^\\vec ([a-zA-Z])=(\\begin\{pmatrix\}[\s\S]*\\end\{pmatrix\})$/.exec(m); if (k) o[k[1]] = matsOf(k[2])[0].map(row => row[0]); }); return o; };
  const dot = (a, b) => a.reduce((s, x, k) => s + x * b[k], 0);
  M.add({
    id: '7-91', part: 1, chap: '7-1（もっと）', stars: 1,
    title: '内積は行ベクトル×列ベクトル $\\vec a^{\\mathsf T}\\vec b$（$(1\\times n)(n\\times1)$ で、答えは数1つ）',
    mark: '横のベクトル×たてのベクトル、$\\vec a^{\\mathsf T}\\vec b$。',
    futsu: ['$\\begin{pmatrix}2&3\\end{pmatrix}\\begin{pmatrix}4\\\\-1\\end{pmatrix}$ を、', '2つの矢印を方眼にかいて、', '長さとなす角をはかり、', '$|\\vec a||\\vec b|\\cos\\theta$ で計算する。'],
    raku: ['$\\begin{pmatrix}2&3\\end{pmatrix}\\begin{pmatrix}4\\\\-1\\end{pmatrix}$', '$=2\\times4+3\\times(-1)=5$', '$(1\\times2)(2\\times1)\\to1\\times1$：数1つ'],
    why: '行ベクトル（$1\\times n$）と列ベクトル（$n\\times1$）の積は、内側の $n$ がそろうのでかけられて、答えは $1\\times1$、つまり数1つ（7-1⑥）。その計算「同じ番号どうしの積の和」は、4-12 の内積そのもの。だから $\\vec a\\cdot\\vec b=\\vec a^{\\mathsf T}\\vec b$ と書ける（7-1 もっと知りたい）。',
    caution: '順を逆にした「列ベクトル×行ベクトル」（$(n\\times1)(1\\times n)$）は、$n\\times n$ の行列になる（内積ではない）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '12mm', s3: '20mm', trap: '20mm' }, boxh: { trap: '12mm' },
    fits(q) {
      if (prods(q).some(([A, B]) => A.length === 1 && B[0].length === 1 && A[0].length === B.length && B.length > 1)) return true;
      return /\\vec [a-zA-Z]\^\{\\mathsf T\}\\vec [a-zA-Z]/.test(q);
    },
    steps: {
      // (1×2)(2×1)
      s1(r) {
        const a = [nz(r, -4, 6), nz(r, -4, 6)], b = [nz(r, -4, 6), r.int(-4, 6)];
        if (String(a) === '2,3' || String(b) === '4,-1') return null;
        return { q: `$${pm([a])}${pm(col(b))}$`, a: `$${dot(a, b)}$`, key: `${a}|${b}`,
          easy: `$${dotTxt(a, b)}=${dot(a, b)}$（数1つ）`, easyCheck: false,
          verify: p => { const [U, V] = matsOf(p.q); return close(numsOf(p.a)[0], mul(U, V)[0][0]) || 'ちがう'; } };
      },
      // (1×3)(3×1)・a^T b（たてのベクトルで定めたもの）
      s2(r) {
        const n = 3, a = Array.from({ length: n }, () => r.int(-3, 5)), b = Array.from({ length: n }, () => r.int(-3, 5));
        if (a.filter(x => x).length < 2 || b.filter(x => x).length < 2 || String(a.slice(0, 2)) === '2,3' || String(b.slice(0, 2)) === '4,-1') return null;
        if (turn(r, '91s2', 2)) {
          return { q: `$${pm([a])}${pm(col(b))}$`, a: `$${dot(a, b)}$`, key: `${a}|${b}`,
            easy: `$${dotTxt(a, b)}=${dot(a, b)}$`, easyCheck: false,
            verify: p => { const [U, V] = matsOf(p.q); return close(numsOf(p.a)[0], mul(U, V)[0][0]) || 'ちがう'; } };
        }
        const a2 = a.slice(0, 2).map(x => x || 1), b2 = b.slice(0, 2).map(x => x || 2);
        return { q: `$\\vec a=${pm(col(a2))}$、$\\vec b=${pm(col(b2))}$ のとき、$\\vec a^{\\mathsf T}\\vec b$`, a: `$${dot(a2, b2)}$`, key: `${a2}|${b2}`, boxw: '12mm',
          easy: `$\\vec a^{\\mathsf T}=${pm([a2])}$ と $\\vec b$ の積：$${dotTxt(a2, b2)}=${dot(a2, b2)}$`, easyCheck: false,
          verify: p => { const D = vdefs(p.q); return close(numsOf(p.a)[0], dot(D.a, D.b)) || 'ちがう'; } };
      },
      // a^T a・内積が0になる k・仕事 W=F^T s
      s3(r) {
        const t = turn(r, '91s3', 3);
        if (t === 0) {
          const a = [nz(r, -4, 5), nz(r, -4, 5)];
          return { q: `$\\vec a=${pm(col(a))}$ のとき、$\\vec a^{\\mathsf T}\\vec a$（$\\vec a$ の大きさの2乗）`, a: `$${dot(a, a)}$`, key: `${a}|${a}`, boxw: '12mm',
            easy: `$${a.map(x => `${par(x)}^{2}`).join('+')}=${dot(a, a)}$`, easyCheck: false,
            verify: p => { const D = vdefs(p.q); return close(numsOf(p.a)[0], dot(D.a, D.a)) || 'ちがう'; } };
        }
        if (t === 1) {
          const p0 = nz(r, -4, 5), q0 = nz(r, -4, 5), s0 = nz(r, -3, 4), k = -p0 * q0 / s0;
          if (!Number.isInteger(k) || k === 0) return null;
          return { q: `$\\vec a=${pmS(col([p0, 'k']))}$、$\\vec b=${pm(col([q0, s0]))}$ で、$\\vec a^{\\mathsf T}\\vec b=0$ となる $k$`, a: `$k=${k}$`, key: `k|${p0},${q0},${s0}`, boxw: '16mm',
            easy: `$${p0}\\times${par(q0)}+k\\times${par(s0)}=0$ を解く`, easyCheck: false,
            verify: p => { const R = rawP(maths(p.q)[0]), b = vdefs(p.q).b, kk = numsOf(p.a)[0]; return close(+R[0][0] * b[0] + kk * b[1], 0) || 'ちがう'; } };
        }
        const Fv = [nz(r, -3, 6), nz(r, -3, 6)], sv = [r.int(1, 5), r.int(-2, 4)], w = dot(Fv, sv);
        if (w <= 0) return null;
        return { q: `力 $\\vec F=${pm(col(Fv))}$〔N〕で、物体が $\\vec s=${pm(col(sv))}$〔m〕だけ動いた。力がした仕事 $W=\\vec F^{\\mathsf T}\\vec s$`, a: `$${w}\\,\\mathrm{J}$`, key: `w|${Fv}|${sv}`, boxw: '18mm',
          easy: `$${dotTxt(Fv, sv)}=${w}$（4-12 の仕事と同じ）`, easyCheck: false,
          verify: p => { const D = vdefs(p.q); return close(numsOf(p.a)[0], dot(D.F, D.s)) || 'ちがう'; } };
      },
      // わな：列ベクトル×行ベクトル（行列になる。7-10）
      trap(r) {
        const a = [nz(r, -3, 5), nz(r, -3, 5)], b = [nz(r, -3, 5), nz(r, -3, 5)], C = Mmul(col(a), [b]);
        return dest({ q: `$${pm(col(a))}${pm([b])}$`, a: `$${pm(C)}$`, key: `t|${a}|${b}`, calc: calcM(C),
          verify: p => { const [U, V] = matsOf(p.q); return okM(ansM(p.a), mul(U, V), '積'); } }, '7-91',
        '順が逆の「たて×横」。$(2\\times1)(1\\times2)$ で、答えは2×2 の行列（内積ではない）', ['7-10']);
      },
    },
  });

  // ================================================================ 左ページの例の行列をよける（O-2）
  // 「ふつうに解くと」「楽な形にすると」に書いた行列・ベクトル（成分が2つ以上）が、同じ見開きの問題の文に出たら、その問題は作りなおす
  M.list(7).filter(id => M.waza[id].part === 1).forEach(id => {
    const d = M.waza[id];
    const ex = new Set([...[...d.futsu, ...d.raku].join(' ').matchAll(PMRE)].map(m => readP(m[1])).filter(A => A.flat().length > 1 && A.flat().every(v => v != null)).map(kM));
    if (!ex.size) return;
    Object.keys(d.steps).forEach(st => {
      const f = d.steps[st];
      d.steps[st] = r => { const p = f(r); return p && matsOf(p.q).some(A => ex.has(kM(A))) ? null : p; };
    });
  });

})(globalThis.MONDAI);
