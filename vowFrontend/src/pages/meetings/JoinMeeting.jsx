import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
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
  const peersRef = useRef({});
  const remoteVideoRefs = useRef({});
  const unsubscribeRef = useRef(null);
  const joinedRef = useRef(false);

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [micEnabled, setMicEnabled] =
    useState(true);
  const [cameraEnabled, setCameraEnabled] =
    useState(true);
  const [screenSharing, setScreenSharing] =
    useState(false);
  const [remoteStreams, setRemoteStreams] =
    useState({});

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);

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

  const createPeer = (remoteUserId) => {
    if (peersRef.current[remoteUserId]) {
      return peersRef.current[
        remoteUserId
      ];
    }

    const peer =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
        ],
      });

    peersRef.current[remoteUserId] = peer;

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            localStreamRef.current
          );
        });
    }

    peer.onicecandidate = (event) => {
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

    peer.ontrack = (event) => {
      const stream = event.streams[0];

      if (!stream) {
        return;
      }

      setRemoteStreams((previous) => ({
        ...previous,
        [remoteUserId]: stream,
      }));
    };

    peer.onconnectionstatechange =
      () => {
        if (
          [
            "failed",
            "closed",
            "disconnected",
          ].includes(
            peer.connectionState
          )
        ) {
          peer.close();

          delete peersRef.current[
            remoteUserId
          ];

          setRemoteStreams((previous) => {
            const next = {
              ...previous,
            };

            delete next[remoteUserId];

            return next;
          });
        }
      };

    return peer;
  };

  const createOffer = async (
    remoteUserId
  ) => {
    const peer =
      createPeer(remoteUserId);

    const offer =
      await peer.createOffer();

    await peer.setLocalDescription(
      offer
    );

    sendMessage({
      type: "offer",
      meeting: id,
      target: remoteUserId,
      payload: offer,
    });
  };

  const handleMessage = async (message) => {
    if (message.meeting !== id) {
      return;
    }

    const remoteUserId =
      message.userId;

    if (
      remoteUserId &&
      remoteUserId === user?.id
    ) {
      return;
    }

    if (message.type === "join") {
      if (remoteUserId) {
        await createOffer(
          remoteUserId
        );
      }

      return;
    }

    if (message.type === "offer") {
      const peer =
        createPeer(remoteUserId);

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          message.payload
        )
      );

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      sendMessage({
        type: "answer",
        meeting: id,
        target: remoteUserId,
        payload: answer,
      });

      return;
    }

    if (message.type === "answer") {
      const peer =
        peersRef.current[
          remoteUserId
        ];

      if (!peer) {
        return;
      }

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          message.payload
        )
      );

      return;
    }

    if (message.type === "ice") {
      const peer =
        peersRef.current[
          remoteUserId
        ];

      if (!peer) {
        return;
      }

      try {
        await peer.addIceCandidate(
          new RTCIceCandidate(
            message.payload
          )
        );
      } catch {
        return;
      }

      return;
    }

    if (message.type === "leave") {
      const peer =
        peersRef.current[
          remoteUserId
        ];

      peer?.close();

      delete peersRef.current[
        remoteUserId
      ];

      setRemoteStreams((previous) => {
        const next = {
          ...previous,
        };

        delete next[remoteUserId];

        return next;
      });
    }
  };

  const joinMeeting = async () => {
    try {
      setJoining(true);
      setError("");

      if (!token) {
        throw new Error(
          "Authentication token is missing."
        );
      }

      let stream = null;
      let hasVideo = false;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        hasVideo = true;
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: false });
          } catch {
            stream = null;
          }
        }
      }

      if (stream) {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        setCameraEnabled(false);
        setMicEnabled(false);
      }

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8080";

      const wsUrl =
        apiUrl.replace(
          /^http/,
          "ws"
        ) +
        `/api/meetings/${id}/ws`;

      await connectSocket(
        wsUrl,
        token
      );

      unsubscribeRef.current =
        subscribeToMessages(
          handleMessage
        );

      joinedRef.current = true;

      setJoined(true);

      sendMessage({
        type: "join",
        meeting: id,
        userId: user?.id,
      });
    } catch (error) {
      setError(
        error.message ||
          "Unable to join meeting."
      );

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        localStreamRef.current = null;
      }
    } finally {
      setJoining(false);
    }
  };

  const toggleMic = () => {
    if (!localStreamRef.current) {
      return;
    }

    const enabled = !micEnabled;

    localStreamRef.current
      .getAudioTracks()
      .forEach(
        (track) =>
          (track.enabled = enabled)
      );

    setMicEnabled(enabled);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) {
      return;
    }

    const enabled =
      !cameraEnabled;

    localStreamRef.current
      .getVideoTracks()
      .forEach(
        (track) =>
          (track.enabled = enabled)
      );

    setCameraEnabled(enabled);
  };

  const startScreenShare = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: true,
          }
        );

      screenStreamRef.current =
        stream;

      const track =
        stream.getVideoTracks()[0];

      Object.values(
        peersRef.current
      ).forEach((peer) => {
        const sender =
          peer
            .getSenders()
            .find(
              (item) =>
                item.track?.kind ===
                "video"
            );

        sender?.replaceTrack(track);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          stream;
      }

      setScreenSharing(true);

      track.onended =
        stopScreenShare;
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
      peersRef.current
    ).forEach((peer) => {
      const sender =
        peer
          .getSenders()
          .find(
            (item) =>
              item.track?.kind ===
              "video"
          );

      sender?.replaceTrack(
        cameraTrack
      );
    });

    screenStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    screenStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        localStreamRef.current;
    }

    setScreenSharing(false);
  };

  const cleanup = () => {
    if (joinedRef.current) {
      sendMessage({
        type: "leave",
        meeting: id,
      });
    }

    unsubscribeRef.current?.();

    Object.values(
      peersRef.current
    ).forEach((peer) =>
      peer.close()
    );

    peersRef.current = {};

    localStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    screenStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    localStreamRef.current = null;
    screenStreamRef.current = null;

    disconnectSocket();

    joinedRef.current = false;
  };

  const leaveMeeting = () => {
    cleanup();

    setJoined(false);
    setRemoteStreams({});

    navigate(`/meetings/${id}`);
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (
      joined &&
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject =
        localStreamRef.current;
    }
  }, [joined]);

  useEffect(() => {
    Object.entries(
      remoteStreams
    ).forEach(
      ([userId, stream]) => {
        const video =
          remoteVideoRefs.current[
            userId
          ];

        if (
          video &&
          video.srcObject !== stream
        ) {
          video.srcObject = stream;
        }
      }
    );
  }, [remoteStreams]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#111827]">
        <p className="text-slate-300">
          Loading meeting...
        </p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#111827]">
        <div className="rounded-xl bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">
            Meeting not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#111827] p-5">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8">
          <h1 className="text-center text-2xl font-semibold">
            {meeting.title}
          </h1>

          <p className="mt-2 text-center text-sm text-slate-500">
            Ready to join?
          </p>

          <div className="mt-6 overflow-hidden rounded-xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={joinMeeting}
            disabled={joining}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {joining
              ? "Joining..."
              : "Join Meeting"}
          </button>
        </div>
      </div>
    );
  }

  const remoteUsers =
    Object.entries(remoteStreams);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#111827]">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h1 className="text-sm font-semibold text-white">
            {meeting.title}
          </h1>

          <p className="text-xs text-slate-400">
            {meeting.meetingCode}
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          Connected
        </span>
      </header>

      <main className="flex-1 p-5">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
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
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-white">
                    You
                  </div>
                </div>
              )}

            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              You
            </span>
          </div>

          {remoteUsers.map(
            ([userId, stream]) => (
              <div
                key={userId}
                className="relative aspect-video overflow-hidden rounded-xl bg-black"
              >
                <video
                  ref={(element) => {
                    remoteVideoRefs.current[
                      userId
                    ] = element;

                    if (
                      element &&
                      element.srcObject !==
                        stream
                    ) {
                      element.srcObject =
                        stream;
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
            )
          )}
        </div>
      </main>

      <div className="flex justify-center pb-6">
        <div className="flex gap-3 rounded-full bg-slate-800 p-3">
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