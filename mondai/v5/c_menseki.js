/* 問題集 第5巻『変化をつかむ』　第3部 グラフの面積と長方形の和（わざ 5-31〜5-45。教科書 5-9・5-10）　組 c
 * 書き方は v5/README.md（第5巻）・v4/README.md・v2/README.md。文は教科書 第5巻と同じ：ルビなし・常用漢字まで。式は $…$。
 * 教科書のことばにそろえる：進んだ距離、変位、道のり、はじめの速さ・おわりの速さ（5-9）、右はし・左はしの長方形（5-10）、
 *   台形で近似、下端・上端、うすい円板。はば・たて・もどる・ふえる はかな。
 * 図（K-2・L-2）：ステップ1・2 は図なし。図は 5-31〜5-34・5-36・5-38・5-40・5-44・5-45（立体）のステップ3に出す。
 *   グラフは M.graph（x と y で別の倍率）。目もりは問題に要る所だけ。横軸の上と下は、斜線とうすいぬりで分ける（M-7）。
 *   図の点・目もりの数は、問題の数から計算する。字と線・字と字が重なる図は作らない（figClash。第36回 N-6）。
 * わなは、そのわざ自身では解けない問題にして、答えに行き先（わざの番号か「わざなし」）を書く（N-3。dest）。
 *   わなは見わけように図なしで出るので、文だけで解けるように書く。
 * 答えの確かめ：定積分は calc（kind 'defint'）。長方形の和・Σ・極限・面積のつみ上げは verify で、別の道すじ（1つずつたす、
 *   細かく分けた数値積分、大きな n を入れる）で計算し直す。
 * 同じ見開きの重なり（N-2）：入れかえただけの問題・逆の問題は key でよける（ほかのわざのわなと同じ問題も、同じ key に）。
 * 形のちがう問題（図のある・なし、変位・道のり、右はし・左はし）は、turn でかわるがわる出す。
 * 分数は fq で約分し、小数は decOf で整数の計算から作る（まるめない）。 */
