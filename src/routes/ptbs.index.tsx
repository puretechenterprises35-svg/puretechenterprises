import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/ptbs/")({
  ssr: false,
  component: () => <Navigate to="/ptbs/master-data/dashboard" replace />,
});
