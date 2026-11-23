/* Treine no Lar: contagem discreta de acessos desde a ativação.
 * Apenas uma requisição ao contador por sessão de aba; sem dados de treino
 * e sem tokens Spotify. Não é uma métrica de visitantes únicos.
 */
(function(){
 'use strict';
 const el=document.getElementById('site-visits');
 if(!el||location.protocol!=='https:')return;
 const storageKey='treine-no-lar-visit-counted-session-v1';
 let counted=false;
 try{counted=sessionStorage.getItem(storageKey)==='yes'}catch{}
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),6500);
 const endpoint='https://counterapi.com/api/treinenolar.vinmedrado.com/view/site';
 fetch(endpoint+(counted?'?readOnly=true':''),{method:'GET',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal})
 .then(r=>{if(!r.ok)throw Error('Contador indisponível');return r.json()})
 .then(data=>{
  const n=data?.value;
  if(!Number.isSafeInteger(n)||n<0)return;
  el.textContent=n.toLocaleString('pt-BR')+(n===1?' acesso':' acessos');
  el.hidden=false;
  if(!counted)try{sessionStorage.setItem(storageKey,'yes')}catch{}
 }).catch(()=>{}).finally(()=>clearTimeout(timeout));
})();
