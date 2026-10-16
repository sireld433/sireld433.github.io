// ===== DANH SÁCH ẢNH CHIIKAWA =====
const chiiImages = [
  'img/chiikawa1.png',
  'img/chiikawa2.png',
  'img/chiikawa3.png',
  'img/chiikawa5.png',
  'img/momonga2.png',
  'img/momonga3.png'
];

// ===== LẤY PHẦN TỬ DOM =====
const nameModal    = document.getElementById('nameModal');
const nameInput    = document.getElementById('nameInput');
const startBtn     = document.getElementById('startBtn');
const mainScreen   = document.getElementById('mainScreen');
const displayName  = document.getElementById('displayName');
const cardName     = document.getElementById('cardName');
const musicBtn     = document.getElementById('musicBtn');
const bgMusic      = document.getElementById('bgMusic');
const continueBtn  = document.getElementById('continueBtn');
const letterScreen = document.getElementById('letterScreen');

// ===== BIẾN DÙNG CHUNG (khai báo sớm để tránh lỗi) =====
const cakeScreen       = document.getElementById('cakeScreen');
const wishBtn          = document.getElementById('wishBtn');
const wishMessage      = document.getElementById('wishMessage');
const confettiCanvas   = document.getElementById('confettiCanvas');
const confettiCtx      = confettiCanvas ? confettiCanvas.getContext('2d') : null;

let confettiParticles   = [];
let confettiActive      = false;
let confettiAnimationId = null;
let wishDone            = false;

// ===== VỊ TRÍ ẢNH BAY XUNG QUANH MÀN HÌNH CHÍNH =====
const FIXED_POSITIONS = [
  // === HÀNG TRÊN ===
  { src: 'img/chiikawa1.png', top: 5,  left: 8,  size: 55, delay: 0,   duration: 3 },
  { src: 'img/momonga2.png',  top: 3,  left: 22, size: 45, delay: 0.8, duration: 2.8 },
  { src: 'img/chiikawa2.png', top: 20, left: 30, size: 50, delay: 1.5, duration: 3.2 },
  { src: 'img/momonga3.png',  top: 4,  left: 60, size: 48, delay: 0.4, duration: 2.6 },
  { src: 'img/chiikawa3.png', top: 7,  left: 78, size: 52, delay: 1.2, duration: 3.4 },
  { src: 'img/momonga3.png',  top: 5,  left: 92, size: 45, delay: 1.8, duration: 2.9 },

  // === HÀNG GIỮA (hai bên) ===
  { src: 'img/chiikawa5.png', top: 40, left: 3,  size: 50, delay: 0.6, duration: 3.1 },
  { src: 'img/momonga2.png',  top: 55, left: 15, size: 45, delay: 1.4, duration: 2.7 },
  { src: 'img/chiikawa1.png', top: 38, left: 90, size: 48, delay: 0.2, duration: 3.3 },
  { src: 'img/momonga1.png',  top: 58, left: 90, size: 50, delay: 1.0, duration: 2.8 },

  // === HÀNG DƯỚI ===
  { src: 'img/chiikawa2.png', top: 78, left: 12, size: 52, delay: 0.9, duration: 3.0 },
  { src: 'img/momonga2.png',  top: 82, left: 30, size: 45, delay: 1.6, duration: 2.5 },
  { src: 'img/chiikawa3.png', top: 70, left: 75, size: 48, delay: 0.3, duration: 3.2 },
  { src: 'img/momonga3.png',  top: 85, left: 90, size: 50, delay: 1.1, duration: 2.9 },
  { src: 'img/chiikawa5.png', top: 88, left: 60, size: 42, delay: 0.7, duration: 3.1 },
];

// ===== TẠO ẢNH BAY XUNG QUANH MÀN HÌNH CHÍNH =====
function spawnFloatingChii() {
  const isMobile = window.innerWidth < 600;
  const FIXED_SIZE = 75;

  FIXED_POSITIONS.forEach((pos, index) => {
    if (isMobile && index % 2 === 1) return;

    const img = document.createElement('img');
    img.className = 'floating-chii';
    img.src = pos.src;
    img.alt = '';

    img.style.top = pos.top + '%';
    img.style.left = pos.left + '%';

    const size = isMobile ? FIXED_SIZE * 0.75 : FIXED_SIZE;
    img.style.width = size + 'px';
    img.style.height = 'auto';
    img.style.animationDelay = pos.delay + 's';
    img.style.animationDuration = pos.duration + 's';

    mainScreen.appendChild(img);
  });
}

