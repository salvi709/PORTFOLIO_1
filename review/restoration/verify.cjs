const {chromium}=require('C:/Users/Sarthak Salvi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});const checks=[],errors=[],metrics={};
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.mesh={curves:[],frames:0,durations:[]};const proto=CanvasRenderingContext2D.prototype;
  const clear=proto.clearRect,curve=proto.quadraticCurveTo,raf=window.requestAnimationFrame;
  proto.clearRect=function(...args){if(this.canvas.classList.contains('interactive-mesh')){window.mesh.curves=[];window.mesh.frames++;}return clear.apply(this,args)};
  proto.quadraticCurveTo=function(...args){if(this.canvas.classList.contains('interactive-mesh'))window.mesh.curves.push(args);return curve.apply(this,args)};
  window.requestAnimationFrame=cb=>raf.call(window,t=>{const n=window.mesh.frames,start=performance.now();cb(t);if(window.mesh.frames>n)window.mesh.durations.push(performance.now()-start)});
 });
 const url=process.env.PORTFOLIO_URL||'http://127.0.0.1:4173';
 const pause=ms=>page.waitForTimeout(ms),shot=name=>page.screenshot({path:`review/restoration/${name}.png`});
 const load=async()=>{await page.goto(url);await page.evaluate(()=>document.fonts.ready);await pause(4800)};
 await load();
 for(const selector of ['.hero-meta','.hero-meta > span','.hero-tagline','.hero-link','.hero-bottom','.title-line'])assert.equal(await page.locator(selector).first().evaluate(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).visibility==='visible'),true,selector);
 await shot('hero-final');checks.push('Opening completes with name, supporting copy, identity and scroll cue visible');
 const neutral=await page.evaluate(()=>mesh.curves);await page.mouse.move(1100,730);await pause(1100);
 const bent=await page.evaluate(()=>mesh.curves.slice(0,Math.ceil(innerHeight/64+3)*(Math.ceil(innerWidth/64+3)-2)+(Math.ceil(innerWidth/64+3))*(Math.ceil(innerHeight/64+3)-2)));
 const shifts=neutral.map((p,i)=>Math.hypot(p[0]-bent[i][0],p[1]-bent[i][1]));
 metrics.meshMaxDisplacement=Math.max(...shifts);assert.ok(metrics.meshMaxDisplacement>10&&metrics.meshMaxDisplacement<25);assert.ok(shifts.filter(x=>x===0).length>neutral.length*.7);
 await shot('mesh-deformed');await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointerleave')));await pause(1600);
 const rest=await page.evaluate(()=>mesh.curves);assert.ok(neutral.every((p,i)=>Math.hypot(p[0]-rest[i][0],p[1]-rest[i][1])<.05));
 const frames=await page.evaluate(()=>mesh.frames);await pause(250);assert.equal(await page.evaluate(()=>mesh.frames),frames);
 metrics.meshFrameMs=await page.evaluate(()=>{const s=mesh.durations.slice(3).sort((a,b)=>a-b);return {median:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],samples:s.length}});
 checks.push('Canvas vertices displace near pointer, distant geometry stays fixed, springs return to neutral, frame loop sleeps');
 const range=()=>page.locator('#hero').evaluate(e=>e.offsetHeight-innerHeight);
 const go=async t=>{await page.evaluate(y=>{scrollTo(0,y);return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))},(await range())*t/11.96);await pause(200)};
 const state=()=>page.locator('.story-frame,.echo-frame,.scene-build,.scene-create,.scene-merge,.playhead,.title-mask,.works-wheel button > span,.works-wheel > div:first-child').evaluateAll(els=>els.map(e=>{const s=getComputedStyle(e);return [s.transform,s.opacity,s.clipPath,s.left,s.top,s.width,s.height]}));
 assert.equal(await page.locator('.pin-spacer').count(),1);
 for(const t of [2.2,3.15,4.5,6.1,7.5,8.4,9.8]){
  await go(t);const first=await state();await go(t+.6);await go(t);assert.deepEqual(await state(),first,`reverse at ${t}`);await pause(350);assert.deepEqual(await state(),first,`idle at ${t}`);
 }
 checks.push('Seven story/gallery positions reverse exactly and remain unchanged when scrolling stops');
 await go(4.5);metrics.filmRatio=await page.locator('.story-frame').evaluate(e=>e.clientWidth/e.clientHeight);assert.ok(Math.abs(metrics.filmRatio-16/9)<.02);
 metrics.cinematicPageShare=await page.locator('#about').evaluate(e=>{return (e.getBoundingClientRect().top+scrollY)/document.documentElement.scrollHeight});
 for(const [name,t] of [['build-final',2.2],['create-final',4.5],['merge-final',6.35],['handoff-final',7.5],['ring-final',7.9],['drum-final',9.2]]){await go(t);await shot(name)}
 await page.locator('nav a').filter({hasText:'Edits'}).click();await pause(400);assert.match(await page.locator('.works-wheel h3').innerText(),/Cinematic Edit/i);checks.push('Edits link selects first film in the embedded wheel');
 const opener=page.locator('.wheel-index-button').first();await opener.click();await pause(200);
 assert.equal(await page.locator('dialog').evaluate(e=>e.open),true);assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close project preview');
 for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true)}
 for(let i=0;i<7;i++){await page.keyboard.press('ArrowRight');await pause(60)}assert.match(await page.locator('#preview-modal-title').innerText(),/Splitzy/i);
 await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});assert.equal(await opener.evaluate(e=>e===document.activeElement),true);checks.push('All seven project dialogs, wrapping navigation, keyboard focus containment and Escape restoration');
 for(const id of ['about','skills','contact']){await page.locator(`nav a[href="#${id}"]`).click();await pause(700);await shot(`${id}-final`)}
 for(const size of [{width:1366,height:620},{width:768,height:1024},{width:390,height:844},{width:320,height:640}]){
  await page.setViewportSize(size);await load();assert.equal(await page.locator('.pin-spacer').count(),1);assert.equal(await page.locator('.works-wheel').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(size.width>=700){assert.equal(await page.locator('.cinematic').count(),1);await go(2.2);await shot(`build-${size.width}-final`);await go(4.5);await shot(`create-${size.width}-final`)}
  else {assert.equal(await page.locator('.cinematic').count(),0);await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true')}
  await page.locator('nav a').filter({hasText:'Edits'}).click();await pause(700);assert.match(await page.locator('.works-wheel h3').innerText(),/Cinematic Edit/i,`Edits at ${size.width}`);await shot(`gallery-${size.width}-final`);
  await page.locator('.wheel-index-button').last().click();await pause(600);assert.match(await page.locator('#preview-modal-title').innerText(),/Visual Story/i);assert.equal(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true,`dialog overflow at ${size.width}`);await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
  checks.push(`${size.width}×${size.height}: original wheel, one pin, no overflow, Edits and project dialog work`);
 }
 // Change modes without navigation to exercise effect teardown and StrictMode.
 for(const width of [1440,390,768,320,1440]){await page.setViewportSize({width,height:900});await pause(700);assert.equal(await page.locator('.pin-spacer').count(),1,`pins after resize ${width}`);assert.equal(await page.locator('.works-wheel').count(),1)}
 await page.emulateMedia({reducedMotion:'reduce'});await pause(600);assert.equal(await page.locator('.pin-spacer').count(),0);assert.equal(await page.locator('.work-list-card').count(),7);
 assert.equal(await page.locator('.section-heading h2').evaluateAll(es=>es.some(e=>getComputedStyle(e).opacity==='0')),false);
 const staticMesh=await page.evaluate(()=>JSON.stringify(mesh.curves));await page.mouse.move(550,450);await pause(200);assert.equal(await page.evaluate(()=>JSON.stringify(mesh.curves)),staticMesh);
 await page.emulateMedia({reducedMotion:'no-preference'});await pause(600);assert.equal(await page.locator('.pin-spacer').count(),1);assert.equal(await page.locator('.works-wheel').count(),1);
 checks.push('Repeated breakpoint and motion-preference changes clean up pins; reduced-motion content remains readable with static mesh');
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await touch.goto(url);await touch.waitForTimeout(500);assert.equal(await touch.evaluate(()=>matchMedia('(hover: hover) and (pointer: fine)').matches),false);await touch.close();
 checks.push('Touch device does not activate cursor deformation');
 assert.deepEqual(errors,[]);checks.push('No browser runtime errors');
 fs.writeFileSync('review/restoration/results.json',JSON.stringify({checks,metrics,errors},null,2));console.log(JSON.stringify({checks,metrics,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
