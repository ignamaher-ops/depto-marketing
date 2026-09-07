import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const demoData = {
  business: { name: 'La Esquina', type: 'Restaurante', objective: 'Aumentar ventas' },
  kpis: [
    { label: 'Ventas', value: '$245.000', delta: '+12%', trend: 'up' },
    { label: 'Clientes', value: '318', delta: '+8%', trend: 'up' },
    { label: 'Leads', value: '184', delta: '+15%', trend: 'up' },
    { label: 'Conversión', value: '27%', delta: '+3 pp', trend: 'up' },
    { label: 'Inversión', value: '$68.500', delta: '-4%', trend: 'down' }
  ],
  campaigns: [
    { name: 'Promo viernes', spend: 27500, leads: 34, sales: 0, status: 'Revisar', performance: 'low' },
    { name: 'Cumpleaños La Esquina', spend: 18000, leads: 71, sales: 29, status: 'Muy bien', performance: 'high' },
    { name: 'Menú del mediodía', spend: 14000, leads: 53, sales: 18, status: 'Bien', performance: 'medium' },
    { name: 'Delivery vecinos', spend: 9000, leads: 26, sales: 9, status: 'Bien', performance: 'medium' }
  ],
  customers: { new: 98, recurrent: 220, inactive: 43, potential: 57 },
  content: [
    { title: 'Reel: detrás de cocina', channel: 'Instagram', reach: 18400, interactions: 1120, status: 'Funciona' },
    { title: 'Foto del menú', channel: 'Instagram', reach: 7200, interactions: 240, status: 'Medio' },
    { title: 'Historia promoción viernes', channel: 'Instagram', reach: 4900, interactions: 88, status: 'Bajo' }
  ],
  recommendations: [
    {
      priority: 'Alta',
      title: 'Reducir temporalmente la inversión en “Promo viernes”',
      detected: 'La campaña gastó $27.500 y no generó ventas.',
      data: 'Comparación con otras campañas del mismo período.',
      analysis: 'Consume presupuesto pero su rendimiento está muy por debajo del resto.',
      conclusion: 'El problema no parece ser falta de inversión; necesita revisión.',
      action: 'Revisar segmentación, oferta y creatividad antes de volver a escalarla.'
    },
    {
      priority: 'Media',
      title: 'Activar una campaña de recuperación de clientes',
      detected: 'Hay 43 clientes que compraron anteriormente y no volvieron en 60 días.',
      data: 'Historial de compras demo.',
      analysis: 'Existe una base de clientes conocida que ya demostró intención de compra.',
      conclusion: 'Recuperarlos puede ser más eficiente que buscar clientes totalmente nuevos.',
      action: 'Crear una promoción exclusiva y contactar a ese segmento por WhatsApp.'
    }
  ]
};

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

app.get('/api/health', (_req, res) => res.json({ ok: true, database: Boolean(pool) }));
app.get('/api/dashboard', (_req, res) => res.json(demoData));
app.get('/api/analytics', (_req, res) => res.json({
  sales: { current: 245000, previous: 218750, newCustomers: 98, recurrentCustomers: 220, conversion: 27, averageTicket: 769 },
  marketing: { spend: 68500, leads: 184, cpl: 372, campaigns: demoData.campaigns },
  customers: demoData.customers,
  social: { reach: 42100, interactions: 2014, followers: 6840, publications: 14, engagement: 4.8, growth: 6.2 },
  content: demoData.content
}));
app.get('/api/recommendations', (_req, res) => res.json(demoData.recommendations));
app.get('/api/customers', (_req, res) => res.json({ summary: demoData.customers, customers: [
  { name: 'Sofía R.', segment: 'Recurrente', lastPurchase: '2026-08-29', orders: 8 },
  { name: 'Martín G.', segment: 'Inactivo', lastPurchase: '2026-06-10', orders: 3 },
  { name: 'Carla M.', segment: 'Nuevo', lastPurchase: '2026-09-02', orders: 1 },
  { name: 'Nicolás P.', segment: 'Potencial', lastPurchase: '—', orders: 0 }
] }));
app.get('/api/integrations', (_req, res) => res.json([
  { name: 'Instagram', state: 'Conectado' },
  { name: 'Facebook', state: 'No conectado' },
  { name: 'TikTok', state: 'Próximamente' },
  { name: 'WhatsApp', state: 'No conectado' },
  { name: 'Google Business', state: 'No conectado' },
  { name: 'Google Ads', state: 'Próximamente' },
  { name: 'Meta Ads', state: 'No conectado' },
  { name: 'Website', state: 'Conectado' },
  { name: 'ecommerce', state: 'Próximamente' },
  { name: 'CRM', state: 'Próximamente' }
]));

app.post('/api/onboarding', (req, res) => {
  const { businessName, businessType, objective } = req.body;
  res.json({ ok: true, message: `Estamos preparando Marketing Hub para ${businessName || 'tu negocio'}.`, profile: { businessName, businessType, objective } });
});

app.post('/api/ai', (req, res) => {
  const question = String(req.body.question || '').trim();
  const q = question.toLowerCase();
  let answer;
  if (q.includes('campaña') || q.includes('campana')) {
    answer = { data: '“Promo viernes” gastó $27.500 y generó 0 ventas.', analysis: 'Es el peor rendimiento de las campañas demo durante este período.', conclusion: 'Está consumiendo presupuesto sin una señal de retorno suficiente.', recommendation: 'Reducir temporalmente la inversión y revisar segmentación, oferta y creatividad.', action: 'Abrir Publicidad y revisar la campaña antes de volver a escalar.' };
  } else if (q.includes('venta')) {
    answer = { data: 'Las ventas están en $245.000, un 12% por encima del período anterior.', analysis: 'El crecimiento coincide con una mejora de clientes nuevos y recurrentes.', conclusion: 'La tendencia general es positiva, aunque hay campañas que están frenando la eficiencia.', recommendation: 'Mantener lo que funciona y reasignar parte del presupuesto desde campañas débiles.', action: 'Revisar la recomendación de “Promo viernes”.' };
  } else {
    answer = { data: 'Ventas +12%, clientes +8%, leads +15% y conversión en 27%.', analysis: 'La adquisición y la conversión están mejorando al mismo tiempo.', conclusion: 'El negocio muestra una tendencia favorable, con oportunidades puntuales de eficiencia.', recommendation: 'Priorizar campañas con ventas comprobadas y recuperar clientes inactivos.', action: 'Crear una acción de recuperación y revisar la campaña de bajo rendimiento.' };
  }
  res.json({ question, answer });
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(port, () => console.log(`Marketing Hub running on http://localhost:${port}`));
