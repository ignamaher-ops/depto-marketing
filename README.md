# Marketing Hub

Primera versión funcional de **Marketing Hub**, un SaaS pensado como un departamento de marketing virtual para pequeños comercios y emprendimientos.

## Qué incluye esta primera versión

- Sidebar y navegación completa de las 10 secciones definidas.
- Dashboard ejecutivo con datos demo realistas.
- Analytics de ventas, marketing, clientes y redes sociales.
- Explicaciones progresivas de métricas para usuarios no técnicos.
- Recomendaciones con la cadena dato → análisis → conclusión → recomendación → acción.
- Publicidad con campañas demo y lectura de rendimiento.
- Calendario de marketing simple.
- Content Studio con ideas demo.
- Clientes con segmentos y oportunidades de recuperación.
- Sitio Web con lectura de negocio.
- Marketing Manager AI funcional sobre los datos demo disponibles.
- Integraciones con estados honestos: Conectado / No conectado / Próximamente.
- Onboarding básico para editar nombre, tipo y objetivo del negocio.
- Responsive desktop/tablet/mobile y estrategia consistente para modal, toast y paneles.
- Base de backend Node.js + Express.
- Estructura PostgreSQL-ready mediante `seed.sql` y `DATABASE_URL`.

## Cómo levantarlo

Requisitos: Node.js 18+ y npm. PostgreSQL es opcional en esta fase.

```bash
npm install
npm start
```

Abrí `http://localhost:3000`.

## Variables de entorno

Copiá `.env.example` como `.env` y completá:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/marketing_hub
NODE_ENV=development
```

La app detecta `DATABASE_URL`; la primera versión conserva datos demo deterministas para permitir probar el producto sin configurar PostgreSQL.

## Estructura

```text
.
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── .env.example
└── seed.sql
```

## Funcionalidades externas

Las integraciones muestran explícitamente su estado. No se simula una integración conectada: OAuth, APIs y webhooks quedan preparados para una fase posterior.

La IA incluida en esta primera versión es un endpoint local orientado a demo que responde utilizando los datos disponibles del negocio. No representa todavía una conexión con un modelo externo.
