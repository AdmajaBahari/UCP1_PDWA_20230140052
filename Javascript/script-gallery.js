// ============================================
// GALLERY.JS - TECH COMMUNITY MULTIMEDIA
// Fully Fixed & Optimized - 3 YouTube Videos ✅
// ============================================

// 🖼️ Gallery Images Data (4 images)
const galleryImages = [
    'foto/default1.jpg',
    'foto/default2.jpg',
    'foto/default3.jpg',
    'foto/default4.jpg'
];

// 🎥 Video IDs Data - YOUR 3 VIDEOS ✅
const videoIds = [
    'N4PQ-vqNumc',      // 1. https://youtu.be/N4PQ-vqNumc
    'kXhtQW61c2c',      // 2. https://youtu.be/kXhtQW61c2c  
    'JCAVeRW-Q0I'       // 3. https://youtu.be/JCAVeRW-Q0I
];

// 🎵 Audio Tracks Data (7 tracks)
const audioTracks = [
    {
        title: 'Just Keep Watching',
        artist: 'Tate McRae',
        albumArt: 'foto/Cover/1. just keep watching.jpg',
        duration: '02:22',
        url: 'audio/default1.mp3'
    },
    {
        title: 'Lose my mind',
        artist: 'Don Toliver ft. Doja Cat',
        albumArt: 'foto/Cover/2. lose my mind.jpg',
        duration: '03:29',
        url: 'audio/default2.mp3'
    },
    {
        title: 'You Really Got Me',
        artist: 'The Kinks',
        albumArt: 'foto/Cover/3. you really got me.jpg',
        duration: '02:14',
        url: 'audio/default3.mp3'
    },
    {
        title: 'Love me not',
        artist: 'Rayvn Lenae',
        albumArt: 'foto/Cover/4. love me not.jpg',
        duration: '03:38',
        url: 'audio/default4.mp3'
    },
    {
        title: 'bye [Altare Remix]',
        artist: 'Ariana Grande',
        albumArt: 'foto/Cover/5. bye.jpg',
        duration: '03:03',
        url: 'audio/default5.mp3'
    },
    {
        title: 'Skyfall',
        artist: 'Adele',
        albumArt: 'foto/Cover/6. skyfall.jpg',
        duration: '04:37',
        url: 'audio/default6.mp3'
    },
    {
        title: 'Smooth Operator',
        artist: 'Sade',
        albumArt: 'foto/Cover/7. Smooth Operator.jpg',
        duration: '04:16',
        url: 'audio/default7.mp3'
    }
];

// 🗂️ State Variables
let currentImageIndex = 0;
let currentVideoIndex = 0;
let currentTrackIndex = 0;
let isPlaying = false;
let audio = new Audio();
let animationFrame;

// 🎯 DOM Elements (Safe Access)
const elements = {
    // Gallery
    galleryImage: document.getElementById('galleryImage'),
    prevImageBtn: document.getElementById('prevImage'),
    nextImageBtn: document.getElementById('nextImage'),
    imageCounter: document.getElementById('imageCounter'),
    
    // Video
    videoPlayer: document.getElementById('videoPlayer'),
    prevVideo: document.getElementById('prevVideo'),
    nextVideo: document.getElementById('nextVideo'),
    prevVideoPag: document.getElementById('prevVideoPag'),
    nextVideoPag: document.getElementById('nextVideoPag'),
    
    // Audio
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevTrackBtn: document.getElementById('prevTrack'),
    nextTrackBtn: document.getElementById('nextTrack'),
    progressContainer: document.getElementById('progressContainer'),
    progressBar: document.getElementById('progressBar'),
    currentTimeEl: document.getElementById('currentTime'),
    durationEl: document.getElementById('duration'),
    trackTitleEl: document.getElementById('trackTitle'),
    trackArtistEl: document.getElementById('trackArtist'),
    albumArtEl: document.getElementById('albumArt'),
    volumeContainer: document.getElementById('volumeContainer'),
    volumeBar: document.getElementById('volumeBar'),
    
    // UI
    darkToggle: document.getElementById('darkToggle'),
    darkToggleThumb: document.getElementById('darkToggleThumb'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    closeMobileMenu: document.getElementById('closeMobileMenu')
};

// ============================================
// 🖼️ GALLERY FUNCTIONS
// ============================================
function updateGalleryImage() {
    if (elements.galleryImage && elements.imageCounter) {
        elements.galleryImage.src = galleryImages[currentImageIndex];
        elements.imageCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    }
}

// ============================================
// 🎥 VIDEO FUNCTIONS - FULLY FIXED ✅
// ============================================
function updateVideo() {
    if (elements.videoPlayer) {
        const embedUrl = `https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?rel=0&modestbranding=1&playsinline=1&showinfo=0&fs=1&iv_load_policy=3&disablekb=0&autoplay=0&controls=1`;
        elements.videoPlayer.src = embedUrl;
        elements.videoPlayer.title = `Tech Community Video ${currentVideoIndex + 1}`;
        
        console.log(`✅ Video ${currentVideoIndex + 1}/${videoIds.length} loaded: ${videoIds[currentVideoIndex]}`);
    }
}

// ============================================
// 🎵 AUDIO FUNCTIONS
// ============================================
function loadTrack(index) {
    const track = audioTracks[index];
    if (elements.trackTitleEl && elements.trackArtistEl && elements.albumArtEl && elements.durationEl) {
        elements.trackTitleEl.textContent = track.title;
        elements.trackArtistEl.textContent = track.artist;
        elements.albumArtEl.src = track.albumArt;
        elements.durationEl.textContent = track.duration;
    }
    audio.src = track.url;
    currentTrackIndex = index;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
    if (audio.duration && elements.progressBar && elements.currentTimeEl) {
        const progress = (audio.currentTime / audio.duration) * 100;
        elements.progressBar.style.width = `${progress}%`;
        elements.currentTimeEl.textContent = formatTime(audio.currentTime);
        animationFrame = requestAnimationFrame(updateProgress);
    }
}

function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        if (elements.playIcon) elements.playIcon.classList.remove('hidden');
        if (elements.pauseIcon) elements.pauseIcon.classList.add('hidden');
        cancelAnimationFrame(animationFrame);
    } else {
        audio.play().catch(e => console.log('Audio play failed:', e));
        if (elements.playIcon) elements.playIcon.classList.add('hidden');
        if (elements.pauseIcon) elements.pauseIcon.classList.remove('hidden');
        animationFrame = requestAnimationFrame(updateProgress);
    }
    isPlaying = !isPlaying;
}

