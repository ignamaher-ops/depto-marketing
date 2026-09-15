(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const decorate = () => {
    const route = location.hash.replace('#', '') || 'dashboard';
    app.dataset.route = route;

    // Add semantic colors to KPI cards without changing their data.
    document.querySelectorAll('.kpi').forEach((card, i) => {
      card.classList.remove('kpi-green','kpi-orange','kpi-blue','kpi-purple','kpi-red');
      const palette = ['kpi-blue','kpi-green','kpi-purple','kpi-orange','kpi-green'];
      card.classList.add(palette[i % palette.length]);
    });

    // Give the existing mini chart a readable, intentional color scale.
    document.querySelectorAll('.chart').forEach(chart => {
      chart.classList.add('enhanced-chart');
      chart.querySelectorAll('.bar').forEach((bar, i) => {
        bar.classList.remove('bar-blue','bar-green','bar-orange','bar-purple');
        bar.classList.add(['bar-blue','bar-green','bar-purple','bar-orange'][i % 4]);
        bar.setAttribute('title', `Período ${i + 1}`);
      });
    });

    // Calendar: make event types visually distinct while keeping the current data.
    document.querySelectorAll('.simple-calendar .event').forEach(event => {
      const text = event.textContent.toLowerCase();
      event.classList.remove('event-content','event-campaign','event-review','event-default');
      if (text.includes('contenido') || text.includes('post') || text.includes('reel')) event.classList.add('event-content');
      else if (text.includes('campaña') || text.includes('promo') || text.includes('public')) event.classList.add('event-campaign');
      else if (text.includes('revisión') || text.includes('revisar') || text.includes('análisis')) event.classList.add('event-review');
      else event.classList.add('event-default');
    });

    // Customers: make the four segments easier to scan.
    document.querySelectorAll('.segment').forEach((card, i) => {
      card.classList.remove('segment-blue','segment-green','segment-orange','segment-purple');
      card.classList.add(['segment-blue','segment-green','segment-orange','segment-purple'][i % 4]);
    });

    // Recommendations: make the action area visually prominent but not aggressive.
    document.querySelectorAll('.recommendation').forEach(card => card.classList.add('enhanced-recommendation'));

    // Campaign rows: emphasize the outcome column without inventing new data.
    document.querySelectorAll('.campaign').forEach(row => row.classList.add('enhanced-campaign'));

    // Integration cards: clearer state treatment.
    document.querySelectorAll('.integration').forEach(card => card.classList.add('enhanced-integration'));

    // Content cards: add a subtle visual hierarchy.
    document.querySelectorAll('.content-card').forEach((card, i) => {
      card.classList.add('enhanced-content-card');
      card.style.setProperty('--content-accent-index', i % 3);
    });
  };

  let scheduled = false;
  const scheduleDecorate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorate();
    });
  };

  new MutationObserver(scheduleDecorate).observe(app, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleDecorate);
  window.addEventListener('load', scheduleDecorate);
  scheduleDecorate();
})();
