import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const demo = {
  business: { id: 'demo-workspace', name: 'La Esquina', type: 'Restaurante', objective: 'Aumentar ventas', channels: ['Instagram', 'WhatsApp', 'Website'] },
  kpis: { sales: 245000, salesDelta: 12, customers: 318, customersDelta: 8, leads: 184, leadsDelta: 15, conversion: 27, conversionDelta: 3, spend: 68500, spendDelta: -4 },
  campaigns: [
    { id:'c1', name:'Promo viernes', spend:27500, leads:34, sales:0, status:'Revisar', performance:'low', channel:'Meta Ads' },
    { id:'c2', name:'Cumpleaños La Esquina', spend:18000, leads:71, sales:29, status:'Muy bien', performance:'high', channel:'Meta Ads' },
    { id:'c3', name:'Menú del mediodía', spend:14000, leads:53, sales:18, status:'Bien', performance:'medium', channel:'Instagram' },
    { id:'c4', name:'Delivery vecinos', spend:9000, leads:26, sales:9, status:'Bien', performance:'medium', channel:'Instagram' }
  ],
  customers: [
    {id:'u1',name:'Sofía R.',segment:'Recurrente',lastPurchase:'2026-08-29',orders:8,value:18400},
    {id:'u2',name:'Martín G.',segment:'Inactivo',lastPurchase:'2026-06-10',orders:3,value:7200},
    {id:'u3',name:'Carla M.',segment:'Nuevo',lastPurchase:'2026-09-02',orders:1,value:3400},
    {id:'u4',name:'Nicolás P.',segment:'Potencial',lastPurchase:'—',orders:0,value:0}
  ],
  content: [
    {id:'p1',title:'Reel: detrás de cocina',channel:'Instagram',reach:18400,interactions:1120,status:'Funciona',scheduled:'2026-09-08'},
    {id:'p2',title:'Foto del menú',channel:'Instagram',reach:7200,interactions:240,status:'Medio',scheduled:'2026-09-10'},
    {id:'p3',title:'Historia promoción viernes',channel:'Instagram',reach:4900,interactions:88,status:'Bajo',scheduled:'2026-09-11'}
  ],
  events: [
    {id:'e1',date:'2026-09-08',title:'Reel: detrás de cocina',type:'Contenido',status:'Planificado'},
    {id:'e2',date:'2026-09-11',title:'Promo viernes',type:'Promoción',status:'Planificado'},
    {id:'e3',date:'2026-09-15',title:'Campaña recuperación',type:'Clientes',status:'Pendiente'}
  ],
  integrations: [
    {id:'instagram',name:'Instagram',state:'Conectado',demo:true},
    {id:'facebook',name:'Facebook',state:'No conectado',demo:false},
    {id:'tiktok',name:'TikTok',state:'Próximamente',demo:false},
    {id:'whatsapp',name:'WhatsApp',state:'No conectado',demo:false},
    {id:'google-business',name:'Google Business',state:'No conectado',demo:false},
    {id:'google-ads',name:'Google Ads',state:'Próximamente',demo:false},
    {id:'meta-ads',name:'Meta Ads',state:'No conectado',demo:false},
    {id:'website',name:'Website',state:'Conectado',demo:true},
    {id:'ecommerce',name:'ecommerce',state:'Próximamente',demo:false},
    {id:'crm',name:'CRM',state:'Próximamente',demo:false}
  ]
};

let pool = null;
if (process.env.DATABASE_URL) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sessions = new Map();
const workspaces = new Map([[demo.business.id, structuredClone(demo)]]);

const recommendations = () => {
  const d = workspaces.get('demo-workspace') || demo;
  const weak = d.campaigns.find(c => c.sales === 0);
  const inactive = d.customers.filter(c => c.segment === 'Inactivo').length || 43;
  return [
    {id:'r1',priority:'Alta',title:`Reducir temporalmente la inversión en “${weak.name}”`,detected:`La campaña gastó $${weak.spend.toLocaleString('es-AR')} y generó ${weak.sales} ventas.`,data:'Comparación de inversión, leads y ventas del período.',analysis:'Consume presupuesto pero su rendimiento está muy por debajo de las campañas con ventas comprobadas.',conclusion:'El problema no parece ser falta de inversión; necesita revisión.',recommendation:'Revisar segmentación, oferta y creatividad antes de volver a escalarla.',action:'Abrir Publicidad y revisar la campaña.'},
    {id:'r2',priority:'Media',title:'Activar una campaña de recuperación de clientes',detected:`Hay ${inactive} clientes inactivos en los datos disponibles.`,data:'Historial de clientes del workspace.',analysis:'Es una audiencia que ya conoce el negocio y demostró intención de compra.',conclusion:'Recuperar clientes existentes puede ser más eficiente que adquirirlos desde cero.',recommendation:'Crear una oferta exclusiva de recuperación.',action:'Crear campaña y programarla en Calendario.'},
    {id:'r3',priority:'Media',title:'Repetir el formato de contenido que mejor funciona',detected:'El reel detrás de cocina tiene 18.400 de alcance y 1.120 interacciones.',data:'Rendimiento de contenido del período.',analysis:'Supera claramente a la foto de menú y a la historia promocional.',conclusion:'El contenido de proceso/cocina tiene una señal de interés superior.',recommendation:'Producir una segunda pieza con el mismo enfoque y una CTA comercial.',action:'Crear contenido desde Content Studio.'}
  ];
};

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.mh_session;
  if (!token || !sessions.has(token)) return res.status(401).json({ error:'AUTH_REQUIRED' });
  req.session = sessions.get(token); next();
}
app.use((req,res,next)=>{ const cookie=req.headers.cookie||''; req.cookies={}; cookie.split(';').forEach(x=>{const [k,...v]=x.trim().split('='); if(k) req.cookies[k]=decodeURIComponent(v.join('='));}); next(); });

