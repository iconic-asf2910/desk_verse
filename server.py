import os
import time
import shutil
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY missing from .env!")

client = genai.Client(api_key=api_key)

# 2. Prompts
TRANSCRIPT_PROMPT = """
You are a speech-to-text transcription engine.
Transcribe the speech from this audio recording verbatim.
Identify and label speakers if identifiable (e.g., Speaker 1, Speaker 2, or by name).
Do not summarize, rephrase, or omit any spoken sentences.
"""

SUMMARY_PROMPT = """
You are the official VOW AI Meeting Assistant.
Listen to this audio recording and generate structured meeting notes:
1. EXECUTIVE SUMMARY: (Brief 2-3 paragraph overview of topics discussed)
2. KEY DECISIONS: (Bullet points of final agreements)
3. ACTION ITEMS: (List of assigned tasks: [Task] | Assignee: [Name or Unassigned] | Status: TODO)
"""

app = FastAPI(
    title="VOW AI Meeting Service",
    description="Microservice connecting Go backend to Gemini Multimodal Audio Intelligence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIResponse(BaseModel):
    result: str
    status: str = "success"

def process_audio_upload(temp_path: str, system_prompt: str, temperature: float, max_tokens: int) -> str:
    """Uploads file to Google GenAI, polls for ACTIVE state, runs inference, and cleans up."""
    uploaded_file = client.files.upload(file=temp_path)

    while uploaded_file.state.name == "PROCESSING":
        time.sleep(1)
        uploaded_file = client.files.get(name=uploaded_file.name)

    if uploaded_file.state.name == "FAILED":
        raise RuntimeError("Cloud audio processing failed.")

    response = None
    for attempt in range(1, 4):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=[uploaded_file, "Process this meeting audio according to your system prompt."],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=temperature,
                    max_output_tokens=max_tokens
                )
            )
            if response and response.text:
                break
        except Exception as err:
            if "503" in str(err) or "high demand" in str(err):
                time.sleep(attempt * 2)
            else:
                raise err

    try:
        client.files.delete(name=uploaded_file.name)
    except Exception:
        pass

    if not response or not response.text:
        raise RuntimeError("Model inference failed to produce an output.")

    return response.text

@app.post("/api/ai/transcribe", response_model=AIResponse)
async def handle_transcribe(audio: UploadFile = File(...)):
    extension = os.path.splitext(audio.filename)[1] or ".mp3"
    temp_filename = f"temp_{uuid.uuid4().hex}{extension}"

    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        transcript = process_audio_upload(
            temp_path=temp_filename,
            system_prompt=TRANSCRIPT_PROMPT,
            temperature=0.1,
            max_tokens=3000
        )
        return AIResponse(result=transcript, status="success")

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/api/ai/summarize", response_model=AIResponse)
async def handle_summarize(audio: UploadFile = File(...)):
    extension = os.path.splitext(audio.filename)[1] or ".mp3"
    temp_filename = f"temp_{uuid.uuid4().hex}{extension}"

    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        summary = process_audio_upload(
            temp_path=temp_filename,
            system_prompt=SUMMARY_PROMPT,
            temperature=0.2,
            max_tokens=1500
        )
        return AIResponse(result=summary, status="success")

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)