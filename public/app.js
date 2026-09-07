const state = { data: null, route: location.hash.slice(1) || 'dashboard' };
const app = document.getElementById('app');
const title = document.getElementById('pageTitle');
const toast = document.getElementById('toast');

const api = async (path, options = {}) => {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
};

const money = n => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
const showToast = msg => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); };

function setActive(route) {
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === route));
  document.getElementById('sidebar').classList.remove('open');
}

function renderDashboard() {
  const d = state.data;
  const sales = 245000;
  const status = sales >= 230000 ? ['Tu negocio está funcionando bien', 'El período muestra crecimiento en ventas, clientes y leads. Podés enfocarte en mejorar la eficiencia de las campañas.', 'good'] : ['Hay oportunidades de mejora', 'Revisá las principales recomendaciones para decidir dónde actuar primero.', 'warn'];
  return `
    <div class="intro"><h2>¿Cómo está tu negocio hoy?</h2><p>Un resumen ejecutivo de lo más importante, sin llenar la pantalla de métricas.</p></div>
    <section class="status ${status[2]}"><div><strong>${status[0]}</strong><p class="muted">${status[1]}</p></div><button class="link-btn" onclick="location.hash='recommendations'">Ver recomendaciones</button></section>
    <div class="section-head"><h3>Indicadores principales</h3><p>Comparación con el período anterior cuando hay datos.</p></div>
    <div class="kpi-grid">${d.kpis.map(k => `<div class="kpi"><span class="kpi-label">${k.label}</span><div class="kpi-value">${k.value}</div><span class="trend ${k.trend}">${k.trend === 'up' ? '↑' : '↓'} ${k.delta}</span></div>`).join('')}</div>
    <div class="split">
      <div class="panel"><div class="section-head"><h3>Lo mejor de este período</h3></div><div class="insight"><strong>La campaña “Cumpleaños La Esquina” está impulsando ventas.</strong><span class="muted">29 ventas con $18.000 de inversión.</span></div><div class="insight"><strong>El contenido detrás de cocina está funcionando.</strong><span class="muted">18.400 personas alcanzadas y 1.120 interacciones.</span></div></div>
      <div class="priority"><span class="priority-tag">Prioridad de hoy</span><h3>Revisar “Promo viernes”</h3><p>Gastó $27.500 y no generó ventas.</p><button class="primary-btn" onclick="location.hash='recommendations'">Ver recomendación</button></div>
    </div>`;
}

function renderAnalytics() {
  return `<div class="intro"><h2>Entendé qué está pasando y por qué.</h2><p>Los datos se convierten en explicaciones simples para que puedas tomar decisiones.</p></div>
  <div class="tabs"><button class="tab active" data-tab="sales">Ventas</button><button class="tab" data-tab="marketing">Marketing</button><button class="tab" data-tab="customers">Clientes</button><button class="tab" data-tab="social">Redes sociales</button></div>
  <div id="analyticsBody"></div>`;
}

