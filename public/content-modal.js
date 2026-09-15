(() => {
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));

  const modal = () => document.getElementById('contentCreateModal');
  const open = () => { const m = modal(); if (!m) return; m.classList.add('is-open'); document.body.classList.add('modal-open'); setTimeout(() => m.querySelector('textarea')?.focus(), 80); };
  const close = () => { const m = modal(); if (!m) return; m.classList.remove('is-open'); document.body.classList.remove('modal-open'); };

  const inject = () => {
    if (modal()) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="content-create-backdrop" id="contentCreateModal" aria-hidden="true">
        <section class="content-create-modal" role="dialog" aria-modal="true" aria-labelledby="contentCreateTitle">
          <button class="content-modal-close" type="button" data-content-close aria-label="Cerrar">×</button>
          <div class="content-modal-grid">
            <div class="content-form-pane">
              <div class="content-modal-heading">
                <div class="content-ai-icon">✦</div>
                <div><p class="eyebrow">Content Studio</p><h2 id="contentCreateTitle">Crear nuevo contenido</h2><p>Contá tu idea y la convertimos en una pieza lista para publicar.</p></div>
              </div>

              <div class="content-section-label">Tipo de contenido</div>
              <div class="choice-grid four">
                <button type="button" class="choice-card is-selected" data-kind="Reel"><span>▣</span><b>Reel</b></button>
                <button type="button" class="choice-card" data-kind="Post"><span>▧</span><b>Post</b></button>
                <button type="button" class="choice-card" data-kind="Historia"><span>＋</span><b>Historia</b></button>
                <button type="button" class="choice-card" data-kind="Carrusel"><span>▤</span><b>Carrusel</b></button>
              </div>

              <div class="content-section-label platform-label">Plataforma</div>
              <div class="choice-grid three">
                <button type="button" class="choice-card is-selected" data-platform="Instagram"><span>◎</span><b>Instagram</b></button>
                <button type="button" class="choice-card" data-platform="TikTok"><span>♪</span><b>TikTok</b></button>
                <button type="button" class="choice-card" data-platform="Facebook"><span>f</span><b>Facebook</b></button>
              </div>

              <label class="field-label">Idea de contenido
                <textarea id="contentIdea" maxlength="200" rows="3">Reel: detrás de cocina #2</textarea>
                <span class="char-count"><span id="contentIdeaCount">23</span>/200</span>
              </label>

              <div class="field-row">
                <label class="field-label">Objetivo
                  <select id="contentObjective"><option>Mostrar el detrás de escena</option><option>Conseguir reservas</option><option>Conseguir nuevos clientes</option><option>Promocionar un producto</option></select>
                </label>
                <label class="field-label">Tono
                  <select id="contentTone"><option>Cercano y auténtico</option><option>Casual y divertido</option><option>Premium y elegante</option><option>Directo y comercial</option></select>
                </label>
              </div>

              <label class="field-label">Puntos clave <span class="optional">(opcional)</span>
                <textarea id="contentPoints" maxlength="300" rows="2" placeholder="Ej: mostrar preparación, ingredientes, equipo, CTA, promoción..."></textarea>
                <span class="char-count"><span id="contentPointsCount">0</span>/300</span>
              </label>

              <div class="ai-settings">
                <div class="ai-settings-copy"><div class="ai-mini-icon">✦</div><div><b>Potenciá con IA</b><p>Generamos guion, copy, hashtags y una propuesta visual.</p></div></div>
                <label class="switch"><input type="checkbox" id="contentAI" checked><span></span></label>
                <label class="check-option"><input type="checkbox" id="contentHashtags" checked><span>Incluir hashtags relevantes</span></label>
              </div>

              <div class="content-modal-actions"><button type="button" class="secondary-btn content-cancel" data-content-close>Cancelar</button><button type="button" class="primary-btn content-generate" id="contentGenerate">✦ Generar contenido</button></div>
            </div>

            <aside class="content-preview-pane">
              <div class="preview-head"><div><p class="eyebrow">Vista previa</p><h3>Ejemplo generado con IA.</h3><p>Podés editarlo después.</p></div></div>
              <div class="social-preview">
                <div class="preview-image"><div class="preview-overlay"><span class="preview-script">Detrás<br>de cocina</span><small>ASÍ PREPARAMOS<br>TU PLATO FAVORITO</small></div><div class="preview-play">▶</div><div class="preview-views">12.4K</div></div>
              </div>
              <button type="button" class="preview-example" id="previewExample">▶ Ver ejemplo</button>
            </aside>
          </div>
        </section>
      </div>`);

    const m = modal();
    m.querySelectorAll('[data-content-close]').forEach(b => b.addEventListener('click', close));
    m.addEventListener('click', e => { if (e.target === m) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal()?.classList.contains('is-open')) close(); });
    m.querySelectorAll('.choice-card').forEach(b => b.addEventListener('click', () => { const group = b.parentElement; group.querySelectorAll('.choice-card').forEach(x => x.classList.remove('is-selected')); b.classList.add('is-selected'); }));
    const bindCount = (id, out) => { const el = document.getElementById(id), counter = document.getElementById(out); if (!el || !counter) return; const sync=()=>counter.textContent=el.value.length; el.addEventListener('input', sync); sync(); };
    bindCount('contentIdea','contentIdeaCount'); bindCount('contentPoints','contentPointsCount');
    document.getElementById('previewExample')?.addEventListener('click', () => window.showToast?.('Vista previa lista. Podés cambiar la idea y regenerarla.'));
    document.getElementById('contentGenerate')?.addEventListener('click', async () => {
      const idea = document.getElementById('contentIdea')?.value.trim();
      const kind = m.querySelector('[data-kind].is-selected')?.dataset.kind || 'Reel';
      const platform = m.querySelector('[data-platform].is-selected')?.dataset.platform || 'Instagram';
      if (!idea) { window.showToast?.('Escribí una idea para generar contenido.'); return; }
      try {
        const token = localStorage.getItem('mh_token');
        const r = await fetch('/api/content', {method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({title:idea, channel:platform, scheduled:null})});
        if (!r.ok) throw new Error('No se pudo crear el contenido.');
        close(); window.showToast?.(`${kind} creado en ${platform}.`); window.renderRoute?.();
      } catch (e) { window.showToast?.(e.message || 'No se pudo crear el contenido.'); }
    });
  };

  window.openContentCreateModal = () => { inject(); open(); };
  window.closeContentCreateModal = close;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
})();
