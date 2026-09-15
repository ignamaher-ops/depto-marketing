(() => {
  const notify = message => {
    if (typeof window.showToast === 'function') return window.showToast(message);
    if (typeof window.__mhToast === 'function') return window.__mhToast(message);
    let el=document.getElementById('toast');
    if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el);}
    el.textContent=message;el.classList.add('show');clearTimeout(el.__mhTimer);el.__mhTimer=setTimeout(()=>el.classList.remove('show'),2400);
  };

  // Prevent the legacy browser dialogs from ever opening.
  window.alert = notify;

  // app.js still assigns the old prompt-based handlers after each route render.
  // Capture the click before the target's onclick runs and open the in-app modal instead.
  document.addEventListener('click', event => {
    const contentButton=event.target.closest?.('#createContent');
    if(contentButton){event.preventDefault();event.stopImmediatePropagation();window.openContentCreateModal?.();return;}
    const calendarButton=event.target.closest?.('#newEvent');
    if(calendarButton){event.preventDefault();event.stopImmediatePropagation();window.openCalendarCreateModal?.();return;}
  }, true);
})();