from PIL import Image
f=Image.open('voltiz-sachet-3d-v2-face.webp').convert('RGBA'); b=Image.open('voltiz-sachet-3d-v2-dos.webp').convert('RGBA')
W,H=f.size
N=56
def edges(im,y):
    a=im.getchannel('A'); row=[x for x in range(W) if a.getpixel((x,y))>128]
    return (row[0],row[-1]) if row else None
def col(im,x,y,dx):
    px=[im.getpixel((min(W-1,max(0,x+dx*k)),yy)) for k in range(4,14) for yy in range(max(0,y-6),min(H,y+7),3)]
    px=[p for p in px if p[3]>200] or px
    return tuple(sum(p[i] for p in px)//len(px) for i in range(3))
y0,y1=7,1543
out=[]
for i in range(N):
    ya=y0+(y1-y0)*i/N; yb=y0+(y1-y0)*(i+1)/N; y=int((ya+yb)/2)
    ef=edges(f,y); eb=edges(b,y)
    if not ef: continue
    # card right: front right edge, back left edge mirrored ; card left: front left, back right mirrored
    if eb:
        xr=(ef[1]+(W-1-eb[0]))/2; xl=(ef[0]+(W-1-eb[1]))/2
    else: xr,xl=ef[1],ef[0]
    cr=col(f,ef[1],y,-1); cl=col(f,ef[0],y,1)
    out.append((ya/H*100,(yb-ya)/H*100,(xr+1)/W*100-50,50-xl/W*100,cr,cl))
html=[]
for top,h,dr,dl,cr,cl in out:
    hx=lambda c:'#%02x%02x%02x'%c
    html.append(f'<i class="pouch__edge pouch__edge--r" style="top:{top:.2f}%;height:{h+0.35:.2f}%;--d:{dr:.2f}cqw;--c:{hx(cr)}"></i>')
    html.append(f'<i class="pouch__edge pouch__edge--l" style="top:{top:.2f}%;height:{h+0.35:.2f}%;--d:{dl:.2f}cqw;--c:{hx(cl)}"></i>')
open('edges.html','w').write(''.join(html))
print(len(html), sum(len(x) for x in html))
for r in out[::8]: print(['%.2f'%v if isinstance(v,float) else v for v in r])