app.get('/api/health', async (_req,res)=>{ let db=false; if(pool){ try{ await pool.query('select 1'); db=true; }catch{} } res.json({ok:true,database:db,mode:pool?'postgresql':'demo'}); });
app.post('/api/auth/login', (req,res)=>{ const email=String(req.body.email||'').trim().toLowerCase(); const password=String(req.body.password||''); if(!email||password.length<4)return res.status(400).json({error:'Ingresá email y contraseña.'}); const token=crypto.randomBytes(24).toString('hex'); const workspaceId='demo-workspace'; sessions.set(token,{userId:email,workspaceId,email}); res.cookie?.('mh_session',token,{httpOnly:true,sameSite:'lax'}); res.json({token,user:{email},business:workspaces.get(workspaceId).business}); });
app.post('/api/auth/demo',(req,res)=>{ const token=crypto.randomBytes(24).toString('hex'); sessions.set(token,{userId:'demo',workspaceId:'demo-workspace',email:'demo@marketinghub.local'}); res.json({token,user:{email:'demo@marketinghub.local'},business:workspaces.get('demo-workspace').business}); });
app.get('/api/me',auth,(req,res)=>res.json({user:req.session.userId,business:workspaces.get(req.session.workspaceId).business}));

app.get('/api/dashboard',auth,(req,res)=>{ const d=workspaces.get(req.session.workspaceId)||demo; res.json({business:d.business,kpis:[{label:'Ventas',value:`$${d.kpis.sales.toLocaleString('es-AR')}`,delta:`+${d.kpis.salesDelta}%`,trend:'up'},{label:'Clientes',value:d.kpis.customers,delta:`+${d.kpis.customersDelta}%`,trend:'up'},{label:'Leads',value:d.kpis.leads,delta:`+${d.kpis.leadsDelta}%`,trend:'up'},{label:'Conversión',value:`${d.kpis.conversion}%`,delta:`+${d.kpis.conversionDelta} pp`,trend:'up'},{label:'Inversión',value:`$${d.kpis.spend.toLocaleString('es-AR')}`,delta:`${d.kpis.spendDelta}%`,trend:'down'}],recommendations:recommendations(),campaigns:d.campaigns,content:d.content}); });
app.get('/api/analytics',auth,(req,res)=>{ const d=workspaces.get(req.session.workspaceId)||demo; res.json({sales:{current:d.kpis.sales,previous:218750,newCustomers:98,recurrentCustomers:220,conversion:d.kpis.conversion,averageTicket:769},marketing:{spend:d.kpis.spend,leads:d.kpis.leads,cpl:372,campaigns:d.campaigns},customers:{new:98,recurrent:220,inactive:d.customers.filter(c=>c.segment==='Inactivo').length||43,potential:d.customers.filter(c=>c.segment==='Potencial').length||57},social:{reach:42100,interactions:2014,followers:6840,publications:14,engagement:4.8,growth:6.2},content:d.content}); });
app.get('/api/recommendations',auth,(_req,res)=>res.json(recommendations()));
app.post('/api/recommendations/:id/action',auth,(req,res)=>res.json({ok:true,message:'Acción agregada al calendario y marcada para seguimiento.',recommendationId:req.params.id}));
app.get('/api/campaigns',auth,(req,res)=>res.json((workspaces.get(req.session.workspaceId)||demo).campaigns));
app.patch('/api/campaigns/:id',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; const c=d.campaigns.find(x=>x.id===req.params.id); if(!c)return res.status(404).json({error:'Campaña no encontrada'}); Object.assign(c,req.body); res.json(c);});
app.get('/api/customers',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; const customers=d.customers; res.json({summary:{new:98,recurrent:220,inactive:customers.filter(c=>c.segment==='Inactivo').length||43,potential:customers.filter(c=>c.segment==='Potencial').length||57},customers});});
app.post('/api/customers',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; const customer={id:crypto.randomUUID(),name:req.body.name,segment:req.body.segment||'Potencial',lastPurchase:req.body.lastPurchase||'—',orders:Number(req.body.orders||0),value:Number(req.body.value||0)}; d.customers.push(customer); res.status(201).json(customer);});
app.get('/api/content',auth,(req,res)=>res.json((workspaces.get(req.session.workspaceId)||demo).content));
app.post('/api/content',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; const item={id:crypto.randomUUID(),title:String(req.body.title||'Nuevo contenido'),channel:String(req.body.channel||'Instagram'),reach:0,interactions:0,status:'Planificado',scheduled:req.body.scheduled||null}; d.content.push(item); res.status(201).json(item);});
app.get('/api/calendar',auth,(req,res)=>res.json((workspaces.get(req.session.workspaceId)||demo).events));
app.post('/api/calendar',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; const e={id:crypto.randomUUID(),date:req.body.date,title:req.body.title,type:req.body.type||'Contenido',status:'Pendiente'}; d.events.push(e); res.status(201).json(e);});
app.get('/api/integrations',auth,(req,res)=>res.json((workspaces.get(req.session.workspaceId)||demo).integrations));
app.post('/api/integrations/:id/connect',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; const i=d.integrations.find(x=>x.id===req.params.id); if(!i)return res.status(404).json({error:'Integración no encontrada'}); if(i.state==='Próximamente')return res.status(409).json({error:'Esta integración todavía no está disponible.'}); i.state='Conectado'; i.demo=true; res.json({...i,message:'Conexión demo activada. No representa OAuth real.'});});
app.get('/api/website',auth,(_req,res)=>res.json({connected:true,metrics:{visits:12480,pageViews:25740,forms:184,contacts:126},note:'Métricas demo; conectar Analytics para datos reales.'}));
app.post('/api/onboarding',auth,(req,res)=>{const d=workspaces.get(req.session.workspaceId)||demo; d.business={...d.business,name:req.body.businessName||d.business.name,type:req.body.businessType||d.business.type,objective:req.body.objective||d.business.objective,channels:req.body.channels||d.business.channels}; res.json({ok:true,business:d.business});});
app.post('/api/ai',auth,(req,res)=>{const question=String(req.body.question||'').trim(); if(!question)return res.status(400).json({error:'Escribí una pregunta.'}); const q=question.toLowerCase(); const d=workspaces.get(req.session.workspaceId)||demo; let answer; if(q.includes('campañ')||q.includes('campan'))answer={data:'“Promo viernes” gastó $27.500 y generó 0 ventas.',analysis:'Es la campaña con peor señal de retorno entre los datos disponibles.',conclusion:'No hay evidencia suficiente para escalarla.',recommendation:'Reducir temporalmente la inversión y revisar segmentación, oferta y creatividad.',action:'Abrir Publicidad y revisar la campaña.',source:'Datos internos del workspace demo'}; else if(q.includes('cliente')||q.includes('fidel'))answer={data:'Hay clientes recurrentes y un segmento inactivo identificado.',analysis:'Ya existe una audiencia con historial de compra.',conclusion:'La recuperación merece una prueba antes de aumentar adquisición.',recommendation:'Crear una campaña exclusiva para inactivos.',action:'Crear contenido y evento de recuperación.',source:'Datos internos del workspace demo'}; else if(q.includes('contenido')||q.includes('public'))answer={data:'El reel detrás de cocina tiene 18.400 de alcance y 1.120 interacciones.',analysis:'Supera a las otras piezas demo.',conclusion:'Ese formato tiene la mejor señal de interés disponible.',recommendation:'Repetir el formato con una CTA comercial.',action:'Crear una nueva pieza desde Content Studio.',source:'Datos internos del workspace demo'}; else answer={data:`Ventas $${d.kpis.sales.toLocaleString('es-AR')}, clientes ${d.kpis.customers}, leads ${d.kpis.leads} y conversión ${d.kpis.conversion}%.`,analysis:'Los principales indicadores están creciendo en el período demo.',conclusion:'La tendencia general es positiva, con oportunidades de eficiencia.',recommendation:'Priorizar campañas con ventas comprobadas y recuperar clientes inactivos.',action:'Revisar Recomendaciones para ejecutar las próximas acciones.',source:'Datos internos del workspace demo'}; res.json({question,answer,limitations:'La IA actual usa reglas y datos internos demo. No afirma tener acceso a plataformas externas que no estén conectadas.'}); });

app.use((err,req,res,next)=>{console.error(err); if(res.headersSent)return next(err); res.status(500).json({error:'Error interno del servidor.'});});
app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(port,host,()=>console.log(`Marketing Hub running on ${host}:${port}`));
