let socket = null;
let messageListeners = [];
let connectionListeners = [];

const connectSocket = (url, token) => {
  return new Promise((resolve, reject) => {
    if (socket?.readyState === WebSocket.OPEN) {
      resolve(socket);
      return;
    }

    const separator = url.includes("?") ? "&" : "?";

    socket = new WebSocket(
      `${url}${separator}token=${encodeURIComponent(token)}`
    );

    socket.onopen = () => {
      connectionListeners.forEach((listener) =>
        listener({ type: "connected" })
      );

      resolve(socket);
    };

    socket.onmessage = (event) => {
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

    socket.onerror = (error) => {
      connectionListeners.forEach((listener) =>
        listener({
          type: "error",
          error,
        })
      );

      reject(error);
    };

    socket.onclose = () => {
      connectionListeners.forEach((listener) =>
        listener({ type: "disconnected" })
      );

      socket = null;
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