/* 問題集 第7巻　第6部 くり返しと行列の使いみち（わざ 7-77〜7-90、7-99）　組 f
 * 書き方は v7/README.md・v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第7巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 7-10・7-11 の数・ことば・記号にそろえる（漸化式 $x_{n+1}=ax_n$、$\vec x_{n+1}=A\vec x_n$、落ち着く先、移り方の行列（列が今日の天気から）、
 *   1歩の行列 $I+A\,\Delta t$、こわれない、ふくらむ、速度を先に進める、ヤコビ行列 $J$、$\Delta\vec\theta=J^{-1}\Delta\vec p$、通りやすさ $G=\frac1R$、黄金比）。
 * 単位は $50\,\mathrm{mL}$・$10\,\Omega$・$0.1\,\mathrm{S}$・$0.30\,\mathrm{m}$（O-7）。％・℃ は式の外。
 * 近似値は文に値とけたを書く（$\sqrt5=2.236$ など）。文の値で計算した答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4。agree()）。近似の答えは「約」と ≈。
 * 答えは √・e を残した形（$\sqrt{1.04}$、$\frac{1+\sqrt5}{2}$、$\frac{1}{1-e^{-1}}$）。
 * 検算：行列の答えは calc（kind 'mat'）、微分方程式の解は calc（kind 'ode'）、式・数の答えは checkMath と verify(p)。
 *   verify は、問題を作った式とは別の道すじ（漸化式を1回ずつたどる・行列を何回もかける・逆行列を作らずに $J\Delta\vec\theta=\Delta\vec p$ を確かめる・
 *   numpy の計算を1行ずつまねる・こわれない Δt を細かく変えてさがす）で確かめる。
 * 図は 7-80（移り方の丸と矢印。曲がった矢印は弧）と 7-90（地面と抵抗2本。M.figResistor）のステップ3だけ（K-2）。
 * プログラム（p.code）は 7-88 のステップ3だけ。見わけようは文しか出さないので、ステップ1・2 は1行のコード（`…`）を文の中に書く。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2）。key は、ステップがちがっても同じ問題（同じ数の組）なら同じになる形にする。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「楽な形なし」）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F, Mt = M.Mat;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                        // 0.30000000004 → 0.3
  const D = x => (Array.isArray(x) ? x : F.fromDec(String(x)));        // 0.5 → [1, 2]
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
  const decLen = f => { const t = dec(f); return t == null ? 99 : (t.split('.')[1] || '').length; };   // 小数のけた数（小数で書けなければ 99）
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
  const fx = f => (f[1] === 1 ? String(f[0]) : dec(f) || F.tex(f));   // 分数 → 整数・小数・\frac
  const fxs = f => (f[0] < 0 ? `(${fx(f)})` : fx(f));                 // 負なら（ ）をつける
  const pt = (...vs) => `(${vs.map(v => fx(D(v))).join(',\\ ')})`;      // 点・組：(3,\ 1)
  const pm = rows => `\\begin{pmatrix}${rows.map(r => r.map(v => fx(D(v))).join('&')).join('\\\\')}\\end{pmatrix}`;   // 小数で書く行列
  const colv = vs => pm(vs.map(v => [v]));                               // たてのベクトル
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const isInt = f => f[1] === 1;
  // 答えの文の中の数（$…$ ごと。単位と「x=」をとる）
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  // 答えの「(a,\ b)」「\left(…\right)」の組を読む（数の配列）。読めなければ null
  const pairOf = a => {
    const t = String(a).replace(/\$/g, '').replace(/\\left|\\right/g, ''), i = t.indexOf('('), j = t.lastIndexOf(')');
    if (i < 0 || j < i) return null;
    const v = t.slice(i + 1, j).split(',').map(x => ev(x.replace(/\\ /g, '').trim()));
    return v.some(x => x == null || !isFinite(x)) ? null : v;
  };
  // 組の TeX：分数があれば \left( \right)
  const tup = fs => { const b = fs.map(f => fx(D(f))).join(',\\ '); return /\\frac/.test(b) ? `\\left(${b}\\right)` : `(${b})`; };
  const vnear = (u, v, tol) => !!u && u.length === v.length && u.every((x, k) => near(x, v[k], tol || 1e-9));
  // 行列（数）×ベクトル（数）
  const mv = (A, v) => A.map(r => r.reduce((s, x, k) => s + x * v[k], 0));
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(strip);
  // 項に分ける（{ } と ( ) の中の ＋ − では分けない）。[符号, 項] の配列
  function terms(s) {
    const out = []; let d = 0, cur = '', sg = 1;
    s = s.replace(/\s+/g, ' ').trim();
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{' || ch === '(') d++; else if (ch === '}' || ch === ')') d--;
      if (d === 0 && (ch === '+' || ch === '-') && cur.trim() !== '') { out.push([sg, cur.trim()]); cur = ''; sg = ch === '-' ? -1 : 1; continue; }
      if (d === 0 && (ch === '+' || ch === '-') && cur.trim() === '') { if (ch === '-') sg = -sg; continue; }
      cur += ch;
    }
    if (cur.trim() !== '') out.push([sg, cur.trim()]);
    return out;
  }
  // 文の中の 2×2 の行列（はじめの1つ。成分は数）。なければ null
  function mat2(q) {
    const m = /\\begin\{pmatrix\}([^]*?)\\end\{pmatrix\}/.exec(q); if (!m) return null;
    const rows = m[1].split('\\\\').map(r => r.split('&').map(c => ev(c.trim())));
    return rows.length === 2 && rows.every(r => r.length === 2 && r.every(v => v != null && isFinite(v))) ? rows : null;
  }
  // 2×2 の行列の固有値（実数なら [λ1, λ2]（大きさの大きい順）、複素数なら { re, im }）
  function eig2(A) {
    const tr = A[0][0] + A[1][1], dt = A[0][0] * A[1][1] - A[0][1] * A[1][0], ds = tr * tr / 4 - dt;
    if (ds < -1e-12) return { re: tr / 2, im: Math.sqrt(-ds) };
    const s = Math.sqrt(Math.max(0, ds)), l = [tr / 2 + s, tr / 2 - s];
    return Math.abs(l[0]) >= Math.abs(l[1]) ? l : [l[1], l[0]];
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。楽な形なし）」を書く。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(7).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 6 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : '楽な形なし'}）`;
    p.easyCheck = false;
    return p;
  }
  // 漸化式 x_{n+1}=a x_n (+c) を n 回たどる（小数）
  const iter1 = (a, c, x0, n) => { let x = x0; for (let k = 0; k < n; k++) x = a * x + c; return x; };

  // ================================================================ 7-77
  const BEH = ['ふえる', '0に近づく', 'ゆれながらふえる', 'ゆれながら0に近づく'];
  const BEHQ = '（ふえる・0に近づく・ゆれながらふえる・ゆれながら0に近づく）';
  const behOf = a => BEH[(a < 0 ? 2 : 0) + (Math.abs(a) < 1 ? 1 : 0)];
  // 確かめ：60回たどって、大きさと符号の入れかわりを見る（a の大きさと符号は使わない）
  function behCheck(p, a, x0) {
    const xs = [x0]; for (let k = 0; k < 60; k++) xs.push(a * xs[k]);
    const swap = xs.slice(1).every((x, k) => Math.sign(x) !== Math.sign(xs[k])), grow = Math.abs(xs[60]) > Math.abs(x0);
    const want = (swap ? 'ゆれながら' : '') + (grow ? 'ふえる' : '0に近づく');
    return p.a === want || `ふるまいは ${want} のはず`;
  }
  const ax = (a, v) => `${a === 1 ? '' : a === -1 ? '-' : fmt(a)}${v}_n`;
  M.add({
    id: '7-77', part: 6, chap: '7-10④ 例題1', stars: 1,
    title: '$x_{n+1}=ax_n$ は $x_n=a^nx_0$：$\\lvert a\\rvert>1$ でふえ、$\\lvert a\\rvert<1$ で0へ、$a<0$ なら符号が毎回入れかわる',
    mark: '1つの数のくり返し $x_{n+1}=ax_n$ と、はじめの値 $x_0$。「$x_4$ は」「くり返すとどうなるか」。',
    futsu: ['$x_1=-0.5\\times16=-8$、', '$x_2=-0.5\\times(-8)=4$、…と', '1回ずつ計算して、ならべて見る'],
    raku: ['$x_{n+1}=-0.5x_n$、$x_0=16$', '→ $x_4=(-0.5)^4\\times16=1$', '$\\lvert-0.5\\rvert<1$ で0へ、負で符号が入れかわる', '→ ゆれながら0に近づく'],
    why: '1回ごとに $a$ 倍なので、$x_1=ax_0$、$x_2=a^2x_0$、…、$x_n=a^nx_0$（3-11 の倍々。7-10④）。大きさは1回ごとに $\\lvert a\\rvert$ 倍なので、$\\lvert a\\rvert>1$ ならふえ続け、$\\lvert a\\rvert<1$ なら0に近づく。負の数を2回かけると正にもどるので、$a<0$ なら符号が毎回入れかわる。',
    caution: '負の $a$ でも、大きさが1より大きければふえる（$a=-1.5$ は小さくならない）。$(-0.5)^4$ はかっこをつけて計算する（正の数）。毎回同じ量をたす形（$x_{n+1}=ax_n+c$）は、この形ではない。',
    counts: { s1: 8, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '36mm', s3: '22mm', trap: '20mm' },
    fits(q) {
      if (/\\begin\{pmatrix\}|行列|固有値|オイラー法|落ち着|毎朝|毎日|mL|_\{n-1\}/.test(q)) return false;
      if (/[a-z]_\{n\+1\}=-?[\d.]*[a-z]_n\$/.test(q)) return true;
      return /(ごと|たび)に.*倍にな/.test(q) && /(あと|後)の/.test(q);
    },
    steps: {
      // x_n を求める
      s1(r) {
        const a = r.pick([2, -2, 3, -3, 0.5, -0.5, 1.5, -1.5, 0.2, -0.2, 0.1, -0.1, 0.4, -0.4]), n = r.int(2, 4), x0 = r.pick([1, 2, 3, 4, 5, 8, 10, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 200, 1000]);
        if (a === -0.5 && x0 === 16) return null;   // 楽な形の例（O-2）
        let v = fr(1); for (let k = 0; k < n; k++) v = F.mul(v, D(a)); v = F.mul(v, fr(x0));
        if (decLen(v) > 3 || Math.abs(F.val(v)) > 5000 || (Math.abs(F.val(v)) < 0.01)) return null;
        return { q: `$x_{n+1}=${ax(a, 'x')}$、$x_0=${x0}$ のとき $x_${n}$`, a: `$${fx(v)}$`, key: `${a}|${x0}|${n}`,
          easy: `$x_${n}=${fxs(D(a))}^${n}\\times${x0}$`, easyCheck: 'last',
          verify: p => near(nums(p.a)[0], iter1(a, 0, x0, n), 1e-9) || '1回ずつたどった値とちがう' };
      },
      // ふるまい（4つの形）と、x_n を n の式で
      s2(r) {
        if (turn(r, '77s2', 3) < 2) {
          const a = r.pick([1.2, -1.2, 0.8, -0.8, 1.1, -1.1, 0.9, -0.9, 2, -2, 0.3, -0.3, 1.05, -0.95, 3, -3, 0.6, -0.6, -0.7, 1.3]), x0 = r.int(1, 20);
          return { q: `$x_{n+1}=${ax(a, 'x')}$、$x_0=${x0}$ をくり返すと${BEHQ}`, a: behOf(a), key: `b${a}`, easyCheck: false,
            easy: `$\\lvert a\\rvert=${fmt(Math.abs(a))}${Math.abs(a) > 1 ? '>' : '<'}1$${a < 0 ? '、$a<0$' : ''}`, verify: p => behCheck(p, a, x0) };
        }
        const a = r.pick([2, 3, -2, -3, 0.5, 1.5, 4, 5, 10, 0.1, -4]), x0 = r.pick([2, 3, 4, 5, 6, 7, 10]);
        const ans = `${x0}\\times${a < 0 ? `(${a})` : a}^n`;
        return { q: `$x_{n+1}=${ax(a, 'x')}$、$x_0=${x0}$ のとき、$x_n$ を $n$ の式で`, a: `$${ans}$`, key: `f${a}|${x0}`, easyCheck: false, boxw: '24mm',
          easy: `$x_1=${a < 0 ? `(${a})` : a}\\times${x0}$、$x_2=${a < 0 ? `(${a})` : a}^2\\times${x0}$、…`,
          verify: p => [0, 1, 2, 3, 5].every(n => near(ev(strip(p.a), { n }), iter1(a, 0, x0, n), 1e-9)) || '式の値が、たどった値とちがう' };
      },
      // 見かけがちがう：はねるボール・温度の差・ふえる細菌（答えを r.ans77 に覚えて、わなの答えと重ねない。O-2）
      s3(r) {
        const p = s3of77(r); if (p) (r.ans77 || (r.ans77 = new Set())).add(p.a);
        return p;
      },
      // わな：毎回同じ量をたす（7-78）
      trap(r) { return trap77(r); },
    },
  });
  function s3of77(r) {
        const kind = turn(r, '77s3', 3);
        if (kind === 0) {
          const a = r.pick([0.8, 0.5, 0.6, 0.4, 0.9]), h = r.pick([1, 2, 5, 10, 4]), n = r.int(2, 3);
          const v = F.mul(F.mul(fr(h), D(a)), n === 3 ? F.mul(D(a), D(a)) : D(a));
          if (decLen(v) > 3) return null;
          return { q: `はねるたびに、高さが前の $${a}$ 倍になるボールを、高さ ${U(h, 'm')} から落とした。${n}回はねたあとの高さ ＝ $□\\,\\mathrm{m}$`, a: `$${fx(v)}$`, key: `${a}|${h}|${n}`,
            easy: `$${a}^${n}\\times${h}=${fx(v)}$`, easyCheck: 'last', verify: p => near(nums(p.a)[0], iter1(a, 0, h, n), 1e-9) || 'たどった高さとちがう' };
        }
        if (kind === 1) {
          const a = r.pick([-0.5, 0.5, -0.2, 0.8, -0.8, 0.2]), Ta = r.pick([20, 25, 15]), u0 = r.pick([40, 50, 60, 80]), n = r.int(2, 3);
          let u = fr(u0); for (let k = 0; k < n; k++) u = F.mul(u, D(a));
          const T = F.add(fr(Ta), u); if (decLen(T) > 3) return null;
          return { q: `部屋の温度との差が、1歩ごとに $${a}$ 倍になる計算をした（部屋は ${Ta}℃、はじめのお湯は ${Ta + u0}℃）。${n}歩あとの温度 ＝ □℃`, a: `$${fx(T)}$`, key: `${a}|${u0}|${n}`,
            easy: `差は $${fxs(D(a))}^${n}\\times${u0}=${fx(u)}$`, easyCheck: false, verify: p => near(nums(p.a)[0], Ta + iter1(a, 0, u0, n), 1e-9) || 'たどった温度とちがう' };
        }
        const a = r.pick([2, 3, 1.5]), x0 = r.pick([100, 200, 300, 500]), n = r.int(3, 5);
        let v = fr(x0); for (let k = 0; k < n; k++) v = F.mul(v, D(a));
        if (!isInt(v) || F.val(v) > 50000) return null;
        return { q: `1時間ごとに $${a}$ 倍になる細菌が、はじめ ${x0} 個いる。${n}時間あとの数 ＝ □ 個`, a: `$${fx(v)}$`, key: `${a}|${x0}|${n}`,
          easy: `$${a}^${n}\\times${x0}=${fx(v)}$`, easyCheck: 'last', verify: p => near(nums(p.a)[0], iter1(a, 0, x0, n), 1e-9) || 'たどった数とちがう' };
  }
  function trap77(r) {
        const a = r.pick([0.5, 0.2, 0.75, 0.8, 0.6, 0.9]), y = r.pick([5, 10, 20, 30, 40]), c = F.mul(fr(y), F.sub(fr(1), D(a))), x0 = r.int(0, 3);
        if ((!isInt(c) && decLen(c) > 1) || (r.ans77 && r.ans77.has(`$${y}$`))) return null;
        return dest({ q: `$x_{n+1}=${fmt(a)}x_n+${fx(c)}$、$x_0=${x0}$ をくり返したときの落ち着く先`, a: `$${y}$`, key: `t${a}|${fx(c)}`,
          verify: p => near(nums(p.a)[0], iter1(a, F.val(c), x0, 400), 1e-6) || 'たどった値が近づく数とちがう' }, '7-77',
        `毎回 $${fx(c)}$ をたすので、$a^nx_0$ の形ではない。次＝今として $x=${fmt(a)}x+${fx(c)}$`, ['7-78']);
  }

  // ================================================================ 7-78
  const settle = (a, c) => F.div(D(c), F.sub(fr(1), D(a)));
  // 文の中の「y_{n+1}=ay_n+c」（x・T などでも）。[a, c] か null
  function affine(q) {
    const m = /([a-zA-Z])_\{n\+1\}=(-?[\d.]*)\1_n([+-][\d.]+)\$/.exec(q); if (!m) return null;
    const a = m[2] === '' ? 1 : m[2] === '-' ? -1 : +m[2]; return [a, +m[3]];
  }
  M.add({
    id: '7-78', part: 6, chap: '7-10⑤ 例題2', stars: 1,
    title: '「毎回 $a$ 倍＋同じ量 $c$」の落ち着く先は、次＝今として $y=ay+c$ → $y=\\dfrac{c}{1-a}$',
    mark: '$y_{n+1}=ay_n+c$（$\\lvert a\\rvert<1$）、毎朝たす水・毎日飲む薬の「落ち着く先」。',
    futsu: ['$y_2=0.6\\times50+50=80$、$y_3=98$、', '$y_4=108.8$、$y_5=115.28$、…と', '1日ずつ計算して、近づく数をさがす'],
    raku: ['毎朝 $50\\,\\mathrm{mL}$、1日で0.6倍', '落ち着いたら 次＝今：$y=0.6y+50$', '$0.4y=50$ → $y=\\dfrac{50}{0.4}=125$（mL）'],
    why: '落ち着いたあとは、今の量と次の量が同じなので、$y_{n+1}$ と $y_n$ を両方 $y$ にできる（7-10⑤）。$y=ay+c$ から $(1-a)y=c$、$y=\\dfrac{c}{1-a}$。等比級数で見ると $c\\,(1+a+a^2+\\cdots)=\\dfrac{c}{1-a}$ で、同じ答えになる。',
    caution: '$\\lvert a\\rvert\\geqq1$ では落ち着かない（ふえ続けるか、ゆれながら大きくなる）。$1-a$ でわる（$1+a$ ではない）。はじめの量は、落ち着く先に関係しない。',
    counts: { s1: 8, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '18mm', s3: '18mm', trap: '24mm' },
    fits(q) {
      if (/\\begin\{pmatrix\}|行列|晴れ|リンク|置き場/.test(q)) return false;
      const f = affine(q); if (f) return Math.abs(f[0]) < 1 && f[1] !== 0 && /落ち着/.test(q);
      if (/T_\{n\+1\}=T_n-/.test(q) && /落ち着/.test(q)) return true;
      return /毎朝|毎日|毎年/.test(q) && /倍/.test(q) && /落ち着/.test(q);
    },
    steps: {
      s1(r) {
        const a = r.pick([0.5, 0.2, 0.25, 0.4, 0.6, 0.75, 0.8, 0.9, 0.1, -0.5]), y = r.pick([10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 300]), c = F.mul(fr(y), F.sub(fr(1), D(a)));
        if (!isInt(c) || ['0.6|50', '0.75|80'].includes(`${a}|${fx(c)}`)) return null;   // 楽な形・目印の例（O-2）
        return { q: `$y_{n+1}=${fmt(a)}y_n+${fx(c)}$ の落ち着く先`, a: `$${y}$`, key: `${a}|${fx(c)}`,
          easy: `$\\frac{${fx(c)}}{1-${fxs(D(a))}}=${y}$`, easyCheck: 'last', verify: p => near(nums(p.a)[0], iter1(a, F.val(c), 0, 400), 1e-6) || 'たどった値が近づく数とちがう' };
      },
      // 植木鉢の水（落ち着く先と、落ち着く先から毎朝の量）
      s2(r) {
        const a = r.pick([0.5, 0.4, 0.6, 0.75, 0.8, 0.9, 0.7]), y = r.pick([100, 120, 150, 200, 250, 300, 400]), c = F.mul(fr(y), F.sub(fr(1), D(a)));
        if (!isInt(c) || ['0.6|50', '0.75|80'].includes(`${a}|${fx(c)}`)) return null;
        if (turn(r, '78s2', 2) === 0)
          return { q: `植木鉢に毎朝 ${U(fx(c), 'mL')} の水をやり、土の水は1日で $${a}$ 倍になる。水をやった直後の量の落ち着く先 ＝ $□\\,\\mathrm{mL}$`, a: `$${y}$`, key: `${a}|${fx(c)}`,
            easy: `$y=${a}y+${fx(c)}$、$y=\\frac{${fx(c)}}{${fmt(1 - a)}}=${y}$`, easyCheck: 'last', verify: p => near(nums(p.a)[0], iter1(a, F.val(c), F.val(c), 400), 1e-6) || 'たどった量とちがう' };
        return { q: `土の水が1日で $${a}$ 倍になる植木鉢で、水をやった直後の量を ${U(y, 'mL')} に落ち着かせたい。毎朝やる水 ＝ $□\\,\\mathrm{mL}$`, a: `$${fx(c)}$`, key: `${a}|${fx(c)}`,
          easy: `$${y}=${a}\\times${y}+c$、$c=${y}\\times${fmt(1 - a)}=${fx(c)}$`, easyCheck: 'last', verify: p => near(iter1(a, nums(p.a)[0], 0, 400), y, 1e-6) || 'その量では落ち着く先がちがう' };
      },
      // 見かけがちがう：薬・池の魚・冷めるお湯の1行
      s3(r) {
        const kind = turn(r, '78s3', 3);
        if (kind === 2) {
          const k = r.pick([0.1, 0.2, 0.05, 0.25, 0.5]), Ta = r.pick([18, 20, 22, 25]), T0 = Ta + r.pick([40, 50, 60]);
          return { q: `冷めるお湯の計算 $T_{n+1}=T_n-${k}\\,(T_n-${Ta})$、$T_0=${T0}$ をくり返したときの落ち着く先`, a: `$${Ta}$`, key: `${fmt(1 - k)}|${fmt(k * Ta)}`,
            easy: `$T=T-${k}\\,(T-${Ta})$ から $T-${Ta}=0$`, easyCheck: false, verify: p => near(nums(p.a)[0], iter1(1 - k, k * Ta, T0, 600), 1e-6) || 'たどった温度とちがう' };
        }
        const a = r.pick([0.5, 0.4, 0.6, 0.8, 0.75, 0.9]), y = r.pick(kind ? [500, 1000, 1500, 2000] : [100, 150, 200, 250, 400]), c = F.mul(fr(y), F.sub(fr(1), D(a)));
        if (!isInt(c)) return null;
        const q = kind === 0 ? `毎日 ${U(fx(c), 'mg')} の薬を飲み、体の中の薬は1日で $${a}$ 倍になる。飲んだ直後の量の落ち着く先 ＝ $□\\,\\mathrm{mg}$`
          : `池の魚が1年で $${a}$ 倍にへり、毎年 ${fx(c)} 匹を放す。放した直後の数の落ち着く先 ＝ □ 匹`;
        return { q, a: `$${y}$`, key: `${a}|${fx(c)}`, easy: `$\\frac{${fx(c)}}{1-${a}}=${y}$`, easyCheck: 'last', verify: p => near(nums(p.a)[0], iter1(a, F.val(c), 0, 600), 1e-6) || 'たどった量とちがう' };
      },
      // わな：|a|>1 は落ち着かない（楽な形なし）
      trap(r) {
        const a = r.pick([1.2, 1.5, 2, 1.1, -1.5, -2, 1.25]), c = r.pick([10, 20, 5, 30, 40]);
        const bad = F.div(fr(c), F.sub(fr(1), D(a)));
        return dest({ q: `$y_{n+1}=${fmt(a)}y_n+${c}$、$y_1=${c}$ の落ち着く先`, a: '落ち着かない', key: `t${a}|${c}`,
          verify: () => Math.abs(iter1(a, c, c, 300)) > 1e6 || 'ふえ続けていない' }, '7-78',
        `$\\lvert${fmt(a)}\\rvert>1$ なので、くり返すたびに${a < 0 ? 'ゆれながら' : ''}大きくなる。$\\frac{${c}}{1-${fxs(D(a))}}=${fx(bad)}$ は答えではない`);
      },
    },
  });

  // ================================================================ 7-79
  // 等比の和：文の式が「となりの比が同じ数の和」か。{ r, inf } か null
  function geom(seg) {
    if (!/\+/.test(seg) || /[a-df-zA-Z]_|=|\\begin/.test(seg)) return null;
    const inf = /\\cdots\s*$/.test(seg), mid = /\\cdots\s*\+/.test(seg);
    const ts = terms(seg.replace(/\\cdots/g, '')).filter(([, t]) => t !== '');
    if (ts.length < 3) return null;
    const v = ts.map(([s, t]) => { const x = ev(t); return x == null ? null : s * x; });
    if (v.some(x => x == null || x === 0)) return null;
    const n = mid ? 3 : v.length, rr = v[1] / v[0];
    for (let k = 1; k < n; k++) if (!near(v[k] / v[k - 1], rr, 1e-9)) return null;
    if (near(rr, 1)) return null;
    return { r: rr, inf };
  }
  M.add({
    id: '7-79', part: 6, chap: '7-10⑤', stars: 1,
    title: '等比数列の和は $\\dfrac{1-x^n}{1-x}$、$\\lvert x\\rvert<1$ なら限りなくたして $\\dfrac{1}{1-x}$',
    mark: '$1+x+x^2+\\cdots$ の形（となりどうしの比が同じ数の和）。',
    futsu: ['$1+0.5=1.5$、$1.5+0.25=1.75$、', '$1.75+0.125=1.875$ と、', '1つずつたしていく'],
    raku: ['$1+0.5+0.25+0.125$（$x=0.5$、4個）', '$=\\dfrac{1-0.5^4}{1-0.5}=\\dfrac{0.9375}{0.5}=1.875$', '限りなくたすと $\\dfrac{1}{1-0.5}=2$'],
    why: '$S_n=1+x+\\cdots+x^{n-1}$ に $x$ をかけると1つずつずれるので、ひくとまん中が全部消えて $(1-x)S_n=1-x^n$（7-10⑤）。$\\lvert x\\rvert<1$ なら、$n$ をふやすと $x^n$ は0に近づくので、合計は $\\dfrac{1}{1-x}$ に近づく（等比級数）。',
    caution: '$\\dfrac{1}{1-x}$ が使えるのは $\\lvert x\\rvert<1$ のときだけ（$1+2+4+\\cdots$ は $-1$ ではない）。はじめの数が1でないときは、はじめの数でくくり出してから使う。$n$ 個の和の右肩は $n$（最後の項の右肩 $n-1$ ではない）。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '20mm', s3: '22mm', trap: '24mm' }, boxh: { s3: '11mm' },
    fits(q) {
      if (/\\begin\{pmatrix\}|行列/.test(q)) return false;
      if (/毎朝/.test(q) && /日め/.test(q)) return true;
      return maths(q).some(seg => { const g = geom(seg); return !!g && (!g.inf || Math.abs(g.r) < 1); });
    },
    steps: {
      // ならべた和と、限りなくたした和
      s1(r) {
        if (turn(r, '79s1', 2) === 0) {
          const x = r.pick([0.1, 0.2, 0.3, 0.4, -0.5, -0.2, 2, 3, -2, -3, 0.6]), n = r.pick([4, 5]);
          const ts = []; let t = fr(1); for (let k = 0; k < n; k++) { ts.push(t); t = F.mul(t, D(x)); }
          if (ts.some(f => decLen(f) > 4) || ts.map(fx).join("").length > 16) return null;   // 2列の欄に入る長さ
          const S = ts.reduce((s, f) => F.add(s, f), fr(0));
          return { q: `$${ts.map((f, k) => (k && f[0] > 0 ? '+' : '') + fx(f)).join('')}$`, a: `$${fx(S)}$`, key: `${x}|${n}|1`,
            easy: `$\\frac{1-${fxs(D(x))}^${n}}{1-${fxs(D(x))}}$`, easyCheck: 'last' };
        }
        const x = r.pick([0.1, 0.25, 0.4, 0.6, 0.75, 0.8, 0.9, -0.5, -0.2, 0.3, 0.2]), c = r.pick([1, 1, 2, 3, 5, 10]);
        if (x === 0.2 && c === 1) return null;   // 目印の例
        const ts = [fr(c), F.mul(fr(c), D(x)), F.mul(F.mul(fr(c), D(x)), D(x))];
        if (ts.some(f => decLen(f) > 3)) return null;
        const S = F.div(fr(c), F.sub(fr(1), D(x)));
        return { q: `$${ts.map((f, k) => (k && f[0] > 0 ? '+' : '') + fx(f)).join('')}+\\cdots$`, a: `$${fx(S)}$`, key: `${x}|i|${c}`, easyCheck: false,
          easy: `$${c === 1 ? '' : c + '\\times'}\\frac{1}{1-${fxs(D(x))}}$`, verify: p => { let s = 0, t = c; for (let k = 0; k < 2000; k++) { s += t; t *= x; } return near(nums(p.a)[0], s, 1e-9) || 'たした合計とちがう'; } };
      },
      // 右肩の数で書いた和（和の式を使う）
      s2(r) {
        const x = r.pick([2, 3, 4, -2, -3, 10, 0.1, 5]), m = r.int(4, 9);
        const S = F.div(F.sub(fr(1), F.make(...[Math.pow(D(x)[0], m + 1), Math.pow(D(x)[1], m + 1)])), F.sub(fr(1), D(x)));
        if (Math.abs(F.val(S)) > 1e6 || decLen(S) > 9) return null;
        const xs = fxs(D(x));
        return { q: `$1+${x < 0 ? `(${x})` : x}+${xs}^2+\\cdots+${xs}^{${m}}$`, a: `$${fx(S)}$`, key: `${x}|${m + 1}|1`, easyCheck: false,
          easy: `$\\frac{1-${xs}^{${m + 1}}}{1-${xs}}$`, verify: p => { let s = 0, t = 1; for (let k = 0; k <= m; k++) { s += t; t *= x; } return near(nums(p.a)[0], s, 1e-9) || 'たした合計とちがう'; } };
      },
      // 見かけがちがう：e の右肩・くり返す小数・植木鉢の4日め
      s3(r) {
        const kind = turn(r, '79s3', 3);
        if (kind === 0) {
          const a = r.pick([1, 2, 3, 0.5]), e1 = a === 1 ? 'e^{-1}' : `e^{-${a}}`, e2 = `e^{-${fmt(2 * a)}}`, e3 = `e^{-${fmt(3 * a)}}`;
          return { q: `$1+${e1}+${e2}+${e3}+\\cdots$（$e$ を残した形で）`, a: `$\\dfrac{1}{1-${e1}}$`, key: `e${a}`, easyCheck: false, easy: `比は $${e1}$（1より小さい）`,
            verify: p => { let s = 0; for (let k = 0; k < 400; k++) s += Math.exp(-a * k); return near(ev(strip(p.a)), s, 1e-9) || 'たした合計とちがう'; } };
        }
        if (kind === 1) {
          const two = r.chance(0.6), d = two ? r.int(1, 98) : r.int(1, 8);
          if (two && d % 11 === 0) return null;
          const x = two ? 0.01 : 0.1, a0 = D(two ? (d / 100).toFixed(2) : (d / 10).toFixed(1)), ts = [a0, F.mul(a0, D(x)), F.mul(F.mul(a0, D(x)), D(x))];
          const S = F.div(a0, F.sub(fr(1), D(x)));
          return { q: `$${ts.map((f, k) => (k ? '+' : '') + fx(f)).join('')}+\\cdots$ を分数で`, a: `$${F.tex(S)}$`, key: `d${d}|${x}`, easyCheck: false,
            easy: `$${fx(a0)}\\times\\frac{1}{1-${x}}=\\frac{${two ? d : d}}{${two ? 99 : 9}}$`, verify: p => near(ev(strip(p.a)), F.val(a0) / (1 - x), 1e-12) || 'たした合計とちがう' };
        }
        const x = r.pick([0.2, 0.4, 0.6, 0.8, 0.3, 0.1]), c = r.pick([10, 20, 50, 100, 30]);
        const ts = [fr(c)]; for (let k = 1; k < 4; k++) ts.push(F.mul(ts[k - 1], D(x)));
        const S = ts.reduce((s, f) => F.add(s, f), fr(0)); if (decLen(S) > 4) return null;
        return { q: `植木鉢に毎朝 ${U(c, 'mL')} の水をやり、土の水は1日で $${x}$ 倍になる。はじめの朝を1日めとして、4日め（水をやった直後）の量 ＝ $□\\,\\mathrm{mL}$`, a: `$${fx(S)}$`, key: `${x}|4|${c}`, easyCheck: false,
          easy: `$${c}\\,(1+${x}+${x}^2+${x}^3)=${c}\\times\\frac{1-${x}^4}{1-${x}}$`, verify: p => near(nums(p.a)[0], iter1(x, c, c, 3), 1e-9) || '1日ずつたどった量とちがう' };
      },
      // わな：比の大きさが1以上（落ち着かない。楽な形なし）
      trap(r) {
        const x = r.pick([2, 3, 1.5, -2, -3, 1.1]), ts = [fr(1)]; for (let k = 1; k < 4; k++) ts.push(F.mul(ts[k - 1], D(x)));
        const bad = F.div(fr(1), F.sub(fr(1), D(x)));
        return dest({ q: `$${ts.map((f, k) => (k && f[0] > 0 ? '+' : '') + fx(f)).join('')}+\\cdots$（限りなくたす）`, a: '落ち着かない', key: `t${x}`,
          verify: () => { let s = 0, t = 1; for (let k = 0; k < 60; k++) { s += t; t *= x; } return Math.abs(s) > 1e3 || '大きくなっていない'; } }, '7-79',
        `比が $${fx(D(x))}$ で、$\\lvert x\\rvert\\geqq1$。たすたびに${x < 0 ? 'ゆれながら' : ''}大きくなる（$\\frac{1}{1-${fxs(D(x))}}=${fx(bad)}$ は答えではない）`);
      },
    },
  });
  // ================================================================ 天気の移り方（7-80・7-81）
  // p・q は 10倍した整数：晴れ→晴れ が p/10、雨→晴れ が q/10。列が「今日の天気から」（どの列もたすと1）
  const W = ['晴れ', '雨'];
  const wM = (p, q) => [[D(p / 10), D(q / 10)], [D((10 - p) / 10), D((10 - q) / 10)]];
  const wMn = (p, q) => [[p / 10, q / 10], [(10 - p) / 10, (10 - q) / 10]];
  const wStep = (M, v) => [F.add(F.mul(M[0][0], v[0]), F.mul(M[0][1], v[1])), F.add(F.mul(M[1][0], v[0]), F.mul(M[1][1], v[1]))];
  const wAfter = (p, q, t, n) => { const M = wM(p, q); let v = t === 0 ? [fr(1), fr(0)] : [fr(0), fr(1)]; for (let k = 0; k < n; k++) v = wStep(M, v); return v; };
  const wWords = (p, q) => `晴れの次の日は晴れ ${p * 10}％・雨 ${100 - p * 10}％、雨の次の日は晴れ ${q * 10}％・雨 ${100 - q * 10}％`;
  const DAY = ['今日', '明日', 'あさって', '3日後'];
  // 確かめ：小数の行列を n 回かける（分数の計算とは別に）
  const wNum = (p, q, t, n) => { const M = wMn(p, q); let v = t === 0 ? [1, 0] : [0, 1]; for (let k = 0; k < n; k++) v = mv(M, v); return v; };
  // 図：晴れ・雨の丸と、移る確率をつけた矢印（自分にもどる矢印も。曲がった矢印は弧）
  function fig80(p, q) {
    const R = 1.1, A = [0, 0], B = [6, 0], P = v => fmt(v / 10);
    return { s: 4, items: [
      ['circle', A, R], ['circle', B, R], ['label', A, '晴れ', 'c'], ['label', B, '雨', 'c'],
      ['arc', [3, 2], 3.69, 229.4, 310.6, { arrow: true }], ['label', [3, -1.69], P(10 - p), 's'],   // 晴れ → 雨（下）
      ['arc', [3, -2], 3.69, 49.4, 130.6, { arrow: true }], ['label', [3, 1.69], P(q), 'n'],         // 雨 → 晴れ（上）
      ['arc', [-1.6, 0], 0.8, 40, 320, { arrow: true }], ['label', [-2.4, 0], P(p), 'w'],            // 晴れ → 晴れ
      ['arc', [7.6, 0], 0.8, 220, 500, { arrow: true }], ['label', [8.4, 0], P(10 - q), 'e'],        // 雨 → 雨
    ] };
  }
  const wPick = (r, bad) => { for (let k = 0; k < 30; k++) { const p = r.int(1, 9), q = r.int(1, 9); if (p !== q && !(bad && bad(p, q))) return [p, q]; } return null; };
  const ex80 = (p, q) => (p === 9 && q === 5);   // 楽な形の例（O-2）
  const dayOf = q => { const m = /(\d+)日後/.exec(q); return m ? +m[1] : /あさって/.test(q) ? 2 : /明日/.test(q) ? 1 : null; };

  // ================================================================ 7-80
  M.add({
    id: '7-80', part: 6, chap: '7-10② 例題3', stars: 1,
    title: '移り方の行列は「列が今日の天気からの移り方」（どの列もたすと1）：今日が晴れなら明日は1列め、雨なら2列め',
    mark: '晴れ・雨の移り方の確率、「明日・あさってに晴れる確率」。',
    futsu: ['今日が雨：明日の晴れは $0.5$、雨は $0.5$。', 'あさっての晴れは「晴れ→晴れ」「雨→晴れ」の', '2つの場合を、木の図でたどってたす'],
    raku: ['$M=\\begin{pmatrix}0.9&0.5\\\\0.1&0.5\\end{pmatrix}$、今日が雨 $(0,\\ 1)$', '明日は2列めを拾う：$(0.5,\\ 0.5)$', 'あさって $(0.45+0.25,\\ 0.05+0.25)=(0.7,\\ 0.3)$'],
    why: '晴れの確率を $a_n$、雨の確率を $b_n$ とすると、明日の晴れは「晴れ→晴れ」と「雨→晴れ」の2つの場合をたしたもの（$a_{n+1}=0.9a_n+0.5b_n$）。係数をならべた行列 $M$ の1列めが「晴れの日からの移り方」、2列めが「雨の日からの移り方」になる（7-10②）。今日が雨なら $(0,\\ 1)$ にかけるので、明日は2列めそのまま。あとは1日ごとに $M$ をかける。',
    caution: '「晴れの日からの移り方」を1行めに書かない（列に書く。どの列もたすと1で確かめる）。あさっては、明日の組に $M$ をもう1回かける（2列めの数を2乗しない）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '34mm' },
    fits(q) {
      if (/落ち着|固有/.test(q)) return false;
      if (/移り方の行列/.test(q) && /晴れ/.test(q) && !/日後|明日|あさって/.test(q)) return true;
      const n = dayOf(q); return /晴れ|雨/.test(q) && n != null && n <= 3;
    },
    steps: {
      // 行列から、明日・あさって
      s1(r) {
        const pq = wPick(r, ex80); if (!pq) return null;
        const [p, q] = pq, t = r.int(0, 1), n = r.int(1, 2), w = r.int(0, 1), v = wAfter(p, q, t, n);
        return { q: `$M=${pm(wMn(p, q))}$、今日が${W[t]}のとき、${DAY[n]}${W[w]}の確率`, a: `$${fx(v[w])}$`, key: `${p},${q}|${t}|${n}|${w}`,
          easy: n === 1 ? `${t + 1}列めを拾う` : `明日 $${tup(wAfter(p, q, t, 1))}$ に $M$ をかける`, easyCheck: false,
          verify: p0 => near(nums(p0.a)[0], wNum(p, q, t, n)[w], 1e-9) || 'たどった確率とちがう' };
      },
      // ことばから、行列とあさって・3日後
      s2(r) {
        const pq = wPick(r, ex80); if (!pq) return null;
        const [p, q] = pq;
        if (turn(r, '80s2', 2) === 0)
          return { q: `${wWords(p, q)}。移り方の行列 $M$（1列めが晴れの日から）`, a: `$${pm(wMn(p, q))}$`, key: `${p},${q}|M`, boxw: '24mm', boxh: '11mm', easyCheck: false,
            easy: `1列め $${pt(p / 10, (10 - p) / 10)}$、2列め $${pt(q / 10, (10 - q) / 10)}$`, calc: { kind: 'mat', want: wM(p, q) } };
        const t = r.int(0, 1), n = r.int(2, 3), v = wAfter(p, q, t, n);
        return { q: `${wWords(p, q)}。今日が${W[t]}のとき、${DAY[n]}に晴れる確率`, a: `$${fx(v[0])}$`, key: `${p},${q}|${t}|${n}|0`, easyCheck: false,
          easy: `$${tup(wAfter(p, q, t, 1))}$ → $${tup(wAfter(p, q, t, 2))}$${n === 3 ? ` → $${tup(v)}$` : ''}`, verify: p0 => near(nums(p0.a)[0], wNum(p, q, t, n)[0], 1e-9) || 'たどった確率とちがう' };
      },
      // 図から（矢印の数を読んで行列を作る）
      s3(r) {
        const pq = wPick(r, ex80); if (!pq) return null;
        const [p, q] = pq, t = r.int(0, 1), n = 2, w = r.int(0, 1), v = wAfter(p, q, t, n);
        return { q: `図は、ある町の天気の移り方（矢印の数は、次の日にその天気になる確率）。今日が${W[t]}のとき、あさって${W[w]}になる確率`, a: `$${fx(v[w])}$`, key: `${p},${q}|${t}|${n}|${w}`, fig: fig80(p, q), easyCheck: false,
          easy: `$M=${pm(wMn(p, q))}$、明日 $${tup(wAfter(p, q, t, 1))}$`, verify: p0 => near(nums(p0.a)[0], wNum(p, q, t, n)[w], 1e-9) || 'たどった確率とちがう' };
      },
      // わな：遠い日（固有ベクトルに分ける。7-82）
      trap(r) {
        const pq = wPick(r, (p, q) => ex80(p, q) || Math.abs(p - q) > 5); if (!pq) return null;
        const [p, q] = pq, t = r.int(0, 1), n = r.pick([10, 20]), l = D((p - q) / 10), s1 = F.div(fr(q), fr(10 - p + q));
        const c = t === 0 ? F.sub(fr(1), s1) : F.mul(s1, fr(-1));   // 晴れの確率 = s1 + c λ^n
        const lt = l[0] < 0 ? `(${fx(l)})` : fx(l), ct = F.tex([Math.abs(c[0]), c[1]]);
        return dest({ q: `${wWords(p, q)}。今日が${W[t]}のとき、${n}日後に晴れる確率（式で）`, a: `$${F.tex(s1)}${c[0] < 0 ? '-' : '+'}${ct}\\times${lt}^{${n}}$`, key: `t${p},${q}|${t}|${n}`, easyCheck: false,
          verify: p0 => near(ev(strip(p0.a)), wNum(p, q, t, n)[0], 1e-12) || 'たどった確率とちがう' }, '7-80',
        `${n}回かけるのはたいへん。固有値1の $${tup([s1, F.sub(fr(1), s1)])}$ と、固有値 $${fx(l)}$ の $(1,\\ -1)$ に分ける`, ['7-82']);
      },
    },
  });

  // ================================================================ 7-81
  const PAGES = ['A', 'B', 'C'];
  // 3つのページのリンク（自分以外へ。くり返すと1つの組に近づくものだけ。すべて同じ $\frac13$ になるものはのぞく）
  const LINKS = (() => {
    const out = [], oth = i => [0, 1, 2].filter(j => j !== i), sub = i => { const o = oth(i); return [[o[0]], [o[1]], o]; };
    for (const a of sub(0)) for (const b of sub(1)) for (const c of sub(2)) {
      const L = [a, b, c], Mn = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      L.forEach((l, i) => l.forEach(j => { Mn[j][i] = 1 / l.length; }));
      let ok = true, lim = null;
      for (const s of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { let v = s; for (let k = 0; k < 300; k++) v = mv(Mn, v); if (lim && !vnear(v, lim, 1e-9)) ok = false; lim = v; }
      if (!ok || lim.every(x => near(x, 1 / 3))) continue;
      // ほんとうの値（分数）：(M−I) の3行めを [1,1,1] にかえて解く
      const A = [0, 1, 2].map(i => [0, 1, 2].map(j => (i === 2 ? fr(1) : F.sub(fr(Mn[i][j] * 2, 2), fr(i === j ? 1 : 0)))));
      const Ai = Mt.inv(A); if (!Ai) continue;
      const v = Ai.map(r0 => r0[2]);
      out.push({ L, Mn, v });
    }
    return out;
  })();
  const linkWords = L => L.map((l, i) => `${PAGES[i]} は ${l.map(j => PAGES[j]).join(' と ')} へ`).join('、') + 'リンクしている';
  const ex81 = (p, q) => (p === 9 && q === 5) || (p === 8 && q === 4);   // 楽な形と目印の例（O-2）
  const statOf = (p, q) => { const s = F.div(fr(q), fr(10 - p + q)); return [s, F.sub(fr(1), s)]; };
  M.add({
    id: '7-81', part: 6, chap: '7-10②・7-11⑨ 例題3', stars: 1,
    title: '落ち着く先は固有値1の固有ベクトル：1行めの式1つと「たすと1」で決める',
    mark: '「落ち着く先」「長い目で見ると」、移り方の行列・リンクでつながったページの順位。',
    futsu: ['$(0.9,\\ 0.5)$ の行列を、今日の天気の組に', '何回もかけて表を作り、', '数がそろうまで続ける'],
    raku: ['$M=\\begin{pmatrix}0.9&0.5\\\\0.1&0.5\\end{pmatrix}$ の落ち着く先 $(a,\\ b)$', '1行め：$0.9a+0.5b=a$ → $a=5b$', '$a+b=1$ → 晴れ $\\frac56$、雨 $\\frac16$'],
    why: '落ち着いた組 $\\vec v$ は、$M$ をかけても変わらない：$M\\vec v=\\vec v$（固有値1の固有ベクトル。7-10②）。式は2つあるが、どの列もたすと1なので、2つめの式は1つめと同じことしか言わない。そこで1行めの式と「確率をたすと1」の2つで決める（7-8 の固有ベクトルの求め方と同じ）。',
    caution: '$M\\vec v=\\vec v$ の2つの式だけでは決まらない（同じ式になる）。「たすと1」を忘れない。落ち着く先は、今日の天気に関係しない。固有値1以外の固有ベクトルは、落ち着く先ではない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '32mm', s2: '22mm', s3: '40mm', trap: '22mm' }, boxh: { s1: '9mm', s3: '9mm' },
    fits(q) {
      if (!/落ち着|長い目/.test(q)) return false;
      if (/晴れ|リンク|置き場|移り方/.test(q)) return true;
      const A = mat2(q); return !!A && A[0].every((_, j) => near(A[0][j] + A[1][j], 1)) && A.flat().every(x => x >= 0);
    },
    steps: {
      s1(r) {
        const pq = wPick(r, ex81); if (!pq) return null;
        const [p, q] = pq, s = statOf(p, q);
        return { q: `天気の移り方の行列 $M=${pm(wMn(p, q))}$ の落ち着く先（晴れ、雨）`, a: `$${tup(s)}$`, key: `${p},${q}|s`, easyCheck: false,
          easy: `$${fmt(p / 10)}a+${fmt(q / 10)}b=a$、$a+b=1$`, verify: p0 => { const v = pairOf(p0.a); return (vnear(mv(wMn(p, q), v || [0, 0]), v || [9, 9]) && near(v[0] + v[1], 1)) || 'M をかけて変わらない組ではない'; } };
      },
      // ことばから（天気・置き場の自転車）
      s2(r) {
        const pq = wPick(r, ex81); if (!pq) return null;
        const [p, q] = pq, s = statOf(p, q);
        if (turn(r, '81s2', 2) === 0)
          return { q: `${wWords(p, q)}。長い目で見ると、晴れの日は全体のどれだけか（分数か小数で）`, a: `$${fx(s[0])}$`, key: `${p},${q}|s`, easyCheck: false,
            easy: `$${fmt(p / 10)}a+${fmt(q / 10)}b=a$、$a+b=1$`, verify: p0 => near(nums(p0.a)[0], wNum(p, q, 0, 400)[0], 1e-9) || '何回もかけた値とちがう' };
        // 置き場 A・B（1日で A の (10-p) 割が B へ、B の q 割が A へ）
        const tot =r.pick([100, 200, 300, 400, 500, 600, 1000]), nA = F.mul(s[0], fr(tot));
        if (!isInt(nA)) return null;
        return { q: `貸し自転車の置き場 A・B に、あわせて ${tot} 台ある。1日で、A の自転車の ${(10 - p) * 10}％が B へ、B の ${q * 10}％が A へ移る（ほかはそのまま）。落ち着いたときの A の台数 ＝ □ 台`, a: `$${fx(nA)}$`, key: `${p},${q}|s|${tot}`, easyCheck: false,
          easy: `$${fmt((10 - p) / 10)}a=${fmt(q / 10)}b$、$a+b=${tot}$`, verify: p0 => near(nums(p0.a)[0], wNum(p, q, 0, 400)[0] * tot, 1e-6) || '何回もかけた値とちがう' };
      },
      // 3つのページのリンク（ページランク）
      s3(r) {
        const g = r.pick(LINKS);
        return { q: `3つのページ A・B・C で、${linkWords(g.L)}。リンクを1つ選んで移ることをくり返すとき、A・B・C にいる確率の落ち着く先`, a: `$${tup(g.v)}$`, key: `L${JSON.stringify(g.L)}`, easyCheck: false,
          easy: `移り方の行列 $${pm(g.Mn)}$ で $M\\vec v=\\vec v$、たすと1`,
          verify: p0 => { const v = pairOf(p0.a); let w = [1 / 3, 1 / 3, 1 / 3]; for (let k = 0; k < 400; k++) w = mv(g.Mn, w); return vnear(v, w, 1e-9) || '何回もかけた値とちがう'; } };
      },
      // わな：固有値1でないほうの固有ベクトル（7-65）
      trap(r) {
        const pq = wPick(r, (p, q) => ex81(p, q) || p - q === 0); if (!pq) return null;
        const [p, q] = pq, l = (p - q) / 10;
        return dest({ q: `$M=${pm(wMn(p, q))}$ の、固有値 $${fmt(l)}$ の固有ベクトル`, a: '$(1,\\ -1)$', key: `t${p},${q}`,
          verify: p0 => { const v = pairOf(p0.a); return (!!v && v.some(x => x !== 0) && vnear(mv(wMn(p, q), v), v.map(x => x * l))) || 'M をかけて固有値倍にならない'; } }, '7-81',
        `固有値1ではないので、落ち着く先ではない。$(M${l < 0 ? '+' + fmt(-l) : '-' + fmt(l)}I)\\vec v=\\vec 0$ をとく`, ['7-65']);
      },
    },
  });

  // ================================================================ 7-82
  // 固有ベクトルがわかる行列：[行列, [λ1, v1], [λ2, v2]]
  const SYM = [[3, 1], [2, 0], [3, -1], [4, 0], [5, 1], [5, -1], [4, -2], [4, 2], [2, -2], [3, -3], [5, 3]]   // [λ1, λ2]：[[a,b],[b,a]]、a=(λ1+λ2)/2、b=(λ1−λ2)/2
    .map(([l1, l2]) => [[[(l1 + l2) / 2, (l1 - l2) / 2], [(l1 - l2) / 2, (l1 + l2) / 2]], [l1, [1, 1]], [l2, [1, -1]]]);
  const NONSYM = [
    [[[4, 1], [2, 3]], [5, [1, 1]], [2, [1, -2]]], [[[3, 1], [2, 2]], [4, [1, 1]], [1, [1, -2]]], [[[2, 2], [1, 3]], [4, [1, 1]], [1, [2, -1]]],
    [[[4, 2], [1, 3]], [5, [2, 1]], [2, [1, -1]]], [[[5, 2], [2, 2]], [6, [2, 1]], [1, [1, -2]]], [[[1, 1], [0, 2]], [2, [1, 1]], [1, [1, 0]]], [[[2, 0], [1, 1]], [2, [1, 1]], [1, [0, 1]]],
  ];
  // c1 v1 + c2 v2 の組を作って、A^n x0 を出す
  const powV = (A, x0, n) => { let v = x0.slice(); for (let k = 0; k < n; k++) v = mv(A, v); return v; };
  function gen82(r, list, opt) {
    for (let k = 0; k < 40; k++) {
      const [A, [l1, v1], [l2, v2]] = r.pick(list), c1 = r.pick([1, 2, 3, -1, 1]), c2 = r.pick([1, 2, -1, -2, 3]), n = r.int(3, 5);
      const x0 = [c1 * v1[0] + c2 * v2[0], c1 * v1[1] + c2 * v2[1]];
      if (x0.some(x => x === 0) && r.chance(0.7)) continue;
      const y = [0, 1].map(i => c1 * l1 ** n * v1[i] + c2 * l2 ** n * v2[i]);
      if (y.some(x => Math.abs(x) > 3000)) continue;
      if (A[0][0] === 2 && A[0][1] === 1 && A[1][0] === 1 && x0[0] === 3 && x0[1] === 1 && n === 4) continue;   // 楽な形の例（O-2）
      if (opt && opt.bad && opt.bad(A, x0, n)) continue;
      return { A, l1, v1, l2, v2, c1, c2, n, x0, y };
    }
    return null;
  }
  const vecT = v => `(${v.join(',\\ ')})`;
  const eigTxt = g => `$${vecT(g.v1)}$ を $${g.l1}$ 倍、$${vecT(g.v2)}$ を $${g.l2}$ 倍する`;
  M.add({
    id: '7-82', part: 6, chap: '7-10⑥ 例題4', stars: 1,
    title: '$A^n\\vec x_0$ は固有ベクトルに分けて、それぞれ $\\lambda^n$ 倍：$c_1\\lambda_1^n\\vec v_1+c_2\\lambda_2^n\\vec v_2$',
    mark: '同じ行列を何回もかけた $A^n\\vec x_0$（$n$ が3以上）と、固有ベクトルがわかる行列。',
    futsu: ['$A\\vec x_0=(7,\\ 5)$、$A^2\\vec x_0=(19,\\ 17)$、', '$A^3\\vec x_0=(55,\\ 53)$、…と', '1回ずつ行列×ベクトルをくり返す'],
    raku: ['$A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$、$(3,\\ 1)=2(1,\\ 1)+(1,\\ -1)$', '$A^4(3,\\ 1)=2\\times3^4(1,\\ 1)+1^4(1,\\ -1)$', '$=162(1,\\ 1)+(1,\\ -1)=(163,\\ 161)$'],
    why: '固有ベクトルの向きでは、$A^n\\vec v=\\lambda^n\\vec v$（1回ごとに $\\lambda$ 倍されるだけ。7-10⑥）。はじめの点を $\\vec x_0=c_1\\vec v_1+c_2\\vec v_2$ と分けると、分けてかけてからたしても同じなので（7-2）、$A^n\\vec x_0=c_1\\lambda_1^n\\vec v_1+c_2\\lambda_2^n\\vec v_2$。$c_1$・$c_2$ は、2つの式の連立方程式で決める。',
    caution: '$\\lambda^n$ をかけるのは、分けたそれぞれの部分（$c_1\\vec v_1$ と $c_2\\vec v_2$）。$\\vec x_0$ 全体を $\\lambda_1^n$ 倍しない。固有ベクトルが1本しかない行列（ずらしの行列など）では分けられない。',
    counts: { s1: 3, s2: 4, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '28mm', s2: '28mm', s3: '44mm', trap: '24mm' },
    fits(q) {
      if (!/\^\{?(\d+|n)\}?\\vec x_0|歩あと/.test(q)) return false;
      const A = mat2(q); if (!A) return false;
      const e = eig2(A); return Array.isArray(e) && !near(e[0], e[1]);
    },
    steps: {
      // 固有ベクトルと固有値を書いた問題
      s1(r) {
        const g = gen82(r, SYM.concat(NONSYM)); if (!g) return null;
        return { q: `$A=${pm(g.A)}$ は${eigTxt(g)}。$\\vec x_0=${vecT(g.x0)}$ のとき $A^${g.n}\\vec x_0$`, a: `$${vecT(g.y)}$`, key: `${g.A}|${g.x0}`, easyCheck: false,
          easy: `$\\vec x_0=${g.c1 === 1 ? '' : g.c1 === -1 ? '-' : g.c1}${vecT(g.v1)}${g.c2 < 0 ? '-' : '+'}${Math.abs(g.c2) === 1 ? '' : Math.abs(g.c2)}${vecT(g.v2)}$`,
          verify: p => vnear(pairOf(p.a), powV(g.A, g.x0, g.n)) || '1回ずつかけた値とちがう' };
      },
      // 固有ベクトルを自分で：対角が同じ対称な行列
      s2(r) {
        const g = gen82(r, SYM); if (!g) return null;
        return { q: `$A=${pm(g.A)}$、$\\vec x_0=${vecT(g.x0)}$ のとき、$A^${g.n}\\vec x_0$`, a: `$${vecT(g.y)}$`, key: `${g.A}|${g.x0}`, easyCheck: false,
          easy: `$(1,\\ 1)$ で $${g.l1}$ 倍、$(1,\\ -1)$ で $${g.l2}$ 倍。$c_1=${g.c1}$、$c_2=${g.c2}$`,
          verify: p => vnear(pairOf(p.a), powV(g.A, g.x0, g.n)) || '1回ずつかけた値とちがう' };
      },
      // 見かけがちがう：水そうのオイラー法を何歩も・n の式で
      s3(r) {
        if (turn(r, '82s3', 2) === 0) {
          const k = r.pick([0.1, 0.2, 0.05, 0.25]), h = r.pick([20, 10, 40]), n = r.int(3, 4), mu = 1 - 2 * k;
          const G = [[1 - k, k], [k, 1 - k]], y = powV(G, [h, 0], n), muN = F.make(...[Math.pow(D(mu)[0], n), Math.pow(D(mu)[1], n)]);
          const yl = F.add(fr(h / 2), F.mul(fr(h / 2), muN)), yr = F.sub(fr(h / 2), F.mul(fr(h / 2), muN));
          if (decLen(yl) > 4) return null;
          return { q: `水そうのオイラー法の1歩の行列 $G=${pm(G)}$ を、はじめの水位 $(${h},\\ 0)$（cm）に ${n} 回かけた、${n}歩あとの水位（左、右）`, a: `$${tup([yl, yr])}$`, key: `${G}|${h},0|${n}`, easyCheck: false,
            easy: `$(${h},\\ 0)=${h / 2}(1,\\ 1)+${h / 2}(1,\\ -1)$、差の向きは1歩で $${fmt(mu)}$ 倍`, verify: p => vnear(pairOf(p.a), y) || '1歩ずつ進めた水位とちがう' };
        }
        const g = gen82(r, SYM.filter(s => s[2][0] === 1 || s[2][0] === -1 || s[2][0] === 0)); if (!g) return null;
        // 項 c×λ^n（λ が1なら数だけ、−1 なら (−1)^n、0 なら書かない）
        const tm = (c, l) => { if (c === 0 || l === 0) return null; const b = l === 1 ? null : l === -1 ? '(-1)^n' : `${l}^n`, a = Math.abs(c); return [c < 0 ? -1 : 1, b ? (a === 1 ? b : `${a}\\times${b}`) : String(a)]; };
        const comp = i => { const ts = [tm(g.c1 * g.v1[i], g.l1), tm(g.c2 * g.v2[i], g.l2)].filter(Boolean); return ts.length ? ts.map(([sg, s], k) => (sg < 0 ? '-' : k ? '+' : '') + s).join('') : '0'; };
        return { q: `$A=${pm(g.A)}$、$\\vec x_0=${vecT(g.x0)}$ のとき、$A^n\\vec x_0$ を $n$ の式で`, a: `$(${comp(0)},\\ ${comp(1)})$`, key: `${g.A}|${g.x0}|n`, easyCheck: false, boxw: '50mm',
          easy: `$${g.c1}\\times${g.l1}^n(1,\\ 1)$ と $${g.c2}\\times${fxs(fr(g.l2))}^n(1,\\ -1)$ の和`,
          verify: p => { const t = strip(p.a).replace(/^\(|\)$/g, '').split(',\\ '); return [1, 2, 3, 4].every(n => vnear(t.map(c => ev(c, { n })), powV(g.A, g.x0, n))) || '式の値が、かけた値とちがう'; } };
      },
      // わな：固有ベクトルが1本（ずらしの行列。7-26）
      trap(r) {
        const k = r.pick([1, 2, 3, -1]), p0 = r.int(1, 5), q0 = r.int(1, 3), n = r.int(3, 5), A = [[1, k], [0, 1]];
        if (k === 1 && p0 === 3 && q0 === 1 && n === 4) return null;
        return dest({ q: `$A=${pm(A)}$、$\\vec x_0=(${p0},\\ ${q0})$ のとき、$A^${n}\\vec x_0$`, a: `$(${p0 + n * k * q0},\\ ${q0})$`, key: `t${k}|${p0},${q0}|${n}`, easyCheck: false,
          verify: p => vnear(pairOf(p.a), powV(A, [p0, q0], n)) || '1回ずつかけた値とちがう' }, '7-82',
        `固有値は1だけで、固有ベクトルは $(1,\\ 0)$ の1本。2本に分けられない。$A^${n}=${pm([[1, n * k], [0, 1]])}$`, ['7-26']);
      },
    },
  });
  // ================================================================ 行き先（7-83・7-84）
  // 確かめ：数で何回もかける。{ grow: 'ふえる'|'0に近づく'|'落ち着く'|'回る', dir: 正規化した向き }
  function fate(A, x0) {
    let v = x0.slice(), lg = 0;
    for (let k = 0; k < 600; k++) { v = mv(A, v); const n = Math.hypot(...v); if (n === 0) return { grow: '0に近づく', dir: null }; lg += Math.log(n); v = v.map(x => x / n); }
    const rate = lg / 600, w = mv(A, v), turnA = Math.acos(Math.max(-1, Math.min(1, Math.abs(w[0] * v[0] + w[1] * v[1]) / Math.hypot(...w))));
    return { grow: rate > 1e-3 ? 'ふえる' : rate < -1e-3 ? '0に近づく' : '落ち着く', dir: v, rot: turnA > 1e-6 };
  }
  const sameDir = (u, v) => !!u && Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-6 * Math.hypot(...v);
  const GROW3 = '（ふえる・0に近づく・落ち着く）';
  const cpx = (a, b) => `${a ? fmt(a) : ''}\\pm ${b === 1 ? '' : fmt(b)}j`;   // a±bj（0・1 は書かない）
  // √s を、外に出せるときは出した形（1.69 → 1.3、0.5 → \sqrt{0.5}）
  const sqrtDec = s => { const t = Math.round(Math.sqrt(s) * 1000) / 1000; return near(t * t, s, 1e-12) ? fmt(t) : `\\sqrt{${fmt(s)}}`; };
  const UZU = ['回り続ける', 'うずを巻いて原点へ', 'うずを巻いて広がる'];
  const UZUQ = '（回り続ける・うずを巻いて原点へ・うずを巻いて広がる）';
  const dirQ = (v1, v2) => `（$${vecT(v1)}$・$${vecT(v2)}$）の向きにそろって（ふえる・0に近づく）`;
  // 確かめ：答え「$(1,\ 1)$、ふえる」を、何回もかけた向きと大きさでくらべる
  function dirCheck(p, A, x0) {
    const f = fate(A, x0), v = pairOf(p.a.split('、')[0]), g = p.a.split('、')[1];
    return (sameDir(f.dir, v || [0, 0]) && f.grow === g && !f.rot) || `何回もかけると ${f.grow}（向き ${f.dir && f.dir.map(x => x.toFixed(3))}）`;
  }

  // ================================================================ 7-83
  const LAM83 = [-1.5, -1.2, -0.9, -0.6, -0.5, -0.3, 0.2, 0.4, 0.5, 0.6, 0.8, 0.9, 1.1, 1.2, 1.5, 2, 1, 1];
  M.add({
    id: '7-83', part: 6, chap: '7-10⑥ 例題5', stars: 1,
    title: '何回もかけたときの行き先は固有値の大きさで：全部1より小さければ0へ、いちばん大きい $\\lvert\\lambda\\rvert$ の固有ベクトルの向きにそろう',
    mark: '「何回もかけると、点はどうなるか」、固有値が実数の行列。',
    futsu: ['$B(1,\\ 0)=(0.6,\\ 0.2)$、$B^2(1,\\ 0)=(0.4,\\ 0.24)$、', '$(0.288,\\ 0.224)$、…と何回もかけて、', '点の動きを表にして見る'],
    raku: ['$B=\\begin{pmatrix}0.6&0.2\\\\0.2&0.6\\end{pmatrix}$：$(1,\\ 1)$ で0.8倍、$(1,\\ -1)$ で0.4倍', 'どちらも $\\lvert\\lambda\\rvert<1$ → 0に近づく', '大きいほう（0.8）の $(1,\\ 1)$ の向きにそろう'],
    why: '点を固有ベクトルに分けると、それぞれの部分は1回ごとに $\\lambda$ 倍される（7-82）。$\\lvert\\lambda\\rvert<1$ の部分は消え、$\\lvert\\lambda\\rvert>1$ の部分はふえる。2つの部分では $\\lvert\\lambda\\rvert$ の大きいほうが残るので（消え方がおそい・ふえ方が速い）、点はその固有ベクトルの向きにそろう（7-10⑥ の表）。$\\lambda=1$ と $\\lvert\\lambda\\rvert<1$ なら、$\\lambda=1$ の部分が残って落ち着く。',
    caution: '負の固有値でも、大きさが1より大きければふえる（$-1.2$ は消えない）。そろう向きを決めるのは、大きさ $\\lvert\\lambda\\rvert$ の大きいほう（$-0.9$ と $0.5$ なら $-0.9$ の向き）。固有値が複素数のときは、そろわずに回る。',
    counts: { s1: 4, s2: 3, s3: 1, trap: 2 },
    cols: 1, boxw: { s1: '20mm', s2: '30mm', s3: '30mm', trap: '50mm' },
    fits(q) {
      if (!/何回も/.test(q) || /j|R\(|回して|ばね|オイラー法/.test(q)) return false;
      if (/固有値は\s*\$-?[\d.]+\$\s*と|倍、/.test(q)) return true;
      const A = mat2(q); if (!A) return false;
      const e = eig2(A); return Array.isArray(e) && !near(Math.abs(e[0]), Math.abs(e[1]));
    },
    steps: {
      // 固有値がわかっているとき（3つの行き先）
      s1(r) {
        const l1 = r.pick(LAM83), l2 = r.pick(LAM83);
        if (Math.abs(l1) === Math.abs(l2) || (l1 === 0.8 && l2 === 0.4) || (l1 === 0.4 && l2 === 0.8)) return null;
        const B = [[(l1 + l2) / 2, (l1 - l2) / 2], [(l1 - l2) / 2, (l1 + l2) / 2]], g = fate(B, [1, 0]).grow, m = Math.max(Math.abs(l1), Math.abs(l2));
        return { q: `行列 $B$ は $(1,\\ 1)$ を $${fmt(l1)}$ 倍、$(1,\\ -1)$ を $${fmt(l2)}$ 倍する。$B$ を点 $(1,\\ 0)$ に何回もかけると${GROW3}`, a: m > 1 ? 'ふえる' : m < 1 ? '0に近づく' : '落ち着く', key: `${fmt(l1)},${fmt(l2)}`, easyCheck: false,
          easy: `大きさの大きいほうは $\\lvert${fmt(Math.abs(l1) > Math.abs(l2) ? l1 : l2)}\\rvert$`, verify: p => p.a === g || `何回もかけると ${g}` };
      },
      // 対角が同じ対称な行列：そろう向きと、ふえるか
      s2(r) {
        const a = r.int(-2, 12) / 10, b = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -2, -3, -4, -5]) / 10, l1 = +(a + b).toFixed(1), l2 = +(a - b).toFixed(1);
        if ([l1, l2].some(l => Math.abs(l) === 1 || l === 0) || Math.abs(l1) === Math.abs(l2) || (a === 0.6 && b === 0.2) || (a === 1.1 && b === 0.1)) return null;
        const B = [[a, b], [b, a]], big = Math.abs(l1) > Math.abs(l2) ? 0 : 1;
        return { q: `$B=${pm(B)}$ を点 $(1,\\ 0)$ に何回もかけると、${dirQ([1, 1], [1, -1])}`, a: `$${vecT(big ? [1, -1] : [1, 1])}$、${Math.max(Math.abs(l1), Math.abs(l2)) > 1 ? 'ふえる' : '0に近づく'}`, key: `${fmt(l1)},${fmt(l2)}`, easyCheck: false,
          easy: `$(1,\\ 1)$ で $${fmt(l1)}$ 倍、$(1,\\ -1)$ で $${fmt(l2)}$ 倍`, verify: p => dirCheck(p, B, [1, 0]) };
      },
      // 対称でない行列（固有ベクトルを書く）
      s3(r) {
        const [A, [l1, v1], [l2, v2]] = r.pick(NONSYM), s = r.pick([0.1, 0.2, 0.25, 0.5, 0.3]), L1 = +(l1 * s).toFixed(3), L2 = +(l2 * s).toFixed(3);
        if ([L1, L2].some(l => l === 1)) return null;
        const B = A.map(row => row.map(x => +(x * s).toFixed(3))), x0 = [v1[0] + v2[0], v1[1] + v2[1]], big = Math.abs(L1) > Math.abs(L2) ? v1 : v2;
        if (B.flat().some(x => decLen(D(x)) > 2)) return null;
        return { q: `$C=${pm(B)}$ の固有ベクトルは $${vecT(v1)}$（固有値 $${fmt(L1)}$）と $${vecT(v2)}$（固有値 $${fmt(L2)}$）。$C$ を点 $${vecT(x0)}$ に何回もかけると、${dirQ(v1, v2)}`,
          a: `$${vecT(big)}$、${Math.max(Math.abs(L1), Math.abs(L2)) > 1 ? 'ふえる' : '0に近づく'}`, key: `${fmt(L1)},${fmt(L2)}|${v1}|${v2}`, easyCheck: false,
          easy: `$\\lvert${fmt(L1)}\\rvert$ と $\\lvert${fmt(L2)}\\rvert$ の大きいほう`, verify: p => dirCheck(p, B, x0) };
      },
      // わな：固有値が複素数（回る。7-84）
      trap(r) {
        const [B, k] = r.pick([[[[0.6, -0.8], [0.8, 0.6]], 0], [[[0.8, -0.6], [0.6, 0.8]], 0], [[[0, -1], [1, 0]], 0], [[[0, -0.5], [0.5, 0]], 1], [[[0.3, -0.4], [0.4, 0.3]], 1], [[[1, -1], [1, 1]], 2], [[[0.5, -0.5], [0.5, 0.5]], 1], [[[1.2, -0.9], [0.9, 1.2]], 2]]);
        return dest({ q: `$B=${pm(B)}$ を点 $(1,\\ 0)$ に何回もかけると${UZUQ}`, a: UZU[k], key: `t${B}`, easyCheck: false,
          verify: p => { const f = fate(B, [1, 0]); return (f.rot && UZU[{ '落ち着く': 0, '0に近づく': 1, 'ふえる': 2 }[f.grow]] === p.a) || `何回もかけると ${f.grow}`; } }, '7-83',
        `固有値が複素数 $${cpx(B[0][0], B[1][0])}$ で、そろう向きがない。大きさ $${sqrtDec(+(B[0][0] ** 2 + B[1][0] ** 2).toFixed(6))}$ で決まる`, ['7-84']);
      },
    },
  });

  // ================================================================ 7-84
  const rotPow = (rr, th, n) => { const c = Math.cos(th * Math.PI / 180), s = Math.sin(th * Math.PI / 180); let A = [[1, 0], [0, 1]]; const B = [[rr * c, -rr * s], [rr * s, rr * c]]; for (let k = 0; k < n; k++) A = [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]]; return A; };
  M.add({
    id: '7-84', part: 6, chap: '7-10③⑦', stars: 1,
    title: '複素数の固有値の大きさは $\\sqrt{(\\text{実部})^2+(\\text{虚部})^2}$（たし算しない）。$rR(\\theta)$ は $n$ 回で $r^n$ 倍・$n\\theta$ 回る',
    mark: '$\\lvert1+0.1j\\rvert$、固有値 $a\\pm bj$、$0.9R(30^{\\circ})$ を何回も。',
    futsu: ['$0.9R(30^{\\circ})$ の成分 $0.779$ などを出して、', '点 $(1,\\ 0)$ に12回、行列×ベクトルを', 'くり返す'],
    raku: ['$\\lvert1+0.1j\\rvert=\\sqrt{1^2+0.1^2}=\\sqrt{1.01}$（1.1ではない）', '$\\bigl(0.9R(30^{\\circ})\\bigr)^{12}$：$12\\times30^{\\circ}=360^{\\circ}$', '→ $0.9^{12}R(360^{\\circ})=0.9^{12}I$'],
    why: '複素数の大きさは、複素数平面での原点からの距離なので、三平方の定理で求める（6-9）。$\\lambda=re^{j\\theta}$ を $n$ 回かけると、大きさは $r^n$、角は $n\\theta$（7-10⑦）。行列 $rR(\\theta)$ も同じで、1回ごとに $\\theta$ 回って $r$ 倍になるので、$n$ 回で $r^nR(n\\theta)$。行き先は大きさ $r$ で決まる：$r=1$ なら回り続け、$r<1$ ならうずを巻いて原点へ、$r>1$ ならうずを巻いて広がる。',
    caution: '$\\lvert a+bj\\rvert$ を $a+b$ にしない（$\\lvert1+0.1j\\rvert$ は1.1ではない）。$\\bigl(rR(\\theta)\\bigr)^n$ の $r$ も $n$ 乗する。$R(\\theta)$ の成分を1つずつ $n$ 乗しない（角を $n$ 倍する）。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '30mm', trap: '30mm' },
    fits(q) {
      if (/ばね|オイラー法|\\Delta t/.test(q)) return false;
      if (/\\lvert[^$]*j[^$]*\\rvert/.test(q) || /\\pm[\d.]*j/.test(q)) return true;
      if (/R\(\d+\^\{\\circ\}\)\\bigr\)\^|回して.*倍/.test(q)) return true;
      if (!/何回も|固有値の大きさ/.test(q)) return false;
      const A = mat2(q); return !!A && !Array.isArray(eig2(A));
    },
    steps: {
      // 複素数の大きさ
      s1(r) {
        const a = r.pick([1, 0.6, 0.8, 0.3, 0.4, 0.5, 1.2, 0.9, 1, 1]), b = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8]), sg = r.pick(['+', '-']), s = a * a + b * b;
        if (a === 1 && b === 0.1) return null;   // 楽な形の例
        if (turn(r, '84s1', 3) === 2)
          return { q: `固有値 $\\lambda=${fmt(a)}\\pm${fmt(b)}j$ の大きさ $\\lvert\\lambda\\rvert$`, a: `$${sqrtDec(s)}$`, key: `${a},${b}`, easyCheck: false,
            easy: `$\\sqrt{${fmt(a)}^2+${fmt(b)}^2}$`, verify: p => near(nums(p.a)[0], Math.hypot(a, b), 1e-12) || '大きさがちがう' };
        return { q: `$\\lvert${fmt(a)}${sg}${fmt(b)}j\\rvert$`, a: `$${sqrtDec(s)}$`, key: `${a},${b}`, easyCheck: false,
          easy: `$\\sqrt{${fmt(a)}^2+${fmt(b)}^2}=${sqrtDec(s)}$`, verify: p => near(nums(p.a)[0], Math.hypot(a, b), 1e-12) || '大きさがちがう' };
      },
      // rR(θ) の n 乗・回す行列の固有値の大きさ
      s2(r) {
        if (turn(r, '84s2', 3) < 2) {
          const rr = r.pick([0.9, 0.5, 0.8, 2, 0.6, 1.1]), th = r.pick([30, 45, 60, 90, 120, 180]), tot = r.pick([180, 360, 360]), n = tot / th;
          if (!Number.isInteger(n) || n < 2 || (rr === 0.9 && th === 30 && n === 12)) return null;
          const P = D(fmt(rr)), pw = F.make(Math.pow(P[0], n), Math.pow(P[1], n)), sgn = tot === 180 ? '-' : '';
          const cf = decLen(pw) <= 4 && Math.abs(F.val(pw)) < 1e4 ? fx(pw) : `${fmt(rr)}^{${n}}`;
          return { q: `$\\bigl(${fmt(rr)}R(${th}^{\\circ})\\bigr)^{${n}}$ を、$I$ を使って`, a: `$${sgn}${cf}I$`, key: `${rr}|${th}|${n}`, easyCheck: false, boxw: '22mm',
            easy: `$${n}\\times${th}^{\\circ}=${tot}^{\\circ}$、$${fmt(rr)}^{${n}}R(${tot}^{\\circ})$`,
            verify: p => { const c = ev(strip(p.a).replace(/I$/, '')), A = rotPow(rr, th, n); return (c != null && near(A[0][0], c, 1e-9) && near(A[1][1], c, 1e-9) && Math.abs(A[0][1]) < 1e-9 * Math.max(1, Math.abs(c))) || '何回もかけた行列とちがう'; } };
        }
        const a = r.pick([1, 0.6, 0.8, 0.5, 0.9, 1.2, 0.3]), b = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 0.1]), s = a * a + b * b;
        if (a === 1 && b === 0.1) return null;
        return { q: `$C=${pm([[a, -b], [b, a]])}$ の固有値の大きさ`, a: `$${sqrtDec(s)}$`, key: `${a},${b}`, easyCheck: false,
          easy: `固有値 $${fmt(a)}\\pm${fmt(b)}j$、$\\sqrt{${fmt(a)}^2+${fmt(b)}^2}$`, verify: p => { const e = eig2([[a, -b], [b, a]]); return near(nums(p.a)[0], Math.hypot(e.re, e.im), 1e-12) || '固有値の大きさがちがう'; } };
      },
      // 見かけがちがう：回して何倍かする点の行き先・うずの向き
      s3(r) {
        if (turn(r, '84s3', 2) === 0) {
          const a = r.pick([0.6, 0.8, 0, 0.3, 0.4, 0.5, 1, 0.9, 1.2]), b = r.pick([0.8, 0.6, 1, 0.4, 0.3, 0.5, 0.2]), s2 = +(a * a + b * b).toFixed(6), k = near(s2, 1) ? 0 : s2 < 1 ? 1 : 2;
          return { q: `$C=${pm([[a, -b], [b, a]])}$ を点 $(1,\\ 0)$ に何回もかけると${UZUQ}`, a: UZU[k], key: `${a},${b}`, easyCheck: false,
            easy: `固有値 $${fmt(a)}\\pm${fmt(b)}j$、大きさ $${sqrtDec(s2)}$`, verify: p => { const f = fate([[a, -b], [b, a]], [1, 0]); return (UZU[{ '落ち着く': 0, '0に近づく': 1, 'ふえる': 2 }[f.grow]] === p.a) || `何回もかけると ${f.grow}`; } };
        }
        const rr = r.pick([0.5, 2, 0.1, 0.2, 3]), th = r.pick([30, 45, 60, 90, 120]), tot = r.pick([90, 180, 360, 270]), n = tot / th, x = r.pick([1, 2, 3, 4, 5]);
        if (!Number.isInteger(n) || n < 2) return null;
        const P = D(fmt(rr)), pw = F.mul(F.make(Math.pow(P[0], n), Math.pow(P[1], n)), fr(x));
        if (decLen(pw) > 4 || F.val(pw) > 1e4) return null;
        const c = Math.round(Math.cos(tot * Math.PI / 180)), s = Math.round(Math.sin(tot * Math.PI / 180)), y = [F.mul(pw, fr(c)), F.mul(pw, fr(s))];
        return { q: `点を1回ごとに ${th}° 回して $${fmt(rr)}$ 倍する行列を、点 $(${x},\\ 0)$ に ${n} 回かけた点`, a: `$${tup(y)}$`, key: `${rr}|${th}|${n}|${x}`, easyCheck: false,
          easy: `$${n}\\times${th}^{\\circ}=${tot}^{\\circ}$、大きさ $${x}\\times${fmt(rr)}^{${n}}$`,
          verify: p => { const A = rotPow(rr, th, n); return vnear(pairOf(p.a), [A[0][0] * x, A[1][0] * x], 1e-9) || '何回もかけた点とちがう'; } };
      },
      // わな：固有値が実数（そろう。7-83）
      trap(r) {
        const l1 = r.pick([1.2, 0.5, 1.5, 0.8, 0.9, 2]), l2 = r.pick([0.5, 0.3, 1.1, 0.6, 0.4]); if (l1 === l2) return null;
        const B = [[l1, 0], [0, l2]], big = Math.abs(l1) > Math.abs(l2) ? [1, 0] : [0, 1];
        return dest({ q: `$B=${pm(B)}$ を点 $(1,\\ 1)$ に何回もかけると、${dirQ([1, 0], [0, 1])}`, a: `$${vecT(big)}$、${Math.max(l1, l2) > 1 ? 'ふえる' : '0に近づく'}`, key: `t${l1},${l2}`, easyCheck: false,
          verify: p => dirCheck(p, B, [1, 1]) }, '7-84',
        `固有値は実数の $${fmt(l1)}$ と $${fmt(l2)}$（回らない）。大きさの大きいほうの向きにそろう`, ['7-83']);
      },
    },
  });

  // ================================================================ 7-85
  const I2 = [[1, 0], [0, 1]];
  const step1 = (A, dt) => A.map((row, i) => row.map((x, j) => +((i === j ? 1 : 0) + x * dt).toFixed(6)));
  const tankA = k => [[-k, k], [k, -k]];
  const ex85 = (A, dt) => A[0][0] === -0.1 && A[0][1] === 0.1 && A[1][0] === 0.1 && dt === 2;   // 楽な形の例
  const eigPair = (p, want) => { const v = nums(p.a); return (v.length === 2 && ((near(v[0], want[0]) && near(v[1], want[1])) || (near(v[0], want[1]) && near(v[1], want[0])))) || `固有値は ${want.map(fmt).join('、')} のはず`; };
  const dotx = '\\dot{\\vec x}';
  M.add({
    id: '7-85', part: 6, chap: '7-10⑧ 例題6', stars: 1,
    title: 'オイラー法の1歩の行列は $I+A\\,\\Delta t$、その固有値は $1+\\lambda\\,\\Delta t$（1歩の行列から作り直さない）',
    mark: '$\\dot{\\vec x}=A\\vec x$ と $\\Delta t$、「1歩の行列」「その固有値」「2歩あと」。',
    futsu: ['1歩の行列（対角0.8、ほか0.2）から', '特性方程式 $(0.8-\\lambda)^2-0.04=0$ を', '作り直して、$\\lambda=1$、$0.6$ を出す'],
    raku: ['水そう $H=\\begin{pmatrix}-0.1&0.1\\\\0.1&-0.1\\end{pmatrix}$、$\\Delta t=2$', '$I+2H$：対角 $1-0.2=0.8$、ほか $0.2$', '$H$ の固有値 0・$-0.2$ → $1+0=1$、$1-0.4=0.6$'],
    why: 'オイラー法の1行「次＝今＋変わる速さ×$\\Delta t$」をベクトルで書くと、次は $\\vec x_n+A\\vec x_n\\,\\Delta t$ で、くくると $(I+A\\,\\Delta t)\\vec x_n$（7-10⑧）。$A$ の固有ベクトル $\\vec v$（固有値 $\\lambda$）にかけると、$\\vec v+\\lambda\\,\\Delta t\\,\\vec v$、つまり $(1+\\lambda\\,\\Delta t)\\vec v$ なので、固有ベクトルはそのままで、固有値は $1+\\lambda\\,\\Delta t$ になる。',
    caution: '$I$ を忘れない（$A\\,\\Delta t$ だけでは「変わる量」）。「$1+A\\,\\Delta t$」と書かない（数と行列はたせない）。1をたすのは対角の成分だけ。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '24mm', s2: '22mm', s3: '30mm', trap: '24mm' }, boxh: { s1: '11mm' },
    fits(q) {
      if (/こわれ|ゆれずに|ばね|ふくら|何倍|\\omega|ほんとう/.test(q)) return false;
      return /オイラー法|1歩の行列/.test(q) && /\\Delta t/.test(q);
    },
    steps: {
      // 1歩の行列を作る
      s1(r) {
        let A, dt;
        if (r.chance(0.5)) { const k = r.pick([0.1, 0.2, 0.05, 0.25, 0.5, 0.3]); A = tankA(k); dt = r.pick([0.5, 1, 2, 2.5, 4, 1.5]); }
        else { A = [[-r.int(1, 5) / 10, r.int(1, 4) / 10], [r.int(1, 4) / 10, -r.int(1, 5) / 10]]; dt = r.pick([0.5, 1, 2, 3]); }
        if (ex85(A, dt) || A[0][0] * dt <= -1) return null;   // 対角が0以下になる（ゆれる・こわれる）組は 7-86 で
        const G = step1(A, dt);
        if (G.flat().some(x => decLen(D(fmt(x))) > 3)) return null;
        return { q: `$${dotx}=${pm(A)}\\vec x$ の、$\\Delta t=${fmt(dt)}$ のオイラー法の1歩の行列`, a: `$${pm(G)}$`, key: `${A}|${dt}`, easyCheck: false,
          easy: `$I+${dt === 1 ? '' : fmt(dt)}A$（対角に1をたす）`, calc: { kind: 'mat', want: G.map(row => row.map(x => D(fmt(x)))) },
          verify: p => { const x = [0.37, -1.3], y = mv(M.readMat(p.a).map(rw => rw.map(c => c[0])), x), z = mv(A, x); return vnear(y, [x[0] + z[0] * dt, x[1] + z[1] * dt]) || 'オイラー法の1行とちがう'; } };
      },
      // 1歩の行列の固有値
      s2(r) {
        if (turn(r, '85s2', 2) === 0) {
          const l1 = r.pick([0, -0.1, -0.2, -0.05, -0.4]), l2 = r.pick([-0.5, -0.3, -1, -0.25, -0.6]), dt = r.pick([0.5, 1, 2, 4, 0.2]);
          if (l1 === l2) return null;
          const m = [1 + l1 * dt, 1 + l2 * dt].map(x => +x.toFixed(6));
          return { q: `$A$ の固有値が $${fmt(l1)}$ と $${fmt(l2)}$ のとき、$\\Delta t=${fmt(dt)}$ のオイラー法の1歩の行列の固有値`, a: `$${fmt(m[0])}$、$${fmt(m[1])}$`, key: `${l1},${l2}|${dt}`, easyCheck: false,
            easy: `$1+(${fmt(l1)})\\times${fmt(dt)}$、$1+(${fmt(l2)})\\times${fmt(dt)}$`,
            verify: p => { const B = step1([[l1, 0], [0, l2]], dt), e = eig2(B); return eigPair(p, e); } };
        }
        const k = r.pick([0.1, 0.2, 0.05, 0.25, 0.5]), dt = r.pick([0.5, 1, 2, 2.5, 4, 1.5]), A = tankA(k);
        if (ex85(A, dt)) return null;
        const m = 1 - 2 * k * dt;
        return { q: `水そう $${dotx}=${pm(A)}\\vec x$ を $\\Delta t=${fmt(dt)}$ のオイラー法で進めるときの、1歩の行列の固有値`, a: `$1$、$${fmt(+m.toFixed(6))}$`, key: `${A}|${dt}`, easyCheck: false,
          easy: `$A$ の固有値は $0$ と $${fmt(-2 * k)}$`, verify: p => eigPair(p, eig2(step1(A, dt))) };
      },
      // 見かけがちがう：はじめの水位から2歩・1歩
      s3(r) {
        const k = r.pick([0.1, 0.2, 0.05, 0.25]), dt = r.pick([1, 2, 0.5, 4, 2.5]), h = r.pick([20, 10, 30, 40]), n = r.int(1, 2), A = tankA(k);
        if (ex85(A, dt) || 2 * k * dt >= 2) return null;
        const G = step1(A, dt), y = powV(G, [h, 0], n);
        if (y.some(x => decLen(D(fmt(+x.toFixed(9)))) > 3)) return null;
        return { q: `水そう $${dotx}=${pm(A)}\\vec x$（水位 cm、時刻 分）を、はじめ $(${h},\\ 0)$ から $\\Delta t=${fmt(dt)}$ のオイラー法で${n}歩進めた水位`,
          a: `$${tup(y.map(x => fmt(+x.toFixed(9))))}$`, key: `${A}|${dt}|${h}|${n}`, easyCheck: false,
          easy: `1歩の行列 $${pm(G)}$`, verify: p => { let v = [h, 0]; for (let j = 0; j < n; j++) { const z = mv(A, v); v = [v[0] + z[0] * dt, v[1] + z[1] * dt]; } return vnear(pairOf(p.a), v) || 'オイラー法でたどった水位とちがう'; } };
      },
      // わな：ほんとうの水位の差（Δt で区切らない。楽な形なし）
      trap(r) {
        const k = r.pick([0.1, 0.2, 0.05, 0.25, 0.5]), h1 = r.pick([20, 30, 40, 16]), h2 = r.pick([0, 4, 10]), d0 = h1 - h2;
        return dest({ q: `水そう $\\frac{\\dd h_1}{\\dd t}=-${fmt(k)}\\,(h_1-h_2)$、$\\frac{\\dd h_2}{\\dd t}=${fmt(k)}\\,(h_1-h_2)$、はじめ $(${h1},\\ ${h2})$。オイラー法ではなく、ほんとうの水位の差 $h_1-h_2$ を $t$ の式で`, a: `$${d0}e^{-${2 * k === 1 ? '' : fmt(2 * k)}t}$`, key: `t${k}|${d0}`, boxw: '24mm',
          calc: { kind: 'ode', x: 't', coef: [1, 2 * k], rhs: '0', init: [[0, d0]] } }, '7-85',
        `$\\Delta t$ で区切らないので、1歩の行列は使わない。差 $d$ は $\\frac{\\dd d}{\\dd t}=-${2 * k === 1 ? '' : fmt(2 * k)}d$（6-14）`);
      },
    },
  });
  // ================================================================ 7-86
  // 確かめ：1歩の数 1+λΔt で 400 歩たどって、ゆれる・こわれるを見る（Δt の境を細かく変えてさがす）
  const walk = (lam, dt) => { let u = 1, sw = false, bad = false; for (let k = 0; k < 400; k++) { const w = u * (1 + lam * dt); if (Math.sign(w) * Math.sign(u) < 0) sw = true; u = w; if (Math.abs(u) > 1e6) { bad = true; break; } } return { sw, bad: bad || Math.abs(u) > 0.999 }; };
  function dtCheck(p, lam, kind) {   // kind 0：ゆれない（≦）、1：こわれない（<）
    const m = /\\Delta t(<|\\leqq)([\d.]+)/.exec(strip(p.a)); if (!m) return '答えの形がちがう';
    const b = +m[2], e = 1e-6 * b, e3 = 1e-3 * b, ok = kind === 0 ? (m[1] === '\\leqq' && !walk(lam, b - e).sw && !walk(lam, b).sw && walk(lam, b + e).sw) : (m[1] === '<' && !walk(lam, b - e3).bad && walk(lam, b + e3).bad);
    return ok || `境は ${kind === 0 ? 1 / -lam : 2 / -lam} のはず`;
  }
  const K86 = [0.2, 0.25, 0.5, 0.05, 0.02, 0.4, 1, 2, 0.04, 0.125, 0.01];
  const ODE86 = (k, Ta, v) => `$\\frac{\\dd ${v}}{\\dd t}=-${fmt(k)}\\,(${v}-${Ta})$`;
  M.add({
    id: '7-86', part: 6, chap: '7-10⑧ 例題7', stars: 1,
    title: 'こわれない条件 $\\lvert1+\\lambda\\,\\Delta t\\rvert<1$：$\\lambda$ が負の数なら、ゆれないのは $\\Delta t\\leqq\\dfrac{1}{\\lvert\\lambda\\rvert}$、こわれないのは $\\Delta t<\\dfrac{2}{\\lvert\\lambda\\rvert}$',
    mark: '冷める式・コンデンサーの式とオイラー法、「ゆれずに近づく $\\Delta t$」「こわれない $\\Delta t$」「1歩で何倍」。',
    futsu: ['$\\Delta t=5$、10、15、20、…と変えて、', '表計算で何歩も進め、', 'ゆれるか・こわれるかを見る'],
    raku: ['$\\frac{\\dd T}{\\dd t}=-0.1\\,(T-20)$：$\\lambda=-0.1$', 'ゆれない：$\\Delta t\\leqq\\dfrac{1}{0.1}=10$（分）', 'こわれない：$\\Delta t<\\dfrac{2}{0.1}=20$（分）'],
    why: '部屋との差 $u=T-20$ は $\\frac{\\dd u}{\\dd t}=\\lambda u$ で、オイラー法の1歩は $u_{n+1}=(1+\\lambda\\,\\Delta t)u_n$（$1\\times1$ の1歩の行列。7-10⑧）。$1+\\lambda\\,\\Delta t\\geqq0$ ならゆれずに近づき、$-1<1+\\lambda\\,\\Delta t$ ならこわれない（大きさが1より小さい。7-77）。$\\lambda<0$ なので、それぞれ $\\Delta t\\leqq\\dfrac{1}{\\lvert\\lambda\\rvert}$、$\\Delta t<\\dfrac{2}{\\lvert\\lambda\\rvert}$。',
    caution: '$\\lambda$ は「差」の式の係数（$-k\\,(T-20)$ なら $-k$）。$\\frac{10-V}{2}$ の形は $\\lambda=-\\frac12$。ゆれないのは「以下」（ちょうど $\\frac{1}{\\lvert\\lambda\\rvert}$ では1歩で目標に着く）、こわれないのは「より短い」。',
    counts: { s1: 3, s2: 3, s3: 3, trap: 2 },
    cols: 1, boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '24mm' },
    fits(q) {
      if (/ばね|j\$|j（|\\pm/.test(q)) return false;
      return /こわれない|ゆれずに|1歩で何倍/.test(q);
    },
    steps: {
      // λ がわかっているとき
      s1(r) {
        const k = r.pick(K86), kind = turn(r, '86s1', 2), b = kind === 0 ? 1 / k : 2 / k;
        if (k === 0.1) return null;
        return { q: `$\\frac{\\dd u}{\\dd t}=-${fmt(k)}u$ をオイラー法で進めるとき、${kind === 0 ? 'ゆれずに0に近づく' : 'こわれない'} $\\Delta t$ の範囲`, a: `$\\Delta t${kind === 0 ? '\\leqq' : '<'}${fmt(b)}$`, key: `${k}|${kind}`, easyCheck: false,
          easy: `1歩の数 $1-${fmt(k)}\\Delta t$ ${kind === 0 ? '$\\geqq0$' : '$>-1$'}`, verify: p => dtCheck(p, -k, kind) };
      },
      // 冷めるお湯の式から（ゆれない・こわれない・1歩で何倍）
      s2(r) {
        const k = r.pick([0.2, 0.25, 0.5, 0.05, 0.04, 0.125, 0.4]), Ta = r.pick([20, 25, 18, 22]), kind = turn(r, '86s2', 3);
        if (kind < 2) {
          const b = kind === 0 ? 1 / k : 2 / k;
          return { q: `お湯の温度が ${ODE86(k, Ta, 'T')}（$t$ は分）で冷める。オイラー法で${kind === 0 ? 'ゆれずに近づく' : 'こわれない'} $\\Delta t$（分）の範囲`, a: `$\\Delta t${kind === 0 ? '\\leqq' : '<'}${fmt(b)}$`, key: `${k}|${kind}`, easyCheck: false,
            easy: `$\\lambda=-${fmt(k)}$、1歩の数 $1-${fmt(k)}\\Delta t$`, verify: p => dtCheck(p, -k, kind) };
        }
        const dt = r.pick([1, 2, 5, 10, 15, 20, 7.5, 3, 4]), m = +(1 - k * dt).toFixed(6);
        if (Math.abs(m) >= 1.5 || decLen(D(fmt(m))) > 3 || m === 0) return null;
        return { q: `お湯の温度が ${ODE86(k, Ta, 'T')}（$t$ は分）で冷める。$\\Delta t=${fmt(dt)}$ 分のオイラー法では、部屋の温度との差は1歩で何倍`, a: `$${fmt(m)}$`, key: `${k}|${dt}`, easyCheck: false, boxw: '14mm',
          easy: `$1-${fmt(k)}\\times${fmt(dt)}$`, verify: p => { const T1 = 50 + (-k * (50 - Ta)) * dt; return near(nums(p.a)[0], (T1 - Ta) / (50 - Ta), 1e-9) || '1歩進めた差の倍率とちがう'; } };
      },
      // 見かけがちがう：コンデンサー・水そうの水位の差
      s3(r) {
        const kind = turn(r, '86s3', 2), which = r.int(0, 1);
        if (kind === 0) {
          const E = r.pick([5, 10, 12, 6]), tau = r.pick([2, 4, 0.5, 5, 10, 0.2]), b = which === 0 ? tau : 2 * tau;
          return { q: `コンデンサーの電圧が $\\frac{\\dd V}{\\dd t}=\\frac{${E}-V}{${fmt(tau)}}$（$t$ は秒）で変わる。オイラー法で${which === 0 ? 'ゆれずに近づく' : 'こわれない'} $\\Delta t$（秒）の範囲`, a: `$\\Delta t${which === 0 ? '\\leqq' : '<'}${fmt(b)}$`, key: `${fmt(1 / tau)}|${which}`, easyCheck: false,
            easy: `目標との差は $\\lambda=-\\frac{1}{${fmt(tau)}}$`, verify: p => dtCheck(p, -1 / tau, which) };
        }
        const k = r.pick([0.1, 0.05, 0.25, 0.5, 0.2]), b = which === 0 ? 1 / (2 * k) : 1 / k;
        return { q: `水そう $\\frac{\\dd h_1}{\\dd t}=-${fmt(k)}\\,(h_1-h_2)$、$\\frac{\\dd h_2}{\\dd t}=${fmt(k)}\\,(h_1-h_2)$（$t$ は分）をオイラー法で進めるとき、水位の差が${which === 0 ? 'ゆれずに0に近づく' : 'こわれない'} $\\Delta t$ の範囲`,
          a: `$\\Delta t${which === 0 ? '\\leqq' : '<'}${fmt(b)}$`, key: `${fmt(2 * k)}|${which}`, easyCheck: false,
          easy: `差の向きの固有値 $\\lambda=-${fmt(2 * k)}$`, verify: p => dtCheck(p, -2 * k, which) };
      },
      // わな：固有値が複素数（楽な形なし）
      trap(r) {
        const [a, b] = r.pick([[1, 1], [1, 2], [2, 1], [0.4, 0.3], [3, 4], [0.5, 0.5], [2, 2], [1, 3], [0.3, 0.4]]), bd = 2 * a / (a * a + b * b);
        return dest({ q: `$\\dot{\\vec x}=A\\vec x$ の $A$ の固有値が $-${cpx(a, b)}$ のとき、オイラー法でこわれない $\\Delta t$ の範囲`, a: `$0<\\Delta t<${fmt(bd)}$`, key: `t${a},${b}`, easyCheck: false,
          verify: p => { const m = /<([\d.]+)\$?$/.exec(strip(p.a)), B = m && +m[1], g = dt => Math.hypot(1 - a * dt, b * dt); return (B != null && g(B * 0.999) < 1 && g(B * 1.001) > 1) || 'こわれない境がちがう'; } }, '7-86',
        `$\\lambda$ が複素数なので、$\\frac{2}{\\lvert\\lambda\\rvert}$ ではない。$\\lvert1+\\lambda\\,\\Delta t\\rvert^2=(1-${a === 1 ? '' : fmt(a)}\\Delta t)^2+(${b === 1 ? '' : fmt(b)}\\Delta t)^2<1$ をとく`);
      },
    },
  });

  // ================================================================ 7-87
  // ωΔt（0.2 は楽な形の例なのでのぞく）
  function genWD(r) {
    for (let k = 0; k < 30; k++) {
      const w = r.pick([1, 2, 3, 4, 5, 10]), dt = r.pick([0.1, 0.05, 0.02, 0.01, 0.2]), z = +(w * dt).toFixed(6);
      if (z === 0.2 || z > 0.5 || decLen(D(fmt(z * z))) > 4) continue;
      return { w, dt, z };
    }
    return null;
  }
  const eulerG = (w, dt) => [[1, dt], [-w * w * dt, 1]];
  const sympG = (w, dt) => [[+(1 - w * w * dt * dt).toFixed(8), dt], [+(-w * w * dt).toFixed(8), 1]];
  M.add({
    id: '7-87', part: 6, chap: '7-10⑨ 例題8・9', stars: 1,
    title: 'ばねのふつうのオイラー法は1歩で $\\sqrt{1+(\\omega\\Delta t)^2}$ 倍。速度を先に進めると行列式1で、大きさ1',
    mark: 'ばね（$\\omega$）をオイラー法で進める、$\\Delta t$、「1歩の行列の固有値の大きさ」「行列式」。',
    futsu: ['$x$・$v$ の表を、$x_{n+1}=x_n+v_n\\Delta t$、', '$v_{n+1}=v_n-\\omega^2x_n\\Delta t$ で何行も作り、', '1周したときの半径をはかる'],
    raku: ['$\\omega=2$、$\\Delta t=0.1$：$A$ の固有値 $\\pm2j$', '1歩の行列の固有値 $1\\pm0.2j$', '大きさ $\\sqrt{1+0.04}=\\sqrt{1.04}$（1より大きい → ふくらむ）'],
    why: '位置と速度の組の行列 $A$ の固有値は $\\pm j\\omega$（7-10⑨）。ふつうのオイラー法の1歩の行列（1行め $(1,\\ \\Delta t)$、2行め $(-\\omega^2\\Delta t,\\ 1)$）の固有値は $1\\pm j\\omega\\Delta t$ で、大きさは $\\sqrt{1+(\\omega\\Delta t)^2}>1$。行列式も $1+(\\omega\\Delta t)^2$（面積の倍率）。速度を先に進めると、1歩の行列の左上が $1-(\\omega\\Delta t)^2$ になり、行列式はちょうど1、固有値の大きさも1（ふくらまない）。',
    caution: '大きさは $1+\\omega\\Delta t$ ではない（三平方の定理で $\\sqrt{1+(\\omega\\Delta t)^2}$）。$\\omega$ は $\\sqrt{\\frac km}$（$k$ そのものではない）。速度を先に進めた行列の左上は $1-(\\omega\\Delta t)^2$。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1, boxw: { s1: '20mm', s2: '30mm', s3: '20mm', trap: '20mm' }, boxh: { s2: '11mm' },
    fits(q) { return /ばね/.test(q) && /オイラー法/.test(q) && !/ダンパー/.test(q); },
    steps: {
      // 1歩の行列の固有値と大きさ
      s1(r) {
        const g = genWD(r); if (!g) return null;
        const kind = turn(r, '87s1', 2), s = +(1 + g.z * g.z).toFixed(8);
        if (kind === 0)
          return { q: `$\\omega=${g.w}$ のばねを、ふつうのオイラー法（$\\Delta t=${fmt(g.dt)}$）で進めるときの、1歩の行列の固有値`, a: `$1\\pm ${fmt(g.z)}j$`, key: `${g.w}|${g.dt}`, easyCheck: false,
            easy: `$1+\\lambda\\Delta t$、$\\lambda=\\pm${g.w}j$`, verify: p => { const m = /1\\pm ?([\d.]+)j/.exec(strip(p.a)), e = eig2(eulerG(g.w, g.dt)); return (m && near(e.re, 1) && near(e.im, +m[1])) || '固有値がちがう'; } };
        return { q: `$\\omega=${g.w}$ のばねを、ふつうのオイラー法（$\\Delta t=${fmt(g.dt)}$）で進めるとき、1歩でゆれが何倍にふくらむか（1歩の行列の固有値の大きさ）`, a: `$\\sqrt{${fmt(s)}}$`, key: `${g.w}|${g.dt}`, easyCheck: false,
          easy: `$\\lvert1\\pm ${fmt(g.z)}j\\rvert=\\sqrt{1+${fmt(g.z)}^2}$`, verify: p => { const e = eig2(eulerG(g.w, g.dt)); return near(nums(p.a)[0], Math.hypot(e.re, e.im), 1e-12) || '大きさがちがう'; } };
      },
      // 1歩の行列（ふつう・速度を先に）
      s2(r) {
        const g = genWD(r); if (!g) return null;
        const sym = turn(r, '87s2', 2) === 1, G = sym ? sympG(g.w, g.dt) : eulerG(g.w, g.dt);
        return { q: `$\\omega=${g.w}$ のばね（$\\dot x=v$、$\\dot v=-${g.w === 1 ? '' : g.w * g.w}x$）を、${sym ? '速度を先に進める' : 'ふつうの'}オイラー法（$\\Delta t=${fmt(g.dt)}$）で進めるときの、1歩の行列`, a: `$${pm(G)}$`, key: `${g.w}|${g.dt}|${sym}`, easyCheck: false,
          easy: sym ? `$v_{n+1}=v_n-${fmt(g.w * g.w * g.dt)}x_n$、$x_{n+1}=x_n+${fmt(g.dt)}v_{n+1}$。行列式は1` : `$x_{n+1}=x_n+${fmt(g.dt)}v_n$、$v_{n+1}=v_n-${fmt(g.w * g.w * g.dt)}x_n$`,
          calc: { kind: 'mat', want: G.map(row => row.map(x => D(fmt(x)))) },
          verify: p => { const B = M.readMat(p.a).map(rw => rw.map(c => c[0])); let x = 0.7, v = -0.3; if (sym) { v = v - g.w * g.w * x * g.dt; x = x + v * g.dt; } else { const x1 = x + v * g.dt; v = v - g.w * g.w * x * g.dt; x = x1; } return vnear(mv(B, [0.7, -0.3]), [x, v]) || '1歩の計算とちがう'; } };
      },
      // 見かけがちがう：質量とばね定数から・行列式（面積の倍率）
      s3(r) {
        const kind = turn(r, '87s3', 2);
        const [m, w] = r.pick([[1, 3], [2, 2], [0.5, 4], [1, 5], [4, 1], [0.25, 2], [1, 1], [2, 3], [0.5, 10]]), k = m * w * w, dt = r.pick([0.1, 0.05, 0.02]), z = +(w * dt).toFixed(6);
        if (z === 0.2 || z > 0.5) return null;
        const s = +(1 + z * z).toFixed(8);
        if (kind === 0)
          return { q: `$m=${fmt(m)}\\,\\mathrm{kg}$、$k=${fmt(k)}\\,\\mathrm{N/m}$ のばねを、ふつうのオイラー法（$\\Delta t=${fmt(dt)}$）で進めるとき、1歩でゆれが何倍にふくらむか`, a: `$\\sqrt{${fmt(s)}}$`, key: `${w}|${dt}`, easyCheck: false,
            easy: `$\\omega=\\sqrt{\\frac{${fmt(k)}}{${fmt(m)}}}=${w}$、$\\sqrt{1+${fmt(z)}^2}$`, verify: p => { const e = eig2(eulerG(Math.sqrt(k / m), dt)); return near(nums(p.a)[0], Math.hypot(e.re, e.im), 1e-12) || '大きさがちがう'; } };
        return { q: `$\\omega=${w}$ のばねを、ふつうのオイラー法（$\\Delta t=${fmt(dt)}$）で進めるとき、1歩の行列の行列式（ゆれの円の面積の倍率）`, a: `$${fmt(s)}$`, key: `${w}|${dt}`, easyCheck: false, boxw: '16mm',
          easy: `$1\\times1-${fmt(dt)}\\times(-${fmt(w * w * dt)})=1+${fmt(z)}^2$`, verify: p => { const G = eulerG(w, dt); return near(nums(p.a)[0], G[0][0] * G[1][1] - G[0][1] * G[1][0], 1e-12) || '行列式がちがう'; } };
      },
      // わな：ダンパーつき（固有値の実部がある。楽な形なし）
      trap(r) {
        const [al, L2] = r.pick([[0.4, 16], [0.5, 25], [0.2, 4], [1, 100], [0.5, 9], [0.3, 9], [0.2, 16]]), dt = r.pick([0.02, 0.05, 0.1, 0.01]);
        const v = +(1 - 2 * al * dt + L2 * dt * dt).toFixed(8);
        if (decLen(D(fmt(v))) > 4) return null;
        return dest({ q: `ダンパーつきのばねで、$A$ の固有値が $\\lambda=-${fmt(al)}\\pm bj$（$\\lvert\\lambda\\rvert^2=${L2}$）。ふつうのオイラー法（$\\Delta t=${fmt(dt)}$）の1歩の行列の固有値の大きさの2乗`, a: `$${fmt(v)}$`, key: `t${al},${L2}|${dt}`, easyCheck: false,
          verify: p => { const b = Math.sqrt(L2 - al * al); return near(nums(p.a)[0], (1 - al * dt) ** 2 + (b * dt) ** 2, 1e-9) || '大きさの2乗がちがう'; } }, '7-87',
        `実部 $-${fmt(al)}$ があるので $1+(\\omega\\Delta t)^2$ ではない。$(1-${fmt(al)}\\Delta t)^2+b^2\\Delta t^2=1-${fmt(2 * al)}\\Delta t+${L2}\\Delta t^2$`);
      },
    },
  });

  // ================================================================ 7-88
  // numpy の整数の配列の表示をまねる（はばのちがう数は、はばをそろえて右に寄せる）。ここではそろわない組をのぞくので、はばの同じものだけ
  const npVec = v => `[${v.join(' ')}]`;
  const npMat = A => `[${A.map(npVec).join(' ')}]`;
  const sameW = arr => new Set(arr.flat().map(x => String(x).length)).size === 1 && arr.flat().every(x => x >= 0);
  const pyArr = v => `np.array([${v.join(', ')}])`;
  const pyMat = A => `np.array([${A.map(rw => `[${rw.join(', ')}]`).join(', ')}])`;
  // 確かめ：プログラムを1行ずつまねる（for と print だけ）
  function runPy(code) {
    const env = {}, out = [], lines = code.split('\n');
    const val = e => { e = e.trim(); let m;
      if ((m = /^np\.array\((.*)\)$/.exec(e))) return JSON.parse(m[1]);
      if ((m = /^(\w+) @ (\w+)$/.exec(e))) { const A = env[m[1]], x = env[m[2]]; return Array.isArray(x[0]) ? A.map(rw => x[0].map((_, j) => rw.reduce((s, a, k) => s + a * x[k][j], 0))) : A.map(rw => rw.reduce((s, a, k) => s + a * x[k], 0)); }
      if ((m = /^(\w+) \* (\w+)$/.exec(e))) { const A = env[m[1]], B = env[m[2]]; return A.map((rw, i) => rw.map((a, j) => a * B[i][j])); }
      return env[e]; };
    const exec = (ls) => { for (let i = 0; i < ls.length; i++) { const l = ls[i]; let m;
      if ((m = /^for \w+ in range\((\d+)\):$/.exec(l))) { const body = []; while (i + 1 < ls.length && /^    /.test(ls[i + 1])) body.push(ls[++i].slice(4)); for (let k = 0; k < +m[1]; k++) exec(body); }
      else if ((m = /^print\((.*)\)$/.exec(l))) { const v = val(m[1]); out.push(Array.isArray(v[0]) ? npMat(v) : npVec(v)); }
      else if ((m = /^(\w+) = (.*)$/.exec(l))) env[m[1]] = val(m[2]); } };
    exec(lines.filter(l => !/^import/.test(l)));
    return out;
  }
  const codeAns = p => (String(p.a).match(/`[^`]*`/g) || []).map(t => t.slice(1, -1));
  const ex88 = (A, x) => String(A) === '3,1,1,3' && String(x) === '1,0';   // 楽な形の例
  function gen88(r, n, opt) {
    for (let k = 0; k < 40; k++) {
      const A = [[r.int(0, 4), r.int(0, 3)], [r.int(0, 3), r.int(0, 4)]], x = r.pick([[1, 0], [0, 1], [1, 1], [1, 2], [2, 1]]);
      if (Mt.det(Mt.make(A))[0] === 0 || A.flat().filter(c => c !== 0).length < 3 || ex88(A, x) || (opt && opt.bad && opt.bad(A))) continue;
      const xs = []; let v = x; for (let j = 0; j < n; j++) { v = mv(A, v); xs.push(v); }
      if (!xs.every(u => sameW([u])) || xs[n - 1].some(c => c > 999)) continue;
      return { A, x, xs };
    }
    return null;
  }
  // 大きさのいちばん大きい固有値の向き（y÷x の行き先）がわかる行列
  const DOM88 = [[[[2, 1], [1, 2]], 1], [[[1, 2], [2, 1]], 1], [[[4, 1], [2, 3]], 1], [[[3, 1], [2, 2]], 1], [[[2, 2], [1, 3]], 1], [[[4, 2], [1, 3]], 0.5], [[[5, 2], [2, 2]], 0.5], [[[1, 1], [0, 2]], 1], [[[2, 0], [1, 1]], 1], [[[1, 2], [0, 3]], 1], [[[3, 2], [1, 4]], 1], [[[1, 0], [1, 2]], null], [[[3, 1], [0, 1]], 0], [[[1, 2], [2, 4]], 2], [[[4, 1], [1, 4]], 1], [[[2, 3], [3, 2]], 1]].filter(d => d[1] != null);
  M.add({
    id: '7-88', part: 6, chap: '7-10⑩ 例題10', stars: 1,
    title: 'Python のくり返し `x = A @ x` は1回ずつ行列×ベクトル。大きい固有値の向きにそろう',
    mark: 'numpy のプログラムの `x = A @ x` のくり返しと、表示される数。',
    futsu: ['プログラムを上から1行ずつ読み、', '$x$ の値を毎回書き出して、', '`print` のたびに表示を書く'],
    raku: ['`B=[[3,1],[1,3]]`、`x=[1,0]` で3回', '$(3,\\ 1)$ → $(10,\\ 6)$ → $(36,\\ 28)$（行列×ベクトル）', '固有値4の $(1,\\ 1)$ にそろう：$y\\div x$ は1へ'],
    why: '`A @ x` は行列×ベクトル（7-1⑨）で、`x = A @ x` は漸化式 $\\vec x_{n+1}=A\\vec x_n$（7-10⑩）。`for n in range(3):` の中は3回くり返す。`print(x)` は numpy の形（角かっこ、区切りは空白）で `[36 28]` のように表示する。何回もくり返すと、大きさのいちばん大きい固有値の固有ベクトルの向きにそろう（7-83）。',
    caution: '`A * x` は行列×ベクトルではない（同じ場所どうしのかけ算。7-15）。`range(3)` は3回（0、1、2）。`print` がくり返しの中にあれば毎回、外にあれば最後に1回だけ表示する。',
    counts: { s1: 4, s2: 3, s3: 1, trap: 2 },
    cols: 1, boxw: { s1: '20mm', s2: '14mm', s3: '44mm', trap: '30mm' },
    fits(q, p) { const t = q + ((p && p.code) || ''); return /np\.array/.test(t) && /@/.test(t); },
    steps: {
      // 1行のコードで（見わけようにも出る）
      s1(r) {
        const n = r.int(1, 3), g = gen88(r, n); if (!g) return null;
        return { q: `\`A = ${pyMat(g.A)}\`、\`x = ${pyArr(g.x)}\` のとき、\`x = A @ x\` を${n}回くり返したあとの \`print(x)\` の表示`, a: `\`${npVec(g.xs[n - 1])}\``, key: `${g.A}|${g.x}|${n}`, easyCheck: false,
          easy: g.xs.map(u => `$${vecT(u)}$`).join(' → '),
          verify: p => codeAns(p)[0] === runPy(`A = ${pyMat(g.A)}\nx = ${pyArr(g.x)}\nfor n in range(${n}):\n    x = A @ x\nprint(x)`)[0] || 'プログラムの表示とちがう' };
      },
      // 何回もくり返したときの y÷x
      s2(r) {
        const [A, lim] = r.pick(DOM88), x0 = r.pick([[1, 0], [0, 1], [1, 2], [2, 1], [1, 3]]);
        const f0 = fate(A, x0); if (ex88(A, x0) || !near(f0.dir[1] / f0.dir[0], lim, 1e-6) || near(x0[1] / x0[0], lim)) return null;   // はじめから固有ベクトルの向きの点・別の向きにそろう点はのぞく
        return { q: `\`A = ${pyMat(A)}\`、\`x = ${pyArr(x0)}\` で \`x = A @ x\` を何回もくり返すと、\`x\` の（2つめの数）÷（1つめの数）が近づく数`, a: `$${fmt(lim)}$`, key: `${A}|lim`, easyCheck: false,
          easy: (() => { const e = eig2(A); return `大きさのいちばん大きい固有値 $${fmt(+e[0].toFixed(6))}$ の固有ベクトルの向き`; })(),
          verify: p => { let v = x0.slice(); for (let k = 0; k < 200; k++) { v = mv(A, v); const n = Math.hypot(...v); v = v.map(c => c / n); } return near(nums(p.a)[0], v[1] / v[0], 1e-6) || 'くり返した比とちがう'; } };
      },
      // 何行かのプログラム（p.code）
      s3(r) {
        const n = r.int(2, 3), inside = turn(r, '88s3', 2) === 0, g = gen88(r, n); if (!g) return null;
        const code = `import numpy as np\nA = ${pyMat(g.A)}\nx = ${pyArr(g.x)}\nfor n in range(${n}):\n    x = A @ x\n${inside ? '    ' : ''}print(x)`;
        const shown = inside ? g.xs : [g.xs[n - 1]];
        return { q: `次のプログラムで表示される数（${inside ? '表示される順に全部' : '表示は1回'}）`, a: shown.map(u => `\`${npVec(u)}\``).join('、'), key: `${g.A}|${g.x}|${n}`, code, easyCheck: false,
          easy: `${inside ? 'print はくり返しの中（毎回）' : 'print はくり返しの外（最後に1回）'}。${g.xs.map(u => `$${vecT(u)}$`).join(' → ')}`,
          verify: p => { const want = runPy(code), got = codeAns(p); return (want.length === got.length && want.every((w, i) => w === got[i])) || `表示は ${want.join('、')} のはず`; } };
      },
      // わな：A * B（同じ場所どうし。7-15）
      trap(r) {
        for (let k = 0; k < 20; k++) {
          const A = [[r.int(1, 4), r.int(0, 3)], [r.int(0, 3), r.int(1, 4)]], B = [[r.int(0, 3), r.int(0, 2)], [r.int(1, 3), r.int(0, 2)]], C = A.map((rw, i) => rw.map((a, j) => a * B[i][j]));
          if (!sameW(C)) continue;
          return dest({ q: `\`A = ${pyMat(A)}\`、\`B = ${pyMat(B)}\` のとき、\`print(A * B)\` の表示`, a: `\`${npMat(C)}\``, key: `t${A}|${B}`, easyCheck: false,
            verify: p => codeAns(p)[0] === runPy(`A = ${pyMat(A)}\nB = ${pyMat(B)}\nprint(A * B)`)[0] || 'プログラムの表示とちがう' }, '7-88',
          '`*` は行列の積ではなく、同じ場所どうしのかけ算', ['7-15']);
        }
        return null;
      },
    },
  });
  // ================================================================ 7-89
  // 2本の腕（肩の角 θ1・ひじの角 θ2 は 0°・90°・180°・−90° だけ。値が正確に出る）
  const f2 = v => { if (Math.abs(v) < 1e-12) return '0'; const t = fmt(v), d = (t.split('.')[1] || '').length; return d >= 2 ? t : (+v).toFixed(2); };   // 長さ・J・位置は教科書と同じく小数第2位から（0.30、0.455）
  const cs = d => [Math.round(Math.cos(d * Math.PI / 180)), Math.round(Math.sin(d * Math.PI / 180))];
  function arm(L1, L2, t1, t2) {
    const [c1, s1] = cs(t1), [c12, s12] = cs(t1 + t2);
    return { J: [[-L1 * s1 - L2 * s12, -L2 * s12], [L1 * c1 + L2 * c12, L2 * c12]].map(rw => rw.map(x => +x.toFixed(6))), P: [L1 * c1 + L2 * c12, L1 * s1 + L2 * s12].map(x => +x.toFixed(6)) };
  }
  const pmJ = J => `\\begin{pmatrix}${J.map(rw => rw.map(f2).join('&')).join('\\\\')}\\end{pmatrix}`;
  const tupS = vs => `(${vs.join(',\\ ')})`;
  function gen89(r, opt) {
    for (let k = 0; k < 40; k++) {
      const L1 = r.pick([0.30, 0.20, 0.40, 0.25, 0.50]), L2 = r.pick([0.25, 0.20, 0.30, 0.10, 0.15]), t1 = r.pick([0, 90]), t2 = r.pick([90, -90]);
      const { J, P } = arm(L1, L2, t1, t2), dth = [r.pick([0.1, 0.02, -0.05, 0.05, -0.1, 0.2, 0.04, -0.02]), r.pick([0.1, 0.02, -0.05, 0.05, -0.1, 0.2, -0.04, 0.3])];
      const dp = mv(J, dth).map(x => +x.toFixed(6));
      if (dp.some(x => x === 0 || decLen(D(fmt(x))) > 3)) continue;
      if (L1 === 0.3 && L2 === 0.25 && t1 === 0 && t2 === 90 && dth[0] === 0.1 && dth[1] === 0.02) continue;   // 楽な形の例（O-2）
      return { L1, L2, t1, t2, J, P, dth, dp, det: +(J[0][0] * J[1][1] - J[0][1] * J[1][0]).toFixed(6) };
    }
    return null;
  }
  const dthCheck = (p, J, dp) => { const v = pairOf(p.a); return (!!v && vnear(mv(J, v), dp, 1e-9)) || '$J\\Delta\\vec\\theta$ が $\\Delta\\vec p$ にならない'; };
  const invT = g => `${g.det < 0 ? '-' : ''}\\frac{1}{${fmt(Math.abs(g.det))}}${pmJ([[g.J[1][1], -g.J[0][1]], [-g.J[1][0], g.J[0][0]]])}`;
  M.add({
    id: '7-89', part: 6, chap: '7-11②・7-5②', stars: 1,
    title: '逆運動学の1歩：$\\Delta\\vec\\theta=J^{-1}\\Delta\\vec p$（「目標－今の手」に、ヤコビ行列の逆行列をかける）',
    mark: '2本の腕、目標の位置・今の手の位置とヤコビ行列 $J$、「関節の角をどれだけ変えるか」。',
    futsu: ['$J\\Delta\\vec\\theta=\\Delta\\vec p$ を連立方程式', '$-0.25a-0.25b=-0.03$、$0.30a=0.03$ にして、', '1つずつ文字を消して解く'],
    raku: ['$J=\\begin{pmatrix}-0.25&-0.25\\\\0.30&0\\end{pmatrix}$、$\\det J=0.075$', '$J^{-1}=\\frac{1}{0.075}\\begin{pmatrix}0&0.25\\\\-0.30&-0.25\\end{pmatrix}$', 'ずれ $(-0.03,\\ 0.03)$ にかけて $(0.1,\\ 0.02)$ rad'],
    why: 'ヤコビ行列は「関節の角を少し変えると、手がどれだけ動くか」：$\\Delta\\vec p\\approx J\\Delta\\vec\\theta$（7-2・7-11②）。手を $\\Delta\\vec p$（目標－今の手）だけ動かしたいので、両辺に左から $J^{-1}$ をかけて $\\Delta\\vec\\theta=J^{-1}\\Delta\\vec p$（7-5）。2×2 の逆行列は、対角を入れかえ、ほかの2つの符号を変えて、$\\det J$ でわる。',
    caution: '$\\Delta\\vec p$ は「目標－今の手」（逆にひかない）。$J^{-1}$ は左からかける（$\\Delta\\vec p\\,J^{-1}$ ではない）。答えの角の単位は rad。$\\det J=0$（腕がのびきった姿勢）では $J^{-1}$ がない。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    fits(q) { return /J|ヤコビ/.test(q) && /\\Delta\\vec\\theta|\\dot\{\\vec\\theta\}|関節の角速度/.test(q); },
    steps: {
      s1(r) {
        const g = gen89(r); if (!g) return null;
        return { q: `$J=${pmJ(g.J)}$、$\\Delta\\vec p=${tupS(g.dp.map(f2))}$（m）のとき、$\\Delta\\vec\\theta=J^{-1}\\Delta\\vec p$（rad）`, a: `$${tupS(g.dth.map(fmt))}$`, key: `${g.J}|${g.dp}`, easyCheck: false,
          easy: `$\\det J=${fmt(g.det)}$、$J^{-1}=${invT(g)}$`, verify: p => dthCheck(p, g.J, g.dp) };
      },
      // 今の手と目標から
      s2(r) {
        const g = gen89(r); if (!g) return null;
        const tg = g.P.map((x, i) => +(x + g.dp[i]).toFixed(6));
        return { q: `$J=${pmJ(g.J)}$、今の手 $${tupS(g.P.map(f2))}$、目標 $${tupS(tg.map(f2))}$（m）。逆運動学の1歩の $\\Delta\\vec\\theta$（rad）`, a: `$${tupS(g.dth.map(fmt))}$`, key: `${g.J}|${g.dp}`, easyCheck: false,
          easy: `ずれ $\\Delta\\vec p=${tupS(g.dp.map(f2))}$、$\\det J=${fmt(g.det)}$`, verify: p => dthCheck(p, g.J, tg.map((x, i) => x - g.P[i])) };
      },
      // 見かけがちがう：逆行列が書いてある・手の速度から関節の角速度
      s3(r) {
        const g = gen89(r); if (!g) return null;
        if (turn(r, '89s3', 2) === 0)
          return { q: `腕の $J^{-1}=${invT(g)}$。手を $${tupS(g.dp.map(f2))}$（m）だけ動かす関節の角の変え方 $\\Delta\\vec\\theta$（rad）`, a: `$${tupS(g.dth.map(fmt))}$`, key: `${g.J}|${g.dp}`, easyCheck: false,
            easy: `$${g.det < 0 ? '-' : ''}\\frac{1}{${fmt(Math.abs(g.det))}}$ は最後にかける`, verify: p => dthCheck(p, g.J, g.dp) };
        return { q: `ヤコビ行列 $J=${pmJ(g.J)}$ の腕で、手の速度を $${tupS(g.dp.map(f2))}$（m/s）にしたい。関節の角速度 $\\dot{\\vec\\theta}$（rad/s）`, a: `$${tupS(g.dth.map(fmt))}$`, key: `${g.J}|${g.dp}`, easyCheck: false,
          easy: `$\\dot{\\vec\\theta}=J^{-1}\\dot{\\vec p}$、$\\det J=${fmt(g.det)}$`, verify: p => dthCheck(p, g.J, g.dp) };
      },
      // わな：今の角での手の位置（順運動学。7-55）
      trap(r) {
        const L1 = r.pick([0.30, 0.20, 0.40, 0.25]), L2 = r.pick([0.25, 0.20, 0.10, 0.15]), t1 = r.pick([0, 90, 180]), t2 = r.pick([90, -90, 0]), { P } = arm(L1, L2, t1, t2);
        return dest({ q: `肩からひじ $${f2(L1)}\\,\\mathrm{m}$、ひじから手 $${f2(L2)}\\,\\mathrm{m}$ の腕で、肩の角 $${t1}^{\\circ}$、ひじの角 $${t2}^{\\circ}$ のときの手の位置（m）`, a: `$${tupS(P.map(fmt))}$`, key: `t${L1},${L2}|${t1},${t2}`, easyCheck: false,
          verify: p => { const th1 = t1 * Math.PI / 180, th2 = t2 * Math.PI / 180; return vnear(pairOf(p.a), [L1 * Math.cos(th1) + L2 * Math.cos(th1 + th2), L1 * Math.sin(th1) + L2 * Math.sin(th1 + th2)], 1e-9) || '手の位置がちがう'; } }, '7-89',
        `目標がなく、角から手の位置を出すだけ（順運動学）。$J^{-1}$ はいらない`, ['7-55']);
      },
    },
  });

  // ================================================================ 7-90
  const Rs = [10, 5, 20, 2, 50, 100, 4];
  const Uo = v => `${fmt(v)}\\,\\Omega`;
  const netK = (R1, R2) => { const G1 = 1 / R1, G2 = 1 / R2; return [[G1 + G2, -G2], [-G2, G2]].map(rw => rw.map(x => +x.toFixed(9))); };
  // 確かめ：点ごとに「流しこむ電流＝出ていく電流」をオームの法則で（行列を使わずに）
  const netI = (R1, R2, V1, V2) => [V1 / R1 + (V1 - V2) / R2, (V2 - V1) / R2];
  const iAns = I => `$I_1=${fmt(+I[0].toFixed(9))}\\,\\mathrm{A}$、$I_2=${fmt(+I[1].toFixed(9))}\\,\\mathrm{A}$`;
  const iCheck = (p, R1, R2, V1, V2) => { const v = nums(p.a); return vnear(v, netI(R1, R2, V1, V2)) || '点ごとの電流のつりあいとちがう'; };
  function fig90(R1, R2) {
    return { s: 5, items: [
      ['seg', [0, 0], [8, 0], { thick: true }], ['label', [4, 0], '地面（電位0）', 's'],
      ...M.figResistor([2, 0], [2, 3]), ...M.figResistor([2, 3], [6, 3]),
      ['dot', [2, 3]], ['dot', [6, 3]], ['label', [2, 3], '1', 'nw'], ['label', [6, 3], '2', 'se'],
      ['label', [2, 1.5], `$${Uo(R1)}$`, 'e'], ['label', [4, 3.3], `$${Uo(R2)}$`, 'n'],
      ['seg', [2, 5], [2, 3.25], { arrow: true }], ['label', [2, 5], '$I_1$', 'n'],
      ['seg', [6, 5], [6, 3.25], { arrow: true }], ['label', [6, 5], '$I_2$', 'n'],
    ] };
  }
  const ex90 = (R1, R2, V1, V2) => V1 === 1 && V2 === 3;   // 楽な形の例の電位（O-2）
  M.add({
    id: '7-90', part: 6, chap: '7-11④・7-2', stars: 1,
    title: '抵抗の網は、ばねの網と同じ形の行列（対角 $2G$・$G$、ほか $-G$。$G=\\frac1R$）：電位を入れると、流しこむ電流が出る',
    mark: '地面と抵抗2本、点1・点2の電位 $V_1$・$V_2$ と、流しこむ電流 $I_1$・$I_2$。',
    futsu: ['点1から地面へ $\\frac{1}{10}$ A、点1から点2へ $\\frac{1-3}{10}$ A、', '点2から点1へ $\\frac{3-1}{10}$ A と、', '抵抗1本ずつオームの法則で考えてたす'],
    raku: ['$R=10\\,\\Omega$ → $G=0.1\\,\\mathrm{S}$、$\\begin{pmatrix}0.2&-0.1\\\\-0.1&0.1\\end{pmatrix}$', '$V_1=1\\,\\mathrm{V}$、$V_2=3\\,\\mathrm{V}$ にかけて', '$I_1=0.2-0.3=-0.1\\,\\mathrm{A}$、$I_2=-0.1+0.3=0.2\\,\\mathrm{A}$'],
    why: '流しこんだ電流は、つながった抵抗を通って出ていく（3-6）。点1からは地面へ $GV_1$、点2へ $G(V_1-V_2)$ なので $I_1=2GV_1-GV_2$。点2からは点1へ $G(V_2-V_1)$ なので $I_2=-GV_1+GV_2$。係数をならべると $\\begin{pmatrix}2G&-G\\\\-G&G\\end{pmatrix}$ で、ばねの網 $\\begin{pmatrix}2k&-k\\\\-k&k\\end{pmatrix}$ と同じ形（7-11④）。',
    caution: '$G$ は $\\frac1R$（$R$ そのものではない）。点1の対角は「点1につながる抵抗の $G$ の和」、ななめは「2つの点のあいだの $G$ に $-$ をつけたもの」。電流が負なら、外へ取り出していること。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '40mm', s2: '40mm', s3: '40mm', trap: '26mm' }, boxh: { trap: '11mm' },
    fits(q) { return /図の網/.test(q) || /抵抗|ばね/.test(q) && /地面|かべ/.test(q) && /点1/.test(q) && !/箱/.test(q); },
    steps: {
      s1(r) {
        const R = r.pick(Rs), V1 = r.int(1, 12), V2 = r.int(1, 12);
        if (V1 === V2 || ex90(R, R, V1, V2)) return null;
        return { q: `地面と点1、点1と点2のあいだに $${Uo(R)}$ の抵抗。点1の電位 ${U(V1, 'V')}、点2の電位 ${U(V2, 'V')} のとき、外から流しこむ電流 $I_1$・$I_2$`, a: iAns(netI(R, R, V1, V2)), key: `${R},${R}|${V1},${V2}`, easyCheck: false,
          easy: `$G=${fmt(1 / R)}$、$${pm(netK(R, R))}${colv([V1, V2])}$`, verify: p => iCheck(p, R, R, V1, V2) };
      },
      // 行列を作る・抵抗が2種類
      s2(r) {
        const R1 = r.pick(Rs), R2 = r.pick(Rs);
        if (turn(r, '90s2', 2) === 0)
          return { q: `地面と点1のあいだに $${Uo(R1)}$、点1と点2のあいだに $${Uo(R2)}$ の抵抗。電位 $(V_1,\\ V_2)$ から流しこむ電流 $(I_1,\\ I_2)$ を出す行列`, a: `$${pm(netK(R1, R2))}$`, key: `${R1},${R2}|K`, boxh: '11mm', easyCheck: false,
            easy: `$G_1=${fmt(1 / R1)}$、$G_2=${fmt(1 / R2)}$。対角 $G_1+G_2$・$G_2$`, calc: { kind: 'mat', want: netK(R1, R2).map(rw => rw.map(x => D(fmt(x)))) },
            verify: p => { const K = M.readMat(p.a).map(rw => rw.map(c => c[0])); return vnear(mv(K, [1.3, -0.7]), netI(R1, R2, 1.3, -0.7)) || '電流のつりあいとちがう'; } };
        const V1 = r.int(1, 12), V2 = r.int(1, 12); if (V1 === V2 || R1 === R2 || ex90(R1, R2, V1, V2)) return null;
        return { q: `地面と点1のあいだに $${Uo(R1)}$、点1と点2のあいだに $${Uo(R2)}$ の抵抗。点1の電位 ${U(V1, 'V')}、点2の電位 ${U(V2, 'V')} のとき、流しこむ電流 $I_1$・$I_2$`, a: iAns(netI(R1, R2, V1, V2)), key: `${R1},${R2}|${V1},${V2}`, easyCheck: false,
          easy: `$${pm(netK(R1, R2))}${colv([V1, V2])}$`, verify: p => iCheck(p, R1, R2, V1, V2) };
      },
      // 見かけがちがう：図の網・ばねの網
      s3(r) {
        if (turn(r, '90s3', 2) === 0) {
          const R1 = r.pick(Rs), R2 = r.pick(Rs), V1 = r.int(1, 12), V2 = r.int(1, 12);
          if (V1 === V2 || ex90(R1, R2, V1, V2)) return null;
          return { q: `図の網で、点1の電位 ${U(V1, 'V')}、点2の電位 ${U(V2, 'V')}（地面は0）のとき、外から流しこむ電流 $I_1$・$I_2$`, a: iAns(netI(R1, R2, V1, V2)), key: `${R1},${R2}|${V1},${V2}`, fig: fig90(R1, R2), easyCheck: false,
            easy: `$${pm(netK(R1, R2))}${colv([V1, V2])}$`, verify: p => iCheck(p, R1, R2, V1, V2) };
        }
        const k = r.pick([100, 200, 50, 400]), u1 = r.pick([0.01, 0.02, 0.03, 0.05]), u2 = r.pick([0.01, 0.02, 0.04, 0.05, -0.01]);
        if (u1 === u2) return null;
        const F = [2 * k * u1 - k * u2, -k * u1 + k * u2].map(x => +x.toFixed(9));
        return { q: `かべと点1、点1と点2のあいだに、ばね定数 ${U(k, 'N/m')} のばね。点1のずれ ${U(fmt(u1), 'm')}、点2のずれ ${U(fmt(u2), 'm')} のとき、点1・点2にかける力 $F_1$・$F_2$`, a: `$F_1=${fmt(F[0])}\\,\\mathrm{N}$、$F_2=${fmt(F[1])}\\,\\mathrm{N}$`, key: `k${k}|${u1},${u2}`, easyCheck: false,
          easy: `$${pm([[2 * k, -k], [-k, k]])}${colv([u1, u2])}$`, verify: p => vnear(nums(p.a), [k * u1 + k * (u1 - u2), k * (u2 - u1)]) || 'ばねの力のつりあいとちがう' };
      },
      // わな：直列の箱と並列の箱をつなぐ（四端子定数。7-27）
      trap(r) {
        const R = r.pick([2, 4, 6, 10, 5]), R2 = r.pick([2, 4, 5, 10]), A = [[1, R], [0, 1]], B = [[1, 0], [1 / R2, 1]], C = [[1 + R / R2, R], [1 / R2, 1]].map(rw => rw.map(x => +x.toFixed(9)));
        return dest({ q: `直列の抵抗 $${Uo(R)}$ の箱のあとに、並列の抵抗 $${Uo(R2)}$ の箱をつないだ回路の行列（四端子定数。入口側の箱を左に書く）`, a: `$${pm(C)}$`, key: `t${R},${R2}`, easyCheck: false,
          calc: { kind: 'mat', want: C.map(rw => rw.map(x => D(fmt(x)))) }, verify: p => { const K = M.readMat(p.a).map(rw => rw.map(c => c[0])); const AB = A.map(rw => [0, 1].map(j => rw[0] * B[0][j] + rw[1] * B[1][j])); return vnear(K.flat(), AB.flat()) || '箱の行列の積とちがう'; } }, '7-90',
        `地面と点の網ではなく、入口と出口の箱をつなぐ形。$${pm(A)}${pm([[1, 0], [1 / R2, 1]])}$`, ['7-27']);
      },
    },
  });

  // ================================================================ 7-99
  // x_{n+1}=a x_n + b x_{n-1}：大きいほうの固有値 (a+√(a²+4b))/2 の TeX
  function bigRoot(a, b) {
    const Dd = a * a + 4 * b; let k = 1, m = Dd;
    for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; }
    if (m === 1) { const v = F.make(a + k, 2); return fx(v); }
    const sq = `${k === 1 ? '' : k}\\sqrt{${m}}`;
    if (a % 2 === 0 && k % 2 === 0) return `${a / 2 === 0 ? '' : a / 2 + '+'}${k / 2 === 1 ? '' : k / 2}\\sqrt{${m}}`;
    return `\\dfrac{${a}+${sq}}{2}`;
  }
  const AB99 = [[1, 2], [2, 1], [1, 6], [2, 3], [3, 4], [1, 3], [3, 1], [2, 2], [1, 12], [4, 5], [2, 8], [3, 10], [1, 5], [4, 1], [2, 4]];
  const recT = (a, b, v) => `${v}_{n+1}=${a === 1 ? '' : a}${v}_n+${b === 1 ? '' : b}${v}_{n-1}`;
  const seq99 = (a, b, x1, x2, n) => { const s = [null, x1, x2]; for (let k = 3; k <= n; k++) s.push(a * s[k - 1] + b * s[k - 2]); return s; };
  // 近似：√m の値（小数第3位まで）と、答えのけた（くいちがわないけた。O-4）
  const SQV = { 2: 1.414, 3: 1.732, 5: 2.236, 6: 2.449, 7: 2.646, 13: 3.606, 21: 4.583, 17: 4.123, 10: 3.162 };
  M.add({
    id: '7-99', part: 6, chap: '7-10（もっと知りたい）', stars: 1,
    title: '前の2つをたすくり返しは行列のくり返し。となりの比は大きいほうの固有値（フィボナッチ数なら黄金比）に近づく',
    mark: '$x_{n+1}=ax_n+bx_{n-1}$（フィボナッチ数 1、1、2、3、5、8、…）、「となりの比が近づく数」。',
    futsu: ['1、1、2、3、5、8、13、21、…と書き出し、', '$2\\div1$、$3\\div2$、$5\\div3$、…と比を出して、', '近づく数を小数で見る'],
    raku: ['$\\begin{pmatrix}F_{n+1}\\\\F_n\\end{pmatrix}=\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}\\begin{pmatrix}F_n\\\\F_{n-1}\\end{pmatrix}$', '特性方程式 $\\lambda^2-\\lambda-1=0$ → $\\lambda=\\dfrac{1\\pm\\sqrt5}{2}$', '大きいほう：比は $\\dfrac{1+\\sqrt5}{2}\\approx1.618$ へ'],
    why: 'くり返し $x_{n+1}=ax_n+bx_{n-1}$ は、「今の数と1つ前の数」の組 $(x_n,\\ x_{n-1})$ で見ると、1行め $(a,\\ b)$、2行め $(1,\\ 0)$ の行列のくり返しになる（2行めは $x_n=x_n$）。固有値は $\\lambda^2-a\\lambda-b=0$ の解。何回もかけると大きさのいちばん大きい固有値の向きにそろい（7-83）、その固有ベクトルは $(\\lambda,\\ 1)$ なので、となりの比 $x_{n+1}\\div x_n$ はその固有値に近づく（7-10 もっと知りたい）。',
    caution: '行列の2行めは $(1,\\ 0)$（$x_n$ をそのまま下にずらす）。比が近づくのは大きさの大きいほうの固有値（フィボナッチ数なら $-0.618$ ではない）。$x_{n+1}=x_n-x_{n-1}$ のように固有値が複素数だと、比は近づかない。',
    counts: { s1: 3, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 2, s3: 1, trap: 1 }, boxw: { s1: '20mm', s2: '22mm', s3: '18mm', trap: '14mm' }, boxh: { s2: '11mm' },
    fits(q) {
      if (/1段か2段/.test(q)) return true;
      const m = /x_\{n\+1\}=(\d*)x_n\+(\d*)x_\{n-1\}/.exec(q); return !!m;
    },
    steps: {
      // 項を出す・行列で書く
      s1(r) {
        if (turn(r, '99s1', 2) === 0) {
          const [a, b] = r.pick([[1, 1], [1, 1], [1, 2], [2, 1], [1, 3], [2, 3]]), x1 = r.int(1, 3), x2 = r.int(1, 5), n = r.int(6, 9), s = seq99(a, b, x1, x2, n);
          if (s[n] > 3000 || (a === 1 && b === 1 && x1 === 1 && x2 === 1 && n <= 8)) return null;
          return { q: `$${recT(a, b, 'x')}$、$x_1=${x1}$、$x_2=${x2}$ のとき $x_${n}$`, a: `$${s[n]}$`, key: `${a},${b}|${x1},${x2}|${n}`, easyCheck: false,
            easy: s.slice(1, n + 1).join('、'), verify: p => { let u = x1, v = x2; for (let k = 3; k <= n; k++) [u, v] = [v, a * v + b * u]; return near(nums(p.a)[0], v) || '1つずつ作った数とちがう'; } };
        }
        const [a, b] = r.pick(AB99.concat([[1, 1]]));
        return { q: `$${recT(a, b, 'x')}$ を、組 $(x_n,\\ x_{n-1})$ から次の組 $(x_{n+1},\\ x_n)$ を作る行列 $A$ で書くときの $A$`, a: `$${pm([[a, b], [1, 0]])}$`, key: `${a},${b}|A`, easyCheck: false, boxw: '20mm', boxh: '11mm',
          easy: `1行め $(${a},\\ ${b})$、2行め $(1,\\ 0)$`, calc: { kind: 'mat', want: [[a, b], [1, 0]] },
          verify: p => { const A = M.readMat(p.a).map(rw => rw.map(c => c[0])); return vnear(mv(A, [7, 3]), [a * 7 + b * 3, 7]) || 'くり返しとちがう'; } };
      },
      // となりの比が近づく数（√ を残した形）
      s2(r) {
        const [a, b] = r.pick(AB99);
        return { q: `$${recT(a, b, 'x')}$（$x_1=1$、$x_2=1$）で、となりの比 $x_{n+1}\\div x_n$ が近づく数`, a: `$${bigRoot(a, b)}$`, key: `${a},${b}|lim`, easyCheck: false,
          easy: `$\\lambda^2-${a === 1 ? '' : a}\\lambda-${b}=0$ の大きいほう`,
          verify: p => { let u = 1, v = 1; for (let k = 0; k < 400; k++) { [u, v] = [v, a * v + b * u]; const n = Math.abs(v); u /= n; v /= n; } return near(ev(strip(p.a)), v / u, 1e-9) || 'となりの比が近づく数とちがう'; } };
      },
      // 見かけがちがう：近似の値・階段ののぼり方
      s3(r) {
        if (turn(r, '99s3', 2) === 0) {
          const [a, b] = r.pick(AB99.filter(([a0, b0]) => SQV[(() => { let m = a0 * a0 + 4 * b0; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) m /= f * f; return m; })()])), Dd = a * a + 4 * b;
          let k = 1, m = Dd; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; }
          const approx = F.div(F.add(fr(a), F.mul(fr(k), D(String(SQV[m])))), fr(2)), tv = (a + Math.sqrt(Dd)) / 2;
          for (const dg of [3, 2]) {
            const s = agree(approx, tv, dg); if (s == null) continue;
            return { q: `$${recT(a, b, 'x')}$ で、となりの比 $x_{n+1}\\div x_n$ が近づく数（$\\sqrt{${m}}=${SQV[m]}$ として、小数第${dg}位まで）`, a: `約 $${s}$`, key: `${a},${b}|lim`, easyCheck: false,
              easy: `$${bigRoot(a, b)}\\approx${s}$`, verify: p => near(nums(p.a)[0], +s) && Math.abs(+s - tv) < 0.6 * 10 ** -dg || '近づく数とちがう' };
          }
          return null;
        }
        const n = r.int(6, 12), w = [0, 1, 2]; for (let k = 3; k <= n; k++) w.push(w[k - 1] + w[k - 2]);
        return { q: `階段を、1段か2段ずつのぼる。${n}段の階段ののぼり方 ＝ □ とおり`, a: `$${w[n]}$`, key: `st${n}`, easyCheck: false,
          easy: `$x_{n}=x_{n-1}+x_{n-2}$（最後が1段か2段）、$x_1=1$、$x_2=2$`,
          verify: p => { const cnt = m => (m < 0 ? 0 : m === 0 ? 1 : cnt(m - 1) + cnt(m - 2)); return nums(p.a)[0] === cnt(n) || '数えたのぼり方とちがう'; } };
      },
      // わな：固有値が複素数（比は近づかず、同じ数がくり返す。7-84）
      trap(r) {
        const [c1, c0, per] = r.pick([[1, -1, 6], [0, -1, 4], [-1, -1, 3]]), x1 = r.int(1, 5), x2 = r.int(1, 5), n = r.int(20, 50);
        if (x1 === x2 && c1 === 1) return null;
        const s = [null, x1, x2]; for (let k = 3; k <= n; k++) s.push(c1 * s[k - 1] + c0 * s[k - 2]);
        const rec = `x_{n+1}=${c1 === 0 ? '' : c1 === 1 ? 'x_n' : '-x_n'}-x_{n-1}`;
        return dest({ q: `$${rec}$、$x_1=${x1}$、$x_2=${x2}$ のとき $x_{${n}}$`, a: `$${s[n]}$`, key: `t${c1}|${x1},${x2}|${n}`, easyCheck: false,
          verify: p => { let u = x1, v = x2; for (let k = 3; k <= n; k++) [u, v] = [v, c1 * v + c0 * u]; return near(nums(p.a)[0], v) || '1つずつ作った数とちがう'; } }, '7-99',
        `固有値が複素数（大きさ1、${360 / per}°ずつ回る）なので、比は近づかない。${per}つごとに同じ数がくり返す`, ['7-84']);
      },
    },
  });

})(globalThis.MONDAI);
