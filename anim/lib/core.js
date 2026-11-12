/* 補助教材のアニメーション：共通の部品（第33回）。1つの項目＝1つの HTML。外のファイルは読みこまない。
   使い方は anim/README.md と tools/BRIEF-anim.md。 */
(function () {
  'use strict';
  const A = window.A = {};
  const TAU = Math.PI * 2;
  A.TAU = TAU;

  // ---------- 文字 ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  A.esc = esc;
  A.R = (k, y) => `<ruby>${k}<rt>${y}</rt></ruby>`;
  // 数（マイナスは −、けた数 d）
  A.num = (v, d = 2) => {
    if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
    let s = (+v).toFixed(d);
    if (/^-0\.?0*$/.test(s)) s = s.slice(1);
    return s.replace('-', '−');
  };
  const SYM = { times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', pi: 'π', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
    approx: '≒', leqq: '≦', geqq: '≧', vert: '|', mid: '|', angle: '∠', perp: '⊥', parallel: '∥', to: '→', rightarrow: '→', leftarrow: '←', infty: '∞', degree: '°', circ: '°',
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω', partial: '∂', nabla: '∇', hbar: 'ℏ', ell: 'ℓ', int: '∫', oint: '∮', sum: 'Σ',
    ldots: '…', cdots: '⋯', prime: '′', propto: '∝', in: '∈', cdotp: '·', '%': '%', '{': '{', '}': '}', '$': '$', '#': '#', '&': '&' };
  const FN = ['log', 'ln', 'sin', 'cos', 'tan', 'exp', 'max', 'min', 'lim', 'sinh', 'cosh', 'tanh', 'Re', 'Im', 'rot', 'grad', 'det', 'arg'];  // div（発散）は \\mathrm{div}。\\div は ÷
  const CAL = { E: 'ℰ', B: 'ℬ', F: 'ℱ', H: 'ℋ', L: 'ℒ', M: 'ℳ', R: 'ℛ', T: '𝒯', I: 'ℐ', P: '𝒫' };
  // TeX のような書き方を HTML に（練習プリントのアプリの数式の組み方を写したもの）
  A.tex = function tex(s, opt) {
    opt = opt || {};
    let i = 0;
    const ws = () => { while (i < s.length && s[i] === ' ') i++; };
    const readCmd = () => { i++; const j = i; if (/[a-zA-Z]/.test(s[i] || '')) { while (i < s.length && /[a-zA-Z]/.test(s[i])) i++; return s.slice(j, i); } i++; return s[j] || ''; };
    const raw = () => { ws(); if (s[i] !== '{') return s[i++] || ''; let d = 0; const j = ++i; for (; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}') { if (!d) break; d--; } } const t = s.slice(j, i); i++; return t; };
    const op = c => `<span class="mo">${c}</span>`;
    function atom() {
      ws();
      const c = s[i];
      if (c === undefined) return '';
      if (c === '{') { i++; const h = seq('}'); i++; return h; }
      if (c === '\\') {
        const name = readCmd();
        if (name === 'frac' || name === 'dfrac' || name === 'tfrac') { const one = () => { ws(); return /[0-9]/.test(s[i] || '') ? s[i++] : atom(); }; const a = one(), b = one(); return `<span class="frac"><span>${a}</span><span>${b}</span></span>`; }
        if (name === 'dot' || name === 'ddot') { const x = atom(); return `<span style="position:relative;display:inline-block">${x}<span style="position:absolute;left:0;right:0;top:-.55em;text-align:center;font-size:.8em">${name === 'dot' ? '˙' : '¨'}</span></span>`; }
        if (name === 'phantom') { const x = atom(); return `<span style="visibility:hidden">${x}</span>`; }
        if (name === 'mathcal') { const r = raw(); return CAL[r] || esc(r); }
        if (name === 'operatorname' || name === 'mathsf') return `<span class="mfn">${esc(raw())}</span>`;
        if (name === 'overrightarrow') return `<span class="mvec">${atom()}</span>`;
        if (/^[bB]igg?[lr]?$/.test(name)) { ws(); if (s[i] === '\\') { const n2 = readCmd(); return `<span style="font-size:1.3em">${SYM[n2] || ''}</span>`; } const d = s[i++]; return `<span style="font-size:1.3em">${esc(d)}</span>`; }
        if (name === 'sqrt') { const x = atom(); return `<span class="msqrt">√<span class="rc">${x}</span></span>`; }
        if (name === 'text' || name === 'mathrm' || name === 'rm') return `<span class="mtext">${A.txt(raw())}</span>`;
        if (name === 'vec') return `<span class="mvec">${atom()}</span>`;
        if (name === 'bar' || name === 'overline') return `<span class="mbar">${atom()}</span>`;
        if (name === 'left' || name === 'right') { ws(); if (s[i] === '\\') { const n2 = readCmd(); return SYM[n2] || ''; } const d = s[i++]; return d === '.' ? '' : esc(d); }
        if (FN.includes(name)) return `<span class="mfn">${name}</span>`;
        if (name === ',' || name === ';') return '<span style="display:inline-block;width:.2em"></span>';
        if (name === 'quad') return '<span style="display:inline-block;width:1em"></span>';
        if (SYM[name] != null) { const t = SYM[name]; return /^[×÷·±∓≤≥≦≧≠≒→←∝∈]$/.test(t) ? op(t) : t; }
        return esc(name);
      }
      if (/[0-9.]/.test(c)) { const j = i; while (i < s.length && /[0-9.]/.test(s[i])) i++; return s.slice(j, i); }
      i++;
      if (/[a-zA-Z]/.test(c)) return opt.upright ? c : `<i class="mi">${c}</i>`;
      if (c === '-') return op('−');
      if (c === '+' || c === '=' || c === '<' || c === '>') return op(esc(c));
      if (c === "'") return '′';
      if (c === '*') return op('×');
      return esc(c);
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
  // 文：《漢字|よみ》はルビ、$…$ は数式、**…** は強調。ほかの HTML はそのまま通す
  A.txt = function (s) {
    if (s == null) return '';
    return String(s).replace(/\*\*([^*]+)\*\*/g, '\u0001$1\u0002').split(/(\$[^$]*\$)/).map((seg, k) => k % 2 ? A.tex(seg.slice(1, -1))
      : seg.replace(/《([^|》]+)\|([^》]+)》/g, (m, a, b) => A.R(a, b))).join('').replace(/\u0001/g, '<b class="k">').replace(/\u0002/g, '</b>');
  };
  // キャンバスに書く文字（ルビの記号を取る。《漢字|よみ》→ 漢字）
  const plain = s => String(s).replace(/《([^|》]+)\|[^》]+》/g, '$1');

  // ---------- 色と線 ----------
  let COL = {};
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    for (const k of ['ink', 'sub', 'bg', 'panel', 'line', 'grid', 'a', 'b', 'c', 'd', 'e', 'hl']) COL[k] = cs.getPropertyValue('--' + k).trim();
  }
  A.color = c => (c && COL[c]) || c || COL.ink;
  const DASH = { solid: [], dash: [9, 6], dot: [2, 5], dashdot: [10, 4, 2, 4], long: [16, 6] };

  // ---------- キャンバス ----------
  class Cv {
    constructor(el, W, H) { this.el = el; this.W = W; this.H = H; this.g = el.getContext('2d'); this.fontFamily = getComputedStyle(document.body).fontFamily; this.resize(); }
    resize() { const dpr = Math.min(3, window.devicePixelRatio || 1); this.dpr = dpr; this.el.width = Math.round(this.W * dpr); this.el.height = Math.round(this.H * dpr); }
    begin() { const g = this.g; g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.clearRect(0, 0, this.W, this.H); g.lineCap = 'round'; g.lineJoin = 'round'; }
    _st(o) { const g = this.g; g.strokeStyle = A.color(o.color); g.lineWidth = o.width || 2; g.setLineDash((DASH[o.style] || []).map(x => x * Math.max(1, (o.width || 2) / 2))); g.globalAlpha = o.alpha == null ? 1 : o.alpha; }
    _end() { this.g.setLineDash([]); this.g.globalAlpha = 1; }
    line(pts, o = {}) { if (pts.length < 2) return; const g = this.g; this._st(o); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); if (o.close) g.closePath(); g.stroke(); this._end(); }
    poly(pts, o = {}) { if (pts.length < 2) return; const g = this.g; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); g.closePath(); if (o.fill) { g.fillStyle = A.color(o.fill); g.globalAlpha = o.alpha == null ? 0.25 : o.alpha; g.fill(); g.globalAlpha = 1; } if (o.color) { this._st(Object.assign({}, o, { alpha: 1 })); g.stroke(); this._end(); } }
    arrow(x1, y1, x2, y2, o = {}) {
      const g = this.g, w = o.width || 2, h = o.head || (6 + 2.5 * w), a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
      if (L < 0.5) return;
      const hh = Math.min(h, L * 0.6), bx = x2 - hh * 0.8 * Math.cos(a), by = y2 - hh * 0.8 * Math.sin(a);
      this.line([[x1, y1], [bx, by]], o);
      g.fillStyle = A.color(o.color); g.globalAlpha = o.alpha == null ? 1 : o.alpha; g.beginPath(); g.moveTo(x2, y2);
      g.lineTo(x2 - hh * Math.cos(a - 0.38), y2 - hh * Math.sin(a - 0.38)); g.lineTo(x2 - hh * Math.cos(a + 0.38), y2 - hh * Math.sin(a + 0.38)); g.closePath(); g.fill(); g.globalAlpha = 1;
    }
    circle(x, y, r, o = {}) { const g = this.g; g.beginPath(); g.arc(x, y, Math.max(0, r), o.a0 || 0, o.a1 == null ? TAU : o.a1, !!o.ccw); if (o.fill) { g.fillStyle = A.color(o.fill); g.globalAlpha = o.alpha == null ? 0.25 : o.alpha; g.fill(); g.globalAlpha = 1; } if (o.color || !o.fill) { this._st(Object.assign({}, o, { alpha: 1 })); g.stroke(); this._end(); } }
    rect(x, y, w, h, o = {}) { this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
    // 点の形：circle・square・tri・diamond・cross（色だけで分けない）
    dot(x, y, o = {}) {
      const g = this.g, r = o.r || 5, sh = o.shape || 'circle';
      g.fillStyle = A.color(o.color); g.strokeStyle = A.color(o.color); g.lineWidth = 2; g.setLineDash([]); g.beginPath();
      if (sh === 'square') g.rect(x - r, y - r, 2 * r, 2 * r);
      else if (sh === 'tri') { g.moveTo(x, y - r * 1.2); g.lineTo(x + r * 1.1, y + r * 0.8); g.lineTo(x - r * 1.1, y + r * 0.8); g.closePath(); }
      else if (sh === 'diamond') { g.moveTo(x, y - r * 1.25); g.lineTo(x + r * 1.25, y); g.lineTo(x, y + r * 1.25); g.lineTo(x - r * 1.25, y); g.closePath(); }
      else if (sh === 'cross') { g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x + r, y - r); g.lineTo(x - r, y + r); g.stroke(); return; }
      else g.arc(x, y, r, 0, TAU);
      if (o.open) { g.fillStyle = A.color('bg'); g.fill(); g.stroke(); } else g.fill();
    }
    text(s, x, y, o = {}) {
      const g = this.g, size = Math.max(13, o.size || 15) * (this.ts || 1);
      g.font = `${o.bold ? 'bold ' : ''}${o.italic ? 'italic ' : ''}${size}px ${o.math ? '"Times New Roman",serif' : this.fontFamily}`;
      g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'middle';
      const t = plain(s);
      if (o.bg) { const w = g.measureText(t).width, ox = g.textAlign === 'center' ? -w / 2 : g.textAlign === 'right' ? -w : 0; g.fillStyle = A.color('bg'); g.globalAlpha = 0.85; g.fillRect(x + ox - 3, y - size * 0.65, w + 6, size * 1.3); g.globalAlpha = 1; }
      g.fillStyle = A.color(o.color); g.fillText(t, x, y);
      return g.measureText(t).width;
    }
    view(o) { return new View(this, o); }
  }
  A.Cv = Cv;

  // 座標の窓：x0〜x1・y0〜y1 を、キャンバスの box=[左,上,幅,高さ] に写す
  class View {
    constructor(cv, o) {
      this.cv = cv; this.x0 = o.x0; this.x1 = o.x1; this.y0 = o.y0; this.y1 = o.y1;
      const b = o.box || [40, 20, cv.W - 60, cv.H - 50]; this.L = b[0]; this.T = b[1]; this.Wp = b[2]; this.Hp = b[3];
      this.sx = this.Wp / (this.x1 - this.x0); this.sy = this.Hp / (this.y1 - this.y0);
      if (o.equal) { const s = Math.min(this.sx, this.sy); const cx = (this.x0 + this.x1) / 2, cy = (this.y0 + this.y1) / 2; this.sx = this.sy = s; this.x0 = cx - this.Wp / 2 / s; this.x1 = cx + this.Wp / 2 / s; this.y0 = cy - this.Hp / 2 / s; this.y1 = cy + this.Hp / 2 / s; }
    }
    X(x) { return this.L + (x - this.x0) * this.sx; }
    Y(y) { return this.T + this.Hp - (y - this.y0) * this.sy; }
    P(p) { return [this.X(p[0]), this.Y(p[1])]; }
    inv(px, py) { return [this.x0 + (px - this.L) / this.sx, this.y0 + (this.T + this.Hp - py) / this.sy]; }
    inside(px, py) { return px >= this.L && px <= this.L + this.Wp && py >= this.T && py <= this.T + this.Hp; }
    clip(fn) { const g = this.cv.g; g.save(); g.beginPath(); g.rect(this.L, this.T, this.Wp, this.Hp); g.clip(); fn(); g.restore(); }
    // 軸：xt・yt は目もりの値の配列、xl・yl は軸の名前、grid は方眼
    axes(o = {}) {
      const cv = this.cv, f = o.fmt || (v => A.num(v, Math.abs(v) < 10 && v % 1 ? 1 : 0));
      const xf = o.xfmt || f, yf = o.yfmt || f;
      const ax = o.ax != null ? o.ax : (this.y0 <= 0 && this.y1 >= 0 ? 0 : this.y0), ay = o.ay != null ? o.ay : (this.x0 <= 0 && this.x1 >= 0 ? 0 : this.x0);
      if (o.grid !== false) {
        for (const v of (o.xt || [])) cv.line([[this.X(v), this.T], [this.X(v), this.T + this.Hp]], { color: 'grid', width: 1 });
        for (const v of (o.yt || [])) cv.line([[this.L, this.Y(v)], [this.L + this.Wp, this.Y(v)]], { color: 'grid', width: 1 });
      }
      cv.arrow(this.L, this.Y(ax), this.L + this.Wp + 8, this.Y(ax), { color: 'sub', width: 1.5, head: 9 });
      cv.arrow(this.X(ay), this.T + this.Hp, this.X(ay), this.T - 8, { color: 'sub', width: 1.5, head: 9 });
      for (const v of (o.xt || [])) { if (o.xlabels === false) break; cv.line([[this.X(v), this.Y(ax) - 4], [this.X(v), this.Y(ax) + 4]], { color: 'sub', width: 1 }); if (v !== ay || o.zero) cv.text(xf(v), this.X(v), this.Y(ax) + 14, { align: 'center', color: 'sub', size: 14 }); }
      for (const v of (o.yt || [])) { if (o.ylabels === false) break; cv.line([[this.X(ay) - 4, this.Y(v)], [this.X(ay) + 4, this.Y(v)]], { color: 'sub', width: 1 }); if (v !== ax || o.zero) cv.text(yf(v), this.X(ay) - 7, this.Y(v), { align: 'right', color: 'sub', size: 14 }); }
      if (o.xl) cv.text(o.xl, this.L + this.Wp + 4, this.Y(ax) - 14, { align: 'right', color: 'sub', size: 14, italic: o.xlItalic });
      if (o.yl) cv.text(o.yl, this.X(ay) + 8, this.T - 2, { align: 'left', color: 'sub', size: 14, italic: o.ylItalic });
    }
    plot(fn, o = {}) {
      const a = o.x0 == null ? this.x0 : o.x0, b = o.x1 == null ? this.x1 : o.x1, n = o.n || Math.max(60, Math.round(this.Wp / 2));
      let seg = [];
      const segs = [];
      for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n, y = fn(x); if (!isFinite(y) || Math.abs(y) > 1e6) { if (seg.length) segs.push(seg); seg = []; continue; } seg.push([this.X(x), this.Y(y)]); }
      if (seg.length) segs.push(seg);
      this.clip(() => segs.forEach(s => this.cv.line(s, o)));
    }
    param(fx, fy, t0, t1, o = {}) { const n = o.n || 300, pts = []; for (let k = 0; k <= n; k++) { const t = t0 + (t1 - t0) * k / n; pts.push([this.X(fx(t)), this.Y(fy(t))]); } this.clip(() => this.cv.line(pts, o)); }
    line(pts, o) { this.cv.line(pts.map(p => this.P(p)), o); }
    poly(pts, o) { this.cv.poly(pts.map(p => this.P(p)), o); }
    arrow(x1, y1, x2, y2, o) { this.cv.arrow(this.X(x1), this.Y(y1), this.X(x2), this.Y(y2), o); }
    dot(x, y, o) { this.cv.dot(this.X(x), this.Y(y), o); }
    text(s, x, y, o) { return this.cv.text(s, this.X(x), this.Y(y), o); }
    circle(x, y, r, o) { this.cv.circle(this.X(x), this.Y(y), r * this.sx, o); }
    // 曲線の下の面積をぬる（fn の値と base のあいだ）
    area(fn, a, b, o = {}) { const n = o.n || 200, base = o.base || 0, pts = [[a, base]]; for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; pts.push([x, fn(x)]); } pts.push([b, base]); this.clip(() => this.poly(pts, o)); }
  }
  A.View = View;

  // ---------- 凡例 ----------
  function legendHTML(items) {
    return items.map(([label, o]) => {
      o = o || {};
      const c = A.color(o.color), d = (DASH[o.style] || []).join(',');
      let mk = '';
      if (o.shape) { const sh = o.shape; mk = sh === 'square' ? `<rect x="12" y="4" width="8" height="8" fill="${c}"/>` : sh === 'tri' ? `<path d="M16 3 L21 12 L11 12 Z" fill="${c}"/>` : sh === 'diamond' ? `<path d="M16 2 L22 8 L16 14 L10 8 Z" fill="${c}"/>` : sh === 'cross' ? `<path d="M12 4 L20 12 M20 4 L12 12" stroke="${c}" stroke-width="2.5"/>` : `<circle cx="16" cy="8" r="4.5" fill="${c}"/>`; }
      const ln = o.noline ? '' : `<line x1="2" y1="8" x2="30" y2="8" stroke="${c}" stroke-width="3" stroke-dasharray="${d}" stroke-linecap="round"/>`;
      return `<span><svg width="32" height="16" aria-hidden="true">${ln}${mk}</svg>${A.txt(label)}</span>`;
    }).join('');
  }

  // ---------- ページ ----------
  // def = { id, title, from, vol, ruby, W, H, state, scenes:[{ key, label, note, miss, controls, init, step, draw, drag, readout, legend, autoplay }] }
  A.item = function (def) {
    const W = def.W || 880, H = def.H || 440;
    document.title = plain(def.title);
    if (def.ruby) document.body.classList.add('ruby');
    const root = document.body;
    root.insertAdjacentHTML('beforeend', `
<header class="an"><h1>${A.txt(def.title)}</h1><div class="from">${A.txt(def.from || '')}</div></header>
<nav class="sc" role="tablist"></nav>
<main class="an">
  <div class="lead"></div>
  <div class="cvw"><canvas class="an" width="${W}" height="${H}" role="img"></canvas></div>
  <div class="leg"></div>
  <div class="readout" aria-live="polite"></div>
  <div class="bar"></div>
  <div class="ctl"></div>
  <div class="note"></div>
  <div class="note miss" hidden></div>
</main>
<footer class="an">${A.txt(def.foot || (def.ruby ? '《工学|こうがく》を《理解|りかい》するための《数学|すうがく》・《物理|ぶつり》シリーズの《補助|ほじょ》《教材|きょうざい》' : '工学を理解するための数学・物理シリーズの補助教材'))}</footer>`);
    const $ = s => root.querySelector(s);
    const nav = $('nav.sc'), canvas = $('canvas.an'), leg = $('.leg'), ro = $('.readout'), bar = $('.bar'), ctl = $('.ctl'), note = $('.note'), miss = $('.note.miss'), lead = $('.lead');
    readColors();
    const cv = new Cv(canvas, W, H);
    canvas.setAttribute('aria-label', plain(def.alt || def.title));
    let si = 0, st = null, playing = false, speed = 1, last = 0;
    const ctrls = [];
    const scene = () => def.scenes[si];
    const clone = o => JSON.parse(JSON.stringify(o || {}));
    function api() { return { cv, W, H, redraw, set, st, play: v => setPlay(v) }; }
    function set(k, v) { st[k] = v; syncCtl(); redraw(); }
    function fit() { const w = canvas.getBoundingClientRect().width || W; cv.ts = w < 520 ? Math.min(1.3, 1 + (520 - w) / 400) : 1; }
    function draw() { fit(); cv.begin(); try { scene().draw(cv, st, api()); } catch (e) { console.error(e); throw e; } ro.innerHTML = scene().readout ? A.txt(scene().readout(st)) : ''; }
    let pend = false;
    function redraw() { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; draw(); }); }
    function syncCtl() { for (const c of ctrls) c.sync && c.sync(); }
    function setPlay(v) { playing = v; const b = bar.querySelector('.play'); if (b) { b.innerHTML = playing ? '❚❚ ' + A.txt(def.ruby ? '《止|と》める' : '止める') : '▶ ' + A.txt(def.ruby ? '《再生|さいせい》' : '再生'); b.classList.toggle('on', playing); } if (playing) { last = 0; requestAnimationFrame(tick); } }
    function tick(ts) {
      if (!playing) return;
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000) * speed; last = ts;
      const r = scene().step(st, dt, api());
      syncCtl(); draw();
      if (r === false) { setPlay(false); return; }
      requestAnimationFrame(tick);
    }
    function buildScene(keepState) {
      const sc = scene();
      setPlay(false);
      if (!keepState) { st = Object.assign(clone(def.state), clone(sc.state)); if (sc.init) sc.init(st); }
      nav.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-selected', k === si));
      lead.innerHTML = A.txt(sc.lead || def.lead || '');
      leg.innerHTML = legendHTML(sc.legend || def.legend || []);
      note.innerHTML = A.txt(sc.note || ''); note.hidden = !sc.note;
      miss.innerHTML = sc.miss ? '<b>まちがえやすいところ</b>　' + A.txt(sc.miss) : ''; miss.hidden = !sc.miss;
      // ボタン
      bar.innerHTML = ''; ctl.innerHTML = ''; ctrls.length = 0;
      if (sc.step) {
        const p = document.createElement('button'); p.className = 'play'; p.onclick = () => setPlay(!playing); bar.append(p);
        const s = document.createElement('button'); s.textContent = speed === 1 ? 'ゆっくり' : 'ふつうの速さ'; s.onclick = () => { speed = speed === 1 ? 0.3 : 1; s.textContent = speed === 1 ? 'ゆっくり' : 'ふつうの速さ'; s.classList.toggle('on', speed !== 1); }; bar.append(s);
      }
      if (document.fullscreenEnabled) { const f = document.createElement('button'); f.innerHTML = A.txt(def.ruby ? '《大|おお》きく《見|み》る' : '大きく見る'); f.onclick = () => { const w = root.querySelector('.cvw'); document.fullscreenElement ? document.exitFullscreen() : w.requestFullscreen().then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {}); }; bar.append(f); }
      const r = document.createElement('button'); r.textContent = 'はじめから'; r.onclick = () => { buildScene(false); }; bar.append(r);
      for (const c of (sc.controls || [])) addCtl(c);
      setPlay(false);
      draw();
      if (sc.autoplay && !window.__ANIM_TEST) setPlay(true);
    }
    function addCtl(c) {
      if (c.button) { const b = document.createElement('button'); b.innerHTML = A.txt(c.button); b.onclick = () => { c.act(st, api()); syncCtl(); redraw(); }; bar.append(b); return; }
      const lab = document.createElement('label'); lab.innerHTML = A.txt(c.label || '');
      if (c.range) {
        const k = c.range, id = 'c_' + k;
        const r = document.createElement('input'); r.type = 'range'; r.id = id; lab.htmlFor = id; r.min = c.min; r.max = c.max; r.step = c.step || (c.max - c.min) / 200;
        const o = document.createElement('output'); o.htmlFor = id;
        const dec = c.step ? Math.min(6, (String(c.step).split('.')[1] || '').length + (/e-/.test(String(c.step)) ? 6 : 0)) : 3;
        const f0 = c.fmt || (v => A.num(v, c.d == null ? 2 : c.d));
        const fmt = v => f0(+(+v).toFixed(dec));   // 再生中の値も、刻みのけたに丸めて出す
        const sync = () => { r.value = st[k]; o.innerHTML = A.txt(fmt(+st[k])); };
        r.oninput = () => { st[k] = +r.value; if (c.on) c.on(st, api()); o.innerHTML = A.txt(fmt(st[k])); redraw(); };
        ctl.append(lab, r, o); sync(); ctrls.push({ sync, k });
      } else if (c.seg) {
        const k = c.seg, box = document.createElement('div'); box.className = 'seg'; box.setAttribute('role', 'group');
        const bs = c.options.map(([v, t]) => { const b = document.createElement('button'); b.innerHTML = A.txt(t); b.onclick = () => { st[k] = v; if (c.on) c.on(st, api()); sync(); redraw(); }; box.append(b); return [v, b]; });
        const sync = () => bs.forEach(([v, b]) => b.setAttribute('aria-pressed', st[k] === v));
        ctl.append(lab, box); sync(); ctrls.push({ sync, k });
      } else if (c.check) {
        const k = c.check, box = document.createElement('div'); box.className = 'chk';
        const x = document.createElement('input'); x.type = 'checkbox'; x.id = 'c_' + k; const l2 = document.createElement('label'); l2.htmlFor = x.id; l2.innerHTML = ' ' + A.txt(c.text || '');
        x.onchange = () => { st[k] = x.checked; if (c.on) c.on(st, api()); redraw(); };
        const sync = () => { x.checked = !!st[k]; };
        box.append(x, l2); ctl.append(lab, box); sync(); ctrls.push({ sync, k });
      }
    }
    if (def.scenes.length > 1) def.scenes.forEach((sc, k) => { const b = document.createElement('button'); b.setAttribute('role', 'tab'); b.innerHTML = A.txt(sc.label || ('場面' + (k + 1))); b.onclick = () => { si = k; history.replaceState(null, '', '#' + sc.key); buildScene(false); }; nav.append(b); });
    else nav.hidden = true;
    // ドラッグ（キャンバスの座標で渡す）
    let drag = null;
    const pos = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    canvas.addEventListener('pointerdown', e => { const d = scene().drag; if (!d) return; const [x, y] = pos(e); const h = d.hit(st, x, y, api()); if (h == null || h === false) return; drag = h; canvas.setPointerCapture(e.pointerId); d.move && d.move(st, x, y, api(), drag); syncCtl(); redraw(); e.preventDefault(); });
    canvas.addEventListener('pointermove', e => { const d = scene().drag; if (!d) return; const [x, y] = pos(e); if (drag != null) { d.move(st, x, y, api(), drag); syncCtl(); redraw(); } else canvas.style.cursor = d.hit(st, x, y, api()) != null && d.hit(st, x, y, api()) !== false ? 'grab' : ''; });
    const up = () => { if (drag != null && scene().drag.end) scene().drag.end(st, api(), drag); drag = null; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    // #場面&名前=値 で、場面と値を決めて開く（PDF からのリンク）
    function fromHash() {
      const h = decodeURIComponent(location.hash.slice(1)).split('&');
      const k = def.scenes.findIndex(s => s.key === h[0]);
      if (k >= 0) si = k;
      buildScene(false);
      for (const kv of h.slice(1)) { const [a, b] = kv.split('='); if (a in st) { st[a] = b === 'true' ? true : b === 'false' ? false : isNaN(+b) ? b : +b; const c = (scene().controls || []).find(c => (c.range || c.seg || c.check) === a); if (c && c.on) c.on(st, api()); } }
      if (h.length > 1 && scene().onhash) scene().onhash(st, api());
      syncCtl(); draw();
    }
    window.addEventListener('hashchange', fromHash);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); draw(); });
    window.addEventListener('resize', () => { const d = Math.min(3, window.devicePixelRatio || 1); if (d !== cv.dpr) { cv.resize(); draw(); } });
    fromHash();
    // 自動の確かめ（anim/build/check.js）が使う
    window.__ANIM = { def, scenes: def.scenes.map(s => s.key), setScene(k) { si = k; buildScene(false); }, run(sec) { const sc = scene(); if (sc.step) { let t = 0; while (t < sec) { const r = sc.step(st, 1 / 60, api()); t += 1 / 60; if (r === false) break; } } syncCtl(); draw(); },
      set(o) { Object.assign(st, o); syncCtl(); draw(); }, redraw() { syncCtl(); draw(); }, state: () => st, controls: () => (scene().controls || []).length };
  };

  // ---------- よく使う計算 ----------
  // π の倍数の目もり：0・π/4・π/2・3π/4・π・3π/2・2π …（den は分母の上限）
  A.pi = (v, den = 4) => {
    for (const d of [1, 2, 3, 4, 6, 8].filter(d => d <= den)) { const n = Math.round(v / Math.PI * d); if (Math.abs(n * Math.PI / d - v) < 1e-6) { if (n === 0) return '0'; const g = (a, b) => b ? g(b, a % b) : a, k = g(Math.abs(n), d), nn = n / k, dd = d / k; const top = (nn === 1 ? '' : nn === -1 ? '−' : A.num(nn, 0)) + 'π'; return dd === 1 ? top : top + '/' + dd; } }
    return A.num(v, 2);
  };
  A.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  A.lerp = (a, b, t) => a + (b - a) * t;
  A.range = (a, b, step = 1) => { const r = []; for (let x = a; x <= b + 1e-9; x += step) r.push(+x.toFixed(10)); return r; };
  A.near = (x1, y1, x2, y2, r = 18) => Math.hypot(x1 - x2, y1 - y2) <= r;
  // 乱数（種を決めると毎回同じ。本の図と同じ点を出すため）
  A.rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  A.gauss = r => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  // ルンゲ・クッタ（4次）：y は配列、f(t, y) は導関数の配列
  A.rk4 = (f, t, y, h) => { const k1 = f(t, y), k2 = f(t + h / 2, y.map((v, i) => v + h / 2 * k1[i])), k3 = f(t + h / 2, y.map((v, i) => v + h / 2 * k2[i])), k4 = f(t + h, y.map((v, i) => v + h * k3[i])); return y.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); };
})();