// ============================================
// 🎛️ EVENT LISTENERS - CENTRALIZED
// ============================================
function initEventListeners() {
    // 🖼️ Gallery Navigation
    if (elements.prevImageBtn) {
        elements.prevImageBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGalleryImage();
        });
    }
    
    if (elements.nextImageBtn) {
        elements.nextImageBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateGalleryImage();
        });
    }
    
    // 🎥 Video Navigation - ALL 4 BUTTONS ✅
    const videoPrevButtons = [elements.prevVideo, elements.prevVideoPag];
    const videoNextButtons = [elements.nextVideo, elements.nextVideoPag];
    
    videoPrevButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                currentVideoIndex = (currentVideoIndex - 1 + videoIds.length) % videoIds.length;
                updateVideo();
            });
        }
    });
    
    videoNextButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                currentVideoIndex = (currentVideoIndex + 1) % videoIds.length;
                updateVideo();
            });
        }
    });
    
    // 🎵 Audio Controls
    if (elements.playPauseBtn) {
        elements.playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (elements.prevTrackBtn) {
        elements.prevTrackBtn.addEventListener('click', () => {
            const newIndex = (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
            loadTrack(newIndex);
        });
    }
    
    if (elements.nextTrackBtn) {
        elements.nextTrackBtn.addEventListener('click', () => {
            const newIndex = (currentTrackIndex + 1) % audioTracks.length;
            loadTrack(newIndex);
        });
    }
    
    // 📏 Progress Bar
    if (elements.progressContainer) {
        elements.progressContainer.addEventListener('click', (e) => {
            const rect = elements.progressContainer.getBoundingClientRect();
            const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            if (audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
        });
    }
    
    // 🔊 Volume Control
    if (elements.volumeContainer) {
        elements.volumeContainer.addEventListener('click', (e) => {
            const rect = elements.volumeContainer.getBoundingClientRect();
            const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            audio.volume = percent;
            if (elements.volumeBar) {
                elements.volumeBar.style.width = `${percent * 100}%`;
            }
        });
    }
    
    // 🌙 Dark Mode Toggle
    if (elements.darkToggle && elements.darkToggleThumb) {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark');
            elements.darkToggleThumb.classList.add('left-1', '-translate-x-full');
        }
        
        elements.darkToggle.addEventListener('click', () => {
            const isCurrentlyDark = document.documentElement.classList.contains('dark');
            if (isCurrentlyDark) {
                document.documentElement.classList.remove('dark');
                elements.darkToggleThumb.classList.remove('left-1', '-translate-x-full');
                localStorage.setItem('darkMode', 'false');
            } else {
                document.documentElement.classList.add('dark');
                elements.darkToggleThumb.classList.add('left-1', '-translate-x-full');
                localStorage.setItem('darkMode', 'true');
            }
        });
    }
    
    // 📱 Mobile Menu
    if (elements.mobileMenuBtn && elements.mobileMenu && elements.closeMobileMenu) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.mobileMenu.classList.remove('opacity-0', 'invisible');
            elements.mobileMenu.classList.add('opacity-100', 'visible');
        });
        
        elements.closeMobileMenu.addEventListener('click', () => {
            elements.mobileMenu.classList.add('opacity-0', 'invisible');
            elements.mobileMenu.classList.remove('opacity-100', 'visible');
        });
    }
}

// ============================================
// 🔊 AUDIO EVENT LISTENERS
// ============================================
function initAudioEvents() {
    audio.addEventListener('ended', () => {
        togglePlayPause();
        if (elements.nextTrackBtn) elements.nextTrackBtn.click();
    });
    
    audio.addEventListener('timeupdate', () => {
        if (!animationFrame) {
            animationFrame = requestAnimationFrame(updateProgress);
        }
    });
    
    audio.addEventListener('loadedmetadata', () => {
        if (elements.durationEl) {
            elements.durationEl.textContent = formatTime(audio.duration);
        }
    });
    
    audio.addEventListener('volumechange', () => {
        if (elements.volumeBar) {
            elements.volumeBar.style.width = `${audio.volume * 100}%`;
        }
    });
}

// ============================================
// 🚀 INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Tech Community Gallery Loaded!');
    console.log('📹 Available Videos:', videoIds.map((id, i) => `${i+1}. ${id}`));
    
    // Initialize everything
    updateGalleryImage();
    updateVideo(); // ✅ Loads first video automatically
    loadTrack(0);
    
    // Setup event listeners
    initEventListeners();
    initAudioEvents();
    
    console.log('✅ All systems operational!');
});

// ============================================
// 🛡️ ERROR HANDLING & CLEANUP
// ============================================
window.addEventListener('beforeunload', () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    audio.pause();
});