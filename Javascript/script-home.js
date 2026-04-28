// =============================================
// TECH COMMUNITY - FULL APPLICATION LOGIC
// =============================================

// --- DATA STORE (simulasi database) ---
const memberStore = {
  members: [
    { id: 1, nama: "Admaja Bahaei", email: "admaja@mail.com", bidang: "Web Development" },
    { id: 2, nama: "Rizky Pratama", email: "rizky@mail.com", bidang: "Mobile Development" },
    { id: 3, nama: "Sari Indah", email: "sari@mail.com", bidang: "UI/UX Design" }
  ],

  add(member) {
    const newMember = { 
      id: this.getNextId(), 
      ...member,
      timestamp: new Date().toISOString()
    };
    this.members.unshift(newMember); // Tambah di atas
    this._persist();
    return newMember;
  },

  getNextId() {
    return this.members.length > 0 ? Math.max(...this.members.map(m => m.id)) + 1 : 1;
  },

  getAll() { 
    return [...this.members]; 
  },

  delete(id) {
    this.members = this.members.filter(m => m.id !== id);
    this._persist();
  },

  _persist() {
    try { 
      sessionStorage.setItem("tc_members", JSON.stringify(this.members)); 
    } catch (_) {}
  },

  _load() {
    try {
      const saved = sessionStorage.getItem("tc_members");
      if (saved) {
        this.members = JSON.parse(saved);
      }
    } catch (_) {}
  }
};

// Inisialisasi data store
memberStore._load();

// =============================================
// UTILITY FUNCTIONS
// =============================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="notification-close">&times;</button>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// =============================================
// HALAMAN HOME
// =============================================
function renderMemberTable() {
  const tbody = document.getElementById("member-tbody");
  if (!tbody) return;

  const members = memberStore.getAll();

  // Update counter anggota
  const counter = document.getElementById("member-count");
  if (counter) counter.textContent = members.length;

  if (members.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-row">
          Belum ada anggota. <a href="./form.html">Daftar sekarang!</a>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = members
    .map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.nama)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>
          <span class="badge">${escapeHtml(m.bidang)}</span>
        </td>
      </tr>`)
    .join("");
}

// =============================================
// HALAMAN FORM
// =============================================
function initForm() {
  const form = document.getElementById('member-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const member = {
      nama: formData.get('nama').trim(),
      email: formData.get('email').trim(),
      bidang: formData.get('bidang')
    };

    // Validasi
    if (!member.nama || !member.email || !member.bidang) {
      showNotification('Mohon lengkapi semua field!', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(member.email)) {
      showNotification('Format email tidak valid!', 'error');
      return;
    }

    // Simpan data
    const newMember = memberStore.add(member);
    showNotification(`Selamat datang ${member.nama}!`, 'success');
    
    // Reset form
    form.reset();
    
    // Redirect ke home setelah 2 detik
    setTimeout(() => {
      window.location.href = './index.html';
    }, 2000);
  });
}

// =============================================
// HALAMAN MULTIMEDIA (GALLERY)
// =============================================
function initMultimedia() {
  // Placeholder untuk gallery functionality
  console.log('Multimedia page initialized');
  
  // Contoh: load gallery data
  const galleryContainer = document.getElementById('gallery-container');
  if (galleryContainer) {
    galleryContainer.innerHTML = `
      <div class="gallery-placeholder">
        <h3>📸 Multimedia Gallery</h3>
        <p>Coming soon...</p>
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-number">12</div>
            <div class="stat-label">Foto</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">8</div>
            <div class="stat-label">Video</div>
          </div>
        </div>
      </div>
    `;
  }
}

// =============================================
// NAVIGATION
// =============================================
function highlightActiveNav() {
  const links = document.querySelectorAll("nav a");
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add("active");
    }
  });
}

// =============================================
// MAIN ROUTER
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  
  // Route berdasarkan halaman
  switch(page) {
    case "home":
      renderMemberTable();
      break;
    
    case "form":
      initForm();
      break;
    
    case "multimedia":
      initMultimedia();
      break;
    
    default:
      console.log('Unknown page:', page);
  }

  // Selalu jalankan navigation highlight
  highlightActiveNav();
});

// =============================================
// PUBLIC API (untuk cross-page communication)
// =============================================
window.TechCommunity = {
  // Core functions
  renderMemberTable,
  initForm,
  initMultimedia,
  
  // Data store
  memberStore,
  
  // Utilities
  showNotification,
  
  // Refresh data
  refresh() {
    memberStore._load();
    if (document.body.dataset.page === 'home') {
      renderMemberTable();
    }
  }
};

// =============================================
// AUTO-REFRESH (opsional)
// =============================================
// setInterval(() => {
//   window.TechCommunity.refresh();
// }, 5000);