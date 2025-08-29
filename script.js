const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const historyList = document.getElementById("history-list");
const tabChat = document.getElementById("tab-chat");
const tabHistory = document.getElementById("tab-history");
const sectionChat = document.getElementById("chat-section");
const sectionHistory = document.getElementById("history-section");
const newChatBtn = document.getElementById("new-chat");

let currentSession = [];
const STORAGE_KEY = 'chat_sessions';

// Переключение вкладок
tabChat.addEventListener('click', () => switchTab('chat'));
tabHistory.addEventListener('click', () => {
  switchTab('history');
  renderHistory();
});

// Новый чат
newChatBtn.addEventListener('click', () => {
  if (currentSession.length) saveSession();
  clearChat();
  switchTab('chat');
});

function switchTab(tab) {
  if (tab === 'chat') {
    tabChat.classList.add('active');
    tabHistory.classList.remove('active');
    sectionChat.classList.add('active');
    sectionHistory.classList.remove('active');
  } else {
    tabHistory.classList.add('active');
    tabChat.classList.remove('active');
    sectionHistory.classList.add('active');
    sectionChat.classList.remove('active');
  }
}

// Отправка сообщения
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage('👤', text);
  userInput.value = '';
  const botTextEl = appendMessage('🤖', '');
  typewriter(botTextEl, 'Печатает...');

  currentSession.push({ sender: 'user', text });
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }]
      })
    });
    const json = await res.json();
    const reply = json.choices[0].message.content;
    typewriter(botTextEl, reply);
    currentSession.push({ sender: 'bot', text: reply });
  } catch (err) {
    typewriter(botTextEl, 'Ошибка при получении ответа.');
    console.error(err);
  }
}

// Добавить сообщение в окно
function appendMessage(senderIcon, text) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.innerHTML = `<strong>${senderIcon}</strong>: <span class="text"></span>`;
  const textEl = msg.querySelector('.text');
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return textEl;
}

// Эффект «набор текста»
function typewriter(textEl, fullText, speed = 20) {
  textEl.innerHTML = '';
  let i = 0;
  const iv = setInterval(() => {
    textEl.innerHTML += fullText.charAt(i++);
    if (i >= fullText.length) clearInterval(iv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, speed);
}

// Сохранить текущую сессию в localStorage
function saveSession() {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const title = new Date().toLocaleString();
  sessions.push({ title, messages: currentSession });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Очистить окно чата и текущую сессию
function clearChat() {
  chatWindow.innerHTML = '';
  currentSession = [];
}

// Отобразить список сессий из localStorage
function renderHistory() {
  historyList.innerHTML = '';
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  sessions.forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = s.title;
    li.onclick = () => loadSession(idx);
    historyList.appendChild(li);
  });
}

// Загрузить выбранную сессию в чат
function loadSession(index) {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const { messages } = sessions[index];
  clearChat();
  messages.forEach(msg => {
    const el = appendMessage(msg.sender === 'bot' ? '🤖' : '👤', '');
    typewriter(el, msg.text, 0); // без задержки
    currentSession.push(msg);
  });
  switchTab('chat');
}
