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
      count: Math.max(1, Math.min(120, +$('#count').value || 20)),
      steps: ['s1', 's2', 's3', 'trap'].filter(s => $('#st-' + s).checked),
      mix: $('#mix').checked,
      seed: (+$('#seed').value >>> 0) || 1,
      ruby: $('#ruby').checked,
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
      vol: +p.get('v') || 1, ids: p.get('w') || '', count: +p.get('n') || 20,
      steps: (p.get('s') || 's1,s2,s3').split(',').filter(Boolean), mix: p.get('m') === '1',
      seed: +p.get('seed') || 1, ruby: p.get('r') !== '0', name: p.get('t') || '',
    };
  }

  // ---------------------------------------------------------------- わざの一覧
  function renderCatalog(vol) {
    const ids = M.list(vol);
    const parts = M.parts[vol] || [];
    let html = '';
    parts.forEach(pt => {
      const list = ids.filter(id => M.waza[id].part === pt.no);
      if (!list.length) return;
      html += `<h3>第${pt.no}部　${H(pt.name, { noRuby: true })}</h3><ul>`;
      list.forEach(id => {
        const d = M.waza[id];
        html += `<li><button type="button" class="pick" data-id="${id}">${id}</button> ${H(d.title, { noRuby: true })}${d.stars > 1 ? ' <span class="star">★★</span>' : ''}</li>`;
      });
      html += '</ul>';
    });
    $('#catalog').innerHTML = html || '<p>この巻のわざは、まだありません。</p>';
    $('#catalog').querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => {
      const cur = $('#ids').value.trim();
      const ids0 = M.parseIds(cur, vol);
      if (!ids0.includes(b.dataset.id)) $('#ids').value = (cur ? cur + ', ' : '') + b.dataset.id;
      make();
    }));
  }

  // ---------------------------------------------------------------- プリント
  function sheetHead(st, title, kind, pageNo, pages) {
    return `<header class="head">
      <div class="ttl">${title}${kind ? `<span class="kind">${kind}</span>` : ''}</div>
      <div class="meta"><span>なまえ<span class="line"></span></span><span>${H('《月|がつ》', { noRuby: !st.ruby })}<span class="line short"></span>${H('《日|にち》', { noRuby: !st.ruby })}<span class="line short"></span></span></div>
      <div class="sub">たねの ばんごう ${st.seed}　${pages > 1 ? `（${pageNo}／${pages}）` : ''}</div>
    </header>`;
  }
  function titleOf(st, ids) {
    if (st.name) return H(st.name, { noRuby: !st.ruby });
    if (ids.length === 1) { const d = M.waza[ids[0]]; return `<span class="chip">わざ ${ids[0]}</span>${H(d.title, { noRuby: !st.ruby })}`; }
    return `<span class="chip">わざ ${ids.length}こ</span>${ids.join('・')}`;
  }
  function make() {
    const st = state();
    history.replaceState(null, '', toHash(st));
    const ids = M.parseIds(st.ids, st.vol).filter(id => M.waza[id]);
    const unknown = M.parseIds(st.ids, st.vol).filter(id => !M.waza[id]);
    $('#msg').textContent = unknown.length ? `まだない わざの番号：${unknown.join('、')}` : '';
    const out = $('#sheets');
    if (!ids.length) { out.innerHTML = '<p class="empty">わざの番号を入れてください（例：1-37、37、33〜40）。</p>'; return; }
    const probs = M.makePrint(ids, { seed: st.seed, steps: st.steps, count: st.count, mix: st.mix });
    const oneCol = ids.some(id => (M.waza[id].cols || 2) === 1);
    const per = oneCol ? 12 : 24;   // 1ページの問題の数（2列なら 12行×2）
    const pages = Math.max(1, Math.ceil(probs.length / per));
    const title = titleOf(st, ids);
    let html = '';
    for (let pg = 0; pg < pages; pg++) {
      const list = probs.slice(pg * per, (pg + 1) * per);
      html += `<section class="sheet">${sheetHead(st, title, st.mix ? '見わけよう' : '', pg + 1, pages)}
        ${st.mix ? '<p class="note">まず、 つかう わざの ばんごうを 「わざ」に 書いてから とこう。 つかう わざが ない ときは「ー」。</p>' : ''}
        <ol class="probs ${oneCol ? 'one' : 'two'}" start="${pg * per + 1}">`;
      list.forEach(p => {
        const w = M.waza[p.id];
        const box = `<span class="box" style="min-width:${(w.boxw || '15mm')}"></span>`;
        html += `<li><span class="q">${H(M.withBox(p.q), { noRuby: !st.ruby, box })}</span>${st.mix ? '<span class="wz">わざ<span class="box sm"></span></span>' : ''}</li>`;
      });
      html += `</ol><footer class="foot">『物理を理解するための数学 問題集』第${st.vol}巻　練習プリント</footer></section>`;
    }
    // こたえ
    html += `<section class="sheet answers">${sheetHead(st, title, 'こたえ', 1, 1)}<ol class="ans">`;
    probs.forEach(p => {
      const tag = st.mix || ids.length > 1 ? `<span class="wtag">${p.step === 'trap' ? 'わざ なし' : 'わざ ' + p.id}</span>` : '';
      html += `<li><b>${H(p.a, { noRuby: !st.ruby })}</b>${p.easy ? `<span class="easy">［${H(p.easy, { noRuby: !st.ruby })}］</span>` : ''}${tag}<span class="stp">${STEP_LABEL[p.step]}</span></li>`;
    });
    html += `</ol><footer class="foot">［ ］の中は らくな かたち。　たねの ばんごう ${st.seed}</footer></section>`;
    out.innerHTML = html;
  }

  function init() {
    const vols = [...new Set(M.list().map(id => M.waza[id].vol))].sort();
    $('#vol').innerHTML = vols.map(v => `<option value="${v}">第${v}巻</option>`).join('');
    const h = fromHash();
    if (h) setState(h); else $('#seed').value = 1 + Math.floor(Math.random() * 99999);
    renderCatalog(+$('#vol').value);
    $('#vol').addEventListener('change', () => { renderCatalog(+$('#vol').value); make(); });
    $('#make').addEventListener('click', make);
    $('#print').addEventListener('click', () => { make(); window.print(); });
    $('#dice').addEventListener('click', () => { $('#seed').value = 1 + Math.floor(Math.random() * 99999); make(); });
    ['#ids', '#count', '#seed', '#title'].forEach(s => $(s).addEventListener('change', make));
    ['#mix', '#ruby', '#st-s1', '#st-s2', '#st-s3', '#st-trap'].forEach(s => $(s).addEventListener('change', make));
    $('#ids').addEventListener('keydown', e => { if (e.key === 'Enter') make(); });
    $('#nwaza').textContent = M.list().length;
    make();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
