// =============================================
// APP.JS — TECH COMMUNITY SHARED LOGIC
// Semua halaman pakai file ini untuk data bersama
// =============================================

// ─────────────────────────────────────────────
// DATA STORE (localStorage agar persist antar tab/halaman)
// ─────────────────────────────────────────────
const MemberStore = (() => {
  const KEY = 'tc_members';

  const defaults = [
    { id: 1, nama: 'Admaja Bahari',  email: 'admaja@mail.com',  bidang: 'Web Development'  },
    { id: 2, nama: 'Peter Parker',  email: 'peter@mail.com',   bidang: 'Mobile Development'},
    { id: 3, nama: 'Bruce Wayne',     email: 'bruce@mail.com',    bidang: 'UI/UX Design'   },
  ];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    // Belum ada data — isi default lalu simpan
    save(defaults);
    return [...defaults];
  }

  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (_) {}
  }

  function getAll() { return load(); }

  function add(member) {
    const arr = load();
    const maxId = arr.length ? Math.max(...arr.map(m => m.id)) : 0;
    const newMember = { id: maxId + 1, ...member, timestamp: new Date().toISOString() };
    arr.unshift(newMember);
    save(arr);
    return newMember;
  }

  function remove(id) {
    const arr = load().filter(m => m.id !== id);
    save(arr);
  }

  function count() { return load().length; }

  return { getAll, add, remove, count };
})();


// ─────────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────────
function showNotification(message, type = 'success') {
  document.querySelectorAll('.tc-notification').forEach(n => n.remove());

  const n = document.createElement('div');
  n.className = `tc-notification tc-notification--${type}`;
  n.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">×</button>`;
  n.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:9999;
    padding:14px 20px;border-radius:10px;font-weight:600;
    display:flex;align-items:center;gap:12px;
    box-shadow:0 4px 20px rgba(0,0,0,0.3);
    animation:slideIn .3s ease;
    background:${type==='success'?'#22c55e':type==='error'?'#ef4444':'#3b82f6'};
    color:#fff;max-width:360px;
  `;
  n.querySelector('button').style.cssText = 'background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;padding:0;line-height:1;';

  const style = document.getElementById('tc-anim');
  if (!style) {
    const s = document.createElement('style');
    s.id = 'tc-anim';
    s.textContent = '@keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(s);
  }

  document.body.appendChild(n);
  setTimeout(() => { if (n.parentNode) n.remove(); }, 4500);
}


// ─────────────────────────────────────────────
// ESCAPE HELPER
// ─────────────────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}


// ─────────────────────────────────────────────
// HALAMAN HOME — tabel anggota + pagination
// ─────────────────────────────────────────────
const ROWS_PER_PAGE = 5;
let currentPage = 1;

function initHome() {
  renderMemberTable();

  // Hapus baris
  const tbody = document.getElementById('member-tbody');
  if (tbody) {
    tbody.addEventListener('click', e => {
      const btn = e.target.closest('[data-delete]');
      if (!btn) return;
      const id   = parseInt(btn.dataset.delete, 10);
      const name = btn.dataset.name || 'anggota';
      if (confirm(`Hapus ${name} dari daftar?`)) {
        MemberStore.remove(id);
        showNotification(`${name} berhasil dihapus.`, 'success');
        renderMemberTable();
      }
    });
  }

  // Pagination prev/next
  const prevBtn = document.getElementById('page-prev');
  const nextBtn = document.getElementById('page-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderMemberTable(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const total = Math.ceil(MemberStore.count() / ROWS_PER_PAGE);
    if (currentPage < total) { currentPage++; renderMemberTable(); }
  });

  // Klik angka halaman
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      renderMemberTable();
    });
  });
}

function renderMemberTable() {
  const tbody = document.getElementById('member-tbody');
  if (!tbody) return;

  const all     = MemberStore.getAll();
  const total   = Math.ceil(all.length / ROWS_PER_PAGE) || 1;
  if (currentPage > total) currentPage = total;

  // Counter — format 2 digit minimum
  const counter = document.getElementById('member-count');
  if (counter) counter.textContent = String(all.length).padStart(2, '0');

  if (all.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#888;">
      Belum ada anggota. <a href="form.html" style="color:#111;font-weight:700;">Daftar sekarang!</a></td></tr>`;
    return;
  }

  // Slice halaman
  const start   = (currentPage - 1) * ROWS_PER_PAGE;
  const members = all.slice(start, start + ROWS_PER_PAGE);

  tbody.innerHTML = members.map((m, i) => `
    <tr>
      <td>${start + i + 1}.</td>
      <td>${esc(m.nama)}</td>
      <td>${esc(m.email)}</td>
      <td><span class="badge">${esc(m.bidang)}</span></td>
      <td>
        <button data-delete="${m.id}" data-name="${esc(m.nama)}"
          style="background:#111;color:#fff;border:none;padding:5px 14px;
                 border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:700;
                 transition:background 0.15s;" onmouseover="this.style.background='#444'"
                 onmouseout="this.style.background='#111'">
          Hapus
        </button>
      </td>
    </tr>`).join('');

  // Update active page button
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.page, 10) === currentPage);
  });
}


