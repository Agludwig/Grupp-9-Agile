import psycopg
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

def add_report(lon: float, lat: float, title: str, description: str) -> int:
    with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reports (position, title, description)
                VALUES (ST_MakePoint(%s, %s)::geography, %s, %s)
                RETURNING id, title, description, created_At;
                """,
                (lon, lat, title, description)
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
                title,
                description,
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
                    title,
                    description,
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
    title="Radioaktivt avfall?",
    description="Hittat radioaktivt avfall i närheten.") """
