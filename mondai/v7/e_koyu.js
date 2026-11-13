/* 問題集 第7巻　第5部 固有値と対角化（わざ 7-62〜7-76）　組 e
 * 書き方は v7/README.md（= v6/README.md の第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第7巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 7-8（固有値）・7-9（対角化）の数・ことば・記号にそろえる（固有値 $\lambda$、固有ベクトル、特性方程式、状態の行列、主応力・主方向、
 *   べき乗法、対角化 $P^{-1}AP=D$、ななめの物差し $q_1$・$q_2$、台車・水そう・応力、虚数単位 $j$）。
 * 固有ベクトルは何倍でも正（本の答えは成分がいちばん小さい整数の組）、固有値の順は問わない（第39回 Q-3）。
 *   検算は verify(p) で、答えの文から数・ベクトルを読み、$A\vec v=\lambda\vec v$（$\vec v\neq\vec 0$）を、問題を作った式とは別に、かけ算で確かめる。
 *   固有値は、特性方程式を解の公式で解いた値（小数）とくらべる。行列の答えは calc（kind 'mat'）で、Mat の積・逆行列・n 乗から作った行列とくらべる。
 *   台車の動き（7-76）は、運動方程式をルンゲ・クッタ法でたどってくらべる。
 * 図は 7-66 のステップ3だけ（ばね M.figSpring と台車。K-2・Q-6）。プログラムの表示（p.code）は 7-69 のステップ3だけ、表（p.table）は 7-70 のステップ3だけ
 *   （見わけようは図・表・プログラムを出さないので、ステップ1・2 は numpy の表示も文の中に1行で書く）。
 * 左ページの「楽な形」と目印・注意の例の数は、同じ見開きの問題に出さない（O-2）。key は行列（と、たずねるもの）で作り、ステップがちがっても同じ行列は同じ key にする。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「楽な形なし」）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const fmt = v => String(+(+v).toFixed(10));                        // 0.30000000004 → 0.3
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const isSq = n => Number.isInteger(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
  const pm = A => `\\begin{pmatrix}${A.map(row => row.map(fmt).join('&')).join('\\\\')}\\end{pmatrix}`;   // 行列
  const cv = v => `\\begin{pmatrix}${v.map(fmt).join('\\\\')}\\end{pmatrix}`;                            // たてのベクトル
  const vt = v => `(${v.map(fmt).join(',\\ ')})`;                                                         // 文の中のベクトル (1,\ -2)
  const kA = A => A.flat().map(fmt).join(',');                                                            // 行列の key
  const same = (A, B) => kA(A) === kA(B);
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  const cf = (c, body) => (c === 0 ? '' : c === 1 ? body : c === -1 ? '-' + body : fmt(c) + body);   // 係数 × 式（1・−1 は書かない）
  // √N を外に出せる数を出した形に（200 → 10\sqrt{2}）
  function sqrtTeX(N) {
    let out = 1, inn = N;
    for (let f = 2; f * f <= inn; f++) while (inn % (f * f) === 0) { inn /= f * f; out *= f; }
    return inn === 1 ? String(out) : `${out === 1 ? '' : out}\\sqrt{${inn}}`;
  }
  // 整数のベクトルを、成分がいちばん小さい整数の組に（はじめの0でない成分を正に）
  function norm(v) {
    const g = v.reduce((a, x) => gcd(a, x), 0) || 1;
    let w = v.map(x => x / g);
    const k = w.findIndex(x => x !== 0);
    if (k >= 0 && w[k] < 0) w = w.map(x => (x === 0 ? 0 : -x));
    return w;
  }
  // 2×2 の整数の行列 A の、固有値 l の固有ベクトル（A−lI の1行め (p, q) から (q, −p)。1行めが0なら2行め）
  function evec(A, l) {
    const [[a, b], [c, d]] = A;
    if (a - l !== 0 || b !== 0) return norm([b, l - a]);
    if (c !== 0 || d - l !== 0) return norm([d - l, -c]);
    return null;
  }
  // 2×2 の整数の行列で、固有値がちがう2つの整数のもの。o.lo・o.hi（成分のはんい）、o.sym（対称）、o.nz（右上・左下とも0でない。ふつう true）、
  // o.bad(A, l1, l2)（よける）、o.vmax（固有ベクトルの成分の大きさの上限）
  function genInt(r, o) {
    o = o || {};
    const lo = o.lo != null ? o.lo : -4, hi = o.hi != null ? o.hi : 6;
    for (let k = 0; k < 600; k++) {
      const a = r.int(lo, hi), d = r.int(lo, hi), b = r.int(lo, hi), c = o.sym ? b : r.int(lo, hi);
      if (o.nz !== false && (b === 0 || c === 0)) continue;
      const tr = a + d, det = a * d - b * c, D = tr * tr - 4 * det;
      if (D <= 0 || !isSq(D)) continue;
      const s = Math.round(Math.sqrt(D));
      if ((tr + s) % 2) continue;
      const l1 = (tr + s) / 2, l2 = (tr - s) / 2, A = [[a, b], [c, d]];
      if (o.bad && o.bad(A, l1, l2)) continue;
      const v1 = evec(A, l1), v2 = evec(A, l2);
      if (!v1 || !v2) continue;
      if (o.vmax && Math.max(...v1.map(Math.abs), ...v2.map(Math.abs)) > o.vmax) continue;
      return { A, l: [l1, l2], v: [v1, v2] };
    }
    return null;
  }
  // 2階の線形の式 a x'' + b x' + c x = 0 の TeX
  const ode = (a, b, c) => `${sum([cf(a, '\\ddot x'), cf(b, '\\dot x'), cf(c, 'x')])}=0`;
  const U = (v, u) => `${v}\\,\\mathrm{${u}}`;

  // ---------------------------------------------------------------- 検算の部品（問題を作った式とは別の道すじ）
  const mulv = (A, v) => A.map(row => row.reduce((s, x, j) => s + x * v[j], 0));
  const F_ = f => f[0] / f[1];   // M.F の分数 → 小数
  const isEig = (A, v, l) => !!v && v.some(x => Math.abs(x) > 1e-12) && mulv(A, v).every((x, i) => near(x, l * v[i], 1e-9));
  // 2×2 の固有値（特性方程式を解の公式で）。複素数 [実, 虚] の組
  function roots2(A) {
    const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0], D = tr * tr - 4 * det;
    if (D >= 0) return [[(tr + Math.sqrt(D)) / 2, 0], [(tr - Math.sqrt(D)) / 2, 0]];
    return [[tr / 2, Math.sqrt(-D) / 2], [tr / 2, -Math.sqrt(-D) / 2]];
  }
  const cnear = (x, y) => x && y && Math.hypot(x[0] - y[0], x[1] - y[1]) <= 1e-7 * Math.max(1, Math.hypot(...y));
  // 数の組が、順を問わず同じか（重なりもふくめて）
  function sameSet(got, want) {
    if (!got || got.length !== want.length || got.some(g => !g)) return false;
    const used = want.map(() => false);
    return got.every(g => { const k = want.findIndex((w, i) => !used[i] && cnear(g, w)); if (k < 0) return false; used[k] = true; return true; });
  }
  const maths = t => (String(t).match(/\$[^$]*\$/g) || []).map(strip);
  const noUnit = t => t.replace(/\\,\\mathrm\{[^}]*\}/g, '');
  const isVec = s => /^\(.*,.*\)$/.test(s.trim());
  // 答えの文の数（$…$ ごと。ベクトルはのぞく。± は2つに。「ω=」などの左はとる）。複素数 [実, 虚] の配列
  function valsOf(t) {
    const out = [];
    for (let s of maths(t)) {
      if (isVec(s)) continue;
      s = noUnit(s);
      if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
      if (s.includes('\\pm')) { const [L, R] = s.split('\\pm'); const l = L.trim() || '0'; out.push(M.evalC(`(${l})+(${R})`, {}), M.evalC(`(${l})-(${R})`, {})); }
      else out.push(M.evalC(s, {}));
    }
    return out;
  }
  const vecOf = s => s.trim().slice(1, -1).split(',').map(x => M.evalMath(x.replace(/\\ /g, '').trim(), {}));
  const vecsOf = t => maths(t).filter(isVec).map(vecOf);
  // 「$6$：$(2,\ 1)$、$1$：$(1,\ -2)$」→ [[6, [2, 1]], [1, [1, -2]]]
  function pairsOf(t) {
    const out = []; let cur = null;
    for (const s of maths(t)) {
      if (isVec(s)) { if (cur !== null) { out.push([cur, vecOf(s)]); cur = null; } }
      else { const v = valsOf('$' + s + '$'); cur = v.length === 1 && v[0] && Math.abs(v[0][1]) < 1e-12 ? v[0][0] : null; }
    }
    return out;
  }
  // 固有値と固有ベクトルの組の答えを確かめる（固有値の組 ls は別の道すじで出した値）
  function pairsCheck(p, A, n) {
    const pr = pairsOf(p.a);
    if (pr.length !== (n || 2)) return `固有値と固有ベクトルの組が${n || 2}つない`;
    if (!sameSet(pr.map(x => [x[0], 0]), roots2(A).slice(0, n || 2)) && (n || 2) === 2) return '固有値がちがう';
    for (const [l, v] of pr) if (!isEig(A, v, l)) return `$${vt(v)}$ は固有値 ${l} の固有ベクトルでない`;
    return true;
  }
  const valsCheck = (p, want) => sameSet(valsOf(p.a), want) || `固有値 ${p.a} が ${JSON.stringify(want)} でない`;
  const vecCheck = (p, A, l) => { const v = vecsOf(p.a); return (v.length === 1 && isEig(A, v[0], l)) || `${p.a} は固有値 ${l} の固有ベクトルでない`; };

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  // 文の中の行列（pmatrix）。数の2重の配列（複素数や読めないものは null）
  function matsIn(q) {
    return (String(q).match(/\\begin\{pmatrix\}[\s\S]*?\\end\{pmatrix\}/g) || []).map(t => {
      const m = M.readMat(t); if (!m || m.some(r => r.some(c => Math.abs(c[1]) > 1e-12))) return null;
      return m.map(r => r.map(c => c[0]));
    }).filter(Boolean);
  }
  const is22 = A => !!A && A.length === 2 && A.every(r => r.length === 2);
  const mat22 = q => matsIn(q).find(is22) || coefMat(q);
  // 「$\dot x_1=-3x_1+x_2$、$\dot x_2=2x_1-2x_2$」のような連立の式の、係数の行列（なければ null）
  function coefMat(q) {
    const eqs = [];
    for (const s of maths(q)) {
      const m = /^\\d?dot\s*([a-z](?:_[12])?)=(.+)$/.exec(s.replace(/\s+/g, ' ').replace(/ (?=[=+-])|(?<=[=+-]) /g, ''));
      if (m) eqs.push([m[1].replace(' ', ''), m[2]]);
    }
    if (eqs.length !== 2) return null;
    const vars = eqs.map(e => e[0]);
    const rows = eqs.map(([, rhs]) => {
      const row = [0, 0];
      for (const t of rhs.replace(/-/g, '+-').split('+').filter(Boolean)) {
        const m = /^(-?)([\d.]*)([a-z](?:_[12])?)$/.exec(t.trim());
        if (!m) return null;
        const k = vars.indexOf(m[3]); if (k < 0) return null;
        row[k] += (m[1] ? -1 : 1) * (m[2] === '' ? 1 : +m[2]);
      }
      return row;
    });
    return rows.some(r => !r) ? null : rows;
  }
  const tail = q => { const s = String(q); const k = s.lastIndexOf('$'); return k >= 0 ? s.slice(k + 1) : s; };
  const symEq = A => is22(A) && A[0][0] === A[1][1] && A[0][1] === A[1][0] && A[0][1] !== 0;   // (a b; b a)
  const sym = A => is22(A) && A[0][1] === A[1][0] && A[0][1] !== 0;
  const tri = A => is22(A) && (A[0][1] === 0 || A[1][0] === 0);
  const D2 = A => (A[0][0] + A[1][1]) ** 2 - 4 * (A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  // 2階の式 a x'' + b x' + c x = 0（右辺0）の係数。なければ null
  function odeIn(q) {
    for (const s0 of maths(q)) {
      // 両辺の項（$\ddot x$・$\dot x$・$x$ の数倍だけ）を左辺に集める。$\ddot x=-10x-7\dot x$ も読む
      const s = s0.replace(/\s+/g, ''), k = s.indexOf('=');
      if (!/\\ddotx/.test(s) || k < 0) continue;
      const co = { '\\ddotx': 0, '\\dotx': 0, x: 0 };
      let ok = true;
      [[s.slice(0, k), 1], [s.slice(k + 1), -1]].forEach(([side, sg]) => {
        for (const t of side.replace(/-/g, '+-').split('+').filter(Boolean)) {
          const m = /^(-?)([\d.]*)(\\ddotx|\\dotx|x)$/.exec(t);
          if (!m) { if (t !== '0') ok = false; continue; }
          co[m[3]] += sg * (m[1] ? -1 : 1) * (m[2] === '' ? 1 : +m[2]);
        }
      });
      if (ok) return co['\\ddotx'] < 0 ? [-co['\\ddotx'], -co['\\dotx'], -co.x] : [co['\\ddotx'], co['\\dotx'], co.x];
    }
    const g = re => { const m = re.exec(q); return m ? +m[1] : null; };
    const mm = g(/m=([\d.]+)\\,\\mathrm\{kg\}/), c = g(/c=([\d.]+)\\,\\mathrm\{N\\cdot s\/m\}/), k = g(/k=([\d.]+)\\,\\mathrm\{N\/m\}/);
    if (mm != null && c != null && k != null && /ダンパー/.test(q)) return [mm, c, k];
    const A = matsIn(q).find(is22);
    if (A && A[0][0] === 0 && A[0][1] === 1 && /状態の行列/.test(q)) return [1, -A[1][1], -A[1][0]];
    return null;
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。楽な形なし）」を書く。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(7).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 5 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : '楽な形なし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 7-62
  const EX62 = [[4, 1], [2, 3]];   // 左ページの例
  M.add({
    id: '7-62', part: 5, chap: '7-8②③ 例題1', stars: 1,
    title: '固有ベクトルか確かめるには、$A\\vec v$ を計算して成分の比がそろうかを見る（そろった倍率が固有値）',
    mark: '行列とベクトルが書いてあって「固有ベクトルか」。$\\begin{pmatrix}4&1\\\\2&3\\end{pmatrix}$ で、$(1,\\ 1)$ は固有ベクトルか（答えは「固有値5」のように固有値を、ちがえば「ちがう」と書く）。',
    futsu: ['特性方程式を解いて固有値5と2を出し、', '固有ベクトル $(1,\\ 1)$、$(1,\\ -2)$ を', '求めてから、くらべる'],
    raku: ['$A$ をかけて $(1,\\ 1)\\to(5,\\ 5)$：5倍', '$(1,\\ -2)\\to(2,\\ -4)$：どちらも2倍', '$(2,\\ 1)\\to(9,\\ 7)$：4.5倍と7倍、ちがう'],
    why: '固有ベクトルは $A\\vec v=\\lambda\\vec v$ をみたす $\\vec 0$ でないベクトル（7-8②）。$A\\vec v$ を計算して、成分を $\\vec v$ の同じ場所の成分でわり、答えが全部同じなら、その数が $\\lambda$。ちがえば、どんな $\\lambda$ でも式は成り立たない（7-8③）。特性方程式を解かなくても、かけ算1回でわかる。',
    caution: '成分に0があるときは、0の成分どうしは、$A\\vec v$ でも0になっていればよい（0ではわらない）。$A\\vec v=\\vec 0$ なら、固有値0の固有ベクトル（固有値は0でもよい）。符号もふくめてわる：$(-4)\\div(-2)=2$。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '20mm' },
    fits(q) { return /は固有ベクトルか/.test(q); },
    steps: {
      // 整数の行列とベクトル（2つに1つは固有ベクトル）
      s1(r) {
        const g = genInt(r, { lo: -3, hi: 6, vmax: 3, bad: A => same(A, EX62) || symEq(A) }); if (!g) return null;
        const yes = turn(r, '62s1', 3) < 2, A = g.A;
        let v, l = null;
        if (yes) { const i = r.int(0, 1), sc = r.pick([1, 1, -1, 2]); v = g.v[i].map(x => x * sc); l = g.l[i]; }
        else { v = [r.int(1, 3), r.pick([-2, -1, 1, 2, 3])]; if (isEig(A, v, mulv(A, v)[0] / v[0])) return null; }
        const Av = mulv(A, v);
        return { q: `$A=${pm(A)}$ で、$${vt(v)}$ は固有ベクトルか`, a: yes ? `固有値 $${l}$` : 'ちがう', key: kA(A), easyCheck: false,
          easy: `$A\\vec v=${vt(Av)}$${yes ? `、どちらも $${l}$ 倍` : '、倍率がそろわない'}`,
          verify: p => (p.a === 'ちがう' ? (Math.abs(Av[0] * v[1] - Av[1] * v[0]) > 1e-9 || '平行なのに「ちがう」') : (isEig(A, v, valsOf(p.a)[0][0]) || '固有値がちがう')) };
      },
      // 成分に0・固有値0・固有値が負
      s2(r) {
        const kind = turn(r, '62s2', 3), yes = r.chance(0.65);
        let A, v, l = null;
        if (kind === 0) {
          const a = r.int(-3, 6), d = r.intNot(-3, 6, x => x === a), e = r.pick([-3, -2, -1, 1, 2, 3]), up = r.chance(0.5);
          A = up ? [[a, e], [0, d]] : [[a, 0], [e, d]];
          const s = r.pick([1, 2, -1]);
          // 上の三角：(1, 0) が固有値 a、下の三角：(0, 1) が固有値 d
          if (yes) { v = up ? [s, 0] : [0, s]; l = up ? a : d; } else v = up ? [0, s] : [s, 0];
        } else if (kind === 1) {
          const s = r.pick([1, 2, 3]), t = r.pick([-2, -1, 1, 2]), pp = r.pick([1, 2, -1]), qq = r.pick([1, 2, 3, -2]);
          A = [[pp * s, pp * t], [qq * s, qq * t]];   // 行列式0
          if (A.flat().some(x => x === 0)) return null;
          if (yes) { v = norm([t, -s]); l = 0; } else { v = [r.int(1, 2), r.pick([1, 2, 3])]; if (Math.abs(mulv(A, v)[0] * v[1] - mulv(A, v)[1] * v[0]) < 1e-9) return null; }
        } else {
          const g = genInt(r, { lo: -5, hi: 4, vmax: 3, bad: (B, l1, l2) => l2 >= 0 || same(B, EX62) }); if (!g) return null;
          A = g.A;
          if (yes) { v = g.v[1].map(x => -x); l = g.l[1]; } else { v = [r.int(1, 2), r.pick([-1, -2, 1])]; if (Math.abs(mulv(A, v)[0] * v[1] - mulv(A, v)[1] * v[0]) < 1e-9) return null; }
        }
        const Av = mulv(A, v);
        return { q: `$A=${pm(A)}$ で、$${vt(v)}$ は固有ベクトルか`, a: yes ? `固有値 $${l}$` : 'ちがう', key: kA(A), easyCheck: false,
          easy: `$A\\vec v=${vt(Av)}$${yes ? (l === 0 ? '＝$\\vec 0$（0倍）' : `、どちらも $${l}$ 倍${kind === 0 ? '（0の成分は0のまま）' : ''}`) : '、倍率がそろわない'}`,
          verify: p => (p.a === 'ちがう' ? (Math.abs(Av[0] * v[1] - Av[1] * v[0]) > 1e-9 || '平行なのに「ちがう」') : (isEig(A, v, valsOf(p.a)[0][0]) || '固有値がちがう')) };
      },
      // 見かけがちがう：3×3 の行列・連立の式の形
      s3(r) {
        const yes = r.chance(0.6);
        if (turn(r, '62s3', 2) === 0) {
          for (let k = 0; k < 200; k++) {
            const v = [1, r.pick([-1, 0, 1, 2]), r.pick([-1, 1, 2, 0])]; if (v[1] === 0 && v[2] === 0) continue;
            const l = r.pick([-2, -1, 1, 2, 3, 4, 5, 6]);
            const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-2, 4)));
            for (let i = 0; i < 3; i++) A[i][0] = l * v[i] - A[i][1] * v[1] - A[i][2] * v[2];
            if (!yes) { const i = r.int(0, 2), j = r.pick([1, 2]); if (v[j] === 0) continue; A[i][j] += r.pick([-1, 1]); }
            if (A.flat().some(x => Math.abs(x) > 9)) continue;
            const Av = mulv(A, v), par = Av.every((x, i) => Math.abs(x * v[0] - Av[0] * v[i]) < 1e-9);
            if (par !== yes) continue;
            return { q: `$A=${pm(A)}$ で、$${vt(v)}$ は固有ベクトルか`, a: yes ? `固有値 $${l}$` : 'ちがう', key: kA(A), easyCheck: false,
              easy: `$A\\vec v=${vt(Av)}$${yes ? `、どれも $${l}$ 倍` : '、倍率がそろわない'}（3×3 でも同じ）`,
              verify: p => (p.a === 'ちがう' ? (!Av.every((x, i) => near(x * v[0], Av[0] * v[i])) || '平行なのに「ちがう」') : (isEig(A, v, valsOf(p.a)[0][0]) || '固有値がちがう')) };
          }
          return null;
        }
        const g = genInt(r, { lo: -4, hi: 5, vmax: 3, bad: A => same(A, EX62) }); if (!g) return null;
        const A = g.A, i = r.int(0, 1);
        let v = g.v[i], l = g.l[i];
        if (!yes) { v = [r.int(1, 2), r.pick([-1, 1, 2, -2])]; if (Math.abs(mulv(A, v)[0] * v[1] - mulv(A, v)[1] * v[0]) < 1e-9) return null; l = null; }
        const eq = (k, n) => `\\dot x_${n}=${sum([cf(A[k][0], 'x_1'), cf(A[k][1], 'x_2')])}`;
        const Av = mulv(A, v);
        return { q: `$${eq(0, 1)}$、$${eq(1, 2)}$ を $\\dot{\\vec x}=A\\vec x$ と書いた。この $A$ で、$${vt(v)}$ は固有ベクトルか`, a: yes ? `固有値 $${l}$` : 'ちがう', key: kA(A), easyCheck: false,
          easy: `$A=${pm(A)}$、$A\\vec v=${vt(Av)}$${yes ? `、どちらも $${l}$ 倍` : '、倍率がそろわない'}`,
          verify: p => (p.a === 'ちがう' ? (Math.abs(Av[0] * v[1] - Av[1] * v[0]) > 1e-9 || '平行なのに「ちがう」') : (isEig(A, v, valsOf(p.a)[0][0]) || '固有値がちがう')) };
      },
      // わな：ためすベクトルがない（固有値をすべて）→ 7-64
      trap(r) {
        const g = genInt(r, { lo: -3, hi: 6, bad: A => same(A, EX62) || A[0][1] === A[1][0] }); if (!g) return null;
        return dest({ q: `$A=${pm(g.A)}$ の固有値をすべて`, a: `$${g.l[0]}$、$${g.l[1]}$`, key: kA(g.A), verify: p => valsCheck(p, roots2(g.A)) }, '7-62',
          'ためすベクトルが書いていない。かけて確かめる前に、特性方程式で固有値を出す', ['7-64']);
      },
    },
  });

  // ================================================================ 7-63
  const EX63 = [[[2, 1], [1, 2]], [[-110, 10], [10, -110]], [[-0.1, 0.1], [0.1, -0.1]], [[2, 1], [3, 2]], [[5, 2], [2, 2]]];
  const bad63 = A => EX63.some(B => same(A, B));
  M.add({
    id: '7-63', part: 5, chap: '7-8②③・7-9②', stars: 1,
    title: '$\\begin{pmatrix}a&b\\\\b&a\\end{pmatrix}$ は、$(1,\\ 1)$ で $a+b$ 倍、$(1,\\ -1)$ で $a-b$ 倍',
    mark: '対角の2つが同じで、右上と左下も同じ行列の、固有値・固有ベクトル。',
    futsu: ['$\\det(A-\\lambda I)=(a-\\lambda)^2-b^2$ を展開し、', '特性方程式を解の公式で解いて、', 'それぞれ $(A-\\lambda I)\\vec v=\\vec 0$ を解く'],
    raku: ['主役 $\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ → $2+1=3$、$2-1=1$', '台車 $\\begin{pmatrix}-110&10\\\\10&-110\\end{pmatrix}$ → $-100$、$-120$', '水そう $\\begin{pmatrix}-0.1&0.1\\\\0.1&-0.1\\end{pmatrix}$ → $0$、$-0.2$'],
    why: '$(1,\\ 1)$ をかけると、どの行も $a+b$ になるので $(a+b,\\ a+b)$、つまり $(1,\\ 1)$ の $a+b$ 倍。$(1,\\ -1)$ をかけると $(a-b,\\ b-a)$、つまり $(1,\\ -1)$ の $a-b$ 倍。教科書の主役・台車・水そうの行列は、みなこの形（7-8③）。6-14 で「和と差」でほどけたのも、このため（7-9②）。',
    caution: '対角が同じでも、右上と左下がちがう（$\\begin{pmatrix}2&1\\\\3&2\\end{pmatrix}$）と使えない。右上と左下が同じでも、対角がちがう（$\\begin{pmatrix}5&2\\\\2&2\\end{pmatrix}$）と使えない。$b$ が負なら $a-b$ のほうが大きい。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '40mm', s3: '24mm', trap: '16mm' },
    fits(q) {
      if (/\^\{\d+\}|R\^\{\\mathsf T\}|点|物差し/.test(q)) return false;
      const A = mat22(q);
      return symEq(A) && /固有|主応力|主方向/.test(q);
    },
    steps: {
      // 固有値（整数）
      s1(r) {
        const a = r.int(-5, 9), b = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), A = [[a, b], [b, a]];
        if (bad63(A)) return null;
        return { q: `$${pm(A)}$ の固有値`, a: `$${a + b}$、$${a - b}$`, key: kA(A), easyCheck: false,
          easy: `$${a}+${b < 0 ? `(${b})` : b}=${a + b}$、$${a}-${b < 0 ? `(${b})` : b}=${a - b}$`, verify: p => valsCheck(p, roots2(A)) };
      },
      // 固有値と固有ベクトル（小数・負の数もまぜる）
      s2(r) {
        const dec = r.chance(0.4);
        const a = dec ? r.pick([-0.5, -0.4, -0.3, 0.2, 0.5, 0.6, 1.5]) : r.int(-12, 12), b = dec ? r.pick([-0.3, -0.2, -0.1, 0.1, 0.2, 0.3, 0.4]) : r.pick([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 7, 10]);
        const A = [[a, b], [b, a]]; if (bad63(A)) return null;
        return { q: `$${pm(A)}$ の固有値と固有ベクトル`, a: `$${fmt(a + b)}$：$(1,\\ 1)$、$${fmt(a - b)}$：$(1,\\ -1)$`, key: kA(A), easyCheck: false,
          easy: `$(1,\\ 1)$ で $a+b$、$(1,\\ -1)$ で $a-b$`, verify: p => pairsCheck(p, A) };
      },
      // 見かけがちがう：台車・水そうの連立の式、応力
      s3(r) {
        const kind = turn(r, '63s3', 3);
        if (kind === 0) {
          const kk = r.pick([50, 100, 200, 300]), K = r.pick([10, 20, 25, 50, 100]), m = r.pick([1, 2]), d = -(kk + K) / m, o = K / m;
          if (!Number.isInteger(d) || !Number.isInteger(o)) return null;
          const A = [[d, o], [o, d]]; if (bad63(A)) return null;
          return { q: `台車2つの式 $\\ddot x_1=${sum([cf(d, 'x_1'), cf(o, 'x_2')])}$、$\\ddot x_2=${sum([cf(o, 'x_1'), cf(d, 'x_2')])}$ の、係数の行列の固有値`, a: `$${d + o}$、$${d - o}$`, key: kA(A), easyCheck: false,
            easy: `係数の行列 $${pm(A)}$ は $a=${d}$、$b=${o}$ の形`, verify: p => valsCheck(p, roots2(A)) };
        }
        if (kind === 1) {
          const c = r.pick([0.05, 0.2, 0.3, 0.4, 0.5]), A = [[-c, c], [c, -c]];
          return { q: `2つの水そうの水位の式 $\\dot h_1=${sum([cf(-c, 'h_1'), cf(c, 'h_2')])}$、$\\dot h_2=${sum([cf(c, 'h_1'), cf(-c, 'h_2')])}$ の、係数の行列の固有値と固有ベクトル`, a: `$0$：$(1,\\ 1)$、$${fmt(-2 * c)}$：$(1,\\ -1)$`, key: kA(A), easyCheck: false,
            easy: `係数の行列 $${pm(A)}$。$a+b=0$、$a-b=${fmt(-2 * c)}$`, verify: p => pairsCheck(p, A) };
        }
        const a = r.pick([20, 30, 40, 50, 60, 80, -20]), b = r.pick([10, 20, 30, 40, -10, -30]), A = [[a, b], [b, a]];
        return { q: `応力の行列 $${pm(A)}$（MPa）の主応力（固有値）`, a: `$${U(a + b, 'MPa')}$、$${U(a - b, 'MPa')}$`, key: kA(A), easyCheck: false,
          easy: `$a+b=${a + b}$、$a-b=${a - b}$`, verify: p => valsCheck(p, roots2(A)) };
      },
      // わな：対角は同じだが、右上と左下がちがう → 7-64
      trap(r) {
        const s = r.pick([1, 2, 3, 4, 6]), b = r.pick([1, 2, 3, 4, 6, 8, 9]), c = s * s / b;
        if (!Number.isInteger(c) || c === b) return null;
        const a = r.int(-2, 6), A = r.chance(0.5) ? [[a, b], [c, a]] : [[a, c], [b, a]];
        if (bad63(A)) return null;
        return dest({ q: `$${pm(A)}$ の固有値`, a: `$${a + s}$、$${a - s}$`, key: kA(A), verify: p => valsCheck(p, roots2(A)) }, '7-63',
          '右上と左下がちがうので、$(1,\\ 1)$ は固有ベクトルでない（$a\\pm b$ にならない）。特性方程式で');
      },
    },
  });

  // ================================================================ 7-64
  const EX64 = [[[5, 2], [2, 2]], [[1, 4], [2, 3]]];
  const bad64 = A => EX64.some(B => same(A, B));
  const charEq = A => { const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return `${sum(['\\lambda^2', cf(-tr, '\\lambda'), fmt(det)])}=0`; };
  M.add({
    id: '7-64', part: 5, chap: '7-8⑥ 例題5・⑨', stars: 1,
    title: '特性方程式は展開しないで $\\lambda^2-(a+d)\\lambda+\\det A=0$（確かめ：固有値の和＝$a+d$、積＝$\\det A$）',
    mark: '2×2 の行列の「特性方程式」「固有値」。',
    futsu: ['$\\det(A-\\lambda I)$ を', '$(5-\\lambda)(2-\\lambda)-2\\times2$ と書き、', '$10-5\\lambda-2\\lambda+\\lambda^2-4$ と展開して、まとめる'],
    raku: ['$\\begin{pmatrix}5&2\\\\2&2\\end{pmatrix}$：$a+d=7$、$\\det A=6$', '→ $\\lambda^2-7\\lambda+6=0$ → $6$ と $1$', '$\\begin{pmatrix}1&4\\\\2&3\\end{pmatrix}$ → $\\lambda^2-4\\lambda-5=0$ → $5$ と $-1$'],
    why: '$\\det(A-\\lambda I)=(a-\\lambda)(d-\\lambda)-bc=\\lambda^2-(a+d)\\lambda+(ad-bc)$ なので、$\\lambda$ の係数は対角成分の和に $-$ をつけたもの、定数項は行列式（7-8⑥）。固有値を $\\lambda_1$、$\\lambda_2$ とすると、解と係数の関係から $\\lambda_1+\\lambda_2=a+d$、$\\lambda_1\\lambda_2=\\det A$（2つの確かめの式）。',
    caution: '$\\lambda$ の係数は $-(a+d)$（$a+d$ が負なら $+$）。定数項は $ad-bc$ で、$ad+bc$ ではない。$\\lambda$ は対角成分からだけひく（全部の成分からひかない）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '20mm', s3: '26mm', trap: '20mm' },
    fits(q) {
      if (/は固有ベクトルか|R\^\{\\mathsf T\}|\^\{\d+\}|くり返しかけ/.test(q)) return false;
      const A = matsIn(q).find(is22) || coefMat(q);
      return !!A && /固有値|特性方程式|主応力/.test(tail(q));
    },
    steps: {
      // 特性方程式を書く
      s1(r) {
        const A = [[r.int(-4, 8), r.int(-4, 6)], [r.int(-4, 6), r.int(-4, 8)]];
        if (bad64(A) || A[0][1] === 0 || A[1][0] === 0) return null;
        return { q: `$${pm(A)}$ の特性方程式`, a: `$${charEq(A)}$`, key: kA(A), easyCheck: false,
          easy: `$a+d=${A[0][0] + A[1][1]}$、$\\det A=${A[0][0] * A[1][1] - A[0][1] * A[1][0]}$`,
          verify: p => { const L = strip(p.a).replace(/=0$/, ''); return [0.37, 1.3, -2.1].every(x => near(M.evalMath(L, { lambda: x }), (A[0][0] - x) * (A[1][1] - x) - A[0][1] * A[1][0])) || '特性方程式がちがう'; } };
      },
      // 固有値（整数）
      s2(r) {
        const g = genInt(r, { lo: -4, hi: 8, bad: A => bad64(A) }); if (!g) return null;
        return { q: `$${pm(g.A)}$ の固有値`, a: `$${g.l[0]}$、$${g.l[1]}$`, key: kA(g.A), easyCheck: false,
          easy: `$${charEq(g.A)}$`, verify: p => valsCheck(p, roots2(g.A)) };
      },
      // 見かけがちがう：√ の答え・1つがわかっていて、もう1つ・連立の式
      s3(r) {
        const kind = turn(r, '64s3', 3);
        if (kind === 0) {
          const A = [[r.int(-3, 7), r.int(-3, 5)], [r.int(-3, 5), r.int(-3, 7)]], tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
          if (tr % 2 || A[0][1] === 0 || A[1][0] === 0 || bad64(A)) return null;
          const n = (tr / 2) ** 2 - det; if (n <= 0 || isSq(n)) return null;
          const m = tr / 2, sq = sqrtTeX(n);
          return { q: `$${pm(A)}$ の固有値`, a: `$${m === 0 ? '' : m}\\pm${sq}$`, key: kA(A), easyCheck: false,
            easy: `$${charEq(A)}$ を解の公式で`, verify: p => valsCheck(p, roots2(A)) };
        }
        if (kind === 1) {
          const g = genInt(r, { lo: -5, hi: 9, bad: A => bad64(A) }); if (!g) return null;
          const i = r.int(0, 1);
          return { q: `$${pm(g.A)}$ の固有値の1つは $${g.l[i]}$。もう1つの固有値`, a: `$${g.l[1 - i]}$`, key: kA(g.A), easyCheck: false,
            easy: `和が $a+d=${g.A[0][0] + g.A[1][1]}$ なので、$${g.A[0][0] + g.A[1][1]}-${g.l[i] < 0 ? `(${g.l[i]})` : g.l[i]}$`,
            verify: p => { const v = valsOf(p.a); return (v.length === 1 && sameSet([[g.l[i], 0], v[0]], roots2(g.A))) || 'もう1つの固有値がちがう'; } };
        }
        const g = genInt(r, { lo: -4, hi: 6, bad: A => bad64(A) || A[0][1] === A[1][0] }); if (!g) return null;
        const A = g.A, eq = (k, x) => `\\dot ${x}=${sum([cf(A[k][0], 'x'), cf(A[k][1], 'y')])}`;
        return { q: `$${eq(0, 'x')}$、$${eq(1, 'y')}$ の、係数の行列の固有値`, a: `$${g.l[0]}$、$${g.l[1]}$`, key: kA(A), easyCheck: false,
          easy: `係数の行列 $${pm(A)}$。$${charEq(A)}$`, verify: p => valsCheck(p, roots2(A)) };
      },
      // わな：3×3 → べき乗法（7-70）
      trap(r) {
        for (let k = 0; k < 200; k++) {
          const s = r.int(6, 10), A = [];
          for (let i = 0; i < 3; i++) { const x = r.int(1, s - 2), y = r.int(1, s - x - 1); A.push(r.shuffle([x, y, s - x - y])); }
          if (A.flat().some(x => x < 1)) continue;
          // 確かめ：(1, 0, 0) から 300 回かけて、倍率が s に近づく（問題を作った「行の和」とは別の道すじ）
          return dest({ q: `$A=${pm(A)}$ の、いちばん大きい固有値`, a: `$${s}$`, key: kA(A),
            verify: p => { let x = [1, 0, 0], ratio = 0; for (let t = 0; t < 300; t++) { const y = mulv(A, x), n = Math.hypot(...y); ratio = n / Math.hypot(...x); x = y.map(z => z / n); } return near(ratio, valsOf(p.a)[0][0], 1e-6) || 'いちばん大きい固有値がちがう'; } }, '7-64',
            '3×3 の特性方程式は3次方程式で、手では解きにくい。$(1,\\ 0,\\ 0)$ にくり返しかけるべき乗法（どの行も和が同じなので $(1,\\ 1,\\ 1)$ にそろう）', ['7-70']);
        }
        return null;
      },
    },
  });

  // ================================================================ 7-65
  const EX65 = [[5, 2], [2, 2]];
  M.add({
    id: '7-65', part: 5, chap: '7-8⑥⑨ 例題5', stars: 1,
    title: '固有ベクトルは $A-\\lambda I$ の1行め $(p,\\ q)$ から $(q,\\ -p)$（2行めは同じ式なので見なくてよい）',
    mark: '固有値がわかっていて、その固有ベクトルを求める。',
    futsu: ['$(A-6I)\\vec v=\\vec 0$ を連立方程式', '$-x+2y=0$、$2x-4y=0$ として', '加減法で解こうとする（答えが1つに決まらない）'],
    raku: ['$\\begin{pmatrix}5&2\\\\2&2\\end{pmatrix}$、$\\lambda=6$：1行め $(-1,\\ 2)$', '→ $(2,\\ 1)$', '$\\lambda=1$：1行め $(4,\\ 2)$ → $(2,\\ -4)$、つまり $(1,\\ -2)$'],
    why: '1行めの式は $px+qy=0$。$(x,\\ y)=(q,\\ -p)$ を入れると $pq-qp=0$ で、いつも成り立つ。$\\lambda$ が固有値なら $\\det(A-\\lambda I)=0$ で、2行めは1行めと平行（同じ式）なので、見なくてよい（7-8⑥）。成分を公約数でわって、いちばん小さい整数の組にする。',
    caution: '1行めが $(0,\\ 0)$ のときは2行めを使う。2行めが1行めと同じ式にならないときは、$\\lambda$ が固有値でない（計算をまちがえている）。$(q,\\ -p)$ の $-$ を落とさない。答えは何倍でも正しい。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '50mm' },
    fits(q) {
      const m = /\\lambda=(-?[\d.]+)\$ の固有ベクトル|固有値 \$(-?[\d.]+)\$ の固有ベクトル|主応力 \$(-?[\d.]+)\\,\\mathrm\{MPa\}\$ の主方向/.exec(q);
      if (!m) return false;
      const l = +(m[1] || m[2] || m[3]), A = mat22(q);
      return is22(A) && near((A[0][0] - l) * (A[1][1] - l) - A[0][1] * A[1][0], 0, 1e-9);
    },
    steps: {
      // 整数の行列、λ が書いてある
      s1(r) {
        const g = genInt(r, { lo: -3, hi: 7, vmax: 4, bad: A => same(A, EX65) }); if (!g) return null;
        const i = r.int(0, 1), A = g.A, l = g.l[i], row = [A[0][0] - l, A[0][1]];
        return { q: `$A=${pm(A)}$ の、$\\lambda=${l}$ の固有ベクトル`, a: `$${vt(g.v[i])}$`, key: kA(A), easyCheck: false,
          easy: `1行め $${vt(row)}$ → $${vt([row[1], -row[0]])}$`, verify: p => vecCheck(p, A, l) };
      },
      // 1行めが0 → 2行め、公約数でわる・λ が負
      s2(r) {
        if (turn(r, '65s2', 2) === 0) {
          const l = r.int(-3, 6), c = r.pick([-3, -2, -1, 1, 2, 3, 4]), d = r.intNot(-3, 6, x => x === l), A = [[l, 0], [c, d]];
          const v = norm([d - l, -c]);
          return { q: `$A=${pm(A)}$ の、$\\lambda=${l}$ の固有ベクトル`, a: `$${vt(v)}$`, key: kA(A), easyCheck: false,
            easy: `1行め $(0,\\ 0)$ なので2行め $${vt([c, d - l])}$ → $${vt([d - l, -c])}$`, verify: p => vecCheck(p, A, l) };
        }
        const g = genInt(r, { lo: -6, hi: 6, vmax: 4, bad: (A, l1, l2) => same(A, EX65) || l2 >= 0 || gcd(A[0][0] - l2, A[0][1]) < 2 }); if (!g) return null;
        const A = g.A, l = g.l[1], row = [A[0][0] - l, A[0][1]];
        return { q: `$A=${pm(A)}$ の、$\\lambda=${l}$ の固有ベクトル`, a: `$${vt(g.v[1])}$`, key: kA(A), easyCheck: false,
          easy: `1行め $${vt(row)}$ → $${vt([row[1], -row[0]])}$ を $${gcd(row[0], row[1])}$ でわる`, verify: p => vecCheck(p, A, l) };
      },
      // 見かけがちがう：応力の主方向・状態の行列
      s3(r) {
        if (turn(r, '65s3', 2) === 0) {
          const g = genInt(r, { lo: -3, hi: 8, sym: true, vmax: 3, bad: A => A[0][0] === A[1][1] }); if (!g) return null;
          const A = g.A.map(row => row.map(x => 10 * x)), i = r.int(0, 1), l = 10 * g.l[i];
          return { q: `応力の行列 $${pm(A)}$（MPa）で、主応力 $${U(l, 'MPa')}$ の主方向（固有ベクトル）`, a: `$${vt(g.v[i])}$`, key: kA(A), easyCheck: false,
            easy: `1行め $${vt([A[0][0] - l, A[0][1]])}$ → $${vt([A[0][1], l - A[0][0]])}$`, verify: p => vecCheck(p, A, l) };
        }
        const pp = r.int(1, 4), qq = r.int(pp + 1, 6), l = -r.pick([pp, qq]), A = [[0, 1], [-pp * qq, -(pp + qq)]];
        if ((pp === 1 && qq === 3) || (pp === 1 && qq === 2)) return null;
        return { q: `$${ode(1, pp + qq, pp * qq)}$ の状態の行列 $${pm(A)}$ の、固有値 $${l}$ の固有ベクトル`, a: `$${vt([1, l])}$`, key: kA(A), easyCheck: false,
          easy: `1行め $${vt([-l, 1])}$ → $${vt([1, l])}$`, verify: p => vecCheck(p, A, l) };
      },
      // わな：書いてある λ が固有値でない → 7-64
      trap(r) {
        const g = genInt(r, { lo: -2, hi: 7, bad: A => same(A, EX65) || symEq(A) }); if (!g) return null;
        const bad = r.intNot(Math.min(...g.l) - 2, Math.max(...g.l) + 2, x => g.l.includes(x)), A = g.A;
        return dest({ q: `$A=${pm(A)}$ の、$\\lambda=${bad}$ の固有ベクトル`, a: `$${bad}$ は固有値でない（固有値は $${g.l[0]}$、$${g.l[1]}$）`, key: kA(A),
          verify: p => { const v = valsOf(p.a); return (v.length === 3 && cnear(v[0], [bad, 0]) && !near((A[0][0] - bad) * (A[1][1] - bad) - A[0][1] * A[1][0], 0) && sameSet(v.slice(1), roots2(A))) || '固有値の答えがちがう'; } }, '7-65',
          `$A-${bad < 0 ? `(${bad})` : bad}I$ の2つの行が平行にならない（$\\det\\neq0$）ので、$\\vec 0$ しか出ない。先に特性方程式で固有値を出す`, ['7-64']);
      },
    },
  });

  // ================================================================ 7-66
  const EX66 = [[2, 200, 100], [1, 16, 10]];   // 左ページの例（m、k、K）
  const bad66 = (m, k, K) => EX66.some(e => e[0] === m && e[1] === k && e[2] === K);
  const cartB = (m, k, K) => [[-(k + K) / m, K / m], [K / m, -(k + K) / m]];
  const wTeX = w2 => (isSq(w2) ? String(Math.sqrt(w2)) : sqrtTeX(w2));   // ω² → ω（√ を残した形）
  const cartTxt = (m, k, K) => `質量 $m=${U(fmt(m), 'kg')}$ の台車2つを、外側のばね $k=${U(fmt(k), 'N/m')}$ 2本と、つなぎのばね $K=${U(fmt(K), 'N/m')}$ でつないだ`;
  const MODE_Q = '2つのモードの角振動数（いっしょ・反対）';
  // 答えの角振動数（いっしょ、反対の順）を、B に (1, 1)・(1, −1) をかけて確かめる（ω² = −λ）
  function modeCheck(ws, B) {
    if (ws.length !== 2 || ws.some(w => !isFinite(w))) return '角振動数が2つない';
    const b1 = mulv(B, [1, 1]), b2 = mulv(B, [1, -1]);
    return (near(b1[0], b1[1]) && near(b2[0], -b2[1]) && near(-b1[0], ws[0] ** 2, 1e-9) && near(-b2[0], ws[1] ** 2, 1e-9)) || 'モードの角振動数がちがう';
  }
  const wsOf = a => valsOf(a).map(z => (z && Math.abs(z[1]) < 1e-12 ? z[0] : NaN));
  // 図：かべ・ばね3本・台車2つ・ずれ x1、x2（教科書 7-8③ の図と同じ形）
  function cartFig() {
    const W = 12, y = 0.9, its = [['seg', [0, 0], [W, 0]], ['seg', [0, 0], [0, 2.2]], ['seg', [W, 0], [W, 2.2]]];
    for (let t = 0.1; t < 2.1; t += 0.5) its.push(['seg', [0, t], [-0.35, t + 0.35]], ['seg', [W, t], [W + 0.35, t + 0.35]]);
    its.push(...M.figSpring([0, y], [2.6, y], { n: 5, w: 0.22 }), ...M.figSpring([4.4, y], [7.6, y], { n: 6, w: 0.22 }), ...M.figSpring([9.4, y], [W, y], { n: 5, w: 0.22 }));
    its.push(['poly', [[2.6, 0.15], [4.4, 0.15], [4.4, 1.65], [2.6, 1.65]], { fill: true }], ['poly', [[7.6, 0.15], [9.4, 0.15], [9.4, 1.65], [7.6, 1.65]], { fill: true }]);
    its.push(['label', [3.5, 0.9], '$m$', 'c'], ['label', [8.5, 0.9], '$m$', 'c']);
    its.push(['label', [1.3, 1.25], '$k$', 'n'], ['label', [6, 1.25], '$K$', 'n'], ['label', [10.7, 1.25], '$k$', 'n']);
    its.push(['seg', [3.5, -0.6], [4.9, -0.6], { arrow: true }], ['label', [4.9, -0.6], '$x_1$', 'e'], ['seg', [8.5, -0.6], [9.9, -0.6], { arrow: true }], ['label', [9.9, -0.6], '$x_2$', 'e']);
    return { s: 4.4, items: its };
  }
  // 質量がちがう台車（m1、m2、k、K、ω1²、ω2²）：ω² が整数になる組（数でさがした）
  const T66 = [[1, 2, 8, 6, 5, 16], [1, 2, 10, 4, 6, 15], [1, 2, 16, 12, 10, 32], [1, 2, 20, 8, 12, 30], [1, 2, 24, 18, 15, 48], [1, 2, 28, 6, 16, 35], [1, 2, 36, 10, 21, 48],
    [1, 3, 18, 15, 8, 36], [1, 3, 30, 9, 12, 40], [1, 4, 12, 8, 4, 21], [1, 4, 24, 16, 8, 42], [2, 3, 18, 12, 7, 18], [2, 3, 24, 6, 9, 16], [2, 3, 48, 12, 18, 32]];
  // m、ω1²、ω2² から k、K（K>0、整数）。だめなら null
  function cartOf(m, w1s, w2s) {
    const k = m * w1s, K = m * (w2s - w1s) / 2;
    if (!(K > 0) || !Number.isInteger(k) || !Number.isInteger(K) || k > 600 || K > 600 || bad66(m, k, K)) return null;
    return { k, K };
  }
  M.add({
    id: '7-66', part: 5, chap: '7-8③ 例題2', stars: 1,
    title: '台車2つのモードは $(1,\\ 1)$「いっしょ」と $(1,\\ -1)$「反対」：$\\omega=\\sqrt{-\\lambda}$、$\\omega_1^2=\\dfrac km$、$\\omega_2^2=\\dfrac{k+2K}{m}$',
    mark: '同じ質量 $m$ の台車2つ、外側のばね $k$、つなぎのばね $K$。2つのモードの角振動数。',
    futsu: ['$B$ の対角 $-\\dfrac{k+K}{m}$、ほか $\\dfrac Km$ を作り、', '特性方程式 $\\det(B-\\lambda I)=0$ を解いて、', '$\\omega=\\sqrt{-\\lambda}$ を2つ計算する'],
    raku: ['$m=2$、$k=200$、$K=100$', '→ $\\omega_1^2=\\dfrac{200}{2}=100$、$\\omega_1=10$', '→ $\\omega_2^2=\\dfrac{400}{2}=200$、$\\omega_2=10\\sqrt2\\approx14.1$'],
    why: 'いっしょに動く $(1,\\ 1)$ では、つなぎのばねはのびないので、外側のばね $k$ だけがはたらく：$\\omega_1^2=\\frac km$。反対に動く $(1,\\ -1)$ では、つなぎのばねは片方の台車のずれの2倍のびるので、$k+2K$ がはたらく：$\\omega_2^2=\\frac{k+2K}{m}$。$B$ の固有値は $-\\omega^2$（7-8③）。$B$ は $\\begin{pmatrix}a&b\\\\b&a\\end{pmatrix}$ の形なので、$a+b=-\\frac km$、$a-b=-\\frac{k+2K}{m}$（わざ 7-63）。',
    caution: '固有値は $-\\omega^2$：符号を変えてから平方根（$\\omega=-100$ や $\\sqrt{-100}$ にしない）。反対のモードは $k+2K$（$k+K$ ではない）。$\\sqrt{\\phantom{2}}$ は外に出せる数を出す（$\\sqrt{200}=10\\sqrt2$）。2つの台車の質量がちがうと、この形にならない。',
    counts: { s1: 2, s2: 2, s3: 1, trap: 2 },
    cols: 1,
    boxw: { s1: '50mm', s2: '50mm', s3: '58mm', trap: '40mm' },
    fits(q) {
      if (!/台車/.test(q) || !/角振動数/.test(q) || /m_1=|m_2=|\$x_[12]\$ *$/.test(q)) return false;
      return /\$k=/.test(q) || symEq(mat22(q));
    },
    steps: {
      // 質量・ばね定数から（角振動数は整数）
      s1(r) {
        const m = r.pick([1, 1, 2, 0.5, 4]), w1 = r.int(2, 9), w2 = r.int(w1 + 1, 14), c = cartOf(m, w1 * w1, w2 * w2); if (!c || c.k > 200 || c.K > 200) return null;
        const B = cartB(m, c.k, c.K);
        return { q: `${cartTxt(m, c.k, c.K)}。${MODE_Q}`, a: `いっしょ $${U(w1, 'rad/s')}$、反対 $${U(w2, 'rad/s')}$`, key: `${m},${c.k},${c.K}`, easyCheck: false,
          easy: `$\\omega_1^2=\\frac{${fmt(c.k)}}{${fmt(m)}}=${w1 * w1}$、$\\omega_2^2=\\frac{${fmt(c.k + 2 * c.K)}}{${fmt(m)}}=${w2 * w2}$`, verify: p => modeCheck(wsOf(p.a), B) };
      },
      // √ が残る角振動数・B が書いてある
      s2(r) {
        if (turn(r, '66s2', 2) === 0) {
          const NICE = [4, 8, 9, 12, 16, 18, 20, 25, 27, 32, 36, 45, 48, 49, 50, 64, 72, 75, 80, 98, 100, 108, 128, 147, 150, 200, 300];   // √ が簡単になる ω²
          const m = r.pick([1, 2, 0.5]), w1s = r.pick(NICE.slice(0, 16)), w2s = r.pick(NICE.filter(x => x > w1s + 2));
          if (isSq(w1s) && isSq(w2s)) return null;
          const c = cartOf(m, w1s, w2s); if (!c) return null;
          const B = cartB(m, c.k, c.K);
          return { q: `${cartTxt(m, c.k, c.K)}。${MODE_Q}`, a: `いっしょ $${U(wTeX(w1s), 'rad/s')}$、反対 $${U(wTeX(w2s), 'rad/s')}$`, key: `${m},${c.k},${c.K}`, easyCheck: false,
            easy: `$\\omega_1^2=${w1s}$、$\\omega_2^2=${w2s}$`, verify: p => modeCheck(wsOf(p.a), B) };
        }
        const w1s = r.pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 50, 20]), w2s = w1s + 2 * r.pick([2, 5, 10, 18, 20, 25, 50]);
        const o = (w2s - w1s) / 2, B = [[-(w1s + o), o], [o, -(w1s + o)]];
        if (EX66.some(e => same(B, cartB(...e)))) return null;
        return { q: `台車2つの $\\ddot{\\vec x}=B\\vec x$ で、$B=${pm(B)}$。${MODE_Q}`, a: `いっしょ $${U(wTeX(w1s), 'rad/s')}$、反対 $${U(wTeX(w2s), 'rad/s')}$`, key: kA(B), easyCheck: false,
          easy: `$a+b=${-w1s}$、$a-b=${-w2s}$ → $\\omega=\\sqrt{-\\lambda}$`, verify: p => modeCheck(wsOf(p.a), B) };
      },
      // 図と、約の値（√2=1.414、√3=1.732。O-4）
      s3(r) {
        const m = r.pick([1, 2, 0.5]), w1 = r.int(2, 9), n = r.pick([2, 3]), cc = r.int(Math.ceil(w1 / Math.sqrt(n)) + 1, 10), w2s = n * cc * cc;
        const c = cartOf(m, w1 * w1, w2s); if (!c) return null;
        const SQ = { 2: 1.414, 3: 1.732 }, ap = (cc * SQ[n]).toFixed(1);
        if (ap !== (cc * Math.sqrt(n)).toFixed(1)) return null;   // 文の値で計算した答えと、ほんとうの値の丸めがくいちがう組は出さない（O-4）
        const B = cartB(m, c.k, c.K);
        return { q: `図の台車2つ（$m=${U(fmt(m), 'kg')}$、$k=${U(fmt(c.k), 'N/m')}$、$K=${U(fmt(c.K), 'N/m')}$）の、${MODE_Q}。$\\sqrt{${n}}=${SQ[n]}$ として、約の値も小数第1位まで`,
          a: `いっしょ $${U(w1, 'rad/s')}$、反対 $${cc}\\sqrt{${n}}\\approx${U(ap, 'rad/s')}$`, key: `${m},${c.k},${c.K}`, easyCheck: false, fig: cartFig(),
          easy: `$\\omega_2^2=\\frac{${fmt(c.k + 2 * c.K)}}{${fmt(m)}}=${w2s}$、$\\sqrt{${w2s}}=${cc}\\sqrt{${n}}=${cc}\\times${SQ[n]}$`,
          verify: p => {
            const ms = maths(p.a), ex = noUnit(ms[1] || '').split('\\approx');
            const ws = [M.evalMath(noUnit(ms[0] || ''), {}), M.evalMath(ex[0], {})];
            const okAp = ex.length === 2 && +ex[1] === Math.round(M.evalMath(ex[0].replace(`\\sqrt{${n}}`, `\\times${SQ[n]}`), {}) * 10) / 10;
            return (okAp && /約|approx/.test(p.a)) ? modeCheck(ws, B) : '約の値がちがう';
          } };
      },
      // わな：質量がちがう台車 → 楽な形なし
      trap(r) {
        const [m1, m2, k, K, a, b] = r.pick(T66), sw = r.chance(0.5), M1 = sw ? m2 : m1, M2 = sw ? m1 : m2;
        const B = [[-(k + K) / M1, K / M1], [K / M2, -(k + K) / M2]];
        return dest({ q: `質量 $m_1=${U(M1, 'kg')}$ と $m_2=${U(M2, 'kg')}$ の台車を、外側のばね $k=${U(k, 'N/m')}$ 2本と、つなぎのばね $K=${U(K, 'N/m')}$ でつないだ。2つのモードの角振動数`,
          a: `$${U(wTeX(a), 'rad/s')}$ と $${U(wTeX(b), 'rad/s')}$`, key: `t${M1},${M2},${k},${K}`,
          verify: p => sameSet(wsOf(p.a).map(w => [-(w ** 2), 0]), roots2(B)) || '角振動数がちがう' }, '7-66',
          '質量がちがうと $B$ が対称にならず、モードは $(1,\\ 1)$・$(1,\\ -1)$ でない。$B$ の特性方程式を解く（numpy の eig でもよい）');
      },
    },
  });

  // ================================================================ 7-67
  const nk = (a, b, c) => `${fmt(b / a)},${fmt(c / a)}`;   // 式を最高次の係数でわった形（同じ式を同じ key に）
  const EX67 = ['4,3', '3,2'];
  const springTxt = (m, c, k) => `$m=${U(fmt(m), 'kg')}$、$c=${U(fmt(c), 'N\\cdot s/m')}$、$k=${U(fmt(k), 'N/m')}$`;
  // 固有値の答えを、状態の行列 (0 1; −k/m −c/m) の特性方程式（解の公式）とくらべる
  const stateA = (m, c, k) => [[0, 1], [-k / m, -c / m]];
  function stateCheck(p, m, c, k) {
    const want = roots2(stateA(m, c, k)), got = valsOf(p.a);
    if (got.length === 1 && got[0] && cnear(want[0], want[1])) return cnear(got[0], want[0]) || '重解の固有値がちがう';
    return sameSet(got, want) || `固有値 ${p.a} がちがう`;
  }
  M.add({
    id: '7-67', part: 5, chap: '7-8⑦ 例題6', stars: 1,
    title: 'ばね・質量・ダンパーの状態の行列の固有値は、$m\\lambda^2+c\\lambda+k=0$ の解（行列を作らず、もとの式からすぐ書く）',
    mark: 'ばね・質量・ダンパーの式 $m\\ddot x+c\\dot x+kx=0$ と「状態の行列 $\\begin{pmatrix}0&1\\\\-\\frac km&-\\frac cm\\end{pmatrix}$ の固有値」。',
    futsu: ['状態の行列 $A=\\begin{pmatrix}0&1\\\\-3&-4\\end{pmatrix}$ を作り、', '$\\det(A-\\lambda I)=(-\\lambda)(-4-\\lambda)+3$ を', '展開して解く'],
    raku: ['$\\ddot x+4\\dot x+3x=0$ → $\\lambda^2+4\\lambda+3=0$', '→ $-1$、$-3$（固有ベクトル $(1,\\ -1)$、$(1,\\ -3)$）', '$2\\ddot x+6\\dot x+4x=0$ → $-1$、$-2$（6-12 の $s$）'],
    why: '$\\det(A-\\lambda I)=(-\\lambda)(-\\frac cm-\\lambda)+\\frac km=\\lambda^2+\\frac cm\\lambda+\\frac km$。$m$ をかけると $m\\lambda^2+c\\lambda+k=0$ で、6-12 の特性方程式 $ms^2+cs+k=0$ と同じ（7-8⑦）。だから、行列を作らずに、もとの式で $\\ddot x\\to\\lambda^2$、$\\dot x\\to\\lambda$、$x\\to1$ と置きかえればよい。',
    caution: '状態の行列の2行めは $-\\frac km$、$-\\frac cm$（$m$ でわって $-$ をつける）。行列が書いてあるときは、2行めの $-$ をとって式にもどす：2行め $(-6,\\ -5)$ → $\\lambda^2+5\\lambda+6=0$。判別式が負なら、固有値は複素数（わざ 7-68）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '24mm', trap: '30mm' },
    fits(q) {
      if (!/状態の行列/.test(q) || !/固有値/.test(tail(q)) || /固有値 \$/.test(q)) return false;
      const o = odeIn(q); return !!o && o[1] * o[1] - 4 * o[0] * o[2] >= 0;
    },
    steps: {
      // 2つの負の整数
      s1(r) {
        const pp = r.int(1, 6), qq = r.int(pp + 1, 8), b = pp + qq, c = pp * qq;
        if (EX67.includes(nk(1, b, c))) return null;
        return { q: `$${ode(1, b, c)}$ の状態の行列の固有値`, a: `$${-pp}$、$${-qq}$`, key: nk(1, b, c), easyCheck: false,
          easy: `$\\lambda^2+${b}\\lambda+${c}=0$`, verify: p => stateCheck(p, 1, b, c) };
      },
      // 係数が1でない式・状態の行列が書いてある
      s2(r) {
        const pp = r.int(1, 5), qq = r.int(pp + 1, 7), b = pp + qq, c = pp * qq;
        if (EX67.includes(nk(1, b, c))) return null;
        if (turn(r, '67s2', 2) === 0) {
          const a = r.pick([2, 3, 4, 0.5]);
          return { q: `$${ode(a, a * b, a * c)}$ の状態の行列の固有値`, a: `$${-pp}$、$${-qq}$`, key: nk(1, b, c), easyCheck: false,
            easy: `$${sum([cf(a, '\\lambda^2'), cf(a * b, '\\lambda'), fmt(a * c)])}=0$`, verify: p => stateCheck(p, a, a * b, a * c) };
        }
        return { q: `状態の行列 $A=${pm(stateA(1, b, c))}$ の固有値`, a: `$${-pp}$、$${-qq}$`, key: nk(1, b, c), easyCheck: false,
          easy: `2行めの $-$ をとって $\\lambda^2+${b}\\lambda+${c}=0$`, verify: p => stateCheck(p, 1, b, c) };
      },
      // 見かけがちがう：ばね・質量・ダンパーの数・重解・移項した形
      s3(r) {
        const kind = turn(r, '67s3', 3);
        if (kind === 0) {
          const m = r.pick([1, 2, 0.5, 4]), pp = r.int(1, 6), qq = r.int(pp + 1, 10);
          if (EX67.includes(nk(1, pp + qq, pp * qq))) return null;
          const c = m * (pp + qq), k = m * pp * qq;
          return { q: `ばね・質量・ダンパー（${springTxt(m, c, k)}）の状態の行列の固有値`, a: `$${-pp}$、$${-qq}$`, key: nk(m, c, k), easyCheck: false,
            easy: `$${sum([cf(m, '\\lambda^2'), cf(c, '\\lambda'), fmt(k)])}=0$`, verify: p => stateCheck(p, m, c, k) };
        }
        if (kind === 1) {
          const pp = r.int(1, 7), a = r.pick([1, 1, 2]);
          return { q: `$${ode(a, a * 2 * pp, a * pp * pp)}$ の状態の行列の固有値`, a: `$${-pp}$（重解）`, key: nk(1, 2 * pp, pp * pp), easyCheck: false,
            easy: `$(\\lambda+${pp})^2=0$`, verify: p => stateCheck(p, a, a * 2 * pp, a * pp * pp) };
        }
        const pp = r.int(1, 7), qq = r.int(pp + 1, 10), b = pp + qq, c = pp * qq;
        if (EX67.includes(nk(1, b, c))) return null;
        return { q: `$\\ddot x=${sum([cf(-c, 'x'), cf(-b, '\\dot x')])}$ の状態の行列の固有値`, a: `$${-pp}$、$${-qq}$`, key: nk(1, b, c), easyCheck: false,
          easy: `移項して $${ode(1, b, c)}$`, verify: p => stateCheck(p, 1, b, c) };
      },
      // わな：固有値ではなく x を聞く（はじめの値つき）→ 楽な形なし
      trap(r) {
        const w = r.int(2, 6), x0 = r.pick(['0.1', '0.2', '0.05', '0.3']);
        return dest({ q: `$${ode(1, 0, w * w)}$、$x(0)=${x0}$、$\\dot x(0)=0$ をみたす $x$`, a: `$${x0}\\cos${w}t$`, key: `t${w}`,
          calc: { kind: 'ode', x: 't', coef: [1, 0, w * w], rhs: '0', init: [[0, +x0], [0, 0, 1]] } }, '7-67',
          `固有値（$\\pm${w}j$）ではなく、$x$ そのものを聞いている。$\\omega=${w}$ のばねで、静かにはなすと $x_0\\cos\\omega t$（第5巻 5-89）`);
      },
    },
  });

  // ================================================================ 7-68
  const EX68 = ['2,10', '6,25'];
  const cpx = (re, im) => `${re === 0 ? '' : fmt(re)}\\pm ${im === 1 ? '' : fmt(im)}j`;   // −1 ± 3j
  // 回転行列 R(θ) の固有値 cosθ ± j sinθ（TeX）
  const ROT = { 45: '\\frac{\\sqrt{2}}{2}\\pm\\frac{\\sqrt{2}}{2}j', 60: '\\frac{1}{2}\\pm\\frac{\\sqrt{3}}{2}j', 90: '\\pm j', 120: '-\\frac{1}{2}\\pm\\frac{\\sqrt{3}}{2}j', 135: '-\\frac{\\sqrt{2}}{2}\\pm\\frac{\\sqrt{2}}{2}j', 150: '-\\frac{\\sqrt{3}}{2}\\pm\\frac{1}{2}j' };
  const rotA = th => { const t = th * Math.PI / 180; return [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]]; };
  const MOVE_Q = 'の状態の行列の固有値と、へり方・角振動数';
  // 「$-1\pm3j$：$e^{-t}$ でへり、$3\,\mathrm{rad/s}$ でゆれる」の確かめ
  function moveCheck(p, m, c, k) {
    const ms = maths(p.a), want = roots2(stateA(m, c, k));
    if (!sameSet(valsOf('$' + ms[0] + '$'), want)) return '固有値がちがう';
    const e = /^e\^\{(-?[\d.]*)t\}$/.exec(ms[1] || ''), w = /^([\d.]+)\\,\\mathrm\{rad\/s\}$/.exec(ms[2] || '');
    const rate = e ? (e[1] === '-' ? -1 : e[1] === '' ? 1 : +e[1]) : NaN;
    return (e && w && near(rate, want[0][0]) && near(+w[1], Math.abs(want[0][1]))) || 'へり方か角振動数がちがう';
  }
  const moveAns = (re, im) => `$${cpx(re, im)}$：$e^{${re === -1 ? '-' : fmt(re)}t}$ でへり、$${U(fmt(im), 'rad/s')}$ でゆれる`;
  M.add({
    id: '7-68', part: 5, chap: '7-8⑧ 例題7', stars: 1,
    title: '複素数の固有値 $p\\pm qj$：実部 $p$ で「$e^{pt}$ でへる」、虚部 $q$ が角振動数',
    mark: '判別式が負になる式・行列の固有値と、その動き。',
    futsu: ['特性方程式を解の公式で $\\lambda=\\dfrac{-2\\pm\\sqrt{4-40}}{2}$ と解き、', 'オイラーの公式で $e^{(-1+3j)t}=e^{-t}(\\cos3t+j\\sin3t)$', 'と開いてから、動きを読む'],
    raku: ['$\\ddot x+2\\dot x+10x=0$ → $-1\\pm3j$', '→ $e^{-t}$ でへり、$3\\,\\mathrm{rad/s}$ でゆれる', '$\\ddot x+6\\dot x+25x=0$ → $-3\\pm4j$。$R(30^{\\circ})$ → $\\cos30^{\\circ}\\pm j\\sin30^{\\circ}$'],
    why: '$\\lambda^2+b\\lambda+c=0$ の判別式が負なら、解は $-\\frac b2\\pm j\\sqrt{c-\\frac{b^2}{4}}$。$e^{(p+qj)t}=e^{pt}(\\cos qt+j\\sin qt)$（6-10）なので、実部 $p$ は大きさの変わり方（負ならへる）、虚部 $q$ は回る速さ（角振動数）（7-8⑧）。回転行列 $R(\\theta)$ の固有値は $\\cos\\theta\\pm j\\sin\\theta$ で、偏角が回る角。',
    caution: '$\\sqrt{\\phantom{2}}$ の中が負なら $\\sqrt{-36}=6j$。最後に2でわるのを忘れない（$-2\\pm6j$ ではなく $-1\\pm3j$）。角振動数は虚部 $q$（$\\sqrt{10}$ ではない）。判別式が正なら、固有値は実数で、ゆれない（わざ 7-67）。',
    counts: { s1: 6, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '62mm', s3: '40mm', trap: '62mm' },
    fits(q) {
      if (/R\(\d+\^\{\\circ\}\)/.test(q)) return /固有値/.test(tail(q));
      if (!/状態の行列/.test(q) || !/固有値/.test(q) || /固有値 \$/.test(q)) return false;
      const o = odeIn(q); return !!o && o[1] * o[1] - 4 * o[0] * o[2] < 0;
    },
    steps: {
      s1(r) {
        const pp = r.int(1, 4), qq = r.int(1, 6), b = 2 * pp, c = pp * pp + qq * qq;
        if (EX68.includes(nk(1, b, c))) return null;
        return { q: `$${ode(1, b, c)}$ の状態の行列の固有値`, a: `$${cpx(-pp, qq)}$`, key: nk(1, b, c), easyCheck: false,
          easy: `$\\lambda=\\frac{-${b}\\pm\\sqrt{${b * b}-${4 * c}}}{2}$`, verify: p => stateCheck(p, 1, b, c) };
      },
      // 固有値と、へり方・角振動数（係数が1でない式もまぜる）
      s2(r) {
        const pp = r.int(1, 4), qq = r.int(1, 6), b = 2 * pp, c = pp * pp + qq * qq, a = r.pick([1, 1, 2, 4]);
        if (EX68.includes(nk(1, b, c))) return null;
        return { q: `$${ode(a, a * b, a * c)}$ ${MOVE_Q}`, a: moveAns(-pp, qq), key: nk(1, b, c), easyCheck: false,
          easy: `実部 $${-pp}$、虚部 $${qq}$`, verify: p => moveCheck(p, a, a * b, a * c) };
      },
      // 見かけがちがう：回転行列・ばね・質量・ダンパーの数
      s3(r) {
        if (turn(r, '68s3', 2) === 0) {
          const th = r.pick(Object.keys(ROT).map(Number)), A = rotA(th);
          return { q: `回転行列 $R(${th}^{\\circ})$ の固有値`, a: `$${ROT[th]}$`, key: `R${th}`, easyCheck: false,
            easy: `$\\cos${th}^{\\circ}\\pm j\\sin${th}^{\\circ}$`, verify: p => sameSet(valsOf(p.a), roots2(A)) || '固有値がちがう' };
        }
        const m = r.pick([1, 2, 0.5]), pp = r.int(1, 4), qq = r.int(1, 6), c = m * 2 * pp, k = m * (pp * pp + qq * qq);
        if (EX68.includes(nk(m, c, k))) return null;
        return { q: `ばね・質量・ダンパー（${springTxt(m, c, k)}）${MOVE_Q}`, a: moveAns(-pp, qq), key: nk(m, c, k), easyCheck: false,
          easy: `$${sum([cf(m, '\\lambda^2'), cf(c, '\\lambda'), fmt(k)])}=0$`, verify: p => moveCheck(p, m, c, k) };
      },
      // わな：判別式が正（ゆれない）→ 7-67
      trap(r) {
        const pp = r.int(1, 4), qq = r.int(pp + 1, 6), b = pp + qq, c = pp * qq;
        if (EX67.includes(nk(1, b, c))) return null;
        return dest({ q: `$${ode(1, b, c)}$ ${MOVE_Q}`, a: `$${-pp}$、$${-qq}$（複素数でない。ゆれずにへる）`, key: nk(1, b, c), verify: p => stateCheck(p, 1, b, c) }, '7-68',
          `判別式 $${b * b}-${4 * c}$ が正なので、固有値は実数。ゆれない`);
      },
    },
  });

  // ================================================================ 7-69
  // numpy の表示（教科書 7-8⑤ と同じ numpy 2.5：固有値も固有ベクトルも複素数の形）。xs を同じはばにそろえる
  //   小数点の位置をそろえる：整数の部分（符号もふくむ）は左に、小数の部分（0 をはぶいたあと）は右に空白をつめる（[ 1.+0.j 11.+0.j]、[-0.4472136 +0.j]）
  function npNums(xs, prec) {
    const s = xs.map(x => { const [i, f] = Math.abs(x).toFixed(prec).replace(/0+$/, '').split('.'); return [(x < 0 ? '-' : '') + i, f]; });
    const wi = Math.max(...s.map(t => t[0].length)), wf = Math.max(...s.map(t => t[1].length));
    return s.map(([i, f]) => i.padStart(wi) + '.' + f.padEnd(wf) + '+0.j');
  }
  const npW = ls => `[${npNums(ls, 8).join(' ')}]`;
  const npV = V => { const s = npNums(V.flat(), 8); return `[[${s[0]} ${s[1]}]\n [${s[2]} ${s[3]}]]`; };
  const npV3 = V => `[[${V[0].map(x => x.toFixed(3)).join(' ')}] [${V[1].map(x => x.toFixed(3)).join(' ')}]]`;   // 文の中に1行で（小数第3位まで、+0.j をはぶく）
  // 固有ベクトル v を長さ1に（向きは s で）。列に並べた V
  const unit = (v, s) => { const n = Math.hypot(...v); return v.map(x => s * x / n); };
  // eig の表示を作る：固有ベクトルの成分に0がなく、1つが ±1 のもの（いちばん小さい成分でわると整数になる）
  function genEig(r, bad) {
    for (let k = 0; k < 200; k++) {
      const g = genInt(r, { lo: -3, hi: 6, vmax: 3, bad }); if (!g) return null;
      if (g.v.some(v => v.includes(0) || Math.min(...v.map(Math.abs)) !== 1)) continue;
      const ord = r.chance(0.5) ? [0, 1] : [1, 0], ls = ord.map(i => g.l[i]), vs = ord.map(i => unit(g.v[i], r.pick([1, -1])));
      const V = [[vs[0][0], vs[1][0]], [vs[0][1], vs[1][1]]];
      return { A: g.A, ls, vs: ord.map(i => g.v[i]), V };
    }
    return null;
  }
  const EIG_Q = (ls, V) => `\`np.linalg.eig(A)\` の表示が \`w\`：\`[${npNums(ls, 8).join(' ')}]\`、\`V\`：\`${npV3(V)}\` のとき、`;
  M.add({
    id: '7-69', part: 5, chap: '7-8⑤ 例題4', stars: 1,
    title: 'numpy の `eig` は固有ベクトルが列：いちばん小さい成分の大きさでわって整数に',
    mark: '`w, V = np.linalg.eig(A)` の表示から、固有値と固有ベクトルを読む（この本では、文の中の `V` は小数第3位までにして、`+0.j` をはぶく）。',
    futsu: ['表示を使わずに、$A$ の特性方程式を解いて', '固有値を出し、それぞれの固有ベクトルを', '求めなおす'],
    raku: ['`[5.+0.j 2.+0.j]`、`[[0.707 -0.447] [0.707 0.894]]`', '→ 5：1列め $(0.707,\\ 0.707)$ を $0.707$ でわって $(1,\\ 1)$', '→ 2：2列め $(-0.447,\\ 0.894)$ を $-0.447$ でわって $(1,\\ -2)$'],
    why: '`w` の $k$ 番めの固有値と組になるのは、`V` の $k$ 列め（7-8⑤）。`V` の列は、長さが1になるようにわってある（$0.70710678=\\frac{1}{\\sqrt2}$、$0.4472136=\\frac{1}{\\sqrt5}$）。固有ベクトルは何倍してもよいので、いちばん小さい成分の大きさでわれば、整数の比が出る。`+0.j` は虚部が0ということ。',
    caution: '1行めを固有ベクトルと読まない（行は固有値の組ではない）。負の数でわると符号が変わるが、何倍しても同じ固有ベクトル。わって $1.9999$ や $2.0004$ のようになったら2（表示の丸め）。',
    counts: { s1: 2, s2: 2, s3: 1, trap: 2 },
    cols: 1,
    boxw: { s1: '20mm', s2: '42mm', s3: '20mm', trap: '62mm' },
    fits(q, p) {   // w の虚部が0でないときは使えない
      const t = q + '\n' + ((p && p.code) || '');
      return /np\.linalg\.eig/.test(t) && /固有ベクトル/.test(q.slice(Math.max(0, q.lastIndexOf('`')))) && !/[+-][\d.]*[1-9][\d.]*j/.test(t);
    },
    steps: {
      // 1つの固有値の固有ベクトル
      s1(r) {
        const g = genEig(r, A => same(A, EX62)); if (!g) return null;
        const i = r.int(0, 1), l = g.ls[i];
        return { q: `${EIG_Q(g.ls, g.V)}固有値 $${l}$ の固有ベクトル（整数の形）`, a: `$${vt(g.vs[i])}$`, key: kA(g.A), easyCheck: false,
          easy: `${i + 1}列め $(${g.V[0][i].toFixed(3)},\\ ${g.V[1][i].toFixed(3)})$ を、小さいほうの成分でわる`, verify: p => vecCheck(p, g.A, l) };
      },
      // 2つとも（固有値と固有ベクトルの組）
      s2(r) {
        const g = genEig(r, A => same(A, EX62)); if (!g) return null;
        return { q: `${EIG_Q(g.ls, g.V)}固有値と固有ベクトルの組`, a: `$${g.ls[0]}$：$${vt(g.vs[0])}$、$${g.ls[1]}$：$${vt(g.vs[1])}$`, key: kA(g.A), easyCheck: false,
          easy: '1列めが1つめの固有値、2列めが2つめの固有値の組', verify: p => pairsCheck(p, g.A) };
      },
      // 見かけがちがう：プログラムと、そのままの表示（小数第8位まで）
      s3(r) {
        const g = genEig(r, A => same(A, EX62)); if (!g) return null;
        const i = r.int(0, 1), l = g.ls[i];
        return { q: `$A=${pm(g.A)}$ で \`w, V = np.linalg.eig(A)\` を実行し、\`print(w)\`、\`print(V)\` で下のように表示された。固有値 $${l}$ の固有ベクトル（整数の形）`, a: `$${vt(g.vs[i])}$`, key: kA(g.A), easyCheck: false,
          code: `${npW(g.ls)}\n${npV(g.V)}`,
          easy: `${i + 1}列めを、いちばん小さい成分の大きさでわる`, verify: p => vecCheck(p, g.A, l) };
      },
      // わな：w だけでは A は決まらない（楽な形なし）・固有値が複素数（7-68）
      trap(r) {
        if (turn(r, '69t', 2) === 0) {
          const l2 = r.int(-2, 4), l1 = l2 + 2 * r.int(1, 3), D = [[l1, 0], [0, l2]], S = [[(l1 + l2) / 2, (l1 - l2) / 2], [(l1 - l2) / 2, (l1 + l2) / 2]];
          return dest({ q: `\`np.linalg.eig(A)\` の \`w\` だけが \`[${npNums([l1, l2], 8).join(' ')}]\` と表示された（\`V\` はない）。2×2 の行列 $A$`,
            a: `決まらない（$${pm(D)}$ も $${pm(S)}$ も）`, key: `w${l1},${l2}`,
            verify: p => { const ms = matsIn(p.a); return (/^決まらない/.test(p.a) && ms.length === 2 && !same(ms[0], ms[1]) && ms.every(B => sameSet(roots2(B), [[l1, 0], [l2, 0]]))) || '2つの行列の固有値がちがう'; } }, '7-69',
            '固有値だけでは $A$ は決まらない。固有ベクトル（`V` の列）もあれば $A=PDP^{-1}$（わざ 7-72）');
        }
        const th = r.pick([60, 90, 120, 45]), c = Math.cos(th * Math.PI / 180), s = Math.sin(th * Math.PI / 180);
        const f8 = x => (x < -1e-12 ? '-' : '') + Math.abs(x).toFixed(8).replace(/0+$/, ''), re = f8(c), im = f8(s);
        return dest({ q: `\`np.linalg.eig(A)\` の \`w\` が \`[${re}+${im}j ${re}-${im}j]\` だった。実数の固有ベクトル`, a: `ない（固有値が複素数で、$${th}^{\\circ}$ ずつ回る）`, key: `R${th}`,
          verify: p => (Math.abs(s) > 1e-9 && new RegExp(`${th}\\^`).test(p.a)) || 'ちがう' }, '7-69',
          '`w` の虚部が0でない（固有値が複素数）。向きの変わらない実数の矢印はなく、回る動き', ['7-68']);
      },
    },
  });

  // ================================================================ 7-70
  const EX70 = [[4, 1], [2, 3]];
  // べき乗法がはやく近づく行列：いちばん大きい固有値が正で、もう1つの大きさがその 0.4 倍以下
  function genPow(r) {
    for (let k = 0; k < 100; k++) {
      const g = genInt(r, { lo: 0, hi: 6, vmax: 2, bad: (A, l1, l2) => same(A, EX70) || l1 <= 0 || Math.abs(l2) > 0.4 * l1 || A.flat().some(x => x < 0) }); if (!g) return null;
      if (g.v[0][0] === 0 || g.A[1][0] === 0) continue;   // (1, 0) がはじめから固有ベクトルの向きのものはよける
      const t = g.v[0][1] / g.v[0][0], x = iter(g.A, 4);
      if (Math.abs(x[1][1] / x[1][0] - t) < 0.15 * Math.max(1, Math.abs(t))) continue;   // 1回めでもう近い（そろうようすが見えない）
      if (Math.abs(x[4][1] / x[4][0] - t) > 0.06 * Math.max(1, Math.abs(t)) || Math.abs(x[4][0] / x[3][0] - g.l[0]) > 0.2) continue;   // 4回めで予想が1つに決まる
      if (Math.max(...x[4].map(Math.abs)) > 5000) continue;
      return g;
    }
    return null;
  }
  const iter = (A, n, x0) => { const out = [x0 || [1, 0]]; for (let k = 0; k < n; k++) out.push(mulv(A, out[out.length - 1])); return out; };
  const r3 = x => String(+x.toFixed(3));
  // 予想の答え「$(1,\ 1)$ の向き、固有値 $5$」の確かめ：固有ベクトルで、いちばん大きい固有値
  function powCheck(p, A) {
    const v = vecsOf(p.a)[0], l = valsOf(p.a)[0];
    if (!v || !l) return '向きか固有値がない';
    const rt = roots2(A);
    return (isEig(A, v, l[0]) && near(l[0], Math.max(...rt.map(z => z[0])))) || '近づく向きか固有値がちがう';
  }
  M.add({
    id: '7-70', part: 5, chap: '7-8④ 例題3', stars: 1,
    title: 'べき乗法：$(1,\\ 0)$ にくり返しかけ、「$y\\div x$」と「前の何倍」を見る',
    mark: '「くり返しかけて、近づく固有ベクトルと固有値を予想しよう」。',
    futsu: ['特性方程式を解いて固有値を2つとも出し、', '大きいほうの固有ベクトルを求める', '（3×3 より大きいと、手では解けない）'],
    raku: ['$\\begin{pmatrix}4&1\\\\2&3\\end{pmatrix}$ → $(4,\\ 2)$、$(18,\\ 14)$、$(86,\\ 78)$', '$y\\div x$：$0.5$、$0.778$、$0.907$ → 1：$(1,\\ 1)$', '何倍：4、$4.5$、$4.78$ → 5'],
    why: 'はじめの矢印を2本の固有ベクトルに分けると、かけるたびに、それぞれ固有値倍になる（7-8④）。いちばん大きい固有値の部分がほかよりどんどん大きくなるので、矢印の向きはその固有ベクトルにそろい、長さは毎回その固有値倍に近づく。',
    caution: 'かけるのは前の答えに（いつも $(1,\\ 0)$ にではない）。「何倍か」は $x$ 成分どうしの比（$86\\div18$）。近づくのは、大きさがいちばん大きい固有値のほうだけ。固有値が複素数（回る行列）だと、そろわない。',
    counts: { s1: 4, s2: 1, s3: 1, trap: 1 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '42mm', s3: '42mm', trap: '62mm' },
    fits(q) {
      if (!/くり返しかけ|回かけた|下へコピー/.test(q)) return false;
      const A = mat22(q); if (!A) return true;
      const rt = roots2(A); return Math.abs(rt[0][1]) < 1e-12 && Math.abs(Math.abs(rt[0][0]) - Math.abs(rt[1][0])) > 1e-9;
    },
    steps: {
      // 3回かける
      s1(r) {
        const A = [[r.int(1, 5), r.int(0, 4)], [r.int(1, 4), r.int(1, 5)]], rt = roots2(A);
        if (same(A, EX70) || !(D2(A) > 0) || near(Math.abs(rt[0][0]), Math.abs(rt[1][0]))) return null;   // 固有値の大きさがちがう2つの実数（そろっていくもの）
        const xs = iter(A, 3);
        return { q: `$A=${pm(A)}$ を $(1,\\ 0)$ に3回かけた矢印（前の答えにかけていく）`, a: `$${vt(xs[3])}$`, key: kA(A), easyCheck: false,
          easy: `$${vt(xs[1])}$ → $${vt(xs[2])}$ → $${vt(xs[3])}$`,
          verify: p => { const v = vecsOf(p.a)[0], W = M.Mat.pow(M.Mat.make(A), 3); return (v && near(v[0], F_(W[0][0])) && near(v[1], F_(W[1][0]))) || '3回かけた矢印がちがう'; } };
      },
      // 4回までの矢印から予想（行列は書かない）
      s2(r) {
        const g = genPow(r); if (!g) return null;
        const xs = iter(g.A, 4), last = xs[4], prev = xs[3];
        if (Math.abs(last[1] / last[0] - g.v[0][1] / g.v[0][0]) > 0.06 * Math.max(1, Math.abs(g.v[0][1] / g.v[0][0])) || Math.abs(last[0] / prev[0] - g.l[0]) > 0.2) return null;   // 予想が1つに決まる
        if (Math.max(...last.map(Math.abs)) > 5000) return null;
        return { q: `ある行列 $A$ を $(1,\\ 0)$ にくり返しかけると、$${vt(xs[1])}$、$${vt(xs[2])}$、$${vt(xs[3])}$、$${vt(xs[4])}$ となった。近づく固有ベクトルと固有値の予想`,
          a: `$${vt(g.v[0])}$ の向き、固有値 $${g.l[0]}$`, key: kA(g.A), easyCheck: false,
          easy: `$y\\div x$：${xs.slice(1).map(x => `$${r3(x[1] / x[0])}$`).join('、')}。何倍：${xs.slice(2).map((x, i) => `$${r3(x[0] / xs[i + 1][0])}$`).join('、')}`, verify: p => powCheck(p, g.A) };
      },
      // 表計算（表で）
      s3(r) {
        const g = genPow(r); if (!g) return null;
        const A = g.A, xs = iter(A, 4);
        if (Math.abs(xs[4][1] / xs[4][0] - g.v[0][1] / g.v[0][0]) > 0.06 * Math.max(1, Math.abs(g.v[0][1] / g.v[0][0])) || Math.abs(xs[4][0] / xs[3][0] - g.l[0]) > 0.2) return null;
        const f = (a, b) => `=${a}*B2+${b}*C2`;
        return { q: `表計算で、2行めに $(1,\\ 0)$ を入れ、B3 に \`${f(A[0][0], A[0][1])}\`、C3 に \`${f(A[1][0], A[1][1])}\`、D3 に \`=C3/B3\`、E3 に \`=B3/B2\` を入れて下へコピーした。近づく固有ベクトルと固有値の予想`,
          a: `$${vt(g.v[0])}$ の向き、固有値 $${g.l[0]}$`, key: kA(A), easyCheck: false,
          table: { head: ['', 'A', 'B', 'C', 'D', 'E'], rows: [['1', '回数', '$x$', '$y$', '$y\\div x$', '何倍か'], ...xs.map((x, k) => [String(k + 2), String(k), String(x[0]), String(x[1]), k ? r3(x[1] / x[0]) : '', k ? r3(x[0] / xs[k - 1][0]) : ''])] },
          easy: `D列は $${r3(g.v[0][1] / g.v[0][0])}$ に、E列は $${g.l[0]}$ に近づく`, verify: p => powCheck(p, A) };
      },
      // わな：回る行列（固有値が複素数）→ 7-48
      trap(r) {
        const k = r.pick([1, 1, 2, 3]), sg = r.pick([1, -1]), A = [[0, -sg * k], [sg * k, 0]];
        return dest({ q: `$A=${pm(A)}$ を $(1,\\ 0)$ にくり返しかけたとき、近づく固有ベクトルと固有値の予想`, a: `近づかない（回り続ける。固有値 $\\pm ${k === 1 ? '' : k}j$）`, key: kA(A),
          verify: p => {
            const v = valsOf(p.a).filter(z => z && Math.abs(z[1]) > 0), x = iter(A, 1)[1], deg = Math.round(Math.atan2(x[1], x[0]) * 180 / Math.PI), len = Math.hypot(...x);
            return (/^近づかない（回り続ける/.test(p.a) && Math.abs(deg) === 90 && near(len, k) && sameSet(v, roots2(A))) || '回る角・固有値がちがう';
          } }, '7-70',
          `$${vt([0, sg * k])}$、$${vt([-(k * k), 0])}$、… と $90^{\\circ}$ ずつ回るだけで、向きがそろわない（固有値は複素数）`, ['7-48']);
      },
    },
  });

  // ================================================================ 7-71
  const EX71 = [[[50, 20], [20, 20]], [[40, 30], [30, -40]]];
  const bad71 = A => EX71.some(B => same(A, B)) || EX71.some(B => same(A, B.map(r => r.map(x => x / 10))));
  // 対称な行列 A = l2 I + t v vᵀ（v の固有値 l2 + t|v|²、v に直交する向きの固有値 l2）。対角は同じにしない
  function genSym(r, o) {
    o = o || {};
    for (let k = 0; k < 100; k++) {
      const v = r.pick([[1, 2], [2, 1], [1, -2], [2, -1], [1, 3], [3, 1], [1, -3], [3, -1]]), t = r.pick(o.t || [1, -1, 2]), l2 = r.int(o.lo != null ? o.lo : -3, o.hi != null ? o.hi : 5);
      const A = [[l2 + t * v[0] * v[0], t * v[0] * v[1]], [t * v[0] * v[1], l2 + t * v[1] * v[1]]];
      if (bad71(A) || A.flat().some(x => Math.abs(x) > (o.max || 12))) continue;
      const l1 = l2 + t * (v[0] * v[0] + v[1] * v[1]), w = norm([-v[1], v[0]]);
      return { A, l: [l1, l2], v: [norm(v), w] };
    }
    return null;
  }
  const perp = v => norm([-v[1], v[0]]);
  M.add({
    id: '7-71', part: 5, chap: '7-8⑨ 例題8', stars: 1,
    title: '対称な行列の固有ベクトルは直交：1本が $(p,\\ q)$ なら、もう1本は $(-q,\\ p)$。固有値は $m\\pm\\sqrt{m^2-\\det A}$（$m=\\frac{a+d}{2}$）',
    mark: '対称な行列（右上と左下が同じ）の固有値・固有ベクトル、応力の主応力と主方向。',
    futsu: ['固有値を解の公式 $\\dfrac{70\\pm\\sqrt{4900-2400}}{2}$ で出し、', '2つめの固有値も $(A-\\lambda I)\\vec v=\\vec 0$ に入れて、', '1行めから固有ベクトルを求める'],
    raku: ['$\\begin{pmatrix}50&20\\\\20&20\\end{pmatrix}$：$m=35$', '$35\\pm\\sqrt{1225-600}=35\\pm25$ → 60、10', '60 の $(2,\\ 1)$ → 10 は直交する $(-1,\\ 2)$'],
    why: '対称な行列では、ちがう固有値の固有ベクトルは直交する（7-8⑨）。平面で $(p,\\ q)$ に直交する向きは $(-q,\\ p)$ だけ（内積 $-pq+qp=0$）。特性方程式 $\\lambda^2-2m\\lambda+\\det A=0$ を、$\\lambda$ の係数の半分 $m$ を使う解の公式で解くと $m\\pm\\sqrt{m^2-\\det A}$（教科書の応力の $30\\pm\\sqrt{30^2+2500}$ の形）。',
    caution: '対称でない行列（右上と左下がちがう）では、固有ベクトルは直交しない。$\\det A$ が負なら $m^2-\\det A$ は $m^2$ より大きい（$-$ と $-$ でたす）。$(-q,\\ p)$ は $(q,\\ -p)$ と同じ向き（何倍でもよい）。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '44mm', s3: '58mm', trap: '20mm' },
    fits(q) {
      if (/は固有ベクトルか|R\^\{\\mathsf T\}|\^\{\d+\}|くり返しかけ|点|物差し|状態の行列/.test(q)) return false;
      const A = mat22(q);
      return sym(A) && /固有値|主応力|主方向|固有ベクトル/.test(tail(q));
    },
    steps: {
      // 1本がわかっていて、もう1本
      s1(r) {
        const g = genSym(r); if (!g) return null;
        const i = r.int(0, 1), sc = r.pick([1, 1, 2, -1]), v = g.v[i].map(x => x * sc);
        return { q: `$A=${pm(g.A)}$ の固有値 $${g.l[i]}$ の固有ベクトルは $${vt(v)}$。固有値 $${g.l[1 - i]}$ の固有ベクトル`, a: `$${vt(perp(g.v[i]))}$`, key: kA(g.A), easyCheck: false,
          easy: `対称なので直交：$${vt(v)}$ → $${vt([-v[1], v[0]])}$`, verify: p => vecCheck(p, g.A, g.l[1 - i]) };
      },
      // 固有値と固有ベクトル（m ± √(m² − det)）
      s2(r) {
        const g = genSym(r, { lo: -4, hi: 8 }); if (!g) return null;
        const A = g.A, m = (A[0][0] + A[1][1]) / 2, det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        return { q: `$${pm(A)}$ の固有値と固有ベクトル`, a: `$${g.l[0]}$：$${vt(g.v[0])}$、$${g.l[1]}$：$${vt(g.v[1])}$`, key: kA(A), easyCheck: false,
          easy: Number.isInteger(m) ? `$${m}\\pm\\sqrt{${m * m}-${det < 0 ? `(${det})` : det}}$、2本めは直交` : '特性方程式で。2本めは直交', verify: p => pairsCheck(p, A) };
      },
      // 応力：主応力と主方向・√ が残る主応力
      s3(r) {
        if (turn(r, '71s3', 2) === 0) {
          const g = genSym(r, { lo: -3, hi: 6, max: 10 }); if (!g) return null;
          const A = g.A.map(row => row.map(x => 10 * x));
          return { q: `応力の行列 $${pm(A)}$（MPa）の主応力と主方向`, a: `$${U(10 * g.l[0], 'MPa')}$：$${vt(g.v[0])}$、$${U(10 * g.l[1], 'MPa')}$：$${vt(g.v[1])}$`, key: kA(A), easyCheck: false,
            easy: `$m=${(A[0][0] + A[1][1]) / 2}$、$m\\pm\\sqrt{m^2-\\det}$。2本めは直交`, verify: p => pairsCheck(p, A) };
        }
        const a = 10 * r.int(-2, 8), d = 10 * r.int(-4, 4), b = 10 * r.pick([-3, -2, -1, 1, 2, 3, 4]);
        if (a === d || (a + d) % 20) return null;
        const A = [[a, b], [b, d]], m = (a + d) / 2, n = m * m - (a * d - b * b);
        if (isSq(n) || bad71(A)) return null;
        return { q: `応力の行列 $${pm(A)}$（MPa）の主応力`, a: `$${m === 0 ? '' : m}\\pm ${sqrtTeX(n)}\\,\\mathrm{MPa}$`, key: kA(A), easyCheck: false,
          easy: `$m=${m}$、$m^2-\\det A=${m * m}-${a * d - b * b < 0 ? `(${a * d - b * b})` : a * d - b * b}=${n}$`, verify: p => valsCheck(p, roots2(A)) };
      },
      // わな：対称でない行列の、もう1本の固有ベクトル → 7-65
      trap(r) {
        const g = genInt(r, { lo: -2, hi: 6, vmax: 3, bad: A => A[0][1] === A[1][0] || same(A, EX62) }); if (!g) return null;
        const i = r.int(0, 1);
        return dest({ q: `$A=${pm(g.A)}$ の固有値 $${g.l[i]}$ の固有ベクトルは $${vt(g.v[i])}$。固有値 $${g.l[1 - i]}$ の固有ベクトル`, a: `$${vt(g.v[1 - i])}$`, key: kA(g.A),
          verify: p => vecCheck(p, g.A, g.l[1 - i]) }, '7-71',
          `右上と左下がちがう（対称でない）ので、直交するとはかぎらない（$${vt(perp(g.v[i]))}$ はちがう）。$A-${g.l[1 - i] < 0 ? `(${g.l[1 - i]})` : g.l[1 - i]}I$ の1行めから`, ['7-65']);
      },
    },
  });

  // ================================================================ 7-72
  const EX72 = [[4, 1], [2, 3]], EXP72 = [[[4, 1], [2, 3]], [[1, 1], [1, -2]], [[2, 1], [1, -1]], [[5, 2], [5, -4]]];   // 左ページの例の A と、P・P^{-1}・AP
  const colsP = (u, v) => [[u[0], v[0]], [u[1], v[1]]];   // u を1列め、v を2列めに
  const diagD = (a, b) => [[a, 0], [0, b]];
  const PinvAP = (A, P) => M.Mat.mul(M.Mat.inv(M.Mat.make(P)), M.Mat.mul(M.Mat.make(A), M.Mat.make(P)));   // 確かめ：逆行列をかけて計算する（別の道すじ）
  M.add({
    id: '7-72', part: 5, chap: '7-9⑤ 例題2', stars: 1,
    title: '対角化：$P$ は固有ベクトルを列に、$D$ は同じ順の固有値。確かめは $AP=PD$（$AP$ は $P$ の列を固有値倍しただけ）',
    mark: '$P$ と $D$、「$P^{-1}AP$ を求めよう」「$P^{-1}AP=D$ を確かめよう」。',
    futsu: ['$\\det P=-3$ から $P^{-1}=\\dfrac13\\begin{pmatrix}2&1\\\\1&-1\\end{pmatrix}$ を作り、', '$AP$ を計算してから、左から $P^{-1}$ をかける', '（2×2 のかけ算2回と逆行列）'],
    raku: ['$\\begin{pmatrix}4&1\\\\2&3\\end{pmatrix}$、$P=\\begin{pmatrix}1&1\\\\1&-2\\end{pmatrix}$', '$AP=\\begin{pmatrix}5&2\\\\5&-4\\end{pmatrix}$：1列めは5倍、2列めは2倍', '→ $P^{-1}AP=D=\\begin{pmatrix}5&0\\\\0&2\\end{pmatrix}$'],
    why: '$AP$ の $k$ 列めは $A\\times$（$P$ の $k$ 列め）。固有ベクトルなら、固有値倍になるだけ（7-9⑤）。$PD$ の $k$ 列めも、$P$ の $k$ 列めの固有値倍。だから $AP=PD$ で、左から $P^{-1}$ をかけると $P^{-1}AP=D$。$AP$ の列が $P$ の列の何倍かを見れば、$P^{-1}$ を作らずに $D$ がわかる。',
    caution: '$D$ の対角の順は、$P$ の列の順と同じ（$P$ の1列めの固有値が $D$ の左上）。$P$ の列を何倍しても $D$ は同じ。かける順は $P^{-1}AP$（$PAP^{-1}$ ではない）。固有ベクトルが1本しかない行列は対角化できない（わざ 7-75）。',
    counts: { s1: 2, s2: 2, s3: 1, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '50mm', trap: '50mm' },
    boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) {
      if (!/P\^\{-1\}AP|P\^\{-1\}BP|となる \$P\$ と \$D\$/.test(q)) return false;
      const A = matsIn(q)[0] || coefMat(q); if (!is22(A)) return false;
      return D2(A) > 0 || (A[0][1] === 0 && A[1][0] === 0);
    },
    steps: {
      // A と P から P^{-1}AP（列の何倍かを見る）
      s1(r) {
        const g = genInt(r, { lo: -3, hi: 6, vmax: 3, bad: A => same(A, EX72) }); if (!g) return null;
        const o = r.chance(0.5) ? [0, 1] : [1, 0], P = colsP(g.v[o[0]], g.v[o[1]]), D = diagD(g.l[o[0]], g.l[o[1]]), AP = M.Mat.mul(M.Mat.make(g.A), M.Mat.make(P)).map(r => r.map(F_));
        if (EXP72.some(B => same(P, B))) return null;
        return { q: `$A=${pm(g.A)}$、$P=${pm(P)}$ のとき、$P^{-1}AP$`, a: `$${pm(D)}$`, key: kA(g.A), easyCheck: false,
          easy: `$AP=${pm(AP)}$：1列めは $${g.l[o[0]]}$ 倍、2列めは $${g.l[o[1]]}$ 倍`, calc: { kind: 'mat', want: PinvAP(g.A, P) } };
      },
      // 固有値・固有ベクトルが文に書いてあり、P の列の順や長さがちがう
      s2(r) {
        const g = genInt(r, { lo: -3, hi: 6, vmax: 3, bad: A => same(A, EX72) }); if (!g) return null;
        const s = r.pick([2, -1, 3]), u = g.v[1].map(x => x * s), P = colsP(u, g.v[0]), D = diagD(g.l[1], g.l[0]);
        if (EXP72.some(B => same(P, B))) return null;
        return { q: `$A=${pm(g.A)}$ は、固有値 $${g.l[0]}$ の固有ベクトル $${vt(g.v[0])}$、固有値 $${g.l[1]}$ の固有ベクトル $${vt(g.v[1])}$ をもつ。$P=${pm(P)}$ のとき、$P^{-1}AP$`,
          a: `$${pm(D)}$`, key: kA(g.A), easyCheck: false, easy: `1列めは $${vt(g.v[1])}$ の $${s}$ 倍（固有値 $${g.l[1]}$）、2列めは固有値 $${g.l[0]}$`, calc: { kind: 'mat', want: PinvAP(g.A, P) } };
      },
      // P と D を作る・台車の B
      s3(r) {
        if (turn(r, '72s3', 2) === 0) {
          const g = genInt(r, { lo: -3, hi: 6, vmax: 3, bad: A => same(A, EX72) }); if (!g) return null;
          return { q: `$A=${pm(g.A)}$ は、固有値 $${g.l[0]}$ の固有ベクトル $${vt(g.v[0])}$、固有値 $${g.l[1]}$ の固有ベクトル $${vt(g.v[1])}$ をもつ。$P^{-1}AP=D$ となる $P$ と $D$`,
            a: `$P=${pm(colsP(g.v[0], g.v[1]))}$、$D=${pm(diagD(g.l[0], g.l[1]))}$`, key: kA(g.A), easyCheck: false, easy: '固有ベクトルを列に、固有値を同じ順に対角に',
            verify: p => {
              const ms = matsIn(p.a); if (ms.length !== 2) return '$P$ と $D$ がない';
              const [P, D] = ms, AP = M.Mat.mul(M.Mat.make(g.A), M.Mat.make(P)).map(r => r.map(F_)), PD = M.Mat.mul(M.Mat.make(P), M.Mat.make(D)).map(r => r.map(F_));
              return (D[0][1] === 0 && D[1][0] === 0 && Math.abs(F_(M.Mat.det(M.Mat.make(P)))) > 0 && AP.every((row, i) => row.every((x, j) => near(x, PD[i][j])))) || '$AP=PD$ にならない';
            } };
        }
        const w1s = r.pick([4, 9, 16, 25, 36, 100]), o = r.pick([5, 10, 20, 50]), B = [[-(w1s + o), o], [o, -(w1s + o)]], P = r.chance(0.5) ? [[1, 1], [1, -1]] : [[1, 1], [-1, 1]];
        if (EX66.some(e => same(B, cartB(...e)))) return null;
        const D = P[1][0] === 1 ? diagD(-w1s, -w1s - 2 * o) : diagD(-w1s - 2 * o, -w1s);   // P の1列めが (1, 1) か (1, −1) か
        return { q: `台車2つの $\\ddot{\\vec x}=B\\vec x$ で、$B=${pm(B)}$。$P=${pm(P)}$ のとき、$P^{-1}BP$`, a: `$${pm(D)}$`, key: kA(B), easyCheck: false,
          easy: `$BP$ の1列めは $${-w1s}$ 倍、2列めは $${-w1s - 2 * o}$ 倍`, calc: { kind: 'mat', want: PinvAP(B, P) } };
      },
      // わな：対角化できない（重解で固有ベクトルが1本）→ 7-75
      trap(r) {
        const a = r.int(-3, 6), k = r.pick([1, 2, 3, -1, -2]), A = r.chance(0.5) ? [[a, k], [0, a]] : [[a, 0], [k, a]];
        if (same(A, [[2, 1], [0, 2]])) return null;
        return dest({ q: `$A=${pm(A)}$ で、$P^{-1}AP=D$ となる $P$ と $D$`, a: `ない（重解 $${a}$ で、固有ベクトル1本）`, key: kA(A),
          verify: p => (/固有ベクトル1本/.test(p.a) && near(D2(A), 0) && (A[0][1] !== 0 || A[1][0] !== 0) && cnear(valsOf(p.a)[0], roots2(A)[0])) || '対角化できるはず' }, '7-72',
          '固有値が重解で、$A-\\lambda I$ が0の行列でないので、固有ベクトルは1本だけ。$P$ が作れず、対角化できない', ['7-75']);
      },
    },
  });

  // ================================================================ 7-73
  const EX73 = [[[2, 1], [1, 2]], [[3, 1], [1, 3]]];
  const bad73 = A => EX73.some(B => same(A, B));
  const RtAR = A => { const s = Math.SQRT1_2, R = [[s, -s], [s, s]], Rt = [[s, s], [-s, s]], m = (X, Y) => X.map((row, i) => Y[0].map((_, j) => row.reduce((acc, x, k) => acc + x * Y[k][j], 0))); return m(Rt, m(A, R)); };
  M.add({
    id: '7-73', part: 5, chap: '7-9①⑥ 例題1・3', stars: 1,
    title: '$\\begin{pmatrix}a&b\\\\b&a\\end{pmatrix}$ はななめの物差しで：$q_1=\\frac{x+y}{2}$ を $a+b$ 倍、$q_2=\\frac{x-y}{2}$ を $a-b$ 倍してもどす（$R(45^{\\circ})$ で $R^{\\mathsf T}AR$ は対角に）',
    mark: '対角が同じ対称な行列を、点にかける。$R^{\\mathsf T}AR$ を求める。',
    futsu: ['$R(45^{\\circ})=\\dfrac{1}{\\sqrt2}\\begin{pmatrix}1&-1\\\\1&1\\end{pmatrix}$ で', '$AR$、$R^{\\mathsf T}(AR)$ と2回かけ、', '$\\dfrac{1}{\\sqrt2}\\times\\dfrac{1}{\\sqrt2}=\\dfrac12$ を計算する'],
    raku: ['主役で点 $(3,\\ 1)$ → $q_1=2$、$q_2=1$', '→ $6(1,\\ 1)+1(1,\\ -1)=(7,\\ 5)$', '$\\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}$ → $R^{\\mathsf T}AR=\\begin{pmatrix}4&0\\\\0&2\\end{pmatrix}$'],
    why: '$(1,\\ 1)$ と $(1,\\ -1)$ は固有ベクトルなので、その物差しで読んだ $q_1$、$q_2$ は、$A$ をかけるとそれぞれ $a+b$ 倍、$a-b$ 倍になるだけ（7-9①）。もどすのは $q_1(1,\\ 1)+q_2(1,\\ -1)=(q_1+q_2,\\ q_1-q_2)$。$R(45^{\\circ})$ の列は、この2本を長さ1にしたもの（2列めは $(-1,\\ 1)$ の向き）なので、$R^{\\mathsf T}AR$ は固有値を対角に並べた行列（7-9⑥）。',
    caution: '$q_1$、$q_2$ は2でわる（和と差のままにしない）。もどすときは $x=q_1+q_2$、$y=q_1-q_2$。$R^{\\mathsf T}AR$ の左上は $(1,\\ 1)$ の固有値 $a+b$、右下は $a-b$。対称でない行列は、回転では対角にならない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '24mm', s3: '20mm', trap: '62mm' },
    boxh: { s2: '11mm' },
    fits(q) { return symEq(mat22(q)) && /R\^\{\\mathsf T\}AR|点|物差し/.test(q); },
    steps: {
      // 点にかける
      s1(r) {
        const a = r.int(-2, 6), b = r.pick([-3, -2, -1, 1, 2, 3, 4]), A = [[a, b], [b, a]];
        const x = r.int(-3, 6), y = x + 2 * r.int(-3, 3);
        if (bad73(A) || (x === 0 && y === 0) || y === x || (x === 3 && y === 1)) return null;   // 点 (3, 1) は左ページの例
        const q1 = (x + y) / 2, q2 = (x - y) / 2, ans = [(a + b) * q1 + (a - b) * q2, (a + b) * q1 - (a - b) * q2];
        return { q: `$A=${pm(A)}$ を点 $${vt([x, y])}$ にかけた点（ななめの物差しで）`, a: `$${vt(ans)}$`, key: kA(A), easyCheck: false,
          easy: `$q_1=${q1}$、$q_2=${q2}$ → $${(a + b) * q1}(1,\\ 1)${(a - b) * q2 < 0 ? '' : '+'}${(a - b) * q2}(1,\\ -1)$`,
          verify: p => { const v = vecsOf(p.a)[0], w = mulv(A, [x, y]); return (v && near(v[0], w[0]) && near(v[1], w[1])) || 'かけた点がちがう'; } };
      },
      // R^T A R
      s2(r) {
        const dec = r.chance(0.25), a = dec ? r.pick([-0.3, -0.2, 0.5, 0.6]) : r.int(-4, 8), b = dec ? r.pick([0.1, 0.2, -0.1]) : r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]), A = [[a, b], [b, a]];
        if (bad73(A)) return null;
        return { q: `$A=${pm(A)}$ で、$R=R(45^{\\circ})$ のとき、$R^{\\mathsf T}AR$`, a: `$${pm(diagD(+fmt(a + b), +fmt(a - b)))}$`, key: kA(A), easyCheck: false,
          easy: `左上 $a+b=${fmt(a + b)}$、右下 $a-b=${fmt(a - b)}$`, calc: { kind: 'mat', want: RtAR(A).map(row => row.map(x => String(+x.toFixed(9)))) } };
      },
      // ななめの物差しで読んだ点にかける・かけた点からもとの点
      s3(r) {
        const a = r.int(-2, 6), b = r.pick([-3, -2, -1, 1, 2, 3]), A = [[a, b], [b, a]], l1 = a + b, l2 = a - b;
        if (bad73(A) || l1 === 0 || l2 === 0) return null;
        if (turn(r, '73s3', 2) === 0) {
          const q1 = r.pick([-2, -1, 1, 2, 3]), q2 = r.pick([-2, -1, 1, 2, 3]), ans = [l1 * q1 + l2 * q2, l1 * q1 - l2 * q2];
          return { q: `$A=${pm(A)}$ を、ななめの物差し $(1,\\ 1)$・$(1,\\ -1)$ で $(q_1,\\ q_2)=${vt([q1, q2])}$ と読める点にかけた点（ふつうの座標で）`, a: `$${vt(ans)}$`, key: kA(A), easyCheck: false,
            easy: `$${l1 * q1}(1,\\ 1)${l2 * q2 < 0 ? '' : '+'}${l2 * q2}(1,\\ -1)$`,
            verify: p => { const v = vecsOf(p.a)[0], w = mulv(A, [q1 + q2, q1 - q2]); return (v && near(v[0], w[0]) && near(v[1], w[1])) || 'かけた点がちがう'; } };
        }
        const q1 = r.pick([-2, -1, 1, 2, 3]), q2 = r.pick([-2, -1, 1, 2]), x = q1 + q2, y = q1 - q2, img = mulv(A, [x, y]);
        return { q: `$A=${pm(A)}$ をかけると点 $${vt(img)}$ になる、もとの点（ななめの物差しで）`, a: `$${vt([x, y])}$`, key: kA(A), easyCheck: false,
          easy: `かけた点を $q_1=${(img[0] + img[1]) / 2}$、$q_2=${(img[0] - img[1]) / 2}$ と読み、$${l1}$ と $${l2}$ でわる`,
          verify: p => { const v = vecsOf(p.a)[0]; if (!v) return '点がない'; const w = mulv(A, v); return (near(w[0], img[0]) && near(w[1], img[1])) || 'もとの点がちがう'; } };
      },
      // わな：対角は同じだが対称でない → 7-64
      trap(r) {
        const s = r.pick([1, 2, 3]), b = r.pick([1, 2, 4, 3, 9]), c = s * s / b;
        if (!Number.isInteger(c) || c === b) return null;
        const a = r.int(-1, 6), A = [[a, b], [c, a]];
        return dest({ q: `$A=${pm(A)}$ で、$R=R(45^{\\circ})$ のとき、$R^{\\mathsf T}AR$ は対角行列になるか`, a: `ならない（固有値は $${a + s}$、$${a - s}$）`, key: kA(A),
          verify: p => { const T = RtAR(A); return (/^ならない/.test(p.a) && !isEig(A, [1, 1], mulv(A, [1, 1])[0]) && Math.abs(T[0][1]) + Math.abs(T[1][0]) > 1e-9 && sameSet(valsOf(p.a), roots2(A))) || '対角になるか、固有値がちがう'; } }, '7-73',
          '右上と左下がちがう（対称でない）ので、$(1,\\ 1)$・$(1,\\ -1)$ は固有ベクトルでなく、回転では対角にならない。固有値は特性方程式で', ['7-64']);
      },
    },
  });

  // ================================================================ 7-74
  const EX74 = [[[2, 1], [1, 2]], [[3, 1], [1, 3]]];
  const powM = (A, n) => M.Mat.pow(M.Mat.make(A), n);   // 確かめ：n 回かける（別の道すじ）
  M.add({
    id: '7-74', part: 5, chap: '7-9⑧ 例題6', stars: 1,
    title: '$A^n=PD^nP^{-1}$：$\\begin{pmatrix}a&b\\\\b&a\\end{pmatrix}^n$ は、対角が $(a+b)^n$ と $(a-b)^n$ の和の半分、ほかが差の半分',
    mark: '対角が同じ対称な行列の $n$ 乗。',
    futsu: ['$A^2=AA$、$A^3=A^2A$、…と、', '2×2 のかけ算を $n-1$ 回する'],
    raku: ['主役の $A^5$：$3^5=243$、$1^5=1$', '→ $\\dfrac{243+1}{2}=122$、$\\dfrac{243-1}{2}=121$', '$\\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}^3$ → $\\dfrac{64\\pm8}{2}$ → 36と28'],
    why: '$A=PDP^{-1}$ なら、まん中の $P^{-1}P$ が消えて $A^n=PD^nP^{-1}$（7-9⑧）。$D^n$ は対角成分を $n$ 乗するだけ。$P=\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$、$P^{-1}=\\frac12\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$ で計算すると、対角は $(a+b)^n$ と $(a-b)^n$ の和の半分、ほかは差の半分になる。',
    caution: '成分を $n$ 乗しない（$A^2$ の対角は $a^2$ ではない）。$a-b$ が負なら、$(a-b)^n$ の符号は $n$ が偶数か奇数かで変わる。2でわるのを忘れない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '26mm', s3: '20mm', trap: '20mm' },
    boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { const m = /\\end\{pmatrix\}\^\{(\d+)\}/.exec(q); return !!m && +m[1] >= 2 && symEq(matsIn(q)[0]); },
    steps: {
      s1(r) {
        const a = r.int(1, 5), b = r.pick([1, 2, 3]), n = r.int(2, 5), A = [[a, b], [b, a]];
        if (EX74.some(B => same(A, B)) || Math.abs(a) === Math.abs(b) || (a + b) ** n > 1100) return null;
        return { q: `$${pm(A)}^{${n}}$`, a: `$${pm(powM(A, n).map(row => row.map(F_)))}$`, key: kA(A), easyCheck: false,
          easy: `$${a + b}^{${n}}=${(a + b) ** n}$、$${a - b < 0 ? `(${a - b})` : a - b}^{${n}}=${(a - b) ** n}$`, calc: { kind: 'mat', want: powM(A, n) } };
      },
      // a−b が負・b が負
      s2(r) {
        const a = r.int(-2, 4), b = r.pick([-3, -2, -1, 2, 3, 4]), n = r.int(2, 6), A = [[a, b], [b, a]];
        if (EX74.some(B => same(A, B)) || Math.abs(a) === Math.abs(b) || a - b >= 0 && b > 0 || Math.max(Math.abs(a + b), Math.abs(a - b)) ** n > 1100 || a === 0 && Math.abs(b) === 1) return null;
        return { q: `$${pm(A)}^{${n}}$`, a: `$${pm(powM(A, n).map(row => row.map(F_)))}$`, key: kA(A), easyCheck: false,
          easy: `$(a+b)^{${n}}=${(a + b) ** n}$、$(a-b)^{${n}}=${(a - b) ** n}$`, calc: { kind: 'mat', want: powM(A, n) } };
      },
      // ベクトルにかける：A^n (x, y)
      s3(r) {
        const a = r.int(1, 4), b = r.pick([-2, -1, 1, 2]), n = r.int(3, 6), A = [[a, b], [b, a]], x = r.int(1, 4), y = r.pick([0, 1, 2, -1]);
        if (EX74.some(B => same(A, B)) || Math.abs(a) === Math.abs(b) || x === y || x === -y || Math.max(Math.abs(a + b), Math.abs(a - b)) ** n > 1100 || (x + y) % 2) return null;
        const W = M.Mat.mul(powM(A, n), M.Mat.make([[x], [y]]));
        return { q: `$${pm(A)}^{${n}}${cv([x, y])}$`, a: `$${cv(W.map(row => F_(row[0])))}$`, key: kA(A), easyCheck: false,
          easy: `$q_1=${(x + y) / 2}$、$q_2=${(x - y) / 2}$ をそれぞれ $${a + b < 0 ? `(${a + b})` : a + b}^{${n}}$ 倍、$${a - b < 0 ? `(${a - b})` : a - b}^{${n}}$ 倍してもどす`, calc: { kind: 'mat', want: W } };
      },
      // わな：ずらしの行列の n 乗 → 7-26
      trap(r) {
        const k = r.pick([1, 2, 3]), n = r.int(3, 8), A = r.chance(0.5) ? [[1, k], [0, 1]] : [[1, 0], [k, 1]];
        return dest({ q: `$${pm(A)}^{${n}}$`, a: `$${pm(powM(A, n).map(row => row.map(F_)))}$`, key: kA(A), calc: { kind: 'mat', want: powM(A, n) } }, '7-74',
          '対角が同じでも、右上と左下がちがう（ずらしの行列）。固有値1の重解で、対角化できない。ずらしの $n$ 乗は、ずらす量が $n$ 倍', ['7-26']);
      },
    },
  });

  // ================================================================ 7-75
  const EX75 = [[[2, 1], [0, 3]], [[2, 1], [0, 2]], [[2, 1], [1, 2]], [[3, 0], [0, 3]], [[1, 1], [0, 1]], [[2, 0], [0, 3]]];
  const bad75 = A => EX75.some(B => same(A, B));
  // 対角化できるか（別の道すじ：重解なら A−λI が0の行列か）
  const canDiag = A => { const rt = roots2(A); if (Math.abs(rt[0][1]) > 1e-12) return false; if (!cnear(rt[0], rt[1])) return true; const l = rt[0][0]; return [A[0][0] - l, A[0][1], A[1][0], A[1][1] - l].every(x => Math.abs(x) < 1e-12); };
  const triTxt = A => pm(A);
  M.add({
    id: '7-75', part: 5, chap: '7-9⑧（せいかく）例題7', stars: 1,
    title: '三角の形（左下か右上が0）は、固有値が対角成分。固有値がちがえば対角化できる、重解なら（ななめ以外が0でないかぎり）できない',
    mark: '左下か右上が0の行列の固有値、「対角化できるか」。',
    futsu: ['$\\det(A-\\lambda I)$ を', '$(2-\\lambda)(3-\\lambda)-1\\times0$ と書き、', '展開して解いて、固有ベクトルをさがす'],
    raku: ['$\\begin{pmatrix}2&1\\\\0&3\\end{pmatrix}$ → 2と3 → できる', '$\\begin{pmatrix}2&1\\\\0&2\\end{pmatrix}$ → 2だけ、固有ベクトル1本', '→ できない'],
    why: '左下が0なら $\\det(A-\\lambda I)$ は $(a-\\lambda)(d-\\lambda)-b\\times0$、つまり $(a-\\lambda)(d-\\lambda)$ で、展開しなくても解は $a$ と $d$（右上が0でも同じ）。固有値がちがえば、固有ベクトルは平行にならず2本あるので、対角化できる。重解で、右上（左下）が0でないと、$A-\\lambda I$ の式は1つだけで固有ベクトルは1本、$P$ が作れない（7-9⑧ せいかくに言うと）。',
    caution: '三角の形でないと、対角成分は固有値でない（主役の行列は、対角が2と2でも、固有値は3と1）。重解でも、もともと対角行列（$3I$ など）なら、そのまま $D$。上の三角の $P$ は1列め $(1,\\ 0)$、2列め $(b,\\ d-a)$。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '16mm', s3: '58mm', trap: '16mm' },
    fits(q) {
      if (/は固有ベクトルか|\^\{\d+\}|R\^\{\\mathsf T\}|くり返しかけ|状態の行列|固有値 \$/.test(q) || !/固有値|対角化|P\^\{-1\}AP/.test(q)) return false;
      const A = matsIn(q)[0]; if (!A) return false;
      if (A.length === 3) return A.every((row, i) => row.every((x, j) => j >= i || x === 0)) || A.every((row, i) => row.every((x, j) => j <= i || x === 0));
      return tri(A) && (A[0][1] !== 0 || A[1][0] !== 0);
    },
    steps: {
      // 固有値
      s1(r) {
        const a = r.int(-4, 8), d = r.chance(0.2) ? a : r.int(-4, 8), e = r.pick([-5, -3, -2, -1, 1, 2, 3, 4, 6]), A = r.chance(0.5) ? [[a, e], [0, d]] : [[a, 0], [e, d]];
        if (bad75(A)) return null;
        return { q: `$${triTxt(A)}$ の固有値`, a: a === d ? `$${a}$（重解）` : `$${a}$、$${d}$`, key: kA(A), easyCheck: false,
          easy: `${A[0][1] === 0 ? '右上' : '左下'}が0なので、対角成分`, verify: p => { const v = valsOf(p.a), rt = roots2(A); return (a === d ? (v.length === 1 && cnear(v[0], rt[0]) && cnear(v[0], rt[1])) : sameSet(v, rt)) || '固有値がちがう'; } };
      },
      // 対角化できるか
      s2(r) {
        const yes = turn(r, '75s2', 2) === 0, a = r.int(-3, 7), d = yes ? r.intNot(-3, 7, x => x === a) : a, e = r.pick([-4, -2, -1, 1, 2, 3, 5]), A = r.chance(0.5) ? [[a, e], [0, d]] : [[a, 0], [e, d]];
        if (bad75(A)) return null;
        return { q: `$${triTxt(A)}$ は対角化できるか（できる・できない）`, a: yes ? 'できる' : 'できない', key: kA(A), easyCheck: false,
          easy: yes ? `固有値 $${a}$ と $${d}$ がちがう` : `固有値 $${a}$ の重解で、ななめ以外が0でない`, verify: p => (p.a === (canDiag(A) ? 'できる' : 'できない')) || '対角化できるかがちがう' };
      },
      // P と D・3×3 の三角
      s3(r) {
        if (turn(r, '75s3', 2) === 0) {
          const yes = r.chance(0.6), a = r.int(-2, 6), d = yes ? r.intNot(-2, 6, x => x === a) : a, e = r.pick([-3, -2, -1, 1, 2, 3, 4]), up = r.chance(0.5), A = up ? [[a, e], [0, d]] : [[a, 0], [e, d]];
          if (bad75(A)) return null;
          const P = up ? colsP([1, 0], norm([e, d - a])) : colsP(norm([a - d, e]), [0, 1]), D = up ? diagD(a, d) : diagD(a, d);
          return { q: `$${triTxt(A)}$ が対角化できるなら $P^{-1}AP=D$ の $P$ と $D$（できないなら「できない」）`, a: yes ? `$P=${pm(P)}$、$D=${pm(D)}$` : 'できない', key: kA(A), easyCheck: false,
            easy: yes ? `固有値 $${a}$、$${d}$ の固有ベクトルを列に` : '重解で、固有ベクトルが1本',
            verify: p => {
              if (p.a === 'できない') return !canDiag(A) || '対角化できるはず';
              const ms = matsIn(p.a); if (ms.length !== 2) return '$P$ と $D$ がない';
              const [P2, D2_] = ms, AP = mulv(A, [P2[0][0], P2[1][0]]).concat(mulv(A, [P2[0][1], P2[1][1]])), PD = [P2[0][0] * D2_[0][0], P2[1][0] * D2_[0][0], P2[0][1] * D2_[1][1], P2[1][1] * D2_[1][1]];
              return (D2_[0][1] === 0 && D2_[1][0] === 0 && Math.abs(P2[0][0] * P2[1][1] - P2[0][1] * P2[1][0]) > 1e-9 && AP.every((x, i) => near(x, PD[i]))) || '$AP=PD$ にならない';
            } };
        }
        const dg = [r.int(-3, 6), r.int(-3, 6), r.int(-3, 6)], up = r.chance(0.5), A = [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? dg[i] : (up ? j > i : j < i) ? r.int(-3, 5) : 0)));
        if (new Set(dg).size < 3) return null;
        return { q: `$${pm(A)}$ の固有値`, a: dg.map(x => `$${x}$`).join('、'), key: kA(A), easyCheck: false, easy: `${up ? '左下' : '右上'}が0なので、対角成分`,
          verify: p => { const v = valsOf(p.a); if (v.length !== 3 || v.some(z => !z)) return '固有値が3つない'; const det3 = x => F_(M.Mat.det(M.Mat.make(A.map((row, i) => row.map((y, j) => (i === j ? y - x : y)))))); return [0.3, 1.7, -2.2].every(x => near(det3(x), v.reduce((acc, z) => acc * (z[0] - x), 1), 1e-9)) || '固有値がちがう'; } };
      },
      // わな：三角の形でない（対角が同じ対称）→ 7-63
      trap(r) {
        const a = r.int(-2, 6), b = r.pick([-3, -2, -1, 1, 2, 3]), A = [[a, b], [b, a]];
        if (bad75(A)) return null;
        return dest({ q: `$${pm(A)}$ の固有値`, a: `$${a + b}$、$${a - b}$`, key: kA(A), verify: p => valsCheck(p, roots2(A)) }, '7-75',
          '左下も右上も0でないので、対角成分は固有値でない');
      },
    },
  });

  // ================================================================ 7-76
  const term = (c, w) => (c === 0 ? '' : `${fmt(c)}\\cos${w}${/sqrt/.test(w) ? '\\,' : ''}t`);   // 0.03\cos10t・0.02\cos10\sqrt{2}\,t
  // ẍ = B x を、はじめの位置 x0・速度0 からルンゲ・クッタ法でたどった、時刻 ts での位置
  function cartRK(B, x0, ts) {
    const h = 0.0005, out = []; let x = x0.slice(), v = [0, 0], t = 0;
    const acc = y => mulv(B, y);
    for (const T of ts) {
      while (t < T - 1e-12) {
        const k1x = v, k1v = acc(x), x2 = x.map((z, i) => z + h / 2 * k1x[i]), v2 = v.map((z, i) => z + h / 2 * k1v[i]);
        const k2x = v2, k2v = acc(x2), x3 = x.map((z, i) => z + h / 2 * k2x[i]), v3 = v.map((z, i) => z + h / 2 * k2v[i]);
        const k3x = v3, k3v = acc(x3), x4 = x.map((z, i) => z + h * k3x[i]), v4 = v.map((z, i) => z + h * k3v[i]);
        const k4x = v4, k4v = acc(x4);
        x = x.map((z, i) => z + h / 6 * (k1x[i] + 2 * k2x[i] + 2 * k3x[i] + k4x[i])); v = v.map((z, i) => z + h / 6 * (k1v[i] + 2 * k2v[i] + 2 * k3v[i] + k4v[i])); t += h;
      }
      out.push(x.slice());
    }
    return out;
  }
  const TS = [0.25, 0.6];
  // 答えの「$x_1=…$」「$x_2=…$」を、ルンゲ・クッタ法でたどった位置とくらべる
  function motionCheck(p, B, x0, want) {
    const sol = cartRK(B, x0, TS), got = {};
    for (const s of maths(p.a)) { const m = /^x_([12])=(.+)$/.exec(s.replace(/^x_\{?([12])\}?/, 'x_$1')); if (m) got[m[1]] = m[2]; }
    for (const i of want) {
      if (!got[i]) return `$x_${i}$ がない`;
      for (let k = 0; k < TS.length; k++) if (!near(M.evalMath(got[i], { t: TS[k] }), sol[k][i - 1], 1e-6)) return `$x_${i}$ がちがう（t=${TS[k]}）`;
      if (!near(M.evalMath(got[i], { t: 0 }), x0[i - 1], 1e-9)) return `$x_${i}$ のはじめの位置がちがう`;
    }
    return true;
  }
  // 台車の問題の数：ω1²、ω2²（どちらも整数）と、はじめのずれ x1・x2（m。q1・q2 が小数第2位まで）
  function genMotion(r, w1s, w2s) {
    for (let k = 0; k < 50; k++) {
      const x1 = r.int(0, 8) / 100, x2 = r.int(-2, 8) / 100, q1 = +((x1 + x2) / 2).toFixed(4), q2 = +((x1 - x2) / 2).toFixed(4);
      if (Math.round((x1 + x2) * 100) % 2 || q1 === 0 || q2 === 0 || (x1 === 0.05 && x2 === 0.01)) continue;
      const w1 = wTeX(w1s), w2 = wTeX(w2s);
      return { x1, x2, q1, q2, w1, w2, B: [[-(w1s + w2s) / 2, (w2s - w1s) / 2], [(w2s - w1s) / 2, -(w1s + w2s) / 2]],
        e1: sum([term(q1, w1), term(q2, w2)]), e2: sum([term(q1, w1), term(-q2, w2)]) };
    }
    return null;
  }
  const xTxt = g => `$x_1=${fmt(g.x1)}$、$x_2=${fmt(g.x2)}$（m）だけずらして、静かにはなした`;
  M.add({
    id: '7-76', part: 5, chap: '7-9⑦ 例題5', stars: 1,
    title: '台車の動きはモードの座標で：$q_1=\\frac{x_1+x_2}{2}$、$q_2=\\frac{x_1-x_2}{2}$ を $\\cos\\omega t$ でゆらしてもどす（$x_1=q_1\\cos\\omega_1t+q_2\\cos\\omega_2t$、$x_2$ は $q_2$ の項が $-$）',
    mark: '台車2つをずらして静かにはなしたときの $x_1$、$x_2$。',
    futsu: ['連立の微分方程式 $\\ddot x_1=\\cdots$、$\\ddot x_2=\\cdots$ に', '$x_1=A\\cos\\omega_1t+B\\cos\\omega_2t$ などを入れて、', '4つの係数をはじめの位置から連立方程式で決める'],
    raku: ['$\\omega_1=10$、$\\omega_2=10\\sqrt2$、$x_1=0.05$、$x_2=0.01$', '→ $q_1=0.03$、$q_2=0.02$', '→ $x_1=0.03\\cos10t+0.02\\cos10\\sqrt2\\,t$'],
    why: 'モードの物差しで $\\vec x=P\\vec q$ と読むと、$\\ddot q_1=-\\omega_1^2q_1$、$\\ddot q_2=-\\omega_2^2q_2$ にほどける（7-9⑦）。静かにはなすと、それぞれ $q\\cos\\omega t$（6-6）。はじめの $q$ は $P^{-1}\\vec x$ で、和の半分と差の半分。もどすと $x_1=q_1+q_2$、$x_2=q_1-q_2$。',
    caution: '$q$ は2でわる。$\\omega_1$ は「いっしょ」の $(1,\\ 1)$、$\\omega_2$ は「反対」の $(1,\\ -1)$（取りちがえない）。$x_2$ では $q_2$ の項の符号が変わる。$q_2$ が負のこともある。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '50mm', s2: '50mm', s3: '62mm', trap: '20mm' },
    fits(q) { return /台車/.test(q) && /静かにはなし/.test(q) && /\$x_[12]\$(、\$x_2\$)? *$/.test(q.trim()); },
    steps: {
      // B の固有値が書いてあり、x1 を聞く
      s1(r) {
        const w1 = r.int(2, 9), w2 = r.int(w1 + 1, 12), g = genMotion(r, w1 * w1, w2 * w2); if (!g) return null;
        if (w1 === 4 && w2 === 6 && g.x1 === 0.04 && g.x2 === 0.02) return null;
        return { q: `$\\ddot{\\vec x}=B\\vec x$ の $B$ の固有値が $${-w1 * w1}$（$(1,\\ 1)$）と $${-w2 * w2}$（$(1,\\ -1)$）の台車2つを、${xTxt(g)}。$x_1$`, a: `$x_1=${g.e1}$`, key: `${w1},${w2}|${g.x1},${g.x2}`, easyCheck: false,
          easy: `$q_1=${fmt(g.q1)}$、$q_2=${fmt(g.q2)}$、$\\omega_1=${w1}$、$\\omega_2=${w2}$`, verify: p => motionCheck(p, g.B, [g.x1, g.x2], ['1']) };
      },
      // x2 を聞く（q2 の符号が変わる）
      s2(r) {
        const w1 = r.int(2, 9), w2 = r.int(w1 + 1, 12), g = genMotion(r, w1 * w1, w2 * w2); if (!g) return null;
        return { q: `$\\ddot{\\vec x}=B\\vec x$ の $B$ の固有値が $${-w1 * w1}$（$(1,\\ 1)$）と $${-w2 * w2}$（$(1,\\ -1)$）の台車2つを、${xTxt(g)}。$x_2$`, a: `$x_2=${g.e2}$`, key: `${w1},${w2}|${g.x1},${g.x2}`, easyCheck: false,
          easy: `$q_1=${fmt(g.q1)}$、$q_2=${fmt(g.q2)}$。$x_2=q_1\\cos\\omega_1t-q_2\\cos\\omega_2t$`, verify: p => motionCheck(p, g.B, [g.x1, g.x2], ['2']) };
      },
      // 質量・ばね定数から（√ が残る角振動数もまぜる）、x1 か x2
      s3(r) {
        const m = r.pick([1, 2, 0.5]), w1s = r.pick([4, 9, 16, 25, 36, 49, 64, 100]), w2s = r.pick([8, 18, 32, 50, 72, 98, 128, 200, 49, 64, 81, 100, 144].filter(x => x > w1s + 2));
        const c = cartOf(m, w1s, w2s); if (!c) return null;
        const g = genMotion(r, w1s, w2s); if (!g) return null;
        const i = turn(r, '76s3', 2) + 1;
        return { q: `${cartTxt(m, c.k, c.K)}。${xTxt(g)}。$x_${i}$`, a: `$x_${i}=${i === 1 ? g.e1 : g.e2}$`, key: `m${m},${c.k},${c.K}|${g.x1},${g.x2}`, easyCheck: false,
          easy: `$\\omega_1=\\sqrt{\\frac{${fmt(c.k)}}{${fmt(m)}}}=${g.w1}$、$\\omega_2=\\sqrt{\\frac{${fmt(c.k + 2 * c.K)}}{${fmt(m)}}}=${g.w2}$。$q_1=${fmt(g.q1)}$、$q_2=${fmt(g.q2)}$`,
          verify: p => motionCheck(p, cartB(m, c.k, c.K), [g.x1, g.x2], [String(i)]) };
      },
      // わな：動きではなく、いっしょのモードの角振動数 → 7-66
      trap(r) {
        const m = r.pick([1, 2, 0.5]), w1 = r.int(2, 9), w2 = r.int(w1 + 1, 12), c = cartOf(m, w1 * w1, w2 * w2); if (!c) return null;
        const g = genMotion(r, w1 * w1, w2 * w2); if (!g) return null;
        const which = r.chance(0.5), B = cartB(m, c.k, c.K);
        return dest({ q: `${cartTxt(m, c.k, c.K)}。${xTxt(g)}。${which ? 'いっしょに動く' : '反対に動く'}モードの角振動数`, a: `$${U(which ? w1 : w2, 'rad/s')}$`, key: `t${m},${c.k},${c.K}`,
          verify: p => { const w = wsOf(p.a)[0], u = which ? [1, 1] : [1, -1], b = mulv(B, u); return (near(b[0] * u[1], b[1] * u[0]) && near(-b[0] / u[0], w * w)) || '角振動数がちがう'; } }, '7-76',
          'はじめのずれは、角振動数には関係しない（ずれで決まるのは $q_1$、$q_2$ だけ）。モードの角振動数は、ばねと質量だけで決まる', ['7-66']);
      },
    },
  });
})(globalThis.MONDAI);