// ===== BẮT ĐẦU =====
function startBirthday() {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.style.borderColor = '#ff6fa8';
    nameInput.placeholder = 'Bạn chưa nhập tên kìa ~ 🥺';
    nameInput.focus();
    return;
  }

  displayName.textContent = name + '!';
  cardName.textContent = name;

  nameModal.classList.add('hide');

  setTimeout(() => {
    mainScreen.classList.add('show');
    spawnFloatingChii();
  }, 300);

  tryPlayMusic();
}

// ===== NHẠC =====
const playlist = [
  'music/CarelessWhisper.mp3',
  'music/CarelessWhisper.mp3',
];

let currentTrack = 0;
let musicOn = false;
let isShuffle = false;

function playTrack(index) {
  currentTrack = index;
  bgMusic.src = playlist[currentTrack];
  bgMusic.load();
  bgMusic.volume = 0.5;

  bgMusic.play().then(() => {
    musicOn = true;
    musicBtn.classList.add('playing');
  }).catch((err) => {
    console.log('Không thể phát nhạc:', err);
  });
}

function playNextTrack() {
  let nextIndex;
  if (isShuffle) {
    do {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } while (nextIndex === currentTrack && playlist.length > 1);
  } else {
    nextIndex = (currentTrack + 1) % playlist.length;
  }
  playTrack(nextIndex);
}

bgMusic.addEventListener('ended', playNextTrack);

function tryPlayMusic() {
  if (playlist.length === 0) return;
  playTrack(0);
}

function toggleMusic() {
  if (playlist.length === 0) {
    alert('Chưa có file nhạc. Bạn thêm link nhạc vào mảng playlist nhé! 🎵');
    return;
  }

  if (musicOn) {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    musicOn = false;
  } else {
    if (!bgMusic.src || bgMusic.src === window.location.href) {
      playTrack(0);
    } else {
      bgMusic.play();
      musicBtn.classList.add('playing');
      musicOn = true;
    }
  }
}

// ===== NÚT TIẾP TỤC (MÀN HÌNH CHÍNH → CHÚC MỪNG) =====
function continueClick() {
  const name = nameInput.value.trim() || displayName.textContent.replace('!', '') || 'bạn';

  mainScreen.style.transition = 'opacity 0.6s ease';
  mainScreen.style.opacity = '0';

  setTimeout(() => {
    mainScreen.style.display = 'none';

    const congratsName = document.getElementById('congratsName');
    if (congratsName) congratsName.textContent = 'Gửi ' + name + ' 💖';

    spawnCongratsDecorations();

    const congratsScreen = document.getElementById('congratsScreen');
    congratsScreen.style.zIndex = '9999';
    congratsScreen.classList.add('show');

    setTimeout(() => {
      startFireworks(4000);
    }, 0);
  }, 700);
}

// ===== GẮN SỰ KIỆN CHÍNH =====
startBtn.addEventListener('click', startBirthday);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startBirthday();
});

musicBtn.addEventListener('click', toggleMusic);

continueBtn.addEventListener('click', continueClick);

// ===== HIỆU ỨNG PHÁO HOA =====
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas ? fwCanvas.getContext('2d') : null;

let particles = [];
let fireworksActive = false;
let fwAnimationId = null;

function resizeFwCanvas() {
  if (!fwCanvas) return;
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFwCanvas);
resizeFwCanvas();

function createParticle(x, y, options = {}) {
  const angle = options.angle ?? (Math.random() * Math.PI * 2);
  const speed = options.speed ?? (3 + Math.random() * 5);
  const colors = ['#ff8bbf', '#ffd700', '#7ec8ff', '#b89bff', '#ff6fa8', '#7dffb0', '#ffb347'];
  const color = options.color ?? colors[Math.floor(Math.random() * colors.length)];

  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: options.life ?? 80,
    maxLife: options.life ?? 80,
    color,
    size: options.size ?? (2 + Math.random() * 3),
    gravity: options.gravity ?? 0.08,
    shape: options.shape ?? 'circle'
  };
}

