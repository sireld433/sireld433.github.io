// ⚠️ NGÀY SINH NGƯỜI ĐƯỢC CHÚC → tự chọn chòm sao theo cung hoàng đạo
const SKY_BIRTH = { day: 8, month: 5 };
// 'libra','scorpio','sagittarius','capricorn','aquarius','pisces'. Để '' = tự đoán theo ngày sinh.
const SKY_SIGN = '';

// g = biết ơn (hồng) · m = kỷ niệm riêng (vàng) · f = mong ước tương lai (xanh)
const SKY_WISHES = [
  { c: 'g', t: 'Cảm ơn cậu vì đã luôn lắng nghe và giúp đỡ mình' },
  { c: 'g', t: 'Cảm ơn vì đã đồng hành với mình' },
  { c: 'g', t: 'Cảm ơn cậu vì đã luôn là chính cậu' },
  { c: 'm', t: 'Lần đầu gặp nhau*' },
  { c: 'm', t: 'Câu đùa của hai người*' },
  { c: 'm', t: 'Khoảnh khắc đáng nhớ*' },
  { c: 'f', t: 'Mong cậu luôn được làm những điều cậu thích, theo đuổi những gì cậu mong muốn' },
  { c: 'f', t: 'Mong năm nay sẽ dịu dàng với cậu hơn' },
]
const SKY_SPECIAL = 'Dù sao đi nữa tớ vẫn luôn ủng hộ cậu!';
const SKY_CLOSING = 'Mong mọi điều tốt đẹp nhất sẽ đến với cậu trong năm tới! 🎉';

