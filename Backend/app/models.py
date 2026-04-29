from pydantic import BaseModel, Field

class ReportCreate(BaseModel):
    lon: float
    lat: float
    title : str = Field(min_length=1)
    description: str = Field(min_length=1)