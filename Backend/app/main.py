from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_all_reports, add_report
from models import ReportCreate
from submit import submit_report

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/reports")
def get_reports():
    return get_all_reports()

@app.post("/reports")
def create_report(report: ReportCreate):
    return submit_report(report)