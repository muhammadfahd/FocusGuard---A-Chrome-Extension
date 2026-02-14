const statsDiv = document.getElementById("stats");
let chartInstance = null;
let timerInterval = null;
let seconds = 0;
let running = false;
let currentFilter = 'all';

// Tab switching function
function openTab(tabId) {
    // Hide all tabs
    document.querySelectorAll(".tabContent").forEach(t => t.style.display = "none");
    
    // Remove active class from all buttons
    document.querySelectorAll(".tabBtn").forEach(btn => btn.classList.remove("active"));
    
    // Show selected tab
    document.getElementById(tabId).style.display = "block";
    
    // Add active class to corresponding button
    if (tabId === "statsTab") {
        document.getElementById("statsBtn").classList.add("active");
    } else if (tabId === "timerTab") {
        document.getElementById("timerBtn").classList.add("active");
    } else if (tabId === "optionsTab") {
        document.getElementById("optionsBtn").classList.add("active");
    }
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        social: '📱',
        entertainment: '📺',
        educational: '📚',
        news: '📰',
        shopping: '🛒',
        other: '🌐'
    };
    return emojis[category] || '🌐';
}

// Auto-detect current tab when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]?.url && tabs[0].url.startsWith("http")) {
        try {
            document.getElementById("site").value = new URL(tabs[0].url).hostname;
        } catch {}
    }
});

// Load and display statistics
function loadStats() {
    chrome.storage.local.get(["timeData", "limits", "categories"], (result) => {
        let timeData = result.timeData || {};
        let limits = result.limits || {};
        let categories = result.categories || {};

        statsDiv.innerHTML = "";

        // Combine sites from both timeData and limits
        const allSites = new Set([
            ...Object.keys(timeData),
            ...Object.keys(limits)
        ]);

        if (allSites.size === 0) {
            statsDiv.innerHTML = '<p style="text-align:center; color:#64748b;">No data yet. Start browsing or set limits!</p>';
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
            return;
        }

        let chartLabels = [];
        let chartValues = [];
        let filteredSites = [];

        allSites.forEach(site => {
            let category = categories[site] || 'other';
            
            // Apply filter
            if (currentFilter !== 'all' && category !== currentFilter) {
                return;
            }
            
            filteredSites.push(site);
            
            let spentSec = timeData[site] || 0;
            let limitSec = limits[site] || null;

            let minutes = Math.floor(spentSec / 60);
            let limitText = limitSec ? ` | Limit: ${Math.floor(limitSec / 60)} min` : "";

            let remainingText = "";
            if (limitSec) {
                let remaining = Math.max(0, Math.floor((limitSec - spentSec) / 60));
                remainingText = ` | Remaining: ${remaining} min`;
            }

            let categoryEmoji = getCategoryEmoji(category);
            let categoryBadge = `<span class="category-badge category-${category}">${categoryEmoji} ${category}</span>`;

            statsDiv.innerHTML += `
                <p>
                    <strong>${site}</strong>${categoryBadge}
                    <br>${minutes} min${limitText}${remainingText}
                </p>
            `;

            chartLabels.push(site);
            chartValues.push(minutes);
        });
        
        if (filteredSites.length === 0) {
            statsDiv.innerHTML = '<p style="text-align:center; color:#64748b;">No sites in this category yet.</p>';
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        } else {
            drawChart(chartLabels, chartValues);
        }
    });
}