(function (M) {
  'use strict';
  const PART = 3;
  const F = M.F;

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const fq = x => (Array.isArray(x) ? F.make(x[0], x[1]) : F.fromDec(fmt(x)));   // 数を分数に（[分子, 分母] は約分する）
  const isTerm = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  // 小数で書ける分数は小数（小数第4位まで。けたが多いときは分数のまま）、ほかは \frac。小数は整数の計算で作る（まるめない）
  const decOf = x => { const [n, d] = fq(x); if (!isTerm(d)) return null; let k = 0, p = 1; while (p % d) { p *= 10; k++; if (k > 12) return null; } const m = Math.abs(n) * (p / d), s = String(m).padStart(k + 1, '0'); return { k, t: (n < 0 ? '-' : '') + (k ? s.slice(0, -k) + '.' + s.slice(-k) : s) }; };
  const ft = x => { const d = decOf(x); return d && d.k <= 4 ? d.t : F.tex(fq(x)); };
  const fr = x => F.tex(fq(x));                                     // 分数のまま
  const fv = x => { const [n, d] = fq(x); return n / d; };
  const par = x => { const t = ft(x); return fv(x) < 0 ? `(${t})` : t; };   // マイナスはかっこごと
  const close = (x, y, e) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (e || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const ev = s => M.evalMath(strip(s), {});
  const ok = (s, v, e) => close(ev(s), v, e) || `答え ${s} の値が ${fmt(v)} とちがう`;
  // 答えが「$3$、$7$、$9$」のように数がならぶとき
  const okList = (s, vs) => { const got = (String(s).match(/\$[^$]*\$/g) || []).map(ev); return (got.length === vs.length && got.every((g, i) => close(g, vs[i]))) || `答え ${s} が ${vs.map(fmt).join('、')} とちがう`; };
  // 同じ見開きの重なり（N-2）の key：数を小さい順にならべる
  const NK = (tag, ...v) => tag + ':' + v.map(Number).sort((a, b) => a - b).join(',');
  const range = (a, b, st) => { const o = []; for (let i = a; i <= b + 1e-9; i += (st || 1)) o.push(+i.toFixed(6)); return o; };
  // 形のちがう問題を、かわるがわる出す（同じ乱数の列の中で。はじめの形は乱数で決める）。n は形の数
  const turn = (r, tag, n) => { const k = '_turn' + tag; r[k] = r[k] == null ? r.int(0, n - 1) : (r[k] + 1) % n; return r[k]; };
  const unturn = (r, tag, n) => { const k = '_turn' + tag; r[k] = (r[k] + n - 1) % n; return null; };   // 作れなかったとき：順番を1つもどして null
  const ASK = r => ['変位', '道のり'][turn(r, 'ask', 2)];
  const MS = v => `$${fmt(v)}\\,\\mathrm{m/s}$`;
  const KMH = v => `時速 $${fmt(v)}\\,\\mathrm{km}$`;            // 「車が${KMH(v)}」のように、前の字とのあいだに空白を入れない（R1-27）
  const BOX = u => `$□\\,\\mathrm{${u}}$`;
  const UNITS = '（$t$ は秒、$v$ は $\\mathrm{m/s}$）';
  // 数値積分（シンプソン法）。verify で、わざの計算とは別に面積を出し直す
  function simpson(f, a, b, n) {
    n = n || 2000; const h = (b - a) / n; let s = f(a) + f(b);
    for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h);
    return s * h / 3;
  }
  // 折れ線（[t, v] の点の列）の v(t)。区間ごとに一定の割合で変わる
  const pwl = pts => t => { for (let i = 0; i + 1 < pts.length; i++) { const [a, va] = pts[i], [b, vb] = pts[i + 1]; if (t >= a - 1e-12 && t <= b + 1e-12) return b === a ? vb : va + (vb - va) * (t - a) / (b - a); } return 0; };
  // 折れ線の下の面積を、折れ目ごと（と0を横切る所）に切ってシンプソン法で出す。abs なら道のり（大きさをたす）
  function integPts(pts, a, b, abs) {
    let s = 0;
    for (let i = 0; i + 1 < pts.length; i++) {
      const [t0, v0] = pts[i], [t1, v1] = pts[i + 1], lo = Math.max(a, t0), hi = Math.min(b, t1);
      if (hi <= lo) continue;
      const f = t => v0 + (v1 - v0) * (t - t0) / (t1 - t0), cuts = [lo];
      if (v0 * v1 < 0) { const z = t0 + (t1 - t0) * v0 / (v0 - v1); if (z > lo && z < hi) cuts.push(z); }
      cuts.push(hi);
      for (let j = 0; j + 1 < cuts.length; j++) s += simpson(abs ? (t => Math.abs(f(t))) : f, cuts[j], cuts[j + 1], 200);
    }
    return s;
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。to は fits で見ぬけない行き先（ほかの部のわざもよい）
  function dest(p, self, why, to) {
    const q = M.plain(p.q);
    const also = M.list(5).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    }).concat((to || []).filter(id => id !== self)).filter((id, i, a) => a.indexOf(id) === i).sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 図の部品
  const FS = 5;                                                     // 図の1単位の mm
  const FONT = 3.4;
  const textW = (t, sc) => [...String(t).replace(/\$/g, '').replace(/\\(?:mathrm|text)\{([^}]*)\}/g, '$1').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_ ]/g, '')].reduce((a, ch) => a + (/[　-鿿]/.test(ch) ? 1 : 0.6), 0) * FONT / sc;
  const LANCH = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.8, 0.8], nw: [-0.8, 0.8], se: [0.8, -0.8], sw: [-0.8, -0.8], c: [0, 0] };
  // ラベルの箱：アプリ（SVG）の置き方と、本（TikZ：点から 1.5pt はなして above・right…）の置き方の両方
  function labBoxes(P, t, an, sc) {
    const u = FONT / sc, v = LANCH[an || 'c'], w = textW(t, sc), sep = 1.5 * 0.3528 / sc, h = 0.8 * u;
    const cx = P[0] + v[0] * 0.75 * u, cy = P[1] + v[1] * 0.75 * u, L = v[0] > 0.3 ? cx : v[0] < -0.3 ? cx - w : cx - w / 2;
    const tx = v[0] > 0.3 ? P[0] + sep : v[0] < -0.3 ? P[0] - sep - w : P[0] - w / 2, ty = v[1] > 0.3 ? P[1] + sep : v[1] < -0.3 ? P[1] - sep - h : P[1] - h / 2;
    return [[L, cy - 0.4 * u, L + w, cy + 0.4 * u], [tx, ty, tx + w, ty + h]];
  }
  // 線分 PQ が箱 b（[x0, y0, x1, y1]、まわりを e だけ小さくした箱）を通るか
  function segBox(P, Q, b, e) {
    let t0 = 0, t1 = 1;
    const dx = Q[0] - P[0], dy = Q[1] - P[1];
    for (const [pp, qq] of [[-dx, P[0] - (b[0] + e)], [dx, (b[2] - e) - P[0]], [-dy, P[1] - (b[1] + e)], [dy, (b[3] - e) - P[1]]]) {
      if (pp === 0) { if (qq < 0) return false; continue; }
      const t = qq / pp;
      if (pp < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return t0 < t1;
  }
  // 図の字の重なり（第36回 N-6）：字の箱どうし、字の箱と線（座標軸・目もり・折れ線・ぬりのふち・だ円）・点。
  // 座標軸の名前（t・v）と O の字も入れる。重なれば、そのわけを返す（なければ ''）
  function figClash(fig) {
    const sc = fig.s || FS, u = FONT / sc, boxes = [], segs = [], pts = [];
    const addLab = (P, t, an) => { const id = boxes.length; labBoxes(P, t, an, sc).forEach(b => boxes.push(b.concat([t, id]))); };
    for (const it of fig.items) {
      const k = it[0];
      if (k === 'label' && it[2]) addLab(it[1], it[2], it[3]);
      else if (k === 'seg') segs.push([it[1], it[2]]);
      else if (k === 'poly' || k === 'path') { const ps = it[1]; for (let i = 0; i + 1 < ps.length; i++) segs.push([ps[i], ps[i + 1]]); if (k === 'poly') segs.push([ps[ps.length - 1], ps[0]]); }
      else if (k === 'ellipse') { const [, C, rx, ry, d0 = 0, d1 = 360] = it; for (let j = 0; j < 24; j++) { const a0 = (d0 + (d1 - d0) * j / 24) * Math.PI / 180, a1 = (d0 + (d1 - d0) * (j + 1) / 24) * Math.PI / 180; segs.push([[C[0] + rx * Math.cos(a0), C[1] + ry * Math.sin(a0)], [C[0] + rx * Math.cos(a1), C[1] + ry * Math.sin(a1)]]); } }
      else if (k === 'dot') pts.push(it[1]);
      else if (k === 'axes') {
        const [, x0, x1, y0, y1, a] = it, aa = a || {};
        segs.push([[x0, 0], [x1, 0]], [[0, y0], [0, y1]]);
        const wx = textW('$' + (aa.x || 'x') + '$', sc), wy = textW('$' + (aa.y || 'y') + '$', sc), id = boxes.length;
        boxes.push([x1 - wx - 0.1, -1.3 * u, x1, -0.05, aa.x || 'x', id], [0.05, y1 - 1.1 * u, 0.25 + wy, y1 + 0.05, aa.y || 'y', id + 1]);
        if (aa.o !== false) { const v = LANCH[typeof aa.o === 'string' ? aa.o : 'sw'], c = [v[0] * 0.75 * u, v[1] * 0.75 * u], w = textW('O', sc); boxes.push([c[0] - w / 2, c[1] - 0.4 * u, c[0] + w / 2, c[1] + 0.4 * u, 'O', id + 2]); }
      }
    }
    const e = 0.06, inB = (q, b) => q[0] > b[0] + e && q[0] < b[2] - e && q[1] > b[1] + e && q[1] < b[3] - e;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      for (let j = i + 1; j < boxes.length; j++) { const c = boxes[j], g = 0.15; if (c[5] === b[5]) continue; if (b[0] < c[2] + g && c[0] < b[2] + g && b[1] < c[3] + g && c[1] < b[3] + g) return `字「${b[4]}」と字「${c[4]}」`; }
      for (const [A, B] of segs) if (segBox(A, B, b, e)) return `字「${b[4]}」と線`;
      for (const q of pts) if (inB(q, b)) return `字「${b[4]}」と点`;
    }
    return '';
  }
  // 図の横はば（mm）。core.js の figBox と同じ見つもり（ラベルの字のはばも入れる）
  function figWidth(fig) {
    const sc = fig.s || FS, u = FONT / sc; let x0 = Infinity, x1 = -Infinity;
    const P = x => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); };
    for (const it of fig.items) {
      const k = it[0];
      if (k === 'seg') { P(it[1][0]); P(it[2][0]); } else if (k === 'poly' || k === 'path') it[1].forEach(p => P(p[0]));
      else if (k === 'ellipse') { P(it[1][0] - it[2]); P(it[1][0] + it[2]); } else if (k === 'dot') P(it[1][0]);
      else if (k === 'axes') { P(it[1]); P(it[2]); }
      else if (k === 'label') { const v = LANCH[it[3] || 'c'], w = textW(it[2], sc), cx = it[1][0] + v[0] * 0.75 * u, L = v[0] > 0.3 ? cx : v[0] < -0.3 ? cx - w : cx - w / 2; P(L); P(L + w); }
    }
    return (x1 - x0 + 2 * (fig.pad == null ? 0.9 : fig.pad)) * sc;
  }
  // 図を作って確かめる：字の重なりがあるか、はばが 60 mm をこえるときは null（問題を作り直す）
  function figOK(fig) { return !figClash(fig) && figWidth(fig) <= 60 ? fig : null; }
  // v-t グラフ・x-y グラフの座標軸と目もり。xt・yt は [値, ラベル, 向き]（ラベルを省くと値の数）
  function graph(o) {
    const G = M.graph({ x0: 0, x1: o.x1, y0: o.y0 || 0, y1: o.y1, w: o.w || 8, h: o.h || 5 });
    const its = G.axes({ x: o.x || 't', y: o.y || 'v' });
    if (o.o) its[0][5].o = o.o;
    for (const [t, lab, an] of o.xt || []) its.push(['seg', [t * G.sx, -0.15], [t * G.sx, 0.15]], ['label', [t * G.sx, 0], lab != null ? lab : `$${ft(t)}$`, an || 's']);
    for (const [v, lab, an] of o.yt || []) its.push(['seg', [-0.15, v * G.sy], [0.15, v * G.sy]], ['label', [0, v * G.sy], lab != null ? lab : `$${ft(v)}$`, an || 'w']);
    for (const t of o.marks || []) its.push(['seg', [t * G.sx, -0.15], [t * G.sx, 0.15]]);   // 数を書かない目もり
    return { G, its };
  }
  const dash = (G, A, B) => ['seg', G.T(...A), G.T(...B), { dash: true }];
  const line = (G, pts, st) => ['path', pts.map(p => G.T(...p)), st || { thick: true }];
  const fillPoly = (G, pts, st) => ['poly', pts.map(p => G.T(...p)), Object.assign({ fill: true, noline: true }, st || {})];

  // ================================================================ 5-31 一定の速さは長方形
  // 速さの単位：m/s か 時速（km）。時間：秒・分・時間。答えは m か km
  const OBJ31 = [['自転車', 3, 8], ['車', 8, 30], ['電車', 10, 30], ['バス', 5, 20]];   // 物と、速さ（m/s）のはんい
  const NEG = /(もど|下が|下向き|左へ|左向き|はね返|\$-[0-9])/;
  const CHANGE31 = /一定の割合|止まっていた|加速度|ブレーキ|止まっ|速くな|おそくな|v=|\\sum|\\int|あいだは|位置|駅/;
  M.add({
    id: '5-31', part: PART, chap: '5-9①', stars: 1,
    title: '一定の速さは「速さ×時間」の長方形（単位をそろえ、区間ごとにたす）',
    mark: '速さが**一定**の区間が続く（$v$-$t$ グラフの横の線）。時速と分・秒がまざる。',
    futsu: ['時速 $90\\,\\mathrm{km}$ を秒速に直す：', '$90\\times1000\\div3600=25$', '2分を秒に：$2\\times60=120$', '$25\\times120=3000\\,\\mathrm{m}$'],
    raku: ['時速 $90\\,\\mathrm{km}$ は1分で', '$90\\div60=1.5\\,\\mathrm{km}$', '2分なら $1.5\\times2=3\\,\\mathrm{km}$', '区間が2つなら長方形を2つたす'],
    why: '速さが一定なら、$v$-$t$ グラフは横の線で、その下は長方形。たて（速さ）×横（時間）が進んだ距離（5-9①）。速さの「1時間あたり」と時間の「分」のように、単位をそろえてからかける。とちゅうで速さが変わっても、速さが一定の区間ごとの長方形をたせばよい。',
    caution: '時速と秒をそのままかけない（時速 $72\\,\\mathrm{km}$ で10秒は $72\\times10=720\\,\\mathrm{m}$ ではなく、$20\\times10=200\\,\\mathrm{m}$）。止まっていた物が速くなるときなど、速さが一定でない区間は長方形にならない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },   // 右ページの最後の問題と「ふりかえり」のすき間をあけるため、ステップ2は3問（R1-25）
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) {
      if (/図の \$v\$-\$t\$ グラフ/.test(q) && /速さは区間ごとに一定/.test(q)) return true;
      return /(\\mathrm\{m\/s\}\$|時速)/.test(q) && /で[0-9.]+(秒|分|時間)(走|進|歩)/.test(q) && !NEG.test(q) && !CHANGE31.test(q);
    },
    steps: {
      // m/s と秒の2つの区間（ときどき時速と時間）
      s1(r) {
        if (r.chance(0.2)) {
          const v1 = r.pick([20, 30, 40, 50, 60, 80]), v2 = r.intNot(2, 8, v => v * 10 === v1) * 10, t1 = r.int(1, 4), t2 = r.int(1, 3), obj = r.pick(['車', 'バス']);
          const A = v1 * t1, B = v2 * t2, ans = A + B;
          return {
            q: `${obj}が${KMH(v1)} で${t1}時間、続けて${KMH(v2)} で${t2}時間走った。進んだ距離 ${BOX('km')}`,
            a: `$${ans}$`, key: '531:' + [`${v1}x${t1}`, `${v2}x${t2}`].sort().join(','),
            easy: `$${v1}\\times${t1}+${v2}\\times${t2}=${A}+${B}=${ans}$`,
            verify: p => ok(p.a, simpson(() => v1, 0, t1, 10) + simpson(() => v2, t1, t1 + t2, 10)),
          };
        }
        const [obj, vmin, vmax] = r.pick(OBJ31);
        const v1 = r.int(vmin, vmax), v2 = r.intNot(vmin, vmax, v => v === v1);
        const TT = [5, 10, 15, 20, 25, 30, 40, 50, 60];
        const t1 = r.pick(TT), t2 = r.pick(TT), A = v1 * t1, B = v2 * t2, ans = A + B;
        return {
          q: `${obj}が ${MS(v1)} で${t1}秒、続けて ${MS(v2)} で${t2}秒走った。進んだ距離 ${BOX('m')}`,
          a: `$${ans}$`, key: '531:' + [`${v1}x${t1}`, `${v2}x${t2}`].sort().join(','),
          easy: `$${v1}\\times${t1}+${v2}\\times${t2}=${A}+${B}=${ans}$`,
          verify: p => { let s = 0; for (let k = 0; k < t1 + t2; k++) s += (k + 0.5 < t1 ? v1 : v2); return ok(p.a, s); },
        };
      },
      // 単位がちがう：時速と分（km で）、時速と秒（m で）、時速の区間と m/s の区間
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const V = r.pick([30, 36, 40, 42, 45, 48, 50, 54, 60, 72, 75, 80, 90, 96, 100, 120]), t = r.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 45]);
          const ans = fq([V * t, 60]); if ((V * t) % 6 || V * t / 60 > 90) return null;
          const per = fq([V, 60]), perT = isTerm(per[1]);
          return {
            q: `${r.pick(['車', 'バス', '電車'])}が${KMH(V)} で${t}分走った。進んだ距離 ${BOX('km')}`,
            a: `$${ft(ans)}$`, key: NK('531b', V, t),
            easy: perT ? `1分で $${V}\\div60=${ft(per)}\\,\\mathrm{km}$、$${ft(per)}\\times${t}=${ft(ans)}$` : `$${V}\\times\\frac{${t}}{60}=${ft(ans)}$`, easyCheck: false,
            verify: p => ok(p.a, (V * 1000 / 3600) * (t * 60) / 1000),
          };
        }
        if (k === 1) {
          const V = r.pick([18, 36, 54, 72, 90, 108]), t = r.pick([5, 10, 15, 20, 30, 40, 60]), v = V / 3.6, ans = v * t;
          return {
            q: `${r.pick(['車', '電車'])}が${KMH(V)} で${t}秒走った。進んだ距離 ${BOX('m')}`,
            a: `$${fmt(ans)}$`, key: NK('531c', V, t),
            easy: `$${V}\\div3.6=${fmt(v)}\\,\\mathrm{m/s}$、$${fmt(v)}\\times${t}=${fmt(ans)}$`, easyCheck: false,
            verify: p => ok(p.a, V * 1000 * t / 3600),
          };
        }
        const V = r.pick([18, 36, 54, 72, 90]), v = V / 3.6, t1 = r.pick([10, 20, 30, 40]), v2 = r.intNot(5, 25, x => x === v), t2 = r.pick([10, 20, 30]);
        const A = v * t1, B = v2 * t2, ans = A + B;
        return {
          q: `車が${KMH(V)} で${t1}秒、続けて ${MS(v2)} で${t2}秒走った。進んだ距離 ${BOX('m')}`,
          a: `$${fmt(ans)}$`, key: NK('531d', V, t1, v2, t2),
          easy: `時速 $${V}\\,\\mathrm{km}$ は $${fmt(v)}\\,\\mathrm{m/s}$。$${fmt(v)}\\times${t1}+${v2}\\times${t2}=${fmt(A)}+${B}=${fmt(ans)}$`, easyCheck: false,
          verify: p => ok(p.a, V * 1000 / 3600 * t1 + v2 * t2),
        };
      },
      // 図：速さが一定の区間が2〜3つの v-t グラフ（とちゅうの時刻からのこともある）
      s3(r) {
        const n = r.int(2, 3), st = r.pick([5, 10]), segs = [];
        let t = 0;
        for (let i = 0; i < n; i++) { const d = st * r.int(1, 4), v = r.int(1, 6) * (st === 5 ? 1 : 2); segs.push([t, t + d, v]); t += d; }
        if (segs.some((s, i) => i && s[2] === segs[i - 1][2])) return null;
        const T = t, vmax = Math.max(...segs.map(s => s[2]));
        const from = r.chance(0.35) ? segs[1][0] : 0;
        let ans = 0; for (const [a, b, v] of segs) if (b > from) ans += v * (b - Math.max(a, from));
        const { G, its } = graph({ x1: T * 1.12, y1: vmax * 1.25, w: 7.6, h: 4.6, xt: segs.map(s => [s[1]]), yt: [...new Set(segs.map(s => s[2]))].map(v => [v]) });
        const items = [];
        for (const [a, b, v] of segs) if (b > from) items.push(fillPoly(G, [[Math.max(a, from), 0], [Math.max(a, from), v], [b, v], [b, 0]]));
        items.push(...its);
        for (const [a, b, v] of segs) { items.push(line(G, [[a, v], [b, v]])); if (a > 0) items.push(dash(G, [a, 0], [a, v])); items.push(dash(G, [b, 0], [b, v])); }
        for (const [a, b, v] of segs) if (a > 0) items.push(dash(G, [0, v], [a, v]));
        const fig = figOK({ s: FS, items }); if (!fig) return null;
        const pieces = segs.filter(s => s[1] > from).map(([a, b, v]) => `${v}\\times${b - Math.max(a, from)}`);
        return {
          q: `図の $v$-$t$ グラフ${UNITS}で、${from}秒から${T}秒までに進んだ距離 ${BOX('m')}（速さは区間ごとに一定）`,
          a: `$${ans}$`, fig, key: '531f:' + segs.map(s => s.join('-')).join(',') + ':' + from,
          easy: `$${pieces.join('+')}=${ans}$`,
          verify: p => ok(p.a, integPts(segs.flatMap(([a, b, v]) => [[a, v], [b, v]]), from, T)),
        };
      },
      // わな：止まっていた物が一定の割合で速くなる（長方形でなく三角形 → 5-32）、走っていて一定の割合でおそくなる（台形 → 5-33）。
      // となりの 5-32 のわなは「速くなる」台形なので、ここは「おそくなる」にして、同じ問題が続かないようにする（R1-26）
      trap(r) {
        const T = r.int(2, 8), V = r.int(3, 15) * 2;
        if (turn(r, '31t', 2) === 0) {
          const ans = T * V / 2;
          const p = { q: `止まっていた車が、${T}秒で ${MS(V)} まで一定の割合で速くなった。この${T}秒で進んだ距離 ${BOX('m')}`, a: `$${fmt(ans)}$`, key: NK('532', T, V), verify: p => ok(p.a, simpson(t => V * t / T, 0, T)) };
          return dest(p, '5-31', `速さは0から ${V} まで変わり、一定ではない。長方形 $${V}\\times${T}$ ではなく三角形で $\\frac{1}{2}\\times${T}\\times${V}=${fmt(ans)}$`);
        }
        const v2 = r.int(2, 10), v1 = v2 + r.int(2, 10), ans = (v1 + v2) * T / 2;
        const p = { q: `${MS(v1)} で走っていた車が、一定の割合でおそくなり、${T}秒後に ${MS(v2)} になった。この${T}秒で進んだ距離 ${BOX('m')}`, a: `$${fmt(ans)}$`, key: NK('533', v1, v2, T), verify: p => ok(p.a, simpson(t => v1 + (v2 - v1) * t / T, 0, T)) };
        return dest(p, '5-31', `速さが ${v1} から ${v2} まで変わり、一定ではない。台形で $\\frac{${v1}+${v2}}{2}\\times${T}=${fmt(ans)}$`);
      },
    },
  });

  // ================================================================ 5-32 止まっていた物が一定の割合で速くなる：三角形
  M.add({
    id: '5-32', part: PART, chap: '5-9④', stars: 1,
    title: '止まっていた物が一定の割合で速くなる：三角形 $\\frac{1}{2}\\times$時間$\\times$最後の速さ（加速度なら $\\frac{1}{2}at^2$）',
    mark: '「**止まっていた**」物が「**一定の割合で**」速くなる。$v$-$t$ グラフは原点からの直線。',
    futsu: ['1秒ごとの速さ 0、3、6、9、12 から', '1秒ごとの台形 1.5、4.5、7.5、10.5', 'を出して、たす：24'],
    raku: ['三角形：$\\frac{1}{2}\\times4\\times12=24\\,\\mathrm{m}$', '（平均の速さ6で4秒）', '加速度 $2\\,\\mathrm{m/s^2}$ で5秒なら', '$\\frac{1}{2}\\times2\\times5^2=25\\,\\mathrm{m}$'],
    why: '止まっていた物が一定の割合で速くなると、$v$-$t$ グラフは原点から右上がりの直線で、その下は三角形（5-9④）。底辺は時間、高さは最後の速さ。同じ三角形を2つ合わせると長方形になるので÷2。加速度 $a$ なら、$t$ 秒後の速さは $at$ で、$\\frac{1}{2}\\times t\\times at=\\frac{1}{2}at^2$。',
    caution: '÷2 をわすれない（$12\\times4=48$ は、はじめから $12\\,\\mathrm{m/s}$ で走ったときの距離）。はじめから動いていれば台形（わざ 5-33）。時速は m/s に直してから。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) {
      if (/v=/.test(q) || /おそく|ブレーキ|止まるまで/.test(q)) return false;
      return /止まっていた/.test(q) && /(一定の割合で速く|加速度 \$[0-9.]+\\,\\mathrm\{m\/s\^2\}\$ で[0-9]+秒間速く)/.test(q);
    },
    steps: {
      // 時間と最後の速さ
      s1(r) {
        const [obj, vmax] = r.pick([['自転車', 8], ['車', 30], ['電車', 25], ['バス', 20]]);
        const T = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]), V = r.int(2, vmax);
        if ((T * V) % 2 || V / T > 4) return null;   // 加速度は 4 m/s^2 まで
        const ans = T * V / 2;
        return {
          q: `止まっていた${obj}が、${T}秒で ${MS(V)} まで一定の割合で速くなった。この${T}秒で進んだ距離 ${BOX('m')}`,
          a: `$${ans}$`, key: NK('532', T, V),
          easy: `$\\frac{1}{2}\\times${T}\\times${V}=${ans}$`,
          verify: p => ok(p.a, simpson(t => V * t / T, 0, T)),
        };
      },
      // 加速度と時間（$\frac12at^2$）、時速で最後の速さ
      s2(r) {
        if (r.chance(0.65)) {
          const a = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), t = r.int(2, 10), ans = a * t * t / 2;
          if (!isTerm(fq(ans)[1]) || String(fmt(ans)).length > 5) return null;
          return {
            q: `止まっていた物体が、加速度 $${fmt(a)}\\,\\mathrm{m/s^2}$ で${t}秒間速くなった。進んだ距離 ${BOX('m')}`,
            a: `$${fmt(ans)}$`, key: NK('532a', a, t),
            easy: `$\\frac{1}{2}\\times${fmt(a)}\\times${t}^2=${fmt(ans)}$`,
            verify: p => { let x = 0, v = 0; const n = 100000, dt = t / n; for (let k = 0; k < n; k++) { x += (v + a * dt / 2) * dt; v += a * dt; } return ok(p.a, x, 1e-6); },
          };
        }
        const V = r.pick([18, 36, 54, 72, 90]), v = V / 3.6, T = r.pick([4, 5, 6, 8, 10, 20, 30]), ans = v * T / 2;
        if (!Number.isInteger(ans * 2)) return null;
        return {
          q: `止まっていた電車が、${T}秒で${KMH(V)} まで一定の割合で速くなった。この${T}秒で進んだ距離 ${BOX('m')}`,
          a: `$${fmt(ans)}$`, key: NK('532b', V, T),
          easy: `時速 $${V}\\,\\mathrm{km}$ は $${fmt(v)}\\,\\mathrm{m/s}$。$\\frac{1}{2}\\times${T}\\times${fmt(v)}=${fmt(ans)}$`,
          verify: p => ok(p.a, simpson(t => (V * 1000 / 3600) * t / T, 0, T)),
        };
      },
      // 図：原点からの直線。とちゅうの時刻までのこともある（その時刻の速さは比で出す）
      s3(r) {
        const T = r.pick([2, 3, 4, 5, 6, 8, 10]), V = r.int(2, 12) * 2;
        const part = r.chance(0.5), t1 = part ? r.int(1, T - 1) : T;
        if (part && ((V * t1) % T || t1 / T < 0.3)) return null;
        const v1 = V * t1 / T, ans = t1 * v1 / 2;
        if (!Number.isInteger(ans * 2)) return null;
        // とちゅうの時刻までのときは、その時刻の速さの目もりは書かない（比で出す）
        const xt = part ? [[t1], [T]] : [[T]], yt = [[V]];
        const { G, its } = graph({ x1: T * 1.2, y1: V * 1.25, w: 7.6, h: 4.2, xt, yt });
        const items = [fillPoly(G, [[0, 0], [t1, v1], [t1, 0]]), ...its, line(G, [[0, 0], [T, V]]), dash(G, [T, 0], [T, V]), dash(G, [0, V], [T, V])];
        if (part) items.push(dash(G, [t1, 0], [t1, v1]));
        const fig = figOK({ s: FS, items }); if (!fig) return null;
        return {
          q: `図の $v$-$t$ グラフ${UNITS}は、止まっていた物体が一定の割合で速くなるようす。0秒から${t1}秒までに進んだ距離 ${BOX('m')}`,
          a: `$${fmt(ans)}$`, fig, key: part ? '532f:' + [T, V, t1].join(',') : NK('532', T, V),
          easy: part ? `${t1}秒の速さは $${V}\\times\\frac{${t1}}{${T}}=${fmt(v1)}$。$\\frac{1}{2}\\times${t1}\\times${fmt(v1)}=${fmt(ans)}$` : `$\\frac{1}{2}\\times${T}\\times${V}=${fmt(ans)}$`, easyCheck: false,
          verify: p => ok(p.a, simpson(t => V * t / T, 0, t1)),
        };
      },
      // わな：はじめから動いている（台形 → 5-33）
      trap(r) {
        const T = r.int(2, 8), v1 = r.int(2, 10), v2 = v1 + r.int(2, 10), ans = (v1 + v2) * T / 2;
        const p = { q: `${MS(v1)} で走っていた車が、一定の割合で速くなり、${T}秒後に ${MS(v2)} になった。この${T}秒で進んだ距離 ${BOX('m')}`, a: `$${fmt(ans)}$`, key: NK('533', v1, v2, T), verify: p => ok(p.a, simpson(t => v1 + (v2 - v1) * t / T, 0, T)) };
        return dest(p, '5-32', `止まっていたのではなく、はじめから ${MS(v1)} で動いている。三角形ではなく台形：$\\frac{${v1}+${v2}}{2}\\times${T}=${fmt(ans)}$（$\\frac{1}{2}\\times${T}\\times${v2}=${fmt(T * v2 / 2)}$ ではない）`);
      },
    },
  });

  // ================================================================ 5-33 はじめから動いていれば台形
  const FITS33 = q => /で走っていた.*一定の割合で(速く|おそく)なり/.test(q) || /ブレーキ/.test(q) || /はじめから動いていて/.test(q);
  M.add({
    id: '5-33', part: PART, chap: '5-9⑤⑥', stars: 1,
    title: 'はじめから動いていれば台形：$\\frac{\\text{はじめ}+\\text{おわり}}{2}\\times$時間（ブレーキで止まるなら $\\frac{v_0}{2}\\times\\frac{v_0}{\\lvert a\\rvert}$）',
    mark: '**はじめの速さ**と**おわりの速さ**がわかっていて、そのあいだは一定の割合で変わる。ブレーキで止まる。',
    futsu: ['長方形と三角形に分ける：', '$5\\times4=20$、', '$\\frac{1}{2}\\times4\\times(15-5)=20$', '$20+20=40$'],
    raku: ['平均の速さ $\\frac{5+15}{2}=10$、$10\\times4=40$', 'ブレーキ $20\\,\\mathrm{m/s}$、$-4\\,\\mathrm{m/s^2}$：', '$20\\div4=5$ 秒で止まる', '$\\frac{20}{2}\\times5=50\\,\\mathrm{m}$'],
    why: 'はじめから動いていて一定の割合で速さが変わると、$v$-$t$ グラフの下は台形（5-9⑤⑥）。（上底＋下底）÷2×高さ は、ここでは（はじめ＋おわり）÷2＝平均の速さ に時間をかけること。ブレーキで止まるときは、おわりが0の三角形で、止まるまでの時間は 速さ÷加速度の大きさ。',
    caution: '速くなるときも、おそくなるときも同じ式（左右を入れかえた台形）。グラフが曲がっている（$v=3t^2$ など）ときは台形にならない。時速は m/s に直してから。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return FITS33(q); },
    steps: {
      // はじめとおわりの速さ（速くなる・おそくなる）
      s1(r) {
        const obj = r.pick(['自転車', '車', 'バス']), vmax = obj === '自転車' ? 12 : 30;
        const a = r.int(1, vmax - 2), b = r.intNot(1, vmax, v => Math.abs(v - a) < 2), T = r.int(2, 12);
        if (((a + b) * T) % 2) return null;
        const up = b > a, ans = (a + b) * T / 2;
        return {
          q: `${MS(a)} で走っていた${obj}が、一定の割合で${up ? '速く' : 'おそく'}なり、${T}秒後に ${MS(b)} になった。この${T}秒で進んだ距離 ${BOX('m')}`,
          a: `$${ans}$`, key: NK('533', a, b, T),
          easy: `$\\frac{${a}+${b}}{2}\\times${T}=${fmt((a + b) / 2)}\\times${T}=${ans}$`,
          verify: p => ok(p.a, simpson(t => a + (b - a) * t / T, 0, T)),
        };
      },
      // ブレーキで止まるまで（速さは m/s か時速）
      s2(r) {
        const kmh = r.chance(0.5), a = r.pick([1, 2, 2.5, 3, 4, 5, 6, 8]);
        const V = kmh ? r.pick([18, 36, 54, 72, 90, 108]) : r.int(4, 30), v = kmh ? V / 3.6 : V, ts = v / a, ans = v * ts / 2;
        if (!Number.isInteger(ts * 2) || ts > 15 || ts < 1 || !isTerm(fq(ans)[1]) || String(fmt(ans)).length > 5) return null;
        return {
          q: `${kmh ? KMH(V) : MS(V)} で走っていた車が、加速度 $-${fmt(a)}\\,\\mathrm{m/s^2}$ でブレーキをかけた。止まるまでに進む距離 ${BOX('m')}`,
          a: `$${fmt(ans)}$`, key: NK('533b', v, a),
          easy: `${kmh ? `時速 $${V}\\,\\mathrm{km}$ は $${fmt(v)}\\,\\mathrm{m/s}$。` : ''}$${fmt(v)}\\div${fmt(a)}=${fmt(ts)}$ 秒で止まる。$\\frac{${fmt(v)}}{2}\\times${fmt(ts)}=${fmt(ans)}$`, easyCheck: false,
          verify: p => { let x = 0, s = v; const dt = 1e-4; while (s > 0) { const s2 = Math.max(0, s - a * dt); x += (s + s2) / 2 * dt; s = s2; } return ok(p.a, x, 1e-4); },
        };
      },
      // 図：台形の v-t グラフ（速くなる・おそくなる）
      s3(r) {
        const T = r.pick([2, 3, 4, 5, 6, 8, 10]), a = r.int(1, 12) * 2, b = r.intNot(1, 12, v => Math.abs(2 * v - a) < 4) * 2;
        const ans = (a + b) * T / 2, vm = Math.max(a, b);
        const { G, its } = graph({ x1: T * 1.22, y1: vm * 1.25, w: 7.6, h: 4.2, xt: [[T]], yt: [[a], [b]] });
        const items = [fillPoly(G, [[0, 0], [0, a], [T, b], [T, 0]]), ...its, line(G, [[0, a], [T, b]]), dash(G, [T, 0], [T, b]), dash(G, [0, b], [T, b])];
        const fig = figOK({ s: FS, items }); if (!fig) return null;
        return {
          q: `図の $v$-$t$ グラフ${UNITS}は、はじめから動いていて、一定の割合で速さが変わるようす。0秒から${T}秒までに進んだ距離 ${BOX('m')}`,
          a: `$${fmt(ans)}$`, fig, key: NK('533', a, b, T),
          easy: `$\\frac{${a}+${b}}{2}\\times${T}=${fmt(ans)}$`,
          verify: p => ok(p.a, simpson(t => a + (b - a) * t / T, 0, T)),
        };
      },
      // わな：グラフが曲がっている $v=ct^2$（台形にならない → 5-42）
      trap(r) {
        const c = r.int(1, 4), b = r.int(1, 4), vb = c * b * b, ans = fq([c * b * b * b, 3]);
        if (!Number.isInteger(c * b * b * b / 3)) return null;
        const p = { q: `速度が $v=${c === 1 ? '' : c}t^2$（m/s）の物体は、0秒で0、${b}秒で ${MS(vb)}。0秒から${b}秒までに進む距離 ${BOX('m')}`, a: `$${ft(ans)}$`, key: `542c:true:${c}:${b}`, calc: { kind: 'defint', f: `${c}x^2`, a: 0, b } };
        return dest(p, '5-33', `$v=${c === 1 ? '' : c}t^2$ のグラフは曲がっていて、三角形にも台形にもならない（$\\frac{1}{2}\\times${b}\\times${vb}=${fmt(b * vb / 2)}$ ではない）。$${c === 1 ? '' : `${c}\\times`}\\frac{${b}^3}{3}=${ft(ans)}$`);
      },
    },
  });

  // ================================================================ 5-34 駅から駅は1つの台形
  M.add({
    id: '5-34', part: PART, chap: '5-9 例題8', stars: 1,
    title: '駅から駅（速くなる・一定・おそくなる）は1つの台形：（一定の時間＋全部の時間）÷2×最高の速さ',
    mark: '速くなる・一定の速さ・おそくなるの**3つの区間**（駅を出て、次の駅に止まる）。',
    futsu: ['三角形・長方形・三角形に分ける：', '$\\frac{1}{2}\\times20\\times15=150$、$15\\times60=900$、', '$\\frac{1}{2}\\times10\\times15=75$', '$150+900+75=1125$'],
    raku: ['上底60（一定の時間）、', '下底90（全部の時間）の台形：', '$\\frac{60+90}{2}\\times15=1125\\,\\mathrm{m}$'],
    why: '3つの区間の $v$-$t$ グラフは、つなげると1つの台形になる。上底は速さが一定の時間、下底は全部の時間、高さは最高の速さ。台形の面積の公式を1回使うだけで、三角形・長方形・三角形の3つを計算しなくてすむ（5-9 例題8）。',
    caution: '下底は「全部の時間」（速くなる時間＋一定の時間＋おそくなる時間）。とちゅうで一定の速さが2段あるときは、1つの台形にならないので、区間ごとにたす。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return (/駅/.test(q) || (/速くなり/.test(q) && /おそくなって止ま/.test(q))) && (q.match(/速くなり/g) || []).length <= 1; },
    steps: {
      // 3つの区間の時間と最高の速さ
      s1(r) {
        const t1 = 5 * r.int(2, 8), t2 = 10 * r.int(2, 12), t3 = 5 * r.int(2, 8), V = r.int(5, 25), T = t1 + t2 + t3;
        if (((t2 + T) * V) % 2) return null;
        const ans = (t2 + T) * V / 2;
        return {
          q: `電車が、${t1}秒で ${MS(V)} まで一定の割合で速くなり、そのまま${t2}秒走り、${t3}秒で一定の割合でおそくなって止まった。進んだ距離 ${BOX('m')}`,
          a: `$${ans}$`, key: NK('534', t1, t3) + '|' + NK('', t2, V),
          easy: `$\\frac{${t2}+${T}}{2}\\times${V}=${ans}$`,
          verify: p => ok(p.a, integPts([[0, 0], [t1, V], [t1 + t2, V], [T, 0]], 0, T)),
        };
      },
      // 全部の時間で書いてある／時速と分（km で）
      s2(r) {
        if (turn(r, '34b', 2) === 0) {
          const t1 = 5 * r.int(2, 8), t3 = 5 * r.int(2, 8), t2 = 10 * r.int(3, 12), V = r.int(5, 25), T = t1 + t2 + t3;
          if (((t2 + T) * V) % 2) return null;
          const ans = (t2 + T) * V / 2;
          return {
            q: `電車が駅を出てから次の駅に止まるまで${T}秒かかった。はじめの${t1}秒は一定の割合で速くなり、おわりの${t3}秒は一定の割合でおそくなり、そのあいだは ${MS(V)} で走った。駅と駅のあいだの距離 ${BOX('m')}`,
            a: `$${ans}$`, key: NK('534', t1, t3) + '|' + NK('', t2, V),
            easy: `一定の時間は $${T}-${t1}-${t3}=${t2}$。$\\frac{${t2}+${T}}{2}\\times${V}=${ans}$`, easyCheck: false,
            verify: p => ok(p.a, integPts([[0, 0], [t1, V], [t1 + t2, V], [T, 0]], 0, T)),
          };
        }
        const V = r.pick([30, 36, 40, 48, 54, 60]), t1 = r.int(1, 3), t3 = r.int(1, 3), t2 = r.int(4, 20), T = t1 + t2 + t3;
        if (((t2 + T) * V) % 12) return null;
        const ans = fq([(t2 + T) * V, 120]);
        return {
          q: `バスが、${t1}分で${KMH(V)} まで一定の割合で速くなり、そのまま${t2}分走り、${t3}分で一定の割合でおそくなって止まった。進んだ距離 ${BOX('km')}`,
          a: `$${ft(ans)}$`, key: NK('534b', t1, t3) + '|' + NK('', t2, V),
          easy: `時速 $${V}\\,\\mathrm{km}$ は1分で $${ft(fq([V, 60]))}\\,\\mathrm{km}$。$\\frac{${t2}+${T}}{2}\\times${ft(fq([V, 60]))}=${ft(ans)}$`, easyCheck: false,
          verify: p => ok(p.a, integPts([[0, 0], [t1, V / 60], [t1 + t2, V / 60], [T, 0]], 0, T)),
        };
      },
      // 図：駅から駅の v-t グラフ（目もりは時刻と最高の速さ）
      s3(r) {
        const t1 = 10 * r.int(1, 3), t2 = 10 * r.int(2, 6), t3 = 10 * r.int(2, 3), V = r.int(5, 25), T = t1 + t2 + t3;
        if (((t2 + T) * V) % 2) return null;
        const ans = (t2 + T) * V / 2;
        const { G, its } = graph({ x1: T * 1.12, y1: V * 1.3, w: 7.6, h: 3.6, xt: [[t1], [t1 + t2], [T]], yt: [[V]] });
        const pts = [[0, 0], [t1, V], [t1 + t2, V], [T, 0]];
        const items = [fillPoly(G, pts), ...its, line(G, pts), dash(G, [t1, 0], [t1, V]), dash(G, [t1 + t2, 0], [t1 + t2, V]), dash(G, [0, V], [t1, V])];
        const fig = figOK({ s: FS, items }); if (!fig) return null;
        return {
          q: `図は、電車が駅を出て次の駅に止まるまでの $v$-$t$ グラフ${UNITS}。駅と駅のあいだの距離 ${BOX('m')}`,
          a: `$${ans}$`, fig, key: NK('534', t1, t3) + '|' + NK('', t2, V),
          easy: `一定の時間 $${t1 + t2}-${t1}=${t2}$、全部の時間 ${T}。$\\frac{${t2}+${T}}{2}\\times${V}=${ans}$`, easyCheck: false,
          verify: p => ok(p.a, integPts(pts, 0, T)),
        };
      },
      // わな：一定の速さが2段（1つの台形にならない → 区間ごとに 5-32・5-31・5-33）
      trap(r) {
        const V1 = r.int(3, 8) * 2, V2 = V1 + r.int(2, 4) * 2, a = 10, b = 10 * r.int(2, 4), c = 10, d = 10 * r.int(2, 4), e = 10;
        const pts = [[0, 0], [a, V1], [a + b, V1], [a + b + c, V2], [a + b + c + d, V2], [a + b + c + d + e, 0]];
        const A1 = a * V1 / 2, A2 = V1 * b, A3 = (V1 + V2) * c / 2, A4 = V2 * d, A5 = V2 * e / 2, ans = A1 + A2 + A3 + A4 + A5;
        const p = {
          q: `電車が駅を出て、${a}秒で ${MS(V1)} まで速くなり、そのまま${b}秒走り、${c}秒で ${MS(V2)} まで速くなり、そのまま${d}秒走り、${e}秒でおそくなって止まった（速さはどれも一定の割合で変わる）。進んだ距離 ${BOX('m')}`,
          a: `$${fmt(ans)}$`, key: NK('534t', V1, V2, b, d),
          verify: p => ok(p.a, integPts(pts, 0, a + b + c + d + e)),
        };
        return dest(p, '5-34', `一定の速さが2段あり、1つの台形にならない。三角形・長方形・台形・長方形・三角形に分けてたす：$${A1}+${A2}+${fmt(A3)}+${A4}+${A5}=${fmt(ans)}$`, ['5-31', '5-32', '5-33']);
      },
    },
  });

  // ================================================================ 5-35 マイナスの面積：変位と道のり
  M.add({
    id: '5-35', part: PART, chap: '5-9⑦', stars: 1,
    title: 'マイナスの面積：変位は符号のまま、道のりは全部プラスでたす',
    mark: '速度が**マイナス**の区間がある（もどる・下がる）。「変位」と「道のり」。',
    futsu: ['数直線に、動いたようすをかく：', '0 → 12 まで進み、12 → 6 にもどる。', '最後の位置6と、動いた長さを読む。'],
    raku: ['$2\\times6=12$、$(-3)\\times2=-6$', '変位：$12+(-6)=6\\,\\mathrm{m}$', '道のり：$12+6=18\\,\\mathrm{m}$'],
    why: '速度がマイナスの区間は、$v$-$t$ グラフで横軸より下の長方形で、その面積をマイナスと考える（5-9⑦）。はじめの位置から最後の位置までの変化（変位）は、マイナスの面積もそのままたす。実際に動いた長さ（道のり）は、マイナスの面積もプラスにしてたす。',
    caution: '道のりにマイナスはない。変位がマイナスなら、はじめの位置より－の向き（左・下）にいる。もどる区間がなければ、変位と道のりは同じ。変位と道のりのどちらを聞いているかを、問題の文で確かめる。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },   // わなが2行ずつになったので、ステップ2を1問へらした（右ページのあふれ）
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return NEG.test(q) && /(変位|道のり)/.test(q) && !/v=/.test(q); },
    steps: {
      // 右向きが＋、進んでもどる
      s1(r) {
        const v1 = r.int(1, 6), t1 = r.int(2, 8), v2 = r.int(1, 6), t2 = r.int(1, 6), ask = ASK(r);
        const A = v1 * t1, B = v2 * t2, ans = ask === '変位' ? A - B : A + B;
        return {
          q: `右向きを＋とする。台車が ${MS(v1)} で${t1}秒進み、${MS(-v2)} で${t2}秒もどった。${ask} ${BOX('m')}`,
          a: `$${ans}$`, key: '535:' + [v1, t1, v2, t2].join(','),
          easy: ask === '変位' ? `$${v1}\\times${t1}+(${-v2})\\times${t2}=${A}+(${-B})=${ans}$` : `$${v1}\\times${t1}+${v2}\\times${t2}=${A}+${B}=${ans}$`,
          verify: p => ok(p.a, integPts([[0, v1], [t1, v1], [t1, -v2], [t1 + t2, -v2]], 0, t1 + t2, ask === '道のり')),
        };
      },
      // 上向きが＋：エレベーター・ボール（変位がマイナスになることもある）
      s2(r) {
        const ask = ASK(r);
        if (r.chance(0.5)) {
          const v1 = r.int(1, 4), t1 = r.int(2, 10), v2 = r.intNot(1, 5, v => v === v1), t2 = r.int(2, 10), A = v1 * t1, B = v2 * t2, ans = ask === '変位' ? A - B : A + B;
          return {
            q: `上向きを＋とする。エレベーターが ${MS(v1)} で${t1}秒上がり、${MS(-v2)} で${t2}秒下がった。${ask} ${BOX('m')}`,
            a: `$${ans}$`, key: '535:' + [v1, t1, v2, t2].join(','),
            easy: ask === '変位' ? `$${A}+(${-B})=${ans}$` : `$${A}+${B}=${ans}$`,
            verify: p => ok(p.a, integPts([[0, v1], [t1, v1], [t1, -v2], [t1 + t2, -v2]], 0, t1 + t2, ask === '道のり')),
          };
        }
        const v1 = r.int(2, 6), t1 = r.int(1, 4), v2 = r.int(1, v1), t2 = r.int(2, 6), A = v1 * t1, B = v2 * t2;   // はね返ると、速くはならない
        if (A === B) return unturn(r, 'ask', 2);
        const ans = ask === '変位' ? A - B : A + B;
        return {
          q: `ボールが ${MS(v1)} で${t1}秒ころがり、かべではね返って ${MS(-v2)} で${t2}秒ころがった。${ask} ${BOX('m')}`,
          a: `$${ans}$`, key: '535:' + [v1, t1, v2, t2].join(','),
          easy: ask === '変位' ? `$${A}+(${-B})=${ans}$` : `$${A}+${B}=${ans}$`,
          verify: p => ok(p.a, integPts([[0, v1], [t1, v1], [t1, -v2], [t1 + t2, -v2]], 0, t1 + t2, ask === '道のり')),
        };
      },
      // 見かけがちがう：向きをことばで書いた3つの区間（止まっている区間もある）
      s3(r) {
        const ask = ASK(r), up = r.chance(0.5);
        const a = r.int(1, 4), t1 = r.int(2, 6), t2 = r.int(1, 5), b = r.int(1, 4), t3 = r.int(2, 6), c = r.int(1, 3), t4 = r.int(1, 4);
        const third = r.chance(0.5);
        const segs = third ? [[a, t1], [-b, t3], [c, t4]] : [[a, t1], [0, t2], [-b, t3]];
        const disp = segs.reduce((s, [v, t]) => s + v * t, 0), dist = segs.reduce((s, [v, t]) => s + Math.abs(v) * t, 0), ans = ask === '変位' ? disp : dist;
        const W = up ? ['上向き', '下向き'] : ['右', '左'];
        const word = v => (up ? `${v > 0 ? W[0] : W[1]}に` : `${v > 0 ? W[0] : W[1]}へ`);
        const desc = segs.map(([v, t], i) => (v === 0 ? `${t}秒止まり` : `${word(v)} ${MS(Math.abs(v))} で${t}秒${i === segs.length - 1 ? '動いた' : '動き'}`)).join('、');
        const pts = []; let tt = 0; for (const [v, t] of segs) { pts.push([tt, v], [tt + t, v]); tt += t; }
        return {
          q: `${up ? '上向き' : '右向き'}を＋とする。${up ? 'エレベーターが' : '台車が'}${desc}。${ask} ${BOX('m')}`,
          a: `$${ans}$`, key: '535s:' + segs.flat().join(','),
          easy: ask === '変位' ? `$${segs.filter(s => s[0]).map(([v, t]) => `${par(v)}\\times${t}`).join('+')}=${ans}$` : `$${segs.filter(s => s[0]).map(([v, t]) => `${Math.abs(v)}\\times${t}`).join('+')}=${ans}$`,
          verify: p => ok(p.a, integPts(pts, 0, tt, ask === '道のり')),
        };
      },
      // わな：右向きを＋として変位・道のりを聞くが、速度が一定でなく、一定の割合で変わる（向きは変わらない。長方形でなく台形 → 5-33）。
      // 「同じ向きに進むだけ」の問題は 5-35 自身で解けるので、caution に回した（R1-9・N-3）
      trap(r) {
        const T = r.int(2, 8), v1 = r.int(2, 9), v2 = r.intNot(1, 9, v => Math.abs(v - v1) < 2), ask = turn(r, '35t', 2) ? '道のり' : '変位';
        if (((v1 + v2) * T) % 2) return unturn(r, '35t', 2);
        const ans = (v1 + v2) * T / 2;
        const p = { q: `速度が${T}秒で ${MS(v1)} から ${MS(v2)} に一定の割合で変わった。${ask} ${BOX('m')}`, a: `$${ans}$`, key: NK('535t', v1, v2, T), verify: p => ok(p.a, simpson(t => v1 + (v2 - v1) * t / T, 0, T)) };
        return dest(p, '5-35', `速度はずっと＋で、もどる区間はないので、変位も道のりも同じ。速度は一定ではなく一定の割合で変わるので、長方形ではなく台形：$\\frac{${v1}+${v2}}{2}\\times${T}=${ans}$`, ['5-33']);
      },
    },
  });

  // ================================================================ 5-36 横軸を横切るときは2つの三角形に分ける
  // 速度の式 v=A-Bt（A>0）か v=Bt-A。0〜T 秒で横軸を横切るか（見わけようの判定）
  function crossOf(q) {
    let m = /v=([0-9.]+)-([0-9.]+)t\$/.exec(q), A, B, s = 1;
    if (m) { A = +m[1]; B = +m[2]; } else { m = /v=([0-9.]*)t-([0-9.]+)\$/.exec(q); if (!m) return null; B = m[1] === '' ? 1 : +m[1]; A = +m[2]; s = -1; }
    const mm = /0秒から([0-9.]+)秒まで/.exec(q); if (!mm) return null;
    const T = +mm[1], t0 = A / B;
    return { A, B, s, T, t0, cross: t0 > 0 && t0 < T };
  }
  // 横軸の上と下の三角形（分数で）。v=s(A-Bt)、0〜T 秒
  function tri36(A, B, s, T) {
    const t0 = fq([A, B]), first = F.mul(F.make(A), t0), firstH = F.div(first, F.make(2));          // 0〜t0：底辺 t0、高さ A
    const rest = F.sub(F.make(T), t0), last = F.div(F.mul(F.mul(rest, rest), F.make(B)), F.make(2));  // t0〜T：底辺 T-t0、高さ B(T-t0)
    const up = s > 0 ? firstH : last, down = s > 0 ? last : firstH;
    return { t0, up, down, disp: F.sub(up, down), dist: F.add(up, down) };
  }
  M.add({
    id: '5-36', part: PART, chap: '5-9 例題10・5-11⑤', stars: 1,
    title: '横軸を横切るときは、横切る時刻で2つの三角形に分ける',
    mark: '速度の式（$v=10-10t$ など）で、とちゅうで**符号が変わる**（投げ上げ・もどる）。変位と道のり。',
    futsu: ['0.5秒ごとの台形 3.75、1.25、$-1.25$、', '$-3.75$、$-6.25$、$-8.75$ を出して、', '変位はそのまま、道のりは大きさをたす。'],
    raku: ['$10-10t=0$ で $t=1$', '上：$\\frac{1}{2}\\times1\\times10=5$', '下：$\\frac{1}{2}\\times2\\times20=20$', '変位 $5-20=-15$、道のり $5+20=25$'],
    why: '速度が0になる時刻で、$v$-$t$ グラフは横軸を横切る。その前は横軸より上の三角形（＋の面積）、あとは下の三角形（－の面積）。2つの三角形を別々に出して、変位はひき、道のりはたす（5-9⑦、5-11⑤）。',
    caution: '横切る時刻で分けずに、はじめとおわりの速度の平均×時間をすると、変位は出ても道のりは出ない。はじめの速度がマイナスの式（$v=2t-4$）は、先に下の三角形、あとに上の三角形。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) {
      if (/図の \$v\$-\$t\$ グラフ/.test(q) && /(変位|道のり)/.test(q) && /直線/.test(q)) return true;
      const c = crossOf(q); return !!(c && c.cross);
    },
    steps: {
      // v=A-Bt（投げ上げ・ブレーキからもどる）
      s1(r) {
        const ball = r.chance(0.4);
        const B = ball ? 10 : r.pick([2, 4, 5, 6, 8]), t0 = r.pick(ball ? [1, 1.5, 2, 2.5, 3] : [1, 1.5, 2, 2.5, 3, 4]), A = B * t0;
        if (!Number.isInteger(A)) return null;
        const T = r.pick(range(Math.floor(t0) + 1, Math.ceil(t0 * 2) + 2)), X = tri36(A, B, 1, T);
        if (!isTerm(X.disp[1]) || !isTerm(X.dist[1]) || (T === 2 * t0 && r.chance(0.6))) return null;   // 上と下が同じ大きさの形は少なめに
        const ask = ASK(r), ans = ask === '変位' ? X.disp : X.dist;
        const q = ball ? `ビルの屋上から、ボールを ${MS(A)} で真上に投げ上げた（上向きが＋、速度は $v=${A}-10t$）。0秒から${T}秒までの${ask} ${BOX('m')}` : `速度 $v=${A}-${B}t$（m/s）の物体の、0秒から${T}秒までの${ask} ${BOX('m')}`;
        return {
          q, a: `$${ft(ans)}$`, key: NK('536', A, B, T),
          easy: `$t=${ft(X.t0)}$ で横切る。上 $${ft(X.up)}$、下 $${ft(X.down)}$。${ask} $${ft(X.up)}${ask === '変位' ? '-' : '+'}${ft(X.down)}=${ft(ans)}$`, easyCheck: false,
          verify: p => ok(p.a, simpson(t => (ask === '道のり' ? Math.abs(A - B * t) : A - B * t), 0, X.t0[0] / X.t0[1], 400) + simpson(t => (ask === '道のり' ? Math.abs(A - B * t) : A - B * t), X.t0[0] / X.t0[1], T, 400)),
        };
      },
      // v=Bt-A（はじめはマイナス）
      s2(r) {
        const B = r.pick([1, 2, 3, 4, 5, 6]), t0 = r.pick([1, 1.5, 2, 2.5, 3]), A = B * t0;
        if (!Number.isInteger(A)) return null;
        const T = r.pick(range(Math.floor(t0) + 1, Math.ceil(t0 * 2) + 2)), X = tri36(A, B, -1, T);
        if (!isTerm(X.disp[1]) || !isTerm(X.dist[1]) || (T === 2 * t0 && r.chance(0.6))) return null;   // 上と下が同じ大きさの形は少なめに
        const ask = ASK(r), ans = ask === '変位' ? X.disp : X.dist;
        return {
          q: `速度 $v=${B === 1 ? '' : B}t-${A}$（m/s）の物体の、0秒から${T}秒までの${ask} ${BOX('m')}`,
          a: `$${ft(ans)}$`, key: NK('536b', A, B, T),
          easy: `$t=${ft(X.t0)}$ で横切る。下 $${ft(X.down)}$、上 $${ft(X.up)}$。${ask} $${ft(X.up)}${ask === '変位' ? '-' : '+'}${ft(X.down)}=${ft(ans)}$`, easyCheck: false,
          verify: p => ok(p.a, simpson(t => (ask === '道のり' ? Math.abs(B * t - A) : B * t - A), 0, A / B, 400) + simpson(t => (ask === '道のり' ? Math.abs(B * t - A) : B * t - A), A / B, T, 400)),
        };
      },
      // 見かけがちがう：図の直線（横切る時刻は目もり）か、横切る時刻が分数（$v=6t-2$）
      s3(r) {
        if (turn(r, '36f', 2) === 0) {
          const s = r.chance(0.6) ? 1 : -1, B = r.pick([2, 4, 5, 10]), t0 = r.pick([1, 1.5, 2, 3]), A = B * t0;
          const T = r.pick(range(Math.floor(t0) + 1, Math.ceil(t0 * 2) + 1));
          if (!Number.isInteger(A) || T <= t0) return unturn(r, '36f', 2);
          const X = tri36(A, B, s, T), v0 = s * A, vT = s * (A - B * T);
          if (!isTerm(X.disp[1]) || !isTerm(X.dist[1])) return unturn(r, '36f', 2);
          const lo = Math.min(v0, vT), hi = Math.max(v0, vT);
          const { G, its } = graph({ x1: T * 1.2, y0: lo * 1.25, y1: hi * 1.3, w: 7.5, h: 4.6, o: 'sw',
            xt: [[t0, null, s > 0 ? 'sw' : 'nw'], [T, null, vT < 0 ? 'n' : 's']], yt: [[v0], [vT]] });
          const upPts = s > 0 ? [[0, 0], [0, v0], [t0, 0]] : [[t0, 0], [T, vT], [T, 0]];
          const dnPts = s > 0 ? [[t0, 0], [T, vT], [T, 0]] : [[0, 0], [0, v0], [t0, 0]];
          const items = [fillPoly(G, upPts, { fill: false, hatch: true }), fillPoly(G, dnPts), ...its, line(G, [[0, v0], [T, vT]]), dash(G, [T, 0], [T, vT]), dash(G, [0, vT], [T, vT])];
          const fig = figOK({ s: FS, items }); if (!fig) return unturn(r, '36f', 2);
          const ask = ASK(r), ans = ask === '変位' ? X.disp : X.dist;
          return {
            q: `図の $v$-$t$ グラフ${UNITS}は直線。0秒から${T}秒までの${ask} ${BOX('m')}`,
            a: `$${ft(ans)}$`, fig, key: NK(s > 0 ? '536' : '536b', A, B, T),
            easy: `上の三角形 $${ft(X.up)}$、下の三角形 $${ft(X.down)}$。${ask} $${ft(X.up)}${ask === '変位' ? '-' : '+'}${ft(X.down)}=${ft(ans)}$`, easyCheck: false,
            verify: p => ok(p.a, integPts([[0, v0], [T, vT]], 0, T, ask === '道のり')),
          };
        }
        const [B, A] = r.pick([[6, 2], [3, 2], [3, 1], [4, 3], [6, 4], [6, 5], [4, 1], [9, 3], [9, 6]]), T = r.int(1, 3), X = tri36(A, B, -1, T);
        if (A / B >= T) return unturn(r, '36f', 2);
        const ask = ASK(r), ans = ask === '変位' ? X.disp : X.dist;
        return {
          q: `速度 $v=${B}t-${A}$（m/s）の物体の、0秒から${T}秒までの${ask} ${BOX('m')}`,
          a: `$${ft(ans)}$`, key: NK('536b', A, B, T), boxh: /frac/.test(ft(ans)) ? '12mm' : undefined,   // 答えが分数のときだけ高い欄
          easy: `$t=${fr(X.t0)}$ で横切る。下 $${fr(X.down)}$、上 $${fr(X.up)}$。${ask} $${fr(X.up)}${ask === '変位' ? '-' : '+'}${fr(X.down)}=${ft(ans)}$`, easyCheck: false,
          verify: p => ok(p.a, simpson(t => (ask === '道のり' ? Math.abs(B * t - A) : B * t - A), 0, A / B, 400) + simpson(t => (ask === '道のり' ? Math.abs(B * t - A) : B * t - A), A / B, T, 400)),
        };
      },
      // わな：その時間のあいだは横切らない（台形 → 5-33）
      trap(r) {
        const B = r.pick([2, 3, 4, 5]), t0 = r.int(3, 6), A = B * t0, T = r.int(1, t0 - 1), vT = A - B * T, ans = (A + vT) * T / 2;
        const p = { q: `速度 $v=${A}-${B}t$（m/s）の物体が0秒から${T}秒までに進んだ距離 ${BOX('m')}`, a: `$${fmt(ans)}$`, key: NK('536t', A, B, T), verify: p => ok(p.a, simpson(t => A - B * t, 0, T)) };
        return dest(p, '5-36', `$v=0$ になるのは ${t0}秒で、0〜${T}秒は横軸を横切らない（ずっとプラス）。台形で $\\frac{${A}+${vT}}{2}\\times${T}=${fmt(ans)}$`, ['5-33']);
      },
    },
  });

  // ================================================================ 5-37 面積をつみ上げて位置の表に
  M.add({
    id: '5-37', part: PART, chap: '5-9⑧・もっと', stars: 1,
    title: '面積をつみ上げて位置の表に（$a$-$t$ の面積は速度の変化）',
    mark: '1秒ごとの**速さの表**と「1秒ごとの位置」。加速度と時間から「速度の変化」。',
    futsu: ['速さを区間ごとに式にして、', 'それぞれの区間の距離を', '細かく分けて計算する。'],
    raku: ['1秒ごとの台形：', '$\\frac{2+4}{2}=3$、$4$、$\\frac{4+0}{2}=2$', '前の位置にたしていく：', '3、7、9（m）'],
    why: 'あいだが一定の割合で変わるなら、1秒ごとの $v$-$t$ グラフの下は台形（長方形・三角形）。その面積が1秒間に進んだ距離なので、0秒からつみ上げると位置になる（5-9⑧）。加速度のグラフ（$a$-$t$ グラフ）の面積は、同じように速度の変化（5-9 もっと知りたい）。',
    caution: 'つみ上げるのは面積で、速さそのものをたさない（$2+4+4$ ではない）。位置の表から速さを出すのは反対の計算（傾き。わざ 5-02）。',
    counts: { s1: 3, s2: 5, s3: 3, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '16mm', s3: '34mm', trap: '16mm' },
    fits(q) { return (/あいだは一定の割合で変わる/.test(q) && /位置/.test(q)) || (/加速度/.test(q) && /(続|速度の変化|最後の速度)/.test(q)); },
    steps: {
      // 1秒ごとの速さの表 → 1秒・2秒・3秒の位置
      s1(r) {
        const v = [r.int(0, 6), r.int(0, 8), r.int(0, 8), r.int(0, 8)];
        if (v.slice(1).every(x => x === v[1]) || (v[0] + v[1]) % 2 || (v[1] + v[2]) % 2 || (v[2] + v[3]) % 2) return null;
        const xs = []; let x = 0; for (let i = 0; i < 3; i++) { x += (v[i] + v[i + 1]) / 2; xs.push(x); }
        return {
          q: `速さ（m/s）が、0秒で${v[0]}、1秒で${v[1]}、2秒で${v[2]}、3秒で${v[3]}（あいだは一定の割合で変わる）。0秒の位置を0として、1秒・2秒・3秒の位置（m） □`,
          a: xs.map(t => `$${fmt(t)}$`).join('、'), key: '537:' + v.join(','),
          easy: `面積 $${[0, 1, 2].map(i => fmt((v[i] + v[i + 1]) / 2)).join('$、$')}$ をつみ上げる`, easyCheck: false,
          verify: p => okList(p.a, [1, 2, 3].map(t => integPts(v.map((s, i) => [i, s]), 0, t))),
        };
      },
      // 加速度の面積は速度の変化（はじめの速度があるときも）
      s2(r) {
        if (turn(r, '37b', 2) === 0) {
          const a = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), t = r.int(2, 8), dv = a * t;
          return {
            q: `加速度 $${fmt(a)}\\,\\mathrm{m/s^2}$ が${t}秒続いた。速度の変化 ${BOX('m/s')}`,
            a: `$${fmt(dv)}$`, key: NK('537a', a, t), easy: `$a$-$t$ グラフの長方形：$${fmt(a)}\\times${t}=${fmt(dv)}$`, easyCheck: false,
            verify: p => ok(p.a, simpson(() => a, 0, t, 10)),
          };
        }
        const v0 = r.int(0, 10), a = r.int(1, 4), t1 = r.int(2, 5), b = -r.int(1, 4), t2 = r.int(1, 5), vf = v0 + a * t1 + b * t2;
        return {
          q: `はじめ ${MS(v0)} の物体に、加速度 $${a}\\,\\mathrm{m/s^2}$ が${t1}秒、そのあと加速度 $${b}\\,\\mathrm{m/s^2}$ が${t2}秒続いた。最後の速度 ${BOX('m/s')}`,
          a: `$${vf}$`, key: NK('537b', v0, a, t1, b, t2),
          easy: `$${v0}+${a}\\times${t1}+(${b})\\times${t2}=${vf}$`,
          verify: p => ok(p.a, v0 + integPts([[0, a], [t1, a], [t1, b], [t1 + t2, b]], 0, t1 + t2)),
        };
      },
      // 見かけがちがう：2秒ごと・0.5秒ごとの表
      s3(r) {
        const dt = r.pick([2, 0.5]), v = [r.int(0, 4), r.int(0, 8), r.int(0, 8), r.int(0, 8)].map(x => x * (dt === 2 ? 1 : 2));
        if (v.slice(1).every(x => x === v[1])) return null;
        const xs = []; let x = 0; for (let i = 0; i < 3; i++) { x += (v[i] + v[i + 1]) / 2 * dt; xs.push(x); }
        if (xs.some(t => !Number.isInteger(t * 2))) return null;
        const ts = [1, 2, 3].map(i => fmt(i * dt));
        return {
          q: `速さ（m/s）が、0秒で${v[0]}、${ts[0]}秒で${v[1]}、${ts[1]}秒で${v[2]}、${ts[2]}秒で${v[3]}（あいだは一定の割合で変わる）。0秒の位置を0として、${ts[0]}秒・${ts[1]}秒・${ts[2]}秒の位置（m） □`,
          a: xs.map(t => `$${fmt(t)}$`).join('、'), key: '537s:' + dt + ':' + v.join(','),
          easy: `はば ${fmt(dt)} の台形 $${[0, 1, 2].map(i => fmt((v[i] + v[i + 1]) / 2 * dt)).join('$、$')}$ をつみ上げる`, easyCheck: false,
          verify: p => okList(p.a, [1, 2, 3].map(i => integPts(v.map((s, j) => [j * dt, s]), 0, i * dt))),
        };
      },
      // わな：位置の表から速さを聞く（つみ上げの反対。傾き → 5-02）
      trap(r) {
        const x = [0]; for (let i = 0; i < 3; i++) x.push(x[i] + r.int(1, 8));
        const [a, b] = r.pick([[0, 2], [1, 3], [0, 3]]), ans = fq([x[b] - x[a], b - a]);
        if (ans[1] > 2) return null;
        const p = { q: `位置 $x$（m）が、0秒で${x[0]}、1秒で${x[1]}、2秒で${x[2]}、3秒で${x[3]}。${a}秒から${b}秒までの平均の速さ ${BOX('m/s')}`, a: `$${ft(ans)}$`, key: '537t:' + x.join(','), verify: p => ok(p.a, (x[b] - x[a]) / (b - a)) };
        return dest(p, '5-37', `表は位置で、速さではない。面積をつみ上げるのではなく、傾き $\\frac{${x[b]}-${x[a]}}{${b}-${a}}=${ft(ans)}$`, ['5-02']);
      },
    },
  });

  // ---------------------------------------------------------------- 長方形・台形の和（分数で）
  // 多項式 P（M.P）の a〜b を n 等分した、左はし・右はしの長方形の和と、台形の和
  function sums(P, a, b, n) {
    const A = fq(a), h = F.div(F.sub(fq(b), A), F.make(n));
    let L = F.make(0), R = F.make(0);
    for (let k = 0; k < n; k++) { const x0 = F.add(A, F.mul(h, F.make(k))), x1 = F.add(x0, h); L = F.add(L, F.mul(M.P.at(P, x0), h)); R = F.add(R, F.mul(M.P.at(P, x1), h)); }
    return { h, L, R, T: F.div(F.add(L, R), F.make(2)) };
  }
  // 小数で1本ずつたし直す（verify。sums とは別の道すじ）
  function sumsF(f, a, b, n) { const h = (b - a) / n; let L = 0, R = 0; for (let k = 0; k < n; k++) { L += f(a + k * h) * h; R += f(a + (k + 1) * h) * h; } return { L, R, T: (L + R) / 2 }; }
  const cx2 = c => (c === 1 ? '' : c);                                // 係数1は書かない
  const plusList = v => (v.length <= 6 ? v.join('+') : `${v.slice(0, 3).join('+')}+\\cdots+${v[v.length - 1]}`);   // 長いたし算は 1+4+9+…+100
  const piT = x => { const [n, d] = fq(x); return d === 1 ? `${n === 1 ? '' : n}\\pi` : `\\frac{${n}}{${d}}\\pi`; };   // 12\pi、\frac{16}{3}\pi
  // 長方形・台形の図（x-y グラフ・v-t グラフ）。kind：'L'（左はし）・'R'（右はし）・'LR'（左はしをぬり、右はしを点線）・'T'（台形）
  function stairFig(f, b, n, kind, o) {
    o = o || {};
    const fb = f(b), h = b / n, xs = range(0, n - 1).map(k => k * h);
    const { G, its } = graph({ x1: b * 1.2, y1: fb * 1.22, w: o.w || 7.5, h: o.h || 4.4, x: o.x || 'x', y: o.y || 'y', xt: [[b]], yt: [[fb]], marks: xs.slice(1) });
    const items = [];
    for (const x0 of xs) {
      const x1 = x0 + h;
      if (kind === 'T') items.push(fillPoly(G, [[x0, 0], [x0, f(x0)], [x1, f(x1)], [x1, 0]], { noline: false }));
      if (kind === 'L' || kind === 'LR') { if (f(x0) > 1e-9) items.push(fillPoly(G, [[x0, 0], [x0, f(x0)], [x1, f(x0)], [x1, 0]], { noline: false })); }
      if (kind === 'R') items.push(fillPoly(G, [[x0, 0], [x0, f(x1)], [x1, f(x1)], [x1, 0]], { noline: false }));
      if (kind === 'LR') items.push(['poly', [[x0, 0], [x0, f(x1)], [x1, f(x1)], [x1, 0]].map(p => G.T(...p)), { dash: true }]);
    }
    items.push(...its, ...G.plot(f, 0, b * 1.08, { thick: true }), dash(G, [0, fb], [b, fb]));
    return figOK({ s: FS, items });
  }

  // ================================================================ 5-38 階段の和ではさむ
  // 左ページの楽な形の例（$v=3t$ の0〜2秒を0.5秒ずつ）は、問題に出さない（O-2・R1-2）
  const RAKU38 = (c, T, h) => c === 3 && T === 2 && h === 0.5;
  M.add({
    id: '5-38', part: PART, chap: '5-9③・5-10②', stars: 2,
    title: '階段の和ではさむ：右はしの和－左はしの和＝（最後の高さ－最初の高さ）×はば',
    mark: '右上がりのグラフを、はばの同じ**長方形の階段**で近似する。片方の和がわかっていて、もう片方を出す。',
    futsu: ['おわりの速さ 1.5、3、4.5、6 を', '1つずつ0.5倍してたす：', '$(1.5+3+4.5+6)\\times0.5=7.5$'],
    raku: ['ちがうのは、いちばん右の1本と', 'いちばん左の1本だけ：', '$4.5+(6-0)\\times0.5=7.5$'],
    why: 'おわりの速さ（右はし）の階段は、はじめの速さ（左はし）の階段を1本ずつ左へずらし、いちばん右に1本足して、いちばん左の1本をのぞいたもの（5-10②）。だから2つの和の差は（最後の高さ－最初の高さ）×はば。ほんとうの値は、2つの和のあいだにある（5-9③）。',
    caution: '右下がりのグラフでは、おわり（右はし）の和のほうが小さい。差の式の「×はば」をわすれない。台形で近似した値は、2つの和の平均（わざ 5-44）。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /(はじめの速さを使った和|おわりの速さを使った和|長方形で近似した和|ぬった長方形の和|点線の長方形の和)は/.test(q) || /和の差/.test(q); },
    steps: {
      // v=ct の階段：はじめの速さの和から、おわりの速さの和（逆も）
      s1(r) {
        const c = r.int(1, 6), T = r.int(1, 4), h = r.pick([0.5, 1]), n = T / h;
        if (n < 2 || n > 8 || RAKU38(c, T, h)) return null;
        const S = sums(M.P.make(0, c), 0, T, n), fwd = r.chance(0.6), cT = c * T;
        const given = fwd ? S.L : S.R, ans = fwd ? S.R : S.L;
        return {
          q: `速さ $v=${cx2(c)}t$（m/s）の0秒から${T}秒までを${h}秒ずつに分ける。${fwd ? 'はじめ' : 'おわり'}の速さを使った和は $${ft(given)}\\,\\mathrm{m}$。${fwd ? 'おわり' : 'はじめ'}の速さを使った和 ${BOX('m')}`,
          a: `$${ft(ans)}$`, key: NK('538', c, T, h),
          easy: `$${ft(given)}${fwd ? '+' : '-'}(${cT}-0)\\times${h}=${ft(ans)}$`,
          verify: p => { const s = sumsF(t => c * t, 0, T, n); return ok(p.a, fwd ? s.R : s.L); },
        };
      },
      // y=cx^2 の左はし・右はしの長方形（逆も）、2つの和の差
      s2(r) {
        const c = r.pick([1, 1, 2, 3]), a = r.pick([0, 0, 1]), b = a + r.int(1, 3), h = r.pick([0.5, 1]), n = (b - a) / h;
        if (n < 2 || n > 6) return null;
        const P = M.P.make(0, 0, c), S = sums(P, a, b, n), fa = c * a * a, fb = c * b * b, k = turn(r, '38b', 3);
        const head = `$y=${cx2(c)}x^2$ の${a}から${b}までを、はば${h}の`;
        if (k === 2) {
          const ans = F.sub(S.R, S.L);
          return {
            q: `${head}長方形で近似する。右はしの長方形の和と左はしの長方形の和の差 □`,
            a: `$${ft(ans)}$`, key: NK('538b', c, a, b, h),
            easy: `$(${fb}-${fa})\\times${h}=${ft(ans)}$`,
            verify: p => { const s = sumsF(x => c * x * x, a, b, n); return ok(p.a, s.R - s.L); },
          };
        }
        const fwd = k === 0, given = fwd ? S.L : S.R, ans = fwd ? S.R : S.L;
        return {
          q: `${head}${fwd ? '左' : '右'}はしの長方形で近似した和は $${ft(given)}$。${fwd ? '右' : '左'}はしの長方形で近似した和 □`,
          a: `$${ft(ans)}$`, key: NK('538b', c, a, b, h),
          easy: `$${ft(given)}${fwd ? '+' : '-'}(${fb}-${fa})\\times${h}=${ft(ans)}$`,
          verify: p => { const s = sumsF(x => c * x * x, a, b, n); return ok(p.a, fwd ? s.R : s.L); },
        };
      },
      // 図：v=ct の階段（ぬった長方形がはじめの速さ、点線の長方形がおわりの速さ）
      s3(r) {
        const c = r.int(1, 5), T = r.int(2, 4), h = r.pick([0.5, 1]), n = T / h;
        if (n < 3 || n > 6 || RAKU38(c, T, h)) return null;
        const S = sums(M.P.make(0, c), 0, T, n), fwd = r.chance(0.6), given = fwd ? S.L : S.R, ans = fwd ? S.R : S.L;
        const fig = stairFig(t => c * t, T, n, 'LR', { x: 't', y: 'v' }); if (!fig) return null;
        return {
          q: `図は、速さ $v=${cx2(c)}t$（m/s）の0秒から${T}秒までを${h}秒ずつに分けた階段。${fwd ? 'ぬった長方形の和は' : '点線の長方形の和は'} $${ft(given)}\\,\\mathrm{m}$。${fwd ? '点線の長方形' : 'ぬった長方形'}の和 ${BOX('m')}`,
          a: `$${ft(ans)}$`, fig, key: NK('538', c, T, h),
          easy: `ぬった長方形は左はし（はじめの速さ）、点線は右はし（おわりの速さ）。$${ft(given)}${fwd ? '+' : '-'}(${c * T}-0)\\times${h}=${ft(ans)}$`,
          verify: p => { const s = sumsF(t => c * t, 0, T, n); return ok(p.a, fwd ? s.R : s.L); },
        };
      },
      // わな：台形で近似（2つの和の平均 → 5-44）
      trap(r) {
        const b = r.int(1, 3), h = r.pick([0.5, 1]), n = b / h;
        if (n < 2) return null;
        const S = sums(M.P.make(0, 0, 1), 0, b, n);
        const p = { q: `$y=x^2$ の0から${b}までを、はば${h}の台形${n}つで近似した値 □`, a: `$${ft(S.T)}$`, key: '544:' + [1, 0, b, h].join(':'), verify: p => ok(p.a, sumsF(x => x * x, 0, b, n).T) };
        return dest(p, '5-38', `長方形ではなく台形。左はし ${ft(S.L)} と右はし ${ft(S.R)} の平均で $${ft(S.T)}$`);
      },
    },
  });

  // ================================================================ 5-39 Σ は分けて、定数は外へ
  const SUMT = (lo, hi, body) => `$\\displaystyle\\sum_{k=${lo}}^{${hi}}${body}$`;
  const S1 = n => n * (n + 1) / 2, S2 = n => n * (n + 1) * (2 * n + 1) / 6;
  const sumDirect = (body, lo, hi) => { let s = 0; for (let k = lo; k <= hi; k++) s += M.evalMath(body, { k }); return s; };
  const pb = P => { const t = M.P.tex(P, 'k'); return /[+-]/.test(t.slice(1)) ? `(${t})` : t; };   // 項が2つ以上ならかっこ
  M.add({
    id: '5-39', part: PART, chap: '5-10③④', stars: 1,
    title: '$\\Sigma$ は分けて、定数は外へ（$\\sum k=\\frac{n(n+1)}{2}$、$\\sum k^2=\\frac{n(n+1)(2n+1)}{6}$）',
    mark: '$\\displaystyle\\sum_{k=1}^{n}$ の中が $k$ の式（$2k^2-1$、$3k+2$ など）。',
    futsu: ['$k=1,\\ 2,\\ 3,\\ 4$ を1つずつ入れる：', '$1+7+17+31=56$'],
    raku: ['分けて、定数は外へ：', '$2\\sum k^2-\\sum 1$', '$=2\\times30-4=56$'],
    why: 'たし算は順番を変えてよいので、$\\Sigma$ の中の和は分けてよく、どの項にもかかる数は外に出せる（分配法則）。$\\sum k$ と $\\sum k^2$ は式で出せる（5-10③④）。1を $n$ 回たすと $n$。',
    caution: '定数の $\\Sigma$ は「定数×$n$」（$\\sum_{k=1}^{4}1=4$。1 ではない）。$k=0$ から始まるときは、$k=0$ の項に気をつける。$\\sum k^3$ の式は教科書にないので、1つずつたす。',
    counts: { s1: 10, s2: 8, s3: 6, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: '16mm',
    fits(q) { return /\\sum_\{k=[01]\}\^\{\d+\}/.test(q) && !/k\^\{?[3-9]/.test(q) && !/\\frac|\\lim|n/.test(q.replace(/\\int|\\displaystyle/g, '')); },
    steps: {
      // Σ(ak+b)
      s1(r) {
        const n = r.int(3, 10), a = r.int(1, 5), b = r.int(-3, 5);
        const P = M.P.make(b, a), body = pb(P), ans = a * S1(n) + b * n;
        return {
          q: SUMT(1, n, body), a: `$${ans}$`, key: '539:' + body + n,
          easy: `$${a === 1 ? '' : `${a}\\times`}\\frac{${n}\\times${n + 1}}{2}${b ? `${b > 0 ? '+' : '-'}${Math.abs(b)}\\times${n}` : ''}=${ans}$`,
          verify: p => ok(p.a, sumDirect(M.P.tex(P, 'k'), 1, n)),
        };
      },
      // Σ(ak^2+bk+c)
      s2(r) {
        const n = r.int(3, 7), a = r.int(1, 3), b = r.int(-3, 3), c = r.int(-3, 3);
        const P = M.P.make(c, b, a), body = pb(P), ans = a * S2(n) + b * S1(n) + c * n;
        const parts = [`${a === 1 ? '' : `${a}\\times`}\\frac{${n}\\times${n + 1}\\times${2 * n + 1}}{6}`];
        if (b) parts.push(`${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : `${Math.abs(b)}\\times`}\\frac{${n}\\times${n + 1}}{2}`);
        if (c) parts.push(`${c > 0 ? '+' : '-'}${Math.abs(c)}\\times${n}`);
        return {
          q: SUMT(1, n, body), a: `$${ans}$`, key: '539:' + body + n,
          easy: `$${parts.join('')}=${ans}$`,
          verify: p => ok(p.a, sumDirect(M.P.tex(P, 'k'), 1, n)),
        };
      },
      // 見かけがちがう：かけ算・2乗のかっこ（展開してから）、k=0 から、定数だけ
      s3(r) {
        const k = turn(r, '39c', 4), n = r.int(3, 8);
        if (k === 0) {
          const c = r.int(1, 3), P = M.P.mul(M.P.make(0, 1), M.P.make(c, 1)), ans = S2(n) + c * S1(n);
          return { q: SUMT(1, n, `k(k+${c})`), a: `$${ans}$`, key: `539s:kk${c}:${n}`, easy: `$k(k+${c})=k^2+${cx2(c)}k$ にして $${S2(n)}+${c === 1 ? '' : `${c}\\times`}${S1(n)}=${ans}$`, easyCheck: false, verify: p => ok(p.a, sumDirect(M.P.tex(P, 'k'), 1, n)) };
        }
        if (k === 1) {
          const c = r.int(1, 3), P = M.P.pow(M.P.make(c, 1), 2), ans = S2(n) + 2 * c * S1(n) + c * c * n;
          return { q: SUMT(1, n, `(k+${c})^2`), a: `$${ans}$`, key: `539s:sq${c}:${n}`, easy: `$(k+${c})^2=${M.P.tex(P, 'k')}$ にして $${S2(n)}+${2 * c}\\times${S1(n)}+${c * c}\\times${n}=${ans}$`, easyCheck: false, verify: p => ok(p.a, sumDirect(M.P.tex(P, 'k'), 1, n)) };
        }
        if (k === 2) {
          const a = r.int(1, 4), b = r.int(1, 5), P = M.P.make(b, a), ans = a * S1(n - 1) + b * n;
          return { q: SUMT(0, n - 1, pb(P)), a: `$${ans}$`, key: `539s:0:${pb(P)}:${n}`, easy: `$k=0$ から $${n - 1}$ までの${n}こ。$${a === 1 ? '' : `${a}\\times`}\\frac{${n - 1}\\times${n}}{2}+${b}\\times${n}=${ans}$`, easyCheck: false, verify: p => ok(p.a, sumDirect(M.P.tex(P, 'k'), 0, n - 1)) };
        }
        const c = r.int(2, 9);
        return { q: SUMT(1, n, `${c}`), a: `$${c * n}$`, key: `539s:c${c}:${n}`, easy: `$${c}$ を${n}回たす：$${c}\\times${n}=${c * n}$`, easyCheck: false, verify: p => ok(p.a, sumDirect(String(c), 1, n)) };
      },
      // わな：3乗の和（式は教科書にない → 1つずつたす）
      trap(r) {
        const n = r.int(2, 5), c = r.pick([1, 1, 2]), ans = c * (S1(n) ** 2);
        const body = `${cx2(c)}k^3`;
        const p = { q: SUMT(1, n, body), a: `$${ans}$`, key: `539t:${body}:${n}`, verify: p => ok(p.a, sumDirect(body, 1, n)) };
        return dest(p, '5-39', `$k^3$ の和の式は教科書にない。1つずつたす：$${range(1, n).map(k => `${c === 1 ? '' : `${c}\\times`}${k ** 3}`).join('+')}=${ans}$`);
      },
    },
  });

  // ================================================================ 5-40 長方形の和は、はばを外へ
  const RAKU40 = 5;   // 楽な形の例（$y=x^2$ の0から1を5本。右はし・左はし）は、問題に出さない（O-2・R1-2）
  M.add({
    id: '5-40', part: PART, chap: '5-10③ 例題2', stars: 1,
    title: '長方形の和は、はばを外へ：$\\sum\\left(\\frac{k}{n}\\right)^2\\frac{1}{n}=\\frac{1}{n^3}\\sum k^2$',
    mark: '$y=x^2$ の0から1を、**右はし（左はし）の長方形 $n$ 本**で近似した和。',
    futsu: ['1本ずつ 高さ×はば を計算する：', '$\\frac{1}{25}\\times\\frac{1}{5}+\\frac{4}{25}\\times\\frac{1}{5}+\\cdots$', '5つの分数を通分してたす。'],
    raku: ['分母は $5^2\\times5=125$ でそろう：', '$\\frac{1+4+9+16+25}{125}=\\frac{55}{125}=0.44$', '左はしは $k=0$ から4：$\\frac{30}{125}=0.24$'],
    why: '$k$ 本めの面積は $\\left(\\frac{k}{n}\\right)^2\\times\\frac{1}{n}=\\frac{k^2}{n^3}$ で、どの長方形も分母が $n^3$（5-10④）。分子の $k^2$ だけをたして、最後に $n^3$ でわる。左はしの長方形は、番号が1つずれて $k=0$ から $n-1$。',
    caution: '高さは $k^2$ ではなく $\\left(\\frac{k}{n}\\right)^2$（場所 $\\frac{k}{n}$ を $x^2$ に入れる）。0から2なら、はばは $\\frac{2}{n}$、右はしは $\\frac{2k}{n}$ で、どれも $2^3$ 倍。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 1 },   // 右ページの最後の問題と「ふりかえり」のすき間をあけるため、ステップ2は4問（R1-25）
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    boxh: '12mm',
    fits(q) { return (/長方形[0-9]+本で近似した和/.test(q) && !/和は/.test(q)) || /等分して、長方形をならべた/.test(q); },
    steps: {
      // 右はしの長方形 n 本（0から1）
      s1(r) {
        const n = r.intNot(2, 10, v => v === RAKU40), S = sums(M.P.make(0, 0, 1), 0, 1, n), num = S2(n), den = n ** 3, d = ft(S.R);
        return {
          q: `$y=x^2$ の0から1までを、右はしの長方形${n}本で近似した和 □`,
          a: `$${fr(S.R)}$`, key: NK('540', n),
          easy: `$\\frac{${plusList(range(1, n).map(k => k * k))}}{${den}}=\\frac{${num}}{${den}}${fr(S.R) === `\\frac{${num}}{${den}}` ? '' : `=${fr(S.R)}`}${d !== fr(S.R) ? `=${d}` : ''}$`,
          verify: p => ok(p.a, sumsF(x => x * x, 0, 1, n).R),
        };
      },
      // 左はしの長方形、0から b まで、y=x
      s2(r) {
        const k = turn(r, '40b', 3);
        if (k === 0) {
          const n = r.intNot(2, 10, v => v === RAKU40), S = sums(M.P.make(0, 0, 1), 0, 1, n), num = S2(n - 1), den = n ** 3;
          return {
            q: `$y=x^2$ の0から1までを、左はしの長方形${n}本で近似した和 □`,
            a: `$${fr(S.L)}$`, key: NK('540L', n),
            easy: `$k=0$ から${n - 1}まで：$\\frac{${plusList(range(0, n - 1).map(k => k * k))}}{${den}}=${fr(S.L)}$`, easyCheck: false,
            verify: p => ok(p.a, sumsF(x => x * x, 0, 1, n).L),
          };
        }
        if (k === 1) {
          const b = r.int(2, 3), n = r.int(2, 5), S = sums(M.P.make(0, 0, 1), 0, b, n);
          if (b % n === 0) return null;
          return {
            q: `$y=x^2$ の0から${b}までを、右はしの長方形${n}本で近似した和 □`,
            a: `$${fr(S.R)}$`, key: '540b:' + b + ':' + n,
            easy: `はば $\\frac{${b}}{${n}}$、高さ $\\left(\\frac{${b}k}{${n}}\\right)^2$。$\\frac{${b}^3}{${n}^3}\\times(${plusList(range(1, n).map(k => k * k))})=${fr(S.R)}$`, easyCheck: false,
            verify: p => ok(p.a, sumsF(x => x * x, 0, b, n).R),
          };
        }
        const b = r.int(1, 4), n = r.int(3, 6), S = sums(M.P.make(0, 1), 0, b, n);
        if (b % n === 0) return null;
        return {
          q: `$y=x$ の0から${b}までを、右はしの長方形${n}本で近似した和 □`,
          a: `$${fr(S.R)}$`, key: '540x:' + b + ':' + n,
          easy: `はば $\\frac{${b}}{${n}}$、高さ $\\frac{${cx2(b)}k}{${n}}$。$\\frac{${b * b}}{${n * n}}\\times(${range(1, n).join('+')})=${fr(S.R)}$`, easyCheck: false,
          verify: p => ok(p.a, sumsF(x => x, 0, b, n).R),
        };
      },
      // 図：長方形の図から、右はしか左はしかを読む
      s3(r) {
        const b = r.pick([1, 1, 2]), n = r.int(3, 6), kind = ['R', 'L'][turn(r, '40f', 2)], S = sums(M.P.make(0, 0, 1), 0, b, n), ans = kind === 'R' ? S.R : S.L;
        if (b % n === 0 || (b === 1 && n === RAKU40)) return null;
        const fig = stairFig(x => x * x, b, n, kind); if (!fig) return null;
        const ks = kind === 'R' ? range(1, n) : range(0, n - 1), den = b === 1 ? `${n ** 3}` : null;
        return {
          q: `図は、$y=x^2$ の0から${b}までを${n}等分して、長方形をならべたもの。長方形の面積の和 □`,
          a: `$${fr(ans)}$`, fig, key: b === 1 ? NK(kind === 'R' ? '540' : '540L', n) : (kind === 'R' ? '540b:' : '540bL:') + b + ':' + n,
          easy: `${kind === 'R' ? '右' : '左'}はしの長方形${n}本。$${den ? `\\frac{${plusList(ks.map(k => k * k))}}{${den}}` : `\\frac{${b}^3}{${n}^3}\\times(${plusList(ks.map(k => k * k))})`}=${fr(ans)}$`, easyCheck: false,
          verify: p => { const s = sumsF(x => x * x, 0, b, n); return ok(p.a, kind === 'R' ? s.R : s.L); },
        };
      },
      // わな：ほんとうの面積（定積分 → 5-42）
      trap(r) {
        const b = r.int(1, 3), ans = fq([b ** 3, 3]);
        const p = { q: `$y=x^2$ の0から${b}までの下の、ほんとうの面積 □`, a: `$${fr(ans)}$`, key: `542:true:${b}`, calc: { kind: 'defint', f: 'x^2', a: 0, b } };
        return dest(p, '5-40', `長方形の和ではなく、かぎりなく細くした先の面積（定積分）。$\\frac{${b}^3}{3}=${fr(ans)}$`);
      },
    },
  });

  // ================================================================ 5-41 n→∞ は最高次の係数をくらべる
  const LIM = e => `$\\displaystyle\\lim_{n\\to\\infty}${e}$`;
  // \lim の中の式を n の大きな値で計算する（見わけようの判定と verify）
  function limExpr(q) {
    const m = /\\lim_\{n\\to\\infty\}([^$]*)\$/.exec(q); if (!m) return null;
    let e = m[1].trim();
    if (/^S_n/.test(e)) { const s = /S_n=([^$]*)\$/.exec(q); if (!s) return null; e = s[1]; }
    return e.replace(/\\displaystyle/g, '');
  }
  const limAt = (e, n) => M.evalMath(e, { n });
  // (pn+q) の TeX
  const lin = (p, q) => (q === 0 ? `${cx2(p)}n` : `(${cx2(p)}n${q > 0 ? '+' : '-'}${Math.abs(q)})`);
  // 係数の比：\frac{6}{6}=1、\frac{4}{3}（約分できないときは1回だけ書く）
  const ratio = (a, b) => { if (b === 1) return `${a}`; const t = `\\frac{${a}}{${b}}`, u = fr([a, b]); return t === u ? t : `${t}=${u}`; };
  M.add({
    id: '5-41', part: PART, chap: '5-10④', stars: 1,
    title: '$n\\to\\infty$ は、分子と分母の最高次の係数をくらべる',
    mark: '$\\displaystyle\\lim_{n\\to\\infty}$ の中が $n$ の分数で、分子と分母の次数が同じ。',
    futsu: ['分子を展開して $2n^3+3n^2+n$。', '分母 $6n^3$ の $n^3$ で1つずつわって', '$\\frac{1}{6}\\left(2+\\frac{3}{n}+\\frac{1}{n^2}\\right)\\to\\frac{1}{3}$'],
    raku: ['分子の最高次は $n\\times n\\times2n=2n^3$', '分母は $6n^3$', '$\\frac{2}{6}=\\frac{1}{3}$'],
    why: '$n$ がとても大きいと、$n+1$ や $2n+1$ の「$+1$」は $n$ にくらべて小さく、効かなくなる（$\\frac{1}{n}\\to0$、5-10④）。分子と分母の次数が同じなら、最高次の係数の比が近づく先。$\\left(1+\\frac{1}{n}\\right)$ の形なら、$\\frac{1}{n}$ を0にする。',
    caution: '分母の次数のほうが高いと0に近づく（$\\frac{n^2+1}{n^3}\\to0$）。係数をくらべるのは、次数が同じときだけ。展開した式では、いちばん次数の高い項だけを見る（前に書いてあるとはかぎらない）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 1 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: '16mm',
    boxh: '12mm',
    fits(q) { const e = limExpr(q); if (!e) return false; const a = limAt(e, 1e5), b = limAt(e, 1e6); return a != null && b != null && Math.abs(b) > 1e-3 && close(a, b, 1e-3); },
    steps: {
      // かっこのかけ算 ÷ c n^d
      s1(r) {
        const d = r.pick([2, 3, 3]), fs = [];
        for (let i = 0; i < d; i++) fs.push([r.int(1, 3), i === 0 && (d === 3 || r.chance(0.5)) ? 0 : r.intNot(-3, 3, v => v === 0)]);
        const c = r.pick([1, 2, 3, 4, 6]), num = fs.reduce((s, f) => s * f[0], 1), ans = fq([num, c]);
        const e = `\\frac{${fs.map(([p, q]) => lin(p, q)).join('')}}{${cx2(c)}n^${d}}`;
        return {
          q: LIM(e), a: `$${fr(ans)}$`, key: `541:${e}`,
          easy: `分子の最高次 $${fs.map(f => `${cx2(f[0])}n`).join('\\times ')}=${cx2(num)}n^${d}$。$${ratio(num, c)}$`, easyCheck: false,
          verify: p => ok(p.a, limAt(e, 1e7), 1e-5),
        };
      },
      // (1+b/n)(c+d/n) の形、展開した分数
      s2(r) {
        if (turn(r, '41b', 2) === 0) {
          const a = r.pick([[1, 6], [1, 2], [1, 3], [2, 1], [3, 1], [1, 1], [1, 4]]), b = r.int(1, 3), c = r.int(1, 3), d = r.int(1, 3);
          const e = `${a[1] === 1 ? (a[0] === 1 ? '' : a[0]) : `\\frac{${a[0]}}{${a[1]}}`}\\left(1+\\frac{${b}}{n}\\right)\\left(${c}+\\frac{${d}}{n}\\right)`, ans = fq([a[0] * c, a[1]]);
          return { q: LIM(e), a: `$${fr(ans)}$`, key: `541b:${e}`, easy: `$\\frac{1}{n}\\to0$ で $${a[1] === 1 ? a[0] : `\\frac{${a[0]}}{${a[1]}}`}\\times1\\times${c}=${fr(ans)}$`, easyCheck: false, verify: p => ok(p.a, limAt(e, 1e7), 1e-5) };
        }
        const A = r.int(1, 6), B = r.intNot(-5, 5, v => v === 0), C = r.int(1, 6), D = r.intNot(-5, 5, v => v === 0), ans = fq([A, C]);
        const e = `\\frac{${cx2(A)}n^2${B > 0 ? '+' : '-'}${Math.abs(B) === 1 ? '' : Math.abs(B)}n}{${cx2(C)}n^2${D > 0 ? '+' : '-'}${Math.abs(D)}}`;
        return { q: LIM(e), a: `$${fr(ans)}$`, key: `541c:${e}`, easy: `$n^2$ の係数をくらべて $${ratio(A, C)}$`, easyCheck: false, verify: p => ok(p.a, limAt(e, 1e7), 1e-5) };
      },
      // 見かけがちがう：長方形の和 S_n の式、2乗のかっこ、最高次の項がうしろにある式
      s3(r) {
        const k = turn(r, '41c', 3);
        if (k === 0) {
          const [lab, e, ans] = r.pick([
            ['右はし', '\\frac{(n+1)(2n+1)}{6n^2}', [1, 3]], ['左はし', '\\frac{(n-1)(2n-1)}{6n^2}', [1, 3]],
            ['右はし', '\\frac{2(n+1)}{n}', [2, 1]], ['右はし', '\\frac{9(n+1)}{2n}', [9, 2]], ['右はし', '\\frac{4(n+1)(2n+1)}{3n^2}', [8, 3]], ['左はし', '\\frac{8(n-1)}{n}', [8, 1]]]);
          return { q: `${lab}の長方形 $n$ 本の和が $S_n=${e}$ のとき、${LIM('S_n')}`, a: `$${fr(ans)}$`, key: `541s:${e}`, easy: `分子と分母の最高次の係数をくらべて $${fr(ans)}$`, easyCheck: false, verify: p => ok(p.a, limAt(e, 1e7), 1e-5) };
        }
        if (k === 1) {
          const p1 = r.int(2, 3), q1 = r.intNot(-3, 3, v => v === 0), c = r.pick([1, 2, 3]), ans = fq([p1 * p1, c]);
          const e = `\\frac{(${p1}n${q1 > 0 ? '+' : '-'}${Math.abs(q1)})^2}{${cx2(c)}n^2}`;
          return { q: LIM(e), a: `$${fr(ans)}$`, key: `541q:${e}`, easy: `分子の最高次は $(${p1}n)^2=${p1 * p1}n^2$。$${ratio(p1 * p1, c)}$`, easyCheck: false, verify: p => ok(p.a, limAt(e, 1e7), 1e-5) };
        }
        const A = r.int(1, 5), B = r.int(1, 9), C = r.int(1, 5), D = r.int(1, 9), ans = fq([A, C]);
        const e = `\\frac{${B}+${cx2(A)}n^2}{${D}n+${cx2(C)}n^2}`;
        return { q: LIM(e), a: `$${fr(ans)}$`, key: `541r:${e}`, easy: `いちばん次数の高い $n^2$ の係数は、分子 ${A}、分母 ${C}。$${ratio(A, C)}$`, easyCheck: false, verify: p => ok(p.a, limAt(e, 1e7), 1e-5) };
      },
      // わな：分母の次数が高い（0に近づく）
      trap(r) {
        const A = r.int(1, 5), B = r.int(1, 9), C = r.int(1, 4);
        const e = `\\frac{${cx2(A)}n^2+${B}}{${cx2(C)}n^3}`;
        const p = { q: LIM(e), a: '$0$', key: `541t:${e}`, verify: p => (Math.abs(limAt(e, 1e9)) < 1e-6 && Math.abs(limAt(e, 1e12)) < 1e-9 && ev(p.a) === 0) || 'まちがい' };
        return dest(p, '5-41', `分子は2次、分母は3次で、次数が同じではない。係数の比 $\\frac{${A}}{${C}}$ にはならない。分母のほうが速く大きくなるので、0に近づく`);
      },
    },
  });

  // ================================================================ 5-42 0から b までの定積分
  const INT = (a, b, body, v) => `$\\displaystyle\\int_{${a}}^{${b}}${body}\\,\\dd ${v || 'x'}$`;
  // 文の中の定積分：[全体, 下端, 上端, 中身, 変数]。はしは \frac{1}{2} のような分数でもよい
  const INTS = q => [...q.matchAll(/\\int_\{((?:[^{}]|\{[^{}]*\})*)\}\^\{((?:[^{}]|\{[^{}]*\})*)\}([^$]*?)\\,\\dd ([a-z])/g)];
  const powOK = body => !/\^\{?[3-9]/.test(body);
  // 下端・上端の分数は、上つきの小さい字にせず、ふつうの大きさの分数で（R1-17）。アプリは \textstyle を読みとばす
  const LIMF = (p, q) => `\\textstyle\\frac{${p}}{${q}}`;
  // 楽な形の例（$\int_0^3x^2\,\dd x=9$、$v=3t^2$ の0〜2秒）は、問題に出さない（O-2・R1-2）。c は $x^2$ の係数
  const RAKU42 = (c, b) => (c === 1 && b === 3) || (c === 3 && b === 2);
  M.add({
    id: '5-42', part: PART, chap: '5-10⑥', stars: 1,
    title: '$\\int_0^bx^2\\,\\dd x=\\frac{b^3}{3}$、$\\int_0^bx\\,\\dd x=\\frac{b^2}{2}$（$b$ を3乗・2乗）',
    mark: '0から $b$ までの $x^2$・$x$ の面積（定積分）。$v=ct^2$ の0秒から□秒の距離。',
    futsu: ['右はしの長方形 $n$ 本の和を', '$\\Sigma$ で書いて、$n\\to\\infty$ にする', '（わざ 5-40・5-41）。'],
    raku: ['$\\int_0^3x^2\\,\\dd x=\\frac{3^3}{3}=9$', '$v=3t^2$ の0〜2秒：', '$3\\times\\frac{2^3}{3}=8\\,\\mathrm{m}$'],
    why: '0から $b$ までにすると、長方形のはばも右はしも $b$ 倍で、高さは $b^2$ 倍。どの長方形も $b\\times b^2=b^3$ 倍になるので、0から1までの $\\frac{1}{3}$ の $b^3$ 倍（5-10⑥）。$y=x$ の下は三角形で $\\frac{1}{2}b^2$。高さが $c$ 倍なら、面積も $c$ 倍。',
    caution: '$\\int_0^2x^2\\,\\dd x$ は $2\\times\\frac{1}{3}$ ではなく $2^3\\times\\frac{1}{3}=\\frac{8}{3}$（高さものびる）。下端が0でないときは、0からの面積の差（わざ 5-43）。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    boxh: '12mm',
    fits(q) {
      if (/台形|長方形/.test(q)) return false;
      const I = INTS(q);
      if (I.length) return I.every(m => m[1] === '0' && powOK(m[3]) && /^[0-9]*x(\^2)?$/.test(m[3]));
      if (/v=[0-9]*t\^2/.test(q) && /0秒から[0-9]+秒まで/.test(q)) return true;
      return /の0から[0-9]+までの下の、ほんとうの面積/.test(q) || /と \$x\$ 軸、直線 \$x=[^$]*\$ で囲まれた部分/.test(q);
    },
    steps: {
      // ∫_0^b x^2、∫_0^b x
      s1(r) {
        const sq = r.chance(0.65), b = sq ? r.int(1, 6) : r.int(1, 9), ans = sq ? fq([b ** 3, 3]) : fq([b * b, 2]);
        if (RAKU42(sq ? 1 : 0, b)) return null;
        return {
          q: INT(0, b, sq ? 'x^2' : 'x'), a: `$${fr(ans)}$`, key: `542:${sq}:${b}`,
          easy: `$\\frac{${b}^${sq ? 3 : 2}}{${sq ? 3 : 2}}=${fr(ans)}$`,
          calc: { kind: 'defint', f: sq ? 'x^2' : 'x', a: 0, b },
        };
      },
      // 係数つき、v=ct^2 の距離
      s2(r) {
        const c = r.int(2, 6), b = r.int(1, 5);
        if (RAKU42(c, b)) return null;
        if (turn(r, '42b', 2) === 0) {
          const ans = fq([c * b ** 3, 3]);
          return { q: `速度 $v=${c}t^2$（m/s）の物体が0秒から${b}秒までに進む距離 ${BOX('m')}`, a: `$${fr(ans)}$`, key: `542c:true:${c}:${b}`, easy: `$${c}\\times\\frac{${b}^3}{3}=${fr(ans)}$`, calc: { kind: 'defint', f: `${c}t^2`, x: 't', a: 0, b } };
        }
        const sq = r.chance(0.6), ans = sq ? fq([c * b ** 3, 3]) : fq([c * b * b, 2]);
        return { q: INT(0, b, `${c}x${sq ? '^2' : ''}`), a: `$${fr(ans)}$`, key: `542c:${sq}:${c}:${b}`, easy: `$${c}\\times\\frac{${b}^${sq ? 3 : 2}}{${sq ? 3 : 2}}=${fr(ans)}$`, calc: { kind: 'defint', f: `${c}x${sq ? '^2' : ''}`, a: 0, b } };
      },
      // 見かけがちがう：上端が分数、「囲まれた部分の面積」のことば
      s3(r) {
        if (turn(r, '42c', 2) === 0) {
          const [p, q] = r.pick([[1, 2], [3, 2], [1, 3], [2, 3], [5, 2], [3, 4]]), ans = fq([p ** 3, 3 * q ** 3]);
          return { q: INT(0, LIMF(p, q), 'x^2'), a: `$${fr(ans)}$`, key: `542f:${p}/${q}`, easy: `$\\left(\\frac{${p}}{${q}}\\right)^3\\times\\frac{1}{3}=${fr(ans)}$`, calc: { kind: 'defint', f: 'x^2', a: 0, b: `\\frac{${p}}{${q}}` } };
        }
        const c = r.pick([1, 1, 2, 3]), b = r.int(2, 6), ans = fq([c * b ** 3, 3]);
        if (RAKU42(c, b)) return unturn(r, '42c', 2);
        return { q: `グラフ $y=${cx2(c)}x^2$ と $x$ 軸、直線 $x=${b}$ で囲まれた部分の面積 □`, a: `$${fr(ans)}$`, key: c === 1 ? `542:true:${b}` : `542c:true:${c}:${b}`, easy: `$\\int_0^{${b}}${cx2(c)}x^2\\,\\dd x=${c === 1 ? '' : `${c}\\times`}\\frac{${b}^3}{3}=${fr(ans)}$`, easyCheck: 'last', calc: { kind: 'defint', f: `${c}x^2`, a: 0, b } };
      },
      // わな：下端が0でない（差 → 5-43）
      trap(r) {
        const a = r.int(1, 3), b = a + r.int(1, 3), ans = fq([b ** 3 - a ** 3, 3]);
        const p = { q: INT(a, b, 'x^2'), a: `$${fr(ans)}$`, key: `543:true:${a}:${b}`, calc: { kind: 'defint', f: 'x^2', a, b } };
        return dest(p, '5-42', `下端が ${a} で、0からではない。$\\frac{${b}^3}{3}$ ではなく、0からの面積の差 $\\frac{${b}^3}{3}-\\frac{${a}^3}{3}=${fr(ans)}$`);
      },
    },
  });

  // ================================================================ 5-43 とちゅうからの面積は差（入れかえると符号が反対）
  const RAKU43 = (a, b) => a === 2 && b === 3;   // 楽な形の例（$\int_2^3x^2\,\dd x=\frac{19}{3}$）は、問題に出さない（O-2・R1-2）
  M.add({
    id: '5-43', part: PART, chap: '5-10⑥ 例題7・⑤', stars: 1,
    title: 'とちゅうからの面積は「0からの面積の差」（上端と下端を入れかえると符号が反対）',
    mark: '定積分の**下端が0でない**。上端と下端が入れかわっている。$v=ct^2$ の□秒から□秒。',
    futsu: ['$a$ から $b$ までを $n$ 等分して', '長方形の和を作り、$n\\to\\infty$ にする。'],
    raku: ['$\\int_2^3x^2\\,\\dd x=\\frac{3^3}{3}-\\frac{2^3}{3}=\\frac{19}{3}$', '$v=3t^2$ の1〜3秒：$27-1=26\\,\\mathrm{m}$', '$\\int_1^0x^2\\,\\dd x=-\\frac{1}{3}$'],
    why: '0から $b$ までの面積から、0から $a$ までの面積をひくと、$a$ から $b$ までが残る（5-10⑥）。上端と下端を入れかえると、はば $\\Delta x$ が「あと－まえ」でマイナスになり、符号が反対になる（5-10⑤）。',
    caution: '$\\frac{(b-a)^3}{3}$ ではない（$\\frac{3^3-2^3}{3}$ と $\\frac{1^3}{3}$ はちがう）。入れかえたときのマイナスをわすれない。',
    counts: { s1: 10, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    boxh: '12mm',
    fits(q) {
      const I = INTS(q);
      if (I.length) return I.every(m => powOK(m[3]) && /^[0-9]*x(\^2)?$/.test(m[3])) && (I.some(m => m[1] !== '0') || I.length >= 2);
      return /v=[0-9]*t\^2/.test(q) && /[1-9][0-9]*秒から[0-9]+秒まで/.test(q) && !/台形|長方形/.test(q);
    },
    steps: {
      // ∫_a^b x^2、∫_a^b x（0<a<b）
      s1(r) {
        const sq = r.chance(0.65), a = r.int(1, 4), b = a + r.int(1, 3), ans = sq ? fq([b ** 3 - a ** 3, 3]) : fq([b * b - a * a, 2]);
        if (sq && RAKU43(a, b)) return null;
        const e = sq ? 3 : 2;
        return {
          q: INT(a, b, sq ? 'x^2' : 'x'), a: `$${fr(ans)}$`, key: `543:${sq}:${a}:${b}`,
          easy: `$\\frac{${b}^${e}}{${e}}-\\frac{${a}^${e}}{${e}}=${fr(ans)}$`,
          calc: { kind: 'defint', f: sq ? 'x^2' : 'x', a, b },
        };
      },
      // v=ct^2 の a〜b 秒、上端と下端の入れかえ
      s2(r) {
        if (turn(r, '43b', 2) === 0) {
          // key に係数を入れない：同じ区間で係数だけちがう（答えが何倍かになるだけの）問題を、同じ見開きに出さない（R1-28）。
          // 係数1は、ステップ1の $\int_a^bx^2\,\dd x$ と同じ計算なので使わない
          // 係数も順に回す（同じ係数ばかりにしない）
          const c = [2, 3, 6][turn(r, '43v', 3)], a = r.int(1, 3), b = a + r.int(1, 3), ans = fq([c * (b ** 3 - a ** 3), 3]);
          if (c === 3 && a === 1 && b === 3) return unturn(r, '43b', 2);   // 楽な形の例（$v=3t^2$ の1〜3秒）
          return { q: `速度 $v=${cx2(c)}t^2$（m/s）の物体が${a}秒から${b}秒までに進む距離 ${BOX('m')}`, a: `$${fr(ans)}$`, key: `543v:${a}:${b}`, easy: `$${c}\\times\\left(\\frac{${b}^3}{3}-\\frac{${a}^3}{3}\\right)=${fr(ans)}$`, calc: { kind: 'defint', f: `${c}t^2`, x: 't', a, b } };
        }
        const sq = r.chance(0.6), a = r.int(0, 3), b = a + r.int(1, 3), e = sq ? 3 : 2, ans = fq([-(b ** e - a ** e), e]);
        if (sq && a === 0 && b === 1) return unturn(r, '43b', 2);   // 楽な形の例（$\int_1^0x^2\,\dd x$）
        return { q: INT(b, a, sq ? 'x^2' : 'x'), a: `$${fr(ans)}$`, key: `543:${sq}:${a}:${b}`, easy: a === 0 ? `入れかえると符号が反対：$-\\frac{${b}^${e}}{${e}}=${fr(ans)}$` : `入れかえると符号が反対：$-\\left(\\frac{${b}^${e}}{${e}}-\\frac{${a}^${e}}{${e}}\\right)=${fr(ans)}$`, easyCheck: 'last', calc: { kind: 'defint', f: sq ? 'x^2' : 'x', a: b, b: a } };
      },
      // 見かけがちがう：はしが分数、係数と入れかえ、2つの定積分の差
      s3(r) {
        const k = turn(r, '43c', 3);
        if (k === 0) {
          const [p, q] = r.pick([[1, 2], [3, 2], [1, 3]]), b = r.int(2, 3), A = fq([p, q]), ans = F.div(F.sub(F.make(b ** 3), F.mul(F.mul(A, A), A)), F.make(3));
          return { q: INT(LIMF(p, q), b, 'x^2'), a: `$${fr(ans)}$`, key: `543f:${p}/${q}:${b}`, easy: `$\\frac{${b}^3}{3}-\\frac{1}{3}\\left(\\frac{${p}}{${q}}\\right)^3=${fr(ans)}$`, calc: { kind: 'defint', f: 'x^2', a: `\\frac{${p}}{${q}}`, b } };
        }
        if (k === 1) {
          const c = r.int(2, 6), a = r.int(0, 2), b = a + r.int(1, 3), ans = fq([-c * (b * b - a * a), 2]);
          return { q: INT(b, a, `${c}x`), a: `$${fr(ans)}$`, key: `543c:${c}:${a}:${b}`, easy: a === 0 ? `$-${c}\\times\\frac{${b}^2}{2}=${fr(ans)}$` : `$-${c}\\times\\left(\\frac{${b}^2}{2}-\\frac{${a}^2}{2}\\right)=${fr(ans)}$`, calc: { kind: 'defint', f: `${c}x`, a: b, b: a } };
        }
        const a = r.int(1, 3), b = a + r.int(1, 3), ans = fq([b ** 3 - a ** 3, 3]);
        if (RAKU43(a, b)) return unturn(r, '43c', 3);
        return { q: `$\\displaystyle\\int_{0}^{${b}}x^2\\,\\dd x-\\int_{0}^{${a}}x^2\\,\\dd x$ ＝ □`, a: `$${fr(ans)}$`, key: `543:true:${a}:${b}`, easy: `$x=${a}$ から${b}までの面積。$\\frac{${b}^3}{3}-\\frac{${a}^3}{3}=${fr(ans)}$`, easyCheck: false, calc: { kind: 'defint', f: 'x^2', a, b } };
      },
      // わな：x^3（教科書 5-10 にない → 5-46）
      trap(r) {
        const a = r.int(0, 2), b = a + r.int(1, 2), ans = fq([b ** 4 - a ** 4, 4]);
        const p = { q: INT(a, b, 'x^3'), a: `$${fr(ans)}$`, key: `546:${a}:${b}`, calc: { kind: 'defint', f: 'x^3', a, b } };
        return dest(p, '5-43', `$x^3$ の0からの面積は $\\frac{b^3}{3}$ ではないので、その差では出ない。原始関数 $\\frac{x^4}{4}$ を使って $${a === 0 ? `\\frac{${b}^4}{4}` : `\\frac{${b}^4}{4}-\\frac{${a}^4}{4}`}=${fr(ans)}$`, ['5-46']);
      },
    },
  });

  // ================================================================ 5-44 台形の和は、左はしの和と右はしの和の平均
  const K44 = (c, a, b, h) => '544:' + [c, a, b, h].join(':');           // 同じ式・同じはしの問題（5-38 のわなも）
  const RAKU44 = (c, b, h) => c === 1 && b === 2 && h === 0.5;   // 楽な形の例（$y=x^2$ の0から2を、はば0.5）は、問題に出さない（O-2・R1-2）
  const E44 = S => `左はし ${ft(S.L)}、右はし ${ft(S.R)}。$\\frac{${ft(S.L)}+${ft(S.R)}}{2}=${ft(S.T)}$`;
  M.add({
    id: '5-44', part: PART, chap: '5-10 例題8', stars: 2,
    title: '台形の和は、左はしの和と右はしの和の平均',
    mark: '「**台形で近似**」。グラフの上の、となりあう2点を結んだ台形をならべる。',
    futsu: ['台形を1つずつ計算する：', '$\\frac{0+0.25}{2}\\times0.5$、$\\frac{0.25+1}{2}\\times0.5$、…', '4つをたす。'],
    raku: ['左はし $(0+0.25+1+2.25)\\times0.5=1.75$', '右はし $(0.25+1+2.25+4)\\times0.5=3.75$', '平均 $\\frac{1.75+3.75}{2}=2.75$'],
    why: '1つの台形の面積は（左の高さ＋右の高さ）÷2×はば。左の高さだけなら左はしの長方形、右の高さだけなら右はしの長方形なので、台形の和は、2つの長方形の和の平均になる（5-10 例題8）。',
    caution: '台形の和も近似で、ほんとうの値（$y=x^2$ の0から2なら $\\frac{8}{3}$）とは少しちがう。$y=x^2$ のように下にふくらんだグラフでは、台形の和はほんとうより少し大きい。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /台形.*近似|台形でうめた/.test(q); },
    steps: {
      // y=x^2 の0から b を、はば h の台形で
      s1(r) {
        const b = r.int(1, 4), h = r.pick([0.5, 1]), n = b / h;
        if (n < 2 || RAKU44(1, b, h)) return null;
        const S = sums(M.P.make(0, 0, 1), 0, b, n);
        return {
          q: `$y=x^2$ の0から${b}までを、はば${h}の台形${n}つで近似した値 □`,
          a: `$${ft(S.T)}$`, key: K44(1, 0, b, h),
          easy: E44(S),
          verify: p => ok(p.a, sumsF(x => x * x, 0, b, n).T),
        };
      },
      // 0からでない、係数つき、v=t^2 の距離
      s2(r) {
        const k = turn(r, '44b', 3);
        if (k === 2) {
          const b = r.int(1, 4), h = r.pick([0.5, 1]), n = b / h;
          if (n < 2 || RAKU44(1, b, h)) return null;
          const S = sums(M.P.make(0, 0, 1), 0, b, n);
          return { q: `速度 $v=t^2$（m/s）の物体が0秒から${b}秒までに進む距離を、${h}秒ごとの台形で近似した値 ${BOX('m')}`, a: `$${ft(S.T)}$`, key: K44(1, 0, b, h), easy: `はじめの速さの和 ${ft(S.L)}、おわりの速さの和 ${ft(S.R)}。$\\frac{${ft(S.L)}+${ft(S.R)}}{2}=${ft(S.T)}$`, verify: p => ok(p.a, sumsF(t => t * t, 0, b, n).T) };
        }
        const c = k === 1 ? r.int(2, 4) : 1, a = k === 0 ? r.int(1, 2) : 0, b = a + r.int(1, 2), h = r.pick([0.5, 1]), n = (b - a) / h;
        if (n < 2) return null;
        const S = sums(M.P.make(0, 0, c), a, b, n);
        return { q: `$y=${cx2(c)}x^2$ の${a}から${b}までを、はば${h}の台形${n}つで近似した値 □`, a: `$${ft(S.T)}$`, key: K44(c, a, b, h), easy: E44(S), verify: p => ok(p.a, sumsF(x => c * x * x, a, b, n).T) };
      },
      // 図：台形でうめた図（はばは、等分の数から出す）。$y=x^2$、$y=\frac12x^2$、$y=x^2+1$
      s3(r) {
        const [tex, P, f, tag] = [['x^2', M.P.make(0, 0, 1), x => x * x, 1], ['\\frac{1}{2}x^2', M.P.make(0, 0, [1, 2]), x => x * x / 2, 'h'], ['x^2+1', M.P.make(1, 0, 1), x => x * x + 1, 'p']][turn(r, '44f', 3)];
        const b = r.int(2, 4), n = r.pick([2, 3, 4, 6]), h = fq([b, n]);
        if (!(h[1] === 1 || h[1] === 2) || h[0] / h[1] > 1 || RAKU44(tag, b, fv(h))) return null;
        const S = sums(P, 0, b, n);
        if ([S.L, S.R, S.T].some(v => decOf(v).k > 3)) return null;
        const fig = stairFig(f, b, n, 'T'); if (!fig) return null;
        return {
          q: `図は、$y=${tex}$ の0から${b}までを${n}等分して、台形でうめたもの。台形の面積の和 □`,
          a: `$${ft(S.T)}$`, fig, key: K44(tag, 0, b, fv(h)),
          easy: `はば $${b}\\div${n}=${ft(h)}$。` + E44(S), easyCheck: false,
          verify: p => ok(p.a, sumsF(f, 0, b, n).T),
        };
      },
      // わな：近似ではなく、ほんとうの距離（定積分 → 5-42）
      trap(r) {
        const c = r.pick([1, 3, 6]), b = r.int(1, 3), ans = fq([c * b ** 3, 3]);
        const p = { q: `速度が $v=${cx2(c)}t^2$（m/s）の物体が、0秒から${b}秒までに進む、ほんとうの距離 ${BOX('m')}`, a: `$${fr(ans)}$`, key: `542c:true:${c}:${b}`, calc: { kind: 'defint', f: `${c}t^2`, x: 't', a: 0, b } };
        return dest(p, '5-44', `近似した値ではなく、ほんとうの値を聞いている。定積分で $${c === 1 ? '' : `${c}\\times`}\\frac{${b}^3}{3}=${fr(ans)}$`);
      },
    },
  });

  // ================================================================ 5-45 うすい板の体積をたす：円すい・角すいは 1/3×底面積×高さ
  // 円すいの図：頂点が上、底面の中心が原点。頂点から yv の所の円板（mode 'slab'）か切り口（mode 'cut'）
  // 長さのしるし（両はしに短い線）と数
  function dimV(x, y0, y1, t, dir) { return [['seg', [x, y0], [x, y1]], ['seg', [x - 0.2, y0], [x + 0.2, y0]], ['seg', [x - 0.2, y1], [x + 0.2, y1]], ['label', [x, (y0 + y1) / 2], t, dir]]; }
  function dimH(x0, x1, y, t, dir) { return [['seg', [x0, y], [x1, y]], ['seg', [x0, y - 0.2], [x0, y + 0.2]], ['seg', [x1, y - 0.2], [x1, y + 0.2]], ['label', [(x0 + x1) / 2, y], t, dir]]; }
  const arcPts = (C, rx, ry, d0, d1, n) => range(0, n).map(j => { const a = (d0 + (d1 - d0) * j / n) * Math.PI / 180; return [C[0] + rx * Math.cos(a), C[1] + ry * Math.sin(a)]; });
  function coneFig(R0, H0, yv, ylab, mode) {
    const k = Math.min(4.0 / H0, 2.6 / R0), H = H0 * k, R = R0 * k, ry = Math.max(R * 0.28, Math.min(0.8, R * 0.4)), T = [0, H];
    const yc = H - yv * k, rc = R * yv / H0, ryc = rc * ry / R, items = [];
    // 切った下の部分は、うすくぬる（うしろの切り口の弧・横の線・前の底の弧で囲む）
    if (mode === 'cut') items.push(['poly', arcPts([0, yc], rc, ryc, 180, 0, 16).concat(arcPts([0, 0], R, ry, 360, 180, 24)), { fill: true, noline: true }]);
    items.push(['seg', T, [-R, 0]], ['seg', T, [R, 0]], ['ellipse', [0, 0], R, ry, 180, 360], ['ellipse', [0, 0], R, ry, 0, 180, { dash: true }],
      ['seg', T, [0, 0], { dash: true }], ['seg', [0, 0], [R, 0], { dash: true }],
      ['ellipse', [0, yc], rc, ryc, 180, 360], ['ellipse', [0, yc], rc, ryc, 0, 180, mode === 'slab' ? {} : { dash: true }]);
    if (mode === 'slab') {
      const d = 0.3, rc2 = R * (yv * k + d) / H, ry2 = rc2 * ry / R;
      items.push(['ellipse', [0, yc - d], rc2, ry2, 180, 360], ['seg', [-rc, yc], [-rc2, yc - d]], ['seg', [rc, yc], [rc2, yc - d]]);
    }
    items.push(...dimV(-R - 0.7, 0, H, `$${H0}$`, 'w'), ...dimV(Math.max(rc + 0.7, R * 0.5), yc, H, ylab, 'e'), ...dimH(0, R, -ry - 0.55, `$${R0}$`, 's'));
    return figOK({ s: FS, pad: 0.8, items });
  }
  const FITS45 = q => /(円すい|角すい)/.test(q) && /(うすい|断面)/.test(q);
  // 比 (r/h) を2乗する式：整数なら 3^2、分数なら \left(\frac{3}{4}\right)^2
  const sq45 = c => (c[1] === 1 ? `${c[0]}^2` : `\\left(${fr(c)}\\right)^2`);
  const cy45 = c => (c[1] === 1 ? `${cx2(c[0])}y` : `\\frac{${c[0]}}{${c[1]}}y`);
  // 切った下の部分の体積 π(R/H)^2(H^3-a^3)/3 の分母が3までになる組（R, H, a）
  const CUT45 = [];
  for (let R = 2; R <= 6; R++) for (let H = 3; H <= 9; H++) for (let a = 1; a < H; a++) { const v = F.mul(fq([R * R, 3 * H * H]), F.make(H ** 3 - a ** 3)); if (v[1] <= 3 && v[0] < 400 && a / H >= 0.3 && a / H <= 0.75) CUT45.push([R, H, a]); }
  M.add({
    id: '5-45', part: PART, chap: '5-10 例題9', stars: 1,
    title: 'うすい板の体積をたす：円すい・角すいは $\\frac{1}{3}\\times$底面積$\\times$高さ',
    mark: '円すい・角すいを、底面に平行に**うすく**切る。断面の半径（1辺）は頂点からの長さ $y$ に比例。',
    futsu: ['高さを $n$ 等分して、$k$ 枚めの円板の', '体積を $\\pi\\left(\\frac{3}{4}\\cdot\\frac{4k}{n}\\right)^2\\frac{4}{n}$ と書き、', '$\\Sigma$ でたして $n\\to\\infty$ にする。'],
    raku: ['円板 $\\pi\\left(\\frac{3}{4}y\\right)^2\\Delta y$ をたす：', '$\\frac{9\\pi}{16}\\times\\frac{4^3}{3}=12\\pi$', '（底面積 $9\\pi$×高さ4×$\\frac{1}{3}$ と同じ）'],
    why: '頂点から $y$ の所の断面は、もとの底面と相似で、半径（1辺）が $y$ に比例し、面積は $y^2$ に比例する（4-3）。厚さ $\\Delta y$ の板の体積をたすと、$\\int_0^h(\\text{定数})\\times y^2\\,\\dd y$ になり、$\\frac{h^3}{3}$ から、底面積×高さの $\\frac{1}{3}$ が出る（5-10 例題9）。',
    caution: '円柱・角柱は、どこで切っても断面が同じなので $\\frac{1}{3}$ をかけない（底面積×高さ）。頂点から $y$ の所と、底面から $y$ の所をまちがえない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '18mm',
    boxh: '12mm',
    fits(q) { return FITS45(q); },
    steps: {
      // 円すい：断面の半径は (r/h)y
      s1(r) {
        const R = r.int(1, 6), H = r.int(2, 9), c = fq([R, H]), ans = fq([R * R * H, 3]);
        return {
          q: `底面の半径 $${R}$、高さ $${H}$ の円すい。頂点から $y$ の所の断面は半径 $${cy45(c)}$ の円。うすい円板の体積をたした、円すいの体積 □`,
          a: `$${piT(ans)}$`, key: NK('545', R) + ':' + H,
          easy: `$\\pi\\times${c[0] === 1 && c[1] === 1 ? '' : `${sq45(c)}\\times`}\\frac{${H}^3}{3}=\\frac{1}{3}\\times\\pi\\times${R}^2\\times${H}=${piT(ans)}$`,
          calc: { kind: 'defint', f: `\\pi\\left(${fr(c)}x\\right)^2`, a: 0, b: H },
        };
      },
      // 四角すい、断面積が cy^2 の角すい
      s2(r) {
        if (turn(r, '45b', 2) === 0) {
          const A = r.int(1, 6), H = r.int(2, 9), c = fq([A, H]), ans = fq([A * A * H, 3]);
          return { q: `底面が1辺 $${A}$ の正方形、高さ $${H}$ の四角すい。頂点から $y$ の所の断面は1辺 $${cy45(c)}$ の正方形。うすい板の体積をたした、四角すいの体積 □`, a: `$${fr(ans)}$`, key: NK('545b', A) + ':' + H, easy: `$${c[0] === 1 && c[1] === 1 ? '' : `${sq45(c)}\\times`}\\frac{${H}^3}{3}=\\frac{1}{3}\\times${A}^2\\times${H}=${fr(ans)}$`, calc: { kind: 'defint', f: `\\left(${fr(c)}x\\right)^2`, a: 0, b: H } };
        }
        const c = r.int(1, 5), H = r.int(2, 6), ans = fq([c * H ** 3, 3]);
        return { q: `高さ $${H}$ の角すいを、頂点から $y$ の所で底面に平行に切った断面積が $${cx2(c)}y^2$。うすい板の体積をたした、角すいの体積 □`, a: `$${fr(ans)}$`, key: NK('545c', c) + ':' + H, easy: `$${c === 1 ? '' : `${c}\\times`}\\frac{${H}^3}{3}=${fr(ans)}$`, calc: { kind: 'defint', f: `${c}x^2`, a: 0, b: H } };
      },
      // 図：円すいとうすい円板。円すい全体か、切り口より下の部分
      s3(r) {
        if (turn(r, '45f', 2) === 0) {
          const R = r.int(2, 6), H = r.int(3, 9), c = fq([R, H]), ans = fq([R * R * H, 3]);
          const fig = coneFig(R, H, H * 0.55, '$y$', 'slab'); if (!fig) return null;
          return { q: `図の円すいを、頂点から $y$ の所でうすい円板に切って、体積をたす。円すいの体積 □`, a: `$${piT(ans)}$`, fig, key: NK('545', R) + ':' + H, easy: `円板の半径は $${cy45(c)}$。$\\frac{1}{3}\\times\\pi\\times${R}^2\\times${H}=${piT(ans)}$`, easyCheck: 'last', calc: { kind: 'defint', f: `\\pi\\left(${fr(c)}x\\right)^2`, a: 0, b: H } };
        }
        const [R, H, a] = r.pick(CUT45), c = fq([R, H]), ans = F.mul(fq([R * R, 3 * H * H]), F.make(H ** 3 - a ** 3));
        const fig = coneFig(R, H, a, `$${a}$`, 'cut'); if (!fig) return null;
        return { q: `図の円すいを、頂点から $${a}$ の所で底面に平行に切った。下の部分（ぬった所）の体積を、うすい円板をたして求めると □`, a: `$${piT(ans)}$`, fig, key: '545d:' + [R, H, a].join(':'), easy: `円板の半径は $${cy45(c)}$。$\\pi\\times${c[0] === 1 && c[1] === 1 ? '' : `${sq45(c)}\\times`}\\left(\\frac{${H}^3}{3}-\\frac{${a}^3}{3}\\right)=${piT(ans)}$`, easyCheck: 'last', calc: { kind: 'defint', f: `\\pi\\left(${fr(c)}x\\right)^2`, a, b: H } };
      },
      // わな：円柱（断面が同じ。1/3 をかけない）
      trap(r) {
        const R = r.int(1, 5), H = r.int(2, 8), ans = fq([R * R * H, 1]);
        const p = { q: `底面の半径 $${R}$、高さ $${H}$ の円柱を、底面に平行なうすい円板に分けて体積をたす。円柱の体積 □`, a: `$${piT(ans)}$`, key: NK('545t', R) + ':' + H, calc: { kind: 'defint', f: `${R * R}\\pi`, a: 0, b: H } };
        return dest(p, '5-45', `円柱の断面は、どこでも半径 ${R} の円で、$y$ に比例しない。$\\frac{1}{3}$ をかけずに 底面積×高さ：$\\pi\\times${R}^2\\times${H}=${piT(ans)}$`);
      },
    },
  });
})(globalThis.MONDAI);
