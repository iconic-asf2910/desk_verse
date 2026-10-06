import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useAuth from "./UseAuth";
import useWebSocket from "./UseWebSocket";

const UseMeetingWebRTC = ({
  meetingId,
}) => {
  const { user, token } = useAuth();
  const {
    connect,
    disconnect,
    sendMessage,
    subscribeToMessages,
  } = useWebSocket();

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(
    new Map()
  );

  const [localStream, setLocalStream] =
    useState(null);

  const [remoteStreams, setRemoteStreams] =
    useState([]);

  const [connected, setConnected] =
    useState(false);

  const createPeerConnection =
    useCallback(
      (peerId) => {
        if (
          peerConnectionsRef.current.has(
            peerId
          )
        ) {
          return peerConnectionsRef.current.get(
            peerId
          );
        }

        const peerConnection =
          new RTCPeerConnection({
            iceServers: [
              {
                urls: "stun:stun.l.google.com:19302",
              },
            ],
          });

        const stream =
          localStreamRef.current;

        if (stream) {
          stream
            .getTracks()
            .forEach((track) => {
              peerConnection.addTrack(
                track,
                stream
              );
            });
        }

        peerConnection.onicecandidate = (
          event
        ) => {
          if (event.candidate) {
            sendMessage({
              type: "ice",
              target: peerId,
              candidate:
                event.candidate,
            });
          }
        };

        peerConnection.ontrack = (
          event
        ) => {
          const incomingStream =
            event.streams[0];

          if (!incomingStream) {
            return;
          }

          setRemoteStreams((previous) => {
            const exists = previous.some(
              (item) =>
                item.peerId === peerId
            );

            if (exists) {
              return previous.map((item) =>
                item.peerId === peerId
                  ? {
                      ...item,
                      stream:
                        incomingStream,
                    }
                  : item
              );
            }

            return [
              ...previous,
              {
                peerId,
                stream:
                  incomingStream,
              },
            ];
          });
        };

        peerConnection.onconnectionstatechange =
          () => {
            if (
              [
                "failed",
                "closed",
                "disconnected",
              ].includes(
                peerConnection.connectionState
              )
            ) {
              peerConnection.close();

              peerConnectionsRef.current.delete(
                peerId
              );

              setRemoteStreams(
                (previous) =>
                  previous.filter(
                    (item) =>
                      item.peerId !==
                      peerId
                  )
              );
            }
          };

        peerConnectionsRef.current.set(
          peerId,
          peerConnection
        );

        return peerConnection;
      },
      [sendMessage]
    );

  const startLocalStream =
    useCallback(async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
            video: true,
          }
        );

      localStreamRef.current = stream;
      setLocalStream(stream);

      return stream;
    }, []);

  const joinMeeting = useCallback(
    async () => {
      if (!meetingId || !token) {
        return;
      }

      const stream =
        localStreamRef.current ||
        (await startLocalStream());

      if (!stream) {
        return;
      }

      const wsUrl =
        `${
          window.location.protocol ===
          "https:"
            ? "wss"
            : "ws"
        }://${window.location.host}`;

      const backendUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8080";

      const socketUrl =
        backendUrl.replace(
          /^http/,
          "ws"
        ) +
        `/api/meetings/${meetingId}/ws`;

      await connect(
        socketUrl,
        token
      );

      sendMessage({
        type: "join",
        userId: user?.id,
      });

      setConnected(true);
    },
    [
      meetingId,
      token,
      user,
      connect,
      sendMessage,
      startLocalStream,
    ]
  );

  const leaveMeeting =
    useCallback(() => {
      sendMessage({
        type: "leave",
        userId: user?.id,
      });

      peerConnectionsRef.current.forEach(
        (connection) =>
          connection.close()
      );

      peerConnectionsRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      localStreamRef.current = null;
      setLocalStream(null);
      setRemoteStreams([]);
      setConnected(false);

      disconnect();
    }, [
      user,
      sendMessage,
      disconnect,
    ]);

  useEffect(() => {
    const unsubscribe =
      subscribeToMessages(
        async (message) => {
          if (
            message.type === "offer"
          ) {
            const peerId =
              message.sender ||
              message.userId;

            if (!peerId) {
              return;
            }

            const connection =
              createPeerConnection(
                peerId
              );

            await connection.setRemoteDescription(
              new RTCSessionDescription(
                message.offer
              )
            );

            const answer =
              await connection.createAnswer();

            await connection.setLocalDescription(
              answer
            );

            sendMessage({
              type: "answer",
              target: peerId,
              answer,
            });
          }

          if (
            message.type === "answer"
          ) {
            const peerId =
              message.sender ||
              message.userId;

            const connection =
              peerConnectionsRef.current.get(
                peerId
              );

            if (!connection) {
              return;
            }

            await connection.setRemoteDescription(
              new RTCSessionDescription(
                message.answer
              )
            );
          }

          if (message.type === "ice") {
            const peerId =
              message.sender ||
              message.userId;

            const connection =
              peerConnectionsRef.current.get(
                peerId
              );

            if (!connection) {
              return;
            }

            await connection.addIceCandidate(
              new RTCIceCandidate(
                message.candidate
              )
            );
          }

          if (
            message.type === "join"
          ) {
            const peerId =
              message.sender ||
              message.userId;

            if (
              !peerId ||
              peerId === user?.id
            ) {
              return;
            }

            const connection =
              createPeerConnection(
                peerId
              );

            const offer =
              await connection.createOffer();

            await connection.setLocalDescription(
              offer
            );

            sendMessage({
              type: "offer",
              target: peerId,
              offer,
            });
          }

          if (
            message.type === "leave"
          ) {
            const peerId =
              message.sender ||
              message.userId;

            if (!peerId) {
              return;
            }

            const connection =
              peerConnectionsRef.current.get(
                peerId
              );

            connection?.close();

            peerConnectionsRef.current.delete(
              peerId
            );

            setRemoteStreams(
              (previous) =>
                previous.filter(
                  (item) =>
                    item.peerId !==
                    peerId
                )
            );
          }
        }
      );

    return unsubscribe;
  }, [
    subscribeToMessages,
    createPeerConnection,
    sendMessage,
    user?.id,
  ]);

  useEffect(() => {
    return () => {
      peerConnectionsRef.current.forEach(
        (connection) =>
          connection.close()
      );

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    connected,
    joinMeeting,
    leaveMeeting,
    startLocalStream,
  };
};

export default UseMeetingWebRTC;