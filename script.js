// =============================================
// TECH COMMUNITY - Core Application Logic
// =============================================

// --- DATA STORE (simulasi database dengan array) ---
const memberStore = {
  members: [
    { id: 1, nama: "Andi Pratama",    email: "andi@mail.com",   bidang: "Web Development" },
    { id: 2, nama: "Siti Rahayu",     email: "siti@mail.com",   bidang: "Data Science" },
    { id: 3, nama: "Budi Santoso",    email: "budi@mail.com",   bidang: "Mobile Development" },
    { id: 4, nama: "Dewi Lestari",    email: "dewi@mail.com",   bidang: "UI/UX Design" },
    { id: 5, nama: "Rizky Hamdani",   email: "rizky@mail.com",  bidang: "Cybersecurity" },
  ],

  // Tambah anggota baru
  add(member) {
    const newMember = {
      id: this.members.length + 1,
      ...member,
    };
    this.members.push(newMember);
    this._persist();
    return newMember;
  },

  // Ambil semua anggota
  getAll() {
    return [...this.members];
  },

  // Simpan ke sessionStorage agar data bertahan antar halaman
  _persist() {
    try {
      sessionStorage.setItem("tc_members", JSON.stringify(this.members));
    } catch (_) {}
  },

  // Muat dari sessionStorage saat halaman dibuka
  _load() {
    try {
      const saved = sessionStorage.getItem("tc_members");
      if (saved) this.members = JSON.parse(saved);
    } catch (_) {}
  },
};

// Muat data tersimpan saat script dijalankan
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
    .map(
      (m) => `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.nama)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td><span class="badge">${escapeHtml(m.bidang)}</span></td>
      </tr>`
    )
    .join("");

  // Update counter
  const counter = document.getElementById("member-count");
  if (counter) counter.textContent = members.length;
}

// =============================================
// HALAMAN FORM — validasi & submit
// =============================================
function initForm() {
  const form = document.getElementById("member-form");
  if (!form) return;

  const resultBox = document.getElementById("form-result");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nama  = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const bidang = document.getElementById("bidang").value;

    // --- Validasi manual ---
    const errors = validateForm({ nama, email, bidang });
    if (errors.length > 0) {
      showFormError(errors.join("\n"));
      return;
    }

    // --- Simpan ke store ---
    const newMember = memberStore.add({ nama, email, bidang });

    // --- Tampilkan hasil di bawah form ---
    showFormSuccess(newMember, resultBox);

    // --- Reset form ---
    form.reset();
    clearFieldErrors();
  });

  // Real-time validation feedback per field
  attachRealTimeValidation();
}

function validateForm({ nama, email, bidang }) {
  const errors = [];
  if (!nama || nama.length < 3)          errors.push("Nama harus minimal 3 karakter.");
  if (!isValidEmail(email))              errors.push("Format email tidak valid.");
  if (!bidang)                            errors.push("Bidang minat harus dipilih.");
  return errors;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormSuccess(member, resultBox) {
  if (!resultBox) return;
  resultBox.className = "result-box success";
  resultBox.innerHTML = `
    <strong>✅ Pendaftaran Berhasil!</strong>
    <ul>
      <li><b>ID Anggota</b> : #${member.id}</li>
      <li><b>Nama</b>       : ${escapeHtml(member.nama)}</li>
      <li><b>Email</b>      : ${escapeHtml(member.email)}</li>
      <li><b>Bidang</b>     : ${escapeHtml(member.bidang)}</li>
    </ul>
    <p>Data kamu sudah tersimpan! <a href="./index.html">Lihat daftar anggota →</a></p>
  `;
  resultBox.style.display = "block";
  resultBox.scrollIntoView({ behavior: "smooth" });
}

function showFormError(message) {
  alert("⚠️ " + message);
}

function attachRealTimeValidation() {
  const fields = ["nama", "email", "bidang"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("blur", () => validateField(id, el.value));
    el.addEventListener("input", () => clearFieldError(id));
  });
}

function validateField(id, value) {
  let msg = "";
  if (id === "nama"  && value.trim().length < 3) msg = "Minimal 3 karakter.";
  if (id === "email" && !isValidEmail(value.trim())) msg = "Format email tidak valid.";
  if (id === "bidang" && !value) msg = "Pilih bidang minat.";
  if (msg) setFieldError(id, msg);
}

function setFieldError(id, msg) {
  let errEl = document.getElementById(`${id}-error`);
  if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; }
  const field = document.getElementById(id);
  if (field) field.classList.add("field-error");
}

function clearFieldError(id) {
  let errEl = document.getElementById(`${id}-error`);
  if (errEl) { errEl.textContent = ""; errEl.style.display = "none"; }
  const field = document.getElementById(id);
  if (field) field.classList.remove("field-error");
}

function clearFieldErrors() {
  ["nama", "email", "bidang"].forEach(clearFieldError);
}

// =============================================
// HALAMAN MULTIMEDIA — interaksi audio & gambar
// =============================================
const gallery = {
  images: [
    { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800", alt: "Tim menggunakan laptop bersama" },
    { src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800", alt: "Coding di layar" },
    { src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800", alt: "Workshop komunitas teknologi" },
    { src: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800", alt: "Pertemuan komunitas" },
  ],
  currentIndex: 0,

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this._render();
  },

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this._render();
  },

  _render() {
    const img = document.getElementById("gallery-img");
    const caption = document.getElementById("img-caption");
    const counter = document.getElementById("img-counter");
    if (!img) return;
    const current = this.images[this.currentIndex];
    img.classList.add("fade-out");
    setTimeout(() => {
      img.src = current.src;
      img.alt = current.alt;
      if (caption) caption.textContent = current.alt;
      if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
      img.classList.remove("fade-out");
    }, 200);
  },

  showInfo() {
    const current = this.images[this.currentIndex];
    alert(`🖼️ Gambar ${this.currentIndex + 1} dari ${this.images.length}\n"${current.alt}"`);
  },
};

function initMultimedia() {
  const audioEl = document.getElementById("community-audio");
  const playBtn  = document.getElementById("btn-play");
  const stopBtn  = document.getElementById("btn-stop");
  const statusEl = document.getElementById("audio-status");

  // Inisialisasi gallery gambar
  gallery._render();

  // Tombol navigasi gambar
  document.getElementById("btn-prev")?.addEventListener("click", () => gallery.prev());
  document.getElementById("btn-next")?.addEventListener("click", () => gallery.next());
  document.getElementById("btn-info")?.addEventListener("click", () => gallery.showInfo());

  // Kontrol audio
  if (!audioEl) return;

  playBtn?.addEventListener("click", () => {
    audioEl.play();
    if (statusEl) statusEl.textContent = "▶ Sedang diputar...";
  });

  stopBtn?.addEventListener("click", () => {
    audioEl.pause();
    audioEl.currentTime = 0;
    if (statusEl) statusEl.textContent = "⏹ Audio dihentikan.";
  });

  audioEl.addEventListener("ended", () => {
    if (statusEl) statusEl.textContent = "✅ Audio selesai diputar.";
  });
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

  // Tandai nav link aktif
  highlightActiveNav();
});

function highlightActiveNav() {
  const links = document.querySelectorAll("nav a");
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}