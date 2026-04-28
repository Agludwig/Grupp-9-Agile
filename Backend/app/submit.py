from db import add_report
from models import ReportCreate

def validate_report(report: ReportCreate) -> bool:
    if not report.title or not report.title.strip():
        return False, "Title is required"
    
    if not report.description or not report.description.strip():
        return False, "Description is required"

    if report.lon is None or report.lat is None:
        return False, "Coordinates are required"
    
    return True

def submit_report(report: ReportCreate) -> dict:
    if not validate_report(report):
        raise ValueError("Invalid report data")

    return None