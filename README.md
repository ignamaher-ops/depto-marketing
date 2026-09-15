# Marketing Hub

Marketing Hub es un SaaS pensado como un **departamento de marketing virtual** para pequeños comercios y emprendimientos. La interfaz no se limita a mostrar métricas: busca explicar qué está pasando, recomendar qué hacer y convertir esas recomendaciones en acciones.

## Estado de esta rama

Esta rama (`feat/marketing-hub-v2`) evoluciona el MVP existente con una capa ejecutiva orientada a decisiones:

- **Dashboard ejecutivo renovado** con overview, lectura de negocio y jerarquía visual.
- **Marketing Health Score** con evaluación resumida de publicidad, redes, contenido, conversión y clientes.
- **Centro de decisiones** con las 3 prioridades más importantes de la semana.
- **Opportunity layer** para detectar campañas con mejor señal y contenido que merece repetición.
- **Ask your data** como CTA central hacia Marketing Manager AI.
- **Budget Optimizer** en modo simulación, sin ejecutar cambios reales en plataformas externas.
- Recomendaciones con **Dato → Análisis → Conclusión → Recomendación → Acción** y una capa adicional de impacto, horizonte y confianza.
- Mantiene las 10 secciones del MVP: Dashboard, Analytics, Recomendaciones, Publicidad, Calendario, Contenido, Clientes, Sitio Web, Marketing Manager AI e Integraciones.
- Mantiene los límites honestos del MVP: no se simulan conexiones OAuth reales ni acceso a canales que no están conectados.

## Ejecutar localmente

Requisitos: Node.js 18+ y npm.

```bash
npm install
npm start
```

Abrí `http://localhost:3000`.

Para probar sin base de datos, usá **Entrar con La Esquina demo**.

## PostgreSQL

Copiá `.env.example` como `.env` y configurá:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/marketing_hub
NODE_ENV=development
```

## Render

Para probar esta versión en Render, configurá temporalmente:

- Branch: `feat/marketing-hub-v2`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `NODE_ENV=production`
- `DATABASE_URL`: opcional para visualizar el modo demo.

Cuando se valide visual y funcionalmente, esta rama puede ser promovida a `main` o usada para actualizar el branch de producción.

## Integraciones y IA

Los conectores externos reales requieren OAuth, credenciales de cada proveedor, refresh tokens, webhooks y políticas de permisos. El MVP diferencia explícitamente `Conectado`, `No conectado` y `Próximamente`.

La IA actual es un agente local orientado a MVP: consulta el contexto disponible y responde con la cadena dato → análisis → conclusión → recomendación → acción. El siguiente paso de producción es reemplazar ese motor por un proveedor LLM con herramientas controladas y contexto del workspace, manteniendo la regla de no inventar datos.
