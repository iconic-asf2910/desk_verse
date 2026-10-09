from fastapi import FastAPI, UploadFile, File
from services.transcribe import transcribe_audio

app = FastAPI(title="AI Meeting Assistant")

@app.get("/")
def home():
    return {
        "message": "AI Meeting Assistant API is running"
    }

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    transcript = transcribe_audio(
        audio_bytes,
        file.filename
    ) 

    return {
        "transcript": transcript
    }