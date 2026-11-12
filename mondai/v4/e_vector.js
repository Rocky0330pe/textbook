/* 問題集 第4巻『形と向き』　第5部 ベクトルと内積（わざ 4-63〜4-78、4-96・4-97）　組 e
 * 書き方は v4/README.md（第4巻の手引き）と v2/README.md。文は教科書 第4巻と同じ：ルビなし・常用漢字まで。式は $…$。
 * 答えが成分・ことば（「西へ 14 m/s」）・記号（$\overrightarrow{\mathrm{AD}}$）・角のときは verify で、問題を作った式とは別の道すじで計算し直して確かめる。
 * 図はステップ3だけ（4-68 の方眼。第35回 K-2）。電卓は使わない（角は 30°・45°・60° の仲間。K-4）。答えは √ を残した形（K-3）。
 * わなは、同じ部のほかのわざで楽にならないもの。当たるときは、easy に行き先を書いて also に入れる（dest。第29回 H-1）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const pr = v => (String(v).startsWith('-') ? `(${v})` : `${v}`);  // マイナスはかっこごと
  const P = (x, y) => `(${x},\\ ${y})`;                            // 座標・成分 (x,\ y)
  // 成分（TeX の文字）。分数があれば大きいかっこ
  const V2 = (x, y) => { const s = `${x},\\ ${y}`; return /\\frac/.test(s) ? `\\left(${s}\\right)` : `(${s})`; };
  const VN = arr => `(${arr.join(',\\ ')})`;                         // 成分が3つ以上
  const ar = s => `\\overrightarrow{\\mathrm{${s}}}`;                // ベクトル AB
  const pt = (n, x, y) => `$\\mathrm{${n}}${P(x, y)}$`;              // 点 A(1,\ 2)
  const un = (v, unit) => `$${v}\\,\\mathrm{${unit}}$`;              // 単位つき
  const dg = d => `${d}^{\\circ}`;
  const sfrac = (n, den) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${den}}`;   // 分子が負なら − を分数の前に（R2-17）
  // n = k^2 m（m は平方数でわれない）
  function surd(n) { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; }
  // p/q × √n を TeX に（約分・ルートの中を小さく）
  function rs(p, q, n) {
    q = q || 1; n = n == null ? 1 : n;
    if (p === 0 || n === 0) return '0';
    const [k, m] = surd(n); p *= k;
    const g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; }
    const sg = p < 0 ? '-' : '', a = Math.abs(p), rt = m === 1 ? '' : `\\sqrt{${m}}`;
    const num = m === 1 ? `${a}` : (a === 1 ? rt : `${a}${rt}`);
    return q === 1 ? sg + num : `${sg}\\frac{${num}}{${q}}`;
  }
  // 分数 p/q を TeX に。dec なら、わりきれる小数（0.6・1.25）で書く
  function tq(p, q, dec) {
    q = q || 1; const g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; }
    if (q === 1) return `${p}`;
    if (dec) { let t = q; while (t % 2 === 0) t /= 2; while (t % 5 === 0) t /= 5; if (t === 1) return fmt(p / q); }
    return `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}`;
  }
  // 小数（9.8 など）のかけ算を、10倍・100倍した整数で計算して小数に（浮動小数点のずれを出さない）
  const dmul = (...xs) => { let n = 1, d = 1; for (const x of xs) { const [i, f = ''] = String(x).split('.'); n *= parseInt(i + f, 10); d *= 10 ** f.length; } return tq(n, d, true); };

  // ---------------------------------------------------------------- 検算の部品（verify）
  // 成分の答え「$(12,\ -14)$」「$\left(\frac{3}{5},\ \frac{4}{5}\right)$」を、数の配列に
  function splitTop(t) {
    const out = []; let d = 0, cur = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '{' || c === '(') d++; else if (c === '}' || c === ')') d--;
      if (d === 0 && c === ',') { out.push(cur); cur = ''; if (t.slice(i + 1, i + 3) === '\\ ') i += 2; continue; }
      cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  }
  function vecOf(ans) {
    let t = strip(ans).replace(/\\left\(/g, '(').replace(/\\right\)/g, ')').trim();
    if (t[0] !== '(' || t[t.length - 1] !== ')') return null;
    return splitTop(t.slice(1, -1)).map(c => M.evalMath(c, {}));
  }
  // 成分の答えが、別の道すじで出した成分 want と同じか
  function vecOK(ans, want) {
    const v = vecOf(ans);
    if (!v || v.length !== want.length || v.some(x => x == null)) return `成分が読めない（${ans}）`;
    for (let i = 0; i < want.length; i++) if (!close(v[i], want[i])) return `${i + 1}つめの成分が ${fmt(want[i])} でない（${ans}）`;
    return true;
  }
  // 数の答え（√・分数・度もふくむ）が want と同じか
  function numOK(ans, want) {
    const v = M.evalMath(strip(ans), {});
    if (v == null) return `答えが読めない（${ans}）`;
    return close(v, want) || `答え ${ans} が ${fmt(want)} でない`;
  }
  const rad = d => d * Math.PI / 180;
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const len = a => Math.sqrt(dot(a, a));
  const add = (a, b) => a.map((x, i) => x + b[i]);
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const mul = (k, a) => a.map(x => k * x);
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  // 2つのベクトルのなす角（度）。atan2 で向きの角を出して差をとる（内積を使わない別の道すじ）
  function angBetween(a, b) {
    let d = Math.abs(Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])) * 180 / Math.PI;
    if (d > 180) d = 360 - d;
    return d;
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  const coords = q => [...q.matchAll(/\(([^(),]+),\\ ([^()]+?)\)/g)];   // 文の中の (x,\ y)
  const PERP = q => /東|西/.test(q) && /北|南/.test(q);                     // 直角な2つの向き

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  // extra：fits では当たらないが、行き先にするわざ（第36回 N-3）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(4).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 5 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (!also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')} で` : ''}）`;
    p.easyCheck = false;
    return p;
  }

  // 3辺が整数の直角三角形（直角をはさむ2辺、斜辺）
  const TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [15, 20, 25], [20, 21, 29], [10, 24, 26], [30, 40, 50]];
  // cmax：斜辺がこれ以下のものだけ（座標や速さが大きくなりすぎないように）
  const triPick = (r, cmax) => { const [a, b, c] = r.pick(TRI.filter(t => t[2] <= (cmax || 99))); return r.chance(0.5) ? [a, b, c] : [b, a, c]; };
  // 向き（東西南北）
  const DIR = { 東: [1, 0], 西: [-1, 0], 北: [0, 1], 南: [0, -1] };
  const OPP = { 東: '西', 西: '東', 北: '南', 南: '北' };
  const PERPS = [['東', '北'], ['東', '南'], ['西', '北'], ['西', '南'], ['北', '東'], ['北', '西'], ['南', '東'], ['南', '西']];

  // ================================================================ 4-63
  M.add({
    id: '4-63', part: 5, chap: '4-10③', stars: 1,
    title: '直角な2つの力の合力は三平方（大きさをそのままたさない）',
    mark: '東へ□N と北へ□N のように、**直角な向き**の2つの力（速度・移動）を合わせる。',
    futsu: ['方眼に2つの力の矢印をかき、', '長方形をかいて対角線を', 'ものさしではかる。'],
    raku: ['東へ12 N と北へ5 N は直角', '長方形の対角線＝斜辺：', '$\\sqrt{12^2+5^2}=\\sqrt{169}=13$', '13 N（$12+5=17$ ではない）'],
    why: '2つの力の合力は、2つの力を2辺とする平行四辺形の対角線。直角なら長方形になり、対角線は直角三角形の斜辺なので、三平方の定理で求められる（4-10③・4-4）。',
    caution: '大きさをそのままたしてよいのは、同じ向きのときだけ。向きが直角でない（60°・120° など）ときは、余弦定理（第3部のわざ 4-46）を使う。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '15mm',
    fits(q) {
      if (/から見|曲が|変化|川|流れ|つり合|つる|仕事|なす角|°|向きの成分/.test(q)) return false;
      if (/x\$?\s*成分が/.test(q) && /y\$?\s*成分が/.test(q) && /大きさ/.test(q)) return true;
      return PERP(q) && /合力|距離|速さ|向きの力/.test(q);
    },
    steps: {
      // 東へ a N、北へ b N（3辺が整数）
      s1(r) {
        const [a, b, c] = triPick(r), [d1, d2] = r.pick(PERPS);
        return {
          q: `${d1}へ ${un(a, 'N')}、${d2}へ ${un(b, 'N')} の2つの力の合力の大きさは □ N`,
          a: `$${c}$`, easy: `$\\sqrt{${a}^2+${b}^2}=${c}$`, key: `s1:${Math.min(a, b)},${Math.max(a, b)}`,
          verify: () => numOK(`$${c}$`, len(add(mul(a, DIR[d1]), mul(b, DIR[d2])))),
        };
      },
      // √ が残る合力・同じ大きさの2力・合力から片方を求める
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(1, 9), b = r.int(1, 9), n = a * a + b * b;
          if (Number.isInteger(Math.sqrt(n)) || a === b) return null;
          const ans = rs(1, 1, n), [d1, d2] = r.pick(PERPS);
          return {
            q: `${d1}へ ${un(a, 'N')}、${d2}へ ${un(b, 'N')} の2つの力の合力の大きさは □ N`,
            a: `$${ans}$`, easy: `$\\sqrt{${a}^2+${b}^2}=\\sqrt{${n}}${ans === `\\sqrt{${n}}` ? '' : `=${ans}`}$`, key: `s2:${Math.min(a, b)},${Math.max(a, b)}`,
            verify: () => numOK(`$${ans}$`, Math.hypot(a, b)),
          };
        }
        if (k === 1) {
          const a = r.int(2, 12), [d1, d2] = r.pick(PERPS);
          return {
            q: `${d1}へ ${un(a, 'N')}、${d2}へ ${un(a, 'N')} の2つの力の合力の大きさは □ N`,
            a: `$${a}\\sqrt{2}$`, easy: `$\\sqrt{${a}^2+${a}^2}=${a}\\sqrt{2}$`, key: `s2:${a},${a}`,
            verify: () => numOK(`$${a}\\sqrt{2}$`, len(add(mul(a, DIR[d1]), mul(a, DIR[d2])))),
          };
        }
        const [a, b, c] = triPick(r), [d1, d2] = r.pick(PERPS);
        return {
          q: `${d1}へ ${un(a, 'N')} の力と${d2}向きの力の合力が ${un(c, 'N')} のとき、${d2}向きの力は □ N`,
          a: `$${b}$`, easy: `$\\sqrt{${c}^2-${a}^2}=${b}$`,
          verify: () => numOK(`$${c}$`, Math.hypot(a, b)),
        };
      },
      // 場面：移動・一直線にまとめてから三平方・風に流されるドローン・成分から大きさ
      s3(r) {
        const k = r.int(0, 3), [a, b, c] = triPick(r, 26);
        if (k === 0) {
          const s = r.pick([1, 1, 0.1]), A = fmt(a * s), B = fmt(b * s), C = fmt(c * s);
          return { q: `家から自転車で東へ ${un(A, 'km')}、そこから北へ ${un(B, 'km')} 走った。家からまっすぐはかった距離は □ km`, a: `$${C}$`, easy: `$\\sqrt{${A}^2+${B}^2}=${C}$`, verify: () => numOK(`$${C}$`, Math.hypot(+A, +B)) };
        }
        if (k === 1) {
          const w = r.int(2, 9), e = a + w;
          return {
            q: `東へ ${un(e, 'N')}、西へ ${un(w, 'N')}、北へ ${un(b, 'N')} の3つの力の合力の大きさは □ N`,
            a: `$${c}$`, easy: `$\\sqrt{(${e}-${w})^2+${b}^2}=${c}$`,
            verify: () => numOK(`$${c}$`, len(add(add(mul(e, DIR['東']), mul(w, DIR['西'])), mul(b, DIR['北'])))),
          };
        }
        if (k === 2) {
          if (c > 30) return null;
          return { q: `空気に対して北へ ${un(b, 'm/s')} で飛ぶドローンが、東へ ${un(a, 'm/s')} の風に流される。地面に対するドローンの速さは □ m/s`, a: `$${c}$`, easy: `$\\sqrt{${b}^2+${a}^2}=${c}$`, verify: () => numOK(`$${c}$`, Math.hypot(a, b)) };
        }
        const sx = r.pick([1, -1]), sy = r.pick([1, -1]);
        return { q: `$x$ 成分が ${un(sx * a, 'N')}、$y$ 成分が ${un(sy * b, 'N')} の力の大きさは □ N`, a: `$${c}$`, easy: `$\\sqrt{${pr(sx * a)}^2+${pr(sy * b)}^2}=${c}$`, verify: () => numOK(`$${c}$`, Math.hypot(a, b)) };
      },
      // わな：同じ向き・反対向き（そのままたす・ひく）、なす角が60°・120°（余弦定理。第3部 4-46）
      trap(r) {
        if (r.chance(0.4)) {
          const a = r.int(4, 15), b = r.int(2, a - 1), same = r.chance(0.5), d = r.pick(['東', '西', '北', '南']);
          const ans = same ? a + b : a - b;
          return {
            q: `${d}へ ${un(a, 'N')} と${same ? d : OPP[d]}へ ${un(b, 'N')} の2つの力の合力の大きさは □ N`, a: `$${ans}$`,
            easy: same ? `（同じ向きの一直線なので、三平方はいらない。片方を＋として符号で：$${a}+${b}=${ans}$。わざ 4-65 で）` : `（反対向きの一直線なので、三平方はいらない。片方を＋として符号で：$${a}+(-${b})=${ans}$。わざ 4-65 で）`,
            easyCheck: false, also: ['4-65'], verify: () => numOK(`$${ans}$`, len(add(mul(a, DIR[d]), mul(b, mul(same ? 1 : -1, DIR[d]))))),
          };
        }
        const [a, b, t, c] = r.pick([[3, 5, 60, 7], [5, 3, 60, 7], [7, 8, 60, 13], [8, 7, 60, 13], [5, 16, 60, 19], [5, 5, 120, 5], [3, 8, 120, 7], [5, 8, 120, 7], [8, 15, 120, 13], [7, 15, 120, 13]]);
        return {
          q: `${un(a, 'N')} と ${un(b, 'N')} の力が、同じ点になす角 $${dg(t)}$ ではたらく。合力の大きさは □ N`, a: `$${c}$`,
          easy: `（直角でないので三平方は使えない。三角形の中の角 $${dg(180 - t)}$ で余弦定理：$${a}^2+${b}^2-2\\times${a}\\times${b}\\times\\cos${dg(180 - t)}=${c * c}$。わざ 4-46 で）`, easyCheck: false, also: ['4-46'],
          verify: () => numOK(`$${c}$`, Math.hypot(a + b * Math.cos(rad(t)), b * Math.sin(rad(t)))),
        };
      },
    },
  });

  // ================================================================ 4-64
  // 点の名前に、ずらした座標を決めて、ベクトルの式を計算し直す（verify）
  const LET = ['A', 'B', 'C', 'D', 'E', 'F', 'P', 'Q', 'R'];
  const PXY = c => { const k = c.charCodeAt(0); return [Math.sin(k * 1.3) * 5 + k % 7, Math.cos(k * 0.7) * 4 - k % 5]; };
  // terms：[[符号, 'AB'], …]。ans：'AC' か '0'
  function arrowOK(terms, ans, pos) {
    pos = pos || PXY;
    let s = [0, 0];
    for (const [sg, t] of terms) s = add(s, mul(sg, sub(pos(t[1]), pos(t[0]))));
    const w = ans === '0' ? [0, 0] : sub(pos(ans[1]), pos(ans[0]));
    return (close(s[0], w[0]) && close(s[1], w[1])) || `ベクトルの和が答え ${ans} と合わない`;
  }
  const arTeX = terms => terms.map(([sg, t], i) => (sg < 0 ? '-' : i ? '+' : '') + ar(t)).join('');
  const arAns = s => (s === '0' ? '$\\vec{0}$' : `$${ar(s)}$`);
  M.add({
    id: '4-64', part: 5, chap: '4-10③⑤', stars: 1,
    title: 'ベクトルの和はしりとり、差は「ひくほうの先から、ひかれるほうの先へ」',
    mark: '$\\overrightarrow{\\mathrm{AB}}+\\overrightarrow{\\mathrm{BC}}$ や $\\overrightarrow{\\mathrm{OA}}-\\overrightarrow{\\mathrm{OB}}$ のように、**点の名前**だけで書いたベクトルの式。',
    futsu: ['点に座標を決めて、', '1つ1つのベクトルの成分を出し、', '成分ごとに計算する。'],
    raku: ['和はしりとり：まん中が消える', '$\\overrightarrow{\\mathrm{AB}}+\\overrightarrow{\\mathrm{BC}}+\\overrightarrow{\\mathrm{CD}}=\\overrightarrow{\\mathrm{AD}}$', '差は「ひくほう→ひかれるほう」', '$\\overrightarrow{\\mathrm{OA}}-\\overrightarrow{\\mathrm{OB}}=\\overrightarrow{\\mathrm{BA}}$'],
    why: '「AからBへ行き、続けてBからCへ行く」のは「AからCへ行く」のと同じ。差 $\\vec{a}-\\vec{b}$ は「$\\vec{b}$ に何をたせば $\\vec{a}$ になるか」なので、Bの先からAの先への矢印（4-10③⑤）。',
    caution: '$\\overrightarrow{\\mathrm{AB}}+\\overrightarrow{\\mathrm{CD}}$ のように、終点と始点がつながらない和は、1本の矢印の名前にならない。ひくときは $-\\overrightarrow{\\mathrm{CB}}=\\overrightarrow{\\mathrm{BC}}$ と、向きを反対にしてからつなぐ。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 2,
    boxw: { s1: '15mm', s2: '15mm', s3: '15mm', trap: '30mm' },
    // 点の名前だけのベクトルの式で、向きを直すとしりとりでつながる（オイラーの一筆書き）とき
    fits(q) {
      if (coords(q).length) return false;
      if (/平行四辺形/.test(q) && /overrightarrow/.test(q)) return true;
      const ts = [...q.matchAll(/([+-]?)\s*\\overrightarrow\{\\mathrm\{([A-Z])([A-Z])\}\}/g)].map(m => (m[1] === '-' ? [m[3], m[2]] : [m[2], m[3]]));
      if (ts.length < 2) return false;
      const deg = {}; ts.forEach(([a, b]) => { deg[a] = (deg[a] || 0) + 1; deg[b] = (deg[b] || 0) - 1; });
      const odd = Object.values(deg).filter(v => v !== 0);
      if (!(odd.length === 0 || (odd.length === 2 && odd.includes(1) && odd.includes(-1)))) return false;
      // つながっているか
      const nodes = [...new Set(ts.flat())], seen = new Set([nodes[0]]);
      for (let ch = true; ch;) { ch = false; ts.forEach(([a, b]) => { if (seen.has(a) !== seen.has(b)) { seen.add(a); seen.add(b); ch = true; } }); }
      return seen.size === nodes.length;
    },
    steps: {
      // しりとりの順に並んだ和（2つか3つ）
      s1(r) {
        const n = r.pick([2, 2, 3]), L = r.shuffle(LET).slice(0, n + 1);
        const terms = L.slice(0, n).map((c, i) => [1, c + L[i + 1]]), ans = L[0] + L[n];
        return { q: `$${arTeX(terms)}$`, a: arAns(ans), easy: `（しりとり：${L.join('→')}。まん中が消えて ${L[0]}→${L[n]}）`, easyCheck: false, verify: () => arrowOK(terms, ans) };
      },
      // 始点が同じ2つの差、または順番をまぜた和
      s2(r) {
        if (r.chance(0.5)) {
          const [o, a, b] = r.shuffle(LET.concat(['O', 'O', 'O'])).filter((c, i, s) => s.indexOf(c) === i).slice(0, 3);
          const terms = [[1, o + a], [-1, o + b]];
          return { q: `$${arTeX(terms)}$`, a: arAns(b + a), easy: `（始点が ${o} で同じ。ひくほうの先 ${b} から、ひかれるほうの先 ${a} へ）`, easyCheck: false, verify: () => arrowOK(terms, b + a) };
        }
        const L = r.shuffle(LET).slice(0, 4), t = [[1, L[0] + L[1]], [1, L[1] + L[2]], [1, L[2] + L[3]]], terms = r.shuffle(t);
        if (terms[0][1] === t[0][1] && terms[1][1] === t[1][1]) return null;
        return { q: `$${arTeX(terms)}$`, a: arAns(L[0] + L[3]), easy: `（たす順番を入れかえてつなぐ：${L.join('→')}）`, easyCheck: false, verify: () => arrowOK(terms, L[0] + L[3]) };
      },
      // ひいてからつなぐ・行ってもどる・平行四辺形
      s3(r) {
        const k = r.int(0, 3), L = r.shuffle(LET).slice(0, 4);
        if (k === 0) {
          const terms = [[1, L[0] + L[1]], [-1, L[2] + L[1]]];
          return { q: `$${arTeX(terms)}$`, a: arAns(L[0] + L[2]), easy: `（$-${ar(L[2] + L[1])}=${ar(L[1] + L[2])}$ にしてつなぐ：${L[0]}→${L[1]}→${L[2]}）`, easyCheck: false, verify: () => arrowOK(terms, L[0] + L[2]) };
        }
        if (k === 1) {
          const terms = r.chance(0.5) ? [[1, L[0] + L[1]], [1, L[1] + L[0]]] : [[1, L[0] + L[1]], [1, L[1] + L[2]], [1, L[2] + L[0]]];
          return { q: `$${arTeX(terms)}$`, a: arAns('0'), easy: '（しりとりで出発した点にもどる。どこへも動かないので $\\vec{0}$）', easyCheck: false, verify: () => arrowOK(terms, '0') };
        }
        if (k === 2) {
          const terms = [[1, L[0] + L[1]], [-1, L[2] + L[1]], [1, L[2] + L[3]]];
          return { q: `$${arTeX(terms)}$`, a: arAns(L[0] + L[3]), easy: `（$-${ar(L[2] + L[1])}=${ar(L[1] + L[2])}$。${L[0]}→${L[1]}→${L[2]}→${L[3]}）`, easyCheck: false, verify: () => arrowOK(terms, L[0] + L[3]) };
        }
        // 平行四辺形 ABCD：A を原点、B・D を決めると C＝B＋D
        const pos = c => ({ A: [0, 0], B: [5, 0.4], D: [1.3, 3], C: [6.3, 3.4] })[c];
        const [terms, ans, why] = r.pick([
          [[[1, 'AB'], [1, 'AD']], 'AC', '$\\overrightarrow{\\mathrm{AD}}=\\overrightarrow{\\mathrm{BC}}$ なので A→B→C'],
          [[[1, 'AB'], [-1, 'AD']], 'DB', '始点が A で同じ。ひくほうの先 D から、ひかれるほうの先 B へ'],
          [[[1, 'DA'], [1, 'DC']], 'DB', '$\\overrightarrow{\\mathrm{DC}}=\\overrightarrow{\\mathrm{AB}}$ なので D→A→B'],
          [[[1, 'BA'], [1, 'BC']], 'BD', '$\\overrightarrow{\\mathrm{BC}}=\\overrightarrow{\\mathrm{AD}}$ なので B→A→D'],
          [[[1, 'AD'], [-1, 'AB']], 'BD', '始点が A で同じ。B から D へ'],
          [[[1, 'AB'], [1, 'BC'], [1, 'CD']], 'AD', 'しりとり A→B→C→D'],
        ]);
        return { q: `平行四辺形 $\\mathrm{ABCD}$ で、$${arTeX(terms)}$ ＝ □`, a: arAns(ans), easy: `（${why}）`, easyCheck: false, verify: () => arrowOK(terms, ans, pos) };
      },
      // わな：つながらない和 AB＋CD。座標から成分を出して、成分ごとにたす（4-67）
      trap(r) {
        const pts = [0, 1, 2, 3].map(() => [r.int(-4, 6), r.int(-4, 6)]);
        const v = add(sub(pts[1], pts[0]), sub(pts[3], pts[2]));
        if (sub(pts[1], pts[0]).every(x => x === 0) || sub(pts[3], pts[2]).every(x => x === 0)) return null;
        const ans = `$${P(v[0], v[1])}$`;
        const p = {
          q: `${['A', 'B', 'C', 'D'].map((n, i) => pt(n, ...pts[i])).join('、')} のとき、$${ar('AB')}+${ar('CD')}$ の成分は □`, a: ans,
          verify: () => vecOK(ans, sub(add(pts[1], pts[3]), add(pts[0], pts[2]))),
        };
        return dest(p, '4-64', 'B のあとが C で、しりとりにならない。1本の矢印の名前にはならないので、2点から成分を出して成分ごとにたす');
      },
    },
  });

  // ================================================================ 4-65
  // 速度の答え「西へ $14\,\mathrm{m/s}$」
  const vAns = (v, axis) => `${v > 0 ? axis[0] : axis[1]}へ ${un(Math.abs(v), 'm/s')}`;
  // 答えのことばを、平面のベクトルに直してくらべる（別の道すじ：東西南北を (x, y) にする）
  function dirOK(ans, want) {
    const m = /^(東|西|南|北)へ \$([0-9.]+)\\,\\mathrm\{m\/s\}\$$/.exec(ans);
    if (!m) return `答えが読めない（${ans}）`;
    const got = mul(+m[2], DIR[m[1]]);
    return (close(got[0], want[0]) && close(got[1], want[1])) || `答え ${ans} が (${want}) とちがう`;
  }
  const AX = [['東', '西'], ['北', '南']];
  M.add({
    id: '4-65', part: 5, chap: '4-10⑤⑦', stars: 1,
    title: '一直線の速度は符号で：変化は「あと－まえ」、相対速度は「相手－自分」',
    mark: '東西だけ（または南北だけ）の速度で、**速度の変化**（はね返る）や、**動いている人から見た速度**（すれちがう）を聞かれる。',
    futsu: ['矢印を図にかいて、', '向きを考えながら', '長さをたしたりひいたりする。'],
    raku: ['東を＋：まえ $+8$、あと $-6$', '変化＝あと－まえ：$(-6)-(+8)=-14$', '負なので西へ14 m/s', 'Aから見たB＝Bの速度－Aの速度'],
    why: '向きが2つしかないときは、片方を＋、反対を－と決めれば、ベクトルの計算がふつうの数の計算になる（2-2）。速度の変化は、変化量と同じ「あと－まえ」。相対速度は、自分の速度をひいて、自分が止まって見えるようにする（4-10⑤⑦）。',
    caution: '速度の変化（14）と、速さの差（$8-6=2$）はちがう。相対速度でひくのは「見ている自分」の速度。答えを出したら、「速いBは前へ出ていく」のように向きを確かめる。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '24mm',
    fits(q) {
      if (!/速度/.test(q) || PERP(q) || /川|流れ|雨/.test(q)) return false;
      if (/正として/.test(q)) return true;
      return /m\/s/.test(q) && /東|西|北|南/.test(q) && /変化|から見|見えた|はね返|打ち返|変わった/.test(q);
    },
    steps: {
      // 速度の変化（反対向きになる・同じ向きで速さが変わる）
      s1(r) {
        const ax = r.pick(AX), sg = r.pick([1, -1]), v1 = r.int(3, 30), opp = r.chance(0.7);
        const v2 = opp ? r.int(2, 30) : r.intNot(1, 29, v => v === v1);
        const b = sg * v1, a = (opp ? -sg : sg) * v2, d = a - b;
        if (d === 0) return null;
        const [d1, d2] = [b > 0 ? ax[0] : ax[1], a > 0 ? ax[0] : ax[1]];
        return {
          q: `速度が${d1}へ ${un(v1, 'm/s')} → ${d2}へ ${un(v2, 'm/s')} と変わった。変化は □`, a: vAns(d, ax),
          easy: `${ax[0]}を＋として $(${a > 0 ? '+' : ''}${a})-(${b > 0 ? '+' : ''}${b})=${d}$`, easyCheck: false,
          verify: () => dirOK(vAns(d, ax), add(mul(v2, DIR[d2]), mul(-v1, DIR[d1]))),
        };
      },
      // 相対速度（同じ向き・すれちがう）
      s2(r) {
        const ax = r.pick(AX), A = r.pick([1, -1]) * r.int(3, 25), B = r.pick([1, -1]) * r.int(3, 30);
        if (A === B) return null;
        const d = B - A, dA = A > 0 ? ax[0] : ax[1], dB = B > 0 ? ax[0] : ax[1];
        return {
          q: `${dA}へ ${un(Math.abs(A), 'm/s')} のAから見た、${dB}へ ${un(Math.abs(B), 'm/s')} のBの速度は □`,
          a: vAns(d, ax), easy: `Bの速度－Aの速度：$(${B > 0 ? '+' : ''}${B})-(${A > 0 ? '+' : ''}${A})=${d}$`, easyCheck: false,
          verify: () => dirOK(vAns(d, ax), sub(mul(Math.abs(B), DIR[dB]), mul(Math.abs(A), DIR[dA]))),
        };
      },
      // 場面（ボール・ラケット・電車）、符号の数で聞く、相対速度から相手の速度
      s3(r) {
        const k = r.int(0, 3), ax = r.pick(AX);
        if (k === 0) {
          const b = r.pick([1, -1]) * r.int(2, 20), a = r.pick([1, -1]) * r.int(2, 20);
          if (a === b) return null;
          const sb = (b > 0 ? '+' : '') + b, sa = (a > 0 ? '+' : '') + a;
          return { q: `${ax[0]}を正とする。速度が $${sb}\\,\\mathrm{m/s}$ から $${sa}\\,\\mathrm{m/s}$ に変わった。変化は □ m/s`, a: `$${a - b}$`, easy: `$(${sa})-(${sb})=${a - b}$` };
        }
        if (k === 1) {
          const A = r.int(5, 25), rel = r.pick([1, -1]) * r.int(2, 30), B = A + rel;
          if (B === 0) return null;
          return {
            q: `電車Aが${ax[0]}へ ${un(A, 'm/s')} で走っている。Aから見ると、電車Bは${rel > 0 ? ax[0] : ax[1]}へ ${un(Math.abs(rel), 'm/s')} で動いて見えた。Bの速度は □`,
            a: vAns(B, ax), easy: `Bの速度＝Aの速度＋Aから見たBの速度：$${A}+(${rel})=${B}$`, easyCheck: false,
            verify: () => dirOK(vAns(B, ax), add(mul(A, DIR[ax[0]]), mul(Math.abs(rel), DIR[rel > 0 ? ax[0] : ax[1]]))),
          };
        }
        const v1 = r.int(4, 30), v2 = r.int(3, 30), [d1, d2] = r.chance(0.5) ? ax : [ax[1], ax[0]];
        const ans = `${d2}へ ${un(v1 + v2, 'm/s')}`;   // はね返ると、変化は「あと」の向きに v1＋v2
        const scene = k === 2 ? `${d1}へ ${un(v1, 'm/s')} で転がってきたボールが、壁に当たって${d2}へ ${un(v2, 'm/s')} ではね返った`
          : `${d1}へ ${un(v1, 'm/s')} で飛んできたボールを、ラケットで${d2}へ ${un(v2, 'm/s')} で打ち返した`;
        return {
          q: `${scene}。速度の変化は □`, a: ans, easy: `（${d2}を＋として $(+${v2})-(-${v1})=${v1 + v2}$）`, easyCheck: false,
          verify: () => dirOK(ans, sub(mul(v2, DIR[d2]), mul(v1, DIR[d1]))),
        };
      },
      // わな：速さの差（向きを考えない）・直角な向きの相対速度（4-66）
      trap(r) {
        if (r.chance(0.5)) {
          const ax = r.pick(AX), v1 = r.int(6, 20), v2 = r.int(2, v1 - 1);
          return {
            q: `${ax[0]}へ ${un(v1, 'm/s')} で当たり、${ax[1]}へ ${un(v2, 'm/s')} ではね返った。へった速さは □ m/s`,
            a: `$${v1 - v2}$`, easy: `（楽な形なし。速さは向きのない大きさなので、そのままひく：$${v1}-${v2}=${v1 - v2}$。速度の変化（${ax[1]}へ $${v1 + v2}$）とはちがう）`, easyCheck: false,
            verify: () => numOK(`$${v1 - v2}$`, len(mul(v1, DIR[ax[0]])) - len(mul(v2, DIR[ax[1]]))),
          };
        }
        const [a, b, c] = triPick(r, 29), [d1, d2] = r.pick(PERPS);
        const p = {
          q: `${d1}へ ${un(a, 'm/s')} のAから見た、${d2}へ ${un(b, 'm/s')} のBの速さは □ m/s`, a: `$${c}$`,
          verify: () => numOK(`$${c}$`, len(sub(mul(b, DIR[d2]), mul(a, DIR[d1])))),
        };
        return dest(p, '4-65', `一直線ではない（${d1}と${d2}は直角）。符号ではなく、$${b}$ と $${a}$ の直角三角形の斜辺：$\\sqrt{${b}^2+${a}^2}=${c}$`);
      },
    },
  });

  // ================================================================ 4-66
  // 「北向きから東向きへ曲がる」の Δv の向き（北東など）
  const NAME8 = { '1,1': '北東', '-1,1': '北西', '1,-1': '南東', '-1,-1': '南西' };
  const quad = v => NAME8[`${Math.sign(v[0])},${Math.sign(v[1])}`];
  M.add({
    id: '4-66', part: 5, chap: '4-10⑤⑦', stars: 1,
    title: '直角な速度の差は三平方（90°曲がると $v\\sqrt{2}$）',
    mark: '同じ速さのまま**90°曲がる**、真下に落ちる雨を**走りながら見る**など、直角な2つの速度の差。',
    futsu: ['まえとあとの速度の矢印を', '始点をそろえてかき、', '先から先への矢印をはかる。'],
    raku: ['$\\Delta\\vec{v}$＝あと＋（まえの反対）', '北へ6 → 東へ6：東へ6と南へ6の和', '$\\sqrt{6^2+6^2}=6\\sqrt{2}$、南東の向き'],
    why: '$\\vec{v}_{\\text{あと}}-\\vec{v}_{\\text{まえ}}=\\vec{v}_{\\text{あと}}+(-\\vec{v}_{\\text{まえ}})$。向きが直角なら、直角な2つの速度の和になるので、三平方の定理で大きさがわかる。同じ速さなら直角二等辺三角形で $v\\sqrt{2}$（4-10⑤⑦・4-4）。',
    caution: '速さが同じでも、向きが変われば速度は変わる（$\\Delta\\vec{v}\\neq\\vec{0}$）。向きが反対（Uターン）なら一直線なので、符号で計算する（わざ 4-65）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '24mm' },
    fits(q) {
      if (!/m\/s/.test(q) || /川|流れ|風/.test(q)) return false;
      if (/雨/.test(q) && /から見/.test(q)) return true;
      return PERP(q) && /変化|変わった|から見|曲が/.test(q);
    },
    steps: {
      // 同じ速さで90°曲がる
      s1(r) {
        const v = r.int(2, 30), [d1, d2] = r.pick(PERPS);
        const want = len(sub(mul(v, DIR[d2]), mul(v, DIR[d1])));
        return {
          q: `速さ ${un(v, 'm/s')} で${d1}向きから${d2}向きへ曲がった。$\\lvert\\Delta\\vec{v}\\rvert$ ＝ □ m/s`,
          a: `$${v}\\sqrt{2}$`, easy: `$\\sqrt{${v}^2+${v}^2}=${v}\\sqrt{2}$`, key: `s1:${v}`,
          verify: () => numOK(`$${v}\\sqrt{2}$`, want),
        };
      },
      // 速さがちがう（3辺が整数）・変化の向き
      s2(r) {
        if (r.chance(0.6)) {
          const [a, b, c] = triPick(r, 29), [d1, d2] = r.pick(PERPS);
          return {
            q: `速度が${d1}へ ${un(a, 'm/s')} → ${d2}へ ${un(b, 'm/s')} と変わった。$\\lvert\\Delta\\vec{v}\\rvert$ ＝ □ m/s`,
            a: `$${c}$`, easy: `$\\sqrt{${b}^2+${a}^2}=${c}$`, verify: () => numOK(`$${c}$`, len(sub(mul(b, DIR[d2]), mul(a, DIR[d1])))),
          };
        }
        const v = r.int(3, 20), [d1, d2] = r.pick(PERPS), w = sub(DIR[d2], DIR[d1]), ans = quad(w);
        return {
          q: `速さ ${un(v, 'm/s')} で${d1}向きから${d2}向きへ曲がった。$\\Delta\\vec{v}$ の向きは（北東・北西・南東・南西）□`,
          a: ans, easy: `（${d2}へ ${v} と、まえの反対の${OPP[d1]}へ ${v} の和）`, easyCheck: false,
          // 別の道すじ：角の向き（atan2）から、どの区画かを見る
          verify: () => { const t = Math.atan2(w[1], w[0]) * 180 / Math.PI; const n = t > 0 && t < 90 ? '北東' : t > 90 ? '北西' : t < -90 ? '南西' : '南東'; return n === ans || `向きは ${n}`; },
        };
      },
      // 雨と自転車・車
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const s = r.int(2, 10), d = r.pick(['東', '西', '北', '南']);
          return {
            q: `真下へ ${un(s, 'm/s')} の雨を、${d}へ ${un(s, 'm/s')} の自転車から見た速さは □ m/s`,
            a: `$${s}\\sqrt{2}$`, easy: `「下へ ${s}」と「${OPP[d]}へ ${s}」の和：$\\sqrt{${s}^2+${s}^2}=${s}\\sqrt{2}$`, easyCheck: 'last', key: `rain${s}`,
            verify: () => numOK(`$${s}\\sqrt{2}$`, Math.hypot(s, s)),
          };
        }
        if (k === 1) {
          const [a, b, c] = triPick(r, 29), d = r.pick(['東', '西', '北', '南']);
          return {
            q: `真下へ ${un(a, 'm/s')} の雨を、${d}へ ${un(b, 'm/s')} の車から見た速さは □ m/s`,
            a: `$${c}$`, easy: `「下へ ${a}」と「${OPP[d]}へ ${b}」の和：$\\sqrt{${a}^2+${b}^2}=${c}$`, easyCheck: 'last', verify: () => numOK(`$${c}$`, Math.hypot(a, b)),
          };
        }
        const s = r.int(2, 12), d = r.pick(['東', '西', '北', '南']);
        return {
          q: `真下へ ${un(s, 'm/s')} で落ちる雨を、${d}へ ${un(s, 'm/s')} で走る人から見ると、雨はたての線から何度かたむいて落ちてくるか。□`,
          a: `$${dg(45)}$`, easy: '（「下へ」と「うしろへ」が同じ大きさの直角二等辺三角形なので $45^{\\circ}$）', easyCheck: false, key: `deg${s}`,
          verify: () => numOK(`$${dg(45)}$`, Math.atan2(s, s)),
        };
      },
      // わな：Uターン（一直線。4-65）・60°曲がる（正三角形）
      trap(r) {
        const v = r.int(3, 20);
        if (r.chance(0.5)) {
          const ax = r.pick(AX), ans = `${ax[1]}へ ${un(2 * v, 'm/s')}`;
          const p = { q: `速さ ${un(v, 'm/s')} で、${ax[0]}向きから${ax[1]}向きへ向きを変えた。速度の変化は □`, a: ans, verify: () => dirOK(ans, sub(mul(v, DIR[ax[1]]), mul(v, DIR[ax[0]]))) };
          return dest(p, '4-66', `直角ではなく反対向き（一直線）。${ax[0]}を＋として $(-${v})-(+${v})=-${2 * v}$`);
        }
        return {
          q: `速さ ${un(v, 'm/s')} で、進む向きを $${dg(60)}$ 変えた。$\\lvert\\Delta\\vec{v}\\rvert$ ＝ □ m/s`, a: `$${v}$`,
          easy: `（直角でないので三平方は使えない。$\\Delta\\vec{v}$ は、あとの速度と「まえの反対」の合力で、あいだの角は $${dg(120)}$。同じ大きさの2つが $${dg(120)}$ なら合力も同じ大きさ。わざ 4-46 で）`, easyCheck: false, also: ['4-46'],
          verify: () => numOK(`$${v}$`, len(sub(mul(v, [Math.cos(rad(60)), Math.sin(rad(60))]), [v, 0]))),
        };
      },
    },
  });

  // ================================================================ 4-67
  M.add({
    id: '4-67', part: 5, chap: '4-11①', stars: 1,
    title: '$\\overrightarrow{\\mathrm{AB}}$ の成分は「B－A」（あと－まえ）',
    mark: '2点の座標がわかっていて、$\\overrightarrow{\\mathrm{AB}}$ の成分や大きさ、位置の変化を聞かれる。',
    futsu: ['方眼に2点をかいて、', 'AからBへ、右へいくつ・上へいくつ', 'かをマス目で数える。'],
    raku: ['$\\mathrm{A}(-1,\\ 2)$、$\\mathrm{B}(5,\\ -6)$', 'あと（B）－まえ（A）：', '$(5-(-1),\\ -6-2)=(6,\\ -8)$', '大きさ $\\sqrt{6^2+8^2}=10$'],
    why: 'AからBへの矢印は、横に $x_2-x_1$、たてに $y_2-y_1$ 進む。どれだけ動いたかは「あと－まえ」（3-2）。大きさは三平方の定理で、2点の距離と同じ（4-11①）。',
    caution: '「まえ－あと」で計算すると、向きが反対の $\\overrightarrow{\\mathrm{BA}}$ になる。大きさは成分の和ではなく、2乗の和の $\\sqrt{\\phantom{2}}$。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '24mm', s2: '22mm', s3: '24mm', trap: '24mm' },
    fits(q) {
      if (/中点|重心|分ける点|内分|kg|単位ベクトル|向きに|向きの成分|内積|直交|垂直|つり合/.test(q)) return false;
      const n = coords(q).length;
      if (n < 2) return false;
      if (/overrightarrow\{\\mathrm\{[A-Z]'?[A-Z]'?\}\}/.test(q)) return true;
      return /秒後に点|位置の変化|移す平行移動|2点.*距離/.test(q);
    },
    steps: {
      s1(r) {
        const A = [r.int(-6, 6), r.int(-6, 6)], B = [r.int(-6, 6), r.int(-6, 6)];
        if (A[0] === B[0] || A[1] === B[1]) return null;
        const v = sub(B, A), ans = `$${P(v[0], v[1])}$`;
        return {
          q: `${pt('A', ...A)}、${pt('B', ...B)} のとき、$${ar('AB')}$ の成分は □`, a: ans,
          easy: `$${P(`${B[0]}-${pr(A[0])}`, `${B[1]}-${pr(A[1])}`)}$`, easyCheck: false,
          verify: () => { const w = vecOf(ans); return (close(A[0] + w[0], B[0]) && close(A[1] + w[1], B[1])) || 'A に答えをたしても B にならない'; },
        };
      },
      // 大きさ、または BA
      s2(r) {
        if (r.chance(0.6)) {
          const [a, b] = r.chance(0.7) ? triPick(r, 15) : [r.int(1, 6), r.int(1, 6)], sx = r.pick([1, -1]), sy = r.pick([1, -1]);
          const A = [r.int(-5, 4), r.int(-5, 4)], B = [A[0] + sx * a, A[1] + sy * b], n = a * a + b * b, ans = rs(1, 1, n);
          return {
            q: `${pt('A', ...A)}、${pt('B', ...B)} のとき、$\\lvert${ar('AB')}\\rvert$ ＝ □`, a: `$${ans}$`,
            easy: `$\\sqrt{${pr(sx * a)}^2+${pr(sy * b)}^2}=${ans}$`, verify: () => numOK(`$${ans}$`, Math.hypot(B[0] - A[0], B[1] - A[1])),
          };
        }
        const A = [r.int(-6, 6), r.int(-6, 6)], B = [r.int(-6, 6), r.int(-6, 6)];
        if (A[0] === B[0] || A[1] === B[1]) return null;
        const v = sub(A, B), ans = `$${P(v[0], v[1])}$`;
        return {
          q: `${pt('A', ...A)}、${pt('B', ...B)} のとき、$${ar('BA')}$ の成分は □`, a: ans,
          easy: `（BからAへ。あと（A）－まえ（B）：$${P(`${A[0]}-${pr(B[0])}`, `${A[1]}-${pr(B[1])}`)}$）`, easyCheck: false,
          verify: () => { const w = vecOf(ans); return (close(B[0] + w[0], A[0]) && close(B[1] + w[1], A[1])) || 'B に答えをたしても A にならない'; },
        };
      },
      // 位置の変化・位置の変化から速度・平行移動
      s3(r) {
        const k = r.int(0, 2), A = [r.int(-5, 5), r.int(-5, 5)];
        if (k === 0) {
          const B = [A[0] + r.intNot(-9, 12, v => v === 0), A[1] + r.intNot(-9, 12, v => v === 0)], t = r.int(2, 9), v = sub(B, A), ans = `$${P(v[0], v[1])}$`;
          return { q: `ドローンが点 $${P(...A)}$ から、${t}秒後に点 $${P(...B)}$ へ動いた。位置の変化は □（m）`, a: ans, easy: '（あと－まえ）', easyCheck: false, verify: () => vecOK(ans, [B[0] - A[0], B[1] - A[1]]) };
        }
        if (k === 1) {
          const t = r.pick([2, 4, 5]), d = [r.intNot(-12, 15, v => v === 0), r.intNot(-12, 15, v => v === 0)], B = add(A, d);
          const ans = `$${V2(tq(d[0], t, true), tq(d[1], t, true))}$`;
          return {
            q: `一定の速度で進むラジコンカーが、0秒に点 $${P(...A)}$、${t}秒後に点 $${P(...B)}$ にいた（m）。速度の成分は □`, a: ans,
            easy: `（位置の変化 $${P(d[0], d[1])}$ を ${t} でわる）`, easyCheck: false,
            // 別の道すじ：速度で t 秒進めると B に着くか
            verify: () => { const w = vecOf(ans); return (close(A[0] + t * w[0], B[0]) && close(A[1] + t * w[1], B[1])) || `${t}秒で B に着かない`; },
          };
        }
        const B = [A[0] + r.intNot(-6, 6, v => v === 0), A[1] + r.intNot(-6, 6, v => v === 0)], v = sub(B, A), ans = `$${P(v[0], v[1])}$`;
        return { q: `${pt('A', ...A)} を $\\mathrm{A'}${P(...B)}$ に移す平行移動のベクトルは □`, a: ans, easy: '（あと（A$\'$）－まえ（A））', easyCheck: false, verify: () => vecOK(ans, [B[0] - A[0], B[1] - A[1]]) };
      },
      // わな：A を動かした点 B（ひくのではなく、たす）
      trap(r) {
        const A = [r.int(-5, 5), r.int(-5, 5)], v = [r.intNot(-6, 6, x => x === 0), r.intNot(-6, 6, x => x === 0)], B = add(A, v), ans = `$${P(...B)}$`;
        const p = {
          q: `点 ${pt('A', ...A)} を $${P(...v)}$ だけ動かした点 $\\mathrm{B}$ の座標は □`, a: ans,
          verify: () => { const w = vecOf(ans); return (close(w[0] - A[0], v[0]) && close(w[1] - A[1], v[1])) || 'B－A が動かしたベクトルにならない'; },
        };
        return dest(p, '4-67', '「あと－まえ」でひくのではなく、まえ（A）に動き $' + P(...v) + '$ を成分ごとにたす');
      },
    },
  });

  // ================================================================ 4-68
  // 方眼の図：a は左の半分（x 0〜4）、b は右の半分（x 5〜9）。始点は格子点。名前は矢印のわき（もう1本と反対がわ）
  // 方眼は矢印のはんいより1目もり広くして、矢印が方眼のふちにのらないようにする（R2-23）
  function gridFig(vs, r) {
    const items = [['grid', -1, -1, 10, 7]], ends = [];
    const regions = [[0, 4], [5, 9]];
    for (let i = 0; i < vs.length; i++) {
      const [vx, vy] = vs[i], [x0, x1] = regions[i];
      const xs = [], ys = [];
      for (let x = x0; x <= x1; x++) if (x + vx >= x0 && x + vx <= x1) xs.push(x);
      for (let y = 0; y <= 6; y++) if (y + vy >= 0 && y + vy <= 6) ys.push(y);
      if (!xs.length || !ys.length) return null;
      const S = [r.pick(xs), r.pick(ys)], E = [S[0] + vx, S[1] + vy];
      items.push(['seg', S, E, { arrow: true, thick: true }], ['dot', S]);
      let n = [-vy, vx]; const L = Math.hypot(...n); n = [n[0] / L, n[1] / L];
      if ((i === 0 && n[0] > 0.01) || (i === 1 && n[0] < -0.01)) n = [-n[0], -n[1]];
      const m = [(S[0] + E[0]) / 2 + 0.7 * n[0], (S[1] + E[1]) / 2 + 0.7 * n[1]];
      items.push(['label', m, `$\\vec{${'ab'[i]}}$`, 'c']);
      ends.push([S, E]);
    }
    return { fig: { s: 4.5, items }, ends };
  }
  // 「右へ2・下へ3」（教科書 4-10 の例題の言い方）
  const moveWords = v => `${v[0] < 0 ? '左' : '右'}へ ${Math.abs(v[0])}・${v[1] < 0 ? '下' : '上'}へ ${Math.abs(v[1])} `;
  // k a + m b を、足し算のくり返しで計算する（別の道すじ）
  function combo(k, a, m, b) {
    let s = [0, 0];
    for (let i = 0; i < Math.abs(k); i++) s = add(s, mul(Math.sign(k), a));
    for (let i = 0; i < Math.abs(m); i++) s = add(s, mul(Math.sign(m), b));
    return s;
  }
  // k\vec{a}+m\vec{b} の TeX
  function comboTeX(k, m, A, B) {
    A = A || '\\vec{a}'; B = B || '\\vec{b}';
    const t = (c, v, first) => (c === 0 ? '' : (c < 0 ? '-' : first ? '' : '+') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + v);
    return t(k, A, true) + t(m, B, k === 0);
  }
  M.add({
    id: '4-68', part: 5, chap: '4-11②・4-10③④', stars: 1,
    title: '和・差・実数倍は成分ごとに（方眼なら「右へ・上へ」を数える）',
    mark: '成分（または方眼の矢印）で表したベクトルの、**和・差・実数倍**の式。答えはベクトル。',
    futsu: ['方眼に矢印を何本もつないでかき、', 'はじめの点から終わりの点まで', 'マス目を数える。'],
    raku: ['$\\vec{a}=(3,\\ -1)$、$\\vec{b}=(-2,\\ 4)$', '実数倍を先に：$2\\vec{a}=(6,\\ -2)$、$3\\vec{b}=(-6,\\ 12)$', '$2\\vec{a}-3\\vec{b}=(6+6,\\ -2-12)$', '$=(12,\\ -14)$'],
    why: '矢印をつなぐと、横の進みは横の進みどうし、たての進みはたての進みどうしでたされる。横とたてはおたがいにじゃまをしない（3-2）。だから、和・差・実数倍は成分ごとに計算できる（4-11②）。',
    caution: '$-3\\vec{b}$ の成分は符号に注意（$-3\\times(-2)=+6$）。「$\\cdot$」の内積は、答えがベクトルではなく数になる（わざ 4-75）。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '28mm',
    fits(q) {
      if (/\\cdot|仕事|直交|垂直|なす角|単位|向き|偏差|つり合|秒後|中点|重心|分ける|内積/.test(q)) return false;
      if (/図の方眼/.test(q) || /だけ動かした/.test(q)) return true;
      if (/合力/.test(q) && coords(q).length >= 2) return true;
      if (/\\vec\{a\}=\(/.test(q) && /(\d|-|\+)\\vec\{[ab]\}|\\vec\{a\}\s*[-+]/.test(q)) return true;
      return /\)\s*[-+]\s*\d*\(|\d\(-?\d/.test(q);
    },
    steps: {
      // 和・差・実数倍・反対のベクトル
      s1(r) {
        const a = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], b = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)];
        const [k, m] = r.pick([[1, 1], [1, -1], [1, -1], [2, 0], [3, 0], [-2, 0], [0, -1], [0, 3]]);
        if (r.chance(0.3) && k !== 0 && m !== 0) {
          // 成分だけで書いた式：(2,\ 1)+(3,\ -4)
          const w = combo(k, a, m, b), ans = `$${P(...w)}$`;
          return { q: `$${P(...a)}${m < 0 ? '-' : '+'}${P(...b)}$`, a: ans, easy: `$${P(`${a[0]}${m < 0 ? '-' : '+'}${pr(b[0])}`, `${a[1]}${m < 0 ? '-' : '+'}${pr(b[1])}`)}$`, easyCheck: false, verify: () => vecOK(ans, w) };
        }
        const w = combo(k, a, m, b), ans = `$${P(...w)}$`;
        return {
          q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のとき、$${comboTeX(k, m)}$`, a: ans,
          easy: `（成分ごとに：$${P(`${k ? (k === 1 ? '' : pr(k) + '\\times') + pr(a[0]) : ''}${m ? (m < 0 ? '-' : (k ? '+' : '')) + (Math.abs(m) === 1 ? '' : Math.abs(m) + '\\times') + pr(b[0]) : ''}`, `${k ? (k === 1 ? '' : pr(k) + '\\times') + pr(a[1]) : ''}${m ? (m < 0 ? '-' : (k ? '+' : '')) + (Math.abs(m) === 1 ? '' : Math.abs(m) + '\\times') + pr(b[1]) : ''}`)}$）`,
          easyCheck: false, verify: () => vecOK(ans, w),
        };
      },
      // 組み合わせ：2a−3b、3a+2b など。成分の数だけで書いた 2(2,\ 1)-(3,\ -4) も
      s2(r) {
        const a = [r.int(-5, 5), r.int(-5, 5)], b = [r.int(-5, 5), r.int(-5, 5)];
        if (a.every(v => v === 0) || b.every(v => v === 0) || (a[0] === b[0] && a[1] === b[1])) return null;
        const k = r.pick([2, 3, -2, 1]), m = r.pick([2, 3, -3, -2, -1]);
        if (k === 1 && Math.abs(m) === 1) return null;
        const w = combo(k, a, m, b), ans = `$${P(...w)}$`;
        const ka = mul(k, a), mb = mul(m, b);
        const easy = `（実数倍を先に：$${P(...ka)}+${P(...mb)}=${P(...w)}$）`;
        if (r.chance(0.35)) {
          const t = (c, v, first) => (c < 0 ? '-' : first ? '' : '+') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + v;
          return { q: `$${t(k, P(...a), true)}${t(m, P(...b))}$`, a: ans, easy, easyCheck: false, verify: () => vecOK(ans, w) };
        }
        return { q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のとき、$${comboTeX(k, m)}$`, a: ans, easy, easyCheck: false, verify: () => vecOK(ans, w) };
      },
      // 方眼の図の矢印（図はステップ3。第35回 K-2）
      s3(r) {
        const a = [r.intNot(-3, 3, v => v === 0), r.intNot(-4, 4, v => v === 0)], b = [r.intNot(-3, 3, v => v === 0), r.intNot(-4, 4, v => v === 0)];
        if (a[0] === b[0] && a[1] === b[1]) return null;
        const g = gridFig([a, b], r);
        if (!g) return null;
        const [k, m] = r.pick([[1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [-1, 2], [3, -1]]);
        const w = combo(k, a, m, b), ans = `$${P(...w)}$`;
        return {
          q: `図の方眼（1目もりは1）の $\\vec{a}$、$\\vec{b}$ で、$${comboTeX(k, m)}$ の成分は □`, a: ans, fig: g.fig,
          easy: `（$\\vec{a}$ は${moveWords(a)}で $${P(...a)}$、$\\vec{b}$ は${moveWords(b)}で $${P(...b)}$）`, easyCheck: false,
          // 別の道すじ：図の矢印の終点－始点から成分を出して計算する
          verify: () => { const [A, B] = g.ends.map(([S, E]) => sub(E, S)); return vecOK(ans, add(mul(k, A), mul(m, B))); },
        };
      },
      // わな：内積（答えは数。4-75）
      trap(r) {
        const a = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], b = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], d = dot(a, b);
        const p = { q: `$${P(...a)}\\cdot${P(...b)}$`, a: `$${d}$`, verify: () => numOK(`$${d}$`, len(a) * len(b) * Math.cos(rad(angBetween(a, b)))) };
        return dest(p, '4-68', `「$\\cdot$」は内積。成分ごとの積をたして1つの数にする：$${a[0]}\\times${pr(b[0])}+${pr(a[1])}\\times${pr(b[1])}=${d}$`);
      },
    },
  });

  // ================================================================ 4-69
  // cos・sin の値：[分子, ルートの中]（値は 分子/2 × √中）
  const TRIG = {
    30: [[1, 3], [1, 1]], 45: [[1, 2], [1, 2]], 60: [[1, 1], [1, 3]], 120: [[-1, 1], [1, 3]], 135: [[-1, 2], [1, 2]], 150: [[-1, 3], [1, 1]],
    210: [[-1, 3], [-1, 1]], 225: [[-1, 2], [-1, 2]], 240: [[-1, 1], [-1, 3]], 300: [[1, 1], [-1, 3]], 315: [[1, 2], [-1, 2]], 330: [[1, 3], [-1, 1]],
  };
  // 大きさ f√fn に、三角比 [c, cn] をかけた値の TeX
  const fTrig = (f, fn, [c, cn]) => rs(f * c, 2, fn * cn);
  M.add({
    id: '4-69', part: 5, chap: '4-11③', stars: 1,
    title: '力の分解は $(F\\cos\\theta,\\ F\\sin\\theta)$（たての線からの角なら入れかわる）',
    mark: '**力の大きさ**と**向きの角**がわかっていて、力の成分（横の成分・たての成分）を聞かれる。',
    futsu: ['直角三角形をかいて、', '左向き・下向きなら', '自分で－をつける。'],
    raku: ['$80\\,\\mathrm{N}$、$x$ 軸から $120^{\\circ}$', '$(80\\cos120^{\\circ},\\ 80\\sin120^{\\circ})$', '$=(-40,\\ 40\\sqrt{3})$', 'たての線からの角なら $(F\\sin,\\ F\\cos)$'],
    why: '大きさ $F$ の力の矢印は、半径1の円の上の点 $(\\cos\\theta,\\ \\sin\\theta)$ への矢印を $F$ 倍にのばしたもの（4-8）。だから90°より大きい角でも、符号は式が自動でつけてくれる（4-11③）。',
    caution: '角をどこからはかったかを確かめる。たての線（$y$ 軸）からの角なら、$x$ 成分が $F\\sin$、$y$ 成分が $F\\cos$ になる。',
    counts: { s1: 7, s2: 6, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '32mm', s2: '32mm', s3: '18mm', trap: '15mm' },
    fits(q) {
      if (/仕事|つり合|つる|内積|向きの成分|x\$?\s*成分が/.test(q)) return false;
      return /°|circ/.test(q) && /成分/.test(q) && /x\$?\s*軸|y\$?\s*軸|真上|たての線|地面|斜面|水平|床/.test(q);
    },
    steps: {
      // x 軸の正の向きからの角
      s1(r) {
        const t = r.pick([30, 45, 60, 120, 135, 150]), fn = t === 45 && r.chance(0.5) ? 2 : 1, f = fn === 2 ? r.int(2, 12) : r.pick([4, 6, 8, 10, 12, 20, 40, 50, 60, 80, 100]);
        const F = fn === 2 ? `${f}\\sqrt{2}` : `${f}`, [c, s] = TRIG[t], ans = `$${V2(fTrig(f, fn, c), fTrig(f, fn, s))}$`, Fv = f * Math.sqrt(fn);
        return {
          q: `$x$ 軸の正の向きから $${dg(t)}$ の向きの、${un(F, 'N')} の力の成分は □`, a: ans,
          easy: `$(${F}\\cos${dg(t)},\\ ${F}\\sin${dg(t)})$`, easyCheck: false,
          verify: () => vecOK(ans, [Fv * Math.cos(rad(t)), Fv * Math.sin(rad(t))]),
        };
      },
      // たての線からの角・180°より大きい角
      s2(r) {
        if (r.chance(0.55)) {
          const ph = r.pick([30, 45, 60]), side = r.pick([1, -1]), fn = ph === 45 && r.chance(0.6) ? 2 : 1, f = fn === 2 ? r.int(2, 12) : r.pick([4, 6, 8, 10, 12, 20, 40]);
          const F = fn === 2 ? `${f}\\sqrt{2}` : `${f}`, [c, s] = TRIG[ph], Fv = f * Math.sqrt(fn);
          const x = fTrig(side * f, fn, s), y = fTrig(f, fn, c), ans = `$${V2(x, y)}$`;
          return {
            q: `真上から${side > 0 ? '右' : '左'}へ $${dg(ph)}$ かたむいた向きの、${un(F, 'N')} の力の成分は □`, a: ans,   // 真上＝上向きのたての線（R2-10）
            easy: `（たての線からの角なので $x$ 成分が $${side < 0 ? '-' : ''}${F}\\sin${dg(ph)}$、$y$ 成分が $${F}\\cos${dg(ph)}$）`, easyCheck: false,
            verify: () => vecOK(ans, [Fv * Math.cos(rad(90 + side * -ph)), Fv * Math.sin(rad(90 + side * -ph))]),
          };
        }
        const t = r.pick([210, 225, 240, 300, 315, 330]), fn = t % 45 === 0 && t % 90 !== 0 && r.chance(0.5) ? 2 : 1, f = fn === 2 ? r.int(2, 12) : r.pick([4, 6, 8, 10, 20, 40, 60]);
        const F = fn === 2 ? `${f}\\sqrt{2}` : `${f}`, [c, s] = TRIG[t], ans = `$${V2(fTrig(f, fn, c), fTrig(f, fn, s))}$`, Fv = f * Math.sqrt(fn);
        return {
          q: `$x$ 軸の正の向きから $${dg(t)}$ の向きの、${un(F, 'N')} の力の成分は □`, a: ans,
          easy: `$(${F}\\cos${dg(t)},\\ ${F}\\sin${dg(t)})$`, easyCheck: false, verify: () => vecOK(ans, [Fv * Math.cos(rad(t)), Fv * Math.sin(rad(t))]),
        };
      },
      // 場面：そり・ロープ・斜面の重力
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t = r.pick([30, 45, 60]), F = r.pick([20, 40, 50, 60, 80, 100]), yoko = r.chance(0.5), [c, s] = TRIG[t], ans = fTrig(F, 1, yoko ? c : s);
          return {
            q: `そりを、地面から $${dg(t)}$ 上向きのひもで、${un(F, 'N')} の力で引く。${yoko ? 'そりを前へ進める成分（横の成分）' : 'そりを持ち上げる成分（たての成分）'}は □ N`, a: `$${ans}$`,
            easy: `$${F}\\${yoko ? 'cos' : 'sin'}${dg(t)}=${ans}$`, verify: () => numOK(`$${ans}$`, F * (yoko ? Math.cos(rad(t)) : Math.sin(rad(t)))),
          };
        }
        if (k === 1) {
          const t = r.pick([30, 60]), F = r.pick([20, 40, 60, 80, 100]), yoko = r.chance(0.5), [c, s] = TRIG[t], ans = fTrig(F, 1, yoko ? s : c);
          return {
            q: `たての線から $${dg(t)}$ かたむいたロープで、${un(F, 'N')} の力で引く。${yoko ? '横' : 'たて'}の成分は □ N`, a: `$${ans}$`,
            easy: `（たての線からの角なので、${yoko ? '横は sin' : 'たては cos'}）$${F}\\${yoko ? 'sin' : 'cos'}${dg(t)}=${ans}$`, easyCheck: 'last',
            verify: () => numOK(`$${ans}$`, F * (yoko ? Math.sin(rad(t)) : Math.cos(rad(t)))),
          };
        }
        const m = r.int(1, 5), mg = dmul(m, '9.8'), along = r.chance(0.5);
        const ans = along ? dmul(m, '4.9') : `${dmul(m, '4.9')}\\sqrt{3}`;
        return {
          q: `質量 ${un(m, 'kg')} の荷物が $${dg(30)}$ の斜面の上にある。重力（$${m}\\times9.8=${mg}\\,\\mathrm{N}$）の、斜面に${along ? 'そった' : '垂直な'}成分は □ N`, a: `$${ans}$`,
          easy: `$${mg}\\times\\${along ? 'sin' : 'cos'}${dg(30)}=${ans}$`, verify: () => numOK(`$${ans}$`, m * 9.8 * (along ? Math.sin(rad(30)) : Math.cos(rad(30)))),
        };
      },
      // わな：成分から大きさ（分けるのではなく合わせる。4-63）
      trap(r) {
        const [a, b, c] = triPick(r), sx = r.pick([1, -1]), sy = r.pick([1, -1]);
        const p = { q: `$x$ 成分が ${un(sx * a, 'N')}、$y$ 成分が ${un(sy * b, 'N')} の力の大きさは □ N`, a: `$${c}$`, verify: () => numOK(`$${c}$`, len([sx * a, sy * b])) };
        return dest(p, '4-69', `分けるのではなく、直角な2つの成分を合わせる：$\\sqrt{${a}^2+${b}^2}=${c}$`);
      },
    },
  });

  // ================================================================ 4-70
  M.add({
    id: '4-70', part: 5, chap: '4-11④', stars: 1,
    title: '川をわたる船は、たてと横に分けて',
    mark: '川のはば、船の速さ（水に対して）、流れの速さがわかっていて、**わたる時間・流される距離**を聞かれる。',
    futsu: ['岸から見た速度 $(3,\\ 4)$ の', '大きさ5を出してから、', '進む道のりをその速さでわる。'],
    raku: ['はば80 m、船4 m/s、流れ3 m/s', '時間はたてだけ：$80\\div4=20$ s', '流される距離は横だけ：$3\\times20=60$ m', '真正面へは $\\sin\\theta=\\frac{3}{4}$'],
    why: '流れは横向きなので、向こう岸へ進むたての進み方にじゃまをしない。横とたては分けて考えてよい（3-2・4-11④）。真正面に着くには、船の速さの横の成分 $v\\sin\\theta$ で流れを打ち消す。',
    caution: '船首を上流へかたむけると、向こう岸へ進むたての成分は $v\\cos\\theta$ に小さくなり、時間は長くなる。流れと同じ一直線の向きに進むときは、そのままたす・ひく。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '15mm',
    fits(q) { return /川|滑走路/.test(q) && /わた|真正面|向こう岸|滑走路/.test(q); },
    steps: {
      // 時間・流される距離
      s1(r) {
        const v = r.int(2, 6), t = r.int(5, 40), W = v * t, u = r.intNot(1, 5, x => x === v);
        const head = `はば ${un(W, 'm')}、流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートで、船首を向こう岸へ向けてわたる。`;
        if (r.chance(0.5)) return { q: `${head}わたる時間は □ s`, a: `$${t}$`, easy: `たてだけ：$${W}\\div${v}=${t}$`, key: `t${W},${v},${u}`, verify: () => numOK(`$${t}$`, W / v) };
        return { q: `${head}流される距離は □ m`, a: `$${u * t}$`, easy: `$${W}\\div${v}=${t}$、横は $${u}\\times${t}=${u * t}$`, easyCheck: 'last', key: `d${W},${v},${u}`, verify: () => numOK(`$${u * t}$`, u * (W / v)) };
      },
      // 岸から見た速さ・出発点から着いた点までの距離
      s2(r) {
        const [u, v, c] = triPick(r, 13);
        if (r.chance(0.5)) {
          const W = v * r.int(5, 20);
          return { q: `はば ${un(W, 'm')}、流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートで、船首を向こう岸へ向けてわたる。岸から見た速さは □ m/s`, a: `$${c}$`, easy: `$\\sqrt{${u}^2+${v}^2}=${c}$`, verify: () => numOK(`$${c}$`, len(add([0, v], [u, 0]))) };
        }
        const t = r.int(5, 20), W = v * t;
        return {
          q: `はば ${un(W, 'm')}、流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートで、船首を向こう岸へ向けてわたる。出発点から着いた点までの距離は □ m`, a: `$${c * t}$`,
          easy: `時間 $${t}$ s、流される距離 $${u * t}$ m。$\\sqrt{${W}^2+${u * t}^2}=${c * t}$`, easyCheck: 'last', verify: () => numOK(`$${c * t}$`, Math.hypot(W, u * W / v)),
        };
      },
      // 真正面に着く：船首のかたむき
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const u = r.int(1, 5), v = 2 * u, W = r.pick([60, 80, 100, 120, 200]);
          return { q: `はば ${un(W, 'm')}、流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートで真正面の岸へわたる。船首を上流へ何度かたむければよいか。□`, a: `$${dg(30)}$`, easy: `（$\\sin\\theta=${u === 1 ? '\\frac{1}{2}' : `\\frac{${u}}{${v}}=\\frac{1}{2}`}$ なので $30^{\\circ}$）`, easyCheck: false, verify: () => numOK(`$${dg(30)}$`, Math.asin(u / v)) };
        }
        if (k === 1) {
          const u = r.int(1, 9), v = r.intNot(u + 1, 20, x => x === 2 * u), ans = tq(u, v);
          const scene = r.chance(0.5) ? `流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートで真正面の岸へわたる。船首を上流へかたむける角 $\\theta$ は` : `空気に対して ${un(v, 'm/s')} で飛ぶ飛行機が、真横から ${un(u, 'm/s')} の風を受けながら、まっすぐ前の滑走路へ向かう。機首を風上へかたむける角 $\\theta$ は`;
          return { q: `${scene}、$\\sin\\theta$ ＝ □`, a: `$${ans}$`, easy: `（横の成分 $${v}\\sin\\theta$ で ${u} を打ち消す：$\\sin\\theta=${ans}$）`, easyCheck: false, verify: () => numOK(`$${ans}$`, Math.sin(Math.asin(u / v))) };
        }
        const u = r.int(1, 5), v = 2 * u, ans = rs(v, 2, 3);
        return { q: `流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートで、船首を上流へ $${dg(30)}$ かたむけて真正面の岸へわたる。向こう岸へ進む速さは □ m/s`, a: `$${ans}$`, easy: `$${v}\\cos${dg(30)}=${ans}$`, verify: () => numOK(`$${ans}$`, Math.sqrt(v * v - u * u)) };
      },
      // わな：流れと同じ一直線（下流・上流へ進む）
      trap(r) {
        const u = r.int(1, 4), v = r.int(u + 1, 9), down = r.chance(0.5), ans = down ? v + u : v - u;
        const p = { q: `流れ ${un(u, 'm/s')} の川を、水に対して ${un(v, 'm/s')} のボートが${down ? '下流' : '上流'}へ向かって進む。岸から見た速さは □ m/s`, a: `$${ans}$`, verify: () => numOK(`$${ans}$`, Math.abs(v * (down ? 1 : -1) + u)) };
        return dest(p, '4-70', `流れと同じ一直線の向き。たてと横に分けずに、ボートの進む向きを＋として符号で：$${down ? `${v}+${u}` : `${v}+(-${u})`}=${ans}$`, ['4-65']);
      },
    },
  });

  // ================================================================ 4-71
  // 3辺が整数の三角形から、大きさが整数のベクトル
  const UNI = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25], [9, 12, 15], [12, 9, 15]];
  const sgn2 = r => [r.pick([1, -1]), r.pick([1, -1])];
  M.add({
    id: '4-71', part: 5, chap: '4-11⑤', stars: 1,
    title: '単位ベクトルは大きさでわる（大きさ $F$ の力は $F\\vec{e}$）',
    mark: '「同じ向きの**単位ベクトル**」、「この向きに、大きさ□Nの力」のように、**向き**と**大きさ**を分けて聞かれる。',
    futsu: ['向きの角を $\\tan$ で求めてから、', '$(F\\cos\\theta,\\ F\\sin\\theta)$ を', '計算する（電卓がいる）。'],
    raku: ['$\\vec{a}=(3,\\ 4)$ の大きさは5', '$\\vec{e}=\\frac{1}{5}(3,\\ 4)=(0.6,\\ 0.8)$', '15 N の力：$15\\vec{e}=(9,\\ 12)$'],
    why: 'ベクトルを、その大きさでわると、向きはそのままで大きさが1になる（$\\vec{e}=\\frac{\\vec{a}}{\\lvert\\vec{a}\\rvert}$）。向き（単位ベクトル）に大きさをかければ、その向きのベクトルができる（4-11⑤）。',
    caution: '大きさは成分の和ではなく、2乗の和の $\\sqrt{\\phantom{2}}$。「ある向きの成分（影の長さ）」は、単位ベクトルとの内積（わざ 4-78）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '34mm', s2: '28mm', s3: '34mm', trap: '15mm' },
    boxh: { s1: '12mm', s3: '12mm' },
    fits(q) {
      if (/向きの成分|動いた|仕事|内積|直交|垂直/.test(q)) return false;
      if (/単位ベクトル/.test(q)) return true;
      return /向き/.test(q) && !/°|circ|変化|変え|曲が/.test(q) && /N|m\/s/.test(q) && /成分|速度/.test(q);
    },
    steps: {
      s1(r) {
        const [x, y, c] = r.pick(UNI), [sx, sy] = sgn2(r), a = [sx * x, sy * y];
        const ans = `$${V2(tq(a[0], c, true), tq(a[1], c, true))}$`;
        return {
          q: `$\\vec{a}=${P(...a)}$ と同じ向きの単位ベクトルは □`, a: ans,
          easy: `（$\\lvert\\vec{a}\\rvert=\\sqrt{${pr(a[0])}^2+${pr(a[1])}^2}=${c}$。$\\frac{1}{${c}}${P(...a)}$）`, easyCheck: false,
          // 別の道すじ：大きさが1で、a と同じ向き（なす角0°）
          verify: () => { const w = vecOf(ans); return (close(len(w), 1) && angBetween(w, a) < 1e-6) || '大きさ1・同じ向きになっていない'; },
        };
      },
      // 向きと大きさから力（反対向きも）
      s2(r) {
        const [x, y, c] = r.pick(UNI), [sx, sy] = sgn2(r), a = [sx * x, sy * y], F = c * r.int(2, 4) * r.pick([1, 1, 2]), opp = r.chance(0.25);
        if (F > 60) return null;
        const w = mul((opp ? -1 : 1) * F / c, a), ans = `$${P(...w)}$`;
        return {
          q: `$${P(...a)}$ と${opp ? '反対の' : '同じ'}向きの、大きさ ${un(F, 'N')} の力の成分は □`, a: ans,
          easy: `（$\\vec{e}=\\frac{1}{${c}}${P(...a)}$。${opp ? '$-' : '$'}${F}\\vec{e}$）`, easyCheck: false,
          verify: () => { const g = vecOf(ans); return (close(len(g), F) && angBetween(g, mul(opp ? -1 : 1, a)) < 1e-6) || `大きさ ${F}・向きが合わない`; },
        };
      },
      // 場面：点の向きに引く・速度・√ の単位ベクトル
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [x, y, c] = r.pick(UNI), [sx, sy] = sgn2(r), A = [sx * x, sy * y], F = c * r.int(2, 3);
          const w = mul(F / c, A), ans = `$${P(...w)}$`;
          return { q: `原点から点 ${pt('A', ...A)} の向きに ${un(F, 'N')} で引く力の成分は □`, a: ans, easy: `（$\\lvert${ar('OA')}\\rvert=${c}$。$\\frac{${F}}{${c}}=${F / c}$ 倍して $${F / c}${P(...A)}$）`, easyCheck: false, verify: () => { const g = vecOf(ans); return (close(len(g), F) && angBetween(g, A) < 1e-6) || '合わない'; } };
        }
        if (k === 1) {
          const [x, y, c] = r.pick(UNI.slice(0, 4)), [sx, sy] = sgn2(r), a = [sx * x, sy * y], v = c * r.int(2, 4);
          const w = mul(v / c, a), ans = `$${P(...w)}$`;
          return { q: `速さ ${un(v, 'm/s')} で $${P(...a)}$ の向きに進む物の速度は □`, a: ans, easy: `（$\\vec{e}=\\frac{1}{${c}}${P(...a)}$ に ${v} をかける）`, easyCheck: false, verify: () => { const g = vecOf(ans); return (close(len(g), v) && angBetween(g, a) < 1e-6) || '合わない'; } };
        }
        // (1,\ 1) や (-1,\ \sqrt{3}) の向きの単位ベクトル
        const [a, aT, e] = r.pick([
          [[1, 1], P(1, 1), V2('\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}')], [[-1, 1], P(-1, 1), V2('-\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}')],
          [[2, -2], P(2, -2), V2('\\frac{\\sqrt{2}}{2}', '-\\frac{\\sqrt{2}}{2}')], [[1, Math.sqrt(3)], P(1, '\\sqrt{3}'), V2('\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}')],
          [[-1, Math.sqrt(3)], P(-1, '\\sqrt{3}'), V2('-\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}')], [[Math.sqrt(3), -1], P('\\sqrt{3}', -1), V2('\\frac{\\sqrt{3}}{2}', '-\\frac{1}{2}')],
          [[3, 3], P(3, 3), V2('\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}')],
        ]);
        const ans = `$${e}$`;
        return { q: `$${aT}$ と同じ向きの単位ベクトルは □`, a: ans, easy: `（大きさ $${rs(1, 1, Math.round(dot(a, a)))}$ でわる）`, easyCheck: false, verify: () => { const w = vecOf(ans); return (close(len(w), 1) && angBetween(w, a) < 1e-6) || '大きさ1・同じ向きになっていない'; } };
      },
      // わな：「向きの力」ではなく「向きの成分」（4-78）
      trap(r) {
        const [x, y, c] = r.pick([[4, 3, 5], [3, 4, 5], [6, 8, 10], [8, 6, 10]]), F = [r.int(2, 9), r.int(-3, 9)];
        const d = [x, y], comp = tq(dot(F, d), c, true);
        const p = { q: `力 $\\vec{F}=${P(...F)}$（N）の、$${P(...d)}$ の向きの成分は □ N`, a: `$${comp}$`, verify: () => numOK(`$${comp}$`, len(F) * Math.cos(rad(angBetween(F, d)))) };
        if (F.every(v => v === 0)) return null;
        return dest(p, '4-71', `「その向きの力」を作るのではなく、「$\\vec{F}$ のその向きの成分（影の長さ）」。単位ベクトル $\\frac{1}{${c}}${P(...d)}$ との内積`);
      },
    },
  });

  // ================================================================ 4-72
  M.add({
    id: '4-72', part: 5, chap: '4-11⑥', stars: 1,
    title: '中点・重心は平均、$m:n$ の内分点は近いほうに重く',
    mark: '線分を□:□に分ける点、三角形の**重心**、質量のある物の**重心**を、座標で聞かれる。',
    futsu: ['方眼に線分をかいて、', '長さを□等分した目もりを', '数えて点をさがす。'],
    raku: ['$\\mathrm{A}(1,\\ 1)$、$\\mathrm{B}(7,\\ 4)$ を $1:2$', 'Aに近いので A に2の重み：', '$\\frac{2(1,\\ 1)+1(7,\\ 4)}{3}=(3,\\ 2)$', '中点・重心はただの平均'],
    why: '$m:n$ の内分点は $\\vec{a}+\\frac{m}{m+n}(\\vec{b}-\\vec{a})=\\frac{n\\vec{a}+m\\vec{b}}{m+n}$。近い点ほど、その位置を多くまぜる。質量がちがう物の重心も、質量で重みをつけた平均（4-11⑥）。',
    caution: '$\\vec{a}$ にかけるのは、遠いほうの数 $n$。$\\frac{m\\vec{a}+n\\vec{b}}{m+n}$ とすると、反対がわの点になる。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '28mm', s2: '28mm', s3: '28mm', trap: '15mm' },
    fits(q) { return /中点|重心|分ける点|内分|シーソー/.test(q); },
    steps: {
      // 中点・三角形の重心
      s1(r) {
        if (r.chance(0.5)) {
          const A = [r.int(-6, 8), r.int(-6, 8)], B = [r.int(-6, 8), r.int(-6, 8)];
          if (A[0] === B[0] && A[1] === B[1]) return null;
          const ans = `$${P(tq(A[0] + B[0], 2, true), tq(A[1] + B[1], 2, true))}$`;
          return {
            q: `${pt('A', ...A)}、${pt('B', ...B)} の中点は □`, a: ans, easy: `$\\left(\\frac{${A[0]}+${pr(B[0])}}{2},\\ \\frac{${A[1]}+${pr(B[1])}}{2}\\right)$`, easyCheck: false,
            // 別の道すじ：A から B への道のりの半分だけ進んだ点
            verify: () => vecOK(ans, add(A, mul(0.5, sub(B, A)))),
          };
        }
        const A = [r.int(-5, 8), r.int(-5, 8)], B = [r.int(-5, 8), r.int(-5, 8)], sx = A[0] + B[0], sy = A[1] + B[1];
        const fix3 = s => 3 * r.int(-2, 2) + (((-s) % 3) + 3) % 3;   // 3つの和が3でわりきれる
        const C = [fix3(sx), fix3(sy)];
        if (cross(sub(B, A), sub(C, A)) === 0) return null;
        const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], ans = `$${P(...G)}$`;
        return {
          q: `${pt('A', ...A)}、${pt('B', ...B)}、${pt('C', ...C)} の三角形の重心は □`, a: ans, easy: `（3つの頂点の平均：$${V2(`\\frac{${A[0]}+${pr(B[0])}+${pr(C[0])}}{3}`, `\\frac{${A[1]}+${pr(B[1])}+${pr(C[1])}}{3}`)}$）`, easyCheck: false,
          // 別の道すじ：中線 AM（M は BC の中点）を 2:1 に分ける点
          verify: () => { const Mm = mul(0.5, add(B, C)); return vecOK(ans, add(A, mul(2 / 3, sub(Mm, A)))); },
        };
      },
      // m:n の内分点・2つの質量の重心
      s2(r) {
        const [m, n] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [3, 4]]), s = m + n;
        const A = [r.int(-5, 6), r.int(-5, 6)], d = [s * r.intNot(-3, 3, v => v === 0), s * r.int(-3, 3)], B = add(A, d);
        const Pp = add(A, mul(m / s, d)), ans = `$${P(...Pp)}$`;
        if (r.chance(0.6)) {
          return {
            q: `${pt('A', ...A)}、${pt('B', ...B)} を結ぶ線分を $${m}:${n}$ に分ける点は □`, a: ans,
            easy: `$\\frac{${n}${P(...A)}+${m}${P(...B)}}{${s}}=${P(...Pp)}$`, easyCheck: false,
            // 別の道すじ：A・P・B が一直線で、AP:PB = m:n
            verify: () => { const w = vecOf(ans); const ap = sub(w, A), pb = sub(B, w); return (close(cross(ap, pb), 0) && close(len(ap) * n, len(pb) * m) && dot(ap, pb) > 0) || 'AP:PB が合わない'; },
          };
        }
        return {
          q: `$${P(...A)}$ に ${un(n, 'kg')}、$${P(...B)}$ に ${un(m, 'kg')} の物がある。重心は □`, a: ans,
          easy: `$\\frac{${n}${P(...A)}+${m}${P(...B)}}{${n}+${m}}=${P(...Pp)}$`, easyCheck: false,
          // 別の道すじ：重心のまわりで「質量×位置のずれ」の和が0
          verify: () => { const g = vecOf(ans); const t = add(mul(n, sub(A, g)), mul(m, sub(B, g))); return (close(t[0], 0) && close(t[1], 0)) || '重心のまわりでつり合わない'; },
        };
      },
      // シーソー・3つの質量の重心
      s3(r) {
        if (r.chance(0.5)) {
          const [m1, m2] = r.pick([[30, 20], [40, 20], [30, 15], [45, 30], [36, 24], [40, 30], [50, 25], [60, 40]]);
          const D = r.pick([2, 3, 4, 5, 6]), x = D * m2 / (m1 + m2), xs = fmt(x);
          if (!Number.isInteger(+(x * 10).toFixed(6))) return null;   // 小数第1位までになるときだけ
          return {
            q: `シーソーに ${un(m1, 'kg')} のソラさんと ${un(m2, 'kg')} のミナさんが ${un(D, 'm')} はなれて乗る。ソラさんから □ m の所を支えるとつり合う`, a: `$${xs}$`,
            easy: `ソラさんを0、ミナさんを${D}として $\\frac{${m1}\\times0+${m2}\\times${D}}{${m1}+${m2}}=${xs}$`, easyCheck: 'last',
            verify: () => close(m1 * x, m2 * (D - x)) || 'つり合わない',
          };
        }
        const ms = [r.int(1, 4), r.int(1, 4), r.int(1, 4)], M3 = ms[0] + ms[1] + ms[2];
        const ps = [[r.int(-3, 6), r.int(-3, 6)], [r.int(-3, 6), r.int(-3, 6)]];
        const s = add(mul(ms[0], ps[0]), mul(ms[1], ps[1]));
        // 3つめの点は、重心が整数になるように選ぶ
        const c = [0, 1].map(i => { for (let v = -3; v <= 8; v++) if ((s[i] + ms[2] * v) % M3 === 0 && r.chance(0.5)) return v; for (let v = -3; v <= 8; v++) if ((s[i] + ms[2] * v) % M3 === 0) return v; return null; });
        if (c.includes(null)) return null;
        ps.push(c);
        const G = mul(1 / M3, add(s, mul(ms[2], c))), ans = `$${P(...G)}$`;
        return {
          q: `${ps.map((p, i) => `$${P(...p)}$ に ${un(ms[i], 'kg')}`).join('、')} の物がある。重心は □`, a: ans,
          easy: `（分子は「質量×位置」の和、分母は質量の合計 ${M3}）`, easyCheck: false,
          verify: () => { const g = vecOf(ans); let t = [0, 0]; ps.forEach((p, i) => { t = add(t, mul(ms[i], sub(p, g))); }); return (close(t[0], 0) && close(t[1], 0)) || '重心のまわりでつり合わない'; },
        };
      },
      // わな：2点の距離（平均ではない。4-67）
      trap(r) {
        const [a, b, c] = triPick(r, 15), A = [r.int(-4, 4), r.int(-4, 4)], B = [A[0] + r.pick([1, -1]) * a, A[1] + r.pick([1, -1]) * b];
        if (c > 26) return null;
        const p = { q: `2点 ${pt('A', ...A)}、${pt('B', ...B)} の距離は □`, a: `$${c}$`, verify: () => numOK(`$${c}$`, Math.hypot(B[0] - A[0], B[1] - A[1])) };
        return dest(p, '4-72', `平均ではない。$${ar('AB')}$ の成分を出して三平方：$\\sqrt{${a}^2+${b}^2}=${c}$`);
      },
    },
  });

  // ================================================================ 4-73
  M.add({
    id: '4-73', part: 5, chap: '4-11⑦', stars: 1,
    title: 'まっすぐ進む点は $\\vec{p}=\\vec{p}_0+t\\vec{v}$',
    mark: 'はじめの位置と速度（成分）がわかっていて、「□秒後の位置」「$x$ が□になるのは何秒後」を聞かれる。',
    futsu: ['1秒ごとの位置を表にして、', '速度を1回ずつたしていき、', '□秒後まで続ける。'],
    raku: ['$\\vec{p}_0=(-4,\\ 2)$、$\\vec{v}=(3,\\ 1)$', '5秒後：$(-4,\\ 2)+5(3,\\ 1)=(11,\\ 7)$', '$x=20$：$-4+3t=20$ で $t=8$', 'そのとき $y=2+8=10$'],
    why: '1秒ごとに速度の分だけ進むので、$t$ 秒後には、はじめの位置に「速度の $t$ 倍」をたした所にいる。成分で書くと $x=x_0+v_xt$、$y=y_0+v_yt$ で、どちらも $t$ の1次関数（4-11⑦・3-5）。',
    caution: '$t$ 秒後の位置は、速度を $t$ 倍してから、はじめの位置にたす。$x$ が□になる時刻は、$x$ の式だけで求めてから、その $t$ を $y$ の式に入れる。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '28mm', s2: '15mm', s3: '22mm', trap: '28mm' },
    fits(q) { return /速度/.test(q) && !/秒後に点/.test(q) && /\\vec\{p\}_0|はじめ|出発点|動き出/.test(q); },
    steps: {
      s1(r) {
        const p0 = [r.int(-8, 8), r.int(-8, 8)], v = [r.intNot(-5, 5, x => x === 0), r.intNot(-5, 5, x => x === 0)], t = r.int(2, 9);
        const w = add(p0, mul(t, v)), ans = `$${P(...w)}$`;
        let s = p0.slice(); for (let i = 0; i < t; i++) s = add(s, v);   // 別の道すじ：1秒ずつ進める（表計算と同じ）
        return {
          q: `はじめの位置 $${P(...p0)}$、速度 $${P(...v)}$ で進む点の、${t}秒後の位置は □`, a: ans,
          easy: `$${P(...p0)}+${t}${P(...v)}=${P(...w)}$`, easyCheck: false, verify: () => vecOK(ans, s),
        };
      },
      // x（または y）が□になる時刻、そのときのもう一方の座標
      s2(r) {
        const p0 = [r.int(-8, 8), r.int(-8, 8)], v = [r.intNot(-5, 5, x => x === 0), r.intNot(-5, 5, x => x === 0)], t = r.int(2, 10);
        const i = r.pick([0, 1]), j = 1 - i, nm = 'xy', X = p0[i] + v[i] * t, Y = p0[j] + v[j] * t;
        const head = `はじめ $${P(...p0)}$、速度 $${P(...v)}$ の点の`;
        const eq = `${p0[i]}${v[i] < 0 ? '' : '+'}${v[i]}t=${X}`;
        if (r.chance(0.5)) return { q: `${head}、$${nm[i]}$ 座標が $${X}$ になるのは □ 秒後`, a: `$${t}$`, easy: `$${eq}$ より $t=${t}$`, easyCheck: 'last', verify: () => numOK(`$${t}$`, (X - p0[i]) / v[i]) };
        return { q: `${head}、$${nm[i]}$ 座標が $${X}$ になるときの $${nm[j]}$ 座標は □`, a: `$${Y}$`, easy: `$${eq}$ より $t=${t}$、$${nm[j]}=${p0[j]}${v[j] < 0 ? '' : '+'}${v[j]}\\times${t}=${Y}$`, easyCheck: 'last', verify: () => { let s = p0.slice(); while (Math.abs(s[i] - X) > 1e-9 && Math.abs(s[i]) < 1e4) s = add(s, v); return numOK(`$${Y}$`, s[j]); } };
      },
      // ボート・2つの点・位置の式
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const vy = r.pick([2, 3, 4, 5]), t = r.pick([10, 12, 15, 20, 25]), vx = r.pick([0.5, 1, 1.5, 2, 2.5]), W = vy * t, X = fmt(vx * t);
          return { q: `出発点 $(0,\\ 0)$ から、速度 $(${vx},\\ ${vy})$（m/s）で進むボートが、$y=${W}$ の向こう岸に着く。着いた点の $x$ 座標は □`, a: `$${X}$`, easy: `$${vy}t=${W}$ より $t=${t}$、$x=${vx}\\times${t}=${X}$`, easyCheck: 'last', verify: () => numOK(`$${X}$`, vx * W / vy) };
        }
        if (k === 1) {
          const t = r.int(1, 6), vp = r.int(1, 4), vq = -r.int(1, 4), q0 = (vp - vq) * t, y0 = r.int(-3, 3);
          return {
            q: `点Pは $(0,\\ ${y0})$ から速度 $(${vp},\\ 1)$ で、点Qは $(${q0},\\ ${y0})$ から速度 $(${vq},\\ 1)$ で同時に動き出す。PとQの $x$ 座標が等しくなるのは □ 秒後`, a: `$${t}$`,
            easy: `$${vp === 1 ? '' : vp}t=${q0}${vq === -1 ? '-' : vq}t$ より $t=${t}$`, easyCheck: 'last', verify: () => numOK(`$${t}$`, q0 / (vp - vq)),
          };
        }
        const p0 = [r.intNot(-8, 8, x => x === 0), r.int(-8, 8)], v = [r.intNot(-5, 5, x => x === 0 || x === 1), r.intNot(-5, 5, x => x === 0)];
        const ans = `${v[0] === -1 ? '-' : v[0]}t${p0[0] < 0 ? '' : '+'}${p0[0]}`;
        return { q: `はじめの位置 $\\vec{p}_0=${P(...p0)}$、速度 $\\vec{v}=${P(...v)}$ のとき、$t$ 秒後の $x$ 座標を $t$ の式で □`, a: `$${ans}$`, easy: `$${p0[0]}${v[0] < 0 ? '' : '+'}${v[0] === -1 ? '-' : v[0]}t$` };
      },
      // わな：2つの時刻の位置から速度を出す（4-67 のあと－まえ）
      trap(r) {
        const A = [r.int(-5, 5), r.int(-5, 5)], t = r.pick([2, 4, 5]), d = [r.intNot(-12, 15, v => v === 0), r.intNot(-12, 15, v => v === 0)], B = add(A, d);
        const ans = `$${V2(tq(d[0], t, true), tq(d[1], t, true))}$`;
        const p = { q: `0秒に点 $${P(...A)}$、${t}秒後に点 $${P(...B)}$ にいた点の速度は □`, a: ans, verify: () => { const w = vecOf(ans); return (close(A[0] + t * w[0], B[0]) && close(A[1] + t * w[1], B[1])) || '合わない'; } };
        return dest(p, '4-73', `速度がわからない。位置の変化（あと－まえ）$${P(...d)}$ を ${t} でわる`);
      },
    },
  });

  // ================================================================ 4-74
  M.add({
    id: '4-74', part: 5, chap: '4-12②', stars: 1,
    title: '仕事は動く向きの成分だけ：$W=Fs\\cos\\theta$（重力は $mgh$）',
    mark: '**ななめの力**で物を動かしたときの仕事、**斜面をすべる物**に重力がした仕事。',
    futsu: ['力をたてと横に分けて、', '動く向きの成分を出してから、', '距離をかける。'],
    raku: ['40 N、床から60°、5 m', '$W=40\\times5\\times\\cos60^{\\circ}=100$ J', '斜面は下がった高さ $h$ で：', '$W=mgh$'],
    why: '仕事は「力×力の向きに動いた距離」。動く向きに役立つのは $F\\cos\\theta$ だけなので $W=Fs\\cos\\theta$。重力のする仕事は $mg\\times s\\sin\\theta=mgh$ で、下がった高さだけで決まる（4-12②）。',
    caution: '力と動く向きが直角なら、どんなに強くても仕事は0。90°より大きい角（反対向きに近い）なら、仕事は負になる。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (!/仕事/.test(q) || /\\vec\{F\}=\(|\\vec\{s\}=\(|向きの成分|の向きに/.test(q)) return false;
      return /°|circ|持ち上げ|下ろ|斜面|すべり/.test(q);
    },
    steps: {
      // F・s・角から仕事
      s1(r) {
        const t = r.pick([60, 60, 30, 45]), F = r.pick([10, 20, 30, 40, 50, 60, 80]), s = r.int(2, 10), [c] = TRIG[t];
        const ans = rs(F * s * c[0], 2, c[1]);
        const q = r.chance(0.5) ? `床から $${dg(t)}$ 上向きに ${un(F, 'N')} で引いて、床にそって ${un(s, 'm')} 動かした。仕事は □ J`
          : `動く向きと $${dg(t)}$ の角をなす ${un(F, 'N')} の力が、${un(s, 'm')} 動く間にする仕事は □ J`;
        return { q, a: `$${ans}$`, easy: `$${F}\\times${s}\\times\\cos${dg(t)}=${ans}$`, verify: () => numOK(`$${ans}$`, F * Math.cos(rad(t)) * s) };
      },
      // 重力：持ち上げる・斜面をすべり下りる
      s2(r) {
        const m = r.int(1, 6), g = '（$g=9.8\\,\\mathrm{N/kg}$）', mg = dmul(m, '9.8');
        if (r.chance(0.4)) {
          const h = r.pick(['1', '1.5', '2', '2.5', '3', '4', '0.5']), W = dmul(m, '9.8', h);
          return { q: `${un(m, 'kg')} の荷物をゆっくり ${un(h, 'm')} 持ち上げる手の仕事は □ J${g}`, a: `$${W}$`, easy: `$${mg}\\times${h}=${W}$`, verify: () => numOK(`$${W}$`, m * 9.8 * +h) };
        }
        const s = r.int(2, 10), h = fmt(s / 2), W = dmul(m, '9.8', h);
        return {
          q: `${un(m, 'kg')} の物が $${dg(30)}$ の斜面を ${un(s, 'm')} すべり下りた。重力の仕事は □ J${g}`, a: `$${W}$`,
          easy: `下がった高さ $${s}\\times\\sin${dg(30)}=${h}$、$${mg}\\times${h}=${W}$`, easyCheck: 'last',
          verify: () => numOK(`$${W}$`, m * 9.8 * s * Math.cos(rad(60))),
        };
      },
      // 負の仕事・下ろす・45°・力と動く向きが直角（仕事は0。わなから移した。第36回 N-3）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 3) {
          const F = r.pick([20, 30, 40, 50]), s = r.int(3, 20);
          return {
            q: `荷物を真上向きに ${un(F, 'N')} の力で支えたまま、水平に ${un(s, 'm')} 歩いた（力と動く向きの角は $${dg(90)}$）。支える力の仕事は □ J`, a: '$0$',
            easy: `$${F}\\times${s}\\times\\cos${dg(90)}=0$`, easyCheck: 'last', key: 'zero', verify: () => numOK('$0$', dot([0, F], [s, 0])),
          };
        }
        if (k === 0) {
          const t = r.pick([120, 135, 150]), F = r.pick([10, 20, 30, 40, 50]), s = r.int(2, 8), [c] = TRIG[t], ans = rs(F * s * c[0], 2, c[1]);
          return { q: `${un(F, 'N')} の力が、物の動く向きと $${dg(t)}$ の角をなしている。物が ${un(s, 'm')} 動くあいだに、この力のした仕事は □ J`, a: `$${ans}$`, easy: `$${F}\\times${s}\\times\\cos${dg(t)}=${ans}$`, verify: () => numOK(`$${ans}$`, F * s * Math.cos(rad(t))) };
        }
        if (k === 1) {
          const m = r.int(1, 6), h = r.pick(['1', '1.5', '2', '3']), W = dmul(m, '9.8', h);
          return { q: `${un(m, 'kg')} の荷物をゆっくり ${un(h, 'm')} 下ろす手の仕事は □ J（$g=9.8\\,\\mathrm{N/kg}$）`, a: `$-${W}$`, easy: `手の力は上向き、動きは下向き：$${dmul(m, '9.8')}\\times${h}\\times\\cos${dg(180)}=-${W}$`, easyCheck: 'last', verify: () => numOK(`$-${W}$`, m * 9.8 * +h * Math.cos(Math.PI)) };
        }
        const F = r.pick([10, 20, 30, 40]), s = r.int(2, 10), ans = rs(F * s, 2, 2);
        return { q: `トロッコを、レールから $${dg(45)}$ ずれた向きに ${un(F, 'N')} の力で押して、レールにそって ${un(s, 'm')} 動かした。押した力の仕事は □ J`, a: `$${ans}$`, easy: `$${F}\\times${s}\\times\\cos${dg(45)}=${ans}$`, verify: () => numOK(`$${ans}$`, F * s * Math.SQRT1_2) };
      },
      // わな：成分で書いた力と動き（角がわからない。内積。4-75）。直角（仕事は0）は自分で解けるので s3 へ（第36回 N-3）
      trap(r) {
        const F =[r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], s = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], W = dot(F, s);
        const p = { q: `力 $\\vec{F}=${P(...F)}$（N）がはたらく物が、$\\vec{s}=${P(...s)}$（m）だけ動いた。力のした仕事は □ J`, a: `$${W}$`, verify: () => numOK(`$${W}$`, len(F) * len(s) * Math.cos(rad(angBetween(F, s)))) };
        return dest(p, '4-74', `角がわからない。成分で内積：$${F[0]}\\times${pr(s[0])}+${pr(F[1])}\\times${pr(s[1])}=${W}$`);
      },
    },
  });

  // ================================================================ 4-75
  const dotTeX = (a, b) => a.map((x, i) => `${pr(x)}\\times${pr(b[i])}`).join('+');
  M.add({
    id: '4-75', part: 5, chap: '4-12③', stars: 1,
    title: '成分の内積は「積の和」（答えは数）',
    mark: '成分で書いた2つのベクトルの**内積** $\\vec{a}\\cdot\\vec{b}$、成分で書いた力と動きの仕事。',
    futsu: ['大きさを2つ求め、', 'なす角を図でさがしてから、', '$\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert\\cos\\theta$ を計算する。'],
    raku: ['$(2,\\ -1)\\cdot(3,\\ 4)$', '$x$ どうし、$y$ どうしをかけてたす：', '$2\\times3+(-1)\\times4=2$', '答えはただの数'],
    why: '内積 $\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert\\cos\\theta$ は、余弦定理で計算し直すと $a_xb_x+a_yb_y$ になる（4-12③）。角がわからなくても、成分のかけ算とたし算だけで求められる。仕事は $W=\\vec{F}\\cdot\\vec{s}$。',
    caution: '内積の答えはベクトルではない（$(6,\\ -4)$ にしない）。$\\vec{a}\\cdot\\vec{a}$ は $\\lvert\\vec{a}\\rvert$ ではなく $\\lvert\\vec{a}\\rvert^2$。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '13mm', s2: '15mm', s3: '18mm', trap: '28mm' },
    fits(q) {
      if (/鋭角・直角・鈍角/.test(q)) return true;
      // 成分がわかっていて「|a||b|cosθ」を聞く（角を出さずに内積。4-76 のわな）
      if (/\\lvert\\vec\{a\}\\rvert\\lvert\\vec\{b\}\\rvert\\cos/.test(q) && coords(q).length >= 2) return true;
      if (/なす角|直交|垂直|向きの成分|偏差|単位|相関/.test(q)) return false;
      if (/\\cdot/.test(q) && coords(q).length >= 1) return true;
      if (/仕事/.test(q) && /\\vec\{F\}=\(/.test(q) && /\\vec\{s\}=\(/.test(q)) return true;
      return /内積/.test(q) && /組/.test(q);
    },
    steps: {
      s1(r) {
        const a = [r.int(-6, 6), r.int(-6, 6)], b = [r.int(-6, 6), r.int(-6, 6)];
        if (a.includes(0) && b.includes(0)) return null;
        if (a.every(v => v === 0) || b.every(v => v === 0)) return null;
        const d = dot(a, b);
        return { q: `$${P(...a)}\\cdot${P(...b)}$`, a: `$${d}$`, easy: `$${dotTeX(a, b)}=${d}$`, verify: () => numOK(`$${d}$`, len(a) * len(b) * Math.cos(rad(angBetween(a, b)))) };
      },
      // 名前つき・仕事・自分自身との内積
      s2(r) {
        const k = r.int(0, 2), a = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], b = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)];
        if (k === 0) { const d = dot(a, b); return { q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のとき、$\\vec{a}\\cdot\\vec{b}$`, a: `$${d}$`, easy: `$${dotTeX(a, b)}=${d}$`, verify: () => numOK(`$${d}$`, len(a) * len(b) * Math.cos(rad(angBetween(a, b)))) }; }
        if (k === 1) { const d = dot(a, b); return { q: `力 $\\vec{F}=${P(...a)}$（N）がはたらく物が、$\\vec{s}=${P(...b)}$（m）だけ動いた。力のした仕事は □ J`, a: `$${d}$`, easy: `$${dotTeX(a, b)}=${d}$`, verify: () => numOK(`$${d}$`, len(a) * len(b) * Math.cos(rad(angBetween(a, b)))) }; }
        const d = dot(a, a);
        return { q: `$\\vec{a}=${P(...a)}$ のとき、$\\vec{a}\\cdot\\vec{a}$`, a: `$${d}$`, easy: `$${dotTeX(a, a)}=${d}$`, verify: () => numOK(`$${d}$`, len(a) ** 2) };
      },
      // 数の組（買い物）・√ の成分・内積の符号となす角
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = [r.int(1, 5), r.int(1, 5), r.int(1, 5)], c = [r.pick([80, 100, 120, 150]), r.pick([30, 50, 60, 80]), r.pick([100, 150, 200, 250])], d = dot(n, c);
          return { q: `りんご・みかん・ももを買う。個数の組 $${VN(n)}$ と、1個の値段の組 $${VN(c)}$（円）の内積は、代金の合計。代金は □ 円`, a: `$${d}$`, easy: `$${n.map((x, i) => `${x}\\times${c[i]}`).join('+')}=${d}$`, verify: () => numOK(`$${d}$`, n.reduce((s, x, i) => s + x * c[i], 0)) };
        }
        if (k === 1) {
          const [aT, bT, a, b, tex] = r.pick([
            [P(1, '\\sqrt{3}'), P('\\sqrt{3}', 1), [1, Math.sqrt(3)], [Math.sqrt(3), 1], '2\\sqrt{3}'], [P(2, '\\sqrt{3}'), P('\\sqrt{3}', -1), [2, Math.sqrt(3)], [Math.sqrt(3), -1], '\\sqrt{3}'],
            [P('\\sqrt{2}', 1), P('\\sqrt{2}', 3), [Math.SQRT2, 1], [Math.SQRT2, 3], '5'], [P('\\sqrt{2}', '\\sqrt{2}'), P(3, -1), [Math.SQRT2, Math.SQRT2], [3, -1], '2\\sqrt{2}'],
            [P(1, '\\sqrt{2}'), P('\\sqrt{2}', -2), [1, Math.SQRT2], [Math.SQRT2, -2], '-\\sqrt{2}'], [P(3, '\\sqrt{3}'), P(-1, '\\sqrt{3}'), [3, Math.sqrt(3)], [-1, Math.sqrt(3)], '0'],
          ]);
          return { q: `$${aT}\\cdot${bT}$`, a: `$${tex}$`, easy: `（$x$ どうし、$y$ どうしの積の和）`, easyCheck: false, verify: () => numOK(`$${tex}$`, len(a) * len(b) * Math.cos(rad(angBetween(a, b)))) };
        }
        const a = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], b = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], d = dot(a, b);
        const ans = d > 0 ? '鋭角' : d < 0 ? '鈍角' : '直角';
        return {
          q: `$${P(...a)}$ と $${P(...b)}$ のなす角は（鋭角・直角・鈍角）□`, a: ans, easy: `（内積 $${dotTeX(a, b)}=${d}$ が${d > 0 ? '正' : d < 0 ? '負' : '0'}）`, easyCheck: false,
          verify: () => { const t = angBetween(a, b); const w = Math.abs(t - 90) < 1e-9 ? '直角' : t < 90 ? '鋭角' : '鈍角'; return w === ans || `なす角は ${w}`; },
        };
      },
      // わな：和（答えはベクトル。4-68）
      trap(r) {
        const a = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], b = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], w = add(a, b), ans = `$${P(...w)}$`;
        const p = { q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のとき、$\\vec{a}+\\vec{b}$`, a: ans, verify: () => vecOK(ans, combo(1, a, 1, b)) };
        return dest(p, '4-75', '内積ではなく和。答えはベクトルで、成分ごとにたす');
      },
    },
  });

  // ================================================================ 4-76
  // a と、a を 45°・90°・135° 回した向きのベクトル（成分が整数）
  function rotPair(r) {
    const u = [r.intNot(-3, 3, v => v === 0), r.int(-3, 3)], t = r.pick([45, 45, 135, 135, 90]);
    const v = t === 45 ? [u[0] - u[1], u[0] + u[1]] : t === 135 ? [-u[0] - u[1], u[0] - u[1]] : [-u[1], u[0]];
    const k = r.pick([1, 1, 2, -1]);
    let w = t === 90 ? mul(k, v) : v;
    if (w.every(x => x === 0)) return null;
    const g = gcd(w[0], w[1]); w = mul(1 / g, w);
    return r.chance(0.5) ? [u, w, t] : [w, u, t];
  }
  M.add({
    id: '4-76', part: 5, chap: '4-12③⑤', stars: 1,
    title: 'なす角は $\\cos\\theta=\\frac{\\vec{a}\\cdot\\vec{b}}{\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert}$',
    mark: '2つのベクトルの「**なす角**」、または、大きさとなす角から**内積**を聞かれる。',
    futsu: ['方眼に2本の矢印をかいて、', '分度器で角をはかる。'],
    raku: ['$(1,\\ 2)$、$(3,\\ 1)$：内積5', '$\\cos\\theta=\\frac{5}{\\sqrt{5}\\times\\sqrt{10}}=\\frac{1}{\\sqrt{2}}$', '$\\theta=45^{\\circ}$', '逆に $4\\times3\\times\\cos120^{\\circ}=-6$'],
    why: '内積の定義 $\\vec{a}\\cdot\\vec{b}=\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert\\cos\\theta$ を、$\\cos\\theta$ について解いた式。成分から内積と大きさを計算すれば、$\\cos\\theta$ がわかる（4-12③⑤）。',
    caution: 'なす角は、2つのベクトルの始点をそろえてはかる角（0°から180°）。$\\cos\\theta$ が負なら鈍角。矢印をつないだ所の角は、なす角ではない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    boxh: { s3: '12mm' },
    fits(q) {
      if (/合力|偏差|相関|速度|雨/.test(q)) return false;
      if (/\\lvert\\vec\{a\}\\rvert\\lvert\\vec\{b\}\\rvert\\cos/.test(q) && coords(q).length >= 2) return false;   // 成分があれば角はいらない（4-75）
      if (/なす角/.test(q) && !/鋭角・直角・鈍角/.test(q)) return true;
      return /\\lvert\\vec\{a\}\\rvert=/.test(q) && /\\cdot/.test(q) && /°|circ/.test(q);
    },
    steps: {
      // 成分からなす角（45°・90°・135°）
      s1(r) {
        const pr2 = rotPair(r);
        if (!pr2) return null;
        const [a, b, t] = pr2, d = dot(a, b), na = dot(a, a), nb = dot(b, b);
        return {
          q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のなす角は □`, a: `$${dg(t)}$`,
          easy: `$\\cos\\theta=${sfrac(d, `${rs(1, 1, na)}\\times${rs(1, 1, nb)}`)}=${rs(d, 1, 1) === '0' ? '0' : rs(Math.sign(d), 2, 2)}$`, easyCheck: false,
          verify: () => numOK(`$${dg(t)}$`, rad(angBetween(a, b))),
        };
      },
      // 大きさとなす角から内積
      s2(r) {
        const A = r.int(2, 8), B = r.int(2, 8), t = r.pick([30, 45, 60, 120, 135, 150, 90, 60, 120]);
        const [c] = t === 90 ? [[0, 1]] : TRIG[t], ans = rs(A * B * c[0], 2, c[1]);
        return {
          q: `$\\lvert\\vec{a}\\rvert=${A}$、$\\lvert\\vec{b}\\rvert=${B}$、なす角が $${dg(t)}$ のとき、$\\vec{a}\\cdot\\vec{b}$ ＝ □`, a: `$${ans}$`,
          easy: `$${A}\\times${B}\\times\\cos${dg(t)}=${ans}$`, verify: () => numOK(`$${ans}$`, len(mul(A, [1, 0])) * len(mul(B, [Math.cos(rad(t)), Math.sin(rad(t))])) * Math.cos(rad(angBetween([1, 0], [Math.cos(rad(t)), Math.sin(rad(t))])))),
        };
      },
      // cosθ の値・内積と大きさからなす角・矢印をつないだ所の角（わなから移した。第36回 N-3）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          // つなぎめの角はなす角ではない。始点をそろえると、なす角は 180° からひいた角
          const A = r.int(2, 8), B = r.int(2, 8), phi = r.pick([60, 45, 30, 120]), t = 180 - phi, [c] = TRIG[t], ans = rs(A * B * c[0], 2, c[1]);
          return {
            q: `$\\lvert\\vec{a}\\rvert=${A}$、$\\lvert\\vec{b}\\rvert=${B}$ で、$\\vec{a}$ の先に $\\vec{b}$ をつないだ角が $${dg(phi)}$。$\\vec{a}\\cdot\\vec{b}$ ＝ □`, a: `$${ans}$`,
            easy: `（つないだ角はなす角ではない。始点をそろえると、なす角は $180^{\\circ}-${dg(phi)}=${dg(t)}$。$${A}\\times${B}\\times\\cos${dg(t)}=${ans}$）`, easyCheck: false,
            // 別の道すじ：a を x 軸に置き、つなぎめで phi だけ曲がる向きに b を作る
            verify: () => { const a = [A, 0], b = [B * Math.cos(rad(180 - phi)), B * Math.sin(rad(180 - phi))]; return numOK(`$${ans}$`, dot(a, b)); },
          };
        }
        if (k === 0) {
          const a = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)], b = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)];
          const d = dot(a, b), N = dot(a, a) * dot(b, b);
          if (d === 0 || cross(a, b) === 0) return null;
          const [k, m] = surd(N), ans = rs(d, k * m, m);
          return {
            q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のなす角を $\\theta$ とするとき、$\\cos\\theta$ ＝ □`, a: `$${ans}$`,
            easy: `$${sfrac(d, `${rs(1, 1, dot(a, a))}\\times${rs(1, 1, dot(b, b))}`)}=${ans}$`, verify: () => numOK(`$${ans}$`, Math.cos(rad(angBetween(a, b)))),
          };
        }
        const A = r.int(2, 8), B = r.int(2, 8), t = r.pick([60, 120, 45, 135, 90]);
        const [c] = t === 90 ? [[0, 1]] : TRIG[t], d = rs(A * B * c[0], 2, c[1]);
        return {
          q: `$\\lvert\\vec{a}\\rvert=${A}$、$\\lvert\\vec{b}\\rvert=${B}$、$\\vec{a}\\cdot\\vec{b}=${d}$ のとき、なす角は □`, a: `$${dg(t)}$`,
          easy: `（$\\cos\\theta=${pr(d)}\\div${A * B}=${rs(c[0], 2, c[1])}$）`, easyCheck: false, verify: () => numOK(`$${dg(t)}$`, Math.acos(M.evalMath(d, {}) / (A * B))),
        };
      },
      // わな：成分がわかっていて |a||b|cosθ を聞く（角を出さなくてよい。内積は積の和。4-75）
      //   「つなぎめの角」は 4-76 自身で解けるので s3 へ移した（第36回 N-3・R2-2）
      trap(r) {
        const a = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], b = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)];
        if (cross(a, b) === 0) return null;
        const d = dot(a, b);
        const p = {
          q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$、なす角 $\\theta$ のとき、$\\lvert\\vec{a}\\rvert\\lvert\\vec{b}\\rvert\\cos\\theta$ ＝ □`, a: `$${d}$`,
          // 別の道すじ：大きさと、atan2 で出したなす角から
          verify: () => numOK(`$${d}$`, len(a) * len(b) * Math.cos(rad(angBetween(a, b)))),
        };
        return dest(p, '4-76', `$\\theta$ を出さなくてよい。これは内積そのもの。成分の積の和：$${dotTeX(a, b)}=${d}$`);
      },
    },
  });

  // ================================================================ 4-77
  M.add({
    id: '4-77', part: 5, chap: '4-12④・4-8⑤', stars: 1,
    title: '直交なら内積0：$(a,\\ b)$ に垂直なのは $(-b,\\ a)$',
    mark: '「**直交する**ように $k$ を決める」「**垂直な**ベクトルを1つ」のように、直角になる条件を聞かれる。',
    futsu: ['方眼に矢印をかいて、', '直角になる向きを', '三角定規でさがす。'],
    raku: ['$(3,\\ k)\\cdot(2,\\ -6)=6-6k=0$', '$k=1$', '$(2,\\ -6)$ に垂直：入れかえて', '片方の符号を変える → $(6,\\ 2)$'],
    why: '$\\vec{0}$ でない2つのベクトルが直交するのは、$\\cos90^{\\circ}=0$ なので内積が0のとき（4-12④）。$(a,\\ b)$ を左へ90°回すと $(-b,\\ a)$ になり（4-8⑤）、内積は $-ab+ba=0$。',
    caution: '「平行」は「直交」とちがう。平行なら、一方がもう一方の実数倍（成分の比が等しい）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '15mm', s2: '22mm', s3: '22mm', trap: '15mm' },
    fits(q) { return /直交|に垂直で|AOB\}?=90/.test(q) && !/偏差|相関|仕事/.test(q); },
    steps: {
      // (p, k)・(r, s)＝0 の k
      s1(r) {
        const b = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], kpos = r.pick([0, 1]), o = 1 - kpos;
        const known = r.intNot(-6, 6, v => v === 0 || (v * b[o]) % b[kpos] !== 0), k = -known * b[o] / b[kpos];
        const aT = kpos === 1 ? P(known, 'k') : P('k', known), A = kpos === 1 ? [known, k] : [k, known];
        const lin = kpos === 1 ? `${known * b[0]}${b[1] < 0 ? '-' : '+'}${Math.abs(b[1]) === 1 ? '' : Math.abs(b[1])}k` : `${b[0] === -1 ? '-' : b[0] === 1 ? '' : b[0]}k${known * b[1] < 0 ? '' : '+'}${known * b[1]}`;
        return {
          q: `$\\vec{a}=${aT}$ と $\\vec{b}=${P(...b)}$ が直交するとき、$k=□$`, a: `$${k}$`, easy: `$${lin}=0$ より $k=${k}$`, easyCheck: 'last',
          verify: () => close(dot(A, b), 0) || '内積が0にならない',
        };
      },
      // 垂直で同じ大きさのベクトル・直交するかの判定
      s2(r) {
        if (r.chance(0.55)) {
          const a = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)];
          const c1 = [-a[1], a[0]], w = c1[0] > 0 ? c1 : [a[1], -a[0]], ans = `$${P(...w)}$`;
          return {
            q: `$${P(...a)}$ に垂直で、大きさが同じベクトルのうち、$x$ 成分が正のものは □`, a: ans, easy: `（入れかえて片方の符号を変える：$${P(...c1)}$ と $${P(-c1[0], -c1[1])}$）`, easyCheck: false,
            verify: () => { const g = vecOf(ans); return (Math.abs(angBetween(g, a) - 90) < 1e-9 && close(len(g), len(a)) && g[0] > 0) || '垂直・同じ大きさ・x が正 になっていない'; },
          };
        }
        const a = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], yes = r.chance(0.5), k = r.pick([1, 2, -1, 3]);
        const b = yes ? mul(k, [-a[1], a[0]]) : [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], d = dot(a, b), ans = d === 0 ? 'する' : 'しない';
        return {
          q: `$${P(...a)}$ と $${P(...b)}$ は直交するか。（する・しない）□`, a: ans, easy: `（内積 $${dotTeX(a, b)}=${d}$）`, easyCheck: false,
          verify: () => ((Math.abs(angBetween(a, b) - 90) < 1e-9) === (ans === 'する')) || 'まちがい',
        };
      },
      // k が2つ・a＋tb ⊥ b・∠AOB＝90°
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          // (k,\ s)・(k,\ -t)＝k^2-st＝0、st＝m^2
          const m = r.int(1, 6), s = r.pick(ds(m * m)), t = m * m / s;
          return {
            q: `$${P('k', s)}$ と $${P('k', -t)}$ が直交するとき、$k$ の値を2つ □`, a: `$${m},\\ ${-m}$`, easy: `$k^2-${s * t}=0$ より $k=\\pm${m}$`, easyCheck: false, key: `kk${s},${t}`,
            verify: () => [m, -m].every(v => close(dot([v, s], [v, -t]), 0)) || 'どちらかの k で内積が0にならない',
          };
        }
        if (k === 1) {
          const b = [r.intNot(-3, 3, v => v === 0), r.intNot(-3, 3, v => v === 0)], nb = dot(b, b), t = r.intNot(-3, 3, v => v === 0);
          const perp = mul(r.int(-2, 2), [-b[1], b[0]]), a = add(mul(-t, b), perp);
          if (a.every(v => v === 0)) return null;
          return {
            q: `$\\vec{a}=${P(...a)}$、$\\vec{b}=${P(...b)}$ のとき、$\\vec{a}+t\\vec{b}$ が $\\vec{b}$ と直交する $t$ は □`, a: `$${t}$`,
            easy: `$\\vec{a}\\cdot\\vec{b}+t\\lvert\\vec{b}\\rvert^2=${dot(a, b)}+${nb}t=0$ より $t=${t}$`, easyCheck: 'last',
            verify: () => close(dot(add(a, mul(t, b)), b), 0) || '直交しない',
          };
        }
        const A = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], bx = r.intNot(-6, 6, v => v === 0 || (A[0] * v) % A[1] !== 0), kk = -A[0] * bx / A[1];
        return {
          q: `${pt('O', 0, 0)}、${pt('A', ...A)}、$\\mathrm{B}${P(bx, 'k')}$ で $\\angle\\mathrm{AOB}=90^{\\circ}$ のとき、$k=□$`, a: `$${kk}$`,
          easy: `$${ar('OA')}\\cdot${ar('OB')}=${A[0] * bx}${A[1] < 0 ? '' : '+'}${A[1]}k=0$ より $k=${kk}$`, easyCheck: 'last',
          verify: () => (Math.abs(angBetween(A, [bx, kk]) - 90) < 1e-9) || '直角にならない',
        };
      },
      // わな：平行（内積0ではなく、実数倍。実数倍は成分ごと：4-68）
      trap(r) {
        const b = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)], p = r.intNot(-6, 6, v => v === 0 || (v * b[1]) % b[0] !== 0), k = p * b[1] / b[0];
        return {
          q: `$\\vec{a}=${P(p, 'k')}$ と $\\vec{b}=${P(...b)}$ が平行のとき、$k=□$`, a: `$${k}$`,
          easy: `（平行は直交ではない。内積0ではなく、$\\vec{a}$ が $\\vec{b}$ の $${tq(p, b[0])}$ 倍（実数倍は成分ごと）：$k=${pr(b[1])}\\times${pr(tq(p, b[0]))}=${k}$。わざ 4-68 で）`, easyCheck: false, also: ['4-68'],
          verify: () => close(cross([p, k], b), 0) || '平行にならない',
        };
      },
    },
  });
  // 約数（4-77 で使う）
  function ds(n) { const o = []; for (let i = 1; i <= n; i++) if (n % i === 0) o.push(i); return o; }

  // ================================================================ 4-78
  M.add({
    id: '4-78', part: 5, chap: '4-12⑥', stars: 1,
    title: 'ある向きの成分（正射影）は、単位ベクトルとの内積',
    mark: '「**□の向きの成分**」「この向きに動いたときの仕事」のように、ななめの向きへの影の長さを聞かれる。',
    futsu: ['2つのベクトルのなす角を', '求めてから、', '$\\lvert\\vec{F}\\rvert\\cos\\theta$ を計算する。'],
    raku: ['$\\vec{F}=(6,\\ 8)$、向き $(4,\\ 3)$', '$\\vec{e}=(0.8,\\ 0.6)$', '$\\vec{e}\\cdot\\vec{F}=4.8+4.8=9.6$', '5 m 動けば $9.6\\times5=48$ J'],
    why: '影の長さは $\\lvert\\vec{F}\\rvert\\cos\\theta$。$\\lvert\\vec{e}\\rvert=1$ なので、これは $\\vec{e}\\cdot\\vec{F}$ と同じ。$x$ 成分も、$(1,\\ 0)$ の向きへの正射影だった（4-12⑥）。',
    caution: '向きのベクトルは、先に単位ベクトルにする。$(4,\\ 3)$ のまま内積をとると、大きさ5の分だけ5倍になる。90°より大きい角なら、成分は負。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '15mm', s2: '15mm', s3: '15mm', trap: '22mm' },
    fits(q) { return /向きの成分|正射影|スピードガン/.test(q) || (/の向きに/.test(q) && /動いた/.test(q) && /仕事/.test(q)); },
    steps: {
      s1(r) {
        const [x, y, c] = r.pick([[4, 3, 5], [3, 4, 5], [6, 8, 10], [8, 6, 10], [3, -4, 5], [4, -3, 5], [-3, 4, 5]]), F = [r.int(-5, 10), r.int(-5, 10)];
        if (F.every(v => v === 0)) return null;
        const d = [x, y], comp = tq(dot(F, d), c, true), e = V2(tq(x, c, true), tq(y, c, true));
        return {
          q: `力 $\\vec{F}=${P(...F)}$（N）の、$${P(...d)}$ の向きの成分は □ N`, a: `$${comp}$`,
          easy: `$\\vec{e}=${e}$。$${tq(x, c, true)}\\times${pr(F[0])}+${pr(tq(y, c, true))}\\times${pr(F[1])}=${comp}$`, easyCheck: 'last',
          verify: () => numOK(`$${comp}$`, len(F) * Math.cos(rad(angBetween(F, d)))),
        };
      },
      // その向きに動いたときの仕事・√ のとき
      s2(r) {
        if (r.chance(0.6)) {
          const [x, y, c] = r.pick([[4, 3, 5], [3, 4, 5], [4, -3, 5], [3, -4, 5]]), F = [r.int(-5, 10), r.int(-5, 10)], s = r.int(2, 10);
          if (F.every(v => v === 0)) return null;
          const d = [x, y], comp = tq(dot(F, d), c, true), W = tq(dot(F, d) * s, c, true);
          return {
            q: `力 $\\vec{F}=${P(...F)}$（N）で、物が $${P(...d)}$ の向きに ${un(s, 'm')} 動いた。仕事は □ J`, a: `$${W}$`,
            easy: `その向きの成分 $${comp}$、$${pr(comp)}\\times${s}=${W}$`, easyCheck: 'last',
            verify: () => numOK(`$${W}$`, dot(F, mul(s / len(d), d))),
          };
        }
        const d = r.pick([[1, 1], [1, -1], [-1, 1]]), F = [r.int(-5, 9), r.int(-5, 9)], t = dot(F, d), ans = rs(t, 2, 2);
        if (t === 0) return null;
        return { q: `力 $\\vec{F}=${P(...F)}$（N）の、$${P(...d)}$ の向きの成分は □ N`, a: `$${ans}$`, easy: `$\\vec{e}=\\frac{1}{\\sqrt{2}}${P(...d)}$。$${sfrac(t, '\\sqrt{2}')}=${ans}$`, easyCheck: 'last', verify: () => numOK(`$${ans}$`, len(F) * Math.cos(rad(angBetween(F, d)))) };
      },
      // 場面：坂を下る向きの重力・スピードガン・x 軸の向き
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [x, y, c] = r.pick([[4, 3, 5], [3, 4, 5], [12, 5, 13], [8, 6, 10]]), W = c * r.int(2, 10), comp = W * y / c;
          return { q: `坂を下る向きは $${P(x, -y)}$（右へ ${x} 進むと ${y} 下がる）。重力 $${P(0, -W)}$（N）の、坂を下る向きの成分は □ N`, a: `$${comp}$`, easy: `$\\vec{e}=${V2(tq(x, c, true), tq(-y, c, true))}$。$${pr(tq(-y, c, true))}\\times${pr(-W)}=${comp}$`, easyCheck: 'last', verify: () => numOK(`$${comp}$`, len([0, W]) * Math.cos(rad(angBetween([0, -W], [x, -y])))) };
        }
        if (k === 1) {
          const [x, y, c] = r.pick([[4, 3, 5], [3, 4, 5]]), v = [r.int(10, 40), r.int(-10, 30)], comp = tq(dot(v, [x, y]), c, true);
          return { q: `ボールの速度は $\\vec{v}=${P(...v)}$（m/s）。スピードガンではかれるのは、$${P(x, y)}$ の向きの成分だけ。はかった値は □ m/s`, a: `$${comp}$`, easy: `$\\vec{e}=${V2(tq(x, c, true), tq(y, c, true))}$ との内積`, easyCheck: false, verify: () => numOK(`$${comp}$`, len(v) * Math.cos(rad(angBetween(v, [x, y])))) };
        }
        const b = [r.intNot(-9, 9, v => v === 0), r.intNot(-9, 9, v => v === 0)], ax = r.pick([0, 1]);
        return { q: `$\\vec{b}=${P(...b)}$ の、$\\vec{e}_${'xy'[ax]}=${ax ? P(0, 1) : P(1, 0)}$ の向きの成分は □`, a: `$${b[ax]}$`, easy: `（$${ax ? '0' : '1'}\\times${pr(b[0])}+${ax ? '1' : '0'}\\times${pr(b[1])}=${b[ax]}$。${'xy'[ax]} 成分そのもの）`, easyCheck: false, verify: () => numOK(`$${b[ax]}$`, len(b) * Math.cos(rad(angBetween(b, ax ? [0, 1] : [1, 0])))) };
      },
      // わな：「向きの成分」ではなく「その向きの力」（4-71）
      trap(r) {
        const [x, y, c] = r.pick(UNI.slice(0, 6)), F = c * r.int(2, 3), w = mul(F / c, [x, y]), ans = `$${P(...w)}$`;
        const p = { q: `$${P(x, y)}$ の向きにはたらく、大きさ ${un(F, 'N')} の力の成分は □`, a: ans, verify: () => { const g = vecOf(ans); return (close(len(g), F) && angBetween(g, [x, y]) < 1e-6) || '合わない'; } };
        return dest(p, '4-78', `影の長さではなく、その向きの力を作る。単位ベクトル $\\frac{1}{${c}}${P(x, y)}$ に ${F} をかける`);
      },
    },
  });

  // ================================================================ 4-96
  M.add({
    id: '4-96', part: 5, chap: '4-11⑨', stars: 1,
    title: '力のつり合いは成分ごとに和が0',
    mark: '物が止まっていて（**つり合っていて**）、わからない力を、成分や角から求める。',
    futsu: ['力の矢印をつないで、', '閉じた三角形をかき、', '辺の長さをはかる。'],
    raku: ['100 N を30°と60°のひもで', '$x$：$-\\frac{\\sqrt{3}}{2}T_1+\\frac{1}{2}T_2=0$', '$y$：$\\frac{1}{2}T_1+\\frac{\\sqrt{3}}{2}T_2=100$', '$T_1=50$、$T_2=50\\sqrt{3}$'],
    why: 'つり合っているとは、合力が $\\vec{0}=(0,\\ 0)$ になること。成分で書くと「$x$ 成分の和＝0」と「$y$ 成分の和＝0」の2つの式ができるので、わからない力が2つあっても連立方程式で求められる（4-11⑨）。',
    caution: 'つり合う力は、ほかの力の合力と大きさが同じで反対向き。合力そのものとまちがえない。ひもが水平に近いほど、ひもの力は大きくなる。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '28mm', s2: '18mm', s3: '18mm', trap: '28mm' },
    fits(q) { return /つり合|つる/.test(q) && !/合力は|シーソー/.test(q); },
    steps: {
      // 成分で書いた力のつり合い（3つめ・4つめの力）
      s1(r) {
        const n = r.pick([2, 2, 3]), fs = [];
        for (let i = 0; i < n; i++) fs.push([r.intNot(-8, 8, v => v === 0), r.intNot(-8, 8, v => v === 0)]);
        let s = [0, 0]; fs.forEach(f => { s = add(s, f); });
        const w = mul(-1, s);
        if (w.every(v => v === 0)) return null;
        const ans = `$${P(...w.map(v => v + 0))}$`;
        return {
          q: `力 ${fs.map(f => `$${P(...f)}$`).join('、')}（N）とつり合う力 $\\vec{F}$ ＝ □`, a: ans,
          easy: `（$x$ 成分：$${fs.map(f => pr(f[0])).join('+')}+F_x=0$。$y$ 成分も同じ。ほかの力の和の反対）`, easyCheck: false,
          verify: () => { const g = vecOf(ans); let t = g.slice(); fs.forEach(f => { t = add(t, f); }); return (close(t[0], 0) && close(t[1], 0)) || '和が0にならない'; },
        };
      },
      // 左右対称につるす
      s2(r) {
        const t = r.pick([30, 45, 60]), W = r.pick([20, 30, 40, 50, 60, 80, 100]);
        const ans = t === 30 ? `${W}` : t === 45 ? rs(W, 2, 2) : rs(W, 3, 3);
        return {
          q: `${un(W, 'N')} の電灯を、水平から $${dg(t)}$ の2本のひもで左右対称につるす。1本の力は □ N`, a: `$${ans}$`,
          easy: `（$x$ 成分は打ち消し合う。$y$：$2T\\sin${dg(t)}=${W}$）$T=${ans}$`, easyCheck: 'last',
          verify: () => numOK(`$${ans}$`, W / (2 * Math.sin(rad(t)))),
        };
      },
      // 30°と60°のひも・水平に引く
      s3(r) {
        if (r.chance(0.6)) {
          const W = r.pick([20, 40, 60, 80, 100, 200]), [al, be] = r.pick([[30, 60], [60, 30]]), left = r.chance(0.5);
          // 別の道すじ：2元連立1次方程式をクラメルの公式で解く
          const solve = () => { const a1 = -Math.cos(rad(al)), b1 = Math.cos(rad(be)), a2 = Math.sin(rad(al)), b2 = Math.sin(rad(be)), D = a1 * b2 - a2 * b1; return [(0 * b2 - W * b1) / D, (a1 * W - a2 * 0) / D]; };
          const T1 = rs(W, 2, al === 30 ? 1 : 3), T2 = rs(W, 2, be === 30 ? 1 : 3);   // T1 = W cosβ、T2 = W cosα
          const ans = left ? T1 : T2;
          return {
            q: `重さ ${un(W, 'N')} の看板を、左は水平から $${dg(al)}$、右は水平から $${dg(be)}$ の2本のひもでつるす。${left ? '左' : '右'}のひもの力は □ N`, a: `$${ans}$`,
            easy: `（$x$ 成分の和＝0、$y$ 成分の和＝0 の連立方程式）`, easyCheck: false, key: `${W},${al},${left}`,
            verify: () => numOK(`$${ans}$`, solve()[left ? 0 : 1]),
          };
        }
        const W = r.pick([10, 20, 30, 40, 60]), t = r.pick([30, 45, 60]), ans = t === 30 ? rs(W, 3, 3) : t === 45 ? `${W}` : rs(W, 1, 3);
        return {
          q: `重さ ${un(W, 'N')} の玉を糸でつるし、水平な力 $F$ で横に引くと、糸がたての線から $${dg(t)}$ かたむいて止まった。$F$ ＝ □ N`, a: `$${ans}$`,
          easy: `（糸の力 $T$：$y$ は $T\\cos${dg(t)}=${W}$、$x$ は $F=T\\sin${dg(t)}$）`, easyCheck: false,
          verify: () => { const T = W / Math.cos(rad(t)); return numOK(`$${ans}$`, T * Math.sin(rad(t))); },
        };
      },
      // わな：つり合う力ではなく合力（4-68）
      trap(r) {
        const a = [r.intNot(-8, 8, v => v === 0), r.intNot(-8, 8, v => v === 0)], b = [r.intNot(-8, 8, v => v === 0), r.intNot(-8, 8, v => v === 0)], w = add(a, b);
        if (w.every(v => v === 0)) return null;
        const ans = `$${P(...w)}$`;
        const p = { q: `2つの力 $${P(...a)}$、$${P(...b)}$（N）の合力は □`, a: ans, verify: () => vecOK(ans, combo(1, a, 1, b)) };
        return dest(p, '4-96', `つり合う力ではなく合力。成分ごとにたすだけ（つり合う力は、その反対の $${P(-w[0], -w[1])}$）`);
      },
    },
  });

  // ================================================================ 4-97
  // 偏差のベクトル dx と、dx に直交して大きさが同じ w（成分の和はどちらも0）
  const DEV = [
    [[-2, -1, 1, 2], [1, -2, 2, -1]], [[-2, -1, 1, 2], [-1, 2, -2, 1]], [[-3, -1, 1, 3], [1, -3, 3, -1]],
    [[-1, -1, 1, 1], [1, -1, 1, -1]], [[-1, -1, 1, 1], [-1, 1, 1, -1]], [[-2, -1, 0, 1, 2], [1, -2, 0, 2, -1]], [[1, 2, -1, -2], [-2, 1, 2, -1]],
  ];
  // r ＝ p/√(p²+q²)
  const PQ = [[1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1], [1, -1], [3, 4], [4, 3], [-3, 4], [-4, 3], [4, -3]];
  const rTeX = (p, q) => { const S = p * p + q * q; return S === 1 ? `${p}` : S === 2 ? rs(p, 2, 2) : tq(p, 5); };
  const listTeX = a => a.join('、');
  // 相関係数を、もとのデータから共分散・標準偏差の式で計算する（別の道すじ）
  function corr(xs, ys) {
    const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0) / n - mx * my, sx = Math.sqrt(xs.reduce((s, x) => s + x * x, 0) / n - mx * mx), sy = Math.sqrt(ys.reduce((s, y) => s + y * y, 0) / n - my * my);
    return sxy / (sx * sy);
  }
  M.add({
    id: '4-97', part: 5, chap: '4-12⑦', stars: 1,
    title: '相関係数は偏差のベクトルの cos',
    mark: '2つのデータの偏差がわかっていて（または計算できて）、**相関係数** $r$ を聞かれる。',
    futsu: ['共分散と、2つの標準偏差を', 'それぞれ人数でわって求めてから、', '$r=\\frac{\\sigma_{xy}}{\\sigma_x\\sigma_y}$ を計算する。'],
    raku: ['偏差 $(-2,\\ -1,\\ 1,\\ 2)$、$(-15,\\ 5,\\ -5,\\ 15)$', '内積50、大きさ $\\sqrt{10}$、$\\sqrt{500}$', '$r=\\frac{50}{\\sqrt{10}\\times\\sqrt{500}}=\\frac{\\sqrt{2}}{2}$', '人数でわらなくてよい'],
    why: '共分散は（偏差の内積）÷$n$、標準偏差は（偏差のベクトルの大きさ）÷$\\sqrt{n}$。$r$ の分母と分子で $n$ が消えて、偏差のベクトルのなす角の $\\cos$ だけが残る（4-12⑦）。',
    caution: '偏差（平均との差）にしてから内積をとる。もとのデータのままでは $\\cos$ が相関係数にならない。同じ向きなら $r=1$、直交なら $r=0$、反対向きなら $r=-1$。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '15mm',
    boxh: { s1: '12mm', s2: '12mm', s3: '12mm' },
    fits(q) { return /相関|\\vec\{d\}_x/.test(q) && !/共分散|標準偏差/.test(q); },
    steps: {
      // 偏差のベクトルから r
      s1(r) {
        const [dx, w] = r.pick(DEV), [p, q] = r.pick(PQ), k = r.pick([1, 2, 3, 5]);
        const dy = add(mul(p, dx), mul(q, w)).map(v => v * k), ans = rTeX(p, q), d = dot(dx, dy), nx = dot(dx, dx), ny = dot(dy, dy);
        if (dy.every(v => v === 0)) return null;
        return {
          q: `$\\vec{d}_x=${VN(dx)}$、$\\vec{d}_y=${VN(dy)}$ のとき $r$ ＝ □`, a: `$${ans}$`,
          easy: `$${sfrac(d, `${rs(1, 1, nx)}\\times${rs(1, 1, ny)}`)}=${ans}$`,
          verify: () => numOK(`$${ans}$`, corr(dx.map(v => v + 7), dy.map(v => v + 40))),
        };
      },
      // もとのデータから（平均を出して偏差にする）
      s2(r) {
        const [dx, w] = r.pick(DEV), [p, q] = r.pick(PQ.filter(([a]) => a !== 0)), k = r.pick([2, 3, 5]);
        const dy = add(mul(p, dx), mul(q, w)).map(v => v * k), mx = r.int(3, 8), my = r.pick([50, 55, 60, 65, 70]);
        const xs = dx.map(v => v + mx), ys = dy.map(v => v + my), ans = rTeX(p, q), n = xs.length;
        if (ys.some(v => v < 0 || v > 100) || xs.some(v => v < 0)) return null;
        return {
          q: `${n}人の勉強時間 $x$（時間）が ${listTeX(xs)}、テストの点 $y$ が ${listTeX(ys)} のとき、相関係数 $r$ ＝ □`, a: `$${ans}$`,
          easy: `平均 $${mx}$、$${my}$。偏差 $${VN(dx)}$、$${VN(dy)}$。$r=${sfrac(dot(dx, dy), `${rs(1, 1, dot(dx, dx))}\\times${rs(1, 1, dot(dy, dy))}`)}=${ans}$`, easyCheck: 'last',
          verify: () => numOK(`$${ans}$`, corr(xs, ys)),
        };
      },
      // なす角から r・偏差が実数倍・r と向き
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t = r.pick([0, 30, 45, 60, 90, 120, 135, 150, 180]), ans = t === 0 ? '1' : t === 90 ? '0' : t === 180 ? '-1' : rs(TRIG[t][0][0], 2, TRIG[t][0][1]);
          return { q: `2つの偏差のベクトルのなす角が $${dg(t)}$ のとき、相関係数 $r$ ＝ □`, a: `$${ans}$`, easy: `$\\cos${dg(t)}=${ans}$`, verify: () => numOK(`$${ans}$`, Math.cos(rad(t))) };
        }
        if (k === 1) {
          const c = r.pick([2, 3, -2, -3, 4, -4, 5]), ans = c > 0 ? '1' : '-1', [dx] = r.pick(DEV);
          return { q: `偏差のベクトルが $\\vec{d}_y=${c}\\vec{d}_x$ のとき、相関係数 $r$ ＝ □`, a: `$${ans}$`, easy: `（${c > 0 ? '同じ' : '反対の'}向きなので $\\cos${c > 0 ? '0' : '180'}^{\\circ}=${ans}$）`, easyCheck: false, key: `m${c}`, verify: () => numOK(`$${ans}$`, corr(dx, mul(c, dx))) };
        }
        const [rv, ans] = r.pick([['0', '直交する'], ['1', '同じ向き'], ['-1', '反対向き']]);
        return { q: `相関係数が $${rv}$ のとき、2つの偏差のベクトルは（同じ向き・直交する・反対向き）□`, a: ans, easy: `（$\\cos\\theta=${rv}$）`, easyCheck: false, verify: () => ({ 0: '直交する', 1: '同じ向き', '-1': '反対向き' })[rv] === ans || 'まちがい' };
      },
      // わな：標準偏差・共分散（cos ではない）
      trap(r) {
        const [dx] = r.pick(DEV), n = dx.length, k = r.pick([1, 2, 3]), d = mul(k, dx), S = dot(d, d);
        if (r.chance(0.5)) {
          const ans = rs(1, n, S * n);   // √S÷√n ＝ √(Sn)÷n
          return { q: `偏差のベクトルが $${VN(d)}$ のデータの標準偏差は □`, a: `$${ans}$`, easy: `（楽な形なし。cos ではない。偏差のベクトルの大きさ $\\sqrt{${S}}${rs(1, 1, S) === `\\sqrt{${S}}` ? '' : `=${rs(1, 1, S)}`}$ を $${n === 4 ? '\\sqrt{4}=2' : `\\sqrt{${n}}`}$ でわる）`, easyCheck: false, verify: () => numOK(`$${ans}$`, Math.sqrt(d.reduce((s, x) => s + x * x, 0) / n)) };
        }
        const [, w] = r.pick(DEV.filter(([a]) => a.length === n)), [p, q] = r.pick(PQ), dy = add(mul(p, dx), mul(q, w));
        const ans = tq(dot(d, dy), n, true);
        return { q: `偏差のベクトルが $\\vec{d}_x=${VN(d)}$、$\\vec{d}_y=${VN(dy)}$ のとき、共分散は □`, a: `$${ans}$`, easy: `（cos ではない。偏差の内積（積の和）$${dot(d, dy)}$ を人数 ${n} でわる。わざ 4-75 で）`, easyCheck: false, also: ['4-75'], verify: () => numOK(`$${ans}$`, corr(d, dy) * Math.sqrt(dot(d, d) / n) * Math.sqrt(dot(dy, dy) / n)) };
      },
    },
  });
})(globalThis.MONDAI);
