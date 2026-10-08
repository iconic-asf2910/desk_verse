import os
import time
import shutil
import uuid
import asyncio
from typing import List
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

load_dotenv()
SERVICE_NAME = os.getenv("SERVICE_NAME", "Deskverse AI Service")
raw_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI API KEY")

if not raw_key:
    raise ValueError("GEMINI_API_KEY missing from .env! Please set GEMINI_API_KEY=your_key in .env")

client = genai.Client(api_key=raw_key.strip().replace(" ", ""))
PRIMARY_MODEL = "gemini-3.5-flash-lite"
FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.8-flash"]
ALL_MODELS = [PRIMARY_MODEL] + FALLBACK_MODELS

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg", ".flac", ".aac"}
ALLOWED_MIME_PREFIXES = ("audio/", "video/webm", "video/ogg")
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024  


@asynccontextmanager
async def lifespan(app: FastAPI):
    for fname in os.listdir("."):
        if fname.startswith("temp_") and any(fname.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            try:
                os.remove(fname)
            except OSError:
                pass
    yield

app = FastAPI(
    title=f"{SERVICE_NAME} API",
    description="Deskverse Multimodal Audio Transcription and Structured Summarization Engine",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ActionItem(BaseModel):
    task: str = Field(description="Clear description of the action item or task")
    assignee: str = Field(default="Unassigned", description="Name of the person responsible, or 'Unassigned'")
    status: str = Field(default="TODO", description="Current status, typically 'TODO'")

class MeetingSummary(BaseModel):
    executive_summary: str = Field(description="2-3 paragraph overview of the topics discussed")
    key_decisions: List[str] = Field(description="List of key decisions agreed upon during the call")
    action_items: List[ActionItem] = Field(description="List of assigned tasks with owners")

class MeetingProcessResponse(BaseModel):
    status: str = "success"
    transcript: str
    summary: MeetingSummary

class TranscriptResponse(BaseModel):
    status: str = "success"
    transcript: str

class SummaryResponse(BaseModel):
    status: str = "success"
    summary: MeetingSummary

class HealthResponse(BaseModel):
    status: str
    service: str
    active_model: str
    timestamp: float

TRANSCRIPT_PROMPT = """
You are a professional speech-to-text transcription engine.
Transcribe the speech from this audio recording verbatim.
Identify and label distinct speakers if identifiable (e.g., Speaker 1, Speaker 2, or speaker names).
Do not summarize, rephrase, or omit any spoken sentences.
"""

SUMMARY_PROMPT = """
You are the official Deskverse AI Meeting Assistant.
Analyze this meeting transcript and extract structured meeting notes:
1. Executive summary of discussions.
2. Clear list of decisions agreed upon.
3. Explicit list of tasks assigned to members.
"""

async def validate_audio_file(audio: UploadFile) -> str:
    if not audio.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename."
        )

    extension = os.path.splitext(audio.filename)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format '{extension}'. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    content_type = audio.content_type or ""
    if content_type.startswith("image/") or content_type.startswith("text/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Uploaded file has invalid media type '{content_type}'."
        )

    audio.file.seek(0, os.SEEK_END)
    file_size = audio.file.tell()
    audio.file.seek(0)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded audio file is empty (0 bytes)."
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
        )

    return extension


def save_upload_file_sync(upload_file: UploadFile, destination_path: str):
    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)


def upload_and_wait_file(temp_path: str):
    uploaded_file = client.files.upload(file=temp_path)

    while uploaded_file.state.name == "PROCESSING":
        time.sleep(1.5)
        uploaded_file = client.files.get(name=uploaded_file.name)

    if uploaded_file.state.name == "FAILED":
        try:
            client.files.delete(name=uploaded_file.name)
        except Exception:
            pass
        raise RuntimeError("Cloud audio processing failed on Google Cloud.")
    return uploaded_file


def delete_remote_file(file_name: str):
    try:
        client.files.delete(name=file_name)
    except Exception:
        pass