function launchFirework(side) {
  if (!fwCanvas) return;

  const canvasW = fwCanvas.width;
  const canvasH = fwCanvas.height;

  const startX = side === 'left' ? 0 : canvasW;
  const startY = canvasH;

  const targetX = side === 'left'
    ? canvasW * (0.15 + Math.random() * 0.2)
    : canvasW * (0.65 + Math.random() * 0.2);
  const targetY = canvasH * (0.2 + Math.random() * 0.3);

  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 12;
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;

  const rocket = {
    x: startX,
    y: startY,
    vx, vy,
    targetX, targetY,
    trail: [],
    color: ['#ff8bbf', '#ffd700', '#7ec8ff', '#b89bff'][Math.floor(Math.random() * 4)]
  };

  const rocketInterval = setInterval(() => {
    rocket.x += rocket.vx;
    rocket.y += rocket.vy;

    rocket.trail.push({ x: rocket.x, y: rocket.y });
    if (rocket.trail.length > 12) rocket.trail.shift();

    const distToTarget = Math.sqrt(
      Math.pow(rocket.x - rocket.targetX, 2) +
      Math.pow(rocket.y - rocket.targetY, 2)
    );

    if (distToTarget < 15 || rocket.y < rocket.targetY) {
      clearInterval(rocketInterval);
      explodeFirework(rocket.x, rocket.y);
    }
  }, 16);

  particles.push({
    type: 'rocket',
    rocket,
    life: 200,
    maxLife: 200
  });
}

function explodeFirework(x, y) {
  const count = 40 + Math.floor(Math.random() * 30);
  const colors = ['#ff8bbf', '#ffd700', '#7ec8ff', '#b89bff', '#ff6fa8', '#7dffb0'];
  const mainColor = colors[Math.floor(Math.random() * colors.length)];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 3 + Math.random() * 5;
    const useMainColor = Math.random() > 0.3;

    particles.push(createParticle(x, y, {
      angle,
      speed,
      color: useMainColor ? mainColor : colors[Math.floor(Math.random() * colors.length)],
      life: 60 + Math.random() * 40,
      size: 2 + Math.random() * 3,
      gravity: 0.06,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    }));
  }
}

