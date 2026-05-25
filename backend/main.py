import shutil
import uuid
from typing import List
from fastapi import FastAPI, File, HTTPException, UploadFile,Depends, HTTPException,status
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from schemas import AgentRequest, AgentResponse, UserCreate
from models import User
from rag import vector_store,RESUMES_DIR,rebuild_bm25,ALL_DOCS,save_docs,load_docs
from auth import create_access_token, hash_password, verify_password, get_current_user
from db import get_db, create_table
from agent import run_agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_docs()
    rebuild_bm25()
    yield

app = FastAPI(lifespan=lifespan)
security = HTTPBearer()
create_table()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"username": new_user.username, "id": new_user.id}

@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(
        {"sub": db_user.username, "role": db_user.role, "id": db_user.id}
    )
    return {
        "access_token": access_token,
        "user": {"username": db_user.username, "role": db_user.role, "id": db_user.id},
    }

@app.get("/resumes")
def list_resumes():
    RESUMES_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(p.name for p in RESUMES_DIR.glob("*.pdf"))
    return {"resumes": files}

@app.post("/upload")
async def upload_pdfs(files: List[UploadFile] = File(...),current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can upload files")

    # upload logic here
    splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
    RESUMES_DIR.mkdir(parents=True, exist_ok=True)
    added: list[str] = []

    for file in files:
        file_path = RESUMES_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            loader = PyMuPDFLoader(str(file_path))
            docs = loader.load()
            chunks = splitter.split_documents(docs)
            for chunk in chunks:
                chunk.metadata["source"] = file.filename
            ALL_DOCS.extend(chunks)
            vector_store.add_documents(chunks)
            added.append(file.filename)

        except Exception:
            file_path.unlink(missing_ok=True)

    rebuild_bm25()
    save_docs()
    return {"status": "success", "files_added": added}

@app.post("/agent", response_model=AgentResponse)
async def call_agent(request: AgentRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["user", "admin"]:
        raise HTTPException(status_code=403, detail="Only users and admins can chat")
    # agent logic here
    try:
        session_id = request.session_id or str(uuid.uuid4())
        result = run_agent(request.query)
        return AgentResponse(response=result["output"],sources=result["sources"],session_id=session_id)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))