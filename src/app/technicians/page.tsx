import { TechniciansClient } from "./technicians-client";
import { technicians } from "@/lib/data";

export default function TechniciansPage() {
  return <TechniciansClient initialTechnicians={technicians} />;
}
