// Ngày sinh do người dùng nhập ở màn hình đầu (hpbd1.js gán vào đây) → tự chọn chòm sao. Giá trị dưới là mặc định.
const SKY_BIRTH = { day: 25, month: 10};
// 'libra','scorpio','sagittarius','capricorn','aquarius','pisces'. Để '' = tự đoán theo ngày sinh.
const SKY_SIGN = '';

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

  // ⚙️ CHỈNH ĐỘ NHẠY Ở ĐÂY
  const NEED = 0.3;          // số giây thổi liên tục để tắt 1 nến (nhỏ hơn = dễ hơn)
  const MARGIN_START = 5;    // dB: tiếng phải lớn hơn tiếng ồn nền bấy nhiêu mới tính là thổi
  const MARGIN_MIN = 2.5;    // dB: độ nhạy tự tăng dần về mức này nếu thổi mãi chưa tắt

  let mode = 'idle', out = 0, acc = 0, db = -90, baseDb = -70, margin = MARGIN_START, last = 0;
  let actx = null, analyser = null, tbuf = null, stream = null;
  let press = false, calibrating = false, calibStart = 0, samples = [], readyAt = 0, warned = false;

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
    actx.createMediaStreamSource(stream).connect(analyser);
    tbuf = new Float32Array(analyser.fftSize);
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
      calibrating = true; calibStart = performance.now(); samples = [];
      setHint('Nhắm mắt lại, ước một điều… 💭');
      setTimeout(() => { if (mode === 'ready') setHint('Giờ thì thổi nến nào! 🕯️💨<small>thổi gần micro, một hơi đều là được</small>'); }, 1100);
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

    // Đo âm lượng (dB) từ sóng âm; hơi thổi làm âm lượng tăng vọt so với tiếng ồn nền
    if (analyser) {
      analyser.getFloatTimeDomainData(tbuf);
      let s = 0; for (let i = 0; i < tbuf.length; i++) s += tbuf[i] * tbuf[i];
      const cur = 20 * Math.log10(Math.sqrt(s / tbuf.length) + 1e-7);
      db = db * 0.6 + cur * 0.4;
      if (calibrating) {                                   // đo tiếng ồn nền ~1 giây đầu
        samples.push(cur);
        if (t - calibStart > 1000) {
          samples.sort((a, b) => a - b);
          const low = samples.slice(0, Math.max(1, Math.floor(samples.length * 0.6)));
          baseDb = Math.max(-80, low.reduce((a, b) => a + b, 0) / low.length);
          calibrating = false; readyAt = t;
        }
      }
    }

    // Độ nhạy tự tăng dần nếu thổi lâu mà chưa tắt nến nào
    const elapsed = calibrating || !readyAt ? 0 : (t - readyAt) / 1000;
    margin = Math.max(MARGIN_MIN, MARGIN_START - elapsed * 0.4);
    if (!warned && elapsed > 6 && out === 0 && !press) {
      warned = true;
      setHint('Thổi sát micro hơn, một hơi dài và đều nhé 💨' + FALLBACK);
    }

    let up = calibrating || !analyser ? 0 : db - baseDb;   // tăng bao nhiêu dB so với nền
    if (press) up = Math.max(up, margin + 12);             // giữ vào bánh = thổi
    const blowing = !calibrating && up > margin;
    const strength = blowing ? Math.min(1, 0.5 + (up - margin) / 15)
                             : Math.min(0.3, Math.max(0, up / margin) * 0.3);

    fill.style.width = Math.max(0, Math.min(100, (up / (margin + 12)) * 100)) + '%';

    svg.classList.toggle('blowing', strength > 0.02);
    flames.forEach((f, i) => {
      if (i < out) return;
      const wob = Math.sin(t / 60 + i * 1.7) * strength * 6;
      f.style.transform = `skewX(${-(strength * 30 + wob)}deg) scaleY(${1 - strength * 0.4})`;
    });

    acc = blowing ? acc + dt : Math.max(0, acc - dt * 0.5);
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
    gemini: { name: 'Gemini', stars: [   // dựng lại theo ảnh mẫu
      [37,73,1],[77,33,1],[197,139,2],[134,184,1],[199,245,1],[231,205,0],[249,179,1],[275,182,1]],
      lines: [[0,1],[1,2],[2,6],[0,3],[3,4],[4,5],[5,6],[6,7]] },
    cancer: { name: 'Cancer', stars: [   // dựng lại theo ảnh mẫu
      [503,53,1],[470,124,1],[445,150,2],[432,156,0],[380,186,1],[457,271,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[2,5]] },
    leo: { name: 'Leo', stars: [   // dựng lại theo ảnh mẫu
      [576,367,2],[549,294,0],[485,267,1],[474,208,0],[538,133,1],[577,155,0],[287,328,1],[312,407,1],[183,463,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[6,8],[8,7],[7,6],[7,0]] },
    virgo: { name: 'Virgo', stars: [   // dựng lại theo ảnh mẫu
      [490,117,1],[469,194,0],[440,221,1],[400,207,1],[360,168,1],[359,269,1],[311,285,0],[241,330,1],[416,321,2],[345,365,1],[322,344,0],[281,372,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[3,5],[2,8],[5,8],[5,6],[6,7],[8,9],[9,10],[10,11]] },
    libra: { name: 'Libra', stars: [   // dựng lại theo ảnh mẫu
      [158,38,1],[257,76,1],[270,188,1],[213,252,0],[205,259,0],[212,276,1],[138,119,2],[105,160,1],[77,142,1]],
      lines: [[0,1],[1,2],[0,2],[2,3],[3,4],[4,5],[0,6],[6,7],[7,8]] },
    sagittarius: { name: 'Sagittarius', stars: [   // dựng lại theo ảnh mẫu
      [107,28,1],[100,47,1],[131,72,1],[155,70,0],[160,102,0],[162,111,1],[180,122,1],[131,124,1],[151,147,2],[219,142,1],[209,106,1],[240,72,1],[246,152,1],[209,178,1],[223,199,1],[48,193,1],[68,243,0],[114,229,0],[119,261,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,5],[5,6],[6,9],[5,7],[7,8],[7,15],[8,15],[9,10],[10,11],[11,12],[12,9],[9,13],[13,14],[14,12],[15,17],[17,18],[15,16],[16,18]] },
    capricorn: { name: 'Capricorn', stars: [   // dựng lại theo ảnh mẫu
      [230,88,0],[228,105,2],[47,161,1],[101,153,0],[140,146,1],[108,200,1],[192,217,1]],
      lines: [[0,1],[1,4],[4,3],[3,2],[2,5],[5,6],[6,1]] },
    aquarius: { name: 'Aquarius', stars: [   // dựng lại theo ảnh mẫu
      [47,385,1],[73,402,1],[77,440,1],[62,458,0],[29,494,1],[130,369,1],[140,371,1],[148,380,0],[178,382,2],[155,432,1],[211,429,1],[277,470,1]],
      lines: [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[8,9],[8,10],[10,11]] },
    pisces: { name: 'Pisces', stars: [   // dựng lại theo ảnh mẫu
      [48,37,1],[38,45,0],[31,54,1],[27,66,1],[43,62,1],[57,76,0],[72,78,1],[92,71,2],[105,58,1],[118,63,1],[114,76,1],[101,80,0]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,7]] },
  };
  const STARTS = [['aquarius',120],['pisces',219],['aries',321],['taurus',420],['gemini',521],['cancer',621],
    ['leo',723],['virgo',823],['libra',923],['scorpio',1023],['sagittarius',1122],['capricorn',1222]];
  let Z, info, N, adj, near, xs, ys, minX, maxX, minY, maxY;
  const pad = (n) => String(n).padStart(2, '0');

  const $ = (id) => document.getElementById(id);
  const screen = $('skyScreen'), cv = $('skyCanvas');
  if (!screen || !cv) return;
  const cx = cv.getContext('2d');
  const hintEl = $('skyHint'), msgEl = $('skyMessage'), cntEl = $('skyCounter'), finalEl = $('skyFinal');
  const COLORS = { g: '#ffb6d5', m: '#ffe29a', f: '#a9d8ff', s: '#fff6d8' };



  function setupSign() {
  const v = SKY_BIRTH.month * 100 + SKY_BIRTH.day;
  let key = 'capricorn'; STARTS.forEach(([n, s]) => { if (v >= s) key = n; });
  if (SKY_SIGN && ZODIAC[SKY_SIGN]) key = SKY_SIGN;
  Z = ZODIAC[key];
  // Gán lời chúc cho các sao chạm được (theo thứ tự), sao đặc biệt nhận SKY_SPECIAL
  let wi = 0;
  info = Z.stars.map((p) => {
    const type = p[2] === undefined ? 1 : p[2];
    if (type === 0) return { type };
    if (type === 2) return { type, c: 's', t: SKY_SPECIAL };
    const w = SKY_WISHES[wi++ % SKY_WISHES.length];
    return { type, c: w.c, t: w.t };
  });
  N = info.filter((s) => s.type > 0).length;

  // Sao nhỏ sáng theo khi có sao chạm được nằm cách tối đa 2 nấc
  adj = Z.stars.map(() => []);
  Z.lines.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  near = Z.stars.map((_, i) => {
    if (info[i].type > 0) return [];
    const seen = new Set([i]); let fr = [i], res = [];
    for (let d = 0; d < 2; d++) {
      const nx = [];
      fr.forEach((u) => adj[u].forEach((w) => { if (!seen.has(w)) { seen.add(w); nx.push(w); if (info[w].type > 0) res.push(w); } }));
      fr = nx;
    }
    return res;
  });

  xs = Z.stars.map((p) => p[0]), ys = Z.stars.map((p) => p[1]);
  minX = Math.min(...xs); maxX = Math.max(...xs); minY = Math.min(...ys); maxY = Math.max(...ys);
  }

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
    setupSign();
    layout();
    cntEl.textContent = '0 / ' + N;
    running = true; t0 = performance.now();
    screen.classList.add('show');
    requestAnimationFrame(frame);
    setTimeout(() => { if (typeof albumScreen !== 'undefined') albumScreen.style.display = 'none'; }, 2200);
  };
})();