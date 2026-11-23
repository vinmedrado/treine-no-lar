/* Smart Walk: Téo travels to whitespace when content comes underneath. No camera/API. */
(function(g,doc){
 'use strict';
 const root=doc.getElementById('tln-coach-mascot');
 const app=doc.getElementById('app'),nav=doc.getElementById('nav'),spotify=doc.getElementById('viva-music-dock');
 if(!root||!app)return;
 const screenW=()=>Math.min(doc.documentElement?.clientWidth||g.innerWidth||390,g.innerWidth||390);
 const screenH=()=>g.innerHeight||doc.documentElement?.clientHeight||780;
 const motionOff=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let last=null,timer=0,frame=0,walkTimer=0,initialized=false,concealed=false;
 const valid=r=>r&&r.width>0&&r.height>0&&Number.isFinite(r.left)&&Number.isFinite(r.top);
 const rect=(x,y,w,h)=>({left:x,right:x+w,top:y,bottom:y+h});
 const intersects=(a,b,gap=8)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
 function blockers(top,bottom){
  const blocks=[];
  const add=r=>{if(valid(r)&&r.bottom>top-15&&r.top<bottom+15)blocks.push(r)};
  if(nav&&!nav.classList.contains('hidden'))add(nav.getBoundingClientRect());
  if(spotify&&!spotify.hidden&&g.getComputedStyle?.(spotify)?.display!=='none')add(spotify.getBoundingClientRect());
  // Buttons are protected over their entire tappable area, not just the lettering.
  const clickable=app.querySelectorAll('button,a,input,select,textarea,summary,label,[role="button"],[role="link"]');
  for(let i=0;i<Math.min(280,clickable.length);i++)add(clickable[i].getBoundingClientRect());
  // Text nodes are measured by rendered line, preserving genuine whitespace.
  if(doc.createTreeWalker&&doc.createRange){
   const walker=doc.createTreeWalker(app,g.NodeFilter?.SHOW_TEXT||4);
   const range=doc.createRange();let node,n=0;
   while((node=walker.nextNode())&&n++<760){
    if(!node.textContent?.trim())continue;
    const parent=node.parentElement;
    if(!parent||parent.closest?.('[hidden],script,style'))continue;
    const style=g.getComputedStyle?.(parent);
    if(style?.display==='none'||style?.visibility==='hidden')continue;
    try{
     range.selectNodeContents(node);
     const lines=range.getClientRects();
     for(let j=0;j<lines.length;j++)add(lines[j]);
    }catch{}
   }
  }else{
   const texts=app.querySelectorAll('h1,h2,h3,h4,p,small,strong,b,span,li');
   for(let i=0;i<Math.min(220,texts.length);i++)add(texts[i].getBoundingClientRect());
  }
  const header=doc.querySelector?.('.header');
  if(header)add(header.getBoundingClientRect());
  const dialog=app.querySelector?.('[role="dialog"]');
  if(dialog)add(dialog.getBoundingClientRect());
  return blocks;
 }
 function clear(r,items){
  for(const item of items)if(intersects(r,item))return false;
  return true;
 }
 function find(w,h,items,top,bottom,old){
  const vw=screenW(),left=10,right=vw-w-10;
  if(right<left||bottom-top<h)return null;
  const ox=old?.x??left,oy=old?.y??Math.max(top,bottom-h-10);
  const xs=[ox,left,right,Math.round((vw-w)/2)];
  for(let x=left;x<=right;x+=Math.max(28,w/2))xs.push(x);
  xs.push(right);
  const ys=[oy,top+4,bottom-h-10];
  for(let y=Math.min(bottom-h,oy);y>=top;y-=35)ys.push(y);
  for(let y=bottom-h-10;y>=top;y-=36)ys.push(y);
  const done=new Set();let best=null;
  for(const py of ys)for(const px of xs){
   const x=Math.round(px),y=Math.round(py),key=x+':'+y;
   if(done.has(key))continue;
   done.add(key);
   if(x<left||x+w>vw-10||y<top||y+h>bottom)continue;
   if(!clear(rect(x,y,w,h),items))continue;
   const distance=Math.hypot(x-ox,y-oy);
   const edgeDistance=Math.min(x-left,right-x);
   const score=distance+edgeDistance*.28+Math.abs((bottom-h-10)-y)*.06;
   if(!best||score<best.score)best={x,y,score};
  }
  return best;
 }
 function scene(w,h,old){
  const vw=screenW(),vh=screenH();
  const navBounds=nav&&!nav.classList.contains('hidden')?nav.getBoundingClientRect():null;
  const bottom=Math.min(vh-10,valid(navBounds)&&navBounds.top>0&&navBounds.top<vh?navBounds.top-11:vh-10);
  const head=doc.querySelector?.('.header')?.getBoundingClientRect();
  const top=Math.max(12,valid(head)&&head.bottom>0&&head.bottom<vh?head.bottom+8:12);
  const items=blockers(top,bottom);
  return {top,bottom,items,best:find(w,h,items,top,bottom,old)};
 }
 function place(best,small){
  const changed=!last||Math.abs(last.x-best.x)>3||Math.abs(last.y-best.y)>3||last.small!==small;
  root.classList.toggle('is-auto-docked',small);
  root.classList.remove('is-no-space');concealed=false;
  root.style.left=best.x+'px';root.style.top=best.y+'px';root.style.bottom='auto';
  root.classList.toggle('is-right-side',best.x>screenW()/2);
  if(changed&&initialized&&!motionOff()){
   root.classList.add('is-smart-walking');
   if(walkTimer)g.clearTimeout(walkTimer);
   walkTimer=g.setTimeout(()=>root.classList.remove('is-smart-walking'),760);
  }
  last={x:best.x,y:best.y,small};initialized=true;
 }
 function reposition(){
  if(root.hidden||root.classList.contains('is-open'))return;
  const smallPref=root.classList.contains('is-snoozed');
  const w=smallPref?52:screenW()<=650?66:84;
  const h=smallPref?58:screenW()<=650?80:103;
  const r=root.getBoundingClientRect();
  const old=last||{x:Math.round(r.left),y:Math.round(r.top)};
  const full=scene(w,h,old);
  if(last&&!last.small&&!concealed&&old.x>=10&&old.x+w<=screenW()-10&&old.y>=full.top&&old.y+h<=full.bottom&&clear(rect(old.x,old.y,w,h),full.items))return;
  if(full.best){place(full.best,false);return}
  const mini=scene(38,46,old);
  if(mini.best){place(mini.best,true);return}
  root.classList.add('is-no-space');concealed=true;last=null;
 }
 function schedule(){
  if(frame)return;
  frame=g.requestAnimationFrame?g.requestAnimationFrame(()=>{frame=0;reposition()}):0;
  if(!g.requestAnimationFrame)reposition();
 }
 function later(){if(timer)g.clearTimeout(timer);timer=g.setTimeout(schedule,130)}
 function init(){
  schedule();
  g.addEventListener?.('scroll',later,{passive:true});
  g.addEventListener?.('resize',schedule,{passive:true});
  g.addEventListener?.('pageshow',schedule);
  g.visualViewport?.addEventListener?.('resize',schedule,{passive:true});
  g.visualViewport?.addEventListener?.('scroll',later,{passive:true});
  if(g.MutationObserver){
   new g.MutationObserver(later).observe(app,{childList:true,subtree:false});
   if(nav)new g.MutationObserver(schedule).observe(nav,{attributes:true,attributeFilter:['class']});
   if(spotify)new g.MutationObserver(schedule).observe(spotify,{attributes:true,attributeFilter:['class']});
  }
  if(g.ResizeObserver)new g.ResizeObserver(later).observe(app);
  doc.fonts?.ready?.then(schedule).catch(()=>{});
  app.addEventListener('load',schedule,true);
  root.addEventListener('click',()=>{schedule();g.setTimeout(schedule,65)});
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 g.TreineMascotPosition={reposition,request:schedule,get location(){return last?{...last}:null},get hiddenForSpace(){return concealed}};
})(window,document);