def generate_transcript_sync(uploaded_file) -> str:
    last_err = None
    for model_candidate in ALL_MODELS:
        for attempt in range(1, 3):
            try:
                response = client.models.generate_content(
                    model=model_candidate,
                    contents=[uploaded_file, "Transcribe this meeting audio verbatim."],
                    config=types.GenerateContentConfig(
                        system_instruction=TRANSCRIPT_PROMPT,
                        temperature=0.1,
                        max_output_tokens=8192
                    )
                )
                if response and response.text:
                    return response.text
            except Exception as err:
                last_err = err
                print(f"[WARN] Transcription via '{model_candidate}' failed (attempt {attempt}): {err}")
                if "503" in str(err) or "high demand" in str(err):
                    time.sleep(2)
                else:
                    break

    raise RuntimeError(f"Transcription failed across available models: {last_err}")


def generate_summary_from_text_sync(transcript_text: str) -> MeetingSummary:
    last_err = None
    for model_candidate in ALL_MODELS:
        for attempt in range(1, 3):
            try:
                response = client.models.generate_content(
                    model=model_candidate,
                    contents=[
                        f"Here is the meeting transcript:\n\n{transcript_text}\n\nGenerate the structured summary."
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=SUMMARY_PROMPT,
                        temperature=0.2,
                        response_mime_type="application/json",
                        response_schema=MeetingSummary,
                        max_output_tokens=4096
                    )
                )
                if response and response.parsed:
                    return response.parsed
            except Exception as err:
                last_err = err
                print(f"[WARN] Summarization via '{model_candidate}' failed (attempt {attempt}): {err}")
                if "503" in str(err) or "high demand" in str(err):
                    time.sleep(2)
                else:
                    break

    raise RuntimeError(f"Summarization failed across available models: {last_err}")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service=SERVICE_NAME,
        active_model=PRIMARY_MODEL,
        timestamp=time.time()
    )


@app.post("/api/ai/process", response_model=MeetingProcessResponse)
async def process_full_meeting(audio: UploadFile = File(...)):
    """
    All-in-one endpoint: Single upload -> transcribe audio -> summarize transcript -> structured JSON.
    """
    extension = await validate_audio_file(audio)
    temp_filename = f"temp_{uuid.uuid4().hex}{extension}"

    try:
        await asyncio.to_thread(save_upload_file_sync, audio, temp_filename)
        uploaded_file = await asyncio.to_thread(upload_and_wait_file, temp_filename)

        try:
            transcript = await asyncio.to_thread(generate_transcript_sync, uploaded_file)
            summary = await asyncio.to_thread(generate_summary_from_text_sync, transcript)

            return MeetingProcessResponse(
                status="success",
                transcript=transcript,
                summary=summary
            )
        finally:
            await asyncio.to_thread(delete_remote_file, uploaded_file.name)

    except HTTPException:
        raise
    except Exception as err:
        print(f"[ERROR] Process meeting pipeline failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio processing failure: {str(err)}"
        )
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)


@app.post("/api/ai/transcribe", response_model=TranscriptResponse)
async def handle_transcribe(audio: UploadFile = File(...)):
    """Transcribes audio only."""
    extension = await validate_audio_file(audio)
    temp_filename = f"temp_{uuid.uuid4().hex}{extension}"

    try:
        await asyncio.to_thread(save_upload_file_sync, audio, temp_filename)
        uploaded_file = await asyncio.to_thread(upload_and_wait_file, temp_filename)

        try:
            transcript = await asyncio.to_thread(generate_transcript_sync, uploaded_file)
            return TranscriptResponse(status="success", transcript=transcript)
        finally:
            await asyncio.to_thread(delete_remote_file, uploaded_file.name)

    except HTTPException:
        raise
    except Exception as err:
        print(f"[ERROR] Transcribe endpoint failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failure: {str(err)}"
        )
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)


@app.post("/api/ai/summarize-text", response_model=SummaryResponse)
async def handle_summarize_text(transcript: str = Form(...)):
    """Summarizes pre-existing transcript text directly without touching audio."""
    clean_text = transcript.strip()
    if not clean_text or len(clean_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript text is too short or empty to summarize."
        )

    try:
        summary = await asyncio.to_thread(generate_summary_from_text_sync, clean_text)
        return SummaryResponse(status="success", summary=summary)
    except HTTPException:
        raise
    except Exception as err:
        print(f"[ERROR] Summarize text failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failure: {str(err)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)