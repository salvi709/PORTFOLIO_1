const {chromium}=require('C:/Users/Sarthak Salvi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});const results=[];
try{for(const [name,w,h,motion] of [['desktop',1440,900,'no-preference'],['mobile',390,844,'no-preference'],['tablet',820,1180,'no-preference'],['reduced',1440,900,'reduce']]){
const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:motion});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:3001');await p.waitForTimeout(2400);await p.screenshot({path:`review/editorial/${name}-hero.png`});
const initial=await p.evaluate(()=>({video:document.querySelector('video').currentTime,duration:document.querySelector('video').duration,paused:document.querySelector('video').paused,overflow:document.documentElement.scrollWidth>innerWidth,theme:document.documentElement.dataset.theme,entry:!!document.querySelector('.entry-transition')}));
if(motion!=='reduce'){
 const span=await p.evaluate(async()=>{const source=await (await fetch('/src/components/scroll-story/ScrollStory.jsx')).text();const url=source.match(/from ["']([^"']*gsap_ScrollTrigger[^"']*)["']/)[1];const {ScrollTrigger}=await import(url);const s=ScrollTrigger.getAll().find(t=>t.vars.id==='portfolio-story')||ScrollTrigger.getAll().find(t=>t.pin?.classList.contains('editorial-hero'));return {start:s.start,end:s.end,duration:s.animation.duration(),desktop:!!s.vars.id};});
 for(const [label,frac] of [['mid',span.desktop?1.8/span.duration:.4],['final',span.desktop?3.6/span.duration:.82],['transition',span.desktop?4/span.duration:.92],['build',span.desktop?5.3/span.duration:1],['create',span.desktop?7.6/span.duration:1],['merge',span.desktop?9.6/span.duration:1]]){
  if(!span.desktop&&['build','create','merge'].includes(label))continue;
  await p.evaluate(y=>scrollTo(0,y),span.start+(span.end-span.start)*frac);await p.waitForTimeout(400);await p.screenshot({path:`review/editorial/${name}-${label}.png`});results.push({name,label,...await p.evaluate(()=>({time:document.querySelector('video').currentTime,paused:document.querySelector('video').paused,bg:getComputedStyle(document.querySelector('.story-stage')).backgroundColor,theme:document.documentElement.dataset.theme}))});
 }
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);initial.reversed=await p.locator('video').first().evaluate(v=>v.currentTime);
}
await p.locator('a.hero-link').click({force:true});await p.waitForTimeout(500);await p.screenshot({path:`review/editorial/${name}-gallery.png`});
await p.locator('#about').scrollIntoViewIfNeeded();await p.waitForTimeout(1200);await p.screenshot({path:`review/editorial/${name}-about.png`});
await p.locator('#contact').scrollIntoViewIfNeeded();await p.waitForTimeout(1200);await p.screenshot({path:`review/editorial/${name}-contact.png`});results.push({name,initial,errors});await p.close();}
fs.writeFileSync('review/editorial/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
