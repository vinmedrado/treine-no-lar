/* Téo — auxiliar contextual do Treine no Lar.
 * Informa e navega; não lê, envia nem armazena dados pessoais ou de treino.
 * Respeita cronômetro em uso, Spotify aberto e movimento reduzido.
 */
(function(g,doc){
 'use strict';
 const root=doc.getElementById('tln-coach-mascot');
 if(!root)return;
 const svg='<svg class="tln-mascot-character" viewBox="0 0 124 135" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  +'<ellipse cx="62" cy="125" rx="39" ry="6" fill="#0c3264" opacity=".18"/>'
  +'<path class="tln-coach-leg" d="M47 107 44 119m33-12 4 12" stroke="#163b86" stroke-width="11" stroke-linecap="round"/>'
  +'<path d="M28 119h27m17 0h27" stroke="#ff914d" stroke-width="10" stroke-linecap="round"/>'
  +'<path class="tln-coach-arm tln-coach-arm-left" d="M27 75 10 63 8 52" fill="none" stroke="#2461d5" stroke-width="11" stroke-linecap="round"/>'
  +'<path class="tln-coach-arm tln-coach-arm-right" d="M97 75 115 62 119 49" fill="none" stroke="#2461d5" stroke-width="11" stroke-linecap="round"/>'
  +'<circle cx="9" cy="49" r="7" fill="#ff9757"/><circle cx="117" cy="46" r="7" fill="#ff9757"/>'
  +'<rect x="24" y="46" width="76" height="69" rx="17" fill="#fff" stroke="#163d8e" stroke-width="6"/>'
  +'<path class="tln-coach-roof" d="M13 54 62 12 112 54" fill="none" stroke="#2767dc" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
  +'<path d="M44 28h36" stroke="#93ceff" stroke-width="5" stroke-linecap="round"/>'
  +'<path d="M46 74v3m32-3v3" stroke="#113572" stroke-width="7" stroke-linecap="round"/>'
  +'<circle cx="37" cy="88" r="6" fill="#ffaf8b" opacity=".75"/><circle cx="87" cy="88" r="6" fill="#ffaf8b" opacity=".75"/>'
  +'<path d="M51 89q11 13 23 0" fill="none" stroke="#17427e" stroke-width="4.2" stroke-linecap="round"/>'
  +'<path d="M47 54h31" stroke="#f28c4e" stroke-width="7" stroke-linecap="round"/>'
  +'<path d="M48 100h28" stroke="#cce3ff" stroke-width="4" stroke-linecap="round"/>'
  +'</svg>';
 root.innerHTML='<div class="tln-mascot-chat" id="tln-mascot-chat" hidden role="group" aria-label="Dicas do treinador Téo">'
  +'<div class="tln-mascot-chat-head"><strong>Téo · Seu parceiro de treino</strong><button class="tln-mascot-chat-close" type="button" data-tln="close" aria-label="Fechar dica">×</button></div>'
  +'<p id="tln-mascot-message">Vamos colocar o corpo em movimento?</p>'
  +'<div class="tln-mascot-actions" id="tln-mascot-actions"></div>'
  +'<div class="tln-mascot-options"><button type="button" data-tln="minimize">Deixar o Téo menor</button></div>'
  +'</div>'
  +'<button class="tln-mascot-trigger" type="button" data-tln="toggle" aria-controls="tln-mascot-chat" aria-expanded="false" aria-label="Conversar com Téo, treinador virtual">'
  +svg+'<span class="tln-mascot-name">Téo</span></button>';
 const chat=doc.getElementById('tln-mascot-chat'),trigger=root.querySelector('.tln-mascot-trigger');
 const message=doc.getElementById('tln-mascot-message'),actions=doc.getElementById('tln-mascot-actions');
 const app=doc.getElementById('app'),nav=doc.getElementById('nav'),audio=doc.getElementById('viva-music-dock');
 const prefs='tln-coach-small-v1';
 const escape=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const reduced=()=>!!g.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let open=false,lastScreen='',isTraining=false,cheerTimeout=0;
 try{if(g.localStorage?.getItem(prefs)==='yes')root.classList.add('is-snoozed')}catch{}
 function context(){
  const active=nav?.querySelector('button.active')?.dataset.go||'inicio';
  const completed=!!app?.querySelector('.metrics')&&/Treino concluído!/.test(app.textContent||'');
  const workout=!!app?.querySelector('.clockbox')||(nav?.classList.contains('hidden')&&!completed);
  return {active,completed,workout};
 }
 function speak(c){
  let t='Cada treino conta. Quer começar agora?',btn=[['plan','Ver meu plano'],['music','Colocar música']];
  if(c.completed){t='Boa! Mais um treino concluído. Sua constância está crescendo.';btn=[['progress','Ver evolução']]}
  else if(c.active==='professor'){t='Seu plano organiza os dias. Escolha o treino que combina com você.';btn=[['training','Circuitos'],['progress','Meu progresso']]}
  else if(c.active==='progresso'){t='Sua evolução tem história. Veja os registros e celebre o que você já fez.';btn=[['plan','Meu plano']]}
  else if(c.active==='treinos'){t='20, 30 ou 45 minutos? O importante é começar no seu ritmo.';btn=[['plan','Plano semanal'],['music','Ouvir música']]}
  else if(c.active==='ajustes'){t='Os ajustes permitem adaptar seu treino e manter seus registros.';btn=[['plan','Ver plano']]}
  else if(c.active==='exercicios'||c.active==='biblioteca'){t='Movimento com atenção à execução. Consulte as instruções dos exercícios.';btn=[['training','Ver circuitos']]}
  message.textContent=t;
  actions.innerHTML=btn.map(([id,label])=>'<button type="button" data-tln="'+escape(id)+'">'+escape(label)+'</button>').join('');
 }
 function setOpen(next){
  open=!!next&&!isTraining;
  chat.hidden=!open;root.classList.toggle('is-open',open);
  trigger.setAttribute('aria-expanded',String(open));
  if(open){speak(context());root.classList.remove('is-snoozed')}
 }
 function sync(){
  const c=context(),audioOpen=!!audio?.classList.contains('is-open');
  isTraining=c.workout;
  root.hidden=isTraining||audioOpen;
  if(isTraining||audioOpen){setOpen(false);return}
  if(c.completed&&!root.dataset.congratulated){root.dataset.congratulated='yes';root.classList.add('is-cheering');if(cheerTimeout)g.clearTimeout(cheerTimeout);cheerTimeout=g.setTimeout(()=>root.classList.remove('is-cheering'),1000)}
  if(open&&(lastScreen!==c.active))speak(c);
  lastScreen=c.active;
 }
 function go(page){
  if(page==='music'){setOpen(false);g.VivaSpotify?.toggle?.();sync();return}
  const target=({plan:'professor',progress:'progresso',training:'treinos'})[page];
  const navButton=target&&nav?.querySelector('button[data-go="'+target+'"]');
  setOpen(false);
  navButton?.click();
 }
 root.addEventListener('click',ev=>{
  const btn=ev.target.closest('button[data-tln]');if(!btn)return;
  const name=btn.dataset.tln;
  if(name==='toggle')setOpen(!open);
  else if(name==='close')setOpen(false);
  else if(name==='minimize'){
   root.classList.add('is-snoozed');setOpen(false);
   try{g.localStorage?.setItem(prefs,'yes')}catch{}
  }else if(['plan','progress','training','music'].includes(name))go(name);
 });
 doc.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&open){setOpen(false);trigger.focus()}});
 if(app&&g.MutationObserver)new g.MutationObserver(()=>g.requestAnimationFrame?g.requestAnimationFrame(sync):sync()).observe(app,{childList:true});
 if(nav&&g.MutationObserver)new g.MutationObserver(sync).observe(nav,{attributes:true,attributeFilter:['class']});
 if(audio&&g.MutationObserver)new g.MutationObserver(sync).observe(audio,{attributes:true,attributeFilter:['class']});
 if(g.addEventListener)g.addEventListener('pageshow',sync);
 sync();
 g.TreineCoach={get visible(){return !root.hidden},get open(){return open},open:()=>setOpen(true),close:()=>setOpen(false)};
})(window,document);
