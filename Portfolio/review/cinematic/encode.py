import sys, subprocess
from pathlib import Path
sys.path.insert(0,'review/editorial/tools')
import imageio_ffmpeg
exe=imageio_ffmpeg.get_ffmpeg_exe()
for name,width,crf in [('portrait-scrub-intra',720,20),('portrait-mobile-intra',540,21)]:
 subprocess.run([exe,'-y','-i','public/media/portrait-original.mp4','-an','-vf',f'scale={width}:-2,fps=24','-c:v','libx264','-preset','medium','-crf',str(crf),'-g','1','-bf','0','-pix_fmt','yuv420p','-movflags','+faststart',f'public/media/{name}.mp4'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 p=Path(f'public/media/{name}.mp4'); print(p.name,p.stat().st_size,flush=True)
