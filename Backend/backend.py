import psycopg
import os
from dotenv import load_dotenv

load_dotenv()



# not working to connect yet but this is the idea...

def add_report(lon: float, lat: float):
    with psycopg.connect("postgresql://postgres.jzqirjnfywjasaqzpnqn:postgres123ab@aws-0-eu-west-1.pooler.supabase.com:6543/postgres") as conn:
    #with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reports (position)
                VALUES (ST_MakePoint(%s, %s)::geography)
                RETURNING id;
                """,
                (lon, lat)
            )
            report_id = cur.fetchone()[0]
    return report_id

result = add_report(
    lon=11.9746,
    lat=57.7089)
print(result)