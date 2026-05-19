function updateProgressionUI() {
  const earthDone = localStorage.getItem("earthCompleted") === "true";
  const aetherDone = localStorage.getItem("aetherCompleted") === "true";

  // 1. Earth is always playable or completed
  if (earthDone) setPlanetStatus("earth", "✅ Completed");

  // 2. Unlock Aether if Earth is done
  if (earthDone) unlockPlanet("aether");
  if (aetherDone) setPlanetStatus("aether", "✅ Completed");

  // 3. Unlock Cryon if Aether is done
  if (aetherDone) unlockPlanet("cryon");
}

function unlockPlanet(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const btn = card.querySelector(".planet-btn");
  const tag = document.getElementById(`status-${id}`);

  card.classList.remove("locked");
  tag.innerText = "▶ Playable";
  btn.disabled = false;
  btn.innerText = "DESCENT";
}

function setPlanetStatus(id, text) {
  const card = document.querySelector(`[data-id="${id}"]`);
  card.classList.add("completed");
  document.getElementById(`status-${id}`).innerText = text;
}

function startPlanet(id) {
  localStorage.setItem("activePlanet", id);
  window.location.href = "game.html";
}

// Load the click sound
const clickSnd = new Audio('assets/sounds/click.wav');
clickSnd.volume = 0.5;

function startPlanet(planetId) {
  // 1. Play Sound
  clickSnd.play().catch(e => console.log("Sound blocked by browser"));

  // 2. Small delay so the player actually hears the click before the screen goes black
  setTimeout(() => {
    localStorage.setItem("activePlanet", planetId);
    window.location.href = "game.html";
  }, 150); // 150ms is perfect for feeling "snappy"
}

// Initialize
updateProgressionUI();