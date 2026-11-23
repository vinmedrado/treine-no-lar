/* Treine no Lar V4: progressive enhancement, no tracking or data storage.
   Hero uses CSS; section reveals and real counters use viewport awareness.
   Disabled entirely for users requesting reduced motion.
*/
(function(g){
 'use strict';
 const getRoot=()=>document.querySelector('#app');
 const reduce=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let observer=null,watcher=null,queued=false,frame=0;
 const observe=()=>{
  queued=false;
  if(observer){observer.disconnect();observer=null}
  const root=getRoot(),home=root?.querySelector('.v3-home');
  if(!root)return;
  if(!home||reduce()){
   root.classList.remove('v4-motion-ready');return;
  }
  const selectors='.v3-today-photo,.v3-today-detail,.v3-stats,.v3-section-title,.v3-program,.v3-progress-panel,.v3-spotify-panel';
  const items=[...home.querySelectorAll(selectors)];
  // CSS only hides elements after JS has installed the observer.
  items.forEach((el,i)=>{
   el.classList.add('v4-reveal');
   el.style.setProperty('--v4-delay',((i%3)*115)+'ms');
  });
  if(!g.IntersectionObserver){
   items.forEach(el=>el.classList.add('v4-visible'));
   root.classList.add('v4-motion-ready');
   return;
  }
  observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;
    el.classList.add('v4-visible');
    observer?.unobserve(el);
    if(el.classList.contains('v3-stats'))animateNumbers(el);
   });
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  items.forEach(el=>observer.observe(el));
  root.classList.add('v4-motion-ready');
 };
 function animateNumbers(root){
  if(root.dataset.v4Counted)return;
  root.dataset.v4Counted='yes';
  if(reduce())return;
  const targets=[...root.querySelectorAll('strong')].slice(0,2);
  targets.forEach(el=>{
   const value=el.textContent.trim();
   if(!/^\d{1,6}$/.test(value))return;
   const target=Number(value);
   if(!Number.isSafeInteger(target)||target===0)return;
   const start=g.performance?.now?.()||0;
   const duration=920;
   const tick=now=>{
    if(!el.isConnected)return;
    const p=Math.min(1,Math.max(0,(now-start)/duration));
    const eased=1-Math.pow(1-p,4);
    el.textContent=Math.round(target*eased).toLocaleString('pt-BR');
    if(p<1)g.requestAnimationFrame(tick);
    else el.textContent=value;
   };
   g.requestAnimationFrame(tick);
  });
 }
 function schedule(){
  if(queued)return;
  queued=true;
  if(g.requestAnimationFrame)frame=g.requestAnimationFrame(observe);
  else observe();
 }
 function install(){
  const root=getRoot();if(!root)return;
  schedule();
  if(g.MutationObserver){watcher=new MutationObserver(schedule);watcher.observe(root,{childList:true})}
  const hero=()=>{
   const el=root.querySelector('.v3-hero');
   if(!el||el.dataset.v4Light)return;
   el.dataset.v4Light='yes';
   el.addEventListener('pointermove',event=>{
    if(reduce()||event.pointerType==='touch')return;
    const rect=el.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    el.style.setProperty('--v4-hotspot-x',(((event.clientX-rect.left)/rect.width)*100).toFixed(1)+'%');
    el.style.setProperty('--v4-hotspot-y',(((event.clientY-rect.top)/rect.height)*100).toFixed(1)+'%');
   },{passive:true});
  };
  // The home rerenders with normal SPA navigation; bind the pointer effect per instance.
  if(g.MutationObserver){const bind=new MutationObserver(hero);bind.observe(root,{childList:true})}
  hero();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
})(window);
