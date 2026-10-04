import os 
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Gemini API key is missing! please set it in your .env file.")

client = genai.client(api_key=api_key)

def process_meeting(audio_file_path: str) -> dict:

    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

    print(f"🎙️ Uploading audio: {audio_file_path} ...")

    uploaded_file = client.files.upload(file=audio_file_path)

    prompt = """
    Listen to this meeting recording carefully. 
    You need to do two things:
    1. Transcribe the meeting with speaker names and timestamps (MM:SS).
    2. Extract intelligent meeting notes (executive summary, action items with owners and deadlines, decisions, next steps).
    Return ONLY a valid JSON object with EXACTLY this structure (no extra formatting or markdown):
    {
      "title": "Descriptive title of the meeting",
      "summary": "Executive summary of the meeting in 2-3 clear paragraphs",
      "key_topics": ["Topic 1 summary", "Topic 2 summary"],
      "decisions": [
        {"decision": "What was agreed", "reason": "Why it was agreed"}
      ],
      "action_items": [
        {"task": "What needs to be done", "assignee": "Name of person", "deadline": "Due date if mentioned"}
      ],
      "next_steps": ["Immediate next step 1", "Immediate next step 2"],
      "transcript": [
        {"timestamp": "00:00", "speaker": "Speaker Name", "text": "Spoken text"}
      ]
    }
    """

    print("🤖 Processing with Gemini (transcribing and summarizing)...")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        content=[uploaded_file, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    try:
        client.files.delete(name=uploaded_file.name)
    except Exception:
        pass

    meeting_data = json.loads(response.text)
    return meeting_data


