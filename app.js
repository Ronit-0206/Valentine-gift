/* ==========================================================================
   ROMANTIC VALENTINE PROPOSAL — INTERACTIVE SCRIPT (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const balloonCanvas = document.getElementById('balloon-canvas');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const balloonCtx = balloonCanvas.getContext('2d');
  const confettiCtx = confettiCanvas.getContext('2d');

  const proposalCard = document.getElementById('proposal-card');
  const successCard = document.getElementById('success-card');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');

  const displayTitle = document.getElementById('display-title');
  const displaySubtitle = document.getElementById('display-subtitle');
  const successTitle = document.getElementById('success-title');
  const successSubtext = document.getElementById('success-subtext');
  const dodgeTooltip = document.getElementById('dodge-tooltip');
  const dodgeMsg = document.getElementById('dodge-msg');

  const resHotel = document.getElementById('res-hotel');
  const resTime = document.getElementById('res-time');
  const resNote = document.getElementById('res-note');
  const polaroidGrid = document.getElementById('polaroid-grid');
  const photoGallerySection = document.getElementById('photo-gallery-section');

  // Top Bar & Controls
  const btnMusic = document.getElementById('btn-music');
  const musicIcon = document.getElementById('music-icon');
  const btnOpenSendCard = document.getElementById('btn-open-send-card');
  const btnCreateInvitationTop = document.getElementById('btn-create-invitation-top');
  const btnCreateInvitationFooter = document.getElementById('btn-create-invitation-footer');

  // Modals
  const customizerModal = document.getElementById('customizer-modal');
  const sendModal = document.getElementById('send-modal');
  const enterCodeModal = document.getElementById('enter-code-modal');

  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCloseSendModal = document.getElementById('btn-close-send-modal');
  const btnCloseCodeModal = document.getElementById('btn-close-code-modal');

  const btnSaveCustom = document.getElementById('btn-save-custom');
  const btnEditFromSend = document.getElementById('btn-edit-from-send');

  // Share Input & QR Elements
  const generatedSecretCode = document.getElementById('generated-secret-code');
  const btnCopyDirectLink = document.getElementById('btn-copy-direct-link');
  const btnCopyCodeOnly = document.getElementById('btn-copy-code-only');
  const btnRegenCode = document.getElementById('btn-regen-code');
  const btnWhatsappCode = document.getElementById('btn-whatsapp-code');
  const btnToggleQr = document.getElementById('btn-toggle-qr');
  const qrCodeContainer = document.getElementById('qr-code-container');
  const qrCodeImg = document.getElementById('qr-code-img');

  // Form Inputs & Photo Upload
  const inputName = document.getElementById('input-name');
  const inputHotel = document.getElementById('input-hotel');
  const inputTime = document.getElementById('input-time');
  const inputNote = document.getElementById('input-note');
  const inputPhotos = document.getElementById('input-photos');
  const photoPreviewContainer = document.getElementById('photo-preview-container');

  const inputPasscode = document.getElementById('input-passcode');
  const btnApplyPasscode = document.getElementById('btn-apply-passcode');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // State Management
  let soundEnabled = true;
  let dodgeCount = 0;
  let yesScale = 1;
  let audioCtx = null;
  let currentSecretCode = 'LOVE-2026';
  let isNoBtnDetached = false;

  const appData = {
    name: '',
    hotel: 'The Royal Grand Hotel & Lounge',
    time: '7:30 PM Today',
    note: "Dress up gorgeous! I can't wait to see your cute smile today. 🥂🌹",
    photos: []
  };

  const dodgePhrases = [
    "Nice try! 😜",
    "You can't catch me! 🏃‍♂️",
    "Wrong choice! 💔",
    "Think again! 🥺",
    "Just click YES! 🥰",
    "Nope! 🤪",
    "Never! 💘",
    "YES is right there! 👉",
    "Stop chasing me! 💖",
    "Resistance is futile! 😘"
  ];

  /* ==========================================================================
     1. PHOTO UPLOAD & PREVIEW SYSTEM
     ========================================================================== */
  if (inputPhotos) {
    inputPhotos.addEventListener('change', (e) => {
      const files = Array.from(e.target.files).slice(0, 4);
      appData.photos = [];
      photoPreviewContainer.innerHTML = '';

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          appData.photos.push(dataUrl);

          const img = document.createElement('img');
          img.src = dataUrl;
          img.className = 'preview-thumb';
          photoPreviewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  /* ==========================================================================
     2. CANVAS FLOATING HEART BALLOONS ENGINE
     ========================================================================== */
  function resizeCanvases() {
    balloonCanvas.width = window.innerWidth;
    balloonCanvas.height = window.innerHeight;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  class HeartBalloon {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * balloonCanvas.width;
      this.y = initial ? Math.random() * balloonCanvas.height : balloonCanvas.height + 50 + Math.random() * 100;
      this.size = Math.random() * 18 + 16;
      this.speed = Math.random() * 1.2 + 0.8;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.swayAmplitude = Math.random() * 25 + 10;
      this.phase = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.45 + 0.45;
      
      const colors = ['#ff0054', '#ff2a7a', '#ff4d8d', '#e60067', '#ff70a6', '#ffd166'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y -= this.speed;
      this.phase += this.swaySpeed;
      this.currentX = this.x + Math.sin(this.phase) * this.swayAmplitude;
      if (this.y < -80) this.reset(false);
    }

    draw() {
      balloonCtx.save();
      balloonCtx.translate(this.currentX, this.y);
      balloonCtx.globalAlpha = this.opacity;

      balloonCtx.beginPath();
      balloonCtx.moveTo(0, this.size);
      const stringSway = Math.sin(this.phase * 2) * 6;
      balloonCtx.quadraticCurveTo(stringSway, this.size + 20, 0, this.size + 40);
      balloonCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      balloonCtx.lineWidth = 1.5;
      balloonCtx.stroke();

      balloonCtx.beginPath();
      const topCurveHeight = this.size * 0.3;
      balloonCtx.moveTo(0, topCurveHeight);
      balloonCtx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, topCurveHeight, 0, this.size);
      balloonCtx.bezierCurveTo(this.size, topCurveHeight, this.size / 2, -this.size / 2, 0, topCurveHeight);
      balloonCtx.fillStyle = this.color;
      balloonCtx.fill();

      balloonCtx.beginPath();
      balloonCtx.ellipse(-this.size * 0.35, -this.size * 0.1, this.size * 0.15, this.size * 0.08, Math.PI / 4, 0, Math.PI * 2);
      balloonCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      balloonCtx.fill();

      balloonCtx.restore();
    }
  }

  const balloonCount = window.innerWidth < 600 ? 18 : 28;
  const balloons = Array.from({ length: balloonCount }, () => new HeartBalloon());
  
  function animateBalloons() {
    balloonCtx.clearRect(0, 0, balloonCanvas.width, balloonCanvas.height);
    balloons.forEach(b => { b.update(); b.draw(); });
    requestAnimationFrame(animateBalloons);
  }
  animateBalloons();

  /* ==========================================================================
     3. CONFETTI HEART BURST
     ========================================================================== */
  class HeartConfetti {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 10 + 3;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - Math.random() * 4;
      this.gravity = 0.22;
      this.drag = 0.96;
      this.size = Math.random() * 12 + 8;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.2;
      this.opacity = 1;
      
      const colors = ['#ff0054', '#ff2a7a', '#ffd166', '#ffffff', '#ff70a6', '#ff4d8d'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.opacity -= 0.01;
    }

    draw() {
      if (this.opacity <= 0) return;
      confettiCtx.save();
      confettiCtx.translate(this.x, this.y);
      confettiCtx.rotate(this.rotation);
      confettiCtx.globalAlpha = Math.max(0, this.opacity);

      confettiCtx.beginPath();
      const s = this.size;
      confettiCtx.moveTo(0, s * 0.3);
      confettiCtx.bezierCurveTo(-s / 2, -s / 2, -s, s * 0.3, 0, s);
      confettiCtx.bezierCurveTo(s, s * 0.3, s / 2, -s / 2, 0, s * 0.3);
      confettiCtx.fillStyle = this.color;
      confettiCtx.fill();

      confettiCtx.restore();
    }
  }

  let confettiParticles = [];
  let isConfettiActive = false;

  function triggerHeartBurst() {
    confettiParticles = Array.from({ length: 100 }, () => new HeartConfetti(window.innerWidth / 2, window.innerHeight / 2));
    isConfettiActive = true;
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    if (isConfettiActive) {
      confettiParticles.forEach(p => { p.update(); p.draw(); });
      confettiParticles = confettiParticles.filter(p => p.opacity > 0);
    }
    requestAnimationFrame(animateConfetti);
  }
  animateConfetti();

  /* ==========================================================================
     4. HIGH-FIDELITY REFINED AUDIO SYNTHESIZER
     ========================================================================== */
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  window.addEventListener('pointerdown', initAudio, { once: true });
  window.addEventListener('touchstart', initAudio, { once: true });
  window.addEventListener('click', initAudio, { once: true });

  function playPopSound() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.07);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      const echoOsc = audioCtx.createOscillator();
      const echoGain = audioCtx.createGain();
      echoOsc.type = 'sine';
      echoOsc.frequency.setValueAtTime(680, now + 0.02);
      echoOsc.frequency.exponentialRampToValueAtTime(1280, now + 0.09);
      echoGain.gain.setValueAtTime(0.12, now + 0.02);
      echoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      echoOsc.connect(echoGain);
      echoGain.connect(audioCtx.destination);
      echoOsc.start(now + 0.02);
      echoOsc.stop(now + 0.1);
    } catch (e) {}
  }

  function playCelebrationFanfare() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, duration: 0.4 },     // C5
        { freq: 659.25, time: 0.09, duration: 0.4 },  // E5
        { freq: 783.99, time: 0.18, duration: 0.4 },  // G5
        { freq: 987.77, time: 0.27, duration: 0.5 },  // B5
        { freq: 1046.50, time: 0.38, duration: 0.8 }, // C6
        { freq: 1318.51, time: 0.52, duration: 1.2 }  // E6
      ];

      notes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0, now + note.time);
        gain.gain.linearRampToValueAtTime(0.35, now + note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.duration);
      });
    } catch (e) {}
  }

  btnMusic.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    musicIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    showToast(soundEnabled ? 'Sound unmuted 🎵' : 'Sound muted 🔇');
    if (soundEnabled) playPopSound();
  });

  /* ==========================================================================
     5. ROOT-LEVEL FIXED DODGING ("NO" BUTTON NEVER GOES OUTSIDE SCREEN)
     ========================================================================== */
  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    playPopSound();
    dodgeCount++;

    if (!isNoBtnDetached) {
      const initialRect = btnNo.getBoundingClientRect();
      document.body.appendChild(btnNo);
      btnNo.style.position = 'fixed';
      btnNo.style.left = `${initialRect.left}px`;
      btnNo.style.top = `${initialRect.top}px`;
      btnNo.classList.add('dodging');
      isNoBtnDetached = true;
      void btnNo.offsetHeight;
    }

    const btnRect = btnNo.getBoundingClientRect();
    const btnWidth = btnRect.width || 100;
    const btnHeight = btnRect.height || 48;

    const paddingX = 20;
    const topMargin = 60;
    const bottomMargin = 25;

    const minX = paddingX;
    const maxX = Math.max(minX, window.innerWidth - btnWidth - paddingX);
    
    const minY = topMargin;
    const maxY = Math.max(minY, window.innerHeight - btnHeight - bottomMargin);

    const newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const newY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    btnNo.style.left = `${newX}px`;
    btnNo.style.top = `${newY}px`;

    dodgeMsg.textContent = dodgePhrases[(dodgeCount - 1) % dodgePhrases.length];
    dodgeTooltip.classList.remove('hidden');

    yesScale = Math.min(1.6, 1 + dodgeCount * 0.06);
    btnYes.style.transform = `scale(${yesScale})`;
  }

  ['mouseenter', 'mouseover', 'touchstart', 'pointerdown'].forEach(evt => {
    btnNo.addEventListener(evt, dodgeNoButton, { passive: false });
  });

  /* ==========================================================================
     6. CLICKING YES OPENS THE "ENTER SECRET PASSCODE" MODAL WINDOW
     ========================================================================== */
  btnYes.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    playPopSound();
    openEnterCodeModal();
  });

  function revealCelebrationCard() {
    playCelebrationFanfare();
    triggerHeartBurst();

    proposalCard.classList.remove('active');
    proposalCard.classList.add('hidden');
    dodgeTooltip.classList.add('hidden');
    if (btnNo) btnNo.style.display = 'none';

    balloons.forEach(b => b.speed *= 2.5);

    setTimeout(() => {
      successCard.classList.remove('hidden');
      setTimeout(() => successCard.classList.add('active'), 50);
    }, 350);
  }

  /* ==========================================================================
     7. CREATE INVITATION, QR CODE GENERATOR & MODAL MANAGEMENT
     ========================================================================== */
  function disableBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  function enableBodyScroll() {
    document.body.style.overflow = 'auto';
  }

  function generateRandomCode() {
    const prefix = appData.name ? appData.name.substring(0, 4).toUpperCase() : 'LOVE';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    currentSecretCode = `${prefix}-${randNum}`;
    if (generatedSecretCode) generatedSecretCode.textContent = currentSecretCode;

    localStorage.setItem(`val_code_${currentSecretCode}`, JSON.stringify(appData));
    updateSendModalData();
  }

  function getBaseUrl() {
    const loc = window.location;
    return `${loc.protocol}//${loc.host}${loc.pathname}`;
  }

  function updateSendModalData() {
    const partnerGreeting = appData.name ? `Hey ${appData.name}! 💖` : `Hey sweetheart! 💖`;
    const siteUrl = getBaseUrl();
    
    const whatsappMsg = `${partnerGreeting} I created a secret romantic surprise for you! ✨\n\nYour Secret Passcode: *${currentSecretCode}*\nOpen link & enter code: ${siteUrl}`;
    
    if (btnWhatsappCode) {
      btnWhatsappCode.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`;
    }

    if (qrCodeImg) {
      qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(siteUrl)}&color=ff0054&bgcolor=ffffff`;
    }
  }

  if (btnRegenCode) btnRegenCode.addEventListener('click', generateRandomCode);

  if (btnToggleQr) {
    btnToggleQr.addEventListener('click', () => {
      const isHidden = qrCodeContainer.classList.contains('hidden');
      if (isHidden) {
        qrCodeContainer.classList.remove('hidden');
        btnToggleQr.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Hide QR Code`;
      } else {
        qrCodeContainer.classList.add('hidden');
        btnToggleQr.innerHTML = `<i class="fa-solid fa-qrcode"></i> Show QR Code`;
      }
    });
  }

  if (btnCopyDirectLink) {
    btnCopyDirectLink.addEventListener('click', () => copyToClipboard(getBaseUrl(), 'Web link copied to clipboard! 📋'));
  }

  if (btnCopyCodeOnly) {
    btnCopyCodeOnly.addEventListener('click', () => copyToClipboard(currentSecretCode, `Secret passcode ${currentSecretCode} copied! 📋`));
  }

  function openSendModal() {
    generateRandomCode();
    updateSendModalData();
    sendModal.classList.remove('hidden');
    disableBodyScroll();
  }

  if (btnOpenSendCard) btnOpenSendCard.addEventListener('click', openSendModal);
  
  btnCloseSendModal.addEventListener('click', () => {
    sendModal.classList.add('hidden');
    if (qrCodeContainer) qrCodeContainer.classList.add('hidden');
    if (btnToggleQr) btnToggleQr.innerHTML = `<i class="fa-solid fa-qrcode"></i> Show QR Code`;
    enableBodyScroll();
  });

  btnEditFromSend.addEventListener('click', () => {
    sendModal.classList.add('hidden');
    openCustomizer();
  });

  function openCustomizer() {
    inputName.value = appData.name;
    inputHotel.value = appData.hotel;
    inputTime.value = appData.time;
    inputNote.value = appData.note;
    customizerModal.classList.remove('hidden');
    disableBodyScroll();
  }

  if (btnCreateInvitationTop) btnCreateInvitationTop.addEventListener('click', openCustomizer);
  if (btnCreateInvitationFooter) btnCreateInvitationFooter.addEventListener('click', openCustomizer);

  btnCloseModal.addEventListener('click', () => {
    customizerModal.classList.add('hidden');
    enableBodyScroll();
  });

  btnSaveCustom.addEventListener('click', () => {
    appData.name = inputName.value.trim();
    appData.hotel = inputHotel.value.trim() || 'The Royal Grand Hotel & Lounge';
    appData.time = inputTime.value.trim() || '7:30 PM Today';
    appData.note = inputNote.value.trim() || 'Dress up gorgeous!';

    updateDisplayData();
    customizerModal.classList.add('hidden');
    openSendModal();
  });

  function openEnterCodeModal() {
    enterCodeModal.classList.remove('hidden');
    disableBodyScroll();
  }

  btnCloseCodeModal.addEventListener('click', () => {
    enterCodeModal.classList.add('hidden');
    enableBodyScroll();
  });

  // REVEAL CELEBRATION DATE CARD & RENDER PHOTOS
  btnApplyPasscode.addEventListener('click', () => {
    const code = inputPasscode.value.trim().toUpperCase();
    if (code) {
      const saved = localStorage.getItem(`val_code_${code}`);
      if (saved) {
        Object.assign(appData, JSON.parse(saved));
      } else {
        appData.name = code.split('-')[0] || '';
      }
    }

    updateDisplayData();
    enterCodeModal.classList.add('hidden');
    enableBodyScroll();

    revealCelebrationCard();
  });

  /* ==========================================================================
     8. URL PARSER & DISPLAY UPDATER (RENDERS POLAROID GALLERY)
     ========================================================================== */
  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let autoReveal = false;

    if (params.has('code')) {
      const code = params.get('code');
      const saved = localStorage.getItem(`val_code_${code}`);
      if (saved) {
        Object.assign(appData, JSON.parse(saved));
      }
      autoReveal = true;
    }

    if (params.has('name')) appData.name = params.get('name');
    if (params.has('hotel')) appData.hotel = params.get('hotel');
    if (params.has('time')) appData.time = params.get('time');
    if (params.has('note')) appData.note = params.get('note');

    updateDisplayData();

    if (autoReveal) {
      setTimeout(revealCelebrationCard, 300);
    }
  }

  function updateDisplayData() {
    const pName = appData.name.trim();

    if (pName) {
      displayTitle.innerHTML = `${escapeHTML(pName)}, will you be my Valentine? <span class="heart-emoji">💖</span>`;
      displaySubtitle.textContent = `Hey ${escapeHTML(pName)}, I have a super special question for you! Please say yes...`;
      if (successTitle) {
        successTitle.innerHTML = `I knew you would say YES, ${escapeHTML(pName)}! <span class="heart-emoji">💖✨</span>`;
      }
      if (successSubtext) {
        successSubtext.textContent = `${escapeHTML(pName)}, you've made me the happiest person ever! Here is our date plan:`;
      }
    } else {
      displayTitle.innerHTML = `Will you be my Valentine? <span class="heart-emoji">💖</span>`;
      displaySubtitle.textContent = `I have a super special question for you! Please say yes...`;
      if (successTitle) {
        successTitle.innerHTML = `I knew you would say YES! <span class="heart-emoji">💖✨</span>`;
      }
      if (successSubtext) {
        successSubtext.textContent = `You've made me the happiest person ever! Here is our date plan:`;
      }
    }

    resHotel.textContent = appData.hotel;
    resTime.textContent = appData.time;
    resNote.textContent = appData.note;

    inputName.value = appData.name;
    inputHotel.value = appData.hotel;
    inputTime.value = appData.time;
    inputNote.value = appData.note;

    // RENDER POLAROID PHOTO GALLERY
    renderPhotoGallery();
  }

  function renderPhotoGallery() {
    if (!polaroidGrid) return;
    polaroidGrid.innerHTML = '';

    const photoList = (appData.photos && appData.photos.length > 0) 
      ? appData.photos 
      : [
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop&q=80'
        ];

    if (photoList.length > 0) {
      photoGallerySection.classList.remove('hidden');
      photoList.forEach((src, idx) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        card.innerHTML = `
          <img src="${src}" alt="Romantic Memory ${idx + 1}">
          <div class="polaroid-caption">Memory #${idx + 1} 💖</div>
        `;
        polaroidGrid.appendChild(card);
      });
    } else {
      photoGallerySection.classList.add('hidden');
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  }

  function copyToClipboard(text, msg = 'Copied to clipboard!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => showToast('Copied!'));
    } else {
      showToast(msg);
    }
  }

  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  parseUrlParams();
});
