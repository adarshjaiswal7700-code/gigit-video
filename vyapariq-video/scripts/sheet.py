"""Make a contact sheet from out/stills. Usage: python3 scripts/sheet.py OUT.jpg 1.1 4.9 ..."""
import sys
from PIL import Image, ImageDraw
out, ts = sys.argv[1], [float(t) for t in sys.argv[2:]]
W, H = 640, 360
rows = (len(ts) + 2) // 3
im = Image.new('RGB', (W * 3, H * rows), 'white')
for j, t in enumerate(ts):
    x, y = (j % 3) * W, (j // 3) * H
    im.paste(Image.open(f'out/stills/t_{t:.2f}.jpg').resize((W, H)), (x, y))
    d = ImageDraw.Draw(im)
    d.rectangle([x, y, x + 80, y + 22], fill='black')
    d.text((x + 4, y + 4), f'{t}s', fill='yellow')
im.save(out, quality=85)
