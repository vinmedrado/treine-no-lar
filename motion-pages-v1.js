/* Treine no Lar — other-page motion controller.
 * Pairs with Home V5; observes SPA transitions without changing workout logic.
 * Everything is visible before intersection, so a failed observer never hides UI.
 */
(function(g,doc){
 'use strict';
 const app=doc.getElementById('app');
 if(!app)return;
 const reduced=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const catalog={
  professor:[
   ['.plainhead','heading'],['.coach-hero','sweep'],['.coach-library-strip','soft'],
   ['.coach-metrics','card'],['.viva-strength-volume','soft'],['.coach-days','card'],
   ['.coach-daycard','sweep'],['.coach-check','card'],['.coach-feature','card'],
   ['.coach-form','card'],['.coach-review','sweep'],['.coach-gear','card'],['.section','heading']
  ],
  treinos:[
   ['.plainhead','heading'],['.duration-small','card'],['.banner','sweep'],
   ['.phasegrid','card'],['.stage-block','sweep'],['.info','soft'],
   ['.section','heading'],['.primary.cta','soft']
  ],
  exercicios:[
   ['.plainhead','heading'],['.viva-filter-row','side'],
   ['.viva-home-note','soft'],['.viva-ex-directory-card','card']
  ],
  progresso:[
   ['.plainhead','heading'],['.metric','card'],['.card','sweep'],
   ['.viva-weight-shortcut','side'],['.viva-insight','soft'],
   ['.soft-card','sweep'],['.viva-rep-progress','card'],
   ['.coach-review','sweep'],['.history','soft'],['.section','heading']
  ],
  ajustes:[
   ['.plainhead','heading'],['.card.toggler','card'],['.coach-gear','sweep'],
   ['.viva-music-entry','side'],['.card','card'],
   ['.section','heading'],['.coach-form','card']
  ],
  biblioteca:[
   ['.plainhead','heading'],['.library-intro','sweep'],['.library-preview','sweep'],
   ['.library-card','card'],['.library-item','card'],['.library-week','card'],
   ['.library-pagination','soft'],['.section','heading']
  ],
  peso:[
   ['.plainhead','heading'],['.soft-card','sweep'],
   ['#weightform','card'],['.card','card'],['.section','heading'],
   ['.chart','side'],['.history','soft'],['.line','soft']
  ],
  concluido:[
   ['.coach-review','sweep'],['.metrics','card'],['.coach-form','card'],
   ['.primary','soft']
  ]
 };
 const maxTargets=80;
 let previousScreen=null,lastRoot=null,observer=null,scheduled=false,seenVersion=0;
 let cleanupFns=[],mounted=false;
 function dispose(){
  if(observer){observer.disconnect();observer=null}
  cleanupFns.forEach(fn=>fn());cleanupFns=[];
 }
 const isVisible=el=>el&&el.isConnected&&!el.hidden&&!el.closest('[hidden]');
 function sceneList(screen){
  const entries=[],seen=new Set();
  for(const [selector,style] of catalog[screen]||[]){
   let list=[];
   try{list=app.querySelectorAll(selector)}catch{continue}
   for(const el of list){
    if(!isVisible(el)||seen.has(el))continue;
    seen.add(el);entries.push({el,style});
    if(entries.length>=maxTargets)break;
   }
   if(entries.length>=maxTargets)break;
  }
  // Never animate a parent and its children in parallel: text remains readable.
  return entries.filter(x=>!entries.some(other=>other!==x&&other.el.contains(x.el)));
 }
 function lineChart(path){
  if(!path||!path.getTotalLength)return;
  try{
   const length=Math.ceil(path.getTotalLength());
   if(length>0&&length<100000){
    path.parentElement?.style.setProperty('--tln-plot-length',length+3);
    path.parentElement?.classList.add('tln-plot-reveal');
   }
  }catch{}
 }
 function chartVisible(el,screen){
  if(screen==='progresso'&&el.classList.contains('progress-bars'))el.classList.add('tln-chart-live');
  el.querySelectorAll?.('.chartline').forEach(lineChart);
 }
 function process(screen){
  if(reduced())return;
  const scenes=sceneList(screen);
  const charts=[...app.querySelectorAll('.progress-bars,.chart')].filter(isVisible);
  const targets=[...scenes.map(x=>x.el),...charts];
  if(!targets.length)return;
  const styles=new Map(scenes.map(x=>[x.el,x.style]));
  scenes.forEach(({el,style},i)=>{
   el.classList.add('tln-motion-item','tln-motion-'+style);
   el.style.setProperty('--tlnp-delay',Math.min(240,(i%4)*60)+'ms');
  });
  const show=el=>{
   if(!el?.isConnected)return;
   if(styles.has(el))el.classList.add('tln-motion-visible');
   chartVisible(el,screen);
   observer?.unobserve(el);
   // Téo's positioning is recalculated once the reveal settles.
   if(el.classList.contains('tln-motion-item')){
    const onEnd=()=>{
     el.removeEventListener('animationend',onEnd);
     g.TreineMascotPosition?.request?.();
    };
    el.addEventListener('animationend',onEnd,{once:true});
   }
  };
  if(!g.IntersectionObserver){targets.forEach(show);return}
  observer=new g.IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting)show(entry.target);
  },{rootMargin:'0px 0px -4% 0px',threshold:.04});
  targets.forEach(el=>observer.observe(el));
  if(doc.visibilityState==='hidden')targets.forEach(show);
 }
 function inspect(){
  scheduled=false;
  const screen=app.dataset.motionScreen||'';
  const root=app.firstElementChild;
  if(!root)return;
  if(screen==='inicio'||screen==='run'){
   if(screen!==previousScreen){dispose();previousScreen=screen;lastRoot=root}
   return;
  }
  if(screen===previousScreen&&root===lastRoot)return;
  const newTab=screen!==previousScreen;
  // Renders within the same tab update forms, filters and plans. Do not restart
  // every entrance while someone is reading or editing those controls.
  if(!newTab){
   lastRoot=root;
   return;
  }
  dispose();
  previousScreen=screen;lastRoot=root;
  if(!catalog[screen]||reduced())return;
  app.classList.add('tln-page-motion');
  process(screen);
 }
 function schedule(){
  if(scheduled)return;
  scheduled=true;
  if(g.requestAnimationFrame)g.requestAnimationFrame(inspect);
  else inspect();
 }
 function init(){
  if(mounted)return;mounted=true;
  schedule();
  if(g.MutationObserver){
   new g.MutationObserver(schedule).observe(app,{childList:true,subtree:false});
  }
  g.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change',()=>{
   dispose();previousScreen='';lastRoot=null;schedule();
  });
  doc.addEventListener?.('visibilitychange',()=>{if(doc.visibilityState==='visible')schedule()});
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 g.TreinePageMotion={refresh:schedule,get page(){return previousScreen},get supportedPages(){return Object.keys(catalog)}};
})(window,document);
