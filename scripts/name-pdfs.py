#!/usr/bin/env python3
"""リリースに添付するファイルを用意する（仕様書「納品のルール」の名前をつける）。

使い方:  python3 scripts/name-pdfs.py 版 タグ 元のフォルダ 出力のフォルダ
例:      python3 scripts/name-pdfs.py Ver2 vol6-ver2 dist release

GitHub はリリースのファイル名の日本語を「.」に置きかえてしまうので、次の2つを作る。
  1. 英数字の名前の PDF（例 vol6_Ver2.pdf）。表示名（ラベル）に納品の名前をつける
  2. 中のファイルを納品の名前にした zip（例 vol6-ver2_pdf.zip）
       vol6.pdf        → 第6巻_未来を計算する_Ver2.pdf
       wrap6.pdf       → 第6巻_カバー展開図_入稿用_Ver2.pdf
       guide-kids.pdf  → ガイドブック_子ども用_はじめに読む本_Ver2.pdf
       guide-adult.pdf → ガイドブック_大人用_保護者・先生のための本_Ver2.pdf
       ph1.pdf         → 物理第1巻_力学_Ver2.pdf
出力のフォルダの assets.txt に、gh release create に渡す引数（1行に1つ、「ファイル#表示名」）を書く。
"""
import os
import re
import shutil
import sys
import zipfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, ROOT)
sys.dont_write_bytecode = True


def plain(s):
    s = re.sub(r'\\R\{([^{}]*)\}\{[^{}]*\}', r'\1', s)
    return re.sub(r'[\\{}]', '', s)


def math_titles():
    import series
    return {v['no']: plain(v['title']) for v in series.VOLS}


def phys_titles():
    try:
        sys.path.insert(0, os.path.join(ROOT, 'phys'))
        import series_phys
        return {v['no']: plain(v['title']) for v in series_phys.VOLS}
    except Exception:
        return {}


def nouhin_name(b, ver, mt, pt):
    """組んだファイルの名前（拡張子なし）から納品の名前を作る。知らないものは None。"""
    if m := re.fullmatch(r'vol([1-9])', b):
        n = int(m.group(1)); return f'第{n}巻_{mt.get(n, "")}_{ver}.pdf'
    if m := re.fullmatch(r'wrap([1-9])', b):
        return f'第{m.group(1)}巻_カバー展開図_入稿用_{ver}.pdf'
    if b == 'guide-kids':
        return f'ガイドブック_子ども用_はじめに読む本_{ver}.pdf'
    if b == 'guide-adult':
        return f'ガイドブック_大人用_保護者・先生のための本_{ver}.pdf'
    if m := re.fullmatch(r'ph([1-5])', b):
        n = int(m.group(1)); return f'物理第{n}巻_{pt.get(n, "")}_{ver}.pdf'
    if m := re.fullmatch(r'phwrap([1-5])', b):
        return f'物理第{m.group(1)}巻_カバー展開図_入稿用_{ver}.pdf'
    return None


def main():
    ver, tag, src, dst = sys.argv[1:5]
    os.makedirs(dst, exist_ok=True)
    mt, pt = math_titles(), phys_titles()
    assets = []
    zpath = os.path.join(dst, f'{tag}_pdf.zip')
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(os.listdir(src)):
            if not f.endswith('.pdf'):
                continue
            b = f[:-4]
            name = nouhin_name(b, ver, mt, pt)
            if name is None:
                continue
            ascii_name = f'{b}_{ver}.pdf'
            shutil.copy(os.path.join(src, f), os.path.join(dst, ascii_name))
            z.write(os.path.join(src, f), f'{tag}/{name}')
            assets.append(f'{os.path.join(dst, ascii_name)}#{name}')
            print(f, '→', ascii_name, '（表示名', name + '）')
    assets.append(f'{zpath}#{tag}_納品の名前のPDF一式.zip')
    with open(os.path.join(dst, 'assets.txt'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(assets) + '\n')


if __name__ == '__main__':
    main()
