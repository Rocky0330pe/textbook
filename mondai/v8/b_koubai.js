/* 問題集 第8巻　第2部 全微分と勾配（わざ 8-16〜8-29、8-91）　組 b
 * 書き方は v8/README.md（第8・9巻の手引き）→ v6/README.md・v5/README.md・v4/README.md。文は教科書 第8巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 8-3・8-4 の数・ことば・記号にそろえる（主役の山 $h=100-0.01x^2-0.02y^2$、東の坂・北の坂、全微分 $\dd f$、連鎖律、ヤコビ行列 $J$・ヤコビアン $\det J$、
 *   $\dd\vec p=J\,\dd\vec\theta$、勾配 $\mathrm{grad}\,h$・$\nabla f$、方向微分（長さ1の矢印との内積）、等高線の向き、$\vec F=-\mathrm{grad}\,U$・$\vec E=-\mathrm{grad}\,\phi$・
 *   $\vec q=-k\,\mathrm{grad}\,T$、止めておく量 $\left(\dfrac{\partial p}{\partial T}\right)_V$）。用字は「距離」「ななめ」「はかる」「はば」（V-11）。
 * 答え：ベクトルは $(a,\ b)$・$(a,\ b,\ c)$ と横に（V-2）、ヤコビ行列は pmatrix。√ は残した形（$0.4\sqrt2$）。等高線の向き（8-26）は何倍でも・反対向きでも正、
 *   いちばん急な上りの向き（8-25）は長さ1の矢印だけを正（V-3）。高さの「変わる速さ」（8-19）は教科書のことば（V-7。O-3 の例外）。
 * 検算：偏微分・勾配は calc（pdiff）、成分の組は calc（vec）、ヤコビ行列は calc（mat。文字の行列は vars）。ずれの割合・角・近似の値・向きは verify(p) で、
 *   問題を作った計算とは別の道すじ（数の偏微分・ベクトルの内積・角の cos）で確かめる。
 * 近似値（V-4・O-4・S-3）：$\dfrac{1}{\sqrt2}=0.707$・$\sin45^{\circ}=0.707$・$1^{\circ}=0.0175\,\mathrm{rad}$ を文に書いたステップ3だけ。文の値で計算した答えと
 *   ほんとうの値を丸めた答えがくいちがう組は出さない（agree）。電卓なし：主役の山の点は、勾配が 3・4・5 の組などになる点を選ぶ。
 * 図はステップ3だけ（K-2）：8-20 は2本の腕、8-26 は主役の山の等高線（だ円）と点と grad の矢印（答えの等高線の向きはかかない）。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2・S-2・U-2。BAN）。1つのステップに同じ答えを3つ以上出さない（U-3。add）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7・U-4）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F;
  const D = x => (Array.isArray(x) ? x : F.fromDec(String(x)));          // 0.5 → [1, 2]
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const r9 = v => Math.round(v * 1e9) / 1e9;
  const nf = v => { const s = String(+(+r9(v)).toFixed(9)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const par = v => (String(v).startsWith('-') ? `(${v})` : String(v));     // かけ算の右の負の数はかっこごと
  const pn = v => par(nf(v));
  const vt = v => `(${v.map(x => (typeof x === 'string' ? x : nf(x))).join(',\\ ')})`;   // 横に書いたベクトル
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // 小数 v の正確な文字（分母が 2・5 だけ）
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
  // 文の値で計算した答え f（分数）と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4）。ちがえば null。
  //   丸める前の値が、けたの境（…5）にごく近いときも出さない（ほんとうの値と文の値のどちらで丸めるかで変わりうるので）
  const agree = (f, v, k) => { const a = roundStr(f, k); if (a !== trueRd(v, k)) return null; const w = Math.abs(v) * 10 ** k; return Math.abs(w - Math.floor(w) - 0.5) < 0.02 ? null : a; };
  // c√m の TeX（m は平方の因数のない整数。m=1 なら数だけ）
  const surd = (c, m) => (m === 1 || r9(c) === 0 ? nf(c) : (Math.abs(c) === 1 ? (c < 0 ? '-' : '') : nf(c)) + `\\sqrt${m < 10 ? m : '{' + m + '}'}`);
  // 2乗の和 S（小数）の √ を c√m の形に：{ c, m, tex, val }
  function rootOf(S) {
    let k = 0; while (k < 10 && Math.abs(S * 10 ** k - Math.round(S * 10 ** k)) > 1e-6) k++;
    if (k % 2) k++;
    const N = Math.round(S * 10 ** k), d = 10 ** (k / 2);
    let a = 1, m = N; for (let q = 2; q * q <= m; q++) while (m % (q * q) === 0) { m /= q * q; a *= q; }
    const c = r9(a / d);
    return { c, m, tex: surd(c, m), val: Math.sqrt(S) };
  }
  const dfr = f => (f[1] === 1 ? String(f[0]) : (f[0] < 0 ? '-' : '') + `\\dfrac{${Math.abs(f[0])}}{${f[1]}}`);   // 分数の TeX（答えの成分）
  const fx = f => (f[1] === 1 ? String(f[0]) : dec(f) || dfr(f));                                             // 小数で書けるなら小数

  // ---------------------------------------------------------------- 多項式（係数・べき）：P = [[係数, x のべき, y のべき, (z のべき)], …]
  function monoTeX(c, pw, names, first) {
    const body = pw.map((p, i) => (p === 0 ? '' : names[i] + (p === 1 ? '' : '^' + p))).join('');
    const a = Math.abs(c), cs = body && a === 1 ? '' : nf(a);
    return (c < 0 ? '-' : (first ? '' : '+')) + cs + body;
  }
  const polyTeX = (P, names) => { const T = P.filter(t => t[0] !== 0); return T.length ? T.map((t, i) => monoTeX(t[0], t.slice(1), names, i === 0)).join('') : '0'; };
  const polyD = (P, k) => P.filter(t => t[1 + k] > 0).map(t => { const u = t.slice(); u[0] = r9(t[0] * t[1 + k]); u[1 + k]--; return u; });
  const polyV0 = (P, xs) => P.reduce((s, t) => s + t[0] * t.slice(1).reduce((q, p, i) => q * xs[i] ** p, 1), 0);   // 丸めない（数の偏微分の検算用）
  const polyV = (P, xs) => r9(polyV0(P, xs));
  const nTerms = P => P.filter(t => t[0] !== 0).length;
  // 同じべきの項をまとめる（係数0の項は消す）。次数の高い順
  const combine = P => { const m = new Map(); P.forEach(t => { const k = t.slice(1).join(','); m.set(k, r9((m.get(k) || 0) + t[0])); }); return sortP([...m].filter(([, c]) => c !== 0).map(([k, c]) => [c, ...k.split(',').map(Number)])); };
  // 関数の数の偏微分（検算用：中心差分。問題を作った多項式の微分とは別の道すじ）
  const numD = (f, xs, k) => { const h = 1e-5, a = xs.slice(), b = xs.slice(); a[k] += h; b[k] -= h; return (f(a) - f(b)) / (2 * h); };

  // ---------------------------------------------------------------- 答えの読み方と検算の部品
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol || 1e-9)) || `答え ${p.a} が ${nf(v)} でない`; };
  // 答えの成分の組を数で
  const vecOf = a => { const m = String(a).match(/\$[^$]*\$/); const v = m && M.readVec(m[0]); return v ? v.map(t => ev(t)) : null; };
  const vecIs = (p, want, tol) => { const g = vecOf(p.a); return (g && g.length === want.length && g.every((x, i) => near(x, want[i], tol || 1e-9))) || `答え ${p.a} が ${vt(want.map(r9))} でない`; };

  // 主役の山（教科書 8-0⑦）
  const H = (x, y) => 100 - 0.01 * x * x - 0.02 * y * y;
  const gH = (x, y) => [r9(-0.02 * x), r9(-0.04 * y)];
  const MT = '$h=100-0.01x^2-0.02y^2$';
  const PT = (x, y) => `$(${x},\\ ${y})$`;
  // 東・西・南・北へ進む文（dx・dy は符号つき。0 は書かない）
  const moveTxt = (dx, dy) => [dx ? `${dx > 0 ? '東' : '西'}へ ${U(nf(Math.abs(dx)), 'm')}` : '', dy ? `${dy > 0 ? '北' : '南'}へ ${U(nf(Math.abs(dy)), 'm')}` : ''].filter(Boolean).join('、');

  // ---------------------------------------------------------------- 同じ答えを出しすぎない（U-3・第41回）
  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない。アプリで同じわざを多く出すとき（ok が20問をこえたら）は、よけない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  const normA = a => String(a).replace(/\s|\\,|\\ /g, '');
  // EX：左ページの例（楽な形）と同じ答え。ステップ1〜3に出さない（O-2・U-2）
  const exNorm = s => normA(String(s).replace(/^約\s*/, '').replace(/\$/g, ''));
  const EXANS = {
    '8-16': ['0.5', '0.08'], '8-17': ['5', '6', '4'], '8-18': ['3', '5'], '8-19': ['1.2'], '8-21': ['0.0375', '-0.075', '0'],
    '8-22': ['(-0.005,\\ 0.012)'], '8-23': ['0.5', '(0.3,\\ 0.4)', '(-0.3,\\ -0.4)'], '8-24': ['-0.6', '-0.1\\sqrt2'], '8-25': ['(-0.6,\\ -0.8)'],
    '8-26': ['(4,\\ 1)', '0.25'], '8-27': ['(4,\\ 4,\\ 2)', '6'], '8-28': ['(-6,\\ -8)', '10', '(-300,\\ 400)', '(48,\\ -64)', '80'],
    '8-29': ['60^{\\circ} と 300^{\\circ}', '90^{\\circ} と 270^{\\circ}'], '8-91': ['1000'],
  };
  function add(def) {
    const ex = new Set((EXANS[def.id] || []).map(exNorm));
    for (const k of ['s1', 's2', 's3', 'trap']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => { const p = f(r); if (!p) return p; if (k !== 'trap' && ex.has(exNorm(p.a))) return null; return ansOK(r, def.id + k, normA(p.ans || p.a), 2, p.key || p.q) ? p : null; };
    }
    M.add(def);
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部・巻のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(8).filter(id => {
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

  // ================================================================ 8-16
  const SL16 = [-1.2, -1, -0.8, -0.6, -0.5, -0.4, -0.3, -0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2];
  const MV16 = [0.1, 0.2, 0.3, 0.4, 0.5, 1];
  const sgnR = r => (r.chance(0.5) ? 1 : -1);
  // 項の順：次数の高い順、同じなら x のべきの高い順（$x^2y+3y$）
  const sortP = P => P.sort((a, b) => b.slice(1).reduce((s, v) => s + v, 0) - a.slice(1).reduce((s, v) => s + v, 0) || b[1] - a[1] || b[2] - a[2]);
  // 2つの変数の多項式（1つか2つの項。x と y の両方が出る）
  const PW2 = [[2, 1], [1, 2], [3, 1], [1, 3], [2, 2], [1, 1], [3, 0], [0, 3], [2, 0], [0, 2], [1, 0], [0, 1]];
  function poly2(r) {
    for (let t = 0; t < 30; t++) {
      const n = r.chance(0.5) ? 1 : 2, P = [];
      for (let k = 0; k < n; k++) { const [a, b] = r.pick(n === 1 ? PW2.slice(0, 6) : PW2); P.push([r.pick([1, 1, 2, 3, -1, -2]), a, b]); }
      if (n === 2 && P[0][1] === P[1][1] && P[0][2] === P[1][2]) continue;
      if (!P.some(t2 => t2[1] > 0 && t2[2] > 0) || !P.some(t2 => t2[1] > 0) || !P.some(t2 => t2[2] > 0)) continue;
      sortP(P);
      if (P[0][0] < 0) continue;   // はじめの項は正
      return P;
    }
    return null;
  }
  // 3つの変数の多項式（1つか2つの項。x・y・z が出る）
  const PW3 = [[1, 1, 1], [2, 1, 1], [1, 2, 1], [1, 1, 2], [2, 0, 1], [0, 2, 1], [1, 2, 0], [2, 1, 0], [1, 0, 2], [0, 1, 2], [0, 0, 2], [0, 0, 1], [2, 0, 0], [0, 2, 0]];
  function poly3(r) {
    for (let t = 0; t < 40; t++) {
      const n = r.chance(0.4) ? 1 : 2, P = [];
      for (let k = 0; k < n; k++) { const [a, b, c] = r.pick(n === 1 ? PW3.slice(0, 4) : PW3); P.push([r.pick([1, 1, 2, 3, -1, -2]), a, b, c]); }
      if (n === 2 && P[0].slice(1).join() === P[1].slice(1).join()) continue;
      sortP(P);
      if ([1, 2, 3].some(k => !P.some(u => u[k] > 0)) || P[0][0] < 0) continue;
      return P;
    }
    return null;
  }
  // 全微分の項 「…\,\dd x」（項が2つ以上ならかっこ）
  const dTerm = (P, v, first) => { const t = polyTeX(P, ['x', 'y', 'z']); if (t === '0') return ''; const one = t === '1' ? '' : t === '-1' ? '-' : t; const body = nTerms(P) > 1 ? `(${t})` : one; return (first || body.startsWith('-') ? '' : '+') + body + (body && body !== '-' ? '\\,' : '') + `\\dd ${v}`; };
  add({
    id: '8-16', part: 2, chap: '8-3①⑤ 例題1・例題2', stars: 1,
    title: '全微分は「坂×進んだ長さ」を東と北でたす',
    mark: '「少し進む」「全微分で見積もる」、$\\dd f$。',
    futsu: ['着いた点の高さを山の式に入れて', '計算し、もとの高さをひく', '（$h(10.5,\\ 29.5)-h(10,\\ 30)$）。', '2乗の計算が重い。'],
    raku: ['$(10,\\ 30)$（坂 $-0.2$、$-1.2$）から', '東へ $0.5$、南へ $0.5$（$\\dd y=-0.5$）', '$(-0.2)\\times0.5+(-1.2)\\times(-0.5)=0.5$', '$f=xy^2$、$(3,\\ 1)$、$\\dd x=0.02$、$\\dd y=0.01$', '→ $y^2\\,\\dd x+2xy\\,\\dd y=0.02+0.06=0.08$'],
    why: '高さは場所だけで決まるので、ななめに進むのは、東へ進んでから北へ進むのと同じ（8-3①）。東へ $\\dd x$ 進む変化は「東の坂×$\\dd x$」、北へ $\\dd y$ 進む変化は「北の坂×$\\dd y$」で、2つをたすと $\\dd f=\\dfrac{\\partial f}{\\partial x}\\,\\dd x+\\dfrac{\\partial f}{\\partial y}\\,\\dd y$（8-3⑤）。進む長さが短いほど、本当の変化とのずれは速く小さくなる（ずれは長さの2乗の大きさ。8-3③）。',
    caution: '坂だけをたさない（$-0.2+(-1.2)$ は変化ではない）。西・南へ進むときは、進んだ長さをマイナスにする。坂は、進む前の点の値を使う。見積もりなので、本当の変化とは少しずれる（主役の山では、ずれは $-0.01\\,\\dd x^2-0.02\\,\\dd y^2$）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '22mm', trap: '26mm' },
    fits(q) { return (/全微分/.test(q) || /のときの \$\\dd f\$/.test(q)) && !/％|連鎖|速さ|\\right\)_/.test(q); },
    steps: {
      // 坂が与えられた形
      s1(r) {
        const a = r.pick(SL16), b = r.pick(SL16), dx = r.pick(MV16) * sgnR(r), dy = r.pick(MV16) * sgnR(r);
        if (a === -0.2 && b === -1.2) return null;   // 左ページの例の坂（O-2）
        const v = r9(a * dx + b * dy);
        return { q: `東の坂が $${nf(a)}$、北の坂が $${nf(b)}$ の点から、${moveTxt(dx, dy)} 進むときの、全微分で見積もった高さの変化（m）`,
          a: `$${nf(v)}$`, key: `s1|${a},${b},${dx},${dy}`, easy: `$${pn(a)}\\times${pn(dx)}+${pn(b)}\\times${pn(dy)}=${nf(v)}$`,
          verify: p => valIs(p, [a, b].reduce((s, g, i) => s + g * [dx, dy][i], 0), 1e-9) };
      },
      // 式から偏微分してから（主役の山・多項式）、全微分の式
      s2(r) {
        const k = turn(r, '16s2', 3);
        if (k === 0) {
          const x = r.pick([-40, -30, -20, -10, 10, 20, 30, 40]), y = r.pick([-30, -20, -10, 10, 20, 30]), dx = r.pick([0.2, 0.5, 1, 2]) * sgnR(r), dy = r.pick([0.2, 0.5, 1, 2]) * sgnR(r);
          if (H(x, y) <= 10 || (x === 10 && y === 30)) return null;   // 左ページの例の点（O-2）
          const [gx, gy] = gH(x, y), v = r9(gx * dx + gy * dy);
          return { q: `${MT} の点 ${PT(x, y)} から、${moveTxt(dx, dy)} 進むときの、全微分で見積もった高さの変化（m）`, a: `$${nf(v)}$`, key: `pt|${x},${y}`,
            easy: `坂は $${nf(gx)}$、$${nf(gy)}$。$${pn(gx)}\\times${pn(dx)}+${pn(gy)}\\times${pn(dy)}=${nf(v)}$`, easyCheck: 'last',
            verify: p => valIs(p, numD(u => H(u[0], u[1]), [x, y], 0) * dx + numD(u => H(u[0], u[1]), [x, y], 1) * dy, 1e-6) };
        }
        const P = poly2(r); if (!P) return null;
        const tex = polyTeX(P, ['x', 'y']), Px = polyD(P, 0), Py = polyD(P, 1);
        if (k === 1) {
          const x0 = r.pick([1, 2, 3, -1, -2]), y0 = r.pick([1, 2, 3, -1, -2]), dx = r.pick([0.01, 0.02, 0.03, 0.05]) * sgnR(r), dy = r.pick([0.01, 0.02, 0.03, 0.05]) * sgnR(r);
          const fxv = polyV(Px, [x0, y0]), fyv = polyV(Py, [x0, y0]), v = r9(fxv * dx + fyv * dy);
          if (fxv === 0 || fyv === 0 || Math.abs(fxv) > 60 || Math.abs(fyv) > 60 || v === 0) return null;
          const key = `f|${P.map(t => t.join(',')).join(';')}|${x0},${y0}|${dx},${dy}`;
          if (tex === 'xy^2' && x0 === 3 && y0 === 1) return null;   // 左ページの例（O-2）
          return { q: `$f=${tex}$ の点 ${PT(x0, y0)} で、$\\dd x=${nf(dx)}$、$\\dd y=${nf(dy)}$ のときの $\\dd f$`, a: `$${nf(v)}$`, key,
            easy: `$\\dd f=${dTerm(Px, 'x', true)}${dTerm(Py, 'y')}$。点では $${pn(fxv)}\\times${pn(dx)}+${pn(fyv)}\\times${pn(dy)}=${nf(v)}$`, easyCheck: 'last',
            verify: p => { const f = u => polyV0(P, u); return valIs(p, numD(f, [x0, y0], 0) * dx + numD(f, [x0, y0], 1) * dy, 1e-6); } };
        }
        if (tex === 'xy^2') return null;
        const ans = `\\dd f=${dTerm(Px, 'x', true)}${dTerm(Py, 'y')}`;
        if (ans.replace(/\\[a-zA-Z]+|[{}\\^_ ,]/g, '').length > 22) return null;   // 長い答えは出さない（答えの節ではみ出さないように）
        return { q: `$f=${tex}$ の全微分 $\\dd f$`, a: `$${ans}$`, key: `df|${tex}`, boxw: '40mm', easyCheck: false,
          easy: `$\\dfrac{\\partial f}{\\partial x}=${polyTeX(Px, ['x', 'y'])}$、$\\dfrac{\\partial f}{\\partial y}=${polyTeX(Py, ['x', 'y'])}$ に $\\dd x$、$\\dd y$ をかけてたす`,
          verify: p => {
            const t = strip(p.a).replace(/^.*?=/, '').replace(/\\dd\s*x/g, '(u)').replace(/\\dd\s*y/g, '(w)');
            for (const [x, y, u, w] of [[0.37, 1.13, 0.7, -0.3], [-1.21, 0.61, -0.4, 1.9]]) {
              const f = s => polyV0(P, s), want = numD(f, [x, y], 0) * u + numD(f, [x, y], 1) * w;
              if (!near(ev(t, { x, y, u, w }), want, 1e-6)) return `全微分 ${p.a} がちがう`;
            }
            return true;
          } };
      },
      // 本当の変化とのずれ（主役の山）、3つの変数の全微分
      s3(r) {
        if (turn(r, '16s3', 2) === 0) {
          const x = r.pick([-30, -20, -10, 10, 20, 30]), y = r.pick([-20, -10, 10, 20]), dx = r.pick([0.5, 1, 2]) * sgnR(r), dy = r.pick([0.5, 1, 2]) * sgnR(r);
          if (x === 10 && y === 30) return null;
          const tr = r9(H(x + dx, y + dy) - H(x, y)), [gx, gy] = gH(x, y), est = r9(gx * dx + gy * dy), gap = r9(tr - est);
          return { q: `${MT} の点 ${PT(x, y)} から${moveTxt(dx, dy)} 進むと、本当の高さの変化は $${nf(tr)}\\,\\mathrm{m}$。全微分の見積もりとのずれ（本当－見積もり。m）`,
            a: `$${nf(gap)}$`, key: `pt|${x},${y}`, easyCheck: false,
            easy: `見積もりは $${pn(gx)}\\times${pn(dx)}+${pn(gy)}\\times${pn(dy)}=${nf(est)}$。$${nf(tr)}-${pn(est)}=${nf(gap)}$`,
            verify: p => valIs(p, -0.01 * dx * dx - 0.02 * dy * dy, 1e-9) };
        }
        const P = poly3(r); if (!P) return null;
        const x0 = r.int(1, 3), y0 = r.pick([1, 2, -1]), z0 = r.pick([1, 2, 3, -1]), ds = [0, 1, 2].map(() => r.pick([0.01, 0.02, 0.03]) * sgnR(r));
        const g = [0, 1, 2].map(k => polyV(polyD(P, k), [x0, y0, z0]));
        if (g.some(v => v === 0 || Math.abs(v) > 40)) return null;
        const v = r9(g.reduce((s, gi, i) => s + gi * ds[i], 0));
        if (v === 0) return null;
        const tex = polyTeX(P, ['x', 'y', 'z']);
        return { q: `$f=${tex}$ の点 $(${x0},\\ ${y0},\\ ${z0})$ で、$\\dd x=${nf(ds[0])}$、$\\dd y=${nf(ds[1])}$、$\\dd z=${nf(ds[2])}$ のときの $\\dd f$`, a: `$${nf(v)}$`,
          key: `f3|${tex}|${x0},${y0},${z0}|${ds}`, easyCheck: 'last',
          easy: `3つの偏微分は $${nf(g[0])}$、$${nf(g[1])}$、$${nf(g[2])}$。$${g.map((gi, i) => `${pn(gi)}\\times${pn(ds[i])}`).join('+')}=${nf(v)}$`,
          verify: p => { const f = u => polyV0(P, u), X = [x0, y0, z0]; return valIs(p, [0, 1, 2].reduce((s, k) => s + numD(f, X, k) * ds[k], 0), 1e-6); } };
      },
      // わな：いちばん急に下る向き（8-23。全微分の見積もりではない）
      trap(r) {
        const x = r.pick([-40, -30, -20, -15, 15, 20, 30, 40]), y = r.pick([-20, -15, -10, 10, 15, 20]);
        if (H(x, y) <= 10) return null;
        const [gx, gy] = gH(x, y), w = [r9(-gx), r9(-gy)];
        return dest({ q: `${MT} の点 ${PT(x, y)} で、ボールが転がりはじめる向き（いちばん急に下る向き。成分の組で）`, a: `$${vt(w)}$`, key: `pt|${x},${y}`,
          calc: { kind: 'vec', want: w }, verify: p => vecIs(p, [0.02 * x, 0.04 * y]) }, '8-16',
          `少し進んだときの変化ではなく、向きを聞いている。坂を並べた $\\mathrm{grad}\\,h=${vt([gx, gy])}$ の反対 $${vt(w)}$`, ['8-23']);
      },
    },
  });

  // ================================================================ 8-17
  const PC = [0.5, 1, 1.5, 2, 3];
  // 形と式：vars は [ことば, べき]
  const SH17 = [
    { name: '円柱の体積', f: 'V=\\pi r^2h', s: 'V', vars: [['半径 $r$', 2], ['高さ $h$', 1]] },
    { name: '直方体の体積', f: 'V=abc', s: 'V', vars: [['$a$', 1], ['$b$', 1], ['$c$', 1]] },
    { name: '円すいの体積', f: 'V=\\dfrac{1}{3}\\pi r^2h', s: 'V', vars: [['半径 $r$', 2], ['高さ $h$', 1]] },
    { name: '円の面積', f: 'S=\\pi r^2', s: 'S', vars: [['半径 $r$', 2]] },
    { name: '立方体の体積', f: 'V=a^3', s: 'V', vars: [['1辺 $a$', 3]] },
    { name: '三角柱の体積', f: 'V=\\dfrac{1}{2}abh', s: 'V', vars: [['$a$', 1], ['$b$', 1], ['高さ $h$', 1]] },
  ];
  const PH17 = [
    { name: '運動エネルギー', f: 'K=\\dfrac{1}{2}mv^2', s: 'K', vars: [['質量 $m$', 1], ['速さ $v$', 2]] },
    { name: '電力', f: 'P=I^2R', s: 'P', vars: [['電流 $I$', 2], ['抵抗 $R$', 1]] },
    { name: '位置エネルギー', f: 'U=mgh', s: 'U', vars: [['質量 $m$', 1], ['高さ $h$', 1]] },
    { name: 'コンデンサーのエネルギー', f: 'E=\\dfrac{1}{2}CV^2', s: 'E', vars: [['電気容量 $C$', 1], ['電圧 $V$', 2]] },
    { name: '球の表面積', f: 'S=4\\pi r^2', s: 'S', vars: [['半径 $r$', 2]] },
    { name: '円柱のおもりの質量', f: 'm=\\rho\\pi r^2h', s: 'm', vars: [['密度 $\\rho$', 1], ['半径 $r$', 2], ['高さ $h$', 1]] },
  ];
  // 「半径 $r$ を 2％、高さ $h$ を 3％」。同じ割合が続くときは「$a$・$b$ を 1％ ずつ」
  function pctList(vars, ps) {
    if (vars.length > 1 && ps.every(x => x === ps[0])) return `${vars.map(v => v[0]).join('・')} を ${nf(ps[0])}％ずつ`;
    return vars.map((v, i) => `${v[0]} を ${nf(ps[i])}％`).join('、');
  }
  const sumTxt = (vars, ps) => vars.map((v, i) => (Math.abs(v[1]) === 1 ? nf(ps[i]) : `${Math.abs(v[1])}\\times${nf(ps[i])}`)).join('+');
  // 例の割合を何倍かしただけの組（並べかえもふくむ）か（S-2）。球（例は $r$ の1つだけ）は、ステップ1・2に出さない
  const perms = a => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map(t => [x].concat(t))));
  const propTo = (ps, ex, perm) => (perm ? perms(ex) : [ex]).some(e => e.length === ps.length && ps.every((x, i) => Math.abs(x * e[0] - e[i] * ps[0]) < 1e-9));
  const EX17 = { '円柱の体積': [[1, 3]], '円すいの体積': [[1, 3]], '直方体の体積': [[1, 1, 2], true], '三角柱の体積': [[1, 1, 2], true] };
  const bad17 = (S, ps) => !!EX17[S.name] && propTo(ps, EX17[S.name][0], EX17[S.name][1]);
  add({
    id: '8-17', part: 2, chap: '8-3④ 例題3・例題10', stars: 1,
    title: 'かけ算の式の誤差は、べきの数をかけてたす',
    mark: '「□％大きくはかった」、かけ算・べきの式。',
    futsu: ['ずれた値を式に入れて計算し', '（$\\pi\\times5.1^2\\times20.6$ など）、', 'もとの値でわって、何％ちがうかを', '出す。'],
    raku: ['円柱 $V=\\pi r^2h$、$r$ を1％、$h$ を3％', '→ $2\\times1+3=5$（％）', '球 $\\dfrac43\\pi r^3$、$r$ を2％ → $3\\times2=6$', '直方体 $abc$、1・1・2％ → $4$'],
    why: '全微分 $\\dd V=2\\pi rh\\,\\dd r+\\pi r^2\\,\\dd h$ を $V=\\pi r^2h$ でわると、$\\dfrac{\\dd V}{V}=2\\,\\dfrac{\\dd r}{r}+\\dfrac{\\dd h}{h}$。かけ算の式では、どの項も約分されて「べきの数×その量のずれの割合」が残り、$\\pi$ や $\\dfrac{4}{3}$ のような定数は消える（8-3④）。',
    caution: '定数（$\\pi$、$\\dfrac{4}{3}$、$\\dfrac12$、$g$）は割合に効かない。2乗は2倍、3乗は3倍、$\\sqrt{\\phantom{2}}$ は $\\dfrac12$ 倍して効く。本当の値（$1.01^2\\times1.03$ など）とは少しずれる（見積もり）。わり算の式・±のずれは、わざ 8-18。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /％/.test(q) && !/±/.test(q) && /(大きく|小さく)はかっ/.test(q); },
    steps: {
      // 形の体積・面積（大きくはかった）
      s1(r) {
        const S = r.pick(SH17), ps = S.vars.map(() => r.pick(PC));
        if (bad17(S, ps)) return null;
        const v = r9(S.vars.reduce((s, x, i) => s + x[1] * ps[i], 0));
        return { q: `${S.name} $${S.f}$ で、${pctList(S.vars, ps)}大きくはかった。$${S.s}$ は約 □ ％大きく計算される`, a: `$${nf(v)}$`, key: `${S.name}|${ps}`,
          easy: `$${sumTxt(S.vars, ps)}=${nf(v)}$`, verify: p => valIs(p, S.vars.reduce((s, x, i) => s + x[1] * ps[i], 0)) };
      },
      // 物理の式（大きく・小さく）
      s2(r) {
        const S = r.pick(PH17), ps = S.vars.map(() => r.pick(PC)), big = turn(r, '17s2', 2) === 0;
        const v = r9(S.vars.reduce((s, x, i) => s + x[1] * ps[i], 0)), w = big ? '大きく' : '小さく';
        return { q: `${S.name} $${S.f}$ で、${pctList(S.vars, ps)}${w}はかった。$${S.s}$ は約 □ ％${w}計算される`, a: `$${nf(v)}$`, key: `${S.name}|${ps}|${w}`,
          easy: `${S.name === '位置エネルギー' ? '$g$ は効かない。' : ''}$${sumTxt(S.vars, ps)}=${nf(v)}$`, easyCheck: 'last',
          verify: p => { let lo = 1; S.vars.forEach((x, i) => { lo *= (1 + (big ? 1 : -1) * ps[i] * 1e-6) ** x[1]; }); return valIs(p, Math.abs(lo - 1) * 1e6, 1e-4); } };
      },
      // √ の式・逆に求める量（べきが $\frac12$・$\frac13$）
      s3(r) {
        const k = turn(r, '17s3', 4);
        const T = [
          { q: a => `落ちる高さ $h$ を ${a}％大きくはかった。$v=\\sqrt{2gh}$ で求めた速さは約 □ ％大きい`, d: 2, A: [1, 2, 3, 4, 5, 6] },
          { q: a => `ふりこの長さ $L$ を ${a}％大きくはかった。周期 $T=2\\pi\\sqrt{\\dfrac{L}{g}}$ は約 □ ％大きく計算される`, d: 2, A: [1, 2, 3, 4, 5] },
          { q: a => `球の体積 $V$ を ${a}％大きくはかった。$V=\\dfrac{4}{3}\\pi r^3$ から求めた半径 $r$ は約 □ ％大きい`, d: 3, A: [1.5, 3, 4.5, 6, 9] },
          { q: a => `円の面積 $S$ を ${a}％大きくはかった。$S=\\pi r^2$ から求めた半径 $r$ は約 □ ％大きい`, d: 2, A: [1, 2, 3, 4, 5] },
        ][k];
        const a = r.pick(T.A), v = r9(a / T.d);
        return { q: T.q(nf(a)), a: `$${nf(v)}$`, key: `s3|${k}|${a}`, easy: `$\\dfrac{1}{${T.d}}\\times${nf(a)}=${nf(v)}$`,
          verify: p => valIs(p, ((1 + a * 1e-6) ** (1 / T.d) - 1) * 1e6, 1e-4) };
      },
      // わな：わり算の式で ± のずれ（8-18）
      trap(r) {
        const S = r.pick([['密度', '\\rho=\\dfrac{m}{V}', '\\rho', ['m', 'V']], ['電流', 'I=\\dfrac{V}{R}', 'I', ['V', 'R']], ['速さ', 'v=\\dfrac{L}{t}', 'v', ['L', 't']]]), a = r.pick([0.5, 1, 2]), b = r.pick([0.5, 1, 2, 3]);
        const v = r9(a + b);
        return dest({ q: `${S[0]} $${S[1]}$ で、$${S[3][0]}$ に ±${nf(a)}％、$${S[3][1]}$ に ±${nf(b)}％ のずれがありうる。$${S[2]}$ のずれは、いちばん大きくて約 □ ％`, a: `$${nf(v)}$`, key: `t17|${S[0]}|${a},${b}`,
          verify: p => valIs(p, Math.abs(a) + Math.abs(b)) }, '8-17',
          `わり算の式で、ずれは大きくも小さくもなりうる。わる量はマイナスで効くので、いちばん大きいずれは割合の大きさをたして $${nf(a)}+${nf(b)}=${nf(v)}$（$${nf(a)}-${nf(b)}$ ではない）`, ['8-18']);
      },
    },
  });

  // ================================================================ 8-18
  const DV18 = [
    { name: '密度', f: '\\rho=\\dfrac{m}{V}', s: '\\rho', vars: [['$m$', 1], ['$V$', -1]] },
    { name: '電流', f: 'I=\\dfrac{V}{R}', s: 'I', vars: [['$V$', 1], ['$R$', -1]] },
    { name: '速さ', f: 'v=\\dfrac{L}{t}', s: 'v', vars: [['$L$', 1], ['$t$', -1]] },
    { name: '抵抗', f: 'R=\\dfrac{V}{I}', s: 'R', vars: [['$V$', 1], ['$I$', -1]] },
    { name: '圧力', f: 'p=\\dfrac{F}{S}', s: 'p', vars: [['$F$', 1], ['$S$', -1]] },
    { name: '仕事率', f: 'P=\\dfrac{W}{t}', s: 'P', vars: [['$W$', 1], ['$t$', -1]] },
  ];
  const PW18 = [
    { name: '電力', f: 'P=\\dfrac{V^2}{R}', s: 'P', vars: [['$V$', 2], ['$R$', -1]] },
    { name: '重力加速度', f: 'g=\\dfrac{4\\pi^2L}{T^2}', s: 'g', vars: [['$L$', 1], ['$T$', -2]] },
    { name: '加速度', f: 'a=\\dfrac{2L}{t^2}', s: 'a', vars: [['$L$', 1], ['$t$', -2]] },
    { name: '電場', f: 'E=\\dfrac{kQ}{r^2}', s: 'E', vars: [['$Q$', 1], ['$r$', -2]] },
    { name: '密度', f: '\\rho=\\dfrac{m}{a^3}', s: '\\rho', vars: [['$m$', 1], ['$a$', -3]] },
    { name: '面密度', f: '\\sigma=\\dfrac{m}{\\pi r^2}', s: '\\sigma', vars: [['$m$', 1], ['$r$', -2]] },
  ];
  const MX18 = [
    { name: '直方体の密度', f: '\\rho=\\dfrac{m}{abc}', s: '\\rho', vars: [['$m$', 1], ['$a$', -1], ['$b$', -1], ['$c$', -1]] },
    { name: '円柱の密度', f: '\\rho=\\dfrac{m}{\\pi r^2h}', s: '\\rho', vars: [['$m$', 1], ['$r$', -2], ['$h$', -1]] },
    { name: '向心力', f: 'F=\\dfrac{mv^2}{r}', s: 'F', vars: [['$m$', 1], ['$v$', 2], ['$r$', -1]] },
    { name: 'クーロンの力', f: 'F=\\dfrac{kq_1q_2}{r^2}', s: 'F', vars: [['$q_1$', 1], ['$q_2$', 1], ['$r$', -2]] },
    { name: '平均の力', f: 'F=\\dfrac{mv}{t}', s: 'F', vars: [['$m$', 1], ['$v$', 1], ['$t$', -1]] },
  ];
  const PC18 = [0.5, 1, 2, 3];
  // 「$m$ に ±1％、$V$ に ±2％」。同じ割合なら「$a$・$b$・$c$ に ±1％ ずつ」
  function pmList(vars, ps) {
    const out = [], used = new Array(vars.length).fill(false);
    vars.forEach((v, i) => {
      if (used[i]) return;
      const same = vars.map((w, j) => j).filter(j => !used[j] && ps[j] === ps[i] && j >= i);
      same.forEach(j => { used[j] = true; });
      out.push(same.length > 1 ? `${same.map(j => vars[j][0]).join('・')} に ±${nf(ps[i])}％ずつ` : `${v[0]} に ±${nf(ps[i])}％`);
    });
    return out.join('、');
  }
  // 「べきの大きさ：ずれ」の組（並べた順）。文字や量の名前だけがちがう式は、同じ問題とみる（R1-9）
  const pairs18 = (S, ps) => S.vars.map((x, i) => [Math.abs(x[1]), ps[i]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const key18 = (S, ps) => 'D' + pairs18(S, ps).map(t => t.join(':')).join(',');
  // 左ページの例（$\rho=\dfrac mV$ の ±1％・±2％、$P=\dfrac{V^2}{R}$ の ±2％・±1％）の組と、それを何倍かしただけの組は、どの式でもよける（S-2・Z-2）
  const EXP18 = [[[1, 1], [1, 2]], [[1, 1], [2, 2]]];
  const bad18 = (S, ps) => { const P = pairs18(S, ps); return EXP18.some(E => E.length === P.length && P.every((t, i) => t[0] === E[i][0] && Math.abs(t[1] * E[0][1] - E[i][1] * P[0][1]) < 1e-9)); };
  function prob18(S, ps, key) {
    const v = r9(S.vars.reduce((s, x, i) => s + Math.abs(x[1]) * ps[i], 0));
    return { q: `${S.name} $${S.f}$ で、${pmList(S.vars, ps)}のずれがありうる。$${S.s}$ のずれは、いちばん大きくて約 □ ％`, a: `$${nf(v)}$`, key,
      easy: `$${sumTxt(S.vars, ps)}=${nf(v)}$`,
      // 検算：大きい・小さいの組をすべてためして（2^n とおり）、ずれの割合の見積もりがいちばん大きいもの
      verify: p => { let best = 0; for (let m = 0; m < 1 << S.vars.length; m++) { const t = S.vars.reduce((s, x, i) => s + x[1] * ps[i] * ((m >> i) & 1 ? 1 : -1), 0); best = Math.max(best, t); } return valIs(p, best); } };
  }
  add({
    id: '8-18', part: 2, chap: '8-3④ 例題4', stars: 1,
    title: 'わり算の誤差：いちばん大きいずれは、割合の大きさをたす',
    mark: '「±□％のずれ」「いちばん大きくて」、わり算の式。',
    futsu: ['ずれの4つの組み合わせ', '（大きく・小さく）を全部', '式に入れて計算し、もとの値と', 'いちばんちがうものをさがす。'],
    raku: ['$\\rho=\\dfrac mV$、$m$ が ±1％、$V$ が ±2％', '→ いちばん大きくて $1+2=3$（％）', '$P=\\dfrac{V^2}{R}$、±2％・±1％', '→ $2\\times2+1=5$（％）'],
    why: '$\\rho=\\dfrac{m}{V}$ の全微分を $\\rho$ でわると $\\dfrac{\\dd\\rho}{\\rho}=\\dfrac{\\dd m}{m}-\\dfrac{\\dd V}{V}$（わる量はべきが $-1$）。ずれは大きくも小さくもなりうるので、$m$ が大きく $V$ が小さくずれると、2つは同じ向きに効く。いちばん大きいずれは、割合の大きさ（べきの数をかけたもの）をたしたもの（8-3④）。',
    caution: '$1-2$ のようにひいて打ち消さない（それは2つが同じ向きにずれたとき）。2乗でわる量は2倍で効く。定数（$4\\pi^2$、$k$）は効かない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '18mm' },
    fits(q) { return /±/.test(q) && /いちばん大き/.test(q); },
    steps: {
      s1(r) {
        const S = r.pick(DV18), ps = S.vars.map(() => r.pick(PC18));
        if (bad18(S, ps)) return null;
        return prob18(S, ps, key18(S, ps));
      },
      s2(r) {
        const S = r.pick(PW18), ps = S.vars.map(() => r.pick(PC18));
        if (bad18(S, ps)) return null;
        return prob18(S, ps, key18(S, ps));
      },
      s3(r) {
        const S = r.pick(MX18), ps = S.vars.map((x, i) => (i > 0 && r.chance(0.4) ? null : r.pick(PC18)));
        for (let i = 0; i < ps.length; i++) if (ps[i] == null) ps[i] = ps[i - 1];
        return prob18(S, ps, key18(S, ps));
      },
      // わな：1つの量で偏微分した値（8-15。ずれの割合ではない）
      trap(r) {
        if (turn(r, '18t', 2) === 0) {
          const V = r.pick([6, 8, 10, 12, 20]), I = r.pick([2, 4, 5]), v = r9(-V / (I * I));
          return dest({ q: `抵抗 $R=\\dfrac{V}{I}$ の、$V=${V}$、$I=${I}$ での $\\dfrac{\\partial R}{\\partial I}$（$\\mathrm{\\Omega/A}$）`, a: `$${nf(v)}$`, key: `t18|R|${V},${I}`,
            calc: { kind: 'pdiff', f: 'V/I', vars: ['V', 'I'], wrt: ['I'], at: [V, I] } }, '8-18',
            `ずれの割合ではなく、$V$ を止めて $I$ で偏微分した値。$-\\dfrac{V}{I^2}=-\\dfrac{${V}}{${I * I}}=${nf(v)}$`, ['8-15']);
        }
        const V = r.pick([4, 6, 10, 12]), R = r.pick([2, 4, 5, 8]), v = r9(2 * V / R);
        return dest({ q: `電力 $P=\\dfrac{V^2}{R}$ の、$V=${V}$、$R=${R}$ での $\\dfrac{\\partial P}{\\partial V}$（$\\mathrm{W/V}$）`, a: `$${nf(v)}$`, key: `t18|P|${V},${R}`,
          calc: { kind: 'pdiff', f: 'V^2/R', vars: ['V', 'R'], wrt: ['V'], at: [V, R] } }, '8-18',
          `ずれの割合ではなく、$R$ を止めて $V$ で偏微分した値。$\\dfrac{2V}{R}=\\dfrac{${2 * V}}{${R}}=${nf(v)}$`, ['8-15']);
      },
    },
  });

  // ================================================================ 8-19
  // 「20-4t」「10+t」「3t」
  const linT = (c, a) => (c ? `${c}${a < 0 ? '-' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}t` : `${a === 1 ? '' : a === -1 ? '-' : a}t`);
  // 主役の山の道（x0 + a t、y0 + b t）。t の場所が山の上（高さ 10 m より上）
  function path19(r, t) {
    for (let k = 0; k < 30; k++) {
      const x0 = r.pick([-40, -30, -20, -10, 0, 10, 20, 30, 40]), y0 = r.pick([-30, -20, -10, 0, 10, 20, 30]), a = r.intNot(-5, 5, v => v === 0), b = r.intNot(-5, 5, v => v === 0);
      const x = x0 + a * t, y = y0 + b * t;
      if (H(x0, y0) <= 10 || H(x, y) <= 10 || (x === 0 && y === 0)) continue;
      return { x0, y0, a, b, x, y };
    }
    return null;
  }
  const dhdt = (g, t) => numD(u => H(g.x0 + g.a * u[0], g.y0 + g.b * u[0]), [t], 0);   // 検算：h を t の関数にして数で微分
  add({
    id: '8-19', part: 2, chap: '8-3⑥ 例題5', stars: 1,
    title: '連鎖律：その時刻の場所の坂×その向きの速さを2つたす',
    mark: '$x=\\cdots t$、$y=\\cdots t$ と歩く、「高さの変わる速さ」。',
    futsu: ['$x$、$y$ を山の式に入れて展開し、', '$t$ だけの式にしてから $t$ で微分し、', '時刻を入れる。'],
    raku: ['$x=20-4t$、$y=10+t$、$t=0$', '→ $(20,\\ 10)$ で坂 $-0.4$、$-0.4$', '$(-0.4)\\times(-4)+(-0.4)\\times1=1.2$', '（1分に $1.2\\,\\mathrm{m}$ 上がる）'],
    why: '時間 $\\dd t$ のあいだに $x$ は $\\dfrac{\\dd x}{\\dd t}\\,\\dd t$、$y$ は $\\dfrac{\\dd y}{\\dd t}\\,\\dd t$ だけ変わるので、全微分に入れて $\\dd t$ でわると $\\dfrac{\\dd h}{\\dd t}=\\dfrac{\\partial h}{\\partial x}\\dfrac{\\dd x}{\\dd t}+\\dfrac{\\partial h}{\\partial y}\\dfrac{\\dd y}{\\dd t}$（8-3⑥）。$t$ から $h$ への道が2つあり、道ごとにかけて、たす。',
    caution: '坂は、出発の点ではなく、その時刻の場所で求める。片方の道を忘れない。$\\dfrac{\\dd x}{\\dd t}$ は $t$ の係数（$x=20-4t$ なら $-4$）。答えが負なら下っている（変わる速さは符号つき）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /と(歩|動)く/.test(q) && /変わる速さ/.test(q); },
    steps: {
      // t=0（出発の点）
      s1(r) {
        const g = path19(r, 0); if (!g) return null;
        if (g.x0 === 20 && g.y0 === 10 && g.a === -4 && g.b === 1) return null;   // 左ページの例（O-2）
        const [gx, gy] = gH(g.x0, g.y0), v = r9(gx * g.a + gy * g.b);
        return { q: `${MT} の上を、$x=${linT(g.x0, g.a)}$、$y=${linT(g.y0, g.b)}$（$t$ は分）と歩く。$t=0$ での高さの変わる速さ（m/分）`, a: `$${nf(v)}$`,
          key: `19|${g.x0},${g.y0},${g.a},${g.b}|0`, easyCheck: 'last',
          easy: `$(${g.x0},\\ ${g.y0})$ で坂 $${nf(gx)}$、$${nf(gy)}$。$${pn(gx)}\\times${par(g.a)}+${pn(gy)}\\times${par(g.b)}=${nf(v)}$`,
          verify: p => valIs(p, dhdt(g, 0), 1e-6) };
      },
      // t=1〜10（場所を先に出す）
      s2(r) {
        const t = r.pick([1, 2, 3, 4, 5, 10]), g = path19(r, t); if (!g) return null;
        const [gx, gy] = gH(g.x, g.y), v = r9(gx * g.a + gy * g.b);
        return { q: `${MT} の上を、$x=${linT(g.x0, g.a)}$、$y=${linT(g.y0, g.b)}$（$t$ は分）と歩く。$t=${t}$ での高さの変わる速さ（m/分）`, a: `$${nf(v)}$`,
          key: `19|${g.x0},${g.y0},${g.a},${g.b}|${t}`, easyCheck: 'last',
          easy: `$t=${t}$ の場所は $(${g.x},\\ ${g.y})$、坂 $${nf(gx)}$、$${nf(gy)}$。$${pn(gx)}\\times${par(g.a)}+${pn(gy)}\\times${par(g.b)}=${nf(v)}$`,
          verify: p => valIs(p, dhdt(g, t), 1e-6) };
      },
      // 部屋の温度の中を動くロボット（℃/秒）
      s3(r) {
        const P = [[r.pick([18, 20, 22, 25]), 0, 0], [r.pick([0.5, 0.2, -0.3, 0.4, -0.5]), 1, 0], [r.pick([0.3, -0.2, 0.6, -0.4]), 0, 1], [r.pick([0.1, -0.1, 0.2]), 1, 1]];
        const x0 = r.int(0, 3), y0 = r.int(0, 3), a = r.intNot(-2, 3, v => v === 0), b = r.intNot(-2, 3, v => v === 0), t = r.int(1, 3);
        const x = x0 + a * t, y = y0 + b * t, Tx = polyV(polyD(P, 0), [x, y]), Ty = polyV(polyD(P, 1), [x, y]), v = r9(Tx * a + Ty * b);
        if (v === 0) return null;
        const tex = polyTeX(P, ['x', 'y']);   // 定数・x・y・xy の順
        return { q: `床の温度が $T=${tex}$（℃）の部屋を、ロボットが $x=${linT(x0, a)}$、$y=${linT(y0, b)}$（$t$ は秒）と動く。$t=${t}$ での温度の変わる速さ（℃/秒）`, a: `$${nf(v)}$`,
          key: `19r|${tex}|${x0},${y0},${a},${b}|${t}`, easyCheck: 'last',
          easy: `$t=${t}$ の場所は $(${x},\\ ${y})$。$\\dfrac{\\partial T}{\\partial x}=${nf(Tx)}$、$\\dfrac{\\partial T}{\\partial y}=${nf(Ty)}$。$${pn(Tx)}\\times${par(a)}+${pn(Ty)}\\times${par(b)}=${nf(v)}$`,
          verify: p => valIs(p, numD(u => polyV0(P, [x0 + a * u[0], y0 + b * u[0]]), [t], 0), 1e-6) };
      },
      // わな：その時刻の高さ（8-02。変わる速さではない）
      trap(r) {
        const t = r.pick([2, 4, 5, 10]), g = path19(r, t); if (!g) return null;
        const v = r9(H(g.x, g.y));
        return dest({ q: `${MT} の上を、$x=${linT(g.x0, g.a)}$、$y=${linT(g.y0, g.b)}$（$t$ は分）と歩く。$t=${t}$ での高さ（m）`, a: `$${nf(v)}$`, key: `t19|${g.x0},${g.y0},${g.a},${g.b}|${t}`,
          verify: p => valIs(p, 100 - (g.x0 + g.a * t) ** 2 / 100 - (g.y0 + g.b * t) ** 2 / 50) }, '8-19',
          `変わる速さではなく、その時刻の高さ。場所 $(${g.x},\\ ${g.y})$ を山の式に入れて $${nf(v)}$`, ['8-02']);
      },
    },
  });

  // ================================================================ 8-20〜8-22 の腕
  const deg = t => `${t}^{\\circ}`;
  const ARML = [['0.30', '0.25'], ['0.40', '0.30'], ['0.20', '0.15'], ['0.40', '0.25'], ['0.50', '0.40'], ['0.30', '0.20'], ['0.60', '0.40']];
  const S90 = t => [0, 1, 0, -1][((t / 90) % 4 + 4) % 4], C90 = t => [1, 0, -1, 0][((t / 90) % 4 + 4) % 4];   // 90° の倍数の sin・cos
  const d2 = v => { v = r9(v); return v === 0 ? '0' : v.toFixed(2); };   // 長さ（m）：0.30 のように小数第2位まで
  const armTxt = g => `$L_1=${g.L1}\\,\\mathrm{m}$、$L_2=${g.L2}\\,\\mathrm{m}$、$\\theta_1=${deg(g.t1)}$、$\\theta_2=${deg(g.t2)}$`;
  // 腕（角は 90° の倍数）：ひじ E、手 P、ヤコビ行列 J（教科書 8-3⑦の4つの偏微分）
  function armOf(L1, L2, t1, t2) {
    const l1 = +L1, l2 = +L2, t12 = t1 + t2;
    const E = [r9(l1 * C90(t1)), r9(l1 * S90(t1))], P = [r9(E[0] + l2 * C90(t12)), r9(E[1] + l2 * S90(t12))];
    const J = [[r9(-l1 * S90(t1) - l2 * S90(t12)), r9(-l2 * S90(t12))], [r9(l1 * C90(t1) + l2 * C90(t12)), r9(l2 * C90(t12))]];
    return { L1, L2, t1, t2, E, P, J };
  }
  // 検算：三角関数で（角は度）。問題を作った 90° の表とは別の道すじ
  function jacTrig(l1, l2, t1, t2) {
    const a = t1 * Math.PI / 180, b = (t1 + t2) * Math.PI / 180;
    return [[-l1 * Math.sin(a) - l2 * Math.sin(b), -l2 * Math.sin(b)], [l1 * Math.cos(a) + l2 * Math.cos(b), l2 * Math.cos(b)]];
  }
  const pmx = (A, f) => `\\begin{pmatrix}${A.map(row => row.map(f || d2).join('&')).join('\\\\')}\\end{pmatrix}`;
  const matNum = a => { const m = M.readMat(a); return m ? m.map(row => row.map(c => c[0])) : null; };
  const matIs = (p, W, tol) => { const g = matNum(p.a); return (g && g.length === W.length && g.every((row, i) => row.length === W[i].length && row.every((x, j) => near(x, W[i][j], tol || 1e-9)))) || `答え ${p.a} の行列がちがう`; };
  // 図：2本の腕（0.1 m を1単位）。肩 O・ひじ E・手 P、関節の丸、長さと角の文字（第7巻 7-21 と同じ組み方）
  function armFig(g) {
    const S = 10, E = g.E.map(x => x * S), P = g.P.map(x => x * S), its = [];
    const dg = (A, B) => Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI;
    const ANG = { e: 0, ne: 45, n: 90, nw: 135, w: 180, sw: 225, s: 270, se: 315 };
    const dd = (a, b) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return Math.min(d, 360 - d); };
    const away = (dirs, pref) => Object.keys(ANG).sort((a, b) => Math.min(...dirs.map(d => dd(ANG[b], d))) - Math.min(...dirs.map(d => dd(ANG[a], d))) || (pref || []).indexOf(b) - (pref || []).indexOf(a))[0];
    const xs = [0, E[0], P[0]], ys = [0, E[1], P[1]], sc = Math.min(5, 45 / (Math.max(...xs) - Math.min(...xs) + 3), 22 / (Math.max(...ys) - Math.min(...ys) + 2));
    its.push(['seg', [g.t1 === 180 ? -1 : -0.8, 0], [g.t1 === 0 ? 1 : 2.2, 0], { dash: true }]);   // θ1 をはかる向き（O の右）
    its.push(['seg', [0, 0], E, { thick: true }], ['seg', E, P, { thick: true }], ['circle', [0, 0], 0.25], ['circle', E, 0.25], ['dot', P]);
    const a1 = dg([0, 0], E), a2 = dg(E, P), oDirs = [0, 180, a1], eDirs = [a1 + 180, a2];
    if (g.t1 !== 0 && g.t1 !== 180) { its.push(['angle', [1, 0], [0, 0], E, '$\\theta_1$', 0.9, 1, 0.7]); oDirs.push(a1 / 2); }
    if (g.t2 !== 0) {
      const X = [E[0] + Math.cos(a1 * Math.PI / 180) * 2.2, E[1] + Math.sin(a1 * Math.PI / 180) * 2.2];
      its.push(['seg', E, X, { dash: true }], ['angle', X, E, P, '$\\theta_2$', 0.9, 1, 0.7]); eDirs.push(a1, a1 + g.t2 / 2);
    }
    const side = (A, B, Q) => { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), n = [-dy / L, dx / L], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; const sg = (Q[0] - m[0]) * n[0] + (Q[1] - m[1]) * n[1] > 0 ? -1 : 1; return [m[0] + n[0] * 0.8 * sg, m[1] + n[1] * 0.8 * sg]; };
    const X2 = g.t2 !== 0 ? [E[0] + Math.cos(a1 * Math.PI / 180) * 1.5, E[1] + Math.sin(a1 * Math.PI / 180) * 1.5] : [0, 0];
    its.push(['label', side([0, 0], E, g.t2 !== 0 ? P : [E[0] / 2 + 1, E[1] / 2 + 1]), '$L_1$', 'c'], ['label', side(E, P, X2), '$L_2$', 'c']);
    const lab = (Q, t, d) => ['label', [Q[0] + Math.cos(ANG[d] * Math.PI / 180) * 0.3, Q[1] + Math.sin(ANG[d] * Math.PI / 180) * 0.3], t, d];
    its.push(lab([0, 0], 'O', away(oDirs, ['sw', 's', 'w'])), lab(E, 'E', away(eDirs)), lab(P, 'P', away([a2 + 180])));
    return { s: sc, items: its };
  }

  // ================================================================ 8-20
  // 2つの変数（u、v）の多項式。1つか2つの項
  const PWU = [[1, 1], [2, 0], [0, 2], [1, 0], [0, 1], [2, 1], [1, 2], [3, 0], [0, 3]];
  function polyUV(r) {
    for (let t = 0; t < 30; t++) {
      const n = r.chance(0.5) ? 1 : 2, P = [];
      for (let k = 0; k < n; k++) { const [a, b] = r.pick(PWU); P.push([r.pick([1, 1, 2, 3, -1, -2]), a, b]); }
      if (n === 2 && P[0][1] === P[1][1] && P[0][2] === P[1][2]) continue;
      sortP(P);
      if (P[0][0] < 0) continue;
      return P;
    }
    return null;
  }
  const UV = ['u', 'v'];
  const PTS20 = [[0.37, 1.13], [1.29, -0.61], [-0.83, 0.47]];
  const bad20 = (X, Y) => polyTeX(X, UV) === 'uv' && polyTeX(Y, UV) === 'u+v^2';   // 左ページの例（O-2）
  add({
    id: '8-20', part: 2, chap: '8-3⑦ 例題6', stars: 1,
    title: 'ヤコビ行列は偏微分を並べる：行＝出てくる量、列＝動かす量',
    mark: '「ヤコビ行列 $J$」、2つの量で決まる2つの量。',
    futsu: ['小さな変化 $\\dd x$、$\\dd y$ の式を', '全微分で2つ書き、$\\dd u$、$\\dd v$ の', '係数を1つずつ取り出して', '行列の形に書き直す。'],
    raku: ['$x=uv$、$y=u+v^2$', '1行め $\\Bigl(\\dfrac{\\partial x}{\\partial u},\\ \\dfrac{\\partial x}{\\partial v}\\Bigr)=(v,\\ u)$', '2行め $(1,\\ 2v)$', '腕 $\\theta_1=90^{\\circ}$、$\\theta_2=-90^{\\circ}$ → $\\begin{pmatrix}-0.30&0\\\\0.25&0.25\\end{pmatrix}$'],
    why: '$u$、$v$ を同時に少し動かすと、$\\dd x=\\dfrac{\\partial x}{\\partial u}\\,\\dd u+\\dfrac{\\partial x}{\\partial v}\\,\\dd v$、$\\dd y$ も同じ形（全微分）。2つの式は「行列×ベクトル」の形なので、係数（偏微分）を並べた行列 $J$ で $\\dd\\vec p=J\\,\\dd\\vec u$ と書ける（8-3⑦）。1列めは「$u$ だけを動かしたときの動き」。腕なら、$x=L_1\\cos\\theta_1+L_2\\cos(\\theta_1+\\theta_2)$ などを偏微分する（7-21 の「矢印を $90^{\\circ}$ 回して列に並べる」と同じ行列）。',
    caution: '1行めは $x$ の偏微分（$\\dfrac{\\partial x}{\\partial u}$、$\\dfrac{\\partial x}{\\partial v}$）。$\\dfrac{\\partial x}{\\partial u}$、$\\dfrac{\\partial y}{\\partial u}$ を1行めに並べない（それは転置）。偏微分するとき、ほかの文字は数と同じ。腕の角は、$\\theta_1+\\theta_2$ の $\\sin$・$\\cos$ も使う。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '30mm', s3: '30mm', trap: '28mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /ヤコビ行列/.test(q) && !/\\det|ヤコビアン|回す|回した|動かす/.test(q); },
    steps: {
      // 文字の式（$u$、$v$ の式のまま）
      s1(r) {
        const X = polyUV(r), Y = polyUV(r); if (!X || !Y) return null;
        const J = [[polyD(X, 0), polyD(X, 1)], [polyD(Y, 0), polyD(Y, 1)]];
        if (bad20(X, Y) || J.flat().filter(e => !e.length).length > 1 || J.flat().every(e => e.every(t => t[1] + t[2] === 0))) return null;   // 0 が2つ以上・数だけの行列はよける
        const tx = J.map(row => row.map(e => polyTeX(e, UV)));
        return { q: `$x=${polyTeX(X, UV)}$、$y=${polyTeX(Y, UV)}$ のヤコビ行列 $J$（$u$、$v$ で偏微分）`, a: `$${pmx(tx, s => s)}$`, key: `20|${polyTeX(X, UV)}|${polyTeX(Y, UV)}`, easyCheck: false,
          easy: `1行めは $x$ を $u$、$v$ で偏微分、2行めは $y$ を偏微分`,
          calc: { kind: 'mat', vars: UV, want: tx, pts: PTS20 },
          verify: p => { for (const [u, v] of PTS20) { const m = M.readMat(p.a, { u, v }); if (!m) return '行列が読めない'; const W = [[X, 0], [X, 1], [Y, 0], [Y, 1]].map(([P, k]) => numD(s => polyV0(P, s), [u, v], k)); if (![m[0][0], m[0][1], m[1][0], m[1][1]].every((c, i) => near(c[0], W[i], 1e-6))) return `($u$, $v$)=(${u}, ${v}) でちがう`; } return true; } };
      },
      // 点での値・極座標（だ円の座標）
      s2(r) {
        if (turn(r, '20s2', 2) === 0) {
          const X = polyUV(r), Y = polyUV(r); if (!X || !Y || bad20(X, Y)) return null;
          const u0 = r.pick([1, 2, 3, -1]), v0 = r.pick([1, 2, -1, -2]);
          const J = [[X, 0], [X, 1], [Y, 0], [Y, 1]].map(([P, k]) => polyV(polyD(P, k), [u0, v0]));
          const W = [[J[0], J[1]], [J[2], J[3]]];
          if (J.filter(x => x === 0).length > 1 || J.some(x => Math.abs(x) > 30)) return null;
          return { q: `$x=${polyTeX(X, UV)}$、$y=${polyTeX(Y, UV)}$ の、$(u,\\ v)=(${u0},\\ ${v0})$ でのヤコビ行列 $J$`, a: `$${pmx(W, nf)}$`, key: `20p|${polyTeX(X, UV)}|${polyTeX(Y, UV)}|${u0},${v0}`, easyCheck: false,
            easy: `$J=${pmx([[polyD(X, 0), polyD(X, 1)], [polyD(Y, 0), polyD(Y, 1)]].map(row => row.map(e => polyTeX(e, UV))), s => s)}$ に入れる`,
            calc: { kind: 'mat', want: W },
            verify: p => matIs(p, [[X, 0], [X, 1], [Y, 0], [Y, 1]].map(([P, k]) => numD(s => polyV0(P, s), [u0, v0], k)).reduce((A, x, i) => (A[i >> 1].push(x), A), [[], []]), 1e-6) };
        }
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3]), rr = r.pick([1, 2, 3, 4]), th = r.pick([0, 90, 180, 270]);
        const W = [[a * C90(th), -a * rr * S90(th)], [b * S90(th), b * rr * C90(th)]].map(row => row.map(r9));
        const xs = `${a === 1 ? '' : a}r\\cos\\theta`, ys = `${b === 1 ? '' : b}r\\sin\\theta`;
        return { q: `$x=${xs}$、$y=${ys}$ の、$r=${rr}$、$\\theta=${deg(th)}$ でのヤコビ行列 $J$（$r$、$\\theta$ で偏微分）`, a: `$${pmx(W, nf)}$`, key: `20k|${rr},${th}`, easyCheck: false,
          easy: `$J=\\begin{pmatrix}${a === 1 ? '' : a}\\cos\\theta&-${a === 1 ? '' : a}r\\sin\\theta\\\\${b === 1 ? '' : b}\\sin\\theta&${b === 1 ? '' : b}r\\cos\\theta\\end{pmatrix}$ に入れる`,
          calc: { kind: 'mat', want: W },
          verify: p => { const t = th * Math.PI / 180, h = 1e-6, f = (R, T) => [a * R * Math.cos(T), b * R * Math.sin(T)]; const dr = [0, 1].map(i => (f(rr + h, t)[i] - f(rr - h, t)[i]) / (2 * h)), dt = [0, 1].map(i => (f(rr, t + h)[i] - f(rr, t - h)[i]) / (2 * h)); return matIs(p, [[dr[0], dt[0]], [dr[1], dt[1]]], 1e-6); } };
      },
      // 図の腕（角は 90° の倍数）
      s3(r) {
        const [L1, L2] = r.pick(ARML), t1 = r.pick([0, 90, 180, -90]), t2 = r.pick([90, -90]);
        if (t1 === 90 && t2 === -90) return null;   // 左ページの例の角の組（腕がちがっても2行めが例と同じになる。O-2・R1-10）
        const ua = r.a20 || (r.a20 = new Set()); if (ua.has(`${t1},${t2}`)) return null;   // 同じ角の組を2回出さない
        ua.add(`${t1},${t2}`);
        const g = armOf(L1, L2, t1, t2);
        return { q: `図の2本の腕（${armTxt(g)}）のヤコビ行列 $J$`, a: `$${pmx(g.J)}$`, key: `arm|${L1},${L2}`, easyCheck: false, fig: armFig(g),
          easy: `$\\theta_1+\\theta_2=${deg(t1 + t2)}$。1行め $(-L_1\\sin\\theta_1-L_2\\sin(\\theta_1+\\theta_2),\\ -L_2\\sin(\\theta_1+\\theta_2))$ に入れる`,
          calc: { kind: 'mat', want: g.J }, verify: p => matIs(p, jacTrig(+L1, +L2, t1, t2), 1e-9) };
      },
      // わな：手の位置（7-55。ヤコビ行列ではない）
      trap(r) {
        const [L1, L2] = r.pick(ARML), t1 = r.pick([0, 90, 180, -90]), t2 = r.pick([90, -90]), g = armOf(L1, L2, t1, t2);
        return dest({ q: `${armTxt(g)} の2本の腕の手の位置（m）`, a: `$${vt(g.P.map(d2))}$`, key: `t20|${L1},${L2},${t1},${t2}`,
          verify: p => vecIs(p, [+L1 * Math.cos(t1 * Math.PI / 180) + +L2 * Math.cos((t1 + t2) * Math.PI / 180), +L1 * Math.sin(t1 * Math.PI / 180) + +L2 * Math.sin((t1 + t2) * Math.PI / 180)], 1e-9) }, '8-20',
          `偏微分ではなく、手の位置そのもの。$(L_1,\\ 0)$ を $\\theta_1$、$(L_2,\\ 0)$ を $\\theta_1+\\theta_2=${deg(t1 + t2)}$ 回してたす`, ['7-55']);
      },
    },
  });

  // ================================================================ 8-21
  const SIN = { 0: [0, 1], 30: [1, 2], 90: [1, 1], 150: [1, 2], 180: [0, 1], '-30': [-1, 2], '-90': [-1, 1], '-150': [-1, 2], 270: [-1, 1], 210: [-1, 2], 330: [-1, 2] };
  const L12 = (L1, L2) => r9(+L1 * +L2);
  const bad21 = (L1, L2, t2) => L1 === '0.30' && L2 === '0.25' && [30, 0, 180, -90].includes(t2);   // 左ページの例（O-2）
  const T1X = [0, 20, 30, 40, 45, 60, 90, 120, -30, -45];
  add({
    id: '8-21', part: 2, chap: '8-3⑦⑧ 例題6', stars: 1,
    title: '腕のヤコビアンは $L_1L_2\\sin\\theta_2$：ひじの角だけで決まる',
    mark: '腕の $\\det J$（ヤコビアン）、「手が動けない姿勢」。',
    futsu: ['4つの偏微分に角を入れて', 'ヤコビ行列 $J$ を作り、', 'たすきにかけてひいて', '行列式を出す。'],
    raku: ['$L_1=0.30$、$L_2=0.25$、$\\theta_2=30^{\\circ}$', '→ $0.075\\times0.5=0.0375$（肩の角は何度でも）', '$\\theta_2=0^{\\circ}$・$180^{\\circ}$ → 0（のびきる・折りたたむ）', '$\\theta_2=-90^{\\circ}$ → $-0.075$'],
    why: '$J$ を文字のまま計算すると、$L_2^{\\,2}$ の項は消えて、$\\theta_{12}=\\theta_1+\\theta_2$ の $\\sin$・$\\cos$ と $\\theta_1$ の $\\sin$・$\\cos$ の組が残る。加法定理でまとめると $L_1L_2\\sin(\\theta_{12}-\\theta_1)$、つまり $L_1L_2\\sin\\theta_2$（8-3 例題6）。ヤコビアンは「関節の角の小さな長方形が、手の場所で何倍の面積になるか」なので、腕の形（ひじの曲がり方）だけで決まる。',
    caution: '肩の角 $\\theta_1$ は効かない。ひじの角が $0^{\\circ}$・$180^{\\circ}$ なら0（特異姿勢。手はある向きに動けない）。ひじの角が負なら負。うで2の向きを水平からの角 $\\varphi$ で表すときは、ひじの角は $\\varphi-\\theta_1$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '22mm', trap: '30mm' },
    fits(q) { return /ヤコビアン|\\det J/.test(q); },
    steps: {
      // ひじの角が 30°・90°・150° など（sin が ±1・±0.5・0）
      s1(r) {
        const [L1, L2] = r.pick(ARML), t1 = r.pick(T1X), t2 = r.pick([30, 90, 150, -30, -90, -150]);
        if (bad21(L1, L2, t2)) return null;
        const [n, d] = SIN[t2], v = r9(L12(L1, L2) * n / d);
        if ([0.0375, 0.075].includes(Math.abs(v)) || (L1 === '0.30' && L2 === '0.25')) return null;   // 左ページの例の腕・同じ答え・符号を変えただけの答え（U-2）
        (r.v21 || (r.v21 = new Set())).add(Math.abs(v));
        return { q: `腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$）の、$\\theta_1=${deg(t1)}$、$\\theta_2=${deg(t2)}$ でのヤコビアン $\\det J$`, a: `$${nf(v)}$`, key: `21|${L1},${L2},${t1},${t2}`,
          easy: `$${L1}\\times${L2}\\times${par(n === 0 ? '0' : d === 1 ? String(n) : nf(n / d))}=${nf(v)}$`, easyCheck: 'last',
          verify: p => { const J = jacTrig(+L1, +L2, t1, t2); return valIs(p, J[0][0] * J[1][1] - J[0][1] * J[1][0], 1e-9); } };
      },
      // sin が √ の角（45°・60°・120°…）。答えは √ を残した形
      s2(r) {
        const o = r.s21 || (r.s21 = { n: r.int(0, 1), used: new Set() }), [L1, L2] = r.pick(ARML), t1 = r.pick(T1X), t2 = (o.n % 2 ? -1 : 1) * r.pick([45, 60, 120, 135]);
        if (o.used.has(Math.abs(t2)) || o.used.has(L1 + L2) || (L1 === '0.30' && L2 === '0.25')) return null;   // 同じひじの角・同じ腕を2回出さない。正・負を交互に（R1-16）。例の腕もよける
        o.n++; o.used.add(Math.abs(t2)); o.used.add(L1 + L2);
        const m = [45, 135, -45, -135].includes(t2) ? 2 : 3, sg = t2 < 0 ? -1 : 1, c = r9(sg * L12(L1, L2) / 2);
        return { q: `腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$）の、$\\theta_1=${deg(t1)}$、$\\theta_2=${deg(t2)}$ でのヤコビアン $\\det J$`, a: `$${surd(c, m)}$`, key: `21|${L1},${L2},${t1},${t2}`, easyCheck: false,
          easy: `$${L1}\\times${L2}\\times${sg < 0 ? '\\Bigl(-' : ''}\\dfrac{\\sqrt${m}}{2}${sg < 0 ? '\\Bigr)' : ''}$`,
          verify: p => { const J = jacTrig(+L1, +L2, t1, t2); return valIs(p, J[0][0] * J[1][1] - J[0][1] * J[1][0], 1e-9); } };
      },
      // 近似の値（$\sin45^{\circ}=0.707$ を文に）、うで2の向きを水平からの角 φ で
      s3(r) {
        const [L1, L2] = r.pick(ARML);
        const o = r.k21 || (r.k21 = { n: r.int(0, 1) });   // 2つの形を交互に（出した問題だけ進める）
        if (o.n % 2 === 0) {
          const t1 = r.pick([0, 30, 60]), t2 = r.pick([45, 135, 60, 120]), m = [45, 135].includes(t2) ? 2 : 3, sv = m === 2 ? '0.707' : '0.866';
          const tv = L12(L1, L2) * Math.sin(t2 * Math.PI / 180), a = agree(F.mul(F.fromDec(String(L12(L1, L2))), F.fromDec(sv)), tv, 4);
          if (!a) return null;
          o.n++;
          return { q: `腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$）の、$\\theta_1=${deg(t1)}$、$\\theta_2=${deg(t2)}$ でのヤコビアン $\\det J$（$\\sin${deg(t2)}=${sv}$。小数第4位まで）`, a: `約 $${a}$`, key: `21a|${L1},${L2},${t1},${t2}`,
            easy: `$${nf(L12(L1, L2))}\\times${sv}\\approx${a}$`, easyCheck: false, verify: p => valIs(p, Math.round(tv * 1e4) / 1e4, 1e-9) };
        }
        const t1 = r.pick([0, 30, 45, 60]), e = r.pick([30, 90, 150, -30, -90]), phi = t1 + e, [n, d] = SIN[e], v = r9(L12(L1, L2) * n / d);
        if ((L1 === '0.30' && L2 === '0.25') || (r.v21 && r.v21.has(Math.abs(v)))) return null;   // 左ページの例の腕（答えが例の符号ちがいになる。U-2）、s1 と同じ大きさの答え
        o.n++;
        return { q: `うで2の向きを水平からの角 $\\varphi$ で表した腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$）の、$\\theta_1=${deg(t1)}$、$\\varphi=${deg(phi)}$ でのヤコビアン $\\det J$`, a: `$${nf(v)}$`, key: `21p|${L1},${L2},${t1},${phi}`,
          easy: `ひじの角は $\\varphi-\\theta_1=${deg(e)}$。$${L1}\\times${L2}\\times${par(d === 1 ? String(n) : nf(n / d))}=${nf(v)}$`, easyCheck: 'last',
          verify: p => { const a = t1 * Math.PI / 180, b = phi * Math.PI / 180, J = [[-L1 * Math.sin(a), -L2 * Math.sin(b)], [L1 * Math.cos(a), L2 * Math.cos(b)]]; return valIs(p, J[0][0] * J[1][1] - J[0][1] * J[1][0], 1e-9); } };
      },
      // わな：1つの関節を少し回したときの手の動き（8-22）
      trap(r) {
        const [L1, L2] = r.pick(ARML), t1 = r.pick([0, 90, 180, -90]), t2 = r.pick([90, -90]), g = armOf(L1, L2, t1, t2), sh = r.chance(0.5), d = r.pick([0.01, 0.02, 0.04, -0.02]);
        const col = sh ? [g.J[0][0], g.J[1][0]] : [g.J[0][1], g.J[1][1]], w = col.map(x => r9(x * d));
        return dest({ q: `${armTxt(g)} の腕で、${sh ? '肩' : 'ひじ'}だけを $${nf(d)}\\,\\mathrm{rad}$ 回したときの手の動き（m）`, a: `$${vt(w)}$`, key: `t21|${L1},${L2},${t1},${t2}|${sh}|${d}`,
          verify: p => { const J = jacTrig(+L1, +L2, t1, t2), k = sh ? 0 : 1; return vecIs(p, [J[0][k] * d, J[1][k] * d], 1e-9); } }, '8-21',
          `面積の倍率ではなく、手の動き。$J$ の${sh ? '1' : '2'}列め $${vt(col.map(d2))}$ に $${nf(d)}$ をかける`, ['8-22']);
      },
    },
  });

  // ================================================================ 8-22
  const JE = [-0.40, -0.30, -0.25, -0.20, -0.15, 0.15, 0.20, 0.25, 0.30, 0.40];
  const DT22 = [0.01, 0.02, 0.04, 0.05, -0.01, -0.02, -0.03];
  const isEx22 = J => J[0][0] === -0.25 && J[0][1] === -0.25 && J[1][0] === 0.30 && J[1][1] === 0;   // 左ページの例の J（O-2）
  const mulJ = (J, d) => J.map(row => r9(row[0] * d[0] + row[1] * d[1]));
  const easy22 = (J, d, w) => `$\\dd x=${pn(J[0][0])}\\times${pn(d[0])}+${pn(J[0][1])}\\times${pn(d[1])}=${nf(w[0])}$、$\\dd y=${pn(J[1][0])}\\times${pn(d[0])}+${pn(J[1][1])}\\times${pn(d[1])}=${nf(w[1])}$`;
  const rad = v => `$${nf(v)}\\,\\mathrm{rad}$`;
  add({
    id: '8-22', part: 2, chap: '8-3⑦ 例題7', stars: 1,
    title: '$\\dd\\vec p=J\\,\\dd\\vec\\theta$：$J$ の行と回す角の内積（ラジアンで）',
    mark: '$J$ と「肩を □ rad、ひじを □ rad 回す」、手の動き。',
    futsu: ['回したあとの角で、手の位置を', '$\\cos$・$\\sin$ の式から計算し直し、', 'もとの手の位置をひく。'],
    raku: ['$J=\\begin{pmatrix}-0.25&-0.25\\\\0.30&0\\end{pmatrix}$', '肩 $0.04$、ひじ $-0.02$（rad）', '$\\dd x=-0.01+0.005=-0.005$', '$\\dd y=0.012$（m）'],
    why: '肩を $\\dd\\theta_1$、ひじを $\\dd\\theta_2$ だけ同時に少し回すと、手の位置の変化は全微分 $\\dd x=\\dfrac{\\partial x}{\\partial\\theta_1}\\,\\dd\\theta_1+\\dfrac{\\partial x}{\\partial\\theta_2}\\,\\dd\\theta_2$（$\\dd y$ も同じ）。これは行列×ベクトル $\\dd\\vec p=J\\,\\dd\\vec\\theta$ なので、$J$ の1行めと $(\\dd\\theta_1,\\ \\dd\\theta_2)$ の内積が $\\dd x$、2行めとの内積が $\\dd y$（8-3⑦。7-06 と同じ計算）。',
    caution: '角はラジアンで入れる。度のまま入れると約57倍になる（$1^{\\circ}=\\dfrac{\\pi}{180}\\,\\mathrm{rad}$）。行と内積をとる（列とではない）。小さく回したときの見積もりで、大きく回すとずれる。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '32mm', trap: '30mm' }, boxh: { trap: '11mm' },
    fits(q) { return /回す|回した/.test(q) && /手の動き/.test(q); },
    steps: {
      // J が与えられている
      s1(r) {
        const J = [[r.pick(JE), r.pick(JE)], [r.pick(JE), r.chance(0.3) ? 0 : r.pick(JE)]], d = [r.pick(DT22), r.pick(DT22)];
        if (isEx22(J)) return null;
        const w = mulJ(J, d);
        return { q: `$J=${pmx(J)}$ の腕で、肩を ${rad(d[0])}、ひじを ${rad(d[1])} 回したときの手の動き（m）`, a: `$${vt(w)}$`, key: `22|${J}|${d}`, easyCheck: false,
          easy: easy22(J, d, w), calc: { kind: 'vec', want: w }, verify: p => vecIs(p, [J[0][0] * d[0] + J[0][1] * d[1], J[1][0] * d[0] + J[1][1] * d[1]], 1e-9) };
      },
      // 腕の長さと角から J を作ってから
      s2(r) {
        const [L1, L2] = r.pick(ARML), t1 = r.pick([0, 90, 180, -90]), t2 = r.pick([90, -90]), g = armOf(L1, L2, t1, t2), d = [r.pick(DT22), r.pick(DT22)];
        if (isEx22(g.J)) return null;
        const w = mulJ(g.J, d);
        return { q: `${armTxt(g)} の腕で、肩を ${rad(d[0])}、ひじを ${rad(d[1])} 回したときの手の動き（m）`, a: `$${vt(w)}$`, key: `22a|${L1},${L2},${t1},${t2}|${d}`, easyCheck: false,
          easy: `$J=${pmx(g.J)}$。${easy22(g.J, d, w)}`, calc: { kind: 'vec', want: w },
          verify: p => { const J = jacTrig(+L1, +L2, t1, t2); return vecIs(p, [J[0][0] * d[0] + J[0][1] * d[1], J[1][0] * d[0] + J[1][1] * d[1]], 1e-9); } };
      },
      // 角を度で（$1^{\circ}=0.0175\,\mathrm{rad}$ を文に）
      s3(r) {
        const J = [[r.pick(JE), r.pick(JE)], [r.pick(JE), r.chance(0.3) ? 0 : r.pick(JE)]], dg = [r.pick([1, 2, 3, -1, -2]), r.pick([1, 2, -1, -2, -3])];
        if (isEx22(J)) return null;
        const C = F.fromDec('0.0175'), a = [0, 1].map(i => { const s = F.add(F.mul(F.fromDec(String(J[i][0])), F.make(dg[0])), F.mul(F.fromDec(String(J[i][1])), F.make(dg[1]))); const tv = (J[i][0] * dg[0] + J[i][1] * dg[1]) * Math.PI / 180; return agree(F.mul(s, C), tv, 4); });
        if (a.some(x => x == null || +x === 0)) return null;
        return { q: `$J=${pmx(J)}$ の腕で、肩を $${deg(dg[0])}$、ひじを $${deg(dg[1])}$ 回したときの手の動き（m。$1^{\\circ}=0.0175\\,\\mathrm{rad}$、小数第4位まで）`, a: `約 $(${a.join(',\\ ')})$`, key: `22d|${J}|${dg}`, easyCheck: false,
          easy: `ラジアンにして肩 $${nf(dg[0] * 0.0175)}$、ひじ $${nf(dg[1] * 0.0175)}$。$J$ の行との内積`,
          verify: p => vecIs(p, [0, 1].map(i => Math.round((J[i][0] * dg[0] + J[i][1] * dg[1]) * Math.PI / 180 * 1e4) / 1e4), 1e-9) };
      },
      // わな：手を決まっただけ動かす関節の角（7-39。逆行列）
      trap(r) {
        for (let k = 0; k < 20; k++) {
          const [L1, L2] = r.pick(ARML), t1 = r.pick([0, 90, 180, -90]), t2 = r.pick([90, -90]), g = armOf(L1, L2, t1, t2), dp = r.pick([[0.01, 0], [0, 0.01], [-0.01, 0], [0, -0.02], [0.02, 0]]);
          const J = g.J.map(row => row.map(x => F.fromDec(String(x)))), det = F.sub(F.mul(J[0][0], J[1][1]), F.mul(J[0][1], J[1][0]));
          const P = dp.map(x => F.fromDec(String(x)));
          const th = [F.div(F.sub(F.mul(J[1][1], P[0]), F.mul(J[0][1], P[1])), det), F.div(F.sub(F.mul(J[0][0], P[1]), F.mul(J[1][0], P[0])), det)];
          const tx = th.map(fx);
          if (tx.some(s => s.length > 14)) continue;
          const vec = th.some(f => f[1] !== 1 && !dec(f)) ? `\\left(${tx.join(',\\ ')}\\right)` : `(${tx.join(',\\ ')})`;
          return dest({ q: `$J=${pmx(g.J)}$ の腕で、手を $${vt(dp)}$（m）だけ動かすための、肩とひじの回す角 $(\\dd\\theta_1,\\ \\dd\\theta_2)$（rad）`, a: `$${vec}$`, key: `t22|${g.J}|${dp}`,
            verify: p => { const v = vecOf(p.a); return (v && near(g.J[0][0] * v[0] + g.J[0][1] * v[1], dp[0], 1e-9) && near(g.J[1][0] * v[0] + g.J[1][1] * v[1], dp[1], 1e-9)) || `答え ${p.a} で手が ${vt(dp)} 動かない`; } }, '8-22',
            `手の動きから、関節の角を逆に求める。$\\dd\\vec\\theta=J^{-1}\\dd\\vec p$（逆行列。$\\det J=${fx(det)}$）`, ['7-39']);
        }
        return null;
      },
    },
  });

  // ================================================================ 8-23〜8-26 の点
  // 主役の山で、勾配が 3・4・5 の組などになる点（長さが小数で出る）。符号は問題ごとにつける
  const PY = [[15, 10], [30, 20], [40, 15], [25, 30], [45, 30], [6, 4], [8, 3], [12, 8], [16, 6], [18, 12], [24, 9], [10, 12], [24, 5], [20, 24], [48, 10], [15, 4], [21, 10], [14, 24], [48, 7], [7, 12], [60, 40], [0, 25], [50, 0], [0, 10], [20, 0]];
  const signed = (r, pts) => { const [x, y] = r.pick(pts); return [x * sgnR(r) || 0, y * sgnR(r) || 0]; };
  // ふつうの点（5 の倍数。高さ 10 m より上）
  function ptMain(r) {
    for (let k = 0; k < 30; k++) { const x = 5 * r.int(-10, 10), y = 5 * r.int(-6, 6); if ((x || y) && H(x, y) > 10) return [x, y]; }
    return null;
  }
  const gradTxt = g => `$\\mathrm{grad}\\,h=${vt(g)}$`;

  // ================================================================ 8-23
  // ほかの山 g=c-px^2-qy^2（ステップ3）
  const HILL = [[80, 0.005, 0.02], [60, 0.03, 0.01], [50, 0.01, 0.01], [120, 0.02, 0.005], [90, 0.04, 0.01], [70, 0.01, 0.03]];
  add({
    id: '8-23', part: 2, chap: '8-4③ 例題1', stars: 1,
    title: 'grad は東の坂と北の坂を並べた矢印：ボールはその反対へ',
    mark: '$\\mathrm{grad}\\,h$、「いちばん急な坂」「ボールが転がりはじめる向き」。',
    futsu: ['いろいろな向きに少し進んだ', '高さの変化を1つずつ計算して、', 'いちばん大きく上がる向きと、', 'その坂をさがす。'],
    raku: ['点 $(15,\\ 10)$：$\\mathrm{grad}\\,h=(-0.3,\\ -0.4)$', '坂の大きさ $\\sqrt{0.09+0.16}=0.5$', 'ボールは $(0.3,\\ 0.4)$ の向き', '（grad の向きではない）'],
    why: '東の坂 $\\dfrac{\\partial h}{\\partial x}$ と北の坂 $\\dfrac{\\partial h}{\\partial y}$ を並べた矢印 $\\mathrm{grad}\\,h$ は、等高線と直角で、いちばん急な上りの向きを向き、その長さがいちばん急な坂の傾き（8-4③⑤）。ボールは下りへ転がるので、その反対 $-\\mathrm{grad}\\,h$ の向き。主役の山では $\\mathrm{grad}\\,h=(-0.02x,\\ -0.04y)$。',
    caution: 'grad を $-0.3-0.4=-0.7$ のように1つの数にしない（矢印）。ボールの向きは grad の反対。いちばん急な上りは、頂上へまっすぐ向かう向きとはかぎらない。坂の大きさは傾き（角度ではない）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '26mm', s3: '26mm', trap: '20mm' },
    fits(q) {
      if (/進む|長さ1|等高線|左回り|ずれた|電位|位置エネルギー|温度/.test(q)) return false;
      return /転がりはじめる向き/.test(q) || (/(h|g)=[0-9]/.test(q) && /\\mathrm\{grad\}\\,[hg]|坂の大きさ/.test(q));
    },
    steps: {
      s1(r) {
        const P = r.chance(0.5) ? signed(r, PY) : ptMain(r); if (!P) return null;
        const [x, y] = P; if (x === 15 && y === 10) return null;   // 左ページの例（O-2）
        if (H(x, y) <= 10) return null;
        const g = gH(x, y);
        return { q: `${MT} の点 ${PT(x, y)} での $\\mathrm{grad}\\,h$`, a: `$${vt(g)}$`, key: `23|${x},${y}`, easyCheck: false,
          easy: `$(-0.02\\times${par(x)},\\ -0.04\\times${par(y)})$`,
          calc: { kind: 'pdiff', op: 'grad', f: '100-0.01x^2-0.02y^2', vars: ['x', 'y'], at: [x, y] } };
      },
      // 坂の大きさ（√ を残す）、ボールの向き
      s2(r) {
        const P = r.chance(0.5) ? signed(r, PY) : ptMain(r); if (!P) return null;
        const [x, y] = P; if ((x === 15 && y === 10) || H(x, y) <= 10) return null;
        const g = gH(x, y);
        if (turn(r, '23s2', 2) === 0) {
          const R = rootOf(g[0] * g[0] + g[1] * g[1]);
          if (R.tex === '0.5') return null;   // 例と同じ答え
          return { q: `${MT} の点 ${PT(x, y)} で、いちばん急な上りの坂の大きさ`, a: `$${R.tex}$`, key: `23|${x},${y}`, easyCheck: false,
            easy: `$\\mathrm{grad}\\,h=${vt(g)}$、長さ $\\sqrt{${nf(g[0] * g[0])}+${nf(g[1] * g[1])}}$`, verify: p => valIs(p, Math.hypot(0.02 * x, 0.04 * y), 1e-9) };
        }
        const w = g.map(v => r9(-v));
        if (w[0] === 0.3 && w[1] === 0.4) return null;
        return { q: `${MT} の点 ${PT(x, y)} で、ボールが転がりはじめる向き（成分の組で）`, a: `$${vt(w)}$`, key: `23|${x},${y}`, easyCheck: false,
          easy: `$\\mathrm{grad}\\,h=${vt(g)}$ の反対`, calc: { kind: 'vec', want: w }, verify: p => vecIs(p, [0.02 * x, 0.04 * y]) };
      },
      // ほかの山
      s3(r) {
        const [c, a, b] = r.pick(HILL), x = r.pick([-20, -10, 10, 20, 30]), y = r.pick([-20, -10, 10, 20]);
        const gv = c - a * x * x - b * y * y; if (gv <= 5) return null;
        const g = [r9(-2 * a * x), r9(-2 * b * y)], f = `g=${c}-${nf(a)}x^2-${nf(b)}y^2`, k = turn(r, '23s3', 3);
        if (k === 0) return { q: `山 $${f}$ の点 ${PT(x, y)} での $\\mathrm{grad}\\,g$`, a: `$${vt(g)}$`, key: `23g|${f}|${x},${y}`, easyCheck: false,
          easy: `$(-${nf(2 * a)}x,\\ -${nf(2 * b)}y)$ に入れる`, calc: { kind: 'pdiff', op: 'grad', f: `${c}-${a}x^2-${b}y^2`, vars: ['x', 'y'], at: [x, y] } };
        if (k === 1) { const R = rootOf(g[0] * g[0] + g[1] * g[1]); return { q: `山 $${f}$ の点 ${PT(x, y)} で、いちばん急な上りの坂の大きさ`, a: `$${R.tex}$`, key: `23gm|${f}|${x},${y}`, easyCheck: false,
          easy: `$\\mathrm{grad}\\,g=${vt(g)}$ の長さ`, verify: p => valIs(p, Math.hypot(2 * a * x, 2 * b * y), 1e-9) }; }
        const w = g.map(v => r9(-v));
        return { q: `山 $${f}$ の点 ${PT(x, y)} で、ボールが転がりはじめる向き（成分の組で）`, a: `$${vt(w)}$`, key: `23gb|${f}|${x},${y}`, easyCheck: false,
          easy: `$\\mathrm{grad}\\,g=${vt(g)}$ の反対`, calc: { kind: 'vec', want: w }, verify: p => vecIs(p, [2 * a * x, 2 * b * y]) };
      },
      // わな：北東に進むときの坂（8-24。長さ1の矢印との内積）
      trap(r) {
        const P = signed(r, PY.slice(0, 20)); const [x, y] = P;
        if (H(x, y) <= 10) return null;
        const g = gH(x, y), c = r9((g[0] + g[1]) / 2);
        if (c === 0) return null;
        return dest({ q: `${MT} の点 ${PT(x, y)} で、北東に進むときの坂`, a: `$${surd(c, 2)}$`, key: `23|${x},${y}`,
          verify: p => valIs(p, (-0.02 * x - 0.04 * y) / Math.SQRT2, 1e-9) }, '8-23',
          `いちばん急な向きではなく、決まった向きの坂。$\\mathrm{grad}\\,h=${vt(g)}$ と長さ1の $\\Bigl(\\dfrac{1}{\\sqrt2},\\ \\dfrac{1}{\\sqrt2}\\Bigr)$ の内積`, ['8-24']);
      },
    },
  });

  // ================================================================ 8-24
  const DIR8 = { 東: [1, 0], 西: [-1, 0], 北: [0, 1], 南: [0, -1], 北東: [1, 1], 北西: [-1, 1], 南東: [1, -1], 南西: [-1, -1] };
  const GR24 = [-1.2, -1, -0.8, -0.6, -0.4, -0.3, -0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2];
  // 方角の坂：c√2 か数
  const compassSlope = (g, nm) => { const [a, b] = DIR8[nm]; return a && b ? { tex: surd(r9((a * g[0] + b * g[1]) / 2), 2), val: (a * g[0] + b * g[1]) / Math.SQRT2 } : { tex: nf(a * g[0] + b * g[1]), val: a * g[0] + b * g[1] }; };
  const VEC24 = [[3, 4, 5], [4, 3, 5], [-3, 4, 5], [3, -4, 5], [-4, 3, 5], [4, -3, 5], [-3, -4, 5], [-4, -3, 5]];
  const VEC3 = [[1, 2, 2], [2, 1, 2], [2, 2, 1], [2, -1, 2], [-1, 2, 2], [2, 2, -1], [1, -2, 2]];
  add({
    id: '8-24', part: 2, chap: '8-4④ 例題2', stars: 1,
    title: 'どの向きの坂も、長さ1の矢印との内積',
    mark: '「北東（南西・北西）に進むときの坂」、方向微分。',
    futsu: ['その向きに少し進んだ点の高さを', '山の式で計算し、もとの高さを', 'ひいて、進んだ長さでわる。'],
    raku: ['$\\mathrm{grad}\\,h=(-0.6,\\ -0.8)$', '東 $(1,\\ 0)$ → $-0.6$', '北西 $\\Bigl(-\\dfrac{1}{\\sqrt2},\\ \\dfrac{1}{\\sqrt2}\\Bigr)$ → $\\dfrac{0.6-0.8}{\\sqrt2}=-0.1\\sqrt2$', '（$(-1,\\ 1)$ のままだと $-0.2$）'],
    why: '長さ1の矢印 $\\vec e=(e_x,\\ e_y)$ の向きに短い長さ $s$ だけ進むと、東へ $e_xs$、北へ $e_ys$ 進んだことになるので、全微分から $\\dfrac{\\dd h}{s}=\\dfrac{\\partial h}{\\partial x}e_x+\\dfrac{\\partial h}{\\partial y}e_y=\\mathrm{grad}\\,h\\cdot\\vec e$（方向微分。8-4④）。1 m あたりの坂にするので、$\\vec e$ は長さ1にする。',
    caution: '$(1,\\ 1)$ のままの内積は、$\\sqrt2$ m 進んだときの変化（坂の $\\sqrt2$ 倍）。$(3,\\ 4)$ の向きなら5でわって $(0.6,\\ 0.8)$。正なら上り、負なら下り。答えは $\\dfrac{a}{\\sqrt2}=\\dfrac{a}{2}\\sqrt2$ の形に。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '30mm' },
    fits(q) { return /進むときの( ?\$[^$]*\$ の)?坂/.test(q); },
    steps: {
      // grad と方角
      s1(r) {
        const g = [r.pick(GR24), r.pick(GR24)], nm = r.pick(['北東', '北西', '南東', '南西', '北東', '北西', '南東', '南西', '東', '西', '北', '南']);
        if (g[0] === -0.6 && g[1] === -0.8) return null;   // 左ページの例（O-2）
        const s = compassSlope(g, nm);
        if (s.tex === '-0.1\\sqrt2' || s.tex === '-0.6') return null;
        return { q: `${gradTxt(g)} の点で、${nm}に進むときの坂`, a: `$${s.tex}$`, key: `24|${g}|${nm}`, easyCheck: false,
          easy: `$${vt(g)}$ と長さ1の矢印 $${vt(DIR8[nm].map(v => (v ? (v < 0 ? '-' : '') + (DIR8[nm][0] && DIR8[nm][1] ? '\\frac{1}{\\sqrt2}' : '1') : '0')))}$ の内積`,
          verify: p => valIs(p, (g[0] * DIR8[nm][0] + g[1] * DIR8[nm][1]) / Math.hypot(...DIR8[nm]), 1e-9) };
      },
      // 主役の山の点と、向きの矢印（長さ1でない）
      s2(r) {
        const P = ptMain(r); if (!P) return null;
        const [x, y] = P, g = gH(x, y);
        if (x === 30 && y === 20) return null;
        if (turn(r, '24s2', 2) === 0) {
          const [vx, vy, L] = r.pick(VEC24), v = r9((g[0] * vx + g[1] * vy) / L);
          return { q: `${MT} の点 ${PT(x, y)} で、$(${vx},\\ ${vy})$ の向きに進むときの坂`, a: `$${nf(v)}$`, key: `24|${x},${y}`, easyCheck: false,
            easy: `長さ1の矢印は $${vt([vx / L, vy / L])}$。$${vt(g)}$ との内積`, verify: p => valIs(p, (-0.02 * x * vx - 0.04 * y * vy) / Math.hypot(vx, vy), 1e-9) };
        }
        const nm = r.pick(['北東', '北西', '南東', '南西']), s = compassSlope(g, nm);
        if (s.tex === '0' || s.tex === '-0.1\\sqrt2') return null;
        return { q: `${MT} の点 ${PT(x, y)} で、${nm}に進むときの坂`, a: `$${s.tex}$`, key: `24|${x},${y}`, easyCheck: false,
          easy: `${gradTxt(g)} と長さ1の矢印の内積`, verify: p => valIs(p, (-0.02 * x * DIR8[nm][0] - 0.04 * y * DIR8[nm][1]) / Math.SQRT2, 1e-9) };
      },
      // 近似の値（$\frac{1}{\sqrt2}=0.707$ を文に）、3次元
      s3(r) {
        if (turn(r, '24s3', 2) === 0) {
          const g = [r.pick(GR24), r.pick(GR24)], nm = r.pick(['北東', '北西', '南東', '南西']), [a, b] = DIR8[nm];
          if (g[0] === -0.6 && g[1] === -0.8) return null;
          const sum = r9(a * g[0] + b * g[1]); if (sum === 0) return null;
          const ap = agree(F.mul(F.fromDec(String(sum)), F.fromDec('0.707')), sum / Math.SQRT2, 3); if (!ap) return null;
          return { q: `${gradTxt(g)} の点で、${nm}に進むときの坂（$\\dfrac{1}{\\sqrt2}=0.707$。小数第3位まで）`, a: `約 $${ap}$`, key: `24a|${g}|${nm}`, easyCheck: false,
            easy: `$${nf(sum)}\\times0.707\\approx${ap}$`, verify: p => valIs(p, Math.round(sum / Math.SQRT2 * 1000) / 1000, 1e-9) };
        }
        for (let k = 0; k < 20; k++) {
          const g = [r.int(-4, 6), r.int(-4, 6), r.int(-4, 6)], [vx, vy, vz] = r.pick(VEC3), dot = g[0] * vx + g[1] * vy + g[2] * vz;
          if (g.filter(v => v === 0).length > 1 || dot % 3 !== 0 || dot === 0) continue;
          return { q: `$\\mathrm{grad}\\,T=${vt(g)}$ の点で、$(${vx},\\ ${vy},\\ ${vz})$ の向きに進むときの $T$ の坂（1 m あたり）`, a: `$${dot / 3}$`, key: `24t|${g}|${vx},${vy},${vz}`, easyCheck: false,
            easy: `長さは $\\sqrt{${vx * vx}+${vy * vy}+${vz * vz}}=3$。$${vt(g)}$ との内積 $${dot}$ を3でわる`, verify: p => valIs(p, (g[0] * vx + g[1] * vy + g[2] * vz) / Math.hypot(vx, vy, vz), 1e-9) };
        }
        return null;
      },
      // わな：坂がいちばん急になる向き（8-25）
      trap(r) {
        const [x, y] = signed(r, PY.slice(0, 20)); if (H(x, y) <= 10 || (x === 30 && y === 20)) return null;
        const g = gH(x, y), L = Math.hypot(...g), u = g.map(v => F.div(F.fromDec(String(v)), F.fromDec(String(r9(L)))));
        if (!Number.isInteger(r9(L * 100))) return null;
        const tx = u.map(fx), vec = u.some(f => f[1] !== 1 && !dec(f)) ? `\\left(${tx.join(',\\ ')}\\right)` : `(${tx.join(',\\ ')})`;
        return dest({ q: `${MT} の点 ${PT(x, y)} で、坂がいちばん急な上りになる向き（長さ1の矢印）`, a: `$${vec}$`, key: `24|${x},${y}`, calc: { kind: 'vec', want: g.map(v => v / L) } }, '8-24',
          `向きを決めた坂ではなく、いちばん急な向きを聞いている。$\\mathrm{grad}\\,h=${vt(g)}$ をその長さ $${nf(L)}$ でわる`, ['8-25']);
      },
    },
  });

  // ================================================================ 8-25
  const TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  // ステップ2の点：PY に、8・15・17、20・21・29、9・40・41 の組になる点を足す（3・4・5 と 5・12・13 は例の何倍か・入れかえになるため）
  const PY25 = [[15, 4], [21, 10], [14, 24], [48, 7], [7, 12], [30, 8], [16, 15], [40, 21], [18, 40]];
  // 答えの成分の大きさの組。同じ組は1つのステップに1回、見開きに2回まで（Z-2）
  const triOK25 = (r, st, u) => { const k = u.map(f => Math.abs(f[0] / f[1]).toFixed(6)).sort().join(), d = r.tri25 || (r.tri25 = {}); if ((d[k] || []).includes(st) || (d[k] || []).length >= 2) return false; (d[k] = d[k] || []).push(st); return true; };
  // 長さ1の矢印（成分が分数なら \left( \right)）
  function unitTex(g) {
    const L = F.fromDec(String(r9(Math.hypot(...g)))), u = g.map(v => F.div(F.fromDec(String(v)), L)), tx = u.map(fx);
    return { u, tex: u.some(f => f[1] !== 1 && !dec(f)) ? `\\left(${tx.join(',\\ ')}\\right)` : `(${tx.join(',\\ ')})` };
  }
  // 左ページの例の答え $(-0.6,\ -0.8)$・$\Bigl(\dfrac{12}{13},\ -\dfrac{5}{13}\Bigr)$ と、符号を変えた・入れかえただけのもの（成分の大きさの組が同じ。O-2・U-2・R1-11）
  const exAns25 = u => { const a = u.map(f => Math.abs(f[0] / f[1])).sort((x, y) => x - y); return [[0.6, 0.8], [5 / 13, 12 / 13]].some(e => a.length === 2 && near(a[0], e[0]) && near(a[1], e[1])); };
  add({
    id: '8-25', part: 2, chap: '8-4⑤ 例題3', stars: 1,
    title: 'いちばん急な上りの向きは grad÷その長さ',
    mark: '「いちばん急な上りの向き（長さ1の矢印で）」。',
    futsu: ['いろいろな向きの長さ1の矢印で', '坂（内積）を計算してくらべ、', 'いちばん大きいものをさがす。'],
    raku: ['$\\mathrm{grad}\\,h=(-0.3,\\ -0.4)$ → 長さ $0.5$', '→ $(-0.6,\\ -0.8)$', '$(1.2,\\ -0.5)$ → 長さ $1.3$', '→ $\\Bigl(\\dfrac{12}{13},\\ -\\dfrac{5}{13}\\Bigr)$'],
    why: '坂は $\\mathrm{grad}\\,h\\cdot\\vec e=\\lvert\\mathrm{grad}\\,h\\rvert\\cos\\theta$（$\\theta$ は grad からの角）なので、$\\vec e$ が grad と同じ向き（$\\theta=0^{\\circ}$）のときいちばん大きい（8-4⑤）。向きだけがほしいので、grad をその長さでわって長さ1にする。いちばん急な下りは、その反対。',
    caution: 'grad そのもの（長さ1でない）を答えにしない。長さは $\\sqrt{a^2+b^2}$（$a+b$ ではない）。下りの向きは、2つの成分の符号を両方変える。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '34mm', trap: '20mm' }, boxh: { s1: '11mm', s3: '11mm' },
    fits(q) { return /いちばん急/.test(q) && /長さ1/.test(q) && /向き/.test(q); },
    steps: {
      // grad が与えられている（3・4・5 などの組）
      s1(r) {
        const [p, q, n] = r.pick(TRI), k = r.pick([0.1, 0.2, 0.04, 0.05, 0.3]), sw = r.chance(0.5), g = (sw ? [q, p] : [p, q]).map(v => r9(v * k * sgnR(r)));
        const U = unitTex(g); if (exAns25(U.u) || !triOK25(r, 1, U.u)) return null;
        return { q: `${gradTxt(g)} の点で、いちばん急な上りの向き（長さ1の矢印）`, a: `$${U.tex}$`, key: `25|${g}`, easyCheck: false,
          easy: `長さ $\\sqrt{${nf(g[0] * g[0])}+${nf(g[1] * g[1])}}=${nf(n * k)}$ でわる`, calc: { kind: 'vec', want: g.map(v => v / Math.hypot(...g)) } };
      },
      // 主役の山の点（上り・下り）
      s2(r) {
        const [x, y] = signed(r, PY25); if (H(x, y) <= 10 || (x === 15 && y === 10)) return null;
        const g = gH(x, y), o = r.ud25 || (r.ud25 = { n: r.int(0, 1) }), up = o.n % 2 === 0, w = up ? g : g.map(v => r9(-v)), U = unitTex(w);
        if (exAns25(U.u) || !triOK25(r, 2, U.u)) return null;
        o.n++;   // 上り・下りを交互に（出した問題だけ進める。U-3）
        return { q: `${MT} の点 ${PT(x, y)} で、いちばん急な${up ? '上り' : '下り'}の向き（長さ1の矢印）`, a: `$${U.tex}$`, key: `25|${x},${y}`, easyCheck: false,
          easy: `${gradTxt(g)}${up ? ' ' : ' の反対'}を、長さ $${nf(Math.hypot(...g))}$ でわる`, calc: { kind: 'vec', want: w.map(v => v / Math.hypot(...w)) } };
      },
      // √ の残る向き（$x=2y$ の点）、3次元の温度
      s3(r) {
        if (turn(r, '25s3', 2) === 0) {
          const y = r.pick([5, 10, 15, 20]) * sgnR(r), x = 2 * y * sgnR(r), g = gH(x, y), up = r.chance(0.5), w = up ? g : g.map(v => r9(-v));
          const s = w.map(v => (v < 0 ? '-' : '') + '\\dfrac{\\sqrt2}{2}');
          return { q: `${MT} の点 ${PT(x, y)} で、いちばん急な${up ? '上り' : '下り'}の向き（長さ1の矢印）`, a: `$\\left(${s.join(',\\ ')}\\right)$`, key: `25|${x},${y}`, easyCheck: false,
            easy: `${gradTxt(g)}${up ? '' : ' の反対'}。2つの成分の大きさが同じなので $\\dfrac{1}{\\sqrt2}=\\dfrac{\\sqrt2}{2}$`, calc: { kind: 'vec', want: w.map(v => v / Math.hypot(...w)) } };
        }
        const [a, b, c] = r.pick([[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9]]), n = Math.hypot(a, b, c), k = r.pick([1, 2, 3]), perm = r.shuffle([a, b, c]).map(v => v * k * sgnR(r));
        const tx = perm.map(v => dfr(F.make(v, n * k)));
        return { q: `$\\mathrm{grad}\\,T=${vt(perm)}$ の点で、温度がいちばん急に上がる向き（長さ1の矢印）`, a: `$\\left(${tx.join(',\\ ')}\\right)$`, key: `25t|${perm}`, easyCheck: false,
          easy: `長さ $\\sqrt{${perm.map(v => v * v).join('+')}}=${n * k}$ でわる`, calc: { kind: 'vec', want: perm.map(v => v / (n * k)) } };
      },
      // わな：等高線の接線の傾き（8-26）
      trap(r) {
        const [x, y] = signed(r, PY.slice(0, 21)); if (H(x, y) <= 10 || y === 0 || x === 0) return null;
        const g = gH(x, y), s = F.div(F.fromDec(String(-g[0])), F.fromDec(String(g[1])));
        return dest({ q: `${MT} の点 ${PT(x, y)} を通る等高線の接線の傾き $\\dfrac{\\dd y}{\\dd x}$`, a: `$${fx(s)}$`, key: `25|${x},${y}`,
          verify: p => valIs(p, -(0.02 * x) / (0.04 * y), 1e-9) }, '8-25',
          `いちばん急な向きではなく、等高線（grad と直角）の傾き。$\\mathrm{grad}\\,h=${vt(g)}$ から $-\\dfrac{${nf(g[0])}}{${nf(g[1])}}$`, ['8-26']);
      },
    },
  });

  // ================================================================ 8-26
  // 等高線の向き：grad (a, b) と直角な (b, -a) を、いちばん小さい整数の組に（x の成分を正。0 なら y を正）
  function contourDir(g) {
    let v = [g[1], -g[0]].map(x => Math.round(x * 10000));
    const k = gcd(v[0], v[1]); v = v.map(x => x / k);
    if (v[0] < 0 || (v[0] === 0 && v[1] < 0)) v = v.map(x => -x || 0);
    return v;
  }
  // 検算：答えの矢印が grad と直角で、0 の矢印でない（何倍でも・反対向きでも正。V-3）
  const perpIs = (p, g) => { const v = vecOf(p.a); return (v && v.length === 2 && Math.hypot(...v) > 1e-9 && Math.abs(v[0] * g[0] + v[1] * g[1]) <= 1e-9 * Math.max(1, Math.hypot(...v))) || `答え ${p.a} が grad と直角でない`; };
  const ANCH8 = ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'];
  const anch = v => ANCH8[Math.round(((Math.atan2(v[1], v[0]) * 180 / Math.PI + 360) % 360) / 45) % 8];
  // 図：主役の山の等高線（だ円）と、点 P と、P の grad の矢印（向きだけ。長さは図で決めた長さ）。答えの等高線の向きはかかない
  function figContour(x, y) {
    const G = M.graph({ x0: -66, x1: 66, y0: -46, y1: 46, w: 9.24, h: 6.44 });   // x と y を同じ倍率（1単位＝0.07）
    const its = [...G.axes({ x: 'x', y: 'y', o: false })], hp = H(x, y);
    const ell = (c, st) => { const a = Math.sqrt((100 - c) / 0.01); return ['ellipse', [0, 0], a * G.sx, a / Math.SQRT2 * G.sy, null, null, st || {}]; };
    [96, 84, 64].forEach(c => { if (Math.abs(c - hp) > 5) its.push(ell(c)); });
    its.push(ell(hp, { thick: true }));
    const g = gH(x, y), L = Math.hypot(...g), u = [g[0] / L, g[1] / L], P = G.T(x, y), Q = [P[0] + u[0] * 1.6, P[1] + u[1] * 1.6];
    // 矢印は1本だけなので、grad の文字は書かない（文で「grad h の矢印」と言う。軸・等高線と文字が重ならないように）
    its.push(['seg', P, Q, { arrow: true, thick: true }], ['dot', P], ['label', P, 'P', anch([-u[0], -u[1]])]);
    return { s: 4.8, items: its };
  }
  // 左ページの例（grad $(0.2,\ -0.8)$、向き $(4,\ 1)$、傾き $0.25$）の入れかえ・符号ちがい（向きの成分の大きさが 1 と 4、傾きの大きさが $\frac14$・4）（O-2・R1-12）
  const exDir26 = d => [Math.abs(d[0]), Math.abs(d[1])].sort((a, b) => a - b).join() === '1,4';
  const exSl26 = s => F.eq(s, F.make(1, 4)) || F.eq(s, F.make(-1, 4)) || F.eq(s, F.make(4)) || F.eq(s, F.make(-4));
  const FIG26 = [[30, 20], [-30, 20], [30, -20], [-30, -20], [40, 15], [-40, 15], [40, -15], [-40, -15], [50, 10], [-50, -10], [20, 25], [-20, -25]];   // 軸の上の点は、矢印が軸と重なるのでよける
  add({
    id: '8-26', part: 2, chap: '8-4⑤ 例題4', stars: 1,
    title: '等高線の向きは grad と直角：$(a,\\ b)\\to(b,\\ -a)$',
    mark: '「等高線の向き（1つの矢印）」「接線の傾き」。',
    futsu: ['その点を通る等高線のだ円の式を', '作り、$y$ を $x$ で微分して', '接線の傾きを出し、', '向きの矢印にする。'],
    raku: ['点 $(-10,\\ 20)$：$\\mathrm{grad}\\,h=(0.2,\\ -0.8)$', '等高線の向き $(-0.8,\\ -0.2)$（$(4,\\ 1)$ でも）', '内積 $-0.16+0.16=0$', '傾き $-\\dfrac{0.2}{-0.8}=0.25$'],
    why: '等高線にそって進むと高さは変わらないので、その向きの坂 $\\mathrm{grad}\\,h\\cdot\\vec e$ は0。内積が0なので、等高線の向きは grad と直角（8-4⑤）。$(a,\\ b)$ と直角な矢印の1つは、入れかえて片方の符号を変えた $(b,\\ -a)$。接線の傾きは「$y$ の成分÷$x$ の成分」で $-\\dfrac{a}{b}$。',
    caution: '向きは何倍でも、反対向きでもよい（$(4,\\ 1)$ も $(-4,\\ -1)$ も正）。入れかえるだけで符号を変えないと直角にならない。傾きは $\\dfrac{b}{a}$ ではない（それは grad の傾き）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '22mm', s3: '22mm', trap: '20mm' },
    fits(q) { return /等高線の(向き|接線)/.test(q); },
    steps: {
      // grad が与えられている
      s1(r) {
        const g = [r.pick(GR24), r.pick(GR24)], d = contourDir(g);
        if (exDir26(d)) return null;   // 左ページの例の答え（入れかえ・符号ちがいも。O-2・R1-12）
        return { q: `${gradTxt(g)} の点を通る等高線の向き（1つの矢印）`, a: `$${vt(d)}$`, key: `26|${d}|${g}`, easyCheck: false,
          easy: `入れかえて片方の符号を変えた $${vt([g[1], r9(-g[0])])}$（何倍でも、反対向きでもよい）`, verify: p => perpIs(p, g) };
      },
      // 主役の山の点：向き、接線の傾き
      s2(r) {
        const P = r.chance(0.5) ? signed(r, PY) : ptMain(r); if (!P) return null;
        const [x, y] = P, g = gH(x, y); if (H(x, y) <= 10 || (x === -10 && y === 20)) return null;
        if (turn(r, '26s2', 2) === 0) {
          const d = contourDir(g); if (exDir26(d)) return null;
          return { q: `${MT} の点 ${PT(x, y)} を通る等高線の向き（1つの矢印）`, a: `$${vt(d)}$`, key: `26|${x},${y}`, easyCheck: false,
            easy: `${gradTxt(g)} と直角な $${vt([g[1], r9(-g[0])])}$`, verify: p => perpIs(p, [-0.02 * x, -0.04 * y]) };
        }
        if (y === 0) return null;
        const s = F.div(F.fromDec(String(-g[0])), F.fromDec(String(g[1])));
        if (exSl26(s)) return null;
        return { q: `${MT} の点 ${PT(x, y)} を通る等高線の接線の傾き $\\dfrac{\\dd y}{\\dd x}$`, a: `$${fx(s)}$`, key: `26|${x},${y}`, easyCheck: false,
          easy: `${gradTxt(g)}。$-\\dfrac{${nf(g[0])}}{${nf(g[1])}}$`, verify: p => valIs(p, -(0.02 * x) / (0.04 * y), 1e-9) };
      },
      // 図（等高線と grad の矢印）
      s3(r) {
        const [x, y] = r.pick(FIG26), g = gH(x, y);
        if (turn(r, '26s3', 2) === 0 || y === 0) {
          const d = contourDir(g); if (exDir26(d)) return null;
          return { q: `図は ${MT} の等高線と、点 P${PT(x, y)} の $\\mathrm{grad}\\,h$ の矢印。P を通る等高線の向き（1つの矢印）`, a: `$${vt(d)}$`, key: `26|${x},${y}`, easyCheck: false, fig: figContour(x, y),
            easy: `${gradTxt(g)} と直角な $${vt([g[1], r9(-g[0])])}$`, verify: p => perpIs(p, [-0.02 * x, -0.04 * y]) };
        }
        const s = F.div(F.fromDec(String(-g[0])), F.fromDec(String(g[1]))); if (exSl26(s)) return null;
        return { q: `図は ${MT} の等高線と、点 P${PT(x, y)} の $\\mathrm{grad}\\,h$ の矢印。P を通る等高線の接線の傾き $\\dfrac{\\dd y}{\\dd x}$`, a: `$${fx(s)}$`, key: `26|${x},${y}`, easyCheck: false, fig: figContour(x, y),
          easy: `${gradTxt(g)}。$-\\dfrac{${nf(g[0])}}{${nf(g[1])}}$`, verify: p => valIs(p, -(0.02 * x) / (0.04 * y), 1e-9) };
      },
      // わな：等高線の半径（8-04。向きではない）
      trap(r) {
        const c = r.pick([1, 4, 9, 16, 25, 36, 49, 64]), hh = 100 - c, a = 10 * Math.sqrt(c), ew = r.chance(0.6);
        return dest({ q: `${MT} の、高さ ${U(hh, 'm')} の等高線の${ew ? '東西' : '南北'}の半径（m）`, a: `$${ew ? nf(a) : surd(r9(a / 2), 2)}$`, key: `t26|${hh}|${ew}`,
          verify: p => valIs(p, ew ? Math.sqrt(c / 0.01) : Math.sqrt(c / 0.02), 1e-9) }, '8-26',
          `向きではなく、だ円の大きさ。$0.01x^2+0.02y^2=${c}$ を右辺が1になるようにわって、$a=${nf(a)}$、$b=${surd(r9(a / 2), 2)}$`, ['8-04']);
      },
    },
  });

  // ================================================================ 8-27
  // e・sin・cos の入った2つの変数の式と、その勾配（式）
  function fnGrad(r, used) {
    const a = r.pick([2, 3, -1, -2]), b = r.pick([2, 3, 4]), c = r.pick([1, 2, 3]);
    const co = (k, t) => (k === 1 ? t : k === -1 ? '-' + t : k + t);   // 係数 1・-1 は書かない
    const ea = co(a, 'x'), eay = co(a, 'y'), ec = co(c, 'y');
    const FS = [
      () => ({ f: `e^{${ea}}\\sin y`, g: [co(a, `e^{${ea}}\\sin y`), `e^{${ea}}\\cos y`] }),
      () => ({ f: `e^{x}\\cos ${b}y`, g: ['e^{x}\\cos ' + b + 'y', co(-b, `e^{x}\\sin ${b}y`)] }),
      () => ({ f: `x^2e^{${ec}}`, g: [`2xe^{${ec}}`, co(c, `x^2e^{${ec}}`)] }),
      () => ({ f: `\\sin(${b}x+y)`, g: [co(b, `\\cos(${b}x+y)`), `\\cos(${b}x+y)`] }),
      () => ({ f: `xe^{${eay}}`, g: [`e^{${eay}}`, co(a, `xe^{${eay}}`)] }),
      () => ({ f: `\\ln(x^2+y^2)`, g: ['\\dfrac{2x}{x^2+y^2}', '\\dfrac{2y}{x^2+y^2}'] }),
    ];
    const ks = FS.map((f, k) => k).filter(k => !used || !used.has(k) || used.size >= FS.length), k = r.pick(ks), T = FS[k]();
    T.form = k;
    return T;
  }
  add({
    id: '8-27', part: 2, chap: '8-4③⑥⑦ 例題5', stars: 1,
    title: '式の勾配：1つずつ偏微分して並べ、点を入れる',
    mark: '$\\nabla f$・$\\mathrm{grad}\\,T$、$T(x,\\ y,\\ z)$。',
    futsu: ['点のまわりの値を表にして、', 'となりどうしの差で東・北（・上）の', '坂を1つずつ見積もり、並べる。'],
    raku: ['$T=xy^2+2z$、点 $(1,\\ 2,\\ 3)$', '→ $(y^2,\\ 2xy,\\ 2)=(4,\\ 4,\\ 2)$', '長さ $\\sqrt{16+16+4}=6$'],
    why: '$\\nabla f=\\mathrm{grad}\\,f$ は、「$x$ で偏微分」「$y$ で偏微分」「$z$ で偏微分」の操作を並べたもの（8-4⑥⑦）。偏微分は、ほかの文字を止めて数と同じに見る（8-2）。点での値は、偏微分の式を作ってから点を入れる。',
    caution: '止めた文字だけの項は0（$f=x^2y+3y$ を $x$ で偏微分すると $2xy$）。$\\nabla f$ は矢印（成分の組）で、たして1つの数にしない。$f\\nabla$ と書かない（$\\nabla$ は右の関数を微分する）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '26mm', s3: '44mm', trap: '20mm' },
    fits(q) { return /\$(f|T)=/.test(q) && /\\nabla ?[fT]|\\mathrm\{grad\}\\,[fT]/.test(q) && !/\\nabla\^2/.test(q); },
    steps: {
      // 2つの変数・点で
      s1(r) {
        const P = poly2(r); if (!P) return null;
        const x = r.pick([1, 2, 3, -1, -2]), y = r.pick([1, 2, 3, -1, -2]), g = [0, 1].map(k => polyV(polyD(P, k), [x, y])), tex = polyTeX(P, ['x', 'y']);
        if (g.every(v => v === 0) || g.some(v => Math.abs(v) > 60)) return null;
        return { q: `$f=${tex}$ の点 ${PT(x, y)} での $\\nabla f$`, a: `$${vt(g)}$`, key: `27|${tex}|${x},${y}`, easyCheck: false,
          easy: `$${vt([0, 1].map(k => polyTeX(polyD(P, k), ['x', 'y'])))}$ に入れる`,
          calc: { kind: 'pdiff', op: 'grad', f: tex, vars: ['x', 'y'], at: [x, y] } };
      },
      // 3つの変数・点で（成分の組、長さ）
      s2(r) {
        const P = poly3(r); if (!P) return null;
        const X = [r.int(1, 3), r.pick([1, 2, -1]), r.pick([1, 2, 3, -1])], g = [0, 1, 2].map(k => polyV(polyD(P, k), X)), tex = polyTeX(P, ['x', 'y', 'z']);
        if (tex === 'xy^2+2z' || g.filter(v => v === 0).length > 1 || g.some(v => Math.abs(v) > 40)) return null;
        const gt = `$${vt([0, 1, 2].map(k => polyTeX(polyD(P, k), ['x', 'y', 'z'])))}$ に入れて $${vt(g)}$`;
        if (turn(r, '27s2', 3) < 2) return { q: `$T=${tex}$ の点 $(${X.join(',\\ ')})$ での $\\mathrm{grad}\\,T$`, a: `$${vt(g)}$`, key: `27t|${tex}|${X}`, easyCheck: false, easy: gt,
          calc: { kind: 'pdiff', op: 'grad', f: tex, vars: ['x', 'y', 'z'], at: X } };
        const R = rootOf(g.reduce((s, v) => s + v * v, 0));
        if (R.tex === '6') return null;
        return { q: `$T=${tex}$ の点 $(${X.join(',\\ ')})$ での $\\lvert\\mathrm{grad}\\,T\\rvert$`, a: `$${R.tex}$`, key: `27l|${tex}|${X}`, easyCheck: false, easy: gt + ' の長さ',
          verify: p => valIs(p, Math.hypot(...[0, 1, 2].map(k => numD(s => polyV0(P, s), X, k))), 1e-6) };
      },
      // 式のまま（e・sin・ln の入った関数）
      s3(r) {
        const used = r.f27 || (r.f27 = new Set()), T = fnGrad(r, used);   // 同じ形（$\sin(2x+y)$ と $\sin(4x+y)$ など）を2回出さない（R1-13）
        used.add(T.form);
        return { q: `$f=${T.f}$ の $\\nabla f$（式で）`, a: `$\\left(${T.g.join(',\\ ')}\\right)$`, key: `27f|${T.f}`, easyCheck: false,
          easy: `$y$ を止めて $x$ で、$x$ を止めて $y$ で偏微分して並べる`,
          calc: { kind: 'pdiff', op: 'grad', f: T.f, vars: ['x', 'y'], pts: [[0.37, 0.83], [1.13, -0.61], [-0.71, 1.41]] } };
      },
      // わな：ラプラシアン（8-81。勾配ではない）
      trap(r) {
        const P = poly3(r); if (!P) return null;
        const tex = polyTeX(P, ['x', 'y', 'z']), L = combine([0, 1, 2].map(k => polyD(polyD(P, k), k)).flat()), lt = polyTeX(L, ['x', 'y', 'z']);
        if (lt === '0' || nTerms(L) > 2) return null;
        return dest({ q: `$T=${tex}$ の $\\nabla^2T$`, a: `$${lt}$`, key: `t27|${tex}`,
          calc: { kind: 'pdiff', op: 'lap', f: tex, vars: ['x', 'y', 'z'] } }, '8-27',
          `勾配ではなく、2回の偏微分の和（ラプラシアン。答えは数か式1つ）。$\\dfrac{\\partial^2T}{\\partial x^2}+\\dfrac{\\partial^2T}{\\partial y^2}+\\dfrac{\\partial^2T}{\\partial z^2}$`, ['8-81']);
      },
    },
  });

  // ================================================================ 8-28
  const SPR = [[0.03, 0.04], [0.06, 0.08], [0.04, 0.03], [0.05, 0.12], [0.12, 0.05], [0.08, 0.06], [0.09, 0.12]];
  const KS = [50, 100, 200, 250, 400, 500];
  const PHI = [100, 120, 150, 160, 200, 240, 300, 400, 500];
  const PY3 = [[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6]];   // 大きさが整う組
  const MAT = [['ステンレス', 16], ['コンクリート', 1.6], ['れんが', 0.6]];
  const EX28 = new Set(['(-6,\\ -8)', '(-300,\\ 400)', '(48,\\ -64)']);   // 左ページの例の答え（O-2）
  const linTeX = (c, a, b) => polyTeX([[c, 0, 0], [a, 1, 0], [b, 0, 1]], ['x', 'y']);
  const sprTxt = k => `ばね定数 $k=${k}\\,\\mathrm{N/m}$ のばねの位置エネルギー $U=\\dfrac{1}{2}k(x^2+y^2)$（J。$x$、$y$ は m）`;
  const phiTxt = (a, b, c) => `電位が $\\phi=${c == null ? linTeX(0, a, b) : polyTeX([[a, 1, 0, 0], [b, 0, 1, 0], [c, 0, 0, 1]], ['x', 'y', 'z'])}$（V。$x$、$y$${c == null ? '' : '、$z$'} は m）`;
  const matTxt = (m, k, T) => `${m}の板（熱伝導率 $k=${k}\\,\\mathrm{W/(m\\cdot K)}$）の中の温度が $T=${T}$（℃。$x$、$y$ は m）`;
  add({
    id: '8-28', part: 2, chap: '8-4⑧ 例題6〜8', stars: 1,
    title: '物理の勾配はマイナスをつける（力・電場・熱の流れ）',
    mark: '位置エネルギー・電位・温度の式から、力・電場・熱の流れ。',
    futsu: ['物を東・北へ少し動かしたときの', '位置エネルギー（電位・温度）の', '変化を1つずつ計算して、', '向きごとの成分を出す。'],
    raku: ['$U=\\dfrac12k(x^2+y^2)$、$k=100$、$(0.06,\\ 0.08)$', '→ $\\vec F=(-6,\\ -8)$、大きさ $10\\,\\mathrm{N}$', '$\\phi=300x-400y$ → $\\vec E=(-300,\\ 400)$', '$T=40-30x+40y$、$k=1.6$ → $\\vec q=(48,\\ -64)$'],
    why: '力は位置エネルギーが下がる向きに、下がり方が急なほど強くはたらく。$\\vec F\\cdot\\dd\\vec r=-\\dd U$ と $\\dd U=\\mathrm{grad}\\,U\\cdot\\dd\\vec r$ から $\\vec F=-\\mathrm{grad}\\,U$（8-4⑧）。電場は電位の高い所から低い所へ $\\vec E=-\\mathrm{grad}\\,\\phi$、熱は温度の高い所から低い所へ $\\vec q=-k\\,\\mathrm{grad}\\,T$（$k$ は熱伝導率）。',
    caution: 'マイナスを忘れない（grad は上りの向き）。熱の流れは熱伝導率 $k$ もかける。ばね定数の $k$ と熱伝導率の $k$ は別のもの。大きさは成分の2乗の和の $\\sqrt{\\phantom{2}}$。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '26mm', s3: '28mm', trap: '18mm' },
    fits(q) { return /(位置エネルギー|電位|温度)/.test(q) && /(はたらく力|電場|熱の流れ)/.test(q) && !/仕事/.test(q); },
    steps: {
      // ばねの力、電位から電場
      s1(r) {
        if (turn(r, '28s1', 2) === 0) {
          const k = r.pick(KS), [x, y] = signed(r, SPR), F2 = [r9(-k * x), r9(-k * y)];
          if (EX28.has(vt(F2)) || (k === 100 && Math.abs(x) === 0.06)) return null;
          return { q: `${sprTxt(k)}で、点 ${PT(x, y)} の物にはたらく力 $\\vec F$（N）`, a: `$${vt(F2)}$`, key: `28k|${k}|${x},${y}`, easyCheck: false,
            easy: `$\\mathrm{grad}\\,U=(kx,\\ ky)=${vt(F2.map(v => r9(-v)))}$。マイナスをつける`, calc: { kind: 'vec', want: F2 },
            verify: p => vecIs(p, [0, 1].map(i => -numD(u => k * (u[0] * u[0] + u[1] * u[1]) / 2, [x, y], i)), 1e-6) };
        }
        const a = r.pick(PHI) * sgnR(r), b = r.pick(PHI) * sgnR(r), E = [-a, -b];
        if (EX28.has(vt(E))) return null;
        return { q: `平面の上の${phiTxt(a, b)}のとき、電場 $\\vec E$（V/m）`, a: `$${vt(E)}$`, key: `28e|${a},${b}`, easyCheck: false,
          easy: `$\\mathrm{grad}\\,\\phi=${vt([a, b])}$。マイナスをつける`, calc: { kind: 'vec', want: E },
          verify: p => vecIs(p, [0, 1].map(i => -numD(u => a * u[0] + b * u[1], [0.3, 0.7], i)), 1e-6) };
      },
      // 熱の流れ、大きさ
      s2(r) {
        const kind = turn(r, '28s2', 2);
        if (kind === 0) {
          const [m, k] = r.pick(MAT), c = r.pick([20, 30, 40, 50, 60]), a = r.pick([10, 20, 30, 40, 50, 60, 80, 100, 200, 300]) * sgnR(r), b = r.pick([10, 20, 30, 40, 50, 60, 80, 100, 200, 300]) * sgnR(r), q2 = [r9(-k * a), r9(-k * b)];
          if (EX28.has(vt(q2)) || (a === -30 && b === 40)) return null;   // 左ページの例の温度の式（O-2）
          return { q: `${matTxt(m, k, linTeX(c, a, b))}のとき、熱の流れ $\\vec q$（$\\mathrm{W/m^2}$）`, a: `$${vt(q2)}$`, key: `28q|${k}|${a},${b}`, easyCheck: false,
            easy: `$\\mathrm{grad}\\,T=${vt([a, b])}$。$-${k}$ をかける`, calc: { kind: 'vec', want: q2 },
            verify: p => vecIs(p, [0, 1].map(i => -k * numD(u => c + a * u[0] + b * u[1], [0.2, 0.4], i)), 1e-6) };
        }
        const [s, t] = r.pick(PY3), w = r.pick([0, 1, 2]);
        if (w === 0) {
          const k = r.pick(KS), x = r9(s * 0.01 * sgnR(r)), y = r9(t * 0.01 * sgnR(r)), v = r9(k * Math.hypot(s, t) / 100);
          if (v === 10) return null;
          return { q: `${sprTxt(k)}で、点 ${PT(x, y)} の物にはたらく力の大きさ（N）`, a: `$${nf(v)}$`, key: `28k|${k}|${x},${y}`, easyCheck: false,
            easy: `$\\vec F=${vt([r9(-k * x), r9(-k * y)])}$ の長さ`, verify: p => valIs(p, k * Math.hypot(x, y), 1e-9) };
        }
        if (w === 1) {
          const m = r.pick([20, 30, 40, 50]), a = s * m * sgnR(r), b = t * m * sgnR(r), v = Math.hypot(a, b);
          if (v === 500) return null;
          return { q: `平面の上の${phiTxt(a, b)}のとき、電場の大きさ（V/m）`, a: `$${nf(v)}$`, key: `28e|${a},${b}`, easyCheck: false,
            easy: `$\\vec E=${vt([-a, -b])}$ の長さ`, verify: p => valIs(p, Math.hypot(a, b), 1e-9) };
        }
        const [mm, k] = r.pick(MAT), m = r.pick([10, 20]), a = s * m * sgnR(r), b = t * m * sgnR(r), v = r9(k * Math.hypot(a, b));
        if (v === 60 || (a === -30 && b === 40)) return null;
        return { q: `${matTxt(mm, k, linTeX(r.pick([20, 40, 60]), a, b))}のとき、熱の流れの大きさ（$\\mathrm{W/m^2}$）`, a: `$${nf(v)}$`, key: `28q|${k}|${a},${b}`, easyCheck: false,
          easy: `$${k}\\times\\sqrt{${a * a}+${b * b}}$`, verify: p => valIs(p, k * Math.hypot(a, b), 1e-9) };
      },
      // 3次元の電位、重力、2乗の式の位置エネルギー
      s3(r) {
        const kind = turn(r, '28s3', 3);
        if (kind === 0) {
          const a = r.pick(PHI) * sgnR(r), b = r.pick(PHI) * sgnR(r), c = r.pick([100, 200, 300, 50]) * sgnR(r), E = [-a, -b, -c];
          return { q: `空間の${phiTxt(a, b, c)}のとき、電場 $\\vec E$（V/m）`, a: `$${vt(E)}$`, key: `28e3|${a},${b},${c}`, easyCheck: false,
            easy: `$\\mathrm{grad}\\,\\phi=${vt([a, b, c])}$。マイナスをつける`, calc: { kind: 'vec', want: E } };
        }
        if (kind === 1) {
          const m = r.pick([2, 5, 10, 0.5, 3]), w = r9(-9.8 * m);
          return { q: `質量 $${m}\\,\\mathrm{kg}$ の物の重力の位置エネルギーが $U=mgz$（$g=9.8$、$z$ は上向きの高さ m）のとき、物にはたらく力 $\\vec F$（N。$x$、$y$、$z$ の成分）`, a: `$(0,\\ 0,\\ ${nf(w)})$`, key: `28g|${m}`, easyCheck: false,
            easy: `$\\mathrm{grad}\\,U=(0,\\ 0,\\ mg)$。マイナスをつける`, calc: { kind: 'vec', want: [0, 0, w] } };
        }
        const A = r.pick([1, 2, 3, 5]), B = r.pick([1, 2, 3, 4]), x = r.pick([1, 2, -1, 0.5, -2]), y = r.pick([1, -1, 2, -0.5, 3]), F2 = [r9(-2 * A * x), r9(-2 * B * y)];
        return { q: `位置エネルギーが $U=${polyTeX([[A, 2, 0], [B, 0, 2]], ['x', 'y'])}$（J。$x$、$y$ は m）のとき、点 ${PT(x, y)} で物にはたらく力 $\\vec F$（N）`, a: `$${vt(F2)}$`, key: `28u|${A},${B}|${x},${y}`, easyCheck: false,
          easy: `$\\mathrm{grad}\\,U=(${2 * A}x,\\ ${2 * B}y)=${vt(F2.map(v => r9(-v)))}$。マイナスをつける`, calc: { kind: 'vec', want: F2 },
          verify: p => vecIs(p, [0, 1].map(i => -numD(u => A * u[0] * u[0] + B * u[1] * u[1], [x, y], i)), 1e-6) };
      },
      // わな：ばねの力がする仕事（8-50。U の差）
      trap(r) {
        const k = r.pick(KS), [x, y] = signed(r, SPR), v = r9(k * (x * x + y * y) / 2);
        return dest({ q: `${sprTxt(k)}で、つながれた物を、点 ${PT(x, y)} から原点までもどすとき、ばねの力がする仕事（J）`, a: `$${nf(v)}$`, key: `t28|${k}|${x},${y}`,
          verify: p => valIs(p, k * (x * x + y * y) / 2, 1e-9) }, '8-28',
          `力ではなく仕事。保存力の仕事は、道によらず $U(\\text{はじめ})-U(\\text{おわり})=\\dfrac{1}{2}\\times${k}\\times${nf(r9(x * x + y * y))}-0=${nf(v)}$`, ['8-50']);
      },
    },
  });

  // ================================================================ 8-29
  const norm360 = a => ((a % 360) + 360) % 360;
  const twoAng = (al, th) => { const a = [norm360(al - th), norm360(al + th)].sort((u, v) => u - v); return `$${a[0]}^{\\circ}$ と $${a[1]}^{\\circ}$`; };
  // 検算：答えの2つの角（0°以上360°未満、ちがう角）で、坂 m cos(角 − α) が s になるか
  const angIs = (p, m, al, s) => {
    const A = (String(p.a).match(/\$-?[0-9.]+\^\{\\circ\}\$/g) || []).map(t => parseFloat(t.slice(1)));
    if (A.length !== 2 || A[0] === A[1]) return `答え ${p.a} の角が2つでない`;
    for (const a of A) if (a < 0 || a >= 360 || !near(m * Math.cos((a - al) * Math.PI / 180), s, 1e-9)) return `${a}° で坂が ${s} にならない`;
    return true;
  };
  const AL29 = [0, 90, 180, 270, 30, 60, 120, 150, 200, 210, 240, 250, 300, 315, 45, 135];
  const M29 = [0.4, 0.6, 0.8, 1, 1.2, 2];
  const TH29 = { 60: 0.5, 90: 0, 120: -0.5 };
  add({
    id: '8-29', part: 2, chap: '8-4⑤ 例題9', stars: 1,
    title: 'grad から角 $\\theta$ ずれた道の坂は $\\lvert\\mathrm{grad}\\,h\\rvert\\cos\\theta$',
    mark: '「坂が □ になる道の向き（東から左回りの角）」。',
    futsu: ['向きを $(\\cos\\alpha,\\ \\sin\\alpha)$ として', 'grad との内積の式を作り、', '坂が □ になる $\\alpha$ を', '三角関数の方程式で解く。'],
    raku: ['点 $(-50,\\ 0)$ → $\\mathrm{grad}\\,h=(1,\\ 0)$（東、$0^{\\circ}$）', '坂0.5 → $\\cos\\theta=0.5$、$\\theta=60^{\\circ}$', '→ $60^{\\circ}$ と $300^{\\circ}$', '坂0（等高線）→ $90^{\\circ}$ と $270^{\\circ}$'],
    why: '長さ1の矢印 $\\vec e$ の向きの坂 $\\mathrm{grad}\\,h\\cdot\\vec e$ は、内積のもう1つの形で $\\lvert\\mathrm{grad}\\,h\\rvert\\cos\\theta$ と書ける（$\\theta$ は grad からはかった角。8-4⑤）。坂が grad の長さの半分なら $\\cos\\theta=0.5$ で $\\theta=60^{\\circ}$。grad の左右どちらにずらしてもよいので、答えは「grad の角 $\\pm\\theta$」の2つ。',
    caution: '$\\theta$ は東からではなく grad の向きからはかった角。左右の2つの向きを答える。$360^{\\circ}$ 以上・負になったら $360^{\\circ}$ をひく・たす。坂が負（下り）なら $\\theta$ は $90^{\\circ}$ より大きい。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '34mm', s3: '34mm', trap: '20mm' },
    fits(q) { return /左回りの角|ずれた向き/.test(q); },
    steps: {
      // grad の大きさと向き（角）が与えられている
      s1(r) {
        const m = r.pick(M29), al = r.pick(AL29), th = r.pick([60, 90, 120]), s = r9(m * TH29[th]);
        if (al === 0 && m === 1) return null;   // 左ページの例（O-2）
        return { q: `$\\lvert\\mathrm{grad}\\,h\\rvert=${nf(m)}$、grad の向きが東から左回りに $${al}^{\\circ}$ の点で、坂が $${nf(s)}$ になる道の向き（東から左回りの角で2つ）`, a: twoAng(al, th), key: `29|${m},${al},${th}`, easyCheck: false,
          easy: `$${m === 1 ? '' : nf(m)}\\cos\\theta=${nf(s)}$ より $\\theta=${th}^{\\circ}$。$${al}^{\\circ}\\pm${th}^{\\circ}$`, verify: p => angIs(p, m, al, s) };
      },
      // 主役の山の、軸の上の点（grad が東西南北を向く）
      s2(r) {
        const o = r.s29 || (r.s29 = { n: r.int(0, 2), ans: new Set() }), onX = o.n % 3 === 0, v = onX ? r.pick([10, 20, 25, 30, 40, 50, 60]) * sgnR(r) : r.pick([5, 10, 15, 20, 25, 30]) * sgnR(r), [x, y] = onX ? [v, 0] : [0, v];
        if (x === -50 && y === 0) return null;   // 左ページの例（O-2）
        const g = gH(x, y), m = Math.hypot(...g), al = norm360(Math.round(Math.atan2(g[1], g[0]) * 180 / Math.PI)), th = r.pick([60, 90, 120]), s = r9(m * TH29[th]);
        if (o.ans.has(twoAng(al, th)) || EXANS['8-29'].includes(twoAng(al, th).replace(/\$/g, ''))) return null;   // 同じ答えの角を2回出さない（R1-17）。例の答えもここでよける
        o.n++; o.ans.add(twoAng(al, th));
        return { q: `${MT} の点 ${PT(x, y)} で、坂が $${nf(s)}$ になる道の向き（東から左回りの角で2つ）`, a: twoAng(al, th), key: `29p|${x},${y}|${th}`, easyCheck: false,
          easy: `${gradTxt(g)}（長さ $${nf(m)}$、向き $${al}^{\\circ}$）。$\\cos\\theta=${nf(TH29[th])}$ で $\\theta=${th}^{\\circ}$`, verify: p => angIs(p, Math.hypot(0.02 * x, 0.04 * y), Math.atan2(-0.04 * y, -0.02 * x) * 180 / Math.PI, s) };
      },
      // grad から θ ずれた道の坂、grad がななめ（45° など）の点
      s3(r) {
        if (turn(r, '29s3', 2) === 0) {
          const m = r.pick(M29), th = r.pick([60, 120, 45, 135, 30, 150, 180]);
          const cs = { 60: [0.5, 1], 120: [-0.5, 1], 180: [-1, 1], 45: [0.5, 2], 135: [-0.5, 2], 30: [0.5, 3], 150: [-0.5, 3] }[th], a = surd(r9(m * cs[0] * (cs[1] === 1 ? 1 : 1)), cs[1]);
          return { q: `$\\lvert\\mathrm{grad}\\,h\\rvert=${nf(m)}$ の点で、grad の向きから $${th}^{\\circ}$ ずれた向きの道の坂`, a: `$${a}$`, key: `29f|${m},${th}`, easyCheck: false,
            easy: `$${m === 1 ? '' : nf(m)}\\cos${th}^{\\circ}$`, verify: p => valIs(p, m * Math.cos(th * Math.PI / 180), 1e-9) };
        }
        const y = r.pick([5, 10, 15, 20]) * sgnR(r), x = 2 * Math.abs(y) * sgnR(r), g = gH(x, y), al = norm360(Math.round(Math.atan2(g[1], g[0]) * 180 / Math.PI)), th = r.pick([45, 135]), s = r9(Math.abs(g[0]) * (th === 45 ? 1 : -1));
        return { q: `${MT} の点 ${PT(x, y)} で、坂が $${nf(s)}$ になる道の向き（東から左回りの角で2つ）`, a: twoAng(al, th), key: `29d|${x},${y}|${th}`, easyCheck: false,
          easy: `${gradTxt(g)}（長さ $${surd(Math.abs(g[0]), 2)}$、向き $${al}^{\\circ}$）。$\\cos\\theta=${th === 45 ? '' : '-'}\\dfrac{1}{\\sqrt2}$ で $\\theta=${th}^{\\circ}$`,
          verify: p => angIs(p, Math.hypot(0.02 * x, 0.04 * y), Math.atan2(-0.04 * y, -0.02 * x) * 180 / Math.PI, s) };
      },
      // わな：点を通る等高線の半径（8-04）
      trap(r) {
        const P = ptMain(r); if (!P) return null;
        const [x, y] = P, R = rootOf(x * x + 2 * y * y);
        if (R.m > 30) return null;
        return dest({ q: `${MT} の点 ${PT(x, y)} を通る等高線の東西の半径（m）`, a: `$${R.tex}$`, key: `t29|${x},${y}`,
          verify: p => valIs(p, Math.sqrt((100 - H(x, y)) / 0.01), 1e-9) }, '8-29',
          `道の向きではなく、等高線の大きさ。高さは $${nf(H(x, y))}$ m なので、$0.01x^2+0.02y^2=${nf(r9(100 - H(x, y)))}$ で $y=0$ とおく`, ['8-04']);
      },
    },
  });

  // ================================================================ 8-91
  const PD = (num, den, sub) => `\\left(\\dfrac{\\partial ${num}}{\\partial ${den}}\\right)_${sub.length > 1 ? '{' + sub + '}' : sub}`;
  const KP = [100, 150, 200, 250, 300, 400, 500, 600, 750, 1200, 1500, 2000];
  // V=n×8.31÷K（小数第6位までで書ける組）
  function gasV(n, K) { const v = F.div(F.mul(F.make(n), F.fromDec('8.31')), F.make(K)), s = dec(v); return s && s !== '0.00831' && (s.split('.')[1] || '').length <= 5 ? s : null; }   // 0.00831 は左ページの例の体積（O-2）
  // 10 のべきの形（$1.5\times10^{-4}$）
  const sci = v => { const e = Math.floor(Math.log10(Math.abs(v)) + 1e-9), m = r9(v / 10 ** e); return `${nf(m)}\\times10^{${e}}`; };
  const SYM91 = [
    { f: 'p', e: '\\dfrac{nRT}{V}', d: 'T', s: 'V', a: '\\dfrac{nR}{V}', c: 'n*R*T/V', vars: ['T', 'V'] },
    { f: 'p', e: '\\dfrac{nRT}{V}', d: 'V', s: 'T', a: '-\\dfrac{nRT}{V^2}', c: 'n*R*T/V', vars: ['V', 'T'] },
    { f: 'V', e: '\\dfrac{nRT}{p}', d: 'T', s: 'p', a: '\\dfrac{nR}{p}', c: 'n*R*T/p', vars: ['T', 'p'] },
    { f: 'V', e: '\\dfrac{nRT}{p}', d: 'p', s: 'T', a: '-\\dfrac{nRT}{p^2}', c: 'n*R*T/p', vars: ['p', 'T'] },
    { f: 'T', e: '\\dfrac{pV}{nR}', d: 'p', s: 'V', a: '\\dfrac{V}{nR}', c: 'p*V/(n*R)', vars: ['p', 'V'] },
    { f: 'T', e: '\\dfrac{pV}{nR}', d: 'V', s: 'p', a: '\\dfrac{p}{nR}', c: 'p*V/(n*R)', vars: ['V', 'p'] },
    { f: 'p', e: '\\dfrac{nRT}{V}', d: 'n', s: 'T,\\,V', a: '\\dfrac{RT}{V}', c: 'n*R*T/V', vars: ['n', 'T', 'V'] },
    { f: 'V', e: '\\dfrac{nRT}{p}', d: 'n', s: 'T,\\,p', a: '\\dfrac{RT}{p}', c: 'n*R*T/p', vars: ['n', 'T', 'p'] },
  ];
  add({
    id: '8-91', part: 2, chap: '8-3 例題9', stars: 1,
    title: '止めておく量を書く偏微分：右下の文字を止めて偏微分する',
    mark: '$\\left(\\dfrac{\\partial p}{\\partial T}\\right)_V$、理想気体 $pV=nRT$。',
    futsu: ['$T$ と $T+1$ のときの圧力を', '式に入れて2回計算し、', '差を出す（体積はそのまま）。'],
    raku: ['$p=\\dfrac{nRT}{V}$、$n=1$、$R=8.31$', '$V=0.00831\\,\\mathrm{m^3}$', '$\\left(\\dfrac{\\partial p}{\\partial T}\\right)_V=\\dfrac{nR}{V}=1000$', '（$\\mathrm{Pa/K}$）'],
    why: '$p$、$V$、$T$ のうち2つを決めると残りが決まるので、「何を止めて、何で偏微分したか」を書かないと意味が決まらない。右下の文字は止めておく量（8-3 例題9）。$V$ を止めると $p=\\dfrac{nR}{V}\\times T$ は $T$ の1次式で、その係数 $\\dfrac{nR}{V}$ が偏微分（体積を変えずに温度を 1 K 上げたときの圧力の増え方）。',
    caution: '止める量がちがえば答えもちがう（$\\left(\\dfrac{\\partial V}{\\partial T}\\right)_p=\\dfrac{nR}{p}$）。分母の文字で偏微分するときは、$\\dfrac{1}{V}$ の微分 $-\\dfrac{1}{V^2}$ を使う。単位は「出てくる量÷動かした量」（Pa/K）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '22mm', s3: '24mm', trap: '14mm' }, boxh: { s2: '11mm' },
    fits(q) { return /\\right\)_/.test(q); },
    steps: {
      s1(r) {
        const n = r.pick([1, 2, 3, 4]), K = r.pick(KP), V = gasV(n, K);
        if (!V || (n === 1 && K === 1000) || K === 1000) return null;   // 左ページの例（O-2）
        (r.k91 || (r.k91 = new Set())).add(K);
        return { q: `理想気体 $p=\\dfrac{nRT}{V}$（$R=8.31$）で、$n=${n}$、$V=${V}\\,\\mathrm{m^3}$ のときの $${PD('p', 'T', 'V')}$（$\\mathrm{Pa/K}$）`, a: `$${K}$`, key: `91|${K}`, easyCheck: 'last',
          easy: `$\\dfrac{nR}{V}=\\dfrac{${n}\\times8.31}{${V}}=${K}$`, verify: p => valIs(p, n * 8.31 * (301 - 300) / +V, 1e-9) };
      },
      // 文字の式で
      s2(r) {
        const S = r.pick(SYM91.slice(1));
        const consts = { n: 1.3, R: 8.31, T: 2.1, V: 0.7, p: 1.7 };
        S.vars.forEach(v => delete consts[v]);
        return { q: `$${S.f}=${S.e}$ の $${PD(S.f, S.d, S.s)}$（文字の式で）`, a: `$${S.a}$`, key: `91s|${S.f}|${S.d}|${S.s}`, easyCheck: false,
          easy: `${S.s.split(',\\,').map(v => '$' + v + '$').join('、')} を数と同じに見て、$${S.d}$ で微分する`,
          calc: { kind: 'pdiff', f: S.c, vars: S.vars, wrt: [S.d], consts, pts: [[1.13, 0.71, 0.93], [2.07, 1.31, 0.57], [0.61, 1.77, 1.43]] } };
      },
      // $\left(\frac{\partial V}{\partial T}\right)_p$ の値（10 のべき）、温度を上げたときの圧力の増え方
      s3(r) {
        const o = r.s91 || (r.s91 = { n: r.int(0, 1), ans: new Set() });   // 2つの形を交互に。同じ値の答えを2回出さない（R1-15）
        if (o.n % 2 === 0) {
          const n = r.pick([1, 2, 3, 4, 5]), p0 = r.pick([83100, 166200, 41550]), v = n * 8.31 / p0;
          if (o.ans.has(sci(v))) return null;
          o.n++; o.ans.add(sci(v));
          return { q: `理想気体 $V=\\dfrac{nRT}{p}$（$R=8.31$）で、$n=${n}$、$p=${p0}\\,\\mathrm{Pa}$ のときの $${PD('V', 'T', 'p')}$（$\\mathrm{m^3/K}$）`, a: `$${sci(v)}$`, key: `91v|${n},${p0}`, easyCheck: false,
            easy: `$\\dfrac{nR}{p}=\\dfrac{${n}\\times8.31}{${p0}}$`, verify: p => valIs(p, n * 8.31 / p0, 1e-9) };
        }
        const n = r.pick([1, 2]), K = r.pick([100, 200, 300, 500]), V = gasV(n, K), dT = r.pick([2, 3, 5, 10, 20]);
        if (!V || o.ans.has(String(K * dT)) || (r.k91 && (r.k91.has(K) || r.k91.has(K * dT)))) return null;   // s1 と同じ K・同じ答えの数はよける
        o.n++; o.ans.add(String(K * dT));
        return { q: `理想気体 $p=\\dfrac{nRT}{V}$（$R=8.31$）で、$n=${n}$、$V=${V}\\,\\mathrm{m^3}$ の容器の体積を変えずに、温度を $${dT}\\,\\mathrm{K}$ 上げたときの圧力の増え方（Pa。$${PD('p', 'T', 'V')}$ から）`, a: `$${K * dT}$`, key: `91|${K}`, easyCheck: false,
          easy: `$${PD('p', 'T', 'V')}=\\dfrac{nR}{V}=${K}$。$${K}\\times${dT}$`, verify: p => valIs(p, n * 8.31 * dT / +V, 1e-9) };
      },
      // わな：± のずれの割合（8-18）
      trap(r) {
        const a = r.pick([0.5, 1, 2]), b = r.pick([0.5, 1, 2, 3]), v = r9(a + b);
        return dest({ q: `理想気体の圧力 $p=\\dfrac{nRT}{V}$ で、$T$ に ±${nf(a)}％、$V$ に ±${nf(b)}％ のずれがありうる。$p$ のずれは、いちばん大きくて約 □ ％`, a: `$${nf(v)}$`, key: `t91|${a},${b}`,
          verify: p => valIs(p, a + b) }, '8-91',
          `止めておく量の偏微分ではなく、ずれの割合。わる量 $V$ はマイナスで効くので、いちばん大きいずれは $${nf(a)}+${nf(b)}=${nf(v)}$`, ['8-18']);
      },
    },
  });
})(globalThis.MONDAI);
