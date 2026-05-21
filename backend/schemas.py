from pydantic import BaseModel
from typing import List

class AgentRequest(BaseModel):
    query: str
    session_id: str

class AgentResponse(BaseModel):
    response: str
    session_id: str
    sources: List[str]
    
