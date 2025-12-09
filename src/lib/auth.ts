import { users } from "./data";
import { User } from "./types";

export const getCurrentUser = (): User | undefined => {
    // In a real app, you'd get this from the session or a proper auth provider.
    // We'll hardcode a technician user for demonstration of role-based access.
    // Change this to 'user-1' to simulate an admin user.
    return users.find(u => u.id === 'tech-user-1'); 
}
