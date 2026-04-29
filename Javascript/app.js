// =============================================
// APP.JS — TECH COMMUNITY SHARED LOGIC
// =============================================

// ─────────────────────────────────────────────
// DATA STORE
// ─────────────────────────────────────────────
const MemberStore = (() => {
  const KEY = 'tc_members';

  const defaults = [
    { id: 1, nama: 'Admaja Bahari', email: 'admaja@mail.com',  bidang: 'Web Development'   },
    { id: 2, nama: 'Peter Parker',  email: 'peter@mail.com',   bidang: 'Mobile Development' },
    { id: 3, nama: 'Bruce Wayne',   email: 'bruce@mail.com',   bidang: 'UI/UX Design'       },
  ];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    save(defaults);
    return [...defaults];
  }

  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (_) {}
  }

  function getAll() { return load(); }

  function add(member) {
    const arr   = load();
    const maxId = arr.length ? Math.max(...arr.map(m => m.id)) : 0;
    const nm    = { id: maxId + 1, ...member, timestamp: new Date().toISOString() };
    arr.unshift(nm);
    save(arr);
    return nm;
  }

  // FIX: filter by numeric id, pastikan id match persis
  function remove(id) {
    const numId = Number(id);
    const arr   = load().filter(m => Number(m.id) !== numId);
    save(arr);
  }

  function count() { return load().length; }

  return { getAll, add, remove, count };
})();


// ─────────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────────
function showNotification(message, type = 'success') {
  document.querySelectorAll('.tc-notif').forEach(n => n.remove());

  // Inject keyframe sekali saja
  if (!document.getElementById('tc-anim-style')) {
    const s = document.createElement('style');
    s.id = 'tc-anim-style';
    s.textContent = `
      @keyframes tcSlideIn { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes tcSlideOut{ from{transform:translateX(0);opacity:1} to{transform:translateX(110%);opacity:0} }
    `;
    document.head.appendChild(s);
  }

  const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' };
  const n = document.createElement('div');
  n.className = 'tc-notif';
  n.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:99999;
    padding:14px 18px;border-radius:12px;font-weight:600;font-size:0.9rem;
    display:flex;align-items:center;gap:12px;max-width:340px;
    box-shadow:0 6px 24px rgba(0,0,0,0.25);
    background:${colors[type]||colors.info};color:#fff;
    animation:tcSlideIn .3s ease forwards;
    font-family:'Space Grotesk',sans-serif;
  `;
  n.innerHTML = `<span style="flex:1;">${message}</span>
    <button style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;line-height:1;padding:0;" onclick="this.closest('.tc-notif').remove()">×</button>`;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'tcSlideOut .3s ease forwards';
    setTimeout(() => n.remove(), 300);
  }, 4200);
}


// ─────────────────────────────────────────────
// ESCAPE HTML
// ─────────────────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}


// ─────────────────────────────────────────────
// HALAMAN HOME — tabel + pagination
// ─────────────────────────────────────────────
const ROWS_PER_PAGE = 5;
let currentPage = 1;

function initHome() {
  renderMemberTable();

  // FIX BUG HAPUS: listener HANYA di tbody, SEKALI SAJA, pakai event delegation
  // Tidak perlu re-attach saat renderMemberTable() dipanggil ulang
  const tbody = document.getElementById('member-tbody');
  if (tbody) {
    tbody.addEventListener('click', function handleDelete(e) {
      const btn = e.target.closest('[data-delete-id]');
      if (!btn) return;

      // Ambil id dari attribute khusus data-delete-id (bukan data-delete agar tidak konflik)
      const id   = Number(btn.getAttribute('data-delete-id'));
      const nama = btn.getAttribute('data-delete-name') || 'anggota';

      if (!id || isNaN(id)) return; // guard: jangan hapus kalau id tidak valid

      if (confirm(`Yakin hapus "${nama}" dari daftar?`)) {
        MemberStore.remove(id);
        showNotification(`"${nama}" berhasil dihapus.`, 'success');
        renderMemberTable(); // re-render tabel saja, listener tidak ditambah lagi
      }
    });
  }

  // Pagination
  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderMemberTable(); }
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    const total = Math.ceil(MemberStore.count() / ROWS_PER_PAGE);
    if (currentPage < total) { currentPage++; renderMemberTable(); }
  });

  // Tombol angka halaman (1, 2, dst) — pakai delegation di parent
  const paginationEl = document.querySelector('.pagination');
  if (paginationEl) {
    paginationEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-page-num]');
      if (!btn) return;
      currentPage = parseInt(btn.getAttribute('data-page-num'), 10);
      renderMemberTable();
    });
  }
}

