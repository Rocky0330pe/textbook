import sys,re
exec(open('chk_all.py').read().split("res = collections.OrderedDict()")[0])
def strip_cmd(s,names):
    # \name{...} を中かっこの釣り合いを見て消す
    out=[];i=0
    pat=re.compile(r'\\(%s)\s*\{'%'|'.join(names))
    while True:
        m=pat.search(s,i)
        if not m: out.append(s[i:]);break
        out.append(s[i:m.start()]); j=m.end(); d=1
        while j<len(s) and d>0:
            if s[j]=='\\': j+=2; continue
            if s[j]=='{': d+=1
            elif s[j]=='}': d-=1
            j+=1
        i=j
    return ''.join(out)
for n in [1,2,3,4,5,6,7,8,9,'p']:
    qa=[];star=[];hat_none=[];hat_text=[]
    for f in chapters(n):
        s=read(f);c=cid(f)
        t=strip_cmd(s,['bkjans','bkpans'])
        q=len(re.findall(r'\\q?quad\s*(\\R\{)?（\s*[2-9]\s*）|\\q?quad\s*\(\s*[2-9]\s*\)',t))
        if q: qa.append('%s:%d'%(c,q))
        if c in STARS and KIND.get(c)=='C':
            lo,hi=STARS[c]; eb=lo; ec=hi if hi>lo else min(5,hi+1)
            gs=re.findall(r'\\bkproblemgroup\{((?:[^{}]|\{[^{}]*\})*)\}\{(\d)\}',s)
            b=[int(x[1]) for x in gs if 'チャレンジ' not in x[0]]
            ch=[int(x[1]) for x in gs if 'チャレンジ' in x[0]]
            if gs and ((b and b[0]!=eb) or (ch and ch[0]!=ec)):
                star.append('%s(%d,%d)=%s/%s→%d/%d'%(c,lo,hi,b[0] if b else '-',ch[0] if ch else '-',eb,ec))
            if '\\begin{hatena}' in s and '\\bkhatenaref' not in s:
                if re.search(r'はてな(？|\?)?の(答|こたえ)|はてな(？|\?)の\\R\{答',s): hat_text.append(c)
                else: hat_none.append(c)
    print(n,'小問quad(こたえ以外)',sum(int(x.split(':')[1]) for x in qa),' '.join(qa))
    print(n,'★ずれ',len(star),' '.join(star))
    print(n,'はてな答えの札なし（文だけ）',hat_text,'答えが見当たらない',hat_none)
