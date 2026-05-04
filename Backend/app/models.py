from pydantic import BaseModel, Field

class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=1000)
    lon: float
    lat: float