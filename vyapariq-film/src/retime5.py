import json
old=json.load(open('timeline_old.json')); new=json.load(open('vo_meta5.json'))
order=['n01','n02','n03','p01','p02','p03','m01','n04','n05','n06','n07','n08','n09','m02','n10']
gap={'n02':0.05,'n03':0.15,'p01':0.05,'p02':0.05,'p03':0.05,'m01':0.15,'n04':0.15,'n05':0.25,'n06':0.15,'n07':0.12,'n08':0.12,'n09':0.15,'m02':0.1,'n10':0.15}
t=0.5
for k in order:
    if k!='n01': t+=gap[k]
    new[k]['start']=round(t,3); t+=new[k]['dur']
OLD_END=91.8; NEW_END=round(t+4.0,2)
A_old=[0.0]; A_new=[0.0]
for k in order:
    os_,ns=old[k]['start'],new[k]['start']
    ow,nw=old[k]['words'],new[k]['words']
    assert len(ow)==len(nw),(k,len(ow),len(nw))
    for a,b in zip(ow,nw):
        A_old.append(os_+a[1]); A_new.append(ns+b[1])
    A_old.append(os_+old[k]['dur']); A_new.append(ns+new[k]['dur'])
A_old.append(OLD_END); A_new.append(NEW_END)
# enforce monotonic
O=[];N=[]
for a,b in zip(A_old,A_new):
    if O and (a<=O[-1]+1e-4 or b<=N[-1]+1e-4): continue
    O.append(round(a,4)); N.append(round(b,4))
json.dump({'old':O,'new':N,'end':NEW_END},open('warp5.json','w'))
json.dump(new,open('timeline5.json','w'),ensure_ascii=False)
for k in order: print(k,new[k]['start'],round(new[k]['start']+new[k]['dur'],2))
print('END',NEW_END,'anchors',len(O))
