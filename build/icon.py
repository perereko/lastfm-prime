# Ícone do Last.fm PRIME: um disco preto com a "costura" brilhante (a linha que une Last.fm e Spotify)
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math, sys
N = 1024
def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
A = (184, 164, 255)   # lavanda do PRIME
B = (255, 120, 214)   # rosa do brilho
G = (94, 230, 181)    # verde do "no Last.fm"

base = Image.new('RGBA', (N, N), (0, 0, 0, 0))
# fundo: quadrado arredondado preto com leve gradiente
mask = Image.new('L', (N, N), 0)
ImageDraw.Draw(mask).rounded_rectangle((40, 40, N - 40, N - 40), radius=230, fill=255)
bg = Image.new('RGBA', (N, N), (0, 0, 0, 255))
grad = Image.new('RGBA', (N, N))
gd = ImageDraw.Draw(grad)
for y in range(N):
    t = y / N
    c = lerp((22, 18, 38), (2, 2, 4), min(1, t * 1.3))
    gd.line([(0, y), (N, y)], fill=c + (255,))
bg = grad
base.paste(bg, (0, 0), mask)

# disco
d = ImageDraw.Draw(base)
cx, cy, R = N // 2, N // 2 + 10, 330
d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=(20, 18, 28, 255), outline=(70, 64, 92, 255), width=6)
for r in range(R - 18, 120, -26):
    shade = 40 + (r % 52 == 0) * 10
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(shade, shade - 2, shade + 12, 255), width=4)
# selo central em degradê
lab = Image.new('RGBA', (N, N), (0, 0, 0, 0))
ld = ImageDraw.Draw(lab)
r0 = 118
for i in range(r0, 0, -1):
    t = 1 - i / r0
    ld.ellipse((cx - i, cy - i, cx + i, cy + i), fill=lerp(A, B, t) + (255,))
base = Image.alpha_composite(base, lab)
d = ImageDraw.Draw(base)
d.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), fill=(0, 0, 0, 255))

# a costura: linha brilhante atravessando o disco
glow = Image.new('RGBA', (N, N), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
y = cy + 6
x0, x1 = 120, N - 120
for x in range(x0, x1):
    t = (x - x0) / (x1 - x0)
    c = lerp(A, B, t)
    gd.line([(x, y - 16), (x, y + 16)], fill=c + (255,))
blur = glow.filter(ImageFilter.GaussianBlur(34))
for _ in range(3): base = Image.alpha_composite(base, blur)
base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(10)))
core = Image.new('RGBA', (N, N), (0, 0, 0, 0))
cd = ImageDraw.Draw(core)
for x in range(x0 + 40, x1 - 40):
    t = (x - x0) / (x1 - x0)
    c = lerp((235, 228, 255), (255, 220, 245), t)
    cd.line([(x, y - 7), (x, y + 7)], fill=c + (255,))
base = Image.alpha_composite(base, core)
# ponto verde (scrobble chegando)
d = ImageDraw.Draw(base)
gx, gy = N - 248, 236
gl = Image.new('RGBA', (N, N), (0, 0, 0, 0))
ImageDraw.Draw(gl).ellipse((gx - 60, gy - 60, gx + 60, gy + 60), fill=G + (160,))
base = Image.alpha_composite(base, gl.filter(ImageFilter.GaussianBlur(30)))
d = ImageDraw.Draw(base)
d.ellipse((gx - 40, gy - 40, gx + 40, gy + 40), fill=G + (255,))

# recorta pelo quadrado arredondado
out = Image.new('RGBA', (N, N), (0, 0, 0, 0))
out.paste(base, (0, 0), mask)
out.save(sys.argv[1] + '/icon-1024.png')
out.resize((512, 512), Image.LANCZOS).save(sys.argv[1] + '/icon.png')
out.save(sys.argv[1] + '/icon.ico', sizes=[(16, 16), (20, 20), (24, 24), (32, 32), (40, 40), (48, 48), (64, 64), (128, 128), (256, 256)])
print('ok')
