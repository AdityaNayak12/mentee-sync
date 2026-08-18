// 1. Setup the automated alarm when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("periodicSync", { periodInMinutes: 60});
});

// 2. Listen for automated alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "periodicSync") {
        runSyncProcess();
    }
});

// 3. Listen for manual "Sync Now" clicks from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "FORCE_SYNC") {
        runSyncProcess().then(result => sendResponse(result));
        return true; // Keep the message channel open for the async response
    }
});

// 4. The Core Dual-Fetch Sync Logic
async function runSyncProcess() {
    try {
        // STEP 1: Fetch Identity
        const profileRes = await fetch("https://www.scaler.com/analytics/");
        
        // If they are logged out, this will likely redirect to login or throw a 401/403
        if (!profileRes.ok || profileRes.redirected) {
            triggerLoginNotification();
            return { success: false, error: "Not logged into Scaler" };
        }

        const profileData = await profileRes.json();
        const menteeEmail = profileData?.data?.attributes?.email;
        const menteeName = profileData?.data?.attributes?.name;

        // Strict validation: Only proceed if it's an official SST email
        if (!menteeEmail || !menteeEmail.endsWith('@sst.scaler.com')) {
            console.error("Invalid or missing SST email.");
            return { success: false, error: "Please use your @sst.scaler.com account." };
        }

        console.log(`Authenticated as ${menteeName} (${menteeEmail}). Fetching stats...`);

        // STEP 2: Fetch Progress Stats
        const statsRes = await fetch("https://www.scaler.com/academy/mentee/events/?start_date=2025-08-11&end_date=2026-08-25&include_offline_events=true", {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            cache: 'no-store' // This forces the browser to ignore the cache completely
        });
        
        if (!statsRes.ok) {
            return { success: false, error: "Failed to fetch progress events." };
        }

        const rawStatsData = await statsRes.json();
        const processedStats = calculateMenteeProgress(rawStatsData);

        // STEP 3: Push to Backend
        // Replace this URL with your actual deployed backend URL when ready
        const backendRes = await fetch("http://localhost:3000/api/sync", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: menteeName,
                email: menteeEmail,
                stats: processedStats,
                timestamp: new Date().toISOString()
            })
        });

        if (backendRes.ok) {
            console.log("Successfully synced with backend!");
            return { success: true, name: menteeName };
        } else {
            return { success: false, error: "Database sync failed." };
        }

    } catch (error) {
        console.error("Sync process encountered an error:", error);
        return { success: false, error: "Network or server error." };
    }
}

// Helper to notify the mentee if their Scaler login expired during a background sync
function triggerLoginNotification() {
    chrome.notifications.create('scaler-auth-error', {
        type: 'basic',
        iconUrl: 'icon128.png', // Add a 128x128 icon to your directory, or comment this line out for testing
        title: 'TA Tracker Paused',
        message: 'Your Scaler session expired. Please log into scaler.com to resume syncing.'
    });
}

// Data Processing Logic
function calculateMenteeProgress(apiResponse) {
    const programStats = {};

    apiResponse.pastEvents.forEach(event => {
        const batchName = event.super_batch_name;
        if (!batchName) return;

        if (!programStats[batchName]) {
            programStats[batchName] = {
                subject: batchName.replace(/^SST\s+/, '').replace(/\s+202\d.*/, ''),
                totalSolved: 0,
                totalGiven: 0
            };
        }

        if (event.assignment_solved && event.assignment_solved.length === 2) {
            programStats[batchName].totalSolved += event.assignment_solved[0];
            programStats[batchName].totalGiven += event.assignment_solved[1];
        }
    });

    return Object.keys(programStats).map(batch => {
        const stats = programStats[batch];
        const percentage = stats.totalGiven > 0 
            ? ((stats.totalSolved / stats.totalGiven) * 100).toFixed(2) 
            : 0;

        return {
            program: batch,
            subject: stats.subject,
            solved: stats.totalSolved,
            total: stats.totalGiven,
            percentage: parseFloat(percentage)
        };
    });
}