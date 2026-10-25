from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import analyze_code_with_gemini, generate_question

app = FastAPI(title="AI Interview Prep API")

# Allow all origins for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeReviewRequest(BaseModel):
    code: str
    problem_statement: str
    language: str = "python"

@app.get("/api/get-question")
async def get_question(topic: str = "Data Structures", difficulty: str = "Medium"):
    try:
        data = generate_question(topic, difficulty)
        return {"status": "success", "data": data}
    except Exception as e:
        print("Error generating question:", str(e))
        # Fallback question if API fails
        return {
            "status": "success",
            "data": {
                "title": "Two Sum Problem",
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
                "starter_code": "def two_sum(nums, target):\n    # Write your logic here\n    pass"
            }
        }

@app.post("/api/review-code")
async def review_code(payload: CodeReviewRequest):
    try:
        result = analyze_code_with_gemini(
            code=payload.code,
            problem_statement=payload.problem_statement,
            language=payload.language
        )
        return {"status": "success", "data": result}
    except Exception as e:
        print("Error reviewing code:", str(e))
        raise HTTPException(status_code=500, detail=str(e))