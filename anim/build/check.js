// 補助教材のアニメーションの自動の確かめ：node anim/build/check.js [id …] [--shots フォルダ]
//   各ページの各場面を開いて、1.5秒ぶん動かし、次を確かめる：
//   ・エラー（pageerror・console.error）が0
//   ・キャンバスに何かが描かれている（まっ白でない）
//   ・幅 390px（スマートフォン）で横にはみ出さない
//   ・ファイルの大きさ（200 KB をこえたら注意）
//   --shots を付けると、場面ごとの画像を保存する（画像で見て確かめるため）
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const DIST = path.resolve(__dirname, '..', 'dist');
const args = process.argv.slice(2);
let shots = null;
const si = args.indexOf('--shots'); if (si >= 0) { shots = args[si + 1]; args.splice(si, 2); fs.mkdirSync(shots, { recursive: true }); }
const ids = args.length ? args : fs.readdirSync(DIST).filter(f => /^[mp]\d-\d\d.*\.html$/.test(f)).map(f => f.replace(/\.html$/, '')).sort();
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const id of ids) {
    const file = path.join(DIST, id + '.html');
    if (!fs.existsSync(file)) { console.log(`✗ ${id}：dist にない（mk_anim.js で組み立てる）`); bad++; continue; }
    const size = fs.statSync(file).size;
    const errs = [];
    // 900px：場面ごとに #key で開き直す（PDF のビューアからのリンクと同じ開き方）
    let keys = [];
    {
      const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
      p.on('pageerror', e => errs.push(`900px：${e.message}`));
      await p.addInitScript(() => { window.__ANIM_TEST = true; });
      await p.goto('file://' + file); await p.waitForTimeout(100);
      keys = await p.evaluate(() => window.__ANIM ? window.__ANIM.scenes : []);
      await p.close();
    }
    if (!keys.length) errs.push('場面がない（A.item が動いていない）');
    for (let k = 0; k < keys.length; k++) {
      const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
      p.on('pageerror', e => errs.push(`900px 場面 ${keys[k]}：${e.message}`));
      p.on('console', m => { if (m.type() === 'error') errs.push(`900px 場面 ${keys[k]}：${m.text()}`); });
      await p.addInitScript(() => { window.__ANIM_TEST = true; });
      await p.goto('file://' + file + '#' + keys[k]); await p.waitForTimeout(120);
      try {
        const r = await p.evaluate(() => {
          window.__ANIM.run(1.5);
          const c = document.querySelector('canvas.an'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          let ink = 0; for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 0) ink++;
          return { ink };
        });
        if (r.ink < 50) errs.push(`900px 場面 ${keys[k]}：キャンバスがほとんど空`);
        if (shots) await (await p.$('main.an')).screenshot({ path: path.join(shots, `${id}_${k + 1}_${keys[k]}.png`) });
      } catch (e) { errs.push(`900px 場面 ${keys[k]}：${e.message.split('\n')[0]}`); }
      await p.close();
    }
    // 390px（スマートフォン）：横にはみ出さないか
    {
      const p = await b.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
      p.on('pageerror', e => errs.push(`390px：${e.message}`));
      await p.addInitScript(() => { window.__ANIM_TEST = true; });
      await p.goto('file://' + file); await p.waitForTimeout(100);
      for (let k = 0; k < keys.length; k++) {
        try {
          const over = await p.evaluate(k => { window.__ANIM.setScene(k); window.__ANIM.run(0.5); return document.documentElement.scrollWidth - window.innerWidth; }, k);
          if (over > 2) errs.push(`390px 場面 ${keys[k]}：横に ${over}px はみ出す`);
        } catch (e) { errs.push(`390px 場面 ${keys[k]}：${e.message.split('\n')[0]}`); }
      }
      await p.close();
    }
    const warn = size > 200 * 1024 ? `（大きさ ${Math.round(size / 1024)} KB：200 KB をこえる）` : '';
    if (errs.length) { bad++; console.log(`✗ ${id} ${Math.round(size / 1024)} KB\n   ` + errs.slice(0, 8).join('\n   ')); }
    else console.log(`✓ ${id} ${Math.round(size / 1024)} KB ${warn}`);
  }
  await b.close();
  console.log(bad ? `直すもの：${bad} 項目` : 'すべて通った');
  process.exitCode = bad ? 1 : 0;
})();
