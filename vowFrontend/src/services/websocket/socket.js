let socket = null;
let messageListeners = [];
let connectionListeners = [];

const connectSocket = (url, token) => {
  return new Promise((resolve, reject) => {
    if (socket?.readyState === WebSocket.OPEN) {
      resolve(socket);
      return;
    }

    if (socket?.readyState === WebSocket.CONNECTING) {
      const checkConnection = () => {
        if (socket?.readyState === WebSocket.OPEN) {
          resolve(socket);
          return;
        }

        if (
          !socket ||
          socket.readyState === WebSocket.CLOSED
        ) {
          reject(new Error("WebSocket connection failed."));
          return;
        }

        setTimeout(checkConnection, 50);
      };

      checkConnection();
      return;
    }

    const separator = url.includes("?") ? "&" : "?";

    const ws = new WebSocket(
      `${url}${separator}token=${encodeURIComponent(token)}`
    );

    socket = ws;

    ws.onopen = () => {
      connectionListeners.forEach((listener) =>
        listener({ type: "connected" })
      );

      resolve(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        messageListeners.forEach((listener) => {
          listener(message);
        });
      } catch {
        messageListeners.forEach((listener) => {
          listener({
            type: "message",
            data: event.data,
          });
        });
      }
    };

    ws.onerror = (error) => {
      connectionListeners.forEach((listener) =>
        listener({
          type: "error",
          error,
        })
      );

      reject(error);
    };

    ws.onclose = () => {
      connectionListeners.forEach((listener) =>
        listener({ type: "disconnected" })
      );

      if (socket === ws) {
        socket = null;
      }
    };
  });
};

const getSocket = () => {
  return socket;
};

const sendMessage = (message) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(message));

  return true;
};

const subscribeToMessages = (listener) => {
  messageListeners.push(listener);

  return () => {
    messageListeners = messageListeners.filter(
      (item) => item !== listener
    );
  };
};

const subscribeToConnection = (listener) => {
  connectionListeners.push(listener);

  return () => {
    connectionListeners = connectionListeners.filter(
      (item) => item !== listener
    );
  };
};

const disconnectSocket = () => {
  if (socket) {
    socket.close();
  }

  socket = null;
  messageListeners = [];
  connectionListeners = [];
};

export {
  connectSocket,
  getSocket,
  sendMessage,
  subscribeToMessages,
  subscribeToConnection,
  disconnectSocket,
};