// Draw usage chart
function drawChart(labels, values) {
    const ctx = document.getElementById("usageChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Minutes Spent",
                data: values,
                backgroundColor: "rgba(102, 126, 234, 0.7)",
                borderColor: "rgba(102, 126, 234, 1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Set limit button
document.getElementById("setLimit").onclick = () => {
    let site = document.getElementById("site").value.trim();
    let limit = document.getElementById("limit").value.trim();

    if (!site) {
        alert("❌ Please enter a website (e.g., youtube.com)");
        return;
    }

    if (!limit || isNaN(limit) || limit <= 0) {
        alert("❌ Please enter a valid number of minutes");
        return;
    }

    chrome.storage.local.get(["limits", "timeData", "categories"], (result) => {
        let limits = result.limits || {};
        let timeData = result.timeData || {};
        let categories = result.categories || {};

        limits[site] = parseInt(limit) * 60;

        // Ensure site exists in timeData
        if (!timeData[site]) {
            timeData[site] = 0;
        }
        
        // Auto-categorize if not already categorized
        if (!categories[site]) {
            // Simple categorization
            if (site.includes('facebook') || site.includes('instagram') || site.includes('twitter') || site.includes('tiktok')) {
                categories[site] = 'social';
            } else if (site.includes('youtube') || site.includes('netflix') || site.includes('twitch')) {
                categories[site] = 'entertainment';
            } else if (site.includes('wikipedia') || site.includes('coursera') || site.includes('udemy')) {
                categories[site] = 'educational';
            } else {
                categories[site] = 'other';
            }
        }

        chrome.storage.local.set({ limits, timeData, categories }, () => {
            alert(`✅ Limit set for ${site}: ${limit} minutes`);
            document.getElementById("site").value = "";
            document.getElementById("limit").value = "";
            loadStats();
        });
    });
};

// Timer display update
function updateDisplay() {
    let min = Math.floor(seconds / 60).toString().padStart(2, "0");
    let sec = (seconds % 60).toString().padStart(2, "0");
    document.getElementById("timerDisplay").innerText = `${min}:${sec}`;
}

// Start timer
document.getElementById("startTimer").onclick = () => {
    if (running) return;
    running = true;

    let mode = document.getElementById("mode").value;

    if (seconds === 0) {
        if (mode === "pomodoro") seconds = 25 * 60;
        else if (mode === "short") seconds = 5 * 60;
        else if (mode === "long") seconds = 15 * 60;
    }

    timerInterval = setInterval(() => {
        if (mode === "stopwatch") {
            seconds++;
        } else {
            seconds--;
            if (seconds <= 0) {
                clearInterval(timerInterval);
                running = false;
                alert("⏰ Session complete!");
                seconds = 0;
            }
        }
        updateDisplay();
    }, 1000);
};

// Pause timer
document.getElementById("pauseTimer").onclick = () => {
    clearInterval(timerInterval);
    running = false;
};

// Reset timer
document.getElementById("resetTimer").onclick = () => {
    clearInterval(timerInterval);
    running = false;
    seconds = 0;
    updateDisplay();
};

// Tab button event listeners
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("statsBtn").addEventListener("click", () => openTab("statsTab"));
    document.getElementById("timerBtn").addEventListener("click", () => openTab("timerTab"));
    document.getElementById("optionsBtn").addEventListener("click", () => openTab("optionsTab"));

    // Focus Mode Toggle
    const focusModeToggle = document.getElementById("focusModeToggle");
    const focusModeSection = document.querySelector(".focus-mode-section");
    const focusModeDesc = document.getElementById("focusModeDesc");
    
    // Load Focus Mode state
    chrome.storage.local.get(['focusMode'], (result) => {
        focusModeToggle.checked = result.focusMode || false;
        if (result.focusMode) {
            focusModeSection.classList.add('active');
            focusModeDesc.textContent = "Active - Blocking distractions!";
        }
    });
    
    // Toggle Focus Mode
    focusModeToggle.addEventListener('change', function() {
        const isActive = this.checked;
        chrome.storage.local.set({ focusMode: isActive });
        
        if (isActive) {
            focusModeSection.classList.add('active');
            focusModeDesc.textContent = "Active - Blocking distractions!";
            
            // Show notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon128.png',
                title: 'Focus Mode Activated! 🔥',
                message: 'All distracting websites are now blocked. Stay focused!',
                priority: 2
            });
        } else {
            focusModeSection.classList.remove('active');
            focusModeDesc.textContent = "Block all distractions";
        }
    });

    // Category Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            loadStats();
        });
    });

    // Load stats on open and set default tab
    loadStats();
    openTab("statsTab");
    updateDisplay();
});
