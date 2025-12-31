import { createFileRoute } from "@tanstack/react-router";
import { MyVocabulary } from "../components/MyVocabulary";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/my-vocabulary")({
  component: () => (
    <ProtectedRoute>
      <MyVocabulary />
    </ProtectedRoute>
  ),
});
