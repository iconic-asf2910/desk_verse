import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getMeeting } from "../../services/api/meetingApi";

const JoinMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMeeting(id);

        setMeeting(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const handleJoin = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setJoined(true);
    } catch (error) {
      setError(
        "Camera or microphone permission is required to join."
      );
    }
  };

  const toggleMic = () => {
    if (!streamRef.current) {
      return;
    }

    const audioTracks = streamRef.current.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !micEnabled;
    });

    setMicEnabled((previous) => !previous);
  };

  const toggleCamera = () => {
    if (!streamRef.current) {
      return;
    }

    const videoTracks = streamRef.current.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !cameraEnabled;
    });

    setCameraEnabled((previous) => !previous);
  };

  const leaveMeeting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    streamRef.current = null;
    setJoined(false);

    navigate(`/meetings/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#111827]">
        <p className="text-sm text-slate-300">
          Loading meeting...
        </p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#111827] px-5">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Meeting not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#111827] px-5 py-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(`/meetings/${id}`)}
            className="mb-5 text-sm text-slate-300 hover:text-white"
          >
            ← Back to Meeting
          </button>

          <div className="rounded-xl bg-white p-8 shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-slate-900">
                Join Meeting
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {meeting.title}
              </p>
            </div>

            <div className="mt-8 rounded-lg bg-slate-900 p-5 text-center">
              <p className="text-sm text-slate-300">
                Camera and microphone access
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Your camera and microphone will be enabled when
                you join.
              </p>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleJoin}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#111827]">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h1 className="text-sm font-semibold text-white">
            {meeting.title}
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Meeting Code: {meeting.meetingCode || "N/A"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          Connected
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center p-5">
        <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-2xl text-white">
                  You
                </div>

                <p className="mt-3 text-sm text-slate-300">
                  Camera is off
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                micEnabled
                  ? "bg-white text-slate-800"
                  : "bg-red-500 text-white"
              }`}
            >
              {micEnabled ? (
                <Mic size={19} />
              ) : (
                <MicOff size={19} />
              )}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                cameraEnabled
                  ? "bg-white text-slate-800"
                  : "bg-red-500 text-white"
              }`}
            >
              {cameraEnabled ? (
                <Video size={19} />
              ) : (
                <VideoOff size={19} />
              )}
            </button>

            <button
              type="button"
              onClick={leaveMeeting}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white"
            >
              <PhoneOff size={19} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JoinMeeting;