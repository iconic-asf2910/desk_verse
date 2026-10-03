import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

const useTask = () => {
  return useContext(TaskContext);
};

export default useTask;