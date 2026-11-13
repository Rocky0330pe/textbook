/* 問題集 第6巻　第3部 ばね・振り子・減衰振動（わざ 6-31〜6-45）　組 c
 * 書き方は v6/README.md（第6・7巻の手引き）、v5/README.md、v4/README.md。文は教科書 第6巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 電卓は使わない（P-4）：$\sqrt{\phantom{2}}$・$\ln$・$e$ の値は、使う値を問題の文に書く。1問に書く値は2つまで。答えを先に決めて逆に作る。
 * 近似値は第39回 P-3 の値：$\pi=3.14$、$2\pi=6.28$、$4\pi^2=39.48$、$\ln2=0.693$、$\ln3=1.099$、$\ln4=1.386$、$\ln10=2.30$、$g=9.8\,\mathrm{m/s^2}$。
 *   文に書いた値で計算した答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4。apx がけたを選ぶ）。近似の答えは「約」と ≈。
 * 単位の中の μ・Ω は立てた字（P-14：$\mathrm{\mu F}$）。数と単位は $0.5\,\mathrm{kg}$ の形（O-7）。負になりうる量は「速度」（O-3）。
 * 答えの確かめ：微分方程式の解（6-36 の $x=X\cos(\omega t+\phi)$）は calc ode。そのほかは verify(p) で、作った道すじとは別の式で計算し直す。
 * わなは、そのわざ自身で解けない問題にして、答えにかならず行き先（わざの番号か「わざなし」）を書く（N-3。dest）。わなは2種類にし、key を種類ごとに1つにする。
 * 同じ見開きで、入れかえただけの問題・逆の問題は key でよける（N-2・O-2）。s3 の key は s1・s2 と同じ形。左ページの「楽な形」の例の数は問題に出さない（O-2）。
 * 図は 6-36（点と円）と 6-40（減衰振動のグラフ）のステップ3だけ（K-2・P-2）。図の数は問題の数から計算する。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(8));                       // 0.30000000004 → 0.3
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const numOf = t => M.evalMath(strip(t), {});
  const close = (x, y, tol) => x != null && y != null && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const isDec = (v, k) => Math.abs(v * 10 ** k - Math.round(v * 10 ** k)) < 1e-7;   // 小数第 k 位までで書ける
  const decs = v => (fmt(v).split('.')[1] || '').length;
  // 四捨五入（小数第 k 位まで）
  const rd = (v, k) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-7) / 10 ** k).toFixed(k);
  // 文に書いた値で出した答え vG と、ほんとうの値 vT。
  //   vG が小数第 kmax 位までで書けて、vT を同じけたで丸めても同じなら、そのまま（note なし）。
  //   そうでなければ、丸めて同じになるいちばん細かいけた（第 kmax 位〜整数）で答え、note に「、小数第□位まで」「、整数で」。どのけたでも合わなければ null（その数は出さない。O-4）
  function apx(vG, vT, kmax, keep) {
    if (keep) {   // 文に書いた値（2.30 など）のけたを落とさない：第 kmax 位から、丸めて合うけたをさがす（O-4・第5巻 R2-7）
      for (let k = kmax; k >= 0; k--) if (rd(vG, k) === rd(vT, k)) { const ex = decs(vG) <= k; return { ans: rd(vG, k), note: ex ? '' : (k ? `、小数第${k}位まで` : '、整数で'), exact: ex }; }
      return null;
    }
    const d = decs(vG);
    if (d <= kmax && rd(vT, d) === rd(vG, d)) return { ans: rd(vG, d), note: '', exact: true };
    for (let k = Math.min(kmax, d); k >= 0; k--) if (rd(vG, k) === rd(vT, k)) return { ans: rd(vG, k), note: k ? `、小数第${k}位まで` : '、整数で', exact: false };
    return null;
  }
  // 楽な形の終わり：丸めたなら「=与えた値での数≈答え」、そのままなら「=答え」
  const tail = (g, vG) => (g.exact ? `=${g.ans}` : `=${fmt(vG)}\\approx${g.ans}`);
  // 単位つきの数：U(0.5, 'kg') → $0.5\,\mathrm{kg}$
  const U = (v, u) => `$${typeof v === 'number' ? fmt(v) : v}\\,\\mathrm{${u}}$`;
  const MU = '\\mu ';
  // 分数の倍（4 → 4倍、0.25 → 1/4 倍）
  const times = n => (n >= 1 ? `${fmt(n)}倍` : `$\\frac{1}{${fmt(1 / n)}}$ 倍`);
  const ask = q => { const ss = String(q).split('。').filter(s => s.trim()); return ss[ss.length - 1] || ''; };   // 聞いている文（最後の文）
  const isSq = n => { const r = Math.round(Math.sqrt(n)); return Math.abs(r * r - n) < 1e-9; };
  const PI = 3.14, PI2 = 6.28, PI4 = 39.48, G = 9.8, LN10 = 2.30;
  const piT = '$\\pi=3.14$', gT = '$g=9.8\\,\\mathrm{m/s^2}$', p4T = '$4\\pi^2=39.48$';

  // ---------------------------------------------------------------- 検算の部品
  const valIs = (ans, v, tol) => (close(numOf(ans), v, tol) || `答え ${ans} の値が ${v} でない`);
  // 近似の答え：文に書いた値で計算し直した vG を答えのけたで丸めると答えになり、ほんとうの値 vT を丸めても答えになるか（O-4）
  function apxIs(ans, vG, vT) {
    const t = strip(ans), d = (t.split('.')[1] || '').length;
    if (rd(vG, d) !== t) return `答え ${t} が、文の値で計算した ${vG} を丸めた数でない`;
    if (rd(vT, d) !== t) return `答え ${t} が、ほんとうの値 ${vT} を丸めた数でない`;
    return true;
  }

  // ---------------------------------------------------------------- わなの行き先（第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：行き先のわざ（ほかの部のわざは fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(6).filter(id => {
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

  // ---------------------------------------------------------------- 共通の数の組
  // ばねとおもり：質量 m と ω（k=mω^2 が小数第1位までの数）
  const SPRING = (() => {
    const out = [];
    for (const m of [0.1, 0.2, 0.25, 0.4, 0.5, 0.8, 1, 2, 4, 5, 10]) for (const w of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30]) {
      const k = m * w * w;
      if (isDec(k, 1) && k <= 4000 && k >= 2) out.push({ m, w, k: +fmt(k) });
    }
    return out;
  })();
  // 振り子・つるしたばね：長さ L=9.8 s^2（√(L/g)=s）
  const lenOf = s => +fmt(9.8 * s * s);

  // ================================================================ 6-31
  M.add({
    id: '6-31', part: 3, chap: '6-6①③・例題1', stars: 1,
    title: '$\\omega_{\\mathrm n}=\\sqrt{\\frac{k}{m}}$、周期 $T=\\frac{2\\pi}{\\omega_{\\mathrm n}}$、振動数 $f=\\frac{1}{T}$（質量 $n$ 倍で周期は $\\sqrt{n}$ 倍）',
    mark: '質量とばね定数（ばねにつないだおもり・台車）と、「固有角振動数」「周期」「振動数」「質量を□倍にすると」。',
    futsu: ['$x=X\\cos\\omega t$ を $m\\ddot x=-kx$ に入れて $\\omega$ を決め、', '1往復の時間を、そのつど考える。'],
    raku: ['$0.5\\,\\mathrm{kg}$・$8\\,\\mathrm{N/m}$ → $\\omega_{\\mathrm n}=\\sqrt{16}=4\\,\\mathrm{rad/s}$', '$T=\\frac{6.28}{4}=1.57$ 秒、$f=\\frac{1}{1.57}\\approx0.64\\,\\mathrm{Hz}$', '$2\\,\\mathrm{kg}$（4倍）→ 周期は $\\sqrt{4}=2$ 倍の $3.14$ 秒'],
    why: '$m\\ddot x=-kx$ は $\\ddot x=-\\frac{k}{m}x$。2回微分して $-\\omega^2$ 倍になるのは $\\cos\\omega t$・$\\sin\\omega t$ なので、$\\omega^2=\\frac{k}{m}$（6-6①）。1往復は角が $2\\pi$ 進む時間なので $T=\\frac{2\\pi}{\\omega_{\\mathrm n}}$、振動数はその逆数。$T=2\\pi\\sqrt{\\frac{m}{k}}$ なので、質量が $n$ 倍なら周期は $\\sqrt{n}$ 倍（6-6③）。',
    caution: '$\\omega_{\\mathrm n}=\\frac{k}{m}$ としない（$\\sqrt{\\phantom{k}}$ をとる）。周期は $\\frac{1}{\\omega_{\\mathrm n}}$ ではなく $\\frac{2\\pi}{\\omega_{\\mathrm n}}$。周期は、ゆれの大きさ（振幅）によらない。質量が g なら kg に直す。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (!/ばね/.test(q) || /のび|ダンパー|減衰|振り子|コイル|コンデンサー|山|x_0|はじめの位置/.test(q)) return false;
      if (/つる/.test(q) && !(/\\mathrm\{k?g\}/.test(q) && /N\/m/.test(q))) return false;   // つるしたばねでも、質量とばね定数があれば使える
      const a = ask(q);
      return /周期は約?\s*□|固有角振動数|振動数は約?\s*□|□\s*回往復|周期は\s*□\s*倍/.test(a);
    },
    steps: {
      // ω・周期・振動数（質量と ばね定数から）
      s1(r) {
        const sp = r.pick(SPRING), { m, w, k } = sp, kind = r.int(0, 2);
        if (w === 4 || (m === 2 && k === 8)) return null;   // 楽な形の例（ω=4、2 kg・8 N/m）は出さない（O-2）
        const head = `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつないだ。`;
        if (kind === 0) return { q: head + '固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$', a: `$${w}$`, easy: `$\\sqrt{\\frac{${k}}{${m}}}=\\sqrt{${w * w}}=${w}$`, key: `w${w}` };
        if (kind === 1) {
          if (w === 2) return null;   // 周期 3.14 秒は楽な形の例の答え
          const g = apx(PI2 / w, 2 * Math.PI / w, 2); if (!g) return null;
          return { q: head + `周期は約 □ 秒（${piT}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `w${w}`,
            easy: `$\\omega_{\\mathrm n}=\\sqrt{${w * w}}=${w}$、$T=\\frac{6.28}{${w}}${tail(g, PI2 / w)}$`,
            verify: p => apxIs(p.a, 2 * PI * Math.sqrt(m / k), 2 * Math.PI * Math.sqrt(m / k)) };
        }
        const g = apx(w / PI2, w / (2 * Math.PI), 2); if (!g) return null;
        return { q: head + `振動数は約 □ Hz（${piT}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `w${w}`,
          easy: `$\\omega_{\\mathrm n}=${w}$、$f=\\frac{${w}}{6.28}${tail(g, w / PI2)}$`,
          verify: p => apxIs(p.a, 1 / (2 * PI * Math.sqrt(m / k)), Math.sqrt(k / m) / (2 * Math.PI)) };
      },
      // 質量・ばね定数を n 倍にしたときの周期
      s2(r) {
        const kind = r.int(0, 2), n = r.pick([4, 9, 16, 0.25, 1 / 9]), f = Math.sqrt(n);
        if (kind === 2) return { q: `ばねにつないだおもりの質量を ${times(n)}にすると、周期は □ 倍`, a: `$${f >= 1 ? fmt(f) : `\\frac{1}{${fmt(1 / f)}}`}$`, easy: `$\\sqrt{${n >= 1 ? fmt(n) : `\\frac{1}{${fmt(1 / n)}}`}}=${f >= 1 ? fmt(f) : `\\frac{1}{${fmt(1 / f)}}`}$`, key: `n${fmt(n)}` };
        const T0 = r.pick([0.3, 0.5, 0.6, 0.8, 1.2, 1.5, 2, 2.4, 0.4, 0.9]);
        const T = kind === 0 ? T0 * f : T0 / f;
        if (!isDec(T, 2) || Math.abs(T0 - 1.57) < 1e-9) return null;
        const what = kind === 0 ? `おもりの質量を ${times(n)}にする` : `ばねを、ばね定数が ${times(n)}のばねに取りかえる`;
        return { q: `ばねにつないだおもりの周期は ${fmt(T0)} 秒だった。${what}と、周期は □ 秒`, a: `$${fmt(T)}$`, key: `t${fmt(T0)},${fmt(n)},${kind}`,
          easy: kind === 0 ? `質量 ${times(n)} → 周期は ${times(f)} → $${fmt(T)}$` : `ばね定数 ${times(n)} → 周期は ${times(1 / f)} → $${fmt(T)}$`,
          easyCheck: false, verify: p => valIs(p.a, T0 * Math.sqrt(kind === 0 ? n : 1 / n)) };
      },
      // 見かけがちがう：質量が g、運動方程式の形、1秒に何回往復
      s3(r) {
        const sp = r.pick(SPRING), { m, w, k } = sp, kind = r.int(0, 2);
        if (w === 4 || (m === 2 && k === 8)) return null;
        if (kind === 0) {
          if (m >= 1) return null;
          return { q: `質量 ${U(m * 1000, 'g')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつないだ。固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${w}$`, key: `w${w}`,
            easy: `$${fmt(m * 1000)}\\,\\mathrm{g}=${m}\\,\\mathrm{kg}$、$\\sqrt{\\frac{${k}}{${m}}}=\\sqrt{${w * w}}=${w}$`, easyCheck: 'last' };
        }
        if (kind === 1) {
          if (w === 2) return null;
          const g = apx(PI2 / w, 2 * Math.PI / w, 2); if (!g) return null;
          return { q: `ばねにつないだ台車の運動方程式が $${m}\\ddot x=-${k}x$ になった。台車のゆれの周期は約 □ 秒（${piT}${g.note}）`, a: `$${g.ans}$`, key: `w${w}`, easyCheck: false,
            easy: `$\\ddot x=-${w * w}x$ → $\\omega_{\\mathrm n}=${w}$、$T=\\frac{6.28}{${w}}${tail(g, PI2 / w)}$`,
            verify: p => apxIs(p.a, 2 * PI / Math.sqrt(k / m), 2 * Math.PI / Math.sqrt(k / m)) };
        }
        const g = apx(w / PI2, w / (2 * Math.PI), 2); if (!g) return null;
        return { q: `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつないでゆらす。1秒に約 □ 回往復する（${piT}${g.note}）`, a: `$${g.ans}$`, key: `w${w}`, easyCheck: false,
          easy: `1秒に往復する回数は振動数 $f=\\frac{${w}}{6.28}${tail(g, w / PI2)}$`,
          verify: p => apxIs(p.a, 1 / (2 * PI * Math.sqrt(m / k)), Math.sqrt(k / m) / (2 * Math.PI)) };
      },
      // わな：振り子の周期（6-34）、コイルとコンデンサーの周期（6-35）
      trap(r) {
        if (r.chance(0.5)) {
          const s = r.pick([0.1, 0.2, 0.3, 0.4, 0.6]), L = lenOf(s), g = apx(PI2 * s, 2 * Math.PI * s, 2);
          if (!g) return null;
          return dest({ key: '6-31trapA', q: `長さ ${U(L, 'm')} の振り子の周期は約 □ 秒（${gT}、${piT}${g.note}）`, a: `$${g.ans}$`,
            verify: p => apxIs(p.a, 2 * PI * Math.sqrt(L / G), 2 * Math.PI * Math.sqrt(L / G)) }, '6-31', `ばねではなく振り子。$2\\pi\\sqrt{\\frac{L}{g}}=6.28\\times\\sqrt{${fmt(L / 9.8)}}$`, ['6-34']);
        }
        const [Lm, Cu] = r.pick([[1, 10], [100, 0.1], [100, 10], [10, 100], [1, 0.1]]), w = 1 / Math.sqrt(Lm * Cu * 1e-9);
        return dest({ key: '6-31trapB', q: `$L=${Lm}\\,\\mathrm{mH}$ のコイルと $C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーの回路の、固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${fmt(Math.round(w))}$`,
          verify: p => valIs(p.a, 1 / Math.sqrt(Lm / 1000 * Cu / 1e6)) }, '6-31', `ばねではなく電気のゆれ。$\\frac{1}{\\sqrt{LC}}$ で、$LC=${fmt(Lm * Cu)}\\times10^{-9}$`, ['6-35']);
      },
    },
  });

  // ================================================================ 6-32
  // 宇宙のいすの問題（重い計算。ステップ3だけ。P-4）：k・T から kT^2/39.48 が整数に近い組（ほんとうの 4π^2 でも同じ整数）
  const HEAVY = (() => {
    const out = [];
    for (const k of [2000, 2500, 3000, 4000, 5000]) for (let i = 70; i <= 140; i++) {
      const T = i / 100, mG = k * T * T / PI4, mT = k * T * T / (4 * Math.PI * Math.PI);
      if (Math.abs(mG - Math.round(mG)) < 0.12 && Math.round(mG) === Math.round(mT) && mG >= 45 && mG <= 110 && !(k === 3000 && i === 96)) out.push({ k, T, tot: Math.round(mG) });
    }
    return out;
  })();
  M.add({
    id: '6-32', part: 3, chap: '6-6③・例題2', stars: 1,
    title: '周期から質量：$m=\\frac{kT^2}{4\\pi^2}$（両辺を2乗して $\\sqrt{\\phantom{m}}$ をはずす。周期2倍で質量4倍）',
    mark: 'ばね定数と、はかった周期。「質量を求め」「荷物（人）の質量」。',
    futsu: ['質量を□とおいて $2\\pi\\sqrt{\\frac{m}{k}}$ に入れ、', '周期が合うまで数をためす。'],
    raku: ['$3000\\,\\mathrm{N/m}$・$0.96$ 秒 → $m=\\frac{3000\\times0.9216}{39.48}\\approx70.0$', 'いすの $10\\,\\mathrm{kg}$ をひいて、人は約 $60\\,\\mathrm{kg}$', '台だけ $0.40$ 秒、のせて $0.80$ 秒 → 全体は台の4倍'],
    why: '$T=2\\pi\\sqrt{\\frac{m}{k}}$ の両辺を2乗すると $T^2=4\\pi^2\\times\\frac{m}{k}$。両辺に $\\frac{k}{4\\pi^2}$ をかけて $m=\\frac{kT^2}{4\\pi^2}$（6-6③）。周期は質量の $\\sqrt{\\phantom{m}}$ に比例するので、周期が $n$ 倍なら質量は $n^2$ 倍。体重計の使えない宇宙でも、動かしにくさ（質量）は周期ではかれる。',
    caution: '求めた $m$ は、ゆれている物全体（いす＋人、台＋荷物）の質量。2乗を忘れて $\\frac{kT}{4\\pi^2}$ としない。周期が2倍なら、質量は2倍ではなく4倍。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /ばね/.test(q) && /周期|往復/.test(q) && /質量(は|を|の)約?\s*□/.test(ask(q)) && !/振り子|コイル|ダンパー/.test(q); },
    steps: {
      // k=39.48×c のばねで、周期から質量（4π^2 が消える）
      s1(r) {
        const c = r.pick([10, 20, 25, 50, 100, 200]), T = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2]), k = +fmt(PI4 * c), mG = c * T * T;
        if (mG < 0.2 || mG > 120 || !isDec(mG, 2)) return null;
        const g = apx(mG, k * T * T / (4 * Math.PI * Math.PI), 2); if (!g) return null;
        return { q: `ばね定数 ${U(k, 'N/m')} のばねにおもりをつなぐと、周期は ${fmt(T)} 秒だった。おもりの質量は約 □ kg（${p4T}${g.note}）`, a: `$${g.ans}$`, key: `m${T}`, easyCheck: false,
          easy: `$m=\\frac{${k}\\times${fmt(T)}^{2}}{39.48}=${c}\\times${fmt(T * T)}${tail(g, mG)}$`,
          verify: p => apxIs(p.a, k * T * T / PI4, k * T * T / (4 * Math.PI * Math.PI)) };
      },
      // 周期の比から質量の比（4π^2 はいらない）
      s2(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const n = r.pick([2, 3, 1.5, 0.5, 4]);
          return { q: `ばねにつないだおもりの周期を ${fmt(n)}倍にしたい。おもりの質量を □ 倍にする`, a: `$${fmt(n * n)}$`, easy: `$${fmt(n)}^{2}=${fmt(n * n)}$`, key: `n${n}` };
        }
        const [T1, T2] = r.pick([[0.3, 0.6], [0.2, 0.6], [0.4, 1.2], [0.5, 1], [0.6, 0.9], [0.4, 0.6], [1, 1.5], [0.2, 0.5], [0.3, 0.9], [0.25, 0.5], [0.5, 1.5]]);
        const R = (T2 / T1) ** 2;
        if (kind === 0) return { q: `ばねで支えた台だけをゆらすと周期は ${fmt(T1)} 秒、荷物をのせると ${fmt(T2)} 秒だった。台と荷物を合わせた質量は、台の質量の □ 倍`, a: `$${fmt(R)}$`, key: `r${T1},${T2}`,
          easy: `周期は $\\frac{${fmt(T2)}}{${fmt(T1)}}=${fmt(T2 / T1)}$ 倍 → 質量は $${fmt(T2 / T1)}^{2}=${fmt(R)}$`, easyCheck: 'last' };
        const m0 = r.pick([2, 4, 5, 8, 10, 20]), load = m0 * (R - 1);
        if (!isDec(load, 2)) return null;
        return { q: `ばねで支えた質量 ${U(m0, 'kg')} の台だけをゆらすと周期は ${fmt(T1)} 秒、荷物をのせると ${fmt(T2)} 秒だった。荷物の質量は □ kg`, a: `$${fmt(load)}$`, key: `r${T1},${T2}`,
          easy: `全体は $\\Bigl(\\frac{${fmt(T2)}}{${fmt(T1)}}\\Bigr)^{2}=${fmt(R)}$ 倍の $${fmt(m0 * R)}$、荷物は $${fmt(m0 * R)}-${m0}=${fmt(load)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, m0 * T2 * T2 / (T1 * T1) - m0) };
      },
      // 見かけがちがう：いすと人、10往復の時間、宇宙のいす（重い計算）
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const h = r.pick(HEAVY), m0 = r.pick([8, 10, 12, 15]), per = h.tot - m0;
          const g = apx(h.k * h.T * h.T / PI4 - m0, h.k * h.T * h.T / (4 * Math.PI * Math.PI) - m0, 0); if (!g) return null;
          return { q: `宇宙ステーションで、ばね定数 ${U(h.k, 'N/m')} のばねで支えた質量 ${U(m0, 'kg')} のいすに人が乗ってゆれると、周期は ${fmt(h.T)} 秒だった。人の質量は約 □ kg（${p4T}、整数で）`, a: `$${per}$`, key: `m${h.T}`, easyCheck: false,
            easy: `全体 $\\frac{${h.k}\\times${fmt(h.T * h.T)}}{39.48}\\approx${h.tot}$、人は $${h.tot}-${m0}=${per}$`,
            verify: p => (rd(h.k * h.T * h.T / PI4 - m0, 0) === strip(p.a) && rd(h.k * h.T * h.T / (4 * Math.PI * Math.PI) - m0, 0) === strip(p.a)) || 'ちがう' };
        }
        const c = r.pick([10, 20, 25, 50, 100, 200]), T = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2]), k = +fmt(PI4 * c), mG = c * T * T;
        if (kind === 0) {
          const m0 = r.pick([5, 8, 10, 12, 15]), per = mG - m0;
          if (per < 20 || per > 90 || !isDec(per, 1)) return null;
          const g = apx(per, k * T * T / (4 * Math.PI * Math.PI) - m0, 1); if (!g) return null;
          return { q: `ばね定数 ${U(k, 'N/m')} のばねで支えた質量 ${U(m0, 'kg')} のいすに人が乗ってゆれると、周期は ${fmt(T)} 秒だった。人の質量は約 □ kg（${p4T}${g.note}）`, a: `$${g.ans}$`, key: `m${T}`, easyCheck: false,
            easy: `全体 $\\frac{${k}\\times${fmt(T * T)}}{39.48}=${fmt(mG)}$、人は $${fmt(mG)}-${m0}${tail(g, per)}$`,
            verify: p => apxIs(p.a, k * T * T / PI4 - m0, k * T * T / (4 * Math.PI * Math.PI) - m0) };
        }
        const N = r.pick([10, 20, 5]), tot = +fmt(T * N);
        if (mG < 0.2 || mG > 120 || !isDec(mG, 2)) return null;
        const g = apx(mG, k * T * T / (4 * Math.PI * Math.PI), 2); if (!g) return null;
        return { q: `ばね定数 ${U(k, 'N/m')} のばねにつないだおもりをゆらすと、${N}往復に ${fmt(tot)} 秒かかった。おもりの質量は約 □ kg（${p4T}${g.note}）`, a: `$${g.ans}$`, key: `m${T}`, easyCheck: false,
          easy: `周期は $${fmt(tot)}\\div${N}=${fmt(T)}$ 秒、$m=\\frac{${k}\\times${fmt(T * T)}}{39.48}${tail(g, mG)}$`,
          verify: p => apxIs(p.a, k * (tot / N) ** 2 / PI4, k * (tot / N) ** 2 / (4 * Math.PI * Math.PI)) };
      },
      // わな：振り子の長さ（6-34）、質量とばね定数から周期（6-31）
      trap(r) {
        if (r.chance(0.5)) {
          const T = r.pick([1.5, 3, 0.5, 4, 2.5]), LG = G * T * T / PI4, g = apx(LG, G * T * T / (4 * Math.PI * Math.PI), 2);
          if (!g) return null;
          return dest({ key: '6-32trapA', q: `周期が ${fmt(T)} 秒の振り子の、糸の長さは約 □ m（${gT}、${p4T}${g.note}）`, a: `$${g.ans}$`,
            verify: p => apxIs(p.a, LG, G * T * T / (4 * Math.PI * Math.PI)) }, '6-32', `ばねではなく振り子。$L=\\frac{gT^{2}}{4\\pi^{2}}$`, ['6-34']);
        }
        const sp = r.pick(SPRING.filter(s => s.w !== 4 && s.w !== 2)), g = apx(PI2 / sp.w, 2 * Math.PI / sp.w, 2);
        if (!g) return null;
        return dest({ key: '6-32trapB', q: `質量 ${U(sp.m, 'kg')} のおもりを、ばね定数 ${U(sp.k, 'N/m')} のばねにつないだ。周期は約 □ 秒（${piT}${g.note}）`, a: `$${g.ans}$`,
          verify: p => apxIs(p.a, 2 * PI * Math.sqrt(sp.m / sp.k), 2 * Math.PI * Math.sqrt(sp.m / sp.k)) }, '6-32', '質量がわかっていて、周期を求める（逆向き）', ['6-31']);
      },
    },
  });

  // ================================================================ 6-33
  // つるすおもりと ばね定数：のび mg/k が小数第4位（cm で小数第2位）までの数
  const HANG = (() => {
    const out = [];
    for (const m of [0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 1, 2]) for (const k of [5, 7, 10, 14, 20, 25, 28, 35, 40, 49, 50, 70, 98, 100, 140, 196, 200]) {
      const y = m * G / k;
      if (isDec(y * 100, 2) && y >= 0.005 && y <= 0.5 && !(m === 0.1 && k === 40)) out.push({ m, k, y: +fmt(y) });
    }
    return out;
  })();
  const HS = [0.04, 0.06, 0.07, 0.08, 0.1, 0.12, 0.15, 0.2];   // √(のび/g)。0.05（のび 2.45 cm）は楽な形の例
  M.add({
    id: '6-33', part: 3, chap: '6-6⑤・例題3', stars: 1,
    title: 'つるしたばね：のび $y_0=\\frac{mg}{k}$。周期は $2\\pi\\sqrt{\\frac{y_0}{g}}$（のびだけで決まる）',
    mark: '「ばねにおもりをつるした」「□ cm のびてつり合った」と、のび・周期。',
    futsu: ['$m\\ddot y=mg-ky$ を立て、つり合いの位置からのずれ', '$u=y-y_0$ の式に書きかえてから周期を出す。'],
    raku: ['$40\\,\\mathrm{N/m}$・$0.1\\,\\mathrm{kg}$ → $y_0=\\frac{0.1\\times9.8}{40}=0.0245\\,\\mathrm{m}$', '$T=2\\pi\\sqrt{\\frac{0.0245}{9.8}}=2\\pi\\sqrt{0.0025}\\approx0.314$ 秒', '（$\\frac{m}{k}=\\frac{0.1}{40}$ と $\\frac{y_0}{g}$ が同じ）'],
    why: 'つり合いでは $ky_0=mg$。重さは、ゆれの中心をつり合いの位置まで下げるだけで、ずれ $u$ の式は $m\\ddot u=-ku$ のまま（6-6⑤）。$\\frac{m}{k}=\\frac{y_0}{g}$ なので $T=2\\pi\\sqrt{\\frac{m}{k}}=2\\pi\\sqrt{\\frac{y_0}{g}}$。のびが同じなら、質量やばねがちがっても周期は同じで、長さ $y_0$ の振り子の周期とも同じ。',
    caution: 'ゆれの中心は、ばねが自然の長さの位置ではなく、つり合いの位置。のびが cm なら m に直してから $9.8$ でわる。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /つる/.test(q) && /のび|周期|振り子の長さ/.test(ask(q)) && !/速さ|振幅/.test(q); },
    steps: {
      // のび（cm）
      s1(r) {
        const h = r.pick(HANG), cm = +fmt(h.y * 100);
        return { q: `ばね定数 ${U(h.k, 'N/m')} のばねに、${U(h.m, 'kg')} のおもりをつるした。つり合うときののびは □ cm（${gT}）`, a: `$${fmt(cm)}$`, key: `y${h.y}`,
          easy: `$\\frac{${h.m}\\times9.8}{${h.k}}=${fmt(h.y)}\\,\\mathrm{m}$`, easyCheck: false, verify: p => valIs(p.a, h.m * 980 / h.k) };
      },
      // のびから周期・のびが n 倍のとき
      s2(r) {
        if (r.chance(0.3)) {
          const n = r.pick([4, 9, 0.25, 16]);
          return { q: `ばねにつるしたおもりを、のびが ${times(n)}になるおもりに取りかえると、ゆれの周期は □ 倍`, a: `$${n >= 1 ? fmt(Math.sqrt(n)) : `\\frac{1}{${fmt(Math.sqrt(1 / n))}}`}$`, key: `n${n}`,
            easy: `周期は $2\\pi\\sqrt{\\frac{y_0}{g}}$ なので $\\sqrt{${n >= 1 ? fmt(n) : `\\frac{1}{${fmt(1 / n)}}`}}$ 倍`, easyCheck: false, verify: p => valIs(p.a, Math.sqrt(n)) };
        }
        const s = r.pick(HS), y = lenOf(s), g = apx(PI2 * s, 2 * Math.PI * s, 3);
        if (!g) return null;
        return { q: `ばねにおもりをつるすと、${U(fmt(y * 100), 'cm')} のびてつり合った。ゆれの周期は約 □ 秒（${gT}、${piT}${g.note}）`, a: `$${g.ans}$`, key: `p${s}`, easyCheck: false,
          easy: `$\\frac{${fmt(y)}}{9.8}=${fmt(s * s)}$、$6.28\\times\\sqrt{${fmt(s * s)}}=6.28\\times${s}${tail(g, PI2 * s)}$`,
          verify: p => apxIs(p.a, 2 * PI * Math.sqrt(y / G), 2 * Math.PI * Math.sqrt(y / G)) };
      },
      // 見かけがちがう：質量が g、質量とばね定数から √(y0/g) で周期、同じ周期の振り子の長さ
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const h = r.pick(HANG.filter(x => x.m < 1)), cm = +fmt(h.y * 100);
          return { q: `ばね定数 ${U(h.k, 'N/m')} のばねに、${U(fmt(h.m * 1000), 'g')} のおもりをつるした。つり合うときののびは □ cm（${gT}）`, a: `$${fmt(cm)}$`, key: `y${h.y}`,
            easy: `$${fmt(h.m * 1000)}\\,\\mathrm{g}=${h.m}\\,\\mathrm{kg}$、$\\frac{${h.m}\\times9.8}{${h.k}}=${fmt(h.y)}\\,\\mathrm{m}$`, easyCheck: false, verify: p => valIs(p.a, h.m * 980 / h.k) };
        }
        const s = r.pick(HS);
        if (kind === 1) {
          const m = r.pick([0.1, 0.2, 0.4, 0.5, 1]), k = m / (s * s), g = apx(PI2 * s, 2 * Math.PI * s, 3);
          if (!isDec(k, 1) || !g) return null;
          return { q: `ばね定数 ${U(fmt(k), 'N/m')} のばねに ${U(m, 'kg')} のおもりをつるし、つり合いの位置から少し引いてはなした。ゆれの周期は約 □ 秒（${gT}、${piT}${g.note}）`, a: `$${g.ans}$`, key: `p${s}`, easyCheck: false,
            easy: `のび $y_0=\\frac{${m}\\times9.8}{${fmt(k)}}=${fmt(lenOf(s))}$、$6.28\\sqrt{\\frac{${fmt(lenOf(s))}}{9.8}}=6.28\\times${s}${tail(g, PI2 * s)}$`,
            verify: p => apxIs(p.a, 2 * PI * Math.sqrt(m / k), 2 * Math.PI * Math.sqrt(m / k)) };
        }
        const y = lenOf(s);
        return { q: `ばねにおもりをつるすと、${U(fmt(y * 100), 'cm')} のびてつり合った。このおもりのゆれと同じ周期でゆれる振り子の長さは □ cm`, a: `$${fmt(y * 100)}$`, key: `p${s}`,
          easy: `$2\\pi\\sqrt{\\frac{y_0}{g}}=2\\pi\\sqrt{\\frac{L}{g}}$ なので $L=y_0$`, easyCheck: false, verify: p => valIs(p.a, G * (2 * Math.PI * Math.sqrt(y / G) / (2 * Math.PI)) ** 2 * 100) };
      },
      // わな：つるしたばねの、いちばん速い所の速さ・ある位置での速さ（6-37）
      trap(r) {
        const [k, m] = r.pick([[25, 0.25], [10, 0.1], [20, 0.2], [50, 0.5], [100, 0.25], [64, 0.25], [36, 0.25]]), w = Math.sqrt(k / m);
        if (r.chance(0.5)) {
          const X = r.pick([0.02, 0.03, 0.05, 0.1]);
          return dest({ key: '6-33trapA', q: `ばね定数 ${U(k, 'N/m')} のばねに ${U(m, 'kg')} のおもりをつるし、つり合いの位置から ${U(X, 'm')} 引いてはなした。いちばん速い所の速さは □ m/s`, a: `$${fmt(X * w)}$`,
            verify: p => valIs(p.a, X * Math.sqrt(k / m)) }, '6-33', `周期でもなく、のびでもなく、速さ。振幅 $${X}$、$\\omega_{\\mathrm n}=${fmt(w)}$ で $X\\omega_{\\mathrm n}$`, ['6-37']);
        }
        const [X, x, v] = r.pick([[0.05, 0.03, 0.04], [0.05, 0.04, 0.03], [0.1, 0.08, 0.06], [0.13, 0.05, 0.12]]);
        return dest({ key: '6-33trapB', q: `ばね定数 ${U(k, 'N/m')} のばねに ${U(m, 'kg')} のおもりをつるし、つり合いの位置から ${U(X, 'm')} 引いてはなした。つり合いの位置から ${U(x, 'm')} の所を通るときの速さは □ m/s`, a: `$${fmt(v * w)}$`,
          verify: p => valIs(p.a, Math.sqrt(k / m) * Math.sqrt(X * X - x * x)) }, '6-33', `のびでも周期でもなく、ある位置での速さ。エネルギーの引き算で $\\omega_{\\mathrm n}\\sqrt{X^{2}-x^{2}}$`, ['6-37']);
      },
    },
  });

  // ================================================================ 6-34
  const PS = [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 1];            // √(L/g)。0.5（2.45 m）は楽な形の例
  const PW = [0.05, 0.1, 0.2, 0.25, 0.4, 0.8, 1];                // ω=1/s が きれいな数になるもの
  M.add({
    id: '6-34', part: 3, chap: '6-6⑦・例題6', stars: 1,
    title: '振り子：$T=2\\pi\\sqrt{\\frac{L}{g}}$、$L=\\frac{gT^2}{4\\pi^2}$（$g$ が $\\frac{1}{n}$ なら周期は $\\sqrt{n}$ 倍）',
    mark: '糸の長さ・周期と、月や星の $g$。ふれが小さい振り子。',
    futsu: ['$\\ddot\\theta=-\\frac{g}{L}\\sin\\theta$ を表計算で進めて、', '1往復の時間を表から読む。'],
    raku: ['$2.45\\,\\mathrm{m}$ → $2\\pi\\sqrt{0.25}=\\pi\\approx3.14$ 秒', '周期2秒 → $\\frac{9.8\\times4}{39.48}\\approx0.99\\,\\mathrm{m}$', '周期1秒 → 約 $0.25\\,\\mathrm{m}$'],
    why: 'ふれが小さいと $\\sin\\theta\\approx\\theta$ なので $\\ddot\\theta\\approx-\\frac{g}{L}\\theta$。ばねの $\\frac{k}{m}$ が $\\frac{g}{L}$ になっただけなので、$\\omega_{\\mathrm n}=\\sqrt{\\frac{g}{L}}$、$T=2\\pi\\sqrt{\\frac{L}{g}}$（6-6⑦）。両辺を2乗すれば $L=\\frac{gT^2}{4\\pi^2}$。$g$ が $\\frac{1}{n}$ になると、$\\sqrt{\\frac{L}{g}}$ は $\\sqrt{n}$ 倍。',
    caution: 'おもりの質量は周期に入らない。ふれが大きいと、周期は $2\\pi\\sqrt{\\frac{L}{g}}$ より長くなる（この式は小さいふれのとき）。長さが cm なら m に直す。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /振り子/.test(q) && !/ふれはば|\\circ|°/.test(q) && /周期|長さ|固有角振動数/.test(ask(q)); },
    steps: {
      // 長さから周期・固有角振動数
      s1(r) {
        if (r.chance(0.35)) {
          const s = r.pick(PW), L = lenOf(s);
          return { q: `長さ ${U(L, 'm')} の振り子の、固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$（${gT}）`, a: `$${fmt(1 / s)}$`, key: `L${s}`,
            easy: `$\\sqrt{\\frac{9.8}{${fmt(L)}}}=\\sqrt{${fmt(1 / (s * s))}}=${fmt(1 / s)}$` };
        }
        const s = r.pick(PS), L = lenOf(s), g = apx(PI2 * s, 2 * Math.PI * s, 2);
        if (!g) return null;
        return { q: `長さ ${U(L, 'm')} の振り子の周期は約 □ 秒（${gT}、${piT}${g.note}）`, a: `$${g.ans}$`, key: `L${s}`, easyCheck: false,
          easy: `$\\frac{${fmt(L)}}{9.8}=${fmt(s * s)}$、$6.28\\times\\sqrt{${fmt(s * s)}}=6.28\\times${s}${tail(g, PI2 * s)}$`,
          verify: p => apxIs(p.a, 2 * PI * Math.sqrt(L / G), 2 * Math.PI * Math.sqrt(L / G)) };
      },
      // 長さ・周期・g の倍
      s2(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const n = r.pick([4, 9, 16, 0.25]), f = Math.sqrt(n);
          return { q: `振り子の糸の長さを ${times(n)}にすると、周期は □ 倍`, a: `$${f >= 1 ? fmt(f) : `\\frac{1}{${fmt(1 / f)}}`}$`, key: `a${n}`, easyCheck: false,
            easy: `周期は $\\sqrt{L}$ に比例 → $\\sqrt{${n >= 1 ? fmt(n) : `\\frac{1}{${fmt(1 / n)}}`}}$ 倍`, verify: p => valIs(p.a, f) };
        }
        if (kind === 1) {
          const n = r.pick([2, 3, 1.5, 0.5]);
          return { q: `振り子の周期を ${fmt(n)}倍にしたい。糸の長さを □ 倍にする`, a: `$${fmt(n * n)}$`, key: `b${n}`, easy: `$${fmt(n)}^{2}=${fmt(n * n)}$` };
        }
        const n = r.pick([4, 9, 16]), T0 = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5]);
        return { q: `地球で周期 ${fmt(T0)} 秒の振り子を、重力加速度が地球の $\\frac{1}{${n}}$ の星にもっていく。周期は □ 秒`, a: `$${fmt(T0 * Math.sqrt(n))}$`, key: `c${T0},${n}`, easyCheck: false,
          easy: `$g$ が $\\frac{1}{${n}}$ → 周期は $\\sqrt{${n}}=${fmt(Math.sqrt(n))}$ 倍 → $${fmt(T0 * Math.sqrt(n))}$`, verify: p => valIs(p.a, 2 * Math.PI * Math.sqrt(G * (T0 / (2 * Math.PI)) ** 2 / (G / n)) ) };
      },
      // 見かけがちがう：周期から長さ（4π^2。重い計算）、長さが cm、月の振り子
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const T = r.pick([0.5, 1.5, 2.5, 3, 4]), LG = G * T * T / PI4, g = apx(LG, G * T * T / (4 * Math.PI * Math.PI), 2);
          if (!g) return null;
          return { q: `周期が ${fmt(T)} 秒の振り子の、糸の長さは約 □ m（${gT}、${p4T}${g.note}）`, a: `$${g.ans}$`, key: `T${T}`, easyCheck: false,
            easy: `$L=\\frac{9.8\\times${fmt(T)}^{2}}{39.48}=\\frac{${fmt(G * T * T)}}{39.48}${tail(g, LG)}$`,
            verify: p => apxIs(p.a, G * T * T / PI4, G * T * T / (4 * Math.PI * Math.PI)) };
        }
        if (kind === 1) {
          const s = r.pick(PS), L = lenOf(s), g = apx(PI2 * s, 2 * Math.PI * s, 2);
          if (!g || L > 2) return null;
          return { q: `長さ ${U(fmt(L * 100), 'cm')} の振り子の周期は約 □ 秒（${gT}、${piT}${g.note}）`, a: `$${g.ans}$`, key: `L${s}`, easyCheck: false,
            easy: `$${fmt(L * 100)}\\,\\mathrm{cm}=${fmt(L)}\\,\\mathrm{m}$、$6.28\\sqrt{\\frac{${fmt(L)}}{9.8}}=6.28\\times${s}${tail(g, PI2 * s)}$`,
            verify: p => apxIs(p.a, 2 * PI * Math.sqrt(L / G), 2 * Math.PI * Math.sqrt(L / G)) };
        }
        const s = r.pick([0.25, 0.75, 1, 1.5]), L = +fmt(1.6 * s * s), g = apx(PI2 * s, 2 * Math.PI * s, 2);
        if (!g) return null;
        return { q: `重力加速度が ${U(1.6, 'm/s^2')} の星で、長さ ${U(L, 'm')} の振り子をゆらす。周期は約 □ 秒（${piT}${g.note}）`, a: `$${g.ans}$`, key: `g${s}`, easyCheck: false,
          easy: `$\\frac{${fmt(L)}}{1.6}=${fmt(s * s)}$、$6.28\\times${s}${tail(g, PI2 * s)}$`,
          verify: p => apxIs(p.a, 2 * PI * Math.sqrt(L / 1.6), 2 * Math.PI * Math.sqrt(L / 1.6)) };
      },
      // わな：大きいふれ（わざなし）、ばねの固有角振動数（6-31）
      trap(r) {
        if (r.chance(0.5)) {
          const deg = r.pick([60, 90, 120]), [L, T] = r.pick([[1, '2.01'], [4, '4.01']]);
          return dest({ key: '6-34trapA', q: `長さ ${U(L, 'm')} の振り子を、ふれはば $${deg}^{\\circ}$ まで引いてはなした。周期は、$2\\pi\\sqrt{\\frac{L}{g}}\\approx${T}$ 秒とくらべて（長い・短い・同じ）`, a: '長い',
            verify: p => (p.a === '長い' && Math.abs(2 * Math.PI * Math.sqrt(L / G) - +T) < 0.005) || 'ちがう' }, '6-34', 'ふれが大きいと $\\sin\\theta\\approx\\theta$ が使えず、引きもどす力が弱いので長くなる。表計算で調べる');
        }
        const sp = r.pick(SPRING.filter(x => x.w !== 4 && x.w <= 20));
        return dest({ key: '6-34trapB', q: `質量 ${U(sp.m, 'kg')} のおもりを、ばね定数 ${U(sp.k, 'N/m')} のばねにつないだ。固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${sp.w}$`,
          verify: p => valIs(p.a, Math.sqrt(sp.k / sp.m)) }, '6-34', `振り子ではなく、ばね。$\\sqrt{\\frac{k}{m}}$`, ['6-31']);
      },
    },
  });

  // ================================================================ 6-35
  // コイル（mH）とコンデンサー（μF）：LC=P×10^{-9}（P=Lm×Cu）。ω=1/√(LC) が きれいな数
  const sciT = (a, n) => (Math.abs(a - 1) < 1e-12 ? `10^{${n}}` : `${fmt(a)}\\times10^{${n}}`);
  const LCS = (() => {
    const out = [];
    for (const Lm of [1, 2, 4, 5, 10, 20, 25, 40, 50, 100, 200, 400, 500]) for (const Cu of [0.1, 0.2, 0.25, 0.4, 0.5, 1, 2, 2.5, 4, 5, 10, 20, 25, 40, 50, 100]) {
      const P = Lm * Cu, w = 1 / Math.sqrt(P * 1e-9), wr = Math.round(w);
      if (Math.abs(w - wr) > 1e-6 * w || wr < 200 || wr > 100000) continue;
      if (String(wr).replace(/0+$/, '').length > 1 && !/^(25|125)$/.test(String(wr).replace(/0+$/, ''))) continue;
      if ((Lm === 10 && Cu === 1) || (Lm === 10 && Cu === 4)) continue;   // 楽な形の例
      let n = 8; while (P * 10 ** (n - 9) >= 100 - 1e-9) n -= 2; while (P * 10 ** (n - 9) < 1 - 1e-9) n += 2;
      const a = +fmt(P * 10 ** (n - 9));
      out.push({ Lm, Cu, w: wr, a, n });
    }
    return out;
  })();
  const lcHead = o => `$L=${o.Lm}\\,\\mathrm{mH}$ のコイルと $C=${o.Cu}\\,\\mathrm{${MU}F}$ のコンデンサーの回路`;
  const lcEasy = o => `$LC=${o.Lm}\\times10^{-3}\\times${o.Cu}\\times10^{-6}=${sciT(o.a, -o.n)}$、$\\sqrt{LC}=${sciT(Math.sqrt(o.a), -o.n / 2)}$`;
  M.add({
    id: '6-35', part: 3, chap: '6-6⑧・例題7', stars: 1,
    title: 'LC 回路：$\\omega_{\\mathrm n}=\\frac{1}{\\sqrt{LC}}$、$T=2\\pi\\sqrt{LC}$（m・μ を10の累乗に直して、$LC$ を $10^{-\\text{偶数}}$ の形に）',
    mark: 'コイルとコンデンサーの回路の「固有角振動数」「周期」「振動数」。',
    futsu: ['$L$ と $C$ を $0.01$、$0.000001$ のような小数に直して', 'かけ算し、小数のまま $\\sqrt{\\phantom{L}}$ をとる。'],
    raku: ['$10\\,\\mathrm{mH}$・$1\\,\\mathrm{\\mu F}$ → $LC=10^{-2}\\times10^{-6}=10^{-8}$', '$\\omega_{\\mathrm n}=10^{4}$、周期 $0.628\\,\\mathrm{ms}$、約 $1590\\,\\mathrm{Hz}$', '$C$ を4倍 → 周期は2倍'],
    why: 'コイルとコンデンサーの式 $L\\ddot q=-\\frac{1}{C}q$ は、ばねの $m\\ddot x=-kx$ で $m\\to L$、$k\\to\\frac{1}{C}$ とおきかえた形（6-6⑧）。だから $\\omega_{\\mathrm n}=\\sqrt{\\frac{1}{LC}}$、$T=2\\pi\\sqrt{LC}$。m は $10^{-3}$、μ は $10^{-6}$ なので、指数をたして $LC=10^{-\\square}$ にすると、$\\sqrt{\\phantom{L}}$ は指数を半分にするだけ。',
    caution: '接頭語を直さずに $L=10$、$C=1$ としない。$LC$ の指数が奇数（$10^{-7}$）なら、$10\\times10^{-8}$ と書きかえてから $\\sqrt{\\phantom{L}}$ をとる。周期は $\\sqrt{LC}$ に比例するので、$C$ が4倍なら周期は2倍。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '20mm',
    fits(q) { return /コイル/.test(q) && /コンデンサー/.test(q) && /固有角振動数|周期|振動数/.test(q) && /固有角振動数|周期|振動数|C=□|L=□/.test(ask(q)) && !/抵抗|\\Omega|ためて|電流/.test(q); },
    steps: {
      // 固有角振動数・周期（ms）・振動数
      s1(r) {
        const o = r.pick(LCS), kind = r.int(0, 2);
        if (kind === 0) return { q: lcHead(o) + `の、固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${o.w}$`, key: `w${o.w}`, easyCheck: false,
          easy: lcEasy(o) + `、$\\omega_{\\mathrm n}=${o.w}$`, verify: p => valIs(p.a, 1 / Math.sqrt(o.Lm / 1000 * o.Cu / 1e6)) };
        if (kind === 1) {
          const vG = 6280 / o.w, g = apx(vG, 2000 * Math.PI / o.w, 3);
          if (!g || vG < 0.05 || vG > 100) return null;
          return { q: lcHead(o) + `の、周期は約 □ ms（${piT}${g.note}）`, a: `$${g.ans}$`, key: `w${o.w}`, easyCheck: false,
            easy: `$\\omega_{\\mathrm n}=${o.w}$、$T=\\frac{6.28}{${o.w}}\\,\\mathrm{s}=${fmt(vG)}\\,\\mathrm{ms}${g.exact ? '' : `\\approx${g.ans}\\,\\mathrm{ms}`}$`,
            verify: p => apxIs(p.a, 2 * PI * Math.sqrt(o.Lm / 1000 * o.Cu / 1e6) * 1000, 2 * Math.PI * Math.sqrt(o.Lm / 1000 * o.Cu / 1e6) * 1000) };
        }
        const vG = o.w / PI2, g = apx(vG, o.w / (2 * Math.PI), 0);
        if (!g || vG > 20000) return null;
        return { q: lcHead(o) + `の、振動数は約 □ Hz（${piT}${g.note}）`, a: `$${g.ans}$`, key: `w${o.w}`, easyCheck: false,
          easy: `$\\omega_{\\mathrm n}=${o.w}$、$f=\\frac{${o.w}}{6.28}=${fmt(+vG.toFixed(2))}\\cdots$`,
          verify: p => apxIs(p.a, 1 / (2 * PI * Math.sqrt(o.Lm / 1000 * o.Cu / 1e6)), 1 / (2 * Math.PI * Math.sqrt(o.Lm / 1000 * o.Cu / 1e6))) };
      },
      // L・C を n 倍にしたとき
      s2(r) {
        const kind = r.int(0, 2), n = r.pick([4, 9, 16, 0.25]), f = Math.sqrt(n);
        const fT = v => (v >= 1 ? fmt(v) : `\\frac{1}{${fmt(1 / v)}}`);
        if (kind === 0) return { q: `コイルとコンデンサーの回路で、コンデンサーを、$C$ が ${times(n)}のものに取りかえると、周期は □ 倍`, a: `$${fT(f)}$`, key: `c${n}`, easyCheck: false,
          easy: `周期は $\\sqrt{LC}$ に比例 → $\\sqrt{${fT(n)}}=${fT(f)}$`, verify: p => valIs(p.a, f) };
        if (kind === 1) return { q: `コイルとコンデンサーの回路で、コイルを、$L$ が ${times(n)}のものに取りかえると、固有角振動数は □ 倍`, a: `$${fT(1 / f)}$`, key: `l${n}`, easyCheck: false,
          easy: `$\\omega_{\\mathrm n}$ は $\\frac{1}{\\sqrt{LC}}$ → $${fT(1 / f)}$ 倍`, verify: p => valIs(p.a, 1 / f) };
        const T0 = r.pick([0.2, 0.4, 0.5, 0.6, 1.2, 1.5, 2]);
        return { q: `周期 ${U(T0, 'ms')} の、コイルとコンデンサーの回路がある。コンデンサーを、$C$ が ${times(n)}のものに取りかえると、周期は □ ms`, a: `$${fmt(T0 * f)}$`, key: `t${T0},${n}`, easyCheck: false,
          easy: `周期は $\\sqrt{${fT(n)}}=${fT(f)}$ 倍 → $${fmt(T0 * f)}$`, verify: p => valIs(p.a, T0 * Math.sqrt(n)) };
      },
      // 見かけがちがう：L が H、ほしい ω にする C、C が F
      s3(r) {
        const o = r.pick(LCS), kind = r.int(0, 2);
        if (kind === 0) {
          if (o.Lm < 100) return null;
          return { q: `$L=${fmt(o.Lm / 1000)}\\,\\mathrm{H}$ のコイルと $C=${o.Cu}\\,\\mathrm{${MU}F}$ のコンデンサーの回路の、固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${o.w}$`, key: `w${o.w}`, easyCheck: false,
            easy: `$${fmt(o.Lm / 1000)}\\,\\mathrm{H}=${o.Lm}\\,\\mathrm{mH}$、` + lcEasy(o) + `、$\\omega_{\\mathrm n}=${o.w}$`, verify: p => valIs(p.a, 1 / Math.sqrt(o.Lm / 1000 * o.Cu / 1e6)) };
        }
        if (kind === 1) return { q: `$L=${o.Lm}\\,\\mathrm{mH}$ のコイルにつないで、固有角振動数を $${o.w}\\,\\mathrm{rad/s}$ にしたい。コンデンサーは $C=□\\,\\mathrm{${MU}F}$`, a: `$${o.Cu}$`, key: `w${o.w}`, easyCheck: false,
          easy: `$LC=\\frac{1}{${o.w}^{2}}=${sciT(o.a, -o.n)}$、$C=\\frac{${sciT(o.a, -o.n)}}{${o.Lm}\\times10^{-3}}$`, verify: p => valIs(p.a, 1e6 / (o.w * o.w * o.Lm / 1000)) };
        if (o.Cu > 10 || o.Cu < 1) return null;
        return { q: `$L=${o.Lm}\\,\\mathrm{mH}$ のコイルと $C=${(o.Cu / 1e6).toFixed(9).replace(/0+$/, '')}\\,\\mathrm{F}$ のコンデンサーの回路の、固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${o.w}$`, key: `w${o.w}`, easyCheck: false,
          easy: `$C=${o.Cu}\\,\\mathrm{${MU}F}$、` + lcEasy(o) + `、$\\omega_{\\mathrm n}=${o.w}$`, verify: p => valIs(p.a, 1 / Math.sqrt(o.Lm / 1000 * o.Cu / 1e6)) };
      },
      // わな：抵抗の入った回路の臨界の抵抗（6-44）、ためてからの電流（6-38）
      trap(r) {
        if (r.chance(0.5)) {
          const [Lm, Cu, Rc] = r.pick([[1, 10, 20], [4, 10, 40], [9, 10, 60], [25, 10, 100], [1, 0.1, 200], [100, 10, 200], [16, 10, 80]]), R = r.pick([10, 20, 30, 50]);
          return dest({ key: '6-35trapA', q: `$L=${Lm}\\,\\mathrm{mH}$ のコイル、$R=${R}\\,\\Omega$ の抵抗、$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーの回路の、臨界の抵抗 $R_{\\mathrm c}=□\\,\\Omega$`, a: `$${Rc}$`,
            verify: p => valIs(p.a, 2 * Math.sqrt(Lm / 1000 / (Cu / 1e6))) }, '6-35', `周期ではなく、抵抗の入った回路の臨界の抵抗。$2\\sqrt{\\frac{L}{C}}$`, ['6-44']);
        }
        const [Cu, Lm, s] = r.pick([[4, 10, 0.02], [9, 10, 0.03], [10, 1, 0.1], [2.5, 1, 0.05], [1, 10, 0.01], [16, 10, 0.04]]), V = r.pick([5, 10, 20, 50]);
        const i = V * Math.sqrt(Cu / 1e6 / (Lm / 1000));
        return dest({ key: '6-35trapB', q: `$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーを $${V}\\,\\mathrm{V}$ にためてから、$L=${Lm}\\,\\mathrm{mH}$ のコイルにつなぎかえた。電流のいちばん大きい値は □ A`, a: `$${fmt(i)}$`,
          verify: p => valIs(p.a, V * s) }, '6-35', `周期ではなく電流。$\\frac{1}{2}CV^{2}=\\frac{1}{2}Li^{2}$ から $V\\sqrt{\\frac{C}{L}}$`, ['6-38']);
      },
    },
  });

  // ================================================================ 6-36
  // 点 (x0, -v0/ω) を作る。√2・√3 の倍は {c, r}（c×√r）で持つ
  const radT = (c, rr) => { if (Math.abs(c) < 1e-12) return '0'; return rr === 1 ? fmt(c) : `${c < 0 ? '-' : ''}${Math.abs(Math.abs(c) - 1) < 1e-12 ? '' : fmt(Math.abs(c))}\\sqrt{${rr}}`; };
  const radV = (c, rr) => c * Math.sqrt(rr);
  const gcdI = (a, b) => (b ? gcdI(b, a % b) : Math.abs(a));
  // π の分数：piF(n, d) → -\frac{\pi}{3}・\frac{2\pi}{3}・\pi
  function piF(n, d) {
    const g = gcdI(Math.abs(n), d); n /= g; d /= g;
    const s = n < 0 ? '-' : '', a = Math.abs(n);
    if (n === 0) return '0';
    if (d === 1) return s + (a === 1 ? '' : a) + '\\pi';
    return `${s}\\frac{${a === 1 ? '' : a}\\pi}{${d}}`;
  }
  // 特別な角（π の n/12 倍）の cos・sin を、u の {c, r} で（X=2u）
  const ANG = [[-10, -1, 3, -1, 1], [-9, -1, 2, -1, 2], [-8, -1, 1, -1, 3], [-6, 0, 1, -2, 1], [-4, 1, 1, -1, 3], [-3, 1, 2, -1, 2], [-2, 1, 3, -1, 1],
    [2, 1, 3, 1, 1], [3, 1, 2, 1, 2], [4, 1, 1, 1, 3], [6, 0, 1, 2, 1], [8, -1, 1, 1, 3], [9, -1, 2, 1, 2], [10, -1, 3, 1, 1]];   // [12φ/π, cos の c, r, sin の c, r]（cos=c√r/2）
  function spPoint(r) {
    const w = r.pick([2, 4, 5, 10]), [n12, cc, cr, sc, sr] = r.pick(ANG), u = r.pick([0.05, 0.1, 0.02, 0.04, 0.03]);
    const xc = cc * u, yc = sc * u, X = 2 * u;   // x0 = xc√cr、点のたて yc√sr
    const vc = -w * yc;                            // v0 = -ω×たて
    if (w === 2 && n12 === -4 && u === 0.1) return null;   // 楽な形の例（ω=2、0.1、0.2√3）
    return { w, n12, X: +fmt(X), x0T: radT(+fmt(xc), cr), yT: radT(+fmt(yc), sr), v0T: radT(+fmt(vc), sr), x0: radV(xc, cr), y: radV(yc, sr), v0: radV(vc, sr), phT: piF(n12, 12), key: `P${fmt(radV(xc, cr))},${fmt(radV(yc, sr))}` };
  }
  const cartHead = (w, x0T, v0T) => `ばねの台車（$\\omega_{\\mathrm n}=${w}\\,\\mathrm{rad/s}$、右向きが正）が、はじめ $x_0=${x0T}\\,\\mathrm{m}$、$v_0=${v0T}\\,\\mathrm{m/s}$ で動き出す。`;
  // 図：横 x、たて -v/ω、点 P、原点からの線分、半径 X の円、角 φ の弧（数のラベルは書かない。数は問題の文にある）
  //   O は、弧のない側（φ>0 なら下、φ<0 なら上）の、P と反対の横に置く
  function phaseFig(o) {
    const R = o.X * 1.3, Gp = M.graph({ x0: -R, x1: R, y0: -R, y1: R, w: 6, h: 6 }), T = Gp.T, P = T(o.x0, o.y), rad = T(o.X, 0)[0];
    const ph = Math.atan2(o.y, o.x0) * 180 / Math.PI, oq = (ph > 0 ? 's' : 'n') + (o.x0 > 1e-9 ? 'w' : 'e');
    const pl = (o.y >= 0 ? 'n' : 's') + (o.x0 >= 0 ? 'e' : 'w');
    const its = [...Gp.axes({ x: 'x', y: '-v/\\omega_{\\mathrm{n}}', o: oq }), ['circle', [0, 0], rad, { dash: true }], ['seg', T(0, 0), P, { thick: true }], ['dot', P], ['label', P, 'P', pl]];
    if (Math.abs(o.y) > 1e-9 && Math.abs(o.x0) > 1e-9) its.push(['seg', P, T(o.x0, 0), { dash: true }], ['seg', P, T(0, o.y), { dash: true }]);
    const ar = rad * 0.3, d0 = Math.min(0, ph), d1 = Math.max(0, ph), mid = (d0 + d1) / 2 * Math.PI / 180;
    its.push(['arc', [0, 0], ar, d0, d1], ['label', [(ar + 0.4) * Math.cos(mid), (ar + 0.4) * Math.sin(mid)], '$\\phi$', 'c']);
    return { s: 4.5, items: its };
  }
  M.add({
    id: '6-36', part: 3, chap: '6-6④・例題4', stars: 1,
    title: '振幅と初期位相：点 $\\Bigl(x_0,\\ -\\frac{v_0}{\\omega_{\\mathrm n}}\\Bigr)$ をかく。原点からの距離が $X$、向きの角が $\\phi$',
    mark: 'はじめの位置 $x_0$ と、はじめの速度 $v_0$（0でない）。「振幅」「初期位相」「$X\\cos(\\omega_{\\mathrm n}t+\\phi)$ の形」。',
    futsu: ['$x=A\\sin\\omega t+B\\cos\\omega t$ で $A$・$B$ を決め、', '加法定理で $X\\cos(\\omega t+\\phi)$ にまとめる。'],
    raku: ['$\\omega_{\\mathrm n}=2$、$x_0=0.1$、$v_0=0.2\\sqrt{3}$', '→ 点 $(0.1,\\ -0.1\\sqrt{3})$ → $X=0.2$、$\\phi=-\\frac{\\pi}{3}$', '→ $x=0.2\\cos\\Bigl(2t-\\frac{\\pi}{3}\\Bigr)$、いちばん右は $t=\\frac{\\pi}{6}$'],
    why: '台車の位置を、半径 $X$ の円の上を1秒に $\\omega_{\\mathrm n}$ ラジアン左回りに回る点の影と見る。点のたての座標は $-\\frac{v}{\\omega_{\\mathrm n}}$ なので、はじめの点は $\\Bigl(x_0,\\ -\\frac{v_0}{\\omega_{\\mathrm n}}\\Bigr)$。原点からの距離が振幅 $X$、向きの角が初期位相 $\\phi$（6-6④の方法2）。点が横軸の右に来るとき、台車はいちばん右。',
    caution: '$\\phi$ は $\\tan\\phi$ だけでは決まらない（点 $(0.1,\\ -0.1)$ と $(-0.1,\\ 0.1)$ は向きが反対）。点をかいて、向きを確かめる。たての座標には $-$ をつける。振幅は $x_0+\\frac{v_0}{\\omega_{\\mathrm n}}$ ではない。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '44mm', trap: '18mm' },
    boxh: { s2: '10mm', s3: '10mm' },
    fits(q) { return /はじめの位置|x_0/.test(q) && /はじめの速度|v_0/.test(q) && /振幅|初期位相|\\phi|X\\cos|いちばん右/.test(ask(q)); },
    steps: {
      // 振幅（直角三角形の3辺）
      s1(r) {
        const w = r.pick([2, 4, 5, 10]), [a, b, c] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17]]), u = r.pick([0.01, 0.02]);
        const sx = r.chance(0.5) ? 1 : -1, sy = r.chance(0.5) ? 1 : -1, x0 = +fmt(sx * a * u), y = +fmt(sy * b * u), v0 = +fmt(-w * y), X = +fmt(c * u);
        if (Math.abs(v0) > 2) return null;
        return { q: cartHead(w, fmt(x0), fmt(v0)) + `振幅 $X=□\\,\\mathrm{m}$`, a: `$${fmt(X)}$`, key: `P${x0},${y}`, easyCheck: false,
          easy: `点 $(${fmt(x0)},\\ ${fmt(y)})$、$X=\\sqrt{${fmt(x0 * x0)}+${fmt(y * y)}}=${fmt(X)}$`, verify: p => valIs(p.a, Math.hypot(x0, v0 / w)) };
      },
      // 初期位相（特別な角）
      s2(r) {
        const o = spPoint(r); if (!o) return null;
        return { q: cartHead(o.w, o.x0T, o.v0T) + `初期位相 $\\phi=□$（$-\\pi<\\phi\\leqq\\pi$）`, a: `$${o.phT}$`, key: o.key, easyCheck: false,
          easy: `点 $(${o.x0T},\\ ${o.yT})$、$X=${fmt(o.X)}$ → $\\phi=${o.phT}$`,
          verify: p => close(numOf(p.a), Math.atan2(-o.v0 / o.w, o.x0)) || `角 ${Math.atan2(-o.v0 / o.w, o.x0)} とちがう` };
      },
      // 図：x を X cos(ωt+φ) の形に・いちばん右に来る時刻
      s3(r) {
        const o = spPoint(r); if (!o) return null;
        const fig = phaseFig(o);
        if (r.chance(0.6)) {
          const ph = o.n12 < 0 ? `-${piF(-o.n12, 12)}` : `+${piF(o.n12, 12)}`;
          const ans = `x=${fmt(o.X)}\\cos\\Bigl(${o.w}t${ph}\\Bigr)`;
          return { q: cartHead(o.w, o.x0T, o.v0T) + `図の P は $(x_0,\\,-v_0/\\omega_{\\mathrm n})$。$x$ を $X\\cos(\\omega_{\\mathrm n}t+\\phi)$ の形で書くと`, a: `$${ans}$`, key: o.key, easyCheck: false, fig,
            easy: `$X=${fmt(o.X)}$、$\\phi=${o.phT}$`, calc: { kind: 'ode', x: 't', coef: [1, 0, o.w * o.w], init: [[0, o.x0], [0, o.v0, 1]] } };
        }
        // はじめていちばん右に来る時刻：点が横軸の右（角0）まで左回りに回る
        const turn = o.n12 < 0 ? -o.n12 : 24 - o.n12;   // 回る角（π/12 の何倍）
        const tT = piF(turn, 12 * o.w);
        return { q: cartHead(o.w, o.x0T, o.v0T) + `図の P は $(x_0,\\,-v_0/\\omega_{\\mathrm n})$。台車がはじめていちばん右に来るのは、$t=□$ 秒後`, a: `$${tT}$`, key: o.key, easyCheck: false, fig,
          easy: `$\\phi=${o.phT}$。左回りに $${piF(turn, 12)}$ 回ると横軸の右 → $${piF(turn, 12)}\\div${o.w}=${tT}$`,
          verify: p => { const t = numOf(p.a), x = tt => o.X * Math.cos(o.w * tt + o.n12 * Math.PI / 12); let first = null; for (let k = 1; k <= 20000; k++) { const tt = k * 2 * Math.PI / o.w / 20000; if (x(tt) > o.X * (1 - 1e-7) && first == null) first = tt; } return (first != null && Math.abs(first - t) < 2 * Math.PI / o.w / 2000 && close(x(t), o.X, 1e-9)) || `時刻 ${first} とちがう`; } };
      },
      // わな：振幅がわかっていて、速さ（6-37）
      trap(r) {
        const sp = r.pick(SPRING.filter(x => x.w <= 10 && x.k <= 500 && !(x.m === 0.5 && x.k === 8))), X = r.pick([0.02, 0.05, 0.1, 0.2]);
        if (r.chance(0.5)) return dest({ key: '6-36trapA', q: `質量 ${U(sp.m, 'kg')}、ばね定数 ${U(sp.k, 'N/m')} の台車が、振幅 ${U(X, 'm')} でゆれている。いちばん速い所の速さは □ m/s`, a: `$${fmt(X * sp.w)}$`,
          verify: p => valIs(p.a, X * Math.sqrt(sp.k / sp.m)) }, '6-36', `振幅はもうわかっている。聞いているのは速さで、$X\\omega_{\\mathrm n}$`, ['6-37']);
        const [Xc, xc, vc] = r.pick([[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [13, 5, 12]]);
        return dest({ key: '6-36trapB', q: `質量 ${U(sp.m, 'kg')}、ばね定数 ${U(sp.k, 'N/m')} の台車が、振幅 ${U(fmt(Xc / 100), 'm')} でゆれている。$x=${fmt(xc / 100)}\\,\\mathrm{m}$ を通るときの速さは □ m/s`, a: `$${fmt(sp.w * vc / 100)}$`,
          verify: p => valIs(p.a, Math.sqrt(sp.k / sp.m) * Math.sqrt((Xc / 100) ** 2 - (xc / 100) ** 2)) }, '6-36', `振幅はもうわかっている。聞いているのは速さで、$\\omega_{\\mathrm n}\\sqrt{X^{2}-x^{2}}$`, ['6-37']);
      },
    },
  });

  // ================================================================ 6-37
  const SP37 = SPRING.filter(x => x.w <= 20 && x.k <= 1000 && !(x.m === 0.5 && x.k === 8));
  const TRI = [[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [13, 5, 12], [13, 12, 5], [25, 7, 24], [25, 24, 7], [17, 8, 15], [17, 15, 8]];   // [X, x, √(X^2-x^2)]
  const cartMK = (m, k, mT) => `質量 ${mT || U(m, 'kg')}、ばね定数 ${U(k, 'N/m')} の台車が、`;
  M.add({
    id: '6-37', part: 3, chap: '6-6⑥・例題5・6-15⑤', stars: 1,
    title: '速さはエネルギーの引き算：$\\frac{1}{2}mv^2=\\frac{1}{2}kX^2-\\frac{1}{2}kx^2$（$v=\\omega_{\\mathrm n}\\sqrt{X^2-x^2}$、まん中で $X\\omega_{\\mathrm n}$）',
    mark: '振幅と、「いちばん速い所の速さ」「$x=\\square$ を通るときの速さ」。',
    futsu: ['$x=X\\cos\\omega t$ から、その位置に来る時刻 $t$ を求め、', '$v=-X\\omega\\sin\\omega t$ に入れる。'],
    raku: ['$0.5\\,\\mathrm{kg}$・$8\\,\\mathrm{N/m}$・振幅 $0.1\\,\\mathrm{m}$ → $0.1\\times4=0.4\\,\\mathrm{m/s}$', '$x=0.06$ → $4\\sqrt{0.01-0.0036}=4\\times0.08=0.32\\,\\mathrm{m/s}$', '（6・8・10 の直角三角形の組）'],
    why: 'はし（$x=\\pm X$）では速さ0なので、エネルギーの合計は $\\frac{1}{2}kX^2$。どこでも「ばねのエネルギー＋運動エネルギー」はこの合計のまま（6-6⑥）。だから $\\frac{1}{2}mv^2=\\frac{1}{2}k(X^2-x^2)$、$v=\\sqrt{\\frac{k}{m}}\\sqrt{X^2-x^2}=\\omega_{\\mathrm n}\\sqrt{X^2-x^2}$。まん中（$x=0$）では $X\\omega_{\\mathrm n}$。',
    caution: '$\\sqrt{X^2-x^2}$ を $X-x$ としない。$X$ と $x$ の単位をそろえる（cm なら m に）。左側（$x$ が負）でも、2乗するので同じ速さ。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /振幅|引いてはなした|エネルギーの合計/.test(q) && /速さ/.test(ask(q)) && !/ダンパー|コイル|コンデンサー|はじめの速度|v_0/.test(q); },
    steps: {
      // いちばん速い所
      s1(r) {
        const sp = r.pick(SP37), X = r.pick([0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3]), v = X * sp.w;
        if (sp.w === 4 && X === 0.1) return null;   // 楽な形の例の答え 0.4
        return { q: cartMK(sp.m, sp.k) + `振幅 ${U(X, 'm')} でゆれている。いちばん速い所の速さは □ m/s`, a: `$${fmt(v)}$`, key: `v${sp.m},${sp.k}`,
          easy: `$\\omega_{\\mathrm n}=\\sqrt{${sp.w * sp.w}}=${sp.w}$、$${X}\\times${sp.w}=${fmt(v)}$`, easyCheck: 'last', verify: p => valIs(p.a, Math.sqrt(2 * (0.5 * sp.k * X * X) / sp.m)) };
      },
      // x を通るときの速さ（直角三角形の3辺）
      s2(r) {
        const sp = r.pick(SP37), [Xc, xc, vc] = r.pick(TRI), u = Xc <= 13 ? r.pick([0.01, 0.02]) : 0.01, sg = r.chance(0.3) ? -1 : 1;
        const X = +fmt(Xc * u), x = +fmt(sg * xc * u), v = +fmt(sp.w * vc * u);
        if (X === 0.1 && Math.abs(x) === 0.06) return null;   // 楽な形の例
        return { q: cartMK(sp.m, sp.k) + `振幅 ${U(X, 'm')} でゆれている。$x=${fmt(x)}\\,\\mathrm{m}$ を通るときの速さは □ m/s`, a: `$${fmt(v)}$`, key: `v${sp.m},${sp.k}`, easyCheck: false,
          easy: `$${sp.w}\\sqrt{${fmt(X * X)}-${fmt(x * x)}}=${sp.w}\\times${fmt(vc * u)}=${fmt(v)}$`,
          verify: p => valIs(p.a, Math.sqrt((sp.k * X * X - sp.k * x * x) / sp.m)) };
      },
      // 見かけがちがう：cm、g、エネルギーの合計から
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const [m, v] = r.pick([[2, 1], [0.5, 2], [4, 0.5], [0.2, 3], [1, 0.6], [0.5, 0.6], [2, 0.3], [0.1, 2], [8, 0.5]]), E = +fmt(m * v * v / 2);
          return { q: `質量 ${U(m, 'kg')} のおもりが、ばねにつながれてゆれている。ばねのエネルギーと運動エネルギーの合計は ${U(E, 'J')}。いちばん速い所の速さは □ m/s`, a: `$${fmt(v)}$`, key: `e${m},${E}`,
            easy: `まん中ではすべて運動エネルギー：$\\frac{1}{2}\\times${m}\\times v^{2}=${E}$、$v^{2}=${fmt(v * v)}$`, easyCheck: false, verify: p => valIs(p.a, Math.sqrt(2 * E / m)) };
        }
        const sp = r.pick(SP37);
        if (kind === 0) {
          const [Xc, xc, vc] = r.pick(TRI.filter(t => t[0] <= 13)), v = +fmt(sp.w * vc / 100);
          if (Xc === 10 && xc === 6) return null;
          return { q: cartMK(sp.m, sp.k) + `振幅 ${U(Xc, 'cm')} でゆれている。まん中から ${U(xc, 'cm')} の所を通るときの速さは □ m/s`, a: `$${fmt(v)}$`, key: `v${sp.m},${sp.k}`, easyCheck: false,
            easy: `$${Xc}\\,\\mathrm{cm}=${fmt(Xc / 100)}\\,\\mathrm{m}$、$${sp.w}\\sqrt{${fmt(Xc * Xc / 1e4)}-${fmt(xc * xc / 1e4)}}=${fmt(v)}$`,
            verify: p => valIs(p.a, Math.sqrt(sp.k / sp.m) * Math.sqrt((Xc / 100) ** 2 - (xc / 100) ** 2)) };
        }
        if (sp.m >= 1) return null;
        const X = r.pick([0.02, 0.05, 0.1, 0.2]), v = X * sp.w;
        if (sp.w === 4 && X === 0.1) return null;
        return { q: cartMK(sp.m, sp.k, U(fmt(sp.m * 1000), 'g')) + `振幅 ${U(X, 'm')} でゆれている。いちばん速い所の速さは □ m/s`, a: `$${fmt(v)}$`, key: `v${sp.m},${sp.k}`, easyCheck: false,
          easy: `$${fmt(sp.m * 1000)}\\,\\mathrm{g}=${sp.m}\\,\\mathrm{kg}$、$\\omega_{\\mathrm n}=${sp.w}$、$${X}\\times${sp.w}=${fmt(v)}$`, verify: p => valIs(p.a, X * Math.sqrt(sp.k / sp.m)) };
      },
      // わな：コイルとコンデンサーの電流（6-38）、振幅がわかっているときの周期（6-31）
      trap(r) {
        if (r.chance(0.5)) {
          const [Cu, Lm, s] = r.pick([[4, 10, 0.02], [9, 10, 0.03], [10, 1, 0.1], [2.5, 1, 0.05], [16, 10, 0.04], [0.4, 4, 0.01]]), V = r.pick([5, 10, 20, 50]);
          return dest({ key: '6-37trapA', q: `$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーを $${V}\\,\\mathrm{V}$ にためてから、$L=${Lm}\\,\\mathrm{mH}$ のコイルにつなぎかえた。電流のいちばん大きい値は □ A`, a: `$${fmt(V * s)}$`,
            verify: p => valIs(p.a, V * Math.sqrt(Cu / 1e6 / (Lm / 1000))) }, '6-37', `ばねではなく電気。同じ考えで $\\frac{1}{2}CV^{2}=\\frac{1}{2}Li^{2}$`, ['6-38']);
        }
        const sp = r.pick(SP37.filter(x => x.w !== 2 && x.w !== 4)), X = r.pick([0.05, 0.1, 0.2]), g = apx(PI2 / sp.w, 2 * Math.PI / sp.w, 2);
        if (!g) return null;
        return dest({ key: '6-37trapB', q: cartMK(sp.m, sp.k) + `振幅 ${U(X, 'm')} でゆれている。周期は約 □ 秒（${piT}${g.note}）`, a: `$${g.ans}$`,
          verify: p => apxIs(p.a, 2 * PI * Math.sqrt(sp.m / sp.k), 2 * Math.PI * Math.sqrt(sp.m / sp.k)) }, '6-37', '速さではなく周期。周期は振幅によらない', ['6-31']);
      },
    },
  });

  // ================================================================ 6-38
  // コンデンサー（μF）とコイル（mH）：√(C/L) が小数第3位までの数
  const CLS = (() => {
    const out = [];
    for (const Cu of [0.1, 0.4, 1, 2, 2.5, 4, 5, 8, 9, 10, 16, 20, 25, 40, 50, 100]) for (const Lm of [1, 2, 4, 5, 10, 20, 25, 40, 50, 100]) {
      const s = Math.sqrt(Cu / Lm / 1000);
      if (isDec(s, 3) && s >= 0.005 && !(Cu === 1 && Lm === 10) && !(Cu === 8 && Lm === 20)) out.push({ Cu, Lm, s: +fmt(s) });
    }
    return out;
  })();
  const chHead = (Cu, V, Lm, LT) => `$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーを $${V}\\,\\mathrm{V}$ にためてから、${LT || `$L=${Lm}\\,\\mathrm{mH}$`} のコイルにつなぎかえた。`;
  M.add({
    id: '6-38', part: 3, chap: '6-6⑧・例題8・6-15⑤', stars: 1,
    title: 'LC の電流のいちばん大きい値：$\\frac{1}{2}CV^2=\\frac{1}{2}Li^2$ から $i=V\\sqrt{\\frac{C}{L}}$',
    mark: '「□ V にためてから、コイルにつなぎかえた」と「電流のいちばん大きい値」。',
    futsu: ['$\\frac{1}{2}CV^2$ を小数で計算し、', '$\\frac{1}{2}Li^2$ とおいて $i^2$ を出してから $\\sqrt{\\phantom{i}}$ をとる。'],
    raku: ['$1\\,\\mathrm{\\mu F}$・$10\\,\\mathrm{V}$・$10\\,\\mathrm{mH}$', '→ $10\\sqrt{\\frac{10^{-6}}{10^{-2}}}=10\\sqrt{10^{-4}}=0.1\\,\\mathrm{A}$', '$8\\,\\mathrm{\\mu F}$・$5\\,\\mathrm{V}$・$20\\,\\mathrm{mH}$ → $5\\sqrt{4\\times10^{-4}}=0.1\\,\\mathrm{A}$'],
    why: 'コンデンサーが空になる瞬間は、エネルギーがすべてコイルに移っていて、電流がいちばん大きい（ばねのまん中と同じ。6-6⑧）。$\\frac{1}{2}CV^2=\\frac{1}{2}Li^2$ の両辺を2倍して $L$ でわると $i^2=\\frac{C}{L}V^2$。$\\frac{1}{2}$ は両辺にあるので、エネルギーを計算しなくてよい。',
    caution: 'μF・mH を直してから $\\frac{C}{L}$ を作る。$\\sqrt{\\frac{L}{C}}$ と逆にしない（$C$ が大きいほど、電流は大きい）。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /コンデンサー/.test(q) && /ためて|ためた/.test(q) && /電流|エネルギー|電圧|ためる/.test(ask(q)) && !/抵抗|\\Omega|周期|振動数/.test(q); },
    steps: {
      // 電流のいちばん大きい値
      s1(r) {
        const o = r.pick(CLS), V = r.pick([5, 10, 20, 4, 6, 8, 12, 15, 30, 50, 100]), i = V * o.s;
        if (!isDec(i, 4) || i > 20) return null;
        return { q: chHead(o.Cu, V, o.Lm) + '電流のいちばん大きい値は □ A', a: `$${fmt(i)}$`, key: `${o.Cu},${o.Lm}`, easyCheck: false,
          easy: `$\\frac{C}{L}=\\frac{${o.Cu}\\times10^{-6}}{${o.Lm}\\times10^{-3}}=${fmt(o.s * o.s)}$、$${V}\\sqrt{${fmt(o.s * o.s)}}=${V}\\times${o.s}=${fmt(i)}$`,
          verify: p => valIs(p.a, Math.sqrt(2 * (0.5 * o.Cu * 1e-6 * V * V) / (o.Lm * 1e-3))) };
      },
      // ためたエネルギー（μJ）・V・C・L を n 倍
      s2(r) {
        if (r.chance(0.45)) {
          const Cu = r.pick([1, 2, 4, 5, 8, 10, 20, 0.5]), V = r.pick([2, 3, 4, 5, 6, 10, 20]), E = 0.5 * Cu * V * V;
          if (Cu === 1 && V === 10) return null;   // 楽な形の例（50 μJ）
          return { q: `$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーを $${V}\\,\\mathrm{V}$ にためた。コンデンサーにたまったエネルギーは □ $\\mathrm{${MU}J}$`, a: `$${fmt(E)}$`, key: `e${Cu},${V}`, easyCheck: false,
            easy: `$\\frac{1}{2}\\times${Cu}\\times${V}^{2}=${fmt(E)}$（μ はそのまま）`, verify: p => valIs(p.a, 0.5 * Cu * 1e-6 * V * V * 1e6) };
        }
        const kind = r.int(0, 2), n = kind === 0 ? r.pick([2, 3, 0.5]) : r.pick([4, 9, 0.25, 16]);
        const f = kind === 0 ? n : kind === 1 ? Math.sqrt(n) : 1 / Math.sqrt(n), fT = f >= 1 ? fmt(f) : `\\frac{1}{${fmt(1 / f)}}`;
        const what = ['ためる電圧を', 'コンデンサーを、$C$ が', 'コイルを、$L$ が'][kind];
        return { q: `コンデンサーをためてからコイルにつなぎかえる回路で、${what} ${times(n)}${kind ? 'のものにする' : 'にする'}と、電流のいちばん大きい値は □ 倍`, a: `$${fT}$`, key: `r${kind},${n}`, easyCheck: false,
          easy: `$i=V\\sqrt{\\frac{C}{L}}$ → $${fT}$ 倍`, verify: p => valIs(p.a, f) };
      },
      // 見かけがちがう：L が H、ほしい電流にする電圧、エネルギーから
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const [Lm, i] = r.pick([[20, 0.1], [4, 0.2], [50, 0.02], [100, 0.1], [40, 0.05], [1, 1], [10, 0.2], [25, 0.04]]), E = +fmt(0.5 * Lm * 1e-3 * i * i * 1e6);
          return { q: `コンデンサーに $${E}\\,\\mathrm{${MU}J}$ のエネルギーをためてから、$L=${Lm}\\,\\mathrm{mH}$ のコイルにつなぎかえた。電流のいちばん大きい値は □ A`, a: `$${fmt(i)}$`, key: `q${E},${Lm}`, easyCheck: false,
            easy: `$\\frac{1}{2}\\times${Lm}\\times10^{-3}\\times i^{2}=${E}\\times10^{-6}$、$i^{2}=${fmt(i * i)}$`, verify: p => valIs(p.a, Math.sqrt(2 * E * 1e-6 / (Lm * 1e-3))) };
        }
        const o = r.pick(CLS);
        if (kind === 0) {
          const V = r.pick([5, 10, 20, 50, 100]), i = V * o.s;
          if (o.Lm < 100 || !isDec(i, 4)) return null;
          return { q: chHead(o.Cu, V, o.Lm, `$L=${fmt(o.Lm / 1000)}\\,\\mathrm{H}$`) + '電流のいちばん大きい値は □ A', a: `$${fmt(i)}$`, key: `${o.Cu},${o.Lm}`, easyCheck: false,
            easy: `$\\frac{C}{L}=\\frac{${o.Cu}\\times10^{-6}}{${fmt(o.Lm / 1000)}}=${fmt(o.s * o.s)}$、$${V}\\times${o.s}=${fmt(i)}$`, verify: p => valIs(p.a, V * Math.sqrt(o.Cu * 1e-6 / (o.Lm * 1e-3))) };
        }
        const i = r.pick([0.1, 0.2, 0.5, 1, 0.05]), V = i / o.s;
        if (!isDec(V, 1) || V > 200 || V < 1) return null;
        return { q: `$C=${o.Cu}\\,\\mathrm{${MU}F}$ のコンデンサーをためてから $L=${o.Lm}\\,\\mathrm{mH}$ のコイルにつなぎかえ、電流のいちばん大きい値を ${U(i, 'A')} にしたい。はじめに □ V にためる`, a: `$${fmt(V)}$`, key: `${o.Cu},${o.Lm}`, easyCheck: false,
          easy: `$\\sqrt{\\frac{C}{L}}=${o.s}$、$V=\\frac{${i}}{${o.s}}=${fmt(V)}$`, verify: p => valIs(p.a, i * Math.sqrt(o.Lm * 1e-3 / (o.Cu * 1e-6))) };
      },
      // わな：周期（6-35）、ばねの速さ（6-37）
      trap(r) {
        if (r.chance(0.5)) {
          const o = r.pick(LCS.filter(x => x.w >= 1000 && x.w <= 20000)), vG = 6280 / o.w, g = apx(vG, 2000 * Math.PI / o.w, 3);
          if (!g) return null;
          return dest({ key: '6-38trapA', q: `$C=${o.Cu}\\,\\mathrm{${MU}F}$ のコンデンサーと $L=${o.Lm}\\,\\mathrm{mH}$ のコイルをつないだ回路の、電気のゆれの周期は約 □ ms（${piT}${g.note}）`, a: `$${g.ans}$`,
            verify: p => apxIs(p.a, 2 * PI * Math.sqrt(o.Lm * 1e-3 * o.Cu * 1e-6) * 1000, 2 * Math.PI * Math.sqrt(o.Lm * 1e-3 * o.Cu * 1e-6) * 1000) }, '6-38', `電流ではなく周期。$2\\pi\\sqrt{LC}$`, ['6-35']);
        }
        const sp = r.pick(SP37), X = r.pick([0.05, 0.1, 0.2]);
        if (sp.w === 4 && X === 0.1) return null;
        return dest({ key: '6-38trapB', q: cartMK(sp.m, sp.k) + `振幅 ${U(X, 'm')} でゆれている。いちばん速い所の速さは □ m/s`, a: `$${fmt(X * sp.w)}$`,
          verify: p => valIs(p.a, X * Math.sqrt(sp.k / sp.m)) }, '6-38', `電気ではなく、ばね。同じエネルギーの考えで $X\\omega_{\\mathrm n}$`, ['6-37']);
      },
    },
  });

  // ================================================================ 6-39
  // 加速度 a=(-kx-cv)/m が、小数第3位までのきれいな数になる組
  function damp(r, ms, ks, cs, xs, vs) {
    const m = r.pick(ms), k = r.pick(ks), c = r.pick(cs), x = r.pick(xs) * (r.chance(0.5) ? 1 : -1), v = r.pick(vs) * (r.chance(0.5) ? 1 : -1);
    const Fs = +fmt(-k * x), Fd = +fmt(-c * v), a = +fmt((Fs + Fd) / m);
    if (!isDec(a, 3) || Math.abs(a) < 0.01 || Math.abs(Fs) < 1e-9) return null;
    return { m, k, c, x, v, Fs, Fd, a };
  }
  const dKey = o => `${o.m},${o.k},${o.c},${o.x},${o.v}`;
  const dEasy = o => `ばね $${fmt(o.Fs)}$、ダンパー $${fmt(o.Fd)}$、合計 $${fmt(o.Fs + o.Fd)}$ → $\\frac{${fmt(o.Fs + o.Fd)}}{${o.m}}=${fmt(o.a)}$`;
  const dVer = o => p => valIs(p.a, (-o.c * o.v - o.k * o.x) / o.m);
  const side = (v, pos, neg) => (v > 0 ? pos : neg);
  M.add({
    id: '6-39', part: 3, chap: '6-7②・例題1', stars: 1,
    title: 'ダンパーつきの加速度：$\\ddot x=\\frac{-kx-c\\dot x}{m}$（ばねの力は位置と、ダンパーの力は速度と反対向き。1つずつ符号をつける）',
    mark: 'ばね定数・減衰係数と、ある位置・速度のときの「加速度」。',
    futsu: ['ばねの力とダンパーの力の向きを、図をかいて', '1つずつ考えてから、大きさをたし引きする。'],
    raku: ['$300\\,\\mathrm{kg}$・$30000\\,\\mathrm{N/m}$・$1800\\,\\mathrm{N\\cdot s/m}$', '上へ $0.02\\,\\mathrm{m}$ を下向き $0.5\\,\\mathrm{m/s}$ → ばね $-600$、ダンパー $+900$', '→ $\\frac{300}{300}=1$（上向きに $1\\,\\mathrm{m/s^2}$）'],
    why: 'ばねの力は $-kx$（ずれと反対向き）、ダンパーの力は $-c\\dot x$（速度と反対向き。6-7①）。$m\\ddot x=-kx-c\\dot x$ の両辺を $m$ でわれば加速度（6-7②）。$x$ と $\\dot x$ に符号つきの数を入れれば、向きは式が決めてくれる。',
    caution: 'ダンパーの力を、位置と反対向きにしない（はしで止まっているときは0）。左向き・下向きの速度は、負の数で入れる。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /ダンパー|減衰係数|N\\cdot s\/m/.test(q) && /加速度/.test(ask(q)) && !/オイラー|コイル/.test(q); },
    steps: {
      // 符号つきの x・ẋ
      s1(r) {
        const o = damp(r, [0.5, 1, 2, 4, 5, 10], [8, 10, 20, 40, 50, 100, 200], [0.4, 1, 2, 4, 5, 10], [0.02, 0.05, 0.1, 0.2], [0.1, 0.2, 0.5, 1]);
        if (!o || (o.m === 0.5 && o.k === 8 && o.c === 0.4)) return null;
        return { q: `ダンパーつきの台車（$m=${o.m}\\,\\mathrm{kg}$、$k=${o.k}\\,\\mathrm{N/m}$、$c=${o.c}\\,\\mathrm{N\\cdot s/m}$）が、$x=${fmt(o.x)}\\,\\mathrm{m}$ の所を、速度 $\\dot x=${fmt(o.v)}\\,\\mathrm{m/s}$ で動いている（右向きが正）。加速度 $\\ddot x=□\\,\\mathrm{m/s^2}$`,
          a: `$${fmt(o.a)}$`, key: dKey(o), easy: dEasy(o), easyCheck: false, verify: dVer(o) };
      },
      // ことばの向き（右へ・左へ、右向き・左向き）
      s2(r) {
        const o = damp(r, [0.5, 1, 2, 4, 5], [8, 10, 20, 40, 50, 100], [0.4, 1, 2, 4, 5, 10], [0.02, 0.05, 0.1, 0.2], [0.1, 0.2, 0.5, 1]);
        if (!o || (o.m === 2 && o.k === 50 && o.c === 4)) return null;
        return { q: `ダンパーつきの台車（$m=${o.m}\\,\\mathrm{kg}$、$k=${o.k}\\,\\mathrm{N/m}$、$c=${o.c}\\,\\mathrm{N\\cdot s/m}$）が、つり合いの位置から${side(o.x, '右', '左')}へ ${U(Math.abs(o.x), 'm')} の所を、${side(o.v, '右', '左')}向きに ${U(Math.abs(o.v), 'm/s')} で動いている。加速度 $\\ddot x=□\\,\\mathrm{m/s^2}$（右向きが正）`,
          a: `$${fmt(o.a)}$`, key: dKey(o), easy: `$x=${fmt(o.x)}$、$\\dot x=${fmt(o.v)}$。` + dEasy(o), easyCheck: false, verify: dVer(o) };
      },
      // 見かけがちがう：車（上向きが正）、加速度が0になる速度
      s3(r) {
        if (r.chance(0.6)) {
          const o = damp(r, [200, 250, 300, 400, 500], [20000, 25000, 30000, 40000], [1000, 1200, 1500, 1800, 2000, 2400, 3000], [0.01, 0.02, 0.03, 0.05], [0.2, 0.4, 0.5, 1]);
          if (!o || (o.m === 300 && o.k === 30000 && o.c === 1800 && o.x === 0.02 && o.v === -0.5) || !isDec(o.a, 2)) return null;
          return { q: `車の1つのタイヤに車体の ${U(o.m, 'kg')}（ばね定数 ${U(o.k, 'N/m')}、減衰係数 ${U(o.c, 'N\\cdot s/m')}）。車体がつり合いの位置から${side(o.x, '上', '下')}へ ${U(Math.abs(o.x), 'm')} の所を、${side(o.v, '上', '下')}向きに ${U(Math.abs(o.v), 'm/s')} で動いている。加速度 $\\ddot x=□\\,\\mathrm{m/s^2}$（上向きが正）`,
            a: `$${fmt(o.a)}$`, key: dKey(o), easy: `$x=${fmt(o.x)}$、$\\dot x=${fmt(o.v)}$。` + dEasy(o), easyCheck: false, verify: dVer(o) };
        }
        const m = r.pick([0.5, 1, 2, 4]), k = r.pick([8, 10, 20, 40, 50, 100]), c = r.pick([0.4, 1, 2, 4, 5, 10]), x = r.pick([0.02, 0.05, 0.1, -0.05, -0.1]), v = +fmt(-k * x / c);
        if (!isDec(v, 3) || Math.abs(v) > 5) return null;
        return { q: `質量 ${U(m, 'kg')}、ばね定数 ${U(k, 'N/m')}、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーつきの台車が、$x=${fmt(x)}\\,\\mathrm{m}$ の所を通る。この瞬間の加速度が0になるのは、速度 $\\dot x=□\\,\\mathrm{m/s}$ のとき（右向きが正）`,
          a: `$${fmt(v)}$`, key: `${m},${k},${c},${x},${v}`, easy: `$-${k}\\times(${fmt(x)})-${c}\\dot x=0$ → $\\dot x=${fmt(v)}$`, easyCheck: false, verify: p => Math.abs(-k * x - c * numOf(p.a)) < 1e-9 || 'ちがう' };
      },
      // わな：オイラー法で2歩（6-11）、減衰比（6-41）
      trap(r) {
        if (r.chance(0.5)) {
          const [m, k] = r.pick([[0.5, 8], [1, 16], [2, 32], [1, 36]]), c = r.pick([1, 2, 4, 0.8]), dt = 0.05;
          if (m === 0.5 && k === 8 && (c === 2 || c === 4)) return null;   // 教科書の例題・問題と同じ数は出さない
          let x = 0.1, v = 0;
          for (let s = 0; s < 2; s++) { const a = (-k * x - c * v) / m; v = v + a * dt; x = x + v * dt; }
          if ([0.08832, 0.08896, 0.08976].includes(+fmt(x)) || decs(x) > 6) return null;   // 教科書の答えと同じ値・長い小数は出さない
          return dest({ key: '6-39trapA', q: `ダンパーつきの台車（$m=${m}\\,\\mathrm{kg}$、$k=${k}\\,\\mathrm{N/m}$、$c=${c}\\,\\mathrm{N\\cdot s/m}$）を、$x=0.1$、$\\dot x=0$ からはなす。$\\Delta t=0.05$ として、速度を先に進めるオイラー法で2歩進めると、0.1秒後の位置は $x=□\\,\\mathrm{m}$`, a: `$${fmt(x)}$`, boxw: '22mm',
            verify: p => { let X = 0.1, V = 0; for (const t of [0, 0.05]) { const A = -(k * X + c * V) / m; V += A * 0.05; X += V * 0.05; } return valIs(p.a, X); } }, '6-39', '加速度を1回出すだけではなく、表計算の2歩。加速度 → 新しい速度 → 新しい位置', ['6-11']);
        }
        const [m, k, c, z] = r.pick([[1, 25, 2, '0.2'], [2, 50, 4, '0.2'], [1, 100, 5, '0.25'], [4, 100, 8, '0.2'], [2, 8, 2, '0.25'], [0.5, 50, 1, '0.1']]);
        return dest({ key: '6-39trapB', q: `ダンパーつきの台車（$m=${m}\\,\\mathrm{kg}$、$k=${k}\\,\\mathrm{N/m}$、$c=${c}\\,\\mathrm{N\\cdot s/m}$）の、減衰比 $\\zeta=□$`, a: `$${z}$`,
          verify: p => valIs(p.a, c / (2 * Math.sqrt(m * k))) }, '6-39', '加速度ではなく減衰比。$c_{\\mathrm c}=2\\sqrt{mk}$ とくらべる', ['6-41']);
      },
    },
  });

  // ================================================================ 6-40
  // 前の山÷あとの山 R と、文に書く ln R の値（1.25 は楽な形の例なので使わない）
  const RAT = [[1.5, '0.405'], [2, '0.693'], [4, '1.386'], [3, '1.099'], [1.2, '0.182'], [1.6, '0.470'], [1.1, '0.0953']];
  // 山がはじめの 1/N より小さくなる周期の数：文の値でもほんとうの値でも同じ整数で、ちょうどの数の近くでないもの
  function nCyc(R, lnT, N) {
    const lnN = N === 10 ? LN10 : 2 * LN10, a = lnN / +lnT, b = Math.log(N) / Math.log(R);
    if (Math.ceil(a - 1e-9) !== Math.ceil(b - 1e-9) || Math.abs(a - Math.round(a)) < 0.03) return null;
    return { n: Math.ceil(a - 1e-9), q: a };
  }
  function peakPair(r) {
    const [R, lnT] = r.pick(RAT), b = r.pick([10, 15, 20, 25, 30, 40, 50, 60, 8, 12, 16, 5]), a = +fmt(b * R);
    if (!isDec(a, 1) || a > 120) return null;
    return { R, lnT, a, b };
  }
  // 図：減衰振動 A e^{-δt} cos 2πt（山と山の時間を1）、つつみ ±A e^{-δt}（点線）、はじめの2つの山の点と高さ
  function decayFig(o) {
    const A = o.a, d = Math.log(o.R), Gd = M.graph({ x0: 0, x1: 3.4, y0: -A, y1: A * 1.2, w: 9, h: 4.4 }), T = Gd.T;
    const its = [...Gd.axes({ x: 't', y: 'x', o: 'sw' }), ...Gd.plot(t => A * Math.exp(-d * t), 0, 3.3, { dash: true }), ...Gd.plot(t => -A * Math.exp(-d * t), 0, 3.3, { dash: true }),
      ...Gd.plot(t => A * Math.exp(-d * t) * Math.cos(2 * Math.PI * t), 0, 3.3, { n: 160, thick: true }), ['dot', T(0, A)], ['dot', T(1, A / o.R)],
      ['label', T(0, A), `$${fmt(o.a)}\\,\\mathrm{mm}$`, 'w'], ['label', T(1, A / o.R), `$${fmt(o.b)}\\,\\mathrm{mm}$`, 'ne']];
    return { s: 4, items: its };
  }
  M.add({
    id: '6-40', part: 3, chap: '6-7④・例題3', stars: 1,
    title: '対数減衰率：$\\delta=\\ln\\frac{\\text{前の山}}{\\text{あとの山}}$。はじめの $\\frac{1}{10}$ より小さくなるのは $n>\\frac{\\ln10}{\\delta}$ 周期あと（$n$ 周期で山は $r^n$ 倍）',
    mark: '山の高さが同じ割合でへる。「対数減衰率」「何周期あと」。',
    futsu: ['山の高さを1回ずつかけ算で出し（$20\\times0.8\\times0.8\\times\\cdots$）、', 'はじめの $\\frac{1}{10}$ より小さくなるまで数える。'],
    raku: ['$20\\,\\mathrm{mm}$ → $16\\,\\mathrm{mm}$ → $\\delta=\\ln1.25=0.223$', '$\\frac{2.30}{0.223}\\approx10.3$ → 11周期あと', '（$0.8^{11}\\approx0.086$）'],
    why: 'となりの山の比は一定（同じ割合でへる）。$n$ 周期あとの山は $r^n$ 倍で、対数をとると $n\\delta$ だけへる（6-7④）。はじめの $\\frac{1}{10}$ になるのは $n\\delta=\\ln10$ のとき。$n$ は整数なので、$\\frac{\\ln10}{\\delta}$ より大きい最初の整数。',
    caution: '$\\delta=\\ln\\frac{\\text{あとの山}}{\\text{前の山}}$ と逆にしない（負になる）。$\\frac{\\ln10}{\\delta}$ が10.3なら、10周期ではまだ $\\frac{1}{10}$ より大きいので、11周期。',
    counts: { s1: 5, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /山/.test(q) && /対数減衰率|周期あと/.test(ask(q)) && !/減衰比|熱|ダンパー|\\zeta/.test(q); },
    steps: {
      // 対数減衰率（山の高さ2つ・1回ごとに□倍）
      s1(r) {
        const o = peakPair(r); if (!o) return null;
        if (r.chance(0.6)) return { q: `ゆれの山の高さが ${U(o.a, 'mm')}、${U(o.b, 'mm')}、…と、同じ割合でへっていく。対数減衰率 $\\delta=□$（$\\ln${fmt(o.R)}=${o.lnT}$）`, a: `$${o.lnT}$`, key: `d${o.R}`,
          easy: `$\\delta=\\ln\\frac{${fmt(o.a)}}{${fmt(o.b)}}=\\ln${fmt(o.R)}=${o.lnT}$`, easyCheck: false, verify: p => (close(o.a / o.b, o.R) && Math.abs(Math.log(o.a / o.b) - numOf(p.a)) < 6e-4) || 'ちがう' };
        const rr = +fmt(1 / o.R);
        if (!isDec(rr, 2)) return null;
        return { q: `ゆれの山が、1回ごとに ${fmt(rr)}倍になっていく。対数減衰率 $\\delta=□$（$\\ln${fmt(o.R)}=${o.lnT}$）`, a: `$${o.lnT}$`, key: `d${o.R}`,
          easy: `前の山÷あとの山は $\\frac{1}{${fmt(rr)}}=${fmt(o.R)}$、$\\delta=${o.lnT}$`, easyCheck: false, verify: p => Math.abs(Math.log(1 / rr) - numOf(p.a)) < 6e-4 || 'ちがう' };
      },
      // n 周期あとの山・何周期あとに 1/10（1/100）より小さくなる
      s2(r) {
        if (r.chance(0.4)) {
          const [R, n] = r.pick([[2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [1.5, 2], [1.5, 3], [2, 5]]), b = r.pick([1, 2, 3, 4, 5]), a = +fmt(b * R ** n);
          if (a > 200 || !isDec(a, 1)) return null;
          return { q: `ゆれの山の高さが、1回ごとに $\\frac{1}{${fmt(R)}}$ 倍になる。はじめの山が ${U(a, 'mm')} のとき、${n}周期あとの山は □ mm`, a: `$${fmt(b)}$`, key: `h${R},${n}`,
            easy: `$${fmt(a)}\\times\\Bigl(\\frac{1}{${fmt(R)}}\\Bigr)^{${n}}=${fmt(b)}$`, easyCheck: false, verify: p => valIs(p.a, a * Math.pow(1 / R, n)) };
        }
        const o = peakPair(r); if (!o) return null;
        const N = r.chance(0.7) ? 10 : 100, c = nCyc(o.R, o.lnT, N); if (!c) return null;
        return { q: `ゆれの山の高さが ${U(o.a, 'mm')}、${U(o.b, 'mm')}、…と同じ割合でへる。山がはじめの $\\frac{1}{${N}}$ より小さくなるのは □ 周期あと（$\\ln${fmt(o.R)}=${o.lnT}$、$\\ln10=2.30$）`, a: `$${c.n}$`, key: `n${o.R},${N}`,
          easy: `$\\frac{${N === 10 ? '2.30' : '2\\times2.30'}}{${o.lnT}}\\approx${fmt(+c.q.toFixed(2))}$ → ${c.n}周期あと`, easyCheck: false,
          verify: p => { const n = numOf(p.a); return (o.a * Math.pow(o.b / o.a, n) < o.a / N && o.a * Math.pow(o.b / o.a, n - 1) >= o.a / N) || 'ちがう'; } };
      },
      // 図：はじめの2つの山の高さ
      s3(r) {
        const o = peakPair(r); if (!o || o.R === 1.1) return null;
        const fig = decayFig(o), head = '図のゆれで、';
        if (r.chance(0.5)) return { q: head + `はじめの2つの山の高さから、対数減衰率 $\\delta=□$（$\\ln${fmt(o.R)}=${o.lnT}$）`, a: `$${o.lnT}$`, key: `d${o.R}`, fig, easyCheck: false,
          easy: `$\\ln\\frac{${fmt(o.a)}}{${fmt(o.b)}}=\\ln${fmt(o.R)}=${o.lnT}$`, verify: p => Math.abs(Math.log(o.a / o.b) - numOf(p.a)) < 6e-4 || 'ちがう' };
        const c = nCyc(o.R, o.lnT, 10); if (!c) return null;
        return { q: head + `山がはじめの $\\frac{1}{10}$ より小さくなるのは □ 周期あと（$\\ln${fmt(o.R)}=${o.lnT}$、$\\ln10=2.30$）`, a: `$${c.n}$`, key: `n${o.R},10`, fig, easyCheck: false,
          easy: `$\\frac{2.30}{${o.lnT}}\\approx${fmt(+c.q.toFixed(2))}$ → ${c.n}周期あと`, verify: p => { const n = numOf(p.a); return (Math.pow(o.b / o.a, n) < 0.1 && Math.pow(o.b / o.a, n - 1) >= 0.1) || 'ちがう'; } };
      },
      // わな：へる速さ α からの時間（6-42）、熱に変わった割合（6-45）
      trap(r) {
        if (r.chance(0.5)) {
          const al = r.pick([0.5, 1, 2.5, 5, 0.2]), g = apx(LN10 / al, Math.LN10 / al, 2, true); if (!g) return null;
          return dest({ key: '6-40trapA', q: `ゆれのつつみが $e^{-${al}t}$（$t$ は秒）の形で小さくなる。つつみがはじめの $\\frac{1}{10}$ になるのは約 □ 秒後（$\\ln10=2.30$${g.note}）`, a: `$${g.ans}$`,
            verify: p => apxIs(p.a, LN10 / al, Math.LN10 / al) }, '6-40', '山の高さの比ではなく、へる速さ $\\alpha$ がわかっている。$\\frac{\\ln10}{\\alpha}$ 秒', ['6-42']);
        }
        const [X1, X2, pc] = r.pick([[0.1, 0.05, 75], [0.2, 0.12, 64], [0.1, 0.08, 36], [0.2, 0.18, 19], [0.1, 0.04, 84]]);
        return dest({ key: '6-40trapB', q: `ばねのおもりの山の高さが、${U(X1, 'm')} から1周期あとに ${U(X2, 'm')} になった。このあいだに熱に変わったエネルギーは、はじめのエネルギーの □ %`, a: `$${pc}$`,
          verify: p => valIs(p.a, 100 * (X1 * X1 - X2 * X2) / (X1 * X1)) }, '6-40', '対数減衰率ではなく、エネルギーの割合。エネルギーは山の高さの2乗に比例', ['6-45']);
      },
    },
  });

  // ================================================================ 6-41
  // 質量と ばね定数：mk が平方数（c_c=2√(mk) が整数）
  const MK = (() => {
    const out = [];
    for (const m of [0.25, 0.5, 1, 2, 4, 5, 10]) for (const k of [1, 2, 4, 8, 9, 16, 18, 25, 32, 36, 50, 64, 100, 200, 400]) if (isSq(m * k) && !(m === 0.5 && k === 8)) out.push({ m, k, cc: 2 * Math.round(Math.sqrt(m * k)) });
    return out;
  })();
  const CAR = (() => {
    const out = [];
    for (const m of [200, 250, 300, 400, 500]) for (const k of [20000, 25000, 30000, 40000, 45000, 50000, 80000]) if (isSq(m * k) && !(m === 300 && k === 30000)) out.push({ m, k, cc: 2 * Math.round(Math.sqrt(m * k)) });
    return out;
  })();
  const ZS = [0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2, 2.5];
  const STOP = z => (z < 1 ? 'ア' : z === 1 ? 'イ' : 'ウ');
  const STOPQ = '止まり方は（ア ゆれながら止まる　イ ちょうど（臨界）　ウ ゆれずにゆっくりもどる）のどれ';
  M.add({
    id: '6-41', part: 3, chap: '6-7⑤・例題4・5', stars: 1,
    title: '減衰比：$c_{\\mathrm c}=2\\sqrt{mk}$、$\\zeta=\\frac{c}{c_{\\mathrm c}}$（1より小さい：ゆれながら止まる、1：ちょうど、大きい：ゆっくりもどる）。逆に $c=\\zeta c_{\\mathrm c}$',
    mark: '質量・ばね定数・減衰係数と「減衰比」「止まり方」「ほしい減衰比にする $c$」。',
    futsu: ['表計算で $c$ を少しずつかえて動かし、', '行きすぎがなくなる境目をさがす。'],
    raku: ['$0.5\\,\\mathrm{kg}$・$8\\,\\mathrm{N/m}$ → $c_{\\mathrm c}=2\\sqrt{4}=4$', '$c=0.4$・4・10 → $\\zeta=0.1$・1・2.5', '車 $300\\,\\mathrm{kg}$・$30000\\,\\mathrm{N/m}$ → $c_{\\mathrm c}=6000$、$\\zeta=0.4$ なら $c=2400$'],
    why: '行きすぎがなくなる境目の減衰係数は $c_{\\mathrm c}=2\\sqrt{mk}$（6-7⑤）。$\\zeta=\\frac{c}{c_{\\mathrm c}}$ は単位のない数で、$\\zeta<1$ ならゆれながら止まり、$\\zeta=1$ ならちょうど（臨界）、$\\zeta>1$ ならゆれずにゆっくりもどる。ほしい $\\zeta$ にするには $c=\\zeta c_{\\mathrm c}$。山がへる速さは $\\alpha=\\frac{c}{2m}=\\zeta\\omega_{\\mathrm n}$。',
    caution: '2をかけ忘れて $c_{\\mathrm c}=\\sqrt{mk}$ としない。ブレーキが強いほど早く止まるのではない（$\\zeta$ が1の近くがいちばん早い）。荷物を積んで $m$ がふえると、同じダンパーでも $\\zeta$ は小さくなる。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /ダンパー|減衰係数/.test(q) && /ばね|N\/m/.test(q) && /減衰比|臨界減衰係数|減衰係数\s*\$?c=□|止まり方|山がへる速さ|\\zeta/.test(ask(q)) && !/抵抗|コイル|加速度|オイラー|山の高さ|山が1回/.test(q); },
    steps: {
      // 臨界減衰係数・減衰比
      s1(r) {
        const o = r.pick(MK);
        const head = `質量 ${U(o.m, 'kg')}、ばね定数 ${U(o.k, 'N/m')} のおもり`;
        if (r.chance(0.4)) return { q: head + `の、臨界減衰係数 $c_{\\mathrm c}=□\\,\\mathrm{N\\cdot s/m}$（ダンパーの境目の強さ）`, a: `$${o.cc}$`, key: `${o.m},${o.k}`,
          easy: `$2\\sqrt{${o.m}\\times${o.k}}=2\\sqrt{${fmt(o.m * o.k)}}=${o.cc}$` };
        const z = r.pick(ZS), c = +fmt(z * o.cc);
        if (!isDec(c, 2)) return null;
        return { q: head + `に、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーをつけた。減衰比 $\\zeta=□$`, a: `$${fmt(z)}$`, key: `${o.m},${o.k}`, easyCheck: false,
          easy: `$c_{\\mathrm c}=2\\sqrt{${fmt(o.m * o.k)}}=${o.cc}$、$\\zeta=\\frac{${fmt(c)}}{${o.cc}}=${fmt(z)}$`, verify: p => valIs(p.a, c / (2 * Math.sqrt(o.m * o.k))) };
      },
      // ほしい ζ にする c・山がへる速さ α・止まり方
      s2(r) {
        const o = r.pick(MK), kind = r.int(0, 2), z = r.pick(ZS), c = +fmt(z * o.cc);
        if (!isDec(c, 2)) return null;
        const head = `質量 ${U(o.m, 'kg')}、ばね定数 ${U(o.k, 'N/m')} のおもり`;
        if (kind === 0) return { q: head + `に、ダンパーをつけて減衰比を ${fmt(z)} にしたい。ダンパーの減衰係数 $c=□\\,\\mathrm{N\\cdot s/m}$`, a: `$${fmt(c)}$`, key: `${o.m},${o.k}`, easyCheck: false,
          easy: `$c_{\\mathrm c}=${o.cc}$、$c=${fmt(z)}\\times${o.cc}=${fmt(c)}$`, verify: p => valIs(p.a, z * 2 * Math.sqrt(o.m * o.k)) };
        if (kind === 1) {
          const al = c / (2 * o.m);
          if (!isDec(al, 3) || z >= 1) return null;
          return { q: head + `に、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーをつけた。山がへる速さ（$e^{-\\alpha t}$ の $\\alpha$）は $\\alpha=□\\,/\\mathrm{s}$`, a: `$${fmt(al)}$`, key: `${o.m},${o.k}`, easyCheck: false,
            easy: `$\\alpha=\\frac{c}{2m}=\\frac{${fmt(c)}}{${fmt(2 * o.m)}}=${fmt(al)}$`, verify: p => valIs(p.a, z * Math.sqrt(o.k / o.m)) };
        }
        return { q: head + `に、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーをつけた。${STOPQ}`, a: STOP(z), key: `${o.m},${o.k}`, boxw: '12mm', easyCheck: false,
          easy: `$\\zeta=\\frac{${fmt(c)}}{${o.cc}}=${fmt(z)}$ → ${STOP(z)}`, verify: p => p.a === STOP(c / (2 * Math.sqrt(o.m * o.k))) || 'ちがう' };
      },
      // 見かけがちがう：車、質量が g、荷物で質量が n 倍
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const o = r.pick(CAR), z = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), c = +fmt(z * o.cc);
          return { q: `車の1つのタイヤに、車体の ${U(o.m, 'kg')} がのっている。ばね定数は ${U(o.k, 'N/m')}。減衰比を ${fmt(z)} にするには、ダンパーの減衰係数 $c=□\\,\\mathrm{N\\cdot s/m}$`, a: `$${fmt(c)}$`, key: `${o.m},${o.k}`, easyCheck: false,
            easy: `$c_{\\mathrm c}=2\\sqrt{${fmt(o.m * o.k)}}=${o.cc}$、$c=${fmt(z)}\\times${o.cc}=${fmt(c)}$`, verify: p => valIs(p.a, z * 2 * Math.sqrt(o.m * o.k)) };
        }
        if (kind === 1) {
          const o = r.pick(MK.filter(x => x.m < 1)), z = r.pick(ZS), c = +fmt(z * o.cc);
          if (!isDec(c, 2)) return null;
          return { q: `質量 ${U(fmt(o.m * 1000), 'g')}、ばね定数 ${U(o.k, 'N/m')} のおもりに、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーをつけた。減衰比 $\\zeta=□$`, a: `$${fmt(z)}$`, key: `${o.m},${o.k}`, easyCheck: false,
            easy: `$${fmt(o.m * 1000)}\\,\\mathrm{g}=${o.m}\\,\\mathrm{kg}$、$c_{\\mathrm c}=${o.cc}$、$\\zeta=${fmt(z)}$`, verify: p => valIs(p.a, c / (2 * Math.sqrt(o.m * o.k))) };
        }
        const n = r.pick([4, 9, 0.25]), f = 1 / Math.sqrt(n);
        return { q: `ばね・質量・ダンパーで、ばねとダンパーはそのままで、質量だけが ${times(n)}になった。減衰比 $\\zeta$ は □ 倍`, a: `$${f >= 1 ? fmt(f) : `\\frac{1}{${fmt(1 / f)}}`}$`, key: `q${n}`, easyCheck: false,
          easy: `$c_{\\mathrm c}=2\\sqrt{mk}$ が $\\sqrt{${n >= 1 ? fmt(n) : `\\frac{1}{${fmt(1 / n)}}`}}$ 倍 → $\\zeta$ はその逆数倍`, verify: p => valIs(p.a, 1 / Math.sqrt(n)) };
      },
      // わな：RLC の減衰比（6-44）、山の比から減衰比（6-43）
      trap(r) {
        if (r.chance(0.5)) {
          const [Lm, Cu, Rc] = r.pick([[1, 10, 20], [4, 10, 40], [9, 10, 60], [25, 10, 100], [1, 0.1, 200], [16, 10, 80]]), z = r.pick([0.1, 0.25, 0.5, 2]), R = +fmt(z * Rc);
          return dest({ key: '6-41trapA', q: `$L=${Lm}\\,\\mathrm{mH}$ のコイル、$R=${R}\\,\\Omega$ の抵抗、$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーの回路の、減衰比 $\\zeta=□$`, a: `$${fmt(z)}$`,
            verify: p => valIs(p.a, R / (2 * Math.sqrt(Lm / 1000 / (Cu / 1e6)))) }, '6-41', `ばねではなく電気の回路。$m\\to L$、$c\\to R$、$k\\to\\frac{1}{C}$ で $R_{\\mathrm c}=2\\sqrt{\\frac{L}{C}}$`, ['6-44']);
        }
        const [rr, lnT] = r.pick([[0.95, '0.0513'], [0.85, '0.163'], [0.7, '0.357'], [0.92, '0.0834']]), g = apx(+lnT / PI2, Math.log(1 / rr) / (2 * Math.PI), 3);
        if (!g) return null;
        return dest({ key: '6-41trapB', q: `塔をゆらすと、ゆれの山が1回ごとに ${fmt(rr)}倍になった。減衰比 $\\zeta$ は約 □（$\\ln\\frac{1}{${fmt(rr)}}=${lnT}$、${piT}${g.note}）`, a: `$${g.ans}$`,
          verify: p => apxIs(p.a, +lnT / (2 * PI), Math.log(1 / rr) / (2 * Math.PI)) }, '6-41', '$m$・$k$・$c$ がわからない。山の比から $\\zeta\\approx\\frac{\\delta}{2\\pi}$', ['6-43']);
      },
    },
  });

  // ================================================================ 6-42
  const LNN = { 10: '2.30', 2: '0.693', 4: '1.386', 3: '1.099' };
  const lnNv = n => +LNN[n];
  M.add({
    id: '6-42', part: 3, chap: '6-7④・例題6', stars: 1,
    title: 'つつみ $e^{-\\alpha t}$ がはじめの $\\frac{1}{n}$ になる時間は $\\frac{\\ln n}{\\alpha}$（$\\alpha$ が半分なら2倍かかる）',
    mark: 'へる速さ $\\alpha$ と「ゆれ（つつみ）がはじめの $\\frac{1}{10}$ になるのは何秒後」。',
    futsu: ['$e^{-\\alpha t}$ に $t=1,\\ 2,\\ \\cdots$ を入れて、', '$\\frac{1}{10}$ より小さくなる時刻をさがす。'],
    raku: ['$\\alpha=4$ → $\\frac{2.30}{4}\\approx0.58$ 秒', '$\\alpha=2$ → $\\frac{2.30}{2}=1.15$ 秒（2倍）', '$\\frac{1}{100}$ は $\\frac{2\\times2.30}{\\alpha}$'],
    why: 'つつみは $X_0e^{-\\alpha t}$（6-7④）。$e^{-\\alpha t}=\\frac{1}{n}$ の両辺の自然対数をとると $-\\alpha t=-\\ln n$、$t=\\frac{\\ln n}{\\alpha}$。はじめの大きさ $X_0$ によらない。$\\frac{1}{100}=\\Bigl(\\frac{1}{10}\\Bigr)^2$ なので、$\\frac{1}{100}$ までは $\\frac{1}{10}$ までの2倍の時間。',
    caution: '$\\ln\\frac{1}{10}=-\\ln10$。$\\alpha$ がわからないときは $\\alpha=\\frac{c}{2m}$（2でわるのを忘れない）か $\\alpha=\\zeta\\omega_{\\mathrm n}$。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /つつみ/.test(q) && (/秒後|ms 後|倍/.test(ask(q)) || /\\alpha|へる速さ/.test(ask(q))) && !/山の高さ|山が1回|周期あと/.test(q); },
    steps: {
      // α から 1/n になる時間
      s1(r) {
        const al = r.pick([0.5, 1, 1.5, 2.5, 5, 0.2, 0.25, 0.4, 10, 20, 0.8]), n = r.pick([10, 10, 2, 4, 3]);
        const g = apx(lnNv(n) / al, Math.log(n) / al, 2, true); if (!g) return null;
        return { q: `へる速さ $\\alpha=${al}\\,/\\mathrm{s}$ のゆれ。つつみ（$e^{-\\alpha t}$ の形）がはじめの $\\frac{1}{${n}}$ になるのは約 □ 秒後（$\\ln${n}=${LNN[n]}$${g.note}）`, a: `$${g.ans}$`, key: `a${al},${n}`, easyCheck: false,
          easy: `$t=\\frac{${LNN[n]}}{${al}}${tail(g, lnNv(n) / al)}$`, verify: p => apxIs(p.a, lnNv(n) / al, Math.log(n) / al) };
      },
      // α=c/2m から・1/100・α が n 倍なら
      s2(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const n = r.pick([2, 3, 0.5, 4]);
          return { q: `ゆれのへる速さ $\\alpha$ が ${times(n)}になると、つつみがはじめの $\\frac{1}{10}$ になるまでの時間は □ 倍`, a: `$${n >= 1 ? `\\frac{1}{${fmt(n)}}` : fmt(1 / n)}$`, key: `r${n}`, easyCheck: false,
            easy: `時間は $\\frac{\\ln10}{\\alpha}$ なので、$\\alpha$ の逆数倍`, verify: p => valIs(p.a, 1 / n) };
        }
        if (kind === 1) {
          const al = r.pick([0.5, 1, 2.5, 5, 0.25, 10]), g = apx(2 * LN10 / al, Math.log(100) / al, 2, true); if (!g) return null;
          return { q: `へる速さ $\\alpha=${al}\\,/\\mathrm{s}$ のゆれ。つつみがはじめの $\\frac{1}{100}$ になるのは約 □ 秒後（$\\ln10=2.30$${g.note}）`, a: `$${g.ans}$`, key: `a${al},100`, easyCheck: false,
            easy: `$\\frac{1}{100}=\\Bigl(\\frac{1}{10}\\Bigr)^{2}$ → $\\frac{2\\times2.30}{${al}}${tail(g, 2 * LN10 / al)}$`, verify: p => apxIs(p.a, 2 * LN10 / al, Math.log(100) / al) };
        }
        const m = r.pick([0.5, 1, 2, 4]), c = r.pick([0.4, 1, 2, 4, 5]), al = +fmt(c / (2 * m)), g = apx(LN10 / al, Math.LN10 / al, 2, true);
        if (!g || al === 4 || al === 2) return null;
        return { q: `質量 ${U(m, 'kg')} の台車に、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーをつけた（ゆれながら止まる）。つつみがはじめの $\\frac{1}{10}$ になるのは約 □ 秒後（$\\ln10=2.30$${g.note}）`, a: `$${g.ans}$`, key: `a${al},10`, easyCheck: false,
          easy: `$\\alpha=\\frac{${c}}{2\\times${m}}=${fmt(al)}$、$\\frac{2.30}{${fmt(al)}}${tail(g, LN10 / al)}$`, verify: p => apxIs(p.a, LN10 * 2 * m / c, Math.LN10 * 2 * m / c) };
      },
      // 見かけがちがう：ζ と ω_n から、RLC 回路（ms）、時間から α
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const [z, w] = r.pick([[0.1, 10], [0.05, 20], [0.2, 5], [0.1, 5], [0.25, 4], [0.05, 10], [0.5, 10]]), al = +fmt(z * w), g = apx(LN10 / al, Math.LN10 / al, 2, true);
          if (!g || al === 4 || al === 2) return null;
          return { q: `減衰比 $\\zeta=${z}$、固有角振動数 $\\omega_{\\mathrm n}=${w}\\,\\mathrm{rad/s}$ のゆれ。つつみがはじめの $\\frac{1}{10}$ になるのは約 □ 秒後（$\\ln10=2.30$${g.note}）`, a: `$${g.ans}$`, key: `a${al},10`, easyCheck: false,
            easy: `$\\alpha=\\zeta\\omega_{\\mathrm n}=${fmt(al)}$、$\\frac{2.30}{${fmt(al)}}${tail(g, LN10 / al)}$`, verify: p => apxIs(p.a, LN10 / (z * w), Math.LN10 / (z * w)) };
        }
        if (kind === 1) {
          const [Lm, R] = r.pick([[10, 20], [10, 40], [5, 20], [20, 20], [1, 10], [4, 20], [50, 50]]), al = R / (2 * Lm / 1000), tm = 1000 * LN10 / al, g = apx(tm, 1000 * Math.LN10 / al, 3, true);
          if (!g) return null;
          return { q: `$L=${Lm}\\,\\mathrm{mH}$ のコイルと $R=${R}\\,\\Omega$ の抵抗が入った、ゆれながら止まる回路。つつみのへる速さは $\\alpha=\\frac{R}{2L}$。つつみがはじめの $\\frac{1}{10}$ になるのは約 □ ms 後（$\\ln10=2.30$${g.note}）`, a: `$${g.ans}$`, key: `e${Lm},${R}`, easyCheck: false,
            easy: `$\\alpha=\\frac{${R}}{2\\times${fmt(Lm / 1000)}}=${fmt(al)}$、$\\frac{2.30}{${fmt(al)}}\\,\\mathrm{s}=${fmt(tm)}\\,\\mathrm{ms}$`, verify: p => apxIs(p.a, 1000 * LN10 * 2 * Lm / 1000 / R, 1000 * Math.LN10 * 2 * Lm / 1000 / R) };
        }
        const t = r.pick([0.5, 1, 2, 4, 5, 10, 0.25]), g = apx(LN10 / t, Math.LN10 / t, 2, true); if (!g) return null;
        return { q: `ゆれのつつみが、${fmt(t)}秒ではじめの $\\frac{1}{10}$ になった。へる速さ $\\alpha$ は約 □ /s（$\\ln10=2.30$${g.note}）`, a: `$${g.ans}$`, key: `t${t}`, easyCheck: false,
          easy: `$e^{-\\alpha\\times${fmt(t)}}=\\frac{1}{10}$ → $\\alpha=\\frac{2.30}{${fmt(t)}}${tail(g, LN10 / t)}$`, verify: p => apxIs(p.a, LN10 / t, Math.LN10 / t) };
      },
      // わな：山の比から何周期あと・何周期あとの山（6-40）
      trap(r) {
        if (r.chance(0.5)) {
          const [rr, R, lnT] = r.pick([[0.5, 2, '0.693'], [0.25, 4, '1.386'], [0.6, '\\frac{5}{3}', '0.511']]), Rv = 1 / rr, n = Math.ceil(LN10 / +lnT);
          return dest({ key: '6-42trapA', q: `ゆれの山が、1回ごとに ${fmt(rr)}倍になる。山がはじめの $\\frac{1}{10}$ より小さくなるのは □ 周期あと（$\\ln${R}=${lnT}$、$\\ln10=2.30$）`, a: `$${n}$`,
            verify: p => { const k = numOf(p.a); return (Math.pow(rr, k) < 0.1 && Math.pow(rr, k - 1) >= 0.1 && Math.ceil(Math.LN10 / Math.log(Rv)) === k) || 'ちがう'; } }, '6-42', '時間ではなく周期の数。山の比から対数減衰率', ['6-40']);
        }
        const [rr, n, a] = r.pick([[0.5, 3, 80], [0.5, 4, 48], [0.8, 2, 50], [0.6, 2, 50], [0.9, 2, 100]]);
        return dest({ key: '6-42trapB', q: `ゆれの山が、1回ごとに ${fmt(rr)}倍になる。はじめの山が ${U(a, 'mm')} のとき、${n}周期あとの山は □ mm`, a: `$${fmt(a * rr ** n)}$`,
          verify: p => valIs(p.a, a * Math.pow(rr, n)) }, '6-42', 'へる速さ $\\alpha$ ではなく、1回ごとの比がわかっている。$r^{n}$ 倍', ['6-40']);
      },
    },
  });

  // ================================================================ 6-43
  // 楽な形の終わり（長い小数を書かない）：そのままなら「=答え」、丸めたなら「≈答え」
  const ap = g => (g.exact ? '=' : '\\approx') + g.ans;
  // 1回ごとの山の比 r と、文に書く ln(1/r)、ln の分数（前の山÷あとの山を約分した形）。0.9・0.8 は楽な形の例なので使わない（O-2）
  const ZR = [[0.95, '0.0513', 20, 19], [0.85, '0.163', 20, 17], [0.92, '0.0834', 25, 23], [0.97, '0.0305', 100, 97], [0.98, '0.0202', 50, 49], [0.96, '0.0408', 25, 24], [0.75, '0.288', 4, 3], [0.7, '0.357', 10, 7]];
  // 減衰比 ζ から 1回ごとの山の比 e^{-2πζ}：文に書く値（π=3.14 で計算した値と、ほんとうの値が同じけたで同じもの）
  const ZE = [0.01, 0.02, 0.03, 0.04, 0.05].map(z => ({ z, x: +fmt(PI2 * z), e: rd(Math.exp(-PI2 * z), 3), ok: rd(Math.exp(-PI2 * z), 3) === rd(Math.exp(-2 * Math.PI * z / Math.sqrt(1 - z * z)), 3) })).filter(o => o.ok);
  M.add({
    id: '6-43', part: 3, chap: '6-7⑤・例題7', stars: 1,
    title: '山の比から減衰比：$\\zeta\\approx\\frac{\\delta}{2\\pi}$（$\\zeta$ が小さいとき。逆に $\\delta\\approx2\\pi\\zeta$）',
    mark: '「ゆれの山が1回ごとに□倍」「対数減衰率」と、減衰比の見積もり（$m$・$k$・$c$ はわからない）。',
    futsu: ['$m$・$k$・$c$ をはかって $\\zeta=\\frac{c}{2\\sqrt{mk}}$ を計算しようとする', '（ビルや橋では、$c$ がはかれない）。'],
    raku: ['山が1回ごとに $0.9$ 倍 → $\\delta=\\ln\\frac{1}{0.9}=0.105$', '→ $\\zeta\\approx\\frac{0.105}{6.28}\\approx0.017$', '$0.8$ 倍 → $\\frac{0.223}{6.28}\\approx0.036$'],
    why: '山がへる速さは $\\alpha=\\zeta\\omega_{\\mathrm n}$ で、$\\delta=\\alpha T_{\\mathrm d}$（6-7④）。$\\zeta$ が小さいと、山と山の時間 $T_{\\mathrm d}$ は $\\frac{2\\pi}{\\omega_{\\mathrm n}}$ とほぼ同じなので、$\\delta\\approx\\zeta\\omega_{\\mathrm n}\\times\\frac{2\\pi}{\\omega_{\\mathrm n}}=2\\pi\\zeta$（6-7⑤）。だから、山を2つはかれば $\\zeta\\approx\\frac{\\delta}{2\\pi}$ がわかる。',
    caution: '$\\delta$ は「前の山÷あとの山」（1より大きい）の対数。$2\\pi$ でわるのを忘れない。$\\zeta$ が0.1くらいより大きいと、この式はずれる（6-12の $\\omega_{\\mathrm d}=\\omega_{\\mathrm n}\\sqrt{1-\\zeta^2}$ を使う）。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (/ダンパー|減衰係数|N\/m|コイル|抵抗|熱|\\sqrt\{1-/.test(q)) return false;
      const zm = q.match(/\\zeta=([\d.]+)/);
      if (zm && +zm[1] >= 0.2) return false;   // ζ が小さくない
      const a = ask(q);
      if (/減衰比/.test(a)) return /山|対数減衰率|\\delta/.test(q);
      if (/対数減衰率/.test(a)) return /減衰比/.test(q);
      return /減衰比/.test(q) && /山は、?1回ごとに約?\s*□\s*倍/.test(a);
    },
    steps: {
      // 対数減衰率 δ から ζ・ζ から δ（δ=6.28ζ）
      s1(r) {
        if (r.chance(0.55)) {
          const z = r.pick([0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.08]), d = +fmt(PI2 * z), g = apx(z, d / (2 * Math.PI), 3);
          if (!g) return null;
          return { q: `対数減衰率 $\\delta=${fmt(d)}$ のゆれ（$\\zeta$ は小さい）。減衰比 $\\zeta$ は約 □（${piT}${g.note}）`, a: `$${g.ans}$`, key: `z${z}`, easyCheck: false,
            easy: `$\\zeta\\approx\\frac{\\delta}{2\\pi}=\\frac{${fmt(d)}}{6.28}${ap(g)}$`, verify: p => apxIs(p.a, d / (2 * PI), d / (2 * Math.PI)) };
        }
        const z = r.pick([0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05]), g = apx(PI2 * z, 2 * Math.PI * z, 4);
        if (!g) return null;
        return { q: `減衰比 $\\zeta=${z}$ のゆれ。対数減衰率 $\\delta$ は約 □（${piT}${g.note}）`, a: `$${g.ans}$`, key: `z${z}`, easyCheck: false,
          easy: `$\\delta\\approx2\\pi\\zeta=6.28\\times${z}${ap(g)}$`, verify: p => apxIs(p.a, 2 * PI * z, 2 * Math.PI * z) };
      },
      // 山の比（1回ごとに□倍・山の高さ2つ）から ζ
      s2(r) {
        const [rr, lnT, p0, q0] = r.pick(ZR), vG = +lnT / PI2, g = apx(vG, Math.log(1 / rr) / (2 * Math.PI), 3);
        if (!g) return null;
        const tl = `${piT}${g.note}`;
        if (r.chance(0.5)) return { q: `ゆれの山が、1回ごとに ${fmt(rr)}倍になる。減衰比 $\\zeta$ は約 □（$\\ln\\frac{1}{${fmt(rr)}}=${lnT}$、${tl}）`, a: `$${g.ans}$`, key: `d${rr}`, easyCheck: false,
          easy: `$\\delta=\\ln\\frac{1}{${fmt(rr)}}=${lnT}$、$\\zeta\\approx\\frac{${lnT}}{6.28}${ap(g)}$`, verify: p => apxIs(p.a, +lnT / (2 * PI), Math.log(1 / rr) / (2 * Math.PI)) };
        const u = r.pick([1, 2, 3, 4, 5]), a = p0 * u, b = q0 * u;
        if (a > 120 || a < 10) return null;
        return { q: `ゆれの山の高さが ${U(a, 'mm')}、${U(b, 'mm')}、…と、同じ割合でへる。減衰比 $\\zeta$ は約 □（$\\ln\\frac{${p0}}{${q0}}=${lnT}$、${tl}）`, a: `$${g.ans}$`, key: `d${rr}`, easyCheck: false,
          easy: `$\\delta=\\ln\\frac{${a}}{${b}}=\\ln\\frac{${p0}}{${q0}}=${lnT}$、$\\zeta\\approx\\frac{${lnT}}{6.28}${ap(g)}$`,
          verify: p => (close(a / b, p0 / q0) && apxIs(p.a, +lnT / (2 * PI), Math.log(a / b) / (2 * Math.PI))) };
      },
      // 見かけがちがう：何周期かのあいだの比、「□%ずつ小さくなる」、ζ から1回ごとの比
      s3(r) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const [R, lnT, n] = r.pick([[2, '0.693', 5], [2, '0.693', 4], [2, '0.693', 10], [10, '2.30', 10], [10, '2.30', 20], [4, '1.386', 10], [3, '1.099', 5]]);
          const d = +fmt(+lnT / n), g = apx(d / PI2, Math.log(R) / n / (2 * Math.PI), 3), b = r.pick([4, 5, 8, 10, 20]), a = b * R;
          if (!g || a > 100) return null;
          return { q: `塔をゆらすと、ゆれの山の高さが、${n}周期のあいだに ${U(a, 'mm')} から ${U(b, 'mm')} になった。減衰比 $\\zeta$ は約 □（$\\ln${R}=${lnT}$、${piT}${g.note}）`, a: `$${g.ans}$`, key: `n${R},${n}`, easyCheck: false,
            easy: `$${n}\\delta=\\ln${R}$ → $\\delta=\\frac{${lnT}}{${n}}=${fmt(d)}$、$\\zeta\\approx\\frac{${fmt(d)}}{6.28}${ap(g)}$`,
            verify: p => apxIs(p.a, +lnT / n / (2 * PI), Math.log(a / b) / n / (2 * Math.PI)) };
        }
        if (kind === 1) {
          const [pc, rr, lnT] = r.pick([[5, 0.95, '0.0513'], [2, 0.98, '0.0202'], [3, 0.97, '0.0305'], [4, 0.96, '0.0408'], [8, 0.92, '0.0834'], [15, 0.85, '0.163']]);
          const g = apx(+lnT / PI2, Math.log(1 / rr) / (2 * Math.PI), 3);
          if (!g) return null;
          return { q: `ビルのゆれの山が、1回ごとに ${pc}%ずつ小さくなる。減衰比 $\\zeta$ は約 □（$\\ln\\frac{1}{${fmt(rr)}}=${lnT}$、${piT}${g.note}）`, a: `$${g.ans}$`, key: `d${rr}`, easyCheck: false,
            easy: `1回ごとに $${fmt(rr)}$ 倍、$\\delta=${lnT}$、$\\zeta\\approx\\frac{${lnT}}{6.28}${ap(g)}$`,
            verify: p => apxIs(p.a, +lnT / (2 * PI), Math.log(100 / (100 - pc)) / (2 * Math.PI)) };
        }
        const o = r.pick(ZE);
        return { q: `減衰比 $\\zeta=${o.z}$ の塔をゆらす。ゆれの山は、1回ごとに約 □ 倍になる（${piT}、$e^{-${fmt(o.x)}}=${o.e}$）`, a: `$${o.e}$`, key: `z${o.z}`, easyCheck: false,
          easy: `$\\delta\\approx6.28\\times${o.z}=${fmt(o.x)}$、比は $e^{-\\delta}=${o.e}$`,
          verify: p => (strip(p.a) === rd(Math.exp(-2 * Math.PI * o.z / Math.sqrt(1 - o.z * o.z)), 3) && strip(p.a) === rd(Math.exp(-2 * PI * o.z), 3)) || 'ちがう' };
      },
      // わな：ζ が小さくない（6-80）、熱に変わった割合（6-45）
      trap(r) {
        if (r.chance(0.5)) {
          if (r.chance(0.4)) return dest({ key: '6-43trapA', q: `減衰比 $\\zeta=0.6$ の車をゆらす。ゆれの山は、1回ごとに約 □ 倍になる（$\\sqrt{1-0.6^{2}}=0.8$、$e^{-1.5\\pi}=0.009$）`, a: '$0.009$',
            verify: p => strip(p.a) === rd(Math.exp(-2 * Math.PI * 0.6 / Math.sqrt(1 - 0.36)), 3) || 'ちがう' }, '6-43', '$\\zeta$ が小さくないので $\\delta\\approx2\\pi\\zeta$ は使えない。山と山の時間は $\\frac{2\\pi}{\\omega_{\\mathrm n}\\sqrt{1-\\zeta^{2}}}$ で、比は $e^{-\\alpha T_{\\mathrm d}}$', ['6-80']);
          const [z, sT, s] = r.pick([[0.6, '0.8', 0.8], [0.8, '0.6', 0.6]]), w = r.pick([2.5, 4, 5, 10, 20]), vG = PI2 / (w * s), g = apx(vG, 2 * Math.PI / (w * Math.sqrt(1 - z * z)), 3);
          if (!g) return null;
          return dest({ key: '6-43trapA', q: `減衰比 $\\zeta=${z}$、固有角振動数 $\\omega_{\\mathrm n}=${w}\\,\\mathrm{rad/s}$ のゆれ。山と山の時間は約 □ 秒（$\\sqrt{1-${z}^{2}}=${sT}$、${piT}${g.note}）`, a: `$${g.ans}$`,
            verify: p => apxIs(p.a, 2 * PI / (w * s), 2 * Math.PI / (w * Math.sqrt(1 - z * z))) }, '6-43', '$\\zeta$ が小さくないので、ゆれの角振動数は $\\omega_{\\mathrm n}\\sqrt{1-\\zeta^{2}}$。山と山の時間は $\\frac{2\\pi}{\\omega_{\\mathrm n}\\sqrt{1-\\zeta^{2}}}$', ['6-80']);
        }
        const [rr, pc] = r.pick([[0.95, 9.75], [0.7, 51], [0.6, 64], [0.5, 75], [0.85, 27.75], [0.4, 84]]);
        return dest({ key: '6-43trapB', q: `橋のゆれの山が、1回ごとに ${fmt(rr)}倍になる。1周期のあいだに熱に変わるエネルギーは、その前のエネルギーの □ %`, a: `$${fmt(pc)}$`,
          verify: p => valIs(p.a, 100 * (1 - rr * rr)) }, '6-43', '減衰比ではなく、熱に変わったエネルギーの割合。エネルギーは山の高さの2乗に比例するので $1-r^{2}$', ['6-45']);
      },
    },
  });

  // ================================================================ 6-44
  // コイル（mH）とコンデンサー（μF）：L/C=Lm/Cu×10^3 が平方数（R_c=2√(L/C) が整数）。R_c=200 は楽な形の例の答えなので使わない（O-2）
  const RLC = (() => {
    const out = [];
    for (const Lm of [1, 2, 4, 5, 9, 10, 16, 20, 25, 40, 50, 90, 100, 160, 200, 250, 400]) for (const Cu of [0.1, 0.2, 0.25, 0.4, 0.5, 1, 2, 2.5, 4, 5, 10, 20, 25, 40, 50, 100]) {
      const LC = +fmt(Lm / Cu * 1000), h = Math.round(Math.sqrt(LC));
      if (h * h !== LC) continue;
      const Rc = 2 * h;
      if (Rc < 4 || Rc > 2000 || Rc === 200) continue;
      out.push({ Lm, Cu, LC, Rc });
    }
    return out;
  })();
  const rlcLC = (o, R) => `$L=${o.Lm}\\,\\mathrm{mH}$、${R != null ? `$R=${fmt(R)}\\,\\Omega$、` : ''}$C=${o.Cu}\\,\\mathrm{${MU}F}$ の RLC 回路`;
  const rlcEasy = o => `$\\frac{L}{C}=\\frac{${o.Lm}\\times10^{-3}}{${o.Cu}\\times10^{-6}}=${o.LC}$、$R_{\\mathrm c}=2\\sqrt{${o.LC}}=${o.Rc}$`;
  const rcOf = o => 2 * Math.sqrt(o.Lm * 1e-3 / (o.Cu * 1e-6));   // 検算：H と F に直してから計算する
  const STOPE = z => (z < 1 ? 'ア' : z === 1 ? 'イ' : 'ウ');
  const STOPEQ = '電圧の止まり方は（ア ゆれながら0になる　イ ちょうど（臨界）　ウ ゆれずにゆっくり0になる）のどれ';
  M.add({
    id: '6-44', part: 3, chap: '6-7⑦・例題8', stars: 1,
    title: 'RLC 回路：臨界の抵抗 $R_{\\mathrm c}=2\\sqrt{\\frac{L}{C}}$、$\\zeta=\\frac{R}{R_{\\mathrm c}}$（$m\\to L$、$c\\to R$、$k\\to\\frac{1}{C}$）',
    mark: 'コイル・抵抗・コンデンサーの回路（RLC 回路）と、「臨界の抵抗」「減衰比」「止まり方」「ほしい減衰比にする抵抗」。',
    futsu: ['$L\\ddot q+R\\dot q+\\frac{1}{C}q=0$ を表計算で動かして、', '電圧がゆれなくなる抵抗の境目をさがす。'],
    raku: ['$10\\,\\mathrm{mH}$・$1\\,\\mathrm{\\mu F}$ → $\\frac{L}{C}=10^{4}$ → $R_{\\mathrm c}=2\\sqrt{10^{4}}=200\\,\\Omega$', '$20\\,\\Omega$ なら $\\zeta=\\frac{20}{200}=0.1$', '$\\zeta=0.5$ にするなら $0.5\\times200=100\\,\\Omega$'],
    why: 'RLC 回路の式 $L\\ddot q+R\\dot q+\\frac{1}{C}q=0$ は、$m\\ddot x+c\\dot x+kx=0$ で $m\\to L$、$c\\to R$、$k\\to\\frac{1}{C}$ とおきかえた形（6-7⑦）。だから $c_{\\mathrm c}=2\\sqrt{mk}$ は $R_{\\mathrm c}=2\\sqrt{L\\times\\frac{1}{C}}=2\\sqrt{\\frac{L}{C}}$、減衰比は $\\zeta=\\frac{R}{R_{\\mathrm c}}$。止まり方の3つ（$\\zeta<1$、$=1$、$>1$）も、ばねと同じ。',
    caution: 'm・μ を直してから $\\frac{L}{C}$ を作る（$\\frac{10\\times10^{-3}}{1\\times10^{-6}}=10^{4}$）。$\\sqrt{LC}$ や $\\sqrt{\\frac{C}{L}}$ とまちがえない。2をかけ忘れない。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /コイル|RLC/.test(q) && /コンデンサー|RLC/.test(q) && /臨界の抵抗|減衰比|止まり方|R=□/.test(ask(q)) && !/つつみ|周期|固有角振動数|電流/.test(q); },
    steps: {
      // 臨界の抵抗・減衰比
      s1(r) {
        const o = r.pick(RLC);
        if (r.chance(0.45)) return { q: `${rlcLC(o)}の、臨界の抵抗 $R_{\\mathrm c}=□\\,\\Omega$`, a: `$${o.Rc}$`, key: `${o.Lm},${o.Cu}`, easyCheck: false,
          easy: rlcEasy(o), verify: p => valIs(p.a, rcOf(o)) };
        const z = r.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 1, 1.5, 2, 2.5, 5]), R = +fmt(z * o.Rc);
        if (!isDec(R, 1) || R < 1 || R === 200) return null;   // 200 Ω は楽な形の例の数（O-2）
        return { q: `${rlcLC(o, R)}の、減衰比 $\\zeta=□$`, a: `$${fmt(z)}$`, key: `${o.Lm},${o.Cu}`, easyCheck: false,
          easy: rlcEasy(o) + `、$\\zeta=\\frac{${fmt(R)}}{${o.Rc}}=${fmt(z)}$`, verify: p => valIs(p.a, R / 2 * Math.sqrt(o.Cu * 1e-6 / (o.Lm * 1e-3))) };
      },
      // ほしい ζ にする抵抗・止まり方・L や C を n 倍
      s2(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const which = r.int(0, 1), n = r.pick([4, 9, 16, 0.25]), f = which ? Math.sqrt(n) : 1 / Math.sqrt(n), fT = f >= 1 ? fmt(f) : `\\frac{1}{${fmt(1 / f)}}`;
          return { q: `RLC 回路で、${which ? 'コイルを、$L$ が' : 'コンデンサーを、$C$ が'} ${times(n)}のものに取りかえると、臨界の抵抗は □ 倍`, a: `$${fT}$`, key: `n${which},${n}`, easyCheck: false,
            easy: `$R_{\\mathrm c}=2\\sqrt{\\frac{L}{C}}$ → $\\sqrt{${which ? (n >= 1 ? fmt(n) : `\\frac{1}{${fmt(1 / n)}}`) : (n >= 1 ? `\\frac{1}{${fmt(n)}}` : fmt(1 / n))}}=${fT}$`,
            verify: p => valIs(p.a, Math.sqrt((which ? n : 1) / (which ? 1 : n))) };
        }
        const o = r.pick(RLC), z = r.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.75, 1, 1.5, 2, 3]), R = +fmt(z * o.Rc);
        if (!isDec(R, 1) || R < 1 || R === 200) return null;   // 200 Ω は楽な形の例の数（O-2）
        if (kind === 0) return { q: `$L=${o.Lm}\\,\\mathrm{mH}$、$C=${o.Cu}\\,\\mathrm{${MU}F}$ の RLC 回路で、減衰比を ${fmt(z)} にしたい。抵抗は $R=□\\,\\Omega$`, a: `$${fmt(R)}$`, key: `${o.Lm},${o.Cu}`, easyCheck: false,
          easy: rlcEasy(o) + `、$R=${fmt(z)}\\times${o.Rc}=${fmt(R)}$`, verify: p => valIs(p.a, z * rcOf(o)) };
        return { q: `${rlcLC(o, R)}の、${STOPEQ}`, a: STOPE(z), key: `${o.Lm},${o.Cu}`, boxw: '12mm', easyCheck: false,
          easy: `$R_{\\mathrm c}=${o.Rc}$、$\\zeta=\\frac{${fmt(R)}}{${o.Rc}}=${fmt(z)}$ → ${STOPE(z)}`, verify: p => p.a === STOPE(+fmt(R / rcOf(o))) || 'ちがう' };
      },
      // 見かけがちがう：L が H、C が F、「ゆれずに0になる」いちばん小さい抵抗
      s3(r) {
        const o = r.pick(RLC), kind = r.int(0, 2);
        if (kind === 0) {
          if (o.Lm < 100) return null;
          return { q: `$L=${fmt(o.Lm / 1000)}\\,\\mathrm{H}$、$C=${o.Cu}\\,\\mathrm{${MU}F}$ の RLC 回路の、臨界の抵抗 $R_{\\mathrm c}=□\\,\\Omega$`, a: `$${o.Rc}$`, key: `${o.Lm},${o.Cu}`, easyCheck: false,
            easy: `$${fmt(o.Lm / 1000)}\\,\\mathrm{H}=${o.Lm}\\,\\mathrm{mH}$、` + rlcEasy(o), verify: p => valIs(p.a, 2 * Math.sqrt((o.Lm / 1000) / (o.Cu / 1e6))) };
        }
        if (kind === 1) {
          if (o.Cu > 10 || o.Cu < 1) return null;
          const z = r.pick([0.1, 0.2, 0.25, 0.5, 2]), R = +fmt(z * o.Rc);
          if (!isDec(R, 1) || R < 1 || R === 200) return null;   // 200 Ω は楽な形の例の数（O-2）
          return { q: `$L=${o.Lm}\\,\\mathrm{mH}$ のコイル、$R=${fmt(R)}\\,\\Omega$ の抵抗、$C=${(o.Cu / 1e6).toFixed(9).replace(/0+$/, '')}\\,\\mathrm{F}$ のコンデンサーの回路の、減衰比 $\\zeta=□$`, a: `$${fmt(z)}$`, key: `${o.Lm},${o.Cu}`, easyCheck: false,
            easy: `$C=${o.Cu}\\,\\mathrm{${MU}F}$、` + rlcEasy(o) + `、$\\zeta=\\frac{${fmt(R)}}{${o.Rc}}=${fmt(z)}$`, verify: p => valIs(p.a, R / rcOf(o)) };
        }
        return { q: `${rlcLC(o)}で、コンデンサーの電圧がゆれずに0になるようにしたい。抵抗は少なくとも $R=□\\,\\Omega$`, a: `$${o.Rc}$`, key: `${o.Lm},${o.Cu}`, easyCheck: false,
          easy: `ゆれないのは $\\zeta\\geqq1$、つまり $R\\geqq R_{\\mathrm c}$。` + rlcEasy(o), verify: p => valIs(p.a, rcOf(o)) };
      },
      // わな：抵抗のない回路の固有角振動数（6-35）、ばね・ダンパーの減衰比（6-41）
      trap(r) {
        if (r.chance(0.5)) {
          const o = r.pick(LCS);
          return dest({ key: '6-44trapA', q: lcHead(o) + `の、固有角振動数 $\\omega_{\\mathrm n}=□\\,\\mathrm{rad/s}$`, a: `$${o.w}$`,
            verify: p => valIs(p.a, 1 / Math.sqrt(o.Lm / 1000 * o.Cu / 1e6)) }, '6-44', `抵抗がなく、聞いているのは減衰比ではなく固有角振動数。$\\frac{1}{\\sqrt{LC}}$`, ['6-35']);
        }
        const o = r.pick(MK), z = r.pick([0.1, 0.25, 0.5, 2]), c = +fmt(z * o.cc);
        if (!isDec(c, 2)) return null;
        return dest({ key: '6-44trapB', q: `質量 ${U(o.m, 'kg')}、ばね定数 ${U(o.k, 'N/m')} のおもりに、減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーをつけた。減衰比 $\\zeta=□$`, a: `$${fmt(z)}$`,
          verify: p => valIs(p.a, c / (2 * Math.sqrt(o.m * o.k))) }, '6-44', `電気の回路ではなく、ばねとダンパー。$c_{\\mathrm c}=2\\sqrt{mk}$`, ['6-41']);
      },
    },
  });

  // ================================================================ 6-45
  // 山の高さ X1 → 1周期あとの X2（比 r）。0.5 は楽な形の例（0.2 → 0.1 で75%）、(0.1, 0.06) は教科書の問題なので使わない
  const HEAT = (() => {
    const out = [];
    for (const X1 of [0.05, 0.1, 0.2, 0.3, 0.4]) for (const rr of [0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.75, 0.25]) {
      const X2 = +fmt(X1 * rr);
      if (!isDec(X2, 3) || (X1 === 0.1 && X2 === 0.06)) continue;
      out.push({ X1, X2, rr, pc: +fmt(100 * (1 - rr * rr)) });
    }
    return out;
  })();
  const heatEasy = o => `$1-\\Bigl(\\frac{${o.X2}}{${o.X1}}\\Bigr)^{2}=1-${fmt(o.rr)}^{2}=1-${fmt(o.rr * o.rr)}=${fmt(1 - o.rr * o.rr)}$`;
  M.add({
    id: '6-45', part: 3, chap: '6-7⑥・例題9', stars: 1,
    title: '熱に変わったエネルギーの割合は $1-(\\text{山の比})^2$（山ではエネルギーはばねの $\\frac{1}{2}kx^2$ だけ）',
    mark: '山の高さ2つ（1周期あと）と、「熱に変わったエネルギー」「その割合」。',
    futsu: ['はじめと1周期あとのエネルギーを、それぞれ', '$\\frac{1}{2}mv^2+\\frac{1}{2}kx^2$ で計算してから引き算する。'],
    raku: ['$0.1\\,\\mathrm{m}$ → $0.0532\\,\\mathrm{m}$（$8\\,\\mathrm{N/m}$）→ 割合は $1-0.532^{2}\\approx0.72$', '（はじめ $0.04\\,\\mathrm{J}$ の72%で、約 $0.029\\,\\mathrm{J}$）', '$0.2\\,\\mathrm{m}$ → $0.1\\,\\mathrm{m}$ → $1-0.25=0.75$'],
    why: '山（はし）では速さが0なので、エネルギーはばねの $\\frac{1}{2}kx^2$ だけ（6-7⑥）。へった分が、ダンパーで熱に変わった分。エネルギーは山の高さの2乗に比例するので、1周期あとのエネルギーははじめの $r^2$ 倍（$r$ は山の比）、熱に変わった割合は $1-r^2$。$k$ がわからなくても割合は出る。',
    caution: '割合を $1-r$ としない（山が0.5倍なら、エネルギーは0.25倍で、熱は75%）。熱に変わったエネルギー〔J〕を聞かれたら、$\\frac{1}{2}kX^2$ に $k$ を入れる。cm は m に直す。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (/1秒あたり/.test(q)) return false;
      const a = ask(q);
      return (/熱に変わ/.test(a) && /山|まん中/.test(q)) || (/山の高さ|山でのエネルギー/.test(q) && /山の高さ|エネルギー/.test(a) && /□\s*倍/.test(a));
    },
    steps: {
      // 割合（%）・熱に変わったエネルギー（J）
      s1(r) {
        const o = r.pick(HEAT);
        if (r.chance(0.5)) return { q: `ばねのおもりの山の高さが、${U(o.X1, 'm')} から1周期あとに ${U(o.X2, 'm')} になった。このあいだに熱に変わったエネルギーは、はじめのエネルギーの □ %`, a: `$${fmt(o.pc)}$`, key: `p${o.rr}`, easyCheck: false,
          easy: heatEasy(o), verify: p => valIs(p.a, 100 * (o.X1 ** 2 - o.X2 ** 2) / o.X1 ** 2) };
        const k = r.pick([10, 20, 25, 40, 50, 100, 200]), E1 = 0.5 * k * o.X1 ** 2, E2 = 0.5 * k * o.X2 ** 2, H = +fmt(E1 - E2);
        if (!isDec(H, 4) || !isDec(E2, 5)) return null;
        return { q: `ばね定数 ${U(k, 'N/m')} のばねのおもりの山の高さが、${U(o.X1, 'm')} から1周期あとに ${U(o.X2, 'm')} になった。このあいだに熱に変わったエネルギーは □ J`, a: `$${fmt(H)}$`, key: `${o.X1},${o.X2}`, easyCheck: false,
          easy: `$\\frac{1}{2}\\times${k}\\times${o.X1}^{2}=${fmt(E1)}$、$\\frac{1}{2}\\times${k}\\times${o.X2}^{2}=${fmt(E2)}$、$${fmt(E1)}-${fmt(E2)}=${fmt(H)}$`,
          verify: p => valIs(p.a, E1 * (1 - o.rr * o.rr)) };
      },
      // 1回ごとに□倍・2周期・高さとエネルギーの倍
      s2(r) {
        const kind = r.int(0, 2);
        if (kind === 2) {
          const n = r.pick([2, 3, 4, 5, 10]), back = r.chance(0.5);
          if (back) return { q: `ばねにつないだおもりの、山でのエネルギーが $\\frac{1}{${n * n}}$ 倍になった。山の高さは □ 倍`, a: `$\\frac{1}{${n}}$`, key: `e${n}`, easyCheck: false,
            easy: `エネルギーは高さの2乗に比例 → $\\sqrt{\\frac{1}{${n * n}}}=\\frac{1}{${n}}$`, verify: p => valIs(p.a, Math.sqrt(1 / (n * n))) };
          return { q: `ばねにつないだおもりの、山の高さが $\\frac{1}{${n}}$ 倍になった。山でのエネルギーは □ 倍`, a: `$\\frac{1}{${n * n}}$`, key: `e${n}`, easyCheck: false,
            easy: `エネルギーは高さの2乗に比例 → $\\Bigl(\\frac{1}{${n}}\\Bigr)^{2}=\\frac{1}{${n * n}}$`, verify: p => valIs(p.a, 0.5 * 1 * (1 / n) ** 2 / 0.5) };
        }
        const rr = r.pick([0.9, 0.8, 0.7, 0.6, 0.4, 0.3]);
        if (kind === 0) return { q: `ゆれの山が、1回ごとに ${fmt(rr)}倍になる。1周期のあいだに熱に変わるエネルギーは、その前のエネルギーの □ %`, a: `$${fmt(100 * (1 - rr * rr))}$`, key: `p${rr}`, easyCheck: false,
          easy: `エネルギーは $${fmt(rr)}^{2}=${fmt(rr * rr)}$ 倍 → $1-${fmt(rr * rr)}=${fmt(1 - rr * rr)}$`, verify: p => valIs(p.a, 100 - 100 * rr * rr) };
        const r4 = rr ** 4, pc = +fmt(100 * (1 - r4));
        if (!isDec(pc, 2)) return null;
        return { q: `ゆれの山が、1回ごとに ${fmt(rr)}倍になる。2周期のあいだに熱に変わるエネルギーは、はじめのエネルギーの □ %`, a: `$${fmt(pc)}$`, key: `q${rr}`, easyCheck: false,
          easy: `山は $${fmt(rr)}^{2}=${fmt(rr * rr)}$ 倍、エネルギーは $${fmt(rr * rr)}^{2}=${fmt(r4)}$ 倍 → $1-${fmt(r4)}$`, verify: p => valIs(p.a, 100 * (1 - Math.pow(rr * rr, 2))) };
      },
      // 見かけがちがう：まん中を通る速さ、コンデンサーの電圧の山、cm
      s3(r) {
        const kind = r.int(0, 2), rr = r.pick([0.9, 0.8, 0.7, 0.6, 0.4]);
        if (kind === 0) {
          const m = r.pick([0.2, 0.5, 1, 2, 4]), v1 = r.pick([0.2, 0.4, 0.5, 1, 2]), v2 = +fmt(v1 * rr), H = +fmt(0.5 * m * (v1 * v1 - v2 * v2));
          if (!isDec(v2, 3) || !isDec(H, 4)) return null;
          return { q: `ダンパーつきの台車（質量 ${U(m, 'kg')}）が、まん中を右向きに ${U(v1, 'm/s')} で通り、1周期あとに右向きに ${U(v2, 'm/s')} で通った。このあいだに熱に変わったエネルギーは □ J`, a: `$${fmt(H)}$`, key: `v${m},${v1},${v2}`, easyCheck: false,
            easy: `まん中ではばねのエネルギーが0：$\\frac{1}{2}\\times${m}\\times(${fmt(v1)}^{2}-${fmt(v2)}^{2})=${fmt(H)}$`, verify: p => valIs(p.a, 0.5 * m * v1 * v1 * (1 - rr * rr)) };
        }
        if (kind === 1) {
          const Cu = r.pick([1, 2, 4, 5, 10, 20]), V1 = r.pick([5, 10, 20]), V2 = +fmt(V1 * rr), H = +fmt(0.5 * Cu * (V1 * V1 - V2 * V2));
          if (!isDec(V2, 1) || !isDec(H, 2)) return null;
          return { q: `RLC 回路で、$C=${Cu}\\,\\mathrm{${MU}F}$ のコンデンサーの電圧の山が、$${V1}\\,\\mathrm{V}$ から1周期あとに $${fmt(V2)}\\,\\mathrm{V}$ になった。このあいだに抵抗で熱に変わったエネルギーは □ $\\mathrm{${MU}J}$`, a: `$${fmt(H)}$`, key: `c${Cu},${V1},${V2}`, easyCheck: false,
            easy: `電圧の山では電流が0：$\\frac{1}{2}\\times${Cu}\\times(${V1}^{2}-${fmt(V2)}^{2})=${fmt(H)}$`, verify: p => valIs(p.a, 0.5 * Cu * 1e-6 * V1 * V1 * (1 - rr * rr) * 1e6) };
        }
        const X1c = r.pick([4, 5, 10, 20]), X2c = +fmt(X1c * rr), k = r.pick([20, 40, 50, 100, 200]), H = +fmt(0.5 * k * ((X1c / 100) ** 2 - (X2c / 100) ** 2));
        if (!isDec(X2c, 1) || !isDec(H, 4)) return null;
        return { q: `ばね定数 ${U(k, 'N/m')} のばねのおもりの山の高さが、${U(X1c, 'cm')} から1周期あとに ${U(X2c, 'cm')} になった。このあいだに熱に変わったエネルギーは □ J`, a: `$${fmt(H)}$`, key: `${fmt(X1c / 100)},${fmt(X2c / 100)}`, easyCheck: false,
          easy: `$${X1c}\\,\\mathrm{cm}=${fmt(X1c / 100)}\\,\\mathrm{m}$、$\\frac{1}{2}\\times${k}\\times(${fmt(X1c / 100)}^{2}-${fmt(X2c / 100)}^{2})=${fmt(H)}$`, verify: p => valIs(p.a, k / 2 * (X1c / 100) ** 2 * (1 - rr * rr)) };
      },
      // わな：ある瞬間の熱の速さ cv^2（わざなし）、対数減衰率（6-40）
      trap(r) {
        if (r.chance(0.5)) {
          const c = r.pick([0.4, 1, 2, 5, 10]), v = r.pick([0.2, 0.5, 1, 0.3]), P = +fmt(c * v * v);
          return dest({ key: '6-45trapA', q: `減衰係数 ${U(c, 'N\\cdot s/m')} のダンパーを、${U(v, 'm/s')} の速さで動かしている。このとき1秒あたりに熱に変わるエネルギーは □ J`, a: `$${fmt(P)}$`,
            verify: p => valIs(p.a, (c * v) * v) }, '6-45', '山の高さの比ではなく、ある瞬間の熱になる速さ。ダンパーの力 $cv$ ×速さ $v$ で $cv^{2}$');
        }
        const [R, lnT] = r.pick([[2, '0.693'], [4, '1.386'], [1.5, '0.405'], [1.6, '0.470'], [3, '1.099']]), X1 = r.pick([0.06, 0.08, 0.12, 0.16, 0.24, 0.3, 0.48]), X2 = +fmt(X1 / R);
        if (!isDec(X2, 3)) return null;
        return dest({ key: '6-45trapB', q: `ばねのおもりの山の高さが、${U(X1, 'm')} から1周期あとに ${U(X2, 'm')} になった。対数減衰率 $\\delta=□$（$\\ln${fmt(R)}=${lnT}$）`, a: `$${lnT}$`,
          verify: p => Math.abs(Math.log(X1 / X2) - numOf(p.a)) < 6e-4 || 'ちがう' }, '6-45', 'エネルギーの割合ではなく、山の比の対数', ['6-40']);
      },
    },
  });

})(globalThis.MONDAI);
