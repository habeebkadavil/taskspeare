
import { UnitClient } from "./unit-client";
import { units } from "@/lib/data";

export default function UnitsPage() {
  // Add a new unit to the list
  const allUnits = [...units, { id: 'unit-4', name: 'Box', abbreviation: 'box' }];
  return <UnitClient initialUnits={allUnits} />;
}
