# AI Voice Assistant — GPT + Inworld TTS

Готовый пример сайта, который:

- принимает текстовый запрос;
- отправляет его в OpenAI;
- получает ответ GPT;
- отправляет ответ в Inworld TTS;
- воспроизводит голос Sarah;
- поддерживает голосовой ввод через браузер.

## 1. Установить Python

Нужен Python 3.10+.

## 2. Установить зависимости

```bash
pip install -r requirements.txt
```

## 3. Создать `.env`

Скопируйте `.env.example` в `.env`:

```bash
copy .env.example .env
```

В Linux/macOS:

```bash
cp .env.example .env
```

Затем вставьте свои ключи:

```env
OPENAI_API_KEY=...
INWORLD_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

Не публикуйте `.env` и не отправляйте его в GitHub.

## 4. Запустить

```bash
python app.py
```

Откройте:

http://127.0.0.1:5000

## Важно про Inworld

В проекте используется серверный вызов Inworld TTS. API-ключ не передается браузеру.

Для продакшн-сайта оставляйте секретные ключи только на backend.

## Голосовой ввод

Кнопка 🎤 использует Speech Recognition браузера. Поддержка зависит от браузера.

Если нужен настоящий production voice assistant, следующий шаг — заменить браузерный Speech Recognition на серверный/Realtime STT и добавить потоковый Inworld TTS.

## Кнопка ChatGPT

В шапке сайта добавлена кнопка, которая открывает указанный ChatGPT-чат:

https://chatgpt.com/c/6a7c35f8-4d80-83eb-af88-e824e20e55ca

Это обычная ссылка на интерфейс ChatGPT. Она не даёт сайту доступ к истории этого чата или его API.
