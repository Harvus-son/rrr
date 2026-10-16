import os
import base64
import requests
from flask import Flask, request, jsonify, render_template
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

INWORLD_API_KEY = os.getenv("INWORLD_API_KEY")
INWORLD_URL = "https://api.inworld.ai/tts/v1/voice"

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])

    if not messages:
        return jsonify({"error": "Нет сообщений"}), 400

    try:
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
            instructions=(
                "Ты дружелюбный голосовой ассистент. "
                "Отвечай естественно и не слишком длинно, чтобы ответ было удобно слушать."
            ),
            input=messages,
        )
        text = response.output_text
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": "Не удалось обработать запрос к AI-сервису."}), 502

@app.post("/api/tts")
def tts():
    if not INWORLD_API_KEY:
        return jsonify({"error": "INWORLD_API_KEY не задан"}), 500

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "Пустой текст"}), 400

    payload = {
        "text": text,
        "voiceId": "Sarah",
        "modelId": "inworld-tts-2",
        "audioConfig": {
            "speakingRate": 1
        },
        "deliveryMode": "BALANCED",
        "language": "AUTO"
    }

    try:
        r = requests.post(
            INWORLD_URL,
            headers={
                "Authorization": f"Basic {INWORLD_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        r.raise_for_status()
        result = r.json()

        return jsonify({
            "audio": result["audioContent"],
            "mime": "audio/mpeg"
        })
    except requests.HTTPError:
        return jsonify({
            "error": "Сервис озвучивания временно недоступен."
        }), 502
    except Exception as e:
        return jsonify({"error": "Не удалось создать аудио."}), 502

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
