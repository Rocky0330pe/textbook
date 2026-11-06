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
  M.boxwOf = (def, step) => (def.boxw && typeof def.boxw === 'object') ? (def.boxw[step] || null) : (def.boxw || null);
  // 欄の高さ（分数の答えなど。第2巻から）。なければ ふつうの高さ
  M.boxhOf = (def, step) => (def.boxh && typeof def.boxh === 'object') ? (def.boxh[step] || null) : (def.boxh || null);
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
  const MK = t => String(t).replace(/\*\*(.+?)\*\*/g, '\u0001$1\u0002');
  M.toTeX = function (s, opt) {
    opt = opt || {};
    if (s == null) return '';
    s = String(s);
    // 数式（$…$、第2巻から）は、そのまま TeX に渡す。□ は欄に
    if (s.includes('$')) {
      return s.split(/(\$[^$]*\$)/).map((seg, k) => k % 2 ? seg.replace(/\\frac(?![a-z])/g, '\\dfrac').replace(/□/g, '\\mbox{' + (opt.box || '\\mqbox{}') + '}') : M.toTeX(seg, opt)).join('');
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
    if (s.includes('$')) {
      return s.split(/(\$[^$]*\$)/).map((seg, k) => k % 2 ? M.mathHTML(seg.slice(1, -1), opt) : M.toHTML(seg, opt)).join('');
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
    approx: '≒', to: '→', rightarrow: '→', infty: '∞', degree: '°', circ: '°', alpha: 'α', beta: 'β', theta: 'θ', lambda: 'λ', mu: 'μ', sigma: 'σ',
    Delta: 'Δ', omega: 'ω', Omega: 'Ω', rho: 'ρ', varphi: 'φ', phi: 'φ', ldots: '…', cdots: '⋯', prime: '′', percent: '%', '%': '%', '{': '{', '}': '}', '$': '$', '#': '#', '&': '&' };
  const MATHFN = ['log', 'ln', 'sin', 'cos', 'tan', 'exp', 'max', 'min', 'lim'];
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
        if (name === 'left' || name === 'right' || name === 'big' || name === 'Big') { ws(); if (s[i] === '\\') { const n2 = readCmd(); return n2 === '{' || n2 === '}' ? n2 : ''; } const d = s[i++]; return d === '.' ? '' : d === '-' ? '−' : d; }
        if (name === 'text' || name === 'mathrm' || name === 'textrm' || name === 'mbox' || name === 'mathsf') return `<span class="mtext">${M.toHTML(raw(), opt)}</span>`;
        if (MATHFN.includes(name)) return `<span class="mfn">${name}</span>`;
        if (name === ',' || name === ';' || name === ':') return '<span class="mthin"></span>';
        if (name === 'quad' || name === 'qquad') return '<span class="mquad"></span>';
        if (name === ' ') return ' ';
        if (name === '\\') return '<br>';
        if (MATHSYM[name] != null) { const t = MATHSYM[name]; return /^[×÷·±∓≤≥≠≒→]$/.test(t) ? op(t) : t; }
        return htmlEsc(name);
      }
      if (/[0-9.]/.test(c)) { let j = i; while (i < s.length && /[0-9.]/.test(s[i])) i++; return s.slice(j, i); }
      i++;
      if (/[a-zA-Z]/.test(c)) return `<i class="mi">${c}</i>`;
      if (c === '-') return op('−');
      if (c === '+' || c === '=' || c === '<' || c === '>') return op(htmlEsc(c));
      if (c === '□') return opt.box || '<span class="box"></span>';
      if (c === "'") return '′';
      if (c === '*') return op('×');
      return htmlEsc(c);
    }
    function seq(end) {
      let out = '';
      while (i < s.length && s[i] !== end) {
        if (s[i] === '^' || s[i] === '_') { const k = s[i++]; const x = atom(); out += k === '^' ? `<sup>${x}</sup>` : `<sub>${x}</sub>`; continue; }
        out += atom();
      }
      return out;
    }
    return `<span class="math">${seq(undefined)}</span>`;
  };
  // 数式の値（小数）。vars は文字の値 { x: 1.3 }。読めないときは null
  M.evalMath = function (src, vars) {
    vars = vars || {};
    const s = String(src).replace(/\\left|\\right|\\,|\;|\\!|\\quad/g, ' ').replace(/\\cdot|\\times/g, '*').replace(/\\div/g, '/')
      .replace(/\\dfrac|\\tfrac/g, '\\frac').replace(/[−－]/g, '-').replace(/＋/g, '+').replace(/×/g, '*').replace(/÷/g, '/');
    let i = 0;
    const ws = () => { while (i < s.length && s[i] === ' ') i++; };
    const peek = () => { ws(); return s[i]; };
    const cmdAt = () => { if (s[i] !== '\\') return null; const m = /^\\([a-zA-Z]+)/.exec(s.slice(i)); return m ? m[1] : null; };
    const startsAtom = () => { const c = peek(); if (c === undefined) return false; if (/[0-9.a-zA-Z({]/.test(c)) return true; const n = cmdAt(); return !!n && ['frac', 'sqrt', 'pi', 'log', 'ln', 'sin', 'cos', 'tan', 'exp'].includes(n); };
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
      if (/[a-zA-Z]/.test(c)) { i++; if (!(c in vars)) throw 0; return vars[c]; }
      if (c === '\\') {
        const n = cmdAt(); if (!n) throw 0; i += n.length + 1;
        if (n === 'frac') { const a = group(), b = group(); return a / b; }
        if (n === 'sqrt') { ws(); let k = 2; if (s[i] === '[') { const j = s.indexOf(']', i); k = M.evalMath(s.slice(i + 1, j), vars); i = j + 1; } const v = group(); return k === 2 ? Math.sqrt(v) : Math.pow(v, 1 / k); }
        if (n === 'pi') return Math.PI;
        if (n === 'log') { ws(); let b = 10; if (s[i] === '_') { i++; b = group(); } const v = power(); return Math.log(v) / Math.log(b); }
        if (n === 'ln') return Math.log(power());
        if (n === 'exp') return Math.exp(power());
        if (n === 'sin') return Math.sin(power()); if (n === 'cos') return Math.cos(power()); if (n === 'tan') return Math.tan(power());
        throw 0;
      }
      throw 0;
    }
    function power() {
      let v = primary();
      ws();
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
  M.mathVars = function (src) {
    const t = String(src).replace(/\\[a-zA-Z]+/g, ' ');
    return [...new Set((t.match(/[a-zA-Z]/g) || []))];
  };
  const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  // 文の中の数式を1つだけ取り出す（文が「$…$」だけ、または「$…$ ＝ □」のとき）
  function onlyMath(t) { const m = /^\s*\$([^$]*)\$\s*(?:＝\s*□)?\s*$/.exec(String(t)); return m ? m[1] : null; }
  // ルビをとった、ただの文字（検算・同じ問題の判定用）
  M.plain = function (s) {
    return (s || '').replace(/\*\*/g, '').replace(TOKEN, (_, t) => t.startsWith('f:') ? t.slice(2) : t.split('|')[0]);
  };
  // 問題の文に □ がなければ、答えの欄を最後につける
  M.withBox = function (q) { return q.includes('□') ? q : q + ' ＝ □'; };

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
  M.sameVal = (x, y) => x && y && x[0] === y[0] && x[1] === y[1];
  // 数式の問題の検算：答え（a）が式なら、問題の式・楽な形の式（＝ で区切ったどれも）と、文字に3とおりの値を入れて同じ値になるか
  function checkMath(p) {
    const errs = [];
    const aM = onlyMath(p.a);
    if (aM == null || /[=<>]|\\(?:le|ge|ne|pm)/.test(aM)) return errs;   // 答えが式でない（x ＝ 3 など）ときは verify にまかせる
    const qM = (() => { const m = onlyMath(p.q); if (m == null || m.includes('□')) return null; const k = m.lastIndexOf('='); return k >= 0 ? null : m; })();
    const eParts = typeof p.easy === 'string' && p.easyCheck !== false ? (p.easy.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1)).flatMap(t => t.split('=')).map(t => t.trim()).filter(Boolean) : [];
    const valM = p.val != null ? (onlyMath(p.val) != null ? onlyMath(p.val) : String(p.val)) : null;
    const names = [...new Set([aM, qM || '', ...eParts].flatMap(M.mathVars))];
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
    if (typeof p.verify === 'function') { const v = p.verify(); if (v !== true) errs.push('verify: ' + v); }
    return errs;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
