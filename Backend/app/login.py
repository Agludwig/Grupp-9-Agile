from fastapi import APIRouter, HTTPException
from models import LoginRequest
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

database_url = os.getenv("DATABASE_URL")


@router.post("/login")
def login(data: LoginRequest):

    with psycopg.connect(
        database_url,
        sslmode="require"
    ) as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT username
                FROM users
                WHERE username = %s
                AND password = %s
                """,
                (
                    data.username,
                    data.password,
                ),
            )

            user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    return {
        "username": user[0]
    }


@router.post("/register")
def register(data: LoginRequest):

    with psycopg.connect(
        database_url,
        sslmode="require"
    ) as conn:

        with conn.cursor() as cur:

            print("REGISTER ATTEMPT")
            cur.execute(
                """
                INSERT INTO users
                (username, password)
                VALUES (%s, %s)
                """,
                (
                    data.username,
                    data.password,
                ),
            )

            conn.commit()
            print("USER CREATED") 

    return {
        "message":
        "User created"
    }