from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import get_all_reports, add_report
from app.models import ReportCreate

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
    report_id = add_report(
        lon=report.lon,
        lat=report.lat,
        message=report.message
    )
    return {"id": report_id}