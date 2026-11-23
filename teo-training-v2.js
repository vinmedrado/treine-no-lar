/* Téo v2 — real-time visual workout companion; silent and local. */
(function(g,doc){
 'use strict';
 const coach=g.TreineCoach,app=doc.getElementById('app'),mascot=doc.getElementById('tln-coach-mascot');
 if(!coach||!app)return;
 const key='tln-trainer-inline-muted-v1';
 let muted=false,started=false,lastStep=-1,lastPhase='',lastMode='',lastCard=null;
 try{muted=g.localStorage?.getItem(key)==='yes'}catch{}
 const card=()=>doc.getElementById('tln-trainer-inline');
 const reduced=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 function applyMuted(node){
  node.classList.toggle('is-muted',muted);
  const b=node.querySelector('[data-tln-trainer-toggle]');
  if(b){b.textContent=muted?'Mostrar Téo':'Ocultar';b.setAttribute('aria-pressed',String(muted))}
 }
 function mountAvatar(node){
  const slot=node.querySelector('.tln-trainer-avatar');
  if(!slot||slot.querySelector('svg'))return;
  const source=mascot?.querySelector('.tln-mascot-character');
  if(source&&source.cloneNode){slot.replaceChildren(source.cloneNode(true))}
 }
 function startWorkout(){
  started=false;lastStep=-1;lastPhase='';lastMode='';lastCard=null;
  if(mascot)delete mascot.dataset.congratulated;
  coach.close?.();
 }
 function updateWorkout(info){
  if(!info||!Number.isFinite(info.stepIndex))return;
  const node=card();if(!node)return;
  if(lastCard!==node){lastCard=node;applyMuted(node);mountAvatar(node)}
  const secs=Math.max(0,Math.ceil(Number(info.secondsRemaining)||0));
  const rest=!!info.rest,paused=!!info.paused;
  const name=String(info.name||'este movimento').slice(0,150);
  const next=String(info.nextName||'próximo exercício').slice(0,120);
  const phase=String(info.phase||'Treino');
  const changed=info.stepIndex!==lastStep,first=!started;
  const mode=paused?'paused':rest?'rest':secs<=10?'final':changed?'change':'active';
  const lastWasPaused=lastMode==='paused';
  if(changed||mode!==lastMode||first){
   let heading='Téo está com você',msg='Siga no seu ritmo e cuide da execução.';
   if(paused){heading='Treino pausado';msg='Respire e retome quando estiver pronto.'}
   else if(rest){heading='Hora de recuperar';msg='Aproveite a pausa. Próximo movimento: '+next+'.'}
   else if(first){heading='Começou!';msg='Vamos nessa! Primeiro movimento: '+name+'.'}
   else if(mode==='final'){heading='Reta final';msg='Últimos segundos. Mantenha a execução controlada.'}
   else if(changed&&phase!==lastPhase){
    heading=phase;
    msg=phase==='Alongamento'?'Hora de desacelerar e alongar.':
     phase==='Aquecimento'?'Vamos preparar o corpo sem pressa.':'Agora começa o treino principal. Vá no seu ritmo.';
   }else if(changed){heading='Próximo exercício';msg='Agora é '+name+'. Cuide da técnica.'}
   else if(lastWasPaused){heading='Bem-vindo de volta';msg='Treino retomado. Continue com calma.'}
   const title=node.querySelector('#tln-trainer-heading'),body=node.querySelector('#tln-trainer-hint');
   if(title)title.textContent=heading;
   if(body)body.textContent=msg;
   node.dataset.state=mode;
   if(!reduced()&&(changed||mode!==lastMode)){
    node.classList.remove('is-reacting');
    void node.offsetWidth;
    node.classList.add('is-reacting');
   }
  }
  const countdown=node.querySelector('#tln-trainer-seconds');
  if(countdown){
   const show=!paused&&secs<=10;
   countdown.hidden=!show;
   if(show)countdown.textContent=secs+' s';
  }
  started=true;lastStep=info.stepIndex;lastPhase=phase;lastMode=mode;
 }
 function finishWorkout(success){
  started=false;lastStep=-1;lastMode='';lastPhase='';lastCard=null;
  if(!success)return;
  const celebrate=()=>{
   coach.open?.();
   const bubble=doc.getElementById('tln-mascot-message');
   if(bubble)bubble.textContent='Treino concluído! Mais uma sessão registrada. Muito bem!';
  };
  if(g.requestAnimationFrame)g.requestAnimationFrame(celebrate);
  else celebrate();
 }
 app.addEventListener('click',event=>{
  const btn=event.target?.closest?.('[data-tln-trainer-toggle]');
  if(!btn)return;
  muted=!muted;
  try{g.localStorage?.setItem(key,muted?'yes':'no')}catch{}
  const node=card();if(node)applyMuted(node);
 });
 Object.assign(coach,{startWorkout,updateWorkout,finishWorkout,get workoutMuted(){return muted}});
})(window,document);
