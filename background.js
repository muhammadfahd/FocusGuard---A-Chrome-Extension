let activeTab = null;
let startTime = Date.now();
let focusModeActive = false;

function extractHostname(url) {
    try {
        if (url && url.startsWith("http")) {
            return new URL(url).hostname;
        }
    } catch (e) {}
    return null;
}

// Predefined categories for auto-categorization
const categoryPatterns = {
    social: ['facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'linkedin', 'pinterest'],
    entertainment: ['youtube', 'netflix', 'twitch', 'hulu', 'disneyplus', 'spotify', 'soundcloud'],
    news: ['cnn', 'bbc', 'news', 'nytimes', 'theguardian', 'reddit'],
    shopping: ['amazon', 'ebay', 'etsy', 'alibaba', 'walmart', 'target'],
    educational: ['wikipedia', 'coursera', 'udemy', 'khanacademy', 'edx', 'stackoverflow']
};

function categorizeWebsite(hostname) {
    for (let category in categoryPatterns) {
        if (categoryPatterns[category].some(pattern => hostname.includes(pattern))) {
            return category;
        }
    }
    return 'other';
}

// Check if site is blocked by Focus Mode
function isBlockedByFocusMode(hostname) {
    if (!focusModeActive) return false;
    
    // During focus mode, block everything except educational sites
    const category = categorizeWebsite(hostname);
    return category !== 'educational';
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeTab = extractHostname(tab.url);
    startTime = Date.now();
});

// Track tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        activeTab = extractHostname(tab.url);
        startTime = Date.now();
    }
});

// Update time every 5 seconds
setInterval(() => {
    if (!activeTab) return;

    chrome.storage.local.get(["timeData", "categories"], (result) => {
        let timeData = result.timeData || {};
        let categories = result.categories || {};
        let elapsed = Math.floor((Date.now() - startTime) / 1000);

        timeData[activeTab] = (timeData[activeTab] || 0) + elapsed;
        
        // Auto-categorize if not already categorized
        if (!categories[activeTab]) {
            categories[activeTab] = categorizeWebsite(activeTab);
        }
        
        chrome.storage.local.set({ timeData, categories });

        startTime = Date.now();
    });

    // Check if limit reached or Focus Mode active
    chrome.storage.local.get(["limits", "timeData", "focusMode"], (result) => {
        let limits = result.limits || {};
        let timeData = result.timeData || {};
        focusModeActive = result.focusMode || false;

        // Block if Focus Mode is active and site is not educational
        if (focusModeActive && isBlockedByFocusMode(activeTab)) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, {
                        url: chrome.runtime.getURL("block.html?reason=focus")
                    });
                }
            });
            return;
        }

        // Block if time limit reached
        if (limits[activeTab] && timeData[activeTab] > limits[activeTab]) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, {
                        url: chrome.runtime.getURL("block.html?reason=limit")
                    });
                }
            });
        }
    });
}, 5000);

// Create daily reset alarm on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("dailyReset", {
        when: Date.now(),
        periodInMinutes: 1440 // 24 hours
    });
    
    // Check if first time install - show onboarding
    chrome.storage.local.get(['onboardingCompleted'], (result) => {
        if (!result.onboardingCompleted) {
            chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
        }
    });
});

// Reset daily data at midnight
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyReset") {
        chrome.storage.local.set({ timeData: {} });
    }
});
