(() => {
  const getModal = () => document.getElementById('calendarCreateModal');
  const close = () => { const m=getModal(); if(!m)return; m.classList.remove('is-open'); m.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); };
  const open = () => {
    let m=getModal();
    if(!m){
      document.body.insertAdjacentHTML('beforeend',`<div class="calendar-create-backdrop" id="calendarCreateModal" aria-hidden="true"><section class="calendar-create-modal" role="dialog" aria-modal="true" aria-labelledby="calendarCreateTitle"><button class="calendar-modal-close" type="button" data-calendar-close aria-label="Cerrar">×</button><div class="calendar-modal-heading"><div class="calendar-modal-icon">□</div><div><p class="eyebrow">Calendario</p><h2 id="calendarCreateTitle">Agregar acción</h2><p>Programá una acción de marketing y mantené tu plan en movimiento.</p></div></div><label class="calendar-field">Nombre de la acción<input id="calendarActionTitle" type="text" maxlength="120" placeholder="Ej: Publicar reel detrás de cocina" autofocus></label><div class="calendar-field-row"><label class="calendar-field">Fecha<input id="calendarActionDate" type="date" value="2026-09-20"></label><label class="calendar-field">Tipo<select id="calendarActionType"><option>Contenido</option><option>Promoción</option><option>Clientes</option><option>Publicidad</option><option>Otro</option></select></label></div><div class="calendar-modal-actions"><button type="button" class="secondary-btn" data-calendar-close>Cancelar</button><button type="button" class="primary-btn" id="calendarActionSave">+ Agregar acción</button></div></section></div>`);
      m=getModal();
      m.querySelectorAll('[data-calendar-close]').forEach(b=>b.addEventListener('click',close));
      m.addEventListener('click',e=>{if(e.target===m)close();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&getModal()?.classList.contains('is-open'))close();});
      m.querySelector('#calendarActionSave').addEventListener('click',save);
    }
    m.classList.add('is-open');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>m.querySelector('#calendarActionTitle')?.focus(),60);
  };
  const save = async () => {
    const title=document.getElementById('calendarActionTitle')?.value.trim();
    const date=document.getElementById('calendarActionDate')?.value;
    const type=document.getElementById('calendarActionType')?.value||'Contenido';
    if(!title){window.__mhToast?.('Escribí el nombre de la acción.');document.getElementById('calendarActionTitle')?.focus();return;}
    if(!date){window.__mhToast?.('Elegí una fecha.');return;}
    const button=document.getElementById('calendarActionSave');button.disabled=true;button.textContent='Guardando…';
    try{const token=localStorage.getItem('mh_token');const r=await fetch('/api/calendar',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({title,date,type})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'No se pudo agregar la acción.');close();window.__mhToast?.('Acción agregada al calendario.');window.renderRoute?.();}
    catch(e){window.__mhToast?.(e.message||'No se pudo agregar la acción.');}
    finally{button.disabled=false;button.textContent='+ Agregar acción';}
  };
  window.openCalendarCreateModal=open;window.closeCalendarCreateModal=close;
})();