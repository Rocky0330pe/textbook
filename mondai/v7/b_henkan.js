/* 問題集 第7巻　第2部 形を変える機械と、変換をつなぐ（わざ 7-16〜7-30、7-92）　組 b
 * 書き方は v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第7巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 7-2・7-3 の数・ことば・記号にそろえる（物差しの矢印 $\vec e_x$、行き先、ずらし、裏返し、ヤコビ行列、応力、箱の行列（四端子定数）、すき間・レンズ）。
 *   「腕」「選ぶ」は常用漢字で書く（Q-11）。かなで書く語：なぞる、のびる・ちぢむ、ずらし、すき間、かたむき、たて。
 * 行列の答えは pmatrix（Q-2）。検算は calc（kind 'mat'）。点・ベクトルの答えは $(5,\ 4)$ と横に書き、verify(p) で、問題の文の行列を読み直して
 *   別の道すじ（成分ごとの小数の計算）で確かめる。ことば・組の答えも verify(p)。複素数 $j$ の行列（7-30）は calc mat の文字の want（M.evalC）。
 * 単位は $2\,\mathrm{\Omega}$・$10\,\mathrm{mH}$・$1\,\mathrm{\mu F}$・$0.30\,\mathrm{m}$・$0.4\,\mathrm{rad/s}$（O-7・P-14 と同じ書き方）。
 * 近似値は第39回の値（Q-4：$\cos30^{\circ}=0.866$、$\cos45^{\circ}=0.707$）を文に書き、文の値で計算して丸めた答えと、ほんとうの値を丸めた答えが
 *   くいちがう組は出さない（O-4。agree()）。近似の答えは「約」と ≈。電卓なし（Q-5）：腕の角は 0°・90°・180°・$-90^{\circ}$ だけ（わなの手の位置だけ 30°・60°）。
 * 図はステップ3だけ（K-2）：7-18 は方眼の家（もとの家は点線）、7-21 は2本の腕、7-27 は箱の回路（M.figResistor）。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2。bad()）。key は、ステップがちがっても同じ問題なら同じになる形にする。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。第40回 S-7・第41回 U-4）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F, Mat = M.Mat;
  const D = x => (Array.isArray(x) ? x : F.fromDec(String(x)));          // 0.5 → [1, 2]、3 → [3, 1]
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 分数 f の、正確な小数（分母が 2 と 5 だけのとき）。そうでなければ null
  function dec(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1n;
    while (k < 15 && (BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) { k++; p *= 10n; }
    if ((BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) return null;
    const N = (BigInt(Math.abs(n)) * p / BigInt(d)).toString().padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  // 分数 f を小数第 k 位までに四捨五入した文字（文に書いた値で計算した答え）
  function roundStr(f, k) {
    const [n, d] = f, sg = n < 0 ? '-' : '', p = 10n ** BigInt(k);
    const N = ((2n * BigInt(Math.abs(n)) * p + BigInt(d)) / (2n * BigInt(d))).toString().padStart(k + 1, '0');
    const t = k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N;
    return (/[1-9]/.test(t) ? sg : '') + t;
  }
  const trueRd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  // 文の値で計算した答え f（分数）と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4）。ちがえば null
  const agree = (f, v, k) => { const a = roundStr(f, k); return a === trueRd(v, k) ? a : null; };
  const nt = x => { const f = D(x); return f[1] === 1 ? String(f[0]) : (dec(f) || F.tex(f)); };   // 数の TeX：整数・小数・\frac
  const ntp = x => (D(x)[0] < 0 ? `(${nt(x)})` : nt(x));   // かけ算の右の負の数はかっこごと（$10\times(-1)$。U-6・R1-12）
  const n2 = x => { const f = D(x); if (f[0] === 0) return '0'; const s = dec(f); if (!s) return F.tex(f); const [i, fr = ''] = s.split('.'); return fr.length >= 2 ? s : i + '.' + (fr + '00').slice(0, 2); };   // 長さ（m）：0.30 のように小数第2位まで
  const mk = rows => rows.map(r => r.map(D));                             // 分数の行列
  const mt = (A, f) => `\\begin{pmatrix}${A.map(r => r.map(f || nt).join('&')).join('\\\\')}\\end{pmatrix}`;
  const cv = (v, f) => mt(v.map(x => [x]), f);                            // たてのベクトル
  const pt = (v, f) => `(${v.map(f || nt).join(',\\ ')})`;                 // 点・横に書いたベクトル
  const mulv = (A, v) => Mat.mul(A, v.map(x => [D(x)])).map(r => r[0]);
  const vadd = (u, v) => u.map((x, i) => F.add(D(x), D(v[i])));
  const vsc = (u, c) => u.map(x => F.mul(D(x), D(c)));
  const isZ = f => D(f)[0] === 0;
  const sig = A => A.map(r => r.map(x => nt(x)).join(',')).join(';');       // 行列の key
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const OHM = R => U(nt(R), '\\Omega');
  // 同じ行列か（数の2重の配列か分数の行列）
  const sameM = (A, B) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((x, j) => F.eq(D(x), D(B[i][j]))));

  // ---------------------------------------------------------------- 検算の部品（問題の文を読み直して、小数で計算する）
  const nv = x => (Array.isArray(x) ? x[0] / x[1] : +x);
  // 文の中の pmatrix を、出てきた順に、小数の2重の配列で（複素数は使わない）
  function qMats(s) {
    const out = [], re = /\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g; let m;
    while ((m = re.exec(String(s)))) out.push(m[1].split(/\\\\/).map(r => r.split('&').map(c => ev(c.trim()))));
    return out;
  }
  const mulN = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((t, x, k) => t + x * B[k][j], 0)));
  const mulNv = (A, v) => A.map(r => r.reduce((t, x, k) => t + x * v[k], 0));
  const closeN = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  const sameN = (A, B) => A && B && A.length === B.length && A.every((r, i) => Array.isArray(r) ? (r.length === B[i].length && r.every((x, j) => closeN(x, B[i][j]))) : closeN(r, B[i]));
  // 答えの中の (a,\ b, …) を、小数の配列の配列で
  function readPts(a) {
    const out = [];
    for (const seg of (String(a).match(/\$[^$]*\$/g) || [])) {
      const re = /\(([^()]*)\)/g; let m;
      while ((m = re.exec(seg))) { const xs = m[1].split(',').map(t => ev(t.replace(/\\ /g, '').trim())); if (xs.length > 1 && xs.every(x => x != null && isFinite(x))) out.push(xs); }
    }
    return out;
  }
  const ptIs = (p, want) => { const P = readPts(p.a); return (P.length >= 1 && sameN(P[P.length - 1], want.map(nv))) || `答え ${p.a} が (${want.map(nv).join(', ')}) でない`; };
  const matIs = (p, want) => { const G = M.readMat(p.a); return (G && sameN(G.map(r => r.map(c => c[0])), want.map(r => r.map(nv))) && G.every(r => r.every(c => c[1] === 0))) || `答えの行列 ${p.a} がちがう`; };
  // 答えの中の数（$…$ の中の、単位をのぞいた数）
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(t.slice(1, -1).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '').replace(/^\\approx/, '')));

  // ---------------------------------------------------------------- わな：行き先（N-3）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(7).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 2 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  // 文の中の「行列×たてのベクトル」：[行列の行の数, 列の数, ベクトルの数の個数, ベクトルの成分の文字] の配列
  function prods(q) {
    const out = [];
    for (const t of maths(q)) {
      const re = /\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g; let m;
      while ((m = re.exec(t))) {
        const A = m[1].split(/\\\\/).map(r => r.split('&')), v = m[2].split(/\\\\/).map(r => r.split('&'));
        if (v.every(r => r.length === 1)) out.push({ rows: A.length, cols: A[0].length, n: v.length, v: v.map(r => r[0].trim()), A });
      }
    }
    return out;
  }
  const isDiagTxt = A => A.length === A[0].length && A.every((r, i) => r.every((c, j) => i === j || ev(c.trim()) === 0));

  // ---------------------------------------------------------------- 形のある行列（名前とことば）
  const NAMED = {
    Fy: { m: [[-1, 0], [0, 1]], w: '左右に裏返す（$y$ 軸で折り返す）', n: '左右の裏返し' },
    Fx: { m: [[1, 0], [0, -1]], w: '上下に裏返す（$x$ 軸で折り返す）', n: '上下の裏返し' },
    Fd: { m: [[0, 1], [1, 0]], w: '直線 $y=x$ で折り返す', n: '$y=x$ で折り返し' },
    R90: { m: [[0, -1], [1, 0]], w: '左回りに $90^{\\circ}$ 回す', n: '左回りに $90^{\\circ}$ 回る' },
    Rm90: { m: [[0, 1], [-1, 0]], w: '右回りに $90^{\\circ}$ 回す', n: '右回りに $90^{\\circ}$ 回る' },
    R180: { m: [[-1, 0], [0, -1]], w: '$180^{\\circ}$ 回す', n: '$180^{\\circ}$ 回る' },
  };
  const stretch = (dir, k) => ({ m: dir === 'x' ? [[k, 0], [0, 1]] : [[1, 0], [0, k]], w: `${dir === 'x' ? '横' : 'たて'}に $${nt(k)}$ 倍に${D(k)[0] > D(k)[1] ? 'のばす' : 'ちぢめる'}`, n: `${dir === 'x' ? '横' : 'たて'}に $${nt(k)}$ 倍に${D(k)[0] > D(k)[1] ? 'のびる' : 'ちぢむ'}` });
  const shear = k => ({ m: [[1, k], [0, 1]], w: `高さ $y$ の点を $${nt(Math.abs(k)) === '1' ? '' : nt(Math.abs(k))}y$ だけ${k > 0 ? '右' : '左'}へずらす`, n: `ずらし（上ほど${k > 0 ? '右' : '左'}へ）` });
  // 答えのことばから行列を作り直す（検算用。ずらしは向きだけなので、k は行列から読む）
  function matOfName(t, A) {
    t = M.plain(String(t)).replace(/\$/g, '');
    let m;
    if (/左右の裏返し/.test(t)) return [[-1, 0], [0, 1]];
    if (/上下の裏返し/.test(t)) return [[1, 0], [0, -1]];
    if (/y=x/.test(t)) return [[0, 1], [1, 0]];
    if (/左回りに ?90/.test(t)) return [[0, -1], [1, 0]];
    if (/右回りに ?90/.test(t)) return [[0, 1], [-1, 0]];
    if (/180/.test(t)) return [[-1, 0], [0, -1]];
    if ((m = /(横|たて)に ?([\d.]+|\\frac\{\d+\}\{\d+\}) ?倍/.exec(t))) { const k = ev(m[2]); return m[1] === '横' ? [[k, 0], [0, 1]] : [[1, 0], [0, k]]; }
    if ((m = /ずらし（上ほど(右|左)へ）/.exec(t))) { const k = A[0][1]; return (m[1] === '右') === (k > 0) ? [[1, k], [0, 1]] : null; }
    return null;
  }

  // ---------------------------------------------------------------- 図：方眼の家（かど (0,0)(2,0)(2,2)(1,3)(0,2)、戸は右より。教科書 7-0〜7-2）
  const HOUSE = [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]], DOOR = [[1.25, 0], [1.25, 1], [1.75, 1], [1.75, 0]];
  function houseFig(A) {
    const T = P => [A[0][0] * P[0] + A[0][1] * P[1], A[1][0] * P[0] + A[1][1] * P[1]];
    const all = HOUSE.concat(HOUSE.map(T));
    const x0 = Math.floor(Math.min(0, ...all.map(p => p[0]))) - 1, x1 = Math.ceil(Math.max(0, ...all.map(p => p[0]))) + 1;
    // 上に1マス余分にとる（y のラベルが屋根の先に重ならないように。U-8・R1-3）
    const y0 = Math.floor(Math.min(0, ...all.map(p => p[1]))) - 1, y1 = Math.ceil(Math.max(0, ...all.map(p => p[1]))) + 2;
    const s = Math.min(3.6, 46 / (x1 - x0), 24 / (y1 - y0));
    // 点線のもとの家は、実線の家のぬりのあとに描く（ぬりにかくれないように。U-1・R1-3）
    return { s, pad: Math.max(0.6, 4 / s), items: [['grid', x0, y0, x1, y1], ['axes', x0, x1 + 0.3, y0, y1 + 0.3, { o: 'sw' }],
      ['poly', HOUSE.map(T), { fill: true, thick: true }], ['path', DOOR.map(T), { thick: true }],
      ['poly', HOUSE, { dash: true }], ['path', DOOR, { dash: true }]] };
  }

  // ================================================================ 7-16
  // 左ページの例（O-2）：raku の3つの行列は、どのステップにも出さない
  const EX16 = [[[2, 1], [1, 2]], [[2, 5], [1, 3]], [[3, -1], [1, 2]]];
  const bad16 = A => EX16.some(E => sameM(E, A));
  function rand2(r, lo, hi) {   // 2つの列がちがう、0 の少ない2×2 の行列
    for (let k = 0; k < 50; k++) {
      const A = [[r.int(lo, hi), r.int(lo, hi)], [r.int(lo, hi), r.int(lo, hi)]];
      if (A.flat().filter(x => x === 0).length > 1 || (A[0][0] === A[0][1] && A[1][0] === A[1][1]) || bad16(A)) continue;
      return A;
    }
    return null;
  }
  const EVEC = { x: [1, 0], y: [0, 1] };
  M.add({
    id: '7-16', part: 2, chap: '7-2④ 例題4', stars: 1,
    title: '列は物差しの行き先：$\\vec e_x$ を入れると1列め、$(x,\\ y)$ を入れると「$x$×1列め＋$y$×2列め」',
    mark: 'ベクトルに0や1がある行列×ベクトル、「$\\vec e_x$ はどこへ行く」。入れる数で、1列め・2列めを何本つなぐかが見える形。',
    futsu: ['$\\begin{pmatrix}2&5\\\\1&3\\end{pmatrix}\\begin{pmatrix}0\\\\3\\end{pmatrix}$ を行でなぞる：', '1行め $2\\times0+5\\times3=15$', '2行め $1\\times0+3\\times3=9$', '（0をかける所も全部書く）'],
    raku: ['$\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix}$ → 1列め $(2,\\ 1)$', '$\\begin{pmatrix}2&5\\\\1&3\\end{pmatrix}\\begin{pmatrix}0\\\\3\\end{pmatrix}$ → 2列めの3倍 $(15,\\ 9)$', '$\\begin{pmatrix}3&-1\\\\1&2\\end{pmatrix}\\begin{pmatrix}2\\\\1\\end{pmatrix}=2(3,\\ 1)+(-1,\\ 2)$', '$=(5,\\ 4)$'],
    why: '$\\vec e_x=(1,\\ 0)$ を入れると、1行めも2行めも「1列めの数×1＋2列めの数×0」なので、1列めだけが残る（7-2④）。$(x,\\ y)=x\\vec e_x+y\\vec e_y$ なので、行き先は「1列めを $x$ 本、2列めを $y$ 本つないだ所」。行でなぞる計算と、同じ4つのかけ算を列ごとにまとめただけ。',
    caution: '1列めは「たての列」の2つの数（$\\begin{pmatrix}2&5\\\\1&3\\end{pmatrix}$ の1列めは $(2,\\ 1)$。1行めの $(2,\\ 5)$ ではない）。$\\vec e_y$ は2列め。かけたあとの点から、かける前の点をさがす問いは、このわざではない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '22mm', s3: '30mm', trap: '22mm' },
    fits(q) {
      if (/なる点|かける前|動かす行列|行き先から|変わり方/.test(q)) return false;
      if (prods(q).some(o => o.rows === o.cols && o.n === o.cols)) return true;
      return /\\vec e_[xyz]/.test(q) && /pmatrix/.test(q) && !/へ動かす/.test(q);
    },
    steps: {
      // 物差しの矢印、その何倍
      s1(r) {
        const kind = turn(r, '16s1', 4), A = rand2(r, -5, 9); if (!A) return null;
        const k = r.pick([2, 3, 4, 5, -2, -3]);
        const v = kind === 0 ? [1, 0] : kind === 1 ? [0, 1] : kind === 2 ? [0, k] : [k, 0];
        const Av = mulv(mk(A), v), col = kind === 0 || kind === 3 ? 1 : 2;
        const useE = kind < 2 && r.chance(0.5);
        const q = useE ? `$A=${mt(A)}$ のとき、$A\\vec e_${kind === 0 ? 'x' : 'y'}$` : `$${mt(A)}${cv(v)}$`;
        return { q, a: `$${pt(Av)}$`, key: `16|${sig(A)}|${v}`, easyCheck: false,
          easy: kind < 2 ? `${col}列め` : `${col}列めの $${k}$ 倍`,
          verify: p => ptIs(p, mulNv(A, v)) };
      },
      // ふつうの (x, y)：x×1列め＋y×2列め（4問に1問は3×3 で、数が1つだけのベクトル）
      s2(r) {
        if (turn(r, '16s2', 4) === 3) {
          const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 6)));
          if (A.flat().filter(x => x === 0).length > 3) return null;
          const j = r.int(0, 2), k = r.pick([2, 3, -1, -2]), v = [0, 0, 0]; v[j] = k;
          return { q: `$${mt(A)}${cv(v)}$`, a: `$${pt(mulv(mk(A), v))}$`, key: `16|${sig(A)}|${v}`, easyCheck: false,
            easy: `${j + 1}列めの $${k}$ 倍`, verify: p => ptIs(p, mulNv(A, v)) };
        }
        const A = rand2(r, -4, 6); if (!A) return null;
        const x = r.pick([1, 2, 3, -1, -2]), y = r.pick([1, 2, 3, -1, -2, 4]);
        if (x === 1 && y === 1) return null;
        const v = [x, y], c1 = [A[0][0], A[1][0]], c2 = [A[0][1], A[1][1]];
        const tm = (c, s, first) => `${s === 1 ? (first ? '' : '+') : s === -1 ? '-' : (s > 0 && !first ? '+' : '') + s}${pt(c)}`;
        return { q: `$${mt(A)}${cv(v)}$`, a: `$${pt(mulv(mk(A), v))}$`, key: `16|${sig(A)}|${v}`, easyCheck: false,
          easy: `$${tm(c1, x, true)}${tm(c2, y, false)}$`, verify: p => ptIs(p, mulNv(A, v)) };
      },
      // 見かけがちがう：応力の1列め・2列め、ヤコビ行列でひじだけを回す、ばねの網で1つの点だけずらす
      s3(r) {
        const kind = turn(r, '16s3', 3);
        if (kind === 0) {
          const a = r.pick([40, 50, 60, 70, 90, 100, -30]), b = r.pick([10, 20, 30, 40, -10, -20]), d = r.pick([-40, -20, 10, 20, 50]);
          if (a === 80 && b === 30 && d === -20) return null;
          const S = [[a, b], [b, d]], e = r.pick(['x', 'y']), v = EVEC[e];
          return { q: `応力の行列が $\\sigma=${mt(S)}$（MPa）の点で、$${e}$ の向きに直角な切り口（$\\vec n=\\vec e_${e}$）にはたらく力 $\\vec t$`,
            a: `$${pt(mulv(mk(S), v))}$（MPa）`, key: `16|${sig(S)}|${v}`, easyCheck: false,
            easy: `$\\vec t=\\sigma\\vec e_${e}$ は ${e === 'x' ? 1 : 2}列め`, verify: p => ptIs(p, mulNv(S, v)) };
        }
        if (kind === 1) {
          const g = arm(r); if (!g) return null;
          const w = r.pick(['0.5', '2', '0.4', '-1', '1.5']);
          const v = [0, w], out = mulv(g.J, v);
          return { q: `ヤコビ行列が $J=${mt(g.J, n2)}$ の2本の腕で、肩を止めて、ひじだけを $\\dot\\theta_2=${w}\\,\\mathrm{rad/s}$ で回したときの手の速度（m/s）`,
            a: `$${pt(out, n2)}$`, key: `16|${sig(g.J)}|${v}`, easyCheck: false,
            easy: `$\\dot{\\vec\\theta}=(0,\\ ${w})$ なので、2列めの $${w}$ 倍`, verify: p => ptIs(p, mulNv(g.J.map(row => row.map(nv)), v.map(Number))) };
        }
        const k1 = r.pick([100, 200, 50]), k2 = r.pick([100, 200, 50, 300]), j = r.int(0, 1), u = r.pick(['0.01', '0.02', '0.03', '0.05']);
        const K = [[k1 + k2, -k2], [-k2, k2]], v = j === 0 ? [u, 0] : [0, u], Fv = mulv(mk(K), v);
        return { q: `ばねの網の行列が $K=${mt(K)}$（N/m）のとき、${j === 0 ? '点1だけを' : '点1は動かさず、点2だけを'} $${u}\\,\\mathrm{m}$ 右へずらしておく力 $(F_1,\\ F_2)$（N）`,
          a: `$${pt(Fv)}$`, key: `16|${sig(K)}|${v}`, easyCheck: false,
          easy: `${j + 1}列めの $${u}$ 倍`, verify: p => ptIs(p, mulNv(K, v.map(Number))) };
      },
      // わな：かけたあとの点から、かける前の点（7-40）
      trap(r) {
        for (let t = 0; t < 30; t++) {
          const A = [[r.int(1, 4), r.int(-2, 3)], [r.int(-2, 3), r.int(1, 4)]], dt = A[0][0] * A[1][1] - A[0][1] * A[1][0];
          if (dt === 0 || bad16(A)) continue;
          const x = [r.int(-3, 4), r.int(-3, 4)]; if (!x[0] && !x[1]) continue;
          const b = mulv(mk(A), x);
          return dest({ q: `$${mt(A)}$ をかけると $${pt(b)}$ になる点`, a: `$${pt(x)}$`, key: `16t|${sig(A)}|${x}`,
            verify: p => ptIs(p, x) && (sameN(mulNv(A, readPts(p.a)[0]), b.map(nv)) || 'もどらない') }, '7-16',
            'かけたあとの点から、かける前の点をさがす問い。行列の列を拾うだけでは出ない。逆行列で解く', ['7-40']);
        }
        return null;
      },
    },
  });

  // ---------------------------------------------------------------- 2本の腕（7-2⑧）：角は 0°・90°・180°・-90°
  const CS = { 0: [1, 0], 90: [0, 1], 180: [-1, 0], '-90': [0, -1], 270: [0, -1], '-180': [-1, 0] };
  const cs = d => CS[((d % 360) + 360) % 360 === 270 ? 270 : ((d % 360) + 360) % 360] || CS[d];
  // 腕の形を1つ選ぶ。bad(L1, L2, t1, t2) が true の組はよける
  function arm(r, o) {
    o = o || {};
    for (let k = 0; k < 40; k++) {
      const L1 = r.pick(['0.30', '0.25', '0.40', '0.20', '0.35', '0.50']), L2 = r.pick(['0.25', '0.20', '0.30', '0.15', '0.10', '0.40']);
      const t1 = r.pick([0, 90, 180, -90]), t2 = r.pick([0, 90, -90, 90, -90]);
      if (L1 === L2 && r.chance(0.7)) continue;
      if (o.bad && o.bad(L1, L2, t1, t2)) continue;
      return armOf(L1, L2, t1, t2);
    }
    return null;
  }
  function armOf(L1, L2, t1, t2) {
    const c1 = cs(t1), c12 = cs(t1 + t2);
    const E = vsc(c1, L1), P = vadd(E, vsc(c12, L2)), EP = vsc(c12, L2);
    const rot = v => [F.mul(v[1], F.make(-1)), v[0]];
    const j1 = rot(P), j2 = rot(EP);
    return { L1, L2, t1, t2, E, P, J: [[j1[0], j2[0]], [j1[1], j2[1]]] };
  }

  // ================================================================ 7-17
  const bad17 = A => sameM(A, [[3, -1], [1, 2]]) || sameM(A, [[0, -1], [1, 0]]);
  M.add({
    id: '7-17', part: 2, chap: '7-2④ 例題4', stars: 1,
    title: '行き先から行列を作る：$\\vec e_x$ の行き先を1列め、$\\vec e_y$ の行き先を2列めに、たてに書く',
    mark: '「$\\vec e_x$ を□へ、$\\vec e_y$ を□へ動かす行列」、「左回りに $90^{\\circ}$ 回す行列」のように、行き先から行列を作る。',
    futsu: ['$\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}\\begin{pmatrix}1\\\\0\\end{pmatrix}=\\begin{pmatrix}3\\\\1\\end{pmatrix}$ から', '$a=3$、$c=1$。$\\vec e_y$ の式から', '$b=-1$、$d=2$ を1つずつ決める'],
    raku: ['$\\vec e_x\\to(3,\\ 1)$、$\\vec e_y\\to(-1,\\ 2)$', '→ たてに並べて $\\begin{pmatrix}3&-1\\\\1&2\\end{pmatrix}$', '左回りに $90^{\\circ}$：$\\vec e_x\\to(0,\\ 1)$、$\\vec e_y\\to(-1,\\ 0)$', '→ $\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$'],
    why: '行列に $\\vec e_x=(1,\\ 0)$ を入れると、0をかけた2列めが消えて、1列めだけが出てくる（7-2④）。だから1列めは $\\vec e_x$ の行き先、2列めは $\\vec e_y$ の行き先。行き先がわかれば、それをたてに並べるだけで行列ができる。3×3 なら3列め＝$\\vec e_z$ の行き先。',
    caution: '行き先を行（横）に並べない（$\\begin{pmatrix}3&1\\\\-1&2\\end{pmatrix}$ は×。$\\vec e_x$ を入れると $(3,\\ -1)$ が出てしまう）。物差しの矢印でない点（$(1,\\ 1)$ など）の行き先からは、すぐには作れない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '28mm', s3: '30mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '14mm', s3: '14mm', trap: '11mm' },
    fits(q) {
      if (/はじめに|つぎに|変わり方|点 ?\$\(/.test(q)) return false;
      if (/\\vec e_[xyz]\$ ?を.*へ.*動かす行列/.test(q)) return true;
      return /行列$/.test(q.trim()) && /回す|裏返す|折り返す|のばす|ちぢめる|ずらす|ずらし|物差し/.test(q) && !/箱|応力|レンズ/.test(q);
    },
    steps: {
      s1(r) {
        const a = r.int(-4, 6), c = r.int(-4, 6), b = r.int(-4, 6), d = r.int(-4, 6), A = [[a, b], [c, d]];
        if (b === c || (a === b && c === d) || (!a && !c) || (!b && !d) || bad17(A)) return null;
        return { q: `$\\vec e_x$ を $${pt([a, c])}$ へ、$\\vec e_y$ を $${pt([b, d])}$ へ動かす行列`, a: `$${mt(A)}$`, key: `17|${sig(A)}`, easyCheck: false,
          easy: `1列めに $${pt([a, c])}$、2列めに $${pt([b, d])}$ をたてに`, calc: { kind: 'mat', want: mk(A) },
          verify: p => { const G = M.readMat(p.a); return (G && closeN(G[0][0][0], a) && closeN(G[1][0][0], c) && closeN(G[0][1][0], b) && closeN(G[1][1][0], d)) || '列が行き先でない'; } };
      },
      // 3×3 の行き先、ことばで言う変換（回す・裏返す・のばす・ずらし）
      s2(r) {
        if (turn(r, '17s2', 2) === 0) {
          const cols = [0, 1, 2].map(() => [0, 1, 2].map(() => (r.chance(0.4) ? 0 : r.int(-3, 4))));
          if (cols.some(c => c.every(x => x === 0))) return null;
          const A = [0, 1, 2].map(i => cols.map(c => c[i]));
          if (sameM(A, Mat.T(A))) return null;
          return { q: `$\\vec e_x$ を $${pt(cols[0])}$、$\\vec e_y$ を $${pt(cols[1])}$、$\\vec e_z$ を $${pt(cols[2])}$ へ動かす行列`, a: `$${mt(A)}$`, key: `17|${sig(A)}`, easyCheck: false,
            easy: '3つの行き先を、1列め・2列め・3列めにたてに', calc: { kind: 'mat', want: mk(A) } };
        }
        const T = r.pick([NAMED.Fy, NAMED.Fx, NAMED.Fd, NAMED.Rm90, NAMED.R180, stretch('x', r.pick([2, 3, 0.5])), stretch('y', r.pick([2, 3, 0.5])), shear(r.pick([1, 2, -1, 3]))]);
        const A = T.m, c1 = [A[0][0], A[1][0]], c2 = [A[0][1], A[1][1]];
        return { q: `${T.w}行列`, a: `$${mt(A)}$`, key: `17|${sig(A)}`, easyCheck: false,
          easy: `$\\vec e_x\\to${pt(c1)}$、$\\vec e_y\\to${pt(c2)}$`, calc: { kind: 'mat', want: mk(A) } };
      },
      // 見かけがちがう：見取り図（2×3）、ななめの光の影（3×3）、腕の速度から J
      s3(r) {
        const kind = turn(r, '17s3', 3);
        if (kind === 0) {
          const [p, q] = r.pick([[-0.5, -0.5], [-0.4, -0.3], [-0.6, -0.3], [-0.3, -0.3], [-0.4, -0.2], [0.5, 0.3]]);
          const A = [[p, 1, 0], [q, 0, 1]];
          return { q: `見取り図で、$x$ の物差しを紙の上の $${pt([p, q])}$、$y$ の物差しを $(1,\\ 0)$、$z$ の物差しを $(0,\\ 1)$ にかく。空間の点 $(x,\\ y,\\ z)$ を入れると紙の点が出てくる行列`,
            a: `$${mt(A)}$`, key: `17|${sig(A)}`, easyCheck: false, easy: '3つの物差しの行き先を、たてに3列（2×3 の行列）', calc: { kind: 'mat', want: mk(A) } };
        }
        if (kind === 1) {
          const k = r.pick([0.5, 1, 2, -0.5, 1.5]), ax = r.pick(['x', 'y']);
          const A = [[1, 0, ax === 'x' ? k : 0], [0, 1, ax === 'y' ? k : 0], [0, 0, 0]];
          return { q: `ななめの光で、空中の点 $(x,\\ y,\\ z)$ の影が、真下から $${ax}$ の向きに $${k === 1 ? '' : nt(k)}z$ だけずれた地面にできる。点を入れると影の点 $(X,\\ Y,\\ 0)$ が出てくる3×3 の行列`,
            a: `$${mt(A)}$`, key: `17|${sig(A)}`, easyCheck: false, easy: `$\\vec e_x$、$\\vec e_y$ は動かない。$\\vec e_z\\to${pt([A[0][2], A[1][2], 0])}$`, calc: { kind: 'mat', want: mk(A) } };
        }
        const g = arm(r); if (!g) return null;
        const c1 = [g.J[0][0], g.J[1][0]], c2 = [g.J[0][1], g.J[1][1]];
        return { q: `2本の腕で、肩だけを $1\\,\\mathrm{rad/s}$ で回すと手の速度は $${pt(c1, n2)}$、ひじだけを $1\\,\\mathrm{rad/s}$ で回すと $${pt(c2, n2)}$（m/s）。関節の角速度 $(\\dot\\theta_1,\\ \\dot\\theta_2)$ を入れると手の速度が出てくる行列 $J$`,
          a: `$${mt(g.J, n2)}$`, key: `17|${sig(g.J)}`, easyCheck: false, easy: '肩の分を1列め、ひじの分を2列めにたてに', calc: { kind: 'mat', want: g.J } };
      },
      // わな：物差しの矢印でない点の行き先（7-19）
      trap(r) {
        const pairs = [[[1, 1], [1, -1]], [[1, 1], [-1, 1]], [[1, 1], [0, 1]], [[1, 0], [1, 1]], [[2, 1], [1, 1]]];
        for (let t = 0; t < 30; t++) {
          const [u, v] = r.pick(pairs), A = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]];
          if (A[0][1] === A[1][0] || bad17(A)) continue;
          const Au = mulv(mk(A), u), Av = mulv(mk(A), v);
          return dest({ q: `点 $${pt(u)}$ を $${pt(Au)}$ へ、点 $${pt(v)}$ を $${pt(Av)}$ へ動かす行列`, a: `$${mt(A)}$`, key: `17t|${sig(A)}|${u}|${v}`, calc: { kind: 'mat', want: mk(A) },
            verify: p => { const G = M.readMat(p.a); if (!G) return '読めない'; const B = G.map(r2 => r2.map(c => c[0])); return (sameN(mulNv(B, u), Au.map(nv)) && sameN(mulNv(B, v), Av.map(nv))) || '行き先にならない'; } }, '7-17',
            `$${pt(u)}$ や $${pt(v)}$ は物差しの矢印ではない。$\\vec e_x$・$\\vec e_y$ をこの2つで表し、線形のきまりで行き先を出してから列に並べる`, ['7-19']);
        }
        return null;
      },
    },
  });

  // ================================================================ 7-18
  // 左ページの例（O-2）：たてに2倍、180°。この2つは問題に出さない
  const EX18 = [[[1, 0], [0, 2]], [[-1, 0], [0, -1]]];
  const CH18 = '';
  function pick18(r, which) {
    const L1 = [NAMED.Fy, NAMED.Fx, ...[2, 3, 4, 0.5].map(k => stretch('x', k)), ...[3, 4, 0.5].map(k => stretch('y', k))];
    const L2 = [NAMED.Fd, NAMED.R90, NAMED.Rm90, ...(which === 0 ? [1, 2, -1] : [1, 2, -1, 3]).map(shear)];   // 図（s3）のずらしは右上が2まで（3だと家が細い帯になる。U-8・R1-29）
    const T = r.pick(which === 1 ? L1 : which === 2 ? L2 : L1.concat(L2));
    return EX18.some(E => sameM(E, T.m)) ? null : T;
  }
  // 同じ答えを、1つのステップに3つ以上出さない（U-3）。tag はわざとステップ。40回つづけてよけたら重ねてよい（止まるように）
  function cap2(r, tag, ans) {
    const t = r.turns || (r.turns = {}), c = t['c2|' + tag] || (t['c2|' + tag] = {}), m = 'c2m|' + tag;
    if ((c[ans] || 0) >= 2 && (t[m] = (t[m] || 0) + 1) < 40) return false;
    t[m] = 0; c[ans] = (c[ans] || 0) + 1;
    return true;
  }
  // s1・s2 の答えのことば（「ずらし（上ほど右へ）」など）を、同じ見開きで2回出さない（U-3）。40回つづけてよけたら重ねてよい（止まるように）
  function fresh18(r, T) {
    const t = r.turns || (r.turns = {}), u = t.u18 || (t.u18 = new Set());
    if (u.has(T.n) && (t.m18 = (t.m18 || 0) + 1) < 40) return false;
    t.m18 = 0; u.add(T.n);
    return true;
  }
  const check18 = (p, A) => { const B = matOfName(p.a, A); return (B && sameN(B, A)) || `ことば「${p.a}」が行列とちがう`; };
  M.add({
    id: '7-18', part: 2, chap: '7-2③④ 例題3', stars: 1,
    title: '家の変わり方は、2本の列を見て名前を言う（5つのかどを全部計算しない）',
    mark: '「方眼の家がどう変わるか」。行列の列が $(\\pm1,\\ 0)$・$(0,\\ \\pm1)$・$(k,\\ 0)$ のような、0の多い形。答えは「左右の裏返し」「上下の裏返し」「$y=x$ で折り返し」「たてに□倍にのびる（ちぢむ）」「ずらし（上ほど右へ）」「左回りに $90^{\\circ}$ 回る」のようなことば。',
    futsu: ['5つのかど $(0,\\ 0)$、$(2,\\ 0)$、$(2,\\ 2)$、$(1,\\ 3)$、$(0,\\ 2)$ を', '1つずつ行列にかけて、行き先を方眼に', 'かいてから、形を見る'],
    raku: ['$\\begin{pmatrix}1&0\\\\0&2\\end{pmatrix}$：$\\vec e_x$ はそのまま、$\\vec e_y$ だけ2倍', '→ たてに2倍にのびる', '$\\begin{pmatrix}-1&0\\\\0&-1\\end{pmatrix}$：$\\vec e_x$ も $\\vec e_y$ も反対向き', '→ $180^{\\circ}$ 回る'],
    why: '1列めは $\\vec e_x$ の行き先、2列めは $\\vec e_y$ の行き先（7-2④）。家はもとの方眼にかかれた絵なので、物差しの2本がどうなったかを見れば、家全体の変わり方がわかる。$\\vec e_x$ だけ左向き → 左右の裏返し、$\\vec e_y$ だけ $k$ 倍 → たてに $k$ 倍、$\\vec e_x\\to(0,\\ 1)$・$\\vec e_y\\to(-1,\\ 0)$ → 左回りに $90^{\\circ}$。',
    caution: '左右の裏返しと $180^{\\circ}$ の回転は、戸の位置で見分ける（裏返しは戸が左によった家）。上下の裏返し（$\\vec e_y$ が下向き）と左右の裏返し（$\\vec e_x$ が左向き）を取りちがえない。名前のある形でない行列は、かどの行き先を列で求める。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '34mm', s3: '24mm', trap: '22mm' }, boxh: { s3: '11mm' },
    fits(q) { return /家の変わり方/.test(q); },
    steps: {
      // 裏返し・のびる・ちぢむ（1つの列だけが変わる）
      s1(r) {
        const T = pick18(r, 1); if (!T || !fresh18(r, T)) return null;
        return { q: `$${mt(T.m)}$ をかけたときの家の変わり方`, a: T.n, key: `18|${sig(T.m)}`, easyCheck: false,
          easy: `$\\vec e_x\\to${pt([T.m[0][0], T.m[1][0]])}$、$\\vec e_y\\to${pt([T.m[0][1], T.m[1][1]])}$`, verify: p => check18(p, T.m) };
      },
      // 2本とも動く：$y=x$ で折り返し・回る・ずらし
      s2(r) {
        const T = pick18(r, 2); if (!T || !fresh18(r, T)) return null;
        return { q: `$${mt(T.m)}$ をかけたときの家の変わり方`, a: T.n, key: `18|${sig(T.m)}`, easyCheck: false,
          easy: `$\\vec e_x\\to${pt([T.m[0][0], T.m[1][0]])}$、$\\vec e_y\\to${pt([T.m[0][1], T.m[1][1]])}$`, verify: p => check18(p, T.m) };
      },
      // 図：点線のもとの家と、変えた家（実線）から、かけた行列を書く
      s3(r) {
        const T = pick18(r, 0); if (!T) return null;
        const c1 = [T.m[0][0], T.m[1][0]], c2 = [T.m[0][1], T.m[1][1]];
        return { q: '図の点線の家（もとの家）に、ある行列をかけると、実線の家になった。かけた行列', a: `$${mt(T.m)}$`, key: `18|${sig(T.m)}`, easyCheck: false,
          easy: `${T.n}。$\\vec e_x\\to${pt(c1)}$、$\\vec e_y\\to${pt(c2)}$ をたてに`, fig: houseFig(T.m), calc: { kind: 'mat', want: mk(T.m) } };
      },
      // わな：名前のある形でない行列（7-16）
      trap(r) {
        for (let t = 0; t < 30; t++) {
          const A = [[r.int(1, 3), r.int(1, 2)], [r.int(0, 2), r.int(1, 3)]];
          if (A[1][0] === 0 && A[0][1] === 0) continue;
          const C = r.pick([[1, 3], [2, 2]]), out = mulv(mk(A), C);
          return dest({ q: `方眼の家に $${mt(A)}$ をかけると、かど $${pt(C)}$ はどこへ行く`, a: `$${pt(out)}$`, key: `18t|${sig(A)}|${C}`,
            verify: p => ptIs(p, mulNv(A, C)) }, '7-18',
            `名前のある形の行列ではない。かどの行き先は「$${C[0]}$×1列め＋$${C[1]}$×2列め」で出す`, ['7-16']);
        }
        return null;
      },
    },
  });
  // ================================================================ 7-19
  // 係数つきの和：[[2, '\\vec u'], [3, '\\vec v']] → 2\vec u+3\vec v
  const comb = ts => ts.filter(([s]) => s !== 0).map(([s, v], i) => `${s < 0 ? '-' : i ? '+' : ''}${Math.abs(s) === 1 ? '' : nt(Math.abs(s))}${v}`).join('');
  // 点の和：2(3,\ 1)+3(-1,\ 2)
  const combPt = (ts, f) => ts.map(([s, v]) => [+s, v]).filter(([s]) => s !== 0).map(([s, v], i) => `${s < 0 ? '-' : i ? '+' : ''}${Math.abs(s) === 1 ? '' : nt(Math.abs(s))}${pt(v, f)}`).join('');
  const lin = ts => ts.reduce((acc, [s, v]) => vadd(acc, vsc(v, s)), ts[0][1].map(() => F.make(0)));
  M.add({
    id: '7-19', part: 2, chap: '7-2⑤ 例題5', stars: 1,
    title: '線形のきまり $A(s\\vec u+t\\vec v)=sA\\vec u+tA\\vec v$：$A$ の成分を求めない',
    mark: '$A\\vec u$・$A\\vec v$ がわかっていて、$A(2\\vec u-\\vec v)$ のような組み合わせの行き先を聞かれる。$A$ の成分は書いていない。',
    futsu: ['$\\vec u$、$\\vec v$ と $A$ の成分を文字でおき、', '$A\\vec u=(3,\\ 1)$、$A\\vec v=(-1,\\ 2)$ から', '連立方程式を作って $A$ を求めてから、', '$2\\vec u+3\\vec v$ を入れる'],
    raku: ['$A\\vec u=(3,\\ 1)$、$A\\vec v=(-1,\\ 2)$ のとき', '$A(2\\vec u+3\\vec v)=2A\\vec u+3A\\vec v$', '$=(6,\\ 2)+(-3,\\ 6)=(3,\\ 8)$', '（$A$ の成分を出さない）'],
    why: '行列をかける機械は、「たしてから入れても、別々に入れてからたしても同じ」「何倍かしてから入れても、入れてから何倍かしても同じ」（7-2⑤、線形）。だから $A(s\\vec u+t\\vec v)$ は、出てきた $A\\vec u$・$A\\vec v$ を $s$ 倍・$t$ 倍してたすだけ。',
    caution: '係数の符号を落とさない（$A(3\\vec u-\\vec v)=3A\\vec u-A\\vec v$）。わかっていない向き（$\\vec e_x$ など）が組み合わせに入っていると、行き先は決まらない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '26mm', s3: '30mm', trap: '40mm' },
    fits(q) {
      if (!/A\\vec u=/.test(q)) return false;
      const m = /\$A\(([^$]*)\)\$\s*$/.exec(q.trim());
      return !!m && !/\\vec e/.test(m[1]);
    },
    steps: {
      s1(r) {
        const u = [r.int(-3, 5), r.int(-3, 5)], v = [r.int(-3, 5), r.int(-3, 5)];
        if ((!u[0] && !u[1]) || (!v[0] && !v[1]) || (u[0] === v[0] && u[1] === v[1]) || (u[0] === 3 && u[1] === 1 && v[0] === -1 && v[1] === 2)) return null;
        const s = r.pick([2, 3, -1, -2, 4, 1]), t = r.pick([2, 3, -1, -2, 1, -3]);
        if (s === 1 && t === 1) return null;
        const ts = [[s, u], [t, v]], out = lin(ts);
        return { q: `$A\\vec u=${pt(u)}$、$A\\vec v=${pt(v)}$ のとき、$A(${comb([[s, '\\vec u'], [t, '\\vec v']])})$`, a: `$${pt(out)}$`, key: `19|${u}|${v}|${s},${t}`, easyCheck: false,
          easy: `$${combPt(ts)}$`, verify: p => ptIs(p, [s * u[0] + t * v[0], s * u[1] + t * v[1]]) };
      },
      // 3つの数のベクトル、$A(\vec u+\vec v)$ がわかっている形
      s2(r) {
        if (turn(r, '19s2', 2) === 0) {
          const u = [r.int(-2, 4), r.int(-2, 4), r.int(-2, 4)], v = [r.int(-2, 4), r.int(-2, 4), r.int(-2, 4)];
          if (u.every(x => !x) || v.every(x => !x)) return null;
          const s = r.pick([2, 3, -1, -2]), t = r.pick([2, 1, -1, 3]), ts = [[s, u], [t, v]];
          return { q: `$A\\vec u=${pt(u)}$、$A\\vec v=${pt(v)}$ のとき、$A(${comb([[s, '\\vec u'], [t, '\\vec v']])})$`, a: `$${pt(lin(ts))}$`, key: `19|${u}|${v}|${s},${t}`, easyCheck: false,
            easy: `$${combPt(ts)}$`, verify: p => ptIs(p, u.map((x, i) => s * x + t * v[i])) };
        }
        const u = [r.int(-3, 4), r.int(-3, 4)], v = [r.int(-3, 4), r.int(-3, 4)];
        if ((!u[0] && !u[1]) || (!v[0] && !v[1])) return null;
        const w = [u[0] + v[0], u[1] + v[1]], s = r.pick([1, 2, 3]), t = r.pick([0, -1, 1, 2]);
        if (s === 1 && t === 1) return null;
        const ts = [[s, v], [t, u]];
        return { q: `$A\\vec u=${pt(u)}$、$A(\\vec u+\\vec v)=${pt(w)}$ のとき、$A(${comb([[s, '\\vec v'], [t, '\\vec u']])})$`, a: `$${pt(lin(ts))}$`, key: `19|${u}|${v}|v${s},${t}`, easyCheck: false,
          easy: `$A\\vec v=${pt(w)}-${pt(u)}=${pt(v)}$`, verify: p => ptIs(p, [s * (w[0] - u[0]) + t * u[0], s * (w[1] - u[1]) + t * u[1]]) };
      },
      // 見かけがちがう：腕の手の速度（肩だけ・ひじだけの速度から）、橋の模型の下がる量
      s3(r) {
        if (turn(r, '19s3', 2) === 0) {
          const g = arm(r); if (!g) return null;
          const c1 = [g.J[0][0], g.J[1][0]], c2 = [g.J[0][1], g.J[1][1]];
          const w1 = r.pick(['0.5', '2', '0.4', '-1', '1.5']), w2 = r.pick(['1', '0.5', '-2', '2', '0.8']);
          const out = lin([[D(w1), c1], [D(w2), c2]]);
          return { q: `2本の腕で、肩だけを $1\\,\\mathrm{rad/s}$ で回すと手の速度は $${pt(c1, n2)}$、ひじだけを $1\\,\\mathrm{rad/s}$ で回すと $${pt(c2, n2)}$（m/s）。肩を $${w1}\\,\\mathrm{rad/s}$、ひじを $${w2}\\,\\mathrm{rad/s}$ で同時に回したときの手の速度（m/s）`,
            a: `$${pt(out, n2)}$`, key: `19|${sig(g.J)}|${w1},${w2}`, easyCheck: false, easy: `$${combPt([[w1, c1], [w2, c2]], n2)}$`,
            verify: p => ptIs(p, [+w1 * nv(c1[0]) + +w2 * nv(c2[0]), +w1 * nv(c1[1]) + +w2 * nv(c2[1])]) };
        }
        const a = r.int(2, 5), c = r.int(2, 5), b = r.int(1, Math.min(a, c) - 1), s = r.int(1, 4), t = r.int(1, 4);
        const out = [s * a + t * b, s * b + t * c];
        return { q: `橋の模型の点 P に $1\\,\\mathrm{N}$ のおもりをのせると、点 P・Q の下がる量は $(${a},\\ ${b})$（mm）、点 Q に $1\\,\\mathrm{N}$ をのせると $(${b},\\ ${c})$（mm）。P に $${s}\\,\\mathrm{N}$、Q に $${t}\\,\\mathrm{N}$ を同時にのせたときの下がる量（mm）`,
          a: `$${pt(out)}$`, key: `19|br${a},${b},${c}|${s},${t}`, easyCheck: false, easy: `$${combPt([[s, [a, b]], [t, [b, c]]])}$`,
          verify: p => ptIs(p, [s * a + t * b, s * b + t * c]) };
      },
      // わな：わかっていない向きが入る（わざなし）
      trap(r) {
        const u = [r.int(-3, 5), r.int(-3, 5)], v = [r.int(-3, 5), r.int(-3, 5)];
        if ((!u[0] && !u[1]) || (!v[0] && !v[1])) return null;
        if (u[0] === v[0] && u[1] === v[1]) return null;
        const e = r.pick(['x', 'y']), s = r.pick([1, 2, -1]);
        return dest({ q: `$A\\vec u=${pt(u)}$、$A\\vec v=${pt(v)}$ のとき、$A(${comb([[s, '\\vec u']])}+\\vec e_${e})$`, a: `決まらない（$A\\vec e_${e}$ がわからない）`, key: `19t|${u}|${v}|${s}${e}`,
          verify: p => /決まらない/.test(p.a) || 'ことばがちがう' }, '7-19',
          `$\\vec e_${e}$ の行き先がわからないので、線形のきまりを使っても答えは決まらない。$\\vec u$・$\\vec v$ の中身もわからない`, []);
      },
    },
  });

  // ================================================================ 7-20
  const EX20 = [[[-0.5, 1, 0], [-0.5, 0, 1]], [[2, 0, 0], [0, 1, 0], [0, 0, 3]]];
  const bad20 = A => EX20.some(E => sameM(E, A));
  M.add({
    id: '7-20', part: 2, chap: '7-2⑥ 例題8', stars: 1,
    title: '2×3 の行列は「3つ入れて2つ出る」、3×3 の対角の行列は「向きごとにのばす」',
    mark: '$(x,\\ y,\\ z)$ と2×3 の行列（見取り図・影）、ななめ以外が0の3×3 の行列。',
    futsu: ['3×3 の対角の行列にも、立方体の', '8つのかどを1つずつ入れて、', '行き先を計算してから形を見る'],
    raku: ['$\\begin{pmatrix}-0.5&1&0\\\\-0.5&0&1\\end{pmatrix}\\begin{pmatrix}2\\\\4\\\\3\\end{pmatrix}$', '→ $X=-1+4=3$、$Y=-1+3=2$（0はとばす）', '対角が 2・1・3 の3×3 → 1辺1の立方体が', '$x$・$y$・$z$ の向きに 2・1・3 の箱'],
    why: '行列の横の数（列の数）は入れる数の個数、たての数（行の数）は出てくる数の個数（7-2⑥）。2×3 なら3つ入れて2つ出る。対角の行列は、$\\vec e_x$ を $a$ 倍、$\\vec e_y$ を $b$ 倍、$\\vec e_z$ を $c$ 倍するだけなので、点 $(x,\\ y,\\ z)$ は $(ax,\\ by,\\ cz)$ へ行き、立方体は向きごとにのびた箱になる。',
    caution: '2×3 の行列に2つの数のベクトルは入れられない（かけられない）。対角の行列の成分を、ちがう向きにかけない（$a$ は $x$ だけ）。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '26mm', s3: '24mm', trap: '40mm' },
    fits(q) {
      if (prods(q).some(o => o.rows === 2 && o.cols === 3 && o.n === 3)) return true;
      if (prods(q).some(o => o.rows === 3 && o.cols === 3 && o.n === 3 && isDiagTxt(o.A))) return true;
      return /立方体/.test(q) && /pmatrix/.test(q);
    },
    steps: {
      // 2×3 の行列×3つの数のベクトル（0 の所はとばす）
      s1(r) {
        const vals = [0, 0, 0, 1, -1, 2, 3, 0.5, -0.5];
        const A = [[0, 1, 2].map(() => r.pick(vals)), [0, 1, 2].map(() => r.pick(vals))];
        const z = A.flat().filter(x => x === 0).length;
        if (z < 2 || z > 4 || A.some(row => row.every(x => x === 0)) || bad20(A)) return null;
        const v = [r.int(-2, 6), r.int(-2, 6), r.int(-2, 6)]; if (v.filter(x => x === 0).length > 1) return null;
        return { q: `$${mt(A)}${cv(v)}$`, a: `$${pt(mulv(mk(A), v))}$`, key: `20|${sig(A)}|${v}`, easyCheck: false,
          easy: '3つ入れて2つ出る。1行に3つずつかけてたす', verify: p => ptIs(p, mulNv(A, v)) };
      },
      // 3×3 の対角の行列：点の行き先、立方体からできる箱の長さ
      s2(r) {
        const d = [r.pick([2, 3, 4, 0.5, 1]), r.pick([2, 3, 1, 0.5, 5]), r.pick([2, 3, 4, 1, 0.5])];
        const A = [[d[0], 0, 0], [0, d[1], 0], [0, 0, d[2]]];
        if (d.every(x => x === 1) || (d[0] === d[1] && d[1] === d[2]) || bad20(A)) return null;
        if (turn(r, '20s2', 2) === 0) {
          const v = [r.int(-3, 6), r.int(-3, 6), r.int(-3, 6)]; if (v.filter(x => x === 0).length > 1) return null;
          return { q: `$${mt(A)}${cv(v)}$`, a: `$${pt(mulv(mk(A), v))}$`, key: `20|${sig(A)}|${v}`, easyCheck: false,
            easy: `$(${['x', 'y', 'z'].map((c, i) => (d[i] === 1 ? '' : nt(d[i])) + c).join(',\\ ')})$ の形`, verify: p => ptIs(p, v.map((x, i) => x * d[i])) };
        }
        const c = r.pick([1, 2, 4]), L = d.map(x => D(x * c));
        return { q: `1辺 $${c}$ の立方体に $${mt(A)}$ をかけてできる箱の、$x$・$y$・$z$ の向きの長さ`, a: `$${nt(L[0])}$、$${nt(L[1])}$、$${nt(L[2])}$`, key: `20|${sig(A)}|cube${c}`, easyCheck: false,
          easy: c === 1 ? '1辺が1なので、対角の数がそのまま長さ' : `1辺 $${c}$ に対角の数をかける`, verify: p => { const n = nums(p.a); return (n.length === 3 && n.every((x, i) => closeN(x, d[i] * c))) || '長さがちがう'; } };
      },
      // 見かけがちがう：見取り図の行列、ななめの光の影
      s3(r) {
        if (turn(r, '20s3', 2) === 0) {
          const [a, b] = r.pick([[-0.4, -0.3], [-0.6, -0.3], [-0.3, -0.3], [-0.4, -0.2], [-0.5, -0.3], [-0.6, -0.4]]);
          const A = [[a, 1, 0], [b, 0, 1]], v = [r.int(1, 6), r.int(0, 5), r.int(0, 5)];
          if (v[0] === 2 && v[1] === 4 && v[2] === 3) return null;
          return { q: `見取り図の行列が $${mt(A)}$ のとき、空間の点 $${pt(v)}$ がかかれる紙の点`, a: `$${pt(mulv(mk(A), v))}$`, key: `20|${sig(A)}|${v}`, easyCheck: false,
            easy: `$X=${nt(a)}\\times${v[0]}+${v[1]}$、$Y=${nt(b)}\\times${v[0]}+${v[2]}$`.replace(/\+-/g, '-'), verify: p => ptIs(p, mulNv(A, v)) };
        }
        const k = r.pick([0.5, 2, -0.5, 1.5, -1]), A = [[1, 0, k], [0, 1, 0]], v = [r.int(-2, 5), r.int(-2, 5), r.int(1, 6)];
        return { q: `ななめの光で、空中の点 $(x,\\ y,\\ z)$ の影は、地面の点 $(X,\\ Y)$ にできる。$X$・$Y$ を出す行列が $${mt(A)}$ のとき、点 $${pt(v)}$ の影`, a: `$${pt(mulv(mk(A), v))}$`, key: `20|${sig(A)}|${v}`, easyCheck: false,
          easy: `$X=${v[0]}+${nt(k)}\\times${v[2]}$、$Y=${v[1]}$`.replace(/\+-/g, '-'), verify: p => ptIs(p, mulNv(A, v)) };
      },
      // わな：2×3 の行列に2つの数のベクトル（7-05）
      trap(r) {
        const vals = [0, 0, 1, -1, 2, 0.5, -0.5];
        const A = [[0, 1, 2].map(() => r.pick(vals)), [0, 1, 2].map(() => r.pick(vals))], v = [r.int(1, 6), r.int(1, 6)];
        if (A.some(row => row.every(x => x === 0)) || bad20(A)) return null;
        return dest({ q: `$${mt(A)}${cv(v)}$`, a: 'かけられない', key: `20t|${sig(A)}|${v}`, verify: p => /かけられない/.test(p.a) || 'ことばがちがう' }, '7-20',
          '2×3 の行列には3つの数を入れる。2つの数のベクトルとは、内側の数（3と2）がそろわない', ['7-05']);
      },
    },
  });

  // ================================================================ 7-21
  const ang = t => `${t}^{\\circ}`;
  const armTxt = g => `$L_1=${g.L1}\\,\\mathrm{m}$、$L_2=${g.L2}\\,\\mathrm{m}$、$\\theta_1=${ang(g.t1)}$、$\\theta_2=${ang(g.t2)}$`;
  const bad21 = (L1, L2, t1, t2) => L1 === '0.30' && L2 === '0.25' && t1 === 0 && t2 === 90;   // 左ページの例（O-2）
  // ヤコビ行列を三角関数で（検算用。問題の作り方とは別の式）
  function jacTrig(L1, L2, t1, t2) {
    const a = t1 * Math.PI / 180, b = (t1 + t2) * Math.PI / 180, r6 = x => Math.round(x * 1e9) / 1e9;
    return [[r6(-L1 * Math.sin(a) - L2 * Math.sin(b)), r6(-L2 * Math.sin(b))], [r6(L1 * Math.cos(a) + L2 * Math.cos(b)), r6(L2 * Math.cos(b))]];
  }
  // 図：2本の腕（0.1 m を1単位）。肩 O・ひじ E・手 P、関節の丸、長さと角の文字
  function armFig(g) {
    const E0 = g.E.map(nv), P0 = g.P.map(nv), ext = Math.max(0.2, ...[0, E0[0], P0[0]].map(Math.abs), ...[0, E0[1], P0[1]].map(Math.abs));
    const S = 10, E = E0.map(x => x * S), P = P0.map(x => x * S), its = [];
    const deg = (A, B) => Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI;
    const ANG = { e: 0, ne: 45, n: 90, nw: 135, w: 180, sw: 225, s: 270, se: 315 };
    const dd = (a, b) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return Math.min(d, 360 - d); };
    const away = (dirs, pref) => Object.keys(ANG).sort((a, b) => Math.min(...dirs.map(d => dd(ANG[b], d))) - Math.min(...dirs.map(d => dd(ANG[a], d))) || (pref || []).indexOf(b) - (pref || []).indexOf(a))[0];
    const xs = [0, E[0], P[0]], ys = [0, E[1], P[1]], sc = Math.min(5, 45 / (Math.max(...xs) - Math.min(...xs) + 3), 22 / (Math.max(...ys) - Math.min(...ys) + 2));
    its.push(['seg', [g.t1 === 180 ? -1 : -0.8, 0], [g.t1 === 0 ? 1 : 2.2, 0], { dash: true }]);   // θ1 をはかる向き（O の右）
    its.push(['seg', [0, 0], E, { thick: true }], ['seg', E, P, { thick: true }], ['circle', [0, 0], 0.25], ['circle', E, 0.25], ['dot', P]);
    const a1 = deg([0, 0], E), a2 = deg(E, P), oDirs = [0, 180, a1], eDirs = [a1 + 180, a2];
    if (g.t1 !== 0 && g.t1 !== 180) { its.push(['angle', [1, 0], [0, 0], E, '$\\theta_1$', 0.9, 1, 0.7]); oDirs.push(a1 / 2); }
    if (g.t2 !== 0) {
      const X = [E[0] + Math.cos(a1 * Math.PI / 180) * 2.2, E[1] + Math.sin(a1 * Math.PI / 180) * 2.2];
      its.push(['seg', E, X, { dash: true }], ['angle', X, E, P, '$\\theta_2$', 0.9, 1, 0.7]); eDirs.push(a1, a1 + g.t2 / 2);
    }
    // 長さの文字：腕のまん中から、もう一方の腕や角のしるしと反対の側へ
    const side = (A, B, Q) => { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), n = [-dy / L, dx / L], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; const sg = (Q[0] - m[0]) * n[0] + (Q[1] - m[1]) * n[1] > 0 ? -1 : 1; return [m[0] + n[0] * 0.8 * sg, m[1] + n[1] * 0.8 * sg]; };
    const X2 = g.t2 !== 0 ? [E[0] + Math.cos(a1 * Math.PI / 180) * 1.5, E[1] + Math.sin(a1 * Math.PI / 180) * 1.5] : [0, 0];
    its.push(['label', side([0, 0], E, g.t2 !== 0 ? P : [E[0] / 2 + 1, E[1] / 2 + 1]), '$L_1$', 'c'], ['label', side(E, P, X2), '$L_2$', 'c']);
    const lab = (Q, t, d) => ['label', [Q[0] + Math.cos(ANG[d] * Math.PI / 180) * 0.3, Q[1] + Math.sin(ANG[d] * Math.PI / 180) * 0.3], t, d];
    its.push(lab([0, 0], 'O', away(oDirs, ['sw', 's', 'w'])), lab(E, 'E', away(eDirs)), lab(P, 'P', away([a2 + 180])));
    return { s: sc, items: its };
  }
  M.add({
    id: '7-21', part: 2, chap: '7-2⑧ 例題6', stars: 1,
    title: 'ヤコビ行列は「肩→手」「ひじ→手」の矢印を $90^{\\circ}$ 回して列に並べる',   // 題を短く（見わけようの表で文が切れないように。U-9・R1-21）。回し方 $(x,\ y)\to(-y,\ x)$ は caution に
    mark: '2本の腕（肩・ひじ）の長さと関節の角、関節の角速度 $\\dot\\theta_1$・$\\dot\\theta_2$ から、手の速度を聞かれる。',
    futsu: ['手の位置を $\\theta_1$・$\\theta_2$ の式で書き、', '時間で微分して（合成関数の微分）、', '$\\dot\\theta_1$・$\\dot\\theta_2$ の係数を並べる'],
    raku: ['$L_1=0.30$、$L_2=0.25$、$\\theta_1=0^{\\circ}$、$\\theta_2=90^{\\circ}$', 'ひじ $(0.30,\\ 0)$、手 $(0.30,\\ 0.25)$', '1列め：$(0.30,\\ 0.25)$ を $90^{\\circ}$ → $(-0.25,\\ 0.30)$', '2列め：$(0,\\ 0.25)$ を $90^{\\circ}$ → $(-0.25,\\ 0)$'],
    why: '肩だけを $1\\,\\mathrm{rad/s}$ で回すと、手は肩のまわりを回るので、速度は「肩→手」の矢印を $90^{\\circ}$ 回したもの（4-15）。ひじだけなら「ひじ→手」を $90^{\\circ}$ 回したもの。2つを同時に回すと、速度は $\\dot\\theta_1$ 倍と $\\dot\\theta_2$ 倍のたし算なので、この2つを1列め・2列めに並べた行列 $J$ に $(\\dot\\theta_1,\\ \\dot\\theta_2)$ を入れればよい（7-2⑧）。',
    caution: '$\\theta_2$ は1本めの腕の向きからはかった角なので、2本めの腕の向きは $\\theta_1+\\theta_2$。$90^{\\circ}$ 回すのは $(x,\\ y)\\to(-y,\\ x)$（$(y,\\ -x)$ は右回り）。手の速度の成分は負にもなる（速度）。手の位置だけを聞かれたら、このわざではない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' }, boxh: { s1: '11mm', s3: '11mm' },
    fits(q) { return (/腕/.test(q) || /L_1=/.test(q)) && /ヤコビ|角速度|dot\\theta|rad\/s/.test(q) && !/手の位置/.test(q); },
    steps: {
      s1(r) {
        const g = arm(r, { bad: bad21 }); if (!g) return null;
        const c1 = [g.J[0][0], g.J[1][0]], c2 = [g.J[0][1], g.J[1][1]];
        return { q: `${armTxt(g)} の2本の腕のヤコビ行列 $J$`, a: `$${mt(g.J, n2)}$`, key: `21|${g.L1},${g.L2},${g.t1},${g.t2}`, easyCheck: false,
          easy: `ひじ $${pt(g.E, n2)}$、手 $${pt(g.P, n2)}$。1列め $${pt(c1, n2)}$、2列め $${pt(c2, n2)}$`, calc: { kind: 'mat', want: g.J },
          verify: p => matIs(p, jacTrig(+g.L1, +g.L2, g.t1, g.t2)) };
      },
      // 手の速度（m/s）
      s2(r) {
        const g = arm(r, { bad: bad21 }); if (!g) return null;
        const w = [r.pick(['0.4', '0.5', '1', '0.2', '-0.5', '2']), r.pick(['0.8', '1', '0.5', '-1', '0.4', '-0.5'])];
        const out = mulv(g.J, w);
        return { q: `${armTxt(g)}、$\\dot\\theta_1=${w[0]}\\,\\mathrm{rad/s}$、$\\dot\\theta_2=${w[1]}\\,\\mathrm{rad/s}$ のときの手の速度（m/s）`, a: `$${pt(out, n2)}$`, key: `21|${g.L1},${g.L2},${g.t1},${g.t2}|${w}`, easyCheck: false,
          easy: `$J=${mt(g.J, n2)}$ に $(${w[0]},\\ ${w[1]})$ を入れる`, verify: p => ptIs(p, mulNv(jacTrig(+g.L1, +g.L2, g.t1, g.t2), w.map(Number))) };
      },
      // 図の腕で：ヤコビ行列、手の速度
      s3(r) {
        const g = arm(r, { bad: bad21 }); if (!g) return null;
        const head = `図の2本の腕（${armTxt(g)}）`;
        if (turn(r, '21s3', 2) === 0) {
          return { q: `${head}のヤコビ行列 $J$`, a: `$${mt(g.J, n2)}$`, key: `21|${g.L1},${g.L2},${g.t1},${g.t2}`, easyCheck: false, fig: armFig(g),
            easy: `ひじ $${pt(g.E, n2)}$、手 $${pt(g.P, n2)}$ から`, calc: { kind: 'mat', want: g.J }, verify: p => matIs(p, jacTrig(+g.L1, +g.L2, g.t1, g.t2)) };
        }
        const w = [r.pick(['0.5', '1', '0.4', '-1']), r.pick(['1', '0.5', '-0.5', '2'])];
        return { q: `${head}で、$\\dot\\theta_1=${w[0]}\\,\\mathrm{rad/s}$、$\\dot\\theta_2=${w[1]}\\,\\mathrm{rad/s}$ のときの手の速度（m/s）`, a: `$${pt(mulv(g.J, w), n2)}$`, key: `21|${g.L1},${g.L2},${g.t1},${g.t2}|${w}`, easyCheck: false, fig: armFig(g),
          easy: `$J=${mt(g.J, n2)}$`, verify: p => ptIs(p, mulNv(jacTrig(+g.L1, +g.L2, g.t1, g.t2), w.map(Number))) };
      },
      // わな：手の位置（7-55。30°・60° は値を文に書く）
      trap(r) {
        const TR = { 0: ['1', '0'], 30: ['0.866', '0.5'], 60: ['0.5', '0.866'], 90: ['0', '1'] };
        for (let t = 0; t < 30; t++) {
          const [t1, t2] = r.pick([[30, 60], [60, 30], [30, -30], [60, -60], [30, 0], [60, 0]]);
          const L1 = r.pick(['0.30', '0.25', '0.40', '0.20']), L2 = r.pick(['0.25', '0.20', '0.30', '0.15']);
          const [c1, s1] = TR[t1].map(D), [c12, s12] = TR[t1 + t2].map(D);
          const P = vadd(vsc([c1, s1], L1), vsc([c12, s12], L2));
          const a1 = t1 * Math.PI / 180, a2 = (t1 + t2) * Math.PI / 180;
          const tv = [+L1 * Math.cos(a1) + +L2 * Math.cos(a2), +L1 * Math.sin(a1) + +L2 * Math.sin(a2)];
          const xs = P.map((f, i) => agree(f, tv[i], 2)); if (xs.some(x => x == null)) continue;
          return dest({ q: `$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$、$\\theta_1=${ang(t1)}$、$\\theta_2=${ang(t2)}$ の2本の腕の手の位置（$\\cos30^{\\circ}=\\sin60^{\\circ}=0.866$。小数第2位まで）`,
            a: `約 $(${xs[0]},\\ ${xs[1]})$`, key: `21t|${L1},${L2},${t1},${t2}`,
            verify: p => ptIs(p, tv.map(x => Math.round(x * 100) / 100)) }, '7-21',
            'ヤコビ行列は手の速度を出す行列。手の位置は、腕を回す行列（順運動学）で出す', ['7-55']);
        }
        return null;
      },
    },
  });

  // ================================================================ 7-22
  const bad22 = S => sameM(S, [[80, 30], [30, -20]]);
  function sigma(r) {
    const a = r.pick([40, 50, 60, 70, 90, 100, -30, -40, 20]), b = r.pick([10, 20, 30, 40, -10, -20, -30]), d = r.pick([-40, -20, -10, 10, 20, 30, 50]);
    const S = [[a, b], [b, d]]; return bad22(S) ? null : S;
  }
  const NS = [[0.6, 0.8], [0.8, 0.6], [0.6, -0.8], [-0.6, 0.8], [0.8, -0.6], [-0.8, 0.6]];
  M.add({
    id: '7-22', part: 2, chap: '7-2⑨ 例題7', stars: 1,
    title: '応力 $\\vec t=\\sigma\\vec n$：$x$ に直角な切り口の力は1列め、ななめの切り口は行ごとに',
    mark: '応力の行列（MPa）と、切り口に直角な長さ1の矢印 $\\vec n$。「切り口にはたらく力 $\\vec t$」。',
    futsu: ['切り口の三角形の小さな板を考え、', '3つの辺にはたらく力のつりあいの式を', '$x$・$y$ の向きに立てて解く'],
    raku: ['$\\sigma=\\begin{pmatrix}80&30\\\\30&-20\\end{pmatrix}$、$\\vec n=(1,\\ 0)$', '→ 1列め $(80,\\ 30)$', '$\\vec n=(0.6,\\ 0.8)$ → 行ごとに', '$(48+24,\\ 18-16)=(72,\\ 2)$'],
    why: '応力の行列 $\\sigma$ は「切り口の向き $\\vec n$ を入れると、その切り口の力 $\\vec t$ が出てくる機械」（7-2⑨）。$\\vec n=\\vec e_x$ なら1列め、$\\vec e_y$ なら2列め（列は物差しの行き先）。ななめの $\\vec n$ は、行ごとに $\\vec n$ との内積をとる。',
    caution: '$\\vec n$ は長さ1の矢印（$0.6^2+0.8^2=1$）。負の成分はかっこをつけてかける。力の向きは $\\vec n$ と同じとはかぎらない。力が切り口に直角になる向きをさがす問いは、このわざではない。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '22mm', s3: '24mm', trap: '40mm' },
    fits(q) { return /応力|切り口/.test(q) && /力 ?\$\\vec t\$|\\vec t\$ ?の/.test(q) && !/直角になる/.test(q); },
    steps: {
      s1(r) {
        const S = sigma(r); if (!S) return null;
        const e = r.pick(['x', 'y']), v = EVEC[e];
        if (!cap2(r, '22s1', String(mulNv(S, v)))) return null;
        return { q: `応力 $\\sigma=${mt(S)}$（MPa）で、$\\vec n=\\vec e_${e}$ の切り口の力 $\\vec t$`, a: `$${pt(mulv(mk(S), v))}$（MPa）`, key: `22|${sig(S)}|${v}`, easyCheck: false,
          easy: `${e === 'x' ? 1 : 2}列め`, verify: p => ptIs(p, mulNv(S, v)) };
      },
      s2(r) {
        const S = sigma(r); if (!S) return null;
        const n = r.pick(NS), out = mulv(mk(S), n);
        return { q: `応力 $\\sigma=${mt(S)}$（MPa）で、$\\vec n=${pt(n)}$ の切り口の力 $\\vec t$`, a: `$${pt(out)}$（MPa）`, key: `22|${sig(S)}|${n}`, easyCheck: false,
          easy: `$(${S[0][0]}\\times${nt(n[0])}+${S[0][1]}\\times${nt(n[1])},\\ ${S[1][0]}\\times${nt(n[0])}+${S[1][1]}\\times${nt(n[1])})$`.replace(/\\times(-[\d.]+)/g, '\\times($1)').replace(/\+-/g, '-'),
          verify: p => ptIs(p, mulNv(S, n)) };
      },
      // 見かけがちがう：45° の切り口（0.707）、切り口に直角な成分（押す・引く）
      s3(r) {
        const S = sigma(r); if (!S) return null;
        if (turn(r, '22s3', 2) === 0) {
          const sg = r.pick([[1, 1], [1, -1], [-1, 1]]), n = sg.map(s => D(0.707 * s)), out = mulv(mk(S), n);
          const tv = mulNv(S, sg.map(s => s / Math.SQRT2)), xs = out.map((f, i) => agree(f, tv[i], 1));
          if (xs.some(x => x == null)) return null;
          return { q: `応力 $\\sigma=${mt(S)}$（MPa）で、$\\vec n=${pt(n)}$ の切り口の力 $\\vec t$（$0.707$ は $\\cos45^{\\circ}$ の値。小数第1位まで）`,
            a: `約 $(${xs[0]},\\ ${xs[1]})$（MPa）`, key: `22|${sig(S)}|45${sg}`, easyCheck: false,
            easy: `$0.707\\times(${S[0][0] * sg[0] + S[0][1] * sg[1]},\\ ${S[1][0] * sg[0] + S[1][1] * sg[1]})$`, verify: p => ptIs(p, tv.map(x => Math.round(x * 10) / 10)) };
        }
        const n = r.pick(NS), t = mulv(mk(S), n), tn = F.add(F.mul(t[0], D(n[0])), F.mul(t[1], D(n[1])));
        return { q: `応力 $\\sigma=${mt(S)}$（MPa）で、$\\vec n=${pt(n)}$ の切り口の力 $\\vec t$ の、$\\vec n$ の向きの成分 $\\vec t\\cdot\\vec n$（引く向きが正）`,
          a: `$${nt(tn)}$（MPa）`, key: `22|${sig(S)}|${n}|tn`, easyCheck: false, easy: `$\\vec t=${pt(t)}$、$\\vec t\\cdot\\vec n$ をとる`,
          verify: p => { const v = mulNv(S, n), x = v[0] * n[0] + v[1] * n[1], g = nums(p.a); return (g.length && closeN(g[0], x)) || 'ちがう'; } };
      },
      // わな：力が切り口に直角になる向き（主方向。7-71）
      trap(r) {
        const u = r.pick([[1, 1], [1, 2], [2, 1], [1, -1], [1, -2]]), w = [-u[1], u[0]], n2u = u[0] * u[0] + u[1] * u[1];
        for (let t = 0; t < 30; t++) {
          const l1 = r.pick([100, 90, 80, 60, 50, 40, 20]), l2 = r.pick([-60, -50, -40, -20, -10, 0, 10, 30]);
          if (l1 === l2) continue;
          const S = [[(l1 * u[0] * u[0] + l2 * w[0] * w[0]) / n2u, (l1 * u[0] * u[1] + l2 * w[0] * w[1]) / n2u], [(l1 * u[1] * u[0] + l2 * w[1] * w[0]) / n2u, (l1 * u[1] * u[1] + l2 * w[1] * w[1]) / n2u]];
          if (S.flat().some(x => !Number.isInteger(x)) || S[0][1] === 0 || bad22(S)) continue;
          return dest({ q: `応力 $\\sigma=${mt(S)}$（MPa）で、切り口の力 $\\vec t$ が切り口に直角になる（ずらす力が0の）切り口の向き $\\vec n$`,
            a: `$${pt(u)}$ と $${pt(w)}$ の向き`, key: `22t|${sig(S)}`,
            verify: p => { const P = readPts(p.a); return (P.length === 2 && P.every(v => { const sv = mulNv(S, v); return Math.hypot(...v) > 0 && closeN(sv[0] * v[1] - sv[1] * v[0], 0); })) || '向きがちがう'; } }, '7-22',
            '$\\sigma\\vec n$ が $\\vec n$ と同じ向き（$\\sigma\\vec n=\\lambda\\vec n$）になる $\\vec n$ をさがす問い。固有ベクトル（主方向）', ['7-71']);
        }
        return null;
      },
    },
  });
  // ================================================================ 7-23
  // ことばで言う変換：te（「はじめに□し、」の形）、ru（「□する」の形）、m（行列）
  const TW = {
    S2x: { te: '横に2倍にのばし', ru: '横に2倍にのばす', m: [[2, 0], [0, 1]] },
    S3x: { te: '横に3倍にのばし', ru: '横に3倍にのばす', m: [[3, 0], [0, 1]] },
    S2y: { te: 'たてに2倍にのばし', ru: 'たてに2倍にのばす', m: [[1, 0], [0, 2]] },
    S3y: { te: 'たてに3倍にのばし', ru: 'たてに3倍にのばす', m: [[1, 0], [0, 3]] },
    R90: { te: '左回りに $90^{\\circ}$ 回し', ru: '左回りに $90^{\\circ}$ 回す', m: [[0, -1], [1, 0]] },
    Rm90: { te: '右回りに $90^{\\circ}$ 回し', ru: '右回りに $90^{\\circ}$ 回す', m: [[0, 1], [-1, 0]] },
    Fx: { te: '上下に裏返し', ru: '上下に裏返す', m: [[1, 0], [0, -1]] },
    Fy: { te: '左右に裏返し', ru: '左右に裏返す', m: [[-1, 0], [0, 1]] },
    Fd: { te: '直線 $y=x$ で折り返し', ru: '直線 $y=x$ で折り返す', m: [[0, 1], [1, 0]] },
    H1: { te: '高さ $y$ の点を $y$ だけ右へずらし', ru: '高さ $y$ の点を $y$ だけ右へずらす', m: [[1, 1], [0, 1]] },
  };
  const TWK = Object.keys(TW);
  const mul2 = (A, B) => Mat.mul(mk(A), mk(B));
  const commute = (A, B) => sameM(mul2(A, B), mul2(B, A));
  M.add({
    id: '7-23', part: 2, chap: '7-3①② 例題3', stars: 1,
    title: '変換をつなぐと積：先にする行列を右に書く（「$S$ のあと $R_{90}$」は $R_{90}S$）',
    mark: '「はじめに□、つぎに□」をする変換を、1つの行列で表す。',
    futsu: ['点 $(x,\\ y)$ を、まず $S$ に入れて $(2x,\\ y)$、', 'それを $R_{90}$ に入れて $(-y,\\ 2x)$。', 'この式から4つの数を読みとる'],
    raku: ['はじめに横に2倍 $S=\\begin{pmatrix}2&0\\\\0&1\\end{pmatrix}$、', 'つぎに左回りに $90^{\\circ}$ → 先の $S$ が右', '$R_{90}S=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\begin{pmatrix}2&0\\\\0&1\\end{pmatrix}$', '$=\\begin{pmatrix}0&-1\\\\2&0\\end{pmatrix}$'],
    why: '点 $\\vec x$ を $S$ に入れ、出てきた $S\\vec x$ を $R_{90}$ に入れると $R_{90}(S\\vec x)$。$\\vec x$ にいちばん近い（右の）行列が先にかかる（7-3①）。だから2つの機械をまとめた1つの行列は、あとの行列を左、先の行列を右に書いた積 $R_{90}S$。3つなら、先にするものから右から左へ並べる。',
    caution: '日本語の順（$S$、$R_{90}$）のまま $SR_{90}$ と書かない（それは「先に回してから2倍」）。順番を入れかえると、ふつうはちがう行列になる。平行移動は2×2 の行列ではできない。',
    counts: { s1: 2, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '40mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /はじめに/.test(q) && /つぎに/.test(q) && !/箱|レンズ|すき間|平行移動/.test(q); },
    steps: {
      // 行列で：はじめに $P$、つぎに $Q$ → $QP$
      s1(r) {
        const pickM = () => (r.chance(0.5) ? TW[r.pick(TWK)].m : [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]]);
        const P = pickM(), Q = pickM();
        if (commute(P, Q) || (sameM(P, TW.S2x.m) && sameM(Q, TW.R90.m)) || P.flat().filter(x => !x).length > 2 || Q.flat().filter(x => !x).length > 2) return null;
        const A = mul2(Q, P);
        return { q: `はじめに $P=${mt(P)}$、つぎに $Q=${mt(Q)}$ をかける変換を、1つの行列で`, a: `$${mt(A)}$`, key: `23|${sig(Q)}|${sig(P)}`, easyCheck: false,
          easy: '先の $P$ を右に書いて $QP$', calc: { kind: 'mat', want: A }, verify: p => matIs(p, mulN(Q, P)) };
      },
      // ことばで：はじめに□し、つぎに□する
      s2(r) {
        const a = r.pick(TWK), b = r.pick(TWK);
        if (a === b || commute(TW[a].m, TW[b].m) || (a === 'S2x' && b === 'R90')) return null;
        const A = mul2(TW[b].m, TW[a].m);
        if (!cap2(r, '23s2', sig(A))) return null;
        return { q: `はじめに${TW[a].te}、つぎに${TW[b].ru}変換の行列`, a: `$${mt(A)}$`, key: `23|${sig(TW[b].m)}|${sig(TW[a].m)}`, easyCheck: false,
          easy: `$${mt(TW[b].m)}${mt(TW[a].m)}$（先が右）`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, mulN(TW[b].m, TW[a].m)) };
      },
      // 見かけがちがう：3つの変換をつなぐ、点の行き先
      s3(r) {
        if (turn(r, '23s3', 2) === 0) {
          const [a, b, c] = [r.pick(TWK), r.pick(TWK), r.pick(TWK)];
          if (a === b || b === c || a === c) return null;
          const A = Mat.mul(mk(TW[c].m), mul2(TW[b].m, TW[a].m));
          if (sameM(A, Mat.mul(mk(TW[a].m), mul2(TW[b].m, TW[c].m)))) return null;
          return { q: `はじめに${TW[a].te}、つぎに${TW[b].te}、最後に${TW[c].ru}変換の行列`, a: `$${mt(A)}$`, key: `23|${sig(TW[c].m)}|${sig(TW[b].m)}|${sig(TW[a].m)}`, easyCheck: false,
            easy: `$${mt(TW[c].m)}${mt(TW[b].m)}${mt(TW[a].m)}$（先にするものほど右）`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, mulN(TW[c].m, mulN(TW[b].m, TW[a].m))) };
        }
        const a = r.pick(TWK), b = r.pick(TWK), x = [r.int(-2, 3), r.int(1, 3)];
        if (a === b || commute(TW[a].m, TW[b].m) || (a === 'S2x' && b === 'R90')) return null;
        const A = mul2(TW[b].m, TW[a].m), out = mulv(A, x);
        return { q: `点 $${pt(x)}$ を、はじめに${TW[a].te}、つぎに${TW[b].ru}。行き先の点`, a: `$${pt(out)}$`, key: `23|${sig(TW[b].m)}|${sig(TW[a].m)}|${x}`, easyCheck: false,
          easy: `$${mt(A)}${cv(x)}$`, verify: p => ptIs(p, mulNv(TW[b].m, mulNv(TW[a].m, x))) };
      },
      // わな：回したあと平行移動（7-59）
      trap(r) {
        const a = r.pick(['R90', 'Rm90', 'Fx', 'Fy', 'S2x']), k = r.int(1, 4), dir = r.pick(['右', '左', '上']);
        return dest({ q: `${TW[a].te}たあと、${dir}へ $${k}$ だけ平行移動する変換を表す2×2 の行列`,
          a: '2×2 の行列ではできない（原点が動く）', key: `23t|${a}|${dir}${k}`, verify: p => /できない/.test(p.a) || 'ことばがちがう' }, '7-23',
          '平行移動では原点 $(0,\\ 0)$ が動くが、2×2 の行列はどれも原点を動かせない。同次座標（3×3 の行列）を使う', ['7-59']);
      },
    },
  });

  // ================================================================ 7-24
  const EX24 = [[[2, 0], [0, 3]], [[5, 0], [0, -1]], [[1, 1], [0, 1]], [[2, 0], [0, 1]]];
  const isDiag = A => A[0][1] === 0 && A[1][0] === 0;
  const isScalar = A => isDiag(A) && A[0][0] === A[1][1];
  const abAns = (A, B) => { const P = mul2(A, B), Q = mul2(B, A); return sameM(P, Q) ? `$AB=BA=${mt(P)}$` : `$AB=${mt(P)}$、$BA=${mt(Q)}$`; };
  // 答えの検算：AB と BA を、文の行列から小数で計算しなおし、答えの行列とくらべる
  function check24(p, A, B) {
    const P = mulN(A, B), Q = mulN(B, A), ms = (String(p.a).match(/\\begin\{pmatrix\}[\s\S]*?\\end\{pmatrix\}/g) || []).map(t => M.readMat(t).map(r2 => r2.map(c => c[0])));
    if (sameN(P, Q)) return (ms.length === 1 && sameN(ms[0], P) && /AB=BA=/.test(p.a)) || '同じになるはず';
    return (ms.length === 2 && sameN(ms[0], P) && sameN(ms[1], Q) && /BA=\\begin/.test(p.a)) || 'AB と BA がちがう';
  }
  M.add({
    id: '7-24', part: 2, chap: '7-3④ 例題2', stars: 1,
    title: '$AB$ と $BA$：対角どうし・回転どうし・$I$ をふくむときは同じ（計算は1回）、ほかは2つとも計算する',
    mark: '「$AB$ と $BA$ をくらべよう」。2つの行列が、ななめ以外0どうし、回転どうし、片方が $I$ や $kI$ か。',
    futsu: ['$\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$ と $\\begin{pmatrix}5&0\\\\0&-1\\end{pmatrix}$ でも、', '$AB$ を行と列で4つ、$BA$ も行と列で4つ', '計算してから、くらべる'],
    raku: ['$\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$ と $\\begin{pmatrix}5&0\\\\0&-1\\end{pmatrix}$ → 対角どうし', '→ どちらも $\\begin{pmatrix}10&0\\\\0&-3\\end{pmatrix}$（1回）', '$\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$ と $\\begin{pmatrix}2&0\\\\0&1\\end{pmatrix}$ → 片方だけ対角', '→ ちがう（2つとも計算）'],
    why: '対角の行列は「横に□倍、たてに□倍」で、のばす順を入れかえても結果は同じ。回転どうしも、回す角をたす順を入れかえても同じ（7-3④）。$I$ は何もしない機械、$kI$ はどの向きも $k$ 倍なので、前でも後ろでも同じ。そのほかは、ふつう $AB\\neq BA$ なので、2つとも計算するしかない。',
    caution: '同じになる組でも、成分ごとのかけ算ではない（対角どうしは、ななめの数どうしをかけるだけ）。片方だけが対角の組は、左からなら行を、右からなら列を何倍にするので、ふつうはちがう。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '52mm', s3: '52mm', trap: '52mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) {
      if (!/AB\$ ?と ?\$BA/.test(q)) return false;
      const ms = qMats(q); if (ms.length !== 2) return true;
      if (ms.some(A => A.length !== 2 || A[0].length !== 2)) return false;   // 正方行列でない組（大きさがちがう。7-05）
      const dg = A => A[0][1] === 0 && A[1][0] === 0, sc = A => dg(A) && A[0][0] === A[1][1];
      return !((dg(ms[0]) && !sc(ms[0]) && !dg(ms[1])) || (dg(ms[1]) && !sc(ms[1]) && !dg(ms[0])));
    },
    steps: {
      // 同じになる組：対角どうし・回転どうし・$I$ や $kI$
      s1(r) {
        const kind = turn(r, '24s1', 3); let A, B;
        if (kind === 0) { A = [[r.pick([2, 3, -1, 4, -2]), 0], [0, r.pick([2, 5, -1, 3, -3])]]; B = [[r.pick([3, 4, -2, 5, 2]), 0], [0, r.pick([2, -1, 4, 3])]]; if (isScalar(A) || isScalar(B)) return null; }
        else if (kind === 1) { const R = [TW.R90.m, TW.Rm90.m, NAMED.R180.m]; A = r.pick(R); B = r.pick(R); if (sameM(A, B)) return null; }
        else { A = [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]]; const k = r.pick([2, 3, -1, -2]); B = [[k, 0], [0, k]]; if (isDiag(A)) return null; if (r.chance(0.5)) [A, B] = [B, A]; }
        if (EX24.some(E => sameM(E, A)) && EX24.some(E => sameM(E, B))) return null;
        return { q: `$A=${mt(A)}$、$B=${mt(B)}$ の $AB$ と $BA$`, a: abAns(A, B), key: `24|${[sig(A), sig(B)].sort()}`, easyCheck: false,
          easy: kind === 0 ? '対角どうしなので同じ。ななめの数どうしをかける' : kind === 1 ? '回転どうしなので同じ（回す角をたす）' : '$kI$ をふくむので同じ（$k$ 倍するだけ）', verify: p => check24(p, A, B) };
      },
      // ふつうの組：2つとも計算する（4問に1問は、見かけでは気づきにくい同じになる組 $B=A+kI$）
      s2(r) {
        let A = [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]], B;
        if (isDiag(A) || A.flat().filter(x => !x).length > 1) return null;
        if (turn(r, '24s2', 4) === 3) { const k = r.pick([1, 2, -1]); B = [[A[0][0] + k, A[0][1]], [A[1][0], A[1][1] + k]]; }
        else { B = r.chance(0.5) ? TW[r.pick(['R90', 'Rm90', 'Fd', 'H1'])].m : [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]]; if (isDiag(B) || commute(A, B)) return null; }
        return { q: `$A=${mt(A)}$、$B=${mt(B)}$ の $AB$ と $BA$`, a: abAns(A, B), key: `24|${[sig(A), sig(B)].sort()}`, easyCheck: false,
          easy: '対角・回転・$kI$ の組ではないので、2つとも行と列で計算する', verify: p => check24(p, A, B) };
      },
      // 見かけがちがう：ことばの変換、電気の箱
      s3(r) {
        let A, B, txt;
        if (turn(r, '24s3', 2) === 0) {
          const a = r.pick(TWK), b = r.pick(TWK); if (a === b) return null;
          A = TW[a].m; B = TW[b].m; txt = `$A$ を「${TW[a].ru}」行列、$B$ を「${TW[b].ru}」行列とするときの $AB$ と $BA$`;
        } else {
          const R1 = r.pick([1, 2, 3, 4, 5]), R2 = r.pick([1, 2, 4, 5]), par = r.chance(0.5);
          A = [[1, R1], [0, 1]]; B = par ? [[1, 0], [F.make(1, R2), 1]] : [[1, R2], [0, 1]];
          if (!par && R1 === R2) return null;
          txt = `直列 ${OHM(R1)} の箱の行列を $A$、${par ? '並列' : '直列'} ${OHM(R2)} の箱の行列を $B$ とするときの $AB$ と $BA$`;
        }
        return { q: txt, a: abAns(A, B), key: `24|${[sig(A), sig(B)].sort()}`, easyCheck: false,
          easy: `$A=${mt(A)}$、$B=${mt(B)}$`, verify: p => check24(p, A.map(r2 => r2.map(nv)), B.map(r2 => r2.map(nv))) };
      },
      // わな：正方行列でない組（$AB$ と $BA$ は大きさからちがう。7-05）。
      //   「片方だけ対角」のわなは、このわざの楽な形と caution で解けるのでやめた（N-3・O-5・U-4・R1-9）
      trap(r) {
        const [m, n] = r.pick([[2, 3], [3, 2], [1, 2], [2, 1]]), A = Array.from({ length: m }, () => Array.from({ length: n }, () => r.int(-2, 4))), B = Array.from({ length: n }, () => Array.from({ length: m }, () => r.int(-2, 4)));
        if (A.flat().filter(x => !x).length > 1 || B.flat().filter(x => !x).length > 1) return null;
        const sz = (a, b) => `${a}×${b}`;
        return dest({ q: `$A=${mt(A)}$、$B=${mt(B)}$ の $AB$ と $BA$ は同じか。それぞれ何×何行列か □`, a: `同じでない（$AB$ は ${sz(m, m)}、$BA$ は ${sz(n, n)}）`, key: `24t|${sig(A)}|${sig(B)}`,
          verify: p => { const [U, V] = qMats(p.q); return (U[0].length === V.length && V[0].length === U.length && U.length !== V.length && p.a === `同じでない（$AB$ は ${sz(U.length, U.length)}、$BA$ は ${sz(V.length, V.length)}）`) || '大きさがちがう'; } }, '7-24',
          `正方行列でない組。$AB$ は ${sz(m, n)} と ${sz(n, m)} の積で ${sz(m, m)}、$BA$ は ${sz(n, n)}。大きさがちがうので、成分を計算するまでもなく同じでない`, ['7-05']);
      },
    },
  });

  // ================================================================ 7-25
  const EX25 = [[[1, 2], [0, 1]], [[0, 1], [1, 0]], [[2, 0], [0, 3]]];
  // 例の行列の、ななめ・行・列を入れかえたものと転置（diag(3, 2)、(1 0; 2 1) など。U-2・R1-34）
  const EX25v = [[[3, 0], [0, 2]], [[1, 0], [2, 1]], [[0, 1], [1, 2]], [[2, 1], [1, 0]], [[1, 0], [0, 1]]];
  const UNI = [[[2, 1], [1, 1]], [[1, 2], [0, 1]], [[3, 2], [1, 1]], [[1, 0], [3, 1]], [[2, 3], [1, 2]], [[1, 0], [-2, 1]], [[3, 1], [2, 1]], [[1, -1], [0, 1]]];
  const rnd2 = (r, lo, hi) => [[r.int(lo, hi), r.int(lo, hi)], [r.int(lo, hi), r.int(lo, hi)]];
  M.add({
    id: '7-25', part: 2, chap: '7-3⑤ 例題6', stars: 1,
    title: '3つの積は、かんたんになる組から先に（$(AB)C=A(BC)$。左右の並びは変えない）',
    mark: '3つの行列の積 $ABC$ で、対角の行列や、かけると $I$ になる組がある。',
    futsu: ['いつも左から $AB$ を作り、', 'それに $C$ をかける（8つのかけ算を2回）'],
    raku: ['$A=\\begin{pmatrix}1&2\\\\0&1\\end{pmatrix}$、$B=\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$、$C=\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$', '$AB=\\begin{pmatrix}2&1\\\\1&0\\end{pmatrix}$、対角の $C$ は列を2倍・3倍', '→ $ABC=\\begin{pmatrix}4&3\\\\2&0\\end{pmatrix}$'],
    why: '3つの機械を $C\\to B\\to A$ の順に通すとき、前の2つを先にまとめても、後ろの2つを先にまとめても、点が通る順は同じ（結合法則、7-3⑤）。だから、計算が楽になる組（対角の行列とのかけ算、かけると $I$ になる組）を先にまとめてよい。ベクトルにかけるときは、右から1つずつ行列×ベクトルをするのが楽。',
    caution: 'かっこの位置は自由でも、左右の並び（$A$、$B$、$C$ の順）は変えない（$ACB$ にしない）。対角の行列を右からかけると列を、左からかけると行を何倍にする。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '18mm', trap: '52mm' }, boxh: { s1: '11mm', s2: '11mm', trap: '11mm' },
    fits(q) { return /ABC/.test(q) && !/CBA/.test(q); },
    steps: {
      // 対角の行列が右はし・左はし
      s1(r) {
        const A = rnd2(r, -1, 3), B = rnd2(r, -1, 3), Dg = [[r.pick([2, 3, -1, 4]), 0], [0, r.pick([2, 3, -2, 5])]];
        if (isDiag(A) || isDiag(B) || isScalar(Dg) || A.flat().filter(x => !x).length > 2 || B.flat().filter(x => !x).length > 2) return null;
        if ([A, B, Dg].some(X => EX25v.some(E => sameM(E, X)))) return null;   // 例の行列の入れかえ・転置（U-2・R1-34）
        const right = r.chance(0.6), [X, Y, Z] = right ? [A, B, Dg] : [Dg, A, B];
        if (sameM(X, EX25[0]) && sameM(Y, EX25[1]) && sameM(Z, EX25[2])) return null;
        const P = Mat.mul(mul2(X, Y), mk(Z));
        return { q: `$A=${mt(X)}$、$B=${mt(Y)}$、$C=${mt(Z)}$ の $ABC$`, a: `$${mt(P)}$`, key: `25|${sig(X)}|${sig(Y)}|${sig(Z)}`, easyCheck: false,
          easy: right ? `$AB=${mt(mul2(X, Y))}$ を先に。対角の $C$ で列を $${Z[0][0]}$ 倍・$${Z[1][1]}$ 倍` : `$BC=${mt(mul2(Y, Z))}$ を先に。対角の $A$ で行を $${X[0][0]}$ 倍・$${X[1][1]}$ 倍`,
          calc: { kind: 'mat', want: P }, verify: p => matIs(p, mulN(mulN(X, Y), Z)) };
      },
      // かけると $I$ になる組
      s2(r) {
        const U = r.pick(UNI), Ui = Mat.inv(mk(U)), O = rnd2(r, -2, 4);
        if (isDiag(O) || O.flat().filter(x => !x).length > 1) return null;
        const kind = r.int(0, 1), [X, Y, Z] = kind === 0 ? [O, Ui, U] : [U, Ui, O];
        const P = Mat.mul(Mat.mul(mk(X), mk(Y)), mk(Z));
        return { q: `$A=${mt(X)}$、$B=${mt(Y)}$、$C=${mt(Z)}$ の $ABC$`, a: `$${mt(P)}$`, key: `25|${sig(X)}|${sig(Y)}|${sig(Z)}`, easyCheck: false,
          easy: kind === 0 ? '$BC=I$ なので $ABC=A$' : '$AB=I$ なので $ABC=C$', calc: { kind: 'mat', want: P }, verify: p => matIs(p, mulN(mulN(X.map(r2 => r2.map(nv)), Y.map(r2 => r2.map(nv))), Z.map(r2 => r2.map(nv)))) };
      },
      // 3つの行列×ベクトル：右から1つずつ
      s3(r) {
        const A = rnd2(r, -1, 3), B = rnd2(r, -1, 3), C = rnd2(r, -1, 3), x = [r.int(-2, 3), r.int(-2, 3)];
        if ([A, B, C].some(X => X.flat().filter(v => !v).length > 2) || (!x[0] && !x[1])) return null;
        const c1 = mulv(mk(C), x), c2 = mulv(mk(B), c1), c3 = mulv(mk(A), c2);
        return { q: `$A=${mt(A)}$、$B=${mt(B)}$、$C=${mt(C)}$ の $ABC${cv(x)}$`, a: `$${pt(c3)}$`, key: `25|${sig(A)}|${sig(B)}|${sig(C)}|${x}`, easyCheck: false,
          easy: `右から：$C\\vec x=${pt(c1)}$、$B(\\cdots)=${pt(c2)}$、$A(\\cdots)$`, verify: p => ptIs(p, mulNv(A, mulNv(B, mulNv(C, x)))) };
      },
      // わな：$ABC$ と $CBA$（並びが変わる。7-24）
      trap(r) {
        const A = rnd2(r, -1, 2), B = rnd2(r, -1, 2), C = rnd2(r, -1, 2);
        if ([A, B, C].some(X => X.flat().filter(v => !v).length > 2)) return null;
        const P = Mat.mul(mul2(A, B), mk(C)), Q = Mat.mul(mul2(C, B), mk(A));
        if (sameM(P, Q)) return null;
        return dest({ q: `$A=${mt(A)}$、$B=${mt(B)}$、$C=${mt(C)}$ の $ABC$ と $CBA$ は同じか`, a: 'ちがう', key: `25t|${sig(A)}|${sig(B)}|${sig(C)}`,
          verify: p => (/ちがう/.test(p.a) && !sameN(mulN(mulN(A, B), C), mulN(mulN(C, B), A))) || 'ちがうはず' }, '7-25',
          `$ABC=${mt(P)}$、$CBA=${mt(Q)}$。並び（左右の順）が変わるので、かっこの位置の話ではない。積の順番を変えると、ふつうはちがう`, ['7-24']);
      },
    },
  });

  // ================================================================ 7-26
  const EX26 = [[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[2, 0], [0, 3]], [[2, 1], [1, 2]]];
  const powTxt = (A, n) => `$${mt(A)}^{${n}}$`;
  M.add({
    id: '7-26', part: 2, chap: '7-3⑤ 例題5・7-10⑥', stars: 1,
    title: '形のある行列の $n$ 乗は形で：ずらしは右上が $n$ 倍、対角は成分の $n$ 乗、$R_{90}^2=-I$',
    mark: '同じ行列を何回もかける $A^2$・$A^5$。ずらし・対角・回転・裏返しの形の行列。',
    futsu: ['$\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}^3$ を、$A^2=AA$ を作り、', '$A^3=A^2A$ と、行と列で2回かける'],
    raku: ['$\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}^3=\\begin{pmatrix}1&3\\\\0&1\\end{pmatrix}$（3回ずらす）', '$\\begin{pmatrix}1&0\\\\1&1\\end{pmatrix}^3=\\begin{pmatrix}1&0\\\\3&1\\end{pmatrix}$', '$\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}^3=\\begin{pmatrix}8&0\\\\0&27\\end{pmatrix}$', '$\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}^2=\\begin{pmatrix}5&4\\\\4&5\\end{pmatrix}$（2乗ではない）'],
    why: '$A^n$ は「同じ変換を $n$ 回」（7-3⑤）。ずらしを $n$ 回すると、高さ $y$ の点は $ny$ だけずれるので右上が $n$ 倍。対角は向きごとに $n$ 回のばすので、ななめの数の $n$ 乗。$90^{\\circ}$ 回すのを4回で1回り（$R_{90}^4=I$）、裏返しは2回でもとにもどる。',
    caution: '形のない行列の $A^2$ は、成分をそれぞれ2乗したものではない（$AA$ を行と列で）。ずらしの右上は $k^n$ ではなく $nk$。$R_{90}^n$ は $n$ を4でわった余りで決まる。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) {
      if (/箱を ?\$\d+\$ ?個/.test(q) || /\$\d+\$ ?回くり返す/.test(q)) return true;
      const m = /\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}\^\{(\d+)\}/.exec(q); if (!m) return false;
      const A = m[1].split(/\\\\/).map(rw => rw.split('&').map(c => ev(c.trim())));
      const dg = A[0][1] === 0 && A[1][0] === 0, sh = (A[0][0] === 1 && A[1][1] === 1 && (A[0][1] === 0 || A[1][0] === 0));
      const rf = A.flat().every(x => Math.abs(x) <= 1) && Math.abs(A[0][0] * A[1][1] - A[0][1] * A[1][0]) === 1 && (A[0][0] === 0 ? A[1][1] === 0 : A[0][1] === 0 && A[1][0] === 0);
      return dg || sh || rf;
    },
    steps: {
      // ずらし・対角
      s1(r) {
        const kind = turn(r, '26s1', 3); let A, n;
        if (kind < 2) { const k = r.pick([1, 2, 3, -1, -2, 0.5]); n = r.int(3, 10); A = kind === 0 ? [[1, k], [0, 1]] : [[1, 0], [k, 1]]; }
        else { A = [[r.pick([2, 3, -1, -2, 0.5]), 0], [0, r.pick([2, 3, -1, 1, -2])]]; n = r.int(2, 5); if (isScalar(A) || Math.abs(A[0][0]) ** n > 250 || Math.abs(A[1][1]) ** n > 250) return null; }
        if (EX26.some(E => sameM(E, A)) && n === 3) return null;
        const P = Mat.pow(mk(A), n);
        return { q: powTxt(A, n), a: `$${mt(P)}$`, key: `26|${sig(A)}|${n}`, easyCheck: false,
          easy: kind === 0 ? `右上が $${n}\\times${ntp(A[0][1])}$` : kind === 1 ? `左下が $${n}\\times${ntp(A[1][0])}$` : 'ななめの数を $n$ 乗', calc: { kind: 'mat', want: P }, verify: p => matIs(p, powN(A, n)) };
      },
      // 回転・裏返し、形のない行列の2乗
      s2(r) {
        const kind = turn(r, '26s2', 4); let A, n, e;
        if (kind < 3) { A = r.pick([TW.R90.m, TW.Rm90.m, TW.Fx.m, TW.Fy.m, TW.Fd.m, TW.R90.m]); n = r.int(2, 9); const rot = A[0][0] === 0 && A[0][1] !== A[1][0]; e = rot ? `$90^{\\circ}$ を $${n}$ 回（$${n}$ を4でわった余り $${n % 4}$）` : `裏返しは2回でもどる（$${n}$ は${n % 2 ? '奇数' : '偶数'}）`; }
        else { A = rnd2(r, -2, 3); n = 2; if (isDiag(A) || EX26.some(E => sameM(E, A)) || A.flat().filter(x => !x).length > 1) return null; e = '$AA$ を行と列で（成分の2乗ではない）'; }
        const P = Mat.pow(mk(A), n);
        // 回転・裏返しは、答え（$I$ など）が重ならないように、key を答えにする（U-3）
        return { q: powTxt(A, n), a: `$${mt(P)}$`, key: kind < 3 ? `26a|${sig(P)}` : `26|${sig(A)}|${n}`, easyCheck: false, easy: e, calc: { kind: 'mat', want: P }, verify: p => matIs(p, powN(A, n)) };
      },
      // 見かけがちがう：同じ箱を $n$ 個、同じ変換を $n$ 回
      s3(r) {
        const kind = turn(r, '26s3', 3), n = r.int(3, 8); let A, q, e;
        if (kind === 0) { const R = r.pick([1, 2, 3, 0.5, 5]); A = [[1, R], [0, 1]]; q = `直列 ${OHM(R)} の箱を $${n}$ 個つないだ回路の行列`; e = `$${mt(A)}^{${n}}$。ずらしの形`; }
        else if (kind === 1) { const R = r.pick([2, 4, 5, 10]); A = [[1, 0], [F.make(1, R), 1]]; q = `並列 ${OHM(R)} の箱を $${n}$ 個つないだ回路の行列`; e = `$${mt(A)}^{${n}}$。下にずらす形`; }
        else { const t = r.pick(['R90', 'Rm90', 'Fd', 'H1']); A = TW[t].m; q = `「${TW[t].ru}」変換を $${n}$ 回くり返す行列`; e = `$${mt(A)}^{${n}}$`; }
        const P = Mat.pow(mk(A), n);
        return { q, a: `$${mt(P)}$`, key: `26|${sig(A)}|${n}`, easyCheck: false, easy: e, calc: { kind: 'mat', want: P }, verify: p => matIs(p, powN(A.map(r2 => r2.map(nv)), n)) };
      },
      // わな：成分がみな同じ（7-74）
      trap(r) {
        const A = r.pick([[[1, 1], [1, 1]], [[2, 2], [2, 2]], [[1, -1], [-1, 1]], [[-1, 1], [1, -1]], [[3, 3], [3, 3]]]), a = Math.abs(A[0][0]);
        const n = r.int(3, a === 1 ? 6 : a === 2 ? 4 : 3), P = Mat.pow(mk(A), n);
        return dest({ q: powTxt(A, n), a: `$${mt(P)}$`, key: `26t|${sig(A)}`, calc: { kind: 'mat', want: P }, verify: p => matIs(p, powN(A, n)) }, '7-26',
          'ずらし・対角・回転の形ではない。$A^2=' + nt(2 * a) + 'A$ に気づくか、固有値で対角化して $n$ 乗する', ['7-74']);
      },
    },
  });
  // 小数の行列の n 乗（検算用）
  function powN(A, n) { let P = [[1, 0], [0, 1]]; for (let k = 0; k < n; k++) P = mulN(P, A.map(r => r.map(nv))); return P; }
  // ---------------------------------------------------------------- 電気の箱（7-3⑥）：出口の組 (V2, I2) を入れると入口の組 (V1, I1) が出てくる
  const SER = R => [[F.make(1), D(R)], [F.make(0), F.make(1)]];
  const PAR = R => [[F.make(1), F.make(0)], [F.div(F.make(1), D(R)), F.make(1)]];
  const boxM = list => list.reduce((acc, [t, R]) => Mat.mul(acc, t === 'S' ? SER(R) : PAR(R)), Mat.eye(2));
  const boxW = ([t, R]) => `${t === 'S' ? '直列' : '並列'} ${OHM(R)}`;
  const boxKey = list => 'box|' + list.map(([t, R]) => t + nt(R)).join('|');
  // 箱の行列を小数で（検算用。式から直接）
  const boxN = list => list.reduce((acc, [t, R]) => mulN(acc, t === 'S' ? [[1, +R], [0, 1]] : [[1, 0], [1 / +R, 1]]), [[1, 0], [0, 1]]);
  // 図：箱の回路（左が入口、右が出口）。直列は上の線の上、並列は2本の線のあいだ
  function boxFig(list) {
    const top = 1.6, bot = -1.6, its = [], W = 3.4, FR = R => `$${nt(R)}\\,\\Omega$`; let x = 1;
    its.push(['seg', [0, top], [x, top]]);
    list.forEach(([t, R], k) => {
      if (t === 'S') its.push(...M.figResistor([x, top], [x + W, top], { len: 1.6, w: 0.6 }), ['label', [x + W / 2, top + 0.3], FR(R), 'n']);
      else { const last = k === list.length - 1; its.push(['seg', [x, top], [x + W, top]], ...M.figResistor([x + W / 2, top], [x + W / 2, bot], { len: 1.6, w: 0.6 }), ['label', [x + W / 2 + (last ? -0.35 : 0.35), 0], FR(R), last ? 'w' : 'e']); }
      x += W;
    });
    its.push(['seg', [x, top], [x + 1, top]]); x += 1;
    its.push(['seg', [0, bot], [x, bot]], ['dot', [0, top], { open: true }], ['dot', [0, bot], { open: true }], ['dot', [x, top], { open: true }], ['dot', [x, bot], { open: true }]);
    its.push(['label', [-0.3, 0], '入口', 'w'], ['label', [x + 0.3, 0], '出口', 'e']);
    return { s: 4, items: its };
  }
  const RS = [1, 2, 3, 4, 5, 6, 8, 10], RP = [1, 2, 4, 5, 10];

  // ================================================================ 7-27
  const bad27 = (R, Rp) => R === 2 && Rp === 2;   // 左ページの例（O-2）
  M.add({
    id: '7-27', part: 2, chap: '7-3⑥ 例題7', stars: 1,
    title: '箱の行列は入口側を左に。直列 $R$ の箱のあとに並列 $R\'$ の箱なら、左上だけが $1+\\frac{R}{R\'}$（ほかは $R$、$\\frac{1}{R\'}$、1）',
    mark: '直列の抵抗の箱と、並列の抵抗の箱を1つずつつないだ回路の行列。',
    futsu: ['2つの箱の行列を書き、行と列で', '4つの成分を1つずつ計算する', '（どちらを左に書くかで迷う）'],
    raku: ['直列 $2\\,\\mathrm{\\Omega}$ → 並列 $2\\,\\mathrm{\\Omega}$', '左上 $1+\\frac22=2$、右上 $2$、', '左下 $\\frac12=0.5$、右下 $1$', '→ $\\begin{pmatrix}2&2\\\\0.5&1\\end{pmatrix}$'],
    why: '箱の行列は「出口の組を入れると入口の組が出てくる」向き。出口に近い箱が先にかかるので右、入口側の箱が左（7-3⑥）。直列 $R$ の箱は1行め $(1,\\ R)$・2行め $(0,\\ 1)$、並列 $R\'$ の箱は1行め $(1,\\ 0)$・2行め $(\\frac{1}{R\'},\\ 1)$。かけると、左上だけが $1+\\frac{R}{R\'}$ になり、ほかの3つは $R$、$\\frac{1}{R\'}$、1 のまま。',
    caution: '出口側の箱を左に書かない。並列の箱は $\\frac{1}{R\'}$（$R\'$ ではない）。順番を入れかえると、こんどは右下が $1+\\frac{R}{R\'}$ になる。直列の箱どうしは、この形ではない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /直列/.test(q) && /並列/.test(q) && (q.match(/直列|並列/g) || []).length === 2 && /回路の行列/.test(q) && !/出口を開|AB\$/.test(q); },
    steps: {
      // 直列（入口側）→ 並列（出口側）
      s1(r) {
        const R = r.pick(RS), Rp = r.pick(RP); if (bad27(R, Rp)) return null;
        const L = [['S', R], ['P', Rp]], A = boxM(L);
        return { q: `${boxW(L[0])} の箱（入口側）のあとに、${boxW(L[1])} の箱（出口側）をつないだ回路の行列`, a: `$${mt(A)}$`, key: boxKey(L), easyCheck: false,
          easy: `左上 $1+\\frac{${R}}{${Rp}}=${nt(A[0][0])}$、右上 $${R}$、左下 $\\frac{1}{${Rp}}=${nt(A[1][0])}$、右下 1`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, boxN(L)) };
      },
      // 並列（入口側）→ 直列（出口側）
      s2(r) {
        const R = r.pick(RS), Rp = r.pick(RP); if (bad27(R, Rp)) return null;
        const L = [['P', Rp], ['S', R]], A = boxM(L);
        return { q: `${boxW(L[0])} の箱（入口側）のあとに、${boxW(L[1])} の箱（出口側）をつないだ回路の行列`, a: `$${mt(A)}$`, key: boxKey(L), easyCheck: false,
          easy: `並列が左：$${mt(PAR(Rp))}${mt(SER(R))}$。右下が $1+\\frac{${R}}{${Rp}}$`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, boxN(L)) };
      },
      // 図の回路
      s3(r) {
        const R = r.pick(RS), Rp = r.pick(RP); if (bad27(R, Rp)) return null;
        const L = r.chance(0.5) ? [['S', R], ['P', Rp]] : [['P', Rp], ['S', R]], A = boxM(L);
        return { q: '図の回路（左が入口、右が出口）の行列', a: `$${mt(A)}$`, key: boxKey(L), easyCheck: false, fig: boxFig(L),
          easy: `入口側の${L[0][0] === 'S' ? '直列' : '並列'}の箱を左に`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, boxN(L)) };
      },
      // わな：直列の箱だけを何個か（7-26）
      trap(r) {
        const R = r.pick([1, 2, 3, 4, 5]), n = r.int(2, 4), L = Array.from({ length: n }, () => ['S', R]), A = boxM(L);
        return dest({ q: `直列 ${OHM(R)} の箱を $${n}$ 個つないだ回路の行列`, a: `$${mt(A)}$`, key: `27t|${R}|${n}`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, boxN(L)) }, '7-27',
          `直列と並列の組ではない。$${mt(SER(R))}^{${n}}$ はずらしの形`, ['7-26']);
      },
    },
  });

  // ================================================================ 7-28
  const EX28 = [[[2, 2], [0.5, 1]], [[1.25, 1], [0.25, 1]]];
  function twoBox(r) {
    const R = r.pick([1, 2, 3, 4, 5]), Rp = r.pick([1, 2, 4, 5]);
    return r.chance(0.6) ? [['S', R], ['P', Rp]] : [['P', Rp], ['S', R]];
  }
  const VA = (v, i) => `${U(nt(v), 'V')}、${U(nt(i), 'A')}`;
  // s1・s2 の答え：左ページの例と同じ「左下×出口の電圧」（$0.5\times1$、$0.25\times4=1$）の組をよけ、同じ電流の答えを2回出さない（U-2・U-3・R1-27）。
  //   見開き1つぶんは同じ r。アプリで出しつくしたときは、40回つづけてよけたら重ねてよい（止まるように）
  function fresh28(r, A, V, i) {
    if ((F.eq(A[1][0], D(0.25)) && V === 4) || (F.eq(A[1][0], D(0.5)) && V === 1)) return false;
    const t = r.turns || (r.turns = {}), u = t.u28 || (t.u28 = new Set()), k = nt(i);
    if (u.has(k) && (t.m28 = (t.m28 || 0) + 1) < 40) return false;
    t.m28 = 0; u.add(k);
    return true;
  }
  M.add({
    id: '7-28', part: 2, chap: '7-3⑥ 例題7', stars: 1,
    title: '出口を開く（出口の電流0）なら、入口は「1列め×出口の電圧」',
    mark: '「出口を開いて、出口の電圧を□V にするには、入口の電圧と電流は」。出口に何もつながない。',
    futsu: ['入口の電圧・電流を $V_1$、$I_1$ とおき、', '回路の電流の分かれ方と、オームの法則で', '式を立てて解く'],
    raku: ['$\\begin{pmatrix}2&2\\\\0.5&1\\end{pmatrix}$、出口 $1\\,\\mathrm{V}$', '→ 1列め $(2,\\ 0.5)$：$2\\,\\mathrm{V}$、$0.5\\,\\mathrm{A}$', '$\\begin{pmatrix}1.25&1\\\\0.25&1\\end{pmatrix}$、出口 $4\\,\\mathrm{V}$', '→ $1.25\\times4=5$、$0.25\\times4=1$'],
    why: '箱の行列に出口の組 $(V_2,\\ I_2)$ を入れると、入口の組 $(V_1,\\ I_1)$ が出てくる（7-3⑥）。出口を開くと $I_2=0$ なので、入れるのは $(V_2,\\ 0)=V_2\\vec e_x$。だから出てくるのは「1列めの $V_2$ 倍」（7-2④）。',
    caution: '出口を開いたときに使うのは1列め（2列めではない）。入口の電圧から出口の電圧を求めるときは、左上でわる。出口を導線でつないだとき（$V_2=0$）は2列め。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '22mm', trap: '30mm' },
    fits(q) { return /出口を開/.test(q); },
    steps: {
      // 行列から
      s1(r) {
        const L = twoBox(r), A = boxM(L), V = r.pick([1, 2, 3, 4, 5, 6, 10]);
        if (EX28.some(E => sameM(E, A))) return null;
        const v = F.mul(A[0][0], D(V)), i = F.mul(A[1][0], D(V));
        if (!fresh28(r, A, V, i)) return null;
        return { q: `箱の行列が $${mt(A)}$ の回路で、出口を開いて（出口の電流 $0$）、出口の電圧を ${U(V, 'V')} にするときの、入口の電圧と電流`, a: VA(v, i), key: `28|${sig(A)}|${V}`, easyCheck: false,
          easy: `1列め $${pt([A[0][0], A[1][0]])}$ の $${V}$ 倍`, verify: p => { const n = nums(p.a), B = boxN(L); return (n.length === 2 && closeN(n[0], B[0][0] * V) && closeN(n[1], B[1][0] * V)) || 'ちがう'; } };
      },
      // 回路のことばから（行列は1列めだけ作る）
      s2(r) {
        const L = twoBox(r), A = boxM(L), V = r.pick([1, 2, 3, 4, 5, 6, 10]);
        if (EX28.some(E => sameM(E, A))) return null;
        const v = F.mul(A[0][0], D(V)), i = F.mul(A[1][0], D(V));
        if (!fresh28(r, A, V, i)) return null;
        return { q: `${boxW(L[0])} の箱（入口側）と${boxW(L[1])} の箱（出口側）をつないだ回路で、出口を開いて、出口の電圧を ${U(V, 'V')} にするときの、入口の電圧と電流`, a: VA(v, i), key: `28|${sig(A)}|${V}`, easyCheck: false,
          easy: `1列めは $${pt([A[0][0], A[1][0]])}$`, verify: p => { const n = nums(p.a), B = boxN(L); return (n.length === 2 && closeN(n[0], B[0][0] * V) && closeN(n[1], B[1][0] * V)) || 'ちがう'; } };
      },
      // 入口の電圧から、出口の電圧（左上でわる）
      s3(r) {
        const L = twoBox(r), A = boxM(L), V2 = r.pick([1, 2, 3, 4, 5, 6, 8, 10]), E = F.mul(A[0][0], D(V2));
        if (EX28.some(X => sameM(X, A)) || F.eq(A[0][0], F.make(1)) || !dec(E) || dec(E).length > 4) return null;
        return { q: `${boxW(L[0])} の箱（入口側）と${boxW(L[1])} の箱（出口側）をつないだ回路の入口に ${U(nt(E), 'V')} をかけ、出口を開いたときの出口の電圧`, a: U(V2, 'V'), key: `28|${sig(A)}|${V2}`, easyCheck: false,
          easy: `左上 $${nt(A[0][0])}$ で、$${nt(E)}\\div${nt(A[0][0])}$`, verify: p => { const n = nums(p.a), B = boxN(L); return (n.length === 1 && closeN(n[0], nv(E) / B[0][0])) || 'ちがう'; } };
      },
      // わな：出口を導線でつなぐ（2列め。7-16）
      trap(r) {
        const L = twoBox(r), A = boxM(L), I = r.pick([1, 2, 0.5]);
        if (EX28.some(E => sameM(E, A))) return null;
        const v = F.mul(A[0][1], D(I)), i = F.mul(A[1][1], D(I));
        return dest({ q: `箱の行列が $${mt(A)}$ の回路で、出口を導線でつないで（出口の電圧 $0$）、出口の電流を ${U(nt(I), 'A')} にするときの、入口の電圧と電流`, a: VA(v, i), key: `28t|${sig(A)}|${I}`,
          verify: p => { const n = nums(p.a), B = boxN(L); return (n.length === 2 && closeN(n[0], B[0][1] * I) && closeN(n[1], B[1][1] * I)) || 'ちがう'; } }, '7-28',
          `出口を開いたのではない。入れるのは $(0,\\ ${nt(I)})$ なので、2列めの $${nt(I)}$ 倍`, ['7-16']);
      },
    },
  });

  // ================================================================ 7-29
  const bad29 = L => L.length === 3 && L[0][0] === 'S' && +L[0][1] === 1 && L[1][0] === 'P' && +L[1][1] === 2 && L[2][0] === 'S' && +L[2][1] === 1;
  const detTxt = A => `$${nt(A[0][0])}\\times${nt(A[1][1])}-${nt(A[0][1])}\\times${nt(A[1][0])}=1$`;
  const POS = { 左上: [0, 0], 右上: [0, 1], 左下: [1, 0], 右下: [1, 1] };
  M.add({
    id: '7-29', part: 2, chap: '7-3 例題8・7-4⑦ 例題9', stars: 1,
    title: '3つの箱は左の2つを先にまとめ、答えは「左上×右下－右上×左下＝1」で確かめる',
    mark: '抵抗の箱を3つつなぐ（T の字・$\\pi$ の字の回路）。つないだ行列の数が1つわからない。',
    futsu: ['3つの行列を、左から順に2回かける。', '答えが合っているかは、もう一度', '同じ計算をして確かめる'],
    raku: ['直列 $1$・並列 $2$・直列 $1\\,\\mathrm{\\Omega}$', '左の2つ：$\\begin{pmatrix}1.5&1\\\\0.5&1\\end{pmatrix}$、3つめ：$\\begin{pmatrix}1.5&2.5\\\\0.5&1.5\\end{pmatrix}$', '確かめ：$1.5\\times1.5-2.5\\times0.5$', '$=2.25-1.25=1$'],
    why: '3つの箱は結合法則（7-3⑤）で、左の2つを先にまとめてよい。直列の箱も並列の箱も「左上×右下－右上×左下」が1で、つないだ行列でも1のまま（7-4 の行列式）。だから答えをこの式で確かめられ、4つの数のうち1つがわからなくても、この式から求められる。',
    caution: '入口側の箱から左に並べる。並列の箱は $\\frac{1}{R}$。「左上×右下－右上×左下＝1」になっていなければ、どこかでまちがえている。逆行列を聞かれたら、このわざではない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '16mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '11mm', trap: '11mm' },
    fits(q) {
      if (/逆行列/.test(q)) return false;
      if (/(左上|右上|左下|右下)の数$/.test(q.trim())) return true;
      const n = (q.match(/直列|並列/g) || []).length;
      return n >= 3 && /直列/.test(q) && /並列/.test(q) && /行列$/.test(q.trim());
    },
    steps: {
      // T の字：直列・並列・直列
      s1(r) {
        const L = [['S', r.pick([1, 2, 3, 4])], ['P', r.pick([1, 2, 4, 5, 10])], ['S', r.pick([1, 2, 3, 4, 5])]];
        if (bad29(L)) return null;
        const A = boxM(L), A2 = boxM(L.slice(0, 2));
        return { q: `${L.map(boxW).join('、')} の3つの箱を、この順に入口側からつないだ回路の行列`, a: `$${mt(A)}$`, key: boxKey(L), easyCheck: false,
          easy: `左の2つで $${mt(A2)}$。${detTxt(A)}`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, boxN(L)) };
      },
      // $\pi$ の字：並列・直列・並列
      s2(r) {
        const L = [['P', r.pick([1, 2, 4, 5, 10])], ['S', r.pick([1, 2, 3, 4, 5])], ['P', r.pick([1, 2, 4, 5, 10])]];
        const A = boxM(L), A2 = boxM(L.slice(0, 2));
        if (A.flat().some(x => !dec(x) || dec(x).length > 5)) return null;
        return { q: `${L.map(boxW).join('、')} の3つの箱を、この順に入口側からつないだ回路の行列`, a: `$${mt(A)}$`, key: boxKey(L), easyCheck: false,
          easy: `左の2つで $${mt(A2)}$。${detTxt(A)}`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, boxN(L)) };
      },
      // 見かけがちがう：4つの数のうち1つを「＝1」から
      s3(r) {
        const L = r.chance(0.5) ? [['S', r.pick([1, 2, 3])], ['P', r.pick([1, 2, 4, 5])], ['S', r.pick([1, 2, 3, 4])]] : [['P', r.pick([1, 2, 4, 5])], ['S', r.pick([1, 2, 3, 4])], ['P', r.pick([1, 2, 4, 5])]];
        if (bad29(L)) return null;
        const A = boxM(L); if (A.flat().some(x => !dec(x) || dec(x).length > 5)) return null;
        const miss = r.pick(Object.keys(POS)), [i, j] = POS[miss], given = Object.keys(POS).filter(k => k !== miss).map(k => `${k}が $${nt(A[POS[k][0]][POS[k][1]])}$`);
        return { q: `抵抗の箱を3つつないだ回路の行列で、${given.join('、')} のとき、${miss}の数`, a: `$${nt(A[i][j])}$`, key: boxKey(L), easyCheck: false,
          easy: '左上×右下－右上×左下＝1 から', verify: p => { const B = boxN(L), n = nums(p.a); return (n.length === 1 && closeN(n[0], B[i][j])) || 'ちがう'; } };
      },
      // わな：つないだ行列の逆行列（7-39）
      trap(r) {
        const L = r.chance(0.5) ? [['S', r.pick([1, 2, 3, 4])], ['P', r.pick([1, 2, 4])]] : [['S', r.pick([1, 2])], ['P', r.pick([1, 2, 4])], ['S', r.pick([1, 2, 3])]];
        const A = boxM(L), Ai = Mat.inv(A);
        return dest({ q: `箱の行列 $${mt(A)}$ の逆行列`, a: `$${mt(Ai)}$`, key: `29t|${sig(A)}`, calc: { kind: 'mat', want: Ai },
          verify: p => { const G = M.readMat(p.a); return (G && sameN(mulN(G.map(r2 => r2.map(c => c[0])), boxN(L)), [[1, 0], [0, 1]])) || 'かけても I にならない'; } }, '7-29',
          '逆行列を求める問い。左上×右下－右上×左下が1なので、左上と右下を入れかえ、ほかの2つの符号を変えるだけ', ['7-39']);
      },
    },
  });

  // ================================================================ 7-30
  // L（mH）・C（μF）・ω（rad/s）から、ωL と ωC と ω²LC（すべて短い小数になる組だけ）
  function lcw(r, o) {
    o = o || {};
    for (let k = 0; k < 60; k++) {
      const Lm = r.pick([1, 2, 5, 10, 20, 50, 100]), Cu = r.pick(['0.1', '0.2', '0.5', '1', '2', '5', '10']), w = r.pick([1000, 2000, 4000, 5000, 10000, 20000, 30000, 40000, 50000]);
      if (Lm === 10 && Cu === '1' && [20000, 30000, 1000, 5000].includes(w)) continue;   // 教科書の例（左ページの例も）
      const XL = F.make(w * Lm, 1000), BC = F.mul(F.make(w, 1000000), D(Cu)), x = F.mul(XL, BC);
      const ds = [dec(XL), dec(BC), dec(x)];
      if (ds.some(s => !s) || ds[0].replace(/^\d+\.?/, '').length > 1 || ds[1].replace(/^0\.?/, '').length > 4 || ds[2].replace(/^\d+\.?/, '').length > 2) continue;
      const xv = nv(x); if (xv < 0.04 || xv > 16 || xv === 1) continue;
      if (o.ratio && !dec(F.div(F.make(1), [Math.abs(F.sub(F.make(1), x)[0]), F.sub(F.make(1), x)[1]]))) continue;
      return { Lm, Cu, w, XL, BC, x };
    }
    return null;
  }
  const lcTxt = g => `$L=${g.Lm}\\,\\mathrm{mH}$、$C=${g.Cu}\\,\\mathrm{\\mu F}$、$\\omega=${g.w}\\,\\mathrm{rad/s}$`;
  const jt = f => `j${nt(f)}`;
  M.add({
    id: '7-30', part: 2, chap: '7-3⑥ 例題9', stars: 1,
    title: 'コイルの箱は $R\\to j\\omega L$、コンデンサーの箱は $\\frac1R\\to j\\omega C$。つなぐと左上は $1-\\omega^2LC$（$j^2=-1$）',
    mark: '交流の回路の箱で、コイルの $L$、コンデンサーの $C$ と角周波数 $\\omega$ がわかっている。',
    futsu: ['$\\begin{pmatrix}1&j\\omega L\\\\0&1\\end{pmatrix}\\begin{pmatrix}1&0\\\\j\\omega C&1\\end{pmatrix}$ を', '文字のまま行と列でかけ、', '最後に数を入れる'],
    raku: ['$L=10\\,\\mathrm{mH}$、$C=1\\,\\mathrm{\\mu F}$、$\\omega=20000\\,\\mathrm{rad/s}$', '$j\\omega L=j200$、$j\\omega C=j0.02$', '左上 $1+j200\\times j0.02=1-4=-3$', '→ $\\begin{pmatrix}-3&j200\\\\j0.02&1\\end{pmatrix}$'],
    why: '交流では、コイルは「電圧＝$j\\omega L$×電流」、コンデンサーは「電流＝$j\\omega C$×電圧」（6-10）。だから直列の抵抗の $R$ を $j\\omega L$ に、並列の $\\frac1R$ を $j\\omega C$ にかえれば、同じ形の箱になる（7-3⑥）。つなぐと左上は $1+j\\omega L\\times j\\omega C=1-\\omega^2LC$。出口を開くと $V_1=(1-\\omega^2LC)V_2$。',
    caution: '$L$ は H、$C$ は F になおしてから $\\omega$ をかける（$10\\,\\mathrm{mH}=0.01\\,\\mathrm{H}$、$1\\,\\mathrm{\\mu F}=0.000001\\,\\mathrm{F}$）。$j\\times j=-1$ を忘れない。電圧の大きさは、左上の数の大きさでわる（負の数でも、大きさは正）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '18mm', s3: '30mm', trap: '30mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /コイル|コンデンサー/.test(q) && !/0になる/.test(q); },
    steps: {
      // コイル（入口側）→ コンデンサー（出口側）
      s1(r) {
        const g = lcw(r); if (!g) return null;
        const a11 = F.sub(F.make(1), g.x);
        return { q: `コイルの箱（入口側）とコンデンサーの箱（出口側）をつないだ回路の行列（${lcTxt(g)}）`, a: `$\\begin{pmatrix}${nt(a11)}&${jt(g.XL)}\\\\${jt(g.BC)}&1\\end{pmatrix}$`,
          key: `30|${g.Lm},${g.Cu},${g.w}`, easyCheck: false, easy: `$j\\omega L=${jt(g.XL)}$、$j\\omega C=${jt(g.BC)}$、左上 $1-${nt(g.x)}$`,
          calc: { kind: 'mat', complex: true, want: [[nt(a11), jt(g.XL)], [jt(g.BC), '1']] }, verify: p => check30(p, g, false) };
      },
      // 出口を開いたときの電圧の大きさは何倍
      s2(r) {
        const g = lcw(r, { ratio: true }); if (!g) return null;
        const a11 = F.sub(F.make(1), g.x), ab = [Math.abs(a11[0]), a11[1]], ratio = F.div(F.make(1), ab);
        // 同じ答え（何倍）を2回出さない（U-3）。40回つづけてよけたら重ねてよい（止まるように）
        const t = r.turns || (r.turns = {}), u = t.u30 || (t.u30 = new Set());
        if (u.has(nt(ratio)) && (t.m30 = (t.m30 || 0) + 1) < 40) return null;
        t.m30 = 0; u.add(nt(ratio));
        return { q: `コイルの箱（入口側）とコンデンサーの箱（出口側）をつないだ回路（${lcTxt(g)}）で、出口を開いたとき、出口の電圧の大きさは入口の何倍`, a: `$${nt(ratio)}$ 倍`,
          key: `30|${g.Lm},${g.Cu},${g.w}`, easyCheck: false, easy: `左上 $1-${nt(g.x)}=${nt(a11)}$。$V_1=${nt(a11)}V_2$`,
          verify: p => { const t = (+g.w) ** 2 * (g.Lm / 1000) * (+g.Cu / 1e6), n = nums(p.a); return (n.length === 1 && Math.abs(n[0] - 1 / Math.abs(1 - t)) < 1e-9) || 'ちがう'; } };
      },
      // 順番を入れかえる：コンデンサー（入口側）→ コイル（出口側）
      s3(r) {
        const g = lcw(r); if (!g) return null;
        const a22 = F.sub(F.make(1), g.x);
        return { q: `コンデンサーの箱（入口側）とコイルの箱（出口側）をつないだ回路の行列（${lcTxt(g)}）`, a: `$\\begin{pmatrix}1&${jt(g.XL)}\\\\${jt(g.BC)}&${nt(a22)}\\end{pmatrix}$`,
          key: `30|${g.Lm},${g.Cu},${g.w}`, easyCheck: false, easy: `$\\begin{pmatrix}1&0\\\\${jt(g.BC)}&1\\end{pmatrix}\\begin{pmatrix}1&${jt(g.XL)}\\\\0&1\\end{pmatrix}$。右下が $1-${nt(g.x)}$`,
          calc: { kind: 'mat', complex: true, want: [['1', jt(g.XL)], [jt(g.BC), nt(a22)]] }, verify: p => check30(p, g, true) };
      },
      // わな：左上が0になる ω（共振。わざなし）
      trap(r) {
        const [Lm, Cu, w] = r.pick([[10, '1', 10000], [1, '10', 10000], [100, '0.1', 10000], [4, '2.5', 10000], [25, '0.4', 10000], [10, '4', 5000], [40, '1', 5000], [20, '2', 5000], [1, '2.5', 20000], [5, '0.5', 20000], [2.5, '1', 20000], [50, '0.2', 10000]]);
        return dest({ q: `コイル（$L=${Lm}\\,\\mathrm{mH}$）の箱とコンデンサー（$C=${Cu}\\,\\mathrm{\\mu F}$）の箱をつないだ回路の行列で、左上の数が0になる（出口の電圧がとても大きくなる）角周波数 $\\omega$`,
          a: `$\\omega=${w}\\,\\mathrm{rad/s}$`, key: `30t|${Lm},${Cu}`, verify: p => { const n = nums(p.a); return (n.length === 1 && Math.abs(n[0] * n[0] * Lm / 1000 * +Cu / 1e6 - 1) < 1e-9) || 'ちがう'; } }, '7-30',
          `$1-\\omega^2LC=0$ を $\\omega$ について解く問い。$\\omega=\\frac{1}{\\sqrt{LC}}$（教科書 6-13 の共振）`, []);   // 「6-13」だけだと問題集のわざ 6-13 と読める（U-6・R1-8）
      },
    },
  });
  // 7-30 の検算：答えの行列を複素数で読み、L・C・ω から直接計算した行列とくらべる
  function check30(p, g, rev) {
    const G = M.readMat(p.a); if (!G) return '読めない';
    const XL = g.w * g.Lm / 1000, BC = g.w * +g.Cu / 1e6, x = XL * BC;
    const W = rev ? [[[1, 0], [0, XL]], [[0, BC], [1 - x, 0]]] : [[[1 - x, 0], [0, XL]], [[0, BC], [1, 0]]];
    return G.every((row, i) => row.every((c, j) => Math.hypot(c[0] - W[i][j][0], c[1] - W[i][j][1]) < 1e-9 * Math.max(1, Math.hypot(...W[i][j])))) || '行列がちがう';
  }

  // ================================================================ 7-92
  const GAP = d => [[F.make(1), D(d)], [F.make(0), F.make(1)]];
  const LENS = f => [[F.make(1), F.make(0)], [F.div(F.make(-1), D(f)), F.make(1)]];
  const optM = list => list.reduce((acc, [t, v]) => Mat.mul(t === 'G' ? GAP(v) : LENS(v), acc), Mat.eye(2));   // 先に通るものが右
  const optN = list => list.reduce((acc, [t, v]) => mulN(t === 'G' ? [[1, +v], [0, 1]] : [[1, 0], [-1 / +v, 1]], acc), [[1, 0], [0, 1]]);
  const optW = ([t, v]) => (t === 'G' ? `長さ $${v}\\,\\mathrm{m}$ のすき間` : `焦点距離 $${v}\\,\\mathrm{m}$ のレンズ`);
  const DS = ['0.02', '0.05', '0.1', '0.2', '0.3', '0.4'], FS = ['0.05', '0.1', '0.2', '0.25', '0.5'];
  const bad92 = (d, f) => d === '0.1' && f === '0.05';
  // 見開きに出た「すき間 d のあとレンズ f」の組（同じ行列を2回使わない。U-2・R1-18）。見開き1つぶんは同じ r
  const used92 = r => { const t = r.turns || (r.turns = {}); return t.u92 || (t.u92 = new Set()); };
  M.add({
    id: '7-92', part: 2, chap: '7-3（物理・工学）・章末問題', stars: 1,
    title: 'レンズの光線の行列は、先に通るものを右に（電気の箱と向きが反対）',
    mark: '光線の高さ $y$ とかたむき $\\theta$、すき間 $\\begin{pmatrix}1&d\\\\0&1\\end{pmatrix}$、レンズ $\\begin{pmatrix}1&0\\\\-\\frac1f&1\\end{pmatrix}$。',
    futsu: ['すき間のあとの高さ $y+d\\theta$ を求め、', 'その高さでレンズの曲がり $-\\frac{y}{f}$ を', '計算して、1つずつ光を追う'],
    raku: ['すき間 $d=0.1$ のあと、レンズ $f=0.05$', '先にすき間（右）、あとでレンズ（左）', '$\\begin{pmatrix}1&0\\\\-20&1\\end{pmatrix}\\begin{pmatrix}1&0.1\\\\0&1\\end{pmatrix}=\\begin{pmatrix}1&0.1\\\\-20&-1\\end{pmatrix}$'],
    why: '光線の行列は「入る光 $(y,\\ \\theta)$ を入れると、出る光が出てくる」向き。光が先に通る部品の行列が、先に（右で）かかる（7-3①の「右が先」）。電気の箱は「出口の組を入れると入口の組が出てくる」向きなので、並べ方が反対になる。',
    caution: 'レンズの左下は $-\\frac1f$（負）。電気の箱のように「入口側を左」にしない。かたむきの単位は rad、高さは m。出た光から入った光をさがす問いは、このわざではない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '26mm', s3: '26mm', trap: '26mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /レンズ|すき間/.test(q) && !/入った光/.test(q); },
    steps: {
      // すき間のあとレンズ
      s1(r) {
        const d = r.pick(DS), f = r.pick(FS); if (bad92(d, f) || used92(r).has(`${d},${f}`)) return null;
        used92(r).add(`${d},${f}`);
        const L = [['G', d], ['L', f]], A = optM(L);
        return { q: `光線が、${optW(L[0])}を進んでから、${optW(L[1])}を通る。2つをつないだ行列`, a: `$${mt(A)}$`, key: `92|${L}`, easyCheck: false,
          easy: `$${mt(LENS(f))}${mt(GAP(d))}$（先のすき間が右）`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, optN(L)) };
      },
      // レンズのあとすき間、光線を追う
      s2(r) {
        const d = r.pick(DS), f = r.pick(FS); if (bad92(d, f)) return null;
        if (turn(r, '92s2', 2) === 0) {
          const L = [['L', f], ['G', d]], A = optM(L);
          return { q: `光線が、${optW(L[0])}を通ってから、${optW(L[1])}を進む。2つをつないだ行列`, a: `$${mt(A)}$`, key: `92|${L}`, easyCheck: false,
            easy: `$${mt(GAP(d))}${mt(LENS(f))}$（先のレンズが右）`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, optN(L)) };
        }
        const L = [['G', d], ['L', f]], A = optM(L), y = r.pick(['0.01', '0.02', '0.005', '0']), th = r.pick(['0.1', '0', '-0.1', '0.05', '0.2']);
        if ((y === '0' && th === '0') || used92(r).has(`${d},${f}`)) return null;   // s1 と同じ行列を使わない（U-2・R1-18）
        used92(r).add(`${d},${f}`);
        const out = mulv(A, [y, th]);
        return { q: `高さ $${y}\\,\\mathrm{m}$、かたむき $${th}\\,\\mathrm{rad}$ の光線が、${optW(L[0])}を進んでから、${optW(L[1])}を通った。出た光の（高さ、かたむき）`, a: `$${pt(out)}$`, key: `92|${L}|${y},${th}`, easyCheck: false,
          easy: `$${mt(A)}${cv([y, th])}$`, verify: p => ptIs(p, mulNv(optN(L), [+y, +th])) };
      },
      // 3つの部品：すき間・レンズ・すき間、レンズ・すき間・レンズ
      s3(r) {
        let L;
        if (turn(r, '92s3', 2) === 0) L = [['G', r.pick(DS)], ['L', r.pick(FS)], ['G', r.pick(DS)]];
        else L = [['L', r.pick(FS)], ['G', r.pick(['0.02', '0.05', '0.1'])], ['L', r.pick(FS)]];
        const A = optM(L);
        if (A.flat().some(x => !dec(x) || dec(x).length > 6)) return null;
        return { q: `光線が、${L.map(optW).join('、')}の順に通る。3つをつないだ行列`, a: `$${mt(A)}$`, key: `92|${L}`, easyCheck: false,
          easy: `$${L.slice().reverse().map(([t, v]) => mt(t === 'G' ? GAP(v) : LENS(v))).join('')}$（最後に通るものが左）`, calc: { kind: 'mat', want: A }, verify: p => matIs(p, optN(L)) };
      },
      // わな：出た光から入った光（7-39）
      trap(r) {
        const d = r.pick(DS), f = r.pick(FS); if (bad92(d, f)) return null;
        const L = [['G', d], ['L', f]], A = optM(L), x = [r.pick(['0.01', '0.02', '0']), r.pick(['0.1', '0', '-0.1', '0.2'])];
        if ((x[0] === '0' && x[1] === '0') || used92(r).has(`${d},${f}`)) return null;
        used92(r).add(`${d},${f}`);
        const out = mulv(A, x);
        return dest({ q: `${optW(L[0])}を進んでから、${optW(L[1])}を通って出た光の（高さ、かたむき）が $${pt(out)}$ のとき、入った光の（高さ、かたむき）`, a: `$${pt(x)}$`, key: `92t|${L}|${x}`,
          verify: p => ptIs(p, x.map(Number)) && (sameN(mulNv(optN(L), readPts(p.a)[0]), out.map(nv)) || 'もどらない') }, '7-92',
          '出たものから入ったものをさがす問い。つないだ行列の逆行列をかける（左上×右下－右上×左下＝1 なので、入れかえと符号だけ）', ['7-39']);
      },
    },
  });
  // ---------------------------------------------------------------- 左ページの例の行列を、同じ見開きの問題に出さない（O-2）
  // 目印・ふつうに解くと・楽な形にすると に書いた行列（2×2 以上）が問題の文に入ったら、その問題は作り直す
  {
    const matsIn = s => [...String(s).matchAll(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g)].map(m => m[1].replace(/\s/g, '')).filter(t => t.includes('&') && t.includes('\\\\'));
    // 第41回（U-2・R1-34）：転置・行の入れかえ・列の入れかえ・ななめの入れかえ（diag(2, 3) → diag(3, 2)）もよける（単位行列はのぞく）。
    //   また、ステップ1・2の問題に出た行列（ななめだけの行列と、成分が 0・±1 だけの行列はのぞく）を、同じ見開きのステップ3では使わない
    const cells = t => t.split('\\\\').map(row => row.split('&'));
    const join = A => A.map(row => row.join('&')).join('\\\\');
    const varsOf = t => { const A = cells(t); return [A, A[0].map((_, j) => A.map(row => row[j])), A.slice().reverse(), A.map(row => row.slice().reverse()), A.slice().reverse().map(row => row.slice().reverse())].map(join); };
    const diagT = t => cells(t).every((row, i) => row.every((c, j) => i === j || ev(c) === 0));
    const isI = t => diagT(t) && cells(t).every((row, i) => ev(row[i]) === 1);
    const plainT = t => diagT(t) || cells(t).every(row => row.every(c => [0, 1, -1].includes(ev(c))));
    for (const id of M.list(7).filter(i => M.waza[i].part === 2)) {
      // 成分が 0・±1 だけの例（裏返し・回転など、名前のある形）は、その行列だけ（入れかえると別の名前の形になるので）
      const d = M.waza[id], left = new Set([d.mark, ...d.futsu, ...d.raku].flatMap(matsIn).flatMap(t => (cells(t).every(row => row.every(c => [0, 1, -1].includes(ev(c)))) ? [t] : varsOf(t))).filter(t => !isI(t)));
      for (const st of M.STEPS) {
        const f = d.steps[st]; if (!f) continue;
        d.steps[st] = r => {
          const p = f(r); if (!p) return p;
          const ms = matsIn(p.q);
          if (ms.some(m => left.has(m))) return null;
          const t = r.turns || (r.turns = {}), u = t['m12|' + id] || (t['m12|' + id] = new Set()), big = ms.filter(m => !plainT(m));
          if (st === 's3' && big.some(m => u.has(m))) return null;
          if (st === 's1' || st === 's2') big.forEach(m => u.add(m));
          return p;
        };
      }
    }
  }
})(globalThis.MONDAI);
