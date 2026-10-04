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

TRANSCRIPT_PROMPT = """
You are a speech-to-text transcription engine.
Transcribe the speech from this audio recording verbatim.
Identify and label speakers if identifiable (e.g., Speaker 1, Speaker 2, or by name).
Do not summarize, rephrase, or omit any spoken sentences.
"""

def generate_transcript_only(audio_file_path: str, output_path: str = "transcript.txt") -> str:
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Cannot find: '{audio_file_path}'")

    print(f"\n[1/3] Uploading '{audio_file_path}' to Google GenAI...")
    uploaded_file = client.files.upload(file=audio_file_path)

    print("[2/3] Waiting for audio processing to finalize...")
    while uploaded_file.state.name == "PROCESSING":
        time.sleep(1)
        uploaded_file = client.files.get(name=uploaded_file.name)

    if uploaded_file.state.name == "FAILED":
        raise RuntimeError("Audio file processing failed on Google Cloud.")

    print("[3/3] Generating verbatim transcript...")
    
    response = None
    for attempt in range(1, 4):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=[
                    uploaded_file,
                    "Provide the complete verbatim transcript of this audio."
                ],
                config=types.GenerateContentConfig(
                    system_instruction=TRANSCRIPT_PROMPT,
                    temperature=0.1,      
                    max_output_tokens=3000
                )
            )
            if response and response.text:
                break
        except Exception as err:
            if "503" in str(err) or "high demand" in str(err):
                print(f"      Server busy (503). Retrying in {attempt * 2}s...")
                time.sleep(attempt * 2)
            else:
                raise err

    try:
        client.files.delete(name=uploaded_file.name)
    except Exception:
        pass

    if response and response.text:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"Transcript successfully saved to '{output_path}'!")
        return response.text
    else:
        raise RuntimeError("Transcription failed after retries.")

if __name__ == "__main__":
    AUDIO_FILE = "audio.mp3"
    result = generate_transcript_only(AUDIO_FILE)
    print("\n--- TRANSCRIPT RESULT ---")
    print(result)