
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