// ——————————————————————————————————————————
// 1. Звёздное поле на фоне
// ——————————————————————————————————————————
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let stars    = [];
const numStars = 200;
const speed    = 0.02;

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width
    });
  }
}
initStars();

function animateStars() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let s of stars) {
    s.z -= speed * canvas.width;
    if (s.z <= 0) {
      s.x = Math.random() * canvas.width;
      s.y = Math.random() * canvas.height;
      s.z = canvas.width;
    }
    const k = 128.0 / s.z;
    const px = (s.x - canvas.width/2) * k + canvas.width/2;
    const py = (s.y - canvas.height/2) * k + canvas.height/2;
    const size = (1 - s.z / canvas.width) * 3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI*2);
    ctx.fill();
  }
  requestAnimationFrame(animateStars);
}
animateStars();


// ——————————————————————————————————————————
// 2. Логика чата с эффектом набора
// ——————————————————————————————————————————
const chatWindow = document.getElementById('chat-window');
const inputField = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');

sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;
  appendMsg('user', text);
  inputField.value = '';
  const botTextEl = appendMsg('bot', '');
  await typewriter(botTextEl, 'Печатает…', 40);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': '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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages: [{ role: 'user', content: text }]
      })
    });
    const json  = await res.json();
    const reply = json.choices[0].message.content;
    await typewriter(botTextEl, reply, 20);
  } catch (err) {
    await typewriter(botTextEl, 'Ошибка при получении ответа.', 20);
    console.error(err);
  }
}

// Добавление сообщений
function appendMsg(who, text) {
  const msg = document.createElement('div');
  msg.className = `message ${who}`;
  msg.innerHTML = `<span class="text"></span>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  const textEl = msg.querySelector('.text');
  textEl.innerText = text;
  return textEl;
}

// Эффект «набор текста»
function typewriter(el, fullText, speed) {
  return new Promise(resolve => {
    el.innerText = '';
    let i = 0;
    const iv = setInterval(() => {
      el.innerText += fullText.charAt(i++);
      if (i >= fullText.length) {
        clearInterval(iv);
        resolve();
      }
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, speed);
  });
}
