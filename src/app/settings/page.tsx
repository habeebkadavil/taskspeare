import { SettingsClient } from "./settings-client";
import { companyDetails } from "@/lib/company";

export default function SettingsPage() {
  return <SettingsClient initialDetails={companyDetails} />;
}
