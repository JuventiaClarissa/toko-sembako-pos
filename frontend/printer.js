// ==============================================================================
// MODUL CETAK STRUK & PROFIL TOKO (printer.js) - FASE 3
// Printer thermal Bluetooth (ESC/POS via Web Bluetooth) + fallback cetak browser
// ==============================================================================
(function () {
  const SETTINGS_KEY = 'toko_settings';
  const DEFAULT_SETTINGS = {
    nama: 'Toko Berkah Garam',
    alamat: 'Jl. Raya No. 1',
    telp: '',
    footer: 'Terima kasih sudah berbelanja!',
    rekeningBank: 'BCA 1234567890 a.n Toko Berkah', // Rekening transfer
    lebarKertas: 32,      // 32 = kertas 58mm, 48 = kertas 80mm
    autoCetak: false      // true = langsung cetak setelah bayar
  };

  // Daftar service/characteristic printer BLE yang umum (Xprinter, MPT, RPP, dll.)
  const BLE_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '0000fee7-0000-1000-8000-00805f9b34fb'
  ];

  let btDevice = null;
  let btChar = null;

  function getSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...getSettings(), ...s }));
    window.dispatchEvent(new CustomEvent('toko:settings-updated'));
  }

  const rp = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0));

  // ---------------- Pembuat teks struk ----------------
  function ascii(str) {
    return String(str == null ? '' : str).replace(/[^\x20-\x7E]/g, '');
  }
  function center(text, w) {
    text = ascii(text);
    if (text.length >= w) return text;
    return ' '.repeat(Math.floor((w - text.length) / 2)) + text;
  }
  function leftRight(l, r, w) {
    l = ascii(l); r = ascii(r);
    const space = Math.max(1, w - l.length - r.length);
    if (l.length + r.length + 1 > w) l = l.slice(0, Math.max(1, w - r.length - 1));
    return l + ' '.repeat(Math.max(1, w - l.length - r.length)) + r;
  }
  function wrap(text, w) {
    const out = [];
    text = ascii(text);
    while (text.length > w) { out.push(text.slice(0, w)); text = text.slice(w); }
    out.push(text);
    return out;
  }

  // trx: { invoice, date, customer, paymentType, bankNote, items[], total, paid, change, sisaBon }
  function buildReceiptLines(trx) {
    const s = getSettings();
    const w = Number(s.lebarKertas) || 32;
    const line = '-'.repeat(w);
    const L = [];
    L.push({ t: center(s.nama, w), b: true });
    if (s.alamat) wrap(s.alamat, w).forEach(x => L.push({ t: center(x, w) }));
    if (s.telp) L.push({ t: center('Telp: ' + s.telp, w) });
    L.push({ t: line });
    const d = trx.date ? new Date(trx.date) : new Date();
    L.push({ t: leftRight('No: ' + (trx.invoice || '-'), '', w) });
    L.push({ t: d.toLocaleDateString('id-ID') + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
    L.push({ t: 'Pelanggan: ' + ascii(trx.customer || 'Umum') });
    L.push({ t: line });
    (trx.items || []).forEach(it => {
      wrap(it.name, w).forEach(x => L.push({ t: x }));
      const qty = Number(it.qty || 1);
      const price = Number(it.price || it.unit_price || 0);
      L.push({ t: leftRight(`  ${qty} x ${new Intl.NumberFormat('id-ID').format(price)}`, new Intl.NumberFormat('id-ID').format(qty * price), w) });
    });
    L.push({ t: line });
    L.push({ t: leftRight('TOTAL', rp(trx.total), w), b: true });
    if (trx.paymentType === 'bon') {
      L.push({ t: leftRight('DP Dibayar', rp(trx.paid), w) });
      L.push({ t: leftRight('SISA BON', rp(trx.sisaBon), w), b: true });
    } else if (trx.paymentType === 'transfer') {
      L.push({ t: leftRight('Bayar (TRANSFER)', rp(trx.paid || trx.total), w) });
      if (trx.bankNote) wrap('Bank: ' + trx.bankNote, w).forEach(x => L.push({ t: x }));
    } else {
      L.push({ t: leftRight('Bayar (TUNAI)', rp(trx.paid || trx.total), w) });
      if (Number(trx.change) > 0) L.push({ t: leftRight('Kembali', rp(trx.change), w) });
    }
    L.push({ t: line });
    if (s.footer) wrap(s.footer, w).forEach(x => L.push({ t: center(x, w) }));
    return L;
  }

  // ---------------- Bluetooth ESC/POS ----------------
  function isBluetoothSupported() {
    return !!(navigator.bluetooth && navigator.bluetooth.requestDevice);
  }
  function isConnected() {
    return !!(btDevice && btDevice.gatt && btDevice.gatt.connected && btChar);
  }

  async function findWritableCharacteristic(server) {
    const services = await server.getPrimaryServices();
    for (const svc of services) {
      try {
        const chars = await svc.getCharacteristics();
        for (const c of chars) {
          if (c.properties.write || c.properties.writeWithoutResponse) return c;
        }
      } catch (e) { /* lewati service yang tidak bisa dibaca */ }
    }
    return null;
  }

  async function connectPrinter() {
    if (!isBluetoothSupported()) {
      throw new Error('Browser ini tidak mendukung Bluetooth. Gunakan Chrome di Android/Windows (alamat harus https atau localhost).');
    }
    btDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BLE_SERVICES
    });
    btDevice.addEventListener('gattserverdisconnected', () => {
      btChar = null;
      window.dispatchEvent(new CustomEvent('toko:printer-status'));
    });
    const server = await btDevice.gatt.connect();
    btChar = await findWritableCharacteristic(server);
    if (!btChar) throw new Error('Printer terhubung, tetapi saluran cetak tidak ditemukan. Pastikan ini printer thermal ESC/POS.');
    localStorage.setItem('toko_printer_name', btDevice.name || 'Printer Bluetooth');
    window.dispatchEvent(new CustomEvent('toko:printer-status'));
    return btDevice.name || 'Printer Bluetooth';
  }

  async function reconnectIfPossible() {
    if (isConnected()) return true;
    if (btDevice && btDevice.gatt) {
      try {
        const server = await btDevice.gatt.connect();
        btChar = await findWritableCharacteristic(server);
        return !!btChar;
      } catch (e) { return false; }
    }
    return false;
  }

  function disconnectPrinter() {
    if (btDevice && btDevice.gatt && btDevice.gatt.connected) btDevice.gatt.disconnect();
    btChar = null;
    window.dispatchEvent(new CustomEvent('toko:printer-status'));
  }

  function encodeEscPos(lines) {
    const bytes = [];
    const push = (...b) => bytes.push(...b);
    push(0x1B, 0x40); // reset printer
    lines.forEach(l => {
      push(0x1B, 0x45, l.b ? 1 : 0); // bold on/off
      for (const ch of ascii(l.t)) push(ch.charCodeAt(0));
      push(0x0A);
    });
    push(0x1B, 0x45, 0);
    push(0x0A, 0x0A, 0x0A); // jarak sebelum sobek
    push(0x1D, 0x56, 0x42, 0x00); // potong kertas (diabaikan jika tidak ada pemotong)
    return new Uint8Array(bytes);
  }

  async function writeChunks(data) {
    // BLE ATT MTU standar aman adalah 20 bytes untuk semua sistem operasi (Windows/Android)
    const size = 20;
    const noResp = btChar.properties.writeWithoutResponse && !btChar.properties.write;
    for (let i = 0; i < data.length; i += size) {
      const chunk = data.slice(i, i + size);
      if (noResp) await btChar.writeValueWithoutResponse(chunk);
      else await btChar.writeValue(chunk);
      await new Promise(r => setTimeout(r, 20));
    }
  }

  // ---------------- Fallback cetak lewat iframe browser (Anti-Pop-up Blocker) ----------------
  function printViaBrowser(lines) {
    const s = getSettings();
    const mm = Number(s.lebarKertas) >= 48 ? '80mm' : '58mm';
    const html = lines.map(l => `<div style="${l.b ? 'font-weight:bold;' : ''}">${ascii(l.t).replace(/ /g, '&nbsp;') || '&nbsp;'}</div>`).join('');
    
    let iframe = document.getElementById('receiptPrintFrame');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'receiptPrintFrame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Struk Toko</title><style>
      @page { size: ${mm} auto; margin: 2mm; }
      body { font-family: 'Courier New', monospace; font-size: 12px; width: ${mm}; margin: 0; padding: 4px; color: #000; }
      div { line-height: 1.25; }
    </style></head><body>${html}</body></html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
    return true;
  }

  // Cetak struk: pakai Bluetooth jika terhubung, opsi forceBrowser untuk cetak biasa
  async function printReceipt(trx, options = {}) {
    const lines = buildReceiptLines(trx);
    const forceBrowser = options.forceBrowser === true;

    if (!forceBrowser && (await reconnectIfPossible())) {
      try {
        await writeChunks(encodeEscPos(lines));
        return { 
          ok: true, 
          via: 'bluetooth', 
          printerName: btDevice ? (btDevice.name || 'Printer Bluetooth') : 'Printer Bluetooth',
          isPeriPage: !!(btDevice && btDevice.name && btDevice.name.toLowerCase().includes('peripage'))
        };
      } catch (e) {
        console.warn('Cetak Bluetooth gagal, dialihkan ke browser:', e);
        if (options.throwOnError) throw e;
      }
    }
    const ok = printViaBrowser(lines);
    return { ok, via: 'browser' };
  }

  async function testPrint(options = {}) {
    return printReceipt({
      invoice: 'TEST-001',
      date: new Date().toISOString(),
      customer: 'Tes Cetak Toko',
      paymentType: 'tunai',
      items: [
        { name: 'Garam Krosok 1kg', qty: 2, price: 3000 },
        { name: 'Aqua Dus Gelas', qty: 1, price: 28000 }
      ],
      total: 34000, 
      paid: 50000, 
      change: 16000
    }, options);
  }

  window.Printer = {
    getSettings, saveSettings, buildReceiptLines,
    isBluetoothSupported, isConnected, connectPrinter, disconnectPrinter,
    printReceipt, testPrint, printViaBrowser, encodeEscPos
  };
})();
