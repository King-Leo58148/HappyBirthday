// ============ Password gate ============
(function lockModule() {
  // This is a SHA-256 hash of the password — NOT the password itself.
  // Change PASSWORD_HASH by generating a new hash for your chosen password
  // (see README for the one-line command), then paste it below.
  const PASSWORD_HASH = "290b543a933953be9bceb003b0248f2538067634f08b6f9666fa9ac193a4306c"; // placeholder for "CHANGE-ME"

  const lockScreen = document.getElementById('lock-screen');
  const lockCard = document.getElementById('lock-card');
  const siteContent = document.getElementById('site-content');
  const lockForm = document.getElementById('lock-form');
  const lockInput = document.getElementById('lock-input');
  const lockError = document.getElementById('lock-error');

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function unlock() {
    lockScreen.style.display = 'none';
    siteContent.hidden = false;
    sessionStorage.setItem('sandra_unlocked', '1');
    // Kick off canvas sizing now that content is visible
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
  }

  // Stay unlocked for the rest of this browser tab/session
  if (sessionStorage.getItem('sandra_unlocked') === '1') {
    unlock();
  }

  lockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const entered = await sha256(lockInput.value.trim());
    if (entered === PASSWORD_HASH) {
      unlock();
    } else {
      lockError.classList.add('show');
      lockCard.classList.add('shake');
      lockInput.value = '';
      lockInput.focus();
      setTimeout(() => lockCard.classList.remove('shake'), 400);
    }
  });
})();

// ============ Starfield background ============
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.body.scrollHeight;
  initStars();
}

