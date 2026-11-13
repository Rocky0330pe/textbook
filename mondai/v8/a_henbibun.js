/* 問題集 第8巻　第1部 地図と偏微分（わざ 8-01〜8-15）　組 a
 * 書き方は v8/README.md → v6/README.md・v5/README.md。文は教科書 第8巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 8-0・8-1・8-2 の数・ことば・記号にそろえる（主役の山 $h=100-0.01x^2-0.02y^2$（$x$ は東、$y$ は北）、等高線、だ円、切り口、等値面、
 *   表計算の `B$1`・`$A2`（北が上）、偏微分 $\dfrac{\partial f}{\partial x}$（$f_x$ は使わない）、東の坂・北の坂、右どなり・上どなり・両どなり）。
 * 検算：偏微分は calc（kind 'pdiff'）、重積分のわなは calc（kind 'defint2'）。数の答え・ことばの答え・答えの組は verify(p) で、問題を作った計算とは
 *   別の道すじ（主役の山の式をそのまま数で計算する、中心差分で偏微分する、表を作り直して読む、など）で確かめる。
 * 図は 8-05 のステップ3だけ（等高線・等圧線と間の長さ。K-2）。表（p.table）は 8-03・8-06・8-09 のステップ3、プログラム（p.code）は 8-03 のステップ3だけ。
 * 左ページの「楽な形」・目印の例の数は、同じ見開きの問題に出さない（O-2・S-2・U-2。BAN）。入れかえ・符号ちがい・何倍かもよける。
 *   key は、ステップがちがっても同じ問題（同じ点・同じ式）なら同じになる形にする（s3 は s1・s2 と key の形をそろえる）。
 * 1つのステップに同じ答えを3つ以上出さない（U-3。add の ansOK）。「上り・下り」「なる・ならない」などは両方出るように回す。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。
 * 近似値は使う値とけたを文に書き、答えは「約」と ≈（O-4・S-3）。答えは √ を残した形を正とする。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                          // 0.30000000004 → 0.3
  const f2 = v => (Math.round(v * 100) / 100).toFixed(2).replace(/^-0\.00$/, '0.00');   // 小数第2位まで（表の数）
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const cf = v => (v === 1 ? '' : v === -1 ? '-' : fmt(v));                 // 文字の係数（1 は書かない）
  // 表の数のセルは式の字に（本でも −20 のマイナスが式のマイナスになるように）。検算には、もとの表を使う
  const mtab = T => { const cm = c => (/^-?\d[\d.]*$/.test(String(c)) ? `$${c}$` : c); return Object.assign({}, T, T.head ? { head: T.head.map(cm) } : {}, { rows: T.rows.map(r => r.map(cm)) }); };
  const par = v => (String(v).startsWith('-') ? `(${v})` : String(v));   // マイナスはかっこごと
  const pt = (...v) => `(${v.join(',\\ ')})`;                              // 点 $(a,\ b)$ の中身
  const HM = (x, y) => Math.round((100 - 0.01 * x * x - 0.02 * y * y) * 1e9) / 1e9;   // 主役の山（0.01×4900 の小数のずれを丸める）
  const HSRC = '100-0.01x^2-0.02y^2';
  // √N を「a\sqrt{b}」に（N は正の整数）
  function sqrtParts(N) { let a = 1, b = N; for (let k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k; } return [a, b]; }
  function sqrtTeX(N, mul) {
    const [a0, b] = sqrtParts(N), a = a0 * (mul || 1), A = fmt(a);
    if (b === 1) return A;
    const s = b < 10 ? `\\sqrt${b}` : `\\sqrt{${b}}`;
    return (A === '1' ? '' : A) + s;
  }
  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない（U-3）。アプリで同じわざを多く出すとき（ok が20問をこえたら）は、よけない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  // わざの登録：1つのステップに同じ答えを3つ出さない（U-3）。答えの式・数（$ の所）でくらべる
  function add(def) {
    for (const k of ['s1', 's2', 's3']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => { const p = f(r); if (!p) return p; const A = /`/.test(p.a) ? String(p.a) : (String(p.a).match(/\$[^$]*\$/g) || []).join('|') || String(p.a); return ansOK(r, def.id + k, A, 2, p.key || p.q) ? p : null; };
    }
    M.add(def);
  }
  // 答えの文から数を取り出す（単位 \,\mathrm{…} は除く。「x=」の左は除く）
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol)) || `答え ${p.a} が ${fmt(v)} でない`; };
  const valsAre = (p, vs, tol) => { const n = nums(p.a); return (n.length === vs.length && n.every((x, k) => near(x, vs[k], tol))) || `答え ${p.a} が ${vs.map(fmt).join('、')} でない`; };

  // ---------------------------------------------------------------- わなの行き先（N-3・S-7）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部・巻のわざの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(8).filter(id => {
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

  // ================================================================ 8-01
  // 積分の名前：s は記号、n はふつうの定積分の回数、where は「どこで」、shape は場所の形、what は「何を」（スカラーの積分だけ）
  const sp = w => (/^\\/.test(w) ? w : ' ' + w);   // 右下の文字と、たす量の文字をつなげない（$\iiint_V T$）
  const INT01 = {
    A: w => ({ s: `\\iint_D${sp(w)}\\,\\dd A`, n: 2, where: 'D', shape: '平らな面', what: w }),
    V: w => ({ s: `\\iiint_V${sp(w)}\\,\\dd V`, n: 3, where: 'V', shape: '立体', what: w }),
    Cs: w => ({ s: `\\int_C${sp(w)}\\,\\dd s`, n: 1, where: 'C', shape: '道', what: w }),
    Cr: w => ({ s: `\\int_C\\vec ${w}\\cdot\\dd\\vec r`, n: 1, where: 'C', shape: '道', what: null }),
    Co: w => ({ s: `\\oint_C\\vec ${w}\\cdot\\dd\\vec r`, n: 1, where: 'C', shape: '閉じた道', what: null }),
    S: w => ({ s: `\\iint_S\\vec ${w}\\cdot\\vec n\\,\\dd S`, n: 2, where: 'S', shape: '面', what: null }),
    So: w => ({ s: `\\oiint_S\\vec ${w}\\cdot\\vec n\\,\\dd S`, n: 2, where: 'S', shape: '閉じた面', what: null }),
  };
  const W01 = { A: ['f', 'q', 'p'], V: ['\\rho', 'f', 'T', 'q'], Cs: ['\\lambda', 'f', 'T'], Cr: ['F', 'E', 'v'], Co: ['E', 'v', 'B'], S: ['v', 'E', 'B'], So: ['E', 'v', 'B'] };
  const BAN01 = new Set(['\\iint_D\\sigma\\,\\dd A', '\\oint_C\\vec F\\cdot\\dd\\vec r']);   // 左ページの例
  const pick01 = (r, kinds) => { const k = r.pick(kinds || Object.keys(INT01)); const o = INT01[k](r.pick(W01[k])); o.kind = k; return BAN01.has(o.s) ? null : o; };
  // ことばで書いた量と、その積分の名前（ステップ3）
  const WORD01 = [
    ['針金 $C$ の各点の線密度 $\\lambda$（1 m あたりの質量）を、針金にそってたし合わせた質量', '\\int_C\\lambda\\,\\dd s', 1],
    ['立体 $V$ の各点の密度 $\\rho$ を、立体全体でたし合わせた質量', '\\iiint_V\\rho\\,\\dd V', 3],
    ['流域 $D$ の各点の雨の量 $q$（1 m² あたり）を、流域全体でたし合わせた量', '\\iint_D q\\,\\dd A', 2],
    ['力 $\\vec F$ が、道 $C$ にそって物を動かすときにする仕事', '\\int_C\\vec F\\cdot\\dd\\vec r', 1],
    ['流れ $\\vec v$ を、1周する道 $C$ にそってたし合わせた量（循環）', '\\oint_C\\vec v\\cdot\\dd\\vec r', 1],
    ['面 $S$ を通りぬける流れ $\\vec v$ の流量', '\\iint_S\\vec v\\cdot\\vec n\\,\\dd S', 2],
    ['閉じた面 $S$ から外へ出る電場 $\\vec E$ の流束', '\\oiint_S\\vec E\\cdot\\vec n\\,\\dd S', 2],
  ];
  add({
    id: '8-01', part: 1, chap: '8-0⑥・8-6②', stars: 1,
    title: '積分の名前は「何を・どこで」で読む。$\\int$ の数が、ふつうの定積分の回数',
    mark: '$\\iint_D$・$\\iiint_V$・$\\int_C$・$\\oint_C$・$\\oiint_S$ の記号。「ふつうの定積分を何回」「どこで」。',
    futsu: ['記号を、タイルに分けて', '量をかけてたす操作にもどし、', '場所を表す数がいくつかを', '考えてから、回数を決める。'],
    raku: ['$\\iint_D\\sigma\\,\\dd A$：何を $\\sigma$、どこで $D$', '$\\int$ が2つ → 定積分を2回', '$\\oint_C\\vec F\\cdot\\dd\\vec r$：閉じた道で1回', '（◯は円ではなく「閉じている」）'],
    why: 'どの積分も「タイルに分けて、1枚ずつ量をかけてたし、細かくした先」という操作の名前（8-0⑥）。$\\int$ の数は、場所を表す数の数で、道は1つ、面は2つ、立体は3つ。ふつうの定積分（第5巻）に直すと、その回数だけ定積分をくり返す。右下の文字（$D$・$V$・$C$・$S$）が「どこで」、その右の量が「何を」。',
    caution: '◯は円の形ではなく、道や面が「閉じている」という印（$\\oiint_S$ は閉じた面で2回）。記号を読むだけでは、値はまだ出ない（値は、ふつうの定積分に直してから）。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '24mm', s3: '34mm', trap: '14mm' },
    fits(q) {
      if (/値|求め|面積の|重心/.test(q)) return false;
      return /\\(?:i+nt|oi*nt)_[A-Z]/.test(q) && /何回|どこで|何を|場所の形|積分の名前/.test(q) || /積分の名前/.test(q);
    },
    steps: {
      // ふつうの定積分を何回（1・2・3回がそろうように：add で同じ答えは2つまで）
      s1(r) {
        const o = pick01(r); if (!o) return null;
        return { q: `$${o.s}$ は、ふつうの定積分を何回`, a: `${o.n}回`, key: o.s,
          easy: `$\\int$ が${o.n}つ（場所を表す数が${o.n}つの${o.shape}）`, easyCheck: false,
          verify: p => p.a === `${o.s.match(/\\o?(i+)nt/)[1].length}回` || `答え ${p.a}` };
      },
      // どこで（右下の文字）と場所の形、または、何を（スカラーの積分）
      s2(r) {
        const k = turn(r, '01s2', 3);
        const o = pick01(r, k === 2 ? ['A', 'V', 'Cs'] : null); if (!o) return null;
        if (k < 2) {
          const ans = `$${o.where}$、${o.shape}`;
          if (!ansOK(r, '01s2w', o.shape, 1)) return null;   // 同じ形を2回出さない
          return { q: `$${o.s}$ で、たし合わせる場所（どこで）の名前と、場所の形`, a: ans, key: o.s,
            easy: `右下の $${o.where}$ が「どこで」。$\\int$ が${o.n}つ${/閉/.test(o.shape) ? '、◯は閉じている印' : ''}`, easyCheck: false,
            verify: p => { const g = /^\\o/.test(o.s) ? '閉じた' : ''; const n = (o.s.match(/\\o?(i+)nt/) || [])[1].length; const sh = n === 3 ? '立体' : n === 1 ? g + '道' : g ? '閉じた面' : (/_D/.test(o.s) ? '平らな面' : '面'); return p.a === `$${o.s.match(/_([A-Z])/)[1]}$、${sh}` || `答え ${p.a}`; } };
        }
        return { q: `$${o.s}$ で、たし合わせる量（何を）`, a: `$${o.what}$`, key: o.s,
          easy: `$\\int$ の右、$\\dd$ の前の $${o.what}$ が「何を」`, easyCheck: false,
          verify: p => p.a === `$${o.s.replace(/^\\i+nt_[A-Z]/, '').replace(/\\,\\dd [A-Za-z]$/, '').trim()}$` ||`答え ${p.a}` };
      },
      // ことばで書いた量を、積分の名前と回数に
      s3(r) {
        const [w, s, n] = r.pick(WORD01);
        return { q: `${w}を表す積分の名前と、ふつうの定積分の回数 □`, a: `$${s}$、${n}回`, key: s,
          easy: `何を・どこでを記号に入れる。場所を表す数が${n}つなので${n}回`, easyCheck: false,
          verify: p => { const m = WORD01.find(x => x[1] === s); return (m && p.a === `$${m[1]}$、${m[2]}回`) || `答え ${p.a}`; } };
      },
      // わな：長方形の板の重積分の値（記号を読むだけでは出ない。8-35・8-36）
      trap(r) {
        const W = r.int(1, 4), L = r.int(1, 3), a = r.int(2, 12), b = r.int(1, 6), c = r.int(1, 6);
        const I = W * L * a + b * W * W * L / 2 + c * W * L * L / 2;
        if (!Number.isInteger(I) || W === L) return null;
        const f = `${a}+${b === 1 ? '' : b}x+${c === 1 ? '' : c}y`;
        return dest({ q: `$\\iint_D(${f})\\,\\dd A$ の値（$D$ は $0\\leqq x\\leqq ${W}$、$0\\leqq y\\leqq ${L}$ の長方形）`, a: `$${I}$`, key: `t${f}|${W}|${L}`,
          calc: { kind: 'defint2', f, x: [0, W], y: [0, L] } },
        '8-01', `記号を読むだけでは値は出ない。1次式なので、まん中 $${pt(fmt(W / 2), fmt(L / 2))}$ の値 $${fmt(a + b * W / 2 + c * L / 2)}$×面積 $${W * L}$`, ['8-35', '8-36']);
      },
    },
  });

  // ================================================================ 8-02
  // 左ページの例（$h(20,\ -30)$、$h(30,\ 20)$、$h(20,\ 30)$）と教科書の例（$h(40,\ 10)$・$h(10,\ 40)$）の点は、符号・入れかえもよける。答え83・78もよける
  const BAN02 = new Set(['20,30', '10,40']);
  const ban02 = (a, b) => BAN02.has([Math.abs(a), Math.abs(b)].sort((u, v) => u - v).join(','));
  const H02 = (a, b) => `$h${pt(a, b)}$`;
  const easy02 = (a, b) => `$100-0.01\\times${par(a)}^2-0.02\\times${par(b)}^2=100-${fmt(0.01 * a * a)}-${fmt(0.02 * b * b)}=${fmt(HM(a, b))}$`;
  // 別の山（ステップ3）：[頂上の高さ, x^2 の係数, y^2 の係数]
  const MT02 = [[80, 0.005, 0.02], [60, 0.02, 0.01], [120, 0.01, 0.04], [90, 0.005, 0.01]];
  add({
    id: '8-02', part: 1, chap: '8-1⑦ 例題1', stars: 1,
    title: '2つの変数の関数の値：かっこの1つめが $x$（東）、2つめが $y$（北）。2乗の項は符号によらない',
    mark: '$h(\\square,\\ \\square)$。主役の山 $h=100-0.01x^2-0.02y^2$（$x$ は東へ、$y$ は北へ〔m〕）の高さ。',
    futsu: ['地図の上で、頂上から東へ・北へ', '（負なら西・南へ）たどった所の', '高さを、表計算で作った', '高さの表のマスから読む。'],
    raku: ['$h(20,\\ -30)$：$(-30)^2=900$ なので', '$100-4-18=78$（$h(20,\\ 30)$ と同じ）', '$h(30,\\ 20)=83$ と $h(20,\\ 30)=78$ は', 'ちがう（入れかえない）'],
    why: 'かっこの中の順番は「東、北」と決まっているので、1つめを $x$、2つめを $y$ に入れる（8-1⑦）。$x^2$・$y^2$ は2乗なので、$-30$ を入れても $30$ を入れても同じ900。頂上から西や南の所は、東や北へ同じ距離の所と同じ高さになる。',
    caution: '入れかえると値が変わる（主役の山は、東西と南北で形がちがう）。負の数はかっこをつけて $(-30)^2=900$（$-30^2=-900$ ではない）。$0.01\\times30^2=0.01\\times900=9$。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '30mm', s3: '14mm', trap: '16mm' },
    fits(q) {
      if (/坂|偏微分|等高線|切り口|表計算|半径/.test(q)) return false;
      return /\$[hg]\(-?\d+,\\ -?\d+\)\$/.test(q) && !/になる/.test(q);
    },
    steps: {
      // 正の数（頂上から東・北）
      s1(r) {
        const a = 10 * r.int(0, 6), b = 10 * r.int(0, 6), H = HM(a, b);
        if (H <= 0 || ban02(a, b) || (a === 0 && b === 0) || H === 83 || H === 78) return null;
        return { q: `主役の山の ${H02(a, b)}`, a: `$${fmt(H)}$`, key: `${a},${b}`, easy: easy02(a, b), easyCheck: 'last',
          verify: p => valIs(p, ev(HSRC, { x: a, y: b })) };
      },
      // 負の数（2乗で符号が消える）と、入れかえ（$h(a,\ b)$ と $h(b,\ a)$）
      s2(r) {
        const k = turn(r, '02s2', 2);
        if (k === 0) {
          const A = 10 * r.int(1, 6), B = 10 * r.int(1, 5), sa = r.chance(0.5) ? -1 : 1, sb = sa > 0 ? -1 : r.chance(0.5) ? -1 : 1;
          const a = sa * A, b = sb * B, H = HM(a, b);
          if (H <= 0 || ban02(a, b) || H === 83 || H === 78) return null;
          return { q: `主役の山の ${H02(a, b)}`, a: `$${fmt(H)}$`, key: `${A},${B}`, easy: `${easy02(a, b)}（2乗で符号が消える）`, easyCheck: false,
            verify: p => valIs(p, ev(HSRC, { x: a, y: b })) };
        }
        const u = 10 * r.int(1, 6), v = 10 * r.int(1, 6);
        if (u === v || ban02(u, v) || HM(Math.max(u, v), Math.min(u, v)) <= 0 || HM(Math.min(u, v), Math.max(u, v)) <= 0) return null;
        const o = r.sw02 || (r.sw02 = { n: r.int(0, 1) }), first = o.n % 2 === 0;   // 高いほうが前・後ろを交互に（U-3）
        const hi = [Math.max(u, v), Math.min(u, v)], lo = [hi[1], hi[0]], P = first ? [hi, lo] : [lo, hi];
        o.n++;
        const d = HM(...hi) - HM(...lo);
        return { q: `主役の山の ${H02(...P[0])} と ${H02(...P[1])} では、どちらが何 m 高いか`, a: `${H02(...hi)} が $${fmt(d)}\\,\\mathrm{m}$`, key: `${hi[1]},${hi[0]}`,
          easy: `${H02(...hi)}$=${fmt(HM(...hi))}$、${H02(...lo)}$=${fmt(HM(...lo))}$。差は $${fmt(d)}$`.replace(/\$\$/g, ''), easyCheck: false,
          verify: p => { const A = ev(HSRC, { x: hi[0], y: hi[1] }), B = ev(HSRC, { x: lo[0], y: lo[1] }), w = A > B ? hi : lo; return p.a === `${H02(...w)} が $${fmt(Math.abs(A - B))}\\,\\mathrm{m}$` || `答え ${p.a}`; } };
      },
      // 別の山
      s3(r) {
        const [T, p2, q2] = r.pick(MT02), a = 10 * r.int(-6, 6), b = 10 * r.int(-5, 5), g = T - p2 * a * a - q2 * b * b;
        if (g <= 0 || a === 0 || b === 0) return null;
        const src = `${T}-${p2}x^2-${q2}y^2`;
        return { q: `山の高さが $g(x,\\ y)=${src}$〔m〕のとき、$g${pt(a, b)}$`, a: `$${fmt(g)}$`, key: `g${T}|${a},${b}`,
          easy: `$${T}-${p2}\\times${par(a)}^2-${q2}\\times${par(b)}^2=${T}-${fmt(p2 * a * a)}-${fmt(q2 * b * b)}=${fmt(g)}$`, easyCheck: 'last',
          verify: p => valIs(p, ev(src, { x: a, y: b })) };
      },
      // わな：高さが決まった点の $x$ を求める（切り口の方程式。8-07）
      trap(r) {
        const y0 = 10 * r.intNot(-3, 3, v => v === 0), x = 10 * r.int(1, 8), c = HM(x, y0);
        if (c <= 0 || !Number.isInteger(c)) return null;
        return dest({ q: `主役の山で、$y=${y0}$ の所を東西に歩く。高さが $${c}\\,\\mathrm{m}$ になる点の $x$（$x>0$）`, a: `$x=${x}$`, key: `t${y0},${c}`,
          verify: p => { const xs = nums(p.a)[0]; return near(ev(HSRC, { x: xs, y: y0 }), c) && xs > 0 || `x=${xs} で高さが ${c} にならない`; } },
        '8-02', `値を出すのではなく、高さから点を求める。切り口 $h=${fmt(100 - 0.02 * y0 * y0)}-0.01x^2=${c}$ を解いて $x=${x}$`, ['8-07']);
      },
    },
  });

  // ================================================================ 8-03
  // 表計算の表：1行め（B1〜）に x、A列（A2〜）に y。B2 の式を全部のマスにコピーする。xs・ys は表の数
  const COL = j => String.fromCharCode(66 + j);   // 0 → B
  const F03 = '`=100-0.01*B$1^2-0.02*$A2^2`';
  // 左ページの例（D5）と教科書の例（E4・F5・D3・E2）のマスは出さない（ふつうの並べ方のとき）
  const BAN03 = new Set(['D5', 'E4', 'F5', 'D3', 'E2', 'B2']);
  const XS0 = [0, 10, 20, 30, 40, 50], YS0 = [40, 30, 20, 10, 0];
  const list03 = v => (v.length > 3 ? `$${v[0]}$、$${v[1]}$、…、$${v[v.length - 1]}$` : v.map(x => `$${x}$`).join('、'));
  add({
    id: '8-03', part: 1, chap: '8-1④ 例題2', stars: 1,
    title: '表計算の式のコピー：`$` のついた所は動かない（$x$ は1行め、$y$ はA列）',
    mark: 'B2 の式 `=100-0.01*B$1^2-0.02*$A2^2` をコピーした表。「□ に入っている式と値」。',
    futsu: ['B2 から目当てのマスまで、', '1マスずつコピーするたびに', '式の番地をずらして書き直し、', '最後の式に数を入れる。'],
    raku: ['D5 の式：`B$1` は列だけ動いて `D$1`、', '`$A2` は行だけ動いて `$A5`', 'D1 が20、A5 が10 → $100-4-2=94$', '（コピーの回数を数えない）'],
    why: '`$` は「ここは動かさない」という印（2-18）。`B$1` は行の番号1の前に `$` があるので、どこへコピーしても1行め（$x$）を読み、列の文字だけがそのマスの列になる。`$A2` は列の文字Aの前に `$` があるので、A列（$y$）を読み、行の番号だけがそのマスの行になる。だから、どのマスの式も「真上の1行めの $x$ と、真横のA列の $y$」を使う（8-1④）。',
    caution: '表は北が上で、行の番号が大きいほど南（$y$ が小さい）。`$` のない所だけがずれる。値を出すときは、1行めとA列の数を、そのマスの真上・真横から読む。',
    counts: { s1: 4, s2: 1, s3: 2, trap: 1 },   // 右ページは表とプログラムが高いので、ステップ2 は1問
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '12mm', s3: '12mm', trap: '14mm' },
    fits(q, p) {
      if (/坂|偏微分|等高線/.test(q)) return false;
      return /コピー/.test(q) && /`/.test(q) || /np\.meshgrid|H\[\d, \d\]/.test(q) || !!(p && p.code && /meshgrid/.test(p.code));
    },
    steps: {
      // コピーした式の番地（`B$1`・`$A2` に当たる所）
      s1(r) {
        const j = r.int(0, 5), i = r.int(0, 4), cell = COL(j) + (i + 2);
        if (BAN03.has(cell)) return null;
        const ans = `\`${COL(j)}$1\`、\`$A${i + 2}\``;
        return { q: `B2 の ${F03} を G6 までコピーした。${cell} の式で、\`B$1\` と \`$A2\` に当たる所`, a: ans, key: `${XS0[j]},${YS0[i]}`,
          easy: `\`B$1\` は行が止まり列だけ ${COL(j)} に、\`$A2\` は列が止まり行だけ ${i + 2} に`, easyCheck: false,
          verify: p => { const m = /^([A-Z])(\d)$/.exec(cell); return p.a === `\`${m[1]}$1\`、\`$A${m[2]}\`` || `答え ${p.a}`; } };
      },
      // マスの値（1行め・A列の数を文に書く）。並べ方を変えることも
      s2(r) {
        const k = turn(r, '03s2', 2);
        const xs = k === 0 ? XS0 : [-20, -10, 0, 10, 20, 30], ys = k === 0 ? YS0 : r.pick([[20, 10, 0, -10, -20], [30, 20, 10, 0, -10]]);
        const j = r.int(0, 5), i = r.int(0, 4), cell = COL(j) + (i + 2), x = xs[j], y = ys[i], H = HM(x, y);
        if ((k === 0 && BAN03.has(cell)) || cell === 'D5' || H === 94) return null;
        return { q: `B1〜G1 に $x$ の ${list03(xs)}、A2〜A6 に $y$ の ${list03(ys)} を入れ、B2 の ${F03} を G6 までコピーした。${cell} の値 □`, a: `$${fmt(H)}$`, key: `${x},${y}`,
          easy: `${cell} の真上の ${COL(j)}1 が $${x}$、真横の A${i + 2} が $${y}$。$100-${fmt(0.01 * x * x)}-${fmt(0.02 * y * y)}=${fmt(H)}$`, easyCheck: false,
          verify: p => valIs(p, ev(HSRC, { x: xs[cell.charCodeAt(0) - 66], y: ys[+cell[1] - 2] })) };
      },
      // 表計算の画面、Python の H[i, j]
      s3(r) {
        const k = turn(r, '03s3', 2);
        if (k === 0) {
          const xs = r.pick([[-20, -10, 0, 10, 20], [0, 20, 40, 60, 80], [-40, -30, -20, -10, 0]]), ys = r.pick([[20, 10, 0], [0, -10, -20], [30, 20, 10], [10, 0, -10]]);   // 画面は5列×3行（見開きに入るように）
          const j = r.int(0, 4), i = r.int(0, 2), cell = COL(j) + (i + 2), x = xs[j], y = ys[i], H = HM(x, y);
          if (H <= 0 || cell === 'D5') return null;
          const rows = [['', ...xs.map(String)], ...ys.map(y2 => [String(y2), '', '', '', '', ''])];
          return { q: `下の表計算の画面の B2 に ${F03} を入れて、F4 までコピーした。${cell} の値 □`, a: `$${fmt(H)}$`, key: `${x},${y}`,
            table: mtab({ sheet: true, rows }),
            easy: `真上の ${COL(j)}1 が $${x}$、真横の A${i + 2} が $${y}$。$100-${fmt(0.01 * x * x)}-${fmt(0.02 * y * y)}=${fmt(H)}$`, easyCheck: false,
            verify: p => valIs(p, ev(HSRC, { x: +rows[0][cell.charCodeAt(0) - 65], y: +rows[+cell[1] - 1][0] })) };
        }
        const ax = r.pick([[0, 60, 10], [-20, 40, 10], [0, 120, 20]]), ay = r.pick([[40, -10, -10], [20, -30, -10], [30, -20, -10]]);
        const xs = [], ys = []; for (let v = ax[0]; v < ax[1]; v += ax[2]) xs.push(v); for (let v = ay[0]; v > ay[1]; v += ay[2]) ys.push(v);
        const i = r.int(0, ys.length - 1), j = r.int(0, xs.length - 1), x = xs[j], y = ys[i], H = HM(x, y);
        if (H <= 0 || (ax[0] === 0 && ax[2] === 10 && ay[0] === 40 && i === 2 && j === 3)) return null;   // 教科書の H[2, 3]
        const code = `import numpy as np\nx = np.arange(${ax.join(', ')})\ny = np.arange(${ay.join(', ')})\nX, Y = np.meshgrid(x, y)\nH = 100 - 0.01*X**2 - 0.02*Y**2\nprint(H[${i}, ${j}])`;
        const out = fmt(H).includes('.') ? fmt(H) : fmt(H) + '.0';
        return { q: '次のプログラムで表示される数 □', code, a: `$${out}$`, key: `${x},${y}`,
          easy: `$x$ は ${list03(xs)}、$y$ は ${list03(ys)}。0から数えて、行 ${i} は $y=${y}$、列 ${j} は $x=${x}$。$h${pt(x, y)}=${fmt(H)}$`, easyCheck: false,
          verify: p => valIs(p, ev(HSRC, { x: ax[0] + j * ax[2], y: ay[0] + i * ay[2] })) };
      },
      // わな：表の数から坂を見積もる（8-09）
      trap(r) {
        const north = turn(r, '03t', 2) === 0;
        const j = r.int(north ? 0 : 0, north ? 5 : 4), i = r.int(north ? 1 : 0, 4), x = XS0[j], y = YS0[i];
        const c0 = COL(j) + (i + 2), c1 = north ? COL(j) + (i + 1) : COL(j + 1) + (i + 2), h0 = HM(x, y), h1 = north ? HM(x, y + 10) : HM(x + 10, y), s = (h1 - h0) / 10;
        if (BAN03.has(c0) || BAN03.has(c1)) return null;   // 左ページの D5（94）や教科書の例のマスの値を出さない
        return dest({ q: `主役の山の表計算の表（10 m ごと、北が上）で、${c1} が ${fmt(h1)}、${c0} が ${fmt(h0)}。${c0} の点から${north ? '北' : '東'}へ進むときの坂を、1 m あたりで見積もろう`,
          a: `$${fmt(s)}$`, key: `t${c0}${north}`, verify: p => valIs(p, (ev(HSRC, { x: north ? x : x + 10, y: north ? y + 10 : y }) - ev(HSRC, { x, y })) / 10) },
        '8-03', `式のコピーではなく坂。${north ? '上どなり' : '右どなり'}との差を間の 10 m でわって $(${fmt(h1)}-${fmt(h0)})\\div10=${fmt(s)}$`, ['8-09']);
      },
    },
  });

  // ================================================================ 8-04
  // 高さ c の等高線：$\dfrac{x^2}{(T-c)/p}+\dfrac{y^2}{(T-c)/q}=1$。半径は √ を残した形（sqrtTeX）
  const rad04 = (T, p, c) => Math.round((T - c) / p * 1e6) / 1e6;   // 半径の2乗（整数になるように丸める）
  const ab04 = (T, p, q, c) => `$a=${sqrtTeX(rad04(T, p, c))}$、$b=${sqrtTeX(rad04(T, q, c))}$`;
  const BAN04 = new Set([91, 36, 90, 80, 70, 60, 50, 40]);   // 左ページの例（91・36 m）と、教科書の例・表の高さ
  const SQ04 = [99, 96, 84, 75, 64, 51, 19];                   // 100−c が平方数（左ページの 91・36 をのぞく）
  const MT04 = [[80, 0.005, 0.02], [60, 0.02, 0.01], [120, 0.01, 0.04], [50, 0.005, 0.02]];
  const chk04 = (p, T, pp, qq, c) => valsAre(p, [Math.sqrt((T - c) / pp), Math.sqrt((T - c) / qq)], 1e-9);
  add({
    id: '8-04', part: 1, chap: '8-1⑧ 例題3', stars: 1,
    title: '等高線はだ円：$h=c$ とおいて移項し、右辺が1になるようにわる。南北の半径は東西の $\\dfrac{1}{\\sqrt2}$ 倍',
    mark: '「高さ □ m の等高線」「東西の半径・南北の半径」。主役の山 $h=100-0.01x^2-0.02y^2$。',
    futsu: ['等高線の上の点を、表や地図から', 'いくつもさがして方眼にかき、', '東西・南北のはしまでの', '長さを目もりで読む。'],
    raku: ['高さ 91 m → $0.01x^2+0.02y^2=9$', '→ $\\dfrac{x^2}{900}+\\dfrac{y^2}{450}=1$', '→ $a=30$、$b=\\sqrt{450}=15\\sqrt2$', '（高さ 36 m なら $a=80$、$b=40\\sqrt2$）'],
    why: '高さ $c$ の等高線は、$h=c$ になる点を全部集めた線。移項して $0.01x^2+0.02y^2=100-c$、両辺を $100-c$ でわると $\\Bigl(\\dfrac{x}{a}\\Bigr)^2+\\Bigl(\\dfrac{y}{b}\\Bigr)^2=1$ のだ円になる（4-8・8-1⑧）。$b^2$ はいつも $a^2$ の半分なので、$b=\\dfrac{a}{\\sqrt2}$。',
    caution: '右辺を1にしてから読む（$0.01x^2+0.02y^2=9$ のまま $a=\\sqrt9$ としない）。半径は分母の $\\sqrt{\\phantom{2}}$。$100-c$ が平方数の高さ（99・96・84 m など）なら、東西の半径は整数になる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '34mm', s3: '16mm', trap: '20mm' },
    boxh: { s1: '8mm', s2: '8mm' },
    fits(q) {
      if (/面積|間の|傾き|体積/.test(q)) return false;
      return /等高線/.test(q) && /半径/.test(q);
    },
    steps: {
      // 主役の山：100−c が平方数（東西は整数、南北は整数×√2）
      s1(r) {
        const c = r.pick(SQ04);
        return { q: `主役の山の、高さ $${c}\\,\\mathrm{m}$ の等高線の、東西の半径 $a$ と南北の半径 $b$`, a: ab04(100, 0.01, 0.02, c), key: `c${c}`,
          easy: `$0.01x^2+0.02y^2=${100 - c}$ を ${100 - c} でわって $\\dfrac{x^2}{${rad04(100, 0.01, c)}}+\\dfrac{y^2}{${rad04(100, 0.02, c)}}=1$`, easyCheck: false,
          verify: p => chk04(p, 100, 0.01, 0.02, c) };
      },
      // 主役の山のほかの高さ（南北が整数のときなど）、別の山（半径の比がちがう）
      s2(r) {
        const k = turn(r, '04s2', 3);
        if (k < 2) {
          const c = k === 0 ? 100 - 2 * r.int(1, 7) ** 2 : r.int(30, 99);
          if (BAN04.has(c) || SQ04.includes(c) || c < 1) return null;
          return { q: `主役の山の、高さ $${c}\\,\\mathrm{m}$ の等高線の、東西の半径 $a$ と南北の半径 $b$`, a: ab04(100, 0.01, 0.02, c), key: `c${c}`,
            easy: `$\\dfrac{x^2}{${rad04(100, 0.01, c)}}+\\dfrac{y^2}{${rad04(100, 0.02, c)}}=1$。$\\sqrt{\\phantom{2}}$ を残す`, easyCheck: false,
            verify: p => chk04(p, 100, 0.01, 0.02, c) };
        }
        const [T, pp, qq] = r.pick(MT04), c = T - r.int(1, 9) * (T === 50 ? 2 : 1) * 2;
        if (c <= 0 || (T === 80 && c === 60)) return null;
        const src = `${T}-${pp}x^2-${qq}y^2`;
        return { q: `山の高さが $g(x,\\ y)=${src}$〔m〕のとき、高さ $${c}\\,\\mathrm{m}$ の等高線の、東西の半径 $a$ と南北の半径 $b$`, a: ab04(T, pp, qq, c), key: `g${T}|${c}`,
          easy: `$${pp}x^2+${qq}y^2=${T - c}$ を ${T - c} でわって $\\dfrac{x^2}{${rad04(T, pp, c)}}+\\dfrac{y^2}{${rad04(T, qq, c)}}=1$`, easyCheck: false,
          verify: p => chk04(p, T, pp, qq, c) };
      },
      // 約の値（$\sqrt2=1.414$）、半径から高さ（逆の問題）
      s3(r) {
        const k = turn(r, '04s3', 2);
        if (k === 0) {
          const c = r.pick(SQ04), m = 5 * Math.sqrt(100 - c), v = m * 1.414, w = m * Math.SQRT2;
          if (Math.abs(v * 10 - Math.floor(v * 10) - 0.5) < 1e-6 || Math.round(v * 10) !== Math.round(w * 10)) return null;   // 文の値と本当の値で丸めがくいちがう組は出さない（O-4）
          return { q: `主役の山の、高さ $${c}\\,\\mathrm{m}$ の等高線の南北の半径（$\\sqrt2=1.414$ として、小数第1位まで）`, a: `約 $${(Math.round(v * 10) / 10).toFixed(1)}\\,\\mathrm{m}$`, key: `c${c}`,
            easy: `$b=${sqrtTeX(rad04(100, 0.02, c))}\\approx${m}\\times1.414=${fmt(Math.round(v * 100) / 100)}$`, easyCheck: false,
            verify: p => valIs(p, Math.round(Math.sqrt((100 - c) / 0.02) * 10) / 10) };
        }
        const ns = r.chance(0.5), n = r.int(1, 9), c = ns ? 100 - 2 * n * n : 100 - n * n;
        if (BAN04.has(c) || c <= 0) return null;
        const R = 10 * n;
        return { q: `主役の山で、${ns ? '南北' : '東西'}の半径が $${R}\\,\\mathrm{m}$ になる等高線の高さ〔m〕`, a: `$${c}$`, key: `c${c}`,
          easy: `${ns ? '$y' : '$x'}=${R}$、${ns ? '$x' : '$y'}=0$ の点の高さ：$100-${ns ? `0.02\\times${R}^2` : `0.01\\times${R}^2`}=${c}$`, easyCheck: false,
          verify: p => valIs(p, ns ? ev(HSRC, { x: 0, y: R }) : ev(HSRC, { x: R, y: 0 })) };
      },
      // わな：等高線でかこまれた土地の面積（だ円の面積。8-43）
      trap(r) {
        const c = r.pick(SQ04), n = Math.sqrt(100 - c), S = 50 * n * n;
        return dest({ q: `主役の山の、高さ $${c}\\,\\mathrm{m}$ の等高線でかこまれた土地の面積〔m²〕`, a: `$${S}\\sqrt2\\pi$`, key: `t${c}`,
          verify: p => valIs(p, Math.PI * Math.sqrt((100 - c) / 0.01) * Math.sqrt((100 - c) / 0.02)) },
        '8-04', `半径ではなく面積。だ円の面積 $\\pi ab=\\pi\\times${10 * n}\\times${5 * n}\\sqrt2$`, ['8-43']);
      },
    },
  });

  // ================================================================ 8-05
  // [何ごと, 間, 単位]。左ページの例と教科書の例の組はよける
  const BAN05 = new Set(['4,200', '4,80', '10,25', '20,40', '4,100', '4,250', '4,125', '4,160']);
  // 同じ見開きに出した [何ごと, 間] の組と、等高線の傾き（'r' と値）。ステップをまたいで、同じ計算（同じ組）・何倍かしただけの組（同じ傾き）を2回出さない（R1-4・Z-2）
  const used05 = r => r.used05 || (r.used05 = new Set());
  // 等高線・等圧線の図：少し曲がった2本の線、線の値のラベル、間の長さの両向きの矢印
  function fig05(L0, L1, gap, W) {
    const bend = (x0) => [[x0, 0], [x0 + 0.35, 1.2], [x0 + 0.3, 2.4], [x0, 3.6]];
    const yA = 1.8, xA = 0.32;
    return { s: 5, items: [['path', bend(0), { thick: true }], ['path', bend(W), { thick: true }],
      ['label', [0, 3.6], L0, 'n'], ['label', [W, 3.6], L1, 'n'],
      ['seg', [xA + W / 2, yA], [xA, yA], { arrow: true }], ['seg', [xA + W / 2, yA], [xA + W, yA], { arrow: true }],
      ['label', [xA + W / 2, yA], gap, 's']] };
  }
  add({
    id: '8-05', part: 1, chap: '8-1③ 例題4・例題8', stars: 1,
    title: '線の間かくで急さをくらべる：平均の傾き＝高さの差÷線の間。何 m（何 hPa）ごとかをそろえてから',
    mark: '等高線・等圧線の間の長さ。「平均の傾き」「100 km あたり」「どちらが急か」。',
    futsu: ['2本の線をまたぐ断面図を、', '方眼に正しい縮尺でかき、', '線の間の坂の傾きを', '図からはかってくらべる。'],
    raku: ['4 hPa ごと、間 200 km → $4\\div200\\times100=2$', '間 80 km → $4\\div80\\times100=5$（風が強い）', '10 m ごと、間 25 m → $10\\div25=0.4$', '20 m ごと、間 40 m → $20\\div40=0.5$'],
    why: '等高線（等圧線）は、何 m（何 hPa）ごとと決まった差でかいてある。平均の傾きは「高さの差÷横の長さ」（3-5）なので、差が同じなら、間がせまいほど急（8-1③）。差のちがう地図どうしは、差を間でわってからくらべる。等圧線がつまった所ほど気圧の変わり方が大きく、風が強くなりやすい。',
    caution: '何 m ごとの線かを見ないでくらべない（10 m ごとで間 25 m より、20 m ごとで間 40 m のほうが急）。100 km あたりにそろえるときは「差÷間×100」。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '30mm', s3: '14mm', trap: '14mm' },
    fits(q) { return /(等高線|等圧線)/.test(q) && /間/.test(q) && /(傾き|急|あたり)/.test(q) && !/半径|通る/.test(q); },
    steps: {
      // 1か所の傾き（m ごとの等高線、hPa ごとの等圧線）
      s1(r) {
        if (turn(r, '05s1', 2) === 0) {
          const d = r.pick([10, 20, 25, 40, 50, 320, 400, 500]);
          if (BAN05.has(`4,${d}`) || used05(r).has(`4,${d}`)) return null;
          const v = 4 / d * 100;
          used05(r).add(`4,${d}`);
          return { q: `$4\\,\\mathrm{hPa}$ ごとの等圧線で、となりの線までの間が $${d}\\,\\mathrm{km}$。$100\\,\\mathrm{km}$ あたりの気圧の変化〔hPa〕`, a: `$${fmt(v)}$`, key: `4,${d}`,
            easy: `$4\\div${d}\\times100=${fmt(v)}$`, easyCheck: 'last', verify: p => valIs(p, 400 / d) };
        }
        const D = r.pick([5, 10, 20, 50]), g = r.pick([8, 10, 16, 20, 25, 40, 50, 80, 100, 125, 200]), v = D / g;
        if (BAN05.has(`${D},${g}`) || used05(r).has(`${D},${g}`) || used05(r).has('r' + fmt(v)) || v >= 2 || v < 0.1 || !Number.isInteger(v * 100)) return null;
        used05(r).add(`${D},${g}`); used05(r).add('r' + fmt(v));
        return { q: `$${D}\\,\\mathrm{m}$ ごとの等高線で、となりの線までの間が $${g}\\,\\mathrm{m}$。この間の平均の傾き`, a: `$${fmt(v)}$`, key: `${D},${g}`,
          easy: `$${D}\\div${g}=${fmt(v)}$`, easyCheck: 'last', verify: p => valIs(p, D / g) };
      },
      // 2か所をくらべる（何 m ごとかがちがう地図）。A・B の答えを交互に、間のせまいほうが急でない組もまぜる
      s2(r) {
        const o = r.cmp05 || (r.cmp05 = { n: r.int(0, 3) }), wantA = o.n % 2 === 0, trick = o.n % 4 < 2;
        let D1, g1, D2, g2, v1, v2, t = 0;
        for (; t < 200; t++) {
          D1 = r.pick([5, 10, 20, 50]); g1 = r.pick([10, 20, 25, 40, 50, 80, 100]); D2 = r.pick([5, 10, 20, 50]); g2 = r.pick([10, 20, 25, 40, 50, 80, 100]);
          v1 = D1 / g1; v2 = D2 / g2;
          if (!(D1 === D2 || v1 === v2 || (v1 > v2) !== wantA || ((g1 > g2) === (v1 > v2)) !== trick || [v1, v2].some(v => !Number.isInteger(v * 100) || v >= 2) || BAN05.has(`${D1},${g1}`) || BAN05.has(`${D2},${g2}`) || used05(r).has(`${D1},${g1}`) || used05(r).has(`${D2},${g2}`) || used05(r).has('r' + fmt(v1)) || used05(r).has('r' + fmt(v2)))) break;
        }
        o.n++;
        if (t >= 200) return null; used05(r).add(`${D1},${g1}`); used05(r).add(`${D2},${g2}`); used05(r).add('r' + fmt(v1)); used05(r).add('r' + fmt(v2));
        const w = v1 > v2 ? 'A' : 'B';
        return { q: `地点Aでは $${D1}\\,\\mathrm{m}$ ごとの等高線の間が $${g1}\\,\\mathrm{m}$、地点Bでは $${D2}\\,\\mathrm{m}$ ごとの等高線の間が $${g2}\\,\\mathrm{m}$。坂が急なのはどちらか`, a: `${w}（$${fmt(v1)}$ と $${fmt(v2)}$）`, key: `${D1},${g1}|${D2},${g2}`,
          easy: `A は $${D1}\\div${g1}=${fmt(v1)}$、B は $${D2}\\div${g2}=${fmt(v2)}$`, easyCheck: false,
          verify: p => p.a === `${D1 / g1 > D2 / g2 ? 'A' : 'B'}（$${fmt(D1 / g1)}$ と $${fmt(D2 / g2)}$）` || `答え ${p.a}` };
      },
      // 図：等圧線（等高線）2本と、間の長さ
      s3(r) {
        const o3 = r.s05 || (r.s05 = { n: r.int(0, 1) });   // 等圧線・等高線を交互に（出した問題だけ進める）
        if (o3.n % 2 === 0) {
          const d = r.pick([20, 40, 50, 64, 320]), P0 = 4 * r.int(249, 254), v = 4 / d * 100;
          if (BAN05.has(`4,${d}`) || used05(r).has(`4,${d}`)) return null;
          used05(r).add(`4,${d}`); o3.n++;
          return { q: '図の2本の等圧線（単位は hPa）の間で、$100\\,\\mathrm{km}$ あたりの気圧の変化〔hPa〕', a: `$${fmt(v)}$`, key: `4,${d}`,
            fig: fig05(String(P0), String(P0 - 4), `$${d}\\,\\mathrm{km}$`, d < 100 ? 3.2 : 5.5),
            easy: `差は $${P0}-${P0 - 4}=4$。$4\\div${d}\\times100=${fmt(v)}$`, easyCheck: false, verify: p => valIs(p, 400 / d) };
        }
        const D = r.pick([10, 20]), g = r.pick([16, 25, 40, 50, 80]), h0 = D * r.int(5, 14), v = D / g;
        if (BAN05.has(`${D},${g}`) || used05(r).has(`${D},${g}`) || used05(r).has('r' + fmt(v))) return null;
        used05(r).add(`${D},${g}`); used05(r).add('r' + fmt(v)); o3.n++;
        return { q: '図の2本の等高線の間の、平均の傾き', a: `$${fmt(v)}$`, key: `${D},${g}`,
          fig: fig05(`$${h0 + D}\\,\\mathrm{m}$`, `$${h0}\\,\\mathrm{m}$`, `$${g}\\,\\mathrm{m}$`, g < 40 ? 3.2 : 5),
          easy: `差は $${h0 + D}-${h0}=${D}$。$${D}\\div${g}=${fmt(v)}$`, easyCheck: false, verify: p => valIs(p, D / g) };
      },
      // わな：式で表した山の、点での坂（偏微分。8-11）
      trap(r) {
        const a = 5 * r.intNot(-8, 8, v => v === 0), b = 5 * r.intNot(-6, 6, v => v === 0), east = turn(r, '05t', 2) === 0, s = east ? -0.02 * a : -0.04 * b;
        return dest({ q: `主役の山の点 $${pt(a, b)}$ で、${east ? '東' : '北'}へ進むときの坂`, a: `$${fmt(s)}$`, key: `t${a},${b}`,
          calc: { kind: 'pdiff', f: HSRC, vars: ['x', 'y'], wrt: [east ? 'x' : 'y'], at: [a, b] } },
        '8-05', `線の間ではなく、式の山の1つの点での坂。$${east ? `-0.02\\times${par(a)}` : `-0.04\\times${par(b)}`}=${fmt(s)}$`, ['8-11']);
      },
    },
  });

  // ================================================================ 8-06
  // 表の1つの行（列）の2つのマスで、高さ c の線が通る所を比で内分する
  // 左ページの例（y=0 の行、93 m）と教科書の例（y=20 の 80 m・90 m、y=10 の 85 m、y=30 の 70 m、y=40 の 60 m）はよける
  const BAN06 = new Set(['r0|93', 'r20|80', 'r10|85', 'r30|70', 'r20|90', 'r40|60']);
  // 見つもり：u0 で h0、u0+10 で h1 → u0+10(h0−c)/(h0−h1)。答えは小数第1位（割り切れれば、そのまま）
  function est06(u0, h0, h1, c) {
    const v = u0 + 10 * (h0 - c) / (h0 - h1), exact = Number.isInteger(Math.round(v * 1e6) / 1e6 * 10);
    const r1 = (Math.round(v * 10) / 10).toFixed(1), num = exact ? fmt(Math.round(v * 10) / 10) : r1;
    const mid = 10 * (h0 - c) / (h0 - h1);
    return { v, exact, a: exact ? `$${num}$` : `約 $${num}$`,
      easy: `$${u0}+10\\times\\dfrac{${h0}-${c}}{${h0}-${h1}}${exact ? '=' : '\\approx'}${u0}+${fmt(Math.round(mid * 100) / 100)}${exact ? '=' : '\\approx'}${num}$` };
  }
  const chk06 = (p, v) => { const n = nums(p.a); return (n.length === 1 && Math.abs(n[0] - v) < 0.05 + 1e-9 && (/約/.test(p.a) || near(n[0], v))) || `答え ${p.a}（${v}）`; };
  add({
    id: '8-06', part: 1, chap: '8-1⑤ 例題5', stars: 1,
    title: '表から等高線の場所：その高さをはさむ2つのマスを、比で内分する',
    mark: '表の1つの行（列）と「□ m の等高線が通る $x$（$y$）」。',
    futsu: ['2つのマスの間の点の高さを、', '式で 1 m ごとに計算し、', '目当ての高さをこえる所を', 'さがしていく。'],
    raku: ['$y=0$ の行：$x=20$ で96、$x=30$ で91', '93 m の線は $20+10\\times\\dfrac{96-93}{96-91}$', '$=20+6=26$', '（本当は $\\sqrt{700}\\approx26.5$）'],
    why: '表のマスは 10 m ごとなので、等高線はマスとマスの間を通る。その高さをはさむ2つのマスをさがし、間の高さがまっすぐ変わると考えて、比で内分する（8-1⑤）。10 m で $96-91=5$ 下がるうち、$96-93=3$ 下がった所なので、$10\\times\\dfrac35=6$ 進んだ所。',
    caution: '比は「はじめのマスから目当ての高さまでの差」÷「2つのマスの差」。はじめのマスの $x$ にたす。まっすぐ結ぶので、本当の位置とは少しずれる。割り切れないときは「約」。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '18mm' },
    fits(q) { return /等高線が通る/.test(q) && /比で/.test(q) && !/式から/.test(q); },
    steps: {
      // 東西の行（$y$ を止めた行）。文で2つのマスの値
      s1(r) {
        const y = 10 * r.int(0, 4), x0 = 10 * r.int(0, 4), h0 = HM(x0, y), h1 = HM(x0 + 10, y), c = r.int(Math.ceil(h1) + 1, Math.floor(h0) - 1);
        if (!(c > h1 && c < h0) || BAN06.has(`r${y}|${c}`) || (y === 0 && x0 === 20)) return null;   // 左ページの例の2つのマス（96・91）はよける
        const e = est06(x0, h0, h1, c);
        return { q: `主役の山の表の $y=${y}$ の行で、$x=${x0}$ が ${h0}、$x=${x0 + 10}$ が ${h1}。$${c}\\,\\mathrm{m}$ の等高線が通る $x$ を比で見つもろう（小数第1位まで）`, a: e.a, key: `r${y}|${c}`,
          easy: e.easy, easyCheck: false, verify: p => chk06(p, x0 + 10 * (ev(HSRC, { x: x0, y }) - c) / (ev(HSRC, { x: x0, y }) - ev(HSRC, { x: x0 + 10, y }))) };
      },
      // 南北の列（$x$ を止めた列）、西がわの行（東へ上り）
      s2(r) {
        if (turn(r, '06s2', 2) === 0) {
          const x = 10 * r.int(0, 5), y0 = 10 * r.int(0, 3), h0 = HM(x, y0), h1 = HM(x, y0 + 10), c = r.int(Math.ceil(h1) + 1, Math.floor(h0) - 1);
          if (!(c > h1 && c < h0)) return null;
          const e = est06(y0, h0, h1, c);
          return { q: `主役の山の表の $x=${x}$ の列で、$y=${y0}$ が ${h0}、$y=${y0 + 10}$ が ${h1}。$${c}\\,\\mathrm{m}$ の等高線が通る $y$ を比で見つもろう（小数第1位まで）`, a: e.a, key: `c${x}|${c}`,
            easy: e.easy, easyCheck: false, verify: p => chk06(p, y0 + 10 * (ev(HSRC, { x, y: y0 }) - c) / (ev(HSRC, { x, y: y0 }) - ev(HSRC, { x, y: y0 + 10 }))) };
        }
        const y = 10 * r.int(0, 4), x0 = -10 * r.int(2, 5), h0 = HM(x0, y), h1 = HM(x0 + 10, y), c = r.int(Math.ceil(h0) + 1, Math.floor(h1) - 1);
        if (!(c > h0 && c < h1) || BAN06.has(`r${y}|${c}`)) return null;
        const e = est06(x0, h0, h1, c);
        return { q: `主役の山の表の $y=${y}$ の行で、$x=${x0}$ が ${h0}、$x=${x0 + 10}$ が ${h1}。$${c}\\,\\mathrm{m}$ の等高線が通る $x$ を比で見つもろう（小数第1位まで）`, a: e.a, key: `r${y}|${c}`,
          easy: e.easy, easyCheck: false, verify: p => chk06(p, x0 + 10 * (c - ev(HSRC, { x: x0, y })) / (ev(HSRC, { x: x0 + 10, y }) - ev(HSRC, { x: x0, y }))) };
      },
      // 表の行（6つのマス）から、はさむ2つをさがす
      s3(r) {
        const y = 10 * r.int(0, 4), xs = [0, 10, 20, 30, 40, 50], hs = xs.map(x => HM(x, y)), c = r.int(Math.ceil(hs[5]) + 1, Math.floor(hs[0]) - 1);
        const j = hs.findIndex((h, k) => k < 5 && h > c && hs[k + 1] < c);
        if (j < 0 || hs.includes(c) || BAN06.has(`r${y}|${c}`) || (y === 0 && j === 2)) return null;
        const e = est06(xs[j], hs[j], hs[j + 1], c);
        return { q: `下の表は、主役の山の $y=${y}$ の行の高さ〔m〕。$${c}\\,\\mathrm{m}$ の等高線が通る $x$ を比で見つもろう（小数第1位まで）`, a: e.a, key: `r${y}|${c}`,
          table: mtab({ head: ['$x$', ...xs.map(String)], rows: [['$h$', ...hs.map(h => fmt(h))]] }),
          easy: `${c} をはさむのは $x=${xs[j]}$ と $${xs[j + 1]}$。${e.easy}`, easyCheck: false,
          verify: p => { const k = hs.findIndex((h, i) => i < 5 && (h - c) * (hs[i + 1] - c) < 0); return chk06(p, xs[k] + 10 * (hs[k] - c) / (hs[k] - hs[k + 1])); } };
      },
      // わな：式から本当の位置（切り口の方程式。8-07）
      trap(r) {
        const y0 = 10 * r.int(1, 3), c = r.int(70, 95), R2 = 100 * (100 - 0.02 * y0 * y0 - c);
        if (R2 <= 0 || !Number.isInteger(Math.round(R2 * 1e6) / 1e6) || Math.round(R2) === 700) return null;   // 左ページの「本当は √700」はよける
        const N = Math.round(R2), x = Math.sqrt(N);
        return dest({ q: `主役の山の式から、$y=${y0}$ で $${c}\\,\\mathrm{m}$ の等高線が通る本当の $x$（$x>0$）`, a: `$x=${sqrtTeX(N)}$`, key: `t${y0}|${c}`,
          verify: p => { const v = nums(p.a)[0]; return near(ev(HSRC, { x: v, y: y0 }), c) || `x=${v} で ${c} m にならない`; } },
        '8-06', `表がないので比ではなく、切り口 $${fmt(100 - 0.02 * y0 * y0)}-0.01x^2=${c}$ を解いて $x^2=${N}$`, ['8-07']);
      },
    },
  });

  // ================================================================ 8-07
  // 主役の山の切り口：$x=v$ で切ると $h=(100-0.01v^2)-0.02y^2$、$y=v$ で切ると $h=(100-0.02v^2)-0.01x^2$
  const used07 = r => r.used07 || (r.used07 = new Set());   // s1・s2 で止めた値（わなの文の切り口の式が、s1 の答えにならないように。R1-2）
  const cut07 = (ax, v) => (ax === 'x' ? `h=${fmt(100 - 0.01 * v * v)}-0.02y^2` : `h=${fmt(100 - 0.02 * v * v)}-0.01x^2`);
  // 答えの式「h=…」が、止めた文字に v を入れた主役の山と同じか（3つの値でくらべる）
  const chkCut = (p, ax, v) => { const t = strip(p.a).replace(/^h=/, ''), fr = ax === 'x' ? 'y' : 'x'; for (const u of [-13.7, 2.9, 31.3]) { const vs = ax === 'x' ? { x: v, y: u } : { x: u, y: v }; if (!near(ev(t, { [fr]: u }), ev(HSRC, vs))) return `${fr}=${u} で値がちがう`; } return true; };
  // ステップ3の式：[f の TeX, 止める文字, 切り口の式（v の関数）]
  const POLY07 = [
    [k => `x^2y+${k}y`, 'y', (v, k) => `${v}x^2+${k * v}`],
    [k => `xy^2-${k}x`, 'x', (v, k) => `${v}y^2-${k * v}`],
    [k => `x^2+${k}xy+y^2`, 'x', (v, k) => `y^2+${k * v}y+${v * v}`],
  ];
  add({
    id: '8-07', part: 1, chap: '8-1⑨ 例題6', stars: 1,
    title: '切り口：止めた文字に数を入れると、1つの変数の関数（放物線）になる',
    mark: '「$x=\\square$ の所で南北に切った」「$y=\\square$ で東西に切った」「□ m になる $y$（$x$）」。',
    futsu: ['表計算で、止めた列（行）の', '高さを 1 m ごとに計算して', '並べ、目当ての高さになる', '所をさがす。'],
    raku: ['$x=10$ で切る → $h=100-1-0.02y^2$', '$=99-0.02y^2$', '高さ 81 m → $0.02y^2=18$', '$y^2=900$、$y=30$'],
    why: '2つの変数のうち1つを決まった数に止めると、残りは1つの変数の関数になる（8-1⑨）。止めた文字の項は、ただの数になって定数の所にまとまる。主役の山の切り口は、上が山の形の放物線（3-9）で、山をたての面で切った形。',
    caution: '止めた文字の項を落とさない（$x=10$ なら $-0.01\\times10^2=-1$ も入る）。南北に切ったら $y$ の式、東西に切ったら $x$ の式。$y^2=900$ からは $y=\\pm30$ で、北の点なら $y=30$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '14mm', s3: '24mm', trap: '14mm' },
    fits(q) { return /(切っ|切り口|の所を(東西|南北)に歩く)/.test(q) && !/傾き|坂|偏微分/.test(q); },
    steps: {
      // 切り口の式
      s1(r) {
        const ax = r.chance(0.5) ? 'x' : 'y', V = ax === 'x' ? 10 * r.int(2, 9) : 10 * r.int(1, 6), v = r.chance(0.5) ? V : -V;
        used07(r).add(`${ax}${V}`);
        return { q: `主役の山を $${ax}=${v}$ の所で${ax === 'x' ? '南北' : '東西'}に切った切り口の式`, a: `$${cut07(ax, v)}$`, key: `${ax}${V}`,
          easy: `$${ax}=${v}$ を入れる：$100-${ax === 'x' ? `0.01\\times${par(v)}^2` : `0.02\\times${par(v)}^2`}=${fmt(HM(ax === 'x' ? v : 0, ax === 'x' ? 0 : v))}$ が定数`, easyCheck: false,
          verify: p => chkCut(p, ax, v) };
      },
      // 切り口の上で、高さが c になる点
      s2(r) {
        const ax = r.chance(0.5) ? 'x' : 'y', V = ax === 'x' ? 10 * r.int(2, 9) : 10 * r.int(1, 6), v = r.chance(0.5) ? V : -V, fr = ax === 'x' ? 'y' : 'x';
        const u = 10 * r.int(1, 6), c = ax === 'x' ? HM(v, u) : HM(u, v);
        if (c <= 0) return null;
        used07(r).add(`${ax}${V}`);
        return { q: `主役の山を $${ax}=${v}$ の所で${ax === 'x' ? '南北' : '東西'}に切った。その上で、高さが $${c}\\,\\mathrm{m}$ になる $${fr}$（$${fr}>0$）`, a: `$${fr}=${u}$`, key: `${ax}${V}`,
          easy: `$${cut07(ax, v)}=${c}$ から $${fr}^2=${u * u}$`, easyCheck: false,
          verify: p => { const w = nums(p.a)[0]; return (w > 0 && near(ev(HSRC, ax === 'x' ? { x: v, y: w } : { x: w, y: v }), c)) || `${fr}=${w} で ${c} にならない`; } };
      },
      // 別の式の切り口、別の山の切り口のいちばん高い所
      s3(r) {
        if (turn(r, '07s3', 2) === 0) {
          const [F, ax, G] = r.pick(POLY07), k = r.int(2, 5), v = r.intNot(-3, 4, w => w === 0 || w === 1), fr = ax === 'x' ? 'y' : 'x';
          const f = F(k), g = G(v, k).replace(/\+-/g, '-').replace(/--/g, '+').replace(/(^|[+-])1(?=[xy])/g, '$1');   // 係数の1は書かない（Z-7）
          return { q: `$f(x,\\ y)=${f}$ を $${ax}=${v}$ で止めた切り口（$${fr}$ の式）`, a: `$${g}$`, key: `f${f}|${v}`,
            easy: `$${ax}=${v}$ を入れて、$${fr}$ だけの式にまとめる`, easyCheck: false,
            verify: p => { for (const u of [-1.3, 0.7, 2.9]) { const vs = ax === 'x' ? { x: v, y: u } : { x: u, y: v }; if (!near(ev(strip(p.a), { [fr]: u }), ev(f, vs))) return `${fr}=${u} で値がちがう`; } return true; } };
        }
        const [T, pp, qq] = r.pick(MT02), ax = r.chance(0.5) ? 'x' : 'y', v = 10 * r.intNot(-4, 4, w => w === 0), top = ax === 'x' ? T - pp * v * v : T - qq * v * v;
        if (top <= 0) return null;
        return { q: `山の高さが $g(x,\\ y)=${T}-${pp}x^2-${qq}y^2$〔m〕。$${ax}=${v}$ で切った切り口の、いちばん高い所の高さ〔m〕`, a: `$${fmt(top)}$`, key: `g${T}|${ax}${v}`,
          easy: `切り口は $${fmt(top)}-${ax === 'x' ? qq : pp}${ax === 'x' ? 'y' : 'x'}^2$。いちばん高いのは $${ax === 'x' ? 'y' : 'x'}=0$ の所`, easyCheck: false,
          verify: p => valIs(p, ev(`${T}-${pp}x^2-${qq}y^2`, ax === 'x' ? { x: v, y: 0 } : { x: 0, y: v })) };
      },
      // わな：切り口の傾き（微分する。8-11）
      trap(r) {
        const ax = r.chance(0.5) ? 'x' : 'y', v = 10 * r.intNot(-4, 4, w => w === 0), u = 10 * r.intNot(-5, 5, w => w === 0), fr = ax === 'x' ? 'y' : 'x';
        const s = ax === 'x' ? -0.04 * u : -0.02 * u;
        if (used07(r).has(`${ax}${Math.abs(v)}`)) return null;
        return dest({ q: `主役の山を $${ax}=${v}$ で切った切り口 $${cut07(ax, v)}$ の、$${fr}=${u}$ での傾き`, a: `$${fmt(s)}$`, key: `t${ax}${v}|${u}`,
          calc: { kind: 'pdiff', f: HSRC, vars: ['x', 'y'], wrt: [fr], at: ax === 'x' ? [v, u] : [u, v] } },
        '8-07', `切り口の式ではなく傾き。$${fr}$ で微分（止めた $${ax}$ はそのまま）して $${ax === 'x' ? '-0.04y' : '-0.02x'}$ に $${fr}=${u}$ を入れる`, ['8-11']);
      },
    },
  });

  // ================================================================ 8-08
  // 左ページの例（$T=16+3z$、$x^2+y^2+z^2=49$）と、教科書の例（$18+2z$・$17+2.5z$・$19+1.5z$、$=4$・$=25$・$=16$）はよける
  const BAN08T = new Set(['16,3', '18,2', '17,2.5', '19,1.5']), BAN08S = new Set([49, 4, 25, 16, 1]);
  const flat08 = z => `床から $${fmt(z)}\\,\\mathrm{m}$ の水平な面`;
  const ball08 = (c, C) => `${C ? `中心 $${C}$、` : '原点が中心、'}半径 $${sqrtTeX(c)}$ の球の面`;
  add({
    id: '8-08', part: 1, chap: '8-1⑩ 例題7', stars: 1,
    title: '等値面：その値になる点を全部集めた面。$z$ だけの式は水平な面、$x^2+y^2+z^2=c$ は半径 $\\sqrt c$ の球',
    mark: '$T(x,\\ y,\\ z)$ と「□℃の等値面」。$z$ だけの式、$x^2+y^2+z^2$。',
    futsu: ['部屋の中の点を1つずつ選んで', '温度を計算し、同じ温度の点を', '集めて、どんな形に並ぶかを', '調べる。'],
    raku: ['$T=16+3z$ の 22℃ → $16+3z=22$', '→ $z=2$（床から 2 m の水平な面）', '$x^2+y^2+z^2=49$ → 距離が7', '→ 原点が中心、半径7の球の面'],
    why: '等値面は、その値になる点 $(x,\\ y,\\ z)$ を全部集めた面（8-1⑩）。$T$ が $z$ だけの式なら、$x$・$y$ は何でもよく $z$ だけが決まるので、水平な面になる。$x^2+y^2+z^2$ は原点からの距離の2乗（4-13）なので、$=c$ は距離 $\\sqrt c$ の点の集まりで、球の面。',
    caution: '2つの変数の関数では「線」（等高線）、3つの変数の関数では「面」。球の半径は $c$ ではなく $\\sqrt c$（$=36$ なら半径6）。$x$ だけの式なら、たての面（$x$ が一定）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '40mm', s3: '46mm', trap: '12mm' },
    fits(q) { return /等値面/.test(q) || /\)\^2[^$]*=\d+\$ の面/.test(q); },
    steps: {
      // $z$ だけの温度の等値面、$x^2+y^2+z^2=c$
      s1(r) {
        if (turn(r, '08s1', 2) === 0) {
          const a = r.int(15, 20), b = r.pick([1, 1.5, 2, 2.5, 3, 4]), z = r.pick([0.5, 1, 1.5, 2, 2.5]), c = a + b * z;
          if (BAN08T.has(`${a},${b}`)) return null;
          return { q: `部屋の温度が $T(x,\\ y,\\ z)=${a}+${cf(b)}z$〔℃〕（$z$ は床からの高さ〔m〕）のとき、$${fmt(c)}$℃の等値面`, a: flat08(z), key: `T${a},${b}|${c}`,
            easy: `$${a}+${cf(b)}z=${fmt(c)}$ から $z=${fmt(z)}$。$x$・$y$ は何でもよい`, easyCheck: false,
            verify: p => p.a === flat08((c - a) / b) || `答え ${p.a}` };
        }
        const c = r.pick([9, 36, 64, 81, 100, 8, 12, 18, 20, 27, 32, 50]);
        return { q: `$f(x,\\ y,\\ z)=x^2+y^2+z^2$ の、$f=${c}$ の等値面`, a: ball08(c), key: `S${c}`,
          easy: `原点からの距離の2乗が ${c}、距離は $\\sqrt{${c}}=${sqrtTeX(c)}$`, easyCheck: false,
          verify: p => { const m = /半径 \$([^$]*)\$/.exec(p.a); return (m && /原点が中心/.test(p.a) && near(ev(m[1]) ** 2, c)) || `答え ${p.a}`; } };
      },
      // 等値面の値を聞く、係数のついた球
      s2(r) {
        if (turn(r, '08s2', 2) === 0) {
          const a = r.int(14, 22), b = r.pick([0.5, 1.5, 2, 2.5, 3]), z = r.pick([0.4, 0.8, 1.2, 1.6, 2, 2.4]), c = a + b * z;
          if (BAN08T.has(`${a},${b}`)) return null;
          return { q: `部屋の温度が $T=${a}+${cf(b)}z$〔℃〕（$z$ は床からの高さ〔m〕）のとき、床から $${fmt(z)}\\,\\mathrm{m}$ の水平な面は、何℃の等値面か`, a: `$${fmt(c)}$℃`, key: `T${a},${b}|${fmt(c)}`,
            easy: `$${a}+${fmt(b)}\\times${fmt(z)}=${fmt(c)}$`, easyCheck: false, verify: p => valIs(p, ev(`${a}+${b}z`, { z })) };
        }
        const k = r.pick([2, 3, 4]), R = r.int(1, 5), m = r.pick([0, 1, 2, 5]), c = k * R * R + m;
        if (BAN08S.has(R * R)) return null;
        const f = `${k}(x^2+y^2+z^2)${m ? '+' + m : ''}`;
        return { q: `$f(x,\\ y,\\ z)=${f}$ の、$f=${c}$ の等値面`, a: ball08(R * R), key: `S${R * R}`,
          easy: `$x^2+y^2+z^2=${R * R}$ になるので、距離は ${R}`, easyCheck: false,
          verify: p => { const mm = /半径 \$([^$]*)\$/.exec(p.a); return (mm && near(k * ev(mm[1]) ** 2 + m, c)) || `答え ${p.a}`; } };
      },
      // $x$ だけの温度（たての面）、中心がずれた球
      s3(r) {
        if (turn(r, '08s3', 2) === 0) {
          const a = r.int(20, 30), b = r.pick([0.5, 1, 2, 2.5]), x = r.int(1, 6), c = a - b * x;
          return { q: `ストーブのある部屋の温度が $T(x,\\ y,\\ z)=${a}-${cf(b)}x$〔℃〕（$x$ はストーブからの距離〔m〕）のとき、$${fmt(c)}$℃の等値面`, a: `$x=${x}$ のたての面`, key: `X${a},${b}|${x}`,
            easy: `$${a}-${cf(b)}x=${fmt(c)}$ から $x=${x}$。$y$・$z$ は何でもよいので、たての面`, easyCheck: false,
            verify: p => p.a === `$x=${fmt((a - c) / b)}$ のたての面` || `答え ${p.a}` };
        }
        const ax = r.pick(['x', 'y', 'z']), s = r.intNot(-3, 3, v => v === 0), R = r.int(2, 6), C = { x: [s, 0, 0], y: [0, s, 0], z: [0, 0, s] }[ax];
        const sq = `(${ax}${s > 0 ? '-' + s : '+' + -s})^2`, f = ['x', 'y', 'z'].map(n => (n === ax ? sq : `${n}^2`)).join('+');
        return { q: `$${f}=${R * R}$ の面`, a: ball08(R * R, pt(...C)), key: `B${f}|${R}`,
          easy: `点 $${pt(...C)}$ からの距離の2乗が ${R * R}`, easyCheck: false,
          verify: p => { const P = C.map((c0, k) => c0 + (k === 1 ? R : 0)), v = ev(f, { x: P[0], y: P[1], z: P[2] }); return (near(v, R * R) && p.a.includes(`$${pt(...C)}$`) && p.a.includes(`半径 $${R}$`)) || `答え ${p.a}`; } };
      },
      // わな：温度の変わる割合（偏微分。8-15・8-13）
      trap(r) {
        const a = r.int(18, 24), b = r.pick([0.5, 1, 1.5]), c = r.pick([1.5, 2, 2.5, 3]);
        return dest({ q: `部屋の温度が $T=${a}-${cf(b)}x+${cf(c)}z$〔℃〕（$z$ は高さ〔m〕）のとき、$x$ はそのままで高さだけ $1\\,\\mathrm{m}$ 上がると、温度は何℃上がるか`, a: `$${fmt(c)}$℃`, key: `t${a},${b},${c}`,
          calc: { kind: 'pdiff', f: `${a}-${b}x+${c}z`, vars: ['x', 'z'], wrt: ['z'], at: [1, 1], ans: fmt(c) } },
        '8-08', `等値面ではなく、高さで偏微分した $\\dfrac{\\partial T}{\\partial z}=${fmt(c)}$（℃/m）`, ['8-13', '8-15']);
      },
    },
  });

  // ================================================================ 8-09
  // 主役の山の、点 (a, b) のまわりの 1 m ごとの高さ。左ページの例 $(30,\ 20)$ と教科書の例 $(40,\ 10)$・$(10,\ 30)$ は、符号を変えた点もよける
  //   となりのマスが例の点に重なる点（例の数が表に出る点）もよける
  const ban09 = (a, b) => [[30, 20], [40, 10], [10, 30]].some(([u, v]) => Math.abs(Math.abs(a) - u) <= 2 && Math.abs(Math.abs(b) - v) <= 2);
  const h09 = (x, y) => f2(HM(x, y));
  const tbl09 = (a, b) => ({ head: ['$y$＼$x$', String(a - 1), String(a), String(a + 1)], rows: [b + 1, b, b - 1].map(y => [String(y), ...[a - 1, a, a + 1].map(x => h09(x, y))]) });
  const ans09 = (e, n) => `東 $${f2(e)}$、北 $${f2(n)}$`;
  add({
    id: '8-09', part: 1, chap: '8-2③④ 例題1', stars: 1,
    title: '表の差で坂：東は同じ行の「右どなり－自分」、北は同じ列の「上どなり－自分」。両どなりの差÷2 のほうが正確',
    mark: '主役の山の、点のまわりの高さの表（1 m ごと、北が上）。「東の坂・北の坂を見積もる」。',
    futsu: ['進む長さを 0.1 m、0.01 m と', '短くしながら表を作り直し、', '「差÷長さ」が近づいていく', '値を読む。'],
    raku: ['$(30,\\ 20)$ のまわり（1 m ごと）：', '東 $82.39-83=-0.61$、北 $82.18-83=-0.82$', '両どなり：$(82.39-83.59)\\div2=-0.60$', '$(82.18-83.78)\\div2=-0.80$'],
    why: '東へ進むことは、表の同じ行（$y$ が止まっている）を右へ動くこと。北へ進むことは、同じ列（$x$ が止まっている）を上へ動くこと（8-2③）。差を間の長さでわると、1 m あたりの平均の坂になる。両どなりの差を2でわると、その点をまん中にはさむので、点での坂にもっと近い（8-2④）。',
    caution: '北が上の表なので、北の坂は「上どなり－自分」（下どなりとひくと符号が逆）。間が 1 m でなければ、差を間の長さでわる。主役の山では、両どなりの差がちょうど偏微分の値になる。',
    counts: { s1: 2, s2: 3, s3: 1, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '34mm', s3: '34mm', trap: '14mm' },
    fits(q) { return /坂/.test(q) && /見積も/.test(q); },
    steps: {
      // 片側の差（右どなり・上どなり）。表なしで、値を文に
      s1(r) {
        const a = r.int(-40, 40), b = r.int(-30, 30);
        if (ban09(a, b) || a === 0 || b === 0 || HM(a + 1, b + 1) <= 0) return null;
        const e = (HM(a + 1, b) - HM(a, b)), n = (HM(a, b + 1) - HM(a, b));
        return { q: `主役の山で、$h${pt(a, b)}=${h09(a, b)}$、$h${pt(a + 1, b)}=${h09(a + 1, b)}$、$h${pt(a, b + 1)}=${h09(a, b + 1)}$。片側の差で、点 $${pt(a, b)}$ の東の坂と北の坂を見積もろう`, a: ans09(e, n), key: `${a},${b}`,
          easy: `東 $${h09(a + 1, b)}-${par(h09(a, b))}$、北 $${h09(a, b + 1)}-${par(h09(a, b))}$`, easyCheck: false,
          verify: p => valsAre(p, [ev(HSRC, { x: a + 1, y: b }) - ev(HSRC, { x: a, y: b }), ev(HSRC, { x: a, y: b + 1 }) - ev(HSRC, { x: a, y: b })], 1e-9) };
      },
      // 両どなりの差÷2、間が 2 m の表
      s2(r) {
        const k = turn(r, '09s2', 2), a = r.int(-40, 40), b = r.int(-30, 30);
        if (ban09(a, b) || a === 0 || b === 0 || HM(a + 2, b + 2) <= 0 || HM(a - 2, b - 2) <= 0) return null;
        if (k === 0) {
          const e = (HM(a + 1, b) - HM(a - 1, b)) / 2, n = (HM(a, b + 1) - HM(a, b - 1)) / 2;
          return { q: `主役の山の点 $${pt(a, b)}$ の、右どなり ${h09(a + 1, b)}、左どなり ${h09(a - 1, b)}、上どなり ${h09(a, b + 1)}、下どなり ${h09(a, b - 1)}（1 m ごと、北が上）。両どなりの差を2でわって、東の坂と北の坂を見積もろう`, a: ans09(e, n), key: `${a},${b}`,
            easy: `東 $(${h09(a + 1, b)}-${h09(a - 1, b)})\\div2$、北 $(${h09(a, b + 1)}-${h09(a, b - 1)})\\div2$`, easyCheck: false,
            verify: p => valsAre(p, [-0.02 * a, -0.04 * b], 1e-9) };
        }
        const e = (HM(a + 2, b) - HM(a, b)) / 2, n = (HM(a, b + 2) - HM(a, b)) / 2;
        return { q: `主役の山の点 $${pt(a, b)}$ の高さは ${h09(a, b)}、東へ 2 m の所は ${h09(a + 2, b)}、北へ 2 m の所は ${h09(a, b + 2)}。1 m あたりの東の坂と北の坂を見積もろう`, a: ans09(e, n), key: `${a},${b}`,
          easy: `間が 2 m なので、差を2でわる。東 $(${h09(a + 2, b)}-${par(h09(a, b))})\\div2$、北 $(${h09(a, b + 2)}-${par(h09(a, b))})\\div2$`, easyCheck: false,
          verify: p => valsAre(p, [(ev(HSRC, { x: a + 2, y: b }) - ev(HSRC, { x: a, y: b })) / 2, (ev(HSRC, { x: a, y: b + 2 }) - ev(HSRC, { x: a, y: b })) / 2], 1e-9) };
      },
      // 3×3 の表（北が上）
      s3(r) {
        const both = turn(r, '09s3', 2) === 0, a = r.int(-40, 40), b = r.int(-30, 30);
        if (ban09(a, b) || a === 0 || b === 0 || HM(a + 1, b + 1) <= 0 || HM(a - 1, b - 1) <= 0) return null;
        const T = tbl09(a, b), g = (y, x) => +T.rows[1 - (y - b)][2 + (x - a)];   // 表から読む（検算は表の数で）
        const e = both ? (HM(a + 1, b) - HM(a - 1, b)) / 2 : HM(a + 1, b) - HM(a, b), n = both ? (HM(a, b + 1) - HM(a, b - 1)) / 2 : HM(a, b + 1) - HM(a, b);
        return { q: `下の表は、主役の山の点 $${pt(a, b)}$ のまわりの高さ〔m〕（列が $x$、行が $y$）。${both ? '両どなりの差を2でわって' : '右どなり・上どなりとの差で'}、東の坂と北の坂を見積もろう`, a: ans09(e, n), key: `${a},${b}`,
          table: mtab(T), easy: both ? `東は $y=${b}$ の行の左右、北は $x=${a}$ の列の上下（上が北）` : `東は $y=${b}$ の行の右どなり、北は $x=${a}$ の列の上どなり`, easyCheck: false,
          verify: p => valsAre(p, both ? [(g(b, a + 1) - g(b, a - 1)) / 2, (g(b + 1, a) - g(b - 1, a)) / 2] : [g(b, a + 1) - g(b, a), g(b + 1, a) - g(b, a)], 1e-9) };
      },
      // わな：表がなく式だけ（偏微分に点を入れる。8-11）
      trap(r) {
        const a = r.intNot(-40, 40, v => v === 0), b = r.intNot(-30, 30, v => v === 0), east = turn(r, '09t', 2) === 0, s = east ? -0.02 * a : -0.04 * b;
        if (ban09(a, b)) return null;
        return dest({ q: `主役の山の式 $h=${HSRC}$ から、点 $${pt(a, b)}$ で${east ? '東' : '北'}へ進むときの坂（表は使わない）`, a: `$${fmt(s)}$`, key: `t${a},${b}`,
          calc: { kind: 'pdiff', f: HSRC, vars: ['x', 'y'], wrt: [east ? 'x' : 'y'], at: [a, b] } },
        '8-09', `表の差で見積もらなくても、偏微分 $${east ? '-0.02x' : '-0.04y'}$ に点を入れればちょうどの値`, ['8-11']);
      },
    },
  });

  // ---------------------------------------------------------------- 多項式（2つ・3つの文字）の部品
  // 項は { c: 係数, e: [x の次数, y の次数, (z の次数)] }。V は文字の名前（['x', 'y'] など）。項の順は作った順のまま
  function monoTeX(t, V, first) {
    const vp = t.e.map((k, i) => (k === 0 ? '' : k === 1 ? V[i] : `${V[i]}^${k}`)).join('');
    const a = Math.abs(t.c), co = vp && a === 1 ? '' : fmt(a);
    return (t.c < 0 ? '-' : first ? '' : '+') + co + vp;
  }
  const polyTeX = (P, V) => (P.length ? P.map((t, i) => monoTeX(t, V, i === 0)).join('') : '0');
  const dPoly = (P, i) => P.filter(t => t.e[i] > 0).map(t => ({ c: t.c * t.e[i], e: t.e.map((k, j) => (j === i ? k - 1 : k)) }));
  const keyPoly = P => P.map(t => `${t.c}:${t.e.join('')}`).sort().join('|');
  // 偏微分の欄（2つ・3つ）：「$\dfrac{\partial f}{\partial x}=$ □、…」
  const dfr = (f, v, n) => `\\dfrac{\\partial${n ? '^' + n : ''} ${f}}{\\partial ${v}}`;
  const boxes = (f, V) => V.map(v => `$${dfr(f, v)}=$ □`).join('、');
  // 検算の印（calc pdiff）：答えの欄の順に
  const calcPd = (F, V, ans, at) => Object.assign({ kind: 'pdiff', f: F, vars: V, wrt: V.map(v => [v]), ans }, at ? { at } : {});

  // ================================================================ 8-10
  // 左ページの例（$2x^2y+y^3$、$x^2y$）と教科書の例（$3x^2y+2y^3$、$x^3-4xy^2+5y$）、例と同じ答え（$4xy$・$2x^2+3y^2$・$2xy$）はよける
  const BAN10 = new Set(['2x^2y+y^3', 'x^2y', '3x^2y+2y^3', 'x^3-4xy^2+5y']), BANA10 = new Set(['4xy', '2x^2+3y^2', '2xy']);
  const rc = r => r.intNot(-5, 5, v => v === 0);
  // 2つの文字の多項式（mixed：両方の文字をふくむ項の数、pure：片方だけの項の数、cst：定数項）
  function poly10(r, mixed, pure, cst) {
    const P = [], seen = new Set();
    for (let k = 0; k < 40 && P.length < mixed; k++) { const e = [r.int(1, 3), r.int(1, 3)]; if (!seen.has(e + '')) { seen.add(e + ''); P.push({ c: rc(r), e }); } }
    for (let k = 0; k < 40 && P.length < mixed + pure; k++) { const i = r.int(0, 1), e = [0, 0]; e[i] = r.int(1, 3); if (!seen.has(e + '')) { seen.add(e + ''); P.push({ c: rc(r), e }); } }
    if (cst) P.push({ c: r.intNot(-9, 9, v => v === 0), e: [0, 0] });
    P.sort((a, b) => (b.e[0] + b.e[1]) - (a.e[0] + a.e[1]) || b.e[0] - a.e[0]);
    return P;
  }
  // ステップ3：文字のちがう式（[f の名前, 式, 文字, 答え2つ]）
  const GEO10 = [
    ['V', '\\pi r^2h', ['r', 'h'], ['2\\pi rh', '\\pi r^2'], '円柱の体積'],
    ['S', '2\\pi r^2+2\\pi rh', ['r', 'h'], ['4\\pi r+2\\pi h', '2\\pi r'], '円柱の表面積'],
    ['V', '\\frac13\\pi r^2h', ['r', 'h'], ['\\frac23\\pi rh', '\\frac13\\pi r^2'], '円すいの体積'],
    ['S', '\\frac12ab', ['a', 'b'], ['\\frac12b', '\\frac12a'], '直角三角形の面積'],
  ];
  add({
    id: '8-10', part: 1, chap: '8-2⑥⑦ 例題2', stars: 1,
    title: '偏微分：止めた文字は数と同じ。止めた文字だけの項は0、止めた文字の因数は外に出したまま',
    mark: '$\\dfrac{\\partial f}{\\partial x}$・$\\dfrac{\\partial f}{\\partial y}$。$x$ と $y$ の多項式。',
    futsu: ['$\\dfrac{f(x+\\Delta x,\\ y)-f(x,\\ y)}{\\Delta x}$ を', '展開して整理し、$\\Delta x$ を', '0に近づける（$y$ でも', '同じことをもう一度する）。'],
    raku: ['$f=2x^2y+y^3$', '→ $\\dfrac{\\partial f}{\\partial x}=4xy$（$y^3$ は0）', '→ $\\dfrac{\\partial f}{\\partial y}=2x^2+3y^2$', '$x^2y$ を $x$ で → $2xy$（$+x^2$ はつかない）'],
    why: '偏微分は、ほかの文字を止めて1つの文字だけを動かす微分（8-2⑥）。止めた文字は、ふつうの数と同じ。$3x^2$ の微分が $6x$ になるように、$x^2y$ を $x$ で偏微分すると、数 $y$ は外に出したまま $2xy$。止めた文字だけの項（$y^3$）は数なので、微分すると0（8-2⑦）。',
    caution: '積の微分のように、止めた文字まで微分しない（$\\dfrac{\\partial}{\\partial x}(x^2y)=2xy+x^2$ はまちがい）。止めた文字だけの項を残さない。どちらの文字で偏微分するかで、答えはまったくちがう。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '30mm', s3: '24mm', trap: '14mm' },
    fits(q) {
      if (/点|\$\([^$]*\)\$|z|\\(sin|cos|tan)|e\^|\\partial\^2|∇|nabla|変わる|変化|ふえ|へっ|動く|単位|〔|℃/.test(q)) return false;
      return /\\partial/.test(q);
    },
    steps: {
      // 2つの項（両方の文字をふくむ項と、片方だけの項）
      s1(r) {
        const P = poly10(r, 1, 1, false), F = polyTeX(P, ['x', 'y']), ax = polyTeX(dPoly(P, 0), ['x', 'y']), ay = polyTeX(dPoly(P, 1), ['x', 'y']);
        if (BAN10.has(F) || BANA10.has(ax) || BANA10.has(ay)) return null;
        return { q: `$f=${F}$ で、${boxes('f', ['x', 'y'])}`, a: `$${ax}$、$${ay}$`, key: keyPoly(P),
          easy: `$x$ で：$y$ は数。$y$ で：$x$ は数。止めた文字だけの項は0`, easyCheck: false, calc: calcPd(F, ['x', 'y'], [ax, ay]) };
      },
      // 3つ・4つの項（定数項・マイナスの係数をふくむ）
      s2(r) {
        const P = poly10(r, r.int(1, 2), r.int(1, 2), r.chance(0.5)), F = polyTeX(P, ['x', 'y']), ax = polyTeX(dPoly(P, 0), ['x', 'y']), ay = polyTeX(dPoly(P, 1), ['x', 'y']);
        if (P.length < 3 || BAN10.has(F) || BANA10.has(ax) || BANA10.has(ay) || ax === '0' || ay === '0') return null;
        return { q: `$f=${F}$ で、${boxes('f', ['x', 'y'])}`, a: `$${ax}$、$${ay}$`, key: keyPoly(P),
          easy: `項ごとに偏微分してたす。${P.filter(t => !t.e[0]).length ? `$x$ で偏微分すると、$x$ のない項は0。` : ''}${P.filter(t => !t.e[1]).length ? `$y$ で偏微分すると、$y$ のない項は0` : ''}`, easyCheck: false,
          calc: calcPd(F, ['x', 'y'], [ax, ay]) };
      },
      // 文字のちがう式（$u$・$v$、$s$・$t$）、図形の式
      s3(r) {
        if (turn(r, '10s3', 2) === 0) {
          const V = r.pick([['u', 'v'], ['s', 't'], ['p', 'q']]), P = poly10(r, 1, r.int(1, 2), false), F = polyTeX(P, V), a1 = polyTeX(dPoly(P, 0), V), a2 = polyTeX(dPoly(P, 1), V);
          return { q: `$g=${F}$ で、${boxes('g', V)}`, a: `$${a1}$、$${a2}$`, key: keyPoly(P),
            easy: `$${V[0]}$ で偏微分するときは $${V[1]}$ が数、$${V[1]}$ で偏微分するときは $${V[0]}$ が数`, easyCheck: false, calc: calcPd(F, V, [a1, a2]) };
        }
        const [n, F, V, A, name] = r.pick(GEO10);
        return { q: `${name} $${n}=${F}$ で、${boxes(n, V)}`, a: `$${A[0]}$、$${A[1]}$`, key: F,
          easy: `$\\pi$ や $\\frac12$ は数。止めた文字も数`, easyCheck: false, calc: calcPd(F, V, A) };
      },
      // わな：2つの文字が同時に動く（連鎖律。8-19）
      trap(r) {
        const m = r.int(1, 2), n = r.int(1, 2), x0 = r.int(1, 3), y0 = r.int(1, 3), u = r.intNot(-3, 3, v => v === 0), w = r.intNot(-3, 3, v => v === 0);
        const P = [{ c: 1, e: [m, n] }], F = polyTeX(P, ['x', 'y']), fx = m * x0 ** (m - 1) * y0 ** n, fy = n * x0 ** m * y0 ** (n - 1), v = fx * u + fy * w;
        if (F === 'x^2y' || v === 0) return null;
        return dest({ q: `$f=${F}$ で、$x=${x0}${u > 0 ? '+' : '-'}${Math.abs(u) === 1 ? '' : Math.abs(u)}t$、$y=${y0}${w > 0 ? '+' : '-'}${Math.abs(w) === 1 ? '' : Math.abs(w)}t$ と2つが同時に動く。$t=0$ での $f$ の変わる速さ`, a: `$${v}$`, key: `t${F}|${x0},${y0},${u},${w}`,
          verify: p => { const g = t => ev(F, { x: x0 + u * t, y: y0 + w * t }), h = 1e-5; return valIs(p, (g(h) - g(-h)) / (2 * h), 1e-6); } },
        '8-10', `1つを止めるのではなく、両方が動く。坂×その向きの速さをたす $${fx}\\times${par(u)}+${fy}\\times${par(w)}=${v}$`, ['8-19']);
      },
    },
  });

  // ================================================================ 8-11
  // 主役の山の点での坂：東 $-0.02x$、北 $-0.04y$。左ページの例 $(-30,\ 10)$・$(30,\ 20)$ と教科書の例 $(-20,\ 10)$・$(20,\ -30)$ は、符号を変えた点もよける
  const ban11 = (a, b) => ['30,20', '30,10', '20,10', '20,30'].includes(`${Math.abs(a)},${Math.abs(b)}`);
  // 左ページの例と同じ計算（東の坂は $x$ だけ、北の坂は $y$ だけで決まる）：東の坂の $x=\pm30$、北の坂の $y=\pm10$・$\pm20$ もよける（R1-3）
  const banE11 = a => Math.abs(a) === 30, banN11 = b => Math.abs(b) === 10 || Math.abs(b) === 20;
  // 同じ見開きで使った東の坂の $x$・北の坂の $y$（同じ計算を2回出さない。Z-2）
  const used11 = r => r.used11 || (r.used11 = { x: new Set(), y: new Set() });
  const ex = a => -0.02 * a, ny = b => -0.04 * b;
  const ud = v => (v > 0 ? '上り' : '下り');
  // 長さ1の矢印との内積（北東・北西）の答え：$k\sqrt2$ の形
  const rt2 = v => { const k = Math.round(v / 2 * 1e9) / 1e9; return k === 1 ? '\\sqrt2' : k === -1 ? '-\\sqrt2' : `${fmt(k)}\\sqrt2`; };
  add({
    id: '8-11', part: 1, chap: '8-2⑥ 例題3', stars: 1,
    title: '点での坂：偏導関数に点を入れる（主役の山は $-0.02x$、$-0.04y$）。正なら上り、負なら下り',
    mark: '主役の山の「点 $(\\square,\\ \\square)$ での坂」「上りか下りか」。$\\dfrac{\\partial h}{\\partial x}=-0.02x$、$\\dfrac{\\partial h}{\\partial y}=-0.04y$。',
    futsu: ['その点のまわりの高さの表を', '作り、進む長さを短くしながら', '差÷長さを計算して、近づく', '値を読む（東と北で1回ずつ）。'],
    raku: ['$(-30,\\ 10)$：東 $-0.02\\times(-30)=0.6$（上り）', '北 $-0.04\\times10=-0.4$（下り）', '$(30,\\ 20)$：東 $-0.6$、北 $-0.8$', '（偏導関数を一度作れば、点を入れるだけ）'],
    why: '偏微分した式（偏導関数）は、どの点でも使える坂のきまり（8-2⑥）。点 $(a,\\ b)$ での値は $x=a$、$y=b$ を入れて求め、$\\dfrac{\\partial h}{\\partial x}(a,\\ b)$ と書く。正なら、その向きに進むと上り、負なら下り。大きさは、1 m 進むあたりに上がる（下がる）高さ。',
    caution: '偏微分の値は点ごとにちがう（「点 $(30,\\ 20)$ での東の坂は $-0.6$」と、点をつけて言う）。負の座標はかっこをつけて $-0.02\\times(-30)$。東の坂には $x$ だけ、北の坂には $y$ だけを入れる。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '20mm', s3: '24mm', trap: '18mm' },
    fits(q) {
      if (/どなり|表の|見積も|北東|北西|南東|南西|向き|切り口|切っ|全微分|変わる|動く/.test(q)) return false;
      return /主役の山|\$[hg]\(x,\\ y\)=|\$h=/.test(q) && /(坂|\\partial)/.test(q) && /\$\(-?\d+,\\ -?\d+\)\$|\(-?\d+,\\ -?\d+\)/.test(q);
    },
    steps: {
      // 東の坂と北の坂（偏微分の値）
      s1(r) {
        const a = 5 * r.int(-10, 10), b = 5 * r.int(-8, 8);
        if (ban11(a, b) || banE11(a) || banN11(b) || (a === 0 && b === 0) || HM(a, b) <= 0 || used11(r).x.has(a) || used11(r).y.has(b)) return null;
        used11(r).x.add(a); used11(r).y.add(b);
        return { q: `主役の山の点 $${pt(a, b)}$ で、$${dfr('h', 'x')}=$ □、$${dfr('h', 'y')}=$ □`, a: `$${fmt(ex(a))}$、$${fmt(ny(b))}$`, key: `${a},${b}`,
          easy: `$-0.02\\times${par(a)}=${fmt(ex(a))}$、$-0.04\\times${par(b)}=${fmt(ny(b))}$`, easyCheck: false,
          calc: calcPd(HSRC, ['x', 'y'], [fmt(ex(a)), fmt(ny(b))], [a, b]) };
      },
      // 上りか下りか（上り・下りを交互に）
      s2(r) {
        const o = r.ud11 || (r.ud11 = { n: r.int(0, 3) }), up = o.n % 2 === 0, east = o.n % 4 < 2;
        const a = 5 * r.int(-10, 10), b = 5 * r.int(-8, 8), s = east ? ex(a) : ny(b);
        if (ban11(a, b) || (east ? banE11(a) || used11(r).x.has(a) : banN11(b) || used11(r).y.has(b)) || s === 0 || (s > 0) !== up || HM(a, b) <= 0) return null;
        o.n++; used11(r)[east ? 'x' : 'y'].add(east ? a : b);
        return { q: `主役の山の点 $${pt(a, b)}$ から${east ? '東' : '北'}へ進む。上りか下りかと、坂の値`, a: `${ud(s)}、$${fmt(s)}$`, key: `${a},${b}`,
          easy: `$${east ? `-0.02\\times${par(a)}` : `-0.04\\times${par(b)}`}=${fmt(s)}$。${s > 0 ? '正なので上り' : '負なので下り'}`, easyCheck: false,
          verify: p => { const t = ev(east ? '-0.02x' : '-0.04y', { x: a, y: b }); return p.a === `${t > 0 ? '上り' : '下り'}、$${fmt(t)}$` || `答え ${p.a}`; } };
      },
      // どちらが急か、別の山
      s3(r) {
        const k3 = r.k11 || (r.k11 = { n: r.int(0, 1) });   // 2つの形を交互に（出した問題だけ進める）
        if (k3.n % 2 === 0) {
          const o = r.st11 || (r.st11 = { n: r.int(0, 1) }), wantE = o.n % 2 === 0;
          const a = 5 * r.intNot(-10, 10, v => v === 0), b = 5 * r.intNot(-8, 8, v => v === 0), e = ex(a), n = ny(b);
          if (ban11(a, b) || banE11(a) || banN11(b) || used11(r).x.has(a) || used11(r).y.has(b) || Math.abs(e) === Math.abs(n) || (Math.abs(e) > Math.abs(n)) !== wantE || HM(a, b) <= 0) { if ((o.f = (o.f || 0) + 1) % 40 === 0) { o.n++; if (o.f % 80 === 0) k3.n++; } return null; }   // 組が見つからないときは、東・北の向きや形を変える（止まらないように）
          o.n++; k3.n++; used11(r).x.add(a); used11(r).y.add(b);
          return { q: `主役の山の点 $${pt(a, b)}$ で、東へ進むときと北へ進むときでは、どちらの坂が急か`, a: `${wantE ? '東' : '北'}（$${fmt(Math.abs(e))}$ と $${fmt(Math.abs(n))}$）`, key: `${a},${b}`,
            easy: `東 $${fmt(e)}$、北 $${fmt(n)}$。急さは大きさでくらべる`, easyCheck: false,
            verify: p => p.a === `${Math.abs(ev('-0.02x', { x: a })) > Math.abs(ev('-0.04y', { y: b })) ? '東' : '北'}（$${fmt(Math.abs(e))}$ と $${fmt(Math.abs(n))}$）` || `答え ${p.a}` };
        }
        const [T, pp, qq] = r.pick(MT02), a = 10 * r.intNot(-5, 5, v => v === 0), b = 10 * r.intNot(-5, 5, v => v === 0);
        if (T - pp * a * a - qq * b * b <= 0 || ban11(a, b)) return null;
        k3.n++;
        const src = `${T}-${pp}x^2-${qq}y^2`, gx = fmt(-2 * pp * a), gy = fmt(-2 * qq * b);
        return { q: `山の高さ $g(x,\\ y)=${src}$ の、点 $${pt(a, b)}$ での $${dfr('g', 'x')}=$ □、$${dfr('g', 'y')}=$ □`, a: `$${gx}$、$${gy}$`, key: `g${T}|${a},${b}`,
          easy: `$${dfr('g', 'x')}=${fmt(-2 * pp)}x$、$${dfr('g', 'y')}=${fmt(-2 * qq)}y$ に点を入れる`, easyCheck: false,
          calc: calcPd(src, ['x', 'y'], [gx, gy], [a, b]) };
      },
      // わな：ななめ（北東・北西）に進むときの坂（長さ1の矢印との内積。8-24）
      trap(r) {
        const ne = turn(r, '11t', 2) === 0, a = 10 * r.intNot(-5, 5, v => v === 0), b = 10 * r.intNot(-4, 4, v => v === 0), v = ne ? ex(a) + ny(b) : -ex(a) + ny(b);
        if (v === 0 || HM(a, b) <= 0 || ban11(a, b)) return null;
        return dest({ q: `主役の山の点 $${pt(a, b)}$ から${ne ? '北東' : '北西'}へ進むときの坂`, a: `$${rt2(v)}$`, key: `t${a},${b},${ne}`,
          verify: p => { const u = ne ? [1, 1] : [-1, 1], h = 1e-4, g = (s, t2) => ev(HSRC, { x: s, y: t2 }), d = (g(a + u[0] * h / Math.SQRT2, b + u[1] * h / Math.SQRT2) - g(a - u[0] * h / Math.SQRT2, b - u[1] * h / Math.SQRT2)) / (2 * h); return valIs(p, d, 1e-6); } },
        '8-11', `東・北ではなくななめ。長さ1の矢印 $\\Bigl(${ne ? '' : '-'}\\dfrac{1}{\\sqrt2},\\ \\dfrac{1}{\\sqrt2}\\Bigr)$ と $(${fmt(ex(a))},\\ ${fmt(ny(b))})$ の内積`, ['8-24']);
      },
    },
  });

  // ================================================================ 8-12
  // $e^{ax}$ と $\sin by$・$\cos by$、$\sin(ax+by)$ の部品
  const eTeX = a => (a === 1 ? 'e^{x}' : a === -1 ? 'e^{-x}' : `e^{${a}x}`);
  const lin2 = (a, b, V) => polyTeX([{ c: a, e: [1, 0] }, { c: b, e: [0, 1] }].filter(t => t.c), V || ['x', 'y']);
  const trig = (fn, inner, paren) => `\\${fn}${paren ? `(${inner})` : ' ' + inner}`;
  const kTeX = (k, rest) => (k === 1 ? rest : k === -1 ? '-' + rest : fmt(k) + rest);   // 係数×式
  const by = b => (b === 1 ? 'y' : `${b}y`);
  // 左ページの例（$\sin(4x-y)$、$e^{-2x}\cos y$）、教科書の例（$e^{-x}\sin y$・$e^{-2x}\sin y$・$e^{2x}\sin y$・$e^{3x}\cos y$、$\sin(2x+3y)$・$\sin(3x+y)$）
  const used12 = r => r.used12 || (r.used12 = new Set());   // s1 に出した式（わなに同じ関数を出さない。R1-8）
  const BAN12 = new Set(['e:-2,1,cos', 'e:-1,1,sin', 'e:-2,1,sin', 'e:2,1,sin', 'e:3,1,cos', 'l:4,-1,sin', 'l:2,3,sin', 'l:3,1,sin']);
  add({
    id: '8-12', part: 1, chap: '8-2⑦ 例題4', stars: 1,
    title: '$e$・$\\sin$・合成関数の偏微分：止めた文字だけの因数は数、中身の偏微分をかける',
    mark: '$e^{ax}\\sin y$、$\\sin(ax+by)$ の形の $\\dfrac{\\partial f}{\\partial x}$・$\\dfrac{\\partial f}{\\partial y}$。',
    futsu: ['積の微分（5-6）を使って、', '止めた文字だけの因数も微分し、', 'それが0になることを1つずつ', '確かめながら計算する。'],
    raku: ['$\\sin(4x-y)$ → $x$ で $4\\cos(4x-y)$、', '$y$ で $-\\cos(4x-y)$', '$e^{-2x}\\cos y$ → $x$ で $-2e^{-2x}\\cos y$、', '$y$ で $-e^{-2x}\\sin y$'],
    why: '止めた文字だけの式（$\\cos y$ や $e^{-2x}$）は、ただの数なので、外に出したまま（積の微分はいらない）。$\\sin(4x-y)$ は中身 $4x-y$ が両方の文字で変わるので、合成関数の微分（5-6）で、外側の微分 $\\cos(4x-y)$ に中身の偏微分（$x$ なら4、$y$ なら $-1$）をかける（8-2⑦）。',
    caution: '中身の偏微分をかけ忘れない（$\\dfrac{\\partial}{\\partial x}\\sin(2x+3y)=\\cos(2x+3y)$ はまちがい）。$(\\cos y)\'=-\\sin y$ のマイナス、$(e^{ax})\'=ae^{ax}$ の $a$ に気をつける。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '28mm', s3: '30mm', trap: '20mm' },
    fits(q) {
      if (/点|nabla|∇|\\partial\^2|変わる|z/.test(q)) return false;
      return /\\partial/.test(q) && /\\(sin|cos)|e\^/.test(q);
    },
    steps: {
      // $e^{ax}$ と $\sin by$（$\cos by$）の積
      s1(r) {
        const a = r.intNot(-3, 3, v => v === 0), b = r.int(1, 3), fn = r.pick(['sin', 'cos']), g = fn === 'sin' ? 'cos' : 'sin';
        if (BAN12.has(`e:${a},${b},${fn}`)) return null;
        const F = `${eTeX(a)}${trig(fn, by(b))}`, ax = kTeX(a, `${eTeX(a)}${trig(fn, by(b))}`), ay = kTeX(fn === 'sin' ? b : -b, `${eTeX(a)}${trig(g, by(b))}`);
        used12(r).add(`e:${a},${b},${fn}`);
        return { q: `$f=${F}$ で、${boxes('f', ['x', 'y'])}`, a: `$${ax}$、$${ay}$`, key: `e:${a},${b},${fn}`,
          easy: `$x$ で：$${trig(fn, by(b))}$ は数。$y$ で：$${eTeX(a)}$ は数`, easyCheck: false, calc: calcPd(F, ['x', 'y'], [ax, ay]) };
      },
      // $\sin(ax+by)$・$\cos(ax+by)$・$e^{ax+by}$（中身の偏微分をかける）
      s2(r) {
        const a = r.intNot(-4, 4, v => v === 0), b = r.intNot(-4, 4, v => v === 0), fn = r.pick(['sin', 'cos', 'e']), I = lin2(a, b);
        if (BAN12.has(`l:${a},${b},${fn}`) || (a === 1 && b === 5)) return null;
        let F, ax, ay;
        if (fn === 'e') { F = `e^{${I}}`; ax = kTeX(a, F); ay = kTeX(b, F); }
        else { F = trig(fn, I, true); const G = trig(fn === 'sin' ? 'cos' : 'sin', I, true), s = fn === 'sin' ? 1 : -1; ax = kTeX(s * a, G); ay = kTeX(s * b, G); }
        return { q: `$f=${F}$ で、${boxes('f', ['x', 'y'])}`, a: `$${ax}$、$${ay}$`, key: `l:${a},${b},${fn}`,
          easy: `中身 $${I}$ の偏微分は、$x$ で $${a}$、$y$ で $${b}$。外側を微分してかける`, easyCheck: false, calc: calcPd(F, ['x', 'y'], [ax, ay]) };
      },
      // ロープの波 $y=A\sin(kx-\omega t)$、中身に $xy$ のある式
      s3(r) {
        if (turn(r, '12s3', 2) === 0) {
          const A = r.pick([0.1, 0.2, 0.3, 0.5]), k = r.int(1, 3), w = r.int(2, 5);
          if (A === 0.2 && k === 1 && w === 2) return null;   // 教科書の波
          const I = `${k === 1 ? '' : k}x-${w}t`, F = `${fmt(A)}\\sin(${I})`, ax = kTeX(+fmt(A * k), `\\cos(${I})`), at = kTeX(+fmt(-A * w), `\\cos(${I})`);   // 係数の1は書かない（Z-7）
          return { q: `ロープの波 $y(x,\\ t)=${F}$ で、$${dfr('y', 'x')}=$ □、$${dfr('y', 't')}=$ □`, a: `$${ax}$、$${at}$`, key: `w${A},${k},${w}`,
            easy: `$x$ で：$t$ は数、中身の偏微分は ${k}。$t$ で：$x$ は数、中身の偏微分は $-${w}$`, easyCheck: false,
            calc: calcPd(F, ['x', 't'], [ax, at]) };
        }
        const c = r.int(1, 3), kind = r.int(0, 2), u = c === 1 ? 'xy' : `${c}xy`;
        const F = kind === 0 ? `e^{${u}}` : kind === 1 ? `\\sin(${u})` : `\\cos(${u})`;
        const out = kind === 0 ? F : kind === 1 ? `\\cos(${u})` : `\\sin(${u})`, s = kind === 2 ? -1 : 1;
        const ax = kTeX(s * c, `y${out}`).replace(/^(-?)y/, '$1y'), ay = kTeX(s * c, `x${out}`);
        return { q: `$f=${F}$ で、${boxes('f', ['x', 'y'])}`, a: `$${ax}$、$${ay}$`, key: `xy${c},${kind}`,
          easy: `中身 $${u}$ を $x$ で偏微分すると $${c === 1 ? '' : c}y$、$y$ で偏微分すると $${c === 1 ? '' : c}x$`, easyCheck: false, calc: calcPd(F, ['x', 'y'], [ax, ay]) };
      },
      // わな：ラプラシアン（2回ずつ偏微分してたす。8-81）。「みたす・みたさない」を交互に
      trap(r) {
        const o = r.t12 || (r.t12 = { n: r.int(0, 1) }), yes = o.n % 2 === 0, b = r.int(1, 3), a = yes ? r.pick([b, -b]) : r.intNot(-3, 3, v => v === 0 || Math.abs(v) === b), fn = r.pick(['sin', 'cos']);
        const F = `${eTeX(a)}${trig(fn, by(b))}`;
        if (BAN12.has(`e:${a},${b},${fn}`) || used12(r).has(`e:${a},${b},${fn}`)) return null;   // 左ページ・教科書の例の式、s1 の式はよける
        o.n++;   // 「みたす・みたさない」を交互に（出した問題だけ進める）
        return dest({ q: `$f=${F}$ は、$\\nabla^2f=0$ をみたすか`, a: yes ? 'みたす' : 'みたさない', key: `t${F}`,
          verify: p => { const L = (x, y) => { const h = 1e-3, f = (u, v) => ev(F, { x: u, y: v }); return (f(x + h, y) - 2 * f(x, y) + f(x - h, y) + f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h); }; const z = Math.abs(L(0.3, 0.7)) < 1e-3 && Math.abs(L(-0.4, 1.1)) < 1e-3; return p.a === (z ? 'みたす' : 'みたさない') || `答え ${p.a}`; } },
        '8-12', `1回の偏微分ではなく、2回ずつ偏微分してたす。$${dfr('f', 'x', 2).replace('x}', 'x^2}')}+${dfr('f', 'y', 2).replace('y}', 'y^2}')}=(${a * a}-${b * b})${F}$`, ['8-81']);
      },
    },
  });

  // ================================================================ 8-13
  // 3つの文字の単項式・多項式。左ページの例（$x^2yz^3$）と教科書の例（$xy^2z^3$、$x^2yz+z^2$）、例と同じ答え（4・1・6）はよける
  const V3 = ['x', 'y', 'z'];
  const BAN13 = new Set(['x^2yz^3', 'xy^2z^3', 'x^2yz+z^2']);
  const at3 = (P, i, X) => dPoly(P, i).reduce((s, t) => s + t.c * t.e.reduce((u, k, j) => u * X[j] ** k, 1), 0);
  add({
    id: '8-13', part: 1, chap: '8-2⑨ 例題5', stars: 1,
    title: '3つの変数の偏微分：2つを止めて残りで微分し、点を入れる',
    mark: '$f(x,\\ y,\\ z)$ の「3つの偏微分」「点 □ での値」。',
    futsu: ['点のまわりで、$x$・$y$・$z$ を1つずつ', '少しだけ動かした値を計算し、', '差÷動かした長さを、長さを', '短くしながら3回見積もる。'],
    raku: ['$f=x^2yz^3$、点 $(1,\\ 2,\\ 1)$', '$\\dfrac{\\partial f}{\\partial x}=2xyz^3=4$', '$\\dfrac{\\partial f}{\\partial y}=x^2z^3=1$', '$\\dfrac{\\partial f}{\\partial z}=3x^2yz^2=6$'],
    why: '3つの変数でも、2つを止めて1つだけを動かす（8-2⑨）。$x$ で偏微分するときは $yz^3$ がまとめて数、$z$ で偏微分するときは $x^2y$ が数。偏導関数を作ってから点を入れれば、3つとも同じ点で計算できる。',
    caution: '偏微分する文字には、微分してから点の値を入れる（先に入れると、ただの数になって0）。止めた2つの文字だけの項は0。答えは $x$・$y$・$z$ の順に3つ。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '12mm', s3: '14mm', trap: '24mm' },
    fits(q) {
      if (/\\partial\^2|nabla|∇|向き|変わる|変化|ふえ|単位|上がる|もぐる|Pa/.test(q)) return false;
      return /z/.test(q) && /\\partial/.test(q);
    },
    steps: {
      // 単項式（3つの文字）の、点での3つの偏微分
      s1(r) {
        const P = [{ c: r.pick([1, 1, 2, 3, -1, -2]), e: [r.int(1, 3), r.int(1, 3), r.int(1, 3)] }], F = polyTeX(P, V3);
        const X = [r.pick([1, -1, 2]), r.pick([1, 2, -1, 3]), r.pick([1, -1, 2])], A = [0, 1, 2].map(i => at3(P, i, X));
        if (BAN13.has(F) || A.join() === '4,1,6' || ['111', '213', '123'].includes(P[0].e.join(''))) return null;   // 例の式の何倍か（$3x^2yz^3$ など）もよける
        return { q: `$f=${F}$ の、点 $${pt(...X)}$ での ${boxes('f', V3)}`, a: A.map(v => `$${v}$`).join('、'), key: `${keyPoly(P)}@${X}`,
          easy: V3.map((v, i) => `$${polyTeX(dPoly(P, i), V3)}$`).join('、') + ` に点を入れる`, easyCheck: false,
          calc: calcPd(F, V3, A.map(String), X) };
      },
      // 2つの項（片方は2つの文字だけ）
      s2(r) {
        const e1 = [r.int(1, 2), r.int(1, 2), r.int(1, 2)], i0 = r.int(0, 2), e2 = [0, 0, 0]; e2[i0] = r.int(1, 2); e2[(i0 + 1) % 3] = r.int(0, 2);
        const P = [{ c: r.pick([1, 2, 3, -1]), e: e1 }, { c: r.intNot(-4, 4, v => v === 0), e: e2 }], F = polyTeX(P, V3);
        const X = [r.pick([1, -1, 2]), r.pick([1, 2, -2]), r.pick([1, 2, -1])], A = [0, 1, 2].map(i => at3(P, i, X));
        if (BAN13.has(F) || A.join() === '4,1,6' || e1.join('') === e2.join('')) return null;
        return { q: `$f=${F}$ の、点 $${pt(...X)}$ での ${boxes('f', V3)}`, a: A.map(v => `$${v}$`).join('、'), key: `${keyPoly(P)}@${X}`,
          easy: V3.map((v, i) => `$${polyTeX(dPoly(P, i), V3)}$`).join('、') + ` に点を入れる`, easyCheck: false,
          calc: calcPd(F, V3, A.map(String), X) };
      },
      // 部屋の温度（1次式）、箱の体積・表面積
      s3(r) {
        if (turn(r, '13s3', 2) === 0) {
          const a = r.int(18, 25), b = r.pick([0, 0.5, 1, 1.5]), c = r.pick([0, 0.2, 0.4]), d = r.pick([0.5, 1, 1.5, 2]);
          if (b === 0.5 && c === 0 && d === 1.5) return null;   // 教科書の部屋
          const T = `${a}${b ? '-' + cf(b) + 'x' : ''}${c ? '+' + cf(c) + 'y' : ''}+${cf(d)}z`;
          const A = [-b, c, d].map(fmt);
          return { q: `部屋の温度 $T(x,\\ y,\\ z)=${T}$〔℃〕で、${boxes('T', V3)}`, a: A.map(v => `$${v}$`).join('、'), key: `T${T}`,
            easy: `1次式なので、その文字の係数。文字のない向きは0`, easyCheck: false, calc: calcPd(T, V3, A) };
        }
        const vol = r.chance(0.5), X = [r.int(2, 6), r.int(2, 6), r.int(2, 6)];
        if (X[0] === X[1] || X[1] === X[2] || X[0] === X[2]) return null;
        const F = vol ? 'xyz' : '2xy+2yz+2zx', A = vol ? [X[1] * X[2], X[0] * X[2], X[0] * X[1]] : [2 * (X[1] + X[2]), 2 * (X[0] + X[2]), 2 * (X[0] + X[1])];
        return { q: `直方体（たて $x$、横 $y$、高さ $z$）の${vol ? '体積 $V=xyz$' : '表面積 $S=2xy+2yz+2zx$'} の、$${pt(...X)}$ での ${boxes(vol ? 'V' : 'S', V3)}`, a: A.map(v => `$${v}$`).join('、'), key: `${F}@${X}`,
          easy: vol ? `$yz$、$xz$、$xy$（その文字に直角な面の面積）に入れる` : `$2y+2z$、$2x+2z$、$2x+2y$ に入れる`, easyCheck: false, calc: calcPd(F, V3, A.map(String), X) };
      },
      // わな：いちばん急に上がる向き（勾配の矢印。8-27）
      trap(r) {
        const a = r.int(1, 3), b = r.int(1, 3), c = r.intNot(-3, 3, v => v === 0), X = [r.int(1, 2), r.int(-2, 2), r.int(1, 3)];
        if (X[1] === 0) return null;
        const T = `${a === 1 ? '' : a}x^2+${b === 1 ? '' : b}y^2${c > 0 ? '+' : '-'}${Math.abs(c) === 1 ? '' : Math.abs(c)}z`, G = [2 * a * X[0], 2 * b * X[1], c];
        return dest({ q: `温度 $T=${T}$ の点 $${pt(...X)}$ で、温度がいちばん急に上がる向き`, a: `$${pt(...G)}$`, key: `t${T}@${X}`,
          calc: { kind: 'pdiff', op: 'grad', f: T, vars: V3, at: X } },
        '8-13', `3つの偏微分の値ではなく、それを並べた矢印（勾配）$\\mathrm{grad}\\,T$`, ['8-27']);
      },
    },
  });

  // ================================================================ 8-14
  // 2回の偏微分。左ページの例（$x^2y^3$）と教科書の例（$x^3y^2$・$x^2y^4$・$x^2y$）、例と同じ答えはよける
  const BAN14 = new Set(['x^2y^3', 'x^3y^2', 'x^2y^4', 'x^2y']), BANA14 = new Set(['2y^3', '6x^2y', '6xy^2']);
  const d2 = (P, i, j) => dPoly(dPoly(P, i), j);
  const D2 = { xx: ['x', 'x'], yy: ['y', 'y'], xy: ['x', 'y'] };
  const dfr2 = (f, k) => (k === 'xx' ? `\\dfrac{\\partial^2${f}}{\\partial x^2}` : k === 'yy' ? `\\dfrac{\\partial^2${f}}{\\partial y^2}` : `\\dfrac{\\partial^2${f}}{\\partial x\\,\\partial y}`);
  add({
    id: '8-14', part: 1, chap: '8-2⑧ 例題6', stars: 1,
    title: '2回の偏微分：1回めの答えをもう一度偏微分する（2乗ではない）。まぜた2つは順番によらない',
    mark: '$\\dfrac{\\partial^2f}{\\partial x^2}$・$\\dfrac{\\partial^2f}{\\partial y^2}$・$\\dfrac{\\partial^2f}{\\partial x\\,\\partial y}$。',
    futsu: ['まぜた2回の偏微分を、', '$x$ が先の順と $y$ が先の順の', '両方で計算して、同じになるかを', 'くらべる。'],
    raku: ['$f=x^2y^3$', '→ $\\dfrac{\\partial^2f}{\\partial x^2}=2y^3$、$\\dfrac{\\partial^2f}{\\partial y^2}=6x^2y$', '→ まぜた2つはどちらも $6xy^2$', '（$(2xy^3)^2$ ではない）'],
    why: '$\\dfrac{\\partial^2f}{\\partial x^2}$ の「2」は、2回偏微分するという印（8-2⑧）。1回めの答え $\\dfrac{\\partial f}{\\partial x}=2xy^3$ を、もう一度 $x$ で偏微分する。ちがう文字で続けて偏微分した2つは、4つの角の値の同じ組み合わせになるので、順番によらず同じ。だから片方だけ計算すればよい。',
    caution: '1回めの答えを2乗しない。2回めも、止めた文字は数（$2xy^3$ を $x$ で偏微分すると $2y^3$）。まぜた2つは、計算しやすい順で1回だけ。',
    counts: { s1: 3, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '24mm', trap: '14mm' },
    boxh: { s1: '9mm', s3: '9mm' },
    fits(q) { return /\\partial\^2/.test(q) && !/nabla|∇|変化|ふえ/.test(q); },
    steps: {
      // 単項式の3つの2回偏微分
      s1(r) {
        const P = [{ c: r.pick([1, 1, 2, 3, -1, -2]), e: [r.int(2, 4), r.int(2, 4)] }], F = polyTeX(P, ['x', 'y']);
        const A = ['xx', 'yy', 'xy'].map(k => polyTeX(d2(P, ...D2[k].map(v => +(v === 'y'))), ['x', 'y']));
        if (BAN14.has(F) || BAN14.has(polyTeX([{ c: 1, e: P[0].e }], ['x', 'y'])) || A.some(a => BANA14.has(a))) return null;   // 例の式の符号ちがい・何倍かもよける
        (r.used14 || (r.used14 = new Set())).add(P[0].e + '');   // s2 に、この式の何倍かをふくむ式を出さない
        return { q: `$f=${F}$ で、${['xx', 'yy', 'xy'].map(k => `$${dfr2('f', k)}=$ □`).join('、')}`, a: A.map(a => `$${a}$`).join('、'), key: `m${P[0].e}`,   // 係数だけちがう式（何倍か）は同じ問題（R1-5）
          easy: `$${dfr('f', 'x')}=${polyTeX(dPoly(P, 0), ['x', 'y'])}$、$${dfr('f', 'y')}=${polyTeX(dPoly(P, 1), ['x', 'y'])}$ をもう一度`, easyCheck: false,
          calc: { kind: 'pdiff', f: F, vars: ['x', 'y'], wrt: [['x', 'x'], ['y', 'y'], ['x', 'y']], ans: A } };
      },
      // 2つ・3つの項で、1つだけを聞く（まぜた2回をふくむ）
      s2(r) {
        const o = r.k14 || (r.k14 = { n: r.int(0, 3) }), k = ['xy', 'xx', 'yy', 'xy'][o.n % 4];   // 聞く偏微分を回す（出した問題だけ進める）
        const P = poly10(r, r.int(1, 2), 1, false).map(t => ({ c: t.c, e: t.e.map(v => (v ? Math.min(v + 1, 3) : 0)) })), F = polyTeX(P, ['x', 'y']);   // 3次まで（検算の差分のずれを小さく）
        const A = polyTeX(d2(P, ...D2[k].map(v => +(v === 'y'))), ['x', 'y']);
        if (BAN14.has(F) || BANA14.has(A) || A === '0' || P.some(t => (r.used14 || new Set()).has(t.e + '')) || new Set(P.map(t => t.e + '')).size < P.length) return null;
        o.n++;
        return { q: `$f=${F}$ で、$${dfr2('f', k)}$`, a: `$${A}$`, key: `${keyPoly(P)}|${k}`,
          easy: k === 'xy' ? `$${dfr('f', 'y')}=${polyTeX(dPoly(P, 1), ['x', 'y'])}$ を $x$ で（順番はどちらでもよい）` : `$${dfr('f', k[0])}=${polyTeX(dPoly(P, k === 'xx' ? 0 : 1), ['x', 'y'])}$ をもう一度 $${k[0]}$ で`, easyCheck: false,
          calc: { kind: 'pdiff', f: F, vars: ['x', 'y'], wrt: D2[k] } };
      },
      // $e^{ax}\sin by$ の2回の偏微分、点での値
      s3(r) {
        if (turn(r, '14s3', 2) === 0) {
          const a = r.intNot(-3, 3, v => v === 0), b = r.int(1, 3), fn = r.pick(['sin', 'cos']), F = `${eTeX(a)}${trig(fn, by(b))}`;
          if (BAN12.has(`e:${a},${b},${fn}`) || (a === 2 && b === 1)) return null;
          const g = fn === 'sin' ? 'cos' : 'sin', A = [kTeX(a * a, F), kTeX(-b * b, F), kTeX((fn === 'sin' ? 1 : -1) * a * b, `${eTeX(a)}${trig(g, by(b))}`)];
          return { q: `$f=${F}$ で、${['xx', 'yy', 'xy'].map(k => `$${dfr2('f', k)}=$ □`).join('、')}`, a: A.map(x => `$${x}$`).join('、'), key: `e:${a},${b},${fn}`,
            easy: `$x$ で2回：$${a}$ が2回かかる。$y$ で2回：$\\${fn}\\to\\${g}\\to-\\${fn}$`, easyCheck: false,
            calc: { kind: 'pdiff', f: F, vars: ['x', 'y'], wrt: [['x', 'x'], ['y', 'y'], ['x', 'y']], ans: A } };
        }
        const P = poly10(r, 2, 0, false).map(t => ({ c: t.c, e: t.e.map(v => Math.min(v + 1, 3)) })), F = polyTeX(P, ['x', 'y']), X = [r.pick([1, -1, 2]), r.pick([1, 2, -1])];
        const D = d2(P, 0, 1), v = D.reduce((s, t) => s + t.c * X[0] ** t.e[0] * X[1] ** t.e[1], 0);
        if (new Set(P.map(t => t.e + '')).size < P.length || v === 0) return null;
        return { q: `$f=${F}$ の、点 $${pt(...X)}$ での $${dfr2('f', 'xy')}$`, a: `$${v}$`, key: `${keyPoly(P)}|xy@${X}`,
          easy: `$${dfr2('f', 'xy')}=${polyTeX(D, ['x', 'y'])}$ に点を入れる`, easyCheck: false,
          calc: { kind: 'pdiff', f: F, vars: ['x', 'y'], wrt: ['x', 'y'], at: X } };
      },
      // わな：2つの文字を少し動かしたときの変化（全微分。8-16）
      trap(r) {
        const m = r.int(1, 3), n = r.int(1, 3), dx = r.pick([0.01, 0.02, -0.01, 0.03]), dy = r.pick([0.01, 0.02, -0.02]), x0 = r.int(1, 2), y0 = r.int(1, 2);
        const F = polyTeX([{ c: 1, e: [m, n] }], ['x', 'y']), fx = m * x0 ** (m - 1) * y0 ** n, fy = n * x0 ** m * y0 ** (n - 1), v = Math.round((fx * dx + fy * dy) * 1e9) / 1e9;
        if (F === 'x^2y^3' || v === 0) return null;
        const mv = (d, s, end) => `${s}が $${fmt(Math.abs(d))}$ ${d > 0 ? 'ふえ' : end ? 'へっ' : 'へり'}${end ? 'た' : ''}`;   // 「$x$ が 0.02 ふえ、$y$ が 0.02 へったとき」（R1-6）
        return dest({ q: `$f=${F}$ で、点 $${pt(x0, y0)}$ から ${mv(dx, '$x$ ')}、${mv(dy, '$y$ ', true)}ときの $f$ の変化を、偏微分を使って見積もろう`, a: `$${fmt(v)}$`, key: `t${F}@${x0},${y0},${dx},${dy}`,
          verify: p => valIs(p, ev(`${m}x^${m - 1}y^${n}`, { x: x0, y: y0 }) * dx + ev(`${n}x^${m}y^${n - 1}`, { x: x0, y: y0 }) * dy, 1e-9) },
        '8-14', `2回の偏微分ではなく、1回の偏微分×動いた量を2つたす（全微分）。$${fx}\\times${par(fmt(dx))}+${fy}\\times${par(fmt(dy))}$`, ['8-16']);
      },
    },
  });

  // ================================================================ 8-15
  // 物理の式。左ページの例（$P=\dfrac{V^2}{R}$ の $V=10$・$R=5$、水に 5 m もぐる）と教科書の例（$V=12$・$R=6$、$K$ の $m=2$・$v=3$、10 m もぐる）はよける
  const ud15 = v => `$${fmt(Math.abs(v))}$${v > 0 ? '℃ 上がる' : '℃ 下がる'}`;
  add({
    id: '8-15', part: 1, chap: '8-2⑨ 例題7', stars: 1,
    title: '物理の式の偏微分：ほかの量を止める。単位は「出てくる量÷動かした量」、変化は「偏微分×変化」',
    mark: '$P=\\dfrac{V^2}{R}$、$K=\\dfrac12mv^2$、$p=p_0-9800z$ などの物理の式。「単位」「□ m もぐる」。',
    futsu: ['ほかの量を止めた表を作り、', '動かす量を少しずつ変えて', '出てくる量の差を計算し、', '「差÷変化」を見積もる。'],
    raku: ['$P=\\dfrac{V^2}{R}$、$V=10$、$R=5$', '$\\dfrac{\\partial P}{\\partial V}=\\dfrac{2V}{R}=4\\,\\mathrm{W/V}$', '$\\dfrac{\\partial P}{\\partial R}=-\\dfrac{V^2}{R^2}=-4\\,\\mathrm{W/\\Omega}$', '5 m もぐる：$-9800\\times(-5)=49000\\,\\mathrm{Pa}$'],
    why: '物理の式も、文字が量の名前になっただけ。$V$ で偏微分するときは $R$ を止め、$R$ で偏微分するときは $V$ を止める（$\\dfrac{V^2}{R}=V^2\\times R^{-1}$ と見る。8-2⑨）。偏微分の単位は「出てくる量の単位÷動かした量の単位」。$\\dfrac{\\partial p}{\\partial z}$ が一定なら、変化は「偏微分×$z$ の変化」。',
    caution: '$R^{-1}$ を $R$ で微分すると $-R^{-2}$（マイナスがつく）。$z$ は上向きが正なので、もぐるときの $z$ の変化は負。単位は W/V・W/Ω・J/kg・Pa/m のように書く。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '30mm', s3: '26mm', trap: '12mm' },
    fits(q) {
      if (/％|ずれ|nabla|∇|等値面|急に上がる向き/.test(q)) return false;
      return /\$(P|K|p|T|E)=/.test(q) && (/\\partial/.test(q) || /もぐる|上がる|下がる|上へ|動く/.test(q)) || /\\dfrac\{\\partial p\}\{\\partial z\}/.test(q);
    },
    steps: {
      // 電力 $P=\dfrac{V^2}{R}$、運動エネルギー $K=\dfrac12mv^2$ の2つの偏微分と単位
      s1(r) {
        if (turn(r, '15s1', 2) === 0) {
          const V = r.pick([2, 3, 4, 6, 8, 9, 12, 15, 20]), R = r.pick([2, 3, 4, 5, 8, 10]), a1 = 2 * V / R, a2 = -V * V / (R * R);
          if (V === 2 * R || (V === 12 && R === 6) || ![a1, a2].every(v => Number.isInteger(Math.round(v * 1e6) / 1e6 * 100))) return null;
          return { q: `電力 $P=\\dfrac{V^2}{R}$〔W〕で、$V=${V}$〔V〕、$R=${R}$〔Ω〕のときの ${boxes('P', ['V', 'R'])}（単位も）`, a: `$${fmt(a1)}\\,\\mathrm{W/V}$、$${fmt(a2)}\\,\\mathrm{W/\\Omega}$`, key: `P${V},${R}`,
            easy: `$\\dfrac{2V}{R}=\\dfrac{${2 * V}}{${R}}$、$-\\dfrac{V^2}{R^2}=-\\dfrac{${V * V}}{${R * R}}$`, easyCheck: false,
            calc: { kind: 'pdiff', f: '\\frac{V^2}{R}', vars: ['V', 'R'], wrt: [['V'], ['R']], at: [V, R], ans: [fmt(a1), fmt(a2)] } };
        }
        const m = r.pick([1, 2, 3, 4, 5, 0.5]), v = r.pick([1, 2, 3, 4, 5, 6, 10]), a1 = v * v / 2, a2 = m * v;
        if (m === 2 && v === 3) return null;
        return { q: `運動エネルギー $K=\\dfrac12mv^2$〔J〕で、$m=${fmt(m)}$〔kg〕、$v=${v}$〔m/s〕のときの ${boxes('K', ['m', 'v'])}（単位も）`, a: `$${fmt(a1)}\\,\\mathrm{J/kg}$、$${fmt(a2)}\\,\\mathrm{J/(m/s)}$`, key: `K${m},${v}`,
          easy: `$\\dfrac12v^2=\\dfrac12\\times${v}^2$、$mv=${fmt(m)}\\times${v}$`, easyCheck: false,
          calc: { kind: 'pdiff', f: '\\frac12mv^2', vars: ['m', 'v'], wrt: [['m'], ['v']], at: [m, v], ans: [fmt(a1), fmt(a2)] } };
      },
      // 変化＝偏微分×変化（水の中の圧力、部屋の温度）。上がる・下がるを交互に
      s2(r) {
        const o = r.ud15 || (r.ud15 = { n: r.int(0, 1) }), up = o.n % 2 === 0;
        const kk = r.k15 || (r.k15 = { n: r.int(0, 1) });
        if (kk.n % 2 === 0) {
          const used = r.used15 || (r.used15 = new Set()), d = r.pick([2, 3, 4, 6, 8, 12, 15, 20].filter(v => !used.has(v) || used.size >= 8)), dz = up ? -d : d, dp = -9800 * dz;   // もぐる（$z$ がへる）と圧力は上がる
          used.add(d); o.n++; kk.n++;
          return { q: `水の中の圧力 $p=p_0-9800z$〔Pa〕（$z$ は上向き〔m〕）で、${up ? `$${d}\\,\\mathrm{m}$ もぐる` : `$${d}\\,\\mathrm{m}$ 上へ動く`}と、圧力はどれだけ変わるか`,
            a: `$${Math.abs(dp)}\\,\\mathrm{Pa}$ ${dp > 0 ? '上がる' : '下がる'}`, key: `p${d}`,
            easy: `$\\dfrac{\\partial p}{\\partial z}=-9800$、$z$ の変化 $${dz}$。$-9800\\times${par(dz)}=${dp}$`, easyCheck: false,
            verify: p => { const w = ev('-9800z', { z: dz }) - ev('-9800z', { z: 0 }); return p.a === `$${Math.abs(w)}\\,\\mathrm{Pa}$ ${w > 0 ? '上がる' : '下がる'}` || `答え ${p.a}`; } };
        }
        const a = r.int(18, 24), b = r.pick([0.5, 1, 1.5, 2]), c = r.pick([0.5, 1, 1.5, 2]), byZ = r.chance(0.5), d = r.pick([1, 2, 3, 4]);
        const dT = byZ ? c * d : -b * d;
        if ((dT > 0) !== up || (b === 0.5 && c === 1.5)) return null;
        o.n++; kk.n++;
        return { q: `部屋の温度 $T=${a}-${cf(b)}x+${cf(c)}z$〔℃〕（$x$ はストーブからの距離、$z$ は高さ〔m〕）で、${byZ ? `$x$ はそのままで、$${d}\\,\\mathrm{m}$ 高い所へ動くと` : `$z$ はそのままで、ストーブから、さらに $${d}\\,\\mathrm{m}$ はなれると`}、温度はどれだけ変わるか`,
          a: ud15(dT), key: `T${a},${b},${c}|${byZ}${d}`,
          easy: `$\\dfrac{\\partial T}{\\partial ${byZ ? 'z' : 'x'}}=${byZ ? fmt(c) : fmt(-b)}$、変化 $${d}$ をかけて $${fmt(dT)}$`, easyCheck: false,
          verify: p => p.a === ud15(ev(`${a}-${b}x+${c}z`, byZ ? { x: 0, z: d } : { x: d, z: 0 }) - a) || `答え ${p.a}` };
      },
      // 海水の圧力（値を文に）、位置エネルギー $E=mgh$
      s3(r) {
        if (turn(r, '15s3', 2) === 0) {
          const d = r.pick([2, 3, 4, 20, 30, 50, 100]), dp = 10094 * d;   // 左ページ（5 m）・教科書（10 m）のもぐる深さはよける
          return { q: `海水の中では $\\dfrac{\\partial p}{\\partial z}=-10094$（Pa/m、$z$ は上向き）。$${d}\\,\\mathrm{m}$ もぐると、圧力は何 Pa 上がるか`, a: `$${dp}$`, key: `sea${d}`,
            easy: `$z$ の変化は $${-d}$。$-10094\\times${par(-d)}=${dp}$`, easyCheck: false, verify: p => valIs(p, -10094 * -d) };
        }
        const m = r.pick([2, 5, 10, 20, 50]), h = r.pick([2, 3, 5, 10, 20]), a1 = 9.8 * h, a2 = 9.8 * m;
        return { q: `高さ $h$〔m〕にある質量 $m$〔kg〕の物の位置エネルギー $E=mgh$〔J〕（$g=9.8$）で、$m=${m}$、$h=${h}$ のときの ${boxes('E', ['m', 'h'])}（単位も）`,
          a: `$${fmt(a1)}\\,\\mathrm{J/kg}$、$${fmt(a2)}\\,\\mathrm{J/m}$`, key: `E${m},${h}`,
          easy: `$m$ で：$gh=9.8\\times${h}$。$h$ で：$mg=${m}\\times9.8$`, easyCheck: false,
          calc: { kind: 'pdiff', f: '9.8mh', vars: ['m', 'h'], wrt: [['m'], ['h']], at: [m, h], ans: [fmt(a1), fmt(a2)] } };
      },
      // わな：誤差の割合（％。8-18）
      trap(r) {
        const a = r.int(1, 3), b = r.intNot(1, 3, v => v === a), e = 2 * a + b;
        return dest({ q: `電力 $P=\\dfrac{V^2}{R}$ で、$V$ に $\\pm${a}$％、$R$ に $\\pm${b}$％ のずれがある。$P$ のいちばん大きいずれは何％か`, a: `$${e}$％`, key: `t${a},${b}`,
          verify: p => { let w = 0; for (const s of [-1, 1]) for (const t of [-1, 1]) w = Math.max(w, Math.abs((1 + s * a / 100) ** 2 / (1 + t * b / 100) - 1) * 100); return (Math.abs(nums(p.a)[0] - w) < 0.2 * e) || `答え ${p.a}（${w}）`; } },
        '8-15', `1つの偏微分の値ではなく、ずれの割合。べきの数をかけて大きさをたす $2\\times${a}+${b}=${e}$`, ['8-18']);
      },
    },
  });

})(globalThis.MONDAI);
