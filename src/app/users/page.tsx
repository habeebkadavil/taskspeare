import { UsersClient } from "./users-client";
import { users, technicians } from "@/lib/data";

export default function UsersPage() {
  return <UsersClient initialUsers={users} technicians={technicians} />;
}
