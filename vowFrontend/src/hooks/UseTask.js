import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

const useTask = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTask must be used inside TaskProvider"
    );
  }

  return context;
};

export default useTask;