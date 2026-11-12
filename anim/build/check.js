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
    for (const vw of [900, 390]) {
      const p = await b.newPage({ viewport: { width: vw, height: 900 }, deviceScaleFactor: 1 });
      p.on('pageerror', e => errs.push(`${vw}px：${e.message}`));
      p.on('console', m => { if (m.type() === 'error') errs.push(`${vw}px：${m.text()}`); });
      await p.addInitScript(() => { window.__ANIM_TEST = true; });
      await p.goto('file://' + file);
      await p.waitForTimeout(150);
      const n = await p.evaluate(() => window.__ANIM ? window.__ANIM.scenes.length : 0);
      if (!n) { errs.push(`${vw}px：場面がない（A.item が動いていない）`); await p.close(); continue; }
      for (let k = 0; k < n; k++) {
        const r = await p.evaluate(k => {
          window.__ANIM.setScene(k); window.__ANIM.run(1.5);
          const c = document.querySelector('canvas.an'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
          let ink = 0; for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 0) ink++;
          return { ink, over: document.documentElement.scrollWidth - window.innerWidth, key: window.__ANIM.scenes[k] };
        }, k);
        if (r.ink < 50) errs.push(`${vw}px 場面 ${r.key}：キャンバスがほとんど空`);
        if (r.over > 2) errs.push(`${vw}px 場面 ${r.key}：横に ${r.over}px はみ出す`);
        if (shots && vw === 900) await (await p.$('main.an')).screenshot({ path: path.join(shots, `${id}_${k + 1}_${r.key}.png`) });
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