function renderAnalyticsBody(tab = 'sales') {
  const d = state.analytics;
  const bodies = {
    sales: `<div class="two-col"><div class="panel"><div class="metric-line"><b>Ventas</b><strong>$${money(d.sales.current)}</strong><span class="trend up">↑ 12%</span></div><div class="metric-line"><b>Clientes nuevos</b><strong>${d.sales.newCustomers}</strong><span class="trend up">↑ 8%</span></div><div class="metric-line"><b>Clientes recurrentes</b><strong>${d.sales.recurrentCustomers}</strong><span class="trend up">↑ 9%</span></div><div class="metric-line"><b>Conversión</b><strong>${d.sales.conversion}%</strong><span class="trend up">↑ 3 pp</span></div><div class="metric-line"><b>Ticket promedio</b><strong>$${money(d.sales.averageTicket)}</strong><span class="subtext">estimado</span></div><div class="chart"><span class="bar" style="height:48%"></span><span class="bar" style="height:58%"></span><span class="bar" style="height:52%"></span><span class="bar" style="height:66%"></span><span class="bar" style="height:62%"></span><span class="bar" style="height:78%"></span><span class="bar" style="height:88%"></span></div><div class="legend"><span>Sem 1</span><span>Sem 7</span></div></div><div class="panel"><h3>¿Qué significa?</h3><p class="muted">La conversión indica qué porcentaje de las personas que realizaron una consulta terminaron comprando.</p><details class="explain"><summary>Ver explicación completa</summary><p><b>Qué estamos midiendo:</b> consultas que terminan en venta.</p><p><b>Qué está pasando:</b> la conversión llegó a 27%.</p><p><b>Por qué importa:</b> una mejora indica que una mayor parte de las oportunidades termina en una compra.</p></details></div></div>`,
    marketing: `<div class="panel"><div class="metric-line"><b>Inversión</b><strong>$${money(d.marketing.spend)}</strong><span class="trend down">↓ 4%</span></div><div class="metric-line"><b>Leads</b><strong>${d.marketing.leads}</strong><span class="trend up">↑ 15%</span></div><div class="metric-line"><b>Costo por lead</b><strong>$${money(d.marketing.cpl)}</strong><span class="subtext">promedio</span></div><div class="section-head"><h3>Rendimiento por campaña</h3></div><div class="campaign-grid">${d.marketing.campaigns.map(c => `<div class="campaign ${c.performance}"><strong>${c.name}</strong><span>$${money(c.spend)}</span><span>${c.leads} leads</span><span>${c.sales} ventas</span><span class="state">${c.status}</span></div>`).join('')}</div></div>`,
    customers: `<div class="segment-grid">${[['Nuevos',d.customers.new],['Recurrentes',d.customers.recurrent],['Inactivos',d.customers.inactive],['Potenciales',d.customers.potential]].map(([l,v])=>`<div class="segment"><span class="muted">${l}</span><strong>${v}</strong></div>`).join('')}</div><div class="panel" style="margin-top:16px"><h3>Oportunidad detectada</h3><p>Tenés <b>${d.customers.inactive} clientes</b> que compraron anteriormente pero no volvieron en los últimos 60 días.</p><button class="primary-btn" onclick="location.hash='recommendations'">Ver recomendación</button></div>`,
    social: `<div class="two-col"><div class="panel"><div class="metric-line"><b>Alcance</b><strong>${money(d.social.reach)}</strong><span class="trend up">↑ 11%</span></div><div class="metric-line"><b>Interacciones</b><strong>${money(d.social.interactions)}</strong><span class="trend up">↑ 14%</span></div><div class="metric-line"><b>Seguidores</b><strong>${money(d.social.followers)}</strong><span class="trend up">↑ 6,2%</span></div><div class="metric-line"><b>Engagement</b><strong>${d.social.engagement}%</strong><span class="trend up">↑</span></div></div><div class="panel"><h3>¿Es bueno o malo?</h3><p class="muted">El resultado es positivo comparado con las publicaciones anteriores del demo.</p><details class="explain"><summary>¿Qué significa engagement?</summary><p>Es una forma sencilla de mirar cuánto interactúa la audiencia con el contenido. En este caso, 4,8% representa una señal positiva, pero todavía conviene comprobar si esas interacciones terminan en consultas o ventas.</p></details></div></div>`
  };
  document.getElementById('analyticsBody').innerHTML = bodies[tab];
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { document.querySelectorAll('[data-tab]').forEach(x => x.classList.remove('active')); b.classList.add('active'); renderAnalyticsBody(b.dataset.tab); });
}

function renderRecommendations() {
  return `<div class="intro"><h2>Esto es lo que creemos que deberías hacer.</h2><p>Cada recomendación sigue una cadena clara: dato → análisis → conclusión → recomendación → acción.</p></div><div class="reco-list">${state.recommendations.map(r => `<article class="recommendation"><div class="reco-top"><div><span class="priority-pill ${r.priority.toLowerCase()}" >Prioridad ${r.priority}</span><h3 class="reco-title">${r.title}</h3></div></div><div class="reco-flow"><div class="flow-block"><h4>Detectamos</h4><p>${r.detected}</p></div><div class="flow-block"><h4>Dato</h4><p>${r.data}</p></div><div class="flow-block"><h4>Analizamos</h4><p>${r.analysis}</p></div><div class="flow-block"><h4>Concluimos</h4><p>${r.conclusion}</p></div></div><div class="action-box"><b>Recomendamos:</b> ${r.action}</div></article>`).join('')}</div>`;
}

