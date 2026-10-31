#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""シリーズ全体のさくいん（第1〜9巻）を作る（第15回編集委員会の決定13、組 B9）。

  python3 tools/mkseriesidx.py          … tex/vol1.bkidx〜vol9.bkidx から tex/ch9-seriesidx.tex を作る

・データ：各巻を組んだときにできる tex/volN.bkidx（1行＝よみ|ことば|ページ）。
・同じことば（ルビ・分かち書きの空白をはずして同じになるもの）は1行にまとめ、「第3巻 p.12, 56、第9巻 p.401」の形にする。
・並べ方は、各巻のさくいん（bk-volume.sty の bk.printidx）と同じ：記号・英字が先、あとは よみ の五十音順
  （カタカナはひらがなに、のばす音「ー」は前の字の母音に、濁点・半濁点・小さい字は清音の大きい字として並べる）。
・第9巻のページは、組み直すたびに変わる。事務局の手順：第9巻を組む → このプログラム → もう一度組む
  （さくいんは巻末にあり、本文のページは動かないので、2回めでそろう）。vol9.bkidx が空なら知らせる。
"""
import os, re, sys, unicodedata

BUILD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(BUILD, 'tex')
OUT = os.path.join(TEX, 'ch9-seriesidx.tex')

def plain(w):
    """ルビ \\R{親字}{よみ}・\\R {親字}{よみ} を親字だけにし、分かち書きの空白（日本語の字のあいだ）をとる"""
    w = re.sub(r'\\R\s*\{([^{}]*)\}\{[^{}]*\}', r'\1', w)
    jp = r'[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]'
    w = re.sub(r'(?<=%s) +(?=%s)' % (jp, jp), '', w)
    w = re.sub(r'(?<=%s) +(?=[0-9A-Za-z$])' % jp, '', w)
    return w.strip()

def norm_word(w):
    """同じことばかを決めるときの形（空白・全角半角のゆれをそろえる）"""
    w = unicodedata.normalize('NFKC', plain(w))
    return re.sub(r'\s+', '', w)

# ---- bk.printidx と同じ並べ方 ----
VOICED = {}
for p in ['がか','ぎき','ぐく','げけ','ごこ','ざさ','じし','ずす','ぜせ','ぞそ','だた','ぢち','づつ','でて','どと',
          'ばは','びひ','ぶふ','べへ','ぼほ','ぱは','ぴひ','ぷふ','ぺへ','ぽほ','ぁあ','ぃい','ぅう','ぇえ','ぉお','ゃや','ゅゆ','ょよ','っつ']:
    VOICED[p[0]] = p[1]
VOWEL = {}
for rowc, v in zip(['あかさたなはまやらわがざだばぱぁゃ', 'いきしちにひみりぎじぢびぴぃ', 'うくすつぬふむゆるぐずづぶぷぅゅっ', 'えけせてねへめれげぜでべぺぇ', 'おこそとのほもよろをごぞどぼぽぉょ'], 'あいうえお'):
    for c in rowc: VOWEL[c] = v
def key(y):
    out = []; prev = None
    for c in y:
        o = ord(c)
        if 0x30A1 <= o <= 0x30F6: c = chr(o - 0x60)
        if c == 'ー' and prev in VOWEL: c = VOWEL[prev]
        prev = c
        out.append(VOICED.get(c, c))
    return ''.join(out)
ROWS = [('あ','あいうえお'),('か','かきくけこ'),('さ','さしすせそ'),('た','たちつてと'),('な','なにぬねの'),
        ('は','はひふへほ'),('ま','まみむめも'),('や','やゆよ'),('ら','らりるれろ'),('わ','わをん')]
def rowof(k):
    c = k[:1]
    for r, cs in ROWS:
        if c in cs: return r
    return '記号・英字'

def main():
    entries = {}   # norm → dict(y, w, pages{vol:set})
    warn = []
    for v in range(1, 10):
        f = os.path.join(TEX, f'vol{v}.bkidx')
        if not os.path.exists(f) or os.path.getsize(f) == 0:
            warn.append(f'vol{v}.bkidx がない・空（第{v}巻を組んでから、もう一度実行する）'); continue
        for line in open(f, encoding='utf-8'):
            m = re.match(r'^(.*?)\|(.*)\|(\d+)$', line.rstrip('\n'))
            if not m: continue
            y, w, p = m.group(1).strip(), m.group(2), int(m.group(3))
            n = norm_word(w)
            e = entries.setdefault(n, {'y': y, 'w': plain(w), 'pages': {}, 'ys': set()})
            e['ys'].add(y)
            e['pages'].setdefault(v, set()).add(p)
            # よみは、新しい巻（漢字の書き方がいまの書き方）のものを使う
            if v >= max(e['pages']): e['y'] = y; e['w'] = plain(w)
    order = sorted(entries.values(), key=lambda e: (rowof(key(e['y'])) != '記号・英字', key(e['y']), e['y']))
    lines = ['%% シリーズ全体のさくいん（第1〜9巻）。tools/mkseriesidx.py が tex/vol1〜9.bkidx から作った。手で直さない。']
    cur = None
    for e in order:
        r = rowof(key(e['y']))
        if r != cur:
            lines.append(r'\bkidxgroup{%s}' % r); cur = r
        refs = r'\kixzsvsep '.join(r'\kixzsv{%d}{%s}' % (v, ', '.join(map(str, sorted(ps)))) for v, ps in sorted(e['pages'].items()))
        lines.append(r'\bkidxline{%s}{%s}' % (e['w'], refs))
    open(OUT, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    multi = sum(1 for e in entries.values() if len(e['pages']) > 1)
    print(f'ことば {len(entries)}（2つ以上の巻に出るもの {multi}）→ {OUT}')
    for e in entries.values():
        if len(e['ys']) > 1: print(f'  よみが巻でちがう：{e["w"]}：{sorted(e["ys"])}（{e["y"]} で並べた）')
    for x in warn: print('  ！', x)
    return 1 if warn else 0

if __name__ == '__main__':
    sys.exit(main())
