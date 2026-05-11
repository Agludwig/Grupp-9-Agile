from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from db import get_all_reports, add_report, upload_report_image, mark_report_as_handled, sign_up_report
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
    try:
        result = submit_report(report)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.post("/reports/{report_id}/image")
async def upload_image(report_id: int, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        path = upload_report_image(file_bytes, report_id, is_handled=False)
        return {"path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reports/{report_id}/handle")
async def handle_report(report_id: int, file: UploadFile = File(None)):
    try:
        file_bytes = await file.read() if file else None
        mark_report_as_handled(report_id, file_bytes)
        return {"message": "Report marked as handled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Ändra request:ReportSignUp till någon slags CurrentUser?
@app.post("/reports/{report_id}/signup")
def sign_up(report_id: int, username: str):
    try:
        sign_up_report(report_id, username)
        return {"message": "Successfully signed up for the report"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
