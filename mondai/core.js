/* 問題集とプリントアプリで共通に使う「問題を作るエンジン」（第28回 M-9）
 * ・ブラウザでもNode.jsでも動く、ふつうのスクリプト（モジュールにしない）。
 *   ブラウザでは <script> にそのまま並べ、Node.js では build/load.js が vm で読む。
 * ・わざ（楽に解けるパターン）は v1/*.js などで MONDAI.add({...}) で登録する。
 * ・生成AIは使わない。答えは作るときに決め、検算の関数（MONDAI.evalExpr）で確かめる。
 *
 * 文の書き方（マークアップ）
 *   《漢字|かん|じ》  ルビ（本では \R{漢字}{かん|じ}、アプリでは <ruby>）
 *   《f:1/4》          分数
 *   □                  書きこむ所（答えの欄）。問題の文に □ がなければ、最後に「＝ □」をつける
 *   **9**              目印として強める（本では太字＋下線、アプリでは太字＋下線。色だけにしない：K-15）
 *   ＋ － × ÷ ＝        演算の記号（第1巻の教科書と同じ全角・× ÷）
 */
(function (G) {
  'use strict';
  const M = G.MONDAI || (G.MONDAI = {});
  M.waza = M.waza || {};      // id → 定義
  M.order = M.order || [];    // 登録の順
  M.parts = M.parts || {};    // 巻 → 部の一覧（見分けよう・作ってみよう）

  // ---------------------------------------------------------------- 乱数（種つき）
  // mulberry32：同じ種なら、どの機械でも同じ数の列になる
  M.rng = function (seed) {
    let a = (seed >>> 0) || 1;
    const next = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
      next,
      int(lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },          // lo 以上 hi 以下
      pick(arr) { return arr[Math.floor(next() * arr.length)]; },
      chance(p) { return next() < p; },
      shuffle(arr) { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
      intNot(lo, hi, bad) { for (let k = 0; k < 1000; k++) { const v = r.int(lo, hi); if (!bad(v)) return v; } throw new Error('intNot: 見つからない'); },
    };
    return r;
  };
  // 文字列から種を作る（本の問題は、わざの番号から決まった種で作る）
  M.hash = function (s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };

  // ---------------------------------------------------------------- 登録
  // def の形（v1/README の「わざの書き方」も見る）
  // { id:'1-37', vol:1, part:3, chap:'1-13', stars:1, title:'…', mark:'…',
  //   futsu:['…'], raku:['…'], why:'…', caution:'…',
  //   steps:{ s1:fn, s2:fn, s3:fn, trap:fn },  counts:{ s1:10, s2:8, s3:6, trap:2 } }
  // fn(r) は {q, a, easy, val?} を返す。
  M.STEPS = ['s1', 's2', 's3', 'trap'];
  M.STEP_TITLE = {
    s1: 'ステップ1　そのまま つかう',
    s2: 'ステップ2　すこし かたちを かえる',
    s3: 'ステップ3　《見|み》かけが ちがう',
    trap: 'わなに ちゅうい',
  };
  // 第2巻からは、教科書と同じく漢字にルビ（分かち書きにしない）
  M.STEP_TITLE_K = {
    s1: 'ステップ1　そのまま《使|つか》う',
    s2: 'ステップ2　《少|すこ》し《形|かたち》を《変|か》える',
    s3: 'ステップ3　《見|み》かけがちがう',
    trap: 'わなに《注意|ちゅう|い》',
  };
  M.stepTitle = (vol, s) => (vol > 1 ? M.STEP_TITLE_K : M.STEP_TITLE)[s];
  M.DEFAULT_COUNTS = { s1: 10, s2: 8, s3: 6, trap: 2 };
  M.add = function (def) {
    if (!/^[1-9]-[0-9]{2}$/.test(def.id)) throw new Error('わざの番号の形がちがう: ' + def.id);
    if (M.waza[def.id]) throw new Error('わざの番号が2つある: ' + def.id);
    def.vol = def.vol || +def.id.split('-')[0];
    def.counts = Object.assign({}, M.DEFAULT_COUNTS, def.counts || {});
    M.waza[def.id] = def;
    M.order.push(def.id);
  };
  // 列の数・答えの欄のはば（わざ全体か、ステップごと {s1:2, s3:1}）
  M.colsOf = (def, step) => (def.cols && typeof def.cols === 'object') ? (def.cols[step] || 2) : (def.cols || 2);
  M.boxwOf = (def, step, p) => (p && p.boxw) || ((def.boxw && typeof def.boxw === 'object') ? (def.boxw[step] || null) : (def.boxw || null));   // 問題ごとの p.boxw・p.boxh があれば、それを使う（組 f の要望）
  // 欄の高さ（分数の答えなど。第2巻から）。なければ ふつうの高さ
  M.boxhOf = (def, step, p) => (p && p.boxh) || ((def.boxh && typeof def.boxh === 'object') ? (def.boxh[step] || null) : (def.boxh || null));   // 問題ごとの p.boxw・p.boxh があれば、それを使う（組 f の要望）
  M.list = function (vol) {
    return M.order.filter(id => !vol || M.waza[id].vol === vol).sort();
  };
  // 入力された番号を読む：「37」「1-37」「1-037」「1-33〜1-40」「33-40」、空白・読点・カンマで区切る
  M.parseIds = function (text, vol) {
    vol = vol || 1;
    const out = [];
    const norm = s => s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/[ー－―−]/g, '-').replace(/[〜～]/g, '~');
    const one = w => {
      let m;
      if ((m = w.match(/^([1-9])-0*([0-9]{1,2})$/))) return m[1] + '-' + m[2].padStart(2, '0');
      if ((m = w.match(/^0*([0-9]{1,2})$/))) return vol + '-' + m[1].padStart(2, '0');
      return null;
    };
    const bad = [];
    norm(text).split(/[\s,、，]+/).filter(Boolean).forEach(w => {
      // 「33-40」「1-33-40」「1-33-1-40」も、はんいとして読む（第29回 R2-24）
      let m;
      if ((m = w.match(/^([1-9])-(\d{1,2})-(?:\1-)?(\d{1,2})$/))) w = m[1] + '-' + m[2] + '~' + m[1] + '-' + m[3];
      else if ((m = w.match(/^(\d{2})-(\d{1,2})$/))) w = m[1] + '~' + m[2];
      const rg = w.split('~');
      if (rg.length === 2) {
        const a = one(rg[0]), b = one(rg[1].includes('-') ? rg[1] : (rg[0].includes('-') ? rg[0].split('-')[0] + '-' + rg[1] : rg[1]));
        if (a && b) {
          M.list().forEach(id => { if (id >= a && id <= b) out.push(id); });
          return;
        }
      }
      const id = one(w);
      if (id) out.push(id); else bad.push(w);
    });
    const res = [...new Set(out)];
    res.bad = bad;   // 読めなかった書き方（アプリが知らせる）
    return res;
  };

  // ---------------------------------------------------------------- 問題を作る
  // 同じ問題かどうか：p.key があればそれ（例：8 ＋ 7 と 7 ＋ 8 を同じとみる）、なければ問題の文
  function key(p) { return p.key || p.q; }
  // 1つのわざ・1つのステップの問題を n 問。同じ問題を2回出さない。
  M.makeStep = function (id, step, n, r, seen) {
    const def = M.waza[id];
    if (!def) throw new Error('わざがない: ' + id);
    const fn = def.steps[step];
    if (!fn) return [];
    seen = seen || new Set();
    const out = [];
    for (let k = 0; out.length < n && k < n * 60; k++) {
      const p = fn(r);
      if (!p) continue;
      if (seen.has(key(p))) continue;
      seen.add(key(p));
      p.id = id; p.step = step;
      out.push(p);
    }
    return out;
  };
  // 本の見開き1つぶん（決まった種）
  M.makeSheet = function (id, opts) {
    opts = opts || {};
    const def = M.waza[id];
    const seed = opts.seed != null ? opts.seed : M.hash('book:' + id);
    const r = M.rng(seed);
    const seen = new Set();
    const res = {};
    M.STEPS.forEach(s => {
      const n = (opts.counts && opts.counts[s] != null) ? opts.counts[s] : def.counts[s];
      res[s] = M.makeStep(id, s, n, r, seen);
    });
    return res;
  };
  // アプリのプリント：わざの一覧と、ステップ、問題の数。まぜるときは順番をまぜる
  M.makePrint = function (ids, opts) {
    const r = M.rng(opts.seed >>> 0);
    const steps = opts.steps && opts.steps.length ? opts.steps : ['s1', 's2', 's3'];
    const total = opts.count || 20;
    const seen = new Set();
    const pool = [];
    ids.forEach(id => steps.forEach(s => { if (M.waza[id] && M.waza[id].steps[s]) pool.push([id, s]); }));
    if (!pool.length) return [];
    // 問題の数を、わざに同じくらいずつ、ステップには本の数（counts）の割合で分ける
    const want = new Map();
    const perId = ids.map((id, k) => Math.floor(total / ids.length) + (k < total % ids.length ? 1 : 0));
    ids.forEach((id, k) => {
      const d = M.waza[id]; if (!d) return;
      const st = steps.filter(s => d.steps[s]);
      const w = st.map(s => d.counts[s] || 1), W = w.reduce((a, b) => a + b, 0) || 1;
      const raw = w.map(x => x * perId[k] / W), base = raw.map(Math.floor);
      let rest = perId[k] - base.reduce((a, b) => a + b, 0);
      raw.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { base[i]++; rest--; } });
      st.forEach((s, i) => want.set(id + '|' + s, base[i]));
    });
    const out = [];
    pool.forEach(([id, s]) => { const n = want.get(id + '|' + s) || 0; if (n) out.push(...M.makeStep(id, s, n, r, seen)); });
    // 作れる問題が足りないとき（種類の少ないわざ）は、ほかのステップで足す
    for (let k = 0; out.length < total && k < total * 20; k++) {
      const [id, s] = pool[k % pool.length];
      const got = M.makeStep(id, s, 1, r, seen);
      if (got.length) out.push(got[0]);
    }
    if (opts.mix) return r.shuffle(out);
    // まぜないときは、わざの順・ステップの順にならべる
    const rank = p => ids.indexOf(p.id) * 10 + steps.indexOf(p.step);
    return out.map((p, i) => [p, i]).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]).map(x => x[0]);
  };

  // ---------------------------------------------------------------- 書き出し（文字の変換）
  const TOKEN = /《([^》]*)》/g;
  function texEsc(s) {
    return s.replace(/\\/g, '\\textbackslash{}').replace(/([%#&_{}$])/g, '\\$1')
      .replace(/\^/g, '\\textasciicircum{}').replace(/~/g, '\\textasciitilde{}');
  }
  function htmlEsc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // 本（LaTeX）
  // 分数は大きく（\dfrac）。ただし指数・下つき（^{…}・_{…}）の中は \frac のまま
  function dfracOutsideScripts(t) {
    let out = '', depth = 0; const stack = [];
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if ((c === '^' || c === '_') && t[i + 1] === '{') { out += c + '{'; i++; stack.push(true); depth++; continue; }
      if (c === '{') { stack.push(false); out += c; continue; }
      if (c === '}') { if (stack.pop()) depth--; out += c; continue; }
      if (c === '\\' && t.startsWith('\\frac', i) && !/[a-z]/.test(t[i + 5] || '')) { out += depth ? '\\frac' : '\\dfrac'; i += 4; continue; }
      out += c;
    }
    return out;
  }
  const MK = t => String(t).replace(/\*\*(.+?)\*\*/g, '\u0001$1\u0002');
  M.toTeX = function (s, opt) {
    opt = opt || {};
    if (s == null) return '';
    s = String(s);
    // コード（`…`、第2巻の表計算・プログラム）は等幅で、そのまま
    if (s.includes('`')) return MK(s).split(/(`[^`]*`)/).map((seg, k) => k % 2 ? '\\mqcode{' + texEsc(seg.slice(1, -1)) + '}' : M.toTeX(seg, opt)).join('').replace(/(\\mqbox(?:\[[^\]]*\])?\{\}\}|\\mqboxt\{[^}]*\}\{[^}]*\}\})\$ (?=\S)/g, '$1$~').replace(/\u0001/g, '\\mqmk{').replace(/\u0002/g, '}');
    // 数式（$…$、第2巻から）は、そのまま TeX に渡す。□ は欄に（太字の ** は、式をまたいでもよい）
    if (s.includes('$')) {
      s = MK(s);
      return s.split(/(\$[^$]*\$)/).map((seg, k) => k % 2 ? dfracOutsideScripts(seg).replace(/□/g, '\\mbox{' + (opt.box || '\\mqbox{}') + '}') : M.toTeX(seg, opt)).join('').replace(/(\\mqbox(?:\[[^\]]*\])?\{\}\}|\\mqboxt\{[^}]*\}\{[^}]*\}\})\$ (?=\S)/g, '$1$~').replace(/\u0001/g, '\\mqmk{').replace(/\u0002/g, '}');
    }
    s = MK(s);
    let out = '', last = 0, m;
    TOKEN.lastIndex = 0;
    // 欄のすぐあとの単位（「□ こ」）は、欄と同じ行に置く
    // 欄のすぐあとの字（単位・「時」「分」など）は、欄と同じ行に置き、少しあける
    const plain = t => texEsc(t).replace(/□ (?=\S)/g, '□\u0003').replace(/□/g, opt.box || '\\mqbox{}').replace(/\u0003/g, '~').replace(/(\\mq(?:box|sq)(?:\[[^\]]*\])?\{\})(?=[^\s~])/g, '$1\\nobreak\\,');
    while ((m = TOKEN.exec(s))) {
      out += plain(s.slice(last, m.index));
      if (/\\mq(?:box|sq)(?:\[[^\]]*\])?\{\}$/.test(out)) out += '\\nobreak\\,';
      const t = m[1];
      if (t.startsWith('f:')) {
        const [a, b] = t.slice(2).split('/');
        out += '\\mqfrac{' + texEsc(a) + '}{' + texEsc(b) + '}';
      } else {
        const [base, ...yomi] = t.split('|');
        out += '\\R{' + texEsc(base) + '}{' + yomi.map(texEsc).join('|') + '}';
      }
      last = m.index + m[0].length;
    }
    out += plain(s.slice(last));
    return out.replace(/\u0001/g, '\\mqmk{').replace(/\u0002/g, '}');
  };
  // アプリ（HTML）
  M.toHTML = function (s, opt) {
    opt = opt || {};
    if (s == null) return '';
    s = String(s);
    if (s.includes('`')) return MK(s).split(/(`[^`]*`)/).map((seg, k) => k % 2 ? '<code class="mcode">' + htmlEsc(seg.slice(1, -1)) + '</code>' : M.toHTML(seg, opt)).join('').replace(/\u0001/g, '<b class="mk">').replace(/\u0002/g, '</b>');
    if (s.includes('$')) {
      s = MK(s);
      return s.split(/(\$[^$]*\$)/).map((seg, k) => k % 2 ? M.mathHTML(seg.slice(1, -1), opt) : M.toHTML(seg, opt)).join('').replace(/\u0001/g, '<b class="mk">').replace(/\u0002/g, '</b>');
    }
    s = MK(s);
    let out = '', last = 0, m;
    TOKEN.lastIndex = 0;
    const plain = t => htmlEsc(t).replace(/□/g, opt.box || '<span class="box"></span>');
    while ((m = TOKEN.exec(s))) {
      out += plain(s.slice(last, m.index));
      const t = m[1];
      if (t.startsWith('f:')) {
        const [a, b] = t.slice(2).split('/');
        out += '<span class="frac"><span>' + htmlEsc(a) + '</span><span>' + htmlEsc(b) + '</span></span>';
      } else {
        const [base, ...yomi] = t.split('|');
        out += opt.noRuby ? htmlEsc(base) : '<ruby>' + htmlEsc(base) + '<rt>' + htmlEsc(yomi.join('')) + '</rt></ruby>';
      }
      last = m.index + m[0].length;
    }
    out += plain(s.slice(last));
    return out.replace(/\u0001/g, '<b class="mk">').replace(/\u0002/g, '</b>');
  };
  // ---------------------------------------------------------------- 数式（第2巻から。TeX の書き方の一部）
  // 使える書き方：数・1字の文字（斜体）・+ - = < > ( ) [ ] | ,・^{…}・_{…}・\frac{}{}（\dfrac・\tfrac）・\sqrt{}・\sqrt[n]{}
  //   \times \div \cdot \pm \mp \pi \le \ge \ne \approx \to \infty \degree・\log \ln \sin \cos \tan \exp・\left( \right)・\text{}・\mathrm{}・\,・\quad・□（欄）
  const MATHSYM = { times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', pi: 'π', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
    approx: '≒', ell: 'ℓ', sojisym: '∽', backsim: '∽', infty: '∞', leqq: '≦', geqq: '≧', lvert: '|', rvert: '|', vert: '|', mid: '|', square: '□', triangle: '△', angle: '∠', perp: '⊥', parallel: '∥', fallingdotseq: '≒', to: '→', rightarrow: '→', infty: '∞', degree: '°', circ: '°', alpha: 'α', beta: 'β', theta: 'θ', lambda: 'λ', mu: 'μ', sigma: 'σ',
    Delta: 'Δ', omega: 'ω', Omega: 'Ω', tau: 'τ', Sigma: 'Σ', ll: '≪', gg: '≫', partial: '∂', gamma: 'γ', varepsilon: 'ε', epsilon: 'ε', kappa: 'κ', nu: 'ν', xi: 'ξ', eta: 'η', rho: 'ρ', varphi: 'φ', phi: 'φ', ldots: '…', cdots: '⋯', prime: '′', percent: '%', '%': '%', '{': '{', '}': '}', '$': '$', '#': '#', '&': '&' };
  const MATHFN = ['log', 'ln', 'sin', 'cos', 'tan', 'exp', 'max', 'min'];
  M.mathHTML = function (src, opt) {
    opt = opt || {};
    const s = src;
    let i = 0;
    const ws = () => { while (i < s.length && s[i] === ' ') i++; };
    const readCmd = () => { // s[i] === '\\'
      i++;
      let j = i;
      if (/[a-zA-Z]/.test(s[i] || '')) { while (i < s.length && /[a-zA-Z]/.test(s[i])) i++; return s.slice(j, i); }
      i++; return s[j] || '';
    };
    const raw = () => { ws(); if (s[i] !== '{') return s[i++] || ''; let d = 0, j = ++i; for (; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}') { if (!d) break; d--; } } const t = s.slice(j, i); i++; return t; };
    const op = c => `<span class="mo">${c}</span>`;
    function atom() {
      ws();
      const c = s[i];
      if (c === undefined) return '';
      if (c === '{') { i++; const h = seq('}'); i++; return h; }
      if (c === '\\') {
        const name = readCmd();
        if (name === 'frac' || name === 'dfrac' || name === 'tfrac') { const a = atom(), b = atom(); return `<span class="frac mf"><span>${a}</span><span>${b}</span></span>`; }
        if (name === 'sqrt') {
          ws(); let n = '';
          if (s[i] === '[') { const j = s.indexOf(']', i); n = M.mathHTML(s.slice(i + 1, j), opt); i = j + 1; }
          const x = atom();
          return `<span class="msqrt">${n ? `<sup class="mroot">${n}</sup>` : ''}<span class="rad">√</span><span class="rc">${x}</span></span>`;
        }
        // 第5巻から（第37回）：∫・Σ・lim の上と下、\Bigl[ \Bigr]、立てた d、時間の微分の点
        if (name === 'displaystyle' || name === 'textstyle' || name === 'limits' || name === 'nolimits') return '';
        if (name === 'int' || name === 'sum' || name === 'lim') {
          let lo = '', hi = '';
          for (let k = 0; k < 2; k++) { ws(); if (s[i] === '_') { i++; lo = atom(); } else if (s[i] === '^') { i++; hi = atom(); } }
          if (name === 'int') return `<span class="mint">∫${lo || hi ? `<span class="mil"><span>${hi}</span><span>${lo}</span></span>` : ''}</span>`;
          const sym = name === 'sum' ? '<span class="mbig">Σ</span>' : '<span class="mfn">lim</span>';
          return `<span class="mop"><span class="mopu">${hi}</span>${sym}<span class="mopd">${lo}</span></span>`;
        }
        if (name === 'dd') return 'd';
        if (name === 'dot' || name === 'ddot') return `<span class="m${name}">${atom()}</span>`;
        if (/^(Bigl|Bigr|bigl|bigr|Biggl|Biggr|bigg|Bigg)$/.test(name)) { ws(); if (s[i] === '\\') { const n2 = readCmd(); return n2 === '{' || n2 === '}' ? `<span class="mdelim mbigd">${n2}</span>` : ''; } const d = s[i++]; return d === '.' ? '' : `<span class="mdelim mbigd">${htmlEsc(d)}</span>`; }
        if (name === 'left' || name === 'right' || name === 'big' || name === 'Big') { ws(); if (s[i] === '\\') { const n2 = readCmd(); return n2 === '{' || n2 === '}' ? n2 : ''; } const d = s[i++]; return d === '.' ? '' : `<span class="mdelim">${htmlEsc(d)}</span>`; }
        if (name === 'text' || name === 'textrm' || name === 'mbox') return `<span class="mtext">${M.toHTML(raw(), opt)}</span>`;
        if (name === 'mathrm' || name === 'mathsf' || name === 'rm') return `<span class="mtext">${M.mathHTML(raw(), Object.assign({}, opt, { upright: true })).replace(/^<span class="math">|<\/span>$/g, '')}</span>`;
        if (name === 'underline') return `<span class="munder">${atom()}</span>`;
        if (name === 'vec' || name === 'overrightarrow') return `<span class="mvec">${atom()}</span>`;   // ベクトル（第4巻。第35回）
        if (name === 'phantom') return `<span class="mphantom">${atom()}</span>`;
        if (name === 'bar' || name === 'overline') return `<span class="mbar">${atom()}</span>`;
        if (name === 'hat') return `<span class="mhat">${atom()}</span>`;
        if (name === 'mu' && opt.upright) return 'μ';
        if (MATHFN.includes(name)) return `<span class="mfn">${name}</span>`;
        if (name === ',' || name === ';' || name === ':') return '<span class="mthin"></span>';
        if (name === 'quad' || name === 'qquad') return '<span class="mquad"></span>';
        if (name === ' ') return ' ';
        if (name === '\\') return '<br>';
        if (MATHSYM[name] != null) { const t = MATHSYM[name]; return /^[×÷·±∓≤≥≦≧≠≒→]$/.test(t) ? op(t) : t; }
        return htmlEsc(name);
      }
      if (/[0-9.]/.test(c)) { let j = i; while (i < s.length && /[0-9.]/.test(s[i])) i++; return s.slice(j, i); }
      i++;
      if (/[a-zA-Z]/.test(c)) return opt.upright ? c : `<i class="mi">${c}</i>`;
      if (c === '-') return op('<span class="mminus">−</span>');
      if (c === '+' || c === '=' || c === '<' || c === '>') return op(htmlEsc(c));
      if (c === '□') return opt.box || '<span class="box"></span>';
      if (c === "'") return '′';
      if (c === '*') return op('×');
      return htmlEsc(c);
    }
    function seq(end) {
      let out = '';
      while (i < s.length && s[i] !== end) {
        if (s[i] === '^' || s[i] === '_') { const k = s[i++]; const x = atom(); out += k === '^' ? (x === '°' ? '<span class="mdeg">°</span>' : `<sup>${x}</sup>`) : `<sub>${x}</sub>`; continue; }   // 度は上つきにしない（字の大きさのまま。第35回）
        out += atom();
      }
      return out;
    }
    return `<span class="math">${seq(undefined)}</span>`;
  };
  // 数式の値（小数）。vars は文字の値 { x: 1.3 }。読めないときは null
  M.evalMath = function (src, vars) {
    vars = vars || {};
    const s = String(src).replace(/\\left|\\right|\\,|\\;|\\!|\\quad|\\displaystyle/g, ' ').replace(/\\[lr]?vert/g, '|').replace(/\\cdot|\\times/g, '*').replace(/\\div/g, '/')
      .replace(/\\dfrac|\\tfrac/g, '\\frac').replace(/[−－]/g, '-').replace(/＋/g, '+').replace(/×/g, '*').replace(/÷/g, '/')
      // 帯分数（数字のすぐあとの \frac{数}{数}）は、たし算として読む：2\frac{1}{3} → (2+\frac{1}{3})。指数・下つきの中の数は除く
      .replace(/(^|[^0-9.^_{])(\d+)\s*\\frac\{(\d+)\}\{(\d+)\}/g, '$1($2+\\frac{$3}{$4})');
    let i = 0;
    const ws = () => { while (i < s.length && s[i] === ' ') i++; };
    const peek = () => { ws(); return s[i]; };
    const cmdAt = () => { if (s[i] !== '\\') return null; const m = /^\\([a-zA-Z]+)/.exec(s.slice(i)); return m ? m[1] : null; };
    const startsAtom = () => { const c = peek(); if (c === undefined) return false; if (/[0-9.a-zA-Z({]/.test(c)) return true; const n = cmdAt(); return !!n && (['frac', 'sqrt', 'pi', 'log', 'ln', 'sin', 'cos', 'tan', 'exp'].includes(n) || n in vars); };
    const FN = ['sin', 'cos', 'tan', 'log', 'ln', 'exp'];
    // 三角関数の中身：\sin2\theta は sin(2θ)。つぎの関数（\cos など）・＋・－ の前まで（第4巻。第35回）
    function fnArg() { let v = power(); for (;;) { ws(); const n = cmdAt(); if (n && FN.includes(n)) return v; if (s[i] === '(' || !startsAtom()) return v; v *= power(); } }
    function group() { // {…} か 1字
      ws();
      if (s[i] === '{') { i++; const v = expr(); ws(); if (s[i] !== '}') throw 0; i++; return v; }
      return primary();
    }
    function primary() {
      ws();
      const c = s[i];
      if (c === undefined) throw 0;
      if (c === '(' || c === '[') { i++; const v = expr(); ws(); if (s[i] !== ')' && s[i] !== ']') throw 0; i++; return v; }
      if (c === '{') return group();
      if (c === '|') { i++; const v = expr(); ws(); if (s[i] !== '|') throw 0; i++; return Math.abs(v); }
      if (/[0-9.]/.test(c)) { let j = i; while (i < s.length && /[0-9.]/.test(s[i])) i++; const v = parseFloat(s.slice(j, i)); if (isNaN(v)) throw 0; return v; }
      if (/[a-zA-Z]/.test(c)) { i++; if (c === 'e' && !('e' in vars)) return Math.E; if (!(c in vars)) throw 0; return vars[c]; }   // e は、文字の値がなければネイピア数（第5巻。第37回）
      if (c === '\\') {
        const n = cmdAt(); if (!n) throw 0; i += n.length + 1;
        if (n === 'frac') { const a = group(), b = group(); return a / b; }
        if (n === 'sqrt') { ws(); let k = 2; if (s[i] === '[') { const j = s.indexOf(']', i); k = M.evalMath(s.slice(i + 1, j), vars); i = j + 1; } const v = group(); return k === 2 ? Math.sqrt(v) : Math.pow(v, 1 / k); }
        if (n === 'pi') return Math.PI;
        if (n === 'log') { ws(); let b = 10; if (s[i] === '_') { i++; b = group(); } const v = power(); return Math.log(v) / Math.log(b); }
        if (n === 'ln') return Math.log(power());
        if (n === 'exp') return Math.exp(power());
        if (n === 'sin' || n === 'cos' || n === 'tan') { ws(); let e = 1; if (s[i] === '^') { i++; e = group(); } const v = Math[n](fnArg()); return Math.pow(v, e); }   // \sin^{2}x も読む
        if (n in vars) return vars[n];   // \theta などのギリシャ文字の変数
        throw 0;
      }
      throw 0;
    }
    function power() {
      let v = primary();
      ws();
      if (s[i] === '!') { i++; if (v < 0 || v > 170 || v !== Math.round(v)) throw 0; let f = 1; for (let k = 2; k <= v; k++) f *= k; v = f; ws(); }   // 階乗（第5巻）
      if (s.startsWith('^{\\circ}', i) || s.startsWith('^\\circ', i)) { i += s.startsWith('^{', i) ? 8 : 6; return v * Math.PI / 180; }   // 度（第4巻。第35回）
      if (s[i] === '^') { i++; const e = group(); v = Math.pow(v, e); }
      return v;
    }
    function unary() { ws(); if (s[i] === '-') { i++; return -unary(); } if (s[i] === '+') { i++; return unary(); } return power(); }
    function term() {
      let v = unary();
      for (;;) {
        ws();
        if (s[i] === '*') { i++; v *= unary(); continue; }
        if (s[i] === '/') { i++; v /= unary(); continue; }
        if (startsAtom()) { v *= power(); continue; }
        return v;
      }
    }
    function expr() { let v = term(); for (;;) { ws(); if (s[i] === '+') { i++; v += term(); } else if (s[i] === '-') { i++; v -= term(); } else return v; } }
    try { const v = expr(); ws(); if (i !== s.length) return null; return isFinite(v) ? v : null; } catch (e) { return null; }
  };
  // 数式の中の文字（1字。\frac などの命令の中の字は除く）
  M.mathVars = function (src, o) {
    const g = (String(src).match(/\\(theta|alpha|beta|phi|varphi|omega|tau|lambda|mu)(?![a-zA-Z])/g) || []).map(x => x.slice(1));   // ギリシャ文字も変数（第35回）
    const t = String(src).replace(/\\[a-zA-Z]+/g, ' ');
    return [...new Set((t.match(/[a-zA-Z]/g) || []).concat(g))].filter(n => !(o && o.econst && n === 'e'));   // 第5巻から e は定数
  };
  const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  // 文の中の数式を1つだけ取り出す（文が「$…$」だけ、または「$…$ ＝ □」のとき）
  function onlyMath(t) { const m = /^\s*\$([^$]*)\$\s*(?:＝\s*□)?\s*$/.exec(String(t)); return m ? m[1] : null; }
  // ルビをとった、ただの文字（検算・同じ問題の判定用）
  M.plain = function (s) {
    return (s || '').replace(/\*\*/g, '').replace(TOKEN, (_, t) => t.startsWith('f:') ? t.slice(2) : t.split('|')[0]);
  };
  // 問題の文に □ がなければ、答えの欄を最後につける
  M.withBox = function (q) {
    if (q.includes('□')) return q;
    // 式が「＝」「不等号」をふくむとき（方程式など）は、「＝ □」ではなく、うしろに欄だけをつける
    if (/\$[^$]*(?:=|<|>|\\le|\\ge)[^$]*\$\s*$/.test(q)) return q + '　□';
    return q + ' ＝ □';
  };
  // 見わけようの問題の数：わざが多い部は、右ページの「この部のわざ」の表が入るように減らす（第30回）
  M.miwakeCount = (part, nWaza) => Math.min(part.miwake.count, Math.max(14, 22 - Math.max(0, Math.ceil((nWaza - 10) / 2))));

  // ---------------------------------------------------------------- ひっ算（第29回：依頼者の指示 11月6日）
  // 問題の物に hs: { op: '+'|'-'|'*'|'/', a: '386', b: '47' } をつけると、ひっ算の形（方眼）で組む。
  // M.hissanLayout(hs) は、方眼のどこに何の字を書くか（全部の段）を返す：
  //   { W, H, cells[r][c] = { t, ans }（ans が true の字は答え。問題では書かない）, rules: [{r, c0, c1}]（r の段の下の線）,
  //     bracket: { r, c0, c1 }|null（わり算の「）」と上の線。r はわられる数の段）, dots: [{r, c}]（c のますの右下に小数点） }
  function digitsOf(x) { return String(x); }
  M.hissanLayout = function (hs) {
    const op = hs.op;
    let W, H, cells, rules = [], bracket = null, dots = [];
    const grid = (h, w) => Array.from({ length: h }, () => Array(w).fill(null));
    const put = (r, cEnd, str, ans) => { // str の右はしを cEnd に
      for (let i = 0; i < str.length; i++) cells[r][cEnd - str.length + 1 + i] = { t: str[i], ans: !!ans };
    };
    if (op === '+' || op === '-') {
      const sa = String(hs.a), sb = String(hs.b);
      const fr = s => (s.split('.')[1] || '').length;
      const F = Math.max(fr(sa), fr(sb));
      const sc = s => { const [i, f = ''] = s.split('.'); return BigInt(i + f.padEnd(F, '0')); };
      const v = op === '+' ? sc(sa) + sc(sb) : sc(sa) - sc(sb);
      if (v < 0n) throw new Error('ひっ算：答えがマイナス');
      let rs = v.toString().padStart(F + 1, '0');
      const rint = rs.slice(0, rs.length - F), rfr = rs.slice(rs.length - F);
      const ip = s => s.split('.')[0];
      const intW = Math.max(ip(sa).length, ip(sb).length, rint.length);
      W = 1 + intW + F; H = 3; cells = grid(H, W);
      const place = (r, s, ans, keepFrac) => {
        const [i, f = ''] = s.split('.');
        put(r, intW, i, ans);
        const ff = keepFrac ? f : f;
        for (let k = 0; k < ff.length; k++) cells[r][intW + 1 + k] = { t: ff[k], ans: !!ans };
        if (s.includes('.') || (keepFrac && F > 0)) dots.push({ r, c: intW });
      };
      place(0, sa, false);
      place(1, sb, false);
      cells[1][0] = { t: op === '+' ? '＋' : '－', ans: false, op: true };
      rules.push({ r: 1, c0: 0, c1: W - 1 });
      place(2, F ? rint + '.' + rfr : rint, true, true);
      // くり上がり（小さい 1）・くり下がり（ななめの線と、小さく書いた へった数）。教科書 1-7 の書き方
      const small = [], slash = [];
      const dig = (r, c) => { const x = cells[r][c]; return x && /^[0-9]$/.test(x.t) ? +x.t : null; };
      if (op === '+') {
        let carry = 0;
        for (let c = W - 1; c >= 1; c--) {
          const x = dig(0, c), y = dig(1, c);
          if (x === null && y === null && !carry) continue;
          const t = (x || 0) + (y || 0) + carry;
          carry = t >= 10 ? 1 : 0;
          if (carry && c - 1 >= 1 && (dig(0, c - 1) !== null || dig(1, c - 1) !== null)) small.push({ c: c - 1, t: '1' });
        }
      } else {
        const cur = []; for (let c = 0; c < W; c++) cur[c] = dig(0, c);
        const changed = new Map();
        for (let c = W - 1; c >= 1; c--) {
          const y = dig(1, c) || 0;
          if (cur[c] === null) { if (y) cur[c] = 0; else continue; }
          if (cur[c] >= y) continue;
          let k = c - 1; while (k >= 1 && !cur[k]) k--;
          if (k < 1) break;
          cur[k]--; changed.set(k, cur[k]);
          for (let j = k + 1; j < c; j++) if (cur[j] !== null) { cur[j] = 9; changed.set(j, 9); }
          cur[c] += 10;
        }
        changed.forEach((t, c) => { slash.push({ r: 0, c }); small.push({ c, t: String(t) }); });
      }
      return { W, H, cells, rules, bracket, dots, result: F ? rint + '.' + rfr : rint, small, slash, top: small.length ? 0.5 : 0 };
    }
    if (op === '*') {
      const sa = String(hs.a), sb = String(hs.b);
      const A = BigInt(sa), R = A * BigInt(sb);
      const parts = [];
      for (let i = 0; i < sb.length; i++) { const d = +sb[sb.length - 1 - i]; if (d) parts.push({ v: (A * BigInt(d)).toString(), i }); }
      const rs = R.toString();
      W = Math.max(sa.length, sb.length + 1, rs.length, ...parts.map(p => p.v.length + p.i));
      const multi = parts.length > 1;
      H = multi ? 3 + parts.length : 3;
      cells = grid(H, W);
      put(0, W - 1, sa, false);
      put(1, W - 1, sb, false);
      // 1けたを かけるときは、くり上がりの数を 上に 小さく書く（2けた以上を かけるときは、段ごとに ちがうので書かない）
      const small = [];
      if (sb.length === 1) {
        let carry = 0;
        for (let i = sa.length - 1; i >= 0; i--) {
          const t = +sa[i] * +sb + carry; carry = Math.floor(t / 10);
          if (carry && i > 0) small.push({ c: W - sa.length + i - 1, t: String(carry) });
        }
      }
      cells[1][0] = { t: '×', ans: false, op: true };
      rules.push({ r: 1, c0: 0, c1: W - 1 });
      if (multi) {
        parts.forEach((p, k) => put(2 + k, W - 1 - p.i, p.v, true));
        rules.push({ r: 2 + parts.length - 1, c0: 0, c1: W - 1 });
        put(H - 1, W - 1, rs, true);
      } else {
        put(2, W - 1, rs, true);
      }
      return { W, H, cells, rules, bracket, dots, result: rs, partials: parts.map(p => p.v), small, slash: [], top: small.length ? 0.5 : 0 };
    }
    if (op === '/') {
      const sD = String(hs.a), d = Number(hs.b), sd = String(hs.b), L = sD.length;
      const off = sd.length + 1;
      W = off + L;
      const rows = [];            // わられる数より下の段：{ cells: Map(c → t) , rule }
      const quot = Array(L).fill(null);
      let pos = 0, cur = +sD[0];
      while (cur < d && pos < L - 1) { pos++; cur = cur * 10 + +sD[pos]; }
      let curRow = null;          // null はわられる数の段
      let rem = cur;
      for (;;) {
        const qd = Math.floor(cur / d);
        quot[pos] = qd;
        if (qd === 0) {
          if (pos === L - 1) { rem = cur; break; }
          pos++; cur = cur * 10 + +sD[pos];
          // おろした段は、いまの数（頭に 0 を書かない。404 ÷ 4 の2段目は「04」ではなく「4」）
          if (curRow) { curRow.cells.clear(); const t = String(cur); for (let i = 0; i < t.length; i++) curRow.cells.set(pos - t.length + 1 + i, t[i]); }
          continue;
        }
        const prod = String(qd * d);
        const prow = { cells: new Map(), rule: null };
        for (let i = 0; i < prod.length; i++) prow.cells.set(pos - prod.length + 1 + i, prod[i]);
        const left = Math.min(pos - prod.length + 1, pos - String(cur).length + 1);
        prow.rule = { c0: left, c1: pos };
        rows.push(prow);
        rem = cur - qd * d;
        const nrow = { cells: new Map(), rule: null };
        if (pos === L - 1) {
          const t = String(rem);
          for (let i = 0; i < t.length; i++) nrow.cells.set(pos - t.length + 1 + i, t[i]);
          rows.push(nrow);
          break;
        }
        pos++;
        const t = String(rem * 10 + +sD[pos]);
        for (let i = 0; i < t.length; i++) nrow.cells.set(pos - t.length + 1 + i, t[i]);
        rows.push(nrow);
        curRow = nrow;
        cur = rem * 10 + +sD[pos];
      }
      // 商の頭の0は書かない
      let first = quot.findIndex(x => x !== null && x !== 0);
      if (first < 0) first = L - 1;
      H = 2 + rows.length;
      cells = grid(H, W);
      for (let i = first; i < L; i++) if (quot[i] !== null) cells[0][off + i] = { t: String(quot[i]), ans: true };
      put(1, sd.length - 1, sd, false);
      for (let i = 0; i < L; i++) cells[1][off + i] = { t: sD[i], ans: false };
      bracket = { r: 1, c0: off, c1: W - 1, cb: sd.length };
      rows.forEach((row, k) => {
        row.cells.forEach((t, c) => { cells[2 + k][off + c] = { t, ans: true }; });
        if (row.rule) rules.push({ r: 2 + k, c0: off + row.rule.c0, c1: off + row.rule.c1, step: true });
      });
      const q = quot.slice(first).map(x => x || 0).join('');
      return { W, H, cells, rules, bracket, dots, result: String(+q), rem };
    }
    throw new Error('ひっ算：知らない計算 ' + op);
  };
  // SVG（アプリ）。answer が true なら答えの字も書く。cell はますの大きさ（mm）
  M.hissanSVG = function (L, opt) {
    opt = opt || {};
    const c = opt.cell || 8, W = L.W, H = L.H, T = L.top || 0;
    let s = `<svg class="hs" xmlns="http://www.w3.org/2000/svg" viewBox="-0.1 ${-T - 0.1} ${W + 0.2} ${H + T + 0.2}" width="${W * c}mm" height="${(H + T) * c}mm">`;
    if (opt.answer) {
      (L.small || []).forEach(m => { s += `<text x="${m.c + 0.5}" y="${-0.06}" text-anchor="middle" font-size="0.42" fill="#b3261e">${m.t}</text>`; });
      (L.slash || []).forEach(m => { s += `<line x1="${m.c + 0.25}" y1="${m.r + 0.85}" x2="${m.c + 0.75}" y2="${m.r + 0.15}" stroke="#b3261e" stroke-width="0.06"/>`; });
    }
    for (let r = 0; r < H; r++) for (let k = 0; k < W; k++) s += `<rect x="${k}" y="${r}" width="1" height="1" fill="none" stroke="#c9c9c9" stroke-width="0.03"/>`;
    for (let r = 0; r < H; r++) for (let k = 0; k < W; k++) {
      const x = L.cells[r][k]; if (!x) continue;
      if (x.ans && !opt.answer) continue;
      s += `<text x="${k + 0.5}" y="${r + 0.78}" text-anchor="middle" font-size="0.78" fill="${x.ans ? '#b3261e' : '#222'}"${x.ans ? ' font-weight="bold"' : ''}>${x.t}</text>`;
    }
    L.rules.forEach(u => { if (u.step && !opt.answer) return; s += `<line x1="${u.c0}" y1="${u.r + 1}" x2="${u.c1 + 1}" y2="${u.r + 1}" stroke="#222" stroke-width="0.07"/>`; });
    L.dots.forEach(d => { if (!opt.answer && L.cells[d.r][d.c] && L.cells[d.r][d.c].ans) return; s += `<circle cx="${d.c + 1}" cy="${d.r + 0.85}" r="0.07" fill="#222"/>`; });
    if (L.bracket) {
      const b = L.bracket;
      s += `<line x1="${b.c0}" y1="${b.r}" x2="${b.c1 + 1}" y2="${b.r}" stroke="#222" stroke-width="0.07"/>`;
      s += `<path d="M ${b.c0} ${b.r} Q ${b.c0 + 0.32} ${b.r + 0.5} ${b.c0 - 0.12} ${b.r + 1}" fill="none" stroke="#222" stroke-width="0.07"/>`;
    }
    return s + '</svg>';
  };
  // TikZ（本）。cell は mm
  M.hissanTeX = function (L, opt) {
    opt = opt || {};
    const c = opt.cell || 7.5, W = L.W, H = L.H;
    const fs = opt.font || '\\large';
    let s = `\\begin{tikzpicture}[x=${c}mm, y=-${c}mm, baseline=(current bounding box.north)]`;
    if (L.top) s += `\\path (0,${-L.top}) (${W},${-L.top});`;
    s += `\\draw[bkLine!70, line width=0.3pt] (0,0) grid (${W},${H});`;
    if (opt.answer) {
      (L.small || []).forEach(m => { s += `\\node[inner sep=0pt, font=\\tiny\\bfseries, text=bkDeep] at (${m.c + 0.5},${-L.top / 2}) {${m.t}};`; });
      (L.slash || []).forEach(m => { s += `\\draw[bkDeep, line width=0.6pt] (${m.c + 0.25},${m.r + 0.85}) -- (${m.c + 0.75},${m.r + 0.15});`; });
    }
    for (let r = 0; r < H; r++) for (let k = 0; k < W; k++) {
      const x = L.cells[r][k]; if (!x) continue;
      if (x.ans && !opt.answer) continue;
      s += `\\node[inner sep=0pt, font=${fs}${x.ans ? '\\bfseries, text=bkDeep' : ''}] at (${k + 0.5},${r + 0.52}) {${x.t}};`;
    }
    L.rules.forEach(u => { if (u.step && !opt.answer) return; s += `\\draw[bkInk, line width=0.9pt] (${u.c0},${u.r + 1}) -- (${u.c1 + 1},${u.r + 1});`; });
    L.dots.forEach(d => { if (!opt.answer && L.cells[d.r][d.c] && L.cells[d.r][d.c].ans) return; s += `\\fill[bkInk] (${d.c + 1},${d.r + 0.86}) circle (0.075);`; });
    if (L.bracket) {
      const b = L.bracket;
      s += `\\draw[bkInk, line width=0.9pt] (${b.c0},${b.r}) -- (${b.c1 + 1},${b.r});`;
      s += `\\draw[bkInk, line width=0.9pt] (${b.c0},${b.r}) .. controls (${b.c0 + 0.34},${b.r + 0.35}) and (${b.c0 + 0.34},${b.r + 0.65}) .. (${b.c0 - 0.12},${b.r + 1});`;
    }
    return s + '\\end{tikzpicture}';
  };


  // ---------------------------------------------------------------- 図（第4巻から。第35回）
  // 1つの書き方から、アプリの SVG（M.figSVG）と、本の TikZ（M.figTeX）を作る。座標は数学の向き（y は上）。
  // fig = { s: 1単位の mm（ふつう 5）, pad: 余白の単位, items: [ … ] }
  //   ['seg', P, Q, {dash, arrow, thick}]       線分（arrow: true で Q に矢じり）
  //   ['poly', [P, Q, R, …], {fill, dash}]       多角形（閉じる）。fill: true で うすくぬる
  //   ['path', [P, Q, …], {dash, arrow}]         折れ線（閉じない）
  //   ['circle', C, r, {dash, fill}]             円
  //   ['arc', C, r, 度0, 度1, {dash, arrow}]     弧（反時計まわり）
  //   ['dot', P, {open}]                         点（open: 白丸）
  //   ['label', P, '文字', '向き']               ラベル。向き：n・s・e・w・ne・nw・se・sw・c。文字の $…$ は式
  //   ['angle', A, B, C, '文字', r]              角 ABC のしるし（B が頂点、A→C の向きに弧）と、その角の文字
  //   ['right', A, B, C, 大きさ]                 角 ABC が直角のしるし
  //   ['angle', A, B, C, '文字', r, n, d]        n＝2・3 で、弧を2重・3重に（同じ大きさの角）。d は弧から文字までの距離（ふつう 0.75）
  //   ['axes', …, {o: 'se'}]                     O の向き（ふつう 'sw'。false で書かない）
  //   ['par', P, Q, n]                           辺 PQ のまん中に、平行のしるし（＞を n こ）
  //   ['ellipse', C, rx, ry, 度0, 度1, {dash}]   だ円の弧（円すい・円柱の底。度を省くと1周）
  //   ['tick', P, Q, n]                          辺 PQ のまん中に、同じ長さのしるし（n 本）
  //   ['grid', x0, y0, x1, y1]                   方眼（1単位ごと）
  //   ['axes', x0, x1, y0, y1, {x: 'x', y: 'y', o: true}]   座標軸（矢じりつき）と O
  const FIGSYM = { ell: 'ℓ', sojisym: '∽', infty: '∞', lvert: '|', rvert: '|', mid: '|', pm: '±', le: '≤', ge: '≥', leqq: '≦', geqq: '≧', sim: '∽', theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', phi: 'φ', varphi: 'φ', pi: 'π', omega: 'ω', circ: '°', degree: '°', times: '×', cdot: '·', prime: '′', perp: '⊥', parallel: '∥', angle: '∠', triangle: '△' };
  function figText(s) {   // SVG の字：$…$ の中の文字は斜体、TeX の記号は Unicode に
    return String(s).split(/(\$[^$]*\$)/).map((seg, k) => {
      if (!(k % 2)) return htmlEsc(seg);
      const up = []; let t = seg.slice(1, -1).replace(/\\(?:mathrm|text)\{([^}]*)\}/g, (m, x) => { up.push(x); return '\u0001' + (up.length - 1) + '\u0002'; }).replace(/\\vec\{([^}]*)\}|\\vec\s*(\S)/g, (m, a, b) => (a || b) + '\u20D7').replace(/\\sqrt\{([^}]*)\}/g, '√$1').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\^\{?\\circ\}?/g, '°')
        .replace(/\\([a-zA-Z]+)/g, (m, n) => FIGSYM[n] || n).replace(/\^\{([^}]*)\}|\^(\S)/g, (m, a, b) => '\u0003' + (a || b) + '\u0004').replace(/_\{([^}]*)\}|_(\S)/g, (m, a, b) => '\u0005' + (a || b) + '\u0006').replace(/[{}]/g, '').replace(/\\,/g, ' ').replace(/-/g, '−');
      t = htmlEsc(t).replace(/[A-Za-z]\u20D7?/g, c => c.length > 1 ? `<tspan font-style="italic" font-family="Times New Roman,serif">${c[0]}</tspan><tspan dx="-0.72em" dy="-0.95em" font-size="75%">→</tspan><tspan dy="0.95em" font-size="75%">\u200B</tspan>` : `<tspan font-style="italic" font-family="Times New Roman,serif">${c}</tspan>`);   // \vec の矢印は小さい → を上に（組合せ文字は出ないことがある）
      t = t.replace(/\u0001(\d+)\u0002/g, (m, k) => htmlEsc(up[k]));   // \mathrm{A} は立てた字
      return t.replace(/\u0003([^\u0004]*)\u0004/g, '<tspan baseline-shift="super" font-size="70%">$1</tspan>').replace(/\u0005([^\u0006]*)\u0006/g, '<tspan baseline-shift="sub" font-size="70%">$1</tspan>');
    }).join('');
  }
  // グラフ（第5巻から。第37回）：x と y で別の倍率。G = M.graph({ x0, x1, y0, y1, w, h })（w・h は図の単位。ふつう w 10、h 7）
  //   G.T(x, y) → 図の点。G.axes({ xt: [1, 2], yt: [5], x: 'x', y: 'y', o, xfmt }) → 座標軸と目もりの項目の配列
  //   G.plot(f, a, b, { n, dash, thick }) → 曲線（折れ線。わくの外で切る）の項目の配列
  //   G.area(f, g, a, b, { hatch, fill }) → f と g（省くと 0）のあいだのぬり（多角形）の項目
  M.graph = function (o) {
    const sx = o.w / (o.x1 - o.x0), sy = o.h / (o.y1 - o.y0), T = (x, y) => [x * sx, y * sy];
    const fmt = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(+v.toFixed(3))).replace('-', '−');
    return {
      T, sx, sy,
      axes(a) {
        a = a || {};
        const its = [['axes', o.x0 * sx - (o.x0 < 0 ? 0 : 0.6), o.x1 * sx + 0.8, o.y0 * sy - (o.y0 < 0 ? 0 : 0.6), o.y1 * sy + 0.8, { x: a.x, y: a.y, o: a.o }]];
        (a.xt || []).forEach(t => { its.push(['seg', [t * sx, -0.15], [t * sx, 0.15]], ['label', [t * sx, 0], a.xfmt ? a.xfmt(t) : fmt(t), 's']); });
        (a.yt || []).forEach(t => { its.push(['seg', [-0.15, t * sy], [0.15, t * sy]], ['label', [0, t * sy], a.yfmt ? a.yfmt(t) : fmt(t), 'w']); });
        return its;
      },
      plot(f, a, b, st) {
        st = st || {}; const n = st.n || 80, its = []; let cur = [];
        for (let k = 0; k <= n; k++) {
          const x = a + (b - a) * k / n, y = f(x);
          if (isFinite(y) && y >= o.y0 - 1e-9 && y <= o.y1 + 1e-9) cur.push(T(x, y)); else { if (cur.length > 1) its.push(['path', cur, st]); cur = []; }
        }
        if (cur.length > 1) its.push(['path', cur, st]);
        return its;
      },
      area(f, g, a, b, st) {
        st = Object.assign({ fill: true, noline: true }, st || {}); const n = st.n || 60, top = [], bot = [];
        for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; top.push(T(x, f(x))); bot.push(T(x, g ? g(x) : 0)); }
        return ['poly', top.concat(bot.reverse()), st];
      },
    };
  };
  // 立体の見取図：(x 右, y おく行き, z 上) を紙の上の点に（斜投影。おく行きは k 倍して、角 deg の向きへ）
  M.proj3 = (p, k = 0.5, deg = 30) => [p[0] + k * p[1] * Math.cos(deg * Math.PI / 180), p[2] + k * p[1] * Math.sin(deg * Math.PI / 180)];
  //   立体の例：const Q = p => M.proj3(p); items: [['poly', [Q([0,0,0]), Q([3,0,0]), Q([3,0,2]), Q([0,0,2])]], ['seg', Q([0,0,0]), Q([0,4,0]), {dash: true}], …]
  function figBox(fig) {   // 図の大きさ（単位）。ラベルの分の余白を足す
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const P = p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); };
    for (const it of fig.items) {
      const [k, a, b, c, d] = it;
      if (k === 'seg' || k === 'tick') { P(a); P(b); }
      else if (k === 'poly' || k === 'path') a.forEach(P);
      else if (k === 'circle' || k === 'arc') { P([a[0] - b, a[1] - b]); P([a[0] + b, a[1] + b]); }
      else if (k === 'ellipse') { P([a[0] - b, a[1] - c]); P([a[0] + b, a[1] + c]); }
      else if (k === 'par') { P(a); P(b); }
      else if (k === 'dot') P(a);
      else if (k === 'label') {   // ラベルの字のはばも入れる（組 f の要望）。字の大きさは 3.4 mm、1字はおよそ 0.6 字ぶん（漢字・かなは1字）
        P(a); const u = (fig.font || 3.4) / (fig.s || 5), v = ANCH[c || 'c'] || ANCH.c;
        const txt = String(b).replace(/\$/g, '').replace(/\\(?:mathrm|text|vec|overrightarrow)\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_ ]/g, '');
        const w = [...txt].reduce((t, ch) => t + (/[\u3000-\u9fff]/.test(ch) ? 1 : 0.6), 0) * u, cx = a[0] + v[0] * 0.75 * u, cy = a[1] + v[1] * 0.75 * u;
        const L = v[0] > 0.3 ? cx : v[0] < -0.3 ? cx - w : cx - w / 2;
        P([L, cy - 0.45 * u]); P([L + w, cy + 0.6 * u]);
      }
      else if (k === 'angle' || k === 'right') {
        P(a); P(b); P(c);
        if (k === 'angle' && d) {   // 角の文字も図の大きさに入れる（修A の要望）。置き場所は figSVG と同じ
          const [a0, a1] = angleArc(a, b, c), m = (a0 + a1) / 2, R = (it[5] || 0.8) + (it[7] != null ? it[7] : 0.75), u = (fig.font || 3.4) / (fig.s || 5);
          const txt = String(d).replace(/\$/g, '').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_ ]/g, ''), w = [...txt].length * 0.6 * u;
          const cx = b[0] + R * Math.cos(m), cy = b[1] + R * Math.sin(m);
          P([cx - w / 2, cy - 0.45 * u]); P([cx + w / 2, cy + 0.6 * u]);
        }
      }
      else if (k === 'grid') { P([a, b]); P([c, d]); }
      else if (k === 'axes') { P([a, c]); P([b, d]); }
    }
    const pad = fig.pad == null ? 0.9 : fig.pad;
    return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  }
  const ANCH = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.8, 0.8], nw: [-0.8, 0.8], se: [0.8, -0.8], sw: [-0.8, -0.8], c: [0, 0] };
  function angleArc(A, B, C) {   // B から見た A・C の向き（ラジアン）。小さいほうの角（反時計まわりに a0→a1）
    let a0 = Math.atan2(A[1] - B[1], A[0] - B[0]), a1 = Math.atan2(C[1] - B[1], C[0] - B[0]);
    let d = a1 - a0; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    if (d < 0) { const t = a0; a0 = a1; a1 = t; d = -d; }
    return [a0, a0 + d];
  }
  M.figSVG = function (fig, opt) {
    opt = opt || {};
    const s = fig.s || 5, [bx0, by0, bx1, by1] = figBox(fig);
    const X = x => +((x - bx0) * s).toFixed(2), Y = y => +((by1 - y) * s).toFixed(2);
    const W = (bx1 - bx0) * s, H = (by1 - by0) * s, fs = fig.font || 3.4;
    const st = o => `stroke="currentColor" stroke-width="${o && o.thick ? 0.5 : 0.3}" fill="none"${o && o.dash ? ' stroke-dasharray="1.2 0.9"' : ''}`;
    const head = (P, Q) => { const a = Math.atan2(Q[1] - P[1], Q[0] - P[0]), L = 1.6 / s, w = 0.45; const p1 = [Q[0] - L * Math.cos(a - w), Q[1] - L * Math.sin(a - w)], p2 = [Q[0] - L * Math.cos(a + w), Q[1] - L * Math.sin(a + w)]; return `<path d="M${X(Q[0])} ${Y(Q[1])} L${X(p1[0])} ${Y(p1[1])} L${X(p2[0])} ${Y(p2[1])} Z" fill="currentColor"/>`; };
    let o = `<svg class="mqfig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" width="${W.toFixed(1)}mm" height="${H.toFixed(1)}mm">`;
    for (const it of fig.items) {
      const k = it[0];
      if (k === 'grid') { const [, x0, y0, x1, y1] = it; for (let x = Math.ceil(x0); x <= x1; x++) o += `<line x1="${X(x)}" y1="${Y(y0)}" x2="${X(x)}" y2="${Y(y1)}" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.2"/>`; for (let y = Math.ceil(y0); y <= y1; y++) o += `<line x1="${X(x0)}" y1="${Y(y)}" x2="${X(x1)}" y2="${Y(y)}" stroke="currentColor" stroke-opacity="0.25" stroke-width="0.2"/>`; }
      else if (k === 'axes') { const [, x0, x1, y0, y1, a] = it, aa = a || {}; o += `<line x1="${X(x0)}" y1="${Y(0)}" x2="${X(x1)}" y2="${Y(0)}" ${st()}/>` + head([x0, 0], [x1, 0]) + `<line x1="${X(0)}" y1="${Y(y0)}" x2="${X(0)}" y2="${Y(y1)}" ${st()}/>` + head([0, y0], [0, y1]);
        o += `<text x="${X(x1) - 0.5}" y="${Y(0) + fs * 1.2}" font-size="${fs}" text-anchor="end">${figText('$' + (aa.x || 'x') + '$')}</text><text x="${X(0) + 1}" y="${Y(y1) + fs * 0.8}" font-size="${fs}">${figText('$' + (aa.y || 'y') + '$')}</text>`;
        if (aa.o !== false) { const v = ANCH[typeof aa.o === 'string' ? aa.o : 'sw'] || ANCH.sw, dx = v[0] * fs * 0.75, dy = -v[1] * fs * 0.75; o += `<text x="${(X(0) + dx).toFixed(2)}" y="${(Y(0) + dy + fs * 0.35).toFixed(2)}" font-size="${fs}" text-anchor="${v[0] > 0.3 ? 'start' : v[0] < -0.3 ? 'end' : 'middle'}">${figText('O')}</text>`; } }   // o：'sw'（ふつう）・'se'・'ne'・'nw' で O の向き、false で書かない
      else if (k === 'seg') { const [, P, Q, a] = it; o += `<line x1="${X(P[0])}" y1="${Y(P[1])}" x2="${X(Q[0])}" y2="${Y(Q[1])}" ${st(a)}/>` + (a && a.arrow ? head(P, Q) : ''); }
      else if (k === 'poly' || k === 'path') { const [, ps, a] = it, fl = a && (a.fill || a.hatch);
        if (a && a.hatch) o += `<defs><pattern id="mqhatch" patternUnits="userSpaceOnUse" width="1.2" height="1.2" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.2" stroke="currentColor" stroke-width="0.25"/></pattern></defs>`;
        o += `<path d="${ps.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' ')}${k === 'poly' ? ' Z' : ''}" ${fl ? st(a).replace('fill="none"', a.hatch ? 'fill="url(#mqhatch)"' : 'fill="currentColor" fill-opacity="0.08"') : st(a)}${a && a.noline ? ' stroke-opacity="0"' : ''}/>` + (k === 'path' && a && a.arrow ? head(ps[ps.length - 2], ps[ps.length - 1]) : ''); }
      else if (k === 'circle') { const [, C, r, a] = it; o += `<circle cx="${X(C[0])}" cy="${Y(C[1])}" r="${(r * s).toFixed(2)}" ${st(a)}${a && a.fill ? ' fill="currentColor" fill-opacity="0.08"' : ''}/>`; }
      else if (k === 'arc') { const [, C, r, d0, d1, a] = it, a0 = d0 * Math.PI / 180, a1 = d1 * Math.PI / 180, P = [C[0] + r * Math.cos(a0), C[1] + r * Math.sin(a0)], Q = [C[0] + r * Math.cos(a1), C[1] + r * Math.sin(a1)];
        o += `<path d="M${X(P[0])} ${Y(P[1])} A${(r * s).toFixed(2)} ${(r * s).toFixed(2)} 0 ${(d1 - d0) % 360 > 180 ? 1 : 0} 0 ${X(Q[0])} ${Y(Q[1])}" ${st(a)}/>` + (a && a.arrow ? head([C[0] + r * Math.cos(a1 - 0.05), C[1] + r * Math.sin(a1 - 0.05)], Q) : ''); }
      else if (k === 'dot') { const [, P, a] = it; o += `<circle cx="${X(P[0])}" cy="${Y(P[1])}" r="0.7" ${a && a.open ? 'fill="white" stroke="currentColor" stroke-width="0.3"' : 'fill="currentColor"'}/>`; }
      else if (k === 'label') { const [, P, t, d] = it, v = ANCH[d || 'c'] || ANCH.c, dx = v[0] * fs * 0.75, dy = -v[1] * fs * 0.75; o += `<text x="${(X(P[0]) + dx).toFixed(2)}" y="${(Y(P[1]) + dy + fs * 0.35).toFixed(2)}" font-size="${fs}" text-anchor="${v[0] > 0.3 ? 'start' : v[0] < -0.3 ? 'end' : 'middle'}">${figText(t)}</text>`; }
      else if (k === 'angle') { const [, A, B, C, t, rr] = it, r = rr || 0.8, [a0, a1] = angleArc(A, B, C), P = [B[0] + r * Math.cos(a0), B[1] + r * Math.sin(a0)], Q = [B[0] + r * Math.cos(a1), B[1] + r * Math.sin(a1)];
        for (let j = 0; j < (it[6] || 1); j++) { const rj = r + j * 0.22, Pj = [B[0] + rj * Math.cos(a0), B[1] + rj * Math.sin(a0)], Qj = [B[0] + rj * Math.cos(a1), B[1] + rj * Math.sin(a1)]; o += `<path d="M${X(Pj[0])} ${Y(Pj[1])} A${(rj * s).toFixed(2)} ${(rj * s).toFixed(2)} 0 0 0 ${X(Qj[0])} ${Y(Qj[1])}" ${st()}/>`; }
        if (t) { const m = (a0 + a1) / 2, R = r + (it[7] != null ? it[7] : 0.75); o += `<text x="${X(B[0] + R * Math.cos(m))}" y="${(Y(B[1] + R * Math.sin(m)) + fs * 0.35).toFixed(2)}" font-size="${fs}" text-anchor="middle">${figText(t)}</text>`; } }
      else if (k === 'right') { const [, A, B, C, ss] = it, q = ss || 0.5, u = n => { const L = Math.hypot(n[0] - B[0], n[1] - B[1]); return [(n[0] - B[0]) / L * q, (n[1] - B[1]) / L * q]; }, a = u(A), c = u(C);
        o += `<path d="M${X(B[0] + a[0])} ${Y(B[1] + a[1])} L${X(B[0] + a[0] + c[0])} ${Y(B[1] + a[1] + c[1])} L${X(B[0] + c[0])} ${Y(B[1] + c[1])}" ${st()}/>`; }
      else if (k === 'ellipse') { const [, C, rx, ry, d0, d1, a] = it; if (d0 == null) o += `<ellipse cx="${X(C[0])}" cy="${Y(C[1])}" rx="${(rx * s).toFixed(2)}" ry="${(ry * s).toFixed(2)}" ${st(a)}/>`; else { const pts = []; for (let j = 0; j <= 40; j++) { const t = (d0 + (d1 - d0) * j / 40) * Math.PI / 180; pts.push([C[0] + rx * Math.cos(t), C[1] + ry * Math.sin(t)]); } o += `<path d="${pts.map((p, j) => (j ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' ')}" ${st(a)}/>`; } }
      else if (k === 'par') { const [, P, Q, n] = it, mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, a = Math.atan2(Q[1] - P[1], Q[0] - P[0]), L = 0.3; for (let j = 0; j < (n || 1); j++) { const off = (j - ((n || 1) - 1) / 2) * 0.25, cx = mx + off * Math.cos(a), cy = my + off * Math.sin(a); const p1 = [cx - L * Math.cos(a - 0.6), cy - L * Math.sin(a - 0.6)], p2 = [cx - L * Math.cos(a + 0.6), cy - L * Math.sin(a + 0.6)]; o += `<path d="M${X(p1[0])} ${Y(p1[1])} L${X(cx)} ${Y(cy)} L${X(p2[0])} ${Y(p2[1])}" ${st()}/>`; } }
      else if (k === 'tick') { const [, P, Q, n] = it, mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, a = Math.atan2(Q[1] - P[1], Q[0] - P[0]), L = 0.3, g = 0.18;
        for (let i = 0; i < (n || 1); i++) { const off = (i - ((n || 1) - 1) / 2) * g, cx = mx + off * Math.cos(a), cy = my + off * Math.sin(a); o += `<line x1="${X(cx - L * Math.sin(a))}" y1="${Y(cy + L * Math.cos(a))}" x2="${X(cx + L * Math.sin(a))}" y2="${Y(cy - L * Math.cos(a))}" ${st()}/>`; } }
    }
    return o + '</svg>';
  };
  M.figTeX = function (fig, opt) {
    opt = opt || {};
    const s = fig.s || 5, f = v => +(+v).toFixed(3), P = p => `(${f(p[0])},${f(p[1])})`;
    const sty = a => [a && a.dash ? 'densely dashed' : '', a && a.thick ? 'thick' : '', a && a.arrow ? '-{Stealth[length=1.6mm]}' : ''].filter(Boolean).join(',');
    const lab = t => M.toTeX(t);
    const TIKZA = { n: 'above', s: 'below', e: 'right', w: 'left', ne: 'above right', nw: 'above left', se: 'below right', sw: 'below left', c: '' };
    let o = `\\begin{tikzpicture}[x=${s}mm,y=${s}mm,line width=0.3mm,font=\\small,baseline=(current bounding box.north)]`;
    const [bx0, by0, bx1, by1] = figBox(fig);
    o += `\\useasboundingbox (${f(bx0)},${f(by0)}) rectangle (${f(bx1)},${f(by1)});`;
    for (const it of fig.items) {
      const k = it[0];
      if (k === 'grid') { const [, x0, y0, x1, y1] = it; o += `\\draw[black!25,line width=0.2mm,step=1] (${x0},${y0}) grid (${x1},${y1});`; }
      else if (k === 'axes') { const [, x0, x1, y0, y1, a] = it, aa = a || {}; o += `\\draw[-{Stealth[length=1.6mm]}] (${x0},0)--(${x1},0) node[below left]{$${aa.x || 'x'}$};\\draw[-{Stealth[length=1.6mm]}] (0,${y0})--(0,${y1}) node[below right]{$${aa.y || 'y'}$};` + (aa.o !== false ? `\\node[${TIKZA[typeof aa.o === 'string' ? aa.o : 'sw'] || TIKZA.sw},inner sep=1.5pt] at (0,0) {O};` : ''); }
      else if (k === 'seg') { const [, A, B, a] = it; o += `\\draw[${sty(a)}] ${P(A)}--${P(B)};`; }
      else if (k === 'poly') { const [, ps, a] = it; o += `\\${a && a.noline ? 'path' : 'draw'}[${sty(a)}${a && a.fill ? ',fill=black!8' : ''}${a && a.hatch ? ',pattern=north east lines' : ''}] ${ps.map(P).join('--')}--cycle;`; }   // hatch：斜線のぬり（第5巻）
      else if (k === 'path') { const [, ps, a] = it; o += `\\draw[${sty(a)}] ${ps.map(P).join('--')};`; }
      else if (k === 'circle') { const [, C, r, a] = it; o += `\\draw[${sty(a)}${a && a.fill ? ',fill=black!8' : ''}] ${P(C)} circle (${f(r)});`; }
      else if (k === 'arc') { const [, C, r, d0, d1, a] = it; o += `\\draw[${sty(a)}] (${f(C[0] + r * Math.cos(d0 * Math.PI / 180))},${f(C[1] + r * Math.sin(d0 * Math.PI / 180))}) arc[start angle=${d0},end angle=${d1},radius=${f(r)}];`; }
      else if (k === 'dot') { const [, A, a] = it; o += a && a.open ? `\\draw[fill=white] ${P(A)} circle (0.7mm);` : `\\fill ${P(A)} circle (0.7mm);`; }
      else if (k === 'label') { const [, A, t, d] = it; o += `\\node[${TIKZA[d || 'c']},inner sep=1.5pt] at ${P(A)} {${lab(t)}};`; }
      else if (k === 'angle') { const [, A, B, C, t, rr] = it, r = rr || 0.8, [a0, a1] = angleArc(A, B, C), d0 = a0 * 180 / Math.PI, d1 = a1 * 180 / Math.PI, m = (a0 + a1) / 2;
        for (let j = 0; j < (it[6] || 1); j++) { const rj = r + j * 0.22; o += `\\draw (${f(B[0] + rj * Math.cos(a0))},${f(B[1] + rj * Math.sin(a0))}) arc[start angle=${f(d0)},end angle=${f(d1)},radius=${f(rj)}];`; }
        if (t) { const R = r + (it[7] != null ? it[7] : 0.75); o += `\\node at (${f(B[0] + R * Math.cos(m))},${f(B[1] + R * Math.sin(m))}) {${lab(t)}};`; } }
      else if (k === 'right') { const [, A, B, C, ss] = it, q = ss || 0.5, u = n => { const L = Math.hypot(n[0] - B[0], n[1] - B[1]); return [(n[0] - B[0]) / L * q, (n[1] - B[1]) / L * q]; }, a = u(A), c = u(C);
        o += `\\draw (${f(B[0] + a[0])},${f(B[1] + a[1])})--(${f(B[0] + a[0] + c[0])},${f(B[1] + a[1] + c[1])})--(${f(B[0] + c[0])},${f(B[1] + c[1])});`; }
      else if (k === 'ellipse') { const [, C, rx, ry, d0, d1, a] = it; o += d0 == null ? `\\draw[${sty(a)}] ${P(C)} ellipse[x radius=${f(rx)},y radius=${f(ry)}];` : `\\draw[${sty(a)}] (${f(C[0] + rx * Math.cos(d0 * Math.PI / 180))},${f(C[1] + ry * Math.sin(d0 * Math.PI / 180))}) arc[start angle=${d0},end angle=${d1},x radius=${f(rx)},y radius=${f(ry)}];`; }
      else if (k === 'par') { const [, A, B, n] = it, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, a = Math.atan2(B[1] - A[1], B[0] - A[0]), L = 0.3; for (let j = 0; j < (n || 1); j++) { const off = (j - ((n || 1) - 1) / 2) * 0.25, cx = mx + off * Math.cos(a), cy = my + off * Math.sin(a); o += `\\draw (${f(cx - L * Math.cos(a - 0.6))},${f(cy - L * Math.sin(a - 0.6))})--(${f(cx)},${f(cy)})--(${f(cx - L * Math.cos(a + 0.6))},${f(cy - L * Math.sin(a + 0.6))});`; } }
      else if (k === 'tick') { const [, A, B, n] = it, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, a = Math.atan2(B[1] - A[1], B[0] - A[0]), L = 0.3, g = 0.18;
        for (let i = 0; i < (n || 1); i++) { const off = (i - ((n || 1) - 1) / 2) * g, cx = mx + off * Math.cos(a), cy = my + off * Math.sin(a); o += `\\draw (${f(cx - L * Math.sin(a))},${f(cy + L * Math.cos(a))})--(${f(cx + L * Math.sin(a))},${f(cy - L * Math.cos(a))});`; } }
    }
    return o + '\\end{tikzpicture}';
  };

  // ---------------------------------------------------------------- 検算
  // 「47 × 9」「(25 ＋ 75) ＋ 37」「470 － 47」などの式の値を、分数（有理数）で計算する。
  // 読めない式（ことば・単位・□・あまり）は null を返す。
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
  function Q(n, d) { d = d || 1; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; }
  const add = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
  const sub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
  const mul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
  const div = (x, y) => (y[0] === 0 ? null : Q(x[0] * y[1], x[1] * y[0]));
  M.evalExpr = function (src) {
    if (src == null) return null;
    let s = M.plain(String(src)).replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/＋/g, '+').replace(/[－−]/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/[（]/g, '(').replace(/[）]/g, ')').replace(/\s+/g, '');
    if (!/^[0-9.+\-*/()]+$/.test(s)) return null;
    let i = 0;
    const peek = () => s[i];
    function num() {
      let j = i; while (i < s.length && /[0-9.]/.test(s[i])) i++;
      const t = s.slice(j, i);
      if (!t) throw 0;
      if (t.includes('.')) { const [a, b] = t.split('.'); return Q(parseInt(a + b, 10), Math.pow(10, b.length)); }
      return Q(parseInt(t, 10), 1);
    }
    function atom() {
      if (peek() === '(') { i++; const v = expr(); if (peek() !== ')') throw 0; i++; return v; }
      if (peek() === '-') { i++; const v = atom(); return Q(-v[0], v[1]); }
      return num();
    }
    function term() {
      let v = atom();
      while (peek() === '*' || peek() === '/') {
        const op = s[i++]; const w = atom();
        v = op === '*' ? mul(v, w) : div(v, w);
        if (!v) throw 0;
      }
      return v;
    }
    function expr() {
      let v = term();
      while (peek() === '+' || peek() === '-') { const op = s[i++]; const w = term(); v = op === '+' ? add(v, w) : sub(v, w); }
      return v;
    }
    try { const v = expr(); if (i !== s.length) return null; return v; } catch (e) { return null; }
  };
  // その問題に使えるわざ（作ったわざ ＋ p.also ＋ 部の中で fits(問題の文) が true のわざ）
  M.usableWaza = function (p, candidates) {
    // わなの問題は、作ったわざでは楽にならない。ほかのわざ（also・fits）で楽になるなら、それを書く
    const out = (p.step === 'trap' ? [] : [p.id]).concat(p.also || []);
    const q = M.plain(p.q);
    (candidates || []).forEach(id => { const d = M.waza[id]; if (d && d.fits && !out.includes(id) && !(p.step === 'trap' && id === p.id)) { try { if (d.fits(q, p)) out.push(id); } catch (e) { } } });
    return [...new Set(out)].sort();
  };
  // 「分」の読み（ふん／ぷん）：数の一の位で決める（1・3・4・6・8・0 は ぷん、2・5・7・9 は ふん）。M.fun(10) → '《分|ぷん》'
  M.funYomi = n => ([1, 3, 4, 6, 8, 0].includes(Math.abs(Math.round(n)) % 10) ? 'ぷん' : 'ふん');
  M.fun = n => '《分|' + M.funYomi(n) + '》';
  // 分数の部品（第2巻から、どの組も使う）。分数は [分子, 分母]（分母は正、約分ずみ）
  M.F = {
    gcd: (a, b) => gcd(a, b),
    lcm: (a, b) => Math.abs(a * b) / gcd(a, b),
    make: (n, d) => Q(n, d == null ? 1 : d),
    add: (x, y) => add(x, y), sub: (x, y) => sub(x, y), mul: (x, y) => mul(x, y), div: (x, y) => div(x, y),
    eq: (x, y) => x[0] === y[0] && x[1] === y[1],
    val: x => x[0] / x[1],
    // 小数の文字（'0.125'）から分数へ
    fromDec: t => { const [i, f = ''] = String(t).split('.'); return Q(parseInt(i + f, 10) * (String(t).trim().startsWith('-') && parseInt(i + f, 10) > 0 ? -1 : 1), Math.pow(10, f.length)); },
    // TeX の文字：整数ならそのまま、分数は \frac{}{}、負の数は前に －。mixed:true なら帯分数
    tex: (x, o) => {
      o = o || {};
      const [n, d] = x, sg = n < 0 ? '-' : '', a = Math.abs(n);
      if (d === 1) return sg + a;
      if (o.mixed && a > d) return sg + Math.floor(a / d) + '\\frac{' + (a % d) + '}{' + d + '}';
      return sg + '\\frac{' + a + '}{' + d + '}';
    },
  };
  // ---------------------------------------------------------------- 微分・積分の答えの検算（第5巻から。第37回）
  // 問題の物に calc: { kind, f, ans, x, a, b, pts } をつける。f・ans は TeX の式（x の関数。e は定数）。
  //   kind 'diff'  ：ans が f の導関数か（中心差分でくらべる）。展開した形もしない形も通る
  //   kind 'int'   ：ans（「+C」をふくむ）が f の不定積分か（+C を取って微分し、f とくらべる）。p.a に +C がなければまちがい
  //   kind 'defint'：ans の値が、f を a〜b で積分した値か（シンプソン法）。a・b も TeX の式でよい（\frac{\pi}{2} など）
  //   ans を省くと p.a の式を使う（「$f'(x)=…$」のときは、＝ の右）。x は変数の名前（ふつう 'x'。'\\theta'・'t' など）。pts はくらべる x の値
  M.calcCheck = function (p) {
    const c = p.calc, errs = [], X = String(c.x || 'x').replace(/^\\/, '');
    let ans = c.ans != null ? String(c.ans) : (onlyMath(p.a) || String(p.a).replace(/\$/g, ''));
    if (c.ans == null && ans.includes('=')) ans = ans.slice(ans.lastIndexOf('=') + 1);
    const pts = c.pts || [0.37, 0.83, 1.29];
    const ev = (t, x) => M.evalMath(t, { [X]: x });
    const near = (u, v) => Math.abs(u - v) <= 1e-6 * Math.max(1, Math.abs(u), Math.abs(v));
    if (c.kind === 'diff') {
      for (const x of pts) {
        const h = 1e-5, d = (ev(c.f, x + h) - ev(c.f, x - h)) / (2 * h), va = ev(ans, x);
        if (va == null || !isFinite(d)) { errs.push(`calc：式が読めない（${va == null ? ans : c.f}）`); break; }
        if (Math.abs(d - va) > 1e-4 * Math.max(1, Math.abs(d))) { errs.push(`calc：微分がちがう（x=${x} で ${d.toFixed(5)} と ${va.toFixed(5)}）`); break; }
      }
    } else if (c.kind === 'int') {
      if (!/\+\s*C\s*\$?\s*$/.test(String(p.a))) errs.push('calc：不定積分の答えに +C がない');
      const F = ans.replace(/\+\s*C\s*$/, '');
      for (const x of pts) {
        const h = 1e-5, d = (ev(F, x + h) - ev(F, x - h)) / (2 * h), vf = ev(c.f, x);
        if (vf == null || !isFinite(d)) { errs.push(`calc：式が読めない（${vf == null ? c.f : F}）`); break; }
        if (Math.abs(d - vf) > 1e-4 * Math.max(1, Math.abs(vf))) { errs.push(`calc：積分がちがう（x=${x}）`); break; }
      }
    } else if (c.kind === 'defint') {
      const a = M.evalMath(String(c.a), {}), b = M.evalMath(String(c.b), {}), va = M.evalMath(ans, {});
      if (a == null || b == null || va == null) errs.push('calc：はしか答えが読めない');
      else {
        const n = 2000, hh = (b - a) / n; let sum = ev(c.f, a) + ev(c.f, b);
        for (let k = 1; k < n; k++) sum += (k % 2 ? 4 : 2) * ev(c.f, a + k * hh);
        const I = sum * hh / 3;
        if (!isFinite(I)) errs.push('calc：中身が読めない'); else if (!near(I, va) && Math.abs(I - va) > 1e-7) errs.push(`calc：定積分がちがう（${I} と ${va}）`);
      }
    } else errs.push('calc：kind がちがう');
    return errs;
  };
  // 多項式（第5巻から）：係数は M.F の分数。P = [c0, c1, c2, …]（cK は x^K の係数）
  M.P = {
    make: (...cs) => cs.map(c => Array.isArray(c) ? c : M.F.make(c)),
    add: (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, k) => M.F.add(a[k] || M.F.make(0), b[k] || M.F.make(0))),
    scale: (a, c) => a.map(x => M.F.mul(x, Array.isArray(c) ? c : M.F.make(c))),
    mul: (a, b) => { const o = Array.from({ length: a.length + b.length - 1 }, () => M.F.make(0)); a.forEach((x, i) => b.forEach((y, j) => { o[i + j] = M.F.add(o[i + j], M.F.mul(x, y)); })); return o; },
    pow: (a, n) => { let o = [M.F.make(1)]; for (let k = 0; k < n; k++) o = M.P.mul(o, a); return o; },
    diff: a => a.slice(1).map((x, k) => M.F.mul(x, M.F.make(k + 1))),
    integ: a => [M.F.make(0)].concat(a.map((x, k) => M.F.div(x, M.F.make(k + 1)))),
    at: (a, x) => a.reduceRight((acc, c) => M.F.add(M.F.mul(acc, Array.isArray(x) ? x : M.F.make(x)), c), M.F.make(0)),   // 分数で返す
    val: (a, x) => a.reduceRight((acc, c) => acc * x + M.F.val(c), 0),
    // TeX：高い次から。v は変数の名前。係数1・−1 は書かない。分数の係数は \frac{2}{3}x^{3}
    tex: (a, v) => {
      v = v || 'x'; let o = '';
      for (let k = a.length - 1; k >= 0; k--) {
        const c = a[k]; if (!c || c[0] === 0) continue;
        const neg = c[0] < 0, ab = [Math.abs(c[0]), c[1]], one = ab[0] === 1 && ab[1] === 1;
        const body = (k === 0 ? M.F.tex(ab) : (one ? '' : M.F.tex(ab))) + (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`);
        o += (o ? (neg ? '-' : '+') : (neg ? '-' : '')) + body;
      }
      return o || '0';
    },
  };
  M.sameVal = (x, y) => x && y && x[0] === y[0] && x[1] === y[1];
  // 数式の問題の検算：答え（a）が式なら、問題の式・楽な形の式（＝ で区切ったどれも）と、文字に3とおりの値を入れて同じ値になるか
  function checkMath(p) {
    const errs = [];
    const aM = onlyMath(p.a);
    if (aM == null || /[=<>]|\\(?:le|ge|ne|pm)/.test(aM)) return errs;   // 答えが式でない（x ＝ 3 など）ときは verify にまかせる
    const qM = (() => { const m = onlyMath(p.q); if (m == null || m.includes('□')) return null; const k = m.lastIndexOf('='); return k >= 0 ? null : m; })();
    let eParts = typeof p.easy === 'string' && p.easyCheck !== false ? (p.easy.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1)).flatMap(t => t.split('=')).map(t => t.trim()).filter(Boolean) : [];
    // easyCheck: 'last' のときは、楽な形の いちばん最後の式だけをくらべる（途中の式「$3\times4=12$」などを書くとき）
    if (p.easyCheck === 'last') eParts = eParts.slice(-1);
    const valM = p.val != null ? (onlyMath(p.val) != null ? onlyMath(p.val) : String(p.val)) : null;
    const econst = !!(p.id && M.waza[p.id] && M.waza[p.id].vol >= 5);
    const names = [...new Set([aM, qM || '', ...eParts].flatMap(t => M.mathVars(t, { econst })))];
    const sets = [0.37, 1.71, -2.29].map((b, k) => Object.fromEntries(names.map((n, j) => [n, b + 0.53 * j + 0.11 * k])));
    for (const vs of sets) {
      const va = M.evalMath(aM, vs);
      if (va == null) return errs;
      const target = valM != null ? M.evalMath(valM, vs) : va;
      if (qM != null) { const vq = M.evalMath(qM, vs); if (vq != null && !close(vq, va)) { errs.push(`式の値と答え ${p.a} がちがう`); break; } }
      for (const e of eParts) { const ve = M.evalMath(e, vs); if (ve != null && target != null && !close(ve, target)) { errs.push(`楽な形「${e}」の値が答えとちがう`); return errs; } }
    }
    return errs;
  }
  // 1つの問題を確かめる。まちがいがあれば、理由の文字列の配列を返す
  M.checkProblem = function (p) {
    const errs = [];
    if (!p || typeof p.q !== 'string' || p.a == null) return ['q か a がない'];
    const left = M.plain(p.q).split('＝')[0];
    const vq = p.q.includes('□') ? null : M.evalExpr(left);
    const va = M.evalExpr(String(p.a));
    if (vq && va && !M.sameVal(vq, va)) errs.push(`式の値 ${vq} と答え ${p.a} がちがう`);
    if (p.easy && p.easyCheck !== false) {
      // 楽な形が「式」なら、その値も答えと同じはず（「＝」で区切られた式は、どれも同じ値）
      M.plain(p.easy).split('＝').forEach(part => {
        const ve = M.evalExpr(part);
        // p.val があれば、楽な形はその値とくらべる（答えが □ の一部だけのときなど）
        const target = p.val != null ? M.evalExpr(String(p.val)) : (va || vq);
        if (ve && target && !M.sameVal(ve, target)) errs.push(`楽な形「${part.trim()}」の値が答えとちがう`);
      });
    }
    if (p.hs) {
      try {
        const L = M.hissanLayout(p.hs);
        const want = String(p.a).replace(/\s/g, '');
        const got = L.result + (L.rem ? 'あまり' + L.rem : '');
        if (M.plain(want) !== got) errs.push(`ひっ算の答え ${got} と a ${p.a} がちがう`);
      } catch (e) { errs.push('ひっ算: ' + e.message); }
    }
    if ([p.q, p.a, p.easy].some(t => typeof t === 'string' && t.includes('$'))) errs.push(...checkMath(p));
    if (typeof p.verify === 'function') { const v = p.verify(p); if (v !== true) errs.push('verify: ' + v); }
    if (p.calc) errs.push(...M.calcCheck(p));
    return errs;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
