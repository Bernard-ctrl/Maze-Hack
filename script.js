(function() {
    'use strict';

    console.log('🎯 Loading Maze Hack...');

    // Global hack control
    let hackActive = true;
    let hackInterval = null;
    let lastImages = null; // Track last question to avoid multiple clicks
    let lastClickAt = 0;

    // Hack settings (set to a number to enable, or null to disable)
    const hackSettings = {
        maxScore: 50,        // cap score to 50
        stopAtTimer: null,   // e.g., 2 to stop before end, null to run until time ends
        minClickDelayMs: 0 // slow scoring: minimum delay between clicks
    };

    // Set custom username for score history
    let customUsername = null;
    function setUsername(name) {
        if (typeof name === 'string' && name.trim()) {
            customUsername = name.trim();
            // In updated code, username is a local variable, not window.username
            username = customUsername;
            console.log('👤 Username set to:', username);
            return true;
        }
        console.warn('⚠️ Invalid username provided');
        return false;
    }

    // Watch for username changes and restore custom username
    function watchUsername() {
        // In updated code, check the local username variable
        if (customUsername && typeof username !== 'undefined' && username !== customUsername && username === 'unknown') {
            username = customUsername;
            console.log('🔄 Restored custom username:', customUsername);
        }
    }

    // Function to get current images displayed
    function getCurrentImages() {
        const images = [];
        for (let i = 1; i <= 4; i++) {
            const img = document.getElementById('p' + i);
            if (img && img.src) {
                // Extract filename from src URL
                const filename = img.src.split('/').pop();
                images.push(filename);
            } else {
                return null; // Not all images loaded yet
            }
        }
        return images;
    }

    // Function to find correct answer from updated code (computeAnswer/ans) or qa array (old code)
    function findCorrectAnswer(currentImages) {
        if (!currentImages || currentImages.length !== 4) return null;

        // Updated code path: use computeAnswer() which sets global `ans` ("b1".."b4")
        if (typeof computeAnswer === 'function') {
            try {
                computeAnswer();
                if (typeof ans === 'string' && ans.startsWith('b')) {
                    const position = parseInt(ans.slice(1), 10);
                    if (position >= 1 && position <= 4) {
                        return {
                            position,
                            images: currentImages,
                            ans
                        };
                    }
                }
            } catch (e) {
                // Fall through to legacy qa[] matching
            }
        }

        // Fallback to qa array (old code compatibility)
        if (typeof qa !== 'undefined' && Array.isArray(qa)) {
            // Search through qa array for exact match (including order)
            for (let i = 0; i < qa.length; i++) {
                const qaEntry = qa[i];
                const qaImages = qaEntry.slice(0, 4);

                // Check exact match including order
                let isExactMatch = true;
                for (let j = 0; j < 4; j++) {
                    if (currentImages[j] !== qaImages[j]) {
                        isExactMatch = false;
                        break;
                    }
                }

                if (isExactMatch) {
                    return {
                        position: parseInt(qaEntry[4]),
                        images: qaImages,
                        index: i
                    };
                }
            }
        }

        return null;
    }

    // Function to perform auto-click
    function autoClick() {
        if (!hackActive) return;

        // Optional score cap (disabled by default for updated code)
        const scoreElement = document.getElementById('score');
        if (scoreElement && typeof hackSettings.maxScore === 'number') {
            const currentScore = parseInt(scoreElement.innerText) || 0;
            if (currentScore >= hackSettings.maxScore) {
                console.log('📊 Score cap reached. Stopping hack at:', hackSettings.maxScore);
                stopHack();
                return;
            }
        }

        // Optional timer stop (disabled by default for updated code)
        const timerElement = document.getElementById('timer');
        if (timerElement && typeof hackSettings.stopAtTimer === 'number') {
            const timeLeft = parseInt(timerElement.innerText) || 0;
            if (timeLeft <= hackSettings.stopAtTimer) {
                console.log('⏰ Timer threshold reached. Stopping hack at:', hackSettings.stopAtTimer, 'seconds');
                stopHack();
                return;
            }
        }

        try {
            const currentImages = getCurrentImages();
            if (!currentImages) {
                console.log('⏳ Waiting for images to load...');
                return;
            }

            // Throttle click rate to slow scoring
            if (typeof hackSettings.minClickDelayMs === 'number') {
                const now = Date.now();
                if (now - lastClickAt < hackSettings.minClickDelayMs) {
                    return;
                }
            }

            // Only click if this is a new question (images changed)
            const imagesChanged = !lastImages || 
                currentImages.some((img, index) => img !== lastImages[index]);
            
            if (!imagesChanged) {
                return; // Same question, don't click again
            }

            lastImages = currentImages; // Update last images

            const answer = findCorrectAnswer(currentImages);
            if (!answer) {
                console.warn('⚠️ Could not find matching question in qa array');
                return;
            }

            const correctElementId = 'p' + answer.position;
            const element = document.getElementById(correctElementId);

            if (element) {
                element.click();
                lastClickAt = Date.now();
                console.log('✅ Auto-clicked:', correctElementId, '(correct answer position:', answer.position, ')');
                console.log('📸 Images:', currentImages.join(', '));
            } else {
                console.warn('⚠️ Element not found:', correctElementId);
            }
        } catch (e) {
            console.warn('⚠️ Error during auto-click:', e.message);
        }
    }

    // Start the hack
    function startHack() {
        if (hackInterval) {
            clearInterval(hackInterval);
        }

        hackActive = true;
        lastImages = null; // Reset for new game
        console.log('🚀 Starting maze hack... (slow scoring, cap at 50)');

        // Check for new questions every 200ms
        hackInterval = setInterval(() => {
            if (!hackActive) return;

            // Watch and restore custom username if needed
            watchUsername();

            // Check if images have changed (new question)
            const currentImages = getCurrentImages();
            if (currentImages) {
                autoClick();
            }
        }, 200);
    }

    // Stop the hack
    function stopHack() {
        hackActive = false;
        if (hackInterval) {
            clearInterval(hackInterval);
            hackInterval = null;
        }
        lastImages = null; // Reset
        console.log('🛑 Hack stopped');
    }

    // Manual control functions
    window.getCurrentImages = getCurrentImages;
    window.findAnswer = () => {
        const images = getCurrentImages();
        return images ? findCorrectAnswer(images) : null;
    };
    window.manualClick = (pos) => {
        const element = document.getElementById('p' + pos);
        if (element) {
            element.click();
            console.log('🖱️ Manual click on p' + pos);
        }
    };
    window.setUsername = setUsername;

    // Global commands
    window.stophack = stopHack;
    window.starthack = startHack;

    // Auto-start the hack
    startHack();

    console.log('🎮 Hack loaded! Auto-stops when timer reaches 2 seconds or score reaches 50');
    console.log('👤 Username protection active - custom names will be preserved (works with updated code)');
    console.log('�📋 Available commands:');
    console.log('   stophack() - Stop the auto-hack manually');
    console.log('   starthack() - Restart the auto-hack');
    console.log('   setUsername("YourName") - Set username for score history');
    console.log('   getCurrentImages() - Get current displayed images');
    console.log('   findAnswer() - Find correct answer for current question');
    console.log('   manualClick(pos) - Manually click position 1-4');

})();