// =============================================
// TECH COMMUNITY - Core Application Logic
// =============================================

// --- DATA STORE (simulasi database dengan array) ---
const memberStore = {
  members: [
    { id: 1, nama: "Admaja Bahaei",    email: "admaja@mail.com",   bidang: "Web Development" },
  ],

  add(member) {
    const newMember = { id: this.members.length + 1, ...member };
    this.members.push(newMember);
    this._persist();
    return newMember;
  },

  getAll() { return [...this.members]; },

  _persist() {
    try { sessionStorage.setItem("tc_members", JSON.stringify(this.members)); } catch (_) {}
  },

  _load() {
    try {
      const saved = sessionStorage.getItem("tc_members");
      if (saved) this.members = JSON.parse(saved);
    } catch (_) {}
  },
};

memberStore._load();

// =============================================
// HALAMAN UTAMA — render tabel anggota
// =============================================
function renderMemberTable() {
  const tbody = document.getElementById("member-tbody");
  if (!tbody) return;

  const members = memberStore.getAll();

  if (members.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-row">Belum ada anggota. <a href="./form.html">Daftar sekarang!</a></td>
      </tr>`;
    return;
  }

  tbody.innerHTML = members
    .map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.nama)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td><span class="badge">${escapeHtml(m.bidang)}</span></td>
      </tr>`)
    .join("");

  const counter = document.getElementById("member-count");
  if (counter) counter.textContent = members.length;
}

// =============================================
// UTILITY
// =============================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =============================================
// ROUTER — inisialisasi sesuai halaman aktif
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "home")       renderMemberTable();
  if (page === "form")       initForm();
  if (page === "multimedia") initMultimedia();

  highlightActiveNav();
});

function highlightActiveNav() {
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}