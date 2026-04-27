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
// HALAMAN FORM — validasi & submit
// =============================================
function initForm() {
  const form = document.getElementById("member-form");
  if (!form) return;

  const resultBox = document.getElementById("form-result");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nama   = document.getElementById("nama").value.trim();
    const email  = document.getElementById("email").value.trim();
    const bidang = document.getElementById("bidang").value;

    const errors = validateForm({ nama, email, bidang });
    if (errors.length > 0) {
      showFormError(errors.join("\n"));
      return;
    }

    const newMember = memberStore.add({ nama, email, bidang });
    showFormSuccess(newMember, resultBox);
    form.reset();
    clearFieldErrors();
  });

  attachRealTimeValidation();
}

function validateForm({ nama, email, bidang }) {
  const errors = [];
  if (!nama || nama.length < 3)  errors.push("Nama harus minimal 3 karakter.");
  if (!isValidEmail(email))       errors.push("Format email tidak valid.");
  if (!bidang)                    errors.push("Bidang minat harus dipilih.");
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
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("blur",  () => validateField(id, el.value));
    el.addEventListener("input", () => clearFieldError(id));
  });
}

function validateField(id, value) {
  let msg = "";
  if (id === "nama"   && value.trim().length < 3) msg = "Minimal 3 karakter.";
  if (id === "email"  && !isValidEmail(value.trim())) msg = "Format email tidak valid.";
  if (id === "bidang" && !value) msg = "Pilih bidang minat.";
  if (msg) setFieldError(id, msg);
}

function setFieldError(id, msg) {
  const errEl = document.getElementById(`${id}-error`);
  if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; }
  const field = document.getElementById(id);
  if (field) field.classList.add("field-error");
}

function clearFieldError(id) {
  const errEl = document.getElementById(`${id}-error`);
  if (errEl) { errEl.textContent = ""; errEl.style.display = "none"; }
  const field = document.getElementById(id);
  if (field) field.classList.remove("field-error");
}

function clearFieldErrors() {
  ["nama", "email", "bidang"].forEach(clearFieldError);
}

// =============================================
// HALAMAN MULTIMEDIA — galeri & audio playlist
// =============================================
const gallery = {
  images: [
    { src: "foto/default1.png", alt: "Foto Komunitas 1" },
    { src: "foto/default2.png", alt: "Foto Komunitas 2" },
    { src: "foto/default3.png", alt: "Foto Komunitas 3" },
    { src: "foto/default4.png", alt: "Foto Komunitas 4" },
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
    const img     = document.getElementById("gallery-img");
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
  // Inisialisasi galeri
  gallery._render();
  document.getElementById("btn-prev")?.addEventListener("click", () => gallery.prev());
  document.getElementById("btn-next")?.addEventListener("click", () => gallery.next());
  document.getElementById("btn-info")?.addEventListener("click", () => gallery.showInfo());

  // Audio — custom player
  const audioEl     = document.getElementById("community-audio");
  const playBtn     = document.getElementById("btn-play-pause");
  const nextBtn     = document.getElementById("btn-next-track");
  const infoEl      = document.getElementById("audio-track-info");
  const progressFill= document.getElementById("progress-fill");
  const progressWrap= document.getElementById("progress-wrap");
  const timeCurrent = document.getElementById("time-current");
  const timeDuration= document.getElementById("time-duration");
  const volumeSlider= document.getElementById("volume-slider");

  const tracks = [
    "audio/default1.mp3","audio/default2.mp3","audio/default3.mp3",
    "audio/default4.mp3","audio/default5.mp3","audio/default6.mp3","audio/default7.mp3",
  ];
  let currentTrack = 0;

  function fmtTime(s) {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, "0");
    return `${m}:${sec}`;
  }

  function loadTrack(index, autoplay = true) {
    currentTrack = index;
    audioEl.src = tracks[currentTrack];
    audioEl.load();
    if (autoplay) audioEl.play();
    if (infoEl) infoEl.textContent = `Track ${currentTrack + 1} / ${tracks.length}`;
  }

  playBtn?.addEventListener("click", () => {
    if (audioEl.paused) { audioEl.play(); }
    else { audioEl.pause(); }
  });

  nextBtn?.addEventListener("click", () => {
    loadTrack((currentTrack + 1) % tracks.length);
  });

  audioEl?.addEventListener("play",  () => { if (playBtn) playBtn.textContent = "⏸"; });
  audioEl?.addEventListener("pause", () => { if (playBtn) playBtn.textContent = "▶"; });

  audioEl?.addEventListener("timeupdate", () => {
    const pct = audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0;
    if (progressFill) progressFill.style.width = pct + "%";
    if (timeCurrent)  timeCurrent.textContent  = fmtTime(audioEl.currentTime);
  });

  audioEl?.addEventListener("loadedmetadata", () => {
    if (timeDuration) timeDuration.textContent = fmtTime(audioEl.duration);
  });

  audioEl?.addEventListener("ended", () => {
    if (currentTrack < tracks.length - 1) loadTrack(currentTrack + 1);
    else { if (playBtn) playBtn.textContent = "▶"; }
  });

  progressWrap?.addEventListener("click", (e) => {
    const rect = progressWrap.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    if (audioEl.duration) audioEl.currentTime = pct * audioEl.duration;
  });

  volumeSlider?.addEventListener("input", () => {
    audioEl.volume = volumeSlider.value;
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