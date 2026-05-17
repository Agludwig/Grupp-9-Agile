from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from db import get_all_reports, upload_report_image, mark_report_as_handled_with_points, sign_up_to_handle, remove_signup_from_handle, get_top_users_by_points
from models import ReportCreate
from submit import submit_report
from login import router as login_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login_router)

@app.get("/reports")
def get_reports():
    return get_all_reports()


@app.get("/leaderboard")
def get_leaderboard(limit: int = 10):
    try:
        return get_top_users_by_points(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
async def handle_report(
    report_id: int,
    handled_by: int = Form(...),
    file: UploadFile = File(None)
):
    try:
        file_bytes = await file.read() if file else None
        """  mark_report_as_handled(
                report_id,
                handled_by,
                file_bytes
            ) """
        mark_report_as_handled_with_points(report_id, handled_by, file_bytes)
        
        
        return {"message": "Report marked as handled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reports/{report_id}/signup")
def signup_report(report_id: int, user_id: int = Form(...)):
    try:
        result = sign_up_to_handle(report_id, user_id)
        return {
            "message": "User signed up to handle report",
            **result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reports/{report_id}/signup/remove")
def remove_signup_report(report_id: int, user_id: int = Form(...)):
    try:
        result = remove_signup_from_handle(report_id, user_id)
        return {"message": "User removed from report signup", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
