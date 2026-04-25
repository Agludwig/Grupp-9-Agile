import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

def add_report(lon: float, lat: float, message: str):
    with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reports (position, message)
                VALUES (ST_MakePoint(%s, %s)::geography, %s)
                RETURNING id, message, created_At;
                """,
                (lon, lat, message)
            )
            report_id = cur.fetchone()[0]
    return report_id


def get_all_reports_pandas_df():
    with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
        df = pd.read_sql("""
            SELECT
                id,
                ST_X(position::geometry) AS lon,
                ST_Y(position::geometry) AS lat,
                message,
                handled,
                created_at,
                handled_at
            FROM reports;
        """, conn)

    return df


def get_all_reports():
    with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    id,
                    ST_X(position::geometry) AS lon,
                    ST_Y(position::geometry) AS lat,
                    message,
                    handled,
                    created_at,
                    handled_at
                FROM reports;
            """)

            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()

    return [dict(zip(columns, row)) for row in rows]


""" add_report_test = add_report(
    lon=12.9746,
    lat=57.7089,
    message="Radioaktivt avfall?") """