function drawFireworks() {
  if (!fwCtx) return;

  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    if (p.type === 'rocket') {
      const r = p.rocket;
      fwCtx.save();

      for (let j = 0; j < r.trail.length; j++) {
        const t = r.trail[j];
        const alpha = (j / r.trail.length) * 0.8;
        fwCtx.globalAlpha = alpha;
        fwCtx.fillStyle = r.color;
        fwCtx.beginPath();
        fwCtx.arc(t.x, t.y, 3 * (j / r.trail.length), 0, Math.PI * 2);
        fwCtx.fill();
      }

      fwCtx.globalAlpha = 1;
      fwCtx.fillStyle = '#fff';
      fwCtx.beginPath();
      fwCtx.arc(r.x, r.y, 4, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();

      const distToTarget = Math.sqrt(
        Math.pow(r.x - r.targetX, 2) +
        Math.pow(r.y - r.targetY, 2)
      );
      if (distToTarget < 15 || r.y < r.targetY) {
        particles.splice(i, 1);
        continue;
      }
      continue;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life--;

    if (p.life <= 0 || p.y > fwCanvas.height + 50) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = p.life / p.maxLife;
    fwCtx.globalAlpha = alpha;
    fwCtx.fillStyle = p.color;

    if (p.shape === 'rect') {
      fwCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else {
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fwCtx.fill();
    }

    fwCtx.globalAlpha = alpha * 0.3;
    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
    fwCtx.fill();
  }

  fwCtx.globalAlpha = 1;

  if (fireworksActive) {
    fwAnimationId = requestAnimationFrame(drawFireworks);
  }
}

function startFireworks(duration = 6000) {
  if (!fwCtx) return;

  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  particles = [];
  fireworksActive = true;

  const startTime = Date.now();

  const interval = setInterval(() => {
    if (Date.now() - startTime > duration) {
      clearInterval(interval);
      return;
    }

    launchFirework('left');
    setTimeout(() => launchFirework('right'), 200);

    if (Math.random() > 0.6) {
      setTimeout(() => launchFirework(Math.random() > 0.5 ? 'left' : 'right'), 500);
    }
  }, 400);

  if (!fwAnimationId) {
    drawFireworks();
  }
}

function stopFireworks() {
  fireworksActive = false;
  if (fwAnimationId) {
    cancelAnimationFrame(fwAnimationId);
    fwAnimationId = null;
  }
}

// ===== ẢNH TRANG TRÍ MÀN HÌNH CHÚC MỪNG =====
const DECOR_IMAGES = [
  { src: 'img/linnea1.png', repeat: 1 },
  { src: 'img/linnea2.png', repeat: 1 },
  { src: 'img/linnea3.png', repeat: 1 },
  { src: 'img/linnea4.png', repeat: 3 },
  { src: 'img/linnea5.png', repeat: 1 },
  { src: 'img/lumi1.png',   repeat: 1 },
];

const DECOR_POSITIONS = [
  { top: 18, left: 4,  size: 70, delay: 0,   duration: 3 },
  { top: 40, left: 6,  size: 55, delay: 0.8, duration: 3.2 },
  { top: 62, left: 3,  size: 65, delay: 1.5, duration: 2.8 },
  { top: 80, left: 10, size: 50, delay: 0.4, duration: 3.3 },
  { top: 20, left: 92, size: 60, delay: 1.0, duration: 3.1 },
  { top: 42, left: 90, size: 70, delay: 0.2, duration: 2.9 },
  { top: 64, left: 93, size: 55, delay: 1.7, duration: 3.4 },
  { top: 82, left: 88, size: 65, delay: 0.6, duration: 2.7 },
  { top: 12, left: 20, size: 48, delay: 1.2, duration: 3 },
  { top: 10, left: 78, size: 52, delay: 0.9, duration: 3.2 },
  { top: 88, left: 25, size: 45, delay: 0.3, duration: 2.8 },
  { top: 90, left: 70, size: 48, delay: 1.4, duration: 3.1 },
];

function spawnCongratsDecorations() {
  const container = document.getElementById('congratsDecorations');
  if (!container) return;

  container.innerHTML = '';

  const imagePool = [];
  DECOR_IMAGES.forEach(item => {
    for (let i = 0; i < item.repeat; i++) {
      imagePool.push(item.src);
    }
  });

  for (let i = imagePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imagePool[i], imagePool[j]] = [imagePool[j], imagePool[i]];
  }

  const isMobile = window.innerWidth < 768;
  const positions = isMobile
    ? DECOR_POSITIONS.filter((_, i) => i % 2 === 0)
    : DECOR_POSITIONS;

  const decorCount = Math.min(positions.length, imagePool.length);

  for (let i = 0; i < decorCount; i++) {
    const pos = positions[i];
    const img = document.createElement('img');
    img.className = 'congrats-decoration';
    img.src = imagePool[i];
    img.alt = '';

    img.style.top = pos.top + '%';
    img.style.left = pos.left + '%';

    const size = isMobile ? pos.size * 0.75 : pos.size;
    img.style.width = size + 'px';
    img.style.minWidth = size * 0.8 + 'px';
    img.style.height = 'auto';
    img.style.animationDelay = pos.delay + 's';
    img.style.animationDuration = pos.duration + 's';

    container.appendChild(img);
  }
}

// ===== NÚT TIẾP TỤC (CHÚC MỪNG → THIỆP) =====
const nextBtn = document.getElementById('nextBtn');

function nextClick() {
  const congratsScreen = document.getElementById('congratsScreen');

  congratsScreen.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  congratsScreen.style.opacity = '0';
  congratsScreen.style.transform = 'scale(0.95)';

  setTimeout(() => {
    stopFireworks();
    congratsScreen.style.display = 'none';
    congratsScreen.style.transform = '';

    const name = nameInput.value.trim() || displayName.textContent.replace('!', '') || 'bạn';
    const letterTitle = document.getElementById('letterTitle');
    if (letterTitle) letterTitle.textContent = 'Thân gửi ' + name;

    letterScreen.classList.add('show');
  }, 700);
}

if (nextBtn) {
  nextBtn.addEventListener('click', nextClick);
}

// ===== MÀN HÌNH BÁNH KEM + WISH =====
function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function createConfettiParticle(x, y, options = {}) {
  const angle = options.angle ?? (Math.random() * Math.PI * 2);
  const speed = options.speed ?? (5 + Math.random() * 8);
  const colors = [
    '#ffb6d5', '#ffd7a8', '#c9e8ff', '#ff8bbf', '#b89bff',
    '#ff6fa8', '#ffe5b4', '#ffc9e0', '#7ec8ff', '#ffeb99'
  ];

  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    life: 120 + Math.random() * 60,
    maxLife: 180,
    color: options.color ?? colors[Math.floor(Math.random() * colors.length)],
    size: options.size ?? (4 + Math.random() * 6),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    gravity: 0.15,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    swing: Math.random() * 0.05,
    swingPhase: Math.random() * Math.PI * 2
  };
}

