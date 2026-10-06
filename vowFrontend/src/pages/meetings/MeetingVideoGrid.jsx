import VideoTile from "./VideoTile";

const MeetingVideoGrid = ({
  localStream,
  remoteStreams,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {localStream && (
        <VideoTile
          stream={localStream}
          muted
          label="You"
        />
      )}

      {remoteStreams.map((item) => (
        <VideoTile
          key={item.peerId}
          stream={item.stream}
          label={item.peerId}
        />
      ))}
    </div>
  );
};

export default MeetingVideoGrid;