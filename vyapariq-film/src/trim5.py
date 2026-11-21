import json,subprocess,numpy as np,wave
SR=44100
def load(f):
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).copy()
lines=json.load(open('lines4.json'))
meta={}
for key,spk,text in lines:
    x=load(f'vo5/{key}.mp3')
    hop=441; n=len(x)//hop
    rms=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])
    db=20*np.log10(rms+1e-9)
    voiced=db>-42
    idx=np.where(voiced)[0]
    s0=max(idx[0]-3,0); s1=min(idx[-1]+8,n)
    # build keep segments: compress silent runs > 0.45s to 0.38s (MAXP)
    MAXP=12 if spk=='N' else (18 if spk=='M' else 12)  # frames of 10ms
    segs=[]; i=s0
    while i<s1:
        if not voiced[i]:
            j=i
            while j<s1 and not voiced[j]: j+=1
            L=j-i
            if L>MAXP:
                keep=MAXP
                segs.append((i,i+keep//2,'s')); segs.append((j-keep//2,j,'s'))
            else: segs.append((i,j,'s'))
            i=j
        else:
            j=i
            while j<s1 and voiced[j]: j+=1
            segs.append((i,j,'v')); i=j
    # merge & build output with mapping
    out=[]; mp=[]  # (src_start_s, dst_start_s, len_s)
    t=0
    for a,b,_ in segs:
        seg=x[a*hop:b*hop]; out.append(seg); mp.append((a*hop/SR,t,(b-a)*hop/SR)); t+=(b-a)*hop/SR
    y=np.concatenate(out)
    # short fades at cut points are implicit; apply 5ms fade in/out overall
    f=int(0.005*SR); y[:f]*=np.linspace(0,1,f); y[-f:]*=np.linspace(1,0,f)
    def m(ts):
        for s,d,L in mp:
            if s<=ts<s+L: return d+(ts-s)
        # in removed area -> next segment start
        for s,d,L in mp:
            if s>ts: return d
        return t
    al=json.load(open(f'vo5/{key}.json'))
    chars=al['characters']; st=[m(v) for v in al['character_start_times_seconds']]; en=[m(v) for v in al['character_end_times_seconds']]
    # words
    words=[]; cur=''; ws=None
    for c,a,b in zip(chars,st,en):
        if c==' ':
            if cur: words.append([cur,ws,pe]); cur=''
            continue
        if not cur: ws=a
        cur+=c; pe=b
    if cur: words.append([cur,ws,pe])
    words=[w for w in words if not (w[0].startswith('[') and w[0].endswith(']'))]
    with wave.open(f'vo5/{key}_t.wav','wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes())
    meta[key]={'spk':spk,'text':text,'dur':round(len(y)/SR,3),'words':[[w_,round(a,3),round(b,3)] for w_,a,b in words]}
    print(key,round(len(x)/SR,2),'->',round(len(y)/SR,2))
json.dump(meta,open('vo_meta5.json','w'),ensure_ascii=False,indent=0)