function initStars() {
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.3 + 0.3,
    baseAlpha: Math.random() * 0.5 + 0.3,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245,237,228,${Math.max(0, alpha)})`;
    ctx.fill();
  }
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
  resizeCanvas();
  requestAnimationFrame(drawStars);
});
// Re-check height after content settles (images loading, etc.)
setTimeout(resizeCanvas, 800);

// ============ Scroll reveal for gallery ============
const revealItems = document.querySelectorAll('.gallery-item');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealItems.forEach((item) => io.observe(item));

// ============ Scroll cue ============
document.getElementById('scroll-cue').addEventListener('click', () => {
  document.getElementById('same-sky').scrollIntoView({ behavior: 'smooth' });
});

// ============ Draggable moon + sky notes ============
const moon = document.getElementById('moon');
const skyStage = document.getElementById('sky-stage');
let isDragging = false;

function startDrag(e) {
  isDragging = true;
  moon.style.transition = 'none';
}
function endDrag() {
  isDragging = false;
  moon.style.transition = 'filter 0.3s ease';
}
function moveMoon(clientX, clientY) {
  if (!isDragging) return;
  const rect = skyStage.getBoundingClientRect();
  let x = clientX - rect.left;
  let y = clientY - rect.top;
  x = Math.max(20, Math.min(rect.width - 20, x));
  y = Math.max(20, Math.min(rect.height - 20, y));
  moon.style.left = x + 'px';
  moon.style.top = y + 'px';
}

moon.addEventListener('mousedown', startDrag);
window.addEventListener('mouseup', endDrag);
window.addEventListener('mousemove', (e) => moveMoon(e.clientX, e.clientY));

moon.addEventListener('touchstart', startDrag, { passive: true });
window.addEventListener('touchend', endDrag);
window.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches[0]) {
    moveMoon(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

// Keyboard support for moon
moon.addEventListener('keydown', (e) => {
  const rect = skyStage.getBoundingClientRect();
  const cur = moon.getBoundingClientRect();
  let x = cur.left - rect.left + cur.width / 2;
  let y = cur.top - rect.top + cur.height / 2;
  const step = 18;
  if (e.key === 'ArrowLeft') x -= step;
  if (e.key === 'ArrowRight') x += step;
  if (e.key === 'ArrowUp') y -= step;
  if (e.key === 'ArrowDown') y += step;
  moon.style.left = x + 'px';
  moon.style.top = y + 'px';
});

// Sky notes click-to-reveal
let activePopup = null;
document.querySelectorAll('.sky-note').forEach((note) => {
  note.setAttribute('tabindex', '0');
  note.setAttribute('role', 'button');
  note.setAttribute('aria-label', 'Reveal a note');

  const reveal = () => {
    if (activePopup) activePopup.remove();
    note.classList.add('opened');
    const popup = document.createElement('div');
    popup.className = 'note-popup';
    popup.textContent = note.dataset.note;

    const noteLeft = parseFloat(note.style.left);
    popup.style.left = (noteLeft > 55 ? Math.max(5, noteLeft - 30) : noteLeft) + '%';
    popup.style.top = note.style.top;

    skyStage.appendChild(popup);
    activePopup = popup;

    setTimeout(() => {
      if (activePopup === popup) {
        popup.remove();
        activePopup = null;
      }
    }, 5000);
  };

  note.addEventListener('click', reveal);
  note.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      reveal();
    }
  });
});

// ============ Constellation of Us ============
const constellationData = [
  { x: 80, y: 300, label: "We found each other from miles apart." },
  { x: 220, y: 150, label: "The late-night calls that turned into our favorite part of the day." },
  { x: 380, y: 260, label: "Learning each other — the laughs, the little fights, the making up." },
  { x: 540, y: 120, label: "Becoming each other's safe place, even through a screen." },
  { x: 700, y: 240, label: "Still here, still choosing each other. Happy birthday, my love." }
];

const svgStars = document.getElementById('const-stars');
const constLine = document.getElementById('const-line');
const constText = document.getElementById('const-text');

let pathStr = `M ${constellationData[0].x} ${constellationData[0].y} `;
constellationData.forEach((pt, i) => {
  if (i > 0) pathStr += `L ${pt.x} ${pt.y} `;
});
constLine.setAttribute('d', pathStr);

constellationData.forEach((pt, i) => {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', pt.x);
  circle.setAttribute('cy', pt.y);
  circle.setAttribute('r', 7);
  circle.setAttribute('tabindex', '0');
  circle.setAttribute('role', 'button');
  circle.setAttribute('aria-label', `Memory ${i + 1}`);
  circle.dataset.label = pt.label;

  const activate = () => {
    document.querySelectorAll('#const-stars circle').forEach((c) => c.classList.remove('active'));
    circle.classList.add('active');
    constText.style.opacity = 0;
    setTimeout(() => {
      constText.textContent = pt.label;
      constText.style.opacity = 1;
    }, 150);
  };

  circle.addEventListener('click', activate);
  circle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });

  svgStars.appendChild(circle);
});

// ============ Envelope / Letter ============
const envelope = document.getElementById('envelope');
const envelopeLabel = document.getElementById('envelope-label');
const letterPaper = document.getElementById('letter-paper');

envelope.addEventListener('click', () => {
  const isOpen = envelope.classList.toggle('open');
  letterPaper.classList.toggle('open', isOpen);
  envelopeLabel.textContent = isOpen ? 'tap to close' : 'tap to open';
  if (isOpen) {
    setTimeout(() => {
      letterPaper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
});
envelope.setAttribute('tabindex', '0');
envelope.setAttribute('role', 'button');
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    envelope.click();
  }
});

// ============ Sound toggle ============
// NOTE: No audio file is bundled. This toggles an icon state only.
// To add real music, drop an mp3 at audio/song.mp3 and uncomment the Audio lines below.
const soundBtn = document.getElementById('sound-toggle');
const iconMuted = document.getElementById('icon-muted');
const iconPlaying = document.getElementById('icon-playing');
let playing = false;
// const bgAudio = new Audio('audio/song.mp3');
// bgAudio.loop = true;

soundBtn.addEventListener('click', () => {
  playing = !playing;
  iconMuted.style.display = playing ? 'none' : 'block';
  iconPlaying.style.display = playing ? 'block' : 'none';
  // if (playing) { bgAudio.play(); } else { bgAudio.pause(); }
});

// ============ Birthday Cake: candles, blow-out, confetti ============
(function cakeModule() {
  const candleGroup = document.getElementById('candles');
  const sprinkleGroup = document.getElementById('sprinkles');
  const micBtn = document.getElementById('mic-btn');
  const micStatus = document.getElementById('mic-status');
  const confettiLayer = document.getElementById('confetti-layer');
  const cakeSection = document.getElementById('cake-section');
  const instruction = document.getElementById('cake-instruction');

  if (!candleGroup) return; // section not present, bail safely

  const CANDLE_COUNT = 5;
  const candleXs = [200 - 64, 200 - 32, 200, 200 + 32, 200 + 64];
  let litCount = CANDLE_COUNT;

  // Build candles + flames
  candleXs.forEach((x, i) => {
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.classList.add('candle');
    g.dataset.index = i;
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `Candle ${i + 1}, tap to blow out`);

    const stick = document.createElementNS(ns, 'rect');
    stick.setAttribute('x', x - 4);
    stick.setAttribute('y', 70);
    stick.setAttribute('width', 8);
    stick.setAttribute('height', 35);
    stick.setAttribute('rx', 2);
    stick.setAttribute('fill', i % 2 === 0 ? '#FFF6EC' : '#F2A6D8');
    g.appendChild(stick);

    const flame = document.createElementNS(ns, 'ellipse');
    flame.classList.add('flame');
    flame.dataset.flame = i;
    flame.setAttribute('cx', x);
    flame.setAttribute('cy', 60);
    flame.setAttribute('rx', 6);
    flame.setAttribute('ry', 11);
    flame.setAttribute('fill', '#FFC857');
    flame.style.animationDelay = (i * 0.13) + 's';
    g.appendChild(flame);

    const flameInner = document.createElementNS(ns, 'ellipse');
    flameInner.classList.add('flame');
    flameInner.dataset.flame = i;
    flameInner.setAttribute('cx', x);
    flameInner.setAttribute('cy', 63);
    flameInner.setAttribute('rx', 3);
    flameInner.setAttribute('ry', 6);
    flameInner.setAttribute('fill', '#FF6F61');
    flameInner.style.animationDelay = (i * 0.13) + 's';
    g.appendChild(flameInner);

    const smoke = document.createElementNS(ns, 'ellipse');
    smoke.classList.add('smoke');
    smoke.dataset.smoke = i;
    smoke.setAttribute('cx', x);
    smoke.setAttribute('cy', 55);
    smoke.setAttribute('rx', 4);
    smoke.setAttribute('ry', 8);
    smoke.setAttribute('fill', '#cfc4b8');
    g.appendChild(smoke);

    g.addEventListener('click', () => blowOutCandle(i));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blowOutCandle(i); }
    });

    candleGroup.appendChild(g);
  });

  // Sprinkles (decorative)
  const sprinkleColors = ['#FFC857', '#F2A6D8', '#FFF6EC', '#FF6F61'];
  for (let i = 0; i < 22; i++) {
    const ns = 'http://www.w3.org/2000/svg';
    const r = document.createElementNS(ns, 'rect');
    const x = 100 + Math.random() * 200;
    const y = 160 + Math.random() * 40;
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', 4);
    r.setAttribute('height', 2);
    r.setAttribute('rx', 1);
    r.setAttribute('fill', sprinkleColors[i % sprinkleColors.length]);
    r.setAttribute('transform', `rotate(${Math.random() * 360} ${x} ${y})`);
    sprinkleGroup.appendChild(r);
  }

  function blowOutCandle(i) {
    const flames = candleGroup.querySelectorAll(`[data-flame="${i}"]`);
    const smoke = candleGroup.querySelector(`[data-smoke="${i}"]`);
    let wasLit = false;
    flames.forEach((f) => {
      if (!f.classList.contains('out')) wasLit = true;
      f.classList.add('out');
    });
    if (wasLit) {
      litCount -= 1;
      if (smoke) {
        smoke.classList.remove('rising');
        void smoke.offsetWidth; // restart animation
        smoke.classList.add('rising');
      }
      checkAllOut();
    }
  }

  function checkAllOut() {
    if (litCount <= 0) {
      celebrate();
    }
  }

  function celebrate() {
    micBtn.disabled = true;
    micBtn.classList.remove('listening');
    micStatus.textContent = '🎉 wish made!';
    instruction.textContent = "Happiest birthday, Sandra. I hope every wish comes true. 🩷";
    launchConfetti();
    stopMic();
  }

  function launchConfetti() {
    const colors = ['#FFC857', '#F2A6D8', '#FF6F61', '#C2347D', '#FFF6EC'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetto';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      piece.style.animationDelay = (Math.random() * 0.5) + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confettiLayer.appendChild(piece);
      setTimeout(() => piece.remove(), 3500);
    }
  }

  // ---------- Mic-based blow detection ----------
  let audioCtx, analyser, micStream, rafId;
  let blowStartTime = null;
  const BLOW_THRESHOLD = 0.12;   // relative volume level to count as "blowing"
  const BLOW_SUSTAIN_MS = 250;   // must sustain past threshold to avoid false positives from taps/pops

  async function startMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micStatus.textContent = "Mic not supported here — tap the candles instead 🕯️";
      return;
    }
    try {
      micStatus.textContent = 'listening...';
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      micBtn.textContent = '🎤 listening… blow now';
      micBtn.classList.add('listening');
      sampleVolume();
    } catch (err) {
      micStatus.textContent = "Couldn't access mic — tap the candles instead 🕯️";
    }
  }

  function sampleVolume() {
    if (!analyser || litCount <= 0) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);

    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / data.length);

    if (rms > BLOW_THRESHOLD) {
      if (blowStartTime === null) blowStartTime = performance.now();
      const sustained = performance.now() - blowStartTime;
      if (sustained > BLOW_SUSTAIN_MS) {
        // blow out next lit candle
        const nextLit = candleXs.findIndex((_, idx) => {
          const f = candleGroup.querySelector(`[data-flame="${idx}"]`);
          return f && !f.classList.contains('out');
        });
        if (nextLit !== -1) blowOutCandle(nextLit);
        blowStartTime = null;
      }
    } else {
      blowStartTime = null;
    }

    if (litCount > 0) {
      rafId = requestAnimationFrame(sampleVolume);
    }
  }

  function stopMic() {
    if (rafId) cancelAnimationFrame(rafId);
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    micBtn.classList.remove('listening');
  }

  micBtn.addEventListener('click', () => {
    if (litCount <= 0) return;
    startMic();
  });

  // Stop mic if user scrolls away mid-listen (saves battery/privacy)
  const cakeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && audioCtx) {
        stopMic();
        if (litCount > 0) {
          micBtn.textContent = '🎤 blow into your mic';
          micStatus.textContent = '';
        }
      }
    });
  }, { threshold: 0 });
  cakeObserver.observe(cakeSection);
})();
