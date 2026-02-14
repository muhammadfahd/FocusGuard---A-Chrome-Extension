chrome.storage.local.get(["limits", "timeData"], (result) => {
    let limits = result.limits || {};
    let timeData = result.timeData || {};

    const hostname = window.location.hostname;

    if (limits[hostname] && timeData[hostname] > limits[hostname]) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                flex-direction: column;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 80px; margin-bottom: 20px;">🛑</div>
                <h1 style="font-size: 42px; margin-bottom: 20px; font-weight: 700;">Stay Focused</h1>
                <p style="font-size: 18px; opacity: 0.9; max-width: 500px;">
                    Your time limit for this site is over. Return to your studies!
                </p>
            </div>
        `;
    }
});
