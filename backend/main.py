from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import analyze_code_with_gemini, generate_question

app = FastAPI(title="AI Technical Interview Prep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeSubmission(BaseModel):
    code: str
    problem_statement: str
    language: str = "python"

@app.get("/")
def read_root():
    return {"message": "AI Interview Prep Backend Service is Live!"}

@app.get("/api/get-question")
def get_question(topic: str = "Arrays", difficulty: str = "Easy"):
    try:
        data = generate_question(topic, difficulty)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/review-code")
def review_code(submission: CodeSubmission):
    try:
        analysis = analyze_code_with_gemini(
            code=submission.code,
            problem_statement=submission.problem_statement,
            language=submission.language
        )
        return {"status": "success", "data": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))