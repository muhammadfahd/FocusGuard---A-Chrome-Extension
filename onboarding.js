let currentStep = 1;
let selectedPreset = null;

// Preset configurations
const presets = {
    social: {
        'instagram.com': 30,
        'facebook.com': 30,
        'twitter.com': 30,
        'x.com': 30,
        'tiktok.com': 30,
        'snapchat.com': 30
    },
    video: {
        'youtube.com': 60,
        'twitch.tv': 45,
        'netflix.com': 90
    },
    gaming: {
        'reddit.com': 45,
        'discord.com': 60,
        'store.steampowered.com': 30,
        'gaming.com': 30
    },
    custom: {}
};

// Navigation functions
function nextStep() {
    if (currentStep < 3) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgressDots();
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgressDots();
    }
}

function updateProgressDots() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index + 1 === currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Preset selection
function selectPreset(preset) {
    // Remove selected class from all cards
    document.querySelectorAll('.preset-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    event.target.closest('.preset-card').classList.add('selected');
    selectedPreset = preset;
}

// Finish onboarding and apply preset
function finishOnboarding() {
    if (selectedPreset && selectedPreset !== 'custom') {
        const limits = presets[selectedPreset];
        
        chrome.storage.local.get(['limits', 'timeData'], (result) => {
            let existingLimits = result.limits || {};
            let timeData = result.timeData || {};
            
            // Apply preset limits (convert minutes to seconds)
            for (let site in limits) {
                existingLimits[site] = limits[site] * 60;
                if (!timeData[site]) {
                    timeData[site] = 0;
                }
            }
            
            chrome.storage.local.set({ 
                limits: existingLimits, 
                timeData: timeData,
                onboardingComplete: true 
            }, () => {
                // Close onboarding and open new tab
                chrome.tabs.create({ url: 'chrome://newtab' });
                window.close();
            });
        });
    } else {
        // No preset selected or custom - just mark onboarding complete
        chrome.storage.local.set({ onboardingComplete: true }, () => {
            chrome.tabs.create({ url: 'chrome://newtab' });
            window.close();
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Step 1
    document.getElementById('nextBtn1').addEventListener('click', nextStep);
    
    // Step 2
    document.getElementById('backBtn2').addEventListener('click', prevStep);
    document.getElementById('nextBtn2').addEventListener('click', nextStep);
    
    // Preset cards
    document.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected from all
            document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
            // Add selected to this one
            this.classList.add('selected');
            selectedPreset = this.getAttribute('data-preset');
        });
    });
    
    // Step 3
    document.getElementById('backBtn3').addEventListener('click', prevStep);
    document.getElementById('finishBtn').addEventListener('click', finishOnboarding);
});
