import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Edit-Token",
    }

def resp(status, body):
    return {"statusCode": status, "headers": {**cors_headers(), "Content-Type": "application/json"}, "body": json.dumps(body, default=str)}

def handler(event: dict, context) -> dict:
    """CRUD для отчётов клиентам: создание, получение, обновление с хранением 5 часов"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    report_id = params.get("id")
    edit_token = (event.get("headers") or {}).get("X-Edit-Token") or params.get("edit_token")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"DELETE FROM {SCHEMA}.report_blocks WHERE report_id IN (SELECT id FROM {SCHEMA}.reports WHERE expires_at < NOW())")
    cur.execute(f"DELETE FROM {SCHEMA}.reports WHERE expires_at < NOW()")
    conn.commit()

    try:
        if method == "GET" and report_id:
            cur.execute(f"SELECT id, edit_token, title, project_name, date_from, date_to, cover_image_url, created_at, expires_at FROM {SCHEMA}.reports WHERE id = %s", (report_id,))
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Отчёт не найден или удалён"})
            report = {
                "id": str(row[0]), "edit_token": str(row[1]),
                "title": row[2], "project_name": row[3],
                "date_from": str(row[4]) if row[4] else None,
                "date_to": str(row[5]) if row[5] else None,
                "cover_image_url": row[6],
                "created_at": str(row[7]), "expires_at": str(row[8])
            }
            cur.execute(f"SELECT id, position, block_type, heading, body_text, image_url FROM {SCHEMA}.report_blocks WHERE report_id = %s ORDER BY position", (report_id,))
            blocks = [{"id": str(r[0]), "position": r[1], "block_type": r[2], "heading": r[3], "body_text": r[4], "image_url": r[5]} for r in cur.fetchall()]
            report["blocks"] = blocks
            can_edit = str(report["edit_token"]) == str(edit_token) if edit_token else False
            if not can_edit:
                report.pop("edit_token")
            report["can_edit"] = can_edit
            return resp(200, report)

        if method == "POST" and not report_id:
            body = json.loads(event.get("body") or "{}")
            title = body.get("title", "Яндекс Директ")
            project_name = body.get("project_name", "")
            date_from = body.get("date_from") or None
            date_to = body.get("date_to") or None
            cur.execute(
                f"INSERT INTO {SCHEMA}.reports (title, project_name, date_from, date_to) VALUES (%s, %s, %s, %s) RETURNING id, edit_token, expires_at",
                (title, project_name, date_from, date_to)
            )
            row = cur.fetchone()
            conn.commit()
            return resp(201, {"id": str(row[0]), "edit_token": str(row[1]), "expires_at": str(row[2])})

        if method == "PUT" and report_id:
            cur.execute(f"SELECT edit_token FROM {SCHEMA}.reports WHERE id = %s", (report_id,))
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Отчёт не найден"})
            if str(row[0]) != str(edit_token):
                return resp(403, {"error": "Нет доступа к редактированию"})

            body = json.loads(event.get("body") or "{}")
            action = body.get("action", "update_report")

            if action == "update_report":
                cur.execute(
                    f"UPDATE {SCHEMA}.reports SET title=%s, project_name=%s, date_from=%s, date_to=%s, cover_image_url=%s WHERE id=%s",
                    (body.get("title"), body.get("project_name"), body.get("date_from") or None, body.get("date_to") or None, body.get("cover_image_url"), report_id)
                )
                conn.commit()
                return resp(200, {"ok": True})

            if action == "upsert_blocks":
                blocks = body.get("blocks", [])
                cur.execute(f"DELETE FROM {SCHEMA}.report_blocks WHERE report_id = %s", (report_id,))
                for i, b in enumerate(blocks):
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.report_blocks (report_id, position, block_type, heading, body_text, image_url) VALUES (%s, %s, %s, %s, %s, %s)",
                        (report_id, i, b.get("block_type", "content"), b.get("heading", ""), b.get("body_text", ""), b.get("image_url"))
                    )
                conn.commit()
                return resp(200, {"ok": True})

            return resp(400, {"error": "Неизвестный action"})

        return resp(400, {"error": "Неверный запрос"})

    except Exception as e:
        conn.rollback()
        return resp(500, {"error": str(e)})
    finally:
        cur.close()
        conn.close()
