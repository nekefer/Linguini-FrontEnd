import { createFileRoute } from "@tanstack/react-router";
import VideoPlayer from "../../components/VideoPlayer";

export const Route = createFileRoute("/player/$videoId")({
  component: VideoPlayerPage,
});

function VideoPlayerPage() {
  const { videoId } = Route.useParams();

  return <VideoPlayer videoId={videoId} />;
}
