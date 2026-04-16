import json
import os
import time
import hashlib
import urllib.request

_usage: dict = {}
DAILY_LIMIT = 5


def get_ip_key(ip: str) -> str:
    today = time.strftime("%Y-%m-%d")
    return f"{today}:{hashlib.md5(ip.encode()).hexdigest()}"


def handler(event: dict, context) -> dict:
    """Генерирует рекламные объявления для Яндекс Директ через Anthropic Claude."""

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

    if not description:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Описание не может быть пустым"}, ensure_ascii=False),
        }

    prompt = f"""Ты — опытный копирайтер для контекстной рекламы Яндекс Директ.
На основе описания бизнеса/предложения составь объявление строго по требованиям:

Требования Яндекс Директ:
- Заголовок 1: не более 56 символов (включая пробелы). Должен цеплять, содержать ключевую выгоду или оффер.
- Заголовок 2: не более 30 символов. Уточняющий, дополняющий заголовок 1.
- Текст объявления: не более 81 символа. Раскрывает главное преимущество, призыв к действию.

Правила:
- Считай каждый символ включая пробелы, знаки препинания — НЕ превышай лимиты
- Используй активные глаголы, конкретные цифры если есть
- Не используй восклицательные знаки в начале предложений
- Пиши по-русски, деловым языком

Описание бизнеса/предложения:
{description}

Верни ТОЛЬКО JSON в формате:
{{"title1": "...", "title2": "...", "text": "..."}}

Без пояснений, без markdown, только JSON."""

    api_key = os.environ["ANTHROPIC_API_KEY"]
    payload = json.dumps({
        "model": "claude-haiku-4-5",
        "max_tokens": 300,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        resp_data = json.loads(resp.read().decode("utf-8"))

    raw = resp_data["content"][0]["text"].strip()

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
