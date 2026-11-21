# Mishra ji aur VyaparIQ — film script (v4)

1920×1080 · 30 fps · ~88 sec · white background · Hindi/Hinglish VO

**v4:** All voices were regenerated with ElevenLabs `eleven_v3` and emotion tags ([warmly], [sad], [excited]…), see `src/lines4.json`. The narrator is Danish Khan (Calm, Clear & Expressive) and Mishra ji is Sanjay (Mature Hindi Storyteller). Pauses inside a line are capped at about 0.12 s and gaps between lines are 0.05–0.25 s. `src/warp.json` is the v4 warp.

**v3:** The narrator is now Bunty (Loud & Expressive), and Party 1 is now Pradeep. Gaps between lines are tighter, the voice is louder and the music is about 6 dB lower with stronger ducking. The animation is re-timed through `src/warp.json`, which maps the old timeline onto the new VO. Times in the table below are from v2; v3 runs about 8% shorter.

| # | Time | Scene | Voiceover |
|---|------|-------|-----------|
| 1 | 0:00–0:11 | Intro: Mishra ji, Mishra Textiles, Kanpur. Name card, "30 saal" badge, Naam ✓ Izzat ✓. Then an Udhaar Register card whose total counts up to ₹22,00,000. | N: ये हैं मिश्रा जी। कानपुर में तीस साल से कपड़े का wholesale business. बाज़ार में नाम है, इज़्ज़त है… और उसी बाज़ार में फँसा है… बाईस लाख रुपये का उधार। |
| 2 | 0:11–0:20 | Phone rings. Three parties give excuses in chat bubbles, then a "KAL PAKKA?" stamp lands. | N: Phone करो, तो वही पुराने बहाने। · Party 1: अरे मिश्रा जी, cheque तो कल ही निकल गया था! · Party 2: इस हफ्ते थोड़ा tight है भाईसाहब… · Party 3: अरे आप तो घर के हो, अगले महीने पक्का! |
| 3 | 0:20–0:25 | Close-up on his face in cool tones, with a thought bubble. | Mishra ji (thinking): अपना ही पैसा है… फिर भी माँगने में शर्म आती है। |
| 4 | 0:25–0:32 | Diwali calendar (9 din baaki), a diya, stock and bonus needs, "Galle mein ₹0", "Sirf intezaar…". | N: ऊपर से दिवाली सिर पर। नया stock चाहिए, staff का bonus देना है… और गल्ले में? सिर्फ़ इंतज़ार। |
| 5 | 0:32–0:38 | Purple wipe. The real VyaparIQ app dashboard opens in a browser, then the logo is revealed. | N: फिर एक दिन, पोते ने laptop पर दिखाया… VyaparIQ. India का AI Collections OS. |
| 6 | 0:39–0:47 | WhatsApp 8:00 AM notification and the real Daily Pulse screenshot, with highlights on collection, target and call list. | N: अब हर सुबह आठ बजे, WhatsApp पर आता है Daily Pulse… |
| 7 | 0:47–0:58 | "Takada ab ~~Mishra ji~~ nahi, VyaparIQ karta hai". Real Receivables Dashboard and Reminder Cascade screenshots, plus an AI voice call card. | N: तक़ादा अब मिश्रा जी नहीं, VyaparIQ करता है… |
| 8 | 0:58–1:08 | "Agle hafte pakka" becomes a Promise-to-Pay card stamped LOGGED. Risk Radar (Prompt / Slow / Risky). The truck stops at a HOLD barrier. | N: हर 'अगले हफ्ते पक्का' अब तारीख के साथ record होता है… |
| 9 | 1:08–1:16 | ₹18,00,000 recovered counter with confetti, then a warm close-up. | N: नतीजा? दिवाली से पहले… अठारह लाख रुपये वापस। · Mishra ji: रिश्ता भी बचा… और पैसा भी आया। |
| 10 | 1:16–1:32 | Real stats bar (10,000+ businesses), "Takada nahi, collection.", and a CTA card with a click on Start Free Trial and vyapariq.in. | N: दस हज़ार से ज़्यादा businesses… सात दिन का free trial, बिना credit card. आज ही शुरू कीजिए, vyapariq.in पर। |

## Notes

- Disclaimer: Mishra ji, Mishra Textiles and all party names and amounts in the story are fictional. They were made up for this film.
- The product screens are taken from the public site vyapariq.in: the hero dashboard images, Daily Pulse, Receivables Dashboard, Reminder Cascade, the stats bar and the logo.
- All audio was generated with ElevenLabs: the VO, two music cues and the SFX.
- Source: `src/index.html` and `src/anim.js` hold the GSAP timeline, seeked frame by frame and rendered with Playwright. `src/mix.py` builds the audio mix.
