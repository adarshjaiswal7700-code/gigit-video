import json,base64,subprocess,sys,urllib.request
V={"N":"xZp4zaaBzoWhWxxrcAij","M":"PboFIQ6kckfADmG3UQYF","P1":"wrkzh0wn3J12vlaNNlZk","P2":"IHl72D4EkKljDVAjDhsj","P3":"i8poXNEuNSxv1iFNrrq3"}
lines=json.load(open('lines4.json')); only=sys.argv[1:]
for key,spk,text in lines:
    if only and key not in only: continue
    body=json.dumps({"text":text,"model_id":"eleven_v3","voice_settings":{"stability":0.5}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[spk]}/with-timestamps?output_format=mp3_44100_128",data=body,headers={"xi-api-key":"dummy","Content-Type":"application/json","User-Agent":"curl/8.5.0"})
    try: d=json.load(urllib.request.urlopen(req,timeout=180))
    except urllib.error.HTTPError as e: print(key,'ERR',e.read()[:300]); continue
    open(f'vo4/{key}.mp3','wb').write(base64.b64decode(d['audio_base64']))
    json.dump(d.get('alignment'),open(f'vo4/{key}.json','w'),ensure_ascii=False)
    dur=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'vo4/{key}.mp3'],capture_output=True,text=True).stdout.strip()
    print(key,spk,dur,flush=True)
