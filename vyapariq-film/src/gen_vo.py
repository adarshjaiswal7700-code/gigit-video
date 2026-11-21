import json,base64,subprocess,sys,urllib.request,os
V={"N":"TQ4yGmeeAKKKno7d1w6E","M":"lvQ1BqaPAmYUiMYKkl0I","P1":"wrkzh0wn3J12vlaNNlZk","P2":"IHl72D4EkKljDVAjDhsj","P3":"i8poXNEuNSxv1iFNrrq3"}
lines=json.load(open('lines.json'))
only=sys.argv[1:]
for key,spk,text in lines:
    if only and key not in only: continue
    st={"stability":0.45,"similarity_boost":0.8,"style":0.35,"use_speaker_boost":True}
    if spk=="N": st={"stability":0.3,"similarity_boost":0.8,"style":0.65,"use_speaker_boost":True,"speed":1.1}
    if spk=="M": st={"stability":0.4,"similarity_boost":0.8,"style":0.5,"use_speaker_boost":True}
    body=json.dumps({"text":text,"model_id":"eleven_multilingual_v2","voice_settings":st}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[spk]}/with-timestamps?output_format=mp3_44100_128",data=body,headers={"xi-api-key":"dummy","Content-Type":"application/json","User-Agent":"curl/8.5.0"})
    d=json.load(urllib.request.urlopen(req,timeout=120))
    open(f'vo/{key}.mp3','wb').write(base64.b64decode(d['audio_base64']))
    json.dump(d.get('alignment'),open(f'vo/{key}.json','w'),ensure_ascii=False)
    dur=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'vo/{key}.mp3'],capture_output=True,text=True).stdout.strip()
    print(key,spk,dur)
