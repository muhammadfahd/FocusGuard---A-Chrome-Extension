# 🎯 FocusGuard - Chrome Extension

A minimalist Chrome extension to help students stay focused by tracking browsing time, setting website limits, and using Pomodoro technique.

## ✨ Features

- **Time Tracking**: Automatically tracks time spent on each website
- **Website Limits**: Set daily time limits for distracting websites
- **Pomodoro Timer**: Built-in focus timer with 25/5/15 minute presets
- **Focus Dashboard**: Beautiful new tab page showing your daily statistics
- **Daily Reset**: Automatically resets time data at midnight
- **Visual Statistics**: Bar chart showing your browsing patterns

## 🚀 Installation

1. **Download the Extension**
   - Download all files to a folder on your computer

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing all the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle icon in Chrome toolbar
   - Find "FocusGuard" and click the pin icon

## 📖 How to Use

### Setting Time Limits
1. Click the FocusGuard icon in your toolbar
2. Go to the "Limits" tab
3. Enter a website (e.g., `youtube.com`)
4. Enter time limit in minutes
5. Click "Set Limit"

### Using the Timer
1. Click the FocusGuard icon
2. Go to the "Timer" tab
3. Select a mode:
   - 🍅 Pomodoro (25 min work session)
   - ☕ Short Break (5 min)
   - 🌴 Long Break (15 min)
   - ⏱️ Stopwatch (count up)
4. Click Start/Pause/Reset as needed

### Viewing Statistics
1. Click the FocusGuard icon to see today's statistics
2. View the bar chart showing time spent per site
3. Open a new tab to see your Focus Dashboard with total stats

## 🎨 Features in Detail

### Time Tracking
- Tracks active browsing time on all websites
- Updates every 5 seconds for accuracy
- Shows remaining time for limited sites

### Blocking System
- When limit is reached, the site is blocked
- Beautiful block page encourages you to refocus
- Resets daily at midnight

### Focus Dashboard
- Replaces your new tab page
- Shows greeting based on time of day
- Displays total browsing time and remaining limits
- Motivational quotes to keep you inspired

## 🛠️ Troubleshooting

**Extension not tracking time:**
- Make sure you've granted all permissions during installation
- Check if the extension is enabled in chrome://extensions/

**Timer not working:**
- Reload the extension
- Click "Start" to begin the countdown

**Limits not blocking:**
- Ensure the website hostname is correct (e.g., `youtube.com` not `www.youtube.com`)
- The blocking activates when you visit the site after reaching the limit

## 📝 File Structure

```
FocusGuard/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── content.js          # Content script for blocking
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── popup.css           # Popup styling
├── focus.html          # New tab dashboard
├── focus.js            # Dashboard functionality
├── block.html          # Block page when limit reached
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
└── icon128.png         # Extension icon (128x128)
```

## 🎯 Tips for Maximum Productivity

1. **Set realistic limits**: Start with 30-60 minutes for distracting sites
2. **Use Pomodoro technique**: 25 min work + 5 min break cycles
3. **Check your stats**: Review daily to understand your habits
4. **Gradually reduce time**: Lower limits each week for better focus

## 🐛 Known Issues

- Daily reset happens at midnight based on your local time
- Some websites (like Chrome settings pages) cannot be tracked
- Statistics persist until daily reset

## 📄 License

This extension is free to use and modify for personal and educational purposes.

## 💡 Future Improvements

- Export statistics to CSV
- Weekly/monthly reports
- Whitelist for productive websites
- Custom motivational quotes
- Sound notifications for timer completion
- Browser history analysis

---

**Made with ❤️ for students who want to stay focused**
