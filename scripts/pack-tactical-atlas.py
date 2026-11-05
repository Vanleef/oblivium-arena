"""Pack an image-generated 6x6 atlas without redrawing its artwork.
Requires Pillow, NumPy and SciPy. Usage: python scripts/pack-tactical-atlas.py INPUT OUTPUT [COLUMNS ROWS]
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

source, destination = map(Path, sys.argv[1:3])
columns, rows = map(int, sys.argv[3:5]) if len(sys.argv) >= 5 else (6, 6)
im = Image.open(source).convert('RGBA')
a = np.asarray(im)
height, width = a.shape[:2]
if (a[:, :, 3] < 8).mean() < .1:
    raise ValueError('Source has no usable transparent backdrop; regenerate/extract with image generation first')
density = (a[:, :, 3] > 32).sum(axis=1)
bounds = [0]
for row in range(1, rows):
    midpoint = round(row * height / rows)
    radius = round(height / rows * .10)
    bounds.append(min(range(midpoint-radius, midpoint+radius+1), key=lambda y: sum(density[max(0, y-1):y+2]) + abs(y-midpoint)*.2))
bounds.append(height)
frames = []
for row in range(rows):
    for col in range(columns):
        cell = im.crop((round(col*width/columns), bounds[row], round((col+1)*width/columns), bounds[row+1]))
        pixels = np.array(cell)
        labels, count = ndimage.label(pixels[:, :, 3] > 32)
        sizes = np.bincount(labels.ravel())
        keep = np.zeros_like(labels, dtype=bool)
        for label in range(1, count+1):
            yy, xx = np.where(labels == label)
            if sizes[label] < 10:
                continue
            if sizes[label] < max(200, max(sizes[1:], default=0)*.08) and (xx.mean() < cell.width*.18 or xx.mean() > cell.width*.94):
                continue
            keep |= labels == label
        pixels[:, :, 3] = np.where(keep, pixels[:, :, 3], 0)
        clean = Image.fromarray(pixels)
        box = clean.getchannel('A').getbbox()
        if not box:
            raise ValueError(f'Empty sprite cell at row {row}, column {col}')
        frames.append(clean.crop(box))
# If the source clipped its first row at the outer edge, use its complete ready
# pose for idle rather than ship a visibly chopped head or halo.
if columns == 6 and rows == 6 and np.any(a[0, :, 3] > 32):
    frames[:6] = [frames[12].copy() for _ in range(6)]
scale = min(142/max(f.width for f in frames), 142/max(f.height for f in frames))
out = Image.new('RGBA', (columns*160, rows*160))
for index, frame in enumerate(frames):
    resized = frame.resize((max(1, round(frame.width*scale)), max(1, round(frame.height*scale))), Image.Resampling.LANCZOS)
    out.alpha_composite(resized, (index%columns*160+(160-resized.width)//2, index//columns*160+151-resized.height))
destination.parent.mkdir(parents=True, exist_ok=True)
out.save(destination, 'WEBP', quality=88, method=6)
print(destination, destination.stat().st_size, 'bytes; row boundaries:', bounds)
