/* 問題集 第7巻　第3部 行列式と逆行列（わざ 7-31〜7-46、7-93〜7-95）　組 c
 * 書き方は v7/README.md → v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第7巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 7-4・7-5 の数・ことば・記号にそろえる（$\det A$、$A^{-1}$、$A^{\mathsf T}$、$I$、主役の行列 $\begin{pmatrix}2&1\\1&2\end{pmatrix}$、たすきにかけてひく、
 *   裏返し、平らにつぶれる、サラスの方法、掃き出し法、①②③（表の行）、正規方程式、特異姿勢）。
 * 行列は M.Mat（成分は M.F の分数）で作り、問題と答えを同じ行列から書く。逆行列の答えは $\frac{1}{L}\begin{pmatrix}\cdots\end{pmatrix}$（M.Mat.tex の factor。Q-2）。
 * 検算：行列・ベクトルの答えは calc（kind 'mat'）。数の答え・答えの組・ことばの答えは verify(p) で、問題を作った計算とは別の道すじ
 *   （行列式は小数の掃き出しで、連立方程式は答えを代入して、逆行列はかけて I になるかで、最小二乗はずれの2乗の和が小さくなるかで）確かめる。
 * 図は 7-32・7-33 のステップ3だけ（方眼・平行四辺形・家。K-2）。表（p.table）は 7-46・7-94 のステップ3だけ（見わけようは表を出さないので、ステップ1・2 は文だけ）。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2。BAN）。key は、ステップがちがっても同じ行列なら同じになる形にする。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。
 * 角は 0°・30°・45°・60°・90° と、それを 180° から足し引きした角だけ（Q-5）。近似値は使わない（答えは √ を残した形）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F, Mat = M.Mat;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                         // 0.30000000004 → 0.3
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const gcd = (a, b) => F.gcd(a, b);
  // 分数 f の、正確な小数（分母が 2 と 5 だけのとき）。そうでなければ null
  function dec(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1;
    while (k < 8 && (Math.abs(n) * p) % d !== 0) { k++; p *= 10; }
    if ((Math.abs(n) * p) % d !== 0) return null;
    const N = String(Math.abs(n) * p / d).padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  const fx = f => (f[1] === 1 ? String(f[0]) : dec(f) || F.tex(f));   // 分数 → 整数・小数・\frac
  const fq = f => F.tex(f);                                            // 分数 → 整数か \frac
  // 行列の成分の TeX：数ならそのまま、分数（[n, d]）は小数か \frac（o.frac なら \frac）、文字はそのまま
  const cell = (x, o) => (typeof x === 'number' ? String(x) : Array.isArray(x) ? (o && o.frac ? fq(x) : fx(x)) : String(x));
  const pm = (A, o) => `\\begin{pmatrix}${A.map(r => r.map(x => cell(x, o)).join('&')).join('\\\\')}\\end{pmatrix}`;
  const vec = (v, o) => pm(v.map(x => [x]), o);                          // たてのベクトル
  const DET = (A, o) => `\\det${pm(A, o)}`;
  const par = v => (String(v).startsWith('-') ? `(${v})` : String(v));  // マイナスはかっこごと
  const pk = x => (typeof x === 'string' && /[+-]/.test(x) ? `(${x})` : par(cell(x)));   // k+3 もかっこに
  const det2 = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const keyM = A => A.map(r => r.map(x => (Array.isArray(x) ? x.join('/') : x)).join(',')).join(';');
  // 2×2 の行列の「入れかえ・転置」をまとめた形（ななめの組と、もう一方のななめの組）。例の行列の入れかえ・転置をよけるのに使う（U-2・第41回）
  const canon2 = A => [[A[0][0], A[1][1]], [A[0][1], A[1][0]]].map(p => p.map(String).sort().join(',')).sort().join('|');
  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない（U-3・第41回）。アプリで同じわざを多く出すとき（そのわざで ok が20問をこえたら）は、よけない
  //   key（問題の key）を渡すと、同じ問題（makeStep が同じ key でよける問題）は数えない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  // わざの登録：1つのステップに同じ答えを3つ出さない（U-3・第41回）。ことばだけの答え（「ない」「無数にある」など）は除く
  function add(def) {
    for (const k of ['s1', 's2', 's3']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => { const p = f(r); if (!p || !/^\$/.test(String(p.a))) return p; return ansOK(r, def.id + k, String(p.a), 2, p.key || p.q) ? p : null; };
    }
    M.add(def);
  }
  const sgn = (v, first) => (v < 0 ? `-${-v}` : (first ? `${v}` : `+${v}`));
  // ax+by の項（係数1は書かない。0の項は書かない）。vars は文字の名前の配列
  function lin(cs, vars) {
    let o = '';
    cs.forEach((c, i) => {
      if (c === 0) return;
      const a = Math.abs(c), body = (a === 1 ? '' : fmt(a)) + vars[i];
      o += (o ? (c < 0 ? '-' : '+') : (c < 0 ? '-' : '')) + body;
    });
    return o || '0';
  }
  const eqs = (A, b, vars) => A.map((r, i) => `$${lin(r, vars)}=${fmt(b[i])}$`).join('、');
  // 小数の掃き出し（部分ピボット）で行列式（検算用：M.Mat.det の余因子展開とは別の道すじ）
  function detNum(A) {
    const n = A.length, W = A.map(r => r.map(x => (Array.isArray(x) ? x[0] / x[1] : +x)));
    let d = 1;
    for (let c = 0; c < n; c++) {
      let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(W[i][c]) > Math.abs(W[p][c])) p = i;
      if (Math.abs(W[p][c]) < 1e-12) return 0;
      if (p !== c) { [W[p], W[c]] = [W[c], W[p]]; d = -d; }
      d *= W[c][c];
      for (let i = c + 1; i < n; i++) { const f = W[i][c] / W[c][c]; for (let j = c; j < n; j++) W[i][j] -= f * W[c][j]; }
    }
    return d;
  }
  // 小数の掃き出しで A x = b を解く（検算用）。答えがひとつに決まらなければ null
  function solveNum(A, b) {
    const n = A.length, W = A.map((r, i) => r.map(x => (Array.isArray(x) ? x[0] / x[1] : +x)).concat([Array.isArray(b[i]) ? b[i][0] / b[i][1] : +b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(W[i][c]) > Math.abs(W[p][c])) p = i;
      if (Math.abs(W[p][c]) < 1e-12) return null;
      [W[p], W[c]] = [W[c], W[p]];
      for (let i = 0; i < n; i++) if (i !== c) { const f = W[i][c] / W[c][c]; for (let j = c; j <= n; j++) W[i][j] -= f * W[c][j]; }
    }
    return W.map((r, i) => r[n] / r[i]);
  }
  const mulNum = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
  const numM = A => A.map(r => r.map(x => (Array.isArray(x) ? x[0] / x[1] : +x)));

  // ---------------------------------------------------------------- 検算の部品
  // 答えの文から数を取り出す（単位 \,\mathrm{…} は除く。「x=」の左は除く）
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol)) || `答え ${p.a} が ${fmt(v)} でない`; };
  // 「$x=1$、$y=2$」→ { x: 1, y: 2 }
  function assigns(a) { const o = {}; for (const m of String(a).matchAll(/\$([^$=]+)=([^$]+)\$/g)) o[m[1].trim()] = ev(m[2]); return o; }
  // 答えの組が、連立方程式 A x = b をみたすか（代入して確かめる）
  function solves(p, A, b, vars) {
    const o = assigns(p.a);
    if (vars.some(v => o[v] == null)) return `答え ${p.a} が読めない`;
    for (let i = 0; i < A.length; i++) {
      const s = A[i].reduce((t, c, j) => t + (Array.isArray(c) ? c[0] / c[1] : c) * o[vars[j]], 0);
      if (!near(s, Array.isArray(b[i]) ? b[i][0] / b[i][1] : b[i], 1e-9)) return `答え ${p.a} を ${i + 1} つめの式に入れると ${fmt(s)}（右辺 ${b[i]}）`;
    }
    return true;
  }

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  // 文の中の行列：[{ env, rows, cols, body, at }]
  function mats(q) {
    const out = [], re = /\\begin\{(pmatrix|array)\}(?:\{[^}]*\})?([\s\S]*?)\\end\{\1\}/g; let m;
    while ((m = re.exec(q))) { const rows = m[2].split('\\\\').filter(s => s.trim()); out.push({ env: m[1], rows: rows.length, cols: rows[0] ? rows[0].split('&').length : 0, body: m[2], at: m.index }); }
    return out;
  }
  const numBody = b => !/[a-zA-Z]/.test(b.replace(/\\frac|\\sqrt|\\pi/g, ''));   // 成分に文字がない
  // 文の中の連立1次方程式（「$2x+3y=420$」の形、文字は x・y・z・I_1・I_2・I_3・s・t）を読む：{ A, b, vars }。読めなければ null
  function parseSys(q) {
    const out = [], VAR = /^(x|y|z|s|t|I_\{?[123]\}?)$/;
    for (const m of String(q).matchAll(/\$([^$=]+)=([^$=]+)\$/g)) {
      const lhs = m[1].replace(/\s/g, ''), rhs = ev(m[2]);
      if (rhs == null || !/^[-+]?[0-9.]*(x|y|z|s|t|I_\{?[123]\}?)([-+][0-9.]*(x|y|z|s|t|I_\{?[123]\}?))*$/.test(lhs)) continue;
      const row = {};
      for (const t of lhs.match(/[-+]?[0-9.]*(?:x|y|z|s|t|I_\{?[123]\}?)/g)) {
        const mm = /^([-+]?)([0-9.]*)(.*)$/.exec(t), v = mm[3].replace(/[{}]/g, '');
        if (!VAR.test(mm[3])) return null;
        row[v] = (row[v] || 0) + (mm[1] === '-' ? -1 : 1) * (mm[2] ? +mm[2] : 1);
      }
      out.push([row, rhs]);
    }
    if (out.length < 2) return null;
    const vars = [...new Set(out.flatMap(([row]) => Object.keys(row)))].sort();
    if (vars.length !== out.length) return null;
    return { A: out.map(([row]) => vars.map(v => row[v] || 0)), b: out.map(e => e[1]), vars };
  }
  // 「$\begin{pmatrix}…\end{pmatrix}\vec x=\begin{pmatrix}…\end{pmatrix}$」の形も読む
  function parseSysM(q) {
    const s = parseSys(q); if (s) return s;
    const m = /\\begin\{pmatrix\}([^$]*?)\\end\{pmatrix\}\s*(?:\\vec x|\\begin\{pmatrix\}[^$]*?\\end\{pmatrix\})\s*=\s*\\begin\{pmatrix\}([^$]*?)\\end\{pmatrix\}/.exec(q);
    if (!m) return null;
    const A = m[1].split('\\\\').map(r => r.split('&').map(c => ev(c))), b = m[2].split('\\\\').map(c => ev(c));
    if (A.flat().some(v => v == null) || b.some(v => v == null) || A.length !== b.length || A.some(r => r.length !== A.length)) return null;
    return { A, b, vars: A.length === 2 ? ['x', 'y'] : ['x', 'y', 'z'] };
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(7).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 3 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 行列式の楽な形
  // 「$5\times4-2\times3=20-6=14$」。0の組は書かない（「$3\times2=6$」）
  function detEasy(A) {
    const [[a, b], [c, d]] = A.map(r => r.map(x => (Array.isArray(x) ? fx(x) : String(x))));
    const v = A.map(r => r.map(x => (Array.isArray(x) ? x[0] / x[1] : x)));
    const p1 = v[0][0] * v[1][1], p2 = v[0][1] * v[1][0], D = p1 - p2;
    if (p2 === 0) return `$${par(a)}\\times ${par(d)}=${fmt(D)}$（右上×左下は0）`;
    if (p1 === 0) return `$-${par(b)}\\times ${par(c)}=${fmt(D)}$（左上×右下は0）`;
    return `$${par(a)}\\times ${par(d)}-${par(b)}\\times ${par(c)}=${fmt(p1)}${p2 < 0 ? '+' + fmt(-p2) : '-' + fmt(p2)}=${fmt(D)}$`;
  }
  // 1けたの整数の2×2（lo〜hi、0はおよそ zero の割合）
  function rand2(r, lo, hi, zero) {
    return [[0, 0], [0, 0]].map(row => row.map(() => (r.chance(zero || 0) ? 0 : r.intNot(lo, hi, v => v === 0))));
  }
  // 3×3 の行列式の楽な形（サラスの方法：0をふくむななめは書かない）
  function sarrus(A) {
    const t = [[0, 1, 2], [1, 2, 0], [2, 0, 1]].map(([i, j, k]) => [A[0][i], A[1][j], A[2][k]]);    // 右下へのななめ（たす）
    const u = [[2, 1, 0], [0, 2, 1], [1, 0, 2]].map(([i, j, k]) => [A[0][i], A[1][j], A[2][k]]);    // 左下へのななめ（ひく）
    const pr = xs => xs.reduce((s, x) => s * x, 1);
    const show = xs => xs.filter(x => pr(x) !== 0).map(x => x.map(par).join('\\times'));
    const sp = t.map(pr).reduce((s, x) => s + x, 0), sm = u.map(pr).reduce((s, x) => s + x, 0);
    const T = show(t), U = show(u), wrap = xs => (xs.length > 1 ? `(${xs.join('+')})` : xs[0]);
    const tex = !U.length ? `$${T.length ? T.join('+') : '0'}=${sp}$` : !T.length ? `$-(${U.join('+')})=${-sm}$`
      : `$${wrap(T)}-${wrap(U)}=${sp}${sm < 0 ? '+' + -sm : '-' + sm}=${sp - sm}$`;
    return { plus: sp, minus: sm, det: sp - sm, tex, zeros: 6 - T.length - U.length };
  }

  // ================================================================ 7-31
  const BAN31 = new Set(['5,2;3,4', '3,0;7,2', '2,1;1,2']);
  add({
    id: '7-31', part: 3, chap: '7-4②', stars: 1,
    title: '2×2 の行列式は「左上×右下－右上×左下」（ななめにかけてひく）。0があればかけ算は1つ',
    mark: '$\\det$ と2×2 の行列。「行列式を求めよう」。',
    futsu: ['1列めと2列めの矢印の平行四辺形を', '方眼にかき、かこむ長方形から', 'まわりの6つの面積をひいて、', '回る向きで符号をつける。'],
    raku: ['$\\det\\begin{pmatrix}5&2\\\\3&4\\end{pmatrix}=5\\times4-2\\times3$', '$=20-6=14$', '$\\det\\begin{pmatrix}3&0\\\\7&2\\end{pmatrix}=3\\times2=6$', '（0のある組はかけない）'],
    why: '1マスの正方形は、1列め $(a,\\ c)$ と2列め $(b,\\ d)$ の平行四辺形になる。かこむ長方形 $(a+b)(c+d)$ からまわりの6つ $ac+bd+2bc$ をひくと、$ad-bc$ が残る（7-4②）。これは外積の $z$ 成分 $a_xb_y-a_yb_x$ と同じ式で、マイナスは向き（裏返し）を表す（7-4③）。',
    caution: 'たてにかけた $ac-bd$ ではない（主役の行列で $2-2=0$ になり、面積3と合わない）。マイナスの成分はかっこをつけて $(-1)\\times(-4)$。ひく数がマイナスなら、たし算になる。答えはマイナスにもなる。',
    counts: { s1: 8, s2: 6, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '14mm', s3: '22mm', trap: '14mm' },
    fits(q) {
      if (/係数の行列の行列式/.test(q)) return true;
      if (/のとき|入れかえ|\\det\s*\(|\\det\s*\\left|k|面積|つぶれ/.test(q)) return false;
      const i = q.indexOf('\\det\\begin{pmatrix}'); if (i < 0) return false;
      const m = mats(q.slice(i))[0];
      return !!m && m.rows === 2 && m.cols === 2 && numBody(m.body);
    },
    steps: {
      // 1けたの正の数（0が1つあることも）
      s1(r) {
        const A = rand2(r, 1, 9, 0.12);
        if (A.flat().filter(x => x === 0).length > 1 || BAN31.has(keyM(A))) return null;
        const D = det2(A);
        return { q: `$${DET(A)}$`, a: `$${D}$`, easy: detEasy(A), key: keyM(A), verify: p => valIs(p, detNum(A)) };
      },
      // マイナスの成分
      s2(r) {
        const A = rand2(r, -9, 9, 0.1);
        if (A.flat().every(x => x >= 0) || A.flat().filter(x => x === 0).length > 1 || BAN31.has(keyM(A))) return null;
        const D = det2(A);
        return { q: `$${DET(A)}$`, a: `$${D}$`, easy: detEasy(A), key: keyM(A), verify: p => valIs(p, detNum(A)) };
      },
      // 小数・分数の成分、連立方程式の係数の行列、文字 k をふくむ行列
      s3(r) {
        const k = turn(r, '31s3', 3);
        if (k === 0) {
          const pick = () => r.pick([fr(1, 2), fr(3, 2), fr(5, 2), fr(1, 4), fr(-1, 2), fr(2), fr(3), fr(4), fr(-2), fr(6)]);
          const A = [[pick(), pick()], [pick(), pick()]];
          if (A.flat().filter(x => x[1] > 1).length < 2) return null;
          const D = F.sub(F.mul(A[0][0], A[1][1]), F.mul(A[0][1], A[1][0]));
          return { q: `$${DET(A)}$`, a: `$${fx(D)}$`, easy: detEasy(A), key: keyM(A), verify: p => valIs(p, detNum(A)) };
        }
        if (k === 1) {
          // 連立方程式。2つめの式は「$y=mx+c$」の形（左辺に文字をそろえると $-mx+y=c$。7-08）
          const a1 = r.intNot(-6, 6, v => v === 0), b1 = r.intNot(-6, 6, v => v === 0), m = r.intNot(-5, 5, v => v === 0), c = r.int(-9, 9), b0 = r.int(-9, 15);
          const A = [[a1, b1], [-m, 1]], D = det2(A);
          if (D === 0 || BAN31.has(keyM(A))) return null;
          const e2 = `$y=${lin([m], ['x'])}${c ? sgn(c) : ''}$`;
          return { q: `連立方程式 $${lin(A[0], ['x', 'y'])}=${b0}$、${e2} を $A\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\vec b$ の形に書いたときの、係数の行列の行列式 $\\det A$`, a: `$${D}$`,
            easy: `2つめの式は $${lin(A[1], ['x', 'y'])}=${c}$ なので $A=${pm(A)}$。${detEasy(A)}`, easyCheck: false, key: keyM(A),
            verify: p => valIs(p, detNum(A)) };
        }
        // 文字 k：k が1つか2つ
        const two = r.chance(0.5), a = r.intNot(-5, 5, v => v === 0), b = r.intNot(-5, 5, v => v === 0), c = r.intNot(-5, 5, v => v === 0);
        const A = two ? [['k', a], [b, `k${sgn(c)}`]] : r.pick([[['k', a], [b, c]], [[a, 'k'], [b, c]], [[a, b], ['k', c]], [[a, b], [c, 'k']]]);
        const f = kk => { const v = A.map(row => row.map(x => (typeof x === 'number' ? x : ev(x, { k: kk })))); return v[0][0] * v[1][1] - v[0][1] * v[1][0]; };
        // k の式（2次まで）：k=0,1,2 の値から係数を出す
        const y0 = f(0), y1 = f(1), y2 = f(2), A2 = (y2 - 2 * y1 + y0) / 2, B1 = y1 - y0 - A2, C0 = y0;
        const ans = M.P.tex(M.P.make(C0, B1, A2), 'k');
        if (B1 === 0 && A2 === 0) return null;
        return { q: `$${DET(A)}$ を $k$ の式で`, a: `$${ans}$`, easyCheck: false, key: 'k' + keyM(A),
          easy: `たすきにかけてひく：$${pk(A[0][0])}\\times ${pk(A[1][1])}-${pk(A[0][1])}\\times ${pk(A[1][0])}$`,
          verify: p => { const t = strip(p.a); for (const kk of [-2.3, 0.7, 3.1]) if (!near(ev(t, { k: kk }), f(kk), 1e-9)) return `k=${kk} で値がちがう`; return true; } };
      },
      // わな：3×3 の行列式（たすきにかけてひく、だけでは出ない。7-36）
      trap(r) {
        const t = turn(r, '31t', 2);
        let A;
        if (t === 0) { A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(0, 3))); if (A.flat().filter(x => x === 0).length < 2) return null; }
        else { A = [[r.int(1, 4), r.int(-3, 5), r.int(-3, 5)], [0, r.int(1, 4), r.int(-3, 5)], [0, 0, r.int(1, 5)]]; }
        const D = sarrus(A).det;
        if (D === 0) return null;
        return dest({ q: `$${DET(A)}$`, a: `$${D}$`, key: 't31' + keyM(A), verify: p => valIs(p, detNum(A)) }, '7-31',
          `3×3 の行列式は、たすきの2本では出ない。${t ? 'ななめより下が全部0なので、対角の積 $' + A[0][0] + '\\times' + A[1][1] + '\\times' + A[2][2] + '=' + D + '$' : 'サラスの方法で ' + sarrus(A).tex}`, ['7-36']);
      },
    },
  });

  // ================================================================ 7-32
  // 方眼の平行四辺形の図：O、u、u+v、v（P だけずらすことも）。方眼・かこむ長方形（点線）・2本の矢印・頂点の座標
  function figPara(u, v, P) {
    P = P || [0, 0];
    const V = [P, [P[0] + u[0], P[1] + u[1]], [P[0] + u[0] + v[0], P[1] + u[1] + v[1]], [P[0] + v[0], P[1] + v[1]]];
    const xs = V.map(p => p[0]).concat(0), ys = V.map(p => p[1]).concat(0);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const bx0 = Math.min(...V.map(p => p[0])), bx1 = Math.max(...V.map(p => p[0])), by0 = Math.min(...V.map(p => p[1])), by1 = Math.max(...V.map(p => p[1]));
    const items = [['grid', x0, y0, x1, y1], ['axes', x0, x1 + 0.8, y0, y1 + 0.8, { o: 'sw' }],
      ['poly', [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], { dash: true }],
      ['poly', V, { fill: true, thick: true }],
      ['seg', V[0], V[1], { arrow: true, thick: true }], ['seg', V[0], V[3], { arrow: true, thick: true }]];
    const c = [(V[0][0] + V[2][0]) / 2, (V[0][1] + V[2][1]) / 2];
    const o = !P[0] && !P[1];
    V.forEach((p, i) => {
      if (o) return;   // 原点からの平行四辺形は、行列が文にあるので座標を書かない
      const a = Math.atan2(p[1] - c[1], p[0] - c[0]) * 180 / Math.PI, k = Math.round(((a + 360) % 360) / 45) % 8;
      items.push(['dot', p], ['label', p, `(${p[0]}, ${p[1]})`, ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'][k]]);
    });
    return { s: Math.min(4.5, 44 / Math.max(x1 - x0 + 3, y1 - y0 + 2)), items };
  }
  const BAN32 = new Set(['3,1;1,2', '2,1;1,4']);
  const bad32 = A => BAN32.has(keyM(A)) || canon2(A) === canon2([[3, 1], [1, 2]]);   // 例の行列のななめを入れかえたもの・転置もよける（R1-14）
  add({
    id: '7-32', part: 3, chap: '7-4①② 例題1', stars: 1,
    title: '方眼で数えるかわりに $ad-bc$：1マスの正方形の行き先（平行四辺形）の面積は、行列式の大きさ',
    mark: '「1マスの正方形は平行四辺形になる」「方眼の平行四辺形の面積」。',
    futsu: ['平行四辺形を、方眼の線にそった', '長方形でかこみ、まわりの', '三角形4つと長方形2つの面積を', '1つずつ出して、長方形からひく。'],
    raku: ['$\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix}$ の平行四辺形', '長方形 $4\\times3=12$ から', '$3+2+2$ をひかずに', '$3\\times2-1\\times1=5$'],
    why: '1マスの正方形の頂点 $(1,\\ 0)$、$(0,\\ 1)$ は1列め・2列めへ、$(1,\\ 1)$ は「1列め＋2列め」へ行くので、正方形は2本の列がつくる平行四辺形になる（7-4①）。長方形からまわりの6つをひく計算を文字でまとめると $ad-bc$（7-4②）。',
    caution: '行列式がマイナスなら、面積はその大きさ（$-5$ なら5）。頂点が原点にない平行四辺形は、1つの頂点から出る2辺の矢印（頂点の座標の差）を、2本の列にならべる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /平行四辺形/.test(q) && /面積/.test(q) && !/横 \d|三角形|家|倍|まわり/.test(q); },
    steps: {
      // 正の成分（行列式も正）
      s1(r) {
        const A = rand2(r, 1, 5, 0.15), D = det2(A);
        if (D <= 0 || bad32(A) || A.flat().filter(x => x === 0).length > 1) return null;
        return { q: `$${pm(A)}$ をかけた1マスの正方形（平行四辺形）の面積`, a: `$${D}$`, easy: detEasy(A), key: keyM(A), verify: p => valIs(p, Math.abs(detNum(A))) };
      },
      // 行列式が負（面積は大きさ）・マイナスの成分・2本の矢印で
      s2(r) {
        const k = turn(r, '32s2', 2);
        const A = rand2(r, -4, 6, 0.1), D = det2(A);
        if (D === 0 || bad32(A) || (k === 0 && D > 0) || A.flat().filter(x => x === 0).length > 1) return null;
        const e = `${detEasy(A)}。面積は大きさの ${Math.abs(D)}`;
        if (k === 0) return { q: `$${pm(A)}$ をかけた1マスの正方形（平行四辺形）の面積`, a: `$${Math.abs(D)}$`, easy: e, easyCheck: false, key: keyM(A), verify: p => valIs(p, Math.abs(detNum(A))) };
        return { q: `原点から出る2本の矢印 $(${A[0][0]},\\ ${A[1][0]})$ と $(${A[0][1]},\\ ${A[1][1]})$ を2辺とする平行四辺形の面積`, a: `$${Math.abs(D)}$`, easy: `2本を列にならべた $${pm(A)}$ で、${e}`, easyCheck: false, key: keyM(A), verify: p => valIs(p, Math.abs(detNum(A))) };
      },
      // 図：原点からの平行四辺形と、原点にない平行四辺形（例と同じ答え5は出さない。R1-14）
      s3(r) {
        const st = r.s32 || (r.s32 = { n: r.int(0, 1) }), k = st.n % 2;   // 2つの図を交互に（出せたときだけ次へ）
        const A = [[r.int(2, 4), r.int(0, 2)], [r.int(0, 2), r.int(2, 4)]], D = det2(A);
        if (D < 3 || D === 5 || bad32(A) || A[0][0] + A[0][1] > 6 || A[1][0] + A[1][1] > 5 || (!A[0][1] && !A[1][0])) return null;
        st.n++;
        const u = [A[0][0], A[1][0]], v = [A[0][1], A[1][1]];
        if (k === 0) {
          return { q: `図は、行列 $${pm(A)}$ をかけた1マスの正方形（方眼の平行四辺形）。点線の長方形でかこまずに、平行四辺形の面積`, a: `$${D}$`, easy: detEasy(A), key: keyM(A), fig: figPara(u, v), verify: p => valIs(p, Math.abs(detNum(A))) };
        }
        const P = [r.int(2, 3), r.int(1, 2)], V = [P, [P[0] + u[0], P[1] + u[1]], [P[0] + u[0] + v[0], P[1] + u[1] + v[1]], [P[0] + v[0], P[1] + v[1]]];
        return { q: `図の、頂点が ${V.map(p => `$(${p[0]},\\ ${p[1]})$`).join('、')} の平行四辺形の面積`, a: `$${D}$`, key: keyM(A), fig: figPara(u, v, P),
          easy: `$(${P[0]},\\ ${P[1]})$ から出る2辺は $(${u[0]},\\ ${u[1]})$ と $(${v[0]},\\ ${v[1]})$。${detEasy(A)}`, easyCheck: false, verify: p => valIs(p, Math.abs(detNum(A))) };
      },
      // わな：正方形でない図形（長方形・三角形）の面積 → 7-33（もとの面積×行列式の大きさ）
      trap(r) {
        const k = turn(r, '32t', 2);
        const A = rand2(r, 1, 4, 0), D = det2(A);
        if (D <= 0 || BAN32.has(keyM(A))) return null;
        if (k === 0) {
          const w = r.int(2, 4), h = r.int(2, 3);
          return dest({ q: `方眼の横 ${w}・たて ${h} の長方形に $${pm(A)}$ をかけた図形の面積`, a: `$${w * h * D}$`, key: keyM(A), verify: p => valIs(p, w * h * Math.abs(detNum(A))) },
            '7-32', `1マスの正方形ではない。もとの面積 $${w}\\times${h}=${w * h}$ に行列式 $${D}$ をかけて $${w * h * D}$`, ['7-33']);
        }
        const w = r.int(2, 4), h = r.int(1, 4);
        if ((w * h) % 2) return null;
        return dest({ q: `頂点が $(0,\\ 0)$、$(${w},\\ 0)$、$(0,\\ ${h})$ の三角形に $${pm(A)}$ をかけた三角形の面積`, a: `$${w * h / 2 * D}$`, key: keyM(A), verify: p => valIs(p, w * h / 2 * Math.abs(detNum(A))) },
          '7-32', `正方形ではなく三角形。もとの面積 $\\frac{1}{2}\\times${w}\\times${h}=${w * h / 2}$ に行列式 $${D}$ をかけて $${w * h / 2 * D}$`, ['7-33']);
      },
    },
  });

  // ================================================================ 7-33
  const HOUSE = [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]], DOOR = [[1.2, 0], [1.6, 0], [1.6, 0.9], [1.2, 0.9]];
  const mv = (A, p) => [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]];
  // もとの図形（点線）と、行列をかけた図形（実線・うすいぬり）
  function figShape(A, shape, door) {
    const S2 = shape.map(p => mv(A, p)), all = shape.concat(S2, [[0, 0]]);
    const x0 = Math.floor(Math.min(...all.map(p => p[0]))), x1 = Math.ceil(Math.max(...all.map(p => p[0]))), y0 = Math.floor(Math.min(...all.map(p => p[1]))), y1 = Math.ceil(Math.max(...all.map(p => p[1])));
    // 点線のもとの図形は、ぬりのあとに描く（ぬりにかくれないように。R1-4）
    const items = [['grid', x0, y0, x1, y1], ['axes', x0, x1 + 0.8, y0, y1 + 0.8, { o: x0 < 0 ? 'se' : 'sw' }], ['poly', S2, { fill: true, thick: true }]];
    if (door) items.push(['poly', door.map(p => mv(A, p)), {}]);
    items.push(['poly', shape, { dash: true }]);
    if (door) items.push(['poly', door, { dash: true }]);
    return { s: Math.min(4, 40 / Math.max(x1 - x0 + 2, y1 - y0 + 2)), items };
  }
  const BAN33 = new Set(['2,1;1,2', '1,3;2,1']);
  add({
    id: '7-33', part: 3, chap: '7-4①③ 例題2', stars: 1,
    title: '変えた図形の面積は「もとの面積×行列式の大きさ」、行列式が負なら裏返し',
    mark: '図形と行列。「面積は何倍」「変えた図形の面積」「裏返しになるか」。',
    futsu: ['図形の頂点の1つ1つに行列をかけて、', '行き先の点を方眼にかき、', '変えた図形の面積を', '方眼で計算しなおす。'],
    raku: ['家（面積5）に $\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ → $5\\times3=15$', '$\\begin{pmatrix}1&3\\\\2&1\\end{pmatrix}$ → $1-6=-5$', '→ 面積は5倍で、裏返し'],
    why: '行列をかけると、どの1マスも同じ形・同じ面積の平行四辺形になる（7-4①）。だから、マスを集めた図形の面積は、マスの数×（1マスの面積の倍率）。その倍率が行列式の大きさ。行列式が負なら、1列めから2列めへ回る向きが逆になり、図形は鏡にうつした形（裏返し）になる（7-4③）。',
    caution: '面積の倍率は行列式の大きさ（$-5$ なら5倍）。裏返しかどうかは符号で決まる。まわりの長さは、決まった倍率にはならない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '28mm', s3: '28mm', trap: '16mm' },
    fits(q) {
      if (/まわりの長さ|体積|平行四辺形になる/.test(q)) return false;
      return (/面積/.test(q) && /(図形|三角形|家|長方形)/.test(q) && /をかけ/.test(q)) || /面積は何倍/.test(q) || (/裏返し/.test(q) && /をかけ/.test(q));
    },
    steps: {
      // 面積 S の図形（行列式は正）
      s1(r) {
        const A = rand2(r, -3, 5, 0.15), D = det2(A), S = r.int(2, 12);
        if (D <= 0 || BAN33.has(keyM(A)) || A.flat().filter(x => x === 0).length > 1 || (S === 5 && keyM(A) === '2,1;1,2')) return null;
        return { q: `面積 ${S} の図形に $${pm(A)}$ をかけた図形の面積`, a: `$${S * D}$`, easy: `行列式 ${detEasy(A)} なので、$${S}\\times${D}=${S * D}$`, easyCheck: false, key: keyM(A), verify: p => valIs(p, S * Math.abs(detNum(A))) };
      },
      // 行列式が負（何倍・裏返し）、頂点で書いた三角形
      s2(r) {
        const k = turn(r, '33s2', 2);
        const A = rand2(r, -3, 5, 0.1), D = det2(A);
        if (Math.abs(D) < 2 || BAN33.has(keyM(A)) || A.flat().filter(x => x === 0).length > 1) return null;
        if (k === 0) {
          // 「なる」と「ならない」を交互に（U-3・R1-15）。出せたときだけ次へ進める
          const u = r.ura33 || (r.ura33 = { n: r.int(0, 1) });
          if ((D < 0) !== (u.n % 2 === 1)) return null;
          u.n++;
          const ura = D < 0, ans = `${Math.abs(D)}倍、裏返しに${ura ? 'なる' : 'ならない'}`;
          return { q: `$${pm(A)}$ で、面積は何倍か。裏返しになるか`, a: ans, easy: `行列式 ${detEasy(A)}。大きさ ${Math.abs(D)}、${ura ? '負' : '正'}`, easyCheck: false, key: keyM(A),
            verify: p => { const d = detNum(A); return p.a === `${Math.round(Math.abs(d))}倍、裏返しに${d < 0 ? 'なる' : 'ならない'}` || `答え ${p.a}`; } };
        }
        const w = r.int(2, 5), h = r.int(1, 4);
        if ((w * h) % 2 || D < 0) return null;
        return { q: `頂点が $(0,\\ 0)$、$(${w},\\ 0)$、$(0,\\ ${h})$ の三角形に $${pm(A)}$ をかけた三角形の面積`, a: `$${w * h / 2 * D}$`, key: keyM(A),
          easy: `もとの面積は $\\frac{1}{2}\\times${w}\\times${h}=${w * h / 2}$、行列式 ${detEasy(A)}。$${w * h / 2}\\times${D}=${w * h / 2 * D}$`, easyCheck: false,
          verify: p => { const T = [[0, 0], [w, 0], [0, h]].map(q => mv(A, q)); const S = Math.abs((T[1][0] - T[0][0]) * (T[2][1] - T[0][1]) - (T[2][0] - T[0][0]) * (T[1][1] - T[0][1])) / 2; return valIs(p, S); } };
      },
      // 図：家（面積5）と、三角形（裏返しかどうかも）
      s3(r) {
        const k = turn(r, '33s3', 2);
        const A = [[0, 0], [0, 0]].map(row => row.map(() => r.int(-1, 2))), D = det2(A);
        if (Math.abs(D) < 2 || BAN33.has(keyM(A))) return null;
        if (k === 0) {
          if (D < 0) return null;
          return { q: `図の点線の家（面積5）に、行列 $${pm(A)}$ をかけると、実線の家になった。実線の家の面積`, a: `$${5 * D}$`, key: keyM(A), fig: figShape(A, HOUSE, DOOR),
            easy: `頂点を動かさずに、行列式 ${detEasy(A)}。$5\\times${D}=${5 * D}$`, easyCheck: false,
            verify: p => { const H = HOUSE.map(q => mv(A, q)); let S = 0; for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length]; S += a[0] * b[1] - a[1] * b[0]; } return valIs(p, Math.abs(S) / 2); } };
        }
        const T = [[0, 0], [2, 0], [0, 2]], ura = D < 0, ans = `$${2 * Math.abs(D)}$、裏返しに${ura ? 'なっている' : 'なっていない'}`;
        return { q: `図の点線の三角形（頂点 $(0,\\ 0)$、$(2,\\ 0)$、$(0,\\ 2)$）に、行列 $${pm(A)}$ をかけると、実線の三角形になった。実線の三角形の面積と、裏返しになっているかどうか`, a: ans, key: keyM(A), fig: figShape(A, T),
          easy: `もとの面積2、行列式 ${detEasy(A)}。$2\\times${Math.abs(D)}=${2 * Math.abs(D)}$、行列式が${ura ? '負' : '正'}`, easyCheck: false,
          verify: p => { const U = T.map(q => mv(A, q)), cr = (U[1][0] - U[0][0]) * (U[2][1] - U[0][1]) - (U[2][0] - U[0][0]) * (U[1][1] - U[0][1]); return p.a === `$${Math.abs(cr) / 2}$、裏返しに${cr < 0 ? 'なっている' : 'なっていない'}` || `答え ${p.a}`; } };
      },
      // わな：まわりの長さ（決まった倍率がない）、立方体の体積（3×3。7-36）
      trap(r) {
        if (turn(r, '33t', 2) === 0) {
          const a = r.int(2, 5), b = r.intNot(1, 5, v => v === a);
          const L = fr(a + b, 2);
          return dest({ q: `1辺1の正方形に $${pm([[a, 0], [0, b]])}$ をかけた図形のまわりの長さは、もとの何倍か`, a: `$${fx(L)}$`, key: `t33${a},${b}`,
            verify: p => valIs(p, 2 * (a + b) / 4) },
            '7-33', `長さは行列式では決まらない。横 ${a}・たて ${b} の長方形になるので、まわりは $2\\times(${a}+${b})=${2 * (a + b)}$、もとの4の $${fx(L)}$ 倍（面積なら行列式の ${a * b} 倍）`);
        }
        const A = [[r.int(1, 3), r.int(0, 2), 0], [0, r.int(1, 3), r.int(0, 2)], [r.int(0, 1), 0, r.int(1, 3)]];
        const D = sarrus(A).det;
        if (D <= 0) return null;
        return dest({ q: `1辺1の立方体に、3×3 の行列 $${pm(A)}$ をかけた立体の体積`, a: `$${D}$`, key: 't33' + keyM(A), verify: p => valIs(p, Math.abs(detNum(A))) },
          '7-33', `面積ではなく体積。体積の倍率は3×3 の行列式で、サラスの方法 ${sarrus(A).tex}`, ['7-36']);
      },
    },
  });

  // ================================================================ 7-34
  // 傾き q/p の、原点を通る直線の式（p=0 なら y 軸）
  function lineTeX(p, q) {
    if (p === 0) return 'x=0';
    if (q === 0) return 'y=0';
    const m = fr(q, p);
    return `y=${m[0] === 1 && m[1] === 1 ? '' : m[0] === -1 && m[1] === 1 ? '-' : F.tex(m)}x`;
  }
  // 列が平行な2×2（片方の列＝もう片方の列×m）と、k にする場所
  function para2(r, lo, hi, posOnly) {
    const p = r.intNot(lo, hi, v => v === 0), q = r.intNot(lo, hi, v => v === 0), m = posOnly ? r.int(2, 4) : r.intNot(-3, 3, v => v === 0 || v === 1);
    const base = [p, q], mul = [p * m, q * m], first = r.chance(0.5);
    const A = first ? [[base[0], mul[0]], [base[1], mul[1]]] : [[mul[0], base[0]], [mul[1], base[1]]];
    return { A, base, m };
  }
  const BAN34 = new Set(['1,k;2,4', 'k,3;2,6', '1,2;2,4', '1,3;2,6']);
  add({
    id: '7-34', part: 3, chap: '7-4④ 例題3', stars: 1,
    title: '行列式が0になる数は「2本の列が平行（比が同じ）」から。点はみな1列めの直線の上へ',
    mark: '$k$ をふくむ行列で「行列式が0になる $k$」「平らにつぶれる」「答えが1つに決まらない」。',
    futsu: ['行列式を $k$ の式で書いて、', '$=0$ とおいた方程式を解く。'],
    raku: ['$\\begin{pmatrix}1&k\\\\2&4\\end{pmatrix}$：2列め $(k,\\ 4)$ が', '1列め $(1,\\ 2)$ の2倍なら平行 → $k=2$', '点はみな直線 $y=2x$ の上へ'],
    why: '行列式 $ad-bc=0$ は $\\frac{a}{c}=\\frac{b}{d}$、つまり2本の列の横とたての比が同じ（平行）ということ（7-4④）。平行な2本では平行四辺形が作れず、面積は0。どの点 $(x,\\ y)$ も「1列め×何倍」になるので、平面全体が1列めの向きの直線（原点を通る）にのる。',
    caution: '0になる列の比は、成分のわかっている列からとる。列が $\\vec 0$ でなければ、点が集まる直線の傾きは、その列の「たて÷横」。$k$ が2か所にあると、答えが2つになることがある。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '34mm', s3: '30mm', trap: '16mm' },
    fits(q) {
      if (!/k/.test(q) || !/(行列式が0|=0\$ (?:となる|の)|つぶれ|1つに決まらない|ちょうど1つにならない)/.test(q)) return false;
      const m = mats(q); return m.length > 0 && m.every(x => x.rows === 2) || /連立方程式/.test(q) && !/z/.test(q);
    },
    steps: {
      // k は「何倍か」の列の成分（正の数）
      s1(r) {
        const { A } = para2(r, 1, 4, true), i = r.int(0, 1), j = r.int(0, 1);
        const kv = A[i][j], B = A.map((row, a) => row.map((x, b) => (a === i && b === j ? 'k' : x)));
        if (A[1 - i][1 - j] === 0 || BAN34.has(keyM(B)) || BAN34.has(keyM(A)) || !ansOK(r, '7-34', kv, 2, keyM(B))) return null;   // 同じ k を3回出さない（R1-20）
        return { q: `$\\det${pm(B)}=0$ の $k$`, a: `$k=${kv}$`, key: keyM(B),
          easy: `行列式 $${pk(B[0][0])}\\times ${pk(B[1][1])}-${pk(B[0][1])}\\times ${pk(B[1][0])}=0$ を解くかわりに、2本の列が平行（比が同じ）になる $k$`, easyCheck: false,
          verify: p => { const k = assigns(p.a).k; return near(detNum(A.map((row, a) => row.map((x, b) => (a === i && b === j ? k : x)))), 0) || `k=${k} で行列式が0でない`; } };
      },
      // マイナスの数もふくむ。点が集まる直線も
      s2(r) {
        const { A, base } = para2(r, -4, 4, false), i = r.int(0, 1), j = r.int(0, 1);
        const kv = A[i][j], B = A.map((row, a) => row.map((x, b) => (a === i && b === j ? 'k' : x)));
        if (A[1 - i][1 - j] === 0 || BAN34.has(keyM(B)) || !ansOK(r, '7-34', kv, 2, keyM(B))) return null;
        const L = lineTeX(base[0], base[1]);
        return { q: `$\\det${pm(B)}=0$ の $k$ と、そのとき平面の点が集まる直線の式`, a: `$k=${kv}$、$${L}$`, key: keyM(B),
          easy: `2本の列は $(${base[0]},\\ ${base[1]})$ の向きで平行。点はみな $(${base[0]},\\ ${base[1]})$ の何倍か`, easyCheck: false,
          verify: p => {
            const k = assigns(p.a).k, Ak = A.map((row, a) => row.map((x, b) => (a === i && b === j ? k : x)));
            if (!near(detNum(Ak), 0)) return `k=${k} で行列式が0でない`;
            const pt = [Ak[0][0] * 1.3 + Ak[0][1] * -0.7, Ak[1][0] * 1.3 + Ak[1][1] * -0.7], m = /\$y=([^$]*)x\$/.exec(p.a);
            const sl = m ? (m[1] === '' ? 1 : m[1] === '-' ? -1 : ev(m[1])) : null;
            return (sl != null && near(pt[1], sl * pt[0])) || `点 (${pt}) が直線にのらない`;
          } };
      },
      // k が2か所（答えが2つ）、連立方程式の答えが1つに決まらない k
      s3(r) {
        const t = turn(r, '34s3', 2);
        if (t === 0) {
          // (k+a)k - bc = 0 が整数の答え2つ
          const k1 = r.intNot(-4, 5, v => v === 0), k2 = r.intNot(-4, 5, v => v === 0 || v === k1), a = -(k1 + k2), bc = -k1 * k2;
          if (bc === 0) return null;
          const b = r.pick([1, -1, 2, -2, 3].filter(x => bc % x === 0)), c = bc / b;
          if (Math.abs(c) > 9) return null;
          const B = [[`k${a ? sgn(a) : ''}`, b], [c, 'k']];
          const ks = [k1, k2].sort((x, y) => x - y);
          return { q: `$${pm(B)}$ の行列式が0になる $k$（2つある）`, a: `$k=${ks[0]}$、$${ks[1]}$`, key: keyM(B),
            easy: `$(k${a ? sgn(a) : ''})k-${par(b)}\\times ${par(c)}=0$、$k^{2}${a ? sgn(a) + 'k' : ''}${sgn(-bc)}=0$、$(k${sgn(-k1)})(k${sgn(-k2)})=0$`.replace(/\+-/g, '-'), easyCheck: false,
            verify: p => { const vs = nums(p.a); return (vs.length === 2 && vs.every(k => near((k + a) * k - b * c, 0))) && vs[0] !== vs[1] || `答え ${p.a}`; } };
        }
        // 連立方程式（2つめの式の y の係数が k）
        const { A } = para2(r, 1, 4, true), b0 = r.int(1, 9), b1 = r.int(1, 12);
        const kv = A[1][1], B = [[A[0][0], A[0][1]], [A[1][0], 'k']];
        if (BAN34.has(keyM(B)) || !ansOK(r, '7-34', kv, 2, keyM(B) + '|e')) return null;
        const e1 = `$${lin(A[0], ['x', 'y'])}=${b0}$`, e2 = `$${lin([A[1][0]], ['x'])}+ky=${b1}$`;
        return { q: `連立方程式 ${e1}、${e2} の答えが、ちょうど1つにならない $k$`, a: `$k=${kv}$`, key: keyM(B) + '|e',
          easy: `係数の行列 $${pm(B)}$ の行列式が0になる $k$（2本の列が平行）`, easyCheck: false,
          verify: p => { const k = assigns(p.a).k; return near(A[0][0] * k - A[0][1] * A[1][0], 0) || `k=${k}`; } };
      },
      // わな：行列式が0でない数になる k（平行の形が使えない。7-31 で1次方程式）
      trap(r) {
        const a = r.int(1, 4), c = r.int(1, 4), d = r.int(1, 6), target = r.intNot(-8, 8, v => v === 0), i = r.int(0, 1);
        // B = [[a, k], [c, d]]（i=0）か [[k, a], [c, d]]（i=1）
        let kv, B;
        if (i === 0) { if ((a * d - target) % c) return null; kv = (a * d - target) / c; B = [[a, 'k'], [c, d]]; }
        else { if ((target + a * c) % d) return null; kv = (target + a * c) / d; B = [['k', a], [c, d]]; }
        const ex = i === 0 ? `${a}\\times ${d}-k\\times ${c}=${target}` : `k\\times ${d}-${a}\\times ${c}=${target}`;
        return dest({ q: `$\\det${pm(B)}=${target}$ の $k$`, a: `$k=${kv}$`, key: keyM(B),
          verify: p => { const k = assigns(p.a).k, v = i === 0 ? a * d - k * c : k * d - a * c; return near(v, target) || `k=${k}`; } },
          '7-34', `0ではないので、列が平行という見方は使えない。行列式を $k$ の式にして $${ex}$ を解く`, ['7-31']);
      },
    },
  });

  // ================================================================ 7-35
  // 行列式が d の、成分が整数の2×2（検算用に、ほんとうの行列を作る）
  function withDet(r, d) { const s = r.int(-2, 2), t = r.int(-2, 2); return [[1, s], [t, d + s * t]]; }
  const inv2n = A => { const d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; };
  const scl = (A, k) => A.map(row => row.map(x => x * k));
  // 式の形：[TeX, 行列式の値（分数）, 楽な形, 数で計算する関数]
  function form35(r, a, b, which) {
    const k = r.pick([2, 3, -2, -1, 4]), n = r.int(2, 3);
    const L = {
      AB: [`AB`, F.mul(fr(a), fr(b)), `$\\det A\\times\\det B=${par(a)}\\times ${par(b)}=${a * b}$`, (A, B) => mulNum(A, B)],
      kA: [`${k === -1 ? '-' : k}A`, fr(k * k * a), `$${par(k)}^{2}\\times ${par(a)}=${k * k * a}$（たても横も ${par(k)} 倍）`, A => scl(A, k)],
      An: [`A^{${n}}`, fr(a ** n), `$${par(a)}^{${n}}=${a ** n}$`, A => (n === 2 ? mulNum(A, A) : mulNum(A, mulNum(A, A)))],
      Ainv: [`A^{-1}`, fr(1, a), `$\\frac{1}{\\det A}=${F.tex(fr(1, a))}$`, A => inv2n(A)],
      A2B: [`A^{2}B`, fr(a * a * b), `$${par(a)}^{2}\\times ${par(b)}=${a * a * b}$`, (A, B) => mulNum(mulNum(A, A), B)],
      ABinv: [`AB^{-1}`, fr(a, b), `$\\frac{\\det A}{\\det B}=${F.tex(fr(a, b))}$`, (A, B) => mulNum(A, inv2n(B))],
      kAB: [`${k === -1 ? '-' : k}AB`, fr(k * k * a * b), `$${par(k)}^{2}\\times ${par(a)}\\times ${par(b)}=${k * k * a * b}$`, (A, B) => scl(mulNum(A, B), k)],
      AT: [`A^{\\mathsf T}B`, fr(a * b), `$\\det A^{\\mathsf T}=\\det A$ なので $${par(a)}\\times ${par(b)}=${a * b}$`, (A, B) => mulNum(A[0].map((_, j) => A.map(row => row[j])), B)],
      ABAi: [`ABA^{-1}`, fr(b), `$\\det A\\times\\det B\\times\\frac{1}{\\det A}=\\det B=${b}$`, (A, B) => mulNum(mulNum(A, B), inv2n(A))],
    };
    return L[which];
  }
  const BAN35 = new Set(['2,1;1,2', '1,1;0,1']);
  add({
    id: '7-35', part: 3, chap: '7-4⑤ 例題4・7-5①', stars: 1,
    title: '積の行列式は行列式の積（積を作らない）：$\\det(kA)=k^2\\det A$（3×3 は $k^3$）、$\\det(A^{-1})=\\dfrac{1}{\\det A}$',
    mark: '$\\det(AB)$、$\\det(2A)$、$\\det(A^3)$、$\\det(A^{-1})$。$\\det A$ だけがわかっているとき。',
    futsu: ['$AB$ や $2A$ を、成分ごとに', 'かけ算して行列を作ってから、', 'たすきにかけてひく。'],
    raku: ['主役 $\\det A=3$、ずらし $\\det B=1$', '→ $\\det(AB)=3\\times1=3$', '$\\det(2A)=2^{2}\\times3=12$（6 ではない）', '$\\det(A^3)=27$、$\\det(A^{-1})=\\frac{1}{3}$'],
    why: '$AB$ は「$B$ をかけてから $A$ をかける」機械なので、面積は $\\det B$ 倍してから $\\det A$ 倍される（7-4⑤）。$2A$ は $2I$ と $A$ をつないだもので、$2I$ はたても横も2倍にするから面積は $2^2$ 倍。$A^{-1}A=I$、$\\det I=1$ から $\\det(A^{-1})=\\frac{1}{\\det A}$（7-5①）。',
    caution: '$\\det(2A)$ は $2\\det A$ ではない（2×2 は $2^2$ 倍、3×3 は $2^3$ 倍）。たし算にはきまりがない（$\\det(A+B)\\neq\\det A+\\det B$）。転置しても行列式は変わらない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      const m = /\\det\s*\(([^()]*)\)/.exec(q);
      if (!m) return false;
      const t = m[1].replace(/\s/g, '').replace(/\^\{\\mathsfT\}|\^\{-1\}|\^\{?\d\}?/g, '');
      return /^-?\d*[A-C]+$/.test(t);
    },
    steps: {
      // det A、det B の値だけ
      s1(r) {
        const a = r.intNot(-5, 6, v => v === 0 || v === 3 || v === 1), b = r.intNot(-4, 5, v => v === 0 || v === 1);
        const w = r.pick(['AB', 'kA', 'kA', 'An', 'Ainv']);
        const [tx, val, ez, fn] = form35(r, a, b, w);
        const A = withDet(r, a), B = withDet(r, b);
        const cond = /B/.test(tx) ? `$\\det A=${a}$、$\\det B=${b}$` : `2×2 の行列 $A$ で $\\det A=${a}$`;
        return { q: `${cond} のとき、$\\det(${tx})$`, a: `$${F.tex(val)}$`, easy: ez, easyCheck: false, key: `${w}|${tx}|${a}|${/B/.test(tx) ? b : ''}`,
          verify: p => valIs(p, detNum(fn(numM(A), numM(B)))) };
      },
      // 組み合わせた形・行列が書いてあるとき
      s2(r) {
        if (turn(r, '35s2', 2) === 0) {
          const a = r.intNot(-4, 5, v => v === 0 || v === 3 || v === 1), b = r.intNot(-4, 4, v => v === 0 || v === 1);
          const w = r.pick(['A2B', 'ABinv', 'kAB']);
          const [tx, val, ez, fn] = form35(r, a, b, w);
          const A = withDet(r, a), B = withDet(r, b);
          // kAB は行列の大きさで答えが変わる（2×2 なら $k^2$、3×3 なら $k^3$）ので、大きさを書く（R1-1）
          return { q: `${w === 'kAB' ? '2×2 の行列 $A$、$B$ で ' : ''}$\\det A=${a}$、$\\det B=${b}$ のとき、$\\det(${tx})$`, a: `$${F.tex(val)}$`, easy: ez, easyCheck: false, key: `${w}|${tx}|${a}|${b}`,
            verify: p => valIs(p, detNum(fn(numM(A), numM(B)))) };
        }
        const A = rand2(r, -3, 4, 0.1), B = rand2(r, -3, 4, 0.1), a = det2(A), b = det2(B);
        if (!a || !b || BAN35.has(keyM(A)) || BAN35.has(keyM(B)) || Math.abs(a) > 9 || Math.abs(b) > 9) return null;
        return { q: `$A=${pm(A)}$、$B=${pm(B)}$ のとき、$AB$ を作らずに $\\det(AB)$`, a: `$${a * b}$`, key: `M${keyM(A)}|${keyM(B)}`,
          easy: `$\\det A=${a}$、$\\det B=${b}$ なので $${par(a)}\\times ${par(b)}=${a * b}$`, easyCheck: false,
          verify: p => valIs(p, detNum(mulNum(numM(A), numM(B)))) };
      },
      // 3×3（k^3）、転置、ABA^{-1}
      s3(r) {
        const t = turn(r, '35s3', 3);
        if (t === 0) {
          const a = r.intNot(-4, 5, v => v === 0), k = r.pick([2, 3, -2, -1]);
          const A = [[1, r.int(-2, 2), r.int(-2, 2)], [0, 1, r.int(-2, 2)], [0, 0, a]];
          return { q: `3×3 の行列 $A$ で $\\det A=${a}$ のとき、$\\det(${k === -1 ? '-' : k}A)$`, a: `$${k ** 3 * a}$`, key: `3|${k}|${a}`,
            easy: `3×3 は、たて・横・おく行きが $${k}$ 倍なので $${par(k)}^{3}\\times ${par(a)}=${k ** 3 * a}$`, easyCheck: false,
            verify: p => valIs(p, detNum(scl(A, k))) };
        }
        const a = r.intNot(-4, 5, v => v === 0 || v === 3 || v === 1), b = r.intNot(-4, 4, v => v === 0 || v === 1);
        const w = t === 1 ? 'AT' : 'ABAi', [tx, val, ez, fn] = form35(r, a, b, w);
        const A = withDet(r, a), B = withDet(r, b);
        return { q: `$\\det A=${a}$、$\\det B=${b}$ のとき、$\\det(${tx})$`, a: `$${F.tex(val)}$`, easy: ez, easyCheck: false, key: `${w}|${a}|${b}`,
          verify: p => valIs(p, detNum(fn(numM(A), numM(B)))) };
      },
      // わな：和の行列式（きまりがない）、正方行列でない2つの積
      trap(r) {
        // はじめの1問は和（見わけようの must も、目録の「$\\det(A+B)$」になるように）。あとは交互
        const tt = r.turns || (r.turns = {}); tt['35t'] = tt['35t'] == null ? 0 : (tt['35t'] + 1) % 2;
        if (tt['35t'] === 0) for (let it = 0; it < 80; it++) {
          const A = rand2(r, -2, 4, 0.2), B = rand2(r, -2, 4, 0.2), S = Mat.add(Mat.make(A), Mat.make(B)), a = det2(A), b = det2(B), D = F.val(Mat.det(S));
          if (!a || !b || D === a + b) continue;
          const plus = true, S2 = plus ? S : Mat.sub(Mat.make(A), Mat.make(B)), D2 = F.val(Mat.det(S2));
          if (!plus && D2 === a - b) continue;
          return dest({ q: `$A=${pm(A)}$、$B=${pm(B)}$ のとき、$\\det(A${plus ? '+' : '-'}B)$`, a: `$${D2}$`, key: `t35${keyM(A)}|${keyM(B)}|${plus}`,
            verify: p => valIs(p, detNum(numM(A).map((row, i) => row.map((x, j) => x + (plus ? 1 : -1) * B[i][j])))) },
            '7-35', `たし算・ひき算には、行列式のきまりがない（$\\det A${plus ? '+' : '-'}\\det B=${plus ? a + b : a - b}$ ではない）。$A${plus ? '+' : '-'}B=${pm(S2.map(row => row.map(x => x[0])))}$ を作ってから、たすきにかけてひく`, ['7-03']);   // 和を作るのは 7-03（U-4・R1-11）
        }
        const A = [[r.int(1, 3), r.int(0, 2), r.int(-1, 2)], [r.int(0, 2), r.int(1, 3), r.int(-1, 2)]], B = [[r.int(1, 2), r.int(0, 1)], [r.int(-1, 1), r.int(1, 2)], [r.int(0, 2), r.int(-1, 1)]];
        const P = mulNum(A, B), D = Math.round(detNum(P));
        if (!D) return null;
        return dest({ q: `2×3 の行列 $A=${pm(A)}$ と、3×2 の行列 $B=${pm(B)}$ の積 $AB$ の行列式`, a: `$${D}$`, key: `t35${keyM(A)}|${keyM(B)}`,
          verify: p => valIs(p, F.val(Mat.det(Mat.mul(Mat.make(A), Mat.make(B))))) },
          '7-35', `$A$、$B$ は正方行列でないので、$\\det A$、$\\det B$ がない。積 $AB=${pm(P)}$（2×2）を作ってから、たすきにかけてひく`, ['7-10']);
      },
    },
  });

  // ================================================================ 7-36
  const BAN36 = new Set(['2,1,1;1,3,2;1,0,2', '2,5,7;0,3,1;0,0,4', '1,2,1;0,1,2;3,0,1']);
  const rand3 = (r, lo, hi, nz) => {   // nz：0にする成分の数
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.intNot(lo, hi, v => v === 0))), idx = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, nz);
    idx.forEach(t => { A[Math.floor(t / 3)][t % 3] = 0; });
    return A;
  };
  add({
    id: '7-36', part: 3, chap: '7-4⑥ 例題5', stars: 1,
    title: '3×3 はサラスの方法：0をふくむななめは書かない（ななめより下が全部0なら対角の積だけ）',
    mark: '3×3 の行列の行列式。3本のベクトルがつくる箱の体積。',
    futsu: ['右下へのななめ3本と', '左下へのななめ3本の、', '6つのかけ算を全部書いて、', 'たしてひく。'],
    raku: ['$\\det\\begin{pmatrix}2&1&1\\\\1&3&2\\\\1&0&2\\end{pmatrix}$', '$=(12+2)-(3+2)=9$（0のある2本はとばす）', '$\\begin{pmatrix}2&5&7\\\\0&3&1\\\\0&0&4\\end{pmatrix}$ → $2\\times3\\times4=24$'],
    why: '3×3 の行列式は、どの行からも1つずつ、どの列からも1つずつ選んでかけた6つの項の和（7-4⑥）。サラスの方法は、その6つをもれなく見つける見つけ方。0が1つでもある項は0なので書かなくてよい。ななめより下が全部0なら、残るのは対角の1本だけ。',
    caution: '右下へのななめはたす、左下へのななめはひく。成分がマイナスの項は、かっこをつけて符号をまちがえない。サラスの方法は3×3 だけ（4×4 には使えない）。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 1 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '18mm', trap: '14mm' },
    fits(q) {
      if (/k|のとき|入れかえ|0になる|平面にのる/.test(q)) return false;
      const m = mats(q).filter(x => x.env === 'pmatrix');
      if (/箱|体積/.test(q) && (m.some(x => x.rows === 3 && x.cols === 3) || /3本のベクトル/.test(q))) return true;
      const i = q.indexOf('\\det\\begin{pmatrix}'); if (i < 0) return false;
      const n = mats(q.slice(i))[0];
      return !!n && n.rows === 3 && n.cols === 3 && numBody(n.body);
    },
    steps: {
      // 0が3つ以上（ななめの2本以上が0）
      s1(r) {
        const A = rand3(r, -2, 4, r.int(3, 4)), S = sarrus(A);
        if (S.zeros < 2 || BAN36.has(keyM(A)) || A.some(row => row.every(x => x === 0)) || S.det === 0) return null;
        return { q: `$${DET(A)}$`, a: `$${S.det}$`, easy: S.tex, key: keyM(A), verify: p => valIs(p, detNum(A)) };
      },
      // 0が1つ・2つ、ななめより下（上）が全部0
      s2(r) {
        if (turn(r, '36s2', 3) === 0) {
          const d = [r.intNot(-3, 4, v => v === 0), r.intNot(-3, 4, v => v === 0), r.intNot(-3, 5, v => v === 0)];
          const up = r.chance(0.6), A = [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? d[i] : (up ? j > i : j < i) ? r.int(-3, 6) : 0)));
          if (BAN36.has(keyM(A))) return null;
          return { q: `$${DET(A)}$`, a: `$${d[0] * d[1] * d[2]}$`, easy: `ななめより${up ? '下' : '上'}が全部0なので、対角の積 $${d.map(par).join('\\times ')}=${d[0] * d[1] * d[2]}$`, easyCheck: false, key: keyM(A), verify: p => valIs(p, detNum(A)) };
        }
        const A = rand3(r, -3, 4, r.int(1, 2)), S = sarrus(A);
        if (BAN36.has(keyM(A)) || S.det === 0) return null;
        return { q: `$${DET(A)}$`, a: `$${S.det}$`, easy: S.tex, key: keyM(A), verify: p => valIs(p, detNum(A)) };
      },
      // k をふくむ形（k の式で）、3本のベクトルの箱の体積
      s3(r) {
        if (turn(r, '36s3', 2) === 0) {
          const A = rand3(r, -2, 3, r.int(2, 3)), i = r.int(0, 2), j = r.int(0, 2);
          if (A[i][j] === 0) return null;
          const B = A.map((row, a) => row.map((x, b) => (a === i && b === j ? 'k' : x)));
          const f = k => detNum(A.map((row, a) => row.map((x, b) => (a === i && b === j ? k : x))));
          const c1 = Math.round(f(1) - f(0)), c0 = Math.round(f(0));
          if (c1 === 0 || c0 === 0) return null;
          const ans = M.P.tex(M.P.make(c0, c1), 'k');
          // k を通るななめは、たす1本とひく1本（R1-2。7-37 の caution と同じ）。たすななめは列 (s+行)、ひくななめは列 (s−行)
          const diag = sg => [0, 1, 2].map(row => B[row][((sg > 0 ? j - i + row : j + i - row) % 3 + 3) % 3]);
          const kt = xs => { const c = xs.filter(x => x !== 'k').reduce((s, x) => s * x, 1); return `${xs.map(x => (x === 'k' ? 'k' : par(x))).join('\\times ')}=${c === 0 ? '0' : c === 1 ? 'k' : c === -1 ? '-k' : c + 'k'}`; };
          const kc = xs => xs.filter(x => x !== 'k').reduce((s, x) => s * x, 1);
          return { q: `$${DET(B)}$ を $k$ の式で`, a: `$${ans}$`, key: 'k' + keyM(B), easyCheck: false,
            easy: `サラスの方法で、$k$ を通るななめは、たす $${kt(diag(1))}$ とひく $${kt(diag(-1))}$ の2本（$k$ の係数は $${kc(diag(1))}${kc(diag(-1)) < 0 ? '+' + -kc(diag(-1)) : '-' + kc(diag(-1))}=${c1}$）`,
            verify: p => { const t = strip(p.a); for (const kk of [-1.7, 0.4, 2.9]) if (!near(ev(t, { k: kk }), f(kk), 1e-9)) return `k=${kk} で値がちがう`; return true; } };
        }
        const A = [[r.int(1, 3), r.int(0, 1), r.int(0, 2)], [0, r.int(1, 3), r.int(0, 2)], [r.int(0, 1), 0, r.int(1, 4)]];
        const S = sarrus(A);
        if (S.det < 3 || BAN36.has(keyM(A)) || keyM(A) === '2,0,1;0,3,1;0,0,4') return null;
        const cols = [0, 1, 2].map(j => `$(${A[0][j]},\\ ${A[1][j]},\\ ${A[2][j]})$`);
        return { q: `3本のベクトル ${cols.join('、')} がつくる箱（平行六面体）の体積`, a: `$${S.det}$`, key: keyM(A),
          easy: `3本を列にならべた行列 $${pm(A)}$ の行列式。${S.tex}`, easyCheck: false, verify: p => valIs(p, Math.abs(detNum(A))) };
      },
      // わな：4×4（サラスの方法は使えない）
      trap(r) {
        const a = r.intNot(-3, 3, v => v === 0), B = rand3(r, -2, 3, 3), D = a * sarrus(B).det;
        if (!D) return null;
        const rowFirst = r.chance(0.5), x = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
        const A = rowFirst ? [[a, 0, 0, 0], ...B.map((row, i) => [x[i], ...row])] : [[a, ...x], ...B.map(row => [0, ...row])];
        return dest({ q: `$${DET(A)}$`, a: `$${D}$`, key: 't36' + keyM(A), verify: p => valIs(p, detNum(A)) },
          '7-36', `4×4 にはサラスの方法は使えない（ななめは8本、項は24個）。${rowFirst ? '1行め' : '1列め'}が $${a}$ のほかは0なので、$${a}\\times$（残りの3×3 の行列式 $${sarrus(B).det}$）$=${D}$（余因子展開。7-4⑥ もっと知りたい）`);
      },
    },
  });

  // ================================================================ 7-37
  // 1列め・2列め（どちらも0でない、平行でない）と、3列め＝s×1列め＋t×2列め
  function dep3(r, lo, hi) {
    for (let it = 0; it < 200; it++) {
      const c1 = [0, 1, 2].map(() => r.int(lo, hi)), c2 = [0, 1, 2].map(() => r.int(lo, hi));
      const s = r.intNot(-2, 2, v => v === 0), t = r.intNot(-2, 2, v => v === 0), c3 = c1.map((x, i) => s * x + t * c2[i]);
      const cr = [c1[1] * c2[2] - c1[2] * c2[1], c1[2] * c2[0] - c1[0] * c2[2], c1[0] * c2[1] - c1[1] * c2[0]];
      if (cr.every(x => x === 0) || c3.some(x => Math.abs(x) > 9)) continue;
      return { A: [0, 1, 2].map(i => [c1[i], c2[i], c3[i]]), s, t, cr };
    }
    return null;
  }
  const comb = (s, t) => `3列め＝${s === 1 ? '' : s === -1 ? '－' : s < 0 ? '－' + -s + '×' : s + '×'}1列め${t > 0 ? '＋' : '－'}${Math.abs(t) === 1 ? '' : Math.abs(t) + '×'}2列め`;
  const BAN37 = new Set(['1,2,k;0,1,1;1,0,1', '1,0,2;k,1,1;1,1,1', '1,2,3;0,1,1;1,0,1']);
  add({
    id: '7-37', part: 3, chap: '7-4⑥ 例題6', stars: 1,
    title: '3×3 の行列式が0 → 3列めは1列めと2列めの組み合わせ（3本の列が1つの平面に）',
    mark: '$k$ をふくむ3×3 の行列で「行列式が0になる $k$」「3本のベクトルが1つの平面にのる」。',
    futsu: ['サラスの方法で、行列式を', '$k$ の式にして、$=0$ とおいた', '方程式を解く。'],
    raku: ['$\\begin{pmatrix}1&2&k\\\\0&1&1\\\\1&0&1\\end{pmatrix}$', '$(1+2+0)-(k+0+0)=3-k=0$', '$k=3$。3列め $(3,\\ 1,\\ 1)$＝1列め＋2列め'],
    why: '3×3 の行列式は、3本の列がつくる箱の体積の倍率（7-4⑥）。0なら箱はつぶれていて、3本の列は1つの平面にのる。だから3列めは、1列めと2列めの何倍かをたしたもので作れる。$k$ をふくむ項は、サラスの6本のうち $k$ を通る2本だけ。',
    caution: '$k$ を通るななめは、たす1本とひく1本。ほかの項は数なので、先に計算してまとめておく。3列めを1列めと2列めで表したら、3つの成分の全部で確かめる。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: 1,
    boxw: { s1: '14mm', s2: '14mm', s3: '36mm', trap: '14mm' },
    fits(q) {
      if (!/k/.test(q) || !/(0になる|=0\$ (?:となる|の)|平面にのる|組み合わせ)/.test(q)) return false;
      return mats(q).some(x => x.rows === 3 && x.cols === 3) || /3本のベクトル/.test(q);
    },
    steps: {
      // k は3列め（0〜3 の数）
      s1(r) {
        const g = dep3(r, 0, 3); if (!g) return null;
        const i = r.int(0, 2), B = g.A.map((row, a) => row.map((x, b) => (a === i && b === 2 ? 'k' : x)));
        if (g.cr[i] === 0 || BAN37.has(keyM(B)) || g.A[i][2] === 0) return null;
        const kv = g.A[i][2];
        return { q: `$\\det${pm(B)}=0$ の $k$`, a: `$k=${kv}$`, key: keyM(B), easy: `${comb(g.s, g.t)} になる $k$（サラスの方法で $k$ の1次式にしてもよい）`, easyCheck: false,
          verify: p => { const k = assigns(p.a).k; return near(detNum(B.map(row => row.map(x => (x === 'k' ? k : x)))), 0) || `k=${k} で行列式が0でない`; } };
      },
      // マイナスの数、k はどこにでも
      s2(r) {
        const g = dep3(r, -2, 3); if (!g) return null;
        const i = r.int(0, 2), j = r.int(0, 2), B = g.A.map((row, a) => row.map((x, b) => (a === i && b === j ? 'k' : x)));
        const f = k => detNum(B.map(row => row.map(x => (x === 'k' ? k : x))));
        if (Math.abs(f(1) - f(0)) < 1e-9 || BAN37.has(keyM(B)) || g.A.flat().filter(x => x === 0).length > 4) return null;
        return { q: `$\\det${pm(B)}=0$ の $k$`, a: `$k=${g.A[i][j]}$`, key: keyM(B), easy: `サラスの方法で、$k$ を通る2本のななめだけが $k$ をふくむ。$${fmt(Math.round(f(1) - f(0)))}k${sgn(Math.round(f(0)))}=0$`.replace(/\$1k/, '$k').replace(/\$-1k/, '$-k'), easyCheck: false,
          verify: p => { const k = assigns(p.a).k; return near(f(k), 0) || `k=${k} で行列式が0でない`; } };
      },
      // k と、3列めの表し方（s、t）。3本のベクトルが1つの平面にのる k
      s3(r) {
        const g = dep3(r, 0, 3); if (!g) return null;
        const i = r.int(0, 2), B = g.A.map((row, a) => row.map((x, b) => (a === i && b === 2 ? 'k' : x)));
        if (g.cr[i] === 0 || BAN37.has(keyM(B)) || g.A[i][2] === 0) return null;
        const kv = g.A[i][2];
        if (turn(r, '37s3', 2) === 0) {
          return { q: `$${pm(B)}$ の行列式が0になる $k$ と、そのとき「3列め＝$s\\times$1列め＋$t\\times$2列め」となる $s$、$t$`, a: `$k=${kv}$、$s=${g.s}$、$t=${g.t}$`, key: keyM(B),
            easy: `${comb(g.s, g.t)}（3つの成分で確かめる）`, easyCheck: false,
            verify: p => { const o = assigns(p.a), A = numM(g.A); if (!near(detNum(B.map(row => row.map(x => (x === 'k' ? o.k : x)))), 0)) return `k=${o.k}`; return [0, 1, 2].every(a => near(o.s * A[a][0] + o.t * A[a][1], a === i ? o.k : A[a][2])) || `s=${o.s}、t=${o.t} で3列めにならない`; } };
        }
        const cols = [0, 1, 2].map(j => `$(${B.map(row => row[j]).join(',\\ ')})$`);
        return { q: `3本のベクトル ${cols.join('、')} が1つの平面にのる $k$`, a: `$k=${kv}$`, key: keyM(B),
          easy: `3本を列にならべた行列の行列式が0。${comb(g.s, g.t)}`, easyCheck: false,
          verify: p => { const k = assigns(p.a).k; return near(detNum(B.map(row => row.map(x => (x === 'k' ? k : x)))), 0) || `k=${k}`; } };
      },
      // わな：行列式が0でない数になる k（組み合わせの見方が使えない。7-36）
      trap(r) {
        const g = dep3(r, 0, 3); if (!g) return null;
        const i = r.int(0, 2), B = g.A.map((row, a) => row.map((x, b) => (a === i && b === 2 ? 'k' : x)));
        const f = k => detNum(B.map(row => row.map(x => (x === 'k' ? k : x)))), c1 = Math.round(f(1) - f(0)), c0 = Math.round(f(0));
        if (!c1) return null;
        const target = r.intNot(-6, 6, v => v === 0);
        if ((target - c0) % c1) return null;
        const kv = (target - c0) / c1;
        return dest({ q: `$\\det${pm(B)}=${target}$ の $k$`, a: `$k=${kv}$`, key: keyM(B),
          verify: p => { const k = assigns(p.a).k; return near(f(k), target) || `k=${k}`; } },
          '7-37', `0ではないので、3列めが組み合わせという見方は使えない。サラスの方法で $${fmt(c1)}k${sgn(c0)}=${target}$ を解く`.replace(/\$1k/, '$k').replace(/\$-1k/, '$-k'), ['7-36']);
      },
    },
  });

  // ================================================================ 7-38
  const SIN = { 0: [fr(0), ''], 30: [fr(1, 2), ''], 45: [fr(1, 2), '2'], 60: [fr(1, 2), '3'], 90: [fr(1), ''], 120: [fr(1, 2), '3'], 135: [fr(1, 2), '2'], 150: [fr(1, 2), ''], 180: [fr(0), ''] };
  const sinv = d => Math.sin(d * Math.PI / 180);
  // c × sin(d°) の TeX（c は小数でもよい。√ を残す）
  function cSin(c, d) {
    const [q, rt] = SIN[d], v = F.mul(F.fromDec(String(c)), q);
    if (v[0] === 0) return '0';
    if (Math.abs(c) === 1) { const sg = v[0] < 0 ? '-' : '', a = [Math.abs(v[0]), v[1]]; return sg + (rt ? (a[1] === 1 ? `\\sqrt{${rt}}` : `\\frac{\\sqrt{${rt}}}{${a[1]}}`) : F.tex(a)); }
    const n = fx(v);
    return rt ? (n === '1' ? '' : n === '-1' ? '-' : n) + `\\sqrt{${rt}}` : n;
  }
  const deg = d => `${d}^{\\circ}`;
  const ARM = [[0.30, 0.25], [0.30, 0.20], [0.50, 0.40], [0.20, 0.10], [0.40, 0.20], [0.50, 0.30], [0.60, 0.40]];
  add({
    id: '7-38', part: 3, chap: '7-4⑦ 例題7・8', stars: 1,
    title: '工学の行列式は式の形で：腕は $\\det J=L_1L_2\\sin\\theta_2$（肩の角に関係しない）、2本のひもは $-\\sin(\\theta_1+\\theta_2)$',
    mark: 'ロボットの腕のヤコビ行列 $J$ の行列式。2本のひもでつるすつり合いの行列の行列式。',
    futsu: ['手先の位置 $x$、$y$ を出して', 'ヤコビ行列 $J$ の4つの成分を', '1つずつ計算してから、', 'たすきにかけてひく。'],
    raku: ['$L_1=0.40$、$L_2=0.30$、$\\theta_2=30^{\\circ}$', '→ $0.12\\times\\frac{1}{2}=0.06$（$\\theta_1$ は使わない）', '30°と60°のひも → $-\\sin90^{\\circ}=-1$'],
    why: '$J$ の1列めは肩だけを回したときの手の速度、2列めはひじだけを回したときの手の速度。行列式を加法定理で整理すると、肩の角が消えて $L_1L_2\\sin\\theta_2$ が残る（7-4⑦（イ））。ひもの行列も、加法定理で $-\\sin(\\theta_1+\\theta_2)$ にまとまる（7-4⑦（ア））。',
    caution: '腕がまっすぐのびきる $\\theta_2=0^{\\circ}$ では行列式が0（特異姿勢）。ひもの行列式は、ひもが水平に近いほど0に近づき、ひもの力は大きくなる。$\\sin$ の値は √ を残した形で書く。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '30mm', s3: '40mm', trap: '28mm' }, boxh: { trap: '12mm' },
    fits(q) { return /(腕|ひも|電灯)/.test(q) && /(\\det J|行列式)/.test(q); },
    steps: {
      // 腕の det J（θ1 もわざと書く）
      s1(r) {
        const [L1, L2] = r.pick(ARM), t2 = r.pick([30, 45, 60, 90, 120, 135, 150]), t1 = r.pick([0, 30, 45, 60, 90]);
        const c = +(L1 * L2).toFixed(4), A = cSin(c, t2);
        return { q: `肩からひじ $L_1=${L1.toFixed(2)}\\,\\mathrm{m}$、ひじから手先 $L_2=${L2.toFixed(2)}\\,\\mathrm{m}$ のロボットの腕で、$\\theta_1=${deg(t1)}$、$\\theta_2=${deg(t2)}$ のときの $\\det J$`, a: `$${A}$`, key: `${L1},${L2},${t2}`,
          easy: `$\\det J=L_1L_2\\sin\\theta_2=${fmt(c)}\\times\\sin${deg(t2)}=${A}$（$\\theta_1$ は使わない）`, easyCheck: false,
          verify: p => { const t12 = (t1 + t2) * Math.PI / 180, a1 = t1 * Math.PI / 180, x = L1 * Math.cos(a1) + L2 * Math.cos(t12), y = L1 * Math.sin(a1) + L2 * Math.sin(t12); return valIs(p, -y * L2 * Math.cos(t12) + L2 * Math.sin(t12) * x, 1e-9); } };
      },
      // ひもの行列式、特異姿勢・いちばん大きい角
      s2(r) {
        const k = turn(r, '38s2', 3);
        if (k === 0) {
          // ひもが真下にたれる 90° はよける（R1-33）。たして90°（$-1$）は楽な形の例と同じ答えなので出さない
          //   ステップ3の電灯と同じ角のひもも出さない（同じ行列になるので。S-2）
          const used = r.h38 || (r.h38 = new Set()), ts = [30, 60].filter(x => !used.has(x));
          if (!ts.length) return null;
          const a = r.pick(ts), b = a; used.add(a);
          const A = cSin(-1, a + b);
          return { q: `左のひもが水平から $${deg(a)}$、右のひもが $${deg(b)}$ のつり合いの行列 $\\begin{pmatrix}-\\cos${deg(a)}&\\cos${deg(b)}\\\\\\sin${deg(a)}&\\sin${deg(b)}\\end{pmatrix}$ の行列式`, a: `$${A}$`, key: `h${Math.min(a, b)},${Math.max(a, b)}`,
            easy: `$-\\sin(${deg(a)}+${deg(b)})=-\\sin${deg(a + b)}=${A}$`, easyCheck: false,
            verify: p => valIs(p, -Math.cos(a * Math.PI / 180) * Math.sin(b * Math.PI / 180) - Math.cos(b * Math.PI / 180) * Math.sin(a * Math.PI / 180), 1e-9) };
        }
        const [L1, L2] = r.pick(ARM), c = +(L1 * L2).toFixed(4);
        if (k === 1) {
          return { q: `$L_1=${L1.toFixed(2)}\\,\\mathrm{m}$、$L_2=${L2.toFixed(2)}\\,\\mathrm{m}$ のロボットの腕で、$\\det J$ がいちばん大きくなるひじの角 $\\theta_2$（$0^{\\circ}\\leqq\\theta_2\\leqq180^{\\circ}$）と、そのときの $\\det J$`, a: `$\\theta_2=90^{\\circ}$、$${fmt(c)}$`, key: `m${L1},${L2}`,
            easy: `$\\sin\\theta_2=1$ のとき。$${fmt(L1)}\\times${fmt(L2)}=${fmt(c)}$`, easyCheck: false,
            verify: p => { let best = -1, bt = 0; for (let t = 0; t <= 180; t++) { const v = L1 * L2 * sinv(t); if (v > best + 1e-12) { best = v; bt = t; } } return p.a === `$\\theta_2=${bt}^{\\circ}$、$${fmt(best)}$` || `答え ${p.a}`; } };
        }
        return { q: `$L_1=${L1.toFixed(2)}\\,\\mathrm{m}$、$L_2=${L2.toFixed(2)}\\,\\mathrm{m}$ のロボットの腕で、$\\det J=0$ になる（特異姿勢になる）ひじの角 $\\theta_2$（$0^{\\circ}\\leqq\\theta_2\\leqq180^{\\circ}$）`, a: `$0^{\\circ}$、$180^{\\circ}$`, key: 'z',
          easy: `$${fmt(c)}\\sin\\theta_2=0$ から $\\sin\\theta_2=0$。のびきる角と、折りたたむ角`, easyCheck: false,
          verify: p => { const z = []; for (let t = 0; t <= 180; t++) if (Math.abs(L1 * L2 * sinv(t)) < 1e-12) z.push(t); return p.a === z.map(t => `$${t}^{\\circ}$`).join('、') || `答え ${p.a}`; } };
      },
      // 90° のときの何倍か、電灯（行列式とひもの力）
      s3(r) {
        // 2つの形を交互に（出せたときだけ次へ）。同じ答えは出さない（U-3）
        const st = r.s38 || (r.s38 = { n: r.int(0, 1) });
        if (st.n % 2 === 0) {
          const [L1, L2] = r.pick(ARM), t2 = r.pick([30, 45, 60, 120, 135, 150]);
          const A = cSin(1, t2);
          if (!ansOK(r, '7-38s3', A)) return null;
          st.n++;
          return { q: `$L_1=${L1.toFixed(2)}\\,\\mathrm{m}$、$L_2=${L2.toFixed(2)}\\,\\mathrm{m}$ のロボットの腕で、ひじの角が $${deg(t2)}$ のときの $\\det J$ は、ひじの角が $90^{\\circ}$ のときの何倍か`, a: `$${A}$`, key: `r${L1},${L2},${t2}`,
            easy: `$L_1L_2$ は同じなので、$\\frac{\\sin${deg(t2)}}{\\sin90^{\\circ}}=${A}$`, easyCheck: false, verify: p => valIs(p, sinv(t2) / sinv(90), 1e-9) };
        }
        const used = r.h38 || (r.h38 = new Set()), ts = [30, 60].filter(x => !used.has(x));
        if (!ts.length) { st.n++; return null; }
        const t = r.pick(ts), W = t === 60 ? r.pick([30, 60, 90, 120]) : r.pick([20, 40, 60, 80, 100]);
        used.add(t); st.n++;
        const D = cSin(-1, 2 * t), T = t === 30 ? `${W}` : t === 45 ? `${W / 2}\\sqrt{2}` : `${W / 3}\\sqrt{3}`;
        return { q: `重さ $${W}\\,\\mathrm{N}$ の電灯を、左右とも水平から $${deg(t)}$ のひもでつるす。つり合いの行列 $\\begin{pmatrix}-\\cos${deg(t)}&\\cos${deg(t)}\\\\\\sin${deg(t)}&\\sin${deg(t)}\\end{pmatrix}$ の行列式と、ひもの力 $T$`,
          a: `$${D}$、$T=${T}\\,\\mathrm{N}$`, key: `h${t},${t}`,
          easy: `行列式は $-\\sin(${deg(t)}+${deg(t)})=${D}$。たての力のつり合い $2T\\sin${deg(t)}=${W}$ から $T$`, easyCheck: false,
          verify: p => { const n = nums(p.a); const s = Math.sin(t * Math.PI / 180), c = Math.cos(t * Math.PI / 180); return (n.length === 2 && near(n[0], -c * s - c * s) && near(n[1], W / (2 * s))) || `答え ${p.a}`; } };
      },
      // わな：行列式ではなく、ヤコビ行列 J そのもの（7-21）
      trap(r) {
        const [L1, L2] = r.pick(ARM), [t1, t2] = [[0, 90], [90, 0], [0, 0], [90, 90]][turn(r, '38t', 4)];
        const a1 = t1 * Math.PI / 180, t12 = (t1 + t2) * Math.PI / 180, x = L1 * Math.cos(a1) + L2 * Math.cos(t12), y = L1 * Math.sin(a1) + L2 * Math.sin(t12);
        const cl = v => +(Math.abs(v) < 1e-12 ? 0 : v).toFixed(4);
        const J = [[cl(-y), cl(-L2 * Math.sin(t12))], [cl(x), cl(L2 * Math.cos(t12))]];
        return dest({ q: `$L_1=${L1.toFixed(2)}\\,\\mathrm{m}$、$L_2=${L2.toFixed(2)}\\,\\mathrm{m}$ のロボットの腕で、$\\theta_1=${deg(t1)}$、$\\theta_2=${deg(t2)}$ のときのヤコビ行列 $J$`, a: `$${pm(J.map(row => row.map(v => fmt(v))))}$`, key: `t38${L1},${L2},${t1},${t2}`,
          calc: { kind: 'mat', want: J } },
          '7-38', `行列式ではなく行列そのもの。1列めは肩だけを回したときの手の速度 $(-y,\\ x)$、2列めはひじだけを回したときの手の速度。手先は $(${fmt(cl(x))},\\ ${fmt(cl(y))})$`, ['7-21']);
      },
    },
  });

  // ================================================================ 7-39
  // 行列式が d の、成分が整数の2×2（a・b・c・d は lo〜hi）
  function matDet(r, dets, lo, hi, nz) {   // nz：0の成分を入れない
    for (let it = 0; it < 400; it++) {
      const A = [[r.int(lo, hi), r.int(lo, hi)], [r.int(lo, hi), r.int(lo, hi)]];
      if (dets.includes(det2(A)) && A.flat().filter(x => x === 0).length < (nz ? 1 : 2)) return A;
    }
    return null;
  }
  const invTeX = A => Mat.tex(Mat.inv(Mat.make(A)), { factor: true });
  function invEasy(A) {
    const D = det2(A);
    return `${detEasy(A)}。$${A[0][0]}$ と $${A[1][1]}$ を入れかえ、$${A[0][1]}$ と $${A[1][0]}$ の符号を変えて${D === 1 ? '、そのまま' : `、$${D}$ でわる`}`;
  }
  const BAN39 = new Set(['3,1;5,2', '4,2;2,4']);
  add({
    id: '7-39', part: 3, chap: '7-5① 例題1', stars: 1,
    title: '2×2 の逆行列は「左上と右下を入れかえ、右上と左下に $-$、行列式でわる」：行列式は外に出したまま',
    mark: '「逆行列を求めよう」「$A^{-1}$」。2×2 の行列。',
    futsu: ['$A\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}1\\\\0\\end{pmatrix}$ と', '$A\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}0\\\\1\\end{pmatrix}$ の2つの連立方程式を', '加減法で解いて、答えを列にならべる。'],
    raku: ['$\\begin{pmatrix}3&1\\\\5&2\\end{pmatrix}$：行列式 $6-5=1$', '→ $\\begin{pmatrix}2&-1\\\\-5&3\\end{pmatrix}$（分数なし）', '$\\begin{pmatrix}4&2\\\\2&4\\end{pmatrix}$ → $\\frac{1}{12}\\begin{pmatrix}4&-2\\\\-2&4\\end{pmatrix}$'],
    why: '2つの連立方程式を文字のまま解くと、どの答えも「行列式 $ad-bc$ でわる」形になり、1列めは $(d,\\ -c)$、2列めは $(-b,\\ a)$ をわったもの（7-5①）。$\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$ を $A$ にかけると $(ad-bc)I$ になるので、行列式でわれば $I$。',
    caution: '行列式が0なら逆行列はない（0でわれない）。はじめに行列式を計算する。作ったら、もとの行列にかけて $I$ になるか確かめる。分数は外に $\\frac{1}{\\det A}$ として出したままでよい。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 1 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '30mm', s3: '30mm', trap: '30mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '16mm' },
    fits(q) {
      if (/AB|\(A|B\^|B=|C|連立|\\vec|右辺|電流|ひも|=\\begin\{pmatrix\}.*のとき.*\\det/.test(q)) return false;
      if (!/逆行列|\^\{-1\}/.test(q)) return false;
      const m = mats(q).filter(x => x.env === 'pmatrix');
      return m.length > 0 && m.every(x => x.rows === 2 && x.cols === 2 && numBody(x.body));
    },
    steps: {
      // 行列式が1か -1（逆行列も整数）
      s1(r) {
        const A = matDet(r, [1, 1, -1], -2, 6);
        if (!A || BAN39.has(keyM(A)) || A.flat().some(x => x < 0) && r.chance(0.6)) return null;
        return { q: `$${pm(A)}^{-1}$`, a: `$${invTeX(A)}$`, easy: invEasy(A), easyCheck: false, key: keyM(A), calc: { kind: 'mat', want: Mat.inv(Mat.make(A)) },
          verify: p => { const X = M.readMat(p.a).map(row => row.map(v => v[0])), P = mulNum(X, numM(A)); return near(P[0][0], 1) && near(P[1][1], 1) && near(P[0][1], 0) && near(P[1][0], 0) || 'かけても I にならない'; } };
      },
      // 行列式が 2〜12（分数を外に出す）
      s2(r) {
        const A = matDet(r, [2, 3, 4, 5, 6, 8, 12, -2, -3, -4, -6], -3, 6);
        if (!A || BAN39.has(keyM(A))) return null;
        return { q: `$${pm(A)}^{-1}$`, a: `$${invTeX(A)}$`, easy: invEasy(A), easyCheck: false, key: keyM(A), calc: { kind: 'mat', want: Mat.inv(Mat.make(A)) },
          verify: p => { const X = M.readMat(p.a).map(row => row.map(v => v[0])), P = mulNum(numM(A), X); return near(P[0][0], 1) && near(P[1][1], 1) && near(P[0][1], 0) && near(P[1][0], 0) || 'かけても I にならない'; } };
      },
      // なければ「ない」：行列式0、対角の行列、逆行列から元の行列
      s3(r) {
        const k = turn(r, '39s3', 3);
        if (k === 0) {
          const p0 = r.int(1, 4), q0 = r.intNot(-3, 4, v => v === 0), m = r.intNot(-3, 3, v => v === 0 || v === 1), A = r.chance(0.5) ? [[p0, m * p0], [q0, m * q0]] : [[p0, q0], [m * p0, m * q0]];
          return { q: `$${pm(A)}$ の逆行列（ないときは「ない」と書く）`, a: 'ない', key: keyM(A), easy: `行列式 ${detEasy(A)} なので、逆行列はない（平らにつぶれて、元にもどせない）`, easyCheck: false,
            verify: p => (p.a === 'ない' && near(detNum(A), 0)) || '行列式が0でない' };
        }
        if (k === 1) {
          const a = r.intNot(-5, 6, v => v === 0 || v === 1), d = r.intNot(-5, 6, v => v === 0 || v === 1 || v === a), A = [[a, 0], [0, d]];
          const X = [[fr(1, a), fr(0)], [fr(0), fr(1, d)]];
          return { q: `$${pm(A)}$ の逆行列（ないときは「ない」と書く）`, a: `$${pm(X, { frac: true })}$`, key: keyM(A), calc: { kind: 'mat', want: X },
            easy: `横を $${a}$ 倍・たてを $${d}$ 倍する行列なので、もどすには $\\frac{1}{${a}}$ 倍・$\\frac{1}{${d}}$ 倍`.replace(/\\frac\{1\}\{-(\d)\}/g, '-\\frac{1}{$1}'), easyCheck: false };
        }
        const A = matDet(r, [1, -1, 2, 3], -2, 5);
        if (!A || BAN39.has(keyM(A))) return null;
        const X = Mat.inv(Mat.make(A));
        return { q: `$A^{-1}=${Mat.tex(X, { factor: true })}$ のとき、$A$`, a: `$${pm(A)}$`, key: keyM(A), calc: { kind: 'mat', want: A },
          easy: `$A$ は $A^{-1}$ の逆行列。$A^{-1}$ の行列式は $${F.tex(Mat.det(X))}$ なので、入れかえ・符号・$${F.tex(Mat.det(X))}$ でわる`, easyCheck: false };
      },
      // わな：3×3 の逆行列（入れかえる公式はない。7-44 の掃き出し法）
      trap(r) {
        const L = [[1, 0, 0], [r.int(-2, 2), 1, 0], [r.int(-2, 2), r.int(-2, 2), 1]], U = [[1, r.int(-2, 2), r.int(-2, 2)], [0, 1, r.int(-2, 2)], [0, 0, 1]];
        const A = Mat.mul(Mat.make(L), Mat.make(U)).map(row => row.map(x => x[0]));
        if (A.flat().filter(x => x === 0).length > 4 || A.flat().some(x => Math.abs(x) > 6)) return null;
        const X = Mat.inv(Mat.make(A));
        if (X.flat().some(x => Math.abs(x[0]) > 9)) return null;
        return dest({ q: `$${pm(A)}^{-1}$`, a: `$${Mat.tex(X)}$`, key: 't39' + keyM(A), calc: { kind: 'mat', want: X } },
          '7-39', '3×3 の逆行列には「入れかえて、符号を変える」形がない。右に $I$ をならべて掃き出す', ['7-44']);
      },
    },
  });

  // ================================================================ 7-40
  // 行列式が0の連立方程式（わなで使う）：2つめの式＝1つめ×m（右辺はそろうか、ずれる）
  function sing2(r) {
    const a = r.int(1, 4), b = r.intNot(-4, 5, v => v === 0), c = r.int(1, 9), m = r.pick([2, 3, -1, -2]), ok = r.chance(0.5);
    const d = ok ? m * c : m * c + r.intNot(-3, 3, v => v === 0);
    const A = [[a, b], [m * a, m * b]], B = [c, d];
    const yx = F.tex(fr(-b, a)), cx = F.tex(fr(c, a));
    const free = `$x=${cx === '0' ? '' : cx}${-b / a < 0 ? '' : (cx === '0' ? '' : '+')}${yx === '1' ? '' : yx === '-1' ? '-' : yx}y$`;
    return { A, B, ok, m, ans: ok ? `答えは無数（${free}）` : '答えはない', why: ok ? '2つめの式は1つめの式の $' + m + '$ 倍で、右辺も同じ倍' : '左辺は1つめの式の $' + m + '$ 倍なのに、右辺はちがう' };
  }
  const sing2Check = (p, A, B, ok) => {
    if (!near(detNum(A), 0)) return '行列式が0でない';
    const cons = near(A[1][0] * B[0], A[0][0] * B[1]);
    if (cons !== ok) return '右辺の比';
    if (!ok) return p.a === '答えはない' || `答え ${p.a}`;
    const m = /x=([^$]*)\$/.exec(p.a); if (!m) return `答え ${p.a}`;
    for (const y of [-1.3, 0.4, 2.2]) { const x = ev(m[1], { y }); if (!near(A[0][0] * x + A[0][1] * y, B[0]) || !near(A[1][0] * x + A[1][1] * y, B[1])) return `y=${y} で式をみたさない`; }
    return true;
  };
  const BAN40 = new Set(['2,3;2,1', '4,2;2,4']);
  const BAN40b = new Set(['420,300', '12,0', '9,6']);
  add({
    id: '7-40', part: 3, chap: '7-5② 例題2・3', stars: 1,
    title: '$A\\vec x=\\vec b$ は $\\vec x=A^{-1}\\vec b$（左からかける）。右辺に0があれば、逆行列の1列（2列）だけ',
    mark: '2文字の連立方程式。$A\\vec x=\\vec b$ の形。右辺だけが変わる回路。',
    futsu: ['加減法で、$x$ を消す式と', '$y$ を消す式を作って、', '1つずつ解く', '（右辺が変わるたびに、はじめから）。'],
    raku: ['$\\begin{pmatrix}2&3\\\\2&1\\end{pmatrix}\\vec x=\\begin{pmatrix}420\\\\300\\end{pmatrix}$', '→ $\\frac{1}{-4}\\begin{pmatrix}1&-3\\\\-2&2\\end{pmatrix}\\begin{pmatrix}420\\\\300\\end{pmatrix}=\\begin{pmatrix}120\\\\60\\end{pmatrix}$', '回路 $\\begin{pmatrix}4&2\\\\2&4\\end{pmatrix}$、電圧 $(12,\\ 0)$', '→ 逆行列の1列めの12倍で $(4,\\ -2)$'],
    why: '$A\\vec x=\\vec b$ の両辺に、左から $A^{-1}$ をかけると、$A^{-1}A=I$ で $\\vec x=A^{-1}\\vec b$（7-5②）。$A$ は $\\vec x$ の左にいるので、消すための $A^{-1}$ も左。逆行列は係数だけで決まるので、右辺が変わっても同じ逆行列が使える。右辺の2行めが0なら、逆行列の1列めだけが効く。',
    caution: '右からかけた $\\vec bA^{-1}$ は、大きさが合わず計算できない。行列式が0なら逆行列はなく、答えは無数かない（7-45）。答えは、元の式に入れて確かめる。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '18mm', s3: '34mm', trap: '40mm' }, boxh: { s2: '12mm' },
    fits(q) {
      if (/s\\vec a\+t\\vec b/.test(q)) return true;
      if (/k|掃き出|最小二乗|行列式|ずれ|変える|変わる/.test(q)) return false;
      const S = parseSysM(q);
      return !!S && S.A.length === 2 && !near(detNum(S.A), 0);
    },
    steps: {
      // 答えは整数（行列式は ±1・±2・±4）
      s1(r) {
        const A = matDet(r, [1, -1, 2, -2, 4, -4], 1, 6); if (!A || BAN40.has(keyM(A))) return null;
        const sol = [r.int(-3, 9), r.int(-3, 9)], b = [A[0][0] * sol[0] + A[0][1] * sol[1], A[1][0] * sol[0] + A[1][1] * sol[1]];
        if (BAN40b.has(b.join(','))) return null;
        return { q: `連立方程式 ${eqs(A, b, ['x', 'y'])} を、逆行列を使って解いた答え`, a: `$x=${sol[0]}$、$y=${sol[1]}$`, key: keyM(A) + '|' + b,
          easy: `$A^{-1}=${invTeX(A)}$ を左からかける：$${invTeX(A)}${vec(b)}=${vec(sol)}$`, easyCheck: false, verify: p => solves(p, A, b, ['x', 'y']) };
      },
      // 右辺に0（逆行列の1列だけ）
      s2(r) {
        const A = matDet(r, [1, 2, 4, 5, -2, -4, 8], -2, 6); if (!A || BAN40.has(keyM(A))) return null;
        const i0 = r.int(0, 1), beta = r.int(1, 12), b = i0 === 0 ? [beta, 0] : [0, beta];
        const X = Mat.inv(Mat.make(A)), sol = [F.mul(X[0][i0], fr(beta)), F.mul(X[1][i0], fr(beta))];
        if (!sol.every(v => v[1] === 1) || BAN40b.has(b.join(','))) return null;   // 答えは整数の組（小数 −16.5 などを出さない。R1-32）
        return { q: `$${pm(A)}\\vec x=${vec(b)}$ の $\\vec x$`, a: `$${vec(sol)}$`, key: keyM(A) + '|' + b, calc: { kind: 'mat', want: sol.map(v => [v]) },
          easy: `右辺の${i0 ? 1 : 2}行めが0なので、$A^{-1}=${invTeX(A)}$ の${i0 + 1}列めの $${beta}$ 倍`, easyCheck: false };
      },
      // 回路の電流、ななめの物差し
      s3(r) {
        if (turn(r, '40s3', 2) === 0) {
          const [p0, c0] = r.pick([[3, 1], [5, 2], [3, 2], [6, 2], [5, 1], [4, 1], [6, 3], [7, 2]]), A = [[p0, c0], [c0, p0]];
          const sol = [r.int(-2, 4), r.int(-2, 4)].map(v => v + r.pick([0, 0, 0.5])), b = [A[0][0] * sol[0] + A[0][1] * sol[1], A[1][0] * sol[0] + A[1][1] * sol[1]];
          if (!Number.isInteger(b[0]) || !Number.isInteger(b[1]) || b[0] <= 0 || (!sol[0] && !sol[1])) return null;
          return { q: `回路の式 ${eqs(A, b, ['I_1', 'I_2'])}（電圧は V、電流は A）を、逆行列を使って解いたときの電流 $I_1$、$I_2$`, a: `$I_1=${fmt(sol[0])}$、$I_2=${fmt(sol[1])}$`, key: keyM(A) + '|' + b,
            easy: `$A^{-1}=${invTeX(A)}$。$${invTeX(A)}${vec(b)}=${vec(sol.map(fmt))}$${sol.some(v => v < 0) ? '（マイナスは、矢印と反対向き）' : ''}`, easyCheck: false, verify: p => solves(p, A, b, ['I_1', 'I_2']) };
        }
        const A = matDet(r, [1, -1, 2, 3, 5, -2, -3, -5], -1, 4); if (!A || BAN40.has(keyM(A))) return null;
        const sol = [r.intNot(-2, 3, v => v === 0), r.intNot(-2, 3, v => v === 0)], b = [A[0][0] * sol[0] + A[0][1] * sol[1], A[1][0] * sol[0] + A[1][1] * sol[1]];
        return { q: `ななめの物差し $\\vec a=(${A[0][0]},\\ ${A[1][0]})$、$\\vec b=(${A[0][1]},\\ ${A[1][1]})$ で、$(${b[0]},\\ ${b[1]})=s\\vec a+t\\vec b$ となる $s$、$t$`, a: `$s=${sol[0]}$、$t=${sol[1]}$`, key: keyM(A) + '|' + b + 'st',
          easy: `2本を列にならべた $${pm(A)}\\begin{pmatrix}s\\\\t\\end{pmatrix}=${vec(b)}$。$${invTeX(A)}${vec(b)}=${vec(sol)}$`, easyCheck: false, verify: p => solves(p, A, b, ['s', 't']) };
      },
      // わな：行列式が0（逆行列がない。7-45）
      trap(r) {
        const g = sing2(r);
        return dest({ q: `連立方程式 ${eqs(g.A, g.B, ['x', 'y'])} を、逆行列を使って解いた答え`, a: g.ans, key: 't40' + keyM(g.A) + g.B,
          verify: p => sing2Check(p, g.A, g.B, g.ok) },
          '7-40', `行列式が $${g.A[0][0]}\\times${par(g.A[1][1])}-${par(g.A[0][1])}\\times${par(g.A[1][0])}=0$ なので逆行列はない。${g.why}`, ['7-45']);
      },
    },
  });

  // ================================================================ 7-41
  const BAN41 = BAN40;
  // クラメルの公式の楽な形：x（j=0）か y（j=1）
  function cramer(A, b, j, names) {
    const Aj = A.map((row, i) => row.map((x, k) => (k === j ? b[i] : x))), D = det2(A), N = det2(Aj);
    // 同じ値を「$=4=4$」と2回書かない（R1-13）：分母が1のときと、約分できないときは、最後の「＝」を書かない
    const mid = D === 1 ? String(N) : `\\frac{${N}}{${D}}`, fin = F.tex(fr(N, D));
    return { val: fr(N, D), tex: `$${names[j]}=\\frac{${detNoEq(Aj)}}{${D}}=${mid}${fin === mid ? '' : '=' + fin}$` };
  }
  const detNoEq = A => `${par(cell(A[0][0]))}\\times${par(cell(A[1][1]))}-${par(cell(A[0][1]))}\\times${par(cell(A[1][0]))}`;
  add({
    id: '7-41', part: 3, chap: '7-5②（もっと）', stars: 1,
    title: 'クラメルの公式：$x=\\dfrac{\\det(\\text{1列めを右辺にかえた行列})}{\\det A}$（$x$ だけほしいとき）',
    mark: '2文字の連立方程式で、1つの文字だけを聞かれたとき。',
    futsu: ['逆行列を作って右辺にかけ、', '2つの文字を両方出してから、', 'ほしいほうを読む。'],
    raku: ['$2x+3y=420$、$2x+y=300$ の $x$', '$=\\frac{420\\times1-3\\times300}{-4}=\\frac{-480}{-4}=120$', '$y$ なら2列めを右辺に：$\\frac{2\\times300-420\\times2}{-4}=60$'],
    why: '逆行列をかけて成分を書き出すと、$x=\\frac{dp-bq}{ad-bc}$、$y=\\frac{aq-cp}{ad-bc}$。分子は「1列め（$x$ なら）を右辺 $(p,\\ q)$ に取りかえた行列」の行列式になっている（7-5②もっと知りたい）。ほしい文字の分だけ計算すればよい。',
    caution: '分母はいつも元の行列式 $\\det A$。取りかえるのは、ほしい文字の列（$x$ は1列め、$y$ は2列め）。分子のたすきの順を、元の行列と同じにする。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm', boxh: { s3: '11mm' },
    fits(q) {
      if (/k|掃き出|最小二乗|ずれ|変える/.test(q) || !/(の \$[xyz]\$|の \$I_\{?[12]\}?\$|だけ)/.test(q)) return false;
      const S = parseSys(q);
      return !!S && S.A.length === 2 && !near(detNum(S.A), 0);
    },
    steps: {
      // x だけ（答えは整数）
      s1(r) {
        const A = matDet(r, [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6], 1, 6, true); if (!A || BAN41.has(keyM(A))) return null;
        const sol = [r.intNot(-3, 9, v => v === 0), r.intNot(-3, 9, v => v === 0)], b = [A[0][0] * sol[0] + A[0][1] * sol[1], A[1][0] * sol[0] + A[1][1] * sol[1]];
        const c = cramer(A, b, 0, ['x', 'y']);
        if (!ansOK(r, '7-41', String(sol[0]), 2, keyM(A) + '|' + b)) return null;   // 同じ答えを3回出さない（わなもふくめて。R1-20）
        return { q: `連立方程式 ${eqs(A, b, ['x', 'y'])} の $x$`, a: `$${sol[0]}$`, key: keyM(A) + '|' + b, easy: c.tex, easyCheck: false,
          verify: p => valIs(p, solveNum(A, b)[0]) };
      },
      // y だけ（マイナスの係数）
      s2(r) {
        const A = matDet(r, [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 7, -7], -4, 6, true); if (!A || BAN41.has(keyM(A))) return null;
        const sol = [r.intNot(-4, 8, v => v === 0), r.intNot(-4, 8, v => v === 0)], b = [A[0][0] * sol[0] + A[0][1] * sol[1], A[1][0] * sol[0] + A[1][1] * sol[1]];
        const c = cramer(A, b, 1, ['x', 'y']);
        if (!ansOK(r, '7-41', String(sol[1]), 2, keyM(A) + '|' + b)) return null;
        return { q: `連立方程式 ${eqs(A, b, ['x', 'y'])} の $y$`, a: `$${sol[1]}$`, key: keyM(A) + '|' + b, easy: c.tex, easyCheck: false,
          verify: p => valIs(p, solveNum(A, b)[1]) };
      },
      // 答えが分数、回路の電流の片方
      s3(r) {
        const A = matDet(r, [3, -3, 5, -5, 7, -7, 4, -4], -3, 6, true); if (!A || BAN41.has(keyM(A))) return null;
        const b = [r.intNot(-5, 12, v => v === 0), r.int(-5, 12)], j = r.int(0, 1), c = cramer(A, b, j, ['x', 'y']);
        if (c.val[1] === 1 || c.val[1] > 7 || Math.abs(c.val[0]) > 30 || !ansOK(r, '7-41', F.tex(c.val), 2, keyM(A) + '|' + b)) return null;
        if (turn(r, '41s3', 2) === 0) {
          return { q: `連立方程式 ${eqs(A, b, ['x', 'y'])} の $${'xy'[j]}$（分数で）`, a: `$${F.tex(c.val)}$`, key: keyM(A) + '|' + b, easy: c.tex, easyCheck: false,
            verify: p => valIs(p, solveNum(A, b)[j]) };
        }
        const c2 = cramer(A, b, j, ['I_1', 'I_2']);
        return { q: `回路の式 ${eqs(A, b, ['I_1', 'I_2'])}（電圧は V、電流は A）の $I_${j + 1}$（分数で）`, a: `$${F.tex(c2.val)}$`, key: keyM(A) + '|' + b, easy: c2.tex, easyCheck: false,
          verify: p => valIs(p, solveNum(A, b)[j]) };
      },
      // わな：3文字の連立方程式（3×3 の行列式を計算するより、7-43 の掃き出し法が楽。R1-10）
      trap(r) {
        const g = sys3(r, 1); if (!g || !ansOK(r, '7-41', String(g.sol[0]), 2, 't41' + keyM(g.A) + g.b)) return null;
        return dest({ q: `連立方程式 ${eqs(g.A, g.b, ['x', 'y', 'z'])} の $x$`, a: `$${g.sol[0]}$`, key: 't41' + keyM(g.A) + g.b,
          verify: p => valIs(p, solveNum(g.A, g.b)[0]) },
          '7-41', '文字が3つ。クラメルの公式は3×3 でも同じ形だが、3×3 の行列式を2つ（$\\det A$ と、1列めを右辺にかえた行列式）計算するより、掃き出し法が楽。掃き出し法で解いて $x$ を読む', ['7-43']);
      },
    },
  });

  // 3文字の連立方程式：A = L U（L は下が整数・対角1、U は上が整数・対角 ±1、最後だけ d）。答えは整数（7-41・7-43 で使う）
  function sys3(r, dLast, swap) {
    for (let it = 0; it < 200; it++) {
      // swap：2行めの x の係数を0にして作り、1行めと入れかえて出す（はじめに ①↔② がいる）
      const L = [[1, 0, 0], [swap ? 0 : r.int(-2, 2), 1, 0], [r.int(-2, 2), r.int(-2, 2), 1]];
      const U = [[1, r.int(-2, 2), r.int(-2, 2)], [0, r.pick([1, 1, -1]), r.int(-2, 3)], [0, 0, dLast || 1]];
      let A = Mat.mul(Mat.make(L), Mat.make(U)).map(row => row.map(x => x[0]));
      if (swap) A = [A[1], A[0], A[2]];
      if (A.flat().some(x => Math.abs(x) > 5) || A.flat().filter(x => x === 0).length > 3 || A.some(row => row.filter(x => x).length < 2)) continue;
      if (Math.abs(detNum(A)) < 0.5) continue;
      const sol = [r.int(-2, 4), r.int(-2, 4), r.int(-2, 4)], b = A.map(row => row.reduce((s, x, j) => s + x * sol[j], 0));
      if (sol.every(v => v === 0)) continue;
      return { A, b, sol };
    }
    return null;
  }
  const op21 = m => (m > 0 ? `②－${m === 1 ? '' : m + '×'}①` : `②＋${m === -1 ? '' : -m + '×'}①`);   // 「②－2×①」「②＋①」

  // ================================================================ 7-42
  // 行列式が ±1 の、成分の小さい2×2（逆行列も整数）
  const unit2 = (r, lo, hi) => matDet(r, [1, 1, -1], lo, hi);
  const pmF = X => Mat.tex(X, { factor: true });
  const BAN42 = new Set(['2,1;1,1', '1,0;2,1', '1,-1;-1,2', '1,0;-2,1']);
  // 例の行列（と答え）の、入れかえ・転置もよける（R1-34）
  const CAN42 = new Set([[[2, 1], [1, 1]], [[1, 0], [2, 1]], [[1, -1], [-1, 2]], [[1, 0], [-2, 1]], [[1, -1], [-3, 4]]].map(canon2));
  const bad42 = X => BAN42.has(keyM(X)) || CAN42.has(canon2(X));
  const bad42m = X => CAN42.has(canon2(X.map(row => row.map(f => f[0] / f[1]))));   // 答えの行列（分数）
  add({
    id: '7-42', part: 3, chap: '7-5③ 例題4', stars: 1,
    title: 'つないだ機械の逆は順番も逆：$(AB)^{-1}=B^{-1}A^{-1}$',
    mark: '$(AB)^{-1}$、$(ABC)^{-1}$。$A^{-1}$ と $B^{-1}$ がわかっているとき。',
    futsu: ['$AB$ を成分ごとに計算してから、', 'その行列の行列式を出して、', '逆行列を作る。'],
    raku: ['$A=\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}$、$B=\\begin{pmatrix}1&0\\\\2&1\\end{pmatrix}$', '→ $B^{-1}A^{-1}=\\begin{pmatrix}1&0\\\\-2&1\\end{pmatrix}\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}$', '$=\\begin{pmatrix}1&-1\\\\-3&4\\end{pmatrix}$（$A^{-1}B^{-1}$ ではない）'],
    why: '$AB$ は「$B$ をかけてから $A$ をかける」機械。元にもどすときは、あとからした $A$ を先にもどす（くつ下とくつ）。$(B^{-1}A^{-1})(AB)=B^{-1}(A^{-1}A)B=B^{-1}B=I$ なので、$B^{-1}A^{-1}$ が $AB$ の逆行列（7-5③）。',
    caution: '$A^{-1}B^{-1}$ ではない（まん中が $B^{-1}A$ になって消えない）。行列はかける順で答えが変わるので、右に書いた行列から先にもどすと覚える。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 1 },
    cols: 1,
    boxw: { s1: '24mm', s2: '24mm', s3: '28mm', trap: '28mm' }, boxh: '12mm',
    fits(q) { return /\((?:[A-C]){2,3}\)\^\{-1\}|\(A\^\{?2\}?\)\^\{-1\}/.test(q.replace(/\\bigl|\\bigr|\\left|\\right|\s/g, '')); },
    steps: {
      // A^{-1}・B^{-1} がわかっているとき
      s1(r) {
        const Ai = unit2(r, -2, 3), Bi = unit2(r, -2, 3); if (!Ai || !Bi || bad42(Ai) || bad42(Bi) || keyM(Ai) === keyM(Bi)) return null;
        const X = Mat.mul(Mat.make(Bi), Mat.make(Ai)), Y = Mat.mul(Mat.make(Ai), Mat.make(Bi));
        if (Mat.eq(X, Y) || bad42m(X)) return null;
        return { q: `$A^{-1}=${pm(Ai)}$、$B^{-1}=${pm(Bi)}$ のとき、$(AB)^{-1}$`, a: `$${Mat.tex(X)}$`, key: 'i' + keyM(Ai) + '|' + keyM(Bi), calc: { kind: 'mat', want: X },
          easy: `$AB$ を作らずに、$B^{-1}A^{-1}=${pm(Bi)}${pm(Ai)}=${Mat.tex(X)}$`, easyCheck: false };
      },
      // A・B がわかっているとき（行列式は ±1）。(BA)^{-1} も
      s2(r) {
        const A = unit2(r, -1, 3), B = unit2(r, -1, 3); if (!A || !B || bad42(A) || bad42(B) || keyM(A) === keyM(B)) return null;
        const ba = r.chance(0.3), Ai = Mat.inv(Mat.make(A)), Bi = Mat.inv(Mat.make(B)), X = ba ? Mat.mul(Ai, Bi) : Mat.mul(Bi, Ai);
        if (Mat.eq(Mat.mul(Bi, Ai), Mat.mul(Ai, Bi)) || bad42m(X)) return null;
        return { q: `$A=${pm(A)}$、$B=${pm(B)}$ のとき、$(${ba ? 'BA' : 'AB'})^{-1}$`, a: `$${Mat.tex(X)}$`, key: keyM(A) + '|' + keyM(B) + ba, calc: { kind: 'mat', want: X },
          easy: ba ? `$A^{-1}B^{-1}=${Mat.tex(Ai)}${Mat.tex(Bi)}=${Mat.tex(X)}$` : `$B^{-1}A^{-1}=${Mat.tex(Bi)}${Mat.tex(Ai)}=${Mat.tex(X)}$`, easyCheck: false };
      },
      // 3つの積、A^2、片方だけ逆行列がわかっている
      s3(r) {
        const k = turn(r, '42s3', 2);
        if (k === 0) {
          const Ai = unit2(r, -1, 2), Bi = unit2(r, -1, 2), Ci = unit2(r, -1, 2);
          if (!Ai || !Bi || !Ci || [Ai, Bi, Ci].some(X => bad42(X))) return null;
          const X = Mat.mul(Mat.mul(Mat.make(Ci), Mat.make(Bi)), Mat.make(Ai));
          if (X.flat().some(x => Math.abs(x[0]) > 12) || bad42m(X)) return null;
          return { q: `$A^{-1}=${pm(Ai)}$、$B^{-1}=${pm(Bi)}$、$C^{-1}=${pm(Ci)}$ のとき、$(ABC)^{-1}$`, a: `$${Mat.tex(X)}$`, key: 'c' + keyM(Ai) + keyM(Bi) + keyM(Ci), calc: { kind: 'mat', want: X },
            easy: `いちばん右の $C$ から先にもどす：$C^{-1}B^{-1}A^{-1}=${Mat.tex(X)}$`, easyCheck: false };
        }
        const Ai = unit2(r, -2, 3), B = unit2(r, -1, 3); if (!Ai || !B || bad42(Ai) || bad42(B)) return null;
        const Bi = Mat.inv(Mat.make(B)), X = Mat.mul(Bi, Mat.make(Ai));
        if (bad42m(X)) return null;
        return { q: `$A^{-1}=${pm(Ai)}$、$B=${pm(B)}$ のとき、$(AB)^{-1}$`, a: `$${Mat.tex(X)}$`, key: 'h' + keyM(Ai) + '|' + keyM(B), calc: { kind: 'mat', want: X },
          easy: `$B^{-1}=${Mat.tex(Bi)}$ を作って、$B^{-1}A^{-1}=${Mat.tex(X)}$`, easyCheck: false };
      },
      // わな：和の逆行列（きまりがない）
      trap(r) {
        const A = rand2(r, -1, 3, 0.3), B = rand2(r, -1, 3, 0.3), S = Mat.add(Mat.make(A), Mat.make(B)), d = F.val(Mat.det(S));
        if (!d || !det2(A) || !det2(B) || Math.abs(d) > 12 || bad42(A) || bad42(B)) return null;
        const X = Mat.inv(S);
        return dest({ q: `$A=${pm(A)}$、$B=${pm(B)}$ のとき、$(A+B)^{-1}$`, a: `$${pmF(X)}$`, key: 't42' + keyM(A) + '|' + keyM(B), calc: { kind: 'mat', want: X } },
          '7-42', `和の逆行列にはきまりがない（$A^{-1}+B^{-1}$ ではない）。$A+B=${Mat.tex(S)}$ を作ってから、ふつうに逆行列を作る`, ['7-03']);   // 和を作るのは 7-03（U-4・R1-11）
      },
    },
  });

  // ================================================================ 7-43
  // 掃き出し法（ガウス・ジョルダン）の操作を、教科書の書き方（「②－2×①」「③÷7」「①↔②」）で。A は n×n、B は n×m（右辺の列）
  const CIR = ['①', '②', '③'];
  const numT = f => (f[1] === 1 ? String(f[0]) : dec(f) || `$${F.tex(f)}$`);
  function gjOps(A, B) {
    const n = A.length, W = A.map((row, i) => row.concat(B[i]).map(x => (Array.isArray(x) ? x : fr(x)))), ops = [];
    for (let c = 0; c < n; c++) {
      let p = c; while (p < n && W[p][c][0] === 0) p++;
      if (p === n) return null;
      if (p !== c) { [W[p], W[c]] = [W[c], W[p]]; ops.push(`${CIR[c]}$\\leftrightarrow$${CIR[p]}`); }   // ↔ は式の矢印（教科書 7-5④。R1-23）
      const pv = W[c][c];
      if (!(pv[0] === 1 && pv[1] === 1)) { W[c] = W[c].map(x => F.div(x, pv)); ops.push(pv[0] === -1 && pv[1] === 1 ? `${CIR[c]}×(－1)` : `${CIR[c]}÷${pv[0] < 0 ? '(－' + numT([-pv[0], pv[1]]) + ')' : numT(pv)}`); }
      for (let i = 0; i < n; i++) {
        if (i === c || W[i][c][0] === 0) continue;
        const f = W[i][c], a = [Math.abs(f[0]), f[1]];
        W[i] = W[i].map((x, k) => F.sub(x, F.mul(f, W[c][k])));
        ops.push(`${CIR[i]}${f[0] > 0 ? '－' : '＋'}${a[0] === 1 && a[1] === 1 ? '' : numT(a) + '×'}${CIR[c]}`);
      }
    }
    return { ops, W };
  }
  // 係数と右辺の表（たて線つき）
  const aug = (A, B) => `\\left(\\begin{array}{${'r'.repeat(A[0].length)}|${'r'.repeat(B[0].length)}}${A.map((row, i) => row.concat(B[i]).map(x => cell(x, { frac: true })).join('&')).join('\\\\')}\\end{array}\\right)`;
  const BAN43 = new Set(['0,1,3;1,1,1;1,-1,2', '1,2,1;1,1,-1;2,-1,1', '1,1,1;1,-1,0;0,1,-1', '1,1,1;1,2,-1;2,-1,1', '1,1,0;0,1,1;1,0,1', '0,1,2;1,1,1;1,2,0']);
  const ansXYZ = (sol, names) => sol.map((v, i) => `$${(names || ['x', 'y', 'z'])[i]}=${fmt(v)}$`).join('、');
  add({
    id: '7-43', part: 3, chap: '7-5④ 例題5', stars: 1,
    title: '掃き出し法は1列ずつ、ななめを1・ほかを0に。ななめが0なら、その列が0でない行と入れかえる。右辺もいっしょに',
    mark: '3文字の連立方程式。「掃き出し法で解こう」。係数と右辺をならべた表。',
    futsu: ['1つの式を $x=\\cdots$ の形にして', 'ほかの2つの式に代入し、', '残った2文字の式で', 'また代入をくり返す。'],
    raku: ['$y+3z=11$、$x+y+z=6$、$x-y+2z=5$', '→ ①$\\leftrightarrow$②、③－①、①－②、③＋2×②、', '③÷7、①＋2×③、②－3×③', '→ $x=1$、$y=2$、$z=3$'],
    why: '表の1行は1つの式。行に数をかける・行から行の何倍かをひく・行を入れかえる、の3つは、加減法で式を変形しただけなので答えは変わらない（7-5④）。左の3列が単位行列 $I$ になれば、各行が $x=\\cdots$、$y=\\cdots$、$z=\\cdots$ と読める。',
    caution: '右辺もいっしょに計算する（1行全体をひく）。ななめにしたい所が0なら、0では割れないので、その列が0でない行と行ごと入れかえる（列は入れかえない）。答えは元の式に入れて確かめる。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 1 },
    cols: 1,
    boxw: { s1: '40mm', s2: '40mm', s3: '40mm', trap: '40mm' },
    fits(q) {
      if (/k|逆行列|\^\{-1\}/.test(q)) return false;
      const S = parseSysM(q);
      if (S && S.A.length === 3) return !near(detNum(S.A), 0);
      return mats(q).some(x => x.env === 'array' && x.rows === 3 && x.cols === 4);
    },
    steps: {
      // ななめが ±1（分数が出ない）
      s1(r) {
        const g = sys3(r, 1); if (!g || BAN43.has(keyM(g.A))) return null;
        const G = gjOps(g.A, g.b.map(v => [v]));
        return { q: `連立方程式 ${eqs(g.A, g.b, ['x', 'y', 'z'])} を、掃き出し法で解いた答え`, a: ansXYZ(g.sol), key: keyM(g.A) + '|' + g.b,
          easy: `$${aug(g.A, g.b.map(v => [v]))}$ を ${G.ops.join('、')}`, easyCheck: false, verify: p => solves(p, g.A, g.b, ['x', 'y', 'z']) };
      },
      // 最後のななめが 2〜7（1回だけわる）
      s2(r) {
        const g = sys3(r, r.pick([2, 3, 5, 7, -2, -3])); if (!g || BAN43.has(keyM(g.A))) return null;
        const G = gjOps(g.A, g.b.map(v => [v]));
        return { q: `連立方程式 ${eqs(g.A, g.b, ['x', 'y', 'z'])} を、掃き出し法で解いた答え`, a: ansXYZ(g.sol), key: keyM(g.A) + '|' + g.b,
          easy: `$${aug(g.A, g.b.map(v => [v]))}$ を ${G.ops.join('、')}`, easyCheck: false, verify: p => solves(p, g.A, g.b, ['x', 'y', 'z']) };
      },
      // はじめに入れかえがいる式、表で書いた式
      s3(r) {
        const t = turn(r, '43s3', 2);
        const g = sys3(r, t === 0 ? r.pick([1, 2, 3, 7]) : r.pick([1, 2, -3]), t === 0); if (!g || BAN43.has(keyM(g.A))) return null;
        const G = gjOps(g.A, g.b.map(v => [v]));
        if (t === 0) {
          return { q: `連立方程式 ${eqs(g.A, g.b, ['x', 'y', 'z'])} を、掃き出し法で解いた答え`, a: ansXYZ(g.sol), key: keyM(g.A) + '|' + g.b,
            easy: `1行めの $x$ の係数が0なので、はじめに ${G.ops.join('、')}`, easyCheck: false, verify: p => solves(p, g.A, g.b, ['x', 'y', 'z']) };
        }
        return { q: `係数と右辺を表にした $${aug(g.A, g.b.map(v => [v]))}$ の連立方程式（文字は $x$、$y$、$z$）を、掃き出し法で解いた答え`, a: ansXYZ(g.sol), key: keyM(g.A) + '|' + g.b,
          easy: G.ops.join('、'), easyCheck: false, verify: p => solves(p, g.A, g.b, ['x', 'y', 'z']) };
      },
      // わな：行列式が0（掃き出すと「0=0」か「0=－1」。7-45）
      trap(r) {
        const g = sing2(r);
        return dest({ q: `連立方程式 ${eqs(g.A, g.B, ['x', 'y'])} を、掃き出し法で解いた答え`, a: g.ans, key: 't43' + keyM(g.A) + g.B,
          verify: p => sing2Check(p, g.A, g.B, g.ok) },
          '7-43', `${op21(g.m)} で2行めの左が全部0になり、ななめを1にできない。右辺が0なら「$0=0$」、0でなければ「$0=$ 数」`, ['7-45']);
      },
    },
  });

  // ================================================================ 7-44
  const BAN44 = new Set(['1,2;3,7', '1,3;2,7', '1,2;2,5', '2,1;1,2']);
  // 3×3 で、逆行列が整数（ななめは ±1）
  function unit3(r) {
    for (let it = 0; it < 200; it++) {
      const L = [[1, 0, 0], [r.int(-2, 2), 1, 0], [r.int(-1, 1), r.int(-2, 2), 1]], U = [[1, r.int(-2, 2), r.int(-1, 1)], [0, 1, r.int(-2, 2)], [0, 0, r.pick([1, 1, -1])]];
      const A = Mat.mul(Mat.make(L), Mat.make(U)).map(row => row.map(x => x[0]));
      if (A.flat().filter(x => x === 0).length > 4 || A.flat().filter(x => x === 0).length < 2 || A.flat().some(x => Math.abs(x) > 5)) continue;
      const X = Mat.inv(Mat.make(A));
      if (X.flat().some(x => Math.abs(x[0]) > 9)) continue;
      return { A, X };
    }
    return null;
  }
  const I2 = [[1, 0], [0, 1]], I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  add({
    id: '7-44', part: 3, chap: '7-5④ 例題6', stars: 1,
    title: '掃き出しで逆行列：$(A\\mid I)$ を、左が $I$ になるまで掃き出す → 右が $A^{-1}$',
    mark: '「掃き出し法で逆行列を求めよう」。3×3 の逆行列。右に $I$ をならべた表。',
    futsu: ['$A\\vec x=\\vec e_x$、$A\\vec x=\\vec e_y$（3×3 なら $\\vec e_z$ も）の', '連立方程式を1つずつ掃き出して、', '答えを列にならべる。'],
    raku: ['$\\left(\\begin{array}{rr|rr}1&2&1&0\\\\3&7&0&1\\end{array}\\right)$', '→ ②－3×①、①－2×②', '→ 右に $\\begin{pmatrix}7&-2\\\\-3&1\\end{pmatrix}$（7-39 の答えと同じ）'],
    why: '行の操作は、どれも「ある行列を左からかける」ことと同じ。全部の操作をまとめた行列を $G$ とすると、左の $A$ は $GA$ に、右の $I$ は $G$ になる。左が $I$ なら $GA=I$ なので、右に出てきた $G$ が $A^{-1}$（7-5④）。右辺が $\\vec e_x$、$\\vec e_y$ の連立方程式を、1回でまとめて解いている。',
    caution: '右の $I$ にも、左と同じ操作をする（行全体）。左が $I$ にならない（行が全部0になる）ときは、逆行列はない。出てきた行列を $A$ にかけて $I$ になるか確かめる。',
    counts: { s1: 3, s2: 2, s3: 3, trap: 1 },
    cols: 1,
    boxw: { s1: '24mm', s2: '30mm', s3: '28mm', trap: '20mm' }, boxh: { s1: '12mm', s2: '16mm', s3: '14mm', trap: '16mm' },
    fits(q) {
      if (/\\vec b|AB|\(A|B\^|連立/.test(q)) return false;
      if (mats(q).some(x => x.env === 'array' && x.cols === 2 * x.rows)) return true;
      return /逆行列|\^\{-1\}/.test(q) && (/掃き出し/.test(q) || mats(q).some(x => x.env === 'pmatrix' && x.rows === 3 && x.cols === 3));
    },
    steps: {
      // 2×2（左上が1、行列式1）を表から
      s1(r) {
        const b = r.intNot(-3, 4, v => v === 0), c = r.intNot(-3, 4, v => v === 0), A = [[1, b], [c, 1 + b * c]];
        if (BAN44.has(keyM(A)) || Math.abs(1 + b * c) > 9 || 1 + b * c === 0) return null;
        const X = Mat.inv(Mat.make(A)), G = gjOps(A, I2);
        return { q: `表 $${aug(A, I2)}$ を掃き出して、右に出る $A^{-1}$`, a: `$${Mat.tex(X)}$`, key: keyM(A), calc: { kind: 'mat', want: X },
          easy: `${G.ops.join('、')}。右が $${pm(A)}^{-1}$`, easyCheck: false };
      },
      // 3×3（ななめは ±1）
      s2(r) {
        const g = unit3(r); if (!g) return null;
        const G = gjOps(g.A, I3);
        return { q: `掃き出し法で、$${pm(g.A)}$ の逆行列`, a: `$${Mat.tex(g.X)}$`, key: keyM(g.A), calc: { kind: 'mat', want: g.X },
          easy: `$(A\\mid I)$ を ${G.ops.join('、')}`, easyCheck: false };
      },
      // はじめに入れかえがいる2×2、ななめが1でない2×2（分数）
      s3(r) {
        if (turn(r, '44s3', 2) === 0) {
          const c = r.intNot(-3, 4, v => v === 0), d = r.int(-3, 4), b = r.pick([1, -1]), A = [[0, b], [c, d]];
          if (BAN44.has(keyM(A))) return null;
          const X = Mat.inv(Mat.make(A)), G = gjOps(A, I2);
          return { q: `掃き出し法で、$${pm(A)}$ の逆行列`, a: `$${pmF(X)}$`, key: keyM(A), calc: { kind: 'mat', want: X },
            easy: `左上が0なので、はじめに ${G.ops.join('、')}`, easyCheck: false };
        }
        const A = matDet(r, [2, 3, -2, 5, 1, -1], 1, 5); if (!A || BAN44.has(keyM(A)) || A[0][0] !== 2) return null;
        const X = Mat.inv(Mat.make(A)), G = gjOps(A, I2);
        return { q: `掃き出し法で、$${pm(A)}$ の逆行列`, a: `$${pmF(X)}$`, key: keyM(A), calc: { kind: 'mat', want: X },
          easy: `${G.ops.join('、')}`, easyCheck: false };
      },
      // わな：逆行列ではなく A^{-1}b だけがほしい（右辺だけ掃き出す。7-43）
      trap(r) {
        const g = sys3(r, 1); if (!g) return null;
        return dest({ q: `$A=${pm(g.A)}$、$\\vec b=${vec(g.b)}$ のとき、$A^{-1}\\vec b$`, a: `$${vec(g.sol)}$`, key: 't44' + keyM(g.A) + g.b, calc: { kind: 'mat', want: g.sol.map(v => [v]) } },
          '7-44', '$A^{-1}$ を全部作らなくてよい。$A\\vec x=\\vec b$ の答えなので、右辺 $\\vec b$ だけをならべて掃き出す', ['7-43']);
      },
    },
  });

  // ================================================================ 7-45
  const BAN45 = new Set(['1,2;2,4', '3,-1;6,-2', '2,6;1,3']);
  add({
    id: '7-45', part: 3, chap: '7-4④・7-5⑥ 例題7', stars: 1,
    title: '行列式が0の連立方程式は、右辺も同じ比なら答えは無数、ちがえば答えなし（掃き出すと「$0=0$」か「$0=-1$」）',
    mark: '係数の行が比例している2文字の連立方程式。「答えは無数にあるか、ないか」。',
    futsu: ['加減法で $x$ を消そうとして、', '$y$ も消えてしまったら、', '残った式を見て考える。'],
    raku: ['$x+2y=3$、$2x+4y=6$', '→ ②－2×①：$(0,\\ 0\\mid0)$「$0=0$」→ 無数（$x=3-2y$）', '$2x+4y=5$ なら「$0=-1$」→ 答えはない'],
    why: '行列式が0なら、2つめの式の左辺は1つめの何倍か（7-4④）。右辺も同じ倍なら、2つの式は同じことを言っていて（2本の直線が重なる）、のこる式は1つなので答えは無数。右辺がちがえば、2本の直線は平行で交わらず、答えはない（7-5⑥）。',
    caution: '行列式が0でも「答えはない」とはかぎらない（右辺の比を見る）。答えが無数のときは、$x=3-2y$ のように、1つの文字を使って答えを書く。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '40mm', s3: '30mm', trap: '40mm' },
    fits(q) {
      if (/\$[ka]\$/.test(q) && /無数|答えがない|答えはない/.test(q)) return true;
      const S = parseSys(q);
      return !!S && S.A.length === 2 && near(detNum(S.A), 0);
    },
    steps: {
      // 無数か、ないか（ことばで）
      s1(r) {
        const g = sing2(r); if (BAN45.has(keyM(g.A))) return null;
        return { q: `連立方程式 ${eqs(g.A, g.B, ['x', 'y'])} の答えは、無数にあるか、ないか`, a: g.ok ? '無数にある' : 'ない', key: keyM(g.A) + '|' + g.B,
          easy: `${op21(g.m)} で2行めが「$0=${g.B[1] - g.m * g.B[0]}$」`, easyCheck: false,
          verify: p => (p.a === (near(g.A[1][0] * g.B[0], g.A[0][0] * g.B[1]) ? '無数にある' : 'ない') && near(detNum(g.A), 0)) || `答え ${p.a}` };
      },
      // 無数なら x を y の式で
      s2(r) {
        const g = sing2(r); if (BAN45.has(keyM(g.A))) return null;
        return { q: `連立方程式 ${eqs(g.A, g.B, ['x', 'y'])} を掃き出して、答えが無数なら $x$ を $y$ の式で、ないなら「ない」と答えよう`, a: g.ok ? g.ans.replace('答えは無数（', '無数（') : 'ない', key: keyM(g.A) + '|' + g.B,
          easy: `${op21(g.m)} で2行めが「$0=${g.B[1] - g.m * g.B[0]}$」。${g.why}`, easyCheck: false,
          verify: p => sing2Check({ a: p.a === 'ない' ? '答えはない' : p.a }, g.A, g.B, g.ok) };
      },
      // k・a がいくつのとき
      s3(r) {
        const g = sing2(r); if (BAN45.has(keyM(g.A))) return null;
        if (turn(r, '45s3', 2) === 0) {
          const k = g.m * g.B[0];
          return { q: `連立方程式 ${eqs([g.A[0]], [g.B[0]], ['x', 'y'])}、$${lin(g.A[1], ['x', 'y'])}=k$ の答えが無数にある $k$`, a: `$k=${k}$`, key: keyM(g.A) + '|k',
            easy: `左辺は1つめの $${g.m}$ 倍なので、右辺も $${g.m}$ 倍：$${par(g.m)}\\times ${g.B[0]}=${k}$`, easyCheck: false,
            verify: p => { const kk = assigns(p.a).k; return (near(g.A[1][0] * g.B[0], g.A[0][0] * kk) && near(detNum(g.A), 0)) || `k=${kk}`; } };
        }
        // 1つめの x の係数を a にする。答えがない a
        const B2 = g.ok ? g.B[1] + r.pick([1, -1, 2]) : g.B[1], aV = g.A[0][0];
        if (near(g.A[1][0] * g.B[0], aV * B2)) return null;
        return { q: `連立方程式 $${lin([1, g.A[0][1]], ['ax', 'y'])}=${g.B[0]}$、$${lin(g.A[1], ['x', 'y'])}=${B2}$ の答えがない $a$`, a: `$a=${aV}$`, key: keyM(g.A) + '|a' + B2,
          easy: `行列式 $${par('a')}\\times ${par(g.A[1][1])}-${par(g.A[0][1])}\\times ${par(g.A[1][0])}=0$ から $a=${aV}$。そのとき右辺の比がちがうので答えはない`, easyCheck: false,
          verify: p => { const a = assigns(p.a).a; const D = a * g.A[1][1] - g.A[0][1] * g.A[1][0]; return (near(D, 0) && !near(g.A[1][0] * g.B[0], a * B2)) || `a=${a}`; } };
      },
      // わな：比例していない（行列式が0でない）→ 答えはちょうど1つ（7-40）
      trap(r) {
        const A = matDet(r, [1, -1, 2, -2, 3], 1, 5, true); if (!A || BAN45.has(keyM(A))) return null;
        const sol = [r.int(-3, 5), r.int(-3, 5)], b = [A[0][0] * sol[0] + A[0][1] * sol[1], A[1][0] * sol[0] + A[1][1] * sol[1]];
        return dest({ q: `連立方程式 ${eqs(A, b, ['x', 'y'])} の答えは、無数にあるか、ないか`, a: `ちょうど1つ（$x=${sol[0]}$、$y=${sol[1]}$）`, key: 't45' + keyM(A) + b,
          verify: p => solves(p, A, b, ['x', 'y']) },
          '7-45', `行列式は $${det2(A)}$ で0ではない（2つの式は比例していない）。逆行列で解くと答えはちょうど1つ`, ['7-40']);
      },
    },
  });

  // ================================================================ 7-46
  // 点の組の和と、最小二乗の直線（分数で）
  function lsq(P) {
    const n = P.length, Sx = P.reduce((s, p) => s + p[0], 0), Sy = P.reduce((s, p) => F.add(s, D10(p[1])), fr(0));
    const Sxx = P.reduce((s, p) => s + p[0] * p[0], 0), Sxy = P.reduce((s, p) => F.add(s, F.mul(fr(p[0]), D10(p[1]))), fr(0));
    const Dt = n * Sxx - Sx * Sx;
    const a = F.div(F.sub(F.mul(fr(n), Sxy), F.mul(fr(Sx), Sy)), fr(Dt)), b = F.div(F.sub(F.mul(fr(Sxx), Sy), F.mul(fr(Sx), Sxy)), fr(Dt));
    return { n, Sx, Sy, Sxx, Sxy, Dt, a, b };
  }
  const D10 = v => F.fromDec(String(v));   // 0.5 → [1, 2]
  const lineAB = (a, b) => `y=${a[0] === 1 && a[1] === 1 ? '' : a[0] === -1 && a[1] === 1 ? '-' : fx(a)}x${b[0] === 0 ? '' : (b[0] > 0 ? '+' : '') + fx(b)}`;
  const ptsTeX = P => P.map(p => `$(${p[0]},\\ ${p[1]})$`).join('、');
  function lsqEasy(L) {
    return `$x$ の和 ${L.Sx}、$x^{2}$ の和 ${L.Sxx}、$y$ の和 ${fx(L.Sy)}、$xy$ の和 ${fx(L.Sxy)}。$${pm([[L.Sxx, L.Sx], [L.Sx, L.n]])}\\begin{pmatrix}a\\\\b\\end{pmatrix}=${pm([[fx(L.Sxy)], [fx(L.Sy)]])}$、行列式 ${L.Dt}`;
  }
  // 答えの直線が、ずれの2乗の和をいちばん小さくするか（検算：平均からの式と、少し動かした直線）
  function lsqCheck(p, P) {
    const m = /\$y=([^$]*)\$/.exec(p.a); if (!m) return `答え ${p.a} が読めない`;
    const f = x => ev(m[1], { x }), a = f(1) - f(0), b = f(0);
    const n = P.length, mx = P.reduce((s, q) => s + q[0], 0) / n, my = P.reduce((s, q) => s + q[1], 0) / n;
    const A = P.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0) / P.reduce((s, q) => s + (q[0] - mx) ** 2, 0), B = my - A * mx;
    if (!near(a, A, 1e-9) || !near(b, B, 1e-9)) return `答え ${p.a}（a=${A}、b=${B}）`;
    const S = (aa, bb) => P.reduce((s, q) => s + (q[1] - aa * q[0] - bb) ** 2, 0), S0 = S(a, b);
    for (const [da, db] of [[0.01, 0], [-0.01, 0], [0, 0.01], [0, -0.01]]) if (S(a + da, b + db) < S0) return 'ずれの2乗の和が、もっと小さくなる直線がある';
    return true;
  }
  // 点の組を作る：x は start から n こ。a・b が小数第 k 位まで、点は1本の直線の上にない
  function lsqPts(r, n, start, k, ylo, yhi) {
    for (let it = 0; it < 300; it++) {
      const a0 = r.pick([1, 2, 3, -1, -2, 0.5, 1.5]), b0 = r.int(ylo, yhi);   // だいたいの直線のまわりに、少しずらした点
      const P = Array.from({ length: n }, (_, i) => [start + i, Math.round(b0 + a0 * (start + i) + r.int(-1, 1))]), L = lsq(P);
      if (L.a[0] === 0 || P.some(q => q[1] < 0)) continue;
      const da = dec(L.a), db = dec(L.b);
      if (da == null || db == null || (da.split('.')[1] || '').length > k || (db.split('.')[1] || '').length > k) continue;
      if (P.every(q => F.eq(D10(q[1]), F.add(F.mul(L.a, fr(q[0])), L.b)))) continue;
      return { P, L };
    }
    return null;
  }
  const BAN46 = new Set(['1,3;2,5;3,6;4,8', '1,14;2,15.9;3,18.1;4,20.1;5,21.9', '0,1;1,3;2,2', '0,1;1,2;2,4;3,5', '0,2;1,2;2,5']);
  add({
    id: '7-46', part: 3, chap: '7-5⑦ 例題9', stars: 1,
    title: '最小二乗の直線は4つの和だけで：正規方程式は「$x^2$ の和・$x$ の和・点の数」と「$xy$ の和・$y$ の和」',
    mark: '点の組と「最小二乗法で直線 $y=ax+b$ を引こう」。$\\begin{pmatrix}x^2\\text{の和}&x\\text{の和}\\\\x\\text{の和}&\\text{点の数}\\end{pmatrix}\\begin{pmatrix}a\\\\b\\end{pmatrix}=\\begin{pmatrix}xy\\text{の和}\\\\y\\text{の和}\\end{pmatrix}$',
    futsu: ['$A$（$x$ と1をならべた行列）を書いて、', '$A^{\\mathsf T}A$ と $A^{\\mathsf T}\\vec b$ を', '行列のかけ算で作ってから、', '正規方程式を解く。'],
    raku: ['$(1,\\ 3)$、$(2,\\ 5)$、$(3,\\ 6)$、$(4,\\ 8)$', '→ $\\begin{pmatrix}30&10\\\\10&4\\end{pmatrix}\\begin{pmatrix}a\\\\b\\end{pmatrix}=\\begin{pmatrix}63\\\\22\\end{pmatrix}$', '行列式20 → $a=1.6$、$b=1.5$'],
    why: 'ずれの2乗の和がいちばん小さいのは、ずれの矢印が $A$ の2本の列（$x$ の列と1の列）のどちらとも直角になるとき。それをまとめた正規方程式 $A^{\\mathsf T}A\\vec x=A^{\\mathsf T}\\vec b$ の成分は、内積なので「$x^2$ の和」「$x$ の和」「点の数」「$xy$ の和」「$y$ の和」になる（7-5⑦）。',
    caution: '左の行列の右下は「点の数」（1の列どうしの内積）。$A^{\\mathsf T}A$ であって $AA^{\\mathsf T}$ ではない。答えの直線は、ずれの和が0になっているかで確かめられる。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 1 },
    cols: 1,
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '16mm' }, boxh: { s3: '12mm' },
    fits(q) { return /最小二乗/.test(q) && !/原点を通る/.test(q) && /(ax\+b|正規方程式)/.test(q); },
    steps: {
      // 点が3つか4つ（x は 0 か 1 から）
      s1(r) {
        const n = r.int(3, 4), g = lsqPts(r, n, r.int(0, 1), 1, 0, 9); if (!g) return null;
        const key = g.P.map(p => p.join(',')).join(';');
        if (BAN46.has(key)) return null;
        return { q: `${n}つの点 ${ptsTeX(g.P)} に、最小二乗法で引いた直線 $y=ax+b$ の式`, a: `$${lineAB(g.L.a, g.L.b)}$`, key, easy: lsqEasy(g.L), easyCheck: false, verify: p => lsqCheck(p, g.P) };
      },
      // 4つの和だけがわかっているとき
      s2(r) {
        const n = r.int(4, 6), g = lsqPts(r, n, r.int(0, 1), 2, 0, 15); if (!g) return null;
        const L = g.L, key = g.P.map(p => p.join(',')).join(';');
        return { q: `点が ${n} つで、$x$ の和が ${L.Sx}、$x^{2}$ の和が ${L.Sxx}、$y$ の和が ${fx(L.Sy)}、$xy$ の和が ${fx(L.Sxy)} のとき、最小二乗法の直線 $y=ax+b$`, a: `$${lineAB(L.a, L.b)}$`, key: 'S' + [n, L.Sx, L.Sxx, fx(L.Sy), fx(L.Sxy)].join(','),
          easy: `$${pm([[L.Sxx, L.Sx], [L.Sx, n]])}\\begin{pmatrix}a\\\\b\\end{pmatrix}=${pm([[fx(L.Sxy)], [fx(L.Sy)]])}$、行列式 ${L.Dt}`, easyCheck: false, verify: p => lsqCheck(p, g.P) };
      },
      // 表のデータ（ばね）、正規方程式の行列
      s3(r) {
        // ばねの長さ：はじめ y0 cm、1個で sl cm のびる（0.5 cm ずつのずれ）
        // おもりの数は 0 から（例の $x=1,2,3,4$ と同じ $A^{\mathsf T}A$ を出さない。R1-17）か、1〜5
        const n = r.int(4, 5), x0 = n === 4 ? 0 : r.int(0, 1), y0 = r.pick([10, 12, 15, 20]), sl = r.pick([1, 1.5, 2, 2.5, 3]);
        const P = Array.from({ length: n }, (_, i) => [x0 + i, y0 + sl * (x0 + i) + r.pick([-0.5, 0, 0, 0.5])]), L = lsq(P);
        const da = dec(L.a), db = dec(L.b);
        if (!da || !db || L.a[0] <= 0 || (da.split('.')[1] || '').length > 2 || (db.split('.')[1] || '').length > 2) return null;
        if (P.every(q => F.eq(D10(q[1]), F.add(F.mul(L.a, fr(q[0])), L.b)))) return null;
        const key = P.map(p => p.join(',')).join(';');
        if (BAN46.has(key)) return null;
        const table = { head: ['おもりの数 $x$（個）', ...P.map(p => String(p[0]))], rows: [['ばねの長さ $y$（cm）', ...P.map(p => fmt(p[1]))]] };
        if (turn(r, '46s3', 2) === 0) {
          return { q: '表は、ばねにつるしたおもりの数と、ばねの長さ。最小二乗法で引いた直線 $y=ax+b$ の式', a: `$${lineAB(L.a, L.b)}$`, key, table, easy: lsqEasy(L), easyCheck: false, verify: p => lsqCheck(p, P) };
        }
        return { q: '表のデータに最小二乗法で直線 $y=ax+b$ を引くときの、正規方程式 $A^{\\mathsf T}A\\begin{pmatrix}a\\\\b\\end{pmatrix}=A^{\\mathsf T}\\vec b$ の左の行列 $A^{\\mathsf T}A$', a: `$${pm([[L.Sxx, L.Sx], [L.Sx, L.n]])}$`, key: key + 'N', table,
          easy: `$x^{2}$ の和 ${L.Sxx}、$x$ の和 ${L.Sx}、点の数 ${L.n}`, easyCheck: false,
          calc: { kind: 'mat', want: (() => { const A = P.map(p => [p[0], 1]); return [0, 1].map(i => [0, 1].map(j => A.reduce((s, row) => s + row[i] * row[j], 0))); })() } };
      },
      // わな：原点を通る直線 y=ax（文字が1つ。7-94）
      trap(r) {
        const g = ols0(r, r.int(2, 3), 1); if (!g) return null;
        return dest({ q: `${g.P.length}つの点 ${ptsTeX(g.P)} に、最小二乗法で原点を通る直線 $y=ax$ を引くときの $a$`, a: `$${fx(g.a)}$`, key: 't46' + g.P.join(';'),
          verify: p => valIs(p, g.P.reduce((s, q) => s + q[0] * q[1], 0) / g.P.reduce((s, q) => s + q[0] * q[0], 0)) },
          '7-46', `$b$ がないので、2×2 の正規方程式ではない。$a=\\frac{xy\\text{ の和}}{x^{2}\\text{ の和}}=\\frac{${g.Sxy}}{${g.Sxx}}$`, ['7-94']);
      },
    },
  });

  // ================================================================ 7-93
  const swapC = (A, i, j) => A.map(row => row.map((x, k) => (k === i ? row[j] : k === j ? row[i] : x)));
  const BAN93 = new Set(['1,3;2,4', '3,1;4,2', '0,1;1,0']);
  add({
    id: '7-93', part: 3, chap: '7-4③', stars: 1,
    title: '列を入れかえると、行列式の符号が変わる（入れかえた行列は、計算しなおさない）',
    mark: '行列式がわかっている行列と、列の順だけがちがう行列。「列を入れかえた行列の行列式」。',
    futsu: ['入れかえた行列の行列式を、', 'たすきにかけてひく（3×3 なら', 'サラスの方法）で、', 'はじめから計算しなおす。'],
    raku: ['$\\det\\begin{pmatrix}1&3\\\\2&4\\end{pmatrix}=-2$ なら', '$\\det\\begin{pmatrix}3&1\\\\4&2\\end{pmatrix}=2$（列を入れかえた）', '2回入れかえると、元の符号'],
    why: '1列めと2列めを入れかえると、1列めから2列めへ回る向きが逆になる（裏返し）。式でも $\\det\\begin{pmatrix}b&a\\\\d&c\\end{pmatrix}=bc-ad=-(ad-bc)$（7-4③）。3×3 でも、2つの列を入れかえるたびに符号が変わり、大きさ（体積の倍率）は変わらない。',
    caution: '入れかえるたびに $-1$ 倍。3つの列を1つずつずらす（1列め→2列め→3列め→1列め）のは2回の入れかえなので、符号は元のまま。成分の数を変えたり、符号を変えたりしたのは「入れかえ」ではない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '30mm', trap: '14mm' },
    fits(q) {
      if (/入れかえ|列の順/.test(q) && /行列式|\\det|裏返し/.test(q) && !/行と列/.test(q)) return true;
      // 「$\det(…)=D$ のとき、$\det(…)$」で、2つめの行列が1つめの列を入れかえたもの
      const m = mats(q).filter(x => x.env === 'pmatrix');
      if (m.length !== 2 || !/のとき/.test(q) || !/\\det/.test(q) || m[0].rows !== m[1].rows) return false;
      const cols = b => { const R = b.split('\\\\').map(t => t.split('&').map(c => c.trim())); return R[0].map((_, j) => R.map(row => row[j]).join(',')); };
      const c0 = cols(m[0].body), c1 = cols(m[1].body);
      return c0.join('|') !== c1.join('|') && c0.slice().sort().join('|') === c1.slice().sort().join('|');
    },
    steps: {
      // 2×2：列を入れかえた行列
      s1(r) {
        const A = rand2(r, -4, 9, 0.1), D = det2(A);
        if (!D || A[0][0] === A[0][1] && A[1][0] === A[1][1] || BAN93.has(keyM(A))) return null;
        const B = swapC(A, 0, 1);
        return { q: `$${DET(A)}=${D}$ のとき、$${DET(B)}$`, a: `$${-D}$`, key: [keyM(A), keyM(B)].sort().join('|'),
          easy: `1列めと2列めを入れかえただけなので、符号を変えて $${-D}$`, easyCheck: false, verify: p => valIs(p, detNum(B)) };
      },
      // 3×3：1回の入れかえ・2回（ずらす）
      s2(r) {
        const A = rand3(r, -2, 4, r.int(1, 3)), D = F.val(Mat.det(Mat.make(A)));
        if (!D) return null;
        const t = r.int(0, 3), B = t === 3 ? A.map(row => [row[2], row[0], row[1]]) : swapC(A, [0, 0, 1][t], [1, 2, 2][t]);
        if (keyM(A) === keyM(B)) return null;
        const how = t === 3 ? '3つの列を1つずつずらした（2回の入れかえ）ので、符号はそのまま' : `${[1, 1, 2][t]}列めと${[2, 3, 3][t]}列めを入れかえただけなので、符号を変えて`;
        return { q: `$${DET(A)}=${D}$ のとき、$${DET(B)}$`, a: `$${t === 3 ? D : -D}$`, key: keyM(A) + '|' + keyM(B),
          easy: `${how} $${t === 3 ? D : -D}$`, easyCheck: false, verify: p => valIs(p, detNum(B)) };
      },
      // 単位行列の列を入れかえた行列、裏返しになるか
      s3(r) {
        if (turn(r, '93s3', 2) === 0) {
          const perms = [[1, 0, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0], [2, 0, 1]], pr = r.pick(perms);
          const P = I3.map((_, i) => pr.map(j => I3[i][j])), D = F.val(Mat.det(Mat.make(P)));
          const cyc = D === 1;
          return { q: `単位行列 $I$ の列を入れかえた行列の行列式 $${DET(P)}$`, a: `$${D}$`, key: keyM(P),
            easy: `$\\det I=1$ から、${cyc ? '列を1つずつずらした（2回の入れかえ）ので、そのまま1' : '2つの列を1回入れかえたので $-1$'}`, easyCheck: false, verify: p => valIs(p, detNum(P)) };
        }
        const A = rand2(r, -3, 5, 0.1), D = det2(A);
        if (Math.abs(D) < 2 || BAN93.has(keyM(A))) return null;
        const B = swapC(A, 0, 1), ura = -D < 0;
        return { q: `行列 $${pm(A)}$ をかけると、面積は ${Math.abs(D)} 倍で、裏返しに${D < 0 ? 'なる' : 'ならない'}。列を入れかえた $${pm(B)}$ をかけると、面積は何倍で、裏返しになるか`,
          a: `${Math.abs(D)}倍、裏返しに${ura ? 'なる' : 'ならない'}`, key: [keyM(A), keyM(B)].sort().join('|') + 'u',
          easy: `行列式の符号だけが変わる（大きさは同じ）。$${D}\\to${-D}$`, easyCheck: false,
          verify: p => { const d = detNum(B); return p.a === `${Math.round(Math.abs(d))}倍、裏返しに${d < 0 ? 'なる' : 'ならない'}` || `答え ${p.a}`; } };
      },
      // わな：成分の符号を全部変えた行列（2×2 は $(-1)^2$ 倍）、転置（行列式は同じ）。7-35
      trap(r) {
        const D = r.intNot(-9, 9, v => v === 0 || v === 1 || v === -1);
        if (turn(r, '93t', 2) === 0) {
          const three = r.chance(0.4);
          return dest({ q: `${three ? '3×3' : '2×2'} の行列 $A$ で $\\det A=${D}$ のとき、成分の符号を全部変えた行列の行列式 $\\det(-A)$`, a: `$${three ? -D : D}$`, key: `t93m${three}${D}`,
            verify: p => valIs(p, (three ? -1 : 1) * D) },
            '7-93', `列の入れかえではなく、$-1$ 倍（$k=-1$）。${three ? '3×3 は $(-1)^{3}=-1$ 倍' : '2×2 は $(-1)^{2}=1$ 倍で、変わらない'}`, ['7-35']);
        }
        return dest({ q: `$\\det A=${D}$ のとき、行と列を入れかえた行列（転置）の行列式 $\\det(A^{\\mathsf T})$`, a: `$${D}$`, key: `t93t${D}`, verify: p => valIs(p, D) },
          '7-93', '2つの列の入れかえではなく転置。転置しても行列式は変わらない（7-4⑤）', ['7-35']);
      },
    },
  });

  // ================================================================ 7-94
  // 原点を通る直線の a = (xy の和)/(x^2 の和)。小数第 k 位まで
  function ols0(r, n, k, ylo, yhi) {
    for (let it = 0; it < 300; it++) {
      const xs = r.shuffle([1, 2, 3, 4, 5]).slice(0, n).sort((a, b) => a - b), k0 = r.int(ylo || 1, yhi || 3);   // だいたい y=k0 x
      const P = xs.map(x => [x, Math.max(1, k0 * x + r.int(-1, 1))]), Sxy = P.reduce((s, p) => s + p[0] * p[1], 0), Sxx = P.reduce((s, p) => s + p[0] * p[0], 0), a = fr(Sxy, Sxx);
      const d = dec(a);
      if (d == null || (d.split('.')[1] || '').length > k || P.every(p => p[1] * Sxx === p[0] * Sxy)) continue;
      return { P, Sxy, Sxx, a };
    }
    return null;
  }
  const BAN94 = new Set(['1,2;2,3']);
  add({
    id: '7-94', part: 3, chap: '7-5⑦', stars: 1,
    title: '原点を通る最小二乗の直線は $a=\\dfrac{xy\\text{ の和}}{x^2\\text{ の和}}$（ずれが直線に直角）',
    mark: '点の組と「原点を通る直線 $y=ax$ を最小二乗法で」。比例の係数（ばね定数・抵抗）を、はかった値から決める。',
    futsu: ['ずれの2乗の和 $S$ を $a$ の式に', 'して、平方完成するか、', '$a$ を少しずつ変えた表を作って、', 'いちばん小さい所をさがす。'],
    raku: ['$(1,\\ 2)$、$(2,\\ 3)$', '→ $a=\\frac{1\\times2+2\\times3}{1^{2}+2^{2}}=\\frac{8}{5}=1.6$'],
    why: '$x$ をならべた矢印 $\\vec u$ と、$y$ をならべた矢印 $\\vec b$ で、ずれ $\\vec b-a\\vec u$ がいちばん短いのは、ずれが $\\vec u$ に直角のとき。内積 $\\vec u\\cdot(\\vec b-a\\vec u)=0$ から $a=\\frac{\\vec u\\cdot\\vec b}{\\vec u\\cdot\\vec u}$。分子は「$xy$ の和」、分母は「$x^2$ の和」（7-5⑦、3-16）。',
    caution: '分母は $x^2$ の和（$y^2$ の和でも、点の数でもない）。$y=ax+b$ のように $b$ もあるときは、2×2 の正規方程式（7-46）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '30mm' },
    fits(q) { return /原点を通る/.test(q) && /最小二乗/.test(q); },
    steps: {
      // 点が2つか3つ
      s1(r) {
        const g = ols0(r, r.int(2, 3), 2); if (!g || BAN94.has(g.P.join(';')) || !ansOK(r, '7-94', fx(g.a))) return null;   // 同じ見開きで同じ答えを出さない（R1-16）
        return { q: `${g.P.length}つの点 ${ptsTeX(g.P)} に、最小二乗法で原点を通る直線 $y=ax$ を引くときの $a$`, a: `$${fx(g.a)}$`, key: g.P.join(';'),
          easy: `$a=\\frac{${g.P.map(p => `${p[0]}\\times${p[1]}`).join('+')}}{${g.P.map(p => `${p[0]}^{2}`).join('+')}}=\\frac{${g.Sxy}}{${g.Sxx}}=${fx(g.a)}$`, easyCheck: false,
          verify: p => { const a = nums(p.a)[0], S = aa => g.P.reduce((s, q) => s + (q[1] - aa * q[0]) ** 2, 0); return (S(a) <= S(a + 1e-4) && S(a) <= S(a - 1e-4)) || `a=${a} で S がいちばん小さくない`; } };
      },
      // 和だけ、点が4つ
      s2(r) {
        if (turn(r, '94s2', 2) === 0) {
          const g = ols0(r, r.int(4, 5), 2, 1, 4); if (!g || !ansOK(r, '7-94', fx(g.a))) return null;
          return { q: `$xy$ の和が ${g.Sxy}、$x^{2}$ の和が ${g.Sxx} の点の組に、最小二乗法で原点を通る直線 $y=ax$ を引くときの $a$`, a: `$${fx(g.a)}$`, key: `S${g.Sxy},${g.Sxx}`,
            easy: `$a=\\frac{${g.Sxy}}{${g.Sxx}}=${fx(g.a)}$`, easyCheck: false, verify: p => valIs(p, g.Sxy / g.Sxx) };
        }
        const g = ols0(r, 4, 2); if (!g || !ansOK(r, '7-94', fx(g.a))) return null;
        return { q: `4つの点 ${ptsTeX(g.P)} に、最小二乗法で原点を通る直線 $y=ax$ を引くときの $a$`, a: `$${fx(g.a)}$`, key: g.P.join(';'),
          easy: `$a=\\frac{${g.Sxy}}{${g.Sxx}}=${fx(g.a)}$`, easyCheck: false, verify: p => valIs(p, g.P.reduce((s, q) => s + q[0] * q[1], 0) / g.P.reduce((s, q) => s + q[0] * q[0], 0)) };
      },
      // 表：電流と電圧（抵抗）、ばねののびと力（ばね定数）
      s3(r) {
        const g = ols0(r, r.int(3, 4), 2, 2, 4); if (!g || !ansOK(r, '7-94', fx(g.a))) return null;
        if (turn(r, '94s3', 2) === 0) {
          const table = { head: ['電流 $I$（mA）', ...g.P.map(p => String(p[0]))], rows: [['電圧 $V$（V）', ...g.P.map(p => String(p[1]))]] };
          return { q: '表は、ある抵抗の電流と電圧をはかった値。最小二乗法で原点を通る直線 $V=RI$ を引くときの抵抗 $R$（kΩ）', a: `$${fx(g.a)}$`, key: g.P.join(';') + 'R', table,
            easy: `$R=\\frac{IV\\text{ の和}}{I^{2}\\text{ の和}}=\\frac{${g.Sxy}}{${g.Sxx}}=${fx(g.a)}$`, easyCheck: false, verify: p => valIs(p, g.Sxy / g.Sxx) };
        }
        const table = { head: ['のび $x$（cm）', ...g.P.map(p => String(p[0]))], rows: [['力 $F$（N）', ...g.P.map(p => String(p[1]))]] };
        return { q: '表は、ばねののびと、ばねを引いた力をはかった値。最小二乗法で原点を通る直線 $F=kx$ を引くときの $k$（N/cm）', a: `$${fx(g.a)}$`, key: g.P.join(';') + 'k', table,
          easy: `$k=\\frac{xF\\text{ の和}}{x^{2}\\text{ の和}}=\\frac{${g.Sxy}}{${g.Sxx}}=${fx(g.a)}$`, easyCheck: false, verify: p => valIs(p, g.Sxy / g.Sxx) };
      },
      // わな：y=ax+b（b もある。7-46）
      trap(r) {
        const g = lsqPts(r, 3, r.int(0, 1), 1, 0, 9); if (!g) return null;
        return dest({ q: `3つの点 ${ptsTeX(g.P)} に、最小二乗法で引いた直線 $y=ax+b$ の式`, a: `$${lineAB(g.L.a, g.L.b)}$`, key: 't94' + g.P.join(';'), verify: p => lsqCheck(p, g.P) },
          '7-94', `原点を通らない（$b$ もある）ので、$a$ の式1つではすまない。正規方程式 ${lsqEasy(g.L)}`, ['7-46']);
      },
    },
  });

  // ================================================================ 7-95
  // x + c y = p、x + (c+ε) y = q（行列式 ε）。答え (x0, y0) は整数
  function illSys(r) {
    let e, c, x0, y0;
    for (let it = 0; it < 50; it++) {   // 左ページの例（$x+y=2$、$x+1.001y=2.001$）は出さない（O-2）
      e = r.pick([fr(1, 10), fr(1, 100), fr(1, 1000)]); c = r.pick([1, 1, 2, 3]); x0 = r.int(-2, 4); y0 = r.int(-1, 4);
      if (!(e[1] === 1000 && c === 1 && x0 + y0 === 2)) break;
    }
    const p = x0 + c * y0, q = F.add(fr(x0), F.mul(F.add(fr(c), e), fr(y0)));
    return { e, c, x0, y0, p, q, A: [[1, c], [1, F.add(fr(c), e)]] };
  }
  const illEq = g => `$${lin([1, g.c], ['x', 'y'])}=${g.p}$、$x+${fx(F.add(fr(g.c), g.e))}y=${fx(g.q)}$`;
  const BAN95 = new Set(['1/1000|1|1|1']);
  add({
    id: '7-95', part: 3, chap: '7-5⑥', stars: 1,
    title: '条件が悪い連立方程式：行列式が0に近いと、右辺の小さな変化で答えが大きく変わる',
    mark: 'ほとんど比例している2つの式（係数が 1 と 1.001 など）。「右辺を少し変えると、答えは」。',
    futsu: ['右辺を変えた連立方程式を、', '加減法ではじめから', '解きなおす。'],
    raku: ['$x+y=2$、$x+1.001y=2.001$ → $(1,\\ 1)$', '右辺 2.001 を 2.002 に（0.001 ふやす）', '→ $y$ は $\\frac{0.001}{0.001}=1$ ふえて2、$x$ は0'],
    why: '2つの式をひくと $0.001y=q-p$。行列式（ここでは0.001）が0に近いと、右辺の差を小さな数でわるので、右辺の小さな変化が、答えの大きな変化になる（7-5⑥）。2本の直線がほとんど平行なので、少し動かすと交わる点が遠くへ動く。',
    caution: 'はかった値には、いつも少しのずれがある。行列式が0に近い式は、そのずれで答えが大きくくるう（条件が悪い）。答えが変わる大きさは「右辺の変化÷行列式」の程度。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '30mm', s2: '14mm', s3: '16mm', trap: '30mm' },
    fits(q) {
      if (/弱い|条件が悪い/.test(q)) return true;
      if (!/変え|変わ|ずれ/.test(q)) return false;
      const S = parseSys(q.replace(/の答えは[^。]*。/, '。'));
      return !!S && Math.abs(detNum(S.A)) < 0.1 + 1e-9 && Math.abs(detNum(S.A)) > 0;
    },
    steps: {
      // 右辺を変えたときの答え
      s1(r) {
        const g = illSys(r), k = r.pick([1, 2, -1, 3]), dq = F.mul(g.e, fr(k)), q2 = F.add(g.q, dq);
        if (BAN95.has(`${g.e.join('/')}|${g.c}|${g.x0}|${g.y0}`)) return null;
        const x2 = g.x0 - g.c * k, y2 = g.y0 + k;
        return { q: `連立方程式 ${illEq(g)} の答えは $x=${g.x0}$、$y=${g.y0}$。2つめの式の右辺 $${fx(g.q)}$ を $${fx(q2)}$ に変えたときの答え`, a: `$x=${x2}$、$y=${y2}$`, key: `${g.e.join('/')}|${g.c}|${g.x0}|${g.y0}|${k}`,
          easy: `行列式は $${fx(g.e)}$。右辺が $${fx(dq)}$ 変わると、$y$ は $\\frac{${fx(dq)}}{${fx(g.e)}}=${k}$ 変わる`, easyCheck: false,
          verify: p => solves(p, g.A, [g.p, q2], ['x', 'y']) };
      },
      // y がどれだけ変わるか（ふえればプラス）
      s2(r) {
        const g = illSys(r), dq = F.mul(g.e, fr(r.pick([1, 2, 3, 5, -2]))), q2 = F.add(g.q, dq), dy = F.div(dq, g.e);
        return { q: `連立方程式 ${illEq(g)} の、2つめの式の右辺 $${fx(g.q)}$ を $${fx(q2)}$ に変えると、$y$ はいくつ変わるか（ふえるならプラス）`, a: `$${fx(dy)}$`, key: `${g.e.join('/')}|${g.c}|${g.x0}|${g.y0}|d${fx(dq)}`,
          easy: `2つの式をひくと $${fx(g.e)}y=\\cdots$。$\\frac{${fx(dq)}}{${fx(g.e)}}=${fx(dy)}$`, easyCheck: false,
          verify: p => { const s1 = solveNum(numM(g.A), [g.p, F.val(g.q)]), s2 = solveNum(numM(g.A), [g.p, F.val(q2)]); return valIs(p, s2[1] - s1[1], 1e-6); } };
      },
      // ずれに弱いのはどちら、はかった値のずれ
      s3(r) {
        if (turn(r, '95s3', 2) === 0) {
          const g = illSys(r), b = r.intNot(-3, 3, v => v === 0 || v === 1), first = r.chance(0.5);
          const good = `$x+y=${g.x0 + g.y0}$、$x${sgn(b)}y=${g.x0 + b * g.y0}$`.replace('+1y', '+y').replace('-1y', '-y'), bad = illEq({ ...g, c: 1, p: g.x0 + g.y0, q: F.add(fr(g.x0), F.mul(F.add(fr(1), g.e), fr(g.y0))) });
          const [P, Q] = first ? [bad, good] : [good, bad];
          return { q: `（ア）${P}　（イ）${Q}　右辺が少しずれたとき、答えが大きく変わる（ずれに弱い）のはどちらか`, a: first ? '（ア）' : '（イ）', key: `c${g.e.join('/')}|${b}|${first}|${g.x0}|${g.y0}`,
            easy: `行列式は $${fx(g.e)}$ と $${b - 1}$。0に近いほうが弱い`, easyCheck: false,
            verify: p => { const d1 = Math.abs(F.val(g.e)), d2 = Math.abs(b - 1); return p.a === ((d1 < d2) === first ? '（ア）' : '（イ）') || `答え ${p.a}`; } };
        }
        const g = illSys(r), dq = F.mul(g.e, fr(r.pick([2, 3, 5]))), dy = F.div(dq, g.e);
        return { q: `連立方程式 ${illEq(g)} の右辺 $${fx(g.q)}$ ははかった値で、$\\pm${fx(dq)}$ のずれがある。このずれで、$y$ は最大でいくつずれるか`, a: `$${fx(dy)}$`, key: `m${g.e.join('/')}|${g.c}|${fx(dq)}`,
          easy: `$\\frac{${fx(dq)}}{${fx(g.e)}}=${fx(dy)}$（行列式 $${fx(g.e)}$ でわる）`, easyCheck: false, verify: p => valIs(p, F.val(dq) / F.val(g.e), 1e-9) };
      },
      // わな：行列式だけ（7-31）、条件のよい式（答えはほとんど変わらない。7-40）
      trap(r) {
        if (turn(r, '95t', 2) === 0) {
          const g = illSys(r), A = [[1, g.c], [1, F.add(fr(g.c), g.e)]];
          return dest({ q: `$${DET(A)}$`, a: `$${fx(g.e)}$`, key: `t95d${g.e.join('/')}|${g.c}`, verify: p => valIs(p, detNum(A)) },
            '7-95', `右辺を変える問題ではなく、行列式だけ。たすきにかけてひく：$1\\times${fx(A[1][1])}-${g.c}\\times1=${fx(g.e)}$`, ['7-31']);
        }
        const x0 = r.int(1, 4), y0 = r.int(0, 3), d = r.pick([fr(1, 10), fr(1, 100)]);
        const A = [[1, 1], [1, -1]], b = [x0 + y0, x0 - y0], b2 = F.add(fr(b[1]), d), sol = [F.div(F.add(fr(b[0]), b2), fr(2)), F.div(F.sub(fr(b[0]), b2), fr(2))];
        return dest({ q: `連立方程式 $x+y=${b[0]}$、$x-y=${b[1]}$ の、2つめの式の右辺を $${fx(b2)}$ に変えたときの答え`, a: `$x=${fx(sol[0])}$、$y=${fx(sol[1])}$`, key: `t95g${x0},${y0},${fx(d)}`,
          verify: p => solves(p, A, [b[0], F.val(b2)], ['x', 'y']) },
          '7-95', '行列式は $-2$ で0から遠い（条件がよい）。答えは少ししか変わらない。ふつうに逆行列で解く', ['7-40']);
      },
    },
  });
})(globalThis.MONDAI);
