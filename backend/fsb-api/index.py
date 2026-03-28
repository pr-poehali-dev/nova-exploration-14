"""API для управления вакансиями, заявками и сотрудниками ФСБ Remote."""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(data, code=200):
    return {
        "statusCode": code,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(data, default=str, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    resource = qs.get("resource", "")
    row_id = qs.get("id", "")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor()

    try:
        # ── VACANCIES ──────────────────────────────────────────
        if resource == "vacancies":
            if method == "GET":
                cur.execute(
                    "SELECT id, title, category, format, status, created_at FROM vacancies ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                return resp([
                    {"id": r[0], "title": r[1], "category": r[2], "format": r[3], "status": r[4], "created_at": r[5]}
                    for r in rows
                ])

            if method == "POST":
                cur.execute(
                    "INSERT INTO vacancies (title, category, format) VALUES (%s, %s, %s) RETURNING id",
                    (body["title"], body["category"], body.get("format", "Удалённо")),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"id": new_id}, 201)

            if method == "DELETE" and row_id:
                cur.execute("DELETE FROM vacancies WHERE id = %s", (row_id,))
                conn.commit()
                return resp({"ok": True})

            if method == "PUT" and row_id:
                cur.execute("UPDATE vacancies SET status = %s WHERE id = %s", (body["status"], row_id))
                conn.commit()
                return resp({"ok": True})

        # ── APPLICATIONS ───────────────────────────────────────
        if resource == "applications":
            if method == "GET":
                cur.execute(
                    "SELECT id, name, email, position, message, status, created_at FROM applications ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                return resp([
                    {"id": r[0], "name": r[1], "email": r[2], "position": r[3], "message": r[4], "status": r[5], "created_at": r[6]}
                    for r in rows
                ])

            if method == "POST":
                cur.execute(
                    "INSERT INTO applications (name, email, position, message) VALUES (%s, %s, %s, %s) RETURNING id",
                    (body["name"], body["email"], body["position"], body.get("message", "")),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"id": new_id}, 201)

            if method == "PUT" and row_id:
                new_status = body["status"]
                cur.execute("UPDATE applications SET status = %s WHERE id = %s", (new_status, row_id))
                if new_status == "approved":
                    cur.execute("SELECT name, email, position FROM applications WHERE id = %s", (row_id,))
                    row = cur.fetchone()
                    if row:
                        cur.execute(
                            "INSERT INTO employees (name, email, position, department) VALUES (%s, %s, %s, %s)",
                            (row[0], row[1], row[2], "Новые сотрудники"),
                        )
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE" and row_id:
                cur.execute("DELETE FROM applications WHERE id = %s", (row_id,))
                conn.commit()
                return resp({"ok": True})

        # ── EMPLOYEES ──────────────────────────────────────────
        if resource == "employees":
            if method == "GET":
                cur.execute(
                    "SELECT id, name, email, position, department, format, status, hired_at FROM employees ORDER BY hired_at DESC"
                )
                rows = cur.fetchall()
                return resp([
                    {"id": r[0], "name": r[1], "email": r[2], "position": r[3], "department": r[4], "format": r[5], "status": r[6], "hired_at": r[7]}
                    for r in rows
                ])

            if method == "POST":
                cur.execute(
                    "INSERT INTO employees (name, email, position, department, format) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (body["name"], body["email"], body["position"], body["department"], body.get("format", "Удалённо")),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"id": new_id}, 201)

            if method == "PUT" and row_id:
                cur.execute("UPDATE employees SET status = %s WHERE id = %s", (body["status"], row_id))
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE" and row_id:
                cur.execute("DELETE FROM employees WHERE id = %s", (row_id,))
                conn.commit()
                return resp({"ok": True})

        return resp({"error": "Bad request"}, 400)

    finally:
        cur.close()
        conn.close()
