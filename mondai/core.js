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
  M.DEFAULT_COUNTS = { s1: 10, s2: 8, s3: 6, trap: 2 };
  M.add = function (def) {
    if (!/^[1-9]-[0-9]{2}$/.test(def.id)) throw new Error('わざの番号の形がちがう: ' + def.id);
    if (M.waza[def.id]) throw new Error('わざの番号が2つある: ' + def.id);
    def.vol = def.vol || +def.id.split('-')[0];
    def.counts = Object.assign({}, M.DEFAULT_COUNTS, def.counts || {});
    M.waza[def.id] = def;
    M.order.push(def.id);
  };
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
    norm(text).split(/[\s,、，]+/).filter(Boolean).forEach(w => {
      const rg = w.split('~');
      if (rg.length === 2) {
        const a = one(rg[0]), b = one(rg[1].includes('-') ? rg[1] : (rg[0].includes('-') ? rg[0].split('-')[0] + '-' + rg[1] : rg[1]));
        if (a && b) {
          M.list().forEach(id => { if (id >= a && id <= b) out.push(id); });
          return;
        }
      }
      const id = one(w);
      if (id) out.push(id);
    });
    return [...new Set(out)];
  };

  // ---------------------------------------------------------------- 問題を作る
  function key(p) { return p.q; }
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
    s = MK(s);
    let out = '', last = 0, m;
    TOKEN.lastIndex = 0;
    const plain = t => texEsc(t).replace(/□/g, opt.box || '\\mqbox{}');
    while ((m = TOKEN.exec(s))) {
      out += plain(s.slice(last, m.index));
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
  // ルビをとった、ただの文字（検算・同じ問題の判定用）
  M.plain = function (s) {
    return (s || '').replace(/\*\*/g, '').replace(TOKEN, (_, t) => t.startsWith('f:') ? t.slice(2) : t.split('|')[0]);
  };
  // 問題の文に □ がなければ、答えの欄を最後につける
  M.withBox = function (q) { return q.includes('□') ? q : q + ' ＝ □'; };

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
    if (p.step === 'trap') return [];
    const out = [p.id].concat(p.also || []);
    const q = M.plain(p.q);
    (candidates || []).forEach(id => { const d = M.waza[id]; if (d && d.fits && !out.includes(id)) { try { if (d.fits(q, p)) out.push(id); } catch (e) { } } });
    return [...new Set(out)].sort();
  };
  M.sameVal = (x, y) => x && y && x[0] === y[0] && x[1] === y[1];
  // 1つの問題を確かめる。まちがいがあれば、理由の文字列の配列を返す
  M.checkProblem = function (p) {
    const errs = [];
    if (!p || typeof p.q !== 'string' || p.a == null) return ['q か a がない'];
    const left = M.plain(p.q).split('＝')[0];
    const vq = p.q.includes('□') ? null : M.evalExpr(left);
    const va = M.evalExpr(String(p.a));
    if (vq && va && !M.sameVal(vq, va)) errs.push(`式の値 ${vq} と答え ${p.a} がちがう`);
    if (p.easy) {
      // 楽な形が「式」なら、その値も答えと同じはず（「＝」で区切られた式は、どれも同じ値）
      M.plain(p.easy).split('＝').forEach(part => {
        const ve = M.evalExpr(part);
        const target = va || vq;
        if (ve && target && !M.sameVal(ve, target)) errs.push(`楽な形「${part.trim()}」の値が答えとちがう`);
      });
    }
    if (typeof p.verify === 'function') { const v = p.verify(); if (v !== true) errs.push('verify: ' + v); }
    return errs;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
