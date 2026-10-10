// ==============================================================================
// MODUL DATABASE CLIENT: TOKO BERKAH GARAM (db.js) - FASE 2
// Sinkronisasi Dua Arah: Cloud Supabase & Fallback Offline LocalStorage
// ==============================================================================

(function() {
  const DEFAULT_SUPABASE_URL = localStorage.getItem('supabase_url') || '';
  const DEFAULT_SUPABASE_KEY = localStorage.getItem('supabase_anon_key') || '';

  let supabaseClient = null;
  let isCloudActive = false;
  let realtimeChannel = null;

  // Initial Seed Data jika penyimpanan kosong
  const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Garam Krosok (Karung 50kg)', category: 'garam', unit: 'Karung', stock_toko: 8, stock_gudang: 125, cost_price: 95000, sell_price: 110000, min_stock_alert: 10, is_active: true },
    { id: 2, name: 'Garam Krosok (Eceran 1kg)', category: 'garam', unit: 'Bungkus', stock_toko: 45, stock_gudang: 0, cost_price: 2083, sell_price: 3000, min_stock_alert: 20, is_active: true },
    { id: 3, name: 'Garam Sawi (1 Bal / 20 bks)', category: 'garam', unit: 'Bal', stock_toko: 15, stock_gudang: 60, cost_price: 32000, sell_price: 38000, min_stock_alert: 10, is_active: true },
    { id: 4, name: 'Aqua Dus Gelas (1 Dus / 48)', category: 'minuman', unit: 'Dus', stock_toko: 12, stock_gudang: 80, cost_price: 24000, sell_price: 28000, min_stock_alert: 15, is_active: true },
    { id: 5, name: 'Aqua 600ml (1 Dus / 24)', category: 'minuman', unit: 'Dus', stock_toko: 8, stock_gudang: 40, cost_price: 48000, sell_price: 55000, min_stock_alert: 10, is_active: true },
    { id: 6, name: 'Beras Ramos 5kg', category: 'sembako', unit: 'Karung', stock_toko: 6, stock_gudang: 25, cost_price: 64000, sell_price: 72000, min_stock_alert: 5, is_active: true }
  ];

  const DEFAULT_BON_DATA = [
    {
      id: '1',
      customer_name: 'Warung Bu Siti',
      customer_phone: '081234567890',
      total_debt: 550000,
      paid_debt: 200000,
      remaining_debt: 350000,
      due_date: '2026-10-15',
      status: 'belum_lunas',
      items_summary: '5 Karung Garam Krosok',
      notes: 'Langganan warung kelontong depan balai RW'
    },
    {
      id: '2',
      customer_name: 'Cak Dul (Warung Kopi)',
      customer_phone: '085712349988',
      total_debt: 140000,
      paid_debt: 50000,
      remaining_debt: 90000,
      due_date: '2026-10-10',
      status: 'belum_lunas',
      items_summary: '5 Dus Aqua Gelas',
      notes: 'Titip nota dulu, bayar tiap jumat'
    },
    {
      id: '3',
      customer_name: 'Pak Haji Mansur',
      customer_phone: '081398765432',
      total_debt: 880000,
      paid_debt: 880000,
      remaining_debt: 0,
      due_date: '2026-10-05',
      status: 'lunas',
      items_summary: '8 Karung Garam Krosok',
      notes: 'Sudah lunas tunai di laci kasir'
    }
  ];

  const getTodayISO = (hour = 8, min = 0) => {
    const d = new Date();
    d.setHours(hour, min, 0, 0);
    return d.toISOString();
  };

  const DEFAULT_TRANSACTIONS = [
    {
      id: 'trx-101',
      invoice_no: 'TRX-1001',
      transaction_date: getTodayISO(8, 15),
      customer_name: 'Warung Bu Siti',
      customer_phone: '081234567890',
      payment_type: 'tunai',
      total_amount: 330000,
      paid_amount: 330000,
      change_amount: 0,
      cashier_role: 'pemilik',
      notes: 'Garam 50kg 3 karung',
      items: [{ id: 1, name: 'Garam Krosok (Karung 50kg)', unit: 'Karung', qty: 3, unit_price: 110000, subtotal: 330000, cost_price: 95000 }]
    },
    {
      id: 'trx-102',
      invoice_no: 'TRX-1002',
      transaction_date: getTodayISO(8, 45),
      customer_name: 'Pak RT Bambang',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 28000,
      paid_amount: 30000,
      change_amount: 2000,
      cashier_role: 'pemilik',
      notes: 'Aqua dus',
      items: [{ id: 4, name: 'Aqua Dus Gelas (1 Dus / 48)', unit: 'Dus', qty: 1, unit_price: 28000, subtotal: 28000, cost_price: 24000 }]
    },
    {
      id: 'trx-103',
      invoice_no: 'TRX-1003',
      transaction_date: getTodayISO(9, 20),
      customer_name: 'Cak Dul (Warung Kopi)',
      customer_phone: '085712349988',
      payment_type: 'tunai',
      total_amount: 140000,
      paid_amount: 140000,
      change_amount: 0,
      cashier_role: 'pemilik',
      notes: '5 Dus Aqua Gelas',
      items: [{ id: 4, name: 'Aqua Dus Gelas (1 Dus / 48)', unit: 'Dus', qty: 5, unit_price: 28000, subtotal: 140000, cost_price: 24000 }]
    },
    {
      id: 'trx-104',
      invoice_no: 'TRX-1004',
      transaction_date: getTodayISO(10, 10),
      customer_name: 'Ibu Haryati',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 72000,
      paid_amount: 100000,
      change_amount: 28000,
      cashier_role: 'pemilik',
      notes: 'Beras Ramos 5kg',
      items: [{ id: 6, name: 'Beras Ramos 5kg', unit: 'Karung', qty: 1, unit_price: 72000, subtotal: 72000, cost_price: 64000 }]
    },
    {
      id: 'trx-105',
      invoice_no: 'TRX-1005',
      transaction_date: getTodayISO(11, 5),
      customer_name: 'Pak Slamet Penjual Ikan',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 220000,
      paid_amount: 220000,
      change_amount: 0,
      cashier_role: 'pemilik',
      notes: 'Garam Krosok 2 karung untuk es ikan',
      items: [{ id: 1, name: 'Garam Krosok (Karung 50kg)', unit: 'Karung', qty: 2, unit_price: 110000, subtotal: 220000, cost_price: 95000 }]
    },
    {
      id: 'trx-106',
      invoice_no: 'TRX-1006',
      transaction_date: getTodayISO(11, 40),
      customer_name: 'Warung Bakso Mas Joko',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 45000,
      paid_amount: 50000,
      change_amount: 5000,
      cashier_role: 'pemilik',
      notes: 'Garam 1kg 15 bungkus',
      items: [{ id: 2, name: 'Garam Krosok (Eceran 1kg)', unit: 'Bungkus', qty: 15, unit_price: 3000, subtotal: 45000, cost_price: 2083 }]
    },
    {
      id: 'trx-107',
      invoice_no: 'TRX-1007',
      transaction_date: getTodayISO(12, 30),
      customer_name: 'Kantin Sekolah Berkah',
      customer_phone: '',
      payment_type: 'transfer',
      total_amount: 110000,
      paid_amount: 110000,
      change_amount: 0,
      cashier_role: 'pemilik',
      notes: 'Aqua 600ml 2 dus via QRIS',
      items: [{ id: 5, name: 'Aqua 600ml (1 Dus / 24)', unit: 'Dus', qty: 2, unit_price: 55000, subtotal: 110000, cost_price: 48000 }]
    },
    {
      id: 'trx-108',
      invoice_no: 'TRX-1008',
      transaction_date: getTodayISO(13, 15),
      customer_name: 'Toko Kelontong Berdikari',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 114000,
      paid_amount: 120000,
      change_amount: 6000,
      cashier_role: 'pemilik',
      notes: 'Garam Sawi 3 bal',
      items: [{ id: 3, name: 'Garam Sawi (1 Bal / 20 bks)', unit: 'Bal', qty: 3, unit_price: 38000, subtotal: 114000, cost_price: 32000 }]
    },
    {
      id: 'trx-109',
      invoice_no: 'TRX-1009',
      transaction_date: getTodayISO(14, 0),
      customer_name: 'Pelanggan Umum',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 30000,
      paid_amount: 50000,
      change_amount: 20000,
      cashier_role: 'pemilik',
      notes: 'Garam 1kg 10 bks',
      items: [{ id: 2, name: 'Garam Krosok (Eceran 1kg)', unit: 'Bungkus', qty: 10, unit_price: 3000, subtotal: 30000, cost_price: 2083 }]
    },
    {
      id: 'trx-110',
      invoice_no: 'TRX-1010',
      transaction_date: getTodayISO(14, 45),
      customer_name: 'Warung Padang Murah',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 72000,
      paid_amount: 100000,
      change_amount: 28000,
      cashier_role: 'pemilik',
      notes: 'Beras Ramos 5kg',
      items: [{ id: 6, name: 'Beras Ramos 5kg', unit: 'Karung', qty: 1, unit_price: 72000, subtotal: 72000, cost_price: 64000 }]
    },
    {
      id: 'trx-111',
      invoice_no: 'TRX-1011',
      transaction_date: getTodayISO(15, 30),
      customer_name: 'Ibu Ningsih',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 56000,
      paid_amount: 60000,
      change_amount: 4000,
      cashier_role: 'pemilik',
      notes: '2 Dus Aqua Gelas',
      items: [{ id: 4, name: 'Aqua Dus Gelas (1 Dus / 48)', unit: 'Dus', qty: 2, unit_price: 28000, subtotal: 56000, cost_price: 24000 }]
    },
    {
      id: 'trx-112',
      invoice_no: 'TRX-1012',
      transaction_date: getTodayISO(16, 15),
      customer_name: 'Pakde Gito',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 38000,
      paid_amount: 40000,
      change_amount: 2000,
      cashier_role: 'pemilik',
      notes: 'Garam Sawi 1 bal',
      items: [{ id: 3, name: 'Garam Sawi (1 Bal / 20 bks)', unit: 'Bal', qty: 1, unit_price: 38000, subtotal: 38000, cost_price: 32000 }]
    },
    {
      id: 'trx-113',
      invoice_no: 'TRX-1013',
      transaction_date: getTodayISO(17, 0),
      customer_name: 'Warung Tegal Bahari',
      customer_phone: '',
      payment_type: 'tunai',
      total_amount: 85000,
      paid_amount: 100000,
      change_amount: 15000,
      cashier_role: 'pemilik',
      notes: 'Garam 1kg (10) & Aqua 600ml (1)',
      items: [
        { id: 2, name: 'Garam Krosok (Eceran 1kg)', unit: 'Bungkus', qty: 10, unit_price: 3000, subtotal: 30000, cost_price: 2083 },
        { id: 5, name: 'Aqua 600ml (1 Dus / 24)', unit: 'Dus', qty: 1, unit_price: 55000, subtotal: 55000, cost_price: 48000 }
      ]
    },
    {
      id: 'trx-114',
      invoice_no: 'TRX-1014',
      transaction_date: getTodayISO(17, 45),
      customer_name: 'Pak Haji Mansur',
      customer_phone: '081398765432',
      payment_type: 'tunai',
      total_amount: 110000,
      paid_amount: 110000,
      change_amount: 0,
      cashier_role: 'pemilik',
      notes: '1 Karung Garam Krosok',
      items: [{ id: 1, name: 'Garam Krosok (Karung 50kg)', unit: 'Karung', qty: 1, unit_price: 110000, subtotal: 110000, cost_price: 95000 }]
    }
  ];

  const DEFAULT_CASH_MOVEMENTS = [
    {
      id: 'cash-001',
      movement_type: 'keluar',
      wallet_source: 'laci_kasir',
      category: 'beban_usaha',
      amount: 50000,
      notes: 'Bensin angkut pikap & plastik karung',
      logged_by: 'pemilik',
      created_at: getTodayISO(9, 0)
    },
    {
      id: 'cash-002',
      movement_type: 'keluar',
      wallet_source: 'laci_kasir',
      category: 'prive',
      amount: 100000,
      notes: 'Uang dapur & belanja rumah',
      logged_by: 'pemilik',
      created_at: getTodayISO(12, 10)
    }
  ];

  // Inisialisasi Klien Supabase jika script CDN Supabase tersedia
  function initSupabase() {
    const url = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
    const key = localStorage.getItem('supabase_anon_key') || DEFAULT_SUPABASE_KEY;

    if (url && key && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        isCloudActive = true;
        console.log("✅ Terhubung ke Supabase Cloud:", url);
        updateDbStatusIndicator(true);
        setupRealtime();
      } catch (e) {
        console.warn("⚠️ Gagal inisialisasi Supabase, menggunakan LocalStorage:", e);
        isCloudActive = false;
        updateDbStatusIndicator(false);
      }
    } else {
      isCloudActive = false;
      updateDbStatusIndicator(false);
    }
  }

  // Setup Realtime Sync Supabase
  function setupRealtime() {
    if (!supabaseClient || realtimeChannel) return;
    try {
      realtimeChannel = supabaseClient.channel('toko-realtime-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => notifyChange('products'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => notifyChange('transactions'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_debts' }, () => notifyChange('debts'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_movements' }, () => notifyChange('cash'))
        .subscribe();
    } catch (e) {
      console.warn("Supabase Realtime subscription error:", e);
    }
  }

  // Broadcast notifikasi pembaruan data antar-komponen & tab
  function notifyChange(resource) {
    window.dispatchEvent(new CustomEvent('toko:data-updated', { detail: { resource } }));
  }

  // Indikator Status Database di Header
  function updateDbStatusIndicator(online) {
    const badges = document.querySelectorAll('.db-status-badge');
    badges.forEach(b => {
      if (online) {
        b.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Cloud Aktif';
        b.className = 'db-status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer shadow-sm';
        b.title = 'Tersinkronisasi Real-time ke Cloud Supabase (Klik untuk Pengaturan)';
      } else {
        b.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500"></span> Mode Offline / Lokal';
        b.className = 'db-status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer shadow-sm';
        b.title = 'Data tersimpan di browser ini. Klik untuk hubungkan ke Supabase Cloud.';
      }
      b.onclick = window.bukaPengaturanDatabase;
    });
  }

  // Helper local storage
  function getLocal(key, defaultVal) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultVal;
    } catch(e) {
      return defaultVal;
    }
  }

  function setLocal(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // ============================================================================
  // DATABASE ACCESS OBJECT (DB)
  // ============================================================================
  const DB = {
    isCloud: () => isCloudActive,

    // --------------------------------------------------------------------------
    // 1. PRODUK & INVENTARIS
    // --------------------------------------------------------------------------
    async getProducts(categoryFilter = null) {
      let products = [];
      if (isCloudActive && supabaseClient) {
        try {
          let query = supabaseClient.from('products').select('*').eq('is_active', true).order('id', { ascending: true });
          if (categoryFilter && categoryFilter !== 'semua') {
            query = query.eq('category', categoryFilter);
          }
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            products = data;
            setLocal('toko_products_cache', products);
            return products;
          }
        } catch (e) {
          console.warn("Gagal memuat produk dari Supabase:", e);
        }
      }

      // Fallback Local Cache
      products = getLocal('toko_products_cache', null);
      if (!products || products.length === 0) {
        products = [...DEFAULT_PRODUCTS];
        setLocal('toko_products_cache', products);
      }

      if (categoryFilter && categoryFilter !== 'semua') {
        return products.filter(p => p.category === categoryFilter);
      }
      return products;
    },

    async addProduct(prodData) {
      const newProd = {
        name: prodData.name,
        category: prodData.category || 'sembako',
        unit: prodData.unit || 'Pcs',
        stock_toko: Number(prodData.stock_toko || 0),
        stock_gudang: Number(prodData.stock_gudang || 0),
        cost_price: Number(prodData.cost_price || 0),
        sell_price: Number(prodData.sell_price || 0),
        min_stock_alert: Number(prodData.min_stock_alert || 5),
        is_active: true
      };

      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('products').insert([newProd]).select().single();
          if (!error && data) {
            const list = await this.getProducts();
            list.push(data);
            setLocal('toko_products_cache', list);
            notifyChange('products');
            return data;
          }
        } catch (e) {
          console.warn("Gagal tambah produk Supabase:", e);
        }
      }

      const list = await this.getProducts();
      newProd.id = Date.now();
      list.push(newProd);
      setLocal('toko_products_cache', list);
      notifyChange('products');
      return newProd;
    },

    async updateProduct(id, updates) {
      if (isCloudActive && supabaseClient) {
        try {
          await supabaseClient.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
        } catch (e) {
          console.warn("Gagal update produk Supabase:", e);
        }
      }
      const list = await this.getProducts();
      const idx = list.findIndex(p => String(p.id) === String(id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        setLocal('toko_products_cache', list);
        notifyChange('products');
      }
      return true;
    },

    async updateStock(id, location, newQty) {
      const field = location === 'gudang' ? 'stock_gudang' : 'stock_toko';
      const updates = { [field]: Number(newQty) };
      return this.updateProduct(id, updates);
    },

    // Pindah Stok Antara Gudang dan Toko
    async transferStock(productId, fromLoc, toLoc, qty, notes = '') {
      const products = await this.getProducts();
      const prod = products.find(p => String(p.id) === String(productId));
      if (!prod) return false;

      const numQty = Number(qty);
      let newFrom = fromLoc === 'gudang' ? Number(prod.stock_gudang) - numQty : Number(prod.stock_toko) - numQty;
      let newTo = toLoc === 'toko' ? Number(prod.stock_toko) + numQty : Number(prod.stock_gudang) + numQty;

      newFrom = Math.max(0, newFrom);

      const updates = fromLoc === 'gudang'
        ? { stock_gudang: newFrom, stock_toko: newTo }
        : { stock_toko: newFrom, stock_gudang: newTo };

      await this.updateProduct(prod.id, updates);

      // Simpan log mutasi lokal
      const mutasi = getLocal('toko_stock_movements', []);
      mutasi.unshift({
        product_id: prod.id,
        product_name: prod.name,
        from: fromLoc,
        to: toLoc,
        qty: numQty,
        notes: notes,
        created_at: new Date().toISOString()
      });
      setLocal('toko_stock_movements', mutasi);
      notifyChange('products');
      return true;
    },

    // --------------------------------------------------------------------------
    // 2. TRANSAKSI PENJUALAN KASIR
    // --------------------------------------------------------------------------
    async saveTransaction(transData, items) {
      const invoiceNo = transData.invoice_no || `TRX-${Date.now().toString().slice(-6)}`;
      const payload = {
        invoice_no: invoiceNo,
        transaction_date: new Date().toISOString(),
        customer_name: transData.customer_name || 'Umum (Standar)',
        customer_phone: transData.customer_phone || '',
        payment_type: transData.payment_type || 'tunai',
        total_amount: Number(transData.total_amount || 0),
        paid_amount: Number(transData.paid_amount || 0),
        change_amount: Number(transData.change_amount || 0),
        cashier_role: localStorage.getItem('toko_role') || 'pemilik',
        notes: transData.notes || ''
      };

      // 1. Simpan Transaksi & Items ke Supabase Cloud jika aktif
      let savedId = null;
      if (isCloudActive && supabaseClient) {
        try {
          const { data: transResult, error: transErr } = await supabaseClient
            .from('transactions')
            .insert([payload])
            .select()
            .single();

          if (!transErr && transResult) {
            savedId = transResult.id;
            const itemPayload = items.map(it => ({
              transaction_id: transResult.id,
              product_id: it.id || null,
              product_name: it.name,
              unit: it.unit || 'Pcs',
              qty: Number(it.qty || 1),
              unit_price: Number(it.price || it.unit_price || 0),
              subtotal: Number(it.subtotal || ((it.qty || 1) * (it.price || 0))),
              cost_price: Number(it.cost_price || 0)
            }));
            await supabaseClient.from('transaction_items').insert(itemPayload);
          }
        } catch (e) {
          console.warn("Gagal simpan transaksi Supabase, fallback:", e);
        }
      }

      // 2. Simpan Transaksi ke Local Storage
      const localHistory = getLocal('toko_transactions', []);
      const completeTrans = { ...payload, id: savedId || `trx-${Date.now()}`, items: items };
      localHistory.unshift(completeTrans);
      setLocal('toko_transactions', localHistory);

      // 3. Potong Stok Toko secara Otomatis untuk setiap item yang laku
      const allProducts = await this.getProducts();
      for (const it of items) {
        const itemQty = Number(it.qty || 1);
        const match = allProducts.find(p => (it.id && String(p.id) === String(it.id)) || (p.name && it.name && p.name.toLowerCase().includes(it.name.toLowerCase())) || (p.name && it.name && it.name.toLowerCase().includes(p.name.toLowerCase())));
        if (match) {
          const sisaToko = Math.max(0, Number(match.stock_toko) - itemQty);
          await this.updateStock(match.id, 'toko', sisaToko);
        }
      }

      // 4. Catat Aliran Kas (Laci Tunai vs Rekening Bank)
      if (payload.payment_type === 'tunai' && payload.paid_amount > 0) {
        await this.logCashMovement({
          movement_type: 'masuk',
          wallet_source: 'laci_kasir',
          category: 'penjualan',
          amount: payload.paid_amount,
          notes: `Penjualan Tunai ${invoiceNo} (${payload.customer_name})`
        });
      } else if (payload.payment_type === 'transfer' && payload.total_amount > 0) {
        await this.logCashMovement({
          movement_type: 'masuk',
          wallet_source: 'rekening_bank',
          category: 'penjualan_transfer',
          amount: payload.total_amount,
          notes: `Penjualan Transfer Bank/QRIS ${invoiceNo} (${payload.customer_name})`
        });
      } else if (payload.payment_type === 'bon') {
        // Jika ada DP tunai
        if (payload.paid_amount > 0) {
          await this.logCashMovement({
            movement_type: 'masuk',
            wallet_source: 'laci_kasir',
            category: 'penjualan_dp',
            amount: payload.paid_amount,
            notes: `DP Bon ${invoiceNo} (${payload.customer_name})`
          });
        }
        // Masukkan sisa ke Buku Bon
        const sisaBon = Math.max(0, payload.total_amount - payload.paid_amount);
        if (sisaBon > 0) {
          await this.saveCustomerDebt({
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            total_debt: payload.total_amount,
            paid_debt: payload.paid_amount,
            remaining_debt: sisaBon,
            due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            status: 'belum_lunas',
            items_summary: items.map(i => `${i.qty || 1} ${i.name}`).join(', '),
            notes: payload.notes || `Bon dari kasir nota ${invoiceNo}`
          });
        }
      }

      notifyChange('transactions');
      return { success: true, invoice: invoiceNo, id: completeTrans.id };
    },

    async getTransactions(limit = 100) {
      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('transactions')
            .select('*, transaction_items(*)')
            .order('transaction_date', { ascending: false })
            .limit(limit);
          if (!error && data && data.length > 0) {
            setLocal('toko_transactions', data);
            return data;
          }
        } catch (e) {
          console.warn("Gagal get transactions dari Supabase:", e);
        }
      }
      const local = getLocal('toko_transactions', null);
      if (!local || local.length === 0) {
        setLocal('toko_transactions', DEFAULT_TRANSACTIONS);
        return DEFAULT_TRANSACTIONS.slice(0, limit);
      }
      return local.slice(0, limit);
    },

    // --------------------------------------------------------------------------
    // 3. BUKU BON & PIUTANG PELANGGAN
    // --------------------------------------------------------------------------
    async getCustomerDebts() {
      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('customer_debts')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            setLocal('toko_buku_bon', data);
            return data;
          }
        } catch (e) {
          console.warn("Gagal get customer debts dari Supabase:", e);
        }
      }
      const localBon = getLocal('toko_buku_bon', null);
      if (!localBon || localBon.length === 0) {
        setLocal('toko_buku_bon', DEFAULT_BON_DATA);
        return DEFAULT_BON_DATA;
      }
      return localBon;
    },

    async saveCustomerDebt(debtData) {
      const payload = {
        customer_name: debtData.customer_name,
        customer_phone: debtData.customer_phone || '',
        total_debt: Number(debtData.total_debt || 0),
        paid_debt: Number(debtData.paid_debt || 0),
        remaining_debt: Number(debtData.remaining_debt || debtData.total_debt || 0),
        due_date: debtData.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: (Number(debtData.remaining_debt) === 0) ? 'lunas' : 'belum_lunas',
        items_summary: debtData.items_summary || '',
        notes: debtData.notes || '',
        created_at: new Date().toISOString()
      };

      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('customer_debts').insert([payload]).select().single();
          if (!error && data) {
            const list = await this.getCustomerDebts();
            list.unshift(data);
            setLocal('toko_buku_bon', list);
            notifyChange('debts');
            return data;
          }
        } catch (e) {
          console.warn("Gagal simpan bon ke Supabase:", e);
        }
      }

      const list = await this.getCustomerDebts();
      const newEntry = { ...payload, id: `bon-${Date.now()}` };
      list.unshift(newEntry);
      setLocal('toko_buku_bon', list);
      notifyChange('debts');
      return newEntry;
    },

    async payCustomerDebt(debtId, amount, method = 'tunai_laci', notes = '') {
      const numAmount = Number(amount);
      let updatedRemaining = 0;
      let updatedStatus = 'belum_lunas';

      if (isCloudActive && supabaseClient) {
        try {
          const { data: curDebt } = await supabaseClient.from('customer_debts').select('*').eq('id', debtId).single();
          if (curDebt) {
            const newPaid = Number(curDebt.paid_debt) + numAmount;
            updatedRemaining = Math.max(0, Number(curDebt.total_debt) - newPaid);
            updatedStatus = updatedRemaining === 0 ? 'lunas' : 'belum_lunas';

            await supabaseClient.from('customer_debts').update({
              paid_debt: newPaid,
              remaining_debt: updatedRemaining,
              status: updatedStatus,
              updated_at: new Date().toISOString()
            }).eq('id', debtId);

            await supabaseClient.from('debt_payments').insert([{
              debt_id: debtId,
              amount_paid: numAmount,
              remaining_after: updatedRemaining,
              payment_method: method,
              notes: notes
            }]);
          }
        } catch (e) {
          console.warn("Gagal update cicilan bon ke Supabase:", e);
        }
      }

      // Update Local
      const debts = await this.getCustomerDebts();
      const target = debts.find(d => String(d.id) === String(debtId));
      if (target) {
        target.paid_debt = (Number(target.paid_debt) || 0) + numAmount;
        target.remaining_debt = Math.max(0, (Number(target.total_debt) || 0) - target.paid_debt);
        target.status = target.remaining_debt === 0 ? 'lunas' : 'belum_lunas';
        setLocal('toko_buku_bon', debts);
        updatedRemaining = target.remaining_debt;
        updatedStatus = target.status;
      }

      // Catat uang masuk ke kasir laci
      await this.logCashMovement({
        movement_type: 'masuk',
        wallet_source: method === 'transfer' ? 'bank' : 'laci_kasir',
        category: 'pelunasan_bon',
        amount: numAmount,
        notes: `Pelunasan cicilan bon (${notes || (target ? target.customer_name : '')})`
      });

      notifyChange('debts');
      return { success: true, remaining: updatedRemaining, status: updatedStatus };
    },

    // --------------------------------------------------------------------------
    // 4. KAS, PRIVE, BEBAN, DAN KULAKAN (CASH MOVEMENTS)
    // --------------------------------------------------------------------------
    async getCashMovements(limit = 100) {
      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('cash_movements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
          if (!error && data && data.length > 0) {
            setLocal('toko_cash_movements', data);
            return data;
          }
        } catch (e) {
          console.warn("Gagal ambil kas dari Supabase:", e);
        }
      }
      const local = getLocal('toko_cash_movements', null);
      if (!local || local.length === 0) {
        setLocal('toko_cash_movements', DEFAULT_CASH_MOVEMENTS);
        return DEFAULT_CASH_MOVEMENTS.slice(0, limit);
      }
      return local.slice(0, limit);
    },

    async logCashMovement(payload) {
      const entry = {
        movement_type: payload.movement_type || 'keluar',
        wallet_source: payload.wallet_source || 'laci_kasir',
        category: payload.category || 'beban_usaha',
        amount: Number(payload.amount || 0),
        notes: payload.notes || '',
        logged_by: payload.logged_by || (localStorage.getItem('toko_role') || 'pemilik'),
        created_at: new Date().toISOString()
      };

      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('cash_movements').insert([entry]).select().single();
          if (!error && data) {
            const localCash = getLocal('toko_cash_movements', []);
            localCash.unshift(data);
            setLocal('toko_cash_movements', localCash);
            notifyChange('cash');
            return data;
          }
        } catch (e) {
          console.warn("Gagal simpan kas Supabase:", e);
        }
      }

      const localCash = getLocal('toko_cash_movements', []);
      const newEntry = { ...entry, id: `cash-${Date.now()}` };
      localCash.unshift(newEntry);
      setLocal('toko_cash_movements', localCash);
      notifyChange('cash');
      return newEntry;
    },

    async cancelCashMovement(id, reason = '') {
      const list = await this.getCashMovements();
      const target = list.find(c => String(c.id) === String(id));
      if (!target) return false;

      // Buat entri pembalik (reversal)
      const reversalType = target.movement_type === 'keluar' ? 'masuk' : 'keluar';
      await this.logCashMovement({
        movement_type: reversalType,
        wallet_source: target.wallet_source,
        category: 'koreksi_batal',
        amount: target.amount,
        notes: `Pembatalan kas #${id}: ${reason || target.notes}`
      });

      return true;
    },

    // --------------------------------------------------------------------------
    // 5. BUKA KARUNG GARAM (REPACK 50KG KE 1KG)
    // --------------------------------------------------------------------------
    async processBukaKarung(arg1, arg2, arg3) {
      let karungQty = 1;
      let bungkusQty = 48;
      let packagingCost = 5000;
      let karungId = null;
      let eceranId = null;

      if (typeof arg1 === 'object' && arg1 !== null) {
        karungQty = Number(arg1.karungQty || arg1.karung_opened || 1);
        bungkusQty = Number(arg1.hasilPackQty || arg1.bungkusQty || arg1.pack_produced || 48);
        packagingCost = Number(arg1.biayaPlastikTotal || arg1.packagingCost || 5000);
        karungId = arg1.karungId || null;
        eceranId = arg1.eceranId || null;
      } else {
        karungQty = Number(arg1 || 1);
        bungkusQty = Number(arg2 || 48);
        packagingCost = Number(arg3 !== undefined ? arg3 : 5000);
      }

      const products = await this.getProducts();
      const karungProd = karungId ? products.find(p => String(p.id) === String(karungId)) : products.find(p => p.name.includes('50kg'));
      const eceranProd = eceranId ? products.find(p => String(p.id) === String(eceranId)) : products.find(p => p.name.includes('1kg'));

      const kQty = karungQty;
      const bQty = bungkusQty;
      const costPlastik = packagingCost;

      const modalBeliKarung = karungProd ? Number(karungProd.cost_price) : 95000;
      const totalModal = (kQty * modalBeliKarung) + costPlastik;
      const modalPerBks = Math.round(totalModal / bQty);
      const susutKg = Math.max(0, (kQty * 50) - bQty);
      const shrinkagePercent = Number(((susutKg / (kQty * 50)) * 100).toFixed(2));

      // 1. Kurangi Garam Karung 50kg di toko depan
      if (karungProd) {
        const sisaKarung = Math.max(0, Number(karungProd.stock_toko) - kQty);
        await this.updateStock(karungProd.id, 'toko', sisaKarung);
      }

      // 2. Tambah Garam Eceran 1kg di toko depan & update cost_price snapshot
      if (eceranProd) {
        const sisaEceran = Number(eceranProd.stock_toko) + bQty;
        await this.updateProduct(eceranProd.id, {
          stock_toko: sisaEceran,
          cost_price: modalPerBks
        });
      }

      // 3. Simpan log repack
      const logPayload = {
        karung_opened: kQty,
        pack_produced: bQty,
        packaging_cost: costPlastik,
        shrinkage_kg: susutKg,
        shrinkage_percent: shrinkagePercent,
        new_unit_cost: modalPerBks,
        created_at: new Date().toISOString()
      };

      if (isCloudActive && supabaseClient) {
        try {
          await supabaseClient.from('repack_logs').insert([logPayload]);
        } catch (e) {
          console.warn("Gagal simpan repack log ke Supabase:", e);
        }
      }

      const localRepack = getLocal('toko_repack_logs', []);
      localRepack.unshift({ ...logPayload, id: `repack-${Date.now()}` });
      setLocal('toko_repack_logs', localRepack);

      // 4. Catat biaya plastik di pengeluaran kas
      if (costPlastik > 0) {
        await this.logCashMovement({
          movement_type: 'keluar',
          wallet_source: 'laci_kasir',
          category: 'beban_usaha',
          amount: costPlastik,
          notes: `Biaya plastik pembungkus buka ${kQty} karung garam`
        });
      }

      notifyChange('products');
      return { success: true, modalPerBks, susutKg, shrinkagePercent };
    },

    // --------------------------------------------------------------------------
    // 6. STOK MASUK (KULAKAN SUPPLIER / GROSIR)
    // --------------------------------------------------------------------------
    async processStokMasuk(source, location, items, totalCost, notes = '') {
      let src = source || 'Supplier Toko';
      let loc = location || 'toko';
      let itms = items || [];
      let tot = totalCost || 0;
      let nts = notes || '';

      if (typeof source === 'object' && source !== null && !Array.isArray(source)) {
        src = source.source || source.supplier_name || 'Supplier Toko';
        loc = source.location || (typeof location === 'string' ? location : 'toko');
        itms = Array.isArray(location) ? location : (source.items || items || []);
        tot = source.totalCost || source.grandTotal || totalCost || 0;
        nts = source.notes || notes || '';
      }

      const allProds = await this.getProducts();

      for (const it of itms) {
        const qty = Number(it.qty || 1);
        const buyPrice = Number(it.price || it.cost_price || 0);
        const sellPrice = Number(it.sell_price || buyPrice * 1.2);

        // Cari apakah produk sudah ada
        const match = allProds.find(p => (it.id && String(p.id) === String(it.id)) || p.name.toLowerCase() === it.name.toLowerCase());
        if (match) {
          const field = loc === 'gudang' ? 'stock_gudang' : 'stock_toko';
          const newQty = Number(match[field] || 0) + qty;
          await this.updateProduct(match.id, {
            [field]: newQty,
            cost_price: buyPrice > 0 ? buyPrice : match.cost_price,
            sell_price: sellPrice > 0 ? sellPrice : match.sell_price
          });
        } else {
          // Tambah produk baru
          await this.addProduct({
            name: it.name,
            category: it.category || 'sembako',
            unit: it.unit || 'Dus',
            stock_toko: location === 'toko' ? qty : 0,
            stock_gudang: location === 'gudang' ? qty : 0,
            cost_price: buyPrice,
            sell_price: sellPrice,
            min_stock_alert: 10
          });
        }
      }

      // Catat pengeluaran kas kulakan
      if (Number(totalCost) > 0) {
        await this.logCashMovement({
          movement_type: 'keluar',
          wallet_source: 'modal_garam',
          category: 'kulakan',
          amount: Number(totalCost),
          notes: `Kulakan stok dari ${source}: ${items.map(i => `${i.qty} ${i.name}`).join(', ')}`
        });
      }

      notifyChange('products');
      return true;
    },

    // --------------------------------------------------------------------------
    // 7. TUTUP KASIR HARIAN & REKONSILIASI
    // --------------------------------------------------------------------------
    async getDailyClosingCalculation() {
      const transactions = await this.getTransactions();
      const cashMovements = await this.getCashMovements();

      const todayStr = new Date().toISOString().split('T')[0];

      // Total penjualan tunai hari ini
      const tunaiHariIni = transactions
        .filter(t => (t.transaction_date || t.created_at || '').startsWith(todayStr) && t.payment_type === 'tunai')
        .reduce((sum, t) => sum + Number(t.paid_amount || t.total_amount || 0), 0);

      // Total penjualan transfer hari ini (masuk rekening bank, bukan laci fisik)
      const transferHariIni = transactions
        .filter(t => (t.transaction_date || t.created_at || '').startsWith(todayStr) && t.payment_type === 'transfer')
        .reduce((sum, t) => sum + Number(t.total_amount || t.paid_amount || 0), 0);

      // Total DP bon hari ini
      const dpBonHariIni = transactions
        .filter(t => (t.transaction_date || t.created_at || '').startsWith(todayStr) && t.payment_type === 'bon')
        .reduce((sum, t) => sum + Number(t.paid_amount || 0), 0);

      // Pelunasan bon tunai masuk hari ini
      const bonPelunasanHariIni = cashMovements
        .filter(c => (c.created_at || '').startsWith(todayStr) && c.category === 'pelunasan_bon' && c.wallet_source === 'laci_kasir')
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);

      // Pengeluaran tunai laci hari ini (beban, prive, kulakan laci)
      const pengeluaranTunaiHariIni = cashMovements
        .filter(c => (c.created_at || '').startsWith(todayStr) && c.movement_type === 'keluar' && c.wallet_source === 'laci_kasir')
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);

      // Modal awal laci (default 500.000 jika belum ada catatan)
      const modalAwal = 500000;
      const sistemCash = modalAwal + tunaiHariIni + dpBonHariIni + bonPelunasanHariIni - pengeluaranTunaiHariIni;

      return {
        modalAwal,
        tunaiHariIni,
        transferHariIni,
        dpBonHariIni,
        bonPelunasanHariIni,
        pengeluaranTunaiHariIni,
        sistemCash: Math.max(0, sistemCash)
      };
    },

    async saveDailyClosing(closingData) {
      const payload = {
        closing_date: new Date().toISOString().split('T')[0],
        system_cash: Number(closingData.system_cash || 0),
        physical_cash: Number(closingData.physical_cash || 0),
        difference: Number(closingData.difference || 0),
        notes: closingData.notes || '',
        closed_by: localStorage.getItem('toko_role') || 'pemilik',
        closed_at: new Date().toISOString()
      };

      if (isCloudActive && supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('daily_closing').insert([payload]).select().single();
          if (!error && data) return data;
        } catch (e) {
          console.warn("Gagal simpan closing Supabase:", e);
        }
      }

      const list = getLocal('toko_daily_closing', []);
      list.unshift({ ...payload, id: `close-${Date.now()}` });
      setLocal('toko_daily_closing', list);
      return payload;
    },

    // --------------------------------------------------------------------------
    // 8. METRIK KEUANGAN & RINGKASAN DASHBOARD
    // --------------------------------------------------------------------------
    async getTodayFinancialSummary() {
      const todayStr = new Date().toISOString().split('T')[0];
      const transactions = await this.getTransactions();
      const cashMovements = await this.getCashMovements();
      const debts = await this.getCustomerDebts();

      // Transaksi hari ini
      const trxToday = transactions.filter(t => (t.transaction_date || t.created_at || '').startsWith(todayStr));
      const omzetHariIni = trxToday.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      const trxCount = trxToday.length;

      // Estimasi HPP modal penjualan hari ini
      let hppHariIni = 0;
      trxToday.forEach(t => {
        if (t.items && Array.isArray(t.items)) {
          t.items.forEach(it => {
            hppHariIni += Number(it.qty || 1) * Number(it.cost_price || 0);
          });
        } else {
          hppHariIni += Number(t.total_amount || 0) * 0.80; // default 80% jika tanpa snapshot
        }
      });

      // Laba kotor
      const labaKotor = Math.max(0, omzetHariIni - hppHariIni);

      // Beban operasional hari ini
      const bebanHariIni = cashMovements
        .filter(c => (c.created_at || '').startsWith(todayStr) && c.movement_type === 'keluar' && (c.category === 'beban_usaha' || c.category === 'gaji_staf'))
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);

      // Prive (pribadi) hari ini
      const priveHariIni = cashMovements
        .filter(c => (c.created_at || '').startsWith(todayStr) && c.movement_type === 'keluar' && c.category === 'prive')
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);

      // Laba bersih hari ini (Laba kotor - Beban usaha)
      const labaBersih = Math.max(0, labaKotor - bebanHariIni);

      // Total bon / piutang yang belum lunas
      const totalBonBelumLunas = debts
        .filter(d => (d.status === 'belum_lunas' || d.remaining_debt > 0))
        .reduce((sum, d) => sum + Number(d.remaining_debt || 0), 0);

      // Hitung posisi fisik uang di laci kasir saat ini
      const closingCalc = await this.getDailyClosingCalculation();

      return {
        omzet: omzetHariIni,
        trxCount: trxCount,
        hpp: hppHariIni,
        labaKotor: labaKotor,
        beban: bebanHariIni,
        prive: priveHariIni,
        labaBersih: labaBersih,
        marginPersen: omzetHariIni > 0 ? ((labaBersih / omzetHariIni) * 100).toFixed(1) : '0.0',
        laciKasir: closingCalc.sistemCash,
        totalBon: totalBonBelumLunas
      };
    }
  };

  // ============================================================================
  // MODAL PENGATURAN KONEKSI DATABASE (SUPABASE SETTINGS MODAL)
  // ============================================================================
  window.bukaPengaturanDatabase = function() {
    const curUrl = localStorage.getItem('supabase_url') || '';
    const curKey = localStorage.getItem('supabase_anon_key') || '';

    const modalHtml = `
      <div id="modalSupabaseConfig" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold shadow-sm">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-base">Koneksi Database Cloud (Supabase)</h3>
                <p class="text-xs text-slate-500">Sinkronisasi Real-Time Toko Berkah Garam</p>
              </div>
            </div>
            <button onclick="document.getElementById('modalSupabaseConfig').remove()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Project URL Supabase:</label>
              <input type="text" id="cfgSupabaseUrl" value="${curUrl}" placeholder="https://xxxxxxxx.supabase.co" class="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Project Anon Key (Public Key):</label>
              <textarea id="cfgSupabaseKey" rows="3" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." class="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500">${curKey}</textarea>
            </div>

            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <i class="fa-solid fa-circle-info text-emerald-600"></i> Cara Mendapatkan Kunci:
              </div>
              <ol class="list-decimal list-inside space-y-0.5 text-slate-600">
                <li>Buka dashboard gratis di <b>supabase.com</b></li>
                <li>Pilih proyek Toko Anda &gt; menu <b>Project Settings</b> &gt; <b>API</b></li>
                <li>Salin <b>Project URL</b> dan <b>anon public key</b> ke form di atas.</li>
              </ol>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2">
            <button onclick="simpanKonfigurasiSupabase(true)" class="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50">
              Gunakan Offline Saja
            </button>
            <button onclick="simpanKonfigurasiSupabase(false)" class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30">
              Simpan & Hubungkan
            </button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('modalSupabaseConfig');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  window.simpanKonfigurasiSupabase = function(resetOffline) {
    if (resetOffline) {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      supabaseClient = null;
      isCloudActive = false;
      updateDbStatusIndicator(false);
      const modal = document.getElementById('modalSupabaseConfig');
      if (modal) modal.remove();
      if (window.showAppModal) {
        showAppModal("Kembali ke mode penyimpanan lokal (offline). Data tersimpan aman di browser perangkat ini.", {
          judul: "Mode Lokal Aktif",
          tipe: "info"
        });
      }
      return;
    }

    const url = document.getElementById('cfgSupabaseUrl').value.trim();
    const key = document.getElementById('cfgSupabaseKey').value.trim();

    if (!url || !key) {
      if (window.showAppModal) {
        showAppModal("Harap masukkan URL dan Anon Key Supabase yang lengkap.", { judul: "Form Belum Lengkap", tipe: "warning" });
      }
      return;
    }

    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);

    initSupabase();

    const modal = document.getElementById('modalSupabaseConfig');
    if (modal) modal.remove();

    if (window.showAppModal) {
      showAppModal("Pengaturan koneksi Supabase berhasil disimpan!\nAplikasi sekarang tersinkronisasi otomatis dengan database cloud.", {
        judul: "Koneksi Berhasil",
        tipe: "sukses",
        onTutup: () => window.location.reload()
      });
    }
  };

  // Jalankan inisialisasi saat script dimuat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
  } else {
    initSupabase();
  }

  // Dengarkan storage event untuk tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('toko_')) {
      notifyChange('storage');
    }
  });

  // Ekspor API Global
  window.DB = DB;
  window.initSupabase = initSupabase;
})();
