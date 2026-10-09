import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_checks():
    client = httpx.Client(timeout=60.0)

    print("[1/3] Testing /health endpoint...")
    try:
        r = client.get(f"{BASE_URL}/health")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        print("  -> Passed! Health status:", r.json()["status"])
    except Exception as e:
        print(f"  -> Failed: {e}")
        return

    print("\n[2/3] Testing text validation (should reject short text with 400)...")
    try:
        r = client.post(f"{BASE_URL}/api/ai/summarize-text", data={"transcript": "too short"})
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"
        print("  -> Passed! Correctly rejected with HTTP 400.")
    except Exception as e:
        print(f"  -> Failed: {e}")
        return

    print("\n[3/3] Testing live summarization via Gemini...")
    sample_meeting = """
    Aman: Let's finalize the meeting summary feature.
    Pooja: I have configured the frontend audio recorder to output .mp3 and .webm files.
    Aman: Great. Rahul, you will connect the backend database to store the action items by tomorrow.
    Rahul: Understood, I'll take that task.
    """
    try:
        r = client.post(f"{BASE_URL}/api/ai/summarize-text", data={"transcript": sample_meeting})
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "summary" in data
        assert "action_items" in data["summary"]
        print("  -> Passed! Output returned clean structured JSON:")
        print("     Decisions:", data["summary"]["key_decisions"])
        print("     Action Items:", data["summary"]["action_items"])
    except Exception as e:
        print(f"  -> Failed: {e}")
        return

    print("\n All local checks passed successfully! Ready for team integration.")

if __name__ == "__main__":
    run_checks()