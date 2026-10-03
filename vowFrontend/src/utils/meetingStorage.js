const getMeetings = () => {
  return JSON.parse(localStorage.getItem("meetings")) || [];
};

const saveMeetings = (meetings) => {
  localStorage.setItem("meetings", JSON.stringify(meetings));
};

export { getMeetings, saveMeetings };