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