/* Marketing Hub V2 — executive overview + decision layer */
(function(){
  const money = n => new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(Number(n)||0);
  const esc = s => String(s ?? '').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const scoreColor = score => score >= 80 ? 'good' : score >= 65 ? 'warn' : 'bad';

  function marketingScore(){
    const d = window.MH?.state?.analytics;
    if(!d) return {score:78, items:[['Publicidad',91,'good'],['Redes sociales',84,'good'],['Contenido',72,'warn'],['Conversión web',58,'bad'],['Clientes',86,'good']]};
    const campaigns=d.marketing.campaigns||[];
    const live=campaigns.filter(c=>c.spend>0);
    const efficient=live.length?live.reduce((a,c)=>a+(c.sales>0?1:0),0)/live.length:0.75;
    const content=(d.content||[]).length ? 78 : 60;
    const score=Math.round(55 + efficient*25 + Math.min(d.social.engagement/6,1)*10 + Math.min(d.sales.conversion/30,1)*10);
    return {score,items:[['Publicidad',Math.round(70+efficient*30),scoreColor(70+efficient*30)],['Redes sociales',84,'good'],['Contenido',content,scoreColor(content)],['Conversión web',Math.min(95,Math.round(d.sales.conversion*2.1)),scoreColor(d.sales.conversion*2.1)],['Clientes',Math.min(95,Math.round(65+d.customers.recurrent/5)),scoreColor(65+d.customers.recurrent/5)]]};
  }

  function renderOverview(){
    const root=document.getElementById('app');
    if(!root || !window.MH?.state?.data) return;
    const d=window.MH.state.data, a=window.MH.state.analytics, rec=window.MH.state.recommendations||[];
    const best=(a?.marketing?.campaigns||[]).slice().sort((x,y)=>(y.sales/(y.spend||1))-(x.sales/(x.spend||1)))[0];
    const score=marketingScore();
    root.innerHTML=`
      <div class="v2-hero"><div><p class="eyebrow">Overview ejecutivo · ${esc(d.business?.type||'Negocio')}</p><h2>Buenos días, ${esc(d.business?.name||'tu negocio')}.</h2><p>Tu marketing está creciendo. Estas son las decisiones que más pueden mover el resultado ahora.</p></div><div class="freshness"><span class="live-dot"></span> Datos demo · actualizado hace 8 min</div></div>
      <section class="v2-kpis">${d.kpis.map(k=>`<div class="v2-kpi"><span>${esc(k.label)}</span><strong>${esc(k.value)}</strong><small class="${k.trend==='up'?'positive':'negative'}">${k.trend==='up'?'↑':'↓'} ${esc(k.delta)} vs. período anterior</small></div>`).join('')}</section>
      <section class="v2-score-grid"><article class="v2-card score-card"><div class="card-head"><div><p class="eyebrow">Marketing Health Score</p><h3>${score.score}<span>/100</span></h3></div><div class="score-ring ${scoreColor(score.score)}"><b>${score.score}</b></div></div><p class="muted">Tu principal oportunidad está en convertir mejor el tráfico y concentrar presupuesto en campañas con ventas comprobadas.</p><div class="score-items">${score.items.map(i=>`<div><span>${esc(i[0])}</span><strong class="${i[2]}">${i[1]}</strong></div>`).join('')}</div></article><article class="v2-card attention-card"><div class="card-head"><div><p class="eyebrow">Atención</p><h3>3 decisiones esta semana</h3></div><span class="attention-count">3</span></div>${rec.slice(0,3).map((r,i)=>`<button class="decision" data-v2-go="recommendations"><span class="decision-num">0${i+1}</span><span><b>${esc(r.title)}</b><small>${esc(r.detected)}</small></span><span>→</span></button>`).join('')}</article></section>
      <section class="v2-two-col"><article class="v2-card"><div class="card-head"><div><p class="eyebrow">Oportunidad</p><h3>La campaña que merece presupuesto</h3></div><span class="pill success">Mejor señal</span></div><div class="opportunity"><div><strong>${esc(best?.name||'Campaña con mejor retorno')}</strong><p>${best?`${best.sales} ventas con $${money(best.spend)} de inversión.`:'Sin datos suficientes.'}</p></div><div class="opportunity-number">${best?((best.sales/(best.spend||1))*1000).toFixed(1):'—'}<small>ventas / $1K</small></div></div><button class="action-link" data-v2-go="advertising">Ver optimización de presupuesto →</button></article><article class="v2-card"><div class="card-head"><div><p class="eyebrow">Contenido</p><h3>Repetí lo que funciona</h3></div><span class="pill neutral">IA + datos</span></div><div class="content-highlight"><div class="content-icon">✦</div><div><strong>Detrás de cocina</strong><p>18.400 de alcance · 1.120 interacciones.</p><small>Supera al resto del contenido demo.</small></div></div><div class="inline-actions"><button class="primary-btn" data-v2-content="1">Crear pieza</button><button class="secondary-btn" data-v2-go="calendar">Programar</button></div></article></section>
      <section class="v2-card ask-card"><div><p class="eyebrow">Ask your data</p><h3>Preguntale a tu negocio.</h3><p class="muted">“¿Por qué bajaron las ventas?” · “¿Qué campaña debería escalar?” · “¿Qué publico esta semana?”</p></div><button class="primary-btn" data-v2-go="ai">Abrir Marketing Manager AI →</button></section>
      <section class="v2-card action-plan"><div class="card-head"><div><p class="eyebrow">Plan de acción</p><h3>Lo que haría un CMO hoy</h3></div><span class="pill neutral">SEE → UNDERSTAND → ACT</span></div><div class="plan-steps"><div><span>01</span><b>Ver</b><p>Detectá dónde está el desvío.</p></div><div><span>02</span><b>Entender</b><p>Conocé la causa y el impacto.</p></div><div><span>03</span><b>Actuar</b><p>Convertí la recomendación en una tarea.</p></div></div></section>`;
    wireOverview();
  }
  function wireOverview(){
    document.querySelectorAll('[data-v2-go]').forEach(el=>el.addEventListener('click',()=>location.hash=el.dataset.v2Go));
    const btn=document.querySelector('[data-v2-content]'); if(btn) btn.addEventListener('click',()=>window.openContentCreateModal?.());
  }

  function enhanceRecommendations(){
    const root=document.getElementById('app'); if(!root) return;
    const rec=window.MH?.state?.recommendations||[];
    root.querySelectorAll('.recommendation').forEach((card,i)=>{
      const r=rec[i]; if(!r) return;
      const old=card.querySelector('.action-box'); if(old) old.classList.add('v2-action-box');
      if(!card.querySelector('.impact-strip')){const strip=document.createElement('div'); strip.className='impact-strip'; strip.innerHTML=`<div><small>Impacto esperado</small><b>${i===0?'Reducir desperdicio de presupuesto':i===1?'Recuperar demanda existente':'Aumentar rendimiento de contenido'}</b></div><div><small>Horizonte</small><b>${i===0?'7 días':'14 días'}</b></div><div><small>Confianza</small><b>${i===0?'Alta':'Media-alta'}</b></div>`; card.prepend(strip);}
    });
  }
  function enhanceAdvertising(){
    const root=document.getElementById('app'); if(!root || root.dataset.v2ads) return;
    const a=window.MH?.state?.analytics?.marketing; if(!a) return;
    const total=a.spend||0, campaigns=a.campaigns||[];
    const recommended=campaigns.map(c=>({name:c.name,current:c.spend,proposed:c.sales?Math.round(c.spend*1.15):Math.round(c.spend*0.65),reason:c.sales?'Escalar con cautela':'Reducir hasta validar'}));
    const box=document.createElement('section'); box.className='v2-card budget-optimizer';
    box.innerHTML=`<div class="card-head"><div><p class="eyebrow">Budget Optimizer</p><h3>Redistribución sugerida</h3><p class="muted">No ejecuta cambios reales. Es una simulación basada en las señales demo actuales.</p></div><span class="pill neutral">$${money(total)} actuales</span></div><div class="budget-table">${recommended.map(x=>`<div><strong>${esc(x.name)}</strong><span>$${money(x.current)}</span><b>→ $${money(x.proposed)}</b><small>${x.reason}</small></div>`).join('')}</div><div class="optimizer-result"><div><small>Presupuesto reasignable</small><strong>$${money(Math.max(0,Math.round(total*0.08)))}</strong></div><div><small>Objetivo</small><strong>Más peso en campañas con ventas</strong></div><button class="primary-btn" onclick="window.__mhToast&&window.__mhToast('Plan preparado. Revisá cada campaña antes de aplicar cambios reales.')">Preparar plan</button></div>`;
    root.appendChild(box); root.dataset.v2ads='1';
  }
  function patchGlobal(){
    window.MH=window.MH||{};
    window.MH.state=window.state;
    window.__mhToast=window.showToast;
    const original=window.renderRoute; if(!original || window.__mhV2Wrapped) return;
    window.__mhV2Wrapped=true;
    window.renderRoute=function(){ original(); setTimeout(()=>{ const r=location.hash.slice(1)||'dashboard'; if(r==='dashboard') renderOverview(); if(r==='recommendations') enhanceRecommendations(); if(r==='advertising') enhanceAdvertising(); },0); };
  }
  document.addEventListener('click',e=>{const q=e.target.closest('.quick-question'); if(q){const input=document.getElementById('aiQuestion'); if(input){input.value=q.textContent.trim(); input.form?.requestSubmit();}}});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(patchGlobal,80));
  window.addEventListener('hashchange',()=>setTimeout(()=>{ const r=location.hash.slice(1)||'dashboard'; if(r==='dashboard') renderOverview(); if(r==='recommendations') enhanceRecommendations(); if(r==='advertising') enhanceAdvertising(); },80));
  window.MHV2={renderOverview,enhanceRecommendations,enhanceAdvertising};
})();