function launchConfetti() {
  const cakeEl = document.querySelector('.cake-svg');
  if (!cakeEl) return;

  const rect = cakeEl.getBoundingClientRect();
  const cakeCenterX = rect.left + rect.width / 2;
  const cakeTopY = rect.top + rect.height * 0.3;

  const totalParticles = 120;

  for (let i = 0; i < totalParticles; i++) {
    if (i % 2 === 0) {
      confettiParticles.push(createConfettiParticle(
        cakeCenterX - 60, cakeTopY,
        {
          angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.2,
          speed: 8 + Math.random() * 8
        }
      ));
    } else {
      confettiParticles.push(createConfettiParticle(
        cakeCenterX + 60, cakeTopY,
        {
          angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.2,
          speed: 8 + Math.random() * 8
        }
      ));
    }
  }

  setTimeout(() => {
    for (let i = 0; i < 60; i++) {
      confettiParticles.push(createConfettiParticle(
        Math.random() * confettiCanvas.width,
        -20,
        {
          angle: Math.PI / 2,
          speed: 2 + Math.random() * 3
        }
      ));
    }
  }, 300);

  setTimeout(() => {
    for (let i = 0; i < 80; i++) {
      confettiParticles.push(createConfettiParticle(
        cakeCenterX + (Math.random() - 0.5) * 100,
        cakeTopY,
        {
          angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.5,
          speed: 10 + Math.random() * 8
        }
      ));
    }
  }, 600);

  if (!confettiActive) {
    confettiActive = true;
    drawConfetti();
  }
}

function drawConfetti() {
  if (!confettiCtx) return;

  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];

    p.vy += p.gravity;
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;

    p.x += Math.sin(p.swingPhase) * 0.5;
    p.swingPhase += p.swing;

    p.life--;

    if (p.life <= 0 || p.y > confettiCanvas.height + 50) {
      confettiParticles.splice(i, 1);
      continue;
    }

    const alpha = Math.min(1, p.life / 60);
    confettiCtx.save();
    confettiCtx.globalAlpha = alpha;
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rotation);
    confettiCtx.fillStyle = p.color;

    if (p.shape === 'rect') {
      confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }

    confettiCtx.restore();
  }

  if (confettiActive && confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(drawConfetti);
  } else {
    confettiActive = false;
    confettiAnimationId = null;
  }
}

function handleWish() {
  if (wishDone) return;
  wishDone = true;

  wishBtn.disabled = true;
  wishBtn.textContent = 'Đã ước rồi 💖';

  launchConfetti();

  setTimeout(() => {
    wishMessage.classList.add('show');
  }, 800);
}

// (Nút ước + thổi nến do finale.js xử lý)

// ===== NÚT ĐÓNG THIỆP → CHUYỂN SANG BÁNH KEM =====
const letterCloseBtn = document.getElementById('letterCloseBtn');