function renderAdvertising() { return `<div class="intro"><h2>¿Dónde estás poniendo dinero y qué estás obteniendo?</h2><p>Las campañas están ordenadas para entender rendimiento, no para mostrar números sin contexto.</p></div>${renderAnalyticsCampaigns()}`; }
function renderAnalyticsCampaigns(){ return `<div class="panel"><div class="campaign-grid">${state.analytics.marketing.campaigns.map(c=>`<div class="campaign ${c.performance}"><strong>${c.name}</strong><span>Inversión $${money(c.spend)}</span><span>${c.leads} leads</span><span>${c.sales} ventas</span><span class="state">${c.status}</span></div>`).join('')}</div><details class="explain"><summary>Cómo leer esto</summary><p>Una campaña con inversión y sin ventas merece revisión antes de aumentar presupuesto. Una campaña con ventas comprobadas tiene evidencia para escalar con cuidado.</p></details></div>`; }
function renderCalendar(){ return `<div class="intro"><h2>Calendario de marketing</h2><p>Organizá publicaciones, campañas, promociones y acciones en un solo lugar.</p></div><div class="calendar"><div class="calendar-grid">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=>`<div class="day"><strong>${d}</strong></div>`).join('')}${Array.from({length:28},(_,i)=>`<div class="day"><strong>${i+1}</strong>${[3,8,12,17,22].includes(i+1)?'<span class="event">Publicar contenido</span>':''}${[5,14,26].includes(i+1)?'<span class="event">Promo</span>':''}</div>`).join('')}</div></div>`; }
function renderContent(){ return `<div class="intro"><h2>Content Studio</h2><p>Ideas basadas en tu tipo de negocio, objetivos y lo que viene funcionando.</p></div><div class="content-cards">${state.data.content.map(c=>`<div class="content-card"><span class="demo-badge">${c.channel}</span><h3>${c.title}</h3><p class="muted">Alcance ${money(c.reach)} · ${money(c.interactions)} interacciones</p><strong>${c.status}</strong></div>`).join('')}<div class="content-card"><span class="demo-badge">Sugerencia</span><h3>Reel: “Un plato, 3 secretos”</h3><p class="muted">Mostrar proceso de cocina y cerrar con una invitación a reservar.</p><button class="primary-btn" onclick="showToast('Idea agregada al calendario demo')">Agregar al calendario</button></div></div>`; }
function renderCustomers(){ return `<div class="intro"><h2>Clientes</h2><p>Entendé quién compra, quién vuelve y dónde hay oportunidades de recuperación.</p></div><div class="segment-grid">${[['Nuevos',state.customers.summary.new],['Recurrentes',state.customers.summary.recurrent],['Inactivos',state.customers.summary.inactive],['Potenciales',state.customers.summary.potential]].map(([l,v])=>`<div class="segment"><span class="muted">${l}</span><strong>${v}</strong></div>`).join('')}</div><div class="table-wrap" style="margin-top:16px"><table class="data-table"><thead><tr><th>Cliente</th><th>Segmento</th><th>Última compra</th><th>Compras</th></tr></thead><tbody>${state.customers.customers.map(c=>`<tr><td><b>${c.name}</b></td><td>${c.segment}</td><td>${c.lastPurchase}</td><td>${c.orders}</td></tr>`).join('')}</tbody></table></div>`; }
function renderWebsite(){ return `<div class="intro"><h2>Sitio Web</h2><p>Convertimos el tráfico en una lectura simple de negocio. El sitio aparece como conectado en esta demo.</p></div><div class="two-col"><div class="panel"><div class="metric-line"><b>Visitas</b><strong>12.480</strong><span class="trend up">↑ 18%</span></div><div class="metric-line"><b>Páginas vistas</b><strong>25.740</strong><span class="trend up">↑ 9%</span></div><div class="metric-line"><b>Formularios</b><strong>184</strong><span class="trend up">↑ 15%</span></div><div class="metric-line"><b>Contactos</b><strong>126</strong><span class="trend up">↑ 11%</span></div></div><div class="panel"><h3>Lectura de negocio</h3><p>El sitio está generando más visitas y consultas. El próximo foco es comprobar qué páginas aportan más contactos y cuáles pierden oportunidades.</p></div></div>`; }
function renderAI(){ return `<div class="intro"><h2>Tu Marketing Manager AI</h2><p>Preguntale por tu negocio. Las respuestas de esta primera versión usan datos demo explícitos y no inventan información externa.</p></div><div class="ai-layout"><section class="chat"><div class="messages" id="messages"><div class="bubble ai">Hola. Soy tu Marketing Manager. Puedo ayudarte a entender ventas, campañas, clientes y contenido.</div></div><form class="chat-form" id="aiForm"><input id="aiQuestion" placeholder="Ej: ¿Qué campaña funciona mejor?" autocomplete="off"/><button class="primary-btn">Preguntar</button></form></section><aside class="ai-side"><h3>Preguntas sugeridas</h3><button class="quick-question">¿Por qué bajaron mis ventas?</button><button class="quick-question">¿Qué campaña funciona mejor?</button><button class="quick-question">¿Qué debería hacer esta semana?</button><button class="quick-question">¿Dónde estoy perdiendo dinero?</button></aside></div>`; }
function renderIntegrations(){ return `<div class="intro"><h2>Integraciones</h2><p>Conectá tus canales cuando estén disponibles. Esta primera versión usa estados honestos: no se muestra una conexión que no existe.</p></div><div class="integration-grid">${state.integrations.map(i=>`<div class="integration"><strong>${i.name}</strong><span class="state-pill ${i.state==='Conectado'?'connected':i.state==='Próximamente'?'soon':'not-connected'}">${i.state}</span></div>`).join('')}</div><div class="notice" style="margin-top:16px">La arquitectura deja un punto de integración para OAuth, APIs y webhooks en una siguiente fase.</div>`; }

