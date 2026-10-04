const getMeetings = () => {
  return JSON.parse(localStorage.getItem("meetings")) || [];
};

const saveMeetings = (meetings) => {
  localStorage.setItem("meetings", JSON.stringify(meetings));
};

const deleteMeeting = (meetingId) => {
  const meetings = getMeetings();

  const updatedMeetings = meetings.filter(
    (meeting) => String(meeting.id) !== String(meetingId)
  );

  saveMeetings(updatedMeetings);

  return updatedMeetings;
};

export {
  getMeetings,
  saveMeetings,
  deleteMeeting,
};