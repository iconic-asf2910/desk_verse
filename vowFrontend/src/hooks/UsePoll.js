import { useContext } from "react";
import { PollContext } from "../contexts/PollContext";

const usePoll = () => {
  return useContext(PollContext);
};

export default usePoll;