function closeLetter() {
  const letterScreenEl = document.getElementById('letterScreen');
  letterScreenEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  letterScreenEl.style.opacity = '0';
  letterScreenEl.style.transform = 'scale(0.95)';

  setTimeout(() => {
    letterScreenEl.style.display = 'none';

    // Hiện màn hình bánh kem
    if (cakeScreen) {
      cakeScreen.classList.add('show');
    }

    // Reset nút ước (nếu chơi lại)
    if (wishBtn) {
      wishBtn.disabled = false;
      wishBtn.textContent = 'Ước một điều ước 🎂';
    }
    wishDone = false;
    confettiParticles = [];
  }, 700);
}

if (letterCloseBtn) {
  letterCloseBtn.addEventListener('click', closeLetter);
}

// ===== ALBUM ẢNH KỶ NIỆM =====
// ⚠️ SỬA DANH SÁCH ẢNH + CAPTION Ở ĐÂY
const ALBUM_PHOTOS = [
  { src: 'img/linnea1.png', caption: 'Lần đầu gặp nhau' },
  { src: 'img/linnea2.png', caption: 'Đi chơi cùng nhau' },
  { src: 'img/linnea3.png', caption: 'Kỷ niệm đáng nhớ' },
  { src: 'img/linnea4.png', caption: 'Cùng nhau cười' },
  { src: 'img/linnea5.png', caption: 'Mãi là bạn thân' },
];


const albumScreen = document.getElementById('albumScreen');
const albumTrack = document.getElementById('albumTrack');
const albumPrevBtn = document.getElementById('albumPrevBtn');
const albumNextBtn = document.getElementById('albumNextBtn');
const albumCounter = document.getElementById('albumCounter');
const albumContinueBtn = document.getElementById('albumContinueBtn');

let currentAlbumIndex = 0;   // vị trí mục tiêu (số nguyên, không giới hạn — dùng mod khi hiển thị)

// ===== THÔNG SỐ HIỆU ỨNG (chỉnh tại đây) =====
const ALBUM_ANGLE = 38;   // độ xoay 3D của ảnh bên cạnh (độ)
const ALBUM_DEPTH = 140;  // ảnh bên cạnh lùi sâu bao nhiêu px

const albumStage = albumTrack ? albumTrack.parentElement : null;
const albumCards = [];    // { el, prev }

// ===== HELPER: MODULO =====
function mod(n, m) {
  return ((n % m) + m) % m;
}

// ===== CO GIÃN KHUNG THEO TỈ LỆ ẢNH THẬT =====
// Khung tối đa = --card-w x --card-h của stage (đã responsive sẵn trong CSS).
// Ảnh ngang → khung rộng & thấp, ảnh dọc → khung cao & hẹp, ảnh vuông → ở giữa.
const ALBUM_MIN_RATIO = 0.5;   // rộng/cao nhỏ nhất (ảnh dọc quá dài sẽ bị cắt nhẹ)
const ALBUM_MAX_RATIO = 2.4;   // rộng/cao lớn nhất; ảnh vượt mức này được hiện NGUYÊN VẸN (letterbox) thay vì bị cắt

function fitPolaroid(el, img) {
  if (!albumStage || !img.naturalWidth) return;
  const stageCS = getComputedStyle(albumStage);
  const maxW = parseFloat(stageCS.getPropertyValue('--card-w')) || 320;
  // chiều cao tối đa = min(--card-h, chiều cao stage thực tế) → không bao giờ tràn màn hình thấp
  const maxH = Math.min(parseFloat(stageCS.getPropertyValue('--card-h')) || 380,
                        albumStage.clientHeight - 8);

  const cs = getComputedStyle(el);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

  const rawRatio = img.naturalWidth / img.naturalHeight;
  const ratio = Math.max(ALBUM_MIN_RATIO, Math.min(ALBUM_MAX_RATIO, rawRatio));

  // Ảnh quá dài/quá cao: giữ khung ở tỉ lệ giới hạn, nhưng hiện trọn ảnh (contain)
  // trên nền là chính ảnh đó được làm mờ → không bị cắt mà vẫn đẹp.
  const wrap = img.parentElement;
  const extreme = rawRatio > ALBUM_MAX_RATIO || rawRatio < ALBUM_MIN_RATIO;
  wrap.classList.toggle('letterbox', extreme);
  if (extreme) wrap.style.setProperty('--bg', 'url("' + img.src + '")');

  // vùng ảnh tối đa nằm trong khung tối đa
  const boxW = maxW - padX;
  const boxH = maxH - padY;
  let w = boxW, h = w / ratio;
  if (h > boxH) { h = boxH; w = h * ratio; }

  el.style.setProperty('--pw', (w + padX) + 'px');
  el.style.setProperty('--ph', (h + padY) + 'px');
}

