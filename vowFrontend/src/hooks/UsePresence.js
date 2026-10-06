import { useContext } from "react";
import { PresenceContext } from "../contexts/PresenceContext";

const usePresence = () => {
  return useContext(PresenceContext);
};

export default usePresence;