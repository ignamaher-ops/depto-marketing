# Marketing Hub

Marketing Hub es un SaaS pensado como un **departamento de marketing virtual** para pequeños comercios y emprendimientos. La interfaz no se limita a mostrar métricas: busca explicar qué está pasando, recomendar qué hacer y convertir esas recomendaciones en acciones.

## Estado del MVP ampliado

Esta rama contiene una versión integrada y desplegable del MVP:

- Las 10 secciones principales funcionan: Dashboard, Analytics, Recomendaciones, Publicidad, Calendario, Contenido, Clientes, Sitio Web, Marketing Manager AI e Integraciones.
- Dashboard ejecutivo con lectura de negocio, KPIs y prioridades.
- Analytics con explicaciones y contexto para usuarios no técnicos.
- Motor de recomendaciones basado en **DATO → ANÁLISIS → CONCLUSIÓN → RECOMENDACIÓN → ACCIÓN**.
- Acciones de recomendaciones que pueden pasar al seguimiento del producto.
- Publicidad con campañas, inversión, leads y ventas.
- Calendario con acciones creadas desde la interfaz.
- Content Studio con creación de piezas y vínculo conceptual con recomendaciones.
- Clientes con segmentos y alta de nuevos registros.
- Sitio Web con métricas claramente marcadas como demo hasta conectar Analytics.
- Marketing Manager AI funcional sobre el contexto disponible y con límites explícitos: no afirma acceso a canales no conectados ni inventa datos externos.
- Integraciones con estados honestos y flujo de conexión demo para proveedores disponibles en la interfaz.
- Onboarding para nombre, tipo y objetivo del negocio.
- Login y separación lógica por workspace en la capa de sesión.
- Manejo de errores de API y health check.
- Servidor preparado para Render: escucha en `0.0.0.0` y utiliza `PORT`.
- `schema.sql` con estructura PostgreSQL para usuarios, workspaces, miembros, integraciones, campañas, clientes, contenido, calendario y recomendaciones.
- Responsive desktop/tablet/mobile.

## Ejecutar localmente

Requisitos: Node.js 18+ y npm.

```bash
npm install
npm start
```

Abrí `http://localhost:3000`.

Para probar sin base de datos, usá **Entrar con La Esquina demo**. El modo demo permite validar el flujo completo sin credenciales externas.

## PostgreSQL

Copiá `.env.example` como `.env` y configurá:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/marketing_hub
NODE_ENV=development
```

El esquema de producción está en `schema.sql`. La aplicación mantiene un modo demo cuando `DATABASE_URL` no está configurada, para que el producto pueda verse y probarse antes de conectar infraestructura.

## Render

Configuración recomendada para el Web Service:

- Branch: `build/marketing-hub-mvp` mientras esta rama siga en revisión.
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `NODE_ENV=production`
- `DATABASE_URL`: opcional para visualizar el modo demo; necesaria cuando se conecte la persistencia PostgreSQL.

## Estructura

```text
.
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── schema.sql
├── seed.sql
└── .env.example
```

## Integraciones y IA

Los conectores externos reales requieren OAuth, credenciales de cada proveedor, refresh tokens, webhooks y políticas de permisos. Por eso el MVP **no finge** una conexión real: cada estado visible diferencia `Conectado`, `No conectado` y `Próximamente`.

La IA actual es un agente local orientado a MVP: recibe preguntas, consulta el contexto de datos disponible y responde con la cadena dato → análisis → conclusión → recomendación → acción. El siguiente paso de producción es reemplazar ese motor por un proveedor LLM con herramientas controladas y contexto del workspace, manteniendo la regla de no inventar datos.
