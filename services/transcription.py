from openai import OpenAI
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

def transcribe_audio(audio_bytes, filename):
    audio_file = BytesIO(audio_bytes)
    audio_file.name = filename
    transcript = client.audio.transcriptions.create(
        model = "whisper-1",
        file=audio_file
    )

    return transcript.text