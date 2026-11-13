/* 問題集 第8巻　第5部 発散と回転（わざ 8-60〜8-74・8-95）　組 e
 * 書き方は v8/README.md（第8・9巻の手引き）・v6/README.md・v5/README.md。文は教科書 第8巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 8-9（発散）・8-10（回転）の数・ことば・記号にそろえる（発散 $\mathrm{div}\,\vec v$、わき出し・吸いこみ、マス、外まわり、点のわき出し、
 *   連続の式、熱の流れ $\vec q$、風車、左回り・右回り、循環、回転 $\mathrm{rot}\,\vec F$、用水路、回転台、保存力、位置エネルギー $U$、導線の磁場）。
 *   発散の単位は教科書 8-9 と同じ $\mathrm{/s}$、回転の単位は教科書 8-10 と同じ $\mathrm{1/s}$。マスの辺の水は「速度（右向き・上向きを正）」（O-3・V-7）。
 * 検算：偏微分（発散・回転・偏微分の値）は calc（kind 'pdiff'、op 'div'・'rot'）、成分の組は calc（'vec'・pdiff の rot）、
 *   そのほか（符号・回る向き・マスの辺・流量・熱・磁場・U・小さな箱）は verify(p) で、問題を作った式とは別の道すじ（数の差分・面ごとの数値積分など）で確かめる。
 * 図は 8-60・8-67（矢印の場 G.quiver）、8-61・8-68（マスの辺の矢印 M.figCell）のステップ3だけ（K-2）。表（p.table）は 8-62 のステップ3だけ。
 * 左ページの「楽な形」と目印・注意の例の数（と、その入れかえ・符号ちがい・何倍か・同じ答え）は、同じ見開きの問題に出さない（O-2・S-2・U-2）。
 * 選ぶ答え（正・負・0、左回り・右回り・回らない、わき出し・吸いこみ、保存力か）は、ステップごとに回して、かたよらないようにする（S-4・U-3）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const fmt = v => { const s = String(+(+v).toFixed(10)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 問題ができたときだけ進める回し方（答えのかたよりをなくす。S-4・U-3）：peek で今の番を見て、問題を返す前に adv で進める
  const peek = (r, key, n) => { const d = r.turns || (r.turns = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return d[key]; };
  const adv = (r, key, n) => { r.turns[key] = (r.turns[key] + 1) % n; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const U = (v, u) => `${v}\\,\\mathrm{${u}}`;
  const fv = v => (typeof v === 'number' ? fmt(v) : v);
  const P = (a, b) => `(${fv(a)},\\ ${fv(b)})`;
  const P3 = (a, b, c) => `(${fv(a)},\\ ${fv(b)},\\ ${fv(c)})`;
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));   // ひく数・かける数が負なら（ ）
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  const cf = (c, body) => (c === 0 ? '' : body === '' ? fmt(c) : c === 1 ? body : c === -1 ? '-' + body : fmt(c) + body);   // 係数 × 式（1・−1 は書かない）
  const lin = (terms) => sum(terms.map(([c, b]) => cf(c, b)));   // [[2, 'x'], [-3, 'y']] → 2x-3y
  // 分数の TeX（約分。分母1なら整数）
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return String(n);
    return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
  }
  const maths = t => (String(t).match(/\$[^$]*\$/g) || []).map(s => s.slice(1, -1));
  const noUnit = t => String(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\\mathrm\{[^}]*\}/g, '');
  // 答えの文のはじめの数（$…$ の中。単位・「＝」の左・≈ の右をのぞく）
  function numOf(t, k, vars) {
    const ms = maths(t); let s = ms[k || 0]; if (s == null) return null;
    s = noUnit(s); if (s.includes('\\approx')) s = s.split('\\approx')[0];
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    return M.evalMath(s.trim(), vars || {});
  }
  // 数の差分（検算用。問題を作った式とは別の道すじ）
  const dnum = (f, x, y, w) => { const h = 1e-5; return w === 'x' ? (f(x + h, y) - f(x - h, y)) / (2 * h) : (f(x, y + h) - f(x, y - h)) / (2 * h); };
  const divNum = (F, x, y) => dnum((a, b) => F(a, b)[0], x, y, 'x') + dnum((a, b) => F(a, b)[1], x, y, 'y');
  const rotNum = (F, x, y) => dnum((a, b) => F(a, b)[1], x, y, 'x') - dnum((a, b) => F(a, b)[0], x, y, 'y');
  const sgn = v => (Math.abs(v) < 1e-7 ? 0 : v > 0 ? 1 : -1);
  const SGN = { 1: '正', '-1': '負', 0: '0' };
  const TURN = { 1: '左回り', '-1': '右回り', 0: '回らない' };
  const t10 = n => fmt(n / 10);   // 10倍の整数で持った数 → 小数
  // 同じ見開きの1つのステップで、同じ答えを max こまでにする（S-4・U-3）。問題を返す直前に呼ぶ
  const once = (r, key, v, max) => { const u = r['once' + key] || (r['once' + key] = new Map()); const n = u.get(v) || 0; if (n >= (max || 2)) return false; u.set(v, n + 1); return true; };

  // ---------------------------------------------------------------- 多項式（x・y・z）：項は [係数, x の次数, y の次数, z の次数]
  const VN = ['x', 'y', 'z'];
  function pnorm(ts) {   // 同じ項をまとめ、0の項をのぞく
    const m = new Map();
    for (const [c, ...e] of ts) { const k = e.join(','); m.set(k, (m.get(k) || 0) + c); }
    return [...m].filter(([, c]) => Math.abs(c) > 1e-12).map(([k, c]) => [c, ...k.split(',').map(Number)]);
  }
  const pd = (ts, i) => pnorm(ts.filter(t => t[i + 1] > 0).map(t => { const u = t.slice(); u[0] = t[0] * t[i + 1]; u[i + 1]--; return u; }));
  const pval = (ts, v) => ts.reduce((s, [c, ...e]) => s + c * e.reduce((m, p, i) => m * (v[i] || 0) ** p, 1), 0);
  const mono = e => e.map((p, i) => (p ? VN[i] + (p > 1 ? '^' + p : '') : '')).join('');
  function ptex(ts) {   // 次数の高い順、x・y・z の順
    const s = pnorm(ts).sort((a, b) => (b[1] + b[2] + b[3]) - (a[1] + a[2] + a[3]) || b[1] - a[1] || b[2] - a[2] || b[3] - a[3]);
    return sum(s.map(([c, ...e]) => cf(c, mono(e))));
  }
  const pcalc = ts => (pnorm(ts).map(([c, ...e]) => `(${c})` + e.map((p, i) => (p ? `*${VN[i]}^${p}` : '')).join('')).join('+') || '0');

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く（S-7）。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(8).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 5 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 8-60
  // 文で書いた場（ステップ1）：[文, 場, 調べる点]。楽な形の例（集まる・ななめにそろった・右へ行くほど長い右向き・回る）は使わない（O-2）
  const T60 = [
    ['点Oから外へ向かい、点Oから遠いほど長い矢印', (x, y) => [x, y], [1, 1]],
    ['上へ行くほど長くなる、上向きの矢印', (x, y) => [0, y + 3], [0, 0]],
    ['下へ行くほど長くなる、下向きの矢印', (x, y) => [0, y - 3], [0, 0]],
    ['左へ行くほど長くなる、左向きの矢印', (x, y) => [x - 3, 0], [0, 0]],
    ['右へ行くほど短くなる、右向きの矢印', (x, y) => [3 - x, 0], [0, 0]],
    ['右へ行くほど長くなる、左向きの矢印', (x, y) => [-(x + 3), 0], [0, 0]],
    ['上へ行くほど短くなる、上向きの矢印', (x, y) => [0, 3 - y], [0, 0]],
    ['上へ行くほど長くなる、下向きの矢印', (x, y) => [0, -(y + 3)], [0, 0]],
    ['どこでも同じ長さの、下向きの矢印', (x, y) => [0, -1], [0, 0]],
    ['上へ行くほど長くなる、右向きの矢印', (x, y) => [y + 3, 0], [0, 0]],
    ['右へ行くほど長くなる、上向きの矢印', (x, y) => [0, x + 3], [0, 0]],
    ['左へ行くほど長くなる、下向きの矢印', (x, y) => [0, x - 3], [0, 0]],
  ];
  const Q60 = 'の発散は、正・負・0のどれ';
  M.add({
    id: '8-60', part: 5, chap: '8-9①② 例題1', stars: 1,
    title: '発散の符号は、矢印の向きでなく出入りの差で決まる',
    mark: '矢印の場の中のマス、「発散は正・負・0のどれ」。',
    futsu: ['場の式から $\\dfrac{\\partial v_x}{\\partial x}+\\dfrac{\\partial v_y}{\\partial y}$ を', '計算して、マスの所の値の', '符号を調べる'],
    raku: ['集まる矢印 → 入るほうが多い：負', 'ななめにそろった矢印 → 0（入った分だけ出る）', '右へ行くほど長い右向きの矢印 → 正'],
    why: 'マスの4つの辺で「出る量」と「入る量」をくらべる。発散は「出－入」をマスの面積でわったもの（8-9①）。向きがそろっていても、右の辺から出る量が左の辺から入る量より多ければ正（側溝）。ぐるぐる回っていても、入った分だけ出れば0（うず。8-9②）。',
    caution: '矢印の向きだけで決めない：原点のまわりを回る矢印は0、上へ行くほど速い右向きの矢印（ずれ）も0（上と下の辺は、水が辺にそって流れるだけ）。左向きの矢印は、左の辺から「出る」。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '14mm' },
    fits(q) { return /発散は、?正・負・0のどれ/.test(q); },
    steps: {
      // 矢印のようすを文で（図なし。K-2）
      s1(r) {
        const want = [1, -1, 0][peek(r, '60s1', 3)];
        const c = T60.filter(t => sgn(divNum(t[1], ...t[2])) === want);
        const k = r.int(0, c.length - 1), [t, F, pt] = c[k];
        adv(r, '60s1', 3);
        return { q: `${t}がならぶ流れで、その中に置いたマス${Q60}`, a: SGN[want], key: '60:' + t, easyCheck: false,
          easy: want === 1 ? '出る量のほうが多い' : want === -1 ? '入る量のほうが多い' : '入った分だけ出る',
          verify: p => (p.a === SGN[sgn(divNum(F, ...pt))]) || '符号がちがう' };
      },
      // 場の式で（点のまわりのマス）
      s2(r) {
        const want = [1, -1, 0][peek(r, '60s2', 3)], kind = turn(r, '60s2k', 3);
        let F, txt, pt = [r.int(-2, 2), r.int(-2, 2)], where = `点 $${P(pt[0], pt[1])}$ のまわりの`;
        if (kind === 0) {   // (ax, by)。a+b の符号。どこでも同じなので「どこに置いても」
          const a = r.pick([-3, -2, -1, 1, 2, 3]), b = r.pick([-3, -2, -1, 1, 2, 3]);
          if (sgn(a + b) !== want || a === b) return null;
          F = (x, y) => [a * x, b * y]; txt = P(cf(a, 'x'), cf(b, 'y')); where = '';
        } else if (kind === 1) {   // (x^2, 0)・(0, y^2) などを、点ごとに
          const c = r.pick([1, 2, -1]), ax = r.chance(0.5);
          if (want === 0) { if (ax) pt[0] = 0; else pt[1] = 0; }
          else { const s = want * sgn(c); const v = s * r.int(1, 2); if (ax) pt[0] = v; else pt[1] = v; }
          F = ax ? (x, y) => [c * x * x, 0] : (x, y) => [0, c * y * y];
          txt = ax ? P(cf(c, 'x^2'), 0) : P(0, cf(c, 'y^2'));
          where = `点 $${P(pt[0], pt[1])}$ のまわりの`;
        } else {   // 0 の場：(c, d)・(ky, 0)・(0, kx)。正・負は (ax, 0)（a<0）・(0, by)
          const k = r.pick([-3, -2, 2, 3]);
          if (want === 0) {
            const z = r.int(0, 2);
            if (z === 0) { const c = r.pick([-2, -1, 1, 2, 3]), d = r.pick([-2, -1, 1, 2]); F = () => [c, d]; txt = P(c, d); }
            else if (z === 1) { F = (x, y) => [k * y, 0]; txt = P(cf(k, 'y'), 0); }
            else { F = (x, y) => [0, k * x]; txt = P(0, cf(k, 'x')); }
          } else if (want < 0 && r.chance(0.5)) { const a = -Math.abs(k); F = (x, y) => [a * x, 0]; txt = P(cf(a, 'x'), 0); }
          else { const b = want * Math.abs(k); F = (x, y) => [0, b * y]; txt = P(0, cf(b, 'y')); }
          where = '';
        }
        if (sgn(divNum(F, ...pt)) !== want) return null;
        adv(r, '60s2', 3);
        return { q: where ? `$\\vec v=${txt}$ の流れで、${where}マス${Q60}` : `$\\vec v=${txt}$ の流れに置いたマス${Q60}`, a: SGN[want], key: '60:' + txt + where, easyCheck: false,
          easy: `$\\dfrac{\\partial v_x}{\\partial x}+\\dfrac{\\partial v_y}{\\partial y}$ の符号`,
          verify: p => (p.a === SGN[sgn(divNum(F, ...pt))]) || '符号がちがう' };
      },
      // 図：矢印の場と点線のマス（K-2）
      s3(r) {
        const want = [1, -1, 0][peek(r, '60s3', 3)];
        const FS = [
          [(x, y) => [0, y + 3], 1], [(x, y) => [0, -(y + 3)], -1], [(x, y) => [3 - x, 0], -1], [(x, y) => [y + 3, 0], 0],
          [(x, y) => [0, x + 3], 0], [(x, y) => [x, y], 1], [(x, y) => [x, -y], 0], [(x, y) => [-2 * x, y], -1], [(x, y) => [x - 3, 0], 1], [(x, y) => [-x, 0.5 * y], -1], [(x, y) => [2 * x, -y], 1],
        ].filter(f => f[1] === want);
        const k = r.int(0, FS.length - 1), F = FS[k][0], cx = r.int(-1, 1), cy = r.int(-1, 1);
        if (sgn(divNum(F, cx, cy)) !== want) return null;
        adv(r, '60s3', 3);
        const G = M.graph({ x0: -2.6, x1: 2.6, y0: -2.6, y1: 2.6, w: 8, h: 8 }), xs = [-2, -1, 0, 1, 2];
        const fig = { s: 5, items: [...G.quiver(F, xs, xs), ['poly', [G.T(cx - 1, cy - 1), G.T(cx + 1, cy - 1), G.T(cx + 1, cy + 1), G.T(cx - 1, cy + 1)], { dash: true }]] };
        return { q: `図の矢印の場で、点線のマス${Q60}`, a: SGN[want], key: `60f:${want}:${k}:${cx},${cy}`, easyCheck: false, fig,
          easy: '辺から出る矢印と入る矢印をくらべる',
          verify: p => (p.a === SGN[sgn(divNum(F, cx, cy))]) || '符号がちがう' };
      },
      // わな：値を聞く → 8-63
      trap(r) {
        const a = r.pick([-4, -3, -2, 2, 4, 5]), b = r.pick([-3, -2, -1, 1, 3]);
        if (a + b === 0 || (a === 3 && b === -1)) return null;
        return dest({ q: `$\\vec v=${P(cf(a, 'x'), cf(b, 'y'))}$ の発散の値`, a: `$${a + b}$`, key: `60t:${a},${b}`,
          calc: { kind: 'pdiff', op: 'div', f: [`${a}*x`, `${b}*y`], vars: ['x', 'y'] } }, '8-60',
          '符号だけでなく値を聞いている。$v_x$ を $x$ で、$v_y$ を $y$ で偏微分してたす', ['8-63']);
      },
    },
  });

  // ================================================================ 8-61
  // 1辺 h（10倍の整数で）と、4つの辺の速度（10倍の整数）。発散 =（右－左）÷h ＋（上－下）÷h
  const EX61 = [5, 12, 4, -3, 2];   // 楽な形の例：h=0.5、右 1.2、左 0.4、上 -0.3、下 0.2 → 0.6
  const HS61 = [1, 2, 4, 5, 10, 20];
  const div61 = (H, R, L, T, D) => ((R - L) + (T - D)) / H;   // 10倍どうしなので、そのまま（m/s ÷ m）
  // 例の数・入れかえ・符号ちがい・何倍か・同じ答え（0.6）をよける（S-2・U-2）
  function bad61(H, vs) {
    const a = vs.map(Math.abs).sort((x, y) => x - y), b = EX61.slice(1).map(Math.abs).sort((x, y) => x - y);
    if (a.every((x, i) => x * b[3] === b[i] * a[3])) return true;
    return Math.abs(div61(H, ...vs) - 0.6) < 1e-9;
  }
  const nice61 = (H, d) => Math.abs(d * 100 - Math.round(d * 100)) < 1e-9;
  M.add({
    id: '8-61', part: 5, chap: '8-9③④ 例題2', stars: 1,
    title: 'マスの発散は（右－左）÷$h$＋（上－下）÷$h$',
    mark: '1辺 $h$ のマスと、4つの辺を通る水の速度。',
    futsu: ['4つの辺で「出る・入る」を決め、', '出る量（速さ×$h$）をたし、入る量をひいて、', 'マスの面積 $h^2$ でわる'],
    raku: ['$h=0.5$、右 $1.2$、左 $0.4$、上 $-0.3$、下 $0.2$', '→ $\\dfrac{1.2-0.4}{0.5}+\\dfrac{-0.3-0.2}{0.5}$', '$=1.6-1=0.6$（わき出し）'],
    why: '右向き・上向きを正にすると、右と上の辺では正が「出る」、左と下の辺では正が「入る」（8-9④）。だから左と下はひく。出入りの量は速さ×辺の長さ $h$、それを面積 $h\\times h$ でわるので、$h$ が1つ残る。左向き（負）の速度は、負のままひけば、自動で「出る」になる。',
    caution: '左と下の辺をたさない（$1.2+0.4$ はまちがい）。負の速度はそのまま入れる：$0.5-(-0.3)=0.8$。$h$ でわるのを忘れない（$h=0.5$ なら2倍になる）。',
    counts: { s1: 4, s2: 2, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '40mm', s3: '24mm', trap: '20mm' },
    fits(q) {
      if (/2×2|4つのマス|3つのマス|合計|循環|回転|風車|6つの面/.test(q)) return false;
      return /マス/.test(q) && /発散/.test(q) && /(右向き・上向きを正|で外へ|で中へ)/.test(q);
    },
    steps: {
      // 速度（右向き・上向きを正）が書いてある
      s1(r) {
        const H = r.pick(HS61), vs = [0, 1, 2, 3].map(() => r.int(-6, 15)), [R, L, T, D] = vs;
        const d = div61(H, ...vs); if (!nice61(H, d) || bad61(H, vs) || d === 0) return null;
        if (vs.filter(v => v < 0).length > 2) return null;
        return { q: `1辺 $h=${U(t10(H), 'm')}$ のマスの辺を通る水の速度（右向き・上向きを正、$\\mathrm{m/s}$）は、右 $${t10(R)}$、左 $${t10(L)}$、上 $${t10(T)}$、下 $${t10(D)}$。発散`,
          a: `$${U(fmt(d), '/s')}$`, key: `61:${H}:${vs}`, easyCheck: false,
          easy: `$\\dfrac{${t10(R)}-${par(L / 10)}}{${t10(H)}}+\\dfrac{${t10(T)}-${par(D / 10)}}{${t10(H)}}=${fmt(d)}$`,
          verify: p => near(numOf(p.a), (R + T - L - D) / 10 * (H / 10) / ((H / 10) ** 2)) || '発散がちがう' };
      },
      // 速さと「出る・入る」で書いてある → 発散と、わき出しか吸いこみか
      s2(r) {
        const want = peek(r, '61s2', 2) === 0 ? 1 : -1;
        const H = r.pick(HS61), sp = [0, 1, 2, 3].map(() => r.int(1, 12)), out = [0, 1, 2, 3].map(() => r.chance(0.5));
        const tot = sp.reduce((s, v, i) => s + (out[i] ? v : -v), 0), d = tot / H;
        if (sgn(d) !== want || !nice61(H, d)) return null;
        // 速度（右向き・上向きを正）に直すと：右・上は出るが正、左・下は入るが正
        const vs = [out[0] ? sp[0] : -sp[0], out[1] ? -sp[1] : sp[1], out[2] ? sp[2] : -sp[2], out[3] ? -sp[3] : sp[3]];
        if (bad61(H, vs)) return null;
        adv(r, '61s2', 2);
        const e = ['右', '左', '上', '下'].map((n, i) => `${n} $${t10(sp[i])}$ で${out[i] ? '外へ' : '中へ'}`).join('、');
        return { q: `1辺 $${U(t10(H), 'm')}$ のマスの辺をまっすぐ通る水の速さ（$\\mathrm{m/s}$）は、${e}。発散と、わき出しか吸いこみか`,
          a: `$${U(fmt(d), '/s')}$、${want > 0 ? 'わき出し' : '吸いこみ'}`, key: `61:${H}:${vs}`, easyCheck: false,
          easy: `出る量をたし、入る量をひいて $${t10(H)}$ でわる`,
          verify: p => (near(numOf(p.a), div61(H, ...vs)) && p.a.includes(d > 0 ? 'わき出し' : '吸いこみ')) || '発散がちがう' };
      },
      // 図：マスと4つの辺の矢印
      s3(r) {
        const H = r.pick(HS61), vs = [0, 1, 2, 3].map(() => r.int(-6, 15)), [R, L, T, D] = vs;
        const d = div61(H, ...vs); if (!nice61(H, d) || bad61(H, vs) || d === 0 || vs.includes(0)) return null;
        const v = { e: R / 10, w: L / 10, n: T / 10, s: D / 10 };
        const fig = { s: 6, items: M.figCell([0, 0], 3, v, { side: `$h=${U(t10(H), 'm')}$` }) };
        return { q: `図のマスで、数は辺を通る水の速度（右向き・上向きを正、$\\mathrm{m/s}$）。このマスの発散`, a: `$${U(fmt(d), '/s')}$`, key: `61:${H}:${vs}`, easyCheck: false, fig,
          easy: `$\\dfrac{${t10(R)}-${par(L / 10)}}{${t10(H)}}+\\dfrac{${t10(T)}-${par(D / 10)}}{${t10(H)}}=${fmt(d)}$`,
          verify: p => near(numOf(p.a), (R + T - L - D) / H) || '発散がちがう' };
      },
      // わな：辺にそう速度から風車の向き → 8-68
      trap(r) {
        const H = r.pick([2, 4, 5, 10]), vs = [0, 1, 2, 3].map(() => r.int(-3, 12)), [B, R, T, L] = vs, c = B + R - T - L;
        if (c === 0) return null;
        return dest({ q: `${txt68(H, B, R, T, L)}。マスに置いた風車の回る向き`,
          a: c > 0 ? '左回り' : '右回り', key: `61t:${H}:${vs}`, verify: p => (p.a === (B + R - T - L > 0 ? '左回り' : '右回り')) || '向きがちがう' }, '8-61',
          '辺に直角な（通りぬける）速度ではなく、辺にそう速度。循環（下＋右－上－左）の符号を見る', ['8-68']);
      },
    },
  });

  // ================================================================ 8-62
  // 2×2 のマス（1辺 1 m）。値は10倍の整数。外まわり：右の辺2つ、左の辺2つ、上の辺2つ、下の辺2つ
  const EX62 = [4, 3, 2, 1, 5, 2, 1, 3];   // 楽な形の例 → 0.7
  const absKey = a => a.map(Math.abs).sort((x, y) => x - y).join(',');
  const bad62 = (outer, ans) => absKey(outer) === absKey(EX62) || Math.abs(ans - 7) < 1e-9;
  M.add({
    id: '8-62', part: 5, chap: '8-9⑤ 例題3', stars: 1,
    title: 'いくつものマスの発散の合計は、外まわりの辺だけで決まる',
    mark: '2×2 などに並んだマス、「発散の合計」。',
    futsu: ['マスを1つずつ「右－左＋上－下」で計算し、', '4つの発散を出してから', 'たし合わせる'],
    raku: ['外まわり：右 $0.4+0.3$、左 $0.2+0.1$', '上 $0.5+0.2$、下 $0.1+0.3$', '→ $0.7-0.3+0.7-0.4=0.7$（中の辺は見ない）'],
    why: 'となりどうしのマスの共通の辺では、片方の「出る」がもう片方の「入る」になり、たすと打ち消し合う（8-9⑤）。残るのは外まわりの辺だけ。1辺 $1\\,\\mathrm m$ のマスなら、外まわりの「右－左＋上－下」がそのまま発散の合計になる（8-11 のガウスの定理の入口）。',
    caution: '外まわりの右の辺・左の辺は2つずつ（段ごと）、上の辺・下の辺も2つずつ（列ごと）ある。左と下はひく。負の値はそのまま入れる。',
    counts: { s1: 3, s2: 2, s3: 1, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '24mm' },
    fits(q) { return /発散の合計/.test(q) || (/外まわり/.test(q) && /のマスの発散/.test(q)); },
    steps: {
      // 外まわりの値が文に書いてある
      s1(r) {
        const o = [0, 1, 2, 3, 4, 5, 6, 7].map(() => r.int(-3, 9)), [r1, r2, l1, l2, u1, u2, d1, d2] = o, s = r1 + r2 - l1 - l2 + u1 + u2 - d1 - d2;
        if (bad62(o, s) || s === 0 || o.filter(v => v < 0).length > 2) return null;
        return { q: `1辺 $${U(1, 'm')}$ のマス 2×2 で、外まわりの辺を通る量（右向き・上向きを正、$\\mathrm{m^2/s}$）は、右 $${t10(r1)}$ と $${t10(r2)}$、左 $${t10(l1)}$ と $${t10(l2)}$、上 $${t10(u1)}$ と $${t10(u2)}$、下 $${t10(d1)}$ と $${t10(d2)}$。4つのマスの発散の合計`,
          a: `$${U(t10(s), '/s')}$`, key: `62:${o}`, easyCheck: false,
          easy: `外まわりの「右－左＋上－下」$=${t10(r1 + r2)}-${par((l1 + l2) / 10)}+${t10(u1 + u2)}-${par((d1 + d2) / 10)}$`,
          verify: p => near(numOf(p.a), o.reduce((t, v, i) => t + (i < 2 || (i >= 4 && i < 6) ? v : -v), 0) / 10) || '合計がちがう' };
      },
      // 3つのマスの発散がわかっていて、残りの1つ・3つ並んだマス
      s2(r) {
        if (turn(r, '62s2', 2) === 0) {
          const o = [0, 1, 2, 3, 4, 5, 6, 7].map(() => r.int(-2, 9)), tot = o[0] + o[1] - o[2] - o[3] + o[4] + o[5] - o[6] - o[7];
          const k = [r.int(-5, 8), r.int(-5, 8), r.int(-5, 8)], last = tot - k[0] - k[1] - k[2];
          if (bad62(o, tot) || Math.abs(last) > 12 || last === 7 || k.includes(last)) return null;
          return { q: `1辺 $${U(1, 'm')}$ のマス 2×2 で、外まわりの辺を通る量（右向き・上向きを正、$\\mathrm{m^2/s}$）は、右 $${t10(o[0])}$ と $${t10(o[1])}$、左 $${t10(o[2])}$ と $${t10(o[3])}$、上 $${t10(o[4])}$ と $${t10(o[5])}$、下 $${t10(o[6])}$ と $${t10(o[7])}$。左上・右上・左下のマスの発散は $${t10(k[0])}$、$${t10(k[1])}$、$${t10(k[2])}$。右下のマスの発散`,
            a: `$${U(t10(last), '/s')}$`, key: `62b:${o}:${k}`, easyCheck: false,
            easy: `合計 $${t10(tot)}$ から3つをひく`,
            verify: p => near(numOf(p.a), (o[0] + o[1] - o[2] - o[3] + o[4] + o[5] - o[6] - o[7] - k[0] - k[1] - k[2]) / 10) || '発散がちがう' };
        }
        // 横に3つ並んだマス：右の辺1つ、左の辺1つ、上の辺3つ、下の辺3つ
        const R = r.int(-2, 9), L = r.int(-2, 9), us = [0, 1, 2].map(() => r.int(-3, 8)), ds = [0, 1, 2].map(() => r.int(-3, 8));
        const s = R - L + us[0] + us[1] + us[2] - ds[0] - ds[1] - ds[2];
        if (s === 0 || s === 7 || [R, L, ...us, ...ds].filter(v => v < 0).length > 2) return null;
        return { q: `1辺 $${U(1, 'm')}$ のマスが横に3つ並ぶ。外まわりの辺を通る量（右向き・上向きを正、$\\mathrm{m^2/s}$）は、右 $${t10(R)}$、左 $${t10(L)}$、上 $${us.map(t10).join('$、$')}$、下 $${ds.map(t10).join('$、$')}$。3つのマスの発散の合計`,
          a: `$${U(t10(s), '/s')}$`, key: `62c:${R},${L}:${us}:${ds}`, easyCheck: false,
          easy: `右－左＋（上3つ）－（下3つ）`,
          verify: p => near(numOf(p.a), (R - L + us.reduce((a, b) => a + b) - ds.reduce((a, b) => a + b)) / 10) || '合計がちがう' };
      },
      // 表：中の辺もふくめた、全部の辺の値（中の辺は見なくてよい）
      s3(r) {
        const V = [[0, 1, 2].map(() => r.int(-3, 9)), [0, 1, 2].map(() => r.int(-3, 9))];   // たての辺：[上の段, 下の段][x=0,1,2]
        const Hh = [[0, 1].map(() => r.int(-3, 9)), [0, 1].map(() => r.int(-3, 9)), [0, 1].map(() => r.int(-3, 9))];   // 横の辺：[y=2, y=1, y=0][左の列, 右の列]
        // 4つのマスの発散を1つずつ（別の道すじ）
        const cell = (row, col) => (V[row][col + 1] - V[row][col]) + (Hh[row][col] - Hh[row + 1][col]);
        const tot = cell(0, 0) + cell(0, 1) + cell(1, 0) + cell(1, 1);
        const outer = [V[0][2], V[1][2], V[0][0], V[1][0], Hh[0][0], Hh[0][1], Hh[2][0], Hh[2][1]];
        if (bad62(outer, tot) || tot === 0 || [...V.flat(), ...Hh.flat()].filter(v => v < 0).length > 3) return null;
        const m$ = v => `$${t10(v)}$`;
        const table = { head: ['たての辺（右向きが正）', '$x=0$', '$x=1$', '$x=2$'], rows: [['上の段', ...V[0].map(m$)], ['下の段', ...V[1].map(m$)]] };
        const hz = ['2', '1', '0'].map((y, k) => `$y=${y}$ の線は $${t10(Hh[k][0])}$ と $${t10(Hh[k][1])}$`).join('、');
        return { q: `1辺 $${U(1, 'm')}$ のマス 2×2 の辺を通る量（$\\mathrm{m^2/s}$）。たての辺は表のとおり。横の辺（上向きが正、左の列・右の列の順）は、${hz}。4つのマスの発散の合計`, a: `$${U(t10(tot), '/s')}$`, key: `62:${outer}`, easyCheck: false, table,
          easy: `外まわりだけ：$${t10(V[0][2] + V[1][2])}-${par((V[0][0] + V[1][0]) / 10)}+${t10(Hh[0][0] + Hh[0][1])}-${par((Hh[2][0] + Hh[2][1]) / 10)}$`,
          verify: p => near(numOf(p.a), tot / 10) || '合計がちがう' };
      },
      // わな：外まわりを1周する循環（辺にそう速度）→ 8-68
      trap(r) {
        const o = [0, 1, 2, 3, 4, 5, 6, 7].map(() => r.int(-2, 9)), c = o[0] + o[1] + o[2] + o[3] - o[4] - o[5] - o[6] - o[7];
        if (c === 0) return null;
        return dest({ q: `1辺 $${U(1, 'm')}$ のマス 2×2 の外まわりの辺のまん中で、辺にそう速度（右向き・上向きを正、$\\mathrm{m/s}$）は、下 $${t10(o[0])}$ と $${t10(o[1])}$、右 $${t10(o[2])}$ と $${t10(o[3])}$、上 $${t10(o[4])}$ と $${t10(o[5])}$、左 $${t10(o[6])}$ と $${t10(o[7])}$。外まわりを左回りに1周する循環`,
          a: `$${U(t10(c), 'm^2/s')}$`, key: `62t:${o}`, verify: p => near(numOf(p.a), (o[0] + o[1] + o[2] + o[3] - o[4] - o[5] - o[6] - o[7]) / 10) || '循環がちがう' }, '8-62',
          '辺を通りぬける量ではなく、辺にそう速度で1周する。循環は「下＋右－上－左」×辺の長さ', ['8-68']);
      },
    },
  });

  // ================================================================ 8-63
  // 平面の1次式の場 (ax+by, cx+dy) の発散 a+d。例 (x+3y, 2x-5y) → -4、(y, x) → 0（注意）、(ax, 2y) → a=-2 をよける（O-2）
  const EX63 = [[1, 3, 2, -5], [0, 1, 1, 0]];
  const bad63 = (co, ans) => EX63.some(e => absKey(e) === absKey(co) || (absKey(e.map(x => 2 * x)) === absKey(co))) || ans === -4 || ans === -2;
  const linTxt = (a, b, c, d) => P(lin([[a, 'x'], [b, 'y']]), lin([[c, 'x'], [d, 'y']]));
  const fits63 = q => /\$\\vec [vFq]=|\$\\nabla\\cdot/.test(q) && /(発散|\\nabla\\cdot|わき出しか吸いこみか)/.test(q) && !/生まれる熱|回転の発散|\\mathrm\{rot\}/.test(q) && !/x\^2\+y\^2|r\^3/.test(q);
  M.add({
    id: '8-63', part: 5, chap: '8-9⑥⑧ 例題4・例題5', stars: 1,
    title: '発散は「同じ文字どうし」の偏微分の和',
    mark: '$\\mathrm{div}\\,\\vec v$、$\\nabla\\cdot\\vec v$、「わき出しか吸いこみか」。',
    futsu: ['小さなマス（箱）を置いて、4つの辺（6つの面）の', '出入りを $h$ の式で書き、', '面積（体積）でわって $h\\to0$ にする'],
    raku: ['$(x+3y,\\ 2x-5y)$ → $1+(-5)=-4$（吸いこみ）', '$(xz,\\ y^2,\\ z)$ → $z+2y+1$', '$(ax,\\ 2y)$ の発散が0 → $a=-2$'],
    why: '左右の辺の出入りは $v_x$ の左右の差、上下の辺の出入りは $v_y$ の上下の差で決まる（8-9⑥）。だから $v_x$ は $x$ で、$v_y$ は $y$ で（空間なら $v_z$ は $z$ で）偏微分してたす。$\\nabla\\cdot\\vec v$ の「1つめどうし、2つめどうし」の内積と同じ形（8-9⑨）。答えは場所ごとの数で、正ならわき出し、負なら吸いこみ。',
    caution: '$\\vec v=(y,\\ x)$ の発散は $0+0=0$（$\\dfrac{\\partial v_x}{\\partial y}+\\dfrac{\\partial v_y}{\\partial x}=1+1$ ではない）。発散は数（矢印で答えない）。偏微分しない文字は数と同じ：$\\dfrac{\\partial(xy)}{\\partial y}=x$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '30mm', s3: '28mm', trap: '14mm' },
    fits: fits63,
    steps: {
      // 平面の1次式
      s1(r) {
        const co = [0, 1, 2, 3].map(() => r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 0])), [a, b, c, d] = co, ans = a + d;
        if (a === 0 || d === 0 || (b === 0 && c === 0) || bad63(co, ans) || !once(r, '63s1', ans, 1)) return null;
        return { q: `$\\vec v=${linTxt(a, b, c, d)}$ の発散`, a: `$${ans}$`, key: `63:${co}`, easyCheck: false,
          easy: `$${a}+${par(d)}=${ans}$`, calc: { kind: 'pdiff', op: 'div', f: [`${a}*x+${b}*y`, `${c}*x+${d}*y`], vars: ['x', 'y'] } };
      },
      // 空間の場（答えは式）・発散が0になる係数
      s2(r) {
        if (turn(r, '63s2', 3) < 2) {
          // 成分ごとに、自分の文字をふくむ項1つと、ふくまない項1つ
          const comp = i => {
            const e1 = [0, 0, 0]; e1[i] = r.pick([1, 1, 2]); const j = r.pick([0, 1, 2].filter(k => k !== i)); if (e1[i] === 1 && r.chance(0.6)) e1[j] = 1;
            const e2 = [0, 0, 0]; const o = [0, 1, 2].filter(k => k !== i); e2[r.pick(o)] = 1; if (r.chance(0.3)) e2[o[0]] = e2[o[1]] = 1;
            return pnorm([[r.pick([1, 1, 2, 3, -1, -2]), ...e1], [r.chance(0.5) ? r.pick([1, -1, 2, -3]) : 0, ...e2]]);
          };
          const V = [comp(0), comp(1), comp(2)], D = pnorm([...pd(V[0], 0), ...pd(V[1], 1), ...pd(V[2], 2)]);
          if (D.length < 2 || D.every(t => t[1] + t[2] + t[3] === 0)) return null;
          const txt = P3(ptex(V[0]), ptex(V[1]), ptex(V[2]));
          if (txt === P3('xz', 'y^2', 'z')) return null;
          return { q: `$\\vec v=${txt}$ の発散`, a: `$${ptex(D)}$`, key: `63:${txt}`, easyCheck: false,
            easy: `$${[0, 1, 2].map(i => ptex(pd(V[i], i))).map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('')}$`,
            calc: { kind: 'pdiff', op: 'div', f: V.map(pcalc), vars: ['x', 'y', 'z'] } };
        }
        // 発散が0になる係数（平面）
        const b0 = r.pick([-4, -3, 3, 4, 5, -5, 1, -1]), p = r.pick([-3, -2, -1, 1, 2, 3]), q = r.pick([-3, -2, -1, 1, 2, 4]), first = r.chance(0.5);
        const ans = -b0; if (ans === -2 || ans === 2 && first) return null;
        const txt = first ? P(`ax${p > 0 ? '+' : ''}${cf(p, 'y')}`, lin([[q, 'x'], [b0, 'y']])) : P(lin([[b0, 'x'], [p, 'y']]), `${cf(q, 'x')}+ay`);
        return { q: `$\\vec v=${txt}$ が、どこでも発散0になる $a$`, a: `$a=${ans}$`, key: `63a:${txt}`, easyCheck: false,
          easy: `$a+${par(b0)}=0$`, verify: p2 => near(numOf(p2.a), ans) && Math.abs(divNum(first ? (x, y) => [ans * x + p * y, q * x + b0 * y] : (x, y) => [b0 * x + p * y, q * x + ans * y], 0.3, 0.7)) < 1e-6 || '発散が0にならない' };
      },
      // 点の値と、わき出しか吸いこみか（$\nabla\cdot$ の書き方も）
      s3(r) {
        const want = peek(r, '63s3', 2) === 0 ? 1 : -1, three = r.chance(0.5);
        const V = three ? [pnorm([[r.pick([1, 2, -1]), 1, 1, 0], [r.pick([0, 1, -2]), 0, 0, 1]]), pnorm([[r.pick([1, -1, 2]), 0, 2, 0]]), pnorm([[r.pick([1, -1, 3, -2]), 0, 0, 1], [r.pick([0, 2]), 1, 0, 0]])]
          : [pnorm([[r.pick([1, 2, -1]), 2, 0, 0], [r.pick([1, -1, 3]), 0, 1, 0]]), pnorm([[r.pick([1, -2, 2, -1]), 1, 1, 0]]), []];
        const pt = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
        const D = pnorm([...pd(V[0], 0), ...pd(V[1], 1), ...pd(V[2], 2)]), val = pval(D, pt);
        if (sgn(val) !== want || val === -4 || val === -2 || !once(r, '63s3', val, 1)) return null;
        adv(r, '63s3', 2);
        const txt = three ? P3(ptex(V[0]), ptex(V[1]), ptex(V[2])) : P(ptex(V[0]), ptex(V[1])), ptT = three ? P3(...pt) : P(pt[0], pt[1]);
        const nab = r.chance(0.5);
        return { q: nab ? `$\\vec v=${txt}$ で、点 $${ptT}$ の $\\nabla\\cdot\\vec v$ の値と、わき出しか吸いこみか` : `$\\vec v=${txt}$ の流れで、点 $${ptT}$ の発散と、わき出しか吸いこみか`,
          a: `$${fmt(val)}$、${want > 0 ? 'わき出し' : '吸いこみ'}`, key: `63p:${txt}:${pt}`, easyCheck: false,
          easy: `発散 $${ptex(D)}$ に代入`,
          calc: { kind: 'pdiff', op: 'div', f: (three ? V : V.slice(0, 2)).map(pcalc), vars: three ? ['x', 'y', 'z'] : ['x', 'y'], at: three ? pt : pt.slice(0, 2), ans: fmt(val) },
          verify: p => p.a.includes(val > 0 ? 'わき出し' : '吸いこみ') || 'わき出し・吸いこみがちがう' };
      },
      // わな：回転を聞く → 8-69
      trap(r) {
        const co = [0, 1, 2, 3].map(() => r.pick([-4, -3, -2, -1, 1, 2, 3, 4])), [a, b, c, d] = co;
        if (c - b === 0 || absKey(co) === absKey([1, 2, 4, -3])) return null;
        return dest({ q: `$\\vec F=${linTxt(a, b, c, d)}$ の回転`, a: `$${c - b}$`, key: `63t:${co}`,
          calc: { kind: 'pdiff', op: 'rot', f: [`${a}*x+${b}*y`, `${c}*x+${d}*y`], vars: ['x', 'y'] } }, '8-63',
          '発散ではなく回転。$F_y$ を $x$ で、$F_x$ を $y$ で（ちがう文字どうし）偏微分してひく', ['8-69']);
      },
    },
  });

  // ================================================================ 8-64
  // 点のわき出し k(x, y)/(x^2+y^2)：∂v_x/∂x = k(y^2-x^2)/(x^2+y^2)^2、∂v_y/∂y = k(x^2-y^2)/(x^2+y^2)^2
  const srcTxt = k => `\\dfrac{${k === 1 ? '(x,\\ y)' : `(${cf(k, 'x')},\\ ${cf(k, 'y')})`}}{x^2+y^2}`;
  const bad64pt = (a, b) => absKey([a, b]) === '1,2' || Math.abs(a) === Math.abs(b);   // 例の点 (2, 1)（と入れかえ・符号ちがい）、a²=b²（どちらも0）をよける
  const fits64 = q => /x\^2\+y\^2|\{r\^3\}|\(x-\d\)\^2/.test(q) && /\\partial|発散/.test(q) && !/回転|循環|円から/.test(q);
  M.add({
    id: '8-64', part: 5, chap: '8-9⑪ 例題7', stars: 1,
    title: '点のわき出しの場 $\\dfrac{(x,\\ y)}{x^2+y^2}$ は、口の外では発散0',
    mark: '$\\dfrac{(x,\\ y)}{x^2+y^2}$、$\\dfrac{(x,\\ y,\\ z)}{r^3}$ の偏微分・発散。',
    futsu: ['$\\dfrac{x}{x^2+y^2}$ と $\\dfrac{y}{x^2+y^2}$ を', '1つずつ商の微分（5-6）で偏微分し、', '点の値を出してからたす'],
    raku: ['$\\dfrac{\\partial}{\\partial x}\\Bigl(\\dfrac{x}{x^2+y^2}\\Bigr)=\\dfrac{y^2-x^2}{(x^2+y^2)^2}$', '$\\dfrac{\\partial}{\\partial y}\\Bigl(\\dfrac{y}{x^2+y^2}\\Bigr)=\\dfrac{x^2-y^2}{(x^2+y^2)^2}$', '→ たして0。点 $(2,\\ 1)$ では $-\\dfrac{3}{25}$ と $\\dfrac{3}{25}$'],
    why: '2つの偏微分は、分子の $y^2-x^2$ と $x^2-y^2$ が入れかわっただけ（$x$ と $y$ の役を入れかえた式）なので、たすと0（8-9⑪）。口からはなれた所では、外側の辺は長いが矢印が短く、出る量と入る量が等しい。わき出しは口の1点だけに集まっている。空間の $\\dfrac{(x,\\ y,\\ z)}{r^3}$ も、3つの偏微分 $\\dfrac{1}{r^3}-\\dfrac{3x^2}{r^5}$ などをたすと0。',
    caution: '原点（口）では分母が0で、式は使えない（原点をかこめば出る量は $2\\pi$。8-11）。$\\dfrac{\\partial}{\\partial x}$ では $y$ を止めるので、分母を $x$ で微分すると $2x$。前の数 $k$ は外に出したまま。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '36mm', s3: '36mm', trap: '20mm' },
    boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits: fits64,
    steps: {
      // 点での2つの偏微分の値
      s1(r) {
        const k = r.pick([1, 2, 3, -1, -2, 4, 5]), a = r.int(-3, 3), b = r.int(-3, 3);
        if (bad64pt(a, b)) return null;
        const R2 = a * a + b * b, n1 = k * (b * b - a * a), A1 = frac(n1, R2 * R2), A2 = frac(-n1, R2 * R2);
        return { q: `$\\vec v=${srcTxt(k)}$ の、点 $${P(a, b)}$ での $\\dfrac{\\partial v_x}{\\partial x}$ と $\\dfrac{\\partial v_y}{\\partial y}$`, a: `$${A1}$ と $${A2}$`, key: `64:${k}:${a},${b}`, easyCheck: false,
          easy: `$${k === 1 ? '' : k + '\\times'}\\dfrac{${b * b}-${a * a}}{${R2}^2}$、たすと0`,
          calc: { kind: 'pdiff', f: [`${k}*x/(x^2+y^2)`, `${k}*y/(x^2+y^2)`], vars: ['x', 'y'], wrt: [['x'], ['y']], at: [a, b], ans: [A1, A2] } };
      },
      // 式で：∂v_x/∂x・∂v_y/∂y（k は 1・−1 でない。例と同じ式・符号ちがいをよける）と、点の発散
      s2(r) {
        const kind = turn(r, '64s2', 3), k = r.pick([2, 3, 4, -2, -3, 5]);
        if (kind === 2) {
          if (!once(r, '64z', 0, 1)) return null;
          const a = r.int(-3, 3), b = r.int(-3, 3); if (bad64pt(a, b) || (a === 0 && b === 0)) return null;
          return { q: `$\\vec v=${srcTxt(k)}$ の、点 $${P(a, b)}$ での発散`, a: '$0$', key: `64d:${k}:${a},${b}`, easyCheck: false,
            easy: '2つの偏微分が打ち消す', calc: { kind: 'pdiff', op: 'div', f: [`${k}*x/(x^2+y^2)`, `${k}*y/(x^2+y^2)`], vars: ['x', 'y'], at: [a, b] } };
        }
        const xx = kind === 0, num = (k > 0) === xx ? `${Math.abs(k)}(y^2-x^2)` : `${Math.abs(k)}(x^2-y^2)`;
        return { q: `$\\vec v=${srcTxt(k)}$ の $\\dfrac{\\partial v_${xx ? 'x' : 'y'}}{\\partial ${xx ? 'x' : 'y'}}$（原点以外）`, a: `$\\dfrac{${num}}{(x^2+y^2)^2}$`, key: `64f:${k}:${kind}`, easyCheck: false,
          easy: `商の微分：$\\dfrac{${k}(x^2+y^2)-${k}${xx ? 'x' : 'y'}\\times2${xx ? 'x' : 'y'}}{(x^2+y^2)^2}$`,
          calc: { kind: 'pdiff', f: xx ? `${k}*x/(x^2+y^2)` : `${k}*y/(x^2+y^2)`, vars: ['x', 'y'], wrt: [xx ? 'x' : 'y'] } };
      },
      // 空間の点のわき出し（r が整数の点）・口が原点でない場
      s3(r) {
        if (turn(r, '64s3', 2) === 0) {
          // 空間：k(x, y, z)/r^3 の1つの偏微分を、r と文字の式で（点の値は分母が大きくなるので聞かない）
          const k = r.pick([2, 3, 4, 5, -1, -2]), i = r.int(0, 2), n = ['x', 'y', 'z'][i];
          const A = `\\dfrac{${k}}{r^3}${k > 0 ? '-' : '+'}\\dfrac{${Math.abs(3 * k)}${n}^2}{r^5}`;
          const R3 = '(x^2+y^2+z^2)^(1.5)', R5 = '(x^2+y^2+z^2)^(2.5)';
          return { q: `$\\vec E=\\dfrac{(${cf(k, 'x')},\\ ${cf(k, 'y')},\\ ${cf(k, 'z')})}{r^3}$（$r=\\sqrt{x^2+y^2+z^2}$）の $\\dfrac{\\partial E_${n}}{\\partial ${n}}$ を、$r$ と $${n}$ の式で`, a: `$${A}$`, key: `64r:${k}:${n}`, easyCheck: false,
            easy: `積の微分：$${k}\\Bigl(\\dfrac{1}{r^3}+${n}\\times\\Bigl(-\\dfrac{3${n}}{r^5}\\Bigr)\\Bigr)$`,
            calc: { kind: 'pdiff', f: `${k}*${n}/${R3}`, vars: ['x', 'y', 'z'], wrt: [n], ans: `${k}/${R3}-${3 * k}*${n}^2/${R5}` },
            verify: p => [[0.37, 0.83, 1.29], [1.13, -0.61, 0.47]].every(v => { const rr = Math.hypot(...v), vs = { x: v[0], y: v[1], z: v[2], r: rr }; return near(M.evalMath(maths(p.a)[0], vs), k / rr ** 3 - 3 * k * v[i] ** 2 / rr ** 5, 1e-9); }) || '式がちがう' };
        }
        const c = r.int(1, 3), e = r.int(-2, 2), a = c + r.pick([-2, -1, 1, 2, 3]), b = e + r.pick([-3, -1, 1, 2]);
        const u = a - c, w = b - e; if (bad64pt(u, w) || bad64pt(a, b)) return null;
        const R2 = u * u + w * w, sx = e === 0 ? 'y' : `(y${e > 0 ? '-' : '+'}${Math.abs(e)})`, sxx = `(x-${c})`;
        return { q: `口が点 $${P(c, e)}$ の $\\vec v=\\dfrac{(x-${c},\\ ${e === 0 ? 'y' : `y${e > 0 ? '-' : '+'}${Math.abs(e)}`})}{${sxx}^2+${sx}^2}$ の、点 $${P(a, b)}$ での $\\dfrac{\\partial v_x}{\\partial x}$ と $\\dfrac{\\partial v_y}{\\partial y}$`,
          a: `$${frac(w * w - u * u, R2 * R2)}$ と $${frac(u * u - w * w, R2 * R2)}$`, key: `64s:${c},${e}:${a},${b}`, easyCheck: false,
          easy: `口から見た点 $${P(u, w)}$ で、$\\dfrac{${w * w}-${u * u}}{${R2}^2}$`,
          calc: { kind: 'pdiff', f: [`(x-${c})/((x-${c})^2+(y-(${e}))^2)`, `(y-(${e}))/((x-${c})^2+(y-(${e}))^2)`], vars: ['x', 'y'], wrt: [['x'], ['y']], at: [a, b], ans: [frac(w * w - u * u, R2 * R2), frac(u * u - w * w, R2 * R2)] } };
      },
      // わな：口をかこむ円から出る量 → 8-78
      trap(r) {
        const k = r.pick([1, 2, 3, -1, 4]), R = r.pick([1, 2, 3, 0.5]);
        return dest({ q: `$\\vec v=${srcTxt(k)}$ で、原点を中心とする半径 $${fmt(R)}$ の円から外へ出る量`, a: `$${cf(2 * k, '\\pi')}$`, key: `64t:${k}:${R}`,
          // 出る量 ∮(v_x dy − v_y dx) を、線積分の部品で（F を (−v_y, v_x) にする）
          calc: { kind: 'line', r: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, '2*pi'], F: [`-${k}*y/(x^2+y^2)`, `${k}*x/(x^2+y^2)`] } }, '8-64',
          '円は口（原点）をかこむ。口の外で発散0でも、口をかこめば出る量は $2\\pi k$（半径によらない）', ['8-78']);
      },
    },
  });

  // ================================================================ 8-65
  // v1 A1 = v2 A2。速さ（10倍の整数）、断面積（cm²）
  const EX65 = [[12, 4, 1], [15, 2, 0.5]];   // 楽な形の例（1.2 m/s、4→1 cm²）と教科書の例題8（1.5、2.0→0.5）
  const fits65 = q => /(断面積|直径|穴|はば)/.test(q) && /(速さ|出る水|流れる量)/.test(q) && /(ホース|管|ノズル|シャワー|水路|出口)/.test(q) && !/中心からの距離/.test(q);
  M.add({
    id: '8-65', part: 5, chap: '8-9⑫ 例題8', stars: 1,
    title: '縮まない流れは $v_1A_1=v_2A_2$：断面積が $\\dfrac1n$ なら速さは $n$ 倍',
    mark: 'ホース・管の太い所と細い所、断面積と速さ。',
    futsu: ['1秒間に入る水の体積 $v_1A_1$ を、$\\mathrm{m^3}$ に直して出し、', 'それを出口の断面積（$\\mathrm{m^2}$）でわって', '出口の速さを出す'],
    raku: ['$1.2\\,\\mathrm{m/s}$、$4\\,\\mathrm{cm^2}$ → $1\\,\\mathrm{cm^2}$：$\\dfrac14$ なので4倍', '→ $4.8\\,\\mathrm{m/s}$', '1分に出る水 $1.2\\times0.0004\\times60=0.0288\\,\\mathrm{m^3}$'],
    why: '水は縮まないので $\\mathrm{div}\\,\\vec v=0$。管の中で水は生まれも消えもしないので、1秒間に入る量＝出る量：$v_1A_1=v_2A_2$（8-9⑫ 連続の式）。両辺に同じ単位が出るので、断面積は $\\mathrm{cm^2}$ のままでよい。量そのもの（L）を聞かれたときだけ $\\mathrm{m^2}$ に直す（$1\\,\\mathrm{cm^2}=0.0001\\,\\mathrm{m^2}$、$1\\,\\mathrm{m^3}=1000\\,\\mathrm L$）。',
    caution: '直径が $\\dfrac12$ なら断面積は $\\dfrac14$、速さは4倍（2倍ではない）。速さ×断面積で1秒の量。1分なら60倍。穴がいくつもあるときは、穴の断面積の合計でわる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '22mm', s3: '22mm', trap: '24mm' },
    fits: fits65,
    steps: {
      // 出口の速さ
      s1(r) {
        const v1 = r.pick([5, 6, 8, 10, 15, 20, 25, 30, 4]), A1 = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), A2 = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 0.4, 0.6, 0.8]);
        if (A2 >= A1 || EX65.some(e => (e[0] === v1 && e[1] === A1) || (e[1] / e[2] === A1 / A2 && e[0] === v1))) return null;
        const v2 = v1 / 10 * A1 / A2; if (Math.abs(v2 * 10 - Math.round(v2 * 10)) > 1e-9 || v2 > 30 || Math.abs(v2 - 4.8) < 1e-9 || !once(r, '65s1', v2, 1)) return null;
        const sc = r.pick(['ホース', '管', 'ノズル']);
        return { q: `${sc}の中を水が速さ $${U(t10(v1), 'm/s')}$ で流れる。断面積は $${U(fmt(A1), 'cm^2')}$、出口の断面積は $${U(fmt(A2), 'cm^2')}$。出口での水の速さ`,
          a: `$${U(fmt(v2), 'm/s')}$`, key: `65:${v1},${A1},${A2}`, easyCheck: false,
          easy: `$${t10(v1)}\\times${fmt(A1)}=v_2\\times${fmt(A2)}$`,
          verify: p => near(numOf(p.a), (v1 / 10) * (A1 * 1e-4) / (A2 * 1e-4)) || '速さがちがう' };
      },
      // 1分に出る水（L）・直径・出口の断面積
      s2(r) {
        const kind = turn(r, '65s2', 3);
        if (kind === 0) {
          const v1 = r.pick([5, 6, 8, 10, 15, 20, 25, 30, 4]), A1 = r.pick([2, 2.5, 3, 4, 5, 6]), A2 = r.pick([0.5, 1, 0.4, 0.6]);
          const L = v1 / 10 * A1 * 6; if (EX65.some(e => e[0] === v1 && e[1] === A1) || Math.abs(L * 10 - Math.round(L * 10)) > 1e-9 || A2 >= A1 || Math.abs(L - 4.8) < 1e-9 || Math.abs(L - 28.8) < 1e-9) return null;
          return { q: `ホースの中を水が速さ $${U(t10(v1), 'm/s')}$ で流れる。断面積は $${U(fmt(A1), 'cm^2')}$、出口の断面積は $${U(fmt(A2), 'cm^2')}$。1分間に出る水は何 L`,
            a: `$${U(fmt(L), 'L')}$`, key: `65L:${v1},${A1}`, easyCheck: false,
            easy: `$${t10(v1)}\\times${fmt(A1 / 10000)}\\times60\\times1000$`,
            verify: p => near(numOf(p.a), (v1 / 10) * (A1 / 10000) * 60 * 1000) || '量がちがう' };
        }
        if (kind === 1) {
          const v1 = r.pick([2, 3, 4, 5, 6, 8, 10, 15]), d1 = r.pick([2, 3, 4, 6]), n = r.pick([2, 3, 4]), d2 = d1 / n;
          const v2 = v1 / 10 * n * n; if (Math.abs(v2 - 4.8) < 1e-9) return null;
          return { q: `直径 $${U(fmt(d1), 'cm')}$ の管を水が速さ $${U(t10(v1), 'm/s')}$ で流れ、直径 $${U(fmt(d2), 'cm')}$ の細い管につながる。細い管での速さ`,
            a: `$${U(fmt(v2), 'm/s')}$`, key: `65d:${v1},${d1},${n}`, easyCheck: false,
            easy: `直径 $\\dfrac1{${n}}$ → 断面積 $\\dfrac1{${n * n}}$ → $${n * n}$倍`,
            verify: p => near(numOf(p.a), (v1 / 10) * (Math.PI * d1 * d1 / 4) / (Math.PI * d2 * d2 / 4)) || '速さがちがう' };
        }
        const v1 = r.pick([5, 6, 8, 10, 15, 20]), A1 = r.pick([2, 3, 4, 5, 6]), n = r.pick([2, 3, 4, 5, 6, 8]), v2 = v1 / 10 * n, A2 = A1 / n;
        if (Math.abs(A2 * 100 - Math.round(A2 * 100)) > 1e-9 || EX65.some(e => e[0] === v1 && e[1] === A1) || Math.abs(v2 - 4.8) < 1e-9) return null;
        return { q: `断面積 $${U(fmt(A1), 'cm^2')}$ のホースを水が速さ $${U(t10(v1), 'm/s')}$ で流れる。出口で速さを $${U(fmt(v2), 'm/s')}$ にするには、出口の断面積を何 $\\mathrm{cm^2}$ に`,
          a: `$${U(fmt(A2), 'cm^2')}$`, key: `65A:${v1},${A1},${n}`, easyCheck: false,
          easy: `$${n}$倍の速さ → 断面積は $\\dfrac1{${n}}$`,
          verify: p => near(numOf(p.a), (v1 / 10) * A1 / v2) || '断面積がちがう' };
      },
      // シャワーの穴・用水路のはばと深さ
      s3(r) {
        if (turn(r, '65s3', 2) === 0) {
          const v1 = r.pick([5, 8, 10, 15, 20]), A1 = r.pick([2, 3, 4]), n = r.pick([20, 25, 40, 50, 100]), a = r.pick([0.01, 0.02, 0.04, 0.05]);
          const tot = n * a, v2 = v1 / 10 * A1 / tot; if (tot >= A1 || Math.abs(v2 * 10 - Math.round(v2 * 10)) > 1e-9 || v2 > 20 || Math.abs(v2 - 4.8) < 1e-9) return null;
          return { q: `断面積 $${U(fmt(A1), 'cm^2')}$ のホースを水が速さ $${U(t10(v1), 'm/s')}$ で流れ、シャワーの穴 $${n}$ こ（1こ $${U(fmt(a), 'cm^2')}$）から出る。穴から出る水の速さ`,
            a: `$${U(fmt(v2), 'm/s')}$`, key: `65s:${v1},${A1},${n},${a}`, easyCheck: false,
            easy: `穴の合計 $${fmt(tot)}\\,\\mathrm{cm^2}$ でわる`,
            verify: p => near(numOf(p.a), (v1 / 10) * A1 / (n * a)) || '速さがちがう' };
        }
        const w1 = r.pick([2, 3, 4, 6]), h1 = r.pick([0.5, 1, 1.5]), w2 = r.pick([1, 1.5, 2, 3]), h2 = r.pick([0.5, 0.8, 1, 1.2]), v1 = r.pick([2, 3, 4, 5, 6]);
        const v2 = v1 / 10 * w1 * h1 / (w2 * h2); if (w1 * h1 <= w2 * h2 || Math.abs(v2 * 100 - Math.round(v2 * 100)) > 1e-9 || Math.abs(v2 - 4.8) < 1e-9) return null;
        return { q: `はば $${U(fmt(w1), 'm')}$、深さ $${U(fmt(h1), 'm')}$ の水路を水が速さ $${U(t10(v1), 'm/s')}$ で流れ、はば $${U(fmt(w2), 'm')}$、深さ $${U(fmt(h2), 'm')}$ の所へ。そこでの速さ`,
          a: `$${U(fmt(v2), 'm/s')}$`, key: `65w:${w1},${h1},${w2},${h2},${v1}`, easyCheck: false,
          easy: `断面積 $${fmt(w1 * h1)}$ と $${fmt(w2 * h2)}$ で $v_1A_1=v_2A_2$`,
          verify: p => near(numOf(p.a), (v1 / 10) * (w1 * h1) / (w2 * h2)) || '速さがちがう' };
      },
      // わな：速さが場所で変わる管の流量 → 8-40
      trap(r) {
        const R = r.pick([0.1, 0.2, 0.05]), um = r.pick([1, 2, 3, 4]), c = R * R * um / 2;
        return dest({ q: `半径 $${U(fmt(R), 'm')}$ の管の中で、水の速さが中心からの距離 $r$ で $u=${um}\\Bigl(1-\\dfrac{r^2}{${fmt(R * R)}}\\Bigr)$〔$\\mathrm{m/s}$〕。1秒間に流れる量`,
          a: `$${U(fmt(c) + '\\pi', 'm^3/s')}$`, key: `65t:${R},${um}`,
          calc: { kind: 'polar', f: `${um}*(1-r^2/${R * R})`, r: [0, R], theta: [0, '2*pi'], ans: `${fmt(c)}\\pi` } }, '8-65',
          '速さが場所でちがうので、速さ×断面積にできない。極座標で $u$ を断面全体で積分する', ['8-40']);
      },
    },
  });

  // ================================================================ 8-66
  // 熱の流れ q（W/m²）の発散 = 1 m³ あたり1秒に生まれる熱（W/m³）。どこでも同じなら × 体積（m³）で全体の W
  const fits66 = q => /生まれる熱|熱が生まれる/.test(q) &&/\\vec q|熱の流れ|温度/.test(q);
  const W66 = (c, VL) => c * VL / 1000;   // W/m³ × L → W
  M.add({
    id: '8-66', part: 5, chap: '8-9⑬ 例題9', stars: 1,
    title: '熱の流れの発散は $1\\,\\mathrm{m^3}$ あたり1秒に生まれる熱',
    mark: '$\\vec q=(ax,\\ ay,\\ az)$〔$\\mathrm{W/m^2}$〕、「生まれる熱」。',
    futsu: ['ブロックの6つの面で、面を通って出る熱（$q$×面積）を', '面ごとに計算してたし、', '全体で1秒に出ていく熱を出す'],
    raku: ['$\\vec q=(1000x,\\ 1000y,\\ 1000z)$', '→ $\\mathrm{div}\\,\\vec q=3000\\,\\mathrm{W/m^3}$', '体積 $2\\,\\mathrm L=0.002\\,\\mathrm{m^3}$ → $6\\,\\mathrm W$'],
    why: '$\\mathrm{div}\\,\\vec q$ は、$1\\,\\mathrm{m^3}$ あたり1秒間に外へ出ていく熱（8-9⑬）。出ていく熱は、その場で生まれた熱。単位は $\\mathrm{W/m^2}\\div\\mathrm m=\\mathrm{W/m^3}$（偏微分は「÷長さ」）。どこでも同じ値なら、体積をかければ全体で生まれる熱（W）になる。',
    caution: '体積は $\\mathrm{m^3}$ に直す：$1\\,\\mathrm L=0.001\\,\\mathrm{m^3}$、$1\\,\\mathrm{cm^3}=0.000001\\,\\mathrm{m^3}$。板の中で $q_z=0$ なら、発散は2つの項だけ。発散が0の所（6-3 のかべ）では、熱は生まれない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '26mm', s3: '30mm', trap: '36mm' },
    fits: fits66,
    steps: {
      // (ax, ay, az) と体積（L）→ 全体の W
      s1(r) {
        const a = r.pick([200, 300, 400, 500, 600, 800, 1200, 1500, 2000, 2500]), VL = r.pick([0.5, 1, 1.5, 2, 3, 4, 5, 0.2]), c = 3 * a, w = W66(c, VL);
        if ((a === 1000 && VL === 2) || w === 6 || !once(r, '66s1', w, 1)) return null;
        return { q: `電気を流して熱を出しているブロックの中で、熱の流れが $\\vec q=${P3(a + 'x', a + 'y', a + 'z')}$〔$\\mathrm{W/m^2}$〕。体積は $${U(fmt(VL), 'L')}$。ブロック全体で1秒間に生まれる熱`,
          a: `$${U(fmt(w), 'W')}$`, key: `66:${a},${VL}`, easyCheck: false,
          easy: `$\\mathrm{div}\\,\\vec q=${U(c, 'W/m^3')}$、$\\times${fmt(VL / 1000)}$`,
          calc: { kind: 'pdiff', op: 'div', f: [`${a}*x`, `${a}*y`, `${a}*z`], vars: ['x', 'y', 'z'], ans: String(w / (VL / 1000)) },
          verify: p => near(numOf(p.a), (a + a + a) * VL * 0.001) || '熱がちがう' };
      },
      // 係数がちがう・板（q_z=0）・体積が cm³・逆に係数を求める
      s2(r) {
        const kind = turn(r, '66s2', 3);
        if (kind === 2) {   // 逆：全体の熱と体積から係数
          const a = r.pick([300, 400, 500, 600, 800, 1500]), VL = r.pick([0.5, 1, 2, 4, 5]), w = W66(3 * a, VL);
          if (a === 1000 || w === 6) return null;
          return { q: `ブロックの中の熱の流れが $\\vec q=(ax,\\ ay,\\ az)$〔$\\mathrm{W/m^2}$〕で、体積 $${U(fmt(VL), 'L')}$ のブロック全体で1秒間に $${U(fmt(w), 'W')}$ の熱が生まれる。$a$`,
            a: `$a=${a}$`, key: `66r:${a},${VL}`, easyCheck: false,
            easy: `$\\mathrm{div}\\,\\vec q=${fmt(w)}\\div${fmt(VL / 1000)}=3a$`,
            verify: p => near(numOf(p.a), w / (VL / 1000) / 3) || '係数がちがう' };
        }
        const a = r.pick([200, 300, 500, 600, 800, 1200]), b = kind === 0 ? r.pick([100, 200, 400, 700, 900]) : a, c = kind === 0 ? r.pick([0, 100, 300, 500]) : 0;
        const cm = r.chance(0.5), V = cm ? r.pick([200, 500, 400, 2000]) : r.pick([0.5, 1.5, 2.5, 3]);   // cm³ か L
        const Vm3 = cm ? V / 1e6 : V / 1000, w = (a + b + c) * Vm3;
        if (Math.abs(w * 1000 - Math.round(w * 1000)) > 1e-6 || w === 6) return null;
        const what = kind === 1 ? '板' : 'ブロック';
        return { q: `熱を出している${what}の中で、熱の流れが $\\vec q=${P3(a + 'x', b + 'y', c ? c + 'z' : 0)}$〔$\\mathrm{W/m^2}$〕。体積は $${U(fmt(V), cm ? 'cm^3' : 'L')}$。全体で1秒間に生まれる熱`,
          a: `$${U(fmt(w), 'W')}$`, key: `66b:${a},${b},${c},${V},${cm}`, easyCheck: false,
          easy: `$${a}+${b}${c ? '+' + c : ''}=${a + b + c}\\,\\mathrm{W/m^3}$、$\\times${fmt(Vm3)}$`,
          calc: { kind: 'pdiff', op: 'div', f: [`${a}*x`, `${b}*y`, `${c}*z`], vars: ['x', 'y', 'z'], ans: String(a + b + c) },
          verify: p => near(numOf(p.a), (a + b + c) * Vm3) || '熱がちがう' };
      },
      // 温度の式から（q = -k grad T）・発散0のかべ
      s3(r) {
        if (turn(r, '66s3', 3) === 0) {
          if (!once(r, '66z', 0, 1)) return null;
          const q = r.pick([80, 120, 160, 200, 50]);
          return { q: `厚さ $${U(r.pick([0.1, 0.2, 0.3]), 'm')}$ のかべの中で、熱の流れが場所によらず $\\vec q=${P3(q, 0, 0)}$〔$\\mathrm{W/m^2}$〕。かべの $1\\,\\mathrm{m^3}$ あたり1秒間に生まれる熱`,
            a: `$${U(0, 'W/m^3')}$`, key: `66w:${q}`, easyCheck: false, easy: '定数の偏微分は0（入った熱がそのまま出る）',
            calc: { kind: 'pdiff', op: 'div', f: [String(q), '0', '0'], vars: ['x', 'y', 'z'], ans: '0' } };
        }
        const k = r.pick([16, 50, 20, 40]), c = r.pick([10, 20, 25, 50, 5]), T0 = r.pick([60, 80, 90, 100]), w = 6 * k * c; if (w === 3000) return null;
        return { q: `熱伝導率 $k=${U(k, 'W/(m\\cdot K)')}$ のブロックの中の温度が $T=${T0}-${c}(x^2+y^2+z^2)$〔℃〕。$\\vec q=-k\\,\\mathrm{grad}\\,T$ のとき、$1\\,\\mathrm{m^3}$ あたり1秒間に生まれる熱`,
          a: `$${U(w, 'W/m^3')}$`, key: `66T:${k},${c},${T0}`, easyCheck: false,
          easy: `$\\vec q=${2 * k * c}(x,\\ y,\\ z)$、$\\mathrm{div}\\,\\vec q=${2 * k * c}\\times3$`,
          calc: { kind: 'pdiff', op: 'div', f: [`${2 * k * c}*x`, `${2 * k * c}*y`, `${2 * k * c}*z`], vars: ['x', 'y', 'z'], ans: String(w) },
          verify: p => { const T = (x, y, z) => T0 - c * (x * x + y * y + z * z), h = 1e-3; let d = 0; for (let i = 0; i < 3; i++) { const e = [0, 0, 0]; e[i] = h; const pt = [0.3, 0.2, 0.1]; d += -k * (T(...pt.map((v, j) => v + 2 * e[j])) - 2 * T(...pt) + T(...pt.map((v, j) => v - 2 * e[j]))) / (4 * h * h); } return near(numOf(p.a), d, 1e-6) || '熱がちがう'; } };
      },
      // わな：温度から熱の流れの矢印 → 8-28
      trap(r) {
        const k = r.pick([16, 1.6, 0.6]), a = r.pick([100, 200, 300, 500]), b = r.pick([100, 200, 400, 600]), T0 = r.pick([40, 60, 80]);
        if (a === b) return null;
        return dest({ q: `温度が $T=${T0}-${a}x-${b}y$〔℃〕の板（熱伝導率 $k=${fmt(k)}$）の、熱の流れ $\\vec q=-k\\,\\mathrm{grad}\\,T$`,
          a: `$${U(P(fmt(k * a), fmt(k * b)), 'W/m^2')}$`, key: `66t:${k},${a},${b},${T0}`,
          calc: { kind: 'vec', want: [k * a, k * b], ans: [fmt(k * a), fmt(k * b)] } }, '8-66',
          '発散（生まれる熱）ではなく、熱の流れの矢印そのもの。温度の勾配に $-k$ をかける', ['8-28']);
      },
    },
  });

  // ================================================================ 8-67
  // 風車が回るか：場所 (x, y) の回転の符号。文（ステップ1）は楽な形の例 (0, x)・(y, 0)・(y, x)・(-x, y) と同じようすを使わない（O-2）
  const T67 = [
    ['下へ行くほど速い、右向きの流れ', (x, y) => [3 - y, 0]],
    ['上へ行くほど速い、左向きの流れ', (x, y) => [-(y + 3), 0]],
    ['左へ行くほど速い、下向きの流れ', (x, y) => [0, x - 3]],
    ['点Oのまわりを左回りに回り、点Oから遠いほど速い流れ', (x, y) => [-y, x]],
    ['右へ行くほど速い、下向きの流れ', (x, y) => [0, -(x + 3)]],
    ['左へ行くほど速い、上向きの流れ', (x, y) => [0, 3 - x]],
    ['下へ行くほど速い、左向きの流れ', (x, y) => [y - 3, 0]],
    ['点Oのまわりを右回りに回り、点Oから遠いほど速い流れ', (x, y) => [y, -x]],
    ['右へ行くほど速い、右向きの流れ', (x, y) => [x + 3, 0]],
    ['上へ行くほど速い、上向きの流れ', (x, y) => [0, y + 3]],
    ['どこでも同じ向き・同じ速さの流れ', (x, y) => [1, 2]],
    ['点Oから外へ広がり、点Oから遠いほど速い流れ', (x, y) => [x, y]],
    ['下へ行くほど速い、下向きの流れ', (x, y) => [0, y - 3]],
  ];
  const Q67 = 'に置いた風車の回り方（左回り・右回り・回らない）';
  const EX67 = [[0, 0, 0, 1], [0, 1, 0, 0], [0, 1, 1, 0], [-1, 0, 0, 1]];   // (ax+by, cx+dy) の [a, b, c, d]
  const fits67 = q => /風車/.test(q) && /回り方|回る向き/.test(q) && !/マス|辺|rad\/s|角速度|用水路/.test(q);
  M.add({
    id: '8-67', part: 5, chap: '8-10①② 例題1', stars: 1,
    title: '風車が回るかは、羽根の両側の速さのちがいで決まる',
    mark: '矢印の場と風車、「回るか、どちら向きか」。',
    futsu: ['場の式から $\\dfrac{\\partial F_y}{\\partial x}-\\dfrac{\\partial F_x}{\\partial y}$ を', '計算して、風車の所の値の', '符号を調べる'],
    raku: ['$(0,\\ x)$：右ほど上向きに速い → 左回り', '$(y,\\ 0)$：上ほど右向きに速い → 右回り', '$(y,\\ x)$ → 2つが打ち消して回らない'],
    why: '上下の羽根は横向きの速さのちがいで、左右の羽根はたて向きの速さのちがいで押される（8-10①）。下の羽根が上の羽根より強く右へ押されれば左回り、右の羽根が左の羽根より強く上へ押されれば左回り。2つの働きが同じ強さで反対なら回らない。流れの向きがそろっていても、速さがちがえば回る。',
    caution: '流れが曲がっているかでは決まらない：まっすぐな流れでも回る（ずれ）。$(-x,\\ y)$ のように、上下で横向きの速さが同じで、左右でたて向きの速さが同じなら、回らない。右へ行くほど右向きに速い流れは回らない（それは発散）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '14mm' },
    fits: fits67,
    steps: {
      // ようすを文で
      s1(r) {
        const want = [1, -1, 0][peek(r, '67s1', 3)];
        const c = T67.filter(t => sgn(rotNum(t[1], 0.5, 0.5)) === want), [t, F] = c[r.int(0, c.length - 1)];
        adv(r, '67s1', 3);
        return { q: `${t}${Q67}`, a: TURN[want], key: '67:' + t, easyCheck: false,
          easy: want === 0 ? '両側の速さのちがいがない（か、打ち消す）' : '羽根の両側の速さのちがいを見る',
          verify: p => (p.a === TURN[sgn(rotNum(F, 0.5, 0.5))]) || '向きがちがう' };
      },
      // 場の式で（2つの働きがある場・場所で変わる場）
      s2(r) {
        const want = [1, -1, 0][peek(r, '67s2', 3)];
        let F, txt, at = '';
        if (r.chance(0.6)) {
          const a = r.pick([-2, -1, 0, 1, 2]), b = r.pick([-3, -2, -1, 1, 2, 3]), c = r.pick([-3, -2, -1, 1, 2, 3]), d = r.pick([-2, -1, 0, 1, 2]);
          const co = [a, b, c, d];
          if (EX67.some(e => absKey(e) === absKey(co)) || Math.abs(b) === Math.abs(c) && a === 0 && d === 0 && b === c) return null;
          if (sgn(c - b) !== want) return null;
          F = (x, y) => [a * x + b * y, c * x + d * y]; txt = linTxt(a, b, c, d);
        } else {
          const ax = r.chance(0.5), k = r.pick([1, 2, -1]), v = want === 0 ? 0 : want * sgn(k) * (ax ? -1 : 1) * r.int(1, 2);
          // (k y^2, 0) の回転は -2ky、(0, k x^2) の回転は 2kx
          F = ax ? (x, y) => [k * y * y, 0] : (x, y) => [0, k * x * x];
          txt = ax ? P(cf(k, 'y^2'), 0) : P(0, cf(k, 'x^2'));
          const pt = ax ? [r.int(-2, 2), v] : [v, r.int(-2, 2)];
          at = `の点 $${P(...pt)}$ `;
          if (sgn(rotNum(F, ...pt)) !== want) return null;
          adv(r, '67s2', 3);
          return { q: `$\\vec F=${txt}$ ${at}${Q67}`, a: TURN[want], key: `67:${txt}${at}`, easyCheck: false,
            easy: `$\\dfrac{\\partial F_y}{\\partial x}-\\dfrac{\\partial F_x}{\\partial y}$ の符号`,
            verify: p => (p.a === TURN[sgn(rotNum(F, ...pt))]) || '向きがちがう' };
        }
        adv(r, '67s2', 3);
        return { q: `$\\vec F=${txt}$ の場${Q67}`, a: TURN[want], key: `67:${txt}`, easyCheck: false,
          easy: `$\\dfrac{\\partial F_y}{\\partial x}-\\dfrac{\\partial F_x}{\\partial y}$ の符号`,
          verify: p => (p.a === TURN[sgn(rotNum(F, 0.3, 0.7))]) || '向きがちがう' };
      },
      // 図：矢印の場と風車（風車のまわりの4本は省く。教科書 8-10②と同じ）
      s3(r) {
        const want = [1, -1, 0][peek(r, '67s3', 3)];
        const FS = [(x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [3 - y, 0], (x, y) => [-(y + 3), 0], (x, y) => [0, -(x + 3)], (x, y) => [0, 3 - x],
          (x, y) => [x, -y], (x, y) => [x + 3, 0], (x, y) => [x, y], (x, y) => [1, 1], (x, y) => [0, y + 3]].filter(f => sgn(rotNum(f, 0.5, 0.5)) === want);
        const k = r.int(0, FS.length - 1), F = FS[k], cx = r.pick([-1.5, -0.5, 0.5, 1.5]), cy = r.pick([-1.5, -0.5, 0.5, 1.5]);
        if (sgn(rotNum(F, cx, cy)) !== want) return null;
        adv(r, '67s3', 3);
        const G = M.graph({ x0: -2.6, x1: 2.6, y0: -2.6, y1: 2.6, w: 8, h: 8 }), xs = [-2, -1, 0, 1, 2];
        const big = Math.max(...xs.flatMap(x => xs.map(y => Math.hypot(...F(x, y))))), sc = 0.85 / big;
        const its = [];
        for (const x of xs) for (const y of xs) if (Math.abs(x - cx) > 0.6 || Math.abs(y - cy) > 0.6) its.push(...G.quiver(F, [x], [y], { scale: sc }));
        its.push(...M.figWindmill(G.T(cx, cy), 0.95, { deg: 20 }));
        return { q: `図の矢印の場${Q67}`, a: TURN[want], key: `67f:${want}:${k}:${cx},${cy}`, easyCheck: false, fig: { s: 5, items: its },
          easy: '上下の羽根の横向きの速さ、左右の羽根のたて向きの速さをくらべる',
          verify: p => (p.a === TURN[sgn(rotNum(F, cx, cy))]) || '向きがちがう' };
      },
      // わな：回転の値 → 8-69
      trap(r) {
        const a = r.pick([-4, -3, -2, 2, 3, 5]), b = r.pick([-3, -2, 2, 3, 4, 5]);
        if (b - a === 0 || (a === -2 && b === 3)) return null;
        return dest({ q: `$\\vec F=${P(cf(a, 'y'), cf(b, 'x'))}$ の回転の値`, a: `$${b - a}$`, key: `67t:${a},${b}`,
          calc: { kind: 'pdiff', op: 'rot', f: [`${a}*y`, `${b}*x`], vars: ['x', 'y'] } }, '8-67',
          '回る向きでなく、回転の値を聞いている。$F_y$ を $x$ で、$F_x$ を $y$ で偏微分してひく', ['8-69']);
      },
    },
  });

  // ================================================================ 8-68
  // マスの循環 =（下＋右－上－左）× h、回転 = 循環 ÷ h²、風車の角速度 = 回転 ÷ 2。速度と h は10倍の整数
  const EX68 = [4, 10, 5, 6, 1];   // 楽な形の例：h=0.4、下 1.0、右 0.5、上 0.6、左 0.1 → 循環 0.32、回転 2、風車 1
  const H68 = [1, 2, 4, 5, 10, 20];
  const S68 = (B, R, T, L) => B + R - T - L;   // 10倍の「下＋右－上－左」
  const bad68 = (H, vs, rot) => { const a = vs.map(Math.abs).sort((x, y) => x - y), b = EX68.slice(1).map(Math.abs).sort((x, y) => x - y); return a.every((x, i) => x * b[3] === b[i] * a[3]) || Math.abs(rot - 2) < 1e-9 || Math.abs(rot + 2) < 1e-9 || Math.abs(Math.abs(rot * (H / 10) ** 2) - 0.32) < 1e-9; };   // 循環 0.32 も例と同じ答え
  const dec = (v, n) => Math.abs(v * 10 ** n - Math.round(v * 10 ** n)) < 1e-9;
  const fits68 = q => /マス/.test(q) && /辺/.test(q) && /循環|回転|風車/.test(q) && !/発散/.test(q);
  const txt68 = (H, B, R, T, L) => `1辺 $${U(t10(H), 'm')}$ のマスの辺のまん中で、辺にそう水の速度（$\\mathrm{m/s}$）は、下の $v_x$ が $${t10(B)}$、右の $v_y$ が $${t10(R)}$、上の $v_x$ が $${t10(T)}$、左の $v_y$ が $${t10(L)}$`;
  M.add({
    id: '8-68', part: 5, chap: '8-10③④⑦ 例題2', stars: 1,
    title: 'マスの循環は（下＋右－上－左）×$h$、回転は循環÷$h^2$',
    mark: 'マスの4つの辺のまん中の速度、「循環・回転・風車」。',
    futsu: ['4つの辺を、軸に平行な道の線積分として', '1つずつ定積分し（上と左は向きに注意）、', 'たして循環を出す'],
    raku: ['1辺 $0.4$、下 $1.0$、右 $0.5$、上 $0.6$、左 $0.1$', '→ 循環 $(1.0+0.5-0.6-0.1)\\times0.4=0.32$', '回転 $0.32\\div0.16=2$、風車は左回りに $1\\,\\mathrm{rad/s}$'],
    why: 'マスのふちを左回りに1周すると、下の辺は右へ、右の辺は上へ、上の辺は左へ、左の辺は下へ進む。だから上と左はマイナス（8-10④）。1つの辺で進む向きに押す量は「辺にそう成分×辺の長さ」。循環を面積 $h^2$ でわると回転（正なら左回り）。小さな風車の角速度は回転の半分（8-10⑦）。',
    caution: '発散（右－左＋上－下、辺に直角な成分）と取りちがえない。循環は辺にそう成分で「下＋右－上－左」。面積は $h^2$（$h$ でわるのは1回ではない）。風車の角速度は回転の $\\dfrac12$。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '34mm', s3: '34mm', trap: '22mm' },
    fits: fits68,
    steps: {
      // 循環
      s1(r) {
        const H = r.pick(H68), vs = [0, 1, 2, 3].map(() => r.int(-4, 14)), S = S68(...vs), circ = S / 10 * H / 10, rot = S / H;
        if (sgn(S) !== (peek(r, '68s1', 2) === 0 ? 1 : -1) || bad68(H, vs, rot) || !dec(circ, 3) || vs.filter(v => v < 0).length > 1 || !once(r, '68s1', circ, 1)) return null;
        adv(r, '68s1', 2);
        return { q: `${txt68(H, ...vs)}。循環`, a: `$${U(fmt(circ), 'm^2/s')}$`, key: `68:${H}:${vs}`, easyCheck: false,
          easy: `$(${t10(vs[0])}+${par(vs[1] / 10)}-${par(vs[2] / 10)}-${par(vs[3] / 10)})\\times${t10(H)}$`,
          verify: p => near(numOf(p.a), [vs[0], vs[1], -vs[2], -vs[3]].reduce((t, v) => t + v / 10 * (H / 10), 0)) || '循環がちがう' };
      },
      // 回転・風車
      s2(r) {
        const kind = turn(r, '68s2', 2), want = peek(r, '68s2w', 2) === 0 ? 1 : -1;
        const H = r.pick(H68), vs = [0, 1, 2, 3].map(() => r.int(-4, 14)), S = S68(...vs), rot = S / H, w = rot / 2;
        if (sgn(S) !== want || bad68(H, vs, rot) || !dec(rot, 2) || !dec(w, 2) || vs.filter(v => v < 0).length > 1) return null;
        adv(r, '68s2w', 2);
        if (kind === 0) return { q: `${txt68(H, ...vs)}。回転`, a: `$${U(fmt(rot), '1/s')}$`, key: `68:${H}:${vs}`, easyCheck: false,
          easy: `循環 $${fmt(S / 10 * H / 10)}\\div${fmt((H / 10) ** 2)}$`,
          verify: p => near(numOf(p.a), (vs[0] + vs[1] - vs[2] - vs[3]) / 10 * (H / 10) / (H / 10) ** 2) || '回転がちがう' };
        return { q: `${txt68(H, ...vs)}。マスに置いた小さな風車の、回る向きと角速度`, a: `${w > 0 ? '左回り' : '右回り'}に $${U(fmt(Math.abs(w)), 'rad/s')}$`, key: `68:${H}:${vs}`, easyCheck: false,
          easy: `回転 $${fmt(rot)}$ の半分`,
          verify: p => (near(numOf(p.a), Math.abs(rot) / 2) && p.a.startsWith(rot > 0 ? '左回り' : '右回り')) || '風車がちがう' };
      },
      // 図：辺にそう矢印 → 風車
      s3(r) {
        const want = peek(r, '68s3', 2) === 0 ? 1 : -1;
        const H = r.pick(H68), vs = [0, 1, 2, 3].map(() => r.int(-4, 14)), S = S68(...vs), rot = S / H, w = rot / 2;
        if (sgn(S) !== want || bad68(H, vs, rot) || !dec(w, 2) || vs.includes(0)) return null;
        adv(r, '68s3', 2);
        const [B, R, T, L] = vs;
        const fig = { s: 5, items: M.figCell([0, 0], 3, { s: B / 10, e: R / 10, n: T / 10, w: L / 10 }, { mode: 'circ', side: `$h=${U(t10(H), 'm')}$` }) };
        return { q: `図のマスで、数は辺のまん中の、辺にそう水の速度（右向き・上向きを正、$\\mathrm{m/s}$）。マスに置いた小さな風車の、回る向きと角速度`,
          a: `${w > 0 ? '左回り' : '右回り'}に $${U(fmt(Math.abs(w)), 'rad/s')}$`, key: `68:${H}:${vs}`, easyCheck: false, fig,
          easy: `回転 $${fmt(rot)}$ の半分`,
          verify: p => (near(numOf(p.a), Math.abs(B + R - T - L) / 10 / (H / 10) / 2) && p.a.startsWith(B + R - T - L > 0 ? '左回り' : '右回り')) || '風車がちがう' };
      },
      // わな：辺を通りぬける速度から発散 → 8-61
      trap(r) {
        const H = r.pick([2, 4, 5, 10]), vs = [0, 1, 2, 3].map(() => r.int(-3, 12)), [R, L, T, D] = vs, d = (R - L + T - D) / H;
        if (d === 0 || !dec(d, 2)) return null;
        return dest({ q: `1辺 $${U(t10(H), 'm')}$ のマスの辺をまっすぐ通る水の速度（右向き・上向きを正、$\\mathrm{m/s}$）は、右 $${t10(R)}$、左 $${t10(L)}$、上 $${t10(T)}$、下 $${t10(D)}$。発散`,
          a: `$${U(fmt(d), '/s')}$`, key: `68t:${H}:${vs}`, verify: p => near(numOf(p.a), (R - L + T - D) / H) || '発散がちがう' }, '8-68',
          '辺にそう速度でなく、辺を通りぬける速度。発散は「右－左＋上－下」を $h$ でわる', ['8-61']);
      },
    },
  });

  // ================================================================ 8-69
  // 平面の回転 = ∂F_y/∂x − ∂F_x/∂y。例 (3y, −2x) → −5、(x²y, xy) → y−x²（点 (1, 2) で1）、(−y, x) → 2 をよける（O-2）
  const fieldOf = q => { const m = /\\vec [Fv]=(\([^$]*\))\$/.exec(q); return m ? m[1] : null; };
  const nComp = q => { const f = fieldOf(q); return f ? f.split(',\\ ').length : 0; };   // 場の成分の数（2 か 3）
  const fits69 = q => /回転/.test(q) && nComp(q) === 2 &&!/発散|マス|辺|回転台|1回転|r\^3/.test(q);
  const EX69 = [[0, 3, -2, 0], [0, -1, 1, 0]];
  M.add({
    id: '8-69', part: 5, chap: '8-10⑥ 例題3', stars: 1,
    title: '平面の回転は「$y$ 成分を $x$ で」－「$x$ 成分を $y$ で」',
    mark: '$\\mathrm{rot}\\,\\vec F$（平面）、「回転を求めよう」。',
    futsu: ['小さなマスのふちの4つの辺で、循環を', '$h$ の式で書いて面積 $h^2$ でわり、', '$h\\to0$ にする'],
    raku: ['$(3y,\\ -2x)$ → $-2-3=-5$（右回り）', '$(x^2y,\\ xy)$ → $y-x^2$、点 $(1,\\ 2)$ で1', 'うず $(-y,\\ x)$ で2（正）になるかで、引く順を確かめる'],
    why: '$\\dfrac{\\partial F_y}{\\partial x}$ は左右の羽根のたて向きの速さのちがい、$\\dfrac{\\partial F_x}{\\partial y}$ は上下の羽根の横向きの速さのちがい（8-10⑥）。上の羽根が右へ強く押されると右回りなので、2つめの項はひく。正なら左回り、負なら右回り。',
    caution: '引く順を逆にしない（$\\dfrac{\\partial F_x}{\\partial y}-\\dfrac{\\partial F_y}{\\partial x}$ は符号が反対）。発散（同じ文字どうしのたし算）と取りちがえない。偏微分しない文字は数と同じ：$\\dfrac{\\partial(x^2y)}{\\partial y}=x^2$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    fits: fits69,
    steps: {
      // 1次式の場
      s1(r) {
        const co = [r.pick([0, 0, 1, -1, 2, -3]), r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]), r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]), r.pick([0, 0, 1, -2, 3])], [a, b, c, d] = co, ans = c - b;
        if (ans === 0 || ans === -5 || ans === 2 || EX69.some(e => absKey(e) === absKey(co)) || !once(r, '69s1', ans, 1)) return null;
        return { q: `$\\vec F=${linTxt(a, b, c, d)}$ の回転`, a: `$${ans}$`, key: `69:${co}`, easyCheck: false,
          easy: `$${c}-${par(b)}=${ans}$`, calc: { kind: 'pdiff', op: 'rot', f: [`${a}*x+${b}*y`, `${c}*x+${d}*y`], vars: ['x', 'y'] } };
      },
      // 多項式の場：式と、点の値
      s2(r) {
        const kind = turn(r, '69s2', 3);
        const mx = [[r.pick([1, 2, 3, -1, -2]), r.int(0, 2), r.int(1, 2), 0]], my = [[r.pick([1, 2, -1, 3, -3]), r.int(1, 3), r.int(0, 1), 0]];
        if (r.chance(0.5)) mx.push([r.pick([1, -2, 3]), r.int(1, 2), 0, 0]);   // 微分すると消える項（x だけ）
        if (r.chance(0.5)) my.push([r.pick([1, 2, -1]), 0, r.int(1, 2), 0]);   // 微分すると消える項（y だけ）
        const Fx = pnorm(mx), Fy = pnorm(my), R = pnorm([...pd(Fy, 0), ...pd(Fx, 1).map(([c, ...e]) => [-c, ...e])]);
        if (!R.length || R.every(t => t[1] + t[2] === 0) || ptex(Fx) === 'x^2y' && ptex(Fy) === 'xy') return null;
        const txt = P(ptex(Fx), ptex(Fy));
        if (kind < 2) return { q: `$\\vec F=${txt}$ の回転`, a: `$${ptex(R)}$`, key: `69:${txt}`, easyCheck: false,
          easy: `$${ptex(pd(Fy, 0))}-(${ptex(pd(Fx, 1))})$`, calc: { kind: 'pdiff', op: 'rot', f: [pcalc(Fx), pcalc(Fy)], vars: ['x', 'y'] } };
        const pt = [r.int(-2, 3), r.int(-2, 3)], v = pval(R, pt);
        if ((pt[0] === 1 && pt[1] === 2) || v === 1 || v === 0 || v === 2 || v === -5) return null;
        return { q: `$\\vec F=${txt}$ の、点 $${P(...pt)}$ での回転`, a: `$${fmt(v)}$`, key: `69p:${txt}:${pt}`, easyCheck: false,
          easy: `回転 $${ptex(R)}$ に代入`, calc: { kind: 'pdiff', op: 'rot', f: [pcalc(Fx), pcalc(Fy)], vars: ['x', 'y'], at: pt } };
      },
      // 回転が0になる係数・回転の値と風車の向き
      s3(r) {
        if (turn(r, '69s3', 2) === 0) {
          // (a x y^m + …, k x^2 y^m …) の形：∂F_y/∂x = ∂F_x/∂y になる a
          const m = r.int(1, 2), k = r.pick([1, 2, 3, -1, -2]), s = r.pick([1, 2, 3]);
          // F_y = k x^2 y^m + s y、F_x = a x y^{m+1} + …：∂F_y/∂x = 2k x y^m、∂F_x/∂y = a(m+1) x y^m → a = 2k/(m+1)
          const a = 2 * k / (m + 1); if (!Number.isInteger(a) && !dec(a, 2)) return null;
          const Fy = pnorm([[k, 2, m, 0], [s, 0, 1, 0]]);
          const txt = P(`ax${m + 1 === 1 ? 'y' : `y^${m + 1}`}`, ptex(Fy));
          return { q: `$\\vec F=${txt}$ の回転がどこでも0になる $a$`, a: `$a=${fmt(a)}$`, key: `69a:${m},${k},${s}`, easyCheck: false,
            easy: `$${ptex(pd(Fy, 0))}-${m + 1}ax${m === 1 ? 'y' : `y^${m}`}=0$`,
            verify: p => { const A = numOf(p.a); return Math.abs(rotNum((x, y) => [A * x * y ** (m + 1), k * x * x * y ** m + s * y], 0.7, 1.3)) < 1e-6 || '回転が0にならない'; } };
        }
        const want = peek(r, '69s3w', 2) === 0 ? 1 : -1;
        const a = r.pick([1, 2, -1, 3]), b = r.pick([1, -1, 2, -2]), pt = [r.int(-2, 2), r.int(-2, 2)];
        // F = (a x y^2, b x^2 y + x)：回転 = 2bxy + 1 − 2axy
        const F = (x, y) => [a * x * y * y, b * x * x * y + x], v = (2 * b - 2 * a) * pt[0] * pt[1] + 1;
        if (sgn(v) !== want || v === 2 || v === -5 || !once(r, '69s3', v, 1)) return null;
        adv(r, '69s3w', 2);
        const txt = P(cf(a, 'xy^2'), `${cf(b, 'x^2y')}+x`);
        return { q: `$\\vec F=${txt}$ の、点 $${P(...pt)}$ での回転の値と、そこに置いた風車の向き`, a: `$${v}$、${v > 0 ? '左回り' : '右回り'}`, key: `69w:${txt}:${pt}`, easyCheck: false,
          easy: `回転 $${ptex([[2 * b - 2 * a, 1, 1, 0], [1, 0, 0, 0]])}$ に代入`,
          verify: p => (near(numOf(p.a), rotNum(F, ...pt), 1e-6) && p.a.includes(rotNum(F, ...pt) > 0 ? '左回り' : '右回り')) || '回転がちがう' };
      },
      // わな：空間の場 → 8-71
      trap(r) {
        const a = r.pick([1, 2, 3, -1, -2]), b = r.pick([1, 2, -1, 3]), c = r.pick([1, -2, 2, 4]), o = r.int(0, 1);
        // (a y, b z, c x) か (a z, b x, c y)
        const F = o === 0 ? [`${a}*y`, `${b}*z`, `${c}*x`] : [`${a}*z`, `${b}*x`, `${c}*y`];
        const ans = o === 0 ? [-b, -c, -a] : [c, a, b];
        if (o === 1 && absKey([a, b, c]) === '1,2,3') return null;
        const txt = o === 0 ? P3(cf(a, 'y'), cf(b, 'z'), cf(c, 'x')) : P3(cf(a, 'z'), cf(b, 'x'), cf(c, 'y'));
        return dest({ q: `$\\vec F=${txt}$ の回転`, a: `$${P3(...ans)}$`, key: `69t:${o}:${a},${b},${c}`,
          calc: { kind: 'pdiff', op: 'rot', f: F, vars: ['x', 'y', 'z'] } }, '8-69',
          '空間（3つの成分）の場。回転は数でなく矢印で、成分を1つずつ計算する', ['8-71']);
      },
    },
  });

  // ================================================================ 8-70
  // 用水路：v_x = c(a² − y²)（岸 y=±a で0）。回転 = −∂v_x/∂y = 2cy。風車の角速度は |cy|、1回転の時間は 2π/ω
  const fits70 = q => /用水路/.test(q) && /回転|風車/.test(q) && !/発散/.test(q);
  const OM70 = [0.1, 0.2, 0.25, 0.5, 0.8, 1, 1.25, 2, 0.3, 0.6];
  // ω と |y0| と岸 a から、c と式。だめなら null
  function canal(om, y0, a) {
    const c = om / Math.abs(y0), U0 = c * a * a;
    if (!dec(c, 3) || !dec(U0, 2) || Math.abs(y0) >= a || U0 > 3) return null;
    return { c, U0 };
  }
  const vxTxt = (U0, c) => `${fmt(U0)}-${fmt(c)}y^2`;
  M.add({
    id: '8-70', part: 5, chap: '8-10⑤ 例題4', stars: 1,
    title: '用水路の回転は $-\\dfrac{\\partial v_x}{\\partial y}$、風車はその半分',
    mark: '用水路、$\\vec v=(v_x(y),\\ 0)$、「風車の向きと角速度」。',
    futsu: ['マスのふちを1周して、上と下の辺の', '$v_x$ の差から循環を出し、面積でわって', '回転を出してから半分にする'],
    raku: ['$v_x=0.9-0.4y^2$ → 回転 $0.8y$', '$y=-1$ で $-0.8$ → 右回りに $0.4\\,\\mathrm{rad/s}$', '1回転 $\\dfrac{2\\pi}{0.4}=5\\pi\\,\\mathrm s$'],
    why: '$v_y=0$ なので、回転は $0-\\dfrac{\\partial v_x}{\\partial y}$ だけ（8-10⑤）。まん中より北（$y>0$）では、岸側（北）がおそいので、下の羽根が強く押されて左回り。南では右回り。まん中（$y=0$）は回らない。風車の角速度は回転の半分、1回転の時間は $\\dfrac{2\\pi}{\\omega}$。',
    caution: '回転の符号は $-\\dfrac{\\partial v_x}{\\partial y}$ のマイナスを忘れない。風車の角速度は回転の半分。1回転の時間は $\\pi$ を残した形を正とする（約の値は、文に書いた $\\pi$ の値で）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '34mm', s3: '34mm', trap: '12mm' },
    fits: fits70,
    steps: {
      // 回転を y の式で（2つの書き方）
      s1(r) {
        if (turn(r, '70s1', 2) === 0) {
          const c = r.pick([0.1, 0.2, 0.3, 0.5, 0.6, 1.5, 0.25, 0.05]), a = r.pick([1, 1.5, 2, 3]), U0 = c * a * a;
          if (c === 0.4 || !dec(U0, 3)) return null;
          return { q: `用水路の水の速度が $\\vec v=(${vxTxt(U0, c)},\\ 0)$〔$\\mathrm{m/s}$〕（岸は $y=\\pm${fmt(a)}$）。回転を $y$ の式で`,
            a: `$${cf(+fmt(2 * c), 'y')}$`, key: `70:${c},${a}`, easyCheck: false, easy: `$-\\dfrac{\\partial v_x}{\\partial y}=-(-${fmt(2 * c)}y)$`,
            calc: { kind: 'pdiff', op: 'rot', f: [`${U0}-${c}*y^2`, '0'], vars: ['x', 'y'] } };
        }
        const U0 = r.pick([0.6, 0.8, 1, 1.2, 1.5, 2]), a = r.pick([2, 3, 1.5]), k = 2 * U0 / (a * a);
        if (!dec(k, 3) || (U0 === 1.2 && a === 2)) return null;
        return { q: `はば $${U(fmt(2 * a), 'm')}$ の用水路（岸は $y=\\pm${fmt(a)}$）で、水の速度が $\\vec v=\\Bigl(${U0 === 1 ? "" : fmt(U0)}\\Bigl(1-\\dfrac{y^2}{${fmt(a * a)}}\\Bigr),\\ 0\\Bigr)$〔$\\mathrm{m/s}$〕。回転を $y$ の式で`,
          a: `$${cf(+fmt(k), 'y')}$`, key: `70b:${U0},${a}`, easyCheck: false, easy: `$v_x=${fmt(U0)}-${fmt(U0 / (a * a))}y^2$、$-\\dfrac{\\partial v_x}{\\partial y}$`,
          calc: { kind: 'pdiff', op: 'rot', f: [`${U0}*(1-y^2/${a * a})`, '0'], vars: ['x', 'y'] } };
      },
      // 風車の向きと角速度・1回転の時間（π を残す）
      s2(r) {
        const kind = turn(r, '70s2', 3), want = peek(r, '70s2w', 2) === 0 ? 1 : -1;
        const om = r.pick(OM70), y0 = want * r.pick([0.5, 1, 1.5, 2]), a = r.pick([1, 1.5, 2, 2.5, 3]), cn = canal(om, y0, a);
        if (!cn || (cn.c === 0.4) || (om === 0.4)) return null;
        const vx = vxTxt(cn.U0, cn.c), q0 = `用水路の水の速度が $\\vec v=(${vx},\\ 0)$〔$\\mathrm{m/s}$〕（岸は $y=\\pm${fmt(a)}$）。$y=${U(fmt(y0), 'm')}$ の所の風車`;
        if (kind < 2) {
          adv(r, '70s2w', 2);
          return { q: `${q0}の、回る向きと角速度`, a: `${y0 > 0 ? '左回り' : '右回り'}に $${U(fmt(om), 'rad/s')}$`, key: `70w:${vx}:${y0}`, easyCheck: false,
            easy: `回転 $${fmt(2 * cn.c)}y=${fmt(2 * cn.c * y0)}$ の半分`,
            verify: p => (near(numOf(p.a), Math.abs(rotNum((x, y) => [cn.U0 - cn.c * y * y, 0], 0, y0)) / 2, 1e-6) && p.a.startsWith(y0 > 0 ? '左回り' : '右回り')) || '風車がちがう' };
        }
        const T = 2 / om;   // π の何倍か
        if (!dec(T, 2)) return null;
        adv(r, '70s2w', 2);
        return { q: `${q0}が1回転する時間（$\\pi$ を残した形で）`, a: `$${U(cf(+fmt(T), '\\pi'), 's')}$`, key: `70T:${vx}:${y0}`, easyCheck: false,
          easy: `$\\omega=${fmt(om)}$、$\\dfrac{2\\pi}{${fmt(om)}}$`,
          verify: p => near(numOf(p.a), 2 * Math.PI / (Math.abs(rotNum((x, y) => [cn.U0 - cn.c * y * y, 0], 0, y0)) / 2), 1e-6) || '時間がちがう' };
      },
      // 1回転の時間の約の値（π=3.14 を文に。O-4・S-3）
      s3(r) {
        const want = peek(r, '70s3', 2) === 0 ? 1 : -1, om = r.pick([0.2, 0.25, 0.5, 0.8, 1, 2, 0.1]), y0 = want * r.pick([0.5, 1, 1.5]), a = r.pick([1, 2, 2.5, 3]);
        const cn = canal(om, y0, a); if (!cn || cn.c === 0.4) return null;
        const ap = (2 * 3.14 / om).toFixed(1), tr = (2 * Math.PI / om).toFixed(1);
        if (ap !== tr) return null;   // 文の値で計算した答えと、ほんとうの値の丸めがくいちがう組は出さない（O-4）
        adv(r, '70s3', 2);
        const T = +fmt(2 / om);
        return { q: `用水路の水の速度が $\\vec v=(${vxTxt(cn.U0, cn.c)},\\ 0)$〔$\\mathrm{m/s}$〕。$y=${U(fmt(y0), 'm')}$ の風車の回る向きと、1回転の時間（$\\pi=3.14$ として小数第1位まで）`,
          a: `${y0 > 0 ? '左回り' : '右回り'}、約 $${U(ap, 's')}$`, key: `70a:${cn.c},${a}:${y0}`, easyCheck: false,
          easy: `$\\omega=${fmt(om)}$、$${cf(T, '\\pi')}\\approx${ap}$`,
          verify: p => (near(numOf(p.a), +(2 * 3.14 / om).toFixed(1)) && p.a.startsWith(y0 > 0 ? '左回り' : '右回り') && /約/.test(p.a)) || '時間か向きがちがう' };
      },
      // わな：用水路の流れの発散 → 8-63（0）
      trap(r) {
        const c = r.pick([0.2, 0.3, 0.5, 0.6, 0.1]), a = r.pick([1, 2, 3]), U0 = c * a * a;
        if (!dec(U0, 3)) return null;
        return dest({ q: `用水路の流れ $\\vec v=(${vxTxt(U0, c)},\\ 0)$ の発散`, a: '$0$', key: `70t:${c},${a}`,
          calc: { kind: 'pdiff', op: 'div', f: [`${U0}-${c}*y^2`, '0'], vars: ['x', 'y'] } }, '8-70',
          '回転でなく発散。$v_x$ に $x$ がなく、$v_y=0$ なので、どちらの偏微分も0', ['8-63']);
      },
    },
  });

  // ================================================================ 8-71
  // 空間の回転：x 成分 ∂F_z/∂y − ∂F_y/∂z、文字を x→y→z→x とずらす。例 (2z, 3x, y) → (1, 2, 3) をよける（O-2）
  const fits71 = q => /回転|\\nabla\\times/.test(q) && nComp(q) === 3 && !/発散|回転台|\\omega/.test(q);
  M.add({
    id: '8-71', part: 5, chap: '8-10⑧ 例題5', stars: 1,
    title: '空間の回転は、$x$ 成分を作って文字を $x\\to y\\to z\\to x$ とずらす',
    mark: '$\\mathrm{rot}\\,\\vec F=\\nabla\\times\\vec F$、3つの成分の場。',
    futsu: ['3つの成分の式を、9つの偏微分', '$\\dfrac{\\partial F_x}{\\partial x}$ から $\\dfrac{\\partial F_z}{\\partial z}$ まで全部出してから、', '組み合わせを選んでひく'],
    raku: ['$(2z,\\ 3x,\\ y)$ → $x$ 成分 $1-0=1$', '$y$ 成分 $2-0=2$、$z$ 成分 $3-0=3$', '→ $(1,\\ 2,\\ 3)$（たして6にしない）'],
    why: '$x$ 成分は $\\dfrac{\\partial F_z}{\\partial y}-\\dfrac{\\partial F_y}{\\partial z}$（$x$ 軸のまわりの回り方。8-10⑧）。文字を $x\\to y\\to z\\to x$ と1つずつずらすと、$y$ 成分 $\\dfrac{\\partial F_x}{\\partial z}-\\dfrac{\\partial F_z}{\\partial x}$、$z$ 成分 $\\dfrac{\\partial F_y}{\\partial x}-\\dfrac{\\partial F_x}{\\partial y}$（平面の回転と同じ）。外積 $\\nabla\\times\\vec F$ の形（行列式の形）でも覚えられる。',
    caution: '3次元の回転は矢印（成分の組）。成分をたして数にしない。行列式の形で計算するときも、偏微分の記号は成分の左に（$\\dfrac{\\partial F_z}{\\partial y}$）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '36mm', s3: '30mm', trap: '12mm' },
    fits: fits71,
    steps: {
      // 1次の場（成分ごとに、ほかの文字1つ）
      s1(r) {
        const co = [0, 1, 2].map(() => r.pick([1, 2, 3, 4, -1, -2, -3])), vv = [0, 1, 2].map(i => r.pick([0, 1, 2].filter(j => j !== i)));
        const V = [0, 1, 2].map(i => [[co[i], ...[0, 1, 2].map(j => (j === vv[i] ? 1 : 0))]]);
        const R = [pnorm([...pd(V[2], 1), ...pd(V[1], 2).map(([c, ...e]) => [-c, ...e])]), pnorm([...pd(V[0], 2), ...pd(V[2], 0).map(([c, ...e]) => [-c, ...e])]), pnorm([...pd(V[1], 0), ...pd(V[0], 1).map(([c, ...e]) => [-c, ...e])])];
        const ans = R.map(t => pval(t, [0, 0, 0]));
        const txt = P3(...V.map(ptex));
        if (ans.filter(v => v !== 0).length < 2 || ['1,2,3', '1,1,1'].includes(absKey(ans)) || txt === P3('2z', '3x', 'y')) return null;
        return { q: `$\\vec F=${txt}$ の回転`, a: `$${P3(...ans)}$`, key: `71:${txt}`, easyCheck: false,
          easy: `$x$ 成分 $${ptex(pd(V[2], 1))}-${par(pval(pd(V[1], 2), [0, 0, 0]))}$ から、文字をずらす`,
          calc: { kind: 'pdiff', op: 'rot', f: V.map(pcalc), vars: ['x', 'y', 'z'] } };
      },
      // 多項式の場（答えは成分が式の矢印）
      s2(r) {
        const mono = () => { const e = [0, 0, 0]; e[r.int(0, 2)]++; e[r.int(0, 2)]++; return [r.pick([1, 1, 2, -1, 3]), ...e]; };
        const V = [0, 1, 2].map(() => pnorm([mono()]));
        const R = [pnorm([...pd(V[2], 1), ...pd(V[1], 2).map(([c, ...e]) => [-c, ...e])]), pnorm([...pd(V[0], 2), ...pd(V[2], 0).map(([c, ...e]) => [-c, ...e])]), pnorm([...pd(V[1], 0), ...pd(V[0], 1).map(([c, ...e]) => [-c, ...e])])];
        if (R.filter(t => t.length).length < 2) return null;
        const txt = P3(...V.map(ptex)), ans = P3(...R.map(ptex));
        if (ans.length > 34) return null;   // 答えを短く（U-1）
        return { q: `$\\vec F=${txt}$ の回転`, a: `$${ans}$`, key: `71p:${txt}`, easyCheck: false,
          easy: `$x$ 成分 $\\dfrac{\\partial F_z}{\\partial y}-\\dfrac{\\partial F_y}{\\partial z}=${ptex(R[0])}$`,
          calc: { kind: 'pdiff', op: 'rot', f: V.map(pcalc), vars: ['x', 'y', 'z'] } };
      },
      // 点の値（∇× の書き方）・勾配の場（0の矢印）
      s3(r) {
        if (turn(r, '71s3', 3) === 0) {
          // f = a x^p y^q z^s の勾配の場：回転は0の矢印
          const a = r.pick([1, 2, 3]), e = [r.int(1, 2), r.int(1, 2), r.int(0, 1)], f = [[a, ...e]];
          const V = [0, 1, 2].map(i => pd(f, i)), txt = P3(...V.map(t => ptex(t) || '0'));
          if (!once(r, '71z', 0, 1)) return null;
          return { q: `$\\vec F=${txt}$ の回転`, a: `$${P3(0, 0, 0)}$`, key: `71g:${txt}`, easyCheck: false,
            easy: `$f=${ptex(f)}$ の勾配なので、回転は0の矢印`,
            calc: { kind: 'pdiff', op: 'rot', f: V.map(pcalc), vars: ['x', 'y', 'z'] } };
        }
        const mono = () => { const e = [0, 0, 0]; e[r.int(0, 2)]++; e[r.int(0, 2)]++; return [r.pick([1, 2, -1]), ...e]; };
        const V = [0, 1, 2].map(() => pnorm([mono()]));
        const R = [pnorm([...pd(V[2], 1), ...pd(V[1], 2).map(([c, ...e]) => [-c, ...e])]), pnorm([...pd(V[0], 2), ...pd(V[2], 0).map(([c, ...e]) => [-c, ...e])]), pnorm([...pd(V[1], 0), ...pd(V[0], 1).map(([c, ...e]) => [-c, ...e])])];
        const pt = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], ans = R.map(t => pval(t, pt));
        if (ans.filter(v => v !== 0).length < 2 || ans.join() === '1,2,3') return null;
        const txt = P3(...V.map(ptex));
        return { q: `$\\vec F=${txt}$ の、点 $${P3(...pt)}$ での $\\nabla\\times\\vec F$`, a: `$${P3(...ans)}$`, key: `71n:${txt}:${pt}`, easyCheck: false,
          easy: `$\\nabla\\times\\vec F=${P3(...R.map(t => ptex(t)))}$ に代入`,
          calc: { kind: 'pdiff', op: 'rot', f: V.map(pcalc), vars: ['x', 'y', 'z'], at: pt } };
      },
      // わな：回転の発散 → 8-73（いつも0）
      trap(r) {
        const co = [0, 1, 2].map(() => r.pick([1, 2, 3, -1, -2, 4])), o = r.int(0, 1);
        const txt = o === 0 ? P3(cf(co[0], 'xy'), cf(co[1], 'yz'), cf(co[2], 'zx')) : P3(cf(co[0], 'z^2'), cf(co[1], 'x^2'), cf(co[2], 'y^2'));
        return dest({ q: `$\\vec F=${txt}$ の回転 $\\mathrm{rot}\\,\\vec F$ の、発散`, a: '$0$', key: `71t:${o}:${co}`,
          verify: p => near(numOf(p.a), 0) || '0 でない' }, '8-71',
          '回転の矢印の発散は、計算しなくても0（$\\mathrm{div}\\,(\\mathrm{rot}\\,\\vec F)=0$）', ['8-73']);
      },
    },
  });

  // ================================================================ 8-72
  // 全体がいっしょに回る流れ ω(−y, x)：回転 2ω。T 秒で1回転なら ω = 2π/T、回転 4π/T。空間では rot(ω×r) = 2ω
  const piFrac = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; const top = `${n === 1 ? '' : n === -1 ? '-' : n}\\pi`; return d === 1 ? top : `\\dfrac{${n === 1 ? '' : n}\\pi}{${d}}`; };
  const cross = (w, x, y, z) => [w[1] * z - w[2] * y, w[2] * x - w[0] * z, w[0] * y - w[1] * x];
  const crossTxt = w => { const t = [[[w[1], 'z'], [-w[2], 'y']], [[w[2], 'x'], [-w[0], 'z']], [[w[0], 'y'], [-w[1], 'x']]]; return t.map(lin); };
  const fits72 = q => /回転台|ドラム|いっしょに回|\\vec\\omega/.test(q) && !/発散/.test(q);
  M.add({
    id: '8-72', part: 5, chap: '8-10⑦⑧ 例題6', stars: 1,
    title: '全体がいっしょに回る流れは、回転 $2\\omega$（風車は $\\omega$）',
    mark: '回転台・ドラム、$\\omega(-y,\\ x)$、$\\vec\\omega\\times\\vec r$。',
    futsu: ['速度 $\\vec v=\\omega(-y,\\ x)$（空間なら外積 $\\vec\\omega\\times\\vec r$）を', '成分で書き、回転の式で', '1つずつ偏微分する'],
    raku: ['$10\\,\\mathrm s$ で1回転 → $\\omega=\\dfrac{2\\pi}{10}=\\dfrac{\\pi}{5}$', '→ 回転 $2\\omega=\\dfrac{2\\pi}{5}$', '$\\vec\\omega=(0,\\ 0,\\ 3)$ → $\\vec v=(-3y,\\ 3x,\\ 0)$、回転 $(0,\\ 0,\\ 6)$'],
    why: '$\\vec v=\\omega(-y,\\ x)$ では、$\\dfrac{\\partial v_y}{\\partial x}=\\omega$、$\\dfrac{\\partial v_x}{\\partial y}=-\\omega$ で、たての2辺の分と横の2辺の分が同じだけ効き、回転は $2\\omega$（8-10⑦）。水にうかべた風車は、回転の半分の $\\omega$ で、水といっしょに回る。空間でも $\\mathrm{rot}\\,(\\vec\\omega\\times\\vec r)=2\\vec\\omega$（8-10⑧）。',
    caution: '回転は $\\omega$ でなく $2\\omega$。1回転は $2\\pi\\,\\mathrm{rad}$：$T$ 秒で1回転なら $\\omega=\\dfrac{2\\pi}{T}$、1分に $n$ 回転なら $\\omega=\\dfrac{2\\pi n}{60}$。答えは $\\pi$ を残した形。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '26mm', s3: '28mm', trap: '12mm' },
    boxh: { s1: '11mm', s2: '11mm' },
    fits: fits72,
    steps: {
      // T 秒で1回転 → 回転
      s1(r) {
        const T = r.pick([2, 3, 4, 5, 6, 8, 12, 15, 20, 30, 40, 16]);
        if (T === 10 || !once(r, '72s1', T, 1)) return null;
        return { q: `回転台が $${U(T, 's')}$ で1回転し、台の上の水がいっしょに回る。水の流れの回転`, a: `$${U(piFrac(4, T), '1/s')}$`, key: `72:${T}`, easyCheck: false,
          easy: `$\\omega=${piFrac(2, T)}$、$2\\omega$`,
          verify: p => near(numOf(p.a), rotNum((x, y) => [-(2 * Math.PI / T) * y, (2 * Math.PI / T) * x], 0.4, 0.9), 1e-6) || '回転がちがう' };
      },
      // 1分に n 回転・ω の矢印から回転・回転から1回転の時間
      s2(r) {
        const kind = turn(r, '72s2', 3);
        if (kind === 0) {
          const n = r.pick([30, 45, 60, 90, 120, 600, 1200, 1500]);
          return { q: `ドラムが1分に $${n}$ 回転し、中の水がいっしょに回る。水の流れの回転`, a: `$${U(piFrac(4 * n, 60), '1/s')}$`, key: `72n:${n}`, easyCheck: false,
            easy: `$\\omega=\\dfrac{2\\pi\\times${n}}{60}=${piFrac(2 * n, 60)}$、$2\\omega$`,
            verify: p => near(numOf(p.a), 2 * (2 * Math.PI * n / 60), 1e-9) || '回転がちがう' };
        }
        if (kind === 1) {
          const w = [r.pick([0, 0, 1, 2, -1]), r.pick([0, 1, 2, -2]), r.pick([1, 2, 4, 5, -2])];
          if (w[0] === 0 && w[1] === 0 && w[2] === 3) return null;
          const v = crossTxt(w);
          return { q: `全体が $\\vec\\omega=${P3(...w)}$〔$\\mathrm{rad/s}$〕でいっしょに回る流れ $\\vec v=\\vec\\omega\\times\\vec r$ の回転`, a: `$${P3(...w.map(c => 2 * c))}$`, key: `72w:${w}`, easyCheck: false,
            easy: `$2\\vec\\omega$（$\\vec v=${P3(...v)}$）`,
            calc: { kind: 'pdiff', op: 'rot', f: v.map(t => t.replace(/(\d)([xyz])/g, '$1*$2')), vars: ['x', 'y', 'z'] } };
        }
        const k = r.pick([1, 2, 4, 8, 0.5, 0.4]), rot = k * Math.PI;   // 回転 kπ → ω = kπ/2 → 1回転 4/k 秒
        const T = 4 / k;
        return { q: `回転台の上で、いっしょに回る水の流れの回転が $${U(cf(k, '\\pi'), '1/s')}$。1回転にかかる時間`, a: `$${U(fmt(T), 's')}$`, key: `72T:${k}`, easyCheck: false,
          easy: `$\\omega=\\dfrac{${cf(k, '\\pi')}}{2}$、$\\dfrac{2\\pi}{\\omega}$`,
          verify: p => near(numOf(p.a), 2 * Math.PI / (rot / 2)) || '時間がちがう' };
      },
      // 成分で書いた速度から（いっしょに回る流れと見ぬく）
      s3(r) {
        const w = [r.pick([0, 1, 2, -1]), r.pick([0, 1, -2, 2]), r.pick([0, 1, 3, -1])];
        if (w.filter(c => c !== 0).length < 2) return null;
        const v = crossTxt(w);
        return { q: `$\\vec v=${P3(...v)}$ は、全体がいっしょに回る流れ。回転と、そこに置いた小さな風車の角速度の矢印`, a: `$${P3(...w.map(c => 2 * c))}$、$${P3(...w)}$`, key: `72v:${w}`, easyCheck: false,
          easy: `$\\vec\\omega=${P3(...w)}$、回転は $2\\vec\\omega$`,
          calc: { kind: 'pdiff', op: 'rot', f: v.map(t => t.replace(/(\d)([xyz])/g, '$1*$2')), vars: ['x', 'y', 'z'], ans: P3(...w.map(c => 2 * c)) },
          verify: p => { const m = maths(p.a); const a = M.readVec(m[0]), b = M.readVec(m[1] || ''); return (a && b && b.every((c, i) => near(M.evalMath(c, {}), w[i])) && a.every((c, i) => near(M.evalMath(c, {}), 2 * w[i]))) || '風車の矢印がちがう'; } };
      },
      // わな：回転台の水の流れの発散 → 8-63（0）
      trap(r) {
        const c = r.pick([2, 3, 4, 5, 0.5]);
        return dest({ q: `回転台の上で水がいっしょに回る流れ $\\vec v=${fmt(c)}(-y,\\ x)$ の発散`, a: '$0$', key: `72t:${c}`,
          calc: { kind: 'pdiff', op: 'div', f: [`-${c}*y`, `${c}*x`], vars: ['x', 'y'] } }, '8-72',
          '回転でなく発散。$v_x$ を $x$ で、$v_y$ を $y$ で偏微分すると、どちらも0', ['8-63']);
      },
    },
  });

  // ================================================================ 8-73
  // 保存力：F = −grad U。U は「−F_x を x で積分」して、残りの y の式を F_y で決める（定数は0にとる。V-6）。例 F=(2x+3y, 3x) → U=−x²−3xy をよける
  // f（ポテンシャル）を作り、F = grad f、U = −f
  const fits73 = q => /保存力|位置エネルギー|\$U\$|\\mathrm\{grad\}\\,f|\\mathrm\{rot\}\\,\(\\mathrm\{grad\}/.test(q);
  const POT = [[1, 2, 0, 0], [1, 1, 1, 0], [1, 0, 2, 0], [1, 2, 1, 0], [1, 1, 2, 0], [1, 1, 0, 0], [1, 0, 1, 0], [1, 3, 0, 0], [1, 0, 3, 0]];
  function genPot(r) {
    for (let k = 0; k < 50; k++) {
      const n = r.int(2, 3), ts = r.shuffle(POT).slice(0, n).map(([, ...e]) => [r.pick([1, 2, 3, -1, -2, 4]), ...e]);
      const f = pnorm(ts);
      if (!f.some(t => t[1] > 0 && t[2] > 0)) continue;   // xy をふくむ項がないと、成分が x だけ・y だけになる
      const Fx = pd(f, 0), Fy = pd(f, 1), U0 = pnorm(f.map(([c, ...e]) => [-c, ...e]));
      if (ptex(U0) === '-x^2-3xy') continue;
      return { f, Fx, Fy, U: U0 };
    }
    return null;
  }
  // U の答えを読んで、−grad U が F になるか（V-6。数の差分で）
  function Ucheck(p, Fx, Fy) {
    const s = maths(p.a).map(t => t.trim()).find(t => /^U=/.test(t)); if (!s) return 'U がない';
    const Ut = s.slice(2), Uf = (x, y) => M.evalMath(Ut, { x, y });
    for (const [x, y] of [[0.37, 0.83], [1.13, -0.61], [-0.7, 1.4]]) {
      const gx = -dnum(Uf, x, y, 'x'), gy = -dnum(Uf, x, y, 'y');
      if (!near(gx, pval(Fx, [x, y, 0]), 1e-6) || !near(gy, pval(Fy, [x, y, 0]), 1e-6)) return '$-\\mathrm{grad}\\,U$ が力にならない';
    }
    return true;
  }
  M.add({
    id: '8-73', part: 5, chap: '8-10⑩ 例題7・例題8', stars: 1,
    title: '回転が0なら保存力：$U$ は $-F_x$ を積分して作る',
    mark: '「保存力か」「$U$ を作ろう」、$\\mathrm{rot}\\,(\\mathrm{grad}\\,f)$。',
    futsu: ['2つの道（右へ行ってから上へ、上へ行ってから右へ）で', '線積分を1つずつ計算して、仕事が', '同じかどうかをくらべる'],
    raku: ['$(2x+3y,\\ 3x)$ → 回転 $3-3=0$（保存力）', '$U=-x^2-3xy+g(y)$、$3x-g\'(y)=3x$ → $g=0$', '$(0,\\ 0)\\to(1,\\ 1)$ の仕事 $0-(-4)=4\\,\\mathrm J$'],
    why: '回転が0の力は、すきまのない広がりの中では $\\vec F=-\\mathrm{grad}\\,U$ と書ける（8-10⑩ もっと）。$-\\dfrac{\\partial U}{\\partial x}=F_x$ を、$y$ を止めて $x$ で積分すると、$U$ は「$y$ だけの式 $g(y)$」のぶんだけ決まらない。それを $-\\dfrac{\\partial U}{\\partial y}=F_y$ で決める。仕事は $U(\\text{はじめ})-U(\\text{おわり})$。反対に $\\mathrm{grad}\\,f$ の回転と、$\\mathrm{rot}\\,\\vec F$ の発散は、計算しなくても0。',
    caution: '$U$ の定数は0にとる（定数をたしてもよい）。$U$ は $-F$ の積分（マイナスを忘れない）。回転が0でない力（$(-y,\\ x)$ など）では $U$ は作れず、仕事は道によってちがう。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '44mm', s3: '24mm', trap: '40mm' },
    fits: fits73,
    steps: {
      // U を作る
      s1(r) {
        const g = genPot(r); if (!g) return null;
        const txt = P(ptex(g.Fx), ptex(g.Fy)), Ut = ptex(g.U);
        if (Ut.length > 22) return null;
        return { q: `保存力 $\\vec F=${txt}$ の位置エネルギー $U$（$\\vec F=-\\mathrm{grad}\\,U$。定数は0に）`, a: `$U=${Ut}$`, key: `73:${txt}`, easyCheck: false,
          easy: `$-F_x$ を $x$ で積分して、$g(y)$ を $F_y$ で決める`,
          verify: p => Ucheck(p, g.Fx, g.Fy) };
      },
      // 保存力か（保存力なら U も）
      s2(r) {
        const yes = peek(r, '73s2', 2) === 0, g = genPot(r); if (!g) return null;
        let Fx = g.Fx, Fy = g.Fy;
        if (!yes) { const c = r.pick([1, 2, -1, 3]); if (r.chance(0.5)) Fx = pnorm([...Fx, [c, 0, 1, 0]]); else Fy = pnorm([...Fy, [c, 1, 0, 0]]); }
        const R = pnorm([...pd(Fy, 0), ...pd(Fx, 1).map(([c, ...e]) => [-c, ...e])]);
        if ((R.length === 0) !== yes) return null;
        const txt = P(ptex(Fx), ptex(Fy)), Ut = ptex(g.U);
        if (yes && Ut.length > 20) return null;
        adv(r, '73s2', 2);
        return { q: `力 $\\vec F=${txt}$ は保存力か。保存力なら $U$ も（定数は0に）`, a: yes ? `保存力、$U=${Ut}$` : `保存力でない（回転 $${ptex(R)}$）`, key: `73:${txt}`, easyCheck: false,
          easy: `回転 $${ptex(pd(Fy, 0)) || '0'}-(${ptex(pd(Fx, 1)) || '0'})$`,
          verify: p => { const rr = rotNum((x, y) => [pval(Fx, [x, y, 0]), pval(Fy, [x, y, 0])], 0.7, -0.4); return (Math.abs(rr) < 1e-6 ? (p.a.startsWith('保存力、') ? Ucheck(p, Fx, Fy) : '保存力なのに') : (p.a.startsWith('保存力でない') || '保存力でないのに')); } };
      },
      // U の差で仕事・grad f の回転
      s3(r) {
        if (turn(r, '73s3', 3) === 0) {
          if (!once(r, '73z', 0, 1)) return null;
          const f = pnorm([[r.pick([1, 2, 3]), r.int(1, 3), r.int(1, 2), 0], [r.pick([1, -1, 2]), r.int(0, 2), r.int(0, 2), 0]]);
          if (f.length < 2 || !f.every(t => t[1] + t[2] > 0)) return null;
          return { q: `$f=${ptex(f)}$ の $\\mathrm{grad}\\,f$ の回転`, a: '$0$', key: `73g:${ptex(f)}`, easyCheck: false, easy: '$\\mathrm{rot}\\,(\\mathrm{grad}\\,f)$ は計算しなくても0',
            calc: { kind: 'pdiff', op: 'rot', f: [pcalc(pd(f, 0)), pcalc(pd(f, 1))], vars: ['x', 'y'] } };
        }
        const g = genPot(r); if (!g) return null;
        const A = [r.int(-1, 1), r.int(-1, 1)], B = [r.int(0, 2), r.int(-1, 2)];
        if (A[0] === B[0] && A[1] === B[1]) return null;
        const W = pval(g.U, [...A, 0]) - pval(g.U, [...B, 0]);
        if ((A[0] === 0 && A[1] === 0 && B[0] === 1 && B[1] === 1 && W === 4) || W === 0 || W === 4) return null;
        const txt = P(ptex(g.Fx), ptex(g.Fy));
        return { q: `保存力 $\\vec F=${txt}$〔$\\mathrm N$〕で、点 $${P(...A)}$ から点 $${P(...B)}$〔$\\mathrm m$〕まで動かすときの仕事`, a: `$${U(fmt(W), 'J')}$`, key: `73w:${txt}:${A}:${B}`, easyCheck: false,
          easy: `$U=${ptex(g.U)}$、$U(\\text{はじめ})-U(\\text{おわり})$`,
          calc: { kind: 'line', path: [[...A], [B[0], A[1]], [...B]], F: [pcalc(g.Fx), pcalc(g.Fy)], ans: fmt(W) } };
      },
      // わな：保存力でない力の、道A・道B の仕事 → 8-45
      trap(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, 4]), X = r.pick([1, 2]), Y = r.pick([1, 2]);
        // F = (−a y, b x)。道A：(0,0)→(X,0)→(X,Y)、道B：(0,0)→(0,Y)→(X,Y)
        const wA = b * X * Y, wB = -a * X * Y, F = [`-${a}*y`, `${b}*x`];
        return dest({ q: `力 $\\vec F=${P(cf(-a, 'y'), cf(b, 'x'))}$〔$\\mathrm N$〕の、道A $(0,\\ 0)\\to${P(X, 0)}\\to${P(X, Y)}$ と、道B $(0,\\ 0)\\to${P(0, Y)}\\to${P(X, Y)}$ での仕事`,
          a: `道A $${U(wA, 'J')}$、道B $${U(wB, 'J')}$`, key: `73t:${a},${b},${X},${Y}`,
          verify: p => { const e1 = [], e2 = []; const ms = maths(p.a).map(noUnit); M.calcKinds.line({ path: [[0, 0], [X, 0], [X, Y]], F }, p, ms[0], e1); M.calcKinds.line({ path: [[0, 0], [0, Y], [X, Y]], F }, p, ms[1], e2); return (!e1.length && !e2.length) || e1.concat(e2).join(' / '); } }, '8-73',
          '回転が0でないので保存力でなく、$U$ は作れない。道ごとに線積分する', ['8-45']);
      },
    },
  });

  // ================================================================ 8-74
  // まっすぐな電流の磁場 B = μ0 I/(2π r) = 2×10⁻⁷ I/r。向きは e_z × e_r。導線の中の回転 μ0 j = 4×10⁻⁷ I/a²
  // 数 v を「a×10^n」の TeX に（a は小数2けたまで）。だめなら null
  function sci(v) {
    if (v === 0) return '0';
    const n = Math.floor(Math.log10(Math.abs(v)) + 1e-9), a = +(v / 10 ** n).toFixed(6);
    if (!dec(a, 2)) return null;
    return n === 0 ? fmt(a) : `${fmt(a)}\\times10^{${n}}`;
  }
  const MU = '$\\mu_0=4\\pi\\times10^{-7}\\,\\mathrm{T\\cdot m/A}$';
  const fits74 = q => /導線/.test(q) && /磁場|回転/.test(q) && !/の所の磁場/.test(q);
  const DIR = { '1,0': '$x$ の正の向き', '-1,0': '$x$ の負の向き', '0,1': '$y$ の正の向き', '0,-1': '$y$ の負の向き' };
  M.add({
    id: '8-74', part: 5, chap: '8-10⑪ 例題9', stars: 1,
    title: 'まっすぐな電流の磁場 $B=\\dfrac{\\mu_0I}{2\\pi r}$、向きは $\\vec e_z\\times\\vec e_r$',
    mark: '導線・電流、「□ cm はなれた点の磁場」。',
    futsu: ['$\\mu_0=4\\pi\\times10^{-7}$ と $2\\pi r$ を', '小数にしてから、わり算をし、', '向きは右ねじの絵をかいて決める'],
    raku: ['$10\\,\\mathrm A$、点 $(0.04,\\ 0,\\ 0)$ → $B=\\dfrac{4\\pi\\times10^{-7}\\times10}{2\\pi\\times0.04}$', '$=5\\times10^{-5}\\,\\mathrm T$、向き $\\vec e_z\\times\\vec e_x=\\vec e_y$', '導線の外の回転は $\\vec 0$'],
    why: '$\\mu_0=4\\pi\\times10^{-7}$ の $\\pi$ と $2\\pi r$ の $\\pi$ が約分されて、$B=\\dfrac{2\\times10^{-7}\\,I}{r}$（8-10⑪）。向きは、電流の向き $\\vec e_z$ と、導線から点への向き $\\vec e_r$ の外積 $\\vec e_z\\times\\vec e_r$（右ねじの向き）。導線の外の磁場はうずなし流れと同じ形で、回転は $\\vec 0$。導線の中では、回転は $\\mu_0j$（$j=\\dfrac{I}{\\pi a^2}$）。',
    caution: '$r$ は m に直す（$4\\,\\mathrm{cm}=0.04\\,\\mathrm m$、$1\\,\\mathrm{mm}=0.001\\,\\mathrm m$）。$\\vec e_z\\times\\vec e_x=\\vec e_y$、$\\vec e_z\\times\\vec e_y=-\\vec e_x$。電流が $z$ の負の向きなら、向きは反対。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '44mm', s3: '22mm', trap: '24mm' },
    fits: fits74,
    steps: {
      // 大きさ
      s1(r) {
        const I = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]), rc = r.pick([1, 2, 4, 5, 8, 10, 20, 25, 40, 50]);
        const B = 2e-7 * I / (rc / 100), s = sci(B);
        if (!s || Math.abs(B - 5e-5) < 1e-12 || (I === 10 && rc === 4) || !once(r, '74s1', s, 1)) return null;
        return { q: `まっすぐな導線に $${U(I, 'A')}$ の電流が流れている。導線から $${U(rc, 'cm')}$ はなれた点の磁場の大きさ（${MU}）`, a: `$${U(s, 'T')}$`, key: `74:${I},${rc}`, easyCheck: false,
          easy: `$\\dfrac{2\\times10^{-7}\\times${I}}{${fmt(rc / 100)}}$`,
          verify: p => near(numOf(p.a), 4 * Math.PI * 1e-7 * I / (2 * Math.PI * rc / 100), 1e-9) || '大きさがちがう' };
      },
      // 大きさと向き（点が軸の上、電流の向きも）
      s2(r) {
        const k = peek(r, '74s2', 4), e = [[1, 0], [0, 1], [-1, 0], [0, -1]][k], up = r.chance(0.7);
        const I = r.pick([2, 4, 5, 10, 20, 15, 6]), rc = r.pick([1, 2, 4, 5, 10, 20]), B = 2e-7 * I / (rc / 100), s = sci(B);
        if (!s || Math.abs(B - 5e-5) < 1e-12 || (I === 10 && rc === 4 && k === 0)) return null;
        adv(r, '74s2', 4);
        const pt = P3(fmt(e[0] * rc / 100), fmt(e[1] * rc / 100), 0), sg = up ? 1 : -1, d = [-e[1] * sg, e[0] * sg];   // e_z × e_r = (−e_y, e_x)
        return { q: `$z$ 軸の導線に、$z$ の${up ? '正' : '負'}の向きに $${U(I, 'A')}$ の電流が流れている。点 $${pt}$〔$\\mathrm m$〕の磁場の大きさと向き（${MU}）`,
          a: `$${U(s, 'T')}$、${DIR[d.map(fmt).join(',')]}`, key: `74d:${I},${rc},${k},${up}`, easyCheck: false,
          easy: `$${up ? '' : '-'}\\vec e_z\\times${P3(...e, 0)}$`,
          verify: p => { const c = cross([0, 0, sg], e[0], e[1], 0); return (near(numOf(p.a), 2e-7 * I / (rc / 100), 1e-9) && p.a.includes(DIR[[c[0], c[1]].map(fmt).join(',')])) || '大きさか向きがちがう'; } };
      },
      // 導線の中の回転 μ0 j
      s3(r) {
        const I = r.pick([2, 5, 10, 20, 4, 8, 15]), a = r.pick([0.5, 1, 2, 1.5]), v = 0.4 * I / (a * a);
        if (!dec(v, 2) || (I === 10 && a === 1) || !once(r, '74s3', v, 1)) return null;
        return { q: `半径 $${U(fmt(a), 'mm')}$ のまっすぐな導線に、$${U(I, 'A')}$ の電流が一様に流れている。導線の中の磁場の回転の大きさ（${MU}）`,
          a: `$${U(fmt(v), 'T/m')}$`, key: `74r:${I},${a}`, easyCheck: false,
          easy: `$\\mu_0j=4\\pi\\times10^{-7}\\times\\dfrac{${I}}{\\pi\\times(${fmt(a / 1000)})^2}$`,
          verify: p => near(numOf(p.a), 4 * Math.PI * 1e-7 * I / (Math.PI * (a / 1000) ** 2), 1e-9) || '回転がちがう' };
      },
      // わな：導線の中の点の磁場 → 8-77
      trap(r) {
        const I = r.pick([10, 20, 5, 8]), a = r.pick([2, 4, 5]), rr = r.pick([1, 2, 3].filter(x => x < a));
        const B = 2e-7 * I * (rr / 1000) / ((a / 1000) ** 2), s = sci(B); if (!s) return null;
        return dest({ q: `半径 $${U(a, 'mm')}$ の導線に $${U(I, 'A')}$ の電流が一様に流れている。導線の中で、中心から $${U(rr, 'mm')}$ の所の磁場の大きさ（${MU}）`,
          a: `$${U(s, 'T')}$`, key: `74t:${I},${a},${rr}`, verify: p => near(numOf(p.a), 4 * Math.PI * 1e-7 * I * (rr * rr / (a * a)) / (2 * Math.PI * rr / 1000), 1e-9) || '大きさがちがう' }, '8-74',
          '導線の中の点。かこむ電流は面積の割合 $I\\times\\dfrac{r^2}{a^2}$ だけ', ['8-77']);
      },
    },
  });

  // ================================================================ 8-95
  // 小さな箱（1辺 h、中心 P）の6つの面から出る量。場が2次式までなら、ちょうど 発散(P)×h³。例 (x², xy, −z)、P(3, 0, 0) → 8h³ をよける
  const fits95 = q => /箱/.test(q) && /面/.test(q) && /出る量|発散/.test(q) && !/球/.test(q);
  // 面ごとの出る量を数で（シンプソン、3×3 点。2次式まではちょうど）。V は成分の多項式、C は中心
  function boxFlux(V, C, h) {
    const S = [[-1, 1], [0, 4], [1, 1]];   // 点とおもみ（/6）
    let tot = 0;
    for (let i = 0; i < 3; i++) for (const sg of [1, -1]) {
      const o = [0, 1, 2].filter(j => j !== i);
      let acc = 0;
      for (const [u, wu] of S) for (const [w, ww] of S) { const pt = C.slice(); pt[i] += sg * h / 2; pt[o[0]] += u * h / 2; pt[o[1]] += w * h / 2; acc += wu * ww / 36 * pval(V[i], pt); }
      tot += sg * acc * h * h;
    }
    return tot;
  }
  M.add({
    id: '8-95', part: 5, chap: '8-9⑩ 例題6', stars: 1,
    title: '小さな箱の6つの面から出る量で発散を出す',
    mark: '点 P を中心とする1辺 $h$ の箱、「6つの面から出る量」。',
    futsu: ['6つの面それぞれで、外向きの成分を', '面の上で2重積分して（タイルに分けてたして）、', 'たし合わせる'],
    raku: ['$(x^2,\\ xy,\\ -z)$、点 $(3,\\ 0,\\ 0)$', '左右 $6h^3$、奥と手前 $3h^3$、上下 $-h^3$', '→ $\\dfrac{6h^3+3h^3-h^3}{h^3}=8$（$3x-1$ と同じ）'],
    why: '面の上で1次式で変わる成分は、平均がまん中の値になるので「まん中の値×面積 $h^2$」でよい（8-9⑩）。向かい合う面の組ごとに、外向きの成分（右・奥・上は $+$、左・手前・下は $-$）をたす。場が2次式までなら、箱の大きさによらず「発散×$h^3$」にちょうどなる。',
    caution: '左・手前・下の面では、外向きは負の向きなので、成分にマイナスをつける。面積は $h^2$、体積は $h^3$。$h$ でわるのは、体積の $h^3$。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '20mm' },
    fits: fits95,
    steps: {
      // 6つの面から出る量の合計（h の式）
      s1(r) {
        const V = [pnorm([[r.pick([1, 2, -1]), 2, 0, 0], [r.pick([0, 1, 3]), 0, 1, 0]]), pnorm([[r.pick([1, 2, -1, 3]), 1, 1, 0]]), pnorm([[r.pick([-1, 1, 2, -2]), 0, 0, 1], [r.pick([0, 1]), 1, 0, 0]])];
        const C = [r.int(-2, 4), r.int(-2, 3), r.int(-2, 2)], D = pval(pnorm([...pd(V[0], 0), ...pd(V[1], 1), ...pd(V[2], 2)]), C);
        const txt = P3(...V.map(ptex));
        if (D === 0 || D === 8 || (txt === P3('x^2', 'xy', '-z')) || !once(r, '95s1', D, 1)) return null;
        return { q: `$\\vec v=${txt}$ の中で、点 $${P3(...C)}$ を中心とする1辺 $h$ の箱の、6つの面から外へ出る量の合計`, a: `$${cf(D, 'h^3')}$`, key: `95:${txt}:${C}`, easyCheck: false,
          easy: `面の組ごとに「まん中の値の差×$h^2$」`,
          verify: p => [0.3, 0.7].every(h => near(numOf(p.a, 0, { h }), boxFlux(V, C, h), 1e-9)) || '出る量がちがう' };
      },
      // 1組の面だけ・発散
      s2(r) {
        const V = [pnorm([[r.pick([1, 2, -1]), 2, 0, 0]]), pnorm([[r.pick([1, 2, -1, 3]), 1, 1, 0], [r.pick([0, 2]), 0, 0, 1]]), pnorm([[r.pick([1, -2, 2]), 0, 0, 2]])];
        const C = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 2)], i = r.int(0, 2), nm = ['左右', '奥と手前', '上下'][i];
        const Di = pval(pd(V[i], i), C);
        const txt = P3(...V.map(ptex));
        if (Di === 0 || Di === 8 || !once(r, '95s2', Di, 1)) return null;
        return { q: `$\\vec v=${txt}$ の中で、点 $${P3(...C)}$ を中心とする1辺 $h$ の箱の、${nm}の2つの面から外へ出る量の和`, a: `$${cf(Di, 'h^3')}$`, key: `95p:${txt}:${C}:${i}`, easyCheck: false,
          easy: `${nm}の面のまん中の値の差×$h^2$`,
          verify: p => [0.3, 0.7].every(h => { const W = V.map((t, k) => (k === i ? t : [])); return near(numOf(p.a, 0, { h }), boxFlux(W, C, h), 1e-9); }) || '出る量がちがう' };
      },
      // 面ごとの数（L/s）から発散
      s3(r) {
        const h = r.pick([0.1, 0.2]), Lh = h === 0.1 ? 1 : 8;   // 体積 h³（L）
        const f = [0, 1, 2, 3, 4, 5].map(() => r.int(-30, 40) / 10), tot = f.reduce((a, b) => a + b, 0), d = tot / Lh;
        if (!dec(d, 2) || Math.abs(d) < 1e-9 || f.filter(v => v < 0).length < 1) return null;
        const nm = ['右', '左', '奥', '手前', '上', '下'];
        return { q: `1辺 $${U(fmt(h), 'm')}$ の小さな箱の6つの面から外へ出る量（$\\mathrm{L/s}$）は、${nm.map((n, k) => `${n} $${fmt(f[k])}$`).join('、')}。箱の中の発散`,
          a: `$${U(fmt(d), '/s')}$`, key: `95d:${h}:${f}`, easyCheck: false,
          easy: `合計 $${fmt(tot)}\\,\\mathrm{L/s}$ を体積 $${Lh}\\,\\mathrm L$ でわる`,
          verify: p => near(numOf(p.a), f.reduce((a, b) => a + b, 0) * 0.001 / h ** 3, 1e-9) || '発散がちがう' };
      },
      // わな：大きな球の面から出る量 → 8-75（ガウスの定理）
      trap(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, -1]), c = r.pick([1, 2, 3]), R = r.pick([1, 2, 3]), S = a + b + c;
        if (S <= 0) return null;
        const n = 4 * S * R ** 3;
        return dest({ q: `$\\vec v=${P3(cf(a, 'x'), cf(b, 'y'), cf(c, 'z'))}$ で、原点を中心とする半径 $${R}$ の球の面から外へ出る量`, a: `$${piFrac(n, 3)}$`, key: `95t:${a},${b},${c},${R}`,
          verify: p => near(numOf(p.a), S * 4 / 3 * Math.PI * R ** 3) || '出る量がちがう' }, '8-95',
          '小さな箱でなく、大きな球。発散が定数なので、発散×球の体積（ガウスの定理）', ['8-75']);
      },
    },
  });

})(globalThis.MONDAI);
