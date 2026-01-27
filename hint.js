(function() {
    'use strict';

    console.log('🧭 Loading Maze Answer Hint...');

    let hintInterval = null;

    function clearHighlight() {
        for (let i = 1; i <= 4; i++) {
            const img = document.getElementById('p' + i);
            if (img) {
                img.style.outline = '';
                img.style.boxShadow = '';
            }
        }
    }

    function getCurrentImages() {
        const images = [];
        for (let i = 1; i <= 4; i++) {
            const img = document.getElementById('p' + i);
            if (img && img.src) {
                const filename = img.src.split('/').pop();
                images.push(filename);
            } else {
                return null;
            }
        }
        return images;
    }

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
            for (let i = 0; i < qa.length; i++) {
                const qaEntry = qa[i];
                const qaImages = qaEntry.slice(0, 4);

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

    function showAnswer() {
        const currentImages = getCurrentImages();
        if (!currentImages) {
            console.log('⏳ Waiting for images to load...');
            return null;
        }

        const answer = findCorrectAnswer(currentImages);
        clearHighlight();

        if (!answer || !answer.position) {
            console.warn('⚠️ Could not determine correct answer');
            return null;
        }

        const correctElementId = 'p' + answer.position;
        const element = document.getElementById(correctElementId);
        if (element) {
            element.style.outline = '4px solid #22c55e';
            element.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.9)';
            console.log('✅ Correct answer highlighted:', correctElementId);
        } else {
            console.warn('⚠️ Element not found:', correctElementId);
        }
        return answer;
    }

    function startHinting(intervalMs = 250) {
        stopHinting();
        hintInterval = setInterval(showAnswer, intervalMs);
        console.log('🟢 Hinting started');
    }

    function stopHinting() {
        if (hintInterval) {
            clearInterval(hintInterval);
            hintInterval = null;
        }
        clearHighlight();
        console.log('🔴 Hinting stopped');
    }

    // Expose commands
    window.showAnswer = showAnswer;
    window.startHinting = startHinting;
    window.stopHinting = stopHinting;

    console.log('📋 Commands: showAnswer(), startHinting(ms), stopHinting()');
})();
