from db import add_report
from models import ReportCreate

def validate_report(report: ReportCreate) -> tuple[bool, str | None]:

    if not report.title.strip():
        return False, "Title is required"
    
    if not report.description.strip():
        return False, "Description is required"

    if report.lon is None or report.lat is None:
        return False, "Coordinates are required"
    
    return True, None

def submit_report(report: ReportCreate) -> dict:
    is_valid, error = validate_report(report)
    
    if not is_valid:
        raise ValueError(error)
   
    report_data = add_report(
        lon=report.lon,
        lat=report.lat, 
        title=report.title,
        message=report.description,
        user_id=report.user_id
        
    )

    return {
        "message": "Report successfully submitted",
        "id": report_data["id"] if isinstance(report_data, dict) else report_data
    }