function refitAllPolaroids() {
  albumCards.forEach((c) => fitPolaroid(c.el, c.el.querySelector('.polaroid-img')));
}
window.addEventListener('resize', refitAllPolaroids);

// ===== TẠO MỖI ẢNH = 1 THẺ RIÊNG (chỉ tạo 1 lần) =====
function buildAlbum() {
  if (!albumTrack) return;
  albumTrack.innerHTML = '';
  albumCards.length = 0;

  ALBUM_PHOTOS.forEach((photo) => {
    const el = document.createElement('div');
    el.className = 'polaroid';
    el.innerHTML =
      '<div class="polaroid-img-wrap"><img class="polaroid-img" alt="" draggable="false" decoding="async"></div>' +
      '<div class="polaroid-caption"></div>';
    const imgEl = el.querySelector('.polaroid-img');
    imgEl.addEventListener('load', () => fitPolaroid(el, imgEl));
    imgEl.src = photo.src;
    if (imgEl.complete && imgEl.naturalWidth) fitPolaroid(el, imgEl);
    el.querySelector('.polaroid-caption').textContent = photo.caption || '';
    albumTrack.appendChild(el);
    albumCards.push({ el, prev: null });
  });
}

// ===== ĐẶT VỊ TRÍ 3D CHO TẤT CẢ THẺ =====
// center có thể là số thập phân (khi đang kéo chuột/vuốt)
function layoutAlbum(center, instant) {
  const total = albumCards.length;
  if (total === 0) return;

  const reset = [];

  albumCards.forEach((c, i) => {
    // khoảng cách vòng tròn từ ảnh này tới ảnh đang ở giữa: [-total/2, total/2)
    const d = mod(i - center + total / 2, total) - total / 2;
    const a = Math.abs(d);
    const near = Math.min(a, 2);
    const side = Math.max(-2, Math.min(2, d));

    const tz = -near * ALBUM_DEPTH;
    const ry = -side * ALBUM_ANGLE;
    const scale = 1 - near * 0.06;

    // mờ dần khi ra xa: giữa=1, cạnh≈0.8, xa nhất=0
    const opacity = a <= 1 ? 1 - a * 0.2 : Math.max(0, 0.8 * (2 - a));
    const dim = Math.min(a, 1) * 0.35;

    // Ảnh "vòng" từ đầu này sang đầu kia → nhảy tức thì (đang trong suốt nên không thấy)
    const teleport = c.prev !== null && Math.abs(d - c.prev) > 1.5;
    if (instant || teleport) {
      c.el.style.transition = 'none';
      reset.push(c.el);
    }

    c.el.style.transform =
      `translate3d(calc(var(--gap) * ${d}), 0, ${tz}px) rotateY(${ry}deg) scale(${scale})`;
    c.el.style.opacity = opacity;
    c.el.style.zIndex = 100 - Math.round(a * 10);
    c.el.style.pointerEvents = a >= 1.5 ? 'none' : 'auto';
    c.el.style.setProperty('--dim', dim);
    c.prev = d;
  });

  if (reset.length) {
    void albumTrack.offsetWidth;                     // ép trình duyệt áp dụng ngay
    reset.forEach((el) => { el.style.transition = ''; });
  }
}

function updateAlbumCounter() {
  const total = ALBUM_PHOTOS.length;
  if (albumCounter && total) {
    albumCounter.textContent = `${mod(currentAlbumIndex, total) + 1} / ${total}`;
  }
}

// ===== RENDER (gọi khi mở album) =====
function renderAlbum() {
  if (ALBUM_PHOTOS.length === 0) return;
  if (albumCards.length !== ALBUM_PHOTOS.length) buildAlbum();
  layoutAlbum(currentAlbumIndex, true);
  updateAlbumCounter();
}