function renderMemberTable() {
  const tbody = document.getElementById('member-tbody');
  if (!tbody) return;

  const all   = MemberStore.getAll();
  const total = Math.ceil(all.length / ROWS_PER_PAGE) || 1;
  if (currentPage > total) currentPage = total;

  // Update stat counter
  const counter = document.getElementById('member-count');
  if (counter) counter.textContent = String(all.length).padStart(2, '0');

  // Tabel kosong
  if (all.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#888;">
      Belum ada anggota. <a href="form.html" style="color:#111;font-weight:700;">Daftar sekarang!</a>
    </td></tr>`;
    updatePaginationUI(0, 0);
    return;
  }

  // Slice data sesuai halaman
  const start   = (currentPage - 1) * ROWS_PER_PAGE;
  const members = all.slice(start, start + ROWS_PER_PAGE);

  // Render baris — gunakan data-delete-id & data-delete-name (plain string, tidak di-escape ke HTML entity)
  tbody.innerHTML = members.map((m, i) => {
    const safeNama  = esc(m.nama);
    const safeEmail = esc(m.email);
    const safeBidang= esc(m.bidang);
    // data attribute: gunakan JSON-safe string (tidak encode sebagai HTML entity)
    return `<tr>
      <td>${start + i + 1}.</td>
      <td>${safeNama}</td>
      <td>${safeEmail}</td>
      <td><span class="badge">${safeBidang}</span></td>
      <td>
        <button
          data-delete-id="${m.id}"
          data-delete-name="${safeNama}"
          class="btn-hapus"
          style="background:#111;color:#fff;border:none;padding:5px 14px;
                 border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:700;">
          Hapus
        </button>
      </td>
    </tr>`;
  }).join('');

  updatePaginationUI(currentPage, total);
}

function updatePaginationUI(activePage, totalPages) {
  // Update highlight tombol angka
  document.querySelectorAll('[data-page-num]').forEach(btn => {
    const n = parseInt(btn.getAttribute('data-page-num'), 10);
    btn.classList.toggle('active', n === activePage);
  });
}


// ─────────────────────────────────────────────
// HALAMAN FORM
// ─────────────────────────────────────────────
function initForm() {
  const form = document.getElementById('member-form');
  if (!form) return;

  // Real-time validasi input
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => validateField(input));
  });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nama   = (form.querySelector('[name="nama"]')?.value   || '').trim();
    const email  = (form.querySelector('[name="email"]')?.value  || '').trim();
    const bidang = (form.querySelector('[name="bidang"]')?.value || '').trim();

    let ok = true;
    if (!nama)                                      { setError('nama',  'Nama tidak boleh kosong');   ok = false; } else clearError('nama');
    if (!email)                                     { setError('email', 'Email tidak boleh kosong');  ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', 'Format email tidak valid'); ok = false; }
    else                                              clearError('email');
    if (!bidang)                                    { setError('bidang','Pilih bidang minat');         ok = false; } else clearError('bidang');

    if (!ok) { showNotification('Mohon lengkapi semua field!', 'error'); return; }

    MemberStore.add({ nama, email, bidang });
    showNotification(`Selamat datang, ${nama}! 🎉`, 'success');

    form.reset();
    form.querySelectorAll('.field-error-message').forEach(el => el.textContent = '');
    form.querySelectorAll('input, select').forEach(el => el.classList.remove('valid', 'error'));

    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  });

  // Reset button — bersihkan error setelah reset
  const resetBtn = form.querySelector('[type="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      setTimeout(() => {
        form.querySelectorAll('.field-error-message').forEach(el => el.textContent = '');
        form.querySelectorAll('input, select').forEach(el => el.classList.remove('valid', 'error'));
        showNotification('Form direset.', 'info');
      }, 0);
    });
  }
}

function validateField(input) {
  const value = input.value.trim();
  if (!value) { setError(input.name, `${labelFor(input.name)} tidak boleh kosong`); return false; }
  if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setError(input.name, 'Format email tidak valid'); return false;
  }
  clearError(input.name);
  input.classList.remove('error'); input.classList.add('valid');
  return true;
}

function labelFor(name) {
  return { nama: 'Nama', email: 'Email', bidang: 'Bidang minat' }[name] || name;
}

function setError(name, msg) {
  const el = document.getElementById(`${name}-error`);
  if (el) el.textContent = msg;
  const inp = document.querySelector(`[name="${name}"]`);
  if (inp) { inp.classList.remove('valid'); inp.classList.add('error'); }
}

function clearError(name) {
  const el = document.getElementById(`${name}-error`);
  if (el) el.textContent = '';
  const inp = document.querySelector(`[name="${name}"]`);
  if (inp) { inp.classList.remove('error'); inp.classList.add('valid'); }
}


// ─────────────────────────────────────────────
// HALAMAN GALLERY
// ─────────────────────────────────────────────
function initGallery() {
  const countEl = document.getElementById('gallery-member-count');
  if (countEl) countEl.textContent = MemberStore.count();
}


// ─────────────────────────────────────────────
// DARK MODE — bekerja di semua halaman
// Strategi: toggle class 'dark-mode' di <body>
// CSS tiap halaman harus punya rule .dark-mode
// ─────────────────────────────────────────────
function initDarkMode() {
  // Cari toggle button — bisa #darkToggle atau .dark-toggle
  const toggle = document.getElementById('darkToggle') || document.querySelector('.dark-toggle');
  const knob   = document.getElementById('darkToggleThumb') || document.querySelector('.toggle-knob');
  if (!toggle) return;

  const isDark = () => localStorage.getItem('tc_dark') === '1';

  function applyDark(dark) {
    document.body.classList.toggle('dark-mode', dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('tc_dark', dark ? '1' : '0');

    // Track: 52px lebar, padding 4px kiri+kanan, knob 20px lebar
    // Gerak max = 52 - 4 - 4 - 20 = 24px
    // Pakai nilai tetap — tidak bergantung offsetWidth yang bisa 0 saat load
    if (knob) {
      knob.style.transform = dark ? 'translateX(24px)' : 'translateX(0px)';
      knob.style.background = dark ? '#ffffff' : '#cccccc';
    }
    toggle.style.background = dark ? '#4ade80' : '#555555';
  }

  // Terapkan saat load
  applyDark(isDark());

  // Toggle saat klik
  toggle.addEventListener('click', () => applyDark(!isDark()));
}


// ─────────────────────────────────────────────
// HAMBURGER MENU — bekerja di semua halaman
// Tidak bergantung pada class Tailwind
// ─────────────────────────────────────────────
function initMobileMenu() {
  const btn   = document.getElementById('mobileMenuBtn');
  const menu  = document.getElementById('mobileMenu');
  const close = document.getElementById('closeMobileMenu');
  if (!btn || !menu) return;

  // Pastikan menu punya style dasar via JS (tidak bergantung Tailwind)
  Object.assign(menu.style, {
    display:    'none',
    position:   'fixed',
    inset:      '0',
    background: 'rgba(0,0,0,0.92)',
    zIndex:     '9998',
    flexDirection: 'column',
    alignItems:    'center',
    justifyContent:'center',
    gap:           '32px',
  });

  // Gaya link menu
  menu.querySelectorAll('a').forEach(a => {
    Object.assign(a.style, {
      color:      '#fff',
      fontSize:   '1.5rem',
      fontWeight: '700',
      textDecoration: 'none',
    });
  });

  function openMenu() {
    menu.style.display = 'flex';
    requestAnimationFrame(() => { menu.style.opacity = '0'; menu.style.transition = 'opacity 0.25s'; });
    requestAnimationFrame(() => requestAnimationFrame(() => { menu.style.opacity = '1'; }));
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.style.opacity = '0';
    setTimeout(() => {
      menu.style.display = 'none';
      document.body.style.overflow = '';
    }, 250);
  }

  btn.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);

  // Tutup kalau klik di luar konten menu
  menu.addEventListener('click', e => {
    if (e.target === menu) closeMenu();
  });

  // Tutup dengan Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}


// ─────────────────────────────────────────────
// HIGHLIGHT NAV AKTIF
// ─────────────────────────────────────────────
function highlightNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a, .nav-pill-gallery a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    a.classList.toggle('active', href === page);
  });
}


// ─────────────────────────────────────────────
// DARK MODE CSS — inject rules untuk semua halaman
// ─────────────────────────────────────────────
function injectDarkModeCSS() {
  if (document.getElementById('tc-dark-styles')) return;
  const s = document.createElement('style');
  s.id = 'tc-dark-styles';
  s.textContent = `
    /* ── DARK MODE GLOBAL ── */
    body.dark-mode {
      background: #111 !important;
      color: #eee !important;
    }

    /* Home dark */
    body.dark-mode .hero-section,
    body.dark-mode header { background: #0a0a0a !important; }
    body.dark-mode .hero-actions,
    body.dark-mode .stats-section,
    body.dark-mode .members-section,
    body.dark-mode footer {
      background: #1a1a1a !important;
      color: #eee !important;
    }
    body.dark-mode .stat-label,
    body.dark-mode .stat-number,
    body.dark-mode .section-title-row h2 { color: #eee !important; }
    body.dark-mode .stat-card  { border-color: rgba(255,255,255,0.1) !important; }
    body.dark-mode .table-card { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.1) !important; }
    body.dark-mode thead th    { color: #aaa !important; border-color: rgba(255,255,255,0.08) !important; }
    body.dark-mode tbody td    { color: #ddd !important; border-color: rgba(255,255,255,0.06) !important; }
    body.dark-mode tbody tr:hover { background: rgba(255,255,255,0.05) !important; }
    body.dark-mode .badge      { background: rgba(255,255,255,0.1) !important; color: #fff !important; border-color: rgba(255,255,255,0.15) !important; }
    body.dark-mode .btn-outline { color: #fff !important; border-color: #fff !important; }
    body.dark-mode .btn-tambah { background: #333 !important; }
    body.dark-mode .page-btn   { background: #222 !important; color: #eee !important; border-color: rgba(255,255,255,0.15) !important; }
    body.dark-mode .page-btn.active { background: #eee !important; color: #111 !important; }

    /* Form dark */
    body.dark-mode .form-card  { background: linear-gradient(160deg,#2a2a2a,#1e1e1e) !important; }
    body.dark-mode .form-label { color: #ddd !important; }
    body.dark-mode .form-input,
    body.dark-mode .form-select { background: #333 !important; border-color: #444 !important; color: #eee !important; }
    body.dark-mode .form-left h1 { color: #eee !important; }
    body.dark-mode .form-left p  { color: #aaa !important; }
    body.dark-mode .back-btn   { background: #333 !important; }

    /* Gallery dark */
    body.dark-mode .nav-pill-gallery { background: #222 !important; }
    body.dark-mode .iphone-player    { background: linear-gradient(180deg,#444,#2a2a2a) !important; }
    body.dark-mode .section-label    { color: #888 !important; }
  `;
  document.head.appendChild(s);
}


// ─────────────────────────────────────────────
// ROUTER UTAMA
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  injectDarkModeCSS();
  highlightNav();
  initDarkMode();
  initMobileMenu();

  if (page === 'home')    initHome();
  if (page === 'form')    initForm();
  if (page === 'gallery') initGallery();
});

window.TechCommunity = { MemberStore, showNotification, renderMemberTable };
