const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");
const mic = document.getElementById("mic");
const status = document.getElementById("status");

let messages = [];
let recognition = null;
let recording = false;

function addMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
}

function setStatus(text) {
    status.textContent = text;
}

async function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    addMessage("user", text);
    messages.push({ role: "user", content: text });
    input.value = "";

    send.disabled = true;
    mic.disabled = true;
    setStatus("Думаю...");

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({messages})
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Ошибка сервера");
        }

        addMessage("ai", data.text);
        messages.push({ role: "assistant", content: data.text });

        setStatus("Озвучиваю...");
        await speak(data.text);
        setStatus("Готов");
    } catch (error) {
        addMessage("ai", "Ошибка: " + error.message);
        setStatus("Ошибка");
    } finally {
        send.disabled = false;
        mic.disabled = false;
    }
}

async function speak(text) {
    const response = await fetch("/api/tts", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text})
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Ошибка Inworld TTS");
    }

    const binary = atob(data.audio);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], {type: data.mime || "audio/mpeg"});
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    await audio.play();

    audio.onended = () => URL.revokeObjectURL(url);
}

send.addEventListener("click", () => sendMessage(input.value));

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage(input.value);
    }
});

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
        recording = true;
        mic.classList.add("recording");
        mic.textContent = "⏹";
        setStatus("Слушаю...");
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        input.value = text;
        sendMessage(text);
    };

    recognition.onerror = (event) => {
        setStatus("Ошибка микрофона");
        console.error(event.error);
    };

    recognition.onend = () => {
        recording = false;
        mic.classList.remove("recording");
        mic.textContent = "🎤";
        if (status.textContent === "Слушаю...") setStatus("Готов");
    };

    mic.addEventListener("click", () => {
        if (recording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
} else {
    mic.disabled = true;
    mic.title = "Speech Recognition не поддерживается этим браузером";
}
