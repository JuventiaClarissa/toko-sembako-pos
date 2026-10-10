// ===============================================================
// SISTEM MODAL DIALOG MODERN (PENGGANTI WINDOW.ALERT & CONFIRM)
// Tampilan popup bersih, terpadu, dan elegan di semua perangkat
// ===============================================================

function showAppModal(message, options = {}) {
  const {
    judul,
    tipe = 'auto',
    tombolTeks = 'OK, Mengerti',
    onTutup = null
  } = options;

  const existing = document.getElementById('appNotificationModal');
  if (existing) existing.remove();

  let iconClass = 'fa-solid fa-circle-info';
  let iconBg = 'bg-teal-100 text-teal-600 ring-teal-50';
  let btnClass = 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30';
  let defaultTitle = 'Pemberitahuan';

  const cleanMsg = String(message || '').trim();
  const lowerMsg = cleanMsg.toLowerCase();

  if (tipe === 'sukses' || cleanMsg.startsWith('✅') || lowerMsg.includes('berhasil') || lowerMsg.includes('sukses')) {
    iconClass = 'fa-solid fa-circle-check';
    iconBg = 'bg-emerald-100 text-emerald-600 ring-emerald-50';
    btnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30';
    defaultTitle = 'Berhasil!';
  } else if (tipe === 'error' || cleanMsg.startsWith('❌') || lowerMsg.includes('salah') || lowerMsg.includes('gagal')) {
    iconClass = 'fa-solid fa-circle-xmark';
    iconBg = 'bg-rose-100 text-rose-600 ring-rose-50';
    btnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30';
    defaultTitle = 'Perhatian / Gagal';
  } else if (tipe === 'warning' || cleanMsg.startsWith('⚠️') || lowerMsg.includes('peringatan') || lowerMsg.includes('perhatian')) {
    iconClass = 'fa-solid fa-triangle-exclamation';
    iconBg = 'bg-amber-100 text-amber-600 ring-amber-50';
    btnClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30';
    defaultTitle = 'Peringatan';
  } else if (cleanMsg.startsWith('🟡') || lowerMsg.includes('penjaga')) {
    iconClass = 'fa-solid fa-user-shield';
    iconBg = 'bg-amber-100 text-amber-600 ring-amber-50';
    btnClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30';
    defaultTitle = 'Mode Penjaga';
  }

  const displayMsg = cleanMsg.replace(/^[✅❌⚠️🟡🔒🔑\s]+/, '');
  const displayTitle = judul || defaultTitle;

  const modalHtml = `
    <div id="appNotificationModal" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div class="w-16 h-16 rounded-2xl ${iconBg} ring-8 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i class="${iconClass}"></i>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-900 tracking-tight">${displayTitle}</h3>
        </div>
        <div class="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
          ${displayMsg}
        </div>
        <div class="pt-2">
          <button id="btnAppModalClose" class="w-full py-3 rounded-xl font-black text-xs shadow-md transition active:scale-95 ${btnClass}">
            ${tombolTeks}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.getElementById('appNotificationModal');
  const closeBtn = document.getElementById('btnAppModalClose');

  const closeFn = () => {
    if (modalEl) modalEl.remove();
    document.removeEventListener('keydown', keyFn);
    if (typeof onTutup === 'function') onTutup();
  };

  const keyFn = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') closeFn();
  };

  closeBtn.addEventListener('click', closeFn);
  document.addEventListener('keydown', keyFn);
  setTimeout(() => closeBtn.focus(), 50);
}

function showAppConfirm(message, options = {}) {
  const {
    judul = 'Konfirmasi Tindakan',
    tipe = 'warning',
    tombolOk = 'Ya, Lanjutkan',
    tombolBatal = 'Batal',
    onOk = null,
    onCancel = null
  } = options;

  const existing = document.getElementById('appConfirmModal');
  if (existing) existing.remove();

  let iconClass = 'fa-solid fa-triangle-exclamation';
  let iconBg = 'bg-amber-100 text-amber-600 ring-amber-50';
  let btnClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30';

  if (tipe === 'danger' || tipe === 'error') {
    iconClass = 'fa-solid fa-triangle-exclamation';
    iconBg = 'bg-rose-100 text-rose-600 ring-rose-50';
    btnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30';
  } else if (tipe === 'info') {
    iconClass = 'fa-solid fa-circle-question';
    iconBg = 'bg-blue-100 text-blue-600 ring-blue-50';
    btnClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30';
  }

  const cleanMsg = String(message || '').trim().replace(/^[✅❌⚠️🟡🔒🔑\s]+/, '');

  const modalHtml = `
    <div id="appConfirmModal" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div class="w-16 h-16 rounded-2xl ${iconBg} ring-8 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i class="${iconClass}"></i>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-900 tracking-tight">${judul}</h3>
        </div>
        <div class="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
          ${cleanMsg}
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button id="btnAppConfirmCancel" class="py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition active:scale-95">
            ${tombolBatal}
          </button>
          <button id="btnAppConfirmOk" class="py-3 rounded-xl font-black text-xs shadow-md transition active:scale-95 ${btnClass}">
            ${tombolOk}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.getElementById('appConfirmModal');
  const btnOk = document.getElementById('btnAppConfirmOk');
  const btnCancel = document.getElementById('btnAppConfirmCancel');

  const cleanup = () => {
    if (modalEl) modalEl.remove();
  };

  btnOk.addEventListener('click', () => {
    cleanup();
    if (typeof onOk === 'function') onOk();
  });

  btnCancel.addEventListener('click', () => {
    cleanup();
    if (typeof onCancel === 'function') onCancel();
  });

  setTimeout(() => btnOk.focus(), 50);
}

