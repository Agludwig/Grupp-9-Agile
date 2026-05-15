import psycopg
import os
from dotenv import load_dotenv
import pandas as pd
from supabase import create_client, Client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

database_url: str = os.environ.get("DATABASE_URL")
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


def add_report(lon: float, lat: float, title: str, message: str):
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reports (position, title, message)
                VALUES (
                    ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                    %s,
                    %s
                )
                RETURNING id, title, message, created_at;
                """,
                (lon, lat, title, message)
            )
            row = cur.fetchone()
            conn.commit()
    return {
        "id": row[0],
        "title": row[1],
        "message": row[2],
        "created_at": row[3],
    }


def mark_report_as_handled(report_id: int, handled_image_bytes: bytes = None):
    handled_image_path = None
    if handled_image_bytes:
        handled_image_path = upload_report_image(handled_image_bytes, report_id, is_handled=True)
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE reports
                SET handled = TRUE,
                    handled_at = NOW(),
                    handled_image_path = %s
                WHERE id = %s;
                """,
                (handled_image_path, report_id)
            )
            conn.commit()


def upload_report_image(file_bytes: bytes, report_id: int, is_handled: bool = False):
    folder = "handled_images" if is_handled else "unhandled_images"
    target_column = "handled_image_path" if is_handled else "unhandled_image_path"
    path = f"reports/{folder}/{report_id}.jpg"
    supabase.storage.from_("LitterFreeCitiesImages").upload(
        path,
        file_bytes,
        {"content-type": "image/jpeg", "upsert": "true"}
    )
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE reports SET {target_column} = %s WHERE id = %s;",
                (path, report_id),
            )
            conn.commit()
    return path


def get_all_reports_pandas_df():
    with psycopg.connect(database_url, sslmode="require") as conn:
        df = pd.read_sql("""
            SELECT
                id,
                ST_X(position::geometry) AS lon,
                ST_Y(position::geometry) AS lat,
                title,
                message,
                created_at,
                unhandled_image_path,
                handled,
                handled_at,
                handled_image_path
            FROM reports
            ORDER BY created_at DESC;
        """, conn)
    return df


def get_all_reports():

    reset_expired_report()

    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    id,
                    ST_X(position::geometry) AS lon,
                    ST_Y(position::geometry) AS lat,
                    title,
                    message,
                    created_at,
                    unhandled_image_path,
                    handled,
                    handled_at,
                    handled_image_path,
                    signed_up_by,
                    assigned_at,
                FROM reports
                ORDER BY created_at DESC;
            """)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
    return [dict(zip(columns, row)) for row in rows]



def create_user(username: str, password: str):
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (username, password)
                VALUES (%s, %s)
                RETURNING id, username;
                """,
                (username, password)
            )

            row = cur.fetchone()
            conn.commit()

    return {
        "id": row[0],
        "username": row[1],
    }


def login_user(username: str, password: str):
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, username
                FROM users
                WHERE username = %s
                AND password = %s;
                """,
                (username, password)
            )

            row = cur.fetchone()

    if row:
        return {
            "id": row[0],
            "username": row[1],
        }

    return None

def sign_up_report(report_id: int, username: str):
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE reports
                SET signed_up_by = %s,
                    signed_up_at = NOW(),
                WHERE id = %s;
                """,
                (username, report_id)
            )
            conn.commit()

def reset_expired_report():
    with psycopg.connect(database_url, sslmode="require") as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE reports
                SET signed_up_by = NULL,
                    signed_up_at = NULL,
                WHERE assigned_at < NOW() - INTERVAL '1 day'
                AND handled = FALSE;
                """
            )
            conn.commit()