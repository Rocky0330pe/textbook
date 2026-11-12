/* 練習プリント自動作成アプリ（第28回 M-9・第29回）
 * ・わざの番号を入れると、そのわざの問題の A4 プリントと、こたえのページを作る。
 * ・問題は core.js と v1/*.js（本と同じ作り方）で作る。生成AIもサーバーも使わない。
 * ・同じ「たねの番号」なら、同じプリントになる。設定はアドレスの # のあとにも書くので、そのまま共有できる。 */
(function () {
  'use strict';
  const M = globalThis.MONDAI;
  const $ = s => document.querySelector(s);
  const H = (s, o) => M.toHTML(s, o);
  const STEP_LABEL = { s1: 'ステップ1', s2: 'ステップ2', s3: 'ステップ3', trap: 'わな' };

  function state() {
    return {
      vol: +$('#vol').value,
      ids: $('#ids').value,
      count: Math.max(10, Math.min(100, +$('#count').value || 20)),   // 問題の数は 10〜100（依頼者 11月6日）
      steps: ['s1', 's2', 's3', 'trap'].filter(s => $('#st-' + s).checked),
      mix: $('#mix').checked,
      seed: (+$('#seed').value >>> 0) || 1,
      ruby: $('#ruby').checked && +$('#vol').value < 4,   // 第4巻からはルビなし（教科書と同じ。第35回）
      name: $('#title').value,
    };
  }
  function setState(st) {
    if (st.vol) $('#vol').value = st.vol;
    if (st.ids != null) $('#ids').value = st.ids;
    if (st.count) $('#count').value = st.count;
    if (st.steps) ['s1', 's2', 's3', 'trap'].forEach(s => { $('#st-' + s).checked = st.steps.includes(s); });
    if (st.mix != null) $('#mix').checked = st.mix;
    if (st.seed) $('#seed').value = st.seed;
    if (st.ruby != null) $('#ruby').checked = st.ruby;
    if (st.name != null) $('#title').value = st.name;
  }
  function toHash(st) {
    const p = new URLSearchParams({ v: st.vol, w: st.ids, n: st.count, s: st.steps.join(','), m: st.mix ? 1 : 0, seed: st.seed, r: st.ruby ? 1 : 0 });
    if (st.name) p.set('t', st.name);
    return '#' + p.toString();
  }
  function fromHash() {
    const h = location.hash.replace(/^#/, '');
    if (!h) return null;
    const p = new URLSearchParams(h);
    return {
      vol: +p.get('v') || 1, ids: p.get('w') || '', count: Math.max(10, Math.min(100, +p.get('n') || 20)),
      steps: (p.get('s') || 's1,s2,s3').split(',').filter(Boolean), mix: p.get('m') === '1',
      seed: +p.get('seed') || 1, ruby: p.get('r') !== '0', name: p.get('t') || '',
    };
  }

  // ---------------------------------------------------------------- わざの一覧
  // わざの一覧：巻ごとのタブ、部ごとにたたむ、番号・名前でさがす（依頼者 11月6日）
  function renderCatalog(vol) {
    const vols = [...new Set(M.list().map(id => M.waza[id].vol))].sort();
    $('#vtabs').innerHTML = vols.map(v => `<button type="button" class="vtab${v === vol ? ' on' : ''}" data-v="${v}">第${v}巻<span class="n">${M.list(v).length}</span></button>`).join('');
    $('#vtabs').querySelectorAll('.vtab').forEach(b => b.addEventListener('click', () => {
      const v = +b.dataset.v;
      if (v === +$('#vol').value) return;
      $('#vol').value = v; $('#wsearch').value = '';
      renderCatalog(v); make();
    }));
    const q = ($('#wsearch').value || '').trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[ー－―−]/g, '-');
    const chosen = new Set(M.parseIds($('#ids').value, vol));
    const ids = M.list(vol);
    const parts = M.parts[vol] || [];
    let html = '', shown = 0;
    parts.forEach(pt => {
      const all = ids.filter(id => M.waza[id].part === pt.no);
      if (!all.length) return;
      const hit = id => !q || id.includes(q) || id.split('-')[1] === q.padStart(2, '0') || M.plain(M.waza[id].title).replace(/\s/g, '').includes(q.replace(/\s/g, ''));
      const list = all.filter(hit);
      if (!list.length) return;
      shown += list.length;
      const open = q || list.some(id => chosen.has(id));
      html += `<details class="wpart"${open ? ' open' : ''}><summary>第${pt.no}部　${H(pt.name, { noRuby: true })}<span class="n">${list.length}こ</span></summary><ul>`;
      list.forEach(id => {
        const d = M.waza[id];
        html += `<li><button type="button" class="pick${chosen.has(id) ? ' on' : ''}" data-id="${id}">${id}</button> ${H(d.title, { noRuby: true })}${d.stars > 1 ? ' <span class="star">★★</span>' : ''}</li>`;
      });
      html += '</ul></details>';
    });
    $('#catalog').innerHTML = html || (q ? '<p>見つかりませんでした。</p>' : '<p>この巻のわざは、まだありません。</p>');
    $('#catalog').querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => {
      const cur = $('#ids').value.trim();
      const ids0 = M.parseIds(cur, vol);
      if (!ids0.includes(b.dataset.id)) $('#ids').value = (cur ? cur + ', ' : '') + b.dataset.id;
      b.classList.add('on');
      make();
    }));
  }

  // ---------------------------------------------------------------- プリント
  function sheetHead(st, title, kind, pageNo, pages) {
    return `<header class="head">
      <div class="ttl">${title}${kind ? `<span class="kind">${kind}</span>` : ''}</div>
      <div class="meta"><span>なまえ<span class="line"></span></span><span>${H('《月|がつ》', { noRuby: !st.ruby })}<span class="line short"></span>${H('《日|にち》', { noRuby: !st.ruby })}<span class="line short"></span></span></div>
      <div class="sub">${st.vol > 1 ? H('たねの《番号|ばん|ごう》', { noRuby: !st.ruby }) : 'たねの ばんごう'} ${st.seed}　${pages > 1 ? `（${pageNo}／${pages}）` : ''}</div>
    </header>`;
  }
  function titleOf(st, ids) {
    if (st.name) return `<span class="tt">${H(st.name, { noRuby: !st.ruby })}</span>`;
    if (ids.length === 1) { const d = M.waza[ids[0]]; return `<span class="chip">わざ ${ids[0]}</span><span class="tt">${H(d.title, { noRuby: !st.ruby })}</span>`; }
    // 続く番号は「1-33〜1-40」とまとめる。番号の途中では改行しない（第29回 R2-23）
    const all = M.list(st.vol), runs = [];
    ids.slice().sort((a, b) => all.indexOf(a) - all.indexOf(b)).forEach(id => {
      const last = runs[runs.length - 1];
      const num = x => +x.split('-')[1];
      if (last && all.indexOf(id) === all.indexOf(last[1]) + 1 && num(id) === num(last[1]) + 1) last[1] = id; else runs.push([id, id]);
    });
    let lst = runs.map(([a, b]) => `<span class="nw">${a === b ? a : a + '〜' + b}</span>`);
    if (lst.length > 5) lst = [lst[0], lst[1], '…', lst[lst.length - 1]];
    return `<span class="chip">わざ ${ids.length}こ</span><span class="ids">${lst.join('・')}</span>`;
  }
  function make() {
    const st = state();
    history.replaceState(null, '', toHash(st));
    const parsed = M.parseIds(st.ids, st.vol);
    const ids = parsed.filter(id => M.waza[id]);
    const unknown = parsed.filter(id => !M.waza[id]);
    const msgs = [];
    if (unknown.length) msgs.push(`まだない わざの番号：${unknown.join('、')}`);
    if (parsed.bad && parsed.bad.length) msgs.push(`読めない書き方：${parsed.bad.join('、')}（例：1-37、37、33〜40、33-40、2, 7, 37）`);
    if (!st.steps.length) msgs.push('ステップが1つも えらばれていないので、ステップ1〜3で作りました。');
    const out = $('#sheets');
    if (!ids.length) { $('#msg').textContent = msgs.join('　'); out.innerHTML = '<p class="empty">わざの番号を入れてください（例：1-37、37、33〜40）。</p>'; return; }
    const probs = M.makePrint(ids, { seed: st.seed, steps: st.steps, count: st.count, mix: st.mix });
    if (probs.length < st.count) msgs.push(`このわざ・ステップでは、ちがう問題が ${probs.length}問までしか作れませんでした（${st.count}問の かわりに ${probs.length}問）。ステップを ふやすと、問題が ふえます。`);
    $('#msg').textContent = msgs.join('　');
    const oneCol = probs.some(p => M.colsOf(M.waza[p.id], p.step) === 1);
    // 式（$…$）の問題は、分数などで行が高くなるので、行の高さを中身に合わせ、1ページの数を減らす（第2巻から）
    const mathy = probs.some(p => /\$/.test(String(p.q) + String(p.a)));
    const figs = probs.some(p => p.fig);
    const per = figs ? (oneCol ? 5 : 8) : mathy ? (oneCol ? 11 : 16) : (oneCol ? 12 : 24);   // 1ページの問題の数（2列なら 12行×2）。図があると少なく（第35回）
    const pages = Math.max(1, Math.ceil(probs.length / per));
    const title = titleOf(st, ids);
    // 問題のプリントと、こたえ（とき方）のプリントを、同じ問題・同じならびで作る
    const cell = (p, ans) => {
      const w = M.waza[p.id];
      // まぜるときは、欄のはばを 15mm より せまくしない（欄のはばが わざの手がかりに ならないように。R2-20）
      const bw0 = M.boxwOf(w, p.step) || '15mm';
      const bw = st.mix && parseFloat(bw0) < 15 ? '15mm' : bw0;
      const q = M.withBox(p.q);
      const len = M.plain(q).replace(/\s/g, '').length;
      let body;
      if (!ans) {
        const bh = M.boxhOf(w, p.step);
        body = H(q, { noRuby: !st.ruby, box: `<span class="box" style="min-width:${bw}${bh ? `;height:${bh}` : ''}"></span>` });
      } else {
        // 欄に答えを書きこむ。欄が2つ以上なら、答えの中の数を順に入れる（合わなければ欄の外に答えを書く）
        const nBox = (q.match(/□/g) || []).length;
        const nums = String(M.plain(p.a)).match(/(?<![0-9a-zA-Z.])-?\d+(?:\.\d+)?(?:\/\d+)?/g) || [];   // マイナスの数も（第30回）
        let k = 0;
        // 式（$…$）の答えで欄が2つ以上のときは、欄に分けず、欄の外に答えを書く（変域・不等式などをまちがって分けないように）
        const fill = nBox === 1 ? [p.a] : (!String(p.a).includes('$') && nums.length === nBox ? nums : null);
        const parts = H(q, { noRuby: !st.ruby, box: '\u0004' }).split('\u0004');
        body = parts.map((t, i) => i === 0 ? t : `<span class="box filled" style="min-width:${bw}">${fill ? H(String(fill[k++]), { noRuby: !st.ruby }) : ''}</span>` + t).join('');
        if (!fill) body += ` <b class="ansout">${H(p.a, { noRuby: !st.ruby })}</b>`;
      }
      let extra = '';
      if (st.mix) {
        const u = M.usableWaza(p, ids);
        extra = ans ? `<span class="wz ansz">${u.length ? 'わざ ' + u.join('・') : 'なし'}</span>` : '<span class="wz">わざ<span class="box sm"></span></span>';
      }
      const how = ans && p.easy ? `<span class="how">${H(st.vol > 1 ? '《解|と》き《方|かた》' : 'とき《方|かた》', { noRuby: !st.ruby })} ［${H(p.easy, { noRuby: !st.ruby, box: '<span class="sq"></span>' })}］</span>` : '';
      const fig = p.fig ? `<div class="qfig">${M.figSVG(p.fig)}</div>` : '';   // 図（第4巻から。第35回）
      return `<li class="${len > (oneCol ? 40 : 15) ? 'long' : ''}${ans ? ' a' : ''}${p.fig ? ' hasfig' : ''}"><span class="q">${body}</span>${fig}${extra}${how}</li>`;
    };
    const ruleBox = () => {
      // こたえの1ページめに、わざの「楽な形」のまとめ（わざが3つまでのとき）
      if (ids.length > 3) return '';
      return '<div class="summary">' + ids.map(id => {
        const d = M.waza[id];
        return `<div class="sm1"><span class="chip">わざ ${id}</span> <b>${H(d.title, { noRuby: !st.ruby })}</b><div class="raku">${d.raku.map(l => H(l, { noRuby: !st.ruby, box: '<span class="sq"></span>' })).join('<br>')}</div></div>`;
      }).join('') + '</div>';
    };
    let html = '';
    // ひっ算がまざるときは、方眼の大きさで A4 につめる（問題と こたえは同じつめ方）
    if (probs.some(p => p.hs)) { out.innerHTML = hissanPages(st, probs, ids, title); return; }
    for (const ans of [false, true]) {
      for (let pg = 0; pg < pages; pg++) {
        const list = probs.slice(pg * per, (pg + 1) * per);
        const kind = (st.mix ? H('《見|み》わけよう', { noRuby: !st.ruby }) : '') + (ans ? (st.mix ? '・' : '') + H(st.vol > 1 ? '《答|こた》えと《解|と》き《方|かた》' : 'こたえと とき《方|かた》', { noRuby: !st.ruby }) : '');
        html += `<section class="sheet ${ans ? 'answers' : 'questions'}">${sheetHead(st, title, kind, pg + 1, pages)}
          ${!ans && st.mix ? `<p class="note">${H(st.vol > 1 ? 'まず、《使|つか》うわざの《番号|ばん|ごう》を「わざ」に《書|か》いてから《解|と》きましょう。《使|つか》えるわざがないときは「なし」と《書|か》きます。' : 'まず、 つかう わざの ばんごうを 「わざ」に 《書|か》いてから とこう。 つかえる わざが ない ときは 「なし」と 《書|か》こう。', { noRuby: !st.ruby })}</p>` : ''}
          ${ans && pg === 0 ? ruleBox() : ''}
          <ol class="probs ${oneCol ? 'one' : 'two'}${mathy ? ' auto' : ''}${ans ? ' withhow' : ''}" style="counter-reset:q ${pg * per}">`;
        list.forEach(p => { html += cell(p, ans); });
        html += `</ol><footer class="foot">${ans ? H(st.vol > 1 ? '［ ］の《中|なか》は《楽|らく》な《解|と》き《方|かた》。　' : '［ ］の 《中|なか》は らくな とき《方|かた》。　', { noRuby: !st.ruby }) : ''}『物理を理解するための数学 問題集』第${st.vol}巻　練習プリント　${st.vol > 1 ? 'たねの番号' : 'たねの ばんごう'} ${st.seed}</footer></section>`;
      }
    }
    out.innerHTML = html;
  }

  function hissanPages(st, probs, ids, title) {
    const PW = 182, PH = 222, GAP = 6;
    // ならべる：左から右、入らなければ次の行、入らなければ次のページ。ますが 8mm で ページが ふえるときは 7mm にする
    const pack = CELL => {
      const items = probs.map((p, i) => {
        if (p.hs) {
          const L = M.hissanLayout(p.hs);
          return { p, i, L, w: Math.max(L.W * CELL, 18) + 2, h: (L.H + (L.top || 0)) * CELL + 8 };
        }
        return { p, i, w: 86, h: 17 };
      });
      const pages = [[]];
      let x = 0, y = 0, rowH = 0;
      items.forEach(it => {
        if (x > 0 && x + it.w > PW) { x = 0; y += rowH + GAP; rowH = 0; }
        if (y > 0 && y + it.h > PH) { pages.push([]); x = 0; y = 0; rowH = 0; }
        pages[pages.length - 1].push(it);
        x += it.w + GAP; rowH = Math.max(rowH, it.h);
      });
      return pages;
    };
    let CELL = 8, pages = pack(8);
    if (pages.length > 1) { const p7 = pack(7); if (p7.length < pages.length) { CELL = 7; pages = p7; } }
    const sq = { noRuby: !st.ruby, box: '<span class="sq"></span>' };
    let html = '';
    for (const ans of [false, true]) {
      pages.forEach((pg, k) => {
        html += `<section class="sheet ${ans ? 'answers' : 'questions'}">${sheetHead(st, title, ans ? H(st.vol > 1 ? '《答|こた》えと《解|と》き《方|かた》' : 'こたえと とき《方|かた》', { noRuby: !st.ruby }) : '', k + 1, pages.length)}<div class="hsflow">`;
        pg.forEach(it => {
          const p = it.p;
          if (p.hs) {
            html += `<div class="hsi" style="width:${it.w}mm"><span class="n">(${it.i + 1})</span>${ans ? ` <b class="ansout${M.plain(p.a).length > 5 ? ' long' : ''}">${H(p.a, sq)}</b>` : ''}<br>${M.hissanSVG(it.L, { cell: CELL, answer: ans })}${ans && p.easy ? `<div class="how">${H(p.easy, sq)}</div>` : ''}</div>`;
          } else {
            const q = M.withBox(p.q);
            const body = ans ? H(q, { noRuby: !st.ruby, box: `<span class="box filled">${H(p.a, sq)}</span>` }) : H(q, { noRuby: !st.ruby });
            html += `<div class="hsi txt" style="width:${it.w}mm"><span class="n">(${it.i + 1})</span> ${body}${ans && p.easy ? `<div class="how">${H('とき《方|かた》', sq)} ［${H(p.easy, sq)}］</div>` : ''}</div>`;
          }
        });
        html += `</div><footer class="foot">${ans ? H('《赤|あか》い 《字|じ》が こたえと とちゅうの けいさん。　', sq) : ''}『物理を理解するための数学 問題集』第${st.vol}巻　練習プリント　${st.vol > 1 ? 'たねの番号' : 'たねの ばんごう'} ${st.seed}</footer></section>`;
      });
    }
    return html;
  }

  // せまい画面では、見本のプリントを画面のはばに縮める（CSS の --z。印刷には効かない）
  function fit() {
    const a4 = 216 / 25.4 * 96;
    document.documentElement.style.setProperty('--z', String(Math.min(1, (window.innerWidth - 4) / a4)));
  }
  function init() {
    fit(); window.addEventListener('resize', fit);
    const vols = [...new Set(M.list().map(id => M.waza[id].vol))].sort();
    $('#vol').innerHTML = vols.map(v => `<option value="${v}">第${v}巻</option>`).join('');
    const h = fromHash();
    if (h) setState(h); else $('#seed').value = 1 + Math.floor(Math.random() * 99999);
    renderCatalog(+$('#vol').value);
    $('#vol').addEventListener('change', () => { renderCatalog(+$('#vol').value); make(); });
    $('#wsearch').addEventListener('input', () => renderCatalog(+$('#vol').value));
    $('#ids').addEventListener('change', () => renderCatalog(+$('#vol').value));
    $('#make').addEventListener('click', make);
    // 印刷：問題と こたえ・問題だけ・こたえだけ
    const printAs = mode => { make(); document.body.dataset.print = mode; window.print(); };
    $('#print').addEventListener('click', () => printAs('both'));
    $('#printq').addEventListener('click', () => printAs('q'));
    $('#printa').addEventListener('click', () => printAs('a'));
    window.addEventListener('afterprint', () => { delete document.body.dataset.print; });
    $('#dice').addEventListener('click', () => { $('#seed').value = 1 + Math.floor(Math.random() * 99999); make(); });
    ['#ids', '#count', '#seed', '#title'].forEach(s => $(s).addEventListener('change', make));
    ['#mix', '#ruby', '#st-s1', '#st-s2', '#st-s3', '#st-trap'].forEach(s => $(s).addEventListener('change', make));
    $('#ids').addEventListener('keydown', e => { if (e.key === 'Enter') make(); });
    $('#nwaza').textContent = M.list().length;
    // アドレスの # のあとが変わったら（共有されたアドレスを貼ったときなど）、その設定で作り直す
    window.addEventListener('hashchange', () => { const h2 = fromHash(); if (h2) { setState(h2); renderCatalog(+$('#vol').value); make(); } });
    make();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
