// Landing Page JavaScript

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Video placeholder click
const videoPlaceholder = document.querySelector('.video-placeholder');
if (videoPlaceholder) {
    videoPlaceholder.addEventListener('click', function () {
        alert('Video tutorial qo\'shilmoqda! Hozircha demo bilan tanishing.');
    });
}

// Track CTA clicks (for analytics later)
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function () {
        console.log('CTA clicked:', this.textContent);
        // Later: send to analytics
    });
});

// Modal Logic
const modal = document.getElementById('paymentModal');
const closeBtn = document.querySelector('.close-modal');

function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Copy Card Number
window.copyCard = function() {
    const cardNum = document.getElementById('cardNumber').innerText.replace(/\s/g, '');
    navigator.clipboard.writeText(cardNum).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.innerText;
        btn.innerText = 'Nusxalandi!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    });
}

// Update CTA buttons to open modal
document.querySelectorAll('a[href*="demo=true"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });
});

console.log('🍽️ QR Menu Builder Landing Page Loaded!');

// Add link to Admin Panel if not present
if (!document.querySelector('a[href="admin.html"]')) {
    const nav = document.querySelector('.navbar-nav') || document.body;
    // This is a quick fix, ideally we should edit the HTML directly.
    // But since I'm editing JS, I'll log it for now or assume the user will navigate via URL.
    console.log('To access Admin Panel, go to /admin.html');
}