// ===== CHUYỂN ẢNH — KHÔNG KHÓA NÚT, BẤM LIÊN TIẾP VẪN MƯỢT =====
function changePhoto(direction) {
  if (ALBUM_PHOTOS.length <= 1 || !direction) return;
  currentAlbumIndex += direction;
  layoutAlbum(currentAlbumIndex);
  updateAlbumCounter();
}

// ===== GẮN SỰ KIỆN NÚT =====
if (albumNextBtn) albumNextBtn.addEventListener('click', () => changePhoto(1));
if (albumPrevBtn) albumPrevBtn.addEventListener('click', () => changePhoto(-1));

// Phím tắt
document.addEventListener('keydown', (e) => {
  if (!albumScreen || !albumScreen.classList.contains('show')) return;
  if (e.key === 'ArrowRight') changePhoto(1);
  if (e.key === 'ArrowLeft') changePhoto(-1);
});

// ===== KÉO / VUỐT ĐỂ ĐỔI ẢNH + BẤM VÀO ẢNH BÊN CẠNH =====
let albumDrag = null;

function albumGapPx() {
  return parseFloat(getComputedStyle(albumStage).getPropertyValue('--gap')) || 200;
}

if (albumStage) {
  albumStage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    albumDrag = { x: e.clientX, t: performance.now(), moved: false, id: e.pointerId };
  });

  albumStage.addEventListener('pointermove', (e) => {
    if (!albumDrag) return;
    const dx = e.clientX - albumDrag.x;
    if (!albumDrag.moved && Math.abs(dx) > 6) {
      albumDrag.moved = true;
      albumStage.classList.add('dragging');
      try { albumStage.setPointerCapture(albumDrag.id); } catch (_) {}
    }
    if (albumDrag.moved) {
      const frac = Math.max(-1, Math.min(1, dx / albumGapPx()));
      layoutAlbum(currentAlbumIndex - frac);   // ảnh bám theo ngón tay
    }
  });

  const endDrag = (e) => {
    if (!albumDrag) return;
    const dx = e.clientX - albumDrag.x;
    const v = dx / Math.max(1, performance.now() - albumDrag.t);   // px/ms
    const moved = albumDrag.moved;
    albumDrag = null;
    albumStage.classList.remove('dragging');

    if (moved) {
      const threshold = albumGapPx() * 0.25;
      if (dx < -threshold || v < -0.5) changePhoto(1);
      else if (dx > threshold || v > 0.5) changePhoto(-1);
      else layoutAlbum(currentAlbumIndex);   // chưa đủ lực → trả về chỗ cũ
    } else {
      // Bấm vào ảnh bên cạnh → chuyển tới ảnh đó
      const cardEl = e.target.closest ? e.target.closest('.polaroid') : null;
      const idx = albumCards.findIndex((c) => c.el === cardEl);
      if (idx >= 0) {
        const total = albumCards.length;
        const delta = mod(idx - currentAlbumIndex + total / 2, total) - total / 2;
        changePhoto(Math.round(delta));
      }
    }
  };
  albumStage.addEventListener('pointerup', endDrag);
  albumStage.addEventListener('pointercancel', endDrag);
}

// ===== CHUYỂN TỪ BÁNH KEM SANG ALBUM =====
function goToAlbum() {
  if (!cakeScreen || !albumScreen) return;

  cakeScreen.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  cakeScreen.style.opacity = '0';
  cakeScreen.style.transform = 'scale(0.95)';

  setTimeout(() => {
    cakeScreen.style.display = 'none';
    cakeScreen.style.transform = '';

    // Reset album về ảnh đầu
    currentAlbumIndex = 0;
    renderAlbum();

    // Hiện album
    albumScreen.classList.add('show');
  }, 700);
}

// Nút "Tiếp tục" trong album
if (albumContinueBtn) {
  albumContinueBtn.addEventListener('click', () => {
    if (window.startSkyFinale) window.startSkyFinale();
  });
}

// (Thổi nến & bầu trời sao: xem finale.js)