import sys, json
from PIL import Image
ui = Image.open(sys.argv[1]).convert('RGB')
layers = json.loads(open(sys.argv[3]).read())
for l in layers:
    im = Image.open(l['png']).convert('RGB').resize((l['b']['width'], l['b']['height']))
    ui.paste(im, (l['b']['x'], l['b']['y']))
ui.save(sys.argv[2])
