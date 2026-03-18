/* script.js — Cosmos Portfolio */
(function () {
  'use strict';

  // ===== initStarfield =====
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const STAR_COUNT = 320;
    const COLORS = ['#ffffff', '#cce8ff', '#fff4cc', '#b3d9ff', '#ffe680'];
    let stars = [];
    let meteors = [];
    let scrollY = 0;
    let mouseX = 0, mouseY = 0;
    let animId;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    function createStar() {
      return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     randomBetween(0.3, 2.2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: randomBetween(0.02, 0.08),
        phase: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3) + 1,
      };
    }

    function createMeteor() {
      return {
        x:     randomBetween(canvas.width * 0.2, canvas.width),
        y:     randomBetween(0, canvas.height * 0.4),
        len:   randomBetween(80, 180),
        speed: randomBetween(6, 12),
        angle: Math.PI / 5,
        alpha: 1,
        life:  1,
      };
    }

    function initStars() {
      stars = Array.from({ length: STAR_COUNT }, createStar);
    }

    function drawStar(s, t) {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed * 3 + s.phase);
      // Parallax: scroll + subtle mouse offset
      const parallaxOffset = (scrollY * s.layer * 0.04) % canvas.height;
      const mx = (mouseX / canvas.width  - 0.5) * s.layer * 6;
      const my = (mouseY / canvas.height - 0.5) * s.layer * 6;
      const y = (s.y - parallaxOffset + canvas.height + my) % canvas.height;
      const x = (s.x + mx + canvas.width) % canvas.width;

      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.4 + 0.6 * twinkle;
      ctx.fill();
    }

    function drawMeteor(m) {
      const dx = Math.cos(m.angle) * m.len * m.life;
      const dy = Math.sin(m.angle) * m.len * m.life;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - dx, m.y - dy);
      grad.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
      grad.addColorStop(0.3, `rgba(200,230,255,${m.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(200,230,255,0)');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - dx, m.y - dy);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = m.alpha;
      ctx.stroke();
    }

    let lastMeteor = 0;
    let t = 0;

    function animate(ts) {
      t = ts * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      stars.forEach(s => drawStar(s, t));

      // Spawn meteor every ~2.5s
      if (t - lastMeteor > 2.5) {
        meteors.push(createMeteor());
        lastMeteor = t;
      }

      meteors = meteors.filter(m => m.alpha > 0.01);
      meteors.forEach(m => {
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.018;
        drawMeteor(m);
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); initStars(); });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

    resize();
    initStars();
    animId = requestAnimationFrame(animate);
  }

  // ===== initTypewriter =====
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
      'Full Stack Developer',
      'Problem Solver',
      'Distributed Systems Builder',
      'Open Source Contributor',
    ];

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let paused    = false;

    function tick() {
      const phrase = phrases[phraseIdx];

      if (paused) {
        paused = false;
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }

      if (!deleting) {
        el.textContent = phrase.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === phrase.length) {
          paused = true;
          setTimeout(tick, 2000);
          return;
        }
        setTimeout(tick, 80);
      } else {
        el.textContent = phrase.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 40);
      }
    }

    setTimeout(tick, 600);
  }

  // ===== initScrollReveal =====
  function initScrollReveal() {
    const targets = document.querySelectorAll('.project-card, .skill-card, .stat');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblings = Array.from(el.parentElement.children);
          const idx = siblings.indexOf(el);
          el.style.transitionDelay = `${idx * 0.1}s`;
          el.classList.add('visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(el => observer.observe(el));
  }

  // ===== initParallax =====
  function initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;

    function onScroll() {
      const sy = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translateY(${sy * speed}px)`;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== initCardTilt =====
  function initCardTilt() {
    const cards = document.querySelectorAll('.project-card, .skill-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `translateY(-6px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease';
        setTimeout(() => { card.style.transition = ''; }, 400);
      });
    });
  }

  // ===== initNav =====
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 60);

      // Highlight active nav link
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ===== initScrollProgress =====
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = `${pct}%`;
    }, { passive: true });
  }

  // ===== Footer year =====
  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initTypewriter();
    initScrollReveal();
    initParallax();
    initCardTilt();
    initNav();
    initScrollProgress();
    initYear();
  });

})();