/* ============================ THỔI NẾN ============================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const wishButton = $('wishBtn'), hint = $('blowHint'), meter = $('blowMeter'), fill = $('blowMeterFill');
  const svg = document.querySelector('.cake-svg'), cakeWrap = document.querySelector('.cake-wrap');
  if (!wishButton || !svg) return;

  const flames = [...document.querySelectorAll('.flame')];
  const CANDLE = [[119, 58], [139, 53], [159, 51], [179, 58]];
  const NEED = 0.5;                   

  let mode = 'idle', out = 0, acc = 0, level = 0, base = 0.1, thr = 0.3;
  let actx = null, analyser = null, buf = null, stream = null, bins = 32;
  let press = false, calibrating = false, calibStart = 0, calibSum = 0, calibN = 0, last = 0;

  const setHint = (html) => { hint.innerHTML = html; hint.classList.add('show'); };
  const FALLBACK = '<small>hoặc giữ ngón tay / chuột vào chiếc bánh để thổi 💨</small>';

  async function startMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no-mic');
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const AC = window.AudioContext || window.webkitAudioContext;
    actx = new AC();
    if (actx.state === 'suspended') await actx.resume();
    analyser = actx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.4;
    actx.createMediaStreamSource(stream).connect(analyser);
    buf = new Uint8Array(analyser.frequencyBinCount);
    bins = Math.max(8, Math.floor(1500 / (actx.sampleRate / analyser.fftSize)));   // dải 0–1500Hz
  }

  async function begin() {
    if (mode !== 'idle') return;
    mode = 'ready';
    wishButton.disabled = true;
    wishButton.textContent = 'Đang chờ cậu thổi nến… 🕯️';
    setHint('Cho mình mượn micro một chút nha 🎤');

    let micOk = true;
    try { await startMic(); } catch (e) { micOk = false; }

    meter.classList.add('show');
    if (micOk) {
      calibrating = true; calibStart = performance.now();
      setHint('Nhắm mắt lại, ước một điều… 💭');
      setTimeout(() => { if (mode === 'ready') setHint('Giờ thì thổi nến nào! 🕯️💨' + FALLBACK); }, 1100);
    } else {
      setHint('Không dùng được micro, nhưng không sao 🥹' + FALLBACK.replace('hoặc giữ', 'hãy giữ'));
    }
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function extinguish(i) {
    flames[i].classList.add('out');
    const [x, y] = CANDLE[i];
    for (let k = 0; k < 3; k++) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      p.setAttribute('class', 'smoke');
      p.setAttribute('cx', x + (k - 1) * 2); p.setAttribute('cy', y); p.setAttribute('rx', 5); p.setAttribute('ry', 7);
      p.style.animationDelay = (k * 0.25) + 's';
      svg.appendChild(p);
      setTimeout(() => p.remove(), 3000);
    }
  }

  function loop(t) {
    if (mode !== 'ready') return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;

    let raw = 0;
    if (analyser) {
      analyser.getByteFrequencyData(buf);
      let s = 0; for (let i = 0; i < bins; i++) s += buf[i];
      raw = s / bins / 255;
      if (calibrating) {                                   // đo tiếng ồn nền ~1 giây đầu
        calibSum += raw; calibN++;
        if (t - calibStart > 1000) {
          base = calibSum / Math.max(1, calibN);
          thr = Math.min(0.9, base + 0.2);
          calibrating = false;
        }
      }
    }
    if (press) raw = Math.max(raw, thr + 0.3);             // giữ vào bánh = thổi
    level = level * 0.7 + raw * 0.3;

    const blowing = !calibrating && level > thr;
    const strength = blowing ? Math.min(1, 0.5 + (level - thr) / 0.25)
                             : Math.min(0.3, Math.max(0, (level - base) / Math.max(0.05, thr - base)) * 0.3);

    fill.style.width = Math.min(100, (level / (thr + 0.25)) * 100) + '%';

    svg.classList.toggle('blowing', strength > 0.02);
    flames.forEach((f, i) => {
      if (i < out) return;
      const wob = Math.sin(t / 60 + i * 1.7) * strength * 6;
      f.style.transform = `skewX(${-(strength * 30 + wob)}deg) scaleY(${1 - strength * 0.4})`;
    });

    acc = blowing ? acc + dt : Math.max(0, acc - dt * 0.8);
    if (acc >= NEED && out < flames.length) { extinguish(out); out++; acc = 0; }
    if (out >= flames.length) return finish();
    requestAnimationFrame(loop);
  }

  function finish() {
    mode = 'done';
    if (stream) stream.getTracks().forEach((tr) => tr.stop());
    if (actx) actx.close();
    hint.classList.remove('show'); meter.classList.remove('show');
    setTimeout(() => {
      launchConfetti();                                    // từ hpbd1.js
      setTimeout(() => wishMessage.classList.add('show'), 800);
      setTimeout(goToAlbum, 4200);                         // từ hpbd1.js
    }, 700);
  }

  wishButton.addEventListener('click', begin);
  const down = () => { press = true; }, up = () => { press = false; };
  cakeWrap.addEventListener('pointerdown', down);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
})();

/* ================= BẦU TRỜI SAO: CHÒM SAO THEO CUNG HOÀNG ĐẠO ================= */
(function () {
  // Toạ độ [x, y, loại]: loại 0 = sao nhỏ (tự sáng theo), 1 = sao chạm được (mặc định), 2 = sao đặc biệt
  const ZODIAC = {
    scorpio: { name: 'Scorpio', stars: [   // dựng lại theo ảnh mẫu
      [310,57,0],[338,69,1],[345,99,0],[347,138,0],[347,170,1],[293,125,0],[273,134,2],[255,152,0],
      [222,219,0],[218,257,1],[213,303,1],[178,314,1],[126,314,1],[105,288,0],[114,271,1],[125,247,0],[137,252,0],[92,254,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[15,17]] },
    aries: { name: 'Aries', stars: [[8,72],[28,60],[46,52],[62,42,2],[84,30],[70,62],[58,80]],
      lines: [[0,1],[1,2],[2,3],[3,4],[3,5],[5,6]] },
    taurus: { name: 'Taurus', stars: [   // dựng lại theo ảnh mẫu
      [114,72,1],[172,122,1],[192,153,1],[193,172,0],[210,174,0],[197,190,1],[214,188,0],[175,181,0],
      [95,133,1],[247,214,2],[314,238,1],[325,263,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,6],[6,5],[5,3],[8,7],[7,5],[6,9],[9,10],[10,11]] },
    gemini: { name: 'Gemini', stars: [[35,16],[56,20,2],[32,40],[54,42],[28,62],[60,62],[20,84],[72,84]],
      lines: [[0,2],[2,4],[4,6],[1,3],[3,5],[5,7],[2,3],[4,5]] },
    cancer: { name: 'Cancer', stars: [[50,46,2],[36,22],[68,26],[40,74],[70,80],[50,62],[26,50]],
      lines: [[0,1],[0,2],[0,5],[5,3],[5,4],[0,6]] },
    leo: { name: 'Leo', stars: [[22,76,2],[24,58],[32,42],[44,32],[54,38],[52,52],[72,46],[92,60],[74,62]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,5]] },
    virgo: { name: 'Virgo', stars: [[30,82,2],[38,62],[48,50],[60,40],[78,32],[32,38],[68,58],[88,66]],
      lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[3,6],[6,7]] },
    libra: { name: 'Libra', stars: [[50,18],[20,48],[78,42,2],[34,80],[70,76],[50,52]],
      lines: [[0,1],[0,2],[1,5],[5,2],[1,3],[2,4]] },
    sagittarius: { name: 'Sagittarius', stars: [[50,18],[34,36],[58,40,2],[40,64],[24,72],[66,66],[82,46],[12,50]],
      lines: [[1,2],[2,5],[5,3],[3,1],[0,1],[0,2],[7,1],[7,3],[6,2],[6,5],[4,3]] },
    capricorn: { name: 'Capricorn', stars: [[8,28],[26,44],[42,62],[58,72,2],[76,62],[90,38],[70,40],[44,36]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7],[7,1]] },
    aquarius: { name: 'Aquarius', stars: [[8,34],[24,24],[40,36],[56,26,2],[72,38],[90,28],[14,70],[32,62],[48,74],[66,64],[86,76]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[6,7],[7,8],[8,9],[9,10],[3,8]] },
    pisces: { name: 'Pisces', stars: [[10,26],[22,18],[34,26],[22,36],[38,52],[54,66,2],[68,54],[80,40],[92,30],[88,48]],
      lines: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,7]] },
  };
  const STARTS = [['aquarius',120],['pisces',219],['aries',321],['taurus',420],['gemini',521],['cancer',621],
    ['leo',723],['virgo',823],['libra',923],['scorpio',1023],['sagittarius',1122],['capricorn',1222]];
  const v = SKY_BIRTH.month * 100 + SKY_BIRTH.day;
  let key = 'capricorn'; STARTS.forEach(([n, s]) => { if (v >= s) key = n; });
  if (SKY_SIGN && ZODIAC[SKY_SIGN]) key = SKY_SIGN;
  const Z = ZODIAC[key];
  const pad = (n) => String(n).padStart(2, '0');

  const $ = (id) => document.getElementById(id);
  const screen = $('skyScreen'), cv = $('skyCanvas');
  if (!screen || !cv) return;
  const cx = cv.getContext('2d');
  const hintEl = $('skyHint'), msgEl = $('skyMessage'), cntEl = $('skyCounter'), finalEl = $('skyFinal');
  const COLORS = { g: '#ffb6d5', m: '#ffe29a', f: '#a9d8ff', s: '#fff6d8' };

  // Gán lời chúc cho các sao chạm được (theo thứ tự), sao đặc biệt nhận SKY_SPECIAL
  let wi = 0;
  const info = Z.stars.map((p) => {
    const type = p[2] === undefined ? 1 : p[2];
    if (type === 0) return { type };
    if (type === 2) return { type, c: 's', t: SKY_SPECIAL };
    const w = SKY_WISHES[wi++ % SKY_WISHES.length];
    return { type, c: w.c, t: w.t };
  });
  const N = info.filter((s) => s.type > 0).length;

  // Sao nhỏ sáng theo khi có sao chạm được nằm cách tối đa 2 nấc
  const adj = Z.stars.map(() => []);
  Z.lines.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const near = Z.stars.map((_, i) => {
    if (info[i].type > 0) return [];
    const seen = new Set([i]); let fr = [i], res = [];
    for (let d = 0; d < 2; d++) {
      const nx = [];
      fr.forEach((u) => adj[u].forEach((w) => { if (!seen.has(w)) { seen.add(w); nx.push(w); if (info[w].type > 0) res.push(w); } }));
      fr = nx;
    }
    return res;
  });

  const xs = Z.stars.map((p) => p[0]), ys = Z.stars.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);

  let W = 0, H = 0, dpr = 1, running = false, t0 = 0, HX = 0, HY = 0;
  let stars = [], bg = [], shooters = [], rings = [];
  let lit = 0, done = false, sceneT = 0, sceneStart = 0, msgTimer = 0;
  let S = 1, endScale = 0.55, endCY = 0;   // hệ số phóng + vị trí chòm sao ở màn kết

  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
    const s = Math.min(Math.min(W * 0.82, 620) / bw, (H * 0.5) / bh);
    S = s; HX = W / 2; HY = H * 0.47;
    const old = stars;
    stars = Z.stars.map((p, i) => ({
      x: HX + (p[0] - (minX + maxX) / 2) * s, y: HY + (p[1] - (minY + maxY) / 2) * s,
      ph: i * 1.3, type: info[i].type, c: info[i].c, text: info[i].t, litAt: old[i] ? old[i].litAt : 0
    }));
    if (!bg.length) {
      for (let i = 0; i < 130; i++) bg.push({ x: Math.random(), y: Math.random() * 0.9, r: 0.4 + Math.random() * 1.3,
        ph: Math.random() * 6.28, sp: 0.8 + Math.random() * 1.8 });
    }
  }

  function sparkle(x, y, r, color, glow, alpha) {
    cx.save();
    cx.globalAlpha = alpha * 0.55;
    const g = cx.createRadialGradient(x, y, 0, x, y, r * glow);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r * glow, 0, 6.283); cx.fill();
    cx.globalAlpha = alpha; cx.fillStyle = color; cx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i - Math.PI / 2, rr = i % 2 === 0 ? r : r * 0.3;
      cx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    cx.closePath(); cx.fill(); cx.restore();
  }

  function addShooter() {
    shooters.push({ x: W * (0.45 + Math.random() * 0.55), y: -10, vx: -(5 + Math.random() * 3), vy: 3 + Math.random() * 2, life: 70 });
  }

  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    cx.clearRect(0, 0, W, H);

    bg.forEach((b) => {
      cx.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * b.sp + b.ph));
      cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(b.x * W, b.y * H, b.r, 0, 6.283); cx.fill();
    });
    cx.globalAlpha = 1;

    shooters = shooters.filter((s) => s.life > 0);
    shooters.forEach((s) => {
      s.x += s.vx; s.y += s.vy; s.life--;
      const g = cx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      cx.strokeStyle = g; cx.lineWidth = 2; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); cx.stroke();
    });
    if (!done && Math.random() < 0.004) addShooter();

    if (sceneStart && sceneT < 1) sceneT = Math.min(1, (now - sceneStart) / 1800);
    const e = 1 - Math.pow(1 - sceneT, 3);
    const sc = 1 - (1 - endScale) * e, shift = (endCY - HY) * e;
    cx.save();
    cx.translate(HX, HY + shift); cx.scale(sc, sc); cx.translate(-HX, -HY);

    // thời điểm sáng của từng sao (sao nhỏ sáng theo sao lớn gần nó)
    const L = stars.map((s, i) => {
      if (s.type > 0) return s.litAt;
      let m = 0; near[i].forEach((j) => { const a = stars[j].litAt; if (a && (!m || a < m)) m = a; });
      return m || (done ? sceneStart : 0);
    });

    Z.lines.forEach(([a, b]) => {
      if (!L[a] || !L[b]) return;
      const age = Math.min(1, (now - Math.max(L[a], L[b])) / 700);
      cx.save(); cx.globalAlpha = 0.7 * age; cx.strokeStyle = '#dbe6ff'; cx.lineWidth = 1.3;
      cx.shadowColor = '#bcd2ff'; cx.shadowBlur = 8;
      cx.beginPath(); cx.moveTo(stars[a].x, stars[a].y); cx.lineTo(stars[b].x, stars[b].y); cx.stroke(); cx.restore();
    });

    stars.forEach((s, i) => {
      if (s.type === 0) {
        if (L[i]) sparkle(s.x, s.y, 5.5 * (0.6 + 0.4 * Math.min(1, (now - L[i]) / 400)), '#e4ecff', 3.5, 0.95);
        else { cx.globalAlpha = 0.45; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(s.x, s.y, 1.7, 0, 6.283); cx.fill(); cx.globalAlpha = 1; }
        return;
      }
      const special = s.type === 2;
      if (s.litAt) {
        const pop = Math.min(1, (now - s.litAt) / 400);
        const breathe = 1 + 0.08 * Math.sin(t * 2 + s.ph) + (done ? 0.1 * Math.sin(t * 3) : 0);
        sparkle(s.x, s.y, (special ? 16 : 12) * (0.6 + 0.4 * pop) * breathe, COLORS[s.c], 5, 1);
      } else {
        sparkle(s.x, s.y, 7 + 2 * Math.sin(t * 2.4 + s.ph), special ? COLORS.s : '#e8e4ff', 3.2, 0.9);
        const rp = ((t * 0.7 + s.ph) % 1);
        cx.save(); cx.globalAlpha = (1 - rp) * 0.45; cx.strokeStyle = '#e8e4ff'; cx.lineWidth = 1;
        cx.beginPath(); cx.arc(s.x, s.y, 10 + rp * 16, 0, 6.283); cx.stroke(); cx.restore();
      }
    });

    rings = rings.filter((r) => now - r.t < 900);
    rings.forEach((r) => {
      const p = (now - r.t) / 900;
      cx.save(); cx.globalAlpha = 1 - p; cx.strokeStyle = r.color; cx.lineWidth = 2;
      cx.beginPath(); cx.arc(r.x, r.y, 12 + p * 60, 0, 6.283); cx.stroke(); cx.restore();
    });
    cx.restore();
    requestAnimationFrame(frame);
  }

  function lightStar(i, now) {
    const s = stars[i]; if (s.litAt) return;
    s.litAt = now; lit++;
    rings.push({ x: s.x, y: s.y, t: now, color: COLORS[s.c] });
    hintEl.classList.add('hide-fade');
    cntEl.textContent = lit + ' / ' + N;
    msgEl.classList.remove('show');
    clearTimeout(msgTimer);
    setTimeout(() => { msgEl.textContent = s.text; msgEl.classList.add('show'); }, 150);
    msgTimer = setTimeout(() => msgEl.classList.remove('show'), 4300);
    if (lit === N) complete();
  }

  // Căn cả cụm (chòm sao + chữ + nút) vào giữa màn hình theo chiều cao
  function placeFinal() {
    finalEl.style.top = '0px';
    const th = finalEl.offsetHeight, gap = Math.max(14, H * 0.025);
    const baseH = Math.max(1, (maxY - minY) * S);
    let ch = Math.min(H * 0.44, baseH * 0.95);
    ch = Math.max(H * 0.18, Math.min(ch, H * 0.94 - gap - th));
    endScale = ch / baseH;
    const top = Math.max(H * 0.03, (H - (ch + gap + th)) / 2);
    endCY = top + ch / 2;
    finalEl.style.top = (top + ch + gap) + 'px';
  }

  function complete() {
    done = true;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => {
      msgEl.classList.remove('show'); cntEl.classList.add('hide-fade');
      const nm = (typeof displayName !== 'undefined' ? displayName.textContent : '').replace('!', '').trim();
      $('skySign').textContent = pad(SKY_BIRTH.day) + '/' + pad(SKY_BIRTH.month) + ' · ' + Z.name;
      $('skyFinalTitle').textContent = 'Chúc ' + (nm || 'cậu') + ' một năm mới thật nhiều ánh sáng ✨';
      placeFinal();
      sceneStart = performance.now();
      [0, 500, 1100].forEach((d) => setTimeout(addShooter, d));
      setTimeout(() => finalEl.classList.add('show'), 1700);
    }, 3600);
  }

  cv.addEventListener('pointerdown', (e) => {
    if (done) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 34;
    stars.forEach((s, i) => { if (s.type > 0 && !s.litAt) { const d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = i; } } });
    if (best >= 0) lightStar(best, performance.now());
  });
  window.addEventListener('resize', () => { if (running) { layout(); if (sceneStart) placeFinal(); } });
  $('skyReplayBtn').addEventListener('click', () => location.reload());
  $('skyFinalText').textContent = SKY_CLOSING;

  window.startSkyFinale = function () {
    if (running) return;
    layout();
    cntEl.textContent = '0 / ' + N;
    running = true; t0 = performance.now();
    screen.classList.add('show');
    requestAnimationFrame(frame);
    setTimeout(() => { if (typeof albumScreen !== 'undefined') albumScreen.style.display = 'none'; }, 2200);
  };
})();