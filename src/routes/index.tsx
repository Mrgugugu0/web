import { createFileRoute } from "@tanstack/react-router";
import { SeaStage } from "@/components/sea-stage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SeaStage />;
}
