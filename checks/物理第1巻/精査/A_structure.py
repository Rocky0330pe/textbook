# 例題の7段・じぶんでとこう・章末問題・囲みの数を数える（力-0〜2）
import re
T='/home/user/textbook/tex/'
steps=['phbamen','phmushi','phzu','phriyu','phtateru','phtoku','phtashikame']
for fn in ['p1-00.tex','p1-01.tex','p1-02.tex']:
    s=open(T+fn,encoding='utf-8').read()
    s=re.sub(r'(?m)^\s*%.*$','',s)
    ex=re.findall(r'\\begin\{phreidai\}\[([^\]]*)\](.*?)\\end\{phreidai\}',s,re.S)
    print('=====',fn,'例題',len(ex),'じぶんでとこう',s.count('\\begin{jibun}'))
    for i,(t,b) in enumerate(ex,1):
        miss=[x for x in steps if '\\'+x not in b]
        k='\\kotae' in b
        print(f'  例題{i} {t}  欠けた段:{miss or "なし"}  答え:{k}')
    for env in ['phyomi','phmijika','phbaisuru','phflow','phmada','phsaki','phmodel','phketa','phkougaku','motto','seikaku','column','senmonsho','phcode','bksheet','tsumazuki']:
        print(f'  {env}: {len(re.findall(r"\\\\begin\\{"+env+r"\\}",s)) if env!="bksheet" else s.count("\\bksheet")}', end='')
    print()
    print('  章末 bkproblem', s.count('\\bkproblem '), ' 入試', s.count('\\phnyushi'), ' 図 bkfigure', s.count('\\begin{bkfigure}'), ' tikz', s.count('\\begin{tikzpicture}'), ' axis', s.count('\\begin{axis}'))
