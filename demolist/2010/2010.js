const C = {
  to: 'Sứa',                  
  from: 'sireld',      
  wishes: [                       
    {e:'🌷', t:'Cảm ơn cậu vì luôn dịu dàng với tớ.'},
    {e:'🌸', t:'Mong cậu luôn xinh đẹp theo cách của riêng cậu.'},
    {e:'🌹', t:'Cậu xứng đáng được yêu thương nhiều hơn những gì cậu nghĩ.'},
    {e:'🌻', t:'Chúc cậu mỗi sáng thức dậy đều có một lý do để mỉm cười.'},
    {e:'🌼', t:'Nếu như cậu cảm thấy mệt mỏi hãy nhớ rằng tớ luôn ở đây để lắng nghe và ủng hộ cậu.'}
  ],
  letter: `Gửi {to},\n\nNhân ngày 20/10, tớ muốn nói với cậu vài điều như sau.\n\nCảm ơn cậu vì đã luôn ở đây, vì những lần lắng nghe, những lần động viên chia sẻ cho tớ và cả những lúc chơi gêm cùng nhau.\n\nMong cậu luôn xinh đẹp, khỏe mạnh, vui vẻ, đáng iu và được làm những điều cậu thích.\n\nChúc cậu một ngày 20/10 thật rạng rỡ nhé!`,
  prize: {t: 'Nái', d: 'Nái'},
  end: 'Chúc mừng 20/10, bạn Sứa đáng yêu 🌹'
};

/* ===== ĐIỀU HƯỚNG ===== */
const $ = id => document.getElementById(id);
let cur = 1;
function go(n) {
  $('p' + cur).classList.remove('on');
  cur = n;
  $('p' + n).classList.add('on');
  if (n === 4) initScratch();
}
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
  if (b.dataset.go === '2') playMusic();
  go(+b.dataset.go);
});
document.querySelectorAll('.to').forEach(e => e.textContent = C.to);

/* ===== NHẠC ===== */
const au = $('au'), mu = $('mu');
function playMusic() { au.volume = .5; au.play().then(() => mu.classList.add('on')).catch(() => {}); }
mu.onclick = () => { if (au.paused) playMusic(); else { au.pause(); mu.classList.remove('on'); } };

/* ===== TRANG 1: Chiikawa bay quanh ===== */
const POS = [
  ['chiikawa1',5,8],['momonga2',3,24],['chiikawa2',22,30],['momonga3',4,60],['chiikawa3',7,78],['momonga3',5,92],
  ['chiikawa5',40,3],['momonga2',56,15],['chiikawa1',38,88],['chiikawa2',78,12],['momonga2',84,32],
  ['chiikawa3',72,76],['momonga3',86,90],['chiikawa5',88,60]
];
const small = innerWidth < 600;
POS.forEach(([n, t, l], i) => {
  if (small && i % 2) return;
  const im = new Image();
  im.src = 'img/' + n + '.png'; im.className = 'fl';
  im.style.cssText = `top:${t}%;left:${l}%;width:${small ? 56 : 75}px;animation-delay:${(i % 5) * .5}s;animation-duration:${2.6 + (i % 4) * .3}s`;
  $('p1').appendChild(im);
});

/* ===== TRANG 2: vườn hoa ===== */
let opened = 0;
C.wishes.forEach(w => {
  const b = document.createElement('button');
  b.className = 'fw'; b.textContent = '🌱';
  b.onclick = () => {
    if (b.classList.contains('open')) return;
    b.textContent = w.e; b.classList.add('open');
    $('bub').style.opacity = 0;
    setTimeout(() => { $('bub').textContent = w.t; $('bub').style.opacity = 1; }, 250);
    $('cnt').textContent = ++opened + ' / ' + C.wishes.length;
    if (opened === C.wishes.length) setTimeout(() => $('b2').classList.remove('hide'), 900);
  };
  $('garden').appendChild(b);
});

/* ===== TRANG 3: phong bì + gõ chữ ===== */
$('env').onclick = () => {
  $('env').classList.add('open');
  setTimeout(() => {
    $('env').classList.add('gone'); $('eh').classList.add('hide');
    const lt = $('lt'); lt.classList.add('on');
    const txt = C.letter.replace('{to}', C.to), sign = C.from;
    let i = 0;
    const t = setInterval(() => {
      lt.textContent = txt.slice(0, ++i);
      lt.scrollTop = lt.scrollHeight;
      if (i >= txt.length) {
        clearInterval(t);
        lt.insertAdjacentHTML('beforeend', '<b>— ' + sign + ' —</b>');
        $('b3').classList.remove('hide');
      }
    }, 28);
  }, 700);
};

/* ===== TRANG 4: thẻ cào ===== */
$('pt').textContent = C.prize.t; $('pd').textContent = C.prize.d; $('fx').textContent = C.end;
const cv = $('cv'), cx = cv.getContext('2d');
let scratching = false, done = false;
function initScratch() {
  done = false; cv.style.opacity = 1; cv.style.pointerEvents = 'auto';
  $('fin').classList.remove('on'); $('sh').classList.remove('hide');
  cx.globalCompositeOperation = 'source-over';
  const g = cx.createLinearGradient(0, 0, 280, 170);
  g.addColorStop(0, '#d9d9e3'); g.addColorStop(.5, '#f4f4fa'); g.addColorStop(1, '#c4c4d2');
  cx.fillStyle = g; cx.fillRect(0, 0, 280, 170);
  cx.fillStyle = '#9a8fa6'; cx.font = '700 20px Mali, sans-serif'; cx.textAlign = 'center';
  cx.fillText('✨ CÀO Ở ĐÂY ✨', 140, 92);
}
function scratch(e) {
  if (!scratching || done) return;
  const r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) * 280 / r.width, y = (e.clientY - r.top) * 170 / r.height;
  cx.globalCompositeOperation = 'destination-out';
  cx.beginPath(); cx.arc(x, y, 18, 0, 7); cx.fill();
  checkScratch();
}
function checkScratch() {
  const d = cx.getImageData(0, 0, 280, 170).data;
  let clear = 0, n = 0;
  for (let i = 3; i < d.length; i += 64) { n++; if (d[i] < 20) clear++; }
  if (clear / n > .5) finish();
}
function finish() {
  done = true; cv.style.opacity = 0; cv.style.pointerEvents = 'none';
  $('sh').classList.add('hide'); $('fin').classList.add('on');
  petals(36);
}
cv.addEventListener('pointerdown', e => { scratching = true; cv.setPointerCapture(e.pointerId); scratch(e); });
cv.addEventListener('pointermove', scratch);
cv.addEventListener('pointerup', () => scratching = false);
$('rp').onclick = () => location.reload();

/* ===== CÁNH HOA RƠI ===== */
function petals(n) {
  const em = ['🌸', '🌷', '🌼', '💖', '🌺'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'pt'; s.textContent = em[i % em.length];
    s.style.cssText = `left:${Math.random() * 100}%;font-size:${16 + Math.random() * 16}px;animation-duration:${4 + Math.random() * 5}s;animation-delay:${Math.random() * 3}s`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 13000);
  }
}