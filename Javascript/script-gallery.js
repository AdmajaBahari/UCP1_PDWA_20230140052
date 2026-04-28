// ============================================
// SCRIPT-GALLERY.JS — TECH COMMUNITY MULTIMEDIA
// Tombol semua aktif, pagination video update highlight
// ============================================

// ── DATA ────────────────────────────────────
const galleryImages = [
  'foto/default1.jpg',
  'foto/default2.jpg',
  'foto/default3.jpg',
  'foto/default4.jpg'
];

const videoIds = [
  'N4PQ-vqNumc',
  'kXhtQW61c2c',
  'JCAVeRW-Q0I'
];

const audioTracks = [
  { title:'Just Keep Watching',      artist:'Tate McRae',              albumArt:'foto/Cover/1. just keep watching.jpg', url:'audio/default1.mp3' },
  { title:'Lose My Mind',            artist:'Don Toliver ft. Doja Cat', albumArt:'foto/Cover/2. lose my mind.jpg',       url:'audio/default2.mp3' },
  { title:'You Really Got Me',       artist:'The Kinks',               albumArt:'foto/Cover/3. you really got me.jpg',  url:'audio/default3.mp3' },
  { title:'Love Me Not',             artist:'Rayvn Lenae',             albumArt:'foto/Cover/4. love me not.jpg',        url:'audio/default4.mp3' },
  { title:'Bye [Altare Remix]',      artist:'Ariana Grande',           albumArt:'foto/Cover/5. bye.jpg',                url:'audio/default5.mp3' },
  { title:'Skyfall',                 artist:'Adele',                   albumArt:'foto/Cover/6. skyfall.jpg',            url:'audio/default6.mp3' },
  { title:'Smooth Operator',         artist:'Sade',                    albumArt:'foto/Cover/7. Smooth Operator.jpg',    url:'audio/default7.mp3' }
];

// ── STATE ────────────────────────────────────
let currentImageIndex = 0;
let currentVideoIndex = 0;
let currentTrackIndex = 0;
let isPlaying         = false;
let audioObj          = new Audio();
let rafId             = null;

// ── HELPERS ──────────────────────────────────
const $ = id => document.getElementById(id);

// ── IMAGE GALLERY ────────────────────────────
function updateGalleryImage() {
  const img     = $('galleryImage');
  const counter = $('imageCounter');
  if (img)     img.src = galleryImages[currentImageIndex];
  if (counter) counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
}

