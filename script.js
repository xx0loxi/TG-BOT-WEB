// ====================================
// 1. Звёздное поле с мерцанием (без изменений)
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
    const k   = 128.0 / s.z;
    const px  = (s.x - canvas.width/2) * k + canvas.width/2;
    const py  = (s.y - canvas.height/2) * k + canvas.height/2;
    const sz  = (1 - s.z / canvas.width) * 3;
    const alp = 0.5 + Math.sin(s.blink) * 0.5;

    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${alp})`;
    ctx.fill();
  });

  requestAnimationFrame(renderStars);
}
renderStars();


// ====================================
// 2. Чат-логика с корректным разбором ответа
// ====================================
const chatWindow = document.getElementById('chat-window');
const inputField = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat');

let isProcessing = false;

// Вешаем обработчики
sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
newChatBtn.addEventListener('click', clearChat);

// Утилиты по вставке и анимации
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

// Основная отправка
async function sendMessage() {
  if (isProcessing) return;
  const userText = inputField.value.trim();
  if (!userText) return;

  // Пользовательское сообщение
  appendMsg('user', userText);
  inputField.value = '';
  isProcessing = true;
  sendBtn.disabled = true;

  // Показать typing-индикатор
  const typingEl = appendMsg('bot', '', true);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: userText }]
      })
    });

    const data = await res.json();
    console.log('API ответ:', data);

    // Убираем индикатор typing
    typingEl.remove();

    // Если HTTP-ошибка
    if (!res.ok) {
      const errMsg = data.error?.message || `HTTP ${res.status}`;
      appendMsg('bot', `Ошибка API: ${errMsg}`);
      return;
    }

    // Пытаемся достать текст ответа
    const aiText =
      data.choices?.[0]?.message?.content ||   // chat/completions
      data.choices?.[0]?.text             ||   // completions
      '';

    if (!aiText) {
      console.error('Нечего показывать, data:', data);
      appendMsg('bot', 'Пустой ответ от сервера. Проверьте токен и лимиты.');
      return;
    }

    // Набираем ответ
    const botEl = appendMsg('bot', '');
    await typewriter(botEl, aiText);

  } catch (err) {
    console.error('Сетевая ошибка:', err);
    typingEl.remove();
    appendMsg('bot', `Сетевая ошибка: ${err.message}`);
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
