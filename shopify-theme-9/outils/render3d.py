"""Rendu 3D du sachet final : reprend l'éclairage et la forme de la maquette 3D du 8.11
(old_front.png) et y plaque le nouveau visuel à plat (art_front.png / art_back.png).
Usage : python3 render3d.py  -> out_face.png, out_dos.png (RGBA)"""
import numpy as np, cv2
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
SC = 1.5  # facteur de sortie par rapport à la maquette (947x1605)

def load(p, alpha=True):
    im = Image.open(p).convert('RGBA' if alpha else 'RGB')
    return np.asarray(im).astype(np.float32) / 255.0

R = load('old_front.png')            # maquette 3D (face, perspective légère)
rgb, a = R[..., :3], R[..., 3]
H, W = a.shape

art_f = load('art_front.png', False)
art_b = load('art_back.png', False)

def palette(art):
    hsv = cv2.cvtColor((art * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    h, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    navy = art[(h > 200) & (h < 250) & (s > .35) & (v < .4)]
    yel = art[(h > 40) & (h < 60) & (s > .8) & (v > .85)]
    return np.median(navy, 0), np.median(yel, 0)

NAVY, YEL = palette(art_f)
print('navy', NAVY * 255, 'yellow', YEL * 255)

# 1. classes d'albédo dans la maquette
hsv = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
h, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
c_y = (h > 25) & (h < 70) & (s > .3)
c_n = (h > 195) & (h < 265) & (s > .2) & (v < .6)
c_s = (s < .2) & (v > .42)
k = np.ones((3, 3), np.uint8)
dil = lambda m, n: cv2.dilate(m.astype(np.uint8), k, iterations=n).astype(bool)
ero = lambda m, n: cv2.erode(m.astype(np.uint8), k, iterations=n).astype(bool)
inside = ero(a > .98, 4)
other = ~(c_s | c_n)            # jaune, bords, ombres colorées
c_s = c_s & ~dil(c_n | other, 6) & inside
c_n = c_n & ~dil(c_s | other, 2) & inside
op = lambda m, d: cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (d, d))).astype(bool)
big_s, big_n = op(c_s, 13), op(c_n, 101)
txt_n = c_n & ~dil(big_n, 4)
lum = lambda x: x.mean(-1)

def fill(D, conf, sigs=(2, 4, 8, 16, 32, 80)):
    D = D.copy(); c0 = conf.astype(np.float32).copy()
    for sig in sigs:
        num = cv2.GaussianBlur(D * (c0[..., None] if D.ndim == 3 else c0), (0, 0), sig)
        den = cv2.GaussianBlur(c0, (0, 0), sig)
        f = num / np.maximum(den if D.ndim == 2 else den[..., None], 1e-4)
        m = c0 < .5
        D[m] = f[m]
        c0 = np.maximum(c0, (den > .08).astype(np.float32))
    return D

# éclairage provisoire depuis l'argent seul -> albédo effectif de l'encre marine
Ls0 = fill(np.where(big_s, lum(rgb), 0), big_s)
NAVY_EFF = np.median(rgb[txt_n] / np.maximum(Ls0[txt_n, None], 1e-3), 0)
print('navy eff', NAVY_EFF * 255, txt_n.sum())
# éclairage scalaire L : argent (albédo 1) + grandes zones marine (albédo NAVY_EFF)
Lr = np.zeros(a.shape, np.float32)
Lr[big_s] = lum(rgb)[big_s]
Lr[big_n] = lum(rgb)[big_n] / lum(NAVY_EFF[None])[0]
conf = big_s | big_n
L = fill(Lr, conf)
# trous (ancien texte) : inpainting qui prolonge les reflets voisins
L16 = np.clip(L / 2 * 65535, 0, 65535).astype(np.uint16)
L8 = np.clip(L / 2 * 255, 0, 255).astype(np.uint8)
hole = (~conf & inside).astype(np.uint8)
Li = cv2.inpaint(L8, hole, 9, cv2.INPAINT_NS).astype(np.float32) / 255 * 2
Lfine = L - cv2.GaussianBlur(L, (0, 0), 1.5)
L = np.where(hole.astype(bool), cv2.GaussianBlur(Li, (0, 0), 1.2), L)
L = cv2.GaussianBlur(L, (0, 0), 0.8)
# teinte lente (reflet froid du métal)
Aeff_old = np.ones_like(rgb); Aeff_old[big_n] = NAVY_EFF
T = np.where(conf[..., None], rgb / np.maximum(Aeff_old * L[..., None], 1e-3), 0)
T = fill(T, conf)
T = cv2.GaussianBlur(T, (0, 0), 30)
T = T / T.mean(-1, keepdims=True)

