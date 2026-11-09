from pathlib import Path
import re, colorsys
def neutral(m):
 h=m.group()[1:]; rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 hue,sat,val=colorsys.rgb_to_hsv(*rgb)
 if .57<hue<.94 and sat>.035:
  v=round(sum(a*b for a,b in zip(rgb,[.2126,.7152,.0722]))*255)
  return '#'+f'{v:02x}'*3+h[6:]
 return m.group()
for name in ['src/styles/portfolio.css','src/styles/polish.css','src/components/common/ProjectVisual.jsx']:
 p=Path(name);s=p.read_text();s=re.sub(r'#[\da-fA-F]{8}\b|#[\da-fA-F]{6}\b',neutral,s)
 if name.endswith('portfolio.css'):
  s=s[s.index(':root {'):]
  s=s.replace('"Fuzamic", "Modero", sans-serif','"Instrument Serif", Georgia, serif').replace('"Modero", Manrope','Manrope')
  s=s.replace('rgba(139, 124, 255, 0.12)','rgba(223, 255, 0, 0.12)')
 p.write_text(s)
p=Path('src/data/wheelItems.js');s=p.read_text().replace('#8A7CFF','#DFFF00');p.write_text(s)
p=Path('src/components/ui/liquid-shader.tsx');s=p.read_text();s=s.replace('    // Resize & mouse','    // Resize to the entry container; no global pointer listeners.');s=re.sub(r'    const onMouseMove = \(e: MouseEvent\) => \{.*?\n    \};\n','',s,flags=re.S);p.write_text(s)
p=Path('src/hooks/useScrubVideo.js');s=p.read_text().replace('video.duration - 1 / 24','video.duration - .001');p.write_text(s)
