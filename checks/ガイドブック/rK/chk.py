import sys, json, re
sys.path.insert(0,'/home/claude/work/build'); sys.path.insert(0,'/home/claude/work/build/phys')
import series as S, series_phys as P
pa=json.load(open('/home/claude/work/build/pages_actual.json'))
strip=lambda s: re.sub(r'\\R\{([^}]*)\}\{[^}]*\}',r'\1',s)
tot=0; nch=0
allch={}
for v in S.VOLS:
    chs=[c for p in v['parts'] for c in p[2]]
    for c in chs: allch[c[0]]=(v['no'],c)
    smin=min(c[3][0] for c in chs); smax=max(c[3][1] for c in chs)
    kinds={}
    for c in chs: kinds[c[5]]=kinds.get(c[5],0)+1
    t=pa[str(v['no'])]['total']; tot+=t; nch+=len(chs)
    print(v['no'], strip(v['title']), strip(v['sub']), v['grade'], 'pages',t,'chap',len(chs),kinds,'star',smin,smax, 'parts',[strip(p[1] or p[0]) for p in v['parts']])
    print('   catch', strip(v['catch']))
print('total',tot,nch)
# routes
for r,(st,end) in S.ROUTE_STATIONS.items(): print('route',r,S.ROUTES[r]['name'],S.ROUTES[r]['sub'],st,end)
# chapters mentioned
for c in sys.argv[1:]:
    if c in allch: print(c, allch[c][0], strip(allch[c][1][1]), allch[c][1][3], allch[c][1][4], allch[c][1][5])
    else: print(c,'MISSING')
# phys
for v in P.VOLS:
    vs=set(); 
    for p in v['parts']:
        for c in p[3]: vs|=set(P.math_vols(c[4]))
    print('phys',v['no'],v['title'],v['sub'],sorted(vs))
