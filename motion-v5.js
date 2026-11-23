/* Treine no Lar V5 — Cinematic scene controller.
 * Progressive enhancement: observers are optional; content remains accessible.
 * No changes to Spotify SDK, workouts, history, storage or network.
 */
(function(g){
 'use strict';
 const getApp=()=>document.getElementById('app');
 const reduced=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const coarse=()=>!!g.matchMedia?.('(hover: none), (pointer: coarse)')?.matches;
 let home=null,sceneObserver=null,mutationObserver=null,renderQueued=false,scrollQueued=false;
 let scrollProgress=0,seenHome=false,cleanupEvents=[],scrollListener=false;
 const cleanup=()=>{
  if(sceneObserver){sceneObserver.disconnect();sceneObserver=null}
  cleanupEvents.forEach(fn=>fn());cleanupEvents=[];
 };
 function animateNumbers(panel){
  if(panel.dataset.v5Animated)return;
  panel.dataset.v5Animated='yes';
  if(reduced())return;
  [...panel.querySelectorAll('strong')].slice(0,2).forEach(el=>{
   const original=el.textContent.trim();
   if(!/^\d{1,6}$/.test(original))return;
   const count=Number(original);
   if(!count||!Number.isSafeInteger(count))return;
   const start=g.performance?.now?.()||0;
   const duration=1000;
   const step=now=>{
    if(!el.isConnected||reduced())return;
    const progress=Math.min(1,Math.max(0,(now-start)/duration));
    el.textContent=Math.round(count*(1-Math.pow(1-progress,4))).toLocaleString('pt-BR');
    if(progress<1)g.requestAnimationFrame(step);
    else el.textContent=original;
   };
   g.requestAnimationFrame(step);
  });
 }
 function revealScenes(host){
  const specs=[
   ['.v3-today-photo','v5-mask',0],
   ['.v3-today-detail','v5-slide-right',100],
   ['.v3-stats','v5-slide-right',210],
   ['.v3-section-title','v5-title-wipe',0],
   ['.v3-program:nth-child(1)','v5-lift',0],
   ['.v3-program:nth-child(2)','v5-lift',110],
   ['.v3-program:nth-child(3)','v5-lift',220],
   ['.v3-progress-panel','v5-slide-left',0],
   ['.v3-spotify-panel','v5-slide-right',110]
  ];
  const targets=specs.map(([selector,style,delay])=>{
   const el=host.querySelector(selector);
   if(!el)return null;
   el.classList.add('v5-scene',style);
   el.style.setProperty('--v5-delay',delay+'ms');
   return el;
  }).filter(Boolean);
  if(!g.IntersectionObserver){
   targets.forEach(el=>el.classList.add('is-visible'));
   return;
  }
  sceneObserver=new g.IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    const el=entry.target;
    el.classList.add('is-visible');
    sceneObserver?.unobserve(el);
    if(el.classList.contains('v3-stats'))animateNumbers(el);
   }
  },{root:null,rootMargin:'0px 0px -7% 0px',threshold:.08});
  targets.forEach(el=>sceneObserver.observe(el));
  // Avoid invisible content if the tab was backgrounded during setup.
  if(document.visibilityState==='hidden')targets.forEach(el=>el.classList.add('is-visible'));
 }
 function addHeroDepth(host){
  const hero=host.querySelector('.v3-hero');
  if(!hero||reduced()||coarse())return;
  let frame=0;
  const move=e=>{
   if(frame)return;
   frame=g.requestAnimationFrame(()=>{
    frame=0;
    if(!hero.isConnected)return;
    const b=hero.getBoundingClientRect();
    if(!b.width||!b.height)return;
    const x=Math.max(0,Math.min(100,((e.clientX-b.left)/b.width)*100));
    const y=Math.max(0,Math.min(100,((e.clientY-b.top)/b.height)*100));
    hero.style.setProperty('--v5-x',x.toFixed(1)+'%');
    hero.style.setProperty('--v5-y',y.toFixed(1)+'%');
   });
  };
  const reset=()=>{hero.style.setProperty('--v5-x','36%');hero.style.setProperty('--v5-y','34%')};
  hero.addEventListener('pointermove',move,{passive:true});
  hero.addEventListener('pointerleave',reset,{passive:true});
  cleanupEvents.push(()=>{hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',reset);if(frame)g.cancelAnimationFrame?.(frame)});
 }
 function tiltPrograms(host){
  if(reduced()||coarse())return;
  host.querySelectorAll('.v3-program').forEach(card=>{
   let frame=0,last=null;
   const move=e=>{
    last=e;if(frame)return;
    frame=g.requestAnimationFrame(()=>{
     frame=0;
     if(!card.isConnected||!last)return;
     const r=card.getBoundingClientRect();
     if(!r.width||!r.height)return;
     const x=Math.max(0,Math.min(1,(last.clientX-r.left)/r.width));
     const y=Math.max(0,Math.min(1,(last.clientY-r.top)/r.height));
     card.style.setProperty('--v5-tilt-x',((.5-y)*10).toFixed(2)+'deg');
     card.style.setProperty('--v5-tilt-y',((x-.5)*12).toFixed(2)+'deg');
     card.style.setProperty('--v5-card-x',(x*100).toFixed(1)+'%');
     card.style.setProperty('--v5-card-y',(y*100).toFixed(1)+'%');
    });
   };
   const reset=()=>{card.style.setProperty('--v5-tilt-x','0deg');card.style.setProperty('--v5-tilt-y','0deg')};
   card.addEventListener('pointermove',move,{passive:true});card.addEventListener('pointerleave',reset,{passive:true});
   cleanupEvents.push(()=>{card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',reset);if(frame)g.cancelAnimationFrame?.(frame)});
  });
 }
 function paintScroll(){
  scrollQueued=false;
  if(!home||!home.isConnected||reduced())return;
  const hero=home.querySelector('.v3-hero');
  const photo=hero?.querySelector('.v3-hero-photo img');
  const viewHeight=Math.max(1,g.innerHeight||document.documentElement.clientHeight||600);
  if(hero&&photo&&g.innerWidth>650){
   const rect=hero.getBoundingClientRect();
   if(rect.bottom>0&&rect.top<viewHeight){
    const y=Math.max(-27,Math.min(27,(-rect.top/viewHeight)*35));
    photo.style.setProperty('--v5-photo-y',y.toFixed(1)+'px');
   }
  }
  const docHeight=document.documentElement.scrollHeight-viewHeight;
  const progress=docHeight>0?Math.max(0,Math.min(1,(g.scrollY||0)/docHeight)):0;
  if(Math.abs(progress-scrollProgress)>.001){
   home.style.setProperty('--v5-progress',progress.toFixed(4));
   scrollProgress=progress;
  }
 }
 function scheduleScroll(){if(scrollQueued||!home||reduced())return;scrollQueued=true;if(g.requestAnimationFrame)g.requestAnimationFrame(paintScroll);else paintScroll()}
 function setupImageFallbacks(host){
  host.querySelectorAll('img[data-fallback-src]').forEach(img=>{
   const onError=()=>{
    if(!img.dataset.fallbackTried){
     img.dataset.fallbackTried='yes';
     const fallback=img.dataset.fallbackSrc;
     if(fallback && /^https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg\?/.test(fallback)){
      img.src=fallback;return;
     }
    }
    img.closest('.v3-today-photo')?.classList.add('is-image-unavailable');
   };
   img.addEventListener('error',onError);
   cleanupEvents.push(()=>img.removeEventListener('error',onError));
   if(img.complete && img.naturalWidth===0)onError();
  });
 }
 function setup(host){
  cleanup();
  home=host;
  scrollProgress=-1;
  if(reduced()){host.classList.remove('v5-motion-on');return}
  if(seenHome)host.classList.add('v5-returning');
  revealScenes(host);
  setupImageFallbacks(host);
  addHeroDepth(host);
  tiltPrograms(host);
  host.classList.add('v5-motion-on');
  // Future navigations don't need another full-length intro.
  seenHome=true;
  scheduleScroll();
 }
 function inspect(){
  renderQueued=false;
  const host=getApp()?.querySelector('.v3-home')||null;
  if(host===home)return;
  if(!host){cleanup();home=null;return}
  setup(host);
 }
 function scheduleInspect(){
  if(renderQueued)return;
  renderQueued=true;
  if(g.requestAnimationFrame)g.requestAnimationFrame(inspect);
  else inspect();
 }
 function clickFX(e){
  const t=e.target?.closest?.('.v3-btn-primary,.v3-program');
  if(!t||reduced()||!t.closest('.v3-home'))return;
  const rect=t.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const ripple=document.createElement('span');
  ripple.className='v5-ripple';ripple.setAttribute('aria-hidden','true');
  ripple.style.setProperty('--v5-click-x',(e.clientX-rect.left)+'px');
  ripple.style.setProperty('--v5-click-y',(e.clientY-rect.top)+'px');
  t.appendChild(ripple);
  ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
 }
 function init(){
  const app=getApp();if(!app)return;
  scheduleInspect();
  if(g.MutationObserver){mutationObserver=new g.MutationObserver(scheduleInspect);mutationObserver.observe(app,{childList:true})}
  if(!scrollListener){
   g.addEventListener('scroll',scheduleScroll,{passive:true});
   g.addEventListener('resize',scheduleScroll,{passive:true});
   scrollListener=true;
  }
  app.addEventListener('click',clickFX);
  const mql=g.matchMedia?.('(prefers-reduced-motion: reduce)');
  mql?.addEventListener?.('change',()=>{if(home)setup(home)});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleInspect()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(window);
