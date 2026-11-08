from pathlib import Path
import hashlib,json
names=['components/scroll-story/SceneBuild.jsx','components/scroll-story/SceneCreate.jsx','components/scroll-story/MarqueeMerge.jsx','components/ui/works-wheel.tsx','components/common/ProjectPreviewModal.jsx','components/sections/SelectedWork.jsx','components/sections/AboutSection.jsx','components/sections/SkillsSection.jsx','components/sections/ExploringSection.jsx','components/sections/ContactSection.jsx','components/navbar/Navbar.jsx','data/portfolioData.js']
result={n:Path('src',n).read_bytes()==Path('checkpoints/before-cinematic-20261008/src',n).read_bytes() for n in names}
assert all(result.values()),result
old=Path('checkpoints/before-cinematic-20261008/src/components/scroll-story/ScrollStory.jsx').read_text()
new=Path('src/components/scroll-story/ScrollStory.jsx').read_text()
result['Build/Create/merge/gallery choreography']=old[old.index('      story\n'):old.index('      timeline.add(story')]==new[new.index('      story\n'):new.index('      timeline.add(story')]
assert result['Build/Create/merge/gallery choreography']
Path('review/cinematic/preserved.json').write_text(json.dumps(result,indent=2))
print('All 12 preserved components/data files and downstream timeline match the checkpoint.')