// ── VIDEO ────────────────────────────────────
function updateVideo() {
  const player = $('videoPlayer');
  if (!player) return;
  const id = videoIds[currentVideoIndex];
  player.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&fs=1&controls=1&autoplay=0`;
  player.title = `Tech Community Video ${currentVideoIndex + 1}`;
  updateVideoPagination();
}

function updateVideoPagination() {
  document.querySelectorAll('.video-page-btn').forEach(btn => {
    const idx = parseInt(btn.dataset.index, 10);
    const active = idx === currentVideoIndex;
    // Reset classes
    btn.className = btn.className
      .replace(/bg-yellow-400|text-black|bg-black\/70|text-white|scale-105/g, '')
      .trim();
    if (active) {
      btn.classList.add('bg-yellow-400', 'text-black', 'scale-105');
    } else {
      btn.classList.add('bg-black/70', 'text-white');
    }
  });
}

function goToVideo(idx) {
  currentVideoIndex = (idx + videoIds.length) % videoIds.length;
  updateVideo();
}

// ── AUDIO ────────────────────────────────────
function loadTrack(index, autoPlay = false) {
  currentTrackIndex = (index + audioTracks.length) % audioTracks.length;
  const track = audioTracks[currentTrackIndex];

  const titleEl  = $('trackTitle');
  const artistEl = $('trackArtist');
  const artEl    = $('albumArt');
  const durEl    = $('duration');

  if (titleEl)  titleEl.textContent  = track.title;
  if (artistEl) artistEl.textContent = track.artist;
  if (artEl)    artEl.src            = track.albumArt;
  if (durEl)    durEl.textContent    = '00:00';

  // Reset progress
  setProgressBar(0);
  if ($('currentTime')) $('currentTime').textContent = '00:00';

  audioObj.src = track.url;
  audioObj.volume = parseFloat($('volumeBar')?.style.width || '80') / 100 || 0.8;

  if (autoPlay) {
    playAudio();
  } else {
    // Pastikan icon reset ke play
    setPlayIcon(false);
    isPlaying = false;
  }
}

function playAudio() {
  audioObj.play().catch(e => console.warn('Audio play blocked:', e));
  setPlayIcon(true);
  isPlaying = true;
  startProgress();
}

function pauseAudio() {
  audioObj.pause();
  setPlayIcon(false);
  isPlaying = false;
  stopProgress();
}

function togglePlayPause() {
  if (isPlaying) pauseAudio(); else playAudio();
}

function setPlayIcon(playing) {
  const playIcon  = $('playIcon');
  const pauseIcon = $('pauseIcon');
  if (playIcon)  playIcon.classList.toggle('hidden',  playing);
  if (pauseIcon) pauseIcon.classList.toggle('hidden', !playing);
}

function formatTime(sec) {
  if (!isFinite(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function setProgressBar(pct) {
  const bar = $('progressBar');
  if (bar) bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

function startProgress() {
  stopProgress();
  function tick() {
    if (audioObj.duration) {
      const pct = (audioObj.currentTime / audioObj.duration) * 100;
      setProgressBar(pct);
      if ($('currentTime')) $('currentTime').textContent = formatTime(audioObj.currentTime);
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
}

function stopProgress() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

// ── EVENT LISTENERS ──────────────────────────
function initGalleryEvents() {

  // Image nav
  const prevImg = $('prevImage');
  const nextImg = $('nextImage');
  if (prevImg) prevImg.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGalleryImage();
  });
  if (nextImg) nextImg.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateGalleryImage();
  });

  // Video nav — panah kiri/kanan
  const prevVid = $('prevVideo');
  const nextVid = $('nextVideo');
  if (prevVid) prevVid.addEventListener('click', () => goToVideo(currentVideoIndex - 1));
  if (nextVid) nextVid.addEventListener('click', () => goToVideo(currentVideoIndex + 1));

  // Video nav — tombol pagination < 1 2 3 >
  const prevPag = $('prevVideoPag');
  const nextPag = $('nextVideoPag');
  if (prevPag) prevPag.addEventListener('click', () => goToVideo(currentVideoIndex - 1));
  if (nextPag) nextPag.addEventListener('click', () => goToVideo(currentVideoIndex + 1));

  // Tombol angka 1 / 2 / 3
  document.querySelectorAll('.video-page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      goToVideo(idx);
    });
  });

  // Play/Pause
  const playBtn = $('playPauseBtn');
  if (playBtn) playBtn.addEventListener('click', togglePlayPause);

  // Prev / Next track
  const prevTrk = $('prevTrack');
  const nextTrk = $('nextTrack');
  if (prevTrk) prevTrk.addEventListener('click', () => loadTrack(currentTrackIndex - 1, isPlaying));
  if (nextTrk) nextTrk.addEventListener('click', () => loadTrack(currentTrackIndex + 1, isPlaying));

  // Progress bar — klik untuk seek
  const progressContainer = $('progressContainer');
  if (progressContainer) {
    progressContainer.addEventListener('click', e => {
      if (!audioObj.duration) return;
      const rect = progressContainer.getBoundingClientRect();
      const pct  = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      audioObj.currentTime = pct * audioObj.duration;
      setProgressBar(pct * 100);
    });
  }

  // Volume bar — klik untuk atur volume
  const volContainer = $('volumeContainer');
  const volBar       = $('volumeBar');
  if (volContainer) {
    volContainer.addEventListener('click', e => {
      const rect = volContainer.getBoundingClientRect();
      const pct  = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      audioObj.volume = pct;
      if (volBar) volBar.style.width = `${pct * 100}%`;
    });
  }
}

// ── AUDIO EVENTS ─────────────────────────────
function initAudioEvents() {
  audioObj.addEventListener('ended', () => {
    stopProgress();
    loadTrack(currentTrackIndex + 1, true); // Auto-next & autoplay
  });

  audioObj.addEventListener('loadedmetadata', () => {
    if ($('duration')) $('duration').textContent = formatTime(audioObj.duration);
  });

  audioObj.addEventListener('volumechange', () => {
    const volBar = $('volumeBar');
    if (volBar) volBar.style.width = `${audioObj.volume * 100}%`;
  });
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateGalleryImage();
  updateVideo();
  loadTrack(0);
  initGalleryEvents();
  initAudioEvents();

  console.log('✅ Gallery initialized | Videos:', videoIds.length, '| Tracks:', audioTracks.length);
});

// Cleanup saat halaman ditinggal
window.addEventListener('beforeunload', () => {
  stopProgress();
  audioObj.pause();
});
