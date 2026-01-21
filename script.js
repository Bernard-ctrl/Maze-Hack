(function() {
    'use strict';

    console.log('🎯 Loading Maze Hack...');

    // Global hack control
    let hackActive = true;
    let hackInterval = null;
    let lastImages = null; // Track last question to avoid multiple clicks

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

    // Function to find correct answer from qa array
    function findCorrectAnswer(currentImages) {
        if (!currentImages || currentImages.length !== 4) return null;

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
        return null;
    }

    // Function to perform auto-click
    function autoClick() {
        if (!hackActive) return;

        // Check if score is getting too high (to avoid exceeding the 79 limit for dialog)
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            const currentScore = parseInt(scoreElement.innerText) || 0;
            if (currentScore >= 79) {
                console.log('📊 Score is getting high! Stopping hack to keep score under 80 for dialog.');
                stopHack();
                return;
            }
        }

        // Check if timer has reached 2 seconds (give time for score dialog)
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const timeLeft = parseInt(timerElement.innerText) || 0;
            if (timeLeft <= 2) {
                console.log('⏰ Time\'s almost up! Stopping hack to allow score submission dialog.');
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
        console.log('🚀 Starting maze hack... (will auto-stop at timer 2)');

        // Check for new questions every 200ms
        hackInterval = setInterval(() => {
            if (!hackActive) return;

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

    // Global commands
    window.stophack = stopHack;
    window.starthack = startHack;

    // Auto-start the hack
    startHack();

    console.log('🎮 Hack loaded! Auto-stops when timer reaches 2 seconds or score reaches 79');
    console.log('📋 Available commands:');
    console.log('   stophack() - Stop the auto-hack manually');
    console.log('   starthack() - Restart the auto-hack');
    console.log('   getCurrentImages() - Get current displayed images');
    console.log('   findAnswer() - Find correct answer for current question');
    console.log('   manualClick(pos) - Manually click position 1-4');

})();