import {
  connectSocket,
  getSocket,
  sendMessage,
  subscribeToMessages,
  disconnectSocket,
} from "../services/websocket/socket";

const useWebSocket = () => {
  const connect = (url, token) => {
    return connectSocket(url, token);
  };

  const disconnect = () => {
    disconnectSocket();
  };

  const getConnection = () => {
    return getSocket();
  };

  return {
    connect,
    disconnect,
    getConnection,
    sendMessage,
    subscribeToMessages,
  };
};

export default useWebSocket;