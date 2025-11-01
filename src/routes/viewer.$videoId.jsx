import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { CaptionsViewer } from "../components/CaptionsViewer";

export const Route = createFileRoute("/viewer/$videoId")({
  component: ViewerPage,
});

function ViewerPage() {
  return (
    <ProtectedRoute>
      <CaptionsViewer />
    </ProtectedRoute>
  );
}
