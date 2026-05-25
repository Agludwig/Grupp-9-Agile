from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from db import get_all_reports, upload_report_image, mark_report_as_handled_with_points, sign_up_to_handle, remove_signup_from_handle, get_top_users_by_points
from models import ReportCreate
from submit import submit_report
from login import router as login_router
from models import UserProfileUpdate
from db import ensure_profile_columns, get_user_profile, update_user_profile, upload_user_profile_picture

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login_router)

@app.on_event("startup")
def startup():
    ensure_profile_columns()

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
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/reports/{report_id}/signup")
def signup_report(report_id: int, user_id: int = Form(...)):
    try:
        result = sign_up_to_handle(report_id, user_id)
        return {"message": "User signed up to handle report", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/reports/{report_id}/signup/remove")
def remove_signup_report(report_id: int, user_id: int = Form(...)):
    try:
        result = remove_signup_from_handle(report_id, user_id)
        return {"message": "User removed from report signup", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/{user_id}/profile")
def read_user_profile(user_id: int, viewer_id: int | None = None):
    try:
        profile = get_user_profile(user_id, viewer_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/users/{user_id}/profile")
def edit_user_profile(user_id: int, profile: UserProfileUpdate):
    try:
        updated_profile = update_user_profile(
            user_id=user_id,
            description=profile.description,
            points_visible=profile.points_visible,
        )

        if not updated_profile:
            raise HTTPException(status_code=404, detail="User not found")

        return updated_profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/users/{user_id}/profile-picture")
async def upload_profile_picture(user_id: int, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        content_type = file.content_type or "image/jpeg"

        profile = upload_user_profile_picture(
            user_id=user_id,
            file_bytes=file_bytes,
            content_type=content_type,
        )

        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
