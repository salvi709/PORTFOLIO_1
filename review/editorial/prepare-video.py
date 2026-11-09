import sys,subprocess,json
from pathlib import Path
sys.path.insert(0,'review/editorial/tools')
import imageio_ffmpeg
exe=imageio_ffmpeg.get_ffmpeg_exe()
for name,width,crf in [('portrait-scrub',540,21),('portrait-mobile',360,23)]:
 subprocess.run([exe,'-y','-i','public/media/portrait-original.mp4','-an','-vf',f'scale={width}:-2,fps=24','-c:v','libx264','-preset','medium','-crf',str(crf),'-g','6','-keyint_min','6','-sc_threshold','0','-pix_fmt','yuv420p','-movflags','+faststart',f'public/media/{name}.mp4'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
for name,t in [('portrait-poster',0),('portrait-about',7.9)]:
 subprocess.run([exe,'-y','-ss',str(t),'-i','public/media/portrait-original.mp4','-frames:v','1','-q:v','2',f'public/media/{name}.jpg'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print({p.name:p.stat().st_size for p in Path('public/media').glob('portrait*')})
