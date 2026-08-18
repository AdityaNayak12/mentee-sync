document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('syncBtn');
    const statusText = document.getElementById('status');

    button.addEventListener('click', () => {
        button.disabled = true;
        statusText.textContent = "Authenticating and Syncing...";
        statusText.className = "";

        // Tell the background script to run the dual-fetch sync
        chrome.runtime.sendMessage({ action: "FORCE_SYNC" }, (response) => {
            button.disabled = false;
            
            if (response && response.success) {
                statusText.textContent = `Success! Synced as ${response.name}`;
                statusText.className = "success";
            } else {
                statusText.textContent = response?.error || "Sync failed. Please log into Scaler.";
                statusText.className = "error";
            }
        });
    });
});