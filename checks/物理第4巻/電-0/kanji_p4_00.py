# 電-0 の本文（コメントの行を除く）の漢字が、常用漢字の表（電-4 の組が作った joyo.txt）にあるかを確かめる。
# 使い方（リポジトリの根で）：python3 checks/物理第4巻/電-0/kanji_p4_00.py > checks/物理第4巻/電-0/kanji_p4_00_out.txt
j = set(open('checks/物理第4巻/電-4/joyo.txt', encoding='utf-8').read())
t = open('tex/p4-00.tex', encoding='utf-8').read()
body = '\n'.join(l for l in t.splitlines() if not l.lstrip().startswith('%'))
ks = sorted(set(c for c in body if '一' <= c <= '鿿'))
print(len(ks), '種類の漢字')
print('常用漢字にない字:', [c for c in ks if c not in j])
