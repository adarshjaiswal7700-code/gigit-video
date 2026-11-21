import json,subprocess
import numpy as np
m=json.load(open('timeline.json')); mo=json.load(open('timeline_old.json')); wp=json.load(open('warp.json'))
fwd=lambda t: float(np.interp(t,wp['old'],wp['new']))
W=lambda k,i: mo[k]['start']+mo[k]['words'][i][1]   # old-time, mapped via fwd below
Wn=lambda k,i: m[k]['start']+m[k]['words'][i][1]
END=wp['end']
inputs=[];filters=[];vo_labels=[];sfx_labels=[]
def add(path): inputs.extend(['-i',path]); return len(inputs)//2-1
for k,v in m.items():
    i=add(f'audio/vo/{k}_t.wav'); d=int(v['start']*1000)
    chain=f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo'
    if k.startswith('p'): chain+=',highpass=f=280,lowpass=f=3600,acompressor=threshold=0.2:ratio=3,volume=1.15'
    if k.startswith('m'): chain+=',aecho=0.8:0.6:40:0.18,volume=1.1'
    if k.startswith('n'): chain+=',acompressor=threshold=0.1:ratio=3:attack=5:release=120,volume=1.25'
    chain+=f',adelay={d}|{d}[v{k}]'; filters.append(chain); vo_labels.append(f'[v{k}]')
sfx=[(0.2,'swoosh_soft',.45),(W('n01',2)-.1,'pop',.5),(W('n01',6)-.05,'pop',.45),(W('n01',15)-.05,'pop',.35),(W('n01',17)-.05,'pop',.35),
(7.8,'swoosh_soft',.45),(W('n02',6)-.1,'impact',.55),(11.35,'ring',.55),(W('p01',0)-.05,'pop',.45),(W('p02',0)-.05,'pop',.45),(W('p03',0)-.05,'pop',.45),
(19.75,'impact',.5),(20.45,'whoosh',.35),(24.6,'swoosh_soft',.4),(W('n04',2)-.2,'sparkle',.25),(W('n04',16)-.1,'tick',.6),
(31.65,'whoosh',.8),(31.9,'impact',.45),(W('n05',5)-.25,'type',.55),(W('n05',8)-.2,'sparkle',.7),(38.4,'whoosh',.35),
(W('n06',5)-.1,'ding',.6),(W('n06',9)-.15,'swoosh_soft',.4),(W('n06',11),'pop',.3),(W('n06',14),'pop',.3),(W('n06',19),'pop',.3),
(47.2,'swoosh_soft',.4),(W('n07',3),'pop',.4),(W('n07',12),'ding',.35),(W('n07',15),'ding',.35),(W('n07',27)-.2,'pop',.45),
(58.1,'swoosh_soft',.4),(W('n08',1)-.1,'pop',.45),(W('n08',8),'impact',.4),(W('n08',11)-.2,'swoosh_soft',.35),(W('n08',18),'pop',.45),(W('n08',22)-.2,'impact',.3),
(68.3,'whoosh',.45),(W('n09',4)-.05,'kaching',.85),(W('n09',4)+.1,'sparkle',.45),(72.3,'whoosh',.3),
(76.25,'swoosh_soft',.4),(W('n10',7),'impact',.35),(W('n10',11)-.2,'sparkle',.5),(87.25,'pop',.55)]
for n,(t,f,vol) in enumerate(sfx):
    i=add(f'audio/sfx/{f}.mp3'); d=int(max(fwd(t),0)*1000)
    filters.append(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{n}]'); sfx_labels.append(f'[s{n}]')
ia=add('audio/sfx/musicA.mp3'); ib=add('audio/sfx/musicB.mp3')
filters.append(f'[{ia}:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:st=0:d=1.2,afade=t=out:st={fwd(31.2)}:d=1.1,volume=0.26[ma]')
bst=Wn('n05',8)-1.0; filters.append(f'[{ib}:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=out:st={END-bst-1.2}:d=1.2,volume=0.24,adelay={int(bst*1000)}|{int(bst*1000)}[mb]')
filters.append('[ma][mb]amix=inputs=2:normalize=0[mus]')
filters.append(''.join(vo_labels)+f'amix=inputs={len(vo_labels)}:normalize=0,apad=whole_dur={END}[vo]')
filters.append('[vo]asplit=2[vo1][vosc]')
filters.append('[mus][vosc]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=350:makeup=1[mduck]')
filters.append(''.join(sfx_labels)+f'amix=inputs={len(sfx_labels)}:normalize=0[sfx]')
filters.append(f'[vo1][mduck][sfx]amix=inputs=3:normalize=0,atrim=0:{END},alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[out]')
cmd=['ffmpeg','-y','-v','error']+inputs+['-filter_complex',';'.join(filters),'-map','[out]','-ar','48000','-c:a','pcm_s16le','mix.wav']
subprocess.run(cmd,check=True)
print(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','mix.wav'],capture_output=True,text=True).stdout)
