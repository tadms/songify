document.addEventListener('DOMContentLoaded', function() {
    const trackListElement = document.getElementById('trackList');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const playPauseButton = document.getElementById('playPauseButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const progressContainer = document.getElementById('progressContainer');
    const progress = document.getElementById('progress');

    let songs = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let progressInterval = null;

    // Function to load the JSON file and parse the songs
    async function loadSongs() {
        try {
            const response = await fetch('songs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Debug: check if the data is correct
            songs = data.songs;
            populateTrackList();
            loadTrack(currentTrackIndex);
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    }

    // Function to populate the track list
    function populateTrackList() {
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = song.split('/').pop().replace('.mp3', ''); // Display filename without .mp3 extension
            li.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                audioPlayer.play();
                isPlaying = true;
                updatePlayPauseButton();
                updateTrackHighlight();
                if (progressInterval) {
                    clearInterval(progressInterval);
                }
                progressInterval = setInterval(updateProgressBar, 100);
            });
            trackListElement.appendChild(li);
        });
    }

    // Function to load the current track
    function loadTrack(index) {
        const song = songs[index];
        audioSource.src = `songs/${song}.mp3`;
        audioPlayer.load();
        updateTrackHighlight();
        updatePlayPauseButton();
    }

    // Function to update the play/pause button
    function updatePlayPauseButton() {
        const playPauseIcon = playPauseButton.querySelector('i');
        playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    // Function to play or pause the audio
    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            clearInterval(progressInterval);
        } else {
            audioPlayer.play();
            progressInterval = setInterval(updateProgressBar, 100);
        }
        isPlaying = !isPlaying;
        updatePlayPauseButton();
    }

    // Event listener for play/pause button
    playPauseButton.addEventListener('click', togglePlayPause);

    // Function to play the next track
    function playNextTrack() {
        currentTrackIndex = (currentTrackIndex < songs.length - 1) ? currentTrackIndex + 1 : 0;
        loadTrack(currentTrackIndex);
        audioPlayer.play();
        updatePlayPauseButton();
        updateTrackHighlight();
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressInterval = setInterval(updateProgressBar, 100);
    }

    // Function to update the progress bar at a specified interval
    function updateProgressBar() {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = `${progressPercent}%`;
        }
    }

    // Function to set progress bar
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    }

    // Event listeners for progress bar
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    progressContainer.addEventListener('click', setProgress);

    // Function to highlight the current track
    function updateTrackHighlight() {
        const trackElements = document.querySelectorAll('#trackList li');
        trackElements.forEach((element, idx) => {
            if (idx === currentTrackIndex) {
                element.classList.add('playing');
            } else {
                element.classList.remove('playing');
            }
        });
    }

    // Load the songs and initialize the player
    loadSongs();

    // Event listeners for previous and next buttons
    prevButton.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex > 0) ? currentTrackIndex - 1 : songs.length - 1;
        loadTrack(currentTrackIndex);
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
        updateTrackHighlight();
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressInterval = setInterval(updateProgressBar, 100);
    });

    nextButton.addEventListener('click', playNextTrack); // Use playNextTrack function

    // Update play/pause button when the audio ends
    audioPlayer.addEventListener('ended', playNextTrack);
});
