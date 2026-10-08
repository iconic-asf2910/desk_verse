import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY missing from .env!")

client = genai.Client(api_key=api_key)

SYSTEM_INSTRUCTION = """
You are the official VOW AI Meeting Assistant.
Listen to the meeting audio and output three distinct sections:

1. FULL TRANSCRIPT:
Accurate transcription with speaker tags if identifiable.

2. EXECUTIVE SUMMARY:
2-3 paragraph summary of meeting goals, discussions, and decisions.

3. ACTION ITEMS & TASKS:
All actionable tasks mapped into VOW's Kanban workflow:
- [Task Description] | Assignee: [Name or Unassigned] | Status: TODO | Priority: [High/Medium/Low]
"""

CANDIDATE_MODELS = [
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-2.5-flash"
]

def generate_meeting_notes_from_audio(audio_file_path: str) -> str:
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Cannot find: '{audio_file_path}'")

    print(f"\n[1/4] Uploading '{audio_file_path}' to Google GenAI...")
    uploaded_file = client.files.upload(file=audio_file_path)
    print(f"      Upload complete. Temporary File ID: {uploaded_file.name}")

    print("[2/4] Waiting for audio processing to finalize...")
    while uploaded_file.state.name == "PROCESSING":
        time.sleep(1)
        uploaded_file = client.files.get(name=uploaded_file.name)

    if uploaded_file.state.name == "FAILED":
        raise RuntimeError("Audio file processing failed on Google Cloud.")

    print("[3/4] Running multimodal inference (Transcribing + Summarizing)...")
    
    response = None
    last_exception = None

    for model_name in CANDIDATE_MODELS:
        for attempt in range(1, 4):
            try:
                print(f"      Attempting inference with model: '{model_name}' (Attempt {attempt})...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        uploaded_file,
                        "Please generate the complete meeting transcript, executive summary, and action items as instructed."
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.2,
                        max_output_tokens=2048
                    )
                )
                if response and response.text:
                    break
            except Exception as err:
                last_exception = err
                err_str = str(err)
                if "503" in err_str or "high demand" in err_str:
                    print(f"      Server cluster busy (503). Retrying in {attempt * 2}s...")
                    time.sleep(attempt * 2)
                else:
                    print(f"      Model {model_name} unavailable, checking fallback...")
                    break
        if response and response.text:
            break

    print("[4/4] Cleaning up uploaded audio from cloud storage...")
    try:
        client.files.delete(name=uploaded_file.name)
    except Exception:
        pass

    if response and response.text:
        return response.text
    else:
        raise RuntimeError(f"All model endpoints were busy. Last error: {last_exception}")

if __name__ == "__main__":
    AUDIO_FILE = "audio.mp3"

    print("=" * 60)
    print(" VOW Audio Meeting Intelligence Engine")
    print("=" * 60)

    try:
        results = generate_meeting_notes_from_audio(AUDIO_FILE)
        print("\n" + "=" * 60)
        print(" RESULTS: TRANSCRIPT, SUMMARY & ACTION ITEMS")
        print("=" * 60)
        print(results)
    except Exception as error:
        print(f"\nError occurred: {error}")  