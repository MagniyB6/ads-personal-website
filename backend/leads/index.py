"""
Сохранение заявок из чат-бота в БД и отправка уведомления в Telegram.
"""
import json
import os
import psycopg2  # noqa: F401 — requires psycopg2-binary in requirements.txt
import urllib.request


def send_telegram(token: str, chat_id: str, text: str):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10)


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    if event.get("httpMethod") == "GET":
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute("""
            SELECT id, niche, company_info, ads_exp, platform, budget, name, phone, messenger,
                   utm_source, utm_campaign, utm_group, created_at
            FROM t_p38226403_ads_personal_website.leads
            ORDER BY created_at DESC
            LIMIT 100
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        leads = [
            {
                "id": r[0],
                "niche": r[1],
                "company_info": r[2],
                "ads_exp": r[3],
                "platform": r[4],
                "budget": r[5],
                "name": r[6],
                "phone": r[7],
                "messenger": r[8],
                "utm_source": r[9],
                "utm_campaign": r[10],
                "utm_group": r[11],
                "created_at": r[12].isoformat() if r[12] else None,
            }
            for r in rows
        ]
        return {"statusCode": 200, "headers": cors, "body": {"leads": leads}}

    body = json.loads(event.get("body") or "{}")
    niche = body.get("niche", "")
    company_info = body.get("company_info", "")
    ads_exp = body.get("ads_exp", "")
    platform = body.get("platform", "")
    budget = body.get("budget", "")
    name = body.get("name", "")
    phone = body.get("phone", "")
    messenger = body.get("messenger", "")
    utm_source = body.get("utm_source", "")
    utm_campaign = body.get("utm_campaign", "")
    utm_group = body.get("utm_group", "")

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO t_p38226403_ads_personal_website.leads
          (niche, company_info, ads_exp, platform, budget, name, phone, messenger,
           utm_source, utm_campaign, utm_group)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (niche, company_info, ads_exp, platform, budget, name, phone, messenger,
         utm_source, utm_campaign, utm_group),
    )
    lead_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if token and chat_id and not token.startswith("test"):
        utm_block = ""
        if utm_source or utm_campaign or utm_group:
            utm_block = (
                f"\n\n🎯 <b>UTM-метки:</b>\n"
                f"  Source: {utm_source or '—'}\n"
                f"  Кампания: {utm_campaign or '—'}\n"
                f"  Группа: {utm_group or '—'}"
            )
        msg = (
            f"🔔 <b>Новая заявка #{lead_id}</b>\n\n"
            f"👤 <b>Имя:</b> {name}\n"
            f"📞 <b>Телефон:</b> {phone}\n"
            f"💬 <b>Мессенджер:</b> {messenger}\n\n"
            f"🏢 <b>Ниша:</b> {niche}\n"
            f"🌐 <b>Компания/сайт:</b> {company_info}\n"
            f"📊 <b>Опыт рекламы:</b> {ads_exp}\n"
            f"📢 <b>Площадка:</b> {platform}\n"
            f"💰 <b>Бюджет:</b> {budget}"
            f"{utm_block}"
        )
        try:
            send_telegram(token, chat_id, msg)
        except Exception:
            pass

    return {
        "statusCode": 200,
        "headers": cors,
        "body": {"ok": True, "id": lead_id},
    }