import json
import os
import time
import hashlib
import urllib.request

_usage: dict = {}
DAILY_LIMIT = 5

GEN_API_URL = "https://proxy.gen-api.ru/v1/chat/completions"

TONE_DESCRIPTIONS = {
    "neutral": "нейтральный деловой тон — чётко, по делу, без лишних эмоций",
    "friendly": "дружелюбный и живой тон — как будто советует хороший знакомый, тепло и искренне",
    "aggressive": "агрессивный оффер — давит на срочность, выгоду и страх упустить, энергично и напористо",
}


def get_ip_key(ip: str) -> str:
    today = time.strftime("%Y-%m-%d")
    return f"{today}:{hashlib.md5(ip.encode()).hexdigest()}"


def handler(event: dict, context) -> dict:
    """Генерирует рекламные объявления для Яндекс Директ через gen-api.ru (GPT-4 Turbo)."""

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")
    ip_key = get_ip_key(ip)
    current_count = _usage.get(ip_key, 0)

    if current_count >= DAILY_LIMIT:
        return {
            "statusCode": 429,
            "headers": cors_headers,
            "body": json.dumps({"error": "Лимит генераций на сегодня исчерпан (5/5). Возвращайся завтра!"}, ensure_ascii=False),
        }

    body = json.loads(event.get("body") or "{}")
    description = (body.get("description") or "").strip()
    tone = (body.get("tone") or "neutral").strip()
    if tone not in TONE_DESCRIPTIONS:
        tone = "neutral"
    tone_desc = TONE_DESCRIPTIONS[tone]

    if not description:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Описание не может быть пустым"}, ensure_ascii=False),
        }

    prompt = f"""Ты — опытный специалист по performance-маркетингу с уклоном в Яндекс Директ и VK Ads. Твоя задача — создавать рекламные объявления, которые привлекают внимание, быстро доносят суть и побуждают к действию.

ВАЖНО:
— Пиши максимально лаконично (без воды)
— Используй живой, разговорный стиль
— Избегай клише ("высокое качество", "лучшее предложение" и т.д.)
— Каждый текст должен цеплять с первых слов
— Учитывай вводные данные и усиливай сильные стороны оффера
— Добавляй конкретику (цифры, выгоды, сроки, факты), если они есть
— Не выдумывай то, чего нет во вводных

ТОН ТЕКСТА: {tone_desc}

ЗАДАЧА:
На основе вводных данных сгенерируй рекламное объявление для Яндекс Директ.

Технические требования:
- Заголовок 1: не более 56 символов (включая пробелы). Главный крючок — оффер, выгода или боль с первых слов.
- Заголовок 2: не более 30 символов. Уточняет или усиливает заголовок 1.
- Текст объявления: не более 81 символа. Конкретная выгода + призыв к действию.

Технические правила:
- Считай каждый символ включая пробелы и знаки препинания — НЕ превышай лимиты
- Не используй восклицательные знаки в самом начале предложения

Вводные данные:
{description}

Верни ТОЛЬКО JSON в формате:
{{"title1": "...", "title2": "...", "text": "..."}}

Без пояснений, без markdown, только JSON."""

    api_key = os.environ["OPENAI_API_KEY"]
    payload = json.dumps({
        "model": "chat-gpt-4-turbo",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 300,
        "temperature": 0.75,
        "is_sync": True,
    }).encode("utf-8")

    req = urllib.request.Request(
        GEN_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        resp_data = json.loads(resp.read().decode("utf-8"))

    raw = resp_data["choices"][0]["message"]["content"].strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)

    result["title1"] = result["title1"][:56]
    result["title2"] = result["title2"][:30]
    result["text"] = result["text"][:81]

    _usage[ip_key] = current_count + 1

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps(result, ensure_ascii=False),
    }
