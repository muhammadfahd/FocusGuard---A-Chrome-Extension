// Display greeting based on time of day
function displayGreeting() {
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) {
        greeting = "Good Morning! ☀️";
    } else if (hour < 18) {
        greeting = "Good Afternoon! 🌤️";
    } else {
        greeting = "Good Evening! 🌙";
    }
    
    document.getElementById("greeting").innerText = greeting;
}

// Load and display statistics
chrome.storage.local.get(["timeData", "limits"], (result) => {
    let timeData = result.timeData || {};
    let limits = result.limits || {};

    let totalMinutes = 0;
    let remainingMinutes = 0;

    for (let site in timeData) {
        totalMinutes += Math.floor(timeData[site] / 60);

        if (limits[site]) {
            remainingMinutes += Math.max(0,
                Math.floor((limits[site] - timeData[site]) / 60)
            );
        }
    }

    document.getElementById("totalTime").innerText = totalMinutes + " min";
    document.getElementById("remainingTime").innerText = remainingMinutes + " min";
});

displayGreeting();
