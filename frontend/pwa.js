// ==============================================================================
// BOOTSTRAP PWA (pwa.js) - FASE 3
// Pasang manifest, daftarkan service worker, sediakan install prompt,
// dan sisipkan menu "Pengaturan Toko" ke sidebar tiap halaman.
// ==============================================================================
(function () {
  // 1. Manifest & meta tema
  function addHead(tag, attrs) {
    const el = document.createElement(tag);
    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    document.head.appendChild(el);
  }
  if (!document.querySelector('link[rel="manifest"]')) {
    addHead('link', { rel: 'manifest', href: 'manifest.json' });
    addHead('meta', { name: 'theme-color', content: '#059669' });
    addHead('meta', { name: 'mobile-web-app-capable', content: 'yes' });
    addHead('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
    addHead('link', { rel: 'apple-touch-icon', href: 'icons/icon-192.png' });
  }

  // 2. Service worker (hanya jalan di https atau localhost)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW gagal didaftarkan:', err));
    });
  }

  // 3. Install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('toko:can-install'));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('toko:installed'));
  });
  window.TokoPWA = {
    canInstall: () => !!deferredPrompt,
    isStandalone: () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
    install: async () => {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return choice.outcome === 'accepted';
    }
  };

  // 4. Sisipkan menu "Pengaturan Toko" ke sidebar & bottom-nav bila belum ada
  function injectMenu() {
    const owner = document.getElementById('ownerMenuSection');
    const nav = document.querySelector('aside nav');
    if (nav && !nav.querySelector('a[href="pengaturan.html"]')) {
      const a = document.createElement('a');
      a.href = 'pengaturan.html';
      const active = location.pathname.endsWith('pengaturan.html');
      a.className = 'flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition ' +
        (active ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800');
      a.innerHTML = '<i class="fa-solid fa-gear w-5 text-center text-slate-300 text-base"></i><span>Pengaturan & Printer</span>';
      (owner || nav).appendChild(a);
    }
    // Di HP: tautan kecil di dashboard (jika ada grid menu cepat)
    const grid = document.getElementById('mobileActionGrid');
    if (grid && !grid.parentElement.querySelector('a[href="pengaturan.html"]')) {
      const a = document.createElement('a');
      a.href = 'pengaturan.html';
      a.className = 'flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm mt-3';
      a.innerHTML = '<div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg shrink-0"><i class="fa-solid fa-gear"></i></div>' +
        '<div><div class="font-bold text-xs text-slate-800">Pengaturan & Printer</div><div class="text-[10px] text-slate-400">Profil toko, printer struk, pasang aplikasi</div></div>';
      grid.parentElement.appendChild(a);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectMenu);
  else injectMenu();
})();
