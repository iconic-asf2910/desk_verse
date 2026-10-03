let socket = null;
let messageListeners = [];

const connectSocket = (url, token) => {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(`${url}?token=${token}`);

    socket.onopen = () => {
      console.log("WebSocket connected");
      resolve(socket);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        messageListeners.forEach((listener) => {
          listener(message);
        });
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      socket = null;
    };
  });
};

const getSocket = () => {
  return socket;
};

const sendMessage = (message) => {
  if (!socket) {
    console.error("WebSocket is not connected");
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket connection is not open");
    return;
  }

  socket.send(JSON.stringify(message));
};

const subscribeToMessages = (listener) => {
  messageListeners.push(listener);

  return () => {
    messageListeners = messageListeners.filter(
      (item) => item !== listener
    );
  };
};

const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }

  messageListeners = [];
};

export {
  connectSocket,
  getSocket,
  sendMessage,
  subscribeToMessages,
  disconnectSocket,
};