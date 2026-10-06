import { useEffect, useRef } from "react";

const VideoTile = ({
  stream,
  muted = false,
  label = "Participant",
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !stream) {
      return;
    }

    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="h-full min-h-52 w-full object-cover"
      />
      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white">
        {label}
      </div>
    </div>
  );
};

export default VideoTile;