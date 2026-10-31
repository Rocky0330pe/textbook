# 組B（第19回 6-4 の2）：物理シリーズは高校卒業程度の漢字。よく使う常用漢字だけを、読みやすさを見て置きかえる。
# コメント行・\bksection（共通の見出し）・\phchapter（もくじと同じ題）・\bkidx（さくいんの読み）は変えない。
import re, sys
R = [
    (r'はか(ろう|って|ります|り方|った|る|れ)', r'測\1'),
    (r'ふえ', '増え'), (r'ふや', '増や'),
    (r'へら(す|せ|し)', r'減ら\1'),
    (r'まちが(え|っ|い)', r'間違\1'),
    (r'むずかし', '難し'),
    (r'くわし', '詳し'),
    (r'かべ', '壁'),
    (r'くり返', '繰り返'),
    (r'おそ(く|い)', r'遅\1'),
    (r'すべ(り|っ|る|ら)', r'滑\1'),
    (r'ふれ(て|た|る)', r'触れ\1'),
    (r'こわれ', '壊れ'),
    (r'うず', '渦'),
    (r'ためし', '試し'),
    (r'まわりの', '周りの'),
    (r'たくわえ', '蓄え'),
    (r'おさえ', '押さえ'),
    (r'こみ入', '込み入'),
]
for path in sys.argv[1:]:
    out = []; cnt = 0
    for L in open(path, encoding='utf-8').read().split('\n'):
        s = L.lstrip()
        if s.startswith('%') or s.startswith('\\bksection') or s.startswith('\\phchapter'):
            out.append(L); continue
        # \bkidx{よみ}{語} の読みは変えない
        keep = {}
        def hide(m):
            k = '\x00%d\x00' % len(keep); keep[k] = m.group(0); return k
        t = re.sub(r'\\bkidx\{[^}]*\}', hide, L)
        for a, b in R:
            t, n = re.subn(a, b, t); cnt += n
        for k, v in keep.items():
            t = t.replace(k, v)
        out.append(t)
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    print(path, cnt)
