import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getMeeting } from "../../services/api/meetingApi";
import useAuth from "../../hooks/UseAuth";
import {
  connectSocket,
  sendMessage,
  subscribeToMessages,
  disconnectSocket,
} from "../../services/websocket/socket";

const JoinMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const remoteVideoRefs = useRef({});
  const unsubscribeMessagesRef = useRef(null);
  const joinedRef = useRef(false);

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});

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
      cleanupMeeting();
    };
  }, []);

  const createPeerConnection = (remoteUserId) => {
    if (peerConnectionsRef.current[remoteUserId]) {
      return peerConnectionsRef.current[remoteUserId];
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnectionsRef.current[remoteUserId] =
      peerConnection;

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          peerConnection.addTrack(
            track,
            localStreamRef.current
          );
        });
    }

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      sendMessage({
        type: "ice",
        meeting: id,
        target: remoteUserId,
        payload: event.candidate,
      });
    };

    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];

      if (!stream) {
        return;
      }

      setRemoteStreams((previousStreams) => ({
        ...previousStreams,
        [remoteUserId]: stream,
      }));
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      if (
        state === "failed" ||
        state === "closed" ||
        state === "disconnected"
      ) {
        peerConnection.close();

        delete peerConnectionsRef.current[
          remoteUserId
        ];

        setRemoteStreams((previousStreams) => {
          const updatedStreams = {
            ...previousStreams,
          };

          delete updatedStreams[remoteUserId];

          return updatedStreams;
        });
      }
    };

    return peerConnection;
  };

  const createOffer = async (remoteUserId) => {
    const peerConnection =
      createPeerConnection(remoteUserId);

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    sendMessage({
      type: "offer",
      meeting: id,
      target: remoteUserId,
      payload: offer,
    });
  };

  const handleOffer = async (message) => {
    const remoteUserId = message.userId;

    if (!remoteUserId || remoteUserId === user?.id) {
      return;
    }

    const peerConnection =
      createPeerConnection(remoteUserId);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.payload)
    );

    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    sendMessage({
      type: "answer",
      meeting: id,
      target: remoteUserId,
      payload: answer,
    });
  };

  const handleAnswer = async (message) => {
    const remoteUserId = message.userId;

    const peerConnection =
      peerConnectionsRef.current[remoteUserId];

    if (!peerConnection) {
      return;
    }

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.payload)
    );
  };

  const handleIceCandidate = async (message) => {
    const remoteUserId = message.userId;

    const peerConnection =
      peerConnectionsRef.current[remoteUserId];

    if (!peerConnection || !message.payload) {
      return;
    }

    try {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate(message.payload)
      );
    } catch {
      return;
    }
  };

  const handleLeave = (message) => {
    const remoteUserId = message.userId;

    if (!remoteUserId) {
      return;
    }

    const peerConnection =
      peerConnectionsRef.current[remoteUserId];

    if (peerConnection) {
      peerConnection.close();

      delete peerConnectionsRef.current[
        remoteUserId
      ];
    }

    setRemoteStreams((previousStreams) => {
      const updatedStreams = {
        ...previousStreams,
      };

      delete updatedStreams[remoteUserId];

      return updatedStreams;
    });
  };

  const handleSocketMessage = async (message) => {
    if (message.meeting !== id) {
      return;
    }

    try {
      if (message.type === "join") {
        if (
          message.userId &&
          message.userId !== user?.id
        ) {
          await createOffer(message.userId);
        }

        return;
      }

      if (message.type === "offer") {
        await handleOffer(message);
        return;
      }

      if (message.type === "answer") {
        await handleAnswer(message);
        return;
      }

      if (message.type === "ice") {
        await handleIceCandidate(message);
        return;
      }

      if (message.type === "leave") {
        handleLeave(message);
      }
    } catch {
      setError(
        "A connection error occurred with another participant."
      );
    }
  };

  const startMeeting = async () => {
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    try {
      setJoining(true);
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await connectSocket(
        `ws://localhost:8080/api/meetings/${id}/ws`,
        token
      );

      unsubscribeMessagesRef.current =
        subscribeToMessages(handleSocketMessage);

      joinedRef.current = true;
      setJoined(true);

      sendMessage({
        type: "join",
        meeting: id,
      });
    } catch (error) {
      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        localStreamRef.current = null;
      }

      setError(
        error.message ||
          "Unable to join the meeting."
      );
    } finally {
      setJoining(false);
    }
  };

  const toggleMic = () => {
    if (!localStreamRef.current) {
      return;
    }

    const nextState = !micEnabled;

    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = nextState;
      });

    setMicEnabled(nextState);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) {
      return;
    }

    const nextState = !cameraEnabled;

    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = nextState;
      });

    setCameraEnabled(nextState);
  };

  const startScreenShare = async () => {
    try {
      const screenStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

      screenStreamRef.current = screenStream;

      const screenTrack =
        screenStream.getVideoTracks()[0];

      Object.values(
        peerConnectionsRef.current
      ).forEach((peerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find(
            (item) =>
              item.track?.kind === "video"
          );

        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          screenStream;
      }

      setScreenSharing(true);

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch {
      return;
    }
  };

  const stopScreenShare = () => {
    const cameraTrack =
      localStreamRef.current?.getVideoTracks()[0];

    if (!cameraTrack) {
      return;
    }

    Object.values(
      peerConnectionsRef.current
    ).forEach((peerConnection) => {
      const sender = peerConnection
        .getSenders()
        .find(
          (item) =>
            item.track?.kind === "video"
        );

      if (sender) {
        sender.replaceTrack(cameraTrack);
      }
    });

    if (screenStreamRef.current) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      screenStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        localStreamRef.current;
    }

    setScreenSharing(false);
  };

  function cleanupMeeting() {
    if (unsubscribeMessagesRef.current) {
      unsubscribeMessagesRef.current();
      unsubscribeMessagesRef.current = null;
    }

    if (joinedRef.current) {
      sendMessage({
        type: "leave",
        meeting: id,
      });
    }

    Object.values(
      peerConnectionsRef.current
    ).forEach((peerConnection) => {
      peerConnection.close();
    });

    peerConnectionsRef.current = {};

    if (screenStreamRef.current) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      screenStreamRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      localStreamRef.current = null;
    }

    joinedRef.current = false;

    disconnectSocket();
  }

  const leaveMeeting = () => {
    cleanupMeeting();

    setJoined(false);
    setRemoteStreams({});

    navigate(`/meetings/${id}`);
  };

  useEffect(() => {
    Object.entries(remoteStreams).forEach(
      ([userId, stream]) => {
        const video =
          remoteVideoRefs.current[userId];

        if (video && video.srcObject !== stream) {
          video.srcObject = stream;
        }
      }
    );
  }, [remoteStreams]);

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
            {error || "The meeting does not exist."}
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
            onClick={() =>
              navigate(`/meetings/${id}`)
            }
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
                Your camera and microphone will be
                enabled when you join.
              </p>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={startMeeting}
              disabled={joining}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {joining ? "Joining..." : "Join Meeting"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const remoteUsers = Object.entries(remoteStreams);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#111827]">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h1 className="text-sm font-semibold text-white">
            {meeting.title}
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Meeting Code:{" "}
            {meeting.meetingCode || "N/A"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          Connected
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center p-5">
        <div
          className={`grid w-full max-w-6xl gap-4 ${
            remoteUsers.length === 0
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />

            {!cameraEnabled &&
              !screenSharing && (
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

            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              You
            </span>
          </div>

          {remoteUsers.map(([userId, stream]) => (
            <div
              key={userId}
              className="relative aspect-video overflow-hidden rounded-xl bg-black"
            >
              <video
                ref={(element) => {
                  remoteVideoRefs.current[userId] =
                    element;

                  if (
                    element &&
                    element.srcObject !== stream
                  ) {
                    element.srcObject = stream;
                  }
                }}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                Participant
              </span>
            </div>
          ))}
        </div>
      </main>

      <div className="flex justify-center px-5 pb-6">
        <div className="flex items-center gap-3 rounded-full bg-slate-800 px-4 py-3">
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
            onClick={
              screenSharing
                ? stopScreenShare
                : startScreenShare
            }
            className={`flex h-11 w-11 items-center justify-center rounded-full ${
              screenSharing
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-800"
            }`}
          >
            <MonitorUp size={19} />
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
    </div>
  );
};

export default JoinMeeting;