// Music Player Implementation
// Author: Karteikay (Karty) Dhuper

class MusicPlayer {
  constructor() {
    this.currentSongIndex = 0;
    this.isPlaying = false;
    this.audio = new Audio();
    this.isDarkMode = this.checkDarkMode();
    
    // Sample songs - Replace with your actual songs
    this.songs = [
      {
        title: "Try Again",
        artist: "Cascadia",
        duration: 180,
        albumCover: "https://via.placeholder.com/200?text=Coming+Soon",
        url: "#",
        dateWritten: "TBA",
        collaborators: "Aamir Rahman, Karteikay Dhuper",
        location: "Indianapolis, IN",
        genre: "Grunge, Alternative Rock, Shoegaze",
        description: "An upcoming track - stay tuned for more details!"
      },
      {
        title: "Erase Me",
        artist: "Cascadia",
        duration: 240,
        albumCover: "https://via.placeholder.com/200?text=Track+1",
        url: "#",
        dateWritten: "2024",
        collaborators: "Aamir Rahman, Karteikay Dhuper, Taylor Anne, Ellie Par, Dhruv Narayanan",
        location: "Purdue University, West Lafayette, IN",
        genre: "",
        description: ""
      },
      {
        title: "Untitled Track 2",
        artist: "Karty",
        duration: 200,
        albumCover: "https://via.placeholder.com/200?text=Track+2",
        url: "#",
        dateWritten: "2024",
        collaborators: "Solo",
        location: "Home Studio",
        genre: "",
        description: ""
      },
      {
        title: "Untitled Track 3",
        artist: "Karty",
        duration: 220,
        albumCover: "https://via.placeholder.com/200?text=Track+3",
        url: "#",
        dateWritten: "2024",
        collaborators: "Solo",
        location: "Home Studio",
        genre: "",
        description: ""
      }
    ];

    this.initializePlayer();
    this.setupEventListeners();
    this.renderSongLibrary();
    this.observeDarkModeChanges();
    // Apply theme to player elements on init
    this.applyTheme();
  }

