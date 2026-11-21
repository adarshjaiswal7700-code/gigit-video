import json,subprocess,numpy as np,wave
SR=48000
def load(f):
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).copy()
def tighten(x,maxp=0.15):
    hop=480; n=len(x)//hop
    db=20*np.log10(np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])+1e-9)
    v=db>-42; idx=np.where(v)[0]; s0=max(idx[0]-2,0); s1=min(idx[-1]+6,n)
    out=[];i=s0;M=int(maxp*100)
    while i<s1:
        j=i
        if not v[i]:
            while j<s1 and not v[j]: j+=1
            if j-i>M: out.append(x[i*hop:(i+M//2)*hop]); out.append(x[(j-M//2)*hop:j*hop])
            else: out.append(x[i*hop:j*hop])
        else:
            while j<s1 and v[j]: j+=1
            out.append(x[i*hop:j*hop])
        i=j
    y=np.concatenate(out); f=int(.004*SR); y[:f]*=np.linspace(0,1,f); y[-f:]*=np.linspace(1,0,f); return y
L=json.load(open('lines.json'))
gap={'d02':0.1,'d03':0.9,'d04':0.12,'d05':0.25,'d06':0.08,'d07':0.08,'d08':0.08,'d09':0.15,'d10':0.85,'d11':0.08,'d12':0.6,'d13':0.15,'d14':0.12,'d15':0.25}
t=0.8; starts={}; durs={}
for k,spk,_ in L:
    y=tighten(load(f'{k}.mp3'))
    with wave.open(f'{k}_t.wav','wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes())
    t+=gap.get(k,0); starts[k]=round(t,3); durs[k]=len(y)/SR; t+=durs[k]
END=round(t+2.2,2)
for k in starts: print(k,starts[k],round(starts[k]+durs[k],2))
print('END',END)
json.dump({'starts':starts,'durs':durs,'end':END},open('drama_timeline.json','w'))
inputs=[];F=[];vo=[];sx=[]
def add(p): inputs.extend(['-i',p]); return len(inputs)//2-1
phone={'d03','d10','d11'}
for k,spk,_ in L:
    i=add(f'{k}_t.wav'); d=int(starts[k]*1000)
    c=f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo'
    if k in phone: c+=',highpass=f=300,lowpass=f=3400,acompressor=threshold=0.15:ratio=3,volume=1.3'
    else: c+=',acompressor=threshold=0.12:ratio=3:attack=5:release=120,volume=1.2'
    c+=f',adelay={d}|{d}[v{k}]'; F.append(c); vo.append(f'[v{k}]')
S=starts; E=lambda k:S[k]+durs[k]
sfx=[(0.0,'whoosh',.5),(0.35,'impact',.35),(S['d03']-0.9,'ring',.55),(S['d05']-0.25,'whoosh',.6),(S['d05']-0.05,'sparkle',.5),
(S['d07']+2.6,'ding',.45),(S['d09']-0.15,'swoosh_soft',.4),(S['d10']-0.85,'ring',.45),(E('d11')+0.05,'kaching',.8),
(S['d12']-0.4,'pop',.4),(E('d13')-1.2,'kaching',.7),(E('d13')-1.1,'sparkle',.45),(S['d15']-0.2,'whoosh',.45),(E('d15')+0.1,'impact',.45)]
for n,(tt,f,vol) in enumerate(sfx):
    i=add(f'../sfx/{f}.mp3'); d=int(max(tt,0)*1000)
    F.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{n}]'); sx.append(f'[s{n}]')
ia=add('../sfx/musicA.mp3'); ib=add('musicB_ext.wav')
sw=S['d05']-0.3
F.append(f'[{ia}:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:st=0:d=0.8,afade=t=out:st={sw-0.8}:d=0.9,volume=0.25[ma]')
bst=sw-1.0
F.append(f'[{ib}:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=out:st={END-bst-1.5}:d=1.5,volume=0.24,adelay={int(bst*1000)}|{int(bst*1000)}[mb]')
F.append('[ma][mb]amix=inputs=2:normalize=0[mus]')
F.append(''.join(vo)+f'amix=inputs={len(vo)}:normalize=0,apad=whole_dur={END}[vo]')
F.append('[vo]asplit=2[vo1][vsc]')
F.append('[mus][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=350[md]')
F.append(''.join(sx)+f'amix=inputs={len(sx)}:normalize=0[sfx]')
F.append(f'[vo1][md][sfx]amix=inputs=3:normalize=0,atrim=0:{END},alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[out]')
subprocess.run(['ffmpeg','-y','-v','error']+inputs+['-filter_complex',';'.join(F),'-map','[out]','-ar','48000','-c:a','pcm_s16le','drama_mix.wav'],check=True)
