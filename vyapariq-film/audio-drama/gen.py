import json,base64,subprocess,sys,urllib.request
V={"N":"7qBNUtXRGP0jPi0H4r8k","M":"iBRcUZbbi4hxPMzDCm71","R":"iWNf11sz1GrUE4ppxTOL","G":"zT03pEAEi0VHKciJODfn","A":"kiaJRdXJzloFWi6AtFBf"}
lines=json.load(open('lines.json')); only=sys.argv[1:]
for key,spk,text in lines:
    if only and key not in only: continue
    body=json.dumps({"text":text,"model_id":"eleven_v3","voice_settings":{"stability":0.5}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[spk]}?output_format=mp3_44100_128",data=body,headers={"xi-api-key":"dummy","Content-Type":"application/json","User-Agent":"curl/8.5.0"})
    try: open(f'{key}.mp3','wb').write(urllib.request.urlopen(req,timeout=180).read())
    except urllib.error.HTTPError as e: print(key,'ERR',e.read()[:300]); continue
    dur=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{key}.mp3'],capture_output=True,text=True).stdout.strip()
    print(key,spk,dur,flush=True)
