(function () {
    const knob = document.getElementById('knob');
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const valentineTextEl = document.getElementById('valentine-text');
    const valentineWords = ['Will', 'you', 'be', 'my', 'valentine?'];
    const songEl = document.getElementById('valentine-song');
    const heartRainEl = document.getElementById('heart-rain');

    let currentIndex = 0;
    let isDragging = false;
    let startAngle = 0;
    let startRotation = 0;
    let hasUserInteracted = false;
    let textCompleted = false;
    let songStarted = false;
    let wordStep = 0;
    let heartsStarted = false;
    let flowersShown = false;

    const rotationPerSlide = 360 / totalSlides;
    const stepsPerWord = 3; // increase this to require more turns per word
    const baseRotation = -90; // so 0° = top

    function setKnobRotation(angleDeg) {
        knob.style.transform = 'rotate(' + angleDeg + 'deg)';
    }

    function showSlide(index) {
        const previousIndex = currentIndex;
        index = ((index % totalSlides) + totalSlides) % totalSlides;
        currentIndex = index;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));

        if (valentineTextEl) {
            if (hasUserInteracted) {
                if (!textCompleted) {
                    if (index !== previousIndex) {
                        wordStep++;
                    }
                    const wordCount = Math.min(
                        Math.floor(wordStep / stepsPerWord) + 1,
                        valentineWords.length
                    );
                    const newText =
                        wordCount > 0
                            ? valentineWords.slice(0, wordCount).join(' ')
                            : '';

                    if (newText) {
                        // Fade-in effect for each new text
                        valentineTextEl.style.opacity = 0;
                        valentineTextEl.textContent = newText;
                        // Force reflow so transition restarts
                        void valentineTextEl.offsetWidth;
                        valentineTextEl.style.opacity = 1;
                    } else {
                        valentineTextEl.textContent = '';
                        valentineTextEl.style.opacity = 0;
                    }

                    if (wordCount === valentineWords.length) {
                        textCompleted = true;
                        startHeartRain();
                        showFlowers();
                    }
                } else {
                    // Once completed, keep full phrase visible
                    valentineTextEl.textContent = valentineWords.join(' ');
                    valentineTextEl.style.opacity = 1;
                }
            } else {
                valentineTextEl.textContent = '';
                valentineTextEl.style.opacity = 0;
            }
        }

        if (!isDragging) updateKnobRotation();
        knob.setAttribute('aria-valuenow', index);
    }

    function createHeart() {
        if (!heartRainEl) return;
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = '❤';

        const size = 16 + Math.random() * 18;
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = size + 'px';
        heart.style.animationDuration = 3 + Math.random() * 2 + 's';

        heartRainEl.appendChild(heart);
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    }

    function startHeartRain() {
        if (!heartRainEl || heartsStarted) return;
        heartsStarted = true;

        const durationMs = 4000;
        const intervalMs = 150;
        const intervalId = setInterval(createHeart, intervalMs);

        setTimeout(() => {
            clearInterval(intervalId);
        }, durationMs);
    }

    function showFlowers() {
        if (flowersShown) return;
        flowersShown = true;
        document.body.classList.add('flowers-visible');
    }

    function updateKnobRotation() {
        setKnobRotation(baseRotation + currentIndex * rotationPerSlide);
    }

    function getAngle(clientX, clientY) {
        const rect = knob.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        return (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    }

    function handleStart(clientX, clientY) {
        hasUserInteracted = true;
        if (songEl && !songStarted) {
            songStarted = true;
            const playPromise = songEl.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // Ignore autoplay errors; user can interact again to retry
                });
            }
        }
        isDragging = true;
        startAngle = getAngle(clientX, clientY);
        startRotation = currentIndex * rotationPerSlide;
    }

    function handleMove(clientX, clientY) {
        if (!isDragging) return;
        const angle = getAngle(clientX, clientY);
        let delta = angle - startAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        const newRotation = startRotation + delta;
        setKnobRotation(baseRotation + newRotation);
        const index = Math.round(newRotation / rotationPerSlide);
        showSlide(index);
    }

    function handleEnd() {
        if (isDragging) updateKnobRotation();
        isDragging = false;
    }

    knob.addEventListener('mousedown', function (e) {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    });

    document.addEventListener('mousemove', function (e) {
        handleMove(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', handleEnd);

    knob.addEventListener('touchstart', function (e) {
        e.preventDefault();
        const t = e.touches[0];
        handleStart(t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
        if (e.touches.length) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    document.addEventListener('touchend', handleEnd);

    knob.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            hasUserInteracted = true;
            if (songEl && !songStarted) {
                songStarted = true;
                const playPromise = songEl.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            }
            showSlide(currentIndex + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            hasUserInteracted = true;
            if (songEl && !songStarted) {
                songStarted = true;
                const playPromise = songEl.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            }
            showSlide(currentIndex - 1);
        }
    });

    showSlide(0);
})();
