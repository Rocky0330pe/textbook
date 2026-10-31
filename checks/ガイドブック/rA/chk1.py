import sys,re,json
sys.path.insert(0,'/home/claude/work/build')
import series as S
A=json.load(open('/home/claude/work/build/pages_actual.json'))
tot=0;nch=0;kinds={}
allch=[]
for v in S.VOLS:
    chs=[c for p in v['parts'] for c in p[2]]
    smin=min(c[3][0] for c in chs); smax=max(c[3][1] for c in chs)
    out,back,total=S.layout(v)
    tot+=total; nch+=len(chs)
    for c in chs: kinds[c[5]]=kinds.get(c[5],0)+1
    a=A[str(v['no'])]
    print(v['no'],v['grade'],len(chs),(smin,smax),total,a.get('total'),'parts',[p[1] for p in v['parts']], 'back',a['back'])
    for c in chs:
        allch.append((c[0],a['chap'].get(c[0]),c[5],c[3]))
print(tot,nch,kinds)
L=[(p,c) for c,p,k,s in allch if k!='J']
print('min',min(L),'max',max(L))
print('min C',min((p,c) for c,p,k,s in allch if k=='C'),'max C',max((p,c) for c,p,k,s in allch if k=='C'))
print(sorted(L)[:5],sorted(L)[-5:])
