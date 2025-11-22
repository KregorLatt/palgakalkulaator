import { useRef, useEffect } from "react";

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("ended", () => {
        video.currentTime = 0;
        video.play();
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/bgVideo.mp4" type="video/mp4" />
    </video>
  );
}
