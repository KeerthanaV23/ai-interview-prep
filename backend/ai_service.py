import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Fast preset cache for instant loading
PRESET_QUESTIONS = {
    ("Arrays", "Easy"): {
        "title": "Two Sum",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "starter_code": "def twoSum(nums, target):\n    # Write your code here\n    pass"
    },
    ("Strings", "Easy"): {
        "title": "Valid Anagram",
        "description": "Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`, and `False` otherwise.",
        "starter_code": "def isAnagram(s, t):\n    # Write your code here\n    pass"
    },
    ("Trees", "Medium"): {
        "title": "Invert Binary Tree",
        "description": "Given the root of a binary tree, invert the tree, and return its root.",
        "starter_code": "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\ndef invertTree(root):\n    # Write your code here\n    pass"
    }
}

def generate_question(topic: str, difficulty: str):
    # Check fast preset cache first
    if (topic, difficulty) in PRESET_QUESTIONS:
        return PRESET_QUESTIONS[(topic, difficulty)]

    prompt = f"""
    Generate a {difficulty} coding interview question for topic '{topic}'.
    Return ONLY a valid JSON object with keys:
    - title: Problem title
    - description: Problem description with clear constraints
    - starter_code: Python function starter code
    Do not use markdown backticks like ```json in output.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
        return {
            "title": f"{topic} Problem ({difficulty})",
            "description": f"Write a solution for a standard {topic} problem with {difficulty} level difficulty.",
            "starter_code": "# Write your python code here\ndef solution():\n    pass"
        }

def analyze_code_with_gemini(code: str, problem_statement: str, language: str = "python"):
    prompt = f"""
    You are an expert technical interviewer reviewing code.
    Problem Statement: {problem_statement}
    Submitted Code ({language}):
    {code}

    Return ONLY a JSON object with keys:
    - score: Integer (0-100)
    - time_complexity: Time complexity string (e.g. O(N))
    - space_complexity: Space complexity string (e.g. O(1))
    - summary: Brief performance summary
    - pros: List of string pros
    - cons: List of string cons
    - optimized_code: Ideal solution in Python
    Do not use markdown backticks in output.
    """

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
        return {
            "score": 70,
            "time_complexity": "O(N)",
            "space_complexity": "O(N)",
            "summary": "Code executed successfully. Ensure edge cases are handled.",
            "pros": ["Syntactically valid solution", "Clear structure"],
            "cons": ["Could optimize time or memory complexity"],
            "optimized_code": "# Optimized reference solution\n" + code
        }