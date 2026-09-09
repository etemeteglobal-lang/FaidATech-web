// Main Theme & Interaction Logic
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                html.classList.add('light');
                icon.className = 'fa-solid fa-moon text-brandGreen';
                text.innerText = 'Dark';
            } else {
                html.classList.remove('light');
                html.classList.add('dark');
                icon.className = 'fa-solid fa-sun text-yellow-400';
                text.innerText = 'Light';
            }
        });
    }
});
// Dynamic Pan-African Canvas Network Nodes Animation
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("africaNetworkCanvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];

    function resize() {
        const parent = canvas.parentElement;
        width = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
        height = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    }

    window.addEventListener("resize", resize);
    resize();

    // Create Dynamic Particles
    const particleCount = Math.floor(width < 768 ? 35 : 70);
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            radius: Math.random() * 2 + 1,
            color: i % 3 === 0 ? "#00f2fe" : i % 2 === 0 ? "#10b981" : "#3b82f6"
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw Network Connection Lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${1 - dist / 130})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw Nodes
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });

        requestAnimationFrame(draw);
    }

    draw();
});
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobileMenuBtn'); // በትክክለኛው ID ተስተካክሏል
    const mobileSidebar = document.getElementById('mobileSidebar');
    const menuOverlay = document.getElementById('menuOverlay');
    const navLinks = document.querySelectorAll('#mobileSidebar nav a'); // በውስጡ ያሉ ሊንኮች

    function closeMenu() {
        if (mobileSidebar) mobileSidebar.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('open');
    }

    function openMenu() {
        if (mobileSidebar) mobileSidebar.classList.add('open');
        if (menuOverlay) menuOverlay.classList.add('open');
    }

    // የሃምበርገር አዝራሩ ሲነካ
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileSidebar && mobileSidebar.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // ከሜኑ ውጭ ያለው የቀረው 40% (Overlay) ሲነካ እንዲዘጋ
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }

    // በሜኑው ውስጥ ያለ ማንኛውም ሊንክ ሲነካ እንዲዘጋ
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
});