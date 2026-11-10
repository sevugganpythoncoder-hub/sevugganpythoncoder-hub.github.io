// --- BACKGROUND MUSIC TOGGLE ---
const bgAudio = document.getElementById('bgAudio');
const musicToggleBtn = document.getElementById('musicToggleBtn');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        bgAudio.pause();
        musicToggleBtn.innerText = '🎵 Play Music';
        musicToggleBtn.style.borderColor = 'var(--border-color)';
        musicToggleBtn.style.color = 'var(--accent-brown)';
        isPlaying = false;
    } else {
        bgAudio.play().then(() => {
            musicToggleBtn.innerText = '⏸️ Pause Music';
            musicToggleBtn.style.borderColor = 'var(--accent-copper)';
            musicToggleBtn.style.color = 'var(--accent-copper)';
            isPlaying = true;
        }).catch(err => {
            console.log("Audio playback blocked by browser policies until direct user interaction.");
        });
    }
}

// --- 3D CANVAS NODE ENGINE ---
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let rotationX = 0;
let rotationY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        rotationY += deltaX * 0.008;
        rotationX += deltaY * 0.008;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

// GENERATE 3D MESH POINTS
const points = [];
const numPoints = 80;
for (let i = 0; i < numPoints; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = 2 * Math.PI * Math.random();
    const radius = 100 + Math.random() * 20;
    points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta)
    });
}

function project(x, y, z) {
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    // Rotate Y
    let x1 = cosY * x + sinY * z;
    let z1 = -sinY * x + cosY * z;

    // Rotate X
    let y2 = cosX * y - sinX * z1;
    let z2 = sinX * y + cosX * z1;

    const scale = 300 / (300 + z2);
    return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y2 * scale,
        scale: scale
    };
}

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    if (!isDragging) {
        rotationY += 0.004;
        rotationX += 0.002;
    }

    const projected = points.map(p => project(p.x, p.y, p.z));

    // DRAW CONNECTIONS
    ctx.strokeStyle = 'rgba(184, 98, 53, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
            const dx = projected[i].x - projected[j].x;
            const dy = projected[i].y - projected[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
                ctx.beginPath();
                ctx.moveTo(projected[i].x, projected[i].y);
                ctx.lineTo(projected[j].x, projected[j].y);
                ctx.stroke();
            }
        }
    }

    // DRAW NODES
    projected.forEach(p => {
        ctx.fillStyle = '#b86235';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --- SCROLL REVEAL & LETTER RECONSTRUCTION ANIMATION ---
const revealElements = document.querySelectorAll('.scroll-reveal');
const scrambleTargets = document.querySelectorAll('.scramble-target');
const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/abcdefghijklmnopqrstuvwxyz';

function scrambleText(element) {
    const originalText = element.dataset.original || element.innerText;
    element.dataset.original = originalText;
    let iteration = 0;
    
    clearInterval(element.interval);
    element.interval = setInterval(() => {
        element.innerText = originalText
            .split('')
            .map((letter, index) => {
                if (index < iteration) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (iteration >= originalText.length) {
            clearInterval(element.interval);
        }
        iteration += 1 / 2;
    }, 30);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const scrambles = entry.target.querySelectorAll('.scramble-target');
            scrambles.forEach(scrambleText);
            if (entry.target.classList.contains('scramble-target')) {
                scrambleText(entry.target);
            }
        }
    });
}, { threshold: 0.15 });

revealElements.forEach(el => observer.observe(el));

// --- MODAL CONTROLS ---
function openModal(title, specs) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = specs;
    document.getElementById('specModal').classList.add('active');
}

function closeModal() {
    document.getElementById('specModal').classList.remove('active');
}