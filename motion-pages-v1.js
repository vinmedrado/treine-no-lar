/* Treine no Lar: controller for distinct, contextual animations across tabs.
   Keeps the home, workout clock, Téo and Spotify untouched.
   No content is hidden while waiting for intersection or scripts.
 */
(function(g,d){
 'use strict';
 const app=d.getElementById('app');if(!app)return;
 const prefersReduce=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const screens=['professor','treinos','exercicios','progresso','ajustes','biblioteca','peso','concluido'];
 const config={
  professor:[['.plainhead','title',1],['.coach-hero','hero',1],['.coach-days .coach-day','day',5],['.coach-daycard','detail',1],['.coach-form','detail',1]],
  treinos:[['.plainhead','title',1],['.banner','timer',1],['.phasebox.tap','phase',3],['.stage-block','stage',3]],
  exercicios:[['.plainhead','title',1],['.viva-filter-row button','filter',4],['.viva-ex-directory-card','directory',10]],
  progresso:[['.plainhead','title',1],['.metric','metric',4]],
  ajustes:[['.plainhead','title',1],['.card.toggler','toggle',2],['.coach-gear','gear',6]],
  biblioteca:[['.plainhead','title',1],['.library-intro','intro',1],['.library-preview','preview',1],['.library-move','library',10]],
  peso:[['.plainhead','title',1],['.soft-card','weight',1],['.weight-focus','weight-number',1]],
  concluido:[['.metrics .metric','finish',3]]
 };
 let observer=null,queued=false,currentScreen='',renderRoot=null;
 const registered=new WeakSet(),animated=new WeakSet();
 function disconnect(){observer?.disconnect();observer=null}
 function mark(el,screen){
  if(!el||!el.isConnected||animated.has(el))return;
  animated.add(el);el.classList.add('tln-motion-play');
  if(screen==='progresso'||screen==='peso'){
   if(el.classList.contains('progress-bars'))el.classList.add('tln-data-live');
   if(el.classList.contains('chart')){
    for(const path of el.querySelectorAll('.chartline')){
     try{
      const length=Math.ceil(path.getTotalLength?.()||0);
      if(length>0&&length<100000){
       path.parentElement?.style.setProperty('--tln-path',length+2);
       path.parentElement?.classList.add('tln-chart-draw');
      }
     }catch{}
    }
   }
  }
  const done=()=>g.TreineMascotPosition?.request?.();
  el.addEventListener('animationend',done,{once:true});
 }
 function scheduleReveal(el,screen){
  if(!observer){mark(el,screen);return}
  observer.observe(el);
 }
 function scan(){
  if(!screens.includes(currentScreen)||prefersReduce())return;
  const c=config[currentScreen]||[];
  for(const [selector,kind,max] of c){
   const elements=[...app.querySelectorAll(selector)].slice(0,max);
   for(let i=0;i<elements.length;i++){
    const el=elements[i];
    if(el.closest?.('[hidden]')||registered.has(el))continue;
    registered.add(el);
    el.classList.add('tln-motion-'+kind);
    el.style.setProperty('--tln-delay',Math.min(250,i*85)+'ms');
    scheduleReveal(el,currentScreen);
   }
  }
  if(currentScreen==='progresso'||currentScreen==='peso'){
   for(const el of app.querySelectorAll('.progress-bars,.chart')){
    if(registered.has(el))continue;
    registered.add(el);scheduleReveal(el,currentScreen);
   }
  }
 }
 function inspect(){
  queued=false;
  const screen=app.dataset.motionScreen||'';
  const root=app.firstElementChild;
  if(!root)return;
  if(screen!==currentScreen){disconnect();currentScreen=screen;renderRoot=null}
  if(root===renderRoot)return;
  renderRoot=root;
  if(!screens.includes(screen)||prefersReduce())return;
  if(g.IntersectionObserver){
   observer=new g.IntersectionObserver(entries=>{
    for(const e of entries){
     if(!e.isIntersecting)continue;
     mark(e.target,screen);
     observer?.unobserve(e.target);
    }
   },{threshold:.05,rootMargin:'0px 0px -5% 0px'});
  }
  scan();
  if(d.visibilityState==='hidden'){
   for(const el of app.querySelectorAll('[class*="tln-motion-"],.progress-bars,.chart'))mark(el,screen);
  }
 }
 function enqueue(){
  if(queued)return;queued=true;
  if(g.requestAnimationFrame)g.requestAnimationFrame(inspect);else inspect();
 }
 function init(){
  enqueue();
  if(g.MutationObserver){
   new g.MutationObserver(enqueue).observe(app,{attributes:true,attributeFilter:['data-motion-screen'],childList:true,subtree:false});
  }
  g.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change',()=>{disconnect();renderRoot=null;enqueue()});
  app.addEventListener('change',e=>{
   if(app.dataset.motionScreen!=='ajustes')return;
   const target=e.target?.closest?.('label,.coach-gear');
   if(!target)return;
   target.classList.remove('tln-input-feedback');
   void target.offsetWidth;
   target.classList.add('tln-input-feedback');
   target.addEventListener('animationend',()=>target.classList.remove('tln-input-feedback'),{once:true});
  });
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
 g.TreinePageMotion={refresh:enqueue,get page(){return currentScreen},get supportedPages(){return screens}};
})(window,document);
