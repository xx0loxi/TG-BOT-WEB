// ====================================
// 1. Звёздное поле с мерцанием
// ====================================
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let stars    = [];
const numStars = 250;
const speed    = 0.0005;

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initStars() {
  stars = Array.from({ length: numStars }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * canvas.width,
    blink: Math.random() * 1.5
  }));
}
initStars();

function renderStars() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    s.z -= speed * canvas.width;
    s.blink += 0.02;
    if (s.z <= 0) {
      s.x = Math.random() * canvas.width;
      s.y = Math.random() * canvas.height;
      s.z = canvas.width;
    }
    const k = 128.0 / s.z;
    const px = (s.x - canvas.width/2) * k + canvas.width/2;
    const py = (s.y - canvas.height/2) * k + canvas.height/2;
    const size = (1 - s.z / canvas.width) * 3;
    const alpha = 0.5 + Math.sin(s.blink) * 0.5;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });

  requestAnimationFrame(renderStars);
}
renderStars();

// ====================================
// 2. Чат-логика с обработкой ошибок
// ====================================
const chatWindow = document.getElementById('chat-window');
const inputField = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat');

let isProcessing = false;

sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
newChatBtn.addEventListener('click', clearChat);

function appendMsg(role, content, isTyping = false) {
  const msg = document.createElement('div');
  msg.className = `message ${role}` + (isTyping ? ' typing' : '');
  if (isTyping) {
    msg.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  } else {
    msg.textContent = content;
  }
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg;
}

async function typewriter(el, text, speed = 20) {
  el.textContent = '';
  for (let i = 0; i < text.length; i++) {
    el.textContent += text.charAt(i);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    await new Promise(r => setTimeout(r, speed));
  }
}

async function sendMessage() {
  if (isProcessing) return;
  const text = inputField.value.trim();
  if (!text) return;

  appendMsg('user', text);
  inputField.value = '';
  isProcessing = true;
  sendBtn.disabled = true;

  // Показать типинг-индикатор
  const typingEl = appendMsg('bot', '', true);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization':
          'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages: [{ role: 'user', content: text }]
      })
    });

    const json = await response.json();
    console.log(json);

    // Удаляем индикатор
    typingEl.remove();

    if (response.ok && json.choices?.[0]?.message?.content) {
      const reply = json.choices[0].message.content;
      const botEl = appendMsg('bot', '');
      await typewriter(botEl, reply);
    } else {
      const errorMsg = json.error?.message || 'Сервер вернул пустой ответ';
      const botEl = appendMsg('bot', '');
      await typewriter(botEl, errorMsg);
    }
  } catch (err) {
    console.error(err);
    typingEl.remove();
    const botEl = appendMsg('bot', '');
    await typewriter(botEl, 'Ошибка сети или сервера.');
  } finally {
    isProcessing = false;
    sendBtn.disabled = false;
    inputField.focus();
  }
}

function clearChat() {
  chatWindow.innerHTML = '';
  inputField.value = '';
  inputField.focus();
}
