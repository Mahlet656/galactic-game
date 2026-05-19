// Load current wallet correctly
let coins = parseInt(localStorage.getItem("totalCoins")) || 0;
const coinsDisplay = document.getElementById("shopCoins");

// Initial display
if (coinsDisplay) coinsDisplay.innerText = coins;

function showShopNotify(message) {
    const bar = document.getElementById("shopNotify");
    const msg = document.getElementById("notifyMsg");
    
    if (!bar || !msg) return;

    msg.innerText = message;
    
    // Add the active class to slide it down
    bar.classList.add("active");

    // Play sound
    new Audio('assets/sounds/click.wav').play().catch(()=>{});

    // Slide it back up after 3 seconds
    setTimeout(() => {
        bar.classList.remove("active");
    }, 3000);
}

function buyUpgrade(type, price) {
    // Re-check coins from storage to be safe
    let currentCoins = parseInt(localStorage.getItem("totalCoins")) || 0;
    
    if (currentCoins >= price) {
        currentCoins -= price;
        localStorage.setItem("totalCoins", currentCoins);
        
        // Update the number on the screen
        if (coinsDisplay) coinsDisplay.innerText = currentCoins;

        // Save the upgrade status
        let upgrades = JSON.parse(localStorage.getItem("upgrades")) || {};
        upgrades[type] = true;
        localStorage.setItem("upgrades", JSON.stringify(upgrades));

        showShopNotify(`${type.toUpperCase()} MODULE INTEGRATED`);
    } else {
        showShopNotify("INSUFFICIENT CREDITS");
    }
}