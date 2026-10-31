import re
T='/home/claude/work/build/tex/'
def chap_cases(f, pre):
    s=open(T+f).read()
    out={}
    # case-table rows: \kviii?case{X} & ... & 例題 \\  inside bktable after casetitle
    for m in re.finditer(r'\\'+pre+r'casetitle\{[^}]*\}\{[^}]*\}\s*\\begin\{bkcenter\}\s*\\begin\{bktable\}.*?\\end\{bktable\}', s, re.S):
        for line in m.group(0).split('\n'):
            mm=re.match(r'\\'+pre+r'case\{([^}]*)\}\s*&.*&\s*([^&]*?)\s*\\\\\s*$', line)
            if mm: out[mm.group(1).replace("$'$","'")]=mm.group(2).strip()
    return out
def map_cases(block):
    s=open('ch8-back.tex').read()
    i=s.find(block); j=s.find(r'\end{kviiizmap}', i)
    out={}
    for line in s[i:j].split('\n'):
        mm=re.match(r'\\kviiizcase\{([^}]*)\}\s*&.*&\s*([^&]*?)\s*\\\\\s*$', line)
        if mm: out[mm.group(1).replace("$'$","'")]=mm.group(2).strip()
    return out
pairs=[('ch8-06.tex','kviiig','%% 表8-6 重積分'),('ch8-07.tex','kviiih','%% 表8-7 線積分'),('ch8-08.tex','kviiii','%% 表8-8 面積分'),('ch8-11.tex','kviiil','%% 表8-11 ガウスの定理とストークスの定理')]
norm=lambda x:x.replace('1〜3','1・2・3')
for f,pre,blk in pairs:
    c=chap_cases(f,pre); m=map_cases(blk)
    print(f, len(c), len(m), 'same keys' if set(c)==set(m) else ('DIFF', set(c)^set(m)))
    for k in c:
        if norm(m.get(k,''))!=c[k]: print('  mismatch',k,c[k],m.get(k))
# examples count and baai cases in chapters
for f,pre,_ in pairs:
    s=open(T+f).read()
    ex=re.findall(r'\\begin\{reidai\}', s)
    baai=re.findall(r'\\'+pre+r'baai\{[^}]*\}\{([^}]*)\}\{([^}]*)\}', s)
    print(f,'reidai',len(ex),'baai',[b[1] for b in baai])
