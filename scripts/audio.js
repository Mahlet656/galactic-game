const music = document.getElementById("bg-music");
const icon = document.getElementById("soundIcon");
const toggle = document.getElementById("soundToggle");

if (music) {
    // 1. LOAD SAVED DATA
    let isMuted = localStorage.getItem("muted") === "true";
    let savedTime = localStorage.getItem("audioTime") || 0;

    // 2. APPLY SAVED STATE
    music.volume = 0.4;
    music.muted = isMuted;
    music.currentTime = parseFloat(savedTime); 

    // Update Icon
    if (icon) {
        icon.className = isMuted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    }

    // 3. ATTEMPT TO RESUME PLAYBACK
    const playMusic = () => {
        if (!isMuted) {
            music.play().catch(() => {
                console.log("Audio waiting for user interaction...");
            });
        }
    };
    playMusic();

    // 4. MUTE TOGGLE LOGIC
    if (toggle && icon) {
        toggle.onclick = () => {
    isMuted = !isMuted;
    music.muted = isMuted;
    localStorage.setItem("muted", isMuted);
    icon.className = isMuted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";

    if (!isMuted) music.play(); 
    toggle.blur();  
};
    }

     window.addEventListener("beforeunload", () => {
        localStorage.setItem("audioTime", music.currentTime);
    });
}