// ─────────────────────────────────────────────
// HALAMAN FORM — pendaftaran anggota
// ─────────────────────────────────────────────
function initForm() {
  const form = document.getElementById('member-form');
  if (!form) return;

  // Real-time validasi
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => validateField(input));
  });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();

    const nama   = form.querySelector('[name="nama"]')?.value.trim()   || '';
    const email  = form.querySelector('[name="email"]')?.value.trim()  || '';
    const bidang = form.querySelector('[name="bidang"]')?.value        || '';

    // Validasi
    let ok = true;
    if (!nama)   { setError('nama',  'Nama tidak boleh kosong'); ok = false; }
    else            clearError('nama');

    if (!email)  { setError('email', 'Email tidak boleh kosong'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'Format email tidak valid'); ok = false;
    } else clearError('email');

    if (!bidang) { setError('bidang', 'Pilih bidang minat'); ok = false; }
    else            clearError('bidang');

    if (!ok) { showNotification('Mohon lengkapi semua field dengan benar!', 'error'); return; }

    // Simpan ke localStorage (dibaca halaman lain)
    MemberStore.add({ nama, email, bidang });
    showNotification(`Selamat datang, ${nama}! Pendaftaran berhasil 🎉`, 'success');

    form.reset();
    form.querySelectorAll('.field-error-message').forEach(el => el.textContent = '');
    form.querySelectorAll('input, select').forEach(el => el.classList.remove('valid','error'));

    // Redirect ke home setelah 2 detik
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  });

  // Reset button
  const resetBtn = form.querySelector('[type="reset"], .btn-outline');
  if (resetBtn) {
    resetBtn.addEventListener('click', e => {
      // biarkan default reset, lalu bersihkan error
      setTimeout(() => {
        form.querySelectorAll('.field-error-message').forEach(el => el.textContent = '');
        form.querySelectorAll('input, select').forEach(el => el.classList.remove('valid','error'));
        showNotification('Form telah direset.', 'info');
      }, 0);
    });
  }
}

function validateField(input) {
  const name  = input.name;
  const value = input.value.trim();
  if (!value) { setError(name, `${labelFor(name)} tidak boleh kosong`); return false; }
  if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setError(name, 'Format email tidak valid'); return false;
  }
  clearError(name);
  input.classList.remove('error'); input.classList.add('valid');
  return true;
}

function labelFor(name) {
  return { nama: 'Nama', email: 'Email', bidang: 'Bidang minat' }[name] || name;
}

function setError(name, msg) {
  const el = document.getElementById(`${name}-error`);
  if (el) el.textContent = msg;
  const input = document.querySelector(`[name="${name}"]`);
  if (input) { input.classList.remove('valid'); input.classList.add('error'); }
}

function clearError(name) {
  const el = document.getElementById(`${name}-error`);
  if (el) el.textContent = '';
  const input = document.querySelector(`[name="${name}"]`);
  if (input) { input.classList.remove('error'); input.classList.add('valid'); }
}


// ─────────────────────────────────────────────
// HALAMAN GALLERY — menampilkan member count
// ─────────────────────────────────────────────
function initGallery() {
  // Tampilkan jumlah anggota di gallery jika ada elemennya
  const memberCountEl = document.getElementById('gallery-member-count');
  if (memberCountEl) memberCountEl.textContent = MemberStore.count();

  // Tampilkan daftar member terbaru (opsional widget)
  const memberListEl = document.getElementById('gallery-member-list');
  if (memberListEl) {
    const members = MemberStore.getAll().slice(0, 5);
    memberListEl.innerHTML = members.map(m => `
      <div class="gallery-member-item" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);
                    display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;">
          ${esc(m.nama.charAt(0).toUpperCase())}
        </div>
        <div>
          <div style="font-weight:600;font-size:0.9rem;">${esc(m.nama)}</div>
          <div style="font-size:0.75rem;opacity:0.7;">${esc(m.bidang)}</div>
        </div>
      </div>`).join('');
  }
}


// ─────────────────────────────────────────────
// NAVIGASI AKTIF
// ─────────────────────────────────────────────
function highlightNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    a.classList.toggle('active', href === page);
  });
}


// ─────────────────────────────────────────────
// DARK MODE (shared)
// ─────────────────────────────────────────────
function initDarkMode() {
  const toggle = document.querySelector('.dark-toggle, #darkToggle');
  if (!toggle) return;

  // Pulihkan preferensi
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark');
  }

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);

    // Animasi knob (form page)
    const knob = toggle.querySelector('.toggle-knob, #darkToggleThumb');
    if (knob) knob.style.transform = isDark ? 'translateX(2.25rem)' : 'translateX(0.25rem)';
  });
}


// ─────────────────────────────────────────────
// MOBILE MENU (shared)
// ─────────────────────────────────────────────
function initMobileMenu() {
  const btn   = document.getElementById('mobileMenuBtn');
  const menu  = document.getElementById('mobileMenu');
  const close = document.getElementById('closeMobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.remove('opacity-0','invisible');
    menu.classList.add('opacity-100','visible');
  });
  if (close) close.addEventListener('click', () => {
    menu.classList.add('opacity-0','invisible');
    menu.classList.remove('opacity-100','visible');
  });
}


// ─────────────────────────────────────────────
// ROUTER UTAMA
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  highlightNav();
  initDarkMode();
  initMobileMenu();

  if (page === 'home')      initHome();
  if (page === 'form')      initForm();
  if (page === 'gallery')   initGallery();
});

// Expose global untuk keperluan debug / cross-script
window.TechCommunity = { MemberStore, showNotification, renderMemberTable };
