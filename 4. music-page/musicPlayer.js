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
        duration: 274,
        albumCover: "../3. art-page/Designs/cascadia.jpg",
        src: "../4. music-page/Try Again.mp3",
        dateWritten: "TBA",
        collaborators: "Aamir Rahman, Karteikay Dhuper",
        location: "Indianapolis, IN",
        genre: "Grunge, Shoegaze",
        description: ""
      },
      {
        title: "Erase Me",
        artist: "Cascadia",
        duration: 221,
        albumCover: "../3. art-page/Designs/cascadia.jpg",
        src: "../4. music-page/Erase me.mp3",
        dateWritten: "2024",
        collaborators: "Aamir Rahman, Ellie Parr, Karteikay Dhuper, Taylor Anne, Dhruv Narayanan",
        location: "Purdue University, West Lafayette, IN",
        genre: "Grunge, Shoegaze",
        description: ""
      },
      {
        title: "Experiment 1",
        artist: "Karty",
        duration: 67,
        albumCover: "../4. music-page/sunset.jpg",
        src: "../4. music-page/Final Minute - Demo.m4a",
        dateWritten: "2021",
        collaborators: "Solo",
        location: "Dorm Room, Wiley Hall",
        genre: "Experimental folk",
        description: ""
      },
      {
        title: "Coming Soon",
        artist: "Karty",
        duration: 220,
        albumCover: "https://via.placeholder.com/200?text=Track+3",
        src: "#",
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
    this.applyTheme();

    // Set initial song source
    this.audio.src = this.songs[0].src;
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
    return bgElement && bgElement.style.backgroundColor === 'black';
  }

  observeDarkModeChanges() {
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
      darkModeBtn.addEventListener('click', () => {
        setTimeout(() => {
          this.isDarkMode = this.checkDarkMode();
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
      if (index === this.currentSongIndex) songElement.classList.add('active');

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

    this.applyThemeToLibrary();
  }

  updateSongDisplay() {
    const song = this.songs[this.currentSongIndex];
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('artistName').textContent = song.artist;
    document.getElementById('albumCover').src = song.albumCover;
    document.getElementById('duration').textContent = this.formatTime(song.duration);
    this.updateUpNext();
    this.updateInsights();
    this.renderSongLibrary();
    this.applyTheme();
  }

  updateUpNext() {
    const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
    const nextSong = this.songs[nextIndex];
    document.getElementById('upNextItem').innerHTML = `
      <p style="margin: 0; font-weight: bold;">${nextSong.title}</p>
      <p style="margin: 0; font-size: 0.9em; opacity: 0.8;">${nextSong.artist}</p>
    `;
  }

  togglePlay() {
    this.isPlaying ? this.pause() : this.play();
  }

  play() {
    const currentSong = this.songs[this.currentSongIndex];

    // FIX: Always update the audio source
    if (currentSong.src) {
      this.audio.src = currentSong.src;
    }

    this.isPlaying = true;
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    this.audio.play().catch(err => console.log(err));
  }

  pause() {
    this.isPlaying = false;
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    this.audio.pause();
  }

  playSong(index) {
    this.currentSongIndex = index;
    const currentSong = this.songs[this.currentSongIndex];

    // FIX: Set audio source when clicking a song
    this.audio.src = currentSong.src;

    this.updateSongDisplay();
    this.play();
  }

  nextSong() {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;

    const currentSong = this.songs[this.currentSongIndex];
    this.audio.src = currentSong.src; // FIX

    this.updateSongDisplay();
    if (this.isPlaying) this.play();
  }

  prevSong() {
    this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;

    const currentSong = this.songs[this.currentSongIndex];
    this.audio.src = currentSong.src; // FIX

    this.updateSongDisplay();
    if (this.isPlaying) this.play();
  }

  seek(e) {
    const progressBar = document.getElementById('progressBar');
    const clickX = e.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;

    if (this.audio.duration) {
      this.audio.currentTime = percentage * this.audio.duration;
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentTimeDisplay = document.getElementById('currentTime');

    if (this.audio.duration) {
      const percentage = (this.audio.currentTime / this.audio.duration) * 100;
      progressFill.style.width = percentage + "%";
    }

    currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  toggleInsights() {
    const insightsSection = document.getElementById('playerInsights');
    const btn = document.getElementById('insightsToggleBtn');

    const shown = insightsSection.style.display === 'block';
    insightsSection.style.display = shown ? 'none' : 'block';
    btn.classList.toggle('active', !shown);
  }

  updateInsights() {
    const s = this.songs[this.currentSongIndex];
    document.getElementById('insightDate').textContent = s.dateWritten;
    document.getElementById('insightCollaborators').textContent = s.collaborators;
    document.getElementById('insightLocation').textContent = s.location;
    document.getElementById('insightGenre').textContent = s.genre;
    document.getElementById('insightDescription').textContent = s.description;
  }

  applyTheme() {
    const dark = this.checkDarkMode();

    const titleEl = document.getElementById('songTitle');
    const artistEl = document.getElementById('artistName');
    const libraryTitle = document.querySelector('.library-title');
    const insightsTitle = document.querySelector('.insights-title');
    const upNextHeader = document.querySelector('.up-next h3');

    if (titleEl) titleEl.style.color = dark ? 'white' : 'black';
    if (artistEl) artistEl.style.color = dark ? '#e0e0e0' : '#666';
    if (libraryTitle) libraryTitle.style.color = dark ? 'white' : 'black';
    if (insightsTitle) insightsTitle.style.color = dark ? 'white' : '#ff6630';
    if (upNextHeader) upNextHeader.style.color = dark ? 'white' : 'black';

    this.applyThemeToLibrary();
  }

  applyThemeToLibrary() {
    const dark = this.checkDarkMode();
    document.querySelectorAll('.song-item-title').forEach(t => t.style.color = dark ? 'white' : 'black');
    document.querySelectorAll('.song-item-artist').forEach(a => a.style.color = dark ? '#b0b0b0' : '#666');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MusicPlayer();
});
s