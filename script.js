const chatWindow = document.getElementById("chat-window");
const input = document.getElementById("user-input");

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage("👤", userText);
  input.value = "";

  const botMsg = appendMessage("🤖", "...");
  typewriter(botMsg, "🤖", "Печатает...");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_OPENROUTER_API_KEY",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: userText }]
      })
    });

    const data = await response.json();
    const aiText = data.choices[0].message.content;
    typewriter(botMsg, "🤖", aiText);
  } catch (err) {
    typewriter(botMsg, "🤖", "Ошибка при получении ответа.");
    console.error(err);
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = "message";
  msg.innerHTML = `<strong>${sender}</strong>: <span class="text">${text}</span>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg.querySelector(".text");
}

function typewriter(element, sender, fullText, speed = 20) {
  element.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    element.innerHTML += fullText.charAt(i);
    i++;
    if (i >= fullText.length) clearInterval(interval);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, speed);
}