function showAppPrompt(message, options = {}) {
  const {
    judul = 'Masukkan Data',
    placeholder = 'Ketik di sini...',
    tombolOk = 'Kirim & Simpan',
    tombolBatal = 'Batal',
    onOk = null,
    onCancel = null
  } = options;

  const existing = document.getElementById('appPromptModal');
  if (existing) existing.remove();

  const modalHtml = `
    <div id="appPromptModal" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 ring-8 ring-amber-50 flex items-center justify-center text-2xl mx-auto shadow-inner">
          <i class="fa-solid fa-pen-clip"></i>
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900">${judul}</h3>
          <p class="text-xs text-slate-500 mt-1 whitespace-pre-line text-left">${message}</p>
        </div>
        <div>
          <textarea id="appPromptInput" rows="3" placeholder="${placeholder}" class="w-full p-3 text-xs font-semibold border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button id="btnAppPromptCancel" class="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition">
            ${tombolBatal}
          </button>
          <button id="btnAppPromptOk" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition">
            ${tombolOk}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.getElementById('appPromptModal');
  const inputEl = document.getElementById('appPromptInput');
  const btnOk = document.getElementById('btnAppPromptOk');
  const btnCancel = document.getElementById('btnAppPromptCancel');

  const cleanup = () => {
    if (modalEl) modalEl.remove();
  };

  btnOk.addEventListener('click', () => {
    const val = inputEl.value.trim();
    if (!val) {
      inputEl.focus();
      return;
    }
    cleanup();
    if (typeof onOk === 'function') onOk(val);
  });

  btnCancel.addEventListener('click', () => {
    cleanup();
    if (typeof onCancel === 'function') onCancel();
  });

  setTimeout(() => inputEl.focus(), 100);
}

// Override global window.alert agar seluruh notifikasi otomatis berbentuk modal modern
window.alert = function(msg) {
  showAppModal(msg);
};

window.showAppModal = showAppModal;
window.showAppConfirm = showAppConfirm;
window.showAppPrompt = showAppPrompt;

// Konfigurasi & Variabel Role Global
const OWNER_PINS = ['1234', '2026'];
const OWNER_ONLY_PAGES = ['buka-karung.html', 'ambil-uang.html', 'tutup-kasir.html', 'laporan.html'];

function getCurrentRole() {
  return localStorage.getItem('toko_role') || 'pemilik';
}

function setRole(role) {
  localStorage.setItem('toko_role', role);
}

// Inisialisasi Otomatis saat Script / DOM dimuat
function initAuth() {
  ensurePinModalExists();
  applyRoleUI(getCurrentRole());
  checkPageAccess();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

// Cek apakah halaman yang dibuka khusus pemilik
function checkPageAccess() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const role = getCurrentRole();

  if (role === 'penjaga' && OWNER_ONLY_PAGES.includes(currentPath)) {
    // Tampilkan prompt PIN untuk membuka akses
    showAccessLockModal(currentPath);
  }
}

// Modal perlindungan halaman khusus pemilik jika diakses penjaga
function showAccessLockModal(pageName) {
  let lockOverlay = document.getElementById('lockPageOverlay');
  if (!lockOverlay) {
    lockOverlay = document.createElement('div');
    lockOverlay.id = 'lockPageOverlay';
    lockOverlay.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4';
    lockOverlay.innerHTML = `
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i class="fa-solid fa-lock"></i>
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-slate-900">Akses Khusus Pemilik</h3>
          <p class="text-xs text-slate-500 mt-1">Halaman ini memuat data keuangan sensitif. Masukkan PIN Pemilik untuk melanjutkan.</p>
        </div>
        <div class="space-y-2">
          <input type="password" id="pageLockPinInput" maxlength="6" inputmode="numeric" placeholder="Ketik 4-digit PIN..." class="w-full text-center tracking-widest text-xl font-bold py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none">
          <p class="text-[10px] text-slate-400 font-medium">Demo PIN Pemilik: 1234 atau 2026</p>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button onclick="window.location.href='kasir.html'" class="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition">
            Kembali ke Kasir
          </button>
          <button onclick="verifikasiPageLockPin()" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition">
            Buka Kunci
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(lockOverlay);
    setTimeout(() => {
      const pinInp = document.getElementById('pageLockPinInput');
      if (pinInp) {
        pinInp.focus();
        pinInp.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') verifikasiPageLockPin();
        });
      }
    }, 150);
  } else {
    lockOverlay.classList.remove('hidden');
  }
}