# 2. géométrie : bords par ligne / colonne
mask = a > .5
ys, xs = np.nonzero(mask)
def extents(m, axis):
    idx = np.arange(m.shape[axis])
    has = m.any(axis)
    first = np.where(has, np.argmax(m, axis), 0)
    last = np.where(has, m.shape[axis] - 1 - np.argmax(np.flip(m, axis), axis), 0)
    return first.astype(np.float32), last.astype(np.float32), has
xl, xr, hr = extents(mask, 1)   # par ligne
yt, yb, hc = extents(mask, 0)   # par colonne
# lisse les bords (crans, plis)
def smooth1(v, has, s):
    v = v.copy(); ii = np.arange(len(v)); v[~has] = np.interp(ii[~has], ii[has], v[has])
    return cv2.GaussianBlur(v.reshape(-1, 1), (0, 0), s).ravel()
xl, xr = smooth1(xl, hr, 6), smooth1(xr, hr, 6)
yt, yb = smooth1(yt, hc, 6), smooth1(yb, hc, 6)

def render(art, mirror, vanch):
    """vanch : ancrages (fraction verticale maquette -> fraction visuel)."""
    Ho, Wo = int(H * SC), int(W * SC)
    gy, gx = np.mgrid[0:Ho, 0:Wo].astype(np.float32) / SC
    Lm, Cm, Am = L, T, a
    if mirror:
        Lm, Cm, Am = L[:, ::-1], T[:, ::-1], a[:, ::-1]
        XL, XR, YT, YB = W - 1 - xr, W - 1 - xl, yt[::-1], yb[::-1]
    else:
        XL, XR, YT, YB = xl, xr, yt, yb
    yi = np.clip(gy, 0, H - 1).astype(int); xi = np.clip(gx, 0, W - 1).astype(int)
    xf = (gx - XL[yi]) / np.maximum(XR[yi] - XL[yi], 1)
    yf = (gy - YT[xi]) / np.maximum(YB[xi] - YT[xi], 1)
    # bombé : le visuel se resserre un peu vers les bords latéraux
    kk = .55
    u = .5 + .5 * np.sin((xf - .5) * np.pi * kk) / np.sin(np.pi * kk / 2)
    v = np.interp(yf, [p[0] for p in vanch], [p[1] for p in vanch])
    ah, aw = art.shape[:2]
    # visuel préfiltré à la taille de sortie (netteté sans crénelage)
    tw = int(Wo * 1.15); th = int(tw * ah / aw)
    art_s = cv2.resize(art, (tw, th), interpolation=cv2.INTER_AREA)
    mx = np.clip(u, 0, 1) * (tw - 1); my = np.clip(v, 0, 1) * (th - 1)
    A = cv2.remap(art_s, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    rs = lambda x: cv2.resize(x, (Wo, Ho), interpolation=cv2.INTER_CUBIC)
    Lo, Co, Ao = rs(Lm), rs(Cm), rs(Am)
    A2 = np.clip(1 - (1 - A) * (1 - NAVY_EFF) / (1 - NAVY), 0, 1)
    # l'encre réfléchit moins le décor que le métal nu : reflets adoucis sur l'encre
    Ls = cv2.GaussianBlur(Lo, (0, 0), 10 * SC)
    ink = np.clip((0.8 - A.mean(-1)) / 0.45, 0, 1)
    Leff = Lo + (Ls - Lo) * 0.4 * ink
    out = np.clip(A2 * Leff[..., None] * Co, 0, 1)
    return np.dstack([out, np.clip(Ao, 0, 1)])

face = render(art_f, False, [(0, 0), (.075, .0876), (.187, .207), (.947, .937), (1, 1)])
dos = render(art_b, True, [(0, 0), (.075, .0876), (.187, .209), (.947, .936), (1, 1)])
for n, im in (('out_face.png', face), ('out_dos.png', dos)):
    Image.fromarray((im * 255 + .5).astype(np.uint8), 'RGBA').save(n)
    bg = Image.new('RGBA', (im.shape[1], im.shape[0]), (236, 238, 242, 255))
    bg.alpha_composite(Image.open(n)); bg.convert('RGB').save(n.replace('.png', '_bg.jpg'), quality=90)
np.save('L.npy', L); Image.fromarray(np.clip(L*200,0,255).astype(np.uint8)).save('L.png')
print('ok', face.shape)
