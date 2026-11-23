/* Motion Pages V2: functional motion only, without hiding or modifying content. */
(function(g,d){
 'use strict';
 const app=d.getElementById('app');if(!app)return;
 const pages=['professor','treinos','exercicios','progresso','ajustes','biblioteca','peso','concluido'];
 const reduced=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let current=null,io=null,queued=false;
 function charts(screen){
  if(!['progresso','peso'].includes(screen)||reduced())return;
  const list=[...app.querySelectorAll('.progress-bars,.chart')];
  const reveal=el=>{
   if(!el.isConnected)return;
   if(el.classList.contains('progress-bars'))el.classList.add('tln-data-live');
   el.querySelectorAll('.chartline').forEach(path=>{
    try{
     const n=Math.ceil(path.getTotalLength?.()||0);
     if(n>0&&n<100000){
      path.parentElement?.style.setProperty('--tln-path',n+2);
      path.parentElement?.classList.add('tln-chart-draw');
     }
    }catch{}
   });
   io?.unobserve(el);
  };
  if(!g.IntersectionObserver){list.forEach(reveal);return}
  io=new g.IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting)reveal(x.target)}),{threshold:.07});
  list.forEach(x=>io.observe(x));
  if(d.visibilityState==='hidden')list.forEach(reveal);
 }
 function inspect(){
  queued=false;
  const screen=app.dataset.motionScreen||'';
  if(screen===current)return;
  current=screen;io?.disconnect();io=null;
  app.classList.remove('tln-motion-engaged');
  if(!pages.includes(screen)||reduced())return;
  void app.offsetWidth;
  app.classList.add('tln-motion-engaged');
  charts(screen);
  g.TreineMascotPosition?.request?.();
 }
 function schedule(){
  if(queued)return;
  queued=true;
  if(g.requestAnimationFrame)g.requestAnimationFrame(inspect);
  else inspect();
 }
 function init(){
  schedule();
  if(g.MutationObserver)new g.MutationObserver(schedule).observe(app,{attributes:true,attributeFilter:['data-motion-screen'],childList:true});
  g.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener?.('change',()=>{current=null;schedule()});
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
 g.TreinePageMotion={refresh:schedule,get page(){return current},get supportedPages(){return pages}};
})(window,document);