function verifikasiPageLockPin() {
  const inp = document.getElementById('pageLockPinInput');
  if (inp && OWNER_PINS.includes(inp.value.trim())) {
    setRole('pemilik');
    const lockOverlay = document.getElementById('lockPageOverlay');
    if (lockOverlay) lockOverlay.remove();
    showAppModal("Mode Pemilik telah diaktifkan dengan kendali penuh toko.", {
      judul: "PIN Berhasil",
      tipe: "sukses"
    });
  } else {
    showAppModal("PIN yang Anda masukkan salah. Silakan coba lagi.", {
      judul: "PIN Salah",
      tipe: "error"
    });
    if (inp) inp.value = '';
  }
}

// Pastikan Modal PIN Global selalu ada di halaman
function ensurePinModalExists() {
  if (document.getElementById('pinModal')) return;

  const modalHtml = `
    <div id="pinModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-base font-bold">
              <i class="fa-solid fa-key"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-sm">Verifikasi PIN Pemilik</h4>
              <p class="text-[11px] text-slate-500">Kembali ke kendali penuh toko</p>
            </div>
          </div>
          <button onclick="tutupModalPin()" class="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p class="text-xs text-slate-600">Masukkan 4 digit PIN Pemilik untuk melihat data keuntungan, kulakan, dan prive kas:</p>
        
        <input type="password" id="pinInput" maxlength="6" inputmode="numeric" placeholder="• • • •" class="w-full text-center tracking-widest text-2xl font-bold py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none">

        <p class="text-[11px] text-center text-slate-400 font-medium">Demo PIN Pemilik: <b>1234</b> atau <b>2026</b></p>

        <div class="grid grid-cols-2 gap-2 pt-2">
          <button onclick="tutupModalPin()" class="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition">
            Batal
          </button>
          <button onclick="verifikasiPin()" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition">
            Buka Akses
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const pinInp = document.getElementById('pinInput');
  if (pinInp) {
    pinInp.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') verifikasiPin();
    });
  }
}

// Terapkan perubahan UI ke seluruh elemen di halaman
function applyRoleUI(role) {
  setRole(role);
  const isOwner = (role === 'pemilik');

  // 1. Sidebar Menu Khusus Pemilik
  const ownerSection = document.getElementById('ownerMenuSection');
  if (ownerSection) {
    if (isOwner) {
      ownerSection.classList.remove('hidden');
    } else {
      ownerSection.classList.add('hidden');
    }
  }

  // Fallback: Jika halaman belum membungkus menu khusus dengan #ownerMenuSection, sembunyikan manual link pemilik
  const ownerPageLinks = document.querySelectorAll('aside nav a[href*="buka-karung"], aside nav a[href*="ambil-uang"], aside nav a[href*="laporan"]');
  ownerPageLinks.forEach(link => {
    if (isOwner) {
      link.classList.remove('hidden');
    } else {
      link.classList.add('hidden');
    }
  });

  // 2. Sidebar Badge Status
  const roleBadgeSidebar = document.getElementById('roleBadgeSidebar');
  if (roleBadgeSidebar) {
    if (isOwner) {
      roleBadgeSidebar.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 👑 Mode Pemilik';
      roleBadgeSidebar.className = 'text-xs text-emerald-400 font-semibold flex items-center gap-1.5';
    } else {
      roleBadgeSidebar.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> 🟡 Mode Penjaga (Saudara)';
      roleBadgeSidebar.className = 'text-xs text-amber-400 font-semibold flex items-center gap-1.5';
    }
  }

  // 3. Tombol Switch Role di Sidebar
  const btnSwitchSidebar = document.getElementById('btnSwitchRoleSidebar');
  const labelSwitchSidebar = document.getElementById('labelSwitchRoleSidebar');
  const roleDescSidebar = document.getElementById('roleDescSidebar');

  if (labelSwitchSidebar) {
    labelSwitchSidebar.innerText = isOwner ? 'Ganti ke Mode Penjaga' : '🔑 Buka Mode Pemilik';
  }
  if (roleDescSidebar) {
    roleDescSidebar.innerText = isOwner ? 'Akses: Semua Fitur Terbuka' : 'Akses Terbatas: Kasir & Stok';
  }
  if (btnSwitchSidebar) {
    if (isOwner) {
      btnSwitchSidebar.className = 'w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-between transition';
    } else {
      btnSwitchSidebar.className = 'w-full py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center justify-between transition';
    }
  }

  // 4. Header / Topbar Desktop
  const badgeTop = document.getElementById('roleBadgeTop');
  const labelSwitchTop = document.getElementById('labelSwitchRoleTop');
  if (badgeTop) {
    if (isOwner) {
      badgeTop.innerText = '👑 Pemilik';
      badgeTop.className = 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap inline-flex items-center gap-1 shrink-0';
    } else {
      badgeTop.innerText = '🟡 Penjaga';
      badgeTop.className = 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap inline-flex items-center gap-1 shrink-0';
    }
  }
  if (labelSwitchTop) {
    labelSwitchTop.innerText = isOwner ? 'Mode Penjaga' : 'Mode Pemilik';
  }
  const btnSwitchMobile = document.getElementById('btnSwitchRoleMobile');
  if (btnSwitchMobile) {
    btnSwitchMobile.title = isOwner ? 'Alihkan ke Mode Penjaga' : 'Buka Mode Pemilik (Ketik PIN)';
  }

  // 5. Elemen Mobile Header & Bottom Nav
  const roleTextMob = document.getElementById('roleTextMobile');
  const keeperNoticeMob = document.getElementById('keeperNoticeMobile');
  const btnAmbilUangMob = document.getElementById('btnMobileAmbilUang');
  const btnBukaKarungMob = document.getElementById('btnMobileBukaKarung');
  const btnLaporanMob = document.getElementById('btnMobileLaporan');
  const navLaporanMob = document.getElementById('navMobileLaporan');

  if (roleTextMob) {
    roleTextMob.innerText = isOwner ? '👑 Mode Pemilik (Ganti)' : '🟡 Mode Penjaga (Terkunci)';
  }
  if (keeperNoticeMob) {
    if (isOwner) keeperNoticeMob.classList.add('hidden');
    else keeperNoticeMob.classList.remove('hidden');
  }
  if (btnAmbilUangMob) isOwner ? btnAmbilUangMob.classList.remove('hidden') : btnAmbilUangMob.classList.add('hidden');
  if (btnBukaKarungMob) isOwner ? btnBukaKarungMob.classList.remove('hidden') : btnBukaKarungMob.classList.add('hidden');
  if (btnLaporanMob) isOwner ? btnLaporanMob.classList.remove('hidden') : btnLaporanMob.classList.add('hidden');
  if (navLaporanMob) isOwner ? navLaporanMob.classList.remove('hidden') : navLaporanMob.classList.add('hidden');

  // 6. Elemen-elemen dengan class .owner-only
  document.querySelectorAll('.owner-only').forEach(el => {
    if (isOwner) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  // 7. Sensor Harga Modal & Untung (Jika ada di halaman)
  const thHargaBeli = document.getElementById('thHargaBeli');
  const tdModalList = document.querySelectorAll('.td-modal');
  if (thHargaBeli) {
    if (isOwner) thHargaBeli.classList.remove('hidden');
    else thHargaBeli.classList.add('hidden');
  }
  tdModalList.forEach(td => {
    if (isOwner) td.classList.remove('hidden');
    else td.classList.add('hidden');
  });

  const untungMobVal = document.getElementById('untungMobileVal');
  const untungDeskVal = document.getElementById('untungDesktopVal');
  const untungDeskSub = document.getElementById('untungDesktopSub');
  const bebanDeskVal = document.getElementById('bebanDesktopVal');
  const bebanDeskSub = document.getElementById('bebanDesktopSub');

  if (isOwner) {
    if (typeof window.refreshFinancialMetrics === 'function') {
      window.refreshFinancialMetrics();
    } else {
      if (untungMobVal) untungMobVal.innerText = 'Rp 285.000';
      if (untungDeskVal) untungDeskVal.innerText = 'Rp 285.000';
      if (untungDeskSub) untungDeskSub.innerText = 'Margin rata-rata 19.6%';
      if (bebanDeskVal) bebanDeskVal.innerText = 'Rp 50.000';
      if (bebanDeskSub) bebanDeskSub.innerText = 'Bensin angkut & plastik';
    }
  } else {
    if (untungMobVal) untungMobVal.innerHTML = '<span class="text-slate-400 font-bold text-sm tracking-wider">🔒 Terkunci</span>';
    if (untungDeskVal) untungDeskVal.innerHTML = '<span class="text-slate-400 font-bold text-base">🔒 Rahasia Pemilik</span>';
    if (untungDeskSub) untungDeskSub.innerText = 'Disembunyikan di mode penjaga';
    if (bebanDeskVal) bebanDeskVal.innerHTML = '<span class="text-slate-400 font-bold text-base">🔒 Rahasia</span>';
    if (bebanDeskSub) bebanDeskSub.innerText = 'Disembunyikan di mode penjaga';
  }
}

// Fungsi Panggil untuk Switch Role
function toggleUserRole() {
  const current = getCurrentRole();
  if (current === 'pemilik') {
    showAppConfirm("Aktifkan MODE PENJAGA SEMENTARA?\n\n• Data keuntungan dan modal beli disembunyikan.\n• Menu Ambil Uang, Buka Karung & Laporan dikunci rahasia.\n• Saudara hanya bisa melayani transaksi Kasir & cek stok.", {
      judul: "Aktifkan Mode Penjaga?",
      tipe: "warning",
      tombolOk: "Ya, Aktifkan Penjaga",
      tombolBatal: "Batal",
      onOk: () => {
        applyRoleUI('penjaga');
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (OWNER_ONLY_PAGES.includes(currentPath)) {
          showAppModal("Mode Penjaga Aktif!\n\nMengalihkan ke menu Kasir...", {
            judul: "Akses Dibatasi",
            tipe: "info",
            onTutup: () => {
              window.location.href = 'kasir.html';
            }
          });
        } else {
          showAppModal("Mode Penjaga Aktif!\n\nSeluruh menu dan data keuangan sensitif telah dikunci di semua halaman.", {
            judul: "Mode Penjaga Aktif",
            tipe: "sukses"
          });
        }
      }
    });
  } else {
    mintaPinPemilik();
  }
}

function mintaPinPemilik() {
  ensurePinModalExists();
  const modal = document.getElementById('pinModal');
  const input = document.getElementById('pinInput');
  if (input) input.value = '';
  if (modal) modal.classList.remove('hidden');
  setTimeout(() => {
    if (input) input.focus();
  }, 150);
}

function tutupModalPin() {
  const modal = document.getElementById('pinModal');
  if (modal) modal.classList.add('hidden');
}

function verifikasiPin() {
  const input = document.getElementById('pinInput');
  if (input && OWNER_PINS.includes(input.value.trim())) {
    tutupModalPin();
    applyRoleUI('pemilik');
    showAppModal("PIN Benar!\n\nMode Pemilik telah aktif kembali. Seluruh menu keuangan, prive, dan laporan terbuka penuh.", {
      judul: "Mode Pemilik Terbuka",
      tipe: "sukses"
    });
  } else {
    showAppModal("PIN yang Anda masukkan salah!\n\nSilakan coba lagi (Demo PIN: 1234 atau 2026).", {
      judul: "PIN Salah",
      tipe: "error"
    });
    if (input) input.value = '';
  }
}

// Ekspor ke window agar kompatibel dengan pemanggilan inline di HTML
window.getCurrentRole = getCurrentRole;
window.setRole = setRole;
window.applyRoleUI = applyRoleUI;
window.terapkanPeran = applyRoleUI;
window.toggleUserRole = toggleUserRole;
window.mintaPinPemilik = mintaPinPemilik;
window.tutupModalPin = tutupModalPin;
window.verifikasiPin = verifikasiPin;