  initializePlayer() {
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.nextSong());
    this.updateSongDisplay();
  }

  setupEventListeners() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const insightsToggleBtn = document.getElementById('insightsToggleBtn');

    if (playPauseBtn) playPauseBtn.addEventListener('click', () => this.togglePlay());
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSong());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSong());
    if (progressBar) progressBar.addEventListener('click', (e) => this.seek(e));
    if (insightsToggleBtn) insightsToggleBtn.addEventListener('click', () => this.toggleInsights());
  }

  checkDarkMode() {
    const bgElement = document.getElementById('dark-mode-bg');
    if (bgElement && bgElement.style.backgroundColor === 'black') {
      return true;
    }
    return false;
  }

  observeDarkModeChanges() {
    // Listen for dark mode button clicks on the main page
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
      darkModeBtn.addEventListener('click', () => {
        setTimeout(() => {
          this.isDarkMode = this.checkDarkMode();
          // re-apply theme to update inline colors for elements we control
          this.applyTheme();
        }, 100);
      });
    }
  }

  renderSongLibrary() {
    const library = document.getElementById('songsLibrary');
    if (!library) return;

    library.innerHTML = '';
    this.songs.forEach((song, index) => {
      const songElement = document.createElement('div');
      songElement.className = 'library-song';
      if (index === this.currentSongIndex) {
        songElement.classList.add('active');
      }
      
      songElement.innerHTML = `
        <div class="song-item-content">
          <div class="song-item-number">${index + 1}</div>
          <div class="song-item-info">
            <p class="song-item-title">${song.title}</p>
            <p class="song-item-artist">${song.artist}</p>
          </div>
          <div class="song-item-duration">${this.formatTime(song.duration)}</div>
        </div>
      `;
      
      songElement.addEventListener('click', () => this.playSong(index));
      library.appendChild(songElement);
    });
    // ensure newly created library items match current theme
    this.applyThemeToLibrary();
  }

  updateSongDisplay() {
    const song = this.songs[this.currentSongIndex];
    const titleEl = document.getElementById('songTitle');
    const artistEl = document.getElementById('artistName');
    
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    
    document.getElementById('albumCover').src = song.albumCover;
    document.getElementById('duration').textContent = this.formatTime(song.duration);
    this.updateUpNext();
    this.updateInsights();
    this.renderSongLibrary();
    // ensure title/artist colors reflect current theme
    this.applyTheme();
  }

  updateUpNext() {
    const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
    const nextSong = this.songs[nextIndex];
    const upNextElement = document.getElementById('upNextItem');
    
    if (upNextElement) {
      upNextElement.innerHTML = `
        <p style="margin: 0; font-weight: bold;">${nextSong.title}</p>
        <p style="margin: 0; font-size: 0.9em; opacity: 0.8;">${nextSong.artist}</p>
      `;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      playPauseBtn.setAttribute('aria-label', 'Pause');
    }
    
    // For demo purposes, audio won't actually play unless valid URL is provided
    // This allows the UI to work with placeholder songs
    if (this.songs[this.currentSongIndex].url !== '#') {
      this.audio.play().catch(err => console.log('Audio playback not available in demo'));
    }
  }

  pause() {
    this.isPlaying = false;
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      playPauseBtn.setAttribute('aria-label', 'Play');
    }
    this.audio.pause();
  }

  playSong(index) {
    this.currentSongIndex = index;
    this.updateSongDisplay();
    this.play();
  }

  nextSong() {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.updateSongDisplay();
    if (this.isPlaying) {
      this.play();
    }
  }

  prevSong() {
    this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
    this.updateSongDisplay();
    if (this.isPlaying) {
      this.play();
    }
  }

  seek(e) {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    const clickX = e.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    
    if (this.audio.src && this.audio.src !== '') {
      this.audio.currentTime = percentage * this.audio.duration;
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentTimeDisplay = document.getElementById('currentTime');
    
    if (this.audio.duration) {
      const percentage = (this.audio.currentTime / this.audio.duration) * 100;
      if (progressFill) progressFill.style.width = percentage + '%';
    }
    
    if (currentTimeDisplay) {
      currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  toggleInsights() {
    const insightsSection = document.getElementById('playerInsights');
    const btn = document.getElementById('insightsToggleBtn');
    
    if (insightsSection.style.display === 'none') {
      insightsSection.style.display = 'block';
      btn.classList.add('active');
    } else {
      insightsSection.style.display = 'none';
      btn.classList.remove('active');
    }
  }

  updateInsights() {
    const song = this.songs[this.currentSongIndex];
    document.getElementById('insightDate').textContent = song.dateWritten;
    document.getElementById('insightCollaborators').textContent = song.collaborators;
    document.getElementById('insightLocation').textContent = song.location;
    document.getElementById('insightGenre').textContent = song.genre;
    document.getElementById('insightDescription').textContent = song.description;
  }

  // Apply theme colors to elements inside the music player
  applyTheme() {
    const dark = this.checkDarkMode();

    const titleEl = document.getElementById('songTitle');
    const artistEl = document.getElementById('artistName');
    const libraryTitle = document.querySelector('.library-title');
    const insightsTitle = document.querySelector('.insights-title');
    const upNextHeader = document.querySelector('.up-next h3');

    if (titleEl) titleEl.style.color = dark ? 'white' : 'black';
    if (artistEl) artistEl.style.color = dark ? '#e0e0e0' : '#666666';
    if (libraryTitle) libraryTitle.style.color = dark ? 'white' : 'black';
    if (insightsTitle) insightsTitle.style.color = dark ? 'white' : '#ff6630';
    if (upNextHeader) upNextHeader.style.color = dark ? 'white' : 'black';

    // apply to library items
    this.applyThemeToLibrary();
  }

  applyThemeToLibrary() {
    const dark = this.checkDarkMode();
    const titles = document.querySelectorAll('.song-item-title');
    const artists = document.querySelectorAll('.song-item-artist');

    titles.forEach(t => t.style.color = dark ? 'white' : 'black');
    artists.forEach(a => a.style.color = dark ? '#b0b0b0' : '#666666');
  }
}

// Initialize music player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MusicPlayer();
});
