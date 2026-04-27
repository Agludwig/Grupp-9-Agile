from pydantic import BaseModel, Field

class ReportCreate(BaseModel):
    lon: float
    lat: float
    message: str = Field(min_length=1)