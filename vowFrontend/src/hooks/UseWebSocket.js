import {
  connectSocket,
  getSocket,
  sendMessage,
  subscribeToMessages,
  subscribeToConnection,
  disconnectSocket,
} from "../services/websocket/socket";

const useWebSocket = () => {
  return {
    connect: connectSocket,
    disconnect: disconnectSocket,
    getConnection: getSocket,
    sendMessage,
    subscribeToMessages,
    subscribeToConnection,
  };
};

export default useWebSocket;