import json
import os
import base64
import uuid
import boto3
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Edit-Token",
    }

def resp(status, body):
    return {"statusCode": status, "headers": {**cors_headers(), "Content-Type": "application/json"}, "body": json.dumps(body)}

def handler(event: dict, context) -> dict:
    """Загрузка изображений для отчётов в S3"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    body = json.loads(event.get("body") or "{}")
    report_id = body.get("report_id")
    edit_token = (event.get("headers") or {}).get("X-Edit-Token") or body.get("edit_token")
    image_data = body.get("image_data")
    content_type = body.get("content_type", "image/jpeg")

    if not report_id or not image_data:
        return resp(400, {"error": "Нужны report_id и image_data"})

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(f"SELECT edit_token FROM {SCHEMA}.reports WHERE id = %s", (report_id,))
        row = cur.fetchone()
        if not row:
            return resp(404, {"error": "Отчёт не найден"})
        if str(row[0]) != str(edit_token):
            return resp(403, {"error": "Нет доступа"})
    finally:
        cur.close()
        conn.close()

    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"reports/{report_id}/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    image_bytes = base64.b64decode(image_data)
    s3.put_object(Bucket="files", Key=key, Body=image_bytes, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return resp(200, {"url": cdn_url})
