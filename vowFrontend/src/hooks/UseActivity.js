import { useContext } from "react";
import { ActivityContext } from "../contexts/ActivityContext";

const useActivity = () => {
  return useContext(ActivityContext);
};

export default useActivity;