const renderers = { dashboard: renderDashboard, analytics: renderAnalytics, recommendations: renderRecommendations, advertising: renderAdvertising, calendar: renderCalendar, content: renderContent, customers: renderCustomers, website: renderWebsite, ai: renderAI, integrations: renderIntegrations };
const titles = { dashboard:'Dashboard',analytics:'Analytics',recommendations:'Recomendaciones',advertising:'Publicidad',calendar:'Calendario',content:'Contenido',customers:'Clientes',website:'Sitio Web',ai:'Marketing Manager AI',integrations:'Integraciones' };

async function render() {
  state.route = location.hash.slice(1) || 'dashboard';
  if (!renderers[state.route]) state.route = 'dashboard';
  title.textContent = titles[state.route];
  setActive(state.route);
  app.innerHTML = renderers[state.route]();
  if (state.route === 'analytics') renderAnalyticsBody('sales');
  if (state.route === 'ai') bindAI();
}

async function load() {
  try {
    [state.data, state.analytics, state.recommendations, state.customers, state.integrations] = await Promise.all([api('/api/dashboard'), api('/api/analytics'), api('/api/recommendations'), api('/api/customers'), api('/api/integrations')]);
    await render();
  } catch (e) {
    app.innerHTML = `<div class="notice">No pudimos cargar los datos. Verificá que el servidor esté funcionando.</div>`;
  }
}

function bindAI(){
  document.querySelectorAll('.quick-question').forEach(b=>b.onclick=()=>{ document.getElementById('aiQuestion').value=b.textContent; document.getElementById('aiForm').requestSubmit(); });
  document.getElementById('aiForm').onsubmit = async e => { e.preventDefault(); const input=document.getElementById('aiQuestion'); const q=input.value.trim(); if(!q)return; addMessage(q,'user'); input.value=''; try{const r=await api('/api/ai',{method:'POST',body:JSON.stringify({question:q})}); addMessage(`<b>Dato utilizado:</b> ${r.answer.data}<br><br><b>Análisis:</b> ${r.answer.analysis}<br><br><b>Conclusión:</b> ${r.answer.conclusion}<br><br><b>Recomendación:</b> ${r.answer.recommendation}<br><br><b>Acción:</b> ${r.answer.action}`,'ai')}catch{addMessage('No pude procesar la consulta en este momento.','ai')} };
}
function addMessage(text,kind){ const box=document.getElementById('messages'); const el=document.createElement('div'); el.className=`bubble ${kind}`; el.innerHTML=text; box.appendChild(el); box.scrollTop=box.scrollHeight; }

document.getElementById('mobileMenu').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
document.getElementById('refreshBtn').onclick=()=>{showToast('Datos actualizados');load();};
document.getElementById('onboardingBtn').onclick=()=>{document.getElementById('modalBackdrop').classList.remove('hidden');document.getElementById('modalBackdrop').setAttribute('aria-hidden','false');};
document.getElementById('closeModal').onclick=()=>{document.getElementById('modalBackdrop').classList.add('hidden');document.getElementById('modalBackdrop').setAttribute('aria-hidden','true');};
document.getElementById('modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')document.getElementById('closeModal').click();};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('modalBackdrop').classList.contains('hidden'))document.getElementById('closeModal').click();});
document.getElementById('onboardingForm').onsubmit=async e=>{e.preventDefault(); const fd=new FormData(e.target); const r=await api('/api/onboarding',{method:'POST',body:JSON.stringify(Object.fromEntries(fd))}); document.getElementById('closeModal').click(); showToast(r.message);};
window.addEventListener('hashchange', render);
load();
