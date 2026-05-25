from pydantic import BaseModel,EmailStr
from typing import List

class AgentRequest(BaseModel):
    query: str
    session_id: str | None = None

class AgentResponse(BaseModel):
    response: str
    session_id: str
    sources: List[str]
    
#Auth
class UserCreate(BaseModel):
    username: EmailStr
    password: str

    class Config:
        